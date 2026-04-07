/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          📋  P L A N N I N G   E N G I N E                                  ║
 * ║                                                                             ║
 * ║   Goal-directed planning with multi-phase intelligence:                     ║
 * ║     decompose → sequence → optimise → adapt                                 ║
 * ║                                                                             ║
 * ║     • Plan creation from natural-language goals                             ║
 * ║     • Dependency graph construction & cycle detection                       ║
 * ║     • Critical-path analysis for schedule optimisation                      ║
 * ║     • Risk assessment & alternative-path generation                         ║
 * ║     • Plan merging with conflict resolution                                 ║
 * ║     • Pre-built templates for common software tasks                         ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface PlanningEngineConfig {
  maxPlanDepth: number;
  maxAlternatives: number;
  planningTimeout: number;
  maxStepsPerPlan: number;
  riskThreshold: number;
  enableTemplates: boolean;
}

export interface PlanningEngineStats {
  totalPlansCreated: number;
  totalOptimisations: number;
  totalAdaptations: number;
  avgConfidence: number;
  avgStepsPerPlan: number;
  templateUsageCount: number;
}

export interface Goal {
  id: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  preconditions: string[];
  successCriteria: string[];
  deadline?: number;
}

export interface PlanStep {
  id: string;
  action: string;
  description: string;
  estimatedEffort: number;
  dependencies: string[];
  risks: string[];
  alternatives: string[];
}

export interface Plan {
  id: string;
  goal: Goal;
  steps: PlanStep[];
  estimatedTotalEffort: number;
  confidence: number;
  risks: string[];
  assumptions: string[];
  createdAt: number;
}

export interface PlanEvaluation {
  feasibility: number;
  completeness: number;
  efficiency: number;
  risks: string[];
  overallScore: number;
}

export interface ResourceConstraint {
  type: string;
  amount: number;
  available: number;
}

export interface PlanOptimization {
  originalPlan: Plan;
  optimizedPlan: Plan;
  improvements: string[];
  effortReduction: number;
  riskReduction: number;
}

export interface Milestone {
  id: string;
  name: string;
  stepIds: string[];
  completionCriteria: string;
  estimatedCompletion: number;
}

export interface DependencyGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
  adjacency: Record<string, string[]>;
  inDegree: Record<string, number>;
}

export interface PlanComparison {
  plans: Plan[];
  rankings: Array<{ planId: string; score: number; strengths: string[]; weaknesses: string[] }>;
  recommendation: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: PlanningEngineConfig = {
  maxPlanDepth: 5,
  maxAlternatives: 3,
  planningTimeout: 30_000,
  maxStepsPerPlan: 30,
  riskThreshold: 0.7,
  enableTemplates: true,
};

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'has',
  'was', 'one', 'our', 'out', 'had', 'with', 'this', 'that', 'from',
  'they', 'been', 'have', 'will', 'each', 'make', 'like', 'into', 'then',
  'them', 'than', 'some', 'what', 'when', 'were', 'said', 'does',
]);

// ── Task Classification Keywords ────────────────────────────────────────────

const TASK_TYPE_KEYWORDS: Record<string, string[]> = {
  feature: ['feature', 'add', 'implement', 'create', 'build', 'develop', 'new', 'introduce'],
  bugfix: ['fix', 'bug', 'error', 'broken', 'crash', 'issue', 'repair', 'patch', 'resolve'],
  refactor: ['refactor', 'restructure', 'clean', 'improve', 'simplify', 'reorganise', 'reorganize', 'extract', 'decouple'],
  deploy: ['deploy', 'release', 'ship', 'publish', 'launch', 'rollout', 'production', 'staging'],
  migration: ['migrate', 'upgrade', 'convert', 'move', 'transfer', 'transition', 'port', 'update'],
  test: ['test', 'testing', 'coverage', 'spec', 'assertion', 'validate', 'verify'],
  documentation: ['document', 'docs', 'readme', 'guide', 'tutorial', 'api-doc', 'comment'],
  performance: ['performance', 'optimise', 'optimize', 'speed', 'latency', 'throughput', 'cache', 'bottleneck'],
};

// ── Planning Templates ──────────────────────────────────────────────────────

interface PlanTemplate {
  taskType: string;
  steps: Array<{ action: string; description: string; effort: number; risks: string[] }>;
  assumptions: string[];
  riskProfile: string[];
}

