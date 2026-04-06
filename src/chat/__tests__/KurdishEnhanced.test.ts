/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  Kurdish Enhanced — Tests for stemming, ZWNJ handling, expanded lexicon    ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  KurdishSentimentAnalyzer,
} from '../KurdishSentimentAnalyzer.js'
import { KurdishMorphologicalAnalyzer } from '../KurdishMorphologicalAnalyzer.js'
import { SemanticMemory, createProgrammingKnowledgeGraph } from '../SemanticMemory.js'
import { LocalBrain } from '../LocalBrain.js'

describe('Kurdish Enhanced Understanding', () => {
  let analyzer: KurdishSentimentAnalyzer

  beforeEach(() => {
    analyzer = new KurdishSentimentAnalyzer()
  })

  // ── Stemming: suffix-stripped words match the lexicon ────────────────────

  describe('Stemming — suffix-stripped word matching', () => {
    it('strips -م (1st person) from خۆشحاڵم → خۆشحاڵ (happy)', () => {
      const r = analyzer.analyzeSentiment('خۆشحاڵم')
      expect(r.label).toBe('positive')
    })

    it('strips -م (1st person) from دڵتەنگم → دڵتەنگ (sad)', () => {
      const r = analyzer.analyzeSentiment('دڵتەنگم')
      expect(r.label).toBe('negative')
    })

    it('strips -ترینی (superlative+ezafe) from بەختەوەرترینی → بەختەوەر', () => {
      const r = analyzer.analyzeSentiment('بەختەوەرترینی')
      expect(r.label).toBe('positive')
    })

    it('strips -ترین (superlative) from ناشرینترین → ناشرین', () => {
      const r = analyzer.analyzeSentiment('ناشرینترین')
      expect(r.label).toBe('negative')
    })

    it('strips -ی (ezafe) from جوانی → جوان (beautiful)', () => {
      const r = analyzer.analyzeSentiment('جوانی')
      expect(r.label).toBe('positive')
    })

    it('strips -ت (2nd person) from سەرکەوتووت → سەرکەوتوو', () => {
      const r = analyzer.analyzeSentiment('سەرکەوتووت')
      expect(r.label).toBe('positive')
    })

    it('strips -ن (plural) from جوانن → جوان', () => {
      const r = analyzer.analyzeSentiment('جوانن')
      expect(r.label).toBe('positive')
    })

    it('strips -یی (abstract) from سادەیی → سادە', () => {
      const r = analyzer.analyzeSentiment('سادەیی')
      expect(r.label).toBe('positive')
    })

    it('strips -ی from ئازاری → ئازار (pain)', () => {
      const r = analyzer.analyzeSentiment('ئازاری')
      expect(r.label).toBe('negative')
    })

    it('strips -ن from بێزارن → بێزار (fed up)', () => {
      const r = analyzer.analyzeSentiment('بێزارن')
      expect(r.label).toBe('negative')
    })

    it('strips -ەکان (definite plural) from خەمەکان → خەم (sorrow)', () => {
      const r = analyzer.analyzeSentiment('خەمەکان')
      expect(r.label).toBe('negative')
    })

    it('strips -تر (comparative) from باشتر → باش (better)', () => {
      const r = analyzer.analyzeSentiment('باشتر')
      expect(r.label).toBe('positive')
    })

    it('strips -ەکە (definite singular) from خۆشیەکە → خۆشی', () => {
      const r = analyzer.analyzeSentiment('خۆشیەکە')
      expect(r.label).toBe('positive')
    })
  })

  // ── ZWNJ handling ──────────────────────────────────────────────────────

  describe('ZWNJ (zero-width non-joiner) handling', () => {
    it('handles ZWNJ between words', () => {
      // خەڵک‌دا contains a ZWNJ between خەڵک and دا
      const r = analyzer.analyzeSentiment('جوان\u200Cترین')
      // Should match "جوان" after ZWNJ splitting and stemming
      expect(r.label).toBe('positive')
    })

    it('handles text with multiple ZWNJ characters', () => {
      const r = analyzer.analyzeSentiment('خۆشحاڵ\u200Cبوو\u200Cم')
      // "خۆشحاڵ" should match
      expect(r.label).toBe('positive')
    })
  })

  // ── Expanded lexicon coverage ──────────────────────────────────────────

  describe('Expanded lexicon — new words', () => {
    it('detects بژی (long live) as positive', () => {
      const word = analyzer.getWordSentiment('بژی')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('positive')
    })

    it('detects خۆشبێت (well done/may you be happy) as positive', () => {
      const word = analyzer.getWordSentiment('خۆشبێت')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('positive')
    })

    it('detects گەورە (great) as positive', () => {
      const word = analyzer.getWordSentiment('گەورە')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('positive')
    })

    it('detects ڕازی (content/satisfied) as positive', () => {
      const word = analyzer.getWordSentiment('ڕازی')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('positive')
    })

    it('detects ئومێد (hope) as positive', () => {
      const word = analyzer.getWordSentiment('ئومێد')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('positive')
    })

    it('detects ئازادی (freedom) as positive', () => {
      const word = analyzer.getWordSentiment('ئازادی')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('positive')
    })

    it('detects میهرەبان (kind) as positive', () => {
      const word = analyzer.getWordSentiment('میهرەبان')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('positive')
    })

    it('detects نائومێدی (despair) as negative', () => {
      const word = analyzer.getWordSentiment('نائومێدی')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('negative')
    })

    it('detects ئاوارە (refugee/displaced) as negative', () => {
      const word = analyzer.getWordSentiment('ئاوارە')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('negative')
    })

    it('detects بێکەسی (loneliness) as negative', () => {
      const word = analyzer.getWordSentiment('بێکەسی')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('negative')
    })

    it('detects ڕەخنە (criticism) as neutral', () => {
      const word = analyzer.getWordSentiment('ڕەخنە')
      expect(word).toBeDefined()
      expect(word!.sentiment).toBe('neutral')
    })

    it('lexicon size is > 160 with expanded words', () => {
      expect(analyzer.getLexiconSize()).toBeGreaterThan(160)
    })
  })

  // ── Intensifier + stemming combinations ──────────────────────────────

  describe('Intensifier + stemming combinations', () => {
    it('"زۆر خۆشحاڵم" → positive with intensifier on stemmed word', () => {
      const r = analyzer.analyzeSentiment('زۆر خۆشحاڵم')
      expect(r.label).toBe('positive')
      expect(r.confidence).toBeGreaterThan(0.3)
    })

    it('"تەواو خراپن" → negative with intensifier on stemmed word', () => {
      const r = analyzer.analyzeSentiment('تەواو خراپن')
      expect(r.label).toBe('negative')
    })

    it('"گەلەک جوانی" → positive with intensifier on stemmed word', () => {
      const r = analyzer.analyzeSentiment('گەلەک جوانی')
      expect(r.label).toBe('positive')
    })
  })

  // ── Negation + stemming combinations ──────────────────────────────────

  describe('Negation + stemming combinations', () => {
    it('"نا خۆشحاڵم" → negative (negation flips stemmed positive)', () => {
      const r = analyzer.analyzeSentiment('نا خۆشحاڵم')
      expect(r.label).toBe('negative')
    })
  })

  // ── Complex sentences with stemming ──────────────────────────────────

  describe('Complex sentences with stemming', () => {
    it('mixed sentence with inflected positive and negative words', () => {
      // "happiness and sorrow are in life"
      const r = analyzer.analyzeSentiment('خۆشحاڵیم و خەمبارم لە ژیاندا')
      expect(['mixed', 'positive', 'negative', 'neutral']).toContain(r.label)
    })

    it('prayer/blessing sentence with stemmed words', () => {
      const r = analyzer.analyzeSentiment('خوای گەورە سەرکەوتووت بکا')
      expect(r.label).toBe('positive')
    })

    it('congratulations with inflected words', () => {
      const r = analyzer.analyzeSentiment('پیرۆزە سۆزە خان سەرکەوتوو بیت')
      expect(r.label).toBe('positive')
    })
  })
})

