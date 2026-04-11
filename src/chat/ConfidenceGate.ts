/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ConfidenceGate — Decision quality control with abstain mode                ║
 * ║                                                                            ║
 * ║  Sits between reasoning and response generation. Evaluates confidence      ║
 * ║  from multiple signals, decides whether to respond, abstain, or hedge.     ║
 * ║  Provides calibration feedback loop for continuous improvement.             ║
 * ║                                                                            ║
 * ║  No external dependencies.                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Signal source contributing to the gate decision. */
export interface ConfidenceSignal {
  readonly source: string
  readonly score: number
  readonly weight: number
  readonly reason: string
}

/** Decision made by the gate. */
export type GateDecision = 'respond' | 'hedge' | 'abstain'

/** Full result of a gate evaluation. */
export interface GateResult {
  readonly decision: GateDecision
  readonly aggregateConfidence: number
  readonly signals: readonly ConfidenceSignal[]
  readonly explanation: string
  /** If decision is 'hedge', a suggested prefix for the response. */
  readonly hedgePrefix: string | null
  /** If decision is 'abstain', a suggested refusal message. */
  readonly abstainMessage: string | null
}

/** Configuration for the confidence gate. */
export interface ConfidenceGateConfig {
  /** Below this, abstain entirely. Default: 0.2 */
  readonly abstainThreshold: number
  /** Below this (but above abstain), hedge the response. Default: 0.5 */
  readonly hedgeThreshold: number
  /** Above this, respond with full confidence. Default: 0.5 */
  readonly respondThreshold: number
  /** Maximum number of calibration records to keep. Default: 200 */
  readonly maxCalibrationRecords: number
  /** Enable calibration feedback loop. Default: true */
  readonly enableCalibration: boolean
}

/** Record of a past gate decision and its outcome. */
export interface CalibrationEntry {
  readonly predictedConfidence: number
  readonly actualSuccess: boolean
  readonly decision: GateDecision
  readonly timestamp: number
}

/** Calibration statistics. */
export interface CalibrationStats {
  readonly totalDecisions: number
  readonly abstainCount: number
  readonly hedgeCount: number
  readonly respondCount: number
  readonly calibrationError: number
  readonly abstainRate: number
  readonly accuracyWhenResponding: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_GATE_CONFIG: ConfidenceGateConfig = {
  abstainThreshold: 0.2,
  hedgeThreshold: 0.5,
  respondThreshold: 0.5,
  maxCalibrationRecords: 200,
  enableCalibration: true,
}

const HEDGE_PREFIXES = [
  "I'm not entirely certain, but ",
  'Based on my understanding, ',
  'I believe, though I may be wrong, that ',
  'From what I know, ',
  'This might not be completely accurate, but ',
]

const ABSTAIN_MESSAGES = [
  "I don't have enough information to answer this confidently. Could you provide more context?",
  "I'm not confident enough in my answer to give you a reliable response on this topic.",
  "This is outside my area of reliable knowledge. I'd rather not guess.",
  "I don't want to risk giving you incorrect information on this. Can you rephrase or narrow down the question?",
]

// ─── ConfidenceGate ────────────────────────────────────────────────────────────

export class ConfidenceGate {
  private readonly config: ConfidenceGateConfig
  private readonly calibrationRecords: CalibrationEntry[] = []
  private decisionCount = 0

  constructor(config: Partial<ConfidenceGateConfig> = {}) {
    this.config = { ...DEFAULT_GATE_CONFIG, ...config }
  }

  // ── Gate Evaluation ────────────────────────────────────────────────────────

  /**
   * Evaluate confidence signals and decide whether to respond, hedge, or abstain.
   */
  evaluate(signals: ConfidenceSignal[]): GateResult {
    this.decisionCount++

    // Weighted average of confidence signals
    const aggregateConfidence = this.aggregateSignals(signals)

    // Apply calibration adjustment if we have enough data
    const calibrated = this.config.enableCalibration
      ? this.applyCalibration(aggregateConfidence)
      : aggregateConfidence

    // Make decision
    const decision = this.makeDecision(calibrated)

    // Build explanation
    const explanation = this.buildExplanation(calibrated, signals, decision)

    // Generate hedge prefix or abstain message
    const hedgePrefix =
      decision === 'hedge' ? HEDGE_PREFIXES[this.decisionCount % HEDGE_PREFIXES.length]! : null

    const abstainMessage =
      decision === 'abstain'
        ? ABSTAIN_MESSAGES[this.decisionCount % ABSTAIN_MESSAGES.length]!
        : null

    return {
      decision,
      aggregateConfidence: calibrated,
      signals,
      explanation,
      hedgePrefix,
      abstainMessage,
    }
  }

  /**
   * Quick check: should we abstain for this confidence level?
   */
  shouldAbstain(confidence: number): boolean {
    return confidence < this.config.abstainThreshold
  }

  /**
   * Quick check: should we hedge for this confidence level?
   */
  shouldHedge(confidence: number): boolean {
    return confidence >= this.config.abstainThreshold && confidence < this.config.hedgeThreshold
  }

