import { describe, it, expect } from 'vitest'
import { TestCoverageAnalyzer } from '../TestCoverageAnalyzer'

// ── Constructor ──────────────────────────────────────────────────────────────

describe('TestCoverageAnalyzer constructor', () => {
  it('creates an instance', () => {
    const analyzer = new TestCoverageAnalyzer()
    expect(analyzer).toBeInstanceOf(TestCoverageAnalyzer)
  })
})

// ── Empty / Null Source Code ─────────────────────────────────────────────────

describe('analyze – empty/null source code', () => {
  it('returns default analysis for empty string', () => {
    const analyzer = new TestCoverageAnalyzer()
    const result = analyzer.analyze('')
    expect(result.testableFunctions).toEqual([])
    expect(result.testCases).toEqual([])
    expect(result.gaps).toEqual([])
    expect(result.functionCoverage).toBe(100)
    expect(result.branchCoverage).toBe(100)
    expect(result.testQualityScore).toBe(100)
    expect(result.summary).toBe('No source code to analyze.')
  })

  it('returns default analysis for whitespace-only string', () => {
    const result = new TestCoverageAnalyzer().analyze('   \n\n  ')
    expect(result.summary).toBe('No source code to analyze.')
  })
})

// ── Function Extraction ──────────────────────────────────────────────────────

describe('analyze – function extraction', () => {
  it('extracts an exported function', () => {
    const source = 'export function greet(name: string) {\n  return `Hello ${name}`\n}'
    const result = new TestCoverageAnalyzer().analyze(source)
    expect(result.testableFunctions.length).toBeGreaterThanOrEqual(1)
    const fn = result.testableFunctions.find(f => f.name === 'greet')
    expect(fn).toBeDefined()
    expect(fn!.isExported).toBe(true)
  })

  it('extracts an async exported function', () => {
    const source = 'export async function fetchData() {\n  return await fetch("/api")\n}'
    const result = new TestCoverageAnalyzer().analyze(source)
    const fn = result.testableFunctions.find(f => f.name === 'fetchData')
    expect(fn).toBeDefined()
    expect(fn!.isAsync).toBe(true)
    expect(fn!.isExported).toBe(true)
  })

  it('extracts a non-exported function', () => {
    const source = 'function helper() {\n  return 1\n}'
    const result = new TestCoverageAnalyzer().analyze(source)
    const fn = result.testableFunctions.find(f => f.name === 'helper')
    expect(fn).toBeDefined()
    expect(fn!.isExported).toBe(false)
  })

  it('extracts an arrow function assigned to const', () => {
    const source = 'const add = (a: number, b: number) => {\n  return a + b\n}'
    const result = new TestCoverageAnalyzer().analyze(source)
    const fn = result.testableFunctions.find(f => f.name === 'add')
    expect(fn).toBeDefined()
  })

  it('extracts a class method', () => {
    const source = [
      'class Service {',
      '  process(data: string) {',
      '    return data.toUpperCase()',
      '  }',
      '}',
    ].join('\n')
    const result = new TestCoverageAnalyzer().analyze(source)
    const fn = result.testableFunctions.find(f => f.name === 'process')
    expect(fn).toBeDefined()
  })

  it('skips constructors and private _ methods', () => {
    const source = [
      'class Service {',
      '  constructor() { }',
      '  _internal() { return 1 }',
      '  public run() { return 2 }',
      '}',
    ].join('\n')
    const result = new TestCoverageAnalyzer().analyze(source)
    expect(result.testableFunctions.find(f => f.name === 'constructor')).toBeUndefined()
    expect(result.testableFunctions.find(f => f.name === '_internal')).toBeUndefined()
    expect(result.testableFunctions.find(f => f.name === 'run')).toBeDefined()
  })

  it('skips comment lines', () => {
    const source = '// function notReal() {}\nfunction real() {\n  return 1\n}'
    const result = new TestCoverageAnalyzer().analyze(source)
    expect(result.testableFunctions.find(f => f.name === 'notReal')).toBeUndefined()
    expect(result.testableFunctions.find(f => f.name === 'real')).toBeDefined()
  })
})

// ── Branch / Complexity Detection ────────────────────────────────────────────

