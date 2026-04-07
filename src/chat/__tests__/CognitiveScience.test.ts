import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Cognitive Science & Learning Theory Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about cognitive science and memory systems', async () => {
      const r = await brain.chat('explain cognitive science cognition perception attention memory working memory short term long term episodic semantic')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/cognitive|memory|working\s*memory|episodic|semantic|perception|attention/)
    })

    it('answers about mental models and cognitive biases', async () => {
      const r = await brain.chat('explain mental model schema frame script metacognition cognitive bias heuristic anchoring confirmation availability')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mental\s*model|schema|metacognition|bias|heuristic|anchoring|confirmation/)
    })

    it('answers about learning theories and transfer', async () => {
      const r = await brain.chat('explain learning theory constructivism scaffolding zone proximal development transfer learning analogy abstraction distributed cognition')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/learning|constructivism|scaffolding|zone|transfer|analogy|cognition/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Cognitive Science & Learning concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Cognitive Science & Learning')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('cognitive')
    })

    it('has connected sub-concepts for cognitive science', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Cognitive Science & Learning')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Memory Systems & Working Memory')
      expect(names).toContain('Learning Theories & Transfer')
    })

    it('relates memory systems to cognitive load', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Memory Systems & Working Memory')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Cognitive Load & Schema Theory')
    })

    it('has metacognition and biases concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const mc = graph.findConceptByName('Metacognition & Self-Regulation')
      const cb = graph.findConceptByName('Cognitive Biases & Heuristics')
      expect(mc).toBeDefined()
      expect(cb).toBeDefined()
      const related = graph.findRelated(mc!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Cognitive Biases & Heuristics')
    })
  })
})
