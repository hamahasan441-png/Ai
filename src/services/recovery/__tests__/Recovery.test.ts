import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  RetryExecutor,
  CircuitBreaker,
  Bulkhead,
  RecoveryPipeline,
  RecoveryManager,
  categorizeError,
  createRetryExecutor,
  createCircuitBreaker,
  createBulkhead,
  createRecoveryPipeline,
  createRecoveryManager,
} from '../index.js'

// ── RetryExecutor ──

describe('RetryExecutor', () => {
  let executor: RetryExecutor

  beforeEach(() => {
    executor = new RetryExecutor()
    vi.useFakeTimers()
  })

  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await executor.execute(fn, { maxAttempts: 3 })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on transient error then succeed', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('transient')).mockResolvedValue('recovered')

    const promise = executor.execute(fn, {
      maxAttempts: 3,
      baseDelay: 100,
      jitter: false,
    })

    await vi.advanceTimersByTimeAsync(200)
    const result = await promise
    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should exhaust retries and throw', async () => {
    vi.useRealTimers()
    const error = new Error('persistent')
    const fn = vi.fn().mockRejectedValue(error)

    await expect(
      executor.execute(fn, { maxAttempts: 3, baseDelay: 1, jitter: false }),
    ).rejects.toThrow('persistent')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should apply exponential backoff timing', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok')

    const promise = executor.execute(fn, {
      maxAttempts: 4,
      backoffType: 'exponential',
      baseDelay: 100,
      jitter: false,
    })

    // attempt 1 fails → delay = 100 * 2^0 = 100
    expect(fn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(100)
    // attempt 2 fires and fails → delay = 100 * 2^1 = 200
    expect(fn).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(200)
    // attempt 3 fires and succeeds
    const result = await promise
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should apply linear backoff timing', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok')

    const promise = executor.execute(fn, {
      maxAttempts: 4,
      backoffType: 'linear',
      baseDelay: 100,
      jitter: false,
    })

    // attempt 1 fails → delay = 100 * 1 = 100
    await vi.advanceTimersByTimeAsync(100)
    // attempt 2 fails → delay = 100 * 2 = 200
    await vi.advanceTimersByTimeAsync(200)
    const result = await promise
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should apply constant backoff timing', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok')

    const promise = executor.execute(fn, {
      maxAttempts: 4,
      backoffType: 'constant',
      baseDelay: 50,
      jitter: false,
    })

    await vi.advanceTimersByTimeAsync(50)
    expect(fn).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(50)
    const result = await promise
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should add jitter randomness to delay', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // jitter factor becomes 0.5

    const fn = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValue('ok')

    const promise = executor.execute(fn, {
      maxAttempts: 3,
      backoffType: 'constant',
      baseDelay: 100,
      jitter: true,
    })

    // With jitter, delay = round(100 * (0.5 + 0 * 0.5)) = 50
    await vi.advanceTimersByTimeAsync(50)
    const result = await promise
    expect(result).toBe('ok')
    vi.restoreAllMocks()
  })

  it('should respect custom retryOn predicate', async () => {
    vi.useRealTimers()
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('retryable'))
      .mockRejectedValueOnce(new Error('permanent'))

    await expect(
      executor.execute(fn, {
        maxAttempts: 5,
        baseDelay: 1,
        jitter: false,
        retryOn: err => (err as Error).message === 'retryable',
      }),
    ).rejects.toThrow('permanent')
    expect(fn).toHaveBeenCalledTimes(2) // stopped at non-retryable
  })

  it('should cap delay at maxDelay', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok')

    const promise = executor.execute(fn, {
      maxAttempts: 5,
      backoffType: 'exponential',
      baseDelay: 1000,
      maxDelay: 500,
      jitter: false,
    })

    // All delays should be capped at 500
    await vi.advanceTimersByTimeAsync(500)
    expect(fn).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(500)
    expect(fn).toHaveBeenCalledTimes(3)
    await vi.advanceTimersByTimeAsync(500)
    const result = await promise
    expect(result).toBe('ok')
  })

  it('should make only one attempt when maxAttempts is 1', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const promise = executor.execute(fn, { maxAttempts: 1 })
    await expect(promise).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should track stats across executions', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValue('ok')

    const promise = executor.execute(fn, {
      maxAttempts: 3,
      baseDelay: 10,
      jitter: false,
    })
    await vi.advanceTimersByTimeAsync(100)
    await promise

    const stats = executor.getStats()
    expect(stats.successes).toBe(1)
    expect(stats.retries).toBe(1)
    expect(stats.totalExecutions).toBe(2)
  })

  it('should reset stats', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    await executor.execute(fn, { maxAttempts: 1 })
    executor.resetStats()

    const stats = executor.getStats()
    expect(stats.successes).toBe(0)
    expect(stats.totalExecutions).toBe(0)
  })
})

