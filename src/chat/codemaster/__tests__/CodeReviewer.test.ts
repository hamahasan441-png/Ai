import { describe, it, expect, beforeEach } from 'vitest'
import { CodeReviewer } from '../CodeReviewer'
import { CodeAnalyzer } from '../CodeAnalyzer'

// ── Constructor Tests ──

describe('CodeReviewer constructor', () => {
  it('creates an instance with default analyzer', () => {
    const reviewer = new CodeReviewer()
    expect(reviewer).toBeInstanceOf(CodeReviewer)
  })

  it('creates an instance with a custom analyzer', () => {
    const analyzer = new CodeAnalyzer({ depth: 'deep', securityLevel: 'strict' })
    const reviewer = new CodeReviewer(analyzer)
    expect(reviewer).toBeInstanceOf(CodeReviewer)
    expect(reviewer.getAnalyzer()).toBe(analyzer)
  })

  it('uses a standard-depth analyzer when none is provided', () => {
    const reviewer = new CodeReviewer()
    expect(reviewer.getAnalyzer()).toBeInstanceOf(CodeAnalyzer)
  })
})

// ── review Tests ──

describe('CodeReviewer review', () => {
  let reviewer: CodeReviewer

  beforeEach(() => {
    reviewer = new CodeReviewer()
  })

  it('returns a CodeReviewOutput with all required fields', () => {
    const code = `
function add(a: number, b: number): number {
  return a + b
}
    `
    const result = reviewer.review(code, 'typescript')
    expect(Array.isArray(result.findings)).toBe(true)
    expect(result.summary).toBeDefined()
    expect(typeof result.overallScore).toBe('number')
    expect(Array.isArray(result.topIssues)).toBe(true)
    expect(Array.isArray(result.suggestedFixes)).toBe(true)
  })

  it('overallScore is between 0 and 100', () => {
    const code = `
function greet(name: string): string {
  return "Hello, " + name
}
    `
    const result = reviewer.review(code, 'typescript')
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
  })

  it('detects loose equality as a bug finding', () => {
    const code = `
function check(x: number) {
  if (x == 0) {
    return true
  }
}
    `
    const result = reviewer.review(code, 'typescript')
    const eqFinding = result.findings.find(f => f.title === 'Loose equality comparison')
    expect(eqFinding).toBeDefined()
    expect(eqFinding!.category).toBe('bug')
    expect(eqFinding!.severity).toBe('medium')
  })

  it('generates auto-fix for loose equality', () => {
    const code = `
function check(x: number) {
  if (x == 0) {
    return true
  }
}
    `
    const result = reviewer.review(code, 'typescript')
    const fix = result.suggestedFixes.find(f => {
      const finding = result.findings.find(fi => fi.id === f.findingId)
      return finding?.title === 'Loose equality comparison'
    })
    expect(fix).toBeDefined()
    expect(fix!.applied).toBe(false)
    expect(fix!.validated).toBe(true)
  })

  it('detects empty catch block as a best-practice finding', () => {
    const code = `
try {
  doSomething()
} catch (e) {}
    `
    const result = reviewer.review(code, 'typescript')
    const catchFinding = result.findings.find(f => f.title === 'Empty catch block')
    expect(catchFinding).toBeDefined()
    expect(catchFinding!.category).toBe('best-practice')
    expect(catchFinding!.severity).toBe('high')
  })

  it('detects nested ternary as a style finding', () => {
    const code = `const val = a ? b ? 1 : 2 : 3`
    const result = reviewer.review(code, 'typescript')
    const ternaryFinding = result.findings.find(f => f.title === 'Nested ternary expression')
    expect(ternaryFinding).toBeDefined()
    expect(ternaryFinding!.category).toBe('style')
  })

  it('detects missing JSDoc on exported function', () => {
    const code = `export function doWork(input: string): string {
  return input.trim()
}`
    const result = reviewer.review(code, 'typescript')
    const docFinding = result.findings.find(f => f.title === 'Missing JSDoc on exported function')
    expect(docFinding).toBeDefined()
    expect(docFinding!.category).toBe('documentation')
    expect(docFinding!.severity).toBe('info')
  })

  it('filters findings when focus categories are provided', () => {
    const code = `
function check(x) {
  if (x == 0) {
    return true
  }
}
export function doWork() { return 1 }
    `
    const result = reviewer.review(code, 'javascript', ['documentation'])
    const nonDocFindings = result.findings.filter(f => f.category !== 'documentation')
    // Rule-based findings outside the focus should not appear
    const bugRuleFindings = nonDocFindings.filter(f =>
      f.title === 'Loose equality comparison' || f.title === 'Empty catch block',
    )
    expect(bugRuleFindings.length).toBe(0)
  })

  it('summary counts match the actual findings', () => {
    const code = `
function check(x) {
  if (x == 0) {
    return true
  }
}
    `
    const result = reviewer.review(code, 'javascript')
    const { summary, findings } = result
    expect(summary.critical).toBe(findings.filter(f => f.severity === 'critical').length)
    expect(summary.high).toBe(findings.filter(f => f.severity === 'high').length)
    expect(summary.medium).toBe(findings.filter(f => f.severity === 'medium').length)
    expect(summary.low).toBe(findings.filter(f => f.severity === 'low').length)
    expect(summary.info).toBe(findings.filter(f => f.severity === 'info').length)
  })

  it('topIssues contains at most 3 entries', () => {
    const code = `
function a(x) { if (x == 0) { return x } }
function b(y) { if (y == 1) { return y } }
function c(z) { if (z == 2) { return z } }
function d(w) { if (w == 3) { return w } }
    `
    const result = reviewer.review(code, 'javascript')
    expect(result.topIssues.length).toBeLessThanOrEqual(3)
  })

  it('findings are sorted by severity (critical first)', () => {
    const code = `
try {
  const x = data.length
  if (x == 0) { return }
} catch (e) {}
    `
    const result = reviewer.review(code, 'typescript')
    const severityOrder: Record<string, number> = {
      critical: 0, high: 1, medium: 2, low: 3, info: 4,
    }
    for (let i = 1; i < result.findings.length; i++) {
      const prev = severityOrder[result.findings[i - 1].severity]
      const curr = severityOrder[result.findings[i].severity]
      expect(prev).toBeLessThanOrEqual(curr)
    }
  })

  it('deduplicates findings on same line and category', () => {
    // A single line matching a rule should produce at most one finding for that rule
    const code = `const val = items.length`
    const result = reviewer.review(code, 'typescript')
    const nullFindings = result.findings.filter(
      f => f.title === 'Missing null/undefined check' && f.line === 1,
    )
    expect(nullFindings.length).toBeLessThanOrEqual(1)
  })

  it('each finding has a unique id', () => {
    const code = `
function check(x) {
  if (x == 0) { return true }
  if (x == 1) { return false }
}
    `
    const result = reviewer.review(code, 'javascript')
    const ids = result.findings.map(f => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('auto-detects language when none is provided', () => {
    const code = `
interface Foo { bar: string }
const x: Foo = { bar: "hello" }
    `
    const result = reviewer.review(code)
    expect(result).toBeDefined()
    expect(typeof result.overallScore).toBe('number')
  })
})

// ── reviewDiff Tests ──

describe('CodeReviewer reviewDiff', () => {
  let reviewer: CodeReviewer

  beforeEach(() => {
    reviewer = new CodeReviewer()
  })

  it('reviews only added lines from a unified diff', () => {
    const diff = `--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,5 @@
 const a = 1
+const val = x == 0
+try { run() } catch (e) {}
 const b = 2`
    const result = reviewer.reviewDiff(diff, 'typescript')
    expect(result).toBeDefined()
    expect(Array.isArray(result.findings)).toBe(true)
  })

  it('ignores removed lines in the diff', () => {
    const diff = `--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,2 @@
-const bad = eval("code")
+const good = safeEval("code")
 const b = 2`
    const result = reviewer.reviewDiff(diff, 'typescript')
    // eval usage should not appear since it was in a removed line
    const evalFinding = result.findings.find(f => f.title === 'Security: eval-usage')
    expect(evalFinding).toBeUndefined()
  })

  it('stores diff review in history', () => {
    const diff = `--- a/file.ts
+++ b/file.ts
@@ -1,2 +1,3 @@
 const a = 1
+const b = 2
 const c = 3`
    reviewer.reviewDiff(diff, 'typescript')
    expect(reviewer.getHistory().length).toBe(1)
  })
})

// ── getHistory Tests ──

describe('CodeReviewer getHistory', () => {
  let reviewer: CodeReviewer

  beforeEach(() => {
    reviewer = new CodeReviewer()
  })

  it('returns an empty array when no reviews have been performed', () => {
    expect(reviewer.getHistory()).toEqual([])
  })

  it('accumulates reviews in order', () => {
    reviewer.review('const a = 1', 'typescript')
    reviewer.review('const b = 2', 'typescript')
    const history = reviewer.getHistory()
    expect(history.length).toBe(2)
  })

  it('returns a copy so mutations do not affect internal state', () => {
    reviewer.review('const a = 1', 'typescript')
    const history = reviewer.getHistory()
    history.pop()
    expect(reviewer.getHistory().length).toBe(1)
  })
})

// ── clearHistory Tests ──

describe('CodeReviewer clearHistory', () => {
  it('empties the review history', () => {
    const reviewer = new CodeReviewer()
    reviewer.review('const x = 1', 'typescript')
    reviewer.review('const y = 2', 'typescript')
    expect(reviewer.getHistory().length).toBe(2)
    reviewer.clearHistory()
    expect(reviewer.getHistory()).toEqual([])
  })
})

// ── getAnalyzer Tests ──

describe('CodeReviewer getAnalyzer', () => {
  it('returns the injected analyzer', () => {
    const analyzer = new CodeAnalyzer({ depth: 'deep' })
    const reviewer = new CodeReviewer(analyzer)
    expect(reviewer.getAnalyzer()).toBe(analyzer)
  })

  it('returns an auto-created analyzer when none was injected', () => {
    const reviewer = new CodeReviewer()
    expect(reviewer.getAnalyzer()).toBeInstanceOf(CodeAnalyzer)
  })
})

// ── Edge Cases ──

describe('CodeReviewer edge cases', () => {
  let reviewer: CodeReviewer

  beforeEach(() => {
    reviewer = new CodeReviewer()
  })

  it('handles empty string input gracefully', () => {
    const result = reviewer.review('')
    expect(result.findings).toBeDefined()
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
  })

  it('handles code with no issues and returns a high score', () => {
    const code = `
function add(a: number, b: number): number {
  return a + b
}
    `
    const result = reviewer.review(code, 'typescript')
    expect(result.overallScore).toBeGreaterThanOrEqual(50)
  })
})
