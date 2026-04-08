import { describe, it, expect, beforeEach } from 'vitest'
import {
  ExplanationEngine,
  DEFAULT_EXPLANATION_ENGINE_CONFIG,
} from '../ExplanationEngine'
import type {
  ExpertiseLevel,
  AbstractionLevel,
  LevelExplanation,
  MultiLevelExplanation,
  ExplanationStep,
  StepByStepBreakdown,
  Analogy,
  AudienceProfile,
  UnderstandingProgress,
  Prerequisite,
  ExplanationEngineConfig,
  ExplanationEngineStats,
} from '../ExplanationEngine'

// ── Default Config Tests ──

describe('DEFAULT_EXPLANATION_ENGINE_CONFIG', () => {
  it('has maxSteps of 20', () => {
    expect(DEFAULT_EXPLANATION_ENGINE_CONFIG.maxSteps).toBe(20)
  })

  it('has maxAnalogies of 5', () => {
    expect(DEFAULT_EXPLANATION_ENGINE_CONFIG.maxAnalogies).toBe(5)
  })

  it('has enableAudienceAdaptation set to true', () => {
    expect(DEFAULT_EXPLANATION_ENGINE_CONFIG.enableAudienceAdaptation).toBe(true)
  })

  it('has maxProgressRecords of 100', () => {
    expect(DEFAULT_EXPLANATION_ENGINE_CONFIG.maxProgressRecords).toBe(100)
  })
})

// ── Constructor Tests ──

describe('ExplanationEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new ExplanationEngine()
    expect(engine).toBeInstanceOf(ExplanationEngine)
  })

  it('accepts a partial custom config', () => {
    const engine = new ExplanationEngine({ maxSteps: 10 })
    expect(engine).toBeInstanceOf(ExplanationEngine)
  })

  it('accepts another partial custom config key', () => {
    const engine = new ExplanationEngine({ maxAnalogies: 3 })
    expect(engine).toBeInstanceOf(ExplanationEngine)
  })

  it('accepts a full custom config', () => {
    const engine = new ExplanationEngine({
      maxSteps: 10,
      maxAnalogies: 3,
      enableAudienceAdaptation: false,
      maxProgressRecords: 50,
    })
    expect(engine).toBeInstanceOf(ExplanationEngine)
  })

  it('starts with zero stats', () => {
    const engine = new ExplanationEngine()
    const stats = engine.getStats()
    expect(stats.totalExplanationsGenerated).toBe(0)
    expect(stats.totalBreakdownsCreated).toBe(0)
    expect(stats.totalAnalogiesGenerated).toBe(0)
  })

  it('starts with zero average explanation levels', () => {
    const engine = new ExplanationEngine()
    const stats = engine.getStats()
    expect(stats.avgExplanationLevels).toBe(0)
  })

  it('starts with empty most explained domains', () => {
    const engine = new ExplanationEngine()
    const stats = engine.getStats()
    expect(stats.mostExplainedDomains).toEqual([])
  })

  it('starts with empty user progress', () => {
    const engine = new ExplanationEngine()
    const progress = engine.getUserProgress('any-user')
    expect(progress).toEqual([])
  })
})

// ── explain() Tests ──

