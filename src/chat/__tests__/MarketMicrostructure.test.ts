import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Market Microstructure Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about order book and order flow', async () => {
      const r = await brain.chat(
        'explain order book depth bid ask spread market maker liquidity order flow tape reading level 2 footprint',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /order\s+book|bid|ask|spread|market\s+maker|liquidity|order\s+flow|tape/,
      )
    })

    it('answers about market venues and auction mechanisms', async () => {
      const r = await brain.chat(
        'explain market structure venue exchange dark pool auction mechanism opening closing order routing smart execution',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /exchange|dark\s+pool|auction|opening|closing|routing|venue/,
      )
    })

    it('answers about HFT and market manipulation', async () => {
      const r = await brain.chat(
        'explain high frequency trading latency arbitrage flash crash market manipulation spoofing layering wash trading',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /hft|high\s+frequency|latency|flash\s+crash|spoofing|manipulation/,
      )
    })
  })

  describe('Semantic concepts', () => {
    it('has Market Microstructure concept in trading domain', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Market Microstructure')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('trading')
    })

    it('has >=5 connected sub-concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Market Microstructure')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })
  })
})
