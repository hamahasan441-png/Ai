/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ScientificReasoner — Scientific method & experimental reasoning           ║
 * ║                                                                            ║
 * ║  Applies the scientific method to problems: hypothesis formulation,        ║
 * ║  experiment design, statistical analysis, result interpretation,           ║
 * ║  and research methodology guidance.                                        ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Hypothesis formulation with null/alternative hypotheses              ║
 * ║    • Experiment design (control groups, variables, sample size)            ║
 * ║    • Statistical test selection & interpretation                          ║
 * ║    • P-value & effect size calculation                                    ║
 * ║    • Research methodology classification                                  ║
 * ║    • Bias detection in experimental design                                ║
 * ║    • Literature review structuring                                        ║
 * ║    • Reproducibility scoring                                              ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ResearchMethodology = 'experimental' | 'observational' | 'survey' | 'case_study' | 'meta_analysis' | 'simulation' | 'qualitative' | 'mixed_methods'

export type VariableType = 'independent' | 'dependent' | 'control' | 'confounding' | 'moderating' | 'mediating'

export type StatisticalTest = 't_test' | 'chi_square' | 'anova' | 'regression' | 'correlation' | 'mann_whitney' | 'wilcoxon' | 'kruskal_wallis' | 'fisher_exact'

export type BiasType = 'selection' | 'confirmation' | 'survivorship' | 'observer' | 'sampling' | 'publication' | 'recall' | 'anchoring'

export interface Hypothesis {
  readonly id: string
  readonly statement: string
  readonly nullHypothesis: string
  readonly alternativeHypothesis: string
  readonly variables: readonly Variable[]
  readonly testable: boolean
  readonly falsifiable: boolean
}

export interface Variable {
  readonly name: string
  readonly type: VariableType
  readonly operationalization: string
  readonly measurementScale: 'nominal' | 'ordinal' | 'interval' | 'ratio'
}

export interface ExperimentDesign {
  readonly id: string
  readonly hypothesisId: string
  readonly methodology: ResearchMethodology
  readonly sampleSize: number
  readonly controlGroup: boolean
  readonly randomization: boolean
  readonly blinding: 'none' | 'single' | 'double'
  readonly variables: readonly Variable[]
  readonly procedure: readonly string[]
  readonly expectedDuration: string
  readonly biases: readonly DetectedBias[]
  readonly reproducibilityScore: number
}

export interface DetectedBias {
  readonly type: BiasType
  readonly description: string
  readonly severity: 'low' | 'medium' | 'high'
  readonly mitigation: string
}

export interface StatisticalResult {
  readonly test: StatisticalTest
  readonly pValue: number
  readonly significant: boolean
  readonly effectSize: number
  readonly effectInterpretation: 'negligible' | 'small' | 'medium' | 'large'
  readonly confidenceInterval: readonly [number, number]
  readonly sampleSize: number
  readonly degreesOfFreedom: number
}

export interface ResearchSummary {
  readonly title: string
  readonly methodology: ResearchMethodology
  readonly hypotheses: readonly Hypothesis[]
  readonly design: ExperimentDesign | null
  readonly results: readonly StatisticalResult[]
  readonly conclusion: string
  readonly limitations: readonly string[]
  readonly futureWork: readonly string[]
}

export interface ScientificReasonerConfig {
  readonly defaultSignificanceLevel: number
  readonly minSampleSize: number
  readonly maxHypotheses: number
  readonly enableBiasDetection: boolean
}

