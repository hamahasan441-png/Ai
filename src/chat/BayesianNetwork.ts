/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Bayesian Network — Probabilistic Reasoning with Directed Graphical Models   ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Directed Acyclic Graph — Nodes as random variables, edges as deps       ║
 * ║    ✦ Conditional Probability Tables — Full CPT management per node           ║
 * ║    ✦ Variable Elimination — Exact inference over posterior distributions      ║
 * ║    ✦ MAP Inference — Find most probable variable assignments                 ║
 * ║    ✦ D-Separation — Test conditional independence between variables          ║
 * ║    ✦ Structure Learning — Learn graph topology from observed data            ║
 * ║    ✦ Parameter Learning — Estimate CPTs from frequency counts               ║
 * ║    ✦ Sensitivity Analysis — Measure how parameter changes affect queries     ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────

/**
 * Configuration for the Bayesian network engine.
 */
export interface BayesianNetworkConfig {
  /** Maximum number of nodes allowed in the network. */
  maxNodes: number
  /** Maximum number of parents per node (limits CPT size). */
  maxParentsPerNode: number
  /** Laplace smoothing factor for parameter learning. */
  laplaceSmoothingFactor: number
  /** Convergence threshold for iterative algorithms. */
  convergenceThreshold: number
  /** Maximum iterations for inference algorithms. */
  maxInferenceIterations: number
  /** Default number of states for newly added nodes. */
  defaultStates: string[]
  /** Minimum correlation threshold for structure learning. */
  structureLearningThreshold: number
  /** Step size for sensitivity analysis perturbation. */
  sensitivityStepSize: number
}

/**
 * A node in the Bayesian network representing a random variable.
 *
 * Each node has a discrete set of possible states (e.g. ['true', 'false']
 * or ['low', 'medium', 'high']) and an optional description.
 */
export interface BayesianNode {
  /** Unique identifier for this node. */
  id: string
  /** Human-readable label. */
  name: string
  /** Possible discrete states this variable can take. */
  states: string[]
  /** Optional description of what this variable represents. */
  description: string
  /** Timestamp when the node was added. */
  createdAt: number
}

/**
 * A directed edge in the Bayesian network indicating a
 * conditional dependency from parent → child.
 */
export interface BayesianEdge {
  /** Source (parent) node ID. */
  from: string
  /** Target (child) node ID. */
  to: string
  /** Optional numeric strength/weight metadata. */
  strength: number
}

/**
 * Conditional Probability Table for a node.
 *
 * For a node with parents, the table maps each combination of parent states
 * to a probability distribution over the node's own states.
 *
 * The key is a pipe-delimited string of parent state values in the same
 * order as `parentIds` (e.g. "true|high").  For root nodes with no parents
 * the single key is the empty string "".
 *
 * Each value is a record mapping the node's state names to probabilities
 * that must sum to 1.
 */
export interface ConditionalProbabilityTable {
  /** The node this CPT belongs to. */
  nodeId: string
  /** Ordered list of parent node IDs that form the conditioning set. */
  parentIds: string[]
  /**
   * parentComboKey → { state → probability }.
   *
   * Example for a node with states ['true','false'] and one binary parent:
   * ```
   * {
   *   "true":  { "true": 0.8, "false": 0.2 },
   *   "false": { "true": 0.3, "false": 0.7 }
   * }
   * ```
   */
  probabilities: Record<string, Record<string, number>>
}

/**
 * An evidence observation: a variable fixed to a known state.
 */
export interface Evidence {
  /** Node ID of the observed variable. */
  nodeId: string
  /** Observed state value. */
  state: string
}

/**
 * Result of a probabilistic inference query.
 *
 * Contains the posterior distribution over the query variable's states
 * given the currently set evidence.
 */
export interface InferenceResult {
  /** The node that was queried. */
  nodeId: string
  /** Posterior probability distribution: state → probability. */
  distribution: Record<string, number>
  /** Which evidence was active during inference. */
  evidence: Evidence[]
  /** Computation time in milliseconds. */
  computationTimeMs: number
}

/**
 * Snapshot of the full network structure: nodes + edges.
 */
export interface NetworkStructure {
  nodes: BayesianNode[]
  edges: BayesianEdge[]
  nodeCount: number
  edgeCount: number
}

/**
 * Validation report for network integrity checks.
 */
export interface NetworkValidation {
  /** Whether the network is a valid DAG. */
  isValid: boolean
  /** Whether the graph is acyclic. */
  isAcyclic: boolean
  /** Whether all CPTs are consistent with their node's parents and states. */
  cptConsistency: boolean
  /** Whether every probability row sums to ~1. */
  probabilitiesNormalized: boolean
  /** List of human-readable issues found. */
  issues: string[]
}

/**
 * Summary statistics for the network.
 */
export interface BayesianNetworkStats {
  nodeCount: number
  edgeCount: number
  cptCount: number
  evidenceCount: number
  averageParents: number
  maxParents: number
  rootNodes: number
  leafNodes: number
  averageStatesPerNode: number
}

// ── Constants ────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: BayesianNetworkConfig = {
  maxNodes: 200,
  maxParentsPerNode: 8,
  laplaceSmoothingFactor: 1.0,
  convergenceThreshold: 1e-6,
  maxInferenceIterations: 1000,
  defaultStates: ['true', 'false'],
  structureLearningThreshold: 0.3,
  sensitivityStepSize: 0.05,
};

/** Tolerance when checking that probabilities sum to 1. */
const PROBABILITY_SUM_TOLERANCE = 1e-4;

// ── Internal Helpers ─────────────────────────────────────────────────────

/**
 * Build the pipe-delimited key that indexes into a CPT's probability map.
 * The values must be provided in the same order as the CPT's `parentIds`.
 */
function buildParentKey(parentStates: string[]): string {
  return parentStates.join('|');
}

/**
 * Enumerate every combination of states for a list of variables.
 *
 * Returns an array of arrays, where each inner array contains one
 * state value per variable (in the same order as `statesPerVariable`).
 *
 * Example: statesPerVariable = [['T','F'], ['H','L']]
 *   → [['T','H'], ['T','L'], ['F','H'], ['F','L']]
 */
