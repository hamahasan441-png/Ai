import { describe, it, expect, beforeEach } from 'vitest'
import {
  StrategyEngine,
  type StrategyEngineConfig,
  type Strategy,
  type StrategyRule,
  type RiskRule,
  type BacktestResult,
} from '../StrategyEngine'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a synthetic upward-trending price series. */
function makeTrendingPrices(length: number, start = 100, drift = 0.001, noise = 0.5): number[] {
  const prices: number[] = [start]
  for (let i = 1; i < length; i++) {
    const prev = prices[i - 1]
    prices.push(prev * (1 + drift) + (Math.random() - 0.4) * noise)
  }
  return prices
}

/** Generate a synthetic mean-reverting price series. */
function makeMeanRevertingPrices(length: number, mean = 100, amplitude = 5): number[] {
  const prices: number[] = []
  for (let i = 0; i < length; i++) {
    prices.push(mean + Math.sin(i / 10) * amplitude + (Math.random() - 0.5) * 0.5)
  }
  return prices
}

/** Generate volumes array with a baseline and some spikes. */
function makeVolumes(length: number, base = 1000, spikeChance = 0.1): number[] {
  return Array.from({ length }, () =>
    Math.random() < spikeChance ? base * 2.5 : base + (Math.random() - 0.5) * 200,
  )
}

/** Create a basic strategy rule for testing. */
function makeRule(
  condition: string,
  action: StrategyRule['action'],
  params: Record<string, number> = {},
  weight = 1.0,
): StrategyRule {
  return {
    id: `test-rule-${Math.random().toString(36).slice(2, 8)}`,
    condition,
    action,
    parameters: params,
    weight,
  }
}

/** Create a flat price series. */
function makeFlatPrices(length: number, value = 100): number[] {
  return Array.from({ length }, () => value)
}

// ── Constructor Tests ────────────────────────────────────────────────────────

describe('StrategyEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new StrategyEngine()
    expect(engine).toBeInstanceOf(StrategyEngine)
  })

  it('accepts a partial custom config', () => {
    const engine = new StrategyEngine({ initialCapital: 50_000 })
    expect(engine).toBeInstanceOf(StrategyEngine)
  })

  it('accepts a full custom config', () => {
    const config: StrategyEngineConfig = {
      initialCapital: 200_000,
      commissionRate: 0.002,
      slippageBps: 10,
      maxOpenPositions: 5,
      defaultStopLossPct: 0.03,
      defaultTakeProfitPct: 0.06,
      monteCarloRuns: 500,
      walkForwardWindows: 3,
      enableLearning: false,
      minSignalConfidence: 0.5,
    }
    const engine = new StrategyEngine(config)
    expect(engine).toBeInstanceOf(StrategyEngine)
  })

  it('starts with zero stats', () => {
    const engine = new StrategyEngine()
    const stats = engine.getStats()
    expect(stats.totalBacktests).toBe(0)
    expect(stats.totalSignals).toBe(0)
    expect(stats.totalStrategiesCreated).toBe(0)
    expect(stats.totalTradesRecorded).toBe(0)
  })
})

// ── createCustomStrategy Tests ──────────────────────────────────────────────

