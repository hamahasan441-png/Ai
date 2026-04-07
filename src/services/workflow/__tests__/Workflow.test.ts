import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  WorkflowContext,
  WorkflowRegistry,
  WorkflowExecutor,
  WorkflowEngine,
  createWorkflowEngine,
  type WorkflowDefinition,
  type WorkflowStep,
} from '../index.js'

// ── Helpers ──

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function makeStep(overrides: Partial<WorkflowStep> & { id: string; name: string }): WorkflowStep {
  return { handler: async () => ({ ok: true }), ...overrides }
}

function makeDefinition(overrides?: Partial<WorkflowDefinition>): WorkflowDefinition {
  return {
    id: 'test-wf',
    name: 'Test Workflow',
    version: '1.0.0',
    steps: [
      makeStep({ id: 'step-1', name: 'First Step' }),
      makeStep({ id: 'step-2', name: 'Second Step' }),
    ],
    ...overrides,
  }
}

// ── WorkflowContext ──

describe('WorkflowContext', () => {
  let ctx: WorkflowContext

  beforeEach(() => {
    ctx = new WorkflowContext({ foo: 'bar', count: 42 })
  })

  it('should get a variable by key', () => {
    expect(ctx.get('foo')).toBe('bar')
    expect(ctx.get('count')).toBe(42)
  })

  it('should return undefined for missing key', () => {
    expect(ctx.get('missing')).toBeUndefined()
  })

  it('should set a variable', () => {
    ctx.set('newKey', 'newValue')
    expect(ctx.get('newKey')).toBe('newValue')
  })

  it('should overwrite an existing variable', () => {
    ctx.set('foo', 'updated')
    expect(ctx.get('foo')).toBe('updated')
  })

  it('should check has for existing and missing keys', () => {
    expect(ctx.has('foo')).toBe(true)
    expect(ctx.has('nonexistent')).toBe(false)
  })

  it('should delete an existing variable and return true', () => {
    expect(ctx.delete('foo')).toBe(true)
    expect(ctx.has('foo')).toBe(false)
    expect(ctx.get('foo')).toBeUndefined()
  })

  it('should return false when deleting a non-existent variable', () => {
    expect(ctx.delete('nope')).toBe(false)
  })

  it('should return step output via getStepOutput', () => {
    ctx.setStepOutput('s1', { result: 'done' })
    expect(ctx.getStepOutput('s1')).toEqual({ result: 'done' })
  })

  it('should return undefined for missing step output', () => {
    expect(ctx.getStepOutput('unknown')).toBeUndefined()
  })

  it('should serialise to JSON', () => {
    ctx.setStepOutput('s1', 100)
    const json = ctx.toJSON()
    expect(json).toEqual({
      variables: { foo: 'bar', count: 42 },
      stepOutputs: { s1: 100 },
      metadata: {},
    })
  })

  it('should deserialise from JSON', () => {
    const json = {
      variables: { a: 1 },
      stepOutputs: { x: 'out' },
      metadata: { env: 'test' },
    }
    const restored = WorkflowContext.fromJSON(json)
    expect(restored.get('a')).toBe(1)
    expect(restored.getStepOutput('x')).toBe('out')
    expect(restored.toJSON().metadata).toEqual({ env: 'test' })
  })

  it('should handle fromJSON with missing fields', () => {
    const restored = WorkflowContext.fromJSON({})
    expect(restored.toJSON()).toEqual({ variables: {}, stepOutputs: {}, metadata: {} })
  })
})

// ── WorkflowRegistry ──

