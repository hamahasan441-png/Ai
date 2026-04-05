/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  MemoryConsolidator — Tests                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryConsolidator } from '../MemoryConsolidator.js'
import type { SessionTurn } from '../MemoryConsolidator.js'

describe('MemoryConsolidator', () => {
  let consolidator: MemoryConsolidator

  beforeEach(() => {
    consolidator = new MemoryConsolidator()
  })

  // ── Constructor ──

  describe('constructor', () => {
    it('creates with default config', () => {
      const stats = consolidator.getStats()
      expect(stats.totalEntries).toBe(0)
      expect(stats.totalConsolidations).toBe(0)
    })

    it('accepts custom config', () => {
      const custom = new MemoryConsolidator({ maxEntries: 10 })
      expect(custom.entryCount).toBe(0)
    })
  })

  // ── Consolidation ──

  describe('consolidate', () => {
    it('consolidates assistant turns', () => {
      const turns: SessionTurn[] = [
        { role: 'assistant', content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.', timestamp: Date.now() },
      ]
      const conflicts = consolidator.consolidate(turns)
      expect(conflicts).toHaveLength(0)
      expect(consolidator.entryCount).toBe(1)
    })

    it('skips user turns', () => {
      const turns: SessionTurn[] = [
        { role: 'user', content: 'What is TypeScript?', timestamp: Date.now() },
      ]
      consolidator.consolidate(turns)
      expect(consolidator.entryCount).toBe(0)
    })

    it('skips short turns', () => {
      const turns: SessionTurn[] = [
        { role: 'assistant', content: 'Yes.', timestamp: Date.now() },
      ]
      consolidator.consolidate(turns)
      expect(consolidator.entryCount).toBe(0)
    })

    it('detects conflict on high overlap', () => {
      // Add initial entry with specific keywords
      consolidator.addEntry(
        'TypeScript typed superset JavaScript compiles.',
        ['typescript', 'typed', 'superset', 'javascript', 'compiles'],
        'session',
        0.7,
      )

      // New turn with very similar keywords (high Jaccard overlap)
      const turns: SessionTurn[] = [
        {
          role: 'assistant',
          content: 'TypeScript typed superset JavaScript compiles cleanly.',
          timestamp: Date.now(),
        },
      ]
      const conflicts = consolidator.consolidate(turns)
      expect(conflicts.length).toBeGreaterThanOrEqual(1)
      expect(consolidator.getStats().totalConflicts).toBeGreaterThanOrEqual(1)
    })

    it('consolidates multiple turns at once', () => {
      const turns: SessionTurn[] = [
        { role: 'assistant', content: 'React is a JavaScript library for building user interfaces with components.', timestamp: Date.now() },
        { role: 'assistant', content: 'Node.js is a runtime environment that lets you run JavaScript on the server side.', timestamp: Date.now() },
        { role: 'user', content: 'Tell me about Python', timestamp: Date.now() },
      ]
      consolidator.consolidate(turns)
      expect(consolidator.entryCount).toBe(2) // Only assistant turns
    })

    it('increments consolidation count', () => {
      const turns: SessionTurn[] = [
        { role: 'assistant', content: 'Binary search is a divide and conquer algorithm with O(log n) complexity.', timestamp: Date.now() },
      ]
      consolidator.consolidate(turns)
      consolidator.consolidate(turns)
      expect(consolidator.getStats().totalConsolidations).toBe(2)
    })
  })

  // ── addEntry ──

  describe('addEntry', () => {
    it('adds an entry and returns id', () => {
      const id = consolidator.addEntry('test content here', ['test', 'content'], 'learned', 0.8)
      expect(id).toMatch(/^ltm-/)
      expect(consolidator.entryCount).toBe(1)
    })

    it('clamps confidence to [0, 1]', () => {
      const id = consolidator.addEntry('test content high', ['test'], 'learned', 1.5)
      const entry = consolidator.getEntry(id)
      expect(entry?.confidence).toBeLessThanOrEqual(1)
    })

    it('evicts lowest confidence when at capacity', () => {
      const small = new MemoryConsolidator({ maxEntries: 3 })
      small.addEntry('first entry with low conf', ['first'], 'session', 0.1)
      small.addEntry('second entry medium', ['second'], 'session', 0.5)
      small.addEntry('third entry high conf', ['third'], 'session', 0.9)
      expect(small.entryCount).toBe(3)

      small.addEntry('fourth entry forces eviction', ['fourth'], 'session', 0.8)
      expect(small.entryCount).toBe(3)
      // The lowest confidence entry (first, 0.1) should be evicted
      const entries = small.getAllEntries()
      const confidences = entries.map(e => e.confidence)
      expect(Math.min(...confidences)).toBeGreaterThanOrEqual(0.5)
    })
  })

  // ── Retrieval ──

  describe('retrieve', () => {
    beforeEach(() => {
      consolidator.addEntry(
        'TypeScript is a typed superset of JavaScript.',
        ['typescript', 'typed', 'superset', 'javascript'],
        'learned',
        0.8,
      )
      consolidator.addEntry(
        'Python is a versatile programming language known for readability.',
        ['python', 'versatile', 'programming', 'language', 'readability'],
        'learned',
        0.9,
      )
      consolidator.addEntry(
        'React is a JavaScript library for building user interfaces.',
        ['react', 'javascript', 'library', 'user', 'interfaces'],
        'session',
        0.7,
      )
    })

    it('retrieves relevant results for a query', () => {
      const results = consolidator.retrieve('What is TypeScript?')
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results[0]!.entry.content).toContain('TypeScript')
    })

    it('returns empty for unrelated query', () => {
      const results = consolidator.retrieve('quantum physics equations')
      expect(results).toHaveLength(0)
    })

    it('respects maxResults', () => {
      const results = consolidator.retrieve('JavaScript programming', 1)
      expect(results.length).toBeLessThanOrEqual(1)
    })

    it('updates access counts on retrieval', () => {
      const resultsBefore = consolidator.retrieve('TypeScript typed')
      expect(resultsBefore.length).toBeGreaterThanOrEqual(1)
      const entry = consolidator.getEntry(resultsBefore[0]!.entry.id)
      expect(entry?.accessCount).toBeGreaterThanOrEqual(1)
    })

    it('increments retrieval count', () => {
      consolidator.retrieve('TypeScript')
      consolidator.retrieve('Python')
      expect(consolidator.getStats().totalRetrievals).toBe(2)
    })

    it('scores results by relevance', () => {
      const results = consolidator.retrieve('JavaScript library')
      if (results.length >= 2) {
        // Results should be sorted by relevance descending
        expect(results[0]!.relevanceScore).toBeGreaterThanOrEqual(results[1]!.relevanceScore)
      }
    })
  })

  // ── Decay ──

  describe('applyDecay', () => {
    it('returns 0 evictions when entries are recent', () => {
      consolidator.addEntry('recent entry content', ['recent', 'entry'], 'session', 0.8)
      const evicted = consolidator.applyDecay()
      expect(evicted).toBe(0)
    })
  })

  // ── Serialization ──

  describe('serialization', () => {
    it('serializes and deserializes correctly', () => {
      consolidator.addEntry('entry one content', ['entry', 'one'], 'learned', 0.8)
      consolidator.addEntry('entry two content', ['entry', 'two'], 'session', 0.6)

      const data = consolidator.serialize()
      expect(data.entries).toHaveLength(2)

      const restored = new MemoryConsolidator()
      restored.deserialize(data)
      expect(restored.entryCount).toBe(2)
    })
  })

  // ── Stats ──

  describe('getStats', () => {
    it('returns correct averageConfidence', () => {
      consolidator.addEntry('high confidence entry', ['high'], 'learned', 0.9)
      consolidator.addEntry('low confidence entry', ['low'], 'learned', 0.5)
      const stats = consolidator.getStats()
      expect(stats.averageConfidence).toBeCloseTo(0.7, 1)
    })
  })

  // ── Clear ──

  describe('clear', () => {
    it('resets all state', () => {
      consolidator.addEntry('something here', ['something'], 'learned', 0.8)
      consolidator.clear()
      expect(consolidator.entryCount).toBe(0)
      expect(consolidator.getStats().totalConsolidations).toBe(0)
    })
  })
})
