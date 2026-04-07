import { describe, it, expect, beforeEach } from 'vitest'
import {
  CausalReasoner,
  type CausalGraph,
  type CausalNode,
  type CausalEdge,
} from '../CausalReasoner'

// ── Helper: build a simple graph for reuse in tests ──

function makeSimpleGraph(): CausalGraph {
  const nodeA: CausalNode = { id: 'a', label: 'cause a', type: 'cause', properties: {} }
  const nodeB: CausalNode = { id: 'b', label: 'mediator b', type: 'mediator', properties: {} }
  const nodeC: CausalNode = { id: 'c', label: 'effect c', type: 'effect', properties: {} }
  const edgeAB: CausalEdge = { fromId: 'a', toId: 'b', strength: 0.9, mechanism: 'A causes B', confidence: 0.8 }
  const edgeBC: CausalEdge = { fromId: 'b', toId: 'c', strength: 0.8, mechanism: 'B causes C', confidence: 0.7 }
  return { nodes: [nodeA, nodeB, nodeC], edges: [edgeAB, edgeBC] }
}

function makeDiamondGraph(): CausalGraph {
  const nodeA: CausalNode = { id: 'a', label: 'root cause', type: 'cause', properties: {} }
  const nodeB: CausalNode = { id: 'b', label: 'path one', type: 'mediator', properties: {} }
  const nodeC: CausalNode = { id: 'c', label: 'path two', type: 'mediator', properties: {} }
  const nodeD: CausalNode = { id: 'd', label: 'final effect', type: 'effect', properties: {} }
  return {
    nodes: [nodeA, nodeB, nodeC, nodeD],
    edges: [
      { fromId: 'a', toId: 'b', strength: 0.8, mechanism: 'A→B', confidence: 0.9 },
      { fromId: 'a', toId: 'c', strength: 0.7, mechanism: 'A→C', confidence: 0.8 },
      { fromId: 'b', toId: 'd', strength: 0.85, mechanism: 'B→D', confidence: 0.85 },
      { fromId: 'c', toId: 'd', strength: 0.75, mechanism: 'C→D', confidence: 0.7 },
    ],
  }
}

// ── Constructor Tests ──

describe('CausalReasoner constructor', () => {
  it('creates an instance with default config', () => {
    const reasoner = new CausalReasoner()
    expect(reasoner).toBeInstanceOf(CausalReasoner)
  })

  it('accepts a partial custom config', () => {
    const reasoner = new CausalReasoner({ maxChainLength: 5 })
    expect(reasoner).toBeInstanceOf(CausalReasoner)
  })

  it('accepts a full custom config', () => {
    const reasoner = new CausalReasoner({
      maxChainLength: 10,
      minConfidence: 0.2,
      strengthDecayRate: 0.1,
      maxGraphNodes: 300,
      enableLearning: false,
      confoundingThreshold: 0.5,
    })
    expect(reasoner).toBeInstanceOf(CausalReasoner)
  })

  it('has pre-built causal patterns available immediately', () => {
    const reasoner = new CausalReasoner()
    const inference = reasoner.inferCausality('memory leak', 'out of memory error')
    expect(inference.relationship).not.toBe('none')
  })
})

// ── buildCausalGraph Tests ──