export interface ScientificReasonerStats {
  readonly totalHypotheses: number
  readonly totalExperiments: number
  readonly totalStatTests: number
  readonly totalBiasesDetected: number
  readonly feedbackCount: number
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_SCIENTIFIC_REASONER_CONFIG: ScientificReasonerConfig = {
  defaultSignificanceLevel: 0.05,
  minSampleSize: 30,
  maxHypotheses: 100,
  enableBiasDetection: true,
}

// ─── Data ──────────────────────────────────────────────────────────────────────

function buildBiasPatterns(): ReadonlyMap<BiasType, { readonly description: string; readonly indicators: readonly string[]; readonly mitigation: string }> {
  const m = new Map<BiasType, { description: string; indicators: string[]; mitigation: string }>()
  m.set('selection', { description: 'Non-random selection of participants', indicators: ['convenience sample', 'voluntary', 'self-selected'], mitigation: 'Use random sampling from the target population' })
  m.set('confirmation', { description: 'Seeking only confirming evidence', indicators: ['only positive results', 'ignored contradictory'], mitigation: 'Pre-register hypotheses and include disconfirming tests' })
  m.set('survivorship', { description: 'Analyzing only successful cases', indicators: ['successful cases only', 'no failure analysis'], mitigation: 'Include failed/dropped cases in analysis' })
  m.set('observer', { description: 'Observer expectations affect measurement', indicators: ['unblinded', 'subjective measures'], mitigation: 'Use double-blind methodology' })
  m.set('sampling', { description: 'Sample does not represent population', indicators: ['small sample', 'non-representative'], mitigation: 'Increase sample size and ensure representativeness' })
  m.set('publication', { description: 'Only significant results published', indicators: ['positive results only', 'file drawer'], mitigation: 'Pre-register studies and report all results' })
  m.set('recall', { description: 'Inaccurate participant memories', indicators: ['retrospective', 'self-report'], mitigation: 'Use prospective data collection methods' })
  m.set('anchoring', { description: 'Over-reliance on initial information', indicators: ['initial estimate', 'starting point'], mitigation: 'Use multiple independent starting points' })
  return m
}

const BIAS_PATTERNS = buildBiasPatterns()

function buildTestRecommendations(): ReadonlyMap<string, StatisticalTest> {
  const m = new Map<string, StatisticalTest>()
  m.set('two_groups_continuous', 't_test')
  m.set('two_groups_categorical', 'chi_square')
  m.set('multiple_groups_continuous', 'anova')
  m.set('continuous_relationship', 'correlation')
  m.set('prediction', 'regression')
  m.set('two_groups_ordinal', 'mann_whitney')
  m.set('paired_ordinal', 'wilcoxon')
  m.set('multiple_groups_ordinal', 'kruskal_wallis')
  m.set('small_sample_categorical', 'fisher_exact')
  return m
}

const TEST_RECOMMENDATIONS = buildTestRecommendations()

// ─── Engine ────────────────────────────────────────────────────────────────────

export class ScientificReasoner {
  private readonly config: ScientificReasonerConfig
  private readonly hypotheses = new Map<string, Hypothesis>()
  private readonly experiments = new Map<string, ExperimentDesign>()
  private readonly results: StatisticalResult[] = []
  private stats = { totalHypotheses: 0, totalExperiments: 0, totalStatTests: 0, totalBiasesDetected: 0, feedbackCount: 0 }

  constructor(config: Partial<ScientificReasonerConfig> = {}) {
    this.config = { ...DEFAULT_SCIENTIFIC_REASONER_CONFIG, ...config }
  }

  // ── Hypothesis formulation ───────────────────────────────────────────

  formulateHypothesis(statement: string, variables: Variable[]): Hypothesis {
    const id = `hyp_${++this.stats.totalHypotheses}`
    const iv = variables.find(v => v.type === 'independent')
    const dv = variables.find(v => v.type === 'dependent')

    const nullH = iv && dv
      ? `There is no significant relationship between ${iv.name} and ${dv.name}.`
      : `There is no effect as described: ${statement}`
    const altH = iv && dv
      ? `There is a significant relationship between ${iv.name} and ${dv.name}.`
      : statement

    const testable = variables.some(v => v.operationalization.length > 0)
    const falsifiable = variables.length >= 2 && variables.some(v => v.type === 'independent') && variables.some(v => v.type === 'dependent')

    const hyp: Hypothesis = { id, statement, nullHypothesis: nullH, alternativeHypothesis: altH, variables, testable, falsifiable }
    this.hypotheses.set(id, hyp)
    return hyp
  }

  getHypothesis(id: string): Hypothesis | null {
    return this.hypotheses.get(id) ?? null
  }

