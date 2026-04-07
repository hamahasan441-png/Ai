/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Workflow / Pipeline Engine                                                  ║
 * ║                                                                              ║
 * ║  Executes declarative workflow definitions with:                             ║
 * ║    • DAG-based step dependency resolution with cycle detection               ║
 * ║    • Parallel step execution                                                ║
 * ║    • Variable interpolation ({{variable_name}} syntax)                      ║
 * ║    • Step-level timeout (AbortController) and retry                         ║
 * ║    • Condition evaluation                                                   ║
 * ║    • Execution cancellation                                                 ║
 * ║                                                                              ║
 * ║  Usage:                                                                      ║
 * ║    const engine = new WorkflowEngine()                                       ║
 * ║    engine.registerWorkflow(myDefinition)                                     ║
 * ║    const exec = await engine.startExecution('my-workflow', { key: 'val' })   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { AiError, AiErrorCode, ServiceError } from '../../utils/errors.js'
import type {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowExecution,
  StepExecution,
  WorkflowCondition,
  WorkflowExecutionStatus,
  StepExecutionStatus,
} from './types.js'

// ── Helpers ──

let executionCounter = 0

function generateExecutionId(): string {
  return `exec-${Date.now()}-${++executionCounter}`
}

/**
 * Recursively interpolate `{{variable_name}}` tokens inside a value,
 * resolving them against the provided variables map.
 */
function interpolate(value: unknown, variables: Record<string, unknown>): unknown {
  if (typeof value === 'string') {
    return value.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      const resolved = variables[key]
      return resolved === undefined ? `{{${key}}}` : String(resolved)
    })
  }
  if (Array.isArray(value)) {
    return value.map((v) => interpolate(v, variables))
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = interpolate(v, variables)
    }
    return result
  }
  return value
}

// ── Engine ──

export class WorkflowEngine {
  private workflows = new Map<string, WorkflowDefinition>()
  private executions = new Map<string, WorkflowExecution>()
  private abortControllers = new Map<string, AbortController>()

  // ── Public API ──

  /** Register a workflow definition. Throws if id already registered. */
  registerWorkflow(definition: WorkflowDefinition): void {
    if (this.workflows.has(definition.id)) {
      throw new ServiceError(
        'workflow',
        `Workflow "${definition.id}" is already registered`,
        AiErrorCode.INVALID_INPUT,
        { workflowId: definition.id },
      )
    }
    // Validate DAG upfront so callers get an early error
    this.resolveStepDependencies(definition.steps)
    this.workflows.set(definition.id, definition)
  }

  /** Start executing a registered workflow, optionally overriding variables. */
  async startExecution(
    workflowId: string,
    variables?: Record<string, unknown>,
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new ServiceError(
        'workflow',
        `Workflow "${workflowId}" not found`,
        AiErrorCode.NOT_FOUND,
        { workflowId },
      )
    }

    const execution: WorkflowExecution = {
      id: generateExecutionId(),
      workflowId,
      status: 'pending',
      startedAt: Date.now(),
      steps: workflow.steps.map((s) => ({
        stepId: s.id,
        status: 'pending' as StepExecutionStatus,
        attempts: 0,
      })),
      variables: { ...workflow.variables, ...variables },
    }

    this.executions.set(execution.id, execution)

    const controller = new AbortController()
    this.abortControllers.set(execution.id, controller)

    execution.status = 'running'

    try {
      const order = this.resolveStepDependencies(workflow.steps)
      for (const stepId of order) {
        if (controller.signal.aborted) {
          execution.status = 'cancelled'
          break
        }

        const step = workflow.steps.find((s) => s.id === stepId)!
        if (step.type === 'parallel') {
          // Collect all steps that list this parallel step as a dependency-free group
          const parallelSteps = workflow.steps.filter((s) => step.dependencies.includes(s.id) === false && s.id !== step.id)
          await this.executeParallel(
            step.dependencies.length > 0
              ? workflow.steps.filter((s) => step.dependencies.includes(s.id))
              : [step],
            execution,
            controller.signal,
          )
        } else {
          await this.executeStep(step, execution, controller.signal)
        }
      }

      if (execution.status === 'running') {
        const anyFailed = execution.steps.some((s) => s.status === 'failed')
        execution.status = anyFailed ? 'failed' : 'completed'
      }
    } catch (error) {
      if (controller.signal.aborted) {
        execution.status = 'cancelled'
      } else {
        execution.status = 'failed'
        execution.error = error instanceof Error ? error.message : String(error)
      }
    } finally {
      execution.completedAt = Date.now()
      this.abortControllers.delete(execution.id)
    }

