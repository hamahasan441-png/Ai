import { describe, it, expect, beforeEach } from 'vitest'
import {
  TfIdfScorer,
  tokenize,
  cosineSimilarity,
  ngramOverlapScore,
  generateNgrams,
  computeTf,
  getNgrams,
} from '../TfIdfScorer'

// ── Tokenization Tests ──

describe('tokenize', () => {
  it('converts text to lowercase tokens', () => {
    const tokens = tokenize('Hello World')
    expect(tokens).toEqual(['hello', 'world'])
  })

  it('removes stop words', () => {
    const tokens = tokenize('this is a test of the system')
    expect(tokens).toEqual(['test', 'system'])
  })

  it('removes short tokens (< 2 chars)', () => {
    const tokens = tokenize('I am a big fan')
    expect(tokens).toContain('big')
    expect(tokens).toContain('fan')
    // 'am' is 2 chars, so it passes the >= 2 filter
    expect(tokens).toContain('am')
  })

  it('removes punctuation', () => {
    const tokens = tokenize("What's the best way to sort? Use Python!")
    // Apostrophe becomes space, so "what's" → "what" + "s"
    expect(tokens).toContain('best')
    expect(tokens).toContain('way')
    expect(tokens).toContain('sort')
    expect(tokens).toContain('python')
  })

  it('handles empty string', () => {
    expect(tokenize('')).toEqual([])
  })

  it('handles numbers', () => {
    const tokens = tokenize('Node.js version 22')
    // Period becomes space, so "Node.js" → "node" + "js"
    expect(tokens).toContain('node')
    expect(tokens).toContain('js')
    expect(tokens).toContain('version')
    expect(tokens).toContain('22')
  })
})

// ── N-gram Tests ──

describe('generateNgrams', () => {
  it('generates bigrams', () => {
    const ngrams = generateNgrams(['sort', 'array', 'python'], 2)
    expect(ngrams).toEqual(['sort array', 'array python'])
  })

  it('generates trigrams', () => {
    const ngrams = generateNgrams(['sort', 'array', 'python'], 3)
    expect(ngrams).toEqual(['sort array python'])
  })

  it('returns empty for insufficient tokens', () => {
    expect(generateNgrams(['hello'], 2)).toEqual([])
  })
})

describe('getNgrams', () => {
  it('returns both bigrams and trigrams', () => {
    const ngrams = getNgrams('sort array in python')
    expect(ngrams.length).toBeGreaterThan(0)
    // Should have bigrams
    expect(ngrams.some(n => n.split(' ').length === 2)).toBe(true)
  })
})

// ── TF Tests ──

describe('computeTf', () => {
  it('computes normalized term frequency', () => {
    const tf = computeTf(['hello', 'world', 'hello'])
    expect(tf.get('hello')).toBeCloseTo(2 / 3, 5)
    expect(tf.get('world')).toBeCloseTo(1 / 3, 5)
  })

  it('handles empty tokens', () => {
    const tf = computeTf([])
    expect(tf.size).toBe(0)
  })

  it('handles single token', () => {
    const tf = computeTf(['test'])
    expect(tf.get('test')).toBe(1)
  })
})

// ── Cosine Similarity Tests ──

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = new Map([
      ['a', 1],
      ['b', 2],
    ])
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5)
  })

  it('returns 0 for orthogonal vectors', () => {
    const a = new Map([['x', 1]])
    const b = new Map([['y', 1]])
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  it('returns between 0 and 1 for partial overlap', () => {
    const a = new Map([
      ['x', 1],
      ['y', 1],
    ])
    const b = new Map([
      ['y', 1],
      ['z', 1],
    ])
    const sim = cosineSimilarity(a, b)
    expect(sim).toBeGreaterThan(0)
    expect(sim).toBeLessThan(1)
  })

  it('handles empty vectors', () => {
    const empty = new Map<string, number>()
    const v = new Map([['a', 1]])
    expect(cosineSimilarity(empty, v)).toBe(0)
    expect(cosineSimilarity(v, empty)).toBe(0)
    expect(cosineSimilarity(empty, empty)).toBe(0)
  })
})

// ── N-gram Overlap Score Tests ──

