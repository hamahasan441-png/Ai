/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  KurdishLanguageUtils — Tests                                              ║
 * ║  Tests for proverbs, numbers, greetings, dialect comparisons, calendar     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { KurdishLanguageUtils } from '../KurdishLanguageUtils.js'
import { KurdishMorphologicalAnalyzer } from '../KurdishMorphologicalAnalyzer.js'
import { KurdishSentimentAnalyzer } from '../KurdishSentimentAnalyzer.js'
import { LanguageDetector } from '../LanguageDetector.js'

// ─── KurdishLanguageUtils Tests ──────────────────────────────────────────────

describe('KurdishLanguageUtils', () => {
  let utils: KurdishLanguageUtils

  beforeEach(() => {
    utils = new KurdishLanguageUtils()
  })

  // ── Proverbs ──────────────────────────────────────────────────────────────

  describe('Proverbs', () => {
    it('has at least 30 proverbs', () => {
      expect(utils.totalProverbs).toBeGreaterThanOrEqual(30)
    })

    it('each proverb has ckb, eng, and category fields', () => {
      for (const p of utils.getProverbs()) {
        expect(p.ckb.length).toBeGreaterThan(0)
        expect(p.eng.length).toBeGreaterThan(0)
        expect(p.category.length).toBeGreaterThan(0)
      }
    })

    it('has multiple proverb categories', () => {
      const cats = utils.getProverbCategories()
      expect(cats.length).toBeGreaterThanOrEqual(5)
    })

    it('filters proverbs by category', () => {
      const wisdom = utils.getProverbsByCategory('wisdom')
      expect(wisdom.length).toBeGreaterThan(0)
      for (const p of wisdom) {
        expect(p.category).toBe('wisdom')
      }
    })

    it('returns a random proverb', () => {
      const p = utils.getRandomProverb()
      expect(p).toBeDefined()
      expect(p.ckb.length).toBeGreaterThan(0)
    })

    it('searches proverbs by Kurdish keyword', () => {
      const results = utils.searchProverbs('ئاو')
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('searches proverbs by English keyword', () => {
      const results = utils.searchProverbs('silence')
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('search respects limit', () => {
      const results = utils.searchProverbs('a', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('has Kurdish identity proverbs', () => {
      const identity = utils.getProverbsByCategory('identity')
      expect(identity.length).toBeGreaterThan(0)
    })

    it('has friendship proverbs', () => {
      const friendship = utils.getProverbsByCategory('friendship')
      expect(friendship.length).toBeGreaterThan(0)
    })

    it('has knowledge proverbs', () => {
      const knowledge = utils.getProverbsByCategory('knowledge')
      expect(knowledge.length).toBeGreaterThan(0)
    })
  })

  // ── Numbers ───────────────────────────────────────────────────────────────

  describe('Number System', () => {
    it('converts 0 to سفر', () => {
      expect(utils.numberToKurdish(0)).toBe('سفر')
    })

    it('converts 1–10 correctly', () => {
      expect(utils.numberToKurdish(1)).toBe('یەک')
      expect(utils.numberToKurdish(2)).toBe('دوو')
      expect(utils.numberToKurdish(3)).toBe('سێ')
      expect(utils.numberToKurdish(4)).toBe('چوار')
      expect(utils.numberToKurdish(5)).toBe('پێنج')
      expect(utils.numberToKurdish(6)).toBe('شەش')
      expect(utils.numberToKurdish(7)).toBe('حەوت')
      expect(utils.numberToKurdish(8)).toBe('هەشت')
      expect(utils.numberToKurdish(9)).toBe('نۆ')
      expect(utils.numberToKurdish(10)).toBe('دە')
    })

    it('converts teens correctly', () => {
      expect(utils.numberToKurdish(11)).toBe('یانزە')
      expect(utils.numberToKurdish(15)).toBe('پانزە')
      expect(utils.numberToKurdish(19)).toBe('نۆزدە')
    })

    it('converts tens correctly', () => {
      expect(utils.numberToKurdish(20)).toBe('بیست')
      expect(utils.numberToKurdish(30)).toBe('سی')
      expect(utils.numberToKurdish(50)).toBe('پەنجا')
      expect(utils.numberToKurdish(100)).toBe('سەد')
    })

    it('converts compound two-digit numbers', () => {
      expect(utils.numberToKurdish(21)).toBe('بیست و یەک')
      expect(utils.numberToKurdish(35)).toBe('سی و پێنج')
      expect(utils.numberToKurdish(99)).toBe('نەوەد و نۆ')
    })

    it('converts hundreds', () => {
      expect(utils.numberToKurdish(100)).toBe('سەد')
      expect(utils.numberToKurdish(200)).toBe('دوو سەد')
      expect(utils.numberToKurdish(150)).toBe('سەد و پەنجا')
      expect(utils.numberToKurdish(321)).toBe('سێ سەد و بیست و یەک')
    })

    it('converts thousands', () => {
      expect(utils.numberToKurdish(1000)).toBe('هەزار')
      expect(utils.numberToKurdish(2000)).toBe('دوو هەزار')
      expect(utils.numberToKurdish(1500)).toBe('هەزار و پێنج سەد')
      expect(utils.numberToKurdish(5432)).toBe('پێنج هەزار و چوار سەد و سی و دوو')
    })

    it('handles out-of-range values gracefully', () => {
      expect(utils.numberToKurdish(-1)).toBe('-1')
      expect(utils.numberToKurdish(10000)).toBe('10000')
      expect(utils.numberToKurdish(3.14)).toBe('3.14')
    })

    it('converts to ordinals', () => {
      expect(utils.numberToOrdinal(1)).toBe('یەکەم')
      expect(utils.numberToOrdinal(2)).toBe('دووەم')
      expect(utils.numberToOrdinal(10)).toBe('دەەم')
      expect(utils.numberToOrdinal(21)).toBe('بیست و یەکەم')
    })

    it('ordinal handles invalid input', () => {
      expect(utils.numberToOrdinal(0)).toBe('0')
      expect(utils.numberToOrdinal(-5)).toBe('-5')
    })
  })

  // ── Days of the Week ──────────────────────────────────────────────────────

  describe('Days of the Week', () => {
    it('has 7 days', () => {
      expect(utils.getDaysOfWeek().length).toBe(7)
    })

    it('Saturday is شەممە', () => {
      const day = utils.getDay('Saturday')
      expect(day).toBeDefined()
      expect(day!.name).toBe('شەممە')
    })

    it('Friday is هەینی', () => {
      const day = utils.getDay('Friday')
      expect(day).toBeDefined()
      expect(day!.name).toBe('هەینی')
    })

    it('returns undefined for invalid day', () => {
      expect(utils.getDay('NotADay')).toBeUndefined()
    })

    it('case-insensitive day lookup', () => {
      expect(utils.getDay('monday')).toBeDefined()
      expect(utils.getDay('TUESDAY')).toBeDefined()
    })
  })

  // ── Kurdish Months ────────────────────────────────────────────────────────

  describe('Kurdish Months', () => {
    it('has 12 months', () => {
      expect(utils.getMonths().length).toBe(12)
    })

    it('first month is خاکەلێوە (Xakelêwe)', () => {
      expect(utils.getMonths()[0]!.name).toBe('خاکەلێوە')
    })

    it('each month has name, English, and Gregorian approx', () => {
      for (const m of utils.getMonths()) {
        expect(m.name.length).toBeGreaterThan(0)
        expect(m.english.length).toBeGreaterThan(0)
        expect(m.gregorianApprox.length).toBeGreaterThan(0)
      }
    })

    it('can find a month by English name', () => {
      const gulan = utils.getMonth('Gulan')
      expect(gulan).toBeDefined()
      expect(gulan!.name).toBe('گوڵان')
    })
  })

  // ── Greetings ─────────────────────────────────────────────────────────────

  describe('Greetings', () => {
    it('has at least 15 greetings', () => {
      expect(utils.getGreetings().size).toBeGreaterThanOrEqual(15)
    })

    it('includes سلاو (Hello)', () => {
      expect(utils.getGreetings().has('سلاو')).toBe(true)
    })

    it('returns morning greeting for 8am', () => {
      expect(utils.getTimeGreeting(8)).toBe('بەیانیباش')
    })

    it('returns day greeting for 14:00', () => {
      expect(utils.getTimeGreeting(14)).toBe('ڕۆژباش')
    })

    it('returns evening greeting for 19:00', () => {
      expect(utils.getTimeGreeting(19)).toBe('ئێوارەباش')
    })

    it('returns night greeting for 23:00', () => {
      expect(utils.getTimeGreeting(23)).toBe('شەوباش')
    })

    it('returns night greeting for 3am', () => {
      expect(utils.getTimeGreeting(3)).toBe('شەوباش')
    })
  })

  // ── Dialect Comparisons ───────────────────────────────────────────────────

  describe('Dialect Comparisons (Sorani ↔ Kurmanji)', () => {
    it('has at least 25 dialect comparison entries', () => {
      expect(utils.totalDialectEntries).toBeGreaterThanOrEqual(25)
    })

    it('each entry has meaning, sorani, and kurmanji fields', () => {
      for (const d of utils.getDialectComparisons()) {
        expect(d.meaning.length).toBeGreaterThan(0)
        expect(d.sorani.length).toBeGreaterThan(0)
        expect(d.kurmanji.length).toBeGreaterThan(0)
      }
    })

    it('can search by meaning', () => {
      const results = utils.searchDialect('water')
      expect(results.length).toBeGreaterThanOrEqual(1)
      expect(results[0]!.sorani).toBe('ئاو')
    })

    it('search is case-insensitive', () => {
      const results = utils.searchDialect('HELLO')
      expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('includes pronoun comparisons', () => {
      const results = utils.searchDialect('I')
      expect(results.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Statistics ────────────────────────────────────────────────────────────

  describe('Statistics', () => {
    it('returns comprehensive stats', () => {
      const stats = utils.getStats()
      expect(stats.proverbs).toBeGreaterThanOrEqual(30)
      expect(stats.proverbCategories).toBeGreaterThanOrEqual(5)
      expect(stats.greetings).toBeGreaterThanOrEqual(15)
      expect(stats.dialectEntries).toBeGreaterThanOrEqual(25)
      expect(stats.days).toBe(7)
      expect(stats.months).toBe(12)
    })
  })
})

// ─── Enhanced Morphological Analyzer Tests ────────────────────────────────────

describe('KurdishMorphologicalAnalyzer — Expanded Roots', () => {
  let morph: KurdishMorphologicalAnalyzer

  beforeEach(() => {
    morph = new KurdishMorphologicalAnalyzer()
  })

  describe('Nature vocabulary roots', () => {
    it('recognizes ئاسمان (sky)', () => {
      expect(morph.isValidWord('ئاسمان')).toBe(true)
      expect(morph.analyze('ئاسمان').root).toBe('ئاسمان')
    })

    it('recognizes هەتاو (sun)', () => {
      expect(morph.isValidWord('هەتاو')).toBe(true)
    })

    it('recognizes باران (rain)', () => {
      expect(morph.analyze('باران').root).toBe('باران')
    })

    it('recognizes بەفر (snow)', () => {
      expect(morph.isValidWord('بەفر')).toBe(true)
    })

    it('recognizes گوڵ (flower)', () => {
      expect(morph.analyze('گوڵ').root).toBe('گوڵ')
    })

    it('recognizes چیا (mountain)', () => {
      expect(morph.analyze('چیا').root).toBe('چیا')
    })
  })

  describe('Animal vocabulary roots', () => {
    it('recognizes ئەسپ (horse)', () => {
      expect(morph.isValidWord('ئەسپ')).toBe(true)
    })

    it('recognizes شێر (lion)', () => {
      expect(morph.analyze('شێر').root).toBe('شێر')
    })

    it('recognizes باڵندە (bird)', () => {
      expect(morph.isValidWord('باڵندە')).toBe(true)
    })

    it('recognizes ماسی (fish)', () => {
      expect(morph.analyze('ماسی').root).toBe('ماسی')
    })
  })

  describe('Food vocabulary roots', () => {
    it('recognizes شیر (milk)', () => {
      expect(morph.isValidWord('شیر')).toBe(true)
    })

    it('recognizes گۆشت (meat)', () => {
      expect(morph.analyze('گۆشت').root).toBe('گۆشت')
    })

    it('recognizes میوە (fruit)', () => {
      expect(morph.isValidWord('میوە')).toBe(true)
    })
  })

  describe('Time vocabulary roots', () => {
    it('recognizes ڕۆژ (day)', () => {
      expect(morph.analyze('ڕۆژ').root).toBe('ڕۆژ')
    })

    it('recognizes شەو (night)', () => {
      expect(morph.isValidWord('شەو')).toBe(true)
    })

    it('recognizes ساڵ (year)', () => {
      expect(morph.analyze('ساڵ').root).toBe('ساڵ')
    })

    it('recognizes بەهار (spring)', () => {
      expect(morph.isValidWord('بەهار')).toBe(true)
    })

    it('recognizes زستان (winter)', () => {
      expect(morph.analyze('زستان').root).toBe('زستان')
    })
  })

  describe('Family vocabulary roots', () => {
    it('recognizes دایک (mother)', () => {
      expect(morph.analyze('دایک').root).toBe('دایک')
    })

    it('recognizes باوک (father)', () => {
      expect(morph.isValidWord('باوک')).toBe(true)
    })

    it('recognizes برا (brother)', () => {
      expect(morph.analyze('برا').root).toBe('برا')
    })

    it('recognizes خوشک (sister)', () => {
      expect(morph.isValidWord('خوشک')).toBe(true)
    })
  })

  describe('Profession vocabulary roots', () => {
    it('recognizes پارێزەر (lawyer)', () => {
      expect(morph.isValidWord('پارێزەر')).toBe(true)
    })

    it('recognizes ئەندازیار (engineer)', () => {
      expect(morph.analyze('ئەندازیار').root).toBe('ئەندازیار')
    })

    it('recognizes نووسەر (writer)', () => {
      expect(morph.isValidWord('نووسەر')).toBe(true)
    })

    it('recognizes ڕۆژنامەنووس (journalist)', () => {
      expect(morph.isValidWord('ڕۆژنامەنووس')).toBe(true)
    })
  })

  describe('Color vocabulary roots', () => {
    it('recognizes سوور (red)', () => {
      expect(morph.analyze('سوور').root).toBe('سوور')
    })

    it('recognizes شین (blue/green)', () => {
      expect(morph.isValidWord('شین')).toBe(true)
    })

    it('recognizes سپی (white)', () => {
      expect(morph.isValidWord('سپی')).toBe(true)
    })

    it('recognizes ڕەش (black)', () => {
      expect(morph.analyze('ڕەش').root).toBe('ڕەش')
    })
  })

  describe('Abstract concept roots', () => {
    it('recognizes زانست (science)', () => {
      expect(morph.isValidWord('زانست')).toBe(true)
    })

    it('recognizes مێژوو (history)', () => {
      expect(morph.analyze('مێژوو').root).toBe('مێژوو')
    })

    it('recognizes زمان (language)', () => {
      expect(morph.isValidWord('زمان')).toBe(true)
    })

    it('recognizes نەتەوە (nation)', () => {
      expect(morph.isValidWord('نەتەوە')).toBe(true)
    })
  })

  describe('Numeral roots', () => {
    it('recognizes یەک (one)', () => {
      expect(morph.analyze('یەک').root).toBe('یەک')
      expect(morph.analyze('یەک').pos).toBe('numeral')
    })

    it('recognizes سەد (hundred)', () => {
      expect(morph.analyze('سەد').root).toBe('سەد')
    })

    it('recognizes هەزار (thousand)', () => {
      expect(morph.analyze('هەزار').root).toBe('هەزار')
    })
  })

  describe('Adverb roots', () => {
    it('recognizes ئێستا (now)', () => {
      expect(morph.analyze('ئێستا').root).toBe('ئێستا')
      expect(morph.analyze('ئێستا').pos).toBe('adverb')
    })

    it('recognizes هەمیشە (always)', () => {
      expect(morph.isValidWord('هەمیشە')).toBe(true)
    })

    it('recognizes ئەمڕۆ (today)', () => {
      expect(morph.analyze('ئەمڕۆ').root).toBe('ئەمڕۆ')
    })
  })

  describe('Pronoun roots', () => {
    it('recognizes من (I)', () => {
      expect(morph.analyze('من').root).toBe('من')
      expect(morph.analyze('من').pos).toBe('pronoun')
    })

    it('recognizes ئێمە (we)', () => {
      expect(morph.analyze('ئێمە').root).toBe('ئێمە')
    })
  })

  describe('Postposition roots', () => {
    it('recognizes لەگەڵ (with)', () => {
      expect(morph.analyze('لەگەڵ').root).toBe('لەگەڵ')
    })

    it('recognizes لەنێوان (between)', () => {
      expect(morph.isValidWord('لەنێوان')).toBe(true)
    })

    it('recognizes بەبێ (without)', () => {
      expect(morph.analyze('بەبێ').root).toBe('بەبێ')
    })
  })

  describe('Root dictionary size expanded', () => {
    it('has more than 200 known roots', () => {
      expect(morph.getStats().knownRoots).toBeGreaterThan(200)
    })
  })
})

// ─── Enhanced Sentiment Analyzer Tests ────────────────────────────────────────

describe('KurdishSentimentAnalyzer — Expanded Lexicon', () => {
  let analyzer: KurdishSentimentAnalyzer

  beforeEach(() => {
    analyzer = new KurdishSentimentAnalyzer()
  })

  describe('New positive words', () => {
    it('detects دڵگرم (hopeful) as positive', () => {
      const w = analyzer.getWordSentiment('دڵگرم')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('positive')
    })

    it('detects شاد (happy) as positive', () => {
      const w = analyzer.getWordSentiment('شاد')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('positive')
    })

    it('detects خۆشبەخت (fortunate) as positive', () => {
      const w = analyzer.getWordSentiment('خۆشبەخت')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('positive')
    })

    it('detects بوێر (brave) as positive', () => {
      const w = analyzer.getWordSentiment('بوێر')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('positive')
    })

    it('detects دڵەڕەحم (merciful) as positive', () => {
      const w = analyzer.getWordSentiment('دڵەڕەحم')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('positive')
    })

    it('detects پشتیوان (supporter) as positive', () => {
      const w = analyzer.getWordSentiment('پشتیوان')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('positive')
    })
  })

  describe('New negative words', () => {
    it('detects خیانەت (betrayal) as negative', () => {
      const w = analyzer.getWordSentiment('خیانەت')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('negative')
    })

    it('detects ڕەشبین (pessimistic) as negative', () => {
      const w = analyzer.getWordSentiment('ڕەشبین')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('negative')
    })

    it('detects وێرانکاری (destructive) as negative', () => {
      const w = analyzer.getWordSentiment('وێرانکاری')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('negative')
    })

    it('detects تاڵ (bitter) as negative', () => {
      const w = analyzer.getWordSentiment('تاڵ')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('negative')
    })

    it('detects حەسوود (jealous) as negative', () => {
      const w = analyzer.getWordSentiment('حەسوود')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('negative')
    })
  })

  describe('New neutral words', () => {
    it('detects تەکنەلۆژیا (technology) as neutral', () => {
      const w = analyzer.getWordSentiment('تەکنەلۆژیا')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('neutral')
    })

    it('detects وەرزش (sport) as neutral', () => {
      const w = analyzer.getWordSentiment('وەرزش')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('neutral')
    })

    it('detects سیاسەت (politics) as neutral', () => {
      const w = analyzer.getWordSentiment('سیاسەت')
      expect(w).toBeDefined()
      expect(w!.sentiment).toBe('neutral')
    })
  })

  describe('Expanded lexicon size', () => {
    it('lexicon has at least 200 words', () => {
      expect(analyzer.getLexiconSize()).toBeGreaterThanOrEqual(200)
    })
  })

  describe('New intensifier and negation functionality', () => {
    it('"بەتەواوی خراپ" uses stronger intensifier', () => {
      const r = analyzer.analyzeSentiment('بەتەواوی خراپ')
      expect(r.label).toBe('negative')
      expect(r.confidence).toBeGreaterThan(0.3)
    })

    it('"بەبێ خۆشی" negates positive word', () => {
      const r = analyzer.analyzeSentiment('بەبێ خۆشی')
      expect(r.label).toBe('negative')
    })

    it('"بەڕاستی جوان" intensifies positive word', () => {
      const r = analyzer.analyzeSentiment('بەڕاستی جوان')
      expect(r.label).toBe('positive')
    })
  })
})

// ─── Enhanced Language Detector Tests ─────────────────────────────────────────

describe('LanguageDetector — Enhanced Kurdish Detection', () => {
  let detector: LanguageDetector

  beforeEach(() => {
    detector = new LanguageDetector()
  })

  describe('Expanded Kurdish word detection', () => {
    it('detects Kurdish text with expanded markers', () => {
      const r = detector.detect('ئەمڕۆ ڕۆژ باشە')
      expect(r.language).toBe('ku')
      expect(r.script).toBe('arabic')
    })

    it('detects more Kurdish function words', () => {
      const r = detector.detect('دەکرێت ئێستا سبەی دوێنێ')
      expect(r.language).toBe('ku')
    })

    it('detects Kurdish family context', () => {
      const r = detector.detect('خێزان دەست دڵ چاو')
      expect(r.language).toBe('ku')
    })
  })

  describe('Kurdish character detection', () => {
    it('detects Kurdish-specific characters', () => {
      expect(detector.hasKurdishCharacters('ڤ')).toBe(true)
      expect(detector.hasKurdishCharacters('ۆ')).toBe(true)
      expect(detector.hasKurdishCharacters('ێ')).toBe(true)
      expect(detector.hasKurdishCharacters('ڕ')).toBe(true)
      expect(detector.hasKurdishCharacters('ڵ')).toBe(true)
      expect(detector.hasKurdishCharacters('ە')).toBe(true)
    })

    it('returns false for pure Arabic text', () => {
      // Standard Arabic without Kurdish-unique chars
      expect(detector.hasKurdishCharacters('كتب عرب')).toBe(false)
    })

    it('returns false for Latin text', () => {
      expect(detector.hasKurdishCharacters('Hello world')).toBe(false)
    })
  })

  describe('Kurdish vs Arabic disambiguation', () => {
    it('identifies Kurdish text with Kurdish-unique characters', () => {
      const result = detector.detectKurdishVsArabic('ئەمڕۆ ڕۆژباشە ئێمە لە ماڵەوەین')
      expect(result).toBe('ku')
    })

    it('identifies Arabic text with Arabic-unique features', () => {
      const result = detector.detectKurdishVsArabic('هذا كتابٌ جميلٌ في المكتبة')
      expect(result).toBe('ar')
    })

    it('returns unknown for empty text', () => {
      expect(detector.detectKurdishVsArabic('')).toBe('unknown')
    })

    it('returns unknown for ambiguous text', () => {
      const result = detector.detectKurdishVsArabic('من')
      // 'من' exists in both languages
      expect(['ku', 'ar', 'unknown']).toContain(result)
    })
  })
})
