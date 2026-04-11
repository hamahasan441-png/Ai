import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('EA Development Patterns Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('explains EA template structure and patterns', async () => {
    const r = await brain.chat(
      'What is the best expert advisor template structure and EA development framework?',
    )
    expect(r.text.toLowerCase()).toMatch(/oninit|ontick|ondeinit|template|magic\s*number|input/)
  })

  it('covers EA state machine and multi-timeframe patterns', async () => {
    const r = await brain.chat(
      'How to implement a state machine EA and multi timeframe expert advisor design?',
    )
    expect(r.text.toLowerCase()).toMatch(/state|multi.timeframe|pattern|event|pipeline|grid/)
  })

  it('explains robust EA coding with logging and error recovery', async () => {
    const r = await brain.chat('How to implement EA error recovery and logging system in MQL?')
    expect(r.text.toLowerCase()).toMatch(/log|print|retry|error|recovery|fileopen|pre.trade|valid/)
  })

  describe('Semantic Memory', () => {
    it('has EA Development Patterns concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('EA Development Patterns')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('programming')
    })

    it('EA Development Patterns relates to Expert Advisor', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('EA Development Patterns')
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Expert Advisor')
    })
  })
})
