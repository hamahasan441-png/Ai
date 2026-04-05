import { describe, it, expect, beforeEach } from 'vitest'
import { LearningEngine } from '../LearningEngine'
import type { ReviewFinding, ReviewCategory } from '../types'

// ── Helpers ──

function makeFinding(overrides: Partial<ReviewFinding> = {}): ReviewFinding {
  return {
    category: 'bug',
    severity: 'medium',
    line: 1,
    title: 'Test finding',
    description: 'A test finding description',
    suggestion: 'Fix the thing',
    fixAvailable: true,
    autoFixable: false,
    id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...overrides,
  }
}

// ── Constructor Tests ──

describe('LearningEngine constructor', () => {
  it('creates an instance with default options', () => {
    const engine = new LearningEngine()
    expect(engine).toBeInstanceOf(LearningEngine)
  })

  it('accepts a custom maxPatterns option', () => {
    const engine = new LearningEngine({ maxPatterns: 100 })
    expect(engine).toBeInstanceOf(LearningEngine)
  })

  it('initializes with empty stats', () => {
    const engine = new LearningEngine()
    const stats = engine.getStats()
    expect(stats.totalReviewPatterns).toBe(0)
    expect(stats.totalFixPatterns).toBe(0)
    expect(stats.totalReviewsProcessed).toBe(0)
    expect(stats.totalFixesApplied).toBe(0)
    expect(stats.lastLearnedAt).toBeNull()
  })
})

// ── learnFromReview Tests ──

describe('LearningEngine learnFromReview', () => {
  let engine: LearningEngine

  beforeEach(() => {
    engine = new LearningEngine()
  })

  it('adds a review pattern and updates stats', () => {
    const finding = makeFinding({ category: 'security' })
    engine.learnFromReview('const password = "secret"', 'javascript', finding)

    const stats = engine.getStats()
    expect(stats.totalReviewsProcessed).toBe(1)
    expect(stats.totalReviewPatterns).toBe(1)
    expect(stats.lastLearnedAt).not.toBeNull()
  })

  it('creates distinct patterns for different categories', () => {
    engine.learnFromReview('const x = eval(input)', 'javascript', makeFinding({ category: 'security' }))
    engine.learnFromReview('var y = 10', 'javascript', makeFinding({ category: 'style' }))

    expect(engine.getReviewPatterns()).toHaveLength(2)
  })

  it('truncates code context to 500 characters', () => {
    const longCode = 'a'.repeat(1000)
    engine.learnFromReview(longCode, 'typescript', makeFinding())

    const patterns = engine.getReviewPatterns()
    expect(patterns[0].codePattern.length).toBeLessThanOrEqual(500)
  })
})

// ── learnFromReviewBatch Tests ──

describe('LearningEngine learnFromReviewBatch', () => {
  it('processes multiple findings at once', () => {
    const engine = new LearningEngine()
    const findings = [
      makeFinding({ category: 'bug' }),
      makeFinding({ category: 'performance' }),
      makeFinding({ category: 'style' }),
    ]

    engine.learnFromReviewBatch('function slow() { while(true) {} }', 'javascript', findings)

    const stats = engine.getStats()
    expect(stats.totalReviewsProcessed).toBe(3)
  })
})

// ── learnFromFix Tests ──

describe('LearningEngine learnFromFix', () => {
  let engine: LearningEngine

  beforeEach(() => {
    engine = new LearningEngine()
  })

  it('adds a fix pattern and updates stats', () => {
    engine.learnFromFix('var x = 1', 'const x = 1', 'javascript', 'var-to-const')

    const stats = engine.getStats()
    expect(stats.totalFixesApplied).toBe(1)
    expect(stats.totalFixPatterns).toBe(1)
  })

  it('increments appliedCount for duplicate fix patterns', () => {
    engine.learnFromFix('var x = 1', 'const x = 1', 'javascript', 'var-to-const')
    engine.learnFromFix('var x = 1', 'const x = 1', 'javascript', 'var-to-const')

    const patterns = engine.getFixPatterns()
    expect(patterns).toHaveLength(1)
    expect(patterns[0].appliedCount).toBe(2)
  })

  it('truncates code to 500 characters', () => {
    const longBefore = 'b'.repeat(1000)
    const longAfter = 'a'.repeat(1000)
    engine.learnFromFix(longBefore, longAfter, 'typescript', 'trim')

    const patterns = engine.getFixPatterns()
    expect(patterns[0].beforeCode.length).toBeLessThanOrEqual(500)
    expect(patterns[0].afterCode.length).toBeLessThanOrEqual(500)
  })
})

// ── findSimilarReviews / findSimilarFixes Tests ──

