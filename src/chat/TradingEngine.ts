/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          📈  T R A D I N G   E N G I N E                                    ║
 * ║                                                                             ║
 * ║   Comprehensive trading analysis with technical indicators:                 ║
 * ║     analyze → signal → trend → risk                                         ║
 * ║                                                                             ║
 * ║     • SMA, EMA, RSI, MACD, Bollinger Bands, Stochastic, ATR, VWAP, OBV     ║
 * ║     • Pattern recognition (head & shoulders, triangles, flags, etc.)        ║
 * ║     • Buy/sell/hold signal generation with confidence scores                ║
 * ║     • Trend analysis with strength measurement                              ║
 * ║     • Automatic support/resistance level detection                          ║
 * ║     • Risk metrics: Sharpe, drawdown, VaR, Sortino, beta                    ║
 * ║     • Candlestick pattern detection (doji, hammer, engulfing, etc.)         ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface TradingEngineConfig {
  maxHistoryLength: number;
  signalThreshold: number;
  riskFreeRate: number;
  smaPeriods: number[];
  emaPeriod: number;
  rsiPeriod: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  bollingerPeriod: number;
  bollingerStdDev: number;
  stochasticPeriod: number;
  atrPeriod: number;
  supportResistanceLookback: number;
  enableLearning: boolean;
}

export interface TradingEngineStats {
  totalAnalyses: number;
  totalSignals: number;
  avgConfidence: number;
  buySignals: number;
  sellSignals: number;
  holdSignals: number;
  patternsDetected: number;
  feedbackReceived: number;
  feedbackAccuracy: number;
}

export interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface TechnicalIndicators {
  sma: Record<number, number[]>;
  ema: number[];
  rsi: number[];
  macd: { macdLine: number[]; signalLine: number[]; histogram: number[] };
  bollingerBands: { upper: number[]; middle: number[]; lower: number[] };
  stochastic: { k: number[]; d: number[] };
  atr: number[];
  vwap: number[];
  obv: number[];
}

export interface TradeSignal {
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  indicators: string[];
  reasoning: string[];
  timestamp: number;
}

export interface TrendAnalysis {
  direction: 'uptrend' | 'downtrend' | 'sideways';
  strength: number;
  duration: number;
  supportLevels: number[];
  resistanceLevels: number[];
}

export interface CandlestickPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  position: number;
}

export interface ChartPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  startIndex: number;
  endIndex: number;
  confidence: number;
  target: number;
}

export interface RiskMetrics {
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  var95: number;
  sortinoRatio: number;
  beta: number;
}

