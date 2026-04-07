import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TaskQueue, createTaskQueue } from '../index.js'

describe('TaskQueue', () => {
  let queue: TaskQueue

  beforeEach(() => {
    queue = new TaskQueue({ concurrency: 3, pollInterval: 10 })
  })

  afterEach(() => {
    queue.clear()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const q = new TaskQueue()
      const stats = q.getStats()
      expect(stats.pending).toBe(0)
      expect(stats.running).toBe(0)
      q.clear()
    })

    it('should create with custom options', () => {
      const q = new TaskQueue({ concurrency: 10, maxSize: 500, pollInterval: 50 })
      expect(q).toBeDefined()
      q.clear()
    })
  })

  describe('enqueue', () => {
    it('should enqueue a task and return an ID', () => {
      const id = queue.enqueue(async () => 42)
      expect(id).toBeTruthy()
      expect(id).toContain('task_')
    })

    it('should enqueue with priority', () => {
      const id = queue.enqueue(async () => 1, { priority: 'critical' })
      const task = queue.getTask(id)
      expect(task).toBeDefined()
      expect(task!.status).toBe('pending')
    })

    it('should reject enqueue when queue is full', () => {
      const q = new TaskQueue({ maxSize: 2 })
      q.enqueue(async () => 1)
      q.enqueue(async () => 2)
      expect(() => q.enqueue(async () => 3)).toThrow('Queue is full')
      q.clear()
    })

    it('should handle deduplication', () => {
      const id1 = queue.enqueue(async () => 1, { dedupeKey: 'test' })
      const id2 = queue.enqueue(async () => 2, { dedupeKey: 'test' })
      expect(id1).toBe(id2)
    })

    it('should allow re-enqueue after dedupe task completes', async () => {
      queue.start()
      const id1 = queue.enqueue(async () => 1, { dedupeKey: 'done' })
      await queue.waitFor(id1)
      const id2 = queue.enqueue(async () => 2, { dedupeKey: 'done' })
      expect(id2).not.toBe(id1)
    })

    it('should enqueue with delay', () => {
      const id = queue.enqueue(async () => 1, { delay: 500 })
      const task = queue.getTask(id)
      expect(task!.status).toBe('scheduled')
    })

    it('should enqueue with metadata', () => {
      const id = queue.enqueue(async () => 1, { metadata: { key: 'value' } })
      expect(id).toBeTruthy()
    })
  })

  describe('process', () => {
    it('should process tasks when started', async () => {
      queue.start()
      const id = queue.enqueue(async () => 42)
      const result = await queue.waitFor(id)
      expect(result.status).toBe('completed')
      expect(result.result).toBe(42)
    })

    it('should process multiple tasks concurrently', async () => {
      queue.start()
      const ids = [
        queue.enqueue(async () => { await sleep(50); return 1 }),
        queue.enqueue(async () => { await sleep(50); return 2 }),
        queue.enqueue(async () => { await sleep(50); return 3 }),
      ]
      const results = await Promise.all(ids.map(id => queue.waitFor(id)))
      expect(results.every(r => r.status === 'completed')).toBe(true)
    })

    it('should respect concurrency limit', async () => {
      const q = new TaskQueue({ concurrency: 1, pollInterval: 10 })
      q.start()
      let running = 0
      let maxRunning = 0

      const createTask = () => async () => {
        running++
        maxRunning = Math.max(maxRunning, running)
        await sleep(30)
        running--
        return true
      }

      const ids = [q.enqueue(createTask()), q.enqueue(createTask()), q.enqueue(createTask())]
      await Promise.all(ids.map(id => q.waitFor(id)))
      expect(maxRunning).toBe(1)
      q.clear()
    })

    it('should process in priority order', async () => {
      const order: string[] = []
      const q = new TaskQueue({ concurrency: 1, pollInterval: 10 })

      q.enqueue(async () => { order.push('low') }, { priority: 'low' })
      q.enqueue(async () => { order.push('critical') }, { priority: 'critical' })
      q.enqueue(async () => { order.push('high') }, { priority: 'high' })

      q.start()
      await sleep(200)
      expect(order[0]).toBe('critical')
      expect(order[1]).toBe('high')
      expect(order[2]).toBe('low')
      q.clear()
    })
  })

  describe('retry', () => {
    it('should retry failed tasks', async () => {
      queue.start()
      let attempts = 0
      const id = queue.enqueue(async () => {
        attempts++
        if (attempts < 3) throw new Error('fail')
        return 'success'
      }, { maxRetries: 3, retryDelay: 10 })

      const result = await queue.waitFor(id)
      expect(result.status).toBe('completed')
      expect(result.result).toBe('success')
      expect(result.attempts).toBe(3)
    })

    it('should move to dead letter queue after max retries', async () => {
      queue.start()
      const id = queue.enqueue(
        async () => { throw new Error('always fails') },
        { maxRetries: 2, retryDelay: 10 },
      )

      const result = await queue.waitFor(id)
      expect(result.status).toBe('dead')
      expect(result.error).toBe('always fails')
    })

    it('should handle timeout', async () => {
      queue.start()
      const id = queue.enqueue(
        async () => { await sleep(5000); return 1 },
        { timeout: 50, maxRetries: 1, retryDelay: 10 },
      )

      const result = await queue.waitFor(id)
      expect(result.error).toContain('timed out')
    })
  })

  describe('cancel', () => {
    it('should cancel pending tasks', () => {
      const id = queue.enqueue(async () => 1)
      const cancelled = queue.cancel(id)
      expect(cancelled).toBe(true)
      expect(queue.getTask(id)!.status).toBe('cancelled')
    })

    it('should not cancel running tasks', async () => {
      queue.start()
      const id = queue.enqueue(async () => { await sleep(200); return 1 })
      await sleep(50) // Let it start
      const cancelled = queue.cancel(id)
      expect(cancelled).toBe(false)
    })

    it('should not cancel non-existent tasks', () => {
      expect(queue.cancel('nonexistent')).toBe(false)
    })
  })

  describe('getTask', () => {
    it('should return task result', () => {
      const id = queue.enqueue(async () => 1)
      const task = queue.getTask(id)
      expect(task).toBeDefined()
      expect(task!.taskId).toBe(id)
    })

    it('should return undefined for unknown task', () => {
      expect(queue.getTask('unknown')).toBeUndefined()
    })
  })

  describe('getStats', () => {
    it('should return correct stats', async () => {
      queue.start()
      const id = queue.enqueue(async () => 42)
      await queue.waitFor(id)

      const stats = queue.getStats()
      expect(stats.completed).toBe(1)
      expect(stats.totalProcessed).toBe(1)
      expect(stats.avgDuration).toBeGreaterThanOrEqual(0)
    })

    it('should track failed stats', async () => {
      queue.start()
      const id = queue.enqueue(
        async () => { throw new Error('fail') },
        { maxRetries: 1, retryDelay: 10 },
      )
      await queue.waitFor(id)

      const stats = queue.getStats()
      expect(stats.failed).toBe(1)
    })
  })

  describe('dead letter queue', () => {
    it('should store failed tasks in DLQ', async () => {
      queue.start()
      const id = queue.enqueue(
        async () => { throw new Error('dead') },
        { maxRetries: 1, retryDelay: 10 },
      )
      await queue.waitFor(id)

      const dlq = queue.getDeadLetterQueue()
      expect(dlq.length).toBe(1)
      expect(dlq[0].error).toBe('dead')
    })

    it('should retry from dead letter queue', async () => {
      queue.start()
      let count = 0
      const id = queue.enqueue(
        async () => {
          count++
          if (count < 3) throw new Error('fail')
          return 'ok'
        },
        { maxRetries: 1, retryDelay: 10 },
      )
      await queue.waitFor(id)
      expect(queue.getDeadLetterQueue().length).toBe(1)

      const retried = queue.retryDeadLetter(id)
      expect(retried).toBe(true)
      expect(queue.getDeadLetterQueue().length).toBe(0)
    })

    it('should return false for unknown DLQ task', () => {
      expect(queue.retryDeadLetter('unknown')).toBe(false)
    })
  })

  describe('dependencies', () => {
    it('should wait for dependent tasks', async () => {
      const order: number[] = []
      queue.start()

      const id1 = queue.enqueue(async () => { await sleep(50); order.push(1); return 1 })
      const id2 = queue.enqueue(
        async () => { order.push(2); return 2 },
        { dependsOn: [id1] },
      )

      await queue.waitFor(id2)
      expect(order[0]).toBe(1)
      expect(order[1]).toBe(2)
    })
  })

  describe('waitFor', () => {
    it('should reject for unknown task', async () => {
      await expect(queue.waitFor('unknown')).rejects.toThrow('not found')
    })

    it('should resolve immediately for completed tasks', async () => {
      queue.start()
      const id = queue.enqueue(async () => 'done')
      await queue.waitFor(id) // First wait completes it
      const result = await queue.waitFor(id) // Second should resolve immediately
      expect(result.status).toBe('completed')
    })
  })

  describe('drain', () => {
    it('should wait for all tasks to complete', async () => {
      queue.start()
      queue.enqueue(async () => { await sleep(50); return 1 })
      queue.enqueue(async () => { await sleep(50); return 2 })

      await queue.drain(5000)
      const stats = queue.getStats()
      expect(stats.pending).toBe(0)
      expect(stats.running).toBe(0)
    })

    it('should reject new enqueues during drain', async () => {
      queue.start()
      queue.enqueue(async () => { await sleep(200); return 1 })

      const drainPromise = queue.drain(5000)
      expect(() => queue.enqueue(async () => 2)).toThrow('draining')
      await drainPromise
    })
  })

  describe('size', () => {
    it('should return correct size', () => {
      queue.enqueue(async () => 1)
      queue.enqueue(async () => 2)
      expect(queue.size()).toBe(2)
    })
  })

  describe('clear', () => {
    it('should reset everything', () => {
      queue.enqueue(async () => 1)
      queue.clear()
      expect(queue.size()).toBe(0)
      expect(queue.getStats().totalProcessed).toBe(0)
    })
  })

  describe('createTaskQueue', () => {
    it('should create a TaskQueue instance', () => {
      const q = createTaskQueue({ concurrency: 2 })
      expect(q).toBeInstanceOf(TaskQueue)
      q.clear()
    })
  })

  describe('stop', () => {
    it('should stop processing', () => {
      queue.start()
      queue.stop()
      // Should not throw
      queue.stop()
    })

    it('should not start if already started', () => {
      queue.start()
      queue.start() // Should be no-op
      queue.stop()
    })
  })
})

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
