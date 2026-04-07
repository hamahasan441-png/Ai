import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  APIUserAbortError: class extends Error {},
}))

import { SSEConnection, SSEManager, EventBus, createStreamingRoutes } from '../streaming.js'
import { Router } from '../router.js'
import type { EventHandler } from '../streaming.js'

// ── Helpers ──

function createMockServerResponse() {
  let headWritten = false
  let statusCode = 200
  const headers: Record<string, string> = {}
  const chunks: string[] = []
  let ended = false
  let destroyed = false
  const closeListeners: Array<() => void> = []

  const res = {
    get destroyed() {
      return destroyed
    },
    get writableEnded() {
      return ended
    },
    writeHead(code: number, hdrs?: Record<string, string>) {
      headWritten = true
      statusCode = code
      if (hdrs) {
        for (const [k, v] of Object.entries(hdrs)) {
          headers[k.toLowerCase()] = v
        }
      }
    },
    write(chunk: string) {
      chunks.push(chunk)
      return true
    },
    end() {
      ended = true
    },
    on(event: string, handler: () => void) {
      if (event === 'close') closeListeners.push(handler)
      return res
    },
    once() {
      return res
    },
    emit() {
      return false
    },
    // Test helpers
    _simulateClose() {
      destroyed = true
      for (const fn of closeListeners) fn()
    },
    _simulateDestroy() {
      destroyed = true
    },
  }

  return {
    response: res as unknown as import('node:http').ServerResponse,
    getStatus: () => statusCode,
    getHeaders: () => headers,
    getChunks: () => chunks,
    getBody: () => chunks.join(''),
    isHeadWritten: () => headWritten,
    isEnded: () => ended,
    simulateClose: () => (res as any)._simulateClose(),
    simulateDestroy: () => (res as any)._simulateDestroy(),
  }
}

// ── SSEConnection Tests ──

describe('SSEConnection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('sets correct SSE headers', () => {
      const mock = createMockServerResponse()
      new SSEConnection(mock.response)
      const headers = mock.getHeaders()
      expect(headers['content-type']).toBe('text/event-stream')
      expect(headers['cache-control']).toBe('no-cache')
      expect(headers['connection']).toBe('keep-alive')
    })

    it('writes 200 status code', () => {
      const mock = createMockServerResponse()
      new SSEConnection(mock.response)
      expect(mock.getStatus()).toBe(200)
    })

    it('starts heartbeat interval', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      expect(mock.getBody()).toBe('')
      vi.advanceTimersByTime(30_000)
      expect(mock.getBody()).toContain(': heartbeat')
    })
  })

  describe('sendEvent', () => {
    it('sends event in SSE format', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.sendEvent('test', { foo: 'bar' })
      const body = mock.getBody()
      expect(body).toContain('event: test\n')
      expect(body).toContain('data: {"foo":"bar"}\n')
    })

    it('includes id when provided', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.sendEvent('test', { a: 1 }, 'evt-1')
      const body = mock.getBody()
      expect(body).toContain('id: evt-1\n')
      expect(body).toContain('event: test\n')
      expect(body).toContain('data: {"a":1}\n')
    })

    it('does not include id when omitted', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.sendEvent('test', 'hello')
      const body = mock.getBody()
      expect(body).not.toContain('id:')
    })

    it('does not write when disconnected', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      mock.simulateDestroy()
      conn.sendEvent('test', 'data')
      expect(mock.getChunks().length).toBe(0)
    })

    it('serializes string data as JSON', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.sendEvent('msg', 'hello world')
      expect(mock.getBody()).toContain('data: "hello world"\n')
    })

    it('serializes numeric data as JSON', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.sendEvent('count', 42)
      expect(mock.getBody()).toContain('data: 42\n')
    })

    it('ends each message with double newline', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.sendEvent('test', null)
      expect(mock.getBody()).toMatch(/\n\n$/)
    })
  })

  describe('sendData', () => {
    it('sends message event with data', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.sendData({ result: true })
      const body = mock.getBody()
      expect(body).toContain('event: message\n')
      expect(body).toContain('data: {"result":true}\n')
    })
  })

  describe('sendError', () => {
    it('sends error event with code and message', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.sendError({ code: 500, message: 'Internal error' })
      const body = mock.getBody()
      expect(body).toContain('event: error\n')
      expect(body).toContain('"code":500')
      expect(body).toContain('"message":"Internal error"')
    })
  })

  describe('sendHeartbeat', () => {
    it('sends comment-style heartbeat', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.sendHeartbeat()
      expect(mock.getBody()).toBe(': heartbeat\n\n')
    })

    it('does not write when disconnected', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      mock.simulateDestroy()
      conn.sendHeartbeat()
      expect(mock.getChunks().length).toBe(0)
    })
  })

  describe('close', () => {
    it('ends the response', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.close()
      expect(mock.isEnded()).toBe(true)
    })

    it('stops heartbeat timer', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.close()
      vi.advanceTimersByTime(60_000)
      // After close, no heartbeats should have been written
      expect(mock.getChunks().length).toBe(0)
    })

    it('is safe to call multiple times', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      conn.close()
      conn.close()
      expect(mock.isEnded()).toBe(true)
    })
  })

  describe('isConnected', () => {
    it('returns true when response is active', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      expect(conn.isConnected()).toBe(true)
    })

    it('returns false when response is destroyed', () => {
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      mock.simulateDestroy()
      expect(conn.isConnected()).toBe(false)
    })
  })

  describe('auto-heartbeat', () => {
    it('sends heartbeat every 30 seconds', () => {
      const mock = createMockServerResponse()
      new SSEConnection(mock.response)
      vi.advanceTimersByTime(30_000)
      expect(mock.getChunks()).toHaveLength(1)
      vi.advanceTimersByTime(30_000)
      expect(mock.getChunks()).toHaveLength(2)
    })

    it('cleans up timer on response close event', () => {
      const mock = createMockServerResponse()
      new SSEConnection(mock.response)
      mock.simulateClose()
      vi.advanceTimersByTime(90_000)
      // No heartbeats after close
      expect(mock.getChunks()).toHaveLength(0)
    })
  })
})

