import { describe, it, expect, beforeEach } from 'vitest'
import { MarketAnalyzer } from '../MarketAnalyzer'

// ── Helpers: reusable data generators ──

function makeUptrend(length = 30): number[] {
  return Array.from({ length }, (_, i) => 100 + i * 2 + Math.sin(i) * 0.5)
}

function makeDowntrend(length = 30): number[] {
  return Array.from({ length }, (_, i) => 200 - i * 2 + Math.sin(i) * 0.5)
}

function makeSideways(length = 30): number[] {
  return Array.from({ length }, (_, i) => 100 + Math.sin(i * 0.3) * 0.5)
}

function makeVolatilePrices(length = 60): number[] {
  return Array.from({ length }, (_, i) => 100 + Math.sin(i * 0.5) * 30 + (i % 3 === 0 ? 15 : -10))
}

function makeCorrelatedAssets(): Record<string, number[]> {
  const base = Array.from({ length: 30 }, (_, i) => 100 + i + Math.sin(i) * 2)
  return {
    SPY: base,
    QQQ: base.map(v => v * 1.1 + 5),
    GOLD: base.map(v => 300 - v * 0.5),
  }
}

// ── Constructor Tests ──

describe('MarketAnalyzer constructor', () => {
  it('creates an instance with default config', () => {
    const analyzer = new MarketAnalyzer()
    expect(analyzer).toBeInstanceOf(MarketAnalyzer)
  })

  it('accepts a partial custom config', () => {
    const analyzer = new MarketAnalyzer({ sentimentThreshold: 0.3 })
    expect(analyzer).toBeInstanceOf(MarketAnalyzer)
  })

  it('accepts a full custom config', () => {
    const analyzer = new MarketAnalyzer({
      sentimentThreshold: 0.2,
      anomalyStdDevs: 3.0,
      correlationWindow: 30,
      minDataPoints: 10,
      trendSmoothingPeriod: 7,
      volatilityWindow: 20,
      momentumPeriod: 14,
      breadthThreshold: 0.5,
      enableLearning: false,
    })
    expect(analyzer).toBeInstanceOf(MarketAnalyzer)
  })

  it('starts with zero stats', () => {
    const analyzer = new MarketAnalyzer()
    const stats = analyzer.getStats()
    expect(stats.totalSentimentAnalyses).toBe(0)
    expect(stats.totalTrendDetections).toBe(0)
    expect(stats.totalAnomaliesFound).toBe(0)
    expect(stats.totalCorrelationsComputed).toBe(0)
    expect(stats.totalVolatilityAnalyses).toBe(0)
    expect(stats.totalNewsAssessed).toBe(0)
    expect(stats.totalSummariesGenerated).toBe(0)
    expect(stats.feedbackReceived).toBe(0)
    expect(stats.feedbackAccuracy).toBe(0)
  })
})

// ── analyzeSentiment Tests ──

