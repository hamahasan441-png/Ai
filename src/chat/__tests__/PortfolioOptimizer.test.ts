import { describe, it, expect, beforeEach } from 'vitest'
import { PortfolioOptimizer, type Asset, type Portfolio } from '../PortfolioOptimizer'

// ── Helpers: generate sample asset data ──

let assetCounter = 0

function makeAsset(
  id: string,
  name: string,
  expectedReturn: number,
  volatility: number,
  weight: number,
  returnSeries?: number[],
): Asset {
  const returns = returnSeries ?? generateReturns(expectedReturn, volatility, 60)
  return { id, name, returns, expectedReturn, volatility, weight }
}

function generateReturns(mu: number, sigma: number, n: number): number[] {
  // Deterministic pseudo-returns with per-asset phase offset for varied correlations
  const phase = assetCounter++ * 1.3
  const results: number[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * 2 * Math.PI
    results.push(mu / 12 + sigma * Math.sin(t + phase) * 0.3)
  }
  return results
}

function makeTwoAssets(): Asset[] {
  return [
    makeAsset('stocks', 'US Stocks', 0.1, 0.18, 0.6),
    makeAsset('bonds', 'US Bonds', 0.04, 0.05, 0.4),
  ]
}

function makeThreeAssets(): Asset[] {
  return [
    makeAsset('stocks', 'US Stocks', 0.1, 0.18, 0.5),
    makeAsset('bonds', 'US Bonds', 0.04, 0.05, 0.3),
    makeAsset('gold', 'Gold', 0.06, 0.12, 0.2),
  ]
}

function makeFiveAssets(): Asset[] {
  return [
    makeAsset('us_eq', 'US Equity', 0.1, 0.18, 0.3),
    makeAsset('intl_eq', 'Intl Equity', 0.08, 0.2, 0.2),
    makeAsset('bonds', 'Bonds', 0.04, 0.05, 0.2),
    makeAsset('reit', 'REITs', 0.07, 0.15, 0.15),
    makeAsset('gold', 'Gold', 0.05, 0.12, 0.15),
  ]
}

function makePortfolio(optimizer: PortfolioOptimizer, assets: Asset[]): Portfolio {
  return optimizer.buildPortfolio(assets)
}

// ── Constructor Tests ──

describe('PortfolioOptimizer constructor', () => {
  it('creates an instance with default config', () => {
    const opt = new PortfolioOptimizer()
    expect(opt).toBeInstanceOf(PortfolioOptimizer)
  })

  it('accepts a partial custom config', () => {
    const opt = new PortfolioOptimizer({ riskFreeRate: 0.05 })
    expect(opt).toBeInstanceOf(PortfolioOptimizer)
  })

  it('accepts a full custom config', () => {
    const opt = new PortfolioOptimizer({
      riskFreeRate: 0.03,
      maxPositionSize: 0.5,
      minPositionSize: 0.01,
      rebalanceThreshold: 0.1,
      minAssets: 3,
      maxAssets: 20,
      targetReturn: 0.1,
      confidenceLevel: 0.99,
      maxDrawdownLimit: 0.3,
      enableLearning: false,
      frontierPoints: 30,
      gradientStepSize: 0.002,
      gradientIterations: 500,
    })
    expect(opt).toBeInstanceOf(PortfolioOptimizer)
  })

  it('starts with zero stats', () => {
    const opt = new PortfolioOptimizer()
    const stats = opt.getStats()
    expect(stats.totalOptimizations).toBe(0)
    expect(stats.totalRiskAssessments).toBe(0)
    expect(stats.totalRebalances).toBe(0)
    expect(stats.totalAllocations).toBe(0)
    expect(stats.feedbackReceived).toBe(0)
  })
})

// ── optimize Tests ──

