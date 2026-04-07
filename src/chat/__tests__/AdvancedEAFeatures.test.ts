import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Advanced EA Features Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('explains trailing stop, breakeven, and partial close', async () => {
    const r = await brain.chat('How to code a trailing stop, breakeven stop loss, and partial close order in MQL?')
    expect(r.text.toLowerCase()).toMatch(/trailing|breakeven|partial\s*close|ordermodify|stoploss|atr/)
  })

  it('covers news filter, session filter, and spread filter for EAs', async () => {
    const r = await brain.chat('How to add a news filter, session filter, and spread filter to an expert advisor?')
    expect(r.text.toLowerCase()).toMatch(/news|session|spread|filter|hour|mode_spread|isTradeAllowed|trading/i)
  })

  it('explains EA dashboard panel development', async () => {
    const r = await brain.chat('How to create an EA dashboard panel HUD with MQL graphical interface?')
    expect(r.text.toLowerCase()).toMatch(/objectcreate|panel|label|rectangle|dashboard|display|balance|cappDialog/i)
  })

  describe('Semantic Memory', () => {
    it('has Advanced EA Features concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Advanced EA Features')
      expect(concept).toBeDefined()
    })

    it('relates to Expert Advisor', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Advanced EA Features')
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Expert Advisor')
    })
  })
})
