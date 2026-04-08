/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  AnalyticalReasoner — Multi-framework analytical reasoning engine          ║
 * ║                                                                            ║
 * ║  Applies structured analytical frameworks to problems: SWOT analysis,      ║
 * ║  5-Why root cause, Fishbone diagrams, PEST analysis, Porter's Five        ║
 * ║  Forces, decision matrices, and cost-benefit analysis.                     ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)        ║
 * ║    • 5-Why root cause analysis                                            ║
 * ║    • Fishbone/Ishikawa diagrams                                           ║
 * ║    • PEST/PESTEL analysis (Political, Economic, Social, Tech)             ║
 * ║    • Porter's Five Forces competitive analysis                            ║
 * ║    • Decision matrix with weighted criteria                               ║
 * ║    • Cost-benefit analysis with ROI estimation                            ║
 * ║    • Framework recommendation based on problem type                       ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type FrameworkType = 'swot' | 'five_why' | 'fishbone' | 'pest' | 'porter' | 'decision_matrix' | 'cost_benefit'

export interface SWOTAnalysis {
  readonly framework: 'swot'
  readonly subject: string
  readonly strengths: readonly string[]
  readonly weaknesses: readonly string[]
  readonly opportunities: readonly string[]
  readonly threats: readonly string[]
  readonly recommendations: readonly string[]
  readonly overallAssessment: string
}

export interface FiveWhyAnalysis {
  readonly framework: 'five_why'
  readonly problem: string
  readonly whyChain: readonly WhyStep[]
  readonly rootCause: string
  readonly suggestedFixes: readonly string[]
}

export interface WhyStep {
  readonly level: number
  readonly question: string
  readonly answer: string
}

export interface FishboneDiagram {
  readonly framework: 'fishbone'
  readonly problem: string
  readonly categories: readonly FishboneCategory[]
  readonly primaryCause: string
}

export interface FishboneCategory {
  readonly name: string
  readonly causes: readonly string[]
}

export interface PESTAnalysis {
  readonly framework: 'pest'
  readonly subject: string
  readonly political: readonly PESTFactor[]
  readonly economic: readonly PESTFactor[]
  readonly social: readonly PESTFactor[]
  readonly technological: readonly PESTFactor[]
  readonly summary: string
}

export interface PESTFactor {
  readonly description: string
  readonly impact: 'positive' | 'negative' | 'neutral'
  readonly significance: number // 0-1
}

export interface PorterAnalysis {
  readonly framework: 'porter'
  readonly industry: string
  readonly competitiveRivalry: ForceAssessment
  readonly supplierPower: ForceAssessment
  readonly buyerPower: ForceAssessment
  readonly threatOfSubstitutes: ForceAssessment
  readonly threatOfNewEntrants: ForceAssessment
  readonly overallAttractiveness: number // 0-1
}

export interface ForceAssessment {
  readonly level: 'low' | 'moderate' | 'high'
  readonly score: number // 0-1
  readonly factors: readonly string[]
}

export interface DecisionMatrix {
  readonly framework: 'decision_matrix'
  readonly question: string
  readonly criteria: readonly WeightedCriterion[]
  readonly options: readonly MatrixOption[]
  readonly winner: string
  readonly winnerScore: number
}

export interface WeightedCriterion {
  readonly name: string
  readonly weight: number // 0-1
}

export interface MatrixOption {
  readonly name: string
  readonly scores: ReadonlyMap<string, number> // criterion → score
  readonly totalScore: number
}

export interface CostBenefitAnalysis {
  readonly framework: 'cost_benefit'
  readonly proposal: string
  readonly costs: readonly CBAItem[]
  readonly benefits: readonly CBAItem[]
  readonly totalCost: number
  readonly totalBenefit: number
  readonly netBenefit: number
  readonly roi: number
  readonly recommendation: string
}

export interface CBAItem {
  readonly description: string
  readonly value: number
  readonly confidence: number // 0-1
  readonly timeframe: string
}

export type AnalysisResult = SWOTAnalysis | FiveWhyAnalysis | FishboneDiagram | PESTAnalysis | PorterAnalysis | DecisionMatrix | CostBenefitAnalysis

