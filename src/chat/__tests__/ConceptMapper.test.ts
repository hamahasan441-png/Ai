import { describe, it, expect, beforeEach } from 'vitest'
import { ConceptMapper } from '../ConceptMapper'

// ── Constructor Tests ──

describe('ConceptMapper constructor', () => {
  it('creates an instance with default config', () => {
    const mapper = new ConceptMapper()
    expect(mapper).toBeInstanceOf(ConceptMapper)
  })

  it('accepts a partial custom config', () => {
    const mapper = new ConceptMapper({ maxConcepts: 100 })
    expect(mapper).toBeInstanceOf(ConceptMapper)
  })

  it('accepts a full custom config', () => {
    const mapper = new ConceptMapper({
      maxConcepts: 100,
      maxRelations: 500,
      enableInference: false,
      enableSimilarity: false,
      enableHierarchy: false,
      spreadingActivationDecay: 0.3,
      maxPathDepth: 4,
    })
    expect(mapper).toBeInstanceOf(ConceptMapper)
  })

  it('seeds programming domain concepts on construction', () => {
    const mapper = new ConceptMapper()
    const programming = mapper.findConcept('Programming')
    expect(programming).not.toBeNull()
    expect(programming!.name).toBe('Programming')
  })
})

// ── addConcept / getConcept / findConcept / removeConcept Tests ──

describe('ConceptMapper concept CRUD', () => {
  let mapper: ConceptMapper

  beforeEach(() => {
    mapper = new ConceptMapper()
  })

  it('addConcept returns a concept with a generated id', () => {
    const concept = mapper.addConcept({
      name: 'React',
      description: 'A JavaScript library for building user interfaces',
      domain: 'frontend',
      properties: new Map([['type', 'library']]),
      tags: ['ui', 'javascript'],
    })
    expect(concept.id).toBeDefined()
    expect(concept.id.startsWith('CON-')).toBe(true)
    expect(concept.name).toBe('React')
    expect(concept.activation).toBe(0)
  })

  it('getConcept retrieves a concept by id', () => {
    const created = mapper.addConcept({
      name: 'Docker',
      description: 'A containerization platform',
      domain: 'devops',
      properties: new Map(),
      tags: ['containers'],
    })
    const retrieved = mapper.getConcept(created.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved!.name).toBe('Docker')
  })

  it('getConcept returns null for unknown id', () => {
    expect(mapper.getConcept('nonexistent-id')).toBeNull()
  })

  it('findConcept performs case-insensitive lookup', () => {
    const found = mapper.findConcept('algorithm')
    expect(found).not.toBeNull()
    expect(found!.name).toBe('Algorithm')

    const alsoFound = mapper.findConcept('ALGORITHM')
    expect(alsoFound).not.toBeNull()
    expect(alsoFound!.id).toBe(found!.id)
  })

  it('findConcept returns null for unknown name', () => {
    expect(mapper.findConcept('Nonexistent Concept')).toBeNull()
  })

  it('removeConcept removes the concept and its relations', () => {
    const concept = mapper.addConcept({
      name: 'Temp',
      description: 'Temporary concept',
      domain: 'test',
      properties: new Map(),
      tags: [],
    })
    const programming = mapper.findConcept('Programming')!
    mapper.addRelation(concept.id, programming.id, 'part_of', 0.5)

    const removed = mapper.removeConcept(concept.id)
    expect(removed).toBe(true)
    expect(mapper.getConcept(concept.id)).toBeNull()
    expect(mapper.findConcept('Temp')).toBeNull()
  })

  it('removeConcept returns false for unknown id', () => {
    expect(mapper.removeConcept('nonexistent-id')).toBe(false)
  })

  it('addConcept throws when maxConcepts limit is reached', () => {
    const small = new ConceptMapper({ maxConcepts: 22 })
    expect(() =>
      small.addConcept({
        name: 'Overflow',
        description: 'Should exceed limit',
        domain: 'test',
        properties: new Map(),
        tags: [],
      }),
    ).toThrow('Maximum concept limit')
  })
})

