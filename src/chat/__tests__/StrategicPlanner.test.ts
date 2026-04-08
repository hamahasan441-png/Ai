import { describe, it, expect, beforeEach } from 'vitest'
import {
  StrategicPlanner,
  DEFAULT_STRATEGIC_PLANNER_CONFIG,
} from '../StrategicPlanner'

describe('StrategicPlanner', () => {
  let planner: StrategicPlanner

  beforeEach(() => {
    planner = new StrategicPlanner()
  })

  // ══════════════════════════════════════════════════════════════════════
  // §1 — Construction & Configuration
  // ══════════════════════════════════════════════════════════════════════

  describe('construction', () => {
    it('creates with default config', () => {
      expect(planner).toBeInstanceOf(StrategicPlanner)
    })

    it('creates with custom config', () => {
      const custom = new StrategicPlanner({ maxStepsPerPlan: 10 })
      expect(custom).toBeInstanceOf(StrategicPlanner)
    })

    it('exports DEFAULT_STRATEGIC_PLANNER_CONFIG', () => {
      expect(DEFAULT_STRATEGIC_PLANNER_CONFIG).toBeDefined()
      expect(DEFAULT_STRATEGIC_PLANNER_CONFIG.monteCarloSimulations).toBe(1000)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §2 — Plan Creation
  // ══════════════════════════════════════════════════════════════════════

  describe('plan creation', () => {
    it('creates a plan for a development objective', () => {
      const plan = planner.createPlan('Develop a REST API')
      expect(plan.id).toBeTruthy()
      expect(plan.objective).toBe('Develop a REST API')
      expect(plan.steps.length).toBeGreaterThan(0)
      expect(plan.status).toBe('draft')
    })

    it('creates a plan for investigation', () => {
      const plan = planner.createPlan('Investigate performance bottleneck')
      expect(plan.steps.length).toBeGreaterThan(0)
    })

    it('creates a plan for optimization', () => {
      const plan = planner.createPlan('Optimize database performance')
      expect(plan.steps.length).toBeGreaterThan(0)
    })

    it('creates a plan for migration', () => {
      const plan = planner.createPlan('Migrate from MySQL to PostgreSQL')
      expect(plan.steps.length).toBeGreaterThan(0)
    })

    it('creates a default plan for unknown objectives', () => {
      const plan = planner.createPlan('Something unusual')
      expect(plan.steps.length).toBeGreaterThan(0)
    })

    it('computes total estimated duration', () => {
      const plan = planner.createPlan('Build a web application')
      expect(plan.totalEstimatedDuration).toBeGreaterThan(0)
    })

    it('computes overall success probability', () => {
      const plan = planner.createPlan('Develop a tool')
      expect(plan.overallSuccessProbability).toBeGreaterThan(0)
      expect(plan.overallSuccessProbability).toBeLessThanOrEqual(1)
    })

    it('computes risk score', () => {
      const plan = planner.createPlan('Build something')
      expect(plan.riskScore).toBeGreaterThanOrEqual(0)
      expect(plan.riskScore).toBeLessThanOrEqual(1)
    })

    it('steps have dependencies', () => {
      const plan = planner.createPlan('Develop a system')
      if (plan.steps.length > 1) {
        expect(plan.steps[1].dependencies.length).toBeGreaterThan(0)
      }
    })

    it('gets a plan by ID', () => {
      const plan = planner.createPlan('Test plan')
      expect(planner.getPlan(plan.id)).not.toBeNull()
    })

    it('returns null for non-existent plan', () => {
      expect(planner.getPlan('bad')).toBeNull()
    })

    it('gets all plans', () => {
      planner.createPlan('A')
      planner.createPlan('B')
      expect(planner.getAllPlans().length).toBe(2)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §3 — Contingency Planning
  // ══════════════════════════════════════════════════════════════════════

  describe('contingency planning', () => {
    it('adds a contingency branch to a plan', () => {
      const plan = planner.createPlan('Build feature')
      const branch = planner.addContingency(plan.id, 'API unavailable', 0.2)
      expect(branch).not.toBeNull()
      expect(branch!.condition).toBe('API unavailable')
    })

    it('returns null for non-existent plan', () => {
      expect(planner.addContingency('bad', 'condition', 0.3)).toBeNull()
    })

    it('respects max contingencies limit', () => {
      const small = new StrategicPlanner({ maxContingencies: 1 })
      const plan = small.createPlan('Test')
      small.addContingency(plan.id, 'C1', 0.3)
      const c2 = small.addContingency(plan.id, 'C2', 0.3)
      expect(c2).toBeNull()
    })

    it('contingency branch has steps', () => {
      const plan = planner.createPlan('Build')
      const branch = planner.addContingency(plan.id, 'Failure scenario', 0.5)
      expect(branch!.steps.length).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §4 — Monte Carlo Simulation
  // ══════════════════════════════════════════════════════════════════════

  describe('Monte Carlo simulation', () => {
    it('simulates a plan', () => {
      const plan = planner.createPlan('Develop a feature')
      const result = planner.simulatePlan(plan.id, 42)
      expect(result).not.toBeNull()
      expect(result!.simulations).toBe(1000)
    })

    it('returns success rate between 0 and 1', () => {
      const plan = planner.createPlan('Build feature')
      const result = planner.simulatePlan(plan.id, 42)
      expect(result!.successRate).toBeGreaterThanOrEqual(0)
      expect(result!.successRate).toBeLessThanOrEqual(1)
    })

    it('computes average duration', () => {
      const plan = planner.createPlan('Build')
      const result = planner.simulatePlan(plan.id, 42)
      expect(result!.avgDuration).toBeGreaterThan(0)
    })

    it('computes percentile 95 duration', () => {
      const plan = planner.createPlan('Build')
      const result = planner.simulatePlan(plan.id, 42)
      expect(result!.percentile95Duration).toBeGreaterThanOrEqual(result!.avgDuration * 0.5)
    })

    it('computes risk distribution', () => {
      const plan = planner.createPlan('Build')
      const result = planner.simulatePlan(plan.id, 42)
      expect(result!.riskDistribution).toBeDefined()
    })

    it('returns null for non-existent plan', () => {
      expect(planner.simulatePlan('bad', 42)).toBeNull()
    })

    it('produces deterministic results with same seed', () => {
      const plan = planner.createPlan('Build A')
      const r1 = planner.simulatePlan(plan.id, 12345)
      const r2 = planner.simulatePlan(plan.id, 12345)
      expect(r1!.successRate).toBe(r2!.successRate)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §5 — Plan Repair
  // ══════════════════════════════════════════════════════════════════════

  describe('plan repair', () => {
    it('repairs a failed step', () => {
      const plan = planner.createPlan('Build a system')
      const failedStepId = plan.steps[0].id
      const result = planner.repairPlan(plan.id, failedStepId)
      expect(result).not.toBeNull()
      expect(result!.newSteps.length).toBe(2)
    })

    it('marks plan as repaired', () => {
      const plan = planner.createPlan('Build')
      planner.repairPlan(plan.id, plan.steps[0].id)
      expect(planner.getPlan(plan.id)!.status).toBe('repaired')
    })

    it('returns null for non-existent plan', () => {
      expect(planner.repairPlan('bad', 'step')).toBeNull()
    })

    it('returns null for non-existent step', () => {
      const plan = planner.createPlan('Test')
      expect(planner.repairPlan(plan.id, 'bad_step')).toBeNull()
    })

    it('repair adds retry and alternative steps', () => {
      const plan = planner.createPlan('Develop API')
      const result = planner.repairPlan(plan.id, plan.steps[0].id)
      expect(result!.newSteps.some(s => s.action.startsWith('Retry'))).toBe(true)
      expect(result!.newSteps.some(s => s.action.startsWith('Alternative'))).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §6 — Scenario Analysis
  // ══════════════════════════════════════════════════════════════════════

  describe('scenario analysis', () => {
    it('analyzes a negative scenario', () => {
      const plan = planner.createPlan('Build feature')
      const result = planner.analyzeScenario(plan.id, 'API server might fail', 0.3)
      expect(result).not.toBeNull()
      expect(result!.impact).toBeGreaterThan(0)
      expect(result!.riskDelta).toBeGreaterThan(0)
    })

    it('analyzes a positive scenario', () => {
      const plan = planner.createPlan('Build feature')
      const result = planner.analyzeScenario(plan.id, 'New library available', 0.5)
      expect(result).not.toBeNull()
      expect(result!.riskDelta).toBeLessThan(0)
    })

    it('provides plan adjustments', () => {
      const plan = planner.createPlan('Build')
      const result = planner.analyzeScenario(plan.id, 'Delay in deployment', 0.4)
      expect(result!.planAdjustments.length).toBeGreaterThan(0)
    })

    it('returns null for non-existent plan', () => {
      expect(planner.analyzeScenario('bad', 'scenario', 0.5)).toBeNull()
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §7 — Plan Comparison
  // ══════════════════════════════════════════════════════════════════════

  describe('plan comparison', () => {
    it('compares two plans', () => {
      const p1 = planner.createPlan('Develop feature A')
      const p2 = planner.createPlan('Investigate approach B')
      const comparison = planner.comparePlans(p1.id, p2.id)
      expect(comparison).not.toBeNull()
      expect(comparison!.recommendation).toBeTruthy()
    })

    it('returns null for non-existent plans', () => {
      const p1 = planner.createPlan('A')
      expect(planner.comparePlans(p1.id, 'bad')).toBeNull()
      expect(planner.comparePlans('bad', p1.id)).toBeNull()
    })

    it('computes duration delta', () => {
      const p1 = planner.createPlan('Build A')
      const p2 = planner.createPlan('Build B')
      const comparison = planner.comparePlans(p1.id, p2.id)
      expect(typeof comparison!.durationDelta).toBe('number')
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §8 — Resource Estimation
  // ══════════════════════════════════════════════════════════════════════

  describe('resource estimation', () => {
    it('estimates resources for a plan', () => {
      const plan = planner.createPlan('Build feature')
      const resources = planner.estimateResources(plan.id)
      expect(resources.length).toBeGreaterThan(0)
      expect(resources.some(r => r.resource === 'Time')).toBe(true)
    })

    it('returns empty for non-existent plan', () => {
      expect(planner.estimateResources('bad')).toEqual([])
    })

    it('includes critical resource flags', () => {
      const plan = planner.createPlan('Build')
      const resources = planner.estimateResources(plan.id)
      expect(resources.some(r => r.critical !== undefined)).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §9 — Stats
  // ══════════════════════════════════════════════════════════════════════

  describe('stats', () => {
    it('tracks plans created', () => {
      planner.createPlan('A')
      expect(planner.getStats().totalPlansCreated).toBe(1)
    })

    it('tracks simulations run', () => {
      const plan = planner.createPlan('A')
      planner.simulatePlan(plan.id, 42)
      expect(planner.getStats().totalSimulationsRun).toBe(1000)
    })

    it('tracks repairs', () => {
      const plan = planner.createPlan('A')
      planner.repairPlan(plan.id, plan.steps[0].id)
      expect(planner.getStats().totalRepairs).toBe(1)
    })

    it('tracks comparisons', () => {
      const p1 = planner.createPlan('A')
      const p2 = planner.createPlan('B')
      planner.comparePlans(p1.id, p2.id)
      expect(planner.getStats().totalComparisons).toBe(1)
    })

    it('computes average plan steps', () => {
      planner.createPlan('Build A')
      expect(planner.getStats().avgPlanSteps).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §10 — Serialization
  // ══════════════════════════════════════════════════════════════════════

  describe('serialization', () => {
    it('serializes to JSON', () => {
      planner.createPlan('Test')
      const json = planner.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('deserializes from JSON', () => {
      planner.createPlan('Persistent')
      const json = planner.serialize()
      const restored = StrategicPlanner.deserialize(json)
      expect(restored.getAllPlans().length).toBe(1)
    })

    it('handles invalid JSON gracefully', () => {
      const restored = StrategicPlanner.deserialize('bad json')
      expect(restored).toBeInstanceOf(StrategicPlanner)
    })
  })
})
