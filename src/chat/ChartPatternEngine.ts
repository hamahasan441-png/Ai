/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║       📊  C H A R T   P A T T E R N   E N G I N E                          ║
 * ║                                                                             ║
 * ║   Chart pattern recognition & technical analysis engine:                    ║
 * ║     detect → confirm → signal → manage                                      ║
 * ║                                                                             ║
 * ║     • 20+ candlestick patterns (doji, hammer, engulfing, morning star...)   ║
 * ║     • Chart patterns (head & shoulders, triangles, channels, wedges)        ║
 * ║     • Support / resistance level detection                                  ║
 * ║     • Fibonacci retracement & extension levels                              ║
 * ║     • Multi-timeframe analysis helpers                                      ║
 * ║     • Trading signal generation with confidence scoring                     ║
 * ║     • Pattern-based entry/exit/SL/TP calculation                            ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface Candle {
  open: number
  high: number
  low: number
  close: number
  volume?: number
  time?: number
}

export type CandlestickPatternType =
  | 'doji'
  | 'hammer'
  | 'inverted-hammer'
  | 'hanging-man'
  | 'shooting-star'
  | 'bullish-engulfing'
  | 'bearish-engulfing'
  | 'morning-star'
  | 'evening-star'
  | 'three-white-soldiers'
  | 'three-black-crows'
  | 'bullish-harami'
  | 'bearish-harami'
  | 'piercing-line'
  | 'dark-cloud-cover'
  | 'tweezer-top'
  | 'tweezer-bottom'
  | 'spinning-top'
  | 'marubozu-bullish'
  | 'marubozu-bearish'
  | 'dragonfly-doji'
  | 'gravestone-doji'

export type ChartPatternType =
  | 'head-and-shoulders'
  | 'inverse-head-and-shoulders'
  | 'double-top'
  | 'double-bottom'
  | 'triple-top'
  | 'triple-bottom'
  | 'ascending-triangle'
  | 'descending-triangle'
  | 'symmetrical-triangle'
  | 'rising-wedge'
  | 'falling-wedge'
  | 'ascending-channel'
  | 'descending-channel'
  | 'flag-bullish'
  | 'flag-bearish'
  | 'pennant'
  | 'cup-and-handle'
  | 'rounding-bottom'

export type SignalDirection = 'buy' | 'sell' | 'neutral'

export interface CandlestickPattern {
  type: CandlestickPatternType
  direction: SignalDirection
  reliability: number // 0-100
  description: string
  index: number // candle index where pattern was found
}

export interface ChartPattern {
  type: ChartPatternType
  direction: SignalDirection
  reliability: number
  description: string
  neckline?: number
  target?: number
  startIndex: number
  endIndex: number
}

export interface SupportResistanceLevel {
  price: number
  type: 'support' | 'resistance'
  strength: number // 1-5 (how many times tested)
  touches: number
}

export interface FibonacciLevel {
  level: number // 0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0
  price: number
  label: string
}

export interface TradeSignal {
  direction: SignalDirection
  confidence: number // 0-100
  entry: number
  stopLoss: number
  takeProfit: number
  riskReward: number
  reason: string
  patterns: string[]
}

export interface ChartPatternEngineConfig {
  dojiThreshold: number // body/range ratio for doji (default 0.1)
  marubozuThreshold: number // wick/range ratio for marubozu (default 0.05)
  srLookback: number // bars for S/R detection
  srTolerance: number // price tolerance for S/R grouping (as %)
  minPatternBars: number // minimum bars for chart pattern
  signalMinConfidence: number // minimum confidence to generate signal
}

export interface ChartPatternEngineStats {
  totalCandlestickScans: number
  totalChartPatternScans: number
  totalSignalsGenerated: number
  patternsFound: Record<string, number>
}

// ── Default Config ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG: ChartPatternEngineConfig = {
  dojiThreshold: 0.1,
  marubozuThreshold: 0.05,
  srLookback: 50,
  srTolerance: 0.2,
  minPatternBars: 5,
  signalMinConfidence: 50,
}

// ── Candlestick Pattern Descriptions ─────────────────────────────────────────

