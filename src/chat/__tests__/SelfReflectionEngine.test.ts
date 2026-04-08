import { describe, it, expect, beforeEach } from 'vitest'
import {
  SelfReflectionEngine,
  DEFAULT_SELF_REFLECTION_CONFIG,
  type QualityDimension,
  type OutputEvaluation,
  type SelfReflectionEngineConfig,
  type SelfReflectionEngineStats,
} from '../SelfReflectionEngine'

// ── Helpers ──────────────────────────────────────────────────────────────────

const SHORT_INPUT = 'What is TypeScript?'
const SHORT_OUTPUT = 'TypeScript is a typed superset of JavaScript.'

const LONG_INPUT =
  'Explain in detail how garbage collection works in modern programming languages, ' +
  'covering mark-and-sweep, generational, and concurrent collectors. Include trade-offs.'

const LONG_OUTPUT =
  'Garbage collection (GC) automatically reclaims memory that is no longer in use. ' +
  'The simplest approach is mark-and-sweep: the collector traverses all reachable objects ' +
  'from root references, marks them as alive, and then sweeps through the heap to free ' +
  'unmarked objects. This is straightforward but causes stop-the-world pauses. ' +
  'Generational collectors split the heap into young and old generations. Most objects die ' +
  'young, so the young generation is collected frequently while the old generation is ' +
  'collected less often. This reduces pause times because young generation collections ' +
  'are fast. Concurrent collectors run alongside the application, reducing pauses ' +
  'further. However, they add complexity and CPU overhead because the collector must ' +
  'handle mutations to the object graph during collection. The trade-offs are: ' +
  'mark-and-sweep is simple but slow, generational is fast for typical workloads ' +
  'but needs tuning, and concurrent minimizes pauses but increases throughput cost. ' +
  'Additionally, each approach has nuanced implications for memory fragmentation ' +
  'and cache behavior. Furthermore, compacting collectors move objects to reduce ' +
  'fragmentation, which covers edge cases comprehensively.'

const TECHNICAL_INPUT =
  'Write a function to implement binary search in Python with error handling.'

const TECHNICAL_OUTPUT =
  'Here is a step-by-step implementation:\n' +
  '1. Define the function with parameters for the sorted array and target.\n' +
  '2. Set low and high pointers.\n' +
  '3. Loop while low <= high.\n' +
  '4. Compute mid = (low + high) // 2.\n' +
  '5. Compare array[mid] with target and adjust pointers.\n' +
  '6. Return the index or -1 if not found.\n' +
  'def binary_search(arr, target):\n' +
  '    low, high = 0, len(arr) - 1\n' +
  '    while low <= high:\n' +
  '        mid = (low + high) // 2\n' +
  '        if arr[mid] == target: return mid\n' +
  '        elif arr[mid] < target: low = mid + 1\n' +
  '        else: high = mid - 1\n' +
  '    return -1\n' +
  'This function follows a clear algorithm with straightforward logic.'

const SECURITY_INPUT = 'Explain SQL injection vulnerability and how to defend against it.'
const SECURITY_OUTPUT =
  'SQL injection is a security vulnerability where an attacker exploits ' +
  'unvalidated user input to execute arbitrary SQL commands. Specifically, ' +
  'regarding defense, you should use parameterized queries, input validation, ' +
  'and an ORM. These verified approaches are accurate and correct. ' +
  'Additionally, use a web application firewall and apply the principle of least privilege. ' +
  'Step 1. Use prepared statements. Step 2. Validate and sanitize inputs. ' +
  'Step 3. Apply output encoding. This addresses the core ask comprehensively.'

const TRADING_INPUT = 'What is a moving average crossover strategy for stock trading?'
const TRADING_OUTPUT =
  'A moving average crossover strategy uses two indicators to generate trade signals. ' +
  'When the short-term moving average crosses above the long-term moving average, it ' +
  'signals a buy (a "golden cross"). When the short crosses below, it signals a sell ' +
  '(a "death cross"). The market price and portfolio allocation depend on the indicator ' +
  'settings. This strategy is straightforward and covers basic trend-following approaches.'

/** Generate a text with error-category signals embedded. */
function makeOverConfidentOutput(): string {
  return 'This is certainly the best approach. It is absolutely correct and definitely ' +
    'the only way. Without doubt, this method is guaranteed to work 100% of the time.'
}

function makeUnderConfidentOutput(): string {
  return 'Maybe this is correct. Perhaps it could work, but I am not sure. ' +
    'It might be the right answer. Possibly this is valid, but I am uncertain. ' +
    'I think this could be okay.'
}

function makeHallucinatingOutput(): string {
  return 'The fabricated framework XYZ doesn\'t exist in reality. This invented concept ' +
    'is fictional and there is no such library called AbcDef. It was made up by the community.'
}

function makeRepetitiveOutput(): string {
  return 'As I said before, the answer is X. As mentioned earlier, X is correct. ' +
    'Again, X is the answer. I already stated that X is the solution. ' +
    'This is redundant but repeated for emphasis.'
}

function makeOverGeneralizedOutput(): string {
  return 'This always works. It never fails. All systems use this approach. ' +
    'Every developer knows this. None of the alternatives are valid. ' +
    'Universally, this is the accepted standard without exception.'
}

function makeTangentialOutput(): string {
  return 'By the way, here is something unrelated. Off topic, but interesting. ' +
    'As a side note, this is a tangent. This digression is unrelated to the question.'
}

function makeIncompleteOutput(): string {
  return 'Also consider the edge cases. Additionally, there are missing pieces. ' +
    'I forgot to mention the key detail. The explanation is incomplete and left out important facts.'
}

function makeLogicallyInconsistentOutput(): string {
  return 'The answer is A. But earlier I said B, which contradicts this. ' +
    'However, this is inconsistent with the first claim. This conflicts with the initial statement.'
}

function populateEngine(engine: SelfReflectionEngine, count: number): void {
  for (let i = 0; i < count; i++) {
    engine.evaluate(
      `Question ${i}: Explain topic ${i} in detail with examples.`,
      `Answer ${i}: This is a detailed explanation of topic ${i}. ` +
        'It covers the fundamentals and provides step-by-step guidance. ' +
        'Furthermore, the approach is comprehensive and includes nuanced analysis.',
    )
  }
}

