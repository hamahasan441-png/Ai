import { describe, it, expect, beforeEach } from 'vitest'
import {
  ErrorAggregator,
  createEngineError,
  classifyError,
  calculateRetryDelay,
  shouldRetry,
  EngineErrorClass,
  RETRYABLE_ERRORS,
  ERROR_PRIORITY,
  DEFAULT_RETRY_CONFIG,
  type EngineError,
  type RetryConfig,
} from '../ErrorTaxonomy'
import { PipelinePhase } from '../PipelineContract'

// ── Helper ──

function makeError(
  errorClass: EngineErrorClass = EngineErrorClass.NETWORK_FAIL,
  source = 'TestSource',
  phase: PipelinePhase = PipelinePhase.PHASE_1_CORE,
): EngineError {
  return createEngineError(errorClass, 'test message', source, phase)
}

// ── createEngineError Tests ──

describe('createEngineError', () => {
  it('returns an object with the correct errorClass', () => {
    const err = createEngineError(
      EngineErrorClass.MODEL_FAIL,
      'bad model',
      'src',
      PipelinePhase.PHASE_1_CORE,
    )
    expect(err.errorClass).toBe(EngineErrorClass.MODEL_FAIL)
  })

  it('generates an id prefixed with err-<class>', () => {
    const err = makeError(EngineErrorClass.TIMEOUT)
    expect(err.id).toMatch(/^err-TIMEOUT-/)
  })

  it('marks retryable errors correctly', () => {
    const retryable = createEngineError(
      EngineErrorClass.NETWORK_FAIL,
      'm',
      's',
      PipelinePhase.PHASE_1_CORE,
    )
    expect(retryable.retryable).toBe(true)

    const nonRetryable = createEngineError(
      EngineErrorClass.CRITICAL,
      'm',
      's',
      PipelinePhase.PHASE_1_CORE,
    )
    expect(nonRetryable.retryable).toBe(false)
  })

  it('assigns priority from ERROR_PRIORITY map', () => {
    const err = createEngineError(EngineErrorClass.CRITICAL, 'm', 's', PipelinePhase.PHASE_1_CORE)
    expect(err.priority).toBe(ERROR_PRIORITY[EngineErrorClass.CRITICAL])
  })

  it('captures the stack from an original error when provided', () => {
    const orig = new Error('original')
    const err = createEngineError(
      EngineErrorClass.UNKNOWN,
      'm',
      's',
      PipelinePhase.PHASE_1_CORE,
      {},
      orig,
    )
    expect(err.stack).toBe(orig.stack)
  })

  it('sets stack to null when no original error is given', () => {
    const err = makeError()
    expect(err.stack).toBeNull()
  })

  it('stores custom metadata', () => {
    const err = createEngineError(
      EngineErrorClass.TOOL_FAIL,
      'm',
      's',
      PipelinePhase.PHASE_2_SEMANTIC,
      { tool: 'grep' },
    )
    expect(err.metadata).toEqual({ tool: 'grep' })
  })
})

// ── classifyError Tests ──

describe('classifyError', () => {
  it('classifies TypeError as INPUT_FAIL', () => {
    expect(classifyError(new TypeError('bad type'))).toBe(EngineErrorClass.INPUT_FAIL)
  })

  it('classifies RangeError as INPUT_FAIL', () => {
    expect(classifyError(new RangeError('out of range'))).toBe(EngineErrorClass.INPUT_FAIL)
  })

  it('classifies error with "timeout" as TIMEOUT', () => {
    expect(classifyError(new Error('request timeout'))).toBe(EngineErrorClass.TIMEOUT)
  })

  it('classifies error with "timed out" as TIMEOUT', () => {
    expect(classifyError(new Error('connection timed out'))).toBe(EngineErrorClass.TIMEOUT)
  })

  it('classifies error with "network" as NETWORK_FAIL', () => {
    expect(classifyError(new Error('network error'))).toBe(EngineErrorClass.NETWORK_FAIL)
  })

  it('classifies error with "ECONNREFUSED" as NETWORK_FAIL', () => {
    expect(classifyError(new Error('connect ECONNREFUSED'))).toBe(EngineErrorClass.NETWORK_FAIL)
  })

  it('classifies error with "model" as MODEL_FAIL', () => {
    expect(classifyError(new Error('model unavailable'))).toBe(EngineErrorClass.MODEL_FAIL)
  })

  it('classifies error with "config" as CONFIG_FAIL', () => {
    expect(classifyError(new Error('bad config value'))).toBe(EngineErrorClass.CONFIG_FAIL)
  })

  it('classifies error with "dependency" as DEPENDENCY_FAIL', () => {
    expect(classifyError(new Error('missing dependency'))).toBe(EngineErrorClass.DEPENDENCY_FAIL)
  })

  it('classifies error with "validation" as VERIFICATION_FAIL', () => {
    expect(classifyError(new Error('validation failed'))).toBe(EngineErrorClass.VERIFICATION_FAIL)
  })

  it('classifies non-Error values as UNKNOWN', () => {
    expect(classifyError('string error')).toBe(EngineErrorClass.UNKNOWN)
    expect(classifyError(42)).toBe(EngineErrorClass.UNKNOWN)
    expect(classifyError(null)).toBe(EngineErrorClass.UNKNOWN)
  })

  it('classifies generic Error with no keywords as UNKNOWN', () => {
    expect(classifyError(new Error('something went wrong'))).toBe(EngineErrorClass.UNKNOWN)
  })
})

