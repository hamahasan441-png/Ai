import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Natural Language Understanding Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about NLU and semantic parsing', async () => {
      const r = await brain.chat(
        'explain natural language understanding nlu semantic parsing word embedding word2vec glove fasttext contextual embedding',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/nlu|semantic|embedding|word2vec|glove|parsing/)
    })

    it('answers about text classification and relation extraction', async () => {
      const r = await brain.chat(
        'explain text classification sentiment analysis relation extraction question answering reading comprehension',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /classification|sentiment|relation|question\s*answer|extraction/,
      )
    })

    it('answers about coreference and discourse parsing', async () => {
      const r = await brain.chat(
        'explain coreference resolution anaphora pronoun discourse parsing rhetorical structure pragmatics implicature presupposition',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /coreference|anaphora|discourse|pragmatics|implicature|presupposition/,
      )
    })
  })

  describe('Semantic concepts', () => {
    it('has Natural Language Understanding concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Natural Language Understanding')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('nlp')
    })

    it('has connected sub-concepts for NLU', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Natural Language Understanding')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Word Embeddings & Representations')
      expect(names).toContain('Question Answering Systems')
    })

    it('relates word embeddings to text classification', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Word Embeddings & Representations')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Text Classification & Sentiment')
    })

    it('connects NLU to Knowledge Graphs cross-domain', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Natural Language Understanding')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 50)
      const names = related.map(r => r.name)
      expect(names).toContain('Knowledge Graphs & Representation')
    })
  })
})
