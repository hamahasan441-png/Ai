/**
 * 🔍 Telemetry — OpenTelemetry-compatible distributed tracing with spans, context propagation, and sampling
 *
 * Features:
 * - Span-based tracing (start, end, add events, set attributes)
 * - Trace context propagation (W3C traceparent format)
 * - Parent-child span relationships
 * - Configurable sampling strategies (always, never, probabilistic, rate-limited)
 * - Span processors (batch, simple)
 * - Span exporters (in-memory, console, callback)
 * - Automatic duration calculation
 * - Error recording on spans
 * - Span status (OK, ERROR, UNSET)
 * - Resource attributes
 * - Baggage propagation
 *
 * Zero external dependencies.
 */

// ── Types ──

export type SpanStatus = 'UNSET' | 'OK' | 'ERROR'

export type SpanKind = 'INTERNAL' | 'SERVER' | 'CLIENT' | 'PRODUCER' | 'CONSUMER'

export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined
}

export interface SpanEvent {
  name: string
  timestamp: number
  attributes?: SpanAttributes
}

export interface SpanLink {
  traceId: string
  spanId: string
  attributes?: SpanAttributes
}

export interface SpanData {
  traceId: string
  spanId: string
  parentSpanId?: string
  name: string
  kind: SpanKind
  status: SpanStatus
  statusMessage?: string
  startTime: number
  endTime?: number
  duration?: number
  attributes: SpanAttributes
  events: SpanEvent[]
  links: SpanLink[]
  resource: SpanAttributes
}

export interface TracerOptions {
  /** Service name for resource attribution */
  serviceName?: string
  /** Service version */
  serviceVersion?: string
  /** Sampling strategy */
  sampler?: Sampler
  /** Span processors */
  processors?: SpanProcessor[]
  /** Resource attributes */
  resource?: SpanAttributes
}

export interface Sampler {
  shouldSample(traceId: string, name: string): boolean
}

export interface SpanProcessor {
  onStart(span: SpanData): void
  onEnd(span: SpanData): void
  shutdown(): void
}

export interface SpanExporter {
  export(spans: SpanData[]): void
  shutdown(): void
}

export interface TraceContext {
  traceId: string
  spanId: string
  traceFlags: number
}

export interface Baggage {
  [key: string]: string
}

// ── Samplers ──

export class AlwaysSampler implements Sampler {
  shouldSample(): boolean {
    return true
  }
}

export class NeverSampler implements Sampler {
  shouldSample(): boolean {
    return false
  }
}

export class ProbabilitySampler implements Sampler {
  constructor(private readonly probability: number) {
    if (probability < 0 || probability > 1) {
      throw new Error('Probability must be between 0 and 1')
    }
  }

  shouldSample(): boolean {
    return Math.random() < this.probability
  }
}

export class RateLimitSampler implements Sampler {
  private count = 0
  private windowStart = Date.now()

  constructor(
    private readonly maxPerSecond: number,
  ) {}

  shouldSample(): boolean {
    const now = Date.now()
    if (now - this.windowStart >= 1000) {
      this.count = 0
      this.windowStart = now
    }
    if (this.count < this.maxPerSecond) {
      this.count++
      return true
    }
    return false
  }
}

// ── Span Processors ──

export class SimpleSpanProcessor implements SpanProcessor {
  constructor(private readonly exporter: SpanExporter) {}

  onStart(_span: SpanData): void {
    // No-op for simple processor
  }

  onEnd(span: SpanData): void {
    this.exporter.export([span])
  }

  shutdown(): void {
    this.exporter.shutdown()
  }
}

export class BatchSpanProcessor implements SpanProcessor {
  private buffer: SpanData[] = []
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(
    private readonly exporter: SpanExporter,
    private readonly maxBatchSize: number = 512,
    private readonly flushIntervalMs: number = 5000,
  ) {
    this.timer = setInterval(() => this.flush(), this.flushIntervalMs)
  }

  onStart(_span: SpanData): void {
    // No-op for batch processor
  }

