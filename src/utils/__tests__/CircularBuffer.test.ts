import { describe, it, expect } from 'vitest'
import { CircularBuffer } from '../../utils/CircularBuffer'

describe('CircularBuffer', () => {
  describe('constructor', () => {
    it('creates an empty buffer with given capacity', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.length()).toBe(0)
      expect(buf.toArray()).toEqual([])
    })

    it('works with capacity of 1', () => {
      const buf = new CircularBuffer<string>(1)
      buf.add('a')
      expect(buf.toArray()).toEqual(['a'])
      buf.add('b')
      expect(buf.toArray()).toEqual(['b'])
    })
  })

  describe('add', () => {
    it('adds items within capacity', () => {
      const buf = new CircularBuffer<number>(3)
      buf.add(1)
      buf.add(2)
      expect(buf.toArray()).toEqual([1, 2])
      expect(buf.length()).toBe(2)
    })

    it('evicts oldest item when at capacity', () => {
      const buf = new CircularBuffer<number>(3)
      buf.add(1)
      buf.add(2)
      buf.add(3)
      buf.add(4)
      expect(buf.toArray()).toEqual([2, 3, 4])
    })

    it('continues evicting correctly well past capacity', () => {
      const buf = new CircularBuffer<number>(3)
      for (let i = 1; i <= 10; i++) {
        buf.add(i)
      }
      expect(buf.toArray()).toEqual([8, 9, 10])
      expect(buf.length()).toBe(3)
    })

    it('wraps around correctly', () => {
      const buf = new CircularBuffer<string>(2)
      buf.add('a')
      buf.add('b')
      buf.add('c')
      buf.add('d')
      expect(buf.toArray()).toEqual(['c', 'd'])
    })
  })

  describe('addAll', () => {
    it('adds all items within capacity', () => {
      const buf = new CircularBuffer<number>(5)
      buf.addAll([1, 2, 3])
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('evicts old items when exceeding capacity', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2, 3, 4, 5])
      expect(buf.toArray()).toEqual([3, 4, 5])
    })

    it('appends to existing items', () => {
      const buf = new CircularBuffer<number>(4)
      buf.add(1)
      buf.addAll([2, 3])
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('handles empty array', () => {
      const buf = new CircularBuffer<number>(3)
      buf.add(1)
      buf.addAll([])
      expect(buf.toArray()).toEqual([1])
    })
  })

  describe('getRecent', () => {
    it('returns fewer items when buffer has less than requested', () => {
      const buf = new CircularBuffer<number>(5)
      buf.add(1)
      buf.add(2)
      expect(buf.getRecent(4)).toEqual([1, 2])
    })

    it('returns exact count when available', () => {
      const buf = new CircularBuffer<number>(5)
      buf.addAll([1, 2, 3, 4, 5])
      expect(buf.getRecent(3)).toEqual([3, 4, 5])
    })

    it('returns all items when count exceeds size', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2])
      expect(buf.getRecent(10)).toEqual([1, 2])
    })

    it('returns most recent after wrapping', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2, 3, 4, 5])
      expect(buf.getRecent(2)).toEqual([4, 5])
    })

    it('returns empty array when buffer is empty', () => {
      const buf = new CircularBuffer<number>(3)
      expect(buf.getRecent(5)).toEqual([])
    })

    it('returns 0 items when count is 0', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2, 3])
      expect(buf.getRecent(0)).toEqual([])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty buffer', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.toArray()).toEqual([])
    })

    it('returns items in insertion order when partially filled', () => {
      const buf = new CircularBuffer<number>(5)
      buf.addAll([10, 20, 30])
      expect(buf.toArray()).toEqual([10, 20, 30])
    })

    it('returns items in order when full', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2, 3])
      expect(buf.toArray()).toEqual([1, 2, 3])
    })

    it('returns correct order after wrapping', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2, 3, 4])
      expect(buf.toArray()).toEqual([2, 3, 4])
    })

    it('returns a new array each time', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2, 3])
      const a = buf.toArray()
      const b = buf.toArray()
      expect(a).toEqual(b)
      expect(a).not.toBe(b)
    })
  })

  describe('clear', () => {
    it('empties the buffer', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2, 3])
      buf.clear()
      expect(buf.length()).toBe(0)
      expect(buf.toArray()).toEqual([])
    })

    it('allows adding items after clear', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2, 3])
      buf.clear()
      buf.add(10)
      expect(buf.toArray()).toEqual([10])
      expect(buf.length()).toBe(1)
    })
  })

  describe('length', () => {
    it('starts at 0', () => {
      const buf = new CircularBuffer<number>(5)
      expect(buf.length()).toBe(0)
    })

    it('grows as items are added', () => {
      const buf = new CircularBuffer<number>(5)
      buf.add(1)
      expect(buf.length()).toBe(1)
      buf.add(2)
      expect(buf.length()).toBe(2)
    })

    it('does not exceed capacity', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2, 3, 4, 5])
      expect(buf.length()).toBe(3)
    })

    it('resets to 0 after clear', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2, 3])
      buf.clear()
      expect(buf.length()).toBe(0)
    })

    it('tracks correctly through add/clear cycles', () => {
      const buf = new CircularBuffer<number>(3)
      buf.addAll([1, 2])
      expect(buf.length()).toBe(2)
      buf.clear()
      expect(buf.length()).toBe(0)
      buf.add(10)
      expect(buf.length()).toBe(1)
    })
  })
})
