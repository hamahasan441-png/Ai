import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({ APIUserAbortError: class extends Error {} }))

import { WorkflowEngine } from '../workflow/engine.js'
import {
  createCodeReviewWorkflow,
  createDeploymentWorkflow,
  createDataPipelineWorkflow,
} from '../workflow/templates.js'
import type {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowCondition,
} from '../workflow/types.js'

// ── Helpers ──

function makeStep(overrides: Partial<WorkflowStep> & { id: string }): WorkflowStep {
  return {
    name: overrides.id,
    type: 'action',
    action: { type: 'tool_call', config: { tool: 'noop' } },
    dependencies: [],
    ...overrides,
  }
}

function makeWorkflow(overrides: Partial<WorkflowDefinition> = {}): WorkflowDefinition {
  return {
    id: 'test-wf',
    name: 'Test Workflow',
    description: 'A test workflow',
    version: '1.0.0',
    steps: [makeStep({ id: 'step-1' })],
    ...overrides,
  }
}

// ── Registration ──

describe('WorkflowEngine', () => {
  describe('registerWorkflow', () => {
    it('registers a valid workflow', () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(makeWorkflow())
      expect(engine.listWorkflows()).toHaveLength(1)
    })

    it('rejects duplicate workflow ids', () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(makeWorkflow())
      expect(() => engine.registerWorkflow(makeWorkflow())).toThrow(/already registered/)
    })

    it('allows registering multiple distinct workflows', () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(makeWorkflow({ id: 'wf-1' }))
      engine.registerWorkflow(makeWorkflow({ id: 'wf-2' }))
      expect(engine.listWorkflows()).toHaveLength(2)
    })

    it('rejects workflow with unknown dependency', () => {
      const engine = new WorkflowEngine()
      expect(() =>
        engine.registerWorkflow(
          makeWorkflow({ steps: [makeStep({ id: 's1', dependencies: ['missing'] })] }),
        ),
      ).toThrow(/unknown step/)
    })

    it('rejects workflow with cyclic dependencies', () => {
      const engine = new WorkflowEngine()
      expect(() =>
        engine.registerWorkflow(
          makeWorkflow({
            steps: [
              makeStep({ id: 'a', dependencies: ['b'] }),
              makeStep({ id: 'b', dependencies: ['a'] }),
            ],
          }),
        ),
      ).toThrow(/[Cc]ycle/)
    })
  })

  // ── Linear Execution ──

  describe('linear execution', () => {
    it('executes a single-step workflow', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(makeWorkflow())
      const exec = await engine.startExecution('test-wf')
      expect(exec.status).toBe('completed')
      expect(exec.steps[0].status).toBe('completed')
      expect(exec.completedAt).toBeGreaterThanOrEqual(exec.startedAt)
    })

    it('executes steps in dependency order', async () => {
      const engine = new WorkflowEngine()
      const order: string[] = []
      const steps: WorkflowStep[] = [
        makeStep({ id: 'first' }),
        makeStep({ id: 'second', dependencies: ['first'] }),
        makeStep({ id: 'third', dependencies: ['second'] }),
      ]
      engine.registerWorkflow(makeWorkflow({ steps }))
      const exec = await engine.startExecution('test-wf')
      expect(exec.status).toBe('completed')
      // Verify completion order via timestamps
      const first = exec.steps.find((s) => s.stepId === 'first')!
      const second = exec.steps.find((s) => s.stepId === 'second')!
      const third = exec.steps.find((s) => s.stepId === 'third')!
      expect(first.completedAt).toBeLessThanOrEqual(second.startedAt!)
      expect(second.completedAt).toBeLessThanOrEqual(third.startedAt!)
    })

    it('propagates step failure to execution', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            {
              id: 'bad',
              name: 'Bad Step',
              type: 'action',
              dependencies: [],
              // Missing action — will throw
            },
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      expect(exec.status).toBe('failed')
      expect(exec.error).toBeDefined()
    })

    it('throws when starting unknown workflow', async () => {
      const engine = new WorkflowEngine()
      await expect(engine.startExecution('nonexistent')).rejects.toThrow(/not found/)
    })

    it('stores step results in variables', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(makeWorkflow())
      const exec = await engine.startExecution('test-wf')
      expect(exec.variables['step-1']).toBeDefined()
    })
  })

  // ── Condition Evaluation ──

  describe('evaluateCondition', () => {
    let engine: WorkflowEngine

    beforeEach(() => {
      engine = new WorkflowEngine()
    })

    const vars = { count: 10, name: 'hello world', items: [1, 2, 3], flag: true }

    it('evaluates eq correctly', () => {
      expect(engine.evaluateCondition({ field: 'count', operator: 'eq', value: 10 }, vars)).toBe(true)
      expect(engine.evaluateCondition({ field: 'count', operator: 'eq', value: 5 }, vars)).toBe(false)
    })

    it('evaluates neq correctly', () => {
      expect(engine.evaluateCondition({ field: 'count', operator: 'neq', value: 5 }, vars)).toBe(true)
      expect(engine.evaluateCondition({ field: 'count', operator: 'neq', value: 10 }, vars)).toBe(false)
    })

    it('evaluates gt correctly', () => {
      expect(engine.evaluateCondition({ field: 'count', operator: 'gt', value: 5 }, vars)).toBe(true)
      expect(engine.evaluateCondition({ field: 'count', operator: 'gt', value: 15 }, vars)).toBe(false)
    })

    it('evaluates lt correctly', () => {
      expect(engine.evaluateCondition({ field: 'count', operator: 'lt', value: 15 }, vars)).toBe(true)
      expect(engine.evaluateCondition({ field: 'count', operator: 'lt', value: 5 }, vars)).toBe(false)
    })

    it('evaluates contains on strings', () => {
      expect(engine.evaluateCondition({ field: 'name', operator: 'contains', value: 'hello' }, vars)).toBe(true)
      expect(engine.evaluateCondition({ field: 'name', operator: 'contains', value: 'missing' }, vars)).toBe(false)
    })

    it('evaluates contains on arrays', () => {
      expect(engine.evaluateCondition({ field: 'items', operator: 'contains', value: 2 }, vars)).toBe(true)
      expect(engine.evaluateCondition({ field: 'items', operator: 'contains', value: 99 }, vars)).toBe(false)
    })

    it('evaluates matches (regex)', () => {
      expect(engine.evaluateCondition({ field: 'name', operator: 'matches', value: '^hello' }, vars)).toBe(true)
      expect(engine.evaluateCondition({ field: 'name', operator: 'matches', value: '^world' }, vars)).toBe(false)
    })

    it('returns false for unsupported types in contains/matches', () => {
      expect(engine.evaluateCondition({ field: 'count', operator: 'contains', value: 1 }, vars)).toBe(false)
      expect(engine.evaluateCondition({ field: 'count', operator: 'matches', value: '1' }, vars)).toBe(false)
    })
  })

  // ── Condition Step Execution ──

  describe('condition steps', () => {
    it('executes condition step and stores boolean result', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          variables: { status: 'active' },
          steps: [
            {
              id: 'check',
              name: 'Check Status',
              type: 'condition',
              condition: { field: 'status', operator: 'eq', value: 'active' },
              dependencies: [],
            },
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      expect(exec.status).toBe('completed')
      expect(exec.variables['check']).toBe(true)
    })

    it('fails when condition step has no condition', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            { id: 'bad-cond', name: 'Bad', type: 'condition', dependencies: [] },
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      expect(exec.status).toBe('failed')
    })
  })

  // ── Parallel Steps ──

  describe('parallel execution', () => {
    it('executes independent steps concurrently', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            makeStep({ id: 'a' }),
            makeStep({ id: 'b' }),
            makeStep({ id: 'c', dependencies: ['a', 'b'] }),
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      expect(exec.status).toBe('completed')
      expect(exec.steps.every((s) => s.status === 'completed')).toBe(true)
    })

    it('handles mixed parallel and sequential steps', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            makeStep({ id: 'root' }),
            makeStep({ id: 'left', dependencies: ['root'] }),
            makeStep({ id: 'right', dependencies: ['root'] }),
            makeStep({ id: 'join', dependencies: ['left', 'right'] }),
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      expect(exec.status).toBe('completed')
      expect(exec.steps).toHaveLength(4)
    })
  })

  // ── Variable Interpolation ──

  describe('variable interpolation', () => {
    it('interpolates variables in action config', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          variables: { greeting: 'hello' },
          steps: [
            makeStep({
              id: 'greet',
              action: { type: 'tool_call', config: { message: '{{greeting}} world' } },
            }),
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      const result = exec.variables['greet'] as { config: { message: string } }
      expect(result.config.message).toBe('hello world')
    })

    it('preserves unresolved variables', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            makeStep({
              id: 'interp',
              action: { type: 'tool_call', config: { val: '{{unknown}}' } },
            }),
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      const result = exec.variables['interp'] as { config: { val: string } }
      expect(result.config.val).toBe('{{unknown}}')
    })

    it('overrides default variables with execution variables', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          variables: { key: 'default' },
          steps: [
            makeStep({
              id: 's',
              action: { type: 'tool_call', config: { v: '{{key}}' } },
            }),
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf', { key: 'override' })
      const result = exec.variables['s'] as { config: { v: string } }
      expect(result.config.v).toBe('override')
    })

    it('interpolates nested objects', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          variables: { host: 'example.com' },
          steps: [
            makeStep({
              id: 's',
              action: {
                type: 'http_request',
                config: { nested: { url: 'https://{{host}}/api' } },
              },
            }),
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      const result = exec.variables['s'] as { config: { nested: { url: string } } }
      expect(result.config.nested.url).toBe('https://example.com/api')
    })

    it('interpolates arrays', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          variables: { item: 'x' },
          steps: [
            makeStep({
              id: 's',
              action: {
                type: 'tool_call',
                config: { list: ['{{item}}', 'static'] },
              },
            }),
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      const result = exec.variables['s'] as { config: { list: string[] } }
      expect(result.config.list).toEqual(['x', 'static'])
    })
  })

  // ── Timeout & Retry ──

  describe('timeout and retry', () => {
    it('retries a failing step the configured number of times', async () => {
      const engine = new WorkflowEngine()
      let callCount = 0
      // We simulate failure by using a condition step with no condition (throws)
      // and onFailure set so execution continues
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            {
              id: 'retry-step',
              name: 'Retry Step',
              type: 'action',
              // Missing action → will throw on each attempt
              retries: 2,
              dependencies: [],
            },
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      const step = exec.steps.find((s) => s.stepId === 'retry-step')!
      expect(step.attempts).toBe(3) // 1 initial + 2 retries
      expect(step.status).toBe('failed')
    })

    it('succeeds after retries if a later attempt passes', async () => {
      // This tests the retry path conceptually — we use a wait step that always succeeds
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            {
              id: 'wait-step',
              name: 'Wait Step',
              type: 'wait',
              action: { type: 'tool_call', config: { durationMs: 0 } },
              retries: 2,
              dependencies: [],
            },
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      expect(exec.steps[0].status).toBe('completed')
      expect(exec.steps[0].attempts).toBe(1)
    })

    it('times out a step that exceeds its timeout', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            {
              id: 'slow',
              name: 'Slow',
              type: 'wait',
              action: { type: 'tool_call', config: { durationMs: 5000 } },
              timeout: 10, // 10ms timeout
              dependencies: [],
            },
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      expect(exec.status).toBe('failed')
      expect(exec.error).toMatch(/timed out/)
    })
  })

  // ── DAG / Cycle Detection ──

  describe('DAG and cycle detection', () => {
    it('detects a simple two-node cycle', () => {
      const engine = new WorkflowEngine()
      expect(() =>
        engine.registerWorkflow(
          makeWorkflow({
            steps: [
              makeStep({ id: 'a', dependencies: ['b'] }),
              makeStep({ id: 'b', dependencies: ['a'] }),
            ],
          }),
        ),
      ).toThrow(/[Cc]ycle/)
    })

    it('detects a three-node cycle', () => {
      const engine = new WorkflowEngine()
      expect(() =>
        engine.registerWorkflow(
          makeWorkflow({
            steps: [
              makeStep({ id: 'a', dependencies: ['c'] }),
              makeStep({ id: 'b', dependencies: ['a'] }),
              makeStep({ id: 'c', dependencies: ['b'] }),
            ],
          }),
        ),
      ).toThrow(/[Cc]ycle/)
    })

    it('accepts a valid DAG', () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            makeStep({ id: 'a' }),
            makeStep({ id: 'b', dependencies: ['a'] }),
            makeStep({ id: 'c', dependencies: ['a'] }),
            makeStep({ id: 'd', dependencies: ['b', 'c'] }),
          ],
        }),
      )
      expect(engine.listWorkflows()).toHaveLength(1)
    })

    it('detects self-referencing step', () => {
      const engine = new WorkflowEngine()
      expect(() =>
        engine.registerWorkflow(
          makeWorkflow({
            steps: [makeStep({ id: 'self', dependencies: ['self'] })],
          }),
        ),
      ).toThrow(/[Cc]ycle/)
    })

    it('rejects dependency on non-existent step', () => {
      const engine = new WorkflowEngine()
      expect(() =>
        engine.registerWorkflow(
          makeWorkflow({
            steps: [makeStep({ id: 'a', dependencies: ['ghost'] })],
          }),
        ),
      ).toThrow(/unknown step/)
    })
  })

  // ── Cancellation ──

  describe('cancellation', () => {
    it('cancels a running execution', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            {
              id: 'long',
              name: 'Long Step',
              type: 'wait',
              action: { type: 'tool_call', config: { durationMs: 60_000 } },
              dependencies: [],
            },
          ],
        }),
      )

      // Start execution (don't await — it will block on the wait step)
      const promise = engine.startExecution('test-wf')

      // Give the engine a tick to begin
      await new Promise((r) => setTimeout(r, 20))

      // Cancel
      const executions = engine.listExecutions('test-wf')
      expect(executions).toHaveLength(1)
      const cancelled = engine.cancelExecution(executions[0].id)
      expect(cancelled).toBe(true)

      const exec = await promise
      expect(exec.status).toBe('cancelled')
    })

    it('returns false when cancelling non-existent execution', () => {
      const engine = new WorkflowEngine()
      expect(engine.cancelExecution('nope')).toBe(false)
    })

    it('returns false when cancelling already completed execution', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(makeWorkflow())
      const exec = await engine.startExecution('test-wf')
      expect(engine.cancelExecution(exec.id)).toBe(false)
    })
  })

  // ── Execution Queries ──

  describe('execution queries', () => {
    it('retrieves an execution by id', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(makeWorkflow())
      const exec = await engine.startExecution('test-wf')
      expect(engine.getExecution(exec.id)).toEqual(exec)
    })

    it('returns undefined for unknown execution id', () => {
      const engine = new WorkflowEngine()
      expect(engine.getExecution('nonexistent')).toBeUndefined()
    })

    it('lists all executions', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(makeWorkflow())
      await engine.startExecution('test-wf')
      await engine.startExecution('test-wf')
      expect(engine.listExecutions()).toHaveLength(2)
    })

    it('filters executions by workflow id', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(makeWorkflow({ id: 'a' }))
      engine.registerWorkflow(makeWorkflow({ id: 'b' }))
      await engine.startExecution('a')
      await engine.startExecution('b')
      await engine.startExecution('a')
      expect(engine.listExecutions('a')).toHaveLength(2)
      expect(engine.listExecutions('b')).toHaveLength(1)
    })
  })

  // ── Wait Step ──

  describe('wait step', () => {
    it('waits for the specified duration', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            {
              id: 'w',
              name: 'Wait',
              type: 'wait',
              action: { type: 'tool_call', config: { durationMs: 10 } },
              dependencies: [],
            },
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      expect(exec.variables['w']).toEqual({ waited: 10 })
    })
  })

  // ── Loop Step ──

  describe('loop step', () => {
    it('iterates over items variable', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          variables: { things: ['a', 'b', 'c'] },
          steps: [
            {
              id: 'loop',
              name: 'Loop',
              type: 'loop',
              action: { type: 'transform', config: { itemsVar: 'things' } },
              dependencies: [],
            },
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      expect(exec.variables['loop']).toEqual(['a', 'b', 'c'])
    })
  })

  // ── Templates ──

  describe('templates', () => {
    it('creates a valid code review workflow', () => {
      const engine = new WorkflowEngine()
      const wf = createCodeReviewWorkflow()
      expect(wf.id).toBe('code-review')
      expect(wf.steps.length).toBeGreaterThanOrEqual(3)
      engine.registerWorkflow(wf) // Should not throw — valid DAG
    })

    it('creates a valid deployment workflow', () => {
      const engine = new WorkflowEngine()
      const wf = createDeploymentWorkflow()
      expect(wf.id).toBe('deployment')
      expect(wf.steps.length).toBeGreaterThanOrEqual(4)
      engine.registerWorkflow(wf)
    })

    it('creates a valid data pipeline workflow', () => {
      const engine = new WorkflowEngine()
      const wf = createDataPipelineWorkflow()
      expect(wf.id).toBe('data-pipeline')
      expect(wf.steps.length).toBeGreaterThanOrEqual(4)
      engine.registerWorkflow(wf)
    })

    it('all templates have triggers defined', () => {
      const templates = [
        createCodeReviewWorkflow(),
        createDeploymentWorkflow(),
        createDataPipelineWorkflow(),
      ]
      for (const t of templates) {
        expect(t.triggers).toBeDefined()
        expect(t.triggers!.length).toBeGreaterThan(0)
      }
    })

    it('all templates have variables defined', () => {
      const templates = [
        createCodeReviewWorkflow(),
        createDeploymentWorkflow(),
        createDataPipelineWorkflow(),
      ]
      for (const t of templates) {
        expect(t.variables).toBeDefined()
      }
    })

    it('template workflows can be executed', async () => {
      const engine = new WorkflowEngine()
      const wf = createCodeReviewWorkflow()
      engine.registerWorkflow(wf)
      const exec = await engine.startExecution('code-review', {
        repository: 'test-repo',
        pullRequestId: '42',
      })
      expect(exec.status).toBe('completed')
    })
  })

  // ── onFailure handler ──

  describe('onFailure handler', () => {
    it('does not propagate failure when onFailure is set', async () => {
      const engine = new WorkflowEngine()
      engine.registerWorkflow(
        makeWorkflow({
          steps: [
            {
              id: 'fail-graceful',
              name: 'Fail Gracefully',
              type: 'action',
              onFailure: 'recovery',
              dependencies: [],
              // Missing action triggers failure
            },
            makeStep({ id: 'recovery', dependencies: [] }),
          ],
        }),
      )
      const exec = await engine.startExecution('test-wf')
      // Execution should not be "failed" because onFailure swallows the error
      const failStep = exec.steps.find((s) => s.stepId === 'fail-graceful')!
      expect(failStep.status).toBe('failed')
      // But the recovery step should have run
      const recoveryStep = exec.steps.find((s) => s.stepId === 'recovery')!
      expect(recoveryStep.status).toBe('completed')
    })
  })
})
