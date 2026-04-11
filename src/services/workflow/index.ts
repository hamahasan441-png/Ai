/**
 * ⚙️ WorkflowEngine — Orchestration engine for multi-step async workflows with hooks, retries, and pause/resume
 *
 * Features:
 * - Define multi-step workflows with conditions, retries, and timeouts
 * - Pause, resume, and cancel running workflow instances
 * - Per-step error strategies (fail, skip, retry)
 * - Lifecycle hooks (beforeStep, afterStep, onError, onComplete, onStart)
 * - Workflow registry with validation
 * - Shared execution context with step output chaining
 * - Built-in workflow templates (code-review, deploy, test-suite, refactor)
 * - Instance filtering and statistics
 *
 * Zero external dependencies.
 */

// ── Types ──

export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export type WorkflowHook = 'beforeStep' | 'afterStep' | 'onError' | 'onComplete' | 'onStart'

export interface WorkflowStep {
  id: string
  name: string
  /** Async handler executed for this step */
  handler: (ctx: WorkflowContext) => Promise<unknown>
  /** Optional predicate — step is skipped when it returns false */
  condition?: (ctx: WorkflowContext) => boolean
  /** Max retry attempts (default: 0) */
  retries?: number
  /** Step timeout in ms (default: 30000) */
  timeout?: number
  /** Error strategy (default: 'fail') */
  onError?: 'fail' | 'skip' | 'retry'
}

export interface WorkflowTrigger {
  type: 'manual' | 'event' | 'schedule' | 'condition'
  config?: Record<string, unknown>
}

export interface WorkflowDefinition {
  id: string
  name: string
  version: string
  steps: WorkflowStep[]
  triggers?: WorkflowTrigger[]
  /** Default variables injected into every run context */
  variables?: Record<string, unknown>
  /** Workflow-level timeout in ms (default: 300000) */
  timeout?: number
}

export interface StepResult {
  stepId: string
  status: StepStatus
  output?: unknown
  error?: string
  duration: number
  retryCount: number
}

export interface WorkflowInstance {
  id: string
  definitionId: string
  status: WorkflowStatus
  currentStep: number
  context: Record<string, unknown>
  startedAt: number
  completedAt?: number
  error?: string
  stepResults: StepResult[]
}

export interface WorkflowStats {
  totalRuns: number
  completed: number
  failed: number
  cancelled: number
  avgDuration: number
  stepStats: Record<string, { runs: number; failures: number; avgDuration: number }>
}

export interface WorkflowEngineOptions {
  /** Max concurrent workflow instances (default: 10) */
  concurrency?: number
  /** Default step timeout in ms (default: 30000) */
  defaultStepTimeout?: number
  /** Default workflow timeout in ms (default: 300000) */
  defaultWorkflowTimeout?: number
}

// ── WorkflowContext ──

export class WorkflowContext {
  private variables: Record<string, unknown>
  private stepOutputs: Record<string, unknown>
  private metadata: Record<string, unknown>

  constructor(initial?: Record<string, unknown>, meta?: Record<string, unknown>) {
    this.variables = { ...(initial ?? {}) }
    this.stepOutputs = {}
    this.metadata = { ...(meta ?? {}) }
  }

  /** Retrieve a variable by key */
  get<T = unknown>(key: string): T | undefined {
    return this.variables[key] as T | undefined
  }

  /** Set a variable */
  set(key: string, value: unknown): void {
    this.variables[key] = value
  }

  /** Check whether a variable exists */
  has(key: string): boolean {
    return key in this.variables
  }

  /** Remove a variable */
  delete(key: string): boolean {
    if (!(key in this.variables)) return false
    delete this.variables[key]
    return true
  }

  /** Get the output produced by a previous step */
  getStepOutput<T = unknown>(stepId: string): T | undefined {
    return this.stepOutputs[stepId] as T | undefined
  }

  /** @internal Record step output — called by the executor */
  setStepOutput(stepId: string, value: unknown): void {
    this.stepOutputs[stepId] = value
  }

