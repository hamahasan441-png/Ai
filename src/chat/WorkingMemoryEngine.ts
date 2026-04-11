/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  WorkingMemoryEngine — Active thought management & scratchpad reasoning    ║
 * ║                                                                            ║
 * ║  Manages the AI's active working memory with attention-based slot          ║
 * ║  management, memory decay, priority queues, and chunking for efficient     ║
 * ║  multi-step reasoning within limited cognitive bandwidth.                  ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Slot-based working memory (7±2 active items, like human cognition)    ║
 * ║    • Attention mechanism with focus/defocus/spotlight                      ║
 * ║    • Temporal decay — unused items fade over time                          ║
 * ║    • Chunking — group related items to free slots                         ║
 * ║    • Scratchpad — scratch space for intermediate reasoning steps           ║
 * ║    • Priority queue — urgent items get promoted                           ║
 * ║    • Context binding — link items to conversational context               ║
 * ║    • Interference detection — flag conflicting active items               ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type MemorySlotType =
  | 'fact'
  | 'goal'
  | 'constraint'
  | 'intermediate'
  | 'context'
  | 'instruction'
  | 'hypothesis'

export type AttentionLevel = 'focused' | 'active' | 'peripheral' | 'decaying'

export interface MemorySlot {
  readonly id: string
  readonly type: MemorySlotType
  readonly content: string
  readonly metadata: Record<string, string>
  readonly createdAt: number
  lastAccessedAt: number
  accessCount: number
  attention: AttentionLevel
  priority: number // 0-1
  decay: number // current decay factor 0-1 (1 = fresh, 0 = faded)
  readonly bindings: string[] // IDs of related slots
  readonly chunkId: string | null
}

export interface MemoryChunk {
  readonly id: string
  readonly label: string
  readonly slotIds: string[]
  readonly createdAt: number
  readonly summary: string
}

export interface ScratchpadEntry {
  readonly id: string
  readonly step: number
  readonly content: string
  readonly reasoning: string
  readonly timestamp: number
  readonly linkedSlots: string[]
}

export interface AttentionSnapshot {
  readonly focused: MemorySlot[]
  readonly active: MemorySlot[]
  readonly peripheral: MemorySlot[]
  readonly decaying: MemorySlot[]
  readonly totalSlots: number
  readonly usedCapacity: number
  readonly freeCapacity: number
}

export interface InterferenceResult {
  readonly slot1Id: string
  readonly slot2Id: string
  readonly type: 'contradiction' | 'competition' | 'redundancy'
  readonly severity: number
  readonly description: string
}

export interface WorkingMemoryEngineConfig {
  readonly maxSlots: number // Default: 9 (7+2)
  readonly decayRatePerSecond: number // Default: 0.001
  readonly focusBoost: number // Default: 0.3
  readonly accessBoost: number // Default: 0.1
  readonly chunkCapacitySaving: number // Default: 0.6 (chunk saves 60% of slot capacity)
  readonly interferenceThreshold: number // Default: 0.5
  readonly maxScratchpadEntries: number // Default: 50
  readonly maxChunks: number // Default: 20
}