// ── CircuitBreaker ──

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker

  beforeEach(() => {
    vi.useRealTimers()
  })

  it('should start in closed state', () => {
    breaker = new CircuitBreaker({ failureThreshold: 3 })
    expect(breaker.getState()).toBe('closed')
  })

  it('should stay closed on success', async () => {
    breaker = new CircuitBreaker({ failureThreshold: 3 })
    await breaker.execute(async () => 'ok')
    expect(breaker.getState()).toBe('closed')
  })

  it('should open after failure threshold', async () => {
    breaker = new CircuitBreaker({ failureThreshold: 2 })

    for (let i = 0; i < 2; i++) {
      await breaker
        .execute(async () => {
          throw new Error('fail')
        })
        .catch(() => {})
    }

    expect(breaker.getState()).toBe('open')
  })

  it('should reject calls when open', async () => {
    breaker = new CircuitBreaker({ failureThreshold: 1, timeout: 60_000 })
    await breaker
      .execute(async () => {
        throw new Error('fail')
      })
      .catch(() => {})

    await expect(breaker.execute(async () => 'ok')).rejects.toThrow('Circuit breaker is open')
  })

  it('should transition to half-open after timeout', async () => {
    breaker = new CircuitBreaker({ failureThreshold: 1, timeout: 50 })
    await breaker
      .execute(async () => {
        throw new Error('fail')
      })
      .catch(() => {})
    expect(breaker.getState()).toBe('open')

    await new Promise(r => setTimeout(r, 60))
    expect(breaker.getState()).toBe('half-open')
  })

  it('should close on success in half-open', async () => {
    breaker = new CircuitBreaker({
      failureThreshold: 1,
      successThreshold: 1,
      timeout: 50,
      halfOpenMax: 2,
    })

    await breaker
      .execute(async () => {
        throw new Error('fail')
      })
      .catch(() => {})
    await new Promise(r => setTimeout(r, 60))

    await breaker.execute(async () => 'ok')
    expect(breaker.getState()).toBe('closed')
  })

  it('should re-open on failure in half-open', async () => {
    breaker = new CircuitBreaker({
      failureThreshold: 1,
      timeout: 50,
      halfOpenMax: 2,
    })

    await breaker
      .execute(async () => {
        throw new Error('fail')
      })
      .catch(() => {})
    await new Promise(r => setTimeout(r, 60))

    // Now half-open; fail again
    await breaker
      .execute(async () => {
        throw new Error('again')
      })
      .catch(() => {})
    expect(breaker.getState()).toBe('open')
  })

  it('should reset to closed state', async () => {
    breaker = new CircuitBreaker({ failureThreshold: 1, timeout: 60_000 })
    await breaker
      .execute(async () => {
        throw new Error('fail')
      })
      .catch(() => {})
    expect(breaker.getState()).toBe('open')

    breaker.reset()
    expect(breaker.getState()).toBe('closed')
  })

  it('should return correct stats via getStats', async () => {
    breaker = new CircuitBreaker({ failureThreshold: 5 })

    await breaker.execute(async () => 'ok')
    await breaker
      .execute(async () => {
        throw new Error('fail')
      })
      .catch(() => {})

    const stats = breaker.getStats()
    expect(stats.successes).toBe(1)
    expect(stats.failures).toBe(1)
    expect(stats.totalExecutions).toBe(2)
  })

  it('should fire onStateChange callback', async () => {
    const changes: Array<{ from: string; to: string }> = []
    breaker = new CircuitBreaker({
      failureThreshold: 1,
      timeout: 50,
      onStateChange: (from, to) => changes.push({ from, to }),
    })

    await breaker
      .execute(async () => {
        throw new Error('fail')
      })
      .catch(() => {})
    expect(changes).toContainEqual({ from: 'closed', to: 'open' })
  })

  it('should limit trial requests in half-open state', async () => {
    breaker = new CircuitBreaker({
      failureThreshold: 1,
      timeout: 50,
      halfOpenMax: 1,
    })

    await breaker
      .execute(async () => {
        throw new Error('fail')
      })
      .catch(() => {})
    await new Promise(r => setTimeout(r, 60))

    // First half-open call: allowed but slow
    const slowPromise = breaker.execute(async () => {
      await new Promise(r => setTimeout(r, 100))
      return 'ok'
    })

    // Second half-open call: should be rejected because halfOpenMax=1
    await expect(breaker.execute(async () => 'ok2')).rejects.toThrow('half-open limit reached')
    await slowPromise
  })

  it('should reset stats', async () => {
    breaker = new CircuitBreaker({ failureThreshold: 3 })
    await breaker.execute(async () => 'ok')
    breaker.resetStats()

    const stats = breaker.getStats()
    expect(stats.successes).toBe(0)
    expect(stats.totalExecutions).toBe(0)
  })

  it('should track circuitBreaks in stats when rejecting calls', async () => {
    breaker = new CircuitBreaker({ failureThreshold: 1, timeout: 60_000 })
    await breaker
      .execute(async () => {
        throw new Error('fail')
      })
      .catch(() => {})

    await breaker.execute(async () => 'ok').catch(() => {})
    await breaker.execute(async () => 'ok').catch(() => {})

    const stats = breaker.getStats()
    expect(stats.circuitBreaks).toBe(2)
  })
})