describe('CausalReasoner buildCausalGraph', () => {
  let reasoner: CausalReasoner

  beforeEach(() => {
    reasoner = new CausalReasoner()
  })

  it('returns an empty graph for an empty observations array', () => {
    const graph = reasoner.buildCausalGraph([])
    expect(graph.nodes).toEqual([])
    expect(graph.edges).toEqual([])
  })

  it('builds a graph from a single causal observation', () => {
    const graph = reasoner.buildCausalGraph(['memory leak causes out of memory error'])
    expect(graph.nodes.length).toBeGreaterThanOrEqual(2)
    expect(graph.edges.length).toBeGreaterThanOrEqual(1)
  })

  it('builds a graph from multiple observations', () => {
    const graph = reasoner.buildCausalGraph([
      'memory leak causes out of memory error',
      'race condition leads to data corruption',
    ])
    expect(graph.nodes.length).toBeGreaterThanOrEqual(4)
    expect(graph.edges.length).toBeGreaterThanOrEqual(2)
  })

  it('parses forward causal indicators like "leads to"', () => {
    const graph = reasoner.buildCausalGraph(['high traffic spike leads to server overload'])
    expect(graph.edges.length).toBeGreaterThanOrEqual(1)
    const labels = graph.nodes.map(n => n.label)
    expect(labels.some(l => l.includes('traffic'))).toBe(true)
  })

  it('parses backward causal indicators like "caused by"', () => {
    const graph = reasoner.buildCausalGraph(['application crash caused by null pointer dereference'])
    expect(graph.edges.length).toBeGreaterThanOrEqual(1)
    const causeNode = graph.nodes.find(n => n.type === 'cause')
    expect(causeNode).toBeDefined()
  })

  it('assigns higher confidence for known software-engineering patterns', () => {
    const graph = reasoner.buildCausalGraph(['null pointer dereference causes application crash'])
    const edge = graph.edges[0]
    expect(edge.confidence).toBeGreaterThanOrEqual(0.5)
  })

  it('creates confounder nodes from pattern knowledge', () => {
    const graph = reasoner.buildCausalGraph(['race condition causes data corruption'])
    const confounders = graph.nodes.filter(n => n.type === 'confounder')
    expect(confounders.length).toBeGreaterThanOrEqual(1)
  })

  it('falls back to pattern database for observations without causal keywords', () => {
    const graph = reasoner.buildCausalGraph(['memory leak out of memory error'])
    expect(graph.nodes.length).toBeGreaterThanOrEqual(1)
  })

  it('increments totalGraphsBuilt stat', () => {
    reasoner.buildCausalGraph(['A causes B'])
    reasoner.buildCausalGraph(['C causes D'])
    const stats = reasoner.getStats()
    expect(stats.totalGraphsBuilt).toBe(2)
  })
})

// ── findRootCauses Tests ──

describe('CausalReasoner findRootCauses', () => {
  let reasoner: CausalReasoner

  beforeEach(() => {
    reasoner = new CausalReasoner()
  })

  it('finds root causes for a known effect like "application crash"', () => {
    const result = reasoner.findRootCauses('application crash')
    expect(result.causes.length).toBeGreaterThan(0)
  })

  it('returns the queried effect string in the result', () => {
    const result = reasoner.findRootCauses('data corruption')
    expect(result.effect).toBe('data corruption')
  })

  it('root causes include a mechanism description', () => {
    const result = reasoner.findRootCauses('out of memory error')
    expect(result.causes.length).toBeGreaterThan(0)
    expect(typeof result.causes[0].mechanism).toBe('string')
    expect(result.causes[0].mechanism.length).toBeGreaterThan(0)
  })

  it('root causes are sorted by likelihood descending', () => {
    const result = reasoner.findRootCauses('application crash')
    for (let i = 1; i < result.causes.length; i++) {
      expect(result.causes[i - 1].likelihood).toBeGreaterThanOrEqual(result.causes[i].likelihood)
    }
  })

  it('each root cause has a CausalChain attached', () => {
    const result = reasoner.findRootCauses('service downtime')
    for (const cause of result.causes) {
      expect(cause.chain).toBeDefined()
      expect(cause.chain.nodes.length).toBeGreaterThan(0)
      expect(typeof cause.chain.totalStrength).toBe('number')
      expect(typeof cause.chain.confidence).toBe('number')
    }
  })

  it('finds root causes from a custom graph', () => {
    const graph = makeSimpleGraph()
    const result = reasoner.findRootCauses('effect c', graph)
    expect(result.causes.length).toBeGreaterThan(0)
    expect(result.causes[0].node.label).toBe('cause a')
  })

  it('returns empty causes for a completely unknown effect with no graph', () => {
    const result = reasoner.findRootCauses('xyzzy_completely_unknown_effect_12345')
    expect(result.causes.length).toBe(0)
  })

  it('finds causes from the current graph when built beforehand', () => {
    reasoner.buildCausalGraph([
      'null pointer dereference causes application crash',
      'buffer overflow causes security vulnerability',
    ])
    const result = reasoner.findRootCauses('application crash')
    expect(result.causes.length).toBeGreaterThan(0)
  })
})

