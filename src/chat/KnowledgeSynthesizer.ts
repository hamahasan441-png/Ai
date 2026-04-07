/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🧠  K N O W L E D G E   S Y N T H E S I Z E R                      ║
 * ║                                                                             ║
 * ║   Cross-domain knowledge fusion and synthesis:                              ║
 * ║     fuse → detect → synthesize → transfer                                   ║
 * ║                                                                             ║
 * ║     • Combine knowledge from multiple domains into unified insights         ║
 * ║     • Detect contradictions across knowledge sources                        ║
 * ║     • Generate non-obvious connections between concepts                     ║
 * ║     • Analyze gaps in a knowledge base                                      ║
 * ║     • Synthesize comprehensive summaries from multiple inputs               ║
 * ║     • Map concepts from one domain to another                               ║
 * ║     • Weigh and aggregate evidence from multiple sources                    ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface KnowledgeSynthesizerConfig {
  maxSources: number;
  contradictionThreshold: number;
  insightMinNovelty: number;
  minConfidence: number;
  maxFacts: number;
  enableLearning: boolean;
  gapAnalysisDepth: number;
  summaryMaxKeyPoints: number;
  transferMinQuality: number;
  evidenceWeightDecay: number;
}

export interface KnowledgeSynthesizerStats {
  totalFusions: number;
  totalContradictions: number;
  totalInsights: number;
  totalGapAnalyses: number;
  totalSummaries: number;
  totalTransfers: number;
  totalEvidenceAggregations: number;
  avgConfidence: number;
  feedbackReceived: number;
  feedbackAccuracy: number;
}

export interface KnowledgeSource {
  id: string;
  domain: string;
  facts: string[];
  confidence: number;
  timestamp: number;
}

export interface FusionResult {
  unifiedFacts: string[];
  contradictions: Contradiction[];
  novelInsights: Insight[];
  coverage: number;
  confidence: number;
}

export interface Contradiction {
  factA: string;
  factB: string;
  sourceA: string;
  sourceB: string;
  severity: number;
  resolution?: string;
}

export interface Insight {
  description: string;
  connections: string[];
  novelty: number;
  confidence: number;
  domains: string[];
}

export interface KnowledgeGapResult {
  missingAreas: string[];
  coverage: number;
  recommendations: string[];
}

export interface SynthesizedSummary {
  summary: string;
  keyPoints: string[];
  sources: string[];
  confidence: number;
}

export interface DomainMapping {
  sourceDomain: string;
  targetDomain: string;
  mappings: Array<{ sourceConcept: string; targetConcept: string; similarity: number }>;
  transferQuality: number;
}

