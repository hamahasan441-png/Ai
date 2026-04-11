import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Edge Computing / Serverless Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('knows about AWS Lambda', async () => {
    const r = await brain.chat(
      'explain aws lambda serverless function event driven cold start runtime handler',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/lambda|serverless|cold\s+start|function|event/)
  })

  it('knows about edge platforms', async () => {
    const r = await brain.chat(
      'explain cloudflare workers edge function v8 isolate wasm vercel edge functions deno deploy bun',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/cloudflare|worker|edge|v8|vercel|deno|serverless/)
  })

  it('knows about edge caching', async () => {
    const r = await brain.chat(
      'explain edge caching cdn worker serverless database planetscale neon turso faas',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/edge|cache|serverless|database|planetscale|neon|faas/)
  })

  it('has Edge Computing concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Edge Computing & Serverless')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('edge_computing')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Edge Computing & Serverless')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(4)
    const names = related.map(r => r.name)
    expect(names).toContain('AWS Lambda & FaaS')
  })
})
