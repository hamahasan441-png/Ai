import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL Common Mistakes & Syntax Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('knows common MQL coding mistakes and fixes', async () => {
    const r = await brain.chat(
      'What are the most common MQL coding mistakes and pitfalls for beginners?',
    )
    expect(r.text.toLowerCase()).toMatch(
      /ordersend|5.digit|normalizedouble|mode_stoplevel|refreshrates|magic|point/,
    )
  })

  it('covers MQL type conversion and variable scope errors', async () => {
    const r = await brain.chat('How to fix MQL type conversion errors and variable scope issues?')
    expect(r.text.toLowerCase()).toMatch(
      /type\s*conver|implicit|double|int|string|scope|static|array/,
    )
  })

  it('explains broker error handling (trade context, requotes, slippage)', async () => {
    const r = await brain.chat(
      'How to handle trade context busy error, requotes, and slippage in MQL?',
    )
    expect(r.text.toLowerCase()).toMatch(
      /trade\s*context|requote|slippage|error\s*(146|138|130)|retry|sleep|invalid\s*stops/,
    )
  })

  describe('Semantic Memory', () => {
    it('has MQL Common Mistakes concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MQL Common Mistakes')
      expect(concept).toBeDefined()
    })

    it('relates to MQL Errors & Debugging', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MQL Common Mistakes')
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('MQL Errors & Debugging')
    })
  })
})