describe('MarketAnalyzer analyzeSentiment', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('detects bullish sentiment from positive keywords', () => {
    const result = analyzer.analyzeSentiment(
      'The market is showing a strong rally with bullish momentum and surge in buying',
    )
    expect(result.sentiment).toBe('bullish')
    expect(result.score).toBeGreaterThan(0)
  })

  it('detects bearish sentiment from negative keywords', () => {
    const result = analyzer.analyzeSentiment(
      'Massive crash and panic selloff amid recession fears and collapse',
    )
    expect(result.sentiment).toBe('bearish')
    expect(result.score).toBeLessThan(0)
  })

  it('detects neutral sentiment for bland text', () => {
    const result = analyzer.analyzeSentiment('The company held its quarterly meeting on Tuesday')
    expect(result.sentiment).toBe('neutral')
  })

  it('returns score clamped between -1 and 1', () => {
    const result = analyzer.analyzeSentiment('extreme rally surge bullish breakout boom soar')
    expect(result.score).toBeGreaterThanOrEqual(-1)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it('returns confidence between 0 and 1', () => {
    const result = analyzer.analyzeSentiment('rally surge bullish breakout')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('includes matched keywords in the result', () => {
    const result = analyzer.analyzeSentiment('rally and breakout detected')
    expect(result.keywords).toContain('rally')
    expect(result.keywords).toContain('breakout')
  })

  it('includes reasoning strings', () => {
    const result = analyzer.analyzeSentiment('market rally continues')
    expect(result.reasoning.length).toBeGreaterThan(0)
    expect(result.reasoning.some(r => r.includes('Bullish'))).toBe(true)
  })

  it('handles negation patterns that partially invert sentiment', () => {
    const result = analyzer.analyzeSentiment("not a rally, won't surge")
    expect(result.reasoning.some(r => r.includes('negation'))).toBe(true)
  })

  it('handles intensity modifiers', () => {
    const result = analyzer.analyzeSentiment('extremely bullish and very strong momentum')
    expect(result.reasoning.some(r => r.includes('Intensity') || r.includes('boosted'))).toBe(true)
  })

  it('returns default reasoning for text with no sentiment keywords', () => {
    const result = analyzer.analyzeSentiment('hello world')
    expect(result.reasoning).toContain('No significant sentiment keywords detected.')
  })

  it('returns zero confidence for empty text', () => {
    const result = analyzer.analyzeSentiment('')
    expect(result.confidence).toBe(0)
    expect(result.sentiment).toBe('neutral')
  })

  it('increments totalSentimentAnalyses stat', () => {
    analyzer.analyzeSentiment('rally')
    analyzer.analyzeSentiment('crash')
    const stats = analyzer.getStats()
    expect(stats.totalSentimentAnalyses).toBe(2)
  })
})

// ── detectTrend Tests ──

describe('MarketAnalyzer detectTrend', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('detects an uptrend from rising prices', () => {
    const result = analyzer.detectTrend(makeUptrend())
    expect(result.direction).toBe('up')
  })

  it('detects a downtrend from falling prices', () => {
    const result = analyzer.detectTrend(makeDowntrend())
    expect(result.direction).toBe('down')
  })

  it('detects sideways movement from flat prices', () => {
    const result = analyzer.detectTrend(makeSideways())
    expect(result.direction).toBe('sideways')
  })

  it('returns strength between 0 and 1', () => {
    const result = analyzer.detectTrend(makeUptrend())
    expect(result.strength).toBeGreaterThanOrEqual(0)
    expect(result.strength).toBeLessThanOrEqual(1)
  })

  it('returns momentum between -1 and 1', () => {
    const result = analyzer.detectTrend(makeUptrend())
    expect(result.momentum).toBeGreaterThanOrEqual(-1)
    expect(result.momentum).toBeLessThanOrEqual(1)
  })

  it('positive momentum for an uptrend', () => {
    const result = analyzer.detectTrend(makeUptrend())
    expect(result.momentum).toBeGreaterThan(0)
  })

  it('negative momentum for a downtrend', () => {
    const result = analyzer.detectTrend(makeDowntrend())
    expect(result.momentum).toBeLessThan(0)
  })

  it('respects the timeframe parameter', () => {
    const result = analyzer.detectTrend(makeUptrend(), 'weekly')
    expect(result.timeframe).toBe('weekly')
  })

  it('uses "default" as the default timeframe', () => {
    const result = analyzer.detectTrend(makeUptrend())
    expect(result.timeframe).toBe('default')
  })

  it('finds pivot points in oscillating data', () => {
    const oscillating = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i * 0.5) * 20)
    const result = analyzer.detectTrend(oscillating)
    expect(result.pivotPoints.length).toBeGreaterThan(0)
    for (const p of result.pivotPoints) {
      expect(p.type === 'high' || p.type === 'low').toBe(true)
      expect(typeof p.index).toBe('number')
      expect(typeof p.value).toBe('number')
    }
  })

  it('returns sideways with zero strength for insufficient data', () => {
    const result = analyzer.detectTrend([100, 101])
    expect(result.direction).toBe('sideways')
    expect(result.strength).toBe(0)
    expect(result.momentum).toBe(0)
    expect(result.pivotPoints).toEqual([])
  })

  it('increments totalTrendDetections stat', () => {
    analyzer.detectTrend(makeUptrend())
    analyzer.detectTrend(makeDowntrend())
    const stats = analyzer.getStats()
    expect(stats.totalTrendDetections).toBe(2)
  })
})