describe('ExplanationEngine explain', () => {
  let engine: ExplanationEngine

  beforeEach(() => {
    engine = new ExplanationEngine()
  })

  it('returns a MultiLevelExplanation for a simple topic', () => {
    const result = engine.explain('recursion')
    expect(result.topic).toBe('recursion')
    expect(result.levels).toBeDefined()
    expect(result.levels.length).toBeGreaterThan(0)
  })

  it('includes all five abstraction levels', () => {
    const result = engine.explain('database')
    const levelNames = result.levels.map(l => l.level)
    expect(levelNames).toContain('eli5')
    expect(levelNames).toContain('simplified')
    expect(levelNames).toContain('standard')
    expect(levelNames).toContain('detailed')
    expect(levelNames).toContain('technical')
  })

  it('detects the domain from the topic', () => {
    const result = engine.explain('HTTP protocol networking')
    expect(result.domain).toBe('networking')
  })

  it('detects the programming domain', () => {
    const result = engine.explain('function variable code')
    expect(result.domain).toBe('programming')
  })

  it('detects the security domain', () => {
    const result = engine.explain('vulnerability attack encryption')
    expect(result.domain).toBe('security')
  })

  it('detects the databases domain', () => {
    const result = engine.explain('SQL query table database')
    expect(result.domain).toBe('databases')
  })

  it('detects the algorithms domain', () => {
    const result = engine.explain('sort search graph complexity')
    expect(result.domain).toBe('algorithms')
  })

  it('falls back to general for unrecognized topics', () => {
    const result = engine.explain('blue sky sunshine')
    expect(result.domain).toBe('general')
  })

  it('includes prerequisites when available', () => {
    const result = engine.explain('recursion')
    expect(result.prerequisites.length).toBeGreaterThan(0)
    expect(result.prerequisites).toContain('functions')
  })

  it('includes related topics', () => {
    const result = engine.explain('recursion')
    expect(result.relatedTopics).toBeDefined()
    expect(Array.isArray(result.relatedTopics)).toBe(true)
  })

  it('recommends standard level when no audience provided', () => {
    const result = engine.explain('api')
    expect(result.recommendedLevel).toBe('standard')
  })

  it('recommends simplified level for beginner audience', () => {
    const result = engine.explain('api', { expertise: 'beginner' })
    expect(result.recommendedLevel).toBe('simplified')
  })

  it('recommends standard level for intermediate audience', () => {
    const result = engine.explain('api', { expertise: 'intermediate' })
    expect(result.recommendedLevel).toBe('standard')
  })

  it('recommends detailed level for advanced audience', () => {
    const result = engine.explain('api', { expertise: 'advanced' })
    expect(result.recommendedLevel).toBe('detailed')
  })

  it('recommends technical level for expert audience', () => {
    const result = engine.explain('api', { expertise: 'expert' })
    expect(result.recommendedLevel).toBe('technical')
  })

  it('still returns standard when audience has no expertise set', () => {
    const result = engine.explain('api', { familiarDomains: ['programming'] })
    expect(result.recommendedLevel).toBe('standard')
  })

  it('increments totalExplanationsGenerated after each call', () => {
    engine.explain('topic one')
    engine.explain('topic two')
    const stats = engine.getStats()
    expect(stats.totalExplanationsGenerated).toBe(2)
  })

  it('tracks domain counts for most explained domains', () => {
    engine.explain('SQL query database')
    engine.explain('database schema')
    const stats = engine.getStats()
    expect(stats.mostExplainedDomains).toContain('databases')
  })
})

// ── LevelExplanation Tests ──

describe('ExplanationEngine level explanations', () => {
  let engine: ExplanationEngine

  beforeEach(() => {
    engine = new ExplanationEngine()
  })

  it('eli5 level contains "Imagine" prefix', () => {
    const result = engine.explain('api')
    const eli5 = result.levels.find(l => l.level === 'eli5')
    expect(eli5).toBeDefined()
    expect(eli5!.text).toContain('Imagine')
  })

  it('simplified level contains "In simple terms" prefix', () => {
    const result = engine.explain('api')
    const simplified = result.levels.find(l => l.level === 'simplified')
    expect(simplified).toBeDefined()
    expect(simplified!.text).toContain('In simple terms')
  })

  it('detailed level contains "In detail" prefix', () => {
    const result = engine.explain('api')
    const detailed = result.levels.find(l => l.level === 'detailed')
    expect(detailed).toBeDefined()
    expect(detailed!.text).toContain('In detail')
  })

  it('technical level contains "Technically speaking" prefix', () => {
    const result = engine.explain('api')
    const technical = result.levels.find(l => l.level === 'technical')
    expect(technical).toBeDefined()
    expect(technical!.text).toContain('Technically speaking')
  })

  it('standard level has no special prefix', () => {
    const result = engine.explain('api')
    const standard = result.levels.find(l => l.level === 'standard')
    expect(standard).toBeDefined()
    expect(standard!.text).not.toMatch(/^Imagine/)
    expect(standard!.text).not.toMatch(/^In simple terms/)
    expect(standard!.text).not.toMatch(/^In detail/)
    expect(standard!.text).not.toMatch(/^Technically speaking/)
  })

  it('each level has a positive word count', () => {
    const result = engine.explain('recursion')
    for (const level of result.levels) {
      expect(level.wordCount).toBeGreaterThan(0)
    }
  })

  it('each level has a readingTime of at least 1', () => {
    const result = engine.explain('recursion')
    for (const level of result.levels) {
      expect(level.readingTime).toBeGreaterThanOrEqual(1)
    }
  })

  it('technical terms is an array for each level', () => {
    const result = engine.explain('HTTP API')
    for (const level of result.levels) {
      expect(Array.isArray(level.technicalTerms)).toBe(true)
    }
  })

  it('eli5 level includes analogies', () => {
    const result = engine.explain('recursion')
    const eli5 = result.levels.find(l => l.level === 'eli5')
    expect(eli5).toBeDefined()
    expect(eli5!.analogies.length).toBeGreaterThan(0)
  })

  it('simplified level includes analogies', () => {
    const result = engine.explain('recursion')
    const simplified = result.levels.find(l => l.level === 'simplified')
    expect(simplified).toBeDefined()
    expect(simplified!.analogies.length).toBeGreaterThan(0)
  })

  it('standard level does not include analogies', () => {
    const result = engine.explain('recursion')
    const standard = result.levels.find(l => l.level === 'standard')
    expect(standard).toBeDefined()
    expect(standard!.analogies).toEqual([])
  })

  it('detailed level does not include analogies', () => {
    const result = engine.explain('recursion')
    const detailed = result.levels.find(l => l.level === 'detailed')
    expect(detailed).toBeDefined()
    expect(detailed!.analogies).toEqual([])
  })

  it('technical level does not include analogies', () => {
    const result = engine.explain('recursion')
    const technical = result.levels.find(l => l.level === 'technical')
    expect(technical).toBeDefined()
    expect(technical!.analogies).toEqual([])
  })

  it('detailed level text includes technical details', () => {
    const result = engine.explain('recursion')
    const detailed = result.levels.find(l => l.level === 'detailed')
    expect(detailed!.text).toContain('Key considerations')
  })

  it('technical level text includes technical details', () => {
    const result = engine.explain('recursion')
    const technical = result.levels.find(l => l.level === 'technical')
    expect(technical!.text).toContain('Key considerations')
  })
})

