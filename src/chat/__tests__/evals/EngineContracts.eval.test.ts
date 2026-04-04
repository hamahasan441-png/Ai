/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  Error Taxonomy + Replay Engine + Prompt Registry — Evaluation Benchmarks    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'

import {
  EngineErrorClass,
  RETRYABLE_ERRORS,
  ERROR_PRIORITY,
  createEngineError,
  classifyError,
  calculateRetryDelay,
  shouldRetry,
  DEFAULT_RETRY_CONFIG,
  ErrorAggregator,
} from '../../pipeline/ErrorTaxonomy.js'

import {
  SeededRandom,
  ReplayEngine,
} from '../../pipeline/ReplayEngine.js'

import { PromptRegistry } from '../../pipeline/PromptRegistry.js'

import { PipelinePhase } from '../../pipeline/PipelineContract.js'

import type { ReplayDecision } from '../../pipeline/ReplayEngine.js'
import type { PromptTemplate, ModelConfig } from '../../pipeline/PromptRegistry.js'

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR TAXONOMY
// ═══════════════════════════════════════════════════════════════════════════════

describe('ErrorTaxonomy', () => {
  // ── Enum completeness ──

  describe('EngineErrorClass enum', () => {
    it('has exactly 10 error classes', () => {
      const classes = Object.values(EngineErrorClass)
      expect(classes).toHaveLength(10)
    })

    it('every class has a priority', () => {
      for (const cls of Object.values(EngineErrorClass)) {
        expect(ERROR_PRIORITY[cls]).toBeDefined()
        expect(typeof ERROR_PRIORITY[cls]).toBe('number')
      }
    })

    it('CRITICAL has the highest priority (0)', () => {
      expect(ERROR_PRIORITY[EngineErrorClass.CRITICAL]).toBe(0)
    })

    it('UNKNOWN has the lowest priority (9)', () => {
      expect(ERROR_PRIORITY[EngineErrorClass.UNKNOWN]).toBe(9)
    })
  })

  // ── Retryable classification ──

  describe('RETRYABLE_ERRORS', () => {
    it('NETWORK_FAIL is retryable', () => {
      expect(RETRYABLE_ERRORS.has(EngineErrorClass.NETWORK_FAIL)).toBe(true)
    })

    it('TOOL_FAIL is retryable', () => {
      expect(RETRYABLE_ERRORS.has(EngineErrorClass.TOOL_FAIL)).toBe(true)
    })

    it('TIMEOUT is retryable', () => {
      expect(RETRYABLE_ERRORS.has(EngineErrorClass.TIMEOUT)).toBe(true)
    })

    it('CRITICAL is NOT retryable', () => {
      expect(RETRYABLE_ERRORS.has(EngineErrorClass.CRITICAL)).toBe(false)
    })

    it('MODEL_FAIL is NOT retryable', () => {
      expect(RETRYABLE_ERRORS.has(EngineErrorClass.MODEL_FAIL)).toBe(false)
    })

    it('CONFIG_FAIL is NOT retryable', () => {
      expect(RETRYABLE_ERRORS.has(EngineErrorClass.CONFIG_FAIL)).toBe(false)
    })
  })

  // ── createEngineError ──

  describe('createEngineError', () => {
    it('creates a valid error with all fields', () => {
      const err = createEngineError(
        EngineErrorClass.NETWORK_FAIL,
        'Connection refused',
        'HttpClient',
        PipelinePhase.PHASE_1_CORE,
      )
      expect(err.id).toMatch(/^err-NETWORK_FAIL-/)
      expect(err.errorClass).toBe(EngineErrorClass.NETWORK_FAIL)
      expect(err.message).toBe('Connection refused')
      expect(err.source).toBe('HttpClient')
      expect(err.phase).toBe(PipelinePhase.PHASE_1_CORE)
      expect(err.retryable).toBe(true)
      expect(err.priority).toBe(5)
      expect(err.timestamp).toBeGreaterThan(0)
      expect(err.stack).toBeNull()
      expect(err.metadata).toEqual({})
    })

    it('preserves original error stack', () => {
      const original = new Error('boom')
      const err = createEngineError(
        EngineErrorClass.CRITICAL,
        'System down',
        'Core',
        PipelinePhase.PHASE_1_CORE,
        { detail: 'crash' },
        original,
      )
      expect(err.stack).toBeTruthy()
      expect(err.metadata).toEqual({ detail: 'crash' })
      expect(err.retryable).toBe(false)
    })

    it('generates unique IDs', () => {
      const a = createEngineError(EngineErrorClass.UNKNOWN, 'a', 's', PipelinePhase.PHASE_1_CORE)
      const b = createEngineError(EngineErrorClass.UNKNOWN, 'b', 's', PipelinePhase.PHASE_1_CORE)
      expect(a.id).not.toBe(b.id)
    })
  })

  // ── classifyError ──

  describe('classifyError', () => {
    it('classifies TypeError as INPUT_FAIL', () => {
      expect(classifyError(new TypeError('oops'))).toBe(EngineErrorClass.INPUT_FAIL)
    })

    it('classifies RangeError as INPUT_FAIL', () => {
      expect(classifyError(new RangeError('out of bounds'))).toBe(EngineErrorClass.INPUT_FAIL)
    })

    it('classifies timeout messages', () => {
      expect(classifyError(new Error('request timed out'))).toBe(EngineErrorClass.TIMEOUT)
      expect(classifyError(new Error('Connection timeout'))).toBe(EngineErrorClass.TIMEOUT)
    })

    it('classifies network messages', () => {
      expect(classifyError(new Error('ECONNREFUSED'))).toBe(EngineErrorClass.NETWORK_FAIL)
      expect(classifyError(new Error('network error'))).toBe(EngineErrorClass.NETWORK_FAIL)
      expect(classifyError(new Error('ENOTFOUND host'))).toBe(EngineErrorClass.NETWORK_FAIL)
      expect(classifyError(new Error('fetch failed'))).toBe(EngineErrorClass.NETWORK_FAIL)
    })

    it('classifies model messages', () => {
      expect(classifyError(new Error('model not loaded'))).toBe(EngineErrorClass.MODEL_FAIL)
      expect(classifyError(new Error('inference error'))).toBe(EngineErrorClass.MODEL_FAIL)
      expect(classifyError(new Error('token limit exceeded'))).toBe(EngineErrorClass.MODEL_FAIL)
    })

    it('classifies config messages', () => {
      expect(classifyError(new Error('bad configuration'))).toBe(EngineErrorClass.CONFIG_FAIL)
    })

    it('classifies dependency messages', () => {
      expect(classifyError(new Error('dependency not initialized'))).toBe(EngineErrorClass.DEPENDENCY_FAIL)
    })

    it('classifies verification messages', () => {
      expect(classifyError(new Error('verification failed'))).toBe(EngineErrorClass.VERIFICATION_FAIL)
      expect(classifyError(new Error('invalid input'))).toBe(EngineErrorClass.VERIFICATION_FAIL)
    })

    it('returns UNKNOWN for unrecognized errors', () => {
      expect(classifyError(new Error('something weird happened'))).toBe(EngineErrorClass.UNKNOWN)
      expect(classifyError('string error')).toBe(EngineErrorClass.UNKNOWN)
      expect(classifyError(42)).toBe(EngineErrorClass.UNKNOWN)
      expect(classifyError(null)).toBe(EngineErrorClass.UNKNOWN)
    })
  })

  // ── Retry logic ──

  describe('retry strategy', () => {
    it('calculateRetryDelay uses exponential backoff', () => {
      const d0 = calculateRetryDelay(0, { ...DEFAULT_RETRY_CONFIG, jitterFactor: 0 })
      const d1 = calculateRetryDelay(1, { ...DEFAULT_RETRY_CONFIG, jitterFactor: 0 })
      const d2 = calculateRetryDelay(2, { ...DEFAULT_RETRY_CONFIG, jitterFactor: 0 })
      expect(d0).toBe(100)
      expect(d1).toBe(200)
      expect(d2).toBe(400)
    })

    it('calculateRetryDelay caps at maxDelayMs', () => {
      const d = calculateRetryDelay(100, { ...DEFAULT_RETRY_CONFIG, jitterFactor: 0 })
      expect(d).toBe(DEFAULT_RETRY_CONFIG.maxDelayMs)
    })

    it('calculateRetryDelay is never negative', () => {
      for (let i = 0; i < 20; i++) {
        expect(calculateRetryDelay(i)).toBeGreaterThanOrEqual(0)
      }
    })

    it('shouldRetry returns true for retryable under limit', () => {
      const err = createEngineError(
        EngineErrorClass.NETWORK_FAIL, 'fail', 's', PipelinePhase.PHASE_1_CORE,
      )
      expect(shouldRetry(err, 0)).toBe(true)
      expect(shouldRetry(err, 2)).toBe(true)
    })

    it('shouldRetry returns false when limit reached', () => {
      const err = createEngineError(
        EngineErrorClass.NETWORK_FAIL, 'fail', 's', PipelinePhase.PHASE_1_CORE,
      )
      expect(shouldRetry(err, 3)).toBe(false)
    })

    it('shouldRetry returns false for non-retryable', () => {
      const err = createEngineError(
        EngineErrorClass.CRITICAL, 'crash', 's', PipelinePhase.PHASE_1_CORE,
      )
      expect(shouldRetry(err, 0)).toBe(false)
    })
  })

  // ── ErrorAggregator ──

  describe('ErrorAggregator', () => {
    let agg: ErrorAggregator

    beforeEach(() => {
      agg = new ErrorAggregator()
    })

    it('starts empty', () => {
      expect(agg.count).toBe(0)
      expect(agg.hasCritical()).toBe(false)
    })

    it('adds and retrieves errors', () => {
      const e1 = createEngineError(EngineErrorClass.NETWORK_FAIL, 'n', 'a', PipelinePhase.PHASE_1_CORE)
      const e2 = createEngineError(EngineErrorClass.CRITICAL, 'c', 'b', PipelinePhase.PHASE_2_SEMANTIC)
      agg.add(e1)
      agg.add(e2)
      expect(agg.count).toBe(2)
      expect(agg.hasCritical()).toBe(true)
    })

    it('getAll returns sorted by priority', () => {
      agg.add(createEngineError(EngineErrorClass.UNKNOWN, 'u', 's', PipelinePhase.PHASE_1_CORE))
      agg.add(createEngineError(EngineErrorClass.CRITICAL, 'c', 's', PipelinePhase.PHASE_1_CORE))
      agg.add(createEngineError(EngineErrorClass.TIMEOUT, 't', 's', PipelinePhase.PHASE_1_CORE))
      const all = agg.getAll()
      expect(all[0].errorClass).toBe(EngineErrorClass.CRITICAL)
      expect(all[1].errorClass).toBe(EngineErrorClass.TIMEOUT)
      expect(all[2].errorClass).toBe(EngineErrorClass.UNKNOWN)
    })

    it('filters by class', () => {
      agg.add(createEngineError(EngineErrorClass.NETWORK_FAIL, 'n', 's', PipelinePhase.PHASE_1_CORE))
      agg.add(createEngineError(EngineErrorClass.NETWORK_FAIL, 'n2', 's', PipelinePhase.PHASE_1_CORE))
      agg.add(createEngineError(EngineErrorClass.CRITICAL, 'c', 's', PipelinePhase.PHASE_1_CORE))
      expect(agg.getByClass(EngineErrorClass.NETWORK_FAIL)).toHaveLength(2)
      expect(agg.getByClass(EngineErrorClass.CRITICAL)).toHaveLength(1)
    })

    it('filters by source', () => {
      agg.add(createEngineError(EngineErrorClass.TOOL_FAIL, 't', 'ModuleA', PipelinePhase.PHASE_1_CORE))
      agg.add(createEngineError(EngineErrorClass.TOOL_FAIL, 't', 'ModuleB', PipelinePhase.PHASE_1_CORE))
      expect(agg.getBySource('ModuleA')).toHaveLength(1)
    })

    it('filters by phase', () => {
      agg.add(createEngineError(EngineErrorClass.TOOL_FAIL, 't', 's', PipelinePhase.PHASE_1_CORE))
      agg.add(createEngineError(EngineErrorClass.TOOL_FAIL, 't', 's', PipelinePhase.PHASE_6_CYBERSEC))
      expect(agg.getByPhase(PipelinePhase.PHASE_6_CYBERSEC)).toHaveLength(1)
    })

    it('produces correct summary', () => {
      agg.add(createEngineError(EngineErrorClass.NETWORK_FAIL, 'n', 's', PipelinePhase.PHASE_1_CORE))
      agg.add(createEngineError(EngineErrorClass.NETWORK_FAIL, 'n', 's', PipelinePhase.PHASE_1_CORE))
      agg.add(createEngineError(EngineErrorClass.CRITICAL, 'c', 's', PipelinePhase.PHASE_1_CORE))
      const summary = agg.getSummary()
      expect(summary[EngineErrorClass.NETWORK_FAIL]).toBe(2)
      expect(summary[EngineErrorClass.CRITICAL]).toBe(1)
      expect(summary[EngineErrorClass.TIMEOUT]).toBe(0)
    })

    it('clear resets everything', () => {
      agg.add(createEngineError(EngineErrorClass.CRITICAL, 'c', 's', PipelinePhase.PHASE_1_CORE))
      agg.clear()
      expect(agg.count).toBe(0)
      expect(agg.hasCritical()).toBe(false)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// REPLAY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

describe('ReplayEngine', () => {
  const makeDecision = (
    stepId: string,
    module: string,
    outcome: 'success' | 'failure' | 'abstain' = 'success',
    confidence = 0.9,
  ): ReplayDecision => ({
    stepId,
    module,
    phase: PipelinePhase.PHASE_1_CORE,
    input: 'test input',
    output: { answer: 'hello' },
    confidence,
    outcome,
    durationMs: 10,
    timestamp: Date.now(),
  })

  describe('SeededRandom', () => {
    it('produces deterministic sequences', () => {
      const a = new SeededRandom(42)
      const b = new SeededRandom(42)
      const seqA = Array.from({ length: 20 }, () => a.next())
      const seqB = Array.from({ length: 20 }, () => b.next())
      expect(seqA).toEqual(seqB)
    })

    it('different seeds produce different sequences', () => {
      const a = new SeededRandom(42)
      const b = new SeededRandom(99)
      const seqA = Array.from({ length: 10 }, () => a.next())
      const seqB = Array.from({ length: 10 }, () => b.next())
      expect(seqA).not.toEqual(seqB)
    })

    it('values are in [0, 1)', () => {
      const rng = new SeededRandom(123)
      for (let i = 0; i < 1000; i++) {
        const v = rng.next()
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1)
      }
    })

    it('getState returns current state', () => {
      const rng = new SeededRandom(42)
      rng.next()
      expect(typeof rng.getState()).toBe('number')
    })
  })

  describe('recording lifecycle', () => {
    let engine: ReplayEngine

    beforeEach(() => {
      engine = new ReplayEngine()
    })

    it('starts not recording', () => {
      expect(engine.isRecording()).toBe(false)
      expect(engine.getCurrentRecordingId()).toBeNull()
    })

    it('startRecording returns session ID', () => {
      const id = engine.startRecording('hello')
      expect(id).toMatch(/^session-/)
      expect(engine.isRecording()).toBe(true)
      expect(engine.getCurrentRecordingId()).toBe(id)
    })

    it('records decisions during session', () => {
      engine.startRecording('test')
      engine.recordDecision(makeDecision('s1', 'ModA'))
      engine.recordDecision(makeDecision('s2', 'ModB'))
      const session = engine.stopRecording()
      expect(session).not.toBeNull()
      expect(session!.decisions).toHaveLength(2)
      expect(session!.input).toBe('test')
    })

    it('stopRecording returns null when not recording', () => {
      expect(engine.stopRecording()).toBeNull()
    })

    it('ignores recordDecision when not recording', () => {
      engine.recordDecision(makeDecision('s1', 'A'))
      // No error thrown
      expect(engine.sessionCount).toBe(0)
    })

    it('persists session after stop', () => {
      const id = engine.startRecording('test')
      engine.recordDecision(makeDecision('s1', 'A'))
      engine.stopRecording()
      expect(engine.getSession(id)).toBeDefined()
      expect(engine.getSessionIds()).toContain(id)
      expect(engine.sessionCount).toBe(1)
    })

    it('evicts oldest when at capacity', () => {
      const eng = new ReplayEngine({ maxSessions: 2 })
      eng.startRecording('a')
      eng.stopRecording()
      eng.startRecording('b')
      eng.stopRecording()
      eng.startRecording('c')
      eng.stopRecording()
      expect(eng.sessionCount).toBe(2)
    })
  })

  describe('deterministic replay', () => {
    let engine: ReplayEngine

    beforeEach(() => {
      engine = new ReplayEngine()
    })

    it('replay returns null for missing session', () => {
      expect(engine.replay('nonexistent', () => makeDecision('s', 'm'))).toBeNull()
    })

    it('identical replay is detected', () => {
      engine.startRecording('test')
      const d1 = makeDecision('s1', 'A')
      const d2 = makeDecision('s2', 'B')
      engine.recordDecision(d1)
      engine.recordDecision(d2)
      const session = engine.stopRecording()!

      const result = engine.replay(session.id, (orig) => orig)
      expect(result).not.toBeNull()
      expect(result!.identical).toBe(true)
      expect(result!.divergenceCount).toBe(0)
      expect(result!.comparisons).toHaveLength(2)
      expect(result!.comparisons.every(c => c.match)).toBe(true)
    })

    it('divergence in outcome is detected', () => {
      engine.startRecording('test')
      engine.recordDecision(makeDecision('s1', 'A', 'success'))
      const session = engine.stopRecording()!

      const result = engine.replay(session.id, (orig) => ({
        ...orig,
        outcome: 'failure' as const,
      }))
      expect(result!.identical).toBe(false)
      expect(result!.divergenceCount).toBe(1)
      expect(result!.comparisons[0].differences).toContain('outcome: success → failure')
    })

    it('divergence in confidence is detected', () => {
      engine.startRecording('test')
      engine.recordDecision(makeDecision('s1', 'A', 'success', 0.9))
      const session = engine.stopRecording()!

      const result = engine.replay(session.id, (orig) => ({
        ...orig,
        confidence: 0.5,
      }))
      expect(result!.identical).toBe(false)
      expect(result!.comparisons[0].differences.some(d => d.includes('confidence'))).toBe(true)
    })

    it('divergence in output is detected', () => {
      engine.startRecording('test')
      engine.recordDecision(makeDecision('s1', 'A'))
      const session = engine.stopRecording()!

      const result = engine.replay(session.id, (orig) => ({
        ...orig,
        output: { answer: 'different' },
      }))
      expect(result!.identical).toBe(false)
      expect(result!.comparisons[0].differences).toContain('output changed')
    })

    it('getRandom is deterministic with seed', () => {
      engine.startRecording('test', {}, '1.0.0', 42)
      const v1 = engine.getRandom()
      const v2 = engine.getRandom()
      engine.stopRecording()

      engine.startRecording('test', {}, '1.0.0', 42)
      const v3 = engine.getRandom()
      const v4 = engine.getRandom()
      engine.stopRecording()

      expect(v1).toBe(v3)
      expect(v2).toBe(v4)
    })
  })

  describe('clear', () => {
    it('clears all sessions', () => {
      const engine = new ReplayEngine()
      engine.startRecording('a')
      engine.stopRecording()
      engine.clear()
      expect(engine.sessionCount).toBe(0)
      expect(engine.isRecording()).toBe(false)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

describe('PromptRegistry', () => {
  const makeTemplate = (
    id: string,
    version: string,
    template = 'Hello {{name}}',
    requiredVars: string[] = ['name'],
  ): PromptTemplate => ({
    id,
    version,
    name: `Template ${id}`,
    template,
    requiredVars,
    optionalVars: { greeting: 'Hi' },
    category: 'test',
    createdAt: Date.now(),
    description: 'Test template',
  })

  const makeConfig = (id: string, version: string): ModelConfig => ({
    id,
    version,
    model: 'local-v1',
    temperature: 0.7,
    maxTokens: 1024,
    topP: 0.9,
    systemPromptId: null,
    parameters: {},
    createdAt: Date.now(),
  })

  describe('template registration', () => {
    let reg: PromptRegistry

    beforeEach(() => {
      reg = new PromptRegistry()
    })

    it('registers and retrieves a template', () => {
      const t = makeTemplate('greet', '1.0.0')
      reg.registerTemplate(t)
      expect(reg.getActiveTemplate('greet')).toEqual(t)
      expect(reg.getTemplateIds()).toContain('greet')
    })

    it('first version auto-activates', () => {
      reg.registerTemplate(makeTemplate('a', '1.0.0'))
      reg.registerTemplate(makeTemplate('a', '2.0.0'))
      // First version stays active
      expect(reg.getActiveTemplate('a')!.version).toBe('1.0.0')
    })

    it('activateTemplate switches version', () => {
      reg.registerTemplate(makeTemplate('a', '1.0.0'))
      reg.registerTemplate(makeTemplate('a', '2.0.0'))
      reg.activateTemplate('a', '2.0.0')
      expect(reg.getActiveTemplate('a')!.version).toBe('2.0.0')
    })

    it('throws on duplicate version', () => {
      reg.registerTemplate(makeTemplate('a', '1.0.0'))
      expect(() => reg.registerTemplate(makeTemplate('a', '1.0.0'))).toThrow('already registered')
    })

    it('throws on activate unknown version', () => {
      reg.registerTemplate(makeTemplate('a', '1.0.0'))
      expect(() => reg.activateTemplate('a', '9.9.9')).toThrow('not found')
    })

    it('getTemplate retrieves specific version', () => {
      reg.registerTemplate(makeTemplate('a', '1.0.0'))
      reg.registerTemplate(makeTemplate('a', '2.0.0'))
      expect(reg.getTemplate('a', '2.0.0')!.version).toBe('2.0.0')
    })

    it('getTemplateVersions returns all versions', () => {
      reg.registerTemplate(makeTemplate('a', '1.0.0'))
      reg.registerTemplate(makeTemplate('a', '2.0.0'))
      expect(reg.getTemplateVersions('a')).toHaveLength(2)
    })

    it('getActiveTemplate returns undefined for unknown', () => {
      expect(reg.getActiveTemplate('nope')).toBeUndefined()
    })
  })

  describe('model config registration', () => {
    let reg: PromptRegistry

    beforeEach(() => {
      reg = new PromptRegistry()
    })

    it('registers and retrieves a model config', () => {
      const c = makeConfig('default', '1.0.0')
      reg.registerModelConfig(c)
      expect(reg.getActiveModelConfig('default')).toEqual(c)
      expect(reg.getModelConfigIds()).toContain('default')
    })

    it('throws on duplicate config version', () => {
      reg.registerModelConfig(makeConfig('default', '1.0.0'))
      expect(() => reg.registerModelConfig(makeConfig('default', '1.0.0'))).toThrow('already registered')
    })

    it('activateModelConfig switches version', () => {
      reg.registerModelConfig(makeConfig('m', '1.0.0'))
      reg.registerModelConfig(makeConfig('m', '2.0.0'))
      reg.activateModelConfig('m', '2.0.0')
      expect(reg.getActiveModelConfig('m')!.version).toBe('2.0.0')
    })

    it('throws on activate unknown config version', () => {
      reg.registerModelConfig(makeConfig('m', '1.0.0'))
      expect(() => reg.activateModelConfig('m', '9.9.9')).toThrow('not found')
    })
  })

  describe('render', () => {
    let reg: PromptRegistry

    beforeEach(() => {
      reg = new PromptRegistry()
      reg.registerTemplate(makeTemplate('greet', '1.0.0', 'Hello {{name}}, {{greeting}}!', ['name']))
    })

    it('renders with required + optional vars', () => {
      const result = reg.render('greet', { name: 'World' })
      expect(result.text).toBe('Hello World, Hi!')
      expect(result.templateId).toBe('greet')
      expect(result.templateVersion).toBe('1.0.0')
      expect(result.variables.name).toBe('World')
      expect(result.variables.greeting).toBe('Hi')
    })

    it('optional vars can be overridden', () => {
      const result = reg.render('greet', { name: 'World', greeting: 'Hey' })
      expect(result.text).toBe('Hello World, Hey!')
    })

    it('throws on missing required var', () => {
      expect(() => reg.render('greet', {})).toThrow("Missing required variable 'name'")
    })

    it('throws on unknown template', () => {
      expect(() => reg.render('unknown')).toThrow("No active template for 'unknown'")
    })

    it('renders with multiple occurrences of same var', () => {
      reg.registerTemplate(makeTemplate('double', '1.0.0', '{{name}} and {{name}}', ['name']))
      const result = reg.render('double', { name: 'Alice' })
      expect(result.text).toBe('Alice and Alice')
    })
  })

  describe('serialize / deserialize', () => {
    it('round-trips correctly', () => {
      const reg = new PromptRegistry()
      reg.registerTemplate(makeTemplate('a', '1.0.0'))
      reg.registerTemplate(makeTemplate('a', '2.0.0'))
      reg.activateTemplate('a', '2.0.0')
      reg.registerModelConfig(makeConfig('m', '1.0.0'))

      const data = reg.serialize()

      const reg2 = new PromptRegistry()
      reg2.deserialize(data)
      expect(reg2.getActiveTemplate('a')!.version).toBe('2.0.0')
      expect(reg2.getActiveModelConfig('m')!.version).toBe('1.0.0')
      expect(reg2.getTemplateVersions('a')).toHaveLength(2)
    })
  })

  describe('clear', () => {
    it('clears everything', () => {
      const reg = new PromptRegistry()
      reg.registerTemplate(makeTemplate('a', '1.0.0'))
      reg.registerModelConfig(makeConfig('m', '1.0.0'))
      reg.clear()
      expect(reg.getTemplateIds()).toHaveLength(0)
      expect(reg.getModelConfigIds()).toHaveLength(0)
    })
  })
})
