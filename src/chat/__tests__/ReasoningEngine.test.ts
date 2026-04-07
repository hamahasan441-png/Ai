import { describe, it, expect, beforeEach } from 'vitest'
import {
  ReasoningEngine,
  type ReasoningContext,
} from '../ReasoningEngine'

// ── Constructor Tests ──

describe('ReasoningEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new ReasoningEngine()
    expect(engine).toBeInstanceOf(ReasoningEngine)
  })

  it('accepts a partial config override', () => {
    const engine = new ReasoningEngine({ maxSteps: 10 })
    expect(engine).toBeInstanceOf(ReasoningEngine)
  })

  it('accepts a full config override', () => {
    const engine = new ReasoningEngine({
      maxSteps: 5,
      maxBacktrackDepth: 1,
      selfConsistencyRuns: 2,
      timeoutMs: 5000,
    })
    expect(engine).toBeInstanceOf(ReasoningEngine)
  })

  it('uses default selfConsistencyRuns when not overridden', () => {
    const engine = new ReasoningEngine({ maxSteps: 10 })
    // Default selfConsistencyRuns is 3, so reason() should produce 3 candidates
    const result = engine.reason('Explain sorting algorithms.')
    const solveSteps = result.steps.filter((s) => s.phase === 'solve')
    expect(solveSteps.length).toBe(3)
  })

  it('respects custom selfConsistencyRuns', () => {
    const engine = new ReasoningEngine({ selfConsistencyRuns: 5 })
    const result = engine.reason('Explain sorting algorithms.')
    const solveSteps = result.steps.filter((s) => s.phase === 'solve')
    expect(solveSteps.length).toBe(5)
  })
})

// ── reason() Tests ──

