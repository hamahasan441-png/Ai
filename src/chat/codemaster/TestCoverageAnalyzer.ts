/**
 * 🧪 TestCoverageAnalyzer — Static Test Coverage Estimation
 *
 * Analyzes test coverage without running tests:
 *   • Function/method coverage estimation (exported vs. tested)
 *   • Untested code path detection (branches without test cases)
 *   • Test quality assessment (assertions, edge cases, error cases)
 *   • Test-to-source mapping
 *   • Missing test file detection
 *   • Test gap analysis (what should be tested but isn't)
 *
 * Works fully offline — static analysis from source + test files.
 */

import type { Severity } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** A function/method that should be tested. */
export interface TestableFunction {
  /** Function name. */
  name: string
  /** Line number. */
  line: number
  /** Whether it's exported (public API). */
  isExported: boolean
  /** Whether it's async. */
  isAsync: boolean
  /** Estimated complexity (high/medium/low). */
  complexity: 'high' | 'medium' | 'low'
  /** Whether a corresponding test was found. */
  isTested: boolean
  /** Number of branches (if/else/switch). */
  branchCount: number
}

/** A test case found. */
export interface TestCase {
  /** Test name/description. */
  name: string
  /** Line number. */
  line: number
  /** Number of assertions. */
  assertionCount: number
  /** Type of test. */
  type: 'unit' | 'integration' | 'edge-case' | 'error-case' | 'snapshot'
}

/** A coverage gap. */
export interface CoverageGap {
  /** Type of gap. */
  type: CoverageGapType
  /** Severity. */
  severity: Severity
  /** Related function/area. */
  target: string
  /** Line number. */
  line: number
  /** Description. */
  description: string
  /** Suggestion. */
  suggestion: string
}

/** Categories of coverage gaps. */
export type CoverageGapType =
  | 'untested-function'
  | 'untested-branch'
  | 'untested-error-path'
  | 'missing-edge-case'
  | 'missing-test-file'
  | 'low-assertion-count'
  | 'untested-export'

/** Result of test coverage analysis. */
export interface TestCoverageAnalysis {
  /** Testable functions found. */
  testableFunctions: TestableFunction[]
  /** Test cases found. */
  testCases: TestCase[]
  /** Coverage gaps. */
  gaps: CoverageGap[]
  /** Estimated function coverage percentage. */
  functionCoverage: number
  /** Estimated branch coverage percentage. */
  branchCoverage: number
  /** Test quality score (0-100). */
  testQualityScore: number
  /** Summary. */
  summary: string
}

// ══════════════════════════════════════════════════════════════════════════════
// TEST COVERAGE ANALYZER
// ══════════════════════════════════════════════════════════════════════════════

export class TestCoverageAnalyzer {
  constructor() {
    // no-op
  }

  /** Analyze source code and test code together. */
  analyze(sourceCode: string, testCode: string = ''): TestCoverageAnalysis {
    if (!sourceCode || !sourceCode.trim()) {
      return {
        testableFunctions: [],
        testCases: [],
        gaps: [],
        functionCoverage: 100,
        branchCoverage: 100,
        testQualityScore: 100,
        summary: 'No source code to analyze.',
      }
    }

    const sourceLines = sourceCode.split('\n')
    const testLines = testCode ? testCode.split('\n') : []

    const testableFunctions = this.extractTestableFunctions(sourceLines)
    const testCases = this.extractTestCases(testLines)

    // Map tests to functions
    this.mapTestsToFunctions(testableFunctions, testCases, testCode)

    // Detect gaps
    const gaps = this.detectGaps(testableFunctions, testCases, sourceLines, testLines)

    // Calculate metrics
    const functionCoverage = this.calculateFunctionCoverage(testableFunctions)
    const branchCoverage = this.estimateBranchCoverage(testableFunctions, testCases)
    const testQualityScore = this.calculateTestQuality(testCases, gaps)

    const summary = this.generateSummary(
      testableFunctions,
      testCases,
      gaps,
      functionCoverage,
      branchCoverage,
      testQualityScore,
    )

    return {
      testableFunctions,
      testCases,
      gaps,
      functionCoverage,
      branchCoverage,
      testQualityScore,
      summary,
    }
  }

