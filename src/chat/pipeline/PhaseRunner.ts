/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  PhaseRunner — Lazy initialization and orchestration for pipeline phases    ║
 * ║  Coordinates module init order, tracks timing, provides health checks       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  PipelinePhase,
  PHASE_LABELS,
  MODULE_REGISTRY,
  getPhaseOrder,
  getInitOrder,
  type ModuleDescriptor,
} from './PipelineContract.js'

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Status of a single module slot. */
export interface ModuleSlot {
  readonly descriptor: ModuleDescriptor
  instance: unknown | null
  initialized: boolean
  initTimeMs: number
  error: string | null
}

/** Phase initialization result. */
export interface PhaseResult {
  readonly phase: PipelinePhase
  readonly label: string
  readonly modules: readonly ModuleSlotSummary[]
  readonly totalInitTimeMs: number
  readonly success: boolean
}

/** Summary of a single module slot (safe to serialize). */
export interface ModuleSlotSummary {
  readonly name: string
  readonly initialized: boolean
  readonly initTimeMs: number
  readonly error: string | null
}

/** Health check report. */
export interface HealthReport {
  readonly totalModules: number
  readonly initialized: number
  readonly failed: number
  readonly skipped: number
  readonly totalInitTimeMs: number
  readonly phaseResults: readonly PhaseResult[]
}

// ─── Phase Runner ──────────────────────────────────────────────────────────────

/**
 * Manages module lifecycle for all intelligence phases.
 * Supports lazy init, dependency ordering, and health reporting.
 */
export class PhaseRunner {
  private readonly slots: Map<string, ModuleSlot> = new Map()
  private readonly factories: Map<string, () => unknown> = new Map()
  private initialized = false

  constructor() {
    // Pre-create all slots from registry
    for (const desc of MODULE_REGISTRY) {
      this.slots.set(desc.name, {
        descriptor: desc,
        instance: null,
        initialized: false,
        initTimeMs: 0,
        error: null,
      })
    }
  }

  /**
   * Register a factory function for a module.
   * The factory is only invoked during `initializeAll()` or `initializePhase()`.
   */
  registerFactory(moduleName: string, factory: () => unknown): void {
    if (!this.slots.has(moduleName)) {
      throw new Error(`Unknown module '${moduleName}' — not in MODULE_REGISTRY`)
    }
    this.factories.set(moduleName, factory)
  }

  /**
   * Initialize all registered modules in dependency order.
   * Modules without factories are skipped (not an error).
   */
  initializeAll(): HealthReport {
    const order = getInitOrder()
    const phaseResults: PhaseResult[] = []

    for (const phase of getPhaseOrder()) {
      phaseResults.push(this.initPhaseModules(phase, order))
    }

    this.initialized = true
    return this.buildReport(phaseResults)
  }

  /**
   * Initialize only modules in a specific phase.
   * Dependencies in earlier phases must already be initialized.
   */
  initializePhase(phase: PipelinePhase): PhaseResult {
    const order = getInitOrder()
    return this.initPhaseModules(phase, order)
  }

  /** Get a module instance by name. Returns null if not initialized. */
  getModule<T>(name: string): T | null {
    const slot = this.slots.get(name)
    return slot?.initialized ? (slot.instance as T) : null
  }

  /** Check if a specific module is initialized. */
  isModuleReady(name: string): boolean {
    return this.slots.get(name)?.initialized ?? false
  }

  /** Check if all phases have been initialized. */
  isFullyInitialized(): boolean {
    return this.initialized
  }

  /** Get a full health report. */
  getHealth(): HealthReport {
    const phaseResults: PhaseResult[] = []
    for (const phase of getPhaseOrder()) {
      phaseResults.push(this.getPhaseResult(phase))
    }
    return this.buildReport(phaseResults)
  }

  /** Get serializable stats for all modules. */
  getModuleStats(): Record<string, unknown> {
    const stats: Record<string, unknown> = {}
    for (const [name, slot] of this.slots) {
      if (slot.initialized && slot.instance && typeof (slot.instance as Record<string, unknown>)['getStats'] === 'function') {
        try {
          stats[name] = (slot.instance as { getStats(): unknown }).getStats()
        } catch {
          stats[name] = null
        }
      }
    }
    return stats
  }

