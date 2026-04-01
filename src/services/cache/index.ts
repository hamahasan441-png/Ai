/**
 * Cache Service — Multi-tier caching for AI responses, knowledge, and tool results.
 *
 * @example
 * ```ts
 * import { initCache, cacheGet, cacheSet, withCache, getCacheStats } from './services/cache/index.js'
 *
 * // Initialize at startup
 * initCache({ enableDisk: true })
 *
 * // Cache-through pattern
 * const response = await withCache('chat:key', async () => {
 *   return await expensiveApiCall()
 * })
 *
 * // Manual get/set
 * await cacheSet('key', value, { ttlMs: 3600000 })
 * const cached = await cacheGet('key')
 * ```
 */

// ── Service (main API) ──
export {
  CacheService,
  initCache,
  getCache,
  cacheGet,
  cacheSet,
  cacheInvalidate,
  getCacheStats,
  withCache,
} from './CacheService.js'

export type {
  CacheConfig,
  CacheSetOptions,
  CacheTier,
  CacheStats,
} from './CacheService.js'

// ── Memory Cache ──
export { MemoryCache } from './MemoryCache.js'
export type { MemoryCacheConfig } from './MemoryCache.js'

// ── Disk Cache ──
export { DiskCache } from './DiskCache.js'
export type { DiskCacheConfig } from './DiskCache.js'

// ── Key Generation ──
export {
  cacheKey,
  chatCacheKey,
  knowledgeCacheKey,
  toolCacheKey,
} from './CacheKey.js'
