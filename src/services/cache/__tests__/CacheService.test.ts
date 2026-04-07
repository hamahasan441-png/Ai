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

import { CacheService } from '../CacheService.js'

describe('CacheService', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cache-svc-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('memory-only mode', () => {
    it('works without disk cache', async () => {
      const svc = new CacheService({ enableDisk: false })
      await svc.set('key', 'value')
      expect(await svc.get('key')).toBe('value')
    })

    it('disk stats are null when disk is disabled', () => {
      const svc = new CacheService({ enableDisk: false })
      expect(svc.getStats().disk).toBeNull()
    })
  })

  describe('get', () => {
    it('returns undefined for missing keys', async () => {
      const svc = new CacheService({ enableDisk: false })
      expect(await svc.get('missing')).toBeUndefined()
    })

    it('promotes L2 hits to L1', async () => {
      const svc = new CacheService({ enableDisk: true })
      // Write only to disk tier
      await svc.set('disk-only', 'from-disk', { tier: 'disk' })

      // First get should read from disk and promote
      const val = await svc.get('disk-only')
      expect(val).toBe('from-disk')

      // Now it should be in memory stats (the L1 hit comes from memory)
      const stats = svc.getStats()
      expect(stats.memory.entries).toBe(1)
    })
  })

  describe('set and get round-trips', () => {
    it('stores in memory and retrieves', async () => {
      const svc = new CacheService({ enableDisk: false })
      await svc.set('key', { nested: [1, 2, 3] })
      expect(await svc.get('key')).toEqual({ nested: [1, 2, 3] })
    })

    it('stores in both tiers by default', async () => {
      const svc = new CacheService({ enableDisk: true })
      await svc.set('both', 'val')

      // Verify memory has it
      expect(await svc.get('both', 'memory')).toBe('val')
      // Verify disk has it
      expect(await svc.get('both', 'disk')).toBe('val')
    })

    it('respects tier option for memory-only writes', async () => {
      const svc = new CacheService({ enableDisk: true })
      await svc.set('mem-only', 'val', { tier: 'memory' })

      expect(await svc.get('mem-only', 'memory')).toBe('val')
      expect(await svc.get('mem-only', 'disk')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('returns true when key is in memory', async () => {
      const svc = new CacheService({ enableDisk: false })
      await svc.set('k', 'v')
      expect(await svc.has('k')).toBe(true)
    })

    it('returns false for missing keys', async () => {
      const svc = new CacheService({ enableDisk: false })
      expect(await svc.has('nope')).toBe(false)
    })
  })

  describe('withCache', () => {
    it('computes on miss and caches the result', async () => {
      const svc = new CacheService({ enableDisk: false })
      const fn = vi.fn().mockResolvedValue('computed')

      const result = await svc.withCache('key', fn)
      expect(result).toBe('computed')
      expect(fn).toHaveBeenCalledOnce()
    })

    it('returns cached value on hit without recomputing', async () => {
      const svc = new CacheService({ enableDisk: false })
      const fn = vi.fn().mockResolvedValue('computed')

      await svc.withCache('key', fn)
      const second = await svc.withCache('key', fn)

      expect(second).toBe('computed')
      expect(fn).toHaveBeenCalledOnce()
    })
  })

  describe('delete', () => {
    it('removes from all tiers', async () => {
      const svc = new CacheService({ enableDisk: true })
      await svc.set('key', 'val')
      expect(await svc.delete('key')).toBe(true)
      expect(await svc.get('key')).toBeUndefined()
    })

    it('returns false for missing key', async () => {
      const svc = new CacheService({ enableDisk: false })
      expect(await svc.delete('nope')).toBe(false)
    })
  })

  describe('invalidate', () => {
    it('invalidates matching entries from all tiers', async () => {
      const svc = new CacheService({ enableDisk: false })
      await svc.set('user:1', 'a')
      await svc.set('user:2', 'b')
      await svc.set('post:1', 'c')

      const count = await svc.invalidate('user:*')
      expect(count).toBe(2)
      expect(await svc.get('post:1')).toBe('c')
    })
  })

  describe('stats tracking', () => {
    it('reports combined stats', async () => {
      const svc = new CacheService({ enableDisk: false })
      await svc.set('k', 'v')
      await svc.get('k')
      await svc.get('miss')

      const stats = svc.getStats()
      expect(stats.totalHits).toBe(1)
      expect(stats.totalMisses).toBe(1)
      expect(stats.memory.entries).toBe(1)
    })
  })

  describe('clear', () => {
    it('resets everything', async () => {
      const svc = new CacheService({ enableDisk: false })
      await svc.set('a', 1)
      await svc.set('b', 2)
      await svc.get('a')

      await svc.clear()

      expect(await svc.get('a')).toBeUndefined()
      expect(svc.getStats().memory.entries).toBe(0)
      expect(svc.getStats().memory.hits).toBe(0)
    })
  })

  describe('prune', () => {
    it('prunes expired entries from all tiers', async () => {
      vi.useFakeTimers()
      try {
        const svc = new CacheService({
          enableDisk: false,
          memory: { defaultTtlMs: 100 },
        })
        await svc.set('short', 'v')

        vi.advanceTimersByTime(200)
        const pruned = await svc.prune()
        expect(pruned).toBe(1)
      } finally {
        vi.useRealTimers()
      }
    })
  })
})