// ── SSEManager Tests ──

describe('SSEManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('addConnection', () => {
    it('adds a connection by id', () => {
      const manager = new SSEManager()
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      manager.addConnection('c1', conn)
      expect(manager.getConnectionCount()).toBe(1)
    })

    it('replaces existing connection with same id', () => {
      const manager = new SSEManager()
      const mock1 = createMockServerResponse()
      const mock2 = createMockServerResponse()
      const conn1 = new SSEConnection(mock1.response)
      const conn2 = new SSEConnection(mock2.response)
      manager.addConnection('c1', conn1)
      manager.addConnection('c1', conn2)
      expect(manager.getConnectionCount()).toBe(1)
      expect(mock1.isEnded()).toBe(true)
    })
  })

  describe('removeConnection', () => {
    it('removes a connection by id', () => {
      const manager = new SSEManager()
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      manager.addConnection('c1', conn)
      manager.removeConnection('c1')
      expect(manager.getConnectionCount()).toBe(0)
    })

    it('closes the connection when removing', () => {
      const manager = new SSEManager()
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      manager.addConnection('c1', conn)
      manager.removeConnection('c1')
      expect(mock.isEnded()).toBe(true)
    })

    it('is safe with non-existent id', () => {
      const manager = new SSEManager()
      expect(() => manager.removeConnection('missing')).not.toThrow()
    })
  })

  describe('broadcast', () => {
    it('sends event to all connections', () => {
      const manager = new SSEManager()
      const mock1 = createMockServerResponse()
      const mock2 = createMockServerResponse()
      const conn1 = new SSEConnection(mock1.response)
      const conn2 = new SSEConnection(mock2.response)
      manager.addConnection('c1', conn1)
      manager.addConnection('c2', conn2)
      manager.broadcast('update', { value: 1 })
      expect(mock1.getBody()).toContain('event: update\n')
      expect(mock2.getBody()).toContain('event: update\n')
    })

    it('handles empty connection list', () => {
      const manager = new SSEManager()
      expect(() => manager.broadcast('test', {})).not.toThrow()
    })
  })

  describe('send', () => {
    it('sends event to specific connection', () => {
      const manager = new SSEManager()
      const mock1 = createMockServerResponse()
      const mock2 = createMockServerResponse()
      const conn1 = new SSEConnection(mock1.response)
      const conn2 = new SSEConnection(mock2.response)
      manager.addConnection('c1', conn1)
      manager.addConnection('c2', conn2)
      manager.send('c1', 'ping', { ok: true })
      expect(mock1.getBody()).toContain('event: ping\n')
      expect(mock2.getChunks()).toHaveLength(0)
    })

    it('is safe with non-existent id', () => {
      const manager = new SSEManager()
      expect(() => manager.send('missing', 'test', {})).not.toThrow()
    })
  })

  describe('getConnectionCount', () => {
    it('returns 0 when empty', () => {
      const manager = new SSEManager()
      expect(manager.getConnectionCount()).toBe(0)
    })

    it('returns correct count', () => {
      const manager = new SSEManager()
      const m1 = createMockServerResponse()
      const m2 = createMockServerResponse()
      const m3 = createMockServerResponse()
      manager.addConnection('a', new SSEConnection(m1.response))
      manager.addConnection('b', new SSEConnection(m2.response))
      manager.addConnection('c', new SSEConnection(m3.response))
      expect(manager.getConnectionCount()).toBe(3)
    })
  })

  describe('cleanup', () => {
    it('removes disconnected connections', () => {
      const manager = new SSEManager()
      const mock1 = createMockServerResponse()
      const mock2 = createMockServerResponse()
      const conn1 = new SSEConnection(mock1.response)
      const conn2 = new SSEConnection(mock2.response)
      manager.addConnection('c1', conn1)
      manager.addConnection('c2', conn2)
      mock1.simulateDestroy()
      manager.cleanup()
      expect(manager.getConnectionCount()).toBe(1)
    })

    it('keeps connected connections', () => {
      const manager = new SSEManager()
      const mock = createMockServerResponse()
      const conn = new SSEConnection(mock.response)
      manager.addConnection('c1', conn)
      manager.cleanup()
      expect(manager.getConnectionCount()).toBe(1)
    })
  })
})

