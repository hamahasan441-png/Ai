import { describe, it, expect, beforeEach } from 'vitest'
import { DiffEngine, FileDiff } from '../DiffEngine'

// ── Constructor Tests ──

describe('DiffEngine constructor', () => {
  it('creates an instance with default context lines (3)', () => {
    const engine = new DiffEngine()
    expect(engine).toBeInstanceOf(DiffEngine)
    // Verify default by generating a diff and checking context
    const orig = 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj'
    const mod = 'a\nb\nc\nd\nX\nf\ng\nh\ni\nj'
    const diff = engine.generateDiff(orig, mod)
    // With 3 context lines, the hunk should include 3 lines before and after the change
    const contextLines = diff.hunks[0].lines.filter(l => l.type === 'context')
    expect(contextLines.length).toBeLessThanOrEqual(6)
  })

  it('creates an instance with custom context lines', () => {
    const engine = new DiffEngine({ contextLines: 1 })
    expect(engine).toBeInstanceOf(DiffEngine)
    const orig = 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj'
    const mod = 'a\nb\nc\nd\nX\nf\ng\nh\ni\nj'
    const diff = engine.generateDiff(orig, mod)
    const contextLines = diff.hunks[0].lines.filter(l => l.type === 'context')
    // With 1 context line, at most 2 context lines (1 before + 1 after)
    expect(contextLines.length).toBeLessThanOrEqual(2)
  })

  it('creates an instance with zero context lines', () => {
    const engine = new DiffEngine({ contextLines: 0 })
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod)
    const contextLines = diff.hunks[0].lines.filter(l => l.type === 'context')
    expect(contextLines.length).toBe(0)
  })
})

// ── generateDiff Tests ──

describe('DiffEngine generateDiff', () => {
  let engine: DiffEngine

  beforeEach(() => {
    engine = new DiffEngine()
  })

  it('returns no hunks for identical strings', () => {
    const text = 'hello\nworld'
    const diff = engine.generateDiff(text, text)
    expect(diff.hunks).toHaveLength(0)
    expect(diff.additions).toBe(0)
    expect(diff.deletions).toBe(0)
  })

  it('detects a single line change', () => {
    const orig = 'line1\nline2\nline3'
    const mod = 'line1\nchanged\nline3'
    const diff = engine.generateDiff(orig, mod)
    expect(diff.additions).toBe(1)
    expect(diff.deletions).toBe(1)
    expect(diff.hunks.length).toBeGreaterThanOrEqual(1)
  })

  it('detects multi-line additions', () => {
    const orig = 'a\nb'
    const mod = 'a\nx\ny\nz\nb'
    const diff = engine.generateDiff(orig, mod)
    expect(diff.additions).toBe(3)
    expect(diff.deletions).toBe(0)
  })

  it('detects multi-line removals', () => {
    const orig = 'a\nx\ny\nz\nb'
    const mod = 'a\nb'
    const diff = engine.generateDiff(orig, mod)
    expect(diff.additions).toBe(0)
    expect(diff.deletions).toBe(3)
  })

  it('detects mixed changes', () => {
    const orig = 'a\nb\nc\nd'
    const mod = 'a\nX\nc\nY\nZ'
    const diff = engine.generateDiff(orig, mod)
    expect(diff.additions).toBeGreaterThan(0)
    expect(diff.deletions).toBeGreaterThan(0)
  })

  it('handles new file (original empty)', () => {
    const diff = engine.generateDiff('', 'new content\nline 2')
    expect(diff.isNew).toBe(true)
    expect(diff.isDeleted).toBe(false)
    expect(diff.additions).toBeGreaterThan(0)
  })

  it('handles deleted file (modified empty)', () => {
    const diff = engine.generateDiff('old content\nline 2', '')
    expect(diff.isNew).toBe(false)
    expect(diff.isDeleted).toBe(true)
    expect(diff.deletions).toBeGreaterThan(0)
  })

  it('generates unified diff format with header lines', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod, 'test.ts')
    expect(diff.unified).toContain('--- a/test.ts')
    expect(diff.unified).toContain('+++ b/test.ts')
  })

  it('unified diff contains @@ hunk headers', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod)
    expect(diff.unified).toMatch(/@@ -\d+,\d+ \+\d+,\d+ @@/)
  })

  it('unified diff uses +/- prefixes for changes', () => {
    const orig = 'hello'
    const mod = 'world'
    const diff = engine.generateDiff(orig, mod)
    expect(diff.unified).toContain('-hello')
    expect(diff.unified).toContain('+world')
  })

  it('uses default file path "file" when none provided', () => {
    const diff = engine.generateDiff('a', 'b')
    expect(diff.originalPath).toBe('file')
    expect(diff.modifiedPath).toBe('file')
  })

  it('preserves the file path in the diff', () => {
    const diff = engine.generateDiff('a', 'b', 'src/index.ts')
    expect(diff.originalPath).toBe('src/index.ts')
    expect(diff.modifiedPath).toBe('src/index.ts')
  })

  it('creates separate hunks for distant changes', () => {
    const lines = Array.from({ length: 20 }, (_, i) => `line${i}`)
    const modLines = [...lines]
    modLines[2] = 'CHANGED2'
    modLines[17] = 'CHANGED17'
    const diff = engine.generateDiff(lines.join('\n'), modLines.join('\n'))
    expect(diff.hunks.length).toBe(2)
  })

  it('handles both strings being empty', () => {
    const diff = engine.generateDiff('', '')
    expect(diff.hunks).toHaveLength(0)
    expect(diff.additions).toBe(0)
    expect(diff.deletions).toBe(0)
    expect(diff.isNew).toBe(true)
    expect(diff.isDeleted).toBe(true)
  })

  it('hunk lines have correct originalLine and modifiedLine numbers', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod)
    const removeLine = diff.hunks[0].lines.find(l => l.type === 'remove')
    const addLine = diff.hunks[0].lines.find(l => l.type === 'add')
    expect(removeLine?.originalLine).toBeDefined()
    expect(addLine?.modifiedLine).toBeDefined()
  })
})

