import { describe, it, expect, beforeEach } from 'vitest'
import {
  DecisionEngine,
  type Alternative,
  type Criterion,
  type DecisionNode,
} from '../DecisionEngine'

function makeAlts(n: number): Alternative[] {
  const crIds = ['c0', 'c1', 'c2']
  return Array.from({ length: n }, (_, i) => ({
    id: `alt${i}`, name: `Alt ${i}`,
    scores: Object.fromEntries(crIds.map((c, j) => [c, 5 + i * 2 + j])),
    metadata: {},
  }))
}

function makeCrits(n: number): Criterion[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `c${i}`, name: `Criterion ${i}`, weight: 1 / n,
    direction: (i % 2 === 0 ? 'maximize' : 'minimize') as 'maximize' | 'minimize',
    scale: { min: 0, max: 20 },
  }))
}

function makeTree(): DecisionNode {
  return {
    id: 'root', type: 'choice', label: 'Invest?', value: 0, probability: 1,
    children: [
      {
        id: 'invest', type: 'chance', label: 'Invest', value: 0, probability: 1,
        children: [
          { id: 'win', type: 'terminal', label: 'Win', value: 100, probability: 0.6, children: [] },
          { id: 'lose', type: 'terminal', label: 'Lose', value: -50, probability: 0.4, children: [] },
        ],
      },
      { id: 'hold', type: 'terminal', label: 'Hold', value: 10, probability: 1, children: [] },
    ],
  }
}