// ── Relation CRUD Tests ──

describe('ConceptMapper relation CRUD', () => {
  let mapper: ConceptMapper

  beforeEach(() => {
    mapper = new ConceptMapper()
  })

  it('addRelation creates a directed relation between two concepts', () => {
    const a = mapper.findConcept('Array')!
    const sorting = mapper.findConcept('Sorting')!
    const rel = mapper.addRelation(a.id, sorting.id, 'used_for', 0.7)
    expect(rel.id).toBeDefined()
    expect(rel.source).toBe(a.id)
    expect(rel.target).toBe(sorting.id)
    expect(rel.type).toBe('used_for')
    expect(rel.weight).toBe(0.7)
    expect(rel.bidirectional).toBe(false)
  })

  it('getRelation retrieves a relation by id', () => {
    const a = mapper.findConcept('Array')!
    const sorting = mapper.findConcept('Sorting')!
    const created = mapper.addRelation(a.id, sorting.id, 'enables', 0.6)
    const retrieved = mapper.getRelation(created.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved!.type).toBe('enables')
  })

  it('getRelation returns null for unknown id', () => {
    expect(mapper.getRelation('nonexistent-rel')).toBeNull()
  })

  it('removeRelation removes a relation and returns true', () => {
    const a = mapper.findConcept('Array')!
    const tree = mapper.findConcept('Tree')!
    const rel = mapper.addRelation(a.id, tree.id, 'similar_to', 0.4)
    expect(mapper.removeRelation(rel.id)).toBe(true)
    expect(mapper.getRelation(rel.id)).toBeNull()
  })

  it('removeRelation returns false for unknown id', () => {
    expect(mapper.removeRelation('nonexistent-rel')).toBe(false)
  })

  it('addRelation throws if source concept does not exist', () => {
    const tree = mapper.findConcept('Tree')!
    expect(() => mapper.addRelation('bad-id', tree.id, 'is_a')).toThrow('Source concept')
  })

  it('addRelation throws if target concept does not exist', () => {
    const tree = mapper.findConcept('Tree')!
    expect(() => mapper.addRelation(tree.id, 'bad-id', 'is_a')).toThrow('Target concept')
  })

  it('addRelation clamps weight to [0, 1]', () => {
    const a = mapper.findConcept('Array')!
    const tree = mapper.findConcept('Tree')!
    const rel = mapper.addRelation(a.id, tree.id, 'similar_to', 5.0)
    expect(rel.weight).toBeLessThanOrEqual(1)
  })
})

// ── getRelated Tests ──

describe('ConceptMapper getRelated', () => {
  let mapper: ConceptMapper

  beforeEach(() => {
    mapper = new ConceptMapper()
  })

  it('returns directly related concepts', () => {
    const ds = mapper.findConcept('Data Structure')!
    const related = mapper.getRelated(ds.id)
    expect(related.length).toBeGreaterThan(0)
  })

  it('filters by relation type when provided', () => {
    const ds = mapper.findConcept('Data Structure')!
    const related = mapper.getRelated(ds.id, 'part_of')
    const names = related.map(c => c.name)
    expect(names).toContain('Programming')
  })

  it('returns empty array for concept with no outgoing relations of given type', () => {
    const concept = mapper.addConcept({
      name: 'Isolated',
      description: 'No relations',
      domain: 'test',
      properties: new Map(),
      tags: [],
    })
    const related = mapper.getRelated(concept.id)
    expect(related).toEqual([])
  })
})

// ── getAncestors / getDescendants Tests ──

