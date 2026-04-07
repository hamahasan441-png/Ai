/**
 * 🛡️ Recovery — Error recovery and resilience patterns for fault-tolerant execution
 *
 * Features:
 * - Retry with exponential/linear/constant backoff and jitter
 * - Circuit breaker with automatic state transitions (closed → open → half-open)
 * - Bulkhead isolation (concurrency + queue limits)
 * - Timeout wrapping with configurable callbacks
 * - Fallback with conditional predicates
 * - Simple TTL cache for repeated calls
 * - Recovery pipeline to compose strategies in order
 * - Central RecoveryManager for named pipelines and event subscriptions
 * - Global error categorization (transient, permanent, unknown)
 * - Per-pipeline and aggregate statistics
 *
 * Zero external dependencies.
 */

// ── Types ──

export type RecoveryStrategy =
  | 'retry'
  | 'fallback'
  | 'circuit-breaker'
  | 'bulkhead'
  | 'timeout'
  | 'cache'

export type BackoffType = 'exponential' | 'linear' | 'constant'

export type CircuitBreakerState = 'closed' | 'open' | 'half-open'

export type ErrorCategory = 'transient' | 'permanent' | 'unknown'

export interface RetryPolicy {
  /** Maximum number of attempts (including the first call) */
  maxAttempts: number
  /** Backoff strategy (default: exponential) */
  backoffType?: BackoffType
  /** Base delay in ms between retries (default: 200) */
  baseDelay?: number
  /** Maximum delay in ms (default: 30000) */
  maxDelay?: number
  /** Whether to add random jitter (default: true) */
  jitter?: boolean
  /** Predicate — return true if the error is retryable */
  retryOn?: (error: unknown) => boolean
}

export interface CircuitBreakerConfig {
  /** Failures needed to trip from closed → open (default: 5) */
  failureThreshold: number
  /** Successes needed to recover from half-open → closed (default: 2) */
  successThreshold?: number
  /** Time in ms the circuit stays open before moving to half-open (default: 30000) */
  timeout?: number
  /** Max trial requests allowed in half-open state (default: 1) */
  halfOpenMax?: number
  /** Called whenever the state changes */
  onStateChange?: (from: CircuitBreakerState, to: CircuitBreakerState) => void
}

export interface BulkheadConfig {
  /** Maximum concurrent executions (default: 10) */
  maxConcurrent: number
  /** Maximum queued executions (default: 50) */
  maxQueue?: number
  /** How long a queued item waits before being rejected in ms (default: 5000) */
  queueTimeout?: number
}

export interface FallbackConfig<T = unknown> {
  /** Function that provides the fallback value */
  fallbackFn: (error: unknown) => T | Promise<T>
  /** Optional predicate — fallback only when this returns true */
  condition?: (error: unknown) => boolean
}

export interface TimeoutConfig {
  /** Timeout duration in ms */
  duration: number
  /** Called when a timeout occurs */
  onTimeout?: () => void
}

export interface CacheConfig {
  /** Time-to-live in ms (default: 60000) */
  ttl?: number
  /** Maximum cached entries (default: 256) */
  maxSize?: number
  /** Derive a cache key from the function; defaults to a constant key */
  keyFn?: () => string
}

export interface RecoveryPipelineConfig {
  /** Ordered list of strategies and their configs applied outside-in */
  timeout?: TimeoutConfig
  retry?: RetryPolicy
  circuitBreaker?: CircuitBreakerConfig
  fallback?: FallbackConfig
  cache?: CacheConfig
  bulkhead?: BulkheadConfig
}

export interface RecoveryStats {
  retries: number
  failures: number
  circuitBreaks: number
  fallbacks: number
  timeouts: number
  cacheHits: number
  successes: number
  totalExecutions: number
}

export interface RecoveryEvent {
  type:
    | 'retry'
    | 'failure'
    | 'circuit-break'
    | 'fallback'
    | 'timeout'
    | 'cache-hit'
    | 'success'
    | 'state-change'
  timestamp: number
  strategy: RecoveryStrategy | 'pipeline'
  error?: unknown
  duration?: number
  metadata?: Record<string, unknown>
}

