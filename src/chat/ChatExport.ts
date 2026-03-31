/**
 * Advanced AI Chat - Conversation Export
 *
 * Export conversations to Markdown, JSON, or plain-text formats with
 * configurable inclusion of system messages, tool blocks, token usage,
 * and analytics summaries.
 */

import { computeAnalytics } from './ChatAnalytics.js'
import type {
  ChatMessage,
  ContentBlock,
  ExportFormat,
  ExportOptions,
  TokenUsage,
} from './types.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Content Block Rendering
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------------

function filterMessages(messages: ChatMessage[], options: ExportOptions): ChatMessage[] {
  let filtered = messages

  if (options.branchId) {
    filtered = filtered.filter(m => m.branchId === options.branchId)
  }

  if (!options.includeSystemMessages) {
    filtered = filtered.filter(m => m.role !== 'system')
  }

  // Sort chronologically
  return [...filtered].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

// ---------------------------------------------------------------------------
// Markdown Export
// ---------------------------------------------------------------------------

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
    lines.push(...renderAnalyticsMarkdown(filtered))
  }

  return lines.join('\n')
}

function renderAnalyticsMarkdown(messages: ChatMessage[]): string[] {
  const a = computeAnalytics(messages)
  return [
    '## Analytics Summary',
    '',
    `| Metric | Value |`,
    `| --- | --- |`,
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
      .sort(([, a], [, b]) => b - a)
      .map(([tool, count]) => `- **${tool}**: ${count} calls`),
    '',
  ]
}

// ---------------------------------------------------------------------------
// JSON Export
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Plain Text Export
// ---------------------------------------------------------------------------

function exportText(messages: ChatMessage[], options: ExportOptions): string {
  const filtered = filterMessages(messages, options)
  const includeToolBlocks = options.includeToolBlocks ?? true
  const lines: string[] = ['=== Conversation Export ===', '']

  for (const msg of filtered) {
    const header = `[${formatTimestamp(msg.timestamp)}] ${roleLabel(msg.role)}${msg.model ? ` (${msg.model})` : ''}${msg.pinned ? ' 📌' : ''}`
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
        .sort(([, a], [, b]) => b - a)
        .map(([tool, count]) => `  ${tool}: ${count}`),
    )
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Export a set of chat messages to the requested format.
 *
 * @param messages - The messages to export (may span multiple branches).
 * @param options  - Export configuration.
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
