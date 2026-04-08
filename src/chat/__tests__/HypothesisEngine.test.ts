import { describe, it, expect } from 'vitest'
import { HypothesisEngine, DEFAULT_HYPOTHESIS_ENGINE_CONFIG } from '../HypothesisEngine.js'

// ─── Helpers ────────────────────────────────────────────────────────────────────

function makeEvidence(
  overrides: Partial<{ id: string; description: string; strength: number; source: string; supports: boolean }> = {},
) {
  return {
    id: overrides.id ?? 'ev1',
    description: overrides.description ?? 'Some evidence',
    strength: overrides.strength ?? 0.8,
    source: overrides.source ?? 'test',
    supports: overrides.supports ?? true,
  }
}

function addManyEvidences(
  engine: HypothesisEngine,
  hId: string,
  count: number,
  supports: boolean,
  strength = 0.8,
) {
  for (let i = 0; i < count; i++) {
    engine.addEvidence(hId, makeEvidence({
      id: `ev_${supports ? 's' : 'c'}_${i}`,
      strength,
      supports,
    }))
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('HypothesisEngine', () => {
  // ── DEFAULT_HYPOTHESIS_ENGINE_CONFIG ──────────────────────────────────────

  describe('DEFAULT_HYPOTHESIS_ENGINE_CONFIG', () => {
    it('should have maxHypotheses of 100', () => {
      expect(DEFAULT_HYPOTHESIS_ENGINE_CONFIG.maxHypotheses).toBe(100)
    })

    it('should have confidenceDecayRate of 0.05', () => {
      expect(DEFAULT_HYPOTHESIS_ENGINE_CONFIG.confidenceDecayRate).toBe(0.05)
    })

    it('should have minEvidenceForConclusion of 3', () => {
      expect(DEFAULT_HYPOTHESIS_ENGINE_CONFIG.minEvidenceForConclusion).toBe(3)
    })

    it('should have enableBayesianUpdate as true', () => {
      expect(DEFAULT_HYPOTHESIS_ENGINE_CONFIG.enableBayesianUpdate).toBe(true)
    })
  })

  // ── Constructor ──────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create engine with default config when no args given', () => {
      const engine = new HypothesisEngine()
      expect(engine.getAllHypotheses()).toEqual([])
      expect(engine.getStats().total).toBe(0)
    })

    it('should merge partial config with defaults', () => {
      const engine = new HypothesisEngine({ maxHypotheses: 5 })
      // Engine should still work; we verify maxHypotheses via overflow test
      expect(engine.getAllHypotheses()).toHaveLength(0)
    })

    it('should allow overriding enableBayesianUpdate', () => {
      const engine = new HypothesisEngine({ enableBayesianUpdate: false })
      const [h] = engine.generateHypotheses('server crash under load', 'technology')
      engine.addEvidence(h!.id, makeEvidence({ strength: 0.9, supports: true }))
      // Without Bayesian update confidence should stay at initial 0.5
      expect(engine.getHypothesis(h!.id)!.confidence).toBe(0.5)
    })

    it('should allow overriding minEvidenceForConclusion', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const [h] = engine.generateHypotheses('experiment reaction', 'science')
      engine.addEvidence(h!.id, makeEvidence({ strength: 0.9, supports: true }))
      const result = engine.testHypothesis(h!.id)
      // With minEvidence=1, a single strong piece of evidence should yield supported
      expect(result.verdict).toBe('supported')
    })

    it('should allow overriding confidenceDecayRate', () => {
      const engine = new HypothesisEngine({ confidenceDecayRate: 0.5 })
      // Just ensures the engine can be created with custom decay rate
      expect(engine.getAllHypotheses()).toHaveLength(0)
    })
  })

  // ── generateHypotheses ──────────────────────────────────────────────────

  describe('generateHypotheses()', () => {
    it('should generate at least 2 hypotheses for a given observation', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the server crashed unexpectedly')
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should generate at most 4 hypotheses', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('server latency memory cpu crash bug deploy network database performance issues')
      expect(results.length).toBeLessThanOrEqual(4)
    })

    it('should store generated hypotheses internally', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('energy particle experiment')
      expect(engine.getAllHypotheses().length).toBe(results.length)
    })

    it('should assign unique IDs to each hypothesis', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the chemical reaction was unexpected')
      const ids = results.map(h => h.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('should set initial confidence to 0.5', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the system shows odd behavior')
      for (const h of results) {
        expect(h.confidence).toBe(0.5)
      }
    })

    it('should set initial status to proposed', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the temperature dropped sharply')
      for (const h of results) {
        expect(h.status).toBe('proposed')
      }
    })

    it('should start with empty evidence arrays', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('memory leak in service')
      for (const h of results) {
        expect(h.evidence).toEqual([])
        expect(h.counterEvidence).toEqual([])
      }
    })

    // Domain-specific templates

    it('should use science templates when domain is science', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the chemical reaction rate', 'science')
      // Science templates contain phrases like "phenomenon", "cascading effect", etc.
      expect(results.some(h => h.statement.includes('phenomenon') || h.statement.includes('interaction') || h.statement.includes('mechanism') || h.statement.includes('Environmental'))).toBe(true)
      for (const h of results) {
        expect(h.domain).toBe('science')
      }
    })

    it('should use technology templates when domain is technology', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('server latency spike', 'technology')
      expect(results.some(h =>
        h.statement.includes('issue might stem') ||
        h.statement.includes('Performance degradation') ||
        h.statement.includes('configuration') ||
        h.statement.includes('Resource contention'),
      )).toBe(true)
      for (const h of results) {
        expect(h.domain).toBe('technology')
      }
    })

    it('should use logic templates when domain is logic', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the premise implies conclusion', 'logic')
      expect(results.some(h =>
        h.statement.includes('If A then B') ||
        h.statement.includes('absence of expected') ||
        h.statement.includes('elimination') ||
        h.statement.includes('pattern is consistent'),
      )).toBe(true)
      for (const h of results) {
        expect(h.domain).toBe('logic')
      }
    })

    it('should use general templates for unrecognized domains', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('something happened', 'unknown_domain')
      expect(results.some(h =>
        h.statement.includes('One explanation') ||
        h.statement.includes('alternative hypothesis') ||
        h.statement.includes('account for') ||
        h.statement.includes('plausible'),
      )).toBe(true)
    })

    it('should use general templates when domain is explicitly general', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('random observation', 'general')
      for (const h of results) {
        expect(h.domain).toBe('general')
      }
    })

    // Domain inference

    it('should infer science domain from science keywords', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the experiment with molecule energy was interesting')
      for (const h of results) {
        expect(h.domain).toBe('science')
      }
    })

    it('should infer technology domain from tech keywords', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the server latency and memory usage spiked')
      for (const h of results) {
        expect(h.domain).toBe('technology')
      }
    })

    it('should infer logic domain from logic keywords', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('therefore the premise implies a contradiction')
      for (const h of results) {
        expect(h.domain).toBe('logic')
      }
    })

    it('should default to general domain when no keywords match', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the cat sat on the mat')
      for (const h of results) {
        expect(h.domain).toBe('general')
      }
    })

    // Keyword extraction

    it('should incorporate observation keywords into hypothesis statements', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the database performance dropped significantly')
      // At least one hypothesis should contain extracted key phrases from the observation
      const allStatements = results.map(h => h.statement.toLowerCase()).join(' ')
      expect(allStatements).toContain('database')
    })

    it('should handle a very short observation', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('crash')
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle an observation with only stop words', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('the a an is are')
      expect(results.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ── addEvidence ──────────────────────────────────────────────────────────

  describe('addEvidence()', () => {
    it('should add supporting evidence to the hypothesis', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('server crash', 'technology')
      engine.addEvidence(h!.id, makeEvidence({ supports: true }))
      const updated = engine.getHypothesis(h!.id)!
      expect(updated.evidence).toHaveLength(1)
      expect(updated.counterEvidence).toHaveLength(0)
    })

    it('should add counter evidence to the hypothesis', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('server crash', 'technology')
      engine.addEvidence(h!.id, makeEvidence({ supports: false }))
      const updated = engine.getHypothesis(h!.id)!
      expect(updated.evidence).toHaveLength(0)
      expect(updated.counterEvidence).toHaveLength(1)
    })

    it('should increase confidence with strong supporting evidence (Bayesian)', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('reaction in lab', 'science')
      const before = h!.confidence
      engine.addEvidence(h!.id, makeEvidence({ strength: 0.9, supports: true }))
      expect(engine.getHypothesis(h!.id)!.confidence).toBeGreaterThan(before)
    })

    it('should decrease confidence with strong counter evidence (Bayesian)', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('reaction in lab', 'science')
      const before = h!.confidence
      engine.addEvidence(h!.id, makeEvidence({ strength: 0.9, supports: false }))
      expect(engine.getHypothesis(h!.id)!.confidence).toBeLessThan(before)
    })

    it('should keep confidence in [0,1] after many supporting evidences', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('experiment', 'science')
      for (let i = 0; i < 20; i++) {
        engine.addEvidence(h!.id, makeEvidence({ id: `e${i}`, strength: 1.0, supports: true }))
      }
      const conf = engine.getHypothesis(h!.id)!.confidence
      expect(conf).toBeGreaterThanOrEqual(0)
      expect(conf).toBeLessThanOrEqual(1)
    })

    it('should keep confidence in [0,1] after many counter evidences', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('experiment', 'science')
      for (let i = 0; i < 20; i++) {
        engine.addEvidence(h!.id, makeEvidence({ id: `c${i}`, strength: 1.0, supports: false }))
      }
      const conf = engine.getHypothesis(h!.id)!.confidence
      expect(conf).toBeGreaterThanOrEqual(0)
      expect(conf).toBeLessThanOrEqual(1)
    })

    it('should not crash when adding evidence to a nonexistent hypothesis', () => {
      const engine = new HypothesisEngine()
      expect(() => {
        engine.addEvidence('nonexistent_id', makeEvidence())
      }).not.toThrow()
    })

    it('should not update confidence when Bayesian update is disabled', () => {
      const engine = new HypothesisEngine({ enableBayesianUpdate: false })
      const [h] = engine.generateHypotheses('observation', 'general')
      engine.addEvidence(h!.id, makeEvidence({ strength: 0.9, supports: true }))
      expect(engine.getHypothesis(h!.id)!.confidence).toBe(0.5)
    })

    it('should accumulate multiple evidence items', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('cpu usage spike', 'technology')
      engine.addEvidence(h!.id, makeEvidence({ id: 'e1', supports: true }))
      engine.addEvidence(h!.id, makeEvidence({ id: 'e2', supports: true }))
      engine.addEvidence(h!.id, makeEvidence({ id: 'e3', supports: false }))
      const updated = engine.getHypothesis(h!.id)!
      expect(updated.evidence).toHaveLength(2)
      expect(updated.counterEvidence).toHaveLength(1)
    })

    it('should handle evidence with zero strength', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('odd behavior', 'general')
      const before = h!.confidence
      engine.addEvidence(h!.id, makeEvidence({ strength: 0, supports: true }))
      // Zero strength supporting evidence should not change confidence much
      expect(engine.getHypothesis(h!.id)!.confidence).toBe(before)
    })
  })

  // ── testHypothesis ──────────────────────────────────────────────────────

  describe('testHypothesis()', () => {
    it('should return inconclusive for a nonexistent hypothesis', () => {
      const engine = new HypothesisEngine()
      const result = engine.testHypothesis('no_such_id')
      expect(result.verdict).toBe('inconclusive')
      expect(result.confidence).toBe(0)
      expect(result.reasoning).toContain('not found')
    })

    it('should return inconclusive when below minEvidenceForConclusion', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 3 })
      const [h] = engine.generateHypotheses('observation', 'general')
      engine.addEvidence(h!.id, makeEvidence({ strength: 0.9, supports: true }))
      engine.addEvidence(h!.id, makeEvidence({ id: 'e2', strength: 0.9, supports: true }))
      const result = engine.testHypothesis(h!.id)
      expect(result.verdict).toBe('inconclusive')
    })

    it('should return supported when net evidence strength > 0.3', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const [h] = engine.generateHypotheses('experiment results', 'science')
      engine.addEvidence(h!.id, makeEvidence({ strength: 0.9, supports: true }))
      const result = engine.testHypothesis(h!.id)
      expect(result.verdict).toBe('supported')
    })

    it('should return refuted when net evidence strength < -0.3', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const [h] = engine.generateHypotheses('experiment results', 'science')
      engine.addEvidence(h!.id, makeEvidence({ strength: 0.9, supports: false }))
      const result = engine.testHypothesis(h!.id)
      expect(result.verdict).toBe('refuted')
    })

    it('should return inconclusive when evidence is balanced', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 2 })
      const [h] = engine.generateHypotheses('observation', 'general')
      engine.addEvidence(h!.id, makeEvidence({ id: 'e1', strength: 0.5, supports: true }))
      engine.addEvidence(h!.id, makeEvidence({ id: 'e2', strength: 0.5, supports: false }))
      const result = engine.testHypothesis(h!.id)
      expect(result.verdict).toBe('inconclusive')
    })

    it('should update the hypothesis status after testing', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const [h] = engine.generateHypotheses('server latency issue', 'technology')
      addManyEvidences(engine, h!.id, 3, true, 0.9)
      engine.testHypothesis(h!.id)
      expect(engine.getHypothesis(h!.id)!.status).toBe('supported')
    })

    it('should update the hypothesis confidence after testing', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const [h] = engine.generateHypotheses('something happened', 'general')
      addManyEvidences(engine, h!.id, 3, true, 0.9)
      const result = engine.testHypothesis(h!.id)
      expect(result.confidence).toBeGreaterThan(0.5)
      expect(engine.getHypothesis(h!.id)!.confidence).toBe(result.confidence)
    })

    it('should include reasoning string in the result', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const [h] = engine.generateHypotheses('observation', 'general')
      engine.addEvidence(h!.id, makeEvidence({ strength: 0.7, supports: true }))
      const result = engine.testHypothesis(h!.id)
      expect(result.reasoning).toContain('Evaluated hypothesis')
      expect(result.reasoning).toContain('Supporting evidence')
      expect(result.reasoning).toContain('Verdict')
    })

    it('should include empty newEvidence array', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('observation', 'general')
      const result = engine.testHypothesis(h!.id)
      expect(result.newEvidence).toEqual([])
    })

    it('should return the hypothesis object in result', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('observation', 'general')
      const result = engine.testHypothesis(h!.id)
      expect(result.hypothesis.id).toBe(h!.id)
    })

    it('should produce SUPPORTED verdict text in reasoning', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const [h] = engine.generateHypotheses('temperature experiment', 'science')
      addManyEvidences(engine, h!.id, 3, true, 0.9)
      const result = engine.testHypothesis(h!.id)
      expect(result.reasoning).toContain('SUPPORTED')
    })

    it('should produce REFUTED verdict text in reasoning', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const [h] = engine.generateHypotheses('temperature experiment', 'science')
      addManyEvidences(engine, h!.id, 3, false, 0.9)
      const result = engine.testHypothesis(h!.id)
      expect(result.reasoning).toContain('REFUTED')
    })
  })

  // ── evaluateExplanation ─────────────────────────────────────────────────

  describe('evaluateExplanation()', () => {
    it('should return a plausibility score between 0 and 1', () => {
      const engine = new HypothesisEngine()
      const result = engine.evaluateExplanation(
        'the server crashed',
        'a memory leak caused the server crash',
      )
      expect(result.plausibility).toBeGreaterThanOrEqual(0)
      expect(result.plausibility).toBeLessThanOrEqual(1)
    })

    it('should return higher plausibility when explanation shares keywords with observation', () => {
      const engine = new HypothesisEngine()
      const relevant = engine.evaluateExplanation(
        'the server crashed unexpectedly',
        'the server crashed due to a memory overflow',
      )
      const irrelevant = engine.evaluateExplanation(
        'the server crashed unexpectedly',
        'the birds are flying south for winter',
      )
      expect(relevant.plausibility).toBeGreaterThan(irrelevant.plausibility)
    })

    it('should award specificity for longer explanations', () => {
      const engine = new HypothesisEngine()
      const short = engine.evaluateExplanation('bug', 'code issue')
      const long = engine.evaluateExplanation(
        'bug',
        'the software application encountered a critical null pointer exception in the main processing loop which caused an unexpected termination of the running service',
      )
      expect(long.plausibility).toBeGreaterThan(short.plausibility)
    })

    it('should return alternative explanations', () => {
      const engine = new HypothesisEngine()
      const result = engine.evaluateExplanation(
        'the database performance dropped',
        'an index was corrupted',
      )
      expect(result.alternativeExplanations.length).toBeGreaterThan(0)
    })

    it('should not include the original explanation in alternatives', () => {
      const engine = new HypothesisEngine()
      const observation = 'the system went offline'
      const explanation = 'power failure'
      const result = engine.evaluateExplanation(observation, explanation)
      for (const alt of result.alternativeExplanations) {
        expect(alt).not.toBe(explanation)
      }
    })

    it('should return at most 3 alternative explanations', () => {
      const engine = new HypothesisEngine()
      const result = engine.evaluateExplanation('something happened', 'unknown cause')
      expect(result.alternativeExplanations.length).toBeLessThanOrEqual(3)
    })

    it('should handle empty observation', () => {
      const engine = new HypothesisEngine()
      const result = engine.evaluateExplanation('', 'some explanation')
      expect(result.plausibility).toBeGreaterThanOrEqual(0)
      expect(result.plausibility).toBeLessThanOrEqual(1)
    })

    it('should handle empty explanation', () => {
      const engine = new HypothesisEngine()
      const result = engine.evaluateExplanation('some observation', '')
      expect(result.plausibility).toBeGreaterThanOrEqual(0)
      expect(result.plausibility).toBeLessThanOrEqual(1)
    })
  })

  // ── findContradictions ──────────────────────────────────────────────────

  describe('findContradictions()', () => {
    it('should return empty array when no hypotheses exist', () => {
      const engine = new HypothesisEngine()
      expect(engine.findContradictions()).toEqual([])
    })

    it('should return empty array when no contradictions exist', () => {
      const engine = new HypothesisEngine()
      engine.generateHypotheses('server latency', 'technology')
      expect(engine.findContradictions()).toEqual([])
    })

    it('should detect opposing statuses in the same domain', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const hyps1 = engine.generateHypotheses('server crash problem', 'technology')
      const hyps2 = engine.generateHypotheses('network latency issue', 'technology')
      const h1 = hyps1[0]!
      const h2 = hyps2[0]!

      // Make h1 supported
      addManyEvidences(engine, h1.id, 3, true, 0.9)
      engine.testHypothesis(h1.id)

      // Make h2 refuted
      addManyEvidences(engine, h2.id, 3, false, 0.9)
      engine.testHypothesis(h2.id)

      const contradictions = engine.findContradictions()
      expect(contradictions.some(c =>
        c.reason.includes('Opposing conclusions'),
      )).toBe(true)
    })

    it('should detect shared evidence used in opposite directions', () => {
      const engine = new HypothesisEngine()
      const hyps = engine.generateHypotheses('experiment observation', 'science')
      const h1 = hyps[0]!
      const h2 = hyps[1]!

      const sharedEvidence = makeEvidence({ id: 'shared_ev', strength: 0.8 })

      // Add as supporting evidence for h1
      engine.addEvidence(h1.id, { ...sharedEvidence, supports: true })
      // Add as counter evidence for h2
      engine.addEvidence(h2.id, { ...sharedEvidence, supports: false })

      const contradictions = engine.findContradictions()
      expect(contradictions.some(c =>
        c.reason.includes('shared_ev'),
      )).toBe(true)
    })

    it('should detect keyword negation contradictions', () => {
      const engine = new HypothesisEngine()
      // Manually create hypotheses with negation
      const h1 = engine.generateHypotheses('the system load caused errors', 'general')[0]!
      const h2Id = engine.generateHypotheses('the system load did not cause errors', 'general')[0]?.id

      // We need statements that share key terms but differ in negation
      // Since we can't control statements directly, let's use the external list variant
      const hypotheses = [
        {
          id: 'h1', statement: 'the system load caused errors in processing',
          confidence: 0.5, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'proposed' as const, domain: 'general', createdAt: Date.now(),
        },
        {
          id: 'h2', statement: 'the system load did not cause errors in processing',
          confidence: 0.5, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'proposed' as const, domain: 'general', createdAt: Date.now(),
        },
      ]

      const contradictions = engine.findContradictions(hypotheses)
      expect(contradictions.some(c =>
        c.reason.includes('negation'),
      )).toBe(true)
    })

    it('should accept an external list of hypotheses', () => {
      const engine = new HypothesisEngine()
      const external = [
        {
          id: 'ext1', statement: 'A is true',
          confidence: 0.8, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'supported' as const, domain: 'science', createdAt: Date.now(),
        },
        {
          id: 'ext2', statement: 'A is not true',
          confidence: 0.2, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'refuted' as const, domain: 'science', createdAt: Date.now(),
        },
      ]
      const contradictions = engine.findContradictions(external)
      expect(contradictions.some(c => c.reason.includes('Opposing conclusions'))).toBe(true)
    })

    it('should not report contradiction for same-domain hypotheses with same status', () => {
      const engine = new HypothesisEngine()
      const external = [
        {
          id: 'ext1', statement: 'hypothesis one',
          confidence: 0.8, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'supported' as const, domain: 'science', createdAt: Date.now(),
        },
        {
          id: 'ext2', statement: 'hypothesis two',
          confidence: 0.7, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'supported' as const, domain: 'science', createdAt: Date.now(),
        },
      ]
      const contradictions = engine.findContradictions(external)
      expect(contradictions.filter(c => c.reason.includes('Opposing conclusions'))).toHaveLength(0)
    })

    it('should check all pairwise combinations', () => {
      const engine = new HypothesisEngine()
      const hypotheses = [
        {
          id: 'a', statement: 'alpha is true',
          confidence: 0.8, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'supported' as const, domain: 'science', createdAt: Date.now(),
        },
        {
          id: 'b', statement: 'beta is true',
          confidence: 0.3, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'refuted' as const, domain: 'science', createdAt: Date.now(),
        },
        {
          id: 'c', statement: 'gamma is true',
          confidence: 0.3, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'refuted' as const, domain: 'science', createdAt: Date.now(),
        },
      ]
      const contradictions = engine.findContradictions(hypotheses)
      // a vs b (supported vs refuted) and a vs c (supported vs refuted)
      const opposingContrads = contradictions.filter(c => c.reason.includes('Opposing conclusions'))
      expect(opposingContrads.length).toBe(2)
    })
  })

  // ── rankHypotheses ──────────────────────────────────────────────────────

  describe('rankHypotheses()', () => {
    it('should return an empty array when no hypotheses exist', () => {
      const engine = new HypothesisEngine()
      expect(engine.rankHypotheses()).toEqual([])
    })

    it('should rank hypotheses with higher confidence first', () => {
      const engine = new HypothesisEngine()
      const hyps = engine.generateHypotheses('server latency', 'technology')
      // Add strong evidence to the first one
      addManyEvidences(engine, hyps[0]!.id, 5, true, 0.9)
      const ranked = engine.rankHypotheses()
      expect(ranked[0]!.id).toBe(hyps[0]!.id)
    })

    it('should rank hypotheses with evidence above those without', () => {
      const engine = new HypothesisEngine()
      const hyps = engine.generateHypotheses('experiment result', 'science')
      // Add evidence only to the second hypothesis
      engine.addEvidence(hyps[1]!.id, makeEvidence({ strength: 0.8, supports: true }))
      const ranked = engine.rankHypotheses()
      // The one with evidence should rank higher
      expect(ranked[0]!.id).toBe(hyps[1]!.id)
    })

    it('should accept an external list of hypotheses', () => {
      const engine = new HypothesisEngine()
      const external = [
        {
          id: 'low', statement: 'low confidence',
          confidence: 0.1, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'proposed' as const, domain: 'general', createdAt: Date.now(),
        },
        {
          id: 'high', statement: 'high confidence',
          confidence: 0.9, evidence: [] as any[], counterEvidence: [] as any[],
          status: 'proposed' as const, domain: 'general', createdAt: Date.now(),
        },
      ]
      const ranked = engine.rankHypotheses(external)
      expect(ranked[0]!.id).toBe('high')
    })

    it('should not mutate the original internal list order', () => {
      const engine = new HypothesisEngine()
      engine.generateHypotheses('test observation', 'general')
      const before = engine.getAllHypotheses().map(h => h.id)
      engine.rankHypotheses()
      const after = engine.getAllHypotheses().map(h => h.id)
      expect(after).toEqual(before)
    })

    it('should consider evidence quality in ranking', () => {
      const engine = new HypothesisEngine({ enableBayesianUpdate: false })
      const hyps = engine.generateHypotheses('something to observe', 'general')
      // Give h1 many weak supporting evidence, give h2 one strong supporting evidence
      for (let i = 0; i < 5; i++) {
        engine.addEvidence(hyps[0]!.id, makeEvidence({ id: `w${i}`, strength: 0.1, supports: true }))
      }
      engine.addEvidence(hyps[1]!.id, makeEvidence({ id: 'strong', strength: 0.9, supports: true }))
      const ranked = engine.rankHypotheses()
      // h2 should rank higher due to higher evidence quality (0.9/(1+0) > 0.5/(5+0))
      expect(ranked[0]!.id).toBe(hyps[1]!.id)
    })
  })

  // ── getHypothesis ──────────────────────────────────────────────────────

  describe('getHypothesis()', () => {
    it('should return undefined for a nonexistent ID', () => {
      const engine = new HypothesisEngine()
      expect(engine.getHypothesis('nonexistent')).toBeUndefined()
    })

    it('should return the correct hypothesis by ID', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('observation', 'general')
      const retrieved = engine.getHypothesis(h!.id)
      expect(retrieved).toBeDefined()
      expect(retrieved!.id).toBe(h!.id)
      expect(retrieved!.statement).toBe(h!.statement)
    })

    it('should reflect evidence changes in the retrieved hypothesis', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('observation', 'general')
      engine.addEvidence(h!.id, makeEvidence())
      const retrieved = engine.getHypothesis(h!.id)!
      expect(retrieved.evidence).toHaveLength(1)
    })
  })

  // ── getAllHypotheses ────────────────────────────────────────────────────

  describe('getAllHypotheses()', () => {
    it('should return an empty array for a fresh engine', () => {
      const engine = new HypothesisEngine()
      expect(engine.getAllHypotheses()).toEqual([])
    })

    it('should return all generated hypotheses', () => {
      const engine = new HypothesisEngine()
      const h1 = engine.generateHypotheses('observation one', 'general')
      const h2 = engine.generateHypotheses('observation two', 'science')
      expect(engine.getAllHypotheses().length).toBe(h1.length + h2.length)
    })

    it('should return a new array (not the internal collection)', () => {
      const engine = new HypothesisEngine()
      engine.generateHypotheses('test', 'general')
      const all1 = engine.getAllHypotheses()
      const all2 = engine.getAllHypotheses()
      expect(all1).not.toBe(all2)
      expect(all1).toEqual(all2)
    })
  })

  // ── getStats ────────────────────────────────────────────────────────────

  describe('getStats()', () => {
    it('should return all zeros for a fresh engine', () => {
      const engine = new HypothesisEngine()
      expect(engine.getStats()).toEqual({ total: 0, supported: 0, refuted: 0, inconclusive: 0 })
    })

    it('should count total hypotheses correctly', () => {
      const engine = new HypothesisEngine()
      engine.generateHypotheses('observation', 'general')
      const stats = engine.getStats()
      expect(stats.total).toBeGreaterThanOrEqual(2)
    })

    it('should count proposed hypotheses only in total, not in other categories', () => {
      const engine = new HypothesisEngine()
      engine.generateHypotheses('observation', 'general')
      const stats = engine.getStats()
      expect(stats.supported).toBe(0)
      expect(stats.refuted).toBe(0)
      expect(stats.inconclusive).toBe(0)
      expect(stats.total).toBeGreaterThan(0)
    })

    it('should count supported hypotheses', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const [h] = engine.generateHypotheses('experiment result', 'science')
      addManyEvidences(engine, h!.id, 3, true, 0.9)
      engine.testHypothesis(h!.id)
      expect(engine.getStats().supported).toBe(1)
    })

    it('should count refuted hypotheses', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const [h] = engine.generateHypotheses('experiment result', 'science')
      addManyEvidences(engine, h!.id, 3, false, 0.9)
      engine.testHypothesis(h!.id)
      expect(engine.getStats().refuted).toBe(1)
    })

    it('should count inconclusive hypotheses', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 5 })
      const [h] = engine.generateHypotheses('observation', 'general')
      engine.addEvidence(h!.id, makeEvidence({ supports: true }))
      engine.testHypothesis(h!.id)
      expect(engine.getStats().inconclusive).toBe(1)
    })

    it('should track mixed statuses correctly', () => {
      const engine = new HypothesisEngine({ minEvidenceForConclusion: 1 })
      const hyps = engine.generateHypotheses('server latency memory cpu', 'technology')

      // Support the first
      addManyEvidences(engine, hyps[0]!.id, 3, true, 0.9)
      engine.testHypothesis(hyps[0]!.id)

      // Refute the second
      addManyEvidences(engine, hyps[1]!.id, 3, false, 0.9)
      engine.testHypothesis(hyps[1]!.id)

      const stats = engine.getStats()
      expect(stats.supported).toBe(1)
      expect(stats.refuted).toBe(1)
      expect(stats.total).toBe(hyps.length)
    })
  })

  // ── Edge Cases ──────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('should handle empty observation string', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('')
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle observation with special characters', () => {
      const engine = new HypothesisEngine()
      const results = engine.generateHypotheses('crash!!! @#$% data??? {curly} [brackets]')
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should evict oldest hypothesis when maxHypotheses is exceeded', () => {
      const engine = new HypothesisEngine({ maxHypotheses: 3 })
      const first = engine.generateHypotheses('first observation', 'general')
      const firstId = first[0]!.id
      // Generate more to exceed limit
      engine.generateHypotheses('second observation extra words added', 'general')
      // The first hypothesis should be evicted
      expect(engine.getHypothesis(firstId)).toBeUndefined()
      expect(engine.getAllHypotheses().length).toBeLessThanOrEqual(3)
    })

    it('should maintain maxHypotheses limit across multiple generations', () => {
      const engine = new HypothesisEngine({ maxHypotheses: 5 })
      engine.generateHypotheses('obs one extra words here', 'general')
      engine.generateHypotheses('obs two extra words here', 'general')
      engine.generateHypotheses('obs three extra words here', 'general')
      expect(engine.getAllHypotheses().length).toBeLessThanOrEqual(5)
    })

    it('should handle testing a hypothesis with no evidence', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('observation', 'general')
      const result = engine.testHypothesis(h!.id)
      expect(result.verdict).toBe('inconclusive')
      expect(result.confidence).toBe(0.5)
    })

    it('should handle hypothesis IDs as strings correctly', () => {
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('observation', 'general')
      expect(typeof h!.id).toBe('string')
      expect(h!.id.startsWith('hyp_')).toBe(true)
    })

    it('should generate unique IDs across multiple generation calls', () => {
      const engine = new HypothesisEngine()
      const h1 = engine.generateHypotheses('first', 'general')
      const h2 = engine.generateHypotheses('second', 'general')
      const allIds = [...h1, ...h2].map(h => h.id)
      expect(new Set(allIds).size).toBe(allIds.length)
    })

    it('should handle ranking a single hypothesis', () => {
      const engine = new HypothesisEngine()
      const external = [{
        id: 'solo', statement: 'only one',
        confidence: 0.7, evidence: [] as any[], counterEvidence: [] as any[],
        status: 'proposed' as const, domain: 'general', createdAt: Date.now(),
      }]
      const ranked = engine.rankHypotheses(external)
      expect(ranked).toHaveLength(1)
      expect(ranked[0]!.id).toBe('solo')
    })

    it('should find no contradictions with a single hypothesis', () => {
      const engine = new HypothesisEngine()
      const external = [{
        id: 'solo', statement: 'only one',
        confidence: 0.7, evidence: [] as any[], counterEvidence: [] as any[],
        status: 'proposed' as const, domain: 'general', createdAt: Date.now(),
      }]
      expect(engine.findContradictions(external)).toEqual([])
    })

    it('should set createdAt to a recent timestamp', () => {
      const before = Date.now()
      const engine = new HypothesisEngine()
      const [h] = engine.generateHypotheses('observation', 'general')
      const after = Date.now()
      expect(h!.createdAt).toBeGreaterThanOrEqual(before)
      expect(h!.createdAt).toBeLessThanOrEqual(after)
    })

    it('should handle findContradictions with shared evidence in reverse direction', () => {
      const engine = new HypothesisEngine()
      const sharedEvId = 'shared_reverse'
      const hypotheses = [
        {
          id: 'h1', statement: 'hypothesis one',
          confidence: 0.5,
          evidence: [] as any[],
          counterEvidence: [{ id: sharedEvId, description: 'ev', strength: 0.5, source: 'test', supports: false }],
          status: 'proposed' as const, domain: 'general', createdAt: Date.now(),
        },
        {
          id: 'h2', statement: 'hypothesis two',
          confidence: 0.5,
          evidence: [{ id: sharedEvId, description: 'ev', strength: 0.5, source: 'test', supports: true }],
          counterEvidence: [] as any[],
          status: 'proposed' as const, domain: 'general', createdAt: Date.now(),
        },
      ]
      const contradictions = engine.findContradictions(hypotheses)
      expect(contradictions.some(c => c.reason.includes(sharedEvId))).toBe(true)
    })

    it('should handle evaluateExplanation with identical observation and explanation', () => {
      const engine = new HypothesisEngine()
      const text = 'the server crashed due to a memory leak'
      const result = engine.evaluateExplanation(text, text)
      // Perfect keyword overlap → high relevance
      expect(result.plausibility).toBeGreaterThan(0)
    })
  })
})