export interface EvidenceAggregation {
  claim: string;
  evidence: Array<{ source: string; fact: string; weight: number; direction: 'supports' | 'contradicts' | 'neutral' }>;
  aggregateConfidence: number;
  methodology: string;
  verdict: 'supported' | 'contradicted' | 'inconclusive';
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: KnowledgeSynthesizerConfig = {
  maxSources: 50,
  contradictionThreshold: 0.6,
  insightMinNovelty: 0.3,
  minConfidence: 0.1,
  maxFacts: 500,
  enableLearning: true,
  gapAnalysisDepth: 3,
  summaryMaxKeyPoints: 10,
  transferMinQuality: 0.25,
  evidenceWeightDecay: 0.1,
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

// ── Negation & Contradiction Patterns ───────────────────────────────────────

const NEGATION_PATTERNS: RegExp[] = [
  /\bnot\b/gi,
  /\bno\b/gi,
  /\bnever\b/gi,
  /\bwithout\b/gi,
  /\bdon'?t\b/gi,
  /\bdoesn'?t\b/gi,
  /\bisn'?t\b/gi,
  /\baren'?t\b/gi,
  /\bwon'?t\b/gi,
  /\bcan'?t\b/gi,
  /\bcannot\b/gi,
  /\bnone\b/gi,
  /\bneither\b/gi,
  /\bnor\b/gi,
];

const ANTONYM_PAIRS: [string, string][] = [
  ['increase', 'decrease'],
  ['fast', 'slow'],
  ['good', 'bad'],
  ['high', 'low'],
  ['large', 'small'],
  ['strong', 'weak'],
  ['safe', 'dangerous'],
  ['simple', 'complex'],
  ['efficient', 'inefficient'],
  ['reliable', 'unreliable'],
  ['true', 'false'],
  ['positive', 'negative'],
  ['success', 'failure'],
  ['accept', 'reject'],
  ['improve', 'degrade'],
  ['enable', 'disable'],
  ['open', 'closed'],
  ['include', 'exclude'],
  ['always', 'never'],
  ['more', 'less'],
];

// ── Domain Concept Database ─────────────────────────────────────────────────

interface DomainConceptEntry {
  concept: string;
  domain: string;
  relatedConcepts: string[];
  abstractPattern: string;
}

function buildDomainConceptDatabase(): DomainConceptEntry[] {
  const entries: DomainConceptEntry[] = [];

  const add = (
    concept: string, domain: string,
    relatedConcepts: string[], abstractPattern: string,
  ) => {
    entries.push({ concept, domain, relatedConcepts, abstractPattern });
  };

  // ── Software Engineering ──
  add('microservices', 'software-architecture',
    ['distributed systems', 'api gateway', 'service mesh'],
    'decomposition-into-independent-units');
  add('caching', 'software-performance',
    ['redis', 'memcached', 'CDN', 'memoization'],
    'store-frequently-accessed-data-closer');
  add('load balancing', 'software-infrastructure',
    ['round robin', 'least connections', 'health checks'],
    'distribute-work-across-resources');
  add('continuous integration', 'software-devops',
    ['automated testing', 'build pipeline', 'deployment'],
    'automate-validation-of-changes');
  add('database indexing', 'software-databases',
    ['B-tree', 'hash index', 'query optimization'],
    'organize-data-for-faster-retrieval');
  add('encryption', 'software-security',
    ['TLS', 'AES', 'RSA', 'hashing'],
    'transform-data-to-prevent-unauthorized-access');
  add('version control', 'software-devops',
    ['git', 'branching', 'merging', 'commit history'],
    'track-and-manage-changes-over-time');
  add('refactoring', 'software-engineering',
    ['code quality', 'design patterns', 'technical debt'],
    'restructure-without-changing-behavior');

  // ── Data Science ──
  add('feature engineering', 'data-science',
    ['dimensionality reduction', 'normalization', 'encoding'],
    'transform-raw-inputs-into-meaningful-signals');
  add('cross-validation', 'data-science',
    ['train-test split', 'k-fold', 'overfitting'],
    'validate-model-on-unseen-data');
  add('gradient descent', 'machine-learning',
    ['learning rate', 'convergence', 'loss function'],
    'iteratively-optimize-toward-minimum');
  add('regularization', 'machine-learning',
    ['L1', 'L2', 'dropout', 'overfitting prevention'],
    'constrain-model-to-prevent-overfitting');

  // ── Business ──
  add('market segmentation', 'business-strategy',
    ['target audience', 'demographics', 'positioning'],
    'divide-population-into-meaningful-groups');
  add('supply chain', 'business-operations',
    ['logistics', 'inventory', 'procurement'],
    'coordinate-flow-of-goods-and-services');
  add('risk management', 'business-finance',
    ['hedging', 'diversification', 'insurance'],
    'identify-and-mitigate-potential-losses');
  add('agile methodology', 'business-management',
    ['scrum', 'kanban', 'sprint', 'retrospective'],
    'iterative-adaptive-approach-to-delivery');

  // ── Science & Engineering ──
  add('feedback loop', 'systems-theory',
    ['positive feedback', 'negative feedback', 'homeostasis'],
    'output-influences-subsequent-input');
  add('redundancy', 'reliability-engineering',
    ['failover', 'backup', 'replication'],
    'duplicate-critical-components-for-resilience');
  add('signal filtering', 'electrical-engineering',
    ['low-pass', 'high-pass', 'noise reduction'],
    'remove-unwanted-components-from-signal');
  add('catalyst', 'chemistry',
    ['enzyme', 'activation energy', 'reaction rate'],
    'accelerate-process-without-being-consumed');

  return entries;
}

// ── Reference Knowledge Areas ───────────────────────────────────────────────

const REFERENCE_KNOWLEDGE_AREAS: string[] = [
  'architecture', 'performance', 'security', 'testing',
  'deployment', 'monitoring', 'documentation', 'scalability',
  'reliability', 'maintainability', 'data management', 'networking',
  'authentication', 'authorization', 'error handling', 'logging',
  'configuration', 'dependency management', 'code quality', 'accessibility',
  'internationalization', 'compliance', 'disaster recovery', 'cost optimization',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

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

function containsNegation(text: string): boolean {
  for (const pat of NEGATION_PATTERNS) {
    pat.lastIndex = 0;
    if (pat.test(text)) return true;
  }
  return false;
}

function containsAntonym(textA: string, textB: string): boolean {
  const lowerA = textA.toLowerCase();
  const lowerB = textB.toLowerCase();
  for (const [word, opposite] of ANTONYM_PAIRS) {
    if (
      (lowerA.includes(word) && lowerB.includes(opposite)) ||
      (lowerA.includes(opposite) && lowerB.includes(word))
    ) {
      return true;
    }
  }
  return false;
}

function uniqueStrings(arr: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const s of arr) {
    const key = s.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(s);
    }
  }
  return result;
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class KnowledgeSynthesizer {
  private readonly config: KnowledgeSynthesizerConfig;
  private readonly conceptDB: DomainConceptEntry[];
  private sources: KnowledgeSource[] = [];
  private totalFusions = 0;
  private totalContradictions = 0;
  private totalInsights = 0;
  private totalGapAnalyses = 0;
  private totalSummaries = 0;
  private totalTransfers = 0;
  private totalEvidenceAggregations = 0;
  private confidenceHistory: number[] = [];
  private feedbackCorrect = 0;
  private feedbackTotal = 0;

  constructor(config?: Partial<KnowledgeSynthesizerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.conceptDB = buildDomainConceptDatabase();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /** Register a knowledge source for future operations. */
  addSource(source: KnowledgeSource): void {
    if (this.sources.length >= this.config.maxSources) {
      this.sources.sort((a, b) => a.confidence - b.confidence);
      this.sources.shift();
    }
    this.sources.push(source);
  }

  /** Get all currently registered sources. */
  getSources(): ReadonlyArray<KnowledgeSource> {
    return this.sources;
  }

  /** Clear all registered sources. */
  clearSources(): void {
    this.sources = [];
  }

  /** Fuse knowledge from multiple sources into a unified result. */
  fuseKnowledge(sources?: KnowledgeSource[]): FusionResult {
    const input = sources ?? this.sources;
    this.totalFusions++;

    const allFacts = this.collectAllFacts(input);
    const unifiedFacts = this.deduplicateFacts(allFacts);
    const contradictions = this.detectContradictions(input);
    const novelInsights = this.generateInsights(input);

    this.totalContradictions += contradictions.length;
    this.totalInsights += novelInsights.length;

    const coverage = this.computeCoverage(input);
    const confidence = this.computeFusionConfidence(input, contradictions);
    this.confidenceHistory.push(confidence);

    return {
      unifiedFacts,
      contradictions,
      novelInsights,
      coverage: round2(coverage),
      confidence: round2(confidence),
    };
  }

  /** Detect contradictions across knowledge sources. */
  findContradictions(sources?: KnowledgeSource[]): Contradiction[] {
    const input = sources ?? this.sources;
    const contradictions = this.detectContradictions(input);
    this.totalContradictions += contradictions.length;
    return contradictions;
  }

  /** Generate novel insights by finding cross-domain connections. */
  generateNovelInsights(sources?: KnowledgeSource[]): Insight[] {
    const input = sources ?? this.sources;
    const insights = this.generateInsights(input);
    this.totalInsights += insights.length;
    return insights;
  }

  /** Analyze knowledge gaps relative to a reference set of areas. */
  analyzeKnowledgeGaps(
    sources?: KnowledgeSource[],
    referenceAreas?: string[],
  ): KnowledgeGapResult {
    const input = sources ?? this.sources;
    const areas = referenceAreas ?? REFERENCE_KNOWLEDGE_AREAS;
    this.totalGapAnalyses++;

    const coveredAreas = new Set<string>();
    const allFacts = this.collectAllFacts(input);

    for (const area of areas) {
      for (const fact of allFacts) {
        if (tokenSimilarity(fact, area) >= 0.25) {
          coveredAreas.add(area);
          break;
        }
      }
    }

    const missingAreas = areas.filter(a => !coveredAreas.has(a));
    const coverage = areas.length > 0 ? coveredAreas.size / areas.length : 0;

    const recommendations = this.generateGapRecommendations(
      missingAreas, allFacts, input,
    );

    const conf = round2(coverage);
    this.confidenceHistory.push(conf);

    return {
      missingAreas,
      coverage: round2(coverage),
      recommendations,
    };
  }

  /** Synthesize a comprehensive summary from multiple sources. */
  synthesizeSummary(sources?: KnowledgeSource[]): SynthesizedSummary {
    const input = sources ?? this.sources;
    this.totalSummaries++;

    const allFacts = this.collectAllFacts(input);
    const deduplicated = this.deduplicateFacts(allFacts);
    const keyPoints = this.extractTopKeyPoints(deduplicated);

    const summary = this.buildSummaryText(keyPoints, input);
    const sourceIds = input.map(s => s.id);
    const confidence = this.computeSummaryConfidence(input);
    this.confidenceHistory.push(confidence);

    return {
      summary,
      keyPoints,
      sources: sourceIds,
      confidence: round2(confidence),
    };
  }

  /** Map concepts from one domain to another. */
  transferKnowledge(sourceDomain: string, targetDomain: string): DomainMapping {
    this.totalTransfers++;

    const sourceConcepts = this.conceptDB.filter(
      e => tokenSimilarity(e.domain, sourceDomain) >= 0.3,
    );
    const targetConcepts = this.conceptDB.filter(
      e => tokenSimilarity(e.domain, targetDomain) >= 0.3,
    );

    const mappings: DomainMapping['mappings'] = [];

    for (const sc of sourceConcepts) {
      let bestMatch: DomainConceptEntry | null = null;
      let bestScore = 0;

      // First try abstract pattern matching
      for (const tc of targetConcepts) {
        const patternSim = tokenSimilarity(sc.abstractPattern, tc.abstractPattern);
        const conceptSim = tokenSimilarity(sc.concept, tc.concept);
        const relatedOverlap = this.computeRelatedOverlap(sc.relatedConcepts, tc.relatedConcepts);
        const score = patternSim * 0.5 + conceptSim * 0.3 + relatedOverlap * 0.2;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = tc;
        }
      }

      if (bestMatch && bestScore >= this.config.transferMinQuality) {
        mappings.push({
          sourceConcept: sc.concept,
          targetConcept: bestMatch.concept,
          similarity: round2(bestScore),
        });
      }
    }

    // Also try to map based on facts from registered sources
    const sourceFacts = this.sources
      .filter(s => tokenSimilarity(s.domain, sourceDomain) >= 0.3)
      .flatMap(s => s.facts);
    const targetFacts = this.sources
      .filter(s => tokenSimilarity(s.domain, targetDomain) >= 0.3)
      .flatMap(s => s.facts);

    for (const sf of sourceFacts) {
      for (const tf of targetFacts) {
        const sim = tokenSimilarity(sf, tf);
        if (sim >= this.config.transferMinQuality && sim < 0.9) {
          const alreadyMapped = mappings.some(
            m => tokenSimilarity(m.sourceConcept, sf) >= 0.8,
          );
          if (!alreadyMapped) {
            mappings.push({
              sourceConcept: sf,
              targetConcept: tf,
              similarity: round2(sim),
            });
          }
        }
      }
    }

    mappings.sort((a, b) => b.similarity - a.similarity);
    const transferQuality = mappings.length > 0
      ? mappings.reduce((s, m) => s + m.similarity, 0) / mappings.length
      : 0;

    const conf = round2(transferQuality);
    this.confidenceHistory.push(conf);

    return {
      sourceDomain,
      targetDomain,
      mappings: mappings.slice(0, 20),
      transferQuality: round2(transferQuality),
    };
  }

  /** Aggregate evidence for a specific claim across sources. */
  aggregateEvidence(claim: string, sources?: KnowledgeSource[]): EvidenceAggregation {
    const input = sources ?? this.sources;
    this.totalEvidenceAggregations++;

    const evidence: EvidenceAggregation['evidence'] = [];
    const claimTokens = tokenize(claim);

    for (const source of input) {
      for (const fact of source.facts) {
        const similarity = tokenSimilarity(claim, fact);
        if (similarity < 0.2) continue;

        const direction = this.determineEvidenceDirection(claim, fact, claimTokens);
        const recency = this.computeRecencyWeight(source.timestamp);
        const weight = round2(similarity * source.confidence * recency);

        evidence.push({
          source: source.id,
          fact,
          weight,
          direction,
        });
      }
    }

    evidence.sort((a, b) => b.weight - a.weight);

    const { aggregateConfidence, verdict } = this.computeEvidenceVerdict(evidence);
    this.confidenceHistory.push(aggregateConfidence);

    const methodology = this.describeAggregationMethodology(evidence);

    return {
      claim,
      evidence: evidence.slice(0, 20),
      aggregateConfidence: round2(aggregateConfidence),
      methodology,
      verdict,
    };
  }

  /** Learn from feedback on a previous fusion or insight. */
  learnFromFeedback(resultConfidence: number, correct: boolean): void {
    if (!this.config.enableLearning) return;
    this.feedbackTotal++;
    if (correct) this.feedbackCorrect++;

    // Adjust source confidences based on feedback
    for (const source of this.sources) {
      if (correct) {
        source.confidence = round2(clamp(source.confidence + 0.02, 0, 1));
      } else {
        source.confidence = round2(clamp(source.confidence - 0.05, 0, 1));
      }
    }
  }

  /** Return aggregate statistics. */
  getStats(): Readonly<KnowledgeSynthesizerStats> {
    const avg = this.confidenceHistory.length > 0
      ? this.confidenceHistory.reduce((s, v) => s + v, 0) / this.confidenceHistory.length
      : 0;

    return {
      totalFusions: this.totalFusions,
      totalContradictions: this.totalContradictions,
      totalInsights: this.totalInsights,
      totalGapAnalyses: this.totalGapAnalyses,
      totalSummaries: this.totalSummaries,
      totalTransfers: this.totalTransfers,
      totalEvidenceAggregations: this.totalEvidenceAggregations,
      avgConfidence: round2(avg),
      feedbackReceived: this.feedbackTotal,
      feedbackAccuracy: this.feedbackTotal > 0
        ? round2(this.feedbackCorrect / this.feedbackTotal)
        : 0,
    };
  }

  /** Serialize the synthesizer state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      sources: this.sources,
      totalFusions: this.totalFusions,
      totalContradictions: this.totalContradictions,
      totalInsights: this.totalInsights,
      totalGapAnalyses: this.totalGapAnalyses,
      totalSummaries: this.totalSummaries,
      totalTransfers: this.totalTransfers,
      totalEvidenceAggregations: this.totalEvidenceAggregations,
      confidenceHistory: this.confidenceHistory,
      feedbackCorrect: this.feedbackCorrect,
      feedbackTotal: this.feedbackTotal,
    });
  }

  /** Restore a KnowledgeSynthesizer from serialized JSON. */
  static deserialize(json: string): KnowledgeSynthesizer {
    const data = JSON.parse(json) as {
      config: KnowledgeSynthesizerConfig;
      sources: KnowledgeSource[];
      totalFusions: number;
      totalContradictions: number;
      totalInsights: number;
      totalGapAnalyses: number;
      totalSummaries: number;
      totalTransfers: number;
      totalEvidenceAggregations: number;
      confidenceHistory: number[];
      feedbackCorrect: number;
      feedbackTotal: number;
    };

    const instance = new KnowledgeSynthesizer(data.config);
    instance.sources = data.sources;
    instance.totalFusions = data.totalFusions;
    instance.totalContradictions = data.totalContradictions;
    instance.totalInsights = data.totalInsights;
    instance.totalGapAnalyses = data.totalGapAnalyses;
    instance.totalSummaries = data.totalSummaries;
    instance.totalTransfers = data.totalTransfers;
    instance.totalEvidenceAggregations = data.totalEvidenceAggregations;
    instance.confidenceHistory = data.confidenceHistory;
    instance.feedbackCorrect = data.feedbackCorrect;
    instance.feedbackTotal = data.feedbackTotal;
    return instance;
  }

  // ── Fusion Internals ──────────────────────────────────────────────────────

  /** Collect all facts from a list of sources. */
  private collectAllFacts(sources: KnowledgeSource[]): string[] {
    const facts: string[] = [];
    for (const source of sources) {
      for (const fact of source.facts) {
        facts.push(fact);
        if (facts.length >= this.config.maxFacts) return facts;
      }
    }
    return facts;
  }

  /** Remove duplicate or near-duplicate facts. */
  private deduplicateFacts(facts: string[]): string[] {
    const result: string[] = [];
    const used = new Set<number>();

    for (let i = 0; i < facts.length; i++) {
      if (used.has(i)) continue;
      result.push(facts[i]);
      used.add(i);

      for (let j = i + 1; j < facts.length; j++) {
        if (used.has(j)) continue;
        const sim = tokenSimilarity(facts[i], facts[j]);
        if (sim >= 0.85) {
          used.add(j);
        }
      }
    }

    return result;
  }

  // ── Contradiction Detection Internals ─────────────────────────────────────

  /** Detect contradictions between facts across different sources. */
  private detectContradictions(sources: KnowledgeSource[]): Contradiction[] {
    const contradictions: Contradiction[] = [];

    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const srcA = sources[i];
        const srcB = sources[j];

        for (const factA of srcA.facts) {
          for (const factB of srcB.facts) {
            const contradiction = this.checkContradiction(
              factA, factB, srcA, srcB,
            );
            if (contradiction) {
              contradictions.push(contradiction);
            }
          }
        }
      }
    }

    contradictions.sort((a, b) => b.severity - a.severity);
    return contradictions;
  }

