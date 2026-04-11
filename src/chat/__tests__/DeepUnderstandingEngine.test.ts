import { describe, it, expect, beforeEach } from 'vitest'
import { DeepUnderstandingEngine, type ConversationTurn } from '../DeepUnderstandingEngine'

// ── Constructor Tests ──

describe('DeepUnderstandingEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new DeepUnderstandingEngine()
    expect(engine).toBeInstanceOf(DeepUnderstandingEngine)
  })

  it('accepts a partial custom config', () => {
    const engine = new DeepUnderstandingEngine({ ambiguityThreshold: 0.8 })
    expect(engine).toBeInstanceOf(DeepUnderstandingEngine)
  })

  it('accepts a full custom config', () => {
    const engine = new DeepUnderstandingEngine({
      maxVocabularySize: 500,
      embeddingDimension: 30,
      ambiguityThreshold: 0.6,
      intentConfidenceThreshold: 0.4,
      maxContextTurns: 5,
      enableSimilarity: true,
      enableAmbiguityDetection: true,
      enableContextClassification: true,
    })
    expect(engine).toBeInstanceOf(DeepUnderstandingEngine)
  })

  it('has vocabulary available immediately after construction', () => {
    const engine = new DeepUnderstandingEngine()
    const score = engine.computeSimilarity('javascript', 'typescript')
    expect(typeof score).toBe('number')
  })
})

// ── computeSimilarity Tests ──