// ── EventBus Tests ──

describe('EventBus', () => {
  describe('on / emit', () => {
    it('calls handler when event is emitted', () => {
      const bus = new EventBus()
      const handler = vi.fn()
      bus.on('chat:response', handler)
      bus.emit('chat:response', { text: 'hi' })
      expect(handler).toHaveBeenCalledWith({ text: 'hi' })
    })

    it('supports multiple handlers for same event', () => {
      const bus = new EventBus()
      const h1 = vi.fn()
      const h2 = vi.fn()
      bus.on('chat:stream', h1)
      bus.on('chat:stream', h2)
      bus.emit('chat:stream', 'data')
      expect(h1).toHaveBeenCalledWith('data')
      expect(h2).toHaveBeenCalledWith('data')
    })

    it('does not call handlers for other events', () => {
      const bus = new EventBus()
      const handler = vi.fn()
      bus.on('chat:response', handler)
      bus.emit('tool:progress', {})
      expect(handler).not.toHaveBeenCalled()
    })

    it('handles emit with no listeners', () => {
      const bus = new EventBus()
      expect(() => bus.emit('chat:response', null)).not.toThrow()
    })
  })

  describe('off', () => {
    it('removes a specific handler', () => {
      const bus = new EventBus()
      const handler = vi.fn()
      bus.on('test', handler)
      bus.off('test', handler)
      bus.emit('test', 'data')
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not affect other handlers', () => {
      const bus = new EventBus()
      const h1 = vi.fn()
      const h2 = vi.fn()
      bus.on('test', h1)
      bus.on('test', h2)
      bus.off('test', h1)
      bus.emit('test', 'data')
      expect(h1).not.toHaveBeenCalled()
      expect(h2).toHaveBeenCalledWith('data')
    })

    it('is safe to call with non-existent event', () => {
      const bus = new EventBus()
      expect(() => bus.off('missing', vi.fn())).not.toThrow()
    })

    it('cleans up empty event entry', () => {
      const bus = new EventBus()
      const handler = vi.fn()
      bus.on('test', handler)
      bus.off('test', handler)
      expect(bus.listenerCount('test')).toBe(0)
    })
  })

  describe('once', () => {
    it('calls handler only once', () => {
      const bus = new EventBus()
      const handler = vi.fn()
      bus.once('ping', handler)
      bus.emit('ping', 1)
      bus.emit('ping', 2)
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(1)
    })

    it('removes itself after first call', () => {
      const bus = new EventBus()
      const handler = vi.fn()
      bus.once('ping', handler)
      bus.emit('ping', 'x')
      expect(bus.listenerCount('ping')).toBe(0)
    })
  })

  describe('listenerCount', () => {
    it('returns 0 for unknown event', () => {
      const bus = new EventBus()
      expect(bus.listenerCount('unknown')).toBe(0)
    })

    it('returns correct count', () => {
      const bus = new EventBus()
      bus.on('a', vi.fn())
      bus.on('a', vi.fn())
      bus.on('b', vi.fn())
      expect(bus.listenerCount('a')).toBe(2)
      expect(bus.listenerCount('b')).toBe(1)
    })
  })

  describe('removeAllListeners', () => {
    it('removes all listeners for a specific event', () => {
      const bus = new EventBus()
      bus.on('a', vi.fn())
      bus.on('a', vi.fn())
      bus.on('b', vi.fn())
      bus.removeAllListeners('a')
      expect(bus.listenerCount('a')).toBe(0)
      expect(bus.listenerCount('b')).toBe(1)
    })

    it('removes all listeners when no event specified', () => {
      const bus = new EventBus()
      bus.on('a', vi.fn())
      bus.on('b', vi.fn())
      bus.on('c', vi.fn())
      bus.removeAllListeners()
      expect(bus.listenerCount('a')).toBe(0)
      expect(bus.listenerCount('b')).toBe(0)
      expect(bus.listenerCount('c')).toBe(0)
    })
  })
})

// ── Route Registration Tests ──

describe('createStreamingRoutes', () => {
  it('registers GET /api/v1/stream route', () => {
    const router = new Router()
    const getSpy = vi.spyOn(router, 'get')
    createStreamingRoutes(router)
    expect(getSpy).toHaveBeenCalledWith('/api/v1/stream', expect.any(Function))
  })

  it('registers POST /api/v1/chat/stream route', () => {
    const router = new Router()
    const postSpy = vi.spyOn(router, 'post')
    createStreamingRoutes(router)
    expect(postSpy).toHaveBeenCalledWith('/api/v1/chat/stream', expect.any(Function))
  })

  it('returns manager and eventBus instances', () => {
    const router = new Router()
    const { manager, eventBus } = createStreamingRoutes(router)
    expect(manager).toBeInstanceOf(SSEManager)
    expect(eventBus).toBeInstanceOf(EventBus)
  })
})
