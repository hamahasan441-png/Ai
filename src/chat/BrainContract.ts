/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  BrainContract — Clear input → think → tool → verify → output schema       ║
 * ║                                                                            ║
 * ║  Defines the formal pipeline contract for every brain interaction:          ║
 * ║    1. INPUT  — Parse & normalize user message                              ║
 * ║    2. THINK  — Classify intent, retrieve knowledge, reason                 ║
 * ║    3. TOOL   — Execute tools/modules if needed                             ║
 * ║    4. VERIFY — Gate output via confidence check                            ║
 * ║    5. OUTPUT — Format and return final response                            ║
 * ║                                                                            ║
 * ║  No external dependencies.                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Pipeline Step Enum ────────────────────────────────────────────────────────

/** The five canonical steps of every brain interaction. */
export enum BrainStep {
  INPUT  = 'INPUT',
  THINK  = 'THINK',
  TOOL   = 'TOOL',
  VERIFY = 'VERIFY',
  OUTPUT = 'OUTPUT',
}

/** All steps in execution order. */
export const BRAIN_STEP_ORDER: readonly BrainStep[] = [
  BrainStep.INPUT,
  BrainStep.THINK,
  BrainStep.TOOL,
  BrainStep.VERIFY,
  BrainStep.OUTPUT,
]

// ─── Step Data Types ───────────────────────────────────────────────────────────

/** Input step: parsed user message with metadata. */
export interface InputStepData {
  readonly rawMessage: string
  readonly normalizedMessage: string
  readonly keywords: readonly string[]
  readonly detectedLanguage: string
  readonly timestamp: number
}

/** Think step: reasoning results. */
export interface ThinkStepData {
  readonly intent: string
  readonly entities: readonly ExtractedEntity[]
  readonly knowledgeHits: number
  readonly memoryHits: number
  readonly reasoningChain: readonly string[]
  readonly confidence: number
}

/** Entity extracted during thinking. */
export interface ExtractedEntity {
  readonly value: string
  readonly type: string
  readonly confidence: number
}

/** Tool step: tool invocations and results. */
export interface ToolStepData {
  readonly toolsInvoked: readonly ToolInvocation[]
  readonly skippedReason: string | null
}

/** A single tool invocation. */
export interface ToolInvocation {
  readonly toolName: string
  readonly input: Record<string, unknown>
  readonly output: unknown
  readonly durationMs: number
  readonly success: boolean
}

/** Verify step: confidence gate result. */
export interface VerifyStepData {
  readonly decision: 'respond' | 'hedge' | 'abstain'
  readonly confidence: number
  readonly gateExplanation: string
  readonly adjustedResponse: string | null
}

/** Output step: final formatted response. */
export interface OutputStepData {
  readonly text: string
  readonly wasHedged: boolean
  readonly wasAbstained: boolean
  readonly tokenEstimate: { input: number; output: number }
}

// ─── Pipeline Trace ────────────────────────────────────────────────────────────

/** A single step in the pipeline trace. */
export interface PipelineTraceStep {
  readonly step: BrainStep
  readonly data: InputStepData | ThinkStepData | ToolStepData | VerifyStepData | OutputStepData
  readonly startedAt: number
  readonly endedAt: number
  readonly durationMs: number
}

/** Complete trace of a brain interaction. */
export interface PipelineTrace {
  readonly id: string
  readonly steps: readonly PipelineTraceStep[]
  readonly totalDurationMs: number
  readonly finalDecision: 'respond' | 'hedge' | 'abstain'
  readonly success: boolean
}

// ─── Contract Validator ────────────────────────────────────────────────────────

/** Validation result for a pipeline trace. */
export interface ContractValidation {
  readonly valid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
}

/**
 * Validates that a pipeline trace follows the brain contract.
 * Ensures all 5 steps are present in order, with valid data.
 */
