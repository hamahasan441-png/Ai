/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Argument Analyzer — Argument Mining, Fallacy Detection & Debate Analysis    ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Claim Extraction — Extract claims from natural-language text             ║
 * ║    ✦ Argument Parsing — Identify premises, conclusions, and structure         ║
 * ║    ✦ Fallacy Detection — Detect common logical fallacies                      ║
 * ║    ✦ Strength Evaluation — Score argument quality and evidence                ║
 * ║    ✦ Argument Mapping — Build visual-ready argument graphs                    ║
 * ║    ✦ Counter-Argument Generation — Produce rebuttals for claims               ║
 * ║    ✦ Debate Analysis — Compare positions across multiple speakers             ║
 * ║    ✦ Bias Detection — Surface argumentative biases                            ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface ArgumentAnalyzerConfig {
  maxClaimsPerText: number            // default 20
  minClaimLength: number              // default 4 (words)
  strengthThreshold: number           // default 0.3
  fallacyConfidenceThreshold: number  // default 0.4
  maxCounterArguments: number         // default 5
  evidenceWeightDecay: number         // default 0.9
}

export interface Claim {
  id: string
  text: string
  type: 'factual' | 'value' | 'policy' | 'causal' | 'definitional'
  confidence: number
  source: string
  extractedAt: number
}

export interface Premise {
  id: string
  text: string
  role: 'major' | 'minor' | 'auxiliary'
  isImplicit: boolean
  strength: number
}

export interface Conclusion {
  id: string
  text: string
  isIntermediate: boolean
  supportedBy: string[]   // premise IDs
  confidence: number
}

export interface Argument {
  id: string
  text: string
  premises: Premise[]
  conclusion: Conclusion
  claims: Claim[]
  strength: number
  createdAt: number
}

export type ArgumentRelationType = 'supports' | 'attacks' | 'rebuts' | 'undercuts'

export interface ArgumentRelation {
  id: string
  sourceId: string
  targetId: string
  type: ArgumentRelationType
  strength: number
  description: string
}

export type FallacyType =
  | 'ad_hominem'
  | 'straw_man'
  | 'false_dilemma'
  | 'appeal_to_authority'
  | 'slippery_slope'
  | 'circular_reasoning'
  | 'red_herring'
  | 'hasty_generalization'
  | 'false_cause'
  | 'appeal_to_emotion'
  | 'bandwagon'
  | 'equivocation'
  | 'tu_quoque'
  | 'appeal_to_ignorance'
  | 'loaded_question'

export interface LogicalFallacy {
  type: FallacyType
  name: string
  description: string
  matchedText: string
  confidence: number
  severity: 'low' | 'medium' | 'high'
}

export interface ArgumentStrength {
  overall: number             // 0-1
  logicalValidity: number     // how valid the reasoning chain is
  evidenceQuality: number     // quality of supporting evidence
  relevance: number           // how relevant premises are to conclusion
  sufficiency: number         // whether premises are sufficient
  coherence: number           // internal consistency
  breakdown: Record<string, number>
}

export interface ArgumentMap {
  id: string
  arguments: Argument[]
  relations: ArgumentRelation[]
  rootArguments: string[]     // IDs of top-level arguments
  depth: number
  createdAt: number
}

export interface DebatePosition {
  id: string
  speaker: string
  arguments: Argument[]
  stance: 'for' | 'against' | 'neutral'
  overallStrength: number
  biases: string[]
}

export interface CounterArgument {
  id: string
  targetArgumentId: string
  type: 'rebuttal' | 'undercutter' | 'counterexample' | 'alternative'
  claim: string
  reasoning: string
  strength: number
}

export interface ArgumentAnalyzerStats {
  totalArguments: number
  totalClaims: number
  totalFallaciesDetected: number
  totalRelations: number
  averageStrength: number
  fallacyDistribution: Record<string, number>
  debateCount: number
}

// ── Constants ────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: ArgumentAnalyzerConfig = {
  maxClaimsPerText: 20,
  minClaimLength: 4,
  strengthThreshold: 0.3,
  fallacyConfidenceThreshold: 0.4,
  maxCounterArguments: 5,
  evidenceWeightDecay: 0.9,
};

const CLAIM_INDICATORS = [
  'therefore', 'thus', 'hence', 'consequently', 'so',
  'because', 'since', 'as a result', 'it follows that',
  'this means', 'this shows', 'this proves', 'clearly',
  'obviously', 'evidently', 'undoubtedly', 'certainly',
  'in conclusion', 'we can conclude', 'must be', 'should be',
  'i believe', 'i think', 'i argue', 'it is clear',
  'the evidence shows', 'studies show', 'research indicates',
  'according to', 'experts say', 'data suggests',
];

const PREMISE_INDICATORS = [
  'because', 'since', 'given that', 'as', 'for',
  'whereas', 'considering', 'assuming', 'due to',
  'the reason is', 'first', 'second', 'moreover',
  'furthermore', 'in addition', 'additionally',
  'the evidence suggests', 'studies indicate', 'data shows',
  'it has been shown', 'research demonstrates',
];

const CONCLUSION_INDICATORS = [
  'therefore', 'thus', 'hence', 'consequently',
  'so', 'it follows', 'we can conclude', 'in conclusion',
  'as a result', 'accordingly', 'this means', 'this proves',
  'this shows', 'this demonstrates', 'ultimately',
];

interface FallacyPattern {
  type: FallacyType
  name: string
  description: string
  patterns: RegExp[]
  severity: 'low' | 'medium' | 'high'
}

