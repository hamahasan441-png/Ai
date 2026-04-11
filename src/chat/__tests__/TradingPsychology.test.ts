import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Trading Psychology Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about trading psychology and biases', async () => {
      const r = await brain.chat(
        'explain trading psychology emotional discipline fear greed cognitive bias overconfidence loss aversion recency',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /psychology|emotion|discipline|fear|greed|bias|loss\s+aversion/,
      )
    })

    it('answers about risk management and trading plans', async () => {
      const r = await brain.chat(
        'explain risk management position sizing percent risk trading plan rules entry exit criteria performance metrics',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /risk|position\s+siz|trading\s+plan|performance|metric|win\s+rate/,
      )
    })

    it('answers about market regimes and trading mistakes', async () => {
      const r = await brain.chat(
        'explain market regime trend range volatile quiet adapting trading mistakes revenge trading overtrading professional',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /regime|trend|range|volatile|revenge|overtrading|professional/,
      )
    })
  })

  describe('Semantic concepts', () => {
    it('has Trading Psychology concept in trading domain', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Trading Psychology')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('trading')
    })

    it('has >=5 connected sub-concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Trading Psychology')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })
  })
})
