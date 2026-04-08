/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SelfModelEngine — Introspective self-awareness & capability mapping       ║
 * ║                                                                            ║
 * ║  Maintains a model of the AI's own capabilities, limitations,              ║
 * ║  knowledge boundaries, and uncertainty. Enables "know what I know"         ║
 * ║  and "know what I don't know" reasoning for better decisions.              ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Capability registry with proficiency levels                           ║
 * ║    • Knowledge boundary mapping (known/unknown/uncertain)                  ║
 * ║    • Uncertainty quantification per domain                                ║
 * ║    • Limitation awareness and honest disclosure                           ║
 * ║    • Competence estimation for incoming tasks                             ║
 * ║    • Metacognitive confidence calibration                                 ║
 * ║    • Capability gap detection and growth tracking                         ║
 * ║    • Self-assessment with evidence                                        ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProficiencyLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type KnowledgeState = 'known' | 'partially_known' | 'uncertain' | 'unknown' | 'known_unknown'

export interface Capability {
  readonly id: string
  readonly domain: string
  readonly skill: string
  readonly proficiency: ProficiencyLevel
  readonly confidence: number   // 0-1 how confident in this self-assessment
  readonly evidence: string[]
  readonly lastTestedAt: number
  readonly successRate: number  // historical success in this area
  readonly sampleSize: number
}

export interface KnowledgeBoundary {
  readonly domain: string
  readonly state: KnowledgeState
  readonly coverage: number   // 0-1 how much of the domain is covered
  readonly gaps: string[]
  readonly strengths: string[]
  readonly lastAssessedAt: number
}

export interface Limitation {
  readonly id: string
  readonly category: LimitationCategory
  readonly description: string
  readonly severity: number    // 0-1
  readonly workaround: string | null
  readonly isTransient: boolean
}

export type LimitationCategory =
  | 'knowledge_cutoff'
  | 'reasoning_depth'
  | 'context_length'
  | 'real_time_data'
  | 'computation'
  | 'multimodal'
  | 'personalization'
  | 'creativity'
  | 'reliability'

export interface CompetenceEstimate {
  readonly taskDescription: string
  readonly estimatedProficiency: ProficiencyLevel
  readonly confidence: number
  readonly relevantCapabilities: Capability[]
  readonly knownGaps: string[]
  readonly recommendation: 'proceed' | 'proceed_with_caution' | 'seek_help' | 'decline'
  readonly reasoning: string
}

export interface UncertaintyMap {
  readonly domain: string
  readonly overallUncertainty: number  // 0-1
  readonly factors: Array<{ factor: string; uncertainty: number }>
}

export interface GrowthRecord {
  readonly domain: string
  readonly previousProficiency: ProficiencyLevel
  readonly currentProficiency: ProficiencyLevel
  readonly timestamp: number
  readonly trigger: string
}

export interface SelfAssessment {
  readonly timestamp: number
  readonly overallCompetence: number
  readonly topStrengths: string[]
  readonly topWeaknesses: string[]
  readonly uncertainDomains: string[]
  readonly confidenceCalibration: number
  readonly growthAreas: string[]
}

export interface SelfModelEngineConfig {
  readonly maxCapabilities: number
  readonly maxLimitations: number
  readonly maxGrowthRecords: number
  readonly confidenceDecayPerDay: number
  readonly minSamplesForReliable: number
  readonly assessmentInterval: number  // ms between auto-assessments
}

