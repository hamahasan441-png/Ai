import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Natural Language Generation (NLG) Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('knows about NLG pipeline', async () => {
    const r = await brain.chat(
      'explain natural language generation template text production nlg pipeline content structuring',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(
      /natural\s+language\s+generation|nlg|template|pipeline|text/,
    )
  })

  it('knows about text transformation', async () => {
    const r = await brain.chat(
      'explain text summarization extractive abstractive paraphrasing grammar checking correction',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/summariz|extractive|abstractive|paraphras|grammar/)
  })

  it('knows about applied NLG', async () => {
    const r = await brain.chat(
      'explain dialogue system response generation data to text report generation content seo',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/dialogue|response|data.to.text|report|content|generation/)
  })

  it('has NLG concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Natural Language Generation (NLG)')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('nlg')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Natural Language Generation (NLG)')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(4)
    const names = related.map(r => r.name)
    expect(names).toContain('NLG Pipeline & Templates')
  })
})
