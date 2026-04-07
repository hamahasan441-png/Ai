import { describe, it, expect, beforeEach } from 'vitest'
import {
  InferenceEngine,
} from '../InferenceEngine'

// ── Constructor Tests ──

describe('InferenceEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new InferenceEngine()
    expect(engine).toBeInstanceOf(InferenceEngine)
  })

  it('accepts a partial custom config', () => {
    const engine = new InferenceEngine({ maxRules: 100 })
    expect(engine).toBeInstanceOf(InferenceEngine)
  })

  it('accepts a full custom config', () => {
    const engine = new InferenceEngine({
      maxRules: 100,
      maxFacts: 200,
      enableForwardChaining: true,
      enableBackwardChaining: false,
      enableTruthTables: true,
      maxInferenceDepth: 10,
      conflictResolution: 'recency',
    })
    expect(engine).toBeInstanceOf(InferenceEngine)
  })

  it('loads built-in rules on construction', () => {
    const engine = new InferenceEngine()
    const rules = engine.getAllRules()
    expect(rules.length).toBeGreaterThan(0)
  })
})

// ── Fact Management Tests ──

describe('InferenceEngine fact management', () => {
  let engine: InferenceEngine

  beforeEach(() => {
    engine = new InferenceEngine()
  })

  it('addFact creates a new proposition with correct fields', () => {
    const fact = engine.addFact('is_raining', true)
    expect(fact.name).toBe('is_raining')
    expect(fact.value).toBe(true)
    expect(fact.confidence).toBe(1)
    expect(fact.source).toBe('fact')
    expect(typeof fact.id).toBe('string')
  })

  it('addFact accepts a custom confidence', () => {
    const fact = engine.addFact('maybe_sunny', true, 0.6)
    expect(fact.confidence).toBe(0.6)
  })

  it('addFact clamps confidence to [0, 1]', () => {
    const over = engine.addFact('over', true, 5)
    expect(over.confidence).toBeLessThanOrEqual(1)

    const under = engine.addFact('under', false, -2)
    expect(under.confidence).toBeGreaterThanOrEqual(0)
  })

  it('addFact updates an existing proposition when name already exists', () => {
    const _first = engine.addFact('uses_async', false, 0.5)
    const second = engine.addFact('uses_async', true, 0.9)
    expect(second.value).toBe(true)
    expect(second.confidence).toBe(0.9)
    // The id should still resolve via findFact
    const found = engine.findFact('uses_async')
    expect(found).not.toBeNull()
    expect(found!.value).toBe(true)
  })

  it('getFact returns the proposition by id', () => {
    const added = engine.addFact('x', true)
    const fetched = engine.getFact(added.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.name).toBe('x')
    expect(fetched!.value).toBe(true)
  })

  it('getFact returns null for an unknown id', () => {
    expect(engine.getFact('nonexistent-id')).toBeNull()
  })

  it('findFact returns the proposition by name', () => {
    engine.addFact('ground_wet', true)
    const found = engine.findFact('ground_wet')
    expect(found).not.toBeNull()
    expect(found!.name).toBe('ground_wet')
  })

  it('findFact returns null for an unknown name', () => {
    expect(engine.findFact('unknown_name')).toBeNull()
  })

  it('removeFact deletes a proposition and returns true', () => {
    const fact = engine.addFact('temp_fact', true)
    expect(engine.removeFact(fact.id)).toBe(true)
    expect(engine.getFact(fact.id)).toBeNull()
    expect(engine.findFact('temp_fact')).toBeNull()
  })

  it('removeFact returns false for an unknown id', () => {
    expect(engine.removeFact('bogus-id')).toBe(false)
  })

  it('getAllFacts returns all propositions including built-in assumptions', () => {
    const facts = engine.getAllFacts()
    expect(facts.length).toBeGreaterThan(0)
    // Built-in rules create assumption propositions
    const assumptions = facts.filter((f) => f.source === 'assumption')
    expect(assumptions.length).toBeGreaterThan(0)
  })
})

// ── Rule Management Tests ──

