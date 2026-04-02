/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Semantic Trainer — Active Training Loop for the Semantic System             ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Online Vocabulary Expansion — Learn new word vectors from conversations ║
 * ║    ✦ Embedding Fine-Tuning — Adjust vectors based on feedback signals        ║
 * ║    ✦ Domain Adaptation — Detect user domain and boost relevant clusters      ║
 * ║    ✦ Contrastive Learning — Pull similar, push dissimilar embeddings         ║
 * ║    ✦ Training History — Snapshots with rollback capability                   ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES — All data shapes for the training loop                          ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Domain Classification ────────────────────────────────────────────────────

/** Supported knowledge domains for adaptation. */
export type DomainType =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'ai_ml'
  | 'mobile'
  | 'security'
  | 'systems'
  | 'general'

// ── Core Structures ──────────────────────────────────────────────────────────

/** A single training example with optional pre-computed embedding. */
export interface TrainingExample {
  id: string
  text: string
  domain: DomainType
  embedding?: number[]
  timestamp: number
}

/** A frozen snapshot of the trainer state for rollback. */
export interface TrainingSnapshot {
  id: string
  timestamp: number
  vocabularySize: number
  domainWeights: Record<DomainType, number>
  description: string
}

/** A feedback signal used to adjust embeddings. */
export interface FeedbackSignal {
  type: 'positive' | 'negative' | 'similarity' | 'dissimilarity'
  sourceText: string
  targetText?: string
  strength: number  // 0-1
  timestamp: number
}

/** Profile of a single domain including learned statistics. */
export interface DomainProfile {
  domain: DomainType
  weight: number
  exampleCount: number
  lastSeen: number
  topTerms: string[]
}

/** Aggregate statistics for the trainer. */
export interface TrainerStats {
  totalExamples: number
  totalFeedback: number
  vocabularyExpansions: number
  snapshotCount: number
  currentDomain: DomainType
  domainDistribution: Record<DomainType, number>
}

/** Configuration for the semantic trainer. */
export interface SemanticTrainerConfig {
  learningRate: number              // default 0.01
  maxVocabulary: number             // default 2000
  maxSnapshots: number              // default 20
  domainBoostFactor: number         // default 1.5
  contrastiveMargin: number         // default 0.3
  minExamplesForAdaptation: number  // default 5
}

/** A learned word in the vocabulary with its dense vector. */
export interface VocabularyEntry {
  word: string
  vector: number[]
  frequency: number
  domains: DomainType[]
  learnedAt: number
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  CONSTANTS — Stop words, defaults, domain dictionaries                  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_DIMENSIONS = 50

const DEFAULT_CONFIG: SemanticTrainerConfig = {
  learningRate: 0.01,
  maxVocabulary: 2000,
  maxSnapshots: 20,
  domainBoostFactor: 1.5,
  contrastiveMargin: 0.3,
  minExamplesForAdaptation: 5,
}

/** All recognized domain types. */
const ALL_DOMAINS: DomainType[] = [
  'frontend', 'backend', 'database', 'devops',
  'ai_ml', 'mobile', 'security', 'systems', 'general',
]

// ── Stop Words ───────────────────────────────────────────────────────────────

/** Common English stop words to filter out during tokenization. */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'about', 'that',
  'this', 'it', 'its', 'and', 'or', 'not', 'but', 'if', 'then',
  'so', 'up', 'out', 'no', 'just', 'also', 'very', 'what', 'how',
  'when', 'where', 'which', 'who', 'whom', 'why', 'i', 'me', 'my',
  'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them', 'their',
])

// ── Domain Keyword Dictionaries ──────────────────────────────────────────────

/**
 * Pre-built keyword sets for each domain. Used by detectDomain() and for
 * building initial domain profiles. Keys map directly to DomainType.
 */
