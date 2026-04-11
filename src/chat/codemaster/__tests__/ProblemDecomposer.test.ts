import { describe, it, expect, beforeEach } from 'vitest'
import {
  ProblemDecomposer,
  classifyIntent,
  extractContextFiles,
  topologicalSort,
} from '../ProblemDecomposer'
import type { TaskPlan, TaskStep } from '../types'

// ── classifyIntent Tests ──

describe('classifyIntent', () => {
  it('classifies "add a new login page" as new-feature', () => {
    const result = classifyIntent('add a new login page')
    expect(result.intent).toBe('new-feature')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('classifies "fix the crash on startup" as fix-bug', () => {
    const result = classifyIntent('fix the crash on startup')
    expect(result.intent).toBe('fix-bug')
  })

  it('classifies "refactor the auth module" with confidence', () => {
    const result = classifyIntent('refactor the auth module')
    expect(result.intent).toBeDefined()
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('classifies "optimize database query performance" as optimize', () => {
    const result = classifyIntent('optimize database query performance')
    expect(result.intent).toBe('optimize')
  })

  it('classifies "add unit tests for the parser" as add-tests', () => {
    const result = classifyIntent('add unit tests for the parser')
    expect(result.intent).toBe('add-tests')
  })

  it('classifies "document the API endpoints" as documentation', () => {
    const result = classifyIntent('document the API endpoints')
    expect(result.intent).toBe('documentation')
  })

  it('classifies "fix XSS vulnerability in input sanitization" as security', () => {
    const result = classifyIntent('fix XSS vulnerability in input sanitization')
    expect(result.intent).toBe('security')
  })

  it('returns general with zero confidence for unrecognized input', () => {
    const result = classifyIntent('hello world')
    expect(result.intent).toBe('general')
    expect(result.confidence).toBe(0)
  })
})

// ── extractContextFiles Tests ──

describe('extractContextFiles', () => {
  it('extracts .ts file paths from a description', () => {
    const files = extractContextFiles('update src/utils/helpers.ts to export the new function')
    expect(files).toContain('src/utils/helpers.ts')
  })

  it('extracts multiple file paths', () => {
    const files = extractContextFiles('modify src/app.js and src/index.ts')
    expect(files).toContain('src/app.js')
    expect(files).toContain('src/index.ts')
  })

  it('extracts module references like "the auth module"', () => {
    const files = extractContextFiles('refactor the auth module')
    expect(files).toContain('src/auth/')
  })

  it('deduplicates results', () => {
    const files = extractContextFiles('check src/foo.ts and also src/foo.ts again')
    const fooCount = files.filter(f => f === 'src/foo.ts').length
    expect(fooCount).toBe(1)
  })

  it('returns empty array when no files or modules are mentioned', () => {
    const files = extractContextFiles('do something cool')
    expect(files).toEqual([])
  })
})

// ── topologicalSort Tests ──

describe('topologicalSort', () => {
  it('returns correct order for a linear chain', () => {
    const steps: TaskStep[] = [
      {
        id: 'a',
        description: '',
        dependencies: [],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
      {
        id: 'b',
        description: '',
        dependencies: ['a'],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
      {
        id: 'c',
        description: '',
        dependencies: ['b'],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
    ]
    const order = topologicalSort(steps)
    expect(order).toEqual(['a', 'b', 'c'])
  })

  it('handles steps with no dependencies', () => {
    const steps: TaskStep[] = [
      {
        id: 'x',
        description: '',
        dependencies: [],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
      {
        id: 'y',
        description: '',
        dependencies: [],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
    ]
    const order = topologicalSort(steps)
    expect(order).toHaveLength(2)
    expect(order).toContain('x')
    expect(order).toContain('y')
  })

  it('handles diamond dependencies', () => {
    const steps: TaskStep[] = [
      {
        id: 'a',
        description: '',
        dependencies: [],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
      {
        id: 'b',
        description: '',
        dependencies: ['a'],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
      {
        id: 'c',
        description: '',
        dependencies: ['a'],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
      {
        id: 'd',
        description: '',
        dependencies: ['b', 'c'],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
    ]
    const order = topologicalSort(steps)
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'))
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('d'))
    expect(order.indexOf('c')).toBeLessThan(order.indexOf('d'))
  })

  it('includes all nodes even when a cycle exists', () => {
    const steps: TaskStep[] = [
      {
        id: 'a',
        description: '',
        dependencies: ['b'],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
      {
        id: 'b',
        description: '',
        dependencies: ['a'],
        filesToModify: [],
        estimatedLines: 0,
        status: 'pending',
      },
    ]
    const order = topologicalSort(steps)
    expect(order).toHaveLength(2)
    expect(order).toContain('a')
    expect(order).toContain('b')
  })
})

// ── ProblemDecomposer constructor ──

describe('ProblemDecomposer constructor', () => {
  it('creates an instance', () => {
    const decomposer = new ProblemDecomposer()
    expect(decomposer).toBeInstanceOf(ProblemDecomposer)
  })
})

// ── decompose Tests ──

describe('ProblemDecomposer decompose', () => {
  let decomposer: ProblemDecomposer

  beforeEach(() => {
    decomposer = new ProblemDecomposer()
  })

  it('returns a TaskPlan with all required fields', () => {
    const plan = decomposer.decompose('add a new REST endpoint')
    expect(plan.intent).toBeDefined()
    expect(Array.isArray(plan.steps)).toBe(true)
    expect(plan.steps.length).toBeGreaterThan(0)
    expect(Array.isArray(plan.executionOrder)).toBe(true)
    expect(Array.isArray(plan.contextFiles)).toBe(true)
    expect(plan.totalEstimate).toBeDefined()
    expect(plan.totalEstimate.files).toBeGreaterThanOrEqual(1)
  })

  it('uses fix-bug template for bug-related descriptions', () => {
    const plan = decomposer.decompose('fix the broken login flow')
    expect(plan.intent).toBe('fix-bug')
    expect(plan.steps.some(s => s.description.toLowerCase().includes('regression'))).toBe(true)
  })

  it('falls back to new-feature template for unrecognized intents', () => {
    const plan = decomposer.decompose('hello world something unrelated')
    expect(plan.intent).toBe('general')
    expect(plan.steps.length).toBeGreaterThan(0)
  })

  it('all steps start with pending status', () => {
    const plan = decomposer.decompose('create a new dashboard component')
    for (const step of plan.steps) {
      expect(step.status).toBe('pending')
    }
  })
})

// ── getIntent Tests ──

describe('ProblemDecomposer getIntent', () => {
  it('returns intent and confidence', () => {
    const decomposer = new ProblemDecomposer()
    const result = decomposer.getIntent('optimize the image loading speed')
    expect(result.intent).toBe('optimize')
    expect(typeof result.confidence).toBe('number')
  })
})

// ── updateStepStatus Tests ──

describe('ProblemDecomposer updateStepStatus', () => {
  let decomposer: ProblemDecomposer
  let plan: TaskPlan

  beforeEach(() => {
    decomposer = new ProblemDecomposer()
    plan = decomposer.decompose('add authentication')
  })

  it('updates the status of a specific step', () => {
    const updated = decomposer.updateStepStatus(plan, 'step-1', 'completed')
    const step = updated.steps.find(s => s.id === 'step-1')
    expect(step?.status).toBe('completed')
  })

  it('does not mutate the original plan', () => {
    decomposer.updateStepStatus(plan, 'step-1', 'completed')
    const original = plan.steps.find(s => s.id === 'step-1')
    expect(original?.status).toBe('pending')
  })
})

// ── getNextSteps Tests ──

describe('ProblemDecomposer getNextSteps', () => {
  let decomposer: ProblemDecomposer

  beforeEach(() => {
    decomposer = new ProblemDecomposer()
  })

  it('returns steps with no dependencies initially', () => {
    const plan = decomposer.decompose('implement a new feature')
    const next = decomposer.getNextSteps(plan)
    expect(next.length).toBeGreaterThan(0)
    for (const step of next) {
      expect(step.dependencies).toEqual([])
    }
  })

  it('unlocks dependent steps after completing prerequisites', () => {
    let plan = decomposer.decompose('fix a bug in src/app.ts')
    plan = decomposer.updateStepStatus(plan, 'step-1', 'completed')
    const next = decomposer.getNextSteps(plan)
    const ids = next.map(s => s.id)
    expect(ids).toContain('step-2')
  })
})

// ── isPlanComplete Tests ──

describe('ProblemDecomposer isPlanComplete', () => {
  let decomposer: ProblemDecomposer

  beforeEach(() => {
    decomposer = new ProblemDecomposer()
  })

  it('returns false when steps are still pending', () => {
    const plan = decomposer.decompose('add tests')
    expect(decomposer.isPlanComplete(plan)).toBe(false)
  })

  it('returns true when all steps are completed', () => {
    let plan = decomposer.decompose('add tests')
    for (const step of plan.steps) {
      plan = decomposer.updateStepStatus(plan, step.id, 'completed')
    }
    expect(decomposer.isPlanComplete(plan)).toBe(true)
  })

  it('returns true when all steps are failed or skipped', () => {
    let plan = decomposer.decompose('add tests')
    for (let i = 0; i < plan.steps.length; i++) {
      const status = i % 2 === 0 ? 'failed' : ('skipped' as const)
      plan = decomposer.updateStepStatus(plan, plan.steps[i].id, status)
    }
    expect(decomposer.isPlanComplete(plan)).toBe(true)
  })
})
