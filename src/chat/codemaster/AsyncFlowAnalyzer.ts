/**
 * ⚡ AsyncFlowAnalyzer — Async/Await & Promise Control Flow Analysis
 *
 * Detects asynchronous programming issues:
 *   • Missing await on async calls
 *   • Unhandled promise rejections
 *   • Race condition patterns (shared mutable state in async)
 *   • Async void functions (fire-and-forget danger)
 *   • Sequential awaits that could be parallel (Promise.all)
 *   • Promise chain anti-patterns
 *   • Callback-to-promise migration opportunities
 *
 * Works fully offline — pattern-based analysis.
 */

import type { Severity } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** An async flow issue. */
export interface AsyncIssue {
  /** Type of issue. */
  type: AsyncIssueType
  /** Severity. */
  severity: Severity
  /** Line number. */
  line: number
  /** End line. */
  endLine?: number
  /** Title. */
  title: string
  /** Description. */
  description: string
  /** Suggestion. */
  suggestion: string
}

/** Categories of async issues. */
export type AsyncIssueType =
  | 'missing-await'
  | 'unhandled-rejection'
  | 'race-condition'
  | 'async-void'
  | 'sequential-await'
  | 'floating-promise'
  | 'callback-hell'
  | 'mixed-async-patterns'
  | 'async-in-loop'
  | 'error-swallowing'

/** Result of async flow analysis. */
export interface AsyncFlowAnalysis {
  /** All async issues found. */
  issues: AsyncIssue[]
  /** Async functions detected. */
  asyncFunctions: AsyncFunctionInfo[]
  /** Promise chains detected. */
  promiseChains: number
  /** Async safety score (0-100). */
  asyncSafetyScore: number
  /** Summary. */
  summary: string
}

/** Info about an async function. */
export interface AsyncFunctionInfo {
  /** Function name. */
  name: string
  /** Line number. */
  line: number
  /** Whether it has error handling. */
  hasErrorHandling: boolean
  /** Whether it returns a promise. */
  returnsPromise: boolean
  /** Number of await statements. */
  awaitCount: number
}

// ══════════════════════════════════════════════════════════════════════════════
// ASYNC FLOW ANALYZER
// ══════════════════════════════════════════════════════════════════════════════

export class AsyncFlowAnalyzer {
  constructor() {
    // no-op
  }

  /** Analyze code for async/await issues. */
  analyze(code: string): AsyncFlowAnalysis {
    if (!code || !code.trim()) {
      return {
        issues: [],
        asyncFunctions: [],
        promiseChains: 0,
        asyncSafetyScore: 100,
        summary: 'No code to analyze.',
      }
    }

    const lines = code.split('\n')
    const issues: AsyncIssue[] = []
    const asyncFunctions: AsyncFunctionInfo[] = []

    this.detectAsyncFunctions(lines, asyncFunctions)
    this.detectMissingAwait(lines, issues)
    this.detectUnhandledRejections(lines, issues)
    this.detectAsyncVoid(lines, issues)
    this.detectSequentialAwaits(lines, issues)
    this.detectFloatingPromises(lines, issues)
    this.detectCallbackHell(lines, issues)
    this.detectAsyncInLoop(lines, issues)
    this.detectRaceConditions(lines, issues)
    this.detectErrorSwallowing(lines, issues)
    this.detectMixedPatterns(lines, issues)

    const promiseChains = this.countPromiseChains(lines)
    const asyncSafetyScore = this.calculateScore(issues)
    const summary = this.generateSummary(issues, asyncFunctions, asyncSafetyScore)

    return {
      issues,
      asyncFunctions,
      promiseChains,
      asyncSafetyScore,
      summary,
    }
  }

  // ── DETECTORS ──────────────────────────────────────────────────────────