// ── RETRYABLE_ERRORS and ERROR_PRIORITY constants ──

describe('RETRYABLE_ERRORS', () => {
  it('contains NETWORK_FAIL, TOOL_FAIL, TIMEOUT', () => {
    expect(RETRYABLE_ERRORS.has(EngineErrorClass.NETWORK_FAIL)).toBe(true)
    expect(RETRYABLE_ERRORS.has(EngineErrorClass.TOOL_FAIL)).toBe(true)
    expect(RETRYABLE_ERRORS.has(EngineErrorClass.TIMEOUT)).toBe(true)
  })

  it('does not contain non-retryable classes', () => {
    expect(RETRYABLE_ERRORS.has(EngineErrorClass.CRITICAL)).toBe(false)
    expect(RETRYABLE_ERRORS.has(EngineErrorClass.CONFIG_FAIL)).toBe(false)
  })
})

describe('ERROR_PRIORITY', () => {
  it('assigns CRITICAL the highest priority (0)', () => {
    expect(ERROR_PRIORITY[EngineErrorClass.CRITICAL]).toBe(0)
  })

  it('assigns UNKNOWN the lowest priority (9)', () => {
    expect(ERROR_PRIORITY[EngineErrorClass.UNKNOWN]).toBe(9)
  })
})

// ── calculateRetryDelay Tests ──

describe('calculateRetryDelay', () => {
  const noJitter: RetryConfig = { ...DEFAULT_RETRY_CONFIG, jitterFactor: 0 }

  it('returns base delay for attempt 0 with no jitter', () => {
    expect(calculateRetryDelay(0, noJitter)).toBe(noJitter.baseDelayMs)
  })

  it('applies exponential backoff', () => {
    const delay1 = calculateRetryDelay(1, noJitter)
    const delay2 = calculateRetryDelay(2, noJitter)
    expect(delay1).toBe(noJitter.baseDelayMs * noJitter.backoffFactor)
    expect(delay2).toBe(noJitter.baseDelayMs * Math.pow(noJitter.backoffFactor, 2))
  })

  it('caps delay at maxDelayMs', () => {
    const delay = calculateRetryDelay(100, noJitter)
    expect(delay).toBeLessThanOrEqual(noJitter.maxDelayMs)
  })

  it('never returns a negative value', () => {
    for (let i = 0; i < 20; i++) {
      expect(calculateRetryDelay(i)).toBeGreaterThanOrEqual(0)
    }
  })

  it('uses DEFAULT_RETRY_CONFIG when no config is provided', () => {
    const delay = calculateRetryDelay(0)
    const maxPossible = DEFAULT_RETRY_CONFIG.baseDelayMs * (1 + DEFAULT_RETRY_CONFIG.jitterFactor)
    expect(delay).toBeLessThanOrEqual(Math.round(maxPossible))
  })
})

// ── shouldRetry Tests ──