// ── createBreakdown() Tests ──

describe('ExplanationEngine createBreakdown', () => {
  let engine: ExplanationEngine

  beforeEach(() => {
    engine = new ExplanationEngine()
  })

  it('returns a StepByStepBreakdown with the topic', () => {
    const result = engine.createBreakdown('recursion')
    expect(result.topic).toBe('recursion')
  })

  it('has totalSteps matching steps array length', () => {
    const result = engine.createBreakdown('recursion')
    expect(result.totalSteps).toBe(result.steps.length)
  })

  it('includes a prerequisites step for topics with known prerequisites', () => {
    const result = engine.createBreakdown('recursion')
    const prereqStep = result.steps.find(s => s.title === 'Prerequisites')
    expect(prereqStep).toBeDefined()
  })

  it('does not include prerequisites step for topics without known prerequisites', () => {
    const result = engine.createBreakdown('banana smoothie')
    const prereqStep = result.steps.find(s => s.title === 'Prerequisites')
    expect(prereqStep).toBeUndefined()
  })

  it('includes a core concept step', () => {
    const result = engine.createBreakdown('api')
    const coreStep = result.steps.find(s => s.title.includes('What is'))
    expect(coreStep).toBeDefined()
  })

  it('includes a how it works step', () => {
    const result = engine.createBreakdown('api')
    const howStep = result.steps.find(s => s.title.includes('How'))
    expect(howStep).toBeDefined()
  })

  it('includes a common patterns step', () => {
    const result = engine.createBreakdown('api')
    const patternsStep = result.steps.find(s => s.title.includes('Common patterns'))
    expect(patternsStep).toBeDefined()
  })

  it('includes a best practices step', () => {
    const result = engine.createBreakdown('api')
    const bestStep = result.steps.find(s => s.title.includes('Best practices'))
    expect(bestStep).toBeDefined()
  })

  it('adds advanced considerations for advanced target level', () => {
    const result = engine.createBreakdown('api', 'advanced')
    const advancedStep = result.steps.find(s => s.title.includes('Advanced'))
    expect(advancedStep).toBeDefined()
  })

  it('adds advanced considerations for expert target level', () => {
    const result = engine.createBreakdown('api', 'expert')
    const advancedStep = result.steps.find(s => s.title.includes('Advanced'))
    expect(advancedStep).toBeDefined()
  })

  it('does not add advanced step for beginner target level', () => {
    const result = engine.createBreakdown('api', 'beginner')
    const advancedStep = result.steps.find(s => s.title.includes('Advanced'))
    expect(advancedStep).toBeUndefined()
  })

  it('does not add advanced step for intermediate target level', () => {
    const result = engine.createBreakdown('api', 'intermediate')
    const advancedStep = result.steps.find(s => s.title.includes('Advanced'))
    expect(advancedStep).toBeUndefined()
  })

  it('does not add advanced step when no target level specified', () => {
    const result = engine.createBreakdown('api')
    const advancedStep = result.steps.find(s => s.title.includes('Advanced'))
    expect(advancedStep).toBeUndefined()
  })

  it('steps have sequential step numbers', () => {
    const result = engine.createBreakdown('recursion')
    for (let i = 0; i < result.steps.length; i++) {
      expect(result.steps[i].stepNumber).toBe(i + 1)
    }
  })

  it('each step has a checkQuestion', () => {
    const result = engine.createBreakdown('recursion')
    for (const step of result.steps) {
      expect(step.checkQuestion.length).toBeGreaterThan(0)
    }
  })

  it('each step has a difficulty between 0 and 1', () => {
    const result = engine.createBreakdown('recursion')
    for (const step of result.steps) {
      expect(step.difficulty).toBeGreaterThanOrEqual(0)
      expect(step.difficulty).toBeLessThanOrEqual(1)
    }
  })

  it('has a positive estimated learning time', () => {
    const result = engine.createBreakdown('recursion')
    expect(result.estimatedLearningTime).toBeGreaterThan(0)
  })

  it('estimated learning time is proportional to step count', () => {
    const result = engine.createBreakdown('recursion')
    expect(result.estimatedLearningTime).toBe(result.totalSteps * 3)
  })

  it('overall difficulty is between 0 and 1', () => {
    const result = engine.createBreakdown('recursion')
    expect(result.difficulty).toBeGreaterThan(0)
    expect(result.difficulty).toBeLessThanOrEqual(1)
  })

  it('increments totalBreakdownsCreated stat', () => {
    engine.createBreakdown('api')
    engine.createBreakdown('recursion')
    const stats = engine.getStats()
    expect(stats.totalBreakdownsCreated).toBe(2)
  })
})

