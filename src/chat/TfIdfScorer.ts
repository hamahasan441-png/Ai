/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  TF-IDF Scorer — Semantic Similarity for Pattern Matching                    ║
 * ║                                                                              ║
 * ║  Implements Term Frequency–Inverse Document Frequency scoring with:          ║
 * ║    • TF-IDF vector computation for documents & queries                       ║
 * ║    • Cosine similarity between vectors                                       ║
 * ║    • N-gram (bigram + trigram) support for phrase matching                    ║
 * ║    • Incremental index updates (add/remove documents)                        ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline. Used by LocalBrain v2.             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ──

/** A document in the corpus with an ID and text content. */
export interface TfIdfDocument {
  id: string
  text: string
}

/** Result of scoring a query against the corpus. */
export interface TfIdfResult {
  id: string
  score: number
  tfidfScore: number
  ngramScore: number
}

// ── Tokenization ──

/** Common English stop words to filter out. */
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

/** Tokenize text into lowercase words, filtering stop words and short tokens. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w))
}

/** Generate n-grams from tokens. */
export function generateNgrams(tokens: string[], n: number): string[] {
  const ngrams: string[] = []
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '))
  }
  return ngrams
}

/** Generate bigrams and trigrams from text. */
export function getNgrams(text: string): string[] {
  const tokens = tokenize(text)
  return [
    ...generateNgrams(tokens, 2),
    ...generateNgrams(tokens, 3),
  ]
}

// ── TF-IDF Core ──

/** Compute term frequency for a list of tokens. */
export function computeTf(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>()
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1)
  }
  // Normalize by document length
  const len = tokens.length || 1
  for (const [term, count] of tf) {
    tf.set(term, count / len)
  }
  return tf
}

/** Compute inverse document frequency for a term across the corpus. */
function computeIdf(term: string, documentTokens: Map<string, string[]>): number {
  const totalDocs = documentTokens.size || 1
  let docsWithTerm = 0
  for (const tokens of documentTokens.values()) {
    if (tokens.includes(term)) {
      docsWithTerm++
    }
  }
  // Smoothed IDF: log((N + 1) / (df + 1)) + 1
  return Math.log((totalDocs + 1) / (docsWithTerm + 1)) + 1
}

/** Compute cosine similarity between two sparse vectors (Maps). */
export function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (const [term, weightA] of a) {
    const weightB = b.get(term) ?? 0
    dotProduct += weightA * weightB
    normA += weightA * weightA
  }

  for (const weightB of b.values()) {
    normB += weightB * weightB
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  return denominator === 0 ? 0 : dotProduct / denominator
}

/** Compute n-gram overlap score between two texts. */
export function ngramOverlapScore(text1: string, text2: string): number {
  const ngrams1 = new Set(getNgrams(text1))
  const ngrams2 = new Set(getNgrams(text2))

  if (ngrams1.size === 0 || ngrams2.size === 0) return 0

  let overlap = 0
  for (const ng of ngrams1) {
    if (ngrams2.has(ng)) overlap++
  }

  // Jaccard-style: overlap / union
  const union = new Set([...ngrams1, ...ngrams2]).size
  return union === 0 ? 0 : overlap / union
}

// ── TfIdfScorer Class ──

/**
 * TF-IDF scoring engine for pattern matching.
 *
 * @example
 * ```ts
 * const scorer = new TfIdfScorer()
 * scorer.addDocument({ id: 'p1', text: 'How to sort an array in Python' })
 * scorer.addDocument({ id: 'p2', text: 'JavaScript async await tutorial' })
 *
 * const results = scorer.score('sort array python')
 * // [{ id: 'p1', score: 0.85, tfidfScore: 0.9, ngramScore: 0.7 }]
 * ```
 */
export class TfIdfScorer {
  private documents: Map<string, string> = new Map()        // id → original text
  private documentTokens: Map<string, string[]> = new Map() // id → tokens
  private idfCache: Map<string, number> = new Map()         // term → IDF (invalidated on add/remove)
  private dirty = true

  /** Number of documents in the corpus. */
  get size(): number {
    return this.documents.size
  }

  /** Add a document to the corpus. */
  addDocument(doc: TfIdfDocument): void {
    this.documents.set(doc.id, doc.text)
    this.documentTokens.set(doc.id, tokenize(doc.text))
    this.dirty = true
  }

  /** Remove a document from the corpus. */
  removeDocument(id: string): void {
    this.documents.delete(id)
    this.documentTokens.delete(id)
    this.dirty = true
  }

  /** Check if a document exists in the corpus. */
  hasDocument(id: string): boolean {
    return this.documents.has(id)
  }

  /** Clear all documents. */
  clear(): void {
    this.documents.clear()
    this.documentTokens.clear()
    this.idfCache.clear()
    this.dirty = false
  }

  /** Rebuild IDF cache if corpus has changed. */
  private rebuildIdfCache(): void {
    if (!this.dirty) return
    this.idfCache.clear()

    // Collect all unique terms
    const allTerms = new Set<string>()
    for (const tokens of this.documentTokens.values()) {
      for (const t of tokens) allTerms.add(t)
    }

    // Compute IDF for each term
    for (const term of allTerms) {
      this.idfCache.set(term, computeIdf(term, this.documentTokens))
    }

    this.dirty = false
  }

  /** Compute TF-IDF vector for a set of tokens. */
  private computeTfIdfVector(tokens: string[]): Map<string, number> {
    this.rebuildIdfCache()

    const tf = computeTf(tokens)
    const tfidf = new Map<string, number>()

    for (const [term, tfVal] of tf) {
      const idf = this.idfCache.get(term) ?? Math.log(this.documents.size + 1) + 1
      tfidf.set(term, tfVal * idf)
    }

    return tfidf
  }

  /**
   * Score a query against all documents in the corpus.
   *
   * Returns results sorted by combined score (descending).
   * Combined score = 0.5 * tfidfScore + 0.5 * ngramScore
   *
   * @param query The query text to match.
   * @param limit Maximum number of results to return.
   * @param minScore Minimum combined score threshold (default: 0.01).
   */
  score(query: string, limit = 10, minScore = 0.01): TfIdfResult[] {
    const queryTokens = tokenize(query)
    const queryVector = this.computeTfIdfVector(queryTokens)

    const results: TfIdfResult[] = []

    for (const [id, docTokens] of this.documentTokens) {
      const docVector = this.computeTfIdfVector(docTokens)
      const tfidfScore = cosineSimilarity(queryVector, docVector)
      const ngramScore = ngramOverlapScore(query, this.documents.get(id) ?? '')

      const combinedScore = 0.5 * tfidfScore + 0.5 * ngramScore

      if (combinedScore >= minScore) {
        results.push({ id, score: combinedScore, tfidfScore, ngramScore })
      }
    }

    results.sort((a, b) => b.score - a.score)
    return results.slice(0, limit)
  }

  /**
   * Score a single query against a single document (not in corpus).
   * Useful for ad-hoc comparison without adding to the index.
   */
  scorePair(query: string, documentText: string): { tfidfScore: number; ngramScore: number; score: number } {
    const queryTokens = tokenize(query)
    const docTokens = tokenize(documentText)

    const queryTf = computeTf(queryTokens)
    const docTf = computeTf(docTokens)

    // Simple TF-based cosine (no IDF since single document)
    const tfidfScore = cosineSimilarity(queryTf, docTf)
    const ngramScore = ngramOverlapScore(query, documentText)
    const score = 0.5 * tfidfScore + 0.5 * ngramScore

    return { tfidfScore, ngramScore, score }
  }
}