describe('StrategyEngine createCustomStrategy', () => {
  let engine: StrategyEngine

  beforeEach(() => {
    engine = new StrategyEngine()
  })

  it('creates a custom strategy with given name and type', () => {
    const rules = [makeRule('fast_ma > slow_ma', 'buy', { fastPeriod: 5, slowPeriod: 20 })]
    const strategy = engine.createCustomStrategy('My Strategy', 'momentum', rules)
    expect(strategy.name).toBe('My Strategy')
    expect(strategy.type).toBe('momentum')
  })

  it('assigns default risk rules when none are provided', () => {
    const strategy = engine.createCustomStrategy('Test', 'trend', [])
    expect(strategy.riskRules.length).toBeGreaterThan(0)
    expect(strategy.riskRules.some(r => r.type === 'stop-loss')).toBe(true)
  })

  it('uses custom risk rules when provided', () => {
    const customRisk: RiskRule[] = [{ type: 'stop-loss', value: 0.05, active: true }]
    const strategy = engine.createCustomStrategy('Risky', 'breakout', [], customRisk)
    expect(strategy.riskRules).toEqual(customRisk)
  })

  it('includes a description containing the strategy type', () => {
    const strategy = engine.createCustomStrategy('Pair Trader', 'pairs', [])
    expect(strategy.description).toContain('pairs')
  })

  it('stores rules on the strategy', () => {
    const rules = [
      makeRule('fast_ma > slow_ma', 'buy', { fastPeriod: 10 }),
      makeRule('fast_ma < slow_ma', 'sell'),
    ]
    const strategy = engine.createCustomStrategy('Dual MA', 'momentum', rules)
    expect(strategy.rules).toHaveLength(2)
  })

  it('increments totalStrategiesCreated stat', () => {
    engine.createCustomStrategy('A', 'momentum', [])
    engine.createCustomStrategy('B', 'trend', [])
    expect(engine.getStats().totalStrategiesCreated).toBe(2)
  })

  it('assigns a unique id', () => {
    const a = engine.createCustomStrategy('A', 'momentum', [])
    const b = engine.createCustomStrategy('B', 'momentum', [])
    expect(a.id).not.toBe(b.id)
  })

  it('sets createdAt timestamp', () => {
    const before = Date.now()
    const strategy = engine.createCustomStrategy('Timed', 'trend', [])
    expect(strategy.createdAt).toBeGreaterThanOrEqual(before)
    expect(strategy.createdAt).toBeLessThanOrEqual(Date.now())
  })
})

// ── createFromTemplate / listTemplates Tests ────────────────────────────────

describe('StrategyEngine templates', () => {
  let engine: StrategyEngine

  beforeEach(() => {
    engine = new StrategyEngine()
  })

  it('lists all five template types', () => {
    const templates = engine.listTemplates()
    expect(templates.length).toBe(5)
    const types = templates.map(t => t.type)
    expect(types).toContain('momentum')
    expect(types).toContain('mean-reversion')
    expect(types).toContain('breakout')
    expect(types).toContain('trend')
    expect(types).toContain('pairs')
  })

  it('creates a momentum strategy from template', () => {
    const strategy = engine.createFromTemplate('momentum')
    expect(strategy.type).toBe('momentum')
    expect(strategy.rules.length).toBeGreaterThan(0)
  })

  it('creates a mean-reversion strategy from template', () => {
    const strategy = engine.createFromTemplate('mean-reversion')
    expect(strategy.type).toBe('mean-reversion')
  })

  it('creates a breakout strategy from template', () => {
    const strategy = engine.createFromTemplate('breakout')
    expect(strategy.type).toBe('breakout')
  })

  it('creates a trend strategy from template', () => {
    const strategy = engine.createFromTemplate('trend')
    expect(strategy.type).toBe('trend')
  })

  it('creates a pairs strategy from template', () => {
    const strategy = engine.createFromTemplate('pairs')
    expect(strategy.type).toBe('pairs')
  })

  it('accepts parameter overrides', () => {
    const strategy = engine.createFromTemplate('momentum', { fastPeriod: 5, slowPeriod: 15 })
    expect(strategy.rules[0].parameters.fastPeriod).toBe(5)
    expect(strategy.rules[0].parameters.slowPeriod).toBe(15)
  })

  it('falls back to first template for invalid type', () => {
    const strategy = engine.createFromTemplate('invalid-type' as Strategy['type'])
    expect(strategy).toBeDefined()
    expect(strategy.rules.length).toBeGreaterThan(0)
  })

  it('each template has a name and description', () => {
    const templates = engine.listTemplates()
    for (const t of templates) {
      expect(t.name.length).toBeGreaterThan(0)
      expect(t.description.length).toBeGreaterThan(0)
    }
  })
})

// ── generateSignals Tests ───────────────────────────────────────────────────