describe('analyze – branch counting and complexity', () => {
  it('detects branches and assigns high complexity', () => {
    const source = [
      'export function complex(a: number) {',
      '  if (a > 0) { }',
      '  if (a < 0) { }',
      '  switch (a) {',
      '    case 1: break',
      '    case 2: break',
      '  }',
      '  try { } catch (e) { }',
      '  const x = a > 0 ? 1 : 0',
      '}',
    ].join('\n')
    const result = new TestCoverageAnalyzer().analyze(source)
    const fn = result.testableFunctions.find(f => f.name === 'complex')
    expect(fn).toBeDefined()
    expect(fn!.branchCount).toBeGreaterThanOrEqual(5)
    expect(fn!.complexity).toBe('high')
  })

  it('assigns low complexity to simple functions', () => {
    const source = 'export function simple() {\n  return 42\n}'
    const result = new TestCoverageAnalyzer().analyze(source)
    const fn = result.testableFunctions.find(f => f.name === 'simple')
    expect(fn).toBeDefined()
    expect(fn!.complexity).toBe('low')
  })
})

// ── Test Case Extraction ─────────────────────────────────────────────────────

describe('analyze – test case extraction', () => {
  it('extracts test cases from it() calls', () => {
    const testCode = [
      "it('should work', () => {",
      '  expect(1).toBe(1)',
      '})',
    ].join('\n')
    const result = new TestCoverageAnalyzer().analyze('function a() { return 1 }', testCode)
    expect(result.testCases.length).toBeGreaterThanOrEqual(1)
    expect(result.testCases[0].name).toBe('should work')
  })

  it('extracts test cases from test() calls', () => {
    const testCode = [
      "test('validates input', () => {",
      '  expect(validate("x")).toBeTruthy()',
      '})',
    ].join('\n')
    const result = new TestCoverageAnalyzer().analyze('function validate(x: string) { return true }', testCode)
    const tc = result.testCases.find(t => t.name === 'validates input')
    expect(tc).toBeDefined()
  })

  it('counts assertions inside test bodies', () => {
    const testCode = [
      "it('has assertions', () => {",
      '  expect(1).toBe(1)',
      '  expect(2).toEqual(2)',
      '  expect(3).toBeDefined()',
      '})',
    ].join('\n')
    const result = new TestCoverageAnalyzer().analyze('function a() {}', testCode)
    expect(result.testCases[0].assertionCount).toBeGreaterThanOrEqual(3)
  })

  it('classifies error-case test type', () => {
    const testCode = "it('should throw error for invalid input', () => {\n  expect(() => fn()).toThrow()\n})"
    const result = new TestCoverageAnalyzer().analyze('function fn() {}', testCode)
    const tc = result.testCases.find(t => t.name.includes('error'))
    expect(tc).toBeDefined()
    expect(tc!.type).toBe('error-case')
  })

  it('classifies edge-case test type', () => {
    const testCode = "it('handles empty array', () => {\n  expect(fn([])).toEqual([])\n})"
    const result = new TestCoverageAnalyzer().analyze('function fn(a: any[]) { return a }', testCode)
    const tc = result.testCases.find(t => t.name.includes('empty'))
    expect(tc).toBeDefined()
    expect(tc!.type).toBe('edge-case')
  })

  it('classifies integration test type', () => {
    const testCode = "it('integration: fetches data end to end', () => {\n  expect(1).toBe(1)\n})"
    const result = new TestCoverageAnalyzer().analyze('function fn() {}', testCode)
    const tc = result.testCases.find(t => t.name.includes('integration'))
    expect(tc).toBeDefined()
    expect(tc!.type).toBe('integration')
  })

  it('classifies snapshot test type', () => {
    const testCode = "it('matches snapshot', () => {\n  expect(render()).toMatchSnapshot()\n})"
    const result = new TestCoverageAnalyzer().analyze('function render() {}', testCode)
    const tc = result.testCases.find(t => t.name.includes('snapshot'))
    expect(tc).toBeDefined()
    expect(tc!.type).toBe('snapshot')
  })

  it('skips describe blocks (not counted as test cases)', () => {
    const testCode = "describe('MyModule', () => {\n  it('works', () => {\n    expect(1).toBe(1)\n  })\n})"
    const result = new TestCoverageAnalyzer().analyze('function a() {}', testCode)
    expect(result.testCases.some(t => t.name === 'MyModule')).toBe(false)
  })
})

// ── Test-to-Function Mapping ─────────────────────────────────────────────────

