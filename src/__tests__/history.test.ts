import { describe, it, expect, vi } from 'vitest'

// Mock transitive dependencies that are not installed in the test environment
vi.mock('lodash-es/sumBy.js', () => ({ default: () => 0 }))
vi.mock('../bootstrap/state', () => ({
  getProjectRoot: () => '/mock',
  getSessionId: () => 'mock-session',
}))
vi.mock('../utils/cleanupRegistry', () => ({ registerCleanup: () => {} }))
vi.mock('../utils/debug', () => ({ logForDebugging: () => {} }))
vi.mock('../utils/envUtils', () => ({
  getClaudeConfigHomeDir: () => '/mock',
  isEnvTruthy: () => false,
}))
vi.mock('../utils/errors', () => ({ getErrnoCode: () => null }))
vi.mock('../utils/fsOperations', () => ({
  readLinesReverse: async function* () {},
}))
vi.mock('../utils/lockfile', () => ({ lock: async () => () => {} }))
vi.mock('../utils/pasteStore', () => ({
  hashPastedText: () => '',
  retrievePastedText: async () => null,
  storePastedText: async () => {},
}))
vi.mock('../utils/sleep', () => ({ sleep: async () => {} }))
vi.mock('../utils/slowOperations', () => ({
  jsonParse: JSON.parse,
  jsonStringify: JSON.stringify,
}))

import {
  getPastedTextRefNumLines,
  formatPastedTextRef,
  formatImageRef,
  parseReferences,
  expandPastedTextRefs,
} from '../history'

describe('getPastedTextRefNumLines', () => {
  it('returns 0 for empty string', () => {
    expect(getPastedTextRefNumLines('')).toBe(0)
  })

  it('returns 0 for single line (no newlines)', () => {
    expect(getPastedTextRefNumLines('hello world')).toBe(0)
  })

  it('returns 1 for two lines', () => {
    expect(getPastedTextRefNumLines('line1\nline2')).toBe(1)
  })

  it('returns count of newlines for multiple lines', () => {
    expect(getPastedTextRefNumLines('a\nb\nc\nd')).toBe(3)
  })

  it('handles \\r\\n line endings', () => {
    expect(getPastedTextRefNumLines('line1\r\nline2\r\nline3')).toBe(2)
  })

  it('handles \\r line endings', () => {
    expect(getPastedTextRefNumLines('line1\rline2\rline3')).toBe(2)
  })

  it('handles mixed line endings', () => {
    expect(getPastedTextRefNumLines('a\nb\r\nc\rd')).toBe(3)
  })

  it('counts trailing newline', () => {
    expect(getPastedTextRefNumLines('line1\n')).toBe(1)
  })

  it('counts multiple trailing newlines', () => {
    expect(getPastedTextRefNumLines('line1\n\n')).toBe(2)
  })
})

describe('formatPastedTextRef', () => {
  it('formats with 0 lines (no line count suffix)', () => {
    expect(formatPastedTextRef(1, 0)).toBe('[Pasted text #1]')
  })

  it('formats with positive line count', () => {
    expect(formatPastedTextRef(1, 5)).toBe('[Pasted text #1 +5 lines]')
  })

  it('formats with id 1', () => {
    expect(formatPastedTextRef(1, 0)).toBe('[Pasted text #1]')
  })

  it('formats with large id', () => {
    expect(formatPastedTextRef(42, 100)).toBe('[Pasted text #42 +100 lines]')
  })

  it('formats with 1 line', () => {
    expect(formatPastedTextRef(3, 1)).toBe('[Pasted text #3 +1 lines]')
  })
})

describe('formatImageRef', () => {
  it('formats image ref with id 1', () => {
    expect(formatImageRef(1)).toBe('[Image #1]')
  })

  it('formats image ref with id 42', () => {
    expect(formatImageRef(42)).toBe('[Image #42]')
  })

  it('formats image ref with large id', () => {
    expect(formatImageRef(999)).toBe('[Image #999]')
  })
})

