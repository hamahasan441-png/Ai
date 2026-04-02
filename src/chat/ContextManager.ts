/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          📋  C O N T E X T   M A N A G E R                                  ║
 * ║                                                                             ║
 * ║   Sliding-window context manager with topic & entity tracking.              ║
 * ║                                                                             ║
 * ║     • Exponential recency decay:  relevance = base × e^(−λ × age)          ║
 * ║     • Keyword-cluster topic detection (programming, debug, design …)        ║
 * ║     • Entity extraction for code terms, languages, frameworks               ║
 * ║     • Pronoun / reference resolution from recent context                    ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface ContextTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  topic?: string
  entities?: string[]
}

export interface TopicInfo {
  name: string
  confidence: number
  turnCount: number
  firstSeen: number
  lastSeen: number
}

export interface TrackedEntity {
  name: string
  type: string
  mentions: number
  lastMentioned: number
  decayedRelevance: number
}

export interface ContextSummary {
  currentTopic: string
  activeEntities: TrackedEntity[]
  recentActions: string[]
  turnCount: number
}

export interface ContextStats {
  totalTurns: number
  uniqueTopics: number
  activeEntities: number
  windowSize: number
}

export interface ContextManagerConfig {
  windowSize: number
  decayFactor: number
  entityLifespan: number
  topicChangeThreshold: number
}

// ── Topic Keyword Clusters ───────────────────────────────────────────────────

const TOPIC_CLUSTERS: Record<string, string[]> = {
  programming: [
    'code', 'function', 'variable', 'class', 'method', 'implement',
    'algorithm', 'loop', 'array', 'object', 'string', 'number',
    'return', 'parameter', 'argument', 'syntax', 'compile', 'import',
    'export', 'module', 'interface', 'type', 'enum', 'struct',
  ],
  debugging: [
    'bug', 'error', 'fix', 'debug', 'issue', 'crash', 'exception',
    'stack', 'trace', 'breakpoint', 'log', 'undefined', 'null',
    'typo', 'warning', 'lint', 'broken', 'fails', 'failing',
  ],
  design: [
    'architecture', 'pattern', 'design', 'structure', 'layout',
    'component', 'module', 'service', 'layer', 'abstraction',
    'interface', 'api', 'schema', 'model', 'diagram', 'uml',
  ],
  testing: [
    'test', 'spec', 'assert', 'expect', 'mock', 'stub', 'spy',
    'coverage', 'unit', 'integration', 'e2e', 'fixture', 'suite',
    'describe', 'jest', 'vitest', 'mocha', 'snapshot',
  ],
  deployment: [
    'deploy', 'build', 'ci', 'cd', 'pipeline', 'docker', 'container',
    'kubernetes', 'k8s', 'server', 'production', 'staging', 'release',
    'publish', 'package', 'bundle', 'nginx', 'aws', 'cloud',
  ],
  database: [
    'database', 'sql', 'query', 'table', 'schema', 'migration',
    'index', 'join', 'select', 'insert', 'update', 'delete',
    'postgres', 'mysql', 'mongo', 'redis', 'orm', 'prisma',
  ],
  frontend: [
    'react', 'vue', 'angular', 'svelte', 'component', 'render',
    'dom', 'css', 'html', 'style', 'layout', 'responsive',
    'animation', 'hook', 'state', 'props', 'jsx', 'tsx',
  ],
  general: [
    'help', 'explain', 'what', 'how', 'why', 'question', 'answer',
    'learn', 'understand', 'example', 'tutorial', 'guide',
  ],
}

// ── Entity Patterns ──────────────────────────────────────────────────────────

const LANGUAGE_NAMES = new Set([
  'javascript', 'typescript', 'python', 'java', 'rust', 'go', 'golang',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'haskell', 'elixir',
  'clojure', 'dart', 'lua', 'perl', 'bash', 'shell', 'sql', 'html',
  'css', 'sass', 'less', 'graphql', 'yaml', 'json', 'toml', 'markdown',
])

const FRAMEWORK_NAMES = new Set([
  'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'gatsby',
  'express', 'fastify', 'koa', 'nestjs', 'django', 'flask', 'fastapi',
  'spring', 'rails', 'laravel', 'phoenix', 'gin', 'actix', 'axum',
  'tailwind', 'bootstrap', 'prisma', 'drizzle', 'sequelize',
  'jest', 'vitest', 'mocha', 'pytest', 'junit',
  'docker', 'kubernetes', 'terraform', 'ansible',
  'node', 'nodejs', 'deno', 'bun',
])