// ── analyzeVolatility Tests ──

describe('MarketAnalyzer analyzeVolatility', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('classifies calm regime for low-volatility data', () => {
    const stable = Array.from({ length: 30 }, (_, i) => 100 + i * 0.001)
    const result = analyzer.analyzeVolatility(stable)
    expect(result.regime).toBe('calm')
    expect(result.isHighVol).toBe(false)
  })

  it('classifies volatile or extreme regime for highly volatile data', () => {
    const wild = Array.from({ length: 60 }, (_, i) => 100 + (i % 2 === 0 ? 30 : -30))
    const result = analyzer.analyzeVolatility(wild)
    expect(['volatile', 'extreme']).toContain(result.regime)
    expect(result.isHighVol).toBe(true)
  })

  it('returns historicalVol as a non-negative number', () => {
    const result = analyzer.analyzeVolatility(makeUptrend())
    expect(result.historicalVol).toBeGreaterThanOrEqual(0)
  })

  it('returns avgVol as a non-negative number', () => {
    const result = analyzer.analyzeVolatility(makeUptrend())
    expect(result.avgVol).toBeGreaterThanOrEqual(0)
  })

  it('returns clusters as an array', () => {
    const result = analyzer.analyzeVolatility(makeVolatilePrices())
    expect(Array.isArray(result.clusters)).toBe(true)
  })

  it('returns calm regime with zero values for insufficient data', () => {
    const result = analyzer.analyzeVolatility([100, 101])
    expect(result.regime).toBe('calm')
    expect(result.historicalVol).toBe(0)
    expect(result.isHighVol).toBe(false)
    expect(result.clusters).toEqual([])
  })

  it('isHighVol is true only for volatile or extreme regimes', () => {
    const resultCalm = analyzer.analyzeVolatility(
      Array.from({ length: 30 }, (_, i) => 100 + i * 0.001),
    )
    expect(resultCalm.isHighVol).toBe(false)

    const resultVolatile = analyzer.analyzeVolatility(
      Array.from({ length: 60 }, (_, i) => 100 + (i % 2 === 0 ? 30 : -30)),
    )
    expect(resultVolatile.isHighVol).toBe(true)
  })

  it('increments totalVolatilityAnalyses stat', () => {
    analyzer.analyzeVolatility(makeUptrend())
    analyzer.analyzeVolatility(makeDowntrend())
    const stats = analyzer.getStats()
    expect(stats.totalVolatilityAnalyses).toBe(2)
  })
})

// ── computeCorrelations Tests ──

