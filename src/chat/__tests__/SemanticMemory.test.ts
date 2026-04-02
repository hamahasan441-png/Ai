import { describe, it, expect, beforeEach } from 'vitest'
import {
  SemanticMemory,
  createProgrammingKnowledgeGraph,
  type ConceptNode,
  type ConceptEdge,
  type RelationType,
  type SemanticMemoryConfig,
  type ActivationResult,
  type ConceptCluster,
  type Neighborhood,
  type ExtractedRelationship,
  type SemanticMemoryStats,
} from '../SemanticMemory'

// ── Constructor Tests ──

describe('SemanticMemory constructor', () => {
  it('creates empty memory with default config', () => {
    const mem = new SemanticMemory()
    const stats = mem.getStats()
    expect(stats.nodeCount).toBe(0)
    expect(stats.edgeCount).toBe(0)
  })

  it('applies custom config', () => {
    const mem = new SemanticMemory({ maxNodes: 10, activationDecay: 0.5 })
    expect(mem).toBeInstanceOf(SemanticMemory)
    // Verify maxNodes is respected by adding more than 10
    for (let i = 0; i < 12; i++) {
      mem.addConcept(`concept-${i}`, 'test')
    }
    expect(mem.getStats().nodeCount).toBeLessThanOrEqual(10)
  })

  it('creates pre-built knowledge graph via createProgrammingKnowledgeGraph', () => {
    const mem = createProgrammingKnowledgeGraph()
    const stats = mem.getStats()
    expect(stats.nodeCount).toBeGreaterThan(50)
    expect(stats.edgeCount).toBeGreaterThan(50)
  })

  it('accepts empty config object', () => {
    const mem = new SemanticMemory({})
    expect(mem).toBeInstanceOf(SemanticMemory)
  })
})

// ── addConcept Tests ──

