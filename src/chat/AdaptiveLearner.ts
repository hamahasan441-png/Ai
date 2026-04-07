/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║      🧬  A D A P T I V E   L E A R N E R  —  INTELLIGENCE MODULE           ║
 * ║                                                                             ║
 * ║   Phase 8 intelligence module for LocalBrain.                               ║
 * ║   Enables the AI to learn, generalize, and adapt from experience.           ║
 * ║                                                                             ║
 * ║   Capabilities:                                                             ║
 * ║     ✦ Fact Extraction — Parse natural language into structured facts         ║
 * ║     ✦ Concept Generalization — Abstract rules from specific examples        ║
 * ║     ✦ Transfer Learning — Apply knowledge across domains                    ║
 * ║     ✦ Mistake Learning — Learn from corrections and errors                  ║
 * ║     ✦ Confidence Calibration — Track and adjust prediction accuracy         ║
 * ║     ✦ Curriculum Learning — Order concepts by prerequisite chains           ║
 * ║                                                                             ║
 * ║   No external dependencies — fully self-contained intelligence.             ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES — Interfaces, types, and configuration                           ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Configuration for the AdaptiveLearner module. */
export interface AdaptiveLearnerConfig {
  /** Maximum number of extracted facts to store. */
  maxFacts: number;
  /** Maximum number of generalized rules to store. */
  maxRules: number;
  /** Maximum number of mistake lessons to store. */
  maxMistakes: number;
  /** Enable fact extraction from natural language. */
  enableFactExtraction: boolean;
  /** Enable concept generalization from examples. */
  enableGeneralization: boolean;
  /** Enable cross-domain transfer learning. */
  enableTransferLearning: boolean;
  /** Enable learning from mistakes and corrections. */
  enableMistakeLearning: boolean;
  /** Minimum number of examples required before generalizing a rule. */
  generalizationMinExamples: number;
  /** Confidence discount factor applied to cross-domain transfers (0–1). */
  transferConfidenceDiscount: number;
}

/** Runtime statistics for the AdaptiveLearner module. */
export interface AdaptiveLearnerStats {
  totalFactsExtracted: number;
  totalRulesGeneralized: number;
  totalTransfers: number;
  totalMistakesRecorded: number;
  totalCalibrations: number;
  totalFeedbacks: number;
  factsStored: number;
  rulesStored: number;
  mistakesStored: number;
  conceptsTracked: number;
  averageConfidence: number;
  createdAt: string;
  lastUsedAt: string;
}

/** A structured fact extracted from natural language. */
export interface ExtractedFact {
  /** The subject of the fact (e.g. "React"). */
  subject: string;
  /** The relation between subject and object (e.g. "uses"). */
  relation: string;
  /** The object of the fact (e.g. "JSX"). */
  object: string;
  /** Confidence score for the extraction (0–1). */
  confidence: number;
  /** The original source text. */
  source: string;
  /** Whether the fact is a negation. */
  negated: boolean;
}

/** A single training example used for generalization. */
export interface Example {
  /** The input text or concept. */
  input: string;
  /** The output or observed result. */
  output: string;
  /** The domain this example belongs to. */
  domain: string;
  /** Tags for categorization and matching. */
  tags: string[];
}

/** A generalized rule abstracted from multiple examples. */
export interface GeneralizedRule {
  /** The generalized pattern description. */
  pattern: string;
  /** Source examples that support this rule. */
  examples: string[];
  /** Counter-examples that conflict with this rule. */
  counterExamples: string[];
  /** Confidence in the rule (0–1). */
  confidence: number;
  /** The domain this rule applies to. */
  domain: string;
  /** Timestamp when the rule was created. */
  createdAt: number;
}

/** Result of a cross-domain knowledge transfer. */
export interface TransferResult {
  /** The concept being transferred. */
  concept: string;
  /** The domain the knowledge originates from. */
  sourceDomain: string;
  /** The domain the knowledge is being applied to. */
  targetDomain: string;
  /** The transferred knowledge statement. */
  transferredKnowledge: string;
  /** Confidence in the transfer (0–1). */
  confidence: number;
  /** Mappings between source and target domain elements. */
  mappings: DomainMapping[];
}

/** A mapping between elements in two domains. */
export interface DomainMapping {
  /** Element in the source domain. */
  sourceElement: string;
  /** Corresponding element in the target domain. */
  targetElement: string;
  /** Similarity score between the two elements (0–1). */
  similarity: number;
}

/** A lesson learned from a mistake. */
export interface MistakeLesson {
  /** The original incorrect prediction. */
  prediction: string;
  /** The correct answer. */
  actual: string;
  /** Category of the mistake. */
  category: MistakeCategory;
  /** Explanation of why the mistake occurred. */
  reason: string;
  /** Rule to prevent repeating this mistake. */
  correctionRule: string;
  /** Context in which the mistake was made. */
  context: string;
}

/** Categories of mistakes the learner can identify. */
export type MistakeCategory =
  | 'factual_error'
  | 'outdated_info'
  | 'wrong_context'
  | 'overgeneralization'
  | 'undergeneralization'
  | 'missing_knowledge';

/** A record of a single prediction for calibration tracking. */
export interface PredictionRecord {
  /** The predicted answer or value. */
  predicted: string;
  /** The actual/correct answer or value. */
  actual: string;
  /** Confidence assigned to the prediction (0–1). */
  confidence: number;
  /** Domain of the prediction. */
  domain: string;
  /** Timestamp of the prediction. */
  timestamp: number;
}

/** Report produced by confidence calibration analysis. */
export interface CalibrationReport {
  /** Brier score measuring prediction accuracy (lower is better, 0–1). */
  brierScore: number;
  /** Degree of overconfidence (positive means too confident). */
  overconfidence: number;
  /** Degree of underconfidence (positive means not confident enough). */
  underconfidence: number;
  /** Total number of predictions analyzed. */
  totalPredictions: number;
  /** Accuracy grouped by confidence bins (e.g. "0.8-0.9" → 0.75). */
  accuracyByConfidenceBin: Map<string, number>;
  /** Per-domain calibration adjustment factors. */
  domainCalibration: Map<string, number>;
}

/** Internal state for serialization/deserialization. */
interface AdaptiveLearnerState {
  config: AdaptiveLearnerConfig;
  stats: AdaptiveLearnerStats;
  facts: ExtractedFact[];
  rules: GeneralizedRule[];
  mistakes: MistakeLesson[];
  predictions: PredictionRecord[];
  conceptGraph: Record<string, string[]>;
  masteredConcepts: string[];
  domainMappings: Record<string, Record<string, string>>;
  mistakeFrequency: Record<string, number>;
  calibrationAdjustments: Record<string, number>;
}

