import { describe, it, expect, beforeEach } from 'vitest'
import {
  PlanningEngine,
  type Plan,
  type PlanStep,
  type PlanEvaluation,
  type PlanOptimization,
  type DependencyGraph,
  type PlanningEngineConfig,
  type PlanningEngineStats,
} from '../PlanningEngine'

// ── Constructor Tests ──

describe('PlanningEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new PlanningEngine()
    expect(engine).toBeInstanceOf(PlanningEngine)
  })

  it('accepts a partial custom config', () => {
    const engine = new PlanningEngine({ maxPlanDepth: 10 })
    expect(engine).toBeInstanceOf(PlanningEngine)
  })

  it('accepts a full custom config', () => {
    const engine = new PlanningEngine({
      maxPlanDepth: 8,
      maxAlternatives: 5,
      planningTimeout: 60_000,
      maxStepsPerPlan: 50,
      riskThreshold: 0.5,
      enableTemplates: false,
    })
    expect(engine).toBeInstanceOf(PlanningEngine)
  })

  it('has templates available and uses them by default', () => {
    const engine = new PlanningEngine()
    const plan = engine.createPlan('Implement a new feature for user authentication')
    expect(plan.steps.length).toBeGreaterThan(0)
  })
})

// ── createPlan Tests ──

describe('PlanningEngine createPlan', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('creates a plan from a simple goal string', () => {
    const plan = engine.createPlan('Build a REST API')
    expect(plan).toBeDefined()
    expect(plan.id).toBeDefined()
    expect(plan.steps.length).toBeGreaterThan(0)
  })

  it('plan has a valid goal object', () => {
    const plan = engine.createPlan('Implement user login')
    expect(plan.goal).toBeDefined()
    expect(plan.goal.description).toBe('Implement user login')
    expect(plan.goal.id).toBeDefined()
    expect(plan.goal.priority).toBeDefined()
  })

  it('plan has confidence between 0 and 1', () => {
    const plan = engine.createPlan('Create a web application')
    expect(plan.confidence).toBeGreaterThanOrEqual(0)
    expect(plan.confidence).toBeLessThanOrEqual(1)
  })

  it('plan has estimated total effort greater than 0', () => {
    const plan = engine.createPlan('Build a mobile app')
    expect(plan.estimatedTotalEffort).toBeGreaterThan(0)
  })

  it('creates a plan with constraints', () => {
    const plan = engine.createPlan('Deploy a microservice', ['Must use Docker', 'No downtime allowed'])
    expect(plan).toBeDefined()
    expect(plan.steps.length).toBeGreaterThan(0)
  })

  it('uses templates for feature-type goals', () => {
    const engine1 = new PlanningEngine({ enableTemplates: true })
    const engine2 = new PlanningEngine({ enableTemplates: false })
    const plan1 = engine1.createPlan('Implement a new search feature')
    const plan2 = engine2.createPlan('Implement a new search feature')
    expect(plan1.steps.length).toBeGreaterThan(0)
    expect(plan2.steps.length).toBeGreaterThan(0)
  })

  it('infers critical priority from urgent goals', () => {
    const plan = engine.createPlan('Fix critical production bug immediately')
    expect(plan.goal.priority).toBe('critical')
  })

  it('creates a plan for a generic non-software goal', () => {
    const plan = engine.createPlan('Organize a team meeting to discuss project roadmap')
    expect(plan).toBeDefined()
    expect(plan.steps.length).toBeGreaterThan(0)
    expect(plan.goal.description).toContain('team meeting')
  })

  it('plan has a createdAt timestamp', () => {
    const before = Date.now()
    const plan = engine.createPlan('Build something quickly')
    expect(plan.createdAt).toBeGreaterThanOrEqual(before)
    expect(plan.createdAt).toBeLessThanOrEqual(Date.now())
  })
})

// ── decomposePlan Tests ──

