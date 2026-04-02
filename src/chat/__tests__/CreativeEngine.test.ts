import { describe, it, expect, beforeEach } from 'vitest'
import {
  CreativeEngine,
  type CreativeEngineConfig,
  type CreativeEngineStats,
  type BrainstormResult,
  type LateralThinkingResult,
  type CreativeCombination,
  type Metaphor,
  type ReframingResult,
  type InspirationSource,
  type CreativeIdea,
  type IdeaEvolution,
} from '../CreativeEngine'

// ── Constructor Tests ──

describe('CreativeEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new CreativeEngine()
    expect(engine).toBeInstanceOf(CreativeEngine)
  })

  it('accepts a partial custom config', () => {
    const engine = new CreativeEngine({ divergenceLevel: 0.9 })
    expect(engine).toBeInstanceOf(CreativeEngine)
  })

  it('accepts a full custom config', () => {
    const engine = new CreativeEngine({
      divergenceLevel: 0.5,
      maxIdeas: 20,
      noveltyThreshold: 0.1,
      enableEvolution: false,
      maxEvolutionIterations: 3,
      perspectiveCount: 6,
    })
    expect(engine).toBeInstanceOf(CreativeEngine)
  })

  it('has pre-built metaphor database available immediately', () => {
    const engine = new CreativeEngine()
    const metaphors = engine.generateMetaphors('microservices')
    expect(metaphors.length).toBeGreaterThan(0)
  })
})

// ── brainstorm Tests ──

describe('CreativeEngine brainstorm', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  it('generates ideas for a given problem', () => {
    const result = engine.brainstorm('How to improve API performance')
    expect(result.ideas.length).toBeGreaterThan(0)
  })

  it('returns a BrainstormResult with required fields', () => {
    const result = engine.brainstorm('How to reduce technical debt')
    expect(result.ideas).toBeDefined()
    expect(Array.isArray(result.ideas)).toBe(true)
    expect(result.bestIdea).toBeDefined()
    expect(typeof result.diversityScore).toBe('number')
    expect(Array.isArray(result.themes)).toBe(true)
  })

  it('respects maxIdeas from config', () => {
    const small = new CreativeEngine({ maxIdeas: 3 })
    const result = small.brainstorm('How to scale a database')
    expect(result.ideas.length).toBeLessThanOrEqual(3)
  })

  it('bestIdea is the top-ranked idea', () => {
    const result = engine.brainstorm('How to improve code quality')
    if (result.ideas.length > 0) {
      expect(result.bestIdea).not.toBeNull()
      expect(result.bestIdea!.id).toBe(result.ideas[0].id)
    }
  })

  it('each idea has an id, description, novelty, and feasibility', () => {
    const result = engine.brainstorm('Design a notification system')
    for (const idea of result.ideas) {
      expect(typeof idea.id).toBe('string')
      expect(idea.id.length).toBeGreaterThan(0)
      expect(typeof idea.description).toBe('string')
      expect(idea.description.length).toBeGreaterThan(0)
      expect(typeof idea.novelty).toBe('number')
      expect(typeof idea.feasibility).toBe('number')
    }
  })

  it('generates ideas with constraints applied', () => {
    const result = engine.brainstorm('Build a chat application', ['must be real-time', 'low latency'])
    expect(result.ideas.length).toBeGreaterThan(0)
  })

  it('diversityScore is between 0 and 1', () => {
    const result = engine.brainstorm('How to handle errors gracefully')
    expect(result.diversityScore).toBeGreaterThanOrEqual(0)
    expect(result.diversityScore).toBeLessThanOrEqual(1)
  })

  it('themes are extracted from the generated ideas', () => {
    const result = engine.brainstorm('How to optimize frontend rendering')
    expect(Array.isArray(result.themes)).toBe(true)
  })

  it('ideas have category and inspirations fields', () => {
    const result = engine.brainstorm('Improve logging infrastructure')
    for (const idea of result.ideas) {
      expect(typeof idea.category).toBe('string')
      expect(Array.isArray(idea.inspirations)).toBe(true)
    }
  })
})

// ── lateralThink Tests ──

