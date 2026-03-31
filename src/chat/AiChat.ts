/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    🤖  ADVANCED AI CHAT — UNIFIED MODULE                ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                         ║
 * ║  This single file contains the ENTIRE advanced AI chat system.          ║
 * ║  It was built by combining 6 specialized files into one:                ║
 * ║                                                                         ║
 * ║    1. TYPES          — All type definitions (lines ~40–300)             ║
 * ║       → Made to define the data shapes for messages, conversations,     ║
 * ║         branches, search, analytics, export, and context windows.       ║
 * ║                                                                         ║
 * ║    2. SEARCH ENGINE  — Fuzzy/exact/regex search (lines ~310–560)        ║
 * ║       → Made to find messages by content with relevance scoring,        ║
 * ║         highlighting, and filtering by role/branch/date/tool/tags.      ║
 * ║                                                                         ║
 * ║    3. ANALYTICS      — Token tracking & cost (lines ~570–860)           ║
 * ║       → Made to compute conversation stats: token usage, API cost,      ║
 * ║         tool frequency, model breakdowns, and per-turn metrics.         ║
 * ║                                                                         ║
 * ║    4. EXPORT         — Markdown/JSON/Text export (lines ~870–1180)      ║
 * ║       → Made to export conversations in readable formats with           ║
 * ║         configurable inclusion of tools, tokens, and analytics.         ║
 * ║                                                                         ║
 * ║    5. ADVANCED CHAT  — Main orchestrator class (lines ~1190–1780)       ║
 * ║       → Made to tie everything together: branching, pinning, tagging,   ║
 * ║         context-window management, search, analytics, export, and       ║
 * ║         serialization for persistence.                                  ║
 * ║                                                                         ║
 * ║    6. EXPORTS        — Public API (end of file)                         ║
 * ║       → Made to provide a clean, documented entry point for consumers.  ║
 * ║                                                                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @example
 * ```ts
 * import { AdvancedChat } from './chat/AiChat.js'
 *
 * const chat = new AdvancedChat({ title: 'My Session' })
 * chat.addUserMessage('Explain the repository structure')
 * chat.addAssistantMessage('This repo contains...', {
 *   model: 'claude-sonnet-4-20250514',
 *   tokenUsage: { inputTokens: 500, outputTokens: 1200 },
 * })
 * const results = chat.search({ query: 'repository', mode: 'fuzzy' })
 * const analytics = chat.getAnalytics()
 * const markdown = chat.exportMarkdown()
 * ```
 */

// ╔═════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 1 — TYPE DEFINITIONS                                             ║
// ║                                                                           ║
// ║  WHY: Every piece of data in the chat system needs a clear shape.         ║
// ║  These types define messages, conversations, branches, search options,     ║
// ║  analytics results, export options, and context-window configuration.      ║
// ║  Having strong types catches bugs at compile time and documents the API.   ║
// ╚═════════════════════════════════════════════════════════════════════════════╝

// -- Message & Conversation Primitives --

/** Unique identifier for a chat message. */
export type ChatMessageId = string

/** Unique identifier for a conversation branch. */
export type BranchId = string

/** Roles within a conversation turn. */
export type ChatRole = 'user' | 'assistant' | 'system' | 'tool'

/** Supported content block kinds inside a single message. */
export type ContentBlockType = 'text' | 'tool_use' | 'tool_result' | 'image'

/**
 * A single content block that can appear inside a ChatMessage.
 *
 * WHY: AI messages aren't just text — they can contain tool calls,
 * tool results, and images. This union covers all block kinds.
 */
export interface ContentBlock {
  type: ContentBlockType
  /** Text content – present when `type` is "text". */
  text?: string
  /** Tool name – present when `type` is "tool_use". */
  toolName?: string
  /** Tool input – present when `type` is "tool_use". */
  toolInput?: Record<string, unknown>
  /** Tool result text – present when `type` is "tool_result". */
  toolResult?: string
  /** Tool use id – links a tool_result back to its tool_use. */
  toolUseId?: string
}

/**
 * A single message inside the advanced chat system.
 *
 * WHY: Extends the basic message concept with metadata for branching,
 * pinning, search, and analytics — the core features of advanced chat.
 */
export interface ChatMessage {
  id: ChatMessageId
  role: ChatRole
  content: ContentBlock[]
  /** ISO-8601 timestamp of when the message was created. */
  timestamp: string
  /** The branch this message belongs to. */
  branchId: BranchId
  /** If this message was forked from another, the source message id. */
  parentMessageId?: ChatMessageId
  /** Whether this message has been pinned / bookmarked by the user. */
  pinned: boolean
  /** Arbitrary user-defined tags for filtering. */
  tags: string[]
  /** Token counts for the message (prompt / completion). */
  tokenUsage?: TokenUsage
  /** Model that generated this message (only for assistant messages). */
  model?: string
  /** Duration in ms the API call took (only for assistant messages). */
  apiDurationMs?: number
}

/**
 * Token usage breakdown for a single message or turn.
 *
 * WHY: Tracking tokens is essential for cost management and staying
 * within context-window limits.
 */
export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  cacheReadTokens?: number
  cacheCreationTokens?: number
}

// -- Conversation & Branching --

/**
 * Metadata for a single conversation branch.
 *
 * WHY: Branching lets users fork conversations to explore different
 * approaches without losing their original thread.
 */
export interface Branch {
  id: BranchId
  /** Human-readable label for this branch (e.g. "Refactor attempt #2"). */
  label: string
  /** The branch this was forked from, if any. */
  parentBranchId?: BranchId
  /** The message id at which this branch diverged. */
  forkPointMessageId?: ChatMessageId
  /** ISO-8601 creation timestamp. */
  createdAt: string
}

/**
 * A full conversation that may span multiple branches.
 *
 * WHY: This is the top-level container holding all messages, branches,
 * and aggregate metadata for an entire chat session.
 */
export interface Conversation {
  id: string
  title: string
  branches: Branch[]
  /** The currently active branch. */
  activeBranchId: BranchId
  messages: ChatMessage[]
  /** ISO-8601 creation timestamp. */
  createdAt: string
  /** ISO-8601 last-updated timestamp. */
  updatedAt: string
  /** Aggregate token usage across all messages. */
  totalTokenUsage: TokenUsage
  metadata: ConversationMetadata
}