describe('MarketAnalyzer computeCorrelations', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('returns a correlation matrix with correct asset names', () => {
    const data = makeCorrelatedAssets()
    const result = analyzer.computeCorrelations(data)
    expect(result.assets).toContain('SPY')
    expect(result.assets).toContain('QQQ')
    expect(result.assets).toContain('GOLD')
  })

  it('diagonal of the matrix is 1', () => {
    const data = makeCorrelatedAssets()
    const result = analyzer.computeCorrelations(data)
    for (let i = 0; i < result.assets.length; i++) {
      expect(result.matrix[i][i]).toBe(1)
    }
  })

  it('matrix is symmetric', () => {
    const data = makeCorrelatedAssets()
    const result = analyzer.computeCorrelations(data)
    const n = result.assets.length
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        expect(result.matrix[i][j]).toBe(result.matrix[j][i])
      }
    }
  })

  it('detects strong positive correlations for correlated assets', () => {
    const data = makeCorrelatedAssets()
    const result = analyzer.computeCorrelations(data)
    expect(result.strongPositive.length).toBeGreaterThan(0)
    for (const sp of result.strongPositive) {
      expect(sp.correlation).toBeGreaterThanOrEqual(0.7)
    }
  })

  it('detects strong negative correlations for inversely correlated assets', () => {
    const data = makeCorrelatedAssets()
    const result = analyzer.computeCorrelations(data)
    expect(result.strongNegative.length).toBeGreaterThan(0)
    for (const sn of result.strongNegative) {
      expect(sn.correlation).toBeLessThanOrEqual(-0.7)
    }
  })

  it('detects correlation changes on second call with different data', () => {
    const data1 = makeCorrelatedAssets()
    analyzer.computeCorrelations(data1)

    // Change GOLD to be positively correlated instead
    const data2 = {
      SPY: data1.SPY,
      QQQ: data1.QQQ,
      GOLD: data1.SPY.map(v => v * 0.9 + 10),
    }
    const result2 = analyzer.computeCorrelations(data2)
    expect(result2.changes.length).toBeGreaterThan(0)
  })

  it('handles single-asset input', () => {
    const result = analyzer.computeCorrelations({ SPY: makeUptrend() })
    expect(result.assets).toEqual(['SPY'])
    expect(result.matrix).toEqual([[1]])
  })

  it('handles empty asset data', () => {
    const result = analyzer.computeCorrelations({})
    expect(result.assets).toEqual([])
    expect(result.matrix).toEqual([])
  })

  it('increments totalCorrelationsComputed stat', () => {
    analyzer.computeCorrelations(makeCorrelatedAssets())
    analyzer.computeCorrelations(makeCorrelatedAssets())
    const stats = analyzer.getStats()
    expect(stats.totalCorrelationsComputed).toBe(2)
  })
})

// ── analyzeMarketBreadth Tests ──

describe('MarketAnalyzer analyzeMarketBreadth', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('returns strongly_bullish when advancers vastly outnumber decliners', () => {
    const result = analyzer.analyzeMarketBreadth(400, 50)
    expect(result.sentiment).toBe('strongly_bullish')
    expect(result.thrust).toBeGreaterThan(0)
  })

  it('returns strongly_bearish when decliners vastly outnumber advancers', () => {
    const result = analyzer.analyzeMarketBreadth(50, 400)
    expect(result.sentiment).toBe('strongly_bearish')
    expect(result.thrust).toBeLessThan(0)
  })

  it('returns neutral for balanced advance/decline', () => {
    const result = analyzer.analyzeMarketBreadth(250, 250)
    expect(result.sentiment).toBe('neutral')
    expect(result.thrust).toBe(0)
  })

  it('returns bullish for moderate advance bias', () => {
    const result = analyzer.analyzeMarketBreadth(350, 200)
    expect(result.sentiment).toBe('bullish')
  })

  it('returns bearish for moderate decline bias', () => {
    const result = analyzer.analyzeMarketBreadth(200, 300)
    expect(result.sentiment).toBe('bearish')
  })

  it('computes correct advance/decline ratio', () => {
    const result = analyzer.analyzeMarketBreadth(300, 100)
    expect(result.ratio).toBe(3)
  })

  it('handles zero decliners (returns 999 ratio)', () => {
    const result = analyzer.analyzeMarketBreadth(100, 0)
    expect(result.ratio).toBe(999)
  })

  it('handles all zeros gracefully', () => {
    const result = analyzer.analyzeMarketBreadth(0, 0)
    expect(result.sentiment).toBe('neutral')
    expect(result.ratio).toBe(1)
    expect(result.thrust).toBe(0)
  })

  it('accounts for unchanged count in thrust calculation', () => {
    const result = analyzer.analyzeMarketBreadth(300, 100, 100)
    expect(result.thrust).toBe(0.4)
  })
})

// ── assessNewsImpact Tests ──

