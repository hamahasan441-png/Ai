import { describe, it, expect, beforeEach } from 'vitest'
import { BayesianNetwork } from '../BayesianNetwork.js'

describe('BayesianNetwork', () => {
  let bn: BayesianNetwork

  beforeEach(() => {
    bn = new BayesianNetwork()
  })

  // ── Constructor & Config ──

  describe('constructor', () => {
    it('creates with default config', () => {
      const net = new BayesianNetwork()
      const stats = net.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.edgeCount).toBe(0)
    })

    it('accepts partial config', () => {
      const net = new BayesianNetwork({ maxNodes: 5 })
      // Should still work, just with a smaller capacity
      net.addNode('a', 'A')
      expect(net.getNode('a')).not.toBeNull()
    })

    it('merges partial config with defaults', () => {
      const net = new BayesianNetwork({ maxNodes: 3 })
      net.addNode('a', 'A')
      net.addNode('b', 'B')
      net.addNode('c', 'C')
      expect(() => net.addNode('d', 'D')).toThrow(/capacity/)
    })
  })

  // ── Node Management ──

  describe('addNode', () => {
    it('adds a node with default binary states', () => {
      const node = bn.addNode('rain', 'Rain')
      expect(node.id).toBe('rain')
      expect(node.name).toBe('Rain')
      expect(node.states).toEqual(['true', 'false'])
    })

    it('adds a node with custom states', () => {
      const node = bn.addNode('temp', 'Temperature', ['low', 'medium', 'high'])
      expect(node.states).toEqual(['low', 'medium', 'high'])
    })

    it('adds a node with a description', () => {
      const node = bn.addNode('rain', 'Rain', undefined, 'Probability of rain')
      expect(node.description).toBe('Probability of rain')
    })

    it('sets createdAt timestamp', () => {
      const before = Date.now()
      const node = bn.addNode('x', 'X')
      expect(node.createdAt).toBeGreaterThanOrEqual(before)
      expect(node.createdAt).toBeLessThanOrEqual(Date.now())
    })

    it('throws on duplicate node id', () => {
      bn.addNode('a', 'A')
      expect(() => bn.addNode('a', 'A again')).toThrow(/already exists/)
    })

    it('throws when network at capacity', () => {
      const small = new BayesianNetwork({ maxNodes: 2 })
      small.addNode('a', 'A')
      small.addNode('b', 'B')
      expect(() => small.addNode('c', 'C')).toThrow(/capacity/)
    })

    it('initializes a uniform prior CPT', () => {
      bn.addNode('coin', 'Coin', ['heads', 'tails'])
      const cpt = bn.getCPT('coin')
      expect(cpt).not.toBeNull()
      expect(cpt!.probabilities['']).toEqual({ heads: 0.5, tails: 0.5 })
    })
  })

  describe('removeNode', () => {
    it('removes an existing node', () => {
      bn.addNode('a', 'A')
      expect(bn.removeNode('a')).toBe(true)
      expect(bn.getNode('a')).toBeNull()
    })

    it('returns false for non-existent node', () => {
      expect(bn.removeNode('missing')).toBe(false)
    })

    it('removes associated edges', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      bn.removeNode('a')
      expect(bn.getParents('b')).toEqual([])
      expect(bn.getStructure().edgeCount).toBe(0)
    })

    it('clears evidence for the removed node', () => {
      bn.addNode('a', 'A')
      bn.setEvidence('a', 'true')
      bn.removeNode('a')
      expect(bn.getEvidence()).toEqual([])
    })

    it('rebuilds CPTs for children that lost a parent', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      bn.removeNode('a')
      const cpt = bn.getCPT('b')
      expect(cpt).not.toBeNull()
      expect(cpt!.parentIds).toEqual([])
    })
  })

  describe('getNode', () => {
    it('returns node by id', () => {
      bn.addNode('x', 'X')
      const node = bn.getNode('x')
      expect(node).not.toBeNull()
      expect(node!.id).toBe('x')
    })

    it('returns null for unknown id', () => {
      expect(bn.getNode('nope')).toBeNull()
    })
  })

  describe('getNodes', () => {
    it('returns empty array for empty network', () => {
      expect(bn.getNodes()).toEqual([])
    })

    it('returns all added nodes', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      const nodes = bn.getNodes()
      expect(nodes).toHaveLength(2)
      expect(nodes.map(n => n.id).sort()).toEqual(['a', 'b'])
    })
  })

  // ── Edge Management ──

  describe('addEdge', () => {
    beforeEach(() => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
    })

    it('adds a directed edge', () => {
      const edge = bn.addEdge('a', 'b')
      expect(edge.from).toBe('a')
      expect(edge.to).toBe('b')
      expect(edge.strength).toBe(1.0)
    })

    it('accepts a custom strength', () => {
      const edge = bn.addEdge('a', 'b', 0.8)
      expect(edge.strength).toBe(0.8)
    })

    it('throws if source node missing', () => {
      expect(() => bn.addEdge('missing', 'a')).toThrow(/does not exist/)
    })

    it('throws if target node missing', () => {
      expect(() => bn.addEdge('a', 'missing')).toThrow(/does not exist/)
    })

    it('throws on self-loop', () => {
      expect(() => bn.addEdge('a', 'a')).toThrow(/Self-loops/)
    })

    it('throws on duplicate edge', () => {
      bn.addEdge('a', 'b')
      expect(() => bn.addEdge('a', 'b')).toThrow(/already exists/)
    })

    it('throws if edge would create a cycle', () => {
      bn.addEdge('a', 'b')
      bn.addEdge('b', 'c')
      expect(() => bn.addEdge('c', 'a')).toThrow(/cycle/)
    })

    it('throws when exceeding max parents per node', () => {
      const net = new BayesianNetwork({ maxParentsPerNode: 1 })
      net.addNode('p1', 'P1')
      net.addNode('p2', 'P2')
      net.addNode('child', 'Child')
      net.addEdge('p1', 'child')
      expect(() => net.addEdge('p2', 'child')).toThrow(/parents/)
    })

    it('rebuilds the child CPT after adding edge', () => {
      bn.addEdge('a', 'b')
      const cpt = bn.getCPT('b')
      expect(cpt).not.toBeNull()
      expect(cpt!.parentIds).toContain('a')
      // CPT should now have entries keyed by parent states
      expect(cpt!.probabilities['true']).toBeDefined()
      expect(cpt!.probabilities['false']).toBeDefined()
    })
  })

  describe('removeEdge', () => {
    it('removes an existing edge', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      expect(bn.removeEdge('a', 'b')).toBe(true)
      expect(bn.getParents('b')).toEqual([])
    })

    it('returns false for non-existent edge', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      expect(bn.removeEdge('a', 'b')).toBe(false)
    })

    it('rebuilds child CPT after edge removal', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      bn.removeEdge('a', 'b')
      const cpt = bn.getCPT('b')
      expect(cpt!.parentIds).toEqual([])
    })
  })

  // ── CPT Management ──

  describe('setCPT', () => {
    it('sets a prior CPT for a root node', () => {
      bn.addNode('coin', 'Coin', ['heads', 'tails'])
      bn.setCPT('coin', { '': { heads: 0.6, tails: 0.4 } })
      const cpt = bn.getCPT('coin')
      expect(cpt!.probabilities[''].heads).toBeCloseTo(0.6)
    })

    it('sets a conditional CPT for a child node', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      bn.setCPT('b', {
        true: { true: 0.9, false: 0.1 },
        false: { true: 0.2, false: 0.8 },
      })
      const cpt = bn.getCPT('b')
      expect(cpt!.probabilities['true'].true).toBeCloseTo(0.9)
    })

    it('throws for non-existent node', () => {
      expect(() => bn.setCPT('nope', { '': { true: 0.5, false: 0.5 } })).toThrow(/does not exist/)
    })

    it('throws if row does not sum to 1', () => {
      bn.addNode('a', 'A')
      expect(() => bn.setCPT('a', { '': { true: 0.6, false: 0.6 } })).toThrow(/sums to/)
    })

    it('throws if row is missing a state', () => {
      bn.addNode('a', 'A')
      expect(() => bn.setCPT('a', { '': { true: 1.0 } })).toThrow(/missing state/)
    })

    it('throws if a parent combination is missing', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      // Only providing 'true' row, missing 'false'
      expect(() =>
        bn.setCPT('b', {
          true: { true: 0.9, false: 0.1 },
        }),
      ).toThrow(/missing parent combination/)
    })
  })

  describe('getCPT', () => {
    it('returns null for unknown node', () => {
      expect(bn.getCPT('nope')).toBeNull()
    })

    it('returns the CPT after it is set', () => {
      bn.addNode('a', 'A')
      bn.setCPT('a', { '': { true: 0.7, false: 0.3 } })
      const cpt = bn.getCPT('a')
      expect(cpt!.nodeId).toBe('a')
    })
  })

  // ── Evidence Management ──

  describe('setEvidence', () => {
    it('sets evidence on a valid node and state', () => {
      bn.addNode('a', 'A')
      bn.setEvidence('a', 'true')
      const ev = bn.getEvidence()
      expect(ev).toHaveLength(1)
      expect(ev[0]).toEqual({ nodeId: 'a', state: 'true' })
    })

    it('throws for non-existent node', () => {
      expect(() => bn.setEvidence('nope', 'true')).toThrow(/does not exist/)
    })

    it('throws for invalid state', () => {
      bn.addNode('a', 'A')
      expect(() => bn.setEvidence('a', 'maybe')).toThrow(/not valid/)
    })

    it('overwrites previous evidence on the same node', () => {
      bn.addNode('a', 'A')
      bn.setEvidence('a', 'true')
      bn.setEvidence('a', 'false')
      const ev = bn.getEvidence()
      expect(ev).toHaveLength(1)
      expect(ev[0].state).toBe('false')
    })
  })

  describe('clearEvidence', () => {
    it('clears evidence for a specific node', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.setEvidence('a', 'true')
      bn.setEvidence('b', 'false')
      bn.clearEvidence('a')
      const ev = bn.getEvidence()
      expect(ev).toHaveLength(1)
      expect(ev[0].nodeId).toBe('b')
    })

    it('clears all evidence when no arg given', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.setEvidence('a', 'true')
      bn.setEvidence('b', 'false')
      bn.clearEvidence()
      expect(bn.getEvidence()).toEqual([])
    })
  })

  // ── Inference (Variable Elimination) ──

  describe('infer', () => {
    it('throws for non-existent query node', () => {
      expect(() => bn.infer('nope')).toThrow(/does not exist/)
    })

    it('returns uniform prior for a single root node', () => {
      bn.addNode('a', 'A')
      const result = bn.infer('a')
      expect(result.nodeId).toBe('a')
      expect(result.distribution.true).toBeCloseTo(0.5)
      expect(result.distribution.false).toBeCloseTo(0.5)
    })

    it('returns a set prior for a root with custom CPT', () => {
      bn.addNode('a', 'A')
      bn.setCPT('a', { '': { true: 0.8, false: 0.2 } })
      const result = bn.infer('a')
      expect(result.distribution.true).toBeCloseTo(0.8)
      expect(result.distribution.false).toBeCloseTo(0.2)
    })

    it('includes evidence list in result', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      bn.setEvidence('a', 'true')
      const result = bn.infer('b')
      expect(result.evidence).toHaveLength(1)
      expect(result.evidence[0].nodeId).toBe('a')
    })

    it('includes computation time', () => {
      bn.addNode('a', 'A')
      const result = bn.infer('a')
      expect(result.computationTimeMs).toBeGreaterThanOrEqual(0)
    })

    it('posterior reflects evidence on parent', () => {
      bn.addNode('rain', 'Rain')
      bn.addNode('wet', 'Wet Grass')
      bn.addEdge('rain', 'wet')
      bn.setCPT('rain', { '': { true: 0.3, false: 0.7 } })
      bn.setCPT('wet', {
        true: { true: 0.9, false: 0.1 },
        false: { true: 0.1, false: 0.9 },
      })
      bn.setEvidence('rain', 'true')
      const result = bn.infer('wet')
      // With rain=true, P(wet=true) should be ~0.9
      expect(result.distribution.true).toBeCloseTo(0.9, 1)
    })

    it('computes correct posterior in a 3-node chain', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('a', 'b')
      bn.addEdge('b', 'c')
      bn.setCPT('a', { '': { true: 1.0, false: 0.0 } })
      bn.setCPT('b', {
        true: { true: 0.8, false: 0.2 },
        false: { true: 0.3, false: 0.7 },
      })
      bn.setCPT('c', {
        true: { true: 0.9, false: 0.1 },
        false: { true: 0.4, false: 0.6 },
      })
      // a is true with certainty → b is true with 0.8
      // P(c=true) = P(c=true|b=true)*P(b=true) + P(c=true|b=false)*P(b=false)
      //           = 0.9*0.8 + 0.4*0.2 = 0.72 + 0.08 = 0.80
      const result = bn.infer('c')
      expect(result.distribution.true).toBeCloseTo(0.8, 1)
    })

    it('returns distribution summing to 1', () => {
      bn.addNode('a', 'A', ['low', 'med', 'high'])
      const result = bn.infer('a')
      const sum = Object.values(result.distribution).reduce((s, v) => s + v, 0)
      expect(sum).toBeCloseTo(1.0)
    })
  })

  // ── MAP Inference ──

  describe('findMostProbable', () => {
    it('finds the most probable assignment for a single node', () => {
      bn.addNode('a', 'A')
      bn.setCPT('a', { '': { true: 0.8, false: 0.2 } })
      const map = bn.findMostProbable()
      expect(map.assignment.a).toBe('true')
      expect(map.probability).toBeGreaterThan(0)
    })

    it('includes evidence nodes in the assignment', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      bn.setEvidence('a', 'true')
      const map = bn.findMostProbable()
      expect(map.assignment.a).toBe('true')
      expect(map.assignment.b).toBeDefined()
    })

    it('respects a query subset', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('a', 'b')
      bn.addEdge('a', 'c')
      const map = bn.findMostProbable(['b'])
      expect(map.assignment.b).toBeDefined()
    })

    it('returns a probability between 0 and 1', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      const map = bn.findMostProbable()
      expect(map.probability).toBeGreaterThanOrEqual(0)
      expect(map.probability).toBeLessThanOrEqual(1)
    })
  })

  // ── D-Separation ──

  describe('isDSeparated', () => {
    it('throws if a node does not exist', () => {
      bn.addNode('a', 'A')
      expect(() => bn.isDSeparated('a', 'missing')).toThrow(/must exist/)
    })

    it('connected nodes are not d-separated with no conditioning', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      expect(bn.isDSeparated('a', 'b')).toBe(false)
    })

    it('chain: A→B→C — A and C not d-separated by empty set', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('a', 'b')
      bn.addEdge('b', 'c')
      expect(bn.isDSeparated('a', 'c')).toBe(false)
    })

    it('chain: A→B→C — A and C d-separated given B', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('a', 'b')
      bn.addEdge('b', 'c')
      expect(bn.isDSeparated('a', 'c', ['b'])).toBe(true)
    })

    it('common cause: A←B→C — A and C not d-separated by empty set', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('b', 'a')
      bn.addEdge('b', 'c')
      expect(bn.isDSeparated('a', 'c')).toBe(false)
    })

    it('common cause: A←B→C — A and C d-separated given B', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('b', 'a')
      bn.addEdge('b', 'c')
      expect(bn.isDSeparated('a', 'c', ['b'])).toBe(true)
    })

    it('v-structure: A→C←B — A and B d-separated by empty set', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('a', 'c')
      bn.addEdge('b', 'c')
      expect(bn.isDSeparated('a', 'b')).toBe(true)
    })

    it('v-structure: A→C←B — A and B NOT d-separated given C', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('a', 'c')
      bn.addEdge('b', 'c')
      expect(bn.isDSeparated('a', 'b', ['c'])).toBe(false)
    })

    it('disconnected nodes are d-separated', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      expect(bn.isDSeparated('a', 'b')).toBe(true)
    })
  })

  // ── Validation ──

  describe('validate', () => {
    it('validates an empty network', () => {
      const v = bn.validate()
      expect(v.isValid).toBe(true)
      expect(v.isAcyclic).toBe(true)
      expect(v.issues).toEqual([])
    })

    it('validates a well-formed network', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      const v = bn.validate()
      expect(v.isValid).toBe(true)
      expect(v.cptConsistency).toBe(true)
      expect(v.probabilitiesNormalized).toBe(true)
    })

    it('reports issues with incomplete CPTs', () => {
      bn.addNode('a', 'A')
      // Manually corrupt the CPT by deleting it
      // (use internal access via serialize/deserialize trick)
      const json = bn.serialize()
      const data = JSON.parse(json)
      data.cpts = [] // Remove all CPTs
      const broken = BayesianNetwork.deserialize(JSON.stringify(data))
      const v = broken.validate()
      expect(v.isValid).toBe(false)
      expect(v.cptConsistency).toBe(false)
      expect(v.issues.length).toBeGreaterThan(0)
    })
  })

  // ── Graph Queries ──

  describe('getParents', () => {
    it('returns empty for root nodes', () => {
      bn.addNode('a', 'A')
      expect(bn.getParents('a')).toEqual([])
    })

    it('returns parent ids', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      expect(bn.getParents('b')).toEqual(['a'])
    })

    it('returns multiple parents', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('a', 'c')
      bn.addEdge('b', 'c')
      expect(bn.getParents('c').sort()).toEqual(['a', 'b'])
    })
  })

  describe('getChildren', () => {
    it('returns empty for leaf nodes', () => {
      bn.addNode('a', 'A')
      expect(bn.getChildren('a')).toEqual([])
    })

    it('returns child ids', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      expect(bn.getChildren('a')).toEqual(['b'])
    })

    it('returns multiple children', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('a', 'b')
      bn.addEdge('a', 'c')
      expect(bn.getChildren('a').sort()).toEqual(['b', 'c'])
    })
  })

  describe('getStructure', () => {
    it('returns correct counts', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      const s = bn.getStructure()
      expect(s.nodeCount).toBe(2)
      expect(s.edgeCount).toBe(1)
      expect(s.nodes).toHaveLength(2)
      expect(s.edges).toHaveLength(1)
    })
  })

  // ── Serialize / Deserialize ──

  describe('serialize / deserialize', () => {
    it('round-trips an empty network', () => {
      const json = bn.serialize()
      const restored = BayesianNetwork.deserialize(json)
      expect(restored.getStats().nodeCount).toBe(0)
    })

    it('round-trips nodes and edges', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      const json = bn.serialize()
      const restored = BayesianNetwork.deserialize(json)
      expect(restored.getNode('a')).not.toBeNull()
      expect(restored.getNode('b')).not.toBeNull()
      expect(restored.getStructure().edgeCount).toBe(1)
    })

    it('round-trips custom CPTs', () => {
      bn.addNode('a', 'A')
      bn.setCPT('a', { '': { true: 0.7, false: 0.3 } })
      const json = bn.serialize()
      const restored = BayesianNetwork.deserialize(json)
      const cpt = restored.getCPT('a')
      expect(cpt!.probabilities[''].true).toBeCloseTo(0.7)
    })

    it('round-trips evidence', () => {
      bn.addNode('a', 'A')
      bn.setEvidence('a', 'true')
      const json = bn.serialize()
      const restored = BayesianNetwork.deserialize(json)
      expect(restored.getEvidence()).toHaveLength(1)
      expect(restored.getEvidence()[0].state).toBe('true')
    })

    it('produces valid JSON', () => {
      bn.addNode('a', 'A')
      const json = bn.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('deserialize handles missing arrays gracefully', () => {
      const minimal = JSON.stringify({ config: {} })
      const restored = BayesianNetwork.deserialize(minimal)
      expect(restored.getStats().nodeCount).toBe(0)
    })
  })

  // ── Statistics ──

  describe('getStats', () => {
    it('returns zeros for empty network', () => {
      const stats = bn.getStats()
      expect(stats.nodeCount).toBe(0)
      expect(stats.edgeCount).toBe(0)
      expect(stats.cptCount).toBe(0)
      expect(stats.evidenceCount).toBe(0)
      expect(stats.averageParents).toBe(0)
      expect(stats.maxParents).toBe(0)
      expect(stats.rootNodes).toBe(0)
      expect(stats.leafNodes).toBe(0)
      expect(stats.averageStatesPerNode).toBe(0)
    })

    it('computes correct stats for a simple network', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C', ['low', 'med', 'high'])
      bn.addEdge('a', 'b')
      bn.setEvidence('a', 'true')
      const stats = bn.getStats()
      expect(stats.nodeCount).toBe(3)
      expect(stats.edgeCount).toBe(1)
      expect(stats.cptCount).toBe(3)
      expect(stats.evidenceCount).toBe(1)
      expect(stats.rootNodes).toBe(2) // a and c
      expect(stats.leafNodes).toBe(2) // b and c
      expect(stats.maxParents).toBe(1)
    })

    it('computes average parents', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addNode('c', 'C')
      bn.addEdge('a', 'c')
      bn.addEdge('b', 'c')
      // a: 0 parents, b: 0 parents, c: 2 parents → avg = 2/3
      const stats = bn.getStats()
      expect(stats.averageParents).toBeCloseTo(2 / 3)
    })

    it('computes average states per node', () => {
      bn.addNode('a', 'A') // 2 states
      bn.addNode('b', 'B', ['x', 'y', 'z']) // 3 states
      const stats = bn.getStats()
      expect(stats.averageStatesPerNode).toBeCloseTo(2.5)
    })
  })

  // ── Structure Learning ──

  describe('learnStructure', () => {
    it('returns empty for insufficient data', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      const edges = bn.learnStructure([{ a: 'true', b: 'true' }])
      expect(edges).toEqual([])
    })

    it('learns edges from correlated data', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      // Perfectly correlated data: when a=true, b=true etc.
      const data = Array.from({ length: 50 }, (_, i) => {
        const val = i % 2 === 0 ? 'true' : 'false'
        return { a: val, b: val }
      })
      const edges = bn.learnStructure(data)
      expect(edges.length).toBeGreaterThan(0)
    })

    it('returns empty if fewer than 2 nodes', () => {
      bn.addNode('a', 'A')
      const data = [{ a: 'true' }, { a: 'false' }]
      const edges = bn.learnStructure(data)
      expect(edges).toEqual([])
    })
  })

  // ── Parameter Learning ──

  describe('learnParameters', () => {
    it('does nothing with empty data', () => {
      bn.addNode('a', 'A')
      bn.setCPT('a', { '': { true: 0.7, false: 0.3 } })
      bn.learnParameters([])
      // CPT should remain unchanged
      expect(bn.getCPT('a')!.probabilities[''].true).toBeCloseTo(0.7)
    })

    it('learns CPTs from frequency data', () => {
      bn.addNode('a', 'A')
      // Data: 80 true, 20 false → with Laplace smoothing should be ~true-heavy
      const data = [
        ...Array.from({ length: 80 }, () => ({ a: 'true' })),
        ...Array.from({ length: 20 }, () => ({ a: 'false' })),
      ]
      bn.learnParameters(data)
      const cpt = bn.getCPT('a')!
      expect(cpt.probabilities[''].true).toBeGreaterThan(cpt.probabilities[''].false)
    })

    it('learns conditional CPTs correctly', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      const data = [
        ...Array.from({ length: 40 }, () => ({ a: 'true', b: 'true' })),
        ...Array.from({ length: 10 }, () => ({ a: 'true', b: 'false' })),
        ...Array.from({ length: 10 }, () => ({ a: 'false', b: 'true' })),
        ...Array.from({ length: 40 }, () => ({ a: 'false', b: 'false' })),
      ]
      bn.learnParameters(data)
      const cpt = bn.getCPT('b')!
      // Given a=true, b should lean true
      expect(cpt.probabilities['true'].true).toBeGreaterThan(0.5)
      // Given a=false, b should lean false
      expect(cpt.probabilities['false'].false).toBeGreaterThan(0.5)
    })
  })

  // ── Sensitivity Analysis ──

  describe('sensitivityAnalysis', () => {
    it('throws for non-existent CPT node', () => {
      bn.addNode('a', 'A')
      expect(() => bn.sensitivityAnalysis('nope', '', 'a')).toThrow(/No CPT/)
    })

    it('throws for invalid parent key', () => {
      bn.addNode('a', 'A')
      expect(() => bn.sensitivityAnalysis('a', 'bad_key', 'a')).toThrow(/not found/)
    })

    it('throws for non-existent query node', () => {
      bn.addNode('a', 'A')
      expect(() => bn.sensitivityAnalysis('a', '', 'nope')).toThrow(/does not exist/)
    })

    it('returns sensitivity derivatives for each state', () => {
      bn.addNode('a', 'A')
      bn.addNode('b', 'B')
      bn.addEdge('a', 'b')
      bn.setCPT('a', { '': { true: 0.5, false: 0.5 } })
      bn.setCPT('b', {
        true: { true: 0.9, false: 0.1 },
        false: { true: 0.1, false: 0.9 },
      })
      const result = bn.sensitivityAnalysis('a', '', 'b')
      expect(result.true).toBeDefined()
      expect(result.false).toBeDefined()
      // Perturbing a=true up should increase P(b=true)
      expect(result.true.true).toBeGreaterThan(0)
    })
  })

  // ── Integration: classic alarm network ──

  describe('integration: alarm network', () => {
    beforeEach(() => {
      // Classic example: Burglary → Alarm ← Earthquake
      //                              ↓
      //                          JohnCalls
      bn.addNode('B', 'Burglary')
      bn.addNode('E', 'Earthquake')
      bn.addNode('A', 'Alarm')
      bn.addNode('J', 'JohnCalls')

      bn.addEdge('B', 'A')
      bn.addEdge('E', 'A')
      bn.addEdge('A', 'J')

      bn.setCPT('B', { '': { true: 0.01, false: 0.99 } })
      bn.setCPT('E', { '': { true: 0.02, false: 0.98 } })
      bn.setCPT('A', {
        'true|true': { true: 0.95, false: 0.05 },
        'true|false': { true: 0.94, false: 0.06 },
        'false|true': { true: 0.29, false: 0.71 },
        'false|false': { true: 0.001, false: 0.999 },
      })
      bn.setCPT('J', {
        true: { true: 0.9, false: 0.1 },
        false: { true: 0.05, false: 0.95 },
      })
    })

    it('validates the alarm network', () => {
      const v = bn.validate()
      expect(v.isValid).toBe(true)
    })

    it('inference without evidence returns prior-based marginals', () => {
      const result = bn.infer('J')
      expect(result.distribution.true).toBeGreaterThan(0)
      expect(result.distribution.false).toBeGreaterThan(0)
      const sum = result.distribution.true + result.distribution.false
      expect(sum).toBeCloseTo(1.0)
    })

    it('observing alarm changes probability of john calling', () => {
      const prior = bn.infer('J')
      bn.setEvidence('A', 'true')
      const posterior = bn.infer('J')
      expect(posterior.distribution.true).toBeGreaterThan(prior.distribution.true)
    })

    it('MAP finds most probable assignment', () => {
      const map = bn.findMostProbable()
      // Most probable: no burglary, no earthquake, no alarm, no call
      expect(map.assignment.B).toBe('false')
      expect(map.assignment.E).toBe('false')
    })

    it('d-separation: B and E are independent given nothing', () => {
      expect(bn.isDSeparated('B', 'E')).toBe(true)
    })

    it('d-separation: B and E become dependent given A (v-structure)', () => {
      expect(bn.isDSeparated('B', 'E', ['A'])).toBe(false)
    })

    it('serialize/deserialize preserves inference results', () => {
      const beforeResult = bn.infer('J')
      const json = bn.serialize()
      const restored = BayesianNetwork.deserialize(json)
      const afterResult = restored.infer('J')
      expect(afterResult.distribution.true).toBeCloseTo(beforeResult.distribution.true, 5)
    })
  })
})
