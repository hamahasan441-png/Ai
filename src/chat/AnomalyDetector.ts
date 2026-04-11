/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  AnomalyDetector — Detect anomalies, edge cases & unusual patterns          ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Statistical Anomaly Detection — Z-score & IQR methods                  ║
 * ║    ✦ Pattern Deviation — Detect unusual query patterns                       ║
 * ║    ✦ Behavioral Anomalies — Identify out-of-distribution behaviors          ║
 * ║    ✦ Code Anomaly Detection — Detect suspicious code patterns               ║
 * ║    ✦ Data Quality Checks — Find outliers & inconsistencies                  ║
 * ║    ✦ Trend Break Detection — Spot sudden changes in sequences               ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface AnomalyResult {
  isAnomaly: boolean
  score: number // 0-1 anomaly severity
  type: AnomalyType
  description: string
  confidence: number // 0-1
  details: Record<string, unknown>
}

export type AnomalyType =
  | 'statistical_outlier'
  | 'pattern_deviation'
  | 'behavioral_anomaly'
  | 'code_smell'
  | 'data_quality'
  | 'trend_break'
  | 'none'

export interface DataPoint {
  value: number
  timestamp?: number
  label?: string
}

export interface PatternProfile {
  avgLength: number
  avgComplexity: number
  topicDistribution: Map<string, number>
  queryCount: number
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class AnomalyDetector {
  private history: DataPoint[] = []
  private queryPatterns: PatternProfile
  private readonly maxHistory = 1000

  constructor() {
    this.queryPatterns = {
      avgLength: 0,
      avgComplexity: 0,
      topicDistribution: new Map(),
      queryCount: 0,
    }
  }

  // ── Statistical Anomaly Detection ────────────────────────────────────────

  /**
   * Detect statistical outliers using Z-score method
   */
  detectStatisticalAnomaly(value: number, dataset: number[]): AnomalyResult {
    if (dataset.length < 3) {
      return this.noAnomaly('Insufficient data for statistical analysis')
    }

    const mean = this.mean(dataset)
    const stdDev = this.standardDeviation(dataset)

    if (stdDev === 0) {
      const isAnomaly = value !== mean
      return {
        isAnomaly,
        score: isAnomaly ? 1.0 : 0,
        type: isAnomaly ? 'statistical_outlier' : 'none',
        description: isAnomaly
          ? `Value ${value} deviates from constant dataset (all values = ${mean})`
          : 'Value matches constant dataset',
        confidence: 0.9,
        details: { mean, stdDev, zScore: isAnomaly ? Infinity : 0 },
      }
    }

    const zScore = Math.abs((value - mean) / stdDev)
    const isAnomaly = zScore > 2.5

    return {
      isAnomaly,
      score: Math.min(1, zScore / 5),
      type: isAnomaly ? 'statistical_outlier' : 'none',
      description: isAnomaly
        ? `Statistical outlier detected: Z-score = ${zScore.toFixed(2)} (threshold: 2.5)`
        : `Normal value: Z-score = ${zScore.toFixed(2)}`,
      confidence: Math.min(0.99, 0.5 + dataset.length / 200),
      details: { mean, stdDev, zScore, value },
    }
  }

  /**
   * Detect outliers using IQR (Interquartile Range) method
   */
  detectIQRAnomaly(value: number, dataset: number[]): AnomalyResult {
    if (dataset.length < 4) {
      return this.noAnomaly('Insufficient data for IQR analysis')
    }

    const sorted = [...dataset].sort((a, b) => a - b)
    const q1 = this.percentile(sorted, 25)
    const q3 = this.percentile(sorted, 75)
    const iqr = q3 - q1

    if (iqr === 0) {
      return this.noAnomaly('IQR is zero — dataset has no spread')
    }

    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr
    const isAnomaly = value < lowerBound || value > upperBound

    return {
      isAnomaly,
      score: isAnomaly
        ? Math.min(1, Math.abs(value - (value < lowerBound ? lowerBound : upperBound)) / iqr)
        : 0,
      type: isAnomaly ? 'statistical_outlier' : 'none',
      description: isAnomaly
        ? `IQR outlier: value ${value} outside [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`
        : `Normal: value ${value} within IQR bounds`,
      confidence: Math.min(0.95, 0.5 + dataset.length / 100),
      details: { q1, q3, iqr, lowerBound, upperBound },
    }
  }

  // ── Pattern Deviation Detection ──────────────────────────────────────────

  /**
   * Detect unusual query patterns based on learned behavior
   */
  detectQueryAnomaly(query: string): AnomalyResult {
    const length = query.length
    const complexity = this.measureComplexity(query)
    const anomalies: string[] = []
    let score = 0

    this.queryPatterns.queryCount++

    // Update running averages
    const prevAvgLen = this.queryPatterns.avgLength
    this.queryPatterns.avgLength +=
      (length - this.queryPatterns.avgLength) / this.queryPatterns.queryCount
    const prevAvgComp = this.queryPatterns.avgComplexity
    this.queryPatterns.avgComplexity +=
      (complexity - this.queryPatterns.avgComplexity) / this.queryPatterns.queryCount

    // Only check for anomalies after learning period
    if (this.queryPatterns.queryCount > 5) {
      // Check length deviation
      if (prevAvgLen > 0 && Math.abs(length - prevAvgLen) > prevAvgLen * 3) {
        anomalies.push(`Unusual query length: ${length} (avg: ${prevAvgLen.toFixed(0)})`)
        score += 0.4
      }

      // Check complexity deviation
      if (prevAvgComp > 0 && Math.abs(complexity - prevAvgComp) > prevAvgComp * 2.5) {
        anomalies.push(
          `Unusual complexity: ${complexity.toFixed(2)} (avg: ${prevAvgComp.toFixed(2)})`,
        )
        score += 0.3
      }

      // Check for injection-like patterns
      if (this.hasInjectionPattern(query)) {
        anomalies.push('Potential injection pattern detected')
        score += 0.5
      }

      // Check for excessive repetition
      if (this.hasExcessiveRepetition(query)) {
        anomalies.push('Excessive repetition detected')
        score += 0.3
      }
    }

    const isAnomaly = score > 0.3
    return {
      isAnomaly,
      score: Math.min(1, score),
      type: isAnomaly ? 'pattern_deviation' : 'none',
      description: anomalies.length > 0 ? anomalies.join('; ') : 'Normal query pattern',
      confidence: Math.min(0.9, this.queryPatterns.queryCount / 20),
      details: { length, complexity, queryCount: this.queryPatterns.queryCount },
    }
  }

  // ── Code Anomaly Detection ───────────────────────────────────────────────

  /**
   * Detect suspicious or anomalous code patterns
   */
  detectCodeAnomaly(code: string): AnomalyResult {
    const smells: string[] = []
    let score = 0

    // Extremely long lines
    const lines = code.split('\n')
    const longLines = lines.filter(l => l.length > 200)
    if (longLines.length > 0) {
      smells.push(`${longLines.length} extremely long line(s) (>200 chars)`)
      score += 0.2
    }

    // Deeply nested code
    const maxNesting = this.measureMaxNesting(code)
    if (maxNesting > 6) {
      smells.push(`Deep nesting detected: ${maxNesting} levels`)
      score += 0.3
    }

    // Excessive function length
    if (lines.length > 100) {
      smells.push(`Very long code block: ${lines.length} lines`)
      score += 0.2
    }

    // Hardcoded credentials patterns
    if (/(?:password|secret|api_key|token)\s*[:=]\s*['"][^'"]+['"]/i.test(code)) {
      smells.push('Potential hardcoded credentials')
      score += 0.8
    }

    // eval/exec usage
    if (/\b(?:eval|exec|Function)\s*\(/.test(code)) {
      smells.push('Dynamic code execution detected (eval/exec)')
      score += 0.5
    }

    // TODO/FIXME/HACK density
    const todoCount = (code.match(/\b(?:TODO|FIXME|HACK|XXX)\b/g) || []).length
    if (todoCount > 5) {
      smells.push(`High TODO/FIXME density: ${todoCount}`)
      score += 0.15
    }

    // Magic numbers
    const magicNumbers = code.match(/(?<![.\w])\b(?!0\b|1\b|2\b|100\b)\d{2,}\b(?!\.\d)/g) || []
    if (magicNumbers.length > 5) {
      smells.push(`${magicNumbers.length} potential magic numbers`)
      score += 0.15
    }

    const isAnomaly = score > 0.3
    return {
      isAnomaly,
      score: Math.min(1, score),
      type: isAnomaly ? 'code_smell' : 'none',
      description: smells.length > 0 ? smells.join('; ') : 'No code anomalies detected',
      confidence: 0.85,
      details: { lineCount: lines.length, maxNesting, todoCount, smellCount: smells.length },
    }
  }

  // ── Trend Break Detection ────────────────────────────────────────────────

  /**
   * Detect sudden changes in a time series
   */
  detectTrendBreak(series: number[], windowSize: number = 5): AnomalyResult {
    if (series.length < windowSize * 2) {
      return this.noAnomaly('Insufficient data for trend break analysis')
    }

    const recentWindow = series.slice(-windowSize)
    const previousWindow = series.slice(-windowSize * 2, -windowSize)

    const recentMean = this.mean(recentWindow)
    const previousMean = this.mean(previousWindow)
    const previousStd = this.standardDeviation(previousWindow)

    if (previousStd === 0 && previousMean === 0) {
      return this.noAnomaly('No variance in baseline period')
    }

    const changeRatio =
      previousMean !== 0
        ? Math.abs(recentMean - previousMean) / Math.abs(previousMean)
        : Math.abs(recentMean - previousMean)

    const isBreak =
      changeRatio > 0.5 ||
      (previousStd > 0 && Math.abs(recentMean - previousMean) > 3 * previousStd)

    return {
      isAnomaly: isBreak,
      score: Math.min(1, changeRatio),
      type: isBreak ? 'trend_break' : 'none',
      description: isBreak
        ? `Trend break detected: ${(changeRatio * 100).toFixed(1)}% change (${previousMean.toFixed(2)} → ${recentMean.toFixed(2)})`
        : `Stable trend: ${(changeRatio * 100).toFixed(1)}% change`,
      confidence: Math.min(0.95, 0.6 + series.length / 100),
      details: { recentMean, previousMean, changeRatio, windowSize },
    }
  }

  // ── Data Quality Detection ───────────────────────────────────────────────

  /**
   * Check data array for quality issues
   */
  detectDataQualityIssues(data: unknown[]): AnomalyResult {
    const issues: string[] = []
    let score = 0

    if (data.length === 0) {
      return {
        isAnomaly: true,
        score: 0.5,
        type: 'data_quality',
        description: 'Empty dataset',
        confidence: 1.0,
        details: { size: 0 },
      }
    }

    // Check for null/undefined
    const nullCount = data.filter(d => d === null || d === undefined).length
    if (nullCount > 0) {
      const ratio = nullCount / data.length
      issues.push(`${nullCount} null/undefined values (${(ratio * 100).toFixed(1)}%)`)
      score += ratio * 0.5
    }

    // Check for duplicates
    const uniqueCount = new Set(data.map(d => JSON.stringify(d))).size
    const dupRatio = 1 - uniqueCount / data.length
    if (dupRatio > 0.5) {
      issues.push(`${(dupRatio * 100).toFixed(1)}% duplicate values`)
      score += 0.3
    }

    // Type inconsistency
    const types = new Set(data.map(d => typeof d))
    if (types.size > 2) {
      issues.push(`Mixed types detected: ${[...types].join(', ')}`)
      score += 0.3
    }

    const isAnomaly = score > 0.2
    return {
      isAnomaly,
      score: Math.min(1, score),
      type: isAnomaly ? 'data_quality' : 'none',
      description: issues.length > 0 ? issues.join('; ') : 'Data quality looks good',
      confidence: 0.9,
      details: { size: data.length, nullCount, uniqueCount, types: [...types] },
    }
  }

  // ── Behavioral Anomaly ──────────────────────────────────────────────────

  /**
   * Detect behavioral anomalies from a sequence of actions
   */
  detectBehavioralAnomaly(actions: string[], normalPatterns: string[][]): AnomalyResult {
    if (actions.length === 0 || normalPatterns.length === 0) {
      return this.noAnomaly('No actions or patterns to compare')
    }

    // Calculate similarity to known patterns
    let maxSimilarity = 0
    for (const pattern of normalPatterns) {
      const sim = this.sequenceSimilarity(actions, pattern)
      if (sim > maxSimilarity) maxSimilarity = sim
    }

    const deviationScore = 1 - maxSimilarity
    const isAnomaly = deviationScore > 0.7

    return {
      isAnomaly,
      score: deviationScore,
      type: isAnomaly ? 'behavioral_anomaly' : 'none',
      description: isAnomaly
        ? `Behavioral anomaly: ${(deviationScore * 100).toFixed(0)}% deviation from normal patterns`
        : `Normal behavior: ${(maxSimilarity * 100).toFixed(0)}% match to known patterns`,
      confidence: Math.min(0.9, 0.5 + normalPatterns.length / 20),
      details: { maxSimilarity, deviationScore, actionCount: actions.length },
    }
  }

  // ── Helper Methods ───────────────────────────────────────────────────────

  private mean(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0) / values.length
  }

  private standardDeviation(values: number[]): number {
    const avg = this.mean(values)
    const squareDiffs = values.map(v => (v - avg) ** 2)
    return Math.sqrt(squareDiffs.reduce((sum, v) => sum + v, 0) / values.length)
  }

  private percentile(sorted: number[], p: number): number {
    const index = (p / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    if (lower === upper) return sorted[lower]!
    const fraction = index - lower
    return sorted[lower]! + fraction * (sorted[upper]! - sorted[lower]!)
  }

  private measureComplexity(text: string): number {
    const words = text.split(/\s+/).length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size
    const lexicalDiversity = words > 0 ? uniqueWords / words : 0
    return (words * 0.3 + sentences * 0.2 + lexicalDiversity * 10) / 3
  }

  private hasInjectionPattern(text: string): boolean {
    const patterns = [
      /['"]\s*(?:OR|AND)\s*['"]/i,
      /;\s*(?:DROP|DELETE|INSERT|UPDATE)\s/i,
      /<script\b/i,
      /\{\{.*\}\}/,
      /\$\{.*\}/,
    ]
    return patterns.some(p => p.test(text))
  }

  private hasExcessiveRepetition(text: string): boolean {
    const words = text.toLowerCase().split(/\s+/)
    if (words.length < 10) return false
    const freq = new Map<string, number>()
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1)
    const maxFreq = Math.max(...freq.values())
    return maxFreq / words.length > 0.4
  }

  private measureMaxNesting(code: string): number {
    let max = 0
    let current = 0
    for (const ch of code) {
      if (ch === '{' || ch === '(' || ch === '[') {
        current++
        max = Math.max(max, current)
      }
      if (ch === '}' || ch === ')' || ch === ']') current = Math.max(0, current - 1)
    }
    return max
  }

  private sequenceSimilarity(seq1: string[], seq2: string[]): number {
    if (seq1.length === 0 && seq2.length === 0) return 1
    if (seq1.length === 0 || seq2.length === 0) return 0

    // Longest common subsequence
    const m = seq1.length
    const n = seq2.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (seq1[i - 1] === seq2[j - 1]) {
          dp[i]![j] = dp[i - 1]![j - 1]! + 1
        } else {
          dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
        }
      }
    }

    return dp[m]![n]! / Math.max(m, n)
  }

  private noAnomaly(description: string): AnomalyResult {
    return {
      isAnomaly: false,
      score: 0,
      type: 'none',
      description,
      confidence: 0.5,
      details: {},
    }
  }

  /**
   * Add a data point to history for trend analysis
   */
  addDataPoint(point: DataPoint): void {
    this.history.push(point)
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory)
    }
  }

  /**
   * Get current anomaly detection history size
   */
  getHistorySize(): number {
    return this.history.length
  }

  /**
   * Reset the detector state
   */
  reset(): void {
    this.history = []
    this.queryPatterns = {
      avgLength: 0,
      avgComplexity: 0,
      topicDistribution: new Map(),
      queryCount: 0,
    }
  }
}