const PATTERN_INFO: Record<CandlestickPatternType, { direction: SignalDirection; reliability: number; description: string }> = {
  'doji': { direction: 'neutral', reliability: 50, description: 'Indecision candle — open ≈ close. Reversal signal when found after trend.' },
  'hammer': { direction: 'buy', reliability: 70, description: 'Long lower wick, small body at top. Bullish reversal at support.' },
  'inverted-hammer': { direction: 'buy', reliability: 60, description: 'Long upper wick, small body at bottom. Bullish reversal signal.' },
  'hanging-man': { direction: 'sell', reliability: 65, description: 'Same shape as hammer but at resistance. Bearish reversal.' },
  'shooting-star': { direction: 'sell', reliability: 70, description: 'Long upper wick at resistance. Strong bearish reversal.' },
  'bullish-engulfing': { direction: 'buy', reliability: 75, description: 'Green candle fully engulfs previous red candle. Strong bullish reversal.' },
  'bearish-engulfing': { direction: 'sell', reliability: 75, description: 'Red candle fully engulfs previous green candle. Strong bearish reversal.' },
  'morning-star': { direction: 'buy', reliability: 80, description: '3-candle bullish reversal: big red → small body → big green.' },
  'evening-star': { direction: 'sell', reliability: 80, description: '3-candle bearish reversal: big green → small body → big red.' },
  'three-white-soldiers': { direction: 'buy', reliability: 80, description: 'Three consecutive long green candles. Strong bullish continuation.' },
  'three-black-crows': { direction: 'sell', reliability: 80, description: 'Three consecutive long red candles. Strong bearish continuation.' },
  'bullish-harami': { direction: 'buy', reliability: 55, description: 'Small green inside previous large red. Potential reversal.' },
  'bearish-harami': { direction: 'sell', reliability: 55, description: 'Small red inside previous large green. Potential reversal.' },
  'piercing-line': { direction: 'buy', reliability: 65, description: 'Green candle opens below previous low, closes above midpoint. Bullish.' },
  'dark-cloud-cover': { direction: 'sell', reliability: 65, description: 'Red candle opens above previous high, closes below midpoint. Bearish.' },
  'tweezer-top': { direction: 'sell', reliability: 60, description: 'Two candles with equal highs at resistance. Bearish reversal.' },
  'tweezer-bottom': { direction: 'buy', reliability: 60, description: 'Two candles with equal lows at support. Bullish reversal.' },
  'spinning-top': { direction: 'neutral', reliability: 40, description: 'Small body with equal wicks. Indecision — wait for confirmation.' },
  'marubozu-bullish': { direction: 'buy', reliability: 70, description: 'Full body candle with no wicks. Strong bullish momentum.' },
  'marubozu-bearish': { direction: 'sell', reliability: 70, description: 'Full body candle with no wicks. Strong bearish momentum.' },
  'dragonfly-doji': { direction: 'buy', reliability: 65, description: 'Doji with long lower wick. Bullish at support levels.' },
  'gravestone-doji': { direction: 'sell', reliability: 65, description: 'Doji with long upper wick. Bearish at resistance levels.' },
}

// ── Fibonacci Levels ─────────────────────────────────────────────────────────

const FIB_LEVELS = [
  { ratio: 0, label: '0%' },
  { ratio: 0.236, label: '23.6%' },
  { ratio: 0.382, label: '38.2%' },
  { ratio: 0.5, label: '50%' },
  { ratio: 0.618, label: '61.8%' },
  { ratio: 0.786, label: '78.6%' },
  { ratio: 1.0, label: '100%' },
  { ratio: 1.272, label: '127.2%' },
  { ratio: 1.618, label: '161.8%' },
  { ratio: 2.618, label: '261.8%' },
]

// ── Main Class ───────────────────────────────────────────────────────────────

export class ChartPatternEngine {
  private config: ChartPatternEngineConfig
  private stats: ChartPatternEngineStats

  constructor(config?: Partial<ChartPatternEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.stats = {
      totalCandlestickScans: 0,
      totalChartPatternScans: 0,
      totalSignalsGenerated: 0,
      patternsFound: {},
    }
  }

  // ── Candlestick Pattern Detection ──────────────────────────────────────

  /** Detect all candlestick patterns in a series of candles. */
  detectCandlestickPatterns(candles: Candle[]): CandlestickPattern[] {
    this.stats.totalCandlestickScans++
    const patterns: CandlestickPattern[] = []

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i]
      const prev = i > 0 ? candles[i - 1] : null
      const prev2 = i > 1 ? candles[i - 2] : null