/**
 * Extra metadata attached to a conversation.
 *
 * WHY: Captures environment context (cwd, git branch) and aggregate
 * stats (models used, tool calls, cost) for quick at-a-glance info.
 */
export interface ConversationMetadata {
  /** Working directory when the conversation started. */
  cwd?: string
  /** Git branch active at conversation start. */
  gitBranch?: string
  /** Models used during the conversation (de-duplicated). */
  modelsUsed: string[]
  /** Total number of tool calls made. */
  totalToolCalls: number
  /** Total estimated API cost in USD. */
  estimatedCostUsd: number
}

// -- Search Types --

/** Supported search modes. */
export type SearchMode = 'fuzzy' | 'exact' | 'regex'

/**
 * Options for searching through chat messages.
 *
 * WHY: Rich filtering lets users find exactly the message they need
 * across potentially thousands of messages and multiple branches.
 */
export interface ChatSearchOptions {
  /** The search query string or regex pattern. */
  query: string
  mode: SearchMode
  /** Only search messages with these roles. */
  roles?: ChatRole[]
  /** Only search messages on this branch. */
  branchId?: BranchId
  /** Only include messages after this ISO-8601 date. */
  after?: string
  /** Only include messages before this ISO-8601 date. */
  before?: string
  /** Only include messages that used a specific tool. */
  toolName?: string
  /** Only include pinned messages. */
  pinnedOnly?: boolean
  /** Only include messages with these tags. */
  tags?: string[]
  /** Maximum number of results to return. */
  limit?: number
}

/** A single search result with relevance metadata. */
export interface ChatSearchResult {
  message: ChatMessage
  /** 0-1 relevance score (1 = perfect match). */
  score: number
  /** Matching text snippets with surrounding context. */
  highlights: SearchHighlight[]
}

/** A highlighted snippet inside a search result. */
export interface SearchHighlight {
  /** The full text line containing the match. */
  line: string
  /** Character offset of the match start within `line`. */
  matchStart: number
  /** Character length of the match. */
  matchLength: number
}

// -- Analytics Types --

/**
 * High-level analytics for a conversation.
 *
 * WHY: Gives users insight into how their conversation is going —
 * how many turns, how much it costs, which tools are most used, etc.
 */
export interface ConversationAnalytics {
  /** Total number of turns (user → assistant round-trips). */
  turnCount: number
  /** Total messages by role. */
  messageCounts: Record<ChatRole, number>
  /** Total token usage. */
  tokenUsage: TokenUsage
  /** Average tokens per assistant response. */
  avgAssistantTokens: number
  /** Average API latency in ms. */
  avgApiLatencyMs: number
  /** Frequency map of tool usage (tool name → call count). */
  toolUsageFrequency: Record<string, number>
  /** Total estimated cost in USD. */
  estimatedCostUsd: number
  /** Conversation duration from first to last message in ms. */
  durationMs: number
  /** Per-model breakdown. */
  modelBreakdown: ModelUsageBreakdown[]
}

/** Token & cost breakdown per model. */
export interface ModelUsageBreakdown {
  model: string
  messageCount: number
  tokenUsage: TokenUsage
  estimatedCostUsd: number
}

// -- Export Types --

/** Formats available for conversation export. */
export type ExportFormat = 'markdown' | 'json' | 'text'

/**
 * Options when exporting a conversation.
 *
 * WHY: Users may want a clean Markdown document, a structured JSON
 * blob, or a simple text dump — and may want to include/exclude details.
 */
export interface ExportOptions {
  format: ExportFormat
  /** Only export messages from a specific branch (default: active branch). */
  branchId?: BranchId
  /** Include system messages in the export. */
  includeSystemMessages?: boolean
  /** Include tool use / result blocks in the export. */
  includeToolBlocks?: boolean
  /** Include token usage metadata. */
  includeTokenUsage?: boolean
  /** Include analytics summary at the end. */
  includeAnalytics?: boolean
}

// -- Context Window Types --

/** Priority levels for messages in the context window. */
export type MessagePriority = 'critical' | 'high' | 'medium' | 'low'

/**
 * Configuration for smart context-window management.
 *
 * WHY: AI models have token limits. This config controls how the system
 * decides which messages to keep and which to drop when the window overflows.
 */
export interface ContextWindowConfig {
  /** Maximum tokens allowed in the context window. */
  maxTokens: number
  /** Reserve this many tokens for the next assistant response. */
  reserveForResponse: number
  /** Strategy used when the window overflows. */
  overflowStrategy: 'truncate_oldest' | 'summarize' | 'drop_low_priority'
  /** Messages with these priorities are never dropped. */
  protectedPriorities: MessagePriority[]
}

/** Result after applying context-window management. */
export interface ContextWindowResult {
  /** Messages that fit in the window, in conversation order. */
  messages: ChatMessage[]
  /** Total tokens in the retained messages. */
  totalTokens: number
  /** Number of messages that were dropped or summarized. */
  droppedCount: number
  /** Whether any messages were dropped. */
  wasTruncated: boolean
}

// ╔═════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 2 — SEARCH ENGINE                                                ║
// ║                                                                           ║
// ║  WHY: Users need to find specific messages in long conversations.          ║
// ║  This section provides three search modes (fuzzy, exact, regex) with       ║
// ║  relevance scoring so the best matches appear first, plus highlighted      ║
// ║  snippets so users can see exactly what matched and where.                 ║
// ║                                                                           ║
// ║  WHAT IT DOES:                                                            ║
// ║    • extractTextFromBlocks() — pulls plain text out of message blocks      ║
// ║    • buildPattern()          — creates a RegExp from the search query      ║
// ║    • computeScore()          — calculates a 0–1 relevance score            ║
// ║    • buildHighlights()       — finds and marks matching text snippets      ║
// ║    • passesFilters()         — checks role/branch/date/tool/tag filters    ║
// ║    • searchMessages()        — the main search function (public)           ║
// ║    • searchByTool()          — convenience: search by tool name (public)   ║
// ║    • getPinnedMessages()     — get all bookmarked messages (public)        ║
// ╚═════════════════════════════════════════════════════════════════════════════╝

