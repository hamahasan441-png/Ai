/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  InsightExtractor — Pattern discovery, trend detection & insight ranking   ║
 * ║                                                                            ║
 * ║  Discovers patterns across data and text, detects trends, spots           ║
 * ║  anomalies, extracts key insights, and ranks them by significance.        ║
 * ║  Provides structured insight reports for decision-making.                  ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Text-based insight extraction (key findings, takeaways)              ║
 * ║    • Trend detection in time-series data                                  ║
 * ║    • Anomaly detection via statistical methods                            ║
 * ║    • Pattern discovery (recurring themes, correlations)                   ║
 * ║    • Insight ranking by significance and actionability                    ║
 * ║    • Cross-source insight synthesis                                       ║
 * ║    • Insight categorization and tagging                                   ║
 * ║    • Summary generation from multiple insights                            ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type InsightCategory = 'trend' | 'anomaly' | 'pattern' | 'correlation' | 'finding' | 'recommendation' | 'warning' | 'opportunity'
export type SignificanceLevel = 'low' | 'medium' | 'high' | 'critical'
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile' | 'cyclical'

export interface Insight {
  readonly id: string
  readonly category: InsightCategory
  readonly title: string
  readonly description: string
  readonly significance: SignificanceLevel
  readonly score: number // 0-1
  readonly evidence: readonly string[]
  readonly tags: readonly string[]
  readonly source: string
  readonly actionable: boolean
  readonly createdAt: number
}

export interface TrendResult {
  readonly direction: TrendDirection
  readonly slope: number
  readonly confidence: number
  readonly startValue: number
  readonly endValue: number
  readonly changePercent: number
  readonly dataPoints: number
}

export interface AnomalyResult {
  readonly index: number
  readonly value: number
  readonly expectedValue: number
  readonly deviation: number
  readonly severity: SignificanceLevel
}

export interface PatternResult {
  readonly pattern: string
  readonly frequency: number
  readonly confidence: number
  readonly examples: readonly string[]
}

export interface InsightReport {
  readonly title: string
  readonly insights: readonly Insight[]
  readonly topInsights: readonly Insight[]
  readonly trendSummary: string
  readonly anomalySummary: string
  readonly recommendations: readonly string[]
  readonly generatedAt: number
}

export interface TextInsight {
  readonly keyFindings: readonly string[]
  readonly themes: readonly string[]
  readonly sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  readonly complexity: 'simple' | 'moderate' | 'complex'
  readonly actionItems: readonly string[]
}

export interface InsightExtractorConfig {
  readonly maxInsights: number
  readonly anomalyThreshold: number // standard deviations
  readonly minPatternFrequency: number
  readonly topInsightCount: number
  readonly enableAutoTagging: boolean
}

export interface InsightExtractorStats {
  readonly totalInsights: number
  readonly totalTrends: number
  readonly totalAnomalies: number
  readonly totalPatterns: number
  readonly totalReports: number
  readonly feedbackCount: number
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_INSIGHT_EXTRACTOR_CONFIG: InsightExtractorConfig = {
  maxInsights: 1000,
  anomalyThreshold: 2.0,
  minPatternFrequency: 2,
  topInsightCount: 5,
  enableAutoTagging: true,
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

let _insightIdCounter = 0
function insightId(): string {
  return `ins_${++_insightIdCounter}_${Date.now().toString(36)}`
}

function mean(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(variance)
}

function linearRegression(values: number[]): { slope: number; intercept: number; r2: number } {
  const n = values.length
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0, r2: 0 }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
    sumY2 += values[i] * values[i]
  }

  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: mean(values), r2: 0 }

  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n

  // R²
  const ssTot = sumY2 - (sumY * sumY) / n
  const ssRes = values.reduce((s, v, i) => s + (v - (intercept + slope * i)) ** 2, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0

  return { slope, intercept, r2 }
}

