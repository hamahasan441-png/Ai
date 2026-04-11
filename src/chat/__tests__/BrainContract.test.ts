/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  BrainContract — Tests                                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect } from 'vitest'
import { BrainStep, BRAIN_STEP_ORDER, TraceBuilder, validateTrace } from '../BrainContract.js'
import type {
  InputStepData,
  ThinkStepData,
  ToolStepData,
  VerifyStepData,
  OutputStepData,
  PipelineTrace,
} from '../BrainContract.js'

describe('BrainContract', () => {
  // ── Enum & Constants ──

  describe('BrainStep', () => {
    it('has exactly 5 steps', () => {
      const steps = Object.values(BrainStep)
      expect(steps).toHaveLength(5)
    })

    it('BRAIN_STEP_ORDER is in correct order', () => {
      expect(BRAIN_STEP_ORDER).toEqual([
        BrainStep.INPUT,
        BrainStep.THINK,
        BrainStep.TOOL,
        BrainStep.VERIFY,
        BrainStep.OUTPUT,
      ])
    })
  })

  // ── TraceBuilder ──

  describe('TraceBuilder', () => {
    it('creates a trace with all 5 steps', () => {
      const now = Date.now()
      const builder = new TraceBuilder('test-trace')

      builder.recordStep(
        BrainStep.INPUT,
        {
          rawMessage: 'Hello',
          normalizedMessage: 'hello',
          keywords: ['hello'],
          detectedLanguage: 'en',
          timestamp: now,
        } satisfies InputStepData,
        now,
        now + 1,
      )

      builder.recordStep(
        BrainStep.THINK,
        {
          intent: 'greeting',
          entities: [],
          knowledgeHits: 0,
          memoryHits: 0,
          reasoningChain: ['classify intent'],
          confidence: 0.8,
        } satisfies ThinkStepData,
        now + 1,
        now + 5,
      )

      builder.recordStep(
        BrainStep.TOOL,
        {
          toolsInvoked: [],
          skippedReason: 'No tools needed',
        } satisfies ToolStepData,
        now + 5,
        now + 5,
      )

      builder.recordStep(
        BrainStep.VERIFY,
        {
          decision: 'respond',
          confidence: 0.8,
          gateExplanation: 'Confidence adequate',
          adjustedResponse: null,
        } satisfies VerifyStepData,
        now + 5,
        now + 6,
      )

      builder.recordStep(
        BrainStep.OUTPUT,
        {
          text: 'Hello! How can I help?',
          wasHedged: false,
          wasAbstained: false,
          tokenEstimate: { input: 2, output: 6 },
        } satisfies OutputStepData,
        now + 6,
        now + 7,
      )

      expect(builder.isComplete()).toBe(true)

      const trace = builder.build()
      expect(trace.id).toBe('test-trace')
      expect(trace.steps).toHaveLength(5)
      expect(trace.finalDecision).toBe('respond')
      expect(trace.success).toBe(true)
    })

    it('enforces step order', () => {
      const builder = new TraceBuilder()
      const now = Date.now()

      // Trying to record THINK before INPUT should throw
      expect(() => {
        builder.recordStep(
          BrainStep.THINK,
          {
            intent: 'test',
            entities: [],
            knowledgeHits: 0,
            memoryHits: 0,
            reasoningChain: [],
            confidence: 0,
          } satisfies ThinkStepData,
          now,
          now + 1,
        )
      }).toThrow('Contract violation')
    })

    it('generates unique ids', () => {
      const b1 = new TraceBuilder()
      const b2 = new TraceBuilder()
      expect(b1.getId()).not.toBe(b2.getId())
    })

    it('getNextExpectedStep returns correct step', () => {
      const builder = new TraceBuilder()
      expect(builder.getNextExpectedStep()).toBe(BrainStep.INPUT)
    })

    it('getNextExpectedStep returns null when complete', () => {
      const builder = buildCompleteTrace()
      expect(builder.getNextExpectedStep()).toBeNull()
    })

    it('sets finalDecision to abstain when verify decides abstain', () => {
      const builder = new TraceBuilder()
      const now = Date.now()

      recordInputStep(builder, now)
      recordThinkStep(builder, now + 1)
      recordToolStep(builder, now + 5)

      builder.recordStep(
        BrainStep.VERIFY,
        {
          decision: 'abstain',
          confidence: 0.1,
          gateExplanation: 'Too uncertain',
          adjustedResponse: null,
        } satisfies VerifyStepData,
        now + 5,
        now + 6,
      )

      builder.recordStep(
        BrainStep.OUTPUT,
        {
          text: "I don't know.",
          wasHedged: false,
          wasAbstained: true,
          tokenEstimate: { input: 2, output: 4 },
        } satisfies OutputStepData,
        now + 6,
        now + 7,
      )

      const trace = builder.build()
      expect(trace.finalDecision).toBe('abstain')
      expect(trace.success).toBe(false)
    })
  })

  // ── validateTrace ──

  describe('validateTrace', () => {
    it('validates a correct trace', () => {
      const trace = buildCompleteTrace().build()
      const result = validateTrace(trace)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('detects missing steps', () => {
      const trace: PipelineTrace = {
        id: 'incomplete',
        steps: [],
        totalDurationMs: 0,
        finalDecision: 'respond',
        success: true,
      }
      const result = validateTrace(trace)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('detects wrong step ordering', () => {
      const now = Date.now()
      const trace: PipelineTrace = {
        id: 'wrong-order',
        steps: [
          {
            step: BrainStep.THINK, // Should be INPUT first
            data: {
              intent: 'test',
              entities: [],
              knowledgeHits: 0,
              memoryHits: 0,
              reasoningChain: [],
              confidence: 0.5,
            } satisfies ThinkStepData,
            startedAt: now,
            endedAt: now + 1,
            durationMs: 1,
          },
        ],
        totalDurationMs: 1,
        finalDecision: 'respond',
        success: true,
      }
      const result = validateTrace(trace)
      expect(result.valid).toBe(false)
    })

    it('detects confidence out of range', () => {
      const builder = new TraceBuilder()
      const now = Date.now()

      recordInputStep(builder, now)

      builder.recordStep(
        BrainStep.THINK,
        {
          intent: 'test',
          entities: [],
          knowledgeHits: 0,
          memoryHits: 0,
          reasoningChain: [],
          confidence: -0.5, // Invalid
        } satisfies ThinkStepData,
        now + 1,
        now + 2,
      )

      recordToolStep(builder, now + 2)
      recordVerifyStep(builder, now + 3)
      recordOutputStep(builder, now + 4)

      const trace = builder.build()
      const result = validateTrace(trace)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('confidence'))).toBe(true)
    })

    it('detects missing rawMessage in INPUT', () => {
      const now = Date.now()
      const trace: PipelineTrace = {
        id: 'missing-raw',
        steps: [
          {
            step: BrainStep.INPUT,
            data: {
              rawMessage: '',
              normalizedMessage: '',
              keywords: [],
              detectedLanguage: 'en',
              timestamp: now,
            } satisfies InputStepData,
            startedAt: now,
            endedAt: now + 1,
            durationMs: 1,
          },
          ...buildRemainingSteps(now + 1),
        ],
        totalDurationMs: 5,
        finalDecision: 'respond',
        success: true,
      }
      const result = validateTrace(trace)
      expect(result.valid).toBe(false)
    })
  })
})

// ── Test Helpers ──

function buildCompleteTrace(): TraceBuilder {
  const builder = new TraceBuilder()
  const now = Date.now()

  recordInputStep(builder, now)
  recordThinkStep(builder, now + 1)
  recordToolStep(builder, now + 5)
  recordVerifyStep(builder, now + 5)
  recordOutputStep(builder, now + 6)

  return builder
}

function recordInputStep(builder: TraceBuilder, time: number): void {
  builder.recordStep(
    BrainStep.INPUT,
    {
      rawMessage: 'Test input',
      normalizedMessage: 'test input',
      keywords: ['test', 'input'],
      detectedLanguage: 'en',
      timestamp: time,
    } satisfies InputStepData,
    time,
    time + 1,
  )
}

function recordThinkStep(builder: TraceBuilder, time: number): void {
  builder.recordStep(
    BrainStep.THINK,
    {
      intent: 'question',
      entities: [],
      knowledgeHits: 1,
      memoryHits: 0,
      reasoningChain: ['classify'],
      confidence: 0.7,
    } satisfies ThinkStepData,
    time,
    time + 4,
  )
}

function recordToolStep(builder: TraceBuilder, time: number): void {
  builder.recordStep(
    BrainStep.TOOL,
    {
      toolsInvoked: [],
      skippedReason: 'No tools needed',
    } satisfies ToolStepData,
    time,
    time,
  )
}

function recordVerifyStep(builder: TraceBuilder, time: number): void {
  builder.recordStep(
    BrainStep.VERIFY,
    {
      decision: 'respond',
      confidence: 0.7,
      gateExplanation: 'OK',
      adjustedResponse: null,
    } satisfies VerifyStepData,
    time,
    time + 1,
  )
}

function recordOutputStep(builder: TraceBuilder, time: number): void {
  builder.recordStep(
    BrainStep.OUTPUT,
    {
      text: 'Test response',
      wasHedged: false,
      wasAbstained: false,
      tokenEstimate: { input: 2, output: 3 },
    } satisfies OutputStepData,
    time,
    time + 1,
  )
}

function buildRemainingSteps(startTime: number) {
  const steps = []
  let t = startTime

  steps.push({
    step: BrainStep.THINK,
    data: {
      intent: 'test',
      entities: [],
      knowledgeHits: 0,
      memoryHits: 0,
      reasoningChain: [],
      confidence: 0.5,
    } satisfies ThinkStepData,
    startedAt: t,
    endedAt: t + 1,
    durationMs: 1,
  })
  t++

  steps.push({
    step: BrainStep.TOOL,
    data: {
      toolsInvoked: [],
      skippedReason: null,
    } satisfies ToolStepData,
    startedAt: t,
    endedAt: t,
    durationMs: 0,
  })

  steps.push({
    step: BrainStep.VERIFY,
    data: {
      decision: 'respond' as const,
      confidence: 0.5,
      gateExplanation: 'OK',
      adjustedResponse: null,
    } satisfies VerifyStepData,
    startedAt: t,
    endedAt: t + 1,
    durationMs: 1,
  })
  t++

  steps.push({
    step: BrainStep.OUTPUT,
    data: {
      text: 'Response',
      wasHedged: false,
      wasAbstained: false,
      tokenEstimate: { input: 1, output: 1 },
    } satisfies OutputStepData,
    startedAt: t,
    endedAt: t + 1,
    durationMs: 1,
  })

  return steps
}
