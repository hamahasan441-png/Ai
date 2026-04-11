// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  MetaCognition — Epistemic Awareness & Confidence Calibration              ║
// ║                                                                            ║
// ║  Tracks predicted vs actual confidence over time, detects knowledge gaps,  ║
// ║  and provides calibrated self-assessment of reasoning capabilities.         ║
// ║                                                                            ║
// ║  No external dependencies.                                                 ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ── Types ──────────────────────────────────────────────────────────────────────

export interface EpistemicState {
  certainty: number
  uncertainty: number
  knownUnknowns: string[]
  unknownUnknowns: number
}

export interface ConfidenceFactor {
  name: string
  impact: number
  description: string
}

export interface ConfidenceAssessment {
  predicted: number
  calibrated: number
  factors: ConfidenceFactor[]
  recommendation: string
}

export interface CalibrationRecord {
  predicted: number
  actual: number
  domain: string
  timestamp: number
}

export interface KnowledgeGap {
  topic: string
  severity: number
  relatedKnown: string[]
  suggestedActions: string[]
}

export interface ReflectionResult {
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  overallAssessment: string
}

export interface MetaCognitionConfig {
  calibrationWindowSize: number
  minSamplesForCalibration: number
  gapDetectionThreshold: number
}

export interface MetaCognitionStats {
  totalAssessments: number
  avgCalibrationError: number
  knownGaps: number
  calibrationAccuracy: number
}

// ── Constants ──────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: MetaCognitionConfig = {
  calibrationWindowSize: 100,
  minSamplesForCalibration: 5,
  gapDetectionThreshold: 0.4,
}

const HEDGING_WORDS = [
  'maybe',
  'perhaps',
  'possibly',
  'might',
  'could',
  'uncertain',
  'unclear',
  'not sure',
  'i think',
  'probably',
  'likely',
  'unlikely',
  'approximately',
  'roughly',
  'estimate',
  'guess',
  'assume',
]

const COMPLEXITY_INDICATORS = [
  'why',
  'how',
  'explain',
  'compare',
  'contrast',
  'analyze',
  'evaluate',
  'synthesize',
  'prove',
  'derive',
  'implications',
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function extractWords(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean)
}

function countOccurrences(text: string, patterns: string[]): number {
  const lower = text.toLowerCase()
  let count = 0
  for (const pattern of patterns) {
    let idx = 0
    while ((idx = lower.indexOf(pattern, idx)) !== -1) {
      count++
      idx += pattern.length
    }
  }
  return count
}

function extractDomainFromQuery(query: string): string {
  const words = extractWords(query)
  const stopWords = new Set([
    'what',
    'is',
    'the',
    'a',
    'an',
    'how',
    'why',
    'do',
    'does',
    'can',
    'could',
    'would',
    'should',
    'of',
    'in',
    'to',
    'for',
    'and',
    'or',
    'but',
    'not',
    'with',
    'this',
    'that',
    'it',
  ])
  const meaningful = words.filter(w => !stopWords.has(w) && w.length > 2)
  return meaningful.slice(0, 3).join('-') || 'general'
}

// ── MetaCognition Class ────────────────────────────────────────────────────────

export class MetaCognition {
  private config: MetaCognitionConfig
  private records: CalibrationRecord[] = []
  private assessmentCount = 0
  private knownGaps: Map<string, KnowledgeGap> = new Map()
  private domainHistory: Map<string, { queries: number; avgConfidence: number }> = new Map()