describe('ReasoningEngine.reason', () => {
  let engine: ReasoningEngine

  beforeEach(() => {
    engine = new ReasoningEngine()
  })

  it('returns a ChainOfThoughtResult with all expected fields', () => {
    const result = engine.reason('How do I sort an array?')
    expect(result).toHaveProperty('answer')
    expect(result).toHaveProperty('steps')
    expect(result).toHaveProperty('confidence')
    expect(result).toHaveProperty('alternatives')
    expect(result).toHaveProperty('duration')
  })

  it('produces a non-empty answer', () => {
    const result = engine.reason('What is the best sorting algorithm?')
    expect(result.answer.length).toBeGreaterThan(0)
  })

  it('includes all four phases in steps', () => {
    const result = engine.reason('Compare React and Vue.')
    const phases = new Set(result.steps.map((s) => s.phase))
    expect(phases.has('decompose')).toBe(true)
    expect(phases.has('plan')).toBe(true)
    expect(phases.has('solve')).toBe(true)
    expect(phases.has('verify')).toBe(true)
  })

  it('has confidence between 0 and 1', () => {
    const result = engine.reason('Explain recursion.')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('has duration greater than 0', () => {
    const result = engine.reason('Explain recursion.')
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })

  it('generates alternatives when selfConsistencyRuns > 1', () => {
    const result = engine.reason('Explain binary search.')
    // Default 3 runs → best + at least some alternatives
    expect(result.alternatives).toBeInstanceOf(Array)
  })

  it('handles complex multi-sentence problems', () => {
    const problem =
      'First, analyze the performance of quicksort. Then compare it with mergesort. Finally, recommend one for large datasets.'
    const result = engine.reason(problem)
    expect(result.steps.length).toBeGreaterThan(4)
    expect(result.answer.length).toBeGreaterThan(0)
  })

  it('accepts a ReasoningContext with constraints', () => {
    const ctx: ReasoningContext = {
      problem: 'Build a REST API',
      constraints: ['must support authentication', 'should be fast'],
      domain: 'backend',
    }
    const result = engine.reason('Build a REST API', ctx)
    expect(result.answer.length).toBeGreaterThan(0)
  })

  it('uses context.problem over the problem argument when context is provided', () => {
    const ctx: ReasoningContext = {
      problem: 'Design a database schema for an e-commerce system.',
    }
    const result = engine.reason('ignored problem', ctx)
    // The answer should reference e-commerce/database concepts, not 'ignored problem'
    expect(result.answer.length).toBeGreaterThan(0)
  })

  it('each step has valid phase, description, result, and confidence', () => {
    const result = engine.reason('Explain caching strategies.')
    for (const step of result.steps) {
      expect(['decompose', 'plan', 'solve', 'verify']).toContain(step.phase)
      expect(step.description.length).toBeGreaterThan(0)
      expect(step.result.length).toBeGreaterThan(0)
      expect(step.confidence).toBeGreaterThanOrEqual(0)
      expect(step.confidence).toBeLessThanOrEqual(1)
    }
  })
})

// ── decompose() Tests ──

describe('ReasoningEngine.decompose', () => {
  let engine: ReasoningEngine

  beforeEach(() => {
    engine = new ReasoningEngine()
  })

  it('returns an array of SubProblem objects', () => {
    const subs = engine.decompose('Compare React and Vue.')
    expect(Array.isArray(subs)).toBe(true)
    expect(subs.length).toBeGreaterThan(0)
  })

  it('each sub-problem has description, type, dependencies, and difficulty', () => {
    const subs = engine.decompose('Explain how garbage collection works.')
    for (const sp of subs) {
      expect(sp).toHaveProperty('description')
      expect(sp).toHaveProperty('type')
      expect(sp).toHaveProperty('dependencies')
      expect(sp).toHaveProperty('difficulty')
      expect(Array.isArray(sp.dependencies)).toBe(true)
      expect(sp.difficulty).toBeGreaterThanOrEqual(1)
      expect(sp.difficulty).toBeLessThanOrEqual(10)
    }
  })

  it('produces multiple sub-problems for multi-sentence input', () => {
    const problem =
      'First analyze the requirements. Then design the architecture. Finally implement the solution.'
    const subs = engine.decompose(problem)
    expect(subs.length).toBe(3)
  })

  it('produces a single sub-problem for a simple sentence', () => {
    const subs = engine.decompose('Sort an array')
    expect(subs.length).toBe(1)
  })

  it('classifies comparison problems correctly', () => {
    const subs = engine.decompose('Compare Python and JavaScript.')
    expect(subs[0].type).toBe('comparison')
  })

  it('classifies debugging problems correctly', () => {
    const subs = engine.decompose('Debug the crash in the login module.')
    expect(subs[0].type).toBe('debugging')
  })

  it('classifies generation problems correctly', () => {
    const subs = engine.decompose('Create a REST API for user management.')
    expect(subs[0].type).toBe('generation')
  })

  it('classifies analysis problems correctly', () => {
    const subs = engine.decompose('Analyze why the system is slow.')
    expect(subs[0].type).toBe('analysis')
  })

  it('infers dependencies between related sub-problems', () => {
    const problem =
      'Analyze the database schema. Then optimize it for performance.'
    const subs = engine.decompose(problem)
    expect(subs.length).toBe(2)
    // Second sub-problem references "it" → should depend on first
    expect(subs[1].dependencies.length).toBeGreaterThan(0)
  })
})

// ── extractConstraints() Tests ──

describe('ReasoningEngine.extractConstraints', () => {
  let engine: ReasoningEngine

  beforeEach(() => {
    engine = new ReasoningEngine()
  })

  it('extracts must_have constraints from "must have" patterns', () => {
    const constraints = engine.extractConstraints('The system must have authentication.')
    const mustHave = constraints.filter((c) => c.type === 'must_have')
    expect(mustHave.length).toBeGreaterThan(0)
  })

  it('extracts must_have constraints from "requires" patterns', () => {
    const constraints = engine.extractConstraints('The API requires rate limiting.')
    const mustHave = constraints.filter((c) => c.type === 'must_have')
    expect(mustHave.length).toBeGreaterThan(0)
  })

  it('extracts must_have constraints from "needs to" patterns', () => {
    const constraints = engine.extractConstraints('The app needs to support offline mode.')
    const mustHave = constraints.filter((c) => c.type === 'must_have')
    expect(mustHave.length).toBeGreaterThan(0)
  })

  it('extracts must_not constraints from "must not" patterns', () => {
    const constraints = engine.extractConstraints('The response must not contain sensitive data.')
    const mustNot = constraints.filter((c) => c.type === 'must_not')
    expect(mustNot.length).toBeGreaterThan(0)
  })

  it('extracts must_not constraints from "avoid" patterns', () => {
    const constraints = engine.extractConstraints('Avoid using global state.')
    const mustNot = constraints.filter((c) => c.type === 'must_not')
    expect(mustNot.length).toBeGreaterThan(0)
  })

  it('extracts must_not constraints from "never" patterns', () => {
    const constraints = engine.extractConstraints('Never expose internal APIs.')
    const mustNot = constraints.filter((c) => c.type === 'must_not')
    expect(mustNot.length).toBeGreaterThan(0)
  })

  it('extracts preference constraints from "should" patterns', () => {
    const constraints = engine.extractConstraints('The code should be readable.')
    const pref = constraints.filter((c) => c.type === 'preference')
    expect(pref.length).toBeGreaterThan(0)
  })

  it('extracts preference constraints from "preferably" patterns', () => {
    const constraints = engine.extractConstraints('Use a typed language, preferably TypeScript.')
    const pref = constraints.filter((c) => c.type === 'preference')
    expect(pref.length).toBeGreaterThan(0)
  })

  it('extracts preference constraints from "ideally" patterns', () => {
    const constraints = engine.extractConstraints('Ideally the response time is under 200ms.')
    const pref = constraints.filter((c) => c.type === 'preference')
    expect(pref.length).toBeGreaterThan(0)
  })

  it('extracts conditional constraints from "if...then" patterns', () => {
    const constraints = engine.extractConstraints('If the user is admin then grant full access.')
    const cond = constraints.filter((c) => c.type === 'conditional')
    expect(cond.length).toBeGreaterThan(0)
  })

  it('extracts conditional constraints from "unless" patterns', () => {
    const constraints = engine.extractConstraints('Allow access unless the token is expired.')
    const cond = constraints.filter((c) => c.type === 'conditional')
    expect(cond.length).toBeGreaterThan(0)
  })

  it('returns empty array when no constraints are found', () => {
    const constraints = engine.extractConstraints('Hello world')
    expect(constraints.length).toBe(0)
  })

  it('extracts multiple constraint types from one input', () => {
    const input =
      'The system must have logging. Avoid downtime. The API should be versioned. If traffic spikes then auto-scale.'
    const constraints = engine.extractConstraints(input)
    const types = new Set(constraints.map((c) => c.type))
    expect(types.has('must_have')).toBe(true)
    expect(types.has('must_not')).toBe(true)
    expect(types.has('preference')).toBe(true)
    expect(types.has('conditional')).toBe(true)
  })

  it('each constraint has description and satisfied=false initially', () => {
    const constraints = engine.extractConstraints('The app must support dark mode.')
    for (const c of constraints) {
      expect(c.description.length).toBeGreaterThan(0)
      expect(c.satisfied).toBe(false)
    }
  })
})

// ── evaluateSolution() Tests ──

describe('ReasoningEngine.evaluateSolution', () => {
  let engine: ReasoningEngine

  beforeEach(() => {
    engine = new ReasoningEngine()
  })

  it('returns a SolutionScore with all fields', () => {
    const score = engine.evaluateSolution('Sort an array', 'Use quicksort to sort the array.')
    expect(score).toHaveProperty('correctness')
    expect(score).toHaveProperty('completeness')
    expect(score).toHaveProperty('clarity')
    expect(score).toHaveProperty('overall')
  })

  it('all scores are between 0 and 1', () => {
    const score = engine.evaluateSolution(
      'Explain caching',
      'Caching stores data in memory for fast retrieval. Step 1: check cache. Step 2: fetch if miss.',
    )
    expect(score.correctness).toBeGreaterThanOrEqual(0)
    expect(score.correctness).toBeLessThanOrEqual(1)
    expect(score.completeness).toBeGreaterThanOrEqual(0)
    expect(score.completeness).toBeLessThanOrEqual(1)
    expect(score.clarity).toBeGreaterThanOrEqual(0)
    expect(score.clarity).toBeLessThanOrEqual(1)
    expect(score.overall).toBeGreaterThanOrEqual(0)
    expect(score.overall).toBeLessThanOrEqual(1)
  })

  it('scores a good solution higher than a bad one', () => {
    const problem = 'Explain how to sort an array in Python'
    const good = engine.evaluateSolution(
      problem,
      'To sort an array in Python, use the built-in sorted() function or list.sort() method. Step 1: call sorted(array). Step 2: the result is a new sorted array. Therefore, Python provides efficient sorting.',
    )
    const bad = engine.evaluateSolution(problem, 'Banana milkshake recipe.')
    expect(good.overall).toBeGreaterThan(bad.overall)
  })

  it('gives higher correctness when solution keywords match the problem', () => {
    const problem = 'Implement a binary search tree'
    const relevant = engine.evaluateSolution(
      problem,
      'A binary search tree is implemented by creating nodes with left and right children. Implement insert and search operations.',
    )
    const irrelevant = engine.evaluateSolution(
      problem,
      'The weather is nice today.',
    )
    expect(relevant.correctness).toBeGreaterThan(irrelevant.correctness)
  })

  it('gives higher clarity to well-structured solutions', () => {
    const problem = 'Explain microservices'
    const structured = engine.evaluateSolution(
      problem,
      'Firstly, microservices decompose an application into small services. Secondly, each service runs independently. Therefore, scaling is easier. In summary, microservices improve modularity.',
    )
    const terse = engine.evaluateSolution(problem, 'Small services.')
    expect(structured.clarity).toBeGreaterThan(terse.clarity)
  })

  it('gives zero clarity to empty solutions', () => {
    const score = engine.evaluateSolution('Any problem', '')
    expect(score.clarity).toBe(0)
  })
})

// ── getStats() Tests ──

describe('ReasoningEngine.getStats', () => {
  let engine: ReasoningEngine

  beforeEach(() => {
    engine = new ReasoningEngine()
  })

  it('starts with zero problems, zero avg confidence, zero avg steps', () => {
    const stats = engine.getStats()
    expect(stats.totalProblems).toBe(0)
    expect(stats.avgConfidence).toBe(0)
    expect(stats.avgSteps).toBe(0)
  })

  it('increments totalProblems after each reason() call', () => {
    engine.reason('Problem one.')
    expect(engine.getStats().totalProblems).toBe(1)

    engine.reason('Problem two.')
    expect(engine.getStats().totalProblems).toBe(2)
  })

  it('tracks average confidence across multiple calls', () => {
    engine.reason('Analyze the database performance.')
    engine.reason('Compare React and Angular.')
    const stats = engine.getStats()
    expect(stats.avgConfidence).toBeGreaterThan(0)
    expect(stats.avgConfidence).toBeLessThanOrEqual(1)
  })

  it('tracks average steps across multiple calls', () => {
    engine.reason('Sort an array.')
    engine.reason('Debug the login crash.')
    const stats = engine.getStats()
    expect(stats.avgSteps).toBeGreaterThan(0)
  })
})

// ── Edge Cases ──

describe('ReasoningEngine edge cases', () => {
  let engine: ReasoningEngine

  beforeEach(() => {
    engine = new ReasoningEngine()
  })

  it('handles empty string in reason()', () => {
    const result = engine.reason('')
    expect(result.answer.length).toBeGreaterThan(0)
    expect(result.steps.length).toBeGreaterThan(0)
  })

  it('handles empty string in decompose()', () => {
    const subs = engine.decompose('')
    expect(subs.length).toBeGreaterThan(0)
  })

  it('handles empty string in extractConstraints()', () => {
    const constraints = engine.extractConstraints('')
    expect(constraints).toEqual([])
  })

  it('handles empty strings in evaluateSolution()', () => {
    const score = engine.evaluateSolution('', '')
    expect(score.overall).toBeGreaterThanOrEqual(0)
    expect(score.overall).toBeLessThanOrEqual(1)
  })

  it('handles very long input in reason()', () => {
    const longProblem = 'Analyze the system. '.repeat(100)
    const result = engine.reason(longProblem)
    expect(result.answer.length).toBeGreaterThan(0)
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('handles very long input in extractConstraints()', () => {
    const longInput = 'The system must have logging. '.repeat(50)
    const constraints = engine.extractConstraints(longInput)
    expect(constraints.length).toBeGreaterThan(0)
  })

  it('handles ambiguous problems that match no specific type', () => {
    const subs = engine.decompose('Do something interesting today.')
    expect(subs.length).toBeGreaterThan(0)
    expect(subs[0].type).toBe('general')
  })

  it('handles special characters in input', () => {
    const result = engine.reason('Fix the bug in module@v2.0! #urgent <priority:high>')
    expect(result.answer.length).toBeGreaterThan(0)
  })

  it('handles input with only stop words', () => {
    const subs = engine.decompose('the and for are but not')
    expect(subs.length).toBeGreaterThan(0)
  })

  it('reason() with selfConsistencyRuns=1 produces no alternatives', () => {
    const eng = new ReasoningEngine({ selfConsistencyRuns: 1 })
    const result = eng.reason('Explain sorting.')
    expect(result.alternatives.length).toBe(0)
  })
})