describe('DeepUnderstandingEngine computeSimilarity', () => {
  let engine: DeepUnderstandingEngine

  beforeEach(() => {
    engine = new DeepUnderstandingEngine()
  })

  it('returns a number between 0 and 1', () => {
    const score = engine.computeSimilarity('write a function', 'create a method')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })

  it('returns 1 for identical text', () => {
    const score = engine.computeSimilarity('build a REST API', 'build a REST API')
    expect(score).toBeCloseTo(1, 1)
  })

  it('returns a higher score for semantically similar texts', () => {
    const similar = engine.computeSimilarity('write a function', 'create a method')
    const dissimilar = engine.computeSimilarity('write a function', 'deploy to production')
    expect(similar).toBeGreaterThan(dissimilar)
  })

  it('handles empty strings gracefully', () => {
    const score = engine.computeSimilarity('', '')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})

// ── findSimilarPhrases Tests ──

describe('DeepUnderstandingEngine findSimilarPhrases', () => {
  let engine: DeepUnderstandingEngine

  beforeEach(() => {
    engine = new DeepUnderstandingEngine()
  })

  it('returns results sorted by score descending', () => {
    const candidates = [
      'build a REST API',
      'write a function in JavaScript',
      'deploy to production',
      'create an Express endpoint',
    ]
    const results = engine.findSimilarPhrases('write a REST endpoint', candidates)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  it('respects the topK parameter', () => {
    const candidates = ['a', 'b', 'c', 'd', 'e', 'f']
    const results = engine.findSimilarPhrases('test', candidates, 3)
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('each match has text, score, and index', () => {
    const candidates = ['react component', 'angular service']
    const results = engine.findSimilarPhrases('build a component', candidates)
    for (const r of results) {
      expect(typeof r.text).toBe('string')
      expect(typeof r.score).toBe('number')
      expect(typeof r.index).toBe('number')
    }
  })

  it('defaults topK to 5', () => {
    const candidates = Array.from({ length: 10 }, (_, i) => `candidate ${i}`)
    const results = engine.findSimilarPhrases('candidate', candidates)
    expect(results.length).toBe(5)
  })
})

// ── parseIntents Tests ──

describe('DeepUnderstandingEngine parseIntents', () => {
  let engine: DeepUnderstandingEngine

  beforeEach(() => {
    engine = new DeepUnderstandingEngine()
  })

  it('detects a code_write intent', () => {
    const intents = engine.parseIntents('Write a function to sort an array')
    const codeWrite = intents.find(i => i.type === 'code_write')
    expect(codeWrite).toBeDefined()
    expect(codeWrite!.confidence).toBeGreaterThan(0)
  })

  it('detects an explain intent', () => {
    const intents = engine.parseIntents('Explain how closures work in JavaScript')
    const explain = intents.find(i => i.type === 'explain')
    expect(explain).toBeDefined()
  })

  it('detects multiple intents in a compound message', () => {
    const intents = engine.parseIntents('Write a REST API and explain JWT authentication')
    expect(intents.length).toBeGreaterThanOrEqual(2)
  })

  it('returns intents sorted by confidence descending', () => {
    const intents = engine.parseIntents('Review this code and find bugs')
    for (let i = 1; i < intents.length; i++) {
      expect(intents[i - 1].confidence).toBeGreaterThanOrEqual(intents[i].confidence)
    }
  })

  it('filters out intents below confidence threshold', () => {
    const strictEngine = new DeepUnderstandingEngine({ intentConfidenceThreshold: 0.9 })
    const intents = strictEngine.parseIntents('hello')
    for (const intent of intents) {
      expect(intent.confidence).toBeGreaterThanOrEqual(0.9)
    }
  })

  it('detects a greeting intent', () => {
    const intents = engine.parseIntents('Hello!')
    const greeting = intents.find(i => i.type === 'greeting')
    expect(greeting).toBeDefined()
  })
})

// ── detectAmbiguity Tests ──

describe('DeepUnderstandingEngine detectAmbiguity', () => {
  let engine: DeepUnderstandingEngine

  beforeEach(() => {
    engine = new DeepUnderstandingEngine()
  })

  it('returns an AmbiguityResult with required fields', () => {
    const result = engine.detectAmbiguity('Fix it')
    expect(typeof result.score).toBe('number')
    expect(Array.isArray(result.reasons)).toBe(true)
    expect(Array.isArray(result.clarificationQuestions)).toBe(true)
    expect(Array.isArray(result.resolvedReferences)).toBe(true)
  })

  it('detects high ambiguity for vague short messages', () => {
    const result = engine.detectAmbiguity('it')
    expect(result.score).toBeGreaterThan(0)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('detects low ambiguity for specific messages', () => {
    const result = engine.detectAmbiguity('Write a binary search function in TypeScript')
    expect(result.score).toBeLessThan(0.5)
  })

  it('generates clarification questions when above threshold', () => {
    const engine2 = new DeepUnderstandingEngine({ ambiguityThreshold: 0.1 })
    const result = engine2.detectAmbiguity('it')
    expect(result.clarificationQuestions.length).toBeGreaterThan(0)
  })

  it('resolves pronouns from conversation context', () => {
    const context: ConversationTurn[] = [
      { role: 'user', content: 'Tell me about TypeScript', timestamp: 1000 },
      {
        role: 'assistant',
        content: 'TypeScript is a typed superset of JavaScript',
        timestamp: 2000,
      },
    ]
    const result = engine.detectAmbiguity('Can you explain it more?', context)
    expect(result.resolvedReferences.length).toBeGreaterThan(0)
    expect(result.resolvedReferences[0].pronoun).toBe('it')
  })
})

// ── extractEntities Tests ──

describe('DeepUnderstandingEngine extractEntities', () => {
  let engine: DeepUnderstandingEngine

  beforeEach(() => {
    engine = new DeepUnderstandingEngine()
  })

  it('extracts programming languages', () => {
    const entities = engine.extractEntities('Write a function in TypeScript')
    const lang = entities.find(e => e.type === 'language' && e.value.toLowerCase() === 'typescript')
    expect(lang).toBeDefined()
  })

  it('extracts frameworks', () => {
    const entities = engine.extractEntities('Build a React component')
    const framework = entities.find(
      e => e.type === 'framework' && e.value.toLowerCase() === 'react',
    )
    expect(framework).toBeDefined()
  })

  it('extracts data structures', () => {
    const entities = engine.extractEntities('Implement a binary tree traversal')
    const ds = entities.find(
      e => e.type === 'data_structure' && e.value.toLowerCase() === 'binary tree',
    )
    expect(ds).toBeDefined()
  })

  it('extracts multiple entity types from a complex message', () => {
    const entities = engine.extractEntities(
      'Build a React app with TypeScript using the observer pattern',
    )
    const types = new Set(entities.map(e => e.type))
    expect(types.size).toBeGreaterThanOrEqual(2)
  })

  it('each entity has type, value, confidence, and position', () => {
    const entities = engine.extractEntities('Use Python and Django for the REST API')
    for (const e of entities) {
      expect(typeof e.type).toBe('string')
      expect(typeof e.value).toBe('string')
      expect(typeof e.confidence).toBe('number')
      expect(typeof e.position).toBe('number')
      expect(e.confidence).toBeGreaterThan(0)
      expect(e.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('returns entities sorted by position', () => {
    const entities = engine.extractEntities('Compare Python and JavaScript for web development')
    for (let i = 1; i < entities.length; i++) {
      expect(entities[i].position).toBeGreaterThanOrEqual(entities[i - 1].position)
    }
  })
})

// ── extractRelations Tests ──

describe('DeepUnderstandingEngine extractRelations', () => {
  let engine: DeepUnderstandingEngine

  beforeEach(() => {
    engine = new DeepUnderstandingEngine()
  })

  it('extracts a relation from a "with" clause', () => {
    const message = 'REST API with authentication'
    const entities = engine.extractEntities(message)
    const relations = engine.extractRelations(message, entities)
    expect(relations.length).toBeGreaterThan(0)
  })

  it('each relation has source, relation, and target', () => {
    const message = 'Build a React app with TypeScript'
    const entities = engine.extractEntities(message)
    const relations = engine.extractRelations(message, entities)
    for (const r of relations) {
      expect(typeof r.source).toBe('string')
      expect(typeof r.relation).toBe('string')
      expect(typeof r.target).toBe('string')
    }
  })

  it('returns empty array when no relations are found', () => {
    const message = 'hello'
    const entities = engine.extractEntities(message)
    const relations = engine.extractRelations(message, entities)
    expect(Array.isArray(relations)).toBe(true)
  })
})

// ── classifyWithContext Tests ──

describe('DeepUnderstandingEngine classifyWithContext', () => {
  let engine: DeepUnderstandingEngine

  beforeEach(() => {
    engine = new DeepUnderstandingEngine()
  })

  it('returns a ContextualClassification with all required fields', () => {
    const history: ConversationTurn[] = [
      { role: 'user', content: 'Tell me about sorting algorithms', timestamp: 1000 },
    ]
    const result = engine.classifyWithContext('Which one is fastest?', history)
    expect(typeof result.primaryIntent).toBe('string')
    expect(typeof result.confidence).toBe('number')
    expect(typeof result.topicContinuity).toBe('number')
    expect(typeof result.isEscalation).toBe('boolean')
    expect(Array.isArray(result.referencedEntities)).toBe(true)
  })

  it('detects escalation from frustrated language', () => {
    const history: ConversationTurn[] = [
      { role: 'user', content: 'Fix the bug in my code', timestamp: 1000 },
      { role: 'assistant', content: 'Here is a fix', timestamp: 2000 },
    ]
    const result = engine.classifyWithContext("It still doesn't work!! I'm frustrated", history)
    expect(result.isEscalation).toBe(true)
  })

  it('computes topic continuity from conversation history', () => {
    const history: ConversationTurn[] = [
      { role: 'user', content: 'Explain React hooks', timestamp: 1000 },
      {
        role: 'assistant',
        content: 'React hooks are functions that let you use state',
        timestamp: 2000,
      },
    ]
    const result = engine.classifyWithContext('Tell me more about React hooks', history)
    expect(result.topicContinuity).toBeGreaterThan(0)
  })
})

// ── understand Tests ──

describe('DeepUnderstandingEngine understand', () => {
  let engine: DeepUnderstandingEngine

  beforeEach(() => {
    engine = new DeepUnderstandingEngine()
  })

  it('returns a complete UnderstandingResult', () => {
    const result = engine.understand('Write a function in TypeScript')
    expect(Array.isArray(result.intents)).toBe(true)
    expect(Array.isArray(result.entities)).toBe(true)
    expect(Array.isArray(result.relations)).toBe(true)
    expect(result.ambiguity).toBeDefined()
    expect(typeof result.confidence).toBe('number')
    expect(typeof result.durationMs).toBe('number')
  })

  it('populates contextClassification when context is provided', () => {
    const context: ConversationTurn[] = [
      { role: 'user', content: 'Explain TypeScript generics', timestamp: 1000 },
    ]
    const result = engine.understand('Can you give an example?', context)
    expect(result.contextClassification).not.toBeNull()
  })

  it('contextClassification is null when no context is provided', () => {
    const result = engine.understand('Write a function')
    expect(result.contextClassification).toBeNull()
  })

  it('confidence is between 0 and 1', () => {
    const result = engine.understand('Build a React component with TypeScript')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('increments stats after each call', () => {
    engine.understand('Write a function in Python')
    engine.understand('Explain closures')
    const stats = engine.getStats()
    expect(stats.totalUnderstandings).toBe(2)
  })
})

// ── feedback Tests ──

describe('DeepUnderstandingEngine feedback', () => {
  let engine: DeepUnderstandingEngine

  beforeEach(() => {
    engine = new DeepUnderstandingEngine()
  })

  it('increments feedbackCount', () => {
    engine.feedback(true, 'write a function')
    engine.feedback(false, 'incorrect response')
    const stats = engine.getStats()
    expect(stats.feedbackCount).toBe(2)
  })

  it('accepts feedback without a message', () => {
    engine.feedback(true)
    expect(engine.getStats().feedbackCount).toBe(1)
  })
})

// ── getStats Tests ──

describe('DeepUnderstandingEngine getStats', () => {
  it('returns zeroed stats for a fresh engine', () => {
    const engine = new DeepUnderstandingEngine()
    const stats = engine.getStats()
    expect(stats.totalUnderstandings).toBe(0)
    expect(stats.totalIntentsDetected).toBe(0)
    expect(stats.totalEntitiesExtracted).toBe(0)
    expect(stats.totalAmbiguitiesDetected).toBe(0)
    expect(stats.totalSimilarityQueries).toBe(0)
    expect(stats.avgUnderstandingTime).toBe(0)
    expect(stats.feedbackCount).toBe(0)
  })

  it('tracks similarity queries', () => {
    const engine = new DeepUnderstandingEngine()
    engine.computeSimilarity('a', 'b')
    engine.findSimilarPhrases('q', ['a', 'b'])
    const stats = engine.getStats()
    expect(stats.totalSimilarityQueries).toBe(2)
  })
})

// ── serialize / deserialize Tests ──

describe('DeepUnderstandingEngine serialize and deserialize', () => {
  it('round-trips stats through serialization', () => {
    const engine = new DeepUnderstandingEngine()
    engine.understand('Write a function in TypeScript')
    engine.feedback(true, 'good')
    engine.computeSimilarity('a', 'b')

    const json = engine.serialize()
    const restored = DeepUnderstandingEngine.deserialize(json)

    const originalStats = engine.getStats()
    const restoredStats = restored.getStats()
    expect(restoredStats.totalUnderstandings).toBe(originalStats.totalUnderstandings)
    expect(restoredStats.feedbackCount).toBe(originalStats.feedbackCount)
    expect(restoredStats.totalSimilarityQueries).toBe(originalStats.totalSimilarityQueries)
  })

  it('deserialized engine is functional', () => {
    const engine = new DeepUnderstandingEngine()
    const json = engine.serialize()
    const restored = DeepUnderstandingEngine.deserialize(json)

    const result = restored.understand('Explain binary search')
    expect(result.intents.length).toBeGreaterThan(0)
  })

  it('serialize returns a valid JSON string', () => {
    const engine = new DeepUnderstandingEngine()
    const json = engine.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
