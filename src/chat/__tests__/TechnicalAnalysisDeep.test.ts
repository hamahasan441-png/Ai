import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Technical Analysis Deep Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about Elliott Wave and Ichimoku and Fibonacci', async () => {
      const r = await brain.chat(
        'explain elliott wave theory impulse corrective ichimoku cloud kinko hyo fibonacci retracement extension',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/elliott|wave|ichimoku|fibonacci|impulse|corrective/)
    })

    it('answers about Smart Money Concepts and harmonic patterns', async () => {
      const r = await brain.chat(
        'explain supply demand zone order block smart money concept harmonic pattern gartley butterfly volume profile',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /smart\s+money|order\s+block|harmonic|gartley|volume\s+profile|supply/,
      )
    })

    it('answers about Wyckoff method and pivot points', async () => {
      const r = await brain.chat(
        'explain wyckoff method accumulation distribution spring pivot points camarilla divergence hidden regular',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/wyckoff|accumulation|distribution|pivot|divergence/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Advanced Technical Analysis concept in trading domain', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Advanced Technical Analysis')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('trading')
    })

    it('has >=6 connected sub-concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Advanced Technical Analysis')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(6)
    })
  })
})
