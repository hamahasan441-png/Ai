/**
 * Advanced AI Chat Module
 *
 * Provides a comprehensive advanced chat system with:
 *  - Conversation branching & forking
 *  - Message pinning & tagging
 *  - Smart context-window management
 *  - Full-text, regex, and fuzzy search with relevance scoring
 *  - Rich conversation analytics (tokens, cost, tool frequency)
 *  - Export to Markdown, JSON, and plain text
 *
 * @example
 * ```ts
 * import { AdvancedChat } from './chat/index.js'
 *
 * const chat = new AdvancedChat({ title: 'My Session' })
 *
 * // Add messages
 * chat.addUserMessage('Explain the repository structure')
 * chat.addAssistantMessage('This repo contains...', {
 *   model: 'claude-sonnet-4-20250514',
 *   tokenUsage: { inputTokens: 500, outputTokens: 1200 },
 *   apiDurationMs: 3400,
 * })
 *
 * // Pin important messages
 * const msgs = chat.getMessages()
 * chat.togglePin(msgs[0].id)
 *
 * // Fork a branch
 * chat.forkBranch(msgs[0].id, 'Alternative approach')
 * chat.addUserMessage('Try a different approach...')
 *
 * // Search
 * const results = chat.search({ query: 'repository', mode: 'fuzzy' })
 *
 * // Analytics
 * const analytics = chat.getAnalytics()
 * console.log(`Turns: ${analytics.turnCount}, Cost: $${analytics.estimatedCostUsd}`)
 *
 * // Export
 * const md = chat.exportMarkdown()
 * const json = chat.exportJSON()
 *
 * // Context window
 * const ctx = chat.buildContextWindow()
 * console.log(`${ctx.messages.length} messages fit (${ctx.totalTokens} tokens)`)
 *
 * // Persistence
 * const serialized = chat.serialize()
 * const restored = AdvancedChat.deserialize(serialized)
 * ```
 */

// Core
export { AdvancedChat } from './AdvancedChat.js'

// Search
export { searchMessages, searchByTool, getPinnedMessages } from './ChatSearch.js'

// Analytics
export { computeAnalytics, getTopTools, getTurnBreakdown } from './ChatAnalytics.js'

// Export
export { exportConversation } from './ChatExport.js'

// Types
export type {
  // Messages
  ChatMessageId,
  ChatMessage,
  ChatRole,
  ContentBlock,
  ContentBlockType,
  TokenUsage,
  // Conversation & Branching
  Branch,
  BranchId,
  Conversation,
  ConversationMetadata,
  // Search
  SearchMode,
  ChatSearchOptions,
  ChatSearchResult,
  SearchHighlight,
  // Analytics
  ConversationAnalytics,
  ModelUsageBreakdown,
  // Export
  ExportFormat,
  ExportOptions,
  // Context Window
  MessagePriority,
  ContextWindowConfig,
  ContextWindowResult,
} from './types.js'
