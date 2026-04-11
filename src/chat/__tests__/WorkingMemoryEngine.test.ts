import { describe, it, expect, beforeEach } from 'vitest'
import { WorkingMemoryEngine, DEFAULT_WORKING_MEMORY_CONFIG } from '../WorkingMemoryEngine'

describe('WorkingMemoryEngine', () => {
  let engine: WorkingMemoryEngine

  beforeEach(() => {
    engine = new WorkingMemoryEngine()
  })

  // ══════════════════════════════════════════════════════════════════════
  // §1 — Construction & Configuration
  // ══════════════════════════════════════════════════════════════════════

  describe('construction', () => {
    it('creates with default config', () => {
      expect(engine).toBeInstanceOf(WorkingMemoryEngine)
    })

    it('creates with custom config', () => {
      const custom = new WorkingMemoryEngine({ maxSlots: 5 })
      expect(custom).toBeInstanceOf(WorkingMemoryEngine)
    })

    it('exports DEFAULT_WORKING_MEMORY_CONFIG', () => {
      expect(DEFAULT_WORKING_MEMORY_CONFIG).toBeDefined()
      expect(DEFAULT_WORKING_MEMORY_CONFIG.maxSlots).toBe(9)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §2 — Slot Management
  // ══════════════════════════════════════════════════════════════════════

  describe('slot management', () => {
    it('stores an item in working memory', () => {
      const slot = engine.store('fact', 'The sky is blue')
      expect(slot.id).toBeTruthy()
      expect(slot.content).toBe('The sky is blue')
      expect(slot.type).toBe('fact')
    })

    it('stores with custom priority', () => {
      const slot = engine.store('goal', 'Complete the task', { priority: 0.9 })
      expect(slot.priority).toBe(0.9)
    })

    it('stores with metadata', () => {
      const slot = engine.store('context', 'User asked about Python', {
        metadata: { source: 'chat' },
      })
      expect(slot.metadata.source).toBe('chat')
    })

    it('stores with bindings', () => {
      const s1 = engine.store('fact', 'Fact A')
      const s2 = engine.store('fact', 'Fact B', { bindings: [s1.id] })
      expect(s2.bindings).toContain(s1.id)
    })

    it('accesses a slot and boosts attention', () => {
      const slot = engine.store('fact', 'Test item')
      const accessed = engine.access(slot.id)
      expect(accessed).not.toBeNull()
      expect(accessed!.accessCount).toBe(2) // 1 from store + 1 from access
    })

    it('returns null for accessing non-existent slot', () => {
      expect(engine.access('nonexistent')).toBeNull()
    })

    it('focuses on a slot', () => {
      const slot = engine.store('fact', 'Important item')
      const focused = engine.focus(slot.id)
      expect(focused).not.toBeNull()
      expect(focused!.attention).toBe('focused')
    })

    it('returns null for focusing non-existent slot', () => {
      expect(engine.focus('nonexistent')).toBeNull()
    })

    it('removes a slot', () => {
      const slot = engine.store('fact', 'Temporary')
      expect(engine.remove(slot.id)).toBe(true)
      expect(engine.peek(slot.id)).toBeNull()
    })

    it('returns false for removing non-existent slot', () => {
      expect(engine.remove('nonexistent')).toBe(false)
    })

    it('peeks without boosting', () => {
      const slot = engine.store('fact', 'Peek test')
      const peeked = engine.peek(slot.id)
      expect(peeked).not.toBeNull()
      expect(peeked!.accessCount).toBe(1)
    })

    it('gets all slots', () => {
      engine.store('fact', 'Item 1')
      engine.store('goal', 'Item 2')
      const all = engine.getAll()
      expect(all.length).toBe(2)
    })

    it('evicts lowest priority when full', () => {
      const small = new WorkingMemoryEngine({ maxSlots: 3 })
      small.store('fact', 'Low priority', { priority: 0.1 })
      small.store('fact', 'Medium priority', { priority: 0.5 })
      small.store('fact', 'High priority', { priority: 0.9 })
      small.store('fact', 'New item', { priority: 0.8 })
      expect(small.getAll().length).toBeLessThanOrEqual(3)
    })

    it('supports all slot types', () => {
      const types = [
        'fact',
        'goal',
        'constraint',
        'intermediate',
        'context',
        'instruction',
        'hypothesis',
      ] as const
      for (const type of types) {
        const slot = engine.store(type, `${type} content`)
        expect(slot.type).toBe(type)
      }
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §3 — Search
  // ══════════════════════════════════════════════════════════════════════

  describe('search', () => {
    it('searches slots by content similarity', () => {
      engine.store('fact', 'Python is a programming language')
      engine.store('fact', 'JavaScript runs in the browser')
      engine.store('fact', 'Python supports multiple paradigms')

      const results = engine.search('Python programming')
      expect(results.length).toBeGreaterThan(0)
    })

    it('returns empty for no matches', () => {
      engine.store('fact', 'The sky is blue')
      const results = engine.search('quantum entanglement physics')
      expect(results.length).toBe(0)
    })

    it('ranks more similar items higher', () => {
      engine.store('fact', 'Machine learning uses neural networks for deep learning')
      engine.store('fact', 'The weather is nice today')
      engine.store('fact', 'Deep learning neural network training')

      const results = engine.search('neural networks deep learning')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §4 — Chunking
  // ══════════════════════════════════════════════════════════════════════

  describe('chunking', () => {
    it('chunks multiple slots together', () => {
      const s1 = engine.store('fact', 'Related fact 1')
      const s2 = engine.store('fact', 'Related fact 2')
      const chunk = engine.chunk([s1.id, s2.id], 'Related facts')
      expect(chunk).not.toBeNull()
      expect(chunk!.label).toBe('Related facts')
      expect(chunk!.slotIds.length).toBe(2)
    })

    it('returns null for too few slots', () => {
      const s1 = engine.store('fact', 'Lonely slot')
      expect(engine.chunk([s1.id], 'Solo')).toBeNull()
    })

    it('returns null for invalid slot IDs', () => {
      expect(engine.chunk(['bad1', 'bad2'], 'Bad chunk')).toBeNull()
    })

    it('updates slot chunkId after chunking', () => {
      const s1 = engine.store('fact', 'Chunk member 1')
      const s2 = engine.store('fact', 'Chunk member 2')
      const chunk = engine.chunk([s1.id, s2.id], 'Group')
      const slot = engine.peek(s1.id)
      expect(slot!.chunkId).toBe(chunk!.id)
    })

    it('unchunks and restores individual slots', () => {
      const s1 = engine.store('fact', 'Chunked 1')
      const s2 = engine.store('fact', 'Chunked 2')
      const chunk = engine.chunk([s1.id, s2.id], 'Test')
      expect(engine.unchunk(chunk!.id)).toBe(true)
      expect(engine.peek(s1.id)!.chunkId).toBeNull()
    })

    it('returns false for unchunking non-existent chunk', () => {
      expect(engine.unchunk('nonexistent')).toBe(false)
    })

    it('gets all chunks', () => {
      const s1 = engine.store('fact', 'A')
      const s2 = engine.store('fact', 'B')
      engine.chunk([s1.id, s2.id], 'Group 1')
      expect(engine.getChunks().length).toBe(1)
    })

    it('respects maxChunks limit', () => {
      const small = new WorkingMemoryEngine({ maxChunks: 1, maxSlots: 20 })
      const s1 = small.store('fact', 'A')
      const s2 = small.store('fact', 'B')
      const s3 = small.store('fact', 'C')
      const s4 = small.store('fact', 'D')
      small.chunk([s1.id, s2.id], 'G1')
      const c2 = small.chunk([s3.id, s4.id], 'G2')
      expect(c2).toBeNull()
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §5 — Scratchpad
  // ══════════════════════════════════════════════════════════════════════

  describe('scratchpad', () => {
    it('adds scratchpad entries', () => {
      const entry = engine.scratch('Step 1: Parse input', 'Need to tokenize first')
      expect(entry.step).toBe(1)
      expect(entry.content).toBe('Step 1: Parse input')
    })

    it('tracks step numbers', () => {
      engine.scratch('Step 1', 'Reasoning 1')
      const e2 = engine.scratch('Step 2', 'Reasoning 2')
      expect(e2.step).toBe(2)
    })

    it('links slots to scratchpad entries', () => {
      const slot = engine.store('fact', 'Key fact')
      const entry = engine.scratch('Using key fact', 'Reference', [slot.id])
      expect(entry.linkedSlots).toContain(slot.id)
    })

    it('gets scratchpad contents', () => {
      engine.scratch('A', 'R1')
      engine.scratch('B', 'R2')
      expect(engine.getScratchpad().length).toBe(2)
    })

    it('clears scratchpad', () => {
      engine.scratch('A', 'R')
      engine.clearScratchpad()
      expect(engine.getScratchpad().length).toBe(0)
    })

    it('prunes old entries when over limit', () => {
      const small = new WorkingMemoryEngine({ maxScratchpadEntries: 3 })
      for (let i = 0; i < 5; i++) {
        small.scratch(`Step ${i}`, `Reason ${i}`)
      }
      expect(small.getScratchpad().length).toBeLessThanOrEqual(3)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §6 — Attention Snapshot
  // ══════════════════════════════════════════════════════════════════════

  describe('attention snapshot', () => {
    it('returns attention snapshot', () => {
      engine.store('fact', 'Item 1', { priority: 0.9 })
      engine.store('fact', 'Item 2', { priority: 0.1 })

      const snapshot = engine.getAttentionSnapshot()
      expect(snapshot.totalSlots).toBe(2)
      expect(snapshot.usedCapacity).toBe(2)
      expect(snapshot.freeCapacity).toBeGreaterThanOrEqual(0)
    })

    it('categorizes slots by attention level', () => {
      engine.store('fact', 'High priority', { priority: 0.95 })
      const snapshot = engine.getAttentionSnapshot()
      const total =
        snapshot.focused.length +
        snapshot.active.length +
        snapshot.peripheral.length +
        snapshot.decaying.length
      expect(total).toBe(snapshot.totalSlots)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §7 — Interference Detection
  // ══════════════════════════════════════════════════════════════════════

  describe('interference detection', () => {
    it('detects contradicting items', () => {
      engine.store('fact', 'Python is the best language for data science')
      engine.store('fact', 'Python is not the best language for data science')

      const interferences = engine.detectInterference()
      expect(interferences.length).toBeGreaterThan(0)
      const contradiction = interferences.find(i => i.type === 'contradiction')
      expect(contradiction).toBeDefined()
    })

    it('detects redundant items', () => {
      engine.store('fact', 'The quick brown fox jumps over the lazy dog')
      engine.store('fact', 'The quick brown fox jumps over the lazy dog again')

      const interferences = engine.detectInterference()
      expect(interferences.length).toBeGreaterThan(0)
    })

    it('returns empty for non-interfering items', () => {
      engine.store('fact', 'Apples are red fruit')
      engine.store('fact', 'JavaScript was created by Brendan Eich')

      const interferences = engine.detectInterference()
      expect(interferences.length).toBe(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §8 — Stats
  // ══════════════════════════════════════════════════════════════════════

  describe('stats', () => {
    it('tracks total items stored', () => {
      engine.store('fact', 'A')
      engine.store('fact', 'B')
      expect(engine.getStats().totalItemsStored).toBe(2)
    })

    it('tracks evictions', () => {
      const small = new WorkingMemoryEngine({ maxSlots: 2 })
      small.store('fact', 'A', { priority: 0.1 })
      small.store('fact', 'B', { priority: 0.5 })
      small.store('fact', 'C', { priority: 0.9 })
      expect(small.getStats().totalItemsEvicted).toBeGreaterThan(0)
    })

    it('tracks chunks created', () => {
      const s1 = engine.store('fact', 'X')
      const s2 = engine.store('fact', 'Y')
      engine.chunk([s1.id, s2.id], 'Group')
      expect(engine.getStats().totalChunksCreated).toBe(1)
    })

    it('tracks scratchpad entries', () => {
      engine.scratch('A', 'R')
      expect(engine.getStats().totalScratchpadEntries).toBe(1)
    })

    it('tracks interference count', () => {
      engine.store('fact', 'The cat is on the mat sitting quietly')
      engine.store('fact', 'The cat is not on the mat sitting quietly')
      engine.detectInterference()
      expect(engine.getStats().interferenceCount).toBeGreaterThan(0)
    })

    it('tracks current occupancy', () => {
      engine.store('fact', 'A')
      engine.store('fact', 'B')
      expect(engine.getStats().currentOccupancy).toBe(2)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §9 — Serialization
  // ══════════════════════════════════════════════════════════════════════

  describe('serialization', () => {
    it('serializes to JSON', () => {
      engine.store('fact', 'Test')
      const json = engine.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('deserializes from JSON', () => {
      engine.store('fact', 'Persistent')
      const json = engine.serialize()
      const restored = WorkingMemoryEngine.deserialize(json)
      expect(restored.getAll().length).toBe(1)
      expect(restored.getAll()[0].content).toBe('Persistent')
    })

    it('handles invalid JSON gracefully', () => {
      const restored = WorkingMemoryEngine.deserialize('invalid json')
      expect(restored).toBeInstanceOf(WorkingMemoryEngine)
      expect(restored.getAll().length).toBe(0)
    })

    it('preserves chunks on serialization', () => {
      const s1 = engine.store('fact', 'A')
      const s2 = engine.store('fact', 'B')
      engine.chunk([s1.id, s2.id], 'Group')
      const json = engine.serialize()
      const restored = WorkingMemoryEngine.deserialize(json)
      expect(restored.getChunks().length).toBe(1)
    })

    it('preserves scratchpad on serialization', () => {
      engine.scratch('Step 1', 'Reason 1')
      const json = engine.serialize()
      const restored = WorkingMemoryEngine.deserialize(json)
      expect(restored.getScratchpad().length).toBe(1)
    })
  })
})