describe('MarketAnalyzer assessNewsImpact', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('categorizes monetary policy news correctly', () => {
    const result = analyzer.assessNewsImpact('Federal Reserve announces interest rate hike')
    expect(result.category).toBe('monetary_policy')
    expect(result.timeHorizon).toBe('immediate')
  })

  it('categorizes earnings news correctly', () => {
    const result = analyzer.assessNewsImpact(
      'Company reports quarterly earnings beat with strong revenue',
    )
    expect(result.category).toBe('earnings')
    expect(result.timeHorizon).toBe('short_term')
  })

  it('categorizes geopolitical news correctly', () => {
    const result = analyzer.assessNewsImpact('New sanctions imposed amid trade war escalation')
    expect(result.category).toBe('geopolitical')
    expect(result.affectedSectors).toContain('energy')
  })

  it('categorizes regulation news correctly', () => {
    const result = analyzer.assessNewsImpact('SEC announces new regulatory compliance requirements')
    expect(result.category).toBe('regulation')
  })

  it('categorizes natural disaster news correctly', () => {
    const result = analyzer.assessNewsImpact('Massive earthquake strikes major economic region')
    expect(result.category).toBe('natural_disaster')
    expect(result.timeHorizon).toBe('immediate')
  })

  it('returns general category for unrecognized news', () => {
    const result = analyzer.assessNewsImpact('Today is a nice day for a walk in the park')
    expect(result.category).toBe('general')
    expect(result.expectedImpact).toBe(0.2)
    expect(result.confidence).toBe(0.2)
  })

  it('returns expectedImpact between 0 and 1', () => {
    const result = analyzer.assessNewsImpact('Federal Reserve interest rate cut announced')
    expect(result.expectedImpact).toBeGreaterThanOrEqual(0)
    expect(result.expectedImpact).toBeLessThanOrEqual(1)
  })

  it('returns confidence between 0 and 1', () => {
    const result = analyzer.assessNewsImpact(
      'Massive earnings beat with strong revenue guidance and EPS growth',
    )
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('preserves headline in the result', () => {
    const headline = 'Tech sector IPO boom continues'
    const result = analyzer.assessNewsImpact(headline)
    expect(result.headline).toBe(headline)
  })

  it('increments totalNewsAssessed stat', () => {
    analyzer.assessNewsImpact('rate hike')
    analyzer.assessNewsImpact('earnings beat')
    const stats = analyzer.getStats()
    expect(stats.totalNewsAssessed).toBe(2)
  })
})

// ── detectAnomalies Tests ──

describe('MarketAnalyzer detectAnomalies', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('detects outliers in data with a spike', () => {
    const data = Array.from({ length: 30 }, () => 100)
    data[15] = 200
    const anomalies = analyzer.detectAnomalies(data)
    expect(anomalies.length).toBeGreaterThan(0)
    expect(anomalies.some(a => a.index === 15)).toBe(true)
  })

  it('returns empty array for uniform data', () => {
    const data = Array.from({ length: 30 }, () => 50)
    const anomalies = analyzer.detectAnomalies(data)
    expect(anomalies).toEqual([])
  })

  it('each anomaly has expected fields', () => {
    const data = Array.from({ length: 30 }, () => 100)
    data[10] = 300
    const anomalies = analyzer.detectAnomalies(data, 'price')
    expect(anomalies.length).toBeGreaterThan(0)
    const a = anomalies[0]
    expect(typeof a.index).toBe('number')
    expect(typeof a.value).toBe('number')
    expect(typeof a.severity).toBe('number')
    expect(a.severity).toBeGreaterThanOrEqual(0)
    expect(a.severity).toBeLessThanOrEqual(1)
    expect(a.expectedRange.low).toBeLessThan(a.expectedRange.high)
    expect(a.type).toBe('price')
  })

  it('respects the type parameter', () => {
    const data = Array.from({ length: 30 }, () => 100)
    data[10] = 300
    const anomalies = analyzer.detectAnomalies(data, 'volume')
    expect(anomalies.length).toBeGreaterThan(0)
    expect(anomalies[0].type).toBe('volume')
  })

  it('anomalies are sorted by severity descending', () => {
    const data = Array.from({ length: 30 }, () => 100)
    data[5] = 200
    data[15] = 400
    const anomalies = analyzer.detectAnomalies(data)
    for (let i = 1; i < anomalies.length; i++) {
      expect(anomalies[i - 1].severity).toBeGreaterThanOrEqual(anomalies[i].severity)
    }
  })

  it('returns empty array for insufficient data', () => {
    const anomalies = analyzer.detectAnomalies([100, 200])
    expect(anomalies).toEqual([])
  })

  it('increments totalAnomaliesFound stat', () => {
    const data = Array.from({ length: 30 }, () => 100)
    data[10] = 500
    analyzer.detectAnomalies(data)
    const stats = analyzer.getStats()
    expect(stats.totalAnomaliesFound).toBeGreaterThan(0)
  })
})