describe('InferenceEngine rule management', () => {
  let engine: InferenceEngine

  beforeEach(() => {
    engine = new InferenceEngine()
  })

  it('addRule creates a rule linking existing propositions', () => {
    const a = engine.addFact('condA', true)
    const b = engine.addFact('resultB', false)
    const rule = engine.addRule({
      name: 'test_rule',
      conditions: [{ propositionId: a.id, expectedValue: true }],
      conclusion: { propId: b.id, value: true },
      priority: 5,
      confidence: 0.8,
      metadata: {},
    })
    expect(rule.id).toBeDefined()
    expect(rule.name).toBe('test_rule')
  })

  it('addRule throws when referencing an unknown condition proposition', () => {
    const b = engine.addFact('resultB', false)
    expect(() =>
      engine.addRule({
        name: 'bad_rule',
        conditions: [{ propositionId: 'no-such-id', expectedValue: true }],
        conclusion: { propId: b.id, value: true },
        priority: 1,
        confidence: 1,
        metadata: {},
      }),
    ).toThrow('Unknown proposition')
  })

  it('getRule returns the rule by id', () => {
    const a = engine.addFact('p1', true)
    const b = engine.addFact('p2', false)
    const added = engine.addRule({
      name: 'r1',
      conditions: [{ propositionId: a.id, expectedValue: true }],
      conclusion: { propId: b.id, value: true },
      priority: 3,
      confidence: 0.9,
      metadata: {},
    })
    const fetched = engine.getRule(added.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.name).toBe('r1')
  })

  it('getRule returns null for an unknown id', () => {
    expect(engine.getRule('nonexistent')).toBeNull()
  })

  it('removeRule deletes the rule and returns true', () => {
    const a = engine.addFact('pA', true)
    const b = engine.addFact('pB', false)
    const rule = engine.addRule({
      name: 'removable',
      conditions: [{ propositionId: a.id, expectedValue: true }],
      conclusion: { propId: b.id, value: true },
      priority: 1,
      confidence: 1,
      metadata: {},
    })
    expect(engine.removeRule(rule.id)).toBe(true)
    expect(engine.getRule(rule.id)).toBeNull()
  })

  it('getAllRules includes built-in and user-added rules', () => {
    const builtinCount = engine.getAllRules().length
    const a = engine.addFact('custom_cond', true)
    const b = engine.addFact('custom_conc', false)
    engine.addRule({
      name: 'user_rule',
      conditions: [{ propositionId: a.id, expectedValue: true }],
      conclusion: { propId: b.id, value: true },
      priority: 1,
      confidence: 1,
      metadata: {},
    })
    expect(engine.getAllRules().length).toBe(builtinCount + 1)
  })
})

// ── Forward Chaining Tests ──

describe('InferenceEngine forwardChain', () => {
  it('derives conclusions when conditions are satisfied', () => {
    const engine = new InferenceEngine()
    engine.addFact('uses_deprecated_api', true)
    const steps = engine.forwardChain()
    expect(steps.length).toBeGreaterThan(0)

    const derivedProp = engine.findFact('needs_api_upgrade')
    expect(derivedProp).not.toBeNull()
    expect(derivedProp!.value).toBe(true)
    expect(derivedProp!.source).toBe('inference')
  })

  it('returns empty array when forward chaining is disabled', () => {
    const engine = new InferenceEngine({ enableForwardChaining: false })
    engine.addFact('uses_deprecated_api', true)
    const steps = engine.forwardChain()
    expect(steps).toEqual([])
  })

  it('each step has ruleId, inputFacts, outputFact, confidence, and timestamp', () => {
    const engine = new InferenceEngine()
    engine.addFact('has_hardcoded_secrets', true)
    const steps = engine.forwardChain()
    for (const step of steps) {
      expect(typeof step.ruleId).toBe('string')
      expect(Array.isArray(step.inputFacts)).toBe(true)
      expect(typeof step.outputFact).toBe('string')
      expect(typeof step.confidence).toBe('number')
      expect(typeof step.timestamp).toBe('number')
    }
  })
})

// ── Backward Chaining Tests ──

describe('InferenceEngine backwardChain', () => {
  it('returns null when backward chaining is disabled', () => {
    const engine = new InferenceEngine({ enableBackwardChaining: false })
    const prop = engine.addFact('some_goal', false)
    expect(engine.backwardChain(prop.id)).toBeNull()
  })

  it('returns a trivial chain for a known fact', () => {
    const engine = new InferenceEngine()
    const fact = engine.addFact('known_thing', true, 0.9)
    const chain = engine.backwardChain(fact.id)
    expect(chain).not.toBeNull()
    expect(chain!.steps).toHaveLength(0)
    expect(chain!.totalConfidence).toBe(0.9)
  })

  it('returns null for an unknown proposition id', () => {
    const engine = new InferenceEngine()
    expect(engine.backwardChain('nonexistent')).toBeNull()
  })
})

