import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Trading Code Templates Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('provides MQL4 EA template code', async () => {
    const r = await brain.chat('Give me an MQL4 expert advisor template boilerplate code')
    expect(r.text.toLowerCase()).toMatch(/oninit|ontick|ordersend|mql4|ea|template|magic|lotsize/)
  })

  it('provides MQL4 indicator template code', async () => {
    const r = await brain.chat('Give me an MQL4 custom indicator template with arrow signals')
    expect(r.text.toLowerCase()).toMatch(
      /oncalculate|setindexbuffer|indicator|draw_arrow|setindexarrow|template/,
    )
  })

  it('provides MQL5 EA template code', async () => {
    const r = await brain.chat('Give me an MQL5 expert advisor template boilerplate with CTrade')
    expect(r.text.toLowerCase()).toMatch(
      /ctrade|oninit|ontick|mql5|trade\.buy|copybuffer|template|indicatorrelease/,
    )
  })

  describe('Semantic Memory', () => {
    it('has Trading Code Templates concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Trading Code Templates')
      expect(concept).toBeDefined()
    })

    it('relates to MT4 and MT5 Programming', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Trading Code Templates')
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('MT4 Programming')
      expect(names).toContain('MT5 Programming')
    })
  })
})
