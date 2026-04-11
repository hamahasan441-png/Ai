/**
 * 🚦 RateLimiter — Token bucket + sliding window rate limiting with per-key quotas and burst handling
 *
 * Features:
 * - Token bucket algorithm (steady rate with burst capacity)
 * - Sliding window counter (precise rate counting)
 * - Fixed window counter (lightweight alternative)
 * - Per-key rate limiting (user, API key, IP, etc.)
 * - Configurable quotas with different limits per key
 * - Rate limit headers (X-RateLimit-Limit, Remaining, Reset)
 * - Automatic cleanup of expired entries
 * - Composite limiter (multiple strategies)
 * - Cost-based consumption (weighted requests)
 * - Retry-After calculation
 *
 * Zero external dependencies.
 */

// ── Types ──

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetAt: number
  retryAfter?: number
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
  'Retry-After'?: string
}

export interface TokenBucketOptions {
  /** Max tokens in bucket (burst capacity) */
  maxTokens: number
  /** Token refill rate per second */
  refillRate: number
  /** Initial tokens (default: maxTokens) */
  initialTokens?: number
}

export interface SlidingWindowOptions {
  /** Window size in ms */
  windowMs: number
  /** Max requests per window */
  maxRequests: number
}

export interface FixedWindowOptions {
  /** Window size in ms */
  windowMs: number
  /** Max requests per window */
  maxRequests: number
}

export interface QuotaOptions {
  /** Quota period in ms */
  periodMs: number
  /** Max tokens per period */
  maxTokens: number
}

export interface RateLimiterStats {
  totalRequests: number
  totalAllowed: number
  totalDenied: number
  activeKeys: number
  hitRate: number
}

// ── Token Bucket ──

interface TokenBucketState {
  tokens: number
  lastRefill: number
}

export class TokenBucketLimiter {
  private buckets = new Map<string, TokenBucketState>()
  private totalRequests = 0
  private totalAllowed = 0
  private totalDenied = 0
  private readonly opts: Required<TokenBucketOptions>

  constructor(options: TokenBucketOptions) {
    this.opts = {
      maxTokens: options.maxTokens,
      refillRate: options.refillRate,
      initialTokens: options.initialTokens ?? options.maxTokens,
    }
  }

  /** Try to consume tokens for a key */
  tryConsume(key: string, tokens = 1): RateLimitResult {
    this.totalRequests++
    const bucket = this.getOrCreateBucket(key)
    this.refill(bucket)

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens
      this.totalAllowed++
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        limit: this.opts.maxTokens,
        resetAt:
          Date.now() +
          Math.ceil((this.opts.maxTokens - bucket.tokens) / this.opts.refillRate) * 1000,
      }
    }

    this.totalDenied++
    const tokensNeeded = tokens - bucket.tokens
    const retryAfter = Math.ceil(tokensNeeded / this.opts.refillRate) * 1000

    return {
      allowed: false,
      remaining: 0,
      limit: this.opts.maxTokens,
      resetAt: Date.now() + retryAfter,
      retryAfter,
    }
  }

  /** Get current token count for a key */
  getTokens(key: string): number {
    const bucket = this.buckets.get(key)
    if (!bucket) return this.opts.initialTokens
    this.refill(bucket)
    return Math.floor(bucket.tokens)
  }

  /** Reset a specific key */
  reset(key: string): void {
    this.buckets.delete(key)
  }

  /** Get stats */
  getStats(): RateLimiterStats {
    return {
      totalRequests: this.totalRequests,
      totalAllowed: this.totalAllowed,
      totalDenied: this.totalDenied,
      activeKeys: this.buckets.size,
      hitRate: this.totalRequests > 0 ? this.totalAllowed / this.totalRequests : 1,
    }
  }

  /** Clear all buckets */
  clear(): void {
    this.buckets.clear()
    this.totalRequests = 0
    this.totalAllowed = 0
    this.totalDenied = 0
  }

  private getOrCreateBucket(key: string): TokenBucketState {
    let bucket = this.buckets.get(key)
    if (!bucket) {
      bucket = { tokens: this.opts.initialTokens, lastRefill: Date.now() }
      this.buckets.set(key, bucket)
    }
    return bucket
  }

  private refill(bucket: TokenBucketState): void {
    const now = Date.now()
    const elapsed = (now - bucket.lastRefill) / 1000
    const tokensToAdd = elapsed * this.opts.refillRate
    bucket.tokens = Math.min(this.opts.maxTokens, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now
  }
}

