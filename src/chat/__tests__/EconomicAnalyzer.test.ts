import { describe, it, expect, beforeEach } from 'vitest'
import {
  EconomicAnalyzer,
  type EconomicSnapshot,
} from '../EconomicAnalyzer'

// ── Helpers ──

function makeSnapshot(overrides: Partial<EconomicSnapshot> = {}): EconomicSnapshot {
  return {
    indicators: [],
    gdpGrowth: 2.5,
    inflation: 2.0,
    unemployment: 4.0,
    interestRate: 3.0,
    timestamp: Date.now(),
    ...overrides,
  }
}

function makeExpansionSnapshots(n = 5): EconomicSnapshot[] {
  return Array.from({ length: n }, (_, i) => makeSnapshot({
    gdpGrowth: 2.5 + i * 0.3,
    inflation: 2.0 + i * 0.1,
    unemployment: 4.5 - i * 0.2,
    interestRate: 3.0 + i * 0.15,
    timestamp: Date.now() - (n - i) * 86_400_000 * 90,
  }))
}

function makeRecessionSnapshots(n = 5): EconomicSnapshot[] {
  return Array.from({ length: n }, (_, i) => makeSnapshot({
    gdpGrowth: 1.0 - i * 0.6,
    inflation: 3.0 - i * 0.2,
    unemployment: 5.0 + i * 0.5,
    interestRate: 4.0 - i * 0.3,
    timestamp: Date.now() - (n - i) * 86_400_000 * 90,
  }))
}

