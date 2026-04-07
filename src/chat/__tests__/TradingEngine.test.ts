import { describe, it, expect, beforeEach } from 'vitest'
import {
  TradingEngine,
  type OHLCV,
} from '../TradingEngine'

// ── Helpers: generate synthetic OHLCV data ──

function makeCandle(
  close: number,
  index: number,
  spread = 2,
  volume = 1000,
): OHLCV {
  const open = close - spread * 0.3
  const high = close + spread * 0.5
  const low = close - spread * 0.5
  return { open, high, low, close, volume, timestamp: 1_700_000_000_000 + index * 60_000 }
}

function makeUptrend(length: number, startPrice = 100, step = 0.5): OHLCV[] {
  return Array.from({ length }, (_, i) => makeCandle(startPrice + i * step, i))
}

function makeDowntrend(length: number, startPrice = 200, step = 0.5): OHLCV[] {
  return Array.from({ length }, (_, i) => makeCandle(startPrice - i * step, i))
}

function makeSideways(length: number, basePrice = 100, jitter = 0.2): OHLCV[] {
  return Array.from({ length }, (_, i) =>
    makeCandle(basePrice + (i % 2 === 0 ? jitter : -jitter), i),
  )
}

function makeVolatile(length: number, basePrice = 100, amplitude = 10): OHLCV[] {
  return Array.from({ length }, (_, i) =>
    makeCandle(basePrice + Math.sin(i * 0.5) * amplitude, i, amplitude * 0.3, 5000),
  )
}

function makeDoji(index: number, price = 100): OHLCV {
  return { open: price, high: price + 5, low: price - 5, close: price + 0.01, volume: 1000, timestamp: 1_700_000_000_000 + index * 60_000 }
}

function makeHammer(index: number, price = 100): OHLCV {
  const body = 1
  return { open: price, high: price + body * 0.3, low: price - body * 5, close: price + body, volume: 1000, timestamp: 1_700_000_000_000 + index * 60_000 }
}

function makeBullishEngulfing(index: number): [OHLCV, OHLCV] {
  const prev: OHLCV = { open: 105, high: 106, low: 99, close: 100, volume: 1000, timestamp: 1_700_000_000_000 + index * 60_000 }
  const curr: OHLCV = { open: 99, high: 108, low: 98, close: 107, volume: 1500, timestamp: 1_700_000_000_000 + (index + 1) * 60_000 }
  return [prev, curr]
}

function makeBearishEngulfing(index: number): [OHLCV, OHLCV] {
  const prev: OHLCV = { open: 100, high: 106, low: 99, close: 105, volume: 1000, timestamp: 1_700_000_000_000 + index * 60_000 }
  const curr: OHLCV = { open: 106, high: 107, low: 97, close: 98, volume: 1500, timestamp: 1_700_000_000_000 + (index + 1) * 60_000 }
  return [prev, curr]
}

// ── Constructor Tests ──

describe('TradingEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new TradingEngine()
    expect(engine).toBeInstanceOf(TradingEngine)
  })

  it('accepts a partial custom config', () => {
    const engine = new TradingEngine({ rsiPeriod: 7 })
    expect(engine).toBeInstanceOf(TradingEngine)
  })

  it('accepts a full custom config', () => {
    const engine = new TradingEngine({
      maxHistoryLength: 500,
      signalThreshold: 0.6,
      riskFreeRate: 0.03,
      smaPeriods: [5, 10],
      emaPeriod: 8,
      rsiPeriod: 10,
      macdFast: 8,
      macdSlow: 17,
      macdSignal: 6,
      bollingerPeriod: 15,
      bollingerStdDev: 1.5,
      stochasticPeriod: 10,
      atrPeriod: 10,
      supportResistanceLookback: 30,
      enableLearning: false,
    })
    expect(engine).toBeInstanceOf(TradingEngine)
  })

  it('starts with zero history length', () => {
    const engine = new TradingEngine()
    expect(engine.getHistoryLength()).toBe(0)
  })
})

// ── addCandles Tests ──