// ── analyzeCounterfactual Tests ──

describe('CausalReasoner analyzeCounterfactual', () => {
  let reasoner: CausalReasoner

  beforeEach(() => {
    reasoner = new CausalReasoner()
  })

  it('returns a scenario string starting with "What if"', () => {
    const result = reasoner.analyzeCounterfactual('memory leak')
    expect(result.scenario).toContain('What if')
  })

  it('returns a predicted outcome string', () => {
    const result = reasoner.analyzeCounterfactual('null pointer dereference')
    expect(typeof result.predictedOutcome).toBe('string')
    expect(result.predictedOutcome.length).toBeGreaterThan(0)
  })

  it('has a confidence between 0 and 1', () => {
    const result = reasoner.analyzeCounterfactual('race condition')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('includes reasoning steps', () => {
    const result = reasoner.analyzeCounterfactual('deadlock')
    expect(Array.isArray(result.reasoning)).toBe(true)
    expect(result.reasoning.length).toBeGreaterThan(0)
  })

  it('works with a custom graph', () => {
    const graph = makeSimpleGraph()
    const result = reasoner.analyzeCounterfactual('cause a', graph)
    expect(result.reasoning.length).toBeGreaterThan(0)
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('handles an unknown condition gracefully', () => {
    const result = reasoner.analyzeCounterfactual('xyzzy_unknown_condition_12345')
    expect(result).toBeDefined()
    expect(typeof result.predictedOutcome).toBe('string')
  })
})

// ── inferCausality Tests ──

describe('CausalReasoner inferCausality', () => {
  let reasoner: CausalReasoner

  beforeEach(() => {
    reasoner = new CausalReasoner()
  })

  it('infers direct causality for a known pair', () => {
    const result = reasoner.inferCausality('null pointer dereference', 'application crash')
    expect(result.relationship).toBe('direct')
  })

  it('returns cause and effect fields matching input', () => {
    const result = reasoner.inferCausality('memory leak', 'out of memory error')
    expect(result.cause).toBe('memory leak')
    expect(result.effect).toBe('out of memory error')
  })

  it('returns strength between 0 and 1', () => {
    const result = reasoner.inferCausality('race condition', 'data corruption')
    expect(result.strength).toBeGreaterThanOrEqual(0)
    expect(result.strength).toBeLessThanOrEqual(1)
  })

  it('returns confidence between 0 and 1', () => {
    const result = reasoner.inferCausality('buffer overflow', 'security vulnerability')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('returns a mechanism string for known pairs', () => {
    const result = reasoner.inferCausality('deadlock', 'system hang')
    expect(typeof result.mechanism).toBe('string')
    expect(result.mechanism.length).toBeGreaterThan(0)
  })

  it('returns "none" relationship for completely unrelated concepts', () => {
    const result = reasoner.inferCausality(
      'xyzzy_unknown_cause_12345',
      'xyzzy_unknown_effect_67890',
    )
    expect(result.relationship).toBe('none')
  })

  it('detects confounders for pairs that have them', () => {
    const result = reasoner.inferCausality('memory leak', 'out of memory error')
    expect(Array.isArray(result.confounders)).toBe(true)
    expect(result.confounders.length).toBeGreaterThan(0)
  })

  it('infers causality using the current graph after building it', () => {
    reasoner.buildCausalGraph([
      'null pointer dereference causes application crash',
    ])
    const result = reasoner.inferCausality('null pointer dereference', 'application crash')
    expect(result.relationship).toBe('direct')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('increments totalInferences stat', () => {
    reasoner.inferCausality('A', 'B')
    reasoner.inferCausality('C', 'D')
    const stats = reasoner.getStats()
    expect(stats.totalInferences).toBe(2)
  })
})

// ── predictIntervention Tests ──

describe('CausalReasoner predictIntervention', () => {
  let reasoner: CausalReasoner

  beforeEach(() => {
    reasoner = new CausalReasoner()
  })

  it('predicts effects for a known intervention like "fix memory leak"', () => {
    const result = reasoner.predictIntervention('fix memory leak')
    expect(result.predictedEffects.length).toBeGreaterThan(0)
  })

  it('returns intervention string in the result', () => {
    const result = reasoner.predictIntervention('remove null pointer dereference')
    expect(result.intervention).toBe('remove null pointer dereference')
  })

  it('has confidence between 0 and 1', () => {
    const result = reasoner.predictIntervention('fix deadlock')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('predicts effects with a custom graph', () => {
    const graph = makeSimpleGraph()
    const result = reasoner.predictIntervention('increase cause a', graph)
    expect(result.predictedEffects.length).toBeGreaterThan(0)
  })

  it('handles unknown interventions gracefully', () => {
    const result = reasoner.predictIntervention('xyzzy_unknown_intervention_12345')
    expect(result).toBeDefined()
    expect(result.confidence).toBeGreaterThanOrEqual(0)
  })

  it('increments totalInterventions stat', () => {
    reasoner.predictIntervention('fix memory leak')
    reasoner.predictIntervention('remove race condition')
    const stats = reasoner.getStats()
    expect(stats.totalInterventions).toBe(2)
  })

  it('detects direction keywords like "increase" and "decrease"', () => {
    const graph = makeSimpleGraph()
    const increaseResult = reasoner.predictIntervention('increase cause a', graph)
    for (const eff of increaseResult.predictedEffects) {
      expect(eff.direction).toBe('increase')
    }
  })
})

// ── findCausalChains Tests ──

describe('CausalReasoner findCausalChains', () => {
  let reasoner: CausalReasoner

  beforeEach(() => {
    reasoner = new CausalReasoner()
  })

  it('finds chains between connected nodes in a custom graph', () => {
    const graph = makeSimpleGraph()
    const chains = reasoner.findCausalChains('cause a', 'effect c', graph)
    expect(chains.length).toBeGreaterThan(0)
  })

  it('returns empty array for disconnected nodes', () => {
    const graph = makeSimpleGraph()
    const chains = reasoner.findCausalChains('effect c', 'cause a', graph)
    expect(chains).toEqual([])
  })

  it('chains have nodes and edges', () => {
    const graph = makeSimpleGraph()
    const chains = reasoner.findCausalChains('cause a', 'effect c', graph)
    expect(chains.length).toBeGreaterThan(0)
    expect(chains[0].nodes.length).toBeGreaterThan(0)
    expect(chains[0].edges.length).toBeGreaterThan(0)
  })

  it('chains have totalStrength and confidence', () => {
    const graph = makeSimpleGraph()
    const chains = reasoner.findCausalChains('cause a', 'effect c', graph)
    expect(chains[0].totalStrength).toBeGreaterThan(0)
    expect(chains[0].totalStrength).toBeLessThanOrEqual(1)
    expect(chains[0].confidence).toBeGreaterThan(0)
    expect(chains[0].confidence).toBeLessThanOrEqual(1)
  })

  it('finds multiple chains in a diamond graph', () => {
    const graph = makeDiamondGraph()
    const chains = reasoner.findCausalChains('root cause', 'final effect', graph)
    expect(chains.length).toBe(2)
  })

  it('chains are sorted by totalStrength descending', () => {
    const graph = makeDiamondGraph()
    const chains = reasoner.findCausalChains('root cause', 'final effect', graph)
    for (let i = 1; i < chains.length; i++) {
      expect(chains[i - 1].totalStrength).toBeGreaterThanOrEqual(chains[i].totalStrength)
    }
  })

  it('returns empty array when graph has no nodes', () => {
    const emptyGraph: CausalGraph = { nodes: [], edges: [] }
    const chains = reasoner.findCausalChains('A', 'B', emptyGraph)
    expect(chains).toEqual([])
  })
})

// ── getMarkovBlanket Tests ──

describe('CausalReasoner getMarkovBlanket', () => {
  let reasoner: CausalReasoner

  beforeEach(() => {
    reasoner = new CausalReasoner()
  })

  it('returns parents and children for a mediator node', () => {
    const graph = makeSimpleGraph()
    const blanket = reasoner.getMarkovBlanket('b', graph)
    const ids = blanket.map(n => n.id)
    expect(ids).toContain('a')
    expect(ids).toContain('c')
  })

  it('returns co-parents of children in a diamond graph', () => {
    const graph = makeDiamondGraph()
    // Blanket of node 'b': parent 'a', child 'd', co-parent 'c'
    const blanket = reasoner.getMarkovBlanket('b', graph)
    const ids = blanket.map(n => n.id)
    expect(ids).toContain('a')
    expect(ids).toContain('d')
    expect(ids).toContain('c')
  })

  it('returns empty array for a node with no connections', () => {
    const isolatedNode: CausalNode = { id: 'z', label: 'isolated', type: 'cause', properties: {} }
    const graph: CausalGraph = { nodes: [isolatedNode], edges: [] }
    const blanket = reasoner.getMarkovBlanket('z', graph)
    expect(blanket).toEqual([])
  })

  it('does not include the node itself in its blanket', () => {
    const graph = makeSimpleGraph()
    const blanket = reasoner.getMarkovBlanket('b', graph)
    const ids = blanket.map(n => n.id)
    expect(ids).not.toContain('b')
  })
})

// ── isDSeparated Tests ──

describe('CausalReasoner isDSeparated', () => {
  let reasoner: CausalReasoner

  beforeEach(() => {
    reasoner = new CausalReasoner()
  })

  it('nodes in a chain are not d-separated when mediator is unconditioned', () => {
    const graph = makeSimpleGraph()
    const separated = reasoner.isDSeparated('a', 'c', [], graph)
    expect(separated).toBe(false)
  })

  it('nodes in a chain are d-separated when the mediator is conditioned on', () => {
    const graph = makeSimpleGraph()
    const separated = reasoner.isDSeparated('a', 'c', ['b'], graph)
    expect(separated).toBe(true)
  })

  it('returns true (d-separated) for completely disconnected nodes', () => {
    const nodeX: CausalNode = { id: 'x', label: 'x', type: 'cause', properties: {} }
    const nodeY: CausalNode = { id: 'y', label: 'y', type: 'effect', properties: {} }
    const graph: CausalGraph = { nodes: [nodeX, nodeY], edges: [] }
    const separated = reasoner.isDSeparated('x', 'y', [], graph)
    expect(separated).toBe(true)
  })

  it('returns true for nodes with no edges in an empty graph', () => {
    const emptyGraph: CausalGraph = { nodes: [], edges: [] }
    const separated = reasoner.isDSeparated('a', 'b', [], emptyGraph)
    expect(separated).toBe(true)
  })
})

// ── learnFromFeedback Tests ──

describe('CausalReasoner learnFromFeedback', () => {
  let reasoner: CausalReasoner

  beforeEach(() => {
    reasoner = new CausalReasoner()
  })

  it('increases feedbackReceived count after positive feedback', () => {
    const inference = reasoner.inferCausality('memory leak', 'out of memory error')
    reasoner.learnFromFeedback(inference, true)
    const stats = reasoner.getStats()
    expect(stats.feedbackReceived).toBe(1)
  })

  it('increases feedbackReceived count after negative feedback', () => {
    const inference = reasoner.inferCausality('A', 'B')
    reasoner.learnFromFeedback(inference, false)
    const stats = reasoner.getStats()
    expect(stats.feedbackReceived).toBe(1)
  })

  it('tracks accuracy correctly with mixed feedback', () => {
    const inf1 = reasoner.inferCausality('memory leak', 'out of memory error')
    const inf2 = reasoner.inferCausality('A', 'B')
    reasoner.learnFromFeedback(inf1, true)
    reasoner.learnFromFeedback(inf2, false)
    const stats = reasoner.getStats()
    expect(stats.feedbackReceived).toBe(2)
    expect(stats.feedbackAccuracy).toBe(0.5)
  })

  it('does nothing when learning is disabled', () => {
    const noLearn = new CausalReasoner({ enableLearning: false })
    const inference = noLearn.inferCausality('A', 'B')
    noLearn.learnFromFeedback(inference, true)
    const stats = noLearn.getStats()
    expect(stats.feedbackReceived).toBe(0)
  })
})

// ── getStats Tests ──

describe('CausalReasoner getStats', () => {
  let reasoner: CausalReasoner

  beforeEach(() => {
    reasoner = new CausalReasoner()
  })

  it('returns stats with all expected fields', () => {
    const stats = reasoner.getStats()
    expect(typeof stats.totalGraphsBuilt).toBe('number')
    expect(typeof stats.totalInferences).toBe('number')
    expect(typeof stats.totalInterventions).toBe('number')
    expect(typeof stats.totalCounterfactuals).toBe('number')
    expect(typeof stats.avgConfidence).toBe('number')
    expect(typeof stats.feedbackReceived).toBe('number')
    expect(typeof stats.feedbackAccuracy).toBe('number')
  })

  it('starts with zero counts', () => {
    const stats = reasoner.getStats()
    expect(stats.totalGraphsBuilt).toBe(0)
    expect(stats.totalInferences).toBe(0)
    expect(stats.totalInterventions).toBe(0)
    expect(stats.totalCounterfactuals).toBe(0)
    expect(stats.feedbackReceived).toBe(0)
    expect(stats.feedbackAccuracy).toBe(0)
  })

  it('updates after various operations', () => {
    reasoner.buildCausalGraph(['A causes B'])
    reasoner.inferCausality('A', 'B')
    reasoner.predictIntervention('fix A')
    reasoner.analyzeCounterfactual('A')
    const stats = reasoner.getStats()
    expect(stats.totalGraphsBuilt).toBe(1)
    expect(stats.totalInferences).toBe(1)
    expect(stats.totalInterventions).toBe(1)
    expect(stats.totalCounterfactuals).toBe(1)
  })
})

// ── serialize / deserialize Tests ──

describe('CausalReasoner serialize / deserialize', () => {
  it('round-trip preserves config', () => {
    const original = new CausalReasoner({
      maxChainLength: 12,
      minConfidence: 0.3,
    })

    const json = original.serialize()
    const data = JSON.parse(json)
    expect(data.config.maxChainLength).toBe(12)
    expect(data.config.minConfidence).toBe(0.3)
  })

  it('round-trip preserves the current graph', () => {
    const original = new CausalReasoner()
    original.buildCausalGraph(['memory leak causes out of memory error'])

    const json = original.serialize()
    const restored = CausalReasoner.deserialize(json)
    const stats = restored.getStats()
    expect(stats.totalGraphsBuilt).toBe(1)
  })

  it('round-trip preserves stats', () => {
    const original = new CausalReasoner()
    original.buildCausalGraph(['A causes B'])
    original.inferCausality('A', 'B')
    original.predictIntervention('fix A')

    const json = original.serialize()
    const restored = CausalReasoner.deserialize(json)
    const stats = restored.getStats()

    expect(stats.totalGraphsBuilt).toBe(1)
    expect(stats.totalInferences).toBe(1)
    expect(stats.totalInterventions).toBe(1)
  })

  it('deserialized reasoner works correctly', () => {
    const original = new CausalReasoner()
    original.buildCausalGraph([
      'null pointer dereference causes application crash',
    ])

    const json = original.serialize()
    const restored = CausalReasoner.deserialize(json)

    const inference = restored.inferCausality('null pointer dereference', 'application crash')
    expect(inference.relationship).not.toBe('none')
  })

  it('throws on corrupted JSON input', () => {
    expect(() => CausalReasoner.deserialize('not valid json')).toThrow()
  })
})