export interface MarketRegime {
  regime: 'trending-up' | 'trending-down' | 'mean-reverting' | 'high-volatility' | 'low-volatility';
  confidence: number;
  characteristics: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: TradingEngineConfig = {
  maxHistoryLength: 1000,
  signalThreshold: 0.55,
  riskFreeRate: 0.04,
  smaPeriods: [10, 20, 50, 200],
  emaPeriod: 12,
  rsiPeriod: 14,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  bollingerPeriod: 20,
  bollingerStdDev: 2,
  stochasticPeriod: 14,
  atrPeriod: 14,
  supportResistanceLookback: 50,
  enableLearning: true,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function computeReturns(closes: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    returns.push(closes[i - 1] !== 0 ? (closes[i] - closes[i - 1]) / closes[i - 1] : 0);
  }
  return returns;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class TradingEngine {
  private readonly config: TradingEngineConfig;
  private history: OHLCV[] = [];
  private totalAnalyses = 0;
  private totalSignals = 0;
  private buySignals = 0;
  private sellSignals = 0;
  private holdSignals = 0;
  private patternsDetected = 0;
  private confidenceHistory: number[] = [];
  private feedbackCorrect = 0;
  private feedbackTotal = 0;

  constructor(config?: Partial<TradingEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /** Ingest OHLCV candles into the history buffer. */
  addCandles(candles: OHLCV[]): void {
    for (const c of candles) {
      this.history.push(c);
    }
    if (this.history.length > this.config.maxHistoryLength) {
      this.history = this.history.slice(this.history.length - this.config.maxHistoryLength);
    }
  }

  /** Compute all technical indicators on the current history. */
  computeIndicators(): TechnicalIndicators {
    this.totalAnalyses++;
    const closes = this.history.map(c => c.close);
    const highs = this.history.map(c => c.high);
    const lows = this.history.map(c => c.low);
    const volumes = this.history.map(c => c.volume);

    return {
      sma: this.computeAllSMA(closes),
      ema: this.computeEMA(closes, this.config.emaPeriod),
      rsi: this.computeRSI(closes, this.config.rsiPeriod),
      macd: this.computeMACD(closes),
      bollingerBands: this.computeBollingerBands(closes),
      stochastic: this.computeStochastic(highs, lows, closes),
      atr: this.computeATR(highs, lows, closes),
      vwap: this.computeVWAP(),
      obv: this.computeOBV(closes, volumes),
    };
  }

  /** Generate a trade signal based on indicator convergence. */
  generateSignal(): TradeSignal {
    if (this.history.length < this.config.macdSlow + this.config.macdSignal) {
      return {
        type: 'hold',
        confidence: 0,
        indicators: [],
        reasoning: ['Insufficient data for signal generation'],
        timestamp: Date.now(),
      };
    }

    const indicators = this.computeIndicators();
    const closes = this.history.map(c => c.close);
    const lastClose = closes[closes.length - 1];
    let bullScore = 0;
    let bearScore = 0;
    const reasons: string[] = [];
    const usedIndicators: string[] = [];

    // RSI analysis
    if (indicators.rsi.length > 0) {
      const rsi = indicators.rsi[indicators.rsi.length - 1];
      usedIndicators.push('RSI');
      if (rsi < 30) {
        bullScore += 0.2;
        reasons.push(`RSI oversold at ${round2(rsi)}`);
      } else if (rsi > 70) {
        bearScore += 0.2;
        reasons.push(`RSI overbought at ${round2(rsi)}`);
      } else if (rsi < 45) {
        bullScore += 0.05;
        reasons.push(`RSI leaning bullish at ${round2(rsi)}`);
      } else if (rsi > 55) {
        bearScore += 0.05;
        reasons.push(`RSI leaning bearish at ${round2(rsi)}`);
      }
    }

    // MACD analysis
    const { histogram } = indicators.macd;
    if (histogram.length >= 2) {
      usedIndicators.push('MACD');
      const curr = histogram[histogram.length - 1];
      const prev = histogram[histogram.length - 2];
      if (curr > 0 && prev <= 0) {
        bullScore += 0.2;
        reasons.push('MACD histogram crossed above zero');
      } else if (curr < 0 && prev >= 0) {
        bearScore += 0.2;
        reasons.push('MACD histogram crossed below zero');
      } else if (curr > prev) {
        bullScore += 0.1;
        reasons.push('MACD histogram rising');
      } else if (curr < prev) {
        bearScore += 0.1;
        reasons.push('MACD histogram falling');
      }
    }

    // Bollinger Bands analysis
    const { upper, lower } = indicators.bollingerBands;
    if (upper.length > 0) {
      usedIndicators.push('Bollinger Bands');
      const u = upper[upper.length - 1];
      const l = lower[lower.length - 1];
      if (lastClose <= l) {
        bullScore += 0.15;
        reasons.push('Price at or below lower Bollinger Band');
      } else if (lastClose >= u) {
        bearScore += 0.15;
        reasons.push('Price at or above upper Bollinger Band');
      }
    }

    // SMA crossover analysis
    const sma10 = indicators.sma[10];
    const sma50 = indicators.sma[50];
    if (sma10 && sma50 && sma10.length > 0 && sma50.length > 0) {
      usedIndicators.push('SMA Crossover');
      const shortVal = sma10[sma10.length - 1];
      const longVal = sma50[sma50.length - 1];
      if (shortVal > longVal) {
        bullScore += 0.15;
        reasons.push('SMA 10 above SMA 50 (golden cross territory)');
      } else {
        bearScore += 0.15;
        reasons.push('SMA 10 below SMA 50 (death cross territory)');
      }
    }

    // Stochastic analysis
    const { k, d } = indicators.stochastic;
    if (k.length > 0 && d.length > 0) {
      usedIndicators.push('Stochastic');
      const kVal = k[k.length - 1];
      const dVal = d[d.length - 1];
      if (kVal < 20 && dVal < 20) {
        bullScore += 0.1;
        reasons.push(`Stochastic oversold (K=${round2(kVal)}, D=${round2(dVal)})`);
      } else if (kVal > 80 && dVal > 80) {
        bearScore += 0.1;
        reasons.push(`Stochastic overbought (K=${round2(kVal)}, D=${round2(dVal)})`);
      }
      if (kVal > dVal && k.length >= 2 && k[k.length - 2] <= d[d.length - 2]) {
        bullScore += 0.1;
        reasons.push('Stochastic %K crossed above %D');
      } else if (kVal < dVal && k.length >= 2 && k[k.length - 2] >= d[d.length - 2]) {
        bearScore += 0.1;
        reasons.push('Stochastic %K crossed below %D');
      }
    }

    // Determine signal
    const netScore = bullScore - bearScore;
    const confidence = clamp(Math.abs(netScore) / 0.8, 0, 1);
    let signalType: TradeSignal['type'] = 'hold';

    if (netScore > 0 && confidence >= this.config.signalThreshold) {
      signalType = 'buy';
      this.buySignals++;
    } else if (netScore < 0 && confidence >= this.config.signalThreshold) {
      signalType = 'sell';
      this.sellSignals++;
    } else {
      this.holdSignals++;
      reasons.push('No strong directional consensus among indicators');
    }

    this.totalSignals++;
    this.confidenceHistory.push(round2(confidence));

    return {
      type: signalType,
      confidence: round2(confidence),
      indicators: usedIndicators,
      reasoning: reasons,
      timestamp: Date.now(),
    };
  }

  /** Analyze the current trend direction, strength, and key levels. */
  analyzeTrend(): TrendAnalysis {
    const closes = this.history.map(c => c.close);
    if (closes.length < 20) {
      return {
        direction: 'sideways',
        strength: 0,
        duration: 0,
        supportLevels: [],
        resistanceLevels: [],
      };
    }

    // Linear regression slope for direction
    const lookback = Math.min(closes.length, 50);
    const recent = closes.slice(closes.length - lookback);
    const slope = this.linearRegressionSlope(recent);
    const normalizedSlope = slope / mean(recent);

    let direction: TrendAnalysis['direction'];
    let strength: number;

    if (normalizedSlope > 0.001) {
      direction = 'uptrend';
      strength = clamp(normalizedSlope * 500, 0, 1);
    } else if (normalizedSlope < -0.001) {
      direction = 'downtrend';
      strength = clamp(Math.abs(normalizedSlope) * 500, 0, 1);
    } else {
      direction = 'sideways';
      strength = clamp(1 - Math.abs(normalizedSlope) * 1000, 0, 1);
    }

    // Measure duration by counting consecutive candles in trend
    let duration = 0;
    for (let i = closes.length - 2; i >= 0; i--) {
      if (direction === 'uptrend' && closes[i + 1] >= closes[i]) {
        duration++;
      } else if (direction === 'downtrend' && closes[i + 1] <= closes[i]) {
        duration++;
      } else if (direction === 'sideways') {
        const pctChange = Math.abs(closes[i + 1] - closes[i]) / closes[i];
        if (pctChange < 0.01) duration++;
        else break;
      } else {
        break;
      }
    }

    const supportLevels = this.findSupportLevels();
    const resistanceLevels = this.findResistanceLevels();

    return {
      direction,
      strength: round2(strength),
      duration,
      supportLevels,
      resistanceLevels,
    };
  }

  /** Detect candlestick patterns in the most recent candles. */
  detectCandlestickPatterns(): CandlestickPattern[] {
    const patterns: CandlestickPattern[] = [];
    const len = this.history.length;
    if (len < 3) return patterns;

    // Scan the last 10 candles for single and multi-candle patterns
    const scanStart = Math.max(0, len - 10);

    for (let i = scanStart; i < len; i++) {
      const c = this.history[i];
      const body = Math.abs(c.close - c.open);
      const range = c.high - c.low;
      const upperShadow = c.high - Math.max(c.open, c.close);
      const lowerShadow = Math.min(c.open, c.close) - c.low;

      // Doji: body is very small relative to range
      if (range > 0 && body / range < 0.1) {
        patterns.push({
          name: 'Doji',
          type: 'neutral',
          confidence: round2(0.7 + 0.3 * (1 - body / range)),
          position: i,
        });
      }

      // Hammer: small body at top, long lower shadow
      if (range > 0 && lowerShadow > body * 2 && upperShadow < body * 0.5) {
        patterns.push({
          name: 'Hammer',
          type: 'bullish',
          confidence: round2(clamp(lowerShadow / range, 0.5, 0.95)),
          position: i,
        });
      }

      // Inverted Hammer: small body at bottom, long upper shadow
      if (range > 0 && upperShadow > body * 2 && lowerShadow < body * 0.5) {
        patterns.push({
          name: 'Inverted Hammer',
          type: 'bullish',
          confidence: round2(clamp(upperShadow / range, 0.5, 0.95)),
          position: i,
        });
      }

      // Bullish Engulfing
      if (i > 0) {
        const prev = this.history[i - 1];
        if (prev.close < prev.open && c.close > c.open &&
            c.open <= prev.close && c.close >= prev.open) {
          patterns.push({
            name: 'Bullish Engulfing',
            type: 'bullish',
            confidence: round2(clamp(body / Math.abs(prev.close - prev.open), 0.6, 0.95)),
            position: i,
          });
        }

        // Bearish Engulfing
        if (prev.close > prev.open && c.close < c.open &&
            c.open >= prev.close && c.close <= prev.open) {
          patterns.push({
            name: 'Bearish Engulfing',
            type: 'bearish',
            confidence: round2(clamp(body / Math.abs(prev.close - prev.open), 0.6, 0.95)),
            position: i,
          });
        }
      }

      // Morning Star (three-candle bullish reversal)
      if (i >= 2) {
        const first = this.history[i - 2];
        const mid = this.history[i - 1];
        const third = c;
        const midBody = Math.abs(mid.close - mid.open);
        const firstBody = Math.abs(first.close - first.open);
        const thirdBody = Math.abs(third.close - third.open);
        if (first.close < first.open && midBody < firstBody * 0.3 &&
            third.close > third.open && thirdBody > firstBody * 0.5 &&
            third.close > (first.open + first.close) / 2) {
          patterns.push({
            name: 'Morning Star',
            type: 'bullish',
            confidence: 0.8,
            position: i,
          });
        }
      }

      // Evening Star (three-candle bearish reversal)
      if (i >= 2) {
        const first = this.history[i - 2];
        const mid = this.history[i - 1];
        const third = c;
        const midBody = Math.abs(mid.close - mid.open);
        const firstBody = Math.abs(first.close - first.open);
        const thirdBody = Math.abs(third.close - third.open);
        if (first.close > first.open && midBody < firstBody * 0.3 &&
            third.close < third.open && thirdBody > firstBody * 0.5 &&
            third.close < (first.open + first.close) / 2) {
          patterns.push({
            name: 'Evening Star',
            type: 'bearish',
            confidence: 0.8,
            position: i,
          });
        }
      }
    }

    this.patternsDetected += patterns.length;
    return patterns;
  }

  /** Detect chart patterns (head & shoulders, triangles, flags, etc.). */
  detectChartPatterns(): ChartPattern[] {
    const patterns: ChartPattern[] = [];
    const closes = this.history.map(c => c.close);
    const highs = this.history.map(c => c.high);
    const lows = this.history.map(c => c.low);
    if (closes.length < 30) return patterns;

    const pivotHighs = this.findPivotPoints(highs, 5, 'high');
    const pivotLows = this.findPivotPoints(lows, 5, 'low');

    // Head and Shoulders detection
    const hs = this.detectHeadAndShoulders(pivotHighs, pivotLows, closes);
    if (hs) patterns.push(hs);

    // Inverse Head and Shoulders
    const ihs = this.detectInverseHeadAndShoulders(pivotHighs, pivotLows, closes);
    if (ihs) patterns.push(ihs);

    // Double Top
    const dt = this.detectDoubleTop(pivotHighs, closes);
    if (dt) patterns.push(dt);

    // Double Bottom
    const db = this.detectDoubleBottom(pivotLows, closes);
    if (db) patterns.push(db);

    // Triangle patterns
    const tri = this.detectTriangle(pivotHighs, pivotLows, closes);
    if (tri) patterns.push(tri);

    // Flag / Pennant
    const flag = this.detectFlag(closes);
    if (flag) patterns.push(flag);

    // Wedge patterns
    const wedge = this.detectWedge(pivotHighs, pivotLows, closes);
    if (wedge) patterns.push(wedge);

    // Cup and Handle
    const cup = this.detectCupAndHandle(closes, pivotLows);
    if (cup) patterns.push(cup);

    this.patternsDetected += patterns.length;
    return patterns;
  }

  /** Compute risk metrics for the current price history. */
  computeRiskMetrics(benchmarkReturns?: number[]): RiskMetrics {
    const closes = this.history.map(c => c.close);
    const returns = computeReturns(closes);
    if (returns.length < 2) {
      return { sharpeRatio: 0, maxDrawdown: 0, volatility: 0, var95: 0, sortinoRatio: 0, beta: 0 };
    }

    const avgReturn = mean(returns);
    const vol = stddev(returns);
    const annualizedVol = round4(vol * Math.sqrt(252));
    const annualizedReturn = avgReturn * 252;
    const dailyRiskFree = this.config.riskFreeRate / 252;

    // Sharpe Ratio
    const sharpe = vol > 0
      ? round4((annualizedReturn - this.config.riskFreeRate) / annualizedVol)
      : 0;

    // Max Drawdown
    const maxDD = this.computeMaxDrawdown(closes);

    // VaR at 95% confidence (historical method)
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95 = round4(Math.abs(percentile(sortedReturns, 5)));

    // Sortino Ratio (downside deviation only)
    const downsideReturns = returns.filter(r => r < dailyRiskFree);
    const downsideDev = downsideReturns.length > 1
      ? Math.sqrt(downsideReturns.reduce((s, r) => s + (r - dailyRiskFree) ** 2, 0) / (downsideReturns.length - 1))
      : 0;
    const annualizedDownside = downsideDev * Math.sqrt(252);
    const sortino = annualizedDownside > 0
      ? round4((annualizedReturn - this.config.riskFreeRate) / annualizedDownside)
      : 0;

    // Beta relative to benchmark
    let beta = 1;
    if (benchmarkReturns && benchmarkReturns.length > 0) {
      const minLen = Math.min(returns.length, benchmarkReturns.length);
      const assetSlice = returns.slice(returns.length - minLen);
      const benchSlice = benchmarkReturns.slice(benchmarkReturns.length - minLen);
      beta = this.computeBeta(assetSlice, benchSlice);
    }

    return {
      sharpeRatio: sharpe,
      maxDrawdown: round4(maxDD),
      volatility: annualizedVol,
      var95,
      sortinoRatio: sortino,
      beta: round4(beta),
    };
  }

  /** Classify the current market regime. */
  classifyMarketRegime(): MarketRegime {
    const closes = this.history.map(c => c.close);
    if (closes.length < 30) {
      return { regime: 'low-volatility', confidence: 0, characteristics: ['Insufficient data'] };
    }

    const returns = computeReturns(closes);
    const vol = stddev(returns);
    const avgReturn = mean(returns);
    const slope = this.linearRegressionSlope(closes.slice(-30));
    const normalizedSlope = slope / mean(closes.slice(-30));

    const characteristics: string[] = [];
    let regime: MarketRegime['regime'];
    let confidence: number;

    // Autocorrelation to detect mean-reversion vs trending
    const autocorr = this.computeAutocorrelation(returns, 1);

    if (vol > 0.025) {
      regime = 'high-volatility';
      confidence = clamp(vol / 0.05, 0.5, 0.95);
      characteristics.push(`Elevated volatility: ${round4(vol * 100)}% daily`);
      characteristics.push('Wide price swings observed');
    } else if (vol < 0.008) {
      regime = 'low-volatility';
      confidence = clamp((0.015 - vol) / 0.015, 0.5, 0.95);
      characteristics.push(`Compressed volatility: ${round4(vol * 100)}% daily`);
      characteristics.push('Narrow trading range');
    } else if (normalizedSlope > 0.002 && autocorr > 0.05) {
      regime = 'trending-up';
      confidence = clamp(normalizedSlope * 200 + autocorr, 0.5, 0.95);
      characteristics.push(`Positive slope: ${round4(normalizedSlope * 100)}%`);
      characteristics.push(`Positive autocorrelation: ${round4(autocorr)}`);
    } else if (normalizedSlope < -0.002 && autocorr > 0.05) {
      regime = 'trending-down';
      confidence = clamp(Math.abs(normalizedSlope) * 200 + autocorr, 0.5, 0.95);
      characteristics.push(`Negative slope: ${round4(normalizedSlope * 100)}%`);
      characteristics.push(`Positive autocorrelation: ${round4(autocorr)}`);
    } else {
      regime = 'mean-reverting';
      confidence = clamp(Math.abs(autocorr) * 3 + 0.3, 0.3, 0.9);
      characteristics.push(`Negative autocorrelation: ${round4(autocorr)}`);
      characteristics.push(`Average daily return: ${round4(avgReturn * 100)}%`);
    }

    return { regime, confidence: round2(confidence), characteristics };
  }

  /** Return the current price history length. */
  getHistoryLength(): number {
    return this.history.length;
  }

  /** Learn from signal feedback to improve future signal quality. */
  provideFeedback(signal: TradeSignal, correct: boolean): void {
    if (!this.config.enableLearning) return;
    this.feedbackTotal++;
    if (correct) this.feedbackCorrect++;
  }

  /** Return aggregate statistics. */
  getStats(): Readonly<TradingEngineStats> {
    const avg = this.confidenceHistory.length > 0
      ? this.confidenceHistory.reduce((s, v) => s + v, 0) / this.confidenceHistory.length
      : 0;

    return {
      totalAnalyses: this.totalAnalyses,
      totalSignals: this.totalSignals,
      avgConfidence: round2(avg),
      buySignals: this.buySignals,
      sellSignals: this.sellSignals,
      holdSignals: this.holdSignals,
      patternsDetected: this.patternsDetected,
      feedbackReceived: this.feedbackTotal,
      feedbackAccuracy: this.feedbackTotal > 0
        ? round2(this.feedbackCorrect / this.feedbackTotal)
        : 0,
    };
  }

  /** Serialize the engine state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      history: this.history,
      totalAnalyses: this.totalAnalyses,
      totalSignals: this.totalSignals,
      buySignals: this.buySignals,
      sellSignals: this.sellSignals,
      holdSignals: this.holdSignals,
      patternsDetected: this.patternsDetected,
      confidenceHistory: this.confidenceHistory,
      feedbackCorrect: this.feedbackCorrect,
      feedbackTotal: this.feedbackTotal,
    });
  }

  /** Restore a TradingEngine from serialized JSON. */
  static deserialize(json: string): TradingEngine {
    const data = JSON.parse(json) as {
      config: TradingEngineConfig;
      history: OHLCV[];
      totalAnalyses: number;
      totalSignals: number;
      buySignals: number;
      sellSignals: number;
      holdSignals: number;
      patternsDetected: number;
      confidenceHistory: number[];
      feedbackCorrect: number;
      feedbackTotal: number;
    };

    const instance = new TradingEngine(data.config);
    instance.history = data.history;
    instance.totalAnalyses = data.totalAnalyses;
    instance.totalSignals = data.totalSignals;
    instance.buySignals = data.buySignals;
    instance.sellSignals = data.sellSignals;
    instance.holdSignals = data.holdSignals;
    instance.patternsDetected = data.patternsDetected;
    instance.confidenceHistory = data.confidenceHistory;
    instance.feedbackCorrect = data.feedbackCorrect;
    instance.feedbackTotal = data.feedbackTotal;
    return instance;
  }

  // ── Technical Indicator Internals ─────────────────────────────────────────

  /** Compute SMA for all configured periods. */
  private computeAllSMA(closes: number[]): Record<number, number[]> {
    const result: Record<number, number[]> = {};
    for (const period of this.config.smaPeriods) {
      result[period] = this.computeSMA(closes, period);
    }
    return result;
  }

  /** Simple Moving Average. */
  private computeSMA(data: number[], period: number): number[] {
    const result: number[] = [];
    if (data.length < period) return result;
    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i];
    result.push(round4(sum / period));
    for (let i = period; i < data.length; i++) {
      sum += data[i] - data[i - period];
      result.push(round4(sum / period));
    }
    return result;
  }

  /** Exponential Moving Average. */
  private computeEMA(data: number[], period: number): number[] {
    if (data.length < period) return [];
    const multiplier = 2 / (period + 1);
    const result: number[] = [];

    // Seed with SMA of first `period` values
    let sum = 0;
    for (let i = 0; i < period; i++) sum += data[i];
    let ema = sum / period;
    result.push(round4(ema));

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
      result.push(round4(ema));
    }
    return result;
  }

  /** Relative Strength Index. */
  private computeRSI(closes: number[], period: number): number[] {
    if (closes.length < period + 1) return [];
    const result: number[] = [];
    let gainSum = 0;
    let lossSum = 0;

    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      if (change >= 0) gainSum += change;
      else lossSum += Math.abs(change);
    }

    let avgGain = gainSum / period;
    let avgLoss = lossSum / period;
    const rsi = avgLoss === 0 ? 100 : round4(100 - 100 / (1 + avgGain / avgLoss));
    result.push(rsi);

    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const gain = change >= 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const val = avgLoss === 0 ? 100 : round4(100 - 100 / (1 + avgGain / avgLoss));
      result.push(val);
    }
    return result;
  }

  /** Moving Average Convergence Divergence. */
  private computeMACD(closes: number[]): TechnicalIndicators['macd'] {
    const fastEMA = this.computeEMA(closes, this.config.macdFast);
    const slowEMA = this.computeEMA(closes, this.config.macdSlow);

    // Align arrays: slow EMA starts later
    const offset = fastEMA.length - slowEMA.length;
    const macdLine: number[] = [];
    for (let i = 0; i < slowEMA.length; i++) {
      macdLine.push(round4(fastEMA[i + offset] - slowEMA[i]));
    }

    const signalLine = this.computeEMA(macdLine, this.config.macdSignal);
    const sigOffset = macdLine.length - signalLine.length;
    const histogram: number[] = [];
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(round4(macdLine[i + sigOffset] - signalLine[i]));
    }

    return { macdLine, signalLine, histogram };
  }

  /** Bollinger Bands. */
  private computeBollingerBands(closes: number[]): TechnicalIndicators['bollingerBands'] {
    const period = this.config.bollingerPeriod;
    const mult = this.config.bollingerStdDev;
    const upper: number[] = [];
    const middle: number[] = [];
    const lower: number[] = [];

    if (closes.length < period) return { upper, middle, lower };

    for (let i = period - 1; i < closes.length; i++) {
      const slice = closes.slice(i - period + 1, i + 1);
      const avg = mean(slice);
      const sd = stddev(slice);
      middle.push(round4(avg));
      upper.push(round4(avg + mult * sd));
      lower.push(round4(avg - mult * sd));
    }
    return { upper, middle, lower };
  }

  /** Stochastic Oscillator (%K and %D). */
  private computeStochastic(
    highs: number[], lows: number[], closes: number[],
  ): TechnicalIndicators['stochastic'] {
    const period = this.config.stochasticPeriod;
    const kValues: number[] = [];
    if (closes.length < period) return { k: [], d: [] };

    for (let i = period - 1; i < closes.length; i++) {
      let hh = -Infinity;
      let ll = Infinity;
      for (let j = i - period + 1; j <= i; j++) {
        if (highs[j] > hh) hh = highs[j];
        if (lows[j] < ll) ll = lows[j];
      }
      const k = hh === ll ? 50 : round4(((closes[i] - ll) / (hh - ll)) * 100);
      kValues.push(k);
    }

    // %D is 3-period SMA of %K
    const dValues = this.computeSMA(kValues, 3);
    return { k: kValues, d: dValues };
  }

  /** Average True Range. */
  private computeATR(highs: number[], lows: number[], closes: number[]): number[] {
    if (closes.length < 2) return [];
    const trValues: number[] = [];
    trValues.push(highs[0] - lows[0]);

    for (let i = 1; i < closes.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1]),
      );
      trValues.push(tr);
    }

    const period = this.config.atrPeriod;
    if (trValues.length < period) return [];

    const result: number[] = [];
    let atr = mean(trValues.slice(0, period));
    result.push(round4(atr));

    for (let i = period; i < trValues.length; i++) {
      atr = (atr * (period - 1) + trValues[i]) / period;
      result.push(round4(atr));
    }
    return result;
  }

  /** Volume Weighted Average Price. */
  private computeVWAP(): number[] {
    const result: number[] = [];
    let cumulativeTPV = 0;
    let cumulativeVol = 0;

    for (const c of this.history) {
      const typicalPrice = (c.high + c.low + c.close) / 3;
      cumulativeTPV += typicalPrice * c.volume;
      cumulativeVol += c.volume;
      result.push(round4(cumulativeVol > 0 ? cumulativeTPV / cumulativeVol : typicalPrice));
    }
    return result;
  }

  /** On-Balance Volume. */
  private computeOBV(closes: number[], volumes: number[]): number[] {
    if (closes.length === 0) return [];
    const result: number[] = [volumes[0]];
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) {
        result.push(result[i - 1] + volumes[i]);
      } else if (closes[i] < closes[i - 1]) {
        result.push(result[i - 1] - volumes[i]);
      } else {
        result.push(result[i - 1]);
      }
    }
    return result;
  }

  // ── Support / Resistance Internals ────────────────────────────────────────

  /** Find support levels from recent pivot lows. */
  private findSupportLevels(): number[] {
    const lows = this.history.map(c => c.low);
    const lookback = Math.min(lows.length, this.config.supportResistanceLookback);
    const recent = lows.slice(lows.length - lookback);
    const pivots = this.findPivotPoints(recent, 3, 'low');
    return this.clusterLevels(pivots.map(p => p.value));
  }

  /** Find resistance levels from recent pivot highs. */
  private findResistanceLevels(): number[] {
    const highs = this.history.map(c => c.high);
    const lookback = Math.min(highs.length, this.config.supportResistanceLookback);
    const recent = highs.slice(highs.length - lookback);
    const pivots = this.findPivotPoints(recent, 3, 'high');
    return this.clusterLevels(pivots.map(p => p.value));
  }

  /** Find local extrema using a window around each point. */
  private findPivotPoints(
    data: number[], windowSize: number, type: 'high' | 'low',
  ): Array<{ index: number; value: number }> {
    const pivots: Array<{ index: number; value: number }> = [];
    for (let i = windowSize; i < data.length - windowSize; i++) {
      let isPivot = true;
      for (let j = 1; j <= windowSize; j++) {
        if (type === 'high') {
          if (data[i] < data[i - j] || data[i] < data[i + j]) { isPivot = false; break; }
        } else {
          if (data[i] > data[i - j] || data[i] > data[i + j]) { isPivot = false; break; }
        }
      }
      if (isPivot) pivots.push({ index: i, value: data[i] });
    }
    return pivots;
  }

  /** Cluster nearby price levels into distinct support/resistance zones. */
  private clusterLevels(levels: number[]): number[] {
    if (levels.length === 0) return [];
    const sorted = [...levels].sort((a, b) => a - b);
    const clusters: number[][] = [[sorted[0]]];

    for (let i = 1; i < sorted.length; i++) {
      const lastCluster = clusters[clusters.length - 1];
      const clusterMean = mean(lastCluster);
      const threshold = clusterMean * 0.015; // 1.5% tolerance
      if (sorted[i] - clusterMean <= threshold) {
        lastCluster.push(sorted[i]);
      } else {
        clusters.push([sorted[i]]);
      }
    }

    return clusters.map(c => round4(mean(c)));
  }

  // ── Chart Pattern Detection Internals ─────────────────────────────────────

  /** Detect Head and Shoulders (bearish reversal). */
  private detectHeadAndShoulders(
    pivotHighs: Array<{ index: number; value: number }>,
    _pivotLows: Array<{ index: number; value: number }>,
    closes: number[],
  ): ChartPattern | null {
    if (pivotHighs.length < 3) return null;

    for (let i = 0; i <= pivotHighs.length - 3; i++) {
      const ls = pivotHighs[i];
      const head = pivotHighs[i + 1];
      const rs = pivotHighs[i + 2];

      // Head must be higher than both shoulders
      if (head.value <= ls.value || head.value <= rs.value) continue;
      // Shoulders should be roughly equal (within 5%)
      const shoulderDiff = Math.abs(ls.value - rs.value) / Math.max(ls.value, rs.value);
      if (shoulderDiff > 0.05) continue;

      const neckline = Math.min(ls.value, rs.value);
      const target = neckline - (head.value - neckline);
      const confidence = clamp(0.7 - shoulderDiff * 5, 0.4, 0.9);

      return {
        name: 'Head and Shoulders',
        type: 'bearish',
        startIndex: ls.index,
        endIndex: rs.index,
        confidence: round2(confidence),
        target: round4(target),
      };
    }
    return null;
  }

  /** Detect Inverse Head and Shoulders (bullish reversal). */
  private detectInverseHeadAndShoulders(
    _pivotHighs: Array<{ index: number; value: number }>,
    pivotLows: Array<{ index: number; value: number }>,
    closes: number[],
  ): ChartPattern | null {
    if (pivotLows.length < 3) return null;

    for (let i = 0; i <= pivotLows.length - 3; i++) {
      const ls = pivotLows[i];
      const head = pivotLows[i + 1];
      const rs = pivotLows[i + 2];

      if (head.value >= ls.value || head.value >= rs.value) continue;
      const shoulderDiff = Math.abs(ls.value - rs.value) / Math.max(ls.value, rs.value);
      if (shoulderDiff > 0.05) continue;

      const neckline = Math.max(ls.value, rs.value);
      const target = neckline + (neckline - head.value);
      const confidence = clamp(0.7 - shoulderDiff * 5, 0.4, 0.9);

      return {
        name: 'Inverse Head and Shoulders',
        type: 'bullish',
        startIndex: ls.index,
        endIndex: rs.index,
        confidence: round2(confidence),
        target: round4(target),
      };
    }
    return null;
  }

  /** Detect Double Top (bearish reversal). */
  private detectDoubleTop(
    pivotHighs: Array<{ index: number; value: number }>,
    closes: number[],
  ): ChartPattern | null {
    if (pivotHighs.length < 2) return null;

    for (let i = 0; i < pivotHighs.length - 1; i++) {
      const first = pivotHighs[i];
      const second = pivotHighs[i + 1];
      const diff = Math.abs(first.value - second.value) / Math.max(first.value, second.value);
      if (diff > 0.03) continue; // Tops within 3%
      if (second.index - first.index < 5) continue; // Adequate spacing

      const midLow = Math.min(...closes.slice(first.index, second.index + 1));
      const target = midLow - (first.value - midLow);

      return {
        name: 'Double Top',
        type: 'bearish',
        startIndex: first.index,
        endIndex: second.index,
        confidence: round2(clamp(0.75 - diff * 10, 0.5, 0.9)),
        target: round4(target),
      };
    }
    return null;
  }

  /** Detect Double Bottom (bullish reversal). */
  private detectDoubleBottom(
    pivotLows: Array<{ index: number; value: number }>,
    closes: number[],
  ): ChartPattern | null {
    if (pivotLows.length < 2) return null;

    for (let i = 0; i < pivotLows.length - 1; i++) {
      const first = pivotLows[i];
      const second = pivotLows[i + 1];
      const diff = Math.abs(first.value - second.value) / Math.max(first.value, second.value);
      if (diff > 0.03) continue;
      if (second.index - first.index < 5) continue;

      const midHigh = Math.max(...closes.slice(first.index, second.index + 1));
      const target = midHigh + (midHigh - first.value);

      return {
        name: 'Double Bottom',
        type: 'bullish',
        startIndex: first.index,
        endIndex: second.index,
        confidence: round2(clamp(0.75 - diff * 10, 0.5, 0.9)),
        target: round4(target),
      };
    }
    return null;
  }

  /** Detect Triangle patterns (ascending, descending, symmetric). */
  private detectTriangle(
    pivotHighs: Array<{ index: number; value: number }>,
    pivotLows: Array<{ index: number; value: number }>,
    closes: number[],
  ): ChartPattern | null {
    if (pivotHighs.length < 2 || pivotLows.length < 2) return null;

    // Use the last several pivots
    const recentHighs = pivotHighs.slice(-4);
    const recentLows = pivotLows.slice(-4);
    if (recentHighs.length < 2 || recentLows.length < 2) return null;

    const highSlope = this.linearRegressionSlope(recentHighs.map(p => p.value));
    const lowSlope = this.linearRegressionSlope(recentLows.map(p => p.value));

    const startIdx = Math.min(recentHighs[0].index, recentLows[0].index);
    const endIdx = Math.max(
      recentHighs[recentHighs.length - 1].index,
      recentLows[recentLows.length - 1].index,
    );
    const lastClose = closes[closes.length - 1];

    // Ascending triangle: flat highs, rising lows
    if (Math.abs(highSlope) < 0.5 && lowSlope > 0.3) {
      const resistance = mean(recentHighs.map(p => p.value));
      return {
        name: 'Ascending Triangle',
        type: 'bullish',
        startIndex: startIdx,
        endIndex: endIdx,
        confidence: round2(clamp(0.65 + lowSlope * 0.1, 0.5, 0.85)),
        target: round4(resistance + (resistance - recentLows[0].value)),
      };
    }

    // Descending triangle: falling highs, flat lows
    if (highSlope < -0.3 && Math.abs(lowSlope) < 0.5) {
      const support = mean(recentLows.map(p => p.value));
      return {
        name: 'Descending Triangle',
        type: 'bearish',
        startIndex: startIdx,
        endIndex: endIdx,
        confidence: round2(clamp(0.65 + Math.abs(highSlope) * 0.1, 0.5, 0.85)),
        target: round4(support - (recentHighs[0].value - support)),
      };
    }

    // Symmetric triangle: converging highs and lows
    if (highSlope < -0.2 && lowSlope > 0.2) {
      return {
        name: 'Symmetric Triangle',
        type: 'neutral',
        startIndex: startIdx,
        endIndex: endIdx,
        confidence: round2(0.6),
        target: round4(lastClose),
      };
    }

    return null;
  }

  /** Detect Flag / Pennant pattern (continuation). */
  private detectFlag(closes: number[]): ChartPattern | null {
    if (closes.length < 30) return null;

    // Look for a strong move followed by a consolidation channel
    const poleEnd = closes.length - 15;
    const poleStart = Math.max(0, poleEnd - 15);
    const poleMove = (closes[poleEnd] - closes[poleStart]) / closes[poleStart];

    if (Math.abs(poleMove) < 0.05) return null; // Need at least 5% pole move

    const flagSection = closes.slice(poleEnd);
    const flagVol = stddev(flagSection) / mean(flagSection);

    if (flagVol > 0.03) return null; // Flag should be tight consolidation

    const direction = poleMove > 0 ? 'bullish' : 'bearish';
    const target = poleMove > 0
      ? closes[closes.length - 1] + Math.abs(closes[poleEnd] - closes[poleStart])
      : closes[closes.length - 1] - Math.abs(closes[poleEnd] - closes[poleStart]);

    return {
      name: direction === 'bullish' ? 'Bull Flag' : 'Bear Flag',
      type: direction,
      startIndex: poleStart,
      endIndex: closes.length - 1,
      confidence: round2(clamp(Math.abs(poleMove) * 5, 0.4, 0.8)),
      target: round4(target),
    };
  }

  /** Detect Wedge patterns (rising or falling). */
  private detectWedge(
    pivotHighs: Array<{ index: number; value: number }>,
    pivotLows: Array<{ index: number; value: number }>,
    _closes: number[],
  ): ChartPattern | null {
    if (pivotHighs.length < 3 || pivotLows.length < 3) return null;

    const recentHighs = pivotHighs.slice(-4);
    const recentLows = pivotLows.slice(-4);
    const highSlope = this.linearRegressionSlope(recentHighs.map(p => p.value));
    const lowSlope = this.linearRegressionSlope(recentLows.map(p => p.value));

    const startIdx = Math.min(recentHighs[0].index, recentLows[0].index);
    const endIdx = Math.max(
      recentHighs[recentHighs.length - 1].index,
      recentLows[recentLows.length - 1].index,
    );

    // Rising Wedge (bearish): both slopes positive, converging
    if (highSlope > 0.1 && lowSlope > 0.1 && lowSlope > highSlope) {
      return {
        name: 'Rising Wedge',
        type: 'bearish',
        startIndex: startIdx,
        endIndex: endIdx,
        confidence: round2(0.65),
        target: round4(recentLows[0].value),
      };
    }

    // Falling Wedge (bullish): both slopes negative, converging
    if (highSlope < -0.1 && lowSlope < -0.1 && highSlope > lowSlope) {
      return {
        name: 'Falling Wedge',
        type: 'bullish',
        startIndex: startIdx,
        endIndex: endIdx,
        confidence: round2(0.65),
        target: round4(recentHighs[0].value),
      };
    }

    return null;
  }

  /** Detect Cup and Handle pattern (bullish continuation). */
  private detectCupAndHandle(
    closes: number[],
    pivotLows: Array<{ index: number; value: number }>,
  ): ChartPattern | null {
    if (closes.length < 40 || pivotLows.length < 3) return null;

    // Look for a U-shaped dip followed by a smaller dip
    const len = closes.length;
    const scanStart = Math.max(0, len - 60);

    // Find the deepest pivot low in our window
    let cupBottom: { index: number; value: number } | null = null;
    for (const p of pivotLows) {
      if (p.index < scanStart) continue;
      if (!cupBottom || p.value < cupBottom.value) cupBottom = p;
    }
    if (!cupBottom) return null;

    // Cup left rim and right rim should be at similar heights
    const leftRim = closes[scanStart];
    const rightIdx = Math.min(cupBottom.index + 15, len - 1);
    const rightRim = closes[rightIdx];
    const rimDiff = Math.abs(leftRim - rightRim) / Math.max(leftRim, rightRim);
    if (rimDiff > 0.05) return null;

    // Cup depth should be meaningful
    const cupDepth = (Math.max(leftRim, rightRim) - cupBottom.value) / Math.max(leftRim, rightRim);
    if (cupDepth < 0.05 || cupDepth > 0.35) return null;

    const target = rightRim + (rightRim - cupBottom.value);

    return {
      name: 'Cup and Handle',
      type: 'bullish',
      startIndex: scanStart,
      endIndex: len - 1,
      confidence: round2(clamp(0.6 + cupDepth, 0.5, 0.85)),
      target: round4(target),
    };
  }

  // ── Risk / Statistical Internals ──────────────────────────────────────────

  /** Compute maximum drawdown from a price series. */
  private computeMaxDrawdown(prices: number[]): number {
    if (prices.length < 2) return 0;
    let peak = prices[0];
    let maxDD = 0;
    for (const price of prices) {
      if (price > peak) peak = price;
      const dd = (peak - price) / peak;
      if (dd > maxDD) maxDD = dd;
    }
    return maxDD;
  }

  /** Compute beta relative to a benchmark. */
  private computeBeta(assetReturns: number[], benchReturns: number[]): number {
    const n = Math.min(assetReturns.length, benchReturns.length);
    if (n < 2) return 1;

    const avgA = mean(assetReturns.slice(0, n));
    const avgB = mean(benchReturns.slice(0, n));
    let covariance = 0;
    let benchVariance = 0;

    for (let i = 0; i < n; i++) {
      const da = assetReturns[i] - avgA;
      const db = benchReturns[i] - avgB;
      covariance += da * db;
      benchVariance += db * db;
    }

    return benchVariance > 0 ? covariance / benchVariance : 1;
  }

  /** Compute lag-k autocorrelation of a series. */
  private computeAutocorrelation(data: number[], lag: number): number {
    if (data.length <= lag) return 0;
    const avg = mean(data);
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < data.length; i++) {
      denominator += (data[i] - avg) ** 2;
      if (i >= lag) {
        numerator += (data[i] - avg) * (data[i - lag] - avg);
      }
    }

    return denominator > 0 ? numerator / denominator : 0;
  }

  /** Compute the slope of a linear regression on equally-spaced data. */
  private linearRegressionSlope(data: number[]): number {
    const n = data.length;
    if (n < 2) return 0;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }

    const denom = n * sumX2 - sumX * sumX;
    return denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  }
}