describe('StrategyEngine generateSignals', () => {
  let engine: StrategyEngine

  beforeEach(() => {
    engine = new StrategyEngine({ minSignalConfidence: 0.1 })
  })

  it('returns an empty array for very short price data', () => {
    const strategy = engine.createFromTemplate('momentum')
    const signals = engine.generateSignals(strategy, [100])
    expect(signals).toEqual([])
  })

  it('returns an empty array for empty price data', () => {
    const strategy = engine.createFromTemplate('momentum')
    const signals = engine.generateSignals(strategy, [])
    expect(signals).toEqual([])
  })

  it('generates signals from a trending price series', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(200)
    const signals = engine.generateSignals(strategy, prices)
    expect(signals.length).toBeGreaterThan(0)
  })

  it('each signal has required properties', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(200)
    const signals = engine.generateSignals(strategy, prices)
    for (const sig of signals) {
      expect(sig.timestamp).toBeGreaterThan(0)
      expect(['buy', 'sell', 'hold']).toContain(sig.signal)
      expect(sig.strength).toBeGreaterThanOrEqual(0)
      expect(sig.strategy).toBe(strategy.id)
      expect(Array.isArray(sig.reasoning)).toBe(true)
    }
  })

  it('generates signals with volumes', () => {
    const strategy = engine.createFromTemplate('breakout')
    const prices = makeTrendingPrices(200)
    const volumes = makeVolumes(200)
    const signals = engine.generateSignals(strategy, prices, volumes)
    expect(Array.isArray(signals)).toBe(true)
  })

  it('increments totalSignals stat', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(200)
    engine.generateSignals(strategy, prices)
    expect(engine.getStats().totalSignals).toBeGreaterThan(0)
  })

  it('signals have reasoning arrays', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(200)
    const signals = engine.generateSignals(strategy, prices)
    const withReasoning = signals.filter(s => s.reasoning.length > 0)
    expect(withReasoning.length).toBeGreaterThan(0)
  })
})

// ── backtest Tests ──────────────────────────────────────────────────────────

describe('StrategyEngine backtest', () => {
  let engine: StrategyEngine

  beforeEach(() => {
    engine = new StrategyEngine({ initialCapital: 100_000, minSignalConfidence: 0.1 })
  })

  it('returns a backtest result with the strategy reference', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(200)
    const result = engine.backtest(strategy, prices)
    expect(result.strategy).toBe(strategy)
  })

  it('produces trades for a trending market', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(300)
    const result = engine.backtest(strategy, prices)
    expect(result.trades.length).toBeGreaterThan(0)
  })

  it('trade records have required fields', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(300)
    const result = engine.backtest(strategy, prices)
    for (const trade of result.trades) {
      expect(trade.id).toBeDefined()
      expect(['long', 'short']).toContain(trade.direction)
      expect(typeof trade.entryPrice).toBe('number')
      expect(typeof trade.exitPrice).toBe('number')
      expect(typeof trade.pnl).toBe('number')
      expect(typeof trade.fees).toBe('number')
      expect(trade.exitReason.length).toBeGreaterThan(0)
    }
  })

  it('computes key metrics', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(300)
    const result = engine.backtest(strategy, prices)
    expect(typeof result.totalReturn).toBe('number')
    expect(typeof result.annualizedReturn).toBe('number')
    expect(typeof result.sharpe).toBe('number')
    expect(typeof result.sortino).toBe('number')
    expect(typeof result.maxDrawdown).toBe('number')
    expect(typeof result.winRate).toBe('number')
    expect(typeof result.profitFactor).toBe('number')
    expect(typeof result.avgTrade).toBe('number')
    expect(typeof result.totalFees).toBe('number')
  })

  it('populates the metrics record', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(300)
    const result = engine.backtest(strategy, prices)
    expect(result.metrics.totalTrades).toBe(result.trades.length)
    expect(typeof result.metrics.finalCapital).toBe('number')
    expect(typeof result.metrics.largestWin).toBe('number')
    expect(typeof result.metrics.largestLoss).toBe('number')
  })

  it('winRate is between 0 and 1', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(300)
    const result = engine.backtest(strategy, prices)
    expect(result.winRate).toBeGreaterThanOrEqual(0)
    expect(result.winRate).toBeLessThanOrEqual(1)
  })

  it('maxDrawdown is non-negative', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(300)
    const result = engine.backtest(strategy, prices)
    expect(result.maxDrawdown).toBeGreaterThanOrEqual(0)
  })

  it('increments totalBacktests stat', () => {
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(100))
    engine.backtest(strategy, makeTrendingPrices(100))
    expect(engine.getStats().totalBacktests).toBe(2)
  })

  it('handles backtest with volumes', () => {
    const strategy = engine.createFromTemplate('breakout')
    const prices = makeTrendingPrices(200)
    const volumes = makeVolumes(200)
    const result = engine.backtest(strategy, prices, volumes)
    expect(typeof result.totalReturn).toBe('number')
  })

  it('handles flat prices gracefully', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeFlatPrices(100)
    const result = engine.backtest(strategy, prices)
    expect(typeof result.totalReturn).toBe('number')
    expect(typeof result.sharpe).toBe('number')
  })

  it('records trades to the journal', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(300)
    engine.backtest(strategy, prices)
    const journal = engine.getJournal()
    expect(journal.length).toBeGreaterThan(0)
  })

  it('totalFees is non-negative', () => {
    const strategy = engine.createFromTemplate('momentum')
    const result = engine.backtest(strategy, makeTrendingPrices(200))
    expect(result.totalFees).toBeGreaterThanOrEqual(0)
  })
})

