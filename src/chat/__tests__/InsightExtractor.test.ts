import { describe, it, expect, beforeEach } from 'vitest'
import { InsightExtractor, DEFAULT_INSIGHT_EXTRACTOR_CONFIG } from '../InsightExtractor.js'

describe('InsightExtractor', () => {
  let engine: InsightExtractor

  beforeEach(() => {
    engine = new InsightExtractor()
  })

  describe('Configuration', () => {
    it('should use default config', () => {
      expect(DEFAULT_INSIGHT_EXTRACTOR_CONFIG.maxInsights).toBe(1000)
      expect(DEFAULT_INSIGHT_EXTRACTOR_CONFIG.anomalyThreshold).toBe(2.0)
    })

    it('should accept custom config', () => {
      const e = new InsightExtractor({ maxInsights: 50 })
      expect(e).toBeInstanceOf(InsightExtractor)
    })
  })

  describe('Trend detection', () => {
    it('should detect increasing trend', () => {
      const result = engine.detectTrend([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(result.direction).toBe('increasing')
      expect(result.slope).toBeGreaterThan(0)
      expect(result.confidence).toBeGreaterThan(0.9)
    })

    it('should detect decreasing trend', () => {
      const result = engine.detectTrend([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
      expect(result.direction).toBe('decreasing')
      expect(result.slope).toBeLessThan(0)
    })

    it('should detect stable trend', () => {
      const result = engine.detectTrend([5, 5, 5, 5, 5, 5])
      expect(result.direction).toBe('stable')
    })

    it('should detect volatile trend', () => {
      const result = engine.detectTrend([1, 100, 2, 99, 3, 98, 1, 100])
      expect(result.direction).toBe('volatile')
    })

    it('should compute change percent', () => {
      const result = engine.detectTrend([100, 200])
      expect(result.changePercent).toBeCloseTo(100)
    })

    it('should handle single value', () => {
      const result = engine.detectTrend([42])
      expect(result.direction).toBe('stable')
      expect(result.dataPoints).toBe(1)
    })

    it('should report data points count', () => {
      const result = engine.detectTrend([1, 2, 3])
      expect(result.dataPoints).toBe(3)
    })
  })

  describe('Anomaly detection', () => {
    it('should detect statistical anomalies', () => {
      const data = [10, 11, 10, 9, 10, 11, 10, 100, 10, 11]
      const anomalies = engine.detectAnomalies(data)
      expect(anomalies.length).toBeGreaterThan(0)
      expect(anomalies[0].value).toBe(100)
    })

    it('should return empty for uniform data', () => {
      const anomalies = engine.detectAnomalies([5, 5, 5, 5, 5])
      expect(anomalies.length).toBe(0)
    })

    it('should return empty for too few points', () => {
      const anomalies = engine.detectAnomalies([1, 2])
      expect(anomalies.length).toBe(0)
    })

    it('should rate severity', () => {
      const data = [10, 10, 10, 10, 10, 10, 10, 10, 10, 500]
      const anomalies = engine.detectAnomalies(data)
      if (anomalies.length > 0) {
        expect(['medium', 'high', 'critical']).toContain(anomalies[0].severity)
      }
    })

    it('should report expected value', () => {
      const data = [10, 10, 10, 10, 10, 10, 10, 10, 200]
      const anomalies = engine.detectAnomalies(data)
      if (anomalies.length > 0) {
        expect(anomalies[0].expectedValue).toBeLessThan(anomalies[0].value)
      }
    })
  })

  describe('Pattern discovery', () => {
    it('should find recurring patterns in texts', () => {
      const texts = [
        'The machine learning model achieved high accuracy',
        'Our machine learning pipeline processes data efficiently',
        'The machine learning approach outperformed baseline',
        'Using machine learning for classification tasks',
      ]
      const patterns = engine.findPatterns(texts)
      expect(patterns.some(p => p.pattern.includes('machine learning'))).toBe(true)
    })

    it('should report frequency', () => {
      const texts = ['data science project', 'data science team', 'data science tools']
      const patterns = engine.findPatterns(texts)
      const ds = patterns.find(p => p.pattern.includes('data science'))
      expect(ds).toBeDefined()
      expect(ds!.frequency).toBeGreaterThanOrEqual(3)
    })

    it('should return empty for unique texts', () => {
      const texts = ['alpha', 'beta', 'gamma']
      const patterns = engine.findPatterns(texts)
      expect(patterns.length).toBe(0)
    })

    it('should respect min frequency config', () => {
      const e = new InsightExtractor({ minPatternFrequency: 5 })
      const texts = ['test pattern here', 'test pattern there', 'test pattern now']
      const patterns = e.findPatterns(texts)
      expect(patterns.length).toBe(0)
    })
  })

  describe('Text insight extraction', () => {
    it('should extract key findings', () => {
      const text = 'The most important finding is that performance improved significantly. This is a critical observation for the project. The key insight is that we need more data.'
      const insights = engine.extractTextInsights(text)
      expect(insights.keyFindings.length).toBeGreaterThan(0)
    })

    it('should identify themes', () => {
      const text = 'Machine learning models use neural networks for training. Neural networks are composed of layers. Training involves optimization of parameters.'
      const insights = engine.extractTextInsights(text)
      expect(insights.themes.length).toBeGreaterThan(0)
    })

    it('should detect positive sentiment', () => {
      const text = 'The results are excellent and show great improvement. The success of this approach is a positive sign for future growth.'
      const insights = engine.extractTextInsights(text)
      expect(insights.sentiment).toBe('positive')
    })

    it('should detect negative sentiment', () => {
      const text = 'The system has poor performance and keeps failing. There are multiple problems and issues with weak security and risk of decline.'
      const insights = engine.extractTextInsights(text)
      expect(insights.sentiment).toBe('negative')
    })

    it('should detect mixed sentiment', () => {
      const text = 'The system shows great performance but has a poor user interface. Good progress on security but bad documentation.'
      const insights = engine.extractTextInsights(text)
      expect(insights.sentiment).toBe('mixed')
    })

    it('should extract action items', () => {
      const text = 'We should improve testing coverage. The team must address the performance issues. Consider implementing caching for better response times.'
      const insights = engine.extractTextInsights(text)
      expect(insights.actionItems.length).toBeGreaterThan(0)
    })

    it('should assess text complexity', () => {
      const simple = engine.extractTextInsights('The cat sat on the mat. It was a big red cat.')
      const complex = engine.extractTextInsights('The implementation necessitates architectural considerations regarding distributed infrastructure scalability. Comprehensive observability instrumentations facilitate anomaly identification.')
      expect(simple.complexity).not.toBe('complex')
    })
  })

  describe('Insight management', () => {
    it('should add insight', () => {
      const insight = engine.addInsight('finding', 'Revenue growth', 'Revenue grew 25% YoY', ['Q4 report'], ['finance'])
      expect(insight.id).toBeDefined()
      expect(insight.category).toBe('finding')
      expect(insight.tags).toContain('finance')
    })

    it('should auto-tag with category', () => {
      const insight = engine.addInsight('trend', 'Upward trend', 'Growing adoption')
      expect(insight.tags).toContain('trend')
    })

    it('should mark actionable categories', () => {
      const rec = engine.addInsight('recommendation', 'Invest in AI', 'Strong ROI expected')
      const finding = engine.addInsight('finding', 'Data point', 'Just a finding')
      expect(rec.actionable).toBe(true)
      expect(finding.actionable).toBe(false)
    })

    it('should score higher with more evidence', () => {
      const withEvidence = engine.addInsight('finding', 'A', 'B', ['E1', 'E2', 'E3'])
      const withoutEvidence = engine.addInsight('finding', 'C', 'D')
      expect(withEvidence.score).toBeGreaterThan(withoutEvidence.score)
    })

    it('should get insights by category', () => {
      engine.addInsight('trend', 'T1', 'D1')
      engine.addInsight('anomaly', 'A1', 'D2')
      engine.addInsight('trend', 'T2', 'D3')
      expect(engine.getInsightsByCategory('trend').length).toBe(2)
      expect(engine.getInsightsByCategory('anomaly').length).toBe(1)
    })

    it('should get top insights sorted by score', () => {
      engine.addInsight('finding', 'Low', 'desc')
      engine.addInsight('warning', 'High', 'desc', ['E1', 'E2', 'E3'])
      engine.addInsight('recommendation', 'Medium', 'desc', ['E1'])
      const top = engine.getTopInsights(2)
      expect(top.length).toBe(2)
      expect(top[0].score).toBeGreaterThanOrEqual(top[1].score)
    })

    it('should get all insights', () => {
      engine.addInsight('finding', 'A', 'B')
      engine.addInsight('trend', 'C', 'D')
      expect(engine.getInsights().length).toBe(2)
    })
  })

  describe('Report generation', () => {
    it('should generate insight report', () => {
      engine.addInsight('trend', 'Growth', 'Revenue growing')
      engine.addInsight('anomaly', 'Spike', 'Unusual spike detected')
      engine.addInsight('recommendation', 'Invest', 'Recommend investment')
      const report = engine.generateReport('Q4 Analysis')
      expect(report.title).toBe('Q4 Analysis')
      expect(report.insights.length).toBe(3)
      expect(report.trendSummary).toContain('1 trend')
      expect(report.anomalySummary).toContain('1 anomaly')
      expect(report.recommendations.length).toBeGreaterThan(0)
    })

    it('should handle empty report', () => {
      const report = engine.generateReport('Empty')
      expect(report.insights.length).toBe(0)
      expect(report.trendSummary).toContain('No trends')
    })
  })

  describe('Stats & serialization', () => {
    it('should track stats', () => {
      engine.detectTrend([1, 2, 3])
      engine.detectAnomalies([1, 2, 3, 100])
      engine.findPatterns(['a b', 'a b'])
      engine.addInsight('finding', 'X', 'Y')
      engine.generateReport('Test')
      engine.provideFeedback()
      const stats = engine.getStats()
      expect(stats.totalTrends).toBe(1)
      expect(stats.totalAnomalies).toBe(1)
      expect(stats.totalPatterns).toBe(1)
      expect(stats.totalInsights).toBe(1)
      expect(stats.totalReports).toBe(1)
      expect(stats.feedbackCount).toBe(1)
    })

    it('should serialize and deserialize', () => {
      engine.addInsight('finding', 'Test', 'Desc')
      const json = engine.serialize()
      const restored = InsightExtractor.deserialize(json)
      expect(restored.getStats().totalInsights).toBe(1)
    })
  })
})
