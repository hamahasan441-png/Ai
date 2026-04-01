import { describe, it, expect } from 'vitest'
import {
  escapeRegExp,
  capitalize,
  plural,
  firstLineOf,
  countCharInString,
  normalizeFullWidthDigits,
  normalizeFullWidthSpace,
  safeJoinLines,
  EndTruncatingAccumulator,
  truncateToLines,
} from '../../utils/stringUtils'

describe('escapeRegExp', () => {
  it('returns empty string unchanged', () => {
    expect(escapeRegExp('')).toBe('')
  })

  it('returns plain string unchanged', () => {
    expect(escapeRegExp('hello')).toBe('hello')
  })

  it('escapes dots', () => {
    expect(escapeRegExp('a.b')).toBe('a\\.b')
  })

  it('escapes all special regex characters', () => {
    const special = '.*+?^${}()|[]\\'
    const escaped = escapeRegExp(special)
    // The escaped string should work as a literal RegExp pattern
    const re = new RegExp(escaped)
    expect(re.test(special)).toBe(true)
  })

  it('escapes brackets and pipes', () => {
    expect(escapeRegExp('[a|b]')).toBe('\\[a\\|b\\]')
  })

  it('handles mixed special and normal characters', () => {
    expect(escapeRegExp('file.ts (copy)')).toBe('file\\.ts \\(copy\\)')
  })
})

describe('capitalize', () => {
  it('capitalizes lowercase first character', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('leaves already capitalized string unchanged', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('does not lowercase remaining characters', () => {
    expect(capitalize('fooBar')).toBe('FooBar')
  })

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A')
  })

  it('handles empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('handles string starting with number', () => {
    expect(capitalize('1abc')).toBe('1abc')
  })
})

describe('plural', () => {
  it('returns singular for n=1', () => {
    expect(plural(1, 'file')).toBe('file')
  })

  it('returns default plural (appends s) for n>1', () => {
    expect(plural(3, 'file')).toBe('files')
  })

  it('returns default plural for n=0', () => {
    expect(plural(0, 'file')).toBe('files')
  })

  it('uses custom plural word when provided', () => {
    expect(plural(2, 'entry', 'entries')).toBe('entries')
  })

  it('returns singular even with custom plural when n=1', () => {
    expect(plural(1, 'entry', 'entries')).toBe('entry')
  })

  it('handles negative numbers as non-singular', () => {
    expect(plural(-1, 'item')).toBe('items')
  })
})

describe('firstLineOf', () => {
  it('returns entire string when no newline', () => {
    expect(firstLineOf('hello world')).toBe('hello world')
  })

  it('returns first line of multi-line string', () => {
    expect(firstLineOf('line1\nline2\nline3')).toBe('line1')
  })

  it('returns empty string when input starts with newline', () => {
    expect(firstLineOf('\nrest')).toBe('')
  })

  it('handles empty string', () => {
    expect(firstLineOf('')).toBe('')
  })

  it('handles string with only newline', () => {
    expect(firstLineOf('\n')).toBe('')
  })

  it('does not include carriage return before newline', () => {
    // \r is not stripped since only \n is checked
    expect(firstLineOf('line1\r\nline2')).toBe('line1\r')
  })
})

describe('countCharInString', () => {
  it('returns 0 for empty string', () => {
    expect(countCharInString('', 'a')).toBe(0)
  })

  it('returns 0 when char is not present', () => {
    expect(countCharInString('hello', 'x')).toBe(0)
  })

  it('counts single occurrence', () => {
    expect(countCharInString('hello', 'h')).toBe(1)
  })

  it('counts multiple occurrences', () => {
    expect(countCharInString('banana', 'a')).toBe(3)
  })

  it('counts newlines', () => {
    expect(countCharInString('a\nb\nc\n', '\n')).toBe(3)
  })

  it('respects start parameter', () => {
    expect(countCharInString('aabaa', 'a', 2)).toBe(2)
  })

  it('returns 0 when start is beyond string length', () => {
    expect(countCharInString('hello', 'h', 100)).toBe(0)
  })
})

describe('normalizeFullWidthDigits', () => {
  it('converts full-width digits to half-width', () => {
    expect(normalizeFullWidthDigits('０１２３４５６７８９')).toBe('0123456789')
  })

  it('leaves half-width digits unchanged', () => {
    expect(normalizeFullWidthDigits('0123')).toBe('0123')
  })

  it('handles mixed content', () => {
    expect(normalizeFullWidthDigits('Line ３ of ５')).toBe('Line 3 of 5')
  })

  it('returns empty string for empty input', () => {
    expect(normalizeFullWidthDigits('')).toBe('')
  })

  it('leaves non-digit text unchanged', () => {
    expect(normalizeFullWidthDigits('hello')).toBe('hello')
  })
})