const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    taskType: 'feature',
    steps: [
      { action: 'analyse_requirements', description: 'Gather and analyse feature requirements', effort: 2, risks: ['Ambiguous requirements'] },
      { action: 'design_solution', description: 'Design technical approach and interfaces', effort: 3, risks: ['Over-engineering'] },
      { action: 'implement_core', description: 'Implement core feature logic', effort: 5, risks: ['Integration issues', 'Scope creep'] },
      { action: 'write_tests', description: 'Write unit and integration tests', effort: 3, risks: ['Insufficient coverage'] },
      { action: 'code_review', description: 'Conduct peer code review', effort: 1, risks: ['Review delays'] },
      { action: 'integration_test', description: 'Run full integration test suite', effort: 2, risks: ['Environment issues'] },
      { action: 'documentation', description: 'Update documentation and changelog', effort: 1, risks: ['Documentation drift'] },
    ],
    assumptions: ['Requirements are well-defined', 'Development environment is stable'],
    riskProfile: ['Scope creep', 'Integration complexity', 'Insufficient testing'],
  },
  {
    taskType: 'bugfix',
    steps: [
      { action: 'reproduce_bug', description: 'Reproduce the bug in a controlled environment', effort: 1, risks: ['Cannot reproduce'] },
      { action: 'root_cause_analysis', description: 'Identify root cause through debugging', effort: 3, risks: ['Complex causation chain'] },
      { action: 'implement_fix', description: 'Implement a minimal, targeted fix', effort: 2, risks: ['Side effects'] },
      { action: 'regression_test', description: 'Run regression tests', effort: 2, risks: ['Incomplete regression suite'] },
      { action: 'verify_fix', description: 'Verify fix resolves original issue', effort: 1, risks: ['Partial fix'] },
    ],
    assumptions: ['Bug is reproducible', 'Relevant logs are available', 'Test suite exists'],
    riskProfile: ['Regression introduction', 'Incomplete root cause'],
  },
  {
    taskType: 'refactor',
    steps: [
      { action: 'identify_targets', description: 'Identify code areas needing refactoring', effort: 2, risks: ['Scope ambiguity'] },
      { action: 'ensure_test_coverage', description: 'Ensure adequate test coverage before changes', effort: 3, risks: ['Missing edge-case tests'] },
      { action: 'refactor_step', description: 'Execute refactoring in small, verified steps', effort: 5, risks: ['Breaking changes'] },
      { action: 'run_full_suite', description: 'Run full test suite after each step', effort: 2, risks: ['Slow feedback loop'] },
      { action: 'update_documentation', description: 'Update architecture and API docs', effort: 1, risks: ['Stale docs'] },
    ],
    assumptions: ['Code has test coverage', 'Clear refactoring goals'],
    riskProfile: ['Breaking existing behaviour', 'Scope expansion', 'Performance regression'],
  },
  {
    taskType: 'deploy',
    steps: [
      { action: 'pre_deploy_checks', description: 'Run pre-deployment checks and validations', effort: 1, risks: ['Missed configuration'] },
      { action: 'build_artefacts', description: 'Build deployment artefacts', effort: 1, risks: ['Build failure'] },
      { action: 'staging_deploy', description: 'Deploy to staging and validate', effort: 2, risks: ['Environment differences'] },
      { action: 'production_deploy', description: 'Deploy to production with rollback plan', effort: 1, risks: ['Deployment failure'] },
      { action: 'post_deploy_monitoring', description: 'Monitor production metrics post-deploy', effort: 2, risks: ['Delayed failure detection'] },
    ],
    assumptions: ['CI/CD pipeline is configured', 'Staging mirrors production'],
    riskProfile: ['Downtime', 'Data loss', 'Configuration drift'],
  },
  {
    taskType: 'migration',
    steps: [
      { action: 'audit_current_state', description: 'Audit current system state and dependencies', effort: 3, risks: ['Undocumented dependencies'] },
      { action: 'plan_migration_path', description: 'Define migration strategy and phases', effort: 2, risks: ['Incompatible changes'] },
      { action: 'setup_compatibility_layer', description: 'Build compatibility/adapter layer', effort: 3, risks: ['Performance overhead'] },
      { action: 'migrate_incrementally', description: 'Migrate components incrementally', effort: 5, risks: ['Partial failure'] },
      { action: 'validate_migration', description: 'Validate migrated components and run full suite', effort: 3, risks: ['Missed validation cases'] },
    ],
    assumptions: ['Migration path is identified', 'Rollback plan exists'],
    riskProfile: ['Data loss', 'Extended downtime', 'Feature parity gaps'],
  },
];

// ── Risk Heuristics ─────────────────────────────────────────────────────────

const RISK_KEYWORDS: Record<string, number> = {
  database: 0.3, production: 0.4, security: 0.4, migration: 0.3, breaking: 0.5,
  concurrent: 0.3, distributed: 0.4, legacy: 0.3, performance: 0.2, scale: 0.3,
  deadline: 0.2, complex: 0.2, critical: 0.4, data: 0.3, third_party: 0.3,
  dependency: 0.2, network: 0.3, async: 0.2,
};