// ── generateAnalogies() Tests ──

describe('ExplanationEngine generateAnalogies', () => {
  let engine: ExplanationEngine

  beforeEach(() => {
    engine = new ExplanationEngine()
  })

  it('returns an array of analogies', () => {
    const result = engine.generateAnalogies('function')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('each analogy has the correct concept', () => {
    const result = engine.generateAnalogies('database')
    for (const analogy of result) {
      expect(analogy.concept).toBe('database')
    }
  })

  it('each analogy has a non-empty mapping', () => {
    const result = engine.generateAnalogies('api')
    for (const analogy of result) {
      expect(analogy.mapping.length).toBeGreaterThan(0)
    }
  })

  it('each analogy has strengths', () => {
    const result = engine.generateAnalogies('api')
    for (const analogy of result) {
      expect(analogy.strengths.length).toBeGreaterThan(0)
    }
  })

  it('each analogy has limitations', () => {
    const result = engine.generateAnalogies('api')
    for (const analogy of result) {
      expect(analogy.limitations.length).toBeGreaterThan(0)
    }
  })

  it('each analogy has effectiveness between 0 and 1', () => {
    const result = engine.generateAnalogies('api')
    for (const analogy of result) {
      expect(analogy.effectiveness).toBeGreaterThanOrEqual(0)
      expect(analogy.effectiveness).toBeLessThanOrEqual(1)
    }
  })

  it('analogies are sorted by effectiveness descending', () => {
    const result = engine.generateAnalogies('api')
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].effectiveness).toBeGreaterThanOrEqual(result[i].effectiveness)
    }
  })

  it('respects maxAnalogies config', () => {
    const engine2 = new ExplanationEngine({ maxAnalogies: 2 })
    const result = engine2.generateAnalogies('code function')
    expect(result.length).toBeLessThanOrEqual(2)
  })

  it('uses programming analogies for programming domain', () => {
    const result = engine.generateAnalogies('function', 'programming')
    const domains = result.map(a => a.familiarDomain)
    expect(domains.some(d => d.includes('recipe') || d.includes('house') || d.includes('assembly'))).toBe(true)
  })

  it('uses security analogies for security domain', () => {
    const result = engine.generateAnalogies('firewall', 'security')
    const domains = result.map(a => a.familiarDomain)
    expect(domains.some(d => d.includes('security') || d.includes('vault') || d.includes('castle'))).toBe(true)
  })

  it('uses networking analogies for networking domain', () => {
    const result = engine.generateAnalogies('protocol', 'networking')
    const domains = result.map(a => a.familiarDomain)
    expect(domains.some(d => d.includes('postal') || d.includes('highway') || d.includes('telephone'))).toBe(true)
  })

  it('uses database analogies for databases domain', () => {
    const result = engine.generateAnalogies('index', 'databases')
    const domains = result.map(a => a.familiarDomain)
    expect(domains.some(d => d.includes('cabinet') || d.includes('catalog') || d.includes('phone book'))).toBe(true)
  })

  it('uses algorithm analogies for algorithms domain', () => {
    const result = engine.generateAnalogies('sort', 'algorithms')
    const domains = result.map(a => a.familiarDomain)
    expect(domains.some(d => d.includes('cards') || d.includes('dictionary') || d.includes('maze'))).toBe(true)
  })

  it('falls back to general analogies for unknown domain', () => {
    const result = engine.generateAnalogies('banana', 'unknown')
    expect(result.length).toBeGreaterThan(0)
  })

  it('auto-detects domain when not provided', () => {
    const result = engine.generateAnalogies('SQL database query')
    expect(result.length).toBeGreaterThan(0)
  })

  it('increments totalAnalogiesGenerated stat', () => {
    engine.generateAnalogies('api')
    const stats = engine.getStats()
    expect(stats.totalAnalogiesGenerated).toBeGreaterThan(0)
  })
})

