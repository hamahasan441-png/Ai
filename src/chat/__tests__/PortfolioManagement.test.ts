import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Portfolio Management Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about asset allocation and MPT', async () => {
      const r = await brain.chat('explain portfolio management asset allocation strategic tactical modern portfolio theory markowitz efficient frontier')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/portfolio|asset\s+alloc|strategic|markowitz|efficient\s+frontier|diversif/)
    })

    it('answers about risk parity and factor investing', async () => {
      const r = await brain.chat('explain risk parity all weather permanent portfolio factor investing smart beta momentum value etf index fund')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/risk\s+parity|all\s+weather|factor|smart\s+beta|etf|momentum|value/)
    })

    it('answers about hedge funds and wealth management', async () => {
      const r = await brain.chat('explain hedge fund strategy long short equity global macro portfolio performance attribution benchmark alpha wealth management')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/hedge\s+fund|long.short|global\s+macro|performance|attribution|alpha|wealth/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Portfolio Management concept in trading domain', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Portfolio Management')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('trading')
    })

    it('has >=6 connected sub-concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Portfolio Management')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(6)
    })
  })
})
