/**
 * ⚡ PerformanceAnalyzer — Algorithmic & Runtime Performance Analysis
 *
 * Detects performance issues in code without executing it:
 *   • Big-O complexity estimation from loop/recursion patterns
 *   • Memory allocation hotspots (object creation in loops, unbounded caches)
 *   • Optimization suggestions (lazy-loading, memoization, batching)
 *   • Algorithm pattern recognition (nested loops, recursive patterns)
 *   • Data structure usage analysis (array vs. set, map vs. object)
 *
 * Works fully offline — no API calls needed.
 */

import type { AnalysisLanguage, Severity } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Estimated algorithmic complexity class. */
export type ComplexityClass =
  | 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)'
  | 'O(n²)' | 'O(n³)' | 'O(2ⁿ)' | 'O(n!)' | 'unknown'

/** A detected performance issue. */
export interface PerformanceIssue {
  /** Type of performance issue. */
  type: PerformanceIssueType
  /** Severity level. */
  severity: Severity
  /** Line number where the issue starts. */
  line: number
  /** End line (if span). */
  endLine?: number
  /** Short title. */
  title: string
  /** Detailed description. */
  description: string
  /** Suggested fix. */
  suggestion: string
  /** Estimated performance impact. */
  impact: 'critical' | 'high' | 'medium' | 'low'
  /** Estimated complexity if applicable. */
  estimatedComplexity?: ComplexityClass
}

/** Categories of performance issues. */
export type PerformanceIssueType =
  | 'nested-loop'
  | 'recursive-without-memo'
  | 'allocation-in-loop'
  | 'string-concat-in-loop'
  | 'array-method-chain'
  | 'unnecessary-recomputation'
  | 'unbounded-growth'
  | 'sync-io-in-loop'
  | 'regex-in-loop'
  | 'inefficient-data-structure'
  | 'redundant-iteration'
  | 'expensive-operation'

/** Result of a performance analysis. */
export interface PerformanceAnalysis {
  /** Estimated overall complexity. */
  estimatedComplexity: ComplexityClass
  /** All performance issues found. */
  issues: PerformanceIssue[]
  /** Optimization suggestions. */
  suggestions: OptimizationSuggestion[]
  /** Hot spots (functions with highest complexity). */
  hotspots: PerformanceHotspot[]
  /** Overall performance score (0-100, higher = better). */
  performanceScore: number
  /** Summary. */
  summary: string
}

/** An optimization suggestion. */
export interface OptimizationSuggestion {
  /** Category of optimization. */
  category: 'algorithm' | 'data-structure' | 'caching' | 'lazy-loading' | 'batching' | 'parallelism'
  /** Description. */
  description: string
  /** Expected improvement. */
  expectedImprovement: string
  /** Difficulty to implement. */
  difficulty: 'easy' | 'medium' | 'hard'
  /** Related line numbers. */
  relatedLines: number[]
}

/** A performance hotspot in the code. */
export interface PerformanceHotspot {
  /** Function or block name. */
  name: string
  /** Starting line. */
  line: number
  /** Estimated complexity. */
  complexity: ComplexityClass
  /** Why this is a hotspot. */
  reason: string
}

// ══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE ANALYZER
// ══════════════════════════════════════════════════════════════════════════════

export class PerformanceAnalyzer {
  private language: AnalysisLanguage

  constructor(language: AnalysisLanguage = 'unknown') {
    this.language = language
  }

  /** Set the language for analysis context. */
  setLanguage(lang: AnalysisLanguage): void {
    this.language = lang
  }

