import { describe, it, expect, beforeEach } from 'vitest'
import { OntologyManager } from '../OntologyManager.js'

describe('OntologyManager', () => {
  let om: OntologyManager

  beforeEach(() => {
    om = new OntologyManager()
  })

  // ── Constructor & Config ──────────────────────────────────────────────

  describe('constructor', () => {
    it('creates with default config', () => {
      const m = new OntologyManager()
      expect(m.getStats().totalConcepts).toBe(0)
    })

    it('accepts partial config', () => {
      const m = new OntologyManager({ maxConcepts: 5 })
      expect(m.getStats().totalConcepts).toBe(0)
    })

    it('respects caseSensitive config', () => {
      const m = new OntologyManager({ caseSensitive: true })
      m.addConcept('Animal')
      m.addConcept('animal')
      expect(m.getConcepts()).toHaveLength(2)
    })

    it('default is case-insensitive (duplicate names rejected)', () => {
      om.addConcept('Animal')
      expect(() => om.addConcept('animal')).toThrow(/already exists/)
    })
  })

  // ── Concept CRUD ──────────────────────────────────────────────────────

  describe('addConcept', () => {
    it('returns an id string', () => {
      const id = om.addConcept('Entity')
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('stores concept with correct name and description', () => {
      const id = om.addConcept('Animal', 'Living creature')
      const c = om.getConcept(id)
      expect(c).not.toBeNull()
      expect(c!.name).toBe('Animal')
      expect(c!.description).toBe('Living creature')
    })

    it('accepts parent id', () => {
      const root = om.addConcept('Entity')
      const child = om.addConcept('Animal', '', root)
      expect(om.getParent(child)).toBe(root)
    })

    it('stores metadata', () => {
      const id = om.addConcept('Animal', '', null, { domain: 'biology' })
      expect(om.getConcept(id)!.metadata).toEqual({ domain: 'biology' })
    })

    it('throws on duplicate name', () => {
      om.addConcept('Animal')
      expect(() => om.addConcept('Animal')).toThrow(/already exists/)
    })

    it('throws when parent does not exist', () => {
      expect(() => om.addConcept('Dog', '', 'nonexistent')).toThrow(/does not exist/)
    })

    it('throws when maxConcepts exceeded', () => {
      const m = new OntologyManager({ maxConcepts: 2 })
      m.addConcept('A')
      m.addConcept('B')
      expect(() => m.addConcept('C')).toThrow(/Maximum concept limit/)
    })

    it('throws when maxDepth exceeded', () => {
      const m = new OntologyManager({ maxDepth: 1 })
      const root = m.addConcept('Root')
      const child = m.addConcept('Child', '', root)
      expect(() => m.addConcept('GrandChild', '', child)).toThrow(/depth/)
    })
  })

  describe('removeConcept', () => {
    it('removes an existing concept', () => {
      const id = om.addConcept('Animal')
      expect(om.removeConcept(id)).toBe(true)
      expect(om.getConcept(id)).toBeNull()
    })

    it('returns false for nonexistent concept', () => {
      expect(om.removeConcept('nope')).toBe(false)
    })

    it('removes descendants recursively', () => {
      const root = om.addConcept('Entity')
      const animal = om.addConcept('Animal', '', root)
      const dog = om.addConcept('Dog', '', animal)
      om.removeConcept(animal)
      expect(om.getConcept(animal)).toBeNull()
      expect(om.getConcept(dog)).toBeNull()
      expect(om.getConcept(root)).not.toBeNull()
    })

    it('removes associated relations', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addRelation(a, b, 'uses')
      om.removeConcept(a)
      expect(om.getRelations(b)).toHaveLength(0)
    })

    it('allows re-adding a concept with the same name after removal', () => {
      const id = om.addConcept('Animal')
      om.removeConcept(id)
      const id2 = om.addConcept('Animal')
      expect(id2).not.toBe(id)
    })
  })

  describe('getConcept / getConceptByName / getConcepts', () => {
    it('getConcept returns null for unknown id', () => {
      expect(om.getConcept('xyz')).toBeNull()
    })

    it('getConceptByName finds by name (case-insensitive)', () => {
      om.addConcept('Animal')
      expect(om.getConceptByName('ANIMAL')).not.toBeNull()
    })

    it('getConceptByName returns null for unknown name', () => {
      expect(om.getConceptByName('Nope')).toBeNull()
    })

    it('getConcepts returns all concepts', () => {
      om.addConcept('A')
      om.addConcept('B')
      om.addConcept('C')
      expect(om.getConcepts()).toHaveLength(3)
    })
  })

  // ── Hierarchy ─────────────────────────────────────────────────────────

  describe('setParent / getParent / getChildren', () => {
    it('setParent changes parent', () => {
      const root1 = om.addConcept('Root1')
      const root2 = om.addConcept('Root2')
      const child = om.addConcept('Child', '', root1)
      expect(om.setParent(child, root2)).toBe(true)
      expect(om.getParent(child)).toBe(root2)
      expect(om.getChildren(root1)).toHaveLength(0)
      expect(om.getChildren(root2)).toContain(child)
    })

    it('setParent to null makes concept a root', () => {
      const root = om.addConcept('Root')
      const child = om.addConcept('Child', '', root)
      om.setParent(child, null)
      expect(om.getParent(child)).toBeNull()
    })

    it('setParent returns false for nonexistent concept', () => {
      expect(om.setParent('nope', null)).toBe(false)
    })

    it('setParent returns false for nonexistent parent', () => {
      const id = om.addConcept('A')
      expect(om.setParent(id, 'nope')).toBe(false)
    })

    it('setParent rejects self-reference', () => {
      const id = om.addConcept('A')
      expect(om.setParent(id, id)).toBe(false)
    })

    it('setParent rejects cycle', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B', '', a)
      expect(om.setParent(a, b)).toBe(false)
    })

    it('getParent returns null for root concept', () => {
      const id = om.addConcept('Root')
      expect(om.getParent(id)).toBeNull()
    })

    it('getParent returns null for unknown concept', () => {
      expect(om.getParent('unknown')).toBeNull()
    })

    it('getChildren returns empty for leaf', () => {
      const id = om.addConcept('Leaf')
      expect(om.getChildren(id)).toHaveLength(0)
    })

    it('getChildren returns correct children', () => {
      const root = om.addConcept('Root')
      const c1 = om.addConcept('C1', '', root)
      const c2 = om.addConcept('C2', '', root)
      const children = om.getChildren(root)
      expect(children).toContain(c1)
      expect(children).toContain(c2)
      expect(children).toHaveLength(2)
    })
  })

  // ── Traversal ─────────────────────────────────────────────────────────

  describe('getAncestors / getDescendants', () => {
    it('getAncestors returns empty for root', () => {
      const root = om.addConcept('Root')
      expect(om.getAncestors(root)).toHaveLength(0)
    })

    it('getAncestors returns parent chain', () => {
      const root = om.addConcept('Root')
      const mid = om.addConcept('Mid', '', root)
      const leaf = om.addConcept('Leaf', '', mid)
      const ancestors = om.getAncestors(leaf)
      expect(ancestors).toEqual([mid, root])
    })

    it('getAncestors returns empty for unknown concept', () => {
      expect(om.getAncestors('nope')).toHaveLength(0)
    })

    it('getDescendants returns empty for leaf', () => {
      const leaf = om.addConcept('Leaf')
      expect(om.getDescendants(leaf)).toHaveLength(0)
    })

    it('getDescendants returns all descendants', () => {
      const root = om.addConcept('Root')
      const a = om.addConcept('A', '', root)
      const b = om.addConcept('B', '', root)
      const c = om.addConcept('C', '', a)
      const desc = om.getDescendants(root)
      expect(desc).toContain(a)
      expect(desc).toContain(b)
      expect(desc).toContain(c)
      expect(desc).toHaveLength(3)
    })

    it('getDescendants returns empty for unknown concept', () => {
      expect(om.getDescendants('nope')).toHaveLength(0)
    })
  })

  // ── IS-A Reasoning ────────────────────────────────────────────────────

  describe('isA', () => {
    it('returns true for same concept', () => {
      const id = om.addConcept('A')
      expect(om.isA(id, id)).toBe(true)
    })

    it('returns true for direct parent', () => {
      const root = om.addConcept('Animal')
      const dog = om.addConcept('Dog', '', root)
      expect(om.isA(dog, root)).toBe(true)
    })

    it('returns true for transitive ancestor', () => {
      const entity = om.addConcept('Entity')
      const animal = om.addConcept('Animal', '', entity)
      const dog = om.addConcept('Dog', '', animal)
      expect(om.isA(dog, entity)).toBe(true)
    })

    it('returns false when not an ancestor', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      expect(om.isA(a, b)).toBe(false)
    })

    it('returns false for reversed direction', () => {
      const root = om.addConcept('Root')
      const child = om.addConcept('Child', '', root)
      expect(om.isA(root, child)).toBe(false)
    })

    it('returns false for nonexistent concepts', () => {
      const id = om.addConcept('A')
      expect(om.isA(id, 'nope')).toBe(false)
      expect(om.isA('nope', id)).toBe(false)
    })
  })

  describe('subsumes', () => {
    it('parent subsumes child', () => {
      const root = om.addConcept('Animal')
      const dog = om.addConcept('Dog', '', root)
      expect(om.subsumes(root, dog)).toBe(true)
    })

    it('child does not subsume parent', () => {
      const root = om.addConcept('Animal')
      const dog = om.addConcept('Dog', '', root)
      expect(om.subsumes(dog, root)).toBe(false)
    })
  })

  // ── Property Management ───────────────────────────────────────────────

  describe('addProperty / getInheritedProperties', () => {
    it('addProperty returns true for existing concept', () => {
      const id = om.addConcept('Animal')
      expect(om.addProperty(id, 'legs', 4, 'number')).toBe(true)
    })

    it('addProperty returns false for nonexistent concept', () => {
      expect(om.addProperty('nope', 'x', 1)).toBe(false)
    })

    it('getInheritedProperties returns own properties', () => {
      const id = om.addConcept('Animal')
      om.addProperty(id, 'legs', 4, 'number')
      const props = om.getInheritedProperties(id)
      expect(props.has('legs')).toBe(true)
      expect(props.get('legs')!.value).toBe(4)
      expect(props.get('legs')!.inherited).toBe(false)
    })

    it('child inherits parent properties', () => {
      const animal = om.addConcept('Animal')
      om.addProperty(animal, 'alive', true, 'boolean')
      const dog = om.addConcept('Dog', '', animal)
      const props = om.getInheritedProperties(dog)
      expect(props.has('alive')).toBe(true)
      expect(props.get('alive')!.inherited).toBe(true)
      expect(props.get('alive')!.definedAt).toBe(animal)
    })

    it('child overrides parent property', () => {
      const animal = om.addConcept('Animal')
      om.addProperty(animal, 'legs', 4)
      const snake = om.addConcept('Snake', '', animal)
      om.addProperty(snake, 'legs', 0)
      const props = om.getInheritedProperties(snake)
      expect(props.get('legs')!.value).toBe(0)
      expect(props.get('legs')!.inherited).toBe(false)
      expect(props.get('legs')!.definedAt).toBe(snake)
    })

    it('inheritance spans multiple levels', () => {
      const entity = om.addConcept('Entity')
      om.addProperty(entity, 'exists', true)
      const animal = om.addConcept('Animal', '', entity)
      const dog = om.addConcept('Dog', '', animal)
      const props = om.getInheritedProperties(dog)
      expect(props.has('exists')).toBe(true)
      expect(props.get('exists')!.inherited).toBe(true)
    })

    it('getInheritedProperties returns empty map for unknown concept', () => {
      expect(om.getInheritedProperties('nope').size).toBe(0)
    })
  })

  describe('removeProperty', () => {
    it('removes an existing property', () => {
      const id = om.addConcept('A')
      om.addProperty(id, 'x', 1)
      expect(om.removeProperty(id, 'x')).toBe(true)
      expect(om.getInheritedProperties(id).has('x')).toBe(false)
    })

    it('returns false for nonexistent property', () => {
      const id = om.addConcept('A')
      expect(om.removeProperty(id, 'nope')).toBe(false)
    })

    it('returns false for nonexistent concept', () => {
      expect(om.removeProperty('nope', 'x')).toBe(false)
    })
  })

  // ── Relations ─────────────────────────────────────────────────────────

  describe('addRelation', () => {
    it('returns a relation id', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      const relId = om.addRelation(a, b, 'part-of')
      expect(typeof relId).toBe('string')
    })

    it('uses default relation type when none specified', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addRelation(a, b)
      const rels = om.getRelations(a)
      expect(rels[0].type).toBe('related-to')
    })

    it('clamps weight to [0, 1]', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addRelation(a, b, 'x', 5.0)
      om.addRelation(a, b, 'y', -1.0)
      const rels = om.getRelations(a)
      expect(rels.find(r => r.type === 'x')!.weight).toBe(1)
      expect(rels.find(r => r.type === 'y')!.weight).toBe(0)
    })

    it('throws when source does not exist', () => {
      const b = om.addConcept('B')
      expect(() => om.addRelation('nope', b)).toThrow(/Source/)
    })

    it('throws when target does not exist', () => {
      const a = om.addConcept('A')
      expect(() => om.addRelation(a, 'nope')).toThrow(/Target/)
    })
  })

  describe('removeRelation / getRelations', () => {
    it('removeRelation removes by id', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      const relId = om.addRelation(a, b, 'uses')
      expect(om.removeRelation(relId)).toBe(true)
      expect(om.getRelations(a)).toHaveLength(0)
    })

    it('removeRelation returns false for unknown id', () => {
      expect(om.removeRelation('nope')).toBe(false)
    })

    it('getRelations filters by type', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addRelation(a, b, 'uses')
      om.addRelation(a, b, 'part-of')
      expect(om.getRelations(a, 'uses')).toHaveLength(1)
    })

    it('getOutgoingRelations returns only outgoing', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addRelation(a, b, 'uses')
      expect(om.getOutgoingRelations(a)).toHaveLength(1)
      expect(om.getOutgoingRelations(b)).toHaveLength(0)
    })

    it('getIncomingRelations returns only incoming', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addRelation(a, b, 'uses')
      expect(om.getIncomingRelations(b)).toHaveLength(1)
      expect(om.getIncomingRelations(a)).toHaveLength(0)
    })
  })

  // ── Query ─────────────────────────────────────────────────────────────

  describe('query', () => {
    it('returns all concepts when no filters', () => {
      om.addConcept('A')
      om.addConcept('B')
      const res = om.query({})
      expect(res.totalMatches).toBe(2)
    })

    it('filters by conceptId', () => {
      const a = om.addConcept('A')
      om.addConcept('B')
      const res = om.query({ conceptId: a })
      expect(res.totalMatches).toBe(1)
      expect(res.concepts[0].id).toBe(a)
    })

    it('includes descendants when requested', () => {
      const root = om.addConcept('Root')
      om.addConcept('Child', '', root)
      const res = om.query({ conceptId: root, includeDescendants: true })
      expect(res.totalMatches).toBe(2)
    })

    it('filters by name substring', () => {
      om.addConcept('Animal')
      om.addConcept('Animate')
      om.addConcept('Plant')
      const res = om.query({ name: 'anim' })
      expect(res.totalMatches).toBe(2)
    })

    it('filters by parentId', () => {
      const root = om.addConcept('Root')
      om.addConcept('C1', '', root)
      om.addConcept('C2', '', root)
      om.addConcept('Standalone')
      const res = om.query({ parentId: root })
      expect(res.totalMatches).toBe(2)
    })

    it('filters by hasProperty', () => {
      const a = om.addConcept('A')
      const _b = om.addConcept('B')
      om.addProperty(a, 'color', 'red')
      const res = om.query({ hasProperty: 'color' })
      expect(res.totalMatches).toBe(1)
      expect(res.concepts[0].id).toBe(a)
    })

    it('filters by property value', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addProperty(a, 'color', 'red')
      om.addProperty(b, 'color', 'blue')
      const res = om.query({ hasProperty: 'color', propertyValue: 'red' })
      expect(res.totalMatches).toBe(1)
    })

    it('filters by maxDepth', () => {
      const root = om.addConcept('Root')
      const child = om.addConcept('Child', '', root)
      om.addConcept('GrandChild', '', child)
      const res = om.query({ maxDepth: 1 })
      expect(
        res.concepts.every(c => {
          const id = c.id
          return id === root || id === child
        }),
      ).toBe(true)
    })

    it('filters by relationType', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addRelation(a, b, 'uses')
      om.addRelation(a, b, 'part-of')
      const res = om.query({ relationType: 'uses' })
      expect(res.relations).toHaveLength(1)
      expect(res.relations[0].type).toBe('uses')
    })

    it('queryTime is a non-negative number', () => {
      const res = om.query({})
      expect(res.queryTime).toBeGreaterThanOrEqual(0)
    })
  })

  // ── Similarity ────────────────────────────────────────────────────────

  describe('conceptSimilarity', () => {
    it('returns 1.0 for identical concepts', () => {
      const id = om.addConcept('A')
      expect(om.conceptSimilarity(id, id)).toBe(1.0)
    })

    it('returns 0 for nonexistent concepts', () => {
      const id = om.addConcept('A')
      expect(om.conceptSimilarity(id, 'nope')).toBe(0.0)
      expect(om.conceptSimilarity('nope', id)).toBe(0.0)
    })

    it('returns 0 for unrelated roots', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      expect(om.conceptSimilarity(a, b)).toBe(0.0)
    })

    it('siblings under a non-root node have positive wu-palmer similarity', () => {
      const root = om.addConcept('Root')
      const mid = om.addConcept('Mid', '', root)
      const a = om.addConcept('A', '', mid)
      const b = om.addConcept('B', '', mid)
      const sim = om.conceptSimilarity(a, b)
      // LCA = mid at depth 1, A & B at depth 2 → 2*1/(2+2) = 0.5
      expect(sim).toBeGreaterThan(0)
      expect(sim).toBeLessThanOrEqual(1)
    })

    it('path-based similarity works', () => {
      const m = new OntologyManager({ similarityMethod: 'path-based' })
      const root = m.addConcept('Root')
      const a = m.addConcept('A', '', root)
      const b = m.addConcept('B', '', root)
      const sim = m.conceptSimilarity(a, b)
      expect(sim).toBeGreaterThan(0)
      expect(sim).toBeLessThanOrEqual(1)
    })

    it('closer concepts have higher similarity', () => {
      const root = om.addConcept('Root')
      const animal = om.addConcept('Animal', '', root)
      const dog = om.addConcept('Dog', '', animal)
      const cat = om.addConcept('Cat', '', animal)
      const plant = om.addConcept('Plant', '', root)

      const simDogCat = om.conceptSimilarity(dog, cat)
      const simDogPlant = om.conceptSimilarity(dog, plant)
      expect(simDogCat).toBeGreaterThan(simDogPlant)
    })
  })

  // ── Least Common Ancestor ─────────────────────────────────────────────

  describe('findLCA', () => {
    it('returns the concept itself for same id', () => {
      const id = om.addConcept('A')
      expect(om.findLCA(id, id)).toBe(id)
    })

    it('returns parent for siblings', () => {
      const root = om.addConcept('Root')
      const a = om.addConcept('A', '', root)
      const b = om.addConcept('B', '', root)
      expect(om.findLCA(a, b)).toBe(root)
    })

    it('returns ancestor for parent-child pair', () => {
      const root = om.addConcept('Root')
      const child = om.addConcept('Child', '', root)
      expect(om.findLCA(root, child)).toBe(root)
    })

    it('finds deeper LCA', () => {
      const root = om.addConcept('Root')
      const animal = om.addConcept('Animal', '', root)
      const dog = om.addConcept('Dog', '', animal)
      const cat = om.addConcept('Cat', '', animal)
      expect(om.findLCA(dog, cat)).toBe(animal)
    })

    it('returns null for unrelated roots', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      expect(om.findLCA(a, b)).toBeNull()
    })

    it('returns null for nonexistent concepts', () => {
      const id = om.addConcept('A')
      expect(om.findLCA(id, 'nope')).toBeNull()
      expect(om.findLCA('nope', id)).toBeNull()
    })
  })

  // ── Validate ──────────────────────────────────────────────────────────

  describe('validate', () => {
    it('validates empty ontology as valid', () => {
      const v = om.validate()
      expect(v.isValid).toBe(true)
      expect(v.errors).toHaveLength(0)
    })

    it('valid ontology with hierarchy', () => {
      const root = om.addConcept('Root')
      om.addConcept('Child', '', root)
      const v = om.validate()
      expect(v.isValid).toBe(true)
      expect(v.conceptCount).toBe(2)
    })

    it('reports orphan warnings', () => {
      om.addConcept('A')
      om.addConcept('B')
      const v = om.validate()
      expect(v.warnings.some(w => w.type === 'orphan')).toBe(true)
      expect(v.orphanCount).toBeGreaterThan(0)
    })

    it('reports no-properties warnings', () => {
      om.addConcept('A')
      const v = om.validate()
      expect(v.warnings.some(w => w.type === 'no-properties')).toBe(true)
    })

    it('reports single-child warning', () => {
      const root = om.addConcept('Root')
      om.addConcept('OnlyChild', '', root)
      const v = om.validate()
      expect(v.warnings.some(w => w.type === 'single-child')).toBe(true)
    })

    it('returns maxDepth correctly', () => {
      const root = om.addConcept('Root')
      const mid = om.addConcept('Mid', '', root)
      om.addConcept('Leaf', '', mid)
      const v = om.validate()
      expect(v.maxDepth).toBe(2)
    })

    it('returns relation count', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addRelation(a, b, 'uses')
      const v = om.validate()
      expect(v.relationCount).toBe(1)
    })
  })

  // ── Merge ─────────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges concepts from another ontology', () => {
      const other = new OntologyManager()
      other.addConcept('Vehicle')
      other.addConcept('Car')

      om.addConcept('Animal')
      const idMap = om.merge(other)

      expect(om.getConcepts()).toHaveLength(3)
      expect(idMap.size).toBe(2)
    })

    it('maps duplicate names to existing concepts', () => {
      om.addConcept('Animal')

      const other = new OntologyManager()
      other.addConcept('Animal')

      const idMap = om.merge(other)
      expect(om.getConcepts()).toHaveLength(1)
      expect(idMap.size).toBe(1)
    })

    it('preserves hierarchy in merged ontology', () => {
      const other = new OntologyManager()
      const root = other.addConcept('Vehicle')
      other.addConcept('Car', '', root)

      const idMap = om.merge(other)
      const newCarId = idMap.get(other.getConcepts().find(c => c.name === 'Car')!.id)!
      expect(om.getParent(newCarId)).not.toBeNull()
    })

    it('merges relations', () => {
      const other = new OntologyManager()
      const a = other.addConcept('X')
      const b = other.addConcept('Y')
      other.addRelation(a, b, 'part-of')

      om.merge(other)
      const allConcepts = om.getConcepts()
      const xId = allConcepts.find(c => c.name === 'X')!.id
      expect(om.getRelations(xId)).toHaveLength(1)
    })

    it('merges properties for new concepts', () => {
      const other = new OntologyManager()
      const id = other.addConcept('Widget')
      other.addProperty(id, 'color', 'blue')

      om.merge(other)
      const widget = om.getConceptByName('Widget')!
      const props = om.getInheritedProperties(widget.id)
      expect(props.has('color')).toBe(true)
    })

    it('merges properties into existing concept without overwriting', () => {
      const id = om.addConcept('Widget')
      om.addProperty(id, 'color', 'red')

      const other = new OntologyManager()
      const otherId = other.addConcept('Widget')
      other.addProperty(otherId, 'color', 'blue')
      other.addProperty(otherId, 'size', 10)

      om.merge(other)
      const props = om.getInheritedProperties(id)
      expect(props.get('color')!.value).toBe('red') // not overwritten
      expect(props.get('size')!.value).toBe(10)
    })
  })

  // ── Serialize / Deserialize ───────────────────────────────────────────

  describe('serialize / deserialize', () => {
    it('round-trips an empty ontology', () => {
      const json = om.serialize()
      const restored = OntologyManager.deserialize(json)
      expect(restored.getConcepts()).toHaveLength(0)
    })

    it('round-trips concepts with hierarchy', () => {
      const root = om.addConcept('Root')
      const child = om.addConcept('Child', '', root)
      const json = om.serialize()
      const restored = OntologyManager.deserialize(json)
      expect(restored.getConcepts()).toHaveLength(2)
      expect(restored.getParent(child)).toBe(root)
    })

    it('round-trips properties', () => {
      const id = om.addConcept('A')
      om.addProperty(id, 'key', 'value')
      const json = om.serialize()
      const restored = OntologyManager.deserialize(json)
      const props = restored.getInheritedProperties(id)
      expect(props.get('key')!.value).toBe('value')
    })

    it('round-trips relations', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addRelation(a, b, 'uses', 0.8)
      const json = om.serialize()
      const restored = OntologyManager.deserialize(json)
      const rels = restored.getRelations(a)
      expect(rels).toHaveLength(1)
      expect(rels[0].type).toBe('uses')
      expect(rels[0].weight).toBe(0.8)
    })

    it('round-trips config', () => {
      const m = new OntologyManager({ maxConcepts: 42, caseSensitive: true })
      m.addConcept('X')
      const json = m.serialize()
      const restored = OntologyManager.deserialize(json)
      // caseSensitive should be preserved — allow both cases
      restored.addConcept('x')
      expect(restored.getConcepts()).toHaveLength(2)
    })

    it('serialize produces valid JSON', () => {
      om.addConcept('A')
      const json = om.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })
  })

  // ── Stats ─────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns zeros for empty ontology', () => {
      const s = om.getStats()
      expect(s.totalConcepts).toBe(0)
      expect(s.totalRelations).toBe(0)
      expect(s.totalProperties).toBe(0)
      expect(s.maxDepth).toBe(0)
      expect(s.rootConcepts).toBe(0)
      expect(s.leafConcepts).toBe(0)
      expect(s.avgChildrenPerConcept).toBe(0)
    })

    it('counts concepts correctly', () => {
      om.addConcept('A')
      om.addConcept('B')
      expect(om.getStats().totalConcepts).toBe(2)
    })

    it('counts relations correctly', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      om.addRelation(a, b)
      expect(om.getStats().totalRelations).toBe(1)
    })

    it('counts properties correctly', () => {
      const id = om.addConcept('A')
      om.addProperty(id, 'x', 1)
      om.addProperty(id, 'y', 2)
      expect(om.getStats().totalProperties).toBe(2)
    })

    it('identifies root and leaf concepts', () => {
      const root = om.addConcept('Root')
      om.addConcept('Leaf', '', root)
      const s = om.getStats()
      expect(s.rootConcepts).toBe(1)
      expect(s.leafConcepts).toBe(1)
    })

    it('computes maxDepth', () => {
      const root = om.addConcept('Root')
      const mid = om.addConcept('Mid', '', root)
      om.addConcept('Leaf', '', mid)
      expect(om.getStats().maxDepth).toBe(2)
    })

    it('computes avgChildrenPerConcept', () => {
      const root = om.addConcept('Root')
      om.addConcept('C1', '', root)
      om.addConcept('C2', '', root)
      // Only root has children: 2 children / 1 parent = 2
      expect(om.getStats().avgChildrenPerConcept).toBe(2)
    })
  })

  // ── getHierarchy ──────────────────────────────────────────────────────

  describe('getHierarchy', () => {
    it('returns empty for empty ontology', () => {
      expect(om.getHierarchy()).toHaveLength(0)
    })

    it('builds hierarchy from specific root', () => {
      const root = om.addConcept('Root')
      om.addConcept('Child', '', root)
      const h = om.getHierarchy(root)
      expect(h).toHaveLength(1)
      expect(h[0].children).toHaveLength(1)
    })

    it('builds hierarchy from all roots', () => {
      const r1 = om.addConcept('Root1')
      const _r2 = om.addConcept('Root2')
      om.addConcept('C1', '', r1)
      const h = om.getHierarchy()
      expect(h).toHaveLength(2)
    })

    it('returns empty for nonexistent root', () => {
      expect(om.getHierarchy('nope')).toHaveLength(0)
    })
  })

  // ── getInheritancePath ────────────────────────────────────────────────

  describe('getInheritancePath', () => {
    it('returns path from child to ancestor', () => {
      const root = om.addConcept('Root')
      const mid = om.addConcept('Mid', '', root)
      const leaf = om.addConcept('Leaf', '', mid)
      const path = om.getInheritancePath(leaf, root)
      expect(path).not.toBeNull()
      expect(path!.from).toBe(leaf)
      expect(path!.to).toBe(root)
      expect(path!.path).toContain(leaf)
      expect(path!.path).toContain(root)
    })

    it('returns path from ancestor to child', () => {
      const root = om.addConcept('Root')
      const child = om.addConcept('Child', '', root)
      const path = om.getInheritancePath(root, child)
      expect(path).not.toBeNull()
      expect(path!.from).toBe(root)
      expect(path!.to).toBe(child)
    })

    it('returns path through LCA for cousins', () => {
      const root = om.addConcept('Root')
      const a = om.addConcept('A', '', root)
      const b = om.addConcept('B', '', root)
      const path = om.getInheritancePath(a, b)
      expect(path).not.toBeNull()
      expect(path!.path).toContain(root)
    })

    it('returns null for unrelated concepts', () => {
      const a = om.addConcept('A')
      const b = om.addConcept('B')
      expect(om.getInheritancePath(a, b)).toBeNull()
    })

    it('returns null for nonexistent concepts', () => {
      const a = om.addConcept('A')
      expect(om.getInheritancePath(a, 'nope')).toBeNull()
    })
  })
})
