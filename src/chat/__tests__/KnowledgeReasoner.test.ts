import { describe, it, expect, beforeEach } from 'vitest'
import {
  KnowledgeReasoner,
  type KnowledgeReasonerConfig,
  type KnowledgeReasonerStats,
  type KnowledgeFact,
  type InferenceChain,
  type ComposedAnswer,
  type Contradiction,
  type ExplanationResult,
  type ExplanationPath,
  type Hypothesis,
} from '../KnowledgeReasoner'

// ── Constructor Tests ──

describe('KnowledgeReasoner constructor', () => {
  it('creates an instance with default config', () => {
    const reasoner = new KnowledgeReasoner()
    expect(reasoner).toBeInstanceOf(KnowledgeReasoner)
  })

  it('accepts a partial custom config', () => {
    const reasoner = new KnowledgeReasoner({ maxFacts: 100 })
    expect(reasoner).toBeInstanceOf(KnowledgeReasoner)
  })

  it('accepts a full custom config', () => {
    const reasoner = new KnowledgeReasoner({
      maxFacts: 200,
      maxInferenceDepth: 3,
      confidenceDecayPerHop: 0.8,
      minConfidence: 0.2,
      enableContradictionDetection: false,
      enableHypothesisGeneration: false,
      maxHypotheses: 3,
    })
    expect(reasoner).toBeInstanceOf(KnowledgeReasoner)
  })

  it('starts with zero facts', () => {
    const reasoner = new KnowledgeReasoner()
    expect(reasoner.getFactCount()).toBe(0)
  })
})

// ── addFact / removeFact Tests ──