const DOMAIN_KEYWORDS: Record<DomainType, string[]> = {
  frontend: [
    'react', 'vue', 'angular', 'css', 'html', 'dom', 'component', 'hook',
    'state', 'props', 'jsx', 'tsx', 'styling', 'responsive', 'browser',
    'webpack', 'vite', 'sass', 'less', 'tailwind', 'bootstrap', 'svelte',
    'nextjs', 'nuxt', 'gatsby', 'layout', 'animation', 'flexbox', 'grid',
    'spa', 'ssr', 'hydration', 'virtual', 'render', 'redux', 'zustand',
    'pinia', 'material', 'chakra', 'styled', 'emotion', 'accessibility',
  ],
  backend: [
    'express', 'django', 'flask', 'spring', 'api', 'rest', 'graphql',
    'middleware', 'route', 'controller', 'server', 'endpoint', 'fastapi',
    'nestjs', 'rails', 'laravel', 'gin', 'echo', 'koa', 'hapi',
    'microservice', 'gateway', 'grpc', 'websocket', 'queue', 'worker',
    'cron', 'payload', 'handler', 'service', 'repository', 'serializer',
    'validator', 'interceptor', 'pipe', 'guard', 'resolver',
  ],
  database: [
    'sql', 'query', 'table', 'index', 'join', 'transaction', 'schema',
    'migration', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite',
    'orm', 'prisma', 'sequelize', 'typeorm', 'knex', 'drizzle',
    'nosql', 'cassandra', 'dynamo', 'firestore', 'supabase',
    'aggregate', 'cursor', 'shard', 'replica', 'partition', 'column',
    'row', 'foreign', 'primary', 'constraint', 'normalize', 'denormalize',
  ],
  devops: [
    'docker', 'kubernetes', 'ci', 'cd', 'pipeline', 'deploy', 'terraform',
    'ansible', 'nginx', 'monitoring', 'prometheus', 'grafana', 'helm',
    'container', 'pod', 'cluster', 'registry', 'artifact', 'jenkins',
    'github', 'gitlab', 'actions', 'workflow', 'yaml', 'config',
    'load', 'balancer', 'proxy', 'ssl', 'cert', 'dns', 'vpc',
    'subnet', 'firewall', 'scaling', 'autoscale', 'rollback', 'canary',
  ],
  ai_ml: [
    'neural', 'model', 'training', 'dataset', 'tensor', 'gradient',
    'loss', 'epoch', 'transformer', 'embedding', 'attention', 'layer',
    'weight', 'bias', 'activation', 'backpropagation', 'optimizer',
    'batch', 'dropout', 'regularization', 'convolution', 'recurrent',
    'lstm', 'gru', 'bert', 'gpt', 'diffusion', 'gan', 'vae',
    'classification', 'regression', 'clustering', 'reinforcement',
    'inference', 'finetune', 'pretrain', 'tokenizer', 'llm', 'rag',
  ],
  mobile: [
    'ios', 'android', 'swift', 'kotlin', 'react-native', 'flutter',
    'app', 'screen', 'navigation', 'gesture', 'touch', 'native',
    'xcode', 'gradle', 'cocoapods', 'dart', 'widget', 'platform',
    'notification', 'push', 'deeplink', 'intent', 'activity',
    'fragment', 'storyboard', 'swiftui', 'compose', 'expo',
    'capacitor', 'cordova', 'webview', 'simulator', 'emulator',
  ],
  security: [
    'auth', 'token', 'jwt', 'oauth', 'encryption', 'hash',
    'vulnerability', 'xss', 'csrf', 'injection', 'sanitize',
    'firewall', 'cors', 'ssl', 'tls', 'certificate', 'permission',
    'role', 'rbac', 'abac', 'session', 'cookie', 'password',
    'bcrypt', 'argon', 'hmac', 'rsa', 'aes', 'cipher',
    'audit', 'compliance', 'penetration', 'exploit', 'patch',
    'privilege', 'escalation', 'sandbox', 'isolation',
  ],
  systems: [
    'process', 'thread', 'memory', 'cpu', 'kernel', 'socket',
    'filesystem', 'os', 'binary', 'syscall', 'ipc', 'pipe',
    'signal', 'mutex', 'semaphore', 'deadlock', 'race',
    'heap', 'stack', 'cache', 'mmap', 'interrupt', 'driver',
    'register', 'assembly', 'linker', 'loader', 'elf',
    'network', 'tcp', 'udp', 'epoll', 'io', 'async',
    'concurrency', 'parallelism', 'scheduler', 'allocator',
  ],
  general: [],
}

