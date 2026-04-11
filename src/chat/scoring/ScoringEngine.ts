/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ScoringEngine — Single source of truth for all scoring formulas            ║
 * ║  Normalizes scores to 0–1 range, documents weights, enforces caps           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Configuration ─────────────────────────────────────────────────────────────

/** Scoring weights for knowledge search. */
export interface KnowledgeScoreWeights {
  /** Points for an exact keyword match. Default: 3 */
  readonly exactMatch: number
  /** Points for a partial keyword overlap. Default: 1.5 */
  readonly partialMatch: number
  /** Points for content-contains-keyword. Default: 0.5 */
  readonly contentMatch: number
  /** Maximum boost from usage history. Default: 1.0 */
  readonly maxUseBoost: number
  /** Multiplier per use-count for usage boost. Default: 0.1 */
  readonly useBoostRate: number
}

/** Scoring weights for learned pattern matching. */
export interface PatternScoreWeights {
  /** Points per keyword hit. Default: 2 */
  readonly keywordHit: number
  /** Points per word overlap. Default: 1.5 */
  readonly wordOverlap: number
  /** Maximum reinforcement bonus (multiplicative). Default: 0.5 */
  readonly maxReinforcementBonus: number
  /** Reinforcement bonus rate. Default: 0.1 */
  readonly reinforcementRate: number
  /** Minimum score to consider a pattern a match. Default: 3 */
  readonly matchThreshold: number
}

/** Scoring weights for confidence assessment. */
export interface ConfidenceWeights {
  /** Maximum contribution from knowledge (0–1). Default: 0.5 */
  readonly knowledgeMax: number
  /** Divisor to normalize raw knowledge score. Default: 5 */
  readonly knowledgeNormalizer: number
  /** Maximum contribution from patterns (0–1). Default: 0.5 */
  readonly patternMax: number
  /** Weight of local score vs MetaCognition. Default: 0.6 */
  readonly localWeight: number
  /** Confidence threshold to classify as "confident". Default: 0.5 */
  readonly confidenceThreshold: number
}

/** Code review scoring configuration. */
export interface CodeReviewWeights {
  /** Points deducted per error. Default: 15 */
  readonly errorPenalty: number
  /** Points deducted per warning. Default: 8 */
  readonly warningPenalty: number
  /** Points deducted per info finding. Default: 2 */
  readonly infoPenalty: number
  /** Maximum possible score. Default: 100 */
  readonly maxScore: number
}

