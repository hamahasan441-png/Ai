/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  EthicalReasoner — Multi-framework moral analysis engine                    ║
 * ║                                                                            ║
 * ║  Evaluates scenarios through five ethical lenses: utilitarian,             ║
 * ║  deontological, virtue ethics, care ethics, and rights-based.             ║
 * ║  Identifies stakeholders, detects principle conflicts, and produces       ║
 * ║  weighted aggregate scores with actionable recommendations.               ║
 * ║                                                                            ║
 * ║  No external dependencies.                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Supported ethical reasoning frameworks. */
export type EthicalFramework = 'utilitarian' | 'deontological' | 'virtue' | 'care' | 'rights'

/** Full result of a multi-framework ethical analysis. */
export interface EthicalAnalysis {
  readonly dilemma: string
  readonly frameworks: FrameworkAssessment[]
  readonly overallAssessment: string
  readonly ethicalScore: number
  readonly stakeholders: Stakeholder[]
  readonly recommendation: string
  readonly confidence: number
}

/** Assessment from a single ethical framework. */
export interface FrameworkAssessment {
  readonly framework: EthicalFramework
  readonly assessment: string
  readonly score: number
  readonly reasoning: string
}

/** A party affected by the scenario under analysis. */
export interface Stakeholder {
  readonly name: string
  readonly impact: 'positive' | 'negative' | 'neutral'
  readonly severity: number
  readonly description: string
}

/** A named ethical principle belonging to a framework. */
export interface EthicalPrinciple {
  readonly name: string
  readonly description: string
  readonly framework: EthicalFramework
  readonly weight: number
}