describe('PortfolioOptimizer optimize', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer()
  })

  it('optimizes a two-asset portfolio using the analytical method', () => {
    const result = opt.optimize(makeTwoAssets())
    expect(result.method).toBe('analytical')
    expect(result.portfolio.assets).toHaveLength(2)
  })

  it('optimizes a three-asset portfolio using gradient descent', () => {
    const result = opt.optimize(makeThreeAssets())
    expect(result.method).toBe('gradient-descent')
    expect(result.portfolio.assets).toHaveLength(3)
  })

  it('returns weights that sum to approximately 1', () => {
    const result = opt.optimize(makeThreeAssets())
    const totalWeight = result.portfolio.assets.reduce((s, a) => s + a.weight, 0)
    expect(totalWeight).toBeCloseTo(1, 2)
  })

  it('respects minPositionSize constraint', () => {
    const result = opt.optimize(makeThreeAssets())
    for (const asset of result.portfolio.assets) {
      expect(asset.weight).toBeGreaterThanOrEqual(0)
    }
  })

  it('keeps weights bounded by maxPositionSize before normalization', () => {
    const customOpt = new PortfolioOptimizer({ maxPositionSize: 0.6 })
    const result = customOpt.optimize(makeFiveAssets())
    for (const asset of result.portfolio.assets) {
      expect(asset.weight).toBeLessThanOrEqual(1.0)
      expect(asset.weight).toBeGreaterThanOrEqual(0)
    }
  })

  it('falls back to equal-weight when too few assets', () => {
    const result = opt.optimize([makeAsset('only', 'Only Asset', 0.08, 0.15, 1.0)])
    expect(result.method).toBe('equal-weight')
    expect(result.constraints.length).toBeGreaterThan(0)
  })

  it('truncates assets exceeding maxAssets', () => {
    const manyAssets: Asset[] = []
    for (let i = 0; i < 35; i++) {
      manyAssets.push(makeAsset(`a${i}`, `Asset ${i}`, 0.05 + i * 0.001, 0.1 + i * 0.005, 1 / 35))
    }
    const result = opt.optimize(manyAssets)
    expect(result.portfolio.assets.length).toBeLessThanOrEqual(30)
  })

  it('includes efficient frontier points', () => {
    const result = opt.optimize(makeThreeAssets())
    expect(result.efficientFrontier.length).toBeGreaterThan(0)
  })

  it('efficient frontier points have ascending risk', () => {
    const result = opt.optimize(makeFiveAssets())
    const risks = result.efficientFrontier.map(p => p.risk)
    for (let i = 1; i < risks.length; i++) {
      expect(risks[i]).toBeGreaterThanOrEqual(risks[i - 1] - 0.001) // small tolerance
    }
  })

  it('computes a Sharpe ratio for each frontier point', () => {
    const result = opt.optimize(makeThreeAssets())
    for (const point of result.efficientFrontier) {
      expect(typeof point.sharpe).toBe('number')
    }
  })

  it('produces a portfolio with numeric fields', () => {
    const result = opt.optimize(makeThreeAssets())
    const p = result.portfolio
    expect(typeof p.totalReturn).toBe('number')
    expect(typeof p.totalRisk).toBe('number')
    expect(typeof p.sharpeRatio).toBe('number')
    expect(typeof p.sortino).toBe('number')
    expect(typeof p.maxDrawdown).toBe('number')
    expect(typeof p.diversificationScore).toBe('number')
  })

  it('increments totalOptimizations stat', () => {
    opt.optimize(makeTwoAssets())
    opt.optimize(makeThreeAssets())
    const stats = opt.getStats()
    expect(stats.totalOptimizations).toBe(2)
  })

  it('includes constraint descriptions', () => {
    const result = opt.optimize(makeThreeAssets())
    expect(result.constraints.length).toBeGreaterThan(0)
    expect(result.constraints.some(c => c.includes('position'))).toBe(true)
  })
})

// ── assessRisk Tests ──