describe('shouldRetry', () => {
  it('returns true for retryable error below max retries', () => {
    const err = makeError(EngineErrorClass.NETWORK_FAIL)
    expect(shouldRetry(err, 0)).toBe(true)
  })

  it('returns false when currentAttempt reaches maxRetries', () => {
    const err = makeError(EngineErrorClass.NETWORK_FAIL)
    expect(shouldRetry(err, DEFAULT_RETRY_CONFIG.maxRetries)).toBe(false)
  })

  it('returns false for non-retryable errors even on first attempt', () => {
    const err = makeError(EngineErrorClass.CRITICAL)
    expect(shouldRetry(err, 0)).toBe(false)
  })

  it('respects a custom maxRetries config', () => {
    const err = makeError(EngineErrorClass.TIMEOUT)
    const custom: RetryConfig = { ...DEFAULT_RETRY_CONFIG, maxRetries: 1 }
    expect(shouldRetry(err, 0, custom)).toBe(true)
    expect(shouldRetry(err, 1, custom)).toBe(false)
  })
})

// ── ErrorAggregator Tests ──

describe('ErrorAggregator', () => {
  let agg: ErrorAggregator

  beforeEach(() => {
    agg = new ErrorAggregator()
  })

  it('starts with zero errors', () => {
    expect(agg.count).toBe(0)
    expect(agg.getAll()).toHaveLength(0)
  })

  it('adds and retrieves errors', () => {
    agg.add(makeError())
    expect(agg.count).toBe(1)
  })

  it('getAll returns errors sorted by priority (lowest number first)', () => {
    agg.add(makeError(EngineErrorClass.UNKNOWN)) // priority 9
    agg.add(makeError(EngineErrorClass.CRITICAL)) // priority 0
    agg.add(makeError(EngineErrorClass.NETWORK_FAIL)) // priority 5
    const all = agg.getAll()
    expect(all[0].errorClass).toBe(EngineErrorClass.CRITICAL)
    expect(all[1].errorClass).toBe(EngineErrorClass.NETWORK_FAIL)
    expect(all[2].errorClass).toBe(EngineErrorClass.UNKNOWN)
  })

  it('getByClass filters by error class', () => {
    agg.add(makeError(EngineErrorClass.TOOL_FAIL))
    agg.add(makeError(EngineErrorClass.NETWORK_FAIL))
    agg.add(makeError(EngineErrorClass.TOOL_FAIL))
    expect(agg.getByClass(EngineErrorClass.TOOL_FAIL)).toHaveLength(2)
    expect(agg.getByClass(EngineErrorClass.CRITICAL)).toHaveLength(0)
  })

  it('getBySource filters by source string', () => {
    agg.add(makeError(EngineErrorClass.NETWORK_FAIL, 'EngineA'))
    agg.add(makeError(EngineErrorClass.NETWORK_FAIL, 'EngineB'))
    expect(agg.getBySource('EngineA')).toHaveLength(1)
  })

  it('getByPhase filters by pipeline phase', () => {
    agg.add(makeError(EngineErrorClass.TOOL_FAIL, 's', PipelinePhase.PHASE_1_CORE))
    agg.add(makeError(EngineErrorClass.TOOL_FAIL, 's', PipelinePhase.PHASE_3_COGNITIVE))
    expect(agg.getByPhase(PipelinePhase.PHASE_1_CORE)).toHaveLength(1)
  })

  it('hasCritical returns false when no critical errors exist', () => {
    agg.add(makeError(EngineErrorClass.NETWORK_FAIL))
    expect(agg.hasCritical()).toBe(false)
  })

  it('hasCritical returns true when a critical error exists', () => {
    agg.add(makeError(EngineErrorClass.CRITICAL))
    expect(agg.hasCritical()).toBe(true)
  })

  it('getSummary returns counts for every error class', () => {
    agg.add(makeError(EngineErrorClass.TIMEOUT))
    agg.add(makeError(EngineErrorClass.TIMEOUT))
    agg.add(makeError(EngineErrorClass.MODEL_FAIL))
    const summary = agg.getSummary()
    expect(summary[EngineErrorClass.TIMEOUT]).toBe(2)
    expect(summary[EngineErrorClass.MODEL_FAIL]).toBe(1)
    expect(summary[EngineErrorClass.CRITICAL]).toBe(0)
  })

  it('clear removes all errors', () => {
    agg.add(makeError())
    agg.add(makeError())
    agg.clear()
    expect(agg.count).toBe(0)
    expect(agg.getAll()).toHaveLength(0)
  })
})
