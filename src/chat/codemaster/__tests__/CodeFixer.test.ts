import { describe, it, expect, beforeEach } from 'vitest'
import { CodeFixer } from '../CodeFixer'
import type { CodeFix, ReviewFinding } from '../types'

// ── Constructor Tests ──

describe('CodeFixer constructor', () => {
  it('creates an instance', () => {
    const fixer = new CodeFixer()
    expect(fixer).toBeInstanceOf(CodeFixer)
  })

  it('starts with no rollback state', () => {
    const fixer = new CodeFixer()
    expect(fixer.getRollbackCode()).toBeUndefined()
  })
})

// ── fixCode Tests ──

describe('CodeFixer fixCode', () => {
  let fixer: CodeFixer

  beforeEach(() => {
    fixer = new CodeFixer()
  })

  it('returns a FixResult with all required fields', () => {
    const code = 'const x = 1'
    const result = fixer.fixCode(code, 'typescript')
    expect(result.fixes).toBeDefined()
    expect(Array.isArray(result.fixes)).toBe(true)
    expect(result.rollbackState).toBeInstanceOf(Map)
    expect(typeof result.summary.applied).toBe('number')
    expect(typeof result.summary.skipped).toBe('number')
    expect(typeof result.summary.failed).toBe('number')
  })

  it('fixes loose equality (== to ===) in JavaScript', () => {
    const code = 'if (x == 1) {}'
    const result = fixer.fixCode(code, 'javascript')
    const fix = result.fixes.find(f => f.findingId === 'fix-loose-equality')
    expect(fix).toBeDefined()
    expect(fix!.applied).toBe(true)
    expect(fix!.fixed).toContain('===')
  })

  it('fixes loose inequality (!= to !==) in TypeScript', () => {
    const code = 'if (x != null) {}'
    const result = fixer.fixCode(code, 'typescript')
    const fix = result.fixes.find(f => f.findingId === 'fix-loose-inequality')
    expect(fix).toBeDefined()
    expect(fix!.applied).toBe(true)
    expect(fix!.fixed).toContain('!==')
  })

  it('replaces var with const in JavaScript', () => {
    const code = 'var count = 0'
    const result = fixer.fixCode(code, 'javascript')
    const fix = result.fixes.find(f => f.findingId === 'fix-var-to-const')
    expect(fix).toBeDefined()
    expect(fix!.applied).toBe(true)
    expect(fix!.fixed).toContain('const ')
    expect(fix!.fixed).not.toContain('var ')
  })

  it('removes console.log statements', () => {
    const code = 'console.log("debug")'
    const result = fixer.fixCode(code, 'typescript')
    const fix = result.fixes.find(f => f.findingId === 'fix-remove-console-log')
    expect(fix).toBeDefined()
    expect(fix!.applied).toBe(true)
    expect(fix!.fixed).toBe('')
  })

  it('fixes bare except clause in Python', () => {
    const code = '  except:'
    const result = fixer.fixCode(code, 'python')
    const fix = result.fixes.find(f => f.findingId === 'fix-bare-except')
    expect(fix).toBeDefined()
    expect(fix!.applied).toBe(true)
    expect(fix!.fixed).toContain('except Exception:')
  })

  it('fixes mutable default argument in Python', () => {
    const code = 'def foo(items=[])'
    const result = fixer.fixCode(code, 'python')
    const fix = result.fixes.find(f => f.findingId === 'fix-mutable-default')
    expect(fix).toBeDefined()
    expect(fix!.applied).toBe(true)
    expect(fix!.fixed).toContain('=None')
  })

  it('skips language-irrelevant patterns', () => {
    const code = 'var x = 10'
    const result = fixer.fixCode(code, 'python')
    const varFix = result.fixes.find(f => f.findingId === 'fix-var-to-const')
    expect(varFix).toBeUndefined()
  })

  it('stores rollback state after fixing', () => {
    const code = 'var x = 1'
    fixer.fixCode(code, 'javascript')
    expect(fixer.getRollbackCode()).toBe(code)
  })

  it('skips fixes when findings filter excludes the line', () => {
    const code = 'if (x == 1) {}'
    const findings: ReviewFinding[] = [{
      category: 'bug',
      severity: 'medium',
      line: 999,
      title: 'Unrelated',
      description: 'Unrelated finding',
      suggestion: 'N/A',
      fixAvailable: true,
      autoFixable: true,
      id: 'unrelated',
    }]
    const result = fixer.fixCode(code, 'javascript', findings)
    expect(result.summary.skipped).toBeGreaterThan(0)
    expect(result.summary.applied).toBe(0)
  })

  it('applies fixes when findings match the line', () => {
    const code = 'if (x == 1) {}'
    const findings: ReviewFinding[] = [{
      category: 'bug',
      severity: 'medium',
      line: 1,
      title: 'Loose equality',
      description: 'Use strict equality',
      suggestion: 'Use ===',
      fixAvailable: true,
      autoFixable: true,
      id: 'eq-fix',
    }]
    const result = fixer.fixCode(code, 'javascript', findings)
    expect(result.summary.applied).toBeGreaterThan(0)
  })

  it('returns zero applied for code with no matching patterns', () => {
    const code = 'const x: number = 42;'
    const result = fixer.fixCode(code, 'typescript')
    expect(result.summary.applied).toBe(0)
  })

  it('validates fixes have balanced brackets', () => {
    const code = 'var x = (1 + 2)'
    const result = fixer.fixCode(code, 'javascript')
    const fix = result.fixes.find(f => f.findingId === 'fix-var-to-const')
    expect(fix).toBeDefined()
    expect(fix!.validated).toBe(true)
  })
})