/** Flattened set of all domain keywords for quick membership test. */
const ALL_DOMAIN_KEYWORDS = new Set(
  Object.values(DOMAIN_KEYWORDS).flat()
)

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  HELPERS — Tokenization and vector operations                           ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Tokenization ─────────────────────────────────────────────────────────────

/** Tokenize text into lowercase words, filtering stop words and short tokens. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w))
}

// ── Vector Operations ────────────────────────────────────────────────────────

/** L2-normalize a vector in place, returning it. Returns zero vector if norm is 0. */
function normalizeVector(vec: number[]): number[] {
  let norm = 0
  for (let i = 0; i < vec.length; i++) {
    norm += vec[i] * vec[i]
  }
  norm = Math.sqrt(norm)
  if (norm === 0) return vec
  for (let i = 0; i < vec.length; i++) {
    vec[i] /= norm
  }
  return vec
}

/** Cosine similarity between two dense vectors. Returns value in [0, 1]. */
function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length)
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  if (denom === 0) return 0
  return Math.max(0, Math.min(1, dot / denom))
}

/**
 * Create a context vector for a set of words by averaging known vectors
 * and adding small random noise for unknown words.
 */
function createContextVector(
  words: string[],
  existingVocab: Map<string, VocabularyEntry>,
  dimensions = DEFAULT_DIMENSIONS,
): number[] {
  const vec = new Array<number>(dimensions).fill(0)
  let knownCount = 0

  for (const word of words) {
    const entry = existingVocab.get(word)
    if (entry) {
      for (let i = 0; i < dimensions; i++) {
        vec[i] += entry.vector[i]
      }
      knownCount++
    }
  }

  if (knownCount > 0) {
    // Average the known vectors
    for (let i = 0; i < dimensions; i++) {
      vec[i] /= knownCount
    }
  }

  // Add small noise so the vector is never all-zero
  const seed = words.join('').length
  for (let i = 0; i < dimensions; i++) {
    const noise = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 - 0.5
    vec[i] += noise * 0.05
  }

  return normalizeVector(vec)
}

/** Move vecA closer to vecB by the given rate (0-1). Mutates vecA in place. */
function moveCloser(vecA: number[], vecB: number[], rate: number): void {
  for (let i = 0; i < vecA.length; i++) {
    vecA[i] += rate * (vecB[i] - vecA[i])
  }
}

/** Move vecA away from vecB by the given rate (0-1). Mutates vecA in place. */
function moveApart(vecA: number[], vecB: number[], rate: number): void {
  for (let i = 0; i < vecA.length; i++) {
    vecA[i] -= rate * (vecB[i] - vecA[i])
  }
}