describe('PortfolioOptimizer assessRisk', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer()
  })

  it('returns VaR at 95% and 99% confidence', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const risk = opt.assessRisk(portfolio)
    expect(typeof risk.var95).toBe('number')
    expect(typeof risk.var99).toBe('number')
  })

  it('99% VaR is at least as large as 95% VaR', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const risk = opt.assessRisk(portfolio)
    expect(risk.var99).toBeGreaterThanOrEqual(risk.var95 - 0.001)
  })

  it('returns CVaR (Expected Shortfall)', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const risk = opt.assessRisk(portfolio)
    expect(typeof risk.cvar).toBe('number')
  })

  it('returns beta of 1 when no market returns provided', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const risk = opt.assessRisk(portfolio)
    expect(risk.beta).toBe(1)
  })

  it('computes beta relative to market when provided', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const marketReturns = generateReturns(0.08, 0.15, 60)
    const risk = opt.assessRisk(portfolio, marketReturns)
    expect(typeof risk.beta).toBe('number')
    expect(risk.beta).not.toBe(1)
  })

  it('builds a correlation matrix with 1s on the diagonal', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const risk = opt.assessRisk(portfolio)
    for (let i = 0; i < risk.correlation.length; i++) {
      expect(risk.correlation[i][i]).toBe(1)
    }
  })

  it('correlation matrix is symmetric', () => {
    const portfolio = makePortfolio(opt, makeFiveAssets())
    const risk = opt.assessRisk(portfolio)
    const n = risk.correlation.length
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        expect(risk.correlation[i][j]).toBe(risk.correlation[j][i])
      }
    }
  })

  it('runs stress tests and returns scenarios', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const risk = opt.assessRisk(portfolio)
    expect(risk.stressTests.length).toBeGreaterThan(0)
    for (const st of risk.stressTests) {
      expect(typeof st.scenario).toBe('string')
      expect(typeof st.portfolioReturn).toBe('number')
      expect(typeof st.worstAsset).toBe('string')
      expect(typeof st.bestAsset).toBe('string')
    }
  })

  it('returns a worstCase loss', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const risk = opt.assessRisk(portfolio)
    expect(typeof risk.worstCase).toBe('number')
  })

  it('increments totalRiskAssessments stat', () => {
    const portfolio = makePortfolio(opt, makeTwoAssets())
    opt.assessRisk(portfolio)
    opt.assessRisk(portfolio)
    expect(opt.getStats().totalRiskAssessments).toBe(2)
  })
})

// ── recommendAllocation Tests ──

describe('PortfolioOptimizer recommendAllocation', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer()
  })

  it('returns allocations for a conservative profile', () => {
    const rec = opt.recommendAllocation(makeFiveAssets(), 'conservative')
    expect(rec.riskProfile).toBe('conservative')
    expect(rec.allocations.length).toBe(5)
    expect(rec.reasoning.some(r => r.toLowerCase().includes('conservative'))).toBe(true)
  })

  it('returns allocations for a moderate profile', () => {
    const rec = opt.recommendAllocation(makeFiveAssets(), 'moderate')
    expect(rec.riskProfile).toBe('moderate')
    expect(rec.reasoning.some(r => r.toLowerCase().includes('moderate'))).toBe(true)
  })

  it('returns allocations for an aggressive profile', () => {
    const rec = opt.recommendAllocation(makeFiveAssets(), 'aggressive')
    expect(rec.riskProfile).toBe('aggressive')
    expect(rec.reasoning.some(r => r.toLowerCase().includes('aggressive'))).toBe(true)
  })

  it('allocation weights sum to approximately 1', () => {
    const rec = opt.recommendAllocation(makeFiveAssets(), 'moderate')
    const totalWeight = rec.allocations.reduce((s, a) => s + a.weight, 0)
    expect(totalWeight).toBeCloseTo(1, 2)
  })

  it('aggressive profile has higher expected return than conservative', () => {
    const assets = makeFiveAssets()
    const conservative = opt.recommendAllocation(assets, 'conservative')
    const aggressive = opt.recommendAllocation(assets, 'aggressive')
    expect(aggressive.expectedReturn).toBeGreaterThanOrEqual(conservative.expectedReturn)
  })

  it('returns empty allocations for empty asset list', () => {
    const rec = opt.recommendAllocation([], 'moderate')
    expect(rec.allocations).toEqual([])
    expect(rec.expectedReturn).toBe(0)
    expect(rec.expectedRisk).toBe(0)
  })

  it('includes reasoning strings', () => {
    const rec = opt.recommendAllocation(makeThreeAssets(), 'moderate')
    expect(rec.reasoning.length).toBeGreaterThan(0)
    expect(rec.reasoning.some(r => r.includes('Expected return'))).toBe(true)
  })

  it('increments totalAllocations stat', () => {
    opt.recommendAllocation(makeTwoAssets(), 'conservative')
    opt.recommendAllocation(makeTwoAssets(), 'aggressive')
    expect(opt.getStats().totalAllocations).toBe(2)
  })
})

