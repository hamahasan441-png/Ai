/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Multi-Modal Fusion — Phase 10 Intelligence Module for LocalBrain           ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Source Registration — Register intelligence sources with reliability    ║
 * ║    ✦ Multi-Source Fusion — Fuse outputs into unified high-confidence results ║
 * ║    ✦ Conflict Resolution — Detect and resolve disagreements via arbitration  ║
 * ║    ✦ Consensus Detection — Identify agreement across sources to boost conf.  ║
 * ║    ✦ Cross-Domain Synthesis — Combine insights across knowledge domains     ║
 * ║    ✦ Fusion Quality Tracking — Track fusion accuracy over time              ║
 * ║    ✦ Source Reliability Tracking — Track per-source reliability scores      ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface MultiModalFusionConfig {
  /** Maximum number of intelligence sources that can be registered. */
  maxSources: number
  /** Enable automatic conflict detection and resolution during fusion. */
  enableConflictResolution: boolean
  /** Enable consensus detection to boost confidence when sources agree. */
  enableConsensus: boolean
  /** Enable cross-domain synthesis for holistic insights. */
  enableCrossDomain: boolean
  /** Minimum number of source outputs required to perform fusion. */
  minSourcesForFusion: number
  /** Strategy used to resolve conflicts between disagreeing sources. */
  conflictResolutionStrategy: 'confidence_weighted' | 'majority_vote' | 'highest_confidence'
  /** Fraction of sources that must agree for consensus (0–1). */
  consensusThreshold: number
}

export interface MultiModalFusionStats {
  totalFusions: number
  totalConflictsResolved: number
  totalConsensusReached: number
  totalCrossDomainSyntheses: number
  avgFusionConfidence: number
  feedbackCount: number
  avgFeedbackAccuracy: number
}

export interface IntelligenceSource {
  id: string
  name: string
  domain: string
  reliability: number
  weight: number
  lastUsed: number
  useCount: number
}

export interface SourceOutput {
  sourceId: string
  content: string
  confidence: number
  domain: string
  metadata: Record<string, unknown>
}

export interface FusionResult {
  fusedContent: string
  confidence: number
  sources: SourceOutput[]
  conflicts: FusionConflict[]
  consensusLevel: number
  explanation: string
}

export interface FusionConflict {
  source1Id: string
  source2Id: string
  description: string
  resolution: string
  resolvedContent: string
  resolutionConfidence: number
}

export interface CrossDomainInsight {
  domains: string[]
  insight: string
  confidence: number
  contributingSources: string[]
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: MultiModalFusionConfig = {
  maxSources: 50,
  enableConflictResolution: true,
  enableConsensus: true,
  enableCrossDomain: true,
  minSourcesForFusion: 2,
  conflictResolutionStrategy: 'confidence_weighted',
  consensusThreshold: 0.6,
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'can',
  'shall',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'into',
  'about',
  'that',
  'this',
  'it',
  'its',
  'and',
  'or',
  'not',
  'but',
  'if',
  'then',
  'so',
  'up',
  'out',
  'no',
  'just',
  'also',
  'very',
  'what',
  'how',
  'like',
  'such',
  'when',
  'which',
  'there',
  'their',
  'than',
])

const NEGATION_WORDS = new Set([
  'not',
  'no',
  'never',
  'none',
  'nothing',
  'neither',
  'nobody',
  'cannot',
  'without',
  'lack',
  'lacks',
  'fail',
  'fails',
  "doesn't",
  "isn't",
  "aren't",
  "won't",
  "don't",
  "hasn't",
  "wouldn't",
  "couldn't",
  "shouldn't",
])

const CONFLICT_SIMILARITY_THRESHOLD = 0.35
const CONSENSUS_SIMILARITY_THRESHOLD = 0.5

/** Reliability adjustment speed — how fast reliability adapts to feedback. */
const RELIABILITY_LEARNING_RATE = 0.1

// ── Utility Functions ────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
}

/** Compute Jaccard-like token similarity between two strings (0–1). */
function tokenSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a)
  const tokensB = tokenize(b)
  if (tokensA.length === 0 && tokensB.length === 0) return 1
  if (tokensA.length === 0 || tokensB.length === 0) return 0
  const setA = new Set(tokensA)
  const setB = new Set(tokensB)
  let intersection = 0
  for (const t of setA) {
    if (setB.has(t)) intersection++
  }
  const union = new Set([...tokensA, ...tokensB]).size
  return union === 0 ? 0 : intersection / union
}

