import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Information Retrieval & Search Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about information retrieval and ranking', async () => {
      const r = await brain.chat(
        'explain information retrieval search engine indexing ranking tf idf bm25 vector search semantic search inverted index',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /retrieval|ranking|tf.idf|bm25|inverted\s*index|search|semantic/,
      )
    })

    it('answers about query expansion and learning to rank', async () => {
      const r = await brain.chat(
        'explain query expansion reformulation relevance feedback learning to rank pairwise listwise faceted search autocomplete',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /query|expansion|relevance|learning\s*to\s*rank|faceted|autocomplete/,
      )
    })

    it('answers about RAG and search engines', async () => {
      const r = await brain.chat(
        'explain knowledge retrieval augmented generation rag document chunking passage retrieval search index elasticsearch solr',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /rag|retrieval|chunking|passage|elasticsearch|search|document/,
      )
    })
  })

  describe('Semantic concepts', () => {
    it('has Information Retrieval & Search concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Information Retrieval & Search')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('search')
    })

    it('has connected sub-concepts for IR', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Information Retrieval & Search')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Ranking Algorithms (TF-IDF, BM25)')
      expect(names).toContain('Semantic & Vector Search')
    })

    it('relates ranking algorithms to learning to rank', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Ranking Algorithms (TF-IDF, BM25)')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Learning to Rank')
    })

    it('relates semantic search to RAG architecture', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Semantic & Vector Search')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('RAG Architecture & Document Chunking')
    })
  })
})
