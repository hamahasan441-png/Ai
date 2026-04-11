/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Concurrency & Parallelism Patterns Knowledge — Tests           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('ConcurrencyPatterns', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match actor model and CSP keywords', async () => {
      const r = await brain.chat(
        'explain actor model akka erlang message passing supervision tree csp channels go channel clojure core async',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/actor|akka|erlang|message\s+passing|csp|channel/)
    })

    it('should match lock-free and memory model keywords', async () => {
      const r = await brain.chat(
        'explain lock free algorithm cas atomic operation aba problem memory model java jmm happens before acquire release',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /lock.free|cas|compare.and.swap|memory\s+model|happens.before/,
      )
    })

    it('should match STM and thread pool keywords', async () => {
      const r = await brain.chat(
        'explain software transactional memory stm mvcc clojure ref atom thread pool executor fork join work stealing structured concurrency',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /transactional\s+memory|stm|mvcc|fork.?join|work.stealing|structured\s+concurrency/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Concurrency & Parallelism Patterns with domain systems', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Concurrency & Parallelism Patterns')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('systems')
    })

    it('should have >=5 connected sub-concepts including Actor Model & Message Passing', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Concurrency & Parallelism Patterns')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Actor Model & Message Passing')
      expect(names).toContain('CSP & Channel-Based Concurrency')
    })

    it('should relate Lock-Free Algorithms & Atomics to Memory Models & Ordering', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Lock-Free Algorithms & Atomics')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Memory Models & Ordering')
    })
  })
})
