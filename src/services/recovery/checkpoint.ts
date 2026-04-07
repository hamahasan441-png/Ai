/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Error Recovery & State Checkpointing — Checkpoint Manager                   ║
 * ║                                                                              ║
 * ║  Provides in-memory checkpoint storage and a high-level manager:             ║
 * ║    • MemoryCheckpointStore – Map-backed CheckpointStore                      ║
 * ║    • CheckpointManager – save / restore / list / cleanup helpers             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import type { Checkpoint, CheckpointStore, CheckpointType } from './types.js'

// ── Helpers ──

let counter = 0
function generateId(): string {
  return `cp_${Date.now()}_${++counter}`
}

// ── Memory Store ──

export class MemoryCheckpointStore implements CheckpointStore {
  private store = new Map<string, Checkpoint>()

  async save(checkpoint: Checkpoint): Promise<void> {
    this.store.set(checkpoint.id, checkpoint)
  }

  async load(id: string): Promise<Checkpoint | undefined> {
    return this.store.get(id)
  }

  async list(type?: CheckpointType): Promise<Checkpoint[]> {
    const all = [...this.store.values()]
    if (type) return all.filter(cp => cp.type === type)
    return all
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id)
  }

  async cleanup(maxAge?: number, maxCount?: number): Promise<number> {
    const now = Date.now()
    let removed = 0

    // Remove entries older than maxAge (ms)
    if (maxAge !== undefined) {
      for (const [id, cp] of this.store) {
        if (now - cp.timestamp > maxAge) {
          this.store.delete(id)
          removed++
        }
      }
    }

    // Trim to maxCount, keeping newest
    if (maxCount !== undefined && this.store.size > maxCount) {
      const sorted = [...this.store.entries()].sort(
        (a, b) => b[1].timestamp - a[1].timestamp,
      )
      const toRemove = sorted.slice(maxCount)
      for (const [id] of toRemove) {
        this.store.delete(id)
        removed++
      }
    }

    return removed
  }
}

// ── Checkpoint Manager ──

export class CheckpointManager {
  private store: CheckpointStore

  constructor(store?: CheckpointStore) {
    this.store = store ?? new MemoryCheckpointStore()
  }

  async save(
    type: CheckpointType,
    state: Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ): Promise<Checkpoint> {
    const checkpoint: Checkpoint = {
      id: generateId(),
      timestamp: Date.now(),
      type,
      state,
      metadata,
    }
    await this.store.save(checkpoint)
    return checkpoint
  }

  async restore(id: string): Promise<Checkpoint | undefined> {
    return this.store.load(id)
  }

  async restoreLatest(type: CheckpointType): Promise<Checkpoint | undefined> {
    const items = await this.store.list(type)
    if (items.length === 0) return undefined
    // Sort by timestamp descending; break ties by id descending (later counter = later save)
    return items.sort((a, b) => b.timestamp - a.timestamp || b.id.localeCompare(a.id))[0]
  }

  async list(type?: CheckpointType): Promise<Checkpoint[]> {
    return this.store.list(type)
  }

  async cleanup(maxAge?: number, maxCount?: number): Promise<number> {
    return this.store.cleanup(maxAge, maxCount)
  }
}
