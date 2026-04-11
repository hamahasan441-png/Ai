import { describe, it, expect, beforeEach } from 'vitest'
import {
  SeededRandom,
  ReplayEngine,
  CONFIDENCE_MATCH_TOLERANCE,
  DEFAULT_REPLAY_CONFIG,
} from '../ReplayEngine.js'
import { PipelinePhase } from '../PipelineContract.js'
import type { ReplayDecision } from '../ReplayEngine.js'

function makeDecision(overrides: Partial<ReplayDecision> = {}): ReplayDecision {
  return {
    stepId: 'step-1',
    module: 'SemanticEngine',
    phase: PipelinePhase.PHASE_1_CORE,
    input: 'hello',
    output: { result: 'world' },
    confidence: 0.95,
    outcome: 'success',
    durationMs: 10,
    timestamp: Date.now(),
    ...overrides,
  }
}

describe('SeededRandom', () => {
  it('should produce deterministic values for the same seed', () => {
    const a = new SeededRandom(42)
    const b = new SeededRandom(42)
    expect(a.next()).toBe(b.next())
    expect(a.next()).toBe(b.next())
  })

  it('should return values between 0 and 1', () => {
    const rng = new SeededRandom(123)
    for (let i = 0; i < 100; i++) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('should produce different values for different seeds', () => {
    const a = new SeededRandom(1)
    const b = new SeededRandom(2)
    expect(a.next()).not.toBe(b.next())
  })

  it('should expose internal state via getState', () => {
    const rng = new SeededRandom(42)
    const s1 = rng.getState()
    rng.next()
    expect(rng.getState()).not.toBe(s1)
  })
})

describe('ReplayEngine', () => {
  let engine: ReplayEngine

  beforeEach(() => {
    engine = new ReplayEngine()
  })

  // ── recording lifecycle ──
  it('should not be recording initially', () => {
    expect(engine.isRecording()).toBe(false)
    expect(engine.getCurrentRecordingId()).toBeNull()
  })

  it('should start recording and return a session id', () => {
    const id = engine.startRecording('test input')
    expect(typeof id).toBe('string')
    expect(engine.isRecording()).toBe(true)
    expect(engine.getCurrentRecordingId()).toBe(id)
  })

  it('should record decisions during a session', () => {
    engine.startRecording('test')
    engine.recordDecision(makeDecision())
    const session = engine.stopRecording()
    expect(session).not.toBeNull()
    expect(session!.decisions).toHaveLength(1)
  })

  it('should ignore recordDecision when not recording', () => {
    engine.recordDecision(makeDecision())
    // No error thrown, just silently ignored
    expect(engine.isRecording()).toBe(false)
  })

  it('should stop recording and persist the session', () => {
    const id = engine.startRecording('test')
    engine.stopRecording()
    expect(engine.isRecording()).toBe(false)
    expect(engine.getSession(id)).toBeDefined()
  })

  it('should return null when stopping without a recording', () => {
    expect(engine.stopRecording()).toBeNull()
  })

  // ── session storage ──
  it('should retrieve a session by id', () => {
    const id = engine.startRecording('input')
    engine.stopRecording()
    const session = engine.getSession(id)
    expect(session?.input).toBe('input')
  })

  it('should return undefined for unknown session id', () => {
    expect(engine.getSession('nonexistent')).toBeUndefined()
  })

  it('should list all session ids', () => {
    const id1 = engine.startRecording('a')
    engine.stopRecording()
    const id2 = engine.startRecording('b')
    engine.stopRecording()
    expect(engine.getSessionIds()).toContain(id1)
    expect(engine.getSessionIds()).toContain(id2)
  })

  it('should report sessionCount', () => {
    expect(engine.sessionCount).toBe(0)
    engine.startRecording('x')
    engine.stopRecording()
    expect(engine.sessionCount).toBe(1)
  })

  // ── eviction ──
  it('should evict oldest session when maxSessions is reached', () => {
    const small = new ReplayEngine({ maxSessions: 2 })
    const id1 = small.startRecording('a')
    small.stopRecording()
    small.startRecording('b')
    small.stopRecording()
    small.startRecording('c')
    small.stopRecording()
    expect(small.sessionCount).toBe(2)
    expect(small.getSession(id1)).toBeUndefined()
  })

  // ── replay ──
  it('should return null when replaying unknown session', () => {
    expect(engine.replay('bad-id', () => makeDecision())).toBeNull()
  })

  it('should replay an identical session as identical', () => {
    engine.startRecording('test', {}, '1.0.0', 42)
    const dec = makeDecision()
    engine.recordDecision(dec)
    const session = engine.stopRecording()!

    const result = engine.replay(session.id, orig => orig)
    expect(result).not.toBeNull()
    expect(result!.identical).toBe(true)
    expect(result!.divergenceCount).toBe(0)
  })

  it('should detect outcome divergence on replay', () => {
    engine.startRecording('test', {}, '1.0.0', 42)
    engine.recordDecision(makeDecision({ outcome: 'success' }))
    const session = engine.stopRecording()!

    const result = engine.replay(session.id, orig => ({
      ...orig,
      outcome: 'failure',
    }))
    expect(result!.identical).toBe(false)
    expect(result!.divergenceCount).toBe(1)
    expect(result!.comparisons[0].differences).toContain('outcome: success → failure')
  })

  it('should detect confidence divergence beyond tolerance', () => {
    engine.startRecording('test', {}, '1.0.0', 42)
    engine.recordDecision(makeDecision({ confidence: 0.9 }))
    const session = engine.stopRecording()!

    const result = engine.replay(session.id, orig => ({
      ...orig,
      confidence: 0.9 + CONFIDENCE_MATCH_TOLERANCE + 0.01,
    }))
    expect(result!.identical).toBe(false)
  })

  it('should detect output divergence on replay', () => {
    engine.startRecording('test', {}, '1.0.0', 42)
    engine.recordDecision(makeDecision({ output: { a: 1 } }))
    const session = engine.stopRecording()!

    const result = engine.replay(session.id, orig => ({
      ...orig,
      output: { a: 2 },
    }))
    expect(result!.comparisons[0].differences).toContain('output changed')
  })

  // ── getRandom ──
  it('should provide deterministic random during recording with seed', () => {
    engine.startRecording('test', {}, '1.0.0', 42)
    const v1 = engine.getRandom()
    engine.stopRecording()

    engine.startRecording('test', {}, '1.0.0', 42)
    const v2 = engine.getRandom()
    engine.stopRecording()

    expect(v1).toBe(v2)
  })

  it('should fall back to Math.random when no RNG is active', () => {
    const v = engine.getRandom()
    expect(typeof v).toBe('number')
    expect(v).toBeGreaterThanOrEqual(0)
    expect(v).toBeLessThan(1)
  })

  // ── clear ──
  it('should clear all sessions and state', () => {
    engine.startRecording('test')
    engine.stopRecording()
    engine.clear()
    expect(engine.sessionCount).toBe(0)
    expect(engine.isRecording()).toBe(false)
  })

  // ── DEFAULT_REPLAY_CONFIG ──
  it('should export sensible default config', () => {
    expect(DEFAULT_REPLAY_CONFIG.maxSessions).toBe(50)
    expect(DEFAULT_REPLAY_CONFIG.deterministicMode).toBe(true)
  })
})
