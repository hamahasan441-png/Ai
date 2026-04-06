import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Site Reliability Engineering (SRE) Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => { brain = new LocalBrain({ enableIntelligence: true }) })

  // ── KB entry tests ──────────────────────────────────────
  it('knows about SLIs SLOs and SLAs', async () => {
    const r = await brain.chat('explain sli slo sla service level indicator objective agreement error budget')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/sli|slo|sla|service\s+level|error\s+budget/)
  })

  it('knows about incident management', async () => {
    const r = await brain.chat('explain incident management response postmortem blameless review on call rotation')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/incident|postmortem|blameless|on.call|severity/)
  })

  it('knows about chaos engineering', async () => {
    const r = await brain.chat('explain chaos engineering resilience testing fault injection chaos monkey gameday')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/chaos|resilience|fault|monkey|gameday|disaster/)
  })

  it('knows about toil reduction', async () => {
    const r = await brain.chat('explain toil reduction automation operational work repetitive release engineering canary deployment')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/toil|automat|release|deploy|canary|rolling|operational/)
  })

  it('knows about SRE observability', async () => {
    const r = await brain.chat('explain observability three pillars metrics logs traces alerting fatigue golden signals')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/observ|metric|log|trace|alert|golden/)
  })

  // ── Semantic concept tests ──────────────────────────────
  it('has SRE concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Site Reliability Engineering')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('sre')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Site Reliability Engineering')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(5)
    const names = related.map(r => r.name)
    expect(names).toContain('SLIs, SLOs & SLAs')
    expect(names).toContain('Incident Management & Postmortems')
  })
})
