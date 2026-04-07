import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

let tmpDir: string

vi.mock('../../../utils/paths.js', () => ({
  getDiskCachePath: () => tmpDir,
  ensureDir: (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  },
}))

import { DiskCache } from '../DiskCache.js'

describe('DiskCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'disk-cache-test-'))
  })

  afterEach(() => {
    vi.useRealTimers()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('basic async get/set/has/delete', () => {
    it('returns undefined for missing keys', async () => {
      const cache = new DiskCache()
      expect(await cache.get('missing')).toBeUndefined()
    })

    it('stores and retrieves a value', async () => {
      const cache = new DiskCache()
      await cache.set('key1', { data: 'hello' })
      expect(await cache.get('key1')).toEqual({ data: 'hello' })
    })

    it('has returns true for existing keys', async () => {
      const cache = new DiskCache()
      await cache.set('key1', 42)
      expect(await cache.has('key1')).toBe(true)
      expect(await cache.has('nope')).toBe(false)
    })

    it('delete removes a key', async () => {
      const cache = new DiskCache()
      await cache.set('key1', 'val')
      expect(await cache.delete('key1')).toBe(true)
      expect(await cache.get('key1')).toBeUndefined()
    })

    it('delete returns false for missing key', async () => {
      const cache = new DiskCache()
      expect(await cache.delete('nope')).toBe(false)
    })
  })

  describe('TTL expiry', () => {
    it('returns undefined for expired entries', async () => {
      const cache = new DiskCache({ defaultTtlMs: 1000 })
      await cache.set('ttl-key', 'val')

      expect(await cache.get('ttl-key')).toBe('val')

      vi.advanceTimersByTime(1001)
      expect(await cache.get('ttl-key')).toBeUndefined()
    })

    it('respects per-key TTL override', async () => {
      const cache = new DiskCache({ defaultTtlMs: 10000 })
      await cache.set('short', 'v', 500)

      vi.advanceTimersByTime(501)
      expect(await cache.get('short')).toBeUndefined()
    })
  })

  describe('version invalidation', () => {
    it('returns undefined when cache version mismatches', async () => {
      const v1 = new DiskCache({ version: 1 })
      await v1.set('key', 'old-value')

      const v2 = new DiskCache({ version: 2 })
      expect(await v2.get('key')).toBeUndefined()
    })

    it('cleans up mismatched-version files on read', async () => {
      const v1 = new DiskCache({ version: 1 })
      await v1.set('key', 'old')

      const v2 = new DiskCache({ version: 2 })
      await v2.get('key')

      // The file should have been removed by v2.get
      const v1Again = new DiskCache({ version: 1 })
      expect(await v1Again.get('key')).toBeUndefined()
    })
  })

  describe('prune expired entries', () => {
    it('removes expired entries from disk', async () => {
      const cache = new DiskCache({ defaultTtlMs: 1000 })
      await cache.set('short', 'v')
      await cache.set('long', 'v', 99999)

      vi.advanceTimersByTime(1500)
      const pruned = await cache.prune()

      expect(pruned).toBe(1)
      expect(await cache.has('short')).toBe(false)
      expect(await cache.has('long')).toBe(true)
    })

    it('returns 0 when nothing to prune', async () => {
      const cache = new DiskCache()
      await cache.set('a', 1)
      expect(await cache.prune()).toBe(0)
    })
  })

  describe('clear all entries', () => {
    it('removes all entries and resets stats', async () => {
      const cache = new DiskCache()
      await cache.set('a', 1)
      await cache.set('b', 2)
      await cache.get('a') // hit
      await cache.get('x') // miss

      await cache.clear()

      // Stats should be reset immediately after clear
      const stats = cache.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)

      // Cleared entries are gone
      expect(await cache.get('a')).toBeUndefined()
      expect(await cache.get('b')).toBeUndefined()
    })
  })

  describe('stats tracking', () => {
    it('tracks hits and misses', async () => {
      const cache = new DiskCache()
      await cache.set('k', 'v')
      await cache.get('k')    // hit
      await cache.get('miss') // miss

      const stats = cache.getStats()
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(0.5)
    })

    it('reports entry count', async () => {
      const cache = new DiskCache()
      await cache.set('a', 1)
      await cache.set('b', 2)

      expect(cache.getStats().entries).toBe(2)
    })

    it('reports baseDir', async () => {
      const cache = new DiskCache()
      expect(cache.getStats().baseDir).toBe(tmpDir)
    })
  })

  describe('getSize', () => {
    it('returns total size of cache files', async () => {
      const cache = new DiskCache()
      await cache.set('data', { big: 'payload'.repeat(100) })

      const size = await cache.getSize()
      expect(size).toBeGreaterThan(0)
    })
  })
})
