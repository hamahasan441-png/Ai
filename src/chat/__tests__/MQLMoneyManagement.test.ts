import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL Money Management Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('knows MQL4 lot size calculation', async () => {
      const r = await brain.chat('How to calculate lot size based on risk percent in MQL4?')
      expect(r.text.toLowerCase()).toMatch(/lot|risk|accountbalance|tickvalue|normalizedouble/)
    })

    it('explains MQL5 position sizing', async () => {
      const r = await brain.chat('How to calculate lot size and risk per trade in MQL5?')
      expect(r.text.toLowerCase()).toMatch(/lot|symbol_volume_min|symbolinfodouble|risk|ordercalcmargin/)
    })

    it('covers drawdown and equity protection', async () => {
      const r = await brain.chat('How to implement drawdown control and equity protection in MQL EA?')
      expect(r.text.toLowerCase()).toMatch(/drawdown|equity|peak|daily\s+loss|protection/)
    })
  })

  describe('Semantic Memory', () => {
    it('has MQL Money Management concept', () => {
      const g = createProgrammingKnowledgeGraph()
      expect(g.findConceptByName('MQL Money Management')).toBeDefined()
    })

    it('MQL Money Management relates to Trading Programming', () => {
      const g = createProgrammingKnowledgeGraph()
      const c = g.findConceptByName('MQL Money Management')!
      const related = g.findRelated(c.id, undefined, 30).map(r => r.name)
      expect(related).toContain('Trading Programming')
    })
  })
})
