/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  FactVerificationEngine — Claim verification & source reliability          ║
 * ║                                                                            ║
 * ║  Verifies factual claims against a knowledge base, detects                 ║
 * ║  contradictions, scores source reliability, and provides                   ║
 * ║  evidence-backed verdicts for any statement.                               ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Claim extraction from natural language                                ║
 * ║    • Cross-reference checking against knowledge base                       ║
 * ║    • Contradiction detection between claims                                ║
 * ║    • Source reliability scoring with decay                                 ║
 * ║    • Evidence aggregation and confidence scoring                           ║
 * ║    • Verdict generation with explanation                                   ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** A factual claim extracted from text. */
export interface Claim {
  readonly id: string
  readonly text: string
  readonly domain: string
  readonly entities: string[]
  readonly isQuantitative: boolean
  readonly confidence: number
  readonly extractedFrom: string
}

/** A piece of evidence for or against a claim. */
export interface VerificationEvidence {
  readonly sourceId: string
  readonly text: string
  readonly supports: boolean
  readonly strength: number
  readonly relevance: number
}

/** Verdict on a claim's truthfulness. */
export type Verdict = 'verified' | 'likely_true' | 'uncertain' | 'likely_false' | 'false' | 'unverifiable'

/** Result of verifying a claim. */
export interface VerificationResult {
  readonly claim: Claim
  readonly verdict: Verdict
  readonly confidence: number
  readonly supportingEvidence: VerificationEvidence[]
  readonly contradictingEvidence: VerificationEvidence[]
  readonly explanation: string
  readonly suggestedCorrection: string | null
}

/** A known fact in the knowledge base. */
export interface KnownFact {
  readonly id: string
  readonly statement: string
  readonly domain: string
  readonly entities: string[]
  readonly source: string
  readonly reliability: number
  readonly addedAt: number
  readonly lastVerifiedAt: number
}

/** A source of information with tracked reliability. */
export interface SourceProfile {
  readonly id: string
  readonly name: string
  reliability: number
  readonly totalClaims: number
  readonly verifiedClaims: number
  readonly falseClaims: number
  readonly lastUpdated: number
}

/** A detected contradiction between two claims/facts. */
export interface Contradiction {
  readonly claim1: string
  readonly claim2: string
  readonly type: 'direct' | 'implicit' | 'temporal' | 'scope'
  readonly severity: number
  readonly explanation: string
}

/** Configuration for the fact verification engine. */
export interface FactVerificationEngineConfig {
  /** Maximum facts in the knowledge base. Default: 5000 */
  readonly maxFacts: number
  /** Minimum evidence items for a conclusive verdict. Default: 2 */
  readonly minEvidenceForVerdict: number
  /** Threshold for 'verified' verdict. Default: 0.8 */
  readonly verifiedThreshold: number
  /** Threshold for 'likely_true' verdict. Default: 0.6 */
  readonly likelyTrueThreshold: number
  /** Source reliability decay rate per day. Default: 0.001 */
  readonly reliabilityDecayRate: number
  /** Maximum sources to track. Default: 200 */
  readonly maxSources: number
}

