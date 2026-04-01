/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Cache Key Generation                                                        ║
 * ║                                                                              ║
 * ║  Hash-based key generation for cache deduplication.                           ║
 * ║  Uses Node.js built-in crypto for reliable, fast hashing.                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as crypto from 'crypto'

/**
 * Generate a deterministic cache key from input components.
 * Uses SHA-256 truncated to 16 hex characters for compact keys.
 */
export function cacheKey(...parts: string[]): string {
  const hash = crypto.createHash('sha256')
  for (const part of parts) {
    hash.update(part)
    hash.update('\0') // separator to avoid collisions between ("ab","cd") and ("a","bcd")
  }
  return hash.digest('hex').slice(0, 32)
}

/**
 * Generate a cache key specifically for AI chat queries.
 * Includes system prompt and user message for unique identification.
 */
export function chatCacheKey(systemPrompt: string, userMessage: string): string {
  return cacheKey('chat', systemPrompt, userMessage)
}

/**
 * Generate a cache key for knowledge search queries.
 */
export function knowledgeCacheKey(query: string): string {
  return cacheKey('knowledge', query)
}

/**
 * Generate a cache key for tool results.
 */
export function toolCacheKey(toolName: string, input: string): string {
  return cacheKey('tool', toolName, input)
}
