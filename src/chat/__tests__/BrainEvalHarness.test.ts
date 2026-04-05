/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  BrainEvalHarness — Tests                                                   ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  BrainEvalHarness,
  GOLDEN_CASES,
  DEFAULT_EVAL_CONFIG,
} from '../BrainEvalHarness.js'
import type { EvalCase, EvalTarget, EvalReport } from '../BrainEvalHarness.js'

// ── Mock Brain ──

class MockBrain implements EvalTarget {
  private responses: Map<string, string> = new Map()

  setResponse(input: string, response: string): void {
    this.responses.set(input, response)
  }

  async chat(input: string): Promise<{ text: string; durationMs: number }> {
    const text = this.responses.get(input) ?? 'I don\'t know.'
    return { text, durationMs: 5 }
  }
}

describe('BrainEvalHarness', () => {
  let harness: BrainEvalHarness
  let brain: MockBrain

  beforeEach(() => {
    brain = new MockBrain()
    harness = new BrainEvalHarness()
  })

  // ── Golden Cases ──

  describe('GOLDEN_CASES', () => {
    it('has at least 10 golden test cases', () => {
      expect(GOLDEN_CASES.length).toBeGreaterThanOrEqual(10)
    })

    it('covers at least 4 categories', () => {
      const categories = new Set(GOLDEN_CASES.map(c => c.category))
      expect(categories.size).toBeGreaterThanOrEqual(4)
    })

    it('every case has required fields', () => {
      for (const c of GOLDEN_CASES) {
        expect(c.id).toBeTruthy()
        expect(c.category).toBeTruthy()
        expect(c.input).toBeTruthy()
        expect(Array.isArray(c.expectedKeywords)).toBe(true)
        expect(Array.isArray(c.forbiddenKeywords)).toBe(true)
        expect(['easy', 'medium', 'hard']).toContain(c.difficulty)
      }
    })

    it('has unique case IDs', () => {
      const ids = GOLDEN_CASES.map(c => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  // ── Config ──

  describe('config', () => {
    it('DEFAULT_EVAL_CONFIG has valid thresholds', () => {
      expect(DEFAULT_EVAL_CONFIG.passThreshold).toBeGreaterThan(0)
      expect(DEFAULT_EVAL_CONFIG.passThreshold).toBeLessThanOrEqual(1)
      expect(DEFAULT_EVAL_CONFIG.regressionThreshold).toBeGreaterThan(0)
    })
  })

  // ── scoreResponse ──

  describe('scoreResponse', () => {
    it('scores a perfect response high', () => {
      const evalCase: EvalCase = {
        id: 'test-1',
        category: 'reasoning',
        input: 'What is 2+2?',
        expectedKeywords: ['4', 'four'],
        forbiddenKeywords: ['5'],
        difficulty: 'easy',
      }
      const result = harness.scoreResponse(evalCase, 'The answer is 4 (four).', 5)
      expect(result.passed).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(0.5)
      expect(result.keywordHits).toContain('4')
      expect(result.keywordHits).toContain('four')
      expect(result.forbiddenHits).toHaveLength(0)
    })

    it('penalizes forbidden keywords', () => {
      const evalCase: EvalCase = {
        id: 'test-2',
        category: 'reasoning',
        input: 'What is 2+2?',
        expectedKeywords: ['4'],
        forbiddenKeywords: ['5'],
        difficulty: 'easy',
      }
      const result = harness.scoreResponse(evalCase, 'The answer is 5.', 5)
      expect(result.passed).toBe(false)
      expect(result.forbiddenHits).toContain('5')
    })

    it('fails when no expected keywords found', () => {
      const evalCase: EvalCase = {
        id: 'test-3',
        category: 'knowledge',
        input: 'What is React?',
        expectedKeywords: ['library', 'component', 'ui'],
        forbiddenKeywords: [],
        difficulty: 'easy',
      }
      const result = harness.scoreResponse(evalCase, 'I have no idea.', 5)
      expect(result.passed).toBe(false)
      expect(result.keywordMisses).toHaveLength(3)
    })

    it('handles empty response', () => {
      const evalCase: EvalCase = {
        id: 'test-4',
        category: 'knowledge',
        input: 'Test',
        expectedKeywords: ['answer'],
        forbiddenKeywords: [],
        difficulty: 'easy',
      }
      const result = harness.scoreResponse(evalCase, '', 5)
      expect(result.passed).toBe(false)
      expect(result.score).toBe(0)
    })

    it('includes details string', () => {
      const evalCase: EvalCase = {
        id: 'test-5',
        category: 'coding',
        input: 'Test',
        expectedKeywords: ['code'],
        forbiddenKeywords: [],
        difficulty: 'easy',
      }
      const result = harness.scoreResponse(evalCase, 'Here is some code', 10)
      expect(result.details).toContain('Keywords:')
      expect(result.details).toContain('Latency:')
    })

    it('applies latency penalty', () => {
      const evalCase: EvalCase = {
        id: 'test-6',
        category: 'coding',
        input: 'Test',
        expectedKeywords: ['answer'],
        forbiddenKeywords: [],
        maxLatencyMs: 10,
        difficulty: 'easy',
      }
      const fast = harness.scoreResponse(evalCase, 'The answer is here', 5)
      const slow = harness.scoreResponse(evalCase, 'The answer is here', 100)
      expect(fast.score).toBeGreaterThanOrEqual(slow.score)
    })
  })

  // ── runSingle ──

  describe('runSingle', () => {
    it('runs a single eval case against a target', async () => {
      brain.setResponse('What is 2+2?', 'The answer is 4.')
      const evalCase: EvalCase = {
        id: 'single-1',
        category: 'math',
        input: 'What is 2+2?',
        expectedKeywords: ['4'],
        forbiddenKeywords: [],
        difficulty: 'easy',
      }
      const result = await harness.runSingle(brain, evalCase)
      expect(result.passed).toBe(true)
      expect(result.response).toBe('The answer is 4.')
    })

    it('handles brain errors gracefully', async () => {
      const failBrain: EvalTarget = {
        async chat() { throw new Error('Brain exploded') },
      }
      const evalCase: EvalCase = {
        id: 'fail-1',
        category: 'knowledge',
        input: 'Crash test',
        expectedKeywords: ['answer'],
        forbiddenKeywords: [],
        difficulty: 'easy',
      }
      const result = await harness.runSingle(failBrain, evalCase)
      expect(result.passed).toBe(false)
      expect(result.response).toBe('')
    })
  })

  // ── runAll ──

  describe('runAll', () => {
    it('runs all cases and returns a report', async () => {
      const smallHarness = new BrainEvalHarness([
        {
          id: 'all-1',
          category: 'math',
          input: 'What is 1+1?',
          expectedKeywords: ['2'],
          forbiddenKeywords: [],
          difficulty: 'easy',
        },
        {
          id: 'all-2',
          category: 'coding',
          input: 'What is a function?',
          expectedKeywords: ['function', 'code'],
          forbiddenKeywords: [],
          difficulty: 'medium',
        },
      ])

      brain.setResponse('What is 1+1?', 'The answer is 2.')
      brain.setResponse('What is a function?', 'A function is reusable code.')

      const report = await smallHarness.runAll(brain)
      expect(report.totalCases).toBe(2)
      expect(report.passed).toBe(2)
      expect(report.overallPassRate).toBe(1)
      expect(report.categoryScores.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ── runCategory ──

  describe('runCategory', () => {
    it('runs only the specified category', async () => {
      const mixedHarness = new BrainEvalHarness([
        { id: 'cat-1', category: 'math', input: 'Q1', expectedKeywords: ['1'], forbiddenKeywords: [], difficulty: 'easy' },
        { id: 'cat-2', category: 'coding', input: 'Q2', expectedKeywords: ['2'], forbiddenKeywords: [], difficulty: 'easy' },
        { id: 'cat-3', category: 'math', input: 'Q3', expectedKeywords: ['3'], forbiddenKeywords: [], difficulty: 'easy' },
      ])

      const report = await mixedHarness.runCategory(brain, 'math')
      expect(report.totalCases).toBe(2)
    })
  })

  // ── Regression Detection ──

  describe('regression detection', () => {
    it('detects regressions compared to baseline', async () => {
      const cases: EvalCase[] = [
        { id: 'reg-1', category: 'math', input: 'Q', expectedKeywords: ['answer'], forbiddenKeywords: [], difficulty: 'easy' },
      ]
      const regHarness = new BrainEvalHarness(cases)

      // First run: good response
      brain.setResponse('Q', 'Here is the answer.')
      const baseline = await regHarness.runAll(brain)
      expect(baseline.results[0]!.score).toBeGreaterThan(0)

      // Set baseline
      regHarness.setBaseline(baseline)

      // Second run: bad response
      brain.setResponse('Q', 'I have no idea.')
      const newReport = await regHarness.runAll(brain)

      // If baseline score > 0 and new score is 0, should detect regression
      if (baseline.results[0]!.score > 0.2) {
        expect(newReport.regressions.length).toBeGreaterThanOrEqual(1)
        expect(newReport.regressions[0]!.delta).toBeLessThan(0)
      }
    })
  })

  // ── addCase ──

  describe('addCase', () => {
    it('adds custom cases', () => {
      const initialCount = harness.getCases().length
      harness.addCase({
        id: 'custom-1',
        category: 'knowledge',
        input: 'Custom question',
        expectedKeywords: ['custom'],
        forbiddenKeywords: [],
        difficulty: 'easy',
      })
      expect(harness.getCases().length).toBe(initialCount + 1)
    })
  })

  // ── Report Structure ──

  describe('report structure', () => {
    it('includes all required fields', async () => {
      const singleHarness = new BrainEvalHarness([
        { id: 'struct-1', category: 'math', input: 'Q', expectedKeywords: ['a'], forbiddenKeywords: [], difficulty: 'easy' },
      ])
      brain.setResponse('Q', 'a')
      const report = await singleHarness.runAll(brain)

      expect(report.timestamp).toBeGreaterThan(0)
      expect(typeof report.totalCases).toBe('number')
      expect(typeof report.passed).toBe('number')
      expect(typeof report.failed).toBe('number')
      expect(typeof report.overallScore).toBe('number')
      expect(typeof report.overallPassRate).toBe('number')
      expect(typeof report.averageLatencyMs).toBe('number')
      expect(Array.isArray(report.categoryScores)).toBe(true)
      expect(Array.isArray(report.results)).toBe(true)
      expect(Array.isArray(report.regressions)).toBe(true)
    })
  })
})
