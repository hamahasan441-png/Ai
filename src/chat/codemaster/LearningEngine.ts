/**
 * LearningEngine - Code Review Pattern Learning
 *
 * Learns from past reviews and fixes to improve future suggestions.
 * Built on TfIdfScorer for pattern storage and matching.
 */

import type {
  ReviewPattern,
  FixPattern,
  LearningStats,
  ReviewFinding,
  CodeFix,
  AnalysisLanguage,
  ReviewCategory,
} from './types.js'
import { TfIdfScorer } from '../TfIdfScorer.js'

/**
 * LearningEngine - Learns from code reviews and fixes.
 *
 * Uses TF-IDF scoring to match similar code patterns from past reviews,
 * enabling the system to improve over time.
 */
export class LearningEngine {
  private reviewPatterns: ReviewPattern[] = []
  private fixPatterns: FixPattern[] = []
  private reviewScorer: TfIdfScorer
  private fixScorer: TfIdfScorer
  private stats: LearningStats
  private maxPatterns: number

  constructor(options?: { maxPatterns?: number }) {
    this.maxPatterns = options?.maxPatterns ?? 500
    this.reviewScorer = new TfIdfScorer()
    this.fixScorer = new TfIdfScorer()
    this.stats = {
      totalReviewPatterns: 0,
      totalFixPatterns: 0,
      totalReviewsProcessed: 0,
      totalFixesApplied: 0,
      lastLearnedAt: null,
    }
  }

  /**
   * Learn from a code review finding.
   */
  learnFromReview(
    codeContext: string,
    language: AnalysisLanguage,
    finding: ReviewFinding,
  ): void {
    const existing = this.findExistingReviewPattern(codeContext, finding.category)

    if (existing) {
      existing.occurrences++
      existing.confidence = Math.min(1.0, existing.confidence + 0.05)
      existing.lastSeen = new Date().toISOString()
    } else {
      const id = `rp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const pattern: ReviewPattern = {
        id,
        codePattern: codeContext.slice(0, 500),
        language,
        category: finding.category,
        finding: finding.description,
        fix: finding.suggestion,
        confidence: 0.5,
        occurrences: 1,
        lastSeen: new Date().toISOString(),
      }

      this.reviewPatterns.push(pattern)
      this.reviewScorer.addDocument({ id, text: codeContext })
      this.prunePatterns()
    }

    this.stats.totalReviewsProcessed++
    this.stats.totalReviewPatterns = this.reviewPatterns.length
    this.stats.lastLearnedAt = new Date().toISOString()
  }

  /**
   * Learn from multiple review findings at once.
   */
  learnFromReviewBatch(
    codeContext: string,
    language: AnalysisLanguage,
    findings: ReviewFinding[],
  ): void {
    for (const finding of findings) {
      this.learnFromReview(codeContext, language, finding)
    }
  }

  /**
   * Learn from a successful code fix.
   */
  learnFromFix(
    beforeCode: string,
    afterCode: string,
    language: AnalysisLanguage,
    fixType: string,
  ): void {
    const existing = this.fixPatterns.find(
      p => p.beforeCode === beforeCode && p.fixType === fixType,
    )

    if (existing) {
      existing.appliedCount++
      existing.successRate = Math.min(1.0, existing.successRate + 0.02)
    } else {
      const id = `fp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const pattern: FixPattern = {
        id,
        beforeCode: beforeCode.slice(0, 500),
        afterCode: afterCode.slice(0, 500),
        language,
        fixType,
        successRate: 0.7,
        appliedCount: 1,
      }

      this.fixPatterns.push(pattern)
      this.fixScorer.addDocument({ id, text: beforeCode })

      if (this.fixPatterns.length > this.maxPatterns) {
        const removed = this.fixPatterns.shift()
        if (removed) this.fixScorer.removeDocument(removed.id)
      }
    }

    this.stats.totalFixesApplied++
    this.stats.totalFixPatterns = this.fixPatterns.length
    this.stats.lastLearnedAt = new Date().toISOString()
  }

