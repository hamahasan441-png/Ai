/**
 * Advanced AI Chat - Search Engine
 *
 * Provides full-text, exact, and regex search across chat messages with
 * relevance scoring, highlighting, and rich filtering capabilities.
 */

import type {
  ChatMessage,
  ChatRole,
  ChatSearchOptions,
  ChatSearchResult,
  ContentBlock,
  SearchHighlight,
  SearchMode,
} from './types.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
 * - **exact** – case-insensitive literal match.
 * - **regex** – user-provided pattern, with the `i` and `g` flags.
 * - **fuzzy** – splits the query into words and matches them in order with
 *   optional characters in between (e.g. "foo bar" → /foo.*bar/i).
 */
function buildPattern(query: string, mode: SearchMode): RegExp {
  switch (mode) {
    case 'exact':
      return new RegExp(escapeRegex(query), 'gi')

    case 'regex':
      try {
        return new RegExp(query, 'gi')
      } catch {
        // Fall back to literal match when the user provides an invalid regex.
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

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Compute a relevance score for `text` given a `pattern`.
 *
 * Scoring heuristic:
 *  - Base: number of pattern matches normalised by text length.
 *  - Bonus for exact (case-sensitive) hits.
 *  - Penalty when the matched region is a small fraction of a long text.
 */
function computeScore(text: string, pattern: RegExp, query: string): number {
  if (text.length === 0) return 0

  const matches = [...text.matchAll(new RegExp(pattern.source, pattern.flags))]
  if (matches.length === 0) return 0

  // Base score: match density (capped at 1).
  const density = Math.min(matches.length / (text.length / Math.max(query.length, 1)), 1)

  // Exact-case bonus.
  const exactMatches = [...text.matchAll(new RegExp(pattern.source, 'g'))]
  const exactBonus = exactMatches.length > 0 ? 0.1 : 0

  // Length penalty – very long texts with a single match score lower.
  const lengthPenalty = text.length > 5000 ? 0.95 : 1

  return Math.min((density + exactBonus) * lengthPenalty, 1)
}

// ---------------------------------------------------------------------------
// Highlighting
// ---------------------------------------------------------------------------

/** Build `SearchHighlight` objects for all matches of `pattern` in `text`. */
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

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

/** Return `true` when a message passes all non-text filters from `options`. */
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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search through an array of chat messages using the given options.
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
      // Reset lastIndex – the `g` flag makes test() stateful.
      pattern.lastIndex = 0
      continue
    }
    pattern.lastIndex = 0

    const score = computeScore(text, pattern, query)
    const highlights = buildHighlights(text, pattern)

    results.push({ message: msg, score, highlights })
  }

  // Sort by score descending, then by timestamp descending for ties.
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.message.timestamp.localeCompare(a.message.timestamp)
  })

  return results.slice(0, limit)
}

/**
 * Convenience wrapper: search for messages that mention a specific tool.
 */
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

/**
 * Return all pinned messages, optionally filtered to a single branch.
 */
export function getPinnedMessages(
  messages: ChatMessage[],
  branchId?: string,
): ChatMessage[] {
  return messages.filter(
    m => m.pinned && (branchId ? m.branchId === branchId : true),
  )
}