// ── identifyPrerequisites() Tests ──

describe('ExplanationEngine identifyPrerequisites', () => {
  let engine: ExplanationEngine

  beforeEach(() => {
    engine = new ExplanationEngine()
  })

  it('identifies prerequisites for recursion', () => {
    const result = engine.identifyPrerequisites('recursion')
    const concepts = result.map(p => p.concept)
    expect(concepts).toContain('functions')
    expect(concepts).toContain('call stack')
    expect(concepts).toContain('base case')
  })

  it('identifies prerequisites for api', () => {
    const result = engine.identifyPrerequisites('api')
    const concepts = result.map(p => p.concept)
    expect(concepts).toContain('http')
    expect(concepts).toContain('client-server')
    expect(concepts).toContain('request-response')
  })

  it('identifies prerequisites for machine learning', () => {
    const result = engine.identifyPrerequisites('machine learning')
    const concepts = result.map(p => p.concept)
    expect(concepts).toContain('statistics')
    expect(concepts).toContain('linear algebra')
    expect(concepts).toContain('optimization')
  })

  it('identifies prerequisites for docker', () => {
    const result = engine.identifyPrerequisites('docker')
    const concepts = result.map(p => p.concept)
    expect(concepts).toContain('containers')
    expect(concepts).toContain('operating systems')
    expect(concepts).toContain('networking')
  })

  it('identifies prerequisites for react', () => {
    const result = engine.identifyPrerequisites('react')
    const concepts = result.map(p => p.concept)
    expect(concepts).toContain('javascript')
    expect(concepts).toContain('html')
    expect(concepts).toContain('components')
    expect(concepts).toContain('state')
  })

  it('identifies prerequisites for typescript', () => {
    const result = engine.identifyPrerequisites('typescript')
    const concepts = result.map(p => p.concept)
    expect(concepts).toContain('javascript')
    expect(concepts).toContain('types')
    expect(concepts).toContain('interfaces')
  })

  it('returns empty array for unknown topics', () => {
    const result = engine.identifyPrerequisites('banana smoothie')
    expect(result).toEqual([])
  })

  it('each prerequisite has importance set to required', () => {
    const result = engine.identifyPrerequisites('recursion')
    for (const prereq of result) {
      expect(prereq.importance).toBe('required')
    }
  })

  it('each prerequisite has a domain', () => {
    const result = engine.identifyPrerequisites('recursion')
    for (const prereq of result) {
      expect(prereq.domain.length).toBeGreaterThan(0)
    }
  })

  it('is case-insensitive for topic matching', () => {
    const lower = engine.identifyPrerequisites('recursion')
    const upper = engine.identifyPrerequisites('RECURSION')
    expect(lower.length).toBe(upper.length)
    expect(lower.map(p => p.concept)).toEqual(upper.map(p => p.concept))
  })

  it('can match partial topic strings', () => {
    const result = engine.identifyPrerequisites('understanding recursion in programming')
    expect(result.length).toBeGreaterThan(0)
    expect(result.map(p => p.concept)).toContain('functions')
  })

  it('identifies prerequisites for kubernetes (which builds on docker)', () => {
    const result = engine.identifyPrerequisites('kubernetes')
    const concepts = result.map(p => p.concept)
    expect(concepts).toContain('docker')
    expect(concepts).toContain('containers')
    expect(concepts).toContain('networking')
    expect(concepts).toContain('yaml')
  })
})

// ── trackProgress() and getUserProgress() Tests ──

