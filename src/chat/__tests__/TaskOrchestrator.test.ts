import { describe, it, expect, beforeEach } from 'vitest'
import {
  TaskOrchestrator,
  type TaskPlan,
  type TaskStep,
} from '../TaskOrchestrator'

// ── Constructor Tests ──

describe('TaskOrchestrator constructor', () => {
  it('creates an instance with default config', () => {
    const orchestrator = new TaskOrchestrator()
    expect(orchestrator).toBeInstanceOf(TaskOrchestrator)
  })

  it('accepts a partial custom config', () => {
    const orchestrator = new TaskOrchestrator({ maxTasks: 10 })
    expect(orchestrator).toBeInstanceOf(TaskOrchestrator)
  })

  it('accepts a full custom config', () => {
    const orchestrator = new TaskOrchestrator({
      maxTasks: 5,
      maxStepsPerTask: 15,
      enableParallelDetection: false,
      enableBacktracking: false,
      stepTimeoutMs: 60_000,
      maxRetries: 1,
    })
    expect(orchestrator).toBeInstanceOf(TaskOrchestrator)
  })
})

// ── decomposeGoal Tests ──

describe('TaskOrchestrator decomposeGoal', () => {
  let orchestrator: TaskOrchestrator

  beforeEach(() => {
    orchestrator = new TaskOrchestrator()
  })

  it('returns a TaskPlan with required fields', () => {
    const plan = orchestrator.decomposeGoal('Build a REST API for user management')
    expect(typeof plan.id).toBe('string')
    expect(plan.id.length).toBeGreaterThan(0)
    expect(plan.description).toBe('Build a REST API for user management')
    expect(Array.isArray(plan.steps)).toBe(true)
    expect(plan.steps.length).toBeGreaterThan(0)
    expect(typeof plan.createdAt).toBe('number')
    expect(typeof plan.updatedAt).toBe('number')
    expect(Array.isArray(plan.constraints)).toBe(true)
  })

  it('matches a known template and falls back to keywords for unknown tasks', () => {
    const apiPlan = orchestrator.decomposeGoal('Build a REST API endpoint for the backend server')
    const stepNames = apiPlan.steps.map(s => s.name.toLowerCase())
    expect(stepNames.some(n => n.includes('api'))).toBe(true)

    const unknownPlan = orchestrator.decomposeGoal('Generate a quarterly financial report from raw data')
    const types = unknownPlan.steps.map(s => s.type)
    expect(types).toContain('design')
    expect(types).toContain('implement')
    expect(types).toContain('test')
  })

  it('stores constraints and throws when maxTasks limit is reached', () => {
    const plan = orchestrator.decomposeGoal('Build a chat app', ['must be real-time', 'use WebSocket'])
    expect(plan.constraints).toContain('must be real-time')
    expect(plan.constraints).toContain('use WebSocket')

    const small = new TaskOrchestrator({ maxTasks: 1 })
    small.decomposeGoal('Task 1')
    expect(() => small.decomposeGoal('Task 2')).toThrow(/maximum task limit/i)
  })

  it('each step has required fields with correct initial state', () => {
    const plan = orchestrator.decomposeGoal('Build a REST API server backend')
    for (const step of plan.steps) {
      expect(typeof step.id).toBe('string')
      expect(step.id.length).toBeGreaterThan(0)
      expect(typeof step.name).toBe('string')
      expect(typeof step.description).toBe('string')
      expect(typeof step.type).toBe('string')
      expect(Array.isArray(step.dependencies)).toBe(true)
      expect(step.state).toBe('pending')
      expect(typeof step.estimatedComplexity).toBe('number')
      expect(step.retryCount).toBe(0)
    }
  })
})

// ── startTask / getTaskStatus Tests ──

describe('TaskOrchestrator startTask and getTaskStatus', () => {
  let orchestrator: TaskOrchestrator
  let plan: TaskPlan

  beforeEach(() => {
    orchestrator = new TaskOrchestrator()
    plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
  })

  it('starts a pending task, transitions to in_progress, and throws on double-start', () => {
    orchestrator.startTask(plan.id)
    const status = orchestrator.getTaskStatus(plan.id)
    expect(status.state).toBe('in_progress')
    expect(status.taskId).toBe(plan.id)
    expect(typeof status.startedAt).toBe('number')
    expect(() => orchestrator.startTask(plan.id)).toThrow(/cannot start/i)
  })

  it('getTaskStatus returns correct progress fields for a freshly started task', () => {
    orchestrator.startTask(plan.id)
    const status = orchestrator.getTaskStatus(plan.id)
    expect(status.completedSteps).toBe(0)
    expect(status.totalSteps).toBe(plan.steps.length)
    expect(status.progressPercent).toBe(0)
    expect(typeof status.summary).toBe('string')
    expect(status.estimatedRemainingSteps).toBe(plan.steps.length)
  })
})

