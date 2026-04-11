/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          📊  S T R A T E G Y   E N G I N E                                  ║
 * ║                                                                             ║
 * ║   Trading strategy generation, backtesting, and optimization:               ║
 * ║     build → signal → backtest → optimize → compare                          ║
 * ║                                                                             ║
 * ║     • Pre-built strategy templates (momentum, mean-reversion, etc.)         ║
 * ║     • Backtesting framework with comprehensive metrics                      ║
 * ║     • Signal generation with confidence scoring                             ║
 * ║     • Walk-forward parameter optimization                                   ║
 * ║     • Risk management rules (stop-loss, take-profit, trailing)              ║
 * ║     • Strategy comparison and ranking                                       ║
 * ║     • Trade journal with analytics                                          ║
 * ║     • Monte Carlo simulation for probability estimates                      ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface StrategyEngineConfig {
  initialCapital: number
  commissionRate: number
  slippageBps: number
  maxOpenPositions: number
  defaultStopLossPct: number
  defaultTakeProfitPct: number
  monteCarloRuns: number
  walkForwardWindows: number
  enableLearning: boolean
  minSignalConfidence: number
}

export interface StrategyEngineStats {
  totalBacktests: number
  totalSignals: number
  totalStrategiesCreated: number
  bestSharpe: number
  avgWinRate: number
  totalTradesRecorded: number
  feedbackReceived: number
  feedbackAccuracy: number
}

export interface StrategyRule {
  id: string
  condition: string
  action: 'buy' | 'sell' | 'hold'
  parameters: Record<string, number>
  weight: number
}

export interface Strategy {
  id: string
  name: string
  rules: StrategyRule[]
  description: string
  type: 'momentum' | 'mean-reversion' | 'breakout' | 'trend' | 'pairs'
  riskRules: RiskRule[]
  createdAt: number
}

export interface BacktestResult {
  strategy: Strategy
  trades: TradeRecord[]
  totalReturn: number
  annualizedReturn: number
  sharpe: number
  sortino: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  avgTrade: number
  totalFees: number
  metrics: Record<string, number>
}

export interface TradeRecord {
  id: string
  entryTime: number
  exitTime: number
  entryPrice: number
  exitPrice: number
  direction: 'long' | 'short'
  quantity: number
  pnl: number
  fees: number
  exitReason: string
}

export interface SignalEvent {
  timestamp: number
  signal: 'buy' | 'sell' | 'hold'
  strength: number
  strategy: string
  reasoning: string[]
}

export interface RiskRule {
  type: 'stop-loss' | 'take-profit' | 'trailing' | 'position-limit'
  value: number
  active: boolean
}

export interface StrategyComparison {
  strategies: Strategy[]
  results: BacktestResult[]
  ranking: Array<{ strategyId: string; rank: number; score: number }>
  bestOverall: string
}

export interface MonteCarloResult {
  simulations: number
  medianReturn: number
  percentile5: number
  percentile95: number
  probabilityOfProfit: number
  maxDrawdownDistribution: number[]
  meanReturn: number
  stdReturn: number
}

export interface StrategyOptimizationResult {
  bestParameters: Record<string, number>
  performanceSurface: Array<{ params: Record<string, number>; sharpe: number }>
  walkForwardResults: Array<{ window: number; inSampleSharpe: number; outSampleSharpe: number }>
  robustness: number
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: StrategyEngineConfig = {
  initialCapital: 100_000,
  commissionRate: 0.001,
  slippageBps: 5,
  maxOpenPositions: 10,
  defaultStopLossPct: 0.02,
  defaultTakeProfitPct: 0.04,
  monteCarloRuns: 1000,
  walkForwardWindows: 5,
  enableLearning: true,
  minSignalConfidence: 0.3,
}

const ANNUALIZATION_FACTOR = 252

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
function round2(n: number): number {
  return Math.round(n * 100) / 100
}
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function mean(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length
}

function stddev(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(variance)
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower)
}

function sma(data: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
      continue
    }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += data[j]
    result.push(sum / period)
  }
  return result
}

function ema(data: number[], period: number): number[] {
  const result: number[] = []
  const k = 2 / (period + 1)
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[0])
      continue
    }
    result.push(data[i] * k + result[i - 1] * (1 - k))
  }
  return result
}

function rsi(data: number[], period: number): number[] {
  const result: number[] = []
  const gains: number[] = []
  const losses: number[] = []

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(50)
      continue
    }
    const change = data[i] - data[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? -change : 0)

    if (gains.length < period) {
      result.push(50)
      continue
    }

    const avgGain = gains.slice(-period).reduce((s, v) => s + v, 0) / period
    const avgLoss = losses.slice(-period).reduce((s, v) => s + v, 0) / period

    if (avgLoss === 0) {
      result.push(100)
      continue
    }
    const rs = avgGain / avgLoss
    result.push(round2(100 - 100 / (1 + rs)))
  }
  return result
}

