/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Error Recovery & State Checkpointing — Dead Letter Queue                    ║
 * ║                                                                              ║
 * ║  Captures operations that exhausted all recovery strategies:                 ║
 * ║    • enqueue / dequeue / peek / retry / purge                               ║
 * ║    • Automatic retry-count tracking                                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import type { DeadLetterEntry } from './types.js'

// ── Helpers ──

let counter = 0
function generateId(): string {
  return `dl_${Date.now()}_${++counter}`
}

// ── Dead Letter Queue ──

export class DeadLetterQueue {
  private entries: DeadLetterEntry[] = []

  enqueue(operation: string, error: Error | string): DeadLetterEntry {
    const entry: DeadLetterEntry = {
      id: generateId(),
      timestamp: Date.now(),
      operation,
      error: typeof error === 'string' ? error : error.message,
      retryCount: 0,
      lastRetryAt: null,
    }
    this.entries.push(entry)
    return entry
  }

  dequeue(): DeadLetterEntry | undefined {
    return this.entries.shift()
  }

  peek(): DeadLetterEntry | undefined {
    return this.entries[0]
  }

  retry(id: string): DeadLetterEntry | undefined {
    const entry = this.entries.find(e => e.id === id)
    if (!entry) return undefined
    entry.retryCount++
    entry.lastRetryAt = Date.now()
    return entry
  }

  size(): number {
    return this.entries.length
  }

  list(): DeadLetterEntry[] {
    return [...this.entries]
  }

  purge(olderThan?: number): number {
    if (olderThan === undefined) {
      const count = this.entries.length
      this.entries = []
      return count
    }

    const cutoff = Date.now() - olderThan
    const before = this.entries.length
    this.entries = this.entries.filter(e => e.timestamp >= cutoff)
    return before - this.entries.length
  }
}
