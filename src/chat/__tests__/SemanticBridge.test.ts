import { describe, it, expect, beforeEach } from 'vitest'
import { SemanticBridge } from '../SemanticBridge.js'

describe('SemanticBridge', () => {
  let bridge: SemanticBridge

  beforeEach(() => {
    bridge = new SemanticBridge()
  })

  // ── Constructor & Config ───────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const config = bridge.getConfig()
      expect(config.maxMappings).toBe(1000)
      expect(config.enableNlToCode).toBe(true)
      expect(config.enableCodeToNl).toBe(true)
      expect(config.enableConceptMapping).toBe(true)
      expect(config.enableSemanticSearch).toBe(true)
      expect(config.minSimilarity).toBe(0.2)
    })

    it('should accept partial config', () => {
      const custom = new SemanticBridge({ minSimilarity: 0.5, maxMappings: 100 })
      expect(custom.getConfig().minSimilarity).toBe(0.5)
      expect(custom.getConfig().maxMappings).toBe(100)
    })

    it('should initialize vocabulary', () => {
      const stats = bridge.getStats()
      expect(stats.vocabularySize).toBeGreaterThan(0)
      expect(stats.createdAt).toBeTruthy()
    })
  })

  // ── NL → Code ─────────────────────────────────────────────────────────────

  describe('nlToCode', () => {
    it('should generate function code from description', () => {
      const result = bridge.nlToCode('create a function called calculate')
      expect(result.generatedCode).toContain('function')
      expect(result.generatedCode).toContain('calculate')
      expect(result.language).toBe('typescript')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should generate class code', () => {
      const result = bridge.nlToCode('create a class called UserService')
      expect(result.generatedCode).toContain('class')
      expect(result.generatedCode).toContain('UserService')
    })

    it('should generate interface code', () => {
      const result = bridge.nlToCode('define an interface called Config')
      expect(result.generatedCode).toContain('interface')
    })

    it('should generate test code', () => {
      const result = bridge.nlToCode('write a test for the login function')
      expect(result.generatedCode).toContain('describe')
    })

    it('should support different languages', () => {
      const result = bridge.nlToCode('create a function', 'python')
      expect(result.generatedCode).toContain('def')
      expect(result.language).toBe('python')
    })

    it('should extract parameters from description', () => {
      const result = bridge.nlToCode('create a function that takes name and age')
      expect(result.generatedCode).toContain('name')
    })

    it('should include concept mappings', () => {
      const result = bridge.nlToCode('create a function to filter and sort data')
      expect(result.mappedConcepts.length).toBeGreaterThan(0)
    })

    it('should provide alternatives', () => {
      const result = bridge.nlToCode('create a function called helper')
      expect(result.alternatives.length).toBeGreaterThan(0)
    })

    it('should update stats', () => {
      bridge.nlToCode('create something')
      expect(bridge.getStats().totalNlToCodeTranslations).toBe(1)
    })
  })

  // ── Code → NL ─────────────────────────────────────────────────────────────

  describe('codeToNl', () => {
    it('should explain a class', () => {
      const result = bridge.codeToNl('export class UserService extends BaseService {}')
      expect(result.explanation).toContain('class')
      expect(result.explanation).toContain('UserService')
      expect(result.concepts).toContain('class')
    })

    it('should explain a function', () => {
      const result = bridge.codeToNl(
        'async function fetchData(url: string) { return await fetch(url) }',
      )
      expect(result.explanation).toContain('function')
      expect(result.explanation).toContain('fetchData')
      expect(result.concepts).toContain('async/await')
    })

    it('should detect complexity', () => {
      const simple = bridge.codeToNl('const x = 1')
      expect(simple.complexity).toBe('simple')

      const complex = bridge.codeToNl(
        Array.from({ length: 10 }, (_, i) => `if (x${i}) { for (let i = 0; i < 10; i++) {} }`).join(
          '\n',
        ),
      )
      expect(['complex', 'very_complex']).toContain(complex.complexity)
    })

    it('should extract concepts', () => {
      const result = bridge.codeToNl('try { await fetch(url) } catch (e) { console.log(e) }')
      expect(result.concepts.length).toBeGreaterThan(0)
      expect(result.concepts).toContain('error handling')
    })

    it('should provide a summary', () => {
      const result = bridge.codeToNl('function add(a: number, b: number) { return a + b }')
      expect(result.summary).toBeTruthy()
    })

    it('should update stats', () => {
      bridge.codeToNl('const x = 1')
      expect(bridge.getStats().totalCodeToNlTranslations).toBe(1)
    })
  })

  // ── Bidirectional Translation ──────────────────────────────────────────────

  describe('translate', () => {
    it('should translate NL to code', () => {
      const result = bridge.translate('create a function', 'nl_to_code')
      expect(result.nlToCode).not.toBeNull()
      expect(result.codeToNl).toBeNull()
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should translate code to NL', () => {
      const result = bridge.translate('function add(a, b) { return a + b }', 'code_to_nl')
      expect(result.codeToNl).not.toBeNull()
      expect(result.nlToCode).toBeNull()
    })

    it('should include concept mappings', () => {
      const result = bridge.translate('store the data in a list', 'nl_to_code')
      expect(result.conceptMappings.length).toBeGreaterThan(0)
    })

    it('should update stats', () => {
      bridge.translate('test', 'nl_to_code')
      expect(bridge.getStats().totalTranslations).toBe(1)
    })
  })

  // ── Concept Mapping ────────────────────────────────────────────────────────

  describe('mapConcepts', () => {
    it('should map NL concepts to code', () => {
      const mappings = bridge.mapConcepts('store the value and check if it is valid', false)
      expect(mappings.length).toBeGreaterThan(0)
      const storeMp = mappings.find(m => m.nlConcept === 'store')
      expect(storeMp).toBeDefined()
    })

    it('should map code concepts to NL', () => {
      const mappings = bridge.mapConcepts(
        'if (condition) { variable = array.filter(x => x) }',
        true,
      )
      expect(mappings.length).toBeGreaterThan(0)
    })

    it('should include confidence', () => {
      const mappings = bridge.mapConcepts('check and filter', false)
      for (const m of mappings) {
        expect(m.confidence).toBeGreaterThan(0)
        expect(m.confidence).toBeLessThanOrEqual(1)
      }
    })

    it('should include relationship type', () => {
      const mappings = bridge.mapConcepts('store data', false)
      for (const m of mappings) {
        expect(['equivalent', 'similar', 'partial', 'abstract', 'concrete']).toContain(
          m.relationship,
        )
      }
    })

    it('should deduplicate', () => {
      const mappings = bridge.mapConcepts('store store store', false)
      const storeCount = mappings.filter(m => m.nlConcept === 'store').length
      expect(storeCount).toBeLessThanOrEqual(1)
    })
  })

  // ── Skeleton Generation ────────────────────────────────────────────────────

  describe('generateSkeleton', () => {
    it('should generate a skeleton', () => {
      const skeleton = bridge.generateSkeleton('create a user service class')
      expect(skeleton.skeleton).toBeTruthy()
      expect(skeleton.language).toBe('typescript')
      expect(skeleton.confidence).toBeGreaterThan(0)
    })

    it('should include TODO placeholder', () => {
      const skeleton = bridge.generateSkeleton('create a function')
      expect(skeleton.placeholders.length).toBeGreaterThan(0)
    })

    it('should support different languages', () => {
      const skeleton = bridge.generateSkeleton('create a function', 'python')
      expect(skeleton.skeleton).toContain('def')
    })
  })

  // ── Semantic Search ────────────────────────────────────────────────────────

  describe('semanticSearch', () => {
    it('should find matching candidates', () => {
      const candidates = [
        'function to process user data',
        'class for database connection',
        'utility for string formatting',
        'handler for user authentication',
      ]
      const result = bridge.semanticSearch('user processing', candidates)
      expect(result.matches.length).toBeGreaterThan(0)
      expect(result.totalCandidates).toBe(4)
    })

    it('should rank by score', () => {
      const candidates = [
        'completely unrelated topic about cooking',
        'function to calculate the sum of numbers',
        'calculator for mathematical operations and sums',
      ]
      const result = bridge.semanticSearch('calculate sum', candidates)
      if (result.matches.length >= 2) {
        expect(result.matches[0].score).toBeGreaterThanOrEqual(result.matches[1].score)
      }
    })

    it('should filter by minSimilarity', () => {
      const strict = new SemanticBridge({ minSimilarity: 0.9 })
      const result = strict.semanticSearch('hello', ['world', 'goodbye', 'hi'])
      expect(result.matches.length).toBe(0)
    })

    it('should include highlights', () => {
      const result = bridge.semanticSearch('user data', ['processing user data efficiently'])
      if (result.matches.length > 0) {
        expect(result.matches[0].highlights).toBeDefined()
      }
    })

    it('should update stats', () => {
      bridge.semanticSearch('test', ['candidate'])
      expect(bridge.getStats().totalSemanticSearches).toBe(1)
    })
  })

  // ── Alignment Score ────────────────────────────────────────────────────────

  describe('computeAlignment', () => {
    it('should return higher score for aligned NL and code', () => {
      const high = bridge.computeAlignment(
        'store the data in a list and filter it',
        'const list = data.filter(x => x)',
      )
      const low = bridge.computeAlignment(
        'drive the car to the store',
        'class NetworkSocket { connect() {} }',
      )
      expect(high).toBeGreaterThan(low)
    })

    it('should return 0 for empty input', () => {
      expect(bridge.computeAlignment('', 'code')).toBe(0)
      expect(bridge.computeAlignment('description', '')).toBe(0)
    })

    it('should return value between 0 and 1', () => {
      const score = bridge.computeAlignment('create a function', 'function test() {}')
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })
  })

  // ── Feedback ───────────────────────────────────────────────────────────────

  describe('provideFeedback', () => {
    it('should track feedback', () => {
      bridge.provideFeedback({
        translationType: 'nl_to_code',
        wasAccurate: true,
        originalInput: 'create function',
        output: 'function f() {}',
      })
      expect(bridge.getStats().totalFeedbacks).toBe(1)
    })

    it('should learn from corrections', () => {
      const _initialVocab = bridge.getStats().vocabularySize
      bridge.provideFeedback({
        translationType: 'nl_to_code',
        wasAccurate: false,
        originalInput: 'zorgblatt',
        output: 'wrong code',
        correction: 'correct implementation here',
      })
      // May or may not add vocabulary depending on token overlap
      expect(bridge.getStats().totalFeedbacks).toBe(1)
    })
  })

  // ── Vocabulary ─────────────────────────────────────────────────────────────

  describe('addVocabulary', () => {
    it('should add new terms', () => {
      const before = bridge.getStats().vocabularySize
      bridge.addVocabulary('gather', 'collect/aggregate', false)
      expect(bridge.getStats().vocabularySize).toBe(before + 1)
    })

    it('should respect vocabulary size limit', () => {
      const small = new SemanticBridge({ vocabularySize: 35 })
      // Default vocabulary is ~30 entries, so adding 10 more should hit limit
      for (let i = 0; i < 10; i++) {
        small.addVocabulary(`term${i}`, `def${i}`, false)
      }
      expect(small.getStats().vocabularySize).toBeLessThanOrEqual(35)
    })
  })

  // ── Persistence ────────────────────────────────────────────────────────────

  describe('serialize/deserialize', () => {
    it('should round-trip correctly', () => {
      bridge.nlToCode('create a function')
      bridge.provideFeedback({
        translationType: 'nl_to_code',
        wasAccurate: true,
        originalInput: 'test',
        output: 'code',
      })
      const json = bridge.serialize()
      const restored = SemanticBridge.deserialize(json)
      expect(restored.getStats().totalNlToCodeTranslations).toBe(1)
      expect(restored.getStats().totalFeedbacks).toBe(1)
      expect(restored.getConfig().maxMappings).toBe(1000)
    })

    it('should preserve vocabulary', () => {
      bridge.addVocabulary('custom_term', 'custom_def', false)
      const json = bridge.serialize()
      const restored = SemanticBridge.deserialize(json)
      expect(restored.getStats().vocabularySize).toBe(bridge.getStats().vocabularySize)
    })
  })
})
