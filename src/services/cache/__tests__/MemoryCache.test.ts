import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryCache } from '../MemoryCache.js'

describe('MemoryCache', () => {
  let cache: MemoryCache

  beforeEach(() => {
    vi.useFakeTimers()
    cache = new MemoryCache()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('basic get/set/has/delete', () => {
    it('returns undefined for missing keys', () => {
      expect(cache.get('missing')).toBeUndefined()
    })

    it('stores and retrieves a value', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('has returns true for existing keys', () => {
      cache.set('key1', 42)
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('nope')).toBe(false)
    })

    it('delete removes a key', () => {
      cache.set('key1', 'v')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('delete returns false for missing key', () => {
      expect(cache.delete('missing')).toBe(false)
    })

    it('stores and retrieves complex objects', () => {
      const obj = { nested: { arr: [1, 2, 3] } }
      cache.set('obj', obj)
      expect(cache.get('obj')).toEqual(obj)
    })
  })

  describe('LRU eviction', () => {
    it('evicts the least recently used entry when at capacity', () => {
      const lru = new MemoryCache({ maxEntries: 3 })
      lru.set('a', 1)
      lru.set('b', 2)
      lru.set('c', 3)
      lru.set('d', 4) // should evict 'a'

      expect(lru.get('a')).toBeUndefined()
      expect(lru.get('b')).toBe(2)
      expect(lru.get('c')).toBe(3)
      expect(lru.get('d')).toBe(4)
    })

    it('accessing a key refreshes its LRU position', () => {
      const lru = new MemoryCache({ maxEntries: 3 })
      lru.set('a', 1)
      lru.set('b', 2)
      lru.set('c', 3)

      // Access 'a' to refresh it
      lru.get('a')

      lru.set('d', 4) // should evict 'b' now (oldest untouched)

      expect(lru.get('a')).toBe(1)
      expect(lru.get('b')).toBeUndefined()
      expect(lru.get('d')).toBe(4)
    })

    it('updating an existing key does not trigger eviction', () => {
      const lru = new MemoryCache({ maxEntries: 2 })
      lru.set('a', 1)
      lru.set('b', 2)
      lru.set('a', 10) // update, no eviction

      expect(lru.get('a')).toBe(10)
      expect(lru.get('b')).toBe(2)
    })
  })

  describe('TTL expiry', () => {
    it('returns undefined for expired entries', () => {
      cache.set('ttl-key', 'val', 1000)
      expect(cache.get('ttl-key')).toBe('val')

      vi.advanceTimersByTime(1001)
      expect(cache.get('ttl-key')).toBeUndefined()
    })

    it('has returns false for expired entries', () => {
      cache.set('ttl-key', 'val', 500)
      expect(cache.has('ttl-key')).toBe(true)

      vi.advanceTimersByTime(501)
      expect(cache.has('ttl-key')).toBe(false)
    })

    it('entries without TTL never expire', () => {
      cache.set('forever', 'val', null)
      vi.advanceTimersByTime(999999999)
      expect(cache.get('forever')).toBe('val')
    })

    it('uses defaultTtlMs when no per-key TTL is given', () => {
      const ttlCache = new MemoryCache({ defaultTtlMs: 2000 })
      ttlCache.set('k', 'v')

      vi.advanceTimersByTime(1999)
      expect(ttlCache.get('k')).toBe('v')

      vi.advanceTimersByTime(2)
      expect(ttlCache.get('k')).toBeUndefined()
    })
  })

  describe('pattern invalidation', () => {
    it('invalidates entries matching a wildcard pattern', () => {
      cache.set('user:1', 'alice')
      cache.set('user:2', 'bob')
      cache.set('post:1', 'hello')

      const count = cache.invalidate('user:*')
      expect(count).toBe(2)
      expect(cache.get('user:1')).toBeUndefined()
      expect(cache.get('user:2')).toBeUndefined()
      expect(cache.get('post:1')).toBe('hello')
    })

    it('invalidates with ? single-char wildcard', () => {
      cache.set('a1', 1)
      cache.set('a2', 2)
      cache.set('ab', 3)

      const count = cache.invalidate('a?')
      expect(count).toBe(3)
    })

    it('returns 0 when no entries match', () => {
      cache.set('key1', 'v')
      expect(cache.invalidate('nope*')).toBe(0)
    })
  })

  describe('stats tracking', () => {
    it('tracks hits and misses', () => {
      cache.set('k', 'v')
      cache.get('k') // hit
      cache.get('k') // hit
      cache.get('miss') // miss

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(2 / 3)
    })

    it('reports entries count and maxEntries', () => {
      const c = new MemoryCache({ maxEntries: 50 })
      c.set('a', 1)
      c.set('b', 2)

      const stats = c.getStats()
      expect(stats.entries).toBe(2)
      expect(stats.maxEntries).toBe(50)
    })

    it('hitRate is 0 when no accesses', () => {
      expect(cache.getStats().hitRate).toBe(0)
    })
  })

  describe('prune', () => {
    it('removes expired entries', () => {
      cache.set('short', 'v', 100)
      cache.set('long', 'v', 10000)
      cache.set('forever', 'v', null)

      vi.advanceTimersByTime(200)
      const pruned = cache.prune()

      expect(pruned).toBe(1)
      expect(cache.has('short')).toBe(false)
      expect(cache.has('long')).toBe(true)
      expect(cache.has('forever')).toBe(true)
    })

    it('returns 0 when nothing to prune', () => {
      cache.set('a', 1)
      expect(cache.prune()).toBe(0)
    })
  })

  describe('clear', () => {
    it('removes all entries and resets stats', () => {
      cache.set('a', 1)
      cache.set('b', 2)
      cache.get('a') // hit
      cache.get('x') // miss

      cache.clear()

      // Stats should be reset immediately after clear
      const stats = cache.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)

      // Cleared entries are gone
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBeUndefined()
    })
  })
})
