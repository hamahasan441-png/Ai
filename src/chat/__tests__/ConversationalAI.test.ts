import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Conversational AI & Dialogue Systems Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about conversational AI and dialogue systems', async () => {
      const r = await brain.chat('explain conversational ai chatbot dialogue system virtual assistant dialogue management state tracking slot filling')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/dialogue|chatbot|slot\s*fill|state\s*track|conversational|nlu/)
    })

    it('answers about intent recognition and entity extraction', async () => {
      const r = await brain.chat('explain intent recognition classification nlu entity extraction named entity recognition ner slot dialogue policy')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/intent|entity|ner|recognition|classification|dialogue\s*policy/)
    })

    it('answers about conversation context and response generation', async () => {
      const r = await brain.chat('explain conversation context window memory multi turn dialogue management response generation template retrieval generative')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/context|memory|multi.turn|response|generation|retrieval/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Conversational AI & Dialogue Systems concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Conversational AI & Dialogue Systems')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('ai')
    })

    it('has connected sub-concepts for dialogue systems', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Conversational AI & Dialogue Systems')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Dialogue State Tracking & Slot Filling')
      expect(names).toContain('Multi-Turn Dialogue Management')
    })

    it('relates conversation memory to multi-turn dialogue', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Conversation Memory & Context Window')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Multi-Turn Dialogue Management')
    })

    it('has cross-domain dependency on NLU', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Conversational AI & Dialogue Systems')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 50)
      const names = related.map(r => r.name)
      expect(names).toContain('Natural Language Understanding')
    })
  })
})
