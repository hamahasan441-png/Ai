/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Reactive Programming Knowledge — Tests                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('ReactiveProgramming', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match reactive streams and backpressure keywords', async () => {
      const r = await brain.chat(
        'explain reactive stream rxjs rxjava project reactor observable operator backpressure strategy buffer drop throttle',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/reactive|rxjs|rxjava|reactor|backpressure|observable/)
    })

    it('should match reactive systems and FRP keywords', async () => {
      const r = await brain.chat(
        'explain reactive system reactive manifesto resilient elastic message driven functional reactive programming signal behavior',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /reactive\s+(manifesto|system)|resilient|elastic|message.driven|signal/,
      )
    })

    it('should match reactive operators and error handling keywords', async () => {
      const r = await brain.chat(
        'explain reactive operator map flatmap switchmap merge combinlatest zip error handling reactive retry onerror circuit breaker',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /switchmap|merge|combinlatest|zip|retry|circuit\s+breaker/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Reactive Programming & Streams with domain architecture', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Reactive Programming & Streams')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('architecture')
    })

    it('should have >=5 connected sub-concepts including Backpressure Strategies', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Reactive Programming & Streams')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Reactive Streams & Operators')
      expect(names).toContain('Backpressure Strategies')
    })

    it('should relate Reactive Streams & Operators to Backpressure Strategies', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Reactive Streams & Operators')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Backpressure Strategies')
    })
  })
})