// ── Query Tests ──

describe('InferenceEngine query', () => {
  let engine: InferenceEngine

  beforeEach(() => {
    engine = new InferenceEngine()
  })

  it('returns answerable=false for a completely unknown proposition name', () => {
    const result = engine.query('never_heard_of_this')
    expect(result.answerable).toBe(false)
    expect(result.value).toBeNull()
    expect(result.confidence).toBe(0)
  })

  it('returns the value of a directly asserted fact', () => {
    engine.addFact('sky_is_blue', true, 0.99)
    const result = engine.query('sky_is_blue')
    expect(result.answerable).toBe(true)
    expect(result.value).toBe(true)
    expect(result.confidence).toBe(0.99)
  })

  it('can infer a value through forward chaining during query', () => {
    engine.addFact('uses_deprecated_api', true)
    const result = engine.query('needs_api_upgrade')
    expect(result.answerable).toBe(true)
    expect(result.value).toBe(true)
  })

  it('result includes the proposition name', () => {
    engine.addFact('test_prop', true)
    const result = engine.query('test_prop')
    expect(result.proposition).toBe('test_prop')
  })
})

// ── Truth Table Tests ──

describe('InferenceEngine generateTruthTable', () => {
  it('generates a truth table with 2^n rows', () => {
    const engine = new InferenceEngine()
    engine.addFact('a', true)
    engine.addFact('b', false)
    const table = engine.generateTruthTable(['a', 'b'])
    expect(table.variables).toEqual(['a', 'b'])
    expect(table.rows).toHaveLength(4)
  })

  it('returns empty rows when truth tables are disabled', () => {
    const engine = new InferenceEngine({ enableTruthTables: false })
    engine.addFact('x', true)
    const table = engine.generateTruthTable(['x'])
    expect(table.rows).toHaveLength(0)
  })

  it('returns empty rows when a proposition name is unknown', () => {
    const engine = new InferenceEngine()
    const table = engine.generateTruthTable(['unknown_var'])
    expect(table.rows).toHaveLength(0)
    expect(table.satisfiable).toBe(false)
  })

  it('each row contains assignments and a boolean result', () => {
    const engine = new InferenceEngine()
    engine.addFact('p', true)
    const table = engine.generateTruthTable(['p'])
    for (const row of table.rows) {
      expect(typeof row.assignments).toBe('object')
      expect(typeof row.result).toBe('boolean')
    }
  })

  it('reports tautology, contradiction, and satisfiable flags', () => {
    const engine = new InferenceEngine()
    engine.addFact('v', true)
    const table = engine.generateTruthTable(['v'])
    expect(typeof table.tautology).toBe('boolean')
    expect(typeof table.contradiction).toBe('boolean')
    expect(typeof table.satisfiable).toBe('boolean')
  })
})

// ── Expression Evaluation Tests ──

describe('InferenceEngine evaluateExpression', () => {
  let engine: InferenceEngine

  beforeEach(() => {
    engine = new InferenceEngine()
    engine.addFact('a', true)
    engine.addFact('b', false)
  })

  it('evaluates a simple identifier', () => {
    expect(engine.evaluateExpression('a')).toBe(true)
    expect(engine.evaluateExpression('b')).toBe(false)
  })

  it('evaluates AND expressions', () => {
    expect(engine.evaluateExpression('a AND b')).toBe(false)
  })

  it('evaluates OR expressions', () => {
    expect(engine.evaluateExpression('a OR b')).toBe(true)
  })

  it('evaluates NOT expressions', () => {
    expect(engine.evaluateExpression('NOT b')).toBe(true)
  })

  it('returns null for an unknown identifier', () => {
    expect(engine.evaluateExpression('unknown_prop')).toBeNull()
  })

  it('returns null for an empty expression', () => {
    expect(engine.evaluateExpression('')).toBeNull()
  })
})

// ── Conflict Detection & Resolution Tests ──

describe('InferenceEngine conflicts', () => {
  it('getConflicts returns an empty array initially', () => {
    const engine = new InferenceEngine()
    expect(engine.getConflicts()).toEqual([])
  })

  it('resolveConflicts returns an empty array when there are no conflicts', () => {
    const engine = new InferenceEngine()
    expect(engine.resolveConflicts()).toEqual([])
  })
})