describe('parseReferences', () => {
  it('returns empty array when no references found', () => {
    expect(parseReferences('hello world')).toEqual([])
  })

  it('parses a single pasted text reference', () => {
    const result = parseReferences('before [Pasted text #1] after')
    expect(result).toEqual([
      { id: 1, match: '[Pasted text #1]', index: 7 },
    ])
  })

  it('parses a pasted text reference with line count', () => {
    const result = parseReferences('[Pasted text #3 +10 lines]')
    expect(result).toEqual([
      { id: 3, match: '[Pasted text #3 +10 lines]', index: 0 },
    ])
  })

  it('parses an image reference', () => {
    const result = parseReferences('see [Image #2] here')
    expect(result).toEqual([
      { id: 2, match: '[Image #2]', index: 4 },
    ])
  })

  it('parses multiple references in text', () => {
    const input = '[Pasted text #1] and [Image #2] and [Pasted text #3 +5 lines]'
    const result = parseReferences(input)
    expect(result).toHaveLength(3)
    expect(result[0]!.id).toBe(1)
    expect(result[1]!.id).toBe(2)
    expect(result[2]!.id).toBe(3)
  })

  it('parses truncated text reference', () => {
    const result = parseReferences('[...Truncated text #4]')
    expect(result).toEqual([
      { id: 4, match: '[...Truncated text #4]', index: 0 },
    ])
  })

  it('filters out references with id 0', () => {
    const result = parseReferences('[Pasted text #0]')
    expect(result).toEqual([])
  })

  it('handles reference at end of string', () => {
    const result = parseReferences('text [Image #5]')
    expect(result).toEqual([
      { id: 5, match: '[Image #5]', index: 5 },
    ])
  })

  it('handles reference at start of string', () => {
    const result = parseReferences('[Image #1] text')
    expect(result).toEqual([
      { id: 1, match: '[Image #1]', index: 0 },
    ])
  })

  it('does not match malformed references', () => {
    expect(parseReferences('[Pasted text]')).toEqual([])
    expect(parseReferences('[Image]')).toEqual([])
    expect(parseReferences('[Pasted text #]')).toEqual([])
  })

  it('parses truncated text with trailing dots', () => {
    const result = parseReferences('[...Truncated text #1...]')
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(1)
  })
})

describe('expandPastedTextRefs', () => {
  const makePastedContent = (id: number, content: string, type: 'text' | 'image' = 'text') => ({
    id,
    type,
    content,
  })

  it('returns unchanged text when no refs present', () => {
    const input = 'just some text'
    const result = expandPastedTextRefs(input, {})
    expect(result).toBe('just some text')
  })

  it('replaces a single text ref with content', () => {
    const input = 'before [Pasted text #1] after'
    const contents = { 1: makePastedContent(1, 'REPLACED') }
    const result = expandPastedTextRefs(input, contents)
    expect(result).toBe('before REPLACED after')
  })

  it('does not replace image refs (they become content blocks)', () => {
    const input = 'see [Image #1] here'
    const contents = { 1: makePastedContent(1, 'image-data', 'image') }
    const result = expandPastedTextRefs(input, contents)
    expect(result).toBe('see [Image #1] here')
  })

  it('replaces multiple text refs correctly', () => {
    const input = '[Pasted text #1] and [Pasted text #2]'
    const contents = {
      1: makePastedContent(1, 'FIRST'),
      2: makePastedContent(2, 'SECOND'),
    }
    const result = expandPastedTextRefs(input, contents)
    expect(result).toBe('FIRST and SECOND')
  })

  it('leaves ref alone when content is missing', () => {
    const input = 'before [Pasted text #99] after'
    const result = expandPastedTextRefs(input, {})
    expect(result).toBe('before [Pasted text #99] after')
  })

  it('replaces text ref with line count suffix', () => {
    const input = '[Pasted text #1 +5 lines]'
    const contents = { 1: makePastedContent(1, 'multi\nline\ncontent') }
    const result = expandPastedTextRefs(input, contents)
    expect(result).toBe('multi\nline\ncontent')
  })

  it('handles mixed text and image refs', () => {
    const input = '[Pasted text #1] [Image #2] [Pasted text #3]'
    const contents = {
      1: makePastedContent(1, 'TEXT1'),
      2: makePastedContent(2, 'img-data', 'image'),
      3: makePastedContent(3, 'TEXT3'),
    }
    const result = expandPastedTextRefs(input, contents)
    expect(result).toBe('TEXT1 [Image #2] TEXT3')
  })

  it('handles empty pasted content', () => {
    const input = '[Pasted text #1]'
    const contents = { 1: makePastedContent(1, '') }
    const result = expandPastedTextRefs(input, contents)
    expect(result).toBe('')
  })

  it('handles content that looks like a reference', () => {
    const input = '[Pasted text #1]'
    const contents = { 1: makePastedContent(1, '[Pasted text #2]') }
    const result = expandPastedTextRefs(input, contents)
    // The replacement uses splice-based approach (reverse order), so
    // placeholder-like strings inside pasted content are not re-processed
    expect(result).toBe('[Pasted text #2]')
  })
})
