/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  CodeOptimizer — Performance analysis & optimization suggestions           ║
 * ║                                                                            ║
 * ║  Analyzes code for performance issues, complexity problems, and            ║
 * ║  provides optimization suggestions including refactoring patterns,         ║
 * ║  algorithm improvements, and resource optimization.                        ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Time complexity analysis (Big-O estimation)                          ║
 * ║    • Space complexity estimation                                          ║
 * ║    • Performance anti-pattern detection                                   ║
 * ║    • Algorithm optimization suggestions                                   ║
 * ║    • Memory leak pattern detection                                        ║
 * ║    • Loop optimization recommendations                                    ║
 * ║    • Caching opportunity identification                                   ║
 * ║    • Database query optimization hints                                    ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ComplexityClass =
  | 'O(1)'
  | 'O(log n)'
  | 'O(n)'
  | 'O(n log n)'
  | 'O(n²)'
  | 'O(n³)'
  | 'O(2^n)'
  | 'O(n!)'

export type OptimizationCategory =
  | 'algorithm'
  | 'data_structure'
  | 'caching'
  | 'loop'
  | 'memory'
  | 'io'
  | 'concurrency'
  | 'database'

export type Severity = 'info' | 'warning' | 'critical'

export interface ComplexityAnalysis {
  readonly timeComplexity: ComplexityClass
  readonly spaceComplexity: ComplexityClass
  readonly loopDepth: number
  readonly recursionDetected: boolean
  readonly explanation: string
}

export interface PerformanceIssue {
  readonly id: string
  readonly category: OptimizationCategory
  readonly severity: Severity
  readonly description: string
  readonly location: string
  readonly suggestion: string
  readonly estimatedImprovement: string
}

export interface OptimizationSuggestion {
  readonly id: string
  readonly category: OptimizationCategory
  readonly title: string
  readonly description: string
  readonly before: string
  readonly after: string
  readonly complexityBefore: ComplexityClass
  readonly complexityAfter: ComplexityClass
  readonly effort: 'low' | 'medium' | 'high'
}

export interface CachingOpportunity {
  readonly functionName: string
  readonly reason: string
  readonly strategy: 'memoization' | 'lru_cache' | 'ttl_cache' | 'precompute'
  readonly estimatedSpeedup: string
}

export interface MemoryIssue {
  readonly pattern: string
  readonly description: string
  readonly severity: Severity
  readonly fix: string
}

export interface OptimizationReport {
  readonly codeSnippet: string
  readonly complexity: ComplexityAnalysis
  readonly issues: readonly PerformanceIssue[]
  readonly suggestions: readonly OptimizationSuggestion[]
  readonly cachingOpportunities: readonly CachingOpportunity[]
  readonly memoryIssues: readonly MemoryIssue[]
  readonly overallScore: number // 0–100
}

export interface CodeOptimizerConfig {
  readonly maxIssuesPerAnalysis: number
  readonly enableCachingAnalysis: boolean
  readonly enableMemoryAnalysis: boolean
  readonly complexityWarningThreshold: ComplexityClass
}

