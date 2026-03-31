/**
 * Advanced AI Chat - Type Definitions
 *
 * Core types for the advanced chat module including conversation branching,
 * message pinning, search, analytics, and export capabilities.
 */

// ---------------------------------------------------------------------------
// Message & Conversation Primitives
// ---------------------------------------------------------------------------

/** Unique identifier for a chat message. */
export type ChatMessageId = string

/** Unique identifier for a conversation branch. */
export type BranchId = string

/** Roles within a conversation turn. */
export type ChatRole = 'user' | 'assistant' | 'system' | 'tool'

/** Supported content block kinds inside a single message. */
export type ContentBlockType = 'text' | 'tool_use' | 'tool_result' | 'image'

/** A single content block that can appear inside a ChatMessage. */
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
 * Extends the base concept of the existing `Message` type with metadata
 * useful for branching, pinning, search, and analytics.
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

/** Token usage breakdown for a single message or turn. */
export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  cacheReadTokens?: number
  cacheCreationTokens?: number
}

// ---------------------------------------------------------------------------
// Conversation & Branching
// ---------------------------------------------------------------------------

/** Metadata for a single conversation branch. */
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

/** A full conversation that may span multiple branches. */
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

/** Extra metadata attached to a conversation. */
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

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/** Supported search modes. */
export type SearchMode = 'fuzzy' | 'exact' | 'regex'

/** Options for searching through chat messages. */
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

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

/** High-level analytics for a conversation. */
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

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Formats available for conversation export. */
export type ExportFormat = 'markdown' | 'json' | 'text'

/** Options when exporting a conversation. */
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

// ---------------------------------------------------------------------------
// Context Window Management
// ---------------------------------------------------------------------------

/** Priority levels for messages in the context window. */
export type MessagePriority = 'critical' | 'high' | 'medium' | 'low'

/** Configuration for smart context-window management. */
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