// ── Bulkhead ──

describe('Bulkhead', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('should allow concurrent execution up to the limit', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 2 })
    let running = 0
    let maxRunning = 0

    const task = async () => {
      running++
      maxRunning = Math.max(maxRunning, running)
      await new Promise(r => setTimeout(r, 50))
      running--
      return 'done'
    }

    const results = await Promise.all([bulkhead.execute(task), bulkhead.execute(task)])
    expect(results).toEqual(['done', 'done'])
    expect(maxRunning).toBeLessThanOrEqual(2)
  })

  it('should queue overflow requests', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 1, maxQueue: 5 })
    const order: number[] = []

    const makeTask = (id: number) => async () => {
      await new Promise(r => setTimeout(r, 30))
      order.push(id)
      return id
    }

    const results = await Promise.all([
      bulkhead.execute(makeTask(1)),
      bulkhead.execute(makeTask(2)),
      bulkhead.execute(makeTask(3)),
    ])

    expect(results).toEqual([1, 2, 3])
    expect(order).toEqual([1, 2, 3])
  })

  it('should reject when queue is full', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 1, maxQueue: 1 })

    const blocker = bulkhead.execute(() => new Promise(r => setTimeout(() => r('ok'), 200)))
    // fills the queue
    const queued = bulkhead.execute(() => new Promise(r => setTimeout(() => r('ok2'), 50)))
    // overflows
    await expect(bulkhead.execute(async () => 'overflow')).rejects.toThrow('Bulkhead queue full')

    await Promise.all([blocker, queued])
  })

  it('should release slot after completion', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 1 })

    await bulkhead.execute(async () => 'first')
    expect(bulkhead.getActiveCount()).toBe(0)

    const result = await bulkhead.execute(async () => 'second')
    expect(result).toBe('second')
  })

  it('should reject queued tasks on timeout', async () => {
    const bulkhead = new Bulkhead({
      maxConcurrent: 1,
      maxQueue: 5,
      queueTimeout: 50,
    })

    // Block the single slot for a while
    const blocker = bulkhead.execute(() => new Promise(r => setTimeout(() => r('ok'), 200)))

    // This one will wait in the queue and time out
    const queuedPromise = bulkhead.execute(async () => 'queued')
    await expect(queuedPromise).rejects.toThrow('Bulkhead queue timeout')

    await blocker
  })

  it('should report correct stats via getStats', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 2 })

    await bulkhead.execute(async () => 'a')
    await bulkhead.execute(async () => 'b')

    const stats = bulkhead.getStats()
    expect(stats.successes).toBe(2)
    expect(stats.totalExecutions).toBe(2)
  })

  it('should report active count and queue size', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 1, maxQueue: 5 })

    let resolveBlocker!: () => void
    const blocker = bulkhead.execute(
      () =>
        new Promise<string>(r => {
          resolveBlocker = () => r('ok')
        }),
    )

    expect(bulkhead.getActiveCount()).toBe(1)

    const queued = bulkhead.execute(async () => 'queued')
    expect(bulkhead.getQueueSize()).toBe(1)

    resolveBlocker()
    await blocker
    await queued
    expect(bulkhead.getActiveCount()).toBe(0)
    expect(bulkhead.getQueueSize()).toBe(0)
  })

  it('should track failures in stats', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 2 })

    await bulkhead
      .execute(async () => {
        throw new Error('oops')
      })
      .catch(() => {})

    const stats = bulkhead.getStats()
    expect(stats.failures).toBe(1)
  })

  it('should reset stats', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 2 })
    await bulkhead.execute(async () => 'ok')
    bulkhead.resetStats()

    const stats = bulkhead.getStats()
    expect(stats.successes).toBe(0)
    expect(stats.totalExecutions).toBe(0)
  })
})