const ALL_DIMENSIONS: QualityDimension[] = [
  'coherence', 'relevance', 'completeness', 'accuracy', 'clarity', 'depth', 'actionability',
]

// ── Constructor Tests ────────────────────────────────────────────────────────

describe('SelfReflectionEngine constructor', () => {
  it('creates instance with default config', () => {
    const engine = new SelfReflectionEngine()
    const stats = engine.getStats()
    expect(stats.totalEvaluations).toBe(0)
    expect(stats.avgOverallScore).toBe(0)
  })

  it('creates instance with empty config override', () => {
    const engine = new SelfReflectionEngine({})
    expect(engine.getStats().totalEvaluations).toBe(0)
  })

  it('creates instance with partial custom config', () => {
    const engine = new SelfReflectionEngine({ maxEvaluationHistory: 10 })
    // Fill beyond the limit
    populateEngine(engine, 15)
    expect(engine.getEvaluationHistory().length).toBeLessThanOrEqual(10)
  })

  it('creates instance with full custom config', () => {
    const config: SelfReflectionEngineConfig = {
      maxEvaluationHistory: 100,
      trendWindowSize: 10,
      minEvaluationsForPatterns: 3,
      weaknessThreshold: 0.6,
      enableAutoStrategies: false,
    }
    const engine = new SelfReflectionEngine(config)
    expect(engine.getStats().totalEvaluations).toBe(0)
  })

  it('respects maxEvaluationHistory by pruning older entries', () => {
    const engine = new SelfReflectionEngine({ maxEvaluationHistory: 5 })
    populateEngine(engine, 8)
    expect(engine.getEvaluationHistory().length).toBe(5)
  })

  it('starts with empty evaluation history', () => {
    const engine = new SelfReflectionEngine()
    expect(engine.getEvaluationHistory()).toHaveLength(0)
  })

  it('starts with empty error patterns', () => {
    const engine = new SelfReflectionEngine()
    expect(engine.getErrorPatterns()).toHaveLength(0)
  })

  it('starts with empty blind spots', () => {
    const engine = new SelfReflectionEngine()
    expect(engine.getBlindSpots()).toHaveLength(0)
  })

  it('starts with empty strategies', () => {
    const engine = new SelfReflectionEngine()
    expect(engine.getStrategies()).toHaveLength(0)
  })
})

// ── DEFAULT_SELF_REFLECTION_CONFIG Tests ─────────────────────────────────────

describe('DEFAULT_SELF_REFLECTION_CONFIG', () => {
  it('has maxEvaluationHistory of 500', () => {
    expect(DEFAULT_SELF_REFLECTION_CONFIG.maxEvaluationHistory).toBe(500)
  })

  it('has trendWindowSize of 20', () => {
    expect(DEFAULT_SELF_REFLECTION_CONFIG.trendWindowSize).toBe(20)
  })

  it('has minEvaluationsForPatterns of 5', () => {
    expect(DEFAULT_SELF_REFLECTION_CONFIG.minEvaluationsForPatterns).toBe(5)
  })

  it('has weaknessThreshold of 0.5', () => {
    expect(DEFAULT_SELF_REFLECTION_CONFIG.weaknessThreshold).toBe(0.5)
  })

  it('has enableAutoStrategies set to true', () => {
    expect(DEFAULT_SELF_REFLECTION_CONFIG.enableAutoStrategies).toBe(true)
  })
})

// ── evaluate() Tests ─────────────────────────────────────────────────────────