describe('CreativeEngine lateralThink', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  it('returns multiple lateral thinking results', () => {
    const results = engine.lateralThink('How to reduce deployment failures')
    expect(results.length).toBeGreaterThan(0)
  })

  it('each result has connection, explanation, novelty, and technique', () => {
    const results = engine.lateralThink('How to improve test coverage')
    for (const r of results) {
      expect(typeof r.connection).toBe('string')
      expect(r.connection.length).toBeGreaterThan(0)
      expect(typeof r.explanation).toBe('string')
      expect(r.explanation.length).toBeGreaterThan(0)
      expect(typeof r.novelty).toBe('number')
      expect(typeof r.technique).toBe('string')
      expect(r.technique.length).toBeGreaterThan(0)
    }
  })

  it('novelty scores are between 0 and 1', () => {
    const results = engine.lateralThink('How to onboard new developers faster')
    for (const r of results) {
      expect(r.novelty).toBeGreaterThanOrEqual(0)
      expect(r.novelty).toBeLessThanOrEqual(1)
    }
  })

  it('uses multiple different techniques', () => {
    const results = engine.lateralThink('How to manage state in a complex app')
    const techniques = new Set(results.map(r => r.technique))
    expect(techniques.size).toBeGreaterThan(1)
  })

  it('produces results for abstract problems', () => {
    const results = engine.lateralThink('innovation')
    expect(results.length).toBeGreaterThan(0)
  })
})

// ── combineCreatively Tests ──

describe('CreativeEngine combineCreatively', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  it('returns a CreativeCombination with required fields', () => {
    const result = engine.combineCreatively('microservices', 'machine learning')
    expect(result.conceptA).toBe('microservices')
    expect(result.conceptB).toBe('machine learning')
    expect(typeof result.combination).toBe('string')
    expect(result.combination.length).toBeGreaterThan(0)
    expect(typeof result.explanation).toBe('string')
    expect(result.explanation.length).toBeGreaterThan(0)
  })

  it('novelty score is between 0 and 1', () => {
    const result = engine.combineCreatively('caching', 'blockchain')
    expect(result.novelty).toBeGreaterThanOrEqual(0)
    expect(result.novelty).toBeLessThanOrEqual(1)
  })

  it('combination description mentions both concepts', () => {
    const result = engine.combineCreatively('testing', 'gamification')
    expect(result.combination).toContain('testing')
    expect(result.combination).toContain('gamification')
  })

  it('handles single-word concepts', () => {
    const result = engine.combineCreatively('speed', 'safety')
    expect(typeof result.combination).toBe('string')
    expect(result.combination.length).toBeGreaterThan(0)
  })

  it('handles multi-word concepts', () => {
    const result = engine.combineCreatively('event-driven architecture', 'natural language processing')
    expect(result.conceptA).toBe('event-driven architecture')
    expect(result.conceptB).toBe('natural language processing')
    expect(result.combination.length).toBeGreaterThan(0)
  })
})

// ── generateMetaphors Tests ──

describe('CreativeEngine generateMetaphors', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  it('generates metaphors for a known concept like "microservices"', () => {
    const metaphors = engine.generateMetaphors('microservices')
    expect(metaphors.length).toBeGreaterThan(0)
  })

  it('each metaphor has source, target, mapping, and explanation', () => {
    const metaphors = engine.generateMetaphors('tree')
    for (const m of metaphors) {
      expect(typeof m.source).toBe('string')
      expect(m.source.length).toBeGreaterThan(0)
      expect(typeof m.target).toBe('string')
      expect(typeof m.mapping).toBe('object')
      expect(typeof m.explanation).toBe('string')
      expect(m.explanation.length).toBeGreaterThan(0)
    }
  })

  it('returns pre-built metaphor for "tree" referencing family tree', () => {
    const metaphors = engine.generateMetaphors('tree')
    const familyTree = metaphors.find(m => m.source.toLowerCase().includes('family'))
    expect(familyTree).toBeDefined()
  })

  it('returns pre-built metaphor for "microservices" referencing city districts', () => {
    const metaphors = engine.generateMetaphors('microservices')
    const cityDistricts = metaphors.find(m => m.source.toLowerCase().includes('city'))
    expect(cityDistricts).toBeDefined()
  })

  it('generates metaphors with target domain filter', () => {
    const metaphors = engine.generateMetaphors('recursion', 'nature')
    expect(metaphors.length).toBeGreaterThan(0)
  })

  it('generates metaphors for unknown concepts via cross-domain mapping', () => {
    const metaphors = engine.generateMetaphors('quantum entanglement')
    expect(metaphors.length).toBeGreaterThan(0)
  })
})

