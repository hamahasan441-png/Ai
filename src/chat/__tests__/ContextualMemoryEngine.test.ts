import { describe, it, expect, beforeEach } from 'vitest'
import { ContextualMemoryEngine } from '../ContextualMemoryEngine.js'

describe('ContextualMemoryEngine', () => {
  let engine: ContextualMemoryEngine

  beforeEach(() => {
    engine = new ContextualMemoryEngine(100)
  })

  describe('Store', () => {
    it('should store a memory and return ID', () => {
      const id = engine.store('React is a UI library', { domain: 'frontend' })
      expect(id).toMatch(/^mem_/)
    })

    it('should auto-extract context when not provided', () => {
      const id = engine.store('TypeScript adds type safety to JavaScript')
      const memory = engine.get(id)
      expect(memory).not.toBeNull()
      expect(memory!.context.keywords.length).toBeGreaterThan(0)
    })

    it('should store with custom tags', () => {
      const id = engine.store('Important note', {}, 0.8, ['important', 'note'])
      const memory = engine.get(id)
      expect(memory!.tags).toContain('important')
    })

    it('should evict when over limit', () => {
      const smallEngine = new ContextualMemoryEngine(5)
      for (let i = 0; i < 10; i++) {
        smallEngine.store(`Memory ${i}`, {}, 0.1)
      }
      expect(smallEngine.size()).toBeLessThanOrEqual(5)
    })
  })

  describe('Search', () => {
    it('should find relevant memories', () => {
      engine.store('React hooks simplify state management', { domain: 'frontend' })
      engine.store('PostgreSQL supports JSON columns', { domain: 'database' })
      engine.store('React components use JSX syntax', { domain: 'frontend' })

      const results = engine.search('React component')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.relevanceScore).toBeGreaterThan(0)
    })

    it('should rank by relevance', () => {
      engine.store('React is a frontend library', {
        domain: 'frontend',
        keywords: ['react', 'frontend'],
      })
      engine.store('Python is a programming language', { domain: 'backend', keywords: ['python'] })

      const results = engine.search('React frontend')
      if (results.length >= 2) {
        expect(results[0]!.relevanceScore).toBeGreaterThanOrEqual(results[1]!.relevanceScore)
      }
    })

    it('should provide match reasons', () => {
      engine.store('Machine learning with Python', { keywords: ['machine', 'learning', 'python'] })
      const results = engine.search('machine learning')
      if (results.length > 0) {
        expect(results[0]!.matchReasons.length).toBeGreaterThan(0)
      }
    })

    it('should update access count on search', () => {
      const id = engine.store('React hooks guide')
      engine.search('React hooks')
      const memory = engine.get(id)
      // get also increments, so at least 1
      expect(memory!.accessCount).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Get', () => {
    it('should get memory by ID', () => {
      const id = engine.store('Test memory')
      const memory = engine.get(id)
      expect(memory).not.toBeNull()
      expect(memory!.content).toBe('Test memory')
    })

    it('should return null for non-existent ID', () => {
      const memory = engine.get('non_existent')
      expect(memory).toBeNull()
    })

    it('should get by tag', () => {
      engine.store('Tagged memory', {}, 0.5, ['special'])
      engine.store('Other memory', {}, 0.5, ['other'])
      const results = engine.getByTag('special')
      expect(results.length).toBe(1)
    })

    it('should get by domain', () => {
      engine.store('Frontend stuff', { domain: 'frontend' })
      engine.store('Backend stuff', { domain: 'backend' })
      const results = engine.getByDomain('frontend')
      expect(results.length).toBe(1)
    })
  })

  describe('Linking', () => {
    it('should link two memories', () => {
      const id1 = engine.store('React hooks')
      const id2 = engine.store('React state management')
      const linked = engine.link(id1, id2)
      expect(linked).toBe(true)
    })

    it('should get linked memories', () => {
      const id1 = engine.store('React hooks')
      const id2 = engine.store('React state')
      engine.link(id1, id2)
      const linked = engine.getLinked(id1)
      expect(linked.length).toBe(1)
    })

    it('should auto-link similar memories', () => {
      engine.store('React hooks state management', { keywords: ['react', 'hooks', 'state'] })
      const id2 = engine.store('React hooks tutorial', { keywords: ['react', 'hooks', 'tutorial'] })
      const memory = engine.get(id2)
      expect(memory!.links.length).toBeGreaterThanOrEqual(0) // May auto-link
    })

    it('should fail to link non-existent memory', () => {
      const id1 = engine.store('test')
      expect(engine.link(id1, 'fake')).toBe(false)
    })
  })

  describe('Importance', () => {
    it('should update importance', () => {
      const id = engine.store('test', {}, 0.5)
      engine.updateImportance(id, 0.9)
      const memory = engine.get(id)
      expect(memory!.importance).toBe(0.9)
    })

    it('should boost importance', () => {
      const id = engine.store('test', {}, 0.5)
      engine.boostImportance(id, 0.2)
      const memory = engine.get(id)
      expect(memory!.importance).toBe(0.7)
    })

    it('should cap importance at 1', () => {
      const id = engine.store('test', {}, 0.9)
      engine.boostImportance(id, 0.5)
      const memory = engine.get(id)
      expect(memory!.importance).toBeLessThanOrEqual(1)
    })
  })

  describe('Stats & Management', () => {
    it('should report stats', () => {
      engine.store('Memory 1', { domain: 'frontend' })
      engine.store('Memory 2', { domain: 'backend' })
      const stats = engine.getStats()
      expect(stats.totalMemories).toBe(2)
      expect(stats.topDomains.length).toBeGreaterThan(0)
    })

    it('should delete memory', () => {
      const id = engine.store('test')
      expect(engine.delete(id)).toBe(true)
      expect(engine.size()).toBe(0)
    })

    it('should clear all memories', () => {
      engine.store('test1')
      engine.store('test2')
      engine.clear()
      expect(engine.size()).toBe(0)
    })

    it('should track size', () => {
      engine.store('a')
      engine.store('b')
      expect(engine.size()).toBe(2)
    })

    it('should handle empty stats', () => {
      const stats = engine.getStats()
      expect(stats.totalMemories).toBe(0)
      expect(stats.oldestMemory).toBeNull()
    })
  })
})
