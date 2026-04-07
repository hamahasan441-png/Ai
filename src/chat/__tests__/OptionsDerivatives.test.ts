import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Options & Derivatives Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about options basics and Greeks', async () => {
      const r = await brain.chat('explain options trading call put strike price expiration premium options greeks delta gamma theta vega')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/options?|call|put|strike|delta|gamma|theta|vega|premium/)
    })

    it('answers about Black-Scholes and futures', async () => {
      const r = await brain.chat('explain options pricing black scholes model implied volatility skew futures contract margin mark to market')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/black.scholes|implied\s+volatil|futures?|margin|pricing/)
    })

    it('answers about advanced options strategies', async () => {
      const r = await brain.chat('explain options advanced straddle strangle butterfly calendar diagonal volatility trading iv crush')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/straddle|strangle|butterfly|calendar|volatility|iv/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Options & Derivatives concept in trading domain', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Options & Derivatives')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('trading')
    })

    it('has >=5 connected sub-concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Options & Derivatives')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })
  })
})
