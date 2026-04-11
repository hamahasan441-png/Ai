/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Database Internals Knowledge — Tests                           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('DatabaseInternals', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match storage engines and query optimization keywords', async () => {
      const r = await brain.chat(
        'explain storage engines b-tree lsm tree page based log structured query optimization cost based optimizer join algorithms index selection',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /b.tree|lsm|storage|query\s+optimization|cost.based|join/,
      )
    })

    it('should match transaction isolation and consensus algorithms keywords', async () => {
      const r = await brain.chat(
        'explain transaction isolation levels read committed repeatable read serializable mvcc consensus algorithms raft paxos pbft leader election',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/transaction|isolation|mvcc|consensus|raft|paxos/)
    })

    it('should match WAL recovery and indexing strategies keywords', async () => {
      const r = await brain.chat(
        'explain write ahead logging wal checkpointing crash recovery aries indexing strategies b+ tree hash bitmap gin gist partial covering indexes',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /write.ahead|wal|checkpoint|recovery|aries|index|b\+|bitmap|gin/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Database Internals with domain database', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Database Internals')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('database')
    })

    it('should have >=5 connected sub-concepts including Storage Engines & Data Structures and Query Optimization & Planning', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Database Internals')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Storage Engines & Data Structures')
      expect(names).toContain('Query Optimization & Planning')
    })

    it('should relate Storage Engines & Data Structures to Indexing Strategies & Types', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Storage Engines & Data Structures')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Indexing Strategies & Types')
    })
  })
})
