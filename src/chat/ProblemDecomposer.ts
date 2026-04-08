/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ProblemDecomposer — Complex problem breakdown & solution synthesis        ║
 * ║                                                                            ║
 * ║  Breaks complex problems into manageable sub-problems, builds             ║
 * ║  dependency graphs, generates solution approaches, compares               ║
 * ║  alternatives, and synthesizes integrated solutions.                       ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Problem decomposition into sub-problems with dependencies            ║
 * ║    • Dependency graph construction and topological ordering               ║
 * ║    • Multiple solution approach generation per sub-problem                ║
 * ║    • Approach comparison with trade-off analysis                          ║
 * ║    • Solution integration and synthesis                                   ║
 * ║    • Complexity estimation and feasibility scoring                        ║
 * ║    • Critical path identification                                         ║
 * ║    • Problem classification by type and domain                            ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ProblemType = 'optimization' | 'design' | 'debugging' | 'analysis' | 'decision' | 'integration' | 'transformation' | 'research'
export type ComplexityLevel = 'trivial' | 'simple' | 'moderate' | 'complex' | 'very_complex'
export type ApproachStrategy = 'divide_and_conquer' | 'bottom_up' | 'top_down' | 'iterative' | 'parallel' | 'reduction'

export interface Problem {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly type: ProblemType
  readonly complexity: ComplexityLevel
  readonly constraints: readonly string[]
  readonly goals: readonly string[]
  readonly subProblemIds: readonly string[]
  readonly dependsOn: readonly string[]
  readonly createdAt: number
}

export interface SubProblem {
  readonly id: string
  readonly parentId: string
  readonly title: string
  readonly description: string
  readonly complexity: ComplexityLevel
  readonly dependsOn: readonly string[]
  readonly approaches: readonly SolutionApproach[]
  readonly selectedApproachId: string | null
  readonly status: 'pending' | 'in_progress' | 'solved' | 'blocked'
}

export interface SolutionApproach {
  readonly id: string
  readonly subProblemId: string
  readonly name: string
  readonly description: string
  readonly strategy: ApproachStrategy
  readonly pros: readonly string[]
  readonly cons: readonly string[]
  readonly complexity: ComplexityLevel
  readonly estimatedEffort: number // hours
  readonly feasibility: number // 0-1
  readonly risk: number // 0-1
}

export interface DependencyGraph {
  readonly nodes: readonly string[] // sub-problem IDs
  readonly edges: readonly [string, string][] // [from, to]
  readonly topologicalOrder: readonly string[]
  readonly criticalPath: readonly string[]
  readonly hasCycles: boolean
}

export interface IntegratedSolution {
  readonly problemId: string
  readonly approaches: ReadonlyMap<string, string> // subProblemId → approachId
  readonly executionOrder: readonly string[]
  readonly totalEffort: number
  readonly avgFeasibility: number
  readonly avgRisk: number
  readonly integrationNotes: readonly string[]
}

export interface ProblemDecomposerConfig {
  readonly maxSubProblems: number
  readonly maxApproachesPerSubProblem: number
  readonly maxProblems: number
  readonly enableAutoDecomposition: boolean
}

