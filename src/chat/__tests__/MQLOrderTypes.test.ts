import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL Order Types & Execution Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('knows MQL4 order types and OrderSend', async () => {
      const r = await brain.chat('What are the MQL4 order types and how to use OrderSend?')
      expect(r.text.toLowerCase()).toMatch(/op_buy|op_sell|ordersend|pending|buylimit|selllimit/)
    })

    it('explains MQL5 position model and CTrade', async () => {
      const r = await brain.chat('How does the MQL5 order vs position vs deal model work?')
      expect(r.text.toLowerCase()).toMatch(/position|deal|order|ctrade|netting|hedging/)
    })

    it('covers order pool iteration and closing all orders', async () => {
      const r = await brain.chat('How to loop through and close all orders in MQL?')
      expect(r.text.toLowerCase()).toMatch(/orderstotal|orderselect|iterate|backwards|close/)
    })
  })

  describe('Semantic Memory', () => {
    it('has MQL Order Types concept', () => {
      const g = createProgrammingKnowledgeGraph()
      expect(g.findConceptByName('MQL Order Types')).toBeDefined()
    })

    it('MQL Order Types relates to Trading Programming', () => {
      const g = createProgrammingKnowledgeGraph()
      const c = g.findConceptByName('MQL Order Types')!
      const related = g.findRelated(c.id, undefined, 30).map(r => r.name)
      expect(related).toContain('Trading Programming')
    })
  })
})