export interface AnalyticalReasonerConfig {
  readonly maxAnalyses: number
  readonly enableRecommendations: boolean
  readonly defaultCriteriaWeights: boolean
}

export interface AnalyticalReasonerStats {
  readonly totalAnalyses: number
  readonly analysesByFramework: Record<FrameworkType, number>
  readonly feedbackCount: number
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_ANALYTICAL_REASONER_CONFIG: AnalyticalReasonerConfig = {
  maxAnalyses: 500,
  enableRecommendations: true,
  defaultCriteriaWeights: true,
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class AnalyticalReasoner {
  private readonly config: AnalyticalReasonerConfig
  private readonly analyses: AnalysisResult[] = []
  private stats = {
    totalAnalyses: 0,
    byFramework: { swot: 0, five_why: 0, fishbone: 0, pest: 0, porter: 0, decision_matrix: 0, cost_benefit: 0 } as Record<FrameworkType, number>,
    feedbackCount: 0,
  }

  constructor(config: Partial<AnalyticalReasonerConfig> = {}) {
    this.config = { ...DEFAULT_ANALYTICAL_REASONER_CONFIG, ...config }
  }

  // ── SWOT ─────────────────────────────────────────────────────────────

  swot(subject: string, input: { strengths?: string[]; weaknesses?: string[]; opportunities?: string[]; threats?: string[] } = {}): SWOTAnalysis {
    const s = input.strengths ?? []
    const w = input.weaknesses ?? []
    const o = input.opportunities ?? []
    const t = input.threats ?? []

    const recommendations: string[] = []
    if (this.config.enableRecommendations) {
      if (s.length > 0 && o.length > 0) recommendations.push(`Leverage strength "${s[0]}" to capitalize on opportunity "${o[0]}"`)
      if (w.length > 0 && t.length > 0) recommendations.push(`Address weakness "${w[0]}" to mitigate threat "${t[0]}"`)
      if (s.length > 0 && t.length > 0) recommendations.push(`Use strength "${s[0]}" to defend against threat "${t[0]}"`)
      if (w.length > 0 && o.length > 0) recommendations.push(`Improve weakness "${w[0]}" to capture opportunity "${o[0]}"`)
    }

    const overallAssessment = s.length + o.length > w.length + t.length
      ? `${subject} has a favorable position with more strengths/opportunities than weaknesses/threats`
      : s.length + o.length < w.length + t.length
        ? `${subject} faces challenges with more weaknesses/threats than strengths/opportunities`
        : `${subject} has a balanced profile with equal positives and negatives`

    const result: SWOTAnalysis = { framework: 'swot', subject, strengths: s, weaknesses: w, opportunities: o, threats: t, recommendations, overallAssessment }
    this.recordAnalysis(result)
    return result
  }

  // ── 5-Why ────────────────────────────────────────────────────────────

  fiveWhy(problem: string, answers: string[]): FiveWhyAnalysis {
    const chain: WhyStep[] = []
    let currentProblem = problem

    for (let i = 0; i < Math.min(answers.length, 5); i++) {
      chain.push({
        level: i + 1,
        question: `Why does "${currentProblem}" happen?`,
        answer: answers[i],
      })
      currentProblem = answers[i]
    }

    const rootCause = answers.length > 0 ? answers[answers.length - 1] : problem
    const suggestedFixes = [`Address root cause: "${rootCause}"`, `Implement preventive measures for: "${rootCause}"`, `Monitor for recurrence of: "${rootCause}"`]

    const result: FiveWhyAnalysis = { framework: 'five_why', problem, whyChain: chain, rootCause, suggestedFixes }
    this.recordAnalysis(result)
    return result
  }

  // ── Fishbone ─────────────────────────────────────────────────────────

  fishbone(problem: string, categories: Array<{ name: string; causes: string[] }>): FishboneDiagram {
    const cats: FishboneCategory[] = categories.map(c => ({ name: c.name, causes: [...c.causes] }))

    // Find primary cause (category with most causes)
    const sorted = [...cats].sort((a, b) => b.causes.length - a.causes.length)
    const primaryCause = sorted.length > 0 && sorted[0].causes.length > 0
      ? `${sorted[0].name}: ${sorted[0].causes[0]}`
      : 'Unknown'

    const result: FishboneDiagram = { framework: 'fishbone', problem, categories: cats, primaryCause }
    this.recordAnalysis(result)
    return result
  }

  // ── PEST ─────────────────────────────────────────────────────────────

  pest(subject: string, factors: {
    political?: Array<{ description: string; impact: 'positive' | 'negative' | 'neutral'; significance: number }>
    economic?: Array<{ description: string; impact: 'positive' | 'negative' | 'neutral'; significance: number }>
    social?: Array<{ description: string; impact: 'positive' | 'negative' | 'neutral'; significance: number }>
    technological?: Array<{ description: string; impact: 'positive' | 'negative' | 'neutral'; significance: number }>
  } = {}): PESTAnalysis {
    const p = (factors.political ?? []) as PESTFactor[]
    const e = (factors.economic ?? []) as PESTFactor[]
    const s = (factors.social ?? []) as PESTFactor[]
    const t = (factors.technological ?? []) as PESTFactor[]

    const allFactors = [...p, ...e, ...s, ...t]
    const positives = allFactors.filter(f => f.impact === 'positive').length
    const negatives = allFactors.filter(f => f.impact === 'negative').length
    const summary = positives > negatives
      ? `The macro environment for ${subject} is generally favorable (${positives} positive vs ${negatives} negative factors)`
      : positives < negatives
        ? `The macro environment for ${subject} presents challenges (${negatives} negative vs ${positives} positive factors)`
        : `The macro environment for ${subject} is balanced (${positives} positive, ${negatives} negative factors)`

    const result: PESTAnalysis = { framework: 'pest', subject, political: p, economic: e, social: s, technological: t, summary }
    this.recordAnalysis(result)
    return result
  }

  // ── Porter's Five Forces ─────────────────────────────────────────────

  porter(industry: string, forces: {
    rivalry?: { level: 'low' | 'moderate' | 'high'; factors?: string[] }
    supplierPower?: { level: 'low' | 'moderate' | 'high'; factors?: string[] }
    buyerPower?: { level: 'low' | 'moderate' | 'high'; factors?: string[] }
    substitutes?: { level: 'low' | 'moderate' | 'high'; factors?: string[] }
    newEntrants?: { level: 'low' | 'moderate' | 'high'; factors?: string[] }
  } = {}): PorterAnalysis {
    const toScore = (level: 'low' | 'moderate' | 'high'): number => level === 'high' ? 0.8 : level === 'moderate' ? 0.5 : 0.2
    const makeForce = (input?: { level: 'low' | 'moderate' | 'high'; factors?: string[] }): ForceAssessment => ({
      level: input?.level ?? 'moderate',
      score: toScore(input?.level ?? 'moderate'),
      factors: input?.factors ?? [],
    })

    const rivalry = makeForce(forces.rivalry)
    const supplierPower = makeForce(forces.supplierPower)
    const buyerPower = makeForce(forces.buyerPower)
    const subs = makeForce(forces.substitutes)
    const newEntrants = makeForce(forces.newEntrants)

    // Lower total force score = more attractive industry
    const avgForce = (rivalry.score + supplierPower.score + buyerPower.score + subs.score + newEntrants.score) / 5
    const overallAttractiveness = 1 - avgForce

    const result: PorterAnalysis = {
      framework: 'porter', industry,
      competitiveRivalry: rivalry, supplierPower, buyerPower,
      threatOfSubstitutes: subs, threatOfNewEntrants: newEntrants,
      overallAttractiveness,
    }
    this.recordAnalysis(result)
    return result
  }

  // ── Decision Matrix ──────────────────────────────────────────────────

  decisionMatrix(question: string, criteria: Array<{ name: string; weight: number }>, options: Array<{ name: string; scores: Record<string, number> }>): DecisionMatrix {
    const wCriteria: WeightedCriterion[] = criteria.map(c => ({ name: c.name, weight: Math.max(0, Math.min(1, c.weight)) }))

    const mOptions: MatrixOption[] = options.map(opt => {
      const scoreMap = new Map(Object.entries(opt.scores))
      let total = 0
      for (const c of wCriteria) {
        const s = scoreMap.get(c.name) ?? 0
        total += s * c.weight
      }
      return { name: opt.name, scores: scoreMap, totalScore: total }
    })

    const sorted = [...mOptions].sort((a, b) => b.totalScore - a.totalScore)
    const winner = sorted[0]?.name ?? 'None'
    const winnerScore = sorted[0]?.totalScore ?? 0

    const result: DecisionMatrix = { framework: 'decision_matrix', question, criteria: wCriteria, options: mOptions, winner, winnerScore }
    this.recordAnalysis(result)
    return result
  }

  // ── Cost-Benefit ─────────────────────────────────────────────────────

  costBenefit(proposal: string, costs: Array<{ description: string; value: number; confidence?: number; timeframe?: string }>, benefits: Array<{ description: string; value: number; confidence?: number; timeframe?: string }>): CostBenefitAnalysis {
    const cItems: CBAItem[] = costs.map(c => ({ description: c.description, value: c.value, confidence: c.confidence ?? 0.8, timeframe: c.timeframe ?? '1 year' }))
    const bItems: CBAItem[] = benefits.map(b => ({ description: b.description, value: b.value, confidence: b.confidence ?? 0.8, timeframe: b.timeframe ?? '1 year' }))

    const totalCost = cItems.reduce((s, c) => s + c.value * c.confidence, 0)
    const totalBenefit = bItems.reduce((s, b) => s + b.value * b.confidence, 0)
    const netBenefit = totalBenefit - totalCost
    const roi = totalCost > 0 ? (netBenefit / totalCost) * 100 : 0

    const recommendation = roi > 20
      ? `Strong recommendation to proceed: ROI of ${roi.toFixed(1)}% indicates excellent value`
      : roi > 0
        ? `Recommend proceeding with caution: ROI of ${roi.toFixed(1)}% is positive but modest`
        : `Not recommended: Negative ROI of ${roi.toFixed(1)}% suggests costs outweigh benefits`

    const result: CostBenefitAnalysis = { framework: 'cost_benefit', proposal, costs: cItems, benefits: bItems, totalCost, totalBenefit, netBenefit, roi, recommendation }
    this.recordAnalysis(result)
    return result
  }

  // ── Framework recommendation ─────────────────────────────────────────

  recommendFramework(problemDescription: string): FrameworkType {
    const lower = problemDescription.toLowerCase()
    if (/\b(strength|weakness|opportunit|threat|swot)\b/.test(lower)) return 'swot'
    if (/\b(root\s*cause|why\s+does|why\s+did|keep\s+happening)\b/.test(lower)) return 'five_why'
    if (/\b(causes?|categor|ishikawa|fishbone|diagram)\b/.test(lower)) return 'fishbone'
    if (/\b(political|economic|social|technolog|macro|pest)\b/.test(lower)) return 'pest'
    if (/\b(competit|industry|rival|supplier|buyer|substit|porter)\b/.test(lower)) return 'porter'
    if (/\b(compar|option|criteria|weight|rank|choose|select|decision)\b/.test(lower)) return 'decision_matrix'
    if (/\b(cost|benefit|roi|invest|worth\s+it|budget|expense)\b/.test(lower)) return 'cost_benefit'
    return 'swot' // default
  }

  // ── Internal ─────────────────────────────────────────────────────────

  private recordAnalysis(result: AnalysisResult): void {
    this.analyses.push(result)
    this.stats.totalAnalyses++
    this.stats.byFramework[result.framework]++
    if (this.analyses.length > this.config.maxAnalyses) this.analyses.shift()
  }

  getStats(): Readonly<AnalyticalReasonerStats> {
    return {
      totalAnalyses: this.stats.totalAnalyses,
      analysesByFramework: { ...this.stats.byFramework },
      feedbackCount: this.stats.feedbackCount,
    }
  }

  provideFeedback(): void {
    this.stats.feedbackCount++
  }

  serialize(): string {
    return JSON.stringify({ analyses: this.analyses, stats: this.stats })
  }

  static deserialize(json: string, config?: Partial<AnalyticalReasonerConfig>): AnalyticalReasoner {
    const engine = new AnalyticalReasoner(config)
    const data = JSON.parse(json)
    if (data.analyses) engine.analyses.push(...data.analyses)
    if (data.stats) Object.assign(engine.stats, data.stats)
    return engine
  }
}