  constructor(config?: Partial<MetaCognitionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ── Confidence Assessment ──────────────────────────────────────────────────

  assessConfidence(query: string, proposedAnswer: string, domain?: string): ConfidenceAssessment {
    this.assessmentCount++

    const factors = this.computeConfidenceFactors(query, proposedAnswer, domain)
    const predicted = this.aggregateFactors(factors)
    const calibrated = this.applyCalibration(predicted, domain)

    const resolvedDomain = domain ?? extractDomainFromQuery(query)
    this.updateDomainHistory(resolvedDomain, calibrated)

    const recommendation = this.buildRecommendation(calibrated, factors)

    return { predicted, calibrated, factors, recommendation }
  }

  private computeConfidenceFactors(
    query: string,
    answer: string,
    domain?: string,
  ): ConfidenceFactor[] {
    const factors: ConfidenceFactor[] = []

    // Domain familiarity
    const resolvedDomain = domain ?? extractDomainFromQuery(query)
    const domainInfo = this.domainHistory.get(resolvedDomain)
    const familiarity = domainInfo ? clamp(domainInfo.queries / 20, 0, 1) : 0.3
    factors.push({
      name: 'domain_familiarity',
      impact: familiarity,
      description: domainInfo
        ? `Seen ${domainInfo.queries} queries in "${resolvedDomain}"`
        : `No prior experience with "${resolvedDomain}"`,
    })

    // Query complexity
    const complexityCount = countOccurrences(query, COMPLEXITY_INDICATORS)
    const queryWords = extractWords(query)
    const complexityRaw = clamp(
      1 - (complexityCount * 0.15 + (queryWords.length > 20 ? 0.2 : 0)),
      0,
      1,
    )
    factors.push({
      name: 'query_complexity',
      impact: complexityRaw,
      description: `Complexity indicators: ${complexityCount}, length: ${queryWords.length} words`,
    })

    // Answer length / specificity
    const answerWords = extractWords(answer)
    const lengthScore =
      answerWords.length < 5
        ? 0.3
        : answerWords.length < 20
          ? 0.6
          : answerWords.length < 100
            ? 0.8
            : 0.7 // very long answers may meander
    factors.push({
      name: 'answer_specificity',
      impact: lengthScore,
      description: `Answer length: ${answerWords.length} words`,
    })

    // Hedging language
    const hedgingCount = countOccurrences(answer, HEDGING_WORDS)
    const hedgingPenalty = clamp(1 - hedgingCount * 0.12, 0, 1)
    factors.push({
      name: 'hedging_language',
      impact: hedgingPenalty,
      description: `Hedging words detected: ${hedgingCount}`,
    })

    // Historical calibration accuracy for domain
    const domainRecords = this.getRecordsForDomain(resolvedDomain)
    if (domainRecords.length >= this.config.minSamplesForCalibration) {
      const domainError = this.computeCalibrationError(domainRecords)
      const historyScore = clamp(1 - domainError, 0, 1)
      factors.push({
        name: 'historical_accuracy',
        impact: historyScore,
        description: `Domain calibration error: ${domainError.toFixed(3)} over ${domainRecords.length} samples`,
      })
    }

    return factors
  }

  private aggregateFactors(factors: ConfidenceFactor[]): number {
    if (factors.length === 0) return 0.5

    const weights: Record<string, number> = {
      domain_familiarity: 0.25,
      query_complexity: 0.2,
      answer_specificity: 0.2,
      hedging_language: 0.2,
      historical_accuracy: 0.15,
    }

    let weightedSum = 0
    let totalWeight = 0

    for (const factor of factors) {
      const w = weights[factor.name] ?? 0.1
      weightedSum += factor.impact * w
      totalWeight += w
    }

    return clamp(totalWeight > 0 ? weightedSum / totalWeight : 0.5, 0, 1)
  }

  private applyCalibration(predicted: number, domain?: string): number {
    const records = domain ? this.getRecordsForDomain(domain) : this.records

    if (records.length < this.config.minSamplesForCalibration) {
      return predicted
    }

    // Compute bias: positive means overconfident, negative means underconfident
    const bias = mean(records.map(r => r.predicted - r.actual))
    return clamp(predicted - bias * 0.5, 0, 1)
  }

  private buildRecommendation(calibrated: number, factors: ConfidenceFactor[]): string {
    if (calibrated >= 0.8) {
      return 'High confidence — proceed with the answer.'
    }
    if (calibrated >= 0.6) {
      const weakest = this.findWeakestFactor(factors)
      return `Moderate confidence — consider verifying ${weakest?.name ?? 'assumptions'}.`
    }
    if (calibrated >= 0.4) {
      return 'Low confidence — recommend seeking additional sources or clarification.'
    }
    return 'Very low confidence — strongly recommend escalation or deferral.'
  }

  private findWeakestFactor(factors: ConfidenceFactor[]): ConfidenceFactor | undefined {
    let weakest: ConfidenceFactor | undefined
    for (const f of factors) {
      if (!weakest || f.impact < weakest.impact) weakest = f
    }
    return weakest
  }

  // ── Calibration Recording ──────────────────────────────────────────────────

  recordOutcome(predicted: number, actual: number, domain?: string): void {
    const record: CalibrationRecord = {
      predicted: clamp(predicted, 0, 1),
      actual: clamp(actual, 0, 1),
      domain: domain ?? 'general',
      timestamp: Date.now(),
    }

    this.records.push(record)

    // Keep window bounded
    if (this.records.length > this.config.calibrationWindowSize) {
      this.records = this.records.slice(-this.config.calibrationWindowSize)
    }
  }

  // ── Epistemic State ────────────────────────────────────────────────────────

  getEpistemicState(domain?: string): EpistemicState {
    const records = domain ? this.getRecordsForDomain(domain) : this.records

    if (records.length === 0) {
      return {
        certainty: 0,
        uncertainty: 1,
        knownUnknowns: Array.from(this.knownGaps.keys()),
        unknownUnknowns: this.estimateUnknownUnknowns(),
      }
    }

    const avgActual = mean(records.map(r => r.actual))
    const avgPredicted = mean(records.map(r => r.predicted))
    const calibrationError = Math.abs(avgPredicted - avgActual)

    const certainty = clamp(avgActual * (1 - calibrationError), 0, 1)
    const uncertainty = 1 - certainty

    const knownUnknowns = Array.from(this.knownGaps.keys())
    if (domain) {
      const domainGaps = Array.from(this.knownGaps.entries())
        .filter(([, gap]) => gap.topic.includes(domain))
        .map(([key]) => key)
      if (domainGaps.length > 0) {
        return {
          certainty,
          uncertainty,
          knownUnknowns: domainGaps,
          unknownUnknowns: this.estimateUnknownUnknowns(),
        }
      }
    }

    return {
      certainty,
      uncertainty,
      knownUnknowns,
      unknownUnknowns: this.estimateUnknownUnknowns(),
    }
  }

  private estimateUnknownUnknowns(): number {
    // Heuristic: ratio of domains with low accuracy suggests unseen weaknesses
    const domains = new Set(this.records.map(r => r.domain))
    if (domains.size === 0) return 0.5

    let weakDomains = 0
    for (const d of domains) {
      const domainRecords = this.getRecordsForDomain(d)
      const avgActual = mean(domainRecords.map(r => r.actual))
      if (avgActual < this.config.gapDetectionThreshold) weakDomains++
    }

    const knownWeaknessRatio = weakDomains / domains.size
    // More weak domains → likely more unknown-unknowns
    return clamp(knownWeaknessRatio * 1.5 + 0.1, 0, 1)
  }

  // ── Knowledge Gap Detection ────────────────────────────────────────────────

  detectKnowledgeGaps(queries: string[]): KnowledgeGap[] {
    const domainGroups = new Map<string, string[]>()

    for (const query of queries) {
      const domain = extractDomainFromQuery(query)
      const existing = domainGroups.get(domain) ?? []
      existing.push(query)
      domainGroups.set(domain, existing)
    }

    const gaps: KnowledgeGap[] = []

    for (const [domain, domainQueries] of domainGroups) {
      const records = this.getRecordsForDomain(domain)
      const avgConfidence = records.length > 0 ? mean(records.map(r => r.actual)) : 0

      const domainInfo = this.domainHistory.get(domain)
      const familiarity = domainInfo ? domainInfo.avgConfidence : 0

      // Detect gap when low confidence + low familiarity
      const severity = clamp(1 - (avgConfidence * 0.6 + familiarity * 0.4), 0, 1)

      if (severity >= this.config.gapDetectionThreshold) {
        const relatedKnown = this.findRelatedDomains(domain)
        const gap: KnowledgeGap = {
          topic: domain,
          severity,
          relatedKnown,
          suggestedActions: this.suggestActions(domain, severity, domainQueries),
        }
        gaps.push(gap)
        this.knownGaps.set(domain, gap)
      }
    }

    return gaps.sort((a, b) => b.severity - a.severity)
  }

  private findRelatedDomains(domain: string): string[] {
    const domainWords = new Set(domain.split('-'))
    const related: string[] = []

    for (const [key] of this.domainHistory) {
      if (key === domain) continue
      const keyWords = key.split('-')
      const overlap = keyWords.some(w => domainWords.has(w))
      if (overlap) related.push(key)
    }

    return related.slice(0, 5)
  }

  private suggestActions(domain: string, severity: number, queries: string[]): string[] {
    const actions: string[] = []

    if (severity > 0.8) {
      actions.push(`Seek expert knowledge on "${domain}"`)
      actions.push('Defer to external sources for validation')
    } else if (severity > 0.6) {
      actions.push(`Study foundational concepts in "${domain}"`)
      actions.push('Cross-reference answers with reliable sources')
    } else {
      actions.push(`Practice more queries related to "${domain}"`)
    }

    if (queries.length > 3) {
      actions.push(`Frequent topic (${queries.length} queries) — prioritize learning`)
    }

    return actions
  }

  // ── Reflection ─────────────────────────────────────────────────────────────

  reflect(): ReflectionResult {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const improvements: string[] = []

    if (this.records.length === 0) {
      return {
        strengths: ['System initialized and ready'],
        weaknesses: ['No calibration data yet'],
        improvements: ['Begin recording outcomes to build calibration history'],
        overallAssessment: 'Insufficient data for meaningful self-assessment.',
      }
    }

    const overallError = this.computeCalibrationError(this.records)
    const overconfidentCount = this.records.filter(r => r.predicted > r.actual + 0.2).length
    const underconfidentCount = this.records.filter(r => r.predicted < r.actual - 0.2).length

    // Strengths
    if (overallError < 0.1) {
      strengths.push('Excellent calibration accuracy')
    } else if (overallError < 0.2) {
      strengths.push('Good calibration accuracy')
    }

    const domains = new Set(this.records.map(r => r.domain))
    const strongDomains: string[] = []
    const weakDomains: string[] = []

    for (const d of domains) {
      const dr = this.getRecordsForDomain(d)
      if (dr.length < this.config.minSamplesForCalibration) continue
      const err = this.computeCalibrationError(dr)
      if (err < 0.15) strongDomains.push(d)
      if (err > 0.3) weakDomains.push(d)
    }

    if (strongDomains.length > 0) {
      strengths.push(`Strong in: ${strongDomains.join(', ')}`)
    }
    if (this.records.length >= 20) {
      strengths.push(`Substantial calibration history (${this.records.length} records)`)
    }

    // Weaknesses
    if (overconfidentCount > this.records.length * 0.3) {
      weaknesses.push(`Tendency toward overconfidence (${overconfidentCount} cases)`)
    }
    if (underconfidentCount > this.records.length * 0.3) {
      weaknesses.push(`Tendency toward underconfidence (${underconfidentCount} cases)`)
    }
    if (weakDomains.length > 0) {
      weaknesses.push(`Weak in: ${weakDomains.join(', ')}`)
    }
    if (this.knownGaps.size > 0) {
      weaknesses.push(`${this.knownGaps.size} known knowledge gap(s)`)
    }

    // Improvements
    if (overallError > 0.2) {
      improvements.push('Focus on improving calibration accuracy')
    }
    if (overconfidentCount > underconfidentCount) {
      improvements.push('Apply more conservative confidence estimates')
    } else if (underconfidentCount > overconfidentCount) {
      improvements.push('Trust prior successes more when assessing confidence')
    }
    for (const wd of weakDomains.slice(0, 3)) {
      improvements.push(`Invest in learning "${wd}" domain`)
    }

    const overallAssessment =
      overallError < 0.15
        ? 'Well-calibrated system with reliable self-assessment.'
        : overallError < 0.25
          ? 'Reasonably calibrated but with room for improvement.'
          : 'Significant calibration issues — predictions diverge from outcomes.'

    return { strengths, weaknesses, improvements, overallAssessment }
  }

  // ── Calibration Curve ──────────────────────────────────────────────────────

  getCalibrationCurve(bins = 10): Array<{ predicted: number; actual: number; count: number }> {
    if (this.records.length === 0) return []

    const binSize = 1 / bins
    const result: Array<{ predicted: number; actual: number; count: number }> = []

    for (let i = 0; i < bins; i++) {
      const lower = i * binSize
      const upper = (i + 1) * binSize
      const midpoint = (lower + upper) / 2

      const binRecords = this.records.filter(r => r.predicted >= lower && r.predicted < upper)

      if (binRecords.length > 0) {
        result.push({
          predicted: midpoint,
          actual: mean(binRecords.map(r => r.actual)),
          count: binRecords.length,
        })
      } else {
        result.push({ predicted: midpoint, actual: 0, count: 0 })
      }
    }

    return result
  }

  // ── Escalation ─────────────────────────────────────────────────────────────

  shouldSeekHelp(query: string, confidence: number): boolean {
    // Low confidence is the primary signal
    if (confidence < 0.3) return true

    // Check domain history
    const domain = extractDomainFromQuery(query)
    const gap = this.knownGaps.get(domain)
    if (gap && gap.severity > 0.7) return true

    // Check if domain has historically poor calibration
    const domainRecords = this.getRecordsForDomain(domain)
    if (domainRecords.length >= this.config.minSamplesForCalibration) {
      const domainError = this.computeCalibrationError(domainRecords)
      if (domainError > 0.4 && confidence < 0.5) return true
    }

    // Complex queries with moderate confidence
    const complexityCount = countOccurrences(query, COMPLEXITY_INDICATORS)
    if (complexityCount >= 3 && confidence < 0.5) return true

    return false
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  getStats(): MetaCognitionStats {
    const avgError = this.records.length > 0 ? this.computeCalibrationError(this.records) : 0

    return {
      totalAssessments: this.assessmentCount,
      avgCalibrationError: avgError,
      knownGaps: this.knownGaps.size,
      calibrationAccuracy: clamp(1 - avgError, 0, 1),
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      config: this.config,
      records: this.records,
      assessmentCount: this.assessmentCount,
      knownGaps: Array.from(this.knownGaps.entries()),
      domainHistory: Array.from(this.domainHistory.entries()),
    })
  }

  static deserialize(json: string): MetaCognition {
    const data = JSON.parse(json) as {
      config: MetaCognitionConfig
      records: CalibrationRecord[]
      assessmentCount: number
      knownGaps: Array<[string, KnowledgeGap]>
      domainHistory: Array<[string, { queries: number; avgConfidence: number }]>
    }

    const instance = new MetaCognition(data.config)
    instance.records = data.records
    instance.assessmentCount = data.assessmentCount
    instance.knownGaps = new Map(data.knownGaps)
    instance.domainHistory = new Map(data.domainHistory)
    return instance
  }

  // ── Private Utilities ──────────────────────────────────────────────────────

  private getRecordsForDomain(domain: string): CalibrationRecord[] {
    return this.records.filter(r => r.domain === domain)
  }

  private computeCalibrationError(records: CalibrationRecord[]): number {
    if (records.length === 0) return 0
    return mean(records.map(r => Math.abs(r.predicted - r.actual)))
  }

  private updateDomainHistory(domain: string, confidence: number): void {
    const existing = this.domainHistory.get(domain)
    if (existing) {
      const total = existing.queries + 1
      existing.avgConfidence = (existing.avgConfidence * existing.queries + confidence) / total
      existing.queries = total
    } else {
      this.domainHistory.set(domain, { queries: 1, avgConfidence: confidence })
    }
  }
}
