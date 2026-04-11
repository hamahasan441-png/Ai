import { describe, it, expect, beforeEach } from 'vitest'
import { PhaseRunner, type HealthReport, type PhaseResult } from '../PhaseRunner'
import { PipelinePhase, MODULE_REGISTRY, PHASE_LABELS, getPhaseOrder } from '../PipelineContract'

// ── Helpers ──

/** Return the first module name registered under a given phase. */
function firstModuleInPhase(phase: PipelinePhase): string {
  const mod = MODULE_REGISTRY.find(m => m.phase === phase)
  if (!mod) throw new Error(`No module found in phase ${phase}`)
  return mod.name
}

/** Simple stub factory that returns a plain object. */
const stubFactory = () => ({ ready: true })

/** Factory that includes getStats / serialize / deserialize methods. */
function richFactory(id = 'mod') {
  return () => ({
    id,
    getStats: () => ({ calls: 42 }),
    serialize: () => ({ state: id }),
    deserialize: (_d: unknown) => {
      /* noop */
    },
  })
}

/** Factory that throws. */
const failingFactory = () => {
  throw new Error('init boom')
}

// ── constructor ──

describe('PhaseRunner', () => {
  let runner: PhaseRunner

  beforeEach(() => {
    runner = new PhaseRunner()
  })

  describe('constructor', () => {
    it('creates slots for every module in MODULE_REGISTRY', () => {
      const health = runner.getHealth()
      expect(health.totalModules).toBe(MODULE_REGISTRY.length)
    })

    it('starts with no modules initialized', () => {
      const health = runner.getHealth()
      expect(health.initialized).toBe(0)
    })

    it('is not fully initialized after construction', () => {
      expect(runner.isFullyInitialized()).toBe(false)
    })
  })

  // ── registerFactory ──

  describe('registerFactory', () => {
    it('accepts a factory for a known module', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      expect(() => runner.registerFactory(name, stubFactory)).not.toThrow()
    })

    it('throws for an unknown module name', () => {
      expect(() => runner.registerFactory('NoSuchModule', stubFactory)).toThrow(
        /Unknown module 'NoSuchModule'/,
      )
    })

    it('allows overwriting a previously registered factory', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, stubFactory)
      expect(() => runner.registerFactory(name, () => 'new')).not.toThrow()
    })
  })

  // ── initializeAll ──

  describe('initializeAll', () => {
    it('returns a HealthReport', () => {
      const report = runner.initializeAll()
      expect(report).toHaveProperty('totalModules')
      expect(report).toHaveProperty('phaseResults')
    })

    it('marks runner as fully initialized', () => {
      runner.initializeAll()
      expect(runner.isFullyInitialized()).toBe(true)
    })

    it('initializes registered factories and skips missing ones', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, stubFactory)

      const report = runner.initializeAll()
      expect(report.initialized).toBe(1)
      expect(report.skipped).toBe(MODULE_REGISTRY.length - 1)
    })

    it('captures errors from failing factories without throwing', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, failingFactory)

      const report = runner.initializeAll()
      expect(report.failed).toBe(1)
      const failedMod = report.phaseResults.flatMap(pr => pr.modules).find(m => m.name === name)
      expect(failedMod?.error).toBe('init boom')
    })

    it('includes a PhaseResult for every phase', () => {
      const report = runner.initializeAll()
      const phases = report.phaseResults.map(pr => pr.phase)
      for (const p of getPhaseOrder()) {
        expect(phases).toContain(p)
      }
    })
  })

  // ── initializePhase ──

  describe('initializePhase', () => {
    it('returns a PhaseResult for the specified phase', () => {
      const result = runner.initializePhase(PipelinePhase.PHASE_1_CORE)
      expect(result.phase).toBe(PipelinePhase.PHASE_1_CORE)
      expect(result.label).toBe(PHASE_LABELS[PipelinePhase.PHASE_1_CORE])
    })

    it('initializes only modules belonging to the target phase', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, stubFactory)

      const result = runner.initializePhase(PipelinePhase.PHASE_1_CORE)
      expect(result.modules.some(m => m.name === name && m.initialized)).toBe(true)

      // Module in another phase should remain uninitialized
      const otherName = firstModuleInPhase(PipelinePhase.PHASE_4_FINANCIAL)
      expect(runner.isModuleReady(otherName)).toBe(false)
    })

    it('reports success when all modules either init or are skipped', () => {
      const result = runner.initializePhase(PipelinePhase.PHASE_6_CYBERSEC)
      expect(result.success).toBe(true)
    })
  })

  // ── getModule ──

  describe('getModule', () => {
    it('returns null for an uninitialized module', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      expect(runner.getModule(name)).toBeNull()
    })

    it('returns the instance after initialization', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, stubFactory)
      runner.initializePhase(PipelinePhase.PHASE_1_CORE)

      const mod = runner.getModule<{ ready: boolean }>(name)
      expect(mod).not.toBeNull()
      expect(mod!.ready).toBe(true)
    })

    it('returns null for a name not in the registry', () => {
      expect(runner.getModule('NonExistent')).toBeNull()
    })
  })

  // ── isModuleReady ──

  describe('isModuleReady', () => {
    it('returns false for unknown module names', () => {
      expect(runner.isModuleReady('DoesNotExist')).toBe(false)
    })

    it('returns true after a module has been initialized', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, stubFactory)
      runner.initializePhase(PipelinePhase.PHASE_1_CORE)
      expect(runner.isModuleReady(name)).toBe(true)
    })
  })

  // ── isFullyInitialized ──

  describe('isFullyInitialized', () => {
    it('returns false before initializeAll is called', () => {
      expect(runner.isFullyInitialized()).toBe(false)
    })

    it('returns true after initializeAll completes', () => {
      runner.initializeAll()
      expect(runner.isFullyInitialized()).toBe(true)
    })

    it('remains false after only initializePhase is called', () => {
      runner.initializePhase(PipelinePhase.PHASE_1_CORE)
      expect(runner.isFullyInitialized()).toBe(false)
    })
  })

  // ── getHealth ──

  describe('getHealth', () => {
    it('returns zeroed counters on a fresh runner', () => {
      const h = runner.getHealth()
      expect(h.initialized).toBe(0)
      expect(h.failed).toBe(0)
      expect(h.totalInitTimeMs).toBe(0)
    })

    it('reflects state after partial initialization', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, stubFactory)
      runner.initializePhase(PipelinePhase.PHASE_1_CORE)

      const h = runner.getHealth()
      expect(h.initialized).toBe(1)
      expect(h.skipped).toBe(MODULE_REGISTRY.length - 1)
    })
  })

  // ── getModuleStats ──

  describe('getModuleStats', () => {
    it('returns empty object when no modules have getStats', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, stubFactory)
      runner.initializeAll()

      const stats = runner.getModuleStats()
      expect(stats[name]).toBeUndefined()
    })

    it('collects stats from modules that expose getStats()', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, richFactory('core'))
      runner.initializeAll()

      const stats = runner.getModuleStats()
      expect(stats[name]).toEqual({ calls: 42 })
    })
  })

  // ── serializeModules / deserializeModules ──

  describe('serializeModules', () => {
    it('returns empty object when no modules support serialize', () => {
      runner.initializeAll()
      expect(runner.serializeModules()).toEqual({})
    })

    it('collects data from modules that expose serialize()', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, richFactory('core'))
      runner.initializeAll()

      const data = runner.serializeModules()
      expect(data[name]).toEqual({ state: 'core' })
    })
  })

  describe('deserializeModules', () => {
    it('returns empty array when deserialization succeeds', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, richFactory('core'))
      runner.initializeAll()

      const failures = runner.deserializeModules({ [name]: { state: 'restored' } })
      expect(failures).toEqual([])
    })

    it('returns module names that fail deserialization', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, () => ({
        deserialize: () => {
          throw new Error('bad data')
        },
      }))
      runner.initializeAll()

      const failures = runner.deserializeModules({ [name]: {} })
      expect(failures).toContain(name)
    })

    it('ignores data for modules that are not initialized', () => {
      const failures = runner.deserializeModules({ SemanticEngine: { foo: 1 } })
      expect(failures).toEqual([])
    })
  })

  // ── reset ──

  describe('reset', () => {
    it('clears all initialized modules', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, stubFactory)
      runner.initializeAll()
      expect(runner.isModuleReady(name)).toBe(true)

      runner.reset()
      expect(runner.isModuleReady(name)).toBe(false)
      expect(runner.getModule(name)).toBeNull()
    })

    it('sets isFullyInitialized back to false', () => {
      runner.initializeAll()
      expect(runner.isFullyInitialized()).toBe(true)

      runner.reset()
      expect(runner.isFullyInitialized()).toBe(false)
    })

    it('clears error state from failed modules', () => {
      const name = firstModuleInPhase(PipelinePhase.PHASE_1_CORE)
      runner.registerFactory(name, failingFactory)
      runner.initializeAll()

      runner.reset()
      const h = runner.getHealth()
      expect(h.failed).toBe(0)
    })
  })
})
