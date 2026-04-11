import { describe, it, expect } from 'vitest'
import { intersperse, count, uniq } from '../../utils/array'

describe('intersperse', () => {
  it('returns empty array for empty input', () => {
    expect(intersperse([], () => 0)).toEqual([])
  })

  it('returns single element unchanged', () => {
    expect(intersperse(['a'], () => ',')).toEqual(['a'])
  })

  it('inserts separator between multiple elements', () => {
    expect(intersperse(['a', 'b', 'c'], () => ',')).toEqual(['a', ',', 'b', ',', 'c'])
  })

  it('passes the element index to the separator factory', () => {
    const result = intersperse([10, 20, 30], i => i * 100)
    // indices for the non-first elements are 1 and 2
    expect(result).toEqual([10, 100, 20, 200, 30])
  })

  it('works with two elements', () => {
    expect(intersperse([1, 2], () => 0)).toEqual([1, 0, 2])
  })

  it('preserves reference equality of original elements', () => {
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    const sep = { id: 'sep' }
    const result = intersperse([obj1, obj2], () => sep)
    expect(result[0]).toBe(obj1)
    expect(result[2]).toBe(obj2)
  })
})

describe('count', () => {
  it('returns 0 for empty array', () => {
    expect(count([], () => true)).toBe(0)
  })

  it('returns 0 when no elements match', () => {
    expect(count([1, 2, 3], x => x > 10)).toBe(0)
  })

  it('counts matching elements', () => {
    expect(count([1, 2, 3, 4, 5], x => x % 2 === 0)).toBe(2)
  })

  it('counts all elements when all match', () => {
    expect(count([2, 4, 6], x => x % 2 === 0)).toBe(3)
  })

  it('treats truthy non-boolean return values as matches', () => {
    expect(count(['a', '', 'b', ''], x => x)).toBe(2)
  })

  it('works with readonly array', () => {
    const arr: readonly number[] = [1, 2, 3]
    expect(count(arr, x => x > 1)).toBe(2)
  })
})

describe('uniq', () => {
  it('returns empty array for empty input', () => {
    expect(uniq([])).toEqual([])
  })

  it('returns same elements when no duplicates', () => {
    expect(uniq([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('removes duplicate values', () => {
    expect(uniq([1, 2, 2, 3, 1, 3])).toEqual([1, 2, 3])
  })

  it('works with strings', () => {
    expect(uniq(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c'])
  })

  it('works with a Set as input', () => {
    expect(uniq(new Set([1, 2, 3]))).toEqual([1, 2, 3])
  })

  it('works with a generator', () => {
    function* gen() {
      yield 1
      yield 2
      yield 1
      yield 3
    }
    expect(uniq(gen())).toEqual([1, 2, 3])
  })

  it('preserves first occurrence order', () => {
    expect(uniq([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
  })
})