// ── generateSummary Tests ──

describe('MarketAnalyzer generateSummary', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('returns all expected fields', () => {
    const summary = analyzer.generateSummary(makeUptrend(), [
      'market rally continues with strong growth',
    ])
    expect(summary.overallSentiment).toBeDefined()
    expect(summary.trendDirection).toBeDefined()
    expect(summary.volatilityRegime).toBeDefined()
    expect(summary.keyLevels).toBeDefined()
    expect(typeof summary.outlook).toBe('string')
    expect(Array.isArray(summary.risks)).toBe(true)
    expect(Array.isArray(summary.opportunities)).toBe(true)
  })

  it('detects bullish summary from bullish headlines and uptrend', () => {
    const summary = analyzer.generateSummary(makeUptrend(), [
      'rally surge bullish breakout boom',
      'strong growth momentum uptrend',
    ])
    expect(summary.overallSentiment).toBe('bullish')
    expect(summary.trendDirection).toBe('up')
  })

  it('detects bearish summary from bearish headlines and downtrend', () => {
    const summary = analyzer.generateSummary(makeDowntrend(), [
      'crash panic selloff recession collapse crisis',
    ])
    expect(summary.overallSentiment).toBe('bearish')
    expect(summary.trendDirection).toBe('down')
  })

  it('includes key support and resistance levels', () => {
    const summary = analyzer.generateSummary(makeUptrend(50), ['neutral day'])
    expect(Array.isArray(summary.keyLevels.support)).toBe(true)
    expect(Array.isArray(summary.keyLevels.resistance)).toBe(true)
  })

  it('includes breadth data when provided', () => {
    const summary = analyzer.generateSummary(makeUptrend(), ['bullish rally'], {
      advancers: 400,
      decliners: 50,
    })
    expect(summary.outlook.length).toBeGreaterThan(0)
  })

  it('generates outlook string', () => {
    const summary = analyzer.generateSummary(makeUptrend(), ['strong rally'])
    expect(summary.outlook.length).toBeGreaterThan(10)
  })

  it('identifies risks from bearish headlines', () => {
    const summary = analyzer.generateSummary(makeDowntrend(), [
      'recession fears mount',
      'bankruptcy risk increases',
    ])
    expect(summary.risks.length).toBeGreaterThan(0)
  })

  it('identifies opportunities from bullish headlines', () => {
    const summary = analyzer.generateSummary(makeUptrend(), [
      'breakout rally with growth expansion',
    ])
    expect(summary.opportunities.length).toBeGreaterThan(0)
  })

  it('handles empty headlines array', () => {
    const summary = analyzer.generateSummary(makeUptrend(), [])
    expect(summary.overallSentiment).toBe('neutral')
  })

  it('increments totalSummariesGenerated stat', () => {
    analyzer.generateSummary(makeUptrend(), ['test headline'])
    analyzer.generateSummary(makeDowntrend(), ['another headline'])
    const stats = analyzer.getStats()
    expect(stats.totalSummariesGenerated).toBe(2)
  })
})

// ── getStats Tests ──

