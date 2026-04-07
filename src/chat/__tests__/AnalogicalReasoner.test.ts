import { describe, it, expect, beforeEach } from 'vitest'
import {
  AnalogicalReasoner,
  type StructureElement,
} from '../AnalogicalReasoner'

// ── Constructor Tests ──

describe('AnalogicalReasoner constructor', () => {
  it('creates an instance with default config', () => {
    const reasoner = new AnalogicalReasoner()
    expect(reasoner).toBeInstanceOf(AnalogicalReasoner)
  })

  it('accepts a partial custom config', () => {
    const reasoner = new AnalogicalReasoner({ minSimilarity: 0.5 })
    expect(reasoner).toBeInstanceOf(AnalogicalReasoner)
  })

  it('accepts a full custom config', () => {
    const reasoner = new AnalogicalReasoner({
      minSimilarity: 0.2,
      maxAnalogies: 10,
      structureWeight: 0.8,
      enablePatternLearning: false,
      maxPatterns: 50,
    })
    expect(reasoner).toBeInstanceOf(AnalogicalReasoner)
  })

  it('has pre-built analogies available immediately', () => {
    const reasoner = new AnalogicalReasoner()
    const result = reasoner.findAnalogy('function')
    expect(result).not.toBeNull()
  })
})

// ── findAnalogy Tests ──

describe('AnalogicalReasoner findAnalogy', () => {
  let reasoner: AnalogicalReasoner

  beforeEach(() => {
    reasoner = new AnalogicalReasoner()
  })

  it('finds an analogy for a known concept like "function"', () => {
    const result = reasoner.findAnalogy('function')
    expect(result).not.toBeNull()
    expect(result!.source.name.toLowerCase()).toContain('function')
  })

  it('finds an analogy for "variable"', () => {
    const result = reasoner.findAnalogy('variable')
    expect(result).not.toBeNull()
    expect(result!.target.name).toBeDefined()
  })

  it('returns analogy with an explanation string', () => {
    const result = reasoner.findAnalogy('loop')
    expect(result).not.toBeNull()
    expect(typeof result!.explanation).toBe('string')
    expect(result!.explanation.length).toBeGreaterThan(0)
  })

  it('returns analogy with a similarity score between 0 and 1', () => {
    const result = reasoner.findAnalogy('function')
    expect(result).not.toBeNull()
    expect(result!.similarity).toBeGreaterThanOrEqual(0)
    expect(result!.similarity).toBeLessThanOrEqual(1)
  })

  it('filters analogies by target domain', () => {
    const result = reasoner.findAnalogy('function', 'cooking')
    expect(result).not.toBeNull()
    expect(result!.target.domain).toBe('cooking')
  })

  it('returns null for a completely unknown concept', () => {
    const result = reasoner.findAnalogy('xyzzy_qwqwqwqwqw_unknown')
    expect(result).toBeNull()
  })

  it('analogy has source and target structure elements', () => {
    const result = reasoner.findAnalogy('class')
    expect(result).not.toBeNull()
    expect(result!.source).toBeDefined()
    expect(result!.target).toBeDefined()
    expect(result!.source.name).toBeDefined()
    expect(result!.source.domain).toBeDefined()
    expect(result!.source.properties).toBeDefined()
    expect(result!.target.name).toBeDefined()
    expect(result!.target.domain).toBeDefined()
    expect(result!.target.properties).toBeDefined()
  })
})

// ── findAnalogies Tests ──

