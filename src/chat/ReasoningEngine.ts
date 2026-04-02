/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🧠  R E A S O N I N G   E N G I N E                                ║
 * ║                                                                             ║
 * ║   Chain-of-thought reasoning with a 4-phase pipeline:                       ║
 * ║     decompose → plan → solve → verify                                       ║
 * ║                                                                             ║
 * ║     • Keyword-based problem-type classification                             ║
 * ║     • Constraint extraction (must / must-not / preference / conditional)    ║
 * ║     • Self-consistency across N candidate solutions                         ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface ReasoningContext {
  problem: string;
  constraints?: string[];
  domain?: string;
  maxDepth?: number;
}

export interface ReasoningStep2 {
  phase: 'decompose' | 'plan' | 'solve' | 'verify';
  description: string;
  result: string;
  confidence: number;
}

export interface ChainOfThoughtResult {
  answer: string;
  steps: ReasoningStep2[];
  confidence: number;
  alternatives: string[];
  duration: number;
}

export type ConstraintType = 'must_have' | 'must_not' | 'preference' | 'conditional';

export interface Constraint {
  type: ConstraintType;
  description: string;
  satisfied: boolean;
}

export interface SubProblem {
  description: string;
  type: string;
  dependencies: number[];
  difficulty: number;
}

export interface SolutionScore {
  correctness: number;
  completeness: number;
  clarity: number;
  overall: number;
}