/** Configuration for the EthicalReasoner. */
export interface EthicalReasonerConfig {
  /** Frameworks to evaluate. Default: all five */
  readonly frameworks: EthicalFramework[]
  /** Minimum confidence to include a framework result. Default: 0.3 */
  readonly minConfidence: number
  /** Cap on stakeholders returned per analysis. Default: 10 */
  readonly maxStakeholders: number
  /** Enable evaluation from every configured framework. Default: true */
  readonly enableMultiFramework: boolean
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_ETHICAL_CONFIG: EthicalReasonerConfig = {
  frameworks: ['utilitarian', 'deontological', 'virtue', 'care', 'rights'],
  minConfidence: 0.3,
  maxStakeholders: 10,
  enableMultiFramework: true,
}

const ALL_FRAMEWORKS: EthicalFramework[] = [
  'utilitarian',
  'deontological',
  'virtue',
  'care',
  'rights',
]

const BUILT_IN_PRINCIPLES: EthicalPrinciple[] = [
  // Utilitarian
  {
    name: 'Maximize Happiness',
    description: 'Actions should produce the greatest overall happiness',
    framework: 'utilitarian',
    weight: 0.9,
  },
  {
    name: 'Minimize Suffering',
    description: 'Reduce harm and suffering wherever possible',
    framework: 'utilitarian',
    weight: 0.9,
  },
  {
    name: 'Greatest Good',
    description: 'Seek the greatest good for the greatest number',
    framework: 'utilitarian',
    weight: 0.85,
  },
  {
    name: 'Cost-Benefit Analysis',
    description: 'Weigh positive outcomes against negative consequences',
    framework: 'utilitarian',
    weight: 0.7,
  },
  {
    name: 'Long-Term Welfare',
    description: 'Consider long-term consequences alongside immediate results',
    framework: 'utilitarian',
    weight: 0.75,
  },

  // Deontological
  {
    name: 'Universal Duty',
    description: 'Act only according to rules you could will to be universal laws',
    framework: 'deontological',
    weight: 0.9,
  },
  {
    name: 'Treat as Ends',
    description: 'Treat people as ends in themselves, never merely as means',
    framework: 'deontological',
    weight: 0.9,
  },
  {
    name: 'Categorical Imperative',
    description: 'Moral obligations are unconditional and universalizable',
    framework: 'deontological',
    weight: 0.85,
  },
  {
    name: 'Follow Moral Rules',
    description: 'Adhere to established moral rules regardless of outcome',
    framework: 'deontological',
    weight: 0.8,
  },
  {
    name: 'Keep Promises',
    description: 'Honour commitments and contracts faithfully',
    framework: 'deontological',
    weight: 0.75,
  },

  // Virtue
  {
    name: 'Courage',
    description: 'Act bravely in the face of fear or adversity',
    framework: 'virtue',
    weight: 0.75,
  },
  {
    name: 'Temperance',
    description: 'Exercise moderation and self-control',
    framework: 'virtue',
    weight: 0.7,
  },
  {
    name: 'Justice',
    description: 'Give each person their fair due',
    framework: 'virtue',
    weight: 0.9,
  },
  {
    name: 'Prudence',
    description: 'Act with practical wisdom and foresight',
    framework: 'virtue',
    weight: 0.8,
  },
  {
    name: 'Honesty',
    description: 'Be truthful and transparent in dealings',
    framework: 'virtue',
    weight: 0.85,
  },
  {
    name: 'Compassion',
    description: 'Show empathy and kindness toward others',
    framework: 'virtue',
    weight: 0.8,
  },
  {
    name: 'Integrity',
    description: 'Maintain consistency between values and actions',
    framework: 'virtue',
    weight: 0.85,
  },

  // Care
  {
    name: 'Protect the Vulnerable',
    description: 'Prioritize the welfare of those least able to protect themselves',
    framework: 'care',
    weight: 0.9,
  },
  {
    name: 'Maintain Relationships',
    description: 'Preserve and strengthen interpersonal bonds',
    framework: 'care',
    weight: 0.8,
  },
  {
    name: 'Empathy',
    description: 'Understand and share the feelings of others',
    framework: 'care',
    weight: 0.85,
  },
  {
    name: 'Responsiveness',
    description: 'Attend and respond to the needs of those in your care',
    framework: 'care',
    weight: 0.8,
  },
  {
    name: 'Nurture Growth',
    description: 'Support the development and flourishing of others',
    framework: 'care',
    weight: 0.7,
  },

  // Rights
  {
    name: 'Right to Life',
    description: 'Every person has a fundamental right to live',
    framework: 'rights',
    weight: 0.95,
  },
  {
    name: 'Right to Liberty',
    description: 'Individuals are entitled to personal freedom',
    framework: 'rights',
    weight: 0.9,
  },
  {
    name: 'Right to Privacy',
    description: 'People have the right to control personal information',
    framework: 'rights',
    weight: 0.85,
  },
  {
    name: 'Right to Free Speech',
    description: 'Individuals may express opinions without censorship',
    framework: 'rights',
    weight: 0.85,
  },
  {
    name: 'Right to Due Process',
    description: 'Everyone deserves fair treatment under established rules',
    framework: 'rights',
    weight: 0.8,
  },
]

/** Keywords that signal ethical concerns, mapped to relevant frameworks. */
const ETHICAL_KEYWORDS: Record<string, EthicalFramework[]> = {
  harm: ['utilitarian', 'care'],
  suffering: ['utilitarian', 'care'],
  happiness: ['utilitarian'],
  benefit: ['utilitarian'],
  welfare: ['utilitarian', 'care'],
  fairness: ['virtue', 'rights'],
  justice: ['virtue', 'rights', 'deontological'],
  rights: ['rights'],
  privacy: ['rights'],
  liberty: ['rights'],
  freedom: ['rights'],
  speech: ['rights'],
  duty: ['deontological'],
  obligation: ['deontological'],
  promise: ['deontological'],
  rule: ['deontological'],
  law: ['deontological', 'rights'],
  virtue: ['virtue'],
  honesty: ['virtue'],
  courage: ['virtue'],
  integrity: ['virtue'],
  compassion: ['virtue', 'care'],
  empathy: ['care'],
  vulnerable: ['care'],
  children: ['care', 'rights'],
  relationship: ['care'],
  trust: ['virtue', 'care', 'deontological'],
  consent: ['rights', 'deontological'],
  autonomy: ['rights', 'deontological'],
  dignity: ['deontological', 'rights'],
  equality: ['rights', 'virtue'],
  deception: ['virtue', 'deontological'],
  lie: ['virtue', 'deontological'],
  steal: ['deontological', 'rights'],
  kill: ['rights', 'utilitarian', 'deontological'],
  life: ['rights', 'utilitarian'],
  safety: ['care', 'utilitarian'],
  protect: ['care', 'rights'],
}

/** Common stakeholder labels detected via simple pattern matching. */
const STAKEHOLDER_PATTERNS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /\b(employees?|workers?|staff)\b/i, name: 'Employees' },
  { pattern: /\b(customers?|consumers?|clients?|users?)\b/i, name: 'Customers' },
  { pattern: /\b(children|minors|kids|youth)\b/i, name: 'Children' },
  { pattern: /\b(community|communities|public|society|citizens)\b/i, name: 'Community' },
  { pattern: /\b(shareholders?|investors?|stakeholders?)\b/i, name: 'Shareholders' },
  { pattern: /\b(patients?)\b/i, name: 'Patients' },
  { pattern: /\b(students?|learners?)\b/i, name: 'Students' },
  { pattern: /\b(environment|ecosystem|nature|planet)\b/i, name: 'Environment' },
  { pattern: /\b(family|families|relatives)\b/i, name: 'Families' },
  { pattern: /\b(government|regulators?|authorities)\b/i, name: 'Government' },
  { pattern: /\b(company|organisation|organization|firm|business)\b/i, name: 'Organisation' },
  { pattern: /\b(individuals?|persons?|people)\b/i, name: 'Individuals' },
]

