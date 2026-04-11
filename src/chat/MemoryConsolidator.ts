/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  MemoryConsolidator — Bridges session memory → long-term semantic graph     ║
 * ║                                                                            ║
 * ║  Provides the missing memory layer that transfers important session turns   ║
 * ║  into the persistent SemanticMemory knowledge graph, with conflict          ║
 * ║  resolution and retrieval-augmented context building.                       ║
 * ║                                                                            ║
 * ║  No external dependencies.                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** A single turn from session memory eligible for consolidation. */
export interface SessionTurn {
  readonly role: 'user' | 'assistant'
  readonly content: string
  readonly timestamp: number
}

/** A memory entry stored in the long-term layer. */
export interface LongTermEntry {
  readonly id: string
  readonly content: string
  readonly keywords: readonly string[]
  readonly source: 'session' | 'learned' | 'external'
  readonly confidence: number
  readonly createdAt: number
  readonly lastAccessedAt: number
  accessCount: number
}

/** Result of a retrieval query against long-term memory. */
export interface RetrievalResult {
  readonly entry: LongTermEntry
  readonly relevanceScore: number
  readonly matchedKeywords: readonly string[]
}

/** Configuration for memory consolidation. */
export interface MemoryConsolidatorConfig {
  /** Minimum turn length (chars) to consider for consolidation. */
  readonly minTurnLength: number
  /** Minimum keyword overlap to merge entries instead of adding new ones. */
  readonly mergeThreshold: number
  /** Max entries in long-term store before eviction. */
  readonly maxEntries: number
  /** Confidence decay rate per day for unused entries. */
  readonly decayRatePerDay: number
  /** Minimum confidence before eviction. */
  readonly minConfidence: number
  /** Maximum results per retrieval query. */
  readonly maxRetrievalResults: number
}

/** Conflict detected between two memory entries. */
export interface MemoryConflict {
  readonly existingEntry: LongTermEntry
  readonly newContent: string
  readonly overlapKeywords: readonly string[]
  readonly resolution: 'merged' | 'replaced' | 'kept_existing' | 'added_both'
}

/** Stats for the consolidator. */
export interface ConsolidatorStats {
  readonly totalEntries: number
  readonly totalConsolidations: number
  readonly totalRetrievals: number
  readonly totalConflicts: number
  readonly averageConfidence: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_CONSOLIDATOR_CONFIG: MemoryConsolidatorConfig = {
  minTurnLength: 20,
  mergeThreshold: 0.6,
  maxEntries: 500,
  decayRatePerDay: 0.005,
  minConfidence: 0.1,
  maxRetrievalResults: 10,
}

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'shall',
  'can',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'and',
  'but',
  'or',
  'nor',
  'not',
  'so',
  'yet',
  'both',
  'either',
  'neither',
  'each',
  'every',
  'all',
  'any',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'only',
  'own',
  'same',
  'than',
  'too',
  'very',
  'just',
  'because',
  'if',
  'when',
  'where',
  'how',
  'what',
  'which',
  'who',
  'whom',
  'this',
  'that',
  'these',
  'those',
  'i',
  'me',
  'my',
  'we',
  'our',
  'you',
  'your',
  'he',
  'him',
  'his',
  'she',
  'her',
  'it',
  'its',
  'they',
  'them',
  'their',
])

// ─── Helpers ───────────────────────────────────────────────────────────────────

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

function keywordOverlap(a: readonly string[], b: readonly string[]): string[] {
  const setB = new Set(b)
  return a.filter(k => setB.has(k))
}

function jaccardSimilarity(a: readonly string[], b: readonly string[]): number {
  if (a.length === 0 && b.length === 0) return 0
  const setA = new Set(a)
  const setB = new Set(b)
  let intersection = 0
  for (const k of setA) {
    if (setB.has(k)) intersection++
  }
  const union = new Set([...a, ...b]).size
  return union > 0 ? intersection / union : 0
}

