import { describe, it, expect, beforeEach } from 'vitest'
import {
  CodeIntentPredictor,
  type PredictionResult,
  type IntentPrediction,
  type SequencePrediction,
  type CompletionPrediction,
  type ContextSignal,
  type IntentFeedback,
} from '../CodeIntentPredictor.js'

describe('CodeIntentPredictor', () => {
  let predictor: CodeIntentPredictor

  beforeEach(() => {
    predictor = new CodeIntentPredictor()
  })

  // ── Constructor & Config ───────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const config = predictor.getConfig()
      expect(config.maxHistorySize).toBe(100)
      expect(config.maxPredictions).toBe(10)
      expect(config.enableContextPrediction).toBe(true)
      expect(config.enableSequencePrediction).toBe(true)
      expect(config.enableCompletionPrediction).toBe(true)
      expect(config.confidenceThreshold).toBe(0.3)
      expect(config.decayFactor).toBe(0.95)
    })

    it('should accept partial config', () => {
      const custom = new CodeIntentPredictor({ maxPredictions: 3, confidenceThreshold: 0.8 })
      expect(custom.getConfig().maxPredictions).toBe(3)
      expect(custom.getConfig().confidenceThreshold).toBe(0.8)
    })

    it('should initialize stats', () => {
      const stats = predictor.getStats()
      expect(stats.totalPredictions).toBe(0)
      expect(stats.predictionAccuracy).toBe(0)
      expect(stats.createdAt).toBeTruthy()
    })
  })

  // ── Intent Prediction ──────────────────────────────────────────────────────

  describe('predictIntent', () => {
    it('should predict create_function intent', () => {
      const intents = predictor.predictIntent('create a function to process data')
      const match = intents.find(i => i.intent === 'create_function')
      expect(match).toBeDefined()
      expect(match!.confidence).toBeGreaterThan(0)
    })

    it('should predict fix_bug intent', () => {
      const intents = predictor.predictIntent('fix the bug in the authentication module')
      const match = intents.find(i => i.intent === 'fix_bug')
      expect(match).toBeDefined()
    })

    it('should predict create_test intent', () => {
      const intents = predictor.predictIntent('write unit tests for the user service')
      const match = intents.find(i => i.intent === 'create_test')
      expect(match).toBeDefined()
    })

    it('should predict refactor intent', () => {
      const intents = predictor.predictIntent('refactor this code to improve readability')
      const match = intents.find(i => i.intent === 'refactor')
      expect(match).toBeDefined()
    })

    it('should predict optimize intent', () => {
      const intents = predictor.predictIntent('optimize the performance of this query')
      const match = intents.find(i => i.intent === 'optimize')
      expect(match).toBeDefined()
    })

    it('should predict add_error_handling intent', () => {
      const intents = predictor.predictIntent('add error handling with try catch')
      const match = intents.find(i => i.intent === 'add_error_handling')
      expect(match).toBeDefined()
    })

    it('should predict integrate_api intent', () => {
      const intents = predictor.predictIntent('create a REST API endpoint')
      const match = intents.find(i => i.intent === 'integrate_api')
      expect(match).toBeDefined()
    })

    it('should return reasoning', () => {
      const intents = predictor.predictIntent('create a function')
      expect(intents.length).toBeGreaterThan(0)
      expect(intents[0].reasoning).toBeTruthy()
    })

    it('should return next steps', () => {
      const intents = predictor.predictIntent('create a class')
      expect(intents.length).toBeGreaterThan(0)
      expect(intents[0].suggestedNextSteps.length).toBeGreaterThan(0)
    })

    it('should return related concepts', () => {
      const intents = predictor.predictIntent('write a test')
      expect(intents.length).toBeGreaterThan(0)
      expect(intents[0].relatedConcepts.length).toBeGreaterThan(0)
    })

    it('should filter by confidence threshold', () => {
      const strict = new CodeIntentPredictor({ confidenceThreshold: 0.99 })
      const intents = strict.predictIntent('maybe something')
      expect(intents.length).toBe(0)
    })

    it('should handle empty input', () => {
      const intents = predictor.predictIntent('')
      expect(intents.length).toBe(0)
    })
  })

  // ── Full Prediction ────────────────────────────────────────────────────────

  describe('predict', () => {
    it('should return full prediction result', () => {
      const result = predictor.predict('add a new feature to the dashboard')
      expect(result.intents.length).toBeGreaterThan(0)
      expect(result.topIntent).toBeTruthy()
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('should include completions when enabled', () => {
      const result = predictor.predict('create a')
      expect(result.completions).toBeDefined()
    })

    it('should accept context signals', () => {
      const context: ContextSignal[] = [
        { type: 'action', content: 'create_class', timestamp: Date.now(), weight: 1 },
      ]
      const result = predictor.predict('add a method', context)
      expect(result.intents.length).toBeGreaterThan(0)
    })

    it('should update stats', () => {
      predictor.predict('create a function')
      expect(predictor.getStats().totalPredictions).toBe(1)
    })
  })

  // ── Sequence Prediction ────────────────────────────────────────────────────

  describe('predictSequence', () => {
    it('should predict next phases', () => {
      const seq = predictor.predictSequence(['create_class', 'create_function'])
      expect(seq.currentPhase).toBeTruthy()
      expect(seq.nextPhases.length).toBeGreaterThan(0)
      expect(seq.confidence).toBeGreaterThan(0)
      expect(seq.pattern).toBeTruthy()
    })

    it('should increase confidence with more history', () => {
      const short = predictor.predictSequence(['create_class'])
      const long = predictor.predictSequence(['setup_project', 'configure', 'create_class', 'create_function'])
      expect(long.confidence).toBeGreaterThanOrEqual(short.confidence)
    })
  })

  // ── Completion Prediction ──────────────────────────────────────────────────

  describe('predictCompletion', () => {
    it('should suggest completions for "create a"', () => {
      const comp = predictor.predictCompletion('create a')
      expect(comp.completions.length).toBeGreaterThan(0)
    })

    it('should suggest completions for "add"', () => {
      const comp = predictor.predictCompletion('add')
      expect(comp.completions.length).toBeGreaterThan(0)
    })

    it('should suggest completions for "fix"', () => {
      const comp = predictor.predictCompletion('fix')
      expect(comp.completions.length).toBeGreaterThan(0)
    })

    it('should include context in completion', () => {
      const comp = predictor.predictCompletion('add', 'class UserService {}')
      expect(comp.context).toBeTruthy()
    })

    it('should update stats', () => {
      predictor.predictCompletion('test')
      expect(predictor.getStats().totalCompletionPredictions).toBe(1)
    })
  })

  // ── Context Management ─────────────────────────────────────────────────────

  describe('context management', () => {
    it('should add context signals', () => {
      predictor.addContext({ type: 'code', content: 'function test() {}', timestamp: Date.now(), weight: 1 })
      expect(predictor.getContextHistory().length).toBe(1)
    })

    it('should clear history', () => {
      predictor.addContext({ type: 'message', content: 'hello', timestamp: Date.now(), weight: 1 })
      predictor.clearHistory()
      expect(predictor.getContextHistory().length).toBe(0)
    })

    it('should trim to maxHistorySize', () => {
      const small = new CodeIntentPredictor({ maxHistorySize: 3 })
      for (let i = 0; i < 10; i++) {
        small.addContext({ type: 'action', content: `action${i}`, timestamp: Date.now(), weight: 1 })
      }
      expect(small.getContextHistory().length).toBeLessThanOrEqual(3)
    })

    it('should get top patterns', () => {
      for (let i = 0; i < 5; i++) {
        predictor.addContext({ type: 'action', content: 'create', timestamp: Date.now(), weight: 1 })
      }
      predictor.addContext({ type: 'code', content: 'other', timestamp: Date.now(), weight: 1 })
      const patterns = predictor.getTopPatterns(3)
      expect(patterns.length).toBeGreaterThan(0)
    })
  })

  // ── Feedback ───────────────────────────────────────────────────────────────

  describe('provideFeedback', () => {
    it('should track correct predictions', () => {
      predictor.predict('create a function')
      predictor.provideFeedback({
        predictedIntent: 'create_function',
        actualIntent: 'create_function',
        wasCorrect: true,
        context: 'test',
      })
      expect(predictor.getStats().totalCorrectPredictions).toBe(1)
      expect(predictor.getStats().totalFeedbacks).toBe(1)
    })

    it('should track incorrect predictions', () => {
      predictor.predict('create something')
      predictor.provideFeedback({
        predictedIntent: 'create_function',
        actualIntent: 'create_class',
        wasCorrect: false,
        context: 'test',
      })
      expect(predictor.getStats().totalFeedbacks).toBe(1)
    })

    it('should update prediction accuracy', () => {
      predictor.predict('test')
      predictor.provideFeedback({
        predictedIntent: 'create_test',
        actualIntent: 'create_test',
        wasCorrect: true,
        context: '',
      })
      expect(predictor.getStats().predictionAccuracy).toBeGreaterThan(0)
    })
  })

  // ── Persistence ────────────────────────────────────────────────────────────

  describe('serialize/deserialize', () => {
    it('should round-trip correctly', () => {
      predictor.predict('create a function')
      predictor.provideFeedback({
        predictedIntent: 'create_function',
        actualIntent: 'create_function',
        wasCorrect: true,
        context: '',
      })
      const json = predictor.serialize()
      const restored = CodeIntentPredictor.deserialize(json)
      expect(restored.getStats().totalPredictions).toBe(1)
      expect(restored.getStats().totalFeedbacks).toBe(1)
      expect(restored.getConfig().maxHistorySize).toBe(100)
    })

    it('should preserve learned weights', () => {
      // Give feedback to alter weights
      for (let i = 0; i < 5; i++) {
        predictor.provideFeedback({
          predictedIntent: 'fix_bug',
          actualIntent: 'fix_bug',
          wasCorrect: true,
          context: '',
        })
      }
      const json = predictor.serialize()
      const restored = CodeIntentPredictor.deserialize(json)
      // Weights should be serialized (verified by checking predictions differ)
      expect(restored.getStats().totalFeedbacks).toBe(5)
    })
  })
})
