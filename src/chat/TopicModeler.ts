/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Topic Modeler — Unsupervised Topic Discovery & User Interest Profiling      ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Lightweight LSA — TF-IDF + co-occurrence topic extraction               ║
 * ║    ✦ Dynamic Topic Tracking — Detect topic drift and emergence               ║
 * ║    ✦ Topic Hierarchies — Parent-child relationships between topics           ║
 * ║    ✦ User Interest Profiling — Per-user topic affinity models                ║
 * ║    ✦ Topic Recommendation — Suggest topics based on user interests           ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface Topic {
  id: string
  name: string
  keywords: string[]          // top keywords representing this topic
  weight: number              // topic importance/prevalence 0-1
  documentCount: number       // how many documents contain this topic
  coherence: number           // topic coherence score
  createdAt: number
  lastSeen: number
}

export interface TopicAssignment {
  topicId: string
  topicName: string
  weight: number              // how much this document relates to this topic
}

export interface DocumentTopics {
  documentId: string
  text: string
  topics: TopicAssignment[]
  dominantTopic: string
}

export interface TopicDrift {
  fromTopic: string
  toTopic: string
  timestamp: number
  confidence: number
}

export interface UserInterestProfile {
  userId: string
  topicAffinities: Record<string, number>  // topic → affinity score
  recentTopics: string[]                   // last N topics
  dominantInterests: string[]              // top 3 interests
  lastUpdated: number
}

export interface TopicHierarchy {
  topic: string
  children: TopicHierarchy[]
  depth: number
}

export interface TopicModelerConfig {
  maxTopics: number             // default 20
  minDocumentsForTopic: number  // default 3
  topKeywordsPerTopic: number   // default 10
  driftThreshold: number        // default 0.5
  profileWindowSize: number     // default 50
  tfidfSmoothing: number        // default 1.0
}

export interface TopicModelerStats {
  totalDocuments: number
  totalTopics: number
  avgTopicsPerDocument: number
  topicDrifts: number
  profileCount: number
}

// ── Constants ────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
  'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
  'think', 'also', 'back', 'after', 'two', 'how', 'our', 'work',
  'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
  'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'has',
  'had', 'did', 'does', 'am', 'being', 'doing', 'should', 'very', 'much',
  'such', 'each', 'every', 'own', 'same', 'too', 'more', 'need', 'still',
  'between', 'must', 'through', 'while', 'where', 'before', 'those', 'may',
]);

const DEFAULT_CONFIG: TopicModelerConfig = {
  maxTopics: 20,
  minDocumentsForTopic: 3,
  topKeywordsPerTopic: 10,
  driftThreshold: 0.5,
  profileWindowSize: 50,
  tfidfSmoothing: 1.0,
};

/** Maximum vocabulary size for the TF-IDF matrix. */
const MAX_VOCAB_SIZE = 300;

/** Number of iterations for the power method. */
const POWER_ITERATIONS = 10;

/** Affinity decay factor applied to older interactions. */
const AFFINITY_DECAY = 0.9;

/** Minimum keyword overlap ratio to form a parent-child hierarchy link. */
const HIERARCHY_OVERLAP_THRESHOLD = 0.3;

// ── Internal Helpers ─────────────────────────────────────────────────────

/**
 * Tokenize text into lowercase words, filtering stop words and short tokens.
 * Module-private to avoid collision with the exported tokenize in TfIdfScorer.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w));
}

/** Monotonically increasing counter for unique topic IDs. */
let topicCounter = 0;

/** Generate a unique topic ID. */
function generateTopicId(): string {
  topicCounter += 1;
  return `topic_${Date.now().toString(36)}_${topicCounter.toString(36)}`;
}

/** Simple seeded pseudo-random number generator (linear congruential). */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Compute TF-IDF matrix for a set of documents.
 *
 * Returns a dense terms × documents matrix along with the ordered term list
 * and document ID list so callers can map indices back to identifiers.
 */