/** Serializable version of CalibrationReport (Maps → plain objects). */
interface _SerializableCalibrationReport {
  brierScore: number;
  overconfidence: number;
  underconfidence: number;
  totalPredictions: number;
  accuracyByConfidenceBin: Record<string, number>;
  domainCalibration: Record<string, number>;
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  FACT EXTRACTION — Parse natural language into structured facts          ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Pattern template for extracting facts from natural language.
 * Each template defines a regex-like structure and a relation name.
 */
interface FactPattern {
  /** Regex to match against input text. */
  regex: RegExp;
  /** The relation this pattern captures (e.g. "uses", "is a"). */
  relation: string;
  /** Base confidence for matches with this pattern (0–1). */
  baseConfidence: number;
}

/** All supported fact extraction patterns with their relations. */
const FACT_PATTERNS: FactPattern[] = [
  { regex: /^(.+?)\s+uses\s+(.+)$/i, relation: 'uses', baseConfidence: 0.9 },
  { regex: /^(.+?)\s+is\s+a\s+(.+)$/i, relation: 'is a', baseConfidence: 0.85 },
  { regex: /^(.+?)\s+is\s+an\s+(.+)$/i, relation: 'is a', baseConfidence: 0.85 },
  { regex: /^(.+?)\s+has\s+(.+)$/i, relation: 'has', baseConfidence: 0.8 },
  { regex: /^(.+?)\s+enables\s+(.+)$/i, relation: 'enables', baseConfidence: 0.85 },
  { regex: /^(.+?)\s+requires\s+(.+)$/i, relation: 'requires', baseConfidence: 0.9 },
  { regex: /^(.+?)\s+is\s+built\s+with\s+(.+)$/i, relation: 'is built with', baseConfidence: 0.9 },
  { regex: /^(.+?)\s+supports\s+(.+)$/i, relation: 'supports', baseConfidence: 0.85 },
  { regex: /^(.+?)\s+improves\s+(.+)$/i, relation: 'improves', baseConfidence: 0.8 },
  { regex: /^(.+?)\s+replaces\s+(.+)$/i, relation: 'replaces', baseConfidence: 0.85 },
  { regex: /^(.+?)\s+extends\s+(.+)$/i, relation: 'extends', baseConfidence: 0.85 },
];

/** Negation patterns that invert the relation. */
const NEGATION_PATTERNS: FactPattern[] = [
  { regex: /^(.+?)\s+does\s+not\s+use\s+(.+)$/i, relation: 'uses', baseConfidence: 0.88 },
  { regex: /^(.+?)\s+is\s+not\s+a\s+(.+)$/i, relation: 'is a', baseConfidence: 0.83 },
  { regex: /^(.+?)\s+is\s+not\s+an\s+(.+)$/i, relation: 'is a', baseConfidence: 0.83 },
  { regex: /^(.+?)\s+does\s+not\s+have\s+(.+)$/i, relation: 'has', baseConfidence: 0.78 },
  { regex: /^(.+?)\s+does\s+not\s+enable\s+(.+)$/i, relation: 'enables', baseConfidence: 0.83 },
  { regex: /^(.+?)\s+does\s+not\s+require\s+(.+)$/i, relation: 'requires', baseConfidence: 0.88 },
  { regex: /^(.+?)\s+is\s+not\s+built\s+with\s+(.+)$/i, relation: 'is built with', baseConfidence: 0.88 },
  { regex: /^(.+?)\s+does\s+not\s+support\s+(.+)$/i, relation: 'supports', baseConfidence: 0.83 },
  { regex: /^(.+?)\s+does\s+not\s+improve\s+(.+)$/i, relation: 'improves', baseConfidence: 0.78 },
  { regex: /^(.+?)\s+does\s+not\s+replace\s+(.+)$/i, relation: 'replaces', baseConfidence: 0.83 },
  { regex: /^(.+?)\s+does\s+not\s+extend\s+(.+)$/i, relation: 'extends', baseConfidence: 0.83 },
];

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  DOMAIN KNOWLEDGE — Built-in domain similarity and concept mappings     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Built-in domain similarity scores used for transfer learning. */
const DOMAIN_SIMILARITY: Record<string, Record<string, number>> = {
  frontend: { backend: 0.6, mobile: 0.7, desktop: 0.5, devops: 0.3, database: 0.3, testing: 0.5, security: 0.4 },
  backend: { frontend: 0.6, mobile: 0.4, desktop: 0.4, devops: 0.5, database: 0.7, testing: 0.6, security: 0.5 },
  mobile: { frontend: 0.7, backend: 0.4, desktop: 0.6, devops: 0.3, database: 0.3, testing: 0.5, security: 0.4 },
  desktop: { frontend: 0.5, backend: 0.4, mobile: 0.6, devops: 0.3, database: 0.4, testing: 0.5, security: 0.4 },
  devops: { frontend: 0.3, backend: 0.5, mobile: 0.3, desktop: 0.3, database: 0.4, testing: 0.6, security: 0.6 },
  database: { frontend: 0.3, backend: 0.7, mobile: 0.3, desktop: 0.4, devops: 0.4, testing: 0.5, security: 0.5 },
  testing: { frontend: 0.5, backend: 0.6, mobile: 0.5, desktop: 0.5, devops: 0.6, database: 0.5, security: 0.5 },
  security: { frontend: 0.4, backend: 0.5, mobile: 0.4, desktop: 0.4, devops: 0.6, database: 0.5, testing: 0.5 },
};

/** Built-in concept mappings between domains for transfer learning. */
const DOMAIN_CONCEPT_MAPPINGS: Record<string, Record<string, Record<string, string>>> = {
  frontend: {
    backend: {
      'component': 'module',
      'state management': 'session management',
      'routing': 'routing',
      'rendering': 'response generation',
      'event handling': 'request handling',
      'virtual DOM': 'ORM',
      'CSS': 'configuration',
      'props': 'parameters',
    },
    mobile: {
      'component': 'widget',
      'state management': 'state management',
      'routing': 'navigation',
      'rendering': 'rendering',
      'CSS': 'styles',
      'event handling': 'gesture handling',
    },
  },
  backend: {
    frontend: {
      'module': 'component',
      'session management': 'state management',
      'routing': 'routing',
      'response generation': 'rendering',
      'request handling': 'event handling',
      'ORM': 'virtual DOM',
      'middleware': 'higher-order component',
      'parameters': 'props',
    },
    database: {
      'API endpoint': 'stored procedure',
      'middleware': 'trigger',
      'caching': 'indexing',
      'validation': 'constraint',
      'authentication': 'access control',
    },
  },
  testing: {
    frontend: {
      'unit test': 'component test',
      'integration test': 'integration test',
      'mock': 'mock',
      'fixture': 'test data',
      'assertion': 'assertion',
      'test runner': 'test runner',
      'coverage': 'coverage',
    },
    backend: {
      'unit test': 'unit test',
      'integration test': 'integration test',
      'mock': 'mock',
      'fixture': 'fixture',
      'assertion': 'assertion',
      'test runner': 'test runner',
      'coverage': 'coverage',
    },
  },
};

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4  CURRICULUM — Built-in concept prerequisites and difficulty ratings     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Built-in concept prerequisite relationships. */
const CONCEPT_PREREQUISITES: Record<string, string[]> = {
  'react hooks': ['react components', 'javascript functions', 'state management'],
  'react components': ['javascript', 'html', 'jsx'],
  'jsx': ['javascript', 'html'],
  'state management': ['variables', 'data structures'],
  'redux': ['state management', 'react components', 'functional programming'],
  'typescript': ['javascript', 'type systems'],
  'type systems': ['variables', 'data structures'],
  'async/await': ['promises', 'javascript functions'],
  'promises': ['callbacks', 'javascript functions'],
  'callbacks': ['javascript functions'],
  'javascript functions': ['javascript', 'variables'],
  'rest api': ['http', 'json', 'client-server architecture'],
  'graphql': ['rest api', 'type systems', 'query languages'],
  'microservices': ['rest api', 'docker', 'distributed systems'],
  'docker': ['linux', 'networking', 'configuration'],
  'kubernetes': ['docker', 'networking', 'distributed systems'],
  'distributed systems': ['networking', 'data structures', 'algorithms'],
  'machine learning': ['statistics', 'linear algebra', 'python'],
  'deep learning': ['machine learning', 'neural networks', 'calculus'],
  'neural networks': ['machine learning', 'linear algebra'],
  'css grid': ['css', 'layout'],
  'css flexbox': ['css', 'layout'],
  'css': ['html'],
  'html': [],
  'javascript': ['programming basics'],
  'python': ['programming basics'],
  'programming basics': ['variables', 'control flow', 'data structures'],
  'variables': [],
  'control flow': ['variables'],
  'data structures': ['variables', 'control flow'],
  'algorithms': ['data structures', 'control flow'],
  'functional programming': ['javascript functions', 'data structures'],
  'object-oriented programming': ['data structures', 'javascript functions'],
  'design patterns': ['object-oriented programming', 'algorithms'],
  'testing': ['programming basics'],
  'unit testing': ['testing', 'javascript functions'],
  'integration testing': ['unit testing', 'rest api'],
  'ci/cd': ['testing', 'docker', 'version control'],
  'version control': ['programming basics'],
  'sql': ['data structures', 'query languages'],
  'query languages': ['data structures'],
  'nosql': ['data structures', 'json'],
  'json': ['data structures'],
  'http': ['networking'],
  'networking': [],
  'linux': [],
  'statistics': ['mathematics'],
  'linear algebra': ['mathematics'],
  'calculus': ['mathematics'],
  'mathematics': [],
  'layout': ['html'],
  'configuration': [],
  'client-server architecture': ['networking'],
};

/** Built-in concept difficulty ratings (0–1). */
const CONCEPT_DIFFICULTY: Record<string, number> = {
  'variables': 0.05,
  'control flow': 0.1,
  'html': 0.1,
  'css': 0.15,
  'layout': 0.15,
  'configuration': 0.1,
  'networking': 0.15,
  'linux': 0.2,
  'json': 0.1,
  'mathematics': 0.2,
  'programming basics': 0.15,
  'data structures': 0.25,
  'javascript': 0.2,
  'python': 0.2,
  'javascript functions': 0.25,
  'callbacks': 0.35,
  'version control': 0.2,
  'testing': 0.25,
  'http': 0.25,
  'query languages': 0.25,
  'sql': 0.3,
  'nosql': 0.35,
  'type systems': 0.3,
  'css flexbox': 0.3,
  'css grid': 0.35,
  'jsx': 0.3,
  'promises': 0.4,
  'statistics': 0.4,
  'linear algebra': 0.45,
  'calculus': 0.5,
  'react components': 0.35,
  'state management': 0.4,
  'typescript': 0.4,
  'async/await': 0.45,
  'functional programming': 0.45,
  'object-oriented programming': 0.4,
  'algorithms': 0.45,
  'rest api': 0.4,
  'client-server architecture': 0.35,
  'unit testing': 0.35,
  'react hooks': 0.5,
  'redux': 0.55,
  'docker': 0.5,
  'design patterns': 0.55,
  'integration testing': 0.45,
  'graphql': 0.55,
  'machine learning': 0.6,
  'neural networks': 0.65,
  'ci/cd': 0.55,
  'microservices': 0.65,
  'distributed systems': 0.7,
  'deep learning': 0.75,
  'kubernetes': 0.7,
};

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §5  ADAPTIVE LEARNER CLASS — Main intelligence module                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * AdaptiveLearner — Phase 8 intelligence module for LocalBrain.
 *
 * Provides six core capabilities:
 * 1. **Fact Extraction** — Parse natural language into structured {subject, relation, object} facts.
 * 2. **Concept Generalization** — Abstract general rules from multiple specific examples.
 * 3. **Transfer Learning** — Apply knowledge from one domain to another via analogy.
 * 4. **Mistake Learning** — Learn from corrections to avoid repeating errors.
 * 5. **Confidence Calibration** — Track accuracy and adjust future confidence levels.
 * 6. **Curriculum Learning** — Order concepts by difficulty and prerequisite chains.
 *
 * All methods are deterministic and require no external dependencies.
 */
export class AdaptiveLearner {
  private config: AdaptiveLearnerConfig;
  private stats: AdaptiveLearnerStats;
  private facts: ExtractedFact[];
  private rules: GeneralizedRule[];
  private mistakes: MistakeLesson[];
  private predictions: PredictionRecord[];
  private conceptGraph: Map<string, string[]>;
  private masteredConcepts: Set<string>;
  private domainMappings: Map<string, Map<string, string>>;
  private mistakeFrequency: Map<string, number>;
  private calibrationAdjustments: Map<string, number>;

