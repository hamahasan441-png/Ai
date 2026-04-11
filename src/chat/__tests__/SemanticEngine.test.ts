import { describe, it, expect, beforeEach } from 'vitest'
import { SemanticEngine, cosineSimilarity, type SemanticDocument } from '../SemanticEngine'

// ── cosineSimilarity (standalone export) ──

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = [1, 2, 3]
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5)
  })

  it('returns 0 for orthogonal vectors', () => {
    const a = [1, 0, 0]
    const b = [0, 1, 0]
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  it('returns value between 0 and 1 for partial overlap', () => {
    const a = [1, 1, 0]
    const b = [0, 1, 1]
    const sim = cosineSimilarity(a, b)
    expect(sim).toBeGreaterThan(0)
    expect(sim).toBeLessThan(1)
  })

  it('returns 0 when either vector is all zeros', () => {
    const zero = [0, 0, 0]
    const v = [1, 2, 3]
    expect(cosineSimilarity(zero, v)).toBe(0)
    expect(cosineSimilarity(v, zero)).toBe(0)
    expect(cosineSimilarity(zero, zero)).toBe(0)
  })

  it('handles vectors of different lengths using the shorter length', () => {
    const a = [1, 0]
    const b = [1, 0, 0, 0]
    expect(cosineSimilarity(a, b)).toBeCloseTo(1, 5)
  })
})

// ── Constructor ──

describe('SemanticEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new SemanticEngine()
    expect(engine).toBeInstanceOf(SemanticEngine)
  })

  it('creates an instance with custom dimensions', () => {
    const engine = new SemanticEngine({ dimensions: 30 })
    const vec = engine.embed('function')
    expect(vec).toHaveLength(30)
  })

  it('creates an instance with custom minSimilarity', () => {
    const engine = new SemanticEngine({ minSimilarity: 0.8 })
    const docs: SemanticDocument[] = [
      { id: '1', text: 'javascript react component' },
      { id: '2', text: 'quantum physics string theory' },
    ]
    const results = engine.findSimilar('react web component', docs)
    // With a high threshold, only very similar docs should match
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0.8)
    }
  })

  it('accepts a partial config without errors', () => {
    expect(() => new SemanticEngine({})).not.toThrow()
  })
})

// ── embed() ──

describe('SemanticEngine.embed', () => {
  let engine: SemanticEngine

  beforeEach(() => {
    engine = new SemanticEngine()
  })

  it('returns a vector of 50 dimensions by default', () => {
    const vec = engine.embed('function')
    expect(vec).toHaveLength(50)
  })

  it('returns a zero vector for empty text', () => {
    const vec = engine.embed('')
    expect(vec).toHaveLength(50)
    expect(vec.every(v => v === 0)).toBe(true)
  })

  it('returns a zero vector for text containing only stop words', () => {
    const vec = engine.embed('the is a an')
    expect(vec).toHaveLength(50)
    expect(vec.every(v => v === 0)).toBe(true)
  })

  it('returns a normalized vector (unit length)', () => {
    const vec = engine.embed('sort algorithm binary search')
    const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
    expect(magnitude).toBeCloseTo(1, 4)
  })

  it('produces non-zero vectors for known words', () => {
    const vec = engine.embed('database query optimization')
    expect(vec.some(v => v !== 0)).toBe(true)
  })

  it('produces non-zero vectors for unknown words via trigram fallback', () => {
    const vec = engine.embed('xylophonezzz')
    expect(vec.some(v => v !== 0)).toBe(true)
  })

  it('handles single-word input', () => {
    const vec = engine.embed('docker')
    expect(vec).toHaveLength(50)
    expect(vec.some(v => v !== 0)).toBe(true)
  })

  it('handles long text input', () => {
    const longText =
      'sort algorithm binary search tree graph hash table linked list queue stack heap'
    const vec = engine.embed(longText)
    expect(vec).toHaveLength(50)
    const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
    expect(magnitude).toBeCloseTo(1, 4)
  })

  it('produces different vectors for different domains', () => {
    const webVec = engine.embed('html css javascript react')
    const dbVec = engine.embed('sql database query table')
    // Not identical
    const sim = cosineSimilarity(webVec, dbVec)
    expect(sim).toBeLessThan(0.95)
  })

  it('produces similar vectors for semantically related terms', () => {
    const a = engine.embed('array list collection')
    const b = engine.embed('stack queue data structure')
    const sim = cosineSimilarity(a, b)
    expect(sim).toBeGreaterThan(0.3)
  })

  it('returns consistent results for the same input', () => {
    const vec1 = engine.embed('machine learning model')
    const vec2 = engine.embed('machine learning model')
    expect(vec1).toEqual(vec2)
  })
})

// ── similarity() ──

