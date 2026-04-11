/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          💼  P O R T F O L I O   O P T I M I Z E R                          ║
 * ║                                                                             ║
 * ║   Portfolio optimization and risk management:                               ║
 * ║     optimize → assess → allocate → rebalance                                ║
 * ║                                                                             ║
 * ║     • Mean-variance optimization (Markowitz efficient frontier)             ║
 * ║     • Risk assessment: VaR, CVaR, Beta, Sharpe & Sortino ratios            ║
 * ║     • Asset allocation for conservative/moderate/aggressive profiles        ║
 * ║     • Diversification scoring and correlation analysis                      ║
 * ║     • Drift detection and rebalancing trade suggestions                     ║
 * ║     • Position sizing: Kelly criterion & fixed-fractional methods           ║
 * ║     • Drawdown analysis with recovery periods                               ║
 * ║     • Performance attribution: selection vs timing vs interaction           ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface PortfolioOptimizerConfig {
  riskFreeRate: number
  maxPositionSize: number
  minPositionSize: number
  rebalanceThreshold: number
  minAssets: number
  maxAssets: number
  targetReturn: number
  confidenceLevel: number
  maxDrawdownLimit: number
  enableLearning: boolean
  frontierPoints: number
  gradientStepSize: number
  gradientIterations: number
}

export interface PortfolioOptimizerStats {
  totalOptimizations: number
  totalRiskAssessments: number
  totalRebalances: number
  totalAllocations: number
  avgSharpe: number
  avgDiversification: number
  feedbackReceived: number
  feedbackAccuracy: number
}

export interface Asset {
  id: string
  name: string
  returns: number[]
  expectedReturn: number
  volatility: number
  weight: number
}

export interface Portfolio {
  assets: Asset[]
  totalReturn: number
  totalRisk: number
  sharpeRatio: number
  sortino: number
  maxDrawdown: number
  diversificationScore: number
}

export interface EfficientFrontierPoint {
  risk: number
  return_: number
  weights: number[]
  sharpe: number
}

export interface OptimizationResult {
  portfolio: Portfolio
  efficientFrontier: EfficientFrontierPoint[]
  constraints: string[]
  method: 'analytical' | 'gradient-descent' | 'equal-weight'
}

export interface StressTestResult {
  scenario: string
  portfolioReturn: number
  portfolioRisk: number
  worstAsset: string
  bestAsset: string
}

export interface RiskAssessment {
  var95: number
  var99: number
  cvar: number
  beta: number
  correlation: number[][]
  worstCase: number
  stressTests: StressTestResult[]
}

export type RiskProfile = 'conservative' | 'moderate' | 'aggressive'

export interface AllocationEntry {
  assetId: string
  assetName: string
  weight: number
}

export interface AllocationRecommendation {
  riskProfile: RiskProfile
  allocations: AllocationEntry[]
  reasoning: string[]
  expectedReturn: number
  expectedRisk: number
}

export interface RebalanceTrade {
  assetId: string
  assetName: string
  currentWeight: number
  targetWeight: number
  action: 'buy' | 'sell'
  amount: number
}

export interface PositionSize {
  method: 'kelly' | 'fixed'
  size: number
  confidence: number
  maxLoss: number
}

export interface RecoveryPeriod {
  start: number
  end: number
  duration: number
  drawdownDepth: number
}

export interface DrawdownAnalysis {
  maxDrawdown: number
  currentDrawdown: number
  recoveryPeriods: RecoveryPeriod[]
  underwaterPercentage: number
}

export interface PerformanceAttribution {
  totalReturn: number
  assetSelection: number
  marketTiming: number
  interactionEffect: number
  residual: number
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: PortfolioOptimizerConfig = {
  riskFreeRate: 0.04,
  maxPositionSize: 0.4,
  minPositionSize: 0.02,
  rebalanceThreshold: 0.05,
  minAssets: 2,
  maxAssets: 30,
  targetReturn: 0.08,
  confidenceLevel: 0.95,
  maxDrawdownLimit: 0.25,
  enableLearning: true,
  frontierPoints: 50,
  gradientStepSize: 0.001,
  gradientIterations: 1000,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function variance(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1)
}

function stddev(arr: number[]): number {
  return Math.sqrt(variance(arr))
}

function covariance(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length)
  if (len < 2) return 0
  const mA = mean(a.slice(0, len))
  const mB = mean(b.slice(0, len))
  let sum = 0
  for (let i = 0; i < len; i++) {
    sum += (a[i] - mA) * (b[i] - mB)
  }
  return sum / (len - 1)
}

function correlation(a: number[], b: number[]): number {
  const sA = stddev(a)
  const sB = stddev(b)
  if (sA === 0 || sB === 0) return 0
  return clamp(covariance(a, b) / (sA * sB), -1, 1)
}

/** Build the covariance matrix from asset return arrays. */
function buildCovarianceMatrix(assets: Asset[]): number[][] {
  const n = assets.length
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const cov = covariance(assets[i].returns, assets[j].returns)
      matrix[i][j] = cov
      matrix[j][i] = cov
    }
  }
  return matrix
}

/** Build the correlation matrix from asset return arrays. */
function buildCorrelationMatrix(assets: Asset[]): number[][] {
  const n = assets.length
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const corr = i === j ? 1 : correlation(assets[i].returns, assets[j].returns)
      matrix[i][j] = round4(corr)
      matrix[j][i] = round4(corr)
    }
  }
  return matrix
}