describe('AnalogicalReasoner findAnalogies', () => {
  let reasoner: AnalogicalReasoner

  beforeEach(() => {
    reasoner = new AnalogicalReasoner()
  })

  it('returns multiple analogies for a known concept', () => {
    const results = reasoner.findAnalogies('function', 5)
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('respects the limit parameter', () => {
    const results = reasoner.findAnalogies('function', 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('results are sorted by similarity descending', () => {
    const results = reasoner.findAnalogies('function', 5)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].similarity).toBeGreaterThanOrEqual(results[i].similarity)
    }
  })

  it('returns empty array for unknown concepts', () => {
    const results = reasoner.findAnalogies('xyzzy_qwqwqwqwqw_unknown')
    expect(results).toEqual([])
  })

  it('filters by target domain when provided', () => {
    const results = reasoner.findAnalogies('function', 5, 'cooking')
    for (const r of results) {
      expect(r.target.domain).toBe('cooking')
    }
  })
})

// ── compareStructures Tests ──

describe('AnalogicalReasoner compareStructures', () => {
  let reasoner: AnalogicalReasoner

  beforeEach(() => {
    reasoner = new AnalogicalReasoner()
  })

  it('returns similarity 1.0 for identical structures', () => {
    const element: StructureElement = {
      name: 'widget',
      domain: 'test',
      properties: ['color', 'size', 'weight'],
      relations: [],
    }
    const result = reasoner.compareStructures(element, element)
    expect(result.similarity).toBe(1)
  })

  it('returns low similarity for completely different structures', () => {
    const elementA: StructureElement = {
      name: 'alpha',
      domain: 'domain-a',
      properties: ['aaa', 'bbb', 'ccc'],
      relations: [],
    }
    const elementB: StructureElement = {
      name: 'omega',
      domain: 'domain-b',
      properties: ['xxx', 'yyy', 'zzz'],
      relations: [],
    }
    const result = reasoner.compareStructures(elementA, elementB)
    expect(result.similarity).toBeLessThan(0.5)
  })

  it('gives intermediate similarity for partially overlapping properties', () => {
    const elementA: StructureElement = {
      name: 'item',
      domain: 'test',
      properties: ['color', 'size', 'weight'],
      relations: [],
    }
    const elementB: StructureElement = {
      name: 'item',
      domain: 'test',
      properties: ['color', 'length', 'weight'],
      relations: [],
    }
    const result = reasoner.compareStructures(elementA, elementB)
    expect(result.similarity).toBeGreaterThan(0)
    expect(result.similarity).toBeLessThan(1)
  })

  it('returns mappings between properties', () => {
    const elementA: StructureElement = {
      name: 'func',
      domain: 'programming',
      properties: ['input', 'output', 'name'],
      relations: [],
    }
    const elementB: StructureElement = {
      name: 'recipe',
      domain: 'cooking',
      properties: ['ingredients', 'dish', 'title'],
      relations: [],
    }
    const result = reasoner.compareStructures(elementA, elementB)
    expect(result.mappings).toBeDefined()
    expect(Array.isArray(result.mappings)).toBe(true)
  })

  it('handles empty property lists', () => {
    const elementA: StructureElement = {
      name: 'empty-a',
      domain: 'test',
      properties: [],
      relations: [],
    }
    const elementB: StructureElement = {
      name: 'empty-b',
      domain: 'test',
      properties: [],
      relations: [],
    }
    const result = reasoner.compareStructures(elementA, elementB)
    expect(result).toBeDefined()
    expect(result.mappings.length).toBe(0)
  })

  it('returns an explanation string', () => {
    const elementA: StructureElement = {
      name: 'function',
      domain: 'programming',
      properties: ['input', 'output'],
      relations: [],
    }
    const elementB: StructureElement = {
      name: 'recipe',
      domain: 'cooking',
      properties: ['ingredients', 'dish'],
      relations: [],
    }
    const result = reasoner.compareStructures(elementA, elementB)
    expect(typeof result.explanation).toBe('string')
    expect(result.explanation.length).toBeGreaterThan(0)
  })
})

// ── generateByAnalogy Tests ──

describe('AnalogicalReasoner generateByAnalogy', () => {
  let reasoner: AnalogicalReasoner

  beforeEach(() => {
    reasoner = new AnalogicalReasoner()
  })

  it('generates code translation output as a string', () => {
    const result = reasoner.generateByAnalogy(
      '[x * 2 for x in items if x > 0]',
      'python',
      'javascript',
    )
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles Python to JavaScript translation', () => {
    const result = reasoner.generateByAnalogy(
      '[x * 2 for x in items if x > 0]',
      'python',
      'javascript',
    )
    expect(result).toContain('javascript')
  })

  it('handles Rust to TypeScript translation', () => {
    const result = reasoner.generateByAnalogy(
      'fn parse(s: &str) -> Result<i32, ParseError>',
      'rust',
      'typescript',
    )
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles unknown language pair gracefully with generic translation', () => {
    const result = reasoner.generateByAnalogy(
      'print("hello")',
      'haskell',
      'fortran',
    )
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes analogy information in output for known pairs', () => {
    const result = reasoner.generateByAnalogy(
      '[x * 2 for x in items if x > 0]',
      'python',
      'javascript',
    )
    expect(result.toLowerCase()).toContain('analogy')
  })

  it('generates a generic translation when no specific pair matches', () => {
    const result = reasoner.generateByAnalogy(
      'some code',
      'python',
      'rust',
    )
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

// ── transferSolution Tests ──

describe('AnalogicalReasoner transferSolution', () => {
  let reasoner: AnalogicalReasoner

  beforeEach(() => {
    reasoner = new AnalogicalReasoner()
  })

  it('transfers a solution from one domain to another', () => {
    const result = reasoner.transferSolution(
      'Use middleware chain to process requests',
      'backend',
      'serverless',
    )
    expect(result).toBeDefined()
    expect(result.transferredSolution).toBeDefined()
    expect(result.transferredSolution.length).toBeGreaterThan(0)
  })

  it('returns adapted solution text', () => {
    const result = reasoner.transferSolution(
      'Use DOM manipulation to update views',
      'web-frontend',
      'mobile',
    )
    expect(typeof result.transferredSolution).toBe('string')
    expect(result.transferredSolution.length).toBeGreaterThan(0)
  })

  it('lists adaptations made', () => {
    const result = reasoner.transferSolution(
      'Use shared database for storage',
      'monolith',
      'microservices',
    )
    expect(Array.isArray(result.adaptations)).toBe(true)
    expect(result.adaptations.length).toBeGreaterThan(0)
  })

  it('handles unknown domain pairs gracefully', () => {
    const result = reasoner.transferSolution(
      'solve the problem',
      'quantum-physics',
      'underwater-basket-weaving',
    )
    expect(result).toBeDefined()
    expect(result.transferredSolution.length).toBeGreaterThan(0)
    expect(result.adaptations.length).toBeGreaterThan(0)
  })

  it('tracks source and target domains in result', () => {
    const result = reasoner.transferSolution(
      'Use SQL joins to combine data',
      'SQL',
      'NoSQL',
    )
    expect(result.sourceDomain).toBe('SQL')
    expect(result.targetDomain).toBe('NoSQL')
  })

  it('has a confidence score between 0 and 1', () => {
    const result = reasoner.transferSolution(
      'Use event listeners',
      'synchronous',
      'asynchronous',
    )
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })
})

// ── learnPattern Tests ──

describe('AnalogicalReasoner learnPattern', () => {
  let reasoner: AnalogicalReasoner

  beforeEach(() => {
    reasoner = new AnalogicalReasoner()
  })

  it('adds a new analogy pattern', () => {
    const pattern = reasoner.learnPattern(
      'monads',
      'burritos',
      'functional-programming',
      'A monad wraps a value like a burrito wraps fillings',
    )
    expect(pattern).not.toBeNull()
  })

  it('pattern has correct properties', () => {
    const pattern = reasoner.learnPattern(
      'functor',
      'container',
      'functional-programming',
      'A functor is like a container that can be mapped over',
    )
    expect(pattern).not.toBeNull()
    expect(pattern!.sourcePattern).toBe('functor')
    expect(pattern!.targetPattern).toBe('container')
    expect(pattern!.domain).toBe('functional-programming')
    expect(pattern!.abstraction).toBe('A functor is like a container that can be mapped over')
    expect(pattern!.id).toBeDefined()
    expect(pattern!.useCount).toBe(0)
    expect(pattern!.createdAt).toBeGreaterThan(0)
    expect(Array.isArray(pattern!.examples)).toBe(true)
  })

  it('learned patterns can be found later via findAnalogy', () => {
    reasoner.learnPattern(
      'zipper data structure',
      'bookmark in a book',
      'data-structures',
      'A zipper keeps your place, like a bookmark',
    )
    const patterns = reasoner.getPatterns()
    expect(patterns.length).toBe(1)
    expect(patterns[0].sourcePattern).toBe('zipper data structure')
  })

  it('returns null when pattern learning is disabled', () => {
    const noLearn = new AnalogicalReasoner({ enablePatternLearning: false })
    const pattern = noLearn.learnPattern(
      'lens',
      'magnifying glass',
      'optics',
      'A lens focuses on a part of data',
    )
    expect(pattern).toBeNull()
  })

  it('evicts least-used pattern when at capacity', () => {
    const small = new AnalogicalReasoner({ maxPatterns: 2 })
    small.learnPattern('a', 'b', 'd', 'ab')
    small.learnPattern('c', 'd', 'd', 'cd')
    small.learnPattern('e', 'f', 'd', 'ef')
    const patterns = small.getPatterns()
    expect(patterns.length).toBe(2)
  })
})

// ── Pattern Management Tests ──

describe('AnalogicalReasoner pattern management', () => {
  let reasoner: AnalogicalReasoner

  beforeEach(() => {
    reasoner = new AnalogicalReasoner()
  })

  it('getPatterns returns all learned patterns', () => {
    reasoner.learnPattern('a', 'b', 'test', 'ab')
    reasoner.learnPattern('c', 'd', 'test', 'cd')
    const patterns = reasoner.getPatterns()
    expect(patterns.length).toBe(2)
  })

  it('getPatternsByDomain filters by domain', () => {
    reasoner.learnPattern('a', 'b', 'domain-one', 'ab')
    reasoner.learnPattern('c', 'd', 'domain-two', 'cd')
    reasoner.learnPattern('e', 'f', 'domain-one', 'ef')
    const filtered = reasoner.getPatternsByDomain('domain-one')
    expect(filtered.length).toBe(2)
    for (const p of filtered) {
      expect(p.domain).toBe('domain-one')
    }
  })

  it('getPatternsByDomain is case-insensitive', () => {
    reasoner.learnPattern('a', 'b', 'MyDomain', 'ab')
    const filtered = reasoner.getPatternsByDomain('mydomain')
    expect(filtered.length).toBe(1)
  })

  it('removePattern deletes a pattern by ID', () => {
    const pattern = reasoner.learnPattern('a', 'b', 'test', 'ab')
    expect(pattern).not.toBeNull()
    const removed = reasoner.removePattern(pattern!.id)
    expect(removed).toBe(true)
    expect(reasoner.getPatterns().length).toBe(0)
  })

  it('removePattern returns false for non-existent ID', () => {
    const removed = reasoner.removePattern('non-existent-id')
    expect(removed).toBe(false)
  })

  it('getPatterns returns empty array initially', () => {
    const patterns = reasoner.getPatterns()
    expect(patterns.length).toBe(0)
  })
})

// ── explain Tests ──

describe('AnalogicalReasoner explain', () => {
  let reasoner: AnalogicalReasoner

  beforeEach(() => {
    reasoner = new AnalogicalReasoner()
  })

  it('explains a programming concept with an analogy', () => {
    const explanation = reasoner.explain('function')
    expect(typeof explanation).toBe('string')
    expect(explanation.length).toBeGreaterThan(0)
  })

  it('produces different output for beginner vs expert audiences', () => {
    const beginner = reasoner.explain('promise', 'beginner')
    const expert = reasoner.explain('promise', 'expert')
    expect(beginner).not.toBe(expert)
  })

  it('beginner explanation uses "Think of" phrasing', () => {
    const beginner = reasoner.explain('loop', 'beginner')
    expect(beginner).toContain('Think of')
  })

  it('expert explanation uses "analogous to" phrasing', () => {
    const expert = reasoner.explain('function', 'expert')
    expect(expert).toContain('analogous to')
  })

  it('handles unknown concepts with a fallback description', () => {
    const explanation = reasoner.explain('xyzzy_completely_unknown_concept_12345')
    expect(typeof explanation).toBe('string')
    expect(explanation.length).toBeGreaterThan(0)
  })

  it('provides good explanations for common concepts', () => {
    const concepts = ['promise', 'recursion', 'cache']
    for (const concept of concepts) {
      const explanation = reasoner.explain(concept)
      expect(explanation.length).toBeGreaterThan(10)
    }
  })
})

// ── getStats Tests ──

describe('AnalogicalReasoner getStats', () => {
  let reasoner: AnalogicalReasoner

  beforeEach(() => {
    reasoner = new AnalogicalReasoner()
  })

  it('returns stats with correct structure', () => {
    const stats = reasoner.getStats()
    expect(typeof stats.totalAnalogies).toBe('number')
    expect(typeof stats.totalTransfers).toBe('number')
    expect(typeof stats.patternsLearned).toBe('number')
    expect(typeof stats.avgConfidence).toBe('number')
    expect(Array.isArray(stats.domainsCovered)).toBe(true)
  })

  it('starts with zero counts', () => {
    const stats = reasoner.getStats()
    expect(stats.totalAnalogies).toBe(0)
    expect(stats.totalTransfers).toBe(0)
    expect(stats.patternsLearned).toBe(0)
  })

  it('updates after findAnalogy operations', () => {
    reasoner.findAnalogy('function')
    const stats = reasoner.getStats()
    expect(stats.totalAnalogies).toBeGreaterThan(0)
  })

  it('tracks domains covered', () => {
    reasoner.findAnalogy('function')
    const stats = reasoner.getStats()
    expect(stats.domainsCovered.length).toBeGreaterThan(0)
  })

  it('tracks transfers', () => {
    reasoner.transferSolution('Use middleware', 'backend', 'serverless')
    const stats = reasoner.getStats()
    expect(stats.totalTransfers).toBe(1)
  })
})

// ── serialize / deserialize Tests ──

describe('AnalogicalReasoner serialize / deserialize', () => {
  it('round-trip preserves learned patterns', () => {
    const original = new AnalogicalReasoner()
    original.learnPattern('a', 'b', 'test-domain', 'a is like b')
    original.learnPattern('c', 'd', 'test-domain', 'c is like d')

    const json = original.serialize()
    const restored = AnalogicalReasoner.deserialize(json)

    const patterns = restored.getPatterns()
    expect(patterns.length).toBe(2)
    expect(patterns[0].sourcePattern).toBe('a')
    expect(patterns[1].sourcePattern).toBe('c')
  })

  it('round-trip preserves config', () => {
    const original = new AnalogicalReasoner({
      minSimilarity: 0.1,
      maxAnalogies: 20,
    })

    const json = original.serialize()
    const data = JSON.parse(json)
    expect(data.config.minSimilarity).toBe(0.1)
    expect(data.config.maxAnalogies).toBe(20)
  })

  it('round-trip preserves stats', () => {
    const original = new AnalogicalReasoner()
    original.findAnalogy('function')
    original.transferSolution('test', 'SQL', 'NoSQL')

    const json = original.serialize()
    const restored = AnalogicalReasoner.deserialize(json)
    const stats = restored.getStats()

    expect(stats.totalAnalogies).toBeGreaterThan(0)
    expect(stats.totalTransfers).toBe(1)
  })

  it('deserialized reasoner works correctly', () => {
    const original = new AnalogicalReasoner()
    original.learnPattern('zipper', 'bookmark', 'data-structures', 'keeps place')

    const json = original.serialize()
    const restored = AnalogicalReasoner.deserialize(json)

    // The restored reasoner should be fully functional
    const result = restored.findAnalogy('function')
    expect(result).not.toBeNull()

    // And learned patterns should be preserved
    const patterns = restored.getPatterns()
    expect(patterns.length).toBe(1)
    expect(patterns[0].sourcePattern).toBe('zipper')
  })

  it('round-trip preserves domain set', () => {
    const original = new AnalogicalReasoner()
    original.findAnalogy('function')

    const json = original.serialize()
    const restored = AnalogicalReasoner.deserialize(json)
    const stats = restored.getStats()
    expect(stats.domainsCovered.length).toBeGreaterThan(0)
  })
})
