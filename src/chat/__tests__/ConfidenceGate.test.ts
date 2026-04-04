/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ConfidenceGate — Tests                                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ConfidenceGate, DEFAULT_GATE_CONFIG } from '../ConfidenceGate.js'
import type { ConfidenceSignal } from '../ConfidenceGate.js'

describe('ConfidenceGate', () => {
  let gate: ConfidenceGate

  beforeEach(() => {
    gate = new ConfidenceGate()
  })

  // ── Constructor ──

  describe('constructor', () => {
    it('creates with default config', () => {
      const config = gate.getConfig()
      expect(config.abstainThreshold).toBe(DEFAULT_GATE_CONFIG.abstainThreshold)
      expect(config.hedgeThreshold).toBe(DEFAULT_GATE_CONFIG.hedgeThreshold)
    })

    it('accepts custom config', () => {
      const custom = new ConfidenceGate({ abstainThreshold: 0.3 })
      expect(custom.getConfig().abstainThreshold).toBe(0.3)
    })
  })

  // ── evaluate ──

  describe('evaluate', () => {
    it('responds when confidence is high', () => {
      const signals: ConfidenceSignal[] = [
        { source: 'knowledge', score: 0.9, weight: 1.0, reason: 'Strong match' },
        { source: 'pattern', score: 0.8, weight: 0.8, reason: 'Good pattern' },
      ]
      const result = gate.evaluate(signals)
      expect(result.decision).toBe('respond')
      expect(result.aggregateConfidence).toBeGreaterThan(0.5)
      expect(result.hedgePrefix).toBeNull()
      expect(result.abstainMessage).toBeNull()
    })

    it('hedges when confidence is moderate', () => {
      const signals: ConfidenceSignal[] = [
        { source: 'knowledge', score: 0.3, weight: 1.0, reason: 'Partial match' },
        { source: 'pattern', score: 0.4, weight: 1.0, reason: 'Weak pattern' },
      ]
      const result = gate.evaluate(signals)
      expect(result.decision).toBe('hedge')
      expect(result.hedgePrefix).toBeTruthy()
      expect(result.abstainMessage).toBeNull()
    })

    it('abstains when confidence is very low', () => {
      const signals: ConfidenceSignal[] = [
        { source: 'knowledge', score: 0.05, weight: 1.0, reason: 'No match' },
        { source: 'pattern', score: 0.1, weight: 1.0, reason: 'Very weak' },
      ]
      const result = gate.evaluate(signals)
      expect(result.decision).toBe('abstain')
      expect(result.abstainMessage).toBeTruthy()
      expect(result.hedgePrefix).toBeNull()
    })

    it('returns empty explanation when no signals', () => {
      const result = gate.evaluate([])
      expect(result.decision).toBe('abstain')
      expect(result.aggregateConfidence).toBe(0)
    })

    it('includes explanation text', () => {
      const signals: ConfidenceSignal[] = [
        { source: 'knowledge', score: 0.7, weight: 1.0, reason: 'Match found' },
      ]
      const result = gate.evaluate(signals)
      expect(result.explanation).toContain('confidence')
    })

    it('increments decision count', () => {
      gate.evaluate([{ source: 'test', score: 0.9, weight: 1.0, reason: '' }])
      gate.evaluate([{ source: 'test', score: 0.1, weight: 1.0, reason: '' }])
      expect(gate.totalDecisions).toBe(2)
    })

    it('weights signals correctly', () => {
      const signals: ConfidenceSignal[] = [
        { source: 'high-weight', score: 0.9, weight: 10.0, reason: 'Important' },
        { source: 'low-weight', score: 0.1, weight: 0.1, reason: 'Minor' },
      ]
      const result = gate.evaluate(signals)
      // High-weight signal should dominate
      expect(result.aggregateConfidence).toBeGreaterThan(0.8)
    })

    it('clamps signal scores to [0, 1]', () => {
      const signals: ConfidenceSignal[] = [
        { source: 'over', score: 5.0, weight: 1.0, reason: 'Over range' },
        { source: 'under', score: -1.0, weight: 1.0, reason: 'Under range' },
      ]
      const result = gate.evaluate(signals)
      expect(result.aggregateConfidence).toBeLessThanOrEqual(1)
      expect(result.aggregateConfidence).toBeGreaterThanOrEqual(0)
    })
  })

  // ── shouldAbstain / shouldHedge ──

  describe('shouldAbstain', () => {
    it('returns true below threshold', () => {
      expect(gate.shouldAbstain(0.1)).toBe(true)
    })

    it('returns false above threshold', () => {
      expect(gate.shouldAbstain(0.5)).toBe(false)
    })
  })

  describe('shouldHedge', () => {
    it('returns true in hedge range', () => {
      expect(gate.shouldHedge(0.3)).toBe(true)
    })

    it('returns false above hedge threshold', () => {
      expect(gate.shouldHedge(0.8)).toBe(false)
    })

    it('returns false below abstain threshold', () => {
      expect(gate.shouldHedge(0.1)).toBe(false)
    })
  })

  // ── Calibration ──

  describe('calibration', () => {
    it('records outcomes', () => {
      gate.recordOutcome(0.8, true, 'respond')
      gate.recordOutcome(0.3, false, 'hedge')
      const stats = gate.getCalibrationStats()
      expect(stats.totalDecisions).toBe(2)
      expect(stats.respondCount).toBe(1)
      expect(stats.hedgeCount).toBe(1)
    })

    it('computes calibration error', () => {
      for (let i = 0; i < 20; i++) {
        gate.recordOutcome(0.9, true, 'respond')
      }
      const stats = gate.getCalibrationStats()
      // Predicted 0.9, actual 1.0 → error ≈ 0.1
      expect(stats.calibrationError).toBeCloseTo(0.1, 1)
    })

    it('computes accuracy when responding', () => {
      gate.recordOutcome(0.8, true, 'respond')
      gate.recordOutcome(0.7, true, 'respond')
      gate.recordOutcome(0.6, false, 'respond')
      const stats = gate.getCalibrationStats()
      expect(stats.accuracyWhenResponding).toBeCloseTo(2 / 3, 2)
    })

    it('computes abstain rate', () => {
      gate.recordOutcome(0.1, false, 'abstain')
      gate.recordOutcome(0.8, true, 'respond')
      const stats = gate.getCalibrationStats()
      expect(stats.abstainRate).toBe(0.5)
    })

    it('evicts old records when over capacity', () => {
      const smallGate = new ConfidenceGate({ maxCalibrationRecords: 5 })
      for (let i = 0; i < 10; i++) {
        smallGate.recordOutcome(0.5, true, 'respond')
      }
      const stats = smallGate.getCalibrationStats()
      expect(stats.totalDecisions).toBe(5)
    })

    it('returns zero stats when empty', () => {
      const stats = gate.getCalibrationStats()
      expect(stats.totalDecisions).toBe(0)
      expect(stats.calibrationError).toBe(0)
      expect(stats.accuracyWhenResponding).toBe(0)
    })

    it('does not record when calibration disabled', () => {
      const noCalib = new ConfidenceGate({ enableCalibration: false })
      noCalib.recordOutcome(0.8, true, 'respond')
      expect(noCalib.getCalibrationStats().totalDecisions).toBe(0)
    })
  })

  // ── Serialization ──

  describe('serialization', () => {
    it('serializes and deserializes', () => {
      gate.recordOutcome(0.8, true, 'respond')
      gate.recordOutcome(0.3, false, 'abstain')
      gate.evaluate([{ source: 'test', score: 0.5, weight: 1.0, reason: '' }])

      const data = gate.serialize()
      expect(data.records).toHaveLength(2)
      expect(data.decisionCount).toBe(1)

      const restored = new ConfidenceGate()
      restored.deserialize(data)
      expect(restored.getCalibrationStats().totalDecisions).toBe(2)
    })
  })

  // ── Clear ──

  describe('clear', () => {
    it('resets all state', () => {
      gate.evaluate([{ source: 'test', score: 0.5, weight: 1.0, reason: '' }])
      gate.recordOutcome(0.5, true, 'respond')
      gate.clear()
      expect(gate.totalDecisions).toBe(0)
      expect(gate.getCalibrationStats().totalDecisions).toBe(0)
    })
  })
})
