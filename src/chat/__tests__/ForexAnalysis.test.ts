import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Forex Market Analysis Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about forex currency pairs and fundamentals', async () => {
      const r = await brain.chat('explain forex market analysis currency pair major minor exotic fundamental analysis economic indicator')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/currency|forex|pair|pip|fundamental|economic/)
    })

    it('answers about forex sessions and central banks', async () => {
      const r = await brain.chat('explain forex session market hours central bank monetary policy rate decision hawkish dovish')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/session|london|tokyo|central\s+bank|hawkish|dovish|rate/)
    })

    it('answers about multi-timeframe and intermarket analysis', async () => {
      const r = await brain.chat('explain forex multi timeframe analysis top down weekly daily intermarket analysis bonds commodities correlation')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/timeframe|intermarket|correlation|support|resistance|trend/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Forex Market Analysis concept in trading domain', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Forex Market Analysis')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('trading')
    })

    it('has >=5 connected sub-concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Forex Market Analysis')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })
  })
})