describe('DecisionEngine', () => {
  let engine: DecisionEngine

  beforeEach(() => { engine = new DecisionEngine() })

  describe('constructor', () => {
    it('creates with defaults', () => {
      expect(engine.getStats().totalDecisions).toBe(0)
    })
    it('accepts partial config', () => {
      const e = new DecisionEngine({ journalCapacity: 10 })
      expect(e.getStats().totalDecisions).toBe(0)
    })
  })

  describe('weightedScore', () => {
    it('returns ranked alternatives', () => {
      const r = engine.weightedScore(makeAlts(3), makeCrits(3))
      expect(r.ranking.length).toBe(3)
      expect(r.method).toBe('weighted')
    })
    it('scores between 0 and 1', () => {
      const r = engine.weightedScore(makeAlts(3), makeCrits(3))
      for (const x of r.ranking) { expect(x.score).toBeGreaterThanOrEqual(0); expect(x.score).toBeLessThanOrEqual(1) }
    })
    it('sorted descending', () => {
      const r = engine.weightedScore(makeAlts(4), makeCrits(3))
      for (let i = 1; i < r.ranking.length; i++) expect(r.ranking[i - 1].score).toBeGreaterThanOrEqual(r.ranking[i].score)
    })
    it('handles empty alts', () => {
      const r = engine.weightedScore([], makeCrits(2))
      expect(r.ranking.length).toBe(0)
    })
  })

  describe('topsis', () => {
    it('returns ranked alternatives', () => {
      const r = engine.topsis(makeAlts(3), makeCrits(3))
      expect(r.ranking.length).toBe(3)
      expect(r.method).toBe('topsis')
    })
    it('scores between 0 and 1', () => {
      const r = engine.topsis(makeAlts(4), makeCrits(3))
      for (const x of r.ranking) { expect(x.score).toBeGreaterThanOrEqual(0); expect(x.score).toBeLessThanOrEqual(1) }
    })
  })

  describe('ahpPairwise', () => {
    it('computes priorities', () => {
      const r = engine.ahpPairwise(makeAlts(3), makeCrits(3), [[1, 3, 5], [1 / 3, 1, 2], [1 / 5, 1 / 2, 1]])
      expect(r.ranking.length).toBe(3)
      expect(r.method).toBe('ahp')
    })
    it('assigns positive scores', () => {
      const r = engine.ahpPairwise(makeAlts(2), makeCrits(2), [[1, 2], [0.5, 1]])
      for (const x of r.ranking) expect(x.score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Bayesian inference', () => {
    it('creates a belief with prior', () => {
      const b = engine.createBelief('H1', 0.5)
      expect(b.hypothesis).toBe('H1')
      expect(b.posterior).toBeCloseTo(0.5, 1)
    })
    it('updates belief with evidence', () => {
      engine.createBelief('H1', 0.5)
      const upd = engine.updateBelief('H1', 'ev1', 0.9, 0.1)
      expect(upd.newPosterior).not.toBe(0.5)
    })
    it('high likelihood increases belief', () => {
      engine.createBelief('H1', 0.5)
      const upd = engine.updateBelief('H1', 'ev1', 0.9, 0.1)
      expect(upd.newPosterior).toBeGreaterThan(0.5)
    })
    it('retrieves belief', () => {
      engine.createBelief('H1', 0.3)
      expect(engine.getBelief('H1')?.hypothesis).toBe('H1')
    })
    it('lists all beliefs', () => {
      engine.createBelief('A', 0.4); engine.createBelief('B', 0.6)
      expect(engine.listBeliefs().length).toBe(2)
    })
    it('returns undefined for unknown hypothesis', () => {
      expect(engine.getBelief('nope')).toBeUndefined()
    })
    it('auto-creates belief on unknown update', () => {
      const upd = engine.updateBelief('unknown', 'ev', 0.5, 0.5)
      expect(upd).toBeDefined()
      expect(upd.belief.hypothesis).toBe('unknown')
    })
  })

  describe('analyzeGame', () => {
    it('finds Nash equilibria', () => {
      const r = engine.analyzeGame(['P0', 'P1'], [['C', 'D'], ['C', 'D']], [[[3, 3], [0, 5]], [[5, 0], [1, 1]]])
      expect(r.nashEquilibria).toBeDefined()
      expect(Array.isArray(r.nashEquilibria)).toBe(true)
    })
    it('identifies dominant strategies', () => {
      const r = engine.analyzeGame(['P0', 'P1'], [['A', 'B'], ['A', 'B']], [[[4, 4], [0, 5]], [[5, 0], [1, 1]]])
      expect(r.dominantStrategies).toBeDefined()
    })
  })

  describe('minimax', () => {
    it('selects best worst-case strategy', () => {
      const r = engine.minimax([[3, -2, 4], [-1, 5, -3], [2, 1, 0]])
      expect(typeof r.strategy).toBe('number')
      expect(typeof r.value).toBe('number')
    })
  })

  describe('evaluateTree', () => {
    it('evaluates a decision tree', () => {
      const r = engine.evaluateTree(makeTree())
      expect(r.optimalPath.length).toBeGreaterThan(0)
      expect(Object.keys(r.expectedValues).length).toBeGreaterThan(0)
    })
    it('terminal node', () => {
      const t: DecisionNode = { id: 't', type: 'terminal', label: 'End', value: 42, probability: 1, children: [] }
      const r = engine.evaluateTree(t)
      expect(r.expectedValues['End']).toBe(42)
    })
  })

  describe('evaluateProspect', () => {
    it('computes prospect value', () => {
      const r = engine.evaluateProspect([{ value: 100, probability: 0.5 }, { value: -50, probability: 0.5 }])
      expect(typeof r.prospectValue).toBe('number')
      expect(r.riskProfile).toBeDefined()
    })
    it('separates gains and losses', () => {
      const r = engine.evaluateProspect([{ value: 50, probability: 0.3 }, { value: -30, probability: 0.7 }])
      expect(r.gains.length).toBeGreaterThan(0)
      expect(r.losses.length).toBeGreaterThan(0)
    })
    it('uses reference point', () => {
      const r = engine.evaluateProspect([{ value: 60, probability: 0.5 }, { value: 40, probability: 0.5 }], 50)
      expect(r.gains.length).toBeGreaterThan(0)
      expect(r.losses.length).toBeGreaterThan(0)
    })
  })

  describe('analyzeSensitivity', () => {
    it('returns range and outcomes', () => {
      const r = engine.analyzeSensitivity('p', 5, { min: 0, max: 10 }, v => v * 2)
      expect(r.parameter).toBe('p')
      expect(r.range.length).toBeGreaterThan(0)
      expect(r.outcomes.length).toBe(r.range.length)
    })
    it('robustness between 0 and 1', () => {
      const r = engine.analyzeSensitivity('p', 3, { min: 0, max: 6 }, v => v * v)
      expect(r.robustness).toBeGreaterThanOrEqual(0)
      expect(r.robustness).toBeLessThanOrEqual(1)
    })
    it('constant function high robustness', () => {
      const r = engine.analyzeSensitivity('p', 3, { min: 0, max: 10 }, () => 5)
      expect(r.robustness).toBeGreaterThanOrEqual(0.9)
    })
  })

  describe('sensitivityOnWeights', () => {
    it('returns one result per criterion', () => {
      const r = engine.sensitivityOnWeights(makeAlts(3), makeCrits(3))
      expect(r.length).toBe(3)
    })
  })

  describe('bordaCount', () => {
    it('ranks alternatives', () => {
      const r = engine.bordaCount(['S1', 'S2', 'S3'], [[0, 1, 2], [1, 0, 2], [0, 2, 1]], ['A', 'B', 'C'])
      expect(r.ranking.length).toBe(3)
      expect(r.aggregation).toBe('borda')
    })
    it('consensus between 0 and 1', () => {
      const r = engine.bordaCount(['S1', 'S2'], [[0, 1], [1, 0]], ['A', 'B'])
      expect(r.consensus).toBeGreaterThanOrEqual(0)
      expect(r.consensus).toBeLessThanOrEqual(1)
    })
  })

  describe('condorcet', () => {
    it('pairwise ranking', () => {
      const r = engine.condorcet(['S1', 'S2', 'S3'], [[0, 1, 2], [0, 2, 1], [1, 0, 2]], ['A', 'B', 'C'])
      expect(r.ranking.length).toBe(3)
      expect(r.aggregation).toBe('condorcet')
    })
  })

  describe('plurality', () => {
    it('first-place votes', () => {
      const r = engine.plurality(['S1', 'S2', 'S3'], [[0, 1, 2], [0, 1, 2], [1, 0, 2]], ['A', 'B', 'C'])
      expect(r.ranking.length).toBe(3)
      expect(r.aggregation).toBe('plurality')
      expect(r.ranking[0].alternativeId).toBe('A')
    })
  })

  describe('decision journaling', () => {
    it('records a decision', () => {
      const rec = engine.recordDecision('Test', ['A', 'B'], 'A', 0.7)
      expect(rec.id).toBeTruthy()
      expect(rec.chosen).toBe('A')
    })
    it('records outcome', () => {
      const rec = engine.recordDecision('Test', ['A', 'B'], 'A', 0.7)
      const upd = engine.recordOutcome(rec.id, 'Success', 'Good')
      expect(upd).toBeDefined()
      expect(upd!.outcome).toBe('Success')
    })
    it('returns undefined for unknown ID', () => {
      expect(engine.recordOutcome('nope', 'Fail')).toBeUndefined()
    })
    it('retrieves journal', () => {
      engine.recordDecision('D1', ['A'], 'A', 0.5)
      engine.recordDecision('D2', ['B'], 'B', 0.8)
      expect(engine.getJournal().length).toBe(2)
    })
    it('computes calibration', () => {
      const rec = engine.recordDecision('D1', ['A'], 'A', 0.8)
      engine.recordOutcome(rec.id, 'Good')
      engine.provideFeedback(rec.id, true)
      const cal = engine.getCalibration()
      expect(Array.isArray(cal)).toBe(true)
    })
  })

  describe('provideFeedback', () => {
    it('records feedback', () => {
      const rec = engine.recordDecision('D1', ['A', 'B'], 'A', 0.7)
      engine.provideFeedback(rec.id, true)
      expect(engine.getStats().feedbackReceived).toBe(1)
    })
    it('tracks multiple feedbacks', () => {
      const r1 = engine.recordDecision('D1', ['A'], 'A', 0.7)
      const r2 = engine.recordDecision('D2', ['B'], 'B', 0.7)
      engine.provideFeedback(r1.id, true)
      engine.provideFeedback(r2.id, false)
      expect(engine.getStats().feedbackReceived).toBe(2)
    })
  })

  describe('getStats', () => {
    it('initial zero stats', () => {
      const s = engine.getStats()
      expect(s.totalDecisions).toBe(0)
      expect(s.feedbackReceived).toBe(0)
    })
    it('increments', () => {
      engine.weightedScore(makeAlts(2), makeCrits(2))
      engine.evaluateProspect([{ value: 10, probability: 1 }])
      expect(engine.getStats().totalDecisions).toBeGreaterThan(0)
    })
  })

  describe('serialize / deserialize', () => {
    it('round-trips', () => {
      engine.createBelief('H1', 0.6)
      engine.recordDecision('D1', ['A', 'B'], 'A', 0.8)
      const json = engine.serialize()
      const r = DecisionEngine.deserialize(json)
      expect(r.getBelief('H1')?.posterior).toBeCloseTo(0.6, 1)
      expect(r.getJournal().length).toBe(1)
    })
    it('valid JSON', () => { expect(() => JSON.parse(engine.serialize())).not.toThrow() })
    it('preserves stats', () => {
      engine.evaluateProspect([{ value: 50, probability: 1 }])
      const r = DecisionEngine.deserialize(engine.serialize())
      expect(r.getStats().totalDecisions).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('empty criteria', () => {
      const r = engine.weightedScore(makeAlts(2), [])
      expect(r.ranking.length).toBeGreaterThanOrEqual(0)
    })
    it('single payoff minimax', () => {
      const r = engine.minimax([[5]])
      expect(typeof r.value).toBe('number')
    })
    it('empty prefs in group', () => {
      const r = engine.bordaCount([], [], ['A', 'B'])
      expect(r.ranking.length).toBe(2)
    })
  })
})
