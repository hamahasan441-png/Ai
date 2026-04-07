import { describe, it, expect, beforeEach } from 'vitest'
import {
  AdaptiveLearner,
  type Example,
  type PredictionRecord,
} from '../AdaptiveLearner'

// ── Constructor Tests ──

describe('AdaptiveLearner constructor', () => {
  it('creates an instance with default config', () => {
    const learner = new AdaptiveLearner()
    expect(learner).toBeInstanceOf(AdaptiveLearner)
  })

  it('applies default config values', () => {
    const learner = new AdaptiveLearner()
    const config = learner.getConfig()
    expect(config.maxFacts).toBe(500)
    expect(config.maxRules).toBe(200)
    expect(config.maxMistakes).toBe(300)
    expect(config.enableFactExtraction).toBe(true)
    expect(config.enableGeneralization).toBe(true)
    expect(config.enableTransferLearning).toBe(true)
    expect(config.enableMistakeLearning).toBe(true)
    expect(config.generalizationMinExamples).toBe(3)
    expect(config.transferConfidenceDiscount).toBe(0.3)
  })

  it('accepts a partial custom config', () => {
    const learner = new AdaptiveLearner({ maxFacts: 10 })
    const config = learner.getConfig()
    expect(config.maxFacts).toBe(10)
    expect(config.maxRules).toBe(200)
  })

  it('accepts a full custom config', () => {
    const learner = new AdaptiveLearner({
      maxFacts: 50,
      maxRules: 25,
      maxMistakes: 30,
      enableFactExtraction: false,
      enableGeneralization: false,
      enableTransferLearning: false,
      enableMistakeLearning: false,
      generalizationMinExamples: 5,
      transferConfidenceDiscount: 0.5,
    })
    const config = learner.getConfig()
    expect(config.maxFacts).toBe(50)
    expect(config.enableFactExtraction).toBe(false)
    expect(config.transferConfidenceDiscount).toBe(0.5)
  })

  it('initializes stats with zero counters', () => {
    const learner = new AdaptiveLearner()
    const stats = learner.getStats()
    expect(stats.totalFactsExtracted).toBe(0)
    expect(stats.totalRulesGeneralized).toBe(0)
    expect(stats.totalTransfers).toBe(0)
    expect(stats.totalMistakesRecorded).toBe(0)
    expect(stats.totalCalibrations).toBe(0)
    expect(stats.totalFeedbacks).toBe(0)
  })

  it('initializes concept graph from built-in prerequisites', () => {
    const learner = new AdaptiveLearner()
    const stats = learner.getStats()
    expect(stats.conceptsTracked).toBeGreaterThan(0)
  })
})

// ── Fact Extraction Tests ──

