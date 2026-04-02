import { describe, it, expect, beforeEach } from 'vitest'
import {
  AbstractionEngine,
  createProgrammingAbstractionEngine,
  type AbstractionEngineConfig,
  type AbstractionEngineStats,
  type PatternAbstraction,
  type GeneralizationResult,
  type SpecializationResult,
  type ConceptHierarchy,
  type AbstractionMapping,
  type PrototypeEntry,
  type AbstractConcept,
} from '../AbstractionEngine'

// ── Constructor Tests ──

describe('AbstractionEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new AbstractionEngine()
    expect(engine).toBeInstanceOf(AbstractionEngine)
  })

  it('accepts a partial custom config', () => {
    const engine = new AbstractionEngine({ maxLevels: 10 })
    expect(engine).toBeInstanceOf(AbstractionEngine)
  })

  it('accepts a full custom config', () => {
    const engine = new AbstractionEngine({
      maxLevels: 10,
      minExamplesForAbstraction: 3,
      similarityThreshold: 0.5,
      maxConcepts: 1000,
      prototypeDecay: 0.9,
      featureBoostFactor: 2.0,
    })
    expect(engine).toBeInstanceOf(AbstractionEngine)
  })

  it('starts with zero concepts and clean stats', () => {
    const engine = new AbstractionEngine()
    const stats = engine.getStats()
    expect(stats.conceptCount).toBe(0)
    expect(stats.abstractionsMade).toBe(0)
    expect(stats.generalizationsMade).toBe(0)
  })
})

// ── abstractFromExamples Tests ──

describe('AbstractionEngine abstractFromExamples', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
  })

  it('abstracts from programming language examples', () => {
    const result = engine.abstractFromExamples([
      'Python is a high-level interpreted language',
      'JavaScript is a high-level scripting language',
      'Ruby is a high-level dynamic language',
    ])
    expect(result).not.toBeNull()
    expect(result!.pattern).toBeDefined()
    expect(result!.instances.length).toBe(3)
  })

  it('returns null when given fewer examples than minExamplesForAbstraction', () => {
    const result = engine.abstractFromExamples(['only one example'])
    expect(result).toBeNull()
  })

  it('returns null for empty examples array', () => {
    const result = engine.abstractFromExamples([])
    expect(result).toBeNull()
  })

  it('returns abstraction with confidence between 0 and 1', () => {
    const result = engine.abstractFromExamples([
      'array stores elements in contiguous memory',
      'linked list stores elements with pointers',
    ])
    expect(result).not.toBeNull()
    expect(result!.confidence).toBeGreaterThanOrEqual(0)
    expect(result!.confidence).toBeLessThanOrEqual(1)
  })

  it('includes features in the result', () => {
    const result = engine.abstractFromExamples([
      'sorting algorithm quick sort',
      'sorting algorithm merge sort',
      'sorting algorithm bubble sort',
    ])
    expect(result).not.toBeNull()
    expect(result!.features.length).toBeGreaterThan(0)
  })

  it('includes a domain prefix when domain is provided', () => {
    const result = engine.abstractFromExamples(
      [
        'binary search tree traversal',
        'red-black tree traversal',
      ],
      'data-structures',
    )
    expect(result).not.toBeNull()
    expect(result!.pattern).toContain('data-structures')
  })

  it('has an abstractionLevel of at least 1', () => {
    const result = engine.abstractFromExamples([
      'unit test for login',
      'unit test for logout',
    ])
    expect(result).not.toBeNull()
    expect(result!.abstractionLevel).toBeGreaterThanOrEqual(1)
  })
})

// ── generalize Tests ──