export interface CodeOptimizerStats {
  readonly totalAnalyses: number
  readonly totalIssuesFound: number
  readonly totalSuggestions: number
  readonly feedbackCount: number
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_CODE_OPTIMIZER_CONFIG: CodeOptimizerConfig = {
  maxIssuesPerAnalysis: 50,
  enableCachingAnalysis: true,
  enableMemoryAnalysis: true,
  complexityWarningThreshold: 'O(n²)',
}

// ─── Data ──────────────────────────────────────────────────────────────────────

interface AntiPatternDef {
  readonly name: string
  readonly pattern: RegExp
  readonly category: OptimizationCategory
  readonly severity: Severity
  readonly description: string
  readonly suggestion: string
  readonly improvement: string
}

function buildAntiPatterns(): readonly AntiPatternDef[] {
  return [
    {
      name: 'nested_loop',
      pattern: /for\s*\(.*\)\s*\{[^}]*for\s*\(/s,
      category: 'loop',
      severity: 'warning',
      description: 'Nested loops detected (potential O(n²))',
      suggestion: 'Consider using a hash map/Set for O(n) lookup',
      improvement: 'O(n²) → O(n)',
    },
    {
      name: 'array_in_loop',
      pattern: /for\s*\(.*\)\s*\{[^}]*\.includes\(|\.indexOf\(/s,
      category: 'loop',
      severity: 'warning',
      description: 'Linear search inside loop',
      suggestion: 'Convert array to Set before loop for O(1) lookups',
      improvement: 'O(n²) → O(n)',
    },
    {
      name: 'string_concat_loop',
      pattern: /for\s*\(.*\)\s*\{[^}]*\+=\s*['"`]/s,
      category: 'memory',
      severity: 'warning',
      description: 'String concatenation in loop',
      suggestion: 'Use array.join() or template literals',
      improvement: 'O(n²) → O(n) for string building',
    },
    {
      name: 'dom_in_loop',
      pattern: /for\s*\(.*\)\s*\{[^}]*document\.(getElementById|querySelector)/s,
      category: 'io',
      severity: 'critical',
      description: 'DOM access inside loop',
      suggestion: 'Cache DOM reference outside the loop',
      improvement: 'Significant DOM access reduction',
    },
    {
      name: 'no_index_query',
      pattern: /SELECT.*FROM.*WHERE(?!.*INDEX)/is,
      category: 'database',
      severity: 'warning',
      description: 'Query without apparent index usage',
      suggestion: 'Add database index on filtered columns',
      improvement: 'O(n) → O(log n) query time',
    },
    {
      name: 'select_star',
      pattern: /SELECT\s+\*/i,
      category: 'database',
      severity: 'info',
      description: 'SELECT * fetches all columns',
      suggestion: 'Specify only needed columns',
      improvement: 'Reduced data transfer',
    },
    {
      name: 'n_plus_one',
      pattern: /for\s*\(.*\)\s*\{[^}]*(await|\.query|fetch)\s*\(/s,
      category: 'database',
      severity: 'critical',
      description: 'N+1 query pattern detected',
      suggestion: 'Batch queries or use JOIN/eager loading',
      improvement: 'N queries → 1 query',
    },
    {
      name: 'unbounded_cache',
      pattern: /new Map\(\)|cache\s*=\s*\{\}/i,
      category: 'memory',
      severity: 'info',
      description: 'Potentially unbounded cache',
      suggestion: 'Use LRU cache with max size limit',
      improvement: 'Prevents memory leaks',
    },
    {
      name: 'sync_file_io',
      pattern: /readFileSync|writeFileSync/i,
      category: 'io',
      severity: 'warning',
      description: 'Synchronous file I/O blocks event loop',
      suggestion: 'Use async fs.readFile/writeFile',
      improvement: 'Non-blocking I/O',
    },
    {
      name: 'no_pagination',
      pattern: /\.find\(\s*\{?\s*\}?\s*\)/i,
      category: 'database',
      severity: 'warning',
      description: 'Query without pagination may return unbounded results',
      suggestion: 'Add .limit() and .skip() for pagination',
      improvement: 'Bounded memory usage',
    },
    {
      name: 'deep_clone_loop',
      pattern: /for\s*\(.*\)\s*\{[^}]*JSON\.parse\(JSON\.stringify/s,
      category: 'memory',
      severity: 'warning',
      description: 'Deep clone via JSON in loop is expensive',
      suggestion: 'Use structuredClone() or shallow spread when possible',
      improvement: 'Reduced serialization overhead',
    },
    {
      name: 'recursive_no_memo',
      pattern: /function\s+\w+\([^)]*\)\s*\{[^}]*return\s+\w+\(/s,
      category: 'algorithm',
      severity: 'info',
      description: 'Recursive function without apparent memoization',
      suggestion: 'Add memoization for overlapping subproblems',
      improvement: 'Exponential → polynomial in many cases',
    },
  ]
}

const ANTI_PATTERNS = buildAntiPatterns()

const COMPLEXITY_ORDER: ComplexityClass[] = [
  'O(1)',
  'O(log n)',
  'O(n)',
  'O(n log n)',
  'O(n²)',
  'O(n³)',
  'O(2^n)',
  'O(n!)',
]

// ─── Engine ────────────────────────────────────────────────────────────────────

export class CodeOptimizer {
  private readonly config: CodeOptimizerConfig
  private stats = { totalAnalyses: 0, totalIssuesFound: 0, totalSuggestions: 0, feedbackCount: 0 }

  constructor(config: Partial<CodeOptimizerConfig> = {}) {
    this.config = { ...DEFAULT_CODE_OPTIMIZER_CONFIG, ...config }
  }

  // ── Complexity analysis ──────────────────────────────────────────────

  analyzeComplexity(code: string): ComplexityAnalysis {
    // Count nested loop depth
    let loopDepth = 0
    const maxDepth = 0
    const forPattern = /\b(for|while)\s*\(/g
    const braceOpen = /\{/g
    const braceClose = /\}/g

    let currentDepth = 0
    for (const ch of code) {
      if (ch === '{') currentDepth++
      if (ch === '}') currentDepth--
    }

    const loops = (code.match(/\b(for|while)\s*\(/g) ?? []).length
    // Estimate nesting by checking for nested loops
    const nestedLoopMatch = code.match(/for\s*\([^)]*\)\s*\{[^}]*for\s*\(/gs)
    if (nestedLoopMatch) loopDepth = 2
    else if (loops > 0) loopDepth = 1

    const tripleNest = code.match(/for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)\s*\{[^}]*for\s*\(/gs)
    if (tripleNest) loopDepth = 3

    const recursionDetected =
      /function\s+(\w+)[^}]*\1\s*\(/.test(code) || /=>\s*\{[^}]*\w+\s*\(/.test(code)

    let timeComplexity: ComplexityClass
    if (recursionDetected && loopDepth === 0) timeComplexity = 'O(2^n)'
    else if (loopDepth >= 3) timeComplexity = 'O(n³)'
    else if (loopDepth === 2) timeComplexity = 'O(n²)'
    else if (loopDepth === 1) {
      timeComplexity = code.includes('.sort(') ? 'O(n log n)' : 'O(n)'
    } else if (code.includes('binary') || code.includes('bisect') || /log/i.test(code))
      timeComplexity = 'O(log n)'
    else timeComplexity = 'O(1)'

    const spaceComplexity: ComplexityClass =
      code.includes('new Array') || code.includes('new Map') || code.includes('.map(')
        ? 'O(n)'
        : 'O(1)'

    const explanation =
      `Estimated time: ${timeComplexity}, space: ${spaceComplexity}. ` +
      `Loop depth: ${loopDepth}. ${recursionDetected ? 'Recursion detected.' : ''}`

    return { timeComplexity, spaceComplexity, loopDepth, recursionDetected, explanation }
  }

  // ── Anti-pattern detection ───────────────────────────────────────────

  detectIssues(code: string): PerformanceIssue[] {
    const issues: PerformanceIssue[] = []
    let counter = 0

    for (const ap of ANTI_PATTERNS) {
      if (ap.pattern.test(code)) {
        issues.push({
          id: `issue_${++counter}`,
          category: ap.category,
          severity: ap.severity,
          description: ap.description,
          location: ap.name,
          suggestion: ap.suggestion,
          estimatedImprovement: ap.improvement,
        })
      }
    }

    this.stats.totalIssuesFound += issues.length
    return issues.slice(0, this.config.maxIssuesPerAnalysis)
  }

  // ── Caching opportunities ────────────────────────────────────────────

  findCachingOpportunities(code: string): CachingOpportunity[] {
    if (!this.config.enableCachingAnalysis) return []

    const opportunities: CachingOpportunity[] = []

    // Pure functions called multiple times
    const funcCalls = code.match(/(\w+)\s*\(/g) ?? []
    const callCounts = new Map<string, number>()
    for (const call of funcCalls) {
      const name = call.replace(/\s*\($/, '')
      callCounts.set(name, (callCounts.get(name) ?? 0) + 1)
    }
    for (const [name, count] of callCounts) {
      if (count >= 3) {
        opportunities.push({
          functionName: name,
          reason: `Called ${count} times — may benefit from caching`,
          strategy: 'memoization',
          estimatedSpeedup: `Up to ${count - 1}x fewer computations`,
        })
      }
    }

    // Expensive operations
    if (/JSON\.parse/.test(code)) {
      opportunities.push({
        functionName: 'JSON.parse',
        reason: 'Repeated JSON parsing is CPU-intensive',
        strategy: 'precompute',
        estimatedSpeedup: 'Avoid re-parsing static data',
      })
    }
    if (/fetch\(|axios\.|http\.get/i.test(code)) {
      opportunities.push({
        functionName: 'HTTP request',
        reason: 'Network calls can be cached with TTL',
        strategy: 'ttl_cache',
        estimatedSpeedup: 'Eliminate redundant network calls',
      })
    }

    return opportunities
  }

  // ── Memory analysis ──────────────────────────────────────────────────

  analyzeMemory(code: string): MemoryIssue[] {
    if (!this.config.enableMemoryAnalysis) return []
    const issues: MemoryIssue[] = []

    if (/addEventListener/.test(code) && !/removeEventListener/.test(code)) {
      issues.push({
        pattern: 'event_listener_leak',
        description: 'Event listeners added without removal',
        severity: 'warning',
        fix: 'Add corresponding removeEventListener in cleanup',
      })
    }
    if (/setInterval/.test(code) && !/clearInterval/.test(code)) {
      issues.push({
        pattern: 'interval_leak',
        description: 'Interval set without cleanup',
        severity: 'warning',
        fix: 'Store interval ID and call clearInterval when done',
      })
    }
    if (/global\.|window\./.test(code)) {
      issues.push({
        pattern: 'global_state',
        description: 'Global variable usage may prevent garbage collection',
        severity: 'info',
        fix: 'Use module-scoped variables or WeakMap/WeakRef',
      })
    }
    if (/new\s+Array\(\d{6,}\)/.test(code)) {
      issues.push({
        pattern: 'large_allocation',
        description: 'Very large array allocation detected',
        severity: 'warning',
        fix: 'Consider streaming/chunked processing',
      })
    }
    if (/\.push\(/.test(code) && /while\s*\(true\)|for\s*\(\s*;\s*;\s*\)/.test(code)) {
      issues.push({
        pattern: 'unbounded_growth',
        description: 'Array growing in infinite/unbounded loop',
        severity: 'critical',
        fix: 'Add size limit or circular buffer',
      })
    }

    return issues
  }

  // ── Full optimization report ─────────────────────────────────────────

  analyze(code: string): OptimizationReport {
    this.stats.totalAnalyses++

    const complexity = this.analyzeComplexity(code)
    const issues = this.detectIssues(code)
    const cachingOpportunities = this.findCachingOpportunities(code)
    const memoryIssues = this.analyzeMemory(code)

    // Build suggestions from issues
    const suggestions: OptimizationSuggestion[] = issues.map((issue, i) => ({
      id: `sug_${i + 1}`,
      category: issue.category,
      title: `Fix: ${issue.description}`,
      description: issue.suggestion,
      before: issue.location,
      after: issue.suggestion,
      complexityBefore: complexity.timeComplexity,
      complexityAfter: this.estimateImprovedComplexity(complexity.timeComplexity, issue.category),
      effort:
        issue.severity === 'critical' ? 'high' : issue.severity === 'warning' ? 'medium' : 'low',
    }))

    this.stats.totalSuggestions += suggestions.length

    // Overall score (100 = perfect, deductions per issue)
    const criticalCount = issues.filter(i => i.severity === 'critical').length
    const warningCount = issues.filter(i => i.severity === 'warning').length
    const infoCount = issues.filter(i => i.severity === 'info').length
    const memoryPenalty = memoryIssues.filter(m => m.severity !== 'info').length * 5
    const complexityPenalty = COMPLEXITY_ORDER.indexOf(complexity.timeComplexity) * 3

    const score = Math.max(
      0,
      100 -
        criticalCount * 20 -
        warningCount * 10 -
        infoCount * 3 -
        memoryPenalty -
        complexityPenalty,
    )

    return {
      codeSnippet: code.substring(0, 200),
      complexity,
      issues,
      suggestions,
      cachingOpportunities,
      memoryIssues,
      overallScore: score,
    }
  }

  private estimateImprovedComplexity(
    current: ComplexityClass,
    category: OptimizationCategory,
  ): ComplexityClass {
    const idx = COMPLEXITY_ORDER.indexOf(current)
    if (category === 'algorithm' || category === 'data_structure' || category === 'loop') {
      return COMPLEXITY_ORDER[Math.max(0, idx - 1)]
    }
    return current
  }

  // ── Stats & serialization ────────────────────────────────────────────

  getStats(): Readonly<CodeOptimizerStats> {
    return { ...this.stats }
  }

  provideFeedback(): void {
    this.stats.feedbackCount++
  }

  serialize(): string {
    return JSON.stringify({ stats: this.stats })
  }

  static deserialize(json: string, config?: Partial<CodeOptimizerConfig>): CodeOptimizer {
    const data = JSON.parse(json)
    const engine = new CodeOptimizer(config)
    Object.assign(engine.stats, data.stats ?? {})
    return engine
  }
}
