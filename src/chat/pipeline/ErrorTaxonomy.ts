/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ErrorTaxonomy — Standardized failure classes for robust retry strategy      ║
 * ║  network · model · tool · verification · config · timeout · critical         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { PipelinePhase } from './PipelineContract.js'

// ─── Error Classes ─────────────────────────────────────────────────────────────

/** Standardized error classification for the pipeline. */
export enum EngineErrorClass {
  NETWORK_FAIL = 'NETWORK_FAIL',
  MODEL_FAIL = 'MODEL_FAIL',
  TOOL_FAIL = 'TOOL_FAIL',
  VERIFICATION_FAIL = 'VERIFICATION_FAIL',
  TIMEOUT = 'TIMEOUT',
  CRITICAL = 'CRITICAL',
  CONFIG_FAIL = 'CONFIG_FAIL',
  INPUT_FAIL = 'INPUT_FAIL',
  DEPENDENCY_FAIL = 'DEPENDENCY_FAIL',
  UNKNOWN = 'UNKNOWN',
}

/** Which error classes are safe to retry. */
export const RETRYABLE_ERRORS: ReadonlySet<EngineErrorClass> = new Set([
  EngineErrorClass.NETWORK_FAIL,
  EngineErrorClass.TOOL_FAIL,
  EngineErrorClass.TIMEOUT,
])

/** Priority for error handling — lower number = more urgent. */
export const ERROR_PRIORITY: Readonly<Record<EngineErrorClass, number>> = {
  [EngineErrorClass.CRITICAL]: 0,
  [EngineErrorClass.CONFIG_FAIL]: 1,
  [EngineErrorClass.DEPENDENCY_FAIL]: 2,
  [EngineErrorClass.MODEL_FAIL]: 3,
  [EngineErrorClass.VERIFICATION_FAIL]: 4,
  [EngineErrorClass.NETWORK_FAIL]: 5,
  [EngineErrorClass.TIMEOUT]: 6,
  [EngineErrorClass.TOOL_FAIL]: 7,
  [EngineErrorClass.INPUT_FAIL]: 8,
  [EngineErrorClass.UNKNOWN]: 9,
}

// ─── Error Record ──────────────────────────────────────────────────────────────

/** Structured error produced by the engine. */
export interface EngineError {
  readonly id: string
  readonly errorClass: EngineErrorClass
  readonly message: string
  readonly source: string
  readonly phase: PipelinePhase
  readonly retryable: boolean
  readonly priority: number
  readonly timestamp: number
  readonly stack: string | null
  readonly metadata: Record<string, unknown>
}

// ─── Factory ───────────────────────────────────────────────────────────────────

/** Create a structured EngineError. */
export function createEngineError(
  errorClass: EngineErrorClass,
  message: string,
  source: string,
  phase: PipelinePhase,
  metadata: Record<string, unknown> = {},
  originalError?: Error,
): EngineError {
  const rand = Math.random().toString(36).slice(2, 8)
  return {
    id: `err-${errorClass}-${Date.now()}-${rand}`,
    errorClass,
    message,
    source,
    phase,
    retryable: RETRYABLE_ERRORS.has(errorClass),
    priority: ERROR_PRIORITY[errorClass],
    timestamp: Date.now(),
    stack: originalError?.stack ?? null,
    metadata,
  }
}

/** Classify a raw JS error into an EngineErrorClass. */
export function classifyError(error: unknown): EngineErrorClass {
  if (error instanceof TypeError) return EngineErrorClass.INPUT_FAIL
  if (error instanceof RangeError) return EngineErrorClass.INPUT_FAIL

  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('timeout') || msg.includes('timed out')) return EngineErrorClass.TIMEOUT
    if (
      msg.includes('network') ||
      msg.includes('econnrefused') ||
      msg.includes('enotfound') ||
      msg.includes('fetch')
    )
      return EngineErrorClass.NETWORK_FAIL
    if (msg.includes('model') || msg.includes('inference') || msg.includes('token'))
      return EngineErrorClass.MODEL_FAIL
    if (msg.includes('config') || msg.includes('configuration')) return EngineErrorClass.CONFIG_FAIL
    if (msg.includes('dependency') || msg.includes('not initialized'))
      return EngineErrorClass.DEPENDENCY_FAIL
    if (msg.includes('verification') || msg.includes('validation') || msg.includes('invalid'))
      return EngineErrorClass.VERIFICATION_FAIL
  }

  return EngineErrorClass.UNKNOWN
}

// ─── Retry Strategy ────────────────────────────────────────────────────────────

/** Retry configuration with exponential backoff. */
export interface RetryConfig {
  readonly maxRetries: number
  readonly baseDelayMs: number
  readonly backoffFactor: number
  readonly maxDelayMs: number
  readonly jitterFactor: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  backoffFactor: 2,
  maxDelayMs: 5_000,
  jitterFactor: 0.1,
}

/** Calculate delay for a given retry attempt. */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): number {
  const delay = Math.min(
    config.baseDelayMs * Math.pow(config.backoffFactor, attempt),
    config.maxDelayMs,
  )
  const jitter = delay * config.jitterFactor * (Math.random() * 2 - 1)
  return Math.max(0, Math.round(delay + jitter))
}

/** Determine whether a retry should be attempted. */
export function shouldRetry(
  error: EngineError,
  currentAttempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): boolean {
  if (currentAttempt >= config.maxRetries) return false
  return error.retryable
}

// ─── Error Aggregator ──────────────────────────────────────────────────────────

/** Collects and summarizes errors across a pipeline run. */
export class ErrorAggregator {
  private readonly errors: EngineError[] = []

  add(error: EngineError): void {
    this.errors.push(error)
  }

  getAll(): readonly EngineError[] {
    return [...this.errors].sort((a, b) => a.priority - b.priority)
  }

  getByClass(errorClass: EngineErrorClass): readonly EngineError[] {
    return this.errors.filter(e => e.errorClass === errorClass)
  }

  getBySource(source: string): readonly EngineError[] {
    return this.errors.filter(e => e.source === source)
  }

  getByPhase(phase: PipelinePhase): readonly EngineError[] {
    return this.errors.filter(e => e.phase === phase)
  }

  hasCritical(): boolean {
    return this.errors.some(e => e.errorClass === EngineErrorClass.CRITICAL)
  }

  getSummary(): Record<EngineErrorClass, number> {
    const summary = {} as Record<EngineErrorClass, number>
    for (const cls of Object.values(EngineErrorClass)) {
      summary[cls] = 0
    }
    for (const error of this.errors) {
      summary[error.errorClass]++
    }
    return summary
  }

  get count(): number {
    return this.errors.length
  }

  clear(): void {
    this.errors.length = 0
  }
}