describe('AbstractionEngine generalize', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
  })

  it('generalizes known programming languages at the same level', () => {
    const result = engine.generalize(['Python', 'JavaScript', 'Ruby'])
    expect(result).not.toBeNull()
    expect(result!.abstractConcept).toBeDefined()
    expect(result!.inputConcepts).toEqual(['Python', 'JavaScript', 'Ruby'])
  })

  it('returns null for a single concept', () => {
    const result = engine.generalize(['Python'])
    expect(result).toBeNull()
  })

  it('returns null for empty array', () => {
    const result = engine.generalize([])
    expect(result).toBeNull()
  })

  it('returns a confidence between 0 and 1', () => {
    const result = engine.generalize(['array', 'linked list', 'stack'])
    expect(result).not.toBeNull()
    expect(result!.confidence).toBeGreaterThanOrEqual(0)
    expect(result!.confidence).toBeLessThanOrEqual(1)
  })

  it('includes shared features in the result', () => {
    const result = engine.generalize(['factory pattern', 'singleton pattern'])
    expect(result).not.toBeNull()
    expect(result!.sharedFeatures.length).toBeGreaterThan(0)
  })

  it('assigns a level higher than the input concepts', () => {
    const result = engine.generalize(['Python', 'JavaScript'])
    expect(result).not.toBeNull()
    expect(result!.level).toBeGreaterThanOrEqual(1)
  })
})

// ── specialize Tests ──

describe('AbstractionEngine specialize', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
  })

  it('specializes a known high-level concept', () => {
    const result = engine.specialize('high-level language')
    expect(result).toBeDefined()
    expect(result.parentConcept).toBe('high-level language')
  })

  it('returns a SpecializationResult even for unknown concepts', () => {
    const result = engine.specialize('completely unknown concept xyz')
    expect(result).toBeDefined()
    expect(result.parentConcept).toBe('completely unknown concept xyz')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('adds constraint-based specializations', () => {
    const result = engine.specialize('data structure', ['immutable', 'persistent'])
    expect(result.specializations.length).toBeGreaterThanOrEqual(2)
    expect(result.addedConstraints).toContain('immutable')
    expect(result.addedConstraints).toContain('persistent')
  })

  it('returns confidence between 0 and 1', () => {
    const result = engine.specialize('design pattern')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('increments the specializationsMade counter', () => {
    const statsBefore = engine.getStats()
    engine.specialize('machine code')
    const statsAfter = engine.getStats()
    expect(statsAfter.specializationsMade).toBe(statsBefore.specializationsMade + 1)
  })
})

// ── buildHierarchy Tests ──

describe('AbstractionEngine buildHierarchy', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
  })

  it('builds a hierarchy from multiple concepts', () => {
    const hierarchy = engine.buildHierarchy(['Python', 'JavaScript', 'C', 'Rust'])
    expect(hierarchy).toBeDefined()
    expect(hierarchy.root).toBeDefined()
    expect(hierarchy.levels.length).toBeGreaterThan(0)
    expect(hierarchy.depth).toBeGreaterThan(0)
  })

  it('returns empty hierarchy for empty array', () => {
    const hierarchy = engine.buildHierarchy([])
    expect(hierarchy.root).toBe('empty')
    expect(hierarchy.levels.length).toBe(0)
    expect(hierarchy.depth).toBe(0)
  })

  it('handles a single concept', () => {
    const hierarchy = engine.buildHierarchy(['Python'])
    expect(hierarchy).toBeDefined()
    expect(hierarchy.root).toBeDefined()
    expect(hierarchy.depth).toBeGreaterThanOrEqual(1)
  })

  it('has levels with concepts arrays', () => {
    const hierarchy = engine.buildHierarchy(['array', 'linked list', 'stack'])
    for (const level of hierarchy.levels) {
      expect(Array.isArray(level.concepts)).toBe(true)
      expect(level.concepts.length).toBeGreaterThan(0)
    }
  })

  it('has levels with rules arrays', () => {
    const hierarchy = engine.buildHierarchy(['factory pattern', 'singleton pattern'])
    for (const level of hierarchy.levels) {
      expect(Array.isArray(level.rules)).toBe(true)
    }
  })

  it('depth matches the number of levels', () => {
    const hierarchy = engine.buildHierarchy(['binary', 'opcodes', 'machine instructions'])
    expect(hierarchy.depth).toBe(hierarchy.levels.length)
  })
})

// ── findAbstractionLevel Tests ──