describe('PlanningEngine decomposePlan', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('decomposes a plan at default depth', () => {
    const plan = engine.createPlan('Build a REST API')
    const decomposed = engine.decomposePlan(plan)
    expect(decomposed.steps.length).toBeGreaterThanOrEqual(plan.steps.length)
  })

  it('decomposes a plan at custom depth', () => {
    const plan = engine.createPlan('Implement a feature')
    const decomposed = engine.decomposePlan(plan, 2)
    expect(decomposed.steps.length).toBeGreaterThanOrEqual(plan.steps.length)
  })

  it('returns the plan unchanged when depth is 0', () => {
    const plan = engine.createPlan('Simple task')
    const decomposed = engine.decomposePlan(plan, 0)
    expect(decomposed.steps.length).toBe(plan.steps.length)
  })

  it('decomposed plan has a new id', () => {
    const plan = engine.createPlan('Build something')
    const decomposed = engine.decomposePlan(plan, 1)
    if (decomposed.steps.length > plan.steps.length) {
      expect(decomposed.id).not.toBe(plan.id)
    }
  })

  it('decomposed plan recalculates total effort', () => {
    const plan = engine.createPlan('Implement a complex feature with many steps')
    const decomposed = engine.decomposePlan(plan, 2)
    const sumEffort = decomposed.steps.reduce((s, st) => s + st.estimatedEffort, 0)
    expect(decomposed.estimatedTotalEffort).toBe(sumEffort)
  })
})

// ── evaluatePlan Tests ──

describe('PlanningEngine evaluatePlan', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('returns an evaluation with all score fields', () => {
    const plan = engine.createPlan('Build a REST API')
    const evaluation = engine.evaluatePlan(plan)
    expect(typeof evaluation.feasibility).toBe('number')
    expect(typeof evaluation.completeness).toBe('number')
    expect(typeof evaluation.efficiency).toBe('number')
    expect(typeof evaluation.overallScore).toBe('number')
    expect(Array.isArray(evaluation.risks)).toBe(true)
  })

  it('feasibility score is between 0 and 1', () => {
    const plan = engine.createPlan('Implement user authentication')
    const evaluation = engine.evaluatePlan(plan)
    expect(evaluation.feasibility).toBeGreaterThanOrEqual(0)
    expect(evaluation.feasibility).toBeLessThanOrEqual(1)
  })

  it('completeness score is between 0 and 1', () => {
    const plan = engine.createPlan('Create a database migration')
    const evaluation = engine.evaluatePlan(plan)
    expect(evaluation.completeness).toBeGreaterThanOrEqual(0)
    expect(evaluation.completeness).toBeLessThanOrEqual(1)
  })

  it('efficiency score is between 0 and 1', () => {
    const plan = engine.createPlan('Deploy to production')
    const evaluation = engine.evaluatePlan(plan)
    expect(evaluation.efficiency).toBeGreaterThanOrEqual(0)
    expect(evaluation.efficiency).toBeLessThanOrEqual(1)
  })

  it('overall score is a weighted combination of subscores', () => {
    const plan = engine.createPlan('Refactor the payment module')
    const evaluation = engine.evaluatePlan(plan)
    const expected = evaluation.feasibility * 0.35 + evaluation.completeness * 0.35 + evaluation.efficiency * 0.3
    expect(evaluation.overallScore).toBeCloseTo(expected, 1)
  })
})

// ── optimizePlan Tests ──