// ─── MemoryConsolidator ────────────────────────────────────────────────────────

export class MemoryConsolidator {
  private readonly config: MemoryConsolidatorConfig
  private readonly entries: Map<string, LongTermEntry> = new Map()
  private consolidationCount = 0
  private retrievalCount = 0
  private conflictCount = 0
  private nextId = 1

  constructor(config: Partial<MemoryConsolidatorConfig> = {}) {
    this.config = { ...DEFAULT_CONSOLIDATOR_CONFIG, ...config }
  }

  // ── Consolidation ──────────────────────────────────────────────────────────

  /**
   * Consolidate session turns into long-term memory.
   * Filters short turns, extracts keywords, detects conflicts, and stores.
   * Returns list of conflicts encountered.
   */
  consolidate(turns: readonly SessionTurn[]): MemoryConflict[] {
    const conflicts: MemoryConflict[] = []

    // Only consolidate assistant turns that have substantive content
    const eligible = turns.filter(
      t => t.role === 'assistant' && t.content.length >= this.config.minTurnLength,
    )

    for (const turn of eligible) {
      const keywords = extractKeywords(turn.content)
      if (keywords.length === 0) continue

      // Check for conflicts with existing entries
      const conflict = this.detectConflict(turn.content, keywords)
      if (conflict) {
        conflicts.push(conflict)
        this.conflictCount++
      } else {
        this.addEntry(turn.content, keywords, 'session', 0.7)
      }
    }

    this.consolidationCount++
    return conflicts
  }

  /**
   * Add an entry directly to long-term memory (e.g., from learning).
   */
  addEntry(
    content: string,
    keywords: readonly string[],
    source: LongTermEntry['source'],
    confidence: number,
  ): string {
    // Evict lowest-confidence if at capacity
    if (this.entries.size >= this.config.maxEntries) {
      this.evictLowest()
    }

    const id = `ltm-${this.nextId++}`
    const entry: LongTermEntry = {
      id,
      content,
      keywords,
      source,
      confidence: Math.max(0, Math.min(1, confidence)),
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 0,
    }

    this.entries.set(id, entry)
    return id
  }

  // ── Retrieval ──────────────────────────────────────────────────────────────

  /**
   * Retrieve relevant long-term memories for a query.
   * Scores by keyword overlap + recency + access frequency.
   */
  retrieve(query: string, maxResults?: number): RetrievalResult[] {
    this.retrievalCount++
    const queryKeywords = extractKeywords(query)
    if (queryKeywords.length === 0) return []

    const limit = maxResults ?? this.config.maxRetrievalResults
    const results: RetrievalResult[] = []
    const now = Date.now()

    for (const entry of this.entries.values()) {
      const matched = keywordOverlap(queryKeywords, entry.keywords)
      if (matched.length === 0) continue

      // Keyword relevance (Jaccard similarity)
      const keywordScore = jaccardSimilarity(queryKeywords, entry.keywords)

      // Recency bonus (exponential decay, half-life ~7 days)
      const daysSinceAccess = (now - entry.lastAccessedAt) / (1000 * 60 * 60 * 24)
      const recencyBonus = Math.exp(-0.1 * daysSinceAccess)

      // Frequency bonus (log scale, capped)
      const frequencyBonus = Math.min(Math.log2(entry.accessCount + 1) * 0.1, 0.3)

      const relevanceScore = keywordScore * 0.6 + recencyBonus * 0.25 + frequencyBonus * 0.15

      results.push({ entry, relevanceScore, matchedKeywords: matched })
    }

    // Sort by relevance descending, take top N
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)
    const topResults = results.slice(0, limit)

    // Update access counts
    for (const r of topResults) {
      const mutable = this.entries.get(r.entry.id)
      if (mutable) {
        mutable.accessCount++
        // Update lastAccessedAt by creating new entry
        this.entries.set(r.entry.id, {
          ...mutable,
          lastAccessedAt: now,
        })
      }
    }