// ── Helpers ──

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Categorise an error as transient, permanent, or unknown */
export function categorizeError(error: unknown): ErrorCategory {
  if (!(error instanceof Error)) return 'unknown'
  const msg = error.message.toLowerCase()
  const transientPatterns = [
    'timeout',
    'econnreset',
    'econnrefused',
    'socket hang up',
    'network',
    'etimedout',
    'enotfound',
    'rate limit',
    '429',
    '503',
    '502',
    'unavailable',
    'too many requests',
  ]
  if (transientPatterns.some((p) => msg.includes(p))) return 'transient'
  const permanentPatterns = ['401', '403', '404', 'not found', 'unauthorized', 'forbidden', 'invalid']
  if (permanentPatterns.some((p) => msg.includes(p))) return 'permanent'
  return 'unknown'
}

// ── RetryExecutor ──

export class RetryExecutor {
  private stats: RecoveryStats = this.emptyStats()

  /** Execute `fn` with the given retry policy */
  async execute<T>(fn: () => Promise<T>, policy: RetryPolicy): Promise<T> {
    const maxAttempts = policy.maxAttempts
    const backoffType = policy.backoffType ?? 'exponential'
    const baseDelay = policy.baseDelay ?? 200
    const maxDelay = policy.maxDelay ?? 30_000
    const jitter = policy.jitter ?? true
    const retryOn = policy.retryOn ?? (() => true)

    let lastError: unknown
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn()
        this.stats.successes++
        this.stats.totalExecutions++
        return result
      } catch (err) {
        lastError = err
        this.stats.totalExecutions++

        if (attempt === maxAttempts || !retryOn(err)) {
          this.stats.failures++
          throw err
        }

        this.stats.retries++
        const delay = this.computeDelay(attempt, backoffType, baseDelay, maxDelay, jitter)
        await sleep(delay)
      }
    }

    // Should not reach here, but satisfy TypeScript
    this.stats.failures++
    throw lastError
  }

  /** Get cumulative stats */
  getStats(): RecoveryStats {
    return { ...this.stats }
  }

  /** Reset stats */
  resetStats(): void {
    this.stats = this.emptyStats()
  }

  private computeDelay(
    attempt: number,
    type: BackoffType,
    base: number,
    max: number,
    jitter: boolean,
  ): number {
    let delay: number
    switch (type) {
      case 'exponential':
        delay = base * Math.pow(2, attempt - 1)
        break
      case 'linear':
        delay = base * attempt
        break
      case 'constant':
        delay = base
        break
    }
    delay = Math.min(delay, max)
    if (jitter) {
      delay = delay * (0.5 + Math.random() * 0.5)
    }
    return Math.round(delay)
  }

  private emptyStats(): RecoveryStats {
    return {
      retries: 0,
      failures: 0,
      circuitBreaks: 0,
      fallbacks: 0,
      timeouts: 0,
      cacheHits: 0,
      successes: 0,
      totalExecutions: 0,
    }
  }
}

// ── CircuitBreaker ──

export class CircuitBreaker {
  private state: CircuitBreakerState = 'closed'
  private failureCount = 0
  private successCount = 0
  private halfOpenAttempts = 0
  private nextAttemptAt = 0
  private stats: RecoveryStats = this.emptyStats()
  private readonly opts: Required<Omit<CircuitBreakerConfig, 'onStateChange'>> & {
    onStateChange?: CircuitBreakerConfig['onStateChange']
  }

  constructor(config: CircuitBreakerConfig) {
    this.opts = {
      failureThreshold: config.failureThreshold,
      successThreshold: config.successThreshold ?? 2,
      timeout: config.timeout ?? 30_000,
      halfOpenMax: config.halfOpenMax ?? 1,
      onStateChange: config.onStateChange,
    }
  }

  /** Execute `fn` through the circuit breaker */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.stats.totalExecutions++

    if (this.state === 'open') {
      if (Date.now() < this.nextAttemptAt) {
        this.stats.circuitBreaks++
        throw new Error('Circuit breaker is open')
      }
      this.transition('half-open')
    }

    if (this.state === 'half-open' && this.halfOpenAttempts >= this.opts.halfOpenMax) {
      this.stats.circuitBreaks++
      throw new Error('Circuit breaker half-open limit reached')
    }