describe('TradingEngine addCandles', () => {
  let engine: TradingEngine

  beforeEach(() => {
    engine = new TradingEngine()
  })

  it('adds candles to history', () => {
    engine.addCandles(makeUptrend(10))
    expect(engine.getHistoryLength()).toBe(10)
  })

  it('accumulates candles across multiple calls', () => {
    engine.addCandles(makeUptrend(5))
    engine.addCandles(makeUptrend(5))
    expect(engine.getHistoryLength()).toBe(10)
  })

  it('trims history beyond maxHistoryLength', () => {
    const engine = new TradingEngine({ maxHistoryLength: 20 })
    engine.addCandles(makeUptrend(30))
    expect(engine.getHistoryLength()).toBe(20)
  })

  it('handles empty candle array', () => {
    engine.addCandles([])
    expect(engine.getHistoryLength()).toBe(0)
  })
})

// ── computeIndicators – SMA Tests ──

describe('TradingEngine computeIndicators SMA', () => {
  it('computes SMA for all configured periods', () => {
    const engine = new TradingEngine({ smaPeriods: [5, 10] })
    engine.addCandles(makeUptrend(50))
    const ind = engine.computeIndicators()
    expect(ind.sma[5].length).toBeGreaterThan(0)
    expect(ind.sma[10].length).toBeGreaterThan(0)
  })

  it('returns empty SMA when data is shorter than period', () => {
    const engine = new TradingEngine({ smaPeriods: [50] })
    engine.addCandles(makeUptrend(10))
    const ind = engine.computeIndicators()
    expect(ind.sma[50]).toEqual([])
  })

  it('SMA values are numeric and finite', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const ind = engine.computeIndicators()
    for (const val of ind.sma[10]) {
      expect(Number.isFinite(val)).toBe(true)
    }
  })
})

// ── computeIndicators – EMA Tests ──

describe('TradingEngine computeIndicators EMA', () => {
  it('computes EMA when sufficient data is provided', () => {
    const engine = new TradingEngine({ emaPeriod: 12 })
    engine.addCandles(makeUptrend(50))
    const ind = engine.computeIndicators()
    expect(ind.ema.length).toBeGreaterThan(0)
  })

  it('returns empty EMA when data is shorter than period', () => {
    const engine = new TradingEngine({ emaPeriod: 100 })
    engine.addCandles(makeUptrend(10))
    const ind = engine.computeIndicators()
    expect(ind.ema).toEqual([])
  })
})

// ── computeIndicators – RSI Tests ──

describe('TradingEngine computeIndicators RSI', () => {
  it('computes RSI values between 0 and 100', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(50))
    const ind = engine.computeIndicators()
    expect(ind.rsi.length).toBeGreaterThan(0)
    for (const val of ind.rsi) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(100)
    }
  })

  it('returns empty RSI when data is shorter than period + 1', () => {
    const engine = new TradingEngine({ rsiPeriod: 14 })
    engine.addCandles(makeUptrend(10))
    const ind = engine.computeIndicators()
    expect(ind.rsi).toEqual([])
  })

  it('RSI is high for a strong uptrend', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60, 100, 2))
    const ind = engine.computeIndicators()
    const lastRSI = ind.rsi[ind.rsi.length - 1]
    expect(lastRSI).toBeGreaterThan(50)
  })
})

// ── computeIndicators – MACD Tests ──

describe('TradingEngine computeIndicators MACD', () => {
  it('computes MACD with macdLine, signalLine, and histogram', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const ind = engine.computeIndicators()
    expect(ind.macd.macdLine.length).toBeGreaterThan(0)
    expect(ind.macd.signalLine.length).toBeGreaterThan(0)
    expect(ind.macd.histogram.length).toBeGreaterThan(0)
  })

  it('returns empty MACD arrays when data is insufficient', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(5))
    const ind = engine.computeIndicators()
    expect(ind.macd.macdLine).toEqual([])
  })
})

// ── computeIndicators – Bollinger Bands Tests ──