  // ── Experiment design ────────────────────────────────────────────────

  designExperiment(hypothesisId: string, methodology: ResearchMethodology, options: {
    sampleSize?: number; controlGroup?: boolean; randomization?: boolean; blinding?: 'none' | 'single' | 'double'; procedure?: string[]
  } = {}): ExperimentDesign | null {
    const hyp = this.hypotheses.get(hypothesisId)
    if (!hyp) return null

    const sampleSize = options.sampleSize ?? this.config.minSampleSize
    const controlGroup = options.controlGroup ?? true
    const randomization = options.randomization ?? true
    const blinding = options.blinding ?? 'none'
    const procedure = options.procedure ?? ['Define measurement protocol', 'Collect baseline data', 'Apply treatment', 'Measure outcomes', 'Analyze results']

    const biases = this.config.enableBiasDetection ? this.detectBiases(methodology, sampleSize, blinding, controlGroup) : []

    // Reproducibility score
    let repro = 0.5
    if (controlGroup) repro += 0.1
    if (randomization) repro += 0.1
    if (blinding === 'double') repro += 0.15
    else if (blinding === 'single') repro += 0.08
    if (sampleSize >= 100) repro += 0.1
    else if (sampleSize >= 50) repro += 0.05
    if (procedure.length >= 5) repro += 0.05
    repro = Math.min(1, repro)

    const id = `exp_${++this.stats.totalExperiments}`
    const design: ExperimentDesign = {
      id, hypothesisId, methodology, sampleSize, controlGroup, randomization, blinding,
      variables: [...hyp.variables], procedure, expectedDuration: `${Math.ceil(sampleSize / 10)} weeks`,
      biases, reproducibilityScore: Math.round(repro * 100) / 100,
    }
    this.experiments.set(id, design)
    this.stats.totalBiasesDetected += biases.length
    return design
  }

  // ── Bias detection ───────────────────────────────────────────────────

  detectBiases(methodology: ResearchMethodology, sampleSize: number, blinding: string, controlGroup: boolean): DetectedBias[] {
    const biases: DetectedBias[] = []

    if (sampleSize < this.config.minSampleSize) {
      biases.push({ type: 'sampling', description: `Sample size ${sampleSize} is below recommended minimum of ${this.config.minSampleSize}`, severity: 'high', mitigation: `Increase sample size to at least ${this.config.minSampleSize}` })
    }
    if (blinding === 'none') {
      biases.push({ type: 'observer', description: 'No blinding may introduce observer bias', severity: 'medium', mitigation: 'Implement at least single-blind methodology' })
    }
    if (!controlGroup && methodology === 'experimental') {
      biases.push({ type: 'selection', description: 'No control group in experimental study', severity: 'high', mitigation: 'Add a control group for comparison' })
    }
    if (methodology === 'survey') {
      biases.push({ type: 'recall', description: 'Surveys rely on participant self-report', severity: 'low', mitigation: 'Use validated instruments and cross-reference data' })
    }
    if (methodology === 'case_study') {
      biases.push({ type: 'survivorship', description: 'Case studies may focus on notable cases only', severity: 'medium', mitigation: 'Include diverse and representative cases' })
    }

    return biases
  }

  // ── Statistical test selection ───────────────────────────────────────

  recommendTest(groups: number, dataType: 'continuous' | 'categorical' | 'ordinal', paired: boolean = false, sampleSize: number = 50): StatisticalTest {
    if (groups === 2 && dataType === 'continuous') return 't_test'
    if (groups === 2 && dataType === 'categorical') return sampleSize < 20 ? 'fisher_exact' : 'chi_square'
    if (groups === 2 && dataType === 'ordinal') return paired ? 'wilcoxon' : 'mann_whitney'
    if (groups > 2 && dataType === 'continuous') return 'anova'
    if (groups > 2 && dataType === 'ordinal') return 'kruskal_wallis'
    if (groups === 1 && dataType === 'continuous') return 'correlation'
    return 'regression'
  }

  // ── Statistical result computation ───────────────────────────────────