/** Portfolio return given weights and expected returns. */
function portfolioReturn(weights: number[], expectedReturns: number[]): number {
  let r = 0
  for (let i = 0; i < weights.length; i++) {
    r += weights[i] * expectedReturns[i]
  }
  return r
}

/** Portfolio variance given weights and covariance matrix. */
function portfolioVariance(weights: number[], covMatrix: number[][]): number {
  const n = weights.length
  let v = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      v += weights[i] * weights[j] * covMatrix[i][j]
    }
  }
  return Math.max(v, 0)
}

/** Normalize weights so they sum to 1, enforcing min/max bounds. */
function normalizeWeights(weights: number[], minW: number, maxW: number): number[] {
  const clamped = weights.map(w => clamp(Math.max(w, 0), minW, maxW))
  const total = clamped.reduce((s, w) => s + w, 0)
  if (total === 0) {
    const n = clamped.length
    return clamped.map(() => 1 / n)
  }
  return clamped.map(w => w / total)
}

/**
 * Approximate the inverse-normal (quantile) function using
 * Beasley-Springer-Moro algorithm for the standard normal distribution.
 */
function normInv(p: number): number {
  if (p <= 0) return -8
  if (p >= 1) return 8

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
    -3.066479806614716e1, 2.506628277459239,
  ]
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1,
  ]
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783,
  ]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]

  const pLow = 0.02425
  const pHigh = 1 - pLow

  let q: number
  let r: number

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  } else if (p <= pHigh) {
    q = p - 0.5
    r = q * q
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    )
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p))
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  }
}

/** Compute cumulative returns from period returns. */
function cumulativeReturns(returns: number[]): number[] {
  const cumulative: number[] = []
  let value = 1
  for (const r of returns) {
    value *= 1 + r
    cumulative.push(value)
  }
  return cumulative
}

