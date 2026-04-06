import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('RecommendationSystems', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match collaborative/content-based keywords', () => {
      const response = brain.chat('explain collaborative filtering user item matrix factorization content based filtering feature similarity cosine recommendation system')
      expect(response).toMatch(/collaborative|content.based|matrix|filtering|recommendation/i)
    })

    it('should match deep learning/bandits keywords', () => {
      const response = brain.chat('explain deep learning recommendation neural collaborative ncf session based recommendation sequential gru4rec multi armed bandit thompson')
      expect(response).toMatch(/neural|session|bandit|deep|sequential/i)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Recommendation Systems & Personalization with domain ai', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Recommendation Systems & Personalization')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('ai')
    })

    it('should have >=5 connected sub-concepts including Collaborative Filtering and Content-Based Filtering', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Recommendation Systems & Personalization')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.name)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Collaborative Filtering')
      expect(names).toContain('Content-Based Filtering')
    })

    it('should relate Collaborative Filtering to Content-Based Filtering', () => {
      const graph = createProgrammingKnowledgeGraph()
      const related = graph.findRelated('Collaborative Filtering')
      const names = related.map(r => r.name)
      expect(names).toContain('Content-Based Filtering')
    })
  })
})
