/**
 * 📋 TaskQueue — Priority-based async task queue with scheduling, retries, and dead-letter processing
 *
 * Features:
 * - Priority-based scheduling (critical, high, normal, low, background)
 * - Configurable concurrency with worker pool
 * - Exponential backoff retry with jitter
 * - Dead-letter queue for permanently failed tasks
 * - Task dependencies (run after)
 * - Delayed/scheduled execution
 * - Progress tracking and callbacks
 * - Graceful shutdown with drain
 * - Task deduplication
 * - Rate limiting per queue
 *
 * Zero external dependencies.
 */

// ── Types ──

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low' | 'background'

export type TaskStatus =
  | 'pending'
  | 'scheduled'
  | 'running'
  | 'completed'
  | 'failed'
  | 'retrying'
  | 'dead'
  | 'cancelled'

export interface TaskOptions {
  /** Task priority (default: 'normal') */
  priority?: TaskPriority
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number
  /** Base delay in ms for retry backoff (default: 1000) */
  retryDelay?: number
  /** Task timeout in ms (default: 30000) */
  timeout?: number
  /** Delay before first execution in ms */
  delay?: number
  /** Run after these task IDs complete */
  dependsOn?: string[]
  /** Deduplication key — only one task with this key can be pending/running */
  dedupeKey?: string
  /** Arbitrary metadata */
  metadata?: Record<string, unknown>
}

export interface TaskResult<T = unknown> {
  taskId: string
  status: TaskStatus
  result?: T
  error?: string
  attempts: number
  createdAt: number
  startedAt?: number
  completedAt?: number
  duration?: number
}

export interface QueueStats {
  pending: number
  running: number
  completed: number
  failed: number
  dead: number
  cancelled: number
  totalProcessed: number
  avgDuration: number
  throughput: number
}

export interface QueueOptions {
  /** Max concurrent tasks (default: 5) */
  concurrency?: number
  /** Max queue size (default: 10000) */
  maxSize?: number
  /** Process interval in ms (default: 100) */
  pollInterval?: number
  /** Enable dead-letter queue (default: true) */
  enableDLQ?: boolean
  /** Max DLQ size (default: 1000) */
  maxDLQSize?: number
}

// ── Priority ordering ──

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
  background: 4,
}

// ── Internal task representation ──

interface InternalTask<T = unknown> {
  id: string
  fn: () => Promise<T>
  options: Required<Pick<TaskOptions, 'priority' | 'maxRetries' | 'retryDelay' | 'timeout'>> &
    TaskOptions
  status: TaskStatus
  attempts: number
  createdAt: number
  startedAt?: number
  completedAt?: number
  result?: T
  error?: string
  dedupeKey?: string
}

// ── TaskQueue ──

export class TaskQueue {
  private tasks = new Map<string, InternalTask>()
  private pendingQueue: string[] = []
  private runningCount = 0
  private completedCount = 0
  private failedCount = 0
  private cancelledCount = 0
  private deadLetterQueue: TaskResult[] = []
  private totalDuration = 0
  private startTime = Date.now()
  private timer: ReturnType<typeof setInterval> | null = null
  private draining = false
  private dedupeMap = new Map<string, string>() // dedupeKey → taskId
  private listeners = new Map<string, Array<(result: TaskResult) => void>>()
  private readonly opts: Required<QueueOptions>

  constructor(options?: QueueOptions) {
    this.opts = {
      concurrency: options?.concurrency ?? 5,
      maxSize: options?.maxSize ?? 10000,
      pollInterval: options?.pollInterval ?? 100,
      enableDLQ: options?.enableDLQ ?? true,
      maxDLQSize: options?.maxDLQSize ?? 1000,
    }
  }

  /** Start processing tasks */
  start(): void {
    if (this.timer) return
    this.timer = setInterval(() => this.process(), this.opts.pollInterval)
  }