describe('ExplanationEngine trackProgress', () => {
  let engine: ExplanationEngine

  beforeEach(() => {
    engine = new ExplanationEngine()
  })

  it('creates new progress for a new user and topic', () => {
    const progress = engine.trackProgress('user1', 'recursion')
    expect(progress.userId).toBe('user1')
    expect(progress.topic).toBe('recursion')
  })

  it('starts with questionsAsked of 1 on first track', () => {
    const progress = engine.trackProgress('user1', 'api')
    expect(progress.questionsAsked).toBe(1)
  })

  it('increments questionsAsked on subsequent calls', () => {
    engine.trackProgress('user1', 'api')
    const progress = engine.trackProgress('user1', 'api')
    expect(progress.questionsAsked).toBe(2)
  })

  it('starts with conceptsInProgress containing the topic', () => {
    const progress = engine.trackProgress('user1', 'api')
    expect(progress.conceptsInProgress).toContain('api')
  })

  it('adds mastered concept when provided', () => {
    const progress = engine.trackProgress('user1', 'api', 'http')
    expect(progress.conceptsMastered).toContain('http')
  })

  it('does not duplicate mastered concepts', () => {
    engine.trackProgress('user1', 'api', 'http')
    const progress = engine.trackProgress('user1', 'api', 'http')
    const httpCount = progress.conceptsMastered.filter(c => c === 'http').length
    expect(httpCount).toBe(1)
  })

  it('accumulates multiple mastered concepts', () => {
    engine.trackProgress('user1', 'api', 'http')
    const progress = engine.trackProgress('user1', 'api', 'json')
    expect(progress.conceptsMastered).toContain('http')
    expect(progress.conceptsMastered).toContain('json')
  })

  it('has progressScore between 0 and 1', () => {
    const progress = engine.trackProgress('user1', 'api', 'http')
    expect(progress.progressScore).toBeGreaterThanOrEqual(0)
    expect(progress.progressScore).toBeLessThanOrEqual(1)
  })

  it('progress score increases as more concepts are mastered', () => {
    const p1 = engine.trackProgress('user1', 'api', 'http')
    const p2 = engine.trackProgress('user1', 'api', 'client-server')
    expect(p2.progressScore).toBeGreaterThanOrEqual(p1.progressScore)
  })

  it('currentLevel is a valid AbstractionLevel', () => {
    const validLevels: AbstractionLevel[] = ['eli5', 'simplified', 'standard', 'detailed', 'technical']
    const progress = engine.trackProgress('user1', 'api')
    expect(validLevels).toContain(progress.currentLevel)
  })

  it('tracks progress independently for different users', () => {
    engine.trackProgress('user1', 'api', 'http')
    engine.trackProgress('user2', 'api')
    const p1 = engine.getUserProgress('user1')
    const p2 = engine.getUserProgress('user2')
    expect(p1.length).toBe(1)
    expect(p2.length).toBe(1)
    expect(p1[0].conceptsMastered).toContain('http')
    expect(p2[0].conceptsMastered).not.toContain('http')
  })

  it('tracks progress independently for different topics', () => {
    engine.trackProgress('user1', 'api', 'http')
    engine.trackProgress('user1', 'recursion', 'functions')
    const all = engine.getUserProgress('user1')
    expect(all.length).toBe(2)
    const apiProgress = all.find(p => p.topic === 'api')
    const recursionProgress = all.find(p => p.topic === 'recursion')
    expect(apiProgress!.conceptsMastered).toContain('http')
    expect(recursionProgress!.conceptsMastered).toContain('functions')
  })
})

describe('ExplanationEngine getUserProgress', () => {
  let engine: ExplanationEngine

  beforeEach(() => {
    engine = new ExplanationEngine()
  })

  it('returns empty array for unknown user', () => {
    expect(engine.getUserProgress('nobody')).toEqual([])
  })

  it('returns all progress records for a user', () => {
    engine.trackProgress('user1', 'api')
    engine.trackProgress('user1', 'recursion')
    engine.trackProgress('user1', 'docker')
    const progress = engine.getUserProgress('user1')
    expect(progress.length).toBe(3)
  })

  it('returns a copy, not a reference', () => {
    engine.trackProgress('user1', 'api')
    const p1 = engine.getUserProgress('user1')
    const p2 = engine.getUserProgress('user1')
    expect(p1).not.toBe(p2)
    expect(p1).toEqual(p2)
  })
})

describe('ExplanationEngine maxProgressRecords', () => {
  it('enforces maxProgressRecords limit', () => {
    const engine = new ExplanationEngine({ maxProgressRecords: 3 })
    engine.trackProgress('user1', 'topic1')
    engine.trackProgress('user1', 'topic2')
    engine.trackProgress('user1', 'topic3')
    engine.trackProgress('user1', 'topic4')
    const progress = engine.getUserProgress('user1')
    expect(progress.length).toBeLessThanOrEqual(3)
  })
})