  private detectAsyncFunctions(lines: string[], asyncFunctions: AsyncFunctionInfo[]): void {
    const asyncFuncPattern = /(?:async\s+function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*async\s|(\w+)\s*=\s*async\s*\(|async\s+(\w+)\s*\()/

    for (let i = 0; i < lines.length; i++) {
      const match = asyncFuncPattern.exec(lines[i])
      if (!match) continue

      const name = match[1] || match[2] || match[3] || match[4]
      if (!name) continue

      // Scan function body
      let awaitCount = 0
      let hasErrorHandling = false
      let braceDepth = 0
      let started = false

      for (let j = i; j < Math.min(i + 100, lines.length); j++) {
        const line = lines[j]
        braceDepth += (line.match(/\{/g) || []).length
        braceDepth -= (line.match(/\}/g) || []).length

        if (braceDepth > 0) started = true
        if (started && braceDepth <= 0) break

        if (/\bawait\b/.test(line)) awaitCount++
        if (/\bcatch\b|\btry\b|\.catch\s*\(/.test(line)) hasErrorHandling = true
      }

      asyncFunctions.push({
        name,
        line: i + 1,
        hasErrorHandling,
        returnsPromise: true,
        awaitCount,
      })
    }
  }

  private detectMissingAwait(lines: string[], issues: AsyncIssue[]): void {
    // Track known async functions
    const asyncFuncNames = new Set<string>()
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/(?:async\s+function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*async\s)/)
      if (match) {
        asyncFuncNames.add(match[1] || match[2])
      }
    }

    // Common async APIs
    const commonAsyncCalls = [
      'fetch', 'axios', 'readFile', 'writeFile', 'readdir',
      'mkdir', 'unlink', 'stat', 'access',
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('//') || line.startsWith('*')) continue

      // Check if line calls a known async function without await
      for (const funcName of [...asyncFuncNames, ...commonAsyncCalls]) {
        const callPattern = new RegExp(`\\b${funcName}\\s*\\(`)
        if (callPattern.test(line) && !/\bawait\b/.test(line) && !/\breturn\b/.test(line) && !/\.then\s*\(/.test(line)) {
          // Check if the result is assigned
          if (/(?:const|let|var)\s+\w+\s*=/.test(line)) continue // assigned, might be intentional

          // Only flag inside async functions
          const contextBefore = lines.slice(Math.max(0, i - 10), i).join('\n')
          if (/\basync\b/.test(contextBefore)) {
            issues.push({
              type: 'missing-await',
              severity: 'high',
              line: i + 1,
              title: `Missing await on '${funcName}()'`,
              description: `Async function '${funcName}' called without \`await\`. The returned promise will be discarded.`,
              suggestion: `Add \`await\` before the call: \`await ${funcName}(...)\`, or handle the returned promise.`,
            })
          }
        }
      }
    }
  }

  private detectUnhandledRejections(lines: string[], issues: AsyncIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('//') || line.startsWith('*')) continue

      // .then() without .catch()
      if (/\.then\s*\(/.test(line)) {
        // Look ahead for .catch
        const nextLines = lines.slice(i, Math.min(i + 5, lines.length)).join('\n')
        if (!/\.catch\s*\(/.test(nextLines) && !/\.finally\s*\(/.test(nextLines)) {
          issues.push({
            type: 'unhandled-rejection',
            severity: 'high',
            line: i + 1,
            title: 'Promise .then() without .catch()',
            description: 'Promise chain uses .then() but has no .catch() handler. Rejections will be unhandled.',
            suggestion: 'Add `.catch(err => { ... })` to handle rejections, or use try/catch with await.',
          })
        }
      }

      // new Promise without reject handling
      if (/new\s+Promise\s*\(/.test(line)) {
        const promiseBody = lines.slice(i, Math.min(i + 15, lines.length)).join('\n')
        if (!/reject\s*\(/.test(promiseBody) && /resolve\s*\(/.test(promiseBody)) {
          issues.push({
            type: 'unhandled-rejection',
            severity: 'medium',
            line: i + 1,
            title: 'Promise constructor never calls reject',
            description: 'Promise constructor uses resolve but never calls reject. Errors will be swallowed.',
            suggestion: 'Add reject handling for error cases, or wrap body in try/catch that calls reject(error).',
          })
        }
      }
    }
  }

  private detectAsyncVoid(lines: string[], issues: AsyncIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // async function returning void (event handlers, etc.)
      if (/async\s+\w+\s*\([^)]*\)\s*:\s*void/.test(line) ||
          /async\s+function\s+\w+\s*\([^)]*\)\s*:\s*void/.test(line)) {
        // Check context — is this an event handler?
        const contextBefore = lines.slice(Math.max(0, i - 2), i).join('\n')
        if (!/addEventListener|\.on\(|@\w+/.test(contextBefore)) {
          issues.push({
            type: 'async-void',
            severity: 'medium',
            line: i + 1,
            title: 'Async function with void return type',
            description: 'Async functions returning void cannot have their errors caught by the caller. Exceptions will be unobserved.',
            suggestion: 'Return Promise<void> instead, or add internal try/catch error handling.',
          })
        }
      }
    }
  }

  private detectSequentialAwaits(lines: string[], issues: AsyncIssue[]): void {
    const awaitLines: number[] = []
    const awaitVars: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('//') || line.startsWith('*')) continue

      const awaitMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*await\s/)
      if (awaitMatch) {
        awaitLines.push(i)
        awaitVars.push(awaitMatch[1])

        // Check if this await depends on previous await results
        if (awaitLines.length >= 2) {
          const prevIdx = awaitLines.length - 2
          const prevLine = awaitLines[prevIdx]

          // Are they consecutive (within 2 lines)?
          if (i - prevLine <= 2) {
            const prevVar = awaitVars[prevIdx]
            // Does current line reference the previous variable?
            if (!new RegExp(`\\b${prevVar}\\b`).test(line)) {
              issues.push({
                type: 'sequential-await',
                severity: 'medium',
                line: prevLine + 1,
                endLine: i + 1,
                title: 'Sequential awaits could be parallel',
                description: `Two independent await statements (lines ${prevLine + 1} and ${i + 1}) run sequentially. They could run in parallel for better performance.`,
                suggestion: 'Use `const [a, b] = await Promise.all([promiseA, promiseB])` for parallel execution.',
              })
            }
          }
        }
      }
    }
  }

