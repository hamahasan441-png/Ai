import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('ChaosEngineering', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should respond to chaos engineering and tools queries', async () => {
      const response = await brain.chat('explain chaos engineering fault injection failure testing chaos monkey litmus gremlin toxiproxy gameday exercise disaster recovery')
      expect(response.text.length).toBeGreaterThan(50)
      expect(response.text.toLowerCase()).toMatch(/chaos|fault\s+injection|chaos\s+monkey|litmus|gremlin|gameday/)
    })

    it('should respond to resilience and steady state queries', async () => {
      const response = await brain.chat('explain resilience pattern circuit breaker bulkhead retry fallback steady state hypothesis error budget slo sli observability')
      expect(response.text.length).toBeGreaterThan(50)
      expect(response.text.toLowerCase()).toMatch(/circuit\s+breaker|bulkhead|resilience|steady.state|error\s+budget|slo/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Chaos Engineering & Resilience with domain devops', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Chaos Engineering & Resilience')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('devops')
    })

    it('should have at least 5 connected sub-concepts including Fault Injection and Resilience Patterns', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Chaos Engineering & Resilience')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Fault Injection')
      expect(names).toContain('Resilience Patterns')
    })

    it('should relate Fault Injection to Blast Radius Control', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Fault Injection')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Blast Radius Control')
    })
  })
})
