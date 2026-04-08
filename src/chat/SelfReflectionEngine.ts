/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SelfReflectionEngine — Meta-cognitive self-evaluation & improvement        ║
 * ║                                                                            ║
 * ║  Enables the AI to evaluate its own outputs, detect error patterns,        ║
 * ║  assess response quality, and generate improvement strategies.             ║
 * ║  Maintains a rolling history of past evaluations for trend analysis.       ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Output quality scoring (coherence, relevance, completeness, accuracy) ║
 * ║    • Error pattern detection and categorization                            ║
 * ║    • Blind-spot identification across domains                              ║
 * ║    • Improvement strategy generation                                       ║
 * ║    • Performance trend tracking over time                                  ║
 * ║    • Self-correction suggestion pipeline                                   ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Quality dimension for evaluating an output. */
export type QualityDimension =
  | 'coherence'
  | 'relevance'
  | 'completeness'
  | 'accuracy'
  | 'clarity'
  | 'depth'
  | 'actionability'

/** A single quality score along one dimension. */
export interface DimensionScore {
  readonly dimension: QualityDimension
  readonly score: number
  readonly evidence: string
  readonly suggestions: string[]
}

/** Complete evaluation of a single output. */
export interface OutputEvaluation {
  readonly id: string
  readonly timestamp: number
  readonly input: string
  readonly output: string
  readonly domain: string
  readonly dimensionScores: DimensionScore[]
  readonly overallScore: number
  readonly strengths: string[]
  readonly weaknesses: string[]
  readonly selfCorrectionSuggestions: string[]
}

/** A recurring error pattern detected across evaluations. */
export interface ErrorPattern {
  readonly id: string
  readonly category: ErrorCategory
  readonly description: string
  readonly frequency: number
  readonly domains: string[]
  readonly examples: string[]
  readonly severity: 'low' | 'medium' | 'high' | 'critical'
  readonly suggestedFix: string
}

/** Categories of common AI errors. */
export type ErrorCategory =
  | 'hallucination'
  | 'over_generalization'
  | 'missing_context'
  | 'logical_inconsistency'
  | 'incomplete_answer'
  | 'wrong_assumption'
  | 'outdated_knowledge'
  | 'format_mismatch'
  | 'over_confidence'
  | 'under_confidence'
  | 'repetition'
  | 'tangential'

/** Blind spot in a particular domain. */
export interface BlindSpot {
  readonly domain: string
  readonly description: string
  readonly confidence: number
  readonly evidenceCount: number
  readonly detectedAt: number
}

/** Strategy for improving performance. */
export interface ImprovementStrategy {
  readonly id: string
  readonly targetDimension: QualityDimension
  readonly description: string
  readonly priority: 'low' | 'medium' | 'high' | 'critical'
  readonly expectedImpact: number
  readonly actionItems: string[]
}

/** Performance trend over a window of evaluations. */
export interface PerformanceTrend {
  readonly dimension: QualityDimension
  readonly direction: 'improving' | 'stable' | 'declining'
  readonly slope: number
  readonly recentAvg: number
  readonly historicalAvg: number
  readonly windowSize: number
}

/** Configuration for the self-reflection engine. */
export interface SelfReflectionEngineConfig {
  /** Maximum evaluations to keep in history. Default: 500 */
  readonly maxEvaluationHistory: number
  /** Window size for trend analysis. Default: 20 */
  readonly trendWindowSize: number
  /** Minimum evaluations before detecting patterns. Default: 5 */
  readonly minEvaluationsForPatterns: number
  /** Score threshold below which to flag as weak. Default: 0.5 */
  readonly weaknessThreshold: number
  /** Enable automatic improvement strategy generation. Default: true */
  readonly enableAutoStrategies: boolean
}

