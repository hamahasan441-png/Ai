/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  ContextualMemoryEngine — Advanced contextual recall & relevance scoring    ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Context-Aware Storage — Store memories with rich context metadata      ║
 * ║    ✦ Relevance Scoring — Score memory relevance to current query            ║
 * ║    ✦ Memory Linking — Detect and link related memories                      ║
 * ║    ✦ Decay Model — Time-based relevance decay for natural forgetting       ║
 * ║    ✦ Importance Ranking — Prioritize important memories over trivial ones   ║
 * ║    ✦ Contextual Retrieval — Find memories by context similarity             ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface ContextMemory {
  id: string
  content: string
  context: MemoryContext
  importance: number // 0-1
  accessCount: number
  createdAt: number
  lastAccessedAt: number
  links: string[] // IDs of related memories
  tags: string[]
}

export interface MemoryContext {
  topic: string
  domain: string
  entities: string[]
  sentiment: number // -1 to 1
  keywords: string[]
}

export interface MemorySearchResult {
  memory: ContextMemory
  relevanceScore: number
  matchReasons: string[]
}

export interface MemoryStats {
  totalMemories: number
  totalLinks: number
  avgImportance: number
  topDomains: [string, number][]
  oldestMemory: number | null
  newestMemory: number | null
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class ContextualMemoryEngine {
  private memories: Map<string, ContextMemory> = new Map()
  private nextId = 1
  private readonly maxMemories: number
  private readonly decayRate: number // per hour

  constructor(maxMemories: number = 1000, decayRate: number = 0.01) {
    this.maxMemories = maxMemories
    this.decayRate = decayRate
  }

  // ── Store ────────────────────────────────────────────────────────────────

  /**
   * Store a new memory with context
   */
  store(
    content: string,
    context: Partial<MemoryContext> = {},
    importance: number = 0.5,
    tags: string[] = [],
  ): string {
    const id = `mem_${this.nextId++}`
    const now = Date.now()

    const fullContext: MemoryContext = {
      topic: context.topic || this.extractTopic(content),
      domain: context.domain || 'general',
      entities: context.entities || this.extractEntities(content),
      sentiment: context.sentiment || 0,
      keywords: context.keywords || this.extractKeywords(content),
    }

    const memory: ContextMemory = {
      id,
      content,
      context: fullContext,
      importance: Math.max(0, Math.min(1, importance)),
      accessCount: 0,
      createdAt: now,
      lastAccessedAt: now,
      links: [],
      tags: [...tags],
    }

    // Auto-link to similar memories
    this.autoLink(memory)

    this.memories.set(id, memory)

    // Evict if over limit
    if (this.memories.size > this.maxMemories) {
      this.evictLeastImportant()
    }

    return id
  }

  // ── Retrieve ─────────────────────────────────────────────────────────────

  /**
   * Search memories by query with relevance scoring
   */
  search(query: string, limit: number = 10): MemorySearchResult[] {
    const queryKeywords = this.extractKeywords(query)
    const queryEntities = this.extractEntities(query)
    const now = Date.now()

    const results: MemorySearchResult[] = []

    for (const memory of this.memories.values()) {
      const { score, reasons } = this.calculateRelevance(memory, queryKeywords, queryEntities, now)

      if (score > 0.1) {
        results.push({
          memory,
          relevanceScore: score,
          matchReasons: reasons,
        })
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Update access counts
    for (const result of results.slice(0, limit)) {
      result.memory.accessCount++
      result.memory.lastAccessedAt = now
    }

    return results.slice(0, limit)
  }

  /**
   * Get a specific memory by ID
   */
  get(id: string): ContextMemory | null {
    const memory = this.memories.get(id)
    if (memory) {
      memory.accessCount++
      memory.lastAccessedAt = Date.now()
    }
    return memory || null
  }

  /**
   * Get memories by tag
   */
  getByTag(tag: string): ContextMemory[] {
    return [...this.memories.values()].filter(m => m.tags.includes(tag))
  }

  /**
   * Get memories by domain
   */
  getByDomain(domain: string): ContextMemory[] {
    return [...this.memories.values()].filter(m => m.context.domain === domain)
  }

  // ── Linking ──────────────────────────────────────────────────────────────

  /**
   * Manually link two memories
   */
  link(id1: string, id2: string): boolean {
    const m1 = this.memories.get(id1)
    const m2 = this.memories.get(id2)

    if (!m1 || !m2) return false

    if (!m1.links.includes(id2)) m1.links.push(id2)
    if (!m2.links.includes(id1)) m2.links.push(id1)

    return true
  }

  /**
   * Get linked memories
   */
  getLinked(id: string): ContextMemory[] {
    const memory = this.memories.get(id)
    if (!memory) return []

    return memory.links
      .map(linkId => this.memories.get(linkId))
      .filter((m): m is ContextMemory => m !== undefined)
  }

  // ── Importance ───────────────────────────────────────────────────────────

  /**
   * Update importance of a memory
   */
  updateImportance(id: string, importance: number): boolean {
    const memory = this.memories.get(id)
    if (!memory) return false
    memory.importance = Math.max(0, Math.min(1, importance))
    return true
  }

  /**
   * Boost importance of a memory (e.g., when it's referenced again)
   */
  boostImportance(id: string, amount: number = 0.1): boolean {
    const memory = this.memories.get(id)
    if (!memory) return false
    memory.importance = Math.min(1, memory.importance + amount)
    return true
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  /**
   * Get memory statistics
   */
  getStats(): MemoryStats {
    const memories = [...this.memories.values()]

    if (memories.length === 0) {
      return {
        totalMemories: 0,
        totalLinks: 0,
        avgImportance: 0,
        topDomains: [],
        oldestMemory: null,
        newestMemory: null,
      }
    }

    const totalLinks = memories.reduce((sum, m) => sum + m.links.length, 0) / 2
    const avgImportance = memories.reduce((sum, m) => sum + m.importance, 0) / memories.length

    const domainCounts = new Map<string, number>()
    for (const m of memories) {
      domainCounts.set(m.context.domain, (domainCounts.get(m.context.domain) || 0) + 1)
    }
    const topDomains = [...domainCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

    const timestamps = memories.map(m => m.createdAt)

    return {
      totalMemories: memories.length,
      totalLinks,
      avgImportance,
      topDomains,
      oldestMemory: Math.min(...timestamps),
      newestMemory: Math.max(...timestamps),
    }
  }

  /**
   * Get total memory count
   */
  size(): number {
    return this.memories.size
  }

  /**
   * Delete a memory
   */
  delete(id: string): boolean {
    const memory = this.memories.get(id)
    if (!memory) return false

    // Remove links from other memories
    for (const linkId of memory.links) {
      const linked = this.memories.get(linkId)
      if (linked) {
        linked.links = linked.links.filter(l => l !== id)
      }
    }

    return this.memories.delete(id)
  }

  /**
   * Clear all memories
   */
  clear(): void {
    this.memories.clear()
    this.nextId = 1
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private calculateRelevance(
    memory: ContextMemory,
    queryKeywords: string[],
    queryEntities: string[],
    now: number,
  ): { score: number; reasons: string[] } {
    let score = 0
    const reasons: string[] = []

    // Keyword overlap
    const keywordOverlap = this.setOverlap(
      new Set(memory.context.keywords.map(k => k.toLowerCase())),
      new Set(queryKeywords.map(k => k.toLowerCase())),
    )
    if (keywordOverlap > 0) {
      score += keywordOverlap * 0.4
      reasons.push(`Keyword match: ${(keywordOverlap * 100).toFixed(0)}%`)
    }

    // Entity overlap
    const entityOverlap = this.setOverlap(
      new Set(memory.context.entities.map(e => e.toLowerCase())),
      new Set(queryEntities.map(e => e.toLowerCase())),
    )
    if (entityOverlap > 0) {
      score += entityOverlap * 0.3
      reasons.push(`Entity match: ${(entityOverlap * 100).toFixed(0)}%`)
    }

    // Importance factor
    score += memory.importance * 0.15
    if (memory.importance > 0.7) reasons.push('High importance')

    // Decay factor (more recent = more relevant)
    const ageHours = (now - memory.lastAccessedAt) / (1000 * 60 * 60)
    const decayFactor = Math.exp(-this.decayRate * ageHours)
    score *= 0.5 + 0.5 * decayFactor

    // Access frequency boost
    if (memory.accessCount > 5) {
      score += 0.05
      reasons.push('Frequently accessed')
    }

    // Link bonus (well-connected memories are more valuable)
    if (memory.links.length > 2) {
      score += 0.05
      reasons.push('Well-connected memory')
    }

    return { score: Math.min(1, score), reasons }
  }

  private autoLink(newMemory: ContextMemory): void {
    for (const existing of this.memories.values()) {
      const keywordOverlap = this.setOverlap(
        new Set(existing.context.keywords.map(k => k.toLowerCase())),
        new Set(newMemory.context.keywords.map(k => k.toLowerCase())),
      )

      if (keywordOverlap > 0.5 || existing.context.topic === newMemory.context.topic) {
        if (!newMemory.links.includes(existing.id)) newMemory.links.push(existing.id)
        if (!existing.links.includes(newMemory.id)) existing.links.push(newMemory.id)
      }
    }
  }

  private evictLeastImportant(): void {
    let leastImportant: ContextMemory | null = null
    let minScore = Infinity

    for (const memory of this.memories.values()) {
      const score =
        memory.importance * 0.5 +
        (memory.accessCount / 100) * 0.3 +
        (memory.links.length / 10) * 0.2
      if (score < minScore) {
        minScore = score
        leastImportant = memory
      }
    }

    if (leastImportant) {
      this.delete(leastImportant.id)
    }
  }

  private extractTopic(text: string): string {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4)
    return words.slice(0, 3).join(' ') || 'general'
  }

  private extractEntities(text: string): string[] {
    const entities: string[] = []
    // Capitalized words (potential proper nouns)
    const caps = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g)
    if (caps) entities.push(...caps.slice(0, 10))
    // Technical terms
    const tech = text.match(/\b(?:API|SQL|HTTP|CSS|HTML|REST|JSON|XML|AWS|GCP|Docker|K8s)\b/gi)
    if (tech) entities.push(...tech.slice(0, 5))
    return [...new Set(entities)]
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
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
      'can',
      'shall',
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
      'it',
      'this',
      'that',
      'these',
      'those',
      'i',
      'you',
      'he',
      'she',
      'we',
      'they',
      'me',
      'him',
      'her',
      'us',
      'them',
      'my',
      'your',
      'his',
      'its',
      'our',
      'their',
      'and',
      'but',
      'or',
      'not',
      'so',
      'if',
      'then',
      'than',
      'too',
      'very',
      'just',
      'about',
      'what',
      'how',
      'why',
      'when',
      'where',
      'who',
      'which',
    ])

    return text
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 2 && !stopWords.has(w))
      .slice(0, 20)
  }

  private setOverlap(set1: Set<string>, set2: Set<string>): number {
    if (set1.size === 0 || set2.size === 0) return 0
    let intersection = 0
    for (const item of set1) {
      if (set2.has(item)) intersection++
    }
    return intersection / Math.max(set1.size, set2.size)
  }
}
