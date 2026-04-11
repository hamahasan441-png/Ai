import { describe, it, expect, beforeEach } from 'vitest'
import { Counter, Gauge, Histogram, MetricsRegistry } from '../../services/metrics.js'

describe('Counter', () => {
  let counter: Counter

  beforeEach(() => {
    counter = new Counter('test_counter', 'A test counter')
  })

  it('starts at zero', () => {
    expect(counter.get()).toBe(0)
  })

  it('increments by 1 by default', () => {
    counter.inc()
    expect(counter.get()).toBe(1)
  })

  it('increments by custom amount', () => {
    counter.inc(undefined, 5)
    expect(counter.get()).toBe(5)
  })

  it('tracks separate values per label set', () => {
    counter.inc({ method: 'GET' })
    counter.inc({ method: 'POST' })
    counter.inc({ method: 'GET' })

    expect(counter.get({ method: 'GET' })).toBe(2)
    expect(counter.get({ method: 'POST' })).toBe(1)
  })

  it('resets all values', () => {
    counter.inc({ a: '1' })
    counter.inc({ a: '2' })
    counter.reset()
    expect(counter.get({ a: '1' })).toBe(0)
    expect(counter.get({ a: '2' })).toBe(0)
  })

  it('produces a snapshot', () => {
    counter.inc({ method: 'GET' }, 3)
    const snapshot = counter.snapshot()
    expect(snapshot.name).toBe('test_counter')
    expect(snapshot.type).toBe('counter')
    expect(snapshot.values).toHaveLength(1)
    expect(snapshot.values[0]?.value).toBe(3)
  })
})

describe('Gauge', () => {
  let gauge: Gauge

  beforeEach(() => {
    gauge = new Gauge('test_gauge', 'A test gauge')
  })

  it('starts at zero', () => {
    expect(gauge.get()).toBe(0)
  })

  it('sets value', () => {
    gauge.set(42)
    expect(gauge.get()).toBe(42)
  })

  it('increments', () => {
    gauge.set(10)
    gauge.inc()
    expect(gauge.get()).toBe(11)
  })

  it('decrements', () => {
    gauge.set(10)
    gauge.dec()
    expect(gauge.get()).toBe(9)
  })

  it('tracks separate values per label set', () => {
    gauge.set(5, { type: 'memory' })
    gauge.set(10, { type: 'disk' })
    expect(gauge.get({ type: 'memory' })).toBe(5)
    expect(gauge.get({ type: 'disk' })).toBe(10)
  })

  it('produces a snapshot', () => {
    gauge.set(42)
    const snapshot = gauge.snapshot()
    expect(snapshot.type).toBe('gauge')
    expect(snapshot.values[0]?.value).toBe(42)
  })
})

describe('Histogram', () => {
  let histogram: Histogram

  beforeEach(() => {
    histogram = new Histogram('test_histogram', 'A test histogram')
  })

  it('records observations', () => {
    histogram.observe(10)
    histogram.observe(20)
    histogram.observe(30)

    const summary = histogram.getSummary()
    expect(summary).toBeDefined()
    expect(summary?.count).toBe(3)
    expect(summary?.sum).toBe(60)
    expect(summary?.min).toBe(10)
    expect(summary?.max).toBe(30)
  })

  it('calculates percentiles', () => {
    for (let i = 1; i <= 100; i++) {
      histogram.observe(i)
    }

    const summary = histogram.getSummary()
    expect(summary?.p50).toBe(50)
    expect(summary?.p95).toBe(95)
    expect(summary?.p99).toBe(99)
  })

  it('returns undefined for empty histograms', () => {
    expect(histogram.getSummary()).toBeUndefined()
  })

  it('tracks separate observations per label set', () => {
    histogram.observe(10, { endpoint: '/chat' })
    histogram.observe(100, { endpoint: '/tools' })

    const chatSummary = histogram.getSummary({ endpoint: '/chat' })
    const toolsSummary = histogram.getSummary({ endpoint: '/tools' })

    expect(chatSummary?.count).toBe(1)
    expect(chatSummary?.value).toBe(10)
    expect(toolsSummary?.count).toBe(1)
    expect(toolsSummary?.value).toBe(100)
  })

  it('computes bucket counts', () => {
    histogram.observe(3)
    histogram.observe(15)
    histogram.observe(500)
    histogram.observe(5000)

    const summary = histogram.getSummary()
    expect(summary?.buckets?.['5']).toBe(1)
    expect(summary?.buckets?.['25']).toBe(2)
    expect(summary?.buckets?.['1000']).toBe(3)
    expect(summary?.buckets?.['+Inf']).toBe(4)
  })

  it('resets observations', () => {
    histogram.observe(42)
    histogram.reset()
    expect(histogram.getSummary()).toBeUndefined()
  })

  it('produces a snapshot', () => {
    histogram.observe(10)
    histogram.observe(20)
    const snapshot = histogram.snapshot()
    expect(snapshot.type).toBe('histogram')
    expect(snapshot.values).toHaveLength(1)
    expect(snapshot.values[0]?.count).toBe(2)
  })
})

describe('MetricsRegistry', () => {
  let registry: MetricsRegistry

  beforeEach(() => {
    registry = new MetricsRegistry({ prefix: 'test' })
  })

  it('creates and caches counters', () => {
    const c1 = registry.counter('requests', 'Total requests')
    const c2 = registry.counter('requests')
    expect(c1).toBe(c2)
    expect(c1.name).toBe('test_requests')
  })

  it('creates and caches gauges', () => {
    const g1 = registry.gauge('connections', 'Active connections')
    const g2 = registry.gauge('connections')
    expect(g1).toBe(g2)
  })

  it('creates and caches histograms', () => {
    const h1 = registry.histogram('latency', 'Request latency')
    const h2 = registry.histogram('latency')
    expect(h1).toBe(h2)
  })

  it('applies prefix to names', () => {
    const counter = registry.counter('foo')
    expect(counter.name).toBe('test_foo')
  })

  it('snapshots all metrics', () => {
    registry.counter('c1').inc()
    registry.gauge('g1').set(5)
    registry.histogram('h1').observe(10)

    const snapshots = registry.snapshot()
    expect(snapshots).toHaveLength(3)
    expect(snapshots.map(s => s.name).sort()).toEqual(['test_c1', 'test_g1', 'test_h1'])
  })

  it('resets all metrics', () => {
    const counter = registry.counter('c1')
    counter.inc(undefined, 10)
    registry.reset()
    expect(counter.get()).toBe(0)
  })

  it('exports as JSON', () => {
    registry.counter('requests').inc(undefined, 5)
    registry.gauge('active').set(3)
    registry.histogram('latency').observe(42)

    const json = registry.toJSON()
    expect(json['test_requests']).toEqual({ type: 'counter', value: 5 })
    expect(json['test_active']).toEqual({ type: 'gauge', value: 3 })
    expect(json['test_latency']).toHaveProperty('type', 'histogram')
  })

  it('works without prefix', () => {
    const noPrefixRegistry = new MetricsRegistry()
    const counter = noPrefixRegistry.counter('raw_counter')
    expect(counter.name).toBe('raw_counter')
  })
})