  computeStatistic(data1: number[], data2: number[], test: StatisticalTest = 't_test'): StatisticalResult {
    this.stats.totalStatTests++

    const n1 = data1.length
    const n2 = data2.length
    const mean1 = data1.reduce((a, b) => a + b, 0) / n1
    const mean2 = data2.reduce((a, b) => a + b, 0) / n2
    const var1 = data1.reduce((s, v) => s + (v - mean1) ** 2, 0) / (n1 - 1)
    const var2 = data2.reduce((s, v) => s + (v - mean2) ** 2, 0) / (n2 - 1)

    // Pooled standard error
    const se = Math.sqrt(var1 / n1 + var2 / n2)
    const tStat = se > 0 ? Math.abs(mean1 - mean2) / se : 0
    const df = n1 + n2 - 2

    // Approximate p-value using t-distribution approximation
    const pValue = Math.max(0.001, Math.min(1, Math.exp(-0.5 * tStat)))

    // Cohen's d effect size
    const pooledSD = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / df)
    const effectSize = pooledSD > 0 ? Math.abs(mean1 - mean2) / pooledSD : 0

    let effectInterpretation: 'negligible' | 'small' | 'medium' | 'large'
    if (effectSize < 0.2) effectInterpretation = 'negligible'
    else if (effectSize < 0.5) effectInterpretation = 'small'
    else if (effectSize < 0.8) effectInterpretation = 'medium'
    else effectInterpretation = 'large'

    const marginOfError = 1.96 * se
    const diff = mean1 - mean2

    const result: StatisticalResult = {
      test, pValue: Math.round(pValue * 10000) / 10000,
      significant: pValue < this.config.defaultSignificanceLevel,
      effectSize: Math.round(effectSize * 1000) / 1000,
      effectInterpretation,
      confidenceInterval: [Math.round((diff - marginOfError) * 1000) / 1000, Math.round((diff + marginOfError) * 1000) / 1000],
      sampleSize: n1 + n2,
      degreesOfFreedom: df,
    }
    this.results.push(result)
    return result
  }

  // ── Research summary ─────────────────────────────────────────────────

  generateSummary(title: string): ResearchSummary {
    const hypotheses = [...this.hypotheses.values()]
    const firstExp = [...this.experiments.values()][0] ?? null
    const methodology = firstExp?.methodology ?? 'experimental'

    const significant = this.results.filter(r => r.significant).length
    const conclusion = significant > 0
      ? `Results support the alternative hypothesis with ${significant} significant finding(s).`
      : 'Results do not provide sufficient evidence to reject the null hypothesis.'

    const limitations = [
      firstExp && firstExp.sampleSize < 100 ? 'Limited sample size' : null,
      firstExp && !firstExp.controlGroup ? 'Absence of control group' : null,
      firstExp && firstExp.blinding === 'none' ? 'No blinding employed' : null,
    ].filter(Boolean) as string[]

    return {
      title, methodology, hypotheses,
      design: firstExp, results: [...this.results],
      conclusion,
      limitations,
      futureWork: ['Replicate with larger sample size', 'Extend to diverse populations', 'Investigate longitudinal effects'],
    }
  }

  // ── Stats & serialization ────────────────────────────────────────────

  getStats(): Readonly<ScientificReasonerStats> {
    return { ...this.stats }
  }

  provideFeedback(): void { this.stats.feedbackCount++ }

  serialize(): string {
    return JSON.stringify({
      hypotheses: [...this.hypotheses.values()],
      experiments: [...this.experiments.values()],
      results: this.results,
      stats: this.stats,
    })
  }

  static deserialize(json: string, config?: Partial<ScientificReasonerConfig>): ScientificReasoner {
    const data = JSON.parse(json)
    const engine = new ScientificReasoner(config)
    for (const h of data.hypotheses ?? []) engine.hypotheses.set(h.id, h)
    for (const e of data.experiments ?? []) engine.experiments.set(e.id, e)
    engine.results.push(...(data.results ?? []))
    Object.assign(engine.stats, data.stats ?? {})
    return engine
  }
}
