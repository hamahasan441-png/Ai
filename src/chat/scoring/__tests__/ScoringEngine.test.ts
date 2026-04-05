import { describe, it, expect, beforeEach } from 'vitest'
import {
  ScoringEngine,
  DEFAULT_KNOWLEDGE_WEIGHTS,
  DEFAULT_PATTERN_WEIGHTS,
  DEFAULT_CONFIDENCE_WEIGHTS,
  DEFAULT_CODE_REVIEW_WEIGHTS,
  DEFAULT_SCORING_CONFIG,
} from '../ScoringEngine'

describe('ScoringEngine', () => {
  let engine: ScoringEngine

  beforeEach(() => {
    engine = new ScoringEngine()
  })

  // ── Constructor ──

  it('uses default config when no config is provided', () => {
    expect(engine.config).toEqual(DEFAULT_SCORING_CONFIG)
  })

  it('merges partial config with defaults', () => {
    const custom = new ScoringEngine({ knowledge: { exactMatch: 10 } as any })
    expect(custom.config.knowledge.exactMatch).toBe(10)
    expect(custom.config.knowledge.partialMatch).toBe(DEFAULT_KNOWLEDGE_WEIGHTS.partialMatch)
    expect(custom.config.pattern).toEqual(DEFAULT_PATTERN_WEIGHTS)
  })

  // ── scoreKnowledgeEntry ──

  it('scores exact keyword matches', () => {
    const result = engine.scoreKnowledgeEntry(['exact'], 1, 0, 1)
    expect(result.rawScore).toBe(DEFAULT_KNOWLEDGE_WEIGHTS.exactMatch)
    expect(result.matchedCount).toBe(1)
  })

  it('scores partial keyword matches', () => {
    const result = engine.scoreKnowledgeEntry(['partial'], 1, 0, 1)
    expect(result.rawScore).toBe(DEFAULT_KNOWLEDGE_WEIGHTS.partialMatch)
  })

  it('scores content keyword matches', () => {
    const result = engine.scoreKnowledgeEntry(['content'], 1, 0, 1)
    expect(result.rawScore).toBe(DEFAULT_KNOWLEDGE_WEIGHTS.contentMatch)
  })

  it('applies weight multiplier to knowledge scores', () => {
    const weight = 2
    const result = engine.scoreKnowledgeEntry(['exact'], weight, 0, 1)
    expect(result.rawScore).toBe(DEFAULT_KNOWLEDGE_WEIGHTS.exactMatch * weight)
  })

  it('adds usage boost capped at maxUseBoost', () => {
    const result = engine.scoreKnowledgeEntry(['exact'], 1, 100, 1)
    expect(result.useBoost).toBe(DEFAULT_KNOWLEDGE_WEIGHTS.maxUseBoost)
  })

  it('normalizes knowledge score to 0–1 range', () => {
    const result = engine.scoreKnowledgeEntry(['exact', 'partial', 'content'], 1, 5, 3)
    expect(result.normalized).toBeGreaterThanOrEqual(0)
    expect(result.normalized).toBeLessThanOrEqual(1)
  })

  // ── scorePattern ──

  it('calculates raw pattern score from keyword and word hits', () => {
    const result = engine.scorePattern(2, 3, 1, 0)
    const expected = 2 * DEFAULT_PATTERN_WEIGHTS.keywordHit + 3 * DEFAULT_PATTERN_WEIGHTS.wordOverlap
    expect(result.rawScore).toBe(expected)
  })

  it('adjusts pattern score by confidence', () => {
    const full = engine.scorePattern(2, 2, 1, 0)
    engine.resetStats()
    const half = engine.scorePattern(2, 2, 0.5, 0)
    expect(half.adjusted).toBeCloseTo(full.adjusted * 0.5)
  })

  it('caps reinforcement bonus at maxReinforcementBonus', () => {
    const result = engine.scorePattern(2, 2, 1, 1000)
    const rawScore = 2 * DEFAULT_PATTERN_WEIGHTS.keywordHit + 2 * DEFAULT_PATTERN_WEIGHTS.wordOverlap
    const maxBonus = 1 + DEFAULT_PATTERN_WEIGHTS.maxReinforcementBonus
    expect(result.adjusted).toBeCloseTo(rawScore * maxBonus)
  })

  it('marks pattern as match when adjusted score meets threshold', () => {
    const result = engine.scorePattern(3, 3, 1, 0)
    expect(result.isMatch).toBe(true)
  })

  it('marks pattern as non-match when adjusted score is below threshold', () => {
    const result = engine.scorePattern(0, 0, 1, 0)
    expect(result.isMatch).toBe(false)
  })

  // ── assessConfidence ──

  it('calculates confidence from knowledge score alone', () => {
    const result = engine.assessConfidence(5, null, null)
    expect(result.knowledgeComponent).toBe(DEFAULT_CONFIDENCE_WEIGHTS.knowledgeMax)
    expect(result.patternComponent).toBe(0)
    expect(result.metaComponent).toBeNull()
  })

  it('combines knowledge and pattern components', () => {
    const result = engine.assessConfidence(5, 0.8, null)
    expect(result.patternComponent).toBeCloseTo(0.8 * DEFAULT_CONFIDENCE_WEIGHTS.patternMax)
    expect(result.score).toBeGreaterThan(0)
  })

  it('blends metaCognition when provided', () => {
    const result = engine.assessConfidence(5, 0.8, 0.9)
    expect(result.metaComponent).not.toBeNull()
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it('clamps confidence score to 0–1', () => {
    const result = engine.assessConfidence(100, 1, 1)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  // ── scoreCodeReview ──

  it('returns max score when no issues found', () => {
    const result = engine.scoreCodeReview(0, 0, 0)
    expect(result.score).toBe(DEFAULT_CODE_REVIEW_WEIGHTS.maxScore)
    expect(result.normalized).toBe(1)
    expect(result.totalPenalty).toBe(0)
  })

  it('deducts penalties for errors, warnings, and info', () => {
    const result = engine.scoreCodeReview(1, 1, 1)
    const expectedPenalty =
      DEFAULT_CODE_REVIEW_WEIGHTS.errorPenalty +
      DEFAULT_CODE_REVIEW_WEIGHTS.warningPenalty +
      DEFAULT_CODE_REVIEW_WEIGHTS.infoPenalty
    expect(result.totalPenalty).toBe(expectedPenalty)
    expect(result.score).toBe(DEFAULT_CODE_REVIEW_WEIGHTS.maxScore - expectedPenalty)
  })

  it('floors code review score at zero', () => {
    const result = engine.scoreCodeReview(100, 100, 100)
    expect(result.score).toBe(0)
    expect(result.normalized).toBe(0)
  })

  // ── applyDecay ──

  it('returns current confidence when daysSinceLastUse < 1', () => {
    expect(engine.applyDecay(0.8, 0.5, 0)).toBe(0.8)
  })

  it('returns null when decayed confidence drops below minConfidence', () => {
    expect(engine.applyDecay(0.1, 100, 0)).toBeNull()
  })

  it('slows decay with more reinforcements', () => {
    const fast = engine.applyDecay(0.8, 10, 0)!
    const slow = engine.applyDecay(0.8, 10, 5)!
    expect(slow).toBeGreaterThan(fast)
  })

  // ── Stats ──

  it('tracks scoring stats and resets them', () => {
    engine.scoreCodeReview(0, 0, 0)
    engine.scoreCodeReview(0, 0, 0)
    const stats = engine.getStats()
    expect(stats.totalScorings).toBe(2)
    expect(stats.averageScore).toBe(1)

    engine.resetStats()
    const reset = engine.getStats()
    expect(reset.totalScorings).toBe(0)
    expect(reset.averageScore).toBe(0)
  })
})