describe('AbstractionEngine findAbstractionLevel', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
  })

  it('returns level 1 for concrete items like machine code', () => {
    const level = engine.findAbstractionLevel('machine code')
    expect(level).toBe(1)
  })

  it('returns a higher level for abstract concepts', () => {
    const level = engine.findAbstractionLevel('declarative programming')
    expect(level).toBeGreaterThan(1)
  })

  it('returns a known level for programming languages in the hierarchy', () => {
    const level = engine.findAbstractionLevel('Python')
    expect(level).toBe(4)
  })

  it('returns a positive level for unknown concepts using heuristics', () => {
    const level = engine.findAbstractionLevel('some random concept')
    expect(level).toBeGreaterThanOrEqual(1)
  })
})

// ── mapBetweenLevels Tests ──

describe('AbstractionEngine mapBetweenLevels', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
  })

  it('returns identity mapping when from and to levels are the same', () => {
    const mapping = engine.mapBetweenLevels('Python', 4, 4)
    expect(mapping.concept).toBe('Python')
    expect(mapping.mappedConcept).toBe('Python')
    expect(mapping.confidence).toBe(1.0)
  })

  it('generalizes when moving to a higher level', () => {
    const mapping = engine.mapBetweenLevels('machine code', 1, 2)
    expect(mapping.fromLevel).toBe(1)
    expect(mapping.toLevel).toBe(2)
    expect(mapping.confidence).toBeGreaterThan(0)
  })

  it('specializes when moving to a lower level', () => {
    const mapping = engine.mapBetweenLevels('high-level language', 4, 3)
    expect(mapping.fromLevel).toBe(4)
    expect(mapping.toLevel).toBe(3)
    expect(mapping.confidence).toBeGreaterThan(0)
  })

  it('stores the mapping in the engine', () => {
    const mappingsBefore = engine.getMappings().length
    engine.mapBetweenLevels('Python', 4, 5)
    expect(engine.getMappings().length).toBe(mappingsBefore + 1)
  })
})

// ── extractPrototype Tests ──

describe('AbstractionEngine extractPrototype', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
  })

  it('extracts a prototype from valid examples', () => {
    const result = engine.extractPrototype([
      'sorting algorithm quicksort',
      'sorting algorithm mergesort',
      'sorting algorithm heapsort',
    ])
    expect(result).not.toBeNull()
    expect(result!.prototype).toBeDefined()
    expect(result!.category).toBeDefined()
  })

  it('returns null for empty array', () => {
    const result = engine.extractPrototype([])
    expect(result).toBeNull()
  })

  it('handles a single example', () => {
    const result = engine.extractPrototype(['binary search tree'])
    expect(result).not.toBeNull()
    expect(result!.memberCount).toBe(1)
    expect(result!.typicality).toBe(1.0)
  })

  it('returns typicality between 0 and 1', () => {
    const result = engine.extractPrototype([
      'red car fast',
      'blue car slow',
      'green car medium',
    ])
    expect(result).not.toBeNull()
    expect(result!.typicality).toBeGreaterThanOrEqual(0)
    expect(result!.typicality).toBeLessThanOrEqual(1)
  })

  it('stores the prototype for later retrieval', () => {
    engine.extractPrototype([
      'functional reactive programming',
      'functional programming paradigm',
    ])
    const prototypes = engine.getPrototypes()
    expect(prototypes.length).toBeGreaterThanOrEqual(1)
  })
})

// ── classifyByAbstraction Tests ──

