/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ReplayStore — Tests                                                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ReplayStore } from '../pipeline/ReplayStore.js'
import { PipelinePhase } from '../pipeline/PipelineContract.js'
import type { ReplaySession, ReplayDecision } from '../pipeline/ReplayEngine.js'

// ── Helpers ──

function makeDecision(overrides: Partial<ReplayDecision> = {}): ReplayDecision {
  return {
    stepId: 'step-1',
    module: 'TestModule',
    phase: PipelinePhase.PHASE_1_CORE,
    input: 'test input',
    output: 'test output',
    confidence: 0.9,
    outcome: 'success',
    durationMs: 10,
    timestamp: Date.now(),
    ...overrides,
  }
}

function makeSession(id: string, startedAt?: number): ReplaySession {
  const start = startedAt ?? Date.now()
  return {
    id,
    input: `Test input for ${id}`,
    initialContext: { foo: 'bar' },
    decisions: [makeDecision()],
    startedAt: start,
    endedAt: start + 100,
    seed: 42,
    version: '1.0.0',
  }
}

describe('ReplayStore', () => {
  let store: ReplayStore

  beforeEach(() => {
    store = new ReplayStore()
  })

  // ── Constructor ──

  describe('constructor', () => {
    it('creates with default config', () => {
      const stats = store.getStats()
      expect(stats.totalSessions).toBe(0)
      expect(stats.totalSnapshots).toBe(0)
    })

    it('accepts custom config', () => {
      const custom = new ReplayStore({ maxSessions: 5 })
      expect(custom.sessionCount).toBe(0)
    })
  })

  // ── Session Storage ──

  describe('saveSession', () => {
    it('saves and retrieves a session', () => {
      const session = makeSession('s1')
      store.saveSession(session)
      expect(store.getSession('s1')).toBe(session)
    })

    it('evicts oldest when at capacity', () => {
      const small = new ReplayStore({ maxSessions: 3 })
      small.saveSession(makeSession('s1', 1000))
      small.saveSession(makeSession('s2', 2000))
      small.saveSession(makeSession('s3', 3000))
      expect(small.sessionCount).toBe(3)

      small.saveSession(makeSession('s4', 4000))
      expect(small.sessionCount).toBe(3)
      expect(small.getSession('s1')).toBeUndefined() // oldest evicted
      expect(small.getSession('s4')).toBeDefined()
    })
  })

  describe('listSessions', () => {
    it('lists sessions sorted by startedAt descending', () => {
      store.saveSession(makeSession('s1', 1000))
      store.saveSession(makeSession('s2', 3000))
      store.saveSession(makeSession('s3', 2000))

      const list = store.listSessions()
      expect(list).toHaveLength(3)
      expect(list[0]!.id).toBe('s2') // Most recent first
      expect(list[2]!.id).toBe('s1') // Oldest last
    })

    it('includes snapshot count in summary', () => {
      store.saveSession(makeSession('s1'))
      store.captureSnapshot('s1', 0, [], { step: 0 })
      store.captureSnapshot('s1', 5, [makeDecision()], { step: 5 })

      const list = store.listSessions()
      expect(list[0]!.snapshotCount).toBe(2)
    })
  })

  describe('deleteSession', () => {
    it('deletes a session and its snapshots', () => {
      store.saveSession(makeSession('s1'))
      store.captureSnapshot('s1', 0, [], {})

      expect(store.deleteSession('s1')).toBe(true)
      expect(store.getSession('s1')).toBeUndefined()
      expect(store.getSnapshots('s1')).toHaveLength(0)
    })

    it('returns false for non-existent session', () => {
      expect(store.deleteSession('nonexistent')).toBe(false)
    })
  })

  // ── Snapshots ──

  describe('captureSnapshot', () => {
    it('captures a snapshot at step 0', () => {
      const snap = store.captureSnapshot('s1', 0, [makeDecision()], { context: true })
      expect(snap).not.toBeNull()
      expect(snap!.sessionId).toBe('s1')
      expect(snap!.stepIndex).toBe(0)
    })

    it('captures snapshot at interval steps', () => {
      const store5 = new ReplayStore({ snapshotInterval: 5 })
      const snap0 = store5.captureSnapshot('s1', 0, [], {})
      const snap3 = store5.captureSnapshot('s1', 3, [], {})
      const snap5 = store5.captureSnapshot('s1', 5, [], {})

      expect(snap0).not.toBeNull()
      expect(snap3).toBeNull() // Not at interval
      expect(snap5).not.toBeNull()
    })

    it('respects maxSnapshotsPerSession', () => {
      const small = new ReplayStore({ maxSnapshotsPerSession: 2, snapshotInterval: 1 })
      small.captureSnapshot('s1', 0, [], {})
      small.captureSnapshot('s1', 1, [], {})
      const third = small.captureSnapshot('s1', 2, [], {})

      expect(third).toBeNull()
      expect(small.getSnapshots('s1')).toHaveLength(2)
    })

    it('returns null when snapshots disabled', () => {
      const noSnap = new ReplayStore({ enableSnapshots: false })
      const result = noSnap.captureSnapshot('s1', 0, [], {})
      expect(result).toBeNull()
    })
  })

  describe('getSnapshotAtStep', () => {
    it('retrieves snapshot by step index', () => {
      store.captureSnapshot('s1', 0, [], { a: 1 })
      store.captureSnapshot('s1', 5, [makeDecision()], { a: 2 })

      const snap = store.getSnapshotAtStep('s1', 0)
      expect(snap).toBeDefined()
      expect(snap!.stepIndex).toBe(0)
    })

    it('returns undefined for non-existent step', () => {
      expect(store.getSnapshotAtStep('s1', 999)).toBeUndefined()
    })
  })

  // ── Serialization ──

  describe('serialization', () => {
    it('serializes to JSON and deserializes back', () => {
      store.saveSession(makeSession('s1'))
      store.saveSession(makeSession('s2'))
      store.captureSnapshot('s1', 0, [makeDecision()], { x: 1 })

      const json = store.serialize()
      expect(typeof json).toBe('string')

      const restored = new ReplayStore()
      restored.deserialize(json)

      expect(restored.sessionCount).toBe(2)
      expect(restored.getSession('s1')).toBeDefined()
      expect(restored.getSession('s2')).toBeDefined()
      expect(restored.getSnapshots('s1')).toHaveLength(1)
    })

    it('handles empty store serialization', () => {
      const json = store.serialize()
      const restored = new ReplayStore()
      restored.deserialize(json)
      expect(restored.sessionCount).toBe(0)
    })
  })

  // ── Stats ──

  describe('getStats', () => {
    it('returns correct stats', () => {
      store.saveSession(makeSession('s1', 1000))
      store.saveSession(makeSession('s2', 2000))
      store.captureSnapshot('s1', 0, [], {})

      const stats = store.getStats()
      expect(stats.totalSessions).toBe(2)
      expect(stats.totalSnapshots).toBe(1)
      expect(stats.oldestSessionAt).toBe(1000)
      expect(stats.newestSessionAt).toBe(2000)
    })

    it('returns null timestamps when empty', () => {
      const stats = store.getStats()
      expect(stats.oldestSessionAt).toBeNull()
      expect(stats.newestSessionAt).toBeNull()
    })
  })

  // ── Clear ──

  describe('clear', () => {
    it('resets all state', () => {
      store.saveSession(makeSession('s1'))
      store.captureSnapshot('s1', 0, [], {})
      store.clear()

      expect(store.sessionCount).toBe(0)
      expect(store.getStats().totalSnapshots).toBe(0)
    })
  })
})
