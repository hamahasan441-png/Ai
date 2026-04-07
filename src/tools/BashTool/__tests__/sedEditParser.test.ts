import { describe, it, expect, vi } from 'vitest'

// Mock shell-quote dependency used by shellQuote.ts
vi.mock('../../../utils/bash/shellQuote.js', () => ({
  tryParseShellCommand: (input: string) => {
    // Simple tokenizer for test purposes: split on whitespace, respecting single/double quotes
    const tokens: string[] = []
    let current = ''
    let inSingle = false
    let inDouble = false
    for (let i = 0; i < input.length; i++) {
      const ch = input[i]!
      if (ch === "'" && !inDouble) {
        inSingle = !inSingle
        continue
      }
      if (ch === '"' && !inSingle) {
        inDouble = !inDouble
        continue
      }
      if (ch === ' ' && !inSingle && !inDouble) {
        if (current.length > 0) {
          tokens.push(current)
          current = ''
        }
        continue
      }
      current += ch
    }
    if (current.length > 0) tokens.push(current)
    return { success: true, tokens }
  },
}))

import {
  parseSedEditCommand,
  applySedSubstitution,
  isSedInPlaceEdit,
} from '../sedEditParser.js'
import type { SedEditInfo } from '../sedEditParser.js'

describe('parseSedEditCommand', () => {
  it('parses a simple sed -i substitution', () => {
    const result = parseSedEditCommand("sed -i 's/foo/bar/g' file.txt")
    expect(result).not.toBeNull()
    expect(result!.filePath).toBe('file.txt')
    expect(result!.pattern).toBe('foo')
    expect(result!.replacement).toBe('bar')
    expect(result!.flags).toBe('g')
    expect(result!.extendedRegex).toBe(false)
  })

  it('parses sed -i -E (extended regex)', () => {
    const result = parseSedEditCommand("sed -i -E 's/pattern/replace/' file.txt")
    expect(result).not.toBeNull()
    expect(result!.extendedRegex).toBe(true)
    expect(result!.pattern).toBe('pattern')
    expect(result!.replacement).toBe('replace')
    expect(result!.flags).toBe('')
  })

  it('parses sed -i -r (extended regex alternate flag)', () => {
    const result = parseSedEditCommand("sed -i -r 's/a/b/g' myfile")
    expect(result).not.toBeNull()
    expect(result!.extendedRegex).toBe(true)
  })

  it('parses sed with --in-place flag', () => {
    const result = parseSedEditCommand("sed --in-place 's/old/new/' config.yml")
    expect(result).not.toBeNull()
    expect(result!.filePath).toBe('config.yml')
    expect(result!.pattern).toBe('old')
    expect(result!.replacement).toBe('new')
  })

  it('parses sed with -i.bak backup suffix', () => {
    const result = parseSedEditCommand("sed -i.bak 's/x/y/' data.csv")
    expect(result).not.toBeNull()
    expect(result!.filePath).toBe('data.csv')
    expect(result!.pattern).toBe('x')
    expect(result!.replacement).toBe('y')
  })

  it('parses sed with -e expression flag', () => {
    const result = parseSedEditCommand("sed -i -e 's/alpha/beta/g' notes.md")
    expect(result).not.toBeNull()
    expect(result!.pattern).toBe('alpha')
    expect(result!.replacement).toBe('beta')
    expect(result!.flags).toBe('g')
  })

  it('parses substitution with no flags', () => {
    const result = parseSedEditCommand("sed -i 's/hello/world/' test.txt")
    expect(result).not.toBeNull()
    expect(result!.flags).toBe('')
  })

  it('returns null for missing -i flag', () => {
    const result = parseSedEditCommand("sed 's/foo/bar/g' file.txt")
    expect(result).toBeNull()
  })

  it('returns null when no file path is provided', () => {
    const result = parseSedEditCommand("sed -i 's/foo/bar/g'")
    expect(result).toBeNull()
  })

  it('returns null for commands not starting with sed', () => {
    const result = parseSedEditCommand("grep -i 's/foo/bar/g' file.txt")
    expect(result).toBeNull()
  })

  it('returns null for non-substitution expressions', () => {
    const result = parseSedEditCommand('sed -i d file.txt')
    expect(result).toBeNull()
  })

  it('returns null for multiple expressions', () => {
    const result = parseSedEditCommand("sed -i -e 's/a/b/' -e 's/c/d/' file.txt")
    expect(result).toBeNull()
  })

  it('returns null for multiple file paths', () => {
    const result = parseSedEditCommand("sed -i 's/a/b/' file1.txt file2.txt")
    expect(result).toBeNull()
  })

  it('handles escaped slashes in pattern', () => {
    const result = parseSedEditCommand("sed -i 's/path\\/to\\/file/new\\/path/' config.txt")
    expect(result).not.toBeNull()
    expect(result!.pattern).toBe('path\\/to\\/file')
    expect(result!.replacement).toBe('new\\/path')
  })
})

