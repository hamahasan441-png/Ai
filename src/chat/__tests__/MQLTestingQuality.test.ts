import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL Testing & Code Quality Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('knows MT4 Strategy Tester optimization tips', async () => {
      const r = await brain.chat('What are best practices for MQL4 strategy tester optimization and backtesting?')
      expect(r.text.toLowerCase()).toMatch(/strategy\s+tester|every\s+tick|optimi[sz]|walk.forward|profit\s+factor/)
    })

    it('explains MQL5 cloud network and OnTester', async () => {
      const r = await brain.chat('How to use MQL5 cloud network optimization and OnTester custom criterion?')
      expect(r.text.toLowerCase()).toMatch(/cloud|ontester|multi.currency|frame|agent|testerstatistics/)
    })

    it('covers MQL code quality standards checklist', async () => {
      const r = await brain.chat('What is the MQL code quality best practices and review checklist?')
      expect(r.text.toLowerCase()).toMatch(/(#property\s+strict|magic\s+number|normalizedouble|error\s+handling|getlasterror|meaningful|cleanup)/)
    })
  })

  describe('Semantic Memory', () => {
    it('has MQL Testing & Quality concept', () => {
      const g = createProgrammingKnowledgeGraph()
      expect(g.findConceptByName('MQL Testing & Quality')).toBeDefined()
    })

    it('MQL Strategy Tester relates to MQL Testing & Quality', () => {
      const g = createProgrammingKnowledgeGraph()
      const c = g.findConceptByName('MQL Strategy Tester')!
      const related = g.findRelated(c.id, undefined, 30).map(r => r.name)
      expect(related).toContain('MQL Testing & Quality')
    })
  })
})
