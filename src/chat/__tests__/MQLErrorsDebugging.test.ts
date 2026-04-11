import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL Errors & Debugging Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('knows MQL4 error codes and GetLastError', async () => {
    const r = await brain.chat('What are common MQL4 error codes and how to use GetLastError?')
    expect(r.text.toLowerCase()).toMatch(/getlasterror|error\s*(code|130|131|134|138)|err_/)
  })

  it('explains MQL5 trade result codes', async () => {
    const r = await brain.chat('What are MQL5 trade result retcodes and MqlTradeResult?')
    expect(r.text.toLowerCase()).toMatch(/retcode|trade_retcode|mqltraderesult|result/)
  })

  it('covers MQL compilation errors and fixes', async () => {
    const r = await brain.chat('How to fix common MQL compilation syntax errors?')
    expect(r.text.toLowerCase()).toMatch(
      /semicolon|undeclared|implicit\s+conversion|compile|#property\s+strict/,
    )
  })

  describe('Semantic Memory', () => {
    it('has MQL Errors & Debugging concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MQL Errors & Debugging')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('programming')
    })

    it('MQL Error Codes relates to Trading Programming', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MQL Errors & Debugging')
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Trading Programming')
    })
  })
})
