/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  HypothesisEngine — Scientific reasoning through hypothesis generation     ║
 * ║                                                                            ║
 * ║  Enables the AI to reason scientifically: observe, hypothesize, gather     ║
 * ║  evidence, and test. Generates plausible explanations for observations,    ║
 * ║  tracks supporting and counter-evidence, and uses Bayesian updating to     ║
 * ║  converge on the most likely explanation.                                  ║
 * ║                                                                            ║
 * ║  No external dependencies.                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** A piece of evidence for or against a hypothesis. */
export interface Evidence {
  readonly id: string
  readonly description: string
  /** Strength of the evidence, 0-1. */
  readonly strength: number
  readonly source: string
  /** Whether this evidence supports (true) or contradicts (false) the hypothesis. */
  readonly supports: boolean
}

/** A hypothesis with its current state and accumulated evidence. */
export interface Hypothesis {
  readonly id: string
  readonly statement: string
  confidence: number
  readonly evidence: Evidence[]
  readonly counterEvidence: Evidence[]
  status: 'proposed' | 'supported' | 'refuted' | 'inconclusive'
  readonly domain: string
  readonly createdAt: number
}

/** Result of testing a hypothesis against its evidence. */
export interface HypothesisTestResult {
  readonly hypothesis: Hypothesis
  readonly verdict: 'supported' | 'refuted' | 'inconclusive'
  readonly confidence: number
  readonly reasoning: string
  readonly newEvidence: Evidence[]
}

/** Configuration for the hypothesis engine. */
export interface HypothesisEngineConfig {
  /** Maximum hypotheses to track at once. Default: 100 */
  readonly maxHypotheses: number
  /** Rate at which confidence decays over time without new evidence. Default: 0.05 */
  readonly confidenceDecayRate: number
  /** Minimum evidence items required to reach a conclusion. Default: 3 */
  readonly minEvidenceForConclusion: number
  /** Enable Bayesian confidence updating when evidence is added. Default: true */
  readonly enableBayesianUpdate: boolean
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_HYPOTHESIS_ENGINE_CONFIG: HypothesisEngineConfig = {
  maxHypotheses: 100,
  confidenceDecayRate: 0.05,
  minEvidenceForConclusion: 3,
  enableBayesianUpdate: true,
}

/** Domain-specific templates for hypothesis generation. */
const DOMAIN_TEMPLATES: Record<string, string[]> = {
  science: [
    'The phenomenon may be caused by {0}',
    'This could result from an interaction between {0} and related factors',
    'A plausible mechanism is that {0} triggers a cascading effect',
    'Environmental conditions suggest {0} as a contributing factor',
  ],
  technology: [
    'The issue might stem from {0}',
    'Performance degradation could be due to {0}',
    'A configuration or state mismatch involving {0} may be responsible',
    'Resource contention related to {0} could explain the behavior',
  ],
  logic: [
    'If A then B; we observe B, so possibly {0}',
    'The absence of expected outcomes suggests {0}',
    'By elimination of alternatives, {0} remains the strongest candidate',
    'The pattern is consistent with {0} as the underlying rule',
  ],
  general: [
    'One explanation could be {0}',
    'An alternative hypothesis is that {0}',
    '{0} would account for the observed behavior',
    'It is plausible that {0} plays a central role',
  ],
}

/** Keywords used to infer a domain from an observation. */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  science: ['experiment', 'reaction', 'molecule', 'energy', 'particle', 'cell', 'organism', 'temperature', 'chemical'],
  technology: ['server', 'latency', 'memory', 'cpu', 'crash', 'bug', 'deploy', 'network', 'database', 'performance'],
  logic: ['therefore', 'implies', 'contradiction', 'premise', 'conclude', 'valid', 'if', 'proof', 'deduction'],
}

// ─── HypothesisEngine ──────────────────────────────────────────────────────────

export class HypothesisEngine {
  private readonly config: HypothesisEngineConfig
  private readonly hypotheses: Map<string, Hypothesis> = new Map()
  private idCounter = 0