/** Extract all plain-text content from a message's content blocks. */
function extractTextFromBlocks(blocks: ContentBlock[]): string {
  return blocks
    .map(block => {
      switch (block.type) {
        case 'text':
          return block.text ?? ''
        case 'tool_use':
          return `[Tool: ${block.toolName ?? 'unknown'}] ${JSON.stringify(block.toolInput ?? {})}`
        case 'tool_result':
          return block.toolResult ?? ''
        default:
          return ''
      }
    })
    .filter(Boolean)
    .join('\n')
}

/** Escape special regex characters so a literal string can be used in a RegExp. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Build a `RegExp` from the user query depending on the search mode.
 *
 * - **exact**  — case-insensitive literal match
 * - **regex**  — user-provided pattern, with `i` and `g` flags
 * - **fuzzy**  — words matched in order with optional chars between
 */
function buildPattern(query: string, mode: SearchMode): RegExp {
  switch (mode) {
    case 'exact':
      return new RegExp(escapeRegex(query), 'gi')

    case 'regex':
      try {
        return new RegExp(query, 'gi')
      } catch {
        return new RegExp(escapeRegex(query), 'gi')
      }

    case 'fuzzy': {
      const words = query
        .trim()
        .split(/\s+/)
        .map(w => escapeRegex(w))
      return new RegExp(words.join('.*'), 'gi')
    }
  }
}

/**
 * Compute a 0–1 relevance score for `text` given a `pattern`.
 *
 * Scoring heuristic:
 *  - Base: match density (number of matches relative to text length)
 *  - Bonus: +0.1 for exact case-sensitive matches
 *  - Penalty: ×0.95 for very long texts (>5000 chars)
 */
function computeScore(text: string, pattern: RegExp, query: string): number {
  if (text.length === 0) return 0

  const matches = [...text.matchAll(new RegExp(pattern.source, pattern.flags))]
  if (matches.length === 0) return 0

  const density = Math.min(matches.length / (text.length / Math.max(query.length, 1)), 1)
  const exactMatches = [...text.matchAll(new RegExp(pattern.source, 'g'))]
  const exactBonus = exactMatches.length > 0 ? 0.1 : 0
  const lengthPenalty = text.length > 5000 ? 0.95 : 1

  return Math.min((density + exactBonus) * lengthPenalty, 1)
}

/** Build highlighted snippets for all matches of `pattern` in `text`. */
function buildHighlights(text: string, pattern: RegExp): SearchHighlight[] {
  const lines = text.split('\n')
  const highlights: SearchHighlight[] = []

  for (const line of lines) {
    const lineMatches = [...line.matchAll(new RegExp(pattern.source, pattern.flags))]
    for (const m of lineMatches) {
      if (m.index === undefined) continue
      highlights.push({
        line,
        matchStart: m.index,
        matchLength: m[0].length,
      })
    }
  }

  return highlights
}

/** Return `true` when a message passes all non-text filters. */
function passesFilters(msg: ChatMessage, options: ChatSearchOptions): boolean {
  if (options.roles && options.roles.length > 0) {
    if (!options.roles.includes(msg.role as ChatRole)) return false
  }
  if (options.branchId && msg.branchId !== options.branchId) return false
  if (options.after && msg.timestamp < options.after) return false
  if (options.before && msg.timestamp > options.before) return false
  if (options.pinnedOnly && !msg.pinned) return false
  if (options.tags && options.tags.length > 0) {
    if (!options.tags.some(tag => msg.tags.includes(tag))) return false
  }
  if (options.toolName) {
    const usesTool = msg.content.some(
      b => b.type === 'tool_use' && b.toolName === options.toolName,
    )
    if (!usesTool) return false
  }
  return true
}

/**
 * Search through an array of chat messages.
 *
 * Results are sorted by relevance score (highest first) and capped at
 * `options.limit` (default 50).
 */
export function searchMessages(
  messages: ChatMessage[],
  options: ChatSearchOptions,
): ChatSearchResult[] {
  const { query, mode = 'fuzzy', limit = 50 } = options
  if (!query.trim()) return []

  const pattern = buildPattern(query, mode)
  const results: ChatSearchResult[] = []

  for (const msg of messages) {
    if (!passesFilters(msg, options)) continue

    const text = extractTextFromBlocks(msg.content)
    if (!pattern.test(text)) {
      pattern.lastIndex = 0
      continue
    }
    pattern.lastIndex = 0

    const score = computeScore(text, pattern, query)
    const highlights = buildHighlights(text, pattern)
    results.push({ message: msg, score, highlights })
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.message.timestamp.localeCompare(a.message.timestamp)
  })

  return results.slice(0, limit)
}

/** Convenience: search for messages that mention a specific tool. */
export function searchByTool(
  messages: ChatMessage[],
  toolName: string,
  limit = 20,
): ChatSearchResult[] {
  return searchMessages(messages, {
    query: toolName,
    mode: 'exact',
    toolName,
    limit,
  })
}

/** Return all pinned (bookmarked) messages, optionally filtered to a branch. */
export function getPinnedMessages(
  messages: ChatMessage[],
  branchId?: string,
): ChatMessage[] {
  return messages.filter(
    m => m.pinned && (branchId ? m.branchId === branchId : true),
  )
}

// ╔═════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 3 — CONVERSATION ANALYTICS                                       ║
// ║                                                                           ║
// ║  WHY: Understanding how a conversation is going matters — token spend,     ║
// ║  API cost, which tools get used the most, and how long each turn takes.    ║
// ║  This section computes all those metrics from raw messages.                ║
// ║                                                                           ║
// ║  WHAT IT DOES:                                                            ║
// ║    • MODEL_COST_PER_1K  — pricing table for cost estimation               ║
// ║    • estimateCost()     — estimate USD cost from token counts              ║
// ║    • computeAnalytics() — full analytics for a set of messages (public)    ║
// ║    • getTopTools()      — top N most-used tools (public)                   ║
// ║    • getTurnBreakdown() — per-turn user→assistant metrics (public)         ║
// ╚═════════════════════════════════════════════════════════════════════════════╝

/**
 * Approximate cost per 1 000 tokens for popular models.
 * These are rough estimates — real pricing depends on the provider.
 */
const MODEL_COST_PER_1K: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 },
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-5-haiku-20241022': { input: 0.0008, output: 0.004 },
  'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
  default: { input: 0.003, output: 0.015 },
}