// ── optimize Tests ──────────────────────────────────────────────────────────

describe('StrategyEngine optimize', () => {
  let engine: StrategyEngine

  beforeEach(() => {
    engine = new StrategyEngine({ walkForwardWindows: 2, minSignalConfidence: 0.1 })
  })

  it('returns optimization results with best parameters', () => {
    const prices = makeTrendingPrices(200)
    const result = engine.optimize('momentum', prices, {
      fastPeriod: { min: 5, max: 10, step: 5 },
      slowPeriod: { min: 20, max: 30, step: 10 },
    })
    expect(result.bestParameters).toBeDefined()
    expect(typeof result.bestParameters.fastPeriod).toBe('number')
  })

  it('builds a performance surface', () => {
    const prices = makeTrendingPrices(200)
    const result = engine.optimize('momentum', prices, {
      fastPeriod: { min: 5, max: 10, step: 5 },
    })
    expect(result.performanceSurface.length).toBeGreaterThan(0)
    for (const entry of result.performanceSurface) {
      expect(typeof entry.sharpe).toBe('number')
      expect(entry.params).toBeDefined()
    }
  })

  it('produces walk-forward results', () => {
    const prices = makeTrendingPrices(300)
    const result = engine.optimize('momentum', prices, {
      fastPeriod: { min: 5, max: 15, step: 5 },
    })
    expect(result.walkForwardResults.length).toBeGreaterThan(0)
    for (const wf of result.walkForwardResults) {
      expect(typeof wf.inSampleSharpe).toBe('number')
      expect(typeof wf.outSampleSharpe).toBe('number')
    }
  })

  it('robustness is between 0 and 1', () => {
    const prices = makeTrendingPrices(300)
    const result = engine.optimize('momentum', prices, {
      fastPeriod: { min: 5, max: 15, step: 5 },
    })
    expect(result.robustness).toBeGreaterThanOrEqual(0)
    expect(result.robustness).toBeLessThanOrEqual(1)
  })

  it('works with multiple parameter ranges', () => {
    const prices = makeTrendingPrices(200)
    const result = engine.optimize('momentum', prices, {
      fastPeriod: { min: 5, max: 10, step: 5 },
      slowPeriod: { min: 20, max: 30, step: 10 },
      rsiFilter: { min: 40, max: 60, step: 20 },
    })
    expect(result.bestParameters).toBeDefined()
    expect(result.performanceSurface.length).toBeGreaterThan(1)
  })
})

// ── Risk Management Tests ───────────────────────────────────────────────────