describe('ngramOverlapScore', () => {
  it('returns 1 for identical texts', () => {
    const score = ngramOverlapScore('sort array python', 'sort array python')
    expect(score).toBe(1)
  })

  it('returns 0 for completely different texts', () => {
    const score = ngramOverlapScore('javascript react', 'quantum mechanics')
    expect(score).toBe(0)
  })

  it('returns partial score for partially overlapping texts', () => {
    const score = ngramOverlapScore('sort array python', 'sort array javascript')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('handles empty strings', () => {
    expect(ngramOverlapScore('', 'test')).toBe(0)
    expect(ngramOverlapScore('test', '')).toBe(0)
  })
})

// ── TfIdfScorer Class Tests ──

describe('TfIdfScorer', () => {
  let scorer: TfIdfScorer

  beforeEach(() => {
    scorer = new TfIdfScorer()
  })

  it('starts with empty corpus', () => {
    expect(scorer.size).toBe(0)
  })

  it('adds documents', () => {
    scorer.addDocument({ id: 'doc1', text: 'hello world' })
    expect(scorer.size).toBe(1)
    expect(scorer.hasDocument('doc1')).toBe(true)
  })

  it('removes documents', () => {
    scorer.addDocument({ id: 'doc1', text: 'hello world' })
    scorer.removeDocument('doc1')
    expect(scorer.size).toBe(0)
    expect(scorer.hasDocument('doc1')).toBe(false)
  })

  it('clears all documents', () => {
    scorer.addDocument({ id: 'doc1', text: 'hello' })
    scorer.addDocument({ id: 'doc2', text: 'world' })
    scorer.clear()
    expect(scorer.size).toBe(0)
  })

  it('scores queries against corpus', () => {
    scorer.addDocument({ id: 'p1', text: 'How to sort an array in Python' })
    scorer.addDocument({ id: 'p2', text: 'JavaScript async await tutorial' })
    scorer.addDocument({ id: 'p3', text: 'REST API design best practices' })

    const results = scorer.score('sort array python')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.id).toBe('p1')
    expect(results[0]!.score).toBeGreaterThan(0)
  })

  it('returns empty results for unrelated queries', () => {
    scorer.addDocument({ id: 'p1', text: 'How to sort an array in Python' })

    const results = scorer.score('quantum mechanics string theory', 5, 0.3)
    expect(results.length).toBe(0)
  })

  it('respects limit parameter', () => {
    for (let i = 0; i < 20; i++) {
      scorer.addDocument({ id: `doc${i}`, text: `document about testing topic ${i}` })
    }

    const results = scorer.score('testing topic', 5)
    expect(results.length).toBeLessThanOrEqual(5)
  })

  it('respects minScore parameter', () => {
    scorer.addDocument({ id: 'p1', text: 'relevant document matching query' })
    scorer.addDocument({ id: 'p2', text: 'completely unrelated content here' })

    const results = scorer.score('relevant matching query', 10, 0.5)
    for (const result of results) {
      expect(result.score).toBeGreaterThanOrEqual(0.5)
    }
  })

  it('sorts results by score descending', () => {
    scorer.addDocument({ id: 'p1', text: 'sort array python programming' })
    scorer.addDocument({ id: 'p2', text: 'sort list java programming' })
    scorer.addDocument({ id: 'p3', text: 'web design html css' })

    const results = scorer.score('sort array programming')
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score)
    }
  })

  it('includes tfidfScore and ngramScore in results', () => {
    scorer.addDocument({ id: 'p1', text: 'test document for scoring' })
    const results = scorer.score('test scoring')

    if (results.length > 0) {
      expect(results[0]).toHaveProperty('tfidfScore')
      expect(results[0]).toHaveProperty('ngramScore')
      expect(results[0]).toHaveProperty('score')
    }
  })
})

// ── scorePair Tests ──

describe('TfIdfScorer.scorePair', () => {
  let scorer: TfIdfScorer

  beforeEach(() => {
    scorer = new TfIdfScorer()
  })

  it('scores a query against a single document', () => {
    const result = scorer.scorePair('sort array', 'How to sort an array in Python')
    expect(result.score).toBeGreaterThan(0)
    expect(result.tfidfScore).toBeGreaterThanOrEqual(0)
    expect(result.ngramScore).toBeGreaterThanOrEqual(0)
  })

  it('returns 0 for completely different texts', () => {
    const result = scorer.scorePair('quantum physics', 'banana recipe cooking')
    expect(result.tfidfScore).toBe(0)
  })

  it('returns higher score for more similar texts', () => {
    const similar = scorer.scorePair('sort array python', 'sorting arrays in python language')
    const different = scorer.scorePair('sort array python', 'cooking banana recipe')
    expect(similar.score).toBeGreaterThan(different.score)
  })
})
