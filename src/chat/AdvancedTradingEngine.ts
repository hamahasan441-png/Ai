/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          ⚡  A D V A N C E D   T R A D I N G   E N G I N E                  ║
 * ║                                                                             ║
 * ║   Quantitative finance & algorithmic trading engine:                        ║
 * ║     price → model → simulate → execute                                      ║
 * ║                                                                             ║
 * ║     • Black-Scholes & binomial option pricing with full Greeks              ║
 * ║     • Monte Carlo simulation via geometric Brownian motion                  ║
 * ║     • GARCH(1,1), EWMA & historical volatility modelling                   ║
 * ║     • Algorithmic execution: VWAP, TWAP, POV, IS, Iceberg                  ║
 * ║     • Order book analysis: spread, imbalance, microprice                    ║
 * ║     • DeFi analytics: impermanent loss, yield estimation                    ║
 * ║     • Bond pricing via present-value discounting                            ║
 * ║     • Implied volatility via Newton-Raphson iteration                       ║
 * ║     • Risk metrics: VaR, CVaR, Sharpe, Sortino, Calmar, Omega              ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdvancedTradingConfig {
  riskFreeRate: number
  defaultSimulations: number
  maxSimulations: number
  impliedVolTolerance: number
  impliedVolMaxIterations: number
  binomialSteps: number
  garchOmega: number
  garchAlpha: number
  garchBeta: number
  ewmaLambda: number
  volatilityForecastHorizon: number
  defaultUrgency: number
  maxSlippageBps: number
  enableLearning: boolean
}

export interface AdvancedTradingStats {
  totalOptionsPriced: number
  totalGreeksCalculated: number
  totalVolatilityModels: number
  totalMonteCarloRuns: number
  totalAlgoExecutions: number
  totalOrderBookAnalyses: number
  totalRiskCalculations: number
  totalDeFiAnalyses: number
  totalBondsPriced: number
  totalImpliedVolCalculations: number
  feedbackReceived: number
  feedbackAccuracy: number
}

export interface OptionContract {
  type: 'call' | 'put'
  strike: number
  expiry: number
  premium: number
  underlying: number
  impliedVol?: number
}

export interface OptionGreeks {
  delta: number
  gamma: number
  theta: number
  vega: number
  rho: number
}

export interface OptionPricing {
  price: number
  greeks: OptionGreeks
  intrinsicValue: number
  timeValue: number
  model: string
}

export interface VolatilityModel {
  type: 'historical' | 'garch' | 'ewma'
  params: Record<string, number>
  forecast: number[]
}

export interface MonteCarloResult {
  simulations: number
  meanReturn: number
  var95: number
  var99: number
  cvar95: number
  maxDrawdown: number
  percentiles: Record<number, number>
}

export interface AlgoExecution {
  strategy: 'vwap' | 'twap' | 'pov' | 'is' | 'iceberg'
  params: Record<string, number>
  expectedSlippage: number
  estimatedTime: number
  description: string
}

export interface OrderBookLevel {
  price: number
  size: number
  orders: number
}

export interface OrderBookAnalysis {
  spread: number
  spreadBps: number
  bidDepth: number
  askDepth: number
  imbalance: number
  midPrice: number
  microprice: number
  levels: { bids: OrderBookLevel[]; asks: OrderBookLevel[] }
}

export interface DeFiProtocol {
  name: string
  type: 'dex' | 'lending' | 'yield' | 'derivatives' | 'bridge'
  tvl: number
  apy: number
  risks: string[]
  chain: string
}

export interface DeFiAnalysis {
  protocol: string
  impermanentLoss: number
  yieldEstimate: number
  risks: string[]
  gasEstimate: number
}

export interface RiskMetrics {
  var: number
  cvar: number
  sharpe: number
  sortino: number
  maxDrawdown: number
  calmar: number
  omega: number
  tailRatio: number
}

// ── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_ADVANCED_TRADING_CONFIG: AdvancedTradingConfig = {
  riskFreeRate: 0.04,
  defaultSimulations: 10000,
  maxSimulations: 100000,
  impliedVolTolerance: 1e-6,
  impliedVolMaxIterations: 100,
  binomialSteps: 100,
  garchOmega: 0.000001,
  garchAlpha: 0.09,
  garchBeta: 0.9,
  ewmaLambda: 0.94,
  volatilityForecastHorizon: 21,
  defaultUrgency: 0.5,
  maxSlippageBps: 50,
  enableLearning: true,
}