describe('ConceptMapper hierarchy', () => {
  let mapper: ConceptMapper

  beforeEach(() => {
    mapper = new ConceptMapper()
  })

  it('getAncestors returns ancestor chain via is_a/part_of', () => {
    const array = mapper.findConcept('Array')!
    const ancestors = mapper.getAncestors(array.id)
    const names = ancestors.map(c => c.name)
    expect(names).toContain('Data Structure')
  })

  it('getDescendants returns children via is_a/part_of', () => {
    const ds = mapper.findConcept('Data Structure')!
    const descendants = mapper.getDescendants(ds.id)
    const names = descendants.map(c => c.name)
    expect(names).toContain('Array')
    expect(names).toContain('Linked List')
    expect(names).toContain('Hash Map')
  })

  it('getAncestors returns empty when hierarchy is disabled', () => {
    const noHierarchy = new ConceptMapper({ enableHierarchy: false })
    const array = noHierarchy.findConcept('Array')!
    expect(noHierarchy.getAncestors(array.id)).toEqual([])
  })

  it('getDescendants returns empty when hierarchy is disabled', () => {
    const noHierarchy = new ConceptMapper({ enableHierarchy: false })
    const ds = noHierarchy.findConcept('Data Structure')!
    expect(noHierarchy.getDescendants(ds.id)).toEqual([])
  })
})

// ── findPath / findAllPaths Tests ──

describe('ConceptMapper pathfinding', () => {
  let mapper: ConceptMapper

  beforeEach(() => {
    mapper = new ConceptMapper()
  })

  it('findPath returns shortest path between connected concepts', () => {
    const array = mapper.findConcept('Array')!
    const programming = mapper.findConcept('Programming')!
    const path = mapper.findPath(array.id, programming.id)
    expect(path).not.toBeNull()
    expect(path!.concepts.length).toBeGreaterThanOrEqual(2)
    expect(path!.concepts[0]).toBe(array.id)
    expect(path!.concepts[path!.concepts.length - 1]).toBe(programming.id)
    expect(path!.length).toBe(path!.relations.length)
  })

  it('findPath returns trivial path when source equals target', () => {
    const array = mapper.findConcept('Array')!
    const path = mapper.findPath(array.id, array.id)
    expect(path).not.toBeNull()
    expect(path!.concepts).toEqual([array.id])
    expect(path!.relations).toEqual([])
    expect(path!.length).toBe(0)
  })

  it('findPath returns null when no path exists', () => {
    const isolated = mapper.addConcept({
      name: 'Isolated',
      description: 'Disconnected',
      domain: 'test',
      properties: new Map(),
      tags: [],
    })
    const array = mapper.findConcept('Array')!
    expect(mapper.findPath(isolated.id, array.id)).toBeNull()
  })

  it('findPath returns null for nonexistent concept ids', () => {
    const array = mapper.findConcept('Array')!
    expect(mapper.findPath('bad-id', array.id)).toBeNull()
    expect(mapper.findPath(array.id, 'bad-id')).toBeNull()
  })

  it('findAllPaths returns multiple paths between connected concepts', () => {
    const sorting = mapper.findConcept('Sorting')!
    const programming = mapper.findConcept('Programming')!
    const paths = mapper.findAllPaths(sorting.id, programming.id)
    expect(paths.length).toBeGreaterThan(0)
    for (const p of paths) {
      expect(p.concepts[0]).toBe(sorting.id)
      expect(p.concepts[p.concepts.length - 1]).toBe(programming.id)
      expect(p.totalWeight).toBeGreaterThanOrEqual(0)
    }
  })

  it('findAllPaths returns empty for disconnected concepts', () => {
    const isolated = mapper.addConcept({
      name: 'Island',
      description: 'No edges',
      domain: 'test',
      properties: new Map(),
      tags: [],
    })
    const array = mapper.findConcept('Array')!
    expect(mapper.findAllPaths(isolated.id, array.id)).toEqual([])
  })
})

// ── computeSimilarity Tests ──