export interface WorkingMemoryEngineStats {
  readonly totalItemsStored: number
  readonly totalItemsEvicted: number
  readonly totalChunksCreated: number
  readonly totalScratchpadEntries: number
  readonly avgSlotLifetime: number
  readonly interferenceCount: number
  readonly currentOccupancy: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_WORKING_MEMORY_CONFIG: WorkingMemoryEngineConfig = {
  maxSlots: 9,
  decayRatePerSecond: 0.001,
  focusBoost: 0.3,
  accessBoost: 0.1,
  chunkCapacitySaving: 0.6,
  interferenceThreshold: 0.5,
  maxScratchpadEntries: 50,
  maxChunks: 20,
}

const ATTENTION_THRESHOLDS: Record<AttentionLevel, number> = {
  focused: 0.8,
  active: 0.5,
  peripheral: 0.2,
  decaying: 0.0,
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 2),
  )
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0
  let intersection = 0
  for (const t of a) if (b.has(t)) intersection++
  return intersection / (a.size + b.size - intersection)
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class WorkingMemoryEngine {
  private readonly config: WorkingMemoryEngineConfig
  private readonly slots: Map<string, MemorySlot> = new Map()
  private readonly chunks: Map<string, MemoryChunk> = new Map()
  private readonly scratchpad: ScratchpadEntry[] = []
  private stats = {
    totalStored: 0,
    totalEvicted: 0,
    totalChunks: 0,
    totalScratchpad: 0,
    totalLifetime: 0,
    lifetimeCount: 0,
    interferenceCount: 0,
  }

  constructor(config: Partial<WorkingMemoryEngineConfig> = {}) {
    this.config = { ...DEFAULT_WORKING_MEMORY_CONFIG, ...config }
  }

  // ── Slot management ────────────────────────────────────────────────────

  /** Store an item in working memory. Evicts lowest-priority if full. */
  store(
    type: MemorySlotType,
    content: string,
    options: {
      priority?: number
      metadata?: Record<string, string>
      bindings?: string[]
    } = {},
  ): MemorySlot {
    // Apply decay first
    this.applyDecay()

    // Check capacity — evict if needed
    if (this.getEffectiveOccupancy() >= this.config.maxSlots) {
      this.evictLowest()
    }

    const slot: MemorySlot = {
      id: generateId('wm'),
      type,
      content,
      metadata: options.metadata ?? {},
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 1,
      attention: 'active',
      priority: clamp(options.priority ?? 0.5, 0, 1),
      decay: 1.0,
      bindings: options.bindings ?? [],
      chunkId: null,
    }

    this.slots.set(slot.id, slot)
    this.stats.totalStored++
    this.updateAttentionLevels()
    return slot
  }

  /** Retrieve a slot by ID, boosting its attention. */
  access(slotId: string): MemorySlot | null {
    const slot = this.slots.get(slotId)
    if (!slot) return null

    slot.lastAccessedAt = Date.now()
    slot.accessCount++
    slot.decay = clamp(slot.decay + this.config.accessBoost, 0, 1)
    this.updateAttentionLevels()
    return slot
  }

  /** Focus attention on a specific slot. */
  focus(slotId: string): MemorySlot | null {
    const slot = this.slots.get(slotId)
    if (!slot) return null

    slot.decay = clamp(slot.decay + this.config.focusBoost, 0, 1)
    slot.priority = clamp(slot.priority + 0.1, 0, 1)
    slot.lastAccessedAt = Date.now()
    slot.attention = 'focused'
    return slot
  }

  /** Explicitly remove a slot. */
  remove(slotId: string): boolean {
    const slot = this.slots.get(slotId)
    if (!slot) return false
    this.recordEviction(slot)
    this.slots.delete(slotId)
    return true
  }

  /** Get all active slots. */
  getAll(): readonly MemorySlot[] {
    return [...this.slots.values()]
  }

  /** Get slot by ID without boosting. */
  peek(slotId: string): MemorySlot | null {
    return this.slots.get(slotId) ?? null
  }

  /** Search slots by content similarity. */
  search(query: string): MemorySlot[] {
    const queryTokens = tokenize(query)
    const scored: Array<{ slot: MemorySlot; score: number }> = []

    for (const slot of this.slots.values()) {
      const slotTokens = tokenize(slot.content)
      const sim = jaccardSimilarity(queryTokens, slotTokens)
      if (sim > 0.1) {
        scored.push({ slot, score: sim })
      }
    }

    return scored.sort((a, b) => b.score - a.score).map(s => s.slot)
  }

  // ── Chunking ───────────────────────────────────────────────────────────

  /** Group multiple slots into a chunk, freeing effective capacity. */
  chunk(slotIds: string[], label: string): MemoryChunk | null {
    const validIds = slotIds.filter(id => this.slots.has(id))
    if (validIds.length < 2) return null
    if (this.chunks.size >= this.config.maxChunks) return null

    const summaryParts = validIds.map(id => {
      const s = this.slots.get(id)!
      return s.content.slice(0, 50)
    })

    const chunk: MemoryChunk = {
      id: generateId('chunk'),
      label,
      slotIds: validIds,
      createdAt: Date.now(),
      summary: summaryParts.join(' | '),
    }

    // Update slots to reference chunk
    for (const id of validIds) {
      const slot = this.slots.get(id)!
      ;(slot as { chunkId: string | null }).chunkId = chunk.id
    }

    this.chunks.set(chunk.id, chunk)
    this.stats.totalChunks++
    return chunk
  }

  /** Dissolve a chunk, restoring individual slots. */
  unchunk(chunkId: string): boolean {
    const chunk = this.chunks.get(chunkId)
    if (!chunk) return false

    for (const id of chunk.slotIds) {
      const slot = this.slots.get(id)
      if (slot) {
        ;(slot as { chunkId: string | null }).chunkId = null
      }
    }

    this.chunks.delete(chunkId)
    return true
  }

  /** Get all chunks. */
  getChunks(): readonly MemoryChunk[] {
    return [...this.chunks.values()]
  }

  // ── Scratchpad ─────────────────────────────────────────────────────────

  /** Add a reasoning step to the scratchpad. */
  scratch(content: string, reasoning: string, linkedSlots: string[] = []): ScratchpadEntry {
    const entry: ScratchpadEntry = {
      id: generateId('sp'),
      step: this.scratchpad.length + 1,
      content,
      reasoning,
      timestamp: Date.now(),
      linkedSlots,
    }

    this.scratchpad.push(entry)
    this.stats.totalScratchpad++

    // Prune old entries
    while (this.scratchpad.length > this.config.maxScratchpadEntries) {
      this.scratchpad.shift()
    }

    return entry
  }

  /** Get the scratchpad contents. */
  getScratchpad(): readonly ScratchpadEntry[] {
    return [...this.scratchpad]
  }

  /** Clear the scratchpad. */
  clearScratchpad(): void {
    this.scratchpad.length = 0
  }

  // ── Attention snapshot ─────────────────────────────────────────────────

  /** Get a snapshot of the current attention state. */
  getAttentionSnapshot(): AttentionSnapshot {
    this.applyDecay()
    this.updateAttentionLevels()

    const focused: MemorySlot[] = []
    const active: MemorySlot[] = []
    const peripheral: MemorySlot[] = []
    const decaying: MemorySlot[] = []

    for (const slot of this.slots.values()) {
      switch (slot.attention) {
        case 'focused':
          focused.push(slot)
          break
        case 'active':
          active.push(slot)
          break
        case 'peripheral':
          peripheral.push(slot)
          break
        case 'decaying':
          decaying.push(slot)
          break
      }
    }

    const occ = this.getEffectiveOccupancy()
    return {
      focused,
      active,
      peripheral,
      decaying,
      totalSlots: this.slots.size,
      usedCapacity: occ,
      freeCapacity: Math.max(0, this.config.maxSlots - occ),
    }
  }

  // ── Interference detection ─────────────────────────────────────────────

  /** Detect conflicting or redundant items in working memory. */
  detectInterference(): InterferenceResult[] {
    const results: InterferenceResult[] = []
    const slotList = [...this.slots.values()]

    for (let i = 0; i < slotList.length; i++) {
      for (let j = i + 1; j < slotList.length; j++) {
        const s1 = slotList[i]
        const s2 = slotList[j]

        const sim = jaccardSimilarity(tokenize(s1.content), tokenize(s2.content))
        if (sim < this.config.interferenceThreshold) continue

        // Determine type
        const hasNeg1 = /\b(not|no|never|none|isn't|aren't|doesn't|don't|won't|can't)\b/i.test(
          s1.content,
        )
        const hasNeg2 = /\b(not|no|never|none|isn't|aren't|doesn't|don't|won't|can't)\b/i.test(
          s2.content,
        )
        const type =
          hasNeg1 !== hasNeg2 ? 'contradiction' : sim > 0.8 ? 'redundancy' : 'competition'

        results.push({
          slot1Id: s1.id,
          slot2Id: s2.id,
          type,
          severity: sim,
          description: `${type} detected between "${s1.content.slice(0, 40)}..." and "${s2.content.slice(0, 40)}..."`,
        })
        this.stats.interferenceCount++
      }
    }

    return results
  }

  // ── Decay & eviction ───────────────────────────────────────────────────

  private applyDecay(): void {
    const now = Date.now()
    for (const slot of this.slots.values()) {
      const elapsed = (now - slot.lastAccessedAt) / 1000
      slot.decay = clamp(slot.decay - elapsed * this.config.decayRatePerSecond, 0, 1)
    }
  }

  private updateAttentionLevels(): void {
    for (const slot of this.slots.values()) {
      const score = slot.decay * 0.6 + slot.priority * 0.4
      if (score >= ATTENTION_THRESHOLDS.focused) slot.attention = 'focused'
      else if (score >= ATTENTION_THRESHOLDS.active) slot.attention = 'active'
      else if (score >= ATTENTION_THRESHOLDS.peripheral) slot.attention = 'peripheral'
      else slot.attention = 'decaying'
    }
  }

  private evictLowest(): void {
    let lowest: MemorySlot | null = null
    let lowestScore = Infinity

    for (const slot of this.slots.values()) {
      const score = slot.decay * 0.5 + slot.priority * 0.3 + (slot.accessCount / 10) * 0.2
      if (score < lowestScore) {
        lowestScore = score
        lowest = slot
      }
    }

    if (lowest) {
      this.recordEviction(lowest)
      this.slots.delete(lowest.id)
    }
  }

  private recordEviction(slot: MemorySlot): void {
    this.stats.totalEvicted++
    const lifetime = Date.now() - slot.createdAt
    this.stats.totalLifetime += lifetime
    this.stats.lifetimeCount++
  }

  private getEffectiveOccupancy(): number {
    // Chunked items count as less
    let count = 0
    const chunkedIds = new Set<string>()
    for (const chunk of this.chunks.values()) {
      for (const id of chunk.slotIds) {
        if (this.slots.has(id)) chunkedIds.add(id)
      }
    }

    for (const slot of this.slots.values()) {
      count += chunkedIds.has(slot.id) ? 1 - this.config.chunkCapacitySaving : 1
    }
    return count
  }

  // ── Stats ──────────────────────────────────────────────────────────────

  getStats(): Readonly<WorkingMemoryEngineStats> {
    return {
      totalItemsStored: this.stats.totalStored,
      totalItemsEvicted: this.stats.totalEvicted,
      totalChunksCreated: this.stats.totalChunks,
      totalScratchpadEntries: this.stats.totalScratchpad,
      avgSlotLifetime:
        this.stats.lifetimeCount > 0 ? this.stats.totalLifetime / this.stats.lifetimeCount : 0,
      interferenceCount: this.stats.interferenceCount,
      currentOccupancy: this.getEffectiveOccupancy(),
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      slots: [...this.slots.values()],
      chunks: [...this.chunks.values()],
      scratchpad: this.scratchpad,
      stats: this.stats,
    })
  }

  static deserialize(
    json: string,
    config?: Partial<WorkingMemoryEngineConfig>,
  ): WorkingMemoryEngine {
    const engine = new WorkingMemoryEngine(config)
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.slots)) {
        for (const s of data.slots) engine.slots.set(s.id, s)
      }
      if (Array.isArray(data.chunks)) {
        for (const c of data.chunks) engine.chunks.set(c.id, c)
      }
      if (Array.isArray(data.scratchpad)) {
        engine.scratchpad.push(...data.scratchpad)
      }
      if (data.stats) Object.assign(engine.stats, data.stats)
    } catch {
      /* fresh engine on failure */
    }
    return engine
  }
}