  /** Serialise the full context to a plain object */
  toJSON(): Record<string, unknown> {
    return {
      variables: { ...this.variables },
      stepOutputs: { ...this.stepOutputs },
      metadata: { ...this.metadata },
    }
  }

  /** Restore context from a plain object */
  static fromJSON(data: Record<string, unknown>): WorkflowContext {
    const ctx = new WorkflowContext(
      (data.variables as Record<string, unknown>) ?? {},
      (data.metadata as Record<string, unknown>) ?? {},
    )
    for (const [k, v] of Object.entries((data.stepOutputs as Record<string, unknown>) ?? {})) {
      ctx.setStepOutput(k, v)
    }
    return ctx
  }
}

// ── WorkflowRegistry ──

export class WorkflowRegistry {
  private definitions = new Map<string, WorkflowDefinition>()

  /** Register a workflow definition */
  register(definition: WorkflowDefinition): void {
    this.validate(definition)
    this.definitions.set(definition.id, definition)
  }

  /** Remove a workflow definition */
  unregister(id: string): boolean {
    return this.definitions.delete(id)
  }

  /** Get a definition by id */
  get(id: string): WorkflowDefinition | undefined {
    return this.definitions.get(id)
  }

  /** List all registered definitions */
  list(): WorkflowDefinition[] {
    return Array.from(this.definitions.values())
  }

  /** Check if a definition is registered */
  has(id: string): boolean {
    return this.definitions.has(id)
  }

  /** Validate a definition for duplicate step ids and missing fields */
  validate(definition: WorkflowDefinition): void {
    if (!definition.id || !definition.name) {
      throw new Error('Workflow definition must have an id and name')
    }
    if (!definition.steps || definition.steps.length === 0) {
      throw new Error(`Workflow "${definition.id}" must have at least one step`)
    }

    const stepIds = new Set<string>()
    for (const step of definition.steps) {
      if (!step.id || !step.name) {
        throw new Error(`Every step in workflow "${definition.id}" must have an id and name`)
      }
      if (stepIds.has(step.id)) {
        throw new Error(`Duplicate step id "${step.id}" in workflow "${definition.id}"`)
      }
      stepIds.add(step.id)
    }
  }

  /** Clear all definitions */
  clear(): void {
    this.definitions.clear()
  }
}

// ── WorkflowExecutor ──

type HookHandler = (instanceId: string, detail: Record<string, unknown>) => void | Promise<void>

export class WorkflowExecutor {
  private hooks = new Map<WorkflowHook, HookHandler[]>()
  private readonly defaultStepTimeout: number
  private readonly defaultWorkflowTimeout: number

  constructor(defaultStepTimeout = 30_000, defaultWorkflowTimeout = 300_000) {
    this.defaultStepTimeout = defaultStepTimeout
    this.defaultWorkflowTimeout = defaultWorkflowTimeout
  }