// ─── EthicalReasoner ───────────────────────────────────────────────────────────

export class EthicalReasoner {
  private readonly config: EthicalReasonerConfig
  private readonly principles: EthicalPrinciple[]
  private analysisCount = 0
  private confidenceSum = 0
  private readonly frameworkUsage: Record<string, number> = {}

  constructor(config: Partial<EthicalReasonerConfig> = {}) {
    this.config = { ...DEFAULT_ETHICAL_CONFIG, ...config }
    this.principles = [...BUILT_IN_PRINCIPLES]

    for (const fw of ALL_FRAMEWORKS) {
      this.frameworkUsage[fw] = 0
    }
  }

  // ── Core Analysis ──────────────────────────────────────────────────────────

  /**
   * Perform a full multi-framework ethical analysis of the given scenario.
   * Each configured framework contributes a scored assessment. Results are
   * aggregated into an overall score and recommendation.
   */
  analyze(scenario: string): EthicalAnalysis {
    this.analysisCount++
    const lower = scenario.toLowerCase()

    const stakeholders = this.identifyStakeholders(scenario)
    const activeFrameworks = this.config.enableMultiFramework
      ? this.config.frameworks
      : [this.detectDominantFramework(lower)]

    const frameworks: FrameworkAssessment[] = []
    for (const fw of activeFrameworks) {
      const assessment = this.assessFromFramework(scenario, fw)
      if (Math.abs(assessment.score) >= this.config.minConfidence || frameworks.length === 0) {
        frameworks.push(assessment)
      }
    }

    const ethicalScore = this.aggregateScores(frameworks)
    const confidence = this.computeConfidence(lower, frameworks)
    this.confidenceSum += confidence

    const overallAssessment = this.buildOverallAssessment(ethicalScore, frameworks)
    const recommendation = this.suggestEthicalAction(scenario)

    return {
      dilemma: scenario,
      frameworks,
      overallAssessment,
      ethicalScore,
      stakeholders,
      recommendation,
      confidence,
    }
  }

