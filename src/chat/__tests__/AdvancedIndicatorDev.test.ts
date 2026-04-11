import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Advanced Indicator Development Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('explains multi-timeframe and arrow/signal indicators', async () => {
    const r = await brain.chat(
      'How to create a multi timeframe indicator and arrow signal indicator in MQL?',
    )
    expect(r.text.toLowerCase()).toMatch(
      /multi.timeframe|mtf|arrow|signal|draw_arrow|wingding|buffer/,
    )
  })

  it('covers indicator repainting fix techniques', async () => {
    const r = await brain.chat(
      'How to fix indicator repainting and create non repainting indicators?',
    )
    expect(r.text.toLowerCase()).toMatch(
      /repaint|bar\s*(close|confirm|index\s*[01])|completed|static\s+datetime/,
    )
  })

  it('explains indicator display types (overlay, histogram, channel)', async () => {
    const r = await brain.chat(
      'What indicator display types exist: overlay, separate window, histogram, channel band?',
    )
    expect(r.text.toLowerCase()).toMatch(
      /chart_window|separate_window|histogram|draw_(filling|line|candles)|channel|band/,
    )
  })

  describe('Semantic Memory', () => {
    it('has Advanced Indicator Development concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Advanced Indicator Development')
      expect(concept).toBeDefined()
    })

    it('relates to Trading Indicator', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Advanced Indicator Development')
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Trading Indicator')
    })
  })
})