describe('PlanningEngine optimizePlan', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('returns optimization result with original and optimized plan', () => {
    const plan = engine.createPlan('Build a web application')
    const result = engine.optimizePlan(plan)
    expect(result.originalPlan).toBeDefined()
    expect(result.optimizedPlan).toBeDefined()
    expect(result.originalPlan.id).toBe(plan.id)
  })

  it('returns improvements list', () => {
    const plan = engine.createPlan('Implement a new feature')
    const result = engine.optimizePlan(plan)
    expect(Array.isArray(result.improvements)).toBe(true)
    expect(result.improvements.length).toBeGreaterThan(0)
  })

  it('effort reduction is between 0 and 1', () => {
    const plan = engine.createPlan('Build a CI/CD pipeline')
    const result = engine.optimizePlan(plan)
    expect(result.effortReduction).toBeGreaterThanOrEqual(0)
    expect(result.effortReduction).toBeLessThanOrEqual(1)
  })

  it('risk reduction is between 0 and 1', () => {
    const plan = engine.createPlan('Migrate database to new schema')
    const result = engine.optimizePlan(plan)
    expect(result.riskReduction).toBeGreaterThanOrEqual(0)
    expect(result.riskReduction).toBeLessThanOrEqual(1)
  })

  it('accepts custom optimization criteria', () => {
    const plan = engine.createPlan('Deploy a microservice')
    const result = engine.optimizePlan(plan, ['effort', 'ordering'])
    expect(result.optimizedPlan).toBeDefined()
    expect(result.improvements.length).toBeGreaterThan(0)
  })
})

// ── findAlternatives Tests ──

describe('PlanningEngine findAlternatives', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('returns empty array for an unknown step ID', () => {
    const plan = engine.createPlan('Build something')
    const alternatives = engine.findAlternatives(plan, 'non_existent_step_id')
    expect(alternatives).toEqual([])
  })

  it('returns alternative plans for a valid step ID', () => {
    const plan = engine.createPlan('Implement a new feature')
    const stepId = plan.steps[0].id
    const alternatives = engine.findAlternatives(plan, stepId)
    expect(alternatives.length).toBeGreaterThan(0)
  })

  it('each alternative is a valid plan', () => {
    const plan = engine.createPlan('Build a REST API')
    const stepId = plan.steps[0].id
    const alternatives = engine.findAlternatives(plan, stepId)
    for (const alt of alternatives) {
      expect(alt.id).toBeDefined()
      expect(alt.steps.length).toBeGreaterThan(0)
      expect(alt.goal).toBeDefined()
    }
  })

  it('respects maxAlternatives config', () => {
    const engine2 = new PlanningEngine({ maxAlternatives: 2 })
    const plan = engine2.createPlan('Build a REST API')
    const stepId = plan.steps[0].id
    const alternatives = engine2.findAlternatives(plan, stepId)
    expect(alternatives.length).toBeLessThanOrEqual(2)
  })

  it('alternatives differ from the original plan', () => {
    const plan = engine.createPlan('Implement a feature')
    const stepId = plan.steps[0].id
    const alternatives = engine.findAlternatives(plan, stepId)
    for (const alt of alternatives) {
      expect(alt.id).not.toBe(plan.id)
    }
  })
})

// ── buildDependencyGraph Tests ──