  onEnd(span: SpanData): void {
    this.buffer.push(span)
    if (this.buffer.length >= this.maxBatchSize) {
      this.flush()
    }
  }

  flush(): void {
    if (this.buffer.length === 0) return
    const batch = this.buffer.splice(0, this.maxBatchSize)
    this.exporter.export(batch)
  }

  shutdown(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.flush()
    this.exporter.shutdown()
  }
}

// ── Span Exporters ──

export class InMemoryExporter implements SpanExporter {
  private spans: SpanData[] = []

  export(spans: SpanData[]): void {
    this.spans.push(...spans)
  }

  getSpans(): SpanData[] {
    return [...this.spans]
  }

  clear(): void {
    this.spans = []
  }

  shutdown(): void {
    this.spans = []
  }
}

export class ConsoleExporter implements SpanExporter {
  private output: string[] = []

  export(spans: SpanData[]): void {
    for (const span of spans) {
      const line = `[TRACE] ${span.name} traceId=${span.traceId} spanId=${span.spanId} duration=${span.duration}ms status=${span.status}`
      this.output.push(line)
    }
  }

  getOutput(): string[] {
    return [...this.output]
  }

  shutdown(): void {
    this.output = []
  }
}

export class CallbackExporter implements SpanExporter {
  constructor(private readonly callback: (spans: SpanData[]) => void) {}

  export(spans: SpanData[]): void {
    this.callback(spans)
  }

  shutdown(): void {
    // No-op
  }
}

// ── Span ──

export class Span {
  private data: SpanData
  private ended = false

  constructor(
    name: string,
    traceId: string,
    spanId: string,
    options?: {
      parentSpanId?: string
      kind?: SpanKind
      attributes?: SpanAttributes
      links?: SpanLink[]
      resource?: SpanAttributes
    },
  ) {
    this.data = {
      traceId,
      spanId,
      parentSpanId: options?.parentSpanId,
      name,
      kind: options?.kind ?? 'INTERNAL',
      status: 'UNSET',
      startTime: Date.now(),
      attributes: { ...options?.attributes },
      events: [],
      links: options?.links ? [...options.links] : [],
      resource: { ...options?.resource },
    }
  }

  /** Set a span attribute */
  setAttribute(key: string, value: string | number | boolean): this {
    if (!this.ended) {
      this.data.attributes[key] = value
    }
    return this
  }

  /** Set multiple attributes */
  setAttributes(attributes: SpanAttributes): this {
    if (!this.ended) {
      Object.assign(this.data.attributes, attributes)
    }
    return this
  }

  /** Add an event to the span */
  addEvent(name: string, attributes?: SpanAttributes): this {
    if (!this.ended) {
      this.data.events.push({ name, timestamp: Date.now(), attributes })
    }
    return this
  }

  /** Set span status */
  setStatus(status: SpanStatus, message?: string): this {
    if (!this.ended) {
      this.data.status = status
      this.data.statusMessage = message
    }
    return this
  }

  /** Record an error */
  recordError(error: Error): this {
    this.addEvent('exception', {
      'exception.type': error.name,
      'exception.message': error.message,
      'exception.stacktrace': error.stack ?? '',
    })
    this.setStatus('ERROR', error.message)
    return this
  }

  /** End the span */
  end(): SpanData {
    if (!this.ended) {
      this.ended = true
      this.data.endTime = Date.now()
      this.data.duration = this.data.endTime - this.data.startTime
    }
    return this.getData()
  }

  /** Check if span has ended */
  isEnded(): boolean {
    return this.ended
  }

  /** Get span data */
  getData(): SpanData {
    return { ...this.data }
  }

  /** Get trace ID */
  getTraceId(): string {
    return this.data.traceId
  }

  /** Get span ID */
  getSpanId(): string {
    return this.data.spanId
  }

  /** Get span name */
  getName(): string {
    return this.data.name
  }
}

// ── Tracer ──

export class Tracer {
  private readonly serviceName: string
  private readonly serviceVersion: string
  private readonly sampler: Sampler
  private readonly processors: SpanProcessor[]
  private readonly resource: SpanAttributes
  private activeSpans = new Map<string, Span>()
  private baggage: Baggage = {}