// ── RecoveryPipeline ──

describe('RecoveryPipeline', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('should execute function directly with empty config', async () => {
    const pipeline = new RecoveryPipeline({})
    const result = await pipeline.execute(async () => 42)
    expect(result).toBe(42)
  })

  it('should apply timeout and reject slow executions', async () => {
    const onTimeout = vi.fn()
    const pipeline = new RecoveryPipeline({
      timeout: { duration: 50, onTimeout },
    })

    await expect(
      pipeline.execute(() => new Promise(r => setTimeout(() => r('late'), 200))),
    ).rejects.toThrow('Recovery timeout after 50ms')
    expect(onTimeout).toHaveBeenCalled()
  })

  it('should compose retry + circuit breaker', async () => {
    const pipeline = new RecoveryPipeline({
      retry: { maxAttempts: 2, baseDelay: 10, jitter: false },
      circuitBreaker: { failureThreshold: 5 },
    })

    const fn = vi.fn().mockRejectedValueOnce(new Error('temporary')).mockResolvedValue('ok')

    const result = await pipeline.execute(fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should use fallback when execution fails', async () => {
    const pipeline = new RecoveryPipeline({
      fallback: { fallbackFn: () => 'fallback-value' },
    })

    const result = await pipeline.execute(async () => {
      throw new Error('fail')
    })
    expect(result).toBe('fallback-value')
  })

  it('should return cached result on repeated calls', async () => {
    const pipeline = new RecoveryPipeline({
      cache: { ttl: 5000 },
    })

    const fn = vi.fn().mockResolvedValue('cached-data')
    await pipeline.execute(fn)
    const result = await pipeline.execute(fn)

    expect(result).toBe('cached-data')
    expect(fn).toHaveBeenCalledTimes(1) // second call served from cache
    expect(pipeline.getStats().cacheHits).toBe(1)
  })

  it('should aggregate stats from inner components', async () => {
    const pipeline = new RecoveryPipeline({
      retry: { maxAttempts: 3, baseDelay: 10, jitter: false },
      circuitBreaker: { failureThreshold: 10 },
    })

    const fn = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValue('ok')

    await pipeline.execute(fn)
    const stats = pipeline.getStats()
    expect(stats.retries).toBeGreaterThanOrEqual(1)
    expect(stats.successes).toBeGreaterThanOrEqual(1)
  })

  it('should reset all stats including sub-components', async () => {
    const pipeline = new RecoveryPipeline({
      retry: { maxAttempts: 2, baseDelay: 10, jitter: false },
      circuitBreaker: { failureThreshold: 10 },
    })

    await pipeline.execute(async () => 'ok')
    pipeline.resetStats()

    const stats = pipeline.getStats()
    expect(stats.successes).toBe(0)
    expect(stats.totalExecutions).toBe(0)
  })

  it('should expose the circuit breaker instance', () => {
    const pipeline = new RecoveryPipeline({
      circuitBreaker: { failureThreshold: 3 },
    })
    expect(pipeline.getCircuitBreaker()).toBeInstanceOf(CircuitBreaker)

    const empty = new RecoveryPipeline({})
    expect(empty.getCircuitBreaker()).toBeNull()
  })
})

// ── RecoveryManager ──

