import { describe, it, expect } from 'vitest'
import { KurdishTranslationCorpus } from '../KurdishTranslationCorpus.js'

describe('KurdishTranslationCorpus', () => {
  const corpus = new KurdishTranslationCorpus()

  // ── Constructor & Initialization ────────────────────────────────────────

  describe('constructor and initialization', () => {
    it('creates a new instance without errors', () => {
      expect(() => new KurdishTranslationCorpus()).not.toThrow()
    })

    it('each instance is independent', () => {
      const a = new KurdishTranslationCorpus()
      const b = new KurdishTranslationCorpus()
      expect(a.getCategories()).not.toBe(b.getCategories())
      expect(a.totalPairs).toBe(b.totalPairs)
    })

    it('has a positive number of categories after construction', () => {
      expect(corpus.totalCategories).toBeGreaterThan(0)
    })

    it('has a positive number of pairs after construction', () => {
      expect(corpus.totalPairs).toBeGreaterThan(0)
    })
  })

  // ── getCategories() ─────────────────────────────────────────────────────

  describe('getCategories()', () => {
    it('returns an array', () => {
      expect(Array.isArray(corpus.getCategories())).toBe(true)
    })

    it('returns a non-empty array', () => {
      expect(corpus.getCategories().length).toBeGreaterThan(0)
    })

    it('each category has a name property', () => {
      for (const cat of corpus.getCategories()) {
        expect(cat).toHaveProperty('name')
        expect(typeof cat.name).toBe('string')
      }
    })

    it('each category has a nameKurdish property', () => {
      for (const cat of corpus.getCategories()) {
        expect(cat).toHaveProperty('nameKurdish')
        expect(typeof cat.nameKurdish).toBe('string')
      }
    })

    it('each category has a description property', () => {
      for (const cat of corpus.getCategories()) {
        expect(cat).toHaveProperty('description')
        expect(typeof cat.description).toBe('string')
      }
    })

    it('each category has a pairs array', () => {
      for (const cat of corpus.getCategories()) {
        expect(Array.isArray(cat.pairs)).toBe(true)
      }
    })

    it('each category has at least one pair', () => {
      for (const cat of corpus.getCategories()) {
        expect(cat.pairs.length).toBeGreaterThan(0)
      }
    })

    it('returns the same reference on repeated calls', () => {
      expect(corpus.getCategories()).toBe(corpus.getCategories())
    })
  })

  // ── getCategory() ───────────────────────────────────────────────────────

  describe('getCategory()', () => {
    it('returns a category by exact name', () => {
      const cat = corpus.getCategory('Culture & Festivals')
      expect(cat).toBeDefined()
      expect(cat!.name).toBe('Culture & Festivals')
    })

    it('is case-insensitive', () => {
      const cat = corpus.getCategory('culture & festivals')
      expect(cat).toBeDefined()
      expect(cat!.name).toBe('Culture & Festivals')
    })

    it('handles all-uppercase input', () => {
      const cat = corpus.getCategory('CULTURE & FESTIVALS')
      expect(cat).toBeDefined()
      expect(cat!.name).toBe('Culture & Festivals')
    })

    it('handles mixed-case input', () => {
      const cat = corpus.getCategory('cUlTuRe & fEsTiVaLs')
      expect(cat).toBeDefined()
      expect(cat!.name).toBe('Culture & Festivals')
    })

    it('returns undefined for an unknown category', () => {
      expect(corpus.getCategory('Nonexistent Category')).toBeUndefined()
    })

    it('returns undefined for an empty string', () => {
      expect(corpus.getCategory('')).toBeUndefined()
    })

    it('finds Language Rights & Education', () => {
      const cat = corpus.getCategory('Language Rights & Education')
      expect(cat).toBeDefined()
      expect(cat!.pairs.length).toBeGreaterThan(0)
    })

    it('finds History & Heritage', () => {
      expect(corpus.getCategory('History & Heritage')).toBeDefined()
    })

    it('finds Film & Arts', () => {
      expect(corpus.getCategory('Film & Arts')).toBeDefined()
    })

    it('finds Human Rights', () => {
      expect(corpus.getCategory('Human Rights')).toBeDefined()
    })

    it('finds Health & Pandemic', () => {
      expect(corpus.getCategory('Health & Pandemic')).toBeDefined()
    })

    it('finds News Headlines', () => {
      expect(corpus.getCategory('News Headlines')).toBeDefined()
    })

    it('finds Key Vocabulary', () => {
      expect(corpus.getCategory('Key Vocabulary')).toBeDefined()
    })
  })

  // ── getAllPairs() ───────────────────────────────────────────────────────

  describe('getAllPairs()', () => {
    it('returns an array', () => {
      expect(Array.isArray(corpus.getAllPairs())).toBe(true)
    })

    it('returns a non-empty array', () => {
      expect(corpus.getAllPairs().length).toBeGreaterThan(0)
    })

    it('every pair has a ckb string', () => {
      for (const pair of corpus.getAllPairs()) {
        expect(typeof pair.ckb).toBe('string')
      }
    })

    it('every pair has an eng string', () => {
      for (const pair of corpus.getAllPairs()) {
        expect(typeof pair.eng).toBe('string')
      }
    })

    it('total pairs from getAllPairs matches totalPairs getter', () => {
      expect(corpus.getAllPairs().length).toBe(corpus.totalPairs)
    })

    it('flattened pairs equals sum of category pair counts', () => {
      const sumFromCategories = corpus
        .getCategories()
        .reduce((sum, cat) => sum + cat.pairs.length, 0)
      expect(corpus.getAllPairs().length).toBe(sumFromCategories)
    })
  })

  // ── totalPairs (getter) ─────────────────────────────────────────────────

  describe('totalPairs', () => {
    it('returns a number', () => {
      expect(typeof corpus.totalPairs).toBe('number')
    })

    it('is greater than zero', () => {
      expect(corpus.totalPairs).toBeGreaterThan(0)
    })

    it('is consistent across calls', () => {
      expect(corpus.totalPairs).toBe(corpus.totalPairs)
    })

    it('equals the sum of pairs across all categories', () => {
      const expected = corpus
        .getCategories()
        .reduce((s, c) => s + c.pairs.length, 0)
      expect(corpus.totalPairs).toBe(expected)
    })
  })

  // ── totalCategories (getter) ────────────────────────────────────────────

  describe('totalCategories', () => {
    it('returns a number', () => {
      expect(typeof corpus.totalCategories).toBe('number')
    })

    it('is greater than zero', () => {
      expect(corpus.totalCategories).toBeGreaterThan(0)
    })

    it('matches getCategories() length', () => {
      expect(corpus.totalCategories).toBe(corpus.getCategories().length)
    })

    it('equals 11 categories', () => {
      expect(corpus.totalCategories).toBe(11)
    })
  })

  // ── search() ────────────────────────────────────────────────────────────

  describe('search()', () => {
    it('finds results when searching by English text', () => {
      const results = corpus.search('Kurdish')
      expect(results.length).toBeGreaterThan(0)
    })

    it('finds results when searching by Kurdish text', () => {
      const pair = corpus.getAllPairs()[0]
      const fragment = pair.ckb.slice(0, 10)
      const results = corpus.search(fragment)
      expect(results.length).toBeGreaterThan(0)
    })

    it('is case-insensitive for English queries', () => {
      const lower = corpus.search('kurdish')
      const upper = corpus.search('KURDISH')
      expect(lower.length).toBe(upper.length)
    })

    it('respects the limit parameter', () => {
      const results = corpus.search('the', 3)
      expect(results.length).toBeLessThanOrEqual(3)
    })

    it('defaults limit to 10', () => {
      const results = corpus.search('the')
      expect(results.length).toBeLessThanOrEqual(10)
    })

    it('returns an empty array for a query with no matches', () => {
      const results = corpus.search('xyzzyzzyx_nomatch_12345')
      expect(results).toEqual([])
    })

    it('returns an empty array for an empty query when no pairs match', () => {
      // empty string is included in everything, so should return up to limit
      const results = corpus.search('')
      expect(results.length).toBeLessThanOrEqual(10)
    })

    it('search results contain ckb and eng fields', () => {
      const results = corpus.search('language')
      for (const r of results) {
        expect(r).toHaveProperty('ckb')
        expect(r).toHaveProperty('eng')
      }
    })

    it('each result actually contains the query text', () => {
      const query = 'film'
      const results = corpus.search(query)
      for (const r of results) {
        const matchesEng = r.eng.toLowerCase().includes(query)
        const matchesCkb = r.ckb.includes(query)
        expect(matchesEng || matchesCkb).toBe(true)
      }
    })

    it('returns up to limit even when more results exist', () => {
      const results1 = corpus.search('the', 1)
      expect(results1.length).toBe(1)
      const results5 = corpus.search('the', 5)
      expect(results5.length).toBeLessThanOrEqual(5)
    })

    it('returns all matches when limit exceeds available results', () => {
      const small = corpus.search('Newroz', 1000)
      expect(small.length).toBeGreaterThan(0)
      expect(small.length).toBeLessThanOrEqual(1000)
    })
  })

  // ── sample() ────────────────────────────────────────────────────────────

  describe('sample()', () => {
    it('returns an array', () => {
      expect(Array.isArray(corpus.sample())).toBe(true)
    })

    it('defaults to 5 items', () => {
      const result = corpus.sample()
      expect(result.length).toBe(5)
    })

    it('returns the requested count', () => {
      expect(corpus.sample(3).length).toBe(3)
    })

    it('returns 1 item when count is 1', () => {
      expect(corpus.sample(1).length).toBe(1)
    })

    it('does not exceed pool size when count is larger', () => {
      const all = corpus.totalPairs
      const result = corpus.sample(all + 100)
      expect(result.length).toBeLessThanOrEqual(all)
    })

    it('returns items from a specific category', () => {
      const cat = corpus.getCategory('News Headlines')!
      const result = corpus.sample(2, 'News Headlines')
      expect(result.length).toBe(2)
      for (const r of result) {
        expect(cat.pairs).toContainEqual(r)
      }
    })

    it('does not exceed category size when sampling from a specific category', () => {
      const cat = corpus.getCategory('Inspirational & Poetic')!
      const result = corpus.sample(1000, 'Inspirational & Poetic')
      expect(result.length).toBeLessThanOrEqual(cat.pairs.length)
    })

    it('returns empty array for a nonexistent category', () => {
      const result = corpus.sample(5, 'Does Not Exist')
      expect(result).toEqual([])
    })

    it('returns items that have ckb and eng fields', () => {
      for (const item of corpus.sample(3)) {
        expect(typeof item.ckb).toBe('string')
        expect(typeof item.eng).toBe('string')
      }
    })

    it('returns zero items when count is zero', () => {
      expect(corpus.sample(0).length).toBe(0)
    })
  })

  // ── TranslationPair structure validation ────────────────────────────────

  describe('TranslationPair structure', () => {
    it('all pairs have non-empty ckb text', () => {
      for (const pair of corpus.getAllPairs()) {
        expect(pair.ckb.trim().length).toBeGreaterThan(0)
      }
    })

    it('all pairs have non-empty eng text', () => {
      for (const pair of corpus.getAllPairs()) {
        expect(pair.eng.trim().length).toBeGreaterThan(0)
      }
    })

    it('no pair has undefined ckb', () => {
      for (const pair of corpus.getAllPairs()) {
        expect(pair.ckb).toBeDefined()
      }
    })

    it('no pair has undefined eng', () => {
      for (const pair of corpus.getAllPairs()) {
        expect(pair.eng).toBeDefined()
      }
    })

    it('ckb and eng are distinct strings in every pair', () => {
      for (const pair of corpus.getAllPairs()) {
        expect(pair.ckb).not.toBe(pair.eng)
      }
    })
  })

  // ── TranslationCategory structure validation ────────────────────────────

  describe('TranslationCategory structure', () => {
    it('all categories have non-empty name', () => {
      for (const cat of corpus.getCategories()) {
        expect(cat.name.trim().length).toBeGreaterThan(0)
      }
    })

    it('all categories have non-empty nameKurdish', () => {
      for (const cat of corpus.getCategories()) {
        expect(cat.nameKurdish.trim().length).toBeGreaterThan(0)
      }
    })

    it('all categories have non-empty description', () => {
      for (const cat of corpus.getCategories()) {
        expect(cat.description.trim().length).toBeGreaterThan(0)
      }
    })

    it('all category names are unique', () => {
      const names = corpus.getCategories().map(c => c.name)
      expect(new Set(names).size).toBe(names.length)
    })

    it('all category Kurdish names are unique', () => {
      const names = corpus.getCategories().map(c => c.nameKurdish)
      expect(new Set(names).size).toBe(names.length)
    })

    it('every category has at least one translation pair', () => {
      for (const cat of corpus.getCategories()) {
        expect(cat.pairs.length).toBeGreaterThan(0)
      }
    })
  })

  // ── Edge cases ──────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('search with empty string returns results (matches everything)', () => {
      const results = corpus.search('', 5)
      expect(results.length).toBe(5)
    })

    it('search with very large limit returns all matching pairs', () => {
      const results = corpus.search('', 100000)
      expect(results.length).toBe(corpus.totalPairs)
    })

    it('sample with zero count returns empty array', () => {
      expect(corpus.sample(0)).toEqual([])
    })

    it('getCategory with whitespace-only string returns undefined', () => {
      expect(corpus.getCategory('   ')).toBeUndefined()
    })

    it('search result limit of 1 returns exactly 1 result', () => {
      const results = corpus.search('the', 1)
      expect(results.length).toBe(1)
    })

    it('sample from all categories returns valid pairs', () => {
      const s = corpus.sample(10)
      const allPairs = corpus.getAllPairs()
      for (const item of s) {
        expect(allPairs).toContainEqual(item)
      }
    })
  })
})
