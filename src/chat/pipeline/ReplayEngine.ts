/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ReplayEngine — Deterministic replay for debugging & reproducibility         ║
 * ║  Record sessions, replay with seeded RNG, compare for divergence             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import type { PipelinePhase } from './PipelineContract.js'

// ─── Types ─────────────────────────────────────────────────────────────────────

/** A single recorded decision. */
export interface ReplayDecision {
  readonly stepId: string
  readonly module: string
  readonly phase: PipelinePhase
  readonly input: string
  readonly output: unknown
  readonly confidence: number
  readonly outcome: 'success' | 'failure' | 'abstain'
  readonly durationMs: number
  readonly timestamp: number
}

/** A fully recorded session. */
export interface ReplaySession {
  readonly id: string
  readonly input: string
  readonly initialContext: Record<string, unknown>
  readonly decisions: readonly ReplayDecision[]
  readonly startedAt: number
  readonly endedAt: number
  readonly seed: number | null
  readonly version: string
}

/** Comparison of a single decision between original and replay. */
export interface DecisionComparison {
  readonly stepId: string
  readonly module: string
  readonly match: boolean
  readonly differences: readonly string[]
}

/** Result of replaying a session. */
export interface ReplayResult {
  readonly originalSessionId: string
  readonly replaySessionId: string
  readonly identical: boolean
  readonly comparisons: readonly DecisionComparison[]
  readonly divergenceCount: number
}

/** Configuration for the replay engine. */
export interface ReplayConfig {
  readonly maxSessions: number
  readonly deterministicMode: boolean
}

export const DEFAULT_REPLAY_CONFIG: ReplayConfig = {
  maxSessions: 50,
  deterministicMode: true,
}

// ─── Seeded RNG (Mulberry32) ───────────────────────────────────────────────────

/** Simple, fast seeded PRNG for deterministic replay. */
export class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed
  }

  next(): number {
    this.state |= 0
    this.state = this.state + 0x6D2B79F5 | 0
    let t = Math.imul(this.state ^ this.state >>> 15, 1 | this.state)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }

  getState(): number {
    return this.state
  }
}

// ─── Replay Engine ─────────────────────────────────────────────────────────────

/**
 * Records pipeline sessions and replays them deterministically.
 * Compares original vs. replayed decisions to surface divergence.
 */
export class ReplayEngine {
  private readonly config: ReplayConfig
  private readonly sessions: Map<string, ReplaySession> = new Map()
  private currentRecording: {
    id: string
    input: string
    context: Record<string, unknown>
    decisions: ReplayDecision[]
    startedAt: number
    seed: number | null
    version: string
  } | null = null
  private rng: SeededRandom | null = null

  constructor(config: Partial<ReplayConfig> = {}) {
    this.config = { ...DEFAULT_REPLAY_CONFIG, ...config }
  }

  /** Start recording a new session. Returns session ID. */
  startRecording(
    input: string,
    context: Record<string, unknown> = {},
    version = '1.0.0',
    seed?: number,
  ): string {
    const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const actualSeed = seed ?? (this.config.deterministicMode ? Date.now() : null)

    if (actualSeed !== null) {
      this.rng = new SeededRandom(actualSeed)
    }

    this.currentRecording = {
      id,
      input,
      context: { ...context },
      decisions: [],
      startedAt: Date.now(),
      seed: actualSeed,
      version,
    }

    return id
  }

  /** Record a decision during the active session. */
  recordDecision(decision: ReplayDecision): void {
    if (!this.currentRecording) return
    this.currentRecording.decisions.push(decision)
  }

  /** Stop recording and persist the session. */
  stopRecording(): ReplaySession | null {
    if (!this.currentRecording) return null

    const session: ReplaySession = {
      id: this.currentRecording.id,
      input: this.currentRecording.input,
      initialContext: this.currentRecording.context,
      decisions: [...this.currentRecording.decisions],
      startedAt: this.currentRecording.startedAt,
      endedAt: Date.now(),
      seed: this.currentRecording.seed,
      version: this.currentRecording.version,
    }

    // Evict oldest if at capacity
    if (this.sessions.size >= this.config.maxSessions) {
      const oldest = [...this.sessions.entries()]
        .sort((a, b) => a[1].startedAt - b[1].startedAt)[0]
      if (oldest) this.sessions.delete(oldest[0])
    }

    this.sessions.set(session.id, session)
    this.currentRecording = null
    this.rng = null

    return session
  }

  /**
   * Replay a recorded session. The executor receives each original decision
   * and must produce a new one; both are compared for divergence.
   */
  replay(
    sessionId: string,
    executor: (original: ReplayDecision, context: Record<string, unknown>) => ReplayDecision,
  ): ReplayResult | null {
    const original = this.sessions.get(sessionId)
    if (!original) return null

    const replayId = `replay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // Restore deterministic RNG
    if (original.seed !== null) {
      this.rng = new SeededRandom(original.seed)
    }

    const context = { ...original.initialContext }
    const comparisons: DecisionComparison[] = []
    let divergenceCount = 0

    for (const origDecision of original.decisions) {
      const replayed = executor(origDecision, context)
      const differences: string[] = []

      if (replayed.outcome !== origDecision.outcome) {
        differences.push(`outcome: ${origDecision.outcome} → ${replayed.outcome}`)
      }

      const confDelta = Math.abs(replayed.confidence - origDecision.confidence)
      if (confDelta > 0.01) {
        differences.push(
          `confidence: ${origDecision.confidence.toFixed(3)} → ${replayed.confidence.toFixed(3)}`,
        )
      }

      if (JSON.stringify(replayed.output) !== JSON.stringify(origDecision.output)) {
        differences.push('output changed')
      }

      if (differences.length > 0) divergenceCount++

      comparisons.push({
        stepId: origDecision.stepId,
        module: origDecision.module,
        match: differences.length === 0,
        differences,
      })
    }

    this.rng = null

    return {
      originalSessionId: sessionId,
      replaySessionId: replayId,
      identical: divergenceCount === 0,
      comparisons,
      divergenceCount,
    }
  }

  /** Deterministic random (during recording or replay). Falls back to Math.random. */
  getRandom(): number {
    return this.rng ? this.rng.next() : Math.random()
  }

  getSession(id: string): ReplaySession | undefined {
    return this.sessions.get(id)
  }

  getSessionIds(): string[] {
    return [...this.sessions.keys()]
  }

  isRecording(): boolean {
    return this.currentRecording !== null
  }

  getCurrentRecordingId(): string | null {
    return this.currentRecording?.id ?? null
  }

  get sessionCount(): number {
    return this.sessions.size
  }

  clear(): void {
    this.sessions.clear()
    this.currentRecording = null
    this.rng = null
  }
}