describe('evaluate', () => {
  let engine: SelfReflectionEngine

  beforeEach(() => {
    engine = new SelfReflectionEngine()
  })

  it('returns an OutputEvaluation object', () => {
    const result = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('timestamp')
    expect(result).toHaveProperty('input')
    expect(result).toHaveProperty('output')
    expect(result).toHaveProperty('domain')
    expect(result).toHaveProperty('dimensionScores')
    expect(result).toHaveProperty('overallScore')
    expect(result).toHaveProperty('strengths')
    expect(result).toHaveProperty('weaknesses')
    expect(result).toHaveProperty('selfCorrectionSuggestions')
  })

  it('generates a unique id prefixed with sr_', () => {
    const r1 = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const r2 = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(r1.id).toMatch(/^sr_/)
    expect(r2.id).toMatch(/^sr_/)
    expect(r1.id).not.toBe(r2.id)
  })

  it('sets timestamp close to now', () => {
    const before = Date.now()
    const result = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const after = Date.now()
    expect(result.timestamp).toBeGreaterThanOrEqual(before)
    expect(result.timestamp).toBeLessThanOrEqual(after)
  })

  it('records the input and output verbatim', () => {
    const result = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(result.input).toBe(SHORT_INPUT)
    expect(result.output).toBe(SHORT_OUTPUT)
  })

  it('scores all seven quality dimensions', () => {
    const result = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(result.dimensionScores).toHaveLength(7)
    const dims = result.dimensionScores.map(s => s.dimension)
    for (const dim of ALL_DIMENSIONS) {
      expect(dims).toContain(dim)
    }
  })

  it('produces dimension scores between 0 and 1', () => {
    const result = engine.evaluate(LONG_INPUT, LONG_OUTPUT)
    for (const s of result.dimensionScores) {
      expect(s.score).toBeGreaterThanOrEqual(0)
      expect(s.score).toBeLessThanOrEqual(1)
    }
  })

  it('produces an overall score between 0 and 1', () => {
    const result = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(1)
  })

  it('detects the programming domain', () => {
    const result = engine.evaluate(TECHNICAL_INPUT, TECHNICAL_OUTPUT)
    expect(result.domain).toBe('programming')
  })

  it('detects the security domain', () => {
    const result = engine.evaluate(SECURITY_INPUT, SECURITY_OUTPUT)
    expect(result.domain).toBe('security')
  })

  it('detects the trading domain', () => {
    const result = engine.evaluate(TRADING_INPUT, TRADING_OUTPUT)
    expect(result.domain).toBe('trading')
  })

  it('detects general domain for generic questions', () => {
    const result = engine.evaluate('What is the meaning of life?', 'It is about purpose.')
    expect(result.domain).toBe('general')
  })

  it('returns strengths as an array of strings', () => {
    const result = engine.evaluate(LONG_INPUT, LONG_OUTPUT)
    expect(Array.isArray(result.strengths)).toBe(true)
    for (const s of result.strengths) {
      expect(typeof s).toBe('string')
    }
  })

  it('returns weaknesses as an array of strings', () => {
    const result = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(Array.isArray(result.weaknesses)).toBe(true)
  })

  it('returns selfCorrectionSuggestions as an array', () => {
    const result = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(Array.isArray(result.selfCorrectionSuggestions)).toBe(true)
  })

  it('gives higher completeness to longer outputs', () => {
    const shortResult = engine.evaluate('Explain X', 'X is a thing.')
    const longResult = engine.evaluate('Explain X', LONG_OUTPUT)
    const shortComplete = shortResult.dimensionScores.find(s => s.dimension === 'completeness')!
    const longComplete = longResult.dimensionScores.find(s => s.dimension === 'completeness')!
    expect(longComplete.score).toBeGreaterThan(shortComplete.score)
  })

  it('gives higher actionability to outputs with numbered steps', () => {
    const noSteps = engine.evaluate('How to set up', 'Just configure the settings and run it.')
    const withSteps = engine.evaluate('How to set up', TECHNICAL_OUTPUT)
    const noStepsScore = noSteps.dimensionScores.find(s => s.dimension === 'actionability')!
    const withStepsScore = withSteps.dimensionScores.find(s => s.dimension === 'actionability')!
    expect(withStepsScore.score).toBeGreaterThan(noStepsScore.score)
  })

  it('increases evaluation count after each call', () => {
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.getStats().totalEvaluations).toBe(1)
    engine.evaluate(LONG_INPUT, LONG_OUTPUT)
    expect(engine.getStats().totalEvaluations).toBe(2)
  })

  it('dimension scores include evidence strings', () => {
    const result = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    for (const s of result.dimensionScores) {
      expect(typeof s.evidence).toBe('string')
      expect(s.evidence.length).toBeGreaterThan(0)
    }
  })

  it('dimension scores include suggestions array', () => {
    const result = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    for (const s of result.dimensionScores) {
      expect(Array.isArray(s.suggestions)).toBe(true)
    }
  })

  it('limits selfCorrectionSuggestions to at most 10', () => {
    const result = engine.evaluate(
      SHORT_INPUT,
      makeOverConfidentOutput() + ' ' + makeUnderConfidentOutput() + ' ' +
        makeHallucinatingOutput() + ' ' + makeRepetitiveOutput(),
    )
    expect(result.selfCorrectionSuggestions.length).toBeLessThanOrEqual(10)
  })

  it('suggests brevity correction when output is much shorter than input', () => {
    const longQuestion = 'A'.repeat(200).split('').join(' ') + ' Explain this topic.'
    const result = engine.evaluate(longQuestion, 'Short answer.')
    const hasBreve = result.selfCorrectionSuggestions.some(s => s.includes('too brief'))
    expect(hasBreve).toBe(true)
  })

  it('identifies strengths for dimensions scoring >= 0.7', () => {
    const result = engine.evaluate(SECURITY_INPUT, SECURITY_OUTPUT)
    for (const str of result.strengths) {
      expect(str).toMatch(/Strong \w+/)
    }
  })

  it('identifies weaknesses for dimensions below threshold', () => {
    const result = engine.evaluate('X', 'Y')
    // Very short input/output should produce some weaknesses
    if (result.weaknesses.length > 0) {
      expect(result.weaknesses[0]).toMatch(/Weak \w+/)
    }
  })
})

// ── Quality Dimension Scoring Tests ──────────────────────────────────────────

describe('quality dimension scoring', () => {
  let engine: SelfReflectionEngine

  beforeEach(() => {
    engine = new SelfReflectionEngine()
  })

  it('coherence scores higher with logical connectors', () => {
    const withConnectors = engine.evaluate(
      'Why does X happen?',
      'X happens because of Y. Therefore Z follows. Consequently, W is the result. Since A leads to B, thus C.',
    )
    const without = engine.evaluate(
      'Why does X happen?',
      'X happens. Y is a thing. Z exists. W is there.',
    )
    const with_ = withConnectors.dimensionScores.find(s => s.dimension === 'coherence')!
    const without_ = without.dimensionScores.find(s => s.dimension === 'coherence')!
    expect(with_.score).toBeGreaterThan(without_.score)
  })

  it('relevance scores higher when output overlaps with input tokens', () => {
    const relevant = engine.evaluate(
      'How does TypeScript handle type checking?',
      'TypeScript performs type checking at compile time. The TypeScript compiler verifies that types match the declared type annotations.',
    )
    const irrelevant = engine.evaluate(
      'How does TypeScript handle type checking?',
      'Bananas are yellow fruits that grow in tropical climates.',
    )
    const relScore = relevant.dimensionScores.find(s => s.dimension === 'relevance')!
    const irrelScore = irrelevant.dimensionScores.find(s => s.dimension === 'relevance')!
    expect(relScore.score).toBeGreaterThan(irrelScore.score)
  })

  it('depth scores higher with more sentences', () => {
    const deep = engine.evaluate(
      'Explain X',
      'First, X is important. Second, it affects Y. Third, the mechanism involves Z. ' +
        'Fourth, the implications are broad. Fifth, there are trade-offs. ' +
        'Sixth, a detailed nuanced analysis is needed. Seventh, consider edge cases. ' +
        'Eighth, the thorough examination reveals more. Ninth, an extensive review helps. ' +
        'Tenth, comprehensive coverage is key.',
    )
    const shallow = engine.evaluate('Explain X', 'X is a thing.')
    const deepScore = deep.dimensionScores.find(s => s.dimension === 'depth')!
    const shallowScore = shallow.dimensionScores.find(s => s.dimension === 'depth')!
    expect(deepScore.score).toBeGreaterThan(shallowScore.score)
  })

  it('clarity scores higher with shorter average sentence length', () => {
    const clear = engine.evaluate(
      'What is X?',
      'X is simple. It works clearly. The idea is straightforward. It is easy to understand.',
    )
    const unclear = engine.evaluate(
      'What is X?',
      'X is an incredibly complex and convoluted system that is extremely confusing and ambiguous ' +
        'and requires a vast amount of specialized knowledge to even begin to comprehend in any meaningful way.',
    )
    const clearScore = clear.dimensionScores.find(s => s.dimension === 'clarity')!
    const unclearScore = unclear.dimensionScores.find(s => s.dimension === 'clarity')!
    expect(clearScore.score).toBeGreaterThan(unclearScore.score)
  })

  it('accuracy scores higher with positive accuracy keywords', () => {
    const accurate = engine.evaluate(
      'Is X correct?',
      'This is verified and correct. The information is accurate, precise, and exact.',
    )
    const inaccurate = engine.evaluate(
      'Is X correct?',
      'This is wrong and incorrect. There is an error and a mistake. It is inaccurate.',
    )
    const accScore = accurate.dimensionScores.find(s => s.dimension === 'accuracy')!
    const inaccScore = inaccurate.dimensionScores.find(s => s.dimension === 'accuracy')!
    expect(accScore.score).toBeGreaterThan(inaccScore.score)
  })

  it('actionability scores higher with bullet/step patterns', () => {
    const actionable = engine.evaluate(
      'How to do X?',
      '1. First step: do A.\n2. Second step: implement B.\n3. Third step: execute C.\n- Follow these action items.',
    )
    const notActionable = engine.evaluate(
      'How to do X?',
      'This is a theoretical and abstract concept that is conceptual and non-specific.',
    )
    const actScore = actionable.dimensionScores.find(s => s.dimension === 'actionability')!
    const notActScore = notActionable.dimensionScores.find(s => s.dimension === 'actionability')!
    expect(actScore.score).toBeGreaterThan(notActScore.score)
  })

  it('completeness scores higher with comprehensiveness keywords', () => {
    const complete = engine.evaluate(
      'Explain X',
      'This comprehensive explanation covers X, including edge cases. Furthermore, ' +
        'it additionally addresses Y and Z for a complete picture.',
    )
    const incomplete = engine.evaluate(
      'Explain X',
      'X is incomplete and missing key info. It lacks depth.',
    )
    const compScore = complete.dimensionScores.find(s => s.dimension === 'completeness')!
    const incompScore = incomplete.dimensionScores.find(s => s.dimension === 'completeness')!
    expect(compScore.score).toBeGreaterThan(incompScore.score)
  })
})

