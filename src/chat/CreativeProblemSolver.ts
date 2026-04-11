/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  CreativeProblemSolver — Lateral thinking & divergent solution generation   ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ SCAMPER Method — Systematic creativity technique                       ║
 * ║    ✦ Brainstorming — Generate multiple solution ideas                       ║
 * ║    ✦ Constraint Relaxation — Remove constraints to find new solutions       ║
 * ║    ✦ Analogy Generator — Find analogies from other domains                  ║
 * ║    ✦ First Principles — Break problems to fundamental truths                ║
 * ║    ✦ Reverse Engineering — Work backwards from desired outcome              ║
 * ║    ✦ Innovation Scoring — Rate solution creativity and feasibility          ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProblemDefinition {
  description: string
  constraints: string[]
  domain: string
  desiredOutcome: string
}

export interface CreativeSolution {
  idea: string
  method: CreativityMethod
  feasibility: number // 0-1
  novelty: number // 0-1
  applicability: number // 0-1
  overallScore: number // 0-1
  explanation: string
}

export type CreativityMethod =
  | 'scamper'
  | 'brainstorm'
  | 'constraint_relaxation'
  | 'analogy'
  | 'first_principles'
  | 'reverse_engineering'
  | 'random_stimulus'

export type ScamperAction =
  | 'substitute'
  | 'combine'
  | 'adapt'
  | 'modify'
  | 'put_to_other_use'
  | 'eliminate'
  | 'reverse'

export interface AnalogySuggestion {
  sourceDomain: string
  targetDomain: string
  analogy: string
  explanation: string
  strength: number // 0-1
}

export interface FirstPrinciplesAnalysis {
  fundamentalTruths: string[]
  assumptions: string[]
  derivedInsights: string[]
  newApproach: string
}

// ── Domain Analogies ─────────────────────────────────────────────────────────

const DOMAIN_ANALOGIES: Record<string, string[]> = {
  software: [
    'Architecture: Software is like building a house — foundation (infrastructure), walls (services), rooms (modules)',
    'Biology: Code is like DNA — replication (deployment), mutation (bugs), evolution (refactoring)',
    'Traffic: Data flow is like city traffic — bottlenecks (performance), lanes (threads), traffic lights (semaphores)',
    'Kitchen: APIs are like recipes — ingredients (inputs), steps (processes), dish (output)',
    'Music: Code rhythm — composition (architecture), harmony (integration), tempo (performance)',
  ],
  management: [
    'Garden: Team management is like gardening — nurturing (mentoring), pruning (removing waste), growth (development)',
    'Orchestra: Project coordination like conducting — each section (team) plays a part, timing is everything',
    'Sports: Strategy like coaching — game plan (roadmap), plays (sprints), practice (training)',
  ],
  design: [
    'Nature: Design like evolution — survival of the fittest (user testing), adaptation (iteration)',
    'Fashion: UI design like fashion — trends, accessibility, personal expression',
    'Architecture: Information architecture like building blueprints — flow, structure, purpose',
  ],
  data: [
    'Mining: Data mining like gold mining — raw material (data), processing (ETL), valuable output (insights)',
    'Water: Data pipeline like plumbing — flow, pressure (throughput), leaks (data loss)',
    'Library: Database like a library — catalog (index), shelves (tables), librarian (query optimizer)',
  ],
  security: [
    'Castle: Security like castle defense — walls (firewall), moat (DMZ), guards (IDS)',
    'Immune System: Security like immune system — detection (monitoring), response (incident response)',
    'Banking: Auth like banking — vault (encryption), keys (credentials), guards (access control)',
  ],
}