// ── applyDiff Tests ──

describe('DiffEngine applyDiff', () => {
  let engine: DiffEngine

  beforeEach(() => {
    engine = new DiffEngine()
  })

  it('applies a simple diff and produces the expected result', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod)
    const result = engine.applyDiff(orig, diff)
    expect(result.success).toBe(true)
    expect(result.code).toBe(mod)
  })

  it('reports correct hunksApplied count', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod)
    const result = engine.applyDiff(orig, diff)
    expect(result.hunksApplied).toBe(diff.hunks.length)
    expect(result.hunksFailed).toBe(0)
  })

  it('applies addition-only diff', () => {
    const orig = 'a\nb'
    const mod = 'a\nx\ny\nb'
    const diff = engine.generateDiff(orig, mod)
    const result = engine.applyDiff(orig, diff)
    expect(result.success).toBe(true)
    expect(result.code).toBe(mod)
  })

  it('applies removal-only diff', () => {
    const orig = 'a\nx\ny\nb'
    const mod = 'a\nb'
    const diff = engine.generateDiff(orig, mod)
    const result = engine.applyDiff(orig, diff)
    expect(result.success).toBe(true)
    expect(result.code).toBe(mod)
  })

  it('applies diff with multiple hunks', () => {
    const lines = Array.from({ length: 20 }, (_, i) => `line${i}`)
    const modLines = [...lines]
    modLines[2] = 'CHANGED2'
    modLines[17] = 'CHANGED17'
    const orig = lines.join('\n')
    const mod = modLines.join('\n')
    const diff = engine.generateDiff(orig, mod)
    const result = engine.applyDiff(orig, diff)
    expect(result.success).toBe(true)
    expect(result.code).toBe(mod)
  })

  it('reports failed hunks when context does not match', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod)
    // Apply to different code
    const different = 'x\ny\nz'
    const result = engine.applyDiff(different, diff)
    expect(result.hunksFailed).toBeGreaterThan(0)
    expect(result.success).toBe(false)
    expect(result.conflicts.length).toBeGreaterThan(0)
  })

  it('returns empty conflicts array on successful apply', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod)
    const result = engine.applyDiff(orig, diff)
    expect(result.conflicts).toEqual([])
  })

  it('handles applying diff to new file (empty original)', () => {
    const diff = engine.generateDiff('', 'hello\nworld')
    const result = engine.applyDiff('', diff)
    expect(result.success).toBe(true)
    expect(result.code).toBe('hello\nworld')
  })

  it('handles applying diff for deletion (to empty)', () => {
    const orig = 'hello\nworld'
    const diff = engine.generateDiff(orig, '')
    const result = engine.applyDiff(orig, diff)
    expect(result.success).toBe(true)
    expect(result.code).toBe('')
  })
})

// ── validateDiff Tests ──

