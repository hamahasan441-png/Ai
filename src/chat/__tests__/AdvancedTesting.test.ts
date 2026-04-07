/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Advanced Testing Techniques Knowledge — Tests                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('AdvancedTesting', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match property-based and mutation testing keywords', async () => {
      const r = await brain.chat('explain property based testing quickcheck hypothesis fast check shrinking mutation testing pit stryker mutant killing mutation score')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/property.based|quickcheck|hypothesis|mutation\s+testing|pit|stryker/)
    })

    it('should match fuzz testing and contract testing keywords', async () => {
      const r = await brain.chat('explain fuzz testing afl libfuzzer coverage guided fuzzing corpus contract testing pact spring cloud contract consumer driven')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/fuzz|afl|libfuzzer|contract\s+testing|pact|consumer.driven/)
    })

    it('should match formal specification and chaos testing keywords', async () => {
      const r = await brain.chat('explain formal specification tla+ alloy z notation model checking chaos testing integration fault injection test toxiproxy resilience testing')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/property.based|mutation\s+testing|fuzz|quickcheck|hypothesis|stryker|afl/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Advanced Testing Techniques with domain testing', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Advanced Testing Techniques')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('testing')
    })

    it('should have >=5 connected sub-concepts including Property-Based Testing and Mutation Testing', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Advanced Testing Techniques')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Property-Based Testing')
      expect(names).toContain('Mutation Testing')
    })

    it('should relate Property-Based Testing to Fuzz Testing & Coverage-Guided Fuzzing', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Property-Based Testing')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Fuzz Testing & Coverage-Guided Fuzzing')
    })
  })
})
