import { describe, it, expect, beforeEach } from 'vitest'
import { ScientificReasoner, DEFAULT_SCIENTIFIC_REASONER_CONFIG } from '../ScientificReasoner.js'

describe('ScientificReasoner', () => {
  let sr: ScientificReasoner

  beforeEach(() => {
    sr = new ScientificReasoner()
  })

  describe('constructor & config', () => {
    it('uses default config', () => {
      expect(sr.getStats().totalHypotheses).toBe(0)
    })
    it('accepts custom config', () => {
      const c = new ScientificReasoner({ defaultSignificanceLevel: 0.01 })
      expect(c.getStats().totalHypotheses).toBe(0)
    })
    it('DEFAULT config has expected values', () => {
      expect(DEFAULT_SCIENTIFIC_REASONER_CONFIG.defaultSignificanceLevel).toBe(0.05)
      expect(DEFAULT_SCIENTIFIC_REASONER_CONFIG.minSampleSize).toBe(30)
    })
  })

  describe('hypothesis formulation', () => {
    it('creates a hypothesis with variables', () => {
      const h = sr.formulateHypothesis('Sleep affects productivity', [
        {
          name: 'sleep_hours',
          type: 'independent',
          operationalization: 'Hours of sleep per night',
          measurementScale: 'ratio',
        },
        {
          name: 'productivity_score',
          type: 'dependent',
          operationalization: 'Tasks completed per day',
          measurementScale: 'ratio',
        },
      ])
      expect(h.id).toBeTruthy()
      expect(h.nullHypothesis).toContain('no significant')
      expect(h.alternativeHypothesis).toContain('significant')
      expect(h.testable).toBe(true)
      expect(h.falsifiable).toBe(true)
    })
    it('retrieves hypothesis by id', () => {
      const h = sr.formulateHypothesis('Test', [])
      expect(sr.getHypothesis(h.id)).toBe(h)
    })
    it('returns null for unknown hypothesis', () => {
      expect(sr.getHypothesis('unknown')).toBeNull()
    })
    it('marks non-falsifiable when missing variables', () => {
      const h = sr.formulateHypothesis('Vague claim', [])
      expect(h.falsifiable).toBe(false)
    })
  })

  describe('experiment design', () => {
    it('designs an experiment for a hypothesis', () => {
      const h = sr.formulateHypothesis('Effect test', [
        {
          name: 'iv',
          type: 'independent',
          operationalization: 'treatment',
          measurementScale: 'nominal',
        },
        {
          name: 'dv',
          type: 'dependent',
          operationalization: 'outcome',
          measurementScale: 'interval',
        },
      ])
      const exp = sr.designExperiment(h.id, 'experimental', { sampleSize: 100, blinding: 'double' })
      expect(exp).toBeTruthy()
      expect(exp!.controlGroup).toBe(true)
      expect(exp!.randomization).toBe(true)
      expect(exp!.blinding).toBe('double')
      expect(exp!.reproducibilityScore).toBeGreaterThan(0.5)
    })
    it('returns null for unknown hypothesis', () => {
      expect(sr.designExperiment('unknown', 'experimental')).toBeNull()
    })
    it('includes bias detection', () => {
      const h = sr.formulateHypothesis('Test', [
        { name: 'x', type: 'independent', operationalization: 'x', measurementScale: 'nominal' },
        { name: 'y', type: 'dependent', operationalization: 'y', measurementScale: 'ratio' },
      ])
      const exp = sr.designExperiment(h.id, 'experimental', {
        sampleSize: 10,
        blinding: 'none',
        controlGroup: false,
      })
      expect(exp!.biases.length).toBeGreaterThan(0)
    })
    it('has higher reproducibility with better design', () => {
      const h = sr.formulateHypothesis('Test', [
        { name: 'x', type: 'independent', operationalization: 'x', measurementScale: 'nominal' },
        { name: 'y', type: 'dependent', operationalization: 'y', measurementScale: 'ratio' },
      ])
      const bad = sr.designExperiment(h.id, 'experimental', {
        sampleSize: 10,
        blinding: 'none',
        controlGroup: false,
      })
      const good = sr.designExperiment(h.id, 'experimental', {
        sampleSize: 200,
        blinding: 'double',
        controlGroup: true,
      })
      expect(good!.reproducibilityScore).toBeGreaterThan(bad!.reproducibilityScore)
    })
  })

  describe('bias detection', () => {
    it('detects small sample bias', () => {
      const biases = sr.detectBiases('experimental', 5, 'none', true)
      expect(biases.some(b => b.type === 'sampling')).toBe(true)
    })
    it('detects observer bias from no blinding', () => {
      const biases = sr.detectBiases('experimental', 100, 'none', true)
      expect(biases.some(b => b.type === 'observer')).toBe(true)
    })
    it('detects recall bias for surveys', () => {
      const biases = sr.detectBiases('survey', 100, 'single', true)
      expect(biases.some(b => b.type === 'recall')).toBe(true)
    })
    it('detects no control group bias', () => {
      const biases = sr.detectBiases('experimental', 100, 'double', false)
      expect(biases.some(b => b.type === 'selection')).toBe(true)
    })
  })

  describe('statistical test recommendation', () => {
    it('recommends t-test for two continuous groups', () => {
      expect(sr.recommendTest(2, 'continuous')).toBe('t_test')
    })
    it('recommends chi-square for two categorical groups', () => {
      expect(sr.recommendTest(2, 'categorical')).toBe('chi_square')
    })
    it('recommends ANOVA for multiple continuous groups', () => {
      expect(sr.recommendTest(3, 'continuous')).toBe('anova')
    })
    it('recommends fisher exact for small categorical samples', () => {
      expect(sr.recommendTest(2, 'categorical', false, 15)).toBe('fisher_exact')
    })
    it('recommends mann-whitney for ordinal data', () => {
      expect(sr.recommendTest(2, 'ordinal')).toBe('mann_whitney')
    })
    it('recommends wilcoxon for paired ordinal', () => {
      expect(sr.recommendTest(2, 'ordinal', true)).toBe('wilcoxon')
    })
  })

  describe('statistical computation', () => {
    it('computes t-test for two samples', () => {
      const data1 = [5, 6, 7, 8, 9, 10, 11, 12]
      const data2 = [1, 2, 3, 4, 5, 6, 7, 8]
      const result = sr.computeStatistic(data1, data2)
      expect(result.test).toBe('t_test')
      expect(result.pValue).toBeDefined()
      expect(result.effectSize).toBeGreaterThan(0)
      expect(result.sampleSize).toBe(16)
      expect(result.confidenceInterval).toHaveLength(2)
    })
    it('detects significance correctly', () => {
      const high = [100, 110, 120, 130, 140]
      const low = [10, 20, 30, 40, 50]
      const result = sr.computeStatistic(high, low)
      expect(result.significant).toBe(true)
      expect(result.effectInterpretation).toBe('large')
    })
    it('detects non-significance for similar groups', () => {
      const a = [50, 51, 52, 50, 51]
      const b = [50, 51, 52, 50, 51]
      const result = sr.computeStatistic(a, b)
      expect(result.effectSize).toBeLessThan(0.2)
    })
  })

  describe('research summary', () => {
    it('generates a summary', () => {
      const h = sr.formulateHypothesis('Test hypothesis', [
        {
          name: 'x',
          type: 'independent',
          operationalization: 'treatment',
          measurementScale: 'nominal',
        },
        { name: 'y', type: 'dependent', operationalization: 'outcome', measurementScale: 'ratio' },
      ])
      sr.designExperiment(h.id, 'experimental', { sampleSize: 50 })
      sr.computeStatistic([10, 20, 30], [40, 50, 60])
      const summary = sr.generateSummary('My Research')
      expect(summary.title).toBe('My Research')
      expect(summary.hypotheses).toHaveLength(1)
      expect(summary.results.length).toBeGreaterThan(0)
      expect(summary.conclusion).toBeTruthy()
      expect(summary.futureWork.length).toBeGreaterThan(0)
    })
  })

  describe('stats & serialization', () => {
    it('tracks all stats', () => {
      sr.formulateHypothesis('H', [])
      sr.provideFeedback()
      const s = sr.getStats()
      expect(s.totalHypotheses).toBe(1)
      expect(s.feedbackCount).toBe(1)
    })
    it('serializes and deserializes', () => {
      sr.formulateHypothesis('H', [
        { name: 'x', type: 'independent', operationalization: 'x', measurementScale: 'nominal' },
      ])
      const json = sr.serialize()
      const restored = ScientificReasoner.deserialize(json)
      expect(restored.getHypothesis('hyp_1')).toBeTruthy()
    })
  })
})
