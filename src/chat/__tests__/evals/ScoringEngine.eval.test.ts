/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  Scoring Engine — Evaluation Benchmark Tests                                ║
 * ║  Tests precision, false positives, normalization, and formula correctness   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'

import {
  ScoringEngine,
  DEFAULT_SCORING_CONFIG,
  DEFAULT_KNOWLEDGE_WEIGHTS,
  DEFAULT_PATTERN_WEIGHTS,
  DEFAULT_CONFIDENCE_WEIGHTS,
  DEFAULT_CODE_REVIEW_WEIGHTS,
} from '../../scoring/ScoringEngine.js'

describe('ScoringEngine', () => {
  let engine: ScoringEngine

  beforeEach(() => {
    engine = new ScoringEngine()
  })

  // ─── Configuration Defaults ────────────────────────────────────────────────

  describe('configuration', () => {
    it('uses default config when none provided', () => {
      expect(engine.config).toEqual(DEFAULT_SCORING_CONFIG)
    })

    it('merges partial config with defaults', () => {
      const custom = new ScoringEngine({ knowledge: { exactMatch: 5 } as never })
      expect(custom.config.knowledge.exactMatch).toBe(5)
      // Other knowledge fields keep defaults
      expect(custom.config.knowledge.partialMatch).toBe(DEFAULT_KNOWLEDGE_WEIGHTS.partialMatch)
      // Other configs keep defaults
      expect(custom.config.pattern).toEqual(DEFAULT_PATTERN_WEIGHTS)
    })

    it('exports all default weight constants', () => {
      expect(DEFAULT_KNOWLEDGE_WEIGHTS.exactMatch).toBe(3)
      expect(DEFAULT_PATTERN_WEIGHTS.keywordHit).toBe(2)
      expect(DEFAULT_CONFIDENCE_WEIGHTS.knowledgeMax).toBe(0.5)
      expect(DEFAULT_CODE_REVIEW_WEIGHTS.maxScore).toBe(100)
    })
  })

  // ─── Knowledge Search Scoring ──────────────────────────────────────────────

  describe('scoreKnowledgeEntry', () => {
    it('scores exact matches highest', () => {
      const exact = engine.scoreKnowledgeEntry(['exact'], 1, 0, 1)
      const partial = engine.scoreKnowledgeEntry(['partial'], 1, 0, 1)
      const content = engine.scoreKnowledgeEntry(['content'], 1, 0, 1)

      expect(exact.rawScore).toBeGreaterThan(partial.rawScore)
      expect(partial.rawScore).toBeGreaterThan(content.rawScore)
    })

    it('applies weight multiplier correctly', () => {
      const w1 = engine.scoreKnowledgeEntry(['exact'], 1, 0, 1)
      const w2 = engine.scoreKnowledgeEntry(['exact'], 2, 0, 1)

      expect(w2.rawScore).toBe(w1.rawScore * 2)
    })

    it('applies use boost with cap', () => {
      const noUse = engine.scoreKnowledgeEntry(['exact'], 1, 0, 1)
      const someUse = engine.scoreKnowledgeEntry(['exact'], 1, 5, 1)
      const maxUse = engine.scoreKnowledgeEntry(['exact'], 1, 100, 1)

      expect(someUse.rawScore).toBeGreaterThan(noUse.rawScore)
      expect(someUse.useBoost).toBe(0.5)
      expect(maxUse.useBoost).toBe(DEFAULT_KNOWLEDGE_WEIGHTS.maxUseBoost)
    })

    it('normalizes to 0-1 range', () => {
      const result = engine.scoreKnowledgeEntry(
        ['exact', 'exact', 'partial', 'content'],
        2,
        50,
        4,
      )
      expect(result.normalized).toBeGreaterThanOrEqual(0)
      expect(result.normalized).toBeLessThanOrEqual(1)
    })

    it('returns 0 for empty match types', () => {
      const result = engine.scoreKnowledgeEntry([], 1, 0, 1)
      expect(result.rawScore).toBe(0)
      expect(result.matchedCount).toBe(0)
    })

    it('handles multiple matches additively', () => {
      const single = engine.scoreKnowledgeEntry(['exact'], 1, 0, 2)
      const double = engine.scoreKnowledgeEntry(['exact', 'exact'], 1, 0, 2)

      expect(double.rawScore).toBe(single.rawScore * 2)
    })
  })

  // ─── Pattern Match Scoring ─────────────────────────────────────────────────

  describe('scorePattern', () => {
    it('returns isMatch=true when score exceeds threshold', () => {
      // 3 keyword hits × 2 = 6, × confidence 1.0 × reinforcement 1 = 6 ≥ 3
      const result = engine.scorePattern(3, 0, 1.0, 0)
      expect(result.isMatch).toBe(true)
      expect(result.adjusted).toBeGreaterThanOrEqual(3)
    })

    it('returns isMatch=false when score below threshold', () => {
      const result = engine.scorePattern(1, 0, 0.5, 0)
      expect(result.isMatch).toBe(false)
    })

    it('applies confidence as multiplier', () => {
      const full = engine.scorePattern(3, 2, 1.0, 0)
      const half = engine.scorePattern(3, 2, 0.5, 0)

      expect(half.adjusted).toBeCloseTo(full.adjusted * 0.5, 5)
    })

    it('applies reinforcement bonus with cap', () => {
      const noReinforce = engine.scorePattern(3, 2, 1.0, 0)
      const someReinforce = engine.scorePattern(3, 2, 1.0, 3)
      const maxReinforce = engine.scorePattern(3, 2, 1.0, 100)

      expect(someReinforce.adjusted).toBeGreaterThan(noReinforce.adjusted)
      // Max reinforcement bonus is 0.5, so max multiplier is 1.5
      expect(maxReinforce.adjusted).toBe(noReinforce.rawScore * 1.0 * 1.5)
    })

    it('combines keywords and word overlap', () => {
      const kwOnly = engine.scorePattern(3, 0, 1.0, 0)
      const both = engine.scorePattern(3, 2, 1.0, 0)

      expect(both.rawScore).toBeGreaterThan(kwOnly.rawScore)
      expect(both.wordHits).toBe(2)
    })

    it('handles zero inputs gracefully', () => {
      const result = engine.scorePattern(0, 0, 0, 0)
      expect(result.rawScore).toBe(0)
      expect(result.adjusted).toBe(0)
      expect(result.isMatch).toBe(false)
    })
  })

  // ─── Confidence Assessment ─────────────────────────────────────────────────

  describe('assessConfidence', () => {
    it('returns confident=true when score ≥ 0.5', () => {
      // Knowledge: 5/5 = 1.0 → capped at 0.5
      const result = engine.assessConfidence(5, null, null)
      expect(result.score).toBeGreaterThanOrEqual(0.5)
      expect(result.confident).toBe(true)
    })

    it('returns confident=false when score < 0.5', () => {
      const result = engine.assessConfidence(0, null, null)
      expect(result.score).toBe(0)
      expect(result.confident).toBe(false)
    })

    it('caps knowledge component at knowledgeMax', () => {
      const result = engine.assessConfidence(100, null, null)
      expect(result.knowledgeComponent).toBe(DEFAULT_CONFIDENCE_WEIGHTS.knowledgeMax)
    })

    it('combines knowledge + pattern', () => {
      const knowledgeOnly = engine.assessConfidence(2.5, null, null)
      const both = engine.assessConfidence(2.5, 0.8, null)

      expect(both.score).toBeGreaterThan(knowledgeOnly.score)
      expect(both.patternComponent).toBe(0.8 * DEFAULT_CONFIDENCE_WEIGHTS.patternMax)
    })

    it('blends with MetaCognition when available', () => {
      const localOnly = engine.assessConfidence(2.5, 0.5, null)
      const withMeta = engine.assessConfidence(2.5, 0.5, 0.9)

      expect(withMeta.metaComponent).not.toBeNull()
      expect(withMeta.score).not.toBe(localOnly.score)
    })

    it('clamps score to 0-1', () => {
      const result = engine.assessConfidence(100, 1.0, 1.0)
      expect(result.score).toBeLessThanOrEqual(1)
      expect(result.score).toBeGreaterThanOrEqual(0)
    })

    it('handles all-null pattern and meta', () => {
      const result = engine.assessConfidence(0, null, null)
      expect(result.patternComponent).toBe(0)
      expect(result.metaComponent).toBeNull()
    })
  })

  // ─── Code Review Scoring ───────────────────────────────────────────────────

  describe('scoreCodeReview', () => {
    it('returns max score for clean code', () => {
      const result = engine.scoreCodeReview(0, 0, 0)
      expect(result.score).toBe(100)
      expect(result.normalized).toBe(1)
    })

    it('deducts correctly per issue type', () => {
      const result = engine.scoreCodeReview(1, 1, 1)
      expect(result.totalPenalty).toBe(15 + 8 + 2)
      expect(result.score).toBe(100 - 25)
    })

    it('floors at zero', () => {
      const result = engine.scoreCodeReview(100, 100, 100)
      expect(result.score).toBe(0)
      expect(result.normalized).toBe(0)
    })

    it('normalizes to 0-1', () => {
      const result = engine.scoreCodeReview(2, 3, 5)
      expect(result.normalized).toBeGreaterThanOrEqual(0)
      expect(result.normalized).toBeLessThanOrEqual(1)
    })

    it('errors have highest penalty', () => {
      const errOnly = engine.scoreCodeReview(1, 0, 0)
      const warnOnly = engine.scoreCodeReview(0, 1, 0)
      const infoOnly = engine.scoreCodeReview(0, 0, 1)

      expect(errOnly.totalPenalty).toBeGreaterThan(warnOnly.totalPenalty)
      expect(warnOnly.totalPenalty).toBeGreaterThan(infoOnly.totalPenalty)
    })
  })

  // ─── Confidence Decay ──────────────────────────────────────────────────────

  describe('applyDecay', () => {
    it('does not decay within first day', () => {
      const result = engine.applyDecay(0.8, 0.5, 0)
      expect(result).toBe(0.8)
    })

    it('decays after one day', () => {
      const result = engine.applyDecay(0.8, 2, 0)
      expect(result).not.toBeNull()
      expect(result!).toBeLessThan(0.8)
    })

    it('slows decay with reinforcements', () => {
      const noReinforce = engine.applyDecay(0.8, 10, 0)
      const withReinforce = engine.applyDecay(0.8, 10, 5)

      expect(withReinforce!).toBeGreaterThan(noReinforce!)
    })

    it('prunes below minConfidence', () => {
      const result = engine.applyDecay(0.05, 100, 0, 0.1, 0.1)
      expect(result).toBeNull()
    })

    it('returns null for fully decayed patterns', () => {
      const result = engine.applyDecay(0.1, 1000, 0)
      expect(result).toBeNull()
    })

    it('uses custom decay rate and min confidence', () => {
      const result = engine.applyDecay(0.5, 5, 0, 0.05, 0.2)
      expect(result).not.toBeNull()
    })
  })

  // ─── Stats Tracking ────────────────────────────────────────────────────────

  describe('stats', () => {
    it('tracks total scorings', () => {
      engine.scoreCodeReview(0, 0, 0)
      engine.scoreCodeReview(1, 0, 0)
      engine.scorePattern(3, 0, 1, 0)

      const stats = engine.getStats()
      expect(stats.totalScorings).toBe(3)
    })

    it('computes average score', () => {
      engine.scoreCodeReview(0, 0, 0) // normalized = 1
      engine.scoreCodeReview(0, 0, 0) // normalized = 1
      const stats = engine.getStats()
      expect(stats.averageScore).toBe(1)
    })

    it('resets stats', () => {
      engine.scoreCodeReview(0, 0, 0)
      engine.resetStats()
      const stats = engine.getStats()
      expect(stats.totalScorings).toBe(0)
      expect(stats.averageScore).toBe(0)
    })

    it('handles no scorings', () => {
      const stats = engine.getStats()
      expect(stats.totalScorings).toBe(0)
      expect(stats.averageScore).toBe(0)
    })
  })

  // ─── Precision Benchmarks ──────────────────────────────────────────────────

  describe('precision benchmarks', () => {
    it('strong knowledge match scores above 0.5 normalized', () => {
      // 3 exact matches with weight 1.2
      const result = engine.scoreKnowledgeEntry(
        ['exact', 'exact', 'exact'],
        1.2,
        3,
        3,
      )
      expect(result.normalized).toBeGreaterThan(0.5)
    })

    it('weak match scores below 0.3 normalized', () => {
      const result = engine.scoreKnowledgeEntry(['content'], 0.5, 0, 5)
      expect(result.normalized).toBeLessThan(0.3)
    })

    it('code review - 2 errors drops below 75%', () => {
      const result = engine.scoreCodeReview(2, 0, 0)
      expect(result.score).toBeLessThan(75)
    })

    it('high confidence needs both knowledge + patterns', () => {
      const knowledgeOnly = engine.assessConfidence(4, null, null)
      const both = engine.assessConfidence(4, 0.9, null)

      expect(knowledgeOnly.confident).toBe(true) // 4/5 = 0.8 > 0.5
      expect(both.score).toBeGreaterThan(knowledgeOnly.score)
    })

    it('pattern match - 2 keyword hits with 0.9 confidence beats threshold', () => {
      const result = engine.scorePattern(2, 1, 0.9, 2)
      // rawScore = 2×2 + 1×1.5 = 5.5, adjusted = 5.5 × 0.9 × (1 + 0.2) = 5.94
      expect(result.isMatch).toBe(true)
    })

    it('decay preserves high-confidence patterns', () => {
      // High confidence + reinforcements should survive 30 days
      const result = engine.applyDecay(0.95, 30, 10)
      expect(result).not.toBeNull()
      expect(result!).toBeGreaterThan(0.1)
    })
  })

  // ─── False Positive Prevention ─────────────────────────────────────────────

  describe('false positive prevention', () => {
    it('single partial match does not exceed threshold', () => {
      const result = engine.scorePattern(0, 1, 0.5, 0)
      expect(result.isMatch).toBe(false)
    })

    it('low confidence zeroes adjusted score', () => {
      const result = engine.scorePattern(5, 3, 0.0, 10)
      expect(result.adjusted).toBe(0)
      expect(result.isMatch).toBe(false)
    })

    it('knowledge score of 0 gives no confidence', () => {
      const result = engine.assessConfidence(0, null, null)
      expect(result.confident).toBe(false)
      expect(result.score).toBe(0)
    })

    it('maximum use boost alone is limited', () => {
      const result = engine.scoreKnowledgeEntry([], 1, 100, 3)
      // Use boost applies (capped at maxUseBoost) but no keyword score
      expect(result.rawScore).toBe(DEFAULT_KNOWLEDGE_WEIGHTS.maxUseBoost)
      expect(result.matchedCount).toBe(0)
    })
  })
})
