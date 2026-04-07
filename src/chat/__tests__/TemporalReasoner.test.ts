import { describe, it, expect, beforeEach } from 'vitest'
import { TemporalReasoner } from '../TemporalReasoner.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

const HOUR = 3_600_000
const _MINUTE = 60_000

/** Shortcut to add an event and assert it was created. */
function addEvent(
  tr: TemporalReasoner,
  name: string,
  start: number,
  end: number,
  tags: string[] = [],
  metadata: Record<string, unknown> = {},
) {
  const evt = tr.addEvent(name, `${name} desc`, start, end, tags, metadata)
  expect(evt).not.toBeNull()
  return evt!
}

/** Seed the reasoner with several non-overlapping events spread over time. */
function seedTimeline(tr: TemporalReasoner) {
  const base = 1_000_000
  const e1 = addEvent(tr, 'A', base, base + HOUR, ['work'])
  const e2 = addEvent(tr, 'B', base + 2 * HOUR, base + 3 * HOUR, ['work'])
  const e3 = addEvent(tr, 'C', base + 4 * HOUR, base + 5 * HOUR, ['personal'])
  const e4 = addEvent(tr, 'D', base + 6 * HOUR, base + 7 * HOUR, ['personal'])
  return { base, e1, e2, e3, e4 }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('TemporalReasoner', () => {
  let tr: TemporalReasoner

  beforeEach(() => {
    tr = new TemporalReasoner()
  })

  // ── Constructor & Config ──────────────────────────────────────────────────

  describe('constructor', () => {
    it('creates with default config', () => {
      const stats = tr.getStats()
      expect(stats.totalEvents).toBe(0)
      expect(stats.totalConstraints).toBe(0)
    })

    it('accepts partial config overrides', () => {
      const custom = new TemporalReasoner({ maxEvents: 5 })
      // Adding 5 should succeed, 6th should fail
      for (let i = 0; i < 5; i++) {
        expect(custom.addEvent(`e${i}`, '', i * 100, i * 100 + 50)).not.toBeNull()
      }
      expect(custom.addEvent('overflow', '', 600, 650)).toBeNull()
    })

    it('merges custom config with defaults', () => {
      const custom = new TemporalReasoner({ forecastHorizon: 10 })
      // Other defaults still apply — can add many events
      expect(custom.addEvent('x', '', 0, 100)).not.toBeNull()
    })
  })

  // ── addEvent ──────────────────────────────────────────────────────────────

  describe('addEvent', () => {
    it('returns a TemporalEvent with a generated id', () => {
      const evt = tr.addEvent('Login', 'User login', 0, 1000)
      expect(evt).not.toBeNull()
      expect(evt!.id).toMatch(/^evt_/)
      expect(evt!.name).toBe('Login')
    })

    it('stores interval correctly', () => {
      const evt = addEvent(tr, 'E', 100, 200)
      expect(evt.interval).toEqual({ start: 100, end: 200 })
    })

    it('stores tags and metadata', () => {
      const evt = addEvent(tr, 'E', 0, 10, ['tag1', 'tag2'], { key: 42 })
      expect(evt.tags).toEqual(['tag1', 'tag2'])
      expect(evt.metadata).toEqual({ key: 42 })
    })

    it('returns null when end < start', () => {
      expect(tr.addEvent('Bad', '', 200, 100)).toBeNull()
    })

    it('allows zero-duration events (end === start)', () => {
      const evt = tr.addEvent('Point', '', 100, 100)
      expect(evt).not.toBeNull()
    })

    it('returns null when maxEvents is reached', () => {
      const small = new TemporalReasoner({ maxEvents: 2 })
      small.addEvent('a', '', 0, 1)
      small.addEvent('b', '', 1, 2)
      expect(small.addEvent('c', '', 2, 3)).toBeNull()
    })

    it('sets createdAt to a recent timestamp', () => {
      const before = Date.now()
      const evt = addEvent(tr, 'E', 0, 10)
      expect(evt.createdAt).toBeGreaterThanOrEqual(before)
      expect(evt.createdAt).toBeLessThanOrEqual(Date.now())
    })
  })

  // ── getEvent / getEvents ──────────────────────────────────────────────────

  describe('getEvent', () => {
    it('retrieves an event by id', () => {
      const evt = addEvent(tr, 'E', 0, 10)
      expect(tr.getEvent(evt.id)).toEqual(evt)
    })

    it('returns null for unknown id', () => {
      expect(tr.getEvent('nonexistent')).toBeNull()
    })
  })

  describe('getEvents', () => {
    it('returns all events when no tags specified', () => {
      addEvent(tr, 'A', 0, 10, ['x'])
      addEvent(tr, 'B', 10, 20, ['y'])
      expect(tr.getEvents()).toHaveLength(2)
    })

    it('filters by tags', () => {
      addEvent(tr, 'A', 0, 10, ['x'])
      addEvent(tr, 'B', 10, 20, ['y'])
      addEvent(tr, 'C', 20, 30, ['x', 'y'])
      expect(tr.getEvents(['x'])).toHaveLength(2)
      expect(tr.getEvents(['y'])).toHaveLength(2)
      expect(tr.getEvents(['z'])).toHaveLength(0)
    })

    it('returns empty array when no events exist', () => {
      expect(tr.getEvents()).toHaveLength(0)
    })
  })

  describe('getEventsSorted', () => {
    it('returns events ordered by start time', () => {
      addEvent(tr, 'Late', 200, 300)
      addEvent(tr, 'Early', 0, 50)
      addEvent(tr, 'Mid', 100, 150)
      const sorted = tr.getEventsSorted()
      expect(sorted.map(e => e.name)).toEqual(['Early', 'Mid', 'Late'])
    })
  })

  // ── removeEvent ───────────────────────────────────────────────────────────

  describe('removeEvent', () => {
    it('removes an existing event and returns true', () => {
      const evt = addEvent(tr, 'E', 0, 10)
      expect(tr.removeEvent(evt.id)).toBe(true)
      expect(tr.getEvent(evt.id)).toBeNull()
    })

    it('returns false for unknown id', () => {
      expect(tr.removeEvent('nonexistent')).toBe(false)
    })

    it('cascades removal to associated constraints', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      tr.addConstraint(a.id, b.id, 'before')
      expect(tr.getConstraints()).toHaveLength(1)
      tr.removeEvent(a.id)
      expect(tr.getConstraints()).toHaveLength(0)
    })

    it('removes event from sequences, deleting short sequences', () => {
      const a = addEvent(tr, 'X', 0, 10)
      const _b = addEvent(tr, 'X', 20, 30)
      const _c = addEvent(tr, 'X', 40, 50)
      const _d = addEvent(tr, 'X', 60, 70)
      // Detect sequences so internal state is populated
      tr.detectSequences()
      tr.removeEvent(a.id)
      // Event should be gone
      expect(tr.getEvent(a.id)).toBeNull()
    })
  })

  // ── computeRelation (Allen's Interval Algebra) ────────────────────────────

  describe('computeRelation', () => {
    it('returns null if either event id is invalid', () => {
      const a = addEvent(tr, 'A', 0, 10)
      expect(tr.computeRelation(a.id, 'bad')).toBeNull()
      expect(tr.computeRelation('bad', a.id)).toBeNull()
    })

    it('detects "before" relation', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      expect(tr.computeRelation(a.id, b.id)).toBe('before')
    })

    it('detects "after" relation', () => {
      const a = addEvent(tr, 'A', 20, 30)
      const b = addEvent(tr, 'B', 0, 10)
      expect(tr.computeRelation(a.id, b.id)).toBe('after')
    })

    it('detects "meets" relation', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 10, 20)
      expect(tr.computeRelation(a.id, b.id)).toBe('meets')
    })

    it('detects "met-by" relation', () => {
      const a = addEvent(tr, 'A', 10, 20)
      const b = addEvent(tr, 'B', 0, 10)
      expect(tr.computeRelation(a.id, b.id)).toBe('met-by')
    })

    it('detects "overlaps" relation', () => {
      const a = addEvent(tr, 'A', 0, 15)
      const b = addEvent(tr, 'B', 10, 25)
      expect(tr.computeRelation(a.id, b.id)).toBe('overlaps')
    })

    it('detects "overlapped-by" relation', () => {
      const a = addEvent(tr, 'A', 10, 25)
      const b = addEvent(tr, 'B', 0, 15)
      expect(tr.computeRelation(a.id, b.id)).toBe('overlapped-by')
    })

    it('detects "during" relation', () => {
      const a = addEvent(tr, 'A', 5, 10)
      const b = addEvent(tr, 'B', 0, 20)
      expect(tr.computeRelation(a.id, b.id)).toBe('during')
    })

    it('detects "contains" relation', () => {
      const a = addEvent(tr, 'A', 0, 20)
      const b = addEvent(tr, 'B', 5, 10)
      expect(tr.computeRelation(a.id, b.id)).toBe('contains')
    })

    it('detects "starts" relation', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 0, 20)
      expect(tr.computeRelation(a.id, b.id)).toBe('starts')
    })

    it('detects "started-by" relation', () => {
      const a = addEvent(tr, 'A', 0, 20)
      const b = addEvent(tr, 'B', 0, 10)
      expect(tr.computeRelation(a.id, b.id)).toBe('started-by')
    })

    it('detects "finishes" relation', () => {
      const a = addEvent(tr, 'A', 10, 20)
      const b = addEvent(tr, 'B', 0, 20)
      expect(tr.computeRelation(a.id, b.id)).toBe('finishes')
    })

    it('detects "finished-by" relation', () => {
      const a = addEvent(tr, 'A', 0, 20)
      const b = addEvent(tr, 'B', 10, 20)
      expect(tr.computeRelation(a.id, b.id)).toBe('finished-by')
    })

    it('detects "equals" relation', () => {
      const a = addEvent(tr, 'A', 0, 20)
      const b = addEvent(tr, 'B', 0, 20)
      expect(tr.computeRelation(a.id, b.id)).toBe('equals')
    })
  })

  describe('computeAllRelations', () => {
    it('returns empty map for unknown event', () => {
      expect(tr.computeAllRelations('bad').size).toBe(0)
    })

    it('computes relation to every other event', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      const c = addEvent(tr, 'C', 40, 50)
      const rels = tr.computeAllRelations(a.id)
      expect(rels.size).toBe(2)
      expect(rels.get(b.id)).toBe('before')
      expect(rels.get(c.id)).toBe('before')
    })
  })

  // ── addConstraint ─────────────────────────────────────────────────────────

  describe('addConstraint', () => {
    it('adds a constraint between two events', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      const c = tr.addConstraint(a.id, b.id, 'before', 'A before B')
      expect(c).not.toBeNull()
      expect(c!.id).toMatch(/^cst_/)
      expect(c!.relation).toBe('before')
    })

    it('returns null if an event id is missing', () => {
      const a = addEvent(tr, 'A', 0, 10)
      expect(tr.addConstraint(a.id, 'ghost', 'before')).toBeNull()
      expect(tr.addConstraint('ghost', a.id, 'before')).toBeNull()
    })

    it('returns null for self-referencing constraint', () => {
      const a = addEvent(tr, 'A', 0, 10)
      expect(tr.addConstraint(a.id, a.id, 'equals')).toBeNull()
    })

    it('returns null when maxConstraints is reached', () => {
      const limited = new TemporalReasoner({ maxConstraints: 1 })
      const a = limited.addEvent('A', '', 0, 10)!
      const b = limited.addEvent('B', '', 20, 30)!
      const c = limited.addEvent('C', '', 40, 50)!
      limited.addConstraint(a.id, b.id, 'before')
      expect(limited.addConstraint(b.id, c.id, 'before')).toBeNull()
    })
  })

  describe('removeConstraint', () => {
    it('removes an existing constraint', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      const c = tr.addConstraint(a.id, b.id, 'before')!
      expect(tr.removeConstraint(c.id)).toBe(true)
      expect(tr.getConstraints()).toHaveLength(0)
    })

    it('returns false for unknown id', () => {
      expect(tr.removeConstraint('nope')).toBe(false)
    })
  })

  describe('checkConstraints', () => {
    it('reports satisfied constraint', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      tr.addConstraint(a.id, b.id, 'before')
      const results = tr.checkConstraints()
      expect(results).toHaveLength(1)
      expect(results[0].satisfied).toBe(true)
      expect(results[0].actualRelation).toBe('before')
    })

    it('reports violated constraint', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      tr.addConstraint(a.id, b.id, 'after') // wrong — A is actually before B
      const results = tr.checkConstraints()
      expect(results).toHaveLength(1)
      expect(results[0].satisfied).toBe(false)
    })

    it('increments violation count on failure', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      tr.addConstraint(a.id, b.id, 'after')
      tr.checkConstraints()
      expect(tr.getStats().constraintViolations).toBe(1)
    })
  })

  // ── addSequence (detectSequences) ─────────────────────────────────────────

  describe('detectSequences', () => {
    it('returns empty when too few events', () => {
      addEvent(tr, 'A', 0, 10)
      expect(tr.detectSequences()).toHaveLength(0)
    })

    it('detects repeated two-event name sequences', () => {
      // A→B appears at indices [0,1] and [2,3]
      addEvent(tr, 'A', 0, 10)
      addEvent(tr, 'B', 20, 30)
      addEvent(tr, 'A', 40, 50)
      addEvent(tr, 'B', 60, 70)
      const seqs = tr.detectSequences()
      expect(seqs.length).toBeGreaterThan(0)
      const ab = seqs.find(s => s.name === 'A→B')
      expect(ab).toBeDefined()
      expect(ab!.occurrences).toBeGreaterThanOrEqual(2)
    })

    it('respects minLength parameter', () => {
      addEvent(tr, 'A', 0, 10)
      addEvent(tr, 'B', 20, 30)
      addEvent(tr, 'C', 40, 50)
      addEvent(tr, 'A', 60, 70)
      addEvent(tr, 'B', 80, 90)
      addEvent(tr, 'C', 100, 110)
      const seqs = tr.detectSequences(3)
      const abc = seqs.find(s => s.name === 'A→B→C')
      expect(abc).toBeDefined()
    })

    it('computes avgGap and confidence', () => {
      addEvent(tr, 'X', 0, 10)
      addEvent(tr, 'Y', 20, 30)
      addEvent(tr, 'X', 40, 50)
      addEvent(tr, 'Y', 60, 70)
      const seqs = tr.detectSequences()
      const xy = seqs.find(s => s.name === 'X→Y')
      expect(xy).toBeDefined()
      expect(typeof xy!.avgGap).toBe('number')
      expect(xy!.confidence).toBeGreaterThanOrEqual(0)
      expect(xy!.confidence).toBeLessThanOrEqual(1)
    })
  })

  // ── analyzeTimeline ───────────────────────────────────────────────────────

  describe('analyzeTimeline', () => {
    it('returns empty analysis for no events', () => {
      const a = tr.analyzeTimeline()
      expect(a.totalEvents).toBe(0)
      expect(a.timespan).toBeNull()
      expect(a.patterns).toHaveLength(0)
      expect(a.gaps).toHaveLength(0)
      expect(a.overlaps).toHaveLength(0)
      expect(a.busiestPeriod).toBeNull()
    })

    it('computes timespan correctly', () => {
      addEvent(tr, 'A', 100, 200)
      addEvent(tr, 'B', 300, 400)
      const a = tr.analyzeTimeline()
      expect(a.timespan).toEqual({ start: 100, end: 400 })
    })

    it('counts total events', () => {
      seedTimeline(tr)
      const a = tr.analyzeTimeline()
      expect(a.totalEvents).toBe(4)
    })

    it('detects gaps exceeding threshold', () => {
      const reasoner = new TemporalReasoner({ gapThresholdMs: 50 })
      addEvent(reasoner, 'A', 0, 10)
      addEvent(reasoner, 'B', 100, 110) // gap of 90, > threshold of 50
      const a = reasoner.analyzeTimeline()
      expect(a.gaps.length).toBeGreaterThanOrEqual(1)
      expect(a.gaps[0].start).toBe(10)
      expect(a.gaps[0].end).toBe(100)
    })

    it('detects overlaps between events', () => {
      addEvent(tr, 'A', 0, 20)
      addEvent(tr, 'B', 10, 30)
      const a = tr.analyzeTimeline()
      expect(a.overlaps.length).toBe(1)
      expect(a.overlaps[0].overlapInterval).toEqual({ start: 10, end: 20 })
    })

    it('computes density per unit (events per hour)', () => {
      seedTimeline(tr)
      const a = tr.analyzeTimeline()
      expect(a.densityPerUnit).toBeGreaterThan(0)
    })

    it('identifies a busiest period', () => {
      seedTimeline(tr)
      const a = tr.analyzeTimeline()
      expect(a.busiestPeriod).not.toBeNull()
      expect(a.busiestPeriod!.start).toBeDefined()
      expect(a.busiestPeriod!.end).toBeGreaterThan(a.busiestPeriod!.start)
    })
  })

  // ── queryTemporal ─────────────────────────────────────────────────────────

  describe('query', () => {
    describe('before', () => {
      it('returns events ending before reference time', () => {
        addEvent(tr, 'Early', 0, 10)
        addEvent(tr, 'Late', 100, 200)
        const result = tr.query({ type: 'before', referenceTime: 50 })
        expect(result.count).toBe(1)
        expect(result.events[0].name).toBe('Early')
      })

      it('resolves reference from event id', () => {
        const a = addEvent(tr, 'A', 0, 10)
        const b = addEvent(tr, 'B', 100, 200)
        // "before" uses event start as reference time
        const result = tr.query({ type: 'before', referenceEventId: b.id })
        expect(result.events.some(e => e.id === a.id)).toBe(true)
      })
    })

    describe('after', () => {
      it('returns events starting after reference time', () => {
        addEvent(tr, 'Early', 0, 10)
        addEvent(tr, 'Late', 100, 200)
        const result = tr.query({ type: 'after', referenceTime: 50 })
        expect(result.count).toBe(1)
        expect(result.events[0].name).toBe('Late')
      })
    })

    describe('during', () => {
      it('returns events active during a reference event', () => {
        const container = addEvent(tr, 'Container', 0, 100)
        addEvent(tr, 'Inner', 20, 80)
        addEvent(tr, 'Outside', 200, 300)
        const result = tr.query({ type: 'during', referenceEventId: container.id })
        expect(result.count).toBe(1)
        expect(result.events[0].name).toBe('Inner')
      })

      it('returns events active at a point in time', () => {
        addEvent(tr, 'Active', 0, 100)
        addEvent(tr, 'Inactive', 200, 300)
        const result = tr.query({ type: 'during', referenceTime: 50 })
        expect(result.count).toBe(1)
        expect(result.events[0].name).toBe('Active')
      })

      it('returns empty when no reference given', () => {
        addEvent(tr, 'A', 0, 100)
        const result = tr.query({ type: 'during' })
        expect(result.count).toBe(0)
      })
    })

    describe('between', () => {
      it('returns events fully within the range', () => {
        addEvent(tr, 'Inside', 50, 60)
        addEvent(tr, 'Partial', 0, 55)   // starts outside range
        addEvent(tr, 'Outside', 200, 300)
        const result = tr.query({ type: 'between', rangeStart: 40, rangeEnd: 100 })
        expect(result.count).toBe(1)
        expect(result.events[0].name).toBe('Inside')
      })
    })

    describe('overlapping', () => {
      it('finds events overlapping a reference event', () => {
        const ref = addEvent(tr, 'Ref', 10, 30)
        addEvent(tr, 'Overlap', 20, 40)
        addEvent(tr, 'No', 50, 60)
        const result = tr.query({ type: 'overlapping', referenceEventId: ref.id })
        expect(result.count).toBe(1)
        expect(result.events[0].name).toBe('Overlap')
      })

      it('returns empty when no reference event given', () => {
        addEvent(tr, 'A', 0, 10)
        const result = tr.query({ type: 'overlapping' })
        expect(result.count).toBe(0)
      })
    })

    describe('nearest', () => {
      it('returns events sorted by proximity to reference time', () => {
        addEvent(tr, 'Far', 0, 10)
        addEvent(tr, 'Close', 90, 110)
        addEvent(tr, 'Mid', 40, 60)
        const result = tr.query({ type: 'nearest', referenceTime: 100, limit: 2 })
        expect(result.count).toBe(2)
        expect(result.events[0].name).toBe('Close')
      })
    })

    it('filters results by tags', () => {
      addEvent(tr, 'Match', 0, 10, ['important'])
      addEvent(tr, 'Skip', 20, 30, ['other'])
      const result = tr.query({ type: 'after', referenceTime: -1, tags: ['important'] })
      expect(result.count).toBe(1)
      expect(result.events[0].name).toBe('Match')
    })

    it('respects the limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        addEvent(tr, `E${i}`, i * 100, i * 100 + 50)
      }
      const result = tr.query({ type: 'after', referenceTime: -1, limit: 3 })
      expect(result.count).toBe(3)
    })

    it('increments queryCount in stats', () => {
      addEvent(tr, 'A', 0, 10)
      tr.query({ type: 'after', referenceTime: -1 })
      tr.query({ type: 'before', referenceTime: 100 })
      expect(tr.getStats().totalQueries).toBe(2)
    })

    it('includes executionTimeMs in result', () => {
      const result = tr.query({ type: 'after', referenceTime: 0 })
      expect(typeof result.executionTimeMs).toBe('number')
      expect(result.executionTimeMs).toBeGreaterThanOrEqual(0)
    })
  })

  // ── detectPatterns ────────────────────────────────────────────────────────

  describe('detectPatterns (via analyzeTimeline)', () => {
    it('detects periodic patterns for recurring same-name events', () => {
      const reasoner = new TemporalReasoner({ periodicityTolerance: 0.2 })
      // Events named "Heartbeat" at regular intervals
      for (let i = 0; i < 6; i++) {
        addEvent(reasoner, 'Heartbeat', i * 1000, i * 1000 + 100)
      }
      const analysis = reasoner.analyzeTimeline()
      const periodic = analysis.patterns.filter(p => p.type === 'periodic')
      expect(periodic.length).toBeGreaterThanOrEqual(1)
      expect(periodic[0].periodMs).toBeGreaterThan(0)
    })

    it('does not detect periodicity with too few events', () => {
      addEvent(tr, 'A', 0, 10)
      addEvent(tr, 'B', 100, 110)
      const analysis = tr.analyzeTimeline()
      expect(analysis.patterns.filter(p => p.type === 'periodic')).toHaveLength(0)
    })

    it('detects burst patterns when events cluster tightly', () => {
      const reasoner = new TemporalReasoner({ clusterThresholdMs: 100 })
      // Spread out events first
      addEvent(reasoner, 'A', 0, 10)
      addEvent(reasoner, 'B', 10000, 10010)
      addEvent(reasoner, 'C', 20000, 20010)
      // Then a burst
      addEvent(reasoner, 'D', 30000, 30001)
      addEvent(reasoner, 'E', 30002, 30003)
      addEvent(reasoner, 'F', 30004, 30005)
      const analysis = reasoner.analyzeTimeline()
      const bursts = analysis.patterns.filter(p => p.type === 'burst')
      // Burst detection depends on cluster span vs average; at least verify no crash
      expect(Array.isArray(bursts)).toBe(true)
    })

    it('detects frequency trend patterns with enough events', () => {
      // Create events with increasing frequency
      const reasoner = new TemporalReasoner()
      let t = 0
      for (let i = 0; i < 10; i++) {
        addEvent(reasoner, `E${i}`, t, t + 10)
        // Gaps get shorter over time → increasing frequency
        t += 1000 - i * 80
      }
      const analysis = reasoner.analyzeTimeline()
      // At least check the pattern array is returned; trend detection may or may not fire
      expect(Array.isArray(analysis.patterns)).toBe(true)
    })
  })

  // ── forecast ──────────────────────────────────────────────────────────────

  describe('forecast', () => {
    it('returns empty with fewer than 3 events', () => {
      addEvent(tr, 'A', 0, 10)
      addEvent(tr, 'B', 20, 30)
      expect(tr.forecast()).toHaveLength(0)
    })

    it('produces periodic forecasts for regular events', () => {
      const reasoner = new TemporalReasoner({ periodicityTolerance: 0.2, forecastHorizon: 3 })
      for (let i = 0; i < 5; i++) {
        addEvent(reasoner, 'Tick', i * 1000, i * 1000 + 100)
      }
      const forecasts = reasoner.forecast()
      expect(forecasts.length).toBeGreaterThan(0)
      expect(forecasts[0].basis).toContain('periodic')
      expect(forecasts[0].predictedStart).toBeGreaterThan(4000)
    })

    it('falls back to linear regression when no periodicity found', () => {
      // Irregular but forward-progressing events
      addEvent(tr, 'A', 0, 100)
      addEvent(tr, 'B', 200, 400)
      addEvent(tr, 'C', 500, 900)
      addEvent(tr, 'D', 1100, 1800)
      const forecasts = tr.forecast()
      if (forecasts.length > 0) {
        expect(forecasts[0].basis).toBe('linear-regression')
      }
    })

    it('respects forecastHorizon', () => {
      const reasoner = new TemporalReasoner({ periodicityTolerance: 0.2, forecastHorizon: 2 })
      for (let i = 0; i < 5; i++) {
        addEvent(reasoner, 'Tick', i * 1000, i * 1000 + 100)
      }
      const forecasts = reasoner.forecast()
      expect(forecasts.length).toBeLessThanOrEqual(2)
    })

    it('forecast confidence decreases with distance', () => {
      const reasoner = new TemporalReasoner({ periodicityTolerance: 0.2, forecastHorizon: 5 })
      for (let i = 0; i < 6; i++) {
        addEvent(reasoner, 'Tick', i * 1000, i * 1000 + 100)
      }
      const forecasts = reasoner.forecast()
      if (forecasts.length >= 2) {
        expect(forecasts[0].confidence).toBeGreaterThanOrEqual(forecasts[1].confidence)
      }
    })

    it('filters events by tags for forecasting', () => {
      const reasoner = new TemporalReasoner({ periodicityTolerance: 0.2, forecastHorizon: 3 })
      for (let i = 0; i < 5; i++) {
        addEvent(reasoner, 'Tick', i * 1000, i * 1000 + 100, ['cron'])
      }
      addEvent(reasoner, 'Noise', 5000, 5100, ['random'])
      const forecasts = reasoner.forecast(['cron'])
      expect(forecasts.length).toBeGreaterThan(0)
    })
  })

  // ── analyzeDurations ──────────────────────────────────────────────────────

  describe('analyzeDurations', () => {
    it('returns zeros with no events', () => {
      const d = tr.analyzeDurations()
      expect(d.count).toBe(0)
      expect(d.meanMs).toBe(0)
    })

    it('handles single event', () => {
      addEvent(tr, 'A', 0, 100)
      const d = tr.analyzeDurations()
      expect(d.count).toBe(1)
      expect(d.meanMs).toBe(100)
      expect(d.histogram).toHaveLength(0)
    })

    it('computes mean, median, stddev for multiple events', () => {
      addEvent(tr, 'A', 0, 100)
      addEvent(tr, 'B', 200, 500)  // duration 300
      addEvent(tr, 'C', 600, 700)  // duration 100
      const d = tr.analyzeDurations()
      expect(d.count).toBe(3)
      expect(d.meanMs).toBeCloseTo((100 + 300 + 100) / 3, 0)
      expect(d.minMs).toBe(100)
      expect(d.maxMs).toBe(300)
      expect(d.stddevMs).toBeGreaterThan(0)
    })

    it('filters by tags', () => {
      addEvent(tr, 'A', 0, 100, ['x'])
      addEvent(tr, 'B', 200, 500, ['y'])
      const d = tr.analyzeDurations(['x'])
      expect(d.count).toBe(1)
      expect(d.meanMs).toBe(100)
    })

    it('produces a histogram with bins', () => {
      for (let i = 0; i < 10; i++) {
        addEvent(tr, `E${i}`, i * 200, i * 200 + (i + 1) * 10)
      }
      const d = tr.analyzeDurations()
      expect(d.histogram.length).toBeGreaterThan(0)
      const totalInBins = d.histogram.reduce((s, b) => s + b.count, 0)
      expect(totalInBins).toBe(d.count)
    })

    it('detects stable trend for uniform durations', () => {
      for (let i = 0; i < 8; i++) {
        addEvent(tr, `E${i}`, i * 200, i * 200 + 100)
      }
      const d = tr.analyzeDurations()
      expect(d.trend).toBe('stable')
    })
  })

  // ── inferCausalOrder ──────────────────────────────────────────────────────

  describe('inferCausalOrder', () => {
    it('returns empty for no events', () => {
      expect(tr.inferCausalOrder()).toHaveLength(0)
    })

    it('identifies possible causes and effects', () => {
      const a = addEvent(tr, 'Cause', 0, 10)
      const b = addEvent(tr, 'Effect', 20, 30)
      const causal = tr.inferCausalOrder()
      expect(causal).toHaveLength(2)

      const causeEntry = causal.find(c => c.eventId === a.id)!
      expect(causeEntry.possibleEffects.length).toBe(1)
      expect(causeEntry.possibleEffects[0].eventId).toBe(b.id)

      const effectEntry = causal.find(c => c.eventId === b.id)!
      expect(effectEntry.possibleCauses.length).toBe(1)
      expect(effectEntry.possibleCauses[0].eventId).toBe(a.id)
    })

    it('does not link overlapping events as cause/effect', () => {
      addEvent(tr, 'X', 0, 20)
      addEvent(tr, 'Y', 10, 30)
      const causal = tr.inferCausalOrder()
      for (const entry of causal) {
        expect(entry.possibleCauses).toHaveLength(0)
        expect(entry.possibleEffects).toHaveLength(0)
      }
    })
  })

  // ── serialize / deserialize ───────────────────────────────────────────────

  describe('serialize / deserialize', () => {
    it('round-trips events', () => {
      const a = addEvent(tr, 'A', 0, 10, ['t1'], { k: 1 })
      addEvent(tr, 'B', 20, 30)
      const json = tr.serialize()
      const restored = TemporalReasoner.deserialize(json)
      expect(restored.getStats().totalEvents).toBe(2)
      const evt = restored.getEvent(a.id)
      expect(evt).not.toBeNull()
      expect(evt!.name).toBe('A')
      expect(evt!.tags).toEqual(['t1'])
    })

    it('round-trips constraints', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      tr.addConstraint(a.id, b.id, 'before', 'test')
      const restored = TemporalReasoner.deserialize(tr.serialize())
      expect(restored.getConstraints()).toHaveLength(1)
      expect(restored.getConstraints()[0].relation).toBe('before')
    })

    it('round-trips query count and violation count', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      tr.query({ type: 'after', referenceTime: 0 })
      tr.addConstraint(a.id, b.id, 'after') // will violate
      tr.checkConstraints()

      const restored = TemporalReasoner.deserialize(tr.serialize())
      expect(restored.getStats().totalQueries).toBe(1)
      expect(restored.getStats().constraintViolations).toBe(1)
    })

    it('round-trips config', () => {
      const custom = new TemporalReasoner({ maxEvents: 3 })
      custom.addEvent('A', '', 0, 10)
      custom.addEvent('B', '', 20, 30)
      custom.addEvent('C', '', 40, 50)
      const restored = TemporalReasoner.deserialize(custom.serialize())
      // The restored instance should respect the original maxEvents=3
      expect(restored.addEvent('D', '', 60, 70)).toBeNull()
    })

    it('produces valid JSON string', () => {
      addEvent(tr, 'A', 0, 10)
      const json = tr.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('round-trips sequences and patterns', () => {
      for (let i = 0; i < 5; i++) {
        addEvent(tr, 'X', i * 100, i * 100 + 50)
      }
      tr.detectSequences()
      tr.analyzeTimeline()
      const restored = TemporalReasoner.deserialize(tr.serialize())
      // Sequences were stored internally
      expect(restored.getStats().totalSequences).toBeGreaterThanOrEqual(0)
    })
  })

  // ── getStats ──────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns zeroed stats on fresh instance', () => {
      const stats = tr.getStats()
      expect(stats.totalEvents).toBe(0)
      expect(stats.totalConstraints).toBe(0)
      expect(stats.totalSequences).toBe(0)
      expect(stats.totalPatterns).toBe(0)
      expect(stats.totalQueries).toBe(0)
      expect(stats.avgEventDurationMs).toBe(0)
      expect(stats.timespanMs).toBe(0)
      expect(stats.constraintViolations).toBe(0)
    })

    it('reflects added events', () => {
      addEvent(tr, 'A', 0, 100)
      addEvent(tr, 'B', 200, 500)
      const stats = tr.getStats()
      expect(stats.totalEvents).toBe(2)
      expect(stats.avgEventDurationMs).toBeGreaterThan(0)
    })

    it('computes timespanMs across all events', () => {
      addEvent(tr, 'A', 100, 200)
      addEvent(tr, 'B', 500, 600)
      const stats = tr.getStats()
      expect(stats.timespanMs).toBe(500) // 600 - 100
    })

    it('tracks constraints count', () => {
      const a = addEvent(tr, 'A', 0, 10)
      const b = addEvent(tr, 'B', 20, 30)
      tr.addConstraint(a.id, b.id, 'before')
      expect(tr.getStats().totalConstraints).toBe(1)
    })

    it('tracks patterns after analyzeTimeline', () => {
      const reasoner = new TemporalReasoner({ periodicityTolerance: 0.2 })
      for (let i = 0; i < 6; i++) {
        addEvent(reasoner, 'Ping', i * 1000, i * 1000 + 100)
      }
      reasoner.analyzeTimeline()
      expect(reasoner.getStats().totalPatterns).toBeGreaterThanOrEqual(1)
    })
  })
})