describe('KnowledgeReasoner addFact and removeFact', () => {
  let reasoner: KnowledgeReasoner

  beforeEach(() => {
    reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
  })

  it('adds a fact and returns a string id', () => {
    const id = reasoner.addFact('TypeScript', 'has', 'generics')
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('increments fact count after adding facts', () => {
    reasoner.addFact('TypeScript', 'is', 'language')
    reasoner.addFact('Python', 'is', 'language')
    expect(reasoner.getFactCount()).toBe(2)
  })

  it('stores facts with default confidence 1.0 and source "user"', () => {
    reasoner.addFact('Rust', 'has', 'ownership')
    const facts = reasoner.findFacts({ subject: 'rust' })
    expect(facts.length).toBe(1)
    expect(facts[0].confidence).toBe(1)
    expect(facts[0].source).toBe('user')
  })

  it('accepts optional confidence and source parameters', () => {
    reasoner.addFact('Go', 'has', 'goroutines', 0.9, 'textbook')
    const facts = reasoner.findFacts({ subject: 'go' })
    expect(facts[0].confidence).toBe(0.9)
    expect(facts[0].source).toBe('textbook')
  })

  it('clamps confidence to [0, 1]', () => {
    reasoner.addFact('X', 'is', 'Y', 5.0)
    reasoner.addFact('A', 'is', 'B', -1.0)
    const factsX = reasoner.findFacts({ subject: 'x' })
    const factsA = reasoner.findFacts({ subject: 'a' })
    expect(factsX[0].confidence).toBe(1)
    expect(factsA[0].confidence).toBe(0)
  })

  it('removes a fact by id and returns true', () => {
    const id = reasoner.addFact('Java', 'has', 'JVM')
    expect(reasoner.removeFact(id)).toBe(true)
    expect(reasoner.getFactCount()).toBe(0)
  })

  it('returns false when removing a nonexistent fact id', () => {
    expect(reasoner.removeFact('nonexistent-id')).toBe(false)
  })

  it('evicts least-recently-used facts when maxFacts is reached', () => {
    const small = new KnowledgeReasoner({
      maxFacts: 2,
      enableContradictionDetection: false,
    })
    small.addFact('A', 'rel', 'one')
    small.addFact('B', 'rel', 'two')
    small.addFact('C', 'rel', 'three')
    expect(small.getFactCount()).toBe(2)
  })
})

// ── findFacts / getFactsBySubject / getFactsByRelation Tests ──

describe('KnowledgeReasoner fact querying', () => {
  let reasoner: KnowledgeReasoner

  beforeEach(() => {
    reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
    reasoner.addFact('TypeScript', 'has', 'generics', 0.9)
    reasoner.addFact('TypeScript', 'compiles-to', 'JavaScript', 1.0)
    reasoner.addFact('Python', 'has', 'decorators', 0.8)
  })

  it('findFacts returns matching facts by subject', () => {
    const facts = reasoner.findFacts({ subject: 'typescript' })
    expect(facts.length).toBe(2)
  })

  it('findFacts returns results sorted by confidence descending', () => {
    const facts = reasoner.findFacts({ subject: 'typescript' })
    expect(facts[0].confidence).toBeGreaterThanOrEqual(facts[1].confidence)
  })

  it('findFacts returns empty array when nothing matches', () => {
    const facts = reasoner.findFacts({ subject: 'haskell' })
    expect(facts).toEqual([])
  })

  it('getFactsBySubject delegates to findFacts correctly', () => {
    const facts = reasoner.getFactsBySubject('Python')
    expect(facts.length).toBe(1)
    expect(facts[0].relation).toBe('has')
  })

  it('getFactsByRelation retrieves all facts with that relation', () => {
    const facts = reasoner.getFactsByRelation('has')
    expect(facts.length).toBe(2)
  })

  it('getFactCount returns the current number of facts', () => {
    expect(reasoner.getFactCount()).toBe(3)
  })
})

// ── inferTransitive Tests ──

describe('KnowledgeReasoner inferTransitive', () => {
  let reasoner: KnowledgeReasoner

  beforeEach(() => {
    reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
    reasoner.addFact('dog', 'is-a', 'mammal', 1.0)
    reasoner.addFact('mammal', 'is-a', 'animal', 1.0)
    reasoner.addFact('animal', 'is-a', 'living-thing', 1.0)
  })

  it('infers transitive chains of depth 2', () => {
    const chains = reasoner.inferTransitive('dog', 'is-a')
    const conclusions = chains.map(c => c.conclusion.object)
    expect(conclusions).toContain('animal')
  })

  it('infers longer transitive chains', () => {
    const chains = reasoner.inferTransitive('dog', 'is-a')
    const conclusions = chains.map(c => c.conclusion.object)
    expect(conclusions).toContain('living-thing')
  })

  it('returns chains sorted by confidence descending', () => {
    const chains = reasoner.inferTransitive('dog', 'is-a')
    for (let i = 1; i < chains.length; i++) {
      expect(chains[i - 1].confidence).toBeGreaterThanOrEqual(chains[i].confidence)
    }
  })

  it('respects maxDepth parameter', () => {
    const chains = reasoner.inferTransitive('dog', 'is-a', 2)
    for (const chain of chains) {
      expect(chain.depth).toBeLessThanOrEqual(2)
    }
  })

  it('returns empty array when no transitive links exist', () => {
    const chains = reasoner.inferTransitive('dog', 'has-color')
    expect(chains).toEqual([])
  })
})

// ── composeAnswer Tests ──

describe('KnowledgeReasoner composeAnswer', () => {
  let reasoner: KnowledgeReasoner

  beforeEach(() => {
    reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
    reasoner.addFact('TypeScript', 'has', 'generics')
    reasoner.addFact('TypeScript', 'compiles-to', 'JavaScript')
    reasoner.addFact('JavaScript', 'runs-in', 'browser')
  })

  it('returns a ComposedAnswer with required fields', () => {
    const answer = reasoner.composeAnswer('What does TypeScript have?')
    expect(typeof answer.answer).toBe('string')
    expect(Array.isArray(answer.facts)).toBe(true)
    expect(Array.isArray(answer.chains)).toBe(true)
    expect(typeof answer.confidence).toBe('number')
    expect(typeof answer.coverage).toBe('number')
    expect(typeof answer.explanation).toBe('string')
  })

  it('returns relevant facts in the answer', () => {
    const answer = reasoner.composeAnswer('Tell me about TypeScript')
    expect(answer.facts.length).toBeGreaterThan(0)
  })

  it('returns an empty answer for unrecognized entities', () => {
    const answer = reasoner.composeAnswer('$$$')
    expect(answer.facts).toEqual([])
    expect(answer.confidence).toBe(0)
    expect(answer.coverage).toBe(0)
  })
})

// ── detectContradictions / checkConsistency Tests ──

describe('KnowledgeReasoner contradiction detection', () => {
  it('detects exclusive-relation conflicts', () => {
    const reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
    reasoner.addFact('paris', 'is', 'capital of france', 1.0)
    reasoner.addFact('paris', 'is', 'capital of germany', 0.5)
    const contradictions = reasoner.detectContradictions()
    expect(contradictions.length).toBeGreaterThan(0)
    const types = contradictions.map(c => c.type)
    expect(types).toContain('conflict')
  })

  it('detects negation contradictions', () => {
    const reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
    reasoner.addFact('earth', 'is', 'round', 1.0)
    reasoner.addFact('earth', 'is not', 'round', 0.3)
    const contradictions = reasoner.detectContradictions()
    expect(contradictions.length).toBeGreaterThan(0)
  })

  it('returns empty array when no contradictions exist', () => {
    const reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
    reasoner.addFact('sun', 'is', 'star')
    reasoner.addFact('moon', 'is', 'satellite')
    const contradictions = reasoner.detectContradictions()
    expect(contradictions).toEqual([])
  })

  it('checkConsistency returns contradictions for a candidate fact', () => {
    const reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
    reasoner.addFact('paris', 'is', 'capital of france', 1.0)
    const candidate: KnowledgeFact = {
      id: 'test',
      subject: 'paris',
      relation: 'is',
      object: 'capital of germany',
      confidence: 0.5,
      source: 'test',
      createdAt: Date.now(),
      lastUsed: Date.now(),
      useCount: 0,
    }
    const issues = reasoner.checkConsistency(candidate)
    expect(issues.length).toBeGreaterThan(0)
  })
})

// ── Confidence Propagation Tests ──

describe('KnowledgeReasoner confidence propagation', () => {
  let reasoner: KnowledgeReasoner

  beforeEach(() => {
    reasoner = new KnowledgeReasoner({ confidenceDecayPerHop: 0.9 })
  })

  it('propagateConfidence returns 0 for empty chain', () => {
    expect(reasoner.propagateConfidence([])).toBe(0)
  })

  it('propagateConfidence returns the fact confidence for single-fact chain', () => {
    const fact = { confidence: 0.8 } as KnowledgeFact
    expect(reasoner.propagateConfidence([fact])).toBe(0.8)
  })

  it('propagateConfidence applies decay for multi-hop chains', () => {
    const chain = [
      { confidence: 1.0 } as KnowledgeFact,
      { confidence: 1.0 } as KnowledgeFact,
    ]
    const result = reasoner.propagateConfidence(chain)
    expect(result).toBe(0.9) // 1.0 * 1.0 * 0.9^1
  })

  it('accumulateEvidence returns 0 for empty chains array', () => {
    expect(reasoner.accumulateEvidence([])).toBe(0)
  })

  it('accumulateEvidence returns single chain confidence when only one chain', () => {
    const chains = [{ confidence: 0.7 } as InferenceChain]
    expect(reasoner.accumulateEvidence(chains)).toBe(0.7)
  })

  it('accumulateEvidence combines multiple chains with noisy-OR', () => {
    const chains = [
      { confidence: 0.5 } as InferenceChain,
      { confidence: 0.5 } as InferenceChain,
    ]
    const result = reasoner.accumulateEvidence(chains)
    // noisy-OR: 1 - (1-0.5)*(1-0.5) = 0.75
    expect(result).toBe(0.75)
  })

  it('meetsConfidenceThreshold respects configured minConfidence', () => {
    const custom = new KnowledgeReasoner({ minConfidence: 0.5 })
    expect(custom.meetsConfidenceThreshold(0.6)).toBe(true)
    expect(custom.meetsConfidenceThreshold(0.4)).toBe(false)
    expect(custom.meetsConfidenceThreshold(0.5)).toBe(true)
  })
})

// ── explain Tests ──

describe('KnowledgeReasoner explain', () => {
  let reasoner: KnowledgeReasoner

  beforeEach(() => {
    reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
    reasoner.addFact('TypeScript', 'compiles-to', 'JavaScript')
    reasoner.addFact('JavaScript', 'runs-in', 'browser')
  })

  it('returns an ExplanationResult with required fields', () => {
    const result = reasoner.explain('TypeScript runs in browser')
    expect(typeof result.conclusion).toBe('string')
    expect(Array.isArray(result.explanations)).toBe(true)
    expect(Array.isArray(result.counterEvidence)).toBe(true)
  })

  it('each explanation path has steps, naturalLanguage, and confidence', () => {
    const result = reasoner.explain('TypeScript compiles to JavaScript')
    for (const path of result.explanations) {
      expect(Array.isArray(path.steps)).toBe(true)
      expect(path.steps.length).toBeGreaterThan(0)
      expect(typeof path.naturalLanguage).toBe('string')
      expect(path.naturalLanguage.length).toBeGreaterThan(0)
      expect(typeof path.confidence).toBe('number')
    }
  })

  it('returns empty explanations when no relevant facts exist', () => {
    const result = reasoner.explain('Haskell monads lazy evaluation')
    expect(result.explanations).toEqual([])
  })
})

// ── generateHypotheses Tests ──

describe('KnowledgeReasoner generateHypotheses', () => {
  let reasoner: KnowledgeReasoner

  beforeEach(() => {
    reasoner = new KnowledgeReasoner({
      enableContradictionDetection: false,
      enableHypothesisGeneration: true,
    })
    reasoner.addFact('python', 'has', 'dynamic typing', 0.9)
    reasoner.addFact('ruby', 'has', 'dynamic typing', 0.9)
    reasoner.addFact('ruby', 'has', 'blocks', 0.85)
  })

  it('returns an array of hypotheses', () => {
    const hypotheses = reasoner.generateHypotheses('Does python have blocks?')
    expect(Array.isArray(hypotheses)).toBe(true)
  })

  it('each hypothesis has statement, confidence, supportingFacts, reasoning, and type', () => {
    const hypotheses = reasoner.generateHypotheses('Does python have blocks?')
    for (const h of hypotheses) {
      expect(typeof h.statement).toBe('string')
      expect(typeof h.confidence).toBe('number')
      expect(Array.isArray(h.supportingFacts)).toBe(true)
      expect(typeof h.reasoning).toBe('string')
      expect(['analogical', 'inductive', 'abductive']).toContain(h.type)
    }
  })

  it('returns empty when hypothesis generation is disabled', () => {
    const disabled = new KnowledgeReasoner({ enableHypothesisGeneration: false })
    disabled.addFact('python', 'has', 'dynamic typing')
    const hypotheses = disabled.generateHypotheses('Does python have blocks?')
    expect(hypotheses).toEqual([])
  })

  it('respects maxHypotheses parameter', () => {
    const hypotheses = reasoner.generateHypotheses('Does python have blocks?', 1)
    expect(hypotheses.length).toBeLessThanOrEqual(1)
  })
})

// ── feedback Tests ──

describe('KnowledgeReasoner feedback', () => {
  let reasoner: KnowledgeReasoner

  beforeEach(() => {
    reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
  })

  it('positive feedback increases fact confidence', () => {
    const id = reasoner.addFact('Earth', 'is', 'round', 0.8)
    reasoner.feedback([id], true)
    const facts = reasoner.findFacts({ subject: 'earth' })
    expect(facts[0].confidence).toBe(0.85)
  })

  it('negative feedback decreases fact confidence', () => {
    const id = reasoner.addFact('Mars', 'has', 'rings', 0.5)
    reasoner.feedback([id], false)
    const facts = reasoner.findFacts({ subject: 'mars' })
    expect(facts[0].confidence).toBe(0.4)
  })

  it('feedback on nonexistent ids does not throw', () => {
    expect(() => reasoner.feedback(['nonexistent'], true)).not.toThrow()
  })
})

// ── getStats / serialize / deserialize Tests ──

describe('KnowledgeReasoner stats and serialization', () => {
  it('getStats returns initial zero-valued stats', () => {
    const reasoner = new KnowledgeReasoner()
    const stats = reasoner.getStats()
    expect(stats.totalFacts).toBe(0)
    expect(stats.totalInferences).toBe(0)
    expect(stats.totalCompositions).toBe(0)
    expect(stats.totalContradictionsFound).toBe(0)
    expect(stats.totalHypothesesGenerated).toBe(0)
    expect(stats.totalExplanations).toBe(0)
    expect(stats.avgConfidence).toBe(0)
    expect(stats.feedbackReceived).toBe(0)
    expect(stats.feedbackAccuracy).toBe(0)
  })

  it('getStats reflects added facts', () => {
    const reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
    reasoner.addFact('A', 'rel', 'B')
    reasoner.addFact('C', 'rel', 'D')
    expect(reasoner.getStats().totalFacts).toBe(2)
  })

  it('serialize returns a valid JSON string', () => {
    const reasoner = new KnowledgeReasoner({ enableContradictionDetection: false })
    reasoner.addFact('TypeScript', 'has', 'generics')
    const json = reasoner.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('deserialize restores a fully functional KnowledgeReasoner', () => {
    const original = new KnowledgeReasoner({ enableContradictionDetection: false })
    original.addFact('TypeScript', 'has', 'generics', 0.95)
    original.addFact('JavaScript', 'runs-in', 'browser', 1.0)
    const json = original.serialize()

    const restored = KnowledgeReasoner.deserialize(json)
    expect(restored).toBeInstanceOf(KnowledgeReasoner)
    expect(restored.getFactCount()).toBe(2)

    const facts = restored.findFacts({ subject: 'typescript' })
    expect(facts.length).toBe(1)
    expect(facts[0].object).toBe('generics')
  })

  it('deserialized instance preserves stats counters', () => {
    const original = new KnowledgeReasoner({ enableContradictionDetection: false })
    const id = original.addFact('X', 'rel', 'Y')
    original.feedback([id], true)
    const json = original.serialize()

    const restored = KnowledgeReasoner.deserialize(json)
    const stats = restored.getStats()
    expect(stats.feedbackReceived).toBe(1)
    expect(stats.feedbackAccuracy).toBe(1)
  })
})