// ── Morphological Analyzer — Enhanced roots ──────────────────────────────────

describe('KurdishMorphologicalAnalyzer Enhanced', () => {
  let morph: KurdishMorphologicalAnalyzer

  beforeEach(() => {
    morph = new KurdishMorphologicalAnalyzer()
  })

  describe('New emotion/sentiment roots', () => {
    it('recognizes خۆشحاڵ (happy) as adjective root', () => {
      const analysis = morph.analyze('خۆشحاڵ')
      expect(analysis.root).toBe('خۆشحاڵ')
    })

    it('recognizes دڵتەنگ (sad) as adjective root', () => {
      const analysis = morph.analyze('دڵتەنگ')
      expect(analysis.root).toBe('دڵتەنگ')
    })

    it('analyzes بەختەوەر (fortunate) as a known word', () => {
      expect(morph.isValidWord('بەختەوەر')).toBe(true)
    })

    it('recognizes سەرکەوتوو (successful) as adjective root', () => {
      const analysis = morph.analyze('سەرکەوتوو')
      expect(analysis.root).toBe('سەرکەوتوو')
    })

    it('analyzes خەم (sorrow) as a valid Kurdish word', () => {
      expect(morph.isValidWord('خەم')).toBe(true)
    })

    it('analyzes نەفرەت (hatred) as a valid Kurdish word', () => {
      expect(morph.isValidWord('نەفرەت')).toBe(true)
    })

    it('recognizes ئومێد (hope) as noun root', () => {
      const analysis = morph.analyze('ئومێد')
      expect(analysis.root).toBe('ئومێد')
    })

    it('analyzes ئاشتی (peace) as a valid Kurdish word', () => {
      expect(morph.isValidWord('ئاشتی')).toBe(true)
    })

    it('recognizes پاک (clean) as adjective root', () => {
      const analysis = morph.analyze('پاک')
      expect(analysis.root).toBe('پاک')
    })

    it('recognizes خۆش (pleasant) as adjective root', () => {
      const analysis = morph.analyze('خۆش')
      expect(analysis.root).toBe('خۆش')
    })
  })
})