describe('addConcept', () => {
  let mem: SemanticMemory

  beforeEach(() => {
    mem = new SemanticMemory()
  })

  it('adds a concept and returns an id', () => {
    const id = mem.addConcept('JavaScript', 'language')
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('concept has correct properties', () => {
    const id = mem.addConcept('React', 'framework')
    const concept = mem.getConcept(id)
    expect(concept).toBeDefined()
    expect(concept!.name).toBe('React')
    expect(concept!.domain).toBe('framework')
    expect(concept!.accessCount).toBeGreaterThanOrEqual(1)
    expect(concept!.decayedRelevance).toBe(1.0)
  })

  it('returns existing id for duplicate name', () => {
    const id1 = mem.addConcept('JavaScript', 'language')
    const id2 = mem.addConcept('JavaScript', 'language')
    expect(id1).toBe(id2)
  })

  it('handles duplicate name case insensitively', () => {
    const id1 = mem.addConcept('JavaScript', 'language')
    const id2 = mem.addConcept('javascript', 'language')
    expect(id1).toBe(id2)
  })

  it('throws on empty name', () => {
    expect(() => mem.addConcept('', 'test')).toThrow('Concept name must not be empty')
  })

  it('throws on whitespace-only name', () => {
    expect(() => mem.addConcept('   ', 'test')).toThrow('Concept name must not be empty')
  })

  it('stores embedding when provided', () => {
    const embedding = [0.1, 0.2, 0.3]
    const id = mem.addConcept('Vector', 'math', embedding)
    const concept = mem.getConcept(id)
    expect(concept!.embedding).toEqual(embedding)
  })

  it('uses empty embedding when not provided', () => {
    const id = mem.addConcept('NoEmbed', 'test')
    const concept = mem.getConcept(id)
    expect(concept!.embedding).toEqual([])
  })
})

// ── addRelation Tests ──

describe('addRelation', () => {
  let mem: SemanticMemory
  let jsId: string
  let tsId: string
  let reactId: string

  beforeEach(() => {
    mem = new SemanticMemory()
    jsId = mem.addConcept('JavaScript', 'language')
    tsId = mem.addConcept('TypeScript', 'language')
    reactId = mem.addConcept('React', 'framework')
  })

  it('creates edge between two concepts', () => {
    const edge = mem.addRelation(tsId, jsId, 'is-a', 0.9)
    expect(edge).toBeDefined()
    expect(edge!.source).toBe(tsId)
    expect(edge!.target).toBe(jsId)
    expect(edge!.relation).toBe('is-a')
    expect(edge!.weight).toBeCloseTo(0.9, 2)
  })

  it('strengthens existing edge on duplicate', () => {
    const edge1 = mem.addRelation(tsId, jsId, 'is-a', 0.5)
    const initialWeight = edge1!.weight
    const edge2 = mem.addRelation(tsId, jsId, 'is-a', 0.5)
    expect(edge2).toBeDefined()
    expect(edge2!.evidence).toBe(2)
    expect(edge2!.weight).toBeGreaterThan(initialWeight)
  })

  it('supports various relation types', () => {
    const relations: RelationType[] = [
      'is-a',
      'part-of',
      'related-to',
      'used-with',
      'depends-on',
      'similar-to',
      'opposite-of',
      'instance-of',
    ]
    for (const rel of relations) {
      // Create unique target concepts for each relation
      const targetId = mem.addConcept(`target-${rel}`, 'test')
      const edge = mem.addRelation(jsId, targetId, rel, 0.5)
      expect(edge).toBeDefined()
      expect(edge!.relation).toBe(rel)
    }
  })

  it('clamps weight to 0-1 range', () => {
    const edgeHigh = mem.addRelation(jsId, tsId, 'similar-to', 5.0)
    expect(edgeHigh!.weight).toBeLessThanOrEqual(1)

    const pyId = mem.addConcept('Python', 'language')
    const edgeLow = mem.addRelation(jsId, pyId, 'similar-to', -2.0)
    expect(edgeLow!.weight).toBeGreaterThanOrEqual(0)
  })

  it('returns undefined for invalid concept ids', () => {
    const edge = mem.addRelation('nonexistent1', 'nonexistent2', 'related-to', 0.5)
    expect(edge).toBeUndefined()
  })

  it('returns undefined when source or target missing', () => {
    const edge = mem.addRelation(jsId, 'nonexistent', 'related-to', 0.5)
    expect(edge).toBeUndefined()
  })

  it('returns undefined for self-referential edge', () => {
    const edge = mem.addRelation(jsId, jsId, 'related-to', 0.5)
    expect(edge).toBeUndefined()
  })
})

// ── getConcept / findConceptByName Tests ──

describe('getConcept / findConceptByName', () => {
  let mem: SemanticMemory
  let jsId: string

  beforeEach(() => {
    mem = new SemanticMemory()
    jsId = mem.addConcept('JavaScript', 'language')
  })

  it('retrieves concept by id', () => {
    const concept = mem.getConcept(jsId)
    expect(concept).toBeDefined()
    expect(concept!.name).toBe('JavaScript')
  })

  it('returns undefined for non-existent id', () => {
    const concept = mem.getConcept('nonexistent')
    expect(concept).toBeUndefined()
  })

  it('finds concept by name case-insensitively', () => {
    const concept = mem.findConceptByName('javascript')
    expect(concept).toBeDefined()
    expect(concept!.name).toBe('JavaScript')
  })

  it('returns undefined for non-existent name', () => {
    const concept = mem.findConceptByName('Haskell')
    expect(concept).toBeUndefined()
  })

  it('increments accessCount on each getConcept call', () => {
    const c1 = mem.getConcept(jsId)
    const count1 = c1!.accessCount
    const c2 = mem.getConcept(jsId)
    expect(c2!.accessCount).toBe(count1 + 1)
  })
})

// ── removeConcept Tests ──

describe('removeConcept', () => {
  let mem: SemanticMemory

  beforeEach(() => {
    mem = new SemanticMemory()
  })

  it('removes concept and its edges', () => {
    const jsId = mem.addConcept('JavaScript', 'language')
    const tsId = mem.addConcept('TypeScript', 'language')
    mem.addRelation(tsId, jsId, 'is-a', 0.9)

    expect(mem.removeConcept(jsId)).toBe(true)
    expect(mem.getConcept(jsId)).toBeUndefined()
    expect(mem.getStats().edgeCount).toBe(0)
  })

  it('returns false for non-existent concept', () => {
    expect(mem.removeConcept('nonexistent')).toBe(false)
  })

  it('graph stays consistent after removal', () => {
    const aId = mem.addConcept('A', 'test')
    const bId = mem.addConcept('B', 'test')
    const cId = mem.addConcept('C', 'test')
    mem.addRelation(aId, bId, 'related-to', 0.5)
    mem.addRelation(bId, cId, 'related-to', 0.5)
    mem.addRelation(aId, cId, 'related-to', 0.5)

    mem.removeConcept(bId)
    expect(mem.getStats().nodeCount).toBe(2)
    // Only edge A→C should remain
    expect(mem.getStats().edgeCount).toBe(1)
    expect(mem.findConceptByName('B')).toBeUndefined()
    // A and C still exist
    expect(mem.getConcept(aId)).toBeDefined()
    expect(mem.getConcept(cId)).toBeDefined()
  })

  it('removes concept from name index', () => {
    const id = mem.addConcept('Removable', 'test')
    mem.removeConcept(id)
    expect(mem.findConceptByName('Removable')).toBeUndefined()
  })
})

// ── spreadingActivation Tests ──

describe('spreadingActivation', () => {
  let mem: SemanticMemory
  let jsId: string
  let tsId: string
  let reactId: string
  let nextId: string

  beforeEach(() => {
    mem = new SemanticMemory()
    jsId = mem.addConcept('JavaScript', 'language')
    tsId = mem.addConcept('TypeScript', 'language')
    reactId = mem.addConcept('React', 'framework')
    nextId = mem.addConcept('Next.js', 'framework')
    mem.addRelation(tsId, jsId, 'is-a', 0.9)
    mem.addRelation(reactId, jsId, 'used-with', 0.9)
    mem.addRelation(nextId, reactId, 'depends-on', 0.95)
  })

  it('returns activated concepts from single seed', () => {
    const results = mem.spreadingActivation([jsId])
    expect(results.length).toBeGreaterThan(0)
    // Seed should have highest activation
    expect(results[0].conceptId).toBe(jsId)
    expect(results[0].activation).toBe(1.0)
  })

  it('propagates to neighbors', () => {
    const results = mem.spreadingActivation([jsId])
    const names = results.map(r => r.name)
    expect(names).toContain('TypeScript')
    expect(names).toContain('React')
  })

  it('handles multiple seeds', () => {
    const results = mem.spreadingActivation([jsId, reactId])
    expect(results.length).toBeGreaterThanOrEqual(2)
    const seedIds = results.filter(r => r.activation === 1.0).map(r => r.conceptId)
    expect(seedIds).toContain(jsId)
    expect(seedIds).toContain(reactId)
  })

  it('respects depth limit', () => {
    // With depth=1, Next.js may not be strongly reached from JS
    const shallow = mem.spreadingActivation([jsId], 1)
    const deep = mem.spreadingActivation([jsId], 3)
    expect(deep.length).toBeGreaterThanOrEqual(shallow.length)
  })

  it('higher-weight edges produce stronger activation', () => {
    const mem2 = new SemanticMemory()
    const a = mem2.addConcept('A', 'test')
    const b = mem2.addConcept('B', 'test')
    const c = mem2.addConcept('C', 'test')
    mem2.addRelation(a, b, 'related-to', 0.9)
    mem2.addRelation(a, c, 'related-to', 0.1)

    const results = mem2.spreadingActivation([a])
    const bResult = results.find(r => r.name === 'B')
    const cResult = results.find(r => r.name === 'C')
    // B should have higher activation since it has higher weight edge
    if (bResult && cResult) {
      expect(bResult.activation).toBeGreaterThan(cResult.activation)
    }
  })

  it('returns empty for empty seeds', () => {
    const results = mem.spreadingActivation([])
    expect(results).toEqual([])
  })

  it('respects top-K limiting', () => {
    const results = mem.spreadingActivation([jsId], 3, 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('returns results sorted by activation score', () => {
    const results = mem.spreadingActivation([jsId])
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].activation).toBeGreaterThanOrEqual(results[i].activation)
    }
  })
})

// ── findRelated Tests ──

describe('findRelated', () => {
  let mem: SemanticMemory
  let jsId: string
  let tsId: string
  let reactId: string
  let isolatedId: string

  beforeEach(() => {
    mem = new SemanticMemory()
    jsId = mem.addConcept('JavaScript', 'language')
    tsId = mem.addConcept('TypeScript', 'language')
    reactId = mem.addConcept('React', 'framework')
    isolatedId = mem.addConcept('Isolated', 'test')
    mem.addRelation(tsId, jsId, 'is-a', 0.9)
    mem.addRelation(reactId, jsId, 'used-with', 0.8)
  })

  it('finds related concepts', () => {
    const related = mem.findRelated(jsId)
    expect(related.length).toBeGreaterThan(0)
    const names = related.map(r => r.name)
    expect(names).toContain('TypeScript')
    expect(names).toContain('React')
  })

  it('filters by relation type', () => {
    const isA = mem.findRelated(jsId, 'is-a')
    const names = isA.map(r => r.name)
    expect(names).toContain('TypeScript')
    expect(names).not.toContain('React')
  })

  it('respects limit', () => {
    const related = mem.findRelated(jsId, undefined, 1)
    expect(related.length).toBeLessThanOrEqual(1)
  })

  it('returns empty for isolated concepts', () => {
    const related = mem.findRelated(isolatedId)
    expect(related).toEqual([])
  })

  it('returns empty for non-existent concept', () => {
    const related = mem.findRelated('nonexistent')
    expect(related).toEqual([])
  })
})

// ── clusterConcepts Tests ──

describe('clusterConcepts', () => {
  it('groups related concepts into clusters', () => {
    const mem = new SemanticMemory()
    const js = mem.addConcept('JavaScript', 'language')
    const ts = mem.addConcept('TypeScript', 'language')
    const py = mem.addConcept('Python', 'language')
    const django = mem.addConcept('Django', 'framework')
    mem.addRelation(ts, js, 'is-a', 0.9)
    mem.addRelation(django, py, 'used-with', 0.9)

    const clusters = mem.clusterConcepts(2)
    expect(clusters.length).toBeGreaterThan(0)
    // All nodes should be represented
    const allMembers = clusters.flatMap(c => c.members)
    expect(allMembers).toContain(js)
    expect(allMembers).toContain(ts)
    expect(allMembers).toContain(py)
    expect(allMembers).toContain(django)
  })

  it('returns up to k clusters', () => {
    const mem = new SemanticMemory()
    for (let i = 0; i < 10; i++) {
      mem.addConcept(`concept-${i}`, 'test')
    }
    const clusters = mem.clusterConcepts(3)
    expect(clusters.length).toBeLessThanOrEqual(3)
  })

  it('handles empty graph gracefully', () => {
    const mem = new SemanticMemory()
    const clusters = mem.clusterConcepts(3)
    expect(clusters).toEqual([])
  })

  it('handles fewer concepts than k', () => {
    const mem = new SemanticMemory()
    mem.addConcept('A', 'test')
    mem.addConcept('B', 'test')
    const clusters = mem.clusterConcepts(5)
    expect(clusters.length).toBeLessThanOrEqual(2)
  })
})

// ── extractRelationships Tests ──

describe('extractRelationships', () => {
  let mem: SemanticMemory

  beforeEach(() => {
    mem = new SemanticMemory()
  })

  it('extracts is-a relationships from "X is a type of Y"', () => {
    const results = mem.extractRelationships('TypeScript is a type of JavaScript')
    expect(results.length).toBeGreaterThan(0)
    const isA = results.find(r => r.relation === 'is-a')
    expect(isA).toBeDefined()
    expect(isA!.targetName.toLowerCase()).toContain('javascript')
  })

  it('extracts used-with from "X uses Y"', () => {
    const results = mem.extractRelationships('React uses JavaScript')
    const usedWith = results.find(r => r.relation === 'used-with')
    expect(usedWith).toBeDefined()
    expect(usedWith!.sourceName.toLowerCase()).toContain('react')
  })

  it('extracts depends-on from "X depends on Y"', () => {
    const results = mem.extractRelationships('Next.js depends on React')
    const dep = results.find(r => r.relation === 'depends-on')
    expect(dep).toBeDefined()
  })

  it('extracts multiple relationships from one text', () => {
    const text = 'TypeScript extends JavaScript. React uses TypeScript. Django depends on Python.'
    const results = mem.extractRelationships(text)
    expect(results.length).toBeGreaterThanOrEqual(3)
  })

  it('returns empty for no matches', () => {
    const results = mem.extractRelationships('The quick brown fox jumps over the lazy dog')
    expect(results).toEqual([])
  })

  it('extracts similar-to from "X is similar to Y"', () => {
    const results = mem.extractRelationships('Kotlin is similar to Java')
    const similar = results.find(r => r.relation === 'similar-to')
    expect(similar).toBeDefined()
  })
})

// ── getNeighborhood Tests ──

describe('getNeighborhood', () => {
  let mem: SemanticMemory
  let aId: string
  let bId: string
  let cId: string
  let isolatedId: string

  beforeEach(() => {
    mem = new SemanticMemory()
    aId = mem.addConcept('A', 'test')
    bId = mem.addConcept('B', 'test')
    cId = mem.addConcept('C', 'test')
    isolatedId = mem.addConcept('Isolated', 'test')
    mem.addRelation(aId, bId, 'related-to', 0.8)
    mem.addRelation(bId, cId, 'related-to', 0.7)
  })

  it('returns direct neighbors at depth 1', () => {
    const hood = mem.getNeighborhood(aId, 1)
    const nodeIds = hood.nodes.map(n => n.id)
    expect(nodeIds).toContain(aId)
    expect(nodeIds).toContain(bId)
    expect(hood.edges.length).toBeGreaterThan(0)
  })

  it('returns extended neighborhood at depth 2', () => {
    const hood = mem.getNeighborhood(aId, 2)
    const nodeIds = hood.nodes.map(n => n.id)
    expect(nodeIds).toContain(aId)
    expect(nodeIds).toContain(bId)
    expect(nodeIds).toContain(cId)
  })

  it('handles isolated concepts', () => {
    const hood = mem.getNeighborhood(isolatedId, 1)
    expect(hood.nodes.length).toBe(1)
    expect(hood.nodes[0].id).toBe(isolatedId)
    expect(hood.edges.length).toBe(0)
  })

  it('deduplicates edges', () => {
    const hood = mem.getNeighborhood(aId, 2)
    const edgeKeys = hood.edges.map(e => `${e.source}:${e.target}:${e.relation}`)
    const unique = new Set(edgeKeys)
    expect(unique.size).toBe(edgeKeys.length)
  })
})

// ── getStats Tests ──

describe('getStats', () => {
  it('returns correct counts for empty memory', () => {
    const mem = new SemanticMemory()
    const stats = mem.getStats()
    expect(stats.nodeCount).toBe(0)
    expect(stats.edgeCount).toBe(0)
    expect(stats.domains).toEqual([])
    expect(stats.avgEdgesPerNode).toBe(0)
  })

  it('returns correct counts after adding concepts and edges', () => {
    const mem = new SemanticMemory()
    const a = mem.addConcept('A', 'domain1')
    const b = mem.addConcept('B', 'domain2')
    mem.addRelation(a, b, 'related-to', 0.5)

    const stats = mem.getStats()
    expect(stats.nodeCount).toBe(2)
    expect(stats.edgeCount).toBe(1)
    expect(stats.domains).toContain('domain1')
    expect(stats.domains).toContain('domain2')
    expect(stats.avgEdgesPerNode).toBeCloseTo(0.5, 2)
  })

  it('pre-built graph has expected stats', () => {
    const mem = createProgrammingKnowledgeGraph()
    const stats = mem.getStats()
    expect(stats.nodeCount).toBeGreaterThan(70)
    expect(stats.edgeCount).toBeGreaterThan(80)
    expect(stats.domains.length).toBeGreaterThan(3)
    expect(stats.avgEdgesPerNode).toBeGreaterThan(0)
  })
})

// ── pruneStale Tests ──

describe('pruneStale', () => {
  it('removes old concepts with low access count', () => {
    const mem = new SemanticMemory()
    mem.addConcept('Old', 'test')
    // pruneStale checks (now - createdAt) > maxAge && accessCount <= 1
    // Use -1 so age (>= 0) is always greater than maxAge
    const removed = mem.pruneStale(-1)
    expect(removed).toBe(1)
    expect(mem.getStats().nodeCount).toBe(0)
  })

  it('keeps recently accessed concepts', () => {
    const mem = new SemanticMemory()
    const id = mem.addConcept('Active', 'test')
    // Access it multiple times to bump accessCount above 1
    mem.getConcept(id)
    mem.getConcept(id)
    // Even with maxAge=-1, accessCount > 1 so it should be kept
    const removed = mem.pruneStale(-1)
    expect(removed).toBe(0)
    expect(mem.getStats().nodeCount).toBe(1)
  })

  it('returns count of removed concepts', () => {
    const mem = new SemanticMemory()
    mem.addConcept('Stale1', 'test')
    mem.addConcept('Stale2', 'test')
    mem.addConcept('Stale3', 'test')
    const removed = mem.pruneStale(-1)
    expect(removed).toBe(3)
  })

  it('does not remove concepts younger than maxAge', () => {
    const mem = new SemanticMemory()
    mem.addConcept('Fresh', 'test')
    // Using a very large maxAge so the concept is not considered old
    const removed = mem.pruneStale(999999999)
    expect(removed).toBe(0)
  })
})

// ── serialize / deserialize Tests ──

describe('serialize / deserialize', () => {
  it('round-trip preserves concepts', () => {
    const mem = new SemanticMemory()
    mem.addConcept('JavaScript', 'language')
    mem.addConcept('Python', 'language')

    const json = mem.serialize()
    const restored = SemanticMemory.deserialize(json)
    expect(restored.getStats().nodeCount).toBe(2)
    expect(restored.findConceptByName('JavaScript')).toBeDefined()
    expect(restored.findConceptByName('Python')).toBeDefined()
  })

  it('round-trip preserves edges', () => {
    const mem = new SemanticMemory()
    const js = mem.addConcept('JavaScript', 'language')
    const ts = mem.addConcept('TypeScript', 'language')
    mem.addRelation(ts, js, 'is-a', 0.9)

    const json = mem.serialize()
    const restored = SemanticMemory.deserialize(json)
    expect(restored.getStats().edgeCount).toBe(1)
  })

  it('round-trip preserves config', () => {
    const mem = new SemanticMemory({ maxNodes: 42, activationDecay: 0.7 })
    mem.addConcept('Test', 'test')

    const json = mem.serialize()
    const data = JSON.parse(json)
    expect(data.config.maxNodes).toBe(42)
    expect(data.config.activationDecay).toBeCloseTo(0.7, 2)
  })

  it('deserialized memory works correctly', () => {
    const mem = new SemanticMemory()
    const a = mem.addConcept('A', 'test')
    const b = mem.addConcept('B', 'test')
    mem.addRelation(a, b, 'related-to', 0.8)

    const restored = SemanticMemory.deserialize(mem.serialize())
    // Can add new concepts
    const c = restored.addConcept('C', 'test')
    expect(restored.getStats().nodeCount).toBe(3)
    // Can find related
    const conceptA = restored.findConceptByName('A')
    expect(conceptA).toBeDefined()
    const related = restored.findRelated(conceptA!.id)
    expect(related.length).toBeGreaterThan(0)
  })

  it('handles invalid JSON gracefully', () => {
    expect(() => SemanticMemory.deserialize('not valid json')).toThrow()
  })

  it('preserves concept attributes', () => {
    const mem = new SemanticMemory()
    const id = mem.addConcept('Test', 'test')
    const concept = mem.getConcept(id)
    concept!.attributes.set('color', 'blue')

    const restored = SemanticMemory.deserialize(mem.serialize())
    const restoredConcept = restored.findConceptByName('Test')
    expect(restoredConcept!.attributes.get('color')).toBe('blue')
  })
})

// ── getConceptsByDomain Tests ──

describe('getConceptsByDomain', () => {
  let mem: SemanticMemory

  beforeEach(() => {
    mem = new SemanticMemory()
    mem.addConcept('JavaScript', 'language')
    mem.addConcept('Python', 'language')
    mem.addConcept('React', 'framework')
  })

  it('returns concepts in a domain', () => {
    const languages = mem.getConceptsByDomain('language')
    expect(languages.length).toBe(2)
    const names = languages.map(c => c.name)
    expect(names).toContain('JavaScript')
    expect(names).toContain('Python')
  })

  it('returns empty for unknown domain', () => {
    const result = mem.getConceptsByDomain('nonexistent')
    expect(result).toEqual([])
  })

  it('is case insensitive', () => {
    const result = mem.getConceptsByDomain('LANGUAGE')
    expect(result.length).toBe(2)
  })
})

// ── mergeFrom Tests ──

describe('mergeFrom', () => {
  it('merges concepts from another memory', () => {
    const mem1 = new SemanticMemory()
    mem1.addConcept('JavaScript', 'language')

    const mem2 = new SemanticMemory()
    mem2.addConcept('Python', 'language')
    mem2.addConcept('Django', 'framework')

    mem1.mergeFrom(mem2)
    expect(mem1.getStats().nodeCount).toBe(3)
    expect(mem1.findConceptByName('Python')).toBeDefined()
    expect(mem1.findConceptByName('Django')).toBeDefined()
  })

  it('deduplicates by name', () => {
    const mem1 = new SemanticMemory()
    mem1.addConcept('JavaScript', 'language')

    const mem2 = new SemanticMemory()
    mem2.addConcept('JavaScript', 'language')

    mem1.mergeFrom(mem2)
    expect(mem1.getStats().nodeCount).toBe(1)
  })

  it('merges edges with id remapping', () => {
    const mem1 = new SemanticMemory()
    mem1.addConcept('JavaScript', 'language')

    const mem2 = new SemanticMemory()
    const py = mem2.addConcept('Python', 'language')
    const django = mem2.addConcept('Django', 'framework')
    mem2.addRelation(django, py, 'used-with', 0.9)

    mem1.mergeFrom(mem2)
    expect(mem1.getStats().edgeCount).toBe(1)
    // Verify the edge works via findRelated
    const pyNode = mem1.findConceptByName('Python')
    const related = mem1.findRelated(pyNode!.id)
    expect(related.length).toBeGreaterThan(0)
  })

  it('merges attributes from duplicate concepts', () => {
    const mem1 = new SemanticMemory()
    const id1 = mem1.addConcept('JavaScript', 'language')
    const node1 = mem1.getConcept(id1)
    node1!.attributes.set('paradigm', 'multi')

    const mem2 = new SemanticMemory()
    const id2 = mem2.addConcept('JavaScript', 'language')
    const node2 = mem2.getConcept(id2)
    node2!.attributes.set('typing', 'dynamic')

    mem1.mergeFrom(mem2)
    const merged = mem1.findConceptByName('JavaScript')
    expect(merged!.attributes.get('paradigm')).toBe('multi')
    expect(merged!.attributes.get('typing')).toBe('dynamic')
  })
})

// ── createProgrammingKnowledgeGraph Tests ──

describe('createProgrammingKnowledgeGraph', () => {
  it('creates graph with expected number of concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const stats = mem.getStats()
    // The graph has ~80 concepts
    expect(stats.nodeCount).toBeGreaterThanOrEqual(75)
  })

  it('has relationship edges', () => {
    const mem = createProgrammingKnowledgeGraph()
    const stats = mem.getStats()
    expect(stats.edgeCount).toBeGreaterThan(80)
  })

  it('contains known concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    expect(mem.findConceptByName('JavaScript')).toBeDefined()
    expect(mem.findConceptByName('React')).toBeDefined()
    expect(mem.findConceptByName('function')).toBeDefined()
    expect(mem.findConceptByName('Python')).toBeDefined()
    expect(mem.findConceptByName('Docker')).toBeDefined()
  })

  it('has multiple domains', () => {
    const mem = createProgrammingKnowledgeGraph()
    const stats = mem.getStats()
    expect(stats.domains).toContain('language')
    expect(stats.domains).toContain('framework')
    expect(stats.domains).toContain('concept')
    expect(stats.domains).toContain('pattern')
  })

  it('accepts custom config', () => {
    const mem = createProgrammingKnowledgeGraph({ activationDecay: 0.5 })
    expect(mem).toBeInstanceOf(SemanticMemory)
  })
})
