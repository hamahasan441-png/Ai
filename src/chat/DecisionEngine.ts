/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          ⚖️  D E C I S I O N   E N G I N E                                  ║
 * ║                                                                             ║
 * ║   Multi-criteria decision making and reasoning:                             ║
 * ║     analyze → evaluate → decide → learn                                     ║
 * ║                                                                             ║
 * ║     • Multi-Criteria Decision Analysis (TOPSIS, weighted, AHP)              ║
 * ║     • Bayesian inference with prior → posterior updates                     ║
 * ║     • Game theory: Nash equilibrium, minimax, dominance                     ║
 * ║     • Decision trees with expected value calculations                       ║
 * ║     • Prospect theory: risk & loss aversion modeling                        ║
 * ║     • Sensitivity analysis across parameter ranges                          ║
 * ║     • Group decision making with preference aggregation                     ║
 * ║     • Decision journaling for calibration tracking                          ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface DecisionEngineConfig {
  maxAlternatives: number;
  maxCriteria: number;
  bayesianPriorStrength: number;
  prospectAlpha: number;
  prospectBeta: number;
  prospectLambda: number;
  sensitivitySteps: number;
  enableLearning: boolean;
  journalCapacity: number;
}

export interface DecisionEngineStats {
  totalDecisions: number;
  totalBayesianUpdates: number;
  totalGameAnalyses: number;
  totalTreeEvaluations: number;
  totalSensitivityRuns: number;
  totalGroupDecisions: number;
  avgConfidence: number;
  journalEntries: number;
  feedbackReceived: number;
  feedbackAccuracy: number;
}

export interface Alternative {
  id: string;
  name: string;
  scores: Record<string, number>;
  metadata: Record<string, string>;
}

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  direction: 'maximize' | 'minimize';
  scale: { min: number; max: number };
}

export interface MCDAResult {
  ranking: Array<{ alternativeId: string; rank: number; score: number }>;
  scores: Record<string, number>;
  method: 'topsis' | 'weighted' | 'ahp';
  confidence: number;
  sensitivity: Array<{ criterionId: string; impact: number }>;
}

export interface BayesianBelief {
  hypothesis: string;
  prior: number;
  likelihood: number;
  posterior: number;
  evidence: string[];
}

export interface BayesianUpdate {
  belief: BayesianBelief;
  newEvidence: string;
  priorPosterior: number;
  newPosterior: number;
  surpriseLevel: number;
}

export interface GameMatrix {
  players: string[];
  strategies: string[][];
  payoffs: number[][][];
  nashEquilibria: Array<{ strategies: number[]; payoffs: number[] }>;
  dominantStrategies: Array<{ player: number; strategy: number }>;
}

export interface DecisionNode {
  type: 'choice' | 'chance' | 'terminal';
  label: string;
  probability?: number;
  value?: number;
  children?: DecisionNode[];
}

export interface DecisionTreeResult {
  tree: DecisionNode;
  expectedValues: Record<string, number>;
  optimalPath: string[];
  sensitivity: Array<{ node: string; impact: number }>;
}

export interface ProspectEvaluation {
  gains: number[];
  losses: number[];
  referencePoint: number;
  prospectValue: number;
  certaintyEquivalent: number;
  riskProfile: 'risk-averse' | 'risk-neutral' | 'risk-seeking';
}

export interface SensitivityResult {
  parameter: string;
  range: number[];
  outcomes: number[];
  breakpoints: number[];
  robustness: number;
}

export interface GroupDecision {
  stakeholders: string[];
  preferences: number[][];
  aggregation: 'borda' | 'condorcet' | 'plurality' | 'average';
  consensus: number;
  dissent: Array<{ stakeholder: string; disagreementLevel: number }>;
  ranking: Array<{ alternativeId: string; score: number }>;
}