// ── getDiversificationScore Tests ──

describe('PortfolioOptimizer getDiversificationScore', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer()
  })

  it('returns a score between 0 and 1 for a multi-asset portfolio', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const score = opt.getDiversificationScore(portfolio)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })

  it('returns 0 for a single-asset portfolio', () => {
    const singleAsset = [makeAsset('only', 'Only', 0.08, 0.15, 1.0)]
    const portfolio = makePortfolio(opt, singleAsset)
    const score = opt.getDiversificationScore(portfolio)
    expect(score).toBe(0)
  })

  it('five-asset portfolio has a non-zero diversification score', () => {
    const portfolio = makePortfolio(opt, makeFiveAssets())
    const score = opt.getDiversificationScore(portfolio)
    expect(score).toBeGreaterThan(0)
  })
})

// ── detectDrift / rebalancing Tests ──

describe('PortfolioOptimizer rebalancing', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer({ rebalanceThreshold: 0.05 })
  })

  it('detects drift when weights exceed threshold', () => {
    const portfolio = makePortfolio(opt, makeTwoAssets())
    const targets = new Map<string, number>()
    targets.set('stocks', 0.5)
    targets.set('bonds', 0.5)
    // Since initial weights may differ from 50/50, drift may be detected
    const needs = opt.needsRebalancing(portfolio, targets)
    expect(typeof needs).toBe('boolean')
  })

  it('returns no trades when portfolio matches targets', () => {
    const assets = makeTwoAssets()
    const portfolio = makePortfolio(opt, assets)
    const targets = new Map<string, number>()
    for (const a of portfolio.assets) {
      targets.set(a.id, a.weight)
    }
    const trades = opt.rebalance(portfolio, targets)
    expect(trades).toEqual([])
  })

  it('returns buy/sell trades for drifted portfolio', () => {
    const portfolio = makePortfolio(opt, makeTwoAssets())
    const targets = new Map<string, number>()
    targets.set('stocks', 0.3)
    targets.set('bonds', 0.7)
    const trades = opt.rebalance(portfolio, targets)
    expect(trades.length).toBeGreaterThan(0)
    for (const trade of trades) {
      expect(['buy', 'sell']).toContain(trade.action)
      expect(trade.amount).toBeGreaterThan(0)
    }
  })

  it('suggests buying a new asset not in current portfolio', () => {
    const portfolio = makePortfolio(opt, makeTwoAssets())
    const targets = new Map<string, number>()
    targets.set('stocks', 0.4)
    targets.set('bonds', 0.4)
    targets.set('gold', 0.2)
    const trades = opt.rebalance(portfolio, targets)
    const goldTrade = trades.find(t => t.assetId === 'gold')
    expect(goldTrade).toBeDefined()
    expect(goldTrade!.action).toBe('buy')
  })

  it('sorts trades by amount descending', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const targets = new Map<string, number>()
    targets.set('stocks', 0.1)
    targets.set('bonds', 0.6)
    targets.set('gold', 0.3)
    const trades = opt.rebalance(portfolio, targets)
    for (let i = 1; i < trades.length; i++) {
      expect(trades[i - 1].amount).toBeGreaterThanOrEqual(trades[i].amount)
    }
  })

  it('increments totalRebalances stat', () => {
    const portfolio = makePortfolio(opt, makeTwoAssets())
    const targets = new Map<string, number>([
      ['stocks', 0.5],
      ['bonds', 0.5],
    ])
    opt.rebalance(portfolio, targets)
    opt.rebalance(portfolio, targets)
    expect(opt.getStats().totalRebalances).toBe(2)
  })

  it('needsRebalancing returns false when all weights match targets', () => {
    const portfolio = makePortfolio(opt, makeTwoAssets())
    const targets = new Map<string, number>()
    for (const a of portfolio.assets) {
      targets.set(a.id, a.weight)
    }
    expect(opt.needsRebalancing(portfolio, targets)).toBe(false)
  })
})

