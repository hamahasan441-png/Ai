import { describe, it, expect } from 'vitest'
import { KurdishLanguageUtils } from '../KurdishLanguageUtils.js'

const utils = new KurdishLanguageUtils()

// ─── Proverbs ──────────────────────────────────────────────────────────────────

describe('KurdishLanguageUtils — Proverbs', () => {
  it('getProverbs() returns all proverbs as a non-empty array', () => {
    const proverbs = utils.getProverbs()
    expect(Array.isArray(proverbs)).toBe(true)
    expect(proverbs.length).toBeGreaterThan(0)
  })

  it('every proverb has ckb, eng, and category fields', () => {
    for (const p of utils.getProverbs()) {
      expect(p).toHaveProperty('ckb')
      expect(p).toHaveProperty('eng')
      expect(p).toHaveProperty('category')
      expect(typeof p.ckb).toBe('string')
      expect(typeof p.eng).toBe('string')
      expect(typeof p.category).toBe('string')
    }
  })

  it('totalProverbs matches the length of getProverbs()', () => {
    expect(utils.totalProverbs).toBe(utils.getProverbs().length)
  })

  it('totalProverbs is 35', () => {
    expect(utils.totalProverbs).toBe(35)
  })

  it('getProverbCategories() returns exactly 6 categories', () => {
    const categories = utils.getProverbCategories()
    expect(categories).toHaveLength(6)
  })

  it('getProverbCategories() contains all expected categories', () => {
    const categories = utils.getProverbCategories()
    for (const cat of ['wisdom', 'friendship', 'perseverance', 'knowledge', 'family', 'identity']) {
      expect(categories).toContain(cat)
    }
  })

  it('getProverbsByCategory("wisdom") returns 10 proverbs', () => {
    expect(utils.getProverbsByCategory('wisdom')).toHaveLength(10)
  })

  it('getProverbsByCategory("friendship") returns 5 proverbs', () => {
    expect(utils.getProverbsByCategory('friendship')).toHaveLength(5)
  })

  it('getProverbsByCategory("perseverance") returns 5 proverbs', () => {
    expect(utils.getProverbsByCategory('perseverance')).toHaveLength(5)
  })

  it('getProverbsByCategory("knowledge") returns 5 proverbs', () => {
    expect(utils.getProverbsByCategory('knowledge')).toHaveLength(5)
  })

  it('getProverbsByCategory("family") returns 5 proverbs', () => {
    expect(utils.getProverbsByCategory('family')).toHaveLength(5)
  })

  it('getProverbsByCategory("identity") returns 5 proverbs', () => {
    expect(utils.getProverbsByCategory('identity')).toHaveLength(5)
  })

  it('getProverbsByCategory() returns empty for unknown category', () => {
    expect(utils.getProverbsByCategory('nonexistent')).toHaveLength(0)
  })

  it('getRandomProverb() returns a valid proverb object', () => {
    const p = utils.getRandomProverb()
    expect(p).toHaveProperty('ckb')
    expect(p).toHaveProperty('eng')
    expect(p).toHaveProperty('category')
  })

  it('getRandomProverb() returns a proverb from the collection', () => {
    const all = utils.getProverbs()
    const random = utils.getRandomProverb()
    expect(all).toContainEqual(random)
  })

  it('searchProverbs() finds proverbs by English keyword', () => {
    const results = utils.searchProverbs('golden')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.eng).toContain('golden')
  })

  it('searchProverbs() is case-insensitive for English text', () => {
    const upper = utils.searchProverbs('SILENCE')
    const lower = utils.searchProverbs('silence')
    expect(upper).toEqual(lower)
  })

  it('searchProverbs() finds proverbs by Kurdish text', () => {
    const results = utils.searchProverbs('ئاو')
    expect(results.length).toBeGreaterThan(0)
  })

  it('searchProverbs() returns empty for no match', () => {
    expect(utils.searchProverbs('xyzzynonexistent')).toHaveLength(0)
  })

  it('searchProverbs() respects the limit parameter', () => {
    const results = utils.searchProverbs('the', 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('searchProverbs() default limit is 10', () => {
    const results = utils.searchProverbs('a')
    expect(results.length).toBeLessThanOrEqual(10)
  })
})

// ─── Numbers ───────────────────────────────────────────────────────────────────

describe('KurdishLanguageUtils — Numbers', () => {
  it('numberToKurdish(0) returns سفر', () => {
    expect(utils.numberToKurdish(0)).toBe('سفر')
  })

  it('numberToKurdish(1) through (10) returns correct words', () => {
    const expected = ['یەک', 'دوو', 'سێ', 'چوار', 'پێنج', 'شەش', 'حەوت', 'هەشت', 'نۆ', 'دە']
    for (let i = 1; i <= 10; i++) {
      expect(utils.numberToKurdish(i)).toBe(expected[i - 1])
    }
  })

  it('numberToKurdish(11) through (20) returns correct words', () => {
    const expected = [
      'یانزە',
      'دوانزە',
      'سیانزە',
      'چواردە',
      'پانزە',
      'شانزە',
      'حەڤدە',
      'هەژدە',
      'نۆزدە',
      'بیست',
    ]
    for (let i = 11; i <= 20; i++) {
      expect(utils.numberToKurdish(i)).toBe(expected[i - 11])
    }
  })

  it('numberToKurdish(21) returns بیست و یەک', () => {
    expect(utils.numberToKurdish(21)).toBe('بیست و یەک')
  })

  it('numberToKurdish(30) returns سی', () => {
    expect(utils.numberToKurdish(30)).toBe('سی')
  })

  it('numberToKurdish(45) returns چل و پێنج', () => {
    expect(utils.numberToKurdish(45)).toBe('چل و پێنج')
  })

  it('numberToKurdish(99) returns نەوەد و نۆ', () => {
    expect(utils.numberToKurdish(99)).toBe('نەوەد و نۆ')
  })

  it('numberToKurdish(100) returns سەد', () => {
    expect(utils.numberToKurdish(100)).toBe('سەد')
  })

  it('numberToKurdish(101) returns سەد و یەک', () => {
    expect(utils.numberToKurdish(101)).toBe('سەد و یەک')
  })

  it('numberToKurdish(200) returns دوو سەد', () => {
    expect(utils.numberToKurdish(200)).toBe('دوو سەد')
  })

  it('numberToKurdish(350) returns سێ سەد و پەنجا', () => {
    expect(utils.numberToKurdish(350)).toBe('سێ سەد و پەنجا')
  })

  it('numberToKurdish(999) returns نۆ سەد و نەوەد و نۆ', () => {
    expect(utils.numberToKurdish(999)).toBe('نۆ سەد و نەوەد و نۆ')
  })

  it('numberToKurdish(1000) returns هەزار', () => {
    expect(utils.numberToKurdish(1000)).toBe('هەزار')
  })

  it('numberToKurdish(1001) returns هەزار و یەک', () => {
    expect(utils.numberToKurdish(1001)).toBe('هەزار و یەک')
  })

  it('numberToKurdish(2000) returns دوو هەزار', () => {
    expect(utils.numberToKurdish(2000)).toBe('دوو هەزار')
  })

  it('numberToKurdish(5555) returns پێنج هەزار و پێنج سەد و پەنجا و پێنج', () => {
    expect(utils.numberToKurdish(5555)).toBe('پێنج هەزار و پێنج سەد و پەنجا و پێنج')
  })

  it('numberToKurdish(9999) returns نۆ هەزار و نۆ سەد و نەوەد و نۆ', () => {
    expect(utils.numberToKurdish(9999)).toBe('نۆ هەزار و نۆ سەد و نەوەد و نۆ')
  })

  it('numberToKurdish() returns string of number for negative input', () => {
    expect(utils.numberToKurdish(-1)).toBe('-1')
  })

  it('numberToKurdish() returns string of number for decimal input', () => {
    expect(utils.numberToKurdish(3.5)).toBe('3.5')
  })

  it('numberToKurdish() returns string of number for out-of-range input', () => {
    expect(utils.numberToKurdish(10000)).toBe('10000')
  })

  it('numberToOrdinal(1) returns یەکەم', () => {
    expect(utils.numberToOrdinal(1)).toBe('یەکەم')
  })

  it('numberToOrdinal(2) returns دووەم', () => {
    expect(utils.numberToOrdinal(2)).toBe('دووەم')
  })

  it('numberToOrdinal(3) returns سێەم', () => {
    expect(utils.numberToOrdinal(3)).toBe('سێەم')
  })

  it('numberToOrdinal(10) returns دەەم', () => {
    expect(utils.numberToOrdinal(10)).toBe('دەەم')
  })

  it('numberToOrdinal(100) returns سەدەم', () => {
    expect(utils.numberToOrdinal(100)).toBe('سەدەم')
  })

  it('numberToOrdinal(0) returns string "0" (out of range)', () => {
    expect(utils.numberToOrdinal(0)).toBe('0')
  })

  it('numberToOrdinal(-5) returns string "-5" (negative)', () => {
    expect(utils.numberToOrdinal(-5)).toBe('-5')
  })

  it('numberToOrdinal(1.5) returns string "1.5" (non-integer)', () => {
    expect(utils.numberToOrdinal(1.5)).toBe('1.5')
  })
})

// ─── Days ──────────────────────────────────────────────────────────────────────

describe('KurdishLanguageUtils — Days', () => {
  it('getDaysOfWeek() returns 7 days', () => {
    expect(utils.getDaysOfWeek()).toHaveLength(7)
  })

  it('each day has name and english fields', () => {
    for (const d of utils.getDaysOfWeek()) {
      expect(typeof d.name).toBe('string')
      expect(typeof d.english).toBe('string')
    }
  })

  it('first day is Saturday (شەممە)', () => {
    expect(utils.getDaysOfWeek()[0]!.english).toBe('Saturday')
    expect(utils.getDaysOfWeek()[0]!.name).toBe('شەممە')
  })

  it('getDay("Monday") returns دووشەممە', () => {
    const day = utils.getDay('Monday')
    expect(day).toBeDefined()
    expect(day!.name).toBe('دووشەممە')
  })

  it('getDay() is case-insensitive', () => {
    expect(utils.getDay('FRIDAY')).toEqual(utils.getDay('friday'))
  })

  it('getDay() returns undefined for unknown day', () => {
    expect(utils.getDay('Funday')).toBeUndefined()
  })

  it('getDay() finds all seven days', () => {
    const englishDays = [
      'Saturday',
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ]
    for (const eng of englishDays) {
      expect(utils.getDay(eng)).toBeDefined()
    }
  })
})

// ─── Months ────────────────────────────────────────────────────────────────────

describe('KurdishLanguageUtils — Months', () => {
  it('getMonths() returns 12 months', () => {
    expect(utils.getMonths()).toHaveLength(12)
  })

  it('each month has name, english, and gregorianApprox fields', () => {
    for (const m of utils.getMonths()) {
      expect(typeof m.name).toBe('string')
      expect(typeof m.english).toBe('string')
      expect(typeof m.gregorianApprox).toBe('string')
    }
  })

  it('first month is Xakelêwe (خاکەلێوە)', () => {
    expect(utils.getMonths()[0]!.english).toBe('Xakelêwe')
    expect(utils.getMonths()[0]!.name).toBe('خاکەلێوە')
  })

  it('getMonth("Gulan") returns گوڵان', () => {
    const month = utils.getMonth('Gulan')
    expect(month).toBeDefined()
    expect(month!.name).toBe('گوڵان')
  })

  it('getMonth() is case-insensitive', () => {
    expect(utils.getMonth('GULAN')).toEqual(utils.getMonth('gulan'))
  })

  it('getMonth() returns undefined for unknown month', () => {
    expect(utils.getMonth('Januarius')).toBeUndefined()
  })

  it('getMonth("Befranbar") returns correct gregorianApprox', () => {
    const month = utils.getMonth('Befranbar')
    expect(month).toBeDefined()
    expect(month!.gregorianApprox).toBe('December–January')
  })
})

// ─── Greetings ─────────────────────────────────────────────────────────────────

describe('KurdishLanguageUtils — Greetings', () => {
  it('getGreetings() returns a Map', () => {
    expect(utils.getGreetings()).toBeInstanceOf(Map)
  })

  it('getGreetings() has 18 entries', () => {
    expect(utils.getGreetings().size).toBe(18)
  })

  it('getGreetings() contains سلاو mapped to Hello (informal)', () => {
    expect(utils.getGreetings().get('سلاو')).toBe('Hello (informal)')
  })

  it('getGreetings() contains سوپاس mapped to Thank you', () => {
    expect(utils.getGreetings().get('سوپاس')).toBe('Thank you')
  })

  it('getTimeGreeting() returns بەیانیباش for morning hours (5–11)', () => {
    for (const h of [5, 6, 8, 10, 11]) {
      expect(utils.getTimeGreeting(h)).toBe('بەیانیباش')
    }
  })

  it('getTimeGreeting() returns ڕۆژباش for afternoon hours (12–16)', () => {
    for (const h of [12, 13, 15, 16]) {
      expect(utils.getTimeGreeting(h)).toBe('ڕۆژباش')
    }
  })

  it('getTimeGreeting() returns ئێوارەباش for evening hours (17–20)', () => {
    for (const h of [17, 18, 19, 20]) {
      expect(utils.getTimeGreeting(h)).toBe('ئێوارەباش')
    }
  })

  it('getTimeGreeting() returns شەوباش for night hours (21–4)', () => {
    for (const h of [21, 22, 23, 0, 1, 2, 3, 4]) {
      expect(utils.getTimeGreeting(h)).toBe('شەوباش')
    }
  })

  it('getTimeGreeting() with no argument returns a known greeting', () => {
    const greeting = utils.getTimeGreeting()
    expect(['بەیانیباش', 'ڕۆژباش', 'ئێوارەباش', 'شەوباش']).toContain(greeting)
  })
})

// ─── Dialects ──────────────────────────────────────────────────────────────────

describe('KurdishLanguageUtils — Dialects', () => {
  it('getDialectComparisons() returns 30 entries', () => {
    expect(utils.getDialectComparisons()).toHaveLength(30)
  })

  it('each dialect entry has meaning, sorani, and kurmanji fields', () => {
    for (const d of utils.getDialectComparisons()) {
      expect(typeof d.meaning).toBe('string')
      expect(typeof d.sorani).toBe('string')
      expect(typeof d.kurmanji).toBe('string')
    }
  })

  it('totalDialectEntries is 30', () => {
    expect(utils.totalDialectEntries).toBe(30)
  })

  it('totalDialectEntries matches getDialectComparisons().length', () => {
    expect(utils.totalDialectEntries).toBe(utils.getDialectComparisons().length)
  })

  it('searchDialect("water") finds the water entry', () => {
    const results = utils.searchDialect('water')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.meaning).toBe('water')
  })

  it('searchDialect() is case-insensitive', () => {
    expect(utils.searchDialect('WATER')).toEqual(utils.searchDialect('water'))
  })

  it('searchDialect() returns empty for no match', () => {
    expect(utils.searchDialect('zzznotfound')).toHaveLength(0)
  })

  it('searchDialect("you") finds partial matches', () => {
    const results = utils.searchDialect('you')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(d => d.meaning.includes('you'))).toBe(true)
  })
})