// ── advanceStep / beginStep / failStep / skipStep Tests ──

describe('TaskOrchestrator step lifecycle', () => {
  let orchestrator: TaskOrchestrator
  let plan: TaskPlan

  beforeEach(() => {
    orchestrator = new TaskOrchestrator()
    plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    orchestrator.startTask(plan.id)
  })

  it('beginStep marks a step as in_progress', () => {
    const executable = orchestrator.getExecutableSteps(plan.id)
    expect(executable.length).toBeGreaterThan(0)
    orchestrator.beginStep(executable[0].id)
    const status = orchestrator.getTaskStatus(plan.id)
    expect(status.currentStep).not.toBeNull()
    expect(status.currentStep!.id).toBe(executable[0].id)
  })

  it('advanceStep completes a step and resolves downstream dependencies', () => {
    const executable = orchestrator.getExecutableSteps(plan.id)
    orchestrator.beginStep(executable[0].id)
    orchestrator.advanceStep(executable[0].id, { success: true, output: 'Done', duration: 100, artifacts: [] })
    const status = orchestrator.getTaskStatus(plan.id)
    expect(status.completedSteps).toBe(1)
    expect(status.progressPercent).toBeGreaterThan(0)
  })

  it('failStep retries when retries remain and marks failed when exhausted', () => {
    const executable = orchestrator.getExecutableSteps(plan.id)
    orchestrator.beginStep(executable[0].id)
    orchestrator.failStep(executable[0].id, 'Network error')
    const step = plan.steps.find(s => s.id === executable[0].id)!
    expect(step.state).toBe('pending')
    expect(step.retryCount).toBe(1)

    const orch = new TaskOrchestrator({ maxRetries: 0 })
    const p = orch.decomposeGoal('Build a REST API endpoint for backend server')
    orch.startTask(p.id)
    const exec = orch.getExecutableSteps(p.id)
    orch.beginStep(exec[0].id)
    orch.failStep(exec[0].id, 'Permanent error')
    expect(p.steps.find(s => s.id === exec[0].id)!.state).toBe('failed')
  })

  it('skipStep marks a step as skipped and throws for in_progress steps', () => {
    const executable = orchestrator.getExecutableSteps(plan.id)
    orchestrator.skipStep(executable[0].id)
    expect(plan.steps.find(s => s.id === executable[0].id)!.state).toBe('skipped')

    const plan2 = orchestrator.decomposeGoal('Debug a fix for bug issue error crash')
    orchestrator.startTask(plan2.id)
    const exec2 = orchestrator.getExecutableSteps(plan2.id)
    orchestrator.beginStep(exec2[0].id)
    expect(() => orchestrator.skipStep(exec2[0].id)).toThrow(/cannot skip/i)
  })
})

// ── detectTimeouts Tests ──

describe('TaskOrchestrator detectTimeouts', () => {
  it('returns empty when no steps are timed out and detects stuck steps', () => {
    const orchestrator = new TaskOrchestrator({ stepTimeoutMs: 1 })
    const plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    orchestrator.startTask(plan.id)
    expect(orchestrator.detectTimeouts(plan.id)).toEqual([])

    const exec = orchestrator.getExecutableSteps(plan.id)
    orchestrator.beginStep(exec[0].id)
    plan.steps.find(s => s.id === exec[0].id)!.startedAt = Date.now() - 100
    expect(orchestrator.detectTimeouts(plan.id)).toContain(exec[0].id)
  })
})

// ── canExecute / getExecutableSteps / getBlockedSteps Tests ──