const CODE_TERM_PATTERN = /\b(?:[A-Z][a-z]+[A-Z]\w*|[a-z]+[A-Z]\w*)\b/g
const BACKTICK_PATTERN = /`([^`]+)`/g
const FUNCTION_CALL_PATTERN = /\b(\w+)\(\)/g

// ── Pronoun Map ──────────────────────────────────────────────────────────────

const PRONOUN_TRIGGERS = [
  'it', 'that', 'this', 'they', 'them',
  'the code', 'the function', 'the file',
  'the class', 'the method', 'the module',
  'the component', 'the service', 'the error',
  'the bug', 'the issue', 'the variable',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2)
}

// ── Tuning Constants ─────────────────────────────────────────────────────────

/** Minimum decayed relevance for an entity to be considered "active". */
const MIN_ENTITY_RELEVANCE = 0.05

/** Time window (ms) in which a turn is considered "fresh" for scoring. */
const FRESHNESS_WINDOW_MS = 60_000

/** Bonus added to score for turns within the freshness window. */
const FRESHNESS_BONUS = 0.05

/**
 * Factor applied to `topicChangeThreshold` when deciding whether a detected
 * topic is strong enough to accept (vs. falling back to the current topic).
 */
const TOPIC_ACCEPTANCE_FACTOR = 0.1

/** Maximum character length for a back-ticked code span to be treated as an entity. */
const MAX_CODE_SPAN_LENGTH = 60

// ── ContextManager Class ─────────────────────────────────────────────────────

export class ContextManager {
  private turns: ContextTurn[] = []
  private topics: Map<string, TopicInfo> = new Map()
  private entities: Map<string, TrackedEntity> = new Map()
  private currentTopicName: string | null = null
  private readonly config: ContextManagerConfig

  constructor(config?: Partial<ContextManagerConfig>) {
    this.config = {
      windowSize: 20,
      decayFactor: 0.1,
      entityLifespan: 10,
      topicChangeThreshold: 0.6,
      ...config,
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Add a conversation turn. Topic and entities are auto-detected when not
   * already present on the turn object.
   */
  addTurn(turn: ContextTurn): void {
    const enriched: ContextTurn = { ...turn }

    if (!enriched.topic) {
      enriched.topic = this.detectTopic(enriched.content)
    }
    if (!enriched.entities || enriched.entities.length === 0) {
      enriched.entities = this.extractEntities(enriched.content)
    }

    this.turns.push(enriched)

    // Enforce sliding window
    if (this.turns.length > this.config.windowSize) {
      this.turns = this.turns.slice(this.turns.length - this.config.windowSize)
    }

    // Update topic tracking
    if (enriched.topic) {
      this.updateTopic(enriched.topic, enriched.timestamp)
    }

    // Update entity tracking
    for (const entity of enriched.entities ?? []) {
      this.updateEntity(entity, enriched.timestamp)
    }
  }

  /**
   * Return turns most relevant to `query`, ranked by recency-weighted
   * keyword overlap.  At most `maxTurns` results (default = 10).
   */
  getRelevantContext(query: string, maxTurns = 10): ContextTurn[] {
    if (this.turns.length === 0) return []

    const queryTokens = new Set(tokenize(query))
    const latestTs = this.turns[this.turns.length - 1].timestamp

    const scored = this.turns.map((turn, idx) => {
      const age = this.turns.length - 1 - idx
      const recency = Math.exp(-this.config.decayFactor * age)

      const turnTokens = tokenize(turn.content)
      const overlap = turnTokens.filter(t => queryTokens.has(t)).length
      const baseScore = turnTokens.length > 0 ? overlap / turnTokens.length : 0

      // Bonus for topic match
      const topicBonus = turn.topic && query.toLowerCase().includes(turn.topic) ? 0.2 : 0

      // Bonus for entity overlap
      const entityTokens = (turn.entities ?? []).map(e => e.toLowerCase())
      const entityOverlap = entityTokens.filter(e => query.toLowerCase().includes(e)).length
      const entityBonus = entityOverlap * 0.15

      // Time-based freshness bonus (within the freshness window)
      const timeDelta = latestTs - turn.timestamp
      const freshnessBonus = timeDelta < FRESHNESS_WINDOW_MS ? FRESHNESS_BONUS : 0

      const score = (baseScore + topicBonus + entityBonus + freshnessBonus) * recency
      return { turn, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxTurns)
      .filter(s => s.score > 0)
      .map(s => s.turn)
  }

  /** Get information about the currently active topic, or null. */
  getCurrentTopic(): TopicInfo | null {
    if (!this.currentTopicName) return null
    return this.topics.get(this.currentTopicName) ?? null
  }

  /** Full history of detected topics, ordered by first appearance. */
  getTopicHistory(): TopicInfo[] {
    return [...this.topics.values()].sort((a, b) => a.firstSeen - b.firstSeen)
  }

  /**
   * Return entities whose decayed relevance still exceeds a minimum
   * threshold (0.05).
   */
  getActiveEntities(): TrackedEntity[] {
    const active: TrackedEntity[] = []

    for (const entity of this.entities.values()) {
      const age = this.turnsSinceLastMention(entity.lastMentioned)
      const decayed = entity.mentions * Math.exp(-this.config.decayFactor * age)
      const updated: TrackedEntity = { ...entity, decayedRelevance: decayed }

      if (decayed > MIN_ENTITY_RELEVANCE) {
        active.push(updated)
      }
    }

    return active.sort((a, b) => b.decayedRelevance - a.decayedRelevance)
  }

  /**
   * Attempt to resolve pronouns / vague references ("it", "the function",
   * etc.) by scanning recent context for the most likely referent.
   */
  resolveReference(text: string): string {
    const lower = text.toLowerCase()
    const trigger = PRONOUN_TRIGGERS.find(p => lower.includes(p))
    if (!trigger) return text

    // Walk turns in reverse to find the best referent
    const referent = this.findBestReferent()
    if (!referent) return text

    // Replace the first occurrence of the trigger with the resolved entity
    const escaped = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    return text.replace(regex, referent)
  }

  /** Produce a high-level summary of the current context window. */
  summarize(): ContextSummary {
    const activeEntities = this.getActiveEntities()

    const recentActions = this.turns
      .filter(t => t.role === 'user')
      .slice(-5)
      .map(t => this.summarizeTurnContent(t.content))

    return {
      currentTopic: this.currentTopicName ?? 'unknown',
      activeEntities,
      recentActions,
      turnCount: this.turns.length,
    }
  }

  /** Basic statistics about the context window. */
  getStats(): ContextStats {
    return {
      totalTurns: this.turns.length,
      uniqueTopics: this.topics.size,
      activeEntities: this.getActiveEntities().length,
      windowSize: this.config.windowSize,
    }
  }

  /** Serialize the entire manager state to a JSON string. */
  serialize(): string {
    return JSON.stringify({
      turns: this.turns,
      topics: [...this.topics.entries()],
      entities: [...this.entities.entries()],
      currentTopicName: this.currentTopicName,
      config: this.config,
    })
  }

  /** Restore a ContextManager from a previously serialized JSON string. */
  static deserialize(json: string): ContextManager {
    const data = JSON.parse(json) as {
      turns: ContextTurn[]
      topics: [string, TopicInfo][]
      entities: [string, TrackedEntity][]
      currentTopicName: string | null
      config: ContextManagerConfig
    }

    const mgr = new ContextManager(data.config)
    mgr.turns = data.turns
    mgr.topics = new Map(data.topics)
    mgr.entities = new Map(data.entities)
    mgr.currentTopicName = data.currentTopicName
    return mgr
  }

  /** Wipe all state and start fresh. */
  reset(): void {
    this.turns = []
    this.topics.clear()
    this.entities.clear()
    this.currentTopicName = null
  }

  // ── Topic Detection ──────────────────────────────────────────────────────

  private detectTopic(text: string): string {
    const tokens = tokenize(text)
    let bestTopic = 'general'
    let bestScore = 0

    for (const [topic, keywords] of Object.entries(TOPIC_CLUSTERS)) {
      const matches = tokens.filter(t => keywords.includes(t)).length
      const score = tokens.length > 0 ? matches / tokens.length : 0

      if (score > bestScore) {
        bestScore = score
        bestTopic = topic
      }
    }

    // Only accept a non-general topic when confidence exceeds threshold
    if (bestTopic !== 'general' && bestScore < this.config.topicChangeThreshold * TOPIC_ACCEPTANCE_FACTOR) {
      bestTopic = this.currentTopicName ?? 'general'
    }

    return bestTopic
  }

  private updateTopic(topicName: string, timestamp: number): void {
    const existing = this.topics.get(topicName)

    if (existing) {
      existing.turnCount += 1
      existing.lastSeen = timestamp
      existing.confidence = Math.min(1, existing.confidence + 0.1)
    } else {
      this.topics.set(topicName, {
        name: topicName,
        confidence: 0.5,
        turnCount: 1,
        firstSeen: timestamp,
        lastSeen: timestamp,
      })
    }

    // Decide whether the active topic should change
    if (this.currentTopicName !== topicName) {
      const current = this.currentTopicName
        ? this.topics.get(this.currentTopicName)
        : null

      const incoming = this.topics.get(topicName)!
      const shouldSwitch =
        !current ||
        incoming.confidence >= this.config.topicChangeThreshold ||
        incoming.turnCount > (current?.turnCount ?? 0)

      if (shouldSwitch) {
        this.currentTopicName = topicName
      }
    }
  }

  // ── Entity Extraction ────────────────────────────────────────────────────

  private extractEntities(text: string): string[] {
    const found = new Set<string>()

    // 1. Known languages & frameworks (case-insensitive token match)
    const tokens = tokenize(text)
    for (const token of tokens) {
      if (LANGUAGE_NAMES.has(token)) found.add(token)
      if (FRAMEWORK_NAMES.has(token)) found.add(token)
    }

    // 2. CamelCase / PascalCase identifiers
    let match: RegExpExecArray | null
    CODE_TERM_PATTERN.lastIndex = 0
    while ((match = CODE_TERM_PATTERN.exec(text)) !== null) {
      found.add(match[0])
    }

    // 3. Back-ticked code spans
    BACKTICK_PATTERN.lastIndex = 0
    while ((match = BACKTICK_PATTERN.exec(text)) !== null) {
      const inner = match[1].trim()
      if (inner.length > 0 && inner.length < MAX_CODE_SPAN_LENGTH) found.add(inner)
    }

    // 4. function() calls
    FUNCTION_CALL_PATTERN.lastIndex = 0
    while ((match = FUNCTION_CALL_PATTERN.exec(text)) !== null) {
      found.add(match[1])
    }

    return [...found]
  }

  private updateEntity(entityName: string, timestamp: number): void {
    const key = entityName.toLowerCase()
    const existing = this.entities.get(key)
    const entityType = this.classifyEntity(entityName)

    if (existing) {
      existing.mentions += 1
      existing.lastMentioned = timestamp
      existing.decayedRelevance = existing.mentions // refreshed on access
    } else {
      this.entities.set(key, {
        name: entityName,
        type: entityType,
        mentions: 1,
        lastMentioned: timestamp,
        decayedRelevance: 1,
      })
    }

    // Prune entities that have expired beyond the lifespan window
    this.pruneEntities()
  }

  private classifyEntity(name: string): string {
    const lower = name.toLowerCase()
    if (LANGUAGE_NAMES.has(lower)) return 'language'
    if (FRAMEWORK_NAMES.has(lower)) return 'framework'
    if (/^[A-Z]/.test(name)) return 'class'
    if (/\(?\)$/.test(name)) return 'function'
    return 'identifier'
  }

  private pruneEntities(): void {
    const maxAge = this.config.entityLifespan
    for (const [key, entity] of this.entities) {
      const age = this.turnsSinceLastMention(entity.lastMentioned)
      if (age > maxAge) {
        this.entities.delete(key)
      }
    }
  }

  // ── Pronoun Resolution ───────────────────────────────────────────────────

  private findBestReferent(): string | null {
    // Walk recent turns (newest first) and pick the most prominent entity
    const recent = [...this.turns].reverse().slice(0, 5)

    for (const turn of recent) {
      if (turn.entities && turn.entities.length > 0) {
        return turn.entities[0]
      }
    }

    // Fall back to the current topic if no entity found
    return this.currentTopicName
  }

  // ── Utility ──────────────────────────────────────────────────────────────

  private turnsSinceLastMention(lastMentionedTs: number): number {
    if (this.turns.length === 0) return Infinity

    let count = 0
    for (let i = this.turns.length - 1; i >= 0; i--) {
      if (this.turns[i].timestamp <= lastMentionedTs) break
      count++
    }
    return count
  }

  private summarizeTurnContent(content: string): string {
    const trimmed = content.trim()

    // Return first sentence or first 80 chars, whichever is shorter
    const sentenceEnd = trimmed.search(/[.!?]\s/)
    if (sentenceEnd !== -1 && sentenceEnd < 80) {
      return trimmed.slice(0, sentenceEnd + 1)
    }
    if (trimmed.length <= 80) return trimmed
    return trimmed.slice(0, 77) + '...'
  }
}