function estimateCost(model: string | undefined, usage: TokenUsage): number {
  const rates = MODEL_COST_PER_1K[model ?? ''] ?? MODEL_COST_PER_1K['default']!
  return (
    (usage.inputTokens / 1000) * rates.input +
    (usage.outputTokens / 1000) * rates.output
  )
}

// -- Shared token helpers (used by analytics AND context window) --

function emptyUsage(): TokenUsage {
  return { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0 }
}

function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheReadTokens: (a.cacheReadTokens ?? 0) + (b.cacheReadTokens ?? 0),
    cacheCreationTokens: (a.cacheCreationTokens ?? 0) + (b.cacheCreationTokens ?? 0),
  }
}

/**
 * Compute comprehensive analytics for an array of chat messages.
 *
 * Covers: turn count, message counts by role, total token usage,
 * average assistant tokens, average API latency, tool frequency,
 * estimated cost, conversation duration, and per-model breakdown.
 */
export function computeAnalytics(messages: ChatMessage[]): ConversationAnalytics {
  if (messages.length === 0) {
    return {
      turnCount: 0,
      messageCounts: { user: 0, assistant: 0, system: 0, tool: 0 },
      tokenUsage: emptyUsage(),
      avgAssistantTokens: 0,
      avgApiLatencyMs: 0,
      toolUsageFrequency: {},
      estimatedCostUsd: 0,
      durationMs: 0,
      modelBreakdown: [],
    }
  }

  const messageCounts: Record<ChatRole, number> = { user: 0, assistant: 0, system: 0, tool: 0 }
  let totalUsage = emptyUsage()
  let totalAssistantOutputTokens = 0
  let assistantMessageCount = 0
  let totalApiLatency = 0
  let apiLatencyCount = 0
  const toolFrequency: Record<string, number> = {}
  const modelMap = new Map<
    string,
    { messageCount: number; tokenUsage: TokenUsage; estimatedCostUsd: number }
  >()

  let turnCount = 0

  for (const msg of messages) {
    const role = msg.role as ChatRole
    messageCounts[role] = (messageCounts[role] ?? 0) + 1

    if (role === 'user') turnCount++

    if (msg.tokenUsage) {
      totalUsage = addUsage(totalUsage, msg.tokenUsage)
    }

    if (role === 'assistant') {
      assistantMessageCount++
      if (msg.tokenUsage) {
        totalAssistantOutputTokens += msg.tokenUsage.outputTokens
      }
      if (msg.apiDurationMs !== undefined) {
        totalApiLatency += msg.apiDurationMs
        apiLatencyCount++
      }

      const model = msg.model ?? 'unknown'
      const entry = modelMap.get(model) ?? {
        messageCount: 0,
        tokenUsage: emptyUsage(),
        estimatedCostUsd: 0,
      }
      entry.messageCount++
      if (msg.tokenUsage) {
        entry.tokenUsage = addUsage(entry.tokenUsage, msg.tokenUsage)
        entry.estimatedCostUsd += estimateCost(model, msg.tokenUsage)
      }
      modelMap.set(model, entry)
    }

    for (const block of msg.content) {
      if (block.type === 'tool_use' && block.toolName) {
        toolFrequency[block.toolName] = (toolFrequency[block.toolName] ?? 0) + 1
      }
    }
  }

  const sorted = [...messages].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const first = sorted[0]!
  const last = sorted[sorted.length - 1]!
  const durationMs =
    new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()

  const modelBreakdown: ModelUsageBreakdown[] = [...modelMap.entries()].map(
    ([model, data]) => ({ model, ...data }),
  )

  const estimatedCostUsd = modelBreakdown.reduce((sum, m) => sum + m.estimatedCostUsd, 0)

  return {
    turnCount,
    messageCounts,
    tokenUsage: totalUsage,
    avgAssistantTokens:
      assistantMessageCount > 0
        ? Math.round(totalAssistantOutputTokens / assistantMessageCount)
        : 0,
    avgApiLatencyMs:
      apiLatencyCount > 0 ? Math.round(totalApiLatency / apiLatencyCount) : 0,
    toolUsageFrequency: toolFrequency,
    estimatedCostUsd: Math.round(estimatedCostUsd * 1_000_000) / 1_000_000,
    durationMs: Math.max(durationMs, 0),
    modelBreakdown,
  }
}

