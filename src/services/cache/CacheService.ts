/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Cache Service — Unified Multi-Tier Caching                                  ║
 * ║                                                                              ║
 * ║  Orchestrates L1 (memory) and L2 (disk) caches into a single API.           ║
 * ║  Provides cache-through helpers for AI responses and tool results.           ║
 * ║                                                                              ║
 * ║  Architecture:                                                               ║
 * ║    ┌─────────┐  miss  ┌──────────┐  miss  ┌──────────┐                      ║
 * ║    │ L1 Mem  │──────→│ L2 Disk  │──────→│ Compute  │                      ║
 * ║    │  (fast) │       │(persist) │       │  (slow)  │                      ║
 * ║    └─────────┘       └──────────┘       └──────────┘                      ║
 * ║                                                                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { MemoryCache, type MemoryCacheConfig } from './MemoryCache.js'
import { DiskCache, type DiskCacheConfig } from './DiskCache.js'

// ── Types ──

export type CacheTier = 'memory' | 'disk' | 'all'

export interface CacheConfig {
  memory?: Partial<MemoryCacheConfig>
  disk?: Partial<DiskCacheConfig>
  /** Enable disk caching (default: true). */
  enableDisk: boolean
}

export interface CacheSetOptions {
  /** Which tier(s) to write to (default: 'all'). */
  tier?: CacheTier
  /** TTL in milliseconds (overrides tier defaults). */
  ttlMs?: number
}

export interface CacheStats {
  memory: ReturnType<MemoryCache['getStats']>
  disk: ReturnType<DiskCache['getStats']> | null
  totalHits: number
  totalMisses: number
}

// ── Singleton ──

let instance: CacheService | null = null

/**
 * Initialize the global cache service.
 * Call this once at application startup.
 */
export function initCache(config?: Partial<CacheConfig>): CacheService {
  instance = new CacheService(config)
  return instance
}

/** Get the global cache service instance. Creates a default one if not initialized. */
export function getCache(): CacheService {
  if (!instance) {
    instance = new CacheService()
  }
  return instance
}

// ── Convenience Functions ──

/** Get a value from cache (L1 → L2 lookup). */
export async function cacheGet<T>(key: string, tier?: CacheTier): Promise<T | undefined> {
  return getCache().get<T>(key, tier)
}

/** Set a value in cache. */
export async function cacheSet<T>(key: string, value: T, options?: CacheSetOptions): Promise<void> {
  return getCache().set(key, value, options)
}

/** Invalidate cache entries matching a pattern. */
export async function cacheInvalidate(pattern: string): Promise<number> {
  return getCache().invalidate(pattern)
}

/** Get cache statistics. */
export function getCacheStats(): CacheStats {
  return getCache().getStats()
}

/**
 * Cache-through wrapper: return cached value if available, otherwise compute and cache.
 *
 * @example
 * ```ts
 * const response = await withCache('chat:abc123', async () => {
 *   return await expensiveApiCall()
 * }, { ttlMs: 3600000 })
 * ```
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options?: CacheSetOptions,
): Promise<T> {
  return getCache().withCache(key, fn, options)
}

// ── CacheService Class ──

/**
 * Unified cache service that orchestrates L1 (memory) and L2 (disk) tiers.
 */
export class CacheService {
  private memoryCache: MemoryCache
  private diskCache: DiskCache | null

  constructor(config?: Partial<CacheConfig>) {
    this.memoryCache = new MemoryCache(config?.memory)
    this.diskCache = config?.enableDisk !== false ? new DiskCache(config?.disk) : null
  }

  /** Get a value, checking L1 → L2. */
  async get<T>(key: string, tier?: CacheTier): Promise<T | undefined> {
    // L1: Memory
    if (tier !== 'disk') {
      const memResult = this.memoryCache.get<T>(key)
      if (memResult !== undefined) {
        return memResult
      }
    }

    // L2: Disk
    if (this.diskCache && tier !== 'memory') {
      const diskResult = await this.diskCache.get<T>(key)
      if (diskResult !== undefined) {
        // Promote to L1 for faster future access
        if (tier !== 'disk') {
          this.memoryCache.set(key, diskResult)
        }
        return diskResult
      }
    }

    return undefined
  }

  /** Set a value in the specified tier(s). */
  async set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void> {
    const tier = options?.tier ?? 'all'

    // L1: Memory
    if (tier === 'all' || tier === 'memory') {
      this.memoryCache.set(key, value, options?.ttlMs)
    }

    // L2: Disk
    if (this.diskCache && (tier === 'all' || tier === 'disk')) {
      await this.diskCache.set(key, value, options?.ttlMs)
    }
  }

  /** Check if a key exists in any tier. */
  async has(key: string): Promise<boolean> {
    if (this.memoryCache.has(key)) return true
    if (this.diskCache && (await this.diskCache.has(key))) return true
    return false
  }

  /** Delete a key from all tiers. */
  async delete(key: string): Promise<boolean> {
    const memDeleted = this.memoryCache.delete(key)
    const diskDeleted = this.diskCache ? await this.diskCache.delete(key) : false
    return memDeleted || diskDeleted
  }

  /** Invalidate entries matching a pattern. */
  async invalidate(pattern: string): Promise<number> {
    let count = this.memoryCache.invalidate(pattern)
    if (this.diskCache) {
      count += await this.diskCache.invalidate(pattern)
    }
    return count
  }

  /** Cache-through: get or compute and store. */
  async withCache<T>(key: string, fn: () => Promise<T>, options?: CacheSetOptions): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== undefined) {
      return cached
    }

    const value = await fn()
    await this.set(key, value, options)
    return value
  }

  /** Clear all caches. */
  async clear(): Promise<void> {
    this.memoryCache.clear()
    if (this.diskCache) {
      await this.diskCache.clear()
    }
  }

  /** Prune expired entries from all tiers. */
  async prune(): Promise<number> {
    let pruned = this.memoryCache.prune()
    if (this.diskCache) {
      pruned += await this.diskCache.prune()
    }
    return pruned
  }

  /** Get combined statistics from all tiers. */
  getStats(): CacheStats {
    const memStats = this.memoryCache.getStats()
    const diskStats = this.diskCache ? this.diskCache.getStats() : null

    return {
      memory: memStats,
      disk: diskStats,
      totalHits: memStats.hits + (diskStats?.hits ?? 0),
      totalMisses: memStats.misses + (diskStats?.misses ?? 0),
    }
  }
}