export function validateTrace(trace: PipelineTrace): ContractValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Check all 5 steps present
  if (trace.steps.length !== BRAIN_STEP_ORDER.length) {
    errors.push(
      `Expected ${BRAIN_STEP_ORDER.length} steps, got ${trace.steps.length}`,
    )
  }

  // Check step ordering
  for (let i = 0; i < Math.min(trace.steps.length, BRAIN_STEP_ORDER.length); i++) {
    const expected = BRAIN_STEP_ORDER[i]!
    const actual = trace.steps[i]
    if (actual && actual.step !== expected) {
      errors.push(`Step ${i}: expected ${expected}, got ${actual.step}`)
    }
  }

  // Validate each step has required fields
  for (const step of trace.steps) {
    switch (step.step) {
      case BrainStep.INPUT: {
        const data = step.data as InputStepData
        if (!data.rawMessage) errors.push('INPUT: missing rawMessage')
        if (!data.normalizedMessage) errors.push('INPUT: missing normalizedMessage')
        break
      }
      case BrainStep.THINK: {
        const data = step.data as ThinkStepData
        if (!data.intent) errors.push('THINK: missing intent')
        if (data.confidence < 0 || data.confidence > 1) {
          errors.push(`THINK: confidence ${data.confidence} out of [0, 1] range`)
        }
        break
      }
      case BrainStep.VERIFY: {
        const data = step.data as VerifyStepData
        if (!['respond', 'hedge', 'abstain'].includes(data.decision)) {
          errors.push(`VERIFY: invalid decision '${data.decision}'`)
        }
        break
      }
      case BrainStep.OUTPUT: {
        const data = step.data as OutputStepData
        if (typeof data.text !== 'string') {
          errors.push('OUTPUT: text must be a string')
        }
        break
      }
    }

    // Timing checks
    if (step.durationMs < 0) {
      warnings.push(`${step.step}: negative duration (${step.durationMs}ms)`)
    }
  }

  // Check trace-level consistency
  if (trace.totalDurationMs < 0) {
    warnings.push(`Trace total duration is negative: ${trace.totalDurationMs}ms`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// ─── Trace Builder ─────────────────────────────────────────────────────────────

/**
 * Builder for constructing pipeline traces step by step.
 * Enforces the contract ordering during construction.
 */
export class TraceBuilder {
  private readonly id: string
  private readonly steps: PipelineTraceStep[] = []
  private readonly startTime: number
  private currentStepIndex = 0
  private finalDecision: 'respond' | 'hedge' | 'abstain' = 'respond'

  constructor(id?: string) {
    this.id = id ?? `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    this.startTime = Date.now()
  }

  /**
   * Record a step. Must be called in order: INPUT → THINK → TOOL → VERIFY → OUTPUT.
   */
  recordStep(
    step: BrainStep,
    data: PipelineTraceStep['data'],
    startedAt: number,
    endedAt: number,
  ): this {
    const expected = BRAIN_STEP_ORDER[this.currentStepIndex]
    if (expected && step !== expected) {
      throw new Error(
        `Contract violation: expected step '${expected}' but got '${step}'. ` +
        `Steps must follow order: ${BRAIN_STEP_ORDER.join(' → ')}`,
      )
    }

    if (step === BrainStep.VERIFY) {
      this.finalDecision = (data as VerifyStepData).decision
    }

    this.steps.push({
      step,
      data,
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
    })

    this.currentStepIndex++
    return this
  }

  /**
   * Finalize and return the complete trace.
   */
  build(): PipelineTrace {
    const now = Date.now()
    return {
      id: this.id,
      steps: [...this.steps],
      totalDurationMs: now - this.startTime,
      finalDecision: this.finalDecision,
      success: this.finalDecision !== 'abstain',
    }
  }

  /**
   * Check if all steps have been recorded.
   */
  isComplete(): boolean {
    return this.currentStepIndex >= BRAIN_STEP_ORDER.length
  }

  /**
   * Get the next expected step.
   */
  getNextExpectedStep(): BrainStep | null {
    return BRAIN_STEP_ORDER[this.currentStepIndex] ?? null
  }

  getId(): string {
    return this.id
  }
}