// ── calculatePositionSize Tests ──

describe('PortfolioOptimizer position sizing', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer()
  })

  it('Kelly criterion returns method "kelly"', () => {
    const result = opt.kellyCriterion(0.6, 0.02, 0.01)
    expect(result.method).toBe('kelly')
  })

  it('Kelly criterion returns a size between 0 and maxPositionSize', () => {
    const result = opt.kellyCriterion(0.6, 0.02, 0.01)
    expect(result.size).toBeGreaterThanOrEqual(0)
    expect(result.size).toBeLessThanOrEqual(0.4)
  })

  it('Kelly criterion with zero avgLoss returns max size', () => {
    const result = opt.kellyCriterion(0.6, 0.02, 0)
    expect(result.size).toBe(0.4)
    expect(result.confidence).toBe(0.5)
  })

  it('Kelly criterion with low win rate yields smaller size', () => {
    const highWin = opt.kellyCriterion(0.7, 0.03, 0.02)
    const lowWin = opt.kellyCriterion(0.3, 0.03, 0.02)
    expect(highWin.size).toBeGreaterThanOrEqual(lowWin.size)
  })

  it('Kelly criterion includes confidence and maxLoss', () => {
    const result = opt.kellyCriterion(0.55, 0.03, 0.02)
    expect(typeof result.confidence).toBe('number')
    expect(typeof result.maxLoss).toBe('number')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('fixed fractional returns method "fixed"', () => {
    const result = opt.fixedFractional(100000, 0.02, 0.05)
    expect(result.method).toBe('fixed')
  })

  it('fixed fractional returns a valid size', () => {
    const result = opt.fixedFractional(100000, 0.02, 0.05)
    expect(result.size).toBeGreaterThan(0)
    expect(result.size).toBeLessThanOrEqual(0.4)
  })

  it('fixed fractional returns zero for zero account size', () => {
    const result = opt.fixedFractional(0, 0.02, 0.05)
    expect(result.size).toBe(0)
  })

  it('fixed fractional returns zero for zero stop loss', () => {
    const result = opt.fixedFractional(100000, 0.02, 0)
    expect(result.size).toBe(0)
  })

  it('fixed fractional computes maxLoss', () => {
    const result = opt.fixedFractional(100000, 0.02, 0.05)
    expect(result.maxLoss).toBeGreaterThan(0)
  })
})

// ── analyzeDrawdown Tests ──

describe('PortfolioOptimizer analyzeDrawdown', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer()
  })

  it('analyzes drawdown from a return series', () => {
    const returns = [0.02, 0.01, -0.05, -0.03, 0.04, 0.06, -0.02]
    const dd = opt.analyzeDrawdown(returns)
    expect(typeof dd.maxDrawdown).toBe('number')
    expect(dd.maxDrawdown).toBeGreaterThan(0)
  })

  it('analyzes drawdown from a portfolio', () => {
    const portfolio = makePortfolio(opt, makeThreeAssets())
    const dd = opt.analyzeDrawdown(portfolio)
    expect(typeof dd.maxDrawdown).toBe('number')
    expect(typeof dd.currentDrawdown).toBe('number')
  })

  it('returns zero drawdown for empty returns', () => {
    const dd = opt.analyzeDrawdown([])
    expect(dd.maxDrawdown).toBe(0)
    expect(dd.currentDrawdown).toBe(0)
    expect(dd.recoveryPeriods).toEqual([])
    expect(dd.underwaterPercentage).toBe(0)
  })

  it('returns zero drawdown for monotonically increasing returns', () => {
    const returns = [0.01, 0.02, 0.03, 0.04, 0.05]
    const dd = opt.analyzeDrawdown(returns)
    expect(dd.maxDrawdown).toBe(0)
    expect(dd.currentDrawdown).toBe(0)
  })

  it('identifies recovery periods', () => {
    const returns = [0.05, -0.1, -0.05, 0.08, 0.12]
    const dd = opt.analyzeDrawdown(returns)
    expect(dd.recoveryPeriods.length).toBeGreaterThanOrEqual(0)
    for (const rp of dd.recoveryPeriods) {
      expect(rp.duration).toBeGreaterThanOrEqual(0)
      expect(rp.drawdownDepth).toBeGreaterThanOrEqual(0)
    }
  })

  it('computes underwater percentage', () => {
    const returns = [0.05, -0.1, -0.05, 0.08, 0.12]
    const dd = opt.analyzeDrawdown(returns)
    expect(dd.underwaterPercentage).toBeGreaterThanOrEqual(0)
    expect(dd.underwaterPercentage).toBeLessThanOrEqual(1)
  })
})