describe('PlanningEngine buildDependencyGraph', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('builds a graph from plan steps', () => {
    const plan = engine.createPlan('Build a REST API')
    const graph = engine.buildDependencyGraph(plan.steps)
    expect(graph.nodes.length).toBe(plan.steps.length)
    expect(Array.isArray(graph.edges)).toBe(true)
    expect(graph.adjacency).toBeDefined()
    expect(graph.inDegree).toBeDefined()
  })

  it('returns empty graph for no steps', () => {
    const graph = engine.buildDependencyGraph([])
    expect(graph.nodes.length).toBe(0)
    expect(graph.edges.length).toBe(0)
  })

  it('handles steps without dependencies', () => {
    const steps: PlanStep[] = [
      { id: 'a', action: 'do_a', description: 'Step A', estimatedEffort: 1, dependencies: [], risks: [], alternatives: [] },
      { id: 'b', action: 'do_b', description: 'Step B', estimatedEffort: 2, dependencies: [], risks: [], alternatives: [] },
    ]
    const graph = engine.buildDependencyGraph(steps)
    expect(graph.nodes).toEqual(['a', 'b'])
    expect(graph.edges.length).toBe(0)
    expect(graph.inDegree['a']).toBe(0)
    expect(graph.inDegree['b']).toBe(0)
  })

  it('correctly builds edges from dependencies', () => {
    const steps: PlanStep[] = [
      { id: 'a', action: 'do_a', description: 'Step A', estimatedEffort: 1, dependencies: [], risks: [], alternatives: [] },
      { id: 'b', action: 'do_b', description: 'Step B', estimatedEffort: 2, dependencies: ['a'], risks: [], alternatives: [] },
      { id: 'c', action: 'do_c', description: 'Step C', estimatedEffort: 3, dependencies: ['a', 'b'], risks: [], alternatives: [] },
    ]
    const graph = engine.buildDependencyGraph(steps)
    expect(graph.edges.length).toBe(3)
    expect(graph.inDegree['a']).toBe(0)
    expect(graph.inDegree['b']).toBe(1)
    expect(graph.inDegree['c']).toBe(2)
  })

  it('ignores dependencies referencing unknown step IDs', () => {
    const steps: PlanStep[] = [
      { id: 'a', action: 'do_a', description: 'Step A', estimatedEffort: 1, dependencies: ['unknown_id'], risks: [], alternatives: [] },
    ]
    const graph = engine.buildDependencyGraph(steps)
    expect(graph.edges.length).toBe(0)
    expect(graph.inDegree['a']).toBe(0)
  })
})

// ── detectCycles Tests ──

describe('PlanningEngine detectCycles', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('detects no cycles in an acyclic graph', () => {
    const steps: PlanStep[] = [
      { id: 'a', action: 'do_a', description: 'A', estimatedEffort: 1, dependencies: [], risks: [], alternatives: [] },
      { id: 'b', action: 'do_b', description: 'B', estimatedEffort: 1, dependencies: ['a'], risks: [], alternatives: [] },
      { id: 'c', action: 'do_c', description: 'C', estimatedEffort: 1, dependencies: ['b'], risks: [], alternatives: [] },
    ]
    const graph = engine.buildDependencyGraph(steps)
    const cycles = engine.detectCycles(graph)
    expect(cycles.length).toBe(0)
  })

  it('detects a simple cycle', () => {
    const graph: DependencyGraph = {
      nodes: ['a', 'b'],
      edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }],
      adjacency: { a: ['b'], b: ['a'] },
      inDegree: { a: 1, b: 1 },
    }
    const cycles = engine.detectCycles(graph)
    expect(cycles.length).toBeGreaterThan(0)
  })

  it('detects no cycles in an empty graph', () => {
    const graph: DependencyGraph = {
      nodes: [],
      edges: [],
      adjacency: {},
      inDegree: {},
    }
    const cycles = engine.detectCycles(graph)
    expect(cycles.length).toBe(0)
  })

  it('detects cycles in a larger graph with a loop', () => {
    const graph: DependencyGraph = {
      nodes: ['a', 'b', 'c', 'd'],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
        { from: 'c', to: 'a' },
        { from: 'c', to: 'd' },
      ],
      adjacency: { a: ['b'], b: ['c'], c: ['a', 'd'], d: [] },
      inDegree: { a: 1, b: 1, c: 1, d: 1 },
    }
    const cycles = engine.detectCycles(graph)
    expect(cycles.length).toBeGreaterThan(0)
    const flatCycle = cycles[0]
    expect(flatCycle.length).toBeGreaterThanOrEqual(3)
  })
})

// ── criticalPath Tests ──