export interface DecisionRecord {
  id: string;
  description: string;
  alternatives: string[];
  chosen: string;
  outcome?: string;
  timestamp: number;
  reflection?: string;
  confidence: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: DecisionEngineConfig = {
  maxAlternatives: 50,
  maxCriteria: 20,
  bayesianPriorStrength: 1.0,
  prospectAlpha: 0.88,
  prospectBeta: 0.88,
  prospectLambda: 2.25,
  sensitivitySteps: 10,
  enableLearning: true,
  journalCapacity: 500,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

let _idCounter = 0;
function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${(++_idCounter).toString(36)}`;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function sum(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0);
}

function mean(arr: number[]): number {
  return arr.length > 0 ? sum(arr) / arr.length : 0;
}

function euclideanDistance(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    s += d * d;
  }
  return Math.sqrt(s);
}

function normalizeWeights(weights: number[]): number[] {
  const total = sum(weights);
  if (total === 0) return weights.map(() => 1 / weights.length);
  return weights.map(w => w / total);
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class DecisionEngine {
  private readonly config: DecisionEngineConfig;
  private beliefs: Map<string, BayesianBelief> = new Map();
  private journal: DecisionRecord[] = [];
  private totalDecisions = 0;
  private totalBayesianUpdates = 0;
  private totalGameAnalyses = 0;
  private totalTreeEvaluations = 0;
  private totalSensitivityRuns = 0;
  private totalGroupDecisions = 0;
  private confidenceHistory: number[] = [];
  private feedbackCorrect = 0;
  private feedbackTotal = 0;

  constructor(config?: Partial<DecisionEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Multi-Criteria Decision Analysis ────────────────────────────────────

  /** Weighted sum scoring of alternatives against criteria. */
  weightedScore(alternatives: Alternative[], criteria: Criterion[]): MCDAResult {
    const alts = alternatives.slice(0, this.config.maxAlternatives);
    const crits = criteria.slice(0, this.config.maxCriteria);
    const weights = normalizeWeights(crits.map(c => c.weight));
    const scores: Record<string, number> = {};

    for (const alt of alts) {
      let total = 0;
      for (let i = 0; i < crits.length; i++) {
        const c = crits[i];
        const raw = alt.scores[c.id] ?? 0;
        const range = c.scale.max - c.scale.min || 1;
        const normalized = c.direction === 'maximize'
          ? (raw - c.scale.min) / range
          : (c.scale.max - raw) / range;
        total += clamp(normalized, 0, 1) * weights[i];
      }
      scores[alt.id] = round2(total);
    }

    const ranking = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([id, score], idx) => ({ alternativeId: id, rank: idx + 1, score }));

    const sensitivity = this.computeCriteriaSensitivity(alts, crits, 'weighted');
    const confidence = round2(crits.length > 1 ? 0.7 + 0.1 * Math.min(crits.length, 3) : 0.5);
    this.confidenceHistory.push(confidence);
    this.totalDecisions++;

    return { ranking, scores, method: 'weighted', confidence, sensitivity };
  }

  /** TOPSIS method — rank alternatives by closeness to ideal solution. */
  topsis(alternatives: Alternative[], criteria: Criterion[]): MCDAResult {
    const alts = alternatives.slice(0, this.config.maxAlternatives);
    const crits = criteria.slice(0, this.config.maxCriteria);
    const weights = normalizeWeights(crits.map(c => c.weight));

    // Build normalized decision matrix
    const matrix: number[][] = alts.map(alt =>
      crits.map((c, i) => {
        const raw = alt.scores[c.id] ?? 0;
        const range = c.scale.max - c.scale.min || 1;
        const norm = (raw - c.scale.min) / range;
        return clamp(norm, 0, 1) * weights[i];
      }),
    );

    // Determine ideal and anti-ideal
    const ideal: number[] = [];
    const antiIdeal: number[] = [];
    for (let j = 0; j < crits.length; j++) {
      const col = matrix.map(row => row[j]);
      if (crits[j].direction === 'maximize') {
        ideal.push(Math.max(...col));
        antiIdeal.push(Math.min(...col));
      } else {
        ideal.push(Math.min(...col));
        antiIdeal.push(Math.max(...col));
      }
    }

    // Compute closeness coefficient
    const scores: Record<string, number> = {};
    for (let i = 0; i < alts.length; i++) {
      const dPlus = euclideanDistance(matrix[i], ideal);
      const dMinus = euclideanDistance(matrix[i], antiIdeal);
      const denom = dPlus + dMinus;
      scores[alts[i].id] = round2(denom > 0 ? dMinus / denom : 0.5);
    }

    const ranking = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([id, score], idx) => ({ alternativeId: id, rank: idx + 1, score }));

    const sensitivity = this.computeCriteriaSensitivity(alts, crits, 'topsis');
    const confidence = round2(0.75 + 0.05 * Math.min(alts.length, 5));
    this.confidenceHistory.push(confidence);
    this.totalDecisions++;

    return { ranking, scores, method: 'topsis', confidence, sensitivity };
  }

  /** AHP-style pairwise comparison. The matrix should be n×n for n criteria. */
  ahpPairwise(
    alternatives: Alternative[],
    criteria: Criterion[],
    pairwiseMatrix: number[][],
  ): MCDAResult {
    const n = criteria.length;
    const alts = alternatives.slice(0, this.config.maxAlternatives);
    const crits = criteria.slice(0, this.config.maxCriteria);

    // Derive weights via geometric mean method
    const derivedWeights: number[] = [];
    for (let i = 0; i < n; i++) {
      let prod = 1;
      for (let j = 0; j < n; j++) {
        prod *= (pairwiseMatrix[i]?.[j] ?? 1);
      }
      derivedWeights.push(Math.pow(prod, 1 / n));
    }
    const normalizedWeights = normalizeWeights(derivedWeights);

    // Apply derived weights with weighted scoring
    const modifiedCriteria = crits.map((c, i) => ({
      ...c,
      weight: normalizedWeights[i] ?? c.weight,
    }));

    const result = this.weightedScore(alts, modifiedCriteria);

    // Compute consistency ratio
    const cr = this.computeConsistencyRatio(pairwiseMatrix, n);
    const confidence = round2(cr < 0.1 ? 0.9 : cr < 0.2 ? 0.7 : 0.5);

    return {
      ...result,
      method: 'ahp',
      confidence,
      sensitivity: this.computeCriteriaSensitivity(alts, modifiedCriteria, 'ahp'),
    };
  }

  // ── Bayesian Inference ─────────────────────────────────────────────────

  /** Create a Bayesian belief with a prior probability. */
  createBelief(hypothesis: string, prior: number): BayesianBelief {
    const belief: BayesianBelief = {
      hypothesis,
      prior: clamp(prior, 0.001, 0.999),
      likelihood: 0.5,
      posterior: clamp(prior, 0.001, 0.999),
      evidence: [],
    };
    this.beliefs.set(hypothesis, belief);
    return { ...belief };
  }

  /** Update a belief with new evidence via Bayes' theorem. */
  updateBelief(
    hypothesis: string,
    evidence: string,
    likelihoodGivenTrue: number,
    likelihoodGivenFalse: number,
  ): BayesianUpdate {
    let belief = this.beliefs.get(hypothesis);
    if (!belief) {
      belief = this.createBelief(hypothesis, 0.5);
    }

    const priorPosterior = belief.posterior;
    const pTrue = likelihoodGivenTrue * priorPosterior;
    const pFalse = likelihoodGivenFalse * (1 - priorPosterior);
    const pEvidence = pTrue + pFalse;
    const newPosterior = pEvidence > 0 ? clamp(pTrue / pEvidence, 0.001, 0.999) : priorPosterior;

    const surpriseLevel = round2(
      pEvidence > 0 ? -Math.log2(pEvidence) : 0,
    );

    belief.posterior = newPosterior;
    belief.likelihood = likelihoodGivenTrue;
    belief.evidence.push(evidence);
    this.beliefs.set(hypothesis, belief);
    this.totalBayesianUpdates++;

    return {
      belief: { ...belief },
      newEvidence: evidence,
      priorPosterior: round2(priorPosterior),
      newPosterior: round2(newPosterior),
      surpriseLevel,
    };
  }

  /** Retrieve the current state of a belief. */
  getBelief(hypothesis: string): BayesianBelief | undefined {
    const b = this.beliefs.get(hypothesis);
    return b ? { ...b, evidence: [...b.evidence] } : undefined;
  }

  /** List all active beliefs. */
  listBeliefs(): BayesianBelief[] {
    return Array.from(this.beliefs.values()).map(b => ({
      ...b,
      evidence: [...b.evidence],
    }));
  }

  // ── Game Theory ────────────────────────────────────────────────────────

  /** Analyze a 2-player game matrix for Nash equilibria and dominant strategies. */
  analyzeGame(
    players: string[],
    strategies: string[][],
    payoffs: number[][][],
  ): GameMatrix {
    const nashEquilibria: GameMatrix['nashEquilibria'] = [];
    const dominantStrategies: GameMatrix['dominantStrategies'] = [];
    const numP0 = strategies[0]?.length ?? 0;
    const numP1 = strategies[1]?.length ?? 0;

    // Find dominant strategies for each player
    const domP0 = this.findDominantStrategy(payoffs, 0, numP0, numP1);
    const domP1 = this.findDominantStrategy(payoffs, 1, numP0, numP1);
    if (domP0 !== -1) dominantStrategies.push({ player: 0, strategy: domP0 });
    if (domP1 !== -1) dominantStrategies.push({ player: 1, strategy: domP1 });

    // Find pure-strategy Nash equilibria
    for (let i = 0; i < numP0; i++) {
      for (let j = 0; j < numP1; j++) {
        const p0Payoff = payoffs[i]?.[j]?.[0] ?? 0;
        const p1Payoff = payoffs[i]?.[j]?.[1] ?? 0;

        // Check if i is best response for player 0 given j
        let p0Best = true;
        for (let ii = 0; ii < numP0; ii++) {
          if ((payoffs[ii]?.[j]?.[0] ?? 0) > p0Payoff) { p0Best = false; break; }
        }

        // Check if j is best response for player 1 given i
        let p1Best = true;
        for (let jj = 0; jj < numP1; jj++) {
          if ((payoffs[i]?.[jj]?.[1] ?? 0) > p1Payoff) { p1Best = false; break; }
        }

        if (p0Best && p1Best) {
          nashEquilibria.push({
            strategies: [i, j],
            payoffs: [p0Payoff, p1Payoff],
          });
        }
      }
    }

    this.totalGameAnalyses++;
    const confidence = round2(nashEquilibria.length > 0 ? 0.85 : 0.5);
    this.confidenceHistory.push(confidence);

    return { players, strategies, payoffs, nashEquilibria, dominantStrategies };
  }

  /** Minimax decision: choose the strategy that maximizes the minimum payoff. */
  minimax(payoffs: number[][]): { strategy: number; value: number } {
    let bestStrategy = 0;
    let bestWorst = -Infinity;

    for (let i = 0; i < payoffs.length; i++) {
      const worst = Math.min(...(payoffs[i] ?? [0]));
      if (worst > bestWorst) {
        bestWorst = worst;
        bestStrategy = i;
      }
    }

    this.totalGameAnalyses++;
    return { strategy: bestStrategy, value: round2(bestWorst) };
  }

  // ── Decision Trees ─────────────────────────────────────────────────────

  /** Evaluate a decision tree and find the optimal path. */
  evaluateTree(root: DecisionNode): DecisionTreeResult {
    const expectedValues: Record<string, number> = {};
    const optimalPath: string[] = [];

    const evaluate = (node: DecisionNode): number => {
      if (node.type === 'terminal' || !node.children?.length) {
        const val = node.value ?? 0;
        expectedValues[node.label] = round2(val);
        return val;
      }

      const childValues = node.children.map(c => evaluate(c));

      let ev: number;
      if (node.type === 'chance') {
        ev = 0;
        for (let i = 0; i < node.children.length; i++) {
          const prob = node.children[i].probability ?? (1 / node.children.length);
          ev += prob * childValues[i];
        }
      } else {
        ev = Math.max(...childValues);
      }

      expectedValues[node.label] = round2(ev);
      return ev;
    };

    evaluate(root);

    // Trace optimal path
    const tracePath = (node: DecisionNode): void => {
      optimalPath.push(node.label);
      if (!node.children?.length) return;

      if (node.type === 'choice') {
        const childEVs = node.children.map(c => expectedValues[c.label] ?? 0);
        const bestIdx = childEVs.indexOf(Math.max(...childEVs));
        tracePath(node.children[bestIdx]);
      } else if (node.type === 'chance') {
        // Follow highest expected value branch for reporting
        const childEVs = node.children.map(c => expectedValues[c.label] ?? 0);
        const bestIdx = childEVs.indexOf(Math.max(...childEVs));
        tracePath(node.children[bestIdx]);
      }
    };
    tracePath(root);

    // Sensitivity: how much each node's value matters
    const sensitivity = Object.entries(expectedValues).map(([label, val]) => ({
      node: label,
      impact: round2(Math.abs(val - (expectedValues[root.label] ?? 0)) / (Math.abs(expectedValues[root.label] ?? 1) || 1)),
    }));

    this.totalTreeEvaluations++;
    const confidence = round2(0.7 + 0.05 * Math.min(optimalPath.length, 6));
    this.confidenceHistory.push(confidence);

    return { tree: root, expectedValues, optimalPath, sensitivity };
  }

  // ── Prospect Theory ────────────────────────────────────────────────────

  /** Evaluate outcomes through prospect theory's value function. */
  evaluateProspect(
    outcomes: Array<{ value: number; probability: number }>,
    referencePoint: number = 0,
  ): ProspectEvaluation {
    const { prospectAlpha, prospectBeta, prospectLambda } = this.config;
    const gains: number[] = [];
    const losses: number[] = [];
    let prospectValue = 0;

    for (const o of outcomes) {
      const x = o.value - referencePoint;
      let v: number;

      if (x >= 0) {
        v = Math.pow(x, prospectAlpha);
        gains.push(round2(x));
      } else {
        v = -prospectLambda * Math.pow(-x, prospectBeta);
        losses.push(round2(x));
      }

      // Weight probability using Prelec function approximation
      const w = this.prospectWeight(o.probability);
      prospectValue += v * w;
    }

    prospectValue = round2(prospectValue);

    // Certainty equivalent: the guaranteed value yielding same prospect value
    const ce = prospectValue >= 0
      ? round2(Math.pow(Math.abs(prospectValue), 1 / prospectAlpha))
      : round2(-Math.pow(Math.abs(prospectValue) / prospectLambda, 1 / prospectBeta));

    const expectedValue = sum(outcomes.map(o => o.value * o.probability));
    let riskProfile: ProspectEvaluation['riskProfile'];
    if (Math.abs(ce - expectedValue) < 0.01) {
      riskProfile = 'risk-neutral';
    } else if (ce < expectedValue) {
      riskProfile = 'risk-averse';
    } else {
      riskProfile = 'risk-seeking';
    }

    const confidence = round2(0.65 + 0.05 * Math.min(outcomes.length, 7));
    this.confidenceHistory.push(confidence);
    this.totalDecisions++;

    return { gains, losses, referencePoint, prospectValue, certaintyEquivalent: ce, riskProfile };
  }

  // ── Sensitivity Analysis ───────────────────────────────────────────────

  /** Analyze sensitivity of a scoring function to a parameter. */
  analyzeSensitivity(
    parameterName: string,
    baseValue: number,
    range: { min: number; max: number },
    scoreFn: (paramValue: number) => number,
  ): SensitivityResult {
    const steps = this.config.sensitivitySteps;
    const step = (range.max - range.min) / steps;
    const rangeValues: number[] = [];
    const outcomes: number[] = [];
    const breakpoints: number[] = [];

    const baseOutcome = scoreFn(baseValue);
    let prevOutcome = NaN;
    let prevSign = 0;

    for (let i = 0; i <= steps; i++) {
      const param = range.min + i * step;
      const outcome = round2(scoreFn(param));
      rangeValues.push(round2(param));
      outcomes.push(outcome);

      // Detect sign changes relative to base outcome
      const diff = outcome - baseOutcome;
      const sign = diff > 0 ? 1 : diff < 0 ? -1 : 0;
      if (prevSign !== 0 && sign !== 0 && sign !== prevSign) {
        breakpoints.push(round2(param - step / 2));
      }
      prevSign = sign;
      prevOutcome = outcome;
    }

    // Robustness = 1 - normalized variance of outcomes
    const outcomeMean = mean(outcomes);
    const variance = outcomes.length > 0
      ? sum(outcomes.map(o => (o - outcomeMean) ** 2)) / outcomes.length
      : 0;
    const maxRange = Math.max(Math.abs(Math.max(...outcomes) - outcomeMean), 1);
    const robustness = round2(clamp(1 - Math.sqrt(variance) / maxRange, 0, 1));

    this.totalSensitivityRuns++;

    return { parameter: parameterName, range: rangeValues, outcomes, breakpoints, robustness };
  }

  /** Batch sensitivity on all criteria weights for an MCDA result. */
  sensitivityOnWeights(
    alternatives: Alternative[],
    criteria: Criterion[],
    method: 'topsis' | 'weighted' = 'weighted',
  ): SensitivityResult[] {
    const results: SensitivityResult[] = [];

    for (const c of criteria) {
      const result = this.analyzeSensitivity(
        `weight_${c.id}`,
        c.weight,
        { min: 0, max: 1 },
        (w) => {
          const modified = criteria.map(cr =>
            cr.id === c.id ? { ...cr, weight: w } : cr,
          );
          const mcda = method === 'topsis'
            ? this.topsis(alternatives, modified)
            : this.weightedScore(alternatives, modified);
          // Return the top alternative's score
          return mcda.ranking[0]?.score ?? 0;
        },
      );
      results.push(result);
    }

    return results;
  }

  // ── Group Decision Making ──────────────────────────────────────────────

  /** Aggregate preferences from multiple stakeholders using Borda count. */
  bordaCount(
    stakeholders: string[],
    preferences: number[][],
    alternativeIds: string[],
  ): GroupDecision {
    const n = alternativeIds.length;
    const scores: number[] = new Array(n).fill(0);

    for (const pref of preferences) {
      for (let rank = 0; rank < pref.length; rank++) {
        const altIdx = pref[rank];
        if (altIdx >= 0 && altIdx < n) {
          scores[altIdx] += (n - 1 - rank);
        }
      }
    }

    const maxScore = (n - 1) * preferences.length;
    const ranking = alternativeIds.map((id, idx) => ({
      alternativeId: id,
      score: round2(maxScore > 0 ? scores[idx] / maxScore : 0),
    })).sort((a, b) => b.score - a.score);

    const consensus = this.computeConsensus(preferences, n);
    const dissent = this.computeDissent(stakeholders, preferences, ranking);

    this.totalGroupDecisions++;
    const confidence = round2(0.6 + 0.1 * consensus);
    this.confidenceHistory.push(confidence);

    return { stakeholders, preferences, aggregation: 'borda', consensus, dissent, ranking };
  }

  /** Condorcet method: pairwise majority comparison. */
  condorcet(
    stakeholders: string[],
    preferences: number[][],
    alternativeIds: string[],
  ): GroupDecision {
    const n = alternativeIds.length;
    // pairwise[i][j] = how many voters prefer i over j
    const pairwise: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

    for (const pref of preferences) {
      for (let r1 = 0; r1 < pref.length; r1++) {
        for (let r2 = r1 + 1; r2 < pref.length; r2++) {
          const a = pref[r1];
          const b = pref[r2];
          if (a >= 0 && a < n && b >= 0 && b < n) {
            pairwise[a][b]++;
          }
        }
      }
    }

    // Compute Copeland scores: +1 for each pairwise win, -1 for loss
    const copeland: number[] = new Array(n).fill(0);
    const majority = preferences.length / 2;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          if (pairwise[i][j] > majority) copeland[i]++;
          else if (pairwise[i][j] < majority) copeland[i]--;
        }
      }
    }

    const maxCopeland = Math.max(...copeland, 1);
    const ranking = alternativeIds.map((id, idx) => ({
      alternativeId: id,
      score: round2((copeland[idx] + (n - 1)) / (2 * (n - 1) || 1)),
    })).sort((a, b) => b.score - a.score);

    const consensus = this.computeConsensus(preferences, n);
    const dissent = this.computeDissent(stakeholders, preferences, ranking);

    this.totalGroupDecisions++;
    const confidence = round2(0.65 + 0.1 * consensus);
    this.confidenceHistory.push(confidence);

    return { stakeholders, preferences, aggregation: 'condorcet', consensus, dissent, ranking };
  }

  /** Plurality voting: count first-place votes. */
  plurality(
    stakeholders: string[],
    preferences: number[][],
    alternativeIds: string[],
  ): GroupDecision {
    const n = alternativeIds.length;
    const firstPlaceVotes: number[] = new Array(n).fill(0);

    for (const pref of preferences) {
      const first = pref[0];
      if (first >= 0 && first < n) {
        firstPlaceVotes[first]++;
      }
    }

    const totalVotes = preferences.length || 1;
    const ranking = alternativeIds.map((id, idx) => ({
      alternativeId: id,
      score: round2(firstPlaceVotes[idx] / totalVotes),
    })).sort((a, b) => b.score - a.score);

    const consensus = this.computeConsensus(preferences, n);
    const dissent = this.computeDissent(stakeholders, preferences, ranking);

    this.totalGroupDecisions++;
    const confidence = round2(0.55 + 0.1 * consensus);
    this.confidenceHistory.push(confidence);

    return { stakeholders, preferences, aggregation: 'plurality', consensus, dissent, ranking };
  }

  // ── Decision Journaling ────────────────────────────────────────────────

  /** Record a decision for future calibration. */
  recordDecision(
    description: string,
    alternatives: string[],
    chosen: string,
    confidence: number,
  ): DecisionRecord {
    const record: DecisionRecord = {
      id: generateId('dec'),
      description,
      alternatives,
      chosen,
      timestamp: Date.now(),
      confidence: clamp(confidence, 0, 1),
    };

    this.journal.push(record);
    if (this.journal.length > this.config.journalCapacity) {
      this.journal.shift();
    }

    return { ...record };
  }

  /** Record the outcome of a past decision. */
  recordOutcome(decisionId: string, outcome: string, reflection?: string): DecisionRecord | undefined {
    const record = this.journal.find(r => r.id === decisionId);
    if (!record) return undefined;

    record.outcome = outcome;
    record.reflection = reflection;
    return { ...record };
  }

  /** Get all journaled decisions. */
  getJournal(): DecisionRecord[] {
    return this.journal.map(r => ({ ...r }));
  }

  /** Compute calibration: how well confidence matches actual correctness. */
  getCalibration(): Array<{ bucket: string; predicted: number; actual: number; count: number }> {
    const buckets: Map<string, { predicted: number[]; correct: number }> = new Map();
    const completedRecords = this.journal.filter(r => r.outcome !== undefined);

    for (const record of completedRecords) {
      const bucketKey = `${Math.floor(record.confidence * 10) * 10}-${Math.floor(record.confidence * 10) * 10 + 10}%`;
      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, { predicted: [], correct: 0 });
      }
      const bucket = buckets.get(bucketKey)!;
      bucket.predicted.push(record.confidence);
      // Simple heuristic: outcome containing "success" or "correct" counts as correct
      if (record.outcome && /success|correct|good|positive/i.test(record.outcome)) {
        bucket.correct++;
      }
    }

    return Array.from(buckets.entries()).map(([bucket, data]) => ({
      bucket,
      predicted: round2(mean(data.predicted)),
      actual: round2(data.predicted.length > 0 ? data.correct / data.predicted.length : 0),
      count: data.predicted.length,
    }));
  }

  // ── Feedback ───────────────────────────────────────────────────────────

  /** Provide feedback on a decision outcome for learning. */
  provideFeedback(decisionId: string, wasCorrect: boolean): void {
    this.feedbackTotal++;
    if (wasCorrect) this.feedbackCorrect++;

    if (this.config.enableLearning) {
      const record = this.journal.find(r => r.id === decisionId);
      if (record) {
        record.outcome = wasCorrect ? 'success (feedback)' : 'failure (feedback)';
      }
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────

  /** Return aggregate statistics. */
  getStats(): Readonly<DecisionEngineStats> {
    const avg = this.confidenceHistory.length > 0
      ? this.confidenceHistory.reduce((s, v) => s + v, 0) / this.confidenceHistory.length
      : 0;

    return {
      totalDecisions: this.totalDecisions,
      totalBayesianUpdates: this.totalBayesianUpdates,
      totalGameAnalyses: this.totalGameAnalyses,
      totalTreeEvaluations: this.totalTreeEvaluations,
      totalSensitivityRuns: this.totalSensitivityRuns,
      totalGroupDecisions: this.totalGroupDecisions,
      avgConfidence: round2(avg),
      journalEntries: this.journal.length,
      feedbackReceived: this.feedbackTotal,
      feedbackAccuracy: this.feedbackTotal > 0
        ? round2(this.feedbackCorrect / this.feedbackTotal)
        : 0,
    };
  }

  // ── Serialization ──────────────────────────────────────────────────────

  /** Serialize the engine state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      beliefs: Array.from(this.beliefs.entries()),
      journal: this.journal,
      totalDecisions: this.totalDecisions,
      totalBayesianUpdates: this.totalBayesianUpdates,
      totalGameAnalyses: this.totalGameAnalyses,
      totalTreeEvaluations: this.totalTreeEvaluations,
      totalSensitivityRuns: this.totalSensitivityRuns,
      totalGroupDecisions: this.totalGroupDecisions,
      confidenceHistory: this.confidenceHistory,
      feedbackCorrect: this.feedbackCorrect,
      feedbackTotal: this.feedbackTotal,
    });
  }

  /** Restore a DecisionEngine from serialized JSON. */
  static deserialize(json: string): DecisionEngine {
    const data = JSON.parse(json) as {
      config: DecisionEngineConfig;
      beliefs: Array<[string, BayesianBelief]>;
      journal: DecisionRecord[];
      totalDecisions: number;
      totalBayesianUpdates: number;
      totalGameAnalyses: number;
      totalTreeEvaluations: number;
      totalSensitivityRuns: number;
      totalGroupDecisions: number;
      confidenceHistory: number[];
      feedbackCorrect: number;
      feedbackTotal: number;
    };

    const instance = new DecisionEngine(data.config);
    instance.beliefs = new Map(data.beliefs);
    instance.journal = data.journal;
    instance.totalDecisions = data.totalDecisions;
    instance.totalBayesianUpdates = data.totalBayesianUpdates;
    instance.totalGameAnalyses = data.totalGameAnalyses;
    instance.totalTreeEvaluations = data.totalTreeEvaluations;
    instance.totalSensitivityRuns = data.totalSensitivityRuns;
    instance.totalGroupDecisions = data.totalGroupDecisions;
    instance.confidenceHistory = data.confidenceHistory;
    instance.feedbackCorrect = data.feedbackCorrect;
    instance.feedbackTotal = data.feedbackTotal;
    return instance;
  }

  // ── Private Helpers ────────────────────────────────────────────────────

  /** Compute sensitivity of the top-ranked alternative to each criterion weight. */
  private computeCriteriaSensitivity(
    alts: Alternative[],
    crits: Criterion[],
    _method: string,
  ): Array<{ criterionId: string; impact: number }> {
    const results: Array<{ criterionId: string; impact: number }> = [];
    const baseWeights = normalizeWeights(crits.map(c => c.weight));

    for (let k = 0; k < crits.length; k++) {
      // Perturb weight up and down by 20%
      const delta = 0.2;
      const upWeights = [...baseWeights];
      const downWeights = [...baseWeights];
      upWeights[k] = Math.min(1, upWeights[k] * (1 + delta));
      downWeights[k] = Math.max(0.001, downWeights[k] * (1 - delta));

      const upNorm = normalizeWeights(upWeights);
      const downNorm = normalizeWeights(downWeights);

      const scoreUp = this.computeWeightedTotal(alts, crits, upNorm);
      const scoreDown = this.computeWeightedTotal(alts, crits, downNorm);

      // Impact = max difference in top score
      const topUp = Math.max(...Object.values(scoreUp));
      const topDown = Math.max(...Object.values(scoreDown));

      results.push({
        criterionId: crits[k].id,
        impact: round2(Math.abs(topUp - topDown)),
      });
    }

    return results;
  }

  /** Compute weighted total scores for all alternatives. */
  private computeWeightedTotal(
    alts: Alternative[],
    crits: Criterion[],
    weights: number[],
  ): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const alt of alts) {
      let total = 0;
      for (let i = 0; i < crits.length; i++) {
        const c = crits[i];
        const raw = alt.scores[c.id] ?? 0;
        const range = c.scale.max - c.scale.min || 1;
        const normalized = c.direction === 'maximize'
          ? (raw - c.scale.min) / range
          : (c.scale.max - raw) / range;
        total += clamp(normalized, 0, 1) * weights[i];
      }
      scores[alt.id] = round2(total);
    }
    return scores;
  }

  /** AHP consistency ratio computation. */
  private computeConsistencyRatio(matrix: number[][], n: number): number {
    if (n <= 2) return 0;

    // Random index values for matrices of size 1..10
    const ri = [0, 0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

    // Approximate max eigenvalue via column sum method
    const colSums: number[] = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        colSums[j] += (matrix[i]?.[j] ?? 1);
      }
    }

    const normalizedRowSums: number[] = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        normalizedRowSums[i] += (matrix[i]?.[j] ?? 1) / (colSums[j] || 1);
      }
      normalizedRowSums[i] /= n;
    }

    // Compute lambda max
    let lambdaMax = 0;
    for (let j = 0; j < n; j++) {
      let weightedSum = 0;
      for (let i = 0; i < n; i++) {
        weightedSum += (matrix[i]?.[j] ?? 1) * normalizedRowSums[i];
      }
      lambdaMax += weightedSum / (normalizedRowSums[j] || 1);
    }
    lambdaMax /= n;

    const ci = (lambdaMax - n) / (n - 1);
    const riVal = ri[n] ?? 1.49;
    return riVal > 0 ? ci / riVal : 0;
  }

  /** Find a strictly dominant strategy for a player. */
  private findDominantStrategy(
    payoffs: number[][][],
    player: number,
    numP0: number,
    numP1: number,
  ): number {
    const numStrategies = player === 0 ? numP0 : numP1;
    const numOpponent = player === 0 ? numP1 : numP0;

    for (let s = 0; s < numStrategies; s++) {
      let dominant = true;
      for (let other = 0; other < numStrategies && dominant; other++) {
        if (other === s) continue;
        for (let opp = 0; opp < numOpponent; opp++) {
          const myPayoff = player === 0
            ? (payoffs[s]?.[opp]?.[0] ?? 0)
            : (payoffs[opp]?.[s]?.[1] ?? 0);
          const otherPayoff = player === 0
            ? (payoffs[other]?.[opp]?.[0] ?? 0)
            : (payoffs[opp]?.[other]?.[1] ?? 0);
          if (otherPayoff >= myPayoff) { dominant = false; break; }
        }
      }
      if (dominant) return s;
    }
    return -1;
  }

  /** Prospect theory probability weighting (Prelec, 1998). */
  private prospectWeight(p: number): number {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    const gamma = 0.65;
    const logP = -Math.pow(-Math.log(p), gamma);
    return Math.exp(logP);
  }

  /** Compute consensus level among voter preferences (0 to 1). */
  private computeConsensus(preferences: number[][], numAlts: number): number {
    if (preferences.length < 2 || numAlts < 2) return 1;

    let totalAgreement = 0;
    let totalPairs = 0;

    for (let i = 0; i < preferences.length; i++) {
      for (let j = i + 1; j < preferences.length; j++) {
        // Kendall tau distance
        let concordant = 0;
        let discordant = 0;
        const pA = preferences[i];
        const pB = preferences[j];
        const rankA = this.prefToRanks(pA, numAlts);
        const rankB = this.prefToRanks(pB, numAlts);

        for (let a = 0; a < numAlts; a++) {
          for (let b = a + 1; b < numAlts; b++) {
            const dA = rankA[a] - rankA[b];
            const dB = rankB[a] - rankB[b];
            if (dA * dB > 0) concordant++;
            else if (dA * dB < 0) discordant++;
          }
        }

        const total = concordant + discordant;
        totalAgreement += total > 0 ? concordant / total : 1;
        totalPairs++;
      }
    }

    return round2(totalPairs > 0 ? totalAgreement / totalPairs : 1);
  }

  /** Convert preference ordering to rank array. */
  private prefToRanks(pref: number[], numAlts: number): number[] {
    const ranks = new Array(numAlts).fill(numAlts);
    for (let rank = 0; rank < pref.length; rank++) {
      if (pref[rank] >= 0 && pref[rank] < numAlts) {
        ranks[pref[rank]] = rank;
      }
    }
    return ranks;
  }

  /** Compute dissent levels per stakeholder. */
  private computeDissent(
    stakeholders: string[],
    preferences: number[][],
    ranking: Array<{ alternativeId: string; score: number }>,
  ): Array<{ stakeholder: string; disagreementLevel: number }> {
    return stakeholders.map((name, idx) => {
      const pref = preferences[idx] ?? [];
      let disagreement = 0;

      for (let rank = 0; rank < pref.length; rank++) {
        const altIdx = pref[rank];
        const groupRank = ranking.findIndex(r => r.alternativeId === ranking[altIdx]?.alternativeId);
        if (groupRank >= 0) {
          disagreement += Math.abs(rank - groupRank);
        }
      }

      const maxDisagreement = pref.length * pref.length || 1;
      return {
        stakeholder: name,
        disagreementLevel: round2(clamp(disagreement / maxDisagreement, 0, 1)),
      };
    });
  }
}