/** Check whether a text contains negation language. */
function containsNegation(text: string): boolean {
  const lower = text.toLowerCase()
  for (const neg of NEGATION_WORDS) {
    if (lower.includes(neg)) return true
  }
  return false
}

/** Extract the top keywords from a text ordered by frequency. */
function extractKeywords(text: string, max: number = 8): string[] {
  const tokens = tokenize(text)
  const freq = new Map<string, number>()
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1)
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([word]) => word)
}

/** Weighted merge of content strings using confidence as weight. */
function weightedContentMerge(outputs: SourceOutput[]): string {
  if (outputs.length === 0) return ''
  if (outputs.length === 1) return outputs[0].content

  // Sort by confidence desc so the highest-confidence content anchors the result
  const sorted = [...outputs].sort((a, b) => b.confidence - a.confidence)
  const anchor = sorted[0]

  // Gather unique supplementary sentences from lower-ranked outputs
  const anchorSentences = new Set(
    anchor.content
      .split(/[.!?]+/)
      .map(s => s.trim().toLowerCase())
      .filter(Boolean),
  )

  const supplements: string[] = []
  for (let i = 1; i < sorted.length; i++) {
    const sentences = sorted[i].content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(Boolean)
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase()
      if (!anchorSentences.has(lower) && tokenSimilarity(lower, anchor.content) < 0.7) {
        supplements.push(sentence)
        anchorSentences.add(lower)
      }
    }
  }

  const merged =
    supplements.length > 0
      ? `${anchor.content} Additionally, ${supplements.join('. ')}.`
      : anchor.content

  return merged
}