  private detectFloatingPromises(lines: string[], issues: AsyncIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('//') || line.startsWith('*')) continue

      // Expression statement that creates a promise without handling it
      if (/^new\s+Promise\s*\(/.test(line) && !/(?:const|let|var|return|await)\s/.test(line)) {
        issues.push({
          type: 'floating-promise',
          severity: 'high',
          line: i + 1,
          title: 'Floating Promise — created but not awaited or stored',
          description: 'A Promise is created but its result is neither awaited, stored, nor returned. It will execute but errors are silently lost.',
          suggestion: 'Await the promise, assign it to a variable, or add a .catch() handler.',
        })
      }

      // Promise.all/race without await or assignment
      if (/^Promise\.(?:all|race|allSettled|any)\s*\(/.test(line) && !/(?:const|let|var|return|await)\s/.test(line)) {
        issues.push({
          type: 'floating-promise',
          severity: 'high',
          line: i + 1,
          title: 'Floating Promise.all/race — not awaited',
          description: 'Promise.all/race created but not awaited or stored.',
          suggestion: 'Add `await` or assign to a variable.',
        })
      }
    }
  }

  private detectCallbackHell(lines: string[], issues: AsyncIssue[]): void {
    let callbackDepth = 0
    let maxCallbackDepth = 0
    let hellStartLine = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Count callback-style nesting: function(err, data) { ... function(err, data) { ...
      const callbacks = (line.match(/(?:function\s*\(|=>\s*\{|\((?:err|error|e)\s*(?:,|\)))/g) || []).length
      callbackDepth += callbacks

      const closes = (line.match(/\}\s*\)/g) || []).length
      callbackDepth = Math.max(0, callbackDepth - closes)

      if (callbackDepth > maxCallbackDepth) {
        maxCallbackDepth = callbackDepth
        if (callbackDepth === 1) hellStartLine = i + 1
      }
    }

    if (maxCallbackDepth >= 3) {
      issues.push({
        type: 'callback-hell',
        severity: 'medium',
        line: hellStartLine,
        title: `Callback nesting depth ${maxCallbackDepth}`,
        description: `Code has ${maxCallbackDepth}-level nested callbacks. This makes error handling and readability very difficult.`,
        suggestion: 'Refactor to async/await pattern, or use Promise chains to flatten the nesting.',
      })
    }
  }

  private detectAsyncInLoop(lines: string[], issues: AsyncIssue[]): void {
    const loopPatterns = [/\bfor\s*\(/, /\bwhile\s*\(/, /\.forEach\s*\(/]

    let inLoop = false
    let loopLine = 0
    let braceCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (loopPatterns.some(p => p.test(line))) {
        inLoop = true
        loopLine = i + 1
        braceCount = 0
      }

      if (inLoop) {
        braceCount += (line.match(/\{/g) || []).length
        braceCount -= (line.match(/\}/g) || []).length

        if (/\bawait\b/.test(line)) {
          issues.push({
            type: 'async-in-loop',
            severity: 'medium',
            line: i + 1,
            title: 'Await inside loop — sequential execution',
            description: `\`await\` inside loop (line ${loopLine}) causes each iteration to wait for the previous one. This is often much slower than necessary.`,
            suggestion: 'Collect promises and use `await Promise.all(promises)`, or use `for await...of` for async iterators.',
          })
        }

        if (braceCount <= 0 && i > loopLine) {
          inLoop = false
        }
      }
    }
  }

  private detectRaceConditions(lines: string[], issues: AsyncIssue[]): void {
    // Detect shared mutable state accessed in multiple async contexts
    const sharedVars = new Map<string, number[]>() // varName → lines where mutated

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('//') || line.startsWith('*')) continue

      // Track variable mutations in async contexts
      const mutationMatch = line.match(/(\w+)\s*(?:\+=|-=|\*=|\/=|=(?!=))/)
      if (mutationMatch && /\bawait\b/.test(lines.slice(Math.max(0, i - 10), i).join('\n'))) {
        const varName = mutationMatch[1]
        if (!['const', 'let', 'var', 'this', 'self'].includes(varName)) {
          if (!sharedVars.has(varName)) sharedVars.set(varName, [])
          sharedVars.get(varName)!.push(i + 1)
        }
      }
    }

    // Flag variables mutated in multiple async locations
    for (const [varName, mutationLines] of sharedVars) {
      if (mutationLines.length >= 2) {
        issues.push({
          type: 'race-condition',
          severity: 'high',
          line: mutationLines[0],
          title: `Potential race condition on '${varName}'`,
          description: `Variable '${varName}' is mutated in async context at lines ${mutationLines.join(', ')}. Concurrent executions may cause data races.`,
          suggestion: 'Use a mutex/lock pattern, or ensure mutations are atomic/isolated.',
        })
      }
    }
  }

  private detectErrorSwallowing(lines: string[], issues: AsyncIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Empty catch block in promise chain: .catch(() => {})
      if (/\.catch\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)/.test(line) ||
          /\.catch\s*\(\s*\(\s*\w*\s*\)\s*=>\s*\{\s*\}\s*\)/.test(line)) {
        issues.push({
          type: 'error-swallowing',
          severity: 'high',
          line: i + 1,
          title: 'Empty .catch() handler — error swallowed',
          description: 'Promise rejection is caught but the error is silently ignored.',
          suggestion: 'Log the error, rethrow it, or handle it appropriately.',
        })
      }

      // catch block that doesn't use the error
      if (/\}\s*catch\s*\(\s*(\w+)\s*\)\s*\{/.test(line)) {
        const errorVar = line.match(/catch\s*\(\s*(\w+)\s*\)/)?.[1]
        if (errorVar) {
          const catchBody = lines.slice(i + 1, Math.min(i + 5, lines.length)).join('\n')
          if (!new RegExp(`\\b${errorVar}\\b`).test(catchBody)) {
            issues.push({
              type: 'error-swallowing',
              severity: 'medium',
              line: i + 1,
              title: `Catch block ignores error '${errorVar}'`,
              description: `Error variable '${errorVar}' is caught but never used in the catch block.`,
              suggestion: `Log or handle the error: \`console.error(${errorVar})\` or rethrow.`,
            })
          }
        }
      }
    }
  }

  private detectMixedPatterns(lines: string[], issues: AsyncIssue[]): void {
    let hasAwait = false
    let hasThen = false
    let hasCallback = false
    let awaitLine = 0
    let thenLine = 0
    let callbackLine = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('//') || line.startsWith('*')) continue

      if (/\bawait\b/.test(line) && !hasAwait) {
        hasAwait = true
        awaitLine = i + 1
      }
      if (/\.then\s*\(/.test(line) && !hasThen) {
        hasThen = true
        thenLine = i + 1
      }
      if (/\bfunction\s*\(\s*(?:err|error|e)\s*(?:,|\))/.test(line) && !hasCallback) {
        hasCallback = true
        callbackLine = i + 1
      }
    }

    if (hasAwait && hasThen) {
      issues.push({
        type: 'mixed-async-patterns',
        severity: 'low',
        line: Math.min(awaitLine, thenLine),
        title: 'Mixed async patterns: await + .then()',
        description: `Code uses both await (line ${awaitLine}) and .then() (line ${thenLine}). Mixing patterns reduces readability.`,
        suggestion: 'Standardize on async/await for consistency and readability.',
      })
    }

    if ((hasAwait || hasThen) && hasCallback) {
      issues.push({
        type: 'mixed-async-patterns',
        severity: 'medium',
        line: callbackLine,
        title: 'Mixed async patterns: callbacks + promises',
        description: 'Code mixes callback-style and promise-based async patterns.',
        suggestion: 'Wrap callbacks in Promise constructors or use util.promisify() to standardize.',
      })
    }
  }

  // ── HELPERS ────────────────────────────────────────────────────────────

  private countPromiseChains(lines: string[]): number {
    let count = 0
    for (const line of lines) {
      if (/\.then\s*\(/.test(line)) count++
    }
    return count
  }

  private calculateScore(issues: AsyncIssue[]): number {
    let score = 100
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical': score -= 20; break
        case 'high': score -= 12; break
        case 'medium': score -= 6; break
        case 'low': score -= 3; break
        case 'info': score -= 1; break
      }
    }
    return Math.max(0, Math.min(100, score))
  }

  private generateSummary(
    issues: AsyncIssue[],
    asyncFunctions: AsyncFunctionInfo[],
    score: number,
  ): string {
    if (issues.length === 0 && asyncFunctions.length === 0) {
      return 'No async patterns detected.'
    }
    if (issues.length === 0) {
      return `${asyncFunctions.length} async function(s) found with no issues. Async safety score: ${score}/100.`
    }
    const high = issues.filter(i => i.severity === 'critical' || i.severity === 'high').length
    return `Found ${issues.length} async issue(s) (${high} high-severity) across ${asyncFunctions.length} async function(s). Score: ${score}/100.`
  }
}