describe('analyze – test-to-function mapping', () => {
  it('marks function as tested when test name includes function name', () => {
    const source = 'export function calculate() {\n  return 42\n}'
    const testCode = "it('should calculate correctly', () => {\n  expect(calculate()).toBe(42)\n})"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    const fn = result.testableFunctions.find(f => f.name === 'calculate')
    expect(fn).toBeDefined()
    expect(fn!.isTested).toBe(true)
  })

  it('marks function as tested via camelToKebab matching', () => {
    const source = 'export function myFunc() {\n  return 1\n}'
    const testCode = "it('tests my-func usage', () => {\n  expect(1).toBe(1)\n})"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    const fn = result.testableFunctions.find(f => f.name === 'myFunc')
    expect(fn!.isTested).toBe(true)
  })

  it('marks function as untested when no test references it', () => {
    const source = 'export function untested() {\n  return 1\n}'
    const testCode = "it('tests something else', () => {\n  expect(1).toBe(1)\n})"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    const fn = result.testableFunctions.find(f => f.name === 'untested')
    expect(fn!.isTested).toBe(false)
  })
})

// ── Coverage Gap Detection ───────────────────────────────────────────────────

describe('analyze – coverage gaps', () => {
  it('reports untested-export gap for untested exported function', () => {
    const source = 'export function publicApi() {\n  return 1\n}'
    const testCode = "it('unrelated test', () => { expect(1).toBe(1) })"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    const gap = result.gaps.find(g => g.type === 'untested-export')
    expect(gap).toBeDefined()
    expect(gap!.target).toBe('publicApi')
    expect(gap!.severity).toBe('high')
  })

  it('reports untested-function gap for non-low complexity untested function', () => {
    const source = [
      'function process(x: number) {',
      '  if (x > 0) { return 1 }',
      '  if (x < 0) { return -1 }',
      '  return 0',
      '}',
    ].join('\n')
    const testCode = "it('other', () => { expect(1).toBe(1) })"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    const gap = result.gaps.find(g => g.type === 'untested-function' && g.target === 'process')
    expect(gap).toBeDefined()
    expect(gap!.severity).toBe('medium')
  })

  it('reports untested-error-path when source has throw but no error tests', () => {
    const source = 'export function validate(x: string) {\n  if (!x) throw new Error("invalid")\n  return true\n}'
    const testCode = "it('validates ok', () => {\n  expect(validate('a')).toBe(true)\n})"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    const gap = result.gaps.find(g => g.type === 'untested-error-path')
    expect(gap).toBeDefined()
    expect(gap!.severity).toBe('medium')
  })

  it('does not report untested-error-path when error-case test exists', () => {
    const source = 'export function validate(x: string) {\n  if (!x) throw new Error("invalid")\n  return true\n}'
    const testCode = [
      "it('should throw error for empty', () => { expect(() => validate('')).toThrow() })",
      "it('validates ok', () => { expect(validate('a')).toBe(true) })",
    ].join('\n')
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    expect(result.gaps.find(g => g.type === 'untested-error-path')).toBeUndefined()
  })

  it('reports missing-edge-case when >3 functions but no edge tests', () => {
    const source = [
      'export function a() { return 1 }',
      'export function b() { return 2 }',
      'export function c() { return 3 }',
      'export function d() { return 4 }',
    ].join('\n')
    const testCode = "it('basic', () => { expect(a()).toBe(1) })"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    const gap = result.gaps.find(g => g.type === 'missing-edge-case')
    expect(gap).toBeDefined()
    expect(gap!.severity).toBe('low')
  })

  it('reports low-assertion-count for tests with no assertions', () => {
    const source = 'export function doSomething() { return 1 }'
    const testCode = "it('should do something', () => {\n  doSomething()\n})"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    const gap = result.gaps.find(g => g.type === 'low-assertion-count')
    expect(gap).toBeDefined()
    expect(gap!.severity).toBe('medium')
  })

  it('reports missing-test-file when no test code provided and functions exist', () => {
    const source = 'export function a() { return 1 }\nexport function b() { return 2 }'
    const result = new TestCoverageAnalyzer().analyze(source)
    const gap = result.gaps.find(g => g.type === 'missing-test-file')
    expect(gap).toBeDefined()
    expect(gap!.severity).toBe('high')
  })
})

// ── Function Coverage Calculation ────────────────────────────────────────────

describe('analyze – function coverage', () => {
  it('returns 100% when all functions are tested', () => {
    const source = 'export function doWork() {\n  return 1\n}'
    const testCode = "it('doWork returns 1', () => {\n  expect(doWork()).toBe(1)\n})"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    expect(result.functionCoverage).toBe(100)
  })

  it('returns 0% when no functions are tested', () => {
    const source = 'export function zzUnique() { return 1 }\nexport function yyDistinct() { return 2 }'
    const testCode = "it('something else', () => { expect(1).toBe(1) })"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    expect(result.functionCoverage).toBe(0)
  })

  it('returns 100% when source has no functions', () => {
    const source = 'const x = 1'
    const result = new TestCoverageAnalyzer().analyze(source)
    expect(result.functionCoverage).toBe(100)
  })
})