function significanceFromScore(score: number): SignificanceLevel {
  if (score >= 0.8) return 'critical'
  if (score >= 0.6) return 'high'
  if (score >= 0.3) return 'medium'
  return 'low'
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class InsightExtractor {
  private readonly config: InsightExtractorConfig
  private readonly insights: Insight[] = []
  private stats = {
    totalInsights: 0,
    totalTrends: 0,
    totalAnomalies: 0,
    totalPatterns: 0,
    totalReports: 0,
    feedbackCount: 0,
  }

  constructor(config: Partial<InsightExtractorConfig> = {}) {
    this.config = { ...DEFAULT_INSIGHT_EXTRACTOR_CONFIG, ...config }
  }

  // ── Trend detection ──────────────────────────────────────────────────

  detectTrend(values: number[]): TrendResult {
    this.stats.totalTrends++
    if (values.length < 2) {
      return { direction: 'stable', slope: 0, confidence: 0, startValue: values[0] ?? 0, endValue: values[0] ?? 0, changePercent: 0, dataPoints: values.length }
    }

    const { slope, r2 } = linearRegression(values)
    const startValue = values[0]
    const endValue = values[values.length - 1]
    const changePercent = startValue !== 0 ? ((endValue - startValue) / Math.abs(startValue)) * 100 : 0

    const sd = stdDev(values)
    const m = mean(values)
    const cv = m !== 0 ? sd / Math.abs(m) : 0

    let direction: TrendDirection
    if (cv > 0.5) direction = 'volatile'
    else if (Math.abs(slope) < sd * 0.1) direction = 'stable'
    else if (slope > 0) direction = 'increasing'
    else direction = 'decreasing'

    return { direction, slope, confidence: Math.abs(r2), startValue, endValue, changePercent, dataPoints: values.length }
  }

  // ── Anomaly detection ────────────────────────────────────────────────

  detectAnomalies(values: number[]): AnomalyResult[] {
    this.stats.totalAnomalies++
    if (values.length < 3) return []

    const m = mean(values)
    const sd = stdDev(values)
    if (sd === 0) return []

    const anomalies: AnomalyResult[] = []
    for (let i = 0; i < values.length; i++) {
      const deviation = Math.abs(values[i] - m) / sd
      if (deviation >= this.config.anomalyThreshold) {
        anomalies.push({
          index: i,
          value: values[i],
          expectedValue: m,
          deviation,
          severity: deviation >= 3 ? 'critical' : deviation >= 2.5 ? 'high' : 'medium',
        })
      }
    }
    return anomalies
  }

  // ── Pattern discovery ────────────────────────────────────────────────

  findPatterns(texts: string[]): PatternResult[] {
    this.stats.totalPatterns++
    // Extract n-grams (bigrams and trigrams) as patterns
    const ngramCounts = new Map<string, { count: number; examples: string[] }>()

    for (const text of texts) {
      const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2)
      for (let n = 2; n <= 3; n++) {
        for (let i = 0; i <= words.length - n; i++) {
          const ngram = words.slice(i, i + n).join(' ')
          const entry = ngramCounts.get(ngram) ?? { count: 0, examples: [] }
          entry.count++
          if (entry.examples.length < 3) entry.examples.push(text.substring(0, 100))
          ngramCounts.set(ngram, entry)
        }
      }
    }

    const patterns: PatternResult[] = []
    for (const [ngram, data] of ngramCounts) {
      if (data.count >= this.config.minPatternFrequency) {
        patterns.push({
          pattern: ngram,
          frequency: data.count,
          confidence: Math.min(1, data.count / texts.length),
          examples: data.examples,
        })
      }
    }

    return patterns.sort((a, b) => b.frequency - a.frequency).slice(0, 20)
  }

  // ── Text insight extraction ──────────────────────────────────────────

  extractTextInsights(text: string): TextInsight {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
    const words = text.toLowerCase().split(/\s+/)

    // Key findings: sentences with important signal words
    const keySignals = /\b(important|significant|critical|notable|key|major|primary|essential|crucial|fundamental)\b/i
    const keyFindings = sentences.filter(s => keySignals.test(s)).map(s => s.trim()).slice(0, 5)

    // Themes: frequent meaningful words
    const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'has', 'her', 'was', 'one', 'our', 'out', 'this', 'that', 'with', 'from', 'they', 'have', 'been', 'said', 'each', 'which', 'their', 'will', 'other', 'about', 'than', 'into'])
    const wordFreq = new Map<string, number>()
    for (const w of words) {
      if (w.length > 3 && !stopWords.has(w)) wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1)
    }
    const themes = [...wordFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w)

    // Sentiment
    const posWords = /\b(good|great|excellent|positive|success|improve|benefit|advantage|strong|growth)\b/gi
    const negWords = /\b(bad|poor|fail|negative|problem|issue|risk|threat|weak|decline)\b/gi
    const posCount = (text.match(posWords) ?? []).length
    const negCount = (text.match(negWords) ?? []).length
    const sentiment = posCount > negCount * 1.5 ? 'positive' : negCount > posCount * 1.5 ? 'negative' : posCount > 0 && negCount > 0 ? 'mixed' : 'neutral'

    // Complexity
    const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(1, words.length)
    const complexity = avgWordLen > 6 ? 'complex' : avgWordLen > 4.5 ? 'moderate' : 'simple'

    // Action items
    const actionPatterns = /\b(should|must|need\s+to|recommend|suggest|ensure|consider|implement|address)\b/i
    const actionItems = sentences.filter(s => actionPatterns.test(s)).map(s => s.trim()).slice(0, 5)

    return { keyFindings, themes, sentiment, complexity, actionItems }
  }

  // ── Insight creation ─────────────────────────────────────────────────

  addInsight(category: InsightCategory, title: string, description: string, evidence: string[] = [], tags: string[] = [], source: string = 'manual'): Insight {
    const actionable = category === 'recommendation' || category === 'opportunity' || category === 'warning'
    const baseScore = category === 'anomaly' || category === 'warning' ? 0.7 : category === 'recommendation' || category === 'opportunity' ? 0.6 : 0.4
    const evidenceBonus = Math.min(0.3, evidence.length * 0.1)
    const score = Math.min(1, baseScore + evidenceBonus)

    const insight: Insight = {
      id: insightId(),
      category,
      title,
      description,
      significance: significanceFromScore(score),
      score,
      evidence,
      tags: this.config.enableAutoTagging ? [...tags, category] : [...tags],
      source,
      actionable,
      createdAt: Date.now(),
    }

    this.insights.push(insight)
    this.stats.totalInsights++
    if (this.insights.length > this.config.maxInsights) this.insights.shift()
    return insight
  }

  getInsights(): readonly Insight[] {
    return [...this.insights]
  }

  getInsightsByCategory(category: InsightCategory): Insight[] {
    return this.insights.filter(i => i.category === category)
  }

  getTopInsights(count?: number): Insight[] {
    const n = count ?? this.config.topInsightCount
    return [...this.insights].sort((a, b) => b.score - a.score).slice(0, n)
  }

  // ── Report generation ────────────────────────────────────────────────

  generateReport(title: string): InsightReport {
    this.stats.totalReports++

    const topInsights = this.getTopInsights()
    const trends = this.insights.filter(i => i.category === 'trend')
    const anomalies = this.insights.filter(i => i.category === 'anomaly')
    const recommendations = this.insights.filter(i => i.category === 'recommendation').map(i => i.description)

    const trendSummary = trends.length > 0
      ? `${trends.length} trend(s) detected: ${trends.map(t => t.title).join(', ')}`
      : 'No trends detected'

    const anomalySummary = anomalies.length > 0
      ? `${anomalies.length} anomaly/anomalies detected: ${anomalies.map(a => a.title).join(', ')}`
      : 'No anomalies detected'

    return {
      title,
      insights: [...this.insights],
      topInsights,
      trendSummary,
      anomalySummary,
      recommendations: recommendations.slice(0, 10),
      generatedAt: Date.now(),
    }
  }

  // ── Stats & feedback ─────────────────────────────────────────────────

  getStats(): Readonly<InsightExtractorStats> {
    return {
      totalInsights: this.stats.totalInsights,
      totalTrends: this.stats.totalTrends,
      totalAnomalies: this.stats.totalAnomalies,
      totalPatterns: this.stats.totalPatterns,
      totalReports: this.stats.totalReports,
      feedbackCount: this.stats.feedbackCount,
    }
  }

  provideFeedback(): void {
    this.stats.feedbackCount++
  }

  serialize(): string {
    return JSON.stringify({ insights: this.insights, stats: this.stats })
  }

  static deserialize(json: string, config?: Partial<InsightExtractorConfig>): InsightExtractor {
    const engine = new InsightExtractor(config)
    const data = JSON.parse(json)
    if (data.insights) engine.insights.push(...data.insights)
    if (data.stats) Object.assign(engine.stats, data.stats)
    return engine
  }
}