// ── Explain Tests ──

describe('InferenceEngine explain', () => {
  let engine: InferenceEngine

  beforeEach(() => {
    engine = new InferenceEngine()
  })

  it('explains a directly asserted fact', () => {
    const fact = engine.addFact('sky_is_blue', true, 0.95)
    const explanation = engine.explain(fact.id)
    expect(explanation).toContain('sky_is_blue')
    expect(explanation).toContain('TRUE')
    expect(explanation).toContain('fact')
  })

  it('returns unknown message for a nonexistent proposition', () => {
    const explanation = engine.explain('no-such-id')
    expect(explanation).toContain('unknown')
  })

  it('explains an unresolved assumption', () => {
    // Built-in rules create assumption props with null value
    const allFacts = engine.getAllFacts()
    const assumption = allFacts.find((f) => f.source === 'assumption' && f.value === null)
    expect(assumption).toBeDefined()
    const explanation = engine.explain(assumption!.id)
    expect(explanation).toContain('unresolved assumption')
  })
})

// ── Learn Rule Tests ──

describe('InferenceEngine learnRule', () => {
  it('adds a rule and increments feedbackCount', () => {
    const engine = new InferenceEngine()
    const a = engine.addFact('cond_learn', true)
    const b = engine.addFact('conc_learn', false)
    const statsBefore = engine.getStats()
    const rule = engine.learnRule({
      name: 'learned_rule',
      conditions: [{ propositionId: a.id, expectedValue: true }],
      conclusion: { propId: b.id, value: true },
      priority: 5,
      confidence: 0.75,
      metadata: { origin: 'learning' },
    })
    expect(rule.id).toBeDefined()
    expect(rule.name).toBe('learned_rule')
    const statsAfter = engine.getStats()
    expect(statsAfter.feedbackCount).toBe(statsBefore.feedbackCount + 1)
  })
})

// ── Stats Tests ──

describe('InferenceEngine getStats', () => {
  it('returns stats with all expected fields', () => {
    const engine = new InferenceEngine()
    const stats = engine.getStats()
    expect(typeof stats.totalInferences).toBe('number')
    expect(typeof stats.totalRulesApplied).toBe('number')
    expect(typeof stats.totalFactsAdded).toBe('number')
    expect(typeof stats.totalConflictsResolved).toBe('number')
    expect(typeof stats.totalQueriesAnswered).toBe('number')
    expect(typeof stats.avgInferenceTime).toBe('number')
    expect(typeof stats.feedbackCount).toBe('number')
  })

  it('increments totalFactsAdded after adding facts', () => {
    const engine = new InferenceEngine()
    const before = engine.getStats().totalFactsAdded
    engine.addFact('new_fact_1', true)
    engine.addFact('new_fact_2', false)
    expect(engine.getStats().totalFactsAdded).toBe(before + 2)
  })

  it('increments totalQueriesAnswered after queries', () => {
    const engine = new InferenceEngine()
    engine.addFact('q_test', true)
    engine.query('q_test')
    engine.query('q_test')
    expect(engine.getStats().totalQueriesAnswered).toBe(2)
  })
})

// ── Serialization Tests ──

describe('InferenceEngine serialize / deserialize', () => {
  it('serialize returns a valid JSON string', () => {
    const engine = new InferenceEngine()
    const json = engine.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('deserialize restores an equivalent engine', () => {
    const engine = new InferenceEngine()
    engine.addFact('serialize_test', true, 0.88)
    engine.query('serialize_test')

    const json = engine.serialize()
    const restored = InferenceEngine.deserialize(json)

    expect(restored).toBeInstanceOf(InferenceEngine)
    const fact = restored.findFact('serialize_test')
    expect(fact).not.toBeNull()
    expect(fact!.value).toBe(true)
    expect(fact!.confidence).toBe(0.88)
  })

  it('deserialize preserves stats counters', () => {
    const engine = new InferenceEngine()
    engine.addFact('stat_fact', true)
    engine.query('stat_fact')
    const originalStats = engine.getStats()

    const restored = InferenceEngine.deserialize(engine.serialize())
    const restoredStats = restored.getStats()

    expect(restoredStats.totalFactsAdded).toBe(originalStats.totalFactsAdded)
    expect(restoredStats.totalQueriesAnswered).toBe(originalStats.totalQueriesAnswered)
  })
})
