import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Natural Language Processing Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Word Embeddings & Models ───────────────────────────────────────────
  describe('Word Embeddings & Language Models', () => {
    it('explains NLP tokenization and word embeddings', async () => {
      const r = await brain.chat(
        'How do NLP tokenization word embedding representations like Word2Vec GloVe work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/tokeniz|word2vec|glove|embedding|bert|subword|nlp/)
    })

    it('covers BERT and transformer models', async () => {
      const r = await brain.chat(
        'How does BERT transformer language model pretraining work for NLP tasks?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /bert|transformer|pretrain|language\s*model|fine.?tun|attention/,
      )
    })
  })

  // ── NLP Tasks ──────────────────────────────────────────────────────────
  describe('NLP Tasks', () => {
    it('explains NER and sequence labeling', async () => {
      const r = await brain.chat('What is named entity recognition NER sequence labeling in NLP?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /ner|named\s*entity|recognition|label|spacy|classification/,
      )
    })

    it('covers text classification and sentiment', async () => {
      const r = await brain.chat(
        'How does text classification sentiment analysis topic modeling work in NLP?',
      )
      expect(r.text.toLowerCase()).toMatch(/text\s*classification|sentiment|topic|model|bert|nlp/)
    })
  })

  // ── Machine Translation ────────────────────────────────────────────────
  describe('Machine Translation', () => {
    it('explains seq2seq and attention for translation', async () => {
      const r = await brain.chat(
        'How does machine translation seq2seq attention mechanism encoder decoder work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /translation|seq2seq|attention|encoder|decoder|transformer/,
      )
    })

    it('covers multilingual models', async () => {
      const r = await brain.chat(
        'What are multilingual translation cross-lingual transfer models for NLP?',
      )
      expect(r.text.toLowerCase()).toMatch(/multilingual|translation|cross.?lingual|bert|language/)
    })
  })

  // ── Text Generation & LLMs ────────────────────────────────────────────
  describe('Text Generation & LLMs', () => {
    it('explains LLMs and prompt engineering', async () => {
      const r = await brain.chat(
        'How does text generation language model GPT LLM prompt engineering work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /gpt|llm|language\s*model|prompt|generation|chain.?of.?thought|rag/,
      )
    })

    it('covers RAG retrieval augmented generation', async () => {
      const r = await brain.chat(
        'What is RAG retrieval augmented generation for knowledge-based LLM answers?',
      )
      expect(r.text.toLowerCase()).toMatch(/rag|retrieval|augmented|generation|vector|knowledge/)
    })
  })

  // ── NLP Tools ──────────────────────────────────────────────────────────
  describe('NLP Tools & Libraries', () => {
    it('explains SpaCy and Hugging Face tools', async () => {
      const r = await brain.chat(
        'What are SpaCy Hugging Face NLTK NLP library toolkit options for processing?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/spacy|hugging\s*face|nltk|pipeline|nlp|transformer/)
    })
  })

  // ── Speech & Conversational AI ─────────────────────────────────────────
  describe('Speech & Conversational AI', () => {
    it('explains speech recognition and TTS', async () => {
      const r = await brain.chat(
        'How does speech recognition ASR text to speech synthesis Whisper work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/speech|recognition|asr|whisper|tts|voice|audio/)
    })
  })

  // ── Semantic Memory ────────────────────────────────────────────────────
  describe('Semantic Memory - NLP concepts', () => {
    it('has Natural Language Processing concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Natural Language Processing')
      expect(c).toBeDefined()
      expect(c!.domain).toBe('ai')
    })

    it('has Word Embeddings concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Word Embeddings')
      expect(c).toBeDefined()
    })

    it('has Text Generation & LLMs concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Text Generation & LLMs')
      expect(c).toBeDefined()
    })

    it('has Machine Translation concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Machine Translation')
      expect(c).toBeDefined()
    })

    it('NLP has many related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Natural Language Processing')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Word Embeddings is related to NLP Tasks', () => {
      const mem = createProgrammingKnowledgeGraph()
      const c = mem.findConceptByName('Word Embeddings')
      expect(c).toBeDefined()
      const related = mem.findRelated(c!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('NLP Tasks')
    })
  })
})