function computeTfIdf(
  docTokens: Map<string, string[]>,
  smoothing: number,
): { matrix: number[][]; terms: string[]; docIds: string[] } {
  const docFreq = new Map<string, number>();
  const docIds = Array.from(docTokens.keys());
  const n = docIds.length;

  for (const tokens of docTokens.values()) {
    const unique = new Set(tokens);
    for (const term of unique) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  // Select top terms by document frequency, capped at MAX_VOCAB_SIZE
  const terms = Array.from(docFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_VOCAB_SIZE)
    .map(([term]) => term);

  const termIndex = new Map<string, number>();
  terms.forEach((t, i) => termIndex.set(t, i));

  // Build dense TF-IDF matrix (terms × documents)
  const matrix: number[][] = [];
  for (let ti = 0; ti < terms.length; ti++) {
    matrix[ti] = new Array(n).fill(0);
  }

  for (let di = 0; di < docIds.length; di++) {
    const tokens = docTokens.get(docIds[di])!;
    const termCounts = new Map<string, number>();
    for (const t of tokens) {
      termCounts.set(t, (termCounts.get(t) ?? 0) + 1);
    }
    const totalTerms = tokens.length || 1;

    for (const [term, count] of termCounts) {
      const ti = termIndex.get(term);
      if (ti === undefined) continue;
      const tf = count / totalTerms;
      const df = docFreq.get(term) ?? 0;
      const idf = Math.log((n + smoothing) / (df + smoothing)) + 1;
      matrix[ti][di] = tf * idf;
    }
  }

  return { matrix, terms, docIds };
}

/**
 * Build a symmetric term co-occurrence matrix from the TF-IDF matrix.
 * Computes C = T × Tᵀ where T is the (terms × documents) TF-IDF matrix.
 */
function buildCooccurrenceMatrix(tfidfMatrix: number[][]): number[][] {
  const m = tfidfMatrix.length;
  if (m === 0) return [];

  const n = tfidfMatrix[0].length;
  const C: number[][] = [];
  for (let i = 0; i < m; i++) {
    C[i] = new Array(m).fill(0);
  }

  for (let i = 0; i < m; i++) {
    for (let j = i; j < m; j++) {
      let sum = 0;
      for (let d = 0; d < n; d++) {
        sum += tfidfMatrix[i][d] * tfidfMatrix[j][d];
      }
      C[i][j] = sum;
      C[j][i] = sum;  // symmetric
    }
  }

  return C;
}

/**
 * Gram-Schmidt orthogonalization.
 *
 * Takes an array of vectors and returns an orthonormal basis spanning the
 * same subspace.  Vectors with near-zero norm after projection are kept
 * as-is to preserve array length.
 */
function gramSchmidt(vectors: number[][]): number[][] {
  const result: number[][] = [];

  for (let i = 0; i < vectors.length; i++) {
    const v = [...vectors[i]];

    // Subtract projections onto all previous basis vectors
    for (let j = 0; j < result.length; j++) {
      const u = result[j];
      let dot = 0;
      let uNormSq = 0;
      for (let k = 0; k < v.length; k++) {
        dot += v[k] * u[k];
        uNormSq += u[k] * u[k];
      }
      if (uNormSq > 1e-10) {
        const proj = dot / uNormSq;
        for (let k = 0; k < v.length; k++) {
          v[k] -= proj * u[k];
        }
      }
    }

    // Normalize to unit length
    let normSq = 0;
    for (let k = 0; k < v.length; k++) {
      normSq += v[k] * v[k];
    }
    const norm = Math.sqrt(normSq);
    if (norm > 1e-10) {
      for (let k = 0; k < v.length; k++) {
        v[k] /= norm;
      }
    }

    result.push(v);
  }

  return result;
}

/**
 * Power iteration (subspace iteration) to approximate the top-k
 * eigenvectors of a symmetric matrix.
 *
 * 1. Initialize k random vectors
 * 2. Multiply by the matrix
 * 3. Orthogonalize via Gram-Schmidt
 * 4. Repeat for the given number of iterations
 */
function powerIteration(
  matrix: number[][],
  k: number,
  iterations: number,
  seed: number,
): number[][] {
  const m = matrix.length;
  if (m === 0) return [];
  const actualK = Math.min(k, m);

  const rng = seededRandom(seed);

  // Initialize k random vectors of dimension m
  let vectors: number[][] = [];
  for (let i = 0; i < actualK; i++) {
    const v = new Array<number>(m);
    for (let j = 0; j < m; j++) {
      v[j] = rng() - 0.5;
    }
    vectors.push(v);
  }

  vectors = gramSchmidt(vectors);

  for (let _iter = 0; _iter < iterations; _iter++) {
    const newVectors: number[][] = [];

    for (let vi = 0; vi < actualK; vi++) {
      const v = vectors[vi];
      const out = new Array<number>(m).fill(0);
      for (let i = 0; i < m; i++) {
        let sum = 0;
        for (let j = 0; j < m; j++) {
          sum += matrix[i][j] * v[j];
        }
        out[i] = sum;
      }
      newVectors.push(out);
    }

    vectors = gramSchmidt(newVectors);
  }

  return vectors;
}

/**
 * Compute topic coherence as the average pairwise co-occurrence strength
 * among the top keywords.  Higher values indicate more semantically
 * cohesive topics.
 */
function computeCoherence(
  keywords: string[],
  cooccurrence: number[][],
  termIndex: Map<string, number>,
): number {
  if (keywords.length < 2) return 0;

  let total = 0;
  let pairs = 0;

  for (let i = 0; i < keywords.length; i++) {
    for (let j = i + 1; j < keywords.length; j++) {
      const ti = termIndex.get(keywords[i]);
      const tj = termIndex.get(keywords[j]);
      if (ti !== undefined && tj !== undefined) {
        total += cooccurrence[ti][tj];
        pairs++;
      }
    }
  }

  return pairs > 0 ? total / pairs : 0;
}

// ── TopicModeler ─────────────────────────────────────────────────────────

interface StoredDocument {
  text: string
  tokens: string[]
  addedAt: number
}

export class TopicModeler {
  private documents: Map<string, StoredDocument> = new Map();
  private topics: Map<string, Topic> = new Map();
  private documentTopicMap: Map<string, DocumentTopics> = new Map();
  private drifts: TopicDrift[] = [];
  private userProfiles: Map<string, UserInterestProfile> = new Map();
  private config: TopicModelerConfig;

  constructor(config: Partial<TopicModelerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Document Processing ──────────────────────────────────────────────

  /** Add a document to the corpus, extract terms, update internal data. */
  addDocument(id: string, text: string): void {
    const tokens = tokenize(text);
    this.documents.set(id, { text, tokens, addedAt: Date.now() });
    // Invalidate cached assignment — corpus changed
    this.documentTopicMap.delete(id);
  }

  /** Remove a document from the corpus. */
  removeDocument(id: string): void {
    this.documents.delete(id);
    this.documentTopicMap.delete(id);
  }

  /** Get topic assignments for a document. */
  getDocumentTopics(id: string): DocumentTopics | null {
    const cached = this.documentTopicMap.get(id);
    if (cached) return cached;

    const doc = this.documents.get(id);
    if (!doc) return null;
    if (this.topics.size === 0) return null;

    const assignments = this.classifyText(doc.text);
    if (assignments.length === 0) return null;

    const result: DocumentTopics = {
      documentId: id,
      text: doc.text,
      topics: assignments,
      dominantTopic: assignments[0].topicId,
    };
    this.documentTopicMap.set(id, result);
    return result;
  }

  // ── Topic Discovery (Lightweight LSA) ────────────────────────────────

  /**
   * Run lightweight LSA-style topic extraction.
   *
   * 1. Build term-document TF-IDF matrix
   * 2. Compute term co-occurrence matrix (T × Tᵀ)
   * 3. Use power iteration to find principal components
   * 4. Extract top-k topics as clusters of co-occurring terms
   * 5. Name topics by their top keywords
   */
  discoverTopics(k?: number): Topic[] {
    const numTopics = Math.min(k ?? this.config.maxTopics, this.documents.size);
    if (numTopics <= 0 || this.documents.size < 2) return [];

    // Step 1: Collect document tokens
    const docTokens = new Map<string, string[]>();
    for (const [id, doc] of this.documents) {
      docTokens.set(id, doc.tokens);
    }

    // Step 2: Build TF-IDF matrix
    const { matrix, terms, docIds } = computeTfIdf(docTokens, this.config.tfidfSmoothing);
    if (terms.length < 2) return [];

    const termIndex = new Map<string, number>();
    terms.forEach((t, i) => termIndex.set(t, i));

    // Step 3: Build co-occurrence matrix
    const cooccurrence = buildCooccurrenceMatrix(matrix);

    // Step 4: Power iteration to find principal components
    const eigenvectors = powerIteration(cooccurrence, numTopics, POWER_ITERATIONS, 42);

    // Step 5: Extract topics from eigenvectors
    const now = Date.now();
    const discoveredTopics: Topic[] = [];

    for (const vec of eigenvectors) {
      // Rank terms by absolute weight in this eigenvector
      const termWeights = terms.map((term, i) => ({ term, weight: Math.abs(vec[i]) }));
      termWeights.sort((a, b) => b.weight - a.weight);

      const topKeywords = termWeights
        .slice(0, this.config.topKeywordsPerTopic)
        .map(tw => tw.term);

      if (topKeywords.length === 0) continue;

      // Name topic by its top 2–3 keywords
      const name = topKeywords.slice(0, 3).join(' / ');

      // Count documents with significant representation in this topic
      let docCount = 0;
      for (let di = 0; di < docIds.length; di++) {
        let score = 0;
        for (let ti = 0; ti < vec.length; ti++) {
          score += vec[ti] * matrix[ti][di];
        }
        if (Math.abs(score) > 0.01) docCount++;
      }

      // Coherence from the top-5 keywords
      const coherence = computeCoherence(
        topKeywords.slice(0, 5),
        cooccurrence,
        termIndex,
      );

      discoveredTopics.push({
        id: generateTopicId(),
        name,
        keywords: topKeywords,
        weight: 0,  // normalized below
        documentCount: docCount,
        coherence,
        createdAt: now,
        lastSeen: now,
      });
    }

    // Normalize topic weights relative to corpus size
    const totalDocs = Math.max(1, this.documents.size);
    for (const topic of discoveredTopics) {
      topic.weight = Math.min(1, topic.documentCount / totalDocs);
    }

    // Filter topics that don't meet the minimum document threshold
    const filtered = discoveredTopics.filter(
      t => t.documentCount >= this.config.minDocumentsForTopic,
    );

    // Replace stored topics
    this.topics.clear();
    for (const topic of filtered) {
      this.topics.set(topic.id, topic);
    }

    // Re-assign all documents to the new topics
    this.documentTopicMap.clear();
    for (const docId of this.documents.keys()) {
      this.getDocumentTopics(docId);
    }

    return filtered;
  }

  /** Get all discovered topics. */
  getTopics(): Topic[] {
    return Array.from(this.topics.values());
  }

  /** Get a specific topic by ID. */
  getTopic(id: string): Topic | null {
    return this.topics.get(id) ?? null;
  }

  /** Find topic by name (case insensitive). */
  getTopicByName(name: string): Topic | null {
    const lower = name.toLowerCase();
    for (const topic of this.topics.values()) {
      if (topic.name.toLowerCase() === lower) return topic;
    }
    return null;
  }

  // ── Dynamic Topic Tracking ───────────────────────────────────────────

  /**
   * Compare recent topic distribution vs historical distribution.
   * Returns drift events when a topic's relative weight shifted beyond
   * the configured threshold.
   */
  detectTopicDrift(recentDocIds: string[], windowSize?: number): TopicDrift[] {
    const window = windowSize ?? this.config.profileWindowSize;
    const newDrifts: TopicDrift[] = [];

    // Compute topic distribution for recent documents
    const recentDist = new Map<string, number>();
    let recentTotal = 0;
    for (const docId of recentDocIds) {
      const dt = this.getDocumentTopics(docId);
      if (!dt) continue;
      for (const ta of dt.topics) {
        recentDist.set(ta.topicId, (recentDist.get(ta.topicId) ?? 0) + ta.weight);
        recentTotal += ta.weight;
      }
    }

    // Compute topic distribution for historical (non-recent) documents
    const recentSet = new Set(recentDocIds);
    const historicalDist = new Map<string, number>();
    let historicalTotal = 0;
    const historicalDocIds = Array.from(this.documents.keys())
      .filter(id => !recentSet.has(id))
      .slice(-window);

    for (const docId of historicalDocIds) {
      const dt = this.getDocumentTopics(docId);
      if (!dt) continue;
      for (const ta of dt.topics) {
        historicalDist.set(ta.topicId, (historicalDist.get(ta.topicId) ?? 0) + ta.weight);
        historicalTotal += ta.weight;
      }
    }

    // Normalize both distributions
    if (recentTotal > 0) {
      for (const [k, v] of recentDist) recentDist.set(k, v / recentTotal);
    }
    if (historicalTotal > 0) {
      for (const [k, v] of historicalDist) historicalDist.set(k, v / historicalTotal);
    }

    // Identify topics whose share changed significantly
    const allTopicIds = new Set([...recentDist.keys(), ...historicalDist.keys()]);
    const now = Date.now();

    for (const topicId of allTopicIds) {
      const recent = recentDist.get(topicId) ?? 0;
      const historical = historicalDist.get(topicId) ?? 0;
      const diff = recent - historical;

      if (diff <= this.config.driftThreshold) continue;

      // Topic gained prominence — find the biggest decliner
      let biggestLoser = '';
      let biggestLoss = 0;
      for (const otherId of allTopicIds) {
        if (otherId === topicId) continue;
        const otherDiff =
          (recentDist.get(otherId) ?? 0) - (historicalDist.get(otherId) ?? 0);
        if (otherDiff < biggestLoss) {
          biggestLoss = otherDiff;
          biggestLoser = otherId;
        }
      }

      if (biggestLoser) {
        newDrifts.push({
          fromTopic: biggestLoser,
          toTopic: topicId,
          timestamp: now,
          confidence: Math.min(1, Math.abs(diff)),
        });
      }
    }

    this.drifts.push(...newDrifts);
    return newDrifts;
  }

  /** Chronological topic appearances ordered by document insertion time. */
  getTopicTimeline(): Array<{ timestamp: number; topicId: string; topicName: string }> {
    const timeline: Array<{ timestamp: number; topicId: string; topicName: string }> = [];

    for (const [docId, doc] of this.documents) {
      const dt = this.documentTopicMap.get(docId);
      if (!dt || dt.topics.length === 0) continue;

      const dominant = dt.topics[0];
      timeline.push({
        timestamp: doc.addedAt,
        topicId: dominant.topicId,
        topicName: dominant.topicName,
      });
    }

    timeline.sort((a, b) => a.timestamp - b.timestamp);
    return timeline;
  }

  /** Get all detected topic drifts. */
  getDrifts(): TopicDrift[] {
    return [...this.drifts];
  }

  // ── Topic Hierarchies ────────────────────────────────────────────────

  /**
   * Build topic hierarchy based on keyword overlap.
   *
   * A topic becomes the child of another when they share enough keywords
   * and the parent has a higher document count.
   */
  buildHierarchy(): TopicHierarchy[] {
    const topics = this.getTopics();
    if (topics.length === 0) return [];

    // Pairwise keyword overlap
    const overlapMap = new Map<string, Map<string, number>>();
    for (const a of topics) {
      const aSet = new Set(a.keywords);
      const aOverlaps = new Map<string, number>();
      for (const b of topics) {
        if (a.id === b.id) continue;
        const bSet = new Set(b.keywords);
        let shared = 0;
        for (const kw of aSet) {
          if (bSet.has(kw)) shared++;
        }
        aOverlaps.set(b.id, shared / Math.max(aSet.size, bSet.size));
      }
      overlapMap.set(a.id, aOverlaps);
    }

    // Determine parent-child links
    const children = new Map<string, string[]>();
    const hasParent = new Set<string>();

    for (const a of topics) {
      for (const b of topics) {
        if (a.id === b.id) continue;
        const overlap = overlapMap.get(a.id)?.get(b.id) ?? 0;
        if (overlap > HIERARCHY_OVERLAP_THRESHOLD && a.documentCount > b.documentCount) {
          if (!children.has(a.id)) children.set(a.id, []);
          children.get(a.id)!.push(b.id);
          hasParent.add(b.id);
        }
      }
    }

    const topicById = new Map(topics.map(t => [t.id, t]));

    const buildNode = (id: string, depth: number): TopicHierarchy => {
      const topic = topicById.get(id)!;
      const childIds = children.get(id) ?? [];
      return {
        topic: topic.name,
        children: childIds.map(cid => buildNode(cid, depth + 1)),
        depth,
      };
    };

    // Root topics have no parent
    const roots = topics.filter(t => !hasParent.has(t.id));
    return roots.map(r => buildNode(r.id, 0));
  }

  // ── User Interest Profiling ──────────────────────────────────────────

  /** Update a user's interest profile based on a document's topic distribution. */
  updateUserProfile(userId: string, documentId: string): void {
    const docTopics = this.getDocumentTopics(documentId);
    if (!docTopics) return;

    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = {
        userId,
        topicAffinities: {},
        recentTopics: [],
        dominantInterests: [],
        lastUpdated: Date.now(),
      };
    }

    // Apply exponential decay to existing affinities
    for (const key of Object.keys(profile.topicAffinities)) {
      profile.topicAffinities[key] *= AFFINITY_DECAY;
    }

    // Accumulate new affinity from document's topic weights
    for (const ta of docTopics.topics) {
      const current = profile.topicAffinities[ta.topicId] ?? 0;
      profile.topicAffinities[ta.topicId] = current + ta.weight;
    }

    // Maintain sliding window of recent dominant topics
    if (docTopics.dominantTopic) {
      profile.recentTopics.push(docTopics.dominantTopic);
      if (profile.recentTopics.length > this.config.profileWindowSize) {
        profile.recentTopics = profile.recentTopics.slice(-this.config.profileWindowSize);
      }
    }

    // Recompute dominant interests (top 3 by affinity)
    const ranked = Object.entries(profile.topicAffinities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    profile.dominantInterests = ranked.map(([topicId]) => topicId);

    profile.lastUpdated = Date.now();
    this.userProfiles.set(userId, profile);
  }

  /** Get a user's interest profile. */
  getUserProfile(userId: string): UserInterestProfile | null {
    return this.userProfiles.get(userId) ?? null;
  }

  /** Get all user profiles. */
  getUserProfiles(): UserInterestProfile[] {
    return Array.from(this.userProfiles.values());
  }

  /**
   * Recommend topics for a user based on their interest profile.
   *
   * Scoring combines direct affinity, similarity to liked topics, and a
   * novelty bonus for topics the user hasn't seen recently.
   */
  recommendTopics(userId: string, limit?: number): Topic[] {
    const maxResults = limit ?? 5;
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    const allTopics = this.getTopics();
    if (allTopics.length === 0) return [];

    const affinityTopics = new Set(Object.keys(profile.topicAffinities));
    const recentSet = new Set(profile.recentTopics);

    const scored = allTopics.map(topic => {
      const affinity = profile.topicAffinities[topic.id] ?? 0;
      const noveltyBonus = recentSet.has(topic.id) ? 0.5 : 1.0;

      // Boost from similar topics the user already likes
      let similarityBoost = 0;
      for (const knownId of affinityTopics) {
        const knownTopic = this.topics.get(knownId);
        if (knownTopic) {
          const sim = this.computeKeywordOverlap(topic.keywords, knownTopic.keywords);
          similarityBoost += sim * (profile.topicAffinities[knownId] ?? 0);
        }
      }

      const score =
        affinity * 0.4 +
        similarityBoost * 0.4 +
        topic.weight * noveltyBonus * 0.2;

      return { topic, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxResults).map(s => s.topic);
  }

  // ── Similarity ───────────────────────────────────────────────────────

  /** Keyword-overlap (Jaccard) similarity between two topics. */
  topicSimilarity(topicIdA: string, topicIdB: string): number {
    const a = this.topics.get(topicIdA);
    const b = this.topics.get(topicIdB);
    if (!a || !b) return 0;
    return this.computeKeywordOverlap(a.keywords, b.keywords);
  }

  /**
   * Classify new text against existing topics without adding it to the
   * corpus.  Returns topic assignments sorted by weight (descending).
   */
  classifyText(text: string): TopicAssignment[] {
    const tokens = tokenize(text);
    if (tokens.length === 0 || this.topics.size === 0) return [];

    const tokenSet = new Set(tokens);
    const tokenCounts = new Map<string, number>();
    for (const t of tokens) {
      tokenCounts.set(t, (tokenCounts.get(t) ?? 0) + 1);
    }

    const assignments: TopicAssignment[] = [];

    for (const topic of this.topics.values()) {
      let score = 0;
      for (const keyword of topic.keywords) {
        if (tokenSet.has(keyword)) {
          const count = tokenCounts.get(keyword) ?? 0;
          score += count / tokens.length;
        }
      }
      if (score > 0) {
        assignments.push({
          topicId: topic.id,
          topicName: topic.name,
          weight: score,
        });
      }
    }

    // Normalize weights so they sum to 1
    const total = assignments.reduce((sum, a) => sum + a.weight, 0);
    if (total > 0) {
      for (const a of assignments) {
        a.weight /= total;
      }
    }

    assignments.sort((a, b) => b.weight - a.weight);
    return assignments;
  }

  // ── Stats & Persistence ──────────────────────────────────────────────

  /** Return aggregate statistics about the modeler state. */
  getStats(): TopicModelerStats {
    let totalAssignments = 0;
    let docsWithTopics = 0;

    for (const dt of this.documentTopicMap.values()) {
      totalAssignments += dt.topics.length;
      docsWithTopics++;
    }

    return {
      totalDocuments: this.documents.size,
      totalTopics: this.topics.size,
      avgTopicsPerDocument: docsWithTopics > 0
        ? totalAssignments / docsWithTopics
        : 0,
      topicDrifts: this.drifts.length,
      profileCount: this.userProfiles.size,
    };
  }

  /** Serialize the entire modeler state to a JSON string. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      documents: Array.from(this.documents.entries()).map(([id, doc]) => ({
        id,
        text: doc.text,
        tokens: doc.tokens,
        addedAt: doc.addedAt,
      })),
      topics: Array.from(this.topics.values()),
      documentTopicMap: Array.from(this.documentTopicMap.entries()).map(
        ([id, dt]) => ({ id, ...dt }),
      ),
      drifts: this.drifts,
      userProfiles: Array.from(this.userProfiles.values()),
    });
  }

  /** Restore a TopicModeler from a previously serialized JSON string. */
  static deserialize(json: string): TopicModeler {
    const data = JSON.parse(json) as {
      config: TopicModelerConfig
      documents: Array<{ id: string; text: string; tokens: string[]; addedAt: number }>
      topics: Topic[]
      documentTopicMap: Array<{
        id: string
        documentId: string
        text: string
        topics: TopicAssignment[]
        dominantTopic: string
      }>
      drifts: TopicDrift[]
      userProfiles: UserInterestProfile[]
    };

    const modeler = new TopicModeler(data.config);

    if (Array.isArray(data.documents)) {
      for (const doc of data.documents) {
        modeler.documents.set(doc.id, {
          text: doc.text,
          tokens: doc.tokens,
          addedAt: doc.addedAt,
        });
      }
    }

    if (Array.isArray(data.topics)) {
      for (const topic of data.topics) {
        modeler.topics.set(topic.id, topic);
      }
    }

    if (Array.isArray(data.documentTopicMap)) {
      for (const entry of data.documentTopicMap) {
        modeler.documentTopicMap.set(entry.id, {
          documentId: entry.documentId,
          text: entry.text,
          topics: entry.topics,
          dominantTopic: entry.dominantTopic,
        });
      }
    }

    if (Array.isArray(data.drifts)) {
      modeler.drifts = data.drifts;
    }

    if (Array.isArray(data.userProfiles)) {
      for (const profile of data.userProfiles) {
        modeler.userProfiles.set(profile.userId, profile);
      }
    }

    return modeler;
  }

  // ── Private Helpers ──────────────────────────────────────────────────

  /** Compute Jaccard similarity between two keyword arrays. */
  private computeKeywordOverlap(a: string[], b: string[]): number {
    const setA = new Set(a);
    const setB = new Set(b);
    let intersection = 0;
    for (const kw of setA) {
      if (setB.has(kw)) intersection++;
    }
    const union = new Set([...a, ...b]).size;
    return union > 0 ? intersection / union : 0;
  }
}