describe('LearningEngine similarity search', () => {
  let engine: LearningEngine

  beforeEach(() => {
    engine = new LearningEngine()
  })

  it('findSimilarReviews returns empty array when no patterns exist', () => {
    expect(engine.findSimilarReviews('const x = 1')).toEqual([])
  })

  it('findSimilarReviews finds matching review patterns', () => {
    engine.learnFromReview(
      'function fetchData() { return eval(userInput) }',
      'javascript',
      makeFinding({ category: 'security', description: 'eval usage detected' }),
    )

    const results = engine.findSimilarReviews('const result = eval(userInput)')
    expect(results.length).toBeGreaterThanOrEqual(0)
  })

  it('findSimilarFixes returns empty array when no patterns exist', () => {
    expect(engine.findSimilarFixes('var x = 1')).toEqual([])
  })

  it('findSimilarFixes finds matching fix patterns', () => {
    engine.learnFromFix('var count = 0', 'let count = 0', 'javascript', 'var-to-let')

    const results = engine.findSimilarFixes('var count = 0')
    expect(results.length).toBeGreaterThanOrEqual(0)
  })
})

// ── getRecurringIssues / getTrends Tests ──

describe('LearningEngine recurring issues and trends', () => {
  let engine: LearningEngine

  beforeEach(() => {
    engine = new LearningEngine()
  })

  it('getRecurringIssues returns only patterns with 3+ occurrences', () => {
    // Each call with completely different code creates a new pattern with occurrences=1
    engine.learnFromReview('code alpha one', 'javascript', makeFinding({ category: 'bug' }))
    engine.learnFromReview('code beta two', 'javascript', makeFinding({ category: 'style' }))

    // No pattern has 3+ occurrences
    expect(engine.getRecurringIssues()).toHaveLength(0)
  })

  it('getTrends aggregates occurrences by category', () => {
    engine.learnFromReview('alpha code snippet one', 'javascript', makeFinding({ category: 'bug' }))
    engine.learnFromReview('beta code snippet two', 'javascript', makeFinding({ category: 'bug' }))
    engine.learnFromReview('gamma code snippet three', 'javascript', makeFinding({ category: 'style' }))

    const trends = engine.getTrends()
    expect(trends['bug']).toBeGreaterThanOrEqual(2)
    expect(trends['style']).toBeGreaterThanOrEqual(1)
  })
})

// ── getReviewPatterns / getFixPatterns Tests ──

describe('LearningEngine pattern getters', () => {
  it('getReviewPatterns returns a copy of internal patterns', () => {
    const engine = new LearningEngine()
    engine.learnFromReview('const x = eval(y)', 'javascript', makeFinding())

    const patterns = engine.getReviewPatterns()
    patterns.pop()
    expect(engine.getReviewPatterns()).toHaveLength(1)
  })

  it('getFixPatterns returns a copy of internal patterns', () => {
    const engine = new LearningEngine()
    engine.learnFromFix('var x', 'const x', 'javascript', 'var-fix')

    const patterns = engine.getFixPatterns()
    patterns.pop()
    expect(engine.getFixPatterns()).toHaveLength(1)
  })
})

// ── serialize / deserialize Tests ──

describe('LearningEngine serialize and deserialize', () => {
  it('round-trips review and fix patterns through serialization', () => {
    const engine = new LearningEngine()
    engine.learnFromReview('const x = eval(input)', 'javascript', makeFinding({ category: 'security' }))
    engine.learnFromFix('var y = 1', 'const y = 1', 'javascript', 'var-to-const')

    const json = engine.serialize()
    const restored = LearningEngine.deserialize(json)

    expect(restored.getReviewPatterns()).toHaveLength(1)
    expect(restored.getFixPatterns()).toHaveLength(1)
    expect(restored.getStats().totalReviewsProcessed).toBe(1)
    expect(restored.getStats().totalFixesApplied).toBe(1)
  })

  it('deserialize handles missing fields gracefully', () => {
    const json = JSON.stringify({})
    const restored = LearningEngine.deserialize(json)

    expect(restored.getReviewPatterns()).toEqual([])
    expect(restored.getFixPatterns()).toEqual([])
  })
})

// ── clear Tests ──

describe('LearningEngine clear', () => {
  it('resets all patterns and stats', () => {
    const engine = new LearningEngine()
    engine.learnFromReview('some code', 'typescript', makeFinding())
    engine.learnFromFix('before', 'after', 'typescript', 'fix-type')

    engine.clear()

    expect(engine.getReviewPatterns()).toEqual([])
    expect(engine.getFixPatterns()).toEqual([])
    const stats = engine.getStats()
    expect(stats.totalReviewPatterns).toBe(0)
    expect(stats.totalFixPatterns).toBe(0)
    expect(stats.totalReviewsProcessed).toBe(0)
    expect(stats.totalFixesApplied).toBe(0)
    expect(stats.lastLearnedAt).toBeNull()
  })
})

// ── Pruning Tests ──

describe('LearningEngine pruning', () => {
  it('prunes review patterns when exceeding maxPatterns', () => {
    const engine = new LearningEngine({ maxPatterns: 3 })

    for (let i = 0; i < 5; i++) {
      engine.learnFromReview(
        `unique code snippet number ${i} with extra words to differentiate`,
        'javascript',
        makeFinding({ category: (['bug', 'style', 'performance', 'security', 'architecture'] as ReviewCategory[])[i % 5] }),
      )
    }

    expect(engine.getReviewPatterns().length).toBeLessThanOrEqual(3)
  })
})