describe('SemanticEngine.similarity', () => {
  let engine: SemanticEngine

  beforeEach(() => {
    engine = new SemanticEngine()
  })

  it('returns 1.0 for identical text', () => {
    const sim = engine.similarity('sort an array', 'sort an array')
    expect(sim).toBeCloseTo(1.0, 5)
  })

  it('returns high similarity for related terms', () => {
    const sim = engine.similarity('sort an array', 'order a list')
    expect(sim).toBeGreaterThan(0.5)
  })

  it('returns low similarity for unrelated terms', () => {
    const sim = engine.similarity('encrypt password security', 'html css react component')
    expect(sim).toBeLessThan(0.5)
  })

  it('returns a value between 0 and 1', () => {
    const sim = engine.similarity('database query', 'neural network training')
    expect(sim).toBeGreaterThanOrEqual(0)
    expect(sim).toBeLessThanOrEqual(1)
  })

  it('returns 0 for two empty strings', () => {
    const sim = engine.similarity('', '')
    expect(sim).toBe(0)
  })

  it('returns 0 when one string is empty', () => {
    const sim = engine.similarity('database', '')
    expect(sim).toBe(0)
  })

  it('is commutative', () => {
    const ab = engine.similarity('docker container', 'kubernetes deploy')
    const ba = engine.similarity('kubernetes deploy', 'docker container')
    expect(ab).toBeCloseTo(ba, 10)
  })

  it('reflects domain proximity (same domain > cross domain)', () => {
    const sameDomain = engine.similarity('tcp socket port', 'dns ip packet')
    const crossDomain = engine.similarity('tcp socket port', 'react vue angular')
    expect(sameDomain).toBeGreaterThan(crossDomain)
  })
})

// ── findSimilar() ──

describe('SemanticEngine.findSimilar', () => {
  let engine: SemanticEngine
  let documents: SemanticDocument[]

  beforeEach(() => {
    engine = new SemanticEngine()
    documents = [
      { id: 'web1', text: 'React component lifecycle hooks' },
      { id: 'db1', text: 'SQL database query optimization' },
      { id: 'algo1', text: 'Binary search algorithm complexity' },
      { id: 'sec1', text: 'OAuth JWT authentication token' },
      { id: 'devops1', text: 'Docker container kubernetes deploy' },
    ]
  })

  it('returns results ranked by similarity', () => {
    const results = engine.findSimilar('database sql query', documents)
    expect(results.length).toBeGreaterThan(0)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.score).toBeGreaterThanOrEqual(results[i]!.score)
    }
  })

  it('ranks the most relevant document first', () => {
    const results = engine.findSimilar('database sql query', documents)
    expect(results[0]!.id).toBe('db1')
  })

  it('respects the limit parameter', () => {
    const results = engine.findSimilar('programming', documents, 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('returns empty array for empty documents', () => {
    const results = engine.findSimilar('anything', [])
    expect(results).toEqual([])
  })

  it('returns results with correct shape', () => {
    const results = engine.findSimilar('react web', documents)
    for (const r of results) {
      expect(r).toHaveProperty('id')
      expect(r).toHaveProperty('score')
      expect(r).toHaveProperty('text')
      expect(typeof r.id).toBe('string')
      expect(typeof r.score).toBe('number')
      expect(typeof r.text).toBe('string')
    }
  })

  it('filters results below minSimilarity', () => {
    const strictEngine = new SemanticEngine({ minSimilarity: 0.9 })
    const results = strictEngine.findSimilar('random gibberish xyzzy', documents)
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0.9)
    }
  })

  it('uses pre-computed embedding when provided', () => {
    const precomputedVec = engine.embed('SQL database query optimization')
    const docsWithEmbedding: SemanticDocument[] = [
      { id: 'pre1', text: 'SQL database query optimization', embedding: precomputedVec },
    ]
    const results = engine.findSimilar('database query', docsWithEmbedding)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.id).toBe('pre1')
  })

  it('defaults limit to 10', () => {
    const manyDocs: SemanticDocument[] = Array.from({ length: 20 }, (_, i) => ({
      id: `doc${i}`,
      text: `programming function method class object variable ${i}`,
    }))
    const results = engine.findSimilar('programming function', manyDocs)
    expect(results.length).toBeLessThanOrEqual(10)
  })
})

// ── expandQuery() ──

