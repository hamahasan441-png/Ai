import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL Chart Objects & GUI Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('knows MQL4 chart objects programming', async () => {
      const r = await brain.chat('How to draw lines and rectangles on a chart using MQL4 ObjectCreate?')
      expect(r.text.toLowerCase()).toMatch(/objectcreate|obj_hline|obj_trend|objprop_color/)
    })

    it('explains MQL4 interactive button panels', async () => {
      const r = await brain.chat('How to create an interactive button panel GUI in MQL4 EA?')
      expect(r.text.toLowerCase()).toMatch(/obj_button|onchartevent|click|objprop_xsize/)
    })

    it('covers MQL5 canvas and CDialog panels', async () => {
      const r = await brain.chat('How to use MQL5 CCanvas drawing and CDialog custom panel?')
      expect(r.text.toLowerCase()).toMatch(/canvas|ccanvas|cgraphic|cappd?ialog|bitmap|pixel/)
    })
  })

  describe('Semantic Memory', () => {
    it('has MQL Chart Objects concept', () => {
      const g = createProgrammingKnowledgeGraph()
      expect(g.findConceptByName('MQL Chart Objects')).toBeDefined()
    })

    it('MQL Chart Objects relates to Trading Programming', () => {
      const g = createProgrammingKnowledgeGraph()
      const c = g.findConceptByName('MQL Chart Objects')!
      const related = g.findRelated(c.id, undefined, 30).map(r => r.name)
      expect(related).toContain('Trading Programming')
    })
  })
})