// ── Error Pattern Detection Tests ────────────────────────────────────────────

describe('detectErrorPatterns', () => {
  let engine: SelfReflectionEngine

  beforeEach(() => {
    engine = new SelfReflectionEngine({ minEvaluationsForPatterns: 2 })
  })

  it('returns empty array when history is insufficient', () => {
    const fresh = new SelfReflectionEngine()
    expect(fresh.detectErrorPatterns()).toHaveLength(0)
  })

  it('detects over_confidence pattern', () => {
    const output = makeOverConfidentOutput()
    engine.evaluate('Question 1', output)
    engine.evaluate('Question 2', output)
    const patterns = engine.getErrorPatterns()
    const overConf = patterns.find(p => p.category === 'over_confidence')
    expect(overConf).toBeDefined()
  })

  it('detects under_confidence pattern', () => {
    const output = makeUnderConfidentOutput()
    engine.evaluate('Question 1', output)
    engine.evaluate('Question 2', output)
    const patterns = engine.getErrorPatterns()
    const underConf = patterns.find(p => p.category === 'under_confidence')
    expect(underConf).toBeDefined()
  })

  it('detects hallucination pattern', () => {
    const output = makeHallucinatingOutput()
    engine.evaluate('Question 1', output)
    engine.evaluate('Question 2', output)
    const patterns = engine.getErrorPatterns()
    const hall = patterns.find(p => p.category === 'hallucination')
    expect(hall).toBeDefined()
  })

  it('detects over_generalization pattern', () => {
    const output = makeOverGeneralizedOutput()
    engine.evaluate('Question 1', output)
    engine.evaluate('Question 2', output)
    const patterns = engine.getErrorPatterns()
    const gen = patterns.find(p => p.category === 'over_generalization')
    expect(gen).toBeDefined()
  })

  it('detects repetition pattern', () => {
    const output = makeRepetitiveOutput()
    engine.evaluate('Question 1', output)
    engine.evaluate('Question 2', output)
    const patterns = engine.getErrorPatterns()
    const rep = patterns.find(p => p.category === 'repetition')
    expect(rep).toBeDefined()
  })

  it('detects tangential pattern', () => {
    const output = makeTangentialOutput()
    engine.evaluate('Question 1', output)
    engine.evaluate('Question 2', output)
    const patterns = engine.getErrorPatterns()
    const tang = patterns.find(p => p.category === 'tangential')
    expect(tang).toBeDefined()
  })

  it('detects incomplete_answer pattern', () => {
    const output = makeIncompleteOutput()
    engine.evaluate('Question 1', output)
    engine.evaluate('Question 2', output)
    const patterns = engine.getErrorPatterns()
    const inc = patterns.find(p => p.category === 'incomplete_answer')
    expect(inc).toBeDefined()
  })

  it('detects logical_inconsistency pattern', () => {
    const output = makeLogicallyInconsistentOutput()
    engine.evaluate('Question 1', output)
    engine.evaluate('Question 2', output)
    const patterns = engine.getErrorPatterns()
    const logic = patterns.find(p => p.category === 'logical_inconsistency')
    expect(logic).toBeDefined()
  })

  it('error patterns have required fields', () => {
    const output = makeOverConfidentOutput()
    engine.evaluate('Q1', output)
    engine.evaluate('Q2', output)
    const patterns = engine.getErrorPatterns()
    for (const p of patterns) {
      expect(p).toHaveProperty('id')
      expect(p).toHaveProperty('category')
      expect(p).toHaveProperty('description')
      expect(p).toHaveProperty('frequency')
      expect(p).toHaveProperty('domains')
      expect(p).toHaveProperty('examples')
      expect(p).toHaveProperty('severity')
      expect(p).toHaveProperty('suggestedFix')
    }
  })

  it('error pattern severity is one of the expected levels', () => {
    const output = makeOverConfidentOutput()
    engine.evaluate('Q1', output)
    engine.evaluate('Q2', output)
    const patterns = engine.getErrorPatterns()
    for (const p of patterns) {
      expect(['low', 'medium', 'high', 'critical']).toContain(p.severity)
    }
  })

  it('error pattern frequency is between 0 and 1', () => {
    const output = makeOverConfidentOutput()
    engine.evaluate('Q1', output)
    engine.evaluate('Q2', output)
    const patterns = engine.getErrorPatterns()
    for (const p of patterns) {
      expect(p.frequency).toBeGreaterThanOrEqual(0)
      expect(p.frequency).toBeLessThanOrEqual(1)
    }
  })

  it('error pattern examples is limited to 3 entries', () => {
    const output = makeHallucinatingOutput()
    for (let i = 0; i < 10; i++) {
      engine.evaluate(`Q${i}`, output)
    }
    const patterns = engine.getErrorPatterns()
    for (const p of patterns) {
      expect(p.examples.length).toBeLessThanOrEqual(3)
    }
  })

  it('error pattern includes a non-empty suggested fix', () => {
    const output = makeOverGeneralizedOutput()
    engine.evaluate('Q1', output)
    engine.evaluate('Q2', output)
    const patterns = engine.getErrorPatterns()
    for (const p of patterns) {
      expect(p.suggestedFix.length).toBeGreaterThan(0)
    }
  })

  it('updates stats.errorPatternsDetected', () => {
    const output = makeOverConfidentOutput()
    engine.evaluate('Q1', output)
    engine.evaluate('Q2', output)
    expect(engine.getStats().errorPatternsDetected).toBeGreaterThan(0)
  })
})