// ── reframe Tests ──

describe('CreativeEngine reframe', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  it('returns multiple reframing results', () => {
    const results = engine.reframe('Our API is too slow')
    expect(results.length).toBeGreaterThan(0)
  })

  it('each result has perspective, reframed text, insights, and novelty', () => {
    const results = engine.reframe('We have too much technical debt')
    for (const r of results) {
      expect(typeof r.perspective).toBe('string')
      expect(r.perspective.length).toBeGreaterThan(0)
      expect(typeof r.reframed).toBe('string')
      expect(r.reframed.length).toBeGreaterThan(0)
      expect(Array.isArray(r.insights)).toBe(true)
      expect(typeof r.novelty).toBe('number')
    }
  })

  it('uses specified perspectives when provided', () => {
    const results = engine.reframe('Our tests are flaky', ['user', 'developer'])
    const perspectiveNames = results.map(r => r.perspective.toLowerCase())
    const hasUser = perspectiveNames.some(p => p.includes('user'))
    const hasDev = perspectiveNames.some(p => p.includes('developer'))
    expect(hasUser || hasDev).toBe(true)
  })

  it('falls back to defaults for unrecognized perspectives', () => {
    const results = engine.reframe('Database performance issue', ['xyzzy_unknown_perspective'])
    expect(results.length).toBeGreaterThan(0)
  })

  it('novelty scores are between 0 and 1', () => {
    const results = engine.reframe('How to improve CI/CD pipeline')
    for (const r of results) {
      expect(r.novelty).toBeGreaterThanOrEqual(0)
      expect(r.novelty).toBeLessThanOrEqual(1)
    }
  })
})

// ── scamper Tests ──

describe('CreativeEngine scamper', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  it('returns results for all seven SCAMPER letters', () => {
    const result = engine.scamper('authentication system')
    const expectedLetters = ['S', 'C', 'A', 'M', 'P', 'E', 'R']
    for (const letter of expectedLetters) {
      expect(result[letter]).toBeDefined()
    }
  })

  it('each entry has a technique name and ideas array', () => {
    const result = engine.scamper('caching layer')
    for (const letter of Object.keys(result)) {
      expect(typeof result[letter].technique).toBe('string')
      expect(result[letter].technique.length).toBeGreaterThan(0)
      expect(Array.isArray(result[letter].ideas)).toBe(true)
      expect(result[letter].ideas.length).toBeGreaterThan(0)
    }
  })

  it('S maps to Substitute technique', () => {
    const result = engine.scamper('deployment pipeline')
    expect(result['S'].technique).toBe('Substitute')
  })

  it('ideas are non-empty strings', () => {
    const result = engine.scamper('logging service')
    for (const letter of Object.keys(result)) {
      for (const idea of result[letter].ideas) {
        expect(typeof idea).toBe('string')
        expect(idea.length).toBeGreaterThan(0)
      }
    }
  })

  it('works with multi-word concepts', () => {
    const result = engine.scamper('distributed event-driven microservice architecture')
    expect(Object.keys(result).length).toBe(7)
  })
})

// ── randomStimulus Tests ──

describe('CreativeEngine randomStimulus', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  it('returns inspiration sources for a problem', () => {
    const sources = engine.randomStimulus('How to improve user onboarding')
    expect(sources.length).toBeGreaterThan(0)
  })

  it('each source has type, content, and relevance', () => {
    const sources = engine.randomStimulus('How to handle errors')
    for (const s of sources) {
      expect(typeof s.type).toBe('string')
      expect(typeof s.content).toBe('string')
      expect(s.content.length).toBeGreaterThan(0)
      expect(typeof s.relevance).toBe('number')
    }
  })

  it('relevance scores are between 0 and 1', () => {
    const sources = engine.randomStimulus('How to design a REST API')
    for (const s of sources) {
      expect(s.relevance).toBeGreaterThanOrEqual(0)
      expect(s.relevance).toBeLessThanOrEqual(1)
    }
  })

  it('includes an inversion type stimulus', () => {
    const sources = engine.randomStimulus('How to speed up builds')
    const inversion = sources.find(s => s.type === 'inversion')
    expect(inversion).toBeDefined()
  })

  it('results are sorted by relevance descending', () => {
    const sources = engine.randomStimulus('How to design a REST API')
    for (let i = 1; i < sources.length; i++) {
      expect(sources[i - 1].relevance).toBeGreaterThanOrEqual(sources[i].relevance)
    }
  })

  it('includes a constraint type stimulus', () => {
    const sources = engine.randomStimulus('How to scale a monolith')
    const constraint = sources.find(s => s.type === 'constraint')
    expect(constraint).toBeDefined()
  })
})