  /** Serialize all modules that support it. */
  serializeModules(): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    for (const [name, slot] of this.slots) {
      if (slot.initialized && slot.instance && typeof (slot.instance as Record<string, unknown>)['serialize'] === 'function') {
        try {
          data[name] = (slot.instance as { serialize(): unknown }).serialize()
        } catch {
          // Skip modules that fail to serialize
        }
      }
    }
    return data
  }

  /** Deserialize module state. Returns list of modules that failed. */
  deserializeModules(data: Record<string, unknown>): string[] {
    const failures: string[] = []
    for (const [name, state] of Object.entries(data)) {
      const slot = this.slots.get(name)
      if (slot?.initialized && slot.instance && typeof (slot.instance as Record<string, unknown>)['deserialize'] === 'function') {
        try {
          (slot.instance as { deserialize(d: unknown): void }).deserialize(state)
        } catch {
          failures.push(name)
        }
      }
    }
    return failures
  }

  /** Reset all module slots. */
  reset(): void {
    for (const slot of this.slots.values()) {
      slot.instance = null
      slot.initialized = false
      slot.initTimeMs = 0
      slot.error = null
    }
    this.initialized = false
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private initPhaseModules(phase: PipelinePhase, order: string[]): PhaseResult {
    const phaseModules = MODULE_REGISTRY.filter(m => m.phase === phase)
    const phaseNames = new Set(phaseModules.map(m => m.name))

    // Follow init order, but only for modules in this phase
    const orderedNames = order.filter(n => phaseNames.has(n))

    let totalMs = 0
    const summaries: ModuleSlotSummary[] = []

    for (const name of orderedNames) {
      const slot = this.slots.get(name)!
      const factory = this.factories.get(name)

      if (!factory) {
        summaries.push({ name, initialized: false, initTimeMs: 0, error: null })
        continue
      }

      const start = Date.now()
      try {
        slot.instance = factory()
        slot.initialized = true
        slot.initTimeMs = Date.now() - start
        slot.error = null
      } catch (e) {
        slot.error = e instanceof Error ? e.message : String(e)
        slot.initTimeMs = Date.now() - start
      }

      totalMs += slot.initTimeMs
      summaries.push({
        name: slot.descriptor.name,
        initialized: slot.initialized,
        initTimeMs: slot.initTimeMs,
        error: slot.error,
      })
    }

    return {
      phase,
      label: PHASE_LABELS[phase],
      modules: summaries,
      totalInitTimeMs: totalMs,
      success: summaries.every(s => s.initialized || s.error === null),
    }
  }

  private getPhaseResult(phase: PipelinePhase): PhaseResult {
    const phaseModules = MODULE_REGISTRY.filter(m => m.phase === phase)
    let totalMs = 0
    const summaries: ModuleSlotSummary[] = []

    for (const mod of phaseModules) {
      const slot = this.slots.get(mod.name)!
      totalMs += slot.initTimeMs
      summaries.push({
        name: mod.name,
        initialized: slot.initialized,
        initTimeMs: slot.initTimeMs,
        error: slot.error,
      })
    }

    return {
      phase,
      label: PHASE_LABELS[phase],
      modules: summaries,
      totalInitTimeMs: totalMs,
      success: summaries.every(s => s.initialized || s.error === null),
    }
  }

  private buildReport(phaseResults: PhaseResult[]): HealthReport {
    let total = 0
    let inited = 0
    let failed = 0
    let skipped = 0
    let totalMs = 0

    for (const pr of phaseResults) {
      for (const ms of pr.modules) {
        total++
        if (ms.initialized) inited++
        else if (ms.error) failed++
        else skipped++
      }
      totalMs += pr.totalInitTimeMs
    }

    return {
      totalModules: total,
      initialized: inited,
      failed,
      skipped,
      totalInitTimeMs: totalMs,
      phaseResults,
    }
  }
}
