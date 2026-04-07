import { describe, it, expect, beforeEach } from 'vitest'
import {
  TokenBucketLimiter,
  SlidingWindowLimiter,
  FixedWindowLimiter,
  CompositeRateLimiter,
  toRateLimitHeaders,
  createTokenBucket,
  createSlidingWindow,
  createFixedWindow,
} from '../index.js'

describe('RateLimiter', () => {
  describe('TokenBucketLimiter', () => {
    let limiter: TokenBucketLimiter

    beforeEach(() => {
      limiter = new TokenBucketLimiter({ maxTokens: 10, refillRate: 1 })
    })

    it('should allow requests within limits', () => {
      const result = limiter.tryConsume('user-1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)
    })

    it('should deny requests when tokens exhausted', () => {
      for (let i = 0; i < 10; i++) {
        limiter.tryConsume('user-1')
      }
      const result = limiter.tryConsume('user-1')
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should support multi-token consumption', () => {
      const result = limiter.tryConsume('user-1', 5)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(5)
    })

    it('should deny if not enough tokens for cost', () => {
      const result = limiter.tryConsume('user-1', 15)
      expect(result.allowed).toBe(false)
    })

    it('should isolate keys', () => {
      for (let i = 0; i < 10; i++) {
        limiter.tryConsume('user-1')
      }
      const result = limiter.tryConsume('user-2')
      expect(result.allowed).toBe(true)
    })

    it('should refill tokens over time', async () => {
      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        limiter.tryConsume('user-1')
      }
      expect(limiter.tryConsume('user-1').allowed).toBe(false)

      // Wait for refill (1 token/sec)
      await new Promise(r => setTimeout(r, 1100))
      const result = limiter.tryConsume('user-1')
      expect(result.allowed).toBe(true)
    })

    it('should get current tokens', () => {
      limiter.tryConsume('user-1', 3)
      expect(limiter.getTokens('user-1')).toBeGreaterThanOrEqual(6)
    })

    it('should return initial tokens for unknown key', () => {
      expect(limiter.getTokens('unknown')).toBe(10)
    })

    it('should reset a specific key', () => {
      limiter.tryConsume('user-1', 10)
      limiter.reset('user-1')
      expect(limiter.getTokens('user-1')).toBe(10)
    })

    it('should track stats', () => {
      limiter.tryConsume('user-1')
      limiter.tryConsume('user-1', 100) // Will be denied

      const stats = limiter.getStats()
      expect(stats.totalRequests).toBe(2)
      expect(stats.totalAllowed).toBe(1)
      expect(stats.totalDenied).toBe(1)
      expect(stats.activeKeys).toBe(1)
    })

    it('should calculate hit rate', () => {
      limiter.tryConsume('user-1')
      const stats = limiter.getStats()
      expect(stats.hitRate).toBe(1.0)
    })

    it('should clear all state', () => {
      limiter.tryConsume('user-1')
      limiter.clear()
      expect(limiter.getStats().totalRequests).toBe(0)
    })

    it('should support custom initial tokens', () => {
      const l = new TokenBucketLimiter({ maxTokens: 10, refillRate: 1, initialTokens: 0 })
      const result = l.tryConsume('user-1')
      expect(result.allowed).toBe(false)
    })

    it('should cap refill at max tokens', async () => {
      const l = new TokenBucketLimiter({ maxTokens: 5, refillRate: 100 })
      await new Promise(r => setTimeout(r, 100))
      expect(l.getTokens('user-1')).toBeLessThanOrEqual(5)
    })
  })

  describe('SlidingWindowLimiter', () => {
    let limiter: SlidingWindowLimiter

    beforeEach(() => {
      limiter = new SlidingWindowLimiter({ windowMs: 1000, maxRequests: 5 })
    })

    it('should allow requests within window', () => {
      const result = limiter.tryConsume('user-1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThanOrEqual(3)
    })

    it('should deny when window limit reached', () => {
      for (let i = 0; i < 5; i++) {
        limiter.tryConsume('user-1')
      }
      const result = limiter.tryConsume('user-1')
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should isolate keys', () => {
      for (let i = 0; i < 5; i++) {
        limiter.tryConsume('user-1')
      }
      expect(limiter.tryConsume('user-2').allowed).toBe(true)
    })

    it('should get current count', () => {
      limiter.tryConsume('user-1')
      limiter.tryConsume('user-1')
      expect(limiter.getCurrentCount('user-1')).toBeGreaterThanOrEqual(1)
    })

    it('should return 0 for unknown key', () => {
      expect(limiter.getCurrentCount('unknown')).toBe(0)
    })

    it('should support cost-based consumption', () => {
      limiter.tryConsume('user-1', 3)
      limiter.tryConsume('user-1', 2)
      const result = limiter.tryConsume('user-1', 1)
      expect(result.allowed).toBe(false)
    })

    it('should reset a key', () => {
      limiter.tryConsume('user-1', 5)
      limiter.reset('user-1')
      expect(limiter.tryConsume('user-1').allowed).toBe(true)
    })

    it('should track stats', () => {
      limiter.tryConsume('user-1')
      const stats = limiter.getStats()
      expect(stats.totalRequests).toBe(1)
      expect(stats.totalAllowed).toBe(1)
    })

    it('should clear all state', () => {
      limiter.tryConsume('user-1')
      limiter.clear()
      expect(limiter.getStats().totalRequests).toBe(0)
    })
  })

  describe('FixedWindowLimiter', () => {
    let limiter: FixedWindowLimiter

    beforeEach(() => {
      limiter = new FixedWindowLimiter({ windowMs: 1000, maxRequests: 3 })
    })

    it('should allow requests within limit', () => {
      const result = limiter.tryConsume('user-1')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('should deny when limit reached', () => {
      for (let i = 0; i < 3; i++) {
        limiter.tryConsume('user-1')
      }
      const result = limiter.tryConsume('user-1')
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should reset after window expires', async () => {
      const l = new FixedWindowLimiter({ windowMs: 100, maxRequests: 1 })
      l.tryConsume('user-1')
      expect(l.tryConsume('user-1').allowed).toBe(false)

      await new Promise(r => setTimeout(r, 150))
      expect(l.tryConsume('user-1').allowed).toBe(true)
    })

    it('should support cost-based consumption', () => {
      const result = limiter.tryConsume('user-1', 3)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(0)
    })

    it('should track stats', () => {
      limiter.tryConsume('user-1')
      const stats = limiter.getStats()
      expect(stats.totalRequests).toBe(1)
      expect(stats.totalAllowed).toBe(1)
    })

    it('should clear state', () => {
      limiter.tryConsume('user-1')
      limiter.clear()
      expect(limiter.getStats().totalRequests).toBe(0)
    })
  })

  describe('CompositeRateLimiter', () => {
    it('should allow when all limiters allow', () => {
      const composite = new CompositeRateLimiter()
      composite.addLimiter('bucket', new TokenBucketLimiter({ maxTokens: 10, refillRate: 1 }))
      composite.addLimiter('window', new FixedWindowLimiter({ windowMs: 1000, maxRequests: 10 }))

      const result = composite.tryConsume('user-1')
      expect(result.allowed).toBe(true)
    })

    it('should deny when any limiter denies', () => {
      const composite = new CompositeRateLimiter()
      composite.addLimiter('bucket', new TokenBucketLimiter({ maxTokens: 1, refillRate: 0.001 }))
      composite.addLimiter('window', new FixedWindowLimiter({ windowMs: 60000, maxRequests: 100 }))

      composite.tryConsume('user-1') // Use the 1 token
      const result = composite.tryConsume('user-1')
      expect(result.allowed).toBe(false)
      expect(result.deniedBy).toBe('bucket')
    })

    it('should report worst remaining', () => {
      const composite = new CompositeRateLimiter()
      composite.addLimiter('bucket', new TokenBucketLimiter({ maxTokens: 10, refillRate: 1 }))
      composite.addLimiter('window', new FixedWindowLimiter({ windowMs: 1000, maxRequests: 5 }))

      const result = composite.tryConsume('user-1')
      expect(result.remaining).toBeLessThanOrEqual(4) // window has fewer
    })
  })

  describe('toRateLimitHeaders', () => {
    it('should generate standard headers', () => {
      const headers = toRateLimitHeaders({
        allowed: true,
        remaining: 9,
        limit: 10,
        resetAt: Date.now() + 60000,
      })

      expect(headers['X-RateLimit-Limit']).toBe('10')
      expect(headers['X-RateLimit-Remaining']).toBe('9')
      expect(headers['X-RateLimit-Reset']).toBeTruthy()
    })

    it('should include Retry-After when present', () => {
      const headers = toRateLimitHeaders({
        allowed: false,
        remaining: 0,
        limit: 10,
        resetAt: Date.now() + 60000,
        retryAfter: 5000,
      })

      expect(headers['Retry-After']).toBe('5')
    })

    it('should not include Retry-After when not present', () => {
      const headers = toRateLimitHeaders({
        allowed: true,
        remaining: 5,
        limit: 10,
        resetAt: Date.now() + 60000,
      })

      expect(headers['Retry-After']).toBeUndefined()
    })
  })

  describe('factory functions', () => {
    it('createTokenBucket should create instance', () => {
      const l = createTokenBucket({ maxTokens: 10, refillRate: 1 })
      expect(l).toBeInstanceOf(TokenBucketLimiter)
    })

    it('createSlidingWindow should create instance', () => {
      const l = createSlidingWindow({ windowMs: 1000, maxRequests: 10 })
      expect(l).toBeInstanceOf(SlidingWindowLimiter)
    })

    it('createFixedWindow should create instance', () => {
      const l = createFixedWindow({ windowMs: 1000, maxRequests: 10 })
      expect(l).toBeInstanceOf(FixedWindowLimiter)
    })
  })
})