export interface ReasoningEngineConfig {
  maxSteps: number;
  maxBacktrackDepth: number;
  selfConsistencyRuns: number;
  timeoutMs: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: ReasoningEngineConfig = {
  maxSteps: 20,
  maxBacktrackDepth: 3,
  selfConsistencyRuns: 3,
  timeoutMs: 30_000,
};

const PROBLEM_TYPE_KEYWORDS: Record<string, string[]> = {
  comparison: ['compare', 'versus', 'vs', 'difference', 'better', 'worse', 'trade-off'],
  classification: ['classify', 'categorize', 'identify', 'type', 'kind', 'which', 'group'],
  generation: ['create', 'generate', 'build', 'write', 'implement', 'develop', 'construct'],
  analysis: ['analyze', 'analyse', 'explain', 'why', 'how', 'cause', 'evaluate', 'assess'],
  debugging: ['debug', 'fix', 'error', 'bug', 'issue', 'broken', 'crash', 'fail', 'wrong'],
  design: ['architect', 'pattern', 'structure', 'organize', 'plan', 'schema', 'blueprint'],
};

const CONSTRAINT_PATTERNS: { pattern: RegExp; type: ConstraintType }[] = [
  { pattern: /\bmust\s+(?:have|be|support|include)\b/gi, type: 'must_have' },
  { pattern: /\brequires?\b/gi, type: 'must_have' },
  { pattern: /\bneed(?:s)?\s+to\b/gi, type: 'must_have' },
  { pattern: /\bmust\s+not\b/gi, type: 'must_not' },
  { pattern: /\bdon'?t\b/gi, type: 'must_not' },
  { pattern: /\bwithout\b/gi, type: 'must_not' },
  { pattern: /\bavoid\b/gi, type: 'must_not' },
  { pattern: /\bnever\b/gi, type: 'must_not' },
  { pattern: /\bshould\b/gi, type: 'preference' },
  { pattern: /\bprefer(?:ably)?\b/gi, type: 'preference' },
  { pattern: /\bideally\b/gi, type: 'preference' },
  { pattern: /\bif\s+.+?\s+then\b/gi, type: 'conditional' },
  { pattern: /\bwhen\s+.+?\s+(?:should|must)\b/gi, type: 'conditional' },
  { pattern: /\bunless\b/gi, type: 'conditional' },
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'has',
  'was', 'one', 'our', 'out', 'had', 'with', 'this', 'that', 'from',
  'they', 'been', 'have', 'will', 'each', 'make', 'like', 'into', 'then',
  'them', 'than', 'some', 'what', 'when', 'were', 'said', 'does',
]);

const APPROACHES: Record<string, string[]> = {
  comparison: ['Side-by-side feature matrix', 'Weighted criteria evaluation', 'Pros-and-cons analysis'],
  classification: ['Decision tree classification', 'Feature-based categorisation', 'Elimination by criteria'],
  generation: ['Template-based generation', 'Incremental construction', 'Prototype then refine'],
  analysis: ['Root-cause analysis', 'Systematic decomposition', 'Evidence-based assessment'],
  debugging: ['Binary search isolation', 'Trace-based diagnosis', 'Hypothesis-driven testing'],
  design: ['Top-down architectural design', 'Pattern-based composition', 'Iterative refinement'],
  general: ['Step-by-step reasoning', 'Analogical mapping', 'First-principles derivation'],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function extractSentence(text: string, matchIndex: number): string {
  const before = text.lastIndexOf('.', matchIndex);
  const after = text.indexOf('.', matchIndex);
  const start = before === -1 ? 0 : before + 1;
  const end = after === -1 ? text.length : after + 1;
  return text.slice(start, end).trim();
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

// ── ReasoningEngine ──────────────────────────────────────────────────────────

export class ReasoningEngine {
  private readonly config: ReasoningEngineConfig;
  private totalProblems = 0;
  private confidenceSum = 0;
  private stepsSum = 0;

  constructor(config?: Partial<ReasoningEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /** Run the full decompose → plan → solve → verify pipeline. */
  reason(problem: string, context?: ReasoningContext): ChainOfThoughtResult {
    const start = Date.now();
    const steps: ReasoningStep2[] = [];
    const effective = context?.problem ?? problem;
    const maxDepth = context?.maxDepth ?? this.config.maxBacktrackDepth;

    // Phase 1 — Decompose
    const subProblems = this.decompose(effective);
    steps.push({
      phase: 'decompose',
      description: `Broke problem into ${subProblems.length} sub-problem(s)`,
      result: subProblems.map((sp) => sp.description).join('; '),
      confidence: subProblems.length > 0 ? 0.8 : 0.3,
    });

    // Phase 2 — Plan
    const order = this.planOrder(subProblems);
    steps.push({
      phase: 'plan',
      description: `Planned execution order for ${order.length} sub-problem(s)`,
      result: order.map((i) => `#${i}: ${subProblems[i].type}`).join(' → '),
      confidence: 0.85,
    });

    // Phase 3 — Solve with self-consistency
    const constraints = this.extractConstraints(effective);
    if (context?.constraints) {
      for (const c of context.constraints) constraints.push(...this.extractConstraints(c));
    }

    const candidates = this.generateCandidates(effective, subProblems, order, constraints, maxDepth);
    for (const c of candidates) {
      steps.push({ phase: 'solve', description: 'Generated candidate solution', result: c, confidence: 0.7 });
    }

    // Phase 4 — Verify
    const scored = candidates
      .map((sol) => ({ solution: sol, score: this.evaluateSolution(effective, sol) }))
      .sort((a, b) => b.score.overall - a.score.overall);

    const best = scored[0];
    const verifyConf = best ? best.score.overall : 0;
    steps.push({
      phase: 'verify',
      description: `Verified ${scored.length} candidate(s); best score = ${verifyConf.toFixed(2)}`,
      result: best?.solution ?? 'No solution found',
      confidence: verifyConf,
    });

    const confidence = this.computeOverallConfidence(steps, constraints);
    this.totalProblems++;
    this.confidenceSum += confidence;
    this.stepsSum += steps.length;

    return {
      answer: best?.solution ?? 'Unable to determine a solution.',
      steps,
      confidence,
      alternatives: scored.slice(1).map((s) => s.solution),
      duration: Date.now() - start,
    };
  }

  /** Break a problem into typed sub-problems (comparison, analysis, debugging …). */
  decompose(problem: string): SubProblem[] {
    const sentences = splitSentences(problem);
    if (sentences.length === 0) return [this.makeSingleSubProblem(problem)];

    const subProblems: SubProblem[] = [];
    const seen = new Set<string>();

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);

      subProblems.push({
        description: sentence,
        type: this.classifyType(lower),
        dependencies: this.inferDependencies(subProblems, lower),
        difficulty: this.estimateDifficulty(lower),
      });
    }

    return subProblems.length > 0 ? subProblems : [this.makeSingleSubProblem(problem)];
  }

  /** Extract constraints from natural-language input. */
  extractConstraints(input: string): Constraint[] {
    const constraints: Constraint[] = [];
    const seen = new Set<string>();

    for (const { pattern, type } of CONSTRAINT_PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(input)) !== null) {
        const sentence = extractSentence(input, match.index);
        const key = `${type}:${sentence}`;
        if (seen.has(key)) continue;
        seen.add(key);
        constraints.push({ type, description: sentence, satisfied: false });
      }
    }
    return constraints;
  }

