/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Error Recovery & State Checkpointing — Types                                ║
 * ║                                                                              ║
 * ║  Shared type definitions for the recovery module:                            ║
 * ║    • Checkpoint – serialisable state snapshots                               ║
 * ║    • RecoveryStrategy / RecoveryPolicy – retry & fallback rules              ║
 * ║    • CheckpointStore – pluggable persistence interface                       ║
 * ║    • GracefulDegradation – service health tracking                           ║
 * ║    • DeadLetterEntry – unprocessable operation records                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Checkpoint ──

export type CheckpointType = 'conversation' | 'tool' | 'workflow'

export interface Checkpoint {
  id: string
  timestamp: number
  type: CheckpointType
  state: Record<string, unknown>
  metadata?: Record<string, unknown>
}

// ── Recovery ──

export type RecoveryStrategy = 'retry' | 'skip' | 'fallback' | 'abort'

export interface RecoveryPolicy {
  maxRetries: number
  backoffMs: number
  strategyPerError: Record<string, RecoveryStrategy>
  fallbackFn?: () => unknown | Promise<unknown>
}

// ── Checkpoint Store ──

export interface CheckpointStore {
  save(checkpoint: Checkpoint): Promise<void>
  load(id: string): Promise<Checkpoint | undefined>
  list(type?: CheckpointType): Promise<Checkpoint[]>
  delete(id: string): Promise<boolean>
  cleanup(maxAge?: number, maxCount?: number): Promise<number>
}

// ── Graceful Degradation ──

export type ServiceStatus = 'healthy' | 'degraded' | 'unavailable'

export interface GracefulDegradation {
  serviceName: string
  status: ServiceStatus
  fallbackBehavior?: string
}

// ── Dead Letter Queue ──

export interface DeadLetterEntry {
  id: string
  timestamp: number
  operation: string
  error: string
  retryCount: number
  lastRetryAt: number | null
}
