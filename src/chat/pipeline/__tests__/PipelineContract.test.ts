import { describe, it, expect } from 'vitest'
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
} from '../PipelineContract.js'

describe('PipelinePhase enum', () => {
  it('should have 10 phases numbered 1-10', () => {
    const numericValues = Object.values(PipelinePhase).filter(
      (v): v is number => typeof v === 'number',
    )
    expect(numericValues).toHaveLength(10)
    expect(numericValues).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('should map PHASE_1_CORE to 1', () => {
    expect(PipelinePhase.PHASE_1_CORE).toBe(1)
  })
})

describe('PHASE_LABELS', () => {
  it('should have a label for every phase', () => {
    const phases = Object.values(PipelinePhase).filter(
      (v): v is PipelinePhase => typeof v === 'number',
    )
    for (const phase of phases) {
      expect(PHASE_LABELS[phase]).toBeDefined()
      expect(typeof PHASE_LABELS[phase]).toBe('string')
    }
  })

  it('should label PHASE_1_CORE as Core Intelligence', () => {
    expect(PHASE_LABELS[PipelinePhase.PHASE_1_CORE]).toBe('Core Intelligence')
  })
})

describe('MODULE_REGISTRY', () => {
  it('should be a non-empty readonly array', () => {
    expect(MODULE_REGISTRY.length).toBeGreaterThan(0)
  })

  it('should have TOTAL_MODULES matching its length', () => {
    expect(TOTAL_MODULES).toBe(MODULE_REGISTRY.length)
  })

  it('should have unique module names', () => {
    const names = MODULE_REGISTRY.map(m => m.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('getModulesByPhase', () => {
  it('should return 5 modules for PHASE_1_CORE', () => {
    const coreModules = getModulesByPhase(PipelinePhase.PHASE_1_CORE)
    expect(coreModules).toHaveLength(5)
  })

  it('should return modules all belonging to the requested phase', () => {
    const modules = getModulesByPhase(PipelinePhase.PHASE_6_CYBERSEC)
    for (const m of modules) {
      expect(m.phase).toBe(PipelinePhase.PHASE_6_CYBERSEC)
    }
  })
})

describe('getPhaseModuleCounts', () => {
  it('should return counts for all 10 phases', () => {
    const counts = getPhaseModuleCounts()
    expect(Object.keys(counts)).toHaveLength(10)
  })

  it('should sum to TOTAL_MODULES', () => {
    const counts = getPhaseModuleCounts()
    const sum = Object.values(counts).reduce((a, b) => a + b, 0)
    expect(sum).toBe(TOTAL_MODULES)
  })
})

describe('findModule', () => {
  it('should find SemanticEngine by name', () => {
    const mod = findModule('SemanticEngine')
    expect(mod).toBeDefined()
    expect(mod!.name).toBe('SemanticEngine')
    expect(mod!.phase).toBe(PipelinePhase.PHASE_1_CORE)
  })

  it('should return undefined for unknown module', () => {
    expect(findModule('NonExistentModule')).toBeUndefined()
  })
})

describe('getAllModuleNames', () => {
  it('should return an array of strings with length equal to TOTAL_MODULES', () => {
    const names = getAllModuleNames()
    expect(names).toHaveLength(TOTAL_MODULES)
    for (const n of names) {
      expect(typeof n).toBe('string')
    }
  })
})

describe('validateDependencies', () => {
  it('should report valid with no errors for the built-in registry', () => {
    const result = validateDependencies()
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('getPhaseOrder', () => {
  it('should return phases 1 through 10 in ascending order', () => {
    const order = getPhaseOrder()
    expect(order).toHaveLength(10)
    for (let i = 0; i < order.length - 1; i++) {
      expect(order[i]).toBeLessThan(order[i + 1])
    }
  })
})

describe('getInitOrder', () => {
  it('should return all module names', () => {
    const order = getInitOrder()
    expect(order).toHaveLength(TOTAL_MODULES)
  })

  it('should place dependencies before dependents', () => {
    const order = getInitOrder()
    for (const mod of MODULE_REGISTRY) {
      const modIdx = order.indexOf(mod.name)
      for (const dep of mod.dependencies) {
        const depIdx = order.indexOf(dep)
        expect(depIdx).toBeLessThan(modIdx)
      }
    }
  })

  it('should contain no duplicates', () => {
    const order = getInitOrder()
    expect(new Set(order).size).toBe(order.length)
  })
})