describe('TaskOrchestrator DAG operations', () => {
  let orchestrator: TaskOrchestrator
  let plan: TaskPlan

  beforeEach(() => {
    orchestrator = new TaskOrchestrator()
    plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    orchestrator.startTask(plan.id)
  })

  it('canExecute returns true for ready steps and false for blocked steps', () => {
    const executable = orchestrator.getExecutableSteps(plan.id)
    expect(executable.length).toBeGreaterThan(0)
    expect(orchestrator.canExecute(executable[0].id)).toBe(true)

    const blocked = orchestrator.getBlockedSteps(plan.id)
    if (blocked.length > 0) {
      expect(orchestrator.canExecute(blocked[0].id)).toBe(false)
    }
  })

  it('getExecutableSteps returns pending steps with met deps and getBlockedSteps returns waiting steps', () => {
    const executable = orchestrator.getExecutableSteps(plan.id)
    for (const step of executable) {
      expect(step.state).toBe('pending')
      expect(step.dependencies.length).toBe(0)
    }
    const blocked = orchestrator.getBlockedSteps(plan.id)
    for (const step of blocked) {
      expect(step.dependencies.length).toBeGreaterThan(0)
    }
  })
})

// ── hasCycle / getCriticalPath Tests ──

describe('TaskOrchestrator cycle detection and critical path', () => {
  it('hasCycle returns false for valid plans and getCriticalPath returns valid step IDs', () => {
    const orchestrator = new TaskOrchestrator()
    const plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    expect(orchestrator.hasCycle(plan.id)).toBe(false)

    const criticalPath = orchestrator.getCriticalPath(plan.id)
    expect(criticalPath.length).toBeGreaterThan(0)
    const stepIds = new Set(plan.steps.map(s => s.id))
    for (const id of criticalPath) {
      expect(stepIds.has(id)).toBe(true)
    }
  })
})

// ── Progress Tracking Tests ──

describe('TaskOrchestrator progress tracking', () => {
  let orchestrator: TaskOrchestrator
  let plan: TaskPlan

  beforeEach(() => {
    orchestrator = new TaskOrchestrator()
    plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    orchestrator.startTask(plan.id)
  })

  it('getProgress returns a ProgressReport with required fields', () => {
    const progress = orchestrator.getProgress(plan.id)
    expect(progress.taskId).toBe(plan.id)
    expect(typeof progress.taskName).toBe('string')
    expect(typeof progress.progressPercent).toBe('number')
    expect(typeof progress.currentPhase).toBe('string')
    expect(Array.isArray(progress.completedSteps)).toBe(true)
    expect(Array.isArray(progress.pendingSteps)).toBe(true)
    expect(Array.isArray(progress.blockedSteps)).toBe(true)
    expect(typeof progress.timeElapsedMs).toBe('number')
    expect(typeof progress.estimatedRemainingMs).toBe('number')
  })

  it('getReachedMilestones returns empty and getProgressSummary is readable when no steps are completed', () => {
    expect(orchestrator.getReachedMilestones(plan.id)).toEqual([])
    const summary = orchestrator.getProgressSummary(plan.id)
    expect(typeof summary).toBe('string')
    expect(summary).toContain('complete')
  })

  it('getStepTimings returns timing data for each step', () => {
    const timings = orchestrator.getStepTimings(plan.id)
    expect(timings.length).toBe(plan.steps.length)
    for (const timing of timings) {
      expect(typeof timing.stepName).toBe('string')
      expect(typeof timing.durationMs).toBe('number')
      expect(typeof timing.state).toBe('string')
    }
  })
})

// ── Backtracking & Recovery Tests ──