  /** Check if two facts are contradictory. */
  private checkContradiction(
    factA: string, factB: string,
    sourceA: KnowledgeSource, sourceB: KnowledgeSource,
  ): Contradiction | null {
    const similarity = tokenSimilarity(factA, factB);
    if (similarity < 0.3) return null;

    const hasNegationDifference =
      (containsNegation(factA) && !containsNegation(factB)) ||
      (!containsNegation(factA) && containsNegation(factB));

    const hasAntonyms = containsAntonym(factA, factB);

    if (!hasNegationDifference && !hasAntonyms) return null;

    const severity = round2(
      similarity * 0.4 +
      (hasNegationDifference ? 0.3 : 0) +
      (hasAntonyms ? 0.3 : 0),
    );

    if (severity < this.config.contradictionThreshold) return null;

    const resolution = this.suggestResolution(
      factA, factB, sourceA, sourceB, severity,
    );

    return {
      factA,
      factB,
      sourceA: sourceA.id,
      sourceB: sourceB.id,
      severity,
      resolution,
    };
  }

  /** Suggest a resolution for a detected contradiction. */
  private suggestResolution(
    factA: string, factB: string,
    sourceA: KnowledgeSource, sourceB: KnowledgeSource,
    severity: number,
  ): string | undefined {
    if (severity < 0.5) {
      return 'Low severity — consider both perspectives as complementary.';
    }

    if (sourceA.confidence > sourceB.confidence + 0.2) {
      return `Prefer source "${sourceA.id}" (confidence: ${sourceA.confidence}) over "${sourceB.id}" (confidence: ${sourceB.confidence}).`;
    }
    if (sourceB.confidence > sourceA.confidence + 0.2) {
      return `Prefer source "${sourceB.id}" (confidence: ${sourceB.confidence}) over "${sourceA.id}" (confidence: ${sourceA.confidence}).`;
    }

    if (sourceA.timestamp > sourceB.timestamp) {
      return `Prefer more recent source "${sourceA.id}" — information may have been updated.`;
    }
    if (sourceB.timestamp > sourceA.timestamp) {
      return `Prefer more recent source "${sourceB.id}" — information may have been updated.`;
    }

    return 'Both sources are equally credible — manual review recommended.';
  }

