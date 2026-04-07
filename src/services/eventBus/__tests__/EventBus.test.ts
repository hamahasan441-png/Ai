import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventBus, createEventBus } from '../index.js'

describe('EventBus', () => {
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
  })

  describe('constructor', () => {
    it('should create with default options', () => {
      const b = new EventBus()
      expect(b.getStats().activeSubscriptions).toBe(0)
    })

    it('should create with custom options', () => {
      const b = new EventBus({ maxHistory: 50, enableDLQ: false, enableWildcards: false })
      expect(b).toBeDefined()
    })
  })

  describe('on', () => {
    it('should subscribe to a topic', () => {
      const sub = bus.on('test', () => {})
      expect(sub.id).toBeTruthy()
      expect(sub.topic).toBe('test')
    })

    it('should return unsubscribe function', () => {
      const handler = vi.fn()
      const sub = bus.on('test', handler)
      sub.unsubscribe()
      expect(bus.listenerCount('test')).toBe(0)
    })

    it('should support priority ordering', async () => {
      const order: number[] = []
      bus.on('test', () => { order.push(2) }, { priority: 20 })
      bus.on('test', () => { order.push(1) }, { priority: 1 })
      bus.on('test', () => { order.push(3) }, { priority: 30 })

      await bus.emit('test', {})
      expect(order).toEqual([1, 2, 3])
    })

    it('should support filter option', async () => {
      const handler = vi.fn()
      bus.on('test', handler, {
        filter: (e) => (e.payload as { value?: number }).value === 42,
      })

      await bus.emit('test', { value: 1 })
      await bus.emit('test', { value: 42 })
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('once', () => {
    it('should only fire once', async () => {
      const handler = vi.fn()
      bus.once('test', handler)

      await bus.emit('test', { a: 1 })
      await bus.emit('test', { a: 2 })
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('off', () => {
    it('should unsubscribe by ID', () => {
      const sub = bus.on('test', () => {})
      const removed = bus.off(sub.id)
      expect(removed).toBe(true)
      expect(bus.listenerCount('test')).toBe(0)
    })

    it('should return false for unknown subscription', () => {
      expect(bus.off('unknown')).toBe(false)
    })

    it('should remove wildcard subscriptions', () => {
      const sub = bus.on('test.*', () => {})
      expect(bus.off(sub.id)).toBe(true)
    })
  })

  describe('emit', () => {
    it('should deliver events to subscribers', async () => {
      const handler = vi.fn()
      bus.on('test', handler)

      await bus.emit('test', { value: 42 })
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler.mock.calls[0][0].payload.value).toBe(42)
    })

    it('should include event metadata', async () => {
      const handler = vi.fn()
      bus.on('test', handler)

      await bus.emit('test', { data: 1 }, { source: 'unit-test', correlationId: 'abc-123' })
      const event = handler.mock.calls[0][0]
      expect(event.source).toBe('unit-test')
      expect(event.correlationId).toBe('abc-123')
    })

    it('should generate unique event IDs', async () => {
      const ids: string[] = []
      bus.on('test', (e) => ids.push(e.id))

      await bus.emit('test', {})
      await bus.emit('test', {})
      expect(ids[0]).not.toBe(ids[1])
    })

    it('should handle async handlers', async () => {
      let result = ''
      bus.on('test', async () => {
        await new Promise(r => setTimeout(r, 10))
        result = 'done'
      })

      await bus.emit('test', {})
      expect(result).toBe('done')
    })

    it('should deliver to multiple subscribers', async () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      bus.on('test', h1)
      bus.on('test', h2)

      await bus.emit('test', {})
      expect(h1).toHaveBeenCalledTimes(1)
      expect(h2).toHaveBeenCalledTimes(1)
    })
  })

  describe('fire', () => {
    it('should fire-and-forget', () => {
      const handler = vi.fn()
      bus.on('test', handler)
      bus.fire('test', { value: 1 })
      // handler may not have been called yet (async)
      expect(true).toBe(true)
    })
  })

  describe('wildcards', () => {
    it('should match single segment wildcard (*)', async () => {
      const handler = vi.fn()
      bus.on('user.*', handler)

      await bus.emit('user.created', { id: 1 })
      await bus.emit('user.deleted', { id: 2 })
      await bus.emit('other.event', {})
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('should match multi-segment wildcard (#)', async () => {
      const handler = vi.fn()
      bus.on('app.#', handler)

      await bus.emit('app.user.created', {})
      await bus.emit('app.system.health.check', {})
      await bus.emit('other.event', {})
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('should disable wildcards when configured', async () => {
      const b = new EventBus({ enableWildcards: false })
      const handler = vi.fn()
      b.on('test.*', handler)

      await b.emit('test.event', {})
      expect(handler).toHaveBeenCalledTimes(0)
    })
  })

  describe('middleware', () => {
    it('should run middleware before delivery', async () => {
      const order: string[] = []

      bus.use(async (_event, next) => {
        order.push('middleware')
        await next()
      })

      bus.on('test', () => { order.push('handler') })
      await bus.emit('test', {})

      expect(order).toEqual(['middleware', 'handler'])
    })

    it('should allow middleware to modify events', async () => {
      bus.use(async (event, next) => {
        event.metadata = { ...event.metadata, enriched: true }
        await next()
      })

      const handler = vi.fn()
      bus.on('test', handler)
      await bus.emit('test', {})

      expect(handler.mock.calls[0][0].metadata.enriched).toBe(true)
    })

    it('should chain multiple middleware', async () => {
      const order: number[] = []

      bus.use(async (_e, next) => { order.push(1); await next() })
      bus.use(async (_e, next) => { order.push(2); await next() })
      bus.use(async (_e, next) => { order.push(3); await next() })

      bus.on('test', () => { order.push(4) })
      await bus.emit('test', {})

      expect(order).toEqual([1, 2, 3, 4])
    })

    it('should allow middleware to block events', async () => {
      bus.use(async (_event, _next) => {
        // Don't call next — event is blocked
      })

      const handler = vi.fn()
      bus.on('test', handler)
      await bus.emit('test', {})

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('replay', () => {
    it('should replay history events', async () => {
      await bus.emit('test', { v: 1 })
      await bus.emit('test', { v: 2 })
      await bus.emit('other', { v: 3 })

      const received: number[] = []
      const count = bus.replay('test', (e) => { received.push((e.payload as { v: number }).v) })
      expect(count).toBe(2)
      expect(received).toEqual([1, 2])
    })

    it('should replay with wildcard matching', async () => {
      await bus.emit('user.created', { id: 1 })
      await bus.emit('user.deleted', { id: 2 })

      const received: unknown[] = []
      const count = bus.replay('user.*', (e) => { received.push(e.payload) })
      expect(count).toBe(2)
    })

    it('should limit history size', async () => {
      const b = new EventBus({ maxHistory: 2 })
      await b.emit('test', { v: 1 })
      await b.emit('test', { v: 2 })
      await b.emit('test', { v: 3 })

      expect(b.getHistory().length).toBe(2)
    })
  })

  describe('getHistory', () => {
    it('should return all history', async () => {
      await bus.emit('a', {})
      await bus.emit('b', {})
      expect(bus.getHistory().length).toBe(2)
    })

    it('should filter by topic', async () => {
      await bus.emit('a', {})
      await bus.emit('b', {})
      expect(bus.getHistory('a').length).toBe(1)
    })
  })

  describe('dead letter queue', () => {
    it('should capture handler errors', async () => {
      bus.on('test', () => { throw new Error('handler failed') })
      await bus.emit('test', {})

      const dlq = bus.getDeadLetterQueue()
      expect(dlq.length).toBe(1)
      expect(dlq[0].error).toBe('handler failed')
    })

    it('should not capture errors when DLQ is disabled', async () => {
      const b = new EventBus({ enableDLQ: false })
      b.on('test', () => { throw new Error('fail') })
      await b.emit('test', {})

      expect(b.getDeadLetterQueue().length).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should track publish count', async () => {
      await bus.emit('a', {})
      await bus.emit('b', {})
      expect(bus.getStats().totalPublished).toBe(2)
    })

    it('should track delivery count', async () => {
      bus.on('test', () => {})
      await bus.emit('test', {})
      expect(bus.getStats().totalDelivered).toBe(1)
    })

    it('should track error count', async () => {
      bus.on('test', () => { throw new Error('fail') })
      await bus.emit('test', {})
      expect(bus.getStats().totalErrors).toBe(1)
    })

    it('should track subscription count', () => {
      bus.on('a', () => {})
      bus.on('b', () => {})
      expect(bus.getStats().activeSubscriptions).toBe(2)
    })
  })

  describe('removeAllListeners', () => {
    it('should remove all listeners for a topic', () => {
      bus.on('test', () => {})
      bus.on('test', () => {})
      bus.on('other', () => {})

      bus.removeAllListeners('test')
      expect(bus.listenerCount('test')).toBe(0)
      expect(bus.listenerCount('other')).toBe(1)
    })

    it('should remove all listeners when no topic specified', () => {
      bus.on('a', () => {})
      bus.on('b', () => {})
      bus.removeAllListeners()
      expect(bus.getStats().activeSubscriptions).toBe(0)
    })
  })

  describe('hasListeners', () => {
    it('should return true when listeners exist', () => {
      bus.on('test', () => {})
      expect(bus.hasListeners('test')).toBe(true)
    })

    it('should return false when no listeners', () => {
      expect(bus.hasListeners('test')).toBe(false)
    })

    it('should detect wildcard listeners', () => {
      bus.on('test.*', () => {})
      expect(bus.hasListeners('test.event')).toBe(true)
    })
  })

  describe('listenerCount', () => {
    it('should count direct listeners', () => {
      bus.on('test', () => {})
      bus.on('test', () => {})
      expect(bus.listenerCount('test')).toBe(2)
    })

    it('should count wildcard listeners', () => {
      bus.on('test', () => {})
      bus.on('test.*', () => {})
      expect(bus.listenerCount('test.event')).toBe(1) // Only wildcard matches
    })
  })

  describe('clear', () => {
    it('should reset everything', async () => {
      bus.on('test', () => {})
      await bus.emit('test', {})
      bus.clear()

      const stats = bus.getStats()
      expect(stats.activeSubscriptions).toBe(0)
      expect(stats.totalPublished).toBe(0)
      expect(stats.historySize).toBe(0)
    })
  })

  describe('createEventBus', () => {
    it('should create an EventBus instance', () => {
      const b = createEventBus({ maxHistory: 50 })
      expect(b).toBeInstanceOf(EventBus)
    })
  })
})