describe('ConceptMapper computeSimilarity', () => {
  let mapper: ConceptMapper

  beforeEach(() => {
    mapper = new ConceptMapper()
  })

  it('returns a similarity score between 0 and 1 for two concepts', () => {
    const array = mapper.findConcept('Array')!
    const linkedList = mapper.findConcept('Linked List')!
    const result = mapper.computeSimilarity(array.id, linkedList.id)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
    expect(result.conceptA).toBe(array.id)
    expect(result.conceptB).toBe(linkedList.id)
  })

  it('returns higher similarity for concepts in the same domain with shared properties', () => {
    const array = mapper.findConcept('Array')!
    const linkedList = mapper.findConcept('Linked List')!
    const compiler = mapper.findConcept('Compiler')!
    const similar = mapper.computeSimilarity(array.id, linkedList.id)
    const dissimilar = mapper.computeSimilarity(array.id, compiler.id)
    expect(similar.score).toBeGreaterThan(dissimilar.score)
  })

  it('returns score 0 when similarity is disabled', () => {
    const noSim = new ConceptMapper({ enableSimilarity: false })
    const array = noSim.findConcept('Array')!
    const linkedList = noSim.findConcept('Linked List')!
    const result = noSim.computeSimilarity(array.id, linkedList.id)
    expect(result.score).toBe(0)
  })

  it('returns score 0 for nonexistent concept ids', () => {
    const array = mapper.findConcept('Array')!
    const result = mapper.computeSimilarity(array.id, 'bad-id')
    expect(result.score).toBe(0)
  })
})

// ── spreadActivation Tests ──

describe('ConceptMapper spreadActivation', () => {
  let mapper: ConceptMapper

  beforeEach(() => {
    mapper = new ConceptMapper()
  })

  it('activates the start concept and its neighbours', () => {
    const programming = mapper.findConcept('Programming')!
    const result = mapper.spreadActivation(programming.id)
    expect(result.totalActivated).toBeGreaterThan(0)
    expect(result.steps).toBeGreaterThan(0)
    const startEntry = result.activatedConcepts.find(ac => ac.conceptId === programming.id)
    expect(startEntry).toBeDefined()
    expect(startEntry!.activation).toBe(1)
  })

  it('activated concepts are sorted by activation descending', () => {
    const ds = mapper.findConcept('Data Structure')!
    const result = mapper.spreadActivation(ds.id)
    for (let i = 1; i < result.activatedConcepts.length; i++) {
      expect(result.activatedConcepts[i - 1].activation).toBeGreaterThanOrEqual(
        result.activatedConcepts[i].activation,
      )
    }
  })

  it('returns empty result for nonexistent concept', () => {
    const result = mapper.spreadActivation('bad-id')
    expect(result.totalActivated).toBe(0)
    expect(result.steps).toBe(0)
  })

  it('respects custom initial energy', () => {
    const ds = mapper.findConcept('Data Structure')!
    const result = mapper.spreadActivation(ds.id, 2.0)
    const startEntry = result.activatedConcepts.find(ac => ac.conceptId === ds.id)
    expect(startEntry).toBeDefined()
    expect(startEntry!.activation).toBe(2)
  })
})

// ── infer Tests ──

describe('ConceptMapper infer', () => {
  let mapper: ConceptMapper

  beforeEach(() => {
    mapper = new ConceptMapper()
  })

  it('derives transitive inferences for a concept', () => {
    const tree = mapper.findConcept('Tree')!
    const inferences = mapper.infer(tree.id)
    expect(inferences.length).toBeGreaterThan(0)
    for (const inf of inferences) {
      expect(inf.conclusion.length).toBeGreaterThan(0)
      expect(inf.premises.length).toBeGreaterThan(0)
      expect(inf.confidence).toBeGreaterThan(0)
      expect(inf.confidence).toBeLessThanOrEqual(1)
      expect(inf.ruleApplied.length).toBeGreaterThan(0)
    }
  })

  it('returns empty when inference is disabled', () => {
    const noInf = new ConceptMapper({ enableInference: false })
    const array = noInf.findConcept('Array')!
    expect(noInf.infer(array.id)).toEqual([])
  })

  it('returns empty for nonexistent concept', () => {
    expect(mapper.infer('bad-id')).toEqual([])
  })

  it('includes sibling similarity inferences for is_a siblings', () => {
    const array = mapper.findConcept('Array')!
    const inferences = mapper.infer(array.id)
    const siblingRules = inferences.filter(inf => inf.ruleApplied === 'sibling_similarity')
    expect(siblingRules.length).toBeGreaterThan(0)
  })
})