function bollingerBands(
  data: number[],
  period: number,
  mult: number,
): {
  upper: number[]
  middle: number[]
  lower: number[]
} {
  const middle = sma(data, period)
  const upper: number[] = []
  const lower: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN)
      lower.push(NaN)
      continue
    }
    const sd = stddev(data.slice(i - period + 1, i + 1))
    upper.push(middle[i] + mult * sd)
    lower.push(middle[i] - mult * sd)
  }
  return { upper, middle, lower }
}

function maxDrawdown(equityCurve: number[]): number {
  let peak = equityCurve[0] || 0
  let maxDD = 0
  for (const val of equityCurve) {
    if (val > peak) peak = val
    const dd = peak > 0 ? (peak - val) / peak : 0
    if (dd > maxDD) maxDD = dd
  }
  return round4(maxDD)
}

function sharpeRatio(returns: number[], riskFreeRate = 0): number {
  if (returns.length < 2) return 0
  const excessReturns = returns.map(r => r - riskFreeRate / ANNUALIZATION_FACTOR)
  const m = mean(excessReturns)
  const sd = stddev(excessReturns)
  if (sd === 0) return 0
  return round4((m / sd) * Math.sqrt(ANNUALIZATION_FACTOR))
}

function sortinoRatio(returns: number[], riskFreeRate = 0): number {
  if (returns.length < 2) return 0
  const excessReturns = returns.map(r => r - riskFreeRate / ANNUALIZATION_FACTOR)
  const m = mean(excessReturns)
  const downsideReturns = excessReturns.filter(r => r < 0)
  if (downsideReturns.length === 0) return m > 0 ? 10 : 0
  const downsideDev = Math.sqrt(
    downsideReturns.reduce((s, r) => s + r * r, 0) / downsideReturns.length,
  )
  if (downsideDev === 0) return 0
  return round4((m / downsideDev) * Math.sqrt(ANNUALIZATION_FACTOR))
}

// ── Strategy Templates ──────────────────────────────────────────────────────

interface StrategyTemplate {
  name: string
  type: Strategy['type']
  description: string
  defaultParams: Record<string, number>
  buildRules(params: Record<string, number>): StrategyRule[]
}

function makeRule(
  cond: string,
  action: StrategyRule['action'],
  params: Record<string, number>,
  weight = 1.0,
): StrategyRule {
  return { id: generateId('r'), condition: cond, action, parameters: params, weight }
}