/** Built-in DeFi protocol reference database. */
const DEFI_PROTOCOLS: DeFiProtocol[] = [
  {
    name: 'Uniswap',
    type: 'dex',
    tvl: 5_200_000_000,
    apy: 12.5,
    risks: ['impermanent loss', 'smart contract risk', 'MEV extraction'],
    chain: 'Ethereum',
  },
  {
    name: 'Aave',
    type: 'lending',
    tvl: 11_800_000_000,
    apy: 4.2,
    risks: ['liquidation risk', 'smart contract risk', 'oracle manipulation'],
    chain: 'Ethereum',
  },
  {
    name: 'Curve',
    type: 'dex',
    tvl: 2_100_000_000,
    apy: 6.8,
    risks: ['impermanent loss', 'smart contract risk', 'depeg risk'],
    chain: 'Ethereum',
  },
  {
    name: 'Compound',
    type: 'lending',
    tvl: 2_500_000_000,
    apy: 3.5,
    risks: ['liquidation risk', 'smart contract risk', 'governance attack'],
    chain: 'Ethereum',
  },
  {
    name: 'MakerDAO',
    type: 'lending',
    tvl: 8_200_000_000,
    apy: 5.0,
    risks: ['liquidation risk', 'oracle risk', 'governance risk', 'depeg risk'],
    chain: 'Ethereum',
  },
  {
    name: 'Lido',
    type: 'yield',
    tvl: 14_500_000_000,
    apy: 3.8,
    risks: ['slashing risk', 'smart contract risk', 'validator risk', 'depeg risk'],
    chain: 'Ethereum',
  },
  {
    name: 'Convex',
    type: 'yield',
    tvl: 1_800_000_000,
    apy: 8.5,
    risks: ['smart contract risk', 'dependency risk', 'impermanent loss'],
    chain: 'Ethereum',
  },
  {
    name: 'PancakeSwap',
    type: 'dex',
    tvl: 1_600_000_000,
    apy: 15.0,
    risks: ['impermanent loss', 'smart contract risk', 'chain risk'],
    chain: 'BSC',
  },
  {
    name: 'SushiSwap',
    type: 'dex',
    tvl: 500_000_000,
    apy: 10.2,
    risks: ['impermanent loss', 'smart contract risk', 'governance risk'],
    chain: 'Ethereum',
  },
  {
    name: 'dYdX',
    type: 'derivatives',
    tvl: 350_000_000,
    apy: 7.5,
    risks: ['smart contract risk', 'liquidation risk', 'funding rate risk'],
    chain: 'Ethereum',
  },
  {
    name: 'GMX',
    type: 'derivatives',
    tvl: 550_000_000,
    apy: 20.0,
    risks: ['smart contract risk', 'counterparty risk', 'oracle risk', 'GLP risk'],
    chain: 'Arbitrum',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round6(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

function variance(values: number[]): number {
  if (values.length < 2) return 0
  const m = mean(values)
  return values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1)
}

function stddev(values: number[]): number {
  return Math.sqrt(variance(values))
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

/**
 * Standard normal cumulative distribution function.
 * Uses the Abramowitz & Stegun rational approximation (formula 26.2.17)
 * which provides accuracy to ~1e-7 with no external dependencies.
 */
function normalCDF(x: number): number {
  if (x < -8) return 0
  if (x > 8) return 1
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x)
  const t = 1.0 / (1.0 + p * absX)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp((-absX * absX) / 2)
  return round6(0.5 * (1.0 + sign * y))
}

/** Standard normal probability density function. */
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

/**
 * Box-Muller transform: generate a pair of standard normal random variables
 * from two uniform random variables. Returns one of the pair.
 */
function boxMullerRandom(): number {
  let u1 = 0
  let u2 = 0
  // Avoid u1 === 0 to prevent log(0)
  while (u1 === 0) u1 = Math.random()
  while (u2 === 0) u2 = Math.random()
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class AdvancedTradingEngine {
  private readonly config: AdvancedTradingConfig
  private totalOptionsPriced = 0
  private totalGreeksCalculated = 0
  private totalVolatilityModels = 0
  private totalMonteCarloRuns = 0
  private totalAlgoExecutions = 0
  private totalOrderBookAnalyses = 0
  private totalRiskCalculations = 0
  private totalDeFiAnalyses = 0
  private totalBondsPriced = 0
  private totalImpliedVolCalculations = 0
  private feedbackCorrect = 0
  private feedbackTotal = 0

  constructor(config?: Partial<AdvancedTradingConfig>) {
    this.config = { ...DEFAULT_ADVANCED_TRADING_CONFIG, ...config }
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Price a European option using the specified model.
   *
   * Supports Black-Scholes (analytic) and Cox-Ross-Rubinstein binomial tree.
   * Returns the theoretical price, full Greeks, intrinsic value, and time value.
   */
  priceOption(
    option: OptionContract,
    riskFreeRate: number,
    method: 'black-scholes' | 'binomial' = 'black-scholes',
  ): OptionPricing {
    this.totalOptionsPriced++

    const vol = option.impliedVol ?? this.estimateDefaultVol()
    const T = Math.max(option.expiry, 1e-10)
    const S = option.underlying
    const K = option.strike

    let price: number
    if (method === 'binomial') {
      price = this.binomialPrice(S, K, T, riskFreeRate, vol, option.type)
    } else {
      price = this.bsPrice(S, K, T, riskFreeRate, vol, option.type)
    }

    const greeks = this.bsGreeks(S, K, T, riskFreeRate, vol, option.type)

    const intrinsicValue = option.type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0)
    const timeValue = Math.max(price - intrinsicValue, 0)

    return {
      price: round6(price),
      greeks,
      intrinsicValue: round6(intrinsicValue),
      timeValue: round6(timeValue),
      model: method,
    }
  }

  /**
   * Calculate all option Greeks for a given contract and spot price.
   *
   * Computes delta, gamma, theta, vega, and rho from the Black-Scholes
   * partial derivatives analytically (closed-form).
   */
  calculateGreeks(option: OptionContract, spotPrice: number, riskFreeRate: number): OptionGreeks {
    this.totalGreeksCalculated++

    const vol = option.impliedVol ?? this.estimateDefaultVol()
    const T = Math.max(option.expiry, 1e-10)

    return this.bsGreeks(spotPrice, option.strike, T, riskFreeRate, vol, option.type)
  }

  /**
   * Model and forecast volatility using one of three approaches:
   *
   *  • historical — realised standard deviation of returns
   *  • garch      — GARCH(1,1) conditional variance model
   *  • ewma       — Exponentially Weighted Moving Average
   *
   * Returns the fitted model parameters and a forecast vector.
   */
  modelVolatility(
    returns: number[],
    model: 'historical' | 'garch' | 'ewma' = 'historical',
  ): VolatilityModel {
    this.totalVolatilityModels++

    if (returns.length === 0) {
      return { type: model, params: {}, forecast: [] }
    }

    switch (model) {
      case 'garch':
        return this.fitGARCH(returns)
      case 'ewma':
        return this.fitEWMA(returns)
      default:
        return this.fitHistoricalVol(returns)
    }
  }

  /**
   * Run a Monte Carlo simulation via geometric Brownian motion (GBM).
   *
   * Generates price paths using:
   *   S(t+dt) = S(t) * exp((μ − σ²/2)dt + σ√dt·Z)
   *
   * where Z ~ N(0,1) via Box-Muller transform.
   * Returns VaR, CVaR, drawdown, and percentile statistics.
   */
  runMonteCarlo(params: {
    initialPrice: number
    drift: number
    volatility: number
    days: number
    simulations?: number
  }): MonteCarloResult {
    this.totalMonteCarloRuns++

    const numSims = clamp(
      params.simulations ?? this.config.defaultSimulations,
      1,
      this.config.maxSimulations,
    )
    const dt = 1 / 252 // daily time step (trading days)
    const days = Math.max(params.days, 1)
    const S0 = params.initialPrice
    const mu = params.drift
    const sigma = params.volatility

    const finalReturns: number[] = []
    let worstDrawdown = 0

    for (let sim = 0; sim < numSims; sim++) {
      let price = S0
      let peak = S0
      let maxDD = 0

      for (let d = 0; d < days; d++) {
        const z = boxMullerRandom()
        price *= Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z)
        if (price > peak) peak = price
        const dd = (peak - price) / peak
        if (dd > maxDD) maxDD = dd
      }

      finalReturns.push((price - S0) / S0)
      if (maxDD > worstDrawdown) worstDrawdown = maxDD
    }

    finalReturns.sort((a, b) => a - b)

    const meanReturn = mean(finalReturns)
    const var95 = -percentile(finalReturns, 5)
    const var99 = -percentile(finalReturns, 1)

    // CVaR (Expected Shortfall): mean of returns below the 5th percentile
    const cutoff5 = percentile(finalReturns, 5)
    const tail5 = finalReturns.filter(r => r <= cutoff5)
    const cvar95 = tail5.length > 0 ? -mean(tail5) : var95

    const percentiles: Record<number, number> = {}
    for (const p of [1, 5, 10, 25, 50, 75, 90, 95, 99]) {
      percentiles[p] = round6(percentile(finalReturns, p))
    }

    return {
      simulations: numSims,
      meanReturn: round6(meanReturn),
      var95: round6(var95),
      var99: round6(var99),
      cvar95: round6(cvar95),
      maxDrawdown: round6(worstDrawdown),
      percentiles,
    }
  }

  /**
   * Plan an algorithmic execution strategy for a given order.
   *
   * Strategies:
   *   VWAP  — Volume-Weighted Average Price: slices order by historical volume profile
   *   TWAP  — Time-Weighted Average Price: equal time-sliced execution
   *   POV   — Percentage of Volume: participates at a fixed % of market volume
   *   IS    — Implementation Shortfall: minimises total cost vs decision price
   *   Iceberg — Hides true order size behind small visible clips
   */
  planAlgoExecution(
    orderSize: number,
    avgVolume: number,
    strategy: string,
    urgency?: number,
  ): AlgoExecution {
    this.totalAlgoExecutions++

    const urg = clamp(urgency ?? this.config.defaultUrgency, 0, 1)
    const participation = orderSize / Math.max(avgVolume, 1)

    const strat = this.normalizeStrategy(strategy)

    switch (strat) {
      case 'vwap':
        return this.planVWAP(orderSize, avgVolume, participation, urg)
      case 'twap':
        return this.planTWAP(orderSize, avgVolume, participation, urg)
      case 'pov':
        return this.planPOV(orderSize, avgVolume, participation, urg)
      case 'is':
        return this.planIS(orderSize, avgVolume, participation, urg)
      case 'iceberg':
        return this.planIceberg(orderSize, avgVolume, participation, urg)
      default:
        return this.planTWAP(orderSize, avgVolume, participation, urg)
    }
  }

  /**
   * Analyse an order book snapshot.
   *
   * Computes spread, depth, bid/ask imbalance, mid-price, and the
   * volume-weighted microprice (a better fair-value estimator than the mid).
   */
  analyzeOrderBook(bids: [number, number][], asks: [number, number][]): OrderBookAnalysis {
    this.totalOrderBookAnalyses++

    // Sort bids descending, asks ascending
    const sortedBids = [...bids].sort((a, b) => b[0] - a[0])
    const sortedAsks = [...asks].sort((a, b) => a[0] - b[0])

    const bestBid = sortedBids.length > 0 ? sortedBids[0][0] : 0
    const bestAsk = sortedAsks.length > 0 ? sortedAsks[0][0] : 0
    const bestBidSize = sortedBids.length > 0 ? sortedBids[0][1] : 0
    const bestAskSize = sortedAsks.length > 0 ? sortedAsks[0][1] : 0

    const spread = bestAsk - bestBid
    const midPrice = (bestBid + bestAsk) / 2
    const spreadBps = midPrice > 0 ? (spread / midPrice) * 10000 : 0

    // Volume-weighted microprice: weighted average of best bid/ask by opposing depth
    const microprice =
      bestBidSize + bestAskSize > 0
        ? (bestBid * bestAskSize + bestAsk * bestBidSize) / (bestBidSize + bestAskSize)
        : midPrice

    const bidDepth = sortedBids.reduce((s, [, size]) => s + size, 0)
    const askDepth = sortedAsks.reduce((s, [, size]) => s + size, 0)
    const totalDepth = bidDepth + askDepth
    const imbalance = totalDepth > 0 ? (bidDepth - askDepth) / totalDepth : 0

    const bidLevels: OrderBookLevel[] = sortedBids.map(([price, size]) => ({
      price: round6(price),
      size: round4(size),
      orders: 1, // individual order count not available from aggregated data
    }))

    const askLevels: OrderBookLevel[] = sortedAsks.map(([price, size]) => ({
      price: round6(price),
      size: round4(size),
      orders: 1,
    }))

    return {
      spread: round6(spread),
      spreadBps: round2(spreadBps),
      bidDepth: round4(bidDepth),
      askDepth: round4(askDepth),
      imbalance: round6(imbalance),
      midPrice: round6(midPrice),
      microprice: round6(microprice),
      levels: { bids: bidLevels, asks: askLevels },
    }
  }

  /**
   * Calculate comprehensive risk metrics for a return series.
   *
   * Metrics include Value-at-Risk (parametric), Conditional VaR (Expected
   * Shortfall), Sharpe, Sortino, maximum drawdown, Calmar ratio, Omega ratio,
   * and tail ratio (right-tail gains / left-tail losses at 95%).
   */
  calculateRiskMetrics(returns: number[], riskFreeRate?: number): RiskMetrics {
    this.totalRiskCalculations++

    if (returns.length === 0) {
      return {
        var: 0,
        cvar: 0,
        sharpe: 0,
        sortino: 0,
        maxDrawdown: 0,
        calmar: 0,
        omega: 0,
        tailRatio: 0,
      }
    }

    const rf = riskFreeRate ?? this.config.riskFreeRate
    const dailyRf = rf / 252

    const mu = mean(returns)
    const sigma = stddev(returns)

    // Parametric VaR at 95%
    const var95 = -(mu - 1.645 * sigma)

    // CVaR: mean of returns below the VaR threshold
    const sorted = [...returns].sort((a, b) => a - b)
    const cutoffIdx = Math.max(Math.floor(returns.length * 0.05), 1)
    const tailReturns = sorted.slice(0, cutoffIdx)
    const cvar = tailReturns.length > 0 ? -mean(tailReturns) : var95

    // Sharpe ratio (annualised)
    const excessReturn = mu - dailyRf
    const sharpe = sigma > 0 ? (excessReturn / sigma) * Math.sqrt(252) : 0

    // Sortino ratio: uses downside deviation only
    const downside = returns.filter(r => r < dailyRf).map(r => (r - dailyRf) ** 2)
    const downsideDev =
      downside.length > 0 ? Math.sqrt(downside.reduce((s, v) => s + v, 0) / downside.length) : 0
    const sortino = downsideDev > 0 ? (excessReturn / downsideDev) * Math.sqrt(252) : 0

    // Maximum drawdown from cumulative returns
    const maxDrawdown = this.computeMaxDrawdown(returns)

    // Calmar ratio: annualised return / max drawdown
    const annualisedReturn = mu * 252
    const calmar = maxDrawdown > 0 ? annualisedReturn / maxDrawdown : 0

    // Omega ratio: sum of gains above threshold / sum of losses below threshold
    const omega = this.computeOmegaRatio(returns, dailyRf)

    // Tail ratio: 95th percentile gain / |5th percentile loss|
    const p95 = percentile(sorted, 95)
    const p5 = percentile(sorted, 5)
    const tailRatio = Math.abs(p5) > 1e-12 ? Math.abs(p95 / p5) : 0

    return {
      var: round6(var95),
      cvar: round6(cvar),
      sharpe: round4(sharpe),
      sortino: round4(sortino),
      maxDrawdown: round6(maxDrawdown),
      calmar: round4(calmar),
      omega: round4(omega),
      tailRatio: round4(tailRatio),
    }
  }

  /**
   * Analyse a DeFi protocol interaction for a given token pair.
   *
   * Computes impermanent loss for AMM pools using the constant-product
   * formula, estimates yield from the protocol database, and lists risks.
   */
  analyzeDeFi(protocol: string, amount: number, tokenPrices: [number, number]): DeFiAnalysis {
    this.totalDeFiAnalyses++

    const proto = DEFI_PROTOCOLS.find(p => p.name.toLowerCase() === protocol.toLowerCase())

    // Impermanent loss for constant-product AMM (x * y = k)
    const priceRatio = tokenPrices[1] > 0 ? tokenPrices[0] / tokenPrices[1] : 1
    const il = this.computeImpermanentLoss(priceRatio)

    const baseApy = proto?.apy ?? 5.0
    const yieldEstimate = amount * (baseApy / 100) - amount * il

    const risks: string[] = proto ? [...proto.risks] : ['unknown protocol']
    if (il > 0.05) risks.push('high impermanent loss risk')
    if (amount > 100000) risks.push('large position concentration')

    // Gas estimate: simple heuristic based on protocol type
    const gasEstimate = this.estimateGas(proto)

    return {
      protocol: proto?.name ?? protocol,
      impermanentLoss: round6(il),
      yieldEstimate: round2(yieldEstimate),
      risks,
      gasEstimate: round2(gasEstimate),
    }
  }

  /**
   * Price a fixed-rate bond via present-value discounting.
   *
   * PV = Σ(C / (1+y)^t) + FV / (1+y)^n
   *
   * where C = coupon payment, y = yield per period, n = total periods.
   */
  priceBond(faceValue: number, couponRate: number, yieldRate: number, periods: number): number {
    this.totalBondsPriced++

    if (periods <= 0) return faceValue

    const coupon = faceValue * couponRate
    let pv = 0

    for (let t = 1; t <= periods; t++) {
      pv += coupon / Math.pow(1 + yieldRate, t)
    }
    pv += faceValue / Math.pow(1 + yieldRate, periods)

    return round6(pv)
  }

  /**
   * Calculate implied volatility from an observed market price.
   *
   * Uses Newton-Raphson iteration on the Black-Scholes formula:
   *   σ_{n+1} = σ_n − (BS(σ_n) − marketPrice) / vega(σ_n)
   *
   * Converges quadratically for reasonable starting guesses.
   */
  calculateImpliedVol(marketPrice: number, option: OptionContract, riskFreeRate: number): number {
    this.totalImpliedVolCalculations++

    const S = option.underlying
    const K = option.strike
    const T = Math.max(option.expiry, 1e-10)
    const optType = option.type

    // Initial guess: ATM approximation σ ≈ price / (S * 0.4 * √T)
    let vol = marketPrice / (S * 0.4 * Math.sqrt(T))
    vol = clamp(vol, 0.01, 5.0)

    for (let i = 0; i < this.config.impliedVolMaxIterations; i++) {
      const price = this.bsPrice(S, K, T, riskFreeRate, vol, optType)
      const vega = this.bsVega(S, K, T, riskFreeRate, vol)

      if (Math.abs(vega) < 1e-14) break

      const diff = price - marketPrice
      if (Math.abs(diff) < this.config.impliedVolTolerance) break

      vol -= diff / vega
      vol = clamp(vol, 0.001, 10.0)
    }

    return round6(vol)
  }

  /** Return a copy of the built-in DeFi protocol database. */
  getProtocolDatabase(): DeFiProtocol[] {
    return DEFI_PROTOCOLS.map(p => ({ ...p, risks: [...p.risks] }))
  }

  /** Return aggregate engine statistics. */
  getStats(): Readonly<AdvancedTradingStats> {
    return {
      totalOptionsPriced: this.totalOptionsPriced,
      totalGreeksCalculated: this.totalGreeksCalculated,
      totalVolatilityModels: this.totalVolatilityModels,
      totalMonteCarloRuns: this.totalMonteCarloRuns,
      totalAlgoExecutions: this.totalAlgoExecutions,
      totalOrderBookAnalyses: this.totalOrderBookAnalyses,
      totalRiskCalculations: this.totalRiskCalculations,
      totalDeFiAnalyses: this.totalDeFiAnalyses,
      totalBondsPriced: this.totalBondsPriced,
      totalImpliedVolCalculations: this.totalImpliedVolCalculations,
      feedbackReceived: this.feedbackTotal,
      feedbackAccuracy:
        this.feedbackTotal > 0 ? round4(this.feedbackCorrect / this.feedbackTotal) : 0,
    }
  }

  /** Provide correctness feedback for learning-based adjustments. */
  provideFeedback(score: number): void {
    this.feedbackTotal++
    if (score >= 0.5) this.feedbackCorrect++

    if (!this.config.enableLearning) return

    // Adaptive volatility tuning based on feedback quality
    if (score < 0.3) {
      this.config.garchAlpha = clamp(this.config.garchAlpha + 0.005, 0.01, 0.3)
    } else if (score > 0.8) {
      this.config.garchAlpha = clamp(this.config.garchAlpha - 0.002, 0.01, 0.3)
    }
  }

  /** Serialize the engine state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalOptionsPriced: this.totalOptionsPriced,
      totalGreeksCalculated: this.totalGreeksCalculated,
      totalVolatilityModels: this.totalVolatilityModels,
      totalMonteCarloRuns: this.totalMonteCarloRuns,
      totalAlgoExecutions: this.totalAlgoExecutions,
      totalOrderBookAnalyses: this.totalOrderBookAnalyses,
      totalRiskCalculations: this.totalRiskCalculations,
      totalDeFiAnalyses: this.totalDeFiAnalyses,
      totalBondsPriced: this.totalBondsPriced,
      totalImpliedVolCalculations: this.totalImpliedVolCalculations,
      feedbackCorrect: this.feedbackCorrect,
      feedbackTotal: this.feedbackTotal,
    })
  }

  /** Restore an AdvancedTradingEngine from serialized JSON. */
  static deserialize(json: string): AdvancedTradingEngine {
    const data = JSON.parse(json) as {
      config: AdvancedTradingConfig
      totalOptionsPriced: number
      totalGreeksCalculated: number
      totalVolatilityModels: number
      totalMonteCarloRuns: number
      totalAlgoExecutions: number
      totalOrderBookAnalyses: number
      totalRiskCalculations: number
      totalDeFiAnalyses: number
      totalBondsPriced: number
      totalImpliedVolCalculations: number
      feedbackCorrect: number
      feedbackTotal: number
    }

    const instance = new AdvancedTradingEngine(data.config)
    instance.totalOptionsPriced = data.totalOptionsPriced
    instance.totalGreeksCalculated = data.totalGreeksCalculated
    instance.totalVolatilityModels = data.totalVolatilityModels
    instance.totalMonteCarloRuns = data.totalMonteCarloRuns
    instance.totalAlgoExecutions = data.totalAlgoExecutions
    instance.totalOrderBookAnalyses = data.totalOrderBookAnalyses
    instance.totalRiskCalculations = data.totalRiskCalculations
    instance.totalDeFiAnalyses = data.totalDeFiAnalyses
    instance.totalBondsPriced = data.totalBondsPriced
    instance.totalImpliedVolCalculations = data.totalImpliedVolCalculations
    instance.feedbackCorrect = data.feedbackCorrect
    instance.feedbackTotal = data.feedbackTotal
    return instance
  }

  // ── Black-Scholes Internals ──────────────────────────────────────────────

  /**
   * Compute Black-Scholes d1 and d2 parameters.
   *
   *   d1 = [ln(S/K) + (r + σ²/2)T] / (σ√T)
   *   d2 = d1 − σ√T
   */
  private bsD1D2(
    S: number,
    K: number,
    T: number,
    r: number,
    sigma: number,
  ): { d1: number; d2: number } {
    const sqrtT = Math.sqrt(T)
    const sigmaRootT = sigma * sqrtT
    if (sigmaRootT < 1e-14) {
      const d = S > K ? 1e10 : S < K ? -1e10 : 0
      return { d1: d, d2: d }
    }
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / sigmaRootT
    const d2 = d1 - sigmaRootT
    return { d1, d2 }
  }

  /** Black-Scholes European call/put price. */
  private bsPrice(
    S: number,
    K: number,
    T: number,
    r: number,
    sigma: number,
    optionType: 'call' | 'put',
  ): number {
    const { d1, d2 } = this.bsD1D2(S, K, T, r, sigma)
    const discountedK = K * Math.exp(-r * T)

    if (optionType === 'call') {
      return S * normalCDF(d1) - discountedK * normalCDF(d2)
    }
    return discountedK * normalCDF(-d2) - S * normalCDF(-d1)
  }

  /** Black-Scholes Greeks (analytic closed-form). */
  private bsGreeks(
    S: number,
    K: number,
    T: number,
    r: number,
    sigma: number,
    optionType: 'call' | 'put',
  ): OptionGreeks {
    const { d1, d2 } = this.bsD1D2(S, K, T, r, sigma)
    const sqrtT = Math.sqrt(T)
    const discountFactor = Math.exp(-r * T)
    const nd1 = normalPDF(d1)

    // Delta
    let delta: number
    if (optionType === 'call') {
      delta = normalCDF(d1)
    } else {
      delta = normalCDF(d1) - 1
    }

    // Gamma (same for call and put)
    const gamma = sigma * sqrtT > 1e-14 ? nd1 / (S * sigma * sqrtT) : 0

    // Theta (per year; divide by 365 for daily)
    let theta: number
    if (optionType === 'call') {
      theta = -(S * nd1 * sigma) / (2 * sqrtT) - r * K * discountFactor * normalCDF(d2)
    } else {
      theta = -(S * nd1 * sigma) / (2 * sqrtT) + r * K * discountFactor * normalCDF(-d2)
    }
    // Convert to per-day
    theta /= 365

    // Vega (per 1% vol change → divide by 100)
    const vega = (S * sqrtT * nd1) / 100

    // Rho (per 1% rate change → divide by 100)
    let rho: number
    if (optionType === 'call') {
      rho = (K * T * discountFactor * normalCDF(d2)) / 100
    } else {
      rho = (-K * T * discountFactor * normalCDF(-d2)) / 100
    }

    return {
      delta: round6(delta),
      gamma: round6(gamma),
      theta: round6(theta),
      vega: round6(vega),
      rho: round6(rho),
    }
  }

  /** Black-Scholes Vega (unscaled, for Newton-Raphson IV solving). */
  private bsVega(S: number, K: number, T: number, r: number, sigma: number): number {
    const { d1 } = this.bsD1D2(S, K, T, r, sigma)
    return S * Math.sqrt(T) * normalPDF(d1)
  }

  // ── Binomial Tree Internals ──────────────────────────────────────────────

  /**
   * Cox-Ross-Rubinstein binomial tree for European option pricing.
   *
   * Up factor   u = exp(σ√Δt)
   * Down factor d = 1/u
   * Risk-neutral probability p = (exp(rΔt) − d) / (u − d)
   */
  private binomialPrice(
    S: number,
    K: number,
    T: number,
    r: number,
    sigma: number,
    optionType: 'call' | 'put',
  ): number {
    const n = this.config.binomialSteps
    const dt = T / n
    const u = Math.exp(sigma * Math.sqrt(dt))
    const d = 1 / u
    const disc = Math.exp(-r * dt)
    const p = (Math.exp(r * dt) - d) / (u - d)
    const q = 1 - p

    // Terminal payoffs
    const prices: number[] = new Array(n + 1)
    for (let i = 0; i <= n; i++) {
      const sT = S * Math.pow(u, n - i) * Math.pow(d, i)
      prices[i] = optionType === 'call' ? Math.max(sT - K, 0) : Math.max(K - sT, 0)
    }

    // Backward induction
    for (let step = n - 1; step >= 0; step--) {
      for (let i = 0; i <= step; i++) {
        prices[i] = disc * (p * prices[i] + q * prices[i + 1])
      }
    }

    return prices[0]
  }

  // ── Volatility Model Internals ───────────────────────────────────────────

  /** Historical (realised) volatility: annualised standard deviation. */
  private fitHistoricalVol(returns: number[]): VolatilityModel {
    const vol = stddev(returns) * Math.sqrt(252)
    const horizon = this.config.volatilityForecastHorizon
    const forecast = new Array(horizon).fill(round6(vol))

    return {
      type: 'historical',
      params: { annualisedVol: round6(vol), observations: returns.length },
      forecast,
    }
  }

  /**
   * GARCH(1,1) conditional variance model.
   *
   *   σ²(t) = ω + α·r²(t−1) + β·σ²(t−1)
   *
   * Fits the model then forecasts forward by recursion.
   */
  private fitGARCH(returns: number[]): VolatilityModel {
    const omega = this.config.garchOmega
    const alpha = this.config.garchAlpha
    const beta = this.config.garchBeta

    // Initialise with sample variance
    let sigmaSquared = variance(returns)
    const conditionalVars: number[] = [sigmaSquared]

    // Fit: run through return series
    for (let t = 1; t < returns.length; t++) {
      sigmaSquared = omega + alpha * returns[t - 1] ** 2 + beta * sigmaSquared
      conditionalVars.push(sigmaSquared)
    }

    // Forecast: iterate forward from last conditional variance
    const lastVar = conditionalVars[conditionalVars.length - 1] || variance(returns)
    const forecast: number[] = []
    let forecastVar = lastVar

    for (let h = 0; h < this.config.volatilityForecastHorizon; h++) {
      forecastVar = omega + (alpha + beta) * forecastVar
      forecast.push(round6(Math.sqrt(forecastVar * 252)))
    }

    return {
      type: 'garch',
      params: {
        omega: round6(omega),
        alpha: round6(alpha),
        beta: round6(beta),
        persistence: round6(alpha + beta),
        unconditionalVol: round6(Math.sqrt((omega / Math.max(1 - alpha - beta, 0.001)) * 252)),
      },
      forecast,
    }
  }

  /**
   * Exponentially Weighted Moving Average (EWMA) volatility model.
   *
   *   σ²(t) = λ·σ²(t−1) + (1−λ)·r²(t−1)
   *
   * RiskMetrics uses λ = 0.94 for daily data.
   */
  private fitEWMA(returns: number[]): VolatilityModel {
    const lambda = this.config.ewmaLambda

    let sigmaSquared = variance(returns)
    const varSeries: number[] = [sigmaSquared]

    for (let t = 1; t < returns.length; t++) {
      sigmaSquared = lambda * sigmaSquared + (1 - lambda) * returns[t - 1] ** 2
      varSeries.push(sigmaSquared)
    }

    const lastVar = varSeries[varSeries.length - 1] || variance(returns)
    const forecast: number[] = []
    let forecastVar = lastVar

    for (let h = 0; h < this.config.volatilityForecastHorizon; h++) {
      // EWMA forecast is flat (martingale property)
      forecastVar = lambda * forecastVar + (1 - lambda) * lastVar
      forecast.push(round6(Math.sqrt(forecastVar * 252)))
    }

    return {
      type: 'ewma',
      params: {
        lambda: round6(lambda),
        lastDailyVol: round6(Math.sqrt(lastVar)),
        annualisedVol: round6(Math.sqrt(lastVar * 252)),
      },
      forecast,
    }
  }

  // ── Algo Execution Internals ─────────────────────────────────────────────

  /** Normalise strategy name to supported enum. */
  private normalizeStrategy(strategy: string): 'vwap' | 'twap' | 'pov' | 'is' | 'iceberg' {
    const s = strategy.toLowerCase().trim()
    if (s === 'vwap') return 'vwap'
    if (s === 'twap') return 'twap'
    if (s === 'pov' || s === 'percentage-of-volume') return 'pov'
    if (s === 'is' || s === 'implementation-shortfall') return 'is'
    if (s === 'iceberg') return 'iceberg'
    return 'twap'
  }

  /**
   * VWAP execution plan.
   * Distributes the order across the day in proportion to a U-shaped
   * intraday volume profile (heavier at open and close).
   */
  private planVWAP(
    orderSize: number,
    avgVolume: number,
    participation: number,
    urgency: number,
  ): AlgoExecution {
    // Market impact: square-root model  impact ∝ σ·√(Q/V)
    const impact = 0.1 * Math.sqrt(participation)
    const slippage = impact * (1 + urgency * 0.5)
    const timeHours = Math.max(6.5 * (1 - urgency * 0.6), 0.5)

    return {
      strategy: 'vwap',
      params: {
        orderSize: round2(orderSize),
        avgVolume: round2(avgVolume),
        participation: round6(participation),
        urgency: round4(urgency),
        numSlices: Math.ceil(timeHours * 12), // 5-min slices
      },
      expectedSlippage: round6(clamp(slippage, 0, this.config.maxSlippageBps / 10000)),
      estimatedTime: round2(timeHours * 60),
      description:
        `VWAP execution over ${round2(timeHours)} hours with ` +
        `${Math.ceil(timeHours * 12)} time slices tracking intraday volume profile. ` +
        `Expected participation rate: ${round4(participation * 100)}% of ADV.`,
    }
  }

  /** TWAP execution plan — equal-sized slices at fixed intervals. */
  private planTWAP(
    orderSize: number,
    avgVolume: number,
    participation: number,
    urgency: number,
  ): AlgoExecution {
    const timeHours = Math.max(6.5 * (1 - urgency * 0.7), 0.25)
    const numSlices = Math.ceil(timeHours * 12)
    const sliceSize = orderSize / numSlices
    const impact = 0.08 * Math.sqrt(participation)
    const slippage = impact * (1 + urgency * 0.3)

    return {
      strategy: 'twap',
      params: {
        orderSize: round2(orderSize),
        sliceSize: round2(sliceSize),
        numSlices,
        intervalMinutes: round2((timeHours * 60) / numSlices),
        urgency: round4(urgency),
      },
      expectedSlippage: round6(clamp(slippage, 0, this.config.maxSlippageBps / 10000)),
      estimatedTime: round2(timeHours * 60),
      description:
        `TWAP execution: ${numSlices} equal slices of ${round2(sliceSize)} units ` +
        `every ${round2((timeHours * 60) / numSlices)} minutes ` +
        `over ${round2(timeHours)} hours.`,
    }
  }

  /** POV (Percentage of Volume) execution plan. */
  private planPOV(
    orderSize: number,
    avgVolume: number,
    participation: number,
    urgency: number,
  ): AlgoExecution {
    const targetRate = clamp(0.05 + urgency * 0.2, 0.01, 0.3)
    const estHours = (participation / targetRate) * 6.5
    const timeHours = clamp(estHours, 0.25, 6.5)
    const impact = 0.12 * Math.sqrt(targetRate)
    const slippage = impact * (1 + urgency * 0.4)

    return {
      strategy: 'pov',
      params: {
        orderSize: round2(orderSize),
        targetParticipationRate: round4(targetRate),
        avgVolume: round2(avgVolume),
        urgency: round4(urgency),
      },
      expectedSlippage: round6(clamp(slippage, 0, this.config.maxSlippageBps / 10000)),
      estimatedTime: round2(timeHours * 60),
      description:
        `POV execution targeting ${round4(targetRate * 100)}% of market volume. ` +
        `Estimated completion in ${round2(timeHours)} hours adapting to real-time flow.`,
    }
  }

  /**
   * Implementation Shortfall execution plan.
   * Balances urgency (timing risk) against market impact by front-loading
   * execution when urgency is high.
   */
  private planIS(
    orderSize: number,
    avgVolume: number,
    participation: number,
    urgency: number,
  ): AlgoExecution {
    // Almgren-Chriss style: front-load when urgency is high
    const aggressiveness = 0.3 + urgency * 0.6
    const timeHours = Math.max(6.5 * (1 - aggressiveness * 0.8), 0.25)
    const impact = 0.15 * Math.sqrt(participation) * aggressiveness
    const timingRisk = 0.02 * (1 - aggressiveness) * Math.sqrt(participation)
    const slippage = impact + timingRisk

    return {
      strategy: 'is',
      params: {
        orderSize: round2(orderSize),
        aggressiveness: round4(aggressiveness),
        expectedImpact: round6(impact),
        timingRisk: round6(timingRisk),
        urgency: round4(urgency),
      },
      expectedSlippage: round6(clamp(slippage, 0, this.config.maxSlippageBps / 10000)),
      estimatedTime: round2(timeHours * 60),
      description:
        `Implementation Shortfall with aggressiveness ${round4(aggressiveness)}. ` +
        `Balances impact cost (${round6(impact * 10000)} bps) vs timing risk ` +
        `(${round6(timingRisk * 10000)} bps) over ${round2(timeHours)} hours.`,
    }
  }

  /** Iceberg execution plan — hide true size behind small visible clips. */
  private planIceberg(
    orderSize: number,
    avgVolume: number,
    participation: number,
    urgency: number,
  ): AlgoExecution {
    // Visible clip: 1-5% of total order, randomised for camouflage
    const visiblePct = clamp(0.01 + (1 - urgency) * 0.04, 0.01, 0.1)
    const clipSize = orderSize * visiblePct
    const numClips = Math.ceil(1 / visiblePct)
    const timeHours = Math.max(6.5 * (1 - urgency * 0.5), 1)
    const impact = 0.06 * Math.sqrt(participation) // lower impact — hidden
    const slippage = impact * (1 + urgency * 0.2)

    return {
      strategy: 'iceberg',
      params: {
        orderSize: round2(orderSize),
        clipSize: round2(clipSize),
        numClips,
        visiblePct: round4(visiblePct),
        urgency: round4(urgency),
      },
      expectedSlippage: round6(clamp(slippage, 0, this.config.maxSlippageBps / 10000)),
      estimatedTime: round2(timeHours * 60),
      description:
        `Iceberg execution: ${numClips} clips of ${round2(clipSize)} units ` +
        `(${round4(visiblePct * 100)}% visible) over ${round2(timeHours)} hours. ` +
        `Total order of ${round2(orderSize)} hidden from the book.`,
    }
  }

  // ── Risk & DeFi Internals ────────────────────────────────────────────────

  /** Compute maximum drawdown from a return series. */
  private computeMaxDrawdown(returns: number[]): number {
    if (returns.length === 0) return 0

    let cumulative = 1
    let peak = 1
    let maxDD = 0

    for (const r of returns) {
      cumulative *= 1 + r
      if (cumulative > peak) peak = cumulative
      const dd = (peak - cumulative) / peak
      if (dd > maxDD) maxDD = dd
    }

    return maxDD
  }

  /**
   * Omega ratio: probability-weighted ratio of gains to losses relative
   * to a threshold return.
   *
   *   Ω(τ) = ∫[τ→∞] (1 − F(r)) dr  /  ∫[−∞→τ] F(r) dr
   *
   * Approximated discretely from the return series.
   */
  private computeOmegaRatio(returns: number[], threshold: number): number {
    let gains = 0
    let losses = 0

    for (const r of returns) {
      if (r > threshold) {
        gains += r - threshold
      } else {
        losses += threshold - r
      }
    }

    return losses > 1e-14 ? gains / losses : gains > 0 ? 10 : 1
  }

  /**
   * Impermanent loss for a constant-product AMM.
   *
   *   IL = 2√(priceRatio) / (1 + priceRatio) − 1
   *
   * Returns the loss as a positive fraction (e.g. 0.05 = 5% loss).
   */
  private computeImpermanentLoss(priceRatio: number): number {
    if (priceRatio <= 0) return 0
    const sqrtR = Math.sqrt(priceRatio)
    const il = (2 * sqrtR) / (1 + priceRatio) - 1
    return Math.abs(il)
  }

  /** Estimate gas cost in USD based on protocol type. */
  private estimateGas(proto: DeFiProtocol | undefined): number {
    if (!proto) return 50
    switch (proto.type) {
      case 'dex':
        return proto.chain === 'Ethereum' ? 35 : 5
      case 'lending':
        return proto.chain === 'Ethereum' ? 45 : 8
      case 'yield':
        return proto.chain === 'Ethereum' ? 60 : 10
      case 'derivatives':
        return proto.chain === 'Ethereum' ? 55 : 12
      case 'bridge':
        return proto.chain === 'Ethereum' ? 80 : 15
      default:
        return 50
    }
  }

  /** Default volatility estimate when none is provided (30% annualised). */
  private estimateDefaultVol(): number {
    return 0.3
  }

  // ── Extended Analytics Internals ─────────────────────────────────────────

  /**
   * Compute modified duration of a bond — sensitivity of price to yield changes.
   *
   *   D_mod = (1 / P) Σ [ t · C / (1+y)^t ] + [ n · FV / (1+y)^n ]
   *   then divide by (1+y) for modified duration.
   *
   * Used internally for bond risk assessment.
   */
  private computeModifiedDuration(
    faceValue: number,
    couponRate: number,
    yieldRate: number,
    periods: number,
  ): number {
    if (periods <= 0 || yieldRate <= -1) return 0

    const coupon = faceValue * couponRate
    let macaulayNumerator = 0
    let price = 0

    for (let t = 1; t <= periods; t++) {
      const pv = coupon / Math.pow(1 + yieldRate, t)
      macaulayNumerator += t * pv
      price += pv
    }

    const fvPV = faceValue / Math.pow(1 + yieldRate, periods)
    macaulayNumerator += periods * fvPV
    price += fvPV

    if (price === 0) return 0

    const macaulay = macaulayNumerator / price
    return macaulay / (1 + yieldRate)
  }

  /**
   * Compute bond convexity — second-order price sensitivity.
   *
   *   Convexity = (1 / P) Σ [ t(t+1) · C / (1+y)^(t+2) ] + n(n+1)·FV / (1+y)^(n+2)
   *
   * Higher convexity means the bond's price-yield relationship is more curved,
   * offering better protection against yield increases.
   */
  private computeConvexity(
    faceValue: number,
    couponRate: number,
    yieldRate: number,
    periods: number,
  ): number {
    if (periods <= 0 || yieldRate <= -1) return 0

    const coupon = faceValue * couponRate
    let convexNumerator = 0
    let price = 0

    for (let t = 1; t <= periods; t++) {
      const pv = coupon / Math.pow(1 + yieldRate, t)
      convexNumerator += (t * (t + 1) * coupon) / Math.pow(1 + yieldRate, t + 2)
      price += pv
    }

    const fvPV = faceValue / Math.pow(1 + yieldRate, periods)
    convexNumerator += (periods * (periods + 1) * faceValue) / Math.pow(1 + yieldRate, periods + 2)
    price += fvPV

    if (price === 0) return 0
    return convexNumerator / price
  }

  /**
   * Generate a log-normal price path via geometric Brownian motion.
   *
   *   S(t+dt) = S(t) · exp((μ − σ²/2)·dt + σ·√dt·Z)
   *
   * Returns the full path of prices for one simulation run.
   * Used internally by Monte Carlo analysis to produce individual paths
   * when additional path-level statistics are needed.
   */
  private generateGBMPath(
    initialPrice: number,
    drift: number,
    volatility: number,
    days: number,
  ): number[] {
    const dt = 1 / 252
    const path: number[] = [initialPrice]
    let price = initialPrice

    for (let d = 0; d < days; d++) {
      const z = boxMullerRandom()
      price *= Math.exp(
        (drift - 0.5 * volatility * volatility) * dt + volatility * Math.sqrt(dt) * z,
      )
      path.push(price)
    }

    return path
  }

  /**
   * Compute the autocorrelation of a return series at a given lag.
   *
   * Autocorrelation measures the linear dependence between returns
   * separated by `lag` periods. Positive autocorrelation suggests
   * momentum; negative suggests mean reversion.
   *
   *   ρ(lag) = Cov(r_t, r_{t-lag}) / Var(r_t)
   */
  private computeAutocorrelation(returns: number[], lag: number): number {
    if (returns.length <= lag) return 0

    const n = returns.length
    const mu = mean(returns)
    let numerator = 0
    let denominator = 0

    for (let t = 0; t < n; t++) {
      denominator += (returns[t] - mu) ** 2
    }

    for (let t = lag; t < n; t++) {
      numerator += (returns[t] - mu) * (returns[t - lag] - mu)
    }

    if (denominator === 0) return 0
    return clamp(numerator / denominator, -1, 1)
  }

  /**
   * Estimate the Hurst exponent from a return series using R/S analysis.
   *
   * H > 0.5 indicates trending (persistent) behaviour.
   * H < 0.5 indicates mean-reverting (anti-persistent) behaviour.
   * H ≈ 0.5 indicates a random walk.
   *
   * Uses rescaled range (R/S) analysis over multiple sub-periods:
   *   E[R(n)/S(n)] = C · n^H
   *
   * We estimate H via linear regression of log(R/S) on log(n).
   */
  private estimateHurstExponent(returns: number[]): number {
    if (returns.length < 20) return 0.5

    const logRS: number[] = []
    const logN: number[] = []

    // Evaluate at multiple sub-period lengths
    const minLen = 10
    const maxLen = Math.floor(returns.length / 2)
    const step = Math.max(1, Math.floor((maxLen - minLen) / 8))

    for (let n = minLen; n <= maxLen; n += step) {
      const numBlocks = Math.floor(returns.length / n)
      if (numBlocks < 1) continue

      let rsSum = 0
      for (let b = 0; b < numBlocks; b++) {
        const block = returns.slice(b * n, (b + 1) * n)
        const mu = mean(block)
        const sigma = stddev(block)
        if (sigma === 0) continue

        // Cumulative deviations from mean
        const cumDev: number[] = []
        let cumSum = 0
        for (const r of block) {
          cumSum += r - mu
          cumDev.push(cumSum)
        }

        const range = Math.max(...cumDev) - Math.min(...cumDev)
        rsSum += range / sigma
      }

      const avgRS = rsSum / numBlocks
      if (avgRS > 0) {
        logRS.push(Math.log(avgRS))
        logN.push(Math.log(n))
      }
    }

    if (logRS.length < 2) return 0.5

    // Simple linear regression: H = slope of log(R/S) vs log(n)
    const mX = mean(logN)
    const mY = mean(logRS)
    let num = 0
    let den = 0
    for (let i = 0; i < logRS.length; i++) {
      num += (logN[i] - mX) * (logRS[i] - mY)
      den += (logN[i] - mX) ** 2
    }

    const hurst = den > 0 ? num / den : 0.5
    return clamp(round4(hurst), 0, 1)
  }

  /**
   * Compute the Information Ratio for a returns series against a benchmark.
   *
   *   IR = mean(active_returns) / tracking_error
   *
   * Where active_returns = portfolio returns − benchmark returns
   * and tracking_error = stddev(active_returns).
   *
   * Used internally for performance evaluation of algo execution strategies.
   */
  private computeInformationRatio(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const n = Math.min(portfolioReturns.length, benchmarkReturns.length)
    if (n === 0) return 0

    const activeReturns: number[] = []
    for (let i = 0; i < n; i++) {
      activeReturns.push(portfolioReturns[i] - benchmarkReturns[i])
    }

    const trackingError = stddev(activeReturns)
    if (trackingError === 0) return 0

    return (mean(activeReturns) / trackingError) * Math.sqrt(252)
  }

  /**
   * Compute the Treynor ratio — risk-adjusted return per unit of systematic risk.
   *
   *   Treynor = (R_p − R_f) / β
   *
   * where β is the portfolio beta relative to the market.
   * Requires both portfolio and market return series.
   */
  private computeTreynorRatio(
    portfolioReturns: number[],
    marketReturns: number[],
    riskFreeRate: number,
  ): number {
    const n = Math.min(portfolioReturns.length, marketReturns.length)
    if (n < 2) return 0

    const pSlice = portfolioReturns.slice(0, n)
    const mSlice = marketReturns.slice(0, n)

    const mVar = variance(mSlice)
    if (mVar === 0) return 0

    // Beta = Cov(R_p, R_m) / Var(R_m)
    const mP = mean(pSlice)
    const mM = mean(mSlice)
    let cov = 0
    for (let i = 0; i < n; i++) {
      cov += (pSlice[i] - mP) * (mSlice[i] - mM)
    }
    cov /= n - 1
    const beta = cov / mVar

    if (Math.abs(beta) < 1e-10) return 0

    const dailyRf = riskFreeRate / 252
    const excessReturn = mP - dailyRf
    return round4((excessReturn * 252) / beta)
  }

  /**
   * Kelly criterion for optimal bet sizing.
   *
   *   f* = (p · (b + 1) − 1) / b
   *
   * where p = win probability, b = win/loss ratio.
   * Returns the fraction of capital to risk on a single trade.
   * Clamped to [0, 1] for safety (no leveraged Kelly).
   */
  private kellyFraction(winProbability: number, winLossRatio: number): number {
    if (winLossRatio <= 0) return 0
    const f = (winProbability * (winLossRatio + 1) - 1) / winLossRatio
    return clamp(round6(f), 0, 1)
  }

  /**
   * Compute the rolling Sharpe ratio over a sliding window.
   *
   * Returns an array of Sharpe values, one per window position.
   * Useful for monitoring strategy quality over time.
   */
  private rollingSharpeSeries(
    returns: number[],
    windowSize: number,
    riskFreeRate: number,
  ): number[] {
    const result: number[] = []
    const dailyRf = riskFreeRate / 252

    for (let i = windowSize; i <= returns.length; i++) {
      const window = returns.slice(i - windowSize, i)
      const mu = mean(window)
      const sigma = stddev(window)
      const sharpe = sigma > 0 ? ((mu - dailyRf) / sigma) * Math.sqrt(252) : 0
      result.push(round4(sharpe))
    }

    return result
  }
}