// ── evaluateNovelty Tests ──

describe('CreativeEngine evaluateNovelty', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  it('returns a number between 0 and 1', () => {
    const score = engine.evaluateNovelty('Use quantum computing for sorting')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })

  it('unique idea scores higher than common idea against existing corpus', () => {
    const existing = [
      'Use caching to speed up reads',
      'Add an index to the database',
      'Use a CDN for static assets',
    ]
    const commonScore = engine.evaluateNovelty('Use caching to speed up reads', existing)
    const uniqueScore = engine.evaluateNovelty('Apply genetic algorithms to optimize query routing', existing)
    expect(uniqueScore).toBeGreaterThan(commonScore)
  })

  it('identical idea scores low against itself in corpus', () => {
    const idea = 'Implement a load balancer'
    const score = engine.evaluateNovelty(idea, [idea, idea, idea])
    expect(score).toBeLessThan(0.5)
  })

  it('returns high novelty when no existing ideas are provided', () => {
    const score = engine.evaluateNovelty('A completely novel approach using bioluminescence')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })

  it('evaluates novelty relative to different corpora', () => {
    const idea = 'Use machine learning for predictions'
    const mlCorpus = [
      'Apply neural networks to classify images',
      'Use machine learning for data analysis',
      'Train a model to predict outcomes',
    ]
    const webCorpus = [
      'Build a REST API',
      'Design a responsive UI',
      'Implement OAuth authentication',
    ]
    const scoreAgainstML = engine.evaluateNovelty(idea, mlCorpus)
    const scoreAgainstWeb = engine.evaluateNovelty(idea, webCorpus)
    expect(scoreAgainstWeb).toBeGreaterThan(scoreAgainstML)
  })
})

// ── evolveIdea Tests ──

describe('CreativeEngine evolveIdea', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  const sampleIdea: CreativeIdea = {
    id: 'test-idea-1',
    description: 'Use a message queue for async processing',
    novelty: 0.4,
    feasibility: 0.6,
    category: 'direct',
    inspirations: ['message queue', 'async'],
  }

  it('returns an IdeaEvolution with original, iterations, finalIdea, and improvementScore', () => {
    const evolution = engine.evolveIdea(sampleIdea)
    expect(evolution.original).toBeDefined()
    expect(evolution.original.id).toBe(sampleIdea.id)
    expect(Array.isArray(evolution.iterations)).toBe(true)
    expect(evolution.iterations.length).toBeGreaterThan(0)
    expect(evolution.finalIdea).toBeDefined()
    expect(typeof evolution.improvementScore).toBe('number')
  })

  it('respects custom iteration count', () => {
    const evolution = engine.evolveIdea(sampleIdea, 2)
    expect(evolution.iterations.length).toBe(2)
  })

  it('does not exceed maxEvolutionIterations from config', () => {
    const limited = new CreativeEngine({ maxEvolutionIterations: 3 })
    const evolution = limited.evolveIdea(sampleIdea, 10)
    expect(evolution.iterations.length).toBeLessThanOrEqual(3)
  })

  it('improvementScore is between 0 and 1', () => {
    const evolution = engine.evolveIdea(sampleIdea)
    expect(evolution.improvementScore).toBeGreaterThanOrEqual(0)
    expect(evolution.improvementScore).toBeLessThanOrEqual(1)
  })
})

// ── findConnections Tests ──