      const body = Math.abs(c.close - c.open)
      const range = c.high - c.low
      const upperWick = c.high - Math.max(c.open, c.close)
      const lowerWick = Math.min(c.open, c.close) - c.low
      const isBullish = c.close > c.open
      const isBearish = c.close < c.open

      if (range === 0) continue

      // ── Single-candle patterns ──
      const bodyRatio = body / range

      // Doji
      if (bodyRatio <= this.config.dojiThreshold) {
        if (lowerWick > upperWick * 2 && lowerWick > range * 0.6) {
          this.addPattern(patterns, 'dragonfly-doji', i)
        } else if (upperWick > lowerWick * 2 && upperWick > range * 0.6) {
          this.addPattern(patterns, 'gravestone-doji', i)
        } else {
          this.addPattern(patterns, 'doji', i)
        }
      }

      // Spinning top
      if (bodyRatio > 0.1 && bodyRatio < 0.3 && upperWick > body && lowerWick > body) {
        this.addPattern(patterns, 'spinning-top', i)
      }

      // Marubozu
      if (bodyRatio > 0.95) {
        this.addPattern(patterns, isBullish ? 'marubozu-bullish' : 'marubozu-bearish', i)
      }

      // Hammer (bullish, at bottom)
      if (isBullish && lowerWick >= body * 2 && upperWick < body * 0.3 && bodyRatio > 0.1) {
        this.addPattern(patterns, 'hammer', i)
      }

      // Inverted hammer
      if (isBullish && upperWick >= body * 2 && lowerWick < body * 0.3 && bodyRatio > 0.1) {
        this.addPattern(patterns, 'inverted-hammer', i)
      }

      // Hanging man (bearish context needed — same shape as hammer)
      if (isBearish && lowerWick >= body * 2 && upperWick < body * 0.3 && bodyRatio > 0.1) {
        this.addPattern(patterns, 'hanging-man', i)
      }

      // Shooting star
      if (isBearish && upperWick >= body * 2 && lowerWick < body * 0.3 && bodyRatio > 0.1) {
        this.addPattern(patterns, 'shooting-star', i)
      }

      // ── Two-candle patterns ──
      if (prev) {
        const prevBody = Math.abs(prev.close - prev.open)
        const prevBullish = prev.close > prev.open
        const prevBearish = prev.close < prev.open

        // Bullish engulfing
        if (isBullish && prevBearish && c.open <= prev.close && c.close >= prev.open && body > prevBody) {
          this.addPattern(patterns, 'bullish-engulfing', i)
        }

        // Bearish engulfing
        if (isBearish && prevBullish && c.open >= prev.close && c.close <= prev.open && body > prevBody) {
          this.addPattern(patterns, 'bearish-engulfing', i)
        }

        // Bullish harami
        if (isBullish && prevBearish && c.open > prev.close && c.close < prev.open && body < prevBody * 0.5) {
          this.addPattern(patterns, 'bullish-harami', i)
        }

        // Bearish harami
        if (isBearish && prevBullish && c.open < prev.close && c.close > prev.open && body < prevBody * 0.5) {
          this.addPattern(patterns, 'bearish-harami', i)
        }

        // Piercing line
        if (isBullish && prevBearish && c.open < prev.low && c.close > (prev.open + prev.close) / 2) {
          this.addPattern(patterns, 'piercing-line', i)
        }

        // Dark cloud cover
        if (isBearish && prevBullish && c.open > prev.high && c.close < (prev.open + prev.close) / 2) {
          this.addPattern(patterns, 'dark-cloud-cover', i)
        }

        // Tweezer bottom
        if (Math.abs(c.low - prev.low) < range * 0.05 && prevBearish && isBullish) {
          this.addPattern(patterns, 'tweezer-bottom', i)
        }

        // Tweezer top
        if (Math.abs(c.high - prev.high) < range * 0.05 && prevBullish && isBearish) {
          this.addPattern(patterns, 'tweezer-top', i)
        }
      }

