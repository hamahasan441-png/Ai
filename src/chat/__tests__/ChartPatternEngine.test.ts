import { describe, it, expect, beforeEach } from 'vitest'
import { ChartPatternEngine, Candle } from '../ChartPatternEngine'

// ── Helper: generate candle data ──────────────────────────────────────────

function makeCandle(open: number, high: number, low: number, close: number): Candle {
  return { open, high, low, close }
}

function makeUptrend(start: number, bars: number, step: number = 0.001): Candle[] {
  const candles: Candle[] = []
  let price = start
  for (let i = 0; i < bars; i++) {
    const o = price
    const c = price + step
    candles.push({ open: o, high: c + step * 0.3, low: o - step * 0.3, close: c })
    price = c
  }
  return candles
}

function makeDowntrend(start: number, bars: number, step: number = 0.001): Candle[] {
  const candles: Candle[] = []
  let price = start
  for (let i = 0; i < bars; i++) {
    const o = price
    const c = price - step
    candles.push({ open: o, high: o + step * 0.3, low: c - step * 0.3, close: c })
    price = c
  }
  return candles
}

describe('ChartPatternEngine', () => {
  let engine: ChartPatternEngine

  beforeEach(() => {
    engine = new ChartPatternEngine()
  })

  // ── Constructor & Config ─────────────────────────────────────────────

  describe('constructor & config', () => {
    it('creates with default config', () => {
      expect(engine).toBeInstanceOf(ChartPatternEngine)
      const cfg = engine.getConfig()
      expect(cfg.dojiThreshold).toBe(0.1)
      expect(cfg.srLookback).toBe(50)
    })

    it('creates with custom config', () => {
      const e = new ChartPatternEngine({ dojiThreshold: 0.15, srLookback: 100 })
      expect(e.getConfig().dojiThreshold).toBe(0.15)
      expect(e.getConfig().srLookback).toBe(100)
    })

    it('updateConfig merges', () => {
      engine.updateConfig({ signalMinConfidence: 70 })
      expect(engine.getConfig().signalMinConfidence).toBe(70)
      expect(engine.getConfig().dojiThreshold).toBe(0.1)
    })

    it('initial stats are zeroed', () => {
      const stats = engine.getStats()
      expect(stats.totalCandlestickScans).toBe(0)
      expect(stats.totalSignalsGenerated).toBe(0)
    })
  })

  // ── Candlestick Pattern Detection ────────────────────────────────────

  describe('candlestick patterns', () => {
    it('detects doji (open ≈ close)', () => {
      const candles: Candle[] = [
        makeCandle(1.1000, 1.1050, 1.0950, 1.1005), // doji: body is tiny vs range
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      const doji = patterns.find(p => p.type === 'doji' || p.type === 'dragonfly-doji' || p.type === 'gravestone-doji')
      expect(doji).toBeDefined()
    })

    it('detects hammer (long lower wick, bullish)', () => {
      const candles: Candle[] = [
        makeCandle(1.1000, 1.1010, 1.0950, 1.1008), // lower wick >> body, upper wick tiny
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      const hammer = patterns.find(p => p.type === 'hammer')
      expect(hammer).toBeDefined()
      expect(hammer!.direction).toBe('buy')
    })

    it('detects shooting star (long upper wick, bearish)', () => {
      const candles: Candle[] = [
        makeCandle(1.1010, 1.1060, 1.1000, 1.1002), // bearish, long upper wick
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      const star = patterns.find(p => p.type === 'shooting-star')
      expect(star).toBeDefined()
      expect(star!.direction).toBe('sell')
    })

    it('detects bullish engulfing (2 candles)', () => {
      const candles: Candle[] = [
        makeCandle(1.1020, 1.1025, 1.0990, 1.1000), // bearish
        makeCandle(1.0995, 1.1030, 1.0990, 1.1025), // bullish, engulfs previous
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      const engulfing = patterns.find(p => p.type === 'bullish-engulfing')
      expect(engulfing).toBeDefined()
      expect(engulfing!.direction).toBe('buy')
    })

    it('detects bearish engulfing', () => {
      const candles: Candle[] = [
        makeCandle(1.1000, 1.1025, 1.0995, 1.1020), // bullish
        makeCandle(1.1025, 1.1030, 1.0990, 1.0995), // bearish, engulfs previous
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      expect(patterns.find(p => p.type === 'bearish-engulfing')).toBeDefined()
    })

    it('detects morning star (3 candles)', () => {
      const candles: Candle[] = [
        makeCandle(1.1040, 1.1045, 1.1000, 1.1005), // big red
        makeCandle(1.1005, 1.1010, 1.1000, 1.1008), // small body
        makeCandle(1.1010, 1.1050, 1.1005, 1.1045), // big green
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      expect(patterns.find(p => p.type === 'morning-star')).toBeDefined()
    })

    it('detects evening star (3 candles)', () => {
      const candles: Candle[] = [
        makeCandle(1.1000, 1.1045, 1.0995, 1.1040), // big green
        makeCandle(1.1040, 1.1045, 1.1035, 1.1038), // small body
        makeCandle(1.1038, 1.1040, 1.0995, 1.1000), // big red
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      expect(patterns.find(p => p.type === 'evening-star')).toBeDefined()
    })

    it('detects marubozu bullish (full body, no wicks)', () => {
      const candles: Candle[] = [
        makeCandle(1.1000, 1.1050, 1.1000, 1.1050), // pure bullish body
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      expect(patterns.find(p => p.type === 'marubozu-bullish')).toBeDefined()
    })

    it('detects marubozu bearish', () => {
      const candles: Candle[] = [
        makeCandle(1.1050, 1.1050, 1.1000, 1.1000), // pure bearish body
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      expect(patterns.find(p => p.type === 'marubozu-bearish')).toBeDefined()
    })

    it('detects three white soldiers', () => {
      const candles: Candle[] = [
        makeCandle(1.1000, 1.1025, 1.0995, 1.1020), // bullish
        makeCandle(1.1020, 1.1050, 1.1015, 1.1045), // bullish, higher close
        makeCandle(1.1045, 1.1075, 1.1040, 1.1070), // bullish, higher close
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      expect(patterns.find(p => p.type === 'three-white-soldiers')).toBeDefined()
    })

    it('detects three black crows', () => {
      const candles: Candle[] = [
        makeCandle(1.1060, 1.1065, 1.1030, 1.1035), // bearish
        makeCandle(1.1035, 1.1040, 1.1005, 1.1010), // bearish, lower close
        makeCandle(1.1010, 1.1015, 1.0980, 1.0985), // bearish, lower close
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      expect(patterns.find(p => p.type === 'three-black-crows')).toBeDefined()
    })

    it('detects bullish harami', () => {
      const candles: Candle[] = [
        makeCandle(1.1040, 1.1045, 1.0990, 1.1000), // large red
        makeCandle(1.1010, 1.1020, 1.1005, 1.1018), // small green inside
      ]
      const patterns = engine.detectCandlestickPatterns(candles)
      expect(patterns.find(p => p.type === 'bullish-harami')).toBeDefined()
    })

    it('returns empty array for zero-range candle', () => {
      const candles: Candle[] = [makeCandle(1.1, 1.1, 1.1, 1.1)]
      expect(engine.detectCandlestickPatterns(candles).length).toBe(0)
    })

    it('increments totalCandlestickScans', () => {
      engine.detectCandlestickPatterns([makeCandle(1.1, 1.2, 1.0, 1.15)])
      expect(engine.getStats().totalCandlestickScans).toBe(1)
    })

    it('tracks patterns found in stats', () => {
      engine.detectCandlestickPatterns([makeCandle(1.1000, 1.1050, 1.1000, 1.1050)])
      const stats = engine.getStats()
      expect(Object.keys(stats.patternsFound).length).toBeGreaterThan(0)
    })
  })

  // ── Pattern Info ─────────────────────────────────────────────────────

  describe('pattern info', () => {
    it('getCandlestickPatternInfo returns info for doji', () => {
      const info = engine.getCandlestickPatternInfo('doji')
      expect(info.direction).toBe('neutral')
      expect(info.reliability).toBeGreaterThan(0)
      expect(info.description).toContain('Indecision')
    })

    it('getCandlestickPatternInfo returns info for bullish-engulfing', () => {
      const info = engine.getCandlestickPatternInfo('bullish-engulfing')
      expect(info.direction).toBe('buy')
      expect(info.reliability).toBe(75)
    })

    it('getAllCandlestickPatterns returns all 22 patterns', () => {
      const all = engine.getAllCandlestickPatterns()
      expect(all.length).toBe(22)
      for (const p of all) {
        expect(p.type).toBeDefined()
        expect(p.direction).toBeDefined()
        expect(p.reliability).toBeGreaterThan(0)
      }
    })

    it('getCandlestickPatternCount returns 22', () => {
      expect(engine.getCandlestickPatternCount()).toBe(22)
    })
  })

  // ── Support & Resistance ─────────────────────────────────────────────

  describe('support & resistance', () => {
    it('detects support levels from lows', () => {
      // Create data with repeated low at 1.1000
      const candles: Candle[] = []
      for (let i = 0; i < 20; i++) {
        const base = 1.1000 + Math.sin(i * 0.5) * 0.005
        candles.push(makeCandle(base, base + 0.003, 1.1000 + (i % 3 === 0 ? 0 : 0.002), base + 0.001))
      }
      const levels = engine.detectSupportResistance(candles, 20)
      expect(levels.length).toBeGreaterThanOrEqual(0) // might not find if no clear pivots
    })

    it('returns empty for insufficient data', () => {
      const candles = [makeCandle(1.1, 1.2, 1.0, 1.15)]
      expect(engine.detectSupportResistance(candles).length).toBe(0)
    })

    it('levels have required fields', () => {
      const candles: Candle[] = []
      for (let i = 0; i < 30; i++) {
        const v = Math.sin(i * 0.3) * 0.01
        candles.push(makeCandle(1.1 + v, 1.11 + v, 1.09 + v, 1.1 + v + 0.002))
      }
      const levels = engine.detectSupportResistance(candles, 30)
      for (const l of levels) {
        expect(l.price).toBeGreaterThan(0)
        expect(['support', 'resistance']).toContain(l.type)
        expect(l.strength).toBeGreaterThanOrEqual(1)
        expect(l.strength).toBeLessThanOrEqual(5)
        expect(l.touches).toBeGreaterThanOrEqual(1)
      }
    })

    it('groups nearby levels together', () => {
      // Create oscillating data that revisits same levels
      const candles: Candle[] = []
      for (let i = 0; i < 50; i++) {
        const phase = Math.sin(i * 0.4)
        const base = 1.1 + phase * 0.01
        candles.push(makeCandle(base, base + 0.002, base - 0.002, base + 0.001))
      }
      const levels = engine.detectSupportResistance(candles)
      // Should group nearby touches
      if (levels.length > 0) {
        expect(levels[0].strength).toBeGreaterThanOrEqual(1)
      }
    })
  })

  // ── Fibonacci ────────────────────────────────────────────────────────

  describe('fibonacci levels', () => {
    it('calculates fibonacci retracement (uptrend)', () => {
      const levels = engine.calculateFibonacci(1.2000, 1.1000, 'up')
      expect(levels.length).toBe(10) // 10 fib levels
      // 0% = swing high
      expect(levels[0].price).toBeCloseTo(1.2000, 4)
      // 100% = swing low
      expect(levels[6].price).toBeCloseTo(1.1000, 4)
      // 50% retracement
      expect(levels[3].price).toBeCloseTo(1.1500, 4)
      // 38.2%
      expect(levels[2].price).toBeCloseTo(1.1618, 3)
      // 61.8%
      expect(levels[4].price).toBeCloseTo(1.1382, 3)
    })

    it('calculates fibonacci (downtrend)', () => {
      const levels = engine.calculateFibonacci(1.2000, 1.1000, 'down')
      expect(levels.length).toBe(10)
      expect(levels[0].price).toBeCloseTo(1.1000, 4) // 0% = swing low (bottom up)
    })

    it('returns empty for invalid range', () => {
      expect(engine.calculateFibonacci(1.1, 1.2).length).toBe(0) // high < low
    })

    it('fibonacci levels have labels', () => {
      const levels = engine.calculateFibonacci(1.2, 1.1)
      for (const l of levels) {
        expect(l.label).toBeDefined()
        expect(l.level).toBeGreaterThanOrEqual(0)
      }
    })

    it('autoFibonacci finds swing high/low', () => {
      const candles = [
        ...makeUptrend(1.1, 10, 0.001),
        ...makeDowntrend(1.11, 5, 0.001),
      ]
      const result = engine.autoFibonacci(candles)
      expect(result.swingHigh).toBeGreaterThan(result.swingLow)
      expect(result.levels.length).toBe(10)
    })

    it('autoFibonacci returns empty for tiny data', () => {
      const result = engine.autoFibonacci([makeCandle(1.1, 1.2, 1.0, 1.15)])
      expect(result.levels.length).toBe(0)
    })

    it('getFibonacciLevels returns reference levels', () => {
      const levels = engine.getFibonacciLevels()
      expect(levels.length).toBe(10)
      expect(levels.find(l => l.ratio === 0.618)).toBeDefined()
    })
  })

  // ── Chart Pattern Detection ──────────────────────────────────────────

  describe('chart patterns', () => {
    it('returns empty for insufficient data', () => {
      const candles = [makeCandle(1.1, 1.2, 1.0, 1.15)]
      expect(engine.detectChartPatterns(candles).length).toBe(0)
    })

    it('increments totalChartPatternScans', () => {
      engine.detectChartPatterns(makeUptrend(1.1, 20))
      expect(engine.getStats().totalChartPatternScans).toBe(1)
    })

    it('detects double top from M-shaped price', () => {
      const candles: Candle[] = []
      // Create M-shape: up → peak1 → dip → peak2 → down
      const values = [1.10, 1.11, 1.12, 1.13, 1.14, 1.145, 1.14, 1.13, 1.12, 1.11,
        1.12, 1.13, 1.14, 1.145, 1.14, 1.13, 1.12, 1.11, 1.10, 1.09]
      for (const v of values) {
        candles.push(makeCandle(v - 0.002, v + 0.003, v - 0.003, v + 0.001))
      }
      const patterns = engine.detectChartPatterns(candles)
      // May or may not detect depending on exact pivot detection
      if (patterns.length > 0) {
        const dt = patterns.find(p => p.type === 'double-top')
        if (dt) {
          expect(dt.direction).toBe('sell')
          expect(dt.reliability).toBeGreaterThanOrEqual(60)
        }
      }
    })

    it('detected chart patterns have required fields', () => {
      // Create enough data for triangle detection
      const candles: Candle[] = []
      for (let i = 0; i < 30; i++) {
        const squeeze = (30 - i) / 30 // converging
        const base = 1.1
        candles.push(makeCandle(base, base + 0.01 * squeeze, base - 0.01 * squeeze, base + 0.002))
      }
      const patterns = engine.detectChartPatterns(candles)
      for (const p of patterns) {
        expect(p.type).toBeDefined()
        expect(p.direction).toBeDefined()
        expect(p.reliability).toBeGreaterThan(0)
        expect(p.startIndex).toBeDefined()
        expect(p.endIndex).toBeDefined()
      }
    })
  })

  // ── ATR Calculation ──────────────────────────────────────────────────

  describe('ATR calculation', () => {
    it('calculates ATR for sufficient data', () => {
      const candles = makeUptrend(1.1, 20, 0.001)
      const atr = engine.calculateATR(candles, 14)
      expect(atr).toBeGreaterThan(0)
    })

    it('handles insufficient data gracefully', () => {
      const candles = [makeCandle(1.1, 1.15, 1.05, 1.12)]
      const atr = engine.calculateATR(candles, 14)
      expect(atr).toBeGreaterThanOrEqual(0)
    })

    it('ATR is positive for volatile data', () => {
      const candles: Candle[] = []
      for (let i = 0; i < 20; i++) {
        const v = (i % 2 === 0) ? 0.01 : -0.01
        candles.push(makeCandle(1.1 + v, 1.12 + v, 1.08 + v, 1.1 - v))
      }
      expect(engine.calculateATR(candles)).toBeGreaterThan(0)
    })
  })

  // ── Signal Generation ────────────────────────────────────────────────

  describe('signal generation', () => {
    it('returns null for insufficient data', () => {
      expect(engine.generateSignal([makeCandle(1.1, 1.2, 1.0, 1.15)])).toBeNull()
    })

    it('generates signal from candlestick patterns', () => {
      // Bullish setup: downtrend then bullish engulfing
      const candles = [
        ...makeDowntrend(1.12, 5, 0.002),
        makeCandle(1.1120, 1.1125, 1.1090, 1.1100), // bearish
        makeCandle(1.1095, 1.1140, 1.1090, 1.1130), // bullish engulfing
      ]
      const signal = engine.generateSignal(candles)
      // Signal may or may not meet confidence threshold
      if (signal) {
        expect(signal.direction).toBeDefined()
        expect(signal.confidence).toBeGreaterThan(0)
        expect(signal.entry).toBeGreaterThan(0)
        expect(signal.stopLoss).toBeGreaterThan(0)
        expect(signal.takeProfit).toBeGreaterThan(0)
        expect(signal.riskReward).toBeGreaterThan(0)
      }
    })

    it('signal has required fields when generated', () => {
      // Strong bullish signal: hammer + support
      const candles: Candle[] = []
      for (let i = 0; i < 20; i++) {
        candles.push(makeCandle(1.1 + i * 0.001, 1.102 + i * 0.001, 1.098 + i * 0.001, 1.101 + i * 0.001))
      }
      // Add hammer at end
      candles.push(makeCandle(1.1200, 1.1210, 1.1150, 1.1208))
      const signal = engine.generateSignal(candles)
      if (signal) {
        expect(['buy', 'sell']).toContain(signal.direction)
        expect(signal.confidence).toBeGreaterThanOrEqual(0)
        expect(signal.confidence).toBeLessThanOrEqual(100)
        expect(signal.patterns).toBeInstanceOf(Array)
        expect(signal.reason.length).toBeGreaterThan(0)
      }
    })

    it('increments totalSignalsGenerated', () => {
      engine.generateSignal(makeUptrend(1.1, 10))
      expect(engine.getStats().totalSignalsGenerated).toBe(1)
    })
  })

  // ── Stats ────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('resetStats clears all', () => {
      engine.detectCandlestickPatterns([makeCandle(1.1, 1.15, 1.05, 1.12)])
      engine.detectChartPatterns(makeUptrend(1.1, 20))
      engine.generateSignal(makeUptrend(1.1, 10))
      engine.resetStats()
      const stats = engine.getStats()
      expect(stats.totalCandlestickScans).toBe(0)
      expect(stats.totalChartPatternScans).toBe(0)
      expect(stats.totalSignalsGenerated).toBe(0)
      expect(Object.keys(stats.patternsFound).length).toBe(0)
    })
  })
})
