/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Temporal Reasoner — Reasoning About Time, Events, Sequences & Durations    ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Event Management — Store, retrieve, and organize temporal events         ║
 * ║    ✦ Allen's Interval Algebra — Compute all 13 temporal relations             ║
 * ║    ✦ Timeline Analysis — Detect patterns, gaps, and overlaps                 ║
 * ║    ✦ Sequence Detection — Find recurring event patterns                      ║
 * ║    ✦ Temporal Queries — Answer time-relative questions                       ║
 * ║    ✦ Duration Analysis — Statistical analysis of event durations             ║
 * ║    ✦ Forecasting — Simple trend-based event prediction                       ║
 * ║    ✦ Constraint Checking — Verify temporal consistency                       ║
 * ║    ✦ Causal Ordering — Infer causal order from temporal precedence           ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface TimePoint {
  timestamp: number
  label?: string
}

export interface TimeInterval {
  start: number
  end: number
}

export interface TemporalEvent {
  id: string
  name: string
  description: string
  interval: TimeInterval
  tags: string[]
  metadata: Record<string, unknown>
  createdAt: number
}

export interface EventSequence {
  id: string
  name: string
  eventIds: string[]
  occurrences: number
  avgGap: number // average gap (ms) between consecutive events
  confidence: number
  detectedAt: number
}

/** Allen's 13 interval relations. */
export type TemporalRelation =
  | 'before'
  | 'after'
  | 'meets'
  | 'met-by'
  | 'overlaps'
  | 'overlapped-by'
  | 'during'
  | 'contains'
  | 'starts'
  | 'started-by'
  | 'finishes'
  | 'finished-by'
  | 'equals'

export interface TemporalConstraint {
  id: string
  eventIdA: string
  eventIdB: string
  relation: TemporalRelation
  description: string
  createdAt: number
}

export interface TemporalPattern {
  id: string
  name: string
  type: 'periodic' | 'burst' | 'trend' | 'gap' | 'cluster'
  eventIds: string[]
  description: string
  periodMs?: number // for periodic patterns
  trendDirection?: 'increasing' | 'decreasing' | 'stable'
  confidence: number
  detectedAt: number
}

export interface TimelineAnalysis {
  totalEvents: number
  timespan: TimeInterval | null
  patterns: TemporalPattern[]
  gaps: TimeInterval[]
  overlaps: Array<{ eventA: string; eventB: string; overlapInterval: TimeInterval }>
  densityPerUnit: number // events per hour
  busiestPeriod: TimeInterval | null
}

export interface TemporalQuery {
  type: 'before' | 'after' | 'during' | 'between' | 'overlapping' | 'nearest'
  referenceEventId?: string
  referenceTime?: number
  rangeStart?: number
  rangeEnd?: number
  tags?: string[]
  limit?: number
}

export interface TemporalQueryResult {
  query: TemporalQuery
  events: TemporalEvent[]
  count: number
  executionTimeMs: number
}

export interface TemporalReasonerConfig {
  maxEvents: number
  maxConstraints: number
  maxSequences: number
  gapThresholdMs: number // minimum gap to be considered notable
  clusterThresholdMs: number // maximum distance to cluster events together
  forecastHorizon: number // number of future intervals to forecast
  periodicityTolerance: number // tolerance ratio for periodicity detection (0-1)
}

