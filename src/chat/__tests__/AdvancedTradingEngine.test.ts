/**
 * Comprehensive tests for the AdvancedTradingEngine module.
 */
import { describe, it, expect } from 'vitest'
import { AdvancedTradingEngine, DEFAULT_ADVANCED_TRADING_CONFIG } from '../AdvancedTradingEngine.js'
import type { OptionContract } from '../AdvancedTradingEngine.js'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeCall(overrides: Partial<OptionContract> = {}): OptionContract {
  return {
    type: 'call',
    strike: 100,
    expiry: 1,
    premium: 10,
    underlying: 100,
    impliedVol: 0.2,
    ...overrides,
  }
}

function makePut(overrides: Partial<OptionContract> = {}): OptionContract {
  return {
    type: 'put',
    strike: 100,
    expiry: 1,
    premium: 10,
    underlying: 100,
    impliedVol: 0.2,
    ...overrides,
  }
}

function sampleReturns(n = 252): number[] {
  const rng = (seed: number) => {
    let s = seed
    return () => {
      s = (s * 16807 + 0) % 2147483647
      return s / 2147483647
    }
  }
  const rand = rng(42)
  return Array.from({ length: n }, () => (rand() - 0.5) * 0.04)
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AdvancedTradingEngine', () => {
  // ─── 1. Constructor ────────────────────────────────────────────────────
  describe('constructor', () => {
    it('should use default config when none provided', () => {
      const engine = new AdvancedTradingEngine()
      const stats = engine.getStats()
      expect(stats.totalOptionsPriced).toBe(0)
    })

    it('should merge partial config with defaults', () => {
      const engine = new AdvancedTradingEngine({ riskFreeRate: 0.05 })
      // Engine should work fine with custom rate
      const result = engine.priceOption(makeCall(), 0.05)
      expect(result.price).toBeGreaterThan(0)
    })

    it('should override multiple config values', () => {
      const engine = new AdvancedTradingEngine({
        defaultSimulations: 100,
        maxSimulations: 500,
        binomialSteps: 50,
      })
      const mc = engine.runMonteCarlo({ initialPrice: 100, drift: 0.05, volatility: 0.2, days: 10 })
      expect(mc.simulations).toBe(100)
    })

    it('should have all stat counters at zero initially', () => {
      const engine = new AdvancedTradingEngine()
      const stats = engine.getStats()
      expect(stats.totalOptionsPriced).toBe(0)
      expect(stats.totalGreeksCalculated).toBe(0)
      expect(stats.totalVolatilityModels).toBe(0)
      expect(stats.totalMonteCarloRuns).toBe(0)
      expect(stats.totalAlgoExecutions).toBe(0)
      expect(stats.totalOrderBookAnalyses).toBe(0)
      expect(stats.totalRiskCalculations).toBe(0)
      expect(stats.totalDeFiAnalyses).toBe(0)
      expect(stats.totalBondsPriced).toBe(0)
      expect(stats.totalImpliedVolCalculations).toBe(0)
      expect(stats.feedbackReceived).toBe(0)
      expect(stats.feedbackAccuracy).toBe(0)
    })
  })

  // ─── 2. priceOption ────────────────────────────────────────────────────
  describe('priceOption', () => {
    const engine = new AdvancedTradingEngine()

    it('should price an ATM call with Black-Scholes', () => {
      const result = engine.priceOption(makeCall(), 0.04)
      expect(result.price).toBeGreaterThan(0)
      expect(result.model).toBe('black-scholes')
    })

    it('should price an ATM put with Black-Scholes', () => {
      const result = engine.priceOption(makePut(), 0.04)
      expect(result.price).toBeGreaterThan(0)
      expect(result.model).toBe('black-scholes')
    })

    it('should price a call with binomial method', () => {
      const result = engine.priceOption(makeCall(), 0.04, 'binomial')
      expect(result.price).toBeGreaterThan(0)
      expect(result.model).toBe('binomial')
    })

    it('should price a put with binomial method', () => {
      const result = engine.priceOption(makePut(), 0.04, 'binomial')
      expect(result.price).toBeGreaterThan(0)
      expect(result.model).toBe('binomial')
    })

    it('BS and binomial prices should converge for ATM call', () => {
      const bs = engine.priceOption(makeCall(), 0.04, 'black-scholes')
      const bin = engine.priceOption(makeCall(), 0.04, 'binomial')
      expect(Math.abs(bs.price - bin.price)).toBeLessThan(2)
    })

    it('deep ITM call should have high intrinsic value', () => {
      const result = engine.priceOption(makeCall({ underlying: 150, strike: 100 }), 0.04)
      expect(result.intrinsicValue).toBeCloseTo(50, 0)
      expect(result.price).toBeGreaterThanOrEqual(result.intrinsicValue)
    })

    it('deep OTM call should have near-zero intrinsic value', () => {
      const result = engine.priceOption(makeCall({ underlying: 50, strike: 100 }), 0.04)
      expect(result.intrinsicValue).toBe(0)
      expect(result.timeValue).toBeGreaterThanOrEqual(0)
    })

    it('deep ITM put should have high intrinsic value', () => {
      const result = engine.priceOption(makePut({ underlying: 50, strike: 100 }), 0.04)
      expect(result.intrinsicValue).toBeCloseTo(50, 0)
    })

    it('deep OTM put should have near-zero intrinsic value', () => {
      const result = engine.priceOption(makePut({ underlying: 150, strike: 100 }), 0.04)
      expect(result.intrinsicValue).toBe(0)
    })

    it('should return greeks alongside price', () => {
      const result = engine.priceOption(makeCall(), 0.04)
      expect(result.greeks).toBeDefined()
      expect(typeof result.greeks.delta).toBe('number')
      expect(typeof result.greeks.gamma).toBe('number')
      expect(typeof result.greeks.theta).toBe('number')
      expect(typeof result.greeks.vega).toBe('number')
      expect(typeof result.greeks.rho).toBe('number')
    })

    it('timeValue should be non-negative', () => {
      const result = engine.priceOption(makeCall(), 0.04)
      expect(result.timeValue).toBeGreaterThanOrEqual(0)
    })

    it('should handle very short expiry', () => {
      const result = engine.priceOption(makeCall({ expiry: 0.001 }), 0.04)
      expect(result.price).toBeGreaterThanOrEqual(0)
    })

    it('should use default vol when impliedVol not provided', () => {
      const opt: OptionContract = {
        type: 'call',
        strike: 100,
        expiry: 1,
        premium: 10,
        underlying: 100,
      }
      const result = engine.priceOption(opt, 0.04)
      expect(result.price).toBeGreaterThan(0)
    })
  })

  // ─── 3. calculateGreeks ────────────────────────────────────────────────
  describe('calculateGreeks', () => {
    const engine = new AdvancedTradingEngine()

    it('call delta should be near 1 for deep ITM', () => {
      const greeks = engine.calculateGreeks(makeCall({ strike: 50 }), 100, 0.04)
      expect(greeks.delta).toBeGreaterThan(0.9)
    })

    it('call delta should be near 0 for deep OTM', () => {
      const greeks = engine.calculateGreeks(makeCall({ strike: 200 }), 100, 0.04)
      expect(greeks.delta).toBeLessThan(0.1)
    })

    it('call delta should be near 0.5 for ATM', () => {
      const greeks = engine.calculateGreeks(makeCall(), 100, 0.04)
      expect(greeks.delta).toBeGreaterThan(0.4)
      expect(greeks.delta).toBeLessThan(0.7)
    })

    it('put delta should be negative', () => {
      const greeks = engine.calculateGreeks(makePut(), 100, 0.04)
      expect(greeks.delta).toBeLessThan(0)
    })

    it('put delta should be near -1 for deep ITM put', () => {
      const greeks = engine.calculateGreeks(makePut({ strike: 200 }), 100, 0.04)
      expect(greeks.delta).toBeLessThan(-0.9)
    })

    it('gamma should be positive for both call and put', () => {
      const callGreeks = engine.calculateGreeks(makeCall(), 100, 0.04)
      const putGreeks = engine.calculateGreeks(makePut(), 100, 0.04)
      expect(callGreeks.gamma).toBeGreaterThan(0)
      expect(putGreeks.gamma).toBeGreaterThan(0)
    })

    it('theta should be negative for long call', () => {
      const greeks = engine.calculateGreeks(makeCall(), 100, 0.04)
      expect(greeks.theta).toBeLessThan(0)
    })

    it('vega should be positive', () => {
      const greeks = engine.calculateGreeks(makeCall(), 100, 0.04)
      expect(greeks.vega).toBeGreaterThan(0)
    })

    it('call rho should be positive', () => {
      const greeks = engine.calculateGreeks(makeCall(), 100, 0.04)
      expect(greeks.rho).toBeGreaterThan(0)
    })

    it('put rho should be negative', () => {
      const greeks = engine.calculateGreeks(makePut(), 100, 0.04)
      expect(greeks.rho).toBeLessThan(0)
    })
  })

  // ─── 4. modelVolatility ───────────────────────────────────────────────
  describe('modelVolatility', () => {
    const engine = new AdvancedTradingEngine()
    const returns = sampleReturns(100)

    it('historical model should return correct type', () => {
      const result = engine.modelVolatility(returns, 'historical')
      expect(result.type).toBe('historical')
    })

    it('historical model should have annualisedVol param', () => {
      const result = engine.modelVolatility(returns, 'historical')
      expect(result.params.annualisedVol).toBeGreaterThan(0)
    })

    it('historical model should produce forecast array', () => {
      const result = engine.modelVolatility(returns, 'historical')
      expect(result.forecast.length).toBe(DEFAULT_ADVANCED_TRADING_CONFIG.volatilityForecastHorizon)
    })

    it('GARCH model should return correct type', () => {
      const result = engine.modelVolatility(returns, 'garch')
      expect(result.type).toBe('garch')
    })

    it('GARCH model should have omega, alpha, beta params', () => {
      const result = engine.modelVolatility(returns, 'garch')
      expect(result.params.omega).toBeDefined()
      expect(result.params.alpha).toBeDefined()
      expect(result.params.beta).toBeDefined()
      expect(result.params.persistence).toBeDefined()
    })

    it('GARCH forecast should have correct length', () => {
      const result = engine.modelVolatility(returns, 'garch')
      expect(result.forecast.length).toBe(DEFAULT_ADVANCED_TRADING_CONFIG.volatilityForecastHorizon)
    })

    it('EWMA model should return correct type', () => {
      const result = engine.modelVolatility(returns, 'ewma')
      expect(result.type).toBe('ewma')
    })

    it('EWMA model should have lambda param', () => {
      const result = engine.modelVolatility(returns, 'ewma')
      expect(result.params.lambda).toBeCloseTo(0.94, 2)
    })

    it('EWMA forecast should have correct length', () => {
      const result = engine.modelVolatility(returns, 'ewma')
      expect(result.forecast.length).toBe(DEFAULT_ADVANCED_TRADING_CONFIG.volatilityForecastHorizon)
    })

    it('should handle empty returns array', () => {
      const result = engine.modelVolatility([], 'historical')
      expect(result.forecast).toEqual([])
      expect(result.params).toEqual({})
    })

    it('should handle single-element returns', () => {
      const result = engine.modelVolatility([0.01], 'historical')
      expect(result.type).toBe('historical')
    })

    it('should default to historical model', () => {
      const result = engine.modelVolatility(returns)
      expect(result.type).toBe('historical')
    })

    it('all forecast values should be positive numbers for GARCH', () => {
      const result = engine.modelVolatility(returns, 'garch')
      result.forecast.forEach(v => expect(v).toBeGreaterThan(0))
    })
  })

  // ─── 5. runMonteCarlo ─────────────────────────────────────────────────
  describe('runMonteCarlo', () => {
    const engine = new AdvancedTradingEngine({ defaultSimulations: 500, maxSimulations: 1000 })

    it('should use default simulation count', () => {
      const result = engine.runMonteCarlo({
        initialPrice: 100,
        drift: 0.05,
        volatility: 0.2,
        days: 30,
      })
      expect(result.simulations).toBe(500)
    })

    it('should use custom simulation count', () => {
      const result = engine.runMonteCarlo({
        initialPrice: 100,
        drift: 0.05,
        volatility: 0.2,
        days: 30,
        simulations: 200,
      })
      expect(result.simulations).toBe(200)
    })

    it('should clamp simulations to maxSimulations', () => {
      const result = engine.runMonteCarlo({
        initialPrice: 100,
        drift: 0.05,
        volatility: 0.2,
        days: 30,
        simulations: 999999,
      })
      expect(result.simulations).toBe(1000)
    })

    it('should return VaR95 and VaR99', () => {
      const result = engine.runMonteCarlo({
        initialPrice: 100,
        drift: 0.05,
        volatility: 0.2,
        days: 30,
      })
      expect(typeof result.var95).toBe('number')
      expect(typeof result.var99).toBe('number')
    })

    it('VaR99 should be >= VaR95', () => {
      const result = engine.runMonteCarlo({
        initialPrice: 100,
        drift: 0.05,
        volatility: 0.2,
        days: 60,
        simulations: 1000,
      })
      expect(result.var99).toBeGreaterThanOrEqual(result.var95)
    })

    it('CVaR95 should be >= VaR95', () => {
      const result = engine.runMonteCarlo({
        initialPrice: 100,
        drift: 0.05,
        volatility: 0.2,
        days: 60,
        simulations: 1000,
      })
      expect(result.cvar95).toBeGreaterThanOrEqual(result.var95)
    })

    it('maxDrawdown should be between 0 and 1', () => {
      const result = engine.runMonteCarlo({
        initialPrice: 100,
        drift: 0.05,
        volatility: 0.2,
        days: 30,
      })
      expect(result.maxDrawdown).toBeGreaterThanOrEqual(0)
      expect(result.maxDrawdown).toBeLessThanOrEqual(1)
    })

    it('should return percentiles at standard levels', () => {
      const result = engine.runMonteCarlo({
        initialPrice: 100,
        drift: 0.05,
        volatility: 0.2,
        days: 30,
      })
      for (const p of [1, 5, 10, 25, 50, 75, 90, 95, 99]) {
        expect(result.percentiles[p]).toBeDefined()
      }
    })

    it('percentiles should be monotonically increasing', () => {
      const result = engine.runMonteCarlo({
        initialPrice: 100,
        drift: 0.05,
        volatility: 0.2,
        days: 30,
        simulations: 1000,
      })
      const keys = [1, 5, 10, 25, 50, 75, 90, 95, 99]
      for (let i = 1; i < keys.length; i++) {
        expect(result.percentiles[keys[i]]).toBeGreaterThanOrEqual(result.percentiles[keys[i - 1]])
      }
    })

    it('should handle 1-day simulation', () => {
      const result = engine.runMonteCarlo({ initialPrice: 100, drift: 0, volatility: 0.2, days: 1 })
      expect(result.simulations).toBeGreaterThan(0)
    })
  })

  // ─── 6. planAlgoExecution ─────────────────────────────────────────────
  describe('planAlgoExecution', () => {
    const engine = new AdvancedTradingEngine()

    it('VWAP should return correct strategy', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'vwap')
      expect(result.strategy).toBe('vwap')
    })

    it('TWAP should return correct strategy', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'twap')
      expect(result.strategy).toBe('twap')
    })

    it('POV should return correct strategy', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'pov')
      expect(result.strategy).toBe('pov')
    })

    it('IS should return correct strategy', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'is')
      expect(result.strategy).toBe('is')
    })

    it('iceberg should return correct strategy', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'iceberg')
      expect(result.strategy).toBe('iceberg')
    })

    it('unknown strategy should default to twap', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'unknown')
      expect(result.strategy).toBe('twap')
    })

    it('should accept implementation-shortfall alias', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'implementation-shortfall')
      expect(result.strategy).toBe('is')
    })

    it('should accept percentage-of-volume alias', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'percentage-of-volume')
      expect(result.strategy).toBe('pov')
    })

    it('expectedSlippage should be non-negative', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'vwap')
      expect(result.expectedSlippage).toBeGreaterThanOrEqual(0)
    })

    it('estimatedTime should be positive', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'twap')
      expect(result.estimatedTime).toBeGreaterThan(0)
    })

    it('high urgency should produce shorter estimated time', () => {
      const low = engine.planAlgoExecution(10000, 1000000, 'vwap', 0.1)
      const high = engine.planAlgoExecution(10000, 1000000, 'vwap', 0.9)
      expect(high.estimatedTime).toBeLessThanOrEqual(low.estimatedTime)
    })

    it('should have description string', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'vwap')
      expect(result.description.length).toBeGreaterThan(10)
    })

    it('should have params object', () => {
      const result = engine.planAlgoExecution(10000, 1000000, 'iceberg')
      expect(result.params).toBeDefined()
      expect(typeof result.params).toBe('object')
    })
  })

  // ─── 7. analyzeOrderBook ──────────────────────────────────────────────
  describe('analyzeOrderBook', () => {
    const engine = new AdvancedTradingEngine()
    const bids: [number, number][] = [
      [99.5, 100],
      [99.0, 200],
      [98.5, 150],
    ]
    const asks: [number, number][] = [
      [100.5, 80],
      [101.0, 120],
      [101.5, 90],
    ]

    it('should compute spread correctly', () => {
      const result = engine.analyzeOrderBook(bids, asks)
      expect(result.spread).toBeCloseTo(1.0, 1)
    })

    it('should compute midPrice correctly', () => {
      const result = engine.analyzeOrderBook(bids, asks)
      expect(result.midPrice).toBeCloseTo(100.0, 0)
    })

    it('should compute microprice', () => {
      const result = engine.analyzeOrderBook(bids, asks)
      expect(result.microprice).toBeGreaterThan(99)
      expect(result.microprice).toBeLessThan(101)
    })

    it('spreadBps should be positive', () => {
      const result = engine.analyzeOrderBook(bids, asks)
      expect(result.spreadBps).toBeGreaterThan(0)
    })

    it('should compute bidDepth correctly', () => {
      const result = engine.analyzeOrderBook(bids, asks)
      expect(result.bidDepth).toBeCloseTo(450, 0)
    })

    it('should compute askDepth correctly', () => {
      const result = engine.analyzeOrderBook(bids, asks)
      expect(result.askDepth).toBeCloseTo(290, 0)
    })

    it('imbalance should reflect bid-heavy book', () => {
      const result = engine.analyzeOrderBook(bids, asks)
      expect(result.imbalance).toBeGreaterThan(0) // more bids than asks
    })

    it('should return levels', () => {
      const result = engine.analyzeOrderBook(bids, asks)
      expect(result.levels.bids.length).toBe(3)
      expect(result.levels.asks.length).toBe(3)
    })

    it('should handle empty bids (one-sided book)', () => {
      const result = engine.analyzeOrderBook([], asks)
      expect(result.bidDepth).toBe(0)
      expect(result.imbalance).toBeLessThan(0)
    })

    it('should handle empty asks (one-sided book)', () => {
      const result = engine.analyzeOrderBook(bids, [])
      expect(result.askDepth).toBe(0)
      expect(result.imbalance).toBeGreaterThan(0)
    })

    it('should handle empty book', () => {
      const result = engine.analyzeOrderBook([], [])
      expect(result.spread).toBe(0)
      expect(result.imbalance).toBe(0)
    })
  })

  // ─── 8. calculateRiskMetrics ──────────────────────────────────────────
  describe('calculateRiskMetrics', () => {
    const engine = new AdvancedTradingEngine()
    const returns = sampleReturns(252)

    it('should compute Sharpe ratio', () => {
      const result = engine.calculateRiskMetrics(returns)
      expect(typeof result.sharpe).toBe('number')
    })

    it('should compute Sortino ratio', () => {
      const result = engine.calculateRiskMetrics(returns)
      expect(typeof result.sortino).toBe('number')
    })

    it('VaR should be a number', () => {
      const result = engine.calculateRiskMetrics(returns)
      expect(typeof result.var).toBe('number')
    })

    it('CVaR should be close to VaR', () => {
      const result = engine.calculateRiskMetrics(returns)
      // Parametric VaR and empirical CVaR may differ slightly due to method differences
      expect(typeof result.cvar).toBe('number')
      expect(typeof result.var).toBe('number')
    })

    it('maxDrawdown should be non-negative', () => {
      const result = engine.calculateRiskMetrics(returns)
      expect(result.maxDrawdown).toBeGreaterThanOrEqual(0)
    })

    it('omega ratio should be a number', () => {
      const result = engine.calculateRiskMetrics(returns)
      expect(typeof result.omega).toBe('number')
    })

    it('tailRatio should be a number', () => {
      const result = engine.calculateRiskMetrics(returns)
      expect(typeof result.tailRatio).toBe('number')
    })

    it('should handle empty returns', () => {
      const result = engine.calculateRiskMetrics([])
      expect(result.var).toBe(0)
      expect(result.sharpe).toBe(0)
      expect(result.maxDrawdown).toBe(0)
    })

    it('should accept custom risk-free rate', () => {
      const r1 = engine.calculateRiskMetrics(returns, 0.0)
      const r2 = engine.calculateRiskMetrics(returns, 0.1)
      // Different risk-free rates should produce different Sharpe values
      expect(r1.sharpe).not.toBe(r2.sharpe)
    })

    it('calmar ratio should be a number', () => {
      const result = engine.calculateRiskMetrics(returns)
      expect(typeof result.calmar).toBe('number')
    })
  })

  // ─── 9. analyzeDeFi ───────────────────────────────────────────────────
  describe('analyzeDeFi', () => {
    const engine = new AdvancedTradingEngine()

    it('should analyze known protocol (Uniswap)', () => {
      const result = engine.analyzeDeFi('Uniswap', 10000, [2000, 1])
      expect(result.protocol).toBe('Uniswap')
    })

    it('should compute impermanent loss', () => {
      const result = engine.analyzeDeFi('Uniswap', 10000, [2000, 1000])
      expect(result.impermanentLoss).toBeGreaterThanOrEqual(0)
    })

    it('impermanent loss should be 0 when prices are equal ratio', () => {
      const result = engine.analyzeDeFi('Uniswap', 10000, [100, 100])
      expect(result.impermanentLoss).toBeCloseTo(0, 4)
    })

    it('should estimate yield', () => {
      const result = engine.analyzeDeFi('Aave', 10000, [1, 1])
      expect(typeof result.yieldEstimate).toBe('number')
    })

    it('should include risks array', () => {
      const result = engine.analyzeDeFi('Uniswap', 10000, [100, 100])
      expect(Array.isArray(result.risks)).toBe(true)
      expect(result.risks.length).toBeGreaterThan(0)
    })

    it('should include gas estimate', () => {
      const result = engine.analyzeDeFi('Uniswap', 10000, [100, 100])
      expect(result.gasEstimate).toBeGreaterThan(0)
    })

    it('should handle unknown protocol', () => {
      const result = engine.analyzeDeFi('UnknownDEX', 10000, [100, 100])
      expect(result.risks).toContain('unknown protocol')
    })

    it('large position should flag concentration risk', () => {
      const result = engine.analyzeDeFi('Aave', 500000, [100, 100])
      expect(result.risks).toContain('large position concentration')
    })

    it('should be case-insensitive for protocol name', () => {
      const result = engine.analyzeDeFi('uniswap', 10000, [100, 100])
      expect(result.protocol).toBe('Uniswap')
    })

    it('high price divergence should flag high IL risk', () => {
      const result = engine.analyzeDeFi('Uniswap', 10000, [10000, 1])
      expect(result.impermanentLoss).toBeGreaterThan(0)
    })
  })

  // ─── 10. priceBond ────────────────────────────────────────────────────
  describe('priceBond', () => {
    const engine = new AdvancedTradingEngine()

    it('zero coupon bond should price as PV of face value', () => {
      const price = engine.priceBond(1000, 0, 0.05, 10)
      const expected = 1000 / Math.pow(1.05, 10)
      expect(price).toBeCloseTo(expected, 2)
    })

    it('coupon bond priced at par when coupon rate equals yield', () => {
      const price = engine.priceBond(1000, 0.05, 0.05, 10)
      expect(price).toBeCloseTo(1000, 0)
    })

    it('premium bond when coupon rate > yield', () => {
      const price = engine.priceBond(1000, 0.08, 0.05, 10)
      expect(price).toBeGreaterThan(1000)
    })

    it('discount bond when coupon rate < yield', () => {
      const price = engine.priceBond(1000, 0.03, 0.05, 10)
      expect(price).toBeLessThan(1000)
    })

    it('should handle zero periods (return face value)', () => {
      const price = engine.priceBond(1000, 0.05, 0.05, 0)
      expect(price).toBe(1000)
    })

    it('single period bond', () => {
      const price = engine.priceBond(1000, 0.05, 0.05, 1)
      expect(price).toBeCloseTo(1000, 0)
    })
  })

  // ─── 11. calculateImpliedVol ──────────────────────────────────────────
  describe('calculateImpliedVol', () => {
    const engine = new AdvancedTradingEngine()

    it('should converge for an ATM call', () => {
      const opt = makeCall({ impliedVol: 0.3 })
      const bsPrice = engine.priceOption(opt, 0.04).price
      const iv = engine.calculateImpliedVol(bsPrice, makeCall(), 0.04)
      expect(iv).toBeCloseTo(0.3, 1)
    })

    it('should converge for an ATM put', () => {
      const opt = makePut({ impliedVol: 0.25 })
      const bsPrice = engine.priceOption(opt, 0.04).price
      const iv = engine.calculateImpliedVol(bsPrice, makePut(), 0.04)
      expect(iv).toBeCloseTo(0.25, 1)
    })

    it('should return positive implied vol', () => {
      const iv = engine.calculateImpliedVol(10, makeCall(), 0.04)
      expect(iv).toBeGreaterThan(0)
    })

    it('should handle ITM call', () => {
      const opt = makeCall({ underlying: 120, strike: 100, impliedVol: 0.2 })
      const price = engine.priceOption(opt, 0.04).price
      const iv = engine.calculateImpliedVol(price, makeCall({ underlying: 120, strike: 100 }), 0.04)
      expect(iv).toBeCloseTo(0.2, 1)
    })

    it('should handle OTM put and return positive vol', () => {
      const opt = makePut({ underlying: 120, strike: 100, impliedVol: 0.25 })
      const price = engine.priceOption(opt, 0.04).price
      const iv = engine.calculateImpliedVol(price, makePut({ underlying: 120, strike: 100 }), 0.04)
      expect(iv).toBeGreaterThan(0)
    })
  })

  // ─── 12. getProtocolDatabase ──────────────────────────────────────────
  describe('getProtocolDatabase', () => {
    const engine = new AdvancedTradingEngine()

    it('should return at least 10 protocols', () => {
      const db = engine.getProtocolDatabase()
      expect(db.length).toBeGreaterThanOrEqual(10)
    })

    it('each protocol should have required fields', () => {
      const db = engine.getProtocolDatabase()
      for (const p of db) {
        expect(p.name).toBeTruthy()
        expect(['dex', 'lending', 'yield', 'derivatives', 'bridge']).toContain(p.type)
        expect(p.tvl).toBeGreaterThan(0)
        expect(p.apy).toBeGreaterThan(0)
        expect(Array.isArray(p.risks)).toBe(true)
        expect(p.chain).toBeTruthy()
      }
    })

    it('should return a copy (not a reference)', () => {
      const db1 = engine.getProtocolDatabase()
      const db2 = engine.getProtocolDatabase()
      db1[0].name = 'MODIFIED'
      expect(db2[0].name).not.toBe('MODIFIED')
    })
  })

  // ─── 13. getStats ─────────────────────────────────────────────────────
  describe('getStats', () => {
    it('should track options priced', () => {
      const engine = new AdvancedTradingEngine()
      engine.priceOption(makeCall(), 0.04)
      engine.priceOption(makePut(), 0.04)
      expect(engine.getStats().totalOptionsPriced).toBe(2)
    })

    it('should track greeks calculated', () => {
      const engine = new AdvancedTradingEngine()
      engine.calculateGreeks(makeCall(), 100, 0.04)
      expect(engine.getStats().totalGreeksCalculated).toBe(1)
    })

    it('should track volatility models', () => {
      const engine = new AdvancedTradingEngine()
      engine.modelVolatility(sampleReturns(50), 'historical')
      engine.modelVolatility(sampleReturns(50), 'garch')
      expect(engine.getStats().totalVolatilityModels).toBe(2)
    })

    it('should track monte carlo runs', () => {
      const engine = new AdvancedTradingEngine({ defaultSimulations: 10 })
      engine.runMonteCarlo({ initialPrice: 100, drift: 0.05, volatility: 0.2, days: 5 })
      expect(engine.getStats().totalMonteCarloRuns).toBe(1)
    })

    it('should track algo executions', () => {
      const engine = new AdvancedTradingEngine()
      engine.planAlgoExecution(1000, 100000, 'vwap')
      expect(engine.getStats().totalAlgoExecutions).toBe(1)
    })

    it('should track order book analyses', () => {
      const engine = new AdvancedTradingEngine()
      engine.analyzeOrderBook([[99, 10]], [[101, 10]])
      expect(engine.getStats().totalOrderBookAnalyses).toBe(1)
    })

    it('should track risk calculations', () => {
      const engine = new AdvancedTradingEngine()
      engine.calculateRiskMetrics(sampleReturns(30))
      expect(engine.getStats().totalRiskCalculations).toBe(1)
    })

    it('should track DeFi analyses', () => {
      const engine = new AdvancedTradingEngine()
      engine.analyzeDeFi('Aave', 1000, [1, 1])
      expect(engine.getStats().totalDeFiAnalyses).toBe(1)
    })

    it('should track bonds priced', () => {
      const engine = new AdvancedTradingEngine()
      engine.priceBond(1000, 0.05, 0.05, 10)
      expect(engine.getStats().totalBondsPriced).toBe(1)
    })

    it('should track implied vol calculations', () => {
      const engine = new AdvancedTradingEngine()
      engine.calculateImpliedVol(10, makeCall(), 0.04)
      expect(engine.getStats().totalImpliedVolCalculations).toBe(1)
    })
  })

  // ─── 14. provideFeedback ──────────────────────────────────────────────
  describe('provideFeedback', () => {
    it('should increment feedback count', () => {
      const engine = new AdvancedTradingEngine()
      engine.provideFeedback(0.8)
      engine.provideFeedback(0.3)
      expect(engine.getStats().feedbackReceived).toBe(2)
    })

    it('score >= 0.5 should count as correct', () => {
      const engine = new AdvancedTradingEngine()
      engine.provideFeedback(0.5)
      engine.provideFeedback(0.9)
      expect(engine.getStats().feedbackAccuracy).toBeCloseTo(1.0, 2)
    })

    it('score < 0.5 should not count as correct', () => {
      const engine = new AdvancedTradingEngine()
      engine.provideFeedback(0.1)
      expect(engine.getStats().feedbackAccuracy).toBe(0)
    })

    it('mixed feedback should compute accuracy', () => {
      const engine = new AdvancedTradingEngine()
      engine.provideFeedback(0.9)
      engine.provideFeedback(0.1)
      expect(engine.getStats().feedbackAccuracy).toBeCloseTo(0.5, 2)
    })

    it('low score should increase garchAlpha when learning enabled', () => {
      const engine = new AdvancedTradingEngine({ enableLearning: true, garchAlpha: 0.09 })
      engine.provideFeedback(0.1)
      // Alpha should have increased
      const json = JSON.parse(engine.serialize())
      expect(json.config.garchAlpha).toBeGreaterThan(0.09)
    })

    it('high score should decrease garchAlpha when learning enabled', () => {
      const engine = new AdvancedTradingEngine({ enableLearning: true, garchAlpha: 0.09 })
      engine.provideFeedback(0.9)
      const json = JSON.parse(engine.serialize())
      expect(json.config.garchAlpha).toBeLessThan(0.09)
    })
  })

  // ─── 15. serialize / deserialize ──────────────────────────────────────
  describe('serialize / deserialize', () => {
    it('should produce valid JSON', () => {
      const engine = new AdvancedTradingEngine()
      const json = engine.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('round-trip should preserve stats', () => {
      const engine = new AdvancedTradingEngine()
      engine.priceOption(makeCall(), 0.04)
      engine.priceOption(makePut(), 0.04)
      engine.calculateGreeks(makeCall(), 100, 0.04)
      engine.provideFeedback(0.8)

      const restored = AdvancedTradingEngine.deserialize(engine.serialize())
      const origStats = engine.getStats()
      const restoredStats = restored.getStats()

      expect(restoredStats.totalOptionsPriced).toBe(origStats.totalOptionsPriced)
      expect(restoredStats.totalGreeksCalculated).toBe(origStats.totalGreeksCalculated)
      expect(restoredStats.feedbackReceived).toBe(origStats.feedbackReceived)
      expect(restoredStats.feedbackAccuracy).toBe(origStats.feedbackAccuracy)
    })

    it('deserialized engine should be functional', () => {
      const engine = new AdvancedTradingEngine()
      const restored = AdvancedTradingEngine.deserialize(engine.serialize())
      const result = restored.priceOption(makeCall(), 0.04)
      expect(result.price).toBeGreaterThan(0)
    })

    it('should preserve config through round-trip', () => {
      const engine = new AdvancedTradingEngine({ riskFreeRate: 0.06, binomialSteps: 200 })
      const restored = AdvancedTradingEngine.deserialize(engine.serialize())
      const json = JSON.parse(restored.serialize())
      expect(json.config.riskFreeRate).toBe(0.06)
      expect(json.config.binomialSteps).toBe(200)
    })

    it('should preserve all counter values', () => {
      const engine = new AdvancedTradingEngine({ defaultSimulations: 10 })
      engine.priceOption(makeCall(), 0.04)
      engine.calculateGreeks(makeCall(), 100, 0.04)
      engine.modelVolatility([0.01, 0.02, -0.01], 'historical')
      engine.runMonteCarlo({ initialPrice: 100, drift: 0, volatility: 0.2, days: 1 })
      engine.planAlgoExecution(100, 10000, 'twap')
      engine.analyzeOrderBook([[99, 10]], [[101, 10]])
      engine.calculateRiskMetrics([0.01, -0.01, 0.02])
      engine.analyzeDeFi('Aave', 1000, [1, 1])
      engine.priceBond(1000, 0.05, 0.05, 5)
      engine.calculateImpliedVol(10, makeCall(), 0.04)

      const restored = AdvancedTradingEngine.deserialize(engine.serialize())
      const s = restored.getStats()
      expect(s.totalOptionsPriced).toBe(1)
      expect(s.totalGreeksCalculated).toBe(1)
      expect(s.totalVolatilityModels).toBe(1)
      expect(s.totalMonteCarloRuns).toBe(1)
      expect(s.totalAlgoExecutions).toBe(1)
      expect(s.totalOrderBookAnalyses).toBe(1)
      expect(s.totalRiskCalculations).toBe(1)
      expect(s.totalDeFiAnalyses).toBe(1)
      expect(s.totalBondsPriced).toBe(1)
      expect(s.totalImpliedVolCalculations).toBe(1)
    })
  })
})
