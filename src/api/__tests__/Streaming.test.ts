import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  SSEFormatter,
  StreamBuffer,
  StreamChannel,
  StreamManager,
  AIStreamProcessor,
  StreamTransformPipeline,
  createStreamManager,
  createAIStreamProcessor,
  createTransformPipeline,
} from '../streaming.js'
import type { SSEEvent, StreamChunk } from '../streaming.js'

// ── SSEFormatter ──

describe('SSEFormatter', () => {
  let fmt: SSEFormatter

  beforeEach(() => {
    fmt = new SSEFormatter()
  })

  it('should format event with data only', () => {
    const result = fmt.formatEvent({ data: 'hello' })
    expect(result).toBe('data: hello\n\n')
  })

  it('should format event with event type', () => {
    const result = fmt.formatEvent({ data: 'hi', event: 'message' })
    expect(result).toBe('event: message\ndata: hi\n\n')
  })

  it('should format event with id', () => {
    const result = fmt.formatEvent({ data: 'hi', id: '42' })
    expect(result).toBe('id: 42\ndata: hi\n\n')
  })

  it('should format event with retry', () => {
    const result = fmt.formatEvent({ data: 'hi', retry: 3000 })
    expect(result).toBe('retry: 3000\ndata: hi\n\n')
  })

  it('should format event with all fields', () => {
    const result = fmt.formatEvent({ id: '1', event: 'update', data: 'payload', retry: 5000 })
    expect(result).toBe('id: 1\nevent: update\nretry: 5000\ndata: payload\n\n')
  })

  it('should JSON-stringify object data', () => {
    const result = fmt.formatEvent({ data: { key: 'value' } })
    expect(result).toBe('data: {"key":"value"}\n\n')
  })

  it('should format multi-line data as separate data: lines', () => {
    const result = fmt.formatEvent({ data: 'line1\nline2' })
    expect(result).toBe('data: line1\ndata: line2\n\n')
  })

  it('should format a comment', () => {
    expect(fmt.formatComment('keep-alive')).toBe(': keep-alive\n\n')
  })

  it('should format multi-line comments', () => {
    expect(fmt.formatComment('a\nb')).toBe(': a\n: b\n\n')
  })

  it('should format heartbeat', () => {
    expect(fmt.formatHeartbeat()).toBe(':heartbeat\n\n')
  })

  it('should parse SSE text back into an event', () => {
    const raw = 'id: 1\nevent: msg\nretry: 3000\ndata: hello\n\n'
    const parsed = fmt.parseEvent(raw)
    expect(parsed.id).toBe('1')
    expect(parsed.event).toBe('msg')
    expect(parsed.retry).toBe(3000)
    expect(parsed.data).toBe('hello')
  })

  it('should parse multi-line data', () => {
    const raw = 'data: line1\ndata: line2\n\n'
    const parsed = fmt.parseEvent(raw)
    expect(parsed.data).toBe('line1\nline2')
  })

  it('should parse JSON data back to object', () => {
    const raw = 'data: {"key":"value"}\n\n'
    const parsed = fmt.parseEvent(raw)
    expect(parsed.data).toEqual({ key: 'value' })
  })

  it('should handle empty lines gracefully', () => {
    const parsed = fmt.parseEvent('\n\n')
    expect(parsed.data).toBe('')
    expect(parsed.id).toBeUndefined()
    expect(parsed.event).toBeUndefined()
  })
})

// ── StreamBuffer ──