// ─── Stats ─────────────────────────────────────────────────────────────────────

describe('KurdishLanguageUtils — Stats', () => {
  it('getStats() returns an object with all expected keys', () => {
    const stats = utils.getStats()
    expect(stats).toHaveProperty('proverbs')
    expect(stats).toHaveProperty('proverbCategories')
    expect(stats).toHaveProperty('greetings')
    expect(stats).toHaveProperty('dialectEntries')
    expect(stats).toHaveProperty('days')
    expect(stats).toHaveProperty('months')
  })

  it('getStats() counts match individual accessor counts', () => {
    const stats = utils.getStats()
    expect(stats.proverbs).toBe(utils.totalProverbs)
    expect(stats.proverbCategories).toBe(utils.getProverbCategories().length)
    expect(stats.greetings).toBe(utils.getGreetings().size)
    expect(stats.dialectEntries).toBe(utils.totalDialectEntries)
    expect(stats.days).toBe(utils.getDaysOfWeek().length)
    expect(stats.months).toBe(utils.getMonths().length)
  })

  it('getStats() returns correct absolute values', () => {
    const stats = utils.getStats()
    expect(stats.proverbs).toBe(35)
    expect(stats.proverbCategories).toBe(6)
    expect(stats.greetings).toBe(18)
    expect(stats.dialectEntries).toBe(30)
    expect(stats.days).toBe(7)
    expect(stats.months).toBe(12)
  })
})