function buildStrategyTemplates(): StrategyTemplate[] {
  return [
    {
      name: 'Dual Moving Average Momentum',
      type: 'momentum',
      description: 'Buy when fast MA crosses above slow MA; sell on cross below',
      defaultParams: { fastPeriod: 10, slowPeriod: 30, rsiFilter: 50 },
      buildRules: p => [
        makeRule('fast_ma > slow_ma AND rsi > rsiFilter', 'buy', p),
        makeRule('fast_ma < slow_ma OR rsi < 30', 'sell', p),
      ],
    },
    {
      name: 'Bollinger Mean Reversion',
      type: 'mean-reversion',
      description: 'Buy at lower Bollinger Band, sell at upper; price reverts to mean',
      defaultParams: { period: 20, multiplier: 2, rsiOversold: 30, rsiOverbought: 70 },
      buildRules: p => [
        makeRule('price <= lower_band AND rsi < rsiOversold', 'buy', p),
        makeRule('price >= upper_band AND rsi > rsiOverbought', 'sell', p),
      ],
    },
    {
      name: 'Channel Breakout',
      type: 'breakout',
      description: 'Buy on breakout above N-period high; sell on break below N-period low',
      defaultParams: { lookbackPeriod: 20, atrMultiplier: 1.5, volumeThreshold: 1.2 },
      buildRules: p => [
        makeRule('price > highest_high AND volume > avg_volume * volumeThreshold', 'buy', p),
        makeRule('price < lowest_low', 'sell', p),
      ],
    },
    {
      name: 'Trend Following EMA',
      type: 'trend',
      description: 'Ride trends using EMA alignment and ADX-like strength filter',
      defaultParams: { shortEma: 8, medEma: 21, longEma: 55, trendStrength: 0.02 },
      buildRules: p => [
        makeRule('ema_short > ema_med > ema_long AND trend_strength > trendStrength', 'buy', p),
        makeRule('ema_short < ema_med', 'sell', p),
      ],
    },
    {
      name: 'Pairs Mean Reversion',
      type: 'pairs',
      description: 'Trade the spread between two correlated assets when it diverges',
      defaultParams: { spreadPeriod: 30, entryZScore: 2.0, exitZScore: 0.5 },
      buildRules: p => [
        makeRule('z_score < -entryZScore', 'buy', p),
        makeRule('z_score > entryZScore', 'sell', p),
        makeRule('abs(z_score) < exitZScore', 'hold', p, 0.5),
      ],
    },
  ]
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class StrategyEngine {
  private readonly config: StrategyEngineConfig
  private readonly templates: StrategyTemplate[]
  private strategies: Strategy[] = []
  private journal: TradeRecord[] = []
  private signals: SignalEvent[] = []
  private totalBacktests = 0
  private totalSignals = 0
  private bestSharpe = 0
  private winRates: number[] = []
  private feedbackCorrect = 0
  private feedbackTotal = 0

  constructor(config?: Partial<StrategyEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.templates = buildStrategyTemplates()
  }

  // ── Strategy Creation ─────────────────────────────────────────────────────

  /** Create a strategy from a pre-built template. */
  createFromTemplate(type: Strategy['type'], overrides?: Record<string, number>): Strategy {
    const tpl = this.templates.find(t => t.type === type)
    if (!tpl) {
      const fallback = this.templates[0]
      const params = { ...fallback.defaultParams, ...overrides }
      return this.registerStrategy(fallback, params)
    }
    const params = { ...tpl.defaultParams, ...overrides }
    return this.registerStrategy(tpl, params)
  }

  /** Create a fully custom strategy with user-defined rules. */
  createCustomStrategy(
    name: string,
    type: Strategy['type'],
    rules: StrategyRule[],
    riskRules?: RiskRule[],
  ): Strategy {
    const strategy: Strategy = {
      id: generateId('strat'),
      name,
      rules,
      description: `Custom ${type} strategy: ${name}`,
      type,
      riskRules: riskRules ?? this.defaultRiskRules(),
      createdAt: Date.now(),
    }
    this.strategies.push(strategy)
    return strategy
  }

  /** List all available template types. */
  listTemplates(): Array<{ type: Strategy['type']; name: string; description: string }> {
    return this.templates.map(t => ({
      type: t.type,
      name: t.name,
      description: t.description,
    }))
  }

  // ── Signal Generation ─────────────────────────────────────────────────────

  /** Generate trading signals from a strategy against price data. */
  generateSignals(strategy: Strategy, prices: number[], volumes?: number[]): SignalEvent[] {
    const events: SignalEvent[] = []
    if (prices.length < 2) return events

    const fastMa = sma(prices, strategy.rules[0]?.parameters.fastPeriod ?? 10)
    const slowMa = sma(prices, strategy.rules[0]?.parameters.slowPeriod ?? 30)
    const rsiValues = rsi(prices, 14)
    const bb = bollingerBands(prices, 20, 2)
    const emaShort = ema(prices, strategy.rules[0]?.parameters.shortEma ?? 8)
    const emaMed = ema(prices, strategy.rules[0]?.parameters.medEma ?? 21)
    const emaLong = ema(prices, strategy.rules[0]?.parameters.longEma ?? 55)
    const avgVolume = volumes ? mean(volumes) : 0

    for (let i = 1; i < prices.length; i++) {
      const reasoning: string[] = []
      let buyScore = 0
      let sellScore = 0
      let totalWeight = 0

      for (const rule of strategy.rules) {
        totalWeight += rule.weight
        const fired = this.evaluateRule(rule, {
          price: prices[i],
          prevPrice: prices[i - 1],
          fastMa: fastMa[i],
          slowMa: slowMa[i],
          rsi: rsiValues[i],
          upperBand: bb.upper[i],
          lowerBand: bb.lower[i],
          emaShort: emaShort[i],
          emaMed: emaMed[i],
          emaLong: emaLong[i],
          volume: volumes ? volumes[i] : 0,
          avgVolume,
          index: i,
          prices,
        })

        if (fired) {
          reasoning.push(`Rule "${rule.condition}" triggered → ${rule.action}`)
          if (rule.action === 'buy') buyScore += rule.weight
          else if (rule.action === 'sell') sellScore += rule.weight
        }
      }

      const netScore = totalWeight > 0 ? (buyScore - sellScore) / totalWeight : 0
      const strength = round4(Math.abs(netScore))

      if (strength >= this.config.minSignalConfidence) {
        const event: SignalEvent = {
          timestamp: i,
          signal: netScore > 0 ? 'buy' : 'sell',
          strength,
          strategy: strategy.id,
          reasoning,
        }
        events.push(event)
        this.signals.push(event)
        this.totalSignals++
      }
    }

    return events
  }

  // ── Backtesting Framework ─────────────────────────────────────────────────

  /** Backtest a strategy against historical price data. */
  backtest(strategy: Strategy, prices: number[], volumes?: number[]): BacktestResult {
    this.totalBacktests++
    const trades: TradeRecord[] = []
    let capital = this.config.initialCapital
    let position: {
      direction: 'long' | 'short'
      entryPrice: number
      entryTime: number
      quantity: number
      trailingStop: number
    } | null = null
    const equityCurve: number[] = [capital]
    const dailyReturns: number[] = []
    let totalFees = 0

    const signals = this.generateSignals(strategy, prices, volumes)
    const signalMap = new Map<number, SignalEvent>()
    for (const sig of signals) signalMap.set(sig.timestamp, sig)

    for (let i = 1; i < prices.length; i++) {
      const sig = signalMap.get(i)
      const price = prices[i]
      const slippage = price * (this.config.slippageBps / 10000)

      if (position) {
        const exitReason = this.checkRiskRules(strategy.riskRules, position, price)
        if (exitReason) {
          const ep = position.direction === 'long' ? price - slippage : price + slippage
          const trade = this.closeTrade(position, ep, i, exitReason)
          trades.push(trade)
          this.journal.push(trade)
          capital += trade.pnl - trade.fees
          totalFees += trade.fees
          position = null
        } else {
          this.updateTrailingStop(strategy.riskRules, position, price)
        }
      }

      // Process signal — open or reverse position
      if (sig && !position) {
        const isBuy = sig.signal === 'buy'
        const entryPrice = isBuy ? price + slippage : price - slippage
        const qty = Math.max(
          1,
          Math.floor(
            (capital * this.config.defaultStopLossPct) /
              (entryPrice * this.config.defaultStopLossPct),
          ),
        )
        const stopMult = isBuy
          ? 1 - this.config.defaultStopLossPct
          : 1 + this.config.defaultStopLossPct
        if (sig.signal !== 'hold') {
          position = {
            direction: isBuy ? 'long' : 'short',
            entryPrice,
            entryTime: i,
            quantity: qty,
            trailingStop: entryPrice * stopMult,
          }
        }
      } else if (sig && position) {
        const shouldClose =
          (position.direction === 'long' && sig.signal === 'sell') ||
          (position.direction === 'short' && sig.signal === 'buy')
        if (shouldClose) {
          const exitPrice = position.direction === 'long' ? price - slippage : price + slippage
          const trade = this.closeTrade(position, exitPrice, i, 'signal')
          trades.push(trade)
          this.journal.push(trade)
          capital += trade.pnl - trade.fees
          totalFees += trade.fees
          position = null
        }
      }

      const unrealized = position ? this.unrealizedPnl(position, price) : 0
      equityCurve.push(capital + unrealized)
      const prevEq = equityCurve[equityCurve.length - 2] || capital
      dailyReturns.push(prevEq > 0 ? (equityCurve[equityCurve.length - 1] - prevEq) / prevEq : 0)
    }

    // Close any remaining position at last price
    if (position && prices.length > 0) {
      const lastPrice = prices[prices.length - 1]
      const trade = this.closeTrade(position, lastPrice, prices.length - 1, 'end-of-data')
      trades.push(trade)
      this.journal.push(trade)
      capital += trade.pnl - trade.fees
      totalFees += trade.fees
    }

    const totalReturn =
      this.config.initialCapital > 0
        ? round4((capital - this.config.initialCapital) / this.config.initialCapital)
        : 0
    const numYears = Math.max(1, prices.length / ANNUALIZATION_FACTOR)
    const annualizedReturn = round4(
      Math.sign(1 + totalReturn) * (Math.abs(1 + totalReturn) ** (1 / numYears) - 1),
    )
    const winningTrades = trades.filter(t => t.pnl > 0)
    const losingTrades = trades.filter(t => t.pnl <= 0)
    const winRate = trades.length > 0 ? round4(winningTrades.length / trades.length) : 0
    const grossProfit = winningTrades.reduce((s, t) => s + t.pnl, 0)
    const grossLoss = Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0))
    const profitFactor = grossLoss > 0 ? round4(grossProfit / grossLoss) : grossProfit > 0 ? 10 : 0
    const sr = sharpeRatio(dailyReturns)
    const so = sortinoRatio(dailyReturns)
    const mdd = maxDrawdown(equityCurve)

    if (sr > this.bestSharpe) this.bestSharpe = sr
    this.winRates.push(winRate)

    return {
      strategy,
      trades,
      totalReturn,
      annualizedReturn,
      sharpe: sr,
      sortino: so,
      maxDrawdown: mdd,
      winRate,
      profitFactor,
      avgTrade:
        trades.length > 0 ? round2(trades.reduce((s, t) => s + t.pnl, 0) / trades.length) : 0,
      totalFees: round2(totalFees),
      metrics: {
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        avgWin: winningTrades.length > 0 ? round2(grossProfit / winningTrades.length) : 0,
        avgLoss: losingTrades.length > 0 ? round2(grossLoss / losingTrades.length) : 0,
        largestWin:
          winningTrades.length > 0 ? round2(Math.max(...winningTrades.map(t => t.pnl))) : 0,
        largestLoss:
          losingTrades.length > 0 ? round2(Math.min(...losingTrades.map(t => t.pnl))) : 0,
        maxConsecutiveWins: this.maxConsecutive(trades, true),
        maxConsecutiveLosses: this.maxConsecutive(trades, false),
        finalCapital: round2(capital),
        calmarRatio: mdd > 0 ? round4(annualizedReturn / mdd) : 0,
      },
    }
  }

  // ── Strategy Optimization ─────────────────────────────────────────────────

  /** Optimize strategy parameters using walk-forward analysis. */
  optimize(
    type: Strategy['type'],
    prices: number[],
    paramRanges: Record<string, { min: number; max: number; step: number }>,
    volumes?: number[],
  ): StrategyOptimizationResult {
    const paramNames = Object.keys(paramRanges)
    const paramCombinations = this.generateParamGrid(paramRanges)
    const performanceSurface: Array<{ params: Record<string, number>; sharpe: number }> = []
    let bestParams: Record<string, number> = {}
    let bestSharpe = -Infinity

    for (const combo of paramCombinations) {
      const params: Record<string, number> = {}
      paramNames.forEach((name, idx) => {
        params[name] = combo[idx]
      })
      const result = this.backtest(this.createFromTemplate(type, params), prices, volumes)
      performanceSurface.push({ params: { ...params }, sharpe: result.sharpe })
      if (result.sharpe > bestSharpe) {
        bestSharpe = result.sharpe
        bestParams = { ...params }
      }
    }

    // Walk-forward validation
    const windowSize = Math.floor(prices.length / (this.config.walkForwardWindows + 1))
    const walkForwardResults: StrategyOptimizationResult['walkForwardResults'] = []

    for (let w = 0; w < this.config.walkForwardWindows; w++) {
      const inStart = w * windowSize
      const inEnd = inStart + windowSize
      const outEnd = Math.min(inEnd + windowSize, prices.length)
      if (inEnd >= prices.length || outEnd <= inEnd) break

      const inSample = prices.slice(inStart, inEnd)
      const outSample = prices.slice(inEnd, outEnd)
      const inVols = volumes?.slice(inStart, inEnd)
      const outVols = volumes?.slice(inEnd, outEnd)
      let wfBestSharpe = -Infinity
      let wfBestParams: Record<string, number> = {}

      for (const combo of paramCombinations) {
        const params: Record<string, number> = {}
        paramNames.forEach((name, idx) => {
          params[name] = combo[idx]
        })
        const res = this.backtest(this.createFromTemplate(type, params), inSample, inVols)
        if (res.sharpe > wfBestSharpe) {
          wfBestSharpe = res.sharpe
          wfBestParams = { ...params }
        }
      }

      const outResult = this.backtest(
        this.createFromTemplate(type, wfBestParams),
        outSample,
        outVols,
      )
      walkForwardResults.push({
        window: w,
        inSampleSharpe: round4(wfBestSharpe),
        outSampleSharpe: round4(outResult.sharpe),
      })
    }

    const inSharpes = walkForwardResults.map(r => r.inSampleSharpe)
    const outSharpes = walkForwardResults.map(r => r.outSampleSharpe)
    const avgIn = mean(inSharpes)
    const avgOut = mean(outSharpes)
    const robustness = avgIn > 0 ? round4(clamp(avgOut / avgIn, 0, 1)) : 0

    return {
      bestParameters: bestParams,
      performanceSurface,
      walkForwardResults,
      robustness,
    }
  }

  // ── Monte Carlo Simulation ────────────────────────────────────────────────

  /** Run Monte Carlo simulation on backtest returns for probability estimates. */
  monteCarloSimulation(backtestResult: BacktestResult): MonteCarloResult {
    const trades = backtestResult.trades
    if (trades.length === 0) {
      return {
        simulations: 0,
        medianReturn: 0,
        percentile5: 0,
        percentile95: 0,
        probabilityOfProfit: 0,
        maxDrawdownDistribution: [],
        meanReturn: 0,
        stdReturn: 0,
      }
    }

    const tradePnls = trades.map(t => t.pnl)
    const simReturns: number[] = []
    const simDrawdowns: number[] = []
    const numSims = this.config.monteCarloRuns

    for (let sim = 0; sim < numSims; sim++) {
      let equity = this.config.initialCapital
      let peak = equity
      let mdd = 0

      // Bootstrap: randomly sample trades with replacement
      for (let t = 0; t < tradePnls.length; t++) {
        const idx = Math.floor(Math.random() * tradePnls.length)
        equity += tradePnls[idx]
        if (equity > peak) peak = equity
        const dd = peak > 0 ? (peak - equity) / peak : 0
        if (dd > mdd) mdd = dd
      }

      const totalRet =
        this.config.initialCapital > 0
          ? (equity - this.config.initialCapital) / this.config.initialCapital
          : 0
      simReturns.push(totalRet)
      simDrawdowns.push(mdd)
    }

    const profitable = simReturns.filter(r => r > 0).length

    return {
      simulations: numSims,
      medianReturn: round4(percentile(simReturns, 50)),
      percentile5: round4(percentile(simReturns, 5)),
      percentile95: round4(percentile(simReturns, 95)),
      probabilityOfProfit: round4(profitable / numSims),
      maxDrawdownDistribution: [
        round4(percentile(simDrawdowns, 5)),
        round4(percentile(simDrawdowns, 25)),
        round4(percentile(simDrawdowns, 50)),
        round4(percentile(simDrawdowns, 75)),
        round4(percentile(simDrawdowns, 95)),
      ],
      meanReturn: round4(mean(simReturns)),
      stdReturn: round4(stddev(simReturns)),
    }
  }

  // ── Strategy Comparison ───────────────────────────────────────────────────

  /** Compare multiple strategies against the same dataset. */
  compareStrategies(
    strategies: Strategy[],
    prices: number[],
    volumes?: number[],
  ): StrategyComparison {
    const results = strategies.map(s => this.backtest(s, prices, volumes))

    const scores = results.map((r, idx) => {
      const composite = round4(
        r.sharpe +
          r.totalReturn * 10 -
          r.maxDrawdown * 5 +
          r.winRate * 3 +
          Math.min(r.profitFactor, 5),
      )
      return { strategyId: strategies[idx].id, score: composite }
    })

    scores.sort((a, b) => b.score - a.score)
    const ranking = scores.map((s, idx) => ({ ...s, rank: idx + 1 }))
    return { strategies, results, ranking, bestOverall: ranking[0]?.strategyId ?? '' }
  }

  // ── Trade Journal ─────────────────────────────────────────────────────────

  /** Get all recorded trades. */
  getJournal(): ReadonlyArray<TradeRecord> {
    return this.journal
  }

  /** Get trade journal analytics. */
  getJournalAnalytics(): {
    totalTrades: number
    winRate: number
    avgPnl: number
    bestTrade: number
    worstTrade: number
    avgHoldingPeriod: number
    pnlByDirection: { long: number; short: number }
  } {
    const pnls = this.journal.map(t => t.pnl)
    const longTrades = this.journal.filter(t => t.direction === 'long')
    const shortTrades = this.journal.filter(t => t.direction === 'short')
    const holdingPeriods = this.journal.map(t => t.exitTime - t.entryTime)

    return {
      totalTrades: this.journal.length,
      winRate:
        this.journal.length > 0
          ? round4(this.journal.filter(t => t.pnl > 0).length / this.journal.length)
          : 0,
      avgPnl: round2(mean(pnls)),
      bestTrade: pnls.length > 0 ? round2(Math.max(...pnls)) : 0,
      worstTrade: pnls.length > 0 ? round2(Math.min(...pnls)) : 0,
      avgHoldingPeriod: round2(mean(holdingPeriods)),
      pnlByDirection: {
        long: round2(longTrades.reduce((s, t) => s + t.pnl, 0)),
        short: round2(shortTrades.reduce((s, t) => s + t.pnl, 0)),
      },
    }
  }

  /** Clear the trade journal. */
  clearJournal(): void {
    this.journal = []
  }

  // ── Risk Management ───────────────────────────────────────────────────────

  /** Create a set of risk rules. */
  createRiskRules(
    stopLossPct?: number,
    takeProfitPct?: number,
    trailingPct?: number,
    positionLimit?: number,
  ): RiskRule[] {
    return [
      { type: 'stop-loss', value: stopLossPct ?? this.config.defaultStopLossPct, active: true },
      {
        type: 'take-profit',
        value: takeProfitPct ?? this.config.defaultTakeProfitPct,
        active: true,
      },
      {
        type: 'trailing',
        value: trailingPct ?? this.config.defaultStopLossPct * 1.5,
        active: trailingPct !== undefined,
      },
      {
        type: 'position-limit',
        value: positionLimit ?? this.config.maxOpenPositions,
        active: true,
      },
    ]
  }

  // ── Feedback & Learning ───────────────────────────────────────────────────

  /** Learn from feedback on a previous signal or backtest. */
  learnFromFeedback(signalOrTradeId: string, correct: boolean): void {
    if (!this.config.enableLearning) return
    this.feedbackTotal++
    if (correct) this.feedbackCorrect++

    // Adjust rule weights for matching strategy signals
    if (correct) return

    const matchedSignal = this.signals.find(s => s.strategy === signalOrTradeId)
    if (matchedSignal) {
      const strat = this.strategies.find(s => s.id === matchedSignal.strategy)
      if (strat) {
        for (const rule of strat.rules) {
          rule.weight = clamp(rule.weight - 0.05, 0.1, 2.0)
        }
      }
    }
  }

  // ── Stats & Serialization ─────────────────────────────────────────────────

  /** Return aggregate statistics. */
  getStats(): Readonly<StrategyEngineStats> {
    return {
      totalBacktests: this.totalBacktests,
      totalSignals: this.totalSignals,
      totalStrategiesCreated: this.strategies.length,
      bestSharpe: round4(this.bestSharpe),
      avgWinRate: round4(mean(this.winRates)),
      totalTradesRecorded: this.journal.length,
      feedbackReceived: this.feedbackTotal,
      feedbackAccuracy:
        this.feedbackTotal > 0 ? round4(this.feedbackCorrect / this.feedbackTotal) : 0,
    }
  }

  /** Serialize the engine state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      strategies: this.strategies,
      journal: this.journal,
      signals: this.signals,
      totalBacktests: this.totalBacktests,
      totalSignals: this.totalSignals,
      bestSharpe: this.bestSharpe,
      winRates: this.winRates,
      feedbackCorrect: this.feedbackCorrect,
      feedbackTotal: this.feedbackTotal,
    })
  }

  /** Restore a StrategyEngine from serialized JSON. */
  static deserialize(json: string): StrategyEngine {
    const data = JSON.parse(json) as {
      config: StrategyEngineConfig
      strategies: Strategy[]
      journal: TradeRecord[]
      signals: SignalEvent[]
      totalBacktests: number
      totalSignals: number
      bestSharpe: number
      winRates: number[]
      feedbackCorrect: number
      feedbackTotal: number
    }

    const instance = new StrategyEngine(data.config)
    instance.strategies = data.strategies
    instance.journal = data.journal
    instance.signals = data.signals
    instance.totalBacktests = data.totalBacktests
    instance.totalSignals = data.totalSignals
    instance.bestSharpe = data.bestSharpe
    instance.winRates = data.winRates
    instance.feedbackCorrect = data.feedbackCorrect
    instance.feedbackTotal = data.feedbackTotal
    return instance
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private registerStrategy(tpl: StrategyTemplate, params: Record<string, number>): Strategy {
    const strategy: Strategy = {
      id: generateId('strat'),
      name: tpl.name,
      rules: tpl.buildRules(params),
      description: tpl.description,
      type: tpl.type,
      riskRules: this.defaultRiskRules(),
      createdAt: Date.now(),
    }
    this.strategies.push(strategy)
    return strategy
  }

  private defaultRiskRules(): RiskRule[] {
    return [
      { type: 'stop-loss', value: this.config.defaultStopLossPct, active: true },
      { type: 'take-profit', value: this.config.defaultTakeProfitPct, active: true },
      { type: 'trailing', value: this.config.defaultStopLossPct * 1.5, active: false },
      { type: 'position-limit', value: this.config.maxOpenPositions, active: true },
    ]
  }

  private evaluateRule(
    rule: StrategyRule,
    ctx: {
      price: number
      prevPrice: number
      fastMa: number
      slowMa: number
      rsi: number
      upperBand: number
      lowerBand: number
      emaShort: number
      emaMed: number
      emaLong: number
      volume: number
      avgVolume: number
      index: number
      prices: number[]
    },
  ): boolean {
    if (isNaN(ctx.fastMa) || isNaN(ctx.slowMa)) return false

    const p = rule.parameters

    // Momentum rules
    if (rule.condition.includes('fast_ma') && rule.action === 'buy') {
      const maCondition = ctx.fastMa > ctx.slowMa
      const rsiFilter = p.rsiFilter !== undefined ? ctx.rsi > p.rsiFilter : true
      return maCondition && rsiFilter
    }
    if (rule.condition.includes('fast_ma') && rule.action === 'sell') {
      return ctx.fastMa < ctx.slowMa || ctx.rsi < 30
    }

    // Mean-reversion rules
    if (rule.condition.includes('lower_band') && rule.action === 'buy') {
      if (isNaN(ctx.lowerBand)) return false
      const belowBand = ctx.price <= ctx.lowerBand
      const rsiFilter = p.rsiOversold !== undefined ? ctx.rsi < p.rsiOversold : true
      return belowBand && rsiFilter
    }
    if (rule.condition.includes('upper_band') && rule.action === 'sell') {
      if (isNaN(ctx.upperBand)) return false
      const aboveBand = ctx.price >= ctx.upperBand
      const rsiFilter = p.rsiOverbought !== undefined ? ctx.rsi > p.rsiOverbought : true
      return aboveBand && rsiFilter
    }

    // Breakout rules
    if (rule.condition.includes('highest_high') && rule.action === 'buy') {
      const lookback = p.lookbackPeriod ?? 20
      if (ctx.index < lookback) return false
      const windowHigh = Math.max(...ctx.prices.slice(ctx.index - lookback, ctx.index))
      const breakout = ctx.price > windowHigh
      const volumeFilter =
        p.volumeThreshold !== undefined
          ? ctx.avgVolume > 0 && ctx.volume > ctx.avgVolume * p.volumeThreshold
          : true
      return breakout && volumeFilter
    }
    if (rule.condition.includes('lowest_low') && rule.action === 'sell') {
      const lookback = p.lookbackPeriod ?? 20
      if (ctx.index < lookback) return false
      const windowLow = Math.min(...ctx.prices.slice(ctx.index - lookback, ctx.index))
      return ctx.price < windowLow
    }

    // Trend-following rules
    if (rule.condition.includes('ema_short') && rule.action === 'buy') {
      const aligned = ctx.emaShort > ctx.emaMed && ctx.emaMed > ctx.emaLong
      const strength = ctx.emaLong > 0 ? (ctx.emaShort - ctx.emaLong) / ctx.emaLong : 0
      const minStrength = p.trendStrength ?? 0.02
      return aligned && strength > minStrength
    }
    if (rule.condition.includes('ema_short') && rule.action === 'sell') {
      return ctx.emaShort < ctx.emaMed
    }

    // Pairs / z-score rules
    if (rule.condition.includes('z_score')) {
      const spreadPeriod = p.spreadPeriod ?? 30
      if (ctx.index < spreadPeriod) return false
      const window = ctx.prices.slice(ctx.index - spreadPeriod, ctx.index)
      const m = mean(window)
      const sd = stddev(window)
      if (sd === 0) return false
      const zScore = (ctx.price - m) / sd

      if (rule.action === 'buy') return zScore < -(p.entryZScore ?? 2)
      if (rule.action === 'sell') return zScore > (p.entryZScore ?? 2)
      if (rule.action === 'hold') return Math.abs(zScore) < (p.exitZScore ?? 0.5)
    }

    return false
  }

  private checkRiskRules(
    rules: RiskRule[],
    pos: { direction: 'long' | 'short'; entryPrice: number; trailingStop: number },
    price: number,
  ): string | null {
    const isLong = pos.direction === 'long'
    for (const rule of rules) {
      if (!rule.active) continue
      if (rule.type === 'stop-loss') {
        if (isLong && price <= pos.entryPrice * (1 - rule.value)) return 'stop-loss'
        if (!isLong && price >= pos.entryPrice * (1 + rule.value)) return 'stop-loss'
      }
      if (rule.type === 'take-profit') {
        if (isLong && price >= pos.entryPrice * (1 + rule.value)) return 'take-profit'
        if (!isLong && price <= pos.entryPrice * (1 - rule.value)) return 'take-profit'
      }
      if (rule.type === 'trailing') {
        if (isLong && price <= pos.trailingStop) return 'trailing-stop'
        if (!isLong && price >= pos.trailingStop) return 'trailing-stop'
      }
    }
    return null
  }

  private updateTrailingStop(
    rules: RiskRule[],
    pos: { direction: 'long' | 'short'; trailingStop: number },
    price: number,
  ): void {
    const rule = rules.find(r => r.type === 'trailing' && r.active)
    if (!rule) return
    if (pos.direction === 'long') {
      const ns = price * (1 - rule.value)
      if (ns > pos.trailingStop) pos.trailingStop = ns
    } else {
      const ns = price * (1 + rule.value)
      if (ns < pos.trailingStop) pos.trailingStop = ns
    }
  }

  private closeTrade(
    pos: { direction: 'long' | 'short'; entryPrice: number; entryTime: number; quantity: number },
    exitPrice: number,
    exitTime: number,
    exitReason: string,
  ): TradeRecord {
    const rawPnl =
      pos.direction === 'long'
        ? (exitPrice - pos.entryPrice) * pos.quantity
        : (pos.entryPrice - exitPrice) * pos.quantity
    const fees = round2(
      (pos.entryPrice * pos.quantity + exitPrice * pos.quantity) * this.config.commissionRate,
    )
    return {
      id: generateId('trade'),
      entryTime: pos.entryTime,
      exitTime,
      entryPrice: round4(pos.entryPrice),
      exitPrice: round4(exitPrice),
      direction: pos.direction,
      quantity: pos.quantity,
      pnl: round2(rawPnl),
      fees,
      exitReason,
    }
  }

  private unrealizedPnl(
    position: { direction: 'long' | 'short'; entryPrice: number; quantity: number },
    currentPrice: number,
  ): number {
    return position.direction === 'long'
      ? (currentPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - currentPrice) * position.quantity
  }

  private maxConsecutive(trades: TradeRecord[], wins: boolean): number {
    let max = 0
    let current = 0
    for (const t of trades) {
      if ((wins && t.pnl > 0) || (!wins && t.pnl <= 0)) {
        current++
        if (current > max) max = current
      } else {
        current = 0
      }
    }
    return max
  }

  private generateParamGrid(
    ranges: Record<string, { min: number; max: number; step: number }>,
  ): number[][] {
    const names = Object.keys(ranges)
    const values: number[][] = names.map(name => {
      const r = ranges[name]
      const vals: number[] = []
      for (let v = r.min; v <= r.max; v += r.step) {
        vals.push(round4(v))
      }
      if (vals.length === 0) vals.push(r.min)
      return vals
    })

    // Cartesian product (capped to prevent combinatorial explosion)
    const MAX_COMBINATIONS = 500
    const combos: number[][] = []

    const recurse = (depth: number, current: number[]): void => {
      if (combos.length >= MAX_COMBINATIONS) return
      if (depth === values.length) {
        combos.push([...current])
        return
      }
      for (const v of values[depth]) {
        if (combos.length >= MAX_COMBINATIONS) return
        current.push(v)
        recurse(depth + 1, current)
        current.pop()
      }
    }

    recurse(0, [])
    return combos
  }
}