  /**
   * Find similar past reviews for a code snippet.
   */
  findSimilarReviews(code: string, limit = 5): ReviewPattern[] {
    if (this.reviewPatterns.length === 0) return []

    const results = this.reviewScorer.score(code, limit, 0.05)
    return results
      .map(r => this.reviewPatterns.find(p => p.id === r.id))
      .filter((p): p is ReviewPattern => p !== undefined)
  }

  /**
   * Find similar past fixes for a code snippet.
   */
  findSimilarFixes(code: string, limit = 5): FixPattern[] {
    if (this.fixPatterns.length === 0) return []

    const results = this.fixScorer.score(code, limit, 0.05)
    return results
      .map(r => this.fixPatterns.find(p => p.id === r.id))
      .filter((p): p is FixPattern => p !== undefined)
  }

  /**
   * Get recurring issues (patterns seen 3+ times).
   */
  getRecurringIssues(): ReviewPattern[] {
    return this.reviewPatterns
      .filter(p => p.occurrences >= 3)
      .sort((a, b) => b.occurrences - a.occurrences)
  }

  /**
   * Get trends by category.
   */
  getTrends(): Record<string, number> {
    const trends: Record<string, number> = {}
    for (const p of this.reviewPatterns) {
      trends[p.category] = (trends[p.category] ?? 0) + p.occurrences
    }
    return trends
  }

  /** Get learning statistics. */
  getStats(): LearningStats {
    return { ...this.stats }
  }

  /** Get all review patterns. */
  getReviewPatterns(): ReviewPattern[] {
    return [...this.reviewPatterns]
  }

  /** Get all fix patterns. */
  getFixPatterns(): FixPattern[] {
    return [...this.fixPatterns]
  }

  /**
   * Serialize learning state for persistence.
   */
  serialize(): string {
    return JSON.stringify({
      reviewPatterns: this.reviewPatterns,
      fixPatterns: this.fixPatterns,
      stats: this.stats,
    })
  }

  /**
   * Restore learning state from serialized data.
   */
  static deserialize(json: string): LearningEngine {
    const data = JSON.parse(json)
    const engine = new LearningEngine()
    engine.reviewPatterns = data.reviewPatterns ?? []
    engine.fixPatterns = data.fixPatterns ?? []
    engine.stats = data.stats ?? engine.stats

    // Rebuild TF-IDF indices
    for (const p of engine.reviewPatterns) {
      engine.reviewScorer.addDocument({ id: p.id, text: p.codePattern })
    }
    for (const p of engine.fixPatterns) {
      engine.fixScorer.addDocument({ id: p.id, text: p.beforeCode })
    }

    return engine
  }

  /** Clear all learned patterns. */
  clear(): void {
    this.reviewPatterns = []
    this.fixPatterns = []
    this.reviewScorer.clear()
    this.fixScorer.clear()
    this.stats = {
      totalReviewPatterns: 0,
      totalFixPatterns: 0,
      totalReviewsProcessed: 0,
      totalFixesApplied: 0,
      lastLearnedAt: null,
    }
  }

  // ── Private helpers ──

  private findExistingReviewPattern(
    codeContext: string,
    category: ReviewCategory,
  ): ReviewPattern | undefined {
    if (this.reviewPatterns.length === 0) return undefined

    const results = this.reviewScorer.score(codeContext, 1, 0.6)
    if (results.length === 0) return undefined

    return this.reviewPatterns.find(
      p => p.id === results[0].id && p.category === category,
    )
  }

  private prunePatterns(): void {
    if (this.reviewPatterns.length > this.maxPatterns) {
      // Remove lowest confidence patterns
      this.reviewPatterns.sort((a, b) => b.confidence - a.confidence)
      const removed = this.reviewPatterns.splice(this.maxPatterns)
      for (const p of removed) {
        this.reviewScorer.removeDocument(p.id)
      }
    }
  }
}