  /** Analyze code for performance issues. */
  analyze(code: string): PerformanceAnalysis {
    if (!code || !code.trim()) {
      return {
        estimatedComplexity: 'O(1)',
        issues: [],
        suggestions: [],
        hotspots: [],
        performanceScore: 100,
        summary: 'No code to analyze.',
      }
    }

    const lines = code.split('\n')
    const issues: PerformanceIssue[] = []
    const suggestions: OptimizationSuggestion[] = []
    const hotspots: PerformanceHotspot[] = []

    // Run all detectors
    this.detectNestedLoops(lines, issues, hotspots)
    this.detectRecursionWithoutMemo(lines, issues, hotspots)
    this.detectAllocationInLoop(lines, issues)
    this.detectStringConcatInLoop(lines, issues)
    this.detectArrayMethodChains(lines, issues)
    this.detectRecomputations(lines, issues)
    this.detectUnboundedGrowth(lines, issues)
    this.detectSyncIOInLoop(lines, issues)
    this.detectRegexInLoop(lines, issues)
    this.detectInefficientDataStructures(lines, issues, suggestions)
    this.detectRedundantIterations(lines, issues, suggestions)

    // Estimate overall complexity
    const estimatedComplexity = this.estimateOverallComplexity(lines, hotspots)

    // Generate optimization suggestions
    this.generateSuggestions(issues, suggestions)

    // Calculate performance score
    const performanceScore = this.calculateScore(issues)

    const summary = this.generateSummary(issues, hotspots, estimatedComplexity, performanceScore)

    return {
      estimatedComplexity,
      issues,
      suggestions,
      hotspots,
      performanceScore,
      summary,
    }
  }

  /** Estimate the Big-O complexity of a function body. */
  estimateComplexity(code: string): ComplexityClass {
    const lines = code.split('\n')
    const hotspots: PerformanceHotspot[] = []
    this.detectNestedLoops(lines, [], hotspots)
    this.detectRecursionWithoutMemo(lines, [], hotspots)
    return this.estimateOverallComplexity(lines, hotspots)
  }

  // ── DETECTORS ──────────────────────────────────────────────────────────

