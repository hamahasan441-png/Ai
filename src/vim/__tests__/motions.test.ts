import { describe, it, expect, vi } from 'vitest'

// Mock transitive dependencies that are not installed in the test environment
vi.mock('emoji-regex', () => ({ default: () => /(?!)/g }))
vi.mock('get-east-asian-width', () => ({ eastAsianWidth: () => 1 }))
vi.mock('strip-ansi', () => ({ default: (s: string) => s }))
vi.mock('wrap-ansi', () => ({ default: (s: string) => s }))

import { resolveMotion, isInclusiveMotion, isLinewiseMotion } from '../../vim/motions'
import { Cursor } from '../../utils/Cursor'

/** Helper: create a Cursor with generous column width. */
function makeCursor(text: string, offset = 0): Cursor {
  return Cursor.fromText(text, 80, offset)
}

describe('resolveMotion', () => {
  describe('h (left)', () => {
    it('decrements cursor offset', () => {
      const cursor = makeCursor('hello', 3)
      const result = resolveMotion('h', cursor, 1)
      expect(result.offset).toBe(2)
    })

    it('does not move past beginning of text', () => {
      const cursor = makeCursor('hello', 0)
      const result = resolveMotion('h', cursor, 1)
      expect(result.offset).toBe(0)
    })
  })

  describe('l (right)', () => {
    it('increments cursor offset', () => {
      const cursor = makeCursor('hello', 1)
      const result = resolveMotion('l', cursor, 1)
      expect(result.offset).toBe(2)
    })

    it('does not move past end of text', () => {
      const cursor = makeCursor('hello', 5)
      const result = resolveMotion('l', cursor, 1)
      expect(result.offset).toBe(5)
    })
  })

  describe('j (down logical line)', () => {
    it('moves to next logical line', () => {
      const cursor = makeCursor('line1\nline2\nline3', 0)
      const result = resolveMotion('j', cursor, 1)
      expect(result.offset).toBeGreaterThan(0)
    })
  })

  describe('k (up logical line)', () => {
    it('moves to previous logical line', () => {
      const cursor = makeCursor('line1\nline2\nline3', 7)
      const result = resolveMotion('k', cursor, 1)
      expect(result.offset).toBeLessThan(7)
    })
  })

  describe('w (next word)', () => {
    it('moves to start of next word', () => {
      const cursor = makeCursor('hello world foo', 0)
      const result = resolveMotion('w', cursor, 1)
      expect(result.offset).toBe(6) // 'w' in 'world'
    })

    it('count multiplies the motion', () => {
      const cursor = makeCursor('one two three four', 0)
      const result = resolveMotion('w', cursor, 2)
      expect(result.offset).toBe(8) // 't' in 'three'
    })
  })

  describe('b (previous word)', () => {
    it('moves to start of previous word', () => {
      const cursor = makeCursor('hello world', 6)
      const result = resolveMotion('b', cursor, 1)
      expect(result.offset).toBe(0)
    })
  })

  describe('e (end of word)', () => {
    it('moves to end of current/next word', () => {
      const cursor = makeCursor('hello world', 0)
      const result = resolveMotion('e', cursor, 1)
      expect(result.offset).toBe(4) // 'o' in 'hello'
    })
  })

  describe('$ (end of line)', () => {
    it('moves to end of logical line', () => {
      const cursor = makeCursor('hello\nworld', 0)
      const result = resolveMotion('$', cursor, 1)
      // Should be at end of first logical line
      expect(result.offset).toBe(5)
    })
  })

  describe('0 (start of line)', () => {
    it('moves to start of logical line', () => {
      const cursor = makeCursor('hello\nworld', 8)
      const result = resolveMotion('0', cursor, 1)
      expect(result.offset).toBe(6) // start of 'world'
    })
  })

  describe('^ (first non-blank)', () => {
    it('moves to first non-blank character', () => {
      const cursor = makeCursor('   hello', 6)
      const result = resolveMotion('^', cursor, 1)
      expect(result.offset).toBe(3)
    })
  })

  describe('count multiplier', () => {
    it('applies count 3 to w motion', () => {
      const cursor = makeCursor('a b c d e f', 0)
      const result = resolveMotion('w', cursor, 3)
      expect(result.offset).toBe(6) // 'd'
    })

    it('applies count to h motion', () => {
      const cursor = makeCursor('hello', 4)
      const result = resolveMotion('h', cursor, 3)
      expect(result.offset).toBe(1)
    })

    it('stops early if cursor stops changing (e.g. at boundary)', () => {
      const cursor = makeCursor('hi', 0)
      const result = resolveMotion('h', cursor, 100)
      expect(result.offset).toBe(0)
    })
  })

  describe('unknown key', () => {
    it('returns same cursor for unrecognized motion', () => {
      const cursor = makeCursor('hello', 2)
      const result = resolveMotion('z', cursor, 1)
      expect(result.offset).toBe(2)
    })
  })

  describe('G (go to last line)', () => {
    it('moves to start of last line', () => {
      const cursor = makeCursor('line1\nline2\nline3', 0)
      const result = resolveMotion('G', cursor, 1)
      expect(result.offset).toBe(12) // start of 'line3'
    })
  })
})

describe('isInclusiveMotion', () => {
  it.each(['e', 'E', '$'])('returns true for %s', key => {
    expect(isInclusiveMotion(key)).toBe(true)
  })

  it.each(['h', 'l', 'w', 'b', 'j', 'k', '0', '^'])('returns false for %s', key => {
    expect(isInclusiveMotion(key)).toBe(false)
  })
})

describe('isLinewiseMotion', () => {
  it.each(['j', 'k', 'G', 'gg'])('returns true for %s', key => {
    expect(isLinewiseMotion(key)).toBe(true)
  })

  it.each(['h', 'l', 'w', 'e', '$', '0', '^', 'b'])('returns false for %s', key => {
    expect(isLinewiseMotion(key)).toBe(false)
  })

  it('returns false for gj (characterwise per source comment)', () => {
    expect(isLinewiseMotion('gj')).toBe(false)
  })

  it('returns false for gk (characterwise per source comment)', () => {
    expect(isLinewiseMotion('gk')).toBe(false)
  })
})