const SCAMPER_PROMPTS: Record<ScamperAction, string[]> = {
  substitute: [
    'What component could be replaced with something else?',
    'What alternative technology/approach could work?',
    'Who else could perform this function?',
  ],
  combine: [
    'What features could be merged together?',
    'What ideas from different domains could be blended?',
    'How can existing tools be combined in new ways?',
  ],
  adapt: [
    'What else is like this problem? What can we copy?',
    'What solution from another industry applies here?',
    'How has this been solved in the past?',
  ],
  modify: [
    'What if we made it 10x bigger? 10x smaller?',
    'What if we changed the shape/structure?',
    'What happens if we change the sequence/order?',
  ],
  put_to_other_use: [
    'What else could this tool/technology be used for?',
    'Who else would benefit from this solution?',
    'What if we used it in a completely different context?',
  ],
  eliminate: [
    'What could be removed without losing value?',
    'What is unnecessary complexity?',
    'What would happen if we eliminated this constraint?',
  ],
  reverse: [
    'What if we did the opposite?',
    'What if we reversed the order/process?',
    'What if the user built it instead of us?',
  ],
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class CreativeProblemSolver {
  private solutionHistory: CreativeSolution[] = []
  private readonly maxHistory = 100

  constructor() {}

  // ── Main Solver ──────────────────────────────────────────────────────────

  /**
   * Generate creative solutions for a problem
   */
  solve(problem: ProblemDefinition, methodCount: number = 3): CreativeSolution[] {
    const solutions: CreativeSolution[] = []

    // Apply SCAMPER
    solutions.push(...this.applySCAMPER(problem).slice(0, methodCount))

    // Apply constraint relaxation
    solutions.push(...this.relaxConstraints(problem))

    // Apply analogies
    const analogySolutions = this.applyAnalogies(problem)
    solutions.push(...analogySolutions)

    // Apply first principles
    const fpSolution = this.applyFirstPrinciples(problem)
    if (fpSolution) solutions.push(fpSolution)

    // Apply reverse engineering
    const reSolution = this.reverseEngineer(problem)
    if (reSolution) solutions.push(reSolution)

    // Score and sort
    const scored = solutions.map(s => ({
      ...s,
      overallScore: s.feasibility * 0.4 + s.novelty * 0.3 + s.applicability * 0.3,
    }))
    scored.sort((a, b) => b.overallScore - a.overallScore)

    // Track
    this.solutionHistory.push(...scored)
    if (this.solutionHistory.length > this.maxHistory) {
      this.solutionHistory = this.solutionHistory.slice(-this.maxHistory)
    }

    return scored
  }

  // ── SCAMPER ──────────────────────────────────────────────────────────────

  /**
   * Apply SCAMPER creativity technique
   */
  applySCAMPER(problem: ProblemDefinition): CreativeSolution[] {
    const actions: ScamperAction[] = [
      'substitute',
      'combine',
      'adapt',
      'modify',
      'put_to_other_use',
      'eliminate',
      'reverse',
    ]
    const solutions: CreativeSolution[] = []

    for (const action of actions) {
      const prompts = SCAMPER_PROMPTS[action]
      const prompt = prompts[Math.floor(problem.description.length % prompts.length)]!

      const idea = `[${action.toUpperCase()}] ${prompt} Applied to: "${problem.description.slice(0, 100)}"`
      solutions.push({
        idea,
        method: 'scamper',
        feasibility: 0.6,
        novelty: action === 'reverse' ? 0.8 : action === 'combine' ? 0.7 : 0.6,
        applicability: 0.7,
        overallScore: 0,
        explanation: `SCAMPER technique: ${action} — ${prompt}`,
      })
    }

    return solutions
  }

  /**
   * Get SCAMPER prompts for a specific action
   */
  getSCAMPERPrompts(action: ScamperAction): string[] {
    return [...SCAMPER_PROMPTS[action]]
  }

  // ── Constraint Relaxation ────────────────────────────────────────────────

  /**
   * Generate solutions by relaxing constraints one at a time
   */
  relaxConstraints(problem: ProblemDefinition): CreativeSolution[] {
    if (problem.constraints.length === 0) return []

    return problem.constraints.map(constraint => ({
      idea: `What if we removed the constraint: "${constraint}"? This opens up: alternative approaches that were previously blocked.`,
      method: 'constraint_relaxation' as CreativityMethod,
      feasibility: 0.5,
      novelty: 0.7,
      applicability: 0.6,
      overallScore: 0,
      explanation: `By removing "${constraint}", new solution space opens up for "${problem.description.slice(0, 80)}"`,
    }))
  }

  // ── Analogy Generator ────────────────────────────────────────────────────

  /**
   * Find analogies from other domains
   */
  findAnalogies(domain: string, problem: string): AnalogySuggestion[] {
    const suggestions: AnalogySuggestion[] = []
    const domainKey = domain.toLowerCase()

    // Find matching domain analogies
    for (const [key, analogies] of Object.entries(DOMAIN_ANALOGIES)) {
      if (key === domainKey || domainKey.includes(key)) {
        for (const analogy of analogies) {
          const [sourceDomain, ...rest] = analogy.split(':')
          suggestions.push({
            sourceDomain: sourceDomain!.trim(),
            targetDomain: domain,
            analogy: rest.join(':').trim(),
            explanation: `Analogy from ${sourceDomain!.trim()} domain applied to ${domain}`,
            strength: 0.7,
          })
        }
      }
    }

    // If no exact match, suggest from all domains
    if (suggestions.length === 0) {
      for (const analogies of Object.values(DOMAIN_ANALOGIES)) {
        const randomAnalogy = analogies[problem.length % analogies.length]!
        const [sourceDomain, ...rest] = randomAnalogy.split(':')
        suggestions.push({
          sourceDomain: sourceDomain!.trim(),
          targetDomain: domain,
          analogy: rest.join(':').trim(),
          explanation: `Cross-domain analogy from ${sourceDomain!.trim()}`,
          strength: 0.5,
        })
      }
    }

    return suggestions.slice(0, 5)
  }

  /**
   * Apply analogies to generate solutions
   */
  private applyAnalogies(problem: ProblemDefinition): CreativeSolution[] {
    const analogies = this.findAnalogies(problem.domain, problem.description)
    return analogies.slice(0, 2).map(a => ({
      idea: `Analogy from ${a.sourceDomain}: ${a.analogy}`,
      method: 'analogy' as CreativityMethod,
      feasibility: 0.5,
      novelty: 0.8,
      applicability: a.strength,
      overallScore: 0,
      explanation: a.explanation,
    }))
  }

  // ── First Principles ─────────────────────────────────────────────────────

  /**
   * Break down problem to first principles
   */
  analyzeFirstPrinciples(problem: ProblemDefinition): FirstPrinciplesAnalysis {
    const keywords = problem.description
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)

    const fundamentalTruths = [
      `The core need: "${problem.desiredOutcome}"`,
      `Key elements: ${keywords.slice(0, 5).join(', ')}`,
    ]

    const assumptions = problem.constraints.map(c => `Assumption: "${c}" is truly necessary`)
    if (assumptions.length === 0) {
      assumptions.push('Assumption: Current approach is the only viable one')
    }

    const derivedInsights = [
      'Challenge each assumption — which ones are truly immutable?',
      'What is the simplest possible solution that achieves the core need?',
      'What would a solution look like if built from scratch with no legacy?',
    ]

    const newApproach = `Start from the fundamental need (${problem.desiredOutcome}) and build up, questioning each layer of complexity.`

    return { fundamentalTruths, assumptions, derivedInsights, newApproach }
  }

  private applyFirstPrinciples(problem: ProblemDefinition): CreativeSolution | null {
    const analysis = this.analyzeFirstPrinciples(problem)
    return {
      idea: `First Principles: ${analysis.newApproach}`,
      method: 'first_principles',
      feasibility: 0.7,
      novelty: 0.6,
      applicability: 0.8,
      overallScore: 0,
      explanation: `Derived from fundamentals: ${analysis.fundamentalTruths[0]}`,
    }
  }

  // ── Reverse Engineering ──────────────────────────────────────────────────

  /**
   * Work backwards from desired outcome
   */
  reverseEngineer(problem: ProblemDefinition): CreativeSolution {
    const steps = [
      `Final state: "${problem.desiredOutcome}"`,
      'What must be true immediately before achieving this?',
      'What conditions enable those prerequisites?',
      `Current state: "${problem.description.slice(0, 80)}"`,
    ]

    return {
      idea: `Reverse from goal: ${steps.join(' → ')}`,
      method: 'reverse_engineering',
      feasibility: 0.7,
      novelty: 0.5,
      applicability: 0.8,
      overallScore: 0,
      explanation: `Working backwards from "${problem.desiredOutcome}" to identify the shortest path`,
    }
  }

  // ── Brainstorming ────────────────────────────────────────────────────────

  /**
   * Generate multiple brainstorming ideas
   */
  brainstorm(topic: string, count: number = 5): string[] {
    const techniques = [
      `What if we approach "${topic}" from the opposite direction?`,
      `How would a child solve "${topic}"?`,
      `What if money/time were unlimited for "${topic}"?`,
      `What would "${topic}" look like in 10 years?`,
      `How would nature solve "${topic}"?`,
      `What if we combined "${topic}" with something completely unrelated?`,
      `What is the laziest possible solution for "${topic}"?`,
      `What if we made "${topic}" into a game?`,
      `How would an alien civilization approach "${topic}"?`,
      `What if we removed the most important part of "${topic}"?`,
    ]

    return techniques.slice(0, Math.min(count, techniques.length))
  }

  // ── Innovation Scoring ───────────────────────────────────────────────────

  /**
   * Score a solution for creativity and feasibility
   */
  scoreSolution(
    solution: string,
    problem: ProblemDefinition,
  ): { feasibility: number; novelty: number; applicability: number; overall: number } {
    // Feasibility: does it address the problem?
    const problemWords = new Set(
      problem.description
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3),
    )
    const solutionWords = solution
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
    const overlap = solutionWords.filter(w => problemWords.has(w)).length
    const feasibility = Math.min(1, overlap / Math.max(problemWords.size, 1) + 0.3)

    // Novelty: how different is it from the problem statement?
    const uniqueWords = solutionWords.filter(w => !problemWords.has(w)).length
    const novelty = Math.min(1, uniqueWords / Math.max(solutionWords.length, 1))

    // Applicability: does it address the desired outcome?
    const outcomeWords = new Set(
      problem.desiredOutcome
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3),
    )
    const outcomeOverlap = solutionWords.filter(w => outcomeWords.has(w)).length
    const applicability = Math.min(1, outcomeOverlap / Math.max(outcomeWords.size, 1) + 0.3)

    const overall = feasibility * 0.4 + novelty * 0.3 + applicability * 0.3

    return { feasibility, novelty, applicability, overall }
  }

  /**
   * Get solution history count
   */
  getHistoryCount(): number {
    return this.solutionHistory.length
  }

  /**
   * Reset state
   */
  reset(): void {
    this.solutionHistory = []
  }
}