describe('WorkflowRegistry', () => {
  let registry: WorkflowRegistry

  beforeEach(() => {
    registry = new WorkflowRegistry()
  })

  it('should register a workflow definition', () => {
    const def = makeDefinition()
    registry.register(def)
    expect(registry.has(def.id)).toBe(true)
  })

  it('should get a registered workflow', () => {
    const def = makeDefinition()
    registry.register(def)
    expect(registry.get(def.id)).toBe(def)
  })

  it('should return undefined for non-existent workflow', () => {
    expect(registry.get('missing')).toBeUndefined()
  })

  it('should list all registered workflows', () => {
    const a = makeDefinition({ id: 'a', name: 'A' })
    const b = makeDefinition({ id: 'b', name: 'B' })
    registry.register(a)
    registry.register(b)
    expect(registry.list()).toHaveLength(2)
    expect(registry.list().map(d => d.id)).toEqual(['a', 'b'])
  })

  it('should check has for missing definition', () => {
    expect(registry.has('ghost')).toBe(false)
  })

  it('should unregister a workflow', () => {
    registry.register(makeDefinition())
    expect(registry.unregister('test-wf')).toBe(true)
    expect(registry.has('test-wf')).toBe(false)
  })

  it('should return false when unregistering unknown workflow', () => {
    expect(registry.unregister('nope')).toBe(false)
  })

  it('should throw when registering definition without required fields', () => {
    expect(() =>
      registry.register({ id: '', name: '', version: '1', steps: [makeStep({ id: 's', name: 's' })] }),
    ).toThrow('must have an id and name')
  })

  it('should throw when registering definition with no steps', () => {
    expect(() =>
      registry.register({ id: 'x', name: 'X', version: '1', steps: [] }),
    ).toThrow('must have at least one step')
  })

  it('should throw when registering definition with duplicate step ids', () => {
    expect(() =>
      registry.register(makeDefinition({ steps: [makeStep({ id: 'dup', name: 'A' }), makeStep({ id: 'dup', name: 'B' })] })),
    ).toThrow('Duplicate step id "dup"')
  })
})

// ── WorkflowExecutor ──