// ── clusterConcepts Tests ──

describe('ConceptMapper clusterConcepts', () => {
  let mapper: ConceptMapper

  beforeEach(() => {
    mapper = new ConceptMapper()
  })

  it('returns at least one cluster from seeded data', () => {
    const clusters = mapper.clusterConcepts()
    expect(clusters.length).toBeGreaterThan(0)
  })

  it('each cluster has required fields', () => {
    const clusters = mapper.clusterConcepts()
    for (const cluster of clusters) {
      expect(cluster.id).toBeDefined()
      expect(cluster.name.length).toBeGreaterThan(0)
      expect(cluster.concepts.length).toBeGreaterThan(0)
      expect(typeof cluster.cohesion).toBe('number')
      expect(cluster.cohesion).toBeGreaterThanOrEqual(0)
      expect(cluster.cohesion).toBeLessThanOrEqual(1)
      expect(cluster.centralConcept).toBeDefined()
    }
  })

  it('all concepts appear in exactly one cluster', () => {
    const clusters = mapper.clusterConcepts()
    const allConceptIds = clusters.flatMap(c => c.concepts)
    const unique = new Set(allConceptIds)
    expect(unique.size).toBe(allConceptIds.length)
  })
})

// ── getSummary Tests ──

describe('ConceptMapper getSummary', () => {
  it('returns a complete summary of the concept map', () => {
    const mapper = new ConceptMapper()
    const summary = mapper.getSummary()
    expect(summary.totalConcepts).toBeGreaterThan(0)
    expect(summary.totalRelations).toBeGreaterThan(0)
    expect(summary.domains.length).toBeGreaterThan(0)
    expect(Array.isArray(summary.topConcepts)).toBe(true)
    expect(summary.topConcepts.length).toBeGreaterThan(0)
    expect(Array.isArray(summary.clusters)).toBe(true)
  })
})

// ── mergeMaps Tests ──

describe('ConceptMapper mergeMaps', () => {
  it('merges concepts and relations from another mapper', () => {
    const mapperA = new ConceptMapper()
    const mapperB = new ConceptMapper()
    const newConcept = mapperB.addConcept({
      name: 'Kubernetes',
      description: 'Container orchestration platform',
      domain: 'devops',
      properties: new Map([['type', 'platform']]),
      tags: ['devops', 'containers'],
    })
    const programming = mapperB.findConcept('Programming')!
    mapperB.addRelation(newConcept.id, programming.id, 'enables', 0.7)

    const beforeCount = mapperA.getStats().totalConcepts
    mapperA.mergeMaps(mapperB)
    expect(mapperA.getStats().totalConcepts).toBeGreaterThan(beforeCount)
    expect(mapperA.findConcept('Kubernetes')).not.toBeNull()
  })

  it('merges properties and tags for overlapping concepts', () => {
    const mapperA = new ConceptMapper()
    const mapperB = new ConceptMapper()

    const arrayB = mapperB.findConcept('Array')!
    arrayB.properties.set('custom_prop', 'value')
    arrayB.tags.push('custom_tag')

    mapperA.mergeMaps(mapperB)
    const arrayA = mapperA.findConcept('Array')!
    expect(arrayA.properties.get('custom_prop')).toBe('value')
    expect(arrayA.tags).toContain('custom_tag')
  })
})

// ── learnRelation Tests ──