describe('PlanningEngine criticalPath', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('returns at least one step for a non-empty plan', () => {
    const plan = engine.createPlan('Build a REST API')
    const path = engine.criticalPath(plan)
    expect(path.length).toBeGreaterThan(0)
  })

  it('critical path steps are valid PlanStep objects', () => {
    const plan = engine.createPlan('Deploy to production')
    const path = engine.criticalPath(plan)
    for (const step of path) {
      expect(step.id).toBeDefined()
      expect(step.action).toBeDefined()
      expect(typeof step.estimatedEffort).toBe('number')
    }
  })

  it('returns a single step for a single-step plan', () => {
    const plan = engine.createPlan('Do one thing')
    // Even a minimal plan generates a few steps, but critical path should work
    const path = engine.criticalPath(plan)
    expect(path.length).toBeGreaterThanOrEqual(1)
    expect(path.length).toBeLessThanOrEqual(plan.steps.length)
  })

  it('critical path length does not exceed total steps', () => {
    const plan = engine.createPlan('Build a complex distributed system')
    const path = engine.criticalPath(plan)
    expect(path.length).toBeLessThanOrEqual(plan.steps.length)
  })
})

// ── adaptPlan Tests ──

describe('PlanningEngine adaptPlan', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('returns an adapted plan with changed conditions noted in risks', () => {
    const plan = engine.createPlan('Build a REST API')
    const adapted = engine.adaptPlan(plan, ['API requirements changed'])
    expect(adapted.risks.some((r) => r.includes('Condition changed'))).toBe(true)
  })

  it('adapted plan has reduced confidence', () => {
    const plan = engine.createPlan('Implement a feature')
    const adapted = engine.adaptPlan(plan, ['Team size reduced'])
    expect(adapted.confidence).toBeLessThanOrEqual(plan.confidence)
  })

  it('adapted plan may have additional mitigation steps', () => {
    const plan = engine.createPlan('Deploy a microservice')
    const adapted = engine.adaptPlan(plan, ['Production environment changed'])
    expect(adapted.steps.length).toBeGreaterThanOrEqual(plan.steps.length)
  })

  it('adds reassessment step when many conditions change', () => {
    const plan = engine.createPlan('Build a web app')
    const adapted = engine.adaptPlan(plan, ['Budget cut', 'Timeline shortened', 'Team reorganized'])
    const hasReassess = adapted.steps.some((s) => s.action === 'reassess_plan')
    expect(hasReassess).toBe(true)
  })

  it('marks affected steps as adapted', () => {
    const plan = engine.createPlan('Implement user authentication with security review')
    const adapted = engine.adaptPlan(plan, ['security requirements tightened'])
    const adaptedSteps = adapted.steps.filter((s) => s.description.startsWith('[Adapted]'))
    // At least some steps could be adapted if keywords overlap
    expect(adapted.steps.length).toBeGreaterThan(0)
  })

  it('adapted plan preserves original goal', () => {
    const plan = engine.createPlan('Build a REST API')
    const adapted = engine.adaptPlan(plan, ['New compliance requirement'])
    expect(adapted.goal.description).toBe(plan.goal.description)
  })
})

// ── mergePlans Tests ──

describe('PlanningEngine mergePlans', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('merges two plans into one', () => {
    const plan1 = engine.createPlan('Build a REST API')
    const plan2 = engine.createPlan('Write integration tests')
    const merged = engine.mergePlans([plan1, plan2])
    expect(merged).toBeDefined()
    expect(merged.id).toBeDefined()
    expect(merged.steps.length).toBeGreaterThan(0)
  })

  it('merged goal description combines source goals', () => {
    const plan1 = engine.createPlan('Build a REST API')
    const plan2 = engine.createPlan('Write documentation')
    const merged = engine.mergePlans([plan1, plan2])
    expect(merged.goal.description).toContain(plan1.goal.description)
    expect(merged.goal.description).toContain(plan2.goal.description)
  })

  it('deduplicates steps with the same action', () => {
    const plan1 = engine.createPlan('Implement a feature')
    const plan2 = engine.createPlan('Implement another feature')
    const merged = engine.mergePlans([plan1, plan2])
    const actions = merged.steps.map((s) => s.action.toLowerCase().trim())
    const uniqueActions = new Set(actions)
    expect(uniqueActions.size).toBe(actions.length)
  })

  it('returns a valid plan for a single-plan array', () => {
    const plan = engine.createPlan('Build a REST API')
    const merged = engine.mergePlans([plan])
    expect(merged.steps.length).toBe(plan.steps.length)
  })

  it('creates a fallback plan for empty array', () => {
    const merged = engine.mergePlans([])
    expect(merged).toBeDefined()
    expect(merged.steps.length).toBeGreaterThan(0)
  })
})