describe('MarketAnalyzer getStats', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('returns stats with all expected fields', () => {
    const stats = analyzer.getStats()
    expect(typeof stats.totalSentimentAnalyses).toBe('number')
    expect(typeof stats.totalTrendDetections).toBe('number')
    expect(typeof stats.totalAnomaliesFound).toBe('number')
    expect(typeof stats.totalCorrelationsComputed).toBe('number')
    expect(typeof stats.totalVolatilityAnalyses).toBe('number')
    expect(typeof stats.totalNewsAssessed).toBe('number')
    expect(typeof stats.totalSummariesGenerated).toBe('number')
    expect(typeof stats.feedbackReceived).toBe('number')
    expect(typeof stats.feedbackAccuracy).toBe('number')
  })

  it('updates after various operations', () => {
    analyzer.analyzeSentiment('rally')
    analyzer.detectTrend(makeUptrend())
    analyzer.analyzeVolatility(makeUptrend())
    analyzer.computeCorrelations(makeCorrelatedAssets())
    analyzer.assessNewsImpact('rate hike')
    analyzer.generateSummary(makeUptrend(), ['test'])
    const stats = analyzer.getStats()
    expect(stats.totalSentimentAnalyses).toBeGreaterThanOrEqual(1)
    expect(stats.totalTrendDetections).toBeGreaterThanOrEqual(1)
    expect(stats.totalVolatilityAnalyses).toBeGreaterThanOrEqual(1)
    expect(stats.totalCorrelationsComputed).toBe(1)
    expect(stats.totalNewsAssessed).toBe(1)
    expect(stats.totalSummariesGenerated).toBe(1)
  })
})

// ── learnFromFeedback Tests ──

describe('MarketAnalyzer learnFromFeedback', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('increases feedbackReceived count after positive feedback', () => {
    analyzer.learnFromFeedback('sentiment', true)
    const stats = analyzer.getStats()
    expect(stats.feedbackReceived).toBe(1)
  })

  it('increases feedbackReceived count after negative feedback', () => {
    analyzer.learnFromFeedback('trend', false)
    const stats = analyzer.getStats()
    expect(stats.feedbackReceived).toBe(1)
  })

  it('tracks accuracy correctly with mixed feedback', () => {
    analyzer.learnFromFeedback('sentiment', true)
    analyzer.learnFromFeedback('trend', false)
    const stats = analyzer.getStats()
    expect(stats.feedbackReceived).toBe(2)
    expect(stats.feedbackAccuracy).toBe(0.5)
  })

  it('feedbackAccuracy is 1.0 when all feedback is correct', () => {
    analyzer.learnFromFeedback('sentiment', true)
    analyzer.learnFromFeedback('trend', true)
    analyzer.learnFromFeedback('volatility', true)
    const stats = analyzer.getStats()
    expect(stats.feedbackAccuracy).toBe(1)
  })

  it('feedbackAccuracy is 0 when all feedback is negative', () => {
    analyzer.learnFromFeedback('sentiment', false)
    analyzer.learnFromFeedback('trend', false)
    const stats = analyzer.getStats()
    expect(stats.feedbackAccuracy).toBe(0)
  })

  it('does nothing when learning is disabled', () => {
    const noLearn = new MarketAnalyzer({ enableLearning: false })
    noLearn.learnFromFeedback('sentiment', true)
    const stats = noLearn.getStats()
    expect(stats.feedbackReceived).toBe(0)
  })
})

// ── serialize / deserialize Tests ──