/** Generate a unique ID from a prefix and the current timestamp. */
function generateId(prefix: string): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${ts}_${rand}`
}

/** Build an empty domain weight record with all domains set to a given value. */
function emptyDomainRecord(value: number): Record<DomainType, number> {
  const rec = {} as Record<DomainType, number>
  for (const d of ALL_DOMAINS) {
    rec[d] = value
  }
  return rec
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4  SEMANTIC TRAINER CLASS                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Active training loop for the semantic system.
 *
 * Learns new vocabulary from text, adjusts embeddings based on feedback,
 * detects and adapts to user domains, and supports contrastive learning
 * with full snapshot/rollback history.
 *
 * @example
 * ```ts
 * const trainer = new SemanticTrainer()
 * trainer.learnFromText('React hooks simplify state management', 'frontend')
 * trainer.learnFromText('Kubernetes pods scale horizontally', 'devops')
 *
 * const domain = trainer.detectDomain('deploy docker container to cluster')
 * // 'devops'
 *
 * trainer.createSnapshot('after initial training')
 * ```
 */
export class SemanticTrainer {
  private config: SemanticTrainerConfig
  private vocabulary: Map<string, VocabularyEntry> = new Map()      // word → entry
  private examples: TrainingExample[] = []                          // all training examples
  private feedbackHistory: FeedbackSignal[] = []                    // all feedback signals
  private snapshots: TrainingSnapshot[] = []                        // saved states
  private snapshotVocabularies: Map<string, Map<string, VocabularyEntry>> = new Map()
  private snapshotDomainWeights: Map<string, Record<DomainType, number>> = new Map()
  private domainWeights: Record<DomainType, number>                 // domain → current weight
  private domainExampleCounts: Record<DomainType, number>           // domain → example count
  private domainLastSeen: Record<DomainType, number>                // domain → last seen timestamp
  private currentDomain: DomainType = 'general'
  private vocabularyExpansions = 0
  private dimensions: number

  constructor(config?: Partial<SemanticTrainerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.dimensions = DEFAULT_DIMENSIONS
    this.domainWeights = emptyDomainRecord(1.0)
    this.domainExampleCounts = emptyDomainRecord(0)
    this.domainLastSeen = emptyDomainRecord(0)
  }

  // ── Vocabulary Expansion ─────────────────────────────────────────────────

  /**
   * Learn new vocabulary from a text sample. Tokenizes text, identifies new
   * words not yet in the vocabulary, and creates vectors for them by
   * averaging context window vectors with noise.
   *
   * @param text The text to learn from.
   * @param domain Optional domain label for the text.
   * @returns Number of new words added to the vocabulary.
   */
  learnFromText(text: string, domain?: DomainType): number {
    const tokens = tokenize(text)
    if (tokens.length === 0) return 0

    const resolvedDomain = domain ?? this.detectDomain(text)
    let newWords = 0

    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i]

      if (this.vocabulary.has(word)) {
        // Update existing entry: bump frequency and add domain
        const entry = this.vocabulary.get(word)!
        entry.frequency++
        if (!entry.domains.includes(resolvedDomain)) {
          entry.domains.push(resolvedDomain)
        }
        continue
      }

      // Enforce vocabulary limit
      if (this.vocabulary.size >= this.config.maxVocabulary) continue

      // Build context window: up to 3 words on each side
      const windowStart = Math.max(0, i - 3)
      const windowEnd = Math.min(tokens.length, i + 4)
      const contextWords = tokens.slice(windowStart, windowEnd).filter(w => w !== word)

      const vector = createContextVector(contextWords, this.vocabulary, this.dimensions)

      this.vocabulary.set(word, {
        word,
        vector,
        frequency: 1,
        domains: [resolvedDomain],
        learnedAt: Date.now(),
      })
      newWords++
    }

    if (newWords > 0) {
      this.vocabularyExpansions++
    }

    // Record the example
    const example: TrainingExample = {
      id: generateId('ex'),
      text,
      domain: resolvedDomain,
      timestamp: Date.now(),
    }
    this.examples.push(example)

    // Update domain tracking
    this.domainExampleCounts[resolvedDomain]++
    this.domainLastSeen[resolvedDomain] = Date.now()
    this.currentDomain = resolvedDomain

    return newWords
  }

  /** Return all learned vocabulary entries. */
  getVocabulary(): VocabularyEntry[] {
    return Array.from(this.vocabulary.values())
  }

  /** Number of words currently in the learned vocabulary. */
  getVocabularySize(): number {
    return this.vocabulary.size
  }

  /** Check if a word exists in the learned vocabulary. */
  hasWord(word: string): boolean {
    return this.vocabulary.has(word.toLowerCase())
  }

  // ── Embedding Fine-Tuning ────────────────────────────────────────────────

  /**
   * Adjust the similarity between two words by moving their vectors
   * closer or farther apart using gradient-like updates.
   *
   * @param wordA First word.
   * @param wordB Second word.
   * @param targetSimilarity Desired cosine similarity (0-1).
   * @returns true if adjustment was made, false if either word is unknown.
   */
  adjustSimilarity(wordA: string, wordB: string, targetSimilarity: number): boolean {
    const entryA = this.vocabulary.get(wordA.toLowerCase())
    const entryB = this.vocabulary.get(wordB.toLowerCase())
    if (!entryA || !entryB) return false

    const currentSim = cosineSimilarity(entryA.vector, entryB.vector)
    const error = targetSimilarity - currentSim
    const step = error * this.config.learningRate

    if (step > 0) {
      // Need to increase similarity: move closer
      moveCloser(entryA.vector, entryB.vector, Math.abs(step))
      moveCloser(entryB.vector, entryA.vector, Math.abs(step))
    } else {
      // Need to decrease similarity: move apart
      moveApart(entryA.vector, entryB.vector, Math.abs(step))
      moveApart(entryB.vector, entryA.vector, Math.abs(step))
    }

    // Re-normalize after adjustment
    normalizeVector(entryA.vector)
    normalizeVector(entryB.vector)

    return true
  }

  /**
   * Apply a feedback signal to adjust embeddings. Positive/similarity signals
   * pull source and target closer; negative/dissimilarity signals push apart.
   *
   * @param signal The feedback signal to apply.
   */
  applyFeedback(signal: FeedbackSignal): void {
    this.feedbackHistory.push(signal)

    const sourceTokens = tokenize(signal.sourceText)
    const targetTokens = signal.targetText ? tokenize(signal.targetText) : []

    const rate = signal.strength * this.config.learningRate

    if (signal.type === 'positive' || signal.type === 'similarity') {
      // Pull source tokens and target tokens closer together
      for (const sw of sourceTokens) {
        for (const tw of targetTokens) {
          const entryS = this.vocabulary.get(sw)
          const entryT = this.vocabulary.get(tw)
          if (entryS && entryT) {
            moveCloser(entryS.vector, entryT.vector, rate)
            normalizeVector(entryS.vector)
          }
        }
      }
    } else {
      // Push source tokens and target tokens apart
      for (const sw of sourceTokens) {
        for (const tw of targetTokens) {
          const entryS = this.vocabulary.get(sw)
          const entryT = this.vocabulary.get(tw)
          if (entryS && entryT) {
            moveApart(entryS.vector, entryT.vector, rate)
            normalizeVector(entryS.vector)
          }
        }
      }
    }
  }

  /** Get all recorded feedback signals. */
  getFeedbackHistory(): FeedbackSignal[] {
    return [...this.feedbackHistory]
  }

  // ── Domain Adaptation ────────────────────────────────────────────────────

  /**
   * Classify text into a domain based on keyword matching against the
   * domain keyword dictionaries. Returns the best-matching domain.
   *
   * @param text The text to classify.
   * @returns The detected domain type.
   */
  detectDomain(text: string): DomainType {
    const tokens = tokenize(text)
    if (tokens.length === 0) return 'general'

    const scores = emptyDomainRecord(0)

    for (const token of tokens) {
      // Skip tokens that aren't in any domain dictionary
      if (!ALL_DOMAIN_KEYWORDS.has(token)) continue
      for (const domain of ALL_DOMAINS) {
        if (domain === 'general') continue
        const keywords = DOMAIN_KEYWORDS[domain]
        if (keywords.includes(token)) {
          scores[domain] += this.domainWeights[domain]
        }
      }
    }

    // Find the domain with the highest score
    let bestDomain: DomainType = 'general'
    let bestScore = 0

    for (const domain of ALL_DOMAINS) {
      if (domain === 'general') continue
      if (scores[domain] > bestScore) {
        bestScore = scores[domain]
        bestDomain = domain
      }
    }

    return bestDomain
  }

  /**
   * Get the profile for a specific domain, including weight, example
   * count, last-seen timestamp, and top terms.
   *
   * @param domain The domain to retrieve.
   */
  getDomainProfile(domain: DomainType): DomainProfile {
    // Collect top terms: words in the vocabulary belonging to this domain
    const domainWords: { word: string; freq: number }[] = []
    for (const entry of this.vocabulary.values()) {
      if (entry.domains.includes(domain)) {
        domainWords.push({ word: entry.word, freq: entry.frequency })
      }
    }
    domainWords.sort((a, b) => b.freq - a.freq)
    const topTerms = domainWords.slice(0, 10).map(w => w.word)

    return {
      domain,
      weight: this.domainWeights[domain],
      exampleCount: this.domainExampleCounts[domain],
      lastSeen: this.domainLastSeen[domain],
      topTerms,
    }
  }

  /** Get profiles for all domains. */
  getDomainProfiles(): DomainProfile[] {
    return ALL_DOMAINS.map(d => this.getDomainProfile(d))
  }

  /** Get the most recently active domain. */
  getCurrentDomain(): DomainType {
    return this.currentDomain
  }

  /**
   * Temporarily boost a domain's weight for better relevance in
   * similarity scoring and domain detection.
   *
   * @param domain The domain to boost.
   */
  boostDomain(domain: DomainType): void {
    this.domainWeights[domain] *= this.config.domainBoostFactor
    this.currentDomain = domain
  }

  // ── Contrastive Learning ─────────────────────────────────────────────────

  /**
   * Triplet-loss style contrastive learning. Adjusts vectors so the anchor
   * is pulled closer to the positive example and pushed away from the
   * optional negative example.
   *
   * @param anchor The reference text.
   * @param positive Text that should be similar to anchor.
   * @param negative Optional text that should be dissimilar to anchor.
   */
  learnContrastive(anchor: string, positive: string, negative?: string): void {
    const anchorTokens = tokenize(anchor)
    const positiveTokens = tokenize(positive)
    const negativeTokens = negative ? tokenize(negative) : []

    const rate = this.config.learningRate

    // Ensure all tokens are in the vocabulary
    this.ensureTokensLearned(anchorTokens)
    this.ensureTokensLearned(positiveTokens)
    if (negativeTokens.length > 0) {
      this.ensureTokensLearned(negativeTokens)
    }

    // Build aggregate vectors
    const anchorVec = this.aggregateTokenVectors(anchorTokens)
    const positiveVec = this.aggregateTokenVectors(positiveTokens)
    if (!anchorVec || !positiveVec) return

    const posSim = cosineSimilarity(anchorVec, positiveVec)

    // If we have a negative, compute the contrastive margin
    let negSim = 0
    let negativeVec: number[] | null = null
    if (negativeTokens.length > 0) {
      negativeVec = this.aggregateTokenVectors(negativeTokens)
      if (negativeVec) {
        negSim = cosineSimilarity(anchorVec, negativeVec)
      }
    }

    // Only update if the margin constraint is violated:
    // posSim - negSim < margin
    const margin = this.config.contrastiveMargin
    if (negativeVec && (posSim - negSim) >= margin) return

    // Pull anchor tokens closer to positive tokens
    for (const aw of anchorTokens) {
      for (const pw of positiveTokens) {
        const entryA = this.vocabulary.get(aw)
        const entryP = this.vocabulary.get(pw)
        if (entryA && entryP) {
          moveCloser(entryA.vector, entryP.vector, rate)
          normalizeVector(entryA.vector)
        }
      }
    }

    // Push anchor tokens away from negative tokens
    if (negativeVec) {
      for (const aw of anchorTokens) {
        for (const nw of negativeTokens) {
          const entryA = this.vocabulary.get(aw)
          const entryN = this.vocabulary.get(nw)
          if (entryA && entryN) {
            moveApart(entryA.vector, entryN.vector, rate)
            normalizeVector(entryA.vector)
          }
        }
      }
    }

    // Record as feedback
    this.feedbackHistory.push({
      type: 'similarity',
      sourceText: anchor,
      targetText: positive,
      strength: rate,
      timestamp: Date.now(),
    })

    if (negative) {
      this.feedbackHistory.push({
        type: 'dissimilarity',
        sourceText: anchor,
        targetText: negative,
        strength: rate,
        timestamp: Date.now(),
      })
    }
  }

  // ── Training History / Rollback ──────────────────────────────────────────

  /**
   * Save the current trainer state as a named snapshot. Snapshots can be
   * used to rollback the vocabulary and domain weights to a previous point.
   *
   * @param description Optional description for the snapshot.
   * @returns The created snapshot.
   */
  createSnapshot(description?: string): TrainingSnapshot {
    // Enforce max snapshots — remove oldest if at capacity
    while (this.snapshots.length >= this.config.maxSnapshots) {
      const removed = this.snapshots.shift()
      if (removed) {
        this.snapshotVocabularies.delete(removed.id)
        this.snapshotDomainWeights.delete(removed.id)
      }
    }

    const id = generateId('snap')
    const snapshot: TrainingSnapshot = {
      id,
      timestamp: Date.now(),
      vocabularySize: this.vocabulary.size,
      domainWeights: { ...this.domainWeights },
      description: description ?? `Snapshot at ${new Date().toISOString()}`,
    }

    // Deep-copy the vocabulary
    const vocabCopy = new Map<string, VocabularyEntry>()
    for (const [word, entry] of this.vocabulary) {
      vocabCopy.set(word, {
        ...entry,
        vector: [...entry.vector],
        domains: [...entry.domains],
      })
    }
    this.snapshotVocabularies.set(id, vocabCopy)
    this.snapshotDomainWeights.set(id, { ...this.domainWeights })

    this.snapshots.push(snapshot)
    return snapshot
  }

  /** List all saved snapshots. */
  getSnapshots(): TrainingSnapshot[] {
    return [...this.snapshots]
  }

  /**
   * Restore the trainer state from a previously saved snapshot.
   *
   * @param snapshotId The ID of the snapshot to restore.
   * @returns true if rollback succeeded, false if snapshot not found.
   */
  rollback(snapshotId: string): boolean {
    const snapshot = this.snapshots.find(s => s.id === snapshotId)
    if (!snapshot) return false

    const savedVocab = this.snapshotVocabularies.get(snapshotId)
    const savedWeights = this.snapshotDomainWeights.get(snapshotId)
    if (!savedVocab || !savedWeights) return false

    // Restore vocabulary with deep copy
    this.vocabulary.clear()
    for (const [word, entry] of savedVocab) {
      this.vocabulary.set(word, {
        ...entry,
        vector: [...entry.vector],
        domains: [...entry.domains],
      })
    }

    // Restore domain weights
    this.domainWeights = { ...savedWeights }

    return true
  }

  /** Get the most recent snapshot, or null if none exist. */
  getLatestSnapshot(): TrainingSnapshot | null {
    if (this.snapshots.length === 0) return null
    return this.snapshots[this.snapshots.length - 1]
  }

  // ── Stats & Persistence ──────────────────────────────────────────────────

  /** Return aggregate statistics for the trainer. */
  getStats(): TrainerStats {
    const domainDistribution = emptyDomainRecord(0)
    for (const example of this.examples) {
      domainDistribution[example.domain]++
    }

    return {
      totalExamples: this.examples.length,
      totalFeedback: this.feedbackHistory.length,
      vocabularyExpansions: this.vocabularyExpansions,
      snapshotCount: this.snapshots.length,
      currentDomain: this.currentDomain,
      domainDistribution,
    }
  }

  /** Serialize the entire trainer state to a JSON string. */
  serialize(): string {
    const vocabArray: VocabularyEntry[] = []
    for (const entry of this.vocabulary.values()) {
      vocabArray.push(entry)
    }

    const snapshotData: Array<{
      snapshot: TrainingSnapshot
      vocabulary: VocabularyEntry[]
      weights: Record<DomainType, number>
    }> = []

    for (const snapshot of this.snapshots) {
      const savedVocab = this.snapshotVocabularies.get(snapshot.id)
      const savedWeights = this.snapshotDomainWeights.get(snapshot.id)
      snapshotData.push({
        snapshot,
        vocabulary: savedVocab ? Array.from(savedVocab.values()) : [],
        weights: savedWeights ?? emptyDomainRecord(1.0),
      })
    }

    return JSON.stringify({
      version: 1,
      config: this.config,
      dimensions: this.dimensions,
      vocabulary: vocabArray,
      examples: this.examples,
      feedbackHistory: this.feedbackHistory,
      domainWeights: this.domainWeights,
      domainExampleCounts: this.domainExampleCounts,
      domainLastSeen: this.domainLastSeen,
      currentDomain: this.currentDomain,
      vocabularyExpansions: this.vocabularyExpansions,
      snapshots: snapshotData,
    })
  }

  /**
   * Restore a SemanticTrainer from a previously serialized JSON string.
   *
   * @param json The JSON string produced by serialize().
   * @returns A fully restored SemanticTrainer instance.
   */
  static deserialize(json: string): SemanticTrainer {
    const data = JSON.parse(json)
    const trainer = new SemanticTrainer(data.config)

    trainer.dimensions = data.dimensions ?? DEFAULT_DIMENSIONS
    trainer.currentDomain = data.currentDomain ?? 'general'
    trainer.vocabularyExpansions = data.vocabularyExpansions ?? 0

    // Restore vocabulary
    if (Array.isArray(data.vocabulary)) {
      for (const entry of data.vocabulary) {
        trainer.vocabulary.set(entry.word, {
          word: entry.word,
          vector: [...entry.vector],
          frequency: entry.frequency,
          domains: [...entry.domains],
          learnedAt: entry.learnedAt,
        })
      }
    }

    // Restore examples
    if (Array.isArray(data.examples)) {
      trainer.examples = data.examples.map((e: TrainingExample) => ({ ...e }))
    }

    // Restore feedback history
    if (Array.isArray(data.feedbackHistory)) {
      trainer.feedbackHistory = data.feedbackHistory.map((f: FeedbackSignal) => ({ ...f }))
    }

    // Restore domain state
    if (data.domainWeights) {
      trainer.domainWeights = { ...data.domainWeights }
    }
    if (data.domainExampleCounts) {
      trainer.domainExampleCounts = { ...data.domainExampleCounts }
    }
    if (data.domainLastSeen) {
      trainer.domainLastSeen = { ...data.domainLastSeen }
    }

    // Restore snapshots
    if (Array.isArray(data.snapshots)) {
      for (const snapData of data.snapshots) {
        const snapshot: TrainingSnapshot = { ...snapData.snapshot }
        trainer.snapshots.push(snapshot)

        // Restore snapshot vocabulary
        const vocabMap = new Map<string, VocabularyEntry>()
        if (Array.isArray(snapData.vocabulary)) {
          for (const entry of snapData.vocabulary) {
            vocabMap.set(entry.word, {
              word: entry.word,
              vector: [...entry.vector],
              frequency: entry.frequency,
              domains: [...entry.domains],
              learnedAt: entry.learnedAt,
            })
          }
        }
        trainer.snapshotVocabularies.set(snapshot.id, vocabMap)
        trainer.snapshotDomainWeights.set(
          snapshot.id,
          snapData.weights ? { ...snapData.weights } : emptyDomainRecord(1.0),
        )
      }
    }

    return trainer
  }

  /** Clear all learned data, resetting the trainer to its initial state. */
  reset(): void {
    this.vocabulary.clear()
    this.examples = []
    this.feedbackHistory = []
    this.snapshots = []
    this.snapshotVocabularies.clear()
    this.snapshotDomainWeights.clear()
    this.domainWeights = emptyDomainRecord(1.0)
    this.domainExampleCounts = emptyDomainRecord(0)
    this.domainLastSeen = emptyDomainRecord(0)
    this.currentDomain = 'general'
    this.vocabularyExpansions = 0
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  /**
   * Ensure all tokens exist in the vocabulary. Tokens that are missing
   * get learned with context-based vectors.
   */
  private ensureTokensLearned(tokens: string[]): void {
    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i]
      if (this.vocabulary.has(word)) continue
      if (this.vocabulary.size >= this.config.maxVocabulary) continue

      const windowStart = Math.max(0, i - 3)
      const windowEnd = Math.min(tokens.length, i + 4)
      const contextWords = tokens.slice(windowStart, windowEnd).filter(w => w !== word)

      const vector = createContextVector(contextWords, this.vocabulary, this.dimensions)

      this.vocabulary.set(word, {
        word,
        vector,
        frequency: 1,
        domains: ['general'],
        learnedAt: Date.now(),
      })
    }
  }

  /**
   * Compute an aggregate vector for a set of tokens by averaging their
   * individual learned vectors. Returns null if no tokens have vectors.
   */
  private aggregateTokenVectors(tokens: string[]): number[] | null {
    const vec = new Array<number>(this.dimensions).fill(0)
    let count = 0

    for (const token of tokens) {
      const entry = this.vocabulary.get(token)
      if (entry) {
        for (let i = 0; i < this.dimensions; i++) {
          vec[i] += entry.vector[i]
        }
        count++
      }
    }

    if (count === 0) return null

    for (let i = 0; i < this.dimensions; i++) {
      vec[i] /= count
    }

    return normalizeVector(vec)
  }
}