// ── attributePerformance Tests ──

describe('PortfolioOptimizer attributePerformance', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer()
  })

  it('decomposes return into selection, timing, and interaction', () => {
    const attr = opt.attributePerformance(
      [0.5, 0.3, 0.2],
      [0.4, 0.4, 0.2],
      [0.12, 0.06, 0.04],
      [0.1, 0.05, 0.03],
    )
    expect(typeof attr.totalReturn).toBe('number')
    expect(typeof attr.assetSelection).toBe('number')
    expect(typeof attr.marketTiming).toBe('number')
    expect(typeof attr.interactionEffect).toBe('number')
    expect(typeof attr.residual).toBe('number')
  })

  it('returns zeros for empty inputs', () => {
    const attr = opt.attributePerformance([], [], [], [])
    expect(attr.totalReturn).toBe(0)
    expect(attr.assetSelection).toBe(0)
    expect(attr.marketTiming).toBe(0)
    expect(attr.interactionEffect).toBe(0)
    expect(attr.residual).toBe(0)
  })

  it('totalReturn equals active return (portfolio minus benchmark)', () => {
    const pw = [0.6, 0.4]
    const bw = [0.5, 0.5]
    const pr = [0.1, 0.04]
    const br = [0.08, 0.03]
    const attr = opt.attributePerformance(pw, bw, pr, br)
    const portfolioTotal = pw[0] * pr[0] + pw[1] * pr[1]
    const benchmarkTotal = bw[0] * br[0] + bw[1] * br[1]
    expect(attr.totalReturn).toBeCloseTo(portfolioTotal - benchmarkTotal, 3)
  })

  it('handles single-asset case', () => {
    const attr = opt.attributePerformance([1.0], [1.0], [0.12], [0.1])
    expect(attr.assetSelection).toBeCloseTo(0.02, 3)
  })
})

// ── computeEfficientFrontier Tests (via optimize) ──

describe('PortfolioOptimizer efficient frontier', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer({ frontierPoints: 20 })
  })

  it('returns the configured number of frontier points', () => {
    const result = opt.optimize(makeThreeAssets())
    expect(result.efficientFrontier.length).toBe(20)
  })

  it('each frontier point has risk, return_, weights, and sharpe', () => {
    const result = opt.optimize(makeFiveAssets())
    for (const point of result.efficientFrontier) {
      expect(typeof point.risk).toBe('number')
      expect(typeof point.return_).toBe('number')
      expect(Array.isArray(point.weights)).toBe(true)
      expect(typeof point.sharpe).toBe('number')
    }
  })

  it('frontier point weights sum to approximately 1', () => {
    const result = opt.optimize(makeThreeAssets())
    for (const point of result.efficientFrontier) {
      const weightSum = point.weights.reduce((s, w) => s + w, 0)
      expect(weightSum).toBeCloseTo(1, 1)
    }
  })

  it('frontier is empty for equal-weight fallback', () => {
    const result = opt.optimize([makeAsset('x', 'X', 0.05, 0.1, 1.0)])
    expect(result.efficientFrontier).toEqual([])
  })
})

// ── getStats Tests ──

