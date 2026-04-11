/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Memory Cache — LRU In-Memory Cache                                          ║
 * ║                                                                              ║
 * ║  Fast, volatile, session-scoped cache with LRU eviction.                     ║
 * ║  Used as L1 (fastest tier) in the caching hierarchy.                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

/** Cached item with metadata. */
interface CacheItem<T> {
  value: T
  createdAt: number
  lastAccessedAt: number
  ttlMs: number | null // null = no expiry
}

/** Configuration for the memory cache. */
export interface MemoryCacheConfig {
  /** Maximum number of entries (default: 1000). */
  maxEntries: number
  /** Default TTL in milliseconds (default: null = no expiry). */
  defaultTtlMs: number | null
}

/**
 * LRU (Least Recently Used) in-memory cache.
 *
 * @example
 * ```ts
 * const cache = new MemoryCache({ maxEntries: 100 })
 * cache.set('key1', { data: 'value' })
 * const result = cache.get<{ data: string }>('key1')  // { data: 'value' }
 * ```
 */
export class MemoryCache {
  private items = new Map<string, CacheItem<unknown>>()
  private config: MemoryCacheConfig
  private hits = 0
  private misses = 0

  constructor(config?: Partial<MemoryCacheConfig>) {
    this.config = {
      maxEntries: config?.maxEntries ?? 1000,
      defaultTtlMs: config?.defaultTtlMs ?? null,
    }
  }

  /** Get a value from the cache. Returns undefined if not found or expired. */
  get<T>(key: string): T | undefined {
    const item = this.items.get(key) as CacheItem<T> | undefined

    if (!item) {
      this.misses++
      return undefined
    }

    // Check TTL expiry
    if (item.ttlMs !== null && Date.now() - item.createdAt > item.ttlMs) {
      this.items.delete(key)
      this.misses++
      return undefined
    }

    // Update LRU order: delete and re-insert to move to end
    item.lastAccessedAt = Date.now()
    this.items.delete(key)
    this.items.set(key, item)
    this.hits++

    return item.value
  }

  /** Set a value in the cache with optional TTL override. */
  set<T>(key: string, value: T, ttlMs?: number | null): void {
    // Evict LRU if at capacity
    if (this.items.size >= this.config.maxEntries && !this.items.has(key)) {
      // Delete the first (oldest) entry in the Map
      const firstKey = this.items.keys().next().value
      if (firstKey !== undefined) {
        this.items.delete(firstKey)
      }
    }

    const now = Date.now()
    this.items.set(key, {
      value,
      createdAt: now,
      lastAccessedAt: now,
      ttlMs: ttlMs !== undefined ? ttlMs : this.config.defaultTtlMs,
    })
  }

  /** Check if a key exists and is not expired. */
  has(key: string): boolean {
    const item = this.items.get(key)
    if (!item) return false
    if (item.ttlMs !== null && Date.now() - item.createdAt > item.ttlMs) {
      this.items.delete(key)
      return false
    }
    return true
  }

  /** Delete a specific key. */
  delete(key: string): boolean {
    return this.items.delete(key)
  }

  /** Invalidate entries matching a glob-like pattern. */
  invalidate(pattern: string): number {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
    let count = 0
    for (const key of this.items.keys()) {
      if (regex.test(key)) {
        this.items.delete(key)
        count++
      }
    }
    return count
  }

  /** Clear all entries. */
  clear(): void {
    this.items.clear()
    this.hits = 0
    this.misses = 0
  }

  /** Get cache statistics. */
  getStats() {
    return {
      entries: this.items.size,
      maxEntries: this.config.maxEntries,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0,
    }
  }

  /** Prune expired entries. */
  prune(): number {
    const now = Date.now()
    let pruned = 0
    for (const [key, item] of this.items) {
      if (item.ttlMs !== null && now - item.createdAt > item.ttlMs) {
        this.items.delete(key)
        pruned++
      }
    }
    return pruned
  }
}