  /** Create a new AdaptiveLearner with optional partial configuration. */
  constructor(config?: Partial<AdaptiveLearnerConfig>) {
    this.config = {
      maxFacts: config?.maxFacts ?? 500,
      maxRules: config?.maxRules ?? 200,
      maxMistakes: config?.maxMistakes ?? 300,
      enableFactExtraction: config?.enableFactExtraction ?? true,
      enableGeneralization: config?.enableGeneralization ?? true,
      enableTransferLearning: config?.enableTransferLearning ?? true,
      enableMistakeLearning: config?.enableMistakeLearning ?? true,
      generalizationMinExamples: config?.generalizationMinExamples ?? 3,
      transferConfidenceDiscount: config?.transferConfidenceDiscount ?? 0.3,
    };

    const now = new Date().toISOString();
    this.stats = {
      totalFactsExtracted: 0,
      totalRulesGeneralized: 0,
      totalTransfers: 0,
      totalMistakesRecorded: 0,
      totalCalibrations: 0,
      totalFeedbacks: 0,
      factsStored: 0,
      rulesStored: 0,
      mistakesStored: 0,
      conceptsTracked: 0,
      averageConfidence: 0,
      createdAt: now,
      lastUsedAt: now,
    };

    this.facts = [];
    this.rules = [];
    this.mistakes = [];
    this.predictions = [];
    this.conceptGraph = new Map();
    this.masteredConcepts = new Set();
    this.domainMappings = new Map();
    this.mistakeFrequency = new Map();
    this.calibrationAdjustments = new Map();

    // Initialize concept graph from built-in prerequisites
    for (const [concept, prereqs] of Object.entries(CONCEPT_PREREQUISITES)) {
      this.conceptGraph.set(concept, [...prereqs]);
    }
    this.stats.conceptsTracked = this.conceptGraph.size;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  §5.1  FACT EXTRACTION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Extract structured facts from a natural language text.
   *
   * Parses the input text sentence by sentence and applies pattern templates
   * to identify subject-relation-object triples. Handles negations and
   * deduplicates identical facts.
   *
   * @param text - The natural language text to extract facts from.
   * @returns An array of extracted facts with confidence scores.
   *
   * @example
   * ```typescript
   * const facts = learner.extractFacts("React uses JSX. Vue does not use JSX.");
   * // [
   * //   { subject: "React", relation: "uses", object: "JSX", confidence: 0.9, negated: false, ... },
   * //   { subject: "Vue", relation: "uses", object: "JSX", confidence: 0.88, negated: true, ... },
   * // ]
   * ```
   */
  extractFacts(text: string): ExtractedFact[] {
    if (!this.config.enableFactExtraction) return [];
    this.stats.lastUsedAt = new Date().toISOString();

    const sentences = this.splitSentences(text);
    const extractedFacts: ExtractedFact[] = [];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length < 3) continue;

      // Try negation patterns first (more specific)
      let matched = false;
      for (const pattern of NEGATION_PATTERNS) {
        const match = trimmed.match(pattern.regex);
        if (match && match[1] && match[2]) {
          const fact: ExtractedFact = {
            subject: match[1].trim(),
            relation: pattern.relation,
            object: match[2].trim(),
            confidence: this.adjustConfidenceForLength(pattern.baseConfidence, match[1].trim(), match[2].trim()),
            source: trimmed,
            negated: true,
          };
          if (!this.isDuplicateFact(fact, extractedFacts)) {
            extractedFacts.push(fact);
          }
          matched = true;
          break;
        }
      }

      if (matched) continue;

      // Try positive patterns
      for (const pattern of FACT_PATTERNS) {
        const match = trimmed.match(pattern.regex);
        if (match && match[1] && match[2]) {
          const fact: ExtractedFact = {
            subject: match[1].trim(),
            relation: pattern.relation,
            object: match[2].trim(),
            confidence: this.adjustConfidenceForLength(pattern.baseConfidence, match[1].trim(), match[2].trim()),
            source: trimmed,
            negated: false,
          };
          if (!this.isDuplicateFact(fact, extractedFacts)) {
            extractedFacts.push(fact);
          }
          break;
        }
      }
    }