describe('AbstractionEngine classifyByAbstraction', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
  })

  it('classifies a known item from built-in hierarchies', () => {
    const result = engine.classifyByAbstraction('factory pattern')
    expect(result).toBeDefined()
    expect(result.concept).toBeDefined()
    expect(result.level).toBeGreaterThanOrEqual(1)
  })

  it('returns confidence between 0 and 1', () => {
    const result = engine.classifyByAbstraction('observer pattern')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('classifies within a provided hierarchy', () => {
    const hierarchy = engine.buildHierarchy(['Python', 'JavaScript', 'Ruby'])
    const result = engine.classifyByAbstraction('Python', hierarchy)
    expect(result.concept).toBeDefined()
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('falls back to heuristic for completely unknown items', () => {
    const result = engine.classifyByAbstraction('xyzzy_unknown_thing_99999')
    expect(result).toBeDefined()
    expect(result.level).toBeGreaterThanOrEqual(1)
    expect(result.confidence).toBeGreaterThanOrEqual(0)
  })
})

// ── learnAbstraction Tests ──

describe('AbstractionEngine learnAbstraction', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
  })

  it('creates a new abstract concept from concrete examples', () => {
    const concept = engine.learnAbstraction(
      ['dog', 'cat', 'hamster'],
      'pet',
    )
    expect(concept).toBeDefined()
    expect(concept.name).toBe('pet')
    expect(concept.examples).toContain('dog')
    expect(concept.examples).toContain('cat')
    expect(concept.examples).toContain('hamster')
  })

  it('sets the abstraction level above the concrete examples', () => {
    const concept = engine.learnAbstraction(
      ['binary', 'opcodes'],
      'machine representation',
    )
    expect(concept.abstractionLevel).toBeGreaterThanOrEqual(1)
  })

  it('creates child concepts that can be retrieved by name', () => {
    engine.learnAbstraction(['apple', 'banana', 'cherry'], 'fruit')
    const apple = engine.findConceptByName('apple')
    expect(apple).toBeDefined()
    expect(apple!.parentId).not.toBeNull()
  })

  it('links children to the parent concept', () => {
    const parent = engine.learnAbstraction(['x86 assembly', 'ARM assembly'], 'assembly language')
    expect(parent.children.length).toBeGreaterThanOrEqual(2)
  })

  it('increments abstractionsMade counter', () => {
    const statsBefore = engine.getStats()
    engine.learnAbstraction(['a', 'b'], 'ab')
    const statsAfter = engine.getStats()
    expect(statsAfter.abstractionsMade).toBe(statsBefore.abstractionsMade + 1)
  })
})

// ── Concept Management Tests ──

describe('AbstractionEngine concept management', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
    engine.learnAbstraction(['alpha', 'beta', 'gamma'], 'greek letters')
  })

  it('getConcept returns a concept by ID', () => {
    const all = engine.getAllConcepts()
    expect(all.length).toBeGreaterThan(0)
    const first = all[0]
    const retrieved = engine.getConcept(first.id)
    expect(retrieved).toBeDefined()
    expect(retrieved!.id).toBe(first.id)
  })

  it('getConcept returns undefined for unknown IDs', () => {
    const result = engine.getConcept('nonexistent-id-12345')
    expect(result).toBeUndefined()
  })

  it('findConceptByName finds a concept case-insensitively', () => {
    const concept = engine.findConceptByName('Greek Letters')
    expect(concept).toBeDefined()
    expect(concept!.name).toBe('greek letters')
  })

  it('getAllConcepts returns all stored concepts', () => {
    const all = engine.getAllConcepts()
    expect(all.length).toBeGreaterThanOrEqual(4) // parent + 3 children
  })

  it('getPrototypes returns empty when none have been extracted', () => {
    const freshEngine = new AbstractionEngine()
    expect(freshEngine.getPrototypes()).toEqual([])
  })

  it('getMappings returns empty initially', () => {
    const freshEngine = new AbstractionEngine()
    expect(freshEngine.getMappings()).toEqual([])
  })
})

// ── getStats Tests ──

describe('AbstractionEngine getStats', () => {
  let engine: AbstractionEngine

  beforeEach(() => {
    engine = new AbstractionEngine()
  })

  it('returns stats with all expected fields', () => {
    const stats = engine.getStats()
    expect(typeof stats.conceptCount).toBe('number')
    expect(typeof stats.hierarchyDepth).toBe('number')
    expect(typeof stats.abstractionsMade).toBe('number')
    expect(typeof stats.generalizationsMade).toBe('number')
    expect(typeof stats.specializationsMade).toBe('number')
    expect(typeof stats.prototypeCount).toBe('number')
    expect(typeof stats.learnedMappings).toBe('number')
  })

  it('starts with all zero counters', () => {
    const stats = engine.getStats()
    expect(stats.conceptCount).toBe(0)
    expect(stats.abstractionsMade).toBe(0)
    expect(stats.generalizationsMade).toBe(0)
    expect(stats.specializationsMade).toBe(0)
    expect(stats.prototypeCount).toBe(0)
    expect(stats.learnedMappings).toBe(0)
  })

  it('updates after operations are performed', () => {
    engine.learnAbstraction(['x', 'y', 'z'], 'letters')
    engine.generalize(['Python', 'JavaScript'])
    engine.specialize('high-level language')
    engine.extractPrototype(['fast car', 'slow car'])
    engine.mapBetweenLevels('Python', 4, 5)

    const stats = engine.getStats()
    expect(stats.conceptCount).toBeGreaterThan(0)
    expect(stats.abstractionsMade).toBeGreaterThan(0)
    expect(stats.generalizationsMade).toBeGreaterThan(0)
    expect(stats.specializationsMade).toBeGreaterThan(0)
    expect(stats.prototypeCount).toBeGreaterThan(0)
    expect(stats.learnedMappings).toBeGreaterThan(0)
  })
})