function enumerateStateCombinations(statesPerVariable: string[][]): string[][] {
  if (statesPerVariable.length === 0) return [[]];

  const result: string[][] = [];
  const counts = statesPerVariable.map(s => s.length);
  const total = counts.reduce((a, b) => a * b, 1);

  for (let i = 0; i < total; i++) {
    const combo: string[] = [];
    let remainder = i;
    for (let v = statesPerVariable.length - 1; v >= 0; v--) {
      combo.unshift(statesPerVariable[v][remainder % counts[v]]);
      remainder = Math.floor(remainder / counts[v]);
    }
    result.push(combo);
  }

  return result;
}

/**
 * Normalize a distribution so that all values sum to 1.
 * Returns a new record (does not mutate the input).
 */
function normalizeDistribution(dist: Record<string, number>): Record<string, number> {
  const total = Object.values(dist).reduce((s, v) => s + v, 0);
  if (total <= 0) {
    const keys = Object.keys(dist);
    const uniform = 1 / (keys.length || 1);
    const result: Record<string, number> = {};
    for (const k of keys) result[k] = uniform;
    return result;
  }
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(dist)) {
    result[k] = v / total;
  }
  return result;
}

/**
 * Topological sort of nodes in a DAG using Kahn's algorithm.
 *
 * Returns `null` if the graph contains a cycle (i.e. is not a DAG).
 */
function topologicalSort(
  nodeIds: string[],
  edges: BayesianEdge[],
): string[] | null {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    adjacency.set(id, []);
  }

  for (const edge of edges) {
    adjacency.get(edge.from)?.push(edge.to);
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  return sorted.length === nodeIds.length ? sorted : null;
}

/**
 * Compute Pearson correlation coefficient between two numeric arrays.
 * Returns 0 if the arrays have fewer than 2 elements or zero variance.
 */
function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;

  let sumX = 0, sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += xs[i];
    sumY += ys[i];
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let covXY = 0, varX = 0, varY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    covXY += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }

  const denom = Math.sqrt(varX * varY);
  return denom > 1e-12 ? covXY / denom : 0;
}

// ── Factor (for Variable Elimination) ────────────────────────────────────

/**
 * A factor in the variable elimination algorithm.
 *
 * Factors are functions over a subset of variables that map each
 * assignment of those variables to a non-negative real number.
 */
interface Factor {
  /** The variables this factor is over (ordered). */
  variables: string[]
  /** States for each variable (same order as `variables`). */
  statesByVariable: string[][]
  /**
   * Flat array of values. The indexing scheme is row-major:
   * the last variable cycles fastest.
   */
  values: number[]
}

/**
 * Get the flat index into a factor's value array for a given assignment.
 */
function factorIndex(factor: Factor, assignment: string[]): number {
  let idx = 0;
  let stride = 1;
  for (let i = factor.variables.length - 1; i >= 0; i--) {
    const stateIdx = factor.statesByVariable[i].indexOf(assignment[i]);
    idx += stateIdx * stride;
    stride *= factor.statesByVariable[i].length;
  }
  return idx;
}

/**
 * Create the assignment (array of state values) for a given flat index.
 */
function factorAssignment(factor: Factor, idx: number): string[] {
  const assignment: string[] = new Array(factor.variables.length);
  let remainder = idx;
  for (let i = factor.variables.length - 1; i >= 0; i--) {
    const numStates = factor.statesByVariable[i].length;
    assignment[i] = factor.statesByVariable[i][remainder % numStates];
    remainder = Math.floor(remainder / numStates);
  }
  return assignment;
}

/**
 * Multiply two factors together, producing a new factor over the
 * union of their variables.
 */
function multiplyFactors(f1: Factor, f2: Factor): Factor {
  // Determine the union of variables (preserving order from f1 then f2)
  const varSet = new Set(f1.variables);
  const variables: string[] = [...f1.variables];
  const statesByVariable: string[][] = [...f1.statesByVariable];

  for (let i = 0; i < f2.variables.length; i++) {
    if (!varSet.has(f2.variables[i])) {
      variables.push(f2.variables[i]);
      statesByVariable.push(f2.statesByVariable[i]);
      varSet.add(f2.variables[i]);
    }
  }

  const totalSize = statesByVariable.reduce((p, s) => p * s.length, 1);
  const values = new Array<number>(totalSize);

  const result: Factor = { variables, statesByVariable, values };

  // Map variable positions for f1 and f2
  const f1VarPos = f1.variables.map(v => variables.indexOf(v));
  const f2VarPos = f2.variables.map(v => variables.indexOf(v));

  for (let i = 0; i < totalSize; i++) {
    const assignment = factorAssignment(result, i);

    const a1 = f1VarPos.map(pos => assignment[pos]);
    const a2 = f2VarPos.map(pos => assignment[pos]);

    values[i] = f1.values[factorIndex(f1, a1)] *
                f2.values[factorIndex(f2, a2)];
  }

  return result;
}

/**
 * Sum out (marginalize) a variable from a factor.
 */
function sumOutVariable(factor: Factor, variable: string): Factor {
  const varIdx = factor.variables.indexOf(variable);
  if (varIdx === -1) return factor;

  const variables = factor.variables.filter((_, i) => i !== varIdx);
  const statesByVariable = factor.statesByVariable.filter((_, i) => i !== varIdx);
  const eliminatedStates = factor.statesByVariable[varIdx];

  const totalSize = statesByVariable.length > 0
    ? statesByVariable.reduce((p, s) => p * s.length, 1)
    : 1;

  const values = new Array<number>(totalSize).fill(0);
  const result: Factor = { variables, statesByVariable, values };

  // For each assignment to the remaining variables, sum over the eliminated variable
  for (let i = 0; i < totalSize; i++) {
    const baseAssignment = variables.length > 0
      ? factorAssignment(result, i)
      : [];

    for (const state of eliminatedStates) {
      // Build the full assignment including the eliminated variable
      const fullAssignment = [
        ...baseAssignment.slice(0, varIdx),
        state,
        ...baseAssignment.slice(varIdx),
      ];
      values[i] += factor.values[factorIndex(factor, fullAssignment)];
    }
  }

  return result;
}

/**
 * Maximize out a variable from a factor (used in MAP inference).
 */