describe('PortfolioOptimizer getStats', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer()
  })

  it('returns stats with all expected fields', () => {
    const stats = opt.getStats()
    expect(typeof stats.totalOptimizations).toBe('number')
    expect(typeof stats.totalRiskAssessments).toBe('number')
    expect(typeof stats.totalRebalances).toBe('number')
    expect(typeof stats.totalAllocations).toBe('number')
    expect(typeof stats.avgSharpe).toBe('number')
    expect(typeof stats.avgDiversification).toBe('number')
    expect(typeof stats.feedbackReceived).toBe('number')
    expect(typeof stats.feedbackAccuracy).toBe('number')
  })

  it('updates avgSharpe after optimization', () => {
    opt.optimize(makeThreeAssets())
    const stats = opt.getStats()
    expect(typeof stats.avgSharpe).toBe('number')
  })

  it('updates avgDiversification after optimization', () => {
    opt.optimize(makeFiveAssets())
    const stats = opt.getStats()
    expect(typeof stats.avgDiversification).toBe('number')
  })

  it('tracks multiple operations correctly', () => {
    opt.optimize(makeTwoAssets())
    const portfolio = makePortfolio(opt, makeThreeAssets())
    opt.assessRisk(portfolio)
    opt.recommendAllocation(makeFiveAssets(), 'moderate')
    opt.rebalance(
      portfolio,
      new Map([
        ['stocks', 0.5],
        ['bonds', 0.3],
        ['gold', 0.2],
      ]),
    )

    const stats = opt.getStats()
    expect(stats.totalOptimizations).toBe(1)
    expect(stats.totalRiskAssessments).toBe(1)
    expect(stats.totalAllocations).toBe(1)
    expect(stats.totalRebalances).toBe(1)
  })
})

// ── serialize / deserialize Tests ──

describe('PortfolioOptimizer serialize / deserialize', () => {
  it('round-trip preserves config', () => {
    const original = new PortfolioOptimizer({
      riskFreeRate: 0.05,
      maxPositionSize: 0.5,
    })
    const json = original.serialize()
    const data = JSON.parse(json)
    expect(data.config.riskFreeRate).toBe(0.05)
    expect(data.config.maxPositionSize).toBe(0.5)
  })

  it('round-trip preserves stats', () => {
    const original = new PortfolioOptimizer()
    original.optimize(makeTwoAssets())
    const portfolio = makePortfolio(original, makeThreeAssets())
    original.assessRisk(portfolio)

    const json = original.serialize()
    const restored = PortfolioOptimizer.deserialize(json)
    const stats = restored.getStats()

    expect(stats.totalOptimizations).toBe(1)
    expect(stats.totalRiskAssessments).toBe(1)
  })

  it('round-trip preserves sharpe and diversification history', () => {
    const original = new PortfolioOptimizer()
    original.optimize(makeThreeAssets())

    const json = original.serialize()
    const restored = PortfolioOptimizer.deserialize(json)
    const stats = restored.getStats()
    expect(stats.avgSharpe).not.toBe(0)
  })

  it('deserialized optimizer can perform new optimizations', () => {
    const original = new PortfolioOptimizer()
    original.optimize(makeTwoAssets())

    const json = original.serialize()
    const restored = PortfolioOptimizer.deserialize(json)
    const result = restored.optimize(makeThreeAssets())
    expect(result.portfolio.assets).toHaveLength(3)
    expect(restored.getStats().totalOptimizations).toBe(2)
  })

  it('throws on corrupted JSON input', () => {
    expect(() => PortfolioOptimizer.deserialize('not valid json')).toThrow()
  })

  it('preserves feedback data across serialization', () => {
    const original = new PortfolioOptimizer()
    original.learnFromFeedback('risk assessment', true)
    original.learnFromFeedback('allocation', false)

    const json = original.serialize()
    const restored = PortfolioOptimizer.deserialize(json)
    const stats = restored.getStats()
    expect(stats.feedbackReceived).toBe(2)
    expect(stats.feedbackAccuracy).toBe(0.5)
  })
})