describe('DiffEngine validateDiff', () => {
  let engine: DiffEngine

  beforeEach(() => {
    engine = new DiffEngine()
  })

  it('validates a correct diff as valid', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod)
    const result = engine.validateDiff(orig, diff)
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('detects context mismatch', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod)
    // Validate against different code
    const different = 'z\nb\nc'
    const result = engine.validateDiff(different, diff)
    // Check if issues are detected (context line 'a' vs 'z')
    const hasContextOrRemoveMismatch = result.issues.some(
      i => i.includes('Context mismatch') || i.includes('Remove target mismatch'),
    )
    expect(hasContextOrRemoveMismatch).toBe(true)
  })

  it('detects remove target mismatch', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nc'
    const diff = engine.generateDiff(orig, mod)
    // Change the line that should be removed
    const different = 'a\nZ\nc'
    const result = engine.validateDiff(different, diff)
    const hasRemoveMismatch = result.issues.some(i => i.includes('Remove target mismatch'))
    expect(hasRemoveMismatch).toBe(true)
  })

  it('detects out of range hunk', () => {
    const orig = 'a\nb\nc'
    const mod = 'a\nX\nc'
    const diff = engine.generateDiff(orig, mod)
    // Manually adjust hunk to start beyond file
    const badDiff: FileDiff = {
      ...diff,
      hunks: diff.hunks.map(h => ({ ...h, originalStart: 999 })),
    }
    const result = engine.validateDiff(orig, badDiff)
    expect(result.valid).toBe(false)
    expect(result.issues.some(i => i.includes('only has'))).toBe(true)
  })

  it('returns valid for empty diff (no hunks)', () => {
    const text = 'same\ncontent'
    const diff = engine.generateDiff(text, text)
    const result = engine.validateDiff(text, diff)
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('validates diff against matching code returns no issues', () => {
    const orig = 'function hello() {\n  return "hi"\n}'
    const mod = 'function hello() {\n  return "hello"\n}'
    const diff = engine.generateDiff(orig, mod)
    const result = engine.validateDiff(orig, diff)
    expect(result.valid).toBe(true)
  })
})

// ── createBatch Tests ──

describe('DiffEngine createBatch', () => {
  let engine: DiffEngine

  beforeEach(() => {
    engine = new DiffEngine()
  })

  it('creates a batch with correct description', () => {
    const batch = engine.createBatch('Refactor', [{ path: 'a.ts', original: 'a', modified: 'b' }])
    expect(batch.description).toBe('Refactor')
  })

  it('includes all file diffs', () => {
    const batch = engine.createBatch('Multi-file', [
      { path: 'a.ts', original: 'a', modified: 'b' },
      { path: 'b.ts', original: 'x', modified: 'y' },
      { path: 'c.ts', original: '1', modified: '2' },
    ])
    expect(batch.diffs).toHaveLength(3)
    expect(batch.filesChanged).toBe(3)
  })

  it('computes totalAdditions correctly', () => {
    const batch = engine.createBatch('Add files', [
      { path: 'a.ts', original: '', modified: 'line1\nline2' },
      { path: 'b.ts', original: '', modified: 'hello' },
    ])
    const expected = batch.diffs.reduce((sum, d) => sum + d.additions, 0)
    expect(batch.totalAdditions).toBe(expected)
  })

  it('computes totalDeletions correctly', () => {
    const batch = engine.createBatch('Remove files', [
      { path: 'a.ts', original: 'line1\nline2', modified: '' },
      { path: 'b.ts', original: 'hello', modified: '' },
    ])
    const expected = batch.diffs.reduce((sum, d) => sum + d.deletions, 0)
    expect(batch.totalDeletions).toBe(expected)
  })

  it('handles empty change list', () => {
    const batch = engine.createBatch('Empty', [])
    expect(batch.diffs).toHaveLength(0)
    expect(batch.filesChanged).toBe(0)
    expect(batch.totalAdditions).toBe(0)
    expect(batch.totalDeletions).toBe(0)
  })

  it('sets correct paths on each diff', () => {
    const batch = engine.createBatch('Paths', [
      { path: 'src/foo.ts', original: 'a', modified: 'b' },
      { path: 'src/bar.ts', original: 'x', modified: 'y' },
    ])
    expect(batch.diffs[0].originalPath).toBe('src/foo.ts')
    expect(batch.diffs[1].originalPath).toBe('src/bar.ts')
  })
})

// ── mergeDiffs Tests ──