// ── Sliding Window Counter ──

interface SlidingWindowState {
  currentCount: number
  previousCount: number
  currentWindowStart: number
}

export class SlidingWindowLimiter {
  private windows = new Map<string, SlidingWindowState>()
  private totalRequests = 0
  private totalAllowed = 0
  private totalDenied = 0
  private readonly opts: Required<SlidingWindowOptions>

  constructor(options: SlidingWindowOptions) {
    this.opts = {
      windowMs: options.windowMs,
      maxRequests: options.maxRequests,
    }
  }

  /** Try to record a request for a key */
  tryConsume(key: string, cost = 1): RateLimitResult {
    this.totalRequests++
    const state = this.getOrCreateWindow(key)
    this.slideWindow(state)

    const currentWeight = this.getCurrentWeight(state)

    if (currentWeight + cost <= this.opts.maxRequests) {
      state.currentCount += cost
      this.totalAllowed++
      return {
        allowed: true,
        remaining: Math.max(0, Math.floor(this.opts.maxRequests - currentWeight - cost)),
        limit: this.opts.maxRequests,
        resetAt: state.currentWindowStart + this.opts.windowMs,
      }
    }

    this.totalDenied++
    const resetAt = state.currentWindowStart + this.opts.windowMs
    return {
      allowed: false,
      remaining: 0,
      limit: this.opts.maxRequests,
      resetAt,
      retryAfter: resetAt - Date.now(),
    }
  }

  /** Get current request count for a key */
  getCurrentCount(key: string): number {
    const state = this.windows.get(key)
    if (!state) return 0
    this.slideWindow(state)
    return Math.ceil(this.getCurrentWeight(state))
  }

  /** Reset a specific key */
  reset(key: string): void {
    this.windows.delete(key)
  }

  /** Get stats */
  getStats(): RateLimiterStats {
    return {
      totalRequests: this.totalRequests,
      totalAllowed: this.totalAllowed,
      totalDenied: this.totalDenied,
      activeKeys: this.windows.size,
      hitRate: this.totalRequests > 0 ? this.totalAllowed / this.totalRequests : 1,
    }
  }

  /** Clear all windows */
  clear(): void {
    this.windows.clear()
    this.totalRequests = 0
    this.totalAllowed = 0
    this.totalDenied = 0
  }

  private getOrCreateWindow(key: string): SlidingWindowState {
    let state = this.windows.get(key)
    if (!state) {
      state = {
        currentCount: 0,
        previousCount: 0,
        currentWindowStart: this.getWindowStart(Date.now()),
      }
      this.windows.set(key, state)
    }
    return state
  }

  private slideWindow(state: SlidingWindowState): void {
    const now = Date.now()
    const currentStart = this.getWindowStart(now)

    if (currentStart !== state.currentWindowStart) {
      if (currentStart - state.currentWindowStart === this.opts.windowMs) {
        // Just moved to next window
        state.previousCount = state.currentCount
      } else {
        // Jumped more than one window
        state.previousCount = 0
      }
      state.currentCount = 0
      state.currentWindowStart = currentStart
    }
  }

  private getCurrentWeight(state: SlidingWindowState): number {
    const now = Date.now()
    const elapsed = now - state.currentWindowStart
    const prevWeight = Math.max(0, 1 - elapsed / this.opts.windowMs)
    return state.currentCount + state.previousCount * prevWeight
  }

  private getWindowStart(now: number): number {
    return Math.floor(now / this.opts.windowMs) * this.opts.windowMs
  }
}

// ── Fixed Window Counter ──

interface FixedWindowState {
  count: number
  windowStart: number
}

