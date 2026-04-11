import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MT4→MT5 Migration Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('explains MT4 to MT5 conversion guide', async () => {
    const r = await brain.chat(
      'How to convert an EA from MT4 to MT5? What are the migration steps?',
    )
    expect(r.text.toLowerCase()).toMatch(
      /ordersend|ctrade|copybuffer|copyrates|netting|hedging|migration|convert/,
    )
  })

  it('covers MQL4 to MQL5 API function mapping', async () => {
    const r = await brain.chat('What are the MQL4 to MQL5 function mapping and API differences?')
    expect(r.text.toLowerCase()).toMatch(
      /accountbalance|accountinfodouble|marketinfo|symbolinfodouble|mapping|mql[45]/,
    )
  })

  it('explains cross-platform MQL code with preprocessor', async () => {
    const r = await brain.chat(
      'How to write cross platform MQL4 MQL5 compatible code with wrapper functions?',
    )
    expect(r.text.toLowerCase()).toMatch(
      /#ifdef|__mql[45]__|wrapper|cross.platform|getbid|universal/,
    )
  })

  describe('Semantic Memory', () => {
    it('has MT4→MT5 Migration concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MT4→MT5 Migration')
      expect(concept).toBeDefined()
    })

    it('relates to both MT4 and MT5 Programming', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MT4→MT5 Migration')
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('MT4 Programming')
      expect(names).toContain('MT5 Programming')
    })
  })
})