  /**
   * Quickly evaluate whether a specific action is ethical within a context.
   * Returns a boolean judgement, numeric score, and brief reasoning.
   */
  evaluateAction(
    action: string,
    context: string,
  ): { isEthical: boolean; score: number; reasoning: string } {
    const combined = `${action} ${context}`
    const analysis = this.analyze(combined)
    const isEthical = analysis.ethicalScore > 0

    const topFramework =
      analysis.frameworks.length > 0
        ? analysis.frameworks.reduce((a, b) => (Math.abs(b.score) > Math.abs(a.score) ? b : a))
        : null

    const reasoning = topFramework
      ? `From a ${topFramework.framework} perspective: ${topFramework.reasoning}`
      : 'Insufficient ethical signals to form a judgement.'

    return { isEthical, score: analysis.ethicalScore, reasoning }
  }

  // ── Stakeholder Detection ──────────────────────────────────────────────────

  /**
   * Identify stakeholders mentioned or implied in the scenario.
   * Uses pattern matching to find affected groups and infers impact
   * from surrounding language.
   */
  identifyStakeholders(scenario: string): Stakeholder[] {
    const found: Stakeholder[] = []
    const seen = new Set<string>()

    for (const { pattern, name } of STAKEHOLDER_PATTERNS) {
      if (pattern.test(scenario) && !seen.has(name)) {
        seen.add(name)
        const impact = this.inferImpact(scenario, name)
        found.push({
          name,
          impact: impact.kind,
          severity: impact.severity,
          description: `${name} ${impact.kind === 'positive' ? 'benefit from' : impact.kind === 'negative' ? 'are harmed by' : 'are unaffected by'} this scenario.`,
        })
        if (found.length >= this.config.maxStakeholders) break
      }
    }

    // Always include a generic "affected parties" entry when nothing specific matched
    if (found.length === 0) {
      found.push({
        name: 'Affected Parties',
        impact: 'neutral',
        severity: 0.5,
        description: 'General parties who may be impacted by this scenario.',
      })
    }

    return found
  }

  // ── Framework Assessment ───────────────────────────────────────────────────

  /**
   * Assess the scenario from the perspective of a single ethical framework.
   * The score ranges from -1 (clearly wrong) to 1 (clearly right) based on
   * how many of the framework's principles are satisfied or violated.
   */
  assessFromFramework(scenario: string, framework: EthicalFramework): FrameworkAssessment {
    this.frameworkUsage[framework] = (this.frameworkUsage[framework] ?? 0) + 1
    const lower = scenario.toLowerCase()

    const relevant = this.principles.filter(p => p.framework === framework)
    if (relevant.length === 0) {
      return {
        framework,
        assessment: 'No principles available.',
        score: 0,
        reasoning: 'Framework has no registered principles.',
      }
    }

    let weightedScore = 0
    let totalWeight = 0
    const satisfied: string[] = []
    const violated: string[] = []

    for (const principle of relevant) {
      const signal = this.scorePrincipleMatch(lower, principle)
      weightedScore += signal * principle.weight
      totalWeight += principle.weight

      if (signal > 0.2) satisfied.push(principle.name)
      else if (signal < -0.2) violated.push(principle.name)
    }

    const score = totalWeight > 0 ? Math.max(-1, Math.min(1, weightedScore / totalWeight)) : 0

    const assessment = this.frameworkAssessmentSummary(framework, score)
    const reasoningParts: string[] = []
    if (satisfied.length > 0) reasoningParts.push(`Upholds: ${satisfied.join(', ')}.`)
    if (violated.length > 0) reasoningParts.push(`Potentially violates: ${violated.join(', ')}.`)
    if (reasoningParts.length === 0)
      reasoningParts.push('No strong alignment or violation detected.')

    return { framework, assessment, score, reasoning: reasoningParts.join(' ') }
  }

  // ── Conflict Detection ─────────────────────────────────────────────────────