  // ── Insight Generation Internals ──────────────────────────────────────────

  /** Generate insights by finding cross-domain connections. */
  private generateInsights(sources: KnowledgeSource[]): Insight[] {
    const insights: Insight[] = [];

    // Cross-domain fact connections
    const domainGroups = this.groupFactsByDomain(sources);
    const domains = Object.keys(domainGroups);

    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const domA = domains[i];
        const domB = domains[j];
        const factsA = domainGroups[domA];
        const factsB = domainGroups[domB];

        const crossConnections = this.findCrossDomainConnections(
          factsA, factsB, domA, domB,
        );
        insights.push(...crossConnections);
      }
    }

    // Pattern-based insights from concept database
    const patternInsights = this.findPatternBasedInsights(sources);
    insights.push(...patternInsights);

    // Filter by novelty threshold
    const filtered = insights.filter(
      ins => ins.novelty >= this.config.insightMinNovelty,
    );

    filtered.sort((a, b) => b.novelty - a.novelty);
    return filtered.slice(0, 20);
  }

  /** Group facts by their source domain. */
  private groupFactsByDomain(
    sources: KnowledgeSource[],
  ): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    for (const source of sources) {
      if (!groups[source.domain]) groups[source.domain] = [];
      groups[source.domain].push(...source.facts);
    }
    return groups;
  }

  /** Find connections between facts from two different domains. */
  private findCrossDomainConnections(
    factsA: string[], factsB: string[],
    domainA: string, domainB: string,
  ): Insight[] {
    const insights: Insight[] = [];

    for (const fa of factsA) {
      for (const fb of factsB) {
        const sim = tokenSimilarity(fa, fb);
        if (sim >= 0.25 && sim < 0.85) {
          const novelty = round2(sim * (1 - sim) * 4);
          const confidence = round2(sim * 0.8);

          insights.push({
            description: `Cross-domain connection: "${this.truncate(fa, 60)}" (${domainA}) relates to "${this.truncate(fb, 60)}" (${domainB}).`,
            connections: [fa, fb],
            novelty,
            confidence,
            domains: [domainA, domainB],
          });
        }
      }
    }

    return insights;
  }

  /** Find insights by matching facts against the concept database. */
  private findPatternBasedInsights(sources: KnowledgeSource[]): Insight[] {
    const insights: Insight[] = [];
    const allFacts = this.collectAllFacts(sources);

    for (const fact of allFacts) {
      const matchingConcepts: DomainConceptEntry[] = [];

      for (const entry of this.conceptDB) {
        const sim = tokenSimilarity(fact, entry.concept);
        if (sim >= 0.3) {
          matchingConcepts.push(entry);
        }
      }

      if (matchingConcepts.length >= 2) {
        const domainsInvolved = uniqueStrings(matchingConcepts.map(c => c.domain));
        if (domainsInvolved.length >= 2) {
          const novelty = round2(
            Math.min(1, matchingConcepts.length * 0.25),
          );
          insights.push({
            description: `Fact "${this.truncate(fact, 80)}" connects concepts across ${domainsInvolved.join(', ')}.`,
            connections: matchingConcepts.map(c => c.concept),
            novelty,
            confidence: round2(0.5 + matchingConcepts.length * 0.05),
            domains: domainsInvolved,
          });
        }
      }
    }

    return insights;
  }

  // ── Knowledge Gap Internals ───────────────────────────────────────────────

  /** Generate recommendations for identified knowledge gaps. */
  private generateGapRecommendations(
    missingAreas: string[],
    existingFacts: string[],
    sources: KnowledgeSource[],
  ): string[] {
    const recommendations: string[] = [];

    for (const area of missingAreas) {
      // Check if any existing facts are tangentially related
      let closestFact = '';
      let closestSim = 0;

      for (const fact of existingFacts) {
        const sim = tokenSimilarity(fact, area);
        if (sim > closestSim) {
          closestSim = sim;
          closestFact = fact;
        }
      }

      if (closestSim > 0.15) {
        recommendations.push(
          `Expand on "${this.truncate(closestFact, 50)}" to cover "${area}" (partial overlap: ${round2(closestSim)}).`,
        );
      } else {
        recommendations.push(
          `Add dedicated knowledge source for "${area}" — no existing coverage found.`,
        );
      }
    }

    // Check for domains with low diversity
    const domainCounts: Record<string, number> = {};
    for (const source of sources) {
      domainCounts[source.domain] = (domainCounts[source.domain] ?? 0) + source.facts.length;
    }

    const avgFactsPerDomain = Object.values(domainCounts).length > 0
      ? Object.values(domainCounts).reduce((a, b) => a + b, 0) / Object.values(domainCounts).length
      : 0;

    for (const [domain, count] of Object.entries(domainCounts)) {
      if (count < avgFactsPerDomain * 0.3) {
        recommendations.push(
          `Domain "${domain}" has limited coverage (${count} facts vs avg ${round2(avgFactsPerDomain)}). Consider adding more sources.`,
        );
      }
    }

    return recommendations;
  }

  // ── Summary Synthesis Internals ───────────────────────────────────────────

  /** Extract top key points from deduplicated facts. */
  private extractTopKeyPoints(facts: string[]): string[] {
    const scored: Array<{ fact: string; score: number }> = [];

    for (const fact of facts) {
      const tokens = tokenize(fact);
      const uniqueTokens = new Set(tokens);

      // Score by information density and length
      const lengthScore = Math.min(1, tokens.length / 15);
      const uniquenessScore = tokens.length > 0 ? uniqueTokens.size / tokens.length : 0;

      // Bonus for facts that relate to multiple concept-DB entries
      let conceptOverlap = 0;
      for (const entry of this.conceptDB) {
        if (tokenSimilarity(fact, entry.concept) >= 0.3) {
          conceptOverlap++;
        }
      }
      const conceptScore = Math.min(1, conceptOverlap * 0.2);

      const score = lengthScore * 0.3 + uniquenessScore * 0.3 + conceptScore * 0.4;
      scored.push({ fact, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, this.config.summaryMaxKeyPoints).map(s => s.fact);
  }

  /** Build a textual summary from key points and sources. */
  private buildSummaryText(keyPoints: string[], sources: KnowledgeSource[]): string {
    const domainSet = new Set(sources.map(s => s.domain));
    const domains = Array.from(domainSet);

    const parts: string[] = [];

    parts.push(
      `Synthesized from ${sources.length} source(s) across ${domains.length} domain(s): ${domains.join(', ')}.`,
    );

    if (keyPoints.length > 0) {
      parts.push(`Key findings: ${keyPoints.slice(0, 5).join('. ')}.`);
    }

    if (keyPoints.length > 5) {
      parts.push(
        `Additional points: ${keyPoints.slice(5).join('. ')}.`,
      );
    }

    const totalFacts = sources.reduce((s, src) => s + src.facts.length, 0);
    parts.push(
      `Total facts considered: ${totalFacts}. Unique key points extracted: ${keyPoints.length}.`,
    );

    return parts.join(' ');
  }

  /** Compute confidence for a synthesized summary. */
  private computeSummaryConfidence(sources: KnowledgeSource[]): number {
    if (sources.length === 0) return 0;

    const avgSourceConfidence = sources.reduce((s, src) => s + src.confidence, 0) / sources.length;
    const domainDiversity = new Set(sources.map(s => s.domain)).size / Math.max(sources.length, 1);
    const sourceCountBonus = Math.min(1, sources.length / 5);

    return round2(
      clamp(avgSourceConfidence * 0.5 + domainDiversity * 0.25 + sourceCountBonus * 0.25, 0, 1),
    );
  }

  // ── Domain Transfer Internals ─────────────────────────────────────────────

  /** Compute overlap between two lists of related concepts. */
  private computeRelatedOverlap(listA: string[], listB: string[]): number {
    if (listA.length === 0 || listB.length === 0) return 0;

    let matches = 0;
    for (const a of listA) {
      for (const b of listB) {
        if (tokenSimilarity(a, b) >= 0.4) {
          matches++;
          break;
        }
      }
    }
    return matches / Math.max(listA.length, listB.length);
  }

  // ── Evidence Aggregation Internals ────────────────────────────────────────

  /** Determine whether evidence supports, contradicts, or is neutral. */
  private determineEvidenceDirection(
    claim: string, fact: string, _claimTokens: string[],
  ): 'supports' | 'contradicts' | 'neutral' {
    const similarity = tokenSimilarity(claim, fact);

    const claimNegated = containsNegation(claim);
    const factNegated = containsNegation(fact);

    if (claimNegated !== factNegated && similarity >= 0.4) {
      return 'contradicts';
    }

    if (containsAntonym(claim, fact) && similarity >= 0.3) {
      return 'contradicts';
    }

    if (similarity >= 0.4) {
      return 'supports';
    }

    return 'neutral';
  }

  /** Compute recency weight for a source based on its timestamp. */
  private computeRecencyWeight(timestamp: number): number {
    const now = Date.now();
    const ageMs = Math.max(0, now - timestamp);
    const ageHours = ageMs / (1000 * 60 * 60);
    return clamp(1 - ageHours * this.config.evidenceWeightDecay * 0.01, 0.2, 1);
  }

  /** Compute aggregate verdict from evidence. */
  private computeEvidenceVerdict(
    evidence: EvidenceAggregation['evidence'],
  ): { aggregateConfidence: number; verdict: EvidenceAggregation['verdict'] } {
    if (evidence.length === 0) {
      return { aggregateConfidence: 0, verdict: 'inconclusive' };
    }

    let supportWeight = 0;
    let contradictWeight = 0;
    let totalWeight = 0;

    for (const e of evidence) {
      totalWeight += e.weight;
      if (e.direction === 'supports') supportWeight += e.weight;
      else if (e.direction === 'contradicts') contradictWeight += e.weight;
    }

    if (totalWeight === 0) {
      return { aggregateConfidence: 0, verdict: 'inconclusive' };
    }

    const supportRatio = supportWeight / totalWeight;
    const contradictRatio = contradictWeight / totalWeight;

    let verdict: EvidenceAggregation['verdict'];
    let aggregateConfidence: number;

    if (supportRatio >= 0.6) {
      verdict = 'supported';
      aggregateConfidence = supportRatio;
    } else if (contradictRatio >= 0.6) {
      verdict = 'contradicted';
      aggregateConfidence = contradictRatio;
    } else {
      verdict = 'inconclusive';
      aggregateConfidence = 1 - Math.abs(supportRatio - contradictRatio);
    }

    return { aggregateConfidence: round2(aggregateConfidence), verdict };
  }

  /** Describe the methodology used for evidence aggregation. */
  private describeAggregationMethodology(
    evidence: EvidenceAggregation['evidence'],
  ): string {
    const supportCount = evidence.filter(e => e.direction === 'supports').length;
    const contradictCount = evidence.filter(e => e.direction === 'contradicts').length;
    const neutralCount = evidence.filter(e => e.direction === 'neutral').length;

    return (
      `Weighted evidence aggregation over ${evidence.length} piece(s) of evidence. ` +
      `${supportCount} supporting, ${contradictCount} contradicting, ${neutralCount} neutral. ` +
      `Weights derived from source confidence, fact similarity, and recency.`
    );
  }

  // ── Coverage & Confidence Internals ───────────────────────────────────────

  /** Compute overall coverage of a set of sources against reference areas. */
  private computeCoverage(sources: KnowledgeSource[]): number {
    const allFacts = this.collectAllFacts(sources);
    let covered = 0;

    for (const area of REFERENCE_KNOWLEDGE_AREAS) {
      for (const fact of allFacts) {
        if (tokenSimilarity(fact, area) >= 0.25) {
          covered++;
          break;
        }
      }
    }

    return REFERENCE_KNOWLEDGE_AREAS.length > 0
      ? covered / REFERENCE_KNOWLEDGE_AREAS.length
      : 0;
  }

  /** Compute confidence for a fusion result. */
  private computeFusionConfidence(
    sources: KnowledgeSource[],
    contradictions: Contradiction[],
  ): number {
    if (sources.length === 0) return 0;

    const avgSourceConf = sources.reduce((s, src) => s + src.confidence, 0) / sources.length;
    const contradictionPenalty = Math.min(0.4, contradictions.length * 0.05);
    const sourceBonus = Math.min(0.2, sources.length * 0.04);

    return clamp(avgSourceConf - contradictionPenalty + sourceBonus, 0, 1);
  }

  // ── Utility Methods ───────────────────────────────────────────────────────

  /** Truncate a string to a given length with ellipsis. */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }
}