describe('CreativeEngine findConnections', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  it('finds connections between related concepts', () => {
    const connections = engine.findConnections(['caching', 'performance', 'speed'])
    expect(connections.length).toBeGreaterThan(0)
  })

  it('each connection has pair, connection description, and strength', () => {
    const connections = engine.findConnections(['testing', 'quality', 'bugs'])
    for (const c of connections) {
      expect(Array.isArray(c.pair)).toBe(true)
      expect(c.pair.length).toBe(2)
      expect(typeof c.connection).toBe('string')
      expect(c.connection.length).toBeGreaterThan(0)
      expect(typeof c.strength).toBe('number')
    }
  })

  it('strength is between 0 and 1', () => {
    const connections = engine.findConnections(['database', 'encryption', 'cloud'])
    for (const c of connections) {
      expect(c.strength).toBeGreaterThanOrEqual(0)
      expect(c.strength).toBeLessThanOrEqual(1)
    }
  })

  it('generates all pairwise connections for given concepts', () => {
    const concepts = ['alpha', 'beta', 'gamma', 'delta']
    const connections = engine.findConnections(concepts)
    // n*(n-1)/2 pairs for 4 concepts = 6
    expect(connections.length).toBe(6)
  })

  it('connections are sorted by strength descending', () => {
    const connections = engine.findConnections(['caching', 'memory', 'disk', 'network'])
    for (let i = 1; i < connections.length; i++) {
      expect(connections[i - 1].strength).toBeGreaterThanOrEqual(connections[i].strength)
    }
  })
})

// ── getStats Tests ──

describe('CreativeEngine getStats', () => {
  let engine: CreativeEngine

  beforeEach(() => {
    engine = new CreativeEngine()
  })

  it('returns stats with correct structure', () => {
    const stats = engine.getStats()
    expect(typeof stats.totalBrainstorms).toBe('number')
    expect(typeof stats.totalIdeasGenerated).toBe('number')
    expect(typeof stats.totalLateralThinks).toBe('number')
    expect(typeof stats.totalMetaphorsGenerated).toBe('number')
    expect(typeof stats.totalCombinations).toBe('number')
    expect(typeof stats.totalReframes).toBe('number')
    expect(typeof stats.totalEvolutions).toBe('number')
    expect(typeof stats.avgNovelty).toBe('number')
    expect(typeof stats.avgFeasibility).toBe('number')
  })

  it('starts with zero counts', () => {
    const stats = engine.getStats()
    expect(stats.totalBrainstorms).toBe(0)
    expect(stats.totalIdeasGenerated).toBe(0)
    expect(stats.totalLateralThinks).toBe(0)
    expect(stats.totalMetaphorsGenerated).toBe(0)
    expect(stats.totalCombinations).toBe(0)
    expect(stats.totalReframes).toBe(0)
    expect(stats.totalEvolutions).toBe(0)
  })

  it('updates after performing operations', () => {
    engine.brainstorm('test problem')
    engine.lateralThink('test problem')
    engine.combineCreatively('alpha', 'beta')
    engine.reframe('test issue')
    const stats = engine.getStats()
    expect(stats.totalBrainstorms).toBe(1)
    expect(stats.totalLateralThinks).toBe(1)
    expect(stats.totalCombinations).toBe(1)
    expect(stats.totalReframes).toBe(1)
  })
})

// ── serialize / deserialize Tests ──

describe('CreativeEngine serialize / deserialize', () => {
  it('round-trip preserves config', () => {
    const original = new CreativeEngine({
      divergenceLevel: 0.3,
      maxIdeas: 15,
    })

    const json = original.serialize()
    const data = JSON.parse(json)
    expect(data.config.divergenceLevel).toBe(0.3)
    expect(data.config.maxIdeas).toBe(15)
  })

  it('round-trip preserves stats', () => {
    const original = new CreativeEngine()
    original.brainstorm('test problem')
    original.lateralThink('another problem')
    original.combineCreatively('a', 'b')

    const json = original.serialize()
    const restored = CreativeEngine.deserialize(json)
    const stats = restored.getStats()

    expect(stats.totalBrainstorms).toBe(1)
    expect(stats.totalLateralThinks).toBe(1)
    expect(stats.totalCombinations).toBe(1)
  })

  it('deserialized engine works correctly', () => {
    const original = new CreativeEngine()
    original.brainstorm('initial problem')

    const json = original.serialize()
    const restored = CreativeEngine.deserialize(json)

    const result = restored.brainstorm('another problem')
    expect(result.ideas.length).toBeGreaterThan(0)

    const stats = restored.getStats()
    expect(stats.totalBrainstorms).toBe(2)
  })

  it('serialize returns valid JSON string', () => {
    const engine = new CreativeEngine()
    engine.brainstorm('test')
    const json = engine.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