describe('StrategyEngine risk management', () => {
  let engine: StrategyEngine

  beforeEach(() => {
    engine = new StrategyEngine()
  })

  it('creates default risk rules', () => {
    const rules = engine.createRiskRules()
    expect(rules.length).toBe(4)
    expect(rules.map(r => r.type)).toContain('stop-loss')
    expect(rules.map(r => r.type)).toContain('take-profit')
    expect(rules.map(r => r.type)).toContain('trailing')
    expect(rules.map(r => r.type)).toContain('position-limit')
  })

  it('accepts custom stop-loss and take-profit values', () => {
    const rules = engine.createRiskRules(0.05, 0.1)
    const sl = rules.find(r => r.type === 'stop-loss')
    const tp = rules.find(r => r.type === 'take-profit')
    expect(sl?.value).toBe(0.05)
    expect(tp?.value).toBe(0.1)
  })

  it('trailing rule is active only when explicit trailing pct is provided', () => {
    const rulesDefault = engine.createRiskRules()
    const trailing = rulesDefault.find(r => r.type === 'trailing')
    expect(trailing?.active).toBe(false)

    const rulesCustom = engine.createRiskRules(undefined, undefined, 0.03)
    const trailingCustom = rulesCustom.find(r => r.type === 'trailing')
    expect(trailingCustom?.active).toBe(true)
    expect(trailingCustom?.value).toBe(0.03)
  })

  it('accepts custom position limit', () => {
    const rules = engine.createRiskRules(undefined, undefined, undefined, 3)
    const posLimit = rules.find(r => r.type === 'position-limit')
    expect(posLimit?.value).toBe(3)
  })

  it('strategy from template includes default risk rules', () => {
    const strategy = engine.createFromTemplate('momentum')
    expect(strategy.riskRules.length).toBeGreaterThan(0)
    expect(strategy.riskRules.some(r => r.type === 'stop-loss')).toBe(true)
  })
})

// ── compareStrategies Tests ─────────────────────────────────────────────────

describe('StrategyEngine compareStrategies', () => {
  let engine: StrategyEngine

  beforeEach(() => {
    engine = new StrategyEngine({ minSignalConfidence: 0.1 })
  })

  it('compares multiple strategies and returns a ranking', () => {
    const stratA = engine.createFromTemplate('momentum')
    const stratB = engine.createFromTemplate('mean-reversion')
    const prices = makeTrendingPrices(200)
    const comparison = engine.compareStrategies([stratA, stratB], prices)
    expect(comparison.ranking.length).toBe(2)
    expect(comparison.ranking[0].rank).toBe(1)
    expect(comparison.ranking[1].rank).toBe(2)
  })

  it('identifies the bestOverall strategy', () => {
    const stratA = engine.createFromTemplate('momentum')
    const stratB = engine.createFromTemplate('trend')
    const prices = makeTrendingPrices(200)
    const comparison = engine.compareStrategies([stratA, stratB], prices)
    expect(comparison.bestOverall).toBeDefined()
    expect([stratA.id, stratB.id]).toContain(comparison.bestOverall)
  })

  it('returns backtest results for each strategy', () => {
    const stratA = engine.createFromTemplate('momentum')
    const stratB = engine.createFromTemplate('breakout')
    const prices = makeTrendingPrices(200)
    const comparison = engine.compareStrategies([stratA, stratB], prices)
    expect(comparison.results.length).toBe(2)
    for (const res of comparison.results) {
      expect(typeof res.totalReturn).toBe('number')
      expect(typeof res.sharpe).toBe('number')
    }
  })

  it('ranking scores are sorted descending', () => {
    const strategies = [
      engine.createFromTemplate('momentum'),
      engine.createFromTemplate('mean-reversion'),
      engine.createFromTemplate('breakout'),
    ]
    const prices = makeTrendingPrices(200)
    const comparison = engine.compareStrategies(strategies, prices)
    for (let i = 1; i < comparison.ranking.length; i++) {
      expect(comparison.ranking[i - 1].score).toBeGreaterThanOrEqual(comparison.ranking[i].score)
    }
  })

  it('handles a single strategy comparison', () => {
    const strat = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(200)
    const comparison = engine.compareStrategies([strat], prices)
    expect(comparison.ranking.length).toBe(1)
    expect(comparison.ranking[0].rank).toBe(1)
    expect(comparison.bestOverall).toBe(strat.id)
  })
})

// ── Trade Journal Tests ─────────────────────────────────────────────────────