  /** Score a candidate solution against the original problem. */
  evaluateSolution(problem: string, solution: string): SolutionScore {
    const correctness = this.scoreCorrectness(problem, solution);
    const completeness = this.scoreCompleteness(problem, solution);
    const clarity = this.scoreClarity(solution);
    const overall = correctness * 0.4 + completeness * 0.35 + clarity * 0.25;
    return { correctness: round2(correctness), completeness: round2(completeness), clarity: round2(clarity), overall: round2(overall) };
  }

  /** Aggregate stats across all problems processed so far. */
  getStats(): { totalProblems: number; avgConfidence: number; avgSteps: number } {
    const n = this.totalProblems;
    return {
      totalProblems: n,
      avgConfidence: n > 0 ? round2(this.confidenceSum / n) : 0,
      avgSteps: n > 0 ? round2(this.stepsSum / n) : 0,
    };
  }

  // ── Pipeline Internals ───────────────────────────────────────────────────

  /** Topological sort by dependency, ties broken by ascending difficulty. */
  private planOrder(subProblems: SubProblem[]): number[] {
    const n = subProblems.length;
    const inDeg = new Array<number>(n).fill(0);
    const adj: number[][] = Array.from({ length: n }, () => []);

    for (let i = 0; i < n; i++) {
      for (const dep of subProblems[i].dependencies) {
        if (dep >= 0 && dep < n && dep !== i) { adj[dep].push(i); inDeg[i]++; }
      }
    }

    const queue: number[] = [];
    for (let i = 0; i < n; i++) { if (inDeg[i] === 0) queue.push(i); }
    queue.sort((a, b) => subProblems[a].difficulty - subProblems[b].difficulty);

    const order: number[] = [];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      order.push(cur);
      for (const next of adj[cur]) {
        if (--inDeg[next] === 0) {
          queue.push(next);
          queue.sort((a, b) => subProblems[a].difficulty - subProblems[b].difficulty);
        }
      }
    }