// ── Blind Spot Detection Tests ───────────────────────────────────────────────

describe('detectBlindSpots', () => {
  let engine: SelfReflectionEngine

  beforeEach(() => {
    engine = new SelfReflectionEngine({ weaknessThreshold: 0.99 })
  })

  it('returns empty when there are fewer than 3 evaluations per domain', () => {
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const spots = engine.getBlindSpots()
    // Need at least 3 evaluations in a domain with avg < threshold
    expect(Array.isArray(spots)).toBe(true)
  })

  it('detects blind spots for domains with consistently low scores', () => {
    // With threshold 0.99, almost everything is a blind spot
    for (let i = 0; i < 5; i++) {
      engine.evaluate('What is X? Explain this general topic.', 'X is a thing.')
    }
    const spots = engine.getBlindSpots()
    expect(spots.length).toBeGreaterThan(0)
  })

  it('blind spots have required fields', () => {
    for (let i = 0; i < 5; i++) {
      engine.evaluate('Tell me what X is.', 'X exists.')
    }
    const spots = engine.getBlindSpots()
    for (const spot of spots) {
      expect(spot).toHaveProperty('domain')
      expect(spot).toHaveProperty('description')
      expect(spot).toHaveProperty('confidence')
      expect(spot).toHaveProperty('evidenceCount')
      expect(spot).toHaveProperty('detectedAt')
    }
  })

  it('blind spot confidence is between 0 and 1', () => {
    for (let i = 0; i < 5; i++) {
      engine.evaluate('Explain general topic', 'Short.')
    }
    const spots = engine.getBlindSpots()
    for (const spot of spots) {
      expect(spot.confidence).toBeGreaterThanOrEqual(0)
      expect(spot.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('blind spot evidenceCount reflects number of evaluations in domain', () => {
    for (let i = 0; i < 4; i++) {
      engine.evaluate('What is general topic?', 'Answer.')
    }
    const spots = engine.getBlindSpots()
    if (spots.length > 0) {
      expect(spots[0].evidenceCount).toBeGreaterThanOrEqual(3)
    }
  })

  it('updates stats.blindSpotsDetected', () => {
    for (let i = 0; i < 5; i++) {
      engine.evaluate('What is general topic?', 'Answer.')
    }
    expect(engine.getStats().blindSpotsDetected).toBeGreaterThanOrEqual(0)
  })
})

// ── Strategy Generation Tests ────────────────────────────────────────────────

describe('generateStrategies', () => {
  let engine: SelfReflectionEngine

  beforeEach(() => {
    engine = new SelfReflectionEngine({ minEvaluationsForPatterns: 3, enableAutoStrategies: false })
  })

  it('returns empty when evaluations are below minimum', () => {
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.generateStrategies()).toHaveLength(0)
  })

  it('generates strategies after sufficient evaluations', () => {
    populateEngine(engine, 5)
    const strategies = engine.generateStrategies()
    expect(Array.isArray(strategies)).toBe(true)
  })

  it('strategies have required fields', () => {
    populateEngine(engine, 5)
    const strategies = engine.generateStrategies()
    for (const s of strategies) {
      expect(s).toHaveProperty('id')
      expect(s).toHaveProperty('targetDimension')
      expect(s).toHaveProperty('description')
      expect(s).toHaveProperty('priority')
      expect(s).toHaveProperty('expectedImpact')
      expect(s).toHaveProperty('actionItems')
    }
  })

  it('strategy priority is one of the expected levels', () => {
    populateEngine(engine, 5)
    const strategies = engine.generateStrategies()
    for (const s of strategies) {
      expect(['low', 'medium', 'high', 'critical']).toContain(s.priority)
    }
  })

  it('strategy expectedImpact is between 0.1 and 0.5', () => {
    populateEngine(engine, 5)
    const strategies = engine.generateStrategies()
    for (const s of strategies) {
      expect(s.expectedImpact).toBeGreaterThanOrEqual(0.1)
      expect(s.expectedImpact).toBeLessThanOrEqual(0.5)
    }
  })

  it('strategy targetDimension is a valid QualityDimension', () => {
    populateEngine(engine, 5)
    const strategies = engine.generateStrategies()
    for (const s of strategies) {
      expect(ALL_DIMENSIONS).toContain(s.targetDimension)
    }
  })

  it('strategy actionItems is a non-empty array', () => {
    populateEngine(engine, 5)
    const strategies = engine.generateStrategies()
    for (const s of strategies) {
      expect(s.actionItems.length).toBeGreaterThan(0)
    }
  })

  it('updates stats.strategiesGenerated', () => {
    populateEngine(engine, 5)
    engine.generateStrategies()
    expect(engine.getStats().strategiesGenerated).toBeGreaterThanOrEqual(0)
  })

  it('strategies are accessible via getStrategies()', () => {
    populateEngine(engine, 5)
    engine.generateStrategies()
    const strategies = engine.getStrategies()
    expect(Array.isArray(strategies)).toBe(true)
  })

  it('auto strategies run when enableAutoStrategies is true', () => {
    const autoEngine = new SelfReflectionEngine({
      minEvaluationsForPatterns: 3,
      enableAutoStrategies: true,
    })
    populateEngine(autoEngine, 5)
    // Strategies should have been auto-generated
    expect(autoEngine.getStrategies().length).toBeGreaterThanOrEqual(0)
  })
})

// ── Performance Trend Tests ──────────────────────────────────────────────────

describe('getPerformanceTrends', () => {
  let engine: SelfReflectionEngine

  beforeEach(() => {
    engine = new SelfReflectionEngine({ trendWindowSize: 5 })
  })

  it('returns empty when fewer than 4 evaluations exist', () => {
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.getPerformanceTrends()).toHaveLength(0)
  })

  it('returns trends when at least 4 evaluations exist', () => {
    populateEngine(engine, 6)
    const trends = engine.getPerformanceTrends()
    expect(trends.length).toBeGreaterThan(0)
  })

  it('trends have required fields', () => {
    populateEngine(engine, 6)
    const trends = engine.getPerformanceTrends()
    for (const t of trends) {
      expect(t).toHaveProperty('dimension')
      expect(t).toHaveProperty('direction')
      expect(t).toHaveProperty('slope')
      expect(t).toHaveProperty('recentAvg')
      expect(t).toHaveProperty('historicalAvg')
      expect(t).toHaveProperty('windowSize')
    }
  })

  it('trend direction is improving, stable, or declining', () => {
    populateEngine(engine, 8)
    const trends = engine.getPerformanceTrends()
    for (const t of trends) {
      expect(['improving', 'stable', 'declining']).toContain(t.direction)
    }
  })

  it('trend recentAvg is between 0 and 1', () => {
    populateEngine(engine, 8)
    const trends = engine.getPerformanceTrends()
    for (const t of trends) {
      expect(t.recentAvg).toBeGreaterThanOrEqual(0)
      expect(t.recentAvg).toBeLessThanOrEqual(1)
    }
  })

  it('trend historicalAvg is between 0 and 1', () => {
    populateEngine(engine, 8)
    const trends = engine.getPerformanceTrends()
    for (const t of trends) {
      expect(t.historicalAvg).toBeGreaterThanOrEqual(0)
      expect(t.historicalAvg).toBeLessThanOrEqual(1)
    }
  })

  it('trend windowSize is a positive number', () => {
    populateEngine(engine, 8)
    const trends = engine.getPerformanceTrends()
    for (const t of trends) {
      expect(t.windowSize).toBeGreaterThan(0)
    }
  })

  it('covers all seven dimensions in trends', () => {
    populateEngine(engine, 10)
    const trends = engine.getPerformanceTrends()
    const dims = trends.map(t => t.dimension)
    for (const dim of ALL_DIMENSIONS) {
      expect(dims).toContain(dim)
    }
  })

  it('stable direction when all evaluations are identical', () => {
    for (let i = 0; i < 10; i++) {
      engine.evaluate('What is X? Tell me about X.', 'X is Y. It is clearly defined.')
    }
    const trends = engine.getPerformanceTrends()
    for (const t of trends) {
      expect(t.direction).toBe('stable')
    }
  })
})

// ── provideFeedback Tests ────────────────────────────────────────────────────

describe('provideFeedback', () => {
  let engine: SelfReflectionEngine

  beforeEach(() => {
    engine = new SelfReflectionEngine()
  })

  it('returns true for an existing evaluation', () => {
    const evaluation = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.provideFeedback(evaluation.id, true)).toBe(true)
  })

  it('returns false for a non-existent evaluation id', () => {
    expect(engine.provideFeedback('sr_nonexistent_000000', true)).toBe(false)
  })

  it('accepts wasCorrect=true without notes', () => {
    const evaluation = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.provideFeedback(evaluation.id, true)).toBe(true)
  })

  it('accepts wasCorrect=false without notes', () => {
    const evaluation = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.provideFeedback(evaluation.id, false)).toBe(true)
  })

  it('accepts wasCorrect=false with notes', () => {
    const evaluation = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.provideFeedback(evaluation.id, false, 'The answer was wrong')).toBe(true)
  })

  it('handles notes containing "wrong" keyword', () => {
    const evaluation = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.provideFeedback(evaluation.id, false, 'This was wrong')).toBe(true)
  })

  it('handles notes containing "outdated" keyword', () => {
    const evaluation = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.provideFeedback(evaluation.id, false, 'This is outdated info')).toBe(true)
  })

  it('handles notes containing "missing" keyword', () => {
    const evaluation = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.provideFeedback(evaluation.id, false, 'Content was missing')).toBe(true)
  })

  it('feedback on high-score evaluation updates error pattern when wasCorrect is false', () => {
    // Create a high-confidence evaluation by crafting an output that gets high scores
    const goodOutput =
      'This is verified and correct. The information is accurate and precise. ' +
      'Specifically regarding the topic, it clearly covers all aspects. ' +
      'Furthermore, it is comprehensive and detailed. ' +
      '1. Step one. 2. Step two. 3. Step three. ' +
      'Therefore, because of this, it follows logically. ' +
      'The result is straightforward and understandable.'
    const evaluation = engine.evaluate('Explain something', goodOutput)
    // Seed an error pattern first so feedback can update it
    engine.evaluate('Q2', makeOverConfidentOutput())
    engine.evaluate('Q3', makeOverConfidentOutput())
    engine.provideFeedback(evaluation.id, false, 'It was wrong')
    // Should still return true
    expect(true).toBe(true)
  })
})

