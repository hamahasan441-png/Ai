import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('RecommendationSystems', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match collaborative/content-based keywords', async () => {
      const r = await brain.chat(
        'explain collaborative filtering user item matrix factorization content based filtering feature similarity cosine recommendation system',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /collaborative|content.based|matrix|filtering|recommendation/,
      )
    })

    it('should match deep learning/bandits keywords', async () => {
      const r = await brain.chat(
        'explain deep learning recommendation neural collaborative ncf session based recommendation sequential gru4rec multi armed bandit thompson',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /neural|session|bandit|deep|sequential|recommendation|collaborative/,
      )
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
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Collaborative Filtering')
      expect(names).toContain('Content-Based Filtering')
    })

    it('should relate Collaborative Filtering to Content-Based Filtering', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Collaborative Filtering')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Content-Based Filtering')
    })
  })
})