/** Compute the downside deviation (semi-deviation below target). */
function downsideDeviation(returns: number[], target: number): number {
  const downsideReturns = returns.filter(r => r < target).map(r => (r - target) ** 2)
  if (downsideReturns.length === 0) return 0
  return Math.sqrt(downsideReturns.reduce((s, v) => s + v, 0) / downsideReturns.length)
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class PortfolioOptimizer {
  private readonly config: PortfolioOptimizerConfig
  private totalOptimizations = 0
  private totalRiskAssessments = 0
  private totalRebalances = 0
  private totalAllocations = 0
  private sharpeHistory: number[] = []
  private diversificationHistory: number[] = []
  private feedbackCorrect = 0
  private feedbackTotal = 0

  constructor(config?: Partial<PortfolioOptimizerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ── Mean-Variance Optimization ──────────────────────────────────────────

  /** Run Markowitz mean-variance optimization on a set of assets. */
  optimize(assets: Asset[]): OptimizationResult {
    this.totalOptimizations++
    const n = assets.length

    if (n < this.config.minAssets) {
      return this.equalWeightFallback(assets, [`Need at least ${this.config.minAssets} assets`])
    }
    if (n > this.config.maxAssets) {
      assets = assets.slice(0, this.config.maxAssets)
    }

    const covMatrix = buildCovarianceMatrix(assets)
    const expectedReturns = assets.map(a => a.expectedReturn)

    // For 2 assets, use the analytical closed-form solution
    const method: OptimizationResult['method'] = n === 2 ? 'analytical' : 'gradient-descent'
    const optimalWeights =
      n === 2
        ? this.analyticalTwoAsset(assets, covMatrix)
        : this.gradientDescentOptimize(assets, covMatrix)

    const finalWeights = normalizeWeights(
      optimalWeights,
      this.config.minPositionSize,
      this.config.maxPositionSize,
    )

    const pRet = portfolioReturn(finalWeights, expectedReturns)
    const pVar = portfolioVariance(finalWeights, covMatrix)
    const pRisk = Math.sqrt(pVar)
    const sharpe = pRisk > 0 ? (pRet - this.config.riskFreeRate) / pRisk : 0

    // Build weighted portfolio returns for drawdown / sortino
    const weightedReturns = this.computeWeightedReturns(assets, finalWeights)
    const dd = this.computeDrawdown(weightedReturns)
    const sortino = this.computeSortino(weightedReturns, this.config.riskFreeRate)
    const divScore = this.computeDiversificationScore(finalWeights, covMatrix)

    // Build efficient frontier
    const frontier = this.buildEfficientFrontier(assets, covMatrix)

    const optimizedAssets = assets.map((a, i) => ({ ...a, weight: round4(finalWeights[i]) }))

    const portfolio: Portfolio = {
      assets: optimizedAssets,
      totalReturn: round4(pRet),
      totalRisk: round4(pRisk),
      sharpeRatio: round4(sharpe),
      sortino: round4(sortino),
      maxDrawdown: round4(dd.maxDrawdown),
      diversificationScore: round4(divScore),
    }

    this.sharpeHistory.push(sharpe)
    this.diversificationHistory.push(divScore)

    return {
      portfolio,
      efficientFrontier: frontier,
      constraints: [
        `Min position: ${this.config.minPositionSize * 100}%`,
        `Max position: ${this.config.maxPositionSize * 100}%`,
        `Risk-free rate: ${this.config.riskFreeRate * 100}%`,
      ],
      method,
    }
  }

  /**
   * Analytical solution for 2-asset portfolio.
   * Minimum variance weight for asset 1:
   *   w1 = (σ2² - σ12) / (σ1² + σ2² - 2σ12)
   * Then adjust toward max-Sharpe via a blend with the tangency weight.
   */
  private analyticalTwoAsset(assets: Asset[], covMatrix: number[][]): number[] {
    const s1sq = covMatrix[0][0]
    const s2sq = covMatrix[1][1]
    const s12 = covMatrix[0][1]
    const denom = s1sq + s2sq - 2 * s12

    let wMinVar: number
    if (Math.abs(denom) < 1e-12) {
      wMinVar = 0.5
    } else {
      wMinVar = clamp((s2sq - s12) / denom, 0, 1)
    }

    // Tangency (max-Sharpe) weight
    const e1 = assets[0].expectedReturn - this.config.riskFreeRate
    const e2 = assets[1].expectedReturn - this.config.riskFreeRate
    const tangDenom = e1 * s2sq + e2 * s1sq - (e1 + e2) * s12
    let wTangency: number
    if (Math.abs(tangDenom) < 1e-12) {
      wTangency = wMinVar
    } else {
      wTangency = clamp((e1 * s2sq - e2 * s12) / tangDenom, 0, 1)
    }

    // Blend: 70% tangency, 30% min-var for stability
    const w1 = 0.7 * wTangency + 0.3 * wMinVar
    return [clamp(w1, 0, 1), clamp(1 - w1, 0, 1)]
  }

  /**
   * Gradient descent optimization for N assets.
   * Maximize the Sharpe ratio by iteratively adjusting weights.
   */
  private gradientDescentOptimize(assets: Asset[], covMatrix: number[][]): number[] {
    const n = assets.length
    const expectedReturns = assets.map(a => a.expectedReturn)
    let weights = new Array(n).fill(1 / n)
    const lr = this.config.gradientStepSize
    const iters = this.config.gradientIterations
    const eps = 1e-8

    for (let iter = 0; iter < iters; iter++) {
      const pRet = portfolioReturn(weights, expectedReturns)
      const pVar = portfolioVariance(weights, covMatrix)
      const pStd = Math.sqrt(pVar + eps)
      // Compute gradient of Sharpe ratio w.r.t. each weight
      const gradient = new Array(n).fill(0)
      for (let i = 0; i < n; i++) {
        // ∂R/∂wi = expectedReturns[i]
        const dRetDwi = expectedReturns[i]

        // ∂σ²/∂wi = 2 * Σ_j(wj * covMatrix[i][j])
        let dVarDwi = 0
        for (let j = 0; j < n; j++) {
          dVarDwi += 2 * weights[j] * covMatrix[i][j]
        }
        // ∂σ/∂wi = dVarDwi / (2 * σ)
        const dStdDwi = dVarDwi / (2 * pStd)

        // ∂Sharpe/∂wi = (dRet * σ - (R - Rf) * dStd) / σ²
        gradient[i] = (dRetDwi * pStd - (pRet - this.config.riskFreeRate) * dStdDwi) / (pVar + eps)
      }

      // Apply gradient ascent (maximize Sharpe)
      for (let i = 0; i < n; i++) {
        weights[i] += lr * gradient[i]
        weights[i] = Math.max(weights[i], 0)
      }

      // Normalize weights
      const total = weights.reduce((s, w) => s + w, 0)
      if (total > 0) {
        weights = weights.map(w => w / total)
      }

      // Early termination if gradient is negligible
      const gradNorm = Math.sqrt(gradient.reduce((s, g) => s + g * g, 0))
      if (gradNorm < 1e-10 && iter > 50) break
    }

    return weights
  }

  /** Build efficient frontier by sweeping target returns. */
  private buildEfficientFrontier(assets: Asset[], covMatrix: number[][]): EfficientFrontierPoint[] {
    const expectedReturns = assets.map(a => a.expectedReturn)
    const minRet = Math.min(...expectedReturns)
    const maxRet = Math.max(...expectedReturns)
    const points: EfficientFrontierPoint[] = []
    const numPoints = this.config.frontierPoints

    for (let p = 0; p < numPoints; p++) {
      const targetRet = minRet + (maxRet - minRet) * (p / (numPoints - 1))

      // Find minimum variance portfolio subject to target return constraint
      const weights = this.minVarianceForTarget(assets, covMatrix, targetRet)
      const pRet = portfolioReturn(weights, expectedReturns)
      const pVar = portfolioVariance(weights, covMatrix)
      const pRisk = Math.sqrt(pVar)
      const sharpe = pRisk > 0 ? (pRet - this.config.riskFreeRate) / pRisk : 0

      points.push({
        risk: round4(pRisk),
        return_: round4(pRet),
        weights: weights.map(w => round4(w)),
        sharpe: round4(sharpe),
      })
    }

    return points
  }

  /** Minimum variance portfolio for a given target return (projected gradient). */
  private minVarianceForTarget(assets: Asset[], covMatrix: number[][], target: number): number[] {
    const n = assets.length
    const expectedReturns = assets.map(a => a.expectedReturn)
    let weights = new Array(n).fill(1 / n)
    const lr = this.config.gradientStepSize * 0.5
    const iters = Math.min(this.config.gradientIterations, 500)
    const lambda = 10 // Lagrange penalty for return constraint

    for (let iter = 0; iter < iters; iter++) {
      const pRet = portfolioReturn(weights, expectedReturns)

      // Gradient of portfolio variance + penalty for return deviation
      const gradient = new Array(n).fill(0)
      for (let i = 0; i < n; i++) {
        let dVarDwi = 0
        for (let j = 0; j < n; j++) {
          dVarDwi += 2 * weights[j] * covMatrix[i][j]
        }
        // Penalty gradient to steer toward target return
        const returnPenalty = 2 * lambda * (pRet - target) * expectedReturns[i]
        gradient[i] = dVarDwi + returnPenalty
      }

      // Gradient descent (minimize variance)
      for (let i = 0; i < n; i++) {
        weights[i] -= lr * gradient[i]
        weights[i] = Math.max(weights[i], 0)
      }

      const total = weights.reduce((s, w) => s + w, 0)
      if (total > 0) {
        weights = weights.map(w => w / total)
      }
    }

    return normalizeWeights(weights, 0, 1)
  }

  // ── Risk Assessment ─────────────────────────────────────────────────────

  /** Perform comprehensive risk assessment on a portfolio. */
  assessRisk(portfolio: Portfolio, marketReturns?: number[]): RiskAssessment {
    this.totalRiskAssessments++

    const assets = portfolio.assets
    const weights = assets.map(a => a.weight)
    const weightedReturns = this.computeWeightedReturns(assets, weights)

    // Value at Risk (parametric method)
    const mu = mean(weightedReturns)
    const sigma = stddev(weightedReturns)
    const var95 = -(mu + normInv(0.05) * sigma)
    const var99 = -(mu + normInv(0.01) * sigma)

    // Conditional VaR (Expected Shortfall) — average of losses beyond VaR
    const sorted = [...weightedReturns].sort((a, b) => a - b)
    const cutoff5 = Math.max(1, Math.floor(sorted.length * 0.05))
    const tail5 = sorted.slice(0, cutoff5)
    const cvar = tail5.length > 0 ? -mean(tail5) : var95

    // Beta relative to market
    const beta =
      marketReturns && marketReturns.length > 0
        ? this.computeBeta(weightedReturns, marketReturns)
        : 1.0

    // Correlation matrix
    const corrMatrix = buildCorrelationMatrix(assets)

    // Worst case (historical)
    const worstCase = weightedReturns.length > 0 ? -Math.min(...weightedReturns) : 0

    // Stress tests
    const stressTests = this.runStressTests(assets, weights)

    return {
      var95: round4(var95),
      var99: round4(var99),
      cvar: round4(cvar),
      beta: round4(beta),
      correlation: corrMatrix,
      worstCase: round4(worstCase),
      stressTests,
    }
  }

  /** Compute beta of portfolio relative to a market benchmark. */
  private computeBeta(portfolioReturns: number[], marketReturns: number[]): number {
    const cov = covariance(portfolioReturns, marketReturns)
    const marketVar = variance(marketReturns)
    if (marketVar === 0) return 1
    return cov / marketVar
  }

  /** Run stress test scenarios against the portfolio. */
  private runStressTests(assets: Asset[], weights: number[]): StressTestResult[] {
    const scenarios: { name: string; shocks: (asset: Asset) => number }[] = [
      {
        name: 'Market Crash (-30%)',
        shocks: a => a.expectedReturn - 0.3 * (a.volatility / 0.15),
      },
      {
        name: 'Rate Hike (+200bp)',
        shocks: a => a.expectedReturn - 0.05 * (a.volatility > 0.2 ? 1.5 : 0.8),
      },
      {
        name: 'Volatility Spike (2x)',
        shocks: a => a.expectedReturn - a.volatility * 0.5,
      },
      {
        name: 'Correlation Breakdown',
        shocks: a => a.expectedReturn * 0.6 - 0.1,
      },
      {
        name: 'Liquidity Crisis',
        shocks: a => a.expectedReturn - 0.15 * (a.volatility / 0.1),
      },
    ]

    return scenarios.map(scenario => {
      const stressedReturns = assets.map(a => scenario.shocks(a))
      const pReturn = portfolioReturn(weights, stressedReturns)
      const pRisk = stddev(stressedReturns)

      let worstIdx = 0
      let bestIdx = 0
      for (let i = 1; i < stressedReturns.length; i++) {
        if (stressedReturns[i] < stressedReturns[worstIdx]) worstIdx = i
        if (stressedReturns[i] > stressedReturns[bestIdx]) bestIdx = i
      }

      return {
        scenario: scenario.name,
        portfolioReturn: round4(pReturn),
        portfolioRisk: round4(pRisk),
        worstAsset: assets[worstIdx]?.name ?? 'N/A',
        bestAsset: assets[bestIdx]?.name ?? 'N/A',
      }
    })
  }

  // ── Asset Allocation ────────────────────────────────────────────────────

  /** Recommend an asset allocation based on risk tolerance. */
  recommendAllocation(assets: Asset[], riskProfile: RiskProfile): AllocationRecommendation {
    this.totalAllocations++
    const n = assets.length
    if (n === 0) {
      return {
        riskProfile,
        allocations: [],
        reasoning: ['No assets provided'],
        expectedReturn: 0,
        expectedRisk: 0,
      }
    }

    const reasoning: string[] = []

    // Sort assets by volatility ascending
    const indexed = assets.map((a, i) => ({ asset: a, idx: i }))
    indexed.sort((a, b) => a.asset.volatility - b.asset.volatility)

    // Build target weight distribution based on risk profile
    const rawWeights = new Array(n).fill(0)
    const profileParams = this.getProfileParams(riskProfile)

    reasoning.push(`Risk profile: ${riskProfile} (equity bias: ${profileParams.equityBias})`)

    for (let rank = 0; rank < n; rank++) {
      const normalizedRank = rank / (n - 1 || 1)
      // Higher rank = higher volatility = more equity-like
      const volWeight =
        profileParams.equityBias * normalizedRank +
        (1 - profileParams.equityBias) * (1 - normalizedRank)
      // Blend with return attractiveness
      const returnBonus = indexed[rank].asset.expectedReturn * profileParams.returnSensitivity
      rawWeights[indexed[rank].idx] = Math.max(volWeight + returnBonus, 0)
    }

    const weights = normalizeWeights(
      rawWeights,
      this.config.minPositionSize,
      this.config.maxPositionSize,
    )

    const allocations: AllocationEntry[] = assets.map((a, i) => ({
      assetId: a.id,
      assetName: a.name,
      weight: round4(weights[i]),
    }))

    const expectedReturns = assets.map(a => a.expectedReturn)
    const covMatrix = buildCovarianceMatrix(assets)
    const expRet = portfolioReturn(weights, expectedReturns)
    const expRisk = Math.sqrt(portfolioVariance(weights, covMatrix))

    reasoning.push(`Expected return: ${(expRet * 100).toFixed(2)}%`)
    reasoning.push(`Expected risk: ${(expRisk * 100).toFixed(2)}%`)
    reasoning.push(
      `Sharpe ratio: ${expRisk > 0 ? ((expRet - this.config.riskFreeRate) / expRisk).toFixed(2) : 'N/A'}`,
    )

    // Additional guidance per profile
    if (riskProfile === 'conservative') {
      reasoning.push('Conservative: emphasizing lower-volatility assets with stable returns')
    } else if (riskProfile === 'aggressive') {
      reasoning.push(
        'Aggressive: tilting toward higher-return assets, accepting greater volatility',
      )
    } else {
      reasoning.push('Moderate: balanced exposure across risk/return spectrum')
    }

    return {
      riskProfile,
      allocations,
      reasoning,
      expectedReturn: round4(expRet),
      expectedRisk: round4(expRisk),
    }
  }

  /** Return profile-specific parameters for allocation. */
  private getProfileParams(profile: RiskProfile): {
    equityBias: number
    returnSensitivity: number
  } {
    switch (profile) {
      case 'conservative':
        return { equityBias: 0.25, returnSensitivity: 0.3 }
      case 'moderate':
        return { equityBias: 0.5, returnSensitivity: 0.6 }
      case 'aggressive':
        return { equityBias: 0.8, returnSensitivity: 1.0 }
    }
  }

  // ── Diversification Score ───────────────────────────────────────────────

  /**
   * Compute a diversification score in [0, 1].
   * Uses the diversification ratio: weighted avg volatility / portfolio volatility.
   * A higher ratio means more diversification benefit.
   */
  computeDiversificationScore(weights: number[], covMatrix: number[][]): number {
    const n = weights.length
    if (n < 2) return 0

    // Weighted average individual volatility
    let weightedVol = 0
    for (let i = 0; i < n; i++) {
      weightedVol += weights[i] * Math.sqrt(Math.max(covMatrix[i][i], 0))
    }

    const pVol = Math.sqrt(portfolioVariance(weights, covMatrix))

    if (pVol === 0) return 1

    // Diversification ratio: typically >= 1; normalize to [0, 1]
    const divRatio = weightedVol / pVol
    // Map: ratio=1 → score=0, ratio=2 → score=0.67, ratio=3 → score=0.80
    const score = 1 - 1 / divRatio
    return clamp(round4(score), 0, 1)
  }

  /** Standalone diversification score for a portfolio. */
  getDiversificationScore(portfolio: Portfolio): number {
    const assets = portfolio.assets
    const weights = assets.map(a => a.weight)
    const covMatrix = buildCovarianceMatrix(assets)
    return this.computeDiversificationScore(weights, covMatrix)
  }

  // ── Rebalancing ─────────────────────────────────────────────────────────

  /** Detect drift from target allocation and suggest rebalancing trades. */
  rebalance(currentPortfolio: Portfolio, targetWeights: Map<string, number>): RebalanceTrade[] {
    this.totalRebalances++
    const trades: RebalanceTrade[] = []

    for (const asset of currentPortfolio.assets) {
      const target = targetWeights.get(asset.id) ?? 0
      const drift = Math.abs(asset.weight - target)

      if (drift >= this.config.rebalanceThreshold) {
        const action: 'buy' | 'sell' = asset.weight < target ? 'buy' : 'sell'
        trades.push({
          assetId: asset.id,
          assetName: asset.name,
          currentWeight: round4(asset.weight),
          targetWeight: round4(target),
          action,
          amount: round4(Math.abs(target - asset.weight)),
        })
      }
    }

    // Check for new assets in target that aren't in the portfolio
    for (const [id, targetW] of targetWeights.entries()) {
      const exists = currentPortfolio.assets.some(a => a.id === id)
      if (!exists && targetW >= this.config.minPositionSize) {
        trades.push({
          assetId: id,
          assetName: id,
          currentWeight: 0,
          targetWeight: round4(targetW),
          action: 'buy',
          amount: round4(targetW),
        })
      }
    }

    // Sort by absolute trade size descending
    trades.sort((a, b) => b.amount - a.amount)
    return trades
  }

  /** Check whether the portfolio needs rebalancing. */
  needsRebalancing(currentPortfolio: Portfolio, targetWeights: Map<string, number>): boolean {
    for (const asset of currentPortfolio.assets) {
      const target = targetWeights.get(asset.id) ?? 0
      if (Math.abs(asset.weight - target) >= this.config.rebalanceThreshold) {
        return true
      }
    }
    return false
  }

  // ── Position Sizing ─────────────────────────────────────────────────────

  /**
   * Compute position size using the Kelly criterion.
   * Kelly fraction: f = (bp - q) / b
   *   where b = odds ratio (win/loss), p = win probability, q = 1-p
   */
  kellyCriterion(winRate: number, avgWin: number, avgLoss: number): PositionSize {
    const p = clamp(winRate, 0.01, 0.99)
    const q = 1 - p

    if (avgLoss === 0) {
      return { method: 'kelly', size: this.config.maxPositionSize, confidence: 0.5, maxLoss: 0 }
    }

    const b = Math.abs(avgWin / avgLoss)
    const kellyFraction = (b * p - q) / b

    // Half-Kelly is a common conservative approach
    const halfKelly = kellyFraction * 0.5
    const size = clamp(halfKelly, 0, this.config.maxPositionSize)

    // Confidence based on sample quality
    const confidence = clamp(Math.min(p, 1 - p) * 4, 0.1, 1)

    const maxLoss = size * Math.abs(avgLoss)

    return {
      method: 'kelly',
      size: round4(size),
      confidence: round4(confidence),
      maxLoss: round4(maxLoss),
    }
  }

  /**
   * Fixed-fractional position sizing.
   * Size = (account risk fraction) / (trade risk per unit).
   */
  fixedFractional(
    accountSize: number,
    riskPerTrade: number,
    stopLossPercent: number,
  ): PositionSize {
    if (stopLossPercent <= 0 || accountSize <= 0) {
      return { method: 'fixed', size: 0, confidence: 0, maxLoss: 0 }
    }

    const riskAmount = accountSize * clamp(riskPerTrade, 0.001, 0.1)
    const positionSize = riskAmount / stopLossPercent
    const sizeAsPercent = clamp(positionSize / accountSize, 0, this.config.maxPositionSize)
    const maxLoss = sizeAsPercent * stopLossPercent * accountSize
    const confidence = clamp(1 - stopLossPercent, 0.1, 1)

    return {
      method: 'fixed',
      size: round4(sizeAsPercent),
      confidence: round4(confidence),
      maxLoss: round4(maxLoss),
    }
  }

  // ── Drawdown Analysis ───────────────────────────────────────────────────

  /** Analyze drawdowns for a portfolio or return series. */
  analyzeDrawdown(portfolio: Portfolio): DrawdownAnalysis
  analyzeDrawdown(returns: number[]): DrawdownAnalysis
  analyzeDrawdown(input: Portfolio | number[]): DrawdownAnalysis {
    const returns = Array.isArray(input)
      ? input
      : this.computeWeightedReturns(
          input.assets,
          input.assets.map(a => a.weight),
        )

    return this.computeDrawdown(returns)
  }

  /** Core drawdown computation. */
  private computeDrawdown(returns: number[]): DrawdownAnalysis {
    if (returns.length === 0) {
      return { maxDrawdown: 0, currentDrawdown: 0, recoveryPeriods: [], underwaterPercentage: 0 }
    }

    const cumulative = cumulativeReturns(returns)
    let peak = cumulative[0]
    let maxDrawdown = 0
    let currentDrawdown = 0
    const drawdowns: number[] = []
    const recoveryPeriods: RecoveryPeriod[] = []

    let drawdownStart = -1
    let drawdownDepth = 0
    let underwaterCount = 0

    for (let i = 0; i < cumulative.length; i++) {
      if (cumulative[i] > peak) {
        // New peak — close any open drawdown period
        if (drawdownStart >= 0) {
          recoveryPeriods.push({
            start: drawdownStart,
            end: i,
            duration: i - drawdownStart,
            drawdownDepth: round4(drawdownDepth),
          })
          drawdownStart = -1
          drawdownDepth = 0
        }
        peak = cumulative[i]
      }

      const dd = (peak - cumulative[i]) / peak
      drawdowns.push(dd)

      if (dd > 0) {
        underwaterCount++
        if (drawdownStart < 0) {
          drawdownStart = i
        }
        if (dd > drawdownDepth) {
          drawdownDepth = dd
        }
      }

      if (dd > maxDrawdown) {
        maxDrawdown = dd
      }
    }

    // Handle open drawdown at end
    currentDrawdown = drawdowns[drawdowns.length - 1] ?? 0
    if (drawdownStart >= 0) {
      recoveryPeriods.push({
        start: drawdownStart,
        end: cumulative.length - 1,
        duration: cumulative.length - 1 - drawdownStart,
        drawdownDepth: round4(drawdownDepth),
      })
    }

    const underwaterPercentage = cumulative.length > 0 ? underwaterCount / cumulative.length : 0

    return {
      maxDrawdown: round4(maxDrawdown),
      currentDrawdown: round4(currentDrawdown),
      recoveryPeriods,
      underwaterPercentage: round4(underwaterPercentage),
    }
  }

  // ── Performance Attribution ─────────────────────────────────────────────

  /**
   * Brinson-style performance attribution.
   * Decomposes portfolio return into:
   *   - Asset selection effect
   *   - Market timing (allocation) effect
   *   - Interaction effect
   *   - Residual
   *
   * @param portfolioWeights  Actual portfolio weights
   * @param benchmarkWeights  Benchmark weights
   * @param portfolioReturns  Actual returns per asset
   * @param benchmarkReturns  Benchmark returns per asset
   */
  attributePerformance(
    portfolioWeights: number[],
    benchmarkWeights: number[],
    portfolioReturns: number[],
    benchmarkReturns: number[],
  ): PerformanceAttribution {
    const n = Math.min(
      portfolioWeights.length,
      benchmarkWeights.length,
      portfolioReturns.length,
      benchmarkReturns.length,
    )

    if (n === 0) {
      return {
        totalReturn: 0,
        assetSelection: 0,
        marketTiming: 0,
        interactionEffect: 0,
        residual: 0,
      }
    }

    let totalPortfolioReturn = 0
    let totalBenchmarkReturn = 0
    let selectionEffect = 0
    let allocationEffect = 0
    let interactionEffect = 0

    for (let i = 0; i < n; i++) {
      const wp = portfolioWeights[i]
      const wb = benchmarkWeights[i]
      const rp = portfolioReturns[i]
      const rb = benchmarkReturns[i]

      totalPortfolioReturn += wp * rp
      totalBenchmarkReturn += wb * rb

      // Brinson-Fachler decomposition
      selectionEffect += wb * (rp - rb)
      allocationEffect += (wp - wb) * (rb - totalBenchmarkReturn / Math.max(n, 1))
      interactionEffect += (wp - wb) * (rp - rb)
    }

    // Recompute benchmark total for allocation effect normalization
    let benchTotal = 0
    for (let i = 0; i < n; i++) {
      benchTotal += benchmarkWeights[i] * benchmarkReturns[i]
    }

    // Recalculate allocation with correct benchmark total
    allocationEffect = 0
    for (let i = 0; i < n; i++) {
      allocationEffect +=
        (portfolioWeights[i] - benchmarkWeights[i]) * (benchmarkReturns[i] - benchTotal)
    }

    const activeReturn = totalPortfolioReturn - benchTotal
    const residual = activeReturn - selectionEffect - allocationEffect - interactionEffect

    return {
      totalReturn: round4(activeReturn),
      assetSelection: round4(selectionEffect),
      marketTiming: round4(allocationEffect),
      interactionEffect: round4(interactionEffect),
      residual: round4(residual),
    }
  }

  // ── Sharpe & Sortino ────────────────────────────────────────────────────

  /** Compute the Sharpe ratio from a return series. */
  computeSharpe(returns: number[], riskFreeRate?: number): number {
    const rf = riskFreeRate ?? this.config.riskFreeRate
    const mu = mean(returns)
    const sigma = stddev(returns)
    if (sigma === 0) return 0
    return round4((mu - rf) / sigma)
  }

  /** Compute the Sortino ratio from a return series. */
  computeSortino(returns: number[], riskFreeRate?: number): number {
    const rf = riskFreeRate ?? this.config.riskFreeRate
    const mu = mean(returns)
    const dd = downsideDeviation(returns, rf)
    if (dd === 0) return 0
    return round4((mu - rf) / dd)
  }

  // ── Internal Utilities ──────────────────────────────────────────────────

  /** Compute portfolio-level weighted returns from asset returns. */
  private computeWeightedReturns(assets: Asset[], weights: number[]): number[] {
    if (assets.length === 0) return []

    const maxLen = Math.max(...assets.map(a => a.returns.length))
    const result: number[] = []

    for (let t = 0; t < maxLen; t++) {
      let r = 0
      for (let i = 0; i < assets.length; i++) {
        const assetReturn = t < assets[i].returns.length ? assets[i].returns[t] : 0
        r += weights[i] * assetReturn
      }
      result.push(r)
    }

    return result
  }

  // ── Stats / Serialize / Feedback ────────────────────────────────────────

  /** Return aggregate statistics. */
  getStats(): Readonly<PortfolioOptimizerStats> {
    const avgSharpe =
      this.sharpeHistory.length > 0
        ? this.sharpeHistory.reduce((s, v) => s + v, 0) / this.sharpeHistory.length
        : 0
    const avgDiv =
      this.diversificationHistory.length > 0
        ? this.diversificationHistory.reduce((s, v) => s + v, 0) /
          this.diversificationHistory.length
        : 0

    return {
      totalOptimizations: this.totalOptimizations,
      totalRiskAssessments: this.totalRiskAssessments,
      totalRebalances: this.totalRebalances,
      totalAllocations: this.totalAllocations,
      avgSharpe: round4(avgSharpe),
      avgDiversification: round4(avgDiv),
      feedbackReceived: this.feedbackTotal,
      feedbackAccuracy:
        this.feedbackTotal > 0 ? round4(this.feedbackCorrect / this.feedbackTotal) : 0,
    }
  }

  /** Serialize the optimizer state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalOptimizations: this.totalOptimizations,
      totalRiskAssessments: this.totalRiskAssessments,
      totalRebalances: this.totalRebalances,
      totalAllocations: this.totalAllocations,
      sharpeHistory: this.sharpeHistory,
      diversificationHistory: this.diversificationHistory,
      feedbackCorrect: this.feedbackCorrect,
      feedbackTotal: this.feedbackTotal,
    })
  }

  /** Restore a PortfolioOptimizer from serialized JSON. */
  static deserialize(json: string): PortfolioOptimizer {
    const data = JSON.parse(json) as {
      config: PortfolioOptimizerConfig
      totalOptimizations: number
      totalRiskAssessments: number
      totalRebalances: number
      totalAllocations: number
      sharpeHistory: number[]
      diversificationHistory: number[]
      feedbackCorrect: number
      feedbackTotal: number
    }

    const instance = new PortfolioOptimizer(data.config)
    instance.totalOptimizations = data.totalOptimizations
    instance.totalRiskAssessments = data.totalRiskAssessments
    instance.totalRebalances = data.totalRebalances
    instance.totalAllocations = data.totalAllocations
    instance.sharpeHistory = data.sharpeHistory
    instance.diversificationHistory = data.diversificationHistory
    instance.feedbackCorrect = data.feedbackCorrect
    instance.feedbackTotal = data.feedbackTotal
    return instance
  }

  /** Learn from feedback on a previous optimization or recommendation. */
  learnFromFeedback(context: string, correct: boolean): void {
    this.feedbackTotal++
    if (correct) this.feedbackCorrect++

    if (!this.config.enableLearning) return

    // Adaptive tuning: adjust risk-free rate estimate slightly based on feedback
    if (context.includes('risk') && !correct) {
      this.config.riskFreeRate = clamp(this.config.riskFreeRate + 0.001, 0, 0.15)
    }
  }

  /** Create a portfolio object from assets (convenience builder). */
  buildPortfolio(assets: Asset[]): Portfolio {
    const weights = assets.map(a => a.weight)
    const totalWeight = weights.reduce((s, w) => s + w, 0)

    // Normalize if weights don't sum to 1
    const normalizedWeights =
      totalWeight > 0 ? weights.map(w => w / totalWeight) : weights.map(() => 1 / assets.length)

    const normalizedAssets = assets.map((a, i) => ({ ...a, weight: normalizedWeights[i] }))

    const expectedReturns = normalizedAssets.map(a => a.expectedReturn)
    const covMatrix = buildCovarianceMatrix(normalizedAssets)

    const pRet = portfolioReturn(normalizedWeights, expectedReturns)
    const pVar = portfolioVariance(normalizedWeights, covMatrix)
    const pRisk = Math.sqrt(pVar)
    const sharpe = pRisk > 0 ? (pRet - this.config.riskFreeRate) / pRisk : 0

    const weightedReturns = this.computeWeightedReturns(normalizedAssets, normalizedWeights)
    const sortino = this.computeSortino(weightedReturns, this.config.riskFreeRate)
    const dd = this.computeDrawdown(weightedReturns)
    const divScore = this.computeDiversificationScore(normalizedWeights, covMatrix)

    return {
      assets: normalizedAssets,
      totalReturn: round4(pRet),
      totalRisk: round4(pRisk),
      sharpeRatio: round4(sharpe),
      sortino: round4(sortino),
      maxDrawdown: round4(dd.maxDrawdown),
      diversificationScore: round4(divScore),
    }
  }

  // ── Fallback ────────────────────────────────────────────────────────────

  /** Equal-weight fallback when optimization constraints are violated. */
  private equalWeightFallback(assets: Asset[], constraints: string[]): OptimizationResult {
    const n = assets.length
    const w = n > 0 ? 1 / n : 0
    const weights = new Array(n).fill(w)
    const equalAssets = assets.map(a => ({ ...a, weight: round4(w) }))

    const expectedReturns = assets.map(a => a.expectedReturn)
    const covMatrix = n > 0 ? buildCovarianceMatrix(assets) : []
    const pRet = portfolioReturn(weights, expectedReturns)
    const pVar = n > 0 ? portfolioVariance(weights, covMatrix) : 0
    const pRisk = Math.sqrt(pVar)
    const sharpe = pRisk > 0 ? (pRet - this.config.riskFreeRate) / pRisk : 0

    const weightedReturns = this.computeWeightedReturns(assets, weights)
    const sortino = this.computeSortino(weightedReturns, this.config.riskFreeRate)
    const dd = this.computeDrawdown(weightedReturns)
    const divScore = n > 1 ? this.computeDiversificationScore(weights, covMatrix) : 0

    return {
      portfolio: {
        assets: equalAssets,
        totalReturn: round4(pRet),
        totalRisk: round4(pRisk),
        sharpeRatio: round4(sharpe),
        sortino: round4(sortino),
        maxDrawdown: round4(dd.maxDrawdown),
        diversificationScore: round4(divScore),
      },
      efficientFrontier: [],
      constraints,
      method: 'equal-weight',
    }
  }
}
