/**
 * Advanced AI Chat - Conversation Analytics
 *
 * Computes rich analytics and statistics for conversations including
 * token usage, cost estimation, tool frequency, and model breakdowns.
 */

import type {
  ChatMessage,
  ChatRole,
  ConversationAnalytics,
  ModelUsageBreakdown,
  TokenUsage,
} from './types.js'

// ---------------------------------------------------------------------------
// Cost Estimation Constants
// ---------------------------------------------------------------------------

/**
 * Approximate cost per 1 000 tokens for popular models.
 * Input and output costs are averaged for simplicity.
 * These are rough estimates – real pricing depends on the provider.
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

// ---------------------------------------------------------------------------
// Token Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute comprehensive analytics for an array of chat messages.
 *
 * The messages are expected to belong to a single conversation (or branch).
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

  // -- message counts --
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

  // -- turn counting: each user message starts a new turn --
  let turnCount = 0

  for (const msg of messages) {
    // Role counts
    const role = msg.role as ChatRole
    messageCounts[role] = (messageCounts[role] ?? 0) + 1

    // Turn counting
    if (role === 'user') turnCount++

    // Token aggregation
    if (msg.tokenUsage) {
      totalUsage = addUsage(totalUsage, msg.tokenUsage)
    }

    // Assistant-specific metrics
    if (role === 'assistant') {
      assistantMessageCount++
      if (msg.tokenUsage) {
        totalAssistantOutputTokens += msg.tokenUsage.outputTokens
      }
      if (msg.apiDurationMs !== undefined) {
        totalApiLatency += msg.apiDurationMs
        apiLatencyCount++
      }

      // Model breakdown
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

    // Tool usage frequency
    for (const block of msg.content) {
      if (block.type === 'tool_use' && block.toolName) {
        toolFrequency[block.toolName] = (toolFrequency[block.toolName] ?? 0) + 1
      }
    }
  }

  // -- duration --
  const sorted = [...messages].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const first = sorted[0]!
  const last = sorted[sorted.length - 1]!
  const durationMs =
    new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()

  // -- model breakdown --
  const modelBreakdown: ModelUsageBreakdown[] = [...modelMap.entries()].map(
    ([model, data]) => ({
      model,
      ...data,
    }),
  )

  // -- cost --
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

/**
 * Return the top-N most frequently used tools across the given messages.
 */
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

/**
 * Compute a per-turn breakdown (user message → assistant response pair).
 */
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
      // Finalise previous turn
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
      // Duration: time from user message to last assistant message in turn
      currentTurn.turnDurationMs =
        new Date(msg.timestamp).getTime() -
        new Date(currentTurn.userMessage.timestamp).getTime()
    }
  }

  if (currentTurn) turns.push(currentTurn)

  return turns
}