describe('StreamBuffer', () => {
  it('should write and read chunks in FIFO order', () => {
    const buf = new StreamBuffer(10)
    const c1: StreamChunk = { type: 'token', content: 'a' }
    const c2: StreamChunk = { type: 'token', content: 'b' }
    buf.write(c1)
    buf.write(c2)
    expect(buf.read()).toEqual(c1)
    expect(buf.read()).toEqual(c2)
  })

  it('should return null when reading empty buffer', () => {
    const buf = new StreamBuffer(10)
    expect(buf.read()).toBeNull()
  })

  it('should respect max size with drop strategy', () => {
    const buf = new StreamBuffer(2, 'drop')
    buf.write({ type: 'token', content: '1' })
    buf.write({ type: 'token', content: '2' })
    const accepted = buf.write({ type: 'token', content: '3' })
    expect(accepted).toBe(false)
    expect(buf.size).toBe(2)
  })

  it('should reject writes with block strategy when full', () => {
    const buf = new StreamBuffer(1, 'block')
    buf.write({ type: 'token', content: '1' })
    expect(buf.write({ type: 'token', content: '2' })).toBe(false)
  })

  it('should allow overflow with buffer strategy', () => {
    const buf = new StreamBuffer(1, 'buffer')
    buf.write({ type: 'token', content: '1' })
    expect(buf.write({ type: 'token', content: '2' })).toBe(true)
    expect(buf.size).toBe(2)
  })

  it('should flush all items and empty the buffer', () => {
    const buf = new StreamBuffer(10)
    buf.write({ type: 'token', content: 'a' })
    buf.write({ type: 'token', content: 'b' })
    const flushed = buf.flush()
    expect(flushed).toHaveLength(2)
    expect(buf.isEmpty).toBe(true)
  })

  it('should report isEmpty correctly', () => {
    const buf = new StreamBuffer(10)
    expect(buf.isEmpty).toBe(true)
    buf.write({ type: 'token', content: 'x' })
    expect(buf.isEmpty).toBe(false)
  })

  it('should report isFull correctly', () => {
    const buf = new StreamBuffer(1)
    expect(buf.isFull).toBe(false)
    buf.write({ type: 'token', content: 'x' })
    expect(buf.isFull).toBe(true)
  })

  it('should report size correctly', () => {
    const buf = new StreamBuffer(10)
    expect(buf.size).toBe(0)
    buf.write({ type: 'token', content: 'x' })
    expect(buf.size).toBe(1)
  })

  it('should invoke onDrain handlers when buffer empties', () => {
    const buf = new StreamBuffer(10)
    const drain = vi.fn()
    buf.onDrain(drain)
    buf.write({ type: 'token', content: 'a' })
    buf.read()
    expect(drain).toHaveBeenCalled()
  })

  it('should invoke onDrain on flush', () => {
    const buf = new StreamBuffer(10)
    const drain = vi.fn()
    buf.onDrain(drain)
    buf.write({ type: 'token', content: 'a' })
    buf.flush()
    expect(drain).toHaveBeenCalled()
  })
})

// ── StreamChannel ──