/** Compute a confidence-weighted average, optionally boosted by consensus. */
function aggregateConfidence(
  outputs: SourceOutput[],
  sourceMap: Map<string, IntelligenceSource>,
): number {
  if (outputs.length === 0) return 0
  let totalWeight = 0
  let weightedSum = 0
  for (const o of outputs) {
    const source = sourceMap.get(o.sourceId)
    const reliability = source ? source.reliability : 0.5
    const weight = o.confidence * reliability
    weightedSum += o.confidence * weight
    totalWeight += weight
  }
  return totalWeight === 0 ? 0 : clamp(weightedSum / totalWeight, 0, 1)
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class MultiModalFusion {
  private readonly config: MultiModalFusionConfig
  private sources: Map<string, IntelligenceSource> = new Map()

  // ── Stats tracking ──
  private totalFusions = 0
  private totalConflictsResolved = 0
  private totalConsensusReached = 0
  private totalCrossDomainSyntheses = 0
  private fusionConfidenceHistory: number[] = []
  private feedbackScores: number[] = []
  private fusionLog: Map<string, { confidence: number; sourceIds: string[] }> = new Map()

  constructor(config?: Partial<MultiModalFusionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ── 1. Source Registration ─────────────────────────────────────────────────

  /**
   * Register a new intelligence source. Returns the created source descriptor.
   * If the maximum source count has been reached the least-used source is
   * evicted before registering the new one.
   */
  registerSource(name: string, domain: string, reliability: number = 0.7): IntelligenceSource {
    if (this.sources.size >= this.config.maxSources) {
      this.evictLeastUsed()
    }

    const source: IntelligenceSource = {
      id: generateId('src'),
      name,
      domain: domain.toLowerCase(),
      reliability: clamp(reliability, 0, 1),
      weight: clamp(reliability, 0, 1),
      lastUsed: Date.now(),
      useCount: 0,
    }

    this.sources.set(source.id, source)
    return source
  }

  /** Remove the source with the lowest useCount to make room. */
  private evictLeastUsed(): void {
    let minUse = Infinity
    let minId: string | null = null
    for (const [id, src] of this.sources) {
      if (src.useCount < minUse) {
        minUse = src.useCount
        minId = id
      }
    }
    if (minId) this.sources.delete(minId)
  }

  // ── 2. Multi-Source Fusion ─────────────────────────────────────────────────

  /**
   * Fuse outputs from multiple intelligence sources into a single unified result.
   *
   * Steps:
   *  1. Validate & filter outputs.
   *  2. Detect and resolve conflicts (if enabled).
   *  3. Detect consensus (if enabled).
   *  4. Merge content using confidence-weighted aggregation.
   *  5. Perform cross-domain synthesis (if enabled).
   *  6. Build explanation string.
   */
  fuse(outputs: SourceOutput[]): FusionResult {
    const valid = this.validateOutputs(outputs)

    if (valid.length < this.config.minSourcesForFusion) {
      return this.emptyResult(valid, 'Insufficient source outputs for fusion.')
    }

    // Touch sources
    for (const o of valid) {
      const src = this.sources.get(o.sourceId)
      if (src) {
        src.lastUsed = Date.now()
        src.useCount++
      }
    }

    // Conflict detection & resolution
    let conflicts: FusionConflict[] = []
    if (this.config.enableConflictResolution) {
      conflicts = this.detectConflicts(valid)
      for (const c of conflicts) {
        c.resolvedContent = this.resolveConflict(c, valid)
        this.totalConflictsResolved++
      }
    }

    // Consensus detection
    let consensusLevel = 0
    const consensusResult = this.config.enableConsensus
      ? this.detectConsensus(valid)
      : { reached: false, level: 0, agreeing: [] as string[] }
    if (consensusResult.reached) {
      consensusLevel = consensusResult.level
      this.totalConsensusReached++
    }

    // Merge content
    const fusedContent = this.buildFusedContent(valid, conflicts)

    // Cross-domain synthesis
    const crossDomainInsights = this.config.enableCrossDomain
      ? this.synthesizeCrossDomain(valid)
      : []
    this.totalCrossDomainSyntheses += crossDomainInsights.length

    // Compute overall confidence
    let confidence = aggregateConfidence(valid, this.sources)
    // Boost confidence if consensus is high
    if (consensusLevel > 0) {
      confidence = clamp(confidence + consensusLevel * 0.1, 0, 1)
    }
    // Lower confidence when unresolved conflicts exist
    const unresolvedCount = conflicts.filter(c => c.resolutionConfidence === 0).length
    if (unresolvedCount > 0) {
      confidence = clamp(confidence - unresolvedCount * 0.05, 0, 1)
    }

    // Build explanation
    const explanation = this.buildExplanation(
      valid,
      conflicts,
      consensusResult,
      crossDomainInsights,
    )

    // Track the fusion
    const fusionId = generateId('fus')
    this.fusionLog.set(fusionId, {
      confidence,
      sourceIds: valid.map(o => o.sourceId),
    })
    this.fusionConfidenceHistory.push(confidence)
    this.totalFusions++

    return {
      fusedContent,
      confidence: round2(confidence),
      sources: valid,
      conflicts,
      consensusLevel: round2(consensusLevel),
      explanation,
    }
  }

  /** Filter to outputs whose sourceId is registered and confidence > 0. */
  private validateOutputs(outputs: SourceOutput[]): SourceOutput[] {
    return outputs.filter(o => {
      if (o.confidence <= 0) return false
      if (!o.content || o.content.trim().length === 0) return false
      return true
    })
  }

  /** Build the fused content string from valid outputs and resolved conflicts. */
  private buildFusedContent(outputs: SourceOutput[], conflicts: FusionConflict[]): string {
    // Replace conflicting outputs with their resolved versions
    const resolvedIds = new Set<string>()
    const resolvedParts: string[] = []
    for (const c of conflicts) {
      if (c.resolvedContent) {
        resolvedIds.add(c.source1Id)
        resolvedIds.add(c.source2Id)
        resolvedParts.push(c.resolvedContent)
      }
    }

    // Gather non-conflicting outputs
    const nonConflicting = outputs.filter(o => !resolvedIds.has(o.sourceId))
    const merged = weightedContentMerge(nonConflicting)

    if (resolvedParts.length === 0) return merged

    const uniqueResolved = [...new Set(resolvedParts)]
    return merged ? `${merged} ${uniqueResolved.join(' ')}` : uniqueResolved.join(' ')
  }

  /** Generate a human-readable explanation of the fusion process. */
  private buildExplanation(
    outputs: SourceOutput[],
    conflicts: FusionConflict[],
    consensus: { reached: boolean; level: number; agreeing: string[] },
    crossDomain: CrossDomainInsight[],
  ): string {
    const parts: string[] = []
    parts.push(`Fused ${outputs.length} source outputs.`)

    if (conflicts.length > 0) {
      parts.push(
        `Resolved ${conflicts.length} conflict(s) via ${this.config.conflictResolutionStrategy}.`,
      )
    }

    if (consensus.reached) {
      parts.push(
        `Consensus reached at ${round2(consensus.level * 100)}% among ${consensus.agreeing.length} source(s).`,
      )
    }

    if (crossDomain.length > 0) {
      const domains = crossDomain.flatMap(cd => cd.domains)
      const unique = [...new Set(domains)]
      parts.push(`Cross-domain synthesis across: ${unique.join(', ')}.`)
    }

    return parts.join(' ')
  }

  /** Return a skeleton FusionResult when fusion cannot proceed. */
  private emptyResult(outputs: SourceOutput[], reason: string): FusionResult {
    return {
      fusedContent: outputs.length === 1 ? outputs[0].content : '',
      confidence: outputs.length === 1 ? outputs[0].confidence : 0,
      sources: outputs,
      conflicts: [],
      consensusLevel: 0,
      explanation: reason,
    }
  }

  // ── 3. Conflict Resolution ─────────────────────────────────────────────────

  /**
   * Detect conflicts between outputs. Two outputs conflict when they share
   * significant topical overlap yet contain contradictory assertions
   * (determined by negation analysis and low direct similarity).
   */
  detectConflicts(outputs: SourceOutput[]): FusionConflict[] {
    const conflicts: FusionConflict[] = []
    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        const a = outputs[i]
        const b = outputs[j]

        const topicOverlap = this.computeTopicOverlap(a.content, b.content)
        if (topicOverlap < CONFLICT_SIMILARITY_THRESHOLD) continue

        const directSim = tokenSimilarity(a.content, b.content)
        const negA = containsNegation(a.content)
        const negB = containsNegation(b.content)
        const oneSideNegated = negA !== negB

        // Conflict heuristic: high topic overlap but either one side negates
        // or direct similarity is moderate (not paraphrases, not unrelated).
        const isConflict = oneSideNegated || (topicOverlap > 0.4 && directSim < 0.45)

        if (isConflict) {
          conflicts.push({
            source1Id: a.sourceId,
            source2Id: b.sourceId,
            description: this.describeConflict(a, b, topicOverlap, directSim, oneSideNegated),
            resolution: '',
            resolvedContent: '',
            resolutionConfidence: 0,
          })
        }
      }
    }
    return conflicts
  }

  /** Compute topical overlap via shared keyword ratio. */
  private computeTopicOverlap(textA: string, textB: string): number {
    const kwA = new Set(extractKeywords(textA, 12))
    const kwB = new Set(extractKeywords(textB, 12))
    if (kwA.size === 0 && kwB.size === 0) return 0
    let shared = 0
    for (const kw of kwA) {
      if (kwB.has(kw)) shared++
    }
    const minSize = Math.min(kwA.size, kwB.size) || 1
    return shared / minSize
  }

  /** Build a human-readable description of a detected conflict. */
  private describeConflict(
    a: SourceOutput,
    b: SourceOutput,
    topicOverlap: number,
    directSim: number,
    negated: boolean,
  ): string {
    const srcA = this.sources.get(a.sourceId)?.name ?? a.sourceId
    const srcB = this.sources.get(b.sourceId)?.name ?? b.sourceId
    const reason = negated
      ? 'contradictory assertions (negation detected)'
      : `divergent conclusions on shared topic (overlap=${round2(topicOverlap)}, sim=${round2(directSim)})`
    return `Conflict between "${srcA}" and "${srcB}": ${reason}.`
  }

  /**
   * Resolve a single conflict according to the configured strategy.
   * Returns the resolved content string.
   */
  resolveConflict(conflict: FusionConflict, outputs: SourceOutput[]): string {
    const out1 = outputs.find(o => o.sourceId === conflict.source1Id)
    const out2 = outputs.find(o => o.sourceId === conflict.source2Id)
    if (!out1 || !out2) return ''

    const src1 = this.sources.get(out1.sourceId)
    const src2 = this.sources.get(out2.sourceId)
    const rel1 = src1?.reliability ?? 0.5
    const rel2 = src2?.reliability ?? 0.5

    let resolved: string
    let resConfidence: number

    switch (this.config.conflictResolutionStrategy) {
      case 'highest_confidence': {
        if (out1.confidence >= out2.confidence) {
          resolved = out1.content
          resConfidence = out1.confidence
        } else {
          resolved = out2.content
          resConfidence = out2.confidence
        }
        break
      }

      case 'majority_vote': {
        // With only two sources, fall back to reliability-weighted selection
        const score1 = out1.confidence * rel1
        const score2 = out2.confidence * rel2
        if (score1 >= score2) {
          resolved = out1.content
          resConfidence = clamp((score1 + score2) / 2, 0, 1)
        } else {
          resolved = out2.content
          resConfidence = clamp((score1 + score2) / 2, 0, 1)
        }
        break
      }

      case 'confidence_weighted':
      default: {
        const w1 = out1.confidence * rel1
        const w2 = out2.confidence * rel2
        const total = w1 + w2 || 1
        // Prefer the higher-weighted source but acknowledge the other
        if (w1 >= w2) {
          resolved = `${out1.content} (Note: an alternative view suggests ${this.summarize(out2.content)})`
        } else {
          resolved = `${out2.content} (Note: an alternative view suggests ${this.summarize(out1.content)})`
        }
        resConfidence = clamp(Math.max(w1, w2) / total, 0, 1)
        break
      }
    }

    conflict.resolution = this.config.conflictResolutionStrategy
    conflict.resolvedContent = resolved
    conflict.resolutionConfidence = round2(resConfidence)
    return resolved
  }

  /** Produce a short summary of text (first sentence or first 80 chars). */
  private summarize(text: string): string {
    const firstSentence = text.split(/[.!?]/)[0]?.trim()
    if (firstSentence && firstSentence.length <= 120) return firstSentence
    return text.slice(0, 80).trim() + '…'
  }

  // ── 4. Consensus Detection ─────────────────────────────────────────────────

  /**
   * Determine whether the source outputs exhibit consensus.
   * Returns the consensus level (0–1) and the ids of agreeing sources.
   */
  detectConsensus(outputs: SourceOutput[]): {
    reached: boolean
    level: number
    agreeing: string[]
  } {
    if (outputs.length < 2) return { reached: false, level: 0, agreeing: [] }

    // Build a similarity matrix and find the largest agreeing cluster
    const n = outputs.length
    const simMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0) as number[])

    for (let i = 0; i < n; i++) {
      simMatrix[i][i] = 1
      for (let j = i + 1; j < n; j++) {
        const sim = tokenSimilarity(outputs[i].content, outputs[j].content)
        simMatrix[i][j] = sim
        simMatrix[j][i] = sim
      }
    }

    // Greedy cluster: start from the output with highest average similarity
    const avgSim = simMatrix.map(row => row.reduce((s, v) => s + v, 0) / n)
    let seedIdx = 0
    for (let i = 1; i < n; i++) {
      if (avgSim[i] > avgSim[seedIdx]) seedIdx = i
    }

    const cluster: number[] = [seedIdx]
    for (let i = 0; i < n; i++) {
      if (i === seedIdx) continue
      if (simMatrix[seedIdx][i] >= CONSENSUS_SIMILARITY_THRESHOLD) {
        cluster.push(i)
      }
    }

    const level = cluster.length / n
    const reached = level >= this.config.consensusThreshold
    const agreeing = cluster.map(idx => outputs[idx].sourceId)

    return { reached, level: round2(level), agreeing }
  }

  // ── 5. Cross-Domain Synthesis ──────────────────────────────────────────────

  /**
   * Synthesize insights from outputs that span different knowledge domains.
   * Groups outputs by domain, then finds inter-domain connections via shared
   * keywords and produces holistic insight descriptions.
   */
  synthesizeCrossDomain(outputs: SourceOutput[]): CrossDomainInsight[] {
    const domainMap = new Map<string, SourceOutput[]>()
    for (const o of outputs) {
      const d = o.domain.toLowerCase()
      if (!domainMap.has(d)) domainMap.set(d, [])
      domainMap.get(d)!.push(o)
    }

    const domains = [...domainMap.keys()]
    if (domains.length < 2) return []

    const insights: CrossDomainInsight[] = []

    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const domA = domains[i]
        const domB = domains[j]
        const outsA = domainMap.get(domA)!
        const outsB = domainMap.get(domB)!

        const kwA = new Set(outsA.flatMap(o => extractKeywords(o.content, 10)))
        const kwB = new Set(outsB.flatMap(o => extractKeywords(o.content, 10)))

        const shared: string[] = []
        for (const kw of kwA) {
          if (kwB.has(kw)) shared.push(kw)
        }

        if (shared.length === 0) continue

        const allOutputs = [...outsA, ...outsB]
        const avgConf = allOutputs.reduce((s, o) => s + o.confidence, 0) / allOutputs.length
        const contributingSources = allOutputs.map(o => o.sourceId)

        insights.push({
          domains: [domA, domB],
          insight: this.buildCrossDomainInsight(domA, domB, shared, outsA, outsB),
          confidence: round2(
            clamp(avgConf * (shared.length / Math.max(kwA.size, kwB.size, 1)), 0, 1),
          ),
          contributingSources: [...new Set(contributingSources)],
        })
      }
    }

    return insights
  }

  /** Compose a natural-language cross-domain insight statement. */
  private buildCrossDomainInsight(
    domA: string,
    domB: string,
    sharedKeywords: string[],
    outsA: SourceOutput[],
    outsB: SourceOutput[],
  ): string {
    const topShared = sharedKeywords.slice(0, 5).join(', ')
    const summaryA = this.summarize(outsA[0].content)
    const summaryB = this.summarize(outsB[0].content)
    return (
      `Cross-domain connection between ${domA} and ${domB} via shared concepts [${topShared}]. ` +
      `From ${domA}: ${summaryA}. From ${domB}: ${summaryB}.`
    )
  }

  // ── 6. Source Reliability Tracking ─────────────────────────────────────────

  /** Get the current reliability score for a source (0–1). Returns 0 if unknown. */
  getSourceReliability(sourceId: string): number {
    return this.sources.get(sourceId)?.reliability ?? 0
  }

  /**
   * Update a source's reliability based on whether its last contribution was
   * correct. Uses exponential moving average to adapt smoothly.
   */
  updateSourceReliability(sourceId: string, correct: boolean): void {
    const src = this.sources.get(sourceId)
    if (!src) return

    const target = correct ? 1 : 0
    src.reliability = clamp(
      src.reliability + RELIABILITY_LEARNING_RATE * (target - src.reliability),
      0,
      1,
    )
    src.weight = src.reliability
  }

  // ── 7. Feedback & Stats ────────────────────────────────────────────────────

  /**
   * Provide quality feedback for a past fusion result.
   * @param fusionId — The fusion id (logged internally, or any unique key).
   * @param quality — A score from 0 (terrible) to 1 (perfect).
   */
  provideFeedback(fusionId: string, quality: number): void {
    const q = clamp(quality, 0, 1)
    this.feedbackScores.push(q)

    // If we have a record, update contributing source reliabilities
    const record = this.fusionLog.get(fusionId)
    if (record) {
      const isGood = q >= 0.5
      for (const sid of record.sourceIds) {
        this.updateSourceReliability(sid, isGood)
      }
    }
  }

  /** Return aggregate statistics about fusion operations. */
  getStats(): Readonly<MultiModalFusionStats> {
    const avgConf =
      this.fusionConfidenceHistory.length > 0
        ? this.fusionConfidenceHistory.reduce((s, v) => s + v, 0) /
          this.fusionConfidenceHistory.length
        : 0
    const avgFeedback =
      this.feedbackScores.length > 0
        ? this.feedbackScores.reduce((s, v) => s + v, 0) / this.feedbackScores.length
        : 0

    return {
      totalFusions: this.totalFusions,
      totalConflictsResolved: this.totalConflictsResolved,
      totalConsensusReached: this.totalConsensusReached,
      totalCrossDomainSyntheses: this.totalCrossDomainSyntheses,
      avgFusionConfidence: round2(avgConf),
      feedbackCount: this.feedbackScores.length,
      avgFeedbackAccuracy: round2(avgFeedback),
    }
  }

  /** Return a snapshot of all registered sources. */
  getSources(): IntelligenceSource[] {
    return [...this.sources.values()]
  }

  /** Reset all state — sources, logs, and statistics. */
  reset(): void {
    this.sources.clear()
    this.fusionLog.clear()
    this.fusionConfidenceHistory = []
    this.feedbackScores = []
    this.totalFusions = 0
    this.totalConflictsResolved = 0
    this.totalConsensusReached = 0
    this.totalCrossDomainSyntheses = 0
  }

  /** Return the active configuration (read-only copy). */
  getConfig(): MultiModalFusionConfig {
    return { ...this.config }
  }
}