describe('ConceptMapper learnRelation', () => {
  let mapper: ConceptMapper

  beforeEach(() => {
    mapper = new ConceptMapper()
  })

  it('creates a new relation when none exists', () => {
    const array = mapper.findConcept('Array')!
    const compiler = mapper.findConcept('Compiler')!
    const relsBefore = mapper.getStats().totalRelations
    mapper.learnRelation(array.id, compiler.id, 'used_for')
    expect(mapper.getStats().totalRelations).toBe(relsBefore + 1)
    expect(mapper.getStats().feedbackCount).toBe(1)
  })

  it('reinforces weight of existing relation', () => {
    const array = mapper.findConcept('Array')!
    const compiler = mapper.findConcept('Compiler')!
    mapper.learnRelation(array.id, compiler.id, 'used_for')
    const relsBefore = mapper.getStats().totalRelations
    mapper.learnRelation(array.id, compiler.id, 'used_for')
    // Should not create a new relation
    expect(mapper.getStats().totalRelations).toBe(relsBefore)
    expect(mapper.getStats().feedbackCount).toBe(2)
  })

  it('does nothing for nonexistent concepts', () => {
    const relsBefore = mapper.getStats().totalRelations
    mapper.learnRelation('bad-id', 'also-bad', 'is_a')
    expect(mapper.getStats().totalRelations).toBe(relsBefore)
  })
})

// ── getStats Tests ──

describe('ConceptMapper getStats', () => {
  it('returns stats with all required fields', () => {
    const mapper = new ConceptMapper()
    const stats = mapper.getStats()
    expect(typeof stats.totalConcepts).toBe('number')
    expect(typeof stats.totalRelations).toBe('number')
    expect(typeof stats.totalQueries).toBe('number')
    expect(typeof stats.totalInferences).toBe('number')
    expect(typeof stats.totalPathsFound).toBe('number')
    expect(typeof stats.avgQueryTime).toBe('number')
    expect(typeof stats.feedbackCount).toBe('number')
    expect(stats.totalConcepts).toBeGreaterThan(0)
    expect(stats.totalRelations).toBeGreaterThan(0)
  })

  it('totalQueries increments after queries', () => {
    const mapper = new ConceptMapper()
    const before = mapper.getStats().totalQueries
    const array = mapper.findConcept('Array')!
    mapper.getRelated(array.id)
    expect(mapper.getStats().totalQueries).toBeGreaterThan(before)
  })
})

// ── serialize / deserialize Tests ──

describe('ConceptMapper serialize / deserialize', () => {
  it('round-trips through serialize and deserialize', () => {
    const mapper = new ConceptMapper()
    const array = mapper.findConcept('Array')!
    mapper.getRelated(array.id)
    mapper.infer(array.id)

    const json = mapper.serialize()
    expect(typeof json).toBe('string')

    const restored = ConceptMapper.deserialize(json)
    expect(restored).toBeInstanceOf(ConceptMapper)

    const originalStats = mapper.getStats()
    const restoredStats = restored.getStats()
    expect(restoredStats.totalConcepts).toBe(originalStats.totalConcepts)
    expect(restoredStats.totalRelations).toBe(originalStats.totalRelations)
  })

  it('preserves concepts and their properties after round-trip', () => {
    const mapper = new ConceptMapper()
    const json = mapper.serialize()
    const restored = ConceptMapper.deserialize(json)

    const original = mapper.findConcept('Array')!
    const restoredConcept = restored.findConcept('Array')!
    expect(restoredConcept.name).toBe(original.name)
    expect(restoredConcept.domain).toBe(original.domain)
    expect(restoredConcept.description).toBe(original.description)
  })

  it('preserves relations after round-trip', () => {
    const mapper = new ConceptMapper()
    const originalRelCount = mapper.getStats().totalRelations
    const json = mapper.serialize()
    const restored = ConceptMapper.deserialize(json)
    expect(restored.getStats().totalRelations).toBe(originalRelCount)
  })
})
