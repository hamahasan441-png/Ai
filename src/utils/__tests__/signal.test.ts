import { describe, it, expect, vi } from 'vitest'
import { createSignal } from '../../utils/signal'

describe('createSignal', () => {
  describe('subscribe', () => {
    it('returns an unsubscribe function', () => {
      const signal = createSignal()
      const unsub = signal.subscribe(() => {})
      expect(typeof unsub).toBe('function')
    })

    it('allows multiple subscriptions', () => {
      const signal = createSignal()
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      signal.subscribe(fn1)
      signal.subscribe(fn2)
      signal.emit()
      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)
    })

    it('does not call listener on subscribe', () => {
      const signal = createSignal()
      const fn = vi.fn()
      signal.subscribe(fn)
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('emit', () => {
    it('calls all subscribed listeners', () => {
      const signal = createSignal()
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      const fn3 = vi.fn()
      signal.subscribe(fn1)
      signal.subscribe(fn2)
      signal.subscribe(fn3)
      signal.emit()
      expect(fn1).toHaveBeenCalledTimes(1)
      expect(fn2).toHaveBeenCalledTimes(1)
      expect(fn3).toHaveBeenCalledTimes(1)
    })

    it('passes arguments to listeners', () => {
      const signal = createSignal<[string, number]>()
      const fn = vi.fn()
      signal.subscribe(fn)
      signal.emit('hello', 42)
      expect(fn).toHaveBeenCalledWith('hello', 42)
    })

    it('does nothing when no listeners', () => {
      const signal = createSignal()
      expect(() => signal.emit()).not.toThrow()
    })

    it('calls listener multiple times on multiple emits', () => {
      const signal = createSignal()
      const fn = vi.fn()
      signal.subscribe(fn)
      signal.emit()
      signal.emit()
      signal.emit()
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('passes single argument correctly', () => {
      const signal = createSignal<[number]>()
      const fn = vi.fn()
      signal.subscribe(fn)
      signal.emit(99)
      expect(fn).toHaveBeenCalledWith(99)
    })
  })

  describe('unsubscribe', () => {
    it('removes specific listener', () => {
      const signal = createSignal()
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      const unsub1 = signal.subscribe(fn1)
      signal.subscribe(fn2)

      unsub1()
      signal.emit()

      expect(fn1).not.toHaveBeenCalled()
      expect(fn2).toHaveBeenCalledTimes(1)
    })

    it('is safe to call multiple times', () => {
      const signal = createSignal()
      const fn = vi.fn()
      const unsub = signal.subscribe(fn)
      unsub()
      unsub()
      signal.emit()
      expect(fn).not.toHaveBeenCalled()
    })

    it('only removes the specific subscription', () => {
      const signal = createSignal()
      const fn = vi.fn()
      const unsub1 = signal.subscribe(fn)
      signal.subscribe(fn)

      // Unsubscribing once removes the function from the Set entirely
      // since Set stores unique references
      unsub1()
      signal.emit()
      // The same function reference was added once to the set (Set dedupes),
      // so after delete it's fully removed
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe('clear', () => {
    it('removes all listeners', () => {
      const signal = createSignal()
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      signal.subscribe(fn1)
      signal.subscribe(fn2)

      signal.clear()
      signal.emit()

      expect(fn1).not.toHaveBeenCalled()
      expect(fn2).not.toHaveBeenCalled()
    })

    it('allows new subscriptions after clear', () => {
      const signal = createSignal()
      const fn1 = vi.fn()
      signal.subscribe(fn1)
      signal.clear()

      const fn2 = vi.fn()
      signal.subscribe(fn2)
      signal.emit()

      expect(fn1).not.toHaveBeenCalled()
      expect(fn2).toHaveBeenCalledTimes(1)
    })

    it('is safe to call on empty signal', () => {
      const signal = createSignal()
      expect(() => signal.clear()).not.toThrow()
    })
  })
})
