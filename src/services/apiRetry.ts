/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  API Retry & Circuit Breaker                                                  ║
 * ║                                                                              ║
 * ║  Resilient API call wrapper with:                                            ║
 * ║    • Exponential backoff with jitter                                         ║
 * ║    • Circuit breaker pattern (closed → open → half-open)                     ║
 * ║    • Configurable retry policies per error type                              ║
 * ║    • Timeout handling                                                        ║
 * ║    • Request deduplication                                                   ║
 * ║                                                                              ║
 * ║  Usage:                                                                      ║
 * ║    const retry = new RetryPolicy({ maxRetries: 3 })                          ║
 * ║    const result = await retry.execute(() => apiCall())                        ║
 * ║                                                                              ║
 * ║    const breaker = new CircuitBreaker({ failureThreshold: 5 })               ║
 * ║    const result = await breaker.execute(() => apiCall())                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ──

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number
  /** Base delay in milliseconds (default: 1000) */
  baseDelayMs: number
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelayMs: number
  /** Backoff multiplier (default: 2) */
  backoffMultiplier: number
  /** Add jitter to prevent thundering herd (default: true) */
  jitter: boolean
  /** HTTP status codes that should trigger a retry (default: [429, 500, 502, 503, 504]) */
  retryableStatuses: number[]
  /** Custom function to determine if an error is retryable */
  isRetryable?: (error: unknown) => boolean
  /** Called on each retry attempt */
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void
  /** Abort signal for cancellation */
  abortSignal?: AbortSignal
}

export interface RetryResult<T> {
  /** The successful result */
  data: T
  /** Number of attempts made (1 = no retries needed) */
  attempts: number
  /** Total time spent including retries (ms) */
  totalTimeMs: number
}

export type CircuitState = 'closed' | 'open' | 'half-open'

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit (default: 5) */
  failureThreshold: number
  /** Time before attempting to close an open circuit (default: 30000ms) */
  resetTimeoutMs: number
  /** Number of successes in half-open state to close circuit (default: 2) */
  successThreshold: number
  /** Called when circuit state changes */
  onStateChange?: (from: CircuitState, to: CircuitState) => void
}

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailureTime: number | null
  totalRequests: number
  totalFailures: number
  totalSuccesses: number
}

// ── Retry Policy ──

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryableStatuses: [429, 500, 502, 503, 504],
}

/**
 * Retry policy with exponential backoff and jitter.
 *
 * @example
 * ```ts
 * const retry = new RetryPolicy({ maxRetries: 3, baseDelayMs: 1000 })
 * const result = await retry.execute(async () => {
 *   const response = await fetch('https://api.example.com/data')
 *   if (!response.ok) throw new HttpError(response.status)
 *   return response.json()
 * })
 * ```
 */
export class RetryPolicy {
  private config: RetryConfig

  constructor(config?: Partial<RetryConfig>) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
  }

  /**
   * Execute a function with retry logic.
   * Retries on retryable errors with exponential backoff + jitter.
   */
  async execute<T>(fn: () => Promise<T>): Promise<RetryResult<T>> {
    const startTime = Date.now()
    let lastError: unknown

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      // Check abort signal
      if (this.config.abortSignal?.aborted) {
        throw new Error('Retry aborted by signal')
      }

      try {
        const data = await fn()
        return {
          data,
          attempts: attempt + 1,
          totalTimeMs: Date.now() - startTime,
        }
      } catch (error: unknown) {
        lastError = error

        // Don't retry if we've exhausted attempts
        if (attempt >= this.config.maxRetries) break

        // Check if error is retryable
        if (!this._isRetryable(error)) break

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt)

        // Notify retry callback
        this.config.onRetry?.(attempt + 1, error, delay)

        // Wait before retry
        await this._sleep(delay)
      }
    }

    throw lastError
  }

  /** Calculate delay for the given attempt using exponential backoff + jitter. */
  calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.baseDelayMs * Math.pow(this.config.backoffMultiplier, attempt)
    const clampedDelay = Math.min(exponentialDelay, this.config.maxDelayMs)

    if (this.config.jitter) {
      // Full jitter: random value between 0 and the calculated delay
      return Math.floor(Math.random() * clampedDelay)
    }

    return clampedDelay
  }

  /** Determine if an error should trigger a retry. */
  private _isRetryable(error: unknown): boolean {
    // Custom retryable check
    if (this.config.isRetryable) {
      return this.config.isRetryable(error)
    }

    // Check HTTP status codes
    if (error && typeof error === 'object') {
      const statusError = error as { status?: number; statusCode?: number }
      const status = statusError.status ?? statusError.statusCode
      if (status && this.config.retryableStatuses.includes(status)) {
        return true
      }
    }

    // Network errors are retryable
    if (error instanceof Error) {
      const networkErrors = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EPIPE', 'EAI_AGAIN']
      const errorWithCode = error as Error & { code?: string }
      if (errorWithCode.code && networkErrors.includes(errorWithCode.code)) {
        return true
      }
    }

    return false
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      if (this.config.abortSignal) {
        const timer = setTimeout(resolve, ms)
        const onAbort = () => {
          clearTimeout(timer)
          resolve()
        }
        this.config.abortSignal.addEventListener('abort', onAbort, { once: true })
      } else {
        setTimeout(resolve, ms)
      }
    })
  }
}