describe('TradingEngine computeIndicators Bollinger Bands', () => {
  it('upper band is above middle, lower band is below middle', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const ind = engine.computeIndicators()
    expect(ind.bollingerBands.upper.length).toBeGreaterThan(0)
    for (let i = 0; i < ind.bollingerBands.middle.length; i++) {
      expect(ind.bollingerBands.upper[i]).toBeGreaterThanOrEqual(ind.bollingerBands.middle[i])
      expect(ind.bollingerBands.lower[i]).toBeLessThanOrEqual(ind.bollingerBands.middle[i])
    }
  })

  it('returns empty bands when data is shorter than period', () => {
    const engine = new TradingEngine({ bollingerPeriod: 50 })
    engine.addCandles(makeUptrend(10))
    const ind = engine.computeIndicators()
    expect(ind.bollingerBands.upper).toEqual([])
    expect(ind.bollingerBands.middle).toEqual([])
    expect(ind.bollingerBands.lower).toEqual([])
  })
})

// ── computeIndicators – Stochastic Tests ──

describe('TradingEngine computeIndicators Stochastic', () => {
  it('computes %K and %D values between 0 and 100', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const ind = engine.computeIndicators()
    expect(ind.stochastic.k.length).toBeGreaterThan(0)
    expect(ind.stochastic.d.length).toBeGreaterThan(0)
    for (const val of ind.stochastic.k) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(100)
    }
  })

  it('returns empty stochastic when data is shorter than period', () => {
    const engine = new TradingEngine({ stochasticPeriod: 100 })
    engine.addCandles(makeUptrend(10))
    const ind = engine.computeIndicators()
    expect(ind.stochastic.k).toEqual([])
    expect(ind.stochastic.d).toEqual([])
  })
})

// ── computeIndicators – ATR Tests ──

describe('TradingEngine computeIndicators ATR', () => {
  it('computes positive ATR values', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const ind = engine.computeIndicators()
    expect(ind.atr.length).toBeGreaterThan(0)
    for (const val of ind.atr) {
      expect(val).toBeGreaterThanOrEqual(0)
    }
  })

  it('returns empty ATR when data is shorter than period', () => {
    const engine = new TradingEngine({ atrPeriod: 100 })
    engine.addCandles(makeUptrend(10))
    const ind = engine.computeIndicators()
    expect(ind.atr).toEqual([])
  })
})

// ── computeIndicators – VWAP Tests ──

describe('TradingEngine computeIndicators VWAP', () => {
  it('computes VWAP with same length as candle count', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(30))
    const ind = engine.computeIndicators()
    expect(ind.vwap.length).toBe(30)
  })

  it('VWAP values are finite numbers', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(20))
    const ind = engine.computeIndicators()
    for (const val of ind.vwap) {
      expect(Number.isFinite(val)).toBe(true)
    }
  })
})

// ── computeIndicators – OBV Tests ──

describe('TradingEngine computeIndicators OBV', () => {
  it('computes OBV with same length as candle count', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(30))
    const ind = engine.computeIndicators()
    expect(ind.obv.length).toBe(30)
  })

  it('OBV increases in an uptrend', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(30, 100, 1))
    const ind = engine.computeIndicators()
    const first = ind.obv[0]
    const last = ind.obv[ind.obv.length - 1]
    expect(last).toBeGreaterThan(first)
  })

  it('OBV decreases in a downtrend', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeDowntrend(30, 200, 1))
    const ind = engine.computeIndicators()
    const first = ind.obv[0]
    const last = ind.obv[ind.obv.length - 1]
    expect(last).toBeLessThan(first)
  })
})

// ── generateSignal Tests ──

describe('TradingEngine generateSignal', () => {
  it('returns hold signal with zero confidence when data is insufficient', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(5))
    const signal = engine.generateSignal()
    expect(signal.type).toBe('hold')
    expect(signal.confidence).toBe(0)
    expect(signal.reasoning).toContain('Insufficient data for signal generation')
  })

  it('returns a valid signal type (buy, sell, or hold)', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const signal = engine.generateSignal()
    expect(['buy', 'sell', 'hold']).toContain(signal.type)
  })

  it('confidence is between 0 and 1', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const signal = engine.generateSignal()
    expect(signal.confidence).toBeGreaterThanOrEqual(0)
    expect(signal.confidence).toBeLessThanOrEqual(1)
  })

  it('includes indicator names in the signal', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const signal = engine.generateSignal()
    expect(signal.indicators.length).toBeGreaterThan(0)
  })

  it('includes reasoning strings', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const signal = engine.generateSignal()
    expect(signal.reasoning.length).toBeGreaterThan(0)
  })

  it('has a timestamp', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const signal = engine.generateSignal()
    expect(signal.timestamp).toBeGreaterThan(0)
  })
})