describe('StreamChannel', () => {
  let channel: StreamChannel

  beforeEach(() => {
    channel = new StreamChannel('ch1', 'test-topic')
  })

  it('should subscribe and increase subscriber count', () => {
    const sub = channel.subscribe(() => {})
    expect(sub.id).toBeTruthy()
    expect(channel.getSubscriberCount()).toBe(1)
  })

  it('should publish events to all subscribers', async () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    channel.subscribe(h1)
    channel.subscribe(h2)
    const event: SSEEvent = { data: 'hello' }
    await channel.publish(event)
    expect(h1).toHaveBeenCalledWith(event)
    expect(h2).toHaveBeenCalledWith(event)
  })

  it('should unsubscribe a subscriber', () => {
    const sub = channel.subscribe(() => {})
    expect(channel.unsubscribe(sub.id)).toBe(true)
    expect(channel.getSubscriberCount()).toBe(0)
  })

  it('should return false when unsubscribing unknown id', () => {
    expect(channel.unsubscribe('nonexistent')).toBe(false)
  })

  it('should apply filter function', async () => {
    const handler = vi.fn()
    channel.subscribe(handler, e => e.event === 'important')
    await channel.publish({ data: 'skip', event: 'trivial' })
    await channel.publish({ data: 'keep', event: 'important' })
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0][0].data).toBe('keep')
  })

  it('should return correct subscriber count', () => {
    channel.subscribe(() => {})
    channel.subscribe(() => {})
    expect(channel.getSubscriberCount()).toBe(2)
  })

  it('should close and remove all subscribers', () => {
    channel.subscribe(() => {})
    channel.subscribe(() => {})
    channel.close()
    expect(channel.getSubscriberCount()).toBe(0)
  })

  it('should throw when subscribing to a closed channel', () => {
    channel.close()
    expect(() => channel.subscribe(() => {})).toThrow(/closed/)
  })

  it('should not publish on a closed channel', async () => {
    const handler = vi.fn()
    channel.subscribe(handler)
    channel.close()
    await channel.publish({ data: 'nope' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('should return accurate info via toInfo', () => {
    channel.subscribe(() => {})
    const info = channel.toInfo()
    expect(info.topic).toBe('test-topic')
    expect(info.id).toBe('ch1')
    expect(info.subscribers).toHaveLength(1)
    expect(info.createdAt).toBeGreaterThan(0)
  })
})

// ── StreamManager ──

describe('StreamManager', () => {
  let manager: StreamManager

  beforeEach(() => {
    manager = new StreamManager()
  })

  it('should create a channel', () => {
    const ch = manager.createChannel('topic-a')
    expect(ch.topic).toBe('topic-a')
  })

  it('should return existing channel if topic already exists', () => {
    const ch1 = manager.createChannel('dup')
    const ch2 = manager.createChannel('dup')
    expect(ch1).toBe(ch2)
  })

  it('should close a channel', () => {
    manager.createChannel('topic-a')
    expect(manager.closeChannel('topic-a')).toBe(true)
    expect(manager.getChannel('topic-a')).toBeUndefined()
  })

  it('should return false when closing non-existent channel', () => {
    expect(manager.closeChannel('nope')).toBe(false)
  })

  it('should get a channel by topic', () => {
    manager.createChannel('topic-x')
    expect(manager.getChannel('topic-x')).toBeDefined()
  })

  it('should list all channels', () => {
    manager.createChannel('a')
    manager.createChannel('b')
    const list = manager.listChannels()
    expect(list).toHaveLength(2)
    expect(list.map(c => c.topic).sort()).toEqual(['a', 'b'])
  })

  it('should broadcast to all channels', async () => {
    const ch1 = manager.createChannel('a')
    const ch2 = manager.createChannel('b')
    const h1 = vi.fn()
    const h2 = vi.fn()
    ch1.subscribe(h1)
    ch2.subscribe(h2)
    await manager.broadcast({ data: 'hello' })
    expect(h1).toHaveBeenCalledTimes(1)
    expect(h2).toHaveBeenCalledTimes(1)
  })

  it('should return accurate stats', async () => {
    manager.createChannel('a')
    manager.createChannel('b')
    const stats = manager.getStats()
    expect(stats.totalConnections).toBe(2)
    expect(stats.activeConnections).toBe(2)
  })

  it('should track messages sent on broadcast', async () => {
    const ch = manager.createChannel('a')
    ch.subscribe(() => {})
    await manager.broadcast({ data: 'test' })
    expect(manager.getStats().messagesSent).toBe(1)
  })

  it('should decrement activeConnections on close', () => {
    manager.createChannel('a')
    manager.closeChannel('a')
    expect(manager.getStats().activeConnections).toBe(0)
  })
})

// ── AIStreamProcessor ──

describe('AIStreamProcessor', () => {
  let proc: AIStreamProcessor

  beforeEach(() => {
    proc = new AIStreamProcessor()
  })

  async function collectChunks(gen: AsyncGenerator<StreamChunk>): Promise<StreamChunk[]> {
    const chunks: StreamChunk[] = []
    for await (const chunk of gen) chunks.push(chunk)
    return chunks
  }

  it('should stream chat response with thinking, tokens, done', async () => {
    const chunks = await collectChunks(proc.streamChatResponse('hello world'))
    expect(chunks[0].type).toBe('thinking')
    expect(chunks[chunks.length - 1].type).toBe('done')
    const tokens = chunks.filter(c => c.type === 'token')
    expect(tokens).toHaveLength(2)
    expect(tokens[0].content).toBe('hello')
    expect(tokens[1].content).toBe(' world')
  })

  it('should include prompt in chat metadata', async () => {
    const chunks = await collectChunks(proc.streamChatResponse('hi', { maxTokens: 10 }))
    expect(chunks[0].metadata).toMatchObject({ prompt: 'hi', maxTokens: 10 })
  })

  it('should stream code analysis with progress per line', async () => {
    const chunks = await collectChunks(proc.streamCodeAnalysis('const a = 1\nconst b = 2', 'ts'))
    expect(chunks[0].type).toBe('thinking')
    expect(chunks[chunks.length - 1].type).toBe('done')
    const tokens = chunks.filter(c => c.type === 'token')
    expect(tokens.length).toBeGreaterThanOrEqual(2)
  })

  it('should stream tool execution lifecycle', async () => {
    const chunks = await collectChunks(proc.streamToolExecution('search', { q: 'test' }))
    const types = chunks.map(c => c.type)
    expect(types).toContain('tool_call')
    expect(types).toContain('tool_result')
    expect(types[types.length - 1]).toBe('done')
  })

  it('should end every stream with done chunk', async () => {
    for (const gen of [
      proc.streamChatResponse('x'),
      proc.streamCodeAnalysis('y', 'js'),
      proc.streamToolExecution('t', {}),
    ]) {
      const chunks = await collectChunks(gen)
      expect(chunks[chunks.length - 1].type).toBe('done')
    }
  })

  it('should expose formatter via getFormatter', () => {
    expect(proc.getFormatter()).toBeInstanceOf(SSEFormatter)
  })
})

// ── StreamTransformPipeline ──

describe('StreamTransformPipeline', () => {
  it('should add and apply a custom transform', () => {
    const pipe = new StreamTransformPipeline()
    pipe.addTransform('upper', c => ({ ...c, content: c.content.toUpperCase() }))
    const result = pipe.process({ type: 'text', content: 'hello' })
    expect(result?.content).toBe('HELLO')
  })

  it('should remove a transform', () => {
    const pipe = new StreamTransformPipeline()
    expect(pipe.removeTransform('tokenCounter')).toBe(true)
    expect(pipe.listTransforms()).not.toContain('tokenCounter')
  })

  it('should apply multiple transforms in insertion order', () => {
    const pipe = new StreamTransformPipeline()
    // Remove defaults to simplify
    pipe.removeTransform('tokenCounter')
    pipe.removeTransform('latencyTracker')
    pipe.removeTransform('contentFilter')

    pipe.addTransform('addA', c => ({ ...c, content: c.content + 'A' }))
    pipe.addTransform('addB', c => ({ ...c, content: c.content + 'B' }))
    const result = pipe.process({ type: 'text', content: '' })
    expect(result?.content).toBe('AB')
  })

  it('should return null if a transform filters out the chunk', () => {
    const pipe = new StreamTransformPipeline()
    pipe.removeTransform('tokenCounter')
    pipe.removeTransform('latencyTracker')
    pipe.removeTransform('contentFilter')

    pipe.addTransform('block', () => null)
    pipe.addTransform('never', c => c)
    expect(pipe.process({ type: 'text', content: 'x' })).toBeNull()
  })

  it('should list registered transform names', () => {
    const pipe = new StreamTransformPipeline()
    expect(pipe.listTransforms()).toContain('tokenCounter')
    expect(pipe.listTransforms()).toContain('latencyTracker')
    expect(pipe.listTransforms()).toContain('contentFilter')
  })

  it('should increment token count via built-in tokenCounter', () => {
    const counter = StreamTransformPipeline.tokenCounter()
    const r1 = counter({ type: 'token', content: 'a' })
    const r2 = counter({ type: 'token', content: 'b' })
    expect(r1?.metadata?._tokenCount).toBe(1)
    expect(r2?.metadata?._tokenCount).toBe(2)
  })

  it('should stamp processedAt via built-in latencyTracker', () => {
    const tracker = StreamTransformPipeline.latencyTracker()
    const result = tracker({ type: 'text', content: 'x' })
    expect(result?.metadata?._processedAt).toBeGreaterThan(0)
  })

  it('should filter content via built-in contentFilter', () => {
    const filter = StreamTransformPipeline.contentFilter([/secret/])
    expect(filter({ type: 'text', content: 'secret data' })).toBeNull()
    expect(filter({ type: 'text', content: 'safe data' })).not.toBeNull()
  })
})

// ── Factory helpers ──

describe('Factory helpers', () => {
  it('createStreamManager returns a StreamManager', () => {
    expect(createStreamManager()).toBeInstanceOf(StreamManager)
  })

  it('createAIStreamProcessor returns an AIStreamProcessor', () => {
    expect(createAIStreamProcessor()).toBeInstanceOf(AIStreamProcessor)
  })

  it('createTransformPipeline returns a StreamTransformPipeline', () => {
    expect(createTransformPipeline()).toBeInstanceOf(StreamTransformPipeline)
  })
})
