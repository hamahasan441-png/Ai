import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Quantitative Trading Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about quant strategies and statistical arbitrage', async () => {
      const r = await brain.chat(
        'explain quantitative trading strategy alpha signal factor model statistical arbitrage pairs trading cointegration',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /quantitative|alpha|factor|statistical\s+arb|pairs?\s+trad|cointegrat/,
      )
    })

    it('answers about execution algorithms and risk models', async () => {
      const r = await brain.chat(
        'explain market making high frequency trading execution algorithm twap vwap risk model value at risk var',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /market\s+making|hft|execution|twap|vwap|value\s+at\s+risk|var/,
      )
    })

    it('answers about ML in trading and alternative data', async () => {
      const r = await brain.chat(
        'explain machine learning trading feature engineering alternative data sentiment portfolio optimization mean variance',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /machine\s+learn|feature|alternative\s+data|sentiment|portfolio|optim/,
      )
    })
  })

  describe('Semantic concepts', () => {
    it('has Quantitative Trading concept in trading domain', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Quantitative Trading')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('trading')
    })

    it('has >=5 connected sub-concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Quantitative Trading')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })
  })
})