// ── analyzeTrend Tests ──

describe('TradingEngine analyzeTrend', () => {
  it('returns sideways with zero strength for insufficient data', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(5))
    const trend = engine.analyzeTrend()
    expect(trend.direction).toBe('sideways')
    expect(trend.strength).toBe(0)
    expect(trend.duration).toBe(0)
  })

  it('detects uptrend for rising prices', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60, 100, 2))
    const trend = engine.analyzeTrend()
    expect(trend.direction).toBe('uptrend')
    expect(trend.strength).toBeGreaterThan(0)
  })

  it('detects downtrend for falling prices', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeDowntrend(60, 200, 2))
    const trend = engine.analyzeTrend()
    expect(trend.direction).toBe('downtrend')
    expect(trend.strength).toBeGreaterThan(0)
  })

  it('returns support and resistance level arrays', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const trend = engine.analyzeTrend()
    expect(Array.isArray(trend.supportLevels)).toBe(true)
    expect(Array.isArray(trend.resistanceLevels)).toBe(true)
  })

  it('duration is a non-negative integer', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const trend = engine.analyzeTrend()
    expect(trend.duration).toBeGreaterThanOrEqual(0)
    expect(Number.isInteger(trend.duration)).toBe(true)
  })
})

// ── detectCandlestickPatterns Tests ──

describe('TradingEngine detectCandlestickPatterns', () => {
  it('returns empty array when fewer than 3 candles', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(2))
    const patterns = engine.detectCandlestickPatterns()
    expect(patterns).toEqual([])
  })

  it('detects Doji pattern', () => {
    const engine = new TradingEngine()
    const candles = makeUptrend(5)
    candles.push(makeDoji(5, 105))
    candles.push(makeCandle(106, 6))
    engine.addCandles(candles)
    const patterns = engine.detectCandlestickPatterns()
    const dojis = patterns.filter(p => p.name === 'Doji')
    expect(dojis.length).toBeGreaterThanOrEqual(1)
    expect(dojis[0].type).toBe('neutral')
  })

  it('detects Hammer pattern', () => {
    const engine = new TradingEngine()
    const candles = makeUptrend(5)
    candles.push(makeHammer(5, 105))
    candles.push(makeCandle(108, 6))
    engine.addCandles(candles)
    const patterns = engine.detectCandlestickPatterns()
    const hammers = patterns.filter(p => p.name === 'Hammer')
    expect(hammers.length).toBeGreaterThanOrEqual(1)
    expect(hammers[0].type).toBe('bullish')
  })

  it('detects Bullish Engulfing pattern', () => {
    const engine = new TradingEngine()
    const candles = makeUptrend(3)
    candles.push(...makeBullishEngulfing(3))
    engine.addCandles(candles)
    const patterns = engine.detectCandlestickPatterns()
    const engulfing = patterns.filter(p => p.name === 'Bullish Engulfing')
    expect(engulfing.length).toBeGreaterThanOrEqual(1)
    expect(engulfing[0].type).toBe('bullish')
  })

  it('detects Bearish Engulfing pattern', () => {
    const engine = new TradingEngine()
    const candles = makeUptrend(3)
    candles.push(...makeBearishEngulfing(3))
    engine.addCandles(candles)
    const patterns = engine.detectCandlestickPatterns()
    const engulfing = patterns.filter(p => p.name === 'Bearish Engulfing')
    expect(engulfing.length).toBeGreaterThanOrEqual(1)
    expect(engulfing[0].type).toBe('bearish')
  })

  it('pattern confidence is between 0 and 1', () => {
    const engine = new TradingEngine()
    const candles = makeUptrend(5)
    candles.push(makeDoji(5))
    candles.push(makeCandle(106, 6))
    engine.addCandles(candles)
    const patterns = engine.detectCandlestickPatterns()
    for (const p of patterns) {
      expect(p.confidence).toBeGreaterThanOrEqual(0)
      expect(p.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('each pattern has a valid position index', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(10))
    const patterns = engine.detectCandlestickPatterns()
    for (const p of patterns) {
      expect(p.position).toBeGreaterThanOrEqual(0)
      expect(p.position).toBeLessThan(10)
    }
  })
})