/** Runtime statistics. */
export interface FactVerificationEngineStats {
  readonly totalClaimsVerified: number
  readonly totalFactsStored: number
  readonly totalSourcesTracked: number
  readonly avgVerificationConfidence: number
  readonly contradictionsDetected: number
  readonly verdictDistribution: Record<Verdict, number>
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_FACT_VERIFICATION_CONFIG: FactVerificationEngineConfig = {
  maxFacts: 5000,
  minEvidenceForVerdict: 2,
  verifiedThreshold: 0.8,
  likelyTrueThreshold: 0.6,
  reliabilityDecayRate: 0.001,
  maxSources: 200,
}

/** Claim extraction patterns. */
const CLAIM_PATTERNS: RegExp[] = [
  /(?:^|\. )([A-Z][^.!?]*(?:is|are|was|were|has|have|can|will|does|do)[^.!?]*[.!?])/g,
  /(?:^|\. )([A-Z][^.!?]*(?:always|never|every|all|none|most|some)[^.!?]*[.!?])/g,
  /(?:^|\. )([A-Z][^.!?]*\d+[^.!?]*[.!?])/g,
]

/** Quantitative signal words. */
const QUANTITATIVE_SIGNALS = ['percent', '%', 'million', 'billion', 'thousand', 'number', 'rate', 'ratio', 'count', 'average', 'median']

/** Domain keywords for classification. */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  science: ['theory', 'hypothesis', 'experiment', 'observation', 'research', 'study', 'evidence'],
  technology: ['software', 'hardware', 'api', 'algorithm', 'program', 'code', 'system', 'computer'],
  medicine: ['disease', 'treatment', 'symptom', 'drug', 'patient', 'health', 'medical'],
  history: ['century', 'war', 'empire', 'king', 'queen', 'revolution', 'ancient', 'historical'],
  geography: ['country', 'city', 'river', 'mountain', 'continent', 'ocean', 'population'],
  economics: ['market', 'economy', 'gdp', 'inflation', 'trade', 'currency', 'fiscal'],
  general: ['is', 'are', 'was', 'has', 'does'],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `fv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function extractEntities(text: string): string[] {
  // Simple NER: extract capitalized multi-word phrases
  const entities: string[] = []
  const regex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match[1].length > 2) {
      entities.push(match[1])
    }
  }
  return [...new Set(entities)]
}

function detectDomain(text: string): string {
  const lower = text.toLowerCase()
  let bestDomain = 'general'
  let bestScore = 0
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      bestDomain = domain
    }
  }
  return bestDomain
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(t => t.length > 2)
}

function computeTextSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(tokenize(text1))
  const tokens2 = new Set(tokenize(text2))
  if (tokens1.size === 0 || tokens2.size === 0) return 0

  let intersection = 0
  for (const token of tokens1) {
    if (tokens2.has(token)) intersection++
  }
  return (2 * intersection) / (tokens1.size + tokens2.size)
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class FactVerificationEngine {
  private readonly config: FactVerificationEngineConfig
  private readonly facts: Map<string, KnownFact> = new Map()
  private readonly sources: Map<string, SourceProfile> = new Map()
  private readonly contradictions: Contradiction[] = []
  private stats = {
    totalClaimsVerified: 0,
    totalConfidence: 0,
    contradictionsDetected: 0,
    verdictCounts: {
      verified: 0,
      likely_true: 0,
      uncertain: 0,
      likely_false: 0,
      false: 0,
      unverifiable: 0,
    } as Record<Verdict, number>,
  }

  constructor(config: Partial<FactVerificationEngineConfig> = {}) {
    this.config = { ...DEFAULT_FACT_VERIFICATION_CONFIG, ...config }
  }

  // ── Knowledge base management ──────────────────────────────────────────

  /** Add a known fact to the knowledge base. */
  addFact(statement: string, source: string, reliability?: number): KnownFact {
    const fact: KnownFact = {
      id: generateId(),
      statement,
      domain: detectDomain(statement),
      entities: extractEntities(statement),
      source,
      reliability: reliability ?? 0.8,
      addedAt: Date.now(),
      lastVerifiedAt: Date.now(),
    }

    this.facts.set(fact.id, fact)

    // Enforce max size
    if (this.facts.size > this.config.maxFacts) {
      const oldest = [...this.facts.entries()]
        .sort(([, a], [, b]) => a.addedAt - b.addedAt)[0]
      if (oldest) this.facts.delete(oldest[0])
    }

    // Update source profile
    this.updateSource(source, true)

    return fact
  }

  /** Remove a fact from the knowledge base. */
  removeFact(factId: string): boolean {
    return this.facts.delete(factId)
  }

  /** Get all facts. */
  getAllFacts(): readonly KnownFact[] {
    return [...this.facts.values()]
  }

  // ── Source management ──────────────────────────────────────────────────

  /** Register or update a source profile. */
  registerSource(id: string, name: string, initialReliability?: number): SourceProfile {
    const existing = this.sources.get(id)
    if (existing) return existing

    const profile: SourceProfile = {
      id,
      name,
      reliability: initialReliability ?? 0.5,
      totalClaims: 0,
      verifiedClaims: 0,
      falseClaims: 0,
      lastUpdated: Date.now(),
    }

    this.sources.set(id, profile)

    // Enforce max sources
    if (this.sources.size > this.config.maxSources) {
      const oldest = [...this.sources.entries()]
        .sort(([, a], [, b]) => a.lastUpdated - b.lastUpdated)[0]
      if (oldest) this.sources.delete(oldest[0])
    }

    return profile
  }

  private updateSource(sourceId: string, wasCorrect: boolean): void {
    let profile = this.sources.get(sourceId)
    if (!profile) {
      profile = this.registerSource(sourceId, sourceId)
    }

    const updated: SourceProfile = {
      ...profile,
      totalClaims: profile.totalClaims + 1,
      verifiedClaims: profile.verifiedClaims + (wasCorrect ? 1 : 0),
      falseClaims: profile.falseClaims + (wasCorrect ? 0 : 1),
      reliability: clamp(
        (profile.verifiedClaims + (wasCorrect ? 1 : 0)) /
        Math.max(profile.totalClaims + 1, 1),
        0, 1,
      ),
      lastUpdated: Date.now(),
    }
    this.sources.set(sourceId, updated)
  }

  /** Get all source profiles. */
  getSources(): readonly SourceProfile[] {
    return [...this.sources.values()]
  }

  // ── Claim extraction ───────────────────────────────────────────────────

  /** Extract verifiable claims from text. */
  extractClaims(text: string): Claim[] {
    const claims: Claim[] = []
    const seen = new Set<string>()

    // Pattern-based extraction
    for (const pattern of CLAIM_PATTERNS) {
      // Reset the regex lastIndex for each pattern
      pattern.lastIndex = 0
      let match
      while ((match = pattern.exec(text)) !== null) {
        const claimText = match[1].trim()
        if (claimText.length < 10 || claimText.length > 500) continue
        if (seen.has(claimText.toLowerCase())) continue
        seen.add(claimText.toLowerCase())

        const lower = claimText.toLowerCase()
        const isQuantitative = QUANTITATIVE_SIGNALS.some(s => lower.includes(s))

        claims.push({
          id: generateId(),
          text: claimText,
          domain: detectDomain(claimText),
          entities: extractEntities(claimText),
          isQuantitative,
          confidence: 0.7,
          extractedFrom: text.slice(0, 100),
        })
      }
    }

    // Sentence-level fallback: split on period and check for claim-like structure
    if (claims.length === 0) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15)
      for (const sentence of sentences.slice(0, 5)) {
        const trimmed = sentence.trim()
        if (seen.has(trimmed.toLowerCase())) continue
        seen.add(trimmed.toLowerCase())

        const lower = trimmed.toLowerCase()
        const hasVerb = /\b(is|are|was|were|has|have|can|will|does|do)\b/.test(lower)
        if (!hasVerb) continue

        claims.push({
          id: generateId(),
          text: trimmed,
          domain: detectDomain(trimmed),
          entities: extractEntities(trimmed),
          isQuantitative: QUANTITATIVE_SIGNALS.some(s => lower.includes(s)),
          confidence: 0.5,
          extractedFrom: text.slice(0, 100),
        })
      }
    }

    return claims
  }

  // ── Verification ───────────────────────────────────────────────────────

  /** Verify a single claim against the knowledge base. */
  verifyClaim(claim: Claim): VerificationResult {
    this.stats.totalClaimsVerified++

    const supportingEvidence: VerificationEvidence[] = []
    const contradictingEvidence: VerificationEvidence[] = []

    // Search knowledge base for related facts
    for (const fact of this.facts.values()) {
      const similarity = computeTextSimilarity(claim.text, fact.statement)
      if (similarity < 0.2) continue

      const relevance = similarity
      const sourceProfile = this.sources.get(fact.source)
      const sourceReliability = sourceProfile ? sourceProfile.reliability : 0.5

      // Determine if the fact supports or contradicts the claim
      const supports = this.determineSupport(claim.text, fact.statement)

      const evidence: VerificationEvidence = {
        sourceId: fact.source,
        text: fact.statement,
        supports,
        strength: fact.reliability * sourceReliability,
        relevance,
      }

      if (supports) {
        supportingEvidence.push(evidence)
      } else {
        contradictingEvidence.push(evidence)
      }
    }

    // Compute verdict
    const { verdict, confidence } = this.computeVerdict(supportingEvidence, contradictingEvidence)
    const explanation = this.generateExplanation(claim, verdict, supportingEvidence, contradictingEvidence)
    const correction = verdict === 'false' || verdict === 'likely_false'
      ? this.suggestCorrection(claim, contradictingEvidence)
      : null

    this.stats.totalConfidence += confidence
    this.stats.verdictCounts[verdict]++

    return {
      claim,
      verdict,
      confidence,
      supportingEvidence: supportingEvidence.sort((a, b) => b.strength - a.strength).slice(0, 5),
      contradictingEvidence: contradictingEvidence.sort((a, b) => b.strength - a.strength).slice(0, 5),
      explanation,
      suggestedCorrection: correction,
    }
  }

  /** Verify all claims in a text. */
  verifyText(text: string): VerificationResult[] {
    const claims = this.extractClaims(text)
    return claims.map(claim => this.verifyClaim(claim))
  }

  private determineSupport(claimText: string, factText: string): boolean {
    const claimTokens = new Set(tokenize(claimText))
    const factTokens = new Set(tokenize(factText))

    // Check for negation signals
    const claimHasNegation = /\b(not|no|never|none|neither|nor|isn't|aren't|wasn't|weren't|doesn't|don't)\b/.test(claimText.toLowerCase())
    const factHasNegation = /\b(not|no|never|none|neither|nor|isn't|aren't|wasn't|weren't|doesn't|don't)\b/.test(factText.toLowerCase())

    // If one has negation and the other doesn't, they likely contradict
    if (claimHasNegation !== factHasNegation) return false

    // High overlap suggests support
    let overlap = 0
    for (const token of claimTokens) {
      if (factTokens.has(token)) overlap++
    }
    return overlap / Math.max(claimTokens.size, 1) > 0.3
  }

  private computeVerdict(
    supporting: VerificationEvidence[],
    contradicting: VerificationEvidence[],
  ): { verdict: Verdict; confidence: number } {
    if (supporting.length === 0 && contradicting.length === 0) {
      return { verdict: 'unverifiable', confidence: 0 }
    }

    const supportScore = supporting.reduce((sum, e) => sum + e.strength * e.relevance, 0)
    const contradictScore = contradicting.reduce((sum, e) => sum + e.strength * e.relevance, 0)
    const totalScore = supportScore + contradictScore

    if (totalScore === 0) {
      return { verdict: 'unverifiable', confidence: 0 }
    }

    const supportRatio = supportScore / totalScore
    const totalEvidence = supporting.length + contradicting.length
    const evidenceBonus = Math.min(totalEvidence / (this.config.minEvidenceForVerdict * 2), 0.2)
    const confidence = clamp(Math.abs(supportRatio - 0.5) * 2 + evidenceBonus, 0, 1)

    let verdict: Verdict
    if (supportRatio >= this.config.verifiedThreshold) {
      verdict = 'verified'
    } else if (supportRatio >= this.config.likelyTrueThreshold) {
      verdict = 'likely_true'
    } else if (supportRatio <= 1 - this.config.verifiedThreshold) {
      verdict = 'false'
    } else if (supportRatio <= 1 - this.config.likelyTrueThreshold) {
      verdict = 'likely_false'
    } else {
      verdict = 'uncertain'
    }

    return { verdict, confidence }
  }

  private generateExplanation(
    claim: Claim,
    verdict: Verdict,
    supporting: VerificationEvidence[],
    contradicting: VerificationEvidence[],
  ): string {
    const parts: string[] = [`Claim: "${claim.text.slice(0, 80)}"`]

    switch (verdict) {
      case 'verified':
        parts.push(`Verdict: VERIFIED — supported by ${supporting.length} source(s)`)
        break
      case 'likely_true':
        parts.push(`Verdict: LIKELY TRUE — mostly supported with ${supporting.length} source(s)`)
        break
      case 'uncertain':
        parts.push(`Verdict: UNCERTAIN — mixed evidence (${supporting.length} supporting, ${contradicting.length} contradicting)`)
        break
      case 'likely_false':
        parts.push(`Verdict: LIKELY FALSE — mostly contradicted by ${contradicting.length} source(s)`)
        break
      case 'false':
        parts.push(`Verdict: FALSE — contradicted by ${contradicting.length} source(s)`)
        break
      case 'unverifiable':
        parts.push('Verdict: UNVERIFIABLE — no relevant evidence found')
        break
    }

    if (supporting.length > 0) {
      parts.push(`Top supporting evidence: "${supporting[0].text.slice(0, 80)}"`)
    }
    if (contradicting.length > 0) {
      parts.push(`Top contradicting evidence: "${contradicting[0].text.slice(0, 80)}"`)
    }

    return parts.join('. ')
  }

  private suggestCorrection(claim: Claim, contradicting: VerificationEvidence[]): string | null {
    if (contradicting.length === 0) return null
    const best = contradicting.sort((a, b) => b.strength * b.relevance - a.strength * a.relevance)[0]
    return `Consider: "${best.text.slice(0, 200)}" (from source: ${best.sourceId})`
  }

  // ── Contradiction detection ────────────────────────────────────────────

  /** Check for contradictions among known facts. */
  detectContradictions(): Contradiction[] {
    const newContradictions: Contradiction[] = []
    const factList = [...this.facts.values()]

    for (let i = 0; i < factList.length; i++) {
      for (let j = i + 1; j < factList.length; j++) {
        const similarity = computeTextSimilarity(factList[i].statement, factList[j].statement)
        if (similarity < 0.3) continue

        // Check if one negates the other
        const oneNegated = this.hasNegation(factList[i].statement) !== this.hasNegation(factList[j].statement)
        if (!oneNegated) continue

        const severity = similarity * Math.max(factList[i].reliability, factList[j].reliability)
        const contradiction: Contradiction = {
          claim1: factList[i].statement,
          claim2: factList[j].statement,
          type: 'direct',
          severity,
          explanation: `These facts appear to contradict each other (similarity: ${(similarity * 100).toFixed(0)}%)`,
        }
        newContradictions.push(contradiction)
      }
    }

    this.contradictions.push(...newContradictions)
    this.stats.contradictionsDetected += newContradictions.length

    // Keep only recent contradictions
    while (this.contradictions.length > 100) {
      this.contradictions.shift()
    }

    return newContradictions
  }

  private hasNegation(text: string): boolean {
    return /\b(not|no|never|none|neither|nor|isn't|aren't|wasn't|weren't|doesn't|don't|cannot|can't|won't)\b/i.test(text)
  }

  /** Get all detected contradictions. */
  getContradictions(): readonly Contradiction[] {
    return [...this.contradictions]
  }

  // ── Statistics ─────────────────────────────────────────────────────────

  /** Get runtime statistics. */
  getStats(): Readonly<FactVerificationEngineStats> {
    return {
      totalClaimsVerified: this.stats.totalClaimsVerified,
      totalFactsStored: this.facts.size,
      totalSourcesTracked: this.sources.size,
      avgVerificationConfidence: this.stats.totalClaimsVerified > 0
        ? this.stats.totalConfidence / this.stats.totalClaimsVerified
        : 0,
      contradictionsDetected: this.stats.contradictionsDetected,
      verdictDistribution: { ...this.stats.verdictCounts },
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────

  /** Serialize engine state for persistence. */
  serialize(): string {
    return JSON.stringify({
      facts: [...this.facts.values()],
      sources: [...this.sources.values()],
      contradictions: this.contradictions,
      stats: this.stats,
    })
  }

  /** Restore engine state from serialized data. */
  static deserialize(json: string, config?: Partial<FactVerificationEngineConfig>): FactVerificationEngine {
    const engine = new FactVerificationEngine(config)
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.facts)) {
        for (const f of data.facts) engine.facts.set(f.id, f)
      }
      if (Array.isArray(data.sources)) {
        for (const s of data.sources) engine.sources.set(s.id, s)
      }
      if (Array.isArray(data.contradictions)) {
        engine.contradictions.push(...data.contradictions)
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
