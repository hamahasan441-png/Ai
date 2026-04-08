import { describe, it, expect, beforeEach } from 'vitest'
import { KnowledgeGraphEngine, DEFAULT_KNOWLEDGE_GRAPH_CONFIG } from '../KnowledgeGraphEngine.js'

describe('KnowledgeGraphEngine', () => {
  let engine: KnowledgeGraphEngine

  beforeEach(() => {
    engine = new KnowledgeGraphEngine()
  })

  describe('Configuration', () => {
    it('should use default config', () => {
      expect(DEFAULT_KNOWLEDGE_GRAPH_CONFIG.maxEntities).toBe(10000)
      expect(DEFAULT_KNOWLEDGE_GRAPH_CONFIG.inferenceEnabled).toBe(true)
    })

    it('should accept custom config', () => {
      const e = new KnowledgeGraphEngine({ maxEntities: 500 })
      expect(e).toBeInstanceOf(KnowledgeGraphEngine)
    })
  })

  describe('Entity operations', () => {
    it('should add entity with properties', () => {
      const ent = engine.addEntity('TypeScript', 'concept', { paradigm: 'typed' }, ['TS'])
      expect(ent.name).toBe('TypeScript')
      expect(ent.type).toBe('concept')
      expect(ent.properties.get('paradigm')).toBe('typed')
      expect(ent.aliases).toContain('TS')
    })

    it('should retrieve entity by id', () => {
      const ent = engine.addEntity('Node.js', 'artifact')
      expect(engine.getEntity(ent.id)).toEqual(ent)
    })

    it('should return null for unknown entity', () => {
      expect(engine.getEntity('unknown')).toBeNull()
    })

    it('should find entities by name', () => {
      engine.addEntity('JavaScript', 'concept')
      engine.addEntity('Java', 'concept')
      const found = engine.findEntitiesByName('java')
      expect(found.length).toBeGreaterThanOrEqual(2)
    })

    it('should find entities by alias', () => {
      engine.addEntity('TypeScript', 'concept', {}, ['TS'])
      const found = engine.findEntitiesByName('TS')
      expect(found.length).toBe(1)
    })

    it('should find entities by type', () => {
      engine.addEntity('Linus Torvalds', 'person')
      engine.addEntity('Guido van Rossum', 'person')
      engine.addEntity('Python', 'concept')
      expect(engine.findEntitiesByType('person').length).toBe(2)
    })

    it('should remove entity and its relations', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      engine.addRelation(a.id, b.id, 'related_to')
      expect(engine.removeEntity(a.id)).toBe(true)
      expect(engine.getEntity(a.id)).toBeNull()
    })

    it('should return false when removing nonexistent entity', () => {
      expect(engine.removeEntity('missing')).toBe(false)
    })
  })

  describe('Relation operations', () => {
    it('should add directed relation', () => {
      const a = engine.addEntity('Cat', 'concept')
      const b = engine.addEntity('Animal', 'concept')
      const rel = engine.addRelation(a.id, b.id, 'is_a', 'is a', 0.95)
      expect(rel).not.toBeNull()
      expect(rel!.type).toBe('is_a')
      expect(rel!.weight).toBeCloseTo(0.95)
    })

    it('should add bidirectional relation', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      const rel = engine.addRelation(a.id, b.id, 'similar_to', '', 1, true)
      expect(rel!.bidirectional).toBe(true)
    })

    it('should return null for missing entities', () => {
      const a = engine.addEntity('A', 'concept')
      expect(engine.addRelation(a.id, 'missing', 'related_to')).toBeNull()
    })

    it('should clamp weight to [0,1]', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      const rel = engine.addRelation(a.id, b.id, 'related_to', '', 5)
      expect(rel!.weight).toBe(1)
    })

    it('should get relations of entity', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      const c = engine.addEntity('C', 'concept')
      engine.addRelation(a.id, b.id, 'is_a')
      engine.addRelation(a.id, c.id, 'related_to')
      expect(engine.getRelationsOf(a.id).length).toBe(2)
    })

    it('should remove relation', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      const rel = engine.addRelation(a.id, b.id, 'is_a')
      expect(engine.removeRelation(rel!.id)).toBe(true)
      expect(engine.getRelation(rel!.id)).toBeNull()
    })

    it('should return false removing nonexistent relation', () => {
      expect(engine.removeRelation('missing')).toBe(false)
    })
  })

  describe('Triple queries', () => {
    it('should query by subject', () => {
      const a = engine.addEntity('Dog', 'concept')
      const b = engine.addEntity('Animal', 'concept')
      engine.addRelation(a.id, b.id, 'is_a')
      const results = engine.queryTriples({ subject: a.id })
      expect(results.length).toBe(1)
      expect(results[0].predicate).toBe('is_a')
    })

    it('should query by predicate', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      engine.addRelation(a.id, b.id, 'is_a')
      engine.addRelation(a.id, b.id, 'related_to')
      const results = engine.queryTriples({ predicate: 'is_a' })
      expect(results.length).toBe(1)
    })

    it('should query by object name', () => {
      const a = engine.addEntity('Dog', 'concept')
      const b = engine.addEntity('Animal', 'concept')
      engine.addRelation(a.id, b.id, 'is_a')
      const results = engine.queryTriples({ object: 'Animal' })
      expect(results.length).toBe(1)
    })

    it('should query with multiple filters', () => {
      const a = engine.addEntity('Dog', 'concept')
      const b = engine.addEntity('Animal', 'concept')
      engine.addRelation(a.id, b.id, 'is_a')
      const results = engine.queryTriples({ subject: 'Dog', predicate: 'is_a' })
      expect(results.length).toBe(1)
    })

    it('should return empty for no matches', () => {
      expect(engine.queryTriples({ subject: 'none' }).length).toBe(0)
    })
  })

  describe('Graph traversal', () => {
    it('should perform BFS', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      const c = engine.addEntity('C', 'concept')
      engine.addRelation(a.id, b.id, 'related_to')
      engine.addRelation(b.id, c.id, 'related_to')
      const result = engine.bfs(a.id, 2)
      expect(result.length).toBe(3)
    })

    it('should respect BFS depth limit', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      const c = engine.addEntity('C', 'concept')
      engine.addRelation(a.id, b.id, 'related_to')
      engine.addRelation(b.id, c.id, 'related_to')
      const result = engine.bfs(a.id, 1)
      expect(result.length).toBe(2)
    })

    it('should find shortest path', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      const c = engine.addEntity('C', 'concept')
      engine.addRelation(a.id, b.id, 'related_to')
      engine.addRelation(b.id, c.id, 'related_to')
      const path = engine.shortestPath(a.id, c.id)
      expect(path).not.toBeNull()
      expect(path!.length).toBe(2)
    })

    it('should return null for no path', () => {
      const a = engine.addEntity('A', 'concept')
      engine.addEntity('B', 'concept')
      expect(engine.shortestPath(a.id, 'missing')).toBeNull()
    })

    it('should handle self path', () => {
      const a = engine.addEntity('A', 'concept')
      const path = engine.shortestPath(a.id, a.id)
      expect(path!.length).toBe(0)
    })
  })

  describe('Subgraph extraction', () => {
    it('should extract subgraph', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      const c = engine.addEntity('C', 'concept')
      engine.addRelation(a.id, b.id, 'related_to')
      engine.addRelation(b.id, c.id, 'related_to')
      const sub = engine.extractSubgraph(a.id, 2)
      expect(sub).not.toBeNull()
      expect(sub!.entities.length).toBe(3)
    })

    it('should return null for missing entity', () => {
      expect(engine.extractSubgraph('missing')).toBeNull()
    })

    it('should respect depth', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      const c = engine.addEntity('C', 'concept')
      engine.addRelation(a.id, b.id, 'related_to')
      engine.addRelation(b.id, c.id, 'related_to')
      const sub = engine.extractSubgraph(a.id, 1)
      expect(sub!.entities.length).toBe(2)
    })
  })

  describe('Inference', () => {
    it('should infer transitive is_a', () => {
      const a = engine.addEntity('Dog', 'concept')
      const b = engine.addEntity('Mammal', 'concept')
      const c = engine.addEntity('Animal', 'concept')
      engine.addRelation(a.id, b.id, 'is_a')
      engine.addRelation(b.id, c.id, 'is_a')
      const inferred = engine.inferRelations(a.id)
      expect(inferred.some(r => r.targetId === c.id && r.type === 'is_a')).toBe(true)
    })

    it('should infer inherited properties via part_of', () => {
      const wheel = engine.addEntity('Wheel', 'concept')
      const car = engine.addEntity('Car', 'concept')
      const prop = engine.addEntity('Motion', 'property')
      engine.addRelation(wheel.id, car.id, 'part_of')
      engine.addRelation(car.id, prop.id, 'has_property')
      const inferred = engine.inferRelations(wheel.id)
      expect(inferred.some(r => r.type === 'has_property')).toBe(true)
    })

    it('should return empty when inference disabled', () => {
      const e = new KnowledgeGraphEngine({ inferenceEnabled: false })
      const a = e.addEntity('A', 'concept')
      expect(e.inferRelations(a.id)).toEqual([])
    })
  })

  describe('Similarity', () => {
    it('should compute similarity with shared targets', () => {
      const a = engine.addEntity('Dog', 'concept')
      const b = engine.addEntity('Cat', 'concept')
      const c = engine.addEntity('Animal', 'concept')
      engine.addRelation(a.id, c.id, 'is_a')
      engine.addRelation(b.id, c.id, 'is_a')
      const sim = engine.computeSimilarity(a.id, b.id)
      expect(sim).not.toBeNull()
      expect(sim!.score).toBeGreaterThan(0)
      expect(sim!.sharedRelations.length).toBeGreaterThan(0)
    })

    it('should return null for missing entities', () => {
      expect(engine.computeSimilarity('a', 'b')).toBeNull()
    })
  })

  describe('Topology', () => {
    it('should compute graph topology', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      engine.addRelation(a.id, b.id, 'related_to')
      const topo = engine.getTopology()
      expect(topo.entityCount).toBe(2)
      expect(topo.relationCount).toBe(1)
      expect(topo.components).toBe(1)
    })

    it('should detect multiple components', () => {
      engine.addEntity('A', 'concept')
      engine.addEntity('B', 'concept')
      const topo = engine.getTopology()
      expect(topo.components).toBe(2)
    })
  })

  describe('Stats & serialization', () => {
    it('should track stats', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      engine.addRelation(a.id, b.id, 'is_a')
      engine.queryTriples({})
      engine.bfs(a.id)
      engine.provideFeedback()
      const stats = engine.getStats()
      expect(stats.totalEntities).toBe(2)
      expect(stats.totalRelations).toBe(1)
      expect(stats.totalQueries).toBe(1)
      expect(stats.totalTraversals).toBe(1)
      expect(stats.feedbackCount).toBe(1)
    })

    it('should serialize and deserialize', () => {
      const a = engine.addEntity('A', 'concept')
      const b = engine.addEntity('B', 'concept')
      engine.addRelation(a.id, b.id, 'is_a')
      const json = engine.serialize()
      const restored = KnowledgeGraphEngine.deserialize(json)
      expect(restored.getStats().totalEntities).toBe(2)
      expect(restored.getStats().totalRelations).toBe(1)
    })
  })
})
