/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Knowledge Reasoner — Phase 8 Intelligence Module for LocalBrain            ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Knowledge Fact Store — Store, query, and manage knowledge facts         ║
 * ║    ✦ Transitive Inference — Infer new facts through chained reasoning        ║
 * ║    ✦ Knowledge Composition — Compose multi-fact answers to questions         ║
 * ║    ✦ Contradiction Detection — Find and resolve conflicting facts            ║
 * ║    ✦ Confidence Propagation — Track confidence through inference chains      ║
 * ║    ✦ Explanation Generation — Generate human-readable reasoning chains       ║
 * ║    ✦ Hypothesis Generation — Propose plausible hypotheses when data is thin  ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface KnowledgeReasonerConfig {
  /** Maximum number of facts to store before LRU eviction. */
  maxFacts: number;
  /** Maximum depth for transitive inference chains. */
  maxInferenceDepth: number;
  /** Confidence decay factor applied per inference hop (0–1). */
  confidenceDecayPerHop: number;
  /** Minimum confidence threshold for accepting inferences. */
  minConfidence: number;
  /** Whether to automatically detect contradictions on addFact. */
  enableContradictionDetection: boolean;
  /** Whether hypothesis generation is enabled. */
  enableHypothesisGeneration: boolean;
  /** Maximum number of hypotheses to generate per query. */
  maxHypotheses: number;
}

export interface KnowledgeReasonerStats {
  totalFacts: number;
  totalInferences: number;
  totalCompositions: number;
  totalContradictionsFound: number;
  totalHypothesesGenerated: number;
  totalExplanations: number;
  avgConfidence: number;
  feedbackReceived: number;
  feedbackAccuracy: number;
}

export interface KnowledgeFact {
  id: string;
  subject: string;
  relation: string;
  object: string;
  confidence: number;
  source: string;
  createdAt: number;
  lastUsed: number;
  useCount: number;
}

export interface InferenceChain {
  conclusion: { subject: string; relation: string; object: string };
  steps: KnowledgeFact[];
  confidence: number;
  depth: number;
}

export interface ComposedAnswer {
  answer: string;
  facts: KnowledgeFact[];
  chains: InferenceChain[];
  confidence: number;
  coverage: number;
  explanation: string;
}

export interface Contradiction {
  fact1: KnowledgeFact;
  fact2: KnowledgeFact;
  type: 'negation' | 'conflict' | 'inconsistency';
  description: string;
  resolution: string;
}

export interface ExplanationResult {
  conclusion: string;
  explanations: ExplanationPath[];
  counterEvidence: KnowledgeFact[];
}

export interface ExplanationPath {
  steps: string[];
  naturalLanguage: string;
  confidence: number;
}

export interface Hypothesis {
  statement: string;
  confidence: number;
  supportingFacts: KnowledgeFact[];
  reasoning: string;
  type: 'analogical' | 'inductive' | 'abductive';
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: KnowledgeReasonerConfig = {
  maxFacts: 5000,
  maxInferenceDepth: 5,
  confidenceDecayPerHop: 0.9,
  minConfidence: 0.1,
  enableContradictionDetection: true,
  enableHypothesisGeneration: true,
  maxHypotheses: 5,
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'that',
  'this', 'it', 'its', 'and', 'or', 'not', 'but', 'if', 'then',
  'so', 'up', 'out', 'no', 'just', 'also', 'very', 'what', 'how',
  'like', 'such', 'when', 'which', 'there', 'their', 'than',
]);

/** Negation indicators used by contradiction detection. */
const NEGATION_PREFIXES = [
  'not', 'no', 'non', 'never', 'without', 'lacks', 'cannot',
  'doesn\'t', 'isn\'t', 'aren\'t', 'won\'t', 'don\'t', 'hasn\'t',
];

/** Exclusive relations where a subject can only have one object. */
const EXCLUSIVE_RELATIONS = new Set([
  'is', 'equals', 'type', 'instanceof', 'created-by', 'authored-by',
  'born-in', 'capital-of', 'parent-of', 'successor-of',
]);