  constructor(options?: TracerOptions) {
    this.serviceName = options?.serviceName ?? 'unknown'
    this.serviceVersion = options?.serviceVersion ?? '0.0.0'
    this.sampler = options?.sampler ?? new AlwaysSampler()
    this.processors = options?.processors ?? []
    this.resource = {
      'service.name': this.serviceName,
      'service.version': this.serviceVersion,
      ...options?.resource,
    }
  }

  /** Start a new span */
  startSpan(
    name: string,
    options?: {
      kind?: SpanKind
      attributes?: SpanAttributes
      parent?: Span
      links?: SpanLink[]
    },
  ): Span {
    const traceId = options?.parent?.getTraceId() ?? this.generateTraceId()
    const spanId = this.generateSpanId()

    if (!this.sampler.shouldSample(traceId, name)) {
      // Return a no-op span that still works but won't be exported
      return new Span(name, traceId, spanId, {
        parentSpanId: options?.parent?.getSpanId(),
        kind: options?.kind,
        attributes: options?.attributes,
        links: options?.links,
        resource: this.resource,
      })
    }

    const span = new Span(name, traceId, spanId, {
      parentSpanId: options?.parent?.getSpanId(),
      kind: options?.kind,
      attributes: options?.attributes,
      links: options?.links,
      resource: this.resource,
    })

    this.activeSpans.set(spanId, span)

    // Notify processors
    for (const proc of this.processors) {
      proc.onStart(span.getData())
    }

    return span
  }

  /** End a span and process it */
  endSpan(span: Span): SpanData {
    const data = span.end()
    this.activeSpans.delete(span.getSpanId())

    // Notify processors
    for (const proc of this.processors) {
      proc.onEnd(data)
    }

    return data
  }

  /** Execute a function within a span */
  async trace<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    options?: { kind?: SpanKind; attributes?: SpanAttributes; parent?: Span },
  ): Promise<T> {
    const span = this.startSpan(name, options)
    try {
      const result = await fn(span)
      span.setStatus('OK')
      return result
    } catch (err) {
      if (err instanceof Error) {
        span.recordError(err)
      } else {
        span.setStatus('ERROR', String(err))
      }
      throw err
    } finally {
      this.endSpan(span)
    }
  }

  /** Set baggage (propagated context) */
  setBaggage(key: string, value: string): void {
    this.baggage[key] = value
  }

  /** Get baggage value */
  getBaggage(key: string): string | undefined {
    return this.baggage[key]
  }

  /** Get all baggage */
  getAllBaggage(): Baggage {
    return { ...this.baggage }
  }

  /** Parse W3C traceparent header */
  extractContext(traceparent: string): TraceContext | null {
    const parts = traceparent.split('-')
    if (parts.length !== 4 || parts[0] !== '00') return null

    return {
      traceId: parts[1],
      spanId: parts[2],
      traceFlags: parseInt(parts[3], 16),
    }
  }

  /** Generate W3C traceparent header */
  injectContext(span: Span): string {
    const flags = '01' // sampled
    return `00-${span.getTraceId()}-${span.getSpanId()}-${flags}`
  }

  /** Get active span count */
  getActiveSpanCount(): number {
    return this.activeSpans.size
  }

  /** Shutdown all processors */
  shutdown(): void {
    for (const proc of this.processors) {
      proc.shutdown()
    }
    this.activeSpans.clear()
  }

  // ── ID generation ──

  private generateTraceId(): string {
    return this.randomHex(16)
  }

  private generateSpanId(): string {
    return this.randomHex(8)
  }

  private randomHex(bytes: number): string {
    const arr = new Array(bytes * 2)
    const hex = '0123456789abcdef'
    for (let i = 0; i < arr.length; i++) {
      arr[i] = hex[Math.floor(Math.random() * 16)]
    }
    return arr.join('')
  }
}

/** Create a new Tracer with the given options */
export function createTracer(options?: TracerOptions): Tracer {
  return new Tracer(options)
}