describe('SemanticEngine.expandQuery', () => {
  let engine: SemanticEngine

  beforeEach(() => {
    engine = new SemanticEngine()
  })

  it('includes the original query as a variant', () => {
    const expansions = engine.expandQuery('sort array')
    expect(expansions.length).toBeGreaterThanOrEqual(1)
    expect(expansions[0]).toBe('sort array')
  })

  it('produces synonym expansions for known words', () => {
    const expansions = engine.expandQuery('function error')
    // 'function' has synonyms: method, procedure, routine, subroutine
    // 'error' has synonyms: exception, fault, failure, bug
    expect(expansions.length).toBeGreaterThan(1)
    expect(expansions.some(e => e.includes('method'))).toBe(true)
  })

  it('produces multiple expansions for multi-synonym input', () => {
    const expansions = engine.expandQuery('sort array')
    // 'sort' → order, rank, arrange; 'array' → list, collection, sequence
    expect(expansions.length).toBeGreaterThan(3)
  })

  it('returns only the original for unknown words', () => {
    const expansions = engine.expandQuery('xylophone')
    expect(expansions).toHaveLength(1)
  })

  it('handles empty query', () => {
    const expansions = engine.expandQuery('')
    expect(expansions.length).toBeGreaterThanOrEqual(1)
  })

  it('does not produce duplicate expansions', () => {
    const expansions = engine.expandQuery('function method')
    const unique = new Set(expansions)
    expect(unique.size).toBe(expansions.length)
  })
})

// ── disambiguate() ──

describe('SemanticEngine.disambiguate', () => {
  let engine: SemanticEngine

  beforeEach(() => {
    engine = new SemanticEngine()
  })

  it('returns programming sense of "class" in a code context', () => {
    const sense = engine.disambiguate(
      'class',
      'define a class with methods and inheritance in Python',
    )
    expect(sense).toContain('object')
  })

  it('returns web sense of "class" in a CSS context', () => {
    const sense = engine.disambiguate('class', 'add a CSS class to the HTML element for styling')
    expect(sense).toContain('CSS')
  })

  it('returns database sense of "model" in a database context', () => {
    const sense = engine.disambiguate('model', 'database table ORM schema migration')
    expect(sense.toLowerCase()).toMatch(/data|orm|database/)
  })

  it('returns AI/ML sense of "model" in a ML context', () => {
    const sense = engine.disambiguate('model', 'training neural network prediction inference')
    expect(sense.toLowerCase()).toMatch(/train|machine|predict/)
  })

  it('returns a fallback for words without defined senses', () => {
    const sense = engine.disambiguate('xylophone', 'music instrument')
    expect(sense).toContain('xylophone')
    expect(sense).toContain('general-purpose')
  })

  it('returns different senses for different contexts of "node"', () => {
    const webSense = engine.disambiguate('node', 'javascript express server npm webpack')
    const dsSense = engine.disambiguate('node', 'linked list tree traversal graph vertex')
    expect(webSense).not.toBe(dsSense)
  })

  it('handles "hash" in security vs data-structures context', () => {
    const secSense = engine.disambiguate('hash', 'encrypt password certificate authentication')
    const dsSense = engine.disambiguate('hash', 'table array index lookup dictionary')
    expect(secSense).not.toBe(dsSense)
  })
})

// ── getVocabularySize() ──

describe('SemanticEngine.getVocabularySize', () => {
  it('returns a positive number', () => {
    const engine = new SemanticEngine()
    expect(engine.getVocabularySize()).toBeGreaterThan(0)
  })

  it('returns at least the number of vocabulary entries', () => {
    const engine = new SemanticEngine()
    // The source has ~200 pre-built word vectors
    expect(engine.getVocabularySize()).toBeGreaterThanOrEqual(100)
  })
})

// ── addWord() ──

describe('SemanticEngine.addWord', () => {
  let engine: SemanticEngine

  beforeEach(() => {
    engine = new SemanticEngine()
  })

  it('increases vocabulary size after adding a new word', () => {
    const sizeBefore = engine.getVocabularySize()
    const vec = new Array(50).fill(0)
    vec[0] = 1
    engine.addWord('brandnewword', vec)
    expect(engine.getVocabularySize()).toBe(sizeBefore + 1)
  })

  it('added word can be used in embed', () => {
    const customVec = new Array(50).fill(0)
    customVec[0] = 1
    engine.addWord('zzzcustomword', customVec)
    const emb = engine.embed('zzzcustomword')
    expect(emb.some(v => v !== 0)).toBe(true)
  })

  it('added word can influence similarity', () => {
    const customVec = engine.embed('database sql query')
    engine.addWord('mydbword', customVec)
    const sim = engine.similarity('mydbword', 'database sql query')
    expect(sim).toBeGreaterThan(0.5)
  })

  it('normalizes the added vector', () => {
    const vec = new Array(50).fill(0)
    vec[0] = 10
    vec[1] = 10
    engine.addWord('testnorm', vec)
    const emb = engine.embed('testnorm')
    const magnitude = Math.sqrt(emb.reduce((sum, v) => sum + v * v, 0))
    expect(magnitude).toBeCloseTo(1, 4)
  })

  it('stores word in lowercase', () => {
    const vec = new Array(50).fill(0)
    vec[0] = 1
    engine.addWord('MyUpperCaseWord', vec)
    // Embedding uses lowercase tokenization, so it should find the word
    const emb = engine.embed('myuppercaseword')
    expect(emb.some(v => v !== 0)).toBe(true)
  })
})
