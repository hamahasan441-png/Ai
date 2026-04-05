/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TokenBudgetManager — Session token budget tracking with continuation       ║
 * ║                                                                            ║
 * ║  Tracks cumulative token usage across a session, warns before hitting       ║
 * ║  cloud limits, and provides a continuation protocol so the user can         ║
 * ║  extend the budget or reset.                                               ║
 * ║                                                                            ║
 * ║  No external dependencies.                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Configuration for the token budget manager. */
export interface TokenBudgetConfig {
  /** Maximum tokens allowed per session before pausing. Default: 80 000. */
  readonly maxSessionTokens: number
  /** Fraction of budget at which to warn (0-1). Default: 0.85. */
  readonly warningThreshold: number
  /** Enable budget tracking. Default: true. */
  readonly enabled: boolean
}

/** Snapshot of current budget state. */
export interface BudgetReport {
  /** Total input tokens consumed this session. */
  readonly totalInputTokens: number
  /** Total output tokens consumed this session. */
  readonly totalOutputTokens: number
  /** Combined total tokens. */
  readonly totalTokens: number
  /** Session budget limit. */
  readonly maxSessionTokens: number
  /** Tokens remaining before budget is exhausted. */
  readonly remainingTokens: number
  /** Usage as a fraction 0-1. */
  readonly usagePercent: number
  /** True when usagePercent >= warningThreshold. */
  readonly budgetWarning: boolean
  /** True when usagePercent >= 1.0 (budget exhausted). */
  readonly budgetExhausted: boolean
  /** How many times the user has continued. */
  readonly continuations: number
}

/** Token usage for a single interaction. */
export interface InteractionUsage {
  readonly inputTokens: number
  readonly outputTokens: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_BUDGET_CONFIG: TokenBudgetConfig = {
  maxSessionTokens: 80_000,
  warningThreshold: 0.85,
  enabled: true,
}

// ─── TokenBudgetManager ────────────────────────────────────────────────────────

export class TokenBudgetManager {
  private readonly config: TokenBudgetConfig
  private totalInputTokens = 0
  private totalOutputTokens = 0
  private continuations = 0
  private effectiveBudget: number

  constructor(config: Partial<TokenBudgetConfig> = {}) {
    this.config = { ...DEFAULT_BUDGET_CONFIG, ...config }
    this.effectiveBudget = this.config.maxSessionTokens
  }

  // ── Tracking ───────────────────────────────────────────────────────────────

  /**
   * Record token usage for a single interaction.
   */
  trackUsage(usage: InteractionUsage): void {
    this.totalInputTokens += usage.inputTokens
    this.totalOutputTokens += usage.outputTokens
  }

  // ── Budget Queries ─────────────────────────────────────────────────────────

  /** Whether tracking is enabled. */
  get enabled(): boolean {
    return this.config.enabled
  }

  /** Total tokens consumed this session. */
  get totalTokens(): number {
    return this.totalInputTokens + this.totalOutputTokens
  }

  /** Remaining tokens before exhaustion. */
  get remainingTokens(): number {
    return Math.max(0, this.effectiveBudget - this.totalTokens)
  }

  /** Usage as a fraction of the effective budget (0-1+). */
  get usagePercent(): number {
    if (this.effectiveBudget <= 0) return 1
    return this.totalTokens / this.effectiveBudget
  }

  /** True when usage >= warning threshold. */
  get isWarning(): boolean {
    return this.usagePercent >= this.config.warningThreshold
  }

  /** True when budget is fully exhausted. */
  get isExhausted(): boolean {
    return this.usagePercent >= 1.0
  }

  /**
   * Whether the session can continue without user intervention.
   * Returns false when budget is exhausted.
   */
  canContinue(): boolean {
    if (!this.config.enabled) return true
    return !this.isExhausted
  }

  /**
   * Get a full report of the current budget state.
   */
  getReport(): BudgetReport {
    return {
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalTokens: this.totalTokens,
      maxSessionTokens: this.effectiveBudget,
      remainingTokens: this.remainingTokens,
      usagePercent: Math.min(1, this.usagePercent),
      budgetWarning: this.isWarning,
      budgetExhausted: this.isExhausted,
      continuations: this.continuations,
    }
  }

  // ── Continuation Protocol ──────────────────────────────────────────────────

  /**
   * Extend the budget by another full session allocation.
   * Called when the user types 'continue'.
   */
  extendBudget(): void {
    this.effectiveBudget += this.config.maxSessionTokens
    this.continuations++
  }

  /**
   * Reset the budget to zero — start fresh.
   * Called when the user types 'reset'.
   */
  reset(): void {
    this.totalInputTokens = 0
    this.totalOutputTokens = 0
    this.continuations = 0
    this.effectiveBudget = this.config.maxSessionTokens
  }

  // ── Warning Message Generation ─────────────────────────────────────────────

  /**
   * Get an appropriate budget message to append to the response,
   * or null if no message is needed.
   */
  getBudgetMessage(): string | null {
    if (!this.config.enabled) return null

    if (this.isExhausted) {
      return `\n\n🛑 Token budget reached (${this.totalTokens.toLocaleString()}/${this.effectiveBudget.toLocaleString()}). Type 'continue' to extend the budget or 'reset' to start a new session.`
    }

    if (this.isWarning) {
      const pct = Math.round(this.usagePercent * 100)
      return `\n\n⚠️ Token budget at ${pct}% (${this.totalTokens.toLocaleString()}/${this.effectiveBudget.toLocaleString()}). Type 'continue' to keep going or 'reset' to start fresh.`
    }

    return null
  }

  // ── Response Chunking ──────────────────────────────────────────────────────

  private pendingChunks: string[] = []

  /**
   * If a response exceeds maxLength, split it into chunks.
   * Returns the first chunk and stores the rest internally.
   */
  chunkResponse(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      this.pendingChunks = []
      return text
    }

    // Split at paragraph or sentence boundaries within maxLength
    const chunks: string[] = []
    let remaining = text

    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        chunks.push(remaining)
        break
      }

      // Find a good break point (paragraph > sentence > word)
      let breakIdx = remaining.lastIndexOf('\n\n', maxLength)
      if (breakIdx < maxLength * 0.5) {
        breakIdx = remaining.lastIndexOf('. ', maxLength)
        if (breakIdx > 0) breakIdx += 1 // include the period
      }
      if (breakIdx < maxLength * 0.3) {
        breakIdx = remaining.lastIndexOf(' ', maxLength)
      }
      if (breakIdx <= 0) {
        breakIdx = maxLength
      }

      chunks.push(remaining.slice(0, breakIdx).trimEnd())
      remaining = remaining.slice(breakIdx).trimStart()
    }

    this.pendingChunks = chunks.slice(1)
    const firstChunk = chunks[0] ?? text
    if (this.pendingChunks.length > 0) {
      return firstChunk + '\n\n... [response truncated, type \'continue\' for more]'
    }
    return firstChunk
  }

  /**
   * Whether there are pending response chunks from a previous truncation.
   */
  hasPendingChunks(): boolean {
    return this.pendingChunks.length > 0
  }

  /**
   * Get the next pending chunk, or null if none remain.
   */
  getNextChunk(): string | null {
    if (this.pendingChunks.length === 0) return null
    const chunk = this.pendingChunks.shift()!
    if (this.pendingChunks.length > 0) {
      return chunk + '\n\n... [response truncated, type \'continue\' for more]'
    }
    return chunk
  }
}
