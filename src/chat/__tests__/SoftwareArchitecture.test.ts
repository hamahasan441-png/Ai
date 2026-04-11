import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Software Architecture Patterns Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── KB entry tests ──────────────────────────────────────────────────
  it('knows about microservices architecture decomposition', async () => {
    const r = await brain.chat('explain microservices architecture service decomposition patterns')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/microservice|decompos|bounded|service/)
  })

  it('knows about clean and hexagonal architecture', async () => {
    const r = await brain.chat('explain clean architecture hexagonal ports and adapters onion')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/clean|hexagonal|port|adapter|layer/)
  })

  it('knows about CQRS and event sourcing', async () => {
    const r = await brain.chat(
      'explain cqrs command query responsibility segregation event sourcing',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/cqrs|event\s+sourc|command|query|aggregate/)
  })

  it('knows about domain driven design DDD', async () => {
    const r = await brain.chat(
      'explain domain driven design aggregate entity value object bounded context',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/domain|aggregate|entity|value\s+object|bounded/)
  })

  it('knows about modular monolith and SOA', async () => {
    const r = await brain.chat(
      'explain modular monolith module boundary cohesion service oriented architecture',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/modul|monolith|soa|serverless|boundary/)
  })

  it('knows about architecture decision records ADR', async () => {
    const r = await brain.chat(
      'explain architecture decision record adr documentation fitness function governance',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/adr|decision|fitness|governance|architect/)
  })

  // ── Semantic concept tests ──────────────────────────────────────────
  it('has Software Architecture Patterns concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Software Architecture Patterns')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('architecture')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Software Architecture Patterns')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(5)
    const names = related.map(r => r.name)
    expect(names).toContain('Microservices Patterns')
    expect(names).toContain('Domain-Driven Design')
  })

  it('CQRS is related to Microservices', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('CQRS & Event Sourcing')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    const names = related.map(r => r.name)
    expect(names).toContain('Microservices Patterns')
  })
})
