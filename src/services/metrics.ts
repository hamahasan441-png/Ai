/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Observability & Metrics Layer                                                ║
 * ║                                                                              ║
 * ║  OpenTelemetry-compatible metrics collection with:                           ║
 * ║    • Counter, Gauge, Histogram metric types                                  ║
 * ║    • Named metric registries                                                 ║
 * ║    • Label/dimension support                                                 ║
 * ║    • Periodic export (JSON file, console)                                    ║
 * ║    • Snapshot and reset support                                              ║
 * ║                                                                              ║
 * ║  Usage:                                                                      ║
 * ║    import { metrics } from './services/metrics.js'                           ║
 * ║    metrics.counter('requests_total').inc({ method: 'GET' })                  ║
 * ║    metrics.histogram('response_time_ms').observe(42, { endpoint: '/chat' })  ║
 * ║    metrics.gauge('active_connections').set(5)                                ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ──

export type MetricType = 'counter' | 'gauge' | 'histogram'
export type Labels = Record<string, string>

export interface MetricSnapshot {
  name: string
  type: MetricType
  description: string
  values: MetricValue[]
  timestamp: string
}

export interface MetricValue {
  labels: Labels
  value: number
  /** Only for histograms */
  count?: number
  sum?: number
  min?: number
  max?: number
  p50?: number
  p95?: number
  p99?: number
  buckets?: Record<string, number>
}

export interface MetricsConfig {
  /** Prefix for all metric names (default: 'ai') */
  prefix?: string
  /** Default labels added to all metrics */
  defaultLabels?: Labels
}

// ── Metric Classes ──

/**
 * Counter — a monotonically increasing value (e.g., request count, error count).
 */
export class Counter {
  readonly name: string
  readonly description: string
  private values = new Map<string, number>()

  constructor(name: string, description: string) {
    this.name = name
    this.description = description
  }

  /** Increment the counter by 1 (or a custom amount). */
  inc(labels?: Labels, amount = 1): void {
    const key = labelsToKey(labels)
    this.values.set(key, (this.values.get(key) ?? 0) + amount)
  }

  /** Get current value for given labels. */
  get(labels?: Labels): number {
    return this.values.get(labelsToKey(labels)) ?? 0
  }

  /** Reset all values. */
  reset(): void {
    this.values.clear()
  }

