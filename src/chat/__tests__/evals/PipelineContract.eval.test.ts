/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  Pipeline Contract — Evaluation Benchmark Tests                             ║
 * ║  Tests registry integrity, phase ordering, dependencies, and PhaseRunner    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'

import {
  PipelinePhase,
  PHASE_LABELS,
  MODULE_REGISTRY,
  TOTAL_MODULES,
  getModulesByPhase,
  getPhaseModuleCounts,
  findModule,
  getAllModuleNames,
  validateDependencies,
  getPhaseOrder,
  getInitOrder,
} from '../../pipeline/PipelineContract.js'

import { PhaseRunner } from '../../pipeline/PhaseRunner.js'

describe('PipelineContract', () => {
  // ─── Phase Enum ────────────────────────────────────────────────────────────

  describe('PipelinePhase enum', () => {
    it('has exactly 10 phases', () => {
      const phases = Object.values(PipelinePhase).filter((v): v is number => typeof v === 'number')
      expect(phases).toHaveLength(10)
    })

    it('phases are numbered 1–10', () => {
      expect(PipelinePhase.PHASE_1_CORE).toBe(1)
      expect(PipelinePhase.PHASE_10_TRAINING).toBe(10)
    })

    it('all phases have labels', () => {
      const phases = Object.values(PipelinePhase).filter(
        (v): v is PipelinePhase => typeof v === 'number',
      )
      for (const phase of phases) {
        expect(PHASE_LABELS[phase]).toBeDefined()
        expect(typeof PHASE_LABELS[phase]).toBe('string')
        expect(PHASE_LABELS[phase].length).toBeGreaterThan(0)
      }
    })
  })

  // ─── Module Registry ───────────────────────────────────────────────────────

  describe('MODULE_REGISTRY', () => {
    it('has exactly 47 modules', () => {
      expect(MODULE_REGISTRY).toHaveLength(47)
      expect(TOTAL_MODULES).toBe(47)
    })

    it('every module has required fields', () => {
      for (const mod of MODULE_REGISTRY) {
        expect(typeof mod.name).toBe('string')
        expect(mod.name.length).toBeGreaterThan(0)
        expect(typeof mod.phase).toBe('number')
        expect(typeof mod.importPath).toBe('string')
        expect(typeof mod.description).toBe('string')
        expect(Array.isArray(mod.dependencies)).toBe(true)
      }
    })

    it('has no duplicate module names', () => {
      const names = MODULE_REGISTRY.map(m => m.name)
      expect(new Set(names).size).toBe(names.length)
    })

    it('all import paths start with ./', () => {
      for (const mod of MODULE_REGISTRY) {
        expect(mod.importPath).toMatch(/^\.\//)
      }
    })

    it('module names match import path basenames', () => {
      for (const mod of MODULE_REGISTRY) {
        const basename = mod.importPath.replace('./', '')
        expect(mod.name).toBe(basename)
      }
    })
  })

  // ─── Phase Module Counts ───────────────────────────────────────────────────

  describe('getPhaseModuleCounts', () => {
    it('returns correct counts per phase', () => {
      const counts = getPhaseModuleCounts()
      expect(counts[PipelinePhase.PHASE_1_CORE]).toBe(5)
      expect(counts[PipelinePhase.PHASE_2_SEMANTIC]).toBe(4)
      expect(counts[PipelinePhase.PHASE_3_COGNITIVE]).toBe(4)
      expect(counts[PipelinePhase.PHASE_4_FINANCIAL]).toBe(8)
      expect(counts[PipelinePhase.PHASE_5_SEMANTIC_ADV]).toBe(8)
      expect(counts[PipelinePhase.PHASE_6_CYBERSEC]).toBe(4)
      expect(counts[PipelinePhase.PHASE_7_UNDERSTANDING]).toBe(4)
      expect(counts[PipelinePhase.PHASE_8_DEEP]).toBe(4)
      expect(counts[PipelinePhase.PHASE_9_CODE]).toBe(4)
      expect(counts[PipelinePhase.PHASE_10_TRAINING]).toBe(2)
    })

    it('sums to TOTAL_MODULES', () => {
      const counts = getPhaseModuleCounts()
      const sum = Object.values(counts).reduce((a, b) => a + b, 0)
      expect(sum).toBe(TOTAL_MODULES)
    })
  })

  // ─── Module Lookup ─────────────────────────────────────────────────────────

  describe('findModule', () => {
    it('finds existing modules', () => {
      const mod = findModule('SemanticEngine')
      expect(mod).toBeDefined()
      expect(mod!.phase).toBe(PipelinePhase.PHASE_1_CORE)
    })

    it('returns undefined for unknown modules', () => {
      expect(findModule('NonExistentModule')).toBeUndefined()
    })

    it('finds modules in every phase', () => {
      for (const phase of getPhaseOrder()) {
        const modules = getModulesByPhase(phase)
        expect(modules.length).toBeGreaterThan(0)
        for (const mod of modules) {
          expect(findModule(mod.name)).toBeDefined()
        }
      }
    })
  })

  // ─── getAllModuleNames ─────────────────────────────────────────────────────

  describe('getAllModuleNames', () => {
    it('returns all 47 names', () => {
      const names = getAllModuleNames()
      expect(names).toHaveLength(47)
    })

    it('names are all strings', () => {
      for (const name of getAllModuleNames()) {
        expect(typeof name).toBe('string')
      }
    })
  })

  // ─── Dependency Validation ─────────────────────────────────────────────────

  describe('validateDependencies', () => {
    it('all dependencies are valid', () => {
      const result = validateDependencies()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('dependencies only reference modules in same or earlier phases', () => {
      const phaseOfModule = new Map(MODULE_REGISTRY.map(m => [m.name, m.phase]))

      for (const mod of MODULE_REGISTRY) {
        for (const dep of mod.dependencies) {
          const depPhase = phaseOfModule.get(dep)
          expect(depPhase).toBeDefined()
          expect(depPhase!).toBeLessThanOrEqual(mod.phase)
        }
      }
    })
  })

  // ─── Phase Order ───────────────────────────────────────────────────────────

  describe('getPhaseOrder', () => {
    it('returns phases in ascending order', () => {
      const order = getPhaseOrder()
      expect(order).toHaveLength(10)
      for (let i = 1; i < order.length; i++) {
        expect(order[i]!).toBeGreaterThan(order[i - 1]!)
      }
    })

    it('starts at phase 1 and ends at phase 10', () => {
      const order = getPhaseOrder()
      expect(order[0]).toBe(PipelinePhase.PHASE_1_CORE)
      expect(order[9]).toBe(PipelinePhase.PHASE_10_TRAINING)
    })
  })

  // ─── Init Order ────────────────────────────────────────────────────────────

  describe('getInitOrder', () => {
    it('includes all 47 modules', () => {
      const order = getInitOrder()
      expect(order).toHaveLength(47)
    })

    it('has no duplicates', () => {
      const order = getInitOrder()
      expect(new Set(order).size).toBe(order.length)
    })

    it('dependencies appear before dependents', () => {
      const order = getInitOrder()
      const indexOf = new Map(order.map((name, idx) => [name, idx]))

      for (const mod of MODULE_REGISTRY) {
        for (const dep of mod.dependencies) {
          const depIdx = indexOf.get(dep)!
          const modIdx = indexOf.get(mod.name)!
          expect(depIdx).toBeLessThan(modIdx)
        }
      }
    })

    it('phase 1 modules come first', () => {
      const order = getInitOrder()
      const phase1Modules = getModulesByPhase(PipelinePhase.PHASE_1_CORE).map(m => m.name)

      for (const name of phase1Modules) {
        const idx = order.indexOf(name)
        // Phase 1 modules should all be in first 5 positions
        expect(idx).toBeLessThan(5)
      }
    })
  })
})

// ─── PhaseRunner Tests ─────────────────────────────────────────────────────────

describe('PhaseRunner', () => {
  let runner: PhaseRunner

  beforeEach(() => {
    runner = new PhaseRunner()
  })

  describe('registration', () => {
    it('rejects unknown module names', () => {
      expect(() => runner.registerFactory('FakeModule', () => ({}))).toThrow(
        'not in MODULE_REGISTRY',
      )
    })

    it('accepts valid module names', () => {
      expect(() =>
        runner.registerFactory('SemanticEngine', () => ({ getStats: () => ({}) })),
      ).not.toThrow()
    })
  })

  describe('initialization', () => {
    it('initializes registered modules', () => {
      const mockModule = { getStats: () => ({ test: true }) }
      runner.registerFactory('SemanticEngine', () => mockModule)

      const report = runner.initializeAll()
      expect(report.initialized).toBeGreaterThanOrEqual(1)
      expect(runner.getModule('SemanticEngine')).toBe(mockModule)
    })

    it('skips modules without factories', () => {
      const report = runner.initializeAll()
      expect(report.skipped).toBe(47)
      expect(report.initialized).toBe(0)
    })

    it('tracks initialization time', () => {
      runner.registerFactory('MetaCognition', () => {
        // Simulate some work
        const start = Date.now()
        while (Date.now() - start < 5) {
          /* busy wait */
        }
        return { getStats: () => ({}) }
      })

      const report = runner.initializeAll()
      expect(report.totalInitTimeMs).toBeGreaterThanOrEqual(0)
    })

    it('handles factory errors gracefully', () => {
      runner.registerFactory('SemanticEngine', () => {
        throw new Error('init failed')
      })

      const report = runner.initializeAll()
      expect(report.failed).toBeGreaterThanOrEqual(1)
      expect(runner.getModule('SemanticEngine')).toBeNull()
    })

    it('marks fully initialized after initializeAll', () => {
      runner.initializeAll()
      expect(runner.isFullyInitialized()).toBe(true)
    })
  })

  describe('module access', () => {
    it('returns null for uninitialized modules', () => {
      expect(runner.getModule('SemanticEngine')).toBeNull()
    })

    it('returns null for unknown modules', () => {
      expect(runner.getModule('FakeModule')).toBeNull()
    })

    it('isModuleReady reports correctly', () => {
      expect(runner.isModuleReady('SemanticEngine')).toBe(false)

      runner.registerFactory('SemanticEngine', () => ({}))
      runner.initializeAll()
      expect(runner.isModuleReady('SemanticEngine')).toBe(true)
    })
  })

  describe('health reporting', () => {
    it('returns health for all phases', () => {
      const health = runner.getHealth()
      expect(health.phaseResults).toHaveLength(10)
      expect(health.totalModules).toBe(47)
    })

    it('counts match totals', () => {
      runner.registerFactory('SemanticEngine', () => ({}))
      runner.initializeAll()

      const health = runner.getHealth()
      expect(health.initialized).toBe(1)
      expect(health.skipped).toBe(46)
    })
  })

  describe('phase initialization', () => {
    it('can initialize a single phase', () => {
      runner.registerFactory('SemanticEngine', () => ({}))
      runner.registerFactory('IntentEngine', () => ({}))

      const result = runner.initializePhase(PipelinePhase.PHASE_1_CORE)
      expect(result.phase).toBe(PipelinePhase.PHASE_1_CORE)
      expect(result.label).toBe('Core Intelligence')
    })
  })

  describe('serialization', () => {
    it('serializes modules that support it', () => {
      const serializableModule = {
        getStats: () => ({}),
        serialize: () => ({ data: 'test' }),
      }
      runner.registerFactory('SemanticEngine', () => serializableModule)
      runner.initializeAll()

      const data = runner.serializeModules()
      expect(data['SemanticEngine']).toEqual({ data: 'test' })
    })

    it('skips modules without serialize method', () => {
      runner.registerFactory('SemanticEngine', () => ({}))
      runner.initializeAll()

      const data = runner.serializeModules()
      expect(data['SemanticEngine']).toBeUndefined()
    })

    it('deserializes module state', () => {
      let deserializedWith: unknown = null
      const module = {
        getStats: () => ({}),
        serialize: () => ({ data: 'test' }),
        deserialize: (d: unknown) => {
          deserializedWith = d
        },
      }
      runner.registerFactory('SemanticEngine', () => module)
      runner.initializeAll()

      const failures = runner.deserializeModules({ SemanticEngine: { data: 'restored' } })
      expect(failures).toHaveLength(0)
      expect(deserializedWith).toEqual({ data: 'restored' })
    })
  })

  describe('reset', () => {
    it('clears all module state', () => {
      runner.registerFactory('SemanticEngine', () => ({}))
      runner.initializeAll()
      expect(runner.isModuleReady('SemanticEngine')).toBe(true)

      runner.reset()
      expect(runner.isModuleReady('SemanticEngine')).toBe(false)
      expect(runner.isFullyInitialized()).toBe(false)
    })
  })

  describe('module stats', () => {
    it('collects stats from initialized modules', () => {
      runner.registerFactory('MetaCognition', () => ({
        getStats: () => ({ calibrationScore: 0.95 }),
      }))
      runner.initializeAll()

      const stats = runner.getModuleStats()
      expect(stats['MetaCognition']).toEqual({ calibrationScore: 0.95 })
    })

    it('ignores modules without getStats', () => {
      runner.registerFactory('SemanticEngine', () => ({}))
      runner.initializeAll()

      const stats = runner.getModuleStats()
      expect(stats['SemanticEngine']).toBeUndefined()
    })
  })
})