    try {
      if (this.state === 'half-open') this.halfOpenAttempts++
      const result = await fn()
      this.onSuccess()
      return result
    } catch (err) {
      this.onFailure()
      throw err
    }
  }

  /** Current state */
  getState(): CircuitBreakerState {
    // Auto-advance from open to half-open when timeout elapsed
    if (this.state === 'open' && Date.now() >= this.nextAttemptAt) {
      this.transition('half-open')
    }
    return this.state
  }

  /** Force-reset to closed */
  reset(): void {
    this.transition('closed')
    this.failureCount = 0
    this.successCount = 0
    this.halfOpenAttempts = 0
  }

  /** Get stats */
  getStats(): RecoveryStats {
    return { ...this.stats }
  }

  /** Reset stats */
  resetStats(): void {
    this.stats = this.emptyStats()
  }

  private onSuccess(): void {
    this.stats.successes++
    if (this.state === 'half-open') {
      this.successCount++
      if (this.successCount >= this.opts.successThreshold) {
        this.failureCount = 0
        this.successCount = 0
        this.halfOpenAttempts = 0
        this.transition('closed')
      }
    } else {
      this.failureCount = 0
    }
  }

  private onFailure(): void {
    this.stats.failures++
    this.failureCount++

    if (this.state === 'half-open') {
      this.successCount = 0
      this.halfOpenAttempts = 0
      this.transition('open')
      this.nextAttemptAt = Date.now() + this.opts.timeout
    } else if (this.failureCount >= this.opts.failureThreshold) {
      this.transition('open')
      this.nextAttemptAt = Date.now() + this.opts.timeout
    }
  }

  private transition(to: CircuitBreakerState): void {
    if (this.state === to) return
    const from = this.state
    this.state = to
    if (to === 'half-open') {
      this.halfOpenAttempts = 0
      this.successCount = 0
    }
    this.opts.onStateChange?.(from, to)
  }

  private emptyStats(): RecoveryStats {
    return {
      retries: 0,
      failures: 0,
      circuitBreaks: 0,
      fallbacks: 0,
      timeouts: 0,
      cacheHits: 0,
      successes: 0,
      totalExecutions: 0,
    }
  }
}

// ── Bulkhead ──

interface QueuedItem<T> {
  fn: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
  timer: ReturnType<typeof setTimeout>
}

export class Bulkhead {
  private active = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queue: Array<QueuedItem<any>> = []
  private stats: RecoveryStats = this.emptyStats()
  private readonly opts: Required<BulkheadConfig>

  constructor(config: BulkheadConfig) {
    this.opts = {
      maxConcurrent: config.maxConcurrent,
      maxQueue: config.maxQueue ?? 50,
      queueTimeout: config.queueTimeout ?? 5_000,
    }
  }

  /** Execute `fn` respecting concurrency and queue limits */
  execute<T>(fn: () => Promise<T>): Promise<T> {
    this.stats.totalExecutions++

    if (this.active < this.opts.maxConcurrent) {
      return this.run(fn)
    }

    if (this.queue.length >= this.opts.maxQueue) {
      this.stats.failures++
      return Promise.reject(new Error('Bulkhead queue full'))
    }

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.queue.findIndex((q) => q.resolve === resolve)
        if (idx !== -1) {
          this.queue.splice(idx, 1)
          this.stats.failures++
          reject(new Error('Bulkhead queue timeout'))
        }
      }, this.opts.queueTimeout)

      this.queue.push({ fn, resolve, reject, timer })
    })
  }

  /** Number of currently running executions */
  getActiveCount(): number {
    return this.active
  }

  /** Number of items waiting in queue */
  getQueueSize(): number {
    return this.queue.length
  }

  /** Get stats */
  getStats(): RecoveryStats {
    return { ...this.stats }
  }

  /** Reset stats */
  resetStats(): void {
    this.stats = this.emptyStats()
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    this.active++
    try {
      const result = await fn()
      this.stats.successes++
      return result
    } catch (err) {
      this.stats.failures++
      throw err
    } finally {
      this.active--
      this.dequeue()
    }
  }

  private dequeue(): void {
    if (this.queue.length === 0 || this.active >= this.opts.maxConcurrent) return
    const next = this.queue.shift()!
    clearTimeout(next.timer)
    this.run(next.fn).then(next.resolve, next.reject)
  }

  private emptyStats(): RecoveryStats {
    return {
      retries: 0,
      failures: 0,
      circuitBreaks: 0,
      fallbacks: 0,
      timeouts: 0,
      cacheHits: 0,
      successes: 0,
      totalExecutions: 0,
    }
  }
}