const COMPLEXITY_KEYWORDS: Record<string, number> = {
  simple: 1, basic: 1, straightforward: 1, moderate: 3, standard: 2,
  complex: 5, advanced: 5, sophisticated: 5, critical: 7, distributed: 7,
  concurrent: 6, enterprise: 8, massive: 8, large_scale: 8,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function _simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function keywordOverlap(a: string, b: string): number {
  const kwA = new Set(extractKeywords(a));
  const kwB = new Set(extractKeywords(b));
  if (kwA.size === 0 || kwB.size === 0) return 0;
  let overlap = 0;
  for (const w of kwA) { if (kwB.has(w)) overlap++; }
  return overlap / Math.max(kwA.size, kwB.size);
}

// ── PlanningEngine ──────────────────────────────────────────────────────────

export class PlanningEngine {
  private readonly config: PlanningEngineConfig;
  private totalPlansCreated = 0;
  private totalOptimisations = 0;
  private totalAdaptations = 0;
  private confidenceHistory: number[] = [];
  private stepsHistory: number[] = [];
  private templateUsageCount = 0;

  constructor(config?: Partial<PlanningEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /** Create a plan to achieve a natural-language goal. */
  createPlan(goal: string, constraints?: string[]): Plan {
    const parsedGoal = this.parseGoal(goal, constraints);
    const taskType = this.classifyTaskType(goal);
    const template = this.config.enableTemplates ? this.findTemplate(taskType) : undefined;

    let steps: PlanStep[];
    let assumptions: string[];
    let risks: string[];

    if (template) {
      this.templateUsageCount++;
      steps = this.instantiateTemplate(template, parsedGoal);
      assumptions = [...template.assumptions];
      risks = [...template.riskProfile];
    } else {
      steps = this.generateStepsFromGoal(parsedGoal);
      assumptions = this.inferAssumptions(parsedGoal);
      risks = this.assessGoalRisks(parsedGoal);
    }

    if (constraints) { steps = this.applyConstraints(steps, constraints); risks.push(...this.constraintRisks(constraints)); }
    steps = steps.slice(0, this.config.maxStepsPerPlan);

    const totalEffort = steps.reduce((sum, s) => sum + s.estimatedEffort, 0);
    const confidence = this.computePlanConfidence(steps, parsedGoal, risks);
    const plan: Plan = {
      id: generateId('plan'), goal: parsedGoal, steps, estimatedTotalEffort: totalEffort,
      confidence: round2(confidence), risks: [...new Set(risks)],
      assumptions: [...new Set(assumptions)], createdAt: Date.now(),
    };

    this.totalPlansCreated++;
    this.confidenceHistory.push(plan.confidence);
    this.stepsHistory.push(steps.length);
    return plan;
  }

  /** Decompose a plan into more granular sub-plans up to a given depth. */
  decomposePlan(plan: Plan, depth: number = 1): Plan {
    if (depth <= 0 || depth > this.config.maxPlanDepth) return plan;
    const decomposed = plan.steps.flatMap((step) => this.decomposeStep(step, depth));
    const trimmed = decomposed.slice(0, this.config.maxStepsPerPlan);
    return { ...plan, id: generateId('plan'), steps: trimmed,
      estimatedTotalEffort: trimmed.reduce((s, st) => s + st.estimatedEffort, 0) };
  }

  /** Evaluate a plan's feasibility, completeness, efficiency, and risks. */
  evaluatePlan(plan: Plan): PlanEvaluation {
    const f = this.scoreFeasibility(plan);
    const c = this.scoreCompleteness(plan);
    const e = this.scoreEfficiency(plan);
    return { feasibility: round2(f), completeness: round2(c), efficiency: round2(e),
      risks: this.identifyPlanRisks(plan), overallScore: round2(f * 0.35 + c * 0.35 + e * 0.3) };
  }

  /** Optimise a plan by reducing effort, risk, or improving ordering. */
  optimizePlan(plan: Plan, criteria?: string[]): PlanOptimization {
    const active = criteria ?? ['effort', 'risk', 'parallelism'];
    let optimized = this.clonePlan(plan);
    const improvements: string[] = [];

    const strategies: Record<string, (p: Plan) => { plan: Plan; improvements: string[] }> = {
      effort: (p) => this.optimiseEffort(p),
      risk: (p) => this.optimiseRisk(p),
      parallelism: (p) => this.optimiseParallelism(p),
      ordering: (p) => this.optimiseOrdering(p),
    };

    for (const criterion of active) {
      const fn = strategies[criterion];
      if (fn) { const r = fn(optimized); optimized = r.plan; improvements.push(...r.improvements); }
    }

    const effortRed = plan.estimatedTotalEffort > 0
      ? (plan.estimatedTotalEffort - optimized.estimatedTotalEffort) / plan.estimatedTotalEffort : 0;
    const riskRed = plan.risks.length > 0
      ? (plan.risks.length - optimized.risks.length) / plan.risks.length : 0;

    this.totalOptimisations++;
    return {
      originalPlan: plan, optimizedPlan: optimized,
      improvements: improvements.length > 0 ? improvements : ['No further optimisations identified'],
      effortReduction: clamp(round2(effortRed), 0, 1),
      riskReduction: clamp(round2(riskRed), 0, 1),
    };
  }

  /** Find alternative approaches when a step in the plan fails. */
  findAlternatives(plan: Plan, failedStepId: string): Plan[] {
    const failedStep = plan.steps.find((s) => s.id === failedStepId);
    if (!failedStep) return [];

    const alternatives: Plan[] = [];
    const maxAlts = this.config.maxAlternatives;

    // Strategy 1: Use the step's built-in alternatives
    for (const alt of failedStep.alternatives.slice(0, maxAlts)) {
      const newSteps = plan.steps.map((s) =>
        s.id === failedStepId
          ? { ...s, id: generateId('step'), action: alt, description: `Alternative: ${alt}`, risks: [...s.risks, 'Untested alternative'] }
          : s,
      );
      alternatives.push(this.buildPlanFromSteps(plan.goal, newSteps));
    }

    // Strategy 2: Decompose the failed step into smaller steps
    if (alternatives.length < maxAlts) {
      const subSteps = this.decomposeStep(failedStep, 1);
      if (subSteps.length > 1) {
        const newSteps = plan.steps.flatMap((s) => (s.id === failedStepId ? subSteps : [s]));
        alternatives.push(this.buildPlanFromSteps(plan.goal, newSteps));
      }
    }

    // Strategy 3: Remove the step if it has no dependents, else simplify
    if (alternatives.length < maxAlts) {
      const workaround = this.generateWorkaround(plan, failedStep);
      if (workaround) alternatives.push(workaround);
    }

    return alternatives.slice(0, maxAlts);
  }

  /** Build a dependency graph from plan steps. */
  buildDependencyGraph(steps: PlanStep[]): DependencyGraph {
    const nodes = steps.map((s) => s.id);
    const edges: Array<{ from: string; to: string }> = [];
    const adjacency: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    const idSet = new Set(nodes);
    for (const n of nodes) { adjacency[n] = []; inDegree[n] = 0; }
    for (const step of steps) {
      for (const dep of step.dependencies) {
        if (idSet.has(dep) && dep !== step.id) {
          edges.push({ from: dep, to: step.id });
          adjacency[dep].push(step.id);
          inDegree[step.id]++;
        }
      }
    }
    return { nodes, edges, adjacency, inDegree };
  }

  /** Detect circular dependencies in a dependency graph. Returns cycles found. */
  detectCycles(graph: DependencyGraph): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string): void => {
      visited.add(node); inStack.add(node); path.push(node);
      for (const nb of graph.adjacency[node] ?? []) {
        if (!visited.has(nb)) { dfs(nb); }
        else if (inStack.has(nb)) {
          const start = path.indexOf(nb);
          if (start >= 0) cycles.push(path.slice(start).concat(nb));
        }
      }
      path.pop(); inStack.delete(node);
    };

    for (const node of graph.nodes) { if (!visited.has(node)) dfs(node); }
    return cycles;
  }

  /** Find the critical path — the longest sequence of dependent steps. */
  criticalPath(plan: Plan): PlanStep[] {
    const graph = this.buildDependencyGraph(plan.steps);
    if (this.detectCycles(graph).length > 0) return plan.steps;

    const stepMap = new Map(plan.steps.map((s) => [s.id, s]));
    const order = this.topologicalSort(graph);
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    for (const id of graph.nodes) { dist[id] = 0; prev[id] = null; }

    for (const id of order) {
      const step = stepMap.get(id);
      if (!step) continue;
      for (const nb of graph.adjacency[id] ?? []) {
        const d = dist[id] + step.estimatedEffort;
        if (d > dist[nb]) { dist[nb] = d; prev[nb] = id; }
      }
    }

    let end = graph.nodes[0] ?? '';
    for (const id of graph.nodes) { if (dist[id] > dist[end]) end = id; }

    const critical: PlanStep[] = [];
    let cur: string | null = end;
    while (cur !== null) { const s = stepMap.get(cur); if (s) critical.unshift(s); cur = prev[cur]; }
    return critical;
  }

  /** Adapt a plan to changed conditions by re-evaluating and adjusting steps. */
  adaptPlan(plan: Plan, changedConditions: string[]): Plan {
    this.totalAdaptations++;
    const adapted = this.clonePlan(plan);
    const conditionText = changedConditions.join(' ').toLowerCase();

    // Adjust steps affected by the changed conditions
    for (const step of adapted.steps) {
      const stepText = `${step.action} ${step.description}`.toLowerCase();
      if (keywordOverlap(stepText, conditionText) > 0.1) {
        step.estimatedEffort = Math.ceil(step.estimatedEffort * 1.3);
        step.risks.push('Affected by changed conditions');
        step.description = `[Adapted] ${step.description}`;
      }
    }

    // Add mitigation steps for each changed condition
    for (const condition of changedConditions) {
      const mitigation = this.generateMitigationStep(condition);
      if (mitigation) adapted.steps.push(mitigation);
    }

    if (changedConditions.length > 2) {
      adapted.steps.push({
        id: generateId('step'),
        action: 'reassess_plan',
        description: 'Reassess overall plan due to multiple condition changes',
        estimatedEffort: 2,
        dependencies: [],
        risks: ['Plan may need full revision'],
        alternatives: ['Restart planning from scratch'],
      });
    }

    adapted.steps = adapted.steps.slice(0, this.config.maxStepsPerPlan);
    adapted.estimatedTotalEffort = adapted.steps.reduce((s, st) => s + st.estimatedEffort, 0);
    adapted.risks = [...new Set([...adapted.risks, ...changedConditions.map((c) => `Condition changed: ${c}`)])];
    adapted.confidence = round2(clamp(adapted.confidence * 0.85, 0, 1));
    return adapted;
  }

  /** Merge multiple plans, resolving step conflicts and combining dependencies. */
  mergePlans(plans: Plan[]): Plan {
    if (plans.length === 0) return this.createPlan('Empty merged plan');
    if (plans.length === 1) return this.clonePlan(plans[0]);

    const mergedGoal: Goal = {
      id: generateId('goal'),
      description: plans.map((p) => p.goal.description).join(' + '),
      priority: this.highestPriority(plans.map((p) => p.goal.priority)),
      preconditions: [...new Set(plans.flatMap((p) => p.goal.preconditions))],
      successCriteria: [...new Set(plans.flatMap((p) => p.goal.successCriteria))],
    };

    const allSteps: PlanStep[] = [];
    const seenActions = new Set<string>();
    for (const plan of plans) {
      for (const step of plan.steps) {
        const key = step.action.toLowerCase().trim();
        const existing = seenActions.has(key) ? allSteps.find((s) => s.action.toLowerCase().trim() === key) : null;
        if (existing) {
          existing.risks = [...new Set([...existing.risks, ...step.risks])];
          existing.alternatives = [...new Set([...existing.alternatives, ...step.alternatives])];
          existing.estimatedEffort = Math.max(existing.estimatedEffort, step.estimatedEffort);
        } else {
          seenActions.add(key);
          allSteps.push({ ...step, id: generateId('step') });
        }
      }
    }

    const mergedSteps = allSteps.slice(0, this.config.maxStepsPerPlan);
    const avgConf = plans.reduce((s, p) => s + p.confidence, 0) / plans.length;

    return {
      id: generateId('plan'),
      goal: mergedGoal,
      steps: mergedSteps,
      estimatedTotalEffort: mergedSteps.reduce((s, st) => s + st.estimatedEffort, 0),
      confidence: round2(clamp(avgConf * 0.9, 0, 1)),
      risks: [...new Set(plans.flatMap((p) => p.risks))],
      assumptions: [...new Set(plans.flatMap((p) => p.assumptions))],
      createdAt: Date.now(),
    };
  }

  // ── Stats & Persistence ─────────────────────────────────────────────────

  /** Return current usage statistics. */
  getStats(): Readonly<PlanningEngineStats> {
    const n = this.confidenceHistory.length;
    const avgConf = n > 0 ? this.confidenceHistory.reduce((s, v) => s + v, 0) / n : 0;
    const sn = this.stepsHistory.length;
    const avgSteps = sn > 0 ? this.stepsHistory.reduce((s, v) => s + v, 0) / sn : 0;
    return {
      totalPlansCreated: this.totalPlansCreated, totalOptimisations: this.totalOptimisations,
      totalAdaptations: this.totalAdaptations, avgConfidence: round2(avgConf),
      avgStepsPerPlan: round2(avgSteps), templateUsageCount: this.templateUsageCount,
    };
  }

  /** Serialize the engine state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config, totalPlansCreated: this.totalPlansCreated,
      totalOptimisations: this.totalOptimisations, totalAdaptations: this.totalAdaptations,
      confidenceHistory: this.confidenceHistory, stepsHistory: this.stepsHistory,
      templateUsageCount: this.templateUsageCount,
    });
  }

  /** Restore a PlanningEngine from serialized JSON. */
  static deserialize(json: string): PlanningEngine {
    const d = JSON.parse(json) as {
      config: PlanningEngineConfig; totalPlansCreated: number; totalOptimisations: number;
      totalAdaptations: number; confidenceHistory: number[]; stepsHistory: number[];
      templateUsageCount: number;
    };
    const inst = new PlanningEngine(d.config);
    inst.totalPlansCreated = d.totalPlansCreated;
    inst.totalOptimisations = d.totalOptimisations;
    inst.totalAdaptations = d.totalAdaptations;
    inst.confidenceHistory = d.confidenceHistory;
    inst.stepsHistory = d.stepsHistory;
    inst.templateUsageCount = d.templateUsageCount;
    return inst;
  }

  // ── Goal Parsing ────────────────────────────────────────────────────────

  private parseGoal(description: string, constraints?: string[]): Goal {
    const preconditions = this.extractPreconditions(description);
    const successCriteria = this.extractSuccessCriteria(description);

    if (constraints) {
      for (const c of constraints) {
        if (/^(requires |needs |depends on )/i.test(c)) preconditions.push(c);
        else successCriteria.push(c);
      }
    }

    return {
      id: generateId('goal'), description,
      priority: this.inferPriority(description),
      preconditions: [...new Set(preconditions)],
      successCriteria: successCriteria.length > 0 ? [...new Set(successCriteria)] : ['Goal is achieved'],
    };
  }

  private inferPriority(text: string): Goal['priority'] {
    const l = text.toLowerCase();
    if (/\b(critical|urgent|emergency|asap|immediately)\b/.test(l)) return 'critical';
    if (/\b(important|high\s*priority|must|essential)\b/.test(l)) return 'high';
    if (/\b(low\s*priority|nice\s*to\s*have|eventually|optional)\b/.test(l)) return 'low';
    return 'medium';
  }

  private extractPreconditions(text: string): string[] {
    const result: string[] = [];
    const patterns = [
      /\b(?:requires?|needs?|depends?\s+on|assuming|given)\s+(.+?)(?:[.;,]|$)/gi,
      /\b(?:before|first|prerequisite)\s+(.+?)(?:[.;,]|$)/gi,
    ];
    for (const p of patterns) {
      p.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = p.exec(text)) !== null) { const c = m[1].trim(); if (c.length > 3 && c.length < 200) result.push(c); }
    }
    return result;
  }

  private extractSuccessCriteria(text: string): string[] {
    const result: string[] = [];
    const patterns = [
      /\b(?:so\s+that|in\s+order\s+to|to\s+achieve|resulting\s+in)\s+(.+?)(?:[.;]|$)/gi,
      /\b(?:success|complete[ds]?\s+when|done\s+when)\s+(.+?)(?:[.;]|$)/gi,
    ];
    for (const p of patterns) {
      p.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = p.exec(text)) !== null) { const c = m[1].trim(); if (c.length > 3 && c.length < 200) result.push(c); }
    }
    return result;
  }

  // ── Task Classification ─────────────────────────────────────────────────

  private classifyTaskType(text: string): string {
    const lower = text.toLowerCase();
    let best = 'feature', bestN = 0;
    for (const [type, kws] of Object.entries(TASK_TYPE_KEYWORDS)) {
      const n = kws.filter((kw) => lower.includes(kw)).length;
      if (n > bestN) { bestN = n; best = type; }
    }
    return best;
  }

  private findTemplate(taskType: string): PlanTemplate | undefined {
    return PLAN_TEMPLATES.find((t) => t.taskType === taskType);
  }

  // ── Step Generation ─────────────────────────────────────────────────────

  private instantiateTemplate(template: PlanTemplate, goal: Goal): PlanStep[] {
    const kw = extractKeywords(goal.description);
    return template.steps.map((ts, idx) => ({
      id: generateId('step'), action: ts.action,
      description: this.contextualise(ts.description, kw), estimatedEffort: ts.effort,
      dependencies: idx > 0 ? [generateId('dep')] : [],
      risks: [...ts.risks], alternatives: this.generateStepAlternatives(ts.action),
    }));
  }

  private generateStepsFromGoal(goal: Goal): PlanStep[] {
    const sentences = splitSentences(goal.description);
    const steps: PlanStep[] = [{
      id: generateId('step'), action: 'analyse_goal',
      description: `Analyse and clarify: ${goal.description.slice(0, 100)}`,
      estimatedEffort: this.estimateEffort(goal.description, 'analysis'),
      dependencies: [], risks: ['Incomplete understanding'],
      alternatives: ['Seek expert consultation', 'Review similar past work'],
    }];

    for (const sentence of sentences) {
      const action = this.deriveAction(sentence);
      steps.push({
        id: generateId('step'), action, description: sentence,
        estimatedEffort: this.estimateEffort(sentence, action),
        dependencies: steps.length > 0 ? [steps[steps.length - 1].id] : [],
        risks: this.assessStepRisks(sentence),
        alternatives: this.generateStepAlternatives(action),
      });
    }

    steps.push({
      id: generateId('step'), action: 'verify_completion',
      description: `Verify all success criteria are met: ${goal.successCriteria.join(', ')}`,
      estimatedEffort: 1,
      dependencies: steps.length > 0 ? [steps[steps.length - 1].id] : [],
      risks: ['Verification may reveal gaps'],
      alternatives: ['Automated validation', 'Peer review'],
    });
    return steps;
  }

  private decomposeStep(step: PlanStep, depth: number): PlanStep[] {
    if (depth <= 0 || step.estimatedEffort <= 1) return [step];
    const subCount = Math.min(Math.ceil(step.estimatedEffort / 2), 4);
    const subEffort = Math.max(1, Math.floor(step.estimatedEffort / subCount));
    const phases = this.inferDecompositionPhases(step.action);
    const subSteps: PlanStep[] = [];

    for (let i = 0; i < subCount; i++) {
      const phase = phases[i % phases.length];
      subSteps.push({
        id: generateId('step'), action: `${step.action}_${phase}`,
        description: `${phase}: ${step.description}`,
        estimatedEffort: i < subCount - 1 ? subEffort : step.estimatedEffort - subEffort * (subCount - 1),
        dependencies: i > 0 ? [subSteps[i - 1].id] : step.dependencies,
        risks: step.risks.slice(0, Math.ceil(step.risks.length / subCount)),
        alternatives: [],
      });
    }
    return subSteps;
  }

  private inferDecompositionPhases(action: string): string[] {
    const l = action.toLowerCase();
    if (/implement|build|create/.test(l)) return ['design', 'implement', 'test', 'integrate'];
    if (/test|validate|verify/.test(l)) return ['setup', 'execute', 'analyse_results', 'report'];
    if (/deploy|release/.test(l)) return ['prepare', 'stage', 'execute', 'verify'];
    if (/migrate|convert/.test(l)) return ['audit', 'transform', 'validate', 'cutover'];
    return ['prepare', 'execute', 'review'];
  }

  // ── Evaluation Internals ────────────────────────────────────────────────

  private scoreFeasibility(plan: Plan): number {
    let score = 0.8;
    if (plan.steps.length > 15) score -= 0.1;
    if (plan.steps.length > 25) score -= 0.15;
    if (plan.estimatedTotalEffort > 40) score -= 0.1;
    if (plan.estimatedTotalEffort > 80) score -= 0.15;
    score -= plan.risks.length * 0.03;
    if (plan.steps.some((s) => s.dependencies.length > 0)) score += 0.05;
    const graph = this.buildDependencyGraph(plan.steps);
    if (this.detectCycles(graph).length > 0) score -= 0.2;
    return clamp(score, 0, 1);
  }

  private scoreCompleteness(plan: Plan): number {
    let score = 0.5;
    const goalKw = extractKeywords(plan.goal.description);
    const planText = plan.steps.map((s) => `${s.action} ${s.description}`).join(' ').toLowerCase();
    if (goalKw.length > 0) score += 0.3 * (goalKw.filter((kw) => planText.includes(kw)).length / goalKw.length);
    if (plan.steps.some((s) => /verify|test|validate/.test(s.action))) score += 0.1;
    if (plan.steps.some((s) => /analyse|design|plan/.test(s.action))) score += 0.1;
    return clamp(score, 0, 1);
  }

  private scoreEfficiency(plan: Plan): number {
    if (plan.steps.length === 0) return 0;
    let score = 0.7;

    const actions = plan.steps.map((s) => s.action.toLowerCase());
    const unique = new Set(actions);
    if (unique.size < actions.length) score -= 0.1 * (actions.length - unique.size);

    const graph = this.buildDependencyGraph(plan.steps);
    const zeroDeg = Object.values(graph.inDegree).filter((d) => d === 0).length;
    if (zeroDeg > 1) score += 0.05 * Math.min(zeroDeg - 1, 3);

    const critical = this.criticalPath(plan);
    if (critical.length > plan.steps.length * 0.8 && plan.steps.length > 3) score -= 0.1;

    const efforts = plan.steps.map((s) => s.estimatedEffort);
    const maxE = Math.max(...efforts);
    const avgE = efforts.reduce((a, b) => a + b, 0) / efforts.length;
    if (maxE <= avgE * 3) score += 0.05;
    return clamp(score, 0, 1);
  }

  private identifyPlanRisks(plan: Plan): string[] {
    const risks = new Set<string>(plan.risks);
    if (plan.steps.length > 20) risks.add('Plan complexity: too many steps');
    if (plan.estimatedTotalEffort > 60) risks.add('High total effort may exceed time constraints');
    if (this.detectCycles(this.buildDependencyGraph(plan.steps)).length > 0) risks.add('Circular dependencies detected');
    if (plan.steps.filter((s) => s.alternatives.length === 0).length > plan.steps.length * 0.5) risks.add('Many steps lack alternatives');
    if (plan.assumptions.length > 5) risks.add('Plan relies on many assumptions');
    return Array.from(risks);
  }

  // ── Optimisation Internals ──────────────────────────────────────────────

  private optimiseEffort(plan: Plan): { plan: Plan; improvements: string[] } {
    const improvements: string[] = [];
    const optimized = this.clonePlan(plan);
    const merged: PlanStep[] = [];

    for (let i = 0; i < optimized.steps.length; i++) {
      const cur = optimized.steps[i];
      const next = optimized.steps[i + 1];
      if (next && keywordOverlap(cur.action, next.action) > 0.5) {
        merged.push({
          ...cur, id: generateId('step'),
          description: `${cur.description} + ${next.description}`,
          estimatedEffort: Math.ceil((cur.estimatedEffort + next.estimatedEffort) * 0.8),
          risks: [...new Set([...cur.risks, ...next.risks])],
          alternatives: [...new Set([...cur.alternatives, ...next.alternatives])],
        });
        improvements.push(`Merged similar steps: "${cur.action}" and "${next.action}"`);
        i++;
      } else { merged.push(cur); }
    }

    optimized.steps = merged;
    optimized.estimatedTotalEffort = merged.reduce((s, st) => s + st.estimatedEffort, 0);
    return { plan: optimized, improvements };
  }

  private optimiseRisk(plan: Plan): { plan: Plan; improvements: string[] } {
    const improvements: string[] = [];
    const optimized = this.clonePlan(plan);

    for (const step of optimized.steps.filter((s) => s.risks.length >= 2 && s.alternatives.length === 0)) {
      step.alternatives.push('Seek expert review before proceeding');
      improvements.push(`Added fallback for high-risk step: "${step.action}"`);
    }

    const before = optimized.risks.length;
    optimized.risks = [...new Set(optimized.risks)];
    if (optimized.risks.length < before) improvements.push(`Deduplicated ${before - optimized.risks.length} risk(s)`);
    return { plan: optimized, improvements };
  }

  private optimiseParallelism(plan: Plan): { plan: Plan; improvements: string[] } {
    const improvements: string[] = [];
    const optimized = this.clonePlan(plan);
    const graph = this.buildDependencyGraph(optimized.steps);
    const processed = new Set<string>();
    let parallelCount = 0;

    for (const step of optimized.steps) {
      if (processed.has(step.id)) continue;
      const group = [step.id];
      processed.add(step.id);
      for (const other of optimized.steps) {
        if (processed.has(other.id)) continue;
        const mutual = step.dependencies.includes(other.id) || other.dependencies.includes(step.id);
        if (!mutual && graph.inDegree[step.id] === graph.inDegree[other.id]) {
          group.push(other.id);
          processed.add(other.id);
        }
      }
      if (group.length > 1) parallelCount += group.length;
    }

    if (parallelCount > 0) improvements.push(`Identified ${parallelCount} steps that can run in parallel`);
    return { plan: optimized, improvements };
  }

  private optimiseOrdering(plan: Plan): { plan: Plan; improvements: string[] } {
    const optimized = this.clonePlan(plan);
    const graph = this.buildDependencyGraph(optimized.steps);
    if (this.detectCycles(graph).length > 0) return { plan: optimized, improvements: ['Cannot reorder: cycles detected'] };

    const sorted = this.topologicalSort(graph);
    const stepMap = new Map(optimized.steps.map((s) => [s.id, s]));
    const reordered: PlanStep[] = sorted.map((id) => stepMap.get(id)).filter((s): s is PlanStep => !!s);
    const inGraph = new Set(sorted);
    for (const step of optimized.steps) { if (!inGraph.has(step.id)) reordered.push(step); }

    const changed = reordered.some((s, i) => s.id !== optimized.steps[i]?.id);
    optimized.steps = reordered;
    return { plan: optimized, improvements: changed ? ['Reordered steps based on dependency analysis'] : [] };
  }

  // ── Effort & Risk Estimation ────────────────────────────────────────────

  private estimateEffort(text: string, action: string): number {
    const lower = text.toLowerCase();
    let effort = 2;
    for (const [keyword, value] of Object.entries(COMPLEXITY_KEYWORDS)) {
      if (lower.includes(keyword.replace(/_/g, ' '))) effort = Math.max(effort, value);
    }
    const words = text.split(/\s+/).length;
    if (words > 30) effort += 2; else if (words > 15) effort += 1;

    const mods: Record<string, number> = { analyse: 0, design: 1, implement: 2, test: 1, deploy: 1, migrate: 3, refactor: 2 };
    for (const [k, m] of Object.entries(mods)) { if (action.toLowerCase().includes(k)) { effort += m; break; } }
    return clamp(effort, 1, 10);
  }

  private assessStepRisks(text: string): string[] {
    const lower = text.toLowerCase();
    const risks = Object.entries(RISK_KEYWORDS)
      .filter(([kw, w]) => lower.includes(kw.replace(/_/g, ' ')) && w >= 0.3)
      .map(([kw]) => `Risk from "${kw}": potential complexity`);
    return risks.length > 0 ? risks.slice(0, 3) : ['Standard execution risk'];
  }

  private assessGoalRisks(goal: Goal): string[] {
    const risks: string[] = [];
    const lower = goal.description.toLowerCase();
    for (const [kw, weight] of Object.entries(RISK_KEYWORDS)) {
      if (lower.includes(kw.replace(/_/g, ' ')) && weight >= 0.3) risks.push(`Goal involves "${kw}" — elevated risk`);
    }
    if (goal.preconditions.length > 3) risks.push('Many preconditions increase dependency risk');
    if (goal.priority === 'critical') risks.push('Critical priority leaves little room for error');
    return risks;
  }

  private constraintRisks(constraints: string[]): string[] {
    const risks: string[] = [];
    if (constraints.length > 5) risks.push('Many constraints may conflict');
    for (const c of constraints) {
      if (/\bnot\b|\bavoid\b|\bnever\b/i.test(c)) risks.push(`Negative constraint may limit options: "${c.slice(0, 60)}"`);
    }
    return risks;
  }

  // ── Confidence Computation ──────────────────────────────────────────────

  private computePlanConfidence(steps: PlanStep[], goal: Goal, risks: string[]): number {
    if (steps.length === 0) return 0;
    let confidence = 0.7;

    const goalKw = extractKeywords(goal.description);
    const planText = steps.map((s) => `${s.action} ${s.description}`).join(' ').toLowerCase();
    if (goalKw.length > 0) confidence += (goalKw.filter((kw) => planText.includes(kw)).length / goalKw.length) * 0.15;
    confidence -= (risks.length / Math.max(steps.length, 1)) * 0.05;
    if (steps.some((s) => /verify|test/.test(s.action))) confidence += 0.05;
    confidence -= (steps.filter((s) => s.alternatives.length === 0).length / steps.length) * 0.05;
    return clamp(confidence, 0, 1);
  }

  // ── Graph Utilities ─────────────────────────────────────────────────────

  private topologicalSort(graph: DependencyGraph): string[] {
    const inDeg = { ...graph.inDegree };
    const queue: string[] = graph.nodes.filter((n) => (inDeg[n] ?? 0) === 0);
    const order: string[] = [];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      order.push(cur);
      for (const nb of graph.adjacency[cur] ?? []) { if (--inDeg[nb] === 0) queue.push(nb); }
    }
    for (const n of graph.nodes) { if (!order.includes(n)) order.push(n); }
    return order;
  }

  // ── Step Helpers ────────────────────────────────────────────────────────

  private deriveAction(text: string): string {
    const lower = text.toLowerCase();
    const map: Array<[string[], string]> = [
      [['analyse', 'analyze', 'understand', 'investigate', 'research'], 'analyse'],
      [['design', 'architect', 'plan', 'structure'], 'design'],
      [['implement', 'build', 'create', 'develop', 'code', 'write'], 'implement'],
      [['test', 'validate', 'check', 'verify'], 'test'],
      [['deploy', 'release', 'ship', 'publish'], 'deploy'],
      [['fix', 'repair', 'patch', 'debug', 'resolve'], 'fix'],
      [['refactor', 'restructure', 'clean', 'simplify'], 'refactor'],
      [['migrate', 'upgrade', 'convert', 'port'], 'migrate'],
      [['document', 'describe', 'explain'], 'document'],
      [['review', 'inspect', 'audit'], 'review'],
      [['configure', 'setup', 'provision'], 'configure'],
      [['monitor', 'observe', 'track'], 'monitor'],
    ];
    for (const [keywords, action] of map) { if (keywords.some((kw) => lower.includes(kw))) return action; }
    return 'execute';
  }

  private generateStepAlternatives(action: string): string[] {
    const map: Record<string, string[]> = {
      analyse: ['Automated analysis', 'Expert consultation', 'Comparative review'],
      design: ['Prototype-first approach', 'Pattern-based design', 'Evolutionary design'],
      implement: ['Pair programming', 'TDD approach', 'Spike-then-implement'],
      test: ['Automated testing', 'Manual QA', 'Property-based testing'],
      deploy: ['Blue-green deployment', 'Canary release', 'Feature flags'],
      fix: ['Hot-fix branch', 'Revert and redo', 'Workaround patch'],
      refactor: ['Strangler pattern', 'Big-bang rewrite', 'Incremental cleanup'],
      migrate: ['Dual-write strategy', 'Shadow mode', 'Phased cutover'],
      document: ['Auto-generated docs', 'Wiki-based docs', 'Inline documentation'],
      review: ['Async code review', 'Pair review session', 'Automated review tools'],
      configure: ['Infrastructure as code', 'Manual setup', 'Config management tool'],
      monitor: ['APM tooling', 'Log aggregation', 'Custom dashboards'],
    };
    return map[action] ?? ['Alternative approach', 'Simplified version'];
  }

  private contextualise(desc: string, kw: string[]): string {
    return kw.length > 0 ? `${desc} (context: ${kw.slice(0, 3).join(', ')})` : desc;
  }

  private applyConstraints(steps: PlanStep[], constraints: string[]): PlanStep[] {
    const ct = constraints.join(' ').toLowerCase();
    return steps.map((s) => {
      if (keywordOverlap(`${s.action} ${s.description}`.toLowerCase(), ct) > 0.2) {
        return { ...s, description: `${s.description} [constrained]`,
          risks: [...s.risks, 'Constraint compliance required'],
          estimatedEffort: Math.ceil(s.estimatedEffort * 1.1) };
      }
      return s;
    });
  }

  private inferAssumptions(goal: Goal): string[] {
    const assumptions: string[] = ['Development environment is stable', 'Required permissions are granted'];
    const lower = goal.description.toLowerCase();
    if (/api|service/.test(lower)) assumptions.push('External services are available and responsive');
    if (/database|data/.test(lower)) assumptions.push('Database access is configured and available');
    if (/deploy|production/.test(lower)) assumptions.push('Deployment pipeline is configured');
    if (/test/.test(lower)) assumptions.push('Test framework is set up');
    return assumptions;
  }

  // ── Alternative & Workaround Generation ─────────────────────────────────

  private generateWorkaround(plan: Plan, failedStep: PlanStep): Plan | null {
    const deps = plan.steps.filter((s) => s.dependencies.includes(failedStep.id));
    if (deps.length === 0) return this.buildPlanFromSteps(plan.goal, plan.steps.filter((s) => s.id !== failedStep.id));

    const simplified: PlanStep = {
      id: generateId('step'), action: `simplified_${failedStep.action}`,
      description: `Simplified workaround for: ${failedStep.description}`,
      estimatedEffort: Math.max(1, failedStep.estimatedEffort - 1),
      dependencies: failedStep.dependencies, risks: [...failedStep.risks, 'Workaround may be incomplete'],
      alternatives: [],
    };
    const newSteps = plan.steps.map((s) => {
      if (s.id === failedStep.id) return simplified;
      if (s.dependencies.includes(failedStep.id)) return { ...s, dependencies: s.dependencies.map((d) => (d === failedStep.id ? simplified.id : d)) };
      return s;
    });
    return this.buildPlanFromSteps(plan.goal, newSteps);
  }

  private generateMitigationStep(condition: string): PlanStep | null {
    const kw = extractKeywords(condition);
    if (condition.length < 5 || kw.length === 0) return null;
    return {
      id: generateId('step'), action: 'mitigate_condition',
      description: `Mitigate changed condition: ${condition}`, estimatedEffort: 2,
      dependencies: [], risks: [`Mitigation for "${condition}" may be insufficient`],
      alternatives: ['Accept risk and proceed', 'Escalate for guidance'],
    };
  }

  // ── Plan Utilities ──────────────────────────────────────────────────────

  private buildPlanFromSteps(goal: Goal, steps: PlanStep[]): Plan {
    const allRisks = [...new Set(steps.flatMap((s) => s.risks))];
    return {
      id: generateId('plan'), goal, steps,
      estimatedTotalEffort: steps.reduce((s, st) => s + st.estimatedEffort, 0),
      confidence: round2(this.computePlanConfidence(steps, goal, allRisks)),
      risks: allRisks, assumptions: [], createdAt: Date.now(),
    };
  }

  private clonePlan(plan: Plan): Plan { return JSON.parse(JSON.stringify(plan)) as Plan; }

  private highestPriority(priorities: Array<Goal['priority']>): Goal['priority'] {
    for (const level of ['critical', 'high', 'medium', 'low'] as const) {
      if (priorities.includes(level)) return level;
    }
    return 'medium';
  }
}