    return topResults
  }

  // ── Conflict Detection ─────────────────────────────────────────────────────

  private detectConflict(
    newContent: string,
    newKeywords: readonly string[],
  ): MemoryConflict | null {
    for (const existing of this.entries.values()) {
      const overlap = keywordOverlap(newKeywords, existing.keywords)
      const similarity = jaccardSimilarity(newKeywords, existing.keywords)

      if (similarity >= this.config.mergeThreshold) {
        // High overlap — merge or replace
        if (newContent.length > existing.content.length) {
          // New content is richer — replace
          this.entries.set(existing.id, {
            ...existing,
            content: newContent,
            keywords: [...new Set([...existing.keywords, ...newKeywords])],
            confidence: Math.min(1, existing.confidence + 0.1),
            lastAccessedAt: Date.now(),
          })
          return {
            existingEntry: existing,
            newContent,
            overlapKeywords: overlap,
            resolution: 'replaced',
          }
        } else {
          // Existing is richer — boost confidence
          this.entries.set(existing.id, {
            ...existing,
            confidence: Math.min(1, existing.confidence + 0.05),
            lastAccessedAt: Date.now(),
          })
          return {
            existingEntry: existing,
            newContent,
            overlapKeywords: overlap,
            resolution: 'kept_existing',
          }
        }
      }
    }

    return null
  }

  // ── Decay & Eviction ───────────────────────────────────────────────────────

  /**
   * Apply confidence decay to all entries. Evicts those below minimum.
   * Should be called periodically (e.g., once per session).
   */
  applyDecay(): number {
    const now = Date.now()
    let evicted = 0

    for (const [id, entry] of this.entries) {
      const daysSinceAccess = (now - entry.lastAccessedAt) / (1000 * 60 * 60 * 24)
      if (daysSinceAccess < 1) continue

      const newConfidence =
        entry.confidence * Math.exp(-this.config.decayRatePerDay * daysSinceAccess)

      if (newConfidence < this.config.minConfidence) {
        this.entries.delete(id)
        evicted++
      } else {
        this.entries.set(id, { ...entry, confidence: newConfidence })
      }
    }

    return evicted
  }

  private evictLowest(): void {
    let lowestId: string | null = null
    let lowestConfidence = Infinity

    for (const [id, entry] of this.entries) {
      if (entry.confidence < lowestConfidence) {
        lowestConfidence = entry.confidence
        lowestId = id
      }
    }

    if (lowestId) {
      this.entries.delete(lowestId)
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  serialize(): { entries: LongTermEntry[]; nextId: number } {
    return {
      entries: [...this.entries.values()],
      nextId: this.nextId,
    }
  }

  deserialize(data: { entries: LongTermEntry[]; nextId: number }): void {
    this.entries.clear()
    for (const entry of data.entries) {
      this.entries.set(entry.id, entry)
    }
    this.nextId = data.nextId
  }

  // ── Stats & Accessors ──────────────────────────────────────────────────────

  getStats(): ConsolidatorStats {
    let totalConfidence = 0
    for (const entry of this.entries.values()) {
      totalConfidence += entry.confidence
    }

    return {
      totalEntries: this.entries.size,
      totalConsolidations: this.consolidationCount,
      totalRetrievals: this.retrievalCount,
      totalConflicts: this.conflictCount,
      averageConfidence: this.entries.size > 0 ? totalConfidence / this.entries.size : 0,
    }
  }

  getEntry(id: string): LongTermEntry | undefined {
    return this.entries.get(id)
  }

  getAllEntries(): LongTermEntry[] {
    return [...this.entries.values()]
  }

  get entryCount(): number {
    return this.entries.size
  }

  clear(): void {
    this.entries.clear()
    this.consolidationCount = 0
    this.retrievalCount = 0
    this.conflictCount = 0
  }
}