  /** Get snapshot of all values. */
  snapshot(): MetricSnapshot {
    return {
      name: this.name,
      type: 'counter',
      description: this.description,
      values: Array.from(this.values.entries()).map(([key, value]) => ({
        labels: keyToLabels(key),
        value,
      })),
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Gauge — a value that can go up or down (e.g., active connections, queue size).
 */
export class Gauge {
  readonly name: string
  readonly description: string
  private values = new Map<string, number>()

  constructor(name: string, description: string) {
    this.name = name
    this.description = description
  }

  /** Set the gauge to a specific value. */
  set(value: number, labels?: Labels): void {
    this.values.set(labelsToKey(labels), value)
  }

  /** Increment the gauge. */
  inc(labels?: Labels, amount = 1): void {
    const key = labelsToKey(labels)
    this.values.set(key, (this.values.get(key) ?? 0) + amount)
  }

  /** Decrement the gauge. */
  dec(labels?: Labels, amount = 1): void {
    const key = labelsToKey(labels)
    this.values.set(key, (this.values.get(key) ?? 0) - amount)
  }

  /** Get current value for given labels. */
  get(labels?: Labels): number {
    return this.values.get(labelsToKey(labels)) ?? 0
  }

  /** Reset all values. */
  reset(): void {
    this.values.clear()
  }

  /** Get snapshot of all values. */
  snapshot(): MetricSnapshot {
    return {
      name: this.name,
      type: 'gauge',
      description: this.description,
      values: Array.from(this.values.entries()).map(([key, value]) => ({
        labels: keyToLabels(key),
        value,
      })),
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Histogram — distribution of values (e.g., response times, payload sizes).
 * Computes count, sum, min, max, and percentiles (P50, P95, P99).
 */
export class Histogram {
  readonly name: string
  readonly description: string
  private observations = new Map<string, number[]>()
  private _bucketBoundaries: number[]

  constructor(name: string, description: string, bucketBoundaries?: number[]) {
    this.name = name
    this.description = description
    this._bucketBoundaries = bucketBoundaries ?? [
      5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000,
    ]
  }

  /** Record an observation. */
  observe(value: number, labels?: Labels): void {
    const key = labelsToKey(labels)
    const obs = this.observations.get(key) ?? []
    obs.push(value)
    this.observations.set(key, obs)
  }

  /** Get summary for given labels. */
  getSummary(labels?: Labels): MetricValue | undefined {
    const obs = this.observations.get(labelsToKey(labels))
    if (!obs || obs.length === 0) return undefined
    return computeHistogramSummary(labels ?? {}, obs, this._bucketBoundaries)
  }

  /** Reset all observations. */
  reset(): void {
    this.observations.clear()
  }

  /** Get snapshot of all values. */
  snapshot(): MetricSnapshot {
    return {
      name: this.name,
      type: 'histogram',
      description: this.description,
      values: Array.from(this.observations.entries()).map(([key, obs]) =>
        computeHistogramSummary(keyToLabels(key), obs, this._bucketBoundaries),
      ),
      timestamp: new Date().toISOString(),
    }
  }
}

// ── Metrics Registry ──

/**
 * Central metrics registry.
 * Manages counters, gauges, and histograms by name.
 *
 * @example
 * ```ts
 * const registry = new MetricsRegistry({ prefix: 'ai' })
 * registry.counter('requests_total', 'Total requests').inc({ method: 'chat' })
 * registry.histogram('response_time_ms', 'Response time').observe(42)
 * const snapshot = registry.snapshot()
 * ```
 */
export class MetricsRegistry {
  private counters = new Map<string, Counter>()
  private gauges = new Map<string, Gauge>()
  private histograms = new Map<string, Histogram>()
  private config: MetricsConfig

  constructor(config?: MetricsConfig) {
    this.config = config ?? {}
  }

  /** Get or create a counter. */
  counter(name: string, description = ''): Counter {
    const fullName = this._prefixed(name)
    let counter = this.counters.get(fullName)
    if (!counter) {
      counter = new Counter(fullName, description)
      this.counters.set(fullName, counter)
    }
    return counter
  }

  /** Get or create a gauge. */
  gauge(name: string, description = ''): Gauge {
    const fullName = this._prefixed(name)
    let gauge = this.gauges.get(fullName)
    if (!gauge) {
      gauge = new Gauge(fullName, description)
      this.gauges.set(fullName, gauge)
    }
    return gauge
  }

  /** Get or create a histogram. */
  histogram(name: string, description = '', buckets?: number[]): Histogram {
    const fullName = this._prefixed(name)
    let histogram = this.histograms.get(fullName)
    if (!histogram) {
      histogram = new Histogram(fullName, description, buckets)
      this.histograms.set(fullName, histogram)
    }
    return histogram
  }

  /** Get snapshots of all metrics. */
  snapshot(): MetricSnapshot[] {
    const snapshots: MetricSnapshot[] = []
    for (const counter of this.counters.values()) {
      snapshots.push(counter.snapshot())
    }
    for (const gauge of this.gauges.values()) {
      snapshots.push(gauge.snapshot())
    }
    for (const histogram of this.histograms.values()) {
      snapshots.push(histogram.snapshot())
    }
    return snapshots
  }

  /** Reset all metrics. */
  reset(): void {
    for (const counter of this.counters.values()) counter.reset()
    for (const gauge of this.gauges.values()) gauge.reset()
    for (const histogram of this.histograms.values()) histogram.reset()
  }

  /** Get summary of all metrics as a plain object. */
  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [name, counter] of this.counters) {
      result[name] = { type: 'counter', value: counter.get() }
    }
    for (const [name, gauge] of this.gauges) {
      result[name] = { type: 'gauge', value: gauge.get() }
    }
    for (const [name, histogram] of this.histograms) {
      result[name] = { type: 'histogram', summary: histogram.getSummary() }
    }
    return result
  }

  private _prefixed(name: string): string {
    return this.config.prefix ? `${this.config.prefix}_${name}` : name
  }
}

// ── Helper Functions ──

function labelsToKey(labels?: Labels): string {
  if (!labels || Object.keys(labels).length === 0) return '__default__'
  return Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(',')
}

function keyToLabels(key: string): Labels {
  if (key === '__default__') return {}
  const labels: Labels = {}
  for (const part of key.split(',')) {
    const [k, v] = part.split('=')
    if (k && v !== undefined) {
      labels[k] = v
    }
  }
  return labels
}

function computeHistogramSummary(
  labels: Labels,
  observations: number[],
  boundaries: number[],
): MetricValue {
  const sorted = [...observations].sort((a, b) => a - b)
  const count = sorted.length
  const sum = sorted.reduce((a, b) => a + b, 0)
  const min = sorted[0] ?? 0
  const max = sorted[count - 1] ?? 0

  // Percentiles
  const p50 = percentile(sorted, 0.5)
  const p95 = percentile(sorted, 0.95)
  const p99 = percentile(sorted, 0.99)

  // Buckets (cumulative)
  const buckets: Record<string, number> = {}
  for (const boundary of boundaries) {
    buckets[String(boundary)] = sorted.filter(v => v <= boundary).length
  }
  buckets['+Inf'] = count

  return {
    labels,
    value: sum / count || 0, // Average
    count,
    sum,
    min,
    max,
    p50,
    p95,
    p99,
    buckets,
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = Math.ceil(p * sorted.length) - 1
  return sorted[Math.max(0, index)] ?? 0
}

// ── Default Instance ──

/**
 * Default application metrics registry.
 *
 * @example
 * ```ts
 * import { metrics } from './services/metrics.js'
 *
 * // Track requests
 * metrics.counter('requests_total', 'Total requests').inc({ method: 'chat' })
 *
 * // Track response time
 * const timer = Date.now()
 * // ... do work ...
 * metrics.histogram('response_time_ms', 'Response time').observe(Date.now() - timer)
 *
 * // Track active sessions
 * metrics.gauge('active_sessions', 'Active sessions').set(sessionCount)
 *
 * // Get all metrics
 * const snapshot = metrics.snapshot()
 * ```
 */
export const metrics = new MetricsRegistry({ prefix: 'ai' })