// ── Utility Functions ────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function generateFactId(): string {
  return `kf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Compute token-level similarity between two strings.
 * Returns a value between 0 and 1.
 */
function tokenSimilarity(textA: string, textB: string): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  if (tokensA.length === 0 && tokensB.length === 0) return 1;
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  let matches = 0;
  for (const ta of tokensA) {
    for (const tb of tokensB) {
      if (ta === tb) { matches++; break; }
      if (ta.length > 3 && tb.length > 3) {
        if (ta.includes(tb) || tb.includes(ta)) { matches += 0.5; break; }
      }
    }
  }
  return clamp(matches / Math.max(tokensA.length, tokensB.length), 0, 1);
}

/**
 * Check whether a string contains a negation indicator.
 */
function containsNegation(text: string): boolean {
  const lower = text.toLowerCase();
  return NEGATION_PREFIXES.some(neg => lower.includes(neg));
}

/**
 * Strip negation words from a string for comparison purposes.
 */
function stripNegation(text: string): string {
  let result = text.toLowerCase();
  for (const neg of NEGATION_PREFIXES) {
    result = result.replace(new RegExp(`\\b${neg}\\b`, 'gi'), '');
  }
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Extract meaningful entities from a question string.
 * Filters out stop words and returns deduplicated tokens.
 */
function extractEntities(text: string): string[] {
  const tokens = tokenize(text);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const t of tokens) {
    if (!seen.has(t)) {
      seen.add(t);
      result.push(t);
    }
  }
  return result;
}

/**
 * Compute coverage: fraction of query entities addressed by a set of facts.
 */
function computeCoverage(entities: string[], facts: KnowledgeFact[]): number {
  if (entities.length === 0) return 0;
  const factText = facts
    .map(f => `${f.subject} ${f.relation} ${f.object}`)
    .join(' ')
    .toLowerCase();
  let covered = 0;
  for (const entity of entities) {
    if (factText.includes(entity)) covered++;
  }
  return round2(covered / entities.length);
}

/**
 * Generate a natural language sentence from a single fact.
 */
function factToSentence(fact: KnowledgeFact): string {
  return `${fact.subject} ${fact.relation} ${fact.object}`;
}

/**
 * Build a natural language explanation string from an ordered chain of facts.
 */
function chainToNaturalLanguage(steps: KnowledgeFact[]): string {
  if (steps.length === 0) return 'No reasoning steps available.';
  if (steps.length === 1) return factToSentence(steps[0]);

  const parts: string[] = [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (i === 0) {
      parts.push(`Starting from the fact that ${factToSentence(s)}`);
    } else if (i === steps.length - 1) {
      parts.push(`we can conclude that ${factToSentence(s)}`);
    } else {
      parts.push(`and knowing that ${factToSentence(s)}`);
    }
  }
  return parts.join(', ') + '.';
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class KnowledgeReasoner {
  private readonly config: KnowledgeReasonerConfig;
  private facts: KnowledgeFact[] = [];
  private factIndex: Map<string, KnowledgeFact> = new Map();
  private totalInferences = 0;
  private totalCompositions = 0;
  private totalContradictionsFound = 0;
  private totalHypothesesGenerated = 0;
  private totalExplanations = 0;
  private confidenceHistory: number[] = [];
  private feedbackCorrect = 0;
  private feedbackTotal = 0;

  constructor(config?: Partial<KnowledgeReasonerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── 1. Knowledge Fact Store ─────────────────────────────────────────────

  /**
   * Add a new knowledge fact to the store.
   * Performs LRU eviction if the store is full.
   * Optionally runs contradiction detection before insertion.
   *
   * @param subject - The subject entity (e.g., "TypeScript")
   * @param relation - The relation (e.g., "has")
   * @param object - The object entity (e.g., "generics")
   * @param confidence - Confidence score between 0 and 1 (default 1.0)
   * @param source - Provenance label (default "user")
   * @returns The unique fact id
   */
  addFact(
    subject: string,
    relation: string,
    object: string,
    confidence: number = 1.0,
    source: string = 'user',
  ): string {
    // Enforce capacity by evicting least-recently-used facts
    while (this.facts.length >= this.config.maxFacts) {
      this.evictLRU();
    }

    const now = Date.now();
    const fact: KnowledgeFact = {
      id: generateFactId(),
      subject: subject.toLowerCase().trim(),
      relation: relation.toLowerCase().trim(),
      object: object.toLowerCase().trim(),
      confidence: clamp(confidence, 0, 1),
      source,
      createdAt: now,
      lastUsed: now,
      useCount: 0,
    };

    // Optionally check for contradictions before inserting
    if (this.config.enableContradictionDetection) {
      const contradictions = this.checkConsistency(fact);
      if (contradictions.length > 0) {
        this.totalContradictionsFound += contradictions.length;
      }
    }

    this.facts.push(fact);
    this.factIndex.set(fact.id, fact);

    return fact.id;
  }

  /**
   * Remove a fact by its unique id.
   *
   * @param factId - The id of the fact to remove
   * @returns true if the fact was found and removed, false otherwise
   */
  removeFact(factId: string): boolean {
    const idx = this.facts.findIndex(f => f.id === factId);
    if (idx === -1) return false;

    this.facts.splice(idx, 1);
    this.factIndex.delete(factId);
    return true;
  }

  /**
   * Search for facts matching a partial query.
   * All provided fields must match (case-insensitive substring match).
   *
   * @param query - Partial fact fields to match against
   * @returns Array of matching facts, sorted by confidence descending
   */
  findFacts(query: Partial<KnowledgeFact>): KnowledgeFact[] {
    const results: KnowledgeFact[] = [];

    for (const fact of this.facts) {
      let match = true;

      if (query.subject !== undefined) {
        match = match && fact.subject.includes(query.subject.toLowerCase().trim());
      }
      if (query.relation !== undefined) {
        match = match && fact.relation.includes(query.relation.toLowerCase().trim());
      }
      if (query.object !== undefined) {
        match = match && fact.object.includes(query.object.toLowerCase().trim());
      }
      if (query.source !== undefined) {
        match = match && fact.source === query.source;
      }

      if (match) {
        this.touchFact(fact);
        results.push(fact);
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Retrieve all facts with a given subject.
   *
   * @param subject - The subject to search for
   * @returns Array of facts with matching subject
   */
  getFactsBySubject(subject: string): KnowledgeFact[] {
    return this.findFacts({ subject });
  }

  /**
   * Retrieve all facts with a given relation.
   *
   * @param relation - The relation to search for
   * @returns Array of facts with matching relation
   */
  getFactsByRelation(relation: string): KnowledgeFact[] {
    return this.findFacts({ relation });
  }

  /**
   * Get total number of facts currently stored.
   */
  getFactCount(): number {
    return this.facts.length;
  }

  /** Evict the least-recently-used fact from the store. */
  private evictLRU(): void {
    if (this.facts.length === 0) return;

    let lruIdx = 0;
    let lruTime = this.facts[0].lastUsed;

    for (let i = 1; i < this.facts.length; i++) {
      if (this.facts[i].lastUsed < lruTime) {
        lruIdx = i;
        lruTime = this.facts[i].lastUsed;
      }
    }

    const removed = this.facts.splice(lruIdx, 1)[0];
    this.factIndex.delete(removed.id);
  }

  /** Update last-used timestamp and use count for a fact. */
  private touchFact(fact: KnowledgeFact): void {
    fact.lastUsed = Date.now();
    fact.useCount++;
  }

  // ── 2. Transitive Inference ─────────────────────────────────────────────

  /**
   * Perform transitive inference starting from a given subject and relation.
   *
   * If A→B and B→C through the same (or compatible) relation, infer A→C.
   * Confidence diminishes with each hop via the configured decay factor.
   * Cycle detection prevents infinite loops.
   *
   * @param subject - The starting subject entity
   * @param relation - The relation to follow transitively
   * @param maxDepth - Maximum inference chain depth (default from config)
   * @returns Array of inference chains, sorted by confidence descending
   */
  inferTransitive(
    subject: string,
    relation: string,
    maxDepth?: number,
  ): InferenceChain[] {
    const depth = maxDepth ?? this.config.maxInferenceDepth;
    const normalSubject = subject.toLowerCase().trim();
    const normalRelation = relation.toLowerCase().trim();
    const chains: InferenceChain[] = [];
    const visited = new Set<string>();

    this.buildTransitiveChains(
      normalSubject,
      normalRelation,
      [],
      1.0,
      0,
      depth,
      visited,
      chains,
    );

    this.totalInferences += chains.length;

    for (const chain of chains) {
      this.confidenceHistory.push(chain.confidence);
    }

    return chains.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Recursive helper for transitive inference.
   * Builds chains by following object→subject links for the given relation.
   */
  private buildTransitiveChains(
    currentSubject: string,
    relation: string,
    currentSteps: KnowledgeFact[],
    currentConfidence: number,
    currentDepth: number,
    maxDepth: number,
    visited: Set<string>,
    results: InferenceChain[],
  ): void {
    if (currentDepth >= maxDepth) return;
    if (visited.has(currentSubject)) return;

    visited.add(currentSubject);

    // Find all facts where the current subject matches and relation is compatible
    const directFacts = this.facts.filter(
      f => f.subject === currentSubject && this.relationsMatch(f.relation, relation),
    );

    for (const fact of directFacts) {
      this.touchFact(fact);

      const newSteps = [...currentSteps, fact];
      const hopConfidence = currentConfidence * fact.confidence * this.config.confidenceDecayPerHop;
      const roundedConfidence = round2(hopConfidence);

      // Only record chains with depth > 0 (at least one inference hop beyond direct)
      if (newSteps.length >= 2 && roundedConfidence >= this.config.minConfidence) {
        const firstStep = newSteps[0];
        const lastStep = newSteps[newSteps.length - 1];

        results.push({
          conclusion: {
            subject: firstStep.subject,
            relation,
            object: lastStep.object,
          },
          steps: [...newSteps],
          confidence: roundedConfidence,
          depth: newSteps.length,
        });
      }

      // Continue building the chain from the object of the current fact
      if (roundedConfidence >= this.config.minConfidence) {
        this.buildTransitiveChains(
          fact.object,
          relation,
          newSteps,
          hopConfidence,
          currentDepth + 1,
          maxDepth,
          visited,
          results,
        );
      }
    }

    visited.delete(currentSubject);
  }

  /**
   * Check if two relations are compatible for transitive chaining.
   * Exact match or partial substring overlap qualifies.
   */
  private relationsMatch(r1: string, r2: string): boolean {
    if (r1 === r2) return true;
    if (r1.includes(r2) || r2.includes(r1)) return true;
    return false;
  }

  // ── 3. Knowledge Composition ────────────────────────────────────────────

  /**
   * Compose an answer to a natural language question by combining multiple facts.
   *
   * Extracts entities from the question, finds relevant facts, builds inference
   * chains, and generates a natural language explanation.
   *
   * @param question - The natural language question
   * @param maxFacts - Maximum number of facts to include (default 10)
   * @returns A composed answer with explanation, confidence, and coverage
   */
  composeAnswer(question: string, maxFacts: number = 10): ComposedAnswer {
    const entities = extractEntities(question);

    if (entities.length === 0) {
      return this.emptyAnswer(question);
    }

    // Gather all relevant facts
    const relevantFacts = this.gatherRelevantFacts(entities, maxFacts);

    if (relevantFacts.length === 0) {
      return this.emptyAnswer(question);
    }

    // Build inference chains from the relevant facts
    const chains = this.buildCompositionChains(entities, relevantFacts);

    // Score and rank
    const coverage = computeCoverage(entities, relevantFacts);
    const avgConfidence = relevantFacts.length > 0
      ? round2(relevantFacts.reduce((s, f) => s + f.confidence, 0) / relevantFacts.length)
      : 0;

    // Generate explanation
    const explanation = this.generateCompositionExplanation(question, relevantFacts, chains);

    // Build the answer text
    const answer = this.buildAnswerText(question, relevantFacts, chains);

    this.totalCompositions++;
    this.confidenceHistory.push(avgConfidence);

    return {
      answer,
      facts: relevantFacts,
      chains,
      confidence: avgConfidence,
      coverage,
      explanation,
    };
  }

  /**
   * Gather facts relevant to the given entities, ranked by relevance.
   */
  private gatherRelevantFacts(entities: string[], maxFacts: number): KnowledgeFact[] {
    const scored: Array<{ fact: KnowledgeFact; score: number }> = [];
    const seen = new Set<string>();

    for (const fact of this.facts) {
      const factText = `${fact.subject} ${fact.relation} ${fact.object}`;
      let score = 0;

      for (const entity of entities) {
        const sim = tokenSimilarity(factText, entity);
        score += sim;
      }

      if (score > 0 && !seen.has(fact.id)) {
        seen.add(fact.id);
        scored.push({ fact, score: round2(score * fact.confidence) });
        this.touchFact(fact);
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxFacts).map(s => s.fact);
  }

  /**
   * Build inference chains connecting entities through the relevant facts.
   */
  private buildCompositionChains(
    entities: string[],
    relevantFacts: KnowledgeFact[],
  ): InferenceChain[] {
    const chains: InferenceChain[] = [];

    // For each pair of entities, try to find chains connecting them
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityChains = this.findChainsConnecting(
          entities[i],
          entities[j],
          relevantFacts,
        );
        chains.push(...entityChains);
      }
    }

    // Also try transitive inference on each entity
    for (const entity of entities) {
      const factsBySubject = relevantFacts.filter(f => f.subject.includes(entity));
      for (const fact of factsBySubject) {
        const transitiveChains = this.inferTransitive(fact.subject, fact.relation, 3);
        for (const tc of transitiveChains) {
          if (tc.confidence >= this.config.minConfidence) {
            chains.push(tc);
          }
        }
      }
    }

    // Deduplicate and sort by confidence
    const unique = this.deduplicateChains(chains);
    return unique.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }

  /**
   * Find fact chains connecting two entities through intermediate facts.
   */
  private findChainsConnecting(
    entityA: string,
    entityB: string,
    factPool: KnowledgeFact[],
  ): InferenceChain[] {
    const results: InferenceChain[] = [];

    // Direct connection: one fact links entityA to entityB
    for (const fact of factPool) {
      if (
        (fact.subject.includes(entityA) && fact.object.includes(entityB)) ||
        (fact.subject.includes(entityB) && fact.object.includes(entityA))
      ) {
        results.push({
          conclusion: { subject: fact.subject, relation: fact.relation, object: fact.object },
          steps: [fact],
          confidence: fact.confidence,
          depth: 1,
        });
      }
    }

    // Two-hop connection: A→X→B
    for (const f1 of factPool) {
      if (!f1.subject.includes(entityA) && !f1.object.includes(entityA)) continue;
      const intermediary = f1.subject.includes(entityA) ? f1.object : f1.subject;

      for (const f2 of factPool) {
        if (f2.id === f1.id) continue;
        const connectsToB =
          (f2.subject.includes(intermediary) && f2.object.includes(entityB)) ||
          (f2.object.includes(intermediary) && f2.subject.includes(entityB));

        if (connectsToB) {
          const conf = round2(
            f1.confidence * f2.confidence * this.config.confidenceDecayPerHop,
          );
          if (conf >= this.config.minConfidence) {
            results.push({
              conclusion: { subject: entityA, relation: 'relates-to', object: entityB },
              steps: [f1, f2],
              confidence: conf,
              depth: 2,
            });
          }
        }
      }
    }

    return results;
  }

  /** Deduplicate chains by comparing conclusion subjects and objects. */
  private deduplicateChains(chains: InferenceChain[]): InferenceChain[] {
    const seen = new Set<string>();
    const unique: InferenceChain[] = [];

    for (const chain of chains) {
      const key = `${chain.conclusion.subject}|${chain.conclusion.relation}|${chain.conclusion.object}|${chain.depth}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(chain);
      }
    }

    return unique;
  }

  /** Generate a human-readable explanation for a composed answer. */
  private generateCompositionExplanation(
    question: string,
    facts: KnowledgeFact[],
    chains: InferenceChain[],
  ): string {
    const parts: string[] = [];
    parts.push(`To answer "${question}", I found ${facts.length} relevant fact(s).`);

    if (chains.length > 0) {
      parts.push(`I identified ${chains.length} reasoning chain(s) connecting the concepts.`);
      const bestChain = chains[0];
      if (bestChain.steps.length > 0) {
        parts.push(
          `The strongest chain (confidence ${bestChain.confidence}) follows: ` +
          chainToNaturalLanguage(bestChain.steps),
        );
      }
    }

    if (facts.length >= 2) {
      parts.push(
        'By combining these facts: ' +
        facts.slice(0, 3).map(f => `"${factToSentence(f)}"`).join(', ') +
        (facts.length > 3 ? ` and ${facts.length - 3} more` : '') + '.',
      );
    }

    return parts.join(' ');
  }

  /** Build a concise answer text from collected facts and chains. */
  private buildAnswerText(
    question: string,
    facts: KnowledgeFact[],
    chains: InferenceChain[],
  ): string {
    if (facts.length === 0) return `I don't have enough knowledge to answer: "${question}"`;

    const statements = facts.slice(0, 5).map(f => factToSentence(f));

    if (chains.length > 0 && chains[0].steps.length >= 2) {
      const chain = chains[0];
      const conclusionText =
        `${chain.conclusion.subject} ${chain.conclusion.relation} ${chain.conclusion.object}`;
      statements.push(`Therefore, ${conclusionText}`);
    }

    return statements.join('. ') + '.';
  }

  /** Return an empty answer with zero scores. */
  private emptyAnswer(question: string): ComposedAnswer {
    return {
      answer: `I don't have enough knowledge to answer: "${question}"`,
      facts: [],
      chains: [],
      confidence: 0,
      coverage: 0,
      explanation: 'No relevant facts found for this question.',
    };
  }

  // ── 4. Contradiction Detection ──────────────────────────────────────────

  /**
   * Scan all stored facts for contradictions.
   *
   * Detects three types of contradictions:
   * - **negation**: A fact and its direct negation (e.g., "X is Y" vs "X is not Y")
   * - **conflict**: Exclusive relation with different objects (e.g., "X is A" vs "X is B")
   * - **inconsistency**: Overlapping claims with conflicting implications
   *
   * @returns Array of detected contradictions with resolution suggestions
   */
  detectContradictions(): Contradiction[] {
    const contradictions: Contradiction[] = [];

    for (let i = 0; i < this.facts.length; i++) {
      for (let j = i + 1; j < this.facts.length; j++) {
        const c = this.checkPairForContradiction(this.facts[i], this.facts[j]);
        if (c) contradictions.push(c);
      }
    }

    this.totalContradictionsFound += contradictions.length;
    return contradictions;
  }

  /**
   * Check whether a new fact would contradict any existing facts.
   * Useful for pre-validation before calling addFact.
   *
   * @param newFact - The candidate fact to check (partial: needs subject, relation, object)
   * @returns Array of contradictions that would arise from adding this fact
   */
  checkConsistency(newFact: KnowledgeFact): Contradiction[] {
    const contradictions: Contradiction[] = [];

    for (const existing of this.facts) {
      const c = this.checkPairForContradiction(existing, newFact);
      if (c) contradictions.push(c);
    }

    return contradictions;
  }

  /**
   * Check a pair of facts for any type of contradiction.
   */
  private checkPairForContradiction(
    f1: KnowledgeFact,
    f2: KnowledgeFact,
  ): Contradiction | null {
    // Check for direct negation
    const negation = this.checkNegation(f1, f2);
    if (negation) return negation;

    // Check for exclusive-relation conflict
    const conflict = this.checkExclusiveConflict(f1, f2);
    if (conflict) return conflict;

    // Check for broader inconsistency
    const inconsistency = this.checkInconsistency(f1, f2);
    if (inconsistency) return inconsistency;

    return null;
  }

  /**
   * Detect direct negation: same subject and object, but one relation is the
   * negated form of the other.
   */
  private checkNegation(f1: KnowledgeFact, f2: KnowledgeFact): Contradiction | null {
    if (f1.subject !== f2.subject) return null;
    if (tokenSimilarity(f1.object, f2.object) < 0.8) return null;

    const r1HasNeg = containsNegation(f1.relation) || containsNegation(f1.object);
    const r2HasNeg = containsNegation(f2.relation) || containsNegation(f2.object);

    // Exactly one should contain negation
    if (r1HasNeg === r2HasNeg) return null;

    const stripped1 = stripNegation(`${f1.relation} ${f1.object}`);
    const stripped2 = stripNegation(`${f2.relation} ${f2.object}`);

    if (tokenSimilarity(stripped1, stripped2) >= 0.7) {
      return {
        fact1: f1,
        fact2: f2,
        type: 'negation',
        description:
          `Direct negation: "${factToSentence(f1)}" contradicts "${factToSentence(f2)}"`,
        resolution: this.resolveContradiction(f1, f2),
      };
    }

    return null;
  }

  /**
   * Detect exclusive-relation conflict: same subject and relation, but
   * different objects on a relation that should be unique.
   */
  private checkExclusiveConflict(
    f1: KnowledgeFact,
    f2: KnowledgeFact,
  ): Contradiction | null {
    if (f1.subject !== f2.subject) return null;
    if (f1.relation !== f2.relation) return null;
    if (f1.object === f2.object) return null;

    if (!EXCLUSIVE_RELATIONS.has(f1.relation)) return null;

    return {
      fact1: f1,
      fact2: f2,
      type: 'conflict',
      description:
        `Conflicting values: "${f1.subject}" ${f1.relation} "${f1.object}" ` +
        `vs "${f2.object}" (exclusive relation)`,
      resolution: this.resolveContradiction(f1, f2),
    };
  }

  /**
   * Detect broader inconsistency: same subject, similar relations,
   * but objects that appear contradictory.
   */
  private checkInconsistency(
    f1: KnowledgeFact,
    f2: KnowledgeFact,
  ): Contradiction | null {
    if (f1.subject !== f2.subject) return null;
    if (tokenSimilarity(f1.relation, f2.relation) < 0.6) return null;
    if (f1.object === f2.object) return null;

    // Check if objects appear to be antonyms or contradictory
    const obj1HasNeg = containsNegation(f1.object);
    const obj2HasNeg = containsNegation(f2.object);

    if (obj1HasNeg !== obj2HasNeg) {
      const stripped1 = stripNegation(f1.object);
      const stripped2 = stripNegation(f2.object);

      if (tokenSimilarity(stripped1, stripped2) >= 0.6) {
        return {
          fact1: f1,
          fact2: f2,
          type: 'inconsistency',
          description:
            `Inconsistency detected: "${factToSentence(f1)}" vs "${factToSentence(f2)}"`,
          resolution: this.resolveContradiction(f1, f2),
        };
      }
    }

    return null;
  }

  /**
   * Determine a resolution strategy for a contradiction.
   * Prefers higher confidence, then more recent facts.
   */
  private resolveContradiction(f1: KnowledgeFact, f2: KnowledgeFact): string {
    if (f1.confidence !== f2.confidence) {
      const preferred = f1.confidence > f2.confidence ? f1 : f2;
      return `Prefer "${factToSentence(preferred)}" (higher confidence: ${preferred.confidence})`;
    }

    if (f1.createdAt !== f2.createdAt) {
      const preferred = f1.createdAt > f2.createdAt ? f1 : f2;
      return `Prefer "${factToSentence(preferred)}" (more recent)`;
    }

    return 'Both facts have equal confidence and recency — flagged for manual review.';
  }

  // ── 5. Confidence Propagation ───────────────────────────────────────────

  /**
   * Compute propagated confidence for a chain of facts.
   *
   * Confidence diminishes per hop: `product(hop_confidences) * decayFactor^hops`.
   *
   * @param chain - Ordered array of facts forming a reasoning chain
   * @returns The propagated confidence value
   */
  propagateConfidence(chain: KnowledgeFact[]): number {
    if (chain.length === 0) return 0;
    if (chain.length === 1) return chain[0].confidence;

    let combined = 1.0;
    for (const fact of chain) {
      combined *= fact.confidence;
    }

    const decayFactor = Math.pow(this.config.confidenceDecayPerHop, chain.length - 1);
    return round2(clamp(combined * decayFactor, 0, 1));
  }

  /**
   * Accumulate evidence from multiple independent chains supporting the
   * same conclusion.
   *
   * Uses a noisy-OR model: combined = 1 - product(1 - chainConfidence_i).
   *
   * @param chains - Array of independent inference chains
   * @returns The accumulated confidence after combining all chains
   */
  accumulateEvidence(chains: InferenceChain[]): number {
    if (chains.length === 0) return 0;
    if (chains.length === 1) return chains[0].confidence;

    let productOfComplements = 1.0;
    for (const chain of chains) {
      productOfComplements *= (1 - chain.confidence);
    }

    return round2(clamp(1 - productOfComplements, 0, 1));
  }

  /**
   * Check whether a given confidence level meets the configured threshold.
   *
   * @param confidence - The confidence value to check
   * @returns true if the confidence is at or above the minimum threshold
   */
  meetsConfidenceThreshold(confidence: number): boolean {
    return confidence >= this.config.minConfidence;
  }

  // ── 6. Explanation Generation ───────────────────────────────────────────

  /**
   * Generate a full explanation for how a conclusion can be reached
   * from the current knowledge base.
   *
   * Produces multiple explanation paths ranked by confidence,
   * and identifies any counter-evidence.
   *
   * @param conclusion - A natural language conclusion to explain
   * @returns An ExplanationResult with paths and counter-evidence
   */
  explain(conclusion: string): ExplanationResult {
    this.totalExplanations++;

    const entities = extractEntities(conclusion);
    const explanations: ExplanationPath[] = [];

    // Find facts that support the conclusion
    const supportingFacts = this.gatherRelevantFacts(entities, 20);

    // Build explanation paths from different starting points
    for (const startFact of supportingFacts) {
      const paths = this.buildExplanationPaths(startFact, entities, supportingFacts);
      explanations.push(...paths);
    }

    // Deduplicate and sort by confidence
    const uniqueExplanations = this.deduplicateExplanations(explanations);
    uniqueExplanations.sort((a, b) => b.confidence - a.confidence);

    // Find counter-evidence
    const counterEvidence = this.findCounterEvidence(conclusion, supportingFacts);

    return {
      conclusion,
      explanations: uniqueExplanations.slice(0, 5),
      counterEvidence,
    };
  }

  /**
   * Build explanation paths starting from a given fact.
   */
  private buildExplanationPaths(
    startFact: KnowledgeFact,
    targetEntities: string[],
    factPool: KnowledgeFact[],
  ): ExplanationPath[] {
    const results: ExplanationPath[] = [];

    // Single-fact path
    const singleSteps = [factToSentence(startFact)];
    results.push({
      steps: singleSteps,
      naturalLanguage: `Because ${factToSentence(startFact)}.`,
      confidence: startFact.confidence,
    });

    // Multi-fact paths: find connected facts
    for (const nextFact of factPool) {
      if (nextFact.id === startFact.id) continue;

      // Check if nextFact connects to startFact
      const connected =
        nextFact.subject.includes(startFact.object) ||
        startFact.object.includes(nextFact.subject) ||
        tokenSimilarity(startFact.object, nextFact.subject) >= 0.5;

      if (connected) {
        const steps = [factToSentence(startFact), factToSentence(nextFact)];
        const chainConfidence = round2(
          startFact.confidence * nextFact.confidence * this.config.confidenceDecayPerHop,
        );

        const nl = chainToNaturalLanguage([startFact, nextFact]);

        results.push({
          steps,
          naturalLanguage: nl,
          confidence: chainConfidence,
        });

        // Three-fact paths
        for (const thirdFact of factPool) {
          if (thirdFact.id === startFact.id || thirdFact.id === nextFact.id) continue;

          const thirdConnected =
            thirdFact.subject.includes(nextFact.object) ||
            nextFact.object.includes(thirdFact.subject) ||
            tokenSimilarity(nextFact.object, thirdFact.subject) >= 0.5;

          if (thirdConnected) {
            const threeSteps = [
              factToSentence(startFact),
              factToSentence(nextFact),
              factToSentence(thirdFact),
            ];
            const threeConf = round2(
              startFact.confidence *
              nextFact.confidence *
              thirdFact.confidence *
              Math.pow(this.config.confidenceDecayPerHop, 2),
            );

            if (threeConf >= this.config.minConfidence) {
              results.push({
                steps: threeSteps,
                naturalLanguage: chainToNaturalLanguage([startFact, nextFact, thirdFact]),
                confidence: threeConf,
              });
            }
          }
        }
      }
    }

    return results;
  }

  /** Deduplicate explanation paths by their step sequence. */
  private deduplicateExplanations(paths: ExplanationPath[]): ExplanationPath[] {
    const seen = new Set<string>();
    const unique: ExplanationPath[] = [];

    for (const path of paths) {
      const key = path.steps.join('→');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(path);
      }
    }

    return unique;
  }

  /**
   * Find facts that serve as counter-evidence to a conclusion.
   * Looks for facts with negation or conflicting assertions about the entities.
   */
  private findCounterEvidence(
    conclusion: string,
    supportingFacts: KnowledgeFact[],
  ): KnowledgeFact[] {
    const entities = extractEntities(conclusion);
    const counter: KnowledgeFact[] = [];
    const supportingIds = new Set(supportingFacts.map(f => f.id));

    for (const fact of this.facts) {
      if (supportingIds.has(fact.id)) continue;

      const factText = `${fact.subject} ${fact.relation} ${fact.object}`;
      let relevant = false;

      for (const entity of entities) {
        if (tokenSimilarity(factText, entity) >= 0.3) {
          relevant = true;
          break;
        }
      }

      if (relevant && containsNegation(factText)) {
        counter.push(fact);
      }
    }

    return counter.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  // ── 7. Hypothesis Generation ────────────────────────────────────────────

  /**
   * Generate plausible hypotheses for a question when no direct answer exists.
   *
   * Uses three strategies:
   * - **analogical**: If A is like B, and B has property P, maybe A has P
   * - **inductive**: Generalize from multiple specific facts
   * - **abductive**: Infer the best explanation for observed patterns
   *
   * @param question - The question to generate hypotheses for
   * @param maxHypotheses - Maximum number of hypotheses (default from config)
   * @returns Array of hypotheses ranked by confidence
   */
  generateHypotheses(
    question: string,
    maxHypotheses?: number,
  ): Hypothesis[] {
    if (!this.config.enableHypothesisGeneration) return [];

    const limit = maxHypotheses ?? this.config.maxHypotheses;
    const entities = extractEntities(question);
    const hypotheses: Hypothesis[] = [];

    // Strategy 1: Analogical hypotheses
    const analogical = this.generateAnalogicalHypotheses(entities);
    hypotheses.push(...analogical);

    // Strategy 2: Inductive hypotheses
    const inductive = this.generateInductiveHypotheses(entities);
    hypotheses.push(...inductive);

    // Strategy 3: Abductive hypotheses
    const abductive = this.generateAbductiveHypotheses(entities, question);
    hypotheses.push(...abductive);

    // Sort by confidence, apply discount, and limit
    hypotheses.sort((a, b) => b.confidence - a.confidence);
    const limited = hypotheses.slice(0, limit);

    this.totalHypothesesGenerated += limited.length;

    for (const h of limited) {
      this.confidenceHistory.push(h.confidence);
    }

    return limited;
  }

  /**
   * Analogical hypothesis: if entity A shares properties with entity B,
   * and B has property P, hypothesize that A might also have P.
   */
  private generateAnalogicalHypotheses(entities: string[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    for (const entity of entities) {
      // Find facts about this entity
      const entityFacts = this.facts.filter(f => f.subject.includes(entity));

      // Find other subjects that share relations/objects with this entity
      for (const ef of entityFacts) {
        const similarSubjects = this.facts.filter(
          f => f.subject !== ef.subject &&
               f.relation === ef.relation &&
               f.object === ef.object,
        );

        for (const similar of similarSubjects) {
          // Find properties of the similar subject that the entity doesn't have
          const similarProps = this.facts.filter(
            f => f.subject === similar.subject && f.relation !== ef.relation,
          );

          for (const prop of similarProps) {
            // Check the entity doesn't already have this property
            const alreadyHas = this.facts.some(
              f => f.subject.includes(entity) &&
                   f.relation === prop.relation &&
                   f.object === prop.object,
            );

            if (!alreadyHas) {
              const confidence = round2(
                ef.confidence * similar.confidence * prop.confidence * 0.5,
              );

              if (confidence >= this.config.minConfidence) {
                hypotheses.push({
                  statement: `${entity} might ${prop.relation} ${prop.object}`,
                  confidence,
                  supportingFacts: [ef, similar, prop],
                  reasoning:
                    `${entity} and ${similar.subject} both ${ef.relation} ${ef.object}. ` +
                    `Since ${similar.subject} ${prop.relation} ${prop.object}, ` +
                    `${entity} might also ${prop.relation} ${prop.object}.`,
                  type: 'analogical',
                });
              }
            }
          }
        }
      }
    }

    return hypotheses;
  }

  /**
   * Inductive hypothesis: generalize from multiple specific instances.
   * If several subjects with a shared trait also share another trait,
   * hypothesize that the pattern holds generally.
   */
  private generateInductiveHypotheses(entities: string[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    for (const entity of entities) {
      // Find all relations involving this entity
      const entityFacts = this.facts.filter(
        f => f.subject.includes(entity) || f.object.includes(entity),
      );

      // Group facts by relation
      const byRelation = new Map<string, KnowledgeFact[]>();
      for (const f of entityFacts) {
        const existing = byRelation.get(f.relation) ?? [];
        existing.push(f);
        byRelation.set(f.relation, existing);
      }

      // Look for patterns: if 3+ facts share a relation, generalize
      for (const [relation, facts] of byRelation.entries()) {
        if (facts.length >= 3) {
          const objects = [...new Set(facts.map(f => f.object))];
          const avgConf = round2(
            facts.reduce((s, f) => s + f.confidence, 0) / facts.length,
          );

          // Apply confidence discount for hypothesis
          const discountedConf = round2(avgConf * 0.7);

          if (discountedConf >= this.config.minConfidence) {
            hypotheses.push({
              statement:
                `Generally, ${entity} ${relation} many things including: ${objects.slice(0, 3).join(', ')}`,
              confidence: discountedConf,
              supportingFacts: facts.slice(0, 5),
              reasoning:
                `Found ${facts.length} instances of "${entity}" with relation "${relation}". ` +
                `This suggests a general pattern.`,
              type: 'inductive',
            });
          }
        }
      }
    }

    return hypotheses;
  }

  /**
   * Abductive hypothesis: given an observation (the question), infer the
   * best explanation by working backward from known effects.
   */
  private generateAbductiveHypotheses(
    entities: string[],
    question: string,
  ): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    for (const entity of entities) {
      // Find facts where this entity is the object (effect)
      const asEffect = this.facts.filter(f => f.object.includes(entity));

      if (asEffect.length >= 2) {
        // Multiple causes for this entity suggest explanatory patterns
        const causes = asEffect.map(f => f.subject);
        const avgConf = round2(
          asEffect.reduce((s, f) => s + f.confidence, 0) / asEffect.length,
        );

        const discountedConf = round2(avgConf * 0.6);

        if (discountedConf >= this.config.minConfidence) {
          hypotheses.push({
            statement:
              `${entity} might be explained by the combination of: ${causes.slice(0, 3).join(', ')}`,
            confidence: discountedConf,
            supportingFacts: asEffect.slice(0, 5),
            reasoning:
              `Multiple factors (${causes.slice(0, 3).join(', ')}) are known to ` +
              `relate to ${entity}. A combined explanation is plausible.`,
            type: 'abductive',
          });
        }
      }

      // Single-cause abduction: find the best single explanation
      const bestCause = asEffect.sort((a, b) => b.confidence - a.confidence)[0];
      if (bestCause) {
        const conf = round2(bestCause.confidence * 0.6);
        if (conf >= this.config.minConfidence) {
          hypotheses.push({
            statement: `${entity} is likely because ${bestCause.subject} ${bestCause.relation} ${entity}`,
            confidence: conf,
            supportingFacts: [bestCause],
            reasoning:
              `The best single explanation for "${entity}" is "${bestCause.subject}" ` +
              `(${bestCause.relation}), with confidence ${bestCause.confidence}.`,
            type: 'abductive',
          });
        }
      }
    }

    return hypotheses;
  }

  // ── Feedback & Stats ────────────────────────────────────────────────────

  /**
   * Provide feedback on a previous reasoning result.
   * Adjusts confidence of involved facts based on correctness.
   *
   * @param factIds - Array of fact IDs involved in the result
   * @param correct - Whether the result was correct
   */
  feedback(factIds: string[], correct: boolean): void {
    this.feedbackTotal++;
    if (correct) this.feedbackCorrect++;

    for (const id of factIds) {
      const fact = this.factIndex.get(id);
      if (!fact) continue;

      if (correct) {
        fact.confidence = round2(clamp(fact.confidence + 0.05, 0, 1));
      } else {
        fact.confidence = round2(clamp(fact.confidence - 0.1, 0, 1));
      }
    }
  }

  /** Return aggregate statistics. */
  getStats(): Readonly<KnowledgeReasonerStats> {
    const avg = this.confidenceHistory.length > 0
      ? this.confidenceHistory.reduce((s, v) => s + v, 0) / this.confidenceHistory.length
      : 0;

    return {
      totalFacts: this.facts.length,
      totalInferences: this.totalInferences,
      totalCompositions: this.totalCompositions,
      totalContradictionsFound: this.totalContradictionsFound,
      totalHypothesesGenerated: this.totalHypothesesGenerated,
      totalExplanations: this.totalExplanations,
      avgConfidence: round2(avg),
      feedbackReceived: this.feedbackTotal,
      feedbackAccuracy: this.feedbackTotal > 0
        ? round2(this.feedbackCorrect / this.feedbackTotal)
        : 0,
    };
  }

  /** Serialize the reasoner state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      facts: this.facts,
      totalInferences: this.totalInferences,
      totalCompositions: this.totalCompositions,
      totalContradictionsFound: this.totalContradictionsFound,
      totalHypothesesGenerated: this.totalHypothesesGenerated,
      totalExplanations: this.totalExplanations,
      confidenceHistory: this.confidenceHistory,
      feedbackCorrect: this.feedbackCorrect,
      feedbackTotal: this.feedbackTotal,
    });
  }

  /** Restore a KnowledgeReasoner from serialized JSON. */
  static deserialize(json: string): KnowledgeReasoner {
    const data = JSON.parse(json) as {
      config: KnowledgeReasonerConfig;
      facts: KnowledgeFact[];
      totalInferences: number;
      totalCompositions: number;
      totalContradictionsFound: number;
      totalHypothesesGenerated: number;
      totalExplanations: number;
      confidenceHistory: number[];
      feedbackCorrect: number;
      feedbackTotal: number;
    };

    const instance = new KnowledgeReasoner(data.config);
    instance.facts = data.facts;
    instance.factIndex = new Map(data.facts.map(f => [f.id, f]));
    instance.totalInferences = data.totalInferences;
    instance.totalCompositions = data.totalCompositions;
    instance.totalContradictionsFound = data.totalContradictionsFound;
    instance.totalHypothesesGenerated = data.totalHypothesesGenerated;
    instance.totalExplanations = data.totalExplanations;
    instance.confidenceHistory = data.confidenceHistory;
    instance.feedbackCorrect = data.feedbackCorrect;
    instance.feedbackTotal = data.feedbackTotal;
    return instance;
  }
}