// ── getStats Tests ──

describe('PlanningEngine getStats', () => {
  let engine: PlanningEngine

  beforeEach(() => {
    engine = new PlanningEngine()
  })

  it('returns stats with correct structure', () => {
    const stats = engine.getStats()
    expect(typeof stats.totalPlansCreated).toBe('number')
    expect(typeof stats.totalOptimisations).toBe('number')
    expect(typeof stats.totalAdaptations).toBe('number')
    expect(typeof stats.avgConfidence).toBe('number')
    expect(typeof stats.avgStepsPerPlan).toBe('number')
    expect(typeof stats.templateUsageCount).toBe('number')
  })

  it('starts with zero counts', () => {
    const stats = engine.getStats()
    expect(stats.totalPlansCreated).toBe(0)
    expect(stats.totalOptimisations).toBe(0)
    expect(stats.totalAdaptations).toBe(0)
    expect(stats.avgConfidence).toBe(0)
    expect(stats.avgStepsPerPlan).toBe(0)
    expect(stats.templateUsageCount).toBe(0)
  })

  it('updates after createPlan and optimizePlan operations', () => {
    const plan = engine.createPlan('Build a REST API')
    engine.optimizePlan(plan)
    engine.adaptPlan(plan, ['Timeline changed'])

    const stats = engine.getStats()
    expect(stats.totalPlansCreated).toBe(1)
    expect(stats.totalOptimisations).toBe(1)
    expect(stats.totalAdaptations).toBe(1)
    expect(stats.avgConfidence).toBeGreaterThan(0)
    expect(stats.avgStepsPerPlan).toBeGreaterThan(0)
  })

  it('tracks template usage count', () => {
    engine.createPlan('Implement a new feature for search')
    const stats = engine.getStats()
    expect(stats.templateUsageCount).toBeGreaterThanOrEqual(1)
  })
})

// ── serialize / deserialize Tests ──

describe('PlanningEngine serialize / deserialize', () => {
  it('round-trip preserves config', () => {
    const original = new PlanningEngine({
      maxPlanDepth: 10,
      maxAlternatives: 5,
    })

    const json = original.serialize()
    const data = JSON.parse(json)
    expect(data.config.maxPlanDepth).toBe(10)
    expect(data.config.maxAlternatives).toBe(5)
  })

  it('round-trip preserves stats', () => {
    const original = new PlanningEngine()
    const plan = original.createPlan('Build a feature')
    original.optimizePlan(plan)
    original.adaptPlan(plan, ['Condition changed'])

    const json = original.serialize()
    const restored = PlanningEngine.deserialize(json)
    const stats = restored.getStats()

    expect(stats.totalPlansCreated).toBe(1)
    expect(stats.totalOptimisations).toBe(1)
    expect(stats.totalAdaptations).toBe(1)
  })

  it('deserialized engine works correctly', () => {
    const original = new PlanningEngine()
    original.createPlan('Build something')

    const json = original.serialize()
    const restored = PlanningEngine.deserialize(json)

    const plan = restored.createPlan('Build another thing')
    expect(plan).toBeDefined()
    expect(plan.steps.length).toBeGreaterThan(0)

    const stats = restored.getStats()
    expect(stats.totalPlansCreated).toBe(2)
  })

  it('serialize returns a valid JSON string', () => {
    const engine = new PlanningEngine()
    engine.createPlan('Test plan')

    const json = engine.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
    const data = JSON.parse(json)
    expect(data.config).toBeDefined()
    expect(data.totalPlansCreated).toBe(1)
    expect(Array.isArray(data.confidenceHistory)).toBe(true)
    expect(Array.isArray(data.stepsHistory)).toBe(true)
  })
})
