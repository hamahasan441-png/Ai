/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  StrategicPlanner — Long-horizon planning with contingency & evaluation    ║
 * ║                                                                            ║
 * ║  Creates multi-step strategic plans with look-ahead, branching             ║
 * ║  contingency paths, resource estimation, plan repair, and Monte Carlo      ║
 * ║  plan evaluation for robust decision-making under uncertainty.             ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Multi-step plan generation from high-level objectives                 ║
 * ║    • Contingency branching (if-then-else plan trees)                       ║
 * ║    • Resource estimation and allocation                                    ║
 * ║    • Plan evaluation via Monte Carlo simulation                            ║
 * ║    • Plan repair when steps fail or conditions change                      ║
 * ║    • What-if scenario analysis                                             ║
 * ║    • Plan comparison and selection                                         ║
 * ║    • Risk-adjusted plan scoring                                            ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PlanStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'

export interface StrategicStep {
  readonly id: string
  readonly action: string
  readonly description: string
  readonly estimatedDuration: number   // minutes
  readonly estimatedCost: number       // 0-1 relative
  readonly dependencies: string[]
  readonly riskLevel: number           // 0-1
  readonly successProbability: number  // 0-1
  status: PlanStepStatus
  readonly contingencyStepIds: string[] // fallback steps if this fails
}

export interface ContingencyBranch {
  readonly id: string
  readonly condition: string
  readonly probability: number
  readonly steps: StrategicStep[]
}

export interface StrategicPlan {
  readonly id: string
  readonly objective: string
  readonly steps: StrategicStep[]
  readonly contingencies: ContingencyBranch[]
  readonly totalEstimatedDuration: number
  readonly totalEstimatedCost: number
  readonly overallSuccessProbability: number
  readonly riskScore: number
  readonly createdAt: number
  status: 'draft' | 'active' | 'completed' | 'failed' | 'repaired'
}

export interface MonteCarloResult {
  readonly planId: string
  readonly simulations: number
  readonly successRate: number
  readonly avgDuration: number
  readonly avgCost: number
  readonly worstCaseDuration: number
  readonly bestCaseDuration: number
  readonly percentile95Duration: number
  readonly riskDistribution: Record<string, number>
}

export interface PlanRepairResult {
  readonly planId: string
  readonly failedStepId: string
  readonly repairStrategy: string
  readonly newSteps: StrategicStep[]
  readonly confidenceAfterRepair: number
}

export interface ScenarioAnalysis {
  readonly scenario: string
  readonly probability: number
  readonly impact: number
  readonly planAdjustments: string[]
  readonly riskDelta: number
}

export interface PlanComparison {
  readonly plan1Id: string
  readonly plan2Id: string
  readonly durationDelta: number
  readonly costDelta: number
  readonly riskDelta: number
  readonly successDelta: number
  readonly recommendation: string
}

export interface ResourceEstimate {
  readonly resource: string
  readonly amount: number
  readonly unit: string
  readonly critical: boolean
}

export interface StrategicPlannerConfig {
  readonly maxStepsPerPlan: number
  readonly maxContingencies: number
  readonly monteCarloSimulations: number
  readonly maxPlans: number
  readonly riskTolerance: number  // 0-1
  readonly maxScenarios: number
}

