import { describe, it, expect } from 'vitest'
import { difference, intersects, every, union } from '../../utils/set'

describe('difference', () => {
  it('returns empty set when both sets are empty', () => {
    expect(difference(new Set(), new Set())).toEqual(new Set())
  })

  it('returns a copy of a when b is empty', () => {
    expect(difference(new Set([1, 2, 3]), new Set())).toEqual(
      new Set([1, 2, 3]),
    )
  })

  it('returns empty set when a is empty', () => {
    expect(difference(new Set(), new Set([1, 2]))).toEqual(new Set())
  })

  it('returns all of a when sets are disjoint', () => {
    expect(difference(new Set([1, 2]), new Set([3, 4]))).toEqual(
      new Set([1, 2]),
    )
  })

  it('removes overlapping elements', () => {
    expect(difference(new Set([1, 2, 3]), new Set([2, 3, 4]))).toEqual(
      new Set([1]),
    )
  })

  it('returns empty set when a is a subset of b', () => {
    expect(difference(new Set([1, 2]), new Set([1, 2, 3]))).toEqual(new Set())
  })

  it('returns empty set when sets are identical', () => {
    expect(difference(new Set([1, 2, 3]), new Set([1, 2, 3]))).toEqual(
      new Set(),
    )
  })
})

describe('intersects', () => {
  it('returns false when both sets are empty', () => {
    expect(intersects(new Set(), new Set())).toBe(false)
  })

  it('returns false when first set is empty', () => {
    expect(intersects(new Set(), new Set([1, 2]))).toBe(false)
  })

  it('returns false when second set is empty', () => {
    expect(intersects(new Set([1, 2]), new Set())).toBe(false)
  })

  it('returns false when sets are disjoint', () => {
    expect(intersects(new Set([1, 2]), new Set([3, 4]))).toBe(false)
  })

  it('returns true when sets share an element', () => {
    expect(intersects(new Set([1, 2]), new Set([2, 3]))).toBe(true)
  })

  it('returns true when sets are identical', () => {
    expect(intersects(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBe(true)
  })

  it('works with string values', () => {
    expect(intersects(new Set(['a', 'b']), new Set(['b', 'c']))).toBe(true)
  })
})

describe('every', () => {
  it('returns true when a is empty (vacuous truth)', () => {
    expect(every(new Set(), new Set([1, 2]))).toBe(true)
  })

  it('returns true when both are empty', () => {
    expect(every(new Set(), new Set())).toBe(true)
  })

  it('returns true when a is a subset of b', () => {
    expect(every(new Set([1, 2]), new Set([1, 2, 3]))).toBe(true)
  })

  it('returns true when sets are identical', () => {
    expect(every(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBe(true)
  })

  it('returns false when a has elements not in b', () => {
    expect(every(new Set([1, 2, 4]), new Set([1, 2, 3]))).toBe(false)
  })

  it('returns false when b is empty but a is not', () => {
    expect(every(new Set([1]), new Set())).toBe(false)
  })
})

describe('union', () => {
  it('returns empty set when both are empty', () => {
    expect(union(new Set(), new Set())).toEqual(new Set())
  })

  it('returns all elements from a when b is empty', () => {
    expect(union(new Set([1, 2]), new Set())).toEqual(new Set([1, 2]))
  })

  it('returns all elements from b when a is empty', () => {
    expect(union(new Set(), new Set([3, 4]))).toEqual(new Set([3, 4]))
  })

  it('combines disjoint sets', () => {
    expect(union(new Set([1, 2]), new Set([3, 4]))).toEqual(
      new Set([1, 2, 3, 4]),
    )
  })

  it('deduplicates overlapping elements', () => {
    expect(union(new Set([1, 2, 3]), new Set([2, 3, 4]))).toEqual(
      new Set([1, 2, 3, 4]),
    )
  })

  it('returns equivalent set when both are identical', () => {
    const result = union(new Set([1, 2, 3]), new Set([1, 2, 3]))
    expect(result).toEqual(new Set([1, 2, 3]))
    expect(result.size).toBe(3)
  })
})