// ── applyFix Tests ──

describe('CodeFixer applyFix', () => {
  let fixer: CodeFixer

  beforeEach(() => {
    fixer = new CodeFixer()
  })

  it('replaces original text with fixed text', () => {
    const code = 'var x = 1'
    const fix: CodeFix = {
      findingId: 'test',
      original: 'var x',
      fixed: 'const x',
      diff: '',
      applied: true,
      validated: true,
    }
    const result = fixer.applyFix(code, fix)
    expect(result).toBe('const x = 1')
  })

  it('returns original code when fix has empty original', () => {
    const code = 'const x = 1'
    const fix: CodeFix = {
      findingId: 'test',
      original: '',
      fixed: 'something',
      diff: '',
      applied: true,
      validated: true,
    }
    expect(fixer.applyFix(code, fix)).toBe(code)
  })

  it('returns original code when fix has empty fixed string', () => {
    const code = 'const x = 1'
    const fix: CodeFix = {
      findingId: 'test',
      original: '',
      fixed: '',
      diff: '',
      applied: true,
      validated: true,
    }
    expect(fixer.applyFix(code, fix)).toBe(code)
  })
})

// ── applyFixes Tests ──

describe('CodeFixer applyFixes', () => {
  let fixer: CodeFixer

  beforeEach(() => {
    fixer = new CodeFixer()
  })

  it('applies multiple non-conflicting fixes in order', () => {
    const code = 'var a = 1\nvar b = 2'
    const fixes: CodeFix[] = [
      { findingId: 'f1', original: 'var a', fixed: 'const a', diff: '', applied: false, validated: true },
      { findingId: 'f2', original: 'var b', fixed: 'const b', diff: '', applied: false, validated: true },
    ]
    const result = fixer.applyFixes(code, fixes)
    expect(result.code).toBe('const a = 1\nconst b = 2')
    expect(result.applied).toHaveLength(2)
    expect(result.skipped).toHaveLength(0)
  })

  it('skips conflicting fixes when original is no longer found', () => {
    const code = 'var x = 1'
    const fixes: CodeFix[] = [
      { findingId: 'f1', original: 'var x', fixed: 'const x', diff: '', applied: false, validated: true },
      { findingId: 'f2', original: 'var x', fixed: 'let x', diff: '', applied: false, validated: true },
    ]
    const result = fixer.applyFixes(code, fixes)
    expect(result.code).toBe('const x = 1')
    expect(result.applied).toHaveLength(1)
    expect(result.skipped).toHaveLength(1)
    expect(result.skipped[0].applied).toBe(false)
  })

  it('skips fixes with empty original', () => {
    const code = 'const x = 1'
    const fixes: CodeFix[] = [
      { findingId: 'f1', original: '', fixed: 'something', diff: '', applied: false, validated: true },
    ]
    const result = fixer.applyFixes(code, fixes)
    expect(result.code).toBe(code)
    expect(result.skipped).toHaveLength(1)
  })

  it('stores rollback state before applying fixes', () => {
    const code = 'var x = 1'
    const fixes: CodeFix[] = [
      { findingId: 'f1', original: 'var x', fixed: 'const x', diff: '', applied: false, validated: true },
    ]
    fixer.applyFixes(code, fixes)
    expect(fixer.getRollbackCode()).toBe(code)
  })
})

