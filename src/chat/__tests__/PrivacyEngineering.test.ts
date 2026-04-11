import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Privacy Engineering / GDPR Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── KB entry tests ──────────────────────────────────────
  it('knows about GDPR fundamentals', async () => {
    const r = await brain.chat(
      'explain gdpr general data protection regulation european privacy personal data',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/gdpr|data\s+protection|personal\s+data|consent|right/)
  })

  it('knows about privacy by design', async () => {
    const r = await brain.chat(
      'explain consent management platform cmp cookie banner privacy by design dpia',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/consent|privacy\s+by\s+design|dpia|cookie|assessment/)
  })

  it('knows about PII handling', async () => {
    const r = await brain.chat(
      'explain pii personally identifiable information anonymization pseudonymization differential privacy',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/pii|anonymiz|pseudonymiz|differential\s+privacy|identif/)
  })

  it('knows about data subject rights', async () => {
    const r = await brain.chat(
      'explain right to erasure deletion data subject request dsar retention cross border',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/erasure|data\s+subject|dsar|retention|transfer|cross/)
  })

  it('knows about CCPA and breach response', async () => {
    const r = await brain.chat(
      'explain ccpa california consumer privacy act cpra rights data breach notification incident response gdpr 72 hours',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(
      /ccpa|cpra|california|breach|privacy|gdpr|data\s+protection/,
    )
  })

  // ── Semantic concept tests ──────────────────────────────
  it('has Privacy Engineering concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Privacy Engineering & GDPR')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('privacy')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Privacy Engineering & GDPR')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(5)
    const names = related.map(r => r.name)
    expect(names).toContain('GDPR Fundamentals & Principles')
    expect(names).toContain('Privacy by Design & Consent')
  })
})
