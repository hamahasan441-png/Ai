import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Technical Writing / Documentation Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => { brain = new LocalBrain({ enableIntelligence: true }) })

  // ── KB entry tests ──────────────────────────────────────
  it('knows about API documentation', async () => {
    const r = await brain.chat('explain api documentation openapi swagger reference guide jsdoc typedoc')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/openapi|swagger|jsdoc|typedoc|api\s+doc/)
  })

  it('knows about architecture decision records', async () => {
    const r = await brain.chat('explain architecture decision record adr design document rfc technical specification')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/adr|architecture\s+decision|rfc|design\s+doc/)
  })

  it('knows about diagramming tools', async () => {
    const r = await brain.chat('explain mermaid plantuml diagram as code architecture diagram sequence flowchart')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/mermaid|plantuml|diagram|sequence|flowchart/)
  })

  it('knows about writing best practices', async () => {
    const r = await brain.chat('explain tutorial howto guide writing structure documentation best practice audience')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/tutorial|how.to|guide|writing|audience|divio/)
  })

  it('knows about documentation lifecycle', async () => {
    const r = await brain.chat('explain versioned documentation release notes migration guide testing broken links')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/version|release\s+note|migration|testing|link/)
  })

  // ── Semantic concept tests ──────────────────────────────
  it('has Technical Writing concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Technical Writing & Documentation')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('documentation')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Technical Writing & Documentation')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(5)
    const names = related.map(r => r.name)
    expect(names).toContain('API Documentation (OpenAPI/Swagger)')
    expect(names).toContain('ADRs & Design Documents')
  })
})