describe('RecoveryManager', () => {
  let manager: RecoveryManager

  beforeEach(() => {
    manager = new RecoveryManager()
    vi.useRealTimers()
  })

  it('should create a named pipeline', () => {
    const pipeline = manager.createPipeline('api', {})
    expect(pipeline).toBeInstanceOf(RecoveryPipeline)
    expect(manager.getPipelineNames()).toContain('api')
  })

  it('should execute through a named pipeline', async () => {
    manager.createPipeline('db', {})
    const result = await manager.execute('db', async () => 'data')
    expect(result).toBe('data')
  })

  it('should throw when executing unknown pipeline', async () => {
    await expect(manager.execute('missing', async () => 'x')).rejects.toThrow(
      'Recovery pipeline "missing" not found',
    )
  })

  it('should get pipeline by name', () => {
    manager.createPipeline('cache', {})
    expect(manager.getPipeline('cache')).toBeInstanceOf(RecoveryPipeline)
    expect(manager.getPipeline('nonexistent')).toBeUndefined()
  })

  it('should return aggregate stats per pipeline', async () => {
    manager.createPipeline('a', {})
    manager.createPipeline('b', {})

    await manager.execute('a', async () => 'ok')
    await manager.execute('b', async () => 'ok')

    const stats = manager.getStats()
    expect(stats['a']).toBeDefined()
    expect(stats['a'].successes).toBe(1)
    expect(stats['b']).toBeDefined()
    expect(stats['b'].successes).toBe(1)
  })

  it('should fire events on success', async () => {
    manager.createPipeline('svc', {})
    const events: unknown[] = []
    manager.onEvent(e => events.push(e))

    await manager.execute('svc', async () => 'ok')
    expect(events.length).toBe(1)
    expect((events[0] as { type: string }).type).toBe('success')
  })

  it('should fire events on failure', async () => {
    manager.createPipeline('svc', {})
    const events: unknown[] = []
    manager.onEvent(e => events.push(e))

    await manager
      .execute('svc', async () => {
        throw new Error('boom')
      })
      .catch(() => {})
    expect(events.length).toBe(1)
    expect((events[0] as { type: string }).type).toBe('failure')
  })

  it('should include error category in failure events', async () => {
    manager.createPipeline('svc', {})
    const events: Array<{ metadata?: Record<string, unknown> }> = []
    manager.onEvent(e => events.push(e))

    await manager
      .execute('svc', async () => {
        throw new Error('connection timeout')
      })
      .catch(() => {})

    expect(events[0].metadata?.category).toBe('transient')
  })

  it('should reset stats for all pipelines', async () => {
    manager.createPipeline('x', {})
    await manager.execute('x', async () => 'ok')

    manager.resetStats()
    const stats = manager.getStats()
    expect(stats['x'].successes).toBe(0)
  })

  it('should remove a pipeline', () => {
    manager.createPipeline('temp', {})
    expect(manager.removePipeline('temp')).toBe(true)
    expect(manager.getPipeline('temp')).toBeUndefined()
    expect(manager.removePipeline('temp')).toBe(false)
  })

  it('should clear all pipelines and handlers', async () => {
    manager.createPipeline('a', {})
    manager.onEvent(() => {})
    manager.clear()

    expect(manager.getPipelineNames().length).toBe(0)
  })

  it('should swallow handler errors without breaking execution', async () => {
    manager.createPipeline('svc', {})
    manager.onEvent(() => {
      throw new Error('handler boom')
    })

    // Should not throw
    const result = await manager.execute('svc', async () => 'safe')
    expect(result).toBe('safe')
  })
})

// ── categorizeError ──

describe('categorizeError', () => {
  it('should categorize timeout errors as transient', () => {
    expect(categorizeError(new Error('Request timeout'))).toBe('transient')
  })

  it('should categorize network errors as transient', () => {
    expect(categorizeError(new Error('ECONNRESET'))).toBe('transient')
    expect(categorizeError(new Error('ECONNREFUSED'))).toBe('transient')
    expect(categorizeError(new Error('network error'))).toBe('transient')
  })

  it('should categorize rate limit errors as transient', () => {
    expect(categorizeError(new Error('429 Too Many Requests'))).toBe('transient')
    expect(categorizeError(new Error('rate limit exceeded'))).toBe('transient')
  })

  it('should categorize auth errors as permanent', () => {
    expect(categorizeError(new Error('401 Unauthorized'))).toBe('permanent')
    expect(categorizeError(new Error('403 Forbidden'))).toBe('permanent')
  })

  it('should categorize not found as permanent', () => {
    expect(categorizeError(new Error('404 Not Found'))).toBe('permanent')
  })

  it('should return unknown for non-Error values', () => {
    expect(categorizeError('just a string')).toBe('unknown')
    expect(categorizeError(42)).toBe('unknown')
    expect(categorizeError(null)).toBe('unknown')
  })

  it('should return unknown for unrecognized error messages', () => {
    expect(categorizeError(new Error('something weird'))).toBe('unknown')
  })
})

// ── Factory helpers ──

describe('Factory helpers', () => {
  it('should create a RetryExecutor', () => {
    expect(createRetryExecutor()).toBeInstanceOf(RetryExecutor)
  })

  it('should create a CircuitBreaker', () => {
    expect(createCircuitBreaker({ failureThreshold: 3 })).toBeInstanceOf(CircuitBreaker)
  })

  it('should create a Bulkhead', () => {
    expect(createBulkhead({ maxConcurrent: 5 })).toBeInstanceOf(Bulkhead)
  })

  it('should create a RecoveryPipeline', () => {
    expect(createRecoveryPipeline({})).toBeInstanceOf(RecoveryPipeline)
  })

  it('should create a RecoveryManager', () => {
    expect(createRecoveryManager()).toBeInstanceOf(RecoveryManager)
  })
})