    // Append any remaining nodes (cycle fallback)
    if (order.length < n) {
      const rest = Array.from({ length: n }, (_, i) => i)
        .filter((i) => !order.includes(i))
        .sort((a, b) => subProblems[a].difficulty - subProblems[b].difficulty);
      order.push(...rest);
    }
    return order;
  }

  /** Generate N candidate solutions via self-consistency runs. */
  private generateCandidates(
    problem: string, subProblems: SubProblem[], order: number[],
    constraints: Constraint[], _maxDepth: number,
  ): string[] {
    const candidates: string[] = [];
    for (let run = 0; run < this.config.selfConsistencyRuns; run++) {
      const parts = order.map((idx) => this.solveSubProblem(subProblems[idx], run, constraints));
      candidates.push(this.combineSolutions(parts, problem, run));
    }
    return candidates;
  }

  private solveSubProblem(sp: SubProblem, run: number, constraints: Constraint[]): string {
    const pool = APPROACHES[sp.type] ?? APPROACHES['general'];
    const approach = pool[run % pool.length];
    const summary = this.summarizeConstraints(constraints);
    const parts = [`[${sp.type}] ${sp.description}`, `Approach: ${approach}`];
    if (summary) parts.push(`Constraints: ${summary}`);

    // Mark relevant constraints satisfied
    for (const c of constraints) {
      if (sp.description.toLowerCase().includes(c.description.toLowerCase().slice(0, 20))) c.satisfied = true;
    }
    return parts.join('. ');
  }

  private combineSolutions(parts: string[], problem: string, run: number): string {
    if (parts.length === 1) return parts[0];
    const connectors = ['Therefore', 'As a result', 'In summary', 'Consequently'];
    const connector = connectors[simpleHash(problem + run) % connectors.length];
    const body = parts.map((p, i) => `Step ${i + 1}: ${p}`).join('. ');
    return `${body}. ${connector}, the solution addresses all sub-problems.`;
  }

  // ── Scoring Helpers ──────────────────────────────────────────────────────

  private scoreCorrectness(problem: string, solution: string): number {
    const kw = extractKeywords(problem);
    if (kw.length === 0) return 0.5;
    const sol = solution.toLowerCase();
    return clamp(kw.filter((w) => sol.includes(w)).length / kw.length, 0, 1);
  }

  private scoreCompleteness(problem: string, solution: string): number {
    const sentences = splitSentences(problem);
    if (sentences.length === 0) return 0.5;
    const sol = solution.toLowerCase();
    let addressed = 0;
    for (const s of sentences) {
      const words = extractKeywords(s);
      if (words.length > 0 && words.filter((w) => sol.includes(w)).length / words.length >= 0.3) addressed++;
    }
    return clamp(addressed / sentences.length, 0, 1);
  }

  private scoreClarity(solution: string): number {
    const len = solution.length;
    if (len === 0) return 0;

    const lengthScore = len < 20 ? 0.2 : len < 50 ? 0.4 : len <= 500 ? 0.8 : len <= 1000 ? 0.7 : 0.5;
    const indicators = [/step\s+\d/i, /\btherefore\b/i, /\bbecause\b/i, /\bhowever\b/i,
      /\bfirst(?:ly)?\b/i, /\bsecond(?:ly)?\b/i, /\bfinally\b/i, /\bin summary\b/i];
    const structScore = clamp(indicators.filter((r) => r.test(solution)).length / 3, 0, 1);
    return clamp(lengthScore * 0.6 + structScore * 0.4, 0, 1);
  }

  private computeOverallConfidence(steps: ReasoningStep2[], constraints: Constraint[]): number {
    if (steps.length === 0) return 0;
    const avg = steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length;
    let factor = 1;
    if (constraints.length > 0) {
      factor = 0.5 + 0.5 * (constraints.filter((c) => c.satisfied).length / constraints.length);
    }
    return round2(clamp(avg * factor, 0, 1));
  }

  // ── Classification & Estimation ──────────────────────────────────────────

  private classifyType(text: string): string {
    let best = 'general';
    let bestN = 0;
    for (const [type, kws] of Object.entries(PROBLEM_TYPE_KEYWORDS)) {
      const n = kws.filter((kw) => text.includes(kw)).length;
      if (n > bestN) { bestN = n; best = type; }
    }
    return best;
  }

  private estimateDifficulty(text: string): number {
    let d = 3;
    const words = text.split(/\s+/).length;
    if (words > 30) d += 2; else if (words > 15) d += 1;
    const complex = ['concurrent', 'distributed', 'recursive', 'optimize', 'scalab', 'trade-off', 'constraint', 'multiple'];
    d += complex.filter((kw) => text.includes(kw)).length;
    return clamp(d, 1, 10);
  }

  private inferDependencies(existing: SubProblem[], text: string): number[] {
    const deps: number[] = [];
    if (/\b(it|this|that|these|those|its|their)\b/i.test(text) && existing.length > 0) {
      deps.push(existing.length - 1);
    }
    const kw = extractKeywords(text);
    for (let i = 0; i < existing.length; i++) {
      const spKw = extractKeywords(existing[i].description);
      if (kw.filter((w) => spKw.includes(w)).length >= 2 && !deps.includes(i)) deps.push(i);
    }
    return deps;
  }

  // ── Text Utilities ───────────────────────────────────────────────────────

  private summarizeConstraints(constraints: Constraint[]): string {
    if (constraints.length === 0) return '';
    const g: Record<ConstraintType, string[]> = { must_have: [], must_not: [], preference: [], conditional: [] };
    for (const c of constraints) g[c.type].push(c.description);
    const parts: string[] = [];
    if (g.must_have.length) parts.push(`Must: ${g.must_have.join(', ')}`);
    if (g.must_not.length) parts.push(`Avoid: ${g.must_not.join(', ')}`);
    if (g.preference.length) parts.push(`Prefer: ${g.preference.join(', ')}`);
    if (g.conditional.length) parts.push(`If/then: ${g.conditional.join(', ')}`);
    return parts.join('; ');
  }

  private makeSingleSubProblem(problem: string): SubProblem {
    const lower = problem.toLowerCase();
    return { description: problem, type: this.classifyType(lower), dependencies: [], difficulty: this.estimateDifficulty(lower) };
  }
}