const FALLACY_PATTERNS: FallacyPattern[] = [
  {
    type: 'ad_hominem',
    name: 'Ad Hominem',
    description: 'Attacking the person making the argument rather than the argument itself',
    patterns: [
      /you('re| are)\s+(stupid|idiot|ignorant|fool|wrong|incompetent|biased)/i,
      /what\s+do\s+you\s+know\s+about/i,
      /you\s+(have\s+no|don'?t\s+have\s+any)\s+(experience|knowledge|right|authority)/i,
      /coming\s+from\s+(someone|a\s+person)\s+who/i,
      /of\s+course\s+(you|they|he|she)\s+would\s+say\s+that/i,
      /consider\s+the\s+source/i,
    ],
    severity: 'high',
  },
  {
    type: 'straw_man',
    name: 'Straw Man',
    description: 'Misrepresenting an argument to make it easier to attack',
    patterns: [
      /so\s+you('re|\s+are)\s+saying\s+(that\s+)?/i,
      /what\s+you('re|\s+are)\s+really\s+saying\s+is/i,
      /in\s+other\s+words,?\s+you\s+(think|believe|want)/i,
      /you\s+(basically|essentially)\s+(want|think|believe|are\s+saying)/i,
      /that('s|\s+is)\s+like\s+saying/i,
    ],
    severity: 'high',
  },
  {
    type: 'false_dilemma',
    name: 'False Dilemma',
    description: 'Presenting only two options when more exist',
    patterns: [
      /either\s+.+\s+or\s+/i,
      /you('re|\s+are)\s+either\s+with\s+us\s+or\s+against/i,
      /there\s+(are|is)\s+(only\s+)?two\s+(options|choices|ways|possibilities)/i,
      /you\s+(can\s+)?either\s+.+\s+or\s+/i,
      /it('s|\s+is)\s+(either|all)\s+or\s+nothing/i,
    ],
    severity: 'medium',
  },
  {
    type: 'appeal_to_authority',
    name: 'Appeal to Authority',
    description: 'Using an authority figure to support a claim outside their expertise',
    patterns: [
      /experts?\s+(say|agree|believe|think|claim)/i,
      /scientists?\s+(say|have\s+proven|agree)/i,
      /according\s+to\s+(a\s+)?(famous|renowned|well-known)/i,
      /\b(doctor|professor|phd)\s+(says?|claims?|believes?)\b/i,
      /everyone\s+knows?\s+(that)?/i,
      /it('s|\s+is)\s+(a\s+)?(well-known|accepted|established)\s+fact/i,
    ],
    severity: 'medium',
  },
  {
    type: 'slippery_slope',
    name: 'Slippery Slope',
    description: 'Claiming one event will inevitably lead to extreme consequences',
    patterns: [
      /if\s+we\s+(allow|let|permit)\s+.+\s+(then|next|soon)\s+/i,
      /this\s+will\s+(inevitably|eventually|ultimately)\s+lead\s+to/i,
      /where\s+(does|will)\s+(it|this)\s+(end|stop)/i,
      /next\s+thing\s+you\s+know/i,
      /before\s+(long|you\s+know\s+it)\s+/i,
      /open(ing)?\s+the\s+(flood\s*gates|door)/i,
    ],
    severity: 'medium',
  },
  {
    type: 'circular_reasoning',
    name: 'Circular Reasoning',
    description: 'Using the conclusion as a premise in the argument',
    patterns: [
      /because\s+(it|that)('s|\s+is)\s+(true|right|correct|the\s+case)/i,
      /it('s|\s+is)\s+true\s+because\s+/i,
      /the\s+reason\s+is\s+because/i,
      /we\s+know\s+(this|it)\s+because\s+.{0,30}\s+(this|it)\s+(is|was)/i,
    ],
    severity: 'high',
  },
  {
    type: 'red_herring',
    name: 'Red Herring',
    description: 'Introducing an irrelevant topic to divert attention',
    patterns: [
      /but\s+what\s+about\s+/i,
      /the\s+real\s+(issue|problem|question)\s+is/i,
      /let('s|\s+us)\s+(not\s+)?forget\s+(that|about)/i,
      /speaking\s+of\s+which/i,
      /that\s+reminds\s+me/i,
      /more\s+import(ant|antly)\s*,?\s/i,
    ],
    severity: 'low',
  },
  {
    type: 'hasty_generalization',
    name: 'Hasty Generalization',
    description: 'Drawing a broad conclusion from insufficient evidence',
    patterns: [
      /\b(all|every|always|never|no\s+one|everyone|nobody)\b/i,
      /\bi\s+(once|know\s+someone\s+who)\b/i,
      /in\s+my\s+experience/i,
      /people\s+(always|never)/i,
      /that('s|\s+is)\s+typical\s+of/i,
    ],
    severity: 'medium',
  },
  {
    type: 'false_cause',
    name: 'False Cause',
    description: 'Assuming causation from correlation or sequence',
    patterns: [
      /ever\s+since\s+.+\s+(has|have)\s+/i,
      /because\s+.+\s+(happened|occurred)\s+(before|first)/i,
      /caused?\s+by\s+the\s+fact\s+that/i,
      /(clearly|obviously)\s+(caused|led\s+to|resulted\s+in)/i,
      /after\s+.+\s+therefore\s+because\s+of/i,
    ],
    severity: 'medium',
  },
  {
    type: 'appeal_to_emotion',
    name: 'Appeal to Emotion',
    description: 'Using emotional manipulation instead of logical reasoning',
    patterns: [
      /think\s+of\s+the\s+(children|victims|families)/i,
      /how\s+(would|could)\s+you\s+(feel|live\s+with\s+yourself)/i,
      /have\s+(you\s+)?no\s+(heart|compassion|shame|decency)/i,
      /don('t|t)\s+you\s+care\s+about/i,
      /it('s|\s+is)\s+(heartbreaking|devastating|tragic|disgusting)/i,
    ],
    severity: 'medium',
  },
  {
    type: 'bandwagon',
    name: 'Bandwagon',
    description: 'Arguing something is true because many people believe it',
    patterns: [
      /everyone\s+(knows|believes|agrees|thinks)/i,
      /most\s+people\s+(think|believe|agree|say)/i,
      /millions\s+of\s+people\s+(can'?t|cannot)\s+be\s+wrong/i,
      /it('s|\s+is)\s+(popular|trending|mainstream)/i,
      /the\s+majority\s+(of\s+people\s+)?(agree|believe|think)/i,
    ],
    severity: 'low',
  },
  {
    type: 'equivocation',
    name: 'Equivocation',
    description: 'Using a word with multiple meanings ambiguously',
    patterns: [
      /in\s+(a|one)\s+sense\s+.+\s+but\s+in\s+another/i,
      /it\s+depends\s+on\s+what\s+you\s+mean\s+by/i,
      /technically\s+(speaking|true)\s+.+\s+but/i,
    ],
    severity: 'low',
  },
  {
    type: 'tu_quoque',
    name: 'Tu Quoque',
    description: 'Deflecting criticism by pointing to the accuser\'s behavior',
    patterns: [
      /you\s+(do|did)\s+(it|the\s+same\s+thing)\s+too/i,
      /look\s+who('s|\s+is)\s+talking/i,
      /you('re|\s+are)\s+(one|not\s+one)\s+to\s+talk/i,
      /pot\s+calling\s+the\s+kettle\s+black/i,
      /what\s+about\s+when\s+you/i,
    ],
    severity: 'medium',
  },
  {
    type: 'appeal_to_ignorance',
    name: 'Appeal to Ignorance',
    description: 'Claiming something is true because it hasn\'t been proven false',
    patterns: [
      /no\s+one\s+has\s+(ever\s+)?(proved?n?|shown|demonstrated)\s+(that\s+)?/i,
      /you\s+can('t|not)\s+prove\s+(that\s+)?/i,
      /there('s|\s+is)\s+no\s+(evidence|proof)\s+(against|that\s+it('s|\s+is)\s+not)/i,
      /until\s+(you|someone)\s+(can\s+)?(prove|show|demonstrate)/i,
    ],
    severity: 'medium',
  },
  {
    type: 'loaded_question',
    name: 'Loaded Question',
    description: 'Asking a question that contains an unjustified assumption',
    patterns: [
      /have\s+you\s+stopped\s+/i,
      /when\s+did\s+you\s+stop\s+/i,
      /why\s+do\s+you\s+(always|still|keep)\s+/i,
      /do\s+you\s+still\s+(beat|abuse|cheat|lie|steal)/i,
    ],
    severity: 'medium',
  },
];

const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'no', 'just', 'him', 'know', 'take',
  'into', 'your', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'only', 'come', 'its', 'over', 'also', 'back', 'after',
  'how', 'our', 'even', 'want', 'because', 'any', 'these', 'give',
  'most', 'us', 'is', 'are', 'was', 'were', 'been', 'has', 'had',
  'did', 'does', 'am', 'being', 'doing', 'should', 'very', 'much',
  'such', 'each', 'every', 'own', 'same', 'too', 'more', 'still',
  'between', 'must', 'through', 'while', 'where', 'before', 'those', 'may',
]);

const BIAS_INDICATORS: Record<string, string[]> = {
  confirmation: [
    'obviously', 'clearly', 'everyone knows', 'of course', 'needless to say',
    'it goes without saying', 'undeniably',
  ],
  selection: [
    'cherry-pick', 'conveniently ignore', 'only looking at', 'hand-picked',
    'selectively', 'just the cases where',
  ],
  anchoring: [
    'first impression', 'initially', 'started at', 'original',
    'at first', 'from the beginning',
  ],
  framing: [
    'spin', 'narrative', 'frame', 'portray', 'characterize',
    'cast as', 'paint as', 'make it seem',
  ],
};

const EVIDENCE_QUALITY_KEYWORDS: Record<string, number> = {
  'peer-reviewed': 0.95,
  'meta-analysis': 0.93,
  'systematic review': 0.92,
  'randomized controlled': 0.90,
  'longitudinal study': 0.85,
  'empirical evidence': 0.85,
  'replicated': 0.88,
  'statistically significant': 0.80,
  'study shows': 0.70,
  'research indicates': 0.70,
  'survey found': 0.60,
  'according to': 0.55,
  'experts say': 0.50,
  'anecdotal': 0.25,
  'i heard': 0.15,
  'someone told me': 0.15,
  'common sense': 0.20,
  'everybody knows': 0.10,
  'trust me': 0.05,
};

// ── Internal Helpers ─────────────────────────────────────────────────────

let idCounter = 0;

function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w));
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function cosineSimilarity(a: string[], b: string[]): number {
  const vocab = new Set([...a, ...b]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const word of vocab) {
    const countA = a.filter(w => w === word).length;
    const countB = b.filter(w => w === word).length;
    dotProduct += countA * countB;
    normA += countA * countA;
    normB += countB * countB;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dotProduct / denom : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function containsIndicator(text: string, indicators: string[]): boolean {
  const lower = text.toLowerCase();
  return indicators.some(ind => lower.includes(ind));
}

function classifyClaimType(text: string): Claim['type'] {
  const lower = text.toLowerCase();
  if (/\b(should|must|ought|need\s+to|has\s+to)\b/.test(lower)) return 'policy';
  if (/\b(cause[sd]?|leads?\s+to|result|because|due\s+to|effect)\b/.test(lower)) return 'causal';
  if (/\b(is\s+defined\s+as|means|refers\s+to|is\s+a\s+type\s+of)\b/.test(lower)) return 'definitional';
  if (/\b(good|bad|better|worse|right|wrong|important|valuable)\b/.test(lower)) return 'value';
  return 'factual';
}

// ── ArgumentAnalyzer ─────────────────────────────────────────────────────

export class ArgumentAnalyzer {
  private arguments: Map<string, Argument> = new Map();
  private claims: Map<string, Claim> = new Map();
  private relations: Map<string, ArgumentRelation> = new Map();
  private fallacyLog: LogicalFallacy[] = [];
  private debates: Map<string, DebatePosition[]> = new Map();
  private config: ArgumentAnalyzerConfig;

  constructor(config: Partial<ArgumentAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Claim Extraction ────────────────────────────────────────────────

  /** Extract claims from natural-language text. */
  extractClaims(text: string): Claim[] {
    const sentences = splitSentences(text);
    const extracted: Claim[] = [];

    for (const sentence of sentences) {
      if (extracted.length >= this.config.maxClaimsPerText) break;

      const words = sentence.split(/\s+/);
      if (words.length < this.config.minClaimLength) continue;

      const hasIndicator = containsIndicator(sentence, CLAIM_INDICATORS);
      const hasAssertion = /\b(is|are|was|were|will|should|must|can|does)\b/i.test(sentence);

      if (!hasIndicator && !hasAssertion) continue;

      const confidence = this.scoreClaim(sentence, hasIndicator);
      if (confidence < this.config.strengthThreshold) continue;

      const claim: Claim = {
        id: generateId('claim'),
        text: sentence.trim(),
        type: classifyClaimType(sentence),
        confidence,
        source: text.substring(0, 80),
        extractedAt: Date.now(),
      };

      this.claims.set(claim.id, claim);
      extracted.push(claim);
    }

    return extracted;
  }

  // ── Argument Parsing ────────────────────────────────────────────────

  /** Parse text into a structured argument with premises and conclusion. */
  parseArgument(text: string): Argument {
    const sentences = splitSentences(text);
    const premises: Premise[] = [];
    let conclusionText = '';
    let conclusionSupportIds: string[] = [];

    for (const sentence of sentences) {
      const isPremise = containsIndicator(sentence, PREMISE_INDICATORS);
      const isConclusion = containsIndicator(sentence, CONCLUSION_INDICATORS);

      if (isConclusion && !conclusionText) {
        conclusionText = sentence;
      } else if (isPremise || (!isConclusion && !conclusionText)) {
        const premise: Premise = {
          id: generateId('prem'),
          text: sentence.trim(),
          role: this.classifyPremiseRole(sentence, premises.length),
          isImplicit: false,
          strength: this.scorePremise(sentence),
        };
        premises.push(premise);
      }
    }

    // If no explicit conclusion found, use the last sentence
    if (!conclusionText && sentences.length > 0) {
      conclusionText = sentences[sentences.length - 1];
    }

    conclusionSupportIds = premises.map(p => p.id);

    const conclusion: Conclusion = {
      id: generateId('conc'),
      text: conclusionText.trim(),
      isIntermediate: false,
      supportedBy: conclusionSupportIds,
      confidence: this.scoreConclusion(conclusionText, premises),
    };

    const claims = this.extractClaims(text);

    const argument: Argument = {
      id: generateId('arg'),
      text,
      premises,
      conclusion,
      claims,
      strength: this.computeArgumentStrength(premises, conclusion),
      createdAt: Date.now(),
    };

    this.arguments.set(argument.id, argument);
    return argument;
  }

  // ── Fallacy Detection ───────────────────────────────────────────────

  /** Detect logical fallacies in the given text. */
  detectFallacies(text: string): LogicalFallacy[] {
    const detected: LogicalFallacy[] = [];

    for (const pattern of FALLACY_PATTERNS) {
      for (const regex of pattern.patterns) {
        const match = regex.exec(text);
        if (match) {
          const confidence = this.computeFallacyConfidence(match[0], text, pattern);
          if (confidence >= this.config.fallacyConfidenceThreshold) {
            const fallacy: LogicalFallacy = {
              type: pattern.type,
              name: pattern.name,
              description: pattern.description,
              matchedText: match[0],
              confidence,
              severity: pattern.severity,
            };
            detected.push(fallacy);
            this.fallacyLog.push(fallacy);
          }
          break;  // one match per fallacy type
        }
      }
    }

    // De-duplicate by type
    const seen = new Set<FallacyType>();
    return detected.filter(f => {
      if (seen.has(f.type)) return false;
      seen.add(f.type);
      return true;
    });
  }

  // ── Argument Strength ───────────────────────────────────────────────

  /** Evaluate the strength of an argument holistically. */
  evaluateStrength(argumentId: string): ArgumentStrength | null {
    const arg = this.arguments.get(argumentId);
    if (!arg) return null;

    const logicalValidity = this.assessLogicalValidity(arg);
    const evidenceQuality = this.assessEvidenceInArgument(arg);
    const relevance = this.assessRelevance(arg);
    const sufficiency = this.assessSufficiency(arg);
    const coherence = this.assessCoherence(arg);

    const overall = clamp(
      logicalValidity * 0.30 +
      evidenceQuality * 0.25 +
      relevance * 0.20 +
      sufficiency * 0.15 +
      coherence * 0.10,
      0, 1,
    );

    return {
      overall,
      logicalValidity,
      evidenceQuality,
      relevance,
      sufficiency,
      coherence,
      breakdown: {
        logicalValidity,
        evidenceQuality,
        relevance,
        sufficiency,
        coherence,
      },
    };
  }

  // ── Argument Mapping ────────────────────────────────────────────────

  /** Build an argument map (graph) from all stored arguments and relations. */
  buildArgumentMap(): ArgumentMap {
    const allArgs = Array.from(this.arguments.values());
    const allRelations = Array.from(this.relations.values());

    // Identify root arguments (not targeted by any relation)
    const targeted = new Set(allRelations.map(r => r.targetId));
    const rootArguments = allArgs
      .filter(a => !targeted.has(a.id))
      .map(a => a.id);

    const depth = this.computeMapDepth(rootArguments, allRelations);

    return {
      id: generateId('map'),
      arguments: allArgs,
      relations: allRelations,
      rootArguments,
      depth,
      createdAt: Date.now(),
    };
  }

  /** Add a relation between two arguments. */
  addRelation(
    sourceId: string,
    targetId: string,
    type: ArgumentRelationType,
    description: string = '',
  ): ArgumentRelation | null {
    if (!this.arguments.has(sourceId) || !this.arguments.has(targetId)) return null;

    const sourceArg = this.arguments.get(sourceId)!;
    const targetArg = this.arguments.get(targetId)!;

    const sourceTokens = tokenize(sourceArg.text);
    const targetTokens = tokenize(targetArg.text);
    const similarity = cosineSimilarity(sourceTokens, targetTokens);

    const strength = clamp(similarity * 0.6 + 0.4, 0, 1);

    const relation: ArgumentRelation = {
      id: generateId('rel'),
      sourceId,
      targetId,
      type,
      strength,
      description: description || `${type} relation between arguments`,
    };

    this.relations.set(relation.id, relation);
    return relation;
  }

  // ── Counter-Argument Generation ─────────────────────────────────────

  /** Generate counter-arguments for a given argument. */
  generateCounterArguments(argumentId: string): CounterArgument[] {
    const arg = this.arguments.get(argumentId);
    if (!arg) return [];

    const counters: CounterArgument[] = [];

    // Generate rebuttal targeting the conclusion
    const rebuttal = this.generateRebuttal(arg);
    if (rebuttal) counters.push(rebuttal);

    // Generate undercutters targeting premise-conclusion links
    for (const premise of arg.premises) {
      if (counters.length >= this.config.maxCounterArguments) break;
      const undercutter = this.generateUndercutter(arg, premise);
      if (undercutter) counters.push(undercutter);
    }

    // Generate counterexample
    const counterexample = this.generateCounterexample(arg);
    if (counterexample && counters.length < this.config.maxCounterArguments) {
      counters.push(counterexample);
    }

    // Generate alternative explanation
    const alternative = this.generateAlternative(arg);
    if (alternative && counters.length < this.config.maxCounterArguments) {
      counters.push(alternative);
    }

    return counters.slice(0, this.config.maxCounterArguments);
  }

  // ── Debate Analysis ─────────────────────────────────────────────────

  /** Analyze a debate by comparing multiple positions. */
  analyzeDebate(
    positions: Array<{ speaker: string; text: string; stance: 'for' | 'against' | 'neutral' }>,
  ): DebatePosition[] {
    const debateId = generateId('debate');
    const debatePositions: DebatePosition[] = [];

    for (const pos of positions) {
      const argument = this.parseArgument(pos.text);
      const fallacies = this.detectFallacies(pos.text);
      const biases = this.detectBias(pos.text);

      const biasNames = biases.map(b => b.type);
      const fallacyPenalty = fallacies.length * 0.05;

      const strengthEval = this.evaluateStrength(argument.id);
      const rawStrength = strengthEval?.overall ?? argument.strength;
      const overallStrength = clamp(rawStrength - fallacyPenalty, 0, 1);

      const debatePos: DebatePosition = {
        id: generateId('pos'),
        speaker: pos.speaker,
        arguments: [argument],
        stance: pos.stance,
        overallStrength,
        biases: biasNames,
      };

      debatePositions.push(debatePos);
    }

    // Add cross-position relations
    for (let i = 0; i < debatePositions.length; i++) {
      for (let j = i + 1; j < debatePositions.length; j++) {
        const posA = debatePositions[i];
        const posB = debatePositions[j];

        if (posA.stance !== posB.stance && posA.stance !== 'neutral' && posB.stance !== 'neutral') {
          const argA = posA.arguments[0];
          const argB = posB.arguments[0];
          if (argA && argB) {
            this.addRelation(argA.id, argB.id, 'attacks', `${posA.speaker} vs ${posB.speaker}`);
          }
        }
      }
    }

    this.debates.set(debateId, debatePositions);
    return debatePositions;
  }

  // ── Evidence Quality ────────────────────────────────────────────────

  /** Assess evidence quality of a text, returning relevance, reliability, sufficiency. */
  assessEvidence(text: string): { relevance: number; reliability: number; sufficiency: number; overall: number } {
    const lower = text.toLowerCase();
    let reliability = 0.3;  // baseline
    let matchCount = 0;

    for (const [keyword, score] of Object.entries(EVIDENCE_QUALITY_KEYWORDS)) {
      if (lower.includes(keyword)) {
        reliability = Math.max(reliability, score);
        matchCount++;
      }
    }

    // Sufficiency: based on quantity and diversity of evidence
    const sentences = splitSentences(text);
    const evidenceSentences = sentences.filter(s =>
      containsIndicator(s, ['study', 'research', 'evidence', 'data', 'found', 'showed', 'demonstrated']),
    );
    const sufficiency = clamp(evidenceSentences.length / Math.max(sentences.length, 1), 0, 1);

    // Relevance: how much of the text is evidence-bearing
    const tokens = tokenize(text);
    const evidenceTokens = tokens.filter(t =>
      EVIDENCE_QUALITY_KEYWORDS[t] !== undefined || ['data', 'evidence', 'proof', 'study', 'research'].includes(t),
    );
    const relevance = clamp(evidenceTokens.length / Math.max(tokens.length, 1) * 5, 0, 1);

    const overall = clamp(reliability * 0.45 + sufficiency * 0.30 + relevance * 0.25, 0, 1);

    return { relevance, reliability, sufficiency, overall };
  }

  // ── Logical Structure Analysis ──────────────────────────────────────

  /** Analyze the logical structure and validity of an argument's reasoning chain. */
  analyzeLogicalStructure(argumentId: string): {
    isValid: boolean
    hasGaps: boolean
    chainLength: number
    weakLinks: string[]
    structureType: 'deductive' | 'inductive' | 'abductive' | 'mixed'
  } | null {
    const arg = this.arguments.get(argumentId);
    if (!arg) return null;

    const weakLinks: string[] = [];
    let chainLength = arg.premises.length;

    // Check for gaps: premises that don't connect to conclusion
    const conclusionTokens = new Set(tokenize(arg.conclusion.text));
    let connectedPremises = 0;

    for (const premise of arg.premises) {
      const premiseTokens = tokenize(premise.text);
      const overlap = premiseTokens.filter(t => conclusionTokens.has(t)).length;
      const overlapRatio = premiseTokens.length > 0 ? overlap / premiseTokens.length : 0;

      if (overlapRatio < 0.05) {
        weakLinks.push(`Premise "${premise.text.substring(0, 50)}..." has weak connection to conclusion`);
      } else {
        connectedPremises++;
      }

      if (premise.strength < 0.4) {
        weakLinks.push(`Premise "${premise.text.substring(0, 50)}..." has low strength (${premise.strength.toFixed(2)})`);
      }
    }

    const hasGaps = connectedPremises < arg.premises.length * 0.5;
    const isValid = !hasGaps && weakLinks.length <= 1 && arg.premises.length > 0;

    // Determine structure type
    const structureType = this.classifyStructureType(arg);

    return {
      isValid,
      hasGaps,
      chainLength,
      weakLinks,
      structureType,
    };
  }

  // ── Argument Comparison ─────────────────────────────────────────────

  /** Compare two arguments and determine which is stronger. */
  compareArguments(argIdA: string, argIdB: string): {
    winner: string | null
    comparison: Record<string, { a: number; b: number }>
    explanation: string
  } | null {
    const strengthA = this.evaluateStrength(argIdA);
    const strengthB = this.evaluateStrength(argIdB);

    if (!strengthA || !strengthB) return null;

    const comparison: Record<string, { a: number; b: number }> = {
      overall: { a: strengthA.overall, b: strengthB.overall },
      logicalValidity: { a: strengthA.logicalValidity, b: strengthB.logicalValidity },
      evidenceQuality: { a: strengthA.evidenceQuality, b: strengthB.evidenceQuality },
      relevance: { a: strengthA.relevance, b: strengthB.relevance },
      sufficiency: { a: strengthA.sufficiency, b: strengthB.sufficiency },
      coherence: { a: strengthA.coherence, b: strengthB.coherence },
    };

    const diff = strengthA.overall - strengthB.overall;
    let winner: string | null = null;
    let explanation: string;

    if (Math.abs(diff) < 0.05) {
      explanation = 'Arguments are roughly equal in strength';
    } else if (diff > 0) {
      winner = argIdA;
      const advantages = this.findAdvantages(strengthA, strengthB);
      explanation = `First argument is stronger (${strengthA.overall.toFixed(2)} vs ${strengthB.overall.toFixed(2)}). Advantages: ${advantages.join(', ')}`;
    } else {
      winner = argIdB;
      const advantages = this.findAdvantages(strengthB, strengthA);
      explanation = `Second argument is stronger (${strengthB.overall.toFixed(2)} vs ${strengthA.overall.toFixed(2)}). Advantages: ${advantages.join(', ')}`;
    }

    return { winner, comparison, explanation };
  }

  // ── Bias Detection ──────────────────────────────────────────────────

  /** Detect argumentation biases in text. */
  detectBias(text: string): Array<{ type: string; indicators: string[]; severity: number }> {
    const lower = text.toLowerCase();
    const detected: Array<{ type: string; indicators: string[]; severity: number }> = [];

    for (const [biasType, keywords] of Object.entries(BIAS_INDICATORS)) {
      const found = keywords.filter(kw => lower.includes(kw));
      if (found.length > 0) {
        const severity = clamp(found.length / keywords.length, 0.1, 1.0);
        detected.push({
          type: biasType,
          indicators: found,
          severity,
        });
      }
    }

    // Check for one-sidedness: all premises supporting same direction
    const sentences = splitSentences(text);
    const positives = sentences.filter(s => /\b(good|great|best|right|correct|true|benefit|advantage)\b/i.test(s)).length;
    const negatives = sentences.filter(s => /\b(bad|worst|wrong|incorrect|false|harm|disadvantage)\b/i.test(s)).length;
    const total = positives + negatives;

    if (total > 2) {
      const ratio = Math.max(positives, negatives) / total;
      if (ratio > 0.8) {
        detected.push({
          type: 'one-sidedness',
          indicators: [`${Math.round(ratio * 100)}% of evaluative statements lean one direction`],
          severity: ratio,
        });
      }
    }

    return detected;
  }

  // ── Retrieval ───────────────────────────────────────────────────────

  /** Retrieve an argument by ID. */
  getArgument(id: string): Argument | null {
    return this.arguments.get(id) ?? null;
  }

  /** Retrieve all stored arguments. */
  getArguments(): Argument[] {
    return Array.from(this.arguments.values());
  }

  /** Retrieve a claim by ID. */
  getClaim(id: string): Claim | null {
    return this.claims.get(id) ?? null;
  }

  /** Retrieve all relations. */
  getRelations(): ArgumentRelation[] {
    return Array.from(this.relations.values());
  }

  /** Retrieve all logged fallacies. */
  getFallacyLog(): LogicalFallacy[] {
    return [...this.fallacyLog];
  }

  // ── Stats & Persistence ─────────────────────────────────────────────

  /** Return aggregate statistics about the analyzer state. */
  getStats(): ArgumentAnalyzerStats {
    const allArgs = Array.from(this.arguments.values());
    const avgStrength = allArgs.length > 0
      ? allArgs.reduce((sum, a) => sum + a.strength, 0) / allArgs.length
      : 0;

    const fallacyDistribution: Record<string, number> = {};
    for (const fallacy of this.fallacyLog) {
      fallacyDistribution[fallacy.type] = (fallacyDistribution[fallacy.type] ?? 0) + 1;
    }

    return {
      totalArguments: this.arguments.size,
      totalClaims: this.claims.size,
      totalFallaciesDetected: this.fallacyLog.length,
      totalRelations: this.relations.size,
      averageStrength: avgStrength,
      fallacyDistribution,
      debateCount: this.debates.size,
    };
  }

  /** Serialize the entire analyzer state to a JSON string. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      arguments: Array.from(this.arguments.values()),
      claims: Array.from(this.claims.values()),
      relations: Array.from(this.relations.values()),
      fallacyLog: this.fallacyLog,
      debates: Array.from(this.debates.entries()).map(([id, positions]) => ({ id, positions })),
    });
  }

  /** Restore an ArgumentAnalyzer from a previously serialized JSON string. */
  static deserialize(json: string): ArgumentAnalyzer {
    const data = JSON.parse(json) as {
      config: ArgumentAnalyzerConfig
      arguments: Argument[]
      claims: Claim[]
      relations: ArgumentRelation[]
      fallacyLog: LogicalFallacy[]
      debates: Array<{ id: string; positions: DebatePosition[] }>
    };

    const analyzer = new ArgumentAnalyzer(data.config);

    if (Array.isArray(data.arguments)) {
      for (const arg of data.arguments) {
        analyzer.arguments.set(arg.id, arg);
      }
    }

    if (Array.isArray(data.claims)) {
      for (const claim of data.claims) {
        analyzer.claims.set(claim.id, claim);
      }
    }

    if (Array.isArray(data.relations)) {
      for (const rel of data.relations) {
        analyzer.relations.set(rel.id, rel);
      }
    }

    if (Array.isArray(data.fallacyLog)) {
      analyzer.fallacyLog = data.fallacyLog;
    }

    if (Array.isArray(data.debates)) {
      for (const debate of data.debates) {
        analyzer.debates.set(debate.id, debate.positions);
      }
    }

    return analyzer;
  }

  // ── Private Helpers ─────────────────────────────────────────────────

  /** Score how likely a sentence contains a genuine claim. */
  private scoreClaim(sentence: string, hasIndicator: boolean): number {
    let score = hasIndicator ? 0.5 : 0.25;
    const words = sentence.split(/\s+/);

    // Longer claims tend to be more substantive
    if (words.length >= 8) score += 0.1;
    if (words.length >= 15) score += 0.1;

    // Presence of specific evidence markers
    if (/\b(study|research|data|evidence|statistic|percent|number)\b/i.test(sentence)) {
      score += 0.15;
    }

    // Hedging language reduces confidence
    if (/\b(maybe|perhaps|possibly|might|could|somewhat)\b/i.test(sentence)) {
      score -= 0.1;
    }

    // Strong assertion boosts confidence
    if (/\b(clearly|certainly|definitely|undoubtedly|proven)\b/i.test(sentence)) {
      score += 0.1;
    }

    return clamp(score, 0, 1);
  }

  /** Classify the role of a premise. */
  private classifyPremiseRole(text: string, index: number): Premise['role'] {
    const lower = text.toLowerCase();

    if (index === 0 || /\b(fundamental|primary|main|key|central)\b/.test(lower)) {
      return 'major';
    }
    if (/\b(additionally|furthermore|moreover|also|supporting)\b/.test(lower)) {
      return 'auxiliary';
    }
    return 'minor';
  }

  /** Score premise strength based on content. */
  private scorePremise(text: string): number {
    let score = 0.5;
    const lower = text.toLowerCase();

    // Evidence-backed premises are stronger
    for (const [keyword, quality] of Object.entries(EVIDENCE_QUALITY_KEYWORDS)) {
      if (lower.includes(keyword)) {
        score = Math.max(score, quality * 0.8);
      }
    }

    // Specificity boosts strength
    if (/\b\d+(\.\d+)?(%| percent)\b/.test(text)) score += 0.15;
    if (/\b(specifically|precisely|exactly)\b/i.test(text)) score += 0.1;

    // Vague language weakens
    if (/\b(some|few|many|lots|various|several)\b/i.test(text)) score -= 0.1;

    return clamp(score, 0, 1);
  }

  /** Score conclusion confidence given its premises. */
  private scoreConclusion(text: string, premises: Premise[]): number {
    if (premises.length === 0) return 0.2;

    const avgPremiseStrength = premises.reduce((sum, p) => sum + p.strength, 0) / premises.length;
    let score = avgPremiseStrength * 0.6;

    // Conclusion with explicit indicators is more confident
    if (containsIndicator(text, CONCLUSION_INDICATORS)) score += 0.2;

    // More premises generally support stronger conclusions
    score += Math.min(premises.length * 0.05, 0.2);

    return clamp(score, 0, 1);
  }

  /** Compute overall argument strength from premises and conclusion. */
  private computeArgumentStrength(premises: Premise[], conclusion: Conclusion): number {
    if (premises.length === 0) return 0.15;

    const avgPremise = premises.reduce((sum, p) => sum + p.strength, 0) / premises.length;
    const premiseCount = Math.min(premises.length / 5, 1);

    return clamp(
      avgPremise * 0.45 +
      conclusion.confidence * 0.35 +
      premiseCount * 0.20,
      0, 1,
    );
  }

  /** Compute fallacy detection confidence. */
  private computeFallacyConfidence(matched: string, fullText: string, pattern: FallacyPattern): number {
    let confidence = 0.5;

    // Longer match = more likely a real fallacy
    const matchRatio = matched.length / Math.max(fullText.length, 1);
    confidence += matchRatio * 0.3;

    // High-severity fallacies are typically more clearly identifiable
    if (pattern.severity === 'high') confidence += 0.1;
    if (pattern.severity === 'low') confidence -= 0.05;

    // Multiple pattern matches for the same type boost confidence
    let patternMatches = 0;
    for (const regex of pattern.patterns) {
      if (regex.test(fullText)) patternMatches++;
    }
    if (patternMatches > 1) confidence += 0.15;

    return clamp(confidence, 0, 1);
  }

  /** Assess the logical validity of an argument. */
  private assessLogicalValidity(arg: Argument): number {
    if (arg.premises.length === 0) return 0.1;

    let score = 0.5;

    // Check premise-conclusion connection
    const conclusionTokens = new Set(tokenize(arg.conclusion.text));
    let connectedCount = 0;

    for (const premise of arg.premises) {
      const premTokens = tokenize(premise.text);
      const overlap = premTokens.filter(t => conclusionTokens.has(t)).length;
      if (overlap > 0) connectedCount++;
    }

    const connectionRatio = connectedCount / arg.premises.length;
    score += connectionRatio * 0.3;

    // Penalize for detected fallacies in the argument text
    const fallacies = this.detectFallaciesInternal(arg.text);
    score -= fallacies.length * 0.1;

    // Reward for multiple premises supporting conclusion
    if (arg.premises.length >= 2) score += 0.1;
    if (arg.premises.length >= 4) score += 0.05;

    return clamp(score, 0, 1);
  }

  /** Assess evidence quality within an argument. */
  private assessEvidenceInArgument(arg: Argument): number {
    const evidence = this.assessEvidence(arg.text);
    return evidence.overall;
  }

  /** Assess relevance of premises to conclusion. */
  private assessRelevance(arg: Argument): number {
    if (arg.premises.length === 0) return 0.1;

    const conclusionTokens = tokenize(arg.conclusion.text);
    let totalRelevance = 0;

    for (const premise of arg.premises) {
      const premiseTokens = tokenize(premise.text);
      const similarity = cosineSimilarity(premiseTokens, conclusionTokens);
      totalRelevance += similarity;
    }

    return clamp(totalRelevance / arg.premises.length, 0, 1);
  }

  /** Assess whether premises are sufficient to support the conclusion. */
  private assessSufficiency(arg: Argument): number {
    if (arg.premises.length === 0) return 0.05;

    let score = 0.3;

    // More premises = more sufficient (diminishing returns)
    score += Math.min(arg.premises.length * 0.12, 0.4);

    // Strong premises contribute more
    const strongPremises = arg.premises.filter(p => p.strength >= 0.6).length;
    score += (strongPremises / Math.max(arg.premises.length, 1)) * 0.3;

    return clamp(score, 0, 1);
  }

  /** Assess internal coherence of an argument. */
  private assessCoherence(arg: Argument): number {
    if (arg.premises.length < 2) return 0.5;

    let pairwiseCoherence = 0;
    let pairs = 0;

    for (let i = 0; i < arg.premises.length; i++) {
      for (let j = i + 1; j < arg.premises.length; j++) {
        const tokensA = tokenize(arg.premises[i].text);
        const tokensB = tokenize(arg.premises[j].text);
        pairwiseCoherence += cosineSimilarity(tokensA, tokensB);
        pairs++;
      }
    }

    const avgCoherence = pairs > 0 ? pairwiseCoherence / pairs : 0;

    // Moderate coherence is ideal; too-high coherence may be redundancy
    if (avgCoherence > 0.8) return 0.7;
    return clamp(avgCoherence + 0.3, 0, 1);
  }

  /** Internal fallacy check that avoids logging. */
  private detectFallaciesInternal(text: string): LogicalFallacy[] {
    const detected: LogicalFallacy[] = [];

    for (const pattern of FALLACY_PATTERNS) {
      for (const regex of pattern.patterns) {
        const match = regex.exec(text);
        if (match) {
          const confidence = this.computeFallacyConfidence(match[0], text, pattern);
          if (confidence >= this.config.fallacyConfidenceThreshold) {
            detected.push({
              type: pattern.type,
              name: pattern.name,
              description: pattern.description,
              matchedText: match[0],
              confidence,
              severity: pattern.severity,
            });
          }
          break;
        }
      }
    }

    return detected;
  }

  /** Compute the depth of the argument map from root nodes. */
  private computeMapDepth(rootIds: string[], relations: ArgumentRelation[]): number {
    if (rootIds.length === 0) return 0;

    const children = new Map<string, string[]>();
    for (const rel of relations) {
      const existing = children.get(rel.sourceId) ?? [];
      existing.push(rel.targetId);
      children.set(rel.sourceId, existing);
    }

    let maxDepth = 0;
    const visited = new Set<string>();

    const dfs = (nodeId: string, depth: number): void => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      maxDepth = Math.max(maxDepth, depth);
      const childNodes = children.get(nodeId) ?? [];
      for (const child of childNodes) {
        dfs(child, depth + 1);
      }
      visited.delete(nodeId);
    };

    for (const root of rootIds) {
      dfs(root, 1);
    }

    return maxDepth;
  }

  /** Generate a rebuttal counter-argument. */
  private generateRebuttal(arg: Argument): CounterArgument | null {
    const conclusionTokens = tokenize(arg.conclusion.text);
    if (conclusionTokens.length === 0) return null;

    const keyTerms = conclusionTokens.slice(0, 5).join(', ');
    const claim = `The conclusion regarding ${keyTerms} does not follow from the given premises.`;
    const reasoning = arg.premises.length < 2
      ? 'Insufficient premises provided to adequately support the conclusion.'
      : `While the premises address ${tokenize(arg.premises[0].text).slice(0, 3).join(', ')}, they fail to establish a necessary link to the conclusion.`;

    return {
      id: generateId('counter'),
      targetArgumentId: arg.id,
      type: 'rebuttal',
      claim,
      reasoning,
      strength: clamp(1 - arg.strength, 0.2, 0.9),
    };
  }

  /** Generate an undercutter targeting a specific premise-conclusion link. */
  private generateUndercutter(arg: Argument, premise: Premise): CounterArgument | null {
    const premiseTokens = tokenize(premise.text);
    const conclusionTokens = tokenize(arg.conclusion.text);
    const overlap = cosineSimilarity(premiseTokens, conclusionTokens);

    if (overlap > 0.6) return null; // strong link, hard to undercut

    const keyTerms = premiseTokens.slice(0, 3).join(', ');
    return {
      id: generateId('counter'),
      targetArgumentId: arg.id,
      type: 'undercutter',
      claim: `The premise concerning ${keyTerms} does not provide relevant support for the conclusion.`,
      reasoning: `The connection between this premise and the conclusion is weak (relevance: ${overlap.toFixed(2)}), suggesting additional bridging evidence is needed.`,
      strength: clamp(1 - overlap, 0.2, 0.9),
    };
  }

  /** Generate a counterexample. */
  private generateCounterexample(arg: Argument): CounterArgument | null {
    const conclusionTokens = tokenize(arg.conclusion.text);
    if (conclusionTokens.length === 0) return null;

    const hasUniversal = /\b(all|every|always|never|no\s+one|everyone)\b/i.test(arg.conclusion.text);

    if (!hasUniversal && arg.conclusion.confidence > 0.7) return null;

    const keyTerms = conclusionTokens.slice(0, 4).join(', ');
    return {
      id: generateId('counter'),
      targetArgumentId: arg.id,
      type: 'counterexample',
      claim: `A counterexample can be constructed for the claim about ${keyTerms}.`,
      reasoning: hasUniversal
        ? 'The conclusion makes a universal claim which is vulnerable to counterexamples.'
        : 'The conclusion lacks sufficient hedging and may not account for edge cases.',
      strength: hasUniversal ? 0.8 : 0.5,
    };
  }

  /** Generate an alternative explanation. */
  private generateAlternative(arg: Argument): CounterArgument | null {
    const isCausal = arg.claims.some(c => c.type === 'causal') ||
      /\b(cause[sd]?|leads?\s+to|result|because|effect)\b/i.test(arg.text);

    if (!isCausal) return null;

    const conclusionTokens = tokenize(arg.conclusion.text);
    const keyTerms = conclusionTokens.slice(0, 4).join(', ');

    return {
      id: generateId('counter'),
      targetArgumentId: arg.id,
      type: 'alternative',
      claim: `Alternative explanations exist for the observed relationship involving ${keyTerms}.`,
      reasoning: 'Causal claims require ruling out alternative explanations; correlation alone does not establish causation.',
      strength: 0.65,
    };
  }

  /** Classify the structural type of reasoning. */
  private classifyStructureType(arg: Argument): 'deductive' | 'inductive' | 'abductive' | 'mixed' {
    const text = arg.text.toLowerCase();

    const deductiveMarkers = ['therefore', 'necessarily', 'must be', 'it follows', 'logically'];
    const inductiveMarkers = ['probably', 'likely', 'most', 'typically', 'generally', 'tends to'];
    const abductiveMarkers = ['best explanation', 'explains why', 'suggests that', 'hypothesis', 'plausible'];

    const deductiveScore = deductiveMarkers.filter(m => text.includes(m)).length;
    const inductiveScore = inductiveMarkers.filter(m => text.includes(m)).length;
    const abductiveScore = abductiveMarkers.filter(m => text.includes(m)).length;

    const max = Math.max(deductiveScore, inductiveScore, abductiveScore);
    if (max === 0) return 'mixed';

    const scores = [deductiveScore, inductiveScore, abductiveScore];
    const topCount = scores.filter(s => s === max).length;
    if (topCount > 1) return 'mixed';

    if (deductiveScore === max) return 'deductive';
    if (inductiveScore === max) return 'inductive';
    return 'abductive';
  }

  /** Find dimensions where argument A is stronger than B. */
  private findAdvantages(a: ArgumentStrength, b: ArgumentStrength): string[] {
    const advantages: string[] = [];
    const dimensions: Array<[string, number, number]> = [
      ['logical validity', a.logicalValidity, b.logicalValidity],
      ['evidence quality', a.evidenceQuality, b.evidenceQuality],
      ['relevance', a.relevance, b.relevance],
      ['sufficiency', a.sufficiency, b.sufficiency],
      ['coherence', a.coherence, b.coherence],
    ];

    for (const [name, scoreA, scoreB] of dimensions) {
      if (scoreA > scoreB + 0.05) {
        advantages.push(name);
      }
    }

    return advantages.length > 0 ? advantages : ['marginal overall advantage'];
  }
}