describe('TaskOrchestrator backtracking and recovery', () => {
  let orchestrator: TaskOrchestrator
  let plan: TaskPlan

  beforeEach(() => {
    orchestrator = new TaskOrchestrator()
    plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    orchestrator.startTask(plan.id)
  })

  it('backtrack resets steps from the target step onward', () => {
    const exec = orchestrator.getExecutableSteps(plan.id)
    orchestrator.beginStep(exec[0].id)
    orchestrator.advanceStep(exec[0].id, { success: true, output: 'Done', duration: 50 })
    const nextExec = orchestrator.getExecutableSteps(plan.id)
    if (nextExec.length > 0) {
      orchestrator.beginStep(nextExec[0].id)
      orchestrator.backtrack(plan.id, nextExec[0].id)
      expect(plan.steps.find(s => s.id === nextExec[0].id)!.state).toBe('pending')
    }
  })

  it('throws when backtracking is disabled', () => {
    const orch = new TaskOrchestrator({ enableBacktracking: false })
    const p = orch.decomposeGoal('Build a REST API endpoint for backend server')
    orch.startTask(p.id)
    expect(() => orch.backtrack(p.id, p.steps[0].id)).toThrow(/backtracking is disabled/i)
  })

  it('replan preserves completed steps and adds replan reason to constraints', () => {
    const exec = orchestrator.getExecutableSteps(plan.id)
    orchestrator.beginStep(exec[0].id)
    orchestrator.advanceStep(exec[0].id)
    const originalCompleted = plan.steps.filter(s => s.state === 'completed').length
    const updatedPlan = orchestrator.replan(plan.id, 'requirements changed')
    expect(updatedPlan.steps.filter(s => s.state === 'completed').length).toBe(originalCompleted)
    expect(updatedPlan.constraints).toContain('Replan reason: requirements changed')
  })
})

// ── getRetryInfo / generateAlternativePath Tests ──

describe('TaskOrchestrator retry and alternative path', () => {
  it('getRetryInfo returns null before failures and retry data after a failure', () => {
    const orchestrator = new TaskOrchestrator()
    const plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    orchestrator.startTask(plan.id)
    const exec = orchestrator.getExecutableSteps(plan.id)
    expect(orchestrator.getRetryInfo(plan.id, exec[0].id)).toBeNull()

    orchestrator.beginStep(exec[0].id)
    orchestrator.failStep(exec[0].id, 'Transient error')
    const info = orchestrator.getRetryInfo(plan.id, exec[0].id)
    expect(info).not.toBeNull()
    expect(info!.attempts).toBe(1)
    expect(typeof info!.maxRetries).toBe('number')
    expect(typeof info!.nextBackoffMs).toBe('number')
  })

  it('generateAlternativePath returns three alternative steps for a step', () => {
    const orchestrator = new TaskOrchestrator()
    const plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    orchestrator.startTask(plan.id)
    const exec = orchestrator.getExecutableSteps(plan.id)
    const alternatives = orchestrator.generateAlternativePath(plan.id, exec[0].id)
    expect(alternatives.length).toBe(3)
    expect(alternatives[0].type).toBe('analyze')
    expect(alternatives[2].type).toBe('test')
  })
})

// ── findParallelGroups / hasResourceConflict Tests ──

describe('TaskOrchestrator parallel detection', () => {
  it('findParallelGroups returns empty when parallel detection is disabled', () => {
    const orchestrator = new TaskOrchestrator({ enableParallelDetection: false })
    const plan = orchestrator.decomposeGoal('Setup a new project scaffold bootstrap')
    orchestrator.startTask(plan.id)
    expect(orchestrator.findParallelGroups(plan.id)).toEqual([])
  })

  it('hasResourceConflict detects deploy conflicts and allows independent types', () => {
    const orchestrator = new TaskOrchestrator()
    const deployA: TaskStep = {
      id: 'a', name: 'Deploy A', description: '', type: 'deploy',
      dependencies: [], state: 'pending', estimatedComplexity: 3, retryCount: 0,
    }
    const deployB: TaskStep = {
      id: 'b', name: 'Deploy B', description: '', type: 'deploy',
      dependencies: [], state: 'pending', estimatedComplexity: 3, retryCount: 0,
    }
    expect(orchestrator.hasResourceConflict(deployA, deployB)).toBe(true)

    const testStep: TaskStep = {
      id: 'c', name: 'Test', description: '', type: 'test',
      dependencies: [], state: 'pending', estimatedComplexity: 3, retryCount: 0,
    }
    const docStep: TaskStep = {
      id: 'd', name: 'Document', description: '', type: 'document',
      dependencies: [], state: 'pending', estimatedComplexity: 2, retryCount: 0,
    }
    expect(orchestrator.hasResourceConflict(testStep, docStep)).toBe(false)
  })
})

// ── Active Task Management Tests ──

