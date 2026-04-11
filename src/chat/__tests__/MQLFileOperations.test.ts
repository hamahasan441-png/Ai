import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL File Operations Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('knows MQL4 file read/write and CSV export', async () => {
      const r = await brain.chat('How to read and write CSV files in MQL4 with FileOpen?')
      expect(r.text.toLowerCase()).toMatch(/fileopen|filewrite|file_csv|csv|fileclose/)
    })

    it('explains MQL5 SQLite database operations', async () => {
      const r = await brain.chat('How to use SQLite database in MQL5 for trade data storage?')
      expect(r.text.toLowerCase()).toMatch(
        /database|sqlite|databaseopen|databaseexecute|create\s+table/,
      )
    })

    it('covers persistent state and settings save/load', async () => {
      const r = await brain.chat('How to save and load EA persistent state and settings in MQL?')
      expect(r.text.toLowerCase()).toMatch(/globalvariable|file|save|load|persistent|ondeinit/)
    })
  })

  describe('Semantic Memory', () => {
    it('has MQL File Operations concept', () => {
      const g = createProgrammingKnowledgeGraph()
      expect(g.findConceptByName('MQL File Operations')).toBeDefined()
    })

    it('MQL5 SQLite Database relates to MT5 Programming', () => {
      const g = createProgrammingKnowledgeGraph()
      const c = g.findConceptByName('MQL5 SQLite Database')!
      const related = g.findRelated(c.id, undefined, 30).map(r => r.name)
      expect(related).toContain('MT5 Programming')
    })
  })
})
