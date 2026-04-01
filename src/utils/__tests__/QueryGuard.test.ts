import { describe, it, expect, vi } from 'vitest'
import { QueryGuard } from '../../utils/QueryGuard'

describe('QueryGuard', () => {
  describe('initial state', () => {
    it('starts idle (isActive=false)', () => {
      const guard = new QueryGuard()
      expect(guard.isActive).toBe(false)
    })

    it('getSnapshot returns false initially', () => {
      const guard = new QueryGuard()
      expect(guard.getSnapshot()).toBe(false)
    })

    it('generation starts at 0', () => {
      const guard = new QueryGuard()
      expect(guard.generation).toBe(0)
    })
  })

  describe('reserve', () => {
    it('transitions idle → dispatching, returns true', () => {
      const guard = new QueryGuard()
      expect(guard.reserve()).toBe(true)
      expect(guard.isActive).toBe(true)
    })

    it('returns false when already dispatching', () => {
      const guard = new QueryGuard()
      guard.reserve()
      expect(guard.reserve()).toBe(false)
    })

    it('returns false when running', () => {
      const guard = new QueryGuard()
      guard.tryStart()
      expect(guard.reserve()).toBe(false)
    })

    it('notifies subscribers', () => {
      const guard = new QueryGuard()
      const fn = vi.fn()
      guard.subscribe(fn)
      guard.reserve()
      expect(fn).toHaveBeenCalled()
    })
  })

  describe('cancelReservation', () => {
    it('transitions dispatching → idle', () => {
      const guard = new QueryGuard()
      guard.reserve()
      guard.cancelReservation()
      expect(guard.isActive).toBe(false)
    })

    it('is a no-op when not dispatching', () => {
      const guard = new QueryGuard()
      guard.cancelReservation()
      expect(guard.isActive).toBe(false)
    })

    it('is a no-op when running', () => {
      const guard = new QueryGuard()
      guard.tryStart()
      guard.cancelReservation()
      expect(guard.isActive).toBe(true)
    })

    it('notifies subscribers', () => {
      const guard = new QueryGuard()
      guard.reserve()
      const fn = vi.fn()
      guard.subscribe(fn)
      guard.cancelReservation()
      expect(fn).toHaveBeenCalled()
    })
  })

  describe('tryStart', () => {
    it('transitions idle → running and returns generation', () => {
      const guard = new QueryGuard()
      const gen = guard.tryStart()
      expect(gen).toBe(1)
      expect(guard.isActive).toBe(true)
      expect(guard.generation).toBe(1)
    })

    it('transitions dispatching → running', () => {
      const guard = new QueryGuard()
      guard.reserve()
      const gen = guard.tryStart()
      expect(gen).toBe(1)
      expect(guard.isActive).toBe(true)
    })

    it('returns null when already running', () => {
      const guard = new QueryGuard()
      guard.tryStart()
      expect(guard.tryStart()).toBeNull()
    })

    it('increments generation on each start', () => {
      const guard = new QueryGuard()
      const gen1 = guard.tryStart()
      guard.end(gen1!)
      const gen2 = guard.tryStart()
      expect(gen2).toBe(2)
    })

    it('notifies subscribers', () => {
      const guard = new QueryGuard()
      const fn = vi.fn()
      guard.subscribe(fn)
      guard.tryStart()
      expect(fn).toHaveBeenCalled()
    })
  })

  describe('end', () => {
    it('transitions running → idle with matching generation', () => {
      const guard = new QueryGuard()
      const gen = guard.tryStart()!
      expect(guard.end(gen)).toBe(true)
      expect(guard.isActive).toBe(false)
    })

    it('returns false with mismatched generation', () => {
      const guard = new QueryGuard()
      const gen = guard.tryStart()!
      guard.forceEnd()
      // generation was incremented by forceEnd, so old gen is stale
      expect(guard.end(gen)).toBe(false)
    })

    it('returns false when not running', () => {
      const guard = new QueryGuard()
      expect(guard.end(1)).toBe(false)
    })

    it('notifies subscribers on successful end', () => {
      const guard = new QueryGuard()
      const gen = guard.tryStart()!
      const fn = vi.fn()
      guard.subscribe(fn)
      guard.end(gen)
      expect(fn).toHaveBeenCalled()
    })

    it('does not notify on failed end', () => {
      const guard = new QueryGuard()
      guard.tryStart()
      const fn = vi.fn()
      guard.subscribe(fn)
      guard.end(999)
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('forceEnd', () => {
    it('transitions running → idle', () => {
      const guard = new QueryGuard()
      guard.tryStart()
      guard.forceEnd()
      expect(guard.isActive).toBe(false)
    })

    it('transitions dispatching → idle', () => {
      const guard = new QueryGuard()
      guard.reserve()
      guard.forceEnd()
      expect(guard.isActive).toBe(false)
    })

    it('is a no-op when already idle', () => {
      const guard = new QueryGuard()
      const genBefore = guard.generation
      guard.forceEnd()
      expect(guard.isActive).toBe(false)
      expect(guard.generation).toBe(genBefore)
    })

    it('increments generation', () => {
      const guard = new QueryGuard()
      guard.tryStart()
      const genBefore = guard.generation
      guard.forceEnd()
      expect(guard.generation).toBe(genBefore + 1)
    })

    it('invalidates stale end calls', () => {
      const guard = new QueryGuard()
      const gen = guard.tryStart()!
      guard.forceEnd()
      // Now start a new query
      guard.tryStart()
      // Stale finally block from the cancelled query
      expect(guard.end(gen)).toBe(false)
    })

    it('notifies subscribers', () => {
      const guard = new QueryGuard()
      guard.tryStart()
      const fn = vi.fn()
      guard.subscribe(fn)
      guard.forceEnd()
      expect(fn).toHaveBeenCalled()
    })
  })

  describe('subscribe / getSnapshot (useSyncExternalStore interface)', () => {
    it('subscribe returns an unsubscribe function', () => {
      const guard = new QueryGuard()
      const unsub = guard.subscribe(() => {})
      expect(typeof unsub).toBe('function')
    })

    it('unsubscribe stops notifications', () => {
      const guard = new QueryGuard()
      const fn = vi.fn()
      const unsub = guard.subscribe(fn)
      unsub()
      guard.reserve()
      expect(fn).not.toHaveBeenCalled()
    })

    it('getSnapshot reflects isActive', () => {
      const guard = new QueryGuard()
      expect(guard.getSnapshot()).toBe(false)
      guard.reserve()
      expect(guard.getSnapshot()).toBe(true)
      guard.cancelReservation()
      expect(guard.getSnapshot()).toBe(false)
    })

    it('getSnapshot is a stable reference', () => {
      const guard = new QueryGuard()
      expect(guard.getSnapshot).toBe(guard.getSnapshot)
    })

    it('subscribe is a stable reference', () => {
      const guard = new QueryGuard()
      expect(guard.subscribe).toBe(guard.subscribe)
    })
  })

  describe('full lifecycle', () => {
    it('idle → reserve → tryStart → end → idle', () => {
      const guard = new QueryGuard()
      expect(guard.isActive).toBe(false)

      guard.reserve()
      expect(guard.isActive).toBe(true)

      const gen = guard.tryStart()!
      expect(guard.isActive).toBe(true)

      guard.end(gen)
      expect(guard.isActive).toBe(false)
    })

    it('idle → tryStart → forceEnd → tryStart → end', () => {
      const guard = new QueryGuard()

      const gen1 = guard.tryStart()!
      expect(guard.generation).toBe(1)

      guard.forceEnd()
      expect(guard.isActive).toBe(false)
      expect(guard.generation).toBe(2)

      const gen2 = guard.tryStart()!
      expect(gen2).toBe(3)

      expect(guard.end(gen2)).toBe(true)
      expect(guard.isActive).toBe(false)
    })
  })
})