  /**
   * Find pairs of ethical principles that are in tension within the scenario.
   * A conflict arises when one principle scores positively and another
   * scores negatively for the same input.
   */
  findEthicalConflicts(
    scenario: string,
  ): Array<{ principle1: string; principle2: string; tension: string }> {
    const lower = scenario.toLowerCase()
    const scored = this.principles.map(p => ({
      principle: p,
      signal: this.scorePrincipleMatch(lower, p),
    }))

    const positive = scored.filter(s => s.signal > 0.2)
    const negative = scored.filter(s => s.signal < -0.2)

    const conflicts: Array<{ principle1: string; principle2: string; tension: string }> = []
    const seen = new Set<string>()

    for (const pos of positive) {
      for (const neg of negative) {
        if (pos.principle.framework === neg.principle.framework) continue
        const key = [pos.principle.name, neg.principle.name].sort().join('|')
        if (seen.has(key)) continue
        seen.add(key)

        conflicts.push({
          principle1: pos.principle.name,
          principle2: neg.principle.name,
          tension: `${pos.principle.name} (${pos.principle.framework}) supports the action while ${neg.principle.name} (${neg.principle.framework}) opposes it.`,
        })
      }
    }

    return conflicts
  }

  // ── Recommendation ─────────────────────────────────────────────────────────

  /**
   * Suggest the most ethical course of action for the given scenario.
   * Analyzes all frameworks and synthesizes a recommendation that
   * attempts to honour the strongest principles.
   */
  suggestEthicalAction(scenario: string): string {
    const lower = scenario.toLowerCase()
    const frameworkScores = this.config.frameworks.map(fw => ({
      fw,
      score: this.quickFrameworkScore(lower, fw),
    }))

    const best = frameworkScores.reduce((a, b) => (Math.abs(b.score) > Math.abs(a.score) ? b : a))
    const avgScore = frameworkScores.reduce((sum, f) => sum + f.score, 0) / frameworkScores.length

    if (avgScore > 0.3) {
      return `The scenario appears ethically sound. Strongest support comes from ${best.fw} ethics. Proceed with transparency and stakeholder awareness.`
    }
    if (avgScore < -0.3) {
      return `The scenario raises significant ethical concerns, especially from a ${best.fw} perspective. Consider alternatives that better respect ${this.frameworkCoreValue(best.fw)}.`
    }
    return `The ethical picture is mixed. Balance competing concerns by prioritising ${this.frameworkCoreValue(best.fw)} while being transparent about trade-offs.`
  }

  // ── Principle Access ───────────────────────────────────────────────────────

  /**
   * Retrieve the set of built-in ethical principles, optionally filtered
   * to a single framework.
   */
  getPrinciples(framework?: EthicalFramework): EthicalPrinciple[] {
    if (framework) {
      return this.principles.filter(p => p.framework === framework)
    }
    return [...this.principles]
  }

  // ── Statistics ─────────────────────────────────────────────────────────────