/** Full scoring configuration. */
export interface ScoringConfig {
  readonly knowledge: KnowledgeScoreWeights
  readonly pattern: PatternScoreWeights
  readonly confidence: ConfidenceWeights
  readonly codeReview: CodeReviewWeights
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_KNOWLEDGE_WEIGHTS: KnowledgeScoreWeights = {
  exactMatch: 3,
  partialMatch: 1.5,
  contentMatch: 0.5,
  maxUseBoost: 1.0,
  useBoostRate: 0.1,
}

export const DEFAULT_PATTERN_WEIGHTS: PatternScoreWeights = {
  keywordHit: 2,
  wordOverlap: 1.5,
  maxReinforcementBonus: 0.5,
  reinforcementRate: 0.1,
  matchThreshold: 3,
}

export const DEFAULT_CONFIDENCE_WEIGHTS: ConfidenceWeights = {
  knowledgeMax: 0.5,
  knowledgeNormalizer: 5,
  patternMax: 0.5,
  localWeight: 0.6,
  confidenceThreshold: 0.5,
}

export const DEFAULT_CODE_REVIEW_WEIGHTS: CodeReviewWeights = {
  errorPenalty: 15,
  warningPenalty: 8,
  infoPenalty: 2,
  maxScore: 100,
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  knowledge: DEFAULT_KNOWLEDGE_WEIGHTS,
  pattern: DEFAULT_PATTERN_WEIGHTS,
  confidence: DEFAULT_CONFIDENCE_WEIGHTS,
  codeReview: DEFAULT_CODE_REVIEW_WEIGHTS,
}

// ─── Scoring Results ───────────────────────────────────────────────────────────

/** Breakdown of a knowledge search score. */
export interface KnowledgeScoreResult {
  /** Raw additive score before normalization. */
  readonly rawScore: number
  /** Score normalized to 0–1 range. */
  readonly normalized: number
  /** Usage boost component. */
  readonly useBoost: number
  /** Number of keywords matched. */
  readonly matchedCount: number
}

/** Breakdown of a pattern match score. */
export interface PatternScoreResult {
  /** Raw additive score. */
  readonly rawScore: number
  /** Score after confidence + reinforcement multiplier. */
  readonly adjusted: number
  /** Whether it exceeds the match threshold. */
  readonly isMatch: boolean
  /** Keyword overlap count. */
  readonly keywordHits: number
  /** Word overlap count. */
  readonly wordHits: number
}

/** Confidence assessment result. */
export interface ConfidenceResult {
  /** Final score (0–1). */
  readonly score: number
  /** Whether score exceeds confidence threshold. */
  readonly confident: boolean
  /** Knowledge component (0–knowledgeMax). */
  readonly knowledgeComponent: number
  /** Pattern component (0–patternMax). */
  readonly patternComponent: number
  /** MetaCognition component (if used). */
  readonly metaComponent: number | null
}

/** Code review score result. */
export interface CodeReviewScoreResult {
  /** Final score (0–maxScore). */
  readonly score: number
  /** Normalized to 0–1 range. */
  readonly normalized: number
  /** Total penalty applied. */
  readonly totalPenalty: number
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class ScoringEngine {
  readonly config: ScoringConfig

  private totalScorings = 0
  private scoreSum = 0

  constructor(config: Partial<ScoringConfig> = {}) {
    this.config = {
      knowledge: { ...DEFAULT_KNOWLEDGE_WEIGHTS, ...config.knowledge },
      pattern: { ...DEFAULT_PATTERN_WEIGHTS, ...config.pattern },
      confidence: { ...DEFAULT_CONFIDENCE_WEIGHTS, ...config.confidence },
      codeReview: { ...DEFAULT_CODE_REVIEW_WEIGHTS, ...config.codeReview },
    }
  }

  // ── Knowledge Search Scoring ──

  /**
   * Score a knowledge entry against search keywords.
   * @param matchType — 'exact' | 'partial' | 'content' for each keyword hit
   * @param weight — Entry weight multiplier
   * @param useCount — How many times this entry has been used
   * @param matchedKeywordCount — Number of keywords matched
   * @param totalKeywordCount — Total search keywords for normalization
   */
  scoreKnowledgeEntry(
    matchType: ('exact' | 'partial' | 'content')[],
    weight: number,
    useCount: number,
    totalKeywordCount: number,
  ): KnowledgeScoreResult {
    const w = this.config.knowledge
    let rawScore = 0

    for (const mt of matchType) {
      switch (mt) {
        case 'exact':
          rawScore += w.exactMatch * weight
          break
        case 'partial':
          rawScore += w.partialMatch * weight
          break
        case 'content':
          rawScore += w.contentMatch * weight
          break
      }
    }

    const useBoost = Math.min(useCount * w.useBoostRate, w.maxUseBoost)
    const total = rawScore + useBoost

    // Normalize: theoretical max per keyword = exactMatch * weight + contentMatch * weight
    // With maxUseBoost. Cap to 1.0.
    const theoreticalMax =
      totalKeywordCount > 0
        ? totalKeywordCount * (w.exactMatch + w.contentMatch) * Math.max(weight, 1) + w.maxUseBoost
        : 1
    const normalized = Math.min(total / theoreticalMax, 1)

    this.track(normalized)

    return {
      rawScore: total,
      normalized,
      useBoost,
      matchedCount: matchType.length,
    }
  }

  // ── Pattern Match Scoring ──

  /**
   * Score a learned pattern against user input.
   * @param keywordHits — Number of keyword matches
   * @param wordHits — Number of word overlaps
   * @param confidence — Pattern's current confidence (0–1)
   * @param reinforcements — Number of times pattern was reinforced
   */
  scorePattern(
    keywordHits: number,
    wordHits: number,
    confidence: number,
    reinforcements: number,
  ): PatternScoreResult {
    const w = this.config.pattern

    const rawScore = keywordHits * w.keywordHit + wordHits * w.wordOverlap
    const reinforcementBonus =
      1 + Math.min(reinforcements * w.reinforcementRate, w.maxReinforcementBonus)
    const adjusted = rawScore * confidence * reinforcementBonus
    const isMatch = adjusted >= w.matchThreshold

    this.track(isMatch ? 1 : 0)

    return { rawScore, adjusted, isMatch, keywordHits, wordHits }
  }

  // ── Confidence Assessment ──

  /**
   * Calculate overall confidence for a question.
   * @param knowledgeRawScore — Top knowledge search raw score
   * @param patternConfidence — Best pattern match confidence (null if none)
   * @param metaCognitionCalibrated — MetaCognition calibrated score (null if disabled)
   */
  assessConfidence(
    knowledgeRawScore: number,
    patternConfidence: number | null,
    metaCognitionCalibrated: number | null,
  ): ConfidenceResult {
    const w = this.config.confidence

    const knowledgeComponent = Math.min(knowledgeRawScore / w.knowledgeNormalizer, w.knowledgeMax)
    const patternComponent = patternConfidence !== null ? patternConfidence * w.patternMax : 0

    let score = knowledgeComponent + patternComponent

    let metaComponent: number | null = null
    if (metaCognitionCalibrated !== null) {
      metaComponent = metaCognitionCalibrated * (1 - w.localWeight)
      score = score * w.localWeight + metaComponent
    }

    // Clamp to 0–1
    score = Math.max(0, Math.min(1, score))

    this.track(score)

    return {
      score,
      confident: score >= w.confidenceThreshold,
      knowledgeComponent,
      patternComponent,
      metaComponent,
    }
  }

  // ── Code Review Scoring ──

  /**
   * Calculate a code review quality score.
   * @param errorCount — Number of errors found
   * @param warningCount — Number of warnings found
   * @param infoCount — Number of info findings
   */
  scoreCodeReview(
    errorCount: number,
    warningCount: number,
    infoCount: number,
  ): CodeReviewScoreResult {
    const w = this.config.codeReview

    const totalPenalty =
      errorCount * w.errorPenalty + warningCount * w.warningPenalty + infoCount * w.infoPenalty

    const score = Math.max(0, Math.min(w.maxScore, w.maxScore - totalPenalty))
    const normalized = score / w.maxScore

    this.track(normalized)

    return { score, normalized, totalPenalty }
  }

  // ── Confidence Decay ──

  /**
   * Apply temporal confidence decay to a pattern.
   * @param currentConfidence — Current confidence value (0–1)
   * @param daysSinceLastUse — Days since the pattern was last used
   * @param reinforcements — Number of reinforcements (slows decay)
   * @param decayRate — Base decay rate per day (default: 0.01)
   * @param minConfidence — Prune threshold (default: 0.1)
   * @returns New confidence value, or null if it should be pruned
   */
  applyDecay(
    currentConfidence: number,
    daysSinceLastUse: number,
    reinforcements: number,
    decayRate = 0.01,
    minConfidence = 0.1,
  ): number | null {
    if (daysSinceLastUse < 1) return currentConfidence

    const effectiveDecay = decayRate / (1 + reinforcements * 0.1)
    const newConfidence = Math.max(0, currentConfidence * (1 - effectiveDecay * daysSinceLastUse))

    return newConfidence >= minConfidence ? newConfidence : null
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  /** Get aggregate scoring stats. */
  getStats(): { totalScorings: number; averageScore: number } {
    return {
      totalScorings: this.totalScorings,
      averageScore: this.totalScorings > 0 ? this.scoreSum / this.totalScorings : 0,
    }
  }

  /** Reset scoring stats. */
  resetStats(): void {
    this.totalScorings = 0
    this.scoreSum = 0
  }

  private track(normalizedScore: number): void {
    this.totalScorings++
    this.scoreSum += normalizedScore
  }
}