  /** Analyze test quality from test code only. */
  analyzeTestQuality(testCode: string): {
    testCases: TestCase[]
    qualityScore: number
    summary: string
  } {
    if (!testCode || !testCode.trim()) {
      return { testCases: [], qualityScore: 0, summary: 'No test code to analyze.' }
    }

    const testLines = testCode.split('\n')
    const testCases = this.extractTestCases(testLines)
    const qualityScore = this.calculateTestQuality(testCases, [])
    const summary = `${testCases.length} test case(s) found. Quality score: ${qualityScore}/100.`
    return { testCases, qualityScore, summary }
  }

  // ── EXTRACTION ─────────────────────────────────────────────────────────

  private extractTestableFunctions(lines: string[]): TestableFunction[] {
    const functions: TestableFunction[] = []
    const funcPatterns = [
      // export function name()
      /export\s+(?:async\s+)?function\s+(\w+)\s*\(/,
      // export const name = () =>
      /export\s+(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>/,
      // public method in class
      /(?:public\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*\w[^{]*)?{/,
      // function name()
      /(?:async\s+)?function\s+(\w+)\s*\(/,
      // const name = () =>
      /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>/,
      // def name() (Python)
      /def\s+(\w+)\s*\(/,
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('#')) continue

      for (const pattern of funcPatterns) {
        const match = pattern.exec(trimmed)
        if (match && match[1]) {
          const name = match[1]
          // Skip constructors, getters/setters, common non-testable
          if (['constructor', 'get', 'set', 'toString', 'valueOf'].includes(name)) continue
          // Skip private methods (starting with _)
          if (name.startsWith('_') && !/^__\w+__$/.test(name)) continue

          const isExported = /\bexport\b/.test(line)
          const isAsync = /\basync\b/.test(line)

          // Count branches in function body
          let branchCount = 0
          let braceDepth = 0
          let started = false
          for (let j = i; j < Math.min(i + 100, lines.length); j++) {
            const bodyLine = lines[j]
            braceDepth += (bodyLine.match(/\{/g) || []).length
            braceDepth -= (bodyLine.match(/\}/g) || []).length
            if (braceDepth > 0) started = true
            if (started && braceDepth <= 0) break

            if (/\b(?:if|else\s+if|switch|case|\?\s*:)\b/.test(bodyLine)) branchCount++
            if (/\btry\b/.test(bodyLine)) branchCount++
          }

          const complexity: 'high' | 'medium' | 'low' =
            branchCount >= 5 ? 'high' : branchCount >= 2 ? 'medium' : 'low'

          // Avoid duplicate for same name+line
          if (!functions.some(f => f.name === name && f.line === i + 1)) {
            functions.push({
              name,
              line: i + 1,
              isExported,
              isAsync,
              complexity,
              isTested: false,
              branchCount,
            })
          }
          break // Only match one pattern per line
        }
      }
    }

    return functions
  }

  private extractTestCases(lines: string[]): TestCase[] {
    const testCases: TestCase[] = []
    const testPatterns = [
      /(?:it|test)\s*\(\s*['"`]([^'"`]+)['"`]/, // it('name', ...) or test('name', ...)
      /(?:describe)\s*\(\s*['"`]([^'"`]+)['"`]/, // describe('name', ...)
      /def\s+(test_\w+)\s*\(/, // Python: def test_name()
    ]

    const assertionPatterns = [
      /expect\s*\(/,
      /assert\s*[.(]/,
      /\.toBe\s*\(/,
      /\.toEqual\s*\(/,
      /\.toThrow\s*\(/,
      /\.toHaveBeenCalled/,
      /\.toContain\s*\(/,
      /\.toMatch\s*\(/,
      /\.toHaveLength\s*\(/,
      /\.toBeDefined\s*\(/,
      /\.toBeTruthy\s*\(/,
      /\.toBeFalsy\s*\(/,
      /\.toBeNull\s*\(/,
      /\.toBeGreaterThan\s*\(/,
      /\.toBeLessThan\s*\(/,
      /assert\.strict/,
      /assertEqual/,
      /assertRaises/,
      /\.resolves\s*\./,
      /\.rejects\s*\./,
      /\.toMatchSnapshot\s*\(/,
      /\.toMatchInlineSnapshot\s*\(/,
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      for (const pattern of testPatterns) {
        const match = pattern.exec(line)
        if (match && match[1]) {
          // Skip describe blocks (they're containers, not test cases)
          if (/\bdescribe\b/.test(line)) continue

          const name = match[1]

          // Count assertions in test body
          let assertionCount = 0
          let braceDepth = 0
          let started = false
          for (let j = i; j < Math.min(i + 50, lines.length); j++) {
            const bodyLine = lines[j]
            braceDepth += (bodyLine.match(/\{/g) || []).length
            braceDepth -= (bodyLine.match(/\}/g) || []).length
            if (braceDepth > 0) started = true
            if (started && braceDepth <= 0) break

            for (const ap of assertionPatterns) {
              if (ap.test(bodyLine)) assertionCount++
            }
          }

          // Determine test type
          let type: TestCase['type'] = 'unit'
          const lowerName = name.toLowerCase()
          if (/\berror\b|\bfail\b|\bthrow\b|\breject\b|\binvalid\b/.test(lowerName)) {
            type = 'error-case'
          } else if (
            /\bedge\b|\bboundary\b|\bempty\b|\bnull\b|\bundefined\b|\bzero\b/.test(lowerName)
          ) {
            type = 'edge-case'
          } else if (/\bintegrat\b|\bend.to.end\b|\be2e\b/.test(lowerName)) {
            type = 'integration'
          } else if (/\bsnapshot\b/.test(lowerName)) {
            type = 'snapshot'
          }

          testCases.push({ name, line: i + 1, assertionCount, type })
          break
        }
      }
    }

    return testCases
  }

  // ── MAPPING ────────────────────────────────────────────────────────────

  private mapTestsToFunctions(
    functions: TestableFunction[],
    testCases: TestCase[],
    testCode: string,
  ): void {
    const testCodeLower = testCode.toLowerCase()

    for (const func of functions) {
      // Check if any test references this function name
      const funcNameLower = func.name.toLowerCase()
      const isTested =
        testCases.some(t => t.name.toLowerCase().includes(funcNameLower)) ||
        testCodeLower.includes(func.name) ||
        testCodeLower.includes(this.camelToKebab(func.name))

      func.isTested = isTested
    }
  }

  private camelToKebab(name: string): string {
    return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  // ── GAP DETECTION ──────────────────────────────────────────────────────

  private detectGaps(
    functions: TestableFunction[],
    testCases: TestCase[],
    sourceLines: string[],
    testLines: string[],
  ): CoverageGap[] {
    const gaps: CoverageGap[] = []

    // Untested exported functions
    for (const func of functions) {
      if (!func.isTested && func.isExported) {
        gaps.push({
          type: 'untested-export',
          severity: 'high',
          target: func.name,
          line: func.line,
          description: `Exported function '${func.name}' has no corresponding test.`,
          suggestion: `Add test: it('should ${this.camelToKebab(func.name).replace(/-/g, ' ')}', () => { ... })`,
        })
      } else if (!func.isTested && func.complexity !== 'low') {
        gaps.push({
          type: 'untested-function',
          severity: 'medium',
          target: func.name,
          line: func.line,
          description: `Function '${func.name}' (${func.complexity} complexity) has no tests.`,
          suggestion: `Add tests covering the ${func.branchCount} branch(es) in '${func.name}'.`,
        })
      }
    }

    // Missing error case tests
    const hasErrorTests = testCases.some(t => t.type === 'error-case')
    const hasThrowsInSource = sourceLines.some(l => /\bthrow\b/.test(l))
    if (hasThrowsInSource && !hasErrorTests && testCases.length > 0) {
      gaps.push({
        type: 'untested-error-path',
        severity: 'medium',
        target: 'error-handling',
        line: 1,
        description: 'Source code contains throw statements but no error-case tests found.',
        suggestion: 'Add tests that verify error conditions: `expect(() => fn()).toThrow()`.',
      })
    }

    // Missing edge case tests
    const hasEdgeTests = testCases.some(t => t.type === 'edge-case')
    if (functions.length > 3 && !hasEdgeTests && testCases.length > 0) {
      gaps.push({
        type: 'missing-edge-case',
        severity: 'low',
        target: 'edge-cases',
        line: 1,
        description: 'No edge-case tests detected. Consider testing boundary conditions.',
        suggestion: 'Add tests for empty inputs, null values, zero-length arrays, etc.',
      })
    }

    // Low assertion count
    for (const test of testCases) {
      if (test.assertionCount === 0) {
        gaps.push({
          type: 'low-assertion-count',
          severity: 'medium',
          target: test.name,
          line: test.line,
          description: `Test '${test.name}' has no assertions — it verifies nothing.`,
          suggestion: 'Add expect() assertions to verify behavior.',
        })
      }
    }

    // No test file at all
    if (testLines.length === 0 && functions.length > 0) {
      gaps.push({
        type: 'missing-test-file',
        severity: 'high',
        target: 'test-file',
        line: 1,
        description: `No test file provided. ${functions.length} function(s) need tests.`,
        suggestion: 'Create a test file with tests for all exported functions.',
      })
    }

    return gaps
  }

  // ── METRICS ────────────────────────────────────────────────────────────

  private calculateFunctionCoverage(functions: TestableFunction[]): number {
    if (functions.length === 0) return 100
    const tested = functions.filter(f => f.isTested).length
    return Math.round((tested / functions.length) * 100)
  }

  private estimateBranchCoverage(functions: TestableFunction[], testCases: TestCase[]): number {
    const totalBranches = functions.reduce((sum, f) => sum + Math.max(1, f.branchCount), 0)
    if (totalBranches === 0) return 100

    // Estimate: each test covers ~2 branches of its target function
    const testedFunctions = functions.filter(f => f.isTested)
    let coveredBranches = 0
    for (const func of testedFunctions) {
      // Count tests that match this function
      const matchingTests = testCases.filter(t =>
        t.name.toLowerCase().includes(func.name.toLowerCase()),
      )
      const branchesFromTests = Math.min(func.branchCount, matchingTests.length * 2)
      coveredBranches += Math.max(1, branchesFromTests)
    }

    return Math.min(100, Math.round((coveredBranches / totalBranches) * 100))
  }

  private calculateTestQuality(testCases: TestCase[], gaps: CoverageGap[]): number {
    if (testCases.length === 0) return 0

    let score = 100

    // Penalize for gaps
    for (const gap of gaps) {
      switch (gap.severity) {
        case 'critical':
          score -= 15
          break
        case 'high':
          score -= 10
          break
        case 'medium':
          score -= 5
          break
        case 'low':
          score -= 2
          break
        default:
          score -= 1
          break
      }
    }

    // Bonus for test diversity
    const types = new Set(testCases.map(t => t.type))
    if (types.has('error-case')) score += 5
    if (types.has('edge-case')) score += 5
    if (types.has('integration')) score += 3

    // Penalize for low assertion density
    const avgAssertions = testCases.reduce((sum, t) => sum + t.assertionCount, 0) / testCases.length
    if (avgAssertions < 1) score -= 10
    else if (avgAssertions < 2) score -= 5

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private generateSummary(
    functions: TestableFunction[],
    testCases: TestCase[],
    gaps: CoverageGap[],
    functionCoverage: number,
    branchCoverage: number,
    qualityScore: number,
  ): string {
    const parts: string[] = [
      `${functions.length} testable function(s), ${testCases.length} test case(s).`,
      `Function coverage: ~${functionCoverage}%.`,
      `Branch coverage: ~${branchCoverage}%.`,
    ]

    if (gaps.length > 0) {
      parts.push(`${gaps.length} coverage gap(s) found.`)
    }

    parts.push(`Test quality score: ${qualityScore}/100.`)
    return parts.join(' ')
  }
}