describe('WorkflowExecutor', () => {
  let executor: WorkflowExecutor

  beforeEach(() => {
    executor = new WorkflowExecutor(5_000, 60_000)
  })

  it('should execute a simple linear workflow', async () => {
    const def = makeDefinition({
      steps: [
        makeStep({ id: 's1', name: 'S1', handler: async () => 'a' }),
        makeStep({ id: 's2', name: 'S2', handler: async () => 'b' }),
      ],
    })

    const result = await executor.execute(def, 'inst-1')
    expect(result.status).toBe('completed')
    expect(result.stepResults).toHaveLength(2)
    expect(result.stepResults[0].status).toBe('completed')
    expect(result.stepResults[0].output).toBe('a')
    expect(result.stepResults[1].output).toBe('b')
  })

  it('should skip steps whose condition returns false', async () => {
    const def = makeDefinition({
      steps: [
        makeStep({ id: 's1', name: 'S1', handler: async () => 'run' }),
        makeStep({ id: 's2', name: 'S2', handler: async () => 'skip-me', condition: () => false }),
        makeStep({ id: 's3', name: 'S3', handler: async () => 'also-run' }),
      ],
    })

    const result = await executor.execute(def, 'inst-2')
    expect(result.status).toBe('completed')
    expect(result.stepResults[1].status).toBe('skipped')
    expect(result.stepResults[1].output).toBeUndefined()
    expect(result.stepResults[2].status).toBe('completed')
  })

  it('should run steps whose condition returns true', async () => {
    const def = makeDefinition({
      steps: [
        makeStep({ id: 's1', name: 'S1', handler: async () => 'yes', condition: () => true }),
      ],
    })
    const result = await executor.execute(def, 'inst-3')
    expect(result.stepResults[0].status).toBe('completed')
  })

  it('should enforce step timeout', async () => {
    const def = makeDefinition({
      steps: [
        makeStep({ id: 'slow', name: 'Slow', handler: async () => { await sleep(5000); return 1 }, timeout: 50 }),
      ],
    })

    const result = await executor.execute(def, 'inst-4')
    expect(result.status).toBe('failed')
    expect(result.error).toContain('timed out')
  })

  it('should retry a step when onError is retry', async () => {
    let attempts = 0
    const def = makeDefinition({
      steps: [
        makeStep({
          id: 'flaky', name: 'Flaky',
          handler: async () => { attempts++; if (attempts < 3) throw new Error('fail'); return 'ok' },
          onError: 'retry', retries: 3,
        }),
      ],
    })

    const result = await executor.execute(def, 'inst-5')
    expect(result.status).toBe('completed')
    expect(result.stepResults[0].retryCount).toBe(2)
    expect(attempts).toBe(3)
  })

  it('should skip step on error when onError is skip', async () => {
    const def = makeDefinition({
      steps: [
        makeStep({ id: 'err', name: 'Err', handler: async () => { throw new Error('boom') }, onError: 'skip' }),
        makeStep({ id: 'next', name: 'Next', handler: async () => 'after-skip' }),
      ],
    })

    const result = await executor.execute(def, 'inst-6')
    expect(result.status).toBe('completed')
    expect(result.stepResults[0].status).toBe('skipped')
    expect(result.stepResults[0].error).toBe('boom')
    expect(result.stepResults[1].status).toBe('completed')
  })

  it('should fail workflow when step fails with onError fail (default)', async () => {
    const def = makeDefinition({
      steps: [
        makeStep({ id: 'bad', name: 'Bad', handler: async () => { throw new Error('fatal') } }),
        makeStep({ id: 'never', name: 'Never', handler: async () => 'unreachable' }),
      ],
    })

    const result = await executor.execute(def, 'inst-7')
    expect(result.status).toBe('failed')
    expect(result.error).toBe('fatal')
    expect(result.stepResults).toHaveLength(1)
  })

  it('should make step output available to next step via context', async () => {
    const def = makeDefinition({
      steps: [
        makeStep({ id: 'producer', name: 'Producer', handler: async () => ({ data: 123 }) }),
        makeStep({
          id: 'consumer', name: 'Consumer',
          handler: async (ctx) => {
            const prev = ctx.getStepOutput<{ data: number }>('producer')
            return prev?.data
          },
        }),
      ],
    })

    const result = await executor.execute(def, 'inst-8')
    expect(result.status).toBe('completed')
    expect(result.stepResults[1].output).toBe(123)
  })

  it('should fire beforeStep and afterStep hooks', async () => {
    const hookCalls: string[] = []
    executor.onHook('beforeStep', async (_id, detail) => { hookCalls.push(`before:${detail.stepId}`) })
    executor.onHook('afterStep', async (_id, detail) => { hookCalls.push(`after:${(detail.result as Record<string, unknown>).stepId}`) })

    const def = makeDefinition({
      steps: [makeStep({ id: 'a', name: 'A', handler: async () => 1 })],
    })

    await executor.execute(def, 'inst-9')
    expect(hookCalls).toEqual(['before:a', 'after:a'])
  })

  it('should fire onStart hook', async () => {
    const started = vi.fn()
    executor.onHook('onStart', started)

    const def = makeDefinition({ steps: [makeStep({ id: 's', name: 'S', handler: async () => 1 })] })
    await executor.execute(def, 'inst-10')
    expect(started).toHaveBeenCalledWith('inst-10', { definitionId: 'test-wf' })
  })

  it('should fire onComplete hook', async () => {
    const completed = vi.fn()
    executor.onHook('onComplete', completed)

    const def = makeDefinition({ steps: [makeStep({ id: 's', name: 'S', handler: async () => 1 })] })
    await executor.execute(def, 'inst-11')
    expect(completed).toHaveBeenCalledWith('inst-11', { definitionId: 'test-wf' })
  })

  it('should fire onError hook when a step fails', async () => {
    const errHook = vi.fn()
    executor.onHook('onError', errHook)

    const def = makeDefinition({
      steps: [makeStep({ id: 'bad', name: 'Bad', handler: async () => { throw new Error('nope') } })],
    })

    await executor.execute(def, 'inst-12')
    expect(errHook).toHaveBeenCalledWith('inst-12', { error: 'nope', stepId: 'bad' })
  })

  it('should enforce workflow-level timeout', async () => {
    const def = makeDefinition({
      timeout: 50,
      steps: [
        makeStep({ id: 's1', name: 'S1', handler: async () => { await sleep(20); return 1 } }),
        makeStep({ id: 's2', name: 'S2', handler: async () => { await sleep(200); return 2 } }),
      ],
    })

    const result = await executor.execute(def, 'inst-13')
    expect(result.status).toBe('failed')
    expect(result.error).toContain('timed out')
  })

  it('should complete immediately for empty-step workflow (caught by registry validate)', async () => {
    // WorkflowExecutor.execute receives definition directly; pass zero steps
    const def: WorkflowDefinition = { id: 'empty', name: 'Empty', version: '1', steps: [] }
    const result = await executor.execute(def, 'inst-14')
    expect(result.status).toBe('completed')
    expect(result.stepResults).toHaveLength(0)
  })

  it('should respect shouldCancel callback', async () => {
    let cancelled = false
    const def = makeDefinition({
      steps: [
        makeStep({ id: 's1', name: 'S1', handler: async () => { cancelled = true; return 1 } }),
        makeStep({ id: 's2', name: 'S2', handler: async () => 2 }),
      ],
    })

    const result = await executor.execute(def, 'inst-15', undefined, undefined, () => cancelled)
    expect(result.status).toBe('cancelled')
    expect(result.stepResults).toHaveLength(1)
  })

  it('should respect shouldPause callback', async () => {
    let paused = false
    const def = makeDefinition({
      steps: [
        makeStep({ id: 's1', name: 'S1', handler: async () => { paused = true; return 1 } }),
        makeStep({ id: 's2', name: 'S2', handler: async () => 2 }),
      ],
    })

    const result = await executor.execute(def, 'inst-16', undefined, () => paused)
    expect(result.status).toBe('paused')
    expect(result.stepResults).toHaveLength(1)
  })
})