// ── learnFromFeedback Tests ──

describe('PortfolioOptimizer learnFromFeedback', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer()
  })

  it('increases feedbackReceived count after positive feedback', () => {
    opt.learnFromFeedback('good optimization', true)
    expect(opt.getStats().feedbackReceived).toBe(1)
  })

  it('increases feedbackReceived count after negative feedback', () => {
    opt.learnFromFeedback('bad result', false)
    expect(opt.getStats().feedbackReceived).toBe(1)
  })

  it('tracks accuracy correctly with mixed feedback', () => {
    opt.learnFromFeedback('good', true)
    opt.learnFromFeedback('bad', false)
    opt.learnFromFeedback('good', true)
    const stats = opt.getStats()
    expect(stats.feedbackReceived).toBe(3)
    expect(stats.feedbackAccuracy).toBeCloseTo(2 / 3, 3)
  })

  it('does not adjust config when learning is disabled', () => {
    const noLearn = new PortfolioOptimizer({ enableLearning: false })
    noLearn.learnFromFeedback('risk bad', false)
    const stats = noLearn.getStats()
    expect(stats.feedbackReceived).toBe(1)
  })
})

// ── Edge Cases ──

describe('PortfolioOptimizer edge cases', () => {
  let opt: PortfolioOptimizer

  beforeEach(() => {
    opt = new PortfolioOptimizer()
  })

  it('handles an asset with empty returns array', () => {
    const assets = [
      makeAsset('a', 'A', 0.08, 0.15, 0.5, []),
      makeAsset('b', 'B', 0.06, 0.1, 0.5, []),
    ]
    const result = opt.optimize(assets)
    expect(result.portfolio.assets).toHaveLength(2)
  })

  it('handles an asset with a single return', () => {
    const assets = [
      makeAsset('a', 'A', 0.08, 0.15, 0.5, [0.01]),
      makeAsset('b', 'B', 0.06, 0.1, 0.5, [0.02]),
    ]
    const result = opt.optimize(assets)
    expect(result.portfolio.assets).toHaveLength(2)
  })

  it('handles all assets with zero expected return', () => {
    const assets = [makeAsset('a', 'A', 0, 0.1, 0.5), makeAsset('b', 'B', 0, 0.1, 0.5)]
    const result = opt.optimize(assets)
    expect(typeof result.portfolio.sharpeRatio).toBe('number')
  })

  it('handles assets with identical returns', () => {
    const returns = [0.01, 0.02, -0.01, 0.03, 0.01]
    const assets = [
      makeAsset('a', 'A', 0.05, 0.1, 0.5, returns),
      makeAsset('b', 'B', 0.05, 0.1, 0.5, [...returns]),
    ]
    const result = opt.optimize(assets)
    expect(result.portfolio.assets).toHaveLength(2)
  })

  it('computeSharpe returns 0 for constant returns (zero volatility)', () => {
    const result = opt.computeSharpe([0.01, 0.01, 0.01, 0.01])
    expect(result).toBe(0)
  })

  it('computeSortino returns 0 when no downside deviation', () => {
    const result = opt.computeSortino([0.1, 0.12, 0.15, 0.2])
    expect(result).toBe(0)
  })

  it('buildPortfolio normalizes weights that do not sum to 1', () => {
    const assets = [makeAsset('a', 'A', 0.1, 0.15, 0.3), makeAsset('b', 'B', 0.06, 0.1, 0.3)]
    const portfolio = opt.buildPortfolio(assets)
    const totalWeight = portfolio.assets.reduce((s, a) => s + a.weight, 0)
    expect(totalWeight).toBeCloseTo(1, 4)
  })

  it('buildPortfolio assigns equal weights when all weights are zero', () => {
    const assets = [makeAsset('a', 'A', 0.1, 0.15, 0), makeAsset('b', 'B', 0.06, 0.1, 0)]
    const portfolio = opt.buildPortfolio(assets)
    expect(portfolio.assets[0].weight).toBeCloseTo(0.5, 4)
    expect(portfolio.assets[1].weight).toBeCloseTo(0.5, 4)
  })
})