describe('AdaptiveLearner extractFacts', () => {
  let learner: AdaptiveLearner

  beforeEach(() => {
    learner = new AdaptiveLearner()
  })

  it('extracts a simple "uses" fact', () => {
    const facts = learner.extractFacts('React uses JSX')
    expect(facts.length).toBe(1)
    expect(facts[0]!.subject).toBe('React')
    expect(facts[0]!.relation).toBe('uses')
    expect(facts[0]!.object).toBe('JSX')
    expect(facts[0]!.negated).toBe(false)
  })

  it('extracts "is a" facts', () => {
    const facts = learner.extractFacts('TypeScript is a superset of JavaScript')
    expect(facts.length).toBe(1)
    expect(facts[0]!.relation).toBe('is a')
    expect(facts[0]!.negated).toBe(false)
  })

  it('extracts negated facts', () => {
    const facts = learner.extractFacts('Vue does not use JSX')
    expect(facts.length).toBe(1)
    expect(facts[0]!.subject).toBe('Vue')
    expect(facts[0]!.relation).toBe('uses')
    expect(facts[0]!.object).toBe('JSX')
    expect(facts[0]!.negated).toBe(true)
  })

  it('extracts multiple facts from multi-sentence text', () => {
    const facts = learner.extractFacts('React uses JSX. Angular uses TypeScript. Vue supports templates')
    expect(facts.length).toBe(3)
  })

  it('handles sentences separated by semicolons', () => {
    const facts = learner.extractFacts('Docker requires Linux; Kubernetes extends Docker')
    expect(facts.length).toBe(2)
  })

  it('deduplicates identical facts', () => {
    const facts = learner.extractFacts('React uses JSX. React uses JSX')
    expect(facts.length).toBe(1)
  })

  it('stores extracted facts and updates getFacts()', () => {
    learner.extractFacts('React uses JSX')
    const stored = learner.getFacts()
    expect(stored.length).toBe(1)
    expect(stored[0]!.subject).toBe('React')
  })

  it('returns empty array for empty input', () => {
    const facts = learner.extractFacts('')
    expect(facts).toEqual([])
  })

  it('returns empty array for unrecognized sentences', () => {
    const facts = learner.extractFacts('Hello world')
    expect(facts).toEqual([])
  })

  it('returns empty array when fact extraction is disabled', () => {
    const disabled = new AdaptiveLearner({ enableFactExtraction: false })
    const facts = disabled.extractFacts('React uses JSX')
    expect(facts).toEqual([])
  })

  it('each fact has a confidence between 0 and 1', () => {
    const facts = learner.extractFacts('React uses JSX. Python has generators. CSS extends HTML')
    for (const fact of facts) {
      expect(fact.confidence).toBeGreaterThanOrEqual(0)
      expect(fact.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('records source text on each extracted fact', () => {
    const facts = learner.extractFacts('React uses JSX')
    expect(facts[0]!.source).toBe('React uses JSX')
  })

  it('updates totalFactsExtracted stat', () => {
    learner.extractFacts('React uses JSX. Vue uses templates')
    expect(learner.getStats().totalFactsExtracted).toBe(2)
  })
})

// ── Generalization Tests ──

describe('AdaptiveLearner generalize', () => {
  let learner: AdaptiveLearner

  const frameworkExamples: Example[] = [
    { input: 'React', output: 'uses component model', domain: 'frontend', tags: ['framework', 'ui'] },
    { input: 'Vue', output: 'uses component model', domain: 'frontend', tags: ['framework', 'ui'] },
    { input: 'Angular', output: 'uses component model', domain: 'frontend', tags: ['framework', 'ui'] },
  ]

  beforeEach(() => {
    learner = new AdaptiveLearner()
  })

  it('generalizes rules from examples meeting the minimum threshold', () => {
    const rules = learner.generalize(frameworkExamples)
    expect(rules.length).toBeGreaterThan(0)
  })

  it('returns empty array when below generalizationMinExamples', () => {
    const rules = learner.generalize(frameworkExamples.slice(0, 2))
    expect(rules).toEqual([])
  })

  it('returns empty array when generalization is disabled', () => {
    const disabled = new AdaptiveLearner({ enableGeneralization: false })
    const rules = disabled.generalize(frameworkExamples)
    expect(rules).toEqual([])
  })

  it('returns empty array for empty examples', () => {
    const rules = learner.generalize([])
    expect(rules).toEqual([])
  })

  it('generated rules have required fields', () => {
    const rules = learner.generalize(frameworkExamples)
    for (const rule of rules) {
      expect(typeof rule.pattern).toBe('string')
      expect(Array.isArray(rule.examples)).toBe(true)
      expect(Array.isArray(rule.counterExamples)).toBe(true)
      expect(typeof rule.confidence).toBe('number')
      expect(rule.confidence).toBeGreaterThanOrEqual(0)
      expect(rule.confidence).toBeLessThanOrEqual(1)
      expect(typeof rule.domain).toBe('string')
      expect(typeof rule.createdAt).toBe('number')
    }
  })

  it('stores rules and updates getRules()', () => {
    learner.generalize(frameworkExamples)
    expect(learner.getRules().length).toBeGreaterThan(0)
  })

  it('updates totalRulesGeneralized stat', () => {
    learner.generalize(frameworkExamples)
    expect(learner.getStats().totalRulesGeneralized).toBeGreaterThan(0)
  })

  it('groups examples by domain', () => {
    const mixed: Example[] = [
      { input: 'React', output: 'uses components', domain: 'frontend', tags: ['framework'] },
      { input: 'Express', output: 'uses middleware', domain: 'backend', tags: ['framework'] },
      { input: 'Vue', output: 'uses components', domain: 'frontend', tags: ['framework'] },
      { input: 'Angular', output: 'uses components', domain: 'frontend', tags: ['framework'] },
    ]
    const rules = learner.generalize(mixed)
    const domains = rules.map(r => r.domain)
    expect(domains).toContain('frontend')
    expect(domains).not.toContain('backend')
  })
})

// ── Transfer Learning Tests ──

describe('AdaptiveLearner transferKnowledge', () => {
  let learner: AdaptiveLearner

  beforeEach(() => {
    learner = new AdaptiveLearner()
  })

  it('transfers a known concept between known domains', () => {
    const result = learner.transferKnowledge('backend', 'frontend', 'middleware')
    expect(result.concept).toBe('middleware')
    expect(result.sourceDomain).toBe('backend')
    expect(result.targetDomain).toBe('frontend')
    expect(result.transferredKnowledge).toContain('higher-order component')
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('returns mappings for known domain pairs', () => {
    const result = learner.transferKnowledge('frontend', 'backend', 'component')
    expect(result.mappings.length).toBeGreaterThan(0)
    for (const mapping of result.mappings) {
      expect(typeof mapping.sourceElement).toBe('string')
      expect(typeof mapping.targetElement).toBe('string')
      expect(mapping.similarity).toBeGreaterThanOrEqual(0)
      expect(mapping.similarity).toBeLessThanOrEqual(1)
    }
  })

  it('handles transfer between unknown domains with generic response', () => {
    const result = learner.transferKnowledge('quantum', 'cooking', 'superposition')
    expect(result.transferredKnowledge).toContain('may apply')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
  })

  it('increments totalTransfers stat', () => {
    learner.transferKnowledge('frontend', 'backend', 'component')
    learner.transferKnowledge('backend', 'database', 'caching')
    expect(learner.getStats().totalTransfers).toBe(2)
  })
})

// ── Mistake Learning Tests ──

describe('AdaptiveLearner learnFromMistake', () => {
  let learner: AdaptiveLearner

  beforeEach(() => {
    learner = new AdaptiveLearner()
  })

  it('returns a MistakeLesson with required fields', () => {
    const lesson = learner.learnFromMistake(
      'React uses two-way binding',
      'React uses one-way data flow',
      'React data patterns',
    )
    expect(lesson.prediction).toBe('React uses two-way binding')
    expect(lesson.actual).toBe('React uses one-way data flow')
    expect(typeof lesson.category).toBe('string')
    expect(typeof lesson.reason).toBe('string')
    expect(typeof lesson.correctionRule).toBe('string')
    expect(lesson.context).toBe('React data patterns')
  })

  it('categorizes outdated info correctly', () => {
    const lesson = learner.learnFromMistake(
      'Use componentWillMount',
      'componentWillMount is deprecated, use useEffect',
      'React lifecycle',
    )
    expect(lesson.category).toBe('outdated_info')
  })

  it('categorizes overgeneralization correctly', () => {
    const lesson = learner.learnFromMistake(
      'All databases always use SQL',
      'Some databases use specific NoSQL query languages',
      'database queries',
    )
    expect(lesson.category).toBe('overgeneralization')
  })

  it('stores lessons and updates getMistakes()', () => {
    learner.learnFromMistake('wrong', 'right', 'context')
    expect(learner.getMistakes().length).toBe(1)
  })

  it('tracks mistake frequency by category', () => {
    learner.learnFromMistake(
      'Use setState directly',
      'setState was deprecated, use useState hook instead',
      'React state management',
    )
    learner.learnFromMistake(
      'All frameworks always use virtual DOM',
      'Some frameworks use specific compilation strategies',
      'framework rendering',
    )
    const freq = learner.getMistakeFrequency()
    expect(freq.size).toBeGreaterThan(0)
  })

  it('increments totalMistakesRecorded stat', () => {
    learner.learnFromMistake('a', 'b', 'c')
    learner.learnFromMistake('d', 'e', 'f')
    expect(learner.getStats().totalMistakesRecorded).toBe(2)
  })

  it('evicts oldest mistake when maxMistakes is reached', () => {
    const small = new AdaptiveLearner({ maxMistakes: 2 })
    small.learnFromMistake('first', 'actual1', 'ctx1')
    small.learnFromMistake('second', 'actual2', 'ctx2')
    small.learnFromMistake('third', 'actual3', 'ctx3')
    const mistakes = small.getMistakes()
    expect(mistakes.length).toBe(2)
    expect(mistakes[0]!.prediction).toBe('second')
  })
})

// ── Confidence Calibration Tests ──

describe('AdaptiveLearner calibration', () => {
  let learner: AdaptiveLearner

  beforeEach(() => {
    learner = new AdaptiveLearner()
  })

  it('returns a CalibrationReport with required fields', () => {
    const predictions: PredictionRecord[] = [
      { predicted: 'yes', actual: 'yes', confidence: 0.9, domain: 'frontend', timestamp: Date.now() },
      { predicted: 'no', actual: 'yes', confidence: 0.8, domain: 'frontend', timestamp: Date.now() },
    ]
    const report = learner.calibrate(predictions)
    expect(typeof report.brierScore).toBe('number')
    expect(typeof report.overconfidence).toBe('number')
    expect(typeof report.underconfidence).toBe('number')
    expect(report.totalPredictions).toBe(2)
    expect(report.accuracyByConfidenceBin).toBeInstanceOf(Map)
    expect(report.domainCalibration).toBeInstanceOf(Map)
  })

  it('returns zeroed report for empty predictions', () => {
    const report = learner.calibrate([])
    expect(report.brierScore).toBe(0)
    expect(report.totalPredictions).toBe(0)
  })

  it('computes brierScore between 0 and 1', () => {
    const predictions: PredictionRecord[] = [
      { predicted: 'a', actual: 'a', confidence: 0.7, domain: 'backend', timestamp: Date.now() },
      { predicted: 'b', actual: 'c', confidence: 0.5, domain: 'backend', timestamp: Date.now() },
    ]
    const report = learner.calibrate(predictions)
    expect(report.brierScore).toBeGreaterThanOrEqual(0)
    expect(report.brierScore).toBeLessThanOrEqual(1)
  })

  it('detects overconfidence when predictions are wrong with high confidence', () => {
    const predictions: PredictionRecord[] = [
      { predicted: 'wrong', actual: 'right', confidence: 0.95, domain: 'frontend', timestamp: Date.now() },
      { predicted: 'wrong', actual: 'right2', confidence: 0.9, domain: 'frontend', timestamp: Date.now() },
    ]
    const report = learner.calibrate(predictions)
    expect(report.overconfidence).toBeGreaterThan(0)
  })

  it('getCalibrationAdjustment returns 0 for unknown domain', () => {
    expect(learner.getCalibrationAdjustment('unknown-domain')).toBe(0)
  })

  it('getCalibrationAdjustment returns adjustment after calibration', () => {
    const predictions: PredictionRecord[] = [
      { predicted: 'wrong', actual: 'right', confidence: 0.9, domain: 'frontend', timestamp: Date.now() },
    ]
    learner.calibrate(predictions)
    const adjustment = learner.getCalibrationAdjustment('frontend')
    expect(adjustment).not.toBe(0)
  })

  it('adjustConfidence clamps result between 0 and 1', () => {
    expect(learner.adjustConfidence(0.5, 'unknown')).toBe(0.5)
    expect(learner.adjustConfidence(0, 'unknown')).toBe(0)
    expect(learner.adjustConfidence(1, 'unknown')).toBe(1)
  })

  it('increments totalCalibrations stat', () => {
    learner.calibrate([])
    learner.calibrate([])
    expect(learner.getStats().totalCalibrations).toBe(2)
  })
})

// ── Curriculum / Learning Order Tests ──

describe('AdaptiveLearner curriculum', () => {
  let learner: AdaptiveLearner

  beforeEach(() => {
    learner = new AdaptiveLearner()
  })

  it('assessComplexity returns a number between 0 and 1 for known concepts', () => {
    const complexity = learner.assessComplexity('react hooks')
    expect(complexity).toBeGreaterThan(0)
    expect(complexity).toBeLessThanOrEqual(1)
  })

  it('assessComplexity returns a default for unknown concepts', () => {
    const complexity = learner.assessComplexity('completely-unknown-concept')
    expect(complexity).toBeGreaterThanOrEqual(0)
    expect(complexity).toBeLessThanOrEqual(1)
  })

  it('harder concepts have higher complexity than easier ones', () => {
    const easy = learner.assessComplexity('html')
    const hard = learner.assessComplexity('kubernetes')
    expect(hard).toBeGreaterThan(easy)
  })

  it('suggestLearningOrder returns concepts in prerequisite order', () => {
    const order = learner.suggestLearningOrder(['react hooks', 'javascript', 'react components'])
    const jsIdx = order.indexOf('javascript')
    const compIdx = order.indexOf('react components')
    const hooksIdx = order.indexOf('react hooks')
    expect(jsIdx).toBeLessThan(compIdx)
    expect(compIdx).toBeLessThan(hooksIdx)
  })

  it('suggestLearningOrder handles a single concept', () => {
    const order = learner.suggestLearningOrder(['html'])
    expect(order).toEqual(['html'])
  })

  it('suggestLearningOrder returns empty array for empty input', () => {
    const order = learner.suggestLearningOrder([])
    expect(order).toEqual([])
  })
})

// ── Prerequisites and Mastery Tests ──

describe('AdaptiveLearner prerequisites and mastery', () => {
  let learner: AdaptiveLearner

  beforeEach(() => {
    learner = new AdaptiveLearner()
  })

  it('getPrerequisites returns known prerequisites for built-in concepts', () => {
    const prereqs = learner.getPrerequisites('react hooks')
    expect(prereqs).toContain('react components')
    expect(prereqs).toContain('javascript functions')
    expect(prereqs).toContain('state management')
  })

  it('getPrerequisites returns empty array for unknown concepts', () => {
    const prereqs = learner.getPrerequisites('alien-technology')
    expect(prereqs).toEqual([])
  })

  it('addPrerequisite adds a new prerequisite to the concept graph', () => {
    learner.addPrerequisite('graphql', 'networking')
    const prereqs = learner.getPrerequisites('graphql')
    expect(prereqs).toContain('networking')
  })

  it('addPrerequisite does not duplicate an existing prerequisite', () => {
    const before = learner.getPrerequisites('react hooks').length
    learner.addPrerequisite('react hooks', 'react components')
    const after = learner.getPrerequisites('react hooks').length
    expect(after).toBe(before)
  })

  it('markMastered and isMastered work together', () => {
    expect(learner.isMastered('javascript')).toBe(false)
    learner.markMastered('javascript')
    expect(learner.isMastered('javascript')).toBe(true)
  })

  it('isMastered is case-insensitive', () => {
    learner.markMastered('JavaScript')
    expect(learner.isMastered('javascript')).toBe(true)
    expect(learner.isMastered('JAVASCRIPT')).toBe(true)
  })

  it('getMasteredConcepts returns all mastered concepts', () => {
    learner.markMastered('html')
    learner.markMastered('css')
    const mastered = learner.getMasteredConcepts()
    expect(mastered.has('html')).toBe(true)
    expect(mastered.has('css')).toBe(true)
    expect(mastered.size).toBe(2)
  })
})

// ── Feedback Tests ──

describe('AdaptiveLearner feedback', () => {
  let learner: AdaptiveLearner

  beforeEach(() => {
    learner = new AdaptiveLearner()
  })

  it('increments totalFeedbacks on positive feedback', () => {
    learner.feedback(true)
    expect(learner.getStats().totalFeedbacks).toBe(1)
  })

  it('increments totalFeedbacks on negative feedback', () => {
    learner.feedback(false)
    expect(learner.getStats().totalFeedbacks).toBe(1)
  })

  it('learns from mistake when given negative feedback with correction', () => {
    learner.feedback(false, 'The correct answer is React uses one-way data flow')
    expect(learner.getMistakes().length).toBe(1)
    expect(learner.getStats().totalMistakesRecorded).toBe(1)
  })

  it('does not create a mistake on negative feedback without correction', () => {
    learner.feedback(false)
    expect(learner.getMistakes().length).toBe(0)
  })
})

// ── Serialization / Deserialization Tests ──

describe('AdaptiveLearner serialize/deserialize', () => {
  it('round-trips config correctly', () => {
    const original = new AdaptiveLearner({ maxFacts: 42, transferConfidenceDiscount: 0.6 })
    const json = original.serialize()
    const restored = AdaptiveLearner.deserialize(json)
    expect(restored.getConfig().maxFacts).toBe(42)
    expect(restored.getConfig().transferConfidenceDiscount).toBe(0.6)
  })

  it('round-trips extracted facts', () => {
    const original = new AdaptiveLearner()
    original.extractFacts('React uses JSX')
    const json = original.serialize()
    const restored = AdaptiveLearner.deserialize(json)
    expect(restored.getFacts().length).toBe(1)
    expect(restored.getFacts()[0]!.subject).toBe('React')
  })

  it('round-trips mastered concepts', () => {
    const original = new AdaptiveLearner()
    original.markMastered('html')
    original.markMastered('css')
    const json = original.serialize()
    const restored = AdaptiveLearner.deserialize(json)
    expect(restored.isMastered('html')).toBe(true)
    expect(restored.isMastered('css')).toBe(true)
  })

  it('round-trips mistake lessons', () => {
    const original = new AdaptiveLearner()
    original.learnFromMistake('wrong', 'right', 'context')
    const json = original.serialize()
    const restored = AdaptiveLearner.deserialize(json)
    expect(restored.getMistakes().length).toBe(1)
    expect(restored.getMistakes()[0]!.prediction).toBe('wrong')
  })

  it('round-trips stats', () => {
    const original = new AdaptiveLearner()
    original.extractFacts('React uses JSX')
    original.feedback(true)
    const json = original.serialize()
    const restored = AdaptiveLearner.deserialize(json)
    const stats = restored.getStats()
    expect(stats.totalFactsExtracted).toBe(1)
    expect(stats.totalFeedbacks).toBe(1)
  })

  it('deserialize produces a working instance', () => {
    const original = new AdaptiveLearner()
    const json = original.serialize()
    const restored = AdaptiveLearner.deserialize(json)
    const facts = restored.extractFacts('Docker requires Linux')
    expect(facts.length).toBe(1)
  })
})

// ── Stats Tests ──

describe('AdaptiveLearner stats tracking', () => {
  let learner: AdaptiveLearner

  beforeEach(() => {
    learner = new AdaptiveLearner()
  })

  it('getStats returns a snapshot with createdAt and lastUsedAt', () => {
    const stats = learner.getStats()
    expect(typeof stats.createdAt).toBe('string')
    expect(typeof stats.lastUsedAt).toBe('string')
  })

  it('lastUsedAt updates after operations', () => {
    const before = learner.getStats().lastUsedAt
    learner.extractFacts('React uses JSX')
    const after = learner.getStats().lastUsedAt
    expect(new Date(after).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime())
  })

  it('factsStored reflects number of stored facts', () => {
    learner.extractFacts('React uses JSX. Vue supports templates')
    expect(learner.getStats().factsStored).toBe(2)
  })

  it('rulesStored reflects number of stored rules', () => {
    const examples: Example[] = [
      { input: 'A', output: 'uses pattern X', domain: 'test', tags: ['tag'] },
      { input: 'B', output: 'uses pattern X', domain: 'test', tags: ['tag'] },
      { input: 'C', output: 'uses pattern X', domain: 'test', tags: ['tag'] },
    ]
    learner.generalize(examples)
    expect(learner.getStats().rulesStored).toBeGreaterThan(0)
  })

  it('getConfig returns a readonly copy', () => {
    const config1 = learner.getConfig()
    const config2 = learner.getConfig()
    expect(config1).toEqual(config2)
    expect(config1).not.toBe(config2)
  })

  it('getStats returns a readonly copy', () => {
    const stats1 = learner.getStats()
    const stats2 = learner.getStats()
    expect(stats1).toEqual(stats2)
    expect(stats1).not.toBe(stats2)
  })
})