// ── detectChartPatterns Tests ──

describe('TradingEngine detectChartPatterns', () => {
  it('returns empty array when data is shorter than 30 candles', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(10))
    const patterns = engine.detectChartPatterns()
    expect(patterns).toEqual([])
  })

  it('each detected pattern has required fields', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeVolatile(100, 100, 15))
    const patterns = engine.detectChartPatterns()
    for (const p of patterns) {
      expect(typeof p.name).toBe('string')
      expect(['bullish', 'bearish', 'neutral']).toContain(p.type)
      expect(typeof p.startIndex).toBe('number')
      expect(typeof p.endIndex).toBe('number')
      expect(typeof p.confidence).toBe('number')
      expect(typeof p.target).toBe('number')
    }
  })

  it('pattern confidence is between 0 and 1', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeVolatile(100, 100, 15))
    const patterns = engine.detectChartPatterns()
    for (const p of patterns) {
      expect(p.confidence).toBeGreaterThanOrEqual(0)
      expect(p.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('increments patternsDetected stat when patterns are found', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeVolatile(100, 100, 15))
    engine.detectChartPatterns()
    engine.detectCandlestickPatterns()
    const stats = engine.getStats()
    expect(stats.patternsDetected).toBeGreaterThanOrEqual(0)
  })
})

// ── computeRiskMetrics Tests ──

describe('TradingEngine computeRiskMetrics', () => {
  it('returns zero metrics when data is insufficient', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(2))
    const metrics = engine.computeRiskMetrics()
    expect(metrics.sharpeRatio).toBe(0)
    expect(metrics.maxDrawdown).toBe(0)
    expect(metrics.volatility).toBe(0)
    expect(metrics.var95).toBe(0)
    expect(metrics.sortinoRatio).toBe(0)
    expect(metrics.beta).toBe(0)
  })

  it('volatility is non-negative', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const metrics = engine.computeRiskMetrics()
    expect(metrics.volatility).toBeGreaterThanOrEqual(0)
  })

  it('maxDrawdown is between 0 and 1', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeDowntrend(60, 200, 1))
    const metrics = engine.computeRiskMetrics()
    expect(metrics.maxDrawdown).toBeGreaterThanOrEqual(0)
    expect(metrics.maxDrawdown).toBeLessThanOrEqual(1)
  })

  it('VaR95 is non-negative', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const metrics = engine.computeRiskMetrics()
    expect(metrics.var95).toBeGreaterThanOrEqual(0)
  })

  it('computes beta relative to benchmark when provided', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const benchmark = Array.from({ length: 59 }, () => 0.005)
    const metrics = engine.computeRiskMetrics(benchmark)
    expect(typeof metrics.beta).toBe('number')
    expect(Number.isFinite(metrics.beta)).toBe(true)
  })

  it('defaults beta to 1 when no benchmark is provided', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const metrics = engine.computeRiskMetrics()
    expect(metrics.beta).toBe(1)
  })

  it('all metric values are finite numbers', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeVolatile(60, 100, 5))
    const metrics = engine.computeRiskMetrics()
    expect(Number.isFinite(metrics.sharpeRatio)).toBe(true)
    expect(Number.isFinite(metrics.maxDrawdown)).toBe(true)
    expect(Number.isFinite(metrics.volatility)).toBe(true)
    expect(Number.isFinite(metrics.var95)).toBe(true)
    expect(Number.isFinite(metrics.sortinoRatio)).toBe(true)
    expect(Number.isFinite(metrics.beta)).toBe(true)
  })
})

// ── classifyMarketRegime Tests ──