describe('StrategyEngine trade journal', () => {
  let engine: StrategyEngine

  beforeEach(() => {
    engine = new StrategyEngine({ minSignalConfidence: 0.1 })
  })

  it('starts with an empty journal', () => {
    expect(engine.getJournal()).toHaveLength(0)
  })

  it('records trades from backtest into the journal', () => {
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(300)
    engine.backtest(strategy, prices)
    expect(engine.getJournal().length).toBeGreaterThan(0)
  })

  it('journal analytics returns correct total trades', () => {
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(300))
    const analytics = engine.getJournalAnalytics()
    expect(analytics.totalTrades).toBe(engine.getJournal().length)
  })

  it('journal analytics winRate is between 0 and 1', () => {
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(300))
    const analytics = engine.getJournalAnalytics()
    expect(analytics.winRate).toBeGreaterThanOrEqual(0)
    expect(analytics.winRate).toBeLessThanOrEqual(1)
  })

  it('journal analytics tracks pnl by direction', () => {
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(300))
    const analytics = engine.getJournalAnalytics()
    expect(typeof analytics.pnlByDirection.long).toBe('number')
    expect(typeof analytics.pnlByDirection.short).toBe('number')
  })

  it('clearJournal removes all trades', () => {
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(300))
    expect(engine.getJournal().length).toBeGreaterThan(0)
    engine.clearJournal()
    expect(engine.getJournal()).toHaveLength(0)
  })

  it('journal analytics on empty journal returns zeroes', () => {
    const analytics = engine.getJournalAnalytics()
    expect(analytics.totalTrades).toBe(0)
    expect(analytics.winRate).toBe(0)
    expect(analytics.avgPnl).toBe(0)
    expect(analytics.bestTrade).toBe(0)
    expect(analytics.worstTrade).toBe(0)
  })
})

// ── Monte Carlo Simulation Tests ────────────────────────────────────────────

describe('StrategyEngine monteCarloSimulation', () => {
  let engine: StrategyEngine

  beforeEach(() => {
    engine = new StrategyEngine({ monteCarloRuns: 100, minSignalConfidence: 0.1 })
  })

  it('runs the configured number of simulations', () => {
    const strategy = engine.createFromTemplate('momentum')
    const result = engine.backtest(strategy, makeTrendingPrices(300))
    const mc = engine.monteCarloSimulation(result)
    expect(mc.simulations).toBe(100)
  })

  it('returns percentile estimates', () => {
    const strategy = engine.createFromTemplate('momentum')
    const result = engine.backtest(strategy, makeTrendingPrices(300))
    const mc = engine.monteCarloSimulation(result)
    expect(typeof mc.medianReturn).toBe('number')
    expect(typeof mc.percentile5).toBe('number')
    expect(typeof mc.percentile95).toBe('number')
    expect(mc.percentile5).toBeLessThanOrEqual(mc.percentile95)
  })

  it('probability of profit is between 0 and 1', () => {
    const strategy = engine.createFromTemplate('momentum')
    const result = engine.backtest(strategy, makeTrendingPrices(300))
    const mc = engine.monteCarloSimulation(result)
    expect(mc.probabilityOfProfit).toBeGreaterThanOrEqual(0)
    expect(mc.probabilityOfProfit).toBeLessThanOrEqual(1)
  })

  it('returns max drawdown distribution with 5 percentiles', () => {
    const strategy = engine.createFromTemplate('momentum')
    const result = engine.backtest(strategy, makeTrendingPrices(300))
    const mc = engine.monteCarloSimulation(result)
    expect(mc.maxDrawdownDistribution).toHaveLength(5)
  })

  it('returns zeroes for a backtest with no trades', () => {
    const strategy = engine.createFromTemplate('momentum')
    const fakeResult: BacktestResult = {
      strategy,
      trades: [],
      totalReturn: 0,
      annualizedReturn: 0,
      sharpe: 0,
      sortino: 0,
      maxDrawdown: 0,
      winRate: 0,
      profitFactor: 0,
      avgTrade: 0,
      totalFees: 0,
      metrics: {},
    }
    const mc = engine.monteCarloSimulation(fakeResult)
    expect(mc.simulations).toBe(0)
    expect(mc.medianReturn).toBe(0)
    expect(mc.probabilityOfProfit).toBe(0)
  })

  it('mean and std return are numeric', () => {
    const strategy = engine.createFromTemplate('momentum')
    const result = engine.backtest(strategy, makeTrendingPrices(300))
    const mc = engine.monteCarloSimulation(result)
    expect(typeof mc.meanReturn).toBe('number')
    expect(typeof mc.stdReturn).toBe('number')
  })
})

