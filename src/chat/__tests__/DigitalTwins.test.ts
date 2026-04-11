import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Digital Twins / Simulation Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  it('knows about digital twins', async () => {
    const r = await brain.chat(
      'explain digital twin virtual model real time synchronization physics simulation finite element',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(
      /digital\s+twin|virtual|simulation|physics|finite\s+element|agent/,
    )
  })

  it('knows about simulation methods', async () => {
    const r = await brain.chat(
      'explain monte carlo simulation random sampling discrete event simulation queuing system dynamics',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(
      /monte\s+carlo|discrete\s+event|queuing|system\s+dynamics|simulation/,
    )
  })

  it('knows about advanced simulation', async () => {
    const r = await brain.chat(
      'explain computational fluid dynamics cfd simulation optimization hardware in loop digital twin platform',
    )
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(
      /cfd|fluid|simulation|optimization|hardware|digital\s+twin/,
    )
  })

  it('has Digital Twins concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Digital Twins & Simulation')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('simulation')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Digital Twins & Simulation')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(4)
    const names = related.map(r => r.name)
    expect(names).toContain('Physics Simulation & FEA')
  })
})
