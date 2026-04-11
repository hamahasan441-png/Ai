import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL Network & Web Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('knows MQL4 WebRequest and Telegram bot integration', async () => {
      const r = await brain.chat('How to send a Telegram notification from MQL4 using WebRequest?')
      expect(r.text.toLowerCase()).toMatch(/webrequest|telegram|http|api|bot|post/)
    })

    it('explains MQL5 sockets and JSON API', async () => {
      const r = await brain.chat('How to use MQL5 socket network and HTTP API integration?')
      expect(r.text.toLowerCase()).toMatch(/socket|webrequest|json|socketcreate|http|api/)
    })

    it('covers copy trading and inter-terminal communication', async () => {
      const r = await brain.chat(
        'How to implement MQL copy trading signal between multiple terminals?',
      )
      expect(r.text.toLowerCase()).toMatch(/copy|signal|master|slave|file|pipe|common/)
    })
  })

  describe('Semantic Memory', () => {
    it('has MQL Network & Web concept', () => {
      const g = createProgrammingKnowledgeGraph()
      expect(g.findConceptByName('MQL Network & Web')).toBeDefined()
    })

    it('MQL Telegram Bot relates to MQL Network & Web', () => {
      const g = createProgrammingKnowledgeGraph()
      const c = g.findConceptByName('MQL Telegram Bot')!
      const related = g.findRelated(c.id, undefined, 30).map(r => r.name)
      expect(related).toContain('MQL Network & Web')
    })
  })
})