// ── Branch Coverage Estimation ───────────────────────────────────────────────

describe('analyze – branch coverage estimation', () => {
  it('returns a numeric percentage for branch coverage', () => {
    const source = [
      'export function decide(x: number) {',
      '  if (x > 0) return "pos"',
      '  if (x < 0) return "neg"',
      '  return "zero"',
      '}',
    ].join('\n')
    const testCode = "it('decide pos', () => { expect(decide(1)).toBe('pos') })"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    expect(result.branchCoverage).toBeGreaterThanOrEqual(0)
    expect(result.branchCoverage).toBeLessThanOrEqual(100)
  })
})

// ── Test Quality Scoring ─────────────────────────────────────────────────────

describe('analyze – test quality scoring', () => {
  it('returns 0 when no test cases exist', () => {
    const source = 'export function a() { return 1 }'
    const result = new TestCoverageAnalyzer().analyze(source)
    expect(result.testQualityScore).toBe(0)
  })

  it('gives bonus for error-case and edge-case diversity', () => {
    const source = 'export function work() {\n  return 1\n}'
    const testCodeDiverse = [
      "it('works', () => { expect(work()).toBe(1) })",
      "it('handles error for bad input', () => { expect(1).toBe(1) })",
      "it('handles empty edge case', () => { expect(1).toBe(1) })",
    ].join('\n')
    const testCodeBasic = [
      "it('works', () => { expect(work()).toBe(1) })",
      "it('another', () => { expect(2).toBe(2) })",
      "it('third', () => { expect(3).toBe(3) })",
    ].join('\n')
    const diverseResult = new TestCoverageAnalyzer().analyze(source, testCodeDiverse)
    const basicResult = new TestCoverageAnalyzer().analyze(source, testCodeBasic)
    expect(diverseResult.testQualityScore).toBeGreaterThanOrEqual(basicResult.testQualityScore)
  })

  it('penalizes low average assertion count', () => {
    const source = 'export function a() { return 1 }'
    const testCode = "it('a test with no assertion', () => {\n  a()\n})"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    expect(result.testQualityScore).toBeLessThan(100)
  })
})

// ── analyzeTestQuality Standalone ────────────────────────────────────────────

describe('analyzeTestQuality', () => {
  it('returns empty result for empty test code', () => {
    const result = new TestCoverageAnalyzer().analyzeTestQuality('')
    expect(result.testCases).toEqual([])
    expect(result.qualityScore).toBe(0)
    expect(result.summary).toBe('No test code to analyze.')
  })

  it('returns empty result for whitespace-only test code', () => {
    const result = new TestCoverageAnalyzer().analyzeTestQuality('  \n  ')
    expect(result.qualityScore).toBe(0)
  })

  it('extracts test cases and computes quality score', () => {
    const testCode = [
      "it('should add numbers', () => {",
      '  expect(add(1, 2)).toBe(3)',
      '  expect(add(0, 0)).toBe(0)',
      '})',
      "it('should handle error for negative', () => {",
      '  expect(() => add(-1, -2)).toThrow()',
      '})',
    ].join('\n')
    const result = new TestCoverageAnalyzer().analyzeTestQuality(testCode)
    expect(result.testCases.length).toBe(2)
    expect(result.qualityScore).toBeGreaterThan(0)
    expect(result.summary).toContain('2 test case(s) found')
  })
})

// ── Summary Generation ───────────────────────────────────────────────────────

describe('analyze – summary', () => {
  it('includes function count, test count, and coverage in summary', () => {
    const source = 'export function hello() {\n  return "hi"\n}'
    const testCode = "it('hello works', () => {\n  expect(hello()).toBe('hi')\n})"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    expect(result.summary).toContain('testable function(s)')
    expect(result.summary).toContain('test case(s)')
    expect(result.summary).toContain('Function coverage')
    expect(result.summary).toContain('Branch coverage')
    expect(result.summary).toContain('Test quality score')
  })

  it('includes gap count in summary when gaps exist', () => {
    const source = 'export function untested() { return 1 }'
    const testCode = "it('unrelated', () => { expect(1).toBe(1) })"
    const result = new TestCoverageAnalyzer().analyze(source, testCode)
    expect(result.summary).toContain('coverage gap(s) found')
  })
})