  /** Register a lifecycle hook */
  onHook(hook: WorkflowHook, handler: HookHandler): void {
    const list = this.hooks.get(hook) ?? []
    list.push(handler)
    this.hooks.set(hook, list)
  }
  /** Execute a workflow definition and return the completed instance */
  async execute(
    definition: WorkflowDefinition,
    instanceId: string,
    initialContext?: Record<string, unknown>,
    shouldPause?: () => boolean,
    shouldCancel?: () => boolean,
  ): Promise<WorkflowInstance> {
    const ctx = new WorkflowContext(
      { ...(definition.variables ?? {}), ...(initialContext ?? {}) },
      { definitionId: definition.id, instanceId },
    )

    const instance: WorkflowInstance = {
      id: instanceId,
      definitionId: definition.id,
      status: 'running',
      currentStep: 0,
      context: ctx.toJSON(),
      startedAt: Date.now(),
      stepResults: [],
    }

    await this.invokeHook('onStart', instanceId, { definitionId: definition.id })

    const workflowTimeout = definition.timeout ?? this.defaultWorkflowTimeout
    const deadline = Date.now() + workflowTimeout

    try {
      for (let i = 0; i < definition.steps.length; i++) {
        if (shouldCancel?.()) {
          instance.status = 'cancelled'
          instance.completedAt = Date.now()
          instance.context = ctx.toJSON()
          return instance
        }
        if (shouldPause?.()) {
          instance.status = 'paused'
          instance.currentStep = i
          instance.context = ctx.toJSON()
          return instance
        }
        if (Date.now() > deadline) {
          throw new Error(`Workflow "${definition.id}" timed out after ${workflowTimeout}ms`)
        }

        const step = definition.steps[i]
        instance.currentStep = i

        if (step.condition && !step.condition(ctx)) {
          instance.stepResults.push({
            stepId: step.id,
            status: 'skipped',
            duration: 0,
            retryCount: 0,
          })
          continue
        }

        const result = await this.executeStep(step, ctx, instanceId, deadline)
        instance.stepResults.push(result)

        if (result.status === 'failed') {
          instance.status = 'failed'
          instance.error = result.error
          instance.completedAt = Date.now()
          instance.context = ctx.toJSON()
          await this.invokeHook('onError', instanceId, { error: result.error, stepId: step.id })
          return instance
        }
      }

      instance.status = 'completed'
      instance.completedAt = Date.now()
      instance.context = ctx.toJSON()
      await this.invokeHook('onComplete', instanceId, { definitionId: definition.id })
    } catch (err) {
      instance.status = 'failed'
      instance.error = err instanceof Error ? err.message : String(err)
      instance.completedAt = Date.now()
      instance.context = ctx.toJSON()
      await this.invokeHook('onError', instanceId, { error: instance.error })
    }

    return instance
  }

  // ── Private methods ──

  private async executeStep(
    step: WorkflowStep,
    ctx: WorkflowContext,
    instanceId: string,
    workflowDeadline: number,
  ): Promise<StepResult> {
    const maxAttempts = (step.onError === 'retry' ? (step.retries ?? 0) : 0) + 1
    const stepTimeout = step.timeout ?? this.defaultStepTimeout
    let lastError: string | undefined

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await this.invokeHook('beforeStep', instanceId, { stepId: step.id, attempt })
      const start = Date.now()

      try {
        const remaining = workflowDeadline - Date.now()
        const timeout = Math.min(stepTimeout, remaining)
        if (timeout <= 0) throw new Error(`Workflow deadline exceeded before step "${step.id}"`)

        const output = await this.withTimeout(step.handler(ctx), timeout, step.id)
        const duration = Date.now() - start
        ctx.setStepOutput(step.id, output)

        const result: StepResult = {
          stepId: step.id,
          status: 'completed',
          output,
          duration,
          retryCount: attempt,
        }
        await this.invokeHook('afterStep', instanceId, { stepId: step.id, result })
        return result
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        const duration = Date.now() - start

        if (attempt === maxAttempts - 1) {
          const status: StepStatus = step.onError === 'skip' ? 'skipped' : 'failed'
          const result: StepResult = {
            stepId: step.id,
            status,
            error: lastError,
            duration,
            retryCount: attempt,
          }
          await this.invokeHook('afterStep', instanceId, { stepId: step.id, result })
          return result
        }
      }
    }