// ── RecoveryPipeline ──

export class RecoveryPipeline {
  private retryExec: RetryExecutor | null = null
  private breaker: CircuitBreaker | null = null
  private bulkhead: Bulkhead | null = null
  private cache = new Map<string, { value: unknown; expiresAt: number }>()
  private readonly config: RecoveryPipelineConfig
  private stats: RecoveryStats = this.emptyStats()

  constructor(config: RecoveryPipelineConfig) {
    this.config = config

    if (config.retry) this.retryExec = new RetryExecutor()
    if (config.circuitBreaker) this.breaker = new CircuitBreaker(config.circuitBreaker)
    if (config.bulkhead) this.bulkhead = new Bulkhead(config.bulkhead)
  }

  /**
   * Execute `fn` through the configured strategy pipeline.
   * Application order (outside-in): cache → timeout → bulkhead → circuit-breaker → retry → fn
   * The outermost wrapper runs first; the innermost is closest to the actual call.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.stats.totalExecutions++

    // 1. Cache check
    if (this.config.cache) {
      const key = this.config.cache.keyFn?.() ?? '__default__'
      const cached = this.cache.get(key)
      if (cached && cached.expiresAt > Date.now()) {
        this.stats.cacheHits++
        return cached.value as T
      }
    }

    // Build the execution chain inside-out
    let wrapped: () => Promise<T> = fn

    // 2. Retry wraps fn
    if (this.retryExec && this.config.retry) {
      const retryExec = this.retryExec
      const policy = this.config.retry
      const innerFn = wrapped
      wrapped = () => retryExec.execute(innerFn, policy)
    }

    // 3. Circuit breaker wraps retry
    if (this.breaker) {
      const breaker = this.breaker
      const innerFn = wrapped
      wrapped = () => breaker.execute(innerFn)
    }

    // 4. Bulkhead wraps circuit breaker
    if (this.bulkhead) {
      const bulkhead = this.bulkhead
      const innerFn = wrapped
      wrapped = () => bulkhead.execute(innerFn)
    }

    // 5. Timeout wraps bulkhead
    if (this.config.timeout) {
      const { duration, onTimeout } = this.config.timeout
      const innerFn = wrapped
      wrapped = () =>
        Promise.race([
          innerFn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => {
              this.stats.timeouts++
              onTimeout?.()
              reject(new Error(`Recovery timeout after ${duration}ms`))
            }, duration),
          ),
        ])
    }

    try {
      const result = await wrapped()
      this.stats.successes++

      // Store in cache
      if (this.config.cache) {
        const key = this.config.cache.keyFn?.() ?? '__default__'
        const ttl = this.config.cache.ttl ?? 60_000
        const maxSize = this.config.cache.maxSize ?? 256
        if (this.cache.size >= maxSize) {
          // Evict oldest entry
          const firstKey = this.cache.keys().next().value
          if (firstKey !== undefined) this.cache.delete(firstKey)
        }
        this.cache.set(key, { value: result, expiresAt: Date.now() + ttl })
      }

      return result
    } catch (err) {
      // 6. Fallback
      if (this.config.fallback) {
        const { fallbackFn, condition } = this.config.fallback
        if (!condition || condition(err)) {
          this.stats.fallbacks++
          return (await fallbackFn(err)) as T
        }
      }
      this.stats.failures++
      throw err
    }
  }

  /** Aggregate stats from the pipeline and its inner components */
  getStats(): RecoveryStats {
    const merged = { ...this.stats }
    if (this.retryExec) {
      const rs = this.retryExec.getStats()
      merged.retries += rs.retries
    }
    if (this.breaker) {
      const bs = this.breaker.getStats()
      merged.circuitBreaks += bs.circuitBreaks
    }
    return merged
  }

