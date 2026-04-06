import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Open Source / Community Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => { brain = new LocalBrain({ enableIntelligence: true }) })

  // ── KB entry tests ──────────────────────────────────────
  it('knows about open source licensing', async () => {
    const r = await brain.chat('explain open source license mit gpl apache bsd permissive copyleft')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/licens|mit|gpl|apache|permissive|copyleft/)
  })

  it('knows about semantic versioning', async () => {
    const r = await brain.chat('explain semantic versioning semver major minor patch conventional commits changelog')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/semver|semantic\s+version|major|minor|patch|changelog/)
  })

  it('knows about community management', async () => {
    const r = await brain.chat('explain contributing guide code of conduct community guidelines pr template issue')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/contribut|code\s+of\s+conduct|community|template|governance/)
  })

  it('knows about OSS operations', async () => {
    const r = await brain.chat('explain github actions ci cd open source workflow automation package publishing npm pypi crates rubygems registry')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/open\s+source|licens|publish|registry|ci|workflow/)
  })

  it('knows about OSS sustainability', async () => {
    const r = await brain.chat('explain open source funding sponsorship sustainability model contribution forking inner source')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/fund|sponsor|sustain|contribut|fork|inner.?source|open\s+source/)
  })

  // ── Semantic concept tests ──────────────────────────────
  it('has Open Source concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Open Source & Community')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('open_source')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Open Source & Community')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(5)
    const names = related.map(r => r.name)
    expect(names).toContain('Open Source Licensing')
    expect(names).toContain('Semantic Versioning & Releases')
  })
})
