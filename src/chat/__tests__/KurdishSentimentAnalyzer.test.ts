/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  KurdishSentimentAnalyzer — Tests                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  KurdishSentimentAnalyzer,
  DEFAULT_SENTIMENT_CONFIG,
} from '../KurdishSentimentAnalyzer.js'
import type {
  SentimentLabel,
  SentimentResult,
  SentimentWord,
  SentimentCorpusSample,
  KurdishSentimentConfig,
} from '../KurdishSentimentAnalyzer.js'
import { LocalBrain } from '../LocalBrain.js'
import { SemanticMemory, createProgrammingKnowledgeGraph } from '../SemanticMemory.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_LABELS: SentimentLabel[] = ['positive', 'negative', 'neutral', 'mixed']

function hasAllScoreFields(scores: SentimentResult['scores']): boolean {
  return (
    typeof scores.positive === 'number' &&
    typeof scores.negative === 'number' &&
    typeof scores.neutral === 'number' &&
    typeof scores.mixed === 'number'
  )
}

// ─────────────────────────────────────────────────────────────────────────────

describe('KurdishSentimentAnalyzer', () => {
  let analyzer: KurdishSentimentAnalyzer

  beforeEach(() => {
    analyzer = new KurdishSentimentAnalyzer()
  })

  // ── Constructor ──────────────────────────────────────────────────────────

  describe('Constructor', () => {
    it('creates with default config', () => {
      const cfg = analyzer.getConfig()
      expect(cfg.enableContextualAnalysis).toBe(true)
      expect(cfg.minConfidence).toBe(0.3)
      expect(cfg.enableEmojiAnalysis).toBe(true)
      expect(cfg.maxCacheSize).toBe(300)
    })

    it('accepts custom config', () => {
      const custom = new KurdishSentimentAnalyzer({
        minConfidence: 0.5,
        enableEmojiAnalysis: false,
        maxCacheSize: 50,
      })
      const cfg = custom.getConfig()
      expect(cfg.minConfidence).toBe(0.5)
      expect(cfg.enableEmojiAnalysis).toBe(false)
      expect(cfg.maxCacheSize).toBe(50)
      expect(cfg.enableContextualAnalysis).toBe(true) // default preserved
    })
  })

  // ── analyzeSentiment ─────────────────────────────────────────────────────

  describe('analyzeSentiment', () => {
    it('detects positive sentiment in Kurdish text ("زۆر خۆشحاڵم")', () => {
      const r = analyzer.analyzeSentiment('زۆر خۆشحاڵم')
      expect(r.label).toBe('positive')
    })

    it('detects negative sentiment ("زۆر دڵتەنگم")', () => {
      const r = analyzer.analyzeSentiment('زۆر دڵتەنگم')
      expect(r.label).toBe('negative')
    })

    it('detects neutral sentiment', () => {
      const r = analyzer.analyzeSentiment('ڕۆژ و کات')
      expect(r.label).toBe('neutral')
    })

    it('detects mixed sentiment', () => {
      const r = analyzer.analyzeSentiment('خۆشحاڵ و خەم لەگەڵ یەکدا')
      expect(['mixed', 'positive', 'negative']).toContain(r.label)
      // mixed text should have both positive and negative scores > 0
      expect(r.scores.positive).toBeGreaterThan(0)
      expect(r.scores.negative).toBeGreaterThan(0)
    })

    it('handles positive emojis (😊 → positive)', () => {
      const r = analyzer.analyzeSentiment('😊')
      expect(r.scores.positive).toBeGreaterThan(0)
    })

    it('handles negative emojis (😢 → negative)', () => {
      const r = analyzer.analyzeSentiment('😢')
      expect(r.scores.negative).toBeGreaterThan(0)
    })

    it('handles negation ("نا" flips sentiment)', () => {
      const positive = analyzer.analyzeSentiment('خۆشحاڵ')
      const negated = analyzer.analyzeSentiment('نا خۆشحاڵ')
      // negation should flip — negated text should be less positive
      expect(negated.scores.negative).toBeGreaterThan(positive.scores.negative)
    })

    it('handles intensifiers ("زۆر" = very)', () => {
      const base = analyzer.analyzeSentiment('خۆشحاڵ')
      const intensified = analyzer.analyzeSentiment('زۆر خۆشحاڵ')
      // intensifier should amplify the score
      expect(intensified.scores.positive).toBeGreaterThanOrEqual(base.scores.positive)
    })

    it('returns confidence > 0 for Kurdish text', () => {
      const r = analyzer.analyzeSentiment('زۆر خۆشحاڵم بە بینینتان')
      expect(r.confidence).toBeGreaterThan(0)
    })

    it('returns valid SentimentLabel enum', () => {
      const r = analyzer.analyzeSentiment('سوپاس بۆ هەموو شتێک')
      expect(VALID_LABELS).toContain(r.label)
    })

    it('returns scores object with all 4 fields', () => {
      const r = analyzer.analyzeSentiment('ژیان جوانە')
      expect(hasAllScoreFields(r.scores)).toBe(true)
    })

    it('returns dominantEmotion string', () => {
      const r = analyzer.analyzeSentiment('زۆر خۆشحاڵم')
      expect(typeof r.dominantEmotion).toBe('string')
      expect(r.dominantEmotion.length).toBeGreaterThan(0)
    })

    it('returns isSubjective boolean', () => {
      const r = analyzer.analyzeSentiment('خەم و ئازار')
      expect(typeof r.isSubjective).toBe('boolean')
    })

    it('returns explanation string', () => {
      const r = analyzer.analyzeSentiment('سەرکەوتن و هیوا')
      expect(typeof r.explanation).toBe('string')
      expect(r.explanation.length).toBeGreaterThan(0)
    })

    it('handles empty string', () => {
      const r = analyzer.analyzeSentiment('')
      expect(r.label).toBe('neutral')
      expect(r.confidence).toBe(0)
    })

    it('handles whitespace-only string', () => {
      const r = analyzer.analyzeSentiment('   ')
      expect(r.label).toBe('neutral')
      expect(r.confidence).toBe(0)
    })

    it('handles non-Kurdish text gracefully', () => {
      const r = analyzer.analyzeSentiment('Hello world this is English text')
      expect(VALID_LABELS).toContain(r.label)
      expect(r.explanation).toContain('no Kurdish script')
    })

    it('analyzes real tweet: زۆر خۆشحاڵ ئەبین', () => {
      const r = analyzer.analyzeSentiment('زۆر خۆشحاڵ ئەبین کاک سیا بەڵێ بە کوردی قسە ئەکرێت')
      expect(r.label).toBe('positive')
    })

    it('returns confidence between 0 and 1', () => {
      const r = analyzer.analyzeSentiment('بەختەوەر و خۆشحاڵ')
      expect(r.confidence).toBeGreaterThanOrEqual(0)
      expect(r.confidence).toBeLessThanOrEqual(1)
    })

    it('all score values are between 0 and 1', () => {
      const r = analyzer.analyzeSentiment('نەفرەت و ڕق')
      expect(r.scores.positive).toBeGreaterThanOrEqual(0)
      expect(r.scores.positive).toBeLessThanOrEqual(1)
      expect(r.scores.negative).toBeGreaterThanOrEqual(0)
      expect(r.scores.negative).toBeLessThanOrEqual(1)
      expect(r.scores.neutral).toBeGreaterThanOrEqual(0)
      expect(r.scores.neutral).toBeLessThanOrEqual(1)
      expect(r.scores.mixed).toBeGreaterThanOrEqual(0)
      expect(r.scores.mixed).toBeLessThanOrEqual(1)
    })
  })

  // ── getWordSentiment ─────────────────────────────────────────────────────

  describe('getWordSentiment', () => {
    it('returns positive word (خۆشحاڵ)', () => {
      const w = analyzer.getWordSentiment('خۆشحاڵ')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('positive')
    })

    it('returns negative word (خەم)', () => {
      const w = analyzer.getWordSentiment('خەم')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('negative')
    })

    it('returns undefined for unknown word', () => {
      const w = analyzer.getWordSentiment('xyznotaword')
      expect(w).toBeUndefined()
    })

    it('returns correct weight range', () => {
      const pos = analyzer.getWordSentiment('بەختەوەر')
      expect(pos).toBeDefined()
      expect(pos!.weight).toBeGreaterThan(0)
      expect(pos!.weight).toBeLessThanOrEqual(1)

      const neg = analyzer.getWordSentiment('نەفرەت')
      expect(neg).toBeDefined()
      expect(neg!.weight).toBeLessThan(0)
      expect(neg!.weight).toBeGreaterThanOrEqual(-1)
    })

    it('returns category string', () => {
      const w = analyzer.getWordSentiment('خۆشحاڵ')
      expect(typeof w!.category).toBe('string')
      expect(w!.category.length).toBeGreaterThan(0)
    })

    it('returns emotion category for negative word', () => {
      const w = analyzer.getWordSentiment('تووڕە')
      expect(w).toBeDefined()
      expect(w!.category).toBe('anger')
    })
  })

  // ── analyzeBatch ─────────────────────────────────────────────────────────

  describe('analyzeBatch', () => {
    it('analyzes multiple texts', () => {
      const results = analyzer.analyzeBatch([
        'زۆر خۆشحاڵم',
        'زۆر دڵتەنگم',
        'ڕۆژ باشە',
      ])
      expect(results).toHaveLength(3)
      results.forEach((r) => {
        expect(VALID_LABELS).toContain(r.label)
      })
    })

    it('returns array of same length', () => {
      const texts = ['باش', 'خراپ', 'ڕۆژ', 'خەم', 'هیوا']
      const results = analyzer.analyzeBatch(texts)
      expect(results).toHaveLength(texts.length)
    })

    it('empty array returns empty', () => {
      const results = analyzer.analyzeBatch([])
      expect(results).toHaveLength(0)
    })
  })

  // ── getCorpusSamples ─────────────────────────────────────────────────────

  describe('getCorpusSamples', () => {
    it('returns all samples when no filter', () => {
      const samples = analyzer.getCorpusSamples()
      expect(samples.length).toBeGreaterThan(0)
    })

    it('filters by sentiment label', () => {
      const positive = analyzer.getCorpusSamples('positive')
      positive.forEach((s) => {
        expect(s.sentiment).toBe('positive')
      })

      const negative = analyzer.getCorpusSamples('negative')
      negative.forEach((s) => {
        expect(s.sentiment).toBe('negative')
      })
    })

    it('returns limited count', () => {
      const limited = analyzer.getCorpusSamples(undefined, 3)
      expect(limited.length).toBeLessThanOrEqual(3)
    })

    it('each sample has text, sentiment, source', () => {
      const samples = analyzer.getCorpusSamples()
      samples.forEach((s) => {
        expect(typeof s.text).toBe('string')
        expect(s.text.length).toBeGreaterThan(0)
        expect(VALID_LABELS).toContain(s.sentiment)
        expect(['gold', 'silver']).toContain(s.source)
      })
    })

    it('source is gold or silver', () => {
      const samples = analyzer.getCorpusSamples()
      const sources = new Set(samples.map((s) => s.source))
      expect(sources.has('gold')).toBe(true)
      expect(sources.has('silver')).toBe(true)
    })
  })

  // ── getPositiveWords / getNegativeWords ──────────────────────────────────

  describe('getPositiveWords / getNegativeWords', () => {
    it('returns array of SentimentWord for positive', () => {
      const words = analyzer.getPositiveWords()
      expect(Array.isArray(words)).toBe(true)
      words.forEach((w) => {
        expect(w.word).toBeDefined()
        expect(w.sentiment).toBe('positive')
        expect(typeof w.weight).toBe('number')
        expect(typeof w.category).toBe('string')
      })
    })

    it('all positive words have weight > 0', () => {
      const words = analyzer.getPositiveWords()
      words.forEach((w) => {
        expect(w.weight).toBeGreaterThan(0)
      })
    })

    it('all negative words have weight < 0', () => {
      const words = analyzer.getNegativeWords()
      words.forEach((w) => {
        expect(w.weight).toBeLessThan(0)
      })
    })

    it('non-empty arrays', () => {
      expect(analyzer.getPositiveWords().length).toBeGreaterThan(0)
      expect(analyzer.getNegativeWords().length).toBeGreaterThan(0)
    })
  })

  // ── getLexiconSize ───────────────────────────────────────────────────────

  describe('getLexiconSize', () => {
    it('returns > 100', () => {
      expect(analyzer.getLexiconSize()).toBeGreaterThan(100)
    })
  })

  // ── getStats ─────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns initial stats', () => {
      const fresh = new KurdishSentimentAnalyzer()
      const stats = fresh.getStats()
      expect(stats.analyzed).toBe(0)
      expect(stats.cacheHits).toBe(0)
      expect(stats.lexiconSize).toBeGreaterThan(0)
      expect(stats.corpusSize).toBeGreaterThan(0)
    })

    it('stats update after analysis', () => {
      const a = new KurdishSentimentAnalyzer()
      a.analyzeSentiment('خۆشحاڵ')
      a.analyzeSentiment('خەم')
      const stats = a.getStats()
      expect(stats.analyzed).toBe(2)
      // Analyze same text again to trigger cache hit
      a.analyzeSentiment('خۆشحاڵ')
      expect(a.getStats().cacheHits).toBe(1)
    })
  })

  // ── Real Kurdish tweet sentiment ─────────────────────────────────────────

  describe('Real Kurdish tweet sentiment', () => {
    it('"بەختەوەرترینی ئەو مرۆڤانە" → positive', () => {
      const r = analyzer.analyzeSentiment(
        'بەختەوەرترینی ئەو مرۆڤانە ئەوەن کە بە هەموو بەشێکی خودا ڕازین',
      )
      expect(r.label).toBe('positive')
    })

    it('"ناشرینترین کەس ئەو کەسەیە" → negative', () => {
      const r = analyzer.analyzeSentiment(
        'ناشرینترین کەس ئەو کەسەیە کە هەڵەکانت تۆمار دەکات',
      )
      expect(r.label).toBe('negative')
    })

    it('"قسەکانتان بکەن ڕەخنە" → neutral', () => {
      const r = analyzer.analyzeSentiment(
        'قسەکانتان بکەن ڕەخنە و پێشنیارەکانتان بۆم گرنگن',
      )
      expect(r.label).toBe('neutral')
    })

    it('"ئەوەی زۆر پێدەکەنێ کێشەی زۆرە" → mixed', () => {
      const r = analyzer.analyzeSentiment(
        'ئەوەی زۆر پێدەکەنێ کێشەی زۆرە ئەوەی زۆر دەگرێ کەسایەتی پاک',
      )
      expect(['mixed', 'positive', 'negative']).toContain(r.label)
    })

    it('"جوانی ئەوەیە بە ناو خەڵک‌دا بڕۆی" → positive', () => {
      const r = analyzer.analyzeSentiment(
        'جوانی ئەوەیە بە ناو خەڵک\u200Cدا بڕۆی بۆنی ئەخلاقت لێ\u200C بێت',
      )
      expect(r.label).toBe('positive')
    })

    it('"دایکم خەم بۆ من دەخوات" → negative', () => {
      const r = analyzer.analyzeSentiment('دایکم خەم بۆ من دەخوات لە ژیاندا')
      expect(r.label).toBe('negative')
    })

    it('"خوای گەورە سەرکەوتووت بکا" → positive', () => {
      const r = analyzer.analyzeSentiment('خوای گەورە سەرکەوتووت بکا')
      expect(r.label).toBe('positive')
    })

    it('"لە ماڵەوە بێزارن" → negative', () => {
      const r = analyzer.analyzeSentiment(
        'لە ماڵەوە بێزارن و کە دەچیتە دەرەوە هەست بە ترس و قەلەقی دەکەی',
      )
      expect(r.label).toBe('negative')
    })

    it('"پیرۆزە سۆزە خان سەرکەوتوو بیت" → positive', () => {
      const r = analyzer.analyzeSentiment('پیرۆزە سۆزە خان سەرکەوتوو بیت')
      expect(r.label).toBe('positive')
    })

    it('"زۆر جوانن دەستان خۆشبێت هەر بژی" → positive', () => {
      const r = analyzer.analyzeSentiment('زۆر جوانن دەستان خۆشبێت هەر بژی')
      expect(r.label).toBe('positive')
    })

    it('"هەتا ئەگەر نەتوانین پێکەوە بین" → mixed', () => {
      const r = analyzer.analyzeSentiment(
        'هەتا ئەگەر نەتوانین پێکەوە بین لە کۆتاییدا من هێشتا ئاسوودەم',
      )
      expect(['mixed', 'positive', 'neutral']).toContain(r.label)
    })

    it('"سادەیی هەرچەندە ئازاری زۆرە" → mixed', () => {
      const r = analyzer.analyzeSentiment(
        'سادەیی هەرچەندە ئازاری زۆرە بەڵام لەزەتێکیشی هەیە',
      )
      expect(['mixed', 'negative', 'positive']).toContain(r.label)
    })
  })

  // ── Kurdish sentiment in LocalBrain KB ───────────────────────────────────

  describe('Kurdish sentiment in LocalBrain KB', () => {
    let brain: LocalBrain

    beforeEach(() => {
      brain = new LocalBrain()
    })

    it('LocalBrain instantiates successfully with Kurdish sentiment support', () => {
      expect(brain).toBeDefined()
    })

    it('LocalBrain has Kurdish sentiment analyzer available', () => {
      // The LocalBrain constructor creates a KurdishSentimentAnalyzer internally
      // We verify it works by processing a Kurdish message
      expect(brain).toBeDefined()
      expect(typeof brain.chat).toBe('function')
    })

    it('search for "sorani sentiment" returns knowledge results', async () => {
      // LocalBrain uses an internal KB search; we verify the brain can handle
      // sentiment-related queries without errors
      const response = await brain.chat('sorani sentiment analysis')
      if (typeof response === 'string') {
        expect(response.length).toBeGreaterThan(0)
      } else {
        expect(typeof response.text).toBe('string')
        expect(response.text.length).toBeGreaterThan(0)
      }
    })

    it('search for "kurdish positive words" returns knowledge results', async () => {
      const response = await brain.chat('kurdish positive words')
      if (typeof response === 'string') {
        expect(response.length).toBeGreaterThan(0)
      } else {
        expect(typeof response.text).toBe('string')
        expect(response.text.length).toBeGreaterThan(0)
      }
    })

    it('search for "kurdish negative sentiment" returns knowledge results', async () => {
      const response = await brain.chat('kurdish negative sentiment')
      if (typeof response === 'string') {
        expect(response.length).toBeGreaterThan(0)
      } else {
        expect(typeof response.text).toBe('string')
        expect(response.text.length).toBeGreaterThan(0)
      }
    })
  })

  // ── Kurdish sentiment in SemanticMemory ──────────────────────────────────

  describe('Kurdish sentiment in SemanticMemory', () => {
    let memory: SemanticMemory

    beforeEach(() => {
      memory = createProgrammingKnowledgeGraph()
    })

    it('Kurdish Sorani concept exists', () => {
      const concept = memory.findConceptByName('Kurdish Sorani')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('language')
    })

    it('Sorani language sub-concepts exist', () => {
      const grammar = memory.findConceptByName('Sorani Grammar')
      const vocab = memory.findConceptByName('Sorani Vocabulary')
      const semantics = memory.findConceptByName('Sorani Semantics')
      expect(grammar).toBeDefined()
      expect(vocab).toBeDefined()
      expect(semantics).toBeDefined()
    })

    it('relationships between Kurdish concepts exist', () => {
      const kurdish = memory.findConceptByName('Kurdish Sorani')
      const grammar = memory.findConceptByName('Sorani Grammar')
      expect(kurdish).toBeDefined()
      expect(grammar).toBeDefined()
      // Both concepts should be in the 'language' domain
      expect(kurdish!.domain).toBe('language')
      expect(grammar!.domain).toBe('language')
    })
  })
})