  /** Reset all stats */
  resetStats(): void {
    this.stats = this.emptyStats()
    this.retryExec?.resetStats()
    this.breaker?.resetStats()
    this.bulkhead?.resetStats()
    this.cache.clear()
  }

  /** Get the circuit breaker instance (if configured) */
  getCircuitBreaker(): CircuitBreaker | null {
    return this.breaker
  }

  private emptyStats(): RecoveryStats {
    return {
      retries: 0,
      failures: 0,
      circuitBreaks: 0,
      fallbacks: 0,
      timeouts: 0,
      cacheHits: 0,
      successes: 0,
      totalExecutions: 0,
    }
  }
}

// ── RecoveryManager ──

export class RecoveryManager {
  private pipelines = new Map<string, RecoveryPipeline>()
  private eventHandlers: Array<(event: RecoveryEvent) => void> = []

  /** Create and register a named pipeline */
  createPipeline(name: string, config: RecoveryPipelineConfig): RecoveryPipeline {
    const pipeline = new RecoveryPipeline(config)
    this.pipelines.set(name, pipeline)
    return pipeline
  }

  /** Retrieve a named pipeline */
  getPipeline(name: string): RecoveryPipeline | undefined {
    return this.pipelines.get(name)
  }

  /** Remove a named pipeline */
  removePipeline(name: string): boolean {
    return this.pipelines.delete(name)
  }

  /** Execute a function through a named pipeline */
  async execute<T>(pipelineName: string, fn: () => Promise<T>): Promise<T> {
    const pipeline = this.pipelines.get(pipelineName)
    if (!pipeline) throw new Error(`Recovery pipeline "${pipelineName}" not found`)

    const start = Date.now()
    try {
      const result = await pipeline.execute(fn)
      this.emit({
        type: 'success',
        timestamp: Date.now(),
        strategy: 'pipeline',
        duration: Date.now() - start,
        metadata: { pipeline: pipelineName },
      })
      return result
    } catch (err) {
      this.emit({
        type: 'failure',
        timestamp: Date.now(),
        strategy: 'pipeline',
        error: err,
        duration: Date.now() - start,
        metadata: { pipeline: pipelineName, category: categorizeError(err) },
      })
      throw err
    }
  }

  /** Subscribe to recovery events */
  onEvent(handler: (event: RecoveryEvent) => void): void {
    this.eventHandlers.push(handler)
  }

  /** Aggregate stats across all pipelines */
  getStats(): Record<string, RecoveryStats> {
    const result: Record<string, RecoveryStats> = {}
    for (const [name, pipeline] of this.pipelines.entries()) {
      result[name] = pipeline.getStats()
    }
    return result
  }

  /** Reset stats for all pipelines */
  resetStats(): void {
    for (const pipeline of this.pipelines.values()) {
      pipeline.resetStats()
    }
  }

  /** Get list of registered pipeline names */
  getPipelineNames(): string[] {
    return Array.from(this.pipelines.keys())
  }

  /** Clear all pipelines and handlers */
  clear(): void {
    this.pipelines.clear()
    this.eventHandlers = []
  }

  private emit(event: RecoveryEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event)
      } catch {
        // Swallow handler errors
      }
    }
  }
}

// ── Factory helpers ──

/** Create a new RetryExecutor */
export function createRetryExecutor(): RetryExecutor {
  return new RetryExecutor()
}

/** Create a new CircuitBreaker with the given config */
export function createCircuitBreaker(config: CircuitBreakerConfig): CircuitBreaker {
  return new CircuitBreaker(config)
}

/** Create a new Bulkhead with the given config */
export function createBulkhead(config: BulkheadConfig): Bulkhead {
  return new Bulkhead(config)
}

/** Create a new RecoveryPipeline with the given config */
export function createRecoveryPipeline(config: RecoveryPipelineConfig): RecoveryPipeline {
  return new RecoveryPipeline(config)
}

/** Create a new RecoveryManager */
export function createRecoveryManager(): RecoveryManager {
  return new RecoveryManager()
}
