import { describe, it, expect } from 'vitest'
import { djb2Hash, hashContent, hashPair } from '../../utils/hash'

describe('djb2Hash', () => {
  it('returns 0 for empty string', () => {
    expect(djb2Hash('')).toBe(0)
  })

  it('returns a number', () => {
    expect(typeof djb2Hash('hello')).toBe('number')
  })

  it('is deterministic for the same input', () => {
    expect(djb2Hash('test')).toBe(djb2Hash('test'))
  })

  it('produces different hashes for different strings', () => {
    expect(djb2Hash('abc')).not.toBe(djb2Hash('xyz'))
  })

  it('produces different hashes for similar strings', () => {
    expect(djb2Hash('foo')).not.toBe(djb2Hash('fop'))
  })

  it('returns a 32-bit signed integer', () => {
    const hash = djb2Hash('a long string to test bit range')
    expect(hash).toBeGreaterThanOrEqual(-2147483648)
    expect(hash).toBeLessThanOrEqual(2147483647)
    expect(Number.isInteger(hash)).toBe(true)
  })

  it('handles single character', () => {
    const hash = djb2Hash('a')
    expect(typeof hash).toBe('number')
    expect(hash).not.toBe(0)
  })
})

describe('hashContent', () => {
  it('returns a string', () => {
    expect(typeof hashContent('hello')).toBe('string')
  })

  it('is deterministic for the same input', () => {
    expect(hashContent('test-content')).toBe(hashContent('test-content'))
  })

  it('produces different hashes for different inputs', () => {
    expect(hashContent('alpha')).not.toBe(hashContent('beta'))
  })

  it('returns a non-empty string', () => {
    expect(hashContent('data').length).toBeGreaterThan(0)
  })

  it('handles empty string', () => {
    const result = hashContent('')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles long input', () => {
    const long = 'x'.repeat(10000)
    expect(typeof hashContent(long)).toBe('string')
  })
})

describe('hashPair', () => {
  it('returns a string', () => {
    expect(typeof hashPair('a', 'b')).toBe('string')
  })

  it('is deterministic for the same pair', () => {
    expect(hashPair('foo', 'bar')).toBe(hashPair('foo', 'bar'))
  })

  it('produces different hashes for different pairs', () => {
    expect(hashPair('a', 'b')).not.toBe(hashPair('c', 'd'))
  })

  it('disambiguates boundary splits', () => {
    // ("ab","cd") vs ("a","bcd") should produce different hashes
    expect(hashPair('ab', 'cd')).not.toBe(hashPair('a', 'bcd'))
  })

  it('is order-sensitive', () => {
    expect(hashPair('first', 'second')).not.toBe(hashPair('second', 'first'))
  })

  it('handles empty strings', () => {
    const result = hashPair('', '')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles one empty and one non-empty', () => {
    expect(hashPair('', 'b')).not.toBe(hashPair('a', ''))
  })
})