function maxOutVariable(factor: Factor, variable: string): Factor {
  const varIdx = factor.variables.indexOf(variable);
  if (varIdx === -1) return factor;

  const variables = factor.variables.filter((_, i) => i !== varIdx);
  const statesByVariable = factor.statesByVariable.filter((_, i) => i !== varIdx);
  const eliminatedStates = factor.statesByVariable[varIdx];

  const totalSize = statesByVariable.length > 0
    ? statesByVariable.reduce((p, s) => p * s.length, 1)
    : 1;

  const values = new Array<number>(totalSize).fill(0);
  const result: Factor = { variables, statesByVariable, values };

  for (let i = 0; i < totalSize; i++) {
    const baseAssignment = variables.length > 0
      ? factorAssignment(result, i)
      : [];
    let maxVal = -Infinity;

    for (const state of eliminatedStates) {
      const fullAssignment = [
        ...baseAssignment.slice(0, varIdx),
        state,
        ...baseAssignment.slice(varIdx),
      ];
      const val = factor.values[factorIndex(factor, fullAssignment)];
      if (val > maxVal) maxVal = val;
    }
    values[i] = maxVal;
  }

  return result;
}

// ── BayesianNetwork ──────────────────────────────────────────────────────

export class BayesianNetwork {
  private nodes: Map<string, BayesianNode> = new Map();
  private edges: BayesianEdge[] = [];
  private cpts: Map<string, ConditionalProbabilityTable> = new Map();
  private evidence: Map<string, Evidence> = new Map();
  private config: BayesianNetworkConfig;

  constructor(config: Partial<BayesianNetworkConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Node Management ─────────────────────────────────────────────────

  /**
   * Add a node (random variable) to the network.
   *
   * @param id          Unique identifier for this node.
   * @param name        Human-readable label.
   * @param states      Discrete states (defaults to config.defaultStates).
   * @param description Optional description of what this variable represents.
   * @throws If the node already exists or the network is at capacity.
   */
  addNode(
    id: string,
    name: string,
    states?: string[],
    description?: string,
  ): BayesianNode {
    if (this.nodes.has(id)) {
      throw new Error(`Node "${id}" already exists in the network.`);
    }
    if (this.nodes.size >= this.config.maxNodes) {
      throw new Error(
        `Network is at capacity (${this.config.maxNodes} nodes).`,
      );
    }

    const nodeStates = states && states.length > 0
      ? [...states]
      : [...this.config.defaultStates];

    const node: BayesianNode = {
      id,
      name,
      states: nodeStates,
      description: description ?? '',
      createdAt: Date.now(),
    };

    this.nodes.set(id, node);

    // Initialize a uniform prior CPT (no parents)
    this.initializeDefaultCPT(node);

    return node;
  }

  /**
   * Remove a node and all edges / CPT entries that reference it.
   * Also clears any evidence set on the node.
   */
  removeNode(id: string): boolean {
    if (!this.nodes.has(id)) return false;

    this.nodes.delete(id);
    this.cpts.delete(id);
    this.evidence.delete(id);

    // Remove all edges involving this node
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);

    // Re-initialize CPTs for any node that had this node as a parent
    for (const [nodeId, cpt] of this.cpts) {
      if (cpt.parentIds.includes(id)) {
        const node = this.nodes.get(nodeId);
        if (node) this.rebuildCPTAfterParentChange(node);
      }
    }

    return true;
  }

  /**
   * Retrieve a node by its ID, or `null` if it does not exist.
   */
  getNode(id: string): BayesianNode | null {
    return this.nodes.get(id) ?? null;
  }

  /**
   * Return all nodes in the network.
   */
  getNodes(): BayesianNode[] {
    return Array.from(this.nodes.values());
  }

  // ── Edge Management ─────────────────────────────────────────────────

  /**
   * Add a directed edge from `fromId` → `toId` indicating that the
   * variable `fromId` is a parent of `toId`.
   *
   * The method validates that both nodes exist, the edge would not
   * create a cycle, and the child would not exceed `maxParentsPerNode`.
   *
   * @param strength Optional numeric weight metadata (default 1.0).
   * @throws If the edge is invalid.
   */
  addEdge(fromId: string, toId: string, strength: number = 1.0): BayesianEdge {
    if (!this.nodes.has(fromId)) {
      throw new Error(`Source node "${fromId}" does not exist.`);
    }
    if (!this.nodes.has(toId)) {
      throw new Error(`Target node "${toId}" does not exist.`);
    }
    if (fromId === toId) {
      throw new Error('Self-loops are not allowed in a Bayesian network.');
    }

    // Check for duplicate edge
    if (this.edges.some(e => e.from === fromId && e.to === toId)) {
      throw new Error(`Edge "${fromId}" → "${toId}" already exists.`);
    }

    // Check parent limit
    const currentParents = this.getParents(toId);
    if (currentParents.length >= this.config.maxParentsPerNode) {
      throw new Error(
        `Node "${toId}" already has ${this.config.maxParentsPerNode} parents (max).`,
      );
    }

    // Check that adding this edge would not create a cycle
    const tentativeEdges = [...this.edges, { from: fromId, to: toId, strength }];
    const nodeIds = Array.from(this.nodes.keys());
    if (topologicalSort(nodeIds, tentativeEdges) === null) {
      throw new Error(
        `Adding edge "${fromId}" → "${toId}" would create a cycle.`,
      );
    }

    const edge: BayesianEdge = { from: fromId, to: toId, strength };
    this.edges.push(edge);

    // Rebuild the child's CPT to incorporate the new parent
    const childNode = this.nodes.get(toId)!;
    this.rebuildCPTAfterParentChange(childNode);

    return edge;
  }

  /**
   * Remove a directed edge from the network.
   * Rebuilds the child node's CPT to reflect the removed parent.
   */
  removeEdge(fromId: string, toId: string): boolean {
    const idx = this.edges.findIndex(
      e => e.from === fromId && e.to === toId,
    );
    if (idx === -1) return false;

    this.edges.splice(idx, 1);

    const childNode = this.nodes.get(toId);
    if (childNode) {
      this.rebuildCPTAfterParentChange(childNode);
    }

    return true;
  }