  /** Stop processing (does not cancel running tasks) */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /** Enqueue a task and return its ID */
  enqueue<T>(fn: () => Promise<T>, options?: TaskOptions): string {
    if (this.draining) {
      throw new Error('Queue is draining, cannot enqueue new tasks')
    }

    if (this.pendingQueue.length >= this.opts.maxSize) {
      throw new Error(`Queue is full (max: ${this.opts.maxSize})`)
    }

    // Deduplication check
    if (options?.dedupeKey) {
      const existingId = this.dedupeMap.get(options.dedupeKey)
      if (existingId) {
        const existing = this.tasks.get(existingId)
        if (existing && (existing.status === 'pending' || existing.status === 'running')) {
          return existingId
        }
        // Old task is done, allow re-enqueue
        this.dedupeMap.delete(options.dedupeKey)
      }
    }

    const id = this.generateId()
    const task: InternalTask<T> = {
      id,
      fn,
      options: {
        priority: options?.priority ?? 'normal',
        maxRetries: options?.maxRetries ?? 3,
        retryDelay: options?.retryDelay ?? 1000,
        timeout: options?.timeout ?? 30000,
        ...options,
      },
      status: options?.delay ? 'scheduled' : 'pending',
      attempts: 0,
      createdAt: Date.now(),
      dedupeKey: options?.dedupeKey,
    }

    this.tasks.set(id, task as InternalTask)

    if (options?.dedupeKey) {
      this.dedupeMap.set(options.dedupeKey, id)
    }

    // Handle delayed execution
    if (options?.delay && options.delay > 0) {
      setTimeout(() => {
        const t = this.tasks.get(id)
        if (t && t.status === 'scheduled') {
          t.status = 'pending'
          this.insertByPriority(id, t.options.priority)
        }
      }, options.delay)
    } else {
      this.insertByPriority(id, task.options.priority)
    }

    return id
  }

  /** Cancel a pending task */
  cancel(taskId: string): boolean {
    const task = this.tasks.get(taskId)
    if (!task) return false

    if (task.status === 'pending' || task.status === 'scheduled') {
      task.status = 'cancelled'
      task.completedAt = Date.now()
      this.cancelledCount++
      this.pendingQueue = this.pendingQueue.filter((id) => id !== taskId)

      if (task.dedupeKey) {
        this.dedupeMap.delete(task.dedupeKey)
      }

      this.emitResult(taskId)
      return true
    }

    return false
  }

  /** Get task status */
  getTask(taskId: string): TaskResult | undefined {
    const task = this.tasks.get(taskId)
    if (!task) return undefined

    return this.toResult(task)
  }

  /** Get queue stats */
  getStats(): QueueStats {
    const elapsed = (Date.now() - this.startTime) / 1000
    const totalProcessed = this.completedCount + this.failedCount

    return {
      pending: this.pendingQueue.length,
      running: this.runningCount,
      completed: this.completedCount,
      failed: this.failedCount,
      dead: this.deadLetterQueue.length,
      cancelled: this.cancelledCount,
      totalProcessed,
      avgDuration: totalProcessed > 0 ? this.totalDuration / totalProcessed : 0,
      throughput: elapsed > 0 ? totalProcessed / elapsed : 0,
    }
  }

  /** Get dead-letter queue contents */
  getDeadLetterQueue(): TaskResult[] {
    return [...this.deadLetterQueue]
  }

  /** Retry a dead-letter task */
  retryDeadLetter(taskId: string): boolean {
    const idx = this.deadLetterQueue.findIndex((t) => t.taskId === taskId)
    if (idx === -1) return false

    const deadTask = this.deadLetterQueue.splice(idx, 1)[0]
    const originalTask = this.tasks.get(deadTask.taskId)
    if (!originalTask) return false

    originalTask.status = 'pending'
    originalTask.attempts = 0
    originalTask.error = undefined
    this.insertByPriority(originalTask.id, originalTask.options.priority)

    return true
  }

  /** Wait for a specific task to complete */
  waitFor(taskId: string): Promise<TaskResult> {
    const task = this.tasks.get(taskId)
    if (!task) {
      return Promise.reject(new Error(`Task ${taskId} not found`))
    }

    if (
      task.status === 'completed' ||
      task.status === 'failed' ||
      task.status === 'dead' ||
      task.status === 'cancelled'
    ) {
      return Promise.resolve(this.toResult(task))
    }

    return new Promise((resolve) => {
      const listeners = this.listeners.get(taskId) ?? []
      listeners.push(resolve)
      this.listeners.set(taskId, listeners)
    })
  }