// ── Rollback Tests ──

describe('CodeFixer rollback', () => {
  let fixer: CodeFixer

  beforeEach(() => {
    fixer = new CodeFixer()
  })

  it('returns undefined when no code has been fixed', () => {
    expect(fixer.rollback()).toBeUndefined()
  })

  it('returns original code after fixCode', () => {
    const original = 'var x = 1'
    fixer.fixCode(original, 'javascript')
    expect(fixer.rollback()).toBe(original)
  })

  it('returns original code after applyFixes', () => {
    const original = 'var a = 1'
    fixer.applyFixes(original, [
      { findingId: 'f1', original: 'var a', fixed: 'const a', diff: '', applied: false, validated: true },
    ])
    expect(fixer.rollback()).toBe(original)
  })

  it('clearRollback removes stored state', () => {
    fixer.fixCode('var x = 1', 'javascript')
    expect(fixer.getRollbackCode()).toBeDefined()
    fixer.clearRollback()
    expect(fixer.getRollbackCode()).toBeUndefined()
  })

  it('getRollbackCode and rollback return the same value', () => {
    const code = 'var x = 1'
    fixer.fixCode(code, 'javascript')
    expect(fixer.getRollbackCode()).toBe(fixer.rollback())
  })
})

// ── generateUnifiedDiff Tests ──

describe('CodeFixer generateUnifiedDiff', () => {
  let fixer: CodeFixer

  beforeEach(() => {
    fixer = new CodeFixer()
  })

  it('produces diff header with default file path', () => {
    const diff = fixer.generateUnifiedDiff('a', 'b')
    expect(diff).toContain('--- a/code')
    expect(diff).toContain('+++ b/code')
  })

  it('uses custom file path in diff header', () => {
    const diff = fixer.generateUnifiedDiff('a', 'b', 'src/index.ts')
    expect(diff).toContain('--- a/src/index.ts')
    expect(diff).toContain('+++ b/src/index.ts')
  })

  it('marks removed lines with - and added lines with +', () => {
    const original = 'var x = 1'
    const fixed = 'const x = 1'
    const diff = fixer.generateUnifiedDiff(original, fixed)
    expect(diff).toContain('-var x = 1')
    expect(diff).toContain('+const x = 1')
  })

  it('marks unchanged lines with a leading space', () => {
    const original = 'line1\nline2'
    const fixed = 'line1\nline2'
    const diff = fixer.generateUnifiedDiff(original, fixed)
    expect(diff).toContain(' line1')
    expect(diff).toContain(' line2')
  })

  it('handles multi-line diffs with mixed changes', () => {
    const original = 'line1\nvar x = 1\nline3'
    const fixed = 'line1\nconst x = 1\nline3'
    const diff = fixer.generateUnifiedDiff(original, fixed)
    expect(diff).toContain(' line1')
    expect(diff).toContain('-var x = 1')
    expect(diff).toContain('+const x = 1')
    expect(diff).toContain(' line3')
  })

  it('returns only headers for identical code', () => {
    const code = 'const x = 1'
    const diff = fixer.generateUnifiedDiff(code, code)
    const lines = diff.split('\n')
    expect(lines[0]).toMatch(/^--- a\//)
    expect(lines[1]).toMatch(/^\+\+\+ b\//)
    // All remaining lines should be context (unchanged)
    for (const line of lines.slice(2)) {
      expect(line.startsWith(' ')).toBe(true)
    }
  })
})
