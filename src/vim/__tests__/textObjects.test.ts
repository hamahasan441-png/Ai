import { describe, it, expect, vi } from 'vitest'

// Mock transitive dependencies that are not installed in the test environment
vi.mock('emoji-regex', () => ({ default: () => /(?!)/g }))
vi.mock('get-east-asian-width', () => ({ eastAsianWidth: () => 1 }))
vi.mock('strip-ansi', () => ({ default: (s: string) => s }))
vi.mock('wrap-ansi', () => ({ default: (s: string) => s }))

import { findTextObject } from '../../vim/textObjects'

describe('findTextObject', () => {
  describe('w (word object)', () => {
    it('inner: selects just the word when cursor is in the middle', () => {
      const text = 'hello world foo'
      const result = findTextObject(text, 7, 'w', true) // 'o' in 'world'
      expect(result).toEqual({ start: 6, end: 11 })
    })

    it('inner: selects word at the start of text', () => {
      const text = 'hello world'
      const result = findTextObject(text, 2, 'w', true) // 'l' in 'hello'
      expect(result).toEqual({ start: 0, end: 5 })
    })

    it('around: includes trailing whitespace', () => {
      const text = 'hello world foo'
      const result = findTextObject(text, 1, 'w', false) // 'e' in 'hello'
      expect(result).toEqual({ start: 0, end: 6 }) // 'hello '
    })

    it('around: includes leading whitespace if no trailing', () => {
      const text = 'hello world'
      const result = findTextObject(text, 8, 'w', false) // 'r' in 'world'
      expect(result).toEqual({ start: 5, end: 11 }) // ' world'
    })

    it('handles single character word', () => {
      const text = 'a b c'
      const result = findTextObject(text, 0, 'w', true)
      expect(result).toEqual({ start: 0, end: 1 })
    })

    it('selects punctuation as separate word', () => {
      const text = 'foo.bar'
      const result = findTextObject(text, 3, 'w', true) // '.'
      expect(result).toEqual({ start: 3, end: 4 })
    })
  })

  describe('W (WORD object)', () => {
    it('inner: treats non-whitespace as word chars', () => {
      const text = 'foo.bar baz'
      const result = findTextObject(text, 3, 'W', true) // '.' in 'foo.bar'
      expect(result).toEqual({ start: 0, end: 7 })
    })

    it('around: includes trailing whitespace', () => {
      const text = 'foo.bar baz'
      const result = findTextObject(text, 1, 'W', false)
      expect(result).toEqual({ start: 0, end: 8 }) // 'foo.bar '
    })
  })

  describe('" (double quote object)', () => {
    it('inner: selects content without quotes', () => {
      const text = 'say "hello world" now'
      const result = findTextObject(text, 7, '"', true) // 'e' in 'hello'
      expect(result).toEqual({ start: 5, end: 16 })
    })

    it('around: includes the quotes', () => {
      const text = 'say "hello world" now'
      const result = findTextObject(text, 7, '"', false)
      expect(result).toEqual({ start: 4, end: 17 })
    })

    it('works when cursor is on the opening quote', () => {
      const text = '"hello"'
      const result = findTextObject(text, 0, '"', true)
      expect(result).toEqual({ start: 1, end: 6 })
    })

    it('works when cursor is on the closing quote', () => {
      const text = '"hello"'
      const result = findTextObject(text, 6, '"', true)
      expect(result).toEqual({ start: 1, end: 6 })
    })

    it('returns null when no quotes found', () => {
      const text = 'no quotes here'
      const result = findTextObject(text, 3, '"', true)
      expect(result).toBeNull()
    })

    it('returns null when only one quote exists', () => {
      const text = 'only "one'
      const result = findTextObject(text, 6, '"', true)
      expect(result).toBeNull()
    })
  })

  describe("' (single quote object)", () => {
    it('inner: selects content between single quotes', () => {
      const text = "say 'hello' now"
      const result = findTextObject(text, 6, "'", true) // 'l' in 'hello'
      expect(result).toEqual({ start: 5, end: 10 })
    })

    it('around: includes the single quotes', () => {
      const text = "say 'hello' now"
      const result = findTextObject(text, 6, "'", false)
      expect(result).toEqual({ start: 4, end: 11 })
    })
  })

  describe('( and b (paren object)', () => {
    it('inner: selects content without parens', () => {
      const text = 'call(arg1, arg2)'
      const result = findTextObject(text, 6, '(', true) // 'r' in 'arg1'
      expect(result).toEqual({ start: 5, end: 15 })
    })

    it('around: includes the parens', () => {
      const text = 'call(arg1, arg2)'
      const result = findTextObject(text, 6, '(', false)
      expect(result).toEqual({ start: 4, end: 16 })
    })

    it('b is alias for parens (inner)', () => {
      const text = 'call(arg1, arg2)'
      const resultB = findTextObject(text, 6, 'b', true)
      const resultParen = findTextObject(text, 6, '(', true)
      expect(resultB).toEqual(resultParen)
    })

    it(') also selects parens', () => {
      const text = 'call(arg1, arg2)'
      const resultClose = findTextObject(text, 6, ')', true)
      const resultOpen = findTextObject(text, 6, '(', true)
      expect(resultClose).toEqual(resultOpen)
    })
  })

  describe('{ and B (brace object)', () => {
    it('inner: selects content inside braces', () => {
      const text = 'if {body}'
      const result = findTextObject(text, 4, '{', true)
      expect(result).toEqual({ start: 4, end: 8 })
    })

    it('around: includes the braces', () => {
      const text = 'if {body}'
      const result = findTextObject(text, 4, '{', false)
      expect(result).toEqual({ start: 3, end: 9 })
    })

    it('B is alias for braces', () => {
      const text = 'if {body}'
      const resultB = findTextObject(text, 4, 'B', true)
      const resultBrace = findTextObject(text, 4, '{', true)
      expect(resultB).toEqual(resultBrace)
    })
  })

  describe('[ (bracket object)', () => {
    it('inner: selects content inside brackets', () => {
      const text = 'arr[0]'
      const result = findTextObject(text, 4, '[', true) // '0'
      expect(result).toEqual({ start: 4, end: 5 })
    })

    it('around: includes the brackets', () => {
      const text = 'arr[0]'
      const result = findTextObject(text, 4, '[', false)
      expect(result).toEqual({ start: 3, end: 6 })
    })

    it('] also selects brackets', () => {
      const text = 'arr[0]'
      const resultClose = findTextObject(text, 4, ']', true)
      const resultOpen = findTextObject(text, 4, '[', true)
      expect(resultClose).toEqual(resultOpen)
    })
  })

  describe('< (angle bracket object)', () => {
    it('inner: selects content inside angle brackets', () => {
      const text = '<div>'
      const result = findTextObject(text, 2, '<', true)
      expect(result).toEqual({ start: 1, end: 4 })
    })

    it('around: includes the angle brackets', () => {
      const text = '<div>'
      const result = findTextObject(text, 2, '<', false)
      expect(result).toEqual({ start: 0, end: 5 })
    })
  })

  describe('nested brackets', () => {
    it('selects innermost pair', () => {
      const text = '((inner))'
      const result = findTextObject(text, 3, '(', true) // inside inner parens
      expect(result).toEqual({ start: 2, end: 7 })
    })

    it('selects outer pair when cursor is between pairs', () => {
      const text = '(a (b) c)'
      const result = findTextObject(text, 1, '(', true) // 'a' - inside outer parens
      expect(result).toEqual({ start: 1, end: 8 })
    })
  })

  describe('no matching delimiters', () => {
    it('returns null for unmatched opening bracket', () => {
      const text = '(no closing'
      const result = findTextObject(text, 2, '(', true)
      expect(result).toBeNull()
    })

    it('returns null for unmatched closing bracket', () => {
      const text = 'no opening)'
      const result = findTextObject(text, 3, '(', true)
      expect(result).toBeNull()
    })

    it('returns null for missing braces', () => {
      const text = 'no braces here'
      const result = findTextObject(text, 5, '{', true)
      expect(result).toBeNull()
    })
  })

  describe('unknown object type', () => {
    it('returns null for unrecognized type', () => {
      const result = findTextObject('hello', 2, 'z', true)
      expect(result).toBeNull()
    })

    it('returns null for empty type', () => {
      const result = findTextObject('hello', 2, '', true)
      expect(result).toBeNull()
    })
  })

  describe('` (backtick object)', () => {
    it('inner: selects content between backticks', () => {
      const text = 'use `code` here'
      const result = findTextObject(text, 6, '`', true) // 'o' in 'code'
      expect(result).toEqual({ start: 5, end: 9 })
    })

    it('around: includes the backticks', () => {
      const text = 'use `code` here'
      const result = findTextObject(text, 6, '`', false)
      expect(result).toEqual({ start: 4, end: 10 })
    })
  })

  describe('edge cases', () => {
    it('empty content between delimiters (inner)', () => {
      const text = '()'
      const result = findTextObject(text, 0, '(', true)
      expect(result).toEqual({ start: 1, end: 1 })
    })

    it('empty content between delimiters (around)', () => {
      const text = '()'
      const result = findTextObject(text, 0, '(', false)
      expect(result).toEqual({ start: 0, end: 2 })
    })

    it('empty quotes (inner)', () => {
      const text = '""'
      const result = findTextObject(text, 0, '"', true)
      expect(result).toEqual({ start: 1, end: 1 })
    })
  })
})