  /**
   * Get the parent node IDs of a given node.
   */
  getParents(nodeId: string): string[] {
    return this.edges
      .filter(e => e.to === nodeId)
      .map(e => e.from);
  }

  /**
   * Get the child node IDs of a given node.
   */
  getChildren(nodeId: string): string[] {
    return this.edges
      .filter(e => e.from === nodeId)
      .map(e => e.to);
  }

  // ── CPT Management ──────────────────────────────────────────────────

  /**
   * Set the conditional probability table for a node.
   *
   * The caller must provide a complete mapping from every parent state
   * combination to a valid probability distribution over the node's states.
   *
   * @param nodeId        The node whose CPT to set.
   * @param probabilities The full CPT mapping.
   * @throws If the node does not exist or the CPT structure is invalid.
   */
  setCPT(
    nodeId: string,
    probabilities: Record<string, Record<string, number>>,
  ): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" does not exist.`);
    }

    const parentIds = this.getParents(nodeId);

    // Validate each row sums to ~1 and covers all node states
    for (const [key, dist] of Object.entries(probabilities)) {
      const sum = Object.values(dist).reduce((s, v) => s + v, 0);
      if (Math.abs(sum - 1.0) > PROBABILITY_SUM_TOLERANCE) {
        throw new Error(
          `CPT row "${key}" for node "${nodeId}" sums to ${sum}, expected 1.0.`,
        );
      }
      for (const state of node.states) {
        if (dist[state] === undefined) {
          throw new Error(
            `CPT row "${key}" for node "${nodeId}" missing state "${state}".`,
          );
        }
      }
    }

    // Validate all parent combinations are covered
    const expectedCombos = this.getParentStateCombinations(nodeId);
    for (const combo of expectedCombos) {
      const key = buildParentKey(combo);
      if (!probabilities[key]) {
        throw new Error(
          `CPT for node "${nodeId}" is missing parent combination "${key}".`,
        );
      }
    }

    this.cpts.set(nodeId, { nodeId, parentIds, probabilities });
  }

  /**
   * Retrieve the CPT for a given node, or `null` if no CPT is set.
   */
  getCPT(nodeId: string): ConditionalProbabilityTable | null {
    return this.cpts.get(nodeId) ?? null;
  }

  // ── Evidence Management ─────────────────────────────────────────────

  /**
   * Set an evidence observation: fix a variable to a known state.
   *
   * @throws If the node does not exist or the state is invalid.
   */
  setEvidence(nodeId: string, state: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" does not exist.`);
    }
    if (!node.states.includes(state)) {
      throw new Error(
        `State "${state}" is not valid for node "${nodeId}". ` +
        `Valid states: ${node.states.join(', ')}.`,
      );
    }
    this.evidence.set(nodeId, { nodeId, state });
  }

  /**
   * Clear evidence for a specific node, or all evidence if no ID given.
   */
  clearEvidence(nodeId?: string): void {
    if (nodeId) {
      this.evidence.delete(nodeId);
    } else {
      this.evidence.clear();
    }
  }

  /**
   * Get all currently set evidence observations.
   */
  getEvidence(): Evidence[] {
    return Array.from(this.evidence.values());
  }

  // ── Exact Inference (Variable Elimination) ──────────────────────────

  /**
   * Perform exact inference on a query variable using the
   * variable elimination algorithm.
   *
   * Variable elimination works by:
   * 1. Converting each node's CPT into a factor
   * 2. Reducing factors by the observed evidence
   * 3. Eliminating (summing out) all hidden variables one at a time
   * 4. Multiplying remaining factors and normalizing
   *
   * @param queryNodeId The variable whose posterior to compute.
   * @returns The posterior distribution given the current evidence.
   * @throws If the query node does not exist.
   */
  infer(queryNodeId: string): InferenceResult {
    const startTime = Date.now();
    const node = this.nodes.get(queryNodeId);
    if (!node) {
      throw new Error(`Query node "${queryNodeId}" does not exist.`);
    }

    const currentEvidence = this.getEvidence();

    // Build initial factors from CPTs
    let factors = this.buildFactors();

    // Reduce factors by evidence
    factors = this.reduceByEvidence(factors);

    // Determine the elimination order: all variables except the query
    // and evidence variables (evidence is already reduced out)
    const evidenceIds = new Set(this.evidence.keys());
    const eliminationOrder = this.computeEliminationOrder(
      queryNodeId,
      evidenceIds,
    );

    // Eliminate hidden variables one by one
    for (const variable of eliminationOrder) {
      factors = this.eliminateVariable(factors, variable);
    }

    // Multiply remaining factors
    let result = factors[0];
    for (let i = 1; i < factors.length; i++) {
      result = multiplyFactors(result, factors[i]);
    }

    // Extract the distribution over the query variable
    const distribution: Record<string, number> = {};
    const queryVarIdx = result.variables.indexOf(queryNodeId);

    if (queryVarIdx === -1) {
      // The query variable was summed out or not present —
      // return uniform distribution
      const uniform = 1 / node.states.length;
      for (const state of node.states) {
        distribution[state] = uniform;
      }
    } else {
      for (let i = 0; i < result.values.length; i++) {
        const assignment = factorAssignment(result, i);
        const state = assignment[queryVarIdx];
        distribution[state] = (distribution[state] ?? 0) + result.values[i];
      }
    }

    const normalized = normalizeDistribution(distribution);

    return {
      nodeId: queryNodeId,
      distribution: normalized,
      evidence: currentEvidence,
      computationTimeMs: Date.now() - startTime,
    };
  }

  // ── MAP Inference ───────────────────────────────────────────────────

  /**
   * Find the Most A-Posteriori (MAP) assignment: the combination of
   * states that maximizes the joint posterior probability given evidence.
   *
   * Uses a variant of variable elimination that maximizes instead of
   * summing when eliminating variables.
   *
   * @param queryNodeIds  Optional subset of variables to include. Defaults
   *                      to all non-evidence variables.
   * @returns A record mapping each variable to its most probable state,
   *          along with the joint probability.
   */
  findMostProbable(queryNodeIds?: string[]): {
    assignment: Record<string, string>
    probability: number
  } {
    const evidenceIds = new Set(this.evidence.keys());

    const targetNodes = queryNodeIds
      ?? Array.from(this.nodes.keys()).filter(id => !evidenceIds.has(id));

    let factors = this.buildFactors();
    factors = this.reduceByEvidence(factors);

    // Eliminate all variables NOT in the target set by maximizing
    const targetSet = new Set(targetNodes);
    const eliminationOrder = Array.from(this.nodes.keys()).filter(
      id => !targetSet.has(id) && !evidenceIds.has(id),
    );

    for (const variable of eliminationOrder) {
      factors = this.maxEliminateVariable(factors, variable);
    }

    // Multiply all remaining factors
    let joint = factors[0];
    for (let i = 1; i < factors.length; i++) {
      joint = multiplyFactors(joint, factors[i]);
    }

    // Find the assignment with the highest value
    let bestIdx = 0;
    let bestVal = -Infinity;
    for (let i = 0; i < joint.values.length; i++) {
      if (joint.values[i] > bestVal) {
        bestVal = joint.values[i];
        bestIdx = i;
      }
    }

    const bestAssignment = factorAssignment(joint, bestIdx);
    const assignment: Record<string, string> = {};
    for (let i = 0; i < joint.variables.length; i++) {
      assignment[joint.variables[i]] = bestAssignment[i];
    }

    // Include evidence in the assignment
    for (const ev of this.evidence.values()) {
      assignment[ev.nodeId] = ev.state;
    }

    // Normalize probability
    const totalMass = joint.values.reduce((s, v) => s + v, 0);
    const probability = totalMass > 0 ? bestVal / totalMass : 0;

    return { assignment, probability };
  }

  // ── D-Separation ────────────────────────────────────────────────────

  /**
   * Test whether two nodes are d-separated given a set of conditioning
   * variables (evidence nodes).
   *
   * Two variables X and Y are d-separated by a set Z if every path
   * between X and Y is "blocked" by Z.  This is determined by the
   * Bayes-Ball algorithm.
   *
   * @param nodeA  First variable.
   * @param nodeB  Second variable.
   * @param given  Set of conditioning variable IDs.
   * @returns `true` if nodeA and nodeB are conditionally independent given Z.
   */
  isDSeparated(nodeA: string, nodeB: string, given: string[] = []): boolean {
    if (!this.nodes.has(nodeA) || !this.nodes.has(nodeB)) {
      throw new Error('Both nodes must exist in the network.');
    }

    const givenSet = new Set(given);

    // Bayes-Ball algorithm
    // We'll check if nodeB is reachable from nodeA
    // State: (nodeId, direction) where direction is 'up' (towards parents)
    // or 'down' (towards children)
    type BallState = { nodeId: string; direction: 'up' | 'down' };

    const visited = new Set<string>();
    const queue: BallState[] = [
      { nodeId: nodeA, direction: 'up' },
      { nodeId: nodeA, direction: 'down' },
    ];

    const reachable = new Set<string>();

    while (queue.length > 0) {
      const { nodeId, direction } = queue.shift()!;
      const stateKey = `${nodeId}:${direction}`;
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);

      if (nodeId !== nodeA) {
        reachable.add(nodeId);
      }

      const isObserved = givenSet.has(nodeId);

      if (direction === 'up' && !isObserved) {
        // Ball came from a child; pass to parents and other children
        for (const parent of this.getParents(nodeId)) {
          queue.push({ nodeId: parent, direction: 'up' });
        }
        for (const child of this.getChildren(nodeId)) {
          queue.push({ nodeId: child, direction: 'down' });
        }
      } else if (direction === 'down') {
        // Ball came from a parent
        if (!isObserved) {
          // Pass to children
          for (const child of this.getChildren(nodeId)) {
            queue.push({ nodeId: child, direction: 'down' });
          }
        }
        if (isObserved || this.hasObservedDescendant(nodeId, givenSet)) {
          // V-structure: pass to parents (explaining away)
          for (const parent of this.getParents(nodeId)) {
            queue.push({ nodeId: parent, direction: 'up' });
          }
        }
      }
    }

    return !reachable.has(nodeB);
  }

  // ── Network Validation ──────────────────────────────────────────────

  /**
   * Validate the network structure and CPT consistency.
   *
   * Checks:
   * - Acyclicity (DAG property)
   * - Every CPT matches its node's parent set
   * - Every CPT row sums to ~1
   * - Every node has a CPT defined
   */
  validate(): NetworkValidation {
    const issues: string[] = [];

    // Check DAG property
    const nodeIds = Array.from(this.nodes.keys());
    const sorted = topologicalSort(nodeIds, this.edges);
    const isAcyclic = sorted !== null;

    if (!isAcyclic) {
      issues.push('The network contains a cycle and is not a valid DAG.');
    }

    // Check CPT consistency and normalization
    let cptConsistency = true;
    let probabilitiesNormalized = true;

    for (const node of this.nodes.values()) {
      const cpt = this.cpts.get(node.id);
      if (!cpt) {
        issues.push(`Node "${node.id}" has no CPT defined.`);
        cptConsistency = false;
        continue;
      }

      // Verify parent set matches actual parents
      const actualParents = this.getParents(node.id).sort();
      const cptParents = [...cpt.parentIds].sort();
      if (
        actualParents.length !== cptParents.length ||
        !actualParents.every((p, i) => p === cptParents[i])
      ) {
        issues.push(
          `Node "${node.id}" CPT parents [${cptParents.join(', ')}] ` +
          `don't match actual parents [${actualParents.join(', ')}].`,
        );
        cptConsistency = false;
      }

      // Verify each row sums to ~1 and covers all states
      for (const [key, dist] of Object.entries(cpt.probabilities)) {
        const sum = Object.values(dist).reduce((s, v) => s + v, 0);
        if (Math.abs(sum - 1.0) > PROBABILITY_SUM_TOLERANCE) {
          issues.push(
            `Node "${node.id}" CPT row "${key}" sums to ${sum.toFixed(6)}.`,
          );
          probabilitiesNormalized = false;
        }

        for (const state of node.states) {
          if (dist[state] === undefined) {
            issues.push(
              `Node "${node.id}" CPT row "${key}" missing state "${state}".`,
            );
            cptConsistency = false;
          }
        }

        for (const state of Object.keys(dist)) {
          if (!node.states.includes(state)) {
            issues.push(
              `Node "${node.id}" CPT row "${key}" has unknown state "${state}".`,
            );
            cptConsistency = false;
          }
        }
      }

      // Verify all parent state combinations are covered
      const expectedCombos = this.getParentStateCombinations(node.id);
      for (const combo of expectedCombos) {
        const key = buildParentKey(combo);
        if (!cpt.probabilities[key]) {
          issues.push(
            `Node "${node.id}" CPT missing parent combo "${key}".`,
          );
          cptConsistency = false;
        }
      }
    }

    return {
      isValid: isAcyclic && cptConsistency && probabilitiesNormalized,
      isAcyclic,
      cptConsistency,
      probabilitiesNormalized,
      issues,
    };
  }

  // ── Network Structure ───────────────────────────────────────────────

  /**
   * Return a snapshot of the full network structure (nodes and edges).
   */
  getStructure(): NetworkStructure {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: [...this.edges],
      nodeCount: this.nodes.size,
      edgeCount: this.edges.length,
    };
  }

  // ── Structure Learning ──────────────────────────────────────────────

  /**
   * Learn the network structure from observed data.
   *
   * Uses a simplified correlation-based approach:
   * 1. Compute pairwise correlations between all variables
   * 2. Add edges where |correlation| exceeds the threshold
   * 3. Orient edges to maintain a DAG (using topological heuristic)
   *
   * Existing nodes must already be added to the network.  The data
   * is an array of observations where each observation maps node IDs
   * to their observed state values.
   *
   * @param data  Array of observation records.
   * @returns The edges that were added.
   */
  learnStructure(data: Array<Record<string, string>>): BayesianEdge[] {
    if (data.length < 2) return [];

    const nodeIds = Array.from(this.nodes.keys());
    if (nodeIds.length < 2) return [];

    // Encode states as numeric indices for correlation computation
    const encoded = new Map<string, number[]>();
    for (const nodeId of nodeIds) {
      const node = this.nodes.get(nodeId)!;
      const values: number[] = [];
      for (const obs of data) {
        const stateIdx = node.states.indexOf(obs[nodeId] ?? '');
        values.push(stateIdx >= 0 ? stateIdx : 0);
      }
      encoded.set(nodeId, values);
    }

    // Compute pairwise correlations and rank them by strength
    const candidates: Array<{ from: string; to: string; corr: number }> = [];

    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const xs = encoded.get(nodeIds[i])!;
        const ys = encoded.get(nodeIds[j])!;
        const corr = Math.abs(pearsonCorrelation(xs, ys));

        if (corr >= this.config.structureLearningThreshold) {
          candidates.push({ from: nodeIds[i], to: nodeIds[j], corr });
        }
      }
    }

    // Sort by descending correlation strength
    candidates.sort((a, b) => b.corr - a.corr);

    // Add edges greedily, maintaining DAG property
    const addedEdges: BayesianEdge[] = [];

    for (const candidate of candidates) {
      // Orient edge: try from → to first, then to → from
      for (const [from, to] of [
        [candidate.from, candidate.to],
        [candidate.to, candidate.from],
      ]) {
        const tentative = [
          ...this.edges,
          ...addedEdges,
          { from, to, strength: candidate.corr },
        ];
        const sorted = topologicalSort(nodeIds, tentative);
        if (sorted !== null) {
          // Check parent limit
          const parentCount = tentative.filter(e => e.to === to).length;
          if (parentCount <= this.config.maxParentsPerNode) {
            addedEdges.push({ from, to, strength: candidate.corr });
            break;
          }
        }
      }
    }

    // Apply the learned edges to the network
    for (const edge of addedEdges) {
      if (!this.edges.some(e => e.from === edge.from && e.to === edge.to)) {
        this.edges.push(edge);
        const childNode = this.nodes.get(edge.to);
        if (childNode) this.rebuildCPTAfterParentChange(childNode);
      }
    }

    return addedEdges;
  }

  // ── Parameter Learning ──────────────────────────────────────────────

  /**
   * Learn CPT parameters from observed data using frequency counting
   * with Laplace smoothing.
   *
   * For each node, counts how often each state occurs for every parent
   * state combination, then normalizes to produce probability estimates.
   *
   * @param data  Array of observation records (nodeId → state).
   */
  learnParameters(data: Array<Record<string, string>>): void {
    if (data.length === 0) return;

    for (const node of this.nodes.values()) {
      const parentIds = this.getParents(node.id);
      const combos = this.getParentStateCombinations(node.id);
      const probabilities: Record<string, Record<string, number>> = {};

      for (const combo of combos) {
        const key = buildParentKey(combo);
        const counts: Record<string, number> = {};

        // Initialize counts with Laplace smoothing
        for (const state of node.states) {
          counts[state] = this.config.laplaceSmoothingFactor;
        }

        // Count occurrences in data
        for (const obs of data) {
          // Check that the parent states match this combination
          let matches = true;
          for (let p = 0; p < parentIds.length; p++) {
            if (obs[parentIds[p]] !== combo[p]) {
              matches = false;
              break;
            }
          }

          if (matches && obs[node.id] !== undefined) {
            const observedState = obs[node.id];
            if (counts[observedState] !== undefined) {
              counts[observedState]++;
            }
          }
        }

        // Normalize
        const total = Object.values(counts).reduce((s, v) => s + v, 0);
        probabilities[key] = {};
        for (const [state, count] of Object.entries(counts)) {
          probabilities[key][state] = total > 0 ? count / total : 1 / node.states.length;
        }
      }

      this.cpts.set(node.id, { nodeId: node.id, parentIds, probabilities });
    }
  }

  // ── Sensitivity Analysis ────────────────────────────────────────────

  /**
   * Perform sensitivity analysis to see how small changes in a CPT
   * parameter affect the posterior of a query variable.
   *
   * For each state of the target CPT parameter, perturbs the probability
   * by ±stepSize and re-runs inference, measuring the change in the
   * query posterior.
   *
   * @param cptNodeId   The node whose CPT parameter to perturb.
   * @param parentKey   The parent combination key in the CPT.
   * @param queryNodeId The node to query after perturbation.
   * @returns A record mapping each perturbed state to the derivative
   *          (change in query posterior per unit change in CPT param).
   */
  sensitivityAnalysis(
    cptNodeId: string,
    parentKey: string,
    queryNodeId: string,
  ): Record<string, Record<string, number>> {
    const cpt = this.cpts.get(cptNodeId);
    if (!cpt) {
      throw new Error(`No CPT found for node "${cptNodeId}".`);
    }
    if (!cpt.probabilities[parentKey]) {
      throw new Error(
        `Parent key "${parentKey}" not found in CPT for "${cptNodeId}".`,
      );
    }
    if (!this.nodes.has(queryNodeId)) {
      throw new Error(`Query node "${queryNodeId}" does not exist.`);
    }

    const step = this.config.sensitivityStepSize;
    const originalRow = { ...cpt.probabilities[parentKey] };
    const baseline = this.infer(queryNodeId).distribution;

    const result: Record<string, Record<string, number>> = {};

    const states = Object.keys(originalRow);
    for (const perturbedState of states) {
      result[perturbedState] = {};

      // Perturb: increase one state, decrease others proportionally
      const newRow = { ...originalRow };
      const increase = Math.min(step, 1.0 - newRow[perturbedState]);
      if (increase <= 0) {
        // Already at max; fill with zeros
        for (const qs of Object.keys(baseline)) {
          result[perturbedState][qs] = 0;
        }
        continue;
      }

      newRow[perturbedState] += increase;

      // Redistribute the increase across other states
      const otherStates = states.filter(s => s !== perturbedState);
      const otherTotal = otherStates.reduce((s, st) => s + originalRow[st], 0);
      for (const os of otherStates) {
        const share = otherTotal > 0 ? originalRow[os] / otherTotal : 1 / otherStates.length;
        newRow[os] = Math.max(0, originalRow[os] - increase * share);
      }

      // Temporarily apply the perturbed CPT
      cpt.probabilities[parentKey] = newRow;
      const perturbed = this.infer(queryNodeId).distribution;

      // Compute derivative (change per unit perturbation)
      for (const qs of Object.keys(baseline)) {
        result[perturbedState][qs] =
          (perturbed[qs] - baseline[qs]) / increase;
      }

      // Restore original
      cpt.probabilities[parentKey] = originalRow;
    }

    return result;
  }

  // ── Statistics ──────────────────────────────────────────────────────

  /**
   * Return summary statistics about the network.
   */
  getStats(): BayesianNetworkStats {
    const nodeIds = Array.from(this.nodes.keys());

    let totalParents = 0;
    let maxParents = 0;
    let totalStates = 0;
    let rootCount = 0;
    let leafCount = 0;

    for (const id of nodeIds) {
      const parents = this.getParents(id);
      const children = this.getChildren(id);
      const node = this.nodes.get(id)!;

      totalParents += parents.length;
      totalStates += node.states.length;

      if (parents.length > maxParents) {
        maxParents = parents.length;
      }
      if (parents.length === 0) rootCount++;
      if (children.length === 0) leafCount++;
    }

    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.length,
      cptCount: this.cpts.size,
      evidenceCount: this.evidence.size,
      averageParents: nodeIds.length > 0 ? totalParents / nodeIds.length : 0,
      maxParents,
      rootNodes: rootCount,
      leafNodes: leafCount,
      averageStatesPerNode: nodeIds.length > 0 ? totalStates / nodeIds.length : 0,
    };
  }

  // ── Serialization ───────────────────────────────────────────────────

  /** Serialize the entire network state to a JSON string. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      nodes: Array.from(this.nodes.values()),
      edges: this.edges,
      cpts: Array.from(this.cpts.values()),
      evidence: Array.from(this.evidence.values()),
    });
  }

  /** Restore a BayesianNetwork from a previously serialized JSON string. */
  static deserialize(json: string): BayesianNetwork {
    const data = JSON.parse(json) as {
      config: BayesianNetworkConfig
      nodes: BayesianNode[]
      edges: BayesianEdge[]
      cpts: ConditionalProbabilityTable[]
      evidence: Evidence[]
    };

    const network = new BayesianNetwork(data.config);

    if (Array.isArray(data.nodes)) {
      for (const node of data.nodes) {
        network.nodes.set(node.id, node);
      }
    }

    if (Array.isArray(data.edges)) {
      network.edges = data.edges;
    }

    if (Array.isArray(data.cpts)) {
      for (const cpt of data.cpts) {
        network.cpts.set(cpt.nodeId, cpt);
      }
    }

    if (Array.isArray(data.evidence)) {
      for (const ev of data.evidence) {
        network.evidence.set(ev.nodeId, ev);
      }
    }

    return network;
  }

  // ── Private Helpers ─────────────────────────────────────────────────

  /**
   * Initialize a uniform CPT for a node with no parents (prior).
   * Each state gets equal probability.
   */
  private initializeDefaultCPT(node: BayesianNode): void {
    const uniform = 1 / node.states.length;
    const dist: Record<string, number> = {};
    for (const state of node.states) {
      dist[state] = uniform;
    }

    this.cpts.set(node.id, {
      nodeId: node.id,
      parentIds: [],
      probabilities: { '': dist },
    });
  }

  /**
   * Rebuild a node's CPT after its parent set changes.
   *
   * Fills in a uniform distribution for every new parent combination.
   * Tries to preserve existing probability rows whose parent keys
   * still apply.
   */
  private rebuildCPTAfterParentChange(node: BayesianNode): void {
    const parentIds = this.getParents(node.id);
    const combos = this.getParentStateCombinationsForParents(parentIds);
    const oldCpt = this.cpts.get(node.id);

    const uniform = 1 / node.states.length;
    const probabilities: Record<string, Record<string, number>> = {};

    for (const combo of combos) {
      const key = buildParentKey(combo);

      // Reuse the old row if the key exists
      if (oldCpt?.probabilities[key]) {
        probabilities[key] = { ...oldCpt.probabilities[key] };
      } else {
        const dist: Record<string, number> = {};
        for (const state of node.states) {
          dist[state] = uniform;
        }
        probabilities[key] = dist;
      }
    }

    this.cpts.set(node.id, { nodeId: node.id, parentIds, probabilities });
  }

  /**
   * Get all state combinations for the parents of a given node.
   */
  private getParentStateCombinations(nodeId: string): string[][] {
    const parentIds = this.getParents(nodeId);
    return this.getParentStateCombinationsForParents(parentIds);
  }

  /**
   * Get all state combinations for a given list of parent IDs.
   */
  private getParentStateCombinationsForParents(parentIds: string[]): string[][] {
    if (parentIds.length === 0) return [[]];

    const parentStates: string[][] = [];
    for (const pid of parentIds) {
      const parentNode = this.nodes.get(pid);
      if (parentNode) {
        parentStates.push(parentNode.states);
      }
    }

    return enumerateStateCombinations(parentStates);
  }

  /**
   * Build factors from all CPTs in the network for variable elimination.
   *
   * Each CPT becomes a factor over the node and its parents.
   */
  private buildFactors(): Factor[] {
    const factors: Factor[] = [];

    for (const cpt of this.cpts.values()) {
      const node = this.nodes.get(cpt.nodeId);
      if (!node) continue;

      const variables = [...cpt.parentIds, cpt.nodeId];
      const statesByVariable: string[][] = [];

      for (const pid of cpt.parentIds) {
        const pnode = this.nodes.get(pid);
        statesByVariable.push(pnode ? pnode.states : []);
      }
      statesByVariable.push(node.states);

      // Build flat value array
      const totalSize = statesByVariable.reduce((p, s) => p * s.length, 1);
      const values = new Array<number>(totalSize);

      const tempFactor: Factor = { variables, statesByVariable, values };

      for (let i = 0; i < totalSize; i++) {
        const assignment = factorAssignment(tempFactor, i);
        const parentStates = assignment.slice(0, cpt.parentIds.length);
        const nodeState = assignment[assignment.length - 1];
        const key = buildParentKey(parentStates);
        const row = cpt.probabilities[key];
        values[i] = row ? (row[nodeState] ?? 0) : 0;
      }

      factors.push(tempFactor);
    }

    return factors;
  }

  /**
   * Reduce factors by fixing evidence variables to their observed states.
   *
   * For each evidence observation, any factor containing that variable
   * is projected down to only the rows consistent with the evidence.
   */
  private reduceByEvidence(factors: Factor[]): Factor[] {
    let result = factors;

    for (const ev of this.evidence.values()) {
      result = result.map(factor => {
        const varIdx = factor.variables.indexOf(ev.nodeId);
        if (varIdx === -1) return factor;

        // Project: keep only rows where the evidence variable matches
        const newVariables = factor.variables.filter((_, i) => i !== varIdx);
        const newStates = factor.statesByVariable.filter((_, i) => i !== varIdx);

        const newTotalSize = newStates.length > 0
          ? newStates.reduce((p, s) => p * s.length, 1)
          : 1;
        const newValues = new Array<number>(newTotalSize);

        const reduced: Factor = {
          variables: newVariables,
          statesByVariable: newStates,
          values: newValues,
        };

        for (let i = 0; i < newTotalSize; i++) {
          const baseAssignment = newVariables.length > 0
            ? factorAssignment(reduced, i)
            : [];

          // Insert the evidence state at the correct position
          const fullAssignment = [
            ...baseAssignment.slice(0, varIdx),
            ev.state,
            ...baseAssignment.slice(varIdx),
          ];

          newValues[i] = factor.values[factorIndex(factor, fullAssignment)];
        }

        return reduced;
      });
    }

    return result;
  }

  /**
   * Compute a heuristic elimination order for variable elimination.
   *
   * Uses the min-fill heuristic: eliminate variables that introduce
   * the fewest new edges in the interaction graph.  For simplicity,
   * we approximate this by eliminating variables with the fewest
   * factor appearances first.
   */
  private computeEliminationOrder(
    queryNodeId: string,
    evidenceIds: Set<string>,
  ): string[] {
    const candidates = Array.from(this.nodes.keys()).filter(
      id => id !== queryNodeId && !evidenceIds.has(id),
    );

    // Sort by ascending number of children (simple heuristic)
    candidates.sort((a, b) => {
      const childrenA = this.getChildren(a).length;
      const childrenB = this.getChildren(b).length;
      return childrenA - childrenB;
    });

    return candidates;
  }

  /**
   * Eliminate a variable from a set of factors by summing it out.
   *
   * Collects all factors that mention the variable, multiplies them
   * together, sums out the variable, and returns the resulting factors.
   */
  private eliminateVariable(factors: Factor[], variable: string): Factor[] {
    const relevant: Factor[] = [];
    const remaining: Factor[] = [];

    for (const f of factors) {
      if (f.variables.includes(variable)) {
        relevant.push(f);
      } else {
        remaining.push(f);
      }
    }

    if (relevant.length === 0) return factors;

    // Multiply all relevant factors together
    let product = relevant[0];
    for (let i = 1; i < relevant.length; i++) {
      product = multiplyFactors(product, relevant[i]);
    }

    // Sum out the variable
    const marginalized = sumOutVariable(product, variable);
    remaining.push(marginalized);

    return remaining;
  }

  /**
   * Eliminate a variable from factors by maximizing instead of summing.
   * Used for MAP inference.
   */
  private maxEliminateVariable(factors: Factor[], variable: string): Factor[] {
    const relevant: Factor[] = [];
    const remaining: Factor[] = [];

    for (const f of factors) {
      if (f.variables.includes(variable)) {
        relevant.push(f);
      } else {
        remaining.push(f);
      }
    }

    if (relevant.length === 0) return factors;

    let product = relevant[0];
    for (let i = 1; i < relevant.length; i++) {
      product = multiplyFactors(product, relevant[i]);
    }

    const maximized = maxOutVariable(product, variable);
    remaining.push(maximized);

    return remaining;
  }

  /**
   * Check whether a node or any of its descendants is observed (in the
   * given evidence set).  Used by the Bayes-Ball d-separation algorithm
   * to handle v-structures.
   */
  private hasObservedDescendant(nodeId: string, observed: Set<string>): boolean {
    const visited = new Set<string>();
    const stack = [nodeId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);

      if (observed.has(current)) return true;

      for (const child of this.getChildren(current)) {
        stack.push(child);
      }
    }

    return false;
  }
}