  /**
   * Return cumulative statistics about analyses performed.
   */
  getStats(): {
    totalAnalyses: number
    averageConfidence: number
    frameworkUsage: Record<string, number>
  } {
    return {
      totalAnalyses: this.analysisCount,
      averageConfidence: this.analysisCount > 0 ? this.confidenceSum / this.analysisCount : 0,
      frameworkUsage: { ...this.frameworkUsage },
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  /** Serialize internal state for persistence. */
  serialize(): {
    analysisCount: number
    confidenceSum: number
    frameworkUsage: Record<string, number>
  } {
    return {
      analysisCount: this.analysisCount,
      confidenceSum: this.confidenceSum,
      frameworkUsage: { ...this.frameworkUsage },
    }
  }

  /** Restore internal state from previously serialized data. */
  deserialize(data: {
    analysisCount: number
    confidenceSum: number
    frameworkUsage: Record<string, number>
  }): void {
    this.analysisCount = data.analysisCount
    this.confidenceSum = data.confidenceSum
    for (const key of Object.keys(data.frameworkUsage)) {
      this.frameworkUsage[key] = data.frameworkUsage[key]!
    }
  }

  /** Reset all counters. */
  clear(): void {
    this.analysisCount = 0
    this.confidenceSum = 0
    for (const fw of ALL_FRAMEWORKS) {
      this.frameworkUsage[fw] = 0
    }
  }

  // ── Internal Helpers ───────────────────────────────────────────────────────

  /**
   * Score how well a scenario satisfies or violates a single principle.
   * Returns a value in [-1, 1].
   */
  private scorePrincipleMatch(lower: string, principle: EthicalPrinciple): number {
    let score = 0

    // Positive-signal keywords grouped by principle name patterns
    const positivePatterns = this.positiveKeywordsFor(principle)
    const negativePatterns = this.negativeKeywordsFor(principle)

    for (const kw of positivePatterns) {
      if (lower.includes(kw)) score += 0.35
    }
    for (const kw of negativePatterns) {
      if (lower.includes(kw)) score -= 0.35
    }

    // General ethical-keyword resonance
    for (const [kw, frameworks] of Object.entries(ETHICAL_KEYWORDS)) {
      if (lower.includes(kw) && frameworks.includes(principle.framework)) {
        score += 0.1
      }
    }

    return Math.max(-1, Math.min(1, score))
  }

  private positiveKeywordsFor(principle: EthicalPrinciple): string[] {
    const map: Record<string, string[]> = {
      'Maximize Happiness': ['happiness', 'joy', 'wellbeing', 'benefit', 'prosper'],
      'Minimize Suffering': ['reduce harm', 'alleviate', 'prevent suffering', 'protect'],
      'Greatest Good': ['greatest good', 'majority', 'most people', 'collective'],
      'Cost-Benefit Analysis': ['cost-benefit', 'efficient', 'trade-off', 'optimise', 'optimize'],
      'Long-Term Welfare': ['long-term', 'sustainable', 'future generations', 'lasting'],
      'Universal Duty': ['duty', 'obligation', 'universally', 'categorical'],
      'Treat as Ends': ['dignity', 'respect', 'autonomy', 'consent'],
      'Categorical Imperative': ['universal law', 'categorical', 'unconditional', 'moral law'],
      'Follow Moral Rules': ['rule', 'principle', 'standard', 'guideline'],
      'Keep Promises': ['promise', 'commitment', 'honour', 'honor', 'contract'],
      Courage: ['courage', 'brave', 'stand up', 'confront'],
      Temperance: ['moderation', 'restraint', 'self-control', 'balance'],
      Justice: ['justice', 'fair', 'equitable', 'impartial'],
      Prudence: ['prudent', 'wise', 'careful', 'foresight'],
      Honesty: ['honest', 'truthful', 'transparent', 'candid'],
      Compassion: ['compassion', 'empathy', 'kindness', 'caring'],
      Integrity: ['integrity', 'consistent', 'principled', 'upright'],
      'Protect the Vulnerable': ['protect', 'vulnerable', 'children', 'safety', 'shield'],
      'Maintain Relationships': ['relationship', 'bond', 'connection', 'community'],
      Empathy: ['empathy', 'understand feelings', 'perspective', 'listen'],
      Responsiveness: ['responsive', 'attentive', 'address needs', 'support'],
      'Nurture Growth': ['growth', 'develop', 'flourish', 'nurture', 'mentor'],
      'Right to Life': ['right to life', 'life', 'survival', 'existence'],
      'Right to Liberty': ['liberty', 'freedom', 'autonomy', 'self-determination'],
      'Right to Privacy': ['privacy', 'confidential', 'personal data', 'surveillance'],
      'Right to Free Speech': ['free speech', 'expression', 'opinion', 'press'],
      'Right to Due Process': [
        'due process',
        'fair trial',
        'presumption of innocence',
        'legal rights',
      ],
    }
    return map[principle.name] ?? []
  }

  private negativeKeywordsFor(principle: EthicalPrinciple): string[] {
    const map: Record<string, string[]> = {
      'Maximize Happiness': ['suffering', 'misery', 'pain', 'despair'],
      'Minimize Suffering': ['inflict', 'torture', 'abuse', 'cruelty'],
      'Greatest Good': ['selfish', 'few benefit', 'exclusive'],
      'Cost-Benefit Analysis': ['wasteful', 'reckless', 'ignore consequences'],
      'Long-Term Welfare': ['short-sighted', 'unsustainable', 'exploit'],
      'Universal Duty': ['exception for myself', 'special treatment', 'double standard'],
      'Treat as Ends': ['exploit', 'manipulate', 'use people', 'objectify'],
      'Categorical Imperative': ['exception', 'convenient', 'situational ethics'],
      'Follow Moral Rules': ['break rules', 'cheat', 'circumvent'],
      'Keep Promises': ['betray', 'break promise', 'renege', 'deceive'],
      Courage: ['cowardice', 'avoid', 'flee responsibility'],
      Temperance: ['excess', 'indulgence', 'gluttony', 'extreme'],
      Justice: ['unfair', 'bias', 'discriminat', 'unjust'],
      Prudence: ['reckless', 'impulsive', 'short-sighted', 'foolish'],
      Honesty: ['lie', 'deceive', 'fraud', 'dishonest', 'mislead'],
      Compassion: ['cruel', 'callous', 'indifferent', 'heartless'],
      Integrity: ['hypocrit', 'corrupt', 'inconsistent', 'two-faced'],
      'Protect the Vulnerable': ['exploit vulnerable', 'endanger children', 'neglect'],
      'Maintain Relationships': ['betray', 'abandon', 'isolate', 'sever ties'],
      Empathy: ['ignore feelings', 'dismiss', 'apathetic'],
      Responsiveness: ['neglect', 'ignore', 'unresponsive', 'abandon'],
      'Nurture Growth': ['stifle', 'suppress', 'hinder', 'oppress'],
      'Right to Life': ['kill', 'murder', 'endanger life', 'lethal'],
      'Right to Liberty': ['imprison', 'enslave', 'coerce', 'restrict freedom'],
      'Right to Privacy': ['surveillance', 'spy', 'expose private', 'data breach'],
      'Right to Free Speech': ['censor', 'silence', 'suppress speech', 'ban expression'],
      'Right to Due Process': ['unfair trial', 'no hearing', 'arbitrary punishment', 'deny rights'],
    }
    return map[principle.name] ?? []
  }

  /** Detect which framework is most relevant based on keyword frequency. */
  private detectDominantFramework(lower: string): EthicalFramework {
    const counts: Record<EthicalFramework, number> = {
      utilitarian: 0,
      deontological: 0,
      virtue: 0,
      care: 0,
      rights: 0,
    }
    for (const [kw, frameworks] of Object.entries(ETHICAL_KEYWORDS)) {
      if (lower.includes(kw)) {
        for (const fw of frameworks) counts[fw]++
      }
    }
    let best: EthicalFramework = 'utilitarian'
    let bestCount = 0
    for (const fw of ALL_FRAMEWORKS) {
      if (counts[fw] > bestCount) {
        best = fw
        bestCount = counts[fw]
      }
    }
    return best
  }

  /** Quick aggregated score for a framework without full assessment overhead. */
  private quickFrameworkScore(lower: string, framework: EthicalFramework): number {
    const relevant = this.principles.filter(p => p.framework === framework)
    if (relevant.length === 0) return 0
    let total = 0
    let weight = 0
    for (const p of relevant) {
      total += this.scorePrincipleMatch(lower, p) * p.weight
      weight += p.weight
    }
    return weight > 0 ? total / weight : 0
  }

  /** Weighted average across framework assessment scores. */
  private aggregateScores(assessments: FrameworkAssessment[]): number {
    if (assessments.length === 0) return 0
    const frameworkWeights: Record<EthicalFramework, number> = {
      utilitarian: 1.0,
      deontological: 1.0,
      virtue: 0.9,
      care: 0.85,
      rights: 1.0,
    }
    let weighted = 0
    let total = 0
    for (const a of assessments) {
      const w = frameworkWeights[a.framework] ?? 1
      weighted += a.score * w
      total += w
    }
    return total > 0 ? Math.max(-1, Math.min(1, weighted / total)) : 0
  }

  /** Estimate analysis confidence from keyword density and framework agreement. */
  private computeConfidence(lower: string, assessments: FrameworkAssessment[]): number {
    let keywordHits = 0
    for (const kw of Object.keys(ETHICAL_KEYWORDS)) {
      if (lower.includes(kw)) keywordHits++
    }
    const keywordConfidence = Math.min(1, keywordHits / 5)

    if (assessments.length <= 1) return keywordConfidence * 0.6

    const scores = assessments.map(a => a.score)
    const mean = scores.reduce((s, v) => s + v, 0) / scores.length
    const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length
    const agreementConfidence = Math.max(0, 1 - Math.sqrt(variance))

    return Math.min(1, keywordConfidence * 0.4 + agreementConfidence * 0.6)
  }

  /** Human-readable summary for a given framework score. */
  private frameworkAssessmentSummary(framework: EthicalFramework, score: number): string {
    const label = framework.charAt(0).toUpperCase() + framework.slice(1)
    if (score > 0.5) return `${label} analysis: strongly ethically supported.`
    if (score > 0.1) return `${label} analysis: generally ethically acceptable.`
    if (score > -0.1) return `${label} analysis: ethically ambiguous.`
    if (score > -0.5) return `${label} analysis: raises ethical concerns.`
    return `${label} analysis: significant ethical violations detected.`
  }

  /** Build a synthesized overall assessment string. */
  private buildOverallAssessment(score: number, assessments: FrameworkAssessment[]): string {
    const parts: string[] = []

    if (score > 0.3) parts.push('The scenario is broadly ethical across frameworks.')
    else if (score > 0) parts.push('The scenario is marginally ethical, with some concerns.')
    else if (score > -0.3) parts.push('The scenario presents mixed ethical signals.')
    else parts.push('The scenario raises serious ethical concerns across frameworks.')

    const supporting = assessments.filter(a => a.score > 0.1).map(a => a.framework)
    const opposing = assessments.filter(a => a.score < -0.1).map(a => a.framework)

    if (supporting.length > 0) parts.push(`Supporting frameworks: ${supporting.join(', ')}.`)
    if (opposing.length > 0) parts.push(`Opposing frameworks: ${opposing.join(', ')}.`)

    return parts.join(' ')
  }

  /** Infer whether a stakeholder is positively or negatively affected. */
  private inferImpact(
    scenario: string,
    stakeholder: string,
  ): { kind: 'positive' | 'negative' | 'neutral'; severity: number } {
    const lower = scenario.toLowerCase()
    const stakeholderLower = stakeholder.toLowerCase()
    const negWords = [
      'harm',
      'hurt',
      'damage',
      'endanger',
      'exploit',
      'risk',
      'threaten',
      'suffer',
      'lose',
      'violate',
    ]
    const posWords = [
      'benefit',
      'help',
      'protect',
      'support',
      'improve',
      'empower',
      'save',
      'serve',
      'gain',
    ]

    let negHits = 0
    let posHits = 0
    for (const w of negWords) {
      if (lower.includes(w)) negHits++
    }
    for (const w of posWords) {
      if (lower.includes(w)) posHits++
    }

    // Boost if stakeholder name appears near ethical keywords
    if (lower.includes(stakeholderLower)) {
      negHits *= 1.2
      posHits *= 1.2
    }

    if (negHits > posHits && negHits > 0)
      return { kind: 'negative', severity: Math.min(1, negHits * 0.25) }
    if (posHits > negHits && posHits > 0)
      return { kind: 'positive', severity: Math.min(1, posHits * 0.25) }
    return { kind: 'neutral', severity: 0.3 }
  }

  /** Map a framework to its core value for recommendation text. */
  private frameworkCoreValue(framework: EthicalFramework): string {
    const map: Record<EthicalFramework, string> = {
      utilitarian: 'overall welfare and harm reduction',
      deontological: 'moral duty and universal principles',
      virtue: 'character, honesty, and justice',
      care: 'relationships and protection of the vulnerable',
      rights: 'fundamental human rights and freedoms',
    }
    return map[framework]
  }
}