describe('DiffEngine mergeDiffs', () => {
  let engine: DiffEngine

  beforeEach(() => {
    engine = new DiffEngine()
  })

  it('merges two non-overlapping diffs', () => {
    const lines = Array.from({ length: 20 }, (_, i) => `line${i}`)
    const mod1 = [...lines]
    mod1[1] = 'CHANGED1'
    const mod2 = [...lines]
    mod2[18] = 'CHANGED18'

    const diff1 = engine.generateDiff(lines.join('\n'), mod1.join('\n'), 'file.ts')
    const diff2 = engine.generateDiff(lines.join('\n'), mod2.join('\n'), 'file.ts')

    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.hunks.length).toBe(diff1.hunks.length + diff2.hunks.length)
  })

  it('combines additions from both diffs', () => {
    const orig = 'a\nb\nc'
    const diff1 = engine.generateDiff(orig, 'a\nX\nb\nc', 'f.ts')
    const diff2 = engine.generateDiff(orig, 'a\nb\nc\nY', 'f.ts')

    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.additions).toBe(diff1.additions + diff2.additions)
  })

  it('combines deletions from both diffs', () => {
    const diff1 = engine.generateDiff('a\nb\nc', 'a\nc', 'f.ts')
    const diff2 = engine.generateDiff('x\ny\nz', 'x\nz', 'f.ts')

    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.deletions).toBe(diff1.deletions + diff2.deletions)
  })

  it('preserves original path from first diff', () => {
    const diff1 = engine.generateDiff('a', 'b', 'first.ts')
    const diff2 = engine.generateDiff('x', 'y', 'second.ts')

    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.originalPath).toBe('first.ts')
    expect(merged.modifiedPath).toBe('first.ts')
  })

  it('generates unified output for merged diff', () => {
    const diff1 = engine.generateDiff('a', 'b', 'f.ts')
    const diff2 = engine.generateDiff('x', 'y', 'f.ts')

    const merged = engine.mergeDiffs(diff1, diff2)
    expect(merged.unified).toContain('--- a/f.ts')
    expect(merged.unified).toContain('+++ b/f.ts')
  })

  it('sorts merged hunks by originalStart', () => {
    const lines = Array.from({ length: 20 }, (_, i) => `line${i}`)
    const mod1 = [...lines]
    mod1[15] = 'LATE_CHANGE'
    const mod2 = [...lines]
    mod2[2] = 'EARLY_CHANGE'

    const diff1 = engine.generateDiff(lines.join('\n'), mod1.join('\n'), 'f.ts')
    const diff2 = engine.generateDiff(lines.join('\n'), mod2.join('\n'), 'f.ts')

    const merged = engine.mergeDiffs(diff1, diff2)
    for (let i = 0; i < merged.hunks.length - 1; i++) {
      expect(merged.hunks[i].originalStart).toBeLessThanOrEqual(merged.hunks[i + 1].originalStart)
    }
  })
})

// ── getStats Tests ──

describe('DiffEngine getStats', () => {
  let engine: DiffEngine

  beforeEach(() => {
    engine = new DiffEngine()
  })

  it('returns correct additions count', () => {
    const diff = engine.generateDiff('a', 'a\nb\nc')
    const stats = engine.getStats(diff)
    expect(stats.additions).toBe(diff.additions)
  })

  it('returns correct deletions count', () => {
    const diff = engine.generateDiff('a\nb\nc', 'a')
    const stats = engine.getStats(diff)
    expect(stats.deletions).toBe(diff.deletions)
  })

  it('returns correct hunks count', () => {
    const lines = Array.from({ length: 20 }, (_, i) => `line${i}`)
    const modLines = [...lines]
    modLines[2] = 'CHANGED'
    modLines[17] = 'CHANGED'
    const diff = engine.generateDiff(lines.join('\n'), modLines.join('\n'))
    const stats = engine.getStats(diff)
    expect(stats.hunks).toBe(diff.hunks.length)
  })

  it('computes netChange as additions minus deletions', () => {
    const diff = engine.generateDiff('a\nb\nc', 'a\nX\nY\nZ\nc')
    const stats = engine.getStats(diff)
    expect(stats.netChange).toBe(stats.additions - stats.deletions)
  })

  it('returns zero stats for identical content', () => {
    const diff = engine.generateDiff('same', 'same')
    const stats = engine.getStats(diff)
    expect(stats.additions).toBe(0)
    expect(stats.deletions).toBe(0)
    expect(stats.hunks).toBe(0)
    expect(stats.netChange).toBe(0)
  })

  it('returns positive net change for pure additions', () => {
    const diff = engine.generateDiff('a', 'a\nb\nc')
    const stats = engine.getStats(diff)
    expect(stats.netChange).toBeGreaterThan(0)
  })

  it('returns negative net change for pure deletions', () => {
    const diff = engine.generateDiff('a\nb\nc', 'a')
    const stats = engine.getStats(diff)
    expect(stats.netChange).toBeLessThan(0)
  })

  it('returns zero net change for equal adds and removes', () => {
    const diff = engine.generateDiff('old', 'new')
    const stats = engine.getStats(diff)
    expect(stats.netChange).toBe(0)
  })
})