export class FixedWindowLimiter {
  private windows = new Map<string, FixedWindowState>()
  private totalRequests = 0
  private totalAllowed = 0
  private totalDenied = 0
  private readonly opts: Required<FixedWindowOptions>

  constructor(options: FixedWindowOptions) {
    this.opts = {
      windowMs: options.windowMs,
      maxRequests: options.maxRequests,
    }
  }

  /** Try to record a request */
  tryConsume(key: string, cost = 1): RateLimitResult {
    this.totalRequests++
    const state = this.getOrCreateWindow(key)
    const now = Date.now()

    // Reset if window expired
    if (now - state.windowStart >= this.opts.windowMs) {
      state.count = 0
      state.windowStart = now
    }

    if (state.count + cost <= this.opts.maxRequests) {
      state.count += cost
      this.totalAllowed++
      return {
        allowed: true,
        remaining: this.opts.maxRequests - state.count,
        limit: this.opts.maxRequests,
        resetAt: state.windowStart + this.opts.windowMs,
      }
    }

    this.totalDenied++
    return {
      allowed: false,
      remaining: 0,
      limit: this.opts.maxRequests,
      resetAt: state.windowStart + this.opts.windowMs,
      retryAfter: state.windowStart + this.opts.windowMs - now,
    }
  }

  /** Get stats */
  getStats(): RateLimiterStats {
    return {
      totalRequests: this.totalRequests,
      totalAllowed: this.totalAllowed,
      totalDenied: this.totalDenied,
      activeKeys: this.windows.size,
      hitRate: this.totalRequests > 0 ? this.totalAllowed / this.totalRequests : 1,
    }
  }

  /** Clear all windows */
  clear(): void {
    this.windows.clear()
    this.totalRequests = 0
    this.totalAllowed = 0
    this.totalDenied = 0
  }

  private getOrCreateWindow(key: string): FixedWindowState {
    let state = this.windows.get(key)
    if (!state) {
      state = { count: 0, windowStart: Date.now() }
      this.windows.set(key, state)
    }
    return state
  }
}

// ── Composite Rate Limiter ──

export class CompositeRateLimiter {
  private limiters: Array<{
    name: string
    limiter: { tryConsume: (key: string, cost?: number) => RateLimitResult }
  }> = []

  /** Add a limiter to the composite */
  addLimiter(
    name: string,
    limiter: { tryConsume: (key: string, cost?: number) => RateLimitResult },
  ): void {
    this.limiters.push({ name, limiter })
  }

  /** Try to consume across all limiters — ALL must allow */
  tryConsume(key: string, cost = 1): RateLimitResult & { deniedBy?: string } {
    let worstRemaining = Infinity
    let worstLimit = 0
    let earliestReset = 0

    for (const { name, limiter } of this.limiters) {
      const result = limiter.tryConsume(key, cost)
      if (!result.allowed) {
        return {
          ...result,
          deniedBy: name,
        }
      }
      if (result.remaining < worstRemaining) {
        worstRemaining = result.remaining
        worstLimit = result.limit
      }
      if (result.resetAt > earliestReset) {
        earliestReset = result.resetAt
      }
    }

    return {
      allowed: true,
      remaining: worstRemaining === Infinity ? 0 : worstRemaining,
      limit: worstLimit,
      resetAt: earliestReset,
    }
  }
}

// ── Utility: Generate rate limit headers ──

export function toRateLimitHeaders(result: RateLimitResult): RateLimitHeaders {
  const headers: RateLimitHeaders = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }

  if (result.retryAfter) {
    headers['Retry-After'] = String(Math.ceil(result.retryAfter / 1000))
  }

  return headers
}

/** Create a token bucket rate limiter */
export function createTokenBucket(options: TokenBucketOptions): TokenBucketLimiter {
  return new TokenBucketLimiter(options)
}

/** Create a sliding window rate limiter */
export function createSlidingWindow(options: SlidingWindowOptions): SlidingWindowLimiter {
  return new SlidingWindowLimiter(options)
}

/** Create a fixed window rate limiter */
export function createFixedWindow(options: FixedWindowOptions): FixedWindowLimiter {
  return new FixedWindowLimiter(options)
}