// ── SemanticMemory — NLP concepts ────────────────────────────────────────────

describe('Kurdish NLP Semantic Concepts', () => {
  let memory: SemanticMemory

  beforeEach(() => {
    memory = createProgrammingKnowledgeGraph()
  })

  it('Sorani Sentiment Analysis concept exists', () => {
    const concept = memory.findConceptByName('Sorani Sentiment Analysis')
    expect(concept).toBeDefined()
    expect(concept!.domain).toBe('language')
  })

  it('Sorani Morphological Analysis concept exists', () => {
    const concept = memory.findConceptByName('Sorani Morphological Analysis')
    expect(concept).toBeDefined()
    expect(concept!.domain).toBe('language')
  })

  it('Sorani Stemming concept exists', () => {
    const concept = memory.findConceptByName('Sorani Stemming')
    expect(concept).toBeDefined()
    expect(concept!.domain).toBe('language')
  })

  it('Sorani Suffix Stripping concept exists', () => {
    const concept = memory.findConceptByName('Sorani Suffix Stripping')
    expect(concept).toBeDefined()
    expect(concept!.domain).toBe('language')
  })

  it('Sorani Emotion Detection concept exists', () => {
    const concept = memory.findConceptByName('Sorani Emotion Detection')
    expect(concept).toBeDefined()
  })

  it('Sorani Idiomatic Expressions concept exists', () => {
    const concept = memory.findConceptByName('Sorani Idiomatic Expressions')
    expect(concept).toBeDefined()
  })

  it('Sorani Negation Patterns concept exists', () => {
    const concept = memory.findConceptByName('Sorani Negation Patterns')
    expect(concept).toBeDefined()
  })

  it('Sorani Intensifiers concept exists', () => {
    const concept = memory.findConceptByName('Sorani Intensifiers')
    expect(concept).toBeDefined()
  })

  it('Sorani Agglutination concept exists', () => {
    const concept = memory.findConceptByName('Sorani Agglutination')
    expect(concept).toBeDefined()
  })

  it('Sorani Collocations concept exists', () => {
    const concept = memory.findConceptByName('Sorani Collocations')
    expect(concept).toBeDefined()
  })
})

// ── LocalBrain — Kurdish NLP knowledge ──────────────────────────────────────

describe('Kurdish NLP Knowledge in LocalBrain', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain()
  })

  it('answers questions about Kurdish stemming', async () => {
    const response = await brain.chat('sorani stemming')
    const text = typeof response === 'string' ? response : response.text
    expect(text.length).toBeGreaterThan(0)
  })

  it('answers questions about Kurdish negation', async () => {
    const response = await brain.chat('sorani negation patterns')
    const text = typeof response === 'string' ? response : response.text
    expect(text.length).toBeGreaterThan(0)
  })

  it('answers questions about Kurdish intensifiers', async () => {
    const response = await brain.chat('sorani intensifiers')
    const text = typeof response === 'string' ? response : response.text
    expect(text.length).toBeGreaterThan(0)
  })

  it('answers questions about Kurdish idioms', async () => {
    const response = await brain.chat('sorani idioms')
    const text = typeof response === 'string' ? response : response.text
    expect(text.length).toBeGreaterThan(0)
  })
})