// ── Stats Tests ──

describe('ExplanationEngine getStats', () => {
  let engine: ExplanationEngine

  beforeEach(() => {
    engine = new ExplanationEngine()
  })

  it('returns ExplanationEngineStats with all fields', () => {
    const stats = engine.getStats()
    expect(typeof stats.totalExplanationsGenerated).toBe('number')
    expect(typeof stats.totalBreakdownsCreated).toBe('number')
    expect(typeof stats.totalAnalogiesGenerated).toBe('number')
    expect(typeof stats.avgExplanationLevels).toBe('number')
    expect(Array.isArray(stats.mostExplainedDomains)).toBe(true)
  })

  it('tracks totalExplanationsGenerated correctly', () => {
    engine.explain('api')
    engine.explain('recursion')
    engine.explain('docker')
    expect(engine.getStats().totalExplanationsGenerated).toBe(3)
  })

  it('tracks totalBreakdownsCreated correctly', () => {
    engine.createBreakdown('api')
    engine.createBreakdown('recursion')
    expect(engine.getStats().totalBreakdownsCreated).toBe(2)
  })

  it('tracks totalAnalogiesGenerated correctly', () => {
    const before = engine.getStats().totalAnalogiesGenerated
    engine.generateAnalogies('api')
    const after = engine.getStats().totalAnalogiesGenerated
    expect(after).toBeGreaterThan(before)
  })

  it('calculates avgExplanationLevels correctly', () => {
    engine.explain('api')
    const stats = engine.getStats()
    // Each explain call generates 5 levels
    expect(stats.avgExplanationLevels).toBe(5)
  })

  it('avgExplanationLevels stays at 5 across multiple calls', () => {
    engine.explain('api')
    engine.explain('recursion')
    const stats = engine.getStats()
    expect(stats.avgExplanationLevels).toBe(5)
  })

  it('returns at most 5 most explained domains', () => {
    engine.explain('function variable code')
    engine.explain('vulnerability attack encryption')
    engine.explain('network protocol server')
    engine.explain('database sql query')
    engine.explain('sort search graph')
    engine.explain('equation formula proof')
    const stats = engine.getStats()
    expect(stats.mostExplainedDomains.length).toBeLessThanOrEqual(5)
  })

  it('most explained domains are sorted by frequency', () => {
    engine.explain('SQL database query')
    engine.explain('database schema table')
    engine.explain('function code variable')
    const stats = engine.getStats()
    if (stats.mostExplainedDomains.length > 1) {
      expect(stats.mostExplainedDomains[0]).toBe('databases')
    }
  })
})

// ── Serialization / Deserialization Tests ──

