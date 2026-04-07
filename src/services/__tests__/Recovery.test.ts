import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  APIUserAbortError: class extends Error {},
}))

import {
  type Checkpoint,
  type CheckpointType,
  type RecoveryStrategy,
  type RecoveryPolicy,
  type GracefulDegradation,
  type DeadLetterEntry,
  type ServiceStatus,
  MemoryCheckpointStore,
  CheckpointManager,
  ServiceRegistry,
  DeadLetterQueue,
} from '../recovery/index.js'

// ═══════════════════════════════════════════════════════════════════════════════
//  MemoryCheckpointStore
// ═══════════════════════════════════════════════════════════════════════════════

describe('MemoryCheckpointStore', () => {
  let store: MemoryCheckpointStore

  beforeEach(() => {
    store = new MemoryCheckpointStore()
  })

  function makeCheckpoint(overrides: Partial<Checkpoint> = {}): Checkpoint {
    return {
      id: `cp_${Math.random()}`,
      timestamp: Date.now(),
      type: 'conversation',
      state: { msg: 'hello' },
      ...overrides,
    }
  }

  it('saves and loads a checkpoint', async () => {
    const cp = makeCheckpoint({ id: 'cp_1' })
    await store.save(cp)
    const loaded = await store.load('cp_1')
    expect(loaded).toEqual(cp)
  })

  it('returns undefined for unknown id', async () => {
    expect(await store.load('nope')).toBeUndefined()
  })

  it('lists all checkpoints', async () => {
    await store.save(makeCheckpoint({ id: 'a', type: 'conversation' }))
    await store.save(makeCheckpoint({ id: 'b', type: 'tool' }))
    const all = await store.list()
    expect(all).toHaveLength(2)
  })

  it('lists checkpoints filtered by type', async () => {
    await store.save(makeCheckpoint({ id: 'a', type: 'conversation' }))
    await store.save(makeCheckpoint({ id: 'b', type: 'tool' }))
    await store.save(makeCheckpoint({ id: 'c', type: 'conversation' }))
    expect(await store.list('conversation')).toHaveLength(2)
    expect(await store.list('tool')).toHaveLength(1)
    expect(await store.list('workflow')).toHaveLength(0)
  })

  it('deletes a checkpoint', async () => {
    const cp = makeCheckpoint({ id: 'del' })
    await store.save(cp)
    expect(await store.delete('del')).toBe(true)
    expect(await store.load('del')).toBeUndefined()
  })

  it('returns false when deleting non-existent id', async () => {
    expect(await store.delete('nope')).toBe(false)
  })

  it('cleanup removes old entries', async () => {
    await store.save(makeCheckpoint({ id: 'old', timestamp: Date.now() - 10_000 }))
    await store.save(makeCheckpoint({ id: 'new', timestamp: Date.now() }))
    const removed = await store.cleanup(5_000)
    expect(removed).toBe(1)
    expect(await store.load('old')).toBeUndefined()
    expect(await store.load('new')).toBeDefined()
  })

  it('cleanup trims to maxCount keeping newest', async () => {
    await store.save(makeCheckpoint({ id: 'a', timestamp: 100 }))
    await store.save(makeCheckpoint({ id: 'b', timestamp: 200 }))
    await store.save(makeCheckpoint({ id: 'c', timestamp: 300 }))
    const removed = await store.cleanup(undefined, 2)
    expect(removed).toBe(1)
    expect(await store.load('a')).toBeUndefined()
    expect(await store.load('c')).toBeDefined()
  })

  it('cleanup with both maxAge and maxCount', async () => {
    await store.save(makeCheckpoint({ id: 'a', timestamp: Date.now() - 20_000 }))
    await store.save(makeCheckpoint({ id: 'b', timestamp: Date.now() - 10_000 }))
    await store.save(makeCheckpoint({ id: 'c', timestamp: Date.now() }))
    const removed = await store.cleanup(15_000, 1)
    expect(removed).toBe(2)
    expect(await store.load('c')).toBeDefined()
  })

  it('cleanup returns 0 when nothing to remove', async () => {
    await store.save(makeCheckpoint({ id: 'a' }))
    expect(await store.cleanup(999_999, 100)).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//  CheckpointManager
// ═══════════════════════════════════════════════════════════════════════════════

describe('CheckpointManager', () => {
  let manager: CheckpointManager

  beforeEach(() => {
    manager = new CheckpointManager()
  })

  it('save returns a checkpoint with generated id', async () => {
    const cp = await manager.save('conversation', { text: 'hi' })
    expect(cp.id).toMatch(/^cp_/)
    expect(cp.type).toBe('conversation')
    expect(cp.state).toEqual({ text: 'hi' })
  })

  it('save stores optional metadata', async () => {
    const cp = await manager.save('tool', { data: 1 }, { tool: 'bash' })
    expect(cp.metadata).toEqual({ tool: 'bash' })
  })

  it('restore retrieves a previously saved checkpoint', async () => {
    const cp = await manager.save('workflow', { step: 3 })
    const restored = await manager.restore(cp.id)
    expect(restored).toEqual(cp)
  })

  it('restore returns undefined for missing id', async () => {
    expect(await manager.restore('missing')).toBeUndefined()
  })

  it('restoreLatest returns the newest checkpoint of a type', async () => {
    await manager.save('conversation', { v: 1 })
    const later = await manager.save('conversation', { v: 2 })
    const latest = await manager.restoreLatest('conversation')
    expect(latest?.state).toEqual({ v: 2 })
    expect(latest?.id).toBe(later.id)
  })

  it('restoreLatest returns undefined when no checkpoints of that type', async () => {
    await manager.save('tool', { x: 1 })
    expect(await manager.restoreLatest('workflow')).toBeUndefined()
  })

  it('list returns all checkpoints', async () => {
    await manager.save('conversation', {})
    await manager.save('tool', {})
    expect(await manager.list()).toHaveLength(2)
  })

  it('list filters by type', async () => {
    await manager.save('conversation', {})
    await manager.save('tool', {})
    expect(await manager.list('tool')).toHaveLength(1)
  })

  it('cleanup delegates to the store', async () => {
    await manager.save('conversation', {})
    await manager.save('conversation', {})
    const removed = await manager.cleanup(undefined, 1)
    expect(removed).toBe(1)
    expect(await manager.list()).toHaveLength(1)
  })

  it('accepts a custom store', async () => {
    const custom = new MemoryCheckpointStore()
    const m = new CheckpointManager(custom)
    const cp = await m.save('workflow', { ok: true })
    expect(await custom.load(cp.id)).toBeDefined()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//  ServiceRegistry
// ═══════════════════════════════════════════════════════════════════════════════

describe('ServiceRegistry', () => {
  let registry: ServiceRegistry

  beforeEach(() => {
    registry = new ServiceRegistry()
  })

  it('registers a service with healthy status', () => {
    registry.register('db', async () => true)
    expect(registry.getStatus('db')).toBe('healthy')
  })

  it('throws when querying unregistered service status', () => {
    expect(() => registry.getStatus('nope')).toThrow('not registered')
  })

  it('checkHealth returns healthy on success', async () => {
    registry.register('api', async () => true)
    expect(await registry.checkHealth('api')).toBe('healthy')
  })

  it('checkHealth transitions to degraded after threshold failures', async () => {
    registry.register('api', async () => false)
    await registry.checkHealth('api')
    expect(registry.getStatus('api')).toBe('healthy')
    await registry.checkHealth('api')
    expect(registry.getStatus('api')).toBe('degraded')
  })

  it('checkHealth transitions to unavailable after more failures', async () => {
    registry.register('api', async () => false)
    for (let i = 0; i < 5; i++) await registry.checkHealth('api')
    expect(registry.getStatus('api')).toBe('unavailable')
  })

  it('checkHealth resets to healthy on success', async () => {
    let fail = true
    registry.register('api', async () => !fail)
    await registry.checkHealth('api')
    await registry.checkHealth('api')
    expect(registry.getStatus('api')).toBe('degraded')
    fail = false
    await registry.checkHealth('api')
    expect(registry.getStatus('api')).toBe('healthy')
  })

  it('checkHealth handles exceptions as failures', async () => {
    registry.register('api', async () => { throw new Error('boom') })
    await registry.checkHealth('api')
    await registry.checkHealth('api')
    expect(registry.getStatus('api')).toBe('degraded')
  })

  it('checkHealth throws for unregistered service', async () => {
    await expect(registry.checkHealth('nope')).rejects.toThrow('not registered')
  })

  it('checkAllHealth returns map of statuses', async () => {
    registry.register('a', async () => true)
    registry.register('b', async () => false)
    // b needs 2 failures for degraded
    await registry.checkHealth('b')
    const results = await registry.checkAllHealth()
    expect(results.get('a')).toBe('healthy')
    expect(results.get('b')).toBe('degraded')
  })

  it('getServiceMap returns degradation info', () => {
    registry.register('db', async () => true, async () => 'fallback')
    const map = registry.getServiceMap()
    const info = map.get('db')!
    expect(info.serviceName).toBe('db')
    expect(info.status).toBe('healthy')
    expect(info.fallbackBehavior).toBe('configured')
  })

  it('getServiceMap shows undefined fallbackBehavior when no fallback', () => {
    registry.register('db', async () => true)
    const info = registry.getServiceMap().get('db')!
    expect(info.fallbackBehavior).toBeUndefined()
  })

  it('withFallback returns result on success', async () => {
    registry.register('api', async () => true)
    const result = await registry.withFallback('api', () => 42)
    expect(result).toBe(42)
  })

  it('withFallback invokes fallback on failure', async () => {
    registry.register('api', async () => true, () => 'fallback_val')
    const result = await registry.withFallback('api', () => { throw new Error('fail') })
    expect(result).toBe('fallback_val')
  })

  it('withFallback rethrows when no fallback is configured', async () => {
    registry.register('api', async () => true)
    await expect(
      registry.withFallback('api', () => { throw new Error('fail') }),
    ).rejects.toThrow('fail')
  })

  it('withFallback throws for unregistered service', async () => {
    await expect(
      registry.withFallback('nope', () => 1),
    ).rejects.toThrow('not registered')
  })

  it('withFallback resets failures on success', async () => {
    let shouldFail = true
    registry.register('api', async () => true, () => 'fb')
    await registry.withFallback('api', () => { if (shouldFail) throw new Error('x') })
    expect(registry.getStatus('api')).toBe('healthy') // 1 failure, still below degraded
    shouldFail = false
    await registry.withFallback('api', () => 'ok')
    expect(registry.getStatus('api')).toBe('healthy')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//  DeadLetterQueue
// ═══════════════════════════════════════════════════════════════════════════════

describe('DeadLetterQueue', () => {
  let dlq: DeadLetterQueue

  beforeEach(() => {
    dlq = new DeadLetterQueue()
  })

  it('starts empty', () => {
    expect(dlq.size()).toBe(0)
    expect(dlq.peek()).toBeUndefined()
    expect(dlq.list()).toEqual([])
  })

  it('enqueue adds an entry', () => {
    const entry = dlq.enqueue('sendEmail', new Error('smtp down'))
    expect(entry.id).toMatch(/^dl_/)
    expect(entry.operation).toBe('sendEmail')
    expect(entry.error).toBe('smtp down')
    expect(entry.retryCount).toBe(0)
    expect(entry.lastRetryAt).toBeNull()
    expect(dlq.size()).toBe(1)
  })

  it('enqueue accepts string error', () => {
    const entry = dlq.enqueue('op', 'string error')
    expect(entry.error).toBe('string error')
  })

  it('dequeue removes first entry', () => {
    dlq.enqueue('a', 'e1')
    dlq.enqueue('b', 'e2')
    const entry = dlq.dequeue()
    expect(entry?.operation).toBe('a')
    expect(dlq.size()).toBe(1)
  })

  it('dequeue returns undefined when empty', () => {
    expect(dlq.dequeue()).toBeUndefined()
  })

  it('peek returns first without removing', () => {
    dlq.enqueue('a', 'e1')
    expect(dlq.peek()?.operation).toBe('a')
    expect(dlq.size()).toBe(1)
  })

  it('retry increments retryCount and updates lastRetryAt', () => {
    const entry = dlq.enqueue('op', 'err')
    const retried = dlq.retry(entry.id)
    expect(retried?.retryCount).toBe(1)
    expect(retried?.lastRetryAt).toBeGreaterThan(0)
  })

  it('retry returns undefined for unknown id', () => {
    expect(dlq.retry('nope')).toBeUndefined()
  })

  it('retry can be called multiple times', () => {
    const entry = dlq.enqueue('op', 'err')
    dlq.retry(entry.id)
    dlq.retry(entry.id)
    const retried = dlq.retry(entry.id)
    expect(retried?.retryCount).toBe(3)
  })

  it('list returns a copy of entries', () => {
    dlq.enqueue('a', 'e1')
    dlq.enqueue('b', 'e2')
    const items = dlq.list()
    expect(items).toHaveLength(2)
    items.pop()
    expect(dlq.size()).toBe(2) // original unaffected
  })

  it('purge without args clears all entries', () => {
    dlq.enqueue('a', 'e1')
    dlq.enqueue('b', 'e2')
    const removed = dlq.purge()
    expect(removed).toBe(2)
    expect(dlq.size()).toBe(0)
  })

  it('purge with olderThan removes only old entries', () => {
    // Manually create entries with different timestamps
    const entry1 = dlq.enqueue('old', 'e1')
    ;(entry1 as { timestamp: number }).timestamp = Date.now() - 20_000
    dlq.enqueue('new', 'e2')
    const removed = dlq.purge(10_000)
    expect(removed).toBe(1)
    expect(dlq.size()).toBe(1)
    expect(dlq.peek()?.operation).toBe('new')
  })

  it('purge returns 0 when nothing to remove', () => {
    dlq.enqueue('a', 'e1')
    expect(dlq.purge(999_999)).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//  Type contract smoke tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('Type contracts', () => {
  it('RecoveryStrategy accepts valid values', () => {
    const strategies: RecoveryStrategy[] = ['retry', 'skip', 'fallback', 'abort']
    expect(strategies).toHaveLength(4)
  })

  it('RecoveryPolicy shape is valid', () => {
    const policy: RecoveryPolicy = {
      maxRetries: 3,
      backoffMs: 1000,
      strategyPerError: { timeout: 'retry', notFound: 'skip' },
      fallbackFn: () => 'default',
    }
    expect(policy.maxRetries).toBe(3)
    expect(policy.strategyPerError.timeout).toBe('retry')
  })

  it('CheckpointType union is exhaustive', () => {
    const types: CheckpointType[] = ['conversation', 'tool', 'workflow']
    expect(types).toHaveLength(3)
  })

  it('ServiceStatus union is exhaustive', () => {
    const statuses: ServiceStatus[] = ['healthy', 'degraded', 'unavailable']
    expect(statuses).toHaveLength(3)
  })

  it('GracefulDegradation shape is valid', () => {
    const gd: GracefulDegradation = {
      serviceName: 'cache',
      status: 'degraded',
      fallbackBehavior: 'use memory',
    }
    expect(gd.serviceName).toBe('cache')
  })
})