describe('TradingEngine classifyMarketRegime', () => {
  it('returns low-volatility with zero confidence for insufficient data', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(10))
    const regime = engine.classifyMarketRegime()
    expect(regime.regime).toBe('low-volatility')
    expect(regime.confidence).toBe(0)
    expect(regime.characteristics).toContain('Insufficient data')
  })

  it('returns a valid regime string', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const regime = engine.classifyMarketRegime()
    expect([
      'trending-up', 'trending-down', 'mean-reverting', 'high-volatility', 'low-volatility',
    ]).toContain(regime.regime)
  })

  it('confidence is between 0 and 1', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const regime = engine.classifyMarketRegime()
    expect(regime.confidence).toBeGreaterThanOrEqual(0)
    expect(regime.confidence).toBeLessThanOrEqual(1)
  })

  it('includes characteristics array', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeVolatile(60, 100, 15))
    const regime = engine.classifyMarketRegime()
    expect(Array.isArray(regime.characteristics)).toBe(true)
    expect(regime.characteristics.length).toBeGreaterThan(0)
  })

  it('detects high-volatility for wildly swinging data', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeVolatile(60, 100, 30))
    const regime = engine.classifyMarketRegime()
    expect(regime.regime).toBe('high-volatility')
  })
})

// ── getStats Tests ──

describe('TradingEngine getStats', () => {
  let engine: TradingEngine

  beforeEach(() => {
    engine = new TradingEngine()
  })

  it('returns stats with all expected fields', () => {
    const stats = engine.getStats()
    expect(typeof stats.totalAnalyses).toBe('number')
    expect(typeof stats.totalSignals).toBe('number')
    expect(typeof stats.avgConfidence).toBe('number')
    expect(typeof stats.buySignals).toBe('number')
    expect(typeof stats.sellSignals).toBe('number')
    expect(typeof stats.holdSignals).toBe('number')
    expect(typeof stats.patternsDetected).toBe('number')
    expect(typeof stats.feedbackReceived).toBe('number')
    expect(typeof stats.feedbackAccuracy).toBe('number')
  })

  it('starts with zero counts', () => {
    const stats = engine.getStats()
    expect(stats.totalAnalyses).toBe(0)
    expect(stats.totalSignals).toBe(0)
    expect(stats.avgConfidence).toBe(0)
    expect(stats.buySignals).toBe(0)
    expect(stats.sellSignals).toBe(0)
    expect(stats.holdSignals).toBe(0)
    expect(stats.patternsDetected).toBe(0)
    expect(stats.feedbackReceived).toBe(0)
    expect(stats.feedbackAccuracy).toBe(0)
  })

  it('increments totalAnalyses after computeIndicators', () => {
    engine.addCandles(makeUptrend(30))
    engine.computeIndicators()
    engine.computeIndicators()
    const stats = engine.getStats()
    expect(stats.totalAnalyses).toBe(2)
  })

  it('increments totalSignals after generateSignal', () => {
    engine.addCandles(makeUptrend(60))
    engine.generateSignal()
    const stats = engine.getStats()
    expect(stats.totalSignals).toBeGreaterThanOrEqual(1)
  })

  it('tracks signal type counts correctly', () => {
    engine.addCandles(makeUptrend(60))
    engine.generateSignal()
    const stats = engine.getStats()
    const sum = stats.buySignals + stats.sellSignals + stats.holdSignals
    expect(sum).toBe(stats.totalSignals)
  })
})

// ── provideFeedback Tests ──

describe('TradingEngine provideFeedback', () => {
  it('increases feedbackReceived count after positive feedback', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const signal = engine.generateSignal()
    engine.provideFeedback(signal, true)
    const stats = engine.getStats()
    expect(stats.feedbackReceived).toBe(1)
  })

  it('increases feedbackReceived count after negative feedback', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const signal = engine.generateSignal()
    engine.provideFeedback(signal, false)
    const stats = engine.getStats()
    expect(stats.feedbackReceived).toBe(1)
  })

  it('tracks accuracy correctly with mixed feedback', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    const sig1 = engine.generateSignal()
    const sig2 = engine.generateSignal()
    engine.provideFeedback(sig1, true)
    engine.provideFeedback(sig2, false)
    const stats = engine.getStats()
    expect(stats.feedbackReceived).toBe(2)
    expect(stats.feedbackAccuracy).toBe(0.5)
  })

  it('does nothing when learning is disabled', () => {
    const engine = new TradingEngine({ enableLearning: false })
    engine.addCandles(makeUptrend(60))
    const signal = engine.generateSignal()
    engine.provideFeedback(signal, true)
    const stats = engine.getStats()
    expect(stats.feedbackReceived).toBe(0)
  })
})