  private detectNestedLoops(
    lines: string[],
    issues: PerformanceIssue[],
    hotspots: PerformanceHotspot[],
  ): void {
    const loopPatterns = [
      /\bfor\s*\(/, /\bfor\s+\w+\s+(in|of)\b/, /\bwhile\s*\(/,
      /\.forEach\s*\(/, /\.map\s*\(/, /\.filter\s*\(/,
      /\.reduce\s*\(/, /\.some\s*\(/, /\.every\s*\(/,
      /\bfor\s+\w+\s+in\s+/, /\bfor\s+\w+\s+range\s*\(/,
    ]

    let loopDepth = 0
    let maxDepth = 0
    let outerLoopLine = -1
    const braceStack: number[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('//') || line.startsWith('#') || line.startsWith('*')) continue

      const isLoop = loopPatterns.some(p => p.test(line))

      if (isLoop) {
        if (loopDepth === 0) outerLoopLine = i + 1
        loopDepth++
        braceStack.push(i)
        if (loopDepth > maxDepth) maxDepth = loopDepth

        if (loopDepth >= 2) {
          const complexity: ComplexityClass = loopDepth === 2 ? 'O(n²)' : 'O(n³)'
          issues.push({
            type: 'nested-loop',
            severity: loopDepth >= 3 ? 'critical' : 'high',
            line: i + 1,
            title: `Nested loop depth ${loopDepth}`,
            description: `Loop nesting level ${loopDepth} detected. This creates ${complexity} complexity which degrades rapidly with input size.`,
            suggestion: loopDepth >= 3
              ? 'Consider using a hash map, sorting, or divide-and-conquer to reduce complexity.'
              : 'Consider using a Set/Map lookup instead of inner loop, or pre-index the data.',
            impact: loopDepth >= 3 ? 'critical' : 'high',
            estimatedComplexity: complexity,
          })
        }
      }

      // Track brace-based scope for loop depth
      const openBraces = (line.match(/\{/g) || []).length
      const closeBraces = (line.match(/\}/g) || []).length
      const netClose = closeBraces - openBraces

      if (netClose > 0 && loopDepth > 0) {
        for (let b = 0; b < netClose && braceStack.length > 0; b++) {
          braceStack.pop()
          loopDepth = Math.max(0, loopDepth - 1)
        }
      }
    }

    if (maxDepth >= 2 && outerLoopLine > 0) {
      hotspots.push({
        name: `nested-loop-block`,
        line: outerLoopLine,
        complexity: maxDepth === 2 ? 'O(n²)' : maxDepth === 3 ? 'O(n³)' : 'O(n³)',
        reason: `Contains ${maxDepth}-level nested loops`,
      })
    }
  }

  private detectRecursionWithoutMemo(
    lines: string[],
    issues: PerformanceIssue[],
    hotspots: PerformanceHotspot[],
  ): void {
    const funcPattern = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|def\s+(\w+)\s*\(|fn\s+(\w+)\s*\()/
    const memoPatterns = [/memo/, /cache/, /Map\s*\(\)/, /WeakMap/, /lru/, /@cache/, /@lru_cache/]

    for (let i = 0; i < lines.length; i++) {
      const match = funcPattern.exec(lines[i])
      if (!match) continue

      const funcName = match[1] || match[2] || match[3] || match[4]
      if (!funcName) continue

      // Look ahead for self-call within the function body
      const bodyEnd = Math.min(i + 50, lines.length)
      let hasSelfCall = false
      let hasMemo = false

      for (let j = i + 1; j < bodyEnd; j++) {
        const bodyLine = lines[j]
        if (new RegExp(`\\b${funcName}\\s*\\(`).test(bodyLine)) {
          hasSelfCall = true
        }
        if (memoPatterns.some(p => p.test(bodyLine))) {
          hasMemo = true
        }
      }

      // Also check lines before for memo decorators
      if (i > 0 && memoPatterns.some(p => p.test(lines[i - 1]))) {
        hasMemo = true
      }

      if (hasSelfCall && !hasMemo) {
        issues.push({
          type: 'recursive-without-memo',
          severity: 'high',
          line: i + 1,
          title: `Recursive function '${funcName}' without memoization`,
          description: `Function '${funcName}' calls itself recursively without memoization. This can lead to exponential time complexity O(2ⁿ) for overlapping subproblems.`,
          suggestion: `Add memoization with a cache/Map, or use @lru_cache (Python), useMemo pattern, or convert to iterative approach.`,
          impact: 'high',
          estimatedComplexity: 'O(2ⁿ)',
        })

        hotspots.push({
          name: funcName,
          line: i + 1,
          complexity: 'O(2ⁿ)',
          reason: 'Recursive function without memoization',
        })
      }
    }
  }

  private detectAllocationInLoop(lines: string[], issues: PerformanceIssue[]): void {
    const loopPatterns = [/\bfor\s*\(/, /\bwhile\s*\(/, /\.forEach\s*\(/, /\bfor\s+\w+\s+in\b/]
    const allocPatterns = [
      /new\s+(?:Array|Object|Map|Set|Date|RegExp)\s*\(/,
      /(?:Array|Object)\.(?:from|assign|keys|values|entries)\s*\(/,
      /JSON\.parse\s*\(/,
      /\.split\s*\(/,
      /\[\s*\.\.\./, // spread into new array
    ]

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

        if (allocPatterns.some(p => p.test(line))) {
          issues.push({
            type: 'allocation-in-loop',
            severity: 'medium',
            line: i + 1,
            title: 'Object allocation inside loop',
            description: `New object/array allocation inside a loop starting at line ${loopLine}. This causes GC pressure and can degrade performance.`,
            suggestion: 'Move allocation outside the loop if possible, or reuse objects.',
            impact: 'medium',
          })
        }

        if (braceCount <= 0 && i > loopLine) {
          inLoop = false
        }
      }
    }
  }

  private detectStringConcatInLoop(lines: string[], issues: PerformanceIssue[]): void {
    const loopPatterns = [/\bfor\s*\(/, /\bwhile\s*\(/, /\.forEach\s*\(/, /\bfor\s+\w+\s+in\b/]
    const concatPatterns = [
      /\w+\s*\+=\s*['"`]/, // str += "..."
      /\w+\s*=\s*\w+\s*\+\s*['"`]/, // str = str + "..."
      /\w+\s*\+=\s*\w/, // str += var
    ]

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

        if (concatPatterns.some(p => p.test(line))) {
          issues.push({
            type: 'string-concat-in-loop',
            severity: 'medium',
            line: i + 1,
            title: 'String concatenation in loop',
            description: `String concatenation inside a loop starting at line ${loopLine}. Creates new string objects on each iteration, leading to O(n²) memory behavior.`,
            suggestion: 'Use an array and .join() (JS/TS), StringBuilder (Java), or list with "".join() (Python).',
            impact: 'medium',
            estimatedComplexity: 'O(n²)',
          })
        }

        if (braceCount <= 0 && i > loopLine) {
          inLoop = false
        }
      }
    }
  }

  private detectArrayMethodChains(lines: string[], issues: PerformanceIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const chainPattern = /(\.\s*(?:map|filter|reduce|flatMap|sort|find|some|every)\s*\([^)]*\)\s*){3,}/
      if (chainPattern.test(line)) {
        issues.push({
          type: 'array-method-chain',
          severity: 'low',
          line: i + 1,
          title: 'Long array method chain',
          description: 'Multiple array operations chained together. Each creates an intermediate array, multiplying memory usage.',
          suggestion: 'Consider combining operations into a single .reduce() or use a for loop for better performance.',
          impact: 'low',
        })
      }

      // Also check for multi-line chains
      if (i < lines.length - 2) {
        const combined = lines[i] + lines[i + 1] + (lines[i + 2] || '')
        const methods = combined.match(/\.\s*(?:map|filter|reduce|flatMap|sort)\s*\(/g)
        if (methods && methods.length >= 3) {
          // Avoid duplicate if already detected
          if (!issues.some(iss => iss.line === i + 1 && iss.type === 'array-method-chain')) {
            issues.push({
              type: 'array-method-chain',
              severity: 'low',
              line: i + 1,
              title: 'Long array method chain (multi-line)',
              description: `${methods.length} chained array operations detected across lines ${i + 1}-${i + 3}. Each creates intermediate arrays.`,
              suggestion: 'Combine into a single pass with .reduce() or a loop.',
              impact: 'low',
            })
          }
        }
      }
    }
  }

  private detectRecomputations(lines: string[], issues: PerformanceIssue[]): void {
    const expensiveCalls = new Map<string, number[]>()
    const expensivePatterns = [
      /\.sort\s*\(/, /JSON\.(?:parse|stringify)\s*\(/,
      /\.join\s*\(/, /\.reverse\s*\(/,
      /Object\.(?:keys|values|entries)\s*\(/,
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      for (const pattern of expensivePatterns) {
        const match = line.match(pattern)
        if (match) {
          const key = match[0]
          if (!expensiveCalls.has(key)) expensiveCalls.set(key, [])
          expensiveCalls.get(key)!.push(i + 1)
        }
      }
    }

    for (const [call, lineNums] of expensiveCalls) {
      if (lineNums.length >= 3) {
        issues.push({
          type: 'unnecessary-recomputation',
          severity: 'low',
          line: lineNums[0],
          title: `Repeated expensive operation: ${call}`,
          description: `'${call}' called ${lineNums.length} times (lines ${lineNums.join(', ')}). Consider caching the result.`,
          suggestion: 'Store the result in a variable and reuse it.',
          impact: 'low',
        })
      }
    }
  }

  private detectUnboundedGrowth(lines: string[], issues: PerformanceIssue[]): void {
    const growthPatterns = [
      { pattern: /\.push\s*\(/, name: 'array push' },
      { pattern: /\.set\s*\(/, name: 'map/set add' },
      { pattern: /\.add\s*\(/, name: 'set add' },
      { pattern: /\[\w+\]\s*=/, name: 'object property assignment' },
    ]
    const boundPatterns = [/\.length\s*[><=]/, /\.size\s*[><=]/, /\.slice\s*\(/, /\.splice\s*\(/, /delete\s/, /\.delete\s*\(/, /\.clear\s*\(/]

    let inEventHandler = false
    let inInterval = false
    let handlerLine = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (/\.on\s*\(|addEventListener|setInterval|\.subscribe\s*\(/.test(line)) {
        inEventHandler = true
        handlerLine = i + 1
        if (/setInterval/.test(line)) inInterval = true
      }

      if (inEventHandler || inInterval) {
        for (const { pattern, name } of growthPatterns) {
          if (pattern.test(line)) {
            // Check if there's a bound check nearby
            const context = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 4)).join('\n')
            const hasBound = boundPatterns.some(bp => bp.test(context))

            if (!hasBound) {
              issues.push({
                type: 'unbounded-growth',
                severity: inInterval ? 'high' : 'medium',
                line: i + 1,
                title: `Unbounded ${name} in ${inInterval ? 'setInterval' : 'event handler'}`,
                description: `Data structure grows via ${name} inside ${inInterval ? 'setInterval' : 'event handler'} (line ${handlerLine}) without bounds checking. This is a memory leak risk.`,
                suggestion: 'Add size limits, use a bounded buffer (e.g., ring buffer), or clean up old entries.',
                impact: inInterval ? 'high' : 'medium',
              })
            }
          }
        }
      }

      // Reset on function/block end
      if (line === '}' || line === '})' || line === '});') {
        inEventHandler = false
        inInterval = false
      }
    }
  }

  private detectSyncIOInLoop(lines: string[], issues: PerformanceIssue[]): void {
    const loopPatterns = [/\bfor\s*\(/, /\bwhile\s*\(/, /\.forEach\s*\(/]
    const syncIOPatterns = [
      /fs\.readFileSync\s*\(/, /fs\.writeFileSync\s*\(/,
      /fs\.existsSync\s*\(/, /fs\.statSync\s*\(/,
      /fs\.readdirSync\s*\(/, /child_process\.execSync\s*\(/,
      /open\s*\([^)]*,\s*['"]r/, // Python file open
    ]

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

        if (syncIOPatterns.some(p => p.test(line))) {
          issues.push({
            type: 'sync-io-in-loop',
            severity: 'high',
            line: i + 1,
            title: 'Synchronous I/O in loop',
            description: `Synchronous I/O operation inside loop (line ${loopLine}). Each iteration blocks the event loop/thread.`,
            suggestion: 'Use async alternatives (fs.promises, async/await) with Promise.all() for parallel I/O, or batch operations.',
            impact: 'high',
          })
        }

        if (braceCount <= 0 && i > loopLine) {
          inLoop = false
        }
      }
    }
  }

  private detectRegexInLoop(lines: string[], issues: PerformanceIssue[]): void {
    const loopPatterns = [/\bfor\s*\(/, /\bwhile\s*\(/, /\.forEach\s*\(/]
    const regexCreationPatterns = [
      /new\s+RegExp\s*\(/, // new RegExp()
      /\/[^/]+\/[gimsuy]*\s*\.test\s*\(/, // inline regex.test()
    ]

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

        if (/new\s+RegExp\s*\(/.test(line)) {
          issues.push({
            type: 'regex-in-loop',
            severity: 'medium',
            line: i + 1,
            title: 'RegExp creation inside loop',
            description: `new RegExp() inside loop (line ${loopLine}). Compiling a regex on each iteration is wasteful.`,
            suggestion: 'Move the RegExp construction outside the loop.',
            impact: 'medium',
          })
        }

        if (braceCount <= 0 && i > loopLine) {
          inLoop = false
        }
      }
    }
  }

  private detectInefficientDataStructures(
    lines: string[],
    issues: PerformanceIssue[],
    suggestions: OptimizationSuggestion[],
  ): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Array.includes() in loop → suggest Set
      if (/\.includes\s*\(/.test(line)) {
        const context = lines.slice(Math.max(0, i - 5), i).join('\n')
        if (/\bfor\b|\bwhile\b|\.forEach|\.map|\.filter/.test(context)) {
          issues.push({
            type: 'inefficient-data-structure',
            severity: 'medium',
            line: i + 1,
            title: 'Array.includes() in loop — O(n²)',
            description: 'Using Array.includes() inside a loop creates O(n²) complexity. Set.has() is O(1).',
            suggestion: 'Convert the array to a Set before the loop and use Set.has() for lookups.',
            impact: 'high',
            estimatedComplexity: 'O(n²)',
          })

          suggestions.push({
            category: 'data-structure',
            description: 'Replace Array.includes() with Set.has() for O(1) lookups',
            expectedImprovement: 'O(n²) → O(n)',
            difficulty: 'easy',
            relatedLines: [i + 1],
          })
        }
      }

      // Object property lookup vs Map
      if (/Object\.keys\s*\(\w+\)\.(?:find|filter|includes)\s*\(/.test(line)) {
        issues.push({
          type: 'inefficient-data-structure',
          severity: 'low',
          line: i + 1,
          title: 'Object.keys() lookup — consider Map',
          description: 'Using Object.keys() then searching is O(n). Map or direct property check is O(1).',
          suggestion: 'Use `key in obj`, `obj.hasOwnProperty(key)`, or convert to Map.',
          impact: 'low',
        })
      }

      // Array.indexOf !== -1 → use includes or Set
      if (/\.indexOf\s*\([^)]+\)\s*!==?\s*-1/.test(line)) {
        suggestions.push({
          category: 'data-structure',
          description: 'Replace .indexOf() !== -1 with .includes() for readability, or Set.has() for performance',
          expectedImprovement: 'Readability and potential O(n) → O(1) if in loop',
          difficulty: 'easy',
          relatedLines: [i + 1],
        })
      }
    }
  }

  private detectRedundantIterations(
    lines: string[],
    issues: PerformanceIssue[],
    suggestions: OptimizationSuggestion[],
  ): void {
    // Detect .filter().length === 0 → .some()/.every()
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (/\.filter\s*\([^)]+\)\.length/.test(line)) {
        issues.push({
          type: 'redundant-iteration',
          severity: 'low',
          line: i + 1,
          title: '.filter().length — use .some() or .every()',
          description: '.filter() creates a full new array just to check length. Use .some() to short-circuit.',
          suggestion: 'Replace .filter(fn).length > 0 with .some(fn), or .filter(fn).length === 0 with !.some(fn).',
          impact: 'low',
        })
      }

      // Detect .map().filter() → single .reduce()
      if (/\.map\s*\([^)]+\)\s*\.filter\s*\(/.test(line)) {
        suggestions.push({
          category: 'algorithm',
          description: 'Combine .map().filter() into a single .reduce() or .flatMap() to avoid intermediate array',
          expectedImprovement: 'Single pass instead of two, less memory allocation',
          difficulty: 'easy',
          relatedLines: [i + 1],
        })
      }
    }
  }

  // ── COMPLEXITY ESTIMATION ──────────────────────────────────────────────

  private estimateOverallComplexity(
    lines: string[],
    hotspots: PerformanceHotspot[],
  ): ComplexityClass {
    // Use hotspot data
    if (hotspots.some(h => h.complexity === 'O(2ⁿ)' || h.complexity === 'O(n!)')) return 'O(2ⁿ)'
    if (hotspots.some(h => h.complexity === 'O(n³)')) return 'O(n³)'
    if (hotspots.some(h => h.complexity === 'O(n²)')) return 'O(n²)'

    // Fallback: count loop depth
    const loopPatterns = [/\bfor\s*\(/, /\bwhile\s*\(/, /\.forEach\s*\(/, /\bfor\s+\w+\s+in\b/]
    let maxDepth = 0
    let currentDepth = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (loopPatterns.some(p => p.test(trimmed))) {
        currentDepth++
        if (currentDepth > maxDepth) maxDepth = currentDepth
      }
      if (trimmed === '}' || trimmed === '})') {
        currentDepth = Math.max(0, currentDepth - 1)
      }
    }

    // Check for sort calls
    const hasSort = lines.some(l => /\.sort\s*\(/.test(l))

    if (maxDepth >= 3) return 'O(n³)'
    if (maxDepth >= 2) return 'O(n²)'
    if (hasSort || lines.some(l => /\.sort\s*\(/.test(l))) return 'O(n log n)'
    if (maxDepth >= 1) return 'O(n)'

    // Check for binary search patterns
    const hasBinarySearch = lines.some(l =>
      /Math\.floor\s*\(\s*\(\s*\w+\s*\+\s*\w+\s*\)\s*\/\s*2\s*\)/.test(l) ||
      />>?\s*1/.test(l),
    )
    if (hasBinarySearch) return 'O(log n)'

    return 'O(1)'
  }

  // ── SUGGESTIONS ────────────────────────────────────────────────────────

  private generateSuggestions(
    issues: PerformanceIssue[],
    suggestions: OptimizationSuggestion[],
  ): void {
    const hasNestedLoops = issues.some(i => i.type === 'nested-loop')
    const hasRecursion = issues.some(i => i.type === 'recursive-without-memo')
    const hasAllocInLoop = issues.some(i => i.type === 'allocation-in-loop')
    const hasSyncIO = issues.some(i => i.type === 'sync-io-in-loop')

    if (hasNestedLoops) {
      suggestions.push({
        category: 'algorithm',
        description: 'Replace nested loops with hash-based lookups (Map/Set) to reduce O(n²) to O(n)',
        expectedImprovement: 'O(n²) → O(n)',
        difficulty: 'medium',
        relatedLines: issues.filter(i => i.type === 'nested-loop').map(i => i.line),
      })
    }

    if (hasRecursion) {
      suggestions.push({
        category: 'caching',
        description: 'Add memoization to recursive functions to avoid redundant computation',
        expectedImprovement: 'O(2ⁿ) → O(n) with memoization',
        difficulty: 'easy',
        relatedLines: issues.filter(i => i.type === 'recursive-without-memo').map(i => i.line),
      })
    }

    if (hasAllocInLoop) {
      suggestions.push({
        category: 'algorithm',
        description: 'Hoist object allocation outside loops and reuse instances',
        expectedImprovement: 'Reduced GC pressure, fewer allocations',
        difficulty: 'easy',
        relatedLines: issues.filter(i => i.type === 'allocation-in-loop').map(i => i.line),
      })
    }

    if (hasSyncIO) {
      suggestions.push({
        category: 'parallelism',
        description: 'Replace synchronous I/O with async alternatives and batch operations',
        expectedImprovement: 'Non-blocking I/O, parallel execution',
        difficulty: 'medium',
        relatedLines: issues.filter(i => i.type === 'sync-io-in-loop').map(i => i.line),
      })
    }
  }

  // ── SCORING ────────────────────────────────────────────────────────────

  private calculateScore(issues: PerformanceIssue[]): number {
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
    issues: PerformanceIssue[],
    hotspots: PerformanceHotspot[],
    complexity: ComplexityClass,
    score: number,
  ): string {
    if (issues.length === 0) {
      return `No performance issues detected. Estimated complexity: ${complexity}. Score: ${score}/100.`
    }
    const critical = issues.filter(i => i.severity === 'critical').length
    const high = issues.filter(i => i.severity === 'high').length
    const parts: string[] = [
      `Found ${issues.length} performance issue(s).`,
      `Estimated complexity: ${complexity}.`,
    ]
    if (critical > 0) parts.push(`${critical} critical.`)
    if (high > 0) parts.push(`${high} high.`)
    if (hotspots.length > 0) parts.push(`${hotspots.length} hotspot(s).`)
    parts.push(`Performance score: ${score}/100.`)
    return parts.join(' ')
  }
}
