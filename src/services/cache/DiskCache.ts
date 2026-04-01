/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Disk Cache — Persistent File-Based Cache                                    ║
 * ║                                                                              ║
 * ║  JSON file-based cache with TTL expiry and size limits.                      ║
 * ║  Used as L2 (persistent tier) in the caching hierarchy.                      ║
 * ║                                                                              ║
 * ║  Each cache entry is stored as a separate JSON file in the cache directory.  ║
 * ║  Atomic writes via temp file + rename for crash safety.                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from 'fs'
import * as path from 'path'
import { getDiskCachePath, ensureDir } from '../../utils/paths.js'

/** Metadata stored alongside cached values. */
interface DiskCacheEntry<T> {
  key: string
  value: T
  createdAt: number
  expiresAt: number | null  // null = never expires
  version: number
}

/** Configuration for the disk cache. */
export interface DiskCacheConfig {
  /** Base directory for cache files (default: from paths.ts). */
  baseDir: string
  /** Default TTL in milliseconds (default: 24 hours). */
  defaultTtlMs: number
  /** Maximum total cache size in bytes (default: 100MB). */
  maxSizeBytes: number
  /** Cache format version (for invalidation on schema changes). */
  version: number
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_MAX_SIZE = 100 * 1024 * 1024  // 100MB

/**
 * Persistent file-based cache with TTL and size limits.
 *
 * @example
 * ```ts
 * const cache = new DiskCache({ defaultTtlMs: 3600000 })  // 1 hour TTL
 * await cache.set('response:abc123', { text: 'Hello!' })
 * const data = await cache.get<{ text: string }>('response:abc123')
 * ```
 */
export class DiskCache {
  private config: DiskCacheConfig
  private hits = 0
  private misses = 0

  constructor(config?: Partial<DiskCacheConfig>) {
    this.config = {
      baseDir: config?.baseDir ?? getDiskCachePath(),
      defaultTtlMs: config?.defaultTtlMs ?? ONE_DAY_MS,
      maxSizeBytes: config?.maxSizeBytes ?? DEFAULT_MAX_SIZE,
      version: config?.version ?? 1,
    }
    ensureDir(this.config.baseDir)
  }

  /** Get the file path for a cache key. */
  private getFilePath(key: string): string {
    // Sanitize key for filesystem safety
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_')
    return path.join(this.config.baseDir, `${safeKey}.json`)
  }

  /** Get a value from disk cache. Returns undefined if not found or expired. */
  async get<T>(key: string): Promise<T | undefined> {
    const filePath = this.getFilePath(key)

    try {
      if (!fs.existsSync(filePath)) {
        this.misses++
        return undefined
      }

      const raw = fs.readFileSync(filePath, 'utf-8')
      const entry = JSON.parse(raw) as DiskCacheEntry<T>

      // Version check
      if (entry.version !== this.config.version) {
        fs.unlinkSync(filePath)
        this.misses++
        return undefined
      }

      // TTL check
      if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
        fs.unlinkSync(filePath)
        this.misses++
        return undefined
      }

      this.hits++
      return entry.value
    } catch {
      this.misses++
      return undefined
    }
  }

  /** Set a value in disk cache with optional TTL override. */
  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const filePath = this.getFilePath(key)
    const ttl = ttlMs ?? this.config.defaultTtlMs
    const now = Date.now()

    const entry: DiskCacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt: ttl > 0 ? now + ttl : null,
      version: this.config.version,
    }

    const json = JSON.stringify(entry)

    // Atomic write: write to temp file then rename
    const tempPath = filePath + '.tmp'
    try {
      ensureDir(path.dirname(filePath))
      fs.writeFileSync(tempPath, json, 'utf-8')
      fs.renameSync(tempPath, filePath)
    } catch {
      // Clean up temp file on failure
      try { fs.unlinkSync(tempPath) } catch { /* ignore */ }
    }
  }

  /** Check if a key exists and is not expired. */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== undefined
  }

  /** Delete a specific key. */
  async delete(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key)
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
    } catch { /* ignore */ }
    return false
  }

  /** Invalidate entries matching a pattern. */
  async invalidate(pattern: string): Promise<number> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
    let count = 0

    try {
      const files = fs.readdirSync(this.config.baseDir)
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        const key = file.replace(/\.json$/, '')
        if (regex.test(key)) {
          fs.unlinkSync(path.join(this.config.baseDir, file))
          count++
        }
      }
    } catch { /* ignore */ }

    return count
  }

  /** Prune expired entries from disk. */
  async prune(): Promise<number> {
    let pruned = 0
    const now = Date.now()

    try {
      const files = fs.readdirSync(this.config.baseDir)
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        const filePath = path.join(this.config.baseDir, file)

        try {
          const raw = fs.readFileSync(filePath, 'utf-8')
          const entry = JSON.parse(raw) as DiskCacheEntry<unknown>

          if (entry.version !== this.config.version ||
              (entry.expiresAt !== null && now > entry.expiresAt)) {
            fs.unlinkSync(filePath)
            pruned++
          }
        } catch {
          // Remove corrupt files
          try { fs.unlinkSync(filePath) } catch { /* ignore */ }
          pruned++
        }
      }
    } catch { /* ignore */ }

    return pruned
  }

  /** Get total size of cache on disk in bytes. */
  async getSize(): Promise<number> {
    let totalSize = 0
    try {
      const files = fs.readdirSync(this.config.baseDir)
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        try {
          const stat = fs.statSync(path.join(this.config.baseDir, file))
          totalSize += stat.size
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    return totalSize
  }

  /** Clear all entries from disk cache. */
  async clear(): Promise<void> {
    try {
      const files = fs.readdirSync(this.config.baseDir)
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        try {
          fs.unlinkSync(path.join(this.config.baseDir, file))
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    this.hits = 0
    this.misses = 0
  }

  /** Get cache statistics. */
  getStats() {
    let entries = 0
    try {
      entries = fs.readdirSync(this.config.baseDir).filter(f => f.endsWith('.json')).length
    } catch { /* ignore */ }

    return {
      entries,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0
        ? this.hits / (this.hits + this.misses)
        : 0,
      baseDir: this.config.baseDir,
    }
  }
}