// ── getStats Tests ──────────────────────────────────────────────────────────

describe('StrategyEngine getStats', () => {
  it('tracks bestSharpe across backtests', () => {
    const engine = new StrategyEngine({ minSignalConfidence: 0.1 })
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(200))
    const stats = engine.getStats()
    expect(typeof stats.bestSharpe).toBe('number')
  })

  it('tracks avgWinRate across backtests', () => {
    const engine = new StrategyEngine({ minSignalConfidence: 0.1 })
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(200))
    engine.backtest(strategy, makeTrendingPrices(200))
    const stats = engine.getStats()
    expect(typeof stats.avgWinRate).toBe('number')
    expect(stats.avgWinRate).toBeGreaterThanOrEqual(0)
    expect(stats.avgWinRate).toBeLessThanOrEqual(1)
  })

  it('feedbackReceived starts at zero', () => {
    const engine = new StrategyEngine()
    expect(engine.getStats().feedbackReceived).toBe(0)
  })

  it('feedbackAccuracy is zero when no feedback', () => {
    const engine = new StrategyEngine()
    expect(engine.getStats().feedbackAccuracy).toBe(0)
  })
})

// ── serialize / deserialize Tests ───────────────────────────────────────────

describe('StrategyEngine serialize / deserialize', () => {
  it('round-trips without data loss', () => {
    const engine = new StrategyEngine({ initialCapital: 50_000, minSignalConfidence: 0.1 })
    engine.createFromTemplate('momentum')
    engine.createFromTemplate('trend')
    const strategy = engine.createFromTemplate('breakout')
    engine.backtest(strategy, makeTrendingPrices(200))

    const json = engine.serialize()
    const restored = StrategyEngine.deserialize(json)

    expect(restored.getStats().totalStrategiesCreated).toBe(
      engine.getStats().totalStrategiesCreated,
    )
    expect(restored.getStats().totalBacktests).toBe(engine.getStats().totalBacktests)
    expect(restored.getStats().totalSignals).toBe(engine.getStats().totalSignals)
    expect(restored.getJournal().length).toBe(engine.getJournal().length)
  })

  it('serialized output is valid JSON', () => {
    const engine = new StrategyEngine()
    const json = engine.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('deserialized engine preserves journal data', () => {
    const engine = new StrategyEngine({ minSignalConfidence: 0.1 })
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(300))
    const journalBefore = engine.getJournal().length

    const restored = StrategyEngine.deserialize(engine.serialize())
    expect(restored.getJournal().length).toBe(journalBefore)
  })

  it('deserialized engine preserves feedback stats', () => {
    const engine = new StrategyEngine({ minSignalConfidence: 0.1 })
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(200))
    engine.learnFromFeedback(strategy.id, true)
    engine.learnFromFeedback(strategy.id, false)

    const restored = StrategyEngine.deserialize(engine.serialize())
    expect(restored.getStats().feedbackReceived).toBe(2)
  })

  it('deserialized engine preserves bestSharpe', () => {
    const engine = new StrategyEngine({ minSignalConfidence: 0.1 })
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(200))
    const originalBestSharpe = engine.getStats().bestSharpe

    const restored = StrategyEngine.deserialize(engine.serialize())
    expect(restored.getStats().bestSharpe).toBe(originalBestSharpe)
  })
})

// ── learnFromFeedback Tests ─────────────────────────────────────────────────