describe('ExplanationEngine serialize and deserialize', () => {
  it('serialize returns a valid JSON string', () => {
    const engine = new ExplanationEngine()
    const json = engine.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('serialized data contains progress array', () => {
    const engine = new ExplanationEngine()
    engine.trackProgress('user1', 'api')
    const data = JSON.parse(engine.serialize())
    expect(Array.isArray(data.progress)).toBe(true)
  })

  it('serialized data contains stats object', () => {
    const engine = new ExplanationEngine()
    engine.explain('api')
    const data = JSON.parse(engine.serialize())
    expect(data.stats).toBeDefined()
    expect(data.stats.totalExplanations).toBe(1)
  })

  it('deserialize restores progress data', () => {
    const engine = new ExplanationEngine()
    engine.trackProgress('user1', 'api', 'http')
    const json = engine.serialize()
    const restored = ExplanationEngine.deserialize(json)
    const progress = restored.getUserProgress('user1')
    expect(progress.length).toBe(1)
    expect(progress[0].topic).toBe('api')
    expect(progress[0].conceptsMastered).toContain('http')
  })

  it('deserialize restores stats data', () => {
    const engine = new ExplanationEngine()
    engine.explain('api')
    engine.createBreakdown('recursion')
    const json = engine.serialize()
    const restored = ExplanationEngine.deserialize(json)
    const stats = restored.getStats()
    expect(stats.totalExplanationsGenerated).toBe(1)
    expect(stats.totalBreakdownsCreated).toBe(1)
  })

  it('deserialize accepts custom config', () => {
    const engine = new ExplanationEngine()
    engine.trackProgress('user1', 'api')
    const json = engine.serialize()
    const restored = ExplanationEngine.deserialize(json, { maxAnalogies: 2 })
    const analogies = restored.generateAnalogies('code function', 'programming')
    expect(analogies.length).toBeLessThanOrEqual(2)
  })

  it('deserialize returns fresh engine for invalid JSON', () => {
    const restored = ExplanationEngine.deserialize('not valid json')
    expect(restored).toBeInstanceOf(ExplanationEngine)
    expect(restored.getStats().totalExplanationsGenerated).toBe(0)
  })

  it('deserialize returns fresh engine for empty string', () => {
    const restored = ExplanationEngine.deserialize('')
    expect(restored).toBeInstanceOf(ExplanationEngine)
  })

  it('round-trip preserves multiple users progress', () => {
    const engine = new ExplanationEngine()
    engine.trackProgress('user1', 'api', 'http')
    engine.trackProgress('user2', 'docker', 'containers')
    const json = engine.serialize()
    const restored = ExplanationEngine.deserialize(json)
    expect(restored.getUserProgress('user1').length).toBe(1)
    expect(restored.getUserProgress('user2').length).toBe(1)
  })

  it('round-trip preserves analogies stat count', () => {
    const engine = new ExplanationEngine()
    engine.generateAnalogies('code function')
    const before = engine.getStats().totalAnalogiesGenerated
    const json = engine.serialize()
    const restored = ExplanationEngine.deserialize(json)
    expect(restored.getStats().totalAnalogiesGenerated).toBe(before)
  })
})

// ── Edge Cases ──

describe('ExplanationEngine edge cases', () => {
  let engine: ExplanationEngine

  beforeEach(() => {
    engine = new ExplanationEngine()
  })

  it('handles empty string topic in explain', () => {
    const result = engine.explain('')
    expect(result.topic).toBe('')
    expect(result.levels.length).toBe(5)
  })

  it('handles empty string topic in createBreakdown', () => {
    const result = engine.createBreakdown('')
    expect(result.topic).toBe('')
    expect(result.steps.length).toBeGreaterThan(0)
  })

  it('handles empty string concept in generateAnalogies', () => {
    const result = engine.generateAnalogies('')
    expect(Array.isArray(result)).toBe(true)
  })

  it('handles empty string topic in identifyPrerequisites', () => {
    const result = engine.identifyPrerequisites('')
    expect(Array.isArray(result)).toBe(true)
  })

  it('handles empty string in trackProgress', () => {
    const progress = engine.trackProgress('', '')
    expect(progress.userId).toBe('')
    expect(progress.topic).toBe('')
  })

  it('handles very long topic strings', () => {
    const longTopic = 'a'.repeat(10000)
    const result = engine.explain(longTopic)
    expect(result.topic).toBe(longTopic)
    expect(result.levels.length).toBe(5)
  })

  it('handles special characters in topic', () => {
    const result = engine.explain('API <script>alert("xss")</script>')
    expect(result.topic).toContain('<script>')
    expect(result.levels.length).toBe(5)
  })

  it('handles unicode characters in topic', () => {
    const result = engine.explain('مرحبا بالعالم')
    expect(result.topic).toBe('مرحبا بالعالم')
    expect(result.levels.length).toBe(5)
  })

  it('maxAnalogies of 1 produces at most 1 analogy', () => {
    const engine2 = new ExplanationEngine({ maxAnalogies: 1 })
    const result = engine2.generateAnalogies('code function', 'programming')
    expect(result.length).toBeLessThanOrEqual(1)
  })

  it('multiple explain calls for the same topic work independently', () => {
    const r1 = engine.explain('api')
    const r2 = engine.explain('api')
    expect(r1.topic).toBe(r2.topic)
    expect(r1.levels.length).toBe(r2.levels.length)
    expect(engine.getStats().totalExplanationsGenerated).toBe(2)
  })

  it('trackProgress without mastered concept does not add to conceptsMastered', () => {
    const progress = engine.trackProgress('user1', 'api')
    expect(progress.conceptsMastered).toEqual([])
  })

  it('getUserProgress returns empty array after tracking for a different user', () => {
    engine.trackProgress('user1', 'api')
    expect(engine.getUserProgress('user2')).toEqual([])
  })

  it('combined operations do not interfere with each other', () => {
    engine.explain('api')
    engine.createBreakdown('recursion')
    engine.generateAnalogies('docker')
    engine.trackProgress('user1', 'api')
    const stats = engine.getStats()
    expect(stats.totalExplanationsGenerated).toBe(1)
    expect(stats.totalBreakdownsCreated).toBe(1)
    expect(stats.totalAnalogiesGenerated).toBeGreaterThan(0)
    const progress = engine.getUserProgress('user1')
    expect(progress.length).toBe(1)
  })
})