/** Return the top-N most frequently used tools. */
export function getTopTools(
  messages: ChatMessage[],
  n = 10,
): Array<{ toolName: string; count: number }> {
  const freq: Record<string, number> = {}
  for (const msg of messages) {
    for (const block of msg.content) {
      if (block.type === 'tool_use' && block.toolName) {
        freq[block.toolName] = (freq[block.toolName] ?? 0) + 1
      }
    }
  }
  return Object.entries(freq)
    .map(([toolName, count]) => ({ toolName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

/** Compute a per-turn breakdown (user message → assistant response pair). */
export function getTurnBreakdown(
  messages: ChatMessage[],
): Array<{
  turnIndex: number
  userMessage: ChatMessage
  assistantMessages: ChatMessage[]
  turnTokens: TokenUsage
  turnDurationMs: number
}> {
  const sorted = [...messages].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const turns: Array<{
    turnIndex: number
    userMessage: ChatMessage
    assistantMessages: ChatMessage[]
    turnTokens: TokenUsage
    turnDurationMs: number
  }> = []

  let currentTurn: (typeof turns)[number] | null = null
  let turnIndex = 0

  for (const msg of sorted) {
    if (msg.role === 'user') {
      if (currentTurn) turns.push(currentTurn)
      currentTurn = {
        turnIndex: turnIndex++,
        userMessage: msg,
        assistantMessages: [],
        turnTokens: msg.tokenUsage ? { ...msg.tokenUsage } : emptyUsage(),
        turnDurationMs: 0,
      }
    } else if (msg.role === 'assistant' && currentTurn) {
      currentTurn.assistantMessages.push(msg)
      if (msg.tokenUsage) {
        currentTurn.turnTokens = addUsage(currentTurn.turnTokens, msg.tokenUsage)
      }
      currentTurn.turnDurationMs =
        new Date(msg.timestamp).getTime() -
        new Date(currentTurn.userMessage.timestamp).getTime()
    }
  }

  if (currentTurn) turns.push(currentTurn)
  return turns
}

// ╔═════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 4 — CONVERSATION EXPORT                                          ║
// ║                                                                           ║
// ║  WHY: Users want to save, share, or review their conversations outside     ║
// ║  the chat interface. This section converts messages into three formats:    ║
// ║    • Markdown — nice for documentation, sharing, and reading              ║
// ║    • JSON     — structured data for programmatic use or archival          ║
// ║    • Text     — simple plain text for quick pasting or logging            ║
// ║                                                                           ║
// ║  WHAT IT DOES:                                                            ║
// ║    • roleLabel()         — converts role enum to human-readable label      ║
// ║    • formatTimestamp()   — formats ISO date to readable string             ║
// ║    • formatTokenUsage()  — summarises token counts as a string             ║
// ║    • blockToMarkdown()   — renders a content block as Markdown             ║
// ║    • blockToText()       — renders a content block as plain text           ║
// ║    • filterMessages()    — applies branch + system-message filters         ║
// ║    • exportMarkdown()    — full Markdown export with analytics             ║
// ║    • exportJSON()        — structured JSON export                          ║
// ║    • exportText()        — plain text export                               ║
// ║    • exportConversation()— main entry point (public)                       ║
// ╚═════════════════════════════════════════════════════════════════════════════╝

function roleLabel(role: string): string {
  switch (role) {
    case 'user':
      return 'User'
    case 'assistant':
      return 'Assistant'
    case 'system':
      return 'System'
    case 'tool':
      return 'Tool'
    default:
      return role
  }
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch {
    return iso
  }
}

function formatTokenUsage(usage: TokenUsage): string {
  const parts = [`in: ${usage.inputTokens}`, `out: ${usage.outputTokens}`]
  if (usage.cacheReadTokens) parts.push(`cache_read: ${usage.cacheReadTokens}`)
  if (usage.cacheCreationTokens) parts.push(`cache_create: ${usage.cacheCreationTokens}`)
  return parts.join(', ')
}

function blockToMarkdown(block: ContentBlock, includeToolBlocks: boolean): string {
  switch (block.type) {
    case 'text':
      return block.text ?? ''
    case 'tool_use':
      if (!includeToolBlocks) return ''
      return [
        `\`\`\`tool_use [${block.toolName ?? 'unknown'}]`,
        JSON.stringify(block.toolInput ?? {}, null, 2),
        '```',
      ].join('\n')
    case 'tool_result':
      if (!includeToolBlocks) return ''
      return [
        '```tool_result',
        block.toolResult ?? '(empty)',
        '```',
      ].join('\n')
    case 'image':
      return '*[image]*'
    default:
      return ''
  }
}

function blockToText(block: ContentBlock, includeToolBlocks: boolean): string {
  switch (block.type) {
    case 'text':
      return block.text ?? ''
    case 'tool_use':
      if (!includeToolBlocks) return ''
      return `[Tool: ${block.toolName ?? 'unknown'}] ${JSON.stringify(block.toolInput ?? {})}`
    case 'tool_result':
      if (!includeToolBlocks) return ''
      return `[Tool Result] ${block.toolResult ?? '(empty)'}`
    case 'image':
      return '[image]'
    default:
      return ''
  }
}

function filterMessages(messages: ChatMessage[], options: ExportOptions): ChatMessage[] {
  let filtered = messages
  if (options.branchId) {
    filtered = filtered.filter(m => m.branchId === options.branchId)
  }
  if (!options.includeSystemMessages) {
    filtered = filtered.filter(m => m.role !== 'system')
  }
  return [...filtered].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

function exportMarkdown(messages: ChatMessage[], options: ExportOptions): string {
  const filtered = filterMessages(messages, options)
  const includeToolBlocks = options.includeToolBlocks ?? true
  const lines: string[] = ['# Conversation Export', '']

  for (const msg of filtered) {
    lines.push(`## ${roleLabel(msg.role)} — ${formatTimestamp(msg.timestamp)}`)
    if (msg.pinned) lines.push('📌 *Pinned*')
    if (msg.tags.length > 0) lines.push(`Tags: ${msg.tags.map(t => `\`${t}\``).join(', ')}`)
    if (msg.model) lines.push(`Model: \`${msg.model}\``)
    lines.push('')

    for (const block of msg.content) {
      const rendered = blockToMarkdown(block, includeToolBlocks)
      if (rendered) lines.push(rendered, '')
    }

    if (options.includeTokenUsage && msg.tokenUsage) {
      lines.push(`> Tokens: ${formatTokenUsage(msg.tokenUsage)}`)
      if (msg.apiDurationMs !== undefined) {
        lines.push(`> API latency: ${msg.apiDurationMs}ms`)
      }
      lines.push('')
    }

    lines.push('---', '')
  }

  if (options.includeAnalytics) {
    const a = computeAnalytics(filtered)
    lines.push(
      '## Analytics Summary',
      '',
      '| Metric | Value |',
      '| --- | --- |',
      `| Turns | ${a.turnCount} |`,
      `| Messages | user: ${a.messageCounts.user}, assistant: ${a.messageCounts.assistant}, system: ${a.messageCounts.system}, tool: ${a.messageCounts.tool} |`,
      `| Total tokens | in: ${a.tokenUsage.inputTokens}, out: ${a.tokenUsage.outputTokens} |`,
      `| Avg assistant tokens | ${a.avgAssistantTokens} |`,
      `| Avg API latency | ${a.avgApiLatencyMs}ms |`,
      `| Estimated cost | $${a.estimatedCostUsd.toFixed(4)} |`,
      `| Duration | ${Math.round(a.durationMs / 1000)}s |`,
      '',
      '### Tool Usage',
      '',
      ...Object.entries(a.toolUsageFrequency)
        .sort(([, x], [, y]) => y - x)
        .map(([tool, count]) => `- **${tool}**: ${count} calls`),
      '',
    )
  }

  return lines.join('\n')
}

function exportJSON(messages: ChatMessage[], options: ExportOptions): string {
  const filtered = filterMessages(messages, options)
  const payload: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    messageCount: filtered.length,
    messages: filtered.map(m => ({
      id: m.id,
      role: m.role,
      timestamp: m.timestamp,
      branchId: m.branchId,
      pinned: m.pinned,
      tags: m.tags,
      model: m.model,
      content: options.includeToolBlocks
        ? m.content
        : m.content.filter(b => b.type === 'text' || b.type === 'image'),
      ...(options.includeTokenUsage && m.tokenUsage
        ? { tokenUsage: m.tokenUsage, apiDurationMs: m.apiDurationMs }
        : {}),
    })),
  }

  if (options.includeAnalytics) {
    payload['analytics'] = computeAnalytics(filtered)
  }

  return JSON.stringify(payload, null, 2)
}

function exportText(messages: ChatMessage[], options: ExportOptions): string {
  const filtered = filterMessages(messages, options)
  const includeToolBlocks = options.includeToolBlocks ?? true
  const lines: string[] = ['=== Conversation Export ===', '']

  for (const msg of filtered) {
    const rolePart = roleLabel(msg.role)
    const modelPart = msg.model ? ` (${msg.model})` : ''
    const pinPart = msg.pinned ? ' 📌' : ''
    const header = `[${formatTimestamp(msg.timestamp)}] ${rolePart}${modelPart}${pinPart}`
    lines.push(header)
    lines.push('-'.repeat(header.length))

    for (const block of msg.content) {
      const rendered = blockToText(block, includeToolBlocks)
      if (rendered) lines.push(rendered)
    }

    if (options.includeTokenUsage && msg.tokenUsage) {
      lines.push(`  [Tokens: ${formatTokenUsage(msg.tokenUsage)}]`)
    }

    lines.push('')
  }

  if (options.includeAnalytics) {
    const a = computeAnalytics(filtered)
    lines.push(
      '=== Analytics ===',
      `Turns: ${a.turnCount}`,
      `Messages: user=${a.messageCounts.user} assistant=${a.messageCounts.assistant} system=${a.messageCounts.system} tool=${a.messageCounts.tool}`,
      `Tokens: in=${a.tokenUsage.inputTokens} out=${a.tokenUsage.outputTokens}`,
      `Avg assistant tokens: ${a.avgAssistantTokens}`,
      `Avg API latency: ${a.avgApiLatencyMs}ms`,
      `Estimated cost: $${a.estimatedCostUsd.toFixed(4)}`,
      `Duration: ${Math.round(a.durationMs / 1000)}s`,
      '',
      'Top tools:',
      ...Object.entries(a.toolUsageFrequency)
        .sort(([, x], [, y]) => y - x)
        .map(([tool, count]) => `  ${tool}: ${count}`),
    )
  }

  return lines.join('\n')
}

/**
 * Export a set of chat messages to the requested format.
 *
 * @param messages - The messages to export (may span multiple branches).
 * @param options  - Export configuration (format, filters, includes).
 * @returns The exported conversation as a string.
 */
export function exportConversation(
  messages: ChatMessage[],
  options: ExportOptions,
): string {
  const format: ExportFormat = options.format ?? 'markdown'

  switch (format) {
    case 'markdown':
      return exportMarkdown(messages, options)
    case 'json':
      return exportJSON(messages, options)
    case 'text':
      return exportText(messages, options)
    default: {
      const _exhaustive: never = format
      throw new Error(`Unsupported export format: ${_exhaustive}`)
    }
  }
}

// ╔═════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 5 — ADVANCED CHAT CLASS (Main Orchestrator)                      ║
// ║                                                                           ║
// ║  WHY: This is the heart of the module. It ties together ALL features:     ║
// ║    • Conversation management — create, manage messages                     ║
// ║    • Branching — fork at any message, switch between branches              ║
// ║    • Pinning & Tagging — bookmark important messages, add labels          ║
// ║    • Context Window — smart management of what fits in the LLM context    ║
// ║    • Search — integrated fuzzy/exact/regex search                          ║
// ║    • Analytics — token, cost, tool, and turn analytics                     ║
// ║    • Export — Markdown, JSON, or plain text                                ║
// ║    • Persistence — serialize/deserialize for saving and resuming          ║
// ║                                                                           ║
// ║  Users interact with this single class for all advanced chat operations.   ║
// ╚═════════════════════════════════════════════════════════════════════════════╝

/** Generate a UUID. Uses crypto.randomUUID when available, otherwise random hex. */
function generateId(): string {
  if (typeof globalThis !== 'undefined' && 'crypto' in globalThis) {
    const c = globalThis.crypto as { randomUUID?: () => string }
    if (typeof c.randomUUID === 'function') return c.randomUUID()
  }
  const hex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const DEFAULT_BRANCH_ID = 'main'

const DEFAULT_CONTEXT_CONFIG: ContextWindowConfig = {
  maxTokens: 200_000,
  reserveForResponse: 8_000,
  overflowStrategy: 'truncate_oldest',
  protectedPriorities: ['critical', 'high'],
}

/** Estimate token count for a message (uses actual usage if available, else heuristic). */
function estimateMessageTokens(msg: ChatMessage): number {
  if (msg.tokenUsage) {
    return msg.tokenUsage.inputTokens + msg.tokenUsage.outputTokens
  }
  const textLength = msg.content.reduce((sum, b) => {
    const text = b.text?.length ?? 0
    const result = b.toolResult?.length ?? 0
    const input = b.toolInput ? JSON.stringify(b.toolInput).length : 0
    return sum + text + result + input
  }, 0)
  return Math.ceil(textLength / 4) // ~4 chars per token heuristic
}

/**
 * The main class for managing an advanced AI chat conversation.
 *
 * Provides a unified API for:
 *  - Adding user/assistant/system/tool messages
 *  - Forking & switching conversation branches
 *  - Pinning messages and adding tags
 *  - Building optimised context windows for LLM calls
 *  - Searching through conversation history
 *  - Computing analytics (tokens, cost, tools, latency)
 *  - Exporting to Markdown, JSON, or plain text
 *  - Serialising/deserialising for persistence
 */
export class AdvancedChat {
  private conversation: Conversation
  private contextConfig: ContextWindowConfig
  private messagePriorities: Map<ChatMessageId, MessagePriority> = new Map()

  constructor(options?: {
    title?: string
    contextConfig?: Partial<ContextWindowConfig>
    metadata?: Partial<ConversationMetadata>
  }) {
    const now = new Date().toISOString()
    const mainBranch: Branch = {
      id: DEFAULT_BRANCH_ID,
      label: 'Main',
      createdAt: now,
    }

    this.conversation = {
      id: generateId(),
      title: options?.title ?? 'New Conversation',
      branches: [mainBranch],
      activeBranchId: DEFAULT_BRANCH_ID,
      messages: [],
      createdAt: now,
      updatedAt: now,
      totalTokenUsage: emptyUsage(),
      metadata: {
        modelsUsed: [],
        totalToolCalls: 0,
        estimatedCostUsd: 0,
        ...options?.metadata,
      },
    }

    this.contextConfig = { ...DEFAULT_CONTEXT_CONFIG, ...options?.contextConfig }
  }

  // ── Conversation State ──────────────────────────────────────────────────

  /** Get the full conversation object (read-only). */
  getConversation(): Readonly<Conversation> {
    return this.conversation
  }

  /** Get the conversation title. */
  getTitle(): string {
    return this.conversation.title
  }

  /** Update the conversation title. */
  setTitle(title: string): void {
    this.conversation.title = title
    this.touch()
  }

  /** Get the currently active branch id. */
  getActiveBranchId(): BranchId {
    return this.conversation.activeBranchId
  }

  // ── Message Management ──────────────────────────────────────────────────

  /**
   * Add a message to the conversation on the currently active branch.
   * @returns The newly created ChatMessage with generated id and timestamp.
   */
  addMessage(params: {
    role: ChatMessage['role']
    content: ContentBlock[]
    model?: string
    tokenUsage?: TokenUsage
    apiDurationMs?: number
    tags?: string[]
    priority?: MessagePriority
  }): ChatMessage {
    const msg: ChatMessage = {
      id: generateId(),
      role: params.role,
      content: params.content,
      timestamp: new Date().toISOString(),
      branchId: this.conversation.activeBranchId,
      pinned: false,
      tags: params.tags ?? [],
      tokenUsage: params.tokenUsage,
      model: params.model,
      apiDurationMs: params.apiDurationMs,
    }

    this.conversation.messages.push(msg)

    if (msg.tokenUsage) {
      this.conversation.totalTokenUsage = addUsage(
        this.conversation.totalTokenUsage,
        msg.tokenUsage,
      )
    }
    if (msg.model && !this.conversation.metadata.modelsUsed.includes(msg.model)) {
      this.conversation.metadata.modelsUsed.push(msg.model)
    }
    for (const block of msg.content) {
      if (block.type === 'tool_use') this.conversation.metadata.totalToolCalls++
    }

    if (params.priority) {
      this.messagePriorities.set(msg.id, params.priority)
    }

    this.touch()
    return msg
  }

  /** Convenience: add a user text message. */
  addUserMessage(text: string, tags?: string[]): ChatMessage {
    return this.addMessage({
      role: 'user',
      content: [{ type: 'text', text }],
      tags,
      priority: 'high',
    })
  }

  /** Convenience: add an assistant text message with optional model/token info. */
  addAssistantMessage(
    text: string,
    options?: { model?: string; tokenUsage?: TokenUsage; apiDurationMs?: number },
  ): ChatMessage {
    return this.addMessage({
      role: 'assistant',
      content: [{ type: 'text', text }],
      model: options?.model,
      tokenUsage: options?.tokenUsage,
      apiDurationMs: options?.apiDurationMs,
      priority: 'medium',
    })
  }

  /** Get all messages on the active branch (or specified branch) in chronological order. */
  getMessages(branchId?: BranchId): ChatMessage[] {
    const bid = branchId ?? this.conversation.activeBranchId
    return this.conversation.messages
      .filter(m => m.branchId === bid)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }

  /** Get a specific message by id. */
  getMessage(id: ChatMessageId): ChatMessage | undefined {
    return this.conversation.messages.find(m => m.id === id)
  }

  /** Get total message count across all branches. */
  getMessageCount(): number {
    return this.conversation.messages.length
  }

  // ── Pinning & Tagging ──────────────────────────────────────────────────

  /** Toggle pin status on a message. Returns new pin state. */
  togglePin(messageId: ChatMessageId): boolean {
    const msg = this.conversation.messages.find(m => m.id === messageId)
    if (!msg) return false
    msg.pinned = !msg.pinned
    this.touch()
    return msg.pinned
  }

  /** Add a tag to a message. */
  addTag(messageId: ChatMessageId, tag: string): boolean {
    const msg = this.conversation.messages.find(m => m.id === messageId)
    if (!msg) return false
    if (!msg.tags.includes(tag)) {
      msg.tags.push(tag)
      this.touch()
    }
    return true
  }

  /** Remove a tag from a message. */
  removeTag(messageId: ChatMessageId, tag: string): boolean {
    const msg = this.conversation.messages.find(m => m.id === messageId)
    if (!msg) return false
    const idx = msg.tags.indexOf(tag)
    if (idx >= 0) {
      msg.tags.splice(idx, 1)
      this.touch()
      return true
    }
    return false
  }

  /** Get all pinned messages on the active branch. */
  getPinnedMessages(branchId?: BranchId): ChatMessage[] {
    return getPinnedMessages(
      this.conversation.messages,
      branchId ?? this.conversation.activeBranchId,
    )
  }

  // ── Branching ──────────────────────────────────────────────────────────

  /**
   * Fork the conversation at a specific message, creating a new branch.
   *
   * All messages up to and including `forkAtMessageId` are copied to the
   * new branch. The new branch becomes the active branch.
   *
   * @returns The new branch id.
   */
  forkBranch(forkAtMessageId: ChatMessageId, label?: string): BranchId {
    const sourceMsg = this.conversation.messages.find(m => m.id === forkAtMessageId)
    if (!sourceMsg) {
      throw new Error(`Message ${forkAtMessageId} not found`)
    }

    const newBranchId = generateId()
    const now = new Date().toISOString()

    const newBranch: Branch = {
      id: newBranchId,
      label: label ?? `Branch ${this.conversation.branches.length + 1}`,
      parentBranchId: sourceMsg.branchId,
      forkPointMessageId: forkAtMessageId,
      createdAt: now,
    }

    const sourceBranchMessages = this.getMessages(sourceMsg.branchId)
    for (const msg of sourceBranchMessages) {
      const copy: ChatMessage = {
        ...msg,
        id: generateId(),
        branchId: newBranchId,
        parentMessageId: msg.id,
      }
      this.conversation.messages.push(copy)
      if (msg.id === forkAtMessageId) break
    }

    this.conversation.branches.push(newBranch)
    this.conversation.activeBranchId = newBranchId
    this.touch()

    return newBranchId
  }

  /** Switch the active branch. */
  switchBranch(branchId: BranchId): void {
    const branch = this.conversation.branches.find(b => b.id === branchId)
    if (!branch) {
      throw new Error(`Branch ${branchId} not found`)
    }
    this.conversation.activeBranchId = branchId
    this.touch()
  }

  /** List all branches. */
  getBranches(): ReadonlyArray<Branch> {
    return this.conversation.branches
  }

  // ── Smart Context Window ───────────────────────────────────────────────

  /**
   * Build a context window from the active branch's messages that fits
   * within the configured token limit.
   *
   * When the window overflows, the `overflowStrategy` decides what to drop:
   *  - truncate_oldest:  keep newest messages, drop oldest first
   *  - drop_low_priority: drop lowest-priority messages first
   *  - summarize: (falls back to truncate_oldest for now)
   */
  buildContextWindow(branchId?: BranchId): ContextWindowResult {
    const messages = this.getMessages(branchId)
    const budget = this.contextConfig.maxTokens - this.contextConfig.reserveForResponse

    const prioritised = messages.map(m => ({
      message: m,
      priority: this.messagePriorities.get(m.id) ?? 'medium' as MessagePriority,
      tokens: estimateMessageTokens(m),
    }))

    let totalTokens = prioritised.reduce((s, p) => s + p.tokens, 0)

    if (totalTokens <= budget) {
      return { messages, totalTokens, droppedCount: 0, wasTruncated: false }
    }

    const retained: typeof prioritised = []
    let droppedCount = 0

    switch (this.contextConfig.overflowStrategy) {
      case 'truncate_oldest': {
        const reversed = [...prioritised].reverse()
        let remaining = budget
        for (const entry of reversed) {
          const isProtected = this.contextConfig.protectedPriorities.includes(entry.priority)
          if (remaining >= entry.tokens || isProtected) {
            retained.unshift(entry)
            remaining -= entry.tokens
          } else {
            droppedCount++
          }
        }
        break
      }

      case 'drop_low_priority': {
        const priorityOrder: MessagePriority[] = ['critical', 'high', 'medium', 'low']
        const sorted = [...prioritised].sort(
          (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority),
        )
        let remaining = budget
        const keptIds = new Set<ChatMessageId>()
        for (const entry of sorted) {
          if (remaining >= entry.tokens) {
            keptIds.add(entry.message.id)
            remaining -= entry.tokens
          } else {
            droppedCount++
          }
        }
        for (const entry of prioritised) {
          if (keptIds.has(entry.message.id)) retained.push(entry)
        }
        break
      }

      case 'summarize':
      default: {
        const reversed = [...prioritised].reverse()
        let remaining = budget
        for (const entry of reversed) {
          if (remaining >= entry.tokens) {
            retained.unshift(entry)
            remaining -= entry.tokens
          } else {
            droppedCount++
          }
        }
        break
      }
    }

    totalTokens = retained.reduce((s, p) => s + p.tokens, 0)

    return {
      messages: retained.map(r => r.message),
      totalTokens,
      droppedCount,
      wasTruncated: droppedCount > 0,
    }
  }

  /** Update context window configuration. */
  setContextConfig(config: Partial<ContextWindowConfig>): void {
    this.contextConfig = { ...this.contextConfig, ...config }
  }

  /** Get current context window configuration. */
  getContextConfig(): Readonly<ContextWindowConfig> {
    return this.contextConfig
  }

  // ── Search ─────────────────────────────────────────────────────────────

  /** Full-featured search across all messages. */
  search(options: ChatSearchOptions): ChatSearchResult[] {
    return searchMessages(this.conversation.messages, options)
  }

  /** Search for messages that use a specific tool. */
  searchByTool(toolName: string, limit?: number): ChatSearchResult[] {
    return searchByTool(this.conversation.messages, toolName, limit)
  }

  // ── Analytics ──────────────────────────────────────────────────────────

  /** Compute analytics for the active branch (or all messages). */
  getAnalytics(branchId?: BranchId): ConversationAnalytics {
    const messages = branchId ? this.getMessages(branchId) : this.conversation.messages
    return computeAnalytics(messages)
  }

  /** Get the top N most-used tools. */
  getTopTools(n?: number) {
    return getTopTools(this.conversation.messages, n)
  }

  /** Get per-turn breakdown for the active branch. */
  getTurnBreakdown(branchId?: BranchId) {
    return getTurnBreakdown(this.getMessages(branchId))
  }

  // ── Export ─────────────────────────────────────────────────────────────

  /** Export the conversation to the desired format. */
  export(options: ExportOptions): string {
    return exportConversation(this.conversation.messages, options)
  }

  /** Quick export to Markdown with all features included. */
  exportMarkdown(): string {
    return this.export({
      format: 'markdown',
      branchId: this.conversation.activeBranchId,
      includeSystemMessages: false,
      includeToolBlocks: true,
      includeTokenUsage: true,
      includeAnalytics: true,
    })
  }

  /** Quick export to JSON. */
  exportJSON(): string {
    return this.export({
      format: 'json',
      branchId: this.conversation.activeBranchId,
      includeSystemMessages: true,
      includeToolBlocks: true,
      includeTokenUsage: true,
      includeAnalytics: true,
    })
  }

  // ── Serialisation (Save & Restore) ─────────────────────────────────────

  /** Serialise the entire conversation to a JSON string for persistence. */
  serialize(): string {
    return JSON.stringify({
      conversation: this.conversation,
      contextConfig: this.contextConfig,
      messagePriorities: Object.fromEntries(this.messagePriorities),
    })
  }

  /** Restore an AdvancedChat instance from a serialised JSON string. */
  static deserialize(json: string): AdvancedChat {
    const data = JSON.parse(json) as {
      conversation: Conversation
      contextConfig: ContextWindowConfig
      messagePriorities: Record<string, MessagePriority>
    }
    const chat = new AdvancedChat()
    chat.conversation = data.conversation
    chat.contextConfig = data.contextConfig
    chat.messagePriorities = new Map(Object.entries(data.messagePriorities))
    return chat
  }

  // ── Internal ───────────────────────────────────────────────────────────

  private touch(): void {
    this.conversation.updatedAt = new Date().toISOString()
  }
}