  constructor(config: Partial<HypothesisEngineConfig> = {}) {
    this.config = { ...DEFAULT_HYPOTHESIS_ENGINE_CONFIG, ...config }
  }

  // ── Hypothesis Generation ──────────────────────────────────────────────────

  /**
   * Generate 2-4 plausible hypotheses from an observation using
   * domain-specific templates and pattern matching.
   */
  generateHypotheses(observation: string, domain?: string): Hypothesis[] {
    const resolvedDomain = domain ?? this.inferDomain(observation)
    const templates = DOMAIN_TEMPLATES[resolvedDomain] ?? DOMAIN_TEMPLATES['general']!
    const keywords = this.extractKeyPhrases(observation)
    const count = Math.min(templates.length, Math.max(2, keywords.length))
    const generated: Hypothesis[] = []

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length]!
      const phrase = keywords[i % keywords.length] ?? observation
      const hypothesis: Hypothesis = {
        id: this.nextId(),
        statement: template.replace('{0}', phrase),
        confidence: 0.5,
        evidence: [],
        counterEvidence: [],
        status: 'proposed',
        domain: resolvedDomain,
        createdAt: Date.now(),
      }
      this.storeHypothesis(hypothesis)
      generated.push(hypothesis)
    }

    return generated
  }

  // ── Evidence Management ────────────────────────────────────────────────────

  /**
   * Add evidence to a hypothesis. Updates confidence via Bayes' rule if enabled.
   */
  addEvidence(hypothesisId: string, evidence: Evidence): void {
    const h = this.hypotheses.get(hypothesisId)
    if (!h) return
    if (evidence.supports) { h.evidence.push(evidence) }
    else { h.counterEvidence.push(evidence) }

    if (this.config.enableBayesianUpdate) {
      h.confidence = this.bayesianUpdate(h.confidence, evidence)
    }
  }

  // ── Hypothesis Testing ─────────────────────────────────────────────────────

  /**
   * Test a hypothesis by evaluating all accumulated evidence.
   * Returns a verdict and confidence score.
   */
  testHypothesis(hypothesisId: string): HypothesisTestResult {
    const h = this.hypotheses.get(hypothesisId)
    if (!h) {
      return this.inconclusiveResult(hypothesisId)
    }

    const totalEvidence = h.evidence.length + h.counterEvidence.length
    const supportStrength = this.sumStrength(h.evidence)
    const counterStrength = this.sumStrength(h.counterEvidence)
    const netStrength = supportStrength - counterStrength
    const confidence = this.clamp(0.5 + netStrength / Math.max(totalEvidence, 1) * 0.5)

    // Need minimum evidence to draw a firm conclusion
    let verdict: 'supported' | 'refuted' | 'inconclusive'
    if (totalEvidence < this.config.minEvidenceForConclusion) {
      verdict = 'inconclusive'
    } else if (netStrength > 0.3) {
      verdict = 'supported'
    } else if (netStrength < -0.3) {
      verdict = 'refuted'
    } else {
      verdict = 'inconclusive'
    }

    h.confidence = confidence
    h.status = verdict

    const reasoning = this.buildReasoning(h, supportStrength, counterStrength, verdict)

    return {
      hypothesis: h,
      verdict,
      confidence,
      reasoning,
      newEvidence: [],
    }
  }

  // ── Explanation Evaluation ─────────────────────────────────────────────────

  /**
   * Evaluate how plausible an explanation is for the given observation.
   * Returns a score (0-1) and alternative explanations.
   */
  evaluateExplanation(
    observation: string,
    explanation: string,
  ): { plausibility: number; alternativeExplanations: string[] } {
    const obsWords = this.tokenize(observation)
    const expWords = this.tokenize(explanation)

    // Relevance: how many observation keywords appear in the explanation
    const overlap = obsWords.filter(w => expWords.includes(w)).length
    const relevance = obsWords.length > 0 ? overlap / obsWords.length : 0

    // Specificity: longer explanations tend to be more specific
    const specificity = this.clamp(expWords.length / 20)

    // Combined plausibility
    const plausibility = this.clamp(relevance * 0.6 + specificity * 0.4)

    // Generate alternative explanations from templates
    const domain = this.inferDomain(observation)
    const templates = DOMAIN_TEMPLATES[domain] ?? DOMAIN_TEMPLATES['general']!
    const phrase = this.extractKeyPhrases(observation)[0] ?? observation
    const alternativeExplanations = templates
      .slice(0, 3)
      .map(t => t.replace('{0}', phrase))
      .filter(alt => alt !== explanation)

    return { plausibility, alternativeExplanations }
  }

  // ── Contradiction Detection ────────────────────────────────────────────────

  /**
   * Find pairs of hypotheses that contradict each other via opposing
   * conclusions, shared evidence, or keyword negation.
   */
  findContradictions(
    hypotheses?: Hypothesis[],
  ): Array<{ h1: string; h2: string; reason: string }> {
    const list = hypotheses ?? [...this.hypotheses.values()]
    const contradictions: Array<{ h1: string; h2: string; reason: string }> = []

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!
        const b = list[j]!
        const reason = this.detectContradiction(a, b)
        if (reason) {
          contradictions.push({ h1: a.id, h2: b.id, reason })
        }
      }
    }

    return contradictions
  }

  // ── Ranking ────────────────────────────────────────────────────────────────

  /**
   * Rank hypotheses by composite score (confidence + evidence quality).
   */
  rankHypotheses(hypotheses?: Hypothesis[]): Hypothesis[] {
    const list = hypotheses ?? [...this.hypotheses.values()]
    return [...list].sort((a, b) => this.compositeScore(b) - this.compositeScore(a))
  }

  // ── Accessors ──────────────────────────────────────────────────────────────

  /** Retrieve a hypothesis by its ID. */
  getHypothesis(id: string): Hypothesis | undefined {
    return this.hypotheses.get(id)
  }

  /** Retrieve all stored hypotheses. */
  getAllHypotheses(): Hypothesis[] {
    return [...this.hypotheses.values()]
  }

  /** Get aggregate statistics about stored hypotheses. */
  getStats(): { total: number; supported: number; refuted: number; inconclusive: number } {
    let supported = 0
    let refuted = 0
    let inconclusive = 0

    for (const h of this.hypotheses.values()) {
      switch (h.status) {
        case 'supported': supported++; break
        case 'refuted': refuted++; break
        case 'inconclusive': inconclusive++; break
        // 'proposed' counted in total only
      }
    }

    return { total: this.hypotheses.size, supported, refuted, inconclusive }
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  /**
   * Simplified Bayesian update:
   *   P(H|E) = P(E|H) * P(H) / P(E)
   * Where P(E|H) is the evidence likelihood given the hypothesis,
   * P(H) is the prior (current confidence), and P(E) is estimated
   * from a weighted average of prior-weighted likelihood.
   */
  private bayesianUpdate(prior: number, evidence: Evidence): number {
    // Likelihood: strong supporting evidence → high likelihood; strong counter → low
    const likelihood = evidence.supports
      ? 0.5 + evidence.strength * 0.5
      : 0.5 - evidence.strength * 0.5

    // Marginal probability of evidence (total probability theorem)
    const pEvidence = likelihood * prior + (1 - likelihood) * (1 - prior)

    if (pEvidence === 0) return prior

    const posterior = (likelihood * prior) / pEvidence
    return this.clamp(posterior)
  }

  private inferDomain(text: string): string {
    const lower = text.toLowerCase()
    let bestDomain = 'general'
    let bestCount = 0

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      const count = keywords.filter(k => lower.includes(k)).length
      if (count > bestCount) {
        bestCount = count
        bestDomain = domain
      }
    }

    return bestDomain
  }

  private extractKeyPhrases(text: string): string[] {
    const stop = 'the a an is are was were be been being have has had do does did will would could should may might shall can to of in for on with at by from it this that and or but not no so if then than too very'
    const stopWords = new Set(stop.split(' '))
    const words = this.tokenize(text).filter(w => w.length > 2 && !stopWords.has(w))

    // Build bigrams from meaningful words for richer phrases
    const phrases: string[] = []
    for (let i = 0; i < words.length; i++) {
      phrases.push(i < words.length - 1 ? `${words[i]} ${words[i + 1]}` : words[i]!)
    }
    return phrases.length > 0 ? phrases.slice(0, 4) : [text.slice(0, 60)]
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean)
  }

  private sumStrength(evidenceList: Evidence[]): number {
    return evidenceList.reduce((sum, e) => sum + e.strength, 0)
  }

  private compositeScore(h: Hypothesis): number {
    const evidenceCount = h.evidence.length + h.counterEvidence.length
    const evidenceQuality = evidenceCount > 0
      ? this.sumStrength(h.evidence) / Math.max(evidenceCount, 1)
      : 0

    // Weighted blend of confidence and evidence quality
    return h.confidence * 0.6 + evidenceQuality * 0.3 + (evidenceCount > 0 ? 0.1 : 0)
  }

  private detectContradiction(a: Hypothesis, b: Hypothesis): string | null {
    // Same domain with opposing statuses
    if (a.domain === b.domain) {
      if (
        (a.status === 'supported' && b.status === 'refuted') ||
        (a.status === 'refuted' && b.status === 'supported')
      ) {
        return `Opposing conclusions in domain "${a.domain}": one supported, one refuted`
      }
    }

    // Shared evidence used in opposite directions
    const aEvidenceIds = new Set(a.evidence.map(e => e.id))
    for (const ce of b.counterEvidence) {
      if (aEvidenceIds.has(ce.id)) {
        return `Evidence "${ce.id}" supports H1 but contradicts H2`
      }
    }
    const bEvidenceIds = new Set(b.evidence.map(e => e.id))
    for (const ce of a.counterEvidence) {
      if (bEvidenceIds.has(ce.id)) {
        return `Evidence "${ce.id}" supports H2 but contradicts H1`
      }
    }

    // Keyword-level negation detection
    const aWords = new Set(this.tokenize(a.statement))
    const bWords = new Set(this.tokenize(b.statement))
    const negators = ['not', 'no', 'never', 'without', 'absence', 'lack']
    for (const neg of negators) {
      if (aWords.has(neg) !== bWords.has(neg)) {
        const shared = [...aWords].filter(w => bWords.has(w) && !negators.includes(w))
        if (shared.length >= 2) {
          return `Statements share key terms but differ in negation ("${neg}")`
        }
      }
    }

    return null
  }

  private buildReasoning(
    h: Hypothesis, supportStrength: number,
    counterStrength: number, verdict: string,
  ): string {
    const net = supportStrength - counterStrength
    return [
      `Evaluated hypothesis: "${h.statement}".`,
      `Supporting evidence: ${h.evidence.length} item(s), total strength ${supportStrength.toFixed(2)}.`,
      `Counter-evidence: ${h.counterEvidence.length} item(s), total strength ${counterStrength.toFixed(2)}.`,
      `Net evidence strength: ${net >= 0 ? '+' : ''}${net.toFixed(2)}.`,
      `Verdict: ${verdict.toUpperCase()} (confidence ${(h.confidence * 100).toFixed(1)}%).`,
    ].join(' ')
  }

  private inconclusiveResult(hypothesisId: string): HypothesisTestResult {
    return {
      hypothesis: {
        id: hypothesisId, statement: '', confidence: 0,
        evidence: [], counterEvidence: [],
        status: 'inconclusive', domain: 'general', createdAt: Date.now(),
      },
      verdict: 'inconclusive', confidence: 0,
      reasoning: `Hypothesis "${hypothesisId}" not found.`,
      newEvidence: [],
    }
  }

  private storeHypothesis(h: Hypothesis): void {
    if (this.hypotheses.size >= this.config.maxHypotheses) {
      const oldest = this.hypotheses.keys().next().value as string
      this.hypotheses.delete(oldest)
    }
    this.hypotheses.set(h.id, h)
  }

  private nextId(): string { return `hyp_${++this.idCounter}_${Date.now()}` }

  private clamp(value: number, min = 0, max = 1): number {
    return Math.max(min, Math.min(max, value))
  }
}
