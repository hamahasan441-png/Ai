/**
 * Advanced AI Chat - Core Manager
 *
 * Orchestrates all advanced chat features: conversation management with
 * branching, message pinning & tagging, smart context-window management,
 * integrated search, analytics, and export.
 */

import { computeAnalytics, getTopTools, getTurnBreakdown } from './ChatAnalytics.js'
import { exportConversation } from './ChatExport.js'
import { getPinnedMessages, searchByTool, searchMessages } from './ChatSearch.js'

/** Generate a v4-style UUID without depending on the `crypto` module at the type level. */
function generateId(): string {
  // Use crypto.randomUUID when available (Node 19+, Bun, modern browsers),
  // otherwise fall back to a simple random hex string.
  if (typeof globalThis !== 'undefined' && 'crypto' in globalThis) {
    const c = globalThis.crypto as { randomUUID?: () => string }
    if (typeof c.randomUUID === 'function') return c.randomUUID()
  }
  // Fallback: 32 random hex chars formatted as a UUID-like string.
  const hex = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

import type {
  Branch,
  BranchId,
  ChatMessage,
  ChatMessageId,
  ChatSearchOptions,
  ChatSearchResult,
  ContentBlock,
  ContextWindowConfig,
  ContextWindowResult,
  Conversation,
  ConversationAnalytics,
  ConversationMetadata,
  ExportOptions,
  MessagePriority,
  TokenUsage,
} from './types.js'

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_BRANCH_ID = 'main'

const DEFAULT_CONTEXT_CONFIG: ContextWindowConfig = {
  maxTokens: 200_000,
  reserveForResponse: 8_000,
  overflowStrategy: 'truncate_oldest',
  protectedPriorities: ['critical', 'high'],
}

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

function estimateMessageTokens(msg: ChatMessage): number {
  if (msg.tokenUsage) {
    return msg.tokenUsage.inputTokens + msg.tokenUsage.outputTokens
  }
  // Rough heuristic: ~4 chars per token
  const textLength = msg.content.reduce((sum, b) => {
    return sum + (b.text?.length ?? 0) + (b.toolResult?.length ?? 0) + (b.toolInput ? JSON.stringify(b.toolInput).length : 0)
  }, 0)
  return Math.ceil(textLength / 4)
}

// ---------------------------------------------------------------------------
// AdvancedChat Class
// ---------------------------------------------------------------------------

/**
 * The main class for managing an advanced AI chat conversation.
 *
 * Features:
 *  - **Branching**: fork conversations at any point and switch between branches.
 *  - **Pinning & Tagging**: bookmark important messages and tag them for filtering.
 *  - **Smart Context Window**: automatically manage which messages fit inside
 *    the model's context window using configurable strategies.
 *  - **Search**: full-text, regex, and fuzzy search with relevance scoring.
 *  - **Analytics**: token usage, cost estimation, tool frequency, and more.
 *  - **Export**: conversations to Markdown, JSON, or plain text.
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

  // -----------------------------------------------------------------------
  // Conversation State
  // -----------------------------------------------------------------------

  /** Get the full conversation object. */
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

  // -----------------------------------------------------------------------
  // Message Management
  // -----------------------------------------------------------------------

  /**
   * Add a message to the conversation on the currently active branch.
   *
   * @returns The newly created message with generated id and timestamp.
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

    // Update aggregates
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

  /** Convenience: add an assistant text message. */
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

  /** Get all messages on the active branch, in chronological order. */
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

  /** Get total message count (all branches). */
  getMessageCount(): number {
    return this.conversation.messages.length
  }

  // -----------------------------------------------------------------------
  // Pinning & Tagging
  // -----------------------------------------------------------------------

  /** Pin or unpin a message. */
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

  // -----------------------------------------------------------------------
  // Branching
  // -----------------------------------------------------------------------

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

    // Copy messages up to the fork point into the new branch.
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

  // -----------------------------------------------------------------------
  // Smart Context Window
  // -----------------------------------------------------------------------

  /**
   * Build a context window from the active branch's messages that fits
   * within the configured token limit.
   *
   * Messages are retained in conversation order. When the window overflows,
   * the configured `overflowStrategy` determines which messages are dropped.
   */
  buildContextWindow(branchId?: BranchId): ContextWindowResult {
    const messages = this.getMessages(branchId)
    const budget = this.contextConfig.maxTokens - this.contextConfig.reserveForResponse

    // Always keep the system prompt (first message if system) and latest user message.
    const prioritised = messages.map(m => ({
      message: m,
      priority: this.messagePriorities.get(m.id) ?? 'medium' as MessagePriority,
      tokens: estimateMessageTokens(m),
    }))

    let totalTokens = prioritised.reduce((s, p) => s + p.tokens, 0)

    if (totalTokens <= budget) {
      return {
        messages,
        totalTokens,
        droppedCount: 0,
        wasTruncated: false,
      }
    }

    // Need to drop messages according to strategy.
    const retained: typeof prioritised = []
    let droppedCount = 0

    switch (this.contextConfig.overflowStrategy) {
      case 'truncate_oldest': {
        // Keep from the end, dropping oldest non-protected messages first.
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
        // Sort by priority, keep highest priority messages first.
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
        // Re-order by conversation position.
        for (const entry of prioritised) {
          if (keptIds.has(entry.message.id)) retained.push(entry)
        }
        break
      }

      case 'summarize':
      default: {
        // Fallback: same as truncate_oldest (real summarisation would need
        // an LLM call which is out of scope for this utility module).
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

  // -----------------------------------------------------------------------
  // Search
  // -----------------------------------------------------------------------

  /** Full-featured search across all messages. */
  search(options: ChatSearchOptions): ChatSearchResult[] {
    return searchMessages(this.conversation.messages, options)
  }

  /** Search for messages that use a specific tool. */
  searchByTool(toolName: string, limit?: number): ChatSearchResult[] {
    return searchByTool(this.conversation.messages, toolName, limit)
  }

  // -----------------------------------------------------------------------
  // Analytics
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // Export
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // Serialisation
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private touch(): void {
    this.conversation.updatedAt = new Date().toISOString()
  }
}
