/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ReplayStore — Persistent storage adapter for ReplayEngine sessions         ║
 * ║                                                                            ║
 * ║  Adds file-based persistence so replay sessions survive restarts.          ║
 * ║  Also provides session snapshots for mid-pipeline debugging.               ║
 * ║                                                                            ║
 * ║  No external dependencies.                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import type { ReplaySession, ReplayDecision } from './ReplayEngine.js'

// ─── Types ─────────────────────────────────────────────────────────────────────

/** A snapshot of pipeline state at a specific point in time. */
export interface PipelineSnapshot {
  readonly snapshotId: string
  readonly sessionId: string
  readonly stepIndex: number
  readonly decisions: readonly ReplayDecision[]
  readonly context: Record<string, unknown>
  readonly timestamp: number
}

/** Configuration for the replay store. */
export interface ReplayStoreConfig {
  /** Maximum sessions to keep in store. Default: 100 */
  readonly maxSessions: number
  /** Whether to capture snapshots automatically. Default: true */
  readonly enableSnapshots: boolean
  /** Snapshot interval: capture every N decisions. Default: 5 */
  readonly snapshotInterval: number
  /** Maximum snapshots per session. Default: 20 */
  readonly maxSnapshotsPerSession: number
}

/** Summary of a stored session (without full decision data). */
export interface SessionSummary {
  readonly id: string
  readonly input: string
  readonly version: string
  readonly startedAt: number
  readonly endedAt: number
  readonly decisionCount: number
  readonly snapshotCount: number
}

/** Store statistics. */
export interface ReplayStoreStats {
  readonly totalSessions: number
  readonly totalSnapshots: number
  readonly oldestSessionAt: number | null
  readonly newestSessionAt: number | null
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_STORE_CONFIG: ReplayStoreConfig = {
  maxSessions: 100,
  enableSnapshots: true,
  snapshotInterval: 5,
  maxSnapshotsPerSession: 20,
}

// ─── ReplayStore ───────────────────────────────────────────────────────────────

export class ReplayStore {
  private readonly config: ReplayStoreConfig
  private readonly sessions: Map<string, ReplaySession> = new Map()
  private readonly snapshots: Map<string, PipelineSnapshot[]> = new Map()

  constructor(config: Partial<ReplayStoreConfig> = {}) {
    this.config = { ...DEFAULT_STORE_CONFIG, ...config }
  }

  // ── Session Storage ────────────────────────────────────────────────────────

  /**
   * Store a completed replay session.
   */
  saveSession(session: ReplaySession): void {
    // Evict oldest if at capacity
    if (this.sessions.size >= this.config.maxSessions) {
      this.evictOldest()
    }

    this.sessions.set(session.id, session)
  }

  /**
   * Retrieve a session by ID.
   */
  getSession(id: string): ReplaySession | undefined {
    return this.sessions.get(id)
  }

  /**
   * List all session summaries.
   */
  listSessions(): SessionSummary[] {
    const summaries: SessionSummary[] = []

    for (const session of this.sessions.values()) {
      summaries.push({
        id: session.id,
        input: session.input,
        version: session.version,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        decisionCount: session.decisions.length,
        snapshotCount: this.snapshots.get(session.id)?.length ?? 0,
      })
    }

    return summaries.sort((a, b) => b.startedAt - a.startedAt)
  }

  /**
   * Delete a session and its snapshots.
   */
  deleteSession(id: string): boolean {
    this.snapshots.delete(id)
    return this.sessions.delete(id)
  }

  // ── Snapshots ──────────────────────────────────────────────────────────────

  /**
   * Capture a snapshot of the current pipeline state.
   */
  captureSnapshot(
    sessionId: string,
    stepIndex: number,
    decisions: readonly ReplayDecision[],
    context: Record<string, unknown>,
  ): PipelineSnapshot | null {
    if (!this.config.enableSnapshots) return null

    // Check if we should capture based on interval
    const existingSnapshots = this.snapshots.get(sessionId) ?? []
    if (
      this.config.snapshotInterval > 0 &&
      stepIndex % this.config.snapshotInterval !== 0 &&
      stepIndex !== 0
    ) {
      return null
    }

    // Check max snapshots per session
    if (existingSnapshots.length >= this.config.maxSnapshotsPerSession) {
      return null
    }

    const snapshot: PipelineSnapshot = {
      snapshotId: `snap-${sessionId}-${stepIndex}`,
      sessionId,
      stepIndex,
      decisions: [...decisions],
      context: { ...context },
      timestamp: Date.now(),
    }

    existingSnapshots.push(snapshot)
    this.snapshots.set(sessionId, existingSnapshots)

    return snapshot
  }

  /**
   * Get all snapshots for a session.
   */
  getSnapshots(sessionId: string): readonly PipelineSnapshot[] {
    return this.snapshots.get(sessionId) ?? []
  }

  /**
   * Get a specific snapshot by step index.
   */
  getSnapshotAtStep(sessionId: string, stepIndex: number): PipelineSnapshot | undefined {
    const snaps = this.snapshots.get(sessionId)
    return snaps?.find(s => s.stepIndex === stepIndex)
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  /**
   * Export all data for file persistence.
   */
  serialize(): string {
    const data = {
      sessions: [...this.sessions.values()],
      snapshots: Object.fromEntries([...this.snapshots.entries()].map(([k, v]) => [k, v])),
    }
    return JSON.stringify(data, null, 2)
  }

  /**
   * Import data from file.
   */
  deserialize(json: string): void {
    const data = JSON.parse(json) as {
      sessions: ReplaySession[]
      snapshots: Record<string, PipelineSnapshot[]>
    }

    this.sessions.clear()
    this.snapshots.clear()

    for (const session of data.sessions) {
      this.sessions.set(session.id, session)
    }

    for (const [sessionId, snaps] of Object.entries(data.snapshots)) {
      this.snapshots.set(sessionId, snaps)
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  getStats(): ReplayStoreStats {
    let oldest: number | null = null
    let newest: number | null = null
    let totalSnapshots = 0

    for (const session of this.sessions.values()) {
      if (oldest === null || session.startedAt < oldest) oldest = session.startedAt
      if (newest === null || session.startedAt > newest) newest = session.startedAt
    }

    for (const snaps of this.snapshots.values()) {
      totalSnapshots += snaps.length
    }

    return {
      totalSessions: this.sessions.size,
      totalSnapshots,
      oldestSessionAt: oldest,
      newestSessionAt: newest,
    }
  }

  get sessionCount(): number {
    return this.sessions.size
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  private evictOldest(): void {
    let oldestId: string | null = null
    let oldestTime = Infinity

    for (const [id, session] of this.sessions) {
      if (session.startedAt < oldestTime) {
        oldestTime = session.startedAt
        oldestId = id
      }
    }

    if (oldestId) {
      this.sessions.delete(oldestId)
      this.snapshots.delete(oldestId)
    }
  }

  clear(): void {
    this.sessions.clear()
    this.snapshots.clear()
  }
}