  // ── Calibration Feedback ───────────────────────────────────────────────────

  /**
   * Record the outcome of a gated decision for calibration.
   * @param predictedConfidence - The confidence score at decision time
   * @param actualSuccess - Whether the response was actually correct/useful
   * @param decision - The gate decision that was made
   */
  recordOutcome(predictedConfidence: number, actualSuccess: boolean, decision: GateDecision): void {
    if (!this.config.enableCalibration) return

    this.calibrationRecords.push({
      predictedConfidence,
      actualSuccess,
      decision,
      timestamp: Date.now(),
    })

    // Evict oldest if over capacity
    if (this.calibrationRecords.length > this.config.maxCalibrationRecords) {
      this.calibrationRecords.shift()
    }
  }

  /**
   * Get calibration statistics.
   */
  getCalibrationStats(): CalibrationStats {
    const total = this.calibrationRecords.length
    if (total === 0) {
      return {
        totalDecisions: 0,
        abstainCount: 0,
        hedgeCount: 0,
        respondCount: 0,
        calibrationError: 0,
        abstainRate: 0,
        accuracyWhenResponding: 0,
      }
    }

    let abstainCount = 0
    let hedgeCount = 0
    let respondCount = 0
    let respondSuccessCount = 0
    let calibrationErrorSum = 0

    for (const record of this.calibrationRecords) {
      switch (record.decision) {
        case 'abstain':
          abstainCount++
          break
        case 'hedge':
          hedgeCount++
          break
        case 'respond': {
          respondCount++
          if (record.actualSuccess) respondSuccessCount++
          break
        }
      }
      const actual = record.actualSuccess ? 1 : 0
      calibrationErrorSum += Math.abs(record.predictedConfidence - actual)
    }

    return {
      totalDecisions: total,
      abstainCount,
      hedgeCount,
      respondCount,
      calibrationError: calibrationErrorSum / total,
      abstainRate: abstainCount / total,
      accuracyWhenResponding: respondCount > 0 ? respondSuccessCount / respondCount : 0,
    }
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  private aggregateSignals(signals: ConfidenceSignal[]): number {
    if (signals.length === 0) return 0

    let weightedSum = 0
    let totalWeight = 0

    for (const signal of signals) {
      const clamped = Math.max(0, Math.min(1, signal.score))
      weightedSum += clamped * signal.weight
      totalWeight += signal.weight
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }

  private applyCalibration(raw: number): number {
    // Need minimum records for calibration to be meaningful
    if (this.calibrationRecords.length < 10) return raw

    // Compute bias: average(predicted - actual) over recent records
    const recent = this.calibrationRecords.slice(-50)
    let biasSum = 0
    for (const r of recent) {
      biasSum += r.predictedConfidence - (r.actualSuccess ? 1 : 0)
    }
    const bias = biasSum / recent.length

    // Correct for bias (if we overpredict, reduce confidence)
    const calibrated = Math.max(0, Math.min(1, raw - bias * 0.5))
    return calibrated
  }

  private makeDecision(confidence: number): GateDecision {
    if (confidence < this.config.abstainThreshold) return 'abstain'
    if (confidence < this.config.hedgeThreshold) return 'hedge'
    return 'respond'
  }

  private buildExplanation(
    confidence: number,
    signals: ConfidenceSignal[],
    decision: GateDecision,
  ): string {
    const parts: string[] = [`Aggregate confidence: ${(confidence * 100).toFixed(1)}%.`]

    if (signals.length > 0) {
      const top = [...signals].sort((a, b) => b.score * b.weight - a.score * a.weight)[0]
      if (top) {
        parts.push(`Strongest signal: ${top.source} (${(top.score * 100).toFixed(0)}%).`)
      }
      const weakest = [...signals].sort((a, b) => a.score * a.weight - b.score * b.weight)[0]
      if (weakest && weakest.source !== top?.source) {
        parts.push(`Weakest signal: ${weakest.source} (${(weakest.score * 100).toFixed(0)}%).`)
      }
    }

    switch (decision) {
      case 'respond':
        parts.push('Decision: RESPOND — confidence is adequate.')
        break
      case 'hedge':
        parts.push('Decision: HEDGE — confidence is moderate, will qualify the response.')
        break
      case 'abstain':
        parts.push('Decision: ABSTAIN — confidence too low for reliable response.')
        break
    }

    return parts.join(' ')
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  serialize(): { records: CalibrationEntry[]; decisionCount: number } {
    return {
      records: [...this.calibrationRecords],
      decisionCount: this.decisionCount,
    }
  }

  deserialize(data: { records: CalibrationEntry[]; decisionCount: number }): void {
    this.calibrationRecords.length = 0
    this.calibrationRecords.push(...data.records)
    this.decisionCount = data.decisionCount
  }

  // ── Accessors ──────────────────────────────────────────────────────────────

  get totalDecisions(): number {
    return this.decisionCount
  }

  getConfig(): ConfidenceGateConfig {
    return { ...this.config }
  }

  clear(): void {
    this.calibrationRecords.length = 0
    this.decisionCount = 0
  }
}