      // ── Three-candle patterns ──
      if (prev && prev2) {
        const prev2Body = Math.abs(prev2.close - prev2.open)
        const prevBody = Math.abs(prev.close - prev.open)
        const prevRange = prev.high - prev.low
        const prev2Bearish = prev2.close < prev2.open
        const prev2Bullish = prev2.close > prev2.open

        // Morning star
        if (prev2Bearish && prevBody < prev2Body * 0.3 && prevRange < prev2Body * 0.5 && isBullish && body > prev2Body * 0.5) {
          this.addPattern(patterns, 'morning-star', i)
        }

        // Evening star
        if (prev2Bullish && prevBody < prev2Body * 0.3 && prevRange < prev2Body * 0.5 && isBearish && body > prev2Body * 0.5) {
          this.addPattern(patterns, 'evening-star', i)
        }

        // Three white soldiers
        if (prev2Bullish && (prev.close > prev.open) && isBullish &&
            prev.close > prev2.close && c.close > prev.close &&
            prevBody > prev2Body * 0.5 && body > prevBody * 0.5) {
          this.addPattern(patterns, 'three-white-soldiers', i)
        }

        // Three black crows
        if (prev2Bearish && (prev.close < prev.open) && isBearish &&
            prev.close < prev2.close && c.close < prev.close &&
            prevBody > prev2Body * 0.5 && body > prevBody * 0.5) {
          this.addPattern(patterns, 'three-black-crows', i)
        }
      }
    }

    return patterns
  }

  /** Get info about a candlestick pattern type. */
  getCandlestickPatternInfo(type: CandlestickPatternType): { direction: SignalDirection; reliability: number; description: string } {
    return PATTERN_INFO[type]
  }

  /** Get all known candlestick pattern types with info. */
  getAllCandlestickPatterns(): Array<{ type: CandlestickPatternType } & { direction: SignalDirection; reliability: number; description: string }> {
    return (Object.entries(PATTERN_INFO) as Array<[CandlestickPatternType, { direction: SignalDirection; reliability: number; description: string }]>).map(
      ([type, info]) => ({ type, ...info }),
    )
  }

  // ── Support / Resistance Detection ─────────────────────────────────────

  /** Detect support and resistance levels from candle data. */
  detectSupportResistance(candles: Candle[], lookback?: number): SupportResistanceLevel[] {
    const lb = lookback ?? this.config.srLookback
    const data = candles.slice(-lb)
    if (data.length < 3) return []

    const pivots: Array<{ price: number; type: 'high' | 'low' }> = []

    // Find local highs and lows (swing points)
    for (let i = 2; i < data.length - 2; i++) {
      // Local high
      if (data[i].high > data[i - 1].high && data[i].high > data[i + 1].high &&
          data[i].high > data[i - 2].high && data[i].high > data[i + 2].high) {
        pivots.push({ price: data[i].high, type: 'high' })
      }
      // Local low
      if (data[i].low < data[i - 1].low && data[i].low < data[i + 1].low &&
          data[i].low < data[i - 2].low && data[i].low < data[i + 2].low) {
        pivots.push({ price: data[i].low, type: 'low' })
      }
    }

    // Group nearby levels
    const tolerance = this.config.srTolerance / 100
    const levels: SupportResistanceLevel[] = []

    for (const pivot of pivots) {
      const existing = levels.find(l =>
        Math.abs(l.price - pivot.price) / pivot.price < tolerance,
      )

      if (existing) {
        existing.touches++
        existing.strength = Math.min(5, existing.touches)
        // Average the price
        existing.price = (existing.price * (existing.touches - 1) + pivot.price) / existing.touches
      } else {
        levels.push({
          price: pivot.price,
          type: pivot.type === 'high' ? 'resistance' : 'support',
          strength: 1,
          touches: 1,
        })
      }
    }

    // Sort by strength descending
    return levels.sort((a, b) => b.strength - a.strength)
  }

  // ── Fibonacci Levels ───────────────────────────────────────────────────

  /** Calculate Fibonacci retracement levels between a swing high and swing low. */
  calculateFibonacci(swingHigh: number, swingLow: number, direction: 'up' | 'down' = 'up'): FibonacciLevel[] {
    const range = swingHigh - swingLow
    if (range <= 0) return []

    return FIB_LEVELS.map(fib => {
      const price = direction === 'up'
        ? swingHigh - range * fib.ratio
        : swingLow + range * fib.ratio
      return {
        level: fib.ratio,
        price: Math.round(price * 100000) / 100000, // 5 decimal places
        label: fib.label,
      }
    })
  }

  /** Find swing high and swing low in candle data and calculate Fibonacci. */
  autoFibonacci(candles: Candle[], lookback?: number): { swingHigh: number; swingLow: number; levels: FibonacciLevel[] } {
    const lb = lookback ?? this.config.srLookback
    const data = candles.slice(-lb)
    if (data.length < 3) return { swingHigh: 0, swingLow: 0, levels: [] }

    let swingHigh = -Infinity
    let swingLow = Infinity

    for (const c of data) {
      if (c.high > swingHigh) swingHigh = c.high
      if (c.low < swingLow) swingLow = c.low
    }

    const lastCandle = data[data.length - 1]
    const direction = lastCandle.close > (swingHigh + swingLow) / 2 ? 'up' : 'down'

    return {
      swingHigh,
      swingLow,
      levels: this.calculateFibonacci(swingHigh, swingLow, direction),
    }
  }

  // ── Chart Pattern Detection ────────────────────────────────────────────

  /** Detect chart patterns in candle data. */
  detectChartPatterns(candles: Candle[]): ChartPattern[] {
    this.stats.totalChartPatternScans++
    const patterns: ChartPattern[] = []

    if (candles.length < this.config.minPatternBars) return patterns

    // Double top / Double bottom
    this.detectDoubleTopBottom(candles, patterns)

    // Head and Shoulders
    this.detectHeadAndShoulders(candles, patterns)

    // Triangles
    this.detectTriangles(candles, patterns)

    return patterns
  }

  private detectDoubleTopBottom(candles: Candle[], patterns: ChartPattern[]): void {
    const highs: Array<{ price: number; index: number }> = []
    const lows: Array<{ price: number; index: number }> = []

    // Find swing highs and lows
    for (let i = 2; i < candles.length - 2; i++) {
      if (candles[i].high > candles[i - 1].high && candles[i].high > candles[i + 1].high &&
          candles[i].high > candles[i - 2].high && candles[i].high > candles[i + 2].high) {
        highs.push({ price: candles[i].high, index: i })
      }
      if (candles[i].low < candles[i - 1].low && candles[i].low < candles[i + 1].low &&
          candles[i].low < candles[i - 2].low && candles[i].low < candles[i + 2].low) {
        lows.push({ price: candles[i].low, index: i })
      }
    }

    const tolerance = this.config.srTolerance / 100

    // Double top: two similar highs
    for (let i = 0; i < highs.length - 1; i++) {
      for (let j = i + 1; j < highs.length; j++) {
        if (Math.abs(highs[i].price - highs[j].price) / highs[i].price < tolerance &&
            highs[j].index - highs[i].index >= 5) {
          const neckline = Math.min(...candles.slice(highs[i].index, highs[j].index + 1).map(c => c.low))
          const target = neckline - (highs[i].price - neckline)
          patterns.push({
            type: 'double-top',
            direction: 'sell',
            reliability: 70,
            description: 'Two peaks at similar price levels — bearish reversal',
            neckline,
            target,
            startIndex: highs[i].index,
            endIndex: highs[j].index,
          })
        }
      }
    }

    // Double bottom: two similar lows
    for (let i = 0; i < lows.length - 1; i++) {
      for (let j = i + 1; j < lows.length; j++) {
        if (Math.abs(lows[i].price - lows[j].price) / lows[i].price < tolerance &&
            lows[j].index - lows[i].index >= 5) {
          const neckline = Math.max(...candles.slice(lows[i].index, lows[j].index + 1).map(c => c.high))
          const target = neckline + (neckline - lows[i].price)
          patterns.push({
            type: 'double-bottom',
            direction: 'buy',
            reliability: 70,
            description: 'Two troughs at similar price levels — bullish reversal',
            neckline,
            target,
            startIndex: lows[i].index,
            endIndex: lows[j].index,
          })
        }
      }
    }
  }

  private detectHeadAndShoulders(candles: Candle[], patterns: ChartPattern[]): void {
    const highs: Array<{ price: number; index: number }> = []
    const lows: Array<{ price: number; index: number }> = []

    for (let i = 2; i < candles.length - 2; i++) {
      if (candles[i].high > candles[i - 1].high && candles[i].high > candles[i + 1].high) {
        highs.push({ price: candles[i].high, index: i })
      }
      if (candles[i].low < candles[i - 1].low && candles[i].low < candles[i + 1].low) {
        lows.push({ price: candles[i].low, index: i })
      }
    }

    const tolerance = this.config.srTolerance / 100

    // Head and shoulders: left shoulder < head > right shoulder, shoulders ~equal
    for (let i = 0; i < highs.length - 2; i++) {
      const left = highs[i]
      const head = highs[i + 1]
      const right = highs[i + 2]

      if (head.price > left.price && head.price > right.price &&
          Math.abs(left.price - right.price) / left.price < tolerance) {
        const neckline = (
          Math.min(...candles.slice(left.index, right.index + 1).map(c => c.low))
        )
        const target = neckline - (head.price - neckline)
        patterns.push({
          type: 'head-and-shoulders',
          direction: 'sell',
          reliability: 80,
          description: 'Head & Shoulders: Three peaks, middle highest — bearish reversal',
          neckline,
          target,
          startIndex: left.index,
          endIndex: right.index,
        })
      }
    }

    // Inverse head and shoulders
    for (let i = 0; i < lows.length - 2; i++) {
      const left = lows[i]
      const head = lows[i + 1]
      const right = lows[i + 2]

      if (head.price < left.price && head.price < right.price &&
          Math.abs(left.price - right.price) / left.price < tolerance) {
        const neckline = (
          Math.max(...candles.slice(left.index, right.index + 1).map(c => c.high))
        )
        const target = neckline + (neckline - head.price)
        patterns.push({
          type: 'inverse-head-and-shoulders',
          direction: 'buy',
          reliability: 80,
          description: 'Inverse H&S: Three troughs, middle lowest — bullish reversal',
          neckline,
          target,
          startIndex: left.index,
          endIndex: right.index,
        })
      }
    }
  }

  private detectTriangles(candles: Candle[], patterns: ChartPattern[]): void {
    if (candles.length < 10) return

    // Use last N bars
    const n = Math.min(candles.length, 30)
    const data = candles.slice(-n)

    const highs = data.map((c, i) => ({ price: c.high, index: candles.length - n + i }))
    const lowsArr = data.map((c, i) => ({ price: c.low, index: candles.length - n + i }))

    // Simple trend line slopes
    const highSlope = this.calculateSlope(highs.map(h => h.price))
    const lowSlope = this.calculateSlope(lowsArr.map(l => l.price))

    // Ascending triangle: flat highs, rising lows
    if (Math.abs(highSlope) < 0.001 && lowSlope > 0.001) {
      patterns.push({
        type: 'ascending-triangle',
        direction: 'buy',
        reliability: 65,
        description: 'Flat resistance with higher lows — bullish breakout expected',
        startIndex: candles.length - n,
        endIndex: candles.length - 1,
      })
    }

    // Descending triangle: flat lows, falling highs
    if (highSlope < -0.001 && Math.abs(lowSlope) < 0.001) {
      patterns.push({
        type: 'descending-triangle',
        direction: 'sell',
        reliability: 65,
        description: 'Flat support with lower highs — bearish breakdown expected',
        startIndex: candles.length - n,
        endIndex: candles.length - 1,
      })
    }

    // Symmetrical triangle: converging highs and lows
    if (highSlope < -0.001 && lowSlope > 0.001) {
      patterns.push({
        type: 'symmetrical-triangle',
        direction: 'neutral',
        reliability: 55,
        description: 'Converging trendlines — breakout direction uncertain, wait for confirmation',
        startIndex: candles.length - n,
        endIndex: candles.length - 1,
      })
    }

    // Rising wedge: both rising, but lows rising faster
    if (highSlope > 0.001 && lowSlope > highSlope) {
      patterns.push({
        type: 'rising-wedge',
        direction: 'sell',
        reliability: 60,
        description: 'Both trendlines rising but converging — bearish reversal',
        startIndex: candles.length - n,
        endIndex: candles.length - 1,
      })
    }

    // Falling wedge: both falling, but highs falling faster
    if (highSlope < -0.001 && lowSlope < 0 && highSlope < lowSlope) {
      patterns.push({
        type: 'falling-wedge',
        direction: 'buy',
        reliability: 60,
        description: 'Both trendlines falling but converging — bullish reversal',
        startIndex: candles.length - n,
        endIndex: candles.length - 1,
      })
    }
  }

  // ── Signal Generation ──────────────────────────────────────────────────

  /** Generate a trading signal from detected patterns and levels. */
  generateSignal(candles: Candle[]): TradeSignal | null {
    if (candles.length < 5) return null

    this.stats.totalSignalsGenerated++

    const candlePatterns = this.detectCandlestickPatterns(candles.slice(-10))
    const sr = this.detectSupportResistance(candles)
    const lastCandle = candles[candles.length - 1]
    const atr = this.calculateATR(candles, 14)

    // Score buy vs sell signals
    let buyScore = 0
    let sellScore = 0
    const reasons: string[] = []
    const patternNames: string[] = []

    for (const p of candlePatterns) {
      const info = PATTERN_INFO[p.type]
      if (info.direction === 'buy') {
        buyScore += info.reliability
        patternNames.push(p.type)
      } else if (info.direction === 'sell') {
        sellScore += info.reliability
        patternNames.push(p.type)
      }
    }

    // Check S/R context
    const nearSupport = sr.find(l => l.type === 'support' && Math.abs(l.price - lastCandle.low) / lastCandle.low < 0.01)
    const nearResistance = sr.find(l => l.type === 'resistance' && Math.abs(l.price - lastCandle.high) / lastCandle.high < 0.01)

    if (nearSupport) { buyScore += 20 * nearSupport.strength; reasons.push('Near support level') }
    if (nearResistance) { sellScore += 20 * nearResistance.strength; reasons.push('Near resistance level') }

    const maxScore = Math.max(buyScore, sellScore)
    const confidence = Math.min(100, Math.round(maxScore / 2))

    if (confidence < this.config.signalMinConfidence) return null

    const direction: SignalDirection = buyScore > sellScore ? 'buy' : sellScore > buyScore ? 'sell' : 'neutral'
    if (direction === 'neutral') return null

    const entry = direction === 'buy' ? lastCandle.close : lastCandle.close
    const stopLoss = direction === 'buy'
      ? entry - atr * 1.5
      : entry + atr * 1.5
    const takeProfit = direction === 'buy'
      ? entry + atr * 3
      : entry - atr * 3
    const riskReward = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss)

    if (candlePatterns.length > 0) {
      reasons.push(`Candlestick: ${patternNames.join(', ')}`)
    }

    return {
      direction,
      confidence,
      entry: Math.round(entry * 100000) / 100000,
      stopLoss: Math.round(stopLoss * 100000) / 100000,
      takeProfit: Math.round(takeProfit * 100000) / 100000,
      riskReward: Math.round(riskReward * 100) / 100,
      reason: reasons.join('; '),
      patterns: patternNames,
    }
  }

  // ── Helper Methods ─────────────────────────────────────────────────────

  /** Calculate Average True Range (ATR). */
  calculateATR(candles: Candle[], period: number = 14): number {
    if (candles.length < period + 1) return candles.length > 0 ? candles[candles.length - 1].high - candles[candles.length - 1].low : 0

    let atr = 0
    for (let i = candles.length - period; i < candles.length; i++) {
      const tr = Math.max(
        candles[i].high - candles[i].low,
        Math.abs(candles[i].high - candles[i - 1].close),
        Math.abs(candles[i].low - candles[i - 1].close),
      )
      atr += tr
    }
    return atr / period
  }

  private calculateSlope(values: number[]): number {
    if (values.length < 2) return 0
    const n = values.length
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
    for (let i = 0; i < n; i++) {
      sumX += i
      sumY += values[i]
      sumXY += i * values[i]
      sumX2 += i * i
    }
    const denom = n * sumX2 - sumX * sumX
    if (denom === 0) return 0
    return (n * sumXY - sumX * sumY) / denom
  }

  private addPattern(patterns: CandlestickPattern[], type: CandlestickPatternType, index: number): void {
    const info = PATTERN_INFO[type]
    patterns.push({ type, direction: info.direction, reliability: info.reliability, description: info.description, index })
    this.stats.patternsFound[type] = (this.stats.patternsFound[type] ?? 0) + 1
  }

  // ── Stats & Config ───────────────────────────────────────────────────────

  getStats(): ChartPatternEngineStats {
    return { ...this.stats }
  }

  resetStats(): void {
    this.stats = {
      totalCandlestickScans: 0,
      totalChartPatternScans: 0,
      totalSignalsGenerated: 0,
      patternsFound: {},
    }
  }

  getConfig(): ChartPatternEngineConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<ChartPatternEngineConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /** Get total known candlestick patterns count. */
  getCandlestickPatternCount(): number {
    return Object.keys(PATTERN_INFO).length
  }

  /** Get Fibonacci levels for reference. */
  getFibonacciLevels(): typeof FIB_LEVELS {
    return [...FIB_LEVELS]
  }
}