describe('isSedInPlaceEdit', () => {
  it('returns true for valid sed in-place edit', () => {
    expect(isSedInPlaceEdit("sed -i 's/foo/bar/g' file.txt")).toBe(true)
  })

  it('returns false for sed without -i flag', () => {
    expect(isSedInPlaceEdit("sed 's/foo/bar/g' file.txt")).toBe(false)
  })

  it('returns false for non-sed commands', () => {
    expect(isSedInPlaceEdit("echo hello")).toBe(false)
  })
})

describe('applySedSubstitution', () => {
  it('performs a simple substitution (first occurrence)', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: 'foo',
      replacement: 'bar',
      flags: '',
      extendedRegex: false,
    }
    expect(applySedSubstitution('foo baz foo', info)).toBe('bar baz foo')
  })

  it('performs a global substitution with g flag', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: 'foo',
      replacement: 'bar',
      flags: 'g',
      extendedRegex: false,
    }
    expect(applySedSubstitution('foo baz foo', info)).toBe('bar baz bar')
  })

  it('performs case-insensitive substitution with i flag', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: 'hello',
      replacement: 'hi',
      flags: 'gi',
      extendedRegex: false,
    }
    expect(applySedSubstitution('Hello HELLO hello', info)).toBe('hi hi hi')
  })

  it('returns content unchanged when pattern does not match', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: 'xyz',
      replacement: 'abc',
      flags: 'g',
      extendedRegex: false,
    }
    expect(applySedSubstitution('no match here', info)).toBe('no match here')
  })

  it('handles regex patterns in extended mode', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: '(foo|bar)',
      replacement: 'baz',
      flags: 'g',
      extendedRegex: true,
    }
    expect(applySedSubstitution('foo and bar', info)).toBe('baz and baz')
  })

  it('handles BRE mode where + is literal', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: 'a+b',
      replacement: 'x',
      flags: 'g',
      extendedRegex: false,
    }
    // In BRE, + is literal, so it matches "a+b" literally
    expect(applySedSubstitution('a+b and ab', info)).toBe('x and ab')
  })

  it('handles BRE mode where \\+ is one-or-more', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: 'a\\+',
      replacement: 'x',
      flags: 'g',
      extendedRegex: false,
    }
    // In BRE, \+ means one-or-more, matches "a", "aa", "aaa" etc
    expect(applySedSubstitution('aaa b a', info)).toBe('x b x')
  })

  it('handles & in replacement as full match', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: 'world',
      replacement: '&!',
      flags: '',
      extendedRegex: false,
    }
    expect(applySedSubstitution('hello world', info)).toBe('hello world!')
  })

  it('handles escaped \\/ in pattern', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: 'a\\/b',
      replacement: 'x',
      flags: 'g',
      extendedRegex: false,
    }
    expect(applySedSubstitution('a/b', info)).toBe('x')
  })

  it('returns original content on invalid regex', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: '[invalid',
      replacement: 'x',
      flags: '',
      extendedRegex: true,
    }
    expect(applySedSubstitution('some content', info)).toBe('some content')
  })

  it('handles multiline with m flag', () => {
    const info: SedEditInfo = {
      filePath: 'test.txt',
      pattern: '^hello',
      replacement: 'hi',
      flags: 'gm',
      extendedRegex: false,
    }
    const content = 'hello world\nhello there'
    expect(applySedSubstitution(content, info)).toBe('hi world\nhi there')
  })
})
