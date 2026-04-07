/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SSE Streaming Module                                                        ║
 * ║                                                                              ║
 * ║  Server-Sent Events streaming with connection management, event bus,         ║
 * ║  and route registration for real-time communication.                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { ServerResponse } from 'node:http'
import { randomUUID } from 'node:crypto'
import type { Router, ApiRequest, ApiResponse } from './router.js'

// ── SSE Connection ──

const HEARTBEAT_INTERVAL_MS = 30_000

export class SSEConnection {
  private res: ServerResponse
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null

  constructor(res: ServerResponse) {
    this.res = res

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, HEARTBEAT_INTERVAL_MS)

    res.on('close', () => {
      this.cleanup()
    })
  }

  sendEvent(event: string, data: unknown, id?: string): void {
    if (!this.isConnected()) return
    let message = ''
    if (id !== undefined) message += `id: ${id}\n`
    message += `event: ${event}\n`
    message += `data: ${JSON.stringify(data)}\n\n`
    this.res.write(message)
  }

  sendData(data: unknown): void {
    this.sendEvent('message', data)
  }

  sendError(error: { code: number; message: string }): void {
    this.sendEvent('error', error)
  }

  sendHeartbeat(): void {
    if (!this.isConnected()) return
    this.res.write(': heartbeat\n\n')
  }

  close(): void {
    this.cleanup()
    if (!this.res.writableEnded) {
      this.res.end()
    }
  }

  isConnected(): boolean {
    return !this.res.destroyed
  }

  private cleanup(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
}

// ── SSE Manager ──

export class SSEManager {
  private connections: Map<string, SSEConnection> = new Map()

  addConnection(id: string, conn: SSEConnection): void {
    const existing = this.connections.get(id)
    if (existing) {
      existing.close()
    }
    this.connections.set(id, conn)
  }

  removeConnection(id: string): void {
    const conn = this.connections.get(id)
    if (conn) {
      conn.close()
      this.connections.delete(id)
    }
  }

  broadcast(event: string, data: unknown): void {
    for (const conn of this.connections.values()) {
      conn.sendEvent(event, data)
    }
  }

  send(id: string, event: string, data: unknown): void {
    const conn = this.connections.get(id)
    if (conn) {
      conn.sendEvent(event, data)
    }
  }

  getConnectionCount(): number {
    return this.connections.size
  }

  cleanup(): void {
    for (const [id, conn] of this.connections.entries()) {
      if (!conn.isConnected()) {
        conn.close()
        this.connections.delete(id)
      }
    }
  }
}

// ── Event Bus ──

export type StreamingEventType =
  | 'chat:response'
  | 'chat:stream'
  | 'tool:progress'
  | 'plugin:event'
  | 'system:health'

export type EventHandler = (data: unknown) => void

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map()

  on(event: string, handler: EventHandler): void {
    let handlers = this.listeners.get(event)
    if (!handlers) {
      handlers = new Set()
      this.listeners.set(event, handlers)
    }
    handlers.add(handler)
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      for (const handler of handlers) {
        handler(data)
      }
    }
  }

  once(event: string, handler: EventHandler): void {
    const wrapper: EventHandler = (data: unknown) => {
      this.off(event, wrapper)
      handler(data)
    }
    this.on(event, wrapper)
  }

  listenerCount(event: string): number {
    const handlers = this.listeners.get(event)
    return handlers ? handlers.size : 0
  }

  removeAllListeners(event?: string): void {
    if (event !== undefined) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

// ── Streaming Routes ──

export function createStreamingRoutes(router: Router): { manager: SSEManager; eventBus: EventBus } {
  const manager = new SSEManager()
  const eventBus = new EventBus()

  router.get('/api/v1/stream', async (req: ApiRequest, res: ApiResponse) => {
    const connectionId = req.query.id ?? req.headers['x-connection-id'] as string ?? `conn-${randomUUID()}`
    const conn = new SSEConnection(res.raw)
    manager.addConnection(connectionId, conn)

    const forwardEvent = (event: StreamingEventType) => {
      const handler: EventHandler = (data: unknown) => {
        conn.sendEvent(event, data)
      }
      eventBus.on(event, handler)
      res.raw.on('close', () => {
        eventBus.off(event, handler)
        manager.removeConnection(connectionId)
      })
    }

    const events: StreamingEventType[] = [
      'chat:response',
      'chat:stream',
      'tool:progress',
      'plugin:event',
      'system:health',
    ]
    for (const event of events) {
      forwardEvent(event)
    }

    conn.sendEvent('connected', { id: connectionId })
  })

  router.post('/api/v1/chat/stream', async (req: ApiRequest, res: ApiResponse) => {
    const body = req.body as Record<string, unknown> | undefined
    if (!body || typeof body.message !== 'string') {
      res.error(400, 'Missing required field: message')
      return
    }

    const conn = new SSEConnection(res.raw)
    const connectionId = `chat-${randomUUID()}`
    manager.addConnection(connectionId, conn)

    conn.sendEvent('chat:start', { id: connectionId })
    eventBus.emit('chat:stream', { id: connectionId, message: body.message })

    res.raw.on('close', () => {
      manager.removeConnection(connectionId)
    })
  })

  return { manager, eventBus }
}