export interface ProblemDecomposerStats {
  readonly totalProblems: number
  readonly totalSubProblems: number
  readonly totalApproaches: number
  readonly totalSolutions: number
  readonly avgSubProblemsPerProblem: number
  readonly feedbackCount: number
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_PROBLEM_DECOMPOSER_CONFIG: ProblemDecomposerConfig = {
  maxSubProblems: 50,
  maxApproachesPerSubProblem: 5,
  maxProblems: 200,
  enableAutoDecomposition: true,
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

let _pdIdCounter = 0
function pdId(prefix: string): string {
  return `${prefix}_${++_pdIdCounter}_${Date.now().toString(36)}`
}

function classifyProblem(description: string): ProblemType {
  const lower = description.toLowerCase()
  if (/\b(optimiz|improv|faster|efficien|reduc|minimi|maximi)/i.test(lower)) return 'optimization'
  if (/\b(design|architect|build|creat|plan|structure)/i.test(lower)) return 'design'
  if (/\b(bug|error|fix|debug|crash|fail|broken)/i.test(lower)) return 'debugging'
  if (/\b(analyz|understand|evaluat|assess|measur|inspect)/i.test(lower)) return 'analysis'
  if (/\b(decid|choos|select|compar|option|tradeoff)/i.test(lower)) return 'decision'
  if (/\b(integrat|connect|combin|merg|unif|link)/i.test(lower)) return 'integration'
  if (/\b(transform|convert|migrat|refactor|chang|adapt)/i.test(lower)) return 'transformation'
  return 'research'
}

function estimateComplexity(description: string, numConstraints: number): ComplexityLevel {
  const words = description.split(/\s+/).length
  if (words < 10 && numConstraints === 0) return 'trivial'
  if (words < 30 && numConstraints <= 1) return 'simple'
  if (words < 80 && numConstraints <= 3) return 'moderate'
  if (words < 150 || numConstraints <= 5) return 'complex'
  return 'very_complex'
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class ProblemDecomposer {
  private readonly config: ProblemDecomposerConfig
  private readonly problems = new Map<string, Problem>()
  private readonly subProblems = new Map<string, SubProblem>()
  private readonly approaches = new Map<string, SolutionApproach>()
  private stats = {
    totalProblems: 0,
    totalSubProblems: 0,
    totalApproaches: 0,
    totalSolutions: 0,
    feedbackCount: 0,
  }

  constructor(config: Partial<ProblemDecomposerConfig> = {}) {
    this.config = { ...DEFAULT_PROBLEM_DECOMPOSER_CONFIG, ...config }
  }

  // ── Problem creation ─────────────────────────────────────────────────

  defineProblem(title: string, description: string, constraints: string[] = [], goals: string[] = []): Problem {
    const problem: Problem = {
      id: pdId('prob'),
      title,
      description,
      type: classifyProblem(description),
      complexity: estimateComplexity(description, constraints.length),
      constraints,
      goals,
      subProblemIds: [],
      dependsOn: [],
      createdAt: Date.now(),
    }
    this.problems.set(problem.id, problem)
    this.stats.totalProblems++
    return problem
  }

  getProblem(id: string): Problem | null {
    return this.problems.get(id) ?? null
  }

  // ── Decomposition ────────────────────────────────────────────────────

  decompose(problemId: string, subProblemDefs: Array<{ title: string; description: string; dependsOn?: string[] }>): SubProblem[] {
    const problem = this.problems.get(problemId)
    if (!problem) return []

    const results: SubProblem[] = []
    for (const def of subProblemDefs.slice(0, this.config.maxSubProblems)) {
      const sub: SubProblem = {
        id: pdId('sub'),
        parentId: problemId,
        title: def.title,
        description: def.description,
        complexity: estimateComplexity(def.description, 0),
        dependsOn: def.dependsOn ?? [],
        approaches: [],
        selectedApproachId: null,
        status: 'pending',
      }
      this.subProblems.set(sub.id, sub)
      ;(problem.subProblemIds as string[]).push(sub.id)
      this.stats.totalSubProblems++
      results.push(sub)
    }
    return results
  }

  getSubProblems(problemId: string): SubProblem[] {
    const problem = this.problems.get(problemId)
    if (!problem) return []
    return problem.subProblemIds.map(id => this.subProblems.get(id)!).filter(Boolean)
  }

  // ── Approach generation ──────────────────────────────────────────────

  addApproach(subProblemId: string, name: string, description: string, strategy: ApproachStrategy, pros: string[] = [], cons: string[] = [], estimatedEffort: number = 8): SolutionApproach | null {
    const sub = this.subProblems.get(subProblemId)
    if (!sub) return null
    if (sub.approaches.length >= this.config.maxApproachesPerSubProblem) return null

    const feasibility = Math.min(1, 0.5 + (pros.length - cons.length) * 0.1 + (estimatedEffort < 24 ? 0.1 : -0.1))
    const risk = Math.min(1, Math.max(0, 0.3 + cons.length * 0.1 - pros.length * 0.05))

    const approach: SolutionApproach = {
      id: pdId('apr'),
      subProblemId,
      name,
      description,
      strategy,
      pros,
      cons,
      complexity: sub.complexity,
      estimatedEffort,
      feasibility: Math.max(0, feasibility),
      risk,
    }

    this.approaches.set(approach.id, approach)
    ;(sub.approaches as SolutionApproach[]).push(approach)
    this.stats.totalApproaches++
    return approach
  }

  selectApproach(subProblemId: string, approachId: string): boolean {
    const sub = this.subProblems.get(subProblemId)
    if (!sub) return false
    const approach = sub.approaches.find(a => a.id === approachId)
    if (!approach) return false
    ;(sub as { selectedApproachId: string | null }).selectedApproachId = approachId
    return true
  }

  // ── Dependency graph ─────────────────────────────────────────────────

  buildDependencyGraph(problemId: string): DependencyGraph | null {
    const problem = this.problems.get(problemId)
    if (!problem) return null

    const nodes = [...problem.subProblemIds]
    const edges: [string, string][] = []
    for (const subId of nodes) {
      const sub = this.subProblems.get(subId)
      if (sub) {
        for (const depId of sub.dependsOn) {
          if (nodes.includes(depId)) edges.push([depId, subId])
        }
      }
    }

    // Topological sort (Kahn's algorithm)
    const inDegree = new Map<string, number>(nodes.map(n => [n, 0]))
    const adj = new Map<string, string[]>(nodes.map(n => [n, []]))
    for (const [from, to] of edges) {
      adj.get(from)?.push(to)
      inDegree.set(to, (inDegree.get(to) ?? 0) + 1)
    }

    const queue = nodes.filter(n => (inDegree.get(n) ?? 0) === 0)
    const order: string[] = []
    while (queue.length > 0) {
      const n = queue.shift()!
      order.push(n)
      for (const neighbor of adj.get(n) ?? []) {
        const deg = (inDegree.get(neighbor) ?? 1) - 1
        inDegree.set(neighbor, deg)
        if (deg === 0) queue.push(neighbor)
      }
    }

    const hasCycles = order.length !== nodes.length

    // Critical path = longest path
    const dist = new Map<string, number>(nodes.map(n => [n, 0]))
    for (const n of order) {
      for (const neighbor of adj.get(n) ?? []) {
        const newDist = (dist.get(n) ?? 0) + 1
        if (newDist > (dist.get(neighbor) ?? 0)) {
          dist.set(neighbor, newDist)
        }
      }
    }
    const maxDist = Math.max(0, ...[...dist.values()])
    const criticalPath = order.filter(n => dist.get(n) === maxDist || (maxDist === 0 && (inDegree.get(n) ?? 0) === 0))

    return { nodes, edges, topologicalOrder: order, criticalPath, hasCycles }
  }

  // ── Solution synthesis ───────────────────────────────────────────────

  synthesizeSolution(problemId: string): IntegratedSolution | null {
    const problem = this.problems.get(problemId)
    if (!problem) return null

    const graph = this.buildDependencyGraph(problemId)
    if (!graph) return null

    const approaches = new Map<string, string>()
    let totalEffort = 0
    let feasSum = 0
    let riskSum = 0
    let count = 0

    for (const subId of graph.topologicalOrder) {
      const sub = this.subProblems.get(subId)
      if (!sub) continue

      // Pick best approach (highest feasibility, lowest risk)
      const best = sub.selectedApproachId
        ? sub.approaches.find(a => a.id === sub.selectedApproachId)
        : [...sub.approaches].sort((a, b) => (b.feasibility - b.risk) - (a.feasibility - a.risk))[0]

      if (best) {
        approaches.set(subId, best.id)
        totalEffort += best.estimatedEffort
        feasSum += best.feasibility
        riskSum += best.risk
        count++
      }
    }

    const integrationNotes: string[] = []
    if (graph.hasCycles) integrationNotes.push('Warning: dependency cycle detected — execution order may need manual review')
    if (graph.criticalPath.length > 3) integrationNotes.push(`Critical path has ${graph.criticalPath.length} steps — consider parallelization`)
    if (count > 0 && riskSum / count > 0.5) integrationNotes.push('High average risk — consider risk mitigation measures')

    this.stats.totalSolutions++

    return {
      problemId,
      approaches,
      executionOrder: graph.topologicalOrder,
      totalEffort,
      avgFeasibility: count > 0 ? feasSum / count : 0,
      avgRisk: count > 0 ? riskSum / count : 0,
      integrationNotes,
    }
  }

  // ── Compare approaches ───────────────────────────────────────────────

  compareApproaches(subProblemId: string): Array<{ approach: SolutionApproach; score: number; rank: number }> {
    const sub = this.subProblems.get(subProblemId)
    if (!sub) return []

    const scored = sub.approaches.map(a => ({
      approach: a,
      score: a.feasibility * 0.4 + (1 - a.risk) * 0.3 + (a.pros.length / Math.max(1, a.pros.length + a.cons.length)) * 0.2 + (a.estimatedEffort < 16 ? 0.1 : 0),
    }))
    scored.sort((a, b) => b.score - a.score)
    return scored.map((s, i) => ({ ...s, rank: i + 1 }))
  }

  // ── Stats & feedback ─────────────────────────────────────────────────

  getStats(): Readonly<ProblemDecomposerStats> {
    const problems = [...this.problems.values()]
    const avgSub = problems.length > 0
      ? problems.reduce((s, p) => s + p.subProblemIds.length, 0) / problems.length
      : 0
    return {
      totalProblems: this.stats.totalProblems,
      totalSubProblems: this.stats.totalSubProblems,
      totalApproaches: this.stats.totalApproaches,
      totalSolutions: this.stats.totalSolutions,
      avgSubProblemsPerProblem: avgSub,
      feedbackCount: this.stats.feedbackCount,
    }
  }

  provideFeedback(): void {
    this.stats.feedbackCount++
  }

  serialize(): string {
    return JSON.stringify({
      problems: [...this.problems.values()],
      subProblems: [...this.subProblems.values()],
      approaches: [...this.approaches.values()],
      stats: this.stats,
    })
  }

  static deserialize(json: string, config?: Partial<ProblemDecomposerConfig>): ProblemDecomposer {
    const engine = new ProblemDecomposer(config)
    const data = JSON.parse(json)
    for (const p of data.problems ?? []) engine.problems.set(p.id, p)
    for (const s of data.subProblems ?? []) engine.subProblems.set(s.id, s)
    for (const a of data.approaches ?? []) engine.approaches.set(a.id, a)
    if (data.stats) Object.assign(engine.stats, data.stats)
    return engine
  }
}
