import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Low-Code / No-Code Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('knows about low-code internal tools', async () => {
    const r = await brain.chat(
      'explain retool internal tool builder admin panel low code platform appsmith',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/retool|low.code|internal|tool|appsmith|visual/)
  })

  it('knows about workflow automation', async () => {
    const r = await brain.chat(
      'explain zapier automation workflow trigger action n8n make integromat',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/zapier|automation|workflow|n8n|make|trigger/)
  })

  it('knows about no-code platforms', async () => {
    const r = await brain.chat(
      'explain airtable notion database spreadsheet knowledge base no code website builder webflow bubble squarespace citizen developer low code governance',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(
      /airtable|notion|webflow|bubble|no.code|citizen|retool|low.code|appsmith/,
    )
  })

  it('has Low-Code concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Low-Code & No-Code')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('low_code')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Low-Code & No-Code')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(3)
    const names = related.map(r => r.name)
    expect(names).toContain('Internal Tool Builders (Retool)')
  })
})
