import { describe, it, expect, beforeEach } from 'vitest'
import { AnomalyDetector } from '../AnomalyDetector.js'

describe('AnomalyDetector', () => {
  let detector: AnomalyDetector

  beforeEach(() => {
    detector = new AnomalyDetector()
  })

  describe('Statistical Anomaly Detection (Z-score)', () => {
    it('should detect statistical outlier', () => {
      const dataset = [10, 12, 11, 13, 10, 12, 11, 10, 12, 11]
      const result = detector.detectStatisticalAnomaly(50, dataset)
      expect(result.isAnomaly).toBe(true)
      expect(result.type).toBe('statistical_outlier')
      expect(result.score).toBeGreaterThan(0.5)
    })

    it('should detect normal value', () => {
      const dataset = [10, 12, 11, 13, 10, 12, 11, 10, 12, 11]
      const result = detector.detectStatisticalAnomaly(11, dataset)
      expect(result.isAnomaly).toBe(false)
      expect(result.type).toBe('none')
    })

    it('should handle insufficient data', () => {
      const result = detector.detectStatisticalAnomaly(5, [1, 2])
      expect(result.isAnomaly).toBe(false)
      expect(result.description).toContain('Insufficient')
    })

    it('should handle constant dataset', () => {
      const result = detector.detectStatisticalAnomaly(7, [5, 5, 5, 5])
      expect(result.isAnomaly).toBe(true)
    })

    it('should have confidence increasing with dataset size', () => {
      const small = detector.detectStatisticalAnomaly(50, [10, 12, 11])
      const large = detector.detectStatisticalAnomaly(50, Array(100).fill(11))
      expect(large.confidence).toBeGreaterThan(small.confidence)
    })
  })

  describe('IQR Anomaly Detection', () => {
    it('should detect IQR outlier', () => {
      const dataset = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = detector.detectIQRAnomaly(100, dataset)
      expect(result.isAnomaly).toBe(true)
    })

    it('should not flag normal value', () => {
      const dataset = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = detector.detectIQRAnomaly(5, dataset)
      expect(result.isAnomaly).toBe(false)
    })

    it('should handle insufficient data', () => {
      const result = detector.detectIQRAnomaly(5, [1, 2, 3])
      expect(result.description).toContain('Insufficient')
    })
  })

  describe('Query Anomaly Detection', () => {
    it('should build baseline from normal queries', () => {
      for (let i = 0; i < 10; i++) {
        detector.detectQueryAnomaly('What is machine learning?')
      }
      const result = detector.detectQueryAnomaly('What is deep learning?')
      expect(result.type).toBe('none')
    })

    it('should detect injection patterns', () => {
      for (let i = 0; i < 10; i++) {
        detector.detectQueryAnomaly('Normal question about coding')
      }
      const result = detector.detectQueryAnomaly("'; DROP TABLE users; --")
      expect(result.score).toBeGreaterThan(0)
    })

    it('should detect excessive repetition', () => {
      for (let i = 0; i < 10; i++) {
        detector.detectQueryAnomaly('Normal question about technology')
      }
      const result = detector.detectQueryAnomaly('spam spam spam spam spam spam spam spam spam spam spam')
      expect(result.score).toBeGreaterThan(0)
    })
  })

  describe('Code Anomaly Detection', () => {
    it('should detect hardcoded credentials', () => {
      const code = 'const password = "super_secret_123"'
      const result = detector.detectCodeAnomaly(code)
      expect(result.isAnomaly).toBe(true)
      expect(result.description).toContain('credential')
    })

    it('should detect eval usage', () => {
      const code = 'const result = eval("1 + 2")'
      const result = detector.detectCodeAnomaly(code)
      expect(result.score).toBeGreaterThan(0)
    })

    it('should accept clean code', () => {
      const code = 'function add(a, b) {\n  return a + b\n}'
      const result = detector.detectCodeAnomaly(code)
      expect(result.isAnomaly).toBe(false)
    })

    it('should detect deep nesting', () => {
      const code = 'if(a){if(b){if(c){if(d){if(e){if(f){if(g){return true}}}}}}}'
      const result = detector.detectCodeAnomaly(code)
      expect(result.description).toContain('nesting')
    })
  })

  describe('Trend Break Detection', () => {
    it('should detect sudden trend change', () => {
      const series = [10, 10, 10, 10, 10, 50, 50, 50, 50, 50]
      const result = detector.detectTrendBreak(series, 5)
      expect(result.isAnomaly).toBe(true)
      expect(result.type).toBe('trend_break')
    })

    it('should not flag stable trend', () => {
      const series = [10, 11, 10, 11, 10, 10, 11, 10, 11, 10]
      const result = detector.detectTrendBreak(series, 5)
      expect(result.isAnomaly).toBe(false)
    })

    it('should handle insufficient data', () => {
      const result = detector.detectTrendBreak([1, 2, 3], 5)
      expect(result.description).toContain('Insufficient')
    })
  })

  describe('Data Quality Detection', () => {
    it('should detect null values', () => {
      const data = [1, null, 3, undefined, 5]
      const result = detector.detectDataQualityIssues(data)
      expect(result.isAnomaly).toBe(true)
      expect(result.description).toContain('null')
    })

    it('should detect high duplicate ratio', () => {
      const data = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2]
      const result = detector.detectDataQualityIssues(data)
      expect(result.score).toBeGreaterThan(0)
    })

    it('should handle empty dataset', () => {
      const result = detector.detectDataQualityIssues([])
      expect(result.isAnomaly).toBe(true)
      expect(result.description).toContain('Empty')
    })

    it('should detect mixed types', () => {
      const data = [1, 'two', true, null]
      const result = detector.detectDataQualityIssues(data)
      expect(result.score).toBeGreaterThan(0)
    })
  })

  describe('Behavioral Anomaly Detection', () => {
    it('should detect deviation from normal patterns', () => {
      const normalPatterns = [['login', 'browse', 'purchase', 'logout']]
      const abnormalActions = ['login', 'admin_panel', 'delete_users', 'logout']
      const result = detector.detectBehavioralAnomaly(abnormalActions, normalPatterns)
      expect(result.score).toBeGreaterThan(0)
    })

    it('should recognize normal behavior', () => {
      const normalPatterns = [['login', 'browse', 'purchase', 'logout']]
      const actions = ['login', 'browse', 'purchase', 'logout']
      const result = detector.detectBehavioralAnomaly(actions, normalPatterns)
      expect(result.isAnomaly).toBe(false)
    })

    it('should handle empty inputs', () => {
      const result = detector.detectBehavioralAnomaly([], [])
      expect(result.isAnomaly).toBe(false)
    })
  })

  describe('History Management', () => {
    it('should track data points', () => {
      detector.addDataPoint({ value: 1 })
      detector.addDataPoint({ value: 2 })
      expect(detector.getHistorySize()).toBe(2)
    })

    it('should reset state', () => {
      detector.addDataPoint({ value: 1 })
      detector.reset()
      expect(detector.getHistorySize()).toBe(0)
    })
  })
})