    // Store extracted facts (up to maxFacts)
    for (const fact of extractedFacts) {
      if (this.facts.length >= this.config.maxFacts) {
        // Evict the lowest-confidence fact
        let minIdx = 0;
        for (let i = 1; i < this.facts.length; i++) {
          if (this.facts[i]!.confidence < this.facts[minIdx]!.confidence) {
            minIdx = i;
          }
        }
        if (fact.confidence > this.facts[minIdx]!.confidence) {
          this.facts[minIdx] = fact;
        }
      } else {
        this.facts.push(fact);
      }
    }

    this.stats.totalFactsExtracted += extractedFacts.length;
    this.stats.factsStored = this.facts.length;
    return extractedFacts;
  }

  /**
   * Split text into individual sentences for fact extraction.
   * Handles periods, exclamation marks, question marks, and semicolons.
   */
  private splitSentences(text: string): string[] {
    return text
      .split(/[.!?;]\s*/g)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Adjust confidence based on the length/quality of subject and object.
   * Very short or very long subjects/objects get a slight confidence penalty.
   */
  private adjustConfidenceForLength(base: number, subject: string, object: string): number {
    let adjustment = 0;
    // Penalize very short subjects/objects (likely noise)
    if (subject.length < 2 || object.length < 2) adjustment -= 0.15;
    // Penalize very long subjects/objects (likely not a clean fact)
    if (subject.length > 50) adjustment -= 0.1;
    if (object.length > 50) adjustment -= 0.1;
    // Boost for moderate-length, clean-looking terms
    if (subject.length >= 2 && subject.length <= 30 && object.length >= 2 && object.length <= 30) {
      adjustment += 0.05;
    }
    return Math.max(0, Math.min(1, base + adjustment));
  }

  /**
   * Check if a fact is a duplicate of an already-extracted fact.
   * Two facts are duplicates if they share the same subject, relation, object, and negation.
   */
  private isDuplicateFact(fact: ExtractedFact, existing: ExtractedFact[]): boolean {
    const normSubject = fact.subject.toLowerCase();
    const normObject = fact.object.toLowerCase();
    return existing.some(
      e =>
        e.subject.toLowerCase() === normSubject &&
        e.relation === fact.relation &&
        e.object.toLowerCase() === normObject &&
        e.negated === fact.negated,
    );
  }

  /** Get all currently stored facts. */
  getFacts(): readonly ExtractedFact[] {
    return this.facts;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  §5.2  CONCEPT GENERALIZATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generalize rules from a set of specific examples.
   *
   * Examines multiple examples to find common properties and abstracts
   * a general rule. Requires at least `generalizationMinExamples` examples.
   * Counter-examples are tracked to refine the rule's confidence.
   *
   * @param examples - The specific examples to generalize from.
   * @returns An array of generalized rules with confidence scores.
   *
   * @example
   * ```typescript
   * const rules = learner.generalize([
   *   { input: "React", output: "uses JSX", domain: "frontend", tags: ["framework", "ui"] },
   *   { input: "Vue", output: "uses templates", domain: "frontend", tags: ["framework", "ui"] },
   *   { input: "Angular", output: "uses templates", domain: "frontend", tags: ["framework", "ui"] },
   * ]);
   * // [{ pattern: "frontend framework uses template systems", confidence: 0.7, ... }]
   * ```
   */
  generalize(examples: Example[]): GeneralizedRule[] {
    if (!this.config.enableGeneralization) return [];
    if (examples.length < this.config.generalizationMinExamples) return [];
    this.stats.lastUsedAt = new Date().toISOString();

    const newRules: GeneralizedRule[] = [];

    // Group examples by domain
    const byDomain = this.groupByDomain(examples);

    for (const [domain, domainExamples] of Object.entries(byDomain)) {
      if (domainExamples.length < this.config.generalizationMinExamples) continue;

      // Find common tags across examples
      const commonTags = this.findCommonTags(domainExamples);

      // Find common output patterns
      const outputPatterns = this.findCommonOutputPatterns(domainExamples);

      for (const outputPattern of outputPatterns) {
        // Count how many examples match this pattern
        const matchingExamples = domainExamples.filter(
          ex => ex.output.toLowerCase().includes(outputPattern.toLowerCase()),
        );
        const nonMatchingExamples = domainExamples.filter(
          ex => !ex.output.toLowerCase().includes(outputPattern.toLowerCase()),
        );

        const coverage = matchingExamples.length / domainExamples.length;
        const consistency = matchingExamples.length / (matchingExamples.length + nonMatchingExamples.length);

        // Build the generalized pattern description
        const tagDescription = commonTags.length > 0 ? commonTags.join(' ') + ' ' : '';
        const pattern = `${domain} ${tagDescription}${outputPattern}`;

        // Calculate confidence from coverage, consistency, and number of examples
        const exampleBonus = Math.min(0.2, (matchingExamples.length - this.config.generalizationMinExamples) * 0.05);
        const confidence = Math.min(1, (coverage * 0.4 + consistency * 0.4 + 0.2) + exampleBonus);

        const rule: GeneralizedRule = {
          pattern,
          examples: matchingExamples.map(ex => `${ex.input}: ${ex.output}`),
          counterExamples: nonMatchingExamples.map(ex => `${ex.input}: ${ex.output}`),
          confidence,
          domain,
          createdAt: Date.now(),
        };

        // Only add rules with reasonable confidence
        if (confidence >= 0.3) {
          newRules.push(rule);
        }
      }
    }

    // Store rules (up to maxRules)
    for (const rule of newRules) {
      if (this.rules.length >= this.config.maxRules) {
        // Evict the lowest-confidence rule
        let minIdx = 0;
        for (let i = 1; i < this.rules.length; i++) {
          if (this.rules[i]!.confidence < this.rules[minIdx]!.confidence) {
            minIdx = i;
          }
        }
        if (rule.confidence > this.rules[minIdx]!.confidence) {
          this.rules[minIdx] = rule;
        }
      } else {
        this.rules.push(rule);
      }
    }

    this.stats.totalRulesGeneralized += newRules.length;
    this.stats.rulesStored = this.rules.length;
    return newRules;
  }

  /** Group examples by their domain property. */
  private groupByDomain(examples: Example[]): Record<string, Example[]> {
    const groups: Record<string, Example[]> = {};
    for (const ex of examples) {
      const domain = ex.domain.toLowerCase();
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(ex);
    }
    return groups;
  }

  /** Find tags that appear in at least half of the examples. */
  private findCommonTags(examples: Example[]): string[] {
    const tagCounts = new Map<string, number>();
    for (const ex of examples) {
      for (const tag of ex.tags) {
        const lower = tag.toLowerCase();
        tagCounts.set(lower, (tagCounts.get(lower) ?? 0) + 1);
      }
    }
    const threshold = examples.length / 2;
    const common: string[] = [];
    for (const [tag, count] of tagCounts) {
      if (count >= threshold) {
        common.push(tag);
      }
    }
    return common.sort();
  }

  /**
   * Find common words/phrases in the output fields of examples.
   * Extracts words that appear in at least half of the outputs.
   */
  private findCommonOutputPatterns(examples: Example[]): string[] {
    const wordCounts = new Map<string, number>();
    for (const ex of examples) {
      const words = ex.output.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const uniqueWords = new Set(words);
      for (const word of uniqueWords) {
        wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
      }
    }

    const threshold = examples.length / 2;
    const commonWords: string[] = [];
    for (const [word, count] of wordCounts) {
      if (count >= threshold) {
        commonWords.push(word);
      }
    }

    // Build phrase from common words (sorted by frequency descending)
    commonWords.sort((a, b) => (wordCounts.get(b) ?? 0) - (wordCounts.get(a) ?? 0));

    if (commonWords.length === 0) return [];
    // Return the top common words as potential patterns
    return [commonWords.slice(0, 4).join(' ')];
  }

  /** Get all currently stored generalized rules. */
  getRules(): readonly GeneralizedRule[] {
    return this.rules;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  §5.3  TRANSFER LEARNING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Transfer knowledge from one domain to another by analogy.
   *
   * Looks up domain similarity, finds concept mappings, and generates
   * a transferred knowledge statement. Applies a confidence discount for
   * cross-domain transfers.
   *
   * @param sourceDomain - The domain the knowledge originates from.
   * @param targetDomain - The domain to apply the knowledge to.
   * @param concept - The concept to transfer.
   * @returns A TransferResult with the transferred knowledge and mappings.
   *
   * @example
   * ```typescript
   * const result = learner.transferKnowledge("backend", "frontend", "middleware");
   * // {
   * //   concept: "middleware",
   * //   transferredKnowledge: "In frontend, the analogous concept to middleware is higher-order component",
   * //   confidence: 0.42,
   * //   mappings: [{ sourceElement: "middleware", targetElement: "higher-order component", similarity: 0.6 }]
   * // }
   * ```
   */
  transferKnowledge(sourceDomain: string, targetDomain: string, concept: string): TransferResult {
    this.stats.lastUsedAt = new Date().toISOString();
    this.stats.totalTransfers++;

    const srcLower = sourceDomain.toLowerCase();
    const tgtLower = targetDomain.toLowerCase();
    const conceptLower = concept.toLowerCase();

    // Calculate domain similarity
    const domainSim = this.getDomainSimilarity(srcLower, tgtLower);

    // Find concept mappings
    const mappings = this.findConceptMappings(srcLower, tgtLower, conceptLower);

    // Find the best mapping for this specific concept
    let transferredKnowledge: string;
    let bestMapping: DomainMapping | undefined;

    for (const m of mappings) {
      if (m.sourceElement.toLowerCase() === conceptLower) {
        bestMapping = m;
        break;
      }
    }

    if (bestMapping) {
      transferredKnowledge =
        `In ${targetDomain}, the analogous concept to ${concept} is ${bestMapping.targetElement}`;
    } else if (mappings.length > 0) {
      // Use partial mappings to suggest a transfer
      const closestMapping = mappings[0]!;
      transferredKnowledge =
        `In ${targetDomain}, ${concept} from ${sourceDomain} may relate to concepts similar to ${closestMapping.targetElement}`;
    } else {
      transferredKnowledge =
        `The concept ${concept} from ${sourceDomain} may apply to ${targetDomain} with adaptations for domain-specific differences`;
    }

    // Also check if any stored rules from the source domain could transfer
    const sourceRules = this.rules.filter(r => r.domain.toLowerCase() === srcLower);
    for (const rule of sourceRules) {
      if (rule.pattern.toLowerCase().includes(conceptLower)) {
        transferredKnowledge += `. Related rule: ${rule.pattern}`;
        break;
      }
    }

    // Apply confidence discount for cross-domain transfer
    const baseConfidence = bestMapping ? bestMapping.similarity : domainSim * 0.5;
    const confidence = Math.max(
      0,
      Math.min(1, baseConfidence * (1 - this.config.transferConfidenceDiscount)),
    );

    return {
      concept,
      sourceDomain,
      targetDomain,
      transferredKnowledge,
      confidence,
      mappings,
    };
  }

  /** Get the similarity score between two domains (0–1). */
  private getDomainSimilarity(source: string, target: string): number {
    if (source === target) return 1.0;
    const sourceMap = DOMAIN_SIMILARITY[source];
    if (sourceMap && sourceMap[target] !== undefined) return sourceMap[target];
    // Check reverse direction
    const targetMap = DOMAIN_SIMILARITY[target];
    if (targetMap && targetMap[source] !== undefined) return targetMap[source];
    // Unknown domains get a low default similarity
    return 0.2;
  }

  /**
   * Find concept mappings between two domains.
   * Combines built-in mappings with any learned domain mappings.
   */
  private findConceptMappings(source: string, target: string, concept: string): DomainMapping[] {
    const mappings: DomainMapping[] = [];
    const domainSim = this.getDomainSimilarity(source, target);

    // Check built-in concept mappings
    const builtInSource = DOMAIN_CONCEPT_MAPPINGS[source];
    if (builtInSource) {
      const builtInTarget = builtInSource[target];
      if (builtInTarget) {
        for (const [src, tgt] of Object.entries(builtInTarget)) {
          const similarity = src.toLowerCase() === concept ? domainSim + 0.2 : domainSim * 0.5;
          mappings.push({
            sourceElement: src,
            targetElement: tgt,
            similarity: Math.min(1, similarity),
          });
        }
      }
    }

    // Check stored domain mappings
    const key = `${source}→${target}`;
    const learned = this.domainMappings.get(key);
    if (learned) {
      for (const [src, tgt] of learned) {
        if (!mappings.some(m => m.sourceElement === src && m.targetElement === tgt)) {
          mappings.push({
            sourceElement: src,
            targetElement: tgt,
            similarity: domainSim * 0.7,
          });
        }
      }
    }

    // Sort by similarity descending
    mappings.sort((a, b) => b.similarity - a.similarity);
    return mappings;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  §5.4  MISTAKE LEARNING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Learn from a mistake by analyzing why a prediction was wrong.
   *
   * Categorizes the mistake, generates a correction rule, and tracks
   * mistake frequency by category.
   *
   * @param prediction - The incorrect prediction that was made.
   * @param actual - The correct answer.
   * @param context - The context in which the mistake was made.
   * @returns A MistakeLesson with the analysis and correction rule.
   *
   * @example
   * ```typescript
   * const lesson = learner.learnFromMistake(
   *   "React uses two-way binding",
   *   "React uses one-way data flow",
   *   "discussing React data patterns"
   * );
   * // {
   * //   category: "factual_error",
   * //   reason: "Confused React's one-way data flow with two-way binding",
   * //   correctionRule: "When discussing React, use 'one-way data flow' not 'two-way binding'",
   * //   ...
   * // }
   * ```
   */
  learnFromMistake(prediction: string, actual: string, context: string): MistakeLesson {
    this.stats.lastUsedAt = new Date().toISOString();
    this.stats.totalMistakesRecorded++;

    // Categorize the mistake
    const category = this.categorizeMistake(prediction, actual, context);

    // Generate the reason for the mistake
    const reason = this.generateMistakeReason(prediction, actual, category);

    // Generate a correction rule
    const correctionRule = this.generateCorrectionRule(prediction, actual, category, context);

    const lesson: MistakeLesson = {
      prediction,
      actual,
      category,
      reason,
      correctionRule,
      context,
    };

    // Track mistake frequency
    const currentFreq = this.mistakeFrequency.get(category) ?? 0;
    this.mistakeFrequency.set(category, currentFreq + 1);

    // Store the lesson (up to maxMistakes)
    if (this.mistakes.length >= this.config.maxMistakes) {
      // Evict oldest mistake
      this.mistakes.shift();
    }
    this.mistakes.push(lesson);

    this.stats.mistakesStored = this.mistakes.length;
    return lesson;
  }

  /**
   * Categorize a mistake based on the difference between prediction and actual.
   * Uses heuristics to determine the most likely category.
   */
  private categorizeMistake(prediction: string, actual: string, context: string): MistakeCategory {
    const predLower = prediction.toLowerCase();
    const actLower = actual.toLowerCase();
    const ctxLower = context.toLowerCase();

    // Check for outdated info indicators
    const outdatedKeywords = ['deprecated', 'old', 'legacy', 'outdated', 'was', 'previously', 'used to', 'no longer'];
    if (outdatedKeywords.some(kw => actLower.includes(kw) || ctxLower.includes(kw))) {
      return 'outdated_info';
    }

    // Check for context mismatch
    const predWords = new Set(predLower.split(/\s+/));
    const actWords = new Set(actLower.split(/\s+/));
    const commonWords = [...predWords].filter(w => actWords.has(w));
    const overlapRatio = commonWords.length / Math.max(predWords.size, actWords.size);

    // High overlap but wrong answer often means wrong context
    if (overlapRatio > 0.5 && overlapRatio < 0.9) {
      return 'wrong_context';
    }

    // Check for overgeneralization (prediction is more general than actual)
    const generalTerms = ['all', 'every', 'always', 'any', 'never', 'none'];
    const specificTerms = ['some', 'certain', 'specific', 'particular', 'only', 'except'];
    if (generalTerms.some(t => predLower.includes(t)) && specificTerms.some(t => actLower.includes(t))) {
      return 'overgeneralization';
    }

    // Check for undergeneralization (prediction is too specific)
    if (specificTerms.some(t => predLower.includes(t)) && generalTerms.some(t => actLower.includes(t))) {
      return 'undergeneralization';
    }

    // Check for missing knowledge (prediction is very different)
    if (overlapRatio < 0.2) {
      return 'missing_knowledge';
    }

    // Default: factual error
    return 'factual_error';
  }

  /** Generate a human-readable reason explaining why a mistake occurred. */
  private generateMistakeReason(prediction: string, actual: string, category: MistakeCategory): string {
    switch (category) {
      case 'factual_error':
        return `Incorrect fact: stated "${prediction}" when the correct answer is "${actual}"`;
      case 'outdated_info':
        return `Used outdated information: "${prediction}" is no longer accurate; current answer is "${actual}"`;
      case 'wrong_context':
        return `Applied knowledge from wrong context: "${prediction}" may be correct elsewhere but "${actual}" is correct here`;
      case 'overgeneralization':
        return `Overgeneralized: "${prediction}" is too broad; the specific answer is "${actual}"`;
      case 'undergeneralization':
        return `Undergeneralized: "${prediction}" is too narrow; the broader answer is "${actual}"`;
      case 'missing_knowledge':
        return `Missing knowledge: could not connect "${prediction}" to the correct answer "${actual}"`;
    }
  }

  /** Generate a correction rule to prevent repeating a specific mistake. */
  private generateCorrectionRule(
    prediction: string,
    actual: string,
    category: MistakeCategory,
    context: string,
  ): string {
    switch (category) {
      case 'factual_error':
        return `When discussing ${context}, use "${actual}" instead of "${prediction}"`;
      case 'outdated_info':
        return `Update: "${prediction}" is outdated. The current correct answer is "${actual}"`;
      case 'wrong_context':
        return `In the context of ${context}, the correct answer is "${actual}", not "${prediction}"`;
      case 'overgeneralization':
        return `Avoid generalizing: in ${context}, be specific — "${actual}" rather than "${prediction}"`;
      case 'undergeneralization':
        return `Broaden scope: in ${context}, the answer should be "${actual}" not just "${prediction}"`;
      case 'missing_knowledge':
        return `Learn: in ${context}, the answer is "${actual}" (previously unknown)`;
    }
  }

  /** Get the frequency of mistakes by category. */
  getMistakeFrequency(): ReadonlyMap<string, number> {
    return this.mistakeFrequency;
  }

  /** Get all stored mistake lessons. */
  getMistakes(): readonly MistakeLesson[] {
    return this.mistakes;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  §5.5  CONFIDENCE CALIBRATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Calibrate confidence levels by analyzing prediction history.
   *
   * Computes the Brier score, detects overconfidence/underconfidence, and
   * generates per-domain calibration adjustment factors.
   *
   * @param predictions - Array of prediction records with actual outcomes.
   * @returns A CalibrationReport with accuracy metrics and adjustment factors.
   *
   * @example
   * ```typescript
   * const report = learner.calibrate([
   *   { predicted: "yes", actual: "yes", confidence: 0.9, domain: "frontend", timestamp: Date.now() },
   *   { predicted: "no", actual: "yes", confidence: 0.8, domain: "frontend", timestamp: Date.now() },
   * ]);
   * // { brierScore: 0.41, overconfidence: 0.35, ... }
   * ```
   */
  calibrate(predictions: PredictionRecord[]): CalibrationReport {
    this.stats.lastUsedAt = new Date().toISOString();
    this.stats.totalCalibrations++;

    // Store predictions for tracking
    for (const pred of predictions) {
      this.predictions.push(pred);
    }

    const allPredictions = this.predictions;
    if (allPredictions.length === 0) {
      return {
        brierScore: 0,
        overconfidence: 0,
        underconfidence: 0,
        totalPredictions: 0,
        accuracyByConfidenceBin: new Map(),
        domainCalibration: new Map(),
      };
    }

    // Calculate Brier score: mean of (confidence - outcome)^2
    let brierSum = 0;
    let overconfidenceSum = 0;
    let underconfidenceSum = 0;
    let overconfidenceCount = 0;
    let underconfidenceCount = 0;

    // Bins for calibration: [0, 0.1), [0.1, 0.2), ..., [0.9, 1.0]
    const binCorrect = new Map<string, number>();
    const binTotal = new Map<string, number>();
    const binLabels = [
      '0.0-0.1', '0.1-0.2', '0.2-0.3', '0.3-0.4', '0.4-0.5',
      '0.5-0.6', '0.6-0.7', '0.7-0.8', '0.8-0.9', '0.9-1.0',
    ];
    for (const label of binLabels) {
      binCorrect.set(label, 0);
      binTotal.set(label, 0);
    }

    // Per-domain tracking
    const domainCorrect = new Map<string, number>();
    const domainTotal = new Map<string, number>();
    const domainConfidenceSum = new Map<string, number>();

    for (const pred of allPredictions) {
      const isCorrect = pred.predicted.toLowerCase().trim() === pred.actual.toLowerCase().trim();
      const outcome = isCorrect ? 1 : 0;
      const confidence = Math.max(0, Math.min(1, pred.confidence));

      // Brier score component
      brierSum += (confidence - outcome) * (confidence - outcome);

      // Overconfidence/underconfidence tracking
      if (confidence > outcome) {
        overconfidenceSum += confidence - outcome;
        overconfidenceCount++;
      } else if (confidence < outcome) {
        underconfidenceSum += outcome - confidence;
        underconfidenceCount++;
      }

      // Bin tracking
      const binIndex = Math.min(9, Math.floor(confidence * 10));
      const binLabel = binLabels[binIndex]!;
      binTotal.set(binLabel, (binTotal.get(binLabel) ?? 0) + 1);
      if (isCorrect) {
        binCorrect.set(binLabel, (binCorrect.get(binLabel) ?? 0) + 1);
      }

      // Domain tracking
      const domain = pred.domain.toLowerCase();
      domainTotal.set(domain, (domainTotal.get(domain) ?? 0) + 1);
      domainConfidenceSum.set(domain, (domainConfidenceSum.get(domain) ?? 0) + confidence);
      if (isCorrect) {
        domainCorrect.set(domain, (domainCorrect.get(domain) ?? 0) + 1);
      }
    }

    const brierScore = brierSum / allPredictions.length;
    const overconfidence = overconfidenceCount > 0 ? overconfidenceSum / overconfidenceCount : 0;
    const underconfidence = underconfidenceCount > 0 ? underconfidenceSum / underconfidenceCount : 0;

    // Calculate accuracy by confidence bin
    const accuracyByConfidenceBin = new Map<string, number>();
    for (const label of binLabels) {
      const total = binTotal.get(label) ?? 0;
      if (total > 0) {
        accuracyByConfidenceBin.set(label, (binCorrect.get(label) ?? 0) / total);
      }
    }

    // Calculate per-domain calibration adjustments
    const domainCalibration = new Map<string, number>();
    for (const [domain, total] of domainTotal) {
      const correct = domainCorrect.get(domain) ?? 0;
      const avgConf = (domainConfidenceSum.get(domain) ?? 0) / total;
      const actualAccuracy = correct / total;
      // Positive means overconfident (reduce), negative means underconfident (boost)
      const adjustment = avgConf - actualAccuracy;
      domainCalibration.set(domain, adjustment);
      this.calibrationAdjustments.set(domain, adjustment);
    }

    // Update average confidence stat
    let totalConf = 0;
    for (const pred of allPredictions) {
      totalConf += pred.confidence;
    }
    this.stats.averageConfidence = totalConf / allPredictions.length;

    return {
      brierScore,
      overconfidence,
      underconfidence,
      totalPredictions: allPredictions.length,
      accuracyByConfidenceBin,
      domainCalibration,
    };
  }

  /**
   * Get the calibration adjustment factor for a domain.
   * Positive values mean historically overconfident (reduce future confidence).
   * Negative values mean historically underconfident (boost future confidence).
   *
   * @param domain - The domain to get the adjustment for.
   * @returns The adjustment factor, or 0 if no calibration data exists.
   */
  getCalibrationAdjustment(domain: string): number {
    return this.calibrationAdjustments.get(domain.toLowerCase()) ?? 0;
  }

  /**
   * Adjust a raw confidence value using calibration data for a domain.
   *
   * @param rawConfidence - The original confidence value (0–1).
   * @param domain - The domain the confidence applies to.
   * @returns The adjusted confidence value (0–1).
   */
  adjustConfidence(rawConfidence: number, domain: string): number {
    const adjustment = this.getCalibrationAdjustment(domain);
    return Math.max(0, Math.min(1, rawConfidence - adjustment));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  §5.6  CURRICULUM LEARNING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Assess the complexity/difficulty of a concept on a 0–1 scale.
   *
   * Uses built-in difficulty ratings and prerequisite depth to calculate
   * a concept's complexity. Unknown concepts receive an estimated difficulty
   * based on their prerequisite chain length.
   *
   * @param concept - The concept to assess.
   * @returns A difficulty score between 0 (trivial) and 1 (very hard).
   */
  assessComplexity(concept: string): number {
    this.stats.lastUsedAt = new Date().toISOString();
    const lower = concept.toLowerCase();

    // Check built-in difficulty
    if (CONCEPT_DIFFICULTY[lower] !== undefined) {
      return CONCEPT_DIFFICULTY[lower];
    }

    // Estimate difficulty from prerequisite chain depth
    const prereqs = this.getPrerequisites(lower);
    if (prereqs.length === 0) return 0.3; // Unknown concept with no prereqs

    // Deeper prerequisite chains indicate higher difficulty
    const maxDepth = this.getPrerequisiteDepth(lower);
    return Math.min(1, 0.2 + maxDepth * 0.12);
  }

  /**
   * Suggest an optimal learning order for a set of concepts.
   *
   * Orders concepts such that prerequisites always come before the concepts
   * that depend on them. Uses topological sorting of the concept dependency graph.
   *
   * @param concepts - The concepts to order.
   * @returns The concepts sorted in recommended learning order.
   */
  suggestLearningOrder(concepts: string[]): string[] {
    this.stats.lastUsedAt = new Date().toISOString();
    const normalized = concepts.map(c => c.toLowerCase());

    // Collect all concepts including prerequisites
    const allConcepts = new Set<string>();
    for (const concept of normalized) {
      allConcepts.add(concept);
      for (const prereq of this.getPrerequisites(concept)) {
        if (normalized.includes(prereq)) {
          allConcepts.add(prereq);
        }
      }
    }

    // Build adjacency list for topological sort
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();
    for (const concept of allConcepts) {
      inDegree.set(concept, 0);
      adjacency.set(concept, []);
    }

    for (const concept of allConcepts) {
      const prereqs = this.getPrerequisites(concept);
      for (const prereq of prereqs) {
        if (allConcepts.has(prereq)) {
          adjacency.get(prereq)!.push(concept);
          inDegree.set(concept, (inDegree.get(concept) ?? 0) + 1);
        }
      }
    }

    // Kahn's algorithm for topological sort
    const queue: string[] = [];
    for (const [concept, degree] of inDegree) {
      if (degree === 0) {
        queue.push(concept);
      }
    }

    // Sort queue by difficulty (easiest first) for stable ordering
    queue.sort((a, b) => this.assessComplexity(a) - this.assessComplexity(b));

    const result: string[] = [];
    while (queue.length > 0) {
      const concept = queue.shift()!;
      result.push(concept);

      for (const dependent of adjacency.get(concept) ?? []) {
        const newDegree = (inDegree.get(dependent) ?? 1) - 1;
        inDegree.set(dependent, newDegree);
        if (newDegree === 0) {
          // Insert in sorted order by difficulty
          let inserted = false;
          for (let i = 0; i < queue.length; i++) {
            if (this.assessComplexity(dependent) < this.assessComplexity(queue[i]!)) {
              queue.splice(i, 0, dependent);
              inserted = true;
              break;
            }
          }
          if (!inserted) queue.push(dependent);
        }
      }
    }

    // Filter to only the originally requested concepts, preserving the sorted order
    return result.filter(c => normalized.includes(c));
  }

  /**
   * Get the prerequisite concepts for a given concept.
   *
   * Returns direct prerequisites from the concept graph (built-in + learned).
   *
   * @param concept - The concept to find prerequisites for.
   * @returns An array of prerequisite concept names.
   */
  getPrerequisites(concept: string): string[] {
    const lower = concept.toLowerCase();
    return this.conceptGraph.get(lower) ?? CONCEPT_PREREQUISITES[lower] ?? [];
  }

  /**
   * Calculate the maximum depth of the prerequisite chain for a concept.
   * Uses iterative depth-first traversal to avoid stack overflow.
   */
  private getPrerequisiteDepth(concept: string): number {
    const visited = new Set<string>();
    const stack: Array<{ concept: string; depth: number }> = [{ concept, depth: 0 }];
    let maxDepth = 0;

    while (stack.length > 0) {
      const { concept: current, depth } = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      if (depth > maxDepth) maxDepth = depth;

      const prereqs = this.getPrerequisites(current);
      for (const prereq of prereqs) {
        if (!visited.has(prereq)) {
          stack.push({ concept: prereq, depth: depth + 1 });
        }
      }
    }

    return maxDepth;
  }

  /**
   * Mark a concept as mastered.
   *
   * @param concept - The concept that has been mastered.
   */
  markMastered(concept: string): void {
    this.masteredConcepts.add(concept.toLowerCase());
  }

  /**
   * Check whether a concept has been mastered.
   *
   * @param concept - The concept to check.
   * @returns True if the concept is marked as mastered.
   */
  isMastered(concept: string): boolean {
    return this.masteredConcepts.has(concept.toLowerCase());
  }

  /**
   * Get all mastered concepts.
   *
   * @returns A readonly set of mastered concept names.
   */
  getMasteredConcepts(): ReadonlySet<string> {
    return this.masteredConcepts;
  }

  /**
   * Add a new prerequisite relationship to the concept graph.
   *
   * @param concept - The concept that has a prerequisite.
   * @param prerequisite - The prerequisite concept.
   */
  addPrerequisite(concept: string, prerequisite: string): void {
    const lower = concept.toLowerCase();
    const prereqLower = prerequisite.toLowerCase();
    const existing = this.conceptGraph.get(lower) ?? [];
    if (!existing.includes(prereqLower)) {
      existing.push(prereqLower);
      this.conceptGraph.set(lower, existing);
      this.stats.conceptsTracked = this.conceptGraph.size;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  §5.7  FEEDBACK, STATS, SERIALIZE/DESERIALIZE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Provide feedback on the learner's performance.
   *
   * When feedback is positive, reinforces the current state. When negative
   * with a correction, learns from the mistake.
   *
   * @param correct - Whether the last output was correct.
   * @param correction - Optional correction text if the output was wrong.
   */
  feedback(correct: boolean, correction?: string): void {
    this.stats.totalFeedbacks++;
    this.stats.lastUsedAt = new Date().toISOString();

    if (!correct && correction) {
      // If correction is provided, try to learn from the mistake
      if (this.config.enableMistakeLearning) {
        this.learnFromMistake('(last prediction)', correction, 'user feedback');
      }
    }
  }

  /** Get a readonly snapshot of the current statistics. */
  getStats(): Readonly<AdaptiveLearnerStats> {
    return { ...this.stats };
  }

  /** Get the current configuration. */
  getConfig(): Readonly<AdaptiveLearnerConfig> {
    return { ...this.config };
  }

  /**
   * Serialize the entire AdaptiveLearner state to a JSON string.
   *
   * The resulting string can be passed to `AdaptiveLearner.deserialize()`
   * to fully restore the learner's state.
   *
   * @returns A JSON string representation of the learner state.
   */
  serialize(): string {
    const state: AdaptiveLearnerState = {
      config: { ...this.config },
      stats: { ...this.stats },
      facts: [...this.facts],
      rules: [...this.rules],
      mistakes: [...this.mistakes],
      predictions: [...this.predictions],
      conceptGraph: this.mapToRecord(this.conceptGraph),
      masteredConcepts: [...this.masteredConcepts],
      domainMappings: this.nestedMapToRecord(this.domainMappings),
      mistakeFrequency: this.simpleMapToRecord(this.mistakeFrequency),
      calibrationAdjustments: this.simpleMapToRecord(this.calibrationAdjustments),
    };
    return JSON.stringify(state);
  }

  /**
   * Deserialize a JSON string into a fully restored AdaptiveLearner instance.
   *
   * @param json - A JSON string produced by `serialize()`.
   * @returns A new AdaptiveLearner with the restored state.
   */
  static deserialize(json: string): AdaptiveLearner {
    const state = JSON.parse(json) as AdaptiveLearnerState;
    const learner = new AdaptiveLearner(state.config);

    // Restore stats
    learner.stats = { ...state.stats };

    // Restore data arrays
    learner.facts = state.facts ?? [];
    learner.rules = state.rules ?? [];
    learner.mistakes = state.mistakes ?? [];
    learner.predictions = state.predictions ?? [];

    // Restore concept graph
    if (state.conceptGraph) {
      for (const [key, val] of Object.entries(state.conceptGraph)) {
        learner.conceptGraph.set(key, val);
      }
    }

    // Restore mastered concepts
    if (state.masteredConcepts) {
      for (const concept of state.masteredConcepts) {
        learner.masteredConcepts.add(concept);
      }
    }

    // Restore domain mappings
    if (state.domainMappings) {
      for (const [key, val] of Object.entries(state.domainMappings)) {
        const inner = new Map<string, string>();
        for (const [k, v] of Object.entries(val)) {
          inner.set(k, v);
        }
        learner.domainMappings.set(key, inner);
      }
    }

    // Restore mistake frequency
    if (state.mistakeFrequency) {
      for (const [key, val] of Object.entries(state.mistakeFrequency)) {
        learner.mistakeFrequency.set(key, val);
      }
    }

    // Restore calibration adjustments
    if (state.calibrationAdjustments) {
      for (const [key, val] of Object.entries(state.calibrationAdjustments)) {
        learner.calibrationAdjustments.set(key, val);
      }
    }

    return learner;
  }

  /** Convert a Map<string, string[]> to a plain Record for serialization. */
  private mapToRecord(map: Map<string, string[]>): Record<string, string[]> {
    const record: Record<string, string[]> = {};
    for (const [key, val] of map) {
      record[key] = val;
    }
    return record;
  }

  /** Convert a Map<string, Map<string, string>> to nested Record for serialization. */
  private nestedMapToRecord(map: Map<string, Map<string, string>>): Record<string, Record<string, string>> {
    const record: Record<string, Record<string, string>> = {};
    for (const [outerKey, innerMap] of map) {
      const inner: Record<string, string> = {};
      for (const [key, val] of innerMap) {
        inner[key] = val;
      }
      record[outerKey] = inner;
    }
    return record;
  }

  /** Convert a Map<string, number> to a plain Record for serialization. */
  private simpleMapToRecord(map: Map<string, number>): Record<string, number> {
    const record: Record<string, number> = {};
    for (const [key, val] of map) {
      record[key] = val;
    }
    return record;
  }
}
