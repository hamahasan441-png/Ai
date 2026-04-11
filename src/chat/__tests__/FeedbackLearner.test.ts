import { describe, it, expect, beforeEach } from 'vitest'
import {
  FeedbackLearner,
  DEFAULT_FEEDBACK_LEARNER_CONFIG,
  type FeedbackSignal,
  type FeedbackSignalType,
  type CorrectionCategory,
} from '../FeedbackLearner'

// ── Helpers ────────────────────────────────────────────────────────────────────

let signalId = 0

function makeSignal(overrides: Partial<FeedbackSignal> = {}): FeedbackSignal {
  return {
    id: `sig_${++signalId}`,
    type: 'thumbs_up',
    timestamp: Date.now(),
    originalOutput: 'original output',
    domain: 'general',
    context: 'test context',
    tags: [],
    ...overrides,
  }
}

function makeCorrection(
  original: string,
  corrected: string,
  overrides: Partial<FeedbackSignal> = {},
): FeedbackSignal {
  return makeSignal({
    type: 'correction',
    originalOutput: original,
    correctedOutput: corrected,
    ...overrides,
  })
}

// ── Construction ───────────────────────────────────────────────────────────────

describe('FeedbackLearner', () => {
  let learner: FeedbackLearner

  beforeEach(() => {
    signalId = 0
    learner = new FeedbackLearner()
  })

  describe('constructor', () => {
    it('creates an instance with default config', () => {
      expect(learner).toBeInstanceOf(FeedbackLearner)
    })

    it('starts with zero signals', () => {
      expect(learner.getSignals()).toHaveLength(0)
    })

    it('starts with zero lessons', () => {
      expect(learner.getLessons()).toHaveLength(0)
    })

    it('starts with zero mistakes', () => {
      expect(learner.getMistakes()).toHaveLength(0)
    })

    it('starts with zeroed stats', () => {
      const stats = learner.getStats()
      expect(stats.totalSignalsReceived).toBe(0)
      expect(stats.totalLessonsLearned).toBe(0)
      expect(stats.totalMistakesTracked).toBe(0)
      expect(stats.avgCalibrationError).toBe(0)
      expect(stats.positiveSignalRate).toBe(0)
      expect(stats.correctionRate).toBe(0)
    })

    it('accepts a partial custom config', () => {
      const custom = new FeedbackLearner({ maxSignals: 100 })
      // Adding 101 signals should prune to 100
      for (let i = 0; i < 101; i++) {
        custom.processFeedback(makeSignal({ id: `s${i}` }))
      }
      expect(custom.getSignals()).toHaveLength(100)
    })

    it('merges custom config with defaults', () => {
      const custom = new FeedbackLearner({ maxLessons: 10, maxMistakes: 5 })
      expect(custom).toBeInstanceOf(FeedbackLearner)
    })

    it('works with empty config object', () => {
      const engine = new FeedbackLearner({})
      expect(engine).toBeInstanceOf(FeedbackLearner)
    })
  })

  // ── DEFAULT_FEEDBACK_LEARNER_CONFIG ──────────────────────────────────────

  describe('DEFAULT_FEEDBACK_LEARNER_CONFIG', () => {
    it('has expected maxSignals', () => {
      expect(DEFAULT_FEEDBACK_LEARNER_CONFIG.maxSignals).toBe(2000)
    })

    it('has expected maxLessons', () => {
      expect(DEFAULT_FEEDBACK_LEARNER_CONFIG.maxLessons).toBe(500)
    })

    it('has expected maxMistakes', () => {
      expect(DEFAULT_FEEDBACK_LEARNER_CONFIG.maxMistakes).toBe(200)
    })

    it('has expected maxCalibrationRecords', () => {
      expect(DEFAULT_FEEDBACK_LEARNER_CONFIG.maxCalibrationRecords).toBe(500)
    })

    it('has expected confidenceDecay', () => {
      expect(DEFAULT_FEEDBACK_LEARNER_CONFIG.confidenceDecay).toBe(0.01)
    })

    it('has expected minSignalsForModel', () => {
      expect(DEFAULT_FEEDBACK_LEARNER_CONFIG.minSignalsForModel).toBe(5)
    })
  })

  // ── processFeedback — signal types ───────────────────────────────────────

  describe('processFeedback', () => {
    it('stores a thumbs_up signal', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      expect(learner.getSignals()).toHaveLength(1)
      expect(learner.getSignals()[0].type).toBe('thumbs_up')
    })

    it('stores a thumbs_down signal', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_down' }))
      expect(learner.getSignals()).toHaveLength(1)
      expect(learner.getSignals()[0].type).toBe('thumbs_down')
    })

    it('stores a correction signal', () => {
      learner.processFeedback(makeCorrection('wrong answer', 'right answer'))
      expect(learner.getSignals()).toHaveLength(1)
    })

    it('stores an edit signal', () => {
      learner.processFeedback(
        makeSignal({
          type: 'edit',
          originalOutput: 'before edit',
          correctedOutput: 'after edit',
        }),
      )
      expect(learner.getSignals()).toHaveLength(1)
    })

    it('stores a follow_up signal', () => {
      learner.processFeedback(makeSignal({ type: 'follow_up' }))
      expect(learner.getSignals()).toHaveLength(1)
    })

    it('stores a regenerate signal', () => {
      learner.processFeedback(makeSignal({ type: 'regenerate' }))
      expect(learner.getSignals()).toHaveLength(1)
    })

    it('stores an explicit_rating signal', () => {
      learner.processFeedback(makeSignal({ type: 'explicit_rating', rating: 4 }))
      expect(learner.getSignals()).toHaveLength(1)
    })

    it('increments totalSignals stat for every signal type', () => {
      const types: FeedbackSignalType[] = [
        'thumbs_up',
        'thumbs_down',
        'correction',
        'edit',
        'follow_up',
        'regenerate',
        'explicit_rating',
      ]
      for (const type of types) {
        learner.processFeedback(makeSignal({ type }))
      }
      expect(learner.getStats().totalSignalsReceived).toBe(7)
    })

    it('tracks positive signals for thumbs_up only', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeSignal({ type: 'thumbs_down' }))
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      expect(learner.getStats().positiveSignalRate).toBeCloseTo(2 / 3)
    })

    it('tracks correction rate for correction and edit signals', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeCorrection('a', 'b'))
      learner.processFeedback(makeSignal({ type: 'edit', correctedOutput: 'edited' }))
      expect(learner.getStats().correctionRate).toBeCloseTo(2 / 3)
    })

    it('prunes signals when exceeding maxSignals', () => {
      const small = new FeedbackLearner({ maxSignals: 3 })
      for (let i = 0; i < 5; i++) {
        small.processFeedback(makeSignal({ id: `s${i}` }))
      }
      expect(small.getSignals()).toHaveLength(3)
    })

    it('preserves newest signals when pruning', () => {
      const small = new FeedbackLearner({ maxSignals: 2 })
      small.processFeedback(makeSignal({ id: 'oldest' }))
      small.processFeedback(makeSignal({ id: 'middle' }))
      small.processFeedback(makeSignal({ id: 'newest' }))
      const ids = small.getSignals().map(s => s.id)
      expect(ids).toContain('newest')
      expect(ids).not.toContain('oldest')
    })

    it('handles multiple rapid signals', () => {
      for (let i = 0; i < 50; i++) {
        learner.processFeedback(makeSignal({ id: `rapid_${i}` }))
      }
      expect(learner.getSignals()).toHaveLength(50)
      expect(learner.getStats().totalSignalsReceived).toBe(50)
    })
  })

  // ── Correction learning ──────────────────────────────────────────────────

  describe('correction learning', () => {
    it('extracts a lesson from a correction signal', () => {
      learner.processFeedback(
        makeCorrection('The sky is green', 'The sky is blue — that was wrong'),
      )
      expect(learner.getLessons()).toHaveLength(1)
    })

    it('extracts a lesson from an edit signal with correctedOutput', () => {
      learner.processFeedback(
        makeSignal({
          type: 'edit',
          originalOutput: 'old code',
          correctedOutput: 'new code',
        }),
      )
      expect(learner.getLessons()).toHaveLength(1)
    })

    it('does not extract a lesson from a correction without correctedOutput', () => {
      learner.processFeedback(makeSignal({ type: 'correction' }))
      expect(learner.getLessons()).toHaveLength(0)
    })

    it('does not extract a lesson from thumbs_up', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      expect(learner.getLessons()).toHaveLength(0)
    })

    it('sets lesson domain from signal', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong', { domain: 'programming' }))
      expect(learner.getLessons()[0].domain).toBe('programming')
    })

    it('sets initial confidence on lesson', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      expect(learner.getLessons()[0].confidence).toBe(0.7)
    })

    it('sets timesApplied to 0 initially', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      expect(learner.getLessons()[0].timesApplied).toBe(0)
    })

    it('truncates long originals in lesson', () => {
      const longStr = 'x'.repeat(500)
      learner.processFeedback(makeCorrection(longStr, 'short was wrong'))
      expect(learner.getLessons()[0].original.length).toBeLessThanOrEqual(300)
    })

    it('truncates long corrected text in lesson', () => {
      const longStr = 'y'.repeat(500)
      learner.processFeedback(makeCorrection('short', longStr + ' was wrong'))
      expect(learner.getLessons()[0].corrected.length).toBeLessThanOrEqual(300)
    })

    it('assigns a unique id to each lesson', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      learner.processFeedback(makeCorrection('c', 'd was wrong'))
      const ids = learner.getLessons().map(l => l.id)
      expect(new Set(ids).size).toBe(2)
    })

    it('increments totalLessonsLearned stat', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      learner.processFeedback(makeCorrection('c', 'd was wrong'))
      expect(learner.getStats().totalLessonsLearned).toBe(2)
    })

    it('detects factual_error category', () => {
      learner.processFeedback(makeCorrection('2+2=5', 'That is incorrect, 2+2=4'))
      expect(learner.getLessons()[0].category).toBe('factual_error')
    })

    it('detects style_preference category', () => {
      learner.processFeedback(makeCorrection('verbose answer', 'I prefer a different style'))
      expect(learner.getLessons()[0].category).toBe('style_preference')
    })

    it('detects format_preference category', () => {
      learner.processFeedback(makeCorrection('plain text', 'Use bullet format please'))
      expect(learner.getLessons()[0].category).toBe('format_preference')
    })

    it('detects detail_level category', () => {
      learner.processFeedback(makeCorrection('long answer', 'This is too long, be brief'))
      expect(learner.getLessons()[0].category).toBe('detail_level')
    })

    it('detects tone_adjustment category', () => {
      learner.processFeedback(makeCorrection('hey dude', 'Please be more formal and professional'))
      expect(learner.getLessons()[0].category).toBe('tone_adjustment')
    })

    it('detects missing_information category', () => {
      learner.processFeedback(
        makeCorrection('partial info', 'You left out the missing details, add them'),
      )
      expect(learner.getLessons()[0].category).toBe('missing_information')
    })

    it('detects unnecessary_information category', () => {
      learner.processFeedback(
        makeCorrection('too much stuff', 'This has unnecessary info, remove excess'),
      )
      expect(learner.getLessons()[0].category).toBe('unnecessary_information')
    })

    it('detects wrong_approach category', () => {
      learner.processFeedback(makeCorrection('recursion', 'Use a different approach instead'))
      expect(learner.getLessons()[0].category).toBe('wrong_approach')
    })

    it('detects terminology category', () => {
      learner.processFeedback(makeCorrection('the thing', 'Use the correct term for this phrase'))
      expect(learner.getLessons()[0].category).toBe('terminology')
    })

    it('prunes lessons when exceeding maxLessons', () => {
      const small = new FeedbackLearner({ maxLessons: 3 })
      for (let i = 0; i < 5; i++) {
        small.processFeedback(makeCorrection(`original_${i}`, `corrected_${i} was incorrect`))
      }
      expect(small.getLessons().length).toBeLessThanOrEqual(3)
    })

    it('generates lesson text for detail_level with more detail', () => {
      learner.processFeedback(
        makeCorrection('short', 'This is too short, elaborate much more detail please'),
      )
      const lesson = learner.getLessons()[0]
      expect(lesson.lesson).toContain('detail')
    })
  })

  // ── Mistake tracking ─────────────────────────────────────────────────────

  describe('mistake tracking', () => {
    it('tracks a mistake from a correction', () => {
      learner.processFeedback(makeCorrection('mistake output', 'correct output was wrong'))
      expect(learner.getMistakes()).toHaveLength(1)
    })

    it('sets initial severity to minor', () => {
      learner.processFeedback(makeCorrection('mistake', 'fix was wrong'))
      expect(learner.getMistakes()[0].severity).toBe('minor')
    })

    it('sets occurrences to 1 on first encounter', () => {
      learner.processFeedback(makeCorrection('mistake', 'fix was wrong'))
      expect(learner.getMistakes()[0].occurrences).toBe(1)
    })

    it('increments occurrences on repeated same-pattern mistake', () => {
      learner.processFeedback(
        makeCorrection('mistake output here', 'fix was wrong', { domain: 'general' }),
      )
      learner.processFeedback(
        makeCorrection('mistake output here', 'fix again was wrong', { domain: 'general' }),
      )
      const mistakes = learner.getMistakes()
      const relevant = mistakes.find(m => m.occurrences > 1)
      expect(relevant).toBeDefined()
      expect(relevant!.occurrences).toBe(2)
    })

    it('escalates severity to moderate after repeated occurrences', () => {
      for (let i = 0; i < 2; i++) {
        learner.processFeedback(
          makeCorrection('same mistake again', 'correction was wrong', { domain: 'general' }),
        )
      }
      const mistakes = learner.getMistakes()
      const repeated = mistakes.find(m => m.occurrences >= 2)
      expect(repeated).toBeDefined()
      expect(repeated!.severity).toBe('moderate')
    })

    it('escalates severity to major after many occurrences', () => {
      for (let i = 0; i < 4; i++) {
        learner.processFeedback(
          makeCorrection('same mistake again', 'correction was wrong', { domain: 'general' }),
        )
      }
      const mistakes = learner.getMistakes()
      const repeated = mistakes.find(m => m.occurrences >= 4)
      expect(repeated).toBeDefined()
      expect(repeated!.severity).toBe('major')
    })

    it('records domain on tracked mistake', () => {
      learner.processFeedback(makeCorrection('err', 'fix was wrong', { domain: 'security' }))
      expect(learner.getMistakes()[0].domain).toBe('security')
    })

    it('truncates long patterns to 200 chars', () => {
      const longPattern = 'p'.repeat(300)
      learner.processFeedback(makeCorrection(longPattern, 'fix was wrong'))
      expect(learner.getMistakes()[0].pattern.length).toBeLessThanOrEqual(200)
    })

    it('truncates long corrections to 200 chars', () => {
      const longCorrection = 'c'.repeat(300) + ' was wrong'
      learner.processFeedback(makeCorrection('err', longCorrection))
      expect(learner.getMistakes()[0].correction.length).toBeLessThanOrEqual(200)
    })

    it('increments totalMistakesTracked stat', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      expect(learner.getStats().totalMistakesTracked).toBe(1)
    })

    it('prunes mistakes when exceeding maxMistakes', () => {
      const small = new FeedbackLearner({ maxMistakes: 3 })
      for (let i = 0; i < 5; i++) {
        small.processFeedback(
          makeCorrection(`unique_mistake_${i}`, `fix_${i} was wrong`, { domain: `dom${i}` }),
        )
      }
      expect(small.getMistakes().length).toBeLessThanOrEqual(3)
    })
  })

  // ── checkForKnownMistakes ────────────────────────────────────────────────

  describe('checkForKnownMistakes', () => {
    it('returns empty array when no mistakes are tracked', () => {
      expect(learner.checkForKnownMistakes('anything')).toEqual([])
    })

    it('finds a matching mistake when output overlaps with a pattern', () => {
      learner.processFeedback(
        makeCorrection(
          'The function returns undefined because the variable is not initialized',
          'The function was incorrect and returns null',
        ),
      )
      const matches = learner.checkForKnownMistakes(
        'This function returns undefined because variable was not initialized',
      )
      expect(matches.length).toBeGreaterThan(0)
    })

    it('returns empty when output does not match any pattern', () => {
      learner.processFeedback(makeCorrection('specific alpha beta gamma', 'correction was wrong'))
      const matches = learner.checkForKnownMistakes('completely unrelated content about zeta')
      expect(matches).toHaveLength(0)
    })

    it('sorts matches by severity using localeCompare descending', () => {
      // Create a major mistake (4+ occurrences)
      for (let i = 0; i < 4; i++) {
        learner.processFeedback(
          makeCorrection('always returns undefined from the function call', 'fix was wrong', {
            domain: 'general',
          }),
        )
      }
      // Create a minor mistake in a different domain/pattern
      learner.processFeedback(
        makeCorrection('compiles with warnings during the build process', 'fixed was wrong', {
          domain: 'programming',
        }),
      )
      const matches = learner.checkForKnownMistakes(
        'returns undefined from the function call and compiles with warnings during build process',
      )
      if (matches.length >= 2) {
        // Source sorts via b.severity.localeCompare(a.severity) — alphabetical descending
        for (let i = 0; i < matches.length - 1; i++) {
          expect(matches[i].severity.localeCompare(matches[i + 1].severity)).toBeGreaterThanOrEqual(
            0,
          )
        }
      }
    })

    it('ignores words with 3 or fewer characters in pattern matching', () => {
      learner.processFeedback(makeCorrection('a to the is and or', 'fix was wrong'))
      const matches = learner.checkForKnownMistakes('a to the is and or')
      expect(matches).toHaveLength(0)
    })

    it('performs case-insensitive matching', () => {
      learner.processFeedback(
        makeCorrection(
          'The Variable Should Be Initialized Properly',
          'Fixed the initialization was wrong',
        ),
      )
      const matches = learner.checkForKnownMistakes('the variable should be initialized properly')
      expect(matches.length).toBeGreaterThan(0)
    })
  })

  // ── Preference modeling ──────────────────────────────────────────────────

  describe('preference modeling', () => {
    it('returns null when no signals have been processed', () => {
      expect(learner.getPreferenceModel()).toBeNull()
    })

    it('creates a preference model after first signal', () => {
      learner.processFeedback(makeSignal())
      const model = learner.getPreferenceModel()
      expect(model).not.toBeNull()
    })

    it('uses "default" userId when none specified', () => {
      learner.processFeedback(makeSignal())
      const model = learner.getPreferenceModel()
      expect(model!.userId).toBe('default')
    })

    it('returns null for unknown userId', () => {
      learner.processFeedback(makeSignal())
      expect(learner.getPreferenceModel('unknown_user')).toBeNull()
    })

    it('increments signalCount on each processed signal', () => {
      learner.processFeedback(makeSignal())
      learner.processFeedback(makeSignal())
      learner.processFeedback(makeSignal())
      expect(learner.getPreferenceModel()!.signalCount).toBe(3)
    })

    it('increases confidence as more signals are processed', () => {
      learner.processFeedback(makeSignal())
      const low = learner.getPreferenceModel()!.confidence
      for (let i = 0; i < 10; i++) {
        learner.processFeedback(makeSignal())
      }
      const high = learner.getPreferenceModel()!.confidence
      expect(high).toBeGreaterThan(low)
    })

    it('caps confidence at 1.0', () => {
      for (let i = 0; i < 100; i++) {
        learner.processFeedback(makeSignal())
      }
      expect(learner.getPreferenceModel()!.confidence).toBeLessThanOrEqual(1)
    })

    it('starts with moderate defaults', () => {
      learner.processFeedback(makeSignal())
      const model = learner.getPreferenceModel()!
      expect(model.responseLength).toBe('moderate')
      expect(model.formality).toBe('balanced')
      expect(model.codeStyle).toBe('commented')
      expect(model.explanationDepth).toBe('moderate')
    })

    it('detects concise length preference from shorter corrections', () => {
      learner.processFeedback(makeCorrection('A'.repeat(200), 'Short was wrong'))
      expect(learner.getPreferenceModel()!.responseLength).toBe('concise')
    })

    it('detects detailed length preference from longer corrections', () => {
      learner.processFeedback(
        makeCorrection('Short', 'A'.repeat(200) + ' this was wrong and needs more detail'),
      )
      expect(learner.getPreferenceModel()!.responseLength).toBe('detailed')
    })

    it('detects step-by-step preference from numbered lists', () => {
      learner.processFeedback(makeCorrection('text', '1. First step\n2. Second step was wrong'))
      expect(learner.getPreferenceModel()!.prefersStepByStep).toBe(true)
    })

    it('detects step-by-step preference from bullet lists', () => {
      learner.processFeedback(makeCorrection('text', '• First point\n• Second point was wrong'))
      expect(learner.getPreferenceModel()!.prefersStepByStep).toBe(true)
    })

    it('detects commented code style from // comments', () => {
      learner.processFeedback(makeCorrection('code', '// this comment was wrong\nconst x = 1'))
      expect(learner.getPreferenceModel()!.codeStyle).toBe('commented')
    })

    it('detects commented code style from /* comments', () => {
      learner.processFeedback(makeCorrection('code', '/* block comment was wrong */\nconst x = 1'))
      expect(learner.getPreferenceModel()!.codeStyle).toBe('commented')
    })

    it('tracks top domains from signals', () => {
      learner.processFeedback(makeSignal({ domain: 'programming' }))
      learner.processFeedback(makeSignal({ domain: 'security' }))
      const model = learner.getPreferenceModel()!
      expect(model.topDomains).toContain('programming')
      expect(model.topDomains).toContain('security')
    })

    it('limits top domains to 5', () => {
      for (let i = 0; i < 10; i++) {
        learner.processFeedback(makeSignal({ domain: `domain_${i}` }))
      }
      expect(learner.getPreferenceModel()!.topDomains.length).toBeLessThanOrEqual(5)
    })

    it('does not duplicate domains in topDomains', () => {
      learner.processFeedback(makeSignal({ domain: 'programming' }))
      learner.processFeedback(makeSignal({ domain: 'programming' }))
      const domains = learner.getPreferenceModel()!.topDomains
      expect(domains.filter(d => d === 'programming')).toHaveLength(1)
    })

    it('sets lastUpdated timestamp', () => {
      const before = Date.now()
      learner.processFeedback(makeSignal())
      const model = learner.getPreferenceModel()!
      expect(model.lastUpdated).toBeGreaterThanOrEqual(before)
    })

    it('defaults preferredLanguage to english', () => {
      learner.processFeedback(makeSignal())
      expect(learner.getPreferenceModel()!.preferredLanguage).toBe('english')
    })

    it('defaults prefersExamples to true', () => {
      learner.processFeedback(makeSignal())
      expect(learner.getPreferenceModel()!.prefersExamples).toBe(true)
    })
  })

  // ── Quality calibration ──────────────────────────────────────────────────

  describe('quality calibration', () => {
    it('starts with zero calibration records', () => {
      const summary = learner.getCalibrationSummary()
      expect(summary.totalRecords).toBe(0)
    })

    it('returns zeroed summary when no records exist', () => {
      const summary = learner.getCalibrationSummary()
      expect(summary.calibrationError).toBe(0)
      expect(summary.overConfidenceRate).toBe(0)
      expect(summary.underConfidenceRate).toBe(0)
      expect(summary.domainCalibration).toEqual({})
    })

    it('records a calibration data point', () => {
      learner.recordCalibration(0.8, 0.7)
      expect(learner.getCalibrationSummary().totalRecords).toBe(1)
    })

    it('computes calibration error correctly', () => {
      learner.recordCalibration(0.8, 0.6)
      expect(learner.getCalibrationSummary().calibrationError).toBeCloseTo(0.2)
    })

    it('computes average calibration error across records', () => {
      learner.recordCalibration(0.8, 0.6) // error = 0.2
      learner.recordCalibration(0.5, 0.5) // error = 0.0
      expect(learner.getCalibrationSummary().calibrationError).toBeCloseTo(0.1)
    })

    it('tracks overconfidence when predicted > actual + 0.1', () => {
      learner.recordCalibration(0.9, 0.5) // overconfident
      expect(learner.getCalibrationSummary().overConfidenceRate).toBe(1)
    })

    it('tracks underconfidence when predicted < actual - 0.1', () => {
      learner.recordCalibration(0.3, 0.8) // underconfident
      expect(learner.getCalibrationSummary().underConfidenceRate).toBe(1)
    })

    it('does not count within-tolerance as over or under confident', () => {
      learner.recordCalibration(0.5, 0.5) // well-calibrated
      const summary = learner.getCalibrationSummary()
      expect(summary.overConfidenceRate).toBe(0)
      expect(summary.underConfidenceRate).toBe(0)
    })

    it('tracks domain-specific calibration errors', () => {
      learner.recordCalibration(0.9, 0.5, 'programming')
      learner.recordCalibration(0.7, 0.6, 'security')
      const summary = learner.getCalibrationSummary()
      expect(summary.domainCalibration['programming']).toBeCloseTo(0.4)
      expect(summary.domainCalibration['security']).toBeCloseTo(0.1)
    })

    it('defaults domain to general when not specified', () => {
      learner.recordCalibration(0.8, 0.6)
      const summary = learner.getCalibrationSummary()
      expect(summary.domainCalibration['general']).toBeDefined()
    })

    it('updates avgCalibrationError in stats', () => {
      learner.recordCalibration(0.9, 0.6)
      expect(learner.getStats().avgCalibrationError).toBeCloseTo(0.3)
    })

    it('prunes calibration records when exceeding max', () => {
      const small = new FeedbackLearner({ maxCalibrationRecords: 3 })
      for (let i = 0; i < 5; i++) {
        small.recordCalibration(0.8, 0.5 + i * 0.05)
      }
      expect(small.getCalibrationSummary().totalRecords).toBe(3)
    })

    it('computes rates as fractions of total records', () => {
      learner.recordCalibration(0.9, 0.5) // over
      learner.recordCalibration(0.5, 0.5) // neither
      learner.recordCalibration(0.3, 0.8) // under
      learner.recordCalibration(0.5, 0.5) // neither
      const summary = learner.getCalibrationSummary()
      expect(summary.overConfidenceRate).toBeCloseTo(0.25)
      expect(summary.underConfidenceRate).toBeCloseTo(0.25)
    })
  })

  // ── Reward summary ───────────────────────────────────────────────────────

  describe('getRewardSummary', () => {
    it('returns zeroed summary when no signals exist', () => {
      const summary = learner.getRewardSummary()
      expect(summary.totalSignals).toBe(0)
      expect(summary.positiveRate).toBe(0)
      expect(summary.correctionRate).toBe(0)
      expect(summary.avgRating).toBe(0)
      expect(summary.topCorrectionCategories).toEqual([])
      expect(summary.rewardTrend).toBe('stable')
    })

    it('counts total signals', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeSignal({ type: 'thumbs_down' }))
      expect(learner.getRewardSummary().totalSignals).toBe(2)
    })

    it('computes positive rate', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeSignal({ type: 'thumbs_down' }))
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      expect(learner.getRewardSummary().positiveRate).toBeCloseTo(2 / 3)
    })

    it('computes correction rate', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      expect(learner.getRewardSummary().correctionRate).toBeCloseTo(0.5)
    })

    it('computes average rating from explicit_rating signals', () => {
      learner.processFeedback(makeSignal({ type: 'explicit_rating', rating: 4 }))
      learner.processFeedback(makeSignal({ type: 'explicit_rating', rating: 2 }))
      expect(learner.getRewardSummary().avgRating).toBeCloseTo(3)
    })

    it('ignores signals without rating in avgRating', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeSignal({ type: 'explicit_rating', rating: 5 }))
      expect(learner.getRewardSummary().avgRating).toBeCloseTo(5)
    })

    it('returns top correction categories', () => {
      learner.processFeedback(makeCorrection('x', 'That is incorrect and wrong'))
      learner.processFeedback(makeCorrection('y', 'Use bullet format please'))
      const categories = learner.getRewardSummary().topCorrectionCategories
      expect(categories.length).toBeGreaterThan(0)
    })

    it('limits top correction categories to 3', () => {
      const corrections = [
        'This is incorrect and wrong',
        'I prefer a different style',
        'Use bullet format please',
        'Be more brief, too long',
        'Be more formal and professional',
      ]
      for (const c of corrections) {
        learner.processFeedback(makeCorrection('x', c))
      }
      expect(learner.getRewardSummary().topCorrectionCategories.length).toBeLessThanOrEqual(3)
    })

    it('detects improving trend when second half has more positives', () => {
      // First half: mostly negative
      for (let i = 0; i < 5; i++) {
        learner.processFeedback(makeSignal({ type: 'thumbs_down', timestamp: 1000 + i }))
      }
      // Second half: mostly positive
      for (let i = 0; i < 5; i++) {
        learner.processFeedback(makeSignal({ type: 'thumbs_up', timestamp: 2000 + i }))
      }
      expect(learner.getRewardSummary().rewardTrend).toBe('improving')
    })

    it('detects declining trend when second half has fewer positives', () => {
      // First half: mostly positive
      for (let i = 0; i < 5; i++) {
        learner.processFeedback(makeSignal({ type: 'thumbs_up', timestamp: 1000 + i }))
      }
      // Second half: mostly negative
      for (let i = 0; i < 5; i++) {
        learner.processFeedback(makeSignal({ type: 'thumbs_down', timestamp: 2000 + i }))
      }
      expect(learner.getRewardSummary().rewardTrend).toBe('declining')
    })

    it('detects stable trend when halves are similar', () => {
      for (let i = 0; i < 10; i++) {
        learner.processFeedback(makeSignal({ type: 'thumbs_down', timestamp: 1000 + i }))
      }
      expect(learner.getRewardSummary().rewardTrend).toBe('stable')
    })

    it('filters signals by windowMs when provided', () => {
      const now = Date.now()
      learner.processFeedback(makeSignal({ type: 'thumbs_up', timestamp: now - 10000 }))
      learner.processFeedback(makeSignal({ type: 'thumbs_up', timestamp: now }))
      const summary = learner.getRewardSummary(5000)
      expect(summary.totalSignals).toBe(1)
    })

    it('includes all signals when windowMs is not provided', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up', timestamp: 1 }))
      learner.processFeedback(makeSignal({ type: 'thumbs_up', timestamp: Date.now() }))
      const summary = learner.getRewardSummary()
      expect(summary.totalSignals).toBe(2)
    })
  })

  // ── findRelevantLessons ──────────────────────────────────────────────────

  describe('findRelevantLessons', () => {
    it('returns empty array when no lessons exist', () => {
      expect(learner.findRelevantLessons('anything')).toEqual([])
    })

    it('finds lessons matching context keywords', () => {
      learner.processFeedback(
        makeCorrection(
          'The function returns undefined when the variable is null',
          'The function was incorrect, should return default value',
        ),
      )
      const results = learner.findRelevantLessons('Factual correction about function returns')
      expect(results.length).toBeGreaterThan(0)
    })

    it('boosts score for matching domain', () => {
      learner.processFeedback(
        makeCorrection('error in code', 'fixed code was incorrect', { domain: 'programming' }),
      )
      const withDomain = learner.findRelevantLessons('Factual correction about code', 'programming')
      const withoutDomain = learner.findRelevantLessons('Factual correction about code', 'trading')
      // withDomain should find results (domain match boosts score)
      expect(withDomain.length).toBeGreaterThanOrEqual(withoutDomain.length)
    })

    it('returns at most 10 lessons', () => {
      for (let i = 0; i < 15; i++) {
        learner.processFeedback(makeCorrection(`error ${i}`, `Factual correction ${i} was wrong`))
      }
      const results = learner.findRelevantLessons('Factual correction error')
      expect(results.length).toBeLessThanOrEqual(10)
    })

    it('sorts results by relevance score descending', () => {
      learner.processFeedback(
        makeCorrection('security vulnerability exploit', 'Fixed security was wrong', {
          domain: 'security',
        }),
      )
      learner.processFeedback(
        makeCorrection('unrelated topic', 'Fixed was wrong', { domain: 'general' }),
      )
      const results = learner.findRelevantLessons(
        'Factual correction security vulnerability',
        'security',
      )
      if (results.length >= 2) {
        // First result should be the more relevant one
        expect(results[0].domain).toBe('security')
      }
    })

    it('returns empty for completely unrelated context', () => {
      learner.processFeedback(makeCorrection('alpha beta gamma', 'delta epsilon was wrong'))
      const results = learner.findRelevantLessons('xyz quantum physics')
      expect(results).toHaveLength(0)
    })
  })

  // ── Public accessors ─────────────────────────────────────────────────────

  describe('getLessons', () => {
    it('returns a copy of lessons array', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      const lessons1 = learner.getLessons()
      const lessons2 = learner.getLessons()
      expect(lessons1).toEqual(lessons2)
      expect(lessons1).not.toBe(lessons2)
    })
  })

  describe('getMistakes', () => {
    it('returns a copy of mistakes array', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      const mistakes1 = learner.getMistakes()
      const mistakes2 = learner.getMistakes()
      expect(mistakes1).toEqual(mistakes2)
      expect(mistakes1).not.toBe(mistakes2)
    })
  })

  describe('getSignals', () => {
    it('returns a copy of signals array', () => {
      learner.processFeedback(makeSignal())
      const signals1 = learner.getSignals()
      const signals2 = learner.getSignals()
      expect(signals1).toEqual(signals2)
      expect(signals1).not.toBe(signals2)
    })
  })

  // ── Stats ────────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('reflects total signals received', () => {
      learner.processFeedback(makeSignal())
      learner.processFeedback(makeSignal())
      expect(learner.getStats().totalSignalsReceived).toBe(2)
    })

    it('reflects total lessons learned', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      expect(learner.getStats().totalLessonsLearned).toBe(1)
    })

    it('reflects total mistakes tracked', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      expect(learner.getStats().totalMistakesTracked).toBe(1)
    })

    it('computes avgCalibrationError from records', () => {
      learner.recordCalibration(0.8, 0.6) // 0.2
      learner.recordCalibration(0.7, 0.5) // 0.2
      expect(learner.getStats().avgCalibrationError).toBeCloseTo(0.2)
    })

    it('returns 0 avgCalibrationError when no calibrations', () => {
      expect(learner.getStats().avgCalibrationError).toBe(0)
    })

    it('computes positiveSignalRate correctly', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeSignal({ type: 'thumbs_down' }))
      expect(learner.getStats().positiveSignalRate).toBeCloseTo(2 / 3)
    })

    it('returns 0 positiveSignalRate when no signals', () => {
      expect(learner.getStats().positiveSignalRate).toBe(0)
    })

    it('computes correctionRate correctly', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      expect(learner.getStats().correctionRate).toBeCloseTo(0.5)
    })

    it('returns 0 correctionRate when no signals', () => {
      expect(learner.getStats().correctionRate).toBe(0)
    })
  })

  // ── Serialization / deserialization ──────────────────────────────────────

  describe('serialization', () => {
    it('returns a JSON string from serialize()', () => {
      const json = learner.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('serialized output contains signals key', () => {
      learner.processFeedback(makeSignal())
      const data = JSON.parse(learner.serialize())
      expect(Array.isArray(data.signals)).toBe(true)
    })

    it('serialized output contains lessons key', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      const data = JSON.parse(learner.serialize())
      expect(Array.isArray(data.lessons)).toBe(true)
    })

    it('serialized output contains mistakes key', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      const data = JSON.parse(learner.serialize())
      expect(Array.isArray(data.mistakes)).toBe(true)
    })

    it('serialized output contains calibrationRecords key', () => {
      learner.recordCalibration(0.8, 0.6)
      const data = JSON.parse(learner.serialize())
      expect(Array.isArray(data.calibrationRecords)).toBe(true)
    })

    it('serialized output contains preferenceModels key', () => {
      learner.processFeedback(makeSignal())
      const data = JSON.parse(learner.serialize())
      expect(Array.isArray(data.preferenceModels)).toBe(true)
    })

    it('serialized output contains stats key', () => {
      const data = JSON.parse(learner.serialize())
      expect(data.stats).toBeDefined()
    })

    it('limits serialized signals to 200', () => {
      for (let i = 0; i < 250; i++) {
        learner.processFeedback(makeSignal({ id: `s${i}` }))
      }
      const data = JSON.parse(learner.serialize())
      expect(data.signals.length).toBeLessThanOrEqual(200)
    })

    it('limits serialized calibration records to 100', () => {
      for (let i = 0; i < 150; i++) {
        learner.recordCalibration(0.5, 0.5)
      }
      const data = JSON.parse(learner.serialize())
      expect(data.calibrationRecords.length).toBeLessThanOrEqual(100)
    })
  })

  describe('deserialization', () => {
    it('restores signals from serialized data', () => {
      learner.processFeedback(makeSignal({ id: 'test_signal' }))
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json)
      expect(restored.getSignals().length).toBeGreaterThan(0)
      expect(restored.getSignals()[0].id).toBe('test_signal')
    })

    it('restores lessons from serialized data', () => {
      learner.processFeedback(makeCorrection('orig', 'fix was wrong'))
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json)
      expect(restored.getLessons().length).toBeGreaterThan(0)
    })

    it('restores mistakes from serialized data', () => {
      learner.processFeedback(makeCorrection('orig', 'fix was wrong'))
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json)
      expect(restored.getMistakes().length).toBeGreaterThan(0)
    })

    it('restores calibration records', () => {
      learner.recordCalibration(0.8, 0.6)
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json)
      expect(restored.getCalibrationSummary().totalRecords).toBe(1)
    })

    it('restores preference models', () => {
      learner.processFeedback(makeSignal())
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json)
      expect(restored.getPreferenceModel()).not.toBeNull()
    })

    it('restores stats', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json)
      const stats = restored.getStats()
      expect(stats.totalSignalsReceived).toBe(2)
      expect(stats.totalLessonsLearned).toBe(1)
    })

    it('accepts custom config during deserialization', () => {
      learner.processFeedback(makeSignal())
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json, { maxSignals: 10 })
      expect(restored).toBeInstanceOf(FeedbackLearner)
    })

    it('returns fresh engine on invalid JSON', () => {
      const restored = FeedbackLearner.deserialize('not valid json')
      expect(restored).toBeInstanceOf(FeedbackLearner)
      expect(restored.getSignals()).toHaveLength(0)
    })

    it('returns fresh engine on empty string', () => {
      const restored = FeedbackLearner.deserialize('')
      expect(restored).toBeInstanceOf(FeedbackLearner)
      expect(restored.getSignals()).toHaveLength(0)
    })

    it('handles missing keys gracefully', () => {
      const restored = FeedbackLearner.deserialize('{}')
      expect(restored).toBeInstanceOf(FeedbackLearner)
      expect(restored.getSignals()).toHaveLength(0)
      expect(restored.getLessons()).toHaveLength(0)
    })

    it('handles partial data gracefully', () => {
      const partial = JSON.stringify({ signals: [makeSignal({ id: 'partial' })] })
      const restored = FeedbackLearner.deserialize(partial)
      expect(restored.getSignals()).toHaveLength(1)
      expect(restored.getLessons()).toHaveLength(0)
    })

    it('round-trips full state through serialize/deserialize', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up' }))
      learner.processFeedback(makeCorrection('err', 'fix was wrong'))
      learner.recordCalibration(0.8, 0.6, 'programming')
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json)
      expect(restored.getSignals().length).toBe(learner.getSignals().length)
      expect(restored.getLessons().length).toBe(learner.getLessons().length)
      expect(restored.getMistakes().length).toBe(learner.getMistakes().length)
      expect(restored.getCalibrationSummary().totalRecords).toBe(
        learner.getCalibrationSummary().totalRecords,
      )
    })
  })

  // ── Edge cases ───────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles empty originalOutput in signal', () => {
      learner.processFeedback(makeSignal({ originalOutput: '' }))
      expect(learner.getSignals()).toHaveLength(1)
    })

    it('handles empty domain in signal', () => {
      learner.processFeedback(makeSignal({ domain: '' }))
      expect(learner.getSignals()).toHaveLength(1)
    })

    it('handles empty context in signal', () => {
      learner.processFeedback(makeSignal({ context: '' }))
      expect(learner.getSignals()).toHaveLength(1)
    })

    it('handles empty tags array in signal', () => {
      learner.processFeedback(makeSignal({ tags: [] }))
      expect(learner.getSignals()).toHaveLength(1)
    })

    it('handles correction where original equals corrected', () => {
      learner.processFeedback(makeCorrection('same text', 'same text'))
      expect(learner.getLessons()).toHaveLength(1)
    })

    it('handles very long original and corrected output', () => {
      const long = 'x'.repeat(10000)
      learner.processFeedback(makeCorrection(long, long + ' was wrong'))
      expect(learner.getLessons()).toHaveLength(1)
      expect(learner.getMistakes()).toHaveLength(1)
    })

    it('handles calibration with identical predicted and actual', () => {
      learner.recordCalibration(0.5, 0.5)
      expect(learner.getCalibrationSummary().calibrationError).toBe(0)
    })

    it('handles calibration with zero values', () => {
      learner.recordCalibration(0, 0)
      expect(learner.getCalibrationSummary().calibrationError).toBe(0)
    })

    it('handles calibration with max values', () => {
      learner.recordCalibration(1, 1)
      expect(learner.getCalibrationSummary().calibrationError).toBe(0)
    })

    it('handles getRewardSummary with windowMs of 0', () => {
      learner.processFeedback(makeSignal({ type: 'thumbs_up', timestamp: Date.now() }))
      const summary = learner.getRewardSummary(0)
      expect(summary.totalSignals).toBe(1)
    })

    it('handles findRelevantLessons with empty context', () => {
      learner.processFeedback(makeCorrection('a', 'b was wrong'))
      const results = learner.findRelevantLessons('')
      expect(Array.isArray(results)).toBe(true)
    })

    it('handles checkForKnownMistakes with empty string', () => {
      learner.processFeedback(makeCorrection('a pattern', 'fix was wrong'))
      const matches = learner.checkForKnownMistakes('')
      expect(Array.isArray(matches)).toBe(true)
    })

    it('handles multiple correction categories in one session', () => {
      const categories: Array<{ corrected: string; expected: CorrectionCategory }> = [
        { corrected: 'That is incorrect and wrong', expected: 'factual_error' },
        { corrected: 'I prefer this style instead', expected: 'style_preference' },
        { corrected: 'Use bullet format layout', expected: 'format_preference' },
      ]
      for (const { corrected } of categories) {
        learner.processFeedback(makeCorrection('original', corrected))
      }
      expect(learner.getLessons()).toHaveLength(3)
    })

    it('preference model handles correction with no length change', () => {
      const text = 'exactly same length text here'
      learner.processFeedback(makeCorrection(text, text.replace('same', 'diff') + ' wrong'))
      // Should not crash and model should exist
      expect(learner.getPreferenceModel()).not.toBeNull()
    })

    it('serialization then deserialization preserves preference model fields', () => {
      learner.processFeedback(makeCorrection('A'.repeat(200), 'Short was wrong'))
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json)
      const model = restored.getPreferenceModel()
      expect(model).not.toBeNull()
      expect(model!.userId).toBe('default')
      expect(typeof model!.responseLength).toBe('string')
      expect(typeof model!.confidence).toBe('number')
    })

    it('deserialized engine can process new feedback', () => {
      learner.processFeedback(makeSignal())
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json)
      restored.processFeedback(makeSignal({ id: 'new_signal' }))
      expect(restored.getSignals().length).toBe(2)
    })

    it('deserialized engine can record new calibrations', () => {
      learner.recordCalibration(0.8, 0.6)
      const json = learner.serialize()
      const restored = FeedbackLearner.deserialize(json)
      restored.recordCalibration(0.7, 0.5)
      expect(restored.getCalibrationSummary().totalRecords).toBe(2)
    })
  })
})