describe('normalizeFullWidthSpace', () => {
  it('converts full-width space to half-width', () => {
    expect(normalizeFullWidthSpace('a\u3000b')).toBe('a b')
  })

  it('converts multiple full-width spaces', () => {
    expect(normalizeFullWidthSpace('\u3000\u3000')).toBe('  ')
  })

  it('leaves regular spaces unchanged', () => {
    expect(normalizeFullWidthSpace('a b')).toBe('a b')
  })

  it('returns empty string for empty input', () => {
    expect(normalizeFullWidthSpace('')).toBe('')
  })

  it('handles mixed spaces', () => {
    expect(normalizeFullWidthSpace('a b\u3000c')).toBe('a b c')
  })
})

describe('safeJoinLines', () => {
  it('joins lines with default comma delimiter', () => {
    expect(safeJoinLines(['a', 'b', 'c'])).toBe('a,b,c')
  })

  it('joins lines with custom delimiter', () => {
    expect(safeJoinLines(['a', 'b', 'c'], '\n')).toBe('a\nb\nc')
  })

  it('returns empty string for empty array', () => {
    expect(safeJoinLines([])).toBe('')
  })

  it('returns single line without delimiter', () => {
    expect(safeJoinLines(['only'])).toBe('only')
  })

  it('truncates when exceeding maxSize', () => {
    const result = safeJoinLines(['hello', 'world', 'more'], ',', 12)
    expect(result.length).toBeLessThanOrEqual(
      12 + '...[truncated]'.length + 1,
    )
    expect(result).toContain('...[truncated]')
  })

  it('includes truncation marker on overflow', () => {
    const result = safeJoinLines(['aaaa', 'bbbb', 'cccc'], ',', 10)
    expect(result).toContain('...[truncated]')
  })

  it('handles case where no room for any of the truncated line', () => {
    // maxSize is just the length of the first line, so second line triggers truncation
    const result = safeJoinLines(['abc', 'def'], ',', 4)
    expect(result).toContain('...[truncated]')
  })
})

describe('EndTruncatingAccumulator', () => {
  it('accumulates strings normally within limit', () => {
    const acc = new EndTruncatingAccumulator(100)
    acc.append('hello ')
    acc.append('world')
    expect(acc.toString()).toBe('hello world')
  })

  it('reports correct length', () => {
    const acc = new EndTruncatingAccumulator(100)
    acc.append('12345')
    expect(acc.length).toBe(5)
  })

  it('truncates when exceeding maxSize', () => {
    const acc = new EndTruncatingAccumulator(10)
    acc.append('12345')
    acc.append('67890')
    acc.append('XXXXX')
    expect(acc.truncated).toBe(true)
    expect(acc.length).toBe(10)
  })

  it('includes truncation marker in toString when truncated', () => {
    const acc = new EndTruncatingAccumulator(10)
    acc.append('12345678901234567890')
    expect(acc.toString()).toContain('[output truncated')
  })

  it('returns exact content when not truncated', () => {
    const acc = new EndTruncatingAccumulator(100)
    acc.append('exact')
    expect(acc.toString()).toBe('exact')
    expect(acc.truncated).toBe(false)
  })

  it('tracks totalBytes even after truncation', () => {
    const acc = new EndTruncatingAccumulator(5)
    acc.append('12345')
    acc.append('67890')
    expect(acc.totalBytes).toBe(10)
  })

  it('ignores appends after full truncation', () => {
    const acc = new EndTruncatingAccumulator(5)
    acc.append('12345678')
    const lengthAfterFirst = acc.length
    acc.append('more data')
    expect(acc.length).toBe(lengthAfterFirst)
  })

  it('clear resets all state', () => {
    const acc = new EndTruncatingAccumulator(10)
    acc.append('data')
    acc.clear()
    expect(acc.length).toBe(0)
    expect(acc.truncated).toBe(false)
    expect(acc.totalBytes).toBe(0)
    expect(acc.toString()).toBe('')
  })

  it('partially appends when data crosses the boundary', () => {
    const acc = new EndTruncatingAccumulator(8)
    acc.append('hello')
    acc.append('world')
    // Only 3 chars of "world" fit (8 - 5 = 3)
    expect(acc.length).toBe(8)
    expect(acc.truncated).toBe(true)
  })
})

describe('truncateToLines', () => {
  it('returns text unchanged when under maxLines', () => {
    expect(truncateToLines('a\nb\nc', 5)).toBe('a\nb\nc')
  })

  it('returns text unchanged when exactly at maxLines', () => {
    expect(truncateToLines('a\nb\nc', 3)).toBe('a\nb\nc')
  })

  it('truncates and adds ellipsis when over maxLines', () => {
    expect(truncateToLines('a\nb\nc\nd', 2)).toBe('a\nb…')
  })

  it('handles single line with maxLines=1', () => {
    expect(truncateToLines('only line', 1)).toBe('only line')
  })

  it('truncates multi-line to single line', () => {
    expect(truncateToLines('a\nb\nc', 1)).toBe('a…')
  })

  it('handles empty string', () => {
    expect(truncateToLines('', 5)).toBe('')
  })

  it('uses unicode ellipsis character', () => {
    const result = truncateToLines('a\nb\nc', 1)
    expect(result.endsWith('…')).toBe(true)
  })
})