export interface StrategicPlannerStats {
  readonly totalPlansCreated: number
  readonly totalSimulationsRun: number
  readonly totalRepairs: number
  readonly totalComparisons: number
  readonly avgPlanSteps: number
  readonly avgSuccessRate: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_STRATEGIC_PLANNER_CONFIG: StrategicPlannerConfig = {
  maxStepsPerPlan: 30,
  maxContingencies: 10,
  monteCarloSimulations: 1000,
  maxPlans: 50,
  riskTolerance: 0.3,
  maxScenarios: 20,
}

/** Action templates for common objectives. */
const ACTION_TEMPLATES: Record<string, Array<{ action: string; duration: number; risk: number; success: number }>> = {
  develop: [
    { action: 'Requirements analysis', duration: 60, risk: 0.1, success: 0.95 },
    { action: 'Architecture design', duration: 120, risk: 0.2, success: 0.9 },
    { action: 'Core implementation', duration: 480, risk: 0.3, success: 0.85 },
    { action: 'Testing & validation', duration: 240, risk: 0.15, success: 0.9 },
    { action: 'Documentation', duration: 60, risk: 0.05, success: 0.95 },
    { action: 'Deployment', duration: 120, risk: 0.25, success: 0.88 },
  ],
  investigate: [
    { action: 'Define scope', duration: 30, risk: 0.1, success: 0.95 },
    { action: 'Data collection', duration: 120, risk: 0.2, success: 0.9 },
    { action: 'Analysis', duration: 180, risk: 0.25, success: 0.85 },
    { action: 'Hypothesis testing', duration: 120, risk: 0.3, success: 0.8 },
    { action: 'Conclusions & report', duration: 60, risk: 0.1, success: 0.92 },
  ],
  optimize: [
    { action: 'Baseline measurement', duration: 60, risk: 0.1, success: 0.95 },
    { action: 'Bottleneck identification', duration: 90, risk: 0.15, success: 0.9 },
    { action: 'Optimization implementation', duration: 240, risk: 0.3, success: 0.8 },
    { action: 'A/B comparison', duration: 60, risk: 0.1, success: 0.9 },
    { action: 'Rollout', duration: 120, risk: 0.2, success: 0.88 },
  ],
  migrate: [
    { action: 'Inventory assessment', duration: 60, risk: 0.1, success: 0.95 },
    { action: 'Compatibility analysis', duration: 120, risk: 0.2, success: 0.88 },
    { action: 'Migration planning', duration: 90, risk: 0.15, success: 0.9 },
    { action: 'Staged migration', duration: 360, risk: 0.35, success: 0.82 },
    { action: 'Validation & rollback prep', duration: 120, risk: 0.1, success: 0.92 },
    { action: 'Cutover', duration: 60, risk: 0.3, success: 0.85 },
  ],
  default: [
    { action: 'Planning', duration: 60, risk: 0.1, success: 0.95 },
    { action: 'Execution', duration: 240, risk: 0.25, success: 0.85 },
    { action: 'Verification', duration: 60, risk: 0.1, success: 0.9 },
    { action: 'Completion', duration: 30, risk: 0.05, success: 0.95 },
  ],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function classifyObjective(text: string): string {
  const lower = text.toLowerCase()
  if (/\b(develop|build|create|implement|write)\b/.test(lower)) return 'develop'
  if (/\b(investigate|research|analyze|study|examine)\b/.test(lower)) return 'investigate'
  if (/\b(optimize|improve|speed|enhance|performance)\b/.test(lower)) return 'optimize'
  if (/\b(migrate|upgrade|move|transition|port)\b/.test(lower)) return 'migrate'
  return 'default'
}

/** Simple seeded PRNG for reproducible simulations. */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class StrategicPlanner {
  private readonly config: StrategicPlannerConfig
  private readonly plans: Map<string, StrategicPlan> = new Map()
  private stats = {
    totalPlans: 0,
    totalSims: 0,
    totalRepairs: 0,
    totalComparisons: 0,
    totalSteps: 0,
    totalSuccessRate: 0,
    planCount: 0,
  }

  constructor(config: Partial<StrategicPlannerConfig> = {}) {
    this.config = { ...DEFAULT_STRATEGIC_PLANNER_CONFIG, ...config }
  }

  // ── Plan creation ──────────────────────────────────────────────────────

  /** Create a strategic plan for an objective. */
  createPlan(objective: string): StrategicPlan {
    const type = classifyObjective(objective)
    const templates = ACTION_TEMPLATES[type] ?? ACTION_TEMPLATES['default']

    const steps: StrategicStep[] = []
    let prevId: string | null = null

    for (const template of templates.slice(0, this.config.maxStepsPerPlan)) {
      const step: StrategicStep = {
        id: generateId('step'),
        action: template.action,
        description: `${template.action} for: ${objective}`,
        estimatedDuration: template.duration,
        estimatedCost: template.duration / 1000,
        dependencies: prevId ? [prevId] : [],
        riskLevel: template.risk,
        successProbability: template.success,
        status: 'pending',
        contingencyStepIds: [],
      }
      steps.push(step)
      prevId = step.id
    }

    const totalDuration = steps.reduce((s, st) => s + st.estimatedDuration, 0)
    const totalCost = steps.reduce((s, st) => s + st.estimatedCost, 0)
    const overallSuccess = steps.reduce((p, st) => p * st.successProbability, 1)
    const riskScore = steps.reduce((s, st) => s + st.riskLevel, 0) / Math.max(steps.length, 1)

    const plan: StrategicPlan = {
      id: generateId('plan'),
      objective,
      steps,
      contingencies: [],
      totalEstimatedDuration: totalDuration,
      totalEstimatedCost: totalCost,
      overallSuccessProbability: overallSuccess,
      riskScore,
      createdAt: Date.now(),
      status: 'draft',
    }

    this.plans.set(plan.id, plan)
    this.stats.totalPlans++
    this.stats.totalSteps += steps.length
    this.stats.totalSuccessRate += overallSuccess
    this.stats.planCount++

    // Enforce max plans
    if (this.plans.size > this.config.maxPlans) {
      const oldest = [...this.plans.entries()].sort(([, a], [, b]) => a.createdAt - b.createdAt)[0]
      if (oldest) this.plans.delete(oldest[0])
    }

    return plan
  }

  /** Get a plan by ID. */
  getPlan(planId: string): StrategicPlan | null {
    return this.plans.get(planId) ?? null
  }

  /** Get all plans. */
  getAllPlans(): readonly StrategicPlan[] {
    return [...this.plans.values()]
  }

  // ── Contingency planning ───────────────────────────────────────────────

  /** Add a contingency branch to a plan. */
  addContingency(planId: string, condition: string, probability: number): ContingencyBranch | null {
    const plan = this.plans.get(planId)
    if (!plan) return null
    if (plan.contingencies.length >= this.config.maxContingencies) return null

    const branch: ContingencyBranch = {
      id: generateId('cont'),
      condition,
      probability: clamp(probability, 0, 1),
      steps: [
        {
          id: generateId('step'),
          action: `Handle: ${condition}`,
          description: `Contingency response for: ${condition}`,
          estimatedDuration: 60,
          estimatedCost: 0.1,
          dependencies: [],
          riskLevel: 0.3,
          successProbability: 0.8,
          status: 'pending',
          contingencyStepIds: [],
        },
      ],
    }

    ;(plan.contingencies as ContingencyBranch[]).push(branch)
    return branch
  }

  // ── Monte Carlo simulation ─────────────────────────────────────────────

  /** Run Monte Carlo simulation on a plan to evaluate robustness. */
  simulatePlan(planId: string, seed?: number): MonteCarloResult | null {
    const plan = this.plans.get(planId)
    if (!plan) return null

    const numSims = this.config.monteCarloSimulations
    const rng = seededRandom(seed ?? Date.now())
    const durations: number[] = []
    const costs: number[] = []
    let successes = 0
    const riskCounts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }

    for (let i = 0; i < numSims; i++) {
      let totalDuration = 0
      let totalCost = 0
      let planSucceeded = true

      for (const step of plan.steps) {
        // Simulate step outcome
        const succeeded = rng() < step.successProbability
        if (!succeeded) {
          // Check contingency
          const hasFallback = step.contingencyStepIds.length > 0
          if (!hasFallback) {
            planSucceeded = false
            break
          }
          totalDuration += step.estimatedDuration * 1.5 // contingency adds time
          totalCost += step.estimatedCost * 1.3
        } else {
          // Add random variance (-20% to +50%)
          const variance = 0.8 + rng() * 0.7
          totalDuration += step.estimatedDuration * variance
          totalCost += step.estimatedCost * (0.9 + rng() * 0.3)
        }
      }

      if (planSucceeded) successes++
      durations.push(totalDuration)
      costs.push(totalCost)

      const maxRisk = Math.max(...plan.steps.map(s => s.riskLevel))
      if (maxRisk >= 0.7) riskCounts['critical']++
      else if (maxRisk >= 0.5) riskCounts['high']++
      else if (maxRisk >= 0.3) riskCounts['medium']++
      else riskCounts['low']++
    }

    durations.sort((a, b) => a - b)
    this.stats.totalSims += numSims

    return {
      planId,
      simulations: numSims,
      successRate: successes / numSims,
      avgDuration: durations.reduce((s, d) => s + d, 0) / numSims,
      avgCost: costs.reduce((s, c) => s + c, 0) / numSims,
      worstCaseDuration: durations[durations.length - 1] ?? 0,
      bestCaseDuration: durations[0] ?? 0,
      percentile95Duration: durations[Math.floor(numSims * 0.95)] ?? 0,
      riskDistribution: Object.fromEntries(
        Object.entries(riskCounts).map(([k, v]) => [k, v / numSims])
      ),
    }
  }

  // ── Plan repair ────────────────────────────────────────────────────────

  /** Repair a plan when a step has failed. */
  repairPlan(planId: string, failedStepId: string): PlanRepairResult | null {
    const plan = this.plans.get(planId)
    if (!plan) return null

    const failedStep = plan.steps.find(s => s.id === failedStepId)
    if (!failedStep) return null

    failedStep.status = 'failed'

    // Create repair steps
    const repairStep: StrategicStep = {
      id: generateId('step'),
      action: `Retry: ${failedStep.action}`,
      description: `Repair attempt for failed step: ${failedStep.action}`,
      estimatedDuration: failedStep.estimatedDuration * 0.7,
      estimatedCost: failedStep.estimatedCost * 0.5,
      dependencies: failedStep.dependencies,
      riskLevel: failedStep.riskLevel * 1.2,
      successProbability: failedStep.successProbability * 0.9,
      status: 'pending',
      contingencyStepIds: [],
    }

    const altStep: StrategicStep = {
      id: generateId('step'),
      action: `Alternative approach: ${failedStep.action}`,
      description: `Alternative strategy for: ${failedStep.action}`,
      estimatedDuration: failedStep.estimatedDuration * 1.2,
      estimatedCost: failedStep.estimatedCost * 0.8,
      dependencies: failedStep.dependencies,
      riskLevel: failedStep.riskLevel * 0.8,
      successProbability: failedStep.successProbability * 0.85,
      status: 'pending',
      contingencyStepIds: [],
    }

    ;(plan.steps as StrategicStep[]).push(repairStep, altStep)
    plan.status = 'repaired'
    this.stats.totalRepairs++

    return {
      planId,
      failedStepId,
      repairStrategy: `Added retry and alternative approach for: ${failedStep.action}`,
      newSteps: [repairStep, altStep],
      confidenceAfterRepair: 0.7 * failedStep.successProbability,
    }
  }

  // ── Scenario analysis ──────────────────────────────────────────────────

  /** Analyze a what-if scenario against a plan. */
  analyzeScenario(planId: string, scenario: string, probability: number): ScenarioAnalysis | null {
    const plan = this.plans.get(planId)
    if (!plan) return null

    const lower = scenario.toLowerCase()
    const isNegative = /\b(fail|delay|block|miss|lose|break|crash)\b/.test(lower)
    const impact = isNegative ? clamp(probability * 0.8, 0, 1) : clamp(probability * 0.3, 0, 1)

    const adjustments: string[] = []
    if (isNegative) {
      adjustments.push('Add buffer time to affected steps')
      adjustments.push('Prepare fallback resources')
      if (probability > 0.5) adjustments.push('Consider alternative approach')
    } else {
      adjustments.push('Accelerate dependent steps')
      adjustments.push('Reallocate saved resources')
    }

    const riskDelta = isNegative ? probability * 0.2 : -probability * 0.1

    return {
      scenario,
      probability: clamp(probability, 0, 1),
      impact,
      planAdjustments: adjustments,
      riskDelta,
    }
  }

  // ── Plan comparison ────────────────────────────────────────────────────

  /** Compare two plans and recommend the better one. */
  comparePlans(planId1: string, planId2: string): PlanComparison | null {
    const p1 = this.plans.get(planId1)
    const p2 = this.plans.get(planId2)
    if (!p1 || !p2) return null

    this.stats.totalComparisons++

    const durationDelta = p1.totalEstimatedDuration - p2.totalEstimatedDuration
    const costDelta = p1.totalEstimatedCost - p2.totalEstimatedCost
    const riskDelta = p1.riskScore - p2.riskScore
    const successDelta = p1.overallSuccessProbability - p2.overallSuccessProbability

    // Score: lower duration, lower cost, lower risk, higher success
    const score1 = -durationDelta / 100 - costDelta - riskDelta + successDelta
    const recommendation = score1 > 0
      ? `Plan 1 ("${p1.objective.slice(0, 40)}") is recommended`
      : score1 < 0
        ? `Plan 2 ("${p2.objective.slice(0, 40)}") is recommended`
        : 'Both plans are roughly equivalent'

    return {
      plan1Id: planId1,
      plan2Id: planId2,
      durationDelta,
      costDelta,
      riskDelta,
      successDelta,
      recommendation,
    }
  }

  // ── Resource estimation ────────────────────────────────────────────────

  /** Estimate resources needed for a plan. */
  estimateResources(planId: string): ResourceEstimate[] {
    const plan = this.plans.get(planId)
    if (!plan) return []

    return [
      { resource: 'Time', amount: plan.totalEstimatedDuration, unit: 'minutes', critical: true },
      { resource: 'Cognitive effort', amount: plan.steps.length * 15, unit: 'minutes', critical: false },
      { resource: 'Risk budget', amount: plan.riskScore * 100, unit: 'percent', critical: plan.riskScore > this.config.riskTolerance },
      { resource: 'Contingency buffer', amount: plan.contingencies.length * 30, unit: 'minutes', critical: plan.contingencies.length === 0 },
    ]
  }

  // ── Stats ──────────────────────────────────────────────────────────────

  getStats(): Readonly<StrategicPlannerStats> {
    return {
      totalPlansCreated: this.stats.totalPlans,
      totalSimulationsRun: this.stats.totalSims,
      totalRepairs: this.stats.totalRepairs,
      totalComparisons: this.stats.totalComparisons,
      avgPlanSteps: this.stats.planCount > 0 ? this.stats.totalSteps / this.stats.planCount : 0,
      avgSuccessRate: this.stats.planCount > 0 ? this.stats.totalSuccessRate / this.stats.planCount : 0,
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      plans: [...this.plans.values()],
      stats: this.stats,
    })
  }

  static deserialize(json: string, config?: Partial<StrategicPlannerConfig>): StrategicPlanner {
    const engine = new StrategicPlanner(config)
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.plans)) {
        for (const p of data.plans) engine.plans.set(p.id, p)
      }
      if (data.stats) Object.assign(engine.stats, data.stats)
    } catch { /* fresh engine on failure */ }
    return engine
  }
}