export interface TemporalReasonerStats {
  totalEvents: number
  totalConstraints: number
  totalSequences: number
  totalPatterns: number
  totalQueries: number
  avgEventDurationMs: number
  timespanMs: number
  constraintViolations: number
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: TemporalReasonerConfig = {
  maxEvents: 10000,
  maxConstraints: 1000,
  maxSequences: 200,
  gapThresholdMs: 3600000, // 1 hour
  clusterThresholdMs: 300000, // 5 minutes
  forecastHorizon: 5,
  periodicityTolerance: 0.15,
}

/** Milliseconds per hour — used for density calculations. */
const MS_PER_HOUR = 3_600_000

/** Minimum events required to detect a periodic pattern. */
const MIN_EVENTS_FOR_PERIODICITY = 3

/** Minimum events required for meaningful duration statistics. */
const MIN_EVENTS_FOR_STATS = 2

/** Minimum sequence length to be considered a pattern. */
const MIN_SEQUENCE_LENGTH = 2

/** Maximum candidate subsequences to evaluate per detection pass. */
const MAX_SUBSEQUENCE_CANDIDATES = 500

/** Smoothing window size for trend detection. */
const TREND_WINDOW = 3

// ── Internal Helpers ─────────────────────────────────────────────────────────

/** Generate a unique event ID. */
let eventCounter = 0
function generateEventId(): string {
  return `evt_${Date.now().toString(36)}_${(++eventCounter).toString(36)}`
}

/** Generate a unique constraint ID. */
let constraintCounter = 0
function generateConstraintId(): string {
  return `cst_${Date.now().toString(36)}_${(++constraintCounter).toString(36)}`
}

/** Generate a unique sequence ID. */
let sequenceCounter = 0
function generateSequenceId(): string {
  return `seq_${Date.now().toString(36)}_${(++sequenceCounter).toString(36)}`
}

/** Generate a unique pattern ID. */
let patternCounter = 0
function generatePatternId(): string {
  return `pat_${Date.now().toString(36)}_${(++patternCounter).toString(36)}`
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Compute Allen's interval relation between two time intervals.
 *
 * Given intervals A = [a1, a2] and B = [b1, b2], the 13 mutually exclusive
 * relations are determined by comparing the four endpoints.
 */
function allenRelation(a: TimeInterval, b: TimeInterval): TemporalRelation {
  const a1 = a.start
  const a2 = a.end
  const b1 = b.start
  const b2 = b.end

  if (a2 < b1) return 'before'
  if (b2 < a1) return 'after'
  if (a2 === b1) return 'meets'
  if (b2 === a1) return 'met-by'

  if (a1 === b1 && a2 === b2) return 'equals'

  if (a1 === b1 && a2 < b2) return 'starts'
  if (a1 === b1 && a2 > b2) return 'started-by'
  if (a2 === b2 && a1 > b1) return 'finishes'
  if (a2 === b2 && a1 < b1) return 'finished-by'

  if (a1 > b1 && a2 < b2) return 'during'
  if (b1 > a1 && b2 < a2) return 'contains'

  if (a1 < b1 && a2 > b1 && a2 < b2) return 'overlaps'
  return 'overlapped-by'
}

/**
 * Check whether Allen relation `actual` satisfies `required`.
 * Direct equality check — no transitive closure in this implementation.
 */
function satisfiesRelation(actual: TemporalRelation, required: TemporalRelation): boolean {
  return actual === required
}

/** Compute the overlap interval between two intervals, or null if disjoint. */
function computeOverlap(a: TimeInterval, b: TimeInterval): TimeInterval | null {
  const start = Math.max(a.start, b.start)
  const end = Math.min(a.end, b.end)
  if (start < end) return { start, end }
  return null
}

function duration(interval: TimeInterval): number {
  return interval.end - interval.start
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0
  const m = mean(values)
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/** Simple linear regression returning slope and intercept. */
function linearRegression(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = xs.length
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0 }

  const mx = mean(xs)
  const my = mean(ys)

  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx
    num += dx * (ys[i] - my)
    den += dx * dx
  }

  const slope = den !== 0 ? num / den : 0
  const intercept = my - slope * mx
  return { slope, intercept }
}

/**
 * Detect whether a set of timestamps exhibits periodicity.
 * Returns the detected period in ms, or null if no periodicity found.
 */
function detectPeriodicity(timestamps: number[], tolerance: number): number | null {
  if (timestamps.length < MIN_EVENTS_FOR_PERIODICITY) return null

  const sorted = [...timestamps].sort((a, b) => a - b)
  const gaps: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(sorted[i] - sorted[i - 1])
  }

  if (gaps.length < 2) return null

  const m = mean(gaps)
  if (m === 0) return null

  const sd = stddev(gaps)
  const cv = sd / m // coefficient of variation

  if (cv <= tolerance) return round2(m)
  return null
}

/**
 * Group events into temporal clusters based on proximity.
 * Events within `thresholdMs` of each other are placed in the same cluster.
 */
function clusterByProximity(events: TemporalEvent[], thresholdMs: number): TemporalEvent[][] {
  if (events.length === 0) return []

  const sorted = [...events].sort((a, b) => a.interval.start - b.interval.start)
  const clusters: TemporalEvent[][] = [[sorted[0]]]

  for (let i = 1; i < sorted.length; i++) {
    const currentCluster = clusters[clusters.length - 1]
    const lastEvent = currentCluster[currentCluster.length - 1]
    const gap = sorted[i].interval.start - lastEvent.interval.end

    if (gap <= thresholdMs) {
      currentCluster.push(sorted[i])
    } else {
      clusters.push([sorted[i]])
    }
  }

  return clusters
}

/**
 * Detect a trend direction from an ordered sequence of durations or values.
 * Uses a simple moving-average comparison.
 */
function detectTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < TREND_WINDOW * 2) return 'stable'

  const firstWindow = values.slice(0, TREND_WINDOW)
  const lastWindow = values.slice(-TREND_WINDOW)

  const firstAvg = mean(firstWindow)
  const lastAvg = mean(lastWindow)

  const threshold = Math.abs(firstAvg) * 0.1 || 1

  if (lastAvg - firstAvg > threshold) return 'increasing'
  if (firstAvg - lastAvg > threshold) return 'decreasing'
  return 'stable'
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class TemporalReasoner {
  private config: TemporalReasonerConfig
  private events: Map<string, TemporalEvent> = new Map()
  private constraints: Map<string, TemporalConstraint> = new Map()
  private sequences: Map<string, EventSequence> = new Map()
  private patterns: TemporalPattern[] = []
  private queryCount: number = 0
  private violationCount: number = 0

  constructor(config: Partial<TemporalReasonerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ── Event Management ─────────────────────────────────────────────────────

  /**
   * Add a new temporal event. Returns null if the limit has been reached or end < start.
   */
  addEvent(
    name: string,
    description: string,
    start: number,
    end: number,
    tags: string[] = [],
    metadata: Record<string, unknown> = {},
  ): TemporalEvent | null {
    if (this.events.size >= this.config.maxEvents) return null
    if (end < start) return null

    const event: TemporalEvent = {
      id: generateEventId(),
      name,
      description,
      interval: { start, end },
      tags: [...tags],
      metadata: { ...metadata },
      createdAt: Date.now(),
    }

    this.events.set(event.id, event)
    return event
  }

  /** Remove an event by ID. Returns true if the event was found and removed. */
  removeEvent(id: string): boolean {
    if (!this.events.has(id)) return false
    this.events.delete(id)

    // Remove any constraints referencing this event
    for (const [cid, constraint] of this.constraints.entries()) {
      if (constraint.eventIdA === id || constraint.eventIdB === id) {
        this.constraints.delete(cid)
      }
    }

    // Remove event from sequences
    for (const [sid, seq] of this.sequences.entries()) {
      seq.eventIds = seq.eventIds.filter(eid => eid !== id)
      if (seq.eventIds.length < MIN_SEQUENCE_LENGTH) {
        this.sequences.delete(sid)
      }
    }

    return true
  }

  /** Retrieve a single event by ID. */
  getEvent(id: string): TemporalEvent | null {
    return this.events.get(id) ?? null
  }

  /** Retrieve all events, optionally filtered by tags. */
  getEvents(tags?: string[]): TemporalEvent[] {
    const all = Array.from(this.events.values())
    if (!tags || tags.length === 0) return all
    const tagSet = new Set(tags)
    return all.filter(e => e.tags.some(t => tagSet.has(t)))
  }

  /** Retrieve events sorted chronologically by start time. */
  getEventsSorted(): TemporalEvent[] {
    return Array.from(this.events.values()).sort((a, b) => a.interval.start - b.interval.start)
  }

  // ── Temporal Relations ───────────────────────────────────────────────────

  /**
   * Compute the Allen interval relation between two events.
   *
   * Allen's interval algebra defines 13 mutually exclusive relations:
   *   before, after, meets, met-by, overlaps, overlapped-by,
   *   during, contains, starts, started-by, finishes, finished-by, equals
   */
  computeRelation(eventIdA: string, eventIdB: string): TemporalRelation | null {
    const a = this.events.get(eventIdA)
    const b = this.events.get(eventIdB)
    if (!a || !b) return null
    return allenRelation(a.interval, b.interval)
  }

  /**
   * Compute relations from one event to all other events.
   * Returns a map of event ID to relation.
   */
  computeAllRelations(eventId: string): Map<string, TemporalRelation> {
    const result = new Map<string, TemporalRelation>()
    const source = this.events.get(eventId)
    if (!source) return result

    for (const [id, evt] of this.events.entries()) {
      if (id === eventId) continue
      result.set(id, allenRelation(source.interval, evt.interval))
    }
    return result
  }

  // ── Timeline Analysis ────────────────────────────────────────────────────

  /** Comprehensive timeline analysis: density, gaps, overlaps, patterns, busiest period. */
  analyzeTimeline(): TimelineAnalysis {
    const sorted = this.getEventsSorted()
    if (sorted.length === 0) {
      return {
        totalEvents: 0,
        timespan: null,
        patterns: [],
        gaps: [],
        overlaps: [],
        densityPerUnit: 0,
        busiestPeriod: null,
      }
    }

    const timespan: TimeInterval = {
      start: sorted[0].interval.start,
      end: sorted[sorted.length - 1].interval.end,
    }
    const totalDuration = duration(timespan)
    const densityPerUnit =
      totalDuration > 0 ? round2((sorted.length / totalDuration) * MS_PER_HOUR) : 0

    const gaps = this.detectGaps(sorted)
    const overlaps = this.detectOverlaps(sorted)
    const patterns = this.detectPatterns(sorted)
    this.patterns = patterns
    const busiestPeriod = this.findBusiestPeriod(sorted)

    return {
      totalEvents: sorted.length,
      timespan,
      patterns,
      gaps,
      overlaps,
      densityPerUnit,
      busiestPeriod,
    }
  }

  // ── Sequence Detection ───────────────────────────────────────────────────

  /** Detect recurring event sequences by name patterns. Returns discovered sequences ranked by count. */
  detectSequences(minLength: number = MIN_SEQUENCE_LENGTH, maxLength: number = 5): EventSequence[] {
    const sorted = this.getEventsSorted()
    if (sorted.length < minLength) return []

    const names = sorted.map(e => e.name)
    const candidateMap = new Map<string, Array<{ indices: number[]; gaps: number[] }>>()
    let candidateCount = 0

    // Generate all subsequences of names within [minLength, maxLength]
    for (let len = minLength; len <= Math.min(maxLength, names.length); len++) {
      for (let i = 0; i <= names.length - len; i++) {
        if (candidateCount >= MAX_SUBSEQUENCE_CANDIDATES) break

        const subseq = names.slice(i, i + len)
        const key = subseq.join('→')
        const indices = Array.from({ length: len }, (_, k) => i + k)

        // Compute gaps between consecutive events in the subsequence
        const gaps: number[] = []
        for (let k = 1; k < indices.length; k++) {
          const prev = sorted[indices[k - 1]]
          const curr = sorted[indices[k]]
          gaps.push(curr.interval.start - prev.interval.end)
        }

        if (!candidateMap.has(key)) {
          candidateMap.set(key, [])
          candidateCount++
        }
        candidateMap.get(key)!.push({ indices, gaps })
      }
    }

    // Filter to sequences that occur more than once
    const results: EventSequence[] = []
    for (const [key, occurrences] of candidateMap.entries()) {
      if (occurrences.length < 2) continue

      const allGaps = occurrences.flatMap(o => o.gaps)
      const avgGap = allGaps.length > 0 ? round2(mean(allGaps)) : 0
      const firstOcc = occurrences[0]
      const eventIds = firstOcc.indices.map(i => sorted[i].id)

      // Confidence is based on consistency of gaps across occurrences
      const gapStd = allGaps.length > 1 ? stddev(allGaps) : 0
      const gapMean = mean(allGaps)
      const consistency = gapMean > 0 ? clamp(1 - gapStd / gapMean, 0, 1) : 1
      const confidence = round2(Math.min(occurrences.length / 5, 1) * consistency)

      const sequence: EventSequence = {
        id: generateSequenceId(),
        name: key,
        eventIds,
        occurrences: occurrences.length,
        avgGap,
        confidence,
        detectedAt: Date.now(),
      }

      results.push(sequence)
    }

    // Sort by occurrence count descending, then by confidence
    results.sort((a, b) => b.occurrences - a.occurrences || b.confidence - a.confidence)

    // Respect max sequences limit
    const limited = results.slice(0, this.config.maxSequences)
    for (const seq of limited) {
      this.sequences.set(seq.id, seq)
    }

    return limited
  }

  // ── Temporal Queries ─────────────────────────────────────────────────────

  /** Answer temporal queries (before, after, during, between, overlapping, nearest). */
  query(q: TemporalQuery): TemporalQueryResult {
    const startTime = Date.now()
    this.queryCount++

    let results: TemporalEvent[] = []
    const limit = q.limit ?? 50
    const refTime = this.resolveReferenceTime(q)

    switch (q.type) {
      case 'before':
        results = this.queryBefore(refTime)
        break
      case 'after':
        results = this.queryAfter(refTime)
        break
      case 'during':
        results = this.queryDuring(q)
        break
      case 'between':
        results = this.queryBetween(q.rangeStart ?? 0, q.rangeEnd ?? Infinity)
        break
      case 'overlapping':
        results = this.queryOverlapping(q)
        break
      case 'nearest':
        results = this.queryNearest(refTime, limit)
        break
    }

    // Apply tag filter if present
    if (q.tags && q.tags.length > 0) {
      const tagSet = new Set(q.tags)
      results = results.filter(e => e.tags.some(t => tagSet.has(t)))
    }

    // Apply limit
    results = results.slice(0, limit)

    return {
      query: q,
      events: results,
      count: results.length,
      executionTimeMs: Date.now() - startTime,
    }
  }

  // ── Duration Analysis ────────────────────────────────────────────────────

  /** Perform statistical analysis of event durations (mean, median, stddev, trend, histogram). */
  analyzeDurations(tags?: string[]): {
    count: number
    meanMs: number
    medianMs: number
    stddevMs: number
    minMs: number
    maxMs: number
    trend: 'increasing' | 'decreasing' | 'stable'
    histogram: Array<{ rangeStart: number; rangeEnd: number; count: number }>
  } {
    const events = this.getEvents(tags)
    const durations = events.map(e => duration(e.interval))

    if (durations.length < MIN_EVENTS_FOR_STATS) {
      const v = durations.length === 1 ? durations[0] : 0
      return {
        count: durations.length,
        meanMs: v,
        medianMs: v,
        stddevMs: 0,
        minMs: v,
        maxMs: v,
        trend: 'stable',
        histogram: [],
      }
    }

    const sorted = [...durations].sort((a, b) => a - b)
    const minVal = sorted[0]
    const maxVal = sorted[sorted.length - 1]

    // Build histogram with 5 equal-width bins
    const binCount = Math.min(5, durations.length)
    const binWidth = maxVal > minVal ? (maxVal - minVal) / binCount : 1
    const histogram: Array<{ rangeStart: number; rangeEnd: number; count: number }> = []

    for (let i = 0; i < binCount; i++) {
      const rangeStart = round2(minVal + i * binWidth)
      const rangeEnd = round2(minVal + (i + 1) * binWidth)
      const count = durations.filter(d =>
        i === binCount - 1 ? d >= rangeStart && d <= rangeEnd : d >= rangeStart && d < rangeEnd,
      ).length
      histogram.push({ rangeStart, rangeEnd, count })
    }

    // Sort events by start time for trend analysis
    const chronological = events
      .sort((a, b) => a.interval.start - b.interval.start)
      .map(e => duration(e.interval))
    const trend = detectTrend(chronological)

    return {
      count: durations.length,
      meanMs: round2(mean(durations)),
      medianMs: round2(median(durations)),
      stddevMs: round2(stddev(durations)),
      minMs: minVal,
      maxMs: maxVal,
      trend,
      histogram,
    }
  }

  // ── Forecasting ──────────────────────────────────────────────────────────

  /**
   * Forecast future events based on periodicity detection or linear regression.
   * Simple trend-based approach, not ML.
   */
  forecast(
    tags?: string[],
  ): Array<{ predictedStart: number; predictedEnd: number; confidence: number; basis: string }> {
    const events = this.getEvents(tags)
    if (events.length < MIN_EVENTS_FOR_PERIODICITY) return []

    const sorted = [...events].sort((a, b) => a.interval.start - b.interval.start)
    type Forecast = {
      predictedStart: number
      predictedEnd: number
      confidence: number
      basis: string
    }
    const forecasts: Forecast[] = []

    // Attempt periodicity-based forecast
    const starts = sorted.map(e => e.interval.start)
    const period = detectPeriodicity(starts, this.config.periodicityTolerance)

    if (period !== null) {
      const lastStart = starts[starts.length - 1]
      const avgDur = mean(sorted.map(e => duration(e.interval)))

      for (let i = 1; i <= this.config.forecastHorizon; i++) {
        const predictedStart = round2(lastStart + period * i)
        // Confidence decays with distance from last known event
        const confidence = round2(clamp(0.9 - i * 0.1, 0.1, 0.9))
        forecasts.push({
          predictedStart,
          predictedEnd: round2(predictedStart + avgDur),
          confidence,
          basis: `periodic (period=${round2(period)}ms)`,
        })
      }

      return forecasts
    }

    // Fall back to linear regression on start times
    const indices = starts.map((_, i) => i)
    const { slope, intercept } = linearRegression(indices, starts)

    if (slope <= 0) return [] // no forward progression

    const avgDur = mean(sorted.map(e => duration(e.interval)))
    const n = sorted.length

    for (let i = 1; i <= this.config.forecastHorizon; i++) {
      const predictedStart = round2(slope * (n - 1 + i) + intercept)
      const confidence = round2(clamp(0.7 - i * 0.1, 0.1, 0.7))
      forecasts.push({
        predictedStart,
        predictedEnd: round2(predictedStart + avgDur),
        confidence,
        basis: 'linear-regression',
      })
    }

    return forecasts
  }

  // ── Constraint Management ────────────────────────────────────────────────

  /** Add a temporal constraint asserting an Allen relation between two events. */
  addConstraint(
    eventIdA: string,
    eventIdB: string,
    relation: TemporalRelation,
    description: string = '',
  ): TemporalConstraint | null {
    if (this.constraints.size >= this.config.maxConstraints) return null
    if (!this.events.has(eventIdA) || !this.events.has(eventIdB)) return null
    if (eventIdA === eventIdB) return null

    const constraint: TemporalConstraint = {
      id: generateConstraintId(),
      eventIdA,
      eventIdB,
      relation,
      description,
      createdAt: Date.now(),
    }

    this.constraints.set(constraint.id, constraint)
    return constraint
  }

  /** Remove a constraint by ID. */
  removeConstraint(id: string): boolean {
    return this.constraints.delete(id)
  }

  /** Retrieve all constraints. */
  getConstraints(): TemporalConstraint[] {
    return Array.from(this.constraints.values())
  }

  /**
   * Check all constraints for violations. Returns each constraint with actual
   * vs. required relation and satisfaction status.
   */
  checkConstraints(): Array<{
    constraint: TemporalConstraint
    actualRelation: TemporalRelation
    satisfied: boolean
  }> {
    type CheckResult = {
      constraint: TemporalConstraint
      actualRelation: TemporalRelation
      satisfied: boolean
    }
    const results: CheckResult[] = []

    for (const constraint of this.constraints.values()) {
      const a = this.events.get(constraint.eventIdA)
      const b = this.events.get(constraint.eventIdB)
      if (!a || !b) continue

      const actual = allenRelation(a.interval, b.interval)
      const satisfied = satisfiesRelation(actual, constraint.relation)

      if (!satisfied) {
        this.violationCount++
      }

      results.push({ constraint, actualRelation: actual, satisfied })
    }

    return results
  }

  // ── Causal Ordering ──────────────────────────────────────────────────────

  /**
   * Infer causal ordering based on temporal precedence ("before" / "meets" relations).
   * Temporal precedence is necessary but not sufficient for causation.
   */
  inferCausalOrder(): Array<{
    eventId: string
    eventName: string
    possibleCauses: Array<{ eventId: string; eventName: string; relation: TemporalRelation }>
    possibleEffects: Array<{ eventId: string; eventName: string; relation: TemporalRelation }>
  }> {
    type CausalLink = { eventId: string; eventName: string; relation: TemporalRelation }
    type CausalEntry = {
      eventId: string
      eventName: string
      possibleCauses: CausalLink[]
      possibleEffects: CausalLink[]
    }

    const sorted = this.getEventsSorted()
    if (sorted.length === 0) return []

    const causalOrder: CausalEntry[] = []

    for (let i = 0; i < sorted.length; i++) {
      const event = sorted[i]
      const causes: CausalLink[] = []
      const effects: CausalLink[] = []

      // Look for potential causes (events that finish before this one starts)
      for (let j = 0; j < i; j++) {
        const candidate = sorted[j]
        const rel = allenRelation(candidate.interval, event.interval)
        if (rel === 'before' || rel === 'meets') {
          causes.push({ eventId: candidate.id, eventName: candidate.name, relation: rel })
        }
      }

      // Look for potential effects (events that start after this one ends)
      for (let j = i + 1; j < sorted.length; j++) {
        const candidate = sorted[j]
        const rel = allenRelation(event.interval, candidate.interval)
        if (rel === 'before' || rel === 'meets') {
          effects.push({ eventId: candidate.id, eventName: candidate.name, relation: rel })
        }
      }

      causalOrder.push({
        eventId: event.id,
        eventName: event.name,
        possibleCauses: causes,
        possibleEffects: effects,
      })
    }

    return causalOrder
  }

  // ── Stats & Persistence ──────────────────────────────────────────────────

  /** Return current statistics about the reasoner's state. */
  getStats(): TemporalReasonerStats {
    const events = Array.from(this.events.values())
    const durations = events.map(e => duration(e.interval))
    const avgDur = durations.length > 0 ? round2(mean(durations)) : 0

    let timespanMs = 0
    if (events.length > 0) {
      const starts = events.map(e => e.interval.start)
      const ends = events.map(e => e.interval.end)
      timespanMs = Math.max(...ends) - Math.min(...starts)
    }

    return {
      totalEvents: this.events.size,
      totalConstraints: this.constraints.size,
      totalSequences: this.sequences.size,
      totalPatterns: this.patterns.length,
      totalQueries: this.queryCount,
      avgEventDurationMs: avgDur,
      timespanMs,
      constraintViolations: this.violationCount,
    }
  }

  /** Serialize the reasoner state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      events: Array.from(this.events.values()),
      constraints: Array.from(this.constraints.values()),
      sequences: Array.from(this.sequences.values()),
      patterns: this.patterns,
      queryCount: this.queryCount,
      violationCount: this.violationCount,
    })
  }

  /** Restore a TemporalReasoner from serialized JSON. */
  static deserialize(json: string): TemporalReasoner {
    const data = JSON.parse(json) as {
      config: TemporalReasonerConfig
      events: TemporalEvent[]
      constraints: TemporalConstraint[]
      sequences: EventSequence[]
      patterns: TemporalPattern[]
      queryCount: number
      violationCount: number
    }

    const instance = new TemporalReasoner(data.config)

    if (Array.isArray(data.events)) {
      for (const evt of data.events) {
        instance.events.set(evt.id, evt)
      }
    }

    if (Array.isArray(data.constraints)) {
      for (const c of data.constraints) instance.constraints.set(c.id, c)
    }

    if (Array.isArray(data.sequences)) {
      for (const s of data.sequences) instance.sequences.set(s.id, s)
    }

    if (Array.isArray(data.patterns)) instance.patterns = data.patterns
    instance.queryCount = data.queryCount ?? 0
    instance.violationCount = data.violationCount ?? 0

    return instance
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  /** Resolve the reference timestamp for a temporal query. */
  private resolveReferenceTime(q: TemporalQuery): number {
    if (q.referenceTime !== undefined) return q.referenceTime
    if (q.referenceEventId) {
      const evt = this.events.get(q.referenceEventId)
      if (evt) return evt.interval.start
    }
    return 0
  }

  /** Find events that end before the reference time, sorted newest-first. */
  private queryBefore(refTime: number): TemporalEvent[] {
    return Array.from(this.events.values())
      .filter(e => e.interval.end <= refTime)
      .sort((a, b) => b.interval.end - a.interval.end)
  }

  /** Find events that start after the reference time, sorted earliest-first. */
  private queryAfter(refTime: number): TemporalEvent[] {
    return Array.from(this.events.values())
      .filter(e => e.interval.start >= refTime)
      .sort((a, b) => a.interval.start - b.interval.start)
  }

  /** Find events that are active during a reference event or time. */
  private queryDuring(q: TemporalQuery): TemporalEvent[] {
    let refInterval: TimeInterval

    if (q.referenceEventId) {
      const ref = this.events.get(q.referenceEventId)
      if (!ref) return []
      refInterval = ref.interval
    } else if (q.referenceTime !== undefined) {
      refInterval = { start: q.referenceTime, end: q.referenceTime }
    } else {
      return []
    }

    return Array.from(this.events.values())
      .filter(e => {
        if (q.referenceEventId && e.id === q.referenceEventId) return false
        return e.interval.start <= refInterval.end && e.interval.end >= refInterval.start
      })
      .sort((a, b) => a.interval.start - b.interval.start)
  }

  /** Find events whose intervals fall within [rangeStart, rangeEnd]. */
  private queryBetween(rangeStart: number, rangeEnd: number): TemporalEvent[] {
    return Array.from(this.events.values())
      .filter(e => e.interval.start >= rangeStart && e.interval.end <= rangeEnd)
      .sort((a, b) => a.interval.start - b.interval.start)
  }

  /** Find events that overlap with a reference event. */
  private queryOverlapping(q: TemporalQuery): TemporalEvent[] {
    if (!q.referenceEventId) return []

    const ref = this.events.get(q.referenceEventId)
    if (!ref) return []

    return Array.from(this.events.values())
      .filter(e => {
        if (e.id === q.referenceEventId) return false
        const rel = allenRelation(ref.interval, e.interval)
        return (
          rel === 'overlaps' ||
          rel === 'overlapped-by' ||
          rel === 'during' ||
          rel === 'contains' ||
          rel === 'starts' ||
          rel === 'started-by' ||
          rel === 'finishes' ||
          rel === 'finished-by' ||
          rel === 'equals'
        )
      })
      .sort((a, b) => a.interval.start - b.interval.start)
  }

  /** Find the nearest event(s) to a reference time. */
  private queryNearest(refTime: number, limit: number): TemporalEvent[] {
    return Array.from(this.events.values())
      .map(e => ({
        event: e,
        distance: Math.min(
          Math.abs(e.interval.start - refTime),
          Math.abs(e.interval.end - refTime),
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(item => item.event)
  }

  /** Detect gaps exceeding the configured threshold after merging overlapping intervals. */
  private detectGaps(sorted: TemporalEvent[]): TimeInterval[] {
    const gaps: TimeInterval[] = []
    if (sorted.length < 2) return gaps

    // Build a merged timeline to account for overlapping events
    const merged = this.mergeIntervals(sorted.map(e => e.interval))

    for (let i = 1; i < merged.length; i++) {
      const gapStart = merged[i - 1].end
      const gapEnd = merged[i].start
      const gapSize = gapEnd - gapStart

      if (gapSize >= this.config.gapThresholdMs) {
        gaps.push({ start: gapStart, end: gapEnd })
      }
    }

    return gaps
  }

  /** Find all pairs of events that overlap in time. */
  private detectOverlaps(
    sorted: TemporalEvent[],
  ): Array<{ eventA: string; eventB: string; overlapInterval: TimeInterval }> {
    const overlaps: Array<{ eventA: string; eventB: string; overlapInterval: TimeInterval }> = []

    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        // Early exit: if the next event starts after this one ends, skip
        if (sorted[j].interval.start >= sorted[i].interval.end) break

        const overlap = computeOverlap(sorted[i].interval, sorted[j].interval)
        if (overlap) {
          overlaps.push({
            eventA: sorted[i].id,
            eventB: sorted[j].id,
            overlapInterval: overlap,
          })
        }
      }
    }

    return overlaps
  }

  /** Detect gaps, overlapping events, and patterns (periodic, burst, trend). */
  private detectPatterns(sorted: TemporalEvent[]): TemporalPattern[] {
    const patterns: TemporalPattern[] = []
    if (sorted.length < MIN_EVENTS_FOR_PERIODICITY) return patterns

    // Group events by name for per-type pattern detection
    const byName = new Map<string, TemporalEvent[]>()
    for (const evt of sorted) {
      const group = byName.get(evt.name) ?? []
      group.push(evt)
      byName.set(evt.name, group)
    }

    // Detect periodicity per event type
    for (const [name, events] of byName.entries()) {
      if (events.length < MIN_EVENTS_FOR_PERIODICITY) continue

      const starts = events.map(e => e.interval.start)
      const period = detectPeriodicity(starts, this.config.periodicityTolerance)

      if (period !== null) {
        patterns.push({
          id: generatePatternId(),
          name: `periodic-${name}`,
          type: 'periodic',
          eventIds: events.map(e => e.id),
          description: `Event "${name}" recurs approximately every ${round2(period / 1000)}s`,
          periodMs: period,
          confidence: round2(clamp(events.length / 10, 0.3, 0.95)),
          detectedAt: Date.now(),
        })
      }
    }

    // Detect burst patterns using clustering
    const clusters = clusterByProximity(sorted, this.config.clusterThresholdMs)
    if (clusters.length > 0) {
      const largeClusters = clusters.filter(c => c.length >= 3)
      /** Bursts are clusters with span less than 30% of average cluster span. */
      const BURST_DENSITY_RATIO = 0.3

      for (const cluster of largeClusters) {
        const clusterSpan = cluster[cluster.length - 1].interval.end - cluster[0].interval.start
        const avgSpan =
          (sorted[sorted.length - 1].interval.end - sorted[0].interval.start) / clusters.length

        if (cluster.length >= 3 && clusterSpan < avgSpan * BURST_DENSITY_RATIO) {
          patterns.push({
            id: generatePatternId(),
            name: `burst-${cluster[0].name}`,
            type: 'burst',
            eventIds: cluster.map(e => e.id),
            description: `Burst of ${cluster.length} events within ${round2(clusterSpan / 1000)}s`,
            confidence: round2(clamp(cluster.length / sorted.length, 0.2, 0.9)),
            detectedAt: Date.now(),
          })
        }
      }
    }

    // Detect frequency trend across time windows
    if (sorted.length >= TREND_WINDOW * 2) {
      const timespan = sorted[sorted.length - 1].interval.end - sorted[0].interval.start
      const windowCount = Math.min(10, sorted.length)
      const windowSize = timespan / windowCount

      if (windowSize > 0) {
        const counts: number[] = []
        for (let i = 0; i < windowCount; i++) {
          const wStart = sorted[0].interval.start + i * windowSize
          const wEnd = wStart + windowSize
          const count = sorted.filter(
            e => e.interval.start >= wStart && e.interval.start < wEnd,
          ).length
          counts.push(count)
        }

        const trend = detectTrend(counts)
        if (trend !== 'stable') {
          patterns.push({
            id: generatePatternId(),
            name: `frequency-${trend}`,
            type: 'trend',
            eventIds: sorted.map(e => e.id),
            description: `Event frequency is ${trend} over time`,
            trendDirection: trend,
            confidence: 0.6,
            detectedAt: Date.now(),
          })
        }
      }
    }

    return patterns
  }

  /** Find the period with the highest event density. */
  private findBusiestPeriod(sorted: TemporalEvent[]): TimeInterval | null {
    if (sorted.length < 2) return null

    const timespan = sorted[sorted.length - 1].interval.end - sorted[0].interval.start
    const windowSize = Math.max(timespan / 10, this.config.clusterThresholdMs)

    let bestStart = sorted[0].interval.start
    let bestCount = 0

    for (
      let wStart = sorted[0].interval.start;
      wStart < sorted[sorted.length - 1].interval.end;
      wStart += windowSize / 2
    ) {
      const wEnd = wStart + windowSize
      const count = sorted.filter(e => e.interval.start < wEnd && e.interval.end > wStart).length

      if (count > bestCount) {
        bestCount = count
        bestStart = wStart
      }
    }

    return { start: bestStart, end: bestStart + windowSize }
  }

  /** Merge overlapping intervals into a non-overlapping sorted list. */
  private mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
    if (intervals.length === 0) return []

    const sorted = [...intervals].sort((a, b) => a.start - b.start)
    const merged: TimeInterval[] = [{ ...sorted[0] }]

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i]
      const last = merged[merged.length - 1]

      if (current.start <= last.end) {
        last.end = Math.max(last.end, current.end)
      } else {
        merged.push({ ...current })
      }
    }

    return merged
  }
}
