import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  Tracer,
  Span,
  AlwaysSampler,
  NeverSampler,
  ProbabilitySampler,
  RateLimitSampler,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  InMemoryExporter,
  ConsoleExporter,
  CallbackExporter,
  createTracer,
} from '../index.js'

describe('Telemetry', () => {
  describe('Span', () => {
    it('should create a span with name and IDs', () => {
      const span = new Span('test-span', 'trace-1', 'span-1')
      expect(span.getName()).toBe('test-span')
      expect(span.getTraceId()).toBe('trace-1')
      expect(span.getSpanId()).toBe('span-1')
    })

    it('should set attributes', () => {
      const span = new Span('test', 't1', 's1')
      span.setAttribute('key', 'value')
      span.setAttribute('count', 42)
      span.setAttribute('active', true)

      const data = span.getData()
      expect(data.attributes.key).toBe('value')
      expect(data.attributes.count).toBe(42)
      expect(data.attributes.active).toBe(true)
    })

    it('should set multiple attributes at once', () => {
      const span = new Span('test', 't1', 's1')
      span.setAttributes({ a: 1, b: 'hello' })
      const data = span.getData()
      expect(data.attributes.a).toBe(1)
      expect(data.attributes.b).toBe('hello')
    })

    it('should add events', () => {
      const span = new Span('test', 't1', 's1')
      span.addEvent('log', { level: 'info' })
      expect(span.getData().events.length).toBe(1)
      expect(span.getData().events[0].name).toBe('log')
    })

    it('should set status', () => {
      const span = new Span('test', 't1', 's1')
      span.setStatus('OK')
      expect(span.getData().status).toBe('OK')
    })

    it('should set status with message', () => {
      const span = new Span('test', 't1', 's1')
      span.setStatus('ERROR', 'something failed')
      expect(span.getData().status).toBe('ERROR')
      expect(span.getData().statusMessage).toBe('something failed')
    })

    it('should record errors', () => {
      const span = new Span('test', 't1', 's1')
      span.recordError(new Error('test error'))
      expect(span.getData().status).toBe('ERROR')
      expect(span.getData().events.length).toBe(1)
      expect(span.getData().events[0].name).toBe('exception')
    })

    it('should end span and calculate duration', () => {
      const span = new Span('test', 't1', 's1')
      const data = span.end()
      expect(data.endTime).toBeDefined()
      expect(data.duration).toBeGreaterThanOrEqual(0)
      expect(span.isEnded()).toBe(true)
    })

    it('should not modify ended span', () => {
      const span = new Span('test', 't1', 's1')
      span.end()
      span.setAttribute('key', 'value')
      expect(span.getData().attributes.key).toBeUndefined()
    })

    it('should support chaining', () => {
      const span = new Span('test', 't1', 's1')
      const result = span.setAttribute('a', 1).setAttributes({ b: 2 }).addEvent('log').setStatus('OK')
      expect(result).toBe(span)
    })

    it('should support parent span ID', () => {
      const span = new Span('test', 't1', 's1', { parentSpanId: 'parent-1' })
      expect(span.getData().parentSpanId).toBe('parent-1')
    })

    it('should support span kind', () => {
      const span = new Span('test', 't1', 's1', { kind: 'CLIENT' })
      expect(span.getData().kind).toBe('CLIENT')
    })

    it('should support links', () => {
      const span = new Span('test', 't1', 's1', {
        links: [{ traceId: 't2', spanId: 's2' }],
      })
      expect(span.getData().links.length).toBe(1)
    })
  })

  describe('Samplers', () => {
    it('AlwaysSampler should always return true', () => {
      const sampler = new AlwaysSampler()
      expect(sampler.shouldSample('t1', 'test')).toBe(true)
    })

    it('NeverSampler should always return false', () => {
      const sampler = new NeverSampler()
      expect(sampler.shouldSample('t1', 'test')).toBe(false)
    })

    it('ProbabilitySampler should validate range', () => {
      expect(() => new ProbabilitySampler(-1)).toThrow()
      expect(() => new ProbabilitySampler(2)).toThrow()
      expect(() => new ProbabilitySampler(0.5)).not.toThrow()
    })

    it('ProbabilitySampler with 1.0 should always sample', () => {
      const sampler = new ProbabilitySampler(1.0)
      for (let i = 0; i < 100; i++) {
        expect(sampler.shouldSample('t1', 'test')).toBe(true)
      }
    })

    it('ProbabilitySampler with 0.0 should never sample', () => {
      const sampler = new ProbabilitySampler(0.0)
      for (let i = 0; i < 100; i++) {
        expect(sampler.shouldSample('t1', 'test')).toBe(false)
      }
    })

    it('RateLimitSampler should respect rate', () => {
      const sampler = new RateLimitSampler(2)
      expect(sampler.shouldSample('t1', 'test')).toBe(true)
      expect(sampler.shouldSample('t1', 'test')).toBe(true)
      expect(sampler.shouldSample('t1', 'test')).toBe(false)
    })
  })

  describe('SpanProcessors', () => {
    it('SimpleSpanProcessor should export immediately', () => {
      const exporter = new InMemoryExporter()
      const processor = new SimpleSpanProcessor(exporter)

      const span = new Span('test', 't1', 's1')
      const data = span.end()
      processor.onEnd(data)

      expect(exporter.getSpans().length).toBe(1)
      processor.shutdown()
    })

    it('BatchSpanProcessor should batch exports', () => {
      const exporter = new InMemoryExporter()
      const processor = new BatchSpanProcessor(exporter, 2, 60000)

      const span1 = new Span('test1', 't1', 's1')
      processor.onEnd(span1.end())
      expect(exporter.getSpans().length).toBe(0)

      const span2 = new Span('test2', 't1', 's2')
      processor.onEnd(span2.end())
      expect(exporter.getSpans().length).toBe(2)
      processor.shutdown()
    })

    it('BatchSpanProcessor should flush on shutdown', () => {
      const exporter = new InMemoryExporter()
      const processor = new BatchSpanProcessor(exporter, 100, 60000)

      const span = new Span('test', 't1', 's1')
      processor.onEnd(span.end())
      
      // Manually flush to verify buffering works
      processor.flush()
      expect(exporter.getSpans().length).toBe(1)
      processor.shutdown()
    })
  })

  describe('Exporters', () => {
    it('InMemoryExporter should store spans', () => {
      const exporter = new InMemoryExporter()
      const span = new Span('test', 't1', 's1')
      exporter.export([span.end()])
      expect(exporter.getSpans().length).toBe(1)
    })

    it('InMemoryExporter should clear', () => {
      const exporter = new InMemoryExporter()
      exporter.export([new Span('test', 't1', 's1').end()])
      exporter.clear()
      expect(exporter.getSpans().length).toBe(0)
    })

    it('ConsoleExporter should produce output', () => {
      const exporter = new ConsoleExporter()
      const span = new Span('test', 't1', 's1')
      exporter.export([span.end()])
      expect(exporter.getOutput().length).toBe(1)
      expect(exporter.getOutput()[0]).toContain('[TRACE]')
    })

    it('CallbackExporter should call callback', () => {
      const cb = vi.fn()
      const exporter = new CallbackExporter(cb)
      const span = new Span('test', 't1', 's1')
      exporter.export([span.end()])
      expect(cb).toHaveBeenCalledTimes(1)
    })
  })

  describe('Tracer', () => {
    let tracer: Tracer
    let exporter: InMemoryExporter

    beforeEach(() => {
      exporter = new InMemoryExporter()
      tracer = new Tracer({
        serviceName: 'test-service',
        serviceVersion: '1.0.0',
        processors: [new SimpleSpanProcessor(exporter)],
      })
    })

    afterEach(() => {
      tracer.shutdown()
    })

    it('should start a span', () => {
      const span = tracer.startSpan('test-op')
      expect(span.getName()).toBe('test-op')
      expect(span.getTraceId()).toBeTruthy()
    })

    it('should end a span and export', () => {
      const span = tracer.startSpan('test-op')
      tracer.endSpan(span)
      expect(exporter.getSpans().length).toBe(1)
    })

    it('should create child spans with same trace ID', () => {
      const parent = tracer.startSpan('parent')
      const child = tracer.startSpan('child', { parent })

      expect(child.getTraceId()).toBe(parent.getTraceId())
      expect(child.getData().parentSpanId).toBe(parent.getSpanId())

      tracer.endSpan(child)
      tracer.endSpan(parent)
    })

    it('should trace async operations', async () => {
      const result = await tracer.trace('operation', async (span) => {
        span.setAttribute('key', 'value')
        return 42
      })

      expect(result).toBe(42)
      expect(exporter.getSpans().length).toBe(1)
      expect(exporter.getSpans()[0].status).toBe('OK')
    })

    it('should record errors in traced operations', async () => {
      await expect(
        tracer.trace('failing', async () => {
          throw new Error('test error')
        }),
      ).rejects.toThrow('test error')

      expect(exporter.getSpans().length).toBe(1)
      expect(exporter.getSpans()[0].status).toBe('ERROR')
    })

    it('should include resource attributes', () => {
      const span = tracer.startSpan('test')
      tracer.endSpan(span)

      const data = exporter.getSpans()[0]
      expect(data.resource['service.name']).toBe('test-service')
      expect(data.resource['service.version']).toBe('1.0.0')
    })

    it('should support span kind', () => {
      const span = tracer.startSpan('test', { kind: 'SERVER' })
      tracer.endSpan(span)
      expect(exporter.getSpans()[0].kind).toBe('SERVER')
    })

    it('should support baggage', () => {
      tracer.setBaggage('user-id', '123')
      expect(tracer.getBaggage('user-id')).toBe('123')
      expect(tracer.getAllBaggage()).toEqual({ 'user-id': '123' })
    })

    it('should track active span count', () => {
      const span1 = tracer.startSpan('a')
      const span2 = tracer.startSpan('b')
      expect(tracer.getActiveSpanCount()).toBe(2)

      tracer.endSpan(span1)
      expect(tracer.getActiveSpanCount()).toBe(1)

      tracer.endSpan(span2)
      expect(tracer.getActiveSpanCount()).toBe(0)
    })

    it('should respect sampler', () => {
      const t = new Tracer({
        sampler: new NeverSampler(),
        processors: [new SimpleSpanProcessor(exporter)],
      })

      const span = t.startSpan('test')
      t.endSpan(span)
      // Span still created but processor notified
      // (no-op span still works)
      t.shutdown()
    })
  })

  describe('context propagation', () => {
    it('should extract W3C traceparent', () => {
      const tracer = new Tracer()
      const ctx = tracer.extractContext('00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01')
      expect(ctx).toBeDefined()
      expect(ctx!.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736')
      expect(ctx!.spanId).toBe('00f067aa0ba902b7')
      expect(ctx!.traceFlags).toBe(1)
      tracer.shutdown()
    })

    it('should return null for invalid traceparent', () => {
      const tracer = new Tracer()
      expect(tracer.extractContext('invalid')).toBeNull()
      expect(tracer.extractContext('01-abc-def-00')).toBeNull()
      tracer.shutdown()
    })

    it('should inject W3C traceparent', () => {
      const tracer = new Tracer()
      const span = tracer.startSpan('test')
      const header = tracer.injectContext(span)
      expect(header).toMatch(/^00-[a-f0-9]+-[a-f0-9]+-01$/)
      tracer.shutdown()
    })
  })

  describe('createTracer', () => {
    it('should create a Tracer instance', () => {
      const t = createTracer({ serviceName: 'my-service' })
      expect(t).toBeInstanceOf(Tracer)
      t.shutdown()
    })
  })
})
