import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL Strategy Patterns Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('knows grid trading EA pattern', async () => {
      const r = await brain.chat('How to code a grid trading EA in MQL4 with pending orders?')
      expect(r.text.toLowerCase()).toMatch(/grid|pending|buylimit|selllimit|gridstep|levels/)
    })

    it('explains scalping EA patterns', async () => {
      const r = await brain.chat('How to build a scalping EA in MQL4 with fast execution?')
      expect(r.text.toLowerCase()).toMatch(/scalp|spread|tick|fast|execution|m1|pip/)
    })

    it('covers hedging and martingale strategies', async () => {
      const r = await brain.chat('How does MQL hedging strategy and martingale EA code work?')
      expect(r.text.toLowerCase()).toMatch(/hedg|martingale|opposite|double\s+lot|anti/)
    })
  })

  describe('Semantic Memory', () => {
    it('has MQL Strategy Patterns concept', () => {
      const g = createProgrammingKnowledgeGraph()
      expect(g.findConceptByName('MQL Strategy Patterns')).toBeDefined()
    })

    it('MQL Grid Trading relates to MQL Strategy Patterns', () => {
      const g = createProgrammingKnowledgeGraph()
      const c = g.findConceptByName('MQL Grid Trading')!
      const related = g.findRelated(c.id, undefined, 30).map(r => r.name)
      expect(related).toContain('MQL Strategy Patterns')
    })
  })
})