    return {
      stepId: step.id,
      status: 'failed',
      error: lastError,
      duration: 0,
      retryCount: maxAttempts - 1,
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number, stepId: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Step "${stepId}" timed out after ${ms}ms`)),
        ms,
      )
      promise
        .then(val => {
          clearTimeout(timer)
          resolve(val)
        })
        .catch(err => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }

  private async invokeHook(
    hook: WorkflowHook,
    instanceId: string,
    detail: Record<string, unknown>,
  ): Promise<void> {
    const handlers = this.hooks.get(hook) ?? []
    for (const handler of handlers) {
      try {
        await handler(instanceId, detail)
      } catch {
        /* hook errors are swallowed */
      }
    }
  }
}

// ── WorkflowEngine ──

export class WorkflowEngine {
  private registry: WorkflowRegistry
  private executor: WorkflowExecutor
  private instances = new Map<string, WorkflowInstance>()
  private pauseFlags = new Map<string, boolean>()
  private cancelFlags = new Map<string, boolean>()
  private totalDuration = 0
  private idCounter = 0
  private readonly opts: Required<WorkflowEngineOptions>

  constructor(options?: WorkflowEngineOptions) {
    this.opts = {
      concurrency: options?.concurrency ?? 10,
      defaultStepTimeout: options?.defaultStepTimeout ?? 30_000,
      defaultWorkflowTimeout: options?.defaultWorkflowTimeout ?? 300_000,
    }
    this.registry = new WorkflowRegistry()
    this.executor = new WorkflowExecutor(
      this.opts.defaultStepTimeout,
      this.opts.defaultWorkflowTimeout,
    )
    this.registerBuiltInWorkflows()
  }

  /** Register a workflow definition */
  defineWorkflow(definition: WorkflowDefinition): void {
    this.registry.register(definition)
  }

  /** Start a new workflow instance and return its id */
  startWorkflow(definitionId: string, initialContext?: Record<string, unknown>): string {
    const definition = this.registry.get(definitionId)
    if (!definition) throw new Error(`Workflow "${definitionId}" is not registered`)

    const instanceId = this.generateId()
    const placeholder: WorkflowInstance = {
      id: instanceId,
      definitionId,
      status: 'running',
      currentStep: 0,
      context: initialContext ?? {},
      startedAt: Date.now(),
      stepResults: [],
    }

    this.instances.set(instanceId, placeholder)
    this.pauseFlags.set(instanceId, false)
    this.cancelFlags.set(instanceId, false)

    void this.executor
      .execute(
        definition,
        instanceId,
        initialContext,
        () => this.pauseFlags.get(instanceId) === true,
        () => this.cancelFlags.get(instanceId) === true,
      )
      .then(result => {
        this.instances.set(instanceId, result)
        if (result.completedAt && result.startedAt)
          this.totalDuration += result.completedAt - result.startedAt
      })

    return instanceId
  }

  /** Request a running workflow to pause after the current step */
  pauseWorkflow(instanceId: string): boolean {
    const instance = this.instances.get(instanceId)
    if (!instance || instance.status !== 'running') return false
    this.pauseFlags.set(instanceId, true)
    return true
  }

  /** Resume a paused workflow from where it left off */
  resumeWorkflow(instanceId: string): boolean {
    const instance = this.instances.get(instanceId)
    if (!instance || instance.status !== 'paused') return false

    const definition = this.registry.get(instance.definitionId)
    if (!definition) return false

    this.pauseFlags.set(instanceId, false)
    this.cancelFlags.set(instanceId, false)
    instance.status = 'running'
    this.instances.set(instanceId, instance)

    const remaining: WorkflowDefinition = {
      ...definition,
      steps: definition.steps.slice(instance.currentStep),
    }

    void this.executor
      .execute(
        remaining,
        instanceId,
        instance.context,
        () => this.pauseFlags.get(instanceId) === true,
        () => this.cancelFlags.get(instanceId) === true,
      )
      .then(result => {
        const merged: WorkflowInstance = {
          ...result,
          stepResults: [...instance.stepResults, ...result.stepResults],
          startedAt: instance.startedAt,
        }
        this.instances.set(instanceId, merged)
        if (merged.completedAt && merged.startedAt)
          this.totalDuration += merged.completedAt - merged.startedAt
      })

    return true
  }

  /** Request a running or paused workflow to cancel */
  cancelWorkflow(instanceId: string): boolean {
    const instance = this.instances.get(instanceId)
    if (!instance || (instance.status !== 'running' && instance.status !== 'paused')) return false

    this.cancelFlags.set(instanceId, true)
    if (instance.status === 'paused') {
      instance.status = 'cancelled'
      instance.completedAt = Date.now()
      this.instances.set(instanceId, instance)
    }
    return true
  }

  /** Get the current state of a workflow instance */
  getStatus(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId)
  }

  /** List instances, optionally filtered by status or definitionId */
  listInstances(filter?: { status?: WorkflowStatus; definitionId?: string }): WorkflowInstance[] {
    let results = Array.from(this.instances.values())
    if (filter?.status) results = results.filter(i => i.status === filter.status)
    if (filter?.definitionId) results = results.filter(i => i.definitionId === filter.definitionId)
    return results
  }

  /** Register a lifecycle hook */
  onHook(
    hook: WorkflowHook,
    handler: (id: string, detail: Record<string, unknown>) => void | Promise<void>,
  ): void {
    this.executor.onHook(hook, handler)
  }

  /** Aggregate statistics across all instances */
  getStats(): WorkflowStats {
    const all = Array.from(this.instances.values())
    const completed = all.filter(i => i.status === 'completed').length
    const failed = all.filter(i => i.status === 'failed').length
    const cancelled = all.filter(i => i.status === 'cancelled').length
    const finished = completed + failed + cancelled

    const stepStats: WorkflowStats['stepStats'] = {}
    for (const inst of all) {
      for (const sr of inst.stepResults) {
        const entry = stepStats[sr.stepId] ?? { runs: 0, failures: 0, avgDuration: 0 }
        entry.runs++
        if (sr.status === 'failed') entry.failures++
        entry.avgDuration = (entry.avgDuration * (entry.runs - 1) + sr.duration) / entry.runs
        stepStats[sr.stepId] = entry
      }
    }

    return {
      totalRuns: all.length,
      completed,
      failed,
      cancelled,
      avgDuration: finished > 0 ? this.totalDuration / finished : 0,
      stepStats,
    }
  }

  /** Access the underlying registry */
  getRegistry(): WorkflowRegistry {
    return this.registry
  }

  /** Clear all instances and reset counters */
  clear(): void {
    this.instances.clear()
    this.pauseFlags.clear()
    this.cancelFlags.clear()
    this.totalDuration = 0
  }

  // ── Private methods ──

  private generateId(): string {
    return `wf_${Date.now()}_${++this.idCounter}`
  }

  private registerBuiltInWorkflows(): void {
    const h = async () => ({ ok: true })
    const defs: WorkflowDefinition[] = [
      {
        id: 'code-review',
        name: 'Code Review',
        version: '1.0.0',
        triggers: [{ type: 'event', config: { event: 'pull_request.opened' } }],
        steps: [
          { id: 'lint', name: 'Run linter', handler: h },
          { id: 'type-check', name: 'Type check', handler: h },
          { id: 'review', name: 'AI code review', handler: h },
          { id: 'comment', name: 'Post review comments', handler: h },
        ],
      },
      {
        id: 'deploy',
        name: 'Deployment Pipeline',
        version: '1.0.0',
        triggers: [{ type: 'manual' }],
        steps: [
          { id: 'build', name: 'Build artefacts', handler: h },
          { id: 'test', name: 'Run tests', handler: h, onError: 'fail' },
          { id: 'stage', name: 'Deploy to staging', handler: h },
          { id: 'verify', name: 'Smoke tests', handler: h, onError: 'retry', retries: 2 },
          { id: 'promote', name: 'Promote to production', handler: h },
        ],
      },
      {
        id: 'test-suite',
        name: 'Test Suite',
        version: '1.0.0',
        triggers: [{ type: 'event', config: { event: 'push' } }],
        steps: [
          { id: 'unit', name: 'Unit tests', handler: h },
          { id: 'integration', name: 'Integration tests', handler: h, onError: 'skip' },
          { id: 'e2e', name: 'End-to-end tests', handler: h, onError: 'skip' },
          { id: 'coverage', name: 'Coverage report', handler: h },
        ],
      },
      {
        id: 'refactor',
        name: 'Refactor Workflow',
        version: '1.0.0',
        triggers: [{ type: 'manual' }],
        steps: [
          { id: 'analyse', name: 'Static analysis', handler: h },
          { id: 'transform', name: 'Apply transforms', handler: h },
          { id: 'validate', name: 'Validate changes', handler: h },
          { id: 'format', name: 'Format code', handler: h },
        ],
      },
    ]
    for (const def of defs) this.registry.register(def)
  }
}

/** Create a new WorkflowEngine with the given options */
export function createWorkflowEngine(options?: WorkflowEngineOptions): WorkflowEngine {
  return new WorkflowEngine(options)
}