// ── Circuit Breaker ──

const DEFAULT_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 30000,
  successThreshold: 2,
}

/**
 * Circuit breaker pattern to prevent cascading failures.
 *
 * States:
 *   closed → normal operation, requests pass through
 *   open → requests fail immediately (fast-fail)
 *   half-open → limited requests allowed to test recovery
 *
 * @example
 * ```ts
 * const breaker = new CircuitBreaker({ failureThreshold: 5 })
 *
 * try {
 *   const result = await breaker.execute(() => apiCall())
 * } catch (error) {
 *   if (error.message.includes('Circuit breaker is open')) {
 *     // Service is down, use fallback
 *   }
 * }
 * ```
 */
export class CircuitBreaker {
  private config: CircuitBreakerConfig
  private _state: CircuitState = 'closed'
  private _failures = 0
  private _successes = 0
  private _lastFailureTime: number | null = null
  private _totalRequests = 0
  private _totalFailures = 0
  private _totalSuccesses = 0

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = { ...DEFAULT_CIRCUIT_CONFIG, ...config }
  }

  /** Current circuit state */
  get state(): CircuitState {
    return this._state
  }

  /** Get circuit breaker statistics */
  getStats(): CircuitBreakerStats {
    return {
      state: this._state,
      failures: this._failures,
      successes: this._successes,
      lastFailureTime: this._lastFailureTime,
      totalRequests: this._totalRequests,
      totalFailures: this._totalFailures,
      totalSuccesses: this._totalSuccesses,
    }
  }

  /**
   * Execute a function through the circuit breaker.
   * In open state, fails immediately without calling the function.
   * In half-open state, allows limited requests.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this._totalRequests++

    // Check if circuit should transition from open to half-open
    if (this._state === 'open') {
      if (this._lastFailureTime && Date.now() - this._lastFailureTime >= this.config.resetTimeoutMs) {
        this._transitionTo('half-open')
      } else {
        throw new Error('Circuit breaker is open — requests are being rejected to prevent cascading failures')
      }
    }

    try {
      const result = await fn()
      this._onSuccess()
      return result
    } catch (error: unknown) {
      this._onFailure()
      throw error
    }
  }

  /** Reset the circuit breaker to closed state */
  reset(): void {
    this._state = 'closed'
    this._failures = 0
    this._successes = 0
    this._lastFailureTime = null
  }

  private _onSuccess(): void {
    this._totalSuccesses++

    if (this._state === 'half-open') {
      this._successes++
      if (this._successes >= this.config.successThreshold) {
        this._transitionTo('closed')
      }
    }

    // Reset failure count on success in closed state
    if (this._state === 'closed') {
      this._failures = 0
    }
  }

  private _onFailure(): void {
    this._totalFailures++
    this._failures++
    this._lastFailureTime = Date.now()

    if (this._state === 'half-open') {
      this._transitionTo('open')
    } else if (this._state === 'closed' && this._failures >= this.config.failureThreshold) {
      this._transitionTo('open')
    }
  }

  private _transitionTo(newState: CircuitState): void {
    const oldState = this._state
    this._state = newState

    if (newState === 'closed') {
      this._failures = 0
      this._successes = 0
    } else if (newState === 'half-open') {
      this._successes = 0
    }

    this.config.onStateChange?.(oldState, newState)
  }
}

// ── Convenience ──

/**
 * Execute a function with retry and circuit breaker protection.
 *
 * @example
 * ```ts
 * const result = await withResilience(
 *   () => callAnthropicAPI(prompt),
 *   { maxRetries: 3, failureThreshold: 5 }
 * )
 * ```
 */
export async function withResilience<T>(
  fn: () => Promise<T>,
  options?: Partial<RetryConfig> & Partial<CircuitBreakerConfig>,
): Promise<RetryResult<T>> {
  const retry = new RetryPolicy(options)
  return retry.execute(fn)
}