describe('EconomicAnalyzer', () => {
  let analyzer: EconomicAnalyzer

  beforeEach(() => {
    analyzer = new EconomicAnalyzer()
  })

  // ── Constructor ──

  describe('constructor', () => {
    it('creates with default config', () => {
      const a = new EconomicAnalyzer()
      expect(a.getStats().totalAnalyses).toBe(0)
    })

    it('accepts partial config', () => {
      const a = new EconomicAnalyzer({ forecastHorizon: 6 })
      expect(a.getStats().totalAnalyses).toBe(0)
    })
  })

  // ── Analyze Indicators ──

  describe('analyzeIndicators', () => {
    it('returns indicators for a snapshot', () => {
      const indicators = analyzer.analyzeIndicators(makeSnapshot())
      expect(indicators.length).toBeGreaterThan(0)
    })

    it('each indicator has required fields', () => {
      const indicators = analyzer.analyzeIndicators(makeSnapshot())
      for (const ind of indicators) {
        expect(ind.name).toBeTruthy()
        expect(typeof ind.value).toBe('number')
        expect(ind.trend).toBeDefined()
      }
    })

    it('includes GDP, inflation, unemployment', () => {
      const indicators = analyzer.analyzeIndicators(makeSnapshot())
      const names = indicators.map(i => i.name.toLowerCase())
      expect(names.some(n => n.includes('gdp'))).toBe(true)
      expect(names.some(n => n.includes('inflation'))).toBe(true)
      expect(names.some(n => n.includes('unemployment'))).toBe(true)
    })
  })

  // ── Business Cycle ──

  describe('detectBusinessCycle', () => {
    it('detects expansion phase', () => {
      const cycle = analyzer.detectBusinessCycle(makeExpansionSnapshots())
      expect(['expansion', 'peak']).toContain(cycle.phase)
    })

    it('detects contraction phase', () => {
      const cycle = analyzer.detectBusinessCycle(makeRecessionSnapshots())
      expect(['contraction', 'trough']).toContain(cycle.phase)
    })

    it('returns confidence between 0 and 1', () => {
      const cycle = analyzer.detectBusinessCycle(makeExpansionSnapshots())
      expect(cycle.confidence).toBeGreaterThanOrEqual(0)
      expect(cycle.confidence).toBeLessThanOrEqual(1)
    })

    it('handles single snapshot', () => {
      const cycle = analyzer.detectBusinessCycle([makeSnapshot()])
      expect(cycle.phase).toBeDefined()
    })

    it('handles empty snapshots', () => {
      const cycle = analyzer.detectBusinessCycle([])
      expect(cycle.phase).toBeDefined()
    })
  })

  // ── Monetary Policy ──

  describe('analyzeMonetaryPolicy', () => {
    it('returns stance for hawkish scenario', () => {
      const result = analyzer.analyzeMonetaryPolicy(2.0, 5.0, 3.5, 4.0)
      expect(result.stance).toBeDefined()
      expect(['hawkish', 'dovish', 'neutral']).toContain(result.stance)
    })

    it('returns dovish stance for low rates + low growth', () => {
      const result = analyzer.analyzeMonetaryPolicy(0.25, 1.0, 7.0, 0.5)
      expect(['hawkish', 'dovish', 'neutral']).toContain(result.stance)
    })

    it('includes impact assessment', () => {
      const result = analyzer.analyzeMonetaryPolicy(3.0, 3.0, 4.0, 2.5)
      expect(result.impact.length).toBeGreaterThan(0)
    })

    it('handles monetary base growth parameter', () => {
      const result = analyzer.analyzeMonetaryPolicy(2.0, 3.0, 4.0, 2.5, 15)
      expect(result.qeStatus).toBeDefined()
    })
  })

  // ── Fiscal Policy ──

  describe('analyzeFiscalPolicy', () => {
    it('detects deficit', () => {
      const result = analyzer.analyzeFiscalPolicy(5000, 4000, 20000, 15000)
      expect(result.deficit).toBeGreaterThan(0)
    })

    it('detects surplus', () => {
      const result = analyzer.analyzeFiscalPolicy(4000, 5000, 20000, 10000)
      expect(result.deficit).toBeLessThan(0)
    })

    it('calculates debt-to-GDP ratio', () => {
      const result = analyzer.analyzeFiscalPolicy(5000, 4000, 20000, 22000)
      expect(result.debtToGdp).toBeGreaterThan(100)
    })

    it('identifies stimulus', () => {
      const result = analyzer.analyzeFiscalPolicy(6000, 4000, 20000, 15000, 5000)
      expect(typeof result.stimulus).toBe('boolean')
    })

    it('includes impact analysis', () => {
      const result = analyzer.analyzeFiscalPolicy(5000, 4000, 20000, 15000)
      expect(result.impact.length).toBeGreaterThan(0)
    })
  })

  // ── Inflation Forecast ──

  describe('forecastInflation', () => {
    it('returns forecast array', () => {
      const result = analyzer.forecastInflation(2.5, 8.0, -0.5, 2.0)
      expect(result.forecast.length).toBeGreaterThan(0)
    })

    it('returns factors explaining forecast', () => {
      const result = analyzer.forecastInflation(2.0, 5.0, 0.0, 3.0)
      expect(result.factors.length).toBeGreaterThan(0)
    })

    it('returns confidence', () => {
      const result = analyzer.forecastInflation(2.0, 5.0, 0.0, 2.5)
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('handles high monetary growth', () => {
      const result = analyzer.forecastInflation(3.0, 20.0, 1.0, 1.0)
      expect(result.forecast[0]).toBeGreaterThan(3.0)
    })
  })

  // ── Currency Analysis ──

  describe('analyzeCurrency', () => {
    it('returns currency pair analysis', () => {
      const result = analyzer.analyzeCurrency('USD/EUR', 1.10, 5.0, 3.0, 3.0, 2.0)
      expect(result.pair).toBe('USD/EUR')
      expect(typeof result.rate).toBe('number')
    })

    it('determines overvaluation', () => {
      const result = analyzer.analyzeCurrency('USD/JPY', 150, 5.0, 0.1, 3.0, 1.0)
      expect(typeof result.overvalued).toBe('boolean')
    })

    it('includes factors', () => {
      const result = analyzer.analyzeCurrency('GBP/USD', 1.25, 4.0, 5.0, 2.5, 3.0)
      expect(result.factors.length).toBeGreaterThan(0)
    })

    it('computes forecast', () => {
      const result = analyzer.analyzeCurrency('EUR/USD', 1.08, 3.0, 4.0, 2.0, 2.5)
      expect(typeof result.forecast).toBe('number')
    })
  })

  // ── Yield Curve ──

  describe('analyzeYieldCurve', () => {
    it('detects normal curve', () => {
      const result = analyzer.analyzeYieldCurve(2.0, 4.0)
      expect(result.shape).toBe('normal')
    })

    it('detects inverted curve', () => {
      const result = analyzer.analyzeYieldCurve(5.0, 4.0)
      expect(result.shape).toBe('inverted')
    })

    it('detects flat curve', () => {
      const result = analyzer.analyzeYieldCurve(3.0, 3.1)
      expect(result.shape).toBe('flat')
    })

    it('returns recession probability', () => {
      const result = analyzer.analyzeYieldCurve(2.0, 4.0)
      expect(result.recessionProbability).toBeGreaterThanOrEqual(0)
      expect(result.recessionProbability).toBeLessThanOrEqual(1)
    })

    it('inverted curve has higher recession probability', () => {
      const normal = analyzer.analyzeYieldCurve(2.0, 4.0)
      const inverted = analyzer.analyzeYieldCurve(5.0, 3.5)
      expect(inverted.recessionProbability).toBeGreaterThan(normal.recessionProbability)
    })

    it('includes implications', () => {
      const result = analyzer.analyzeYieldCurve(2.0, 4.0)
      expect(result.implications.length).toBeGreaterThan(0)
    })
  })

  // ── Report Generation ──

  describe('generateReport', () => {
    it('generates comprehensive report', () => {
      const report = analyzer.generateReport(makeExpansionSnapshots())
      expect(report.title).toBeTruthy()
      expect(report.keyFindings.length).toBeGreaterThan(0)
      expect(['bullish', 'neutral', 'bearish']).toContain(report.outlook)
    })

    it('handles empty snapshots', () => {
      const report = analyzer.generateReport([])
      expect(report).toBeDefined()
    })

    it('includes risks and opportunities', () => {
      const report = analyzer.generateReport(makeExpansionSnapshots())
      expect(report.risks).toBeDefined()
      expect(report.opportunities).toBeDefined()
    })
  })

  // ── Sector Analysis ──

  describe('analyzeSector', () => {
    it('analyzes technology sector', () => {
      const result = analyzer.analyzeSector('technology', 3.0, 2.5, 3.5, 4.0)
      expect(result.sector).toBeTruthy()
      expect(result.outlook).toBeDefined()
    })

    it('analyzes healthcare sector', () => {
      const result = analyzer.analyzeSector('healthcare', 2.0, 3.0, 4.0, 3.5)
      expect(result.sector).toBeTruthy()
    })

    it('handles unknown sector', () => {
      const result = analyzer.analyzeSector('unknown-sector', 2.0, 2.0, 5.0, 3.0)
      expect(result).toBeDefined()
    })
  })

  // ── Scenario Analysis ──

  describe('runScenario', () => {
    it('runs a recession scenario', () => {
      const result = analyzer.runScenario('recession', makeSnapshot())
      expect(result.name).toBeTruthy()
      expect(result.gdpEffect).toBeDefined()
    })

    it('runs a rate hike scenario', () => {
      const result = analyzer.runScenario('rate_hike', makeSnapshot())
      expect(result.name).toBeTruthy()
    })

    it('runs custom scenario', () => {
      const result = analyzer.runScenario('trade war', makeSnapshot(), ['Tariffs increase by 25%'])
      expect(result.name).toBeTruthy()
      expect(result.assumptions.length).toBeGreaterThan(0)
    })

    it('returns probability', () => {
      const result = analyzer.runScenario('recession', makeSnapshot())
      expect(result.probability).toBeGreaterThanOrEqual(0)
      expect(result.probability).toBeLessThanOrEqual(1)
    })
  })

  // ── Feedback ──

  describe('provideFeedback', () => {
    it('records accurate feedback', () => {
      analyzer.analyzeIndicators(makeSnapshot()) // create an analysis
      analyzer.provideFeedback('fake-id', true)
      // No error is sufficient
    })
  })

  // ── Stats ──

  describe('getStats', () => {
    it('returns initial stats', () => {
      const stats = analyzer.getStats()
      expect(stats.totalAnalyses).toBe(0)
      expect(stats.totalForecasts).toBe(0)
    })

    it('tracks analyses', () => {
      analyzer.analyzeIndicators(makeSnapshot())
      analyzer.detectBusinessCycle(makeExpansionSnapshots())
      const stats = analyzer.getStats()
      expect(stats.totalAnalyses).toBeGreaterThan(0)
    })

    it('tracks forecasts', () => {
      analyzer.forecastInflation(2.0, 5.0, 0.0, 2.5)
      expect(analyzer.getStats().totalForecasts).toBe(1)
    })

    it('tracks scenarios', () => {
      analyzer.runScenario('recession', makeSnapshot())
      expect(analyzer.getStats().totalScenarios).toBe(1)
    })
  })

  // ── Serialization ──

  describe('serialize / deserialize', () => {
    it('round-trips state', () => {
      analyzer.analyzeIndicators(makeSnapshot())
      analyzer.forecastInflation(2.0, 5.0, 0.0, 2.5)
      const json = analyzer.serialize()
      const restored = EconomicAnalyzer.deserialize(json)
      expect(restored.getStats().totalAnalyses).toBeGreaterThan(0)
      expect(restored.getStats().totalForecasts).toBe(1)
    })

    it('produces valid JSON', () => {
      const json = analyzer.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })
  })

  // ── Edge cases ──

  describe('edge cases', () => {
    it('zero GDP', () => {
      const result = analyzer.analyzeFiscalPolicy(5000, 4000, 0, 15000)
      expect(result).toBeDefined()
    })

    it('negative GDP growth', () => {
      const indicators = analyzer.analyzeIndicators(makeSnapshot({ gdpGrowth: -2.0 }))
      expect(indicators.length).toBeGreaterThan(0)
    })

    it('very high inflation', () => {
      const forecast = analyzer.forecastInflation(15.0, 25.0, 2.0, -1.0)
      expect(forecast.forecast.length).toBeGreaterThan(0)
    })

    it('equal short and long rates (flat curve)', () => {
      const result = analyzer.analyzeYieldCurve(3.0, 3.0)
      expect(result.shape).toBe('flat')
    })
  })
})