/** Runtime statistics. */
export interface SelfReflectionEngineStats {
  readonly totalEvaluations: number
  readonly avgOverallScore: number
  readonly errorPatternsDetected: number
  readonly blindSpotsDetected: number
  readonly strategiesGenerated: number
  readonly improvementRate: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_SELF_REFLECTION_CONFIG: SelfReflectionEngineConfig = {
  maxEvaluationHistory: 500,
  trendWindowSize: 20,
  minEvaluationsForPatterns: 5,
  weaknessThreshold: 0.5,
  enableAutoStrategies: true,
}

/** Keywords indicating potential issues per error category. */
const ERROR_CATEGORY_SIGNALS: Record<ErrorCategory, string[]> = {
  hallucination: ['fabricated', 'invented', 'doesn\'t exist', 'no such', 'fictional', 'made up', 'non-existent'],
  over_generalization: ['always', 'never', 'all', 'none', 'every', 'universally', 'without exception'],
  missing_context: ['depends on', 'need more info', 'unclear', 'context', 'ambiguous', 'insufficient'],
  logical_inconsistency: ['contradicts', 'but earlier', 'however', 'inconsistent', 'paradox', 'conflicts with'],
  incomplete_answer: ['also consider', 'additionally', 'missing', 'forgot to mention', 'left out', 'incomplete'],
  wrong_assumption: ['assumed', 'presupposed', 'took for granted', 'incorrectly assumed', 'wrong premise'],
  outdated_knowledge: ['deprecated', 'no longer', 'was replaced', 'outdated', 'obsolete', 'old version'],
  format_mismatch: ['format', 'expected', 'wrong type', 'should be', 'formatting', 'structure'],
  over_confidence: ['certainly', 'absolutely', 'definitely', 'without doubt', 'guaranteed', '100%'],
  under_confidence: ['maybe', 'perhaps', 'not sure', 'might be', 'possibly', 'uncertain', 'I think'],
  repetition: ['as I said', 'mentioned earlier', 'again', 'repeated', 'already stated', 'redundant'],
  tangential: ['by the way', 'off topic', 'unrelated', 'side note', 'tangent', 'digression'],
}

/** Quality dimension evaluation criteria. */
const DIMENSION_CRITERIA: Record<QualityDimension, { keywords: string[]; antiKeywords: string[] }> = {
  coherence: {
    keywords: ['therefore', 'because', 'follows', 'consequently', 'thus', 'leads to', 'since'],
    antiKeywords: ['however', 'but', 'contradicts', 'on the other hand', 'conflicting'],
  },
  relevance: {
    keywords: ['specifically', 'regarding', 'about', 'concerning', 'related to', 'addresses'],
    antiKeywords: ['unrelated', 'tangent', 'off-topic', 'by the way', 'side note'],
  },
  completeness: {
    keywords: ['comprehensive', 'covers', 'including', 'additionally', 'furthermore', 'also'],
    antiKeywords: ['missing', 'lacks', 'incomplete', 'doesn\'t cover', 'forgot', 'omitted'],
  },
  accuracy: {
    keywords: ['verified', 'correct', 'accurate', 'precise', 'exact', 'validated'],
    antiKeywords: ['wrong', 'incorrect', 'error', 'mistake', 'inaccurate', 'false'],
  },
  clarity: {
    keywords: ['clearly', 'simply', 'straightforward', 'plain', 'understandable', 'explained'],
    antiKeywords: ['confusing', 'unclear', 'ambiguous', 'vague', 'convoluted', 'complex'],
  },
  depth: {
    keywords: ['detailed', 'in-depth', 'thorough', 'extensive', 'comprehensive', 'nuanced'],
    antiKeywords: ['superficial', 'shallow', 'brief', 'overview', 'surface-level', 'basic'],
  },
  actionability: {
    keywords: ['step', 'do', 'implement', 'apply', 'execute', 'follow', 'action', 'run'],
    antiKeywords: ['theoretical', 'abstract', 'conceptual', 'vague', 'general', 'non-specific'],
  },
}

/** Domain detection keywords. */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  programming: ['code', 'function', 'class', 'variable', 'api', 'debug', 'compile', 'syntax', 'algorithm'],
  science: ['hypothesis', 'experiment', 'theory', 'observation', 'data', 'research', 'study'],
  math: ['equation', 'formula', 'proof', 'theorem', 'calculate', 'solve', 'number'],
  security: ['vulnerability', 'exploit', 'attack', 'defense', 'security', 'hack', 'threat'],
  trading: ['market', 'stock', 'trade', 'price', 'indicator', 'strategy', 'portfolio'],
  language: ['grammar', 'word', 'sentence', 'translation', 'language', 'linguistic'],
  general: ['explain', 'describe', 'what', 'how', 'why', 'tell me'],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `sr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function countKeywordHits(text: string, keywords: string[]): number {
  const lower = text.toLowerCase()
  return keywords.reduce((count, kw) => count + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0)
}

function detectDomain(text: string): string {
  const lower = text.toLowerCase()
  let bestDomain = 'general'
  let bestScore = 0
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = countKeywordHits(lower, keywords)
    if (score > bestScore) {
      bestScore = score
      bestDomain = domain
    }
  }
  return bestDomain
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class SelfReflectionEngine {
  private readonly config: SelfReflectionEngineConfig
  private readonly evaluations: OutputEvaluation[] = []
  private readonly errorPatterns: Map<string, ErrorPattern> = new Map()
  private readonly blindSpots: Map<string, BlindSpot> = new Map()
  private readonly strategies: ImprovementStrategy[] = []
  private stats = {
    totalEvaluations: 0,
    totalScore: 0,
    errorPatternsDetected: 0,
    blindSpotsDetected: 0,
    strategiesGenerated: 0,
  }

  constructor(config: Partial<SelfReflectionEngineConfig> = {}) {
    this.config = { ...DEFAULT_SELF_REFLECTION_CONFIG, ...config }
  }

  // ── Core: Evaluate an output ────────────────────────────────────────────

  /** Evaluate the quality of an AI output given its input. */
  evaluate(input: string, output: string): OutputEvaluation {
    const domain = detectDomain(input + ' ' + output)
    const dimensionScores = this.scoreDimensions(input, output)
    const overallScore = this.computeOverallScore(dimensionScores)
    const strengths = this.identifyStrengths(dimensionScores)
    const weaknesses = this.identifyWeaknesses(dimensionScores)
    const corrections = this.generateSelfCorrections(input, output, weaknesses, dimensionScores)

    const evaluation: OutputEvaluation = {
      id: generateId(),
      timestamp: Date.now(),
      input,
      output,
      domain,
      dimensionScores,
      overallScore,
      strengths,
      weaknesses,
      selfCorrectionSuggestions: corrections,
    }

    this.recordEvaluation(evaluation)
    return evaluation
  }

  // ── Score each quality dimension ────────────────────────────────────────

  private scoreDimensions(input: string, output: string): DimensionScore[] {
    const dimensions: QualityDimension[] = [
      'coherence', 'relevance', 'completeness', 'accuracy', 'clarity', 'depth', 'actionability',
    ]
    return dimensions.map(dim => this.scoreSingleDimension(dim, input, output))
  }

  private scoreSingleDimension(dimension: QualityDimension, input: string, output: string): DimensionScore {
    const criteria = DIMENSION_CRITERIA[dimension]
    const positive = countKeywordHits(output, criteria.keywords)
    const negative = countKeywordHits(output, criteria.antiKeywords)

    // Base score from keyword signals
    let score = 0.5 + (positive * 0.08) - (negative * 0.1)

    // Length heuristics
    const outputWords = output.split(/\s+/).length
    const inputWords = input.split(/\s+/).length

    if (dimension === 'completeness') {
      // Longer answers tend to be more complete (up to a point)
      score += Math.min(outputWords / 200, 0.2)
    }
    if (dimension === 'relevance') {
      // Check overlap between input and output tokens
      const inputTokens = new Set(input.toLowerCase().split(/\s+/))
      const outputTokens = output.toLowerCase().split(/\s+/)
      const overlap = outputTokens.filter(t => inputTokens.has(t)).length
      score += Math.min(overlap / Math.max(inputWords, 1) * 0.15, 0.2)
    }
    if (dimension === 'depth') {
      // Sentences count as depth indicator
      const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0).length
      score += Math.min(sentences / 15, 0.15)
    }
    if (dimension === 'clarity') {
      // Shorter sentences tend to be clearer
      const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0)
      const avgLen = sentences.length > 0 ? outputWords / sentences.length : outputWords
      if (avgLen < 20) score += 0.1
      else if (avgLen > 40) score -= 0.1
    }
    if (dimension === 'actionability') {
      // Check for numbered/bullet steps
      const hasSteps = /\d+\.|[-•*]\s/.test(output)
      if (hasSteps) score += 0.15
    }

    score = clamp(score, 0, 1)

    const suggestions: string[] = []
    if (score < this.config.weaknessThreshold) {
      suggestions.push(...this.getDimensionSuggestions(dimension, score))
    }

    return {
      dimension,
      score,
      evidence: `positive signals: ${positive}, negative signals: ${negative}, output length: ${outputWords} words`,
      suggestions,
    }
  }

  private getDimensionSuggestions(dimension: QualityDimension, _score: number): string[] {
    const suggestions: Record<QualityDimension, string[]> = {
      coherence: ['Improve logical flow between paragraphs', 'Add transitional phrases', 'Ensure consistent terminology'],
      relevance: ['Focus more on the user\'s specific question', 'Remove tangential information', 'Address the core ask first'],
      completeness: ['Cover edge cases', 'Add examples', 'Address potential follow-up questions'],
      accuracy: ['Double-check factual claims', 'Add caveats where uncertain', 'Cross-reference with known facts'],
      clarity: ['Use simpler language', 'Break long sentences', 'Define technical terms'],
      depth: ['Provide more detailed explanations', 'Include technical specifics', 'Add nuanced analysis'],
      actionability: ['Include step-by-step instructions', 'Add code examples', 'Provide concrete next actions'],
    }
    return suggestions[dimension] || []
  }

  // ── Aggregate scoring ──────────────────────────────────────────────────

  private computeOverallScore(scores: DimensionScore[]): number {
    if (scores.length === 0) return 0
    const weights: Record<QualityDimension, number> = {
      coherence: 0.15,
      relevance: 0.25,
      completeness: 0.15,
      accuracy: 0.20,
      clarity: 0.10,
      depth: 0.10,
      actionability: 0.05,
    }
    let total = 0
    let weightSum = 0
    for (const s of scores) {
      const w = weights[s.dimension] ?? 0.1
      total += s.score * w
      weightSum += w
    }
    return clamp(total / Math.max(weightSum, 0.01), 0, 1)
  }

  private identifyStrengths(scores: DimensionScore[]): string[] {
    return scores
      .filter(s => s.score >= 0.7)
      .map(s => `Strong ${s.dimension} (${(s.score * 100).toFixed(0)}%)`)
  }

  private identifyWeaknesses(scores: DimensionScore[]): string[] {
    return scores
      .filter(s => s.score < this.config.weaknessThreshold)
      .map(s => `Weak ${s.dimension} (${(s.score * 100).toFixed(0)}%)`)
  }

  // ── Self-correction suggestions ────────────────────────────────────────

  private generateSelfCorrections(
    input: string,
    output: string,
    weaknesses: string[],
    scores: DimensionScore[],
  ): string[] {
    const corrections: string[] = []
    const lower = output.toLowerCase()

    // Check for error category signals
    for (const [category, signals] of Object.entries(ERROR_CATEGORY_SIGNALS)) {
      const hits = countKeywordHits(lower, signals)
      if (hits >= 2) {
        corrections.push(`Potential ${category.replace(/_/g, ' ')}: review output for ${signals.slice(0, 3).join(', ')} patterns`)
      }
    }

    // Dimension-specific corrections
    for (const score of scores) {
      if (score.score < this.config.weaknessThreshold && score.suggestions.length > 0) {
        corrections.push(score.suggestions[0])
      }
    }

    // Ratio check: if output is much shorter than input, might be incomplete
    const inputLen = input.split(/\s+/).length
    const outputLen = output.split(/\s+/).length
    if (inputLen > 20 && outputLen < inputLen * 0.3) {
      corrections.push('Response may be too brief for the complexity of the question')
    }

    return corrections.slice(0, 10)
  }

  // ── Recording & history ────────────────────────────────────────────────

  private recordEvaluation(evaluation: OutputEvaluation): void {
    this.evaluations.push(evaluation)
    this.stats.totalEvaluations++
    this.stats.totalScore += evaluation.overallScore

    // Prune history
    while (this.evaluations.length > this.config.maxEvaluationHistory) {
      this.evaluations.shift()
    }

    // Update error patterns
    if (this.evaluations.length >= this.config.minEvaluationsForPatterns) {
      this.detectErrorPatterns()
    }

    // Update blind spots
    this.detectBlindSpots()

    // Generate strategies
    if (this.config.enableAutoStrategies) {
      this.generateStrategies()
    }
  }

  // ── Error pattern detection ────────────────────────────────────────────

  /** Detect recurring error patterns across evaluation history. */
  detectErrorPatterns(): ErrorPattern[] {
    const categoryFreq: Record<string, { count: number; domains: Set<string>; examples: string[] }> = {}

    for (const evaluation of this.evaluations) {
      const output = evaluation.output.toLowerCase()
      for (const [category, signals] of Object.entries(ERROR_CATEGORY_SIGNALS)) {
        const hits = countKeywordHits(output, signals)
        if (hits >= 2) {
          if (!categoryFreq[category]) {
            categoryFreq[category] = { count: 0, domains: new Set(), examples: [] }
          }
          categoryFreq[category].count++
          categoryFreq[category].domains.add(evaluation.domain)
          if (categoryFreq[category].examples.length < 3) {
            categoryFreq[category].examples.push(evaluation.output.slice(0, 100))
          }
        }
      }
    }

    this.errorPatterns.clear()
    const patterns: ErrorPattern[] = []

    for (const [category, data] of Object.entries(categoryFreq)) {
      if (data.count >= 2) {
        const frequency = data.count / this.evaluations.length
        const severity = frequency > 0.5 ? 'critical' : frequency > 0.3 ? 'high' : frequency > 0.15 ? 'medium' : 'low'
        const pattern: ErrorPattern = {
          id: `ep_${category}`,
          category: category as ErrorCategory,
          description: `Recurring ${category.replace(/_/g, ' ')} detected in ${(frequency * 100).toFixed(0)}% of outputs`,
          frequency,
          domains: [...data.domains],
          examples: data.examples,
          severity,
          suggestedFix: this.getSuggestedFix(category as ErrorCategory),
        }
        this.errorPatterns.set(pattern.id, pattern)
        patterns.push(pattern)
      }
    }

    this.stats.errorPatternsDetected = this.errorPatterns.size
    return patterns
  }

  private getSuggestedFix(category: ErrorCategory): string {
    const fixes: Record<ErrorCategory, string> = {
      hallucination: 'Add confidence scores and cite sources. Flag uncertain claims explicitly.',
      over_generalization: 'Use qualifiers like "often", "typically", "in most cases" instead of absolutes.',
      missing_context: 'Ask clarifying questions before answering. State assumptions explicitly.',
      logical_inconsistency: 'Review entire response for internal contradictions before finalizing.',
      incomplete_answer: 'Use a checklist to ensure all parts of the question are addressed.',
      wrong_assumption: 'State assumptions explicitly and verify them against the input.',
      outdated_knowledge: 'Flag information that may be time-sensitive. Add version/date qualifiers.',
      format_mismatch: 'Detect the expected output format from the input and match it.',
      over_confidence: 'Add uncertainty markers. Use hedging language for non-verified claims.',
      under_confidence: 'Commit to a position when evidence supports it. Reduce unnecessary hedging.',
      repetition: 'Track concepts already covered. Deduplicate before finalizing response.',
      tangential: 'Stay focused on the core question. Move tangential info to footnotes.',
    }
    return fixes[category]
  }

  // ── Blind spot detection ───────────────────────────────────────────────

  /** Detect domains where the AI consistently scores low. */
  detectBlindSpots(): BlindSpot[] {
    const domainScores: Record<string, { total: number; count: number }> = {}

    for (const evaluation of this.evaluations) {
      if (!domainScores[evaluation.domain]) {
        domainScores[evaluation.domain] = { total: 0, count: 0 }
      }
      domainScores[evaluation.domain].total += evaluation.overallScore
      domainScores[evaluation.domain].count++
    }

    this.blindSpots.clear()
    const spots: BlindSpot[] = []

    for (const [domain, data] of Object.entries(domainScores)) {
      const avg = data.total / data.count
      if (avg < this.config.weaknessThreshold && data.count >= 3) {
        const spot: BlindSpot = {
          domain,
          description: `Consistently low performance in ${domain} (avg: ${(avg * 100).toFixed(0)}%)`,
          confidence: clamp(1 - avg, 0, 1),
          evidenceCount: data.count,
          detectedAt: Date.now(),
        }
        this.blindSpots.set(domain, spot)
        spots.push(spot)
      }
    }

    this.stats.blindSpotsDetected = this.blindSpots.size
    return spots
  }

  // ── Improvement strategies ─────────────────────────────────────────────

  /** Generate improvement strategies based on evaluation history. */
  generateStrategies(): ImprovementStrategy[] {
    if (this.evaluations.length < this.config.minEvaluationsForPatterns) return []

    const dimensionAvgs: Record<QualityDimension, { total: number; count: number }> = {} as Record<QualityDimension, { total: number; count: number }>
    const allDimensions: QualityDimension[] = ['coherence', 'relevance', 'completeness', 'accuracy', 'clarity', 'depth', 'actionability']
    for (const dim of allDimensions) {
      dimensionAvgs[dim] = { total: 0, count: 0 }
    }

    for (const evaluation of this.evaluations) {
      for (const score of evaluation.dimensionScores) {
        dimensionAvgs[score.dimension].total += score.score
        dimensionAvgs[score.dimension].count++
      }
    }

    this.strategies.length = 0
    const newStrategies: ImprovementStrategy[] = []

    for (const dim of allDimensions) {
      const data = dimensionAvgs[dim]
      if (data.count === 0) continue
      const avg = data.total / data.count
      if (avg < 0.6) {
        const priority = avg < 0.3 ? 'critical' : avg < 0.4 ? 'high' : avg < 0.5 ? 'medium' : 'low'
        const strategy: ImprovementStrategy = {
          id: `strat_${dim}`,
          targetDimension: dim,
          description: `Improve ${dim}: current average is ${(avg * 100).toFixed(0)}%`,
          priority,
          expectedImpact: clamp(0.6 - avg, 0.1, 0.5),
          actionItems: this.getStrategyActions(dim),
        }
        newStrategies.push(strategy)
        this.strategies.push(strategy)
      }
    }

    this.stats.strategiesGenerated = this.strategies.length
    return newStrategies
  }

  private getStrategyActions(dimension: QualityDimension): string[] {
    const actions: Record<QualityDimension, string[]> = {
      coherence: ['Review logical transitions', 'Ensure consistent terminology', 'Add connecting phrases between sections'],
      relevance: ['Reread the question before answering', 'Remove off-topic content', 'Lead with the direct answer'],
      completeness: ['Use a mental checklist', 'Address edge cases', 'Include examples for each concept'],
      accuracy: ['Cross-check facts', 'Add confidence markers', 'Prefer verified over speculative information'],
      clarity: ['Simplify sentence structure', 'Define jargon on first use', 'Use formatting (headers, lists)'],
      depth: ['Add technical details', 'Discuss trade-offs', 'Include underlying reasons, not just surface answers'],
      actionability: ['Provide code examples', 'Add step-by-step instructions', 'Include expected outcomes for each step'],
    }
    return actions[dimension] || ['Review and improve this dimension']
  }

  // ── Performance trends ─────────────────────────────────────────────────

  /** Analyze performance trends across quality dimensions. */
  getPerformanceTrends(): PerformanceTrend[] {
    if (this.evaluations.length < 4) return []

    const windowSize = Math.min(this.config.trendWindowSize, Math.floor(this.evaluations.length / 2))
    const recent = this.evaluations.slice(-windowSize)
    const historical = this.evaluations.slice(0, -windowSize)

    const allDimensions: QualityDimension[] = ['coherence', 'relevance', 'completeness', 'accuracy', 'clarity', 'depth', 'actionability']
    const trends: PerformanceTrend[] = []

    for (const dim of allDimensions) {
      const recentScores = recent.flatMap(e => e.dimensionScores.filter(s => s.dimension === dim).map(s => s.score))
      const historicalScores = historical.flatMap(e => e.dimensionScores.filter(s => s.dimension === dim).map(s => s.score))

      if (recentScores.length === 0) continue

      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      const historicalAvg = historicalScores.length > 0
        ? historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length
        : recentAvg

      const slope = recentAvg - historicalAvg
      const direction: PerformanceTrend['direction'] = slope > 0.05 ? 'improving' : slope < -0.05 ? 'declining' : 'stable'

      trends.push({
        dimension: dim,
        direction,
        slope,
        recentAvg,
        historicalAvg,
        windowSize,
      })
    }

    return trends
  }

  // ── Public accessors ───────────────────────────────────────────────────

  /** Get all detected error patterns. */
  getErrorPatterns(): readonly ErrorPattern[] {
    return [...this.errorPatterns.values()]
  }

  /** Get all detected blind spots. */
  getBlindSpots(): readonly BlindSpot[] {
    return [...this.blindSpots.values()]
  }

  /** Get current improvement strategies. */
  getStrategies(): readonly ImprovementStrategy[] {
    return [...this.strategies]
  }

  /** Get evaluation history. */
  getEvaluationHistory(): readonly OutputEvaluation[] {
    return [...this.evaluations]
  }

  /** Get runtime statistics. */
  getStats(): Readonly<SelfReflectionEngineStats> {
    return {
      totalEvaluations: this.stats.totalEvaluations,
      avgOverallScore: this.stats.totalEvaluations > 0
        ? this.stats.totalScore / this.stats.totalEvaluations
        : 0,
      errorPatternsDetected: this.stats.errorPatternsDetected,
      blindSpotsDetected: this.stats.blindSpotsDetected,
      strategiesGenerated: this.stats.strategiesGenerated,
      improvementRate: this.computeImprovementRate(),
    }
  }

  private computeImprovementRate(): number {
    if (this.evaluations.length < 4) return 0
    const half = Math.floor(this.evaluations.length / 2)
    const first = this.evaluations.slice(0, half)
    const second = this.evaluations.slice(half)
    const avgFirst = first.reduce((s, e) => s + e.overallScore, 0) / first.length
    const avgSecond = second.reduce((s, e) => s + e.overallScore, 0) / second.length
    return avgSecond - avgFirst
  }

  /** Provide feedback on a past evaluation (was the output actually correct?). */
  provideFeedback(evaluationId: string, wasCorrect: boolean, notes?: string): boolean {
    const evaluation = this.evaluations.find(e => e.id === evaluationId)
    if (!evaluation) return false

    // If we were confident but wrong, record over_confidence pattern
    if (!wasCorrect && evaluation.overallScore > 0.7) {
      const lower = (notes || '').toLowerCase()
      const category: ErrorCategory = lower.includes('wrong') ? 'wrong_assumption' :
        lower.includes('outdated') ? 'outdated_knowledge' :
        lower.includes('missing') ? 'incomplete_answer' : 'over_confidence'

      const existing = this.errorPatterns.get(`ep_${category}`)
      if (existing) {
        const updated: ErrorPattern = {
          ...existing,
          frequency: existing.frequency + 0.01,
          examples: [...existing.examples, evaluation.output.slice(0, 100)].slice(-5),
        }
        this.errorPatterns.set(updated.id, updated)
      }
    }

    return true
  }

  // ── Serialization ──────────────────────────────────────────────────────

  /** Serialize engine state for persistence. */
  serialize(): string {
    return JSON.stringify({
      evaluations: this.evaluations.slice(-100), // Keep last 100 for persistence
      errorPatterns: [...this.errorPatterns.values()],
      blindSpots: [...this.blindSpots.values()],
      strategies: this.strategies,
      stats: this.stats,
    })
  }

  /** Restore engine state from serialized data. */
  static deserialize(json: string, config?: Partial<SelfReflectionEngineConfig>): SelfReflectionEngine {
    const engine = new SelfReflectionEngine(config)
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.evaluations)) {
        engine.evaluations.push(...data.evaluations)
      }
      if (Array.isArray(data.errorPatterns)) {
        for (const p of data.errorPatterns) {
          engine.errorPatterns.set(p.id, p)
        }
      }
      if (Array.isArray(data.blindSpots)) {
        for (const b of data.blindSpots) {
          engine.blindSpots.set(b.domain, b)
        }
      }
      if (Array.isArray(data.strategies)) {
        engine.strategies.push(...data.strategies)
      }
      if (data.stats) {
        Object.assign(engine.stats, data.stats)
      }
    } catch {
      // Return fresh engine on parse failure
    }
    return engine
  }
}
