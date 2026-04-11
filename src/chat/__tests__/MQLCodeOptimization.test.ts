import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL Code Optimization Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('explains MQL performance optimization techniques', async () => {
    const r = await brain.chat('How to optimize MQL EA performance and speed?')
    expect(r.text.toLowerCase()).toMatch(
      /cache|static|arrayresize|string|timer|gettickcount|performance/,
    )
  })

  it('covers MQL array handling and data structures', async () => {
    const r = await brain.chat(
      'Best practices for MQL array handling and efficient data structures?',
    )
    expect(r.text.toLowerCase()).toMatch(
      /array|arraysetasseries|struct|iterate|backwards|dynamic|static/,
    )
  })

  it('explains MQL preprocessor and code organization', async () => {
    const r = await brain.chat('How to use MQL preprocessor directives and organize MQL code?')
    expect(r.text.toLowerCase()).toMatch(
      /#ifdef|#define|#include|__mql[45]__|preprocessor|organize|property\s+strict/,
    )
  })

  describe('Semantic Memory', () => {
    it('has MQL Code Optimization concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MQL Code Optimization')
      expect(concept).toBeDefined()
    })

    it('relates to both MT4 and MT5', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MQL Code Optimization')
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('MT4 Programming')
      expect(names).toContain('MT5 Programming')
    })
  })
})