describe('TaskOrchestrator active task management', () => {
  let orchestrator: TaskOrchestrator

  beforeEach(() => {
    orchestrator = new TaskOrchestrator()
  })

  it('getActiveTask returns null when no tasks are active and returns the active task after start', () => {
    expect(orchestrator.getActiveTask()).toBeNull()

    const plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    orchestrator.startTask(plan.id)
    const active = orchestrator.getActiveTask()
    expect(active).not.toBeNull()
    expect(active!.taskId).toBe(plan.id)
    expect(active!.state).toBe('in_progress')
  })

  it('getAllActiveTasks returns all in-progress tasks', () => {
    const plan1 = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    const plan2 = orchestrator.decomposeGoal('Debug a fix for bug issue error crash')
    orchestrator.startTask(plan1.id)
    orchestrator.startTask(plan2.id)
    expect(orchestrator.getAllActiveTasks().length).toBe(2)
  })

  it('pauseTask and resumeTask transition task state correctly', () => {
    const plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    orchestrator.startTask(plan.id)
    orchestrator.pauseTask(plan.id)
    expect(orchestrator.getTaskStatus(plan.id).state).toBe('pending')

    const status = orchestrator.resumeTask(plan.id)
    expect(status.state).toBe('in_progress')
  })
})

// ── getTaskPlan Tests ──

describe('TaskOrchestrator getTaskPlan', () => {
  it('returns undefined for a non-existent task and the plan after decomposition', () => {
    const orchestrator = new TaskOrchestrator()
    expect(orchestrator.getTaskPlan('non-existent')).toBeUndefined()

    const plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    const retrieved = orchestrator.getTaskPlan(plan.id)
    expect(retrieved).toBeDefined()
    expect(retrieved!.id).toBe(plan.id)
  })
})

// ── Feedback & Stats Tests ──

describe('TaskOrchestrator feedback and stats', () => {
  let orchestrator: TaskOrchestrator

  beforeEach(() => {
    orchestrator = new TaskOrchestrator()
  })

  it('feedback increments the feedbackCount and getStats returns all required fields', () => {
    orchestrator.feedback(true, 'Good decomposition')
    orchestrator.feedback(false, 'Too many steps')
    const stats = orchestrator.getStats()
    expect(stats.feedbackCount).toBe(2)
    expect(typeof stats.totalTasksCreated).toBe('number')
    expect(typeof stats.totalTasksCompleted).toBe('number')
    expect(typeof stats.totalTasksFailed).toBe('number')
    expect(typeof stats.totalStepsExecuted).toBe('number')
    expect(typeof stats.totalRetries).toBe('number')
    expect(typeof stats.totalBacktracks).toBe('number')
    expect(typeof stats.totalReplans).toBe('number')
    expect(typeof stats.activeTaskCount).toBe('number')
    expect(typeof stats.avgStepsPerTask).toBe('number')
    expect(typeof stats.feedbackCount).toBe('number')
  })

  it('stats reflect task creation and step execution', () => {
    const plan = orchestrator.decomposeGoal('Build a REST API endpoint for backend server')
    orchestrator.startTask(plan.id)
    const exec = orchestrator.getExecutableSteps(plan.id)
    orchestrator.beginStep(exec[0].id)
    orchestrator.advanceStep(exec[0].id)
    const stats = orchestrator.getStats()
    expect(stats.totalTasksCreated).toBe(1)
    expect(stats.totalStepsExecuted).toBe(1)
    expect(stats.activeTaskCount).toBe(1)
  })
})

// ── Serialization Tests ──

describe('TaskOrchestrator serialize and deserialize', () => {
  it('serialize returns valid JSON and deserialize restores full state', () => {
    const original = new TaskOrchestrator()
    const plan = original.decomposeGoal('Build a REST API endpoint for backend server')
    original.startTask(plan.id)
    original.feedback(true, 'good')

    const json = original.serialize()
    expect(typeof json).toBe('string')
    const parsed = JSON.parse(json)
    expect(parsed.version).toBe(1)
    expect(parsed.config).toBeDefined()
    expect(Array.isArray(parsed.tasks)).toBe(true)

    const restored = TaskOrchestrator.deserialize(json)
    expect(restored).toBeInstanceOf(TaskOrchestrator)
    const status = restored.getTaskStatus(plan.id)
    expect(status.taskId).toBe(plan.id)
    expect(status.state).toBe('in_progress')
    expect(status.totalSteps).toBe(plan.steps.length)

    const stats = restored.getStats()
    expect(stats.totalTasksCreated).toBe(1)
    expect(stats.feedbackCount).toBe(1)
  })
})
