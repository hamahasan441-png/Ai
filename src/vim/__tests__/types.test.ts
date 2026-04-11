import { describe, it, expect } from 'vitest'
import {
  OPERATORS,
  isOperatorKey,
  SIMPLE_MOTIONS,
  FIND_KEYS,
  TEXT_OBJ_SCOPES,
  isTextObjScopeKey,
  TEXT_OBJ_TYPES,
  MAX_VIM_COUNT,
  createInitialVimState,
  createInitialPersistentState,
} from '../../vim/types'

describe('OPERATORS', () => {
  it('maps d to delete', () => {
    expect(OPERATORS.d).toBe('delete')
  })

  it('maps c to change', () => {
    expect(OPERATORS.c).toBe('change')
  })

  it('maps y to yank', () => {
    expect(OPERATORS.y).toBe('yank')
  })

  it('has exactly three entries', () => {
    expect(Object.keys(OPERATORS)).toEqual(['d', 'c', 'y'])
  })
})

describe('isOperatorKey', () => {
  it('returns true for d', () => {
    expect(isOperatorKey('d')).toBe(true)
  })

  it('returns true for c', () => {
    expect(isOperatorKey('c')).toBe(true)
  })

  it('returns true for y', () => {
    expect(isOperatorKey('y')).toBe(true)
  })

  it('returns false for x', () => {
    expect(isOperatorKey('x')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isOperatorKey('')).toBe(false)
  })

  it('returns false for w (motion key)', () => {
    expect(isOperatorKey('w')).toBe(false)
  })
})

describe('SIMPLE_MOTIONS', () => {
  const expected = ['h', 'l', 'j', 'k', 'w', 'b', 'e', 'W', 'B', 'E', '0', '^', '$']

  it.each(expected)('contains %s', key => {
    expect(SIMPLE_MOTIONS.has(key)).toBe(true)
  })

  it('does not contain d (operator)', () => {
    expect(SIMPLE_MOTIONS.has('d')).toBe(false)
  })

  it('does not contain f (find key)', () => {
    expect(SIMPLE_MOTIONS.has('f')).toBe(false)
  })

  it('does not contain i (text obj scope)', () => {
    expect(SIMPLE_MOTIONS.has('i')).toBe(false)
  })

  it('has exactly 13 members', () => {
    expect(SIMPLE_MOTIONS.size).toBe(13)
  })
})

describe('FIND_KEYS', () => {
  it.each(['f', 'F', 't', 'T'])('contains %s', key => {
    expect(FIND_KEYS.has(key)).toBe(true)
  })

  it('does not contain h', () => {
    expect(FIND_KEYS.has('h')).toBe(false)
  })

  it('does not contain w', () => {
    expect(FIND_KEYS.has('w')).toBe(false)
  })

  it('has exactly 4 members', () => {
    expect(FIND_KEYS.size).toBe(4)
  })
})

describe('TEXT_OBJ_SCOPES', () => {
  it('maps i to inner', () => {
    expect(TEXT_OBJ_SCOPES.i).toBe('inner')
  })

  it('maps a to around', () => {
    expect(TEXT_OBJ_SCOPES.a).toBe('around')
  })

  it('has exactly two entries', () => {
    expect(Object.keys(TEXT_OBJ_SCOPES)).toEqual(['i', 'a'])
  })
})

describe('isTextObjScopeKey', () => {
  it('returns true for i', () => {
    expect(isTextObjScopeKey('i')).toBe(true)
  })

  it('returns true for a', () => {
    expect(isTextObjScopeKey('a')).toBe(true)
  })

  it('returns false for o', () => {
    expect(isTextObjScopeKey('o')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isTextObjScopeKey('')).toBe(false)
  })

  it('returns false for w', () => {
    expect(isTextObjScopeKey('w')).toBe(false)
  })
})

describe('TEXT_OBJ_TYPES', () => {
  const expected = ['w', 'W', '"', "'", '`', '(', ')', 'b', '[', ']', '{', '}', 'B', '<', '>']

  it.each(expected)('contains %s', key => {
    expect(TEXT_OBJ_TYPES.has(key)).toBe(true)
  })

  it('does not contain d', () => {
    expect(TEXT_OBJ_TYPES.has('d')).toBe(false)
  })

  it('does not contain h', () => {
    expect(TEXT_OBJ_TYPES.has('h')).toBe(false)
  })

  it('has exactly 15 members', () => {
    expect(TEXT_OBJ_TYPES.size).toBe(15)
  })
})

describe('MAX_VIM_COUNT', () => {
  it('equals 10000', () => {
    expect(MAX_VIM_COUNT).toBe(10000)
  })
})

describe('createInitialVimState', () => {
  it('returns INSERT mode', () => {
    const state = createInitialVimState()
    expect(state.mode).toBe('INSERT')
  })

  it('has empty insertedText', () => {
    const state = createInitialVimState()
    expect(state.mode === 'INSERT' && state.insertedText).toBe('')
  })

  it('returns a new object each time', () => {
    const a = createInitialVimState()
    const b = createInitialVimState()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('createInitialPersistentState', () => {
  it('has null lastChange', () => {
    expect(createInitialPersistentState().lastChange).toBeNull()
  })

  it('has null lastFind', () => {
    expect(createInitialPersistentState().lastFind).toBeNull()
  })

  it('has empty register', () => {
    expect(createInitialPersistentState().register).toBe('')
  })

  it('has registerIsLinewise set to false', () => {
    expect(createInitialPersistentState().registerIsLinewise).toBe(false)
  })

  it('returns a new object each time', () => {
    const a = createInitialPersistentState()
    const b = createInitialPersistentState()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})