// ── serialize / deserialize Tests ──

describe('AbstractionEngine serialize / deserialize', () => {
  it('round-trip preserves learned concepts', () => {
    const original = new AbstractionEngine()
    original.learnAbstraction(['dog', 'cat'], 'pet')

    const json = original.serialize()
    const restored = AbstractionEngine.deserialize(json)

    const concept = restored.findConceptByName('pet')
    expect(concept).toBeDefined()
    expect(concept!.name).toBe('pet')
  })

  it('round-trip preserves config', () => {
    const original = new AbstractionEngine({
      maxLevels: 12,
      similarityThreshold: 0.8,
    })

    const json = original.serialize()
    const data = JSON.parse(json)
    expect(data.config.maxLevels).toBe(12)
    expect(data.config.similarityThreshold).toBe(0.8)
  })

  it('round-trip preserves stats counters', () => {
    const original = new AbstractionEngine()
    original.learnAbstraction(['a', 'b'], 'ab')
    original.generalize(['Python', 'JavaScript'])
    original.specialize('machine code')

    const json = original.serialize()
    const restored = AbstractionEngine.deserialize(json)
    const stats = restored.getStats()

    expect(stats.abstractionsMade).toBeGreaterThan(0)
    expect(stats.generalizationsMade).toBeGreaterThan(0)
    expect(stats.specializationsMade).toBeGreaterThan(0)
  })

  it('deserialized engine is fully functional', () => {
    const original = new AbstractionEngine()
    original.learnAbstraction(['red', 'blue', 'green'], 'color')
    original.extractPrototype(['fast algorithm', 'slow algorithm', 'efficient algorithm'])

    const json = original.serialize()
    const restored = AbstractionEngine.deserialize(json)

    // Should be able to learn new abstractions
    const concept = restored.learnAbstraction(['circle', 'square'], 'shape')
    expect(concept).toBeDefined()
    expect(concept.name).toBe('shape')

    // Prototypes should be preserved
    const prototypes = restored.getPrototypes()
    expect(prototypes.length).toBeGreaterThan(0)
  })
})

// ── createProgrammingAbstractionEngine Tests ──

describe('createProgrammingAbstractionEngine', () => {
  it('returns an AbstractionEngine instance', () => {
    const engine = createProgrammingAbstractionEngine()
    expect(engine).toBeInstanceOf(AbstractionEngine)
  })

  it('comes pre-loaded with concepts', () => {
    const engine = createProgrammingAbstractionEngine()
    const stats = engine.getStats()
    expect(stats.conceptCount).toBeGreaterThan(0)
    expect(stats.abstractionsMade).toBeGreaterThan(0)
  })

  it('has programming language concepts available', () => {
    const engine = createProgrammingAbstractionEngine()
    const python = engine.findConceptByName('high-level language')
    expect(python).toBeDefined()
  })

  it('has design pattern concepts available', () => {
    const engine = createProgrammingAbstractionEngine()
    const concept = engine.findConceptByName('design pattern')
    expect(concept).toBeDefined()
  })

  it('has data structure concepts available', () => {
    const engine = createProgrammingAbstractionEngine()
    const concept = engine.findConceptByName('data structure')
    expect(concept).toBeDefined()
  })

  it('accepts optional config overrides', () => {
    const engine = createProgrammingAbstractionEngine({ maxLevels: 15 })
    expect(engine).toBeInstanceOf(AbstractionEngine)
  })
})