    return execution
  }

  /** Retrieve an execution by id. */
  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id)
  }

  /** Cancel a running execution. */
  cancelExecution(id: string): boolean {
    const execution = this.executions.get(id)
    if (!execution || execution.status !== 'running') return false
    const controller = this.abortControllers.get(id)
    if (controller) {
      controller.abort()
      execution.status = 'cancelled'
      execution.completedAt = Date.now()
      return true
    }
    return false
  }

  /** List executions, optionally filtered by workflow id. */
  listExecutions(workflowId?: string): WorkflowExecution[] {
    const all = [...this.executions.values()]
    return workflowId ? all.filter((e) => e.workflowId === workflowId) : all
  }

  /** List all registered workflow definitions. */
  listWorkflows(): WorkflowDefinition[] {
    return [...this.workflows.values()]
  }

  // ── Private: Step Execution ──

  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    signal: AbortSignal,
  ): Promise<void> {
    const stepExec = execution.steps.find((s) => s.stepId === step.id)
    if (!stepExec) return

    // Skip if already completed (e.g. via parallel)
    if (stepExec.status === 'completed' || stepExec.status === 'skipped') return

    stepExec.status = 'running'
    stepExec.startedAt = Date.now()

    const maxAttempts = (step.retries ?? 0) + 1

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (signal.aborted) {
        stepExec.status = 'skipped'
        return
      }
      stepExec.attempts = attempt

      try {
        const result = await this.executeStepWithTimeout(step, execution, signal)
        stepExec.status = 'completed'
        stepExec.result = result
        stepExec.completedAt = Date.now()

        // Store the result as a variable keyed by step id
        execution.variables[step.id] = result
        return
      } catch (error) {
        stepExec.error = error instanceof Error ? error.message : String(error)
        if (attempt === maxAttempts) {
          stepExec.status = 'failed'
          stepExec.completedAt = Date.now()

          // If there's an onFailure handler, don't propagate
          if (step.onFailure) {
            return
          }

          throw new ServiceError(
            'workflow',
            `Step "${step.id}" failed after ${maxAttempts} attempt(s): ${stepExec.error}`,
            AiErrorCode.SERVICE_UNAVAILABLE,
            { stepId: step.id, attempts: maxAttempts },
          )
        }
      }
    }
  }

  private async executeStepWithTimeout(
    step: WorkflowStep,
    execution: WorkflowExecution,
    parentSignal: AbortSignal,
  ): Promise<unknown> {
    if (!step.timeout) {
      return this.runStep(step, execution, parentSignal)
    }

    const stepController = new AbortController()

    // Link parent abort to step controller
    const onParentAbort = () => stepController.abort()
    parentSignal.addEventListener('abort', onParentAbort, { once: true })

    const timer = setTimeout(() => stepController.abort(), step.timeout)

    try {
      return await this.runStep(step, execution, stepController.signal)
    } catch (error) {
      if (stepController.signal.aborted && !parentSignal.aborted) {
        throw new AiError(
          `Step "${step.id}" timed out after ${step.timeout}ms`,
          AiErrorCode.TIMEOUT,
          { stepId: step.id, timeout: step.timeout },
        )
      }
      throw error
    } finally {
      clearTimeout(timer)
      parentSignal.removeEventListener('abort', onParentAbort)
    }
  }

  private async runStep(
    step: WorkflowStep,
    execution: WorkflowExecution,
    signal?: AbortSignal,
  ): Promise<unknown> {
    const vars = execution.variables

    switch (step.type) {
      case 'condition': {
        if (!step.condition) {
          throw new AiError(
            `Step "${step.id}" is type "condition" but has no condition defined`,
            AiErrorCode.INVALID_INPUT,
          )
        }
        return this.evaluateCondition(step.condition, vars)
      }

      case 'wait': {
        const ms = (step.action?.config?.durationMs as number) ?? 0
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, ms)
          if (signal) {
            const onAbort = () => {
              clearTimeout(timer)
              reject(new AiError(`Step "${step.id}" was aborted`, AiErrorCode.TIMEOUT))
            }
            if (signal.aborted) {
              clearTimeout(timer)
              reject(new AiError(`Step "${step.id}" was aborted`, AiErrorCode.TIMEOUT))
              return
            }
            signal.addEventListener('abort', onAbort, { once: true })
          }
        })
        return { waited: ms }
      }

      case 'loop': {
        const items = (vars[(step.action?.config?.itemsVar as string) ?? ''] ?? []) as unknown[]
        const results: unknown[] = []
        for (const item of items) {
          execution.variables['_loopItem'] = item
          results.push(interpolate(step.action?.config?.template ?? '{{_loopItem}}', execution.variables))
        }
        return results
      }

      case 'action': {
        if (!step.action) {
          throw new AiError(
            `Step "${step.id}" is type "action" but has no action defined`,
            AiErrorCode.INVALID_INPUT,
          )
        }
        const interpolatedConfig = interpolate(step.action.config, vars) as Record<string, unknown>
        // Return the interpolated config as the "result" — real integrations
        // would dispatch to tool_call / llm_request / http_request here.
        return { type: step.action.type, config: interpolatedConfig }
      }

      case 'parallel': {
        // Parallel steps are handled by executeParallel; if we get here
        // it means the step itself is a no-op marker.
        return { parallel: true }
      }

      default:
        throw new AiError(
          `Unknown step type "${step.type}" in step "${step.id}"`,
          AiErrorCode.INVALID_INPUT,
        )
    }
  }

  // ── Private: Condition Evaluation ──

  evaluateCondition(condition: WorkflowCondition, variables: Record<string, unknown>): boolean {
    const fieldValue = variables[condition.field]
    const target = condition.value

    switch (condition.operator) {
      case 'eq':
        return fieldValue === target
      case 'neq':
        return fieldValue !== target
      case 'gt':
        return (fieldValue as number) > (target as number)
      case 'lt':
        return (fieldValue as number) < (target as number)
      case 'contains':
        if (typeof fieldValue === 'string' && typeof target === 'string') {
          return fieldValue.includes(target)
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(target)
        }
        return false
      case 'matches':
        if (typeof fieldValue === 'string' && typeof target === 'string') {
          return new RegExp(target).test(fieldValue)
        }
        return false
      default:
        return false
    }
  }

  // ── Private: DAG Resolution ──

  /**
   * Topological sort of steps using Kahn's algorithm.
   * Throws if a cycle is detected.
   */
  resolveStepDependencies(steps: WorkflowStep[]): string[] {
    const ids = new Set(steps.map((s) => s.id))
    const inDegree = new Map<string, number>()
    const adjacency = new Map<string, string[]>()

    for (const step of steps) {
      inDegree.set(step.id, 0)
      adjacency.set(step.id, [])
    }

    for (const step of steps) {
      for (const dep of step.dependencies) {
        if (!ids.has(dep)) {
          throw new ServiceError(
            'workflow',
            `Step "${step.id}" depends on unknown step "${dep}"`,
            AiErrorCode.INVALID_INPUT,
            { stepId: step.id, dependency: dep },
          )
        }
        adjacency.get(dep)!.push(step.id)
        inDegree.set(step.id, (inDegree.get(step.id) ?? 0) + 1)
      }
    }

    const queue: string[] = []
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id)
    }

    const sorted: string[] = []
    while (queue.length > 0) {
      const current = queue.shift()!
      sorted.push(current)
      for (const neighbor of adjacency.get(current) ?? []) {
        const newDegree = (inDegree.get(neighbor) ?? 1) - 1
        inDegree.set(neighbor, newDegree)
        if (newDegree === 0) queue.push(neighbor)
      }
    }

    if (sorted.length !== steps.length) {
      const inCycle = steps
        .filter((s) => !sorted.includes(s.id))
        .map((s) => s.id)
      throw new ServiceError(
        'workflow',
        `Cycle detected in workflow steps: ${inCycle.join(' → ')}`,
        AiErrorCode.INVALID_INPUT,
        { cycle: inCycle },
      )
    }

    return sorted
  }

  // ── Private: Parallel Execution ──

  private async executeParallel(
    steps: WorkflowStep[],
    execution: WorkflowExecution,
    signal: AbortSignal,
  ): Promise<void> {
    await Promise.all(
      steps.map((step) => this.executeStep(step, execution, signal).catch(() => {
        // Errors are recorded in step execution; don't let one rejection cancel siblings
      })),
    )
  }
}