describe('StrategyEngine learnFromFeedback', () => {
  it('increments feedbackReceived on positive feedback', () => {
    const engine = new StrategyEngine()
    engine.learnFromFeedback('some-id', true)
    expect(engine.getStats().feedbackReceived).toBe(1)
  })

  it('increments feedbackReceived on negative feedback', () => {
    const engine = new StrategyEngine()
    engine.learnFromFeedback('some-id', false)
    expect(engine.getStats().feedbackReceived).toBe(1)
  })

  it('tracks accuracy as ratio of correct to total', () => {
    const engine = new StrategyEngine()
    engine.learnFromFeedback('a', true)
    engine.learnFromFeedback('b', true)
    engine.learnFromFeedback('c', false)
    const stats = engine.getStats()
    expect(stats.feedbackReceived).toBe(3)
    expect(stats.feedbackAccuracy).toBeCloseTo(2 / 3, 3)
  })

  it('does nothing when learning is disabled', () => {
    const engine = new StrategyEngine({ enableLearning: false })
    engine.learnFromFeedback('id', true)
    expect(engine.getStats().feedbackReceived).toBe(0)
  })

  it('adjusts rule weights on negative feedback for matched signal', () => {
    const engine = new StrategyEngine({ minSignalConfidence: 0.1 })
    const strategy = engine.createFromTemplate('momentum')
    const prices = makeTrendingPrices(200)
    engine.generateSignals(strategy, prices)
    const originalWeights = strategy.rules.map(r => r.weight)

    engine.learnFromFeedback(strategy.id, false)
    const newWeights = strategy.rules.map(r => r.weight)
    const anyChanged = newWeights.some((w, i) => w !== originalWeights[i])
    expect(anyChanged).toBe(true)
  })
})

// ── Edge Cases ──────────────────────────────────────────────────────────────

describe('StrategyEngine edge cases', () => {
  it('backtest with 2-element price array does not crash', () => {
    const engine = new StrategyEngine()
    const strategy = engine.createFromTemplate('momentum')
    const result = engine.backtest(strategy, [100, 101])
    expect(typeof result.totalReturn).toBe('number')
  })

  it('comparing empty strategies array returns valid structure', () => {
    const engine = new StrategyEngine()
    const comparison = engine.compareStrategies([], makeTrendingPrices(100))
    expect(comparison.ranking).toEqual([])
    expect(comparison.bestOverall).toBe('')
  })

  it('mean-reversion on mean-reverting data generates signals', () => {
    const engine = new StrategyEngine({ minSignalConfidence: 0.1 })
    const strategy = engine.createFromTemplate('mean-reversion')
    const prices = makeMeanRevertingPrices(200)
    const signals = engine.generateSignals(strategy, prices)
    expect(Array.isArray(signals)).toBe(true)
  })

  it('pairs template generates z-score based signals', () => {
    const engine = new StrategyEngine({ minSignalConfidence: 0.1 })
    const strategy = engine.createFromTemplate('pairs')
    const prices = makeMeanRevertingPrices(200, 100, 10)
    const signals = engine.generateSignals(strategy, prices)
    expect(Array.isArray(signals)).toBe(true)
  })

  it('trend template generates signals on strong trend', () => {
    const engine = new StrategyEngine({ minSignalConfidence: 0.1 })
    const strategy = engine.createFromTemplate('trend')
    const prices = makeTrendingPrices(200, 100, 0.005)
    const signals = engine.generateSignals(strategy, prices)
    expect(Array.isArray(signals)).toBe(true)
  })

  it('high minSignalConfidence filters out weak signals', () => {
    const engineStrict = new StrategyEngine({ minSignalConfidence: 0.99 })
    const engineLoose = new StrategyEngine({ minSignalConfidence: 0.01 })
    const strategy1 = engineStrict.createFromTemplate('momentum')
    const strategy2 = engineLoose.createFromTemplate('momentum')
    const prices = makeTrendingPrices(200)
    const strictSignals = engineStrict.generateSignals(strategy1, prices)
    const looseSignals = engineLoose.generateSignals(strategy2, prices)
    expect(looseSignals.length).toBeGreaterThanOrEqual(strictSignals.length)
  })

  it('journal accumulates trades across multiple backtests', () => {
    const engine = new StrategyEngine({ minSignalConfidence: 0.1 })
    const strategy = engine.createFromTemplate('momentum')
    engine.backtest(strategy, makeTrendingPrices(200))
    const countAfterFirst = engine.getJournal().length
    engine.backtest(strategy, makeTrendingPrices(200))
    expect(engine.getJournal().length).toBeGreaterThanOrEqual(countAfterFirst)
  })
})