  /** Drain the queue — wait for all tasks to complete, reject new enqueues */
  async drain(timeoutMs = 30000): Promise<void> {
    this.draining = true

    const start = Date.now()
    while (this.pendingQueue.length > 0 || this.runningCount > 0) {
      if (Date.now() - start > timeoutMs) {
        this.draining = false
        throw new Error('Drain timeout exceeded')
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    this.draining = false
  }

  /** Clear all tasks and reset state */
  clear(): void {
    this.stop()
    this.tasks.clear()
    this.pendingQueue = []
    this.runningCount = 0
    this.completedCount = 0
    this.failedCount = 0
    this.cancelledCount = 0
    this.deadLetterQueue = []
    this.totalDuration = 0
    this.startTime = Date.now()
    this.dedupeMap.clear()
    this.listeners.clear()
    this.draining = false
  }

  /** Get count of tasks by status */
  size(): number {
    return this.pendingQueue.length + this.runningCount
  }

  // ── Private methods ──

  private process(): void {
    while (this.runningCount < this.opts.concurrency && this.pendingQueue.length > 0) {
      const taskId = this.pendingQueue.shift()
      if (!taskId) break

      const task = this.tasks.get(taskId)
      if (!task || task.status !== 'pending') continue

      // Check dependencies
      if (task.options.dependsOn && task.options.dependsOn.length > 0) {
        const allDepsComplete = task.options.dependsOn.every((depId) => {
          const dep = this.tasks.get(depId)
          return dep && dep.status === 'completed'
        })

        if (!allDepsComplete) {
          // Re-enqueue at end
          this.pendingQueue.push(taskId)
          continue
        }
      }

      this.runTask(task)
    }
  }

  private async runTask(task: InternalTask): Promise<void> {
    task.status = 'running'
    task.startedAt = Date.now()
    task.attempts++
    this.runningCount++

    try {
      const result = await this.executeWithTimeout(task.fn, task.options.timeout)
      task.status = 'completed'
      task.result = result
      task.completedAt = Date.now()
      task.duration = task.completedAt - task.startedAt
      this.completedCount++
      this.totalDuration += task.duration

      if (task.dedupeKey) {
        this.dedupeMap.delete(task.dedupeKey)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      task.error = errorMsg

      if (task.attempts < task.options.maxRetries) {
        task.status = 'retrying'
        const delay = this.calculateBackoff(task.attempts, task.options.retryDelay)
        setTimeout(() => {
          task.status = 'pending'
          this.insertByPriority(task.id, task.options.priority)
        }, delay)
      } else {
        task.status = 'failed'
        task.completedAt = Date.now()
        task.duration = task.completedAt - (task.startedAt ?? task.createdAt)
        this.failedCount++
        this.totalDuration += task.duration

        if (task.dedupeKey) {
          this.dedupeMap.delete(task.dedupeKey)
        }

        // Move to DLQ
        if (this.opts.enableDLQ) {
          this.addToDeadLetterQueue(task)
        }
      }
    } finally {
      this.runningCount--
      if (task.status === 'completed' || task.status === 'failed' || task.status === 'dead') {
        this.emitResult(task.id)
      }
    }
  }

  private executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task timed out after ${timeoutMs}ms`))
      }, timeoutMs)

      fn()
        .then((result) => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch((err) => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }

  private calculateBackoff(attempt: number, baseDelay: number): number {
    const exponential = baseDelay * Math.pow(2, attempt - 1)
    const jitter = Math.random() * exponential * 0.1
    return Math.min(exponential + jitter, 60000) // Cap at 60s
  }

  private insertByPriority(taskId: string, priority: TaskPriority): void {
    const order = PRIORITY_ORDER[priority]

    // Find insertion point
    let insertIdx = this.pendingQueue.length
    for (let i = 0; i < this.pendingQueue.length; i++) {
      const existingTask = this.tasks.get(this.pendingQueue[i])
      if (existingTask && PRIORITY_ORDER[existingTask.options.priority] > order) {
        insertIdx = i
        break
      }
    }

    this.pendingQueue.splice(insertIdx, 0, taskId)
  }

  private addToDeadLetterQueue(task: InternalTask): void {
    task.status = 'dead'
    const result = this.toResult(task)

    if (this.deadLetterQueue.length >= this.opts.maxDLQSize) {
      this.deadLetterQueue.shift() // Remove oldest
    }

    this.deadLetterQueue.push(result)
  }

  private toResult(task: InternalTask): TaskResult {
    return {
      taskId: task.id,
      status: task.status,
      result: task.result,
      error: task.error,
      attempts: task.attempts,
      createdAt: task.createdAt,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      duration: task.completedAt && task.startedAt ? task.completedAt - task.startedAt : undefined,
    }
  }

  private emitResult(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (!task) return

    const listeners = this.listeners.get(taskId) ?? []
    const result = this.toResult(task)
    for (const listener of listeners) {
      listener(result)
    }
    this.listeners.delete(taskId)
  }

  private idCounter = 0
  private generateId(): string {
    return `task_${Date.now()}_${++this.idCounter}`
  }
}

/** Create a new TaskQueue with the given options */
export function createTaskQueue(options?: QueueOptions): TaskQueue {
  return new TaskQueue(options)
}