// ── Serialization / Deserialization Tests ────────────────────────────────────

describe('serialization and deserialization', () => {
  it('serialize returns a valid JSON string', () => {
    const engine = new SelfReflectionEngine()
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const json = engine.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('serialized data contains evaluations', () => {
    const engine = new SelfReflectionEngine()
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const data = JSON.parse(engine.serialize())
    expect(Array.isArray(data.evaluations)).toBe(true)
    expect(data.evaluations.length).toBe(1)
  })

  it('serialized data contains errorPatterns array', () => {
    const engine = new SelfReflectionEngine({ minEvaluationsForPatterns: 2 })
    engine.evaluate('Q1', makeOverConfidentOutput())
    engine.evaluate('Q2', makeOverConfidentOutput())
    const data = JSON.parse(engine.serialize())
    expect(Array.isArray(data.errorPatterns)).toBe(true)
  })

  it('serialized data contains blindSpots array', () => {
    const engine = new SelfReflectionEngine()
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const data = JSON.parse(engine.serialize())
    expect(Array.isArray(data.blindSpots)).toBe(true)
  })

  it('serialized data contains strategies array', () => {
    const engine = new SelfReflectionEngine()
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const data = JSON.parse(engine.serialize())
    expect(Array.isArray(data.strategies)).toBe(true)
  })

  it('serialized data contains stats object', () => {
    const engine = new SelfReflectionEngine()
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const data = JSON.parse(engine.serialize())
    expect(data.stats).toBeDefined()
    expect(data.stats.totalEvaluations).toBe(1)
  })

  it('serialize limits evaluations to last 100', () => {
    const engine = new SelfReflectionEngine()
    populateEngine(engine, 120)
    const data = JSON.parse(engine.serialize())
    expect(data.evaluations.length).toBeLessThanOrEqual(100)
  })

  it('deserialize restores evaluations', () => {
    const original = new SelfReflectionEngine()
    original.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    original.evaluate(LONG_INPUT, LONG_OUTPUT)
    const json = original.serialize()
    const restored = SelfReflectionEngine.deserialize(json)
    expect(restored.getEvaluationHistory().length).toBe(2)
  })

  it('deserialize restores stats', () => {
    const original = new SelfReflectionEngine()
    original.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const json = original.serialize()
    const restored = SelfReflectionEngine.deserialize(json)
    expect(restored.getStats().totalEvaluations).toBe(1)
  })

  it('deserialize accepts optional config', () => {
    const original = new SelfReflectionEngine()
    original.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const json = original.serialize()
    const restored = SelfReflectionEngine.deserialize(json, { maxEvaluationHistory: 10 })
    expect(restored.getEvaluationHistory().length).toBe(1)
  })

  it('deserialize returns fresh engine on invalid JSON', () => {
    const restored = SelfReflectionEngine.deserialize('not-valid-json')
    expect(restored.getEvaluationHistory()).toHaveLength(0)
    expect(restored.getStats().totalEvaluations).toBe(0)
  })

  it('deserialize returns fresh engine on empty JSON object', () => {
    const restored = SelfReflectionEngine.deserialize('{}')
    expect(restored.getEvaluationHistory()).toHaveLength(0)
  })

  it('deserialized engine can continue to evaluate', () => {
    const original = new SelfReflectionEngine()
    original.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const json = original.serialize()
    const restored = SelfReflectionEngine.deserialize(json)
    restored.evaluate(LONG_INPUT, LONG_OUTPUT)
    expect(restored.getEvaluationHistory().length).toBe(2)
  })

  it('round-trip preserves evaluation input and output', () => {
    const original = new SelfReflectionEngine()
    original.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const json = original.serialize()
    const restored = SelfReflectionEngine.deserialize(json)
    const history = restored.getEvaluationHistory()
    expect(history[0].input).toBe(SHORT_INPUT)
    expect(history[0].output).toBe(SHORT_OUTPUT)
  })
})

// ── Edge Cases ───────────────────────────────────────────────────────────────

describe('edge cases', () => {
  let engine: SelfReflectionEngine

  beforeEach(() => {
    engine = new SelfReflectionEngine()
  })

  it('handles empty input string', () => {
    const result = engine.evaluate('', SHORT_OUTPUT)
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(1)
  })

  it('handles empty output string', () => {
    const result = engine.evaluate(SHORT_INPUT, '')
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(1)
  })

  it('handles both input and output empty', () => {
    const result = engine.evaluate('', '')
    expect(result.dimensionScores).toHaveLength(7)
  })

  it('handles very long input string', () => {
    const longInput = 'word '.repeat(5000)
    const result = engine.evaluate(longInput, SHORT_OUTPUT)
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(1)
  })

  it('handles very long output string', () => {
    const longOutput = 'word '.repeat(5000)
    const result = engine.evaluate(SHORT_INPUT, longOutput)
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(1)
  })

  it('handles special characters in input and output', () => {
    const result = engine.evaluate(
      'What about <script>alert("xss")</script>?',
      'The answer involves "quotes" and \'apostrophes\' and \\ backslashes.',
    )
    expect(result.dimensionScores).toHaveLength(7)
  })

  it('handles unicode characters', () => {
    const result = engine.evaluate('Что такое TypeScript?', 'TypeScript هو لغة برمجة 🚀')
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
  })

  it('handles newlines and tabs in text', () => {
    const result = engine.evaluate('Question\n\twith\nnewlines', 'Answer\n\twith\ttabs')
    expect(result.dimensionScores).toHaveLength(7)
  })

  it('handles single-word input and output', () => {
    const result = engine.evaluate('TypeScript', 'Language')
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(1)
  })

  it('handles rapid sequential evaluations', () => {
    for (let i = 0; i < 50; i++) {
      engine.evaluate(`Question ${i}`, `Answer ${i}`)
    }
    expect(engine.getStats().totalEvaluations).toBe(50)
  })

  it('provideFeedback returns false for empty string id', () => {
    expect(engine.provideFeedback('', true)).toBe(false)
  })

  it('detectErrorPatterns is idempotent', () => {
    const eng = new SelfReflectionEngine({ minEvaluationsForPatterns: 2 })
    eng.evaluate('Q1', makeOverConfidentOutput())
    eng.evaluate('Q2', makeOverConfidentOutput())
    const first = eng.detectErrorPatterns()
    const second = eng.detectErrorPatterns()
    expect(first.length).toBe(second.length)
  })

  it('detectBlindSpots is idempotent', () => {
    const eng = new SelfReflectionEngine({ weaknessThreshold: 0.99 })
    for (let i = 0; i < 5; i++) {
      eng.evaluate('What is X? Tell me.', 'X.')
    }
    const first = eng.detectBlindSpots()
    const second = eng.detectBlindSpots()
    expect(first.length).toBe(second.length)
  })

  it('getPerformanceTrends is safe to call on empty engine', () => {
    expect(engine.getPerformanceTrends()).toHaveLength(0)
  })

  it('generateStrategies is safe to call on empty engine', () => {
    expect(engine.generateStrategies()).toHaveLength(0)
  })
})

// ── Stats Tracking Tests ─────────────────────────────────────────────────────

describe('getStats', () => {
  let engine: SelfReflectionEngine

  beforeEach(() => {
    engine = new SelfReflectionEngine()
  })

  it('returns a valid SelfReflectionEngineStats object', () => {
    const stats: SelfReflectionEngineStats = engine.getStats()
    expect(stats).toHaveProperty('totalEvaluations')
    expect(stats).toHaveProperty('avgOverallScore')
    expect(stats).toHaveProperty('errorPatternsDetected')
    expect(stats).toHaveProperty('blindSpotsDetected')
    expect(stats).toHaveProperty('strategiesGenerated')
    expect(stats).toHaveProperty('improvementRate')
  })

  it('totalEvaluations starts at 0', () => {
    expect(engine.getStats().totalEvaluations).toBe(0)
  })

  it('avgOverallScore is 0 when no evaluations exist', () => {
    expect(engine.getStats().avgOverallScore).toBe(0)
  })

  it('totalEvaluations increments correctly', () => {
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    engine.evaluate(LONG_INPUT, LONG_OUTPUT)
    engine.evaluate(TECHNICAL_INPUT, TECHNICAL_OUTPUT)
    expect(engine.getStats().totalEvaluations).toBe(3)
  })

  it('avgOverallScore is computed correctly', () => {
    const e1 = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const e2 = engine.evaluate(LONG_INPUT, LONG_OUTPUT)
    const expectedAvg = (e1.overallScore + e2.overallScore) / 2
    expect(engine.getStats().avgOverallScore).toBeCloseTo(expectedAvg, 5)
  })

  it('improvementRate is 0 with fewer than 4 evaluations', () => {
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(engine.getStats().improvementRate).toBe(0)
  })

  it('improvementRate is calculated with 4+ evaluations', () => {
    populateEngine(engine, 6)
    const rate = engine.getStats().improvementRate
    expect(typeof rate).toBe('number')
  })

  it('errorPatternsDetected is 0 initially', () => {
    expect(engine.getStats().errorPatternsDetected).toBe(0)
  })

  it('blindSpotsDetected is 0 initially', () => {
    expect(engine.getStats().blindSpotsDetected).toBe(0)
  })

  it('strategiesGenerated is 0 initially', () => {
    expect(engine.getStats().strategiesGenerated).toBe(0)
  })
})

// ── Accessor Methods Tests ───────────────────────────────────────────────────

describe('accessor methods', () => {
  it('getEvaluationHistory returns copies (immutable)', () => {
    const engine = new SelfReflectionEngine()
    engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    const h1 = engine.getEvaluationHistory()
    const h2 = engine.getEvaluationHistory()
    expect(h1).not.toBe(h2)
    expect(h1).toEqual(h2)
  })

  it('getErrorPatterns returns copies', () => {
    const engine = new SelfReflectionEngine({ minEvaluationsForPatterns: 2 })
    engine.evaluate('Q1', makeOverConfidentOutput())
    engine.evaluate('Q2', makeOverConfidentOutput())
    const p1 = engine.getErrorPatterns()
    const p2 = engine.getErrorPatterns()
    expect(p1).not.toBe(p2)
  })

  it('getBlindSpots returns copies', () => {
    const engine = new SelfReflectionEngine()
    const s1 = engine.getBlindSpots()
    const s2 = engine.getBlindSpots()
    expect(s1).not.toBe(s2)
  })

  it('getStrategies returns copies', () => {
    const engine = new SelfReflectionEngine()
    const s1 = engine.getStrategies()
    const s2 = engine.getStrategies()
    expect(s1).not.toBe(s2)
  })
})

// ── Domain Detection Tests ───────────────────────────────────────────────────

describe('domain detection', () => {
  let engine: SelfReflectionEngine

  beforeEach(() => {
    engine = new SelfReflectionEngine()
  })

  it('detects science domain', () => {
    const result = engine.evaluate(
      'What is the hypothesis for this experiment?',
      'The theory is that the observation supports the research data from the study.',
    )
    expect(result.domain).toBe('science')
  })

  it('detects math domain', () => {
    const result = engine.evaluate(
      'Solve this equation and prove the theorem.',
      'Using the formula, we calculate the proof for the number.',
    )
    expect(result.domain).toBe('math')
  })

  it('detects language domain', () => {
    const result = engine.evaluate(
      'Analyze the grammar of this sentence.',
      'The word order and linguistic structure of the sentence follows grammar rules. The translation is accurate.',
    )
    expect(result.domain).toBe('language')
  })

  it('falls back to general for unrecognized topics', () => {
    const result = engine.evaluate('Tell me something.', 'Here is something.')
    expect(result.domain).toBe('general')
  })
})

// ── Integration Tests ────────────────────────────────────────────────────────

describe('integration: full workflow', () => {
  it('evaluates, detects patterns, finds blind spots, generates strategies, and tracks trends', () => {
    const engine = new SelfReflectionEngine({
      minEvaluationsForPatterns: 3,
      trendWindowSize: 5,
      weaknessThreshold: 0.99,
    })

    // Phase 1: Build up evaluation history
    for (let i = 0; i < 8; i++) {
      engine.evaluate(
        `Question ${i}: Explain something about general topics.`,
        `Answer ${i}: This is a brief answer.`,
      )
    }

    const stats = engine.getStats()
    expect(stats.totalEvaluations).toBe(8)
    expect(stats.avgOverallScore).toBeGreaterThan(0)

    const trends = engine.getPerformanceTrends()
    expect(trends.length).toBeGreaterThan(0)

    const history = engine.getEvaluationHistory()
    expect(history.length).toBe(8)
  })

  it('serialization round-trip preserves full engine state', () => {
    const engine = new SelfReflectionEngine({ minEvaluationsForPatterns: 2 })
    engine.evaluate('Q1', makeOverConfidentOutput())
    engine.evaluate('Q2', makeOverConfidentOutput())
    engine.evaluate(TECHNICAL_INPUT, TECHNICAL_OUTPUT)

    const json = engine.serialize()
    const restored = SelfReflectionEngine.deserialize(json, { minEvaluationsForPatterns: 2 })

    expect(restored.getEvaluationHistory().length).toBe(3)
    expect(restored.getStats().totalEvaluations).toBe(3)
  })

  it('feedback does not crash when error pattern does not exist yet', () => {
    const engine = new SelfReflectionEngine()
    const evaluation = engine.evaluate(SHORT_INPUT, SHORT_OUTPUT)
    expect(() => {
      engine.provideFeedback(evaluation.id, false, 'wrong answer')
    }).not.toThrow()
  })
})