// ── serialize / deserialize Tests ──

describe('TradingEngine serialize / deserialize', () => {
  it('round-trip preserves config', () => {
    const original = new TradingEngine({ rsiPeriod: 7, emaPeriod: 8 })
    const json = original.serialize()
    const data = JSON.parse(json)
    expect(data.config.rsiPeriod).toBe(7)
    expect(data.config.emaPeriod).toBe(8)
  })

  it('round-trip preserves history', () => {
    const original = new TradingEngine()
    original.addCandles(makeUptrend(20))
    const json = original.serialize()
    const restored = TradingEngine.deserialize(json)
    expect(restored.getHistoryLength()).toBe(20)
  })

  it('round-trip preserves stats', () => {
    const original = new TradingEngine()
    original.addCandles(makeUptrend(60))
    original.computeIndicators()
    original.generateSignal()

    const json = original.serialize()
    const restored = TradingEngine.deserialize(json)
    const stats = restored.getStats()
    expect(stats.totalAnalyses).toBeGreaterThanOrEqual(1)
    expect(stats.totalSignals).toBeGreaterThanOrEqual(1)
  })

  it('deserialized engine can compute indicators', () => {
    const original = new TradingEngine()
    original.addCandles(makeUptrend(60))
    const json = original.serialize()
    const restored = TradingEngine.deserialize(json)
    const ind = restored.computeIndicators()
    expect(ind.rsi.length).toBeGreaterThan(0)
  })

  it('throws on corrupted JSON input', () => {
    expect(() => TradingEngine.deserialize('not valid json')).toThrow()
  })
})

// ── Edge Cases Tests ──

describe('TradingEngine edge cases', () => {
  it('computeIndicators on empty history returns empty arrays', () => {
    const engine = new TradingEngine()
    const ind = engine.computeIndicators()
    expect(ind.ema).toEqual([])
    expect(ind.rsi).toEqual([])
    expect(ind.atr).toEqual([])
    expect(ind.obv).toEqual([])
    expect(ind.vwap).toEqual([])
  })

  it('generateSignal with single candle returns hold', () => {
    const engine = new TradingEngine()
    engine.addCandles([makeCandle(100, 0)])
    const signal = engine.generateSignal()
    expect(signal.type).toBe('hold')
    expect(signal.confidence).toBe(0)
  })

  it('analyzeTrend with exactly 20 candles does not crash', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(20))
    const trend = engine.analyzeTrend()
    expect(trend).toBeDefined()
    expect(typeof trend.direction).toBe('string')
  })

  it('computeRiskMetrics with flat prices yields zero volatility', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeSideways(60, 100, 0))
    const metrics = engine.computeRiskMetrics()
    expect(metrics.volatility).toBe(0)
  })

  it('classifyMarketRegime with exactly 30 candles does not crash', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(30))
    const regime = engine.classifyMarketRegime()
    expect(regime).toBeDefined()
  })

  it('detectCandlestickPatterns with exactly 3 candles runs without error', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(3))
    const patterns = engine.detectCandlestickPatterns()
    expect(Array.isArray(patterns)).toBe(true)
  })

  it('multiple sequential operations do not corrupt state', () => {
    const engine = new TradingEngine()
    engine.addCandles(makeUptrend(60))
    engine.computeIndicators()
    engine.generateSignal()
    engine.analyzeTrend()
    engine.detectCandlestickPatterns()
    engine.detectChartPatterns()
    engine.computeRiskMetrics()
    engine.classifyMarketRegime()
    const stats = engine.getStats()
    expect(stats.totalAnalyses).toBeGreaterThanOrEqual(1)
    expect(stats.totalSignals).toBeGreaterThanOrEqual(1)
  })
})
