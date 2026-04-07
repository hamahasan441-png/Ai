import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RetryPolicy, CircuitBreaker, withResilience } from '../../services/apiRetry.js'

describe('RetryPolicy', () => {
  describe('successful execution', () => {
    it('returns result on first attempt', async () => {
      const retry = new RetryPolicy({ maxRetries: 3 })
      const result = await retry.execute(async () => 'success')
      expect(result.data).toBe('success')
      expect(result.attempts).toBe(1)
    })

    it('tracks total time', async () => {
      const retry = new RetryPolicy({ maxRetries: 0 })
      const result = await retry.execute(async () => 42)
      expect(result.totalTimeMs).toBeGreaterThanOrEqual(0)
    })
  })

  describe('retry logic', () => {
    it('retries on retryable errors', async () => {
      let attempts = 0
      const retry = new RetryPolicy({
        maxRetries: 3,
        baseDelayMs: 1,
        isRetryable: () => true,
      })

      const result = await retry.execute(async () => {
        attempts++
        if (attempts < 3) throw new Error('fail')
        return 'success'
      })

      expect(result.data).toBe('success')
      expect(result.attempts).toBe(3)
    })

    it('throws after exhausting retries', async () => {
      const retry = new RetryPolicy({
        maxRetries: 2,
        baseDelayMs: 1,
        isRetryable: () => true,
      })

      await expect(
        retry.execute(async () => {
          throw new Error('persistent failure')
        }),
      ).rejects.toThrow('persistent failure')
    })

    it('does not retry non-retryable errors', async () => {
      let attempts = 0
      const retry = new RetryPolicy({
        maxRetries: 3,
        baseDelayMs: 1,
        isRetryable: () => false,
      })

      await expect(
        retry.execute(async () => {
          attempts++
          throw new Error('non-retryable')
        }),
      ).rejects.toThrow('non-retryable')

      expect(attempts).toBe(1)
    })

    it('retries on configured HTTP status codes', async () => {
      let attempts = 0
      const retry = new RetryPolicy({
        maxRetries: 2,
        baseDelayMs: 1,
        retryableStatuses: [429, 500],
      })

      const result = await retry.execute(async () => {
        attempts++
        if (attempts === 1) throw { status: 429, message: 'rate limited' }
        return 'ok'
      })

      expect(result.data).toBe('ok')
      expect(result.attempts).toBe(2)
    })

    it('retries on network errors', async () => {
      let attempts = 0
      const retry = new RetryPolicy({
        maxRetries: 2,
        baseDelayMs: 1,
      })

      const networkError = new Error('connection reset')
      ;(networkError as Error & { code: string }).code = 'ECONNRESET'

      const result = await retry.execute(async () => {
        attempts++
        if (attempts === 1) throw networkError
        return 'recovered'
      })

      expect(result.data).toBe('recovered')
    })
  })

  describe('onRetry callback', () => {
    it('calls onRetry for each retry', async () => {
      const onRetry = vi.fn()
      const retry = new RetryPolicy({
        maxRetries: 3,
        baseDelayMs: 1,
        isRetryable: () => true,
        onRetry,
      })

      let attempts = 0
      await retry.execute(async () => {
        attempts++
        if (attempts < 3) throw new Error('fail')
        return 'ok'
      })

      expect(onRetry).toHaveBeenCalledTimes(2)
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), expect.any(Number))
    })
  })

  describe('backoff calculation', () => {
    it('calculates exponential delay', () => {
      const retry = new RetryPolicy({
        baseDelayMs: 100,
        backoffMultiplier: 2,
        maxDelayMs: 10000,
        jitter: false,
        maxRetries: 3,
      })

      expect(retry._calculateDelay(0)).toBe(100)
      expect(retry._calculateDelay(1)).toBe(200)
      expect(retry._calculateDelay(2)).toBe(400)
    })

    it('clamps delay to maxDelayMs', () => {
      const retry = new RetryPolicy({
        baseDelayMs: 1000,
        backoffMultiplier: 10,
        maxDelayMs: 5000,
        jitter: false,
        maxRetries: 3,
      })

      expect(retry._calculateDelay(3)).toBe(5000)
    })

    it('applies jitter when enabled', () => {
      const retry = new RetryPolicy({
        baseDelayMs: 1000,
        backoffMultiplier: 2,
        maxDelayMs: 10000,
        jitter: true,
        maxRetries: 3,
      })

      const delay = retry._calculateDelay(0)
      expect(delay).toBeGreaterThanOrEqual(0)
      expect(delay).toBeLessThanOrEqual(1000)
    })
  })

  describe('abort signal', () => {
    it('aborts retry when signal is triggered', async () => {
      const controller = new AbortController()
      const retry = new RetryPolicy({
        maxRetries: 10,
        baseDelayMs: 10,
        isRetryable: () => true,
        abortSignal: controller.signal,
      })

      let attempts = 0
      const promise = retry.execute(async () => {
        attempts++
        if (attempts === 1) {
          controller.abort()
        }
        throw new Error('fail')
      })

      await expect(promise).rejects.toThrow()
      expect(attempts).toBeLessThanOrEqual(3)
    })
  })
})

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeoutMs: 100,
      successThreshold: 2,
    })
  })

  describe('closed state', () => {
    it('starts in closed state', () => {
      expect(breaker.state).toBe('closed')
    })

    it('allows requests through', async () => {
      const result = await breaker.execute(async () => 'ok')
      expect(result).toBe('ok')
    })

    it('opens after failure threshold', async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error('fail')
          })
        } catch {
          // Expected
        }
      }
      expect(breaker.state).toBe('open')
    })
  })

  describe('open state', () => {
    it('rejects requests immediately when open', async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error('fail')
          })
        } catch {
          // Expected
        }
      }

      await expect(breaker.execute(async () => 'ok')).rejects.toThrow('Circuit breaker is open')
    })

    it('transitions to half-open after reset timeout', async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error('fail')
          })
        } catch {
          // Expected
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 150))

      const result = await breaker.execute(async () => 'recovered')
      expect(result).toBe('recovered')
    })
  })

  describe('half-open state', () => {
    it('closes after success threshold met', async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error('fail')
          })
        } catch {
          // Expected
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 150))

      await breaker.execute(async () => 'ok')
      await breaker.execute(async () => 'ok')

      expect(breaker.state).toBe('closed')
    })

    it('reopens on failure in half-open', async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error('fail')
          })
        } catch {
          // Expected
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 150))

      try {
        await breaker.execute(async () => {
          throw new Error('still failing')
        })
      } catch {
        // Expected
      }

      expect(breaker.state).toBe('open')
    })
  })

  describe('stats', () => {
    it('tracks total requests and outcomes', async () => {
      await breaker.execute(async () => 'ok')
      try {
        await breaker.execute(async () => {
          throw new Error('fail')
        })
      } catch {
        // Expected
      }

      const stats = breaker.getStats()
      expect(stats.totalRequests).toBe(2)
      expect(stats.totalSuccesses).toBe(1)
      expect(stats.totalFailures).toBe(1)
    })
  })

  describe('reset', () => {
    it('resets to closed state', async () => {
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error('fail')
          })
        } catch {
          // Expected
        }
      }

      breaker.reset()
      expect(breaker.state).toBe('closed')

      const result = await breaker.execute(async () => 'ok')
      expect(result).toBe('ok')
    })
  })

  describe('state change callback', () => {
    it('calls onStateChange when circuit transitions', async () => {
      const onStateChange = vi.fn()
      const cb = new CircuitBreaker({
        failureThreshold: 2,
        resetTimeoutMs: 100,
        onStateChange,
      })

      try {
        await cb.execute(async () => {
          throw new Error('fail')
        })
      } catch {
        // Expected
      }
      try {
        await cb.execute(async () => {
          throw new Error('fail')
        })
      } catch {
        // Expected
      }

      expect(onStateChange).toHaveBeenCalledWith('closed', 'open')
    })
  })
})

describe('withResilience', () => {
  it('executes with retry and returns result', async () => {
    const result = await withResilience(async () => 'hello', { maxRetries: 1 })
    expect(result.data).toBe('hello')
    expect(result.attempts).toBe(1)
  })
})