export interface SelfModelEngineStats {
  readonly totalCapabilities: number
  readonly totalLimitations: number
  readonly totalCompetenceChecks: number
  readonly totalGrowthEvents: number
  readonly avgConfidence: number
  readonly knownDomains: number
  readonly uncertainDomains: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_SELF_MODEL_CONFIG: SelfModelEngineConfig = {
  maxCapabilities: 500,
  maxLimitations: 100,
  maxGrowthRecords: 200,
  confidenceDecayPerDay: 0.01,
  minSamplesForReliable: 5,
  assessmentInterval: 3600000,  // 1 hour
}

const PROFICIENCY_SCORES: Record<ProficiencyLevel, number> = {
  novice: 0.1,
  beginner: 0.3,
  intermediate: 0.5,
  advanced: 0.7,
  expert: 0.9,
}

const PROFICIENCY_FROM_SCORE = (score: number): ProficiencyLevel => {
  if (score >= 0.85) return 'expert'
  if (score >= 0.65) return 'advanced'
  if (score >= 0.45) return 'intermediate'
  if (score >= 0.25) return 'beginner'
  return 'novice'
}

/** Built-in limitations of an AI system. */
const BUILT_IN_LIMITATIONS: Omit<Limitation, 'id'>[] = [
  { category: 'knowledge_cutoff', description: 'Training data has a temporal cutoff', severity: 0.6, workaround: 'Clearly state knowledge cutoff date', isTransient: false },
  { category: 'real_time_data', description: 'Cannot access real-time data', severity: 0.5, workaround: 'Request user to provide current data', isTransient: false },
  { category: 'computation', description: 'Limited computational resources for complex math', severity: 0.4, workaround: 'Break into smaller steps', isTransient: false },
  { category: 'context_length', description: 'Limited context window', severity: 0.3, workaround: 'Summarize and prioritize context', isTransient: false },
  { category: 'multimodal', description: 'Limited multimodal understanding', severity: 0.3, workaround: 'Request text descriptions of non-text content', isTransient: false },
  { category: 'reliability', description: 'May generate plausible but incorrect information', severity: 0.7, workaround: 'Always verify important facts', isTransient: false },
  { category: 'personalization', description: 'No persistent memory across sessions by default', severity: 0.4, workaround: 'Use explicit context in each session', isTransient: true },
  { category: 'creativity', description: 'Creative output is pattern-based, not truly novel', severity: 0.3, workaround: 'Combine multiple approaches for originality', isTransient: false },
]

/** Domain keyword detection. */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  programming: ['code', 'function', 'class', 'algorithm', 'api', 'debug', 'refactor', 'compile'],
  security: ['vulnerability', 'exploit', 'attack', 'defense', 'encryption', 'firewall', 'pentest'],
  trading: ['market', 'stock', 'trade', 'price', 'indicator', 'strategy', 'portfolio', 'forex'],
  math: ['equation', 'proof', 'theorem', 'calculate', 'formula', 'matrix', 'integral'],
  language: ['grammar', 'translation', 'morphology', 'syntax', 'semantic', 'linguistic'],
  science: ['theory', 'experiment', 'hypothesis', 'research', 'observation', 'data'],
  general: ['explain', 'describe', 'what', 'how', 'why', 'tell me'],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function detectDomains(text: string): string[] {
  const lower = text.toLowerCase()
  const matches: Array<{ domain: string; score: number }> = []
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0)
    if (score > 0) matches.push({ domain, score })
  }
  return matches.sort((a, b) => b.score - a.score).map(m => m.domain)
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class SelfModelEngine {
  private readonly config: SelfModelEngineConfig
  private readonly capabilities: Map<string, Capability> = new Map()
  private readonly boundaries: Map<string, KnowledgeBoundary> = new Map()
  private readonly limitations: Map<string, Limitation> = new Map()
  private readonly growthRecords: GrowthRecord[] = []
  private stats = {
    totalCompetenceChecks: 0,
    totalGrowthEvents: 0,
  }

  constructor(config: Partial<SelfModelEngineConfig> = {}) {
    this.config = { ...DEFAULT_SELF_MODEL_CONFIG, ...config }
    this.initializeBuiltInLimitations()
  }

  private initializeBuiltInLimitations(): void {
    for (const lim of BUILT_IN_LIMITATIONS) {
      const limitation: Limitation = { id: generateId('lim'), ...lim }
      this.limitations.set(limitation.id, limitation)
    }
  }

  // ── Capability management ──────────────────────────────────────────────

  /** Register or update a capability. */
  registerCapability(domain: string, skill: string, proficiency: ProficiencyLevel, evidence: string[] = []): Capability {
    const key = `${domain}::${skill}`
    const existing = this.findCapability(domain, skill)

    if (existing) {
      // Track growth
      if (PROFICIENCY_SCORES[proficiency] > PROFICIENCY_SCORES[existing.proficiency]) {
        this.growthRecords.push({
          domain,
          previousProficiency: existing.proficiency,
          currentProficiency: proficiency,
          timestamp: Date.now(),
          trigger: evidence[0] ?? 'manual update',
        })
        this.stats.totalGrowthEvents++
      }
    }

    const capability: Capability = {
      id: existing?.id ?? generateId('cap'),
      domain,
      skill,
      proficiency,
      confidence: 0.8,
      evidence: [...(existing?.evidence ?? []), ...evidence].slice(-10),
      lastTestedAt: Date.now(),
      successRate: existing?.successRate ?? 0.7,
      sampleSize: existing?.sampleSize ?? 0,
    }

    this.capabilities.set(key, capability)

    // Enforce max
    if (this.capabilities.size > this.config.maxCapabilities) {
      const oldest = [...this.capabilities.entries()]
        .sort(([, a], [, b]) => a.lastTestedAt - b.lastTestedAt)[0]
      if (oldest) this.capabilities.delete(oldest[0])
    }

    // Update knowledge boundary
    this.updateBoundary(domain)

    return capability
  }

  /** Find a capability by domain and skill. */
  findCapability(domain: string, skill: string): Capability | null {
    return this.capabilities.get(`${domain}::${skill}`) ?? null
  }

  /** Get all capabilities in a domain. */
  getCapabilitiesByDomain(domain: string): Capability[] {
    return [...this.capabilities.values()].filter(c => c.domain === domain)
  }

  /** Get all capabilities. */
  getAllCapabilities(): readonly Capability[] {
    return [...this.capabilities.values()]
  }

  /** Record a success or failure for a capability. */
  recordOutcome(domain: string, skill: string, success: boolean): void {
    const cap = this.findCapability(domain, skill)
    if (!cap) {
      // Auto-register on first encounter
      this.registerCapability(domain, skill, success ? 'beginner' : 'novice', [success ? 'first success' : 'first attempt failed'])
      return
    }

    const newSize = cap.sampleSize + 1
    const newRate = (cap.successRate * cap.sampleSize + (success ? 1 : 0)) / newSize

    const key = `${domain}::${skill}`
    const updated: Capability = {
      ...cap,
      successRate: newRate,
      sampleSize: newSize,
      lastTestedAt: Date.now(),
      proficiency: newSize >= this.config.minSamplesForReliable ? PROFICIENCY_FROM_SCORE(newRate) : cap.proficiency,
    }

    this.capabilities.set(key, updated)
    this.updateBoundary(domain)
  }

  // ── Knowledge boundaries ───────────────────────────────────────────────

  /** Update the knowledge boundary for a domain. */
  private updateBoundary(domain: string): void {
    const caps = this.getCapabilitiesByDomain(domain)
    if (caps.length === 0) return

    const avgProf = caps.reduce((s, c) => s + PROFICIENCY_SCORES[c.proficiency], 0) / caps.length
    const strengths = caps.filter(c => PROFICIENCY_SCORES[c.proficiency] >= 0.7).map(c => c.skill)
    const gaps = caps.filter(c => PROFICIENCY_SCORES[c.proficiency] <= 0.3).map(c => c.skill)

    let state: KnowledgeState
    if (avgProf >= 0.7) state = 'known'
    else if (avgProf >= 0.5) state = 'partially_known'
    else if (avgProf >= 0.3) state = 'uncertain'
    else state = 'unknown'

    this.boundaries.set(domain, {
      domain,
      state,
      coverage: avgProf,
      gaps,
      strengths,
      lastAssessedAt: Date.now(),
    })
  }

  /** Get knowledge boundary for a domain. */
  getBoundary(domain: string): KnowledgeBoundary | null {
    return this.boundaries.get(domain) ?? null
  }

  /** Get all knowledge boundaries. */
  getAllBoundaries(): readonly KnowledgeBoundary[] {
    return [...this.boundaries.values()]
  }

  // ── Limitation management ──────────────────────────────────────────────

  /** Add a custom limitation. */
  addLimitation(category: LimitationCategory, description: string, severity: number, workaround?: string): Limitation {
    const limitation: Limitation = {
      id: generateId('lim'),
      category,
      description,
      severity: clamp(severity, 0, 1),
      workaround: workaround ?? null,
      isTransient: false,
    }

    this.limitations.set(limitation.id, limitation)

    // Enforce max
    if (this.limitations.size > this.config.maxLimitations) {
      // Remove least severe
      const least = [...this.limitations.entries()]
        .sort(([, a], [, b]) => a.severity - b.severity)[0]
      if (least) this.limitations.delete(least[0])
    }

    return limitation
  }

  /** Get all limitations. */
  getLimitations(): readonly Limitation[] {
    return [...this.limitations.values()]
  }

  /** Get limitations by category. */
  getLimitationsByCategory(category: LimitationCategory): Limitation[] {
    return [...this.limitations.values()].filter(l => l.category === category)
  }

  // ── Competence estimation ──────────────────────────────────────────────

  /** Estimate competence for a given task. */
  estimateCompetence(taskDescription: string): CompetenceEstimate {
    this.stats.totalCompetenceChecks++

    const domains = detectDomains(taskDescription)
    const relevantCaps: Capability[] = []
    const knownGaps: string[] = []

    for (const domain of domains) {
      const caps = this.getCapabilitiesByDomain(domain)
      relevantCaps.push(...caps)

      const boundary = this.getBoundary(domain)
      if (boundary) {
        knownGaps.push(...boundary.gaps)
      }
    }

    // Compute estimated proficiency
    let avgScore = 0.5
    if (relevantCaps.length > 0) {
      avgScore = relevantCaps.reduce((s, c) => s + PROFICIENCY_SCORES[c.proficiency], 0) / relevantCaps.length
    }

    const proficiency = PROFICIENCY_FROM_SCORE(avgScore)
    const confidence = relevantCaps.length > 0
      ? Math.min(1, relevantCaps.length / 5) * 0.8
      : 0.2

    let recommendation: CompetenceEstimate['recommendation']
    if (avgScore >= 0.7 && confidence >= 0.6) recommendation = 'proceed'
    else if (avgScore >= 0.4) recommendation = 'proceed_with_caution'
    else if (avgScore >= 0.2) recommendation = 'seek_help'
    else recommendation = 'decline'

    const reasoning = relevantCaps.length > 0
      ? `Found ${relevantCaps.length} relevant capabilities with avg proficiency ${(avgScore * 100).toFixed(0)}%`
      : `No specific capabilities registered for domains: ${domains.join(', ')}`

    return {
      taskDescription,
      estimatedProficiency: proficiency,
      confidence,
      relevantCapabilities: relevantCaps,
      knownGaps,
      recommendation,
      reasoning,
    }
  }

  // ── Uncertainty mapping ────────────────────────────────────────────────

  /** Get an uncertainty map for a domain. */
  getUncertaintyMap(domain: string): UncertaintyMap {
    const caps = this.getCapabilitiesByDomain(domain)
    const factors: Array<{ factor: string; uncertainty: number }> = []

    for (const cap of caps) {
      const uncertainty = 1 - PROFICIENCY_SCORES[cap.proficiency] * cap.confidence
      factors.push({ factor: cap.skill, uncertainty })
    }

    const overall = factors.length > 0
      ? factors.reduce((s, f) => s + f.uncertainty, 0) / factors.length
      : 0.8

    return { domain, overallUncertainty: overall, factors }
  }

  // ── Self-assessment ────────────────────────────────────────────────────

  /** Perform a comprehensive self-assessment. */
  selfAssess(): SelfAssessment {
    const allCaps = [...this.capabilities.values()]
    const allBounds = [...this.boundaries.values()]

    const overallCompetence = allCaps.length > 0
      ? allCaps.reduce((s, c) => s + PROFICIENCY_SCORES[c.proficiency], 0) / allCaps.length
      : 0

    const topStrengths = allCaps
      .filter(c => PROFICIENCY_SCORES[c.proficiency] >= 0.7)
      .sort((a, b) => PROFICIENCY_SCORES[b.proficiency] - PROFICIENCY_SCORES[a.proficiency])
      .slice(0, 5)
      .map(c => `${c.domain}: ${c.skill}`)

    const topWeaknesses = allCaps
      .filter(c => PROFICIENCY_SCORES[c.proficiency] <= 0.3)
      .sort((a, b) => PROFICIENCY_SCORES[a.proficiency] - PROFICIENCY_SCORES[b.proficiency])
      .slice(0, 5)
      .map(c => `${c.domain}: ${c.skill}`)

    const uncertainDomains = allBounds
      .filter(b => b.state === 'uncertain' || b.state === 'unknown')
      .map(b => b.domain)

    const avgConfidence = allCaps.length > 0
      ? allCaps.reduce((s, c) => s + c.confidence, 0) / allCaps.length
      : 0

    const growthAreas = this.growthRecords
      .slice(-10)
      .map(g => `${g.domain}: ${g.previousProficiency} → ${g.currentProficiency}`)

    return {
      timestamp: Date.now(),
      overallCompetence,
      topStrengths,
      topWeaknesses,
      uncertainDomains,
      confidenceCalibration: avgConfidence,
      growthAreas,
    }
  }

  // ── Growth tracking ────────────────────────────────────────────────────

  /** Get growth records. */
  getGrowthRecords(): readonly GrowthRecord[] {
    return [...this.growthRecords]
  }

  // ── Stats ──────────────────────────────────────────────────────────────

  getStats(): Readonly<SelfModelEngineStats> {
    const allCaps = [...this.capabilities.values()]
    const allBounds = [...this.boundaries.values()]

    return {
      totalCapabilities: this.capabilities.size,
      totalLimitations: this.limitations.size,
      totalCompetenceChecks: this.stats.totalCompetenceChecks,
      totalGrowthEvents: this.stats.totalGrowthEvents,
      avgConfidence: allCaps.length > 0
        ? allCaps.reduce((s, c) => s + c.confidence, 0) / allCaps.length
        : 0,
      knownDomains: allBounds.filter(b => b.state === 'known' || b.state === 'partially_known').length,
      uncertainDomains: allBounds.filter(b => b.state === 'uncertain' || b.state === 'unknown').length,
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      capabilities: [...this.capabilities.entries()],
      boundaries: [...this.boundaries.entries()],
      limitations: [...this.limitations.values()],
      growthRecords: this.growthRecords,
      stats: this.stats,
    })
  }

  static deserialize(json: string, config?: Partial<SelfModelEngineConfig>): SelfModelEngine {
    const engine = new SelfModelEngine(config)
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.capabilities)) {
        for (const [key, cap] of data.capabilities) engine.capabilities.set(key, cap)
      }
      if (Array.isArray(data.boundaries)) {
        for (const [key, bound] of data.boundaries) engine.boundaries.set(key, bound)
      }
      // Don't overwrite built-in limitations, just add custom ones
      if (Array.isArray(data.limitations)) {
        for (const lim of data.limitations) {
          if (!engine.limitations.has(lim.id)) engine.limitations.set(lim.id, lim)
        }
      }
      if (Array.isArray(data.growthRecords)) {
        engine.growthRecords.push(...data.growthRecords)
      }
      if (data.stats) Object.assign(engine.stats, data.stats)
    } catch { /* fresh engine on failure */ }
    return engine
  }
}