describe('MarketAnalyzer serialize / deserialize', () => {
  it('round-trip preserves config', () => {
    const original = new MarketAnalyzer({
      sentimentThreshold: 0.25,
      anomalyStdDevs: 3.5,
    })

    const json = original.serialize()
    const data = JSON.parse(json)
    expect(data.config.sentimentThreshold).toBe(0.25)
    expect(data.config.anomalyStdDevs).toBe(3.5)
  })

  it('round-trip preserves stats', () => {
    const original = new MarketAnalyzer()
    original.analyzeSentiment('bullish rally')
    original.detectTrend(makeUptrend())
    original.analyzeVolatility(makeUptrend())

    const json = original.serialize()
    const restored = MarketAnalyzer.deserialize(json)
    const stats = restored.getStats()
    expect(stats.totalSentimentAnalyses).toBe(1)
    expect(stats.totalTrendDetections).toBe(1)
    expect(stats.totalVolatilityAnalyses).toBe(1)
  })

  it('round-trip preserves feedback state', () => {
    const original = new MarketAnalyzer()
    original.learnFromFeedback('sentiment', true)
    original.learnFromFeedback('trend', false)

    const json = original.serialize()
    const restored = MarketAnalyzer.deserialize(json)
    const stats = restored.getStats()
    expect(stats.feedbackReceived).toBe(2)
    expect(stats.feedbackAccuracy).toBe(0.5)
  })

  it('round-trip preserves previousCorrelations for change detection', () => {
    const original = new MarketAnalyzer()
    const data = makeCorrelatedAssets()
    original.computeCorrelations(data)

    const json = original.serialize()
    const restored = MarketAnalyzer.deserialize(json)

    // Second call with different data should detect changes
    const data2 = {
      SPY: data.SPY,
      QQQ: data.QQQ,
      GOLD: data.SPY.map(v => v * 0.9 + 10),
    }
    const result = restored.computeCorrelations(data2)
    expect(result.changes.length).toBeGreaterThan(0)
  })

  it('deserialized instance is fully functional', () => {
    const original = new MarketAnalyzer()
    const json = original.serialize()
    const restored = MarketAnalyzer.deserialize(json)

    const sentiment = restored.analyzeSentiment('bullish rally surge')
    expect(sentiment.sentiment).toBe('bullish')

    const trend = restored.detectTrend(makeUptrend())
    expect(trend.direction).toBe('up')
  })

  it('serialize returns valid JSON', () => {
    const analyzer = new MarketAnalyzer()
    const json = analyzer.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })
})

// ── Edge Cases ──

describe('MarketAnalyzer edge cases', () => {
  let analyzer: MarketAnalyzer

  beforeEach(() => {
    analyzer = new MarketAnalyzer()
  })

  it('handles single-element price array for detectTrend', () => {
    const result = analyzer.detectTrend([100])
    expect(result.direction).toBe('sideways')
    expect(result.pivotPoints).toEqual([])
  })

  it('handles empty price array for detectTrend', () => {
    const result = analyzer.detectTrend([])
    expect(result.direction).toBe('sideways')
    expect(result.strength).toBe(0)
  })

  it('handles empty price array for analyzeVolatility', () => {
    const result = analyzer.analyzeVolatility([])
    expect(result.regime).toBe('calm')
    expect(result.historicalVol).toBe(0)
  })

  it('handles all-identical prices for detectTrend', () => {
    const result = analyzer.detectTrend(Array.from({ length: 20 }, () => 100))
    expect(result.direction).toBe('sideways')
  })

  it('handles all-identical prices for analyzeVolatility', () => {
    const result = analyzer.analyzeVolatility(Array.from({ length: 20 }, () => 100))
    expect(result.regime).toBe('calm')
    expect(result.historicalVol).toBe(0)
  })

  it('handles very long text in analyzeSentiment', () => {
    const longText = 'bullish rally surge '.repeat(500)
    const result = analyzer.analyzeSentiment(longText)
    expect(result.sentiment).toBe('bullish')
    expect(result.score).toBeGreaterThan(0)
  })

  it('handles special characters in sentiment text', () => {
    const result = analyzer.analyzeSentiment('!@#$% ^&*() rally??? bullish!!!')
    expect(result.keywords).toContain('rally')
  })

  it('handles very high sentimentThreshold config', () => {
    const strict = new MarketAnalyzer({ sentimentThreshold: 0.99 })
    const result = strict.analyzeSentiment('slight gain amid some risk')
    expect(result.sentiment).toBe('neutral')
  })

  it('handles zero advancers and zero decliners with unchanged stocks', () => {
    const result = analyzer.analyzeMarketBreadth(0, 0, 500)
    expect(result.sentiment).toBe('neutral')
    expect(result.thrust).toBe(0)
  })

  it('detectAnomalies with all-zero data returns empty', () => {
    const data = Array.from({ length: 20 }, () => 0)
    const anomalies = analyzer.detectAnomalies(data)
    expect(anomalies).toEqual([])
  })
})
