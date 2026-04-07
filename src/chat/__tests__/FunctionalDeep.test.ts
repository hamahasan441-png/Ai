/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Functional Programming Deep Dive Knowledge — Tests             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('FunctionalDeep', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match monads functors and algebraic data types keywords', async () => {
      const r = await brain.chat('explain monads functors maybe option either result io state reader writer algebraic data types sum types product types pattern matching')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/monad|functor|maybe|option|either|result|algebraic|sum\s+type|pattern\s+matching/)
    })

    it('should match type classes and immutable data structures keywords', async () => {
      const r = await brain.chat('explain type classes traits haskell type class rust trait scala implicits immutable data structures persistent vectors hamts finger trees zippers')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/type\s+class|trait|haskell|rust|scala|immutable|persistent|hamt|finger\s+tree|zipper/)
    })

    it('should match effect systems and category theory keywords', async () => {
      const r = await brain.chat('explain effect systems algebraic effects zio cats effect free monads category theory applied functors natural transformations kleisli yoneda lemma')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/effect\s+system|algebraic\s+effect|zio|cats|free\s+monad|category\s+theory|functor|kleisli|yoneda/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Functional Programming Deep Dive with domain programming', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Functional Programming Deep Dive')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('programming')
    })

    it('should have >=5 connected sub-concepts including Monads & Functors and Algebraic Data Types & Pattern Matching', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Functional Programming Deep Dive')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Monads & Functors')
      expect(names).toContain('Algebraic Data Types & Pattern Matching')
    })

    it('should relate Monads & Functors to Category Theory Applied', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Monads & Functors')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Category Theory Applied')
    })
  })
})
