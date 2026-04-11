import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Knowledge Graphs & Representation Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about knowledge graphs and ontologies', async () => {
      const r = await brain.chat(
        'explain knowledge graph ontology triple rdf owl sparql knowledge representation reasoning semantic web',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/knowledge\s*graph|ontology|triple|rdf|owl|sparql/)
    })

    it('answers about ontology design and reasoning', async () => {
      const r = await brain.chat(
        'explain ontology design class hierarchy reasoning inference forward chaining backward chaining commonsense knowledge',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /ontology|reasoning|inference|chaining|commonsense|class/,
      )
    })

    it('answers about entity linking and graph neural networks', async () => {
      const r = await brain.chat(
        'explain entity linking disambiguation graph neural network gnn knowledge graph embedding knowledge fusion integration',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /entity\s*link|disambiguation|gnn|graph\s*neural|embedding|fusion/,
      )
    })
  })

  describe('Semantic concepts', () => {
    it('has Knowledge Graphs & Representation concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Knowledge Graphs & Representation')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('knowledge')
    })

    it('has connected sub-concepts for knowledge graphs', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Knowledge Graphs & Representation')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Ontology Design & Axioms')
      expect(names).toContain('Graph Reasoning & Inference')
    })

    it('relates ontology design to graph reasoning', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Ontology Design & Axioms')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Graph Reasoning & Inference')
    })

    it('has entity linking and KG embeddings concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const el = graph.findConceptByName('Entity Linking & Disambiguation')
      const kge = graph.findConceptByName('KG Embeddings & GNNs')
      expect(el).toBeDefined()
      expect(kge).toBeDefined()
      const related = graph.findRelated(el!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('KG Embeddings & GNNs')
    })
  })
})