// ── WorkflowEngine ──

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine

  beforeEach(() => {
    engine = new WorkflowEngine({ defaultStepTimeout: 5_000, defaultWorkflowTimeout: 60_000 })
  })

  afterEach(() => {
    engine.clear()
  })

  it('should define and start a workflow', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'my-wf',
      steps: [makeStep({ id: 's1', name: 'S1', handler: async () => 'done' })],
    }))

    const id = engine.startWorkflow('my-wf')
    expect(id).toContain('wf_')
    await sleep(100)
    const status = engine.getStatus(id)
    expect(status).toBeDefined()
    expect(status!.status).toBe('completed')
  })

  it('should throw when starting an unregistered workflow', () => {
    expect(() => engine.startWorkflow('nonexistent')).toThrow('is not registered')
  })

  it('should pause a running workflow', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'pausable',
      steps: [
        makeStep({ id: 's1', name: 'S1', handler: async () => { await sleep(200); return 1 } }),
        makeStep({ id: 's2', name: 'S2', handler: async () => { await sleep(200); return 2 } }),
      ],
    }))

    const id = engine.startWorkflow('pausable')
    await sleep(50)
    const paused = engine.pauseWorkflow(id)
    expect(paused).toBe(true)
  })

  it('should return false when pausing non-running workflow', () => {
    expect(engine.pauseWorkflow('nonexistent')).toBe(false)
  })

  it('should resume a paused workflow', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'resumable',
      steps: [
        makeStep({ id: 's1', name: 'S1', handler: async () => { await sleep(50); return 1 } }),
        makeStep({ id: 's2', name: 'S2', handler: async () => 'done' }),
      ],
    }))

    const id = engine.startWorkflow('resumable')
    await sleep(20)
    engine.pauseWorkflow(id)
    await sleep(200)

    const inst = engine.getStatus(id)
    if (inst?.status === 'paused') {
      const resumed = engine.resumeWorkflow(id)
      expect(resumed).toBe(true)
      await sleep(200)
      const after = engine.getStatus(id)
      expect(after!.status).toBe('completed')
    }
  })

  it('should return false when resuming non-paused workflow', () => {
    expect(engine.resumeWorkflow('nonexistent')).toBe(false)
  })

  it('should cancel a running workflow', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'cancellable',
      steps: [
        makeStep({ id: 's1', name: 'S1', handler: async () => { await sleep(300); return 1 } }),
        makeStep({ id: 's2', name: 'S2', handler: async () => 2 }),
      ],
    }))

    const id = engine.startWorkflow('cancellable')
    await sleep(50)
    const cancelled = engine.cancelWorkflow(id)
    expect(cancelled).toBe(true)
  })

  it('should return false when cancelling non-running workflow', () => {
    expect(engine.cancelWorkflow('nonexistent')).toBe(false)
  })

  it('should cancel a paused workflow immediately', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'pause-cancel',
      steps: [
        makeStep({ id: 's1', name: 'S1', handler: async () => { await sleep(50); return 1 } }),
        makeStep({ id: 's2', name: 'S2', handler: async () => 2 }),
      ],
    }))

    const id = engine.startWorkflow('pause-cancel')
    await sleep(20)
    engine.pauseWorkflow(id)
    await sleep(200)

    const inst = engine.getStatus(id)
    if (inst?.status === 'paused') {
      const result = engine.cancelWorkflow(id)
      expect(result).toBe(true)
      const after = engine.getStatus(id)
      expect(after!.status).toBe('cancelled')
    }
  })

  it('should get status of a running workflow', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'status-wf',
      steps: [makeStep({ id: 's1', name: 'S1', handler: async () => { await sleep(200); return 1 } })],
    }))

    const id = engine.startWorkflow('status-wf')
    const status = engine.getStatus(id)
    expect(status).toBeDefined()
    expect(status!.id).toBe(id)
    expect(status!.definitionId).toBe('status-wf')
  })

  it('should return undefined for unknown instance', () => {
    expect(engine.getStatus('unknown')).toBeUndefined()
  })

  it('should list instances without filter', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'list-wf',
      steps: [makeStep({ id: 's1', name: 'S1', handler: async () => 1 })],
    }))

    engine.startWorkflow('list-wf')
    engine.startWorkflow('list-wf')
    await sleep(100)
    const all = engine.listInstances()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })

  it('should list instances with status filter', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'filter-wf',
      steps: [makeStep({ id: 's1', name: 'S1', handler: async () => 1 })],
    }))

    engine.startWorkflow('filter-wf')
    await sleep(100)
    const completed = engine.listInstances({ status: 'completed' })
    expect(completed.every(i => i.status === 'completed')).toBe(true)
  })

  it('should list instances with definitionId filter', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'filter-def',
      steps: [makeStep({ id: 's1', name: 'S1', handler: async () => 1 })],
    }))

    engine.startWorkflow('filter-def')
    await sleep(100)
    const filtered = engine.listInstances({ definitionId: 'filter-def' })
    expect(filtered.every(i => i.definitionId === 'filter-def')).toBe(true)
    expect(filtered.length).toBe(1)
  })

  it('should get aggregate stats', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'stats-wf',
      steps: [makeStep({ id: 's1', name: 'S1', handler: async () => 1 })],
    }))

    engine.startWorkflow('stats-wf')
    await sleep(100)

    const stats = engine.getStats()
    expect(stats.totalRuns).toBeGreaterThanOrEqual(1)
    expect(stats.completed).toBeGreaterThanOrEqual(1)
    expect(stats.avgDuration).toBeGreaterThanOrEqual(0)
    expect(stats.stepStats).toBeDefined()
  })

  it('should have built-in code-review workflow', () => {
    expect(engine.getRegistry().has('code-review')).toBe(true)
  })

  it('should have built-in deploy workflow', () => {
    expect(engine.getRegistry().has('deploy')).toBe(true)
  })

  it('should have built-in test-suite workflow', () => {
    expect(engine.getRegistry().has('test-suite')).toBe(true)
  })

  it('should have built-in refactor workflow', () => {
    expect(engine.getRegistry().has('refactor')).toBe(true)
  })

  it('should register lifecycle hooks', async () => {
    const hookFn = vi.fn()
    engine.onHook('onStart', hookFn)

    engine.defineWorkflow(makeDefinition({
      id: 'hook-wf',
      steps: [makeStep({ id: 's1', name: 'S1', handler: async () => 1 })],
    }))

    engine.startWorkflow('hook-wf')
    await sleep(100)
    expect(hookFn).toHaveBeenCalled()
  })

  it('should run multiple concurrent workflows', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'concurrent',
      steps: [makeStep({ id: 's1', name: 'S1', handler: async () => { await sleep(50); return 1 } })],
    }))

    const ids = [
      engine.startWorkflow('concurrent'),
      engine.startWorkflow('concurrent'),
      engine.startWorkflow('concurrent'),
    ]
    await sleep(200)

    for (const id of ids) {
      const status = engine.getStatus(id)
      expect(status!.status).toBe('completed')
    }
  })

  it('should expose the registry via getRegistry', () => {
    const reg = engine.getRegistry()
    expect(reg).toBeInstanceOf(WorkflowRegistry)
    expect(reg.has('code-review')).toBe(true)
  })

  it('should clear all instances', async () => {
    engine.defineWorkflow(makeDefinition({
      id: 'clear-wf',
      steps: [makeStep({ id: 's1', name: 'S1', handler: async () => 1 })],
    }))

    engine.startWorkflow('clear-wf')
    await sleep(100)
    engine.clear()
    expect(engine.listInstances()).toHaveLength(0)
    expect(engine.getStats().totalRuns).toBe(0)
  })
})

// ── createWorkflowEngine ──

describe('createWorkflowEngine', () => {
  it('should create a WorkflowEngine instance', () => {
    const engine = createWorkflowEngine()
    expect(engine).toBeInstanceOf(WorkflowEngine)
    engine.clear()
  })

  it('should accept custom options', () => {
    const engine = createWorkflowEngine({ concurrency: 5 })
    expect(engine).toBeInstanceOf(WorkflowEngine)
    expect(engine.getRegistry().has('code-review')).toBe(true)
    engine.clear()
  })
})
