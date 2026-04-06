import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('GraphDatabases', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should respond to neo4j RDF and graph algorithm queries', async () => {
      const response = await brain.chat('explain graph database neo4j property graph cypher rdf sparql knowledge graph ontology graph algorithm pagerank shortest path')
      expect(response).toMatch(/neo4j|cypher|rdf|sparql|pagerank|graph\s+(database|algorithm)/)
    })

    it('should respond to knowledge graph construction and GNN queries', async () => {
      const response = await brain.chat('explain knowledge graph construction entity extraction graph neural network gnn node classification graph visualization force directed')
      expect(response).toMatch(/knowledge\s+graph|entity|graph\s+neural|gnn|visualization|force/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Graph Databases & Knowledge Graphs with domain database', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Graph Databases & Knowledge Graphs')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('database')
    })

    it('should have at least 5 connected sub-concepts including Property Graph Model and RDF & SPARQL', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Graph Databases & Knowledge Graphs')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.name)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Property Graph Model')
      expect(names).toContain('RDF & SPARQL')
    })

    it('should relate Property Graph Model to Graph Algorithms', () => {
      const graph = createProgrammingKnowledgeGraph()
      const related = graph.findRelated('Property Graph Model')
      const names = related.map(r => r.name)
      expect(names).toContain('Graph Algorithms')
    })
  })
})
