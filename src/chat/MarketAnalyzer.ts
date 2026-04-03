/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          📊  M A R K E T   A N A L Y Z E R                                  ║
 * ║                                                                             ║
 * ║   Comprehensive market analysis with multi-signal processing:               ║
 * ║     sentiment → trends → volatility → correlations → summary               ║
 * ║                                                                             ║
 * ║     • Keyword-based sentiment scoring (bullish / bearish / neutral)         ║
 * ║     • Multi-timeframe trend detection with momentum                         ║
 * ║     • Historical volatility and regime classification                       ║
 * ║     • Cross-asset correlation matrix computation                            ║
 * ║     • Market breadth and sector rotation detection                          ║
 * ║     • News impact assessment by category                                    ║
 * ║     • Statistical anomaly detection in price/volume data                    ║
 * ║     • Comprehensive market summary generation                               ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface MarketAnalyzerConfig {
  sentimentThreshold: number;
  anomalyStdDevs: number;
  correlationWindow: number;
  minDataPoints: number;
  trendSmoothingPeriod: number;
  volatilityWindow: number;
  momentumPeriod: number;
  breadthThreshold: number;
  enableLearning: boolean;
}

export interface MarketAnalyzerStats {
  totalSentimentAnalyses: number;
  totalTrendDetections: number;
  totalAnomaliesFound: number;
  totalCorrelationsComputed: number;
  totalVolatilityAnalyses: number;
  totalNewsAssessed: number;
  totalSummariesGenerated: number;
  feedbackReceived: number;
  feedbackAccuracy: number;
}

export interface SentimentResult {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  confidence: number;
  keywords: string[];
  reasoning: string[];
}

export interface TrendResult {
  direction: 'up' | 'down' | 'sideways';
  strength: number;
  momentum: number;
  timeframe: string;
  pivotPoints: Array<{ index: number; value: number; type: 'high' | 'low' }>;
}

export interface VolatilityResult {
  historicalVol: number;
  avgVol: number;
  isHighVol: boolean;
  regime: 'calm' | 'normal' | 'volatile' | 'extreme';
  clusters: Array<{ startIndex: number; endIndex: number; avgVol: number }>;
}

export interface CorrelationMatrix {
  assets: string[];
  matrix: number[][];
  strongPositive: Array<{ assetA: string; assetB: string; correlation: number }>;
  strongNegative: Array<{ assetA: string; assetB: string; correlation: number }>;
  changes: Array<{ assetA: string; assetB: string; oldCorr: number; newCorr: number }>;
}

export interface MarketBreadth {
  advancers: number;
  decliners: number;
  ratio: number;
  thrust: number;
  sentiment: 'strongly_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strongly_bearish';
}

export interface NewsImpact {
  headline: string;
  category: string;
  expectedImpact: number;
  affectedSectors: string[];
  confidence: number;
  timeHorizon: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
}

export interface AnomalyResult {
  index: number;
  value: number;
  expectedRange: { low: number; high: number };
  severity: number;
  type: 'price' | 'volume' | 'volatility';
}

export interface MarketSummary {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  trendDirection: 'up' | 'down' | 'sideways';
  volatilityRegime: 'calm' | 'normal' | 'volatile' | 'extreme';
  keyLevels: { support: number[]; resistance: number[] };
  outlook: string;
  risks: string[];
  opportunities: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: MarketAnalyzerConfig = {
  sentimentThreshold: 0.15,
  anomalyStdDevs: 2.0,
  correlationWindow: 20,
  minDataPoints: 5,
  trendSmoothingPeriod: 5,
  volatilityWindow: 14,
  momentumPeriod: 10,
  breadthThreshold: 0.6,
  enableLearning: true,
};

// ── Sentiment Keyword Dictionaries ───────────────────────────────────────────

interface SentimentEntry {
  word: string;
  weight: number;
}

function buildBullishKeywords(): SentimentEntry[] {
  return [
    { word: 'rally', weight: 0.8 },
    { word: 'surge', weight: 0.85 },
    { word: 'bullish', weight: 0.9 },
    { word: 'breakout', weight: 0.75 },
    { word: 'upgrade', weight: 0.7 },
    { word: 'growth', weight: 0.6 },
    { word: 'recovery', weight: 0.65 },
    { word: 'gain', weight: 0.55 },
    { word: 'profit', weight: 0.5 },
    { word: 'optimistic', weight: 0.7 },
    { word: 'outperform', weight: 0.75 },
    { word: 'momentum', weight: 0.5 },
    { word: 'expansion', weight: 0.6 },
    { word: 'uptrend', weight: 0.8 },
    { word: 'higher', weight: 0.4 },
    { word: 'strong', weight: 0.45 },
    { word: 'robust', weight: 0.55 },
    { word: 'beat', weight: 0.6 },
    { word: 'exceeds', weight: 0.6 },
    { word: 'record', weight: 0.5 },
    { word: 'boom', weight: 0.8 },
    { word: 'soar', weight: 0.85 },
    { word: 'uptick', weight: 0.5 },
    { word: 'buy', weight: 0.55 },
    { word: 'accumulate', weight: 0.6 },
    { word: 'positive', weight: 0.45 },
    { word: 'accelerate', weight: 0.55 },
    { word: 'opportunity', weight: 0.5 },
    { word: 'innovative', weight: 0.4 },
    { word: 'catalyst', weight: 0.6 },
  ];
}

function buildBearishKeywords(): SentimentEntry[] {
  return [
    { word: 'crash', weight: 0.9 },
    { word: 'plunge', weight: 0.85 },
    { word: 'bearish', weight: 0.9 },
    { word: 'decline', weight: 0.65 },
    { word: 'downgrade', weight: 0.7 },
    { word: 'recession', weight: 0.8 },
    { word: 'sell', weight: 0.55 },
    { word: 'loss', weight: 0.5 },
    { word: 'fear', weight: 0.7 },
    { word: 'panic', weight: 0.85 },
    { word: 'risk', weight: 0.4 },
    { word: 'warning', weight: 0.55 },
    { word: 'correction', weight: 0.6 },
    { word: 'downtrend', weight: 0.8 },
    { word: 'lower', weight: 0.4 },
    { word: 'weak', weight: 0.5 },
    { word: 'slump', weight: 0.75 },
    { word: 'contraction', weight: 0.65 },
    { word: 'deficit', weight: 0.5 },
    { word: 'volatility', weight: 0.45 },
    { word: 'uncertainty', weight: 0.5 },
    { word: 'selloff', weight: 0.8 },
    { word: 'bankruptcy', weight: 0.9 },
    { word: 'default', weight: 0.75 },
    { word: 'inflation', weight: 0.5 },
    { word: 'overvalued', weight: 0.6 },
    { word: 'bubble', weight: 0.7 },
    { word: 'collapse', weight: 0.9 },
    { word: 'stagnation', weight: 0.55 },
    { word: 'crisis', weight: 0.85 },
  ];
}

// ── News Category Impact Profiles ────────────────────────────────────────────

interface NewsCategoryProfile {
  category: string;
  patterns: RegExp[];
  baseImpact: number;
  sectors: string[];
  timeHorizon: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
}

function buildNewsCategoryProfiles(): NewsCategoryProfile[] {
  return [
    {
      category: 'monetary_policy',
      patterns: [
        /\bfed(eral\s+reserve)?\b/i, /\binterest\s+rate/i, /\brate\s+(hike|cut)/i,
        /\bmonetary\s+policy/i, /\bcentral\s+bank/i, /\bquantitative\s+(easing|tightening)/i,
      ],
      baseImpact: 0.85,
      sectors: ['financials', 'real_estate', 'utilities', 'bonds'],
      timeHorizon: 'immediate',
    },
    {
      category: 'earnings',
      patterns: [
        /\bearnings?\b/i, /\brevenue/i, /\bquarterly\s+results/i,
        /\bEPS\b/, /\bguidance/i, /\bprofit\s+(warn|miss|beat)/i,
      ],
      baseImpact: 0.7,
      sectors: ['equity'],
      timeHorizon: 'short_term',
    },
    {
      category: 'geopolitical',
      patterns: [
        /\bwar\b/i, /\bsanction/i, /\btariff/i, /\btrade\s+war/i,
        /\bgeopolit/i, /\bconflict/i, /\btreaty/i, /\bembargo/i,
      ],
      baseImpact: 0.8,
      sectors: ['energy', 'defense', 'commodities', 'currency'],
      timeHorizon: 'medium_term',
    },
    {
      category: 'regulation',
      patterns: [
        /\bregulat/i, /\blegislat/i, /\bcompliance/i, /\bantitrust/i,
        /\bSEC\b/, /\bban\b/i, /\bpolicy\s+change/i,
      ],
      baseImpact: 0.65,
      sectors: ['technology', 'financials', 'healthcare', 'crypto'],
      timeHorizon: 'medium_term',
    },
    {
      category: 'economic_data',
      patterns: [
        /\bGDP\b/i, /\bunemployment/i, /\bjobs?\s+report/i, /\bCPI\b/,
        /\binflation\s+data/i, /\bretail\s+sales/i, /\bPMI\b/,
      ],
      baseImpact: 0.6,
      sectors: ['broad_market'],
      timeHorizon: 'short_term',
    },
    {
      category: 'corporate_action',
      patterns: [
        /\bmerger/i, /\bacquisition/i, /\bIPO\b/i, /\bbuyback/i,
        /\bdividend/i, /\bspin.?off/i, /\brestructur/i,
      ],
      baseImpact: 0.7,
      sectors: ['equity'],
      timeHorizon: 'short_term',
    },
    {
      category: 'natural_disaster',
      patterns: [
        /\bearthquake/i, /\bhurricane/i, /\bflood/i, /\bdrought/i,
        /\bwildfire/i, /\btsunami/i, /\bpandemic/i,
      ],
      baseImpact: 0.75,
      sectors: ['insurance', 'commodities', 'agriculture', 'energy'],
      timeHorizon: 'immediate',
    },
    {
      category: 'technology',
      patterns: [
        /\bAI\b/, /\bartificial\s+intelligence/i, /\bbreakthrough/i,
        /\btech\s+innovation/i, /\bcyber\s*(attack|security)/i,
      ],
      baseImpact: 0.55,
      sectors: ['technology', 'semiconductors'],
      timeHorizon: 'long_term',
    },
  ];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function simpleMovingAverage(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(data[i]);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j];
      result.push(sum / period);
    }
  }
  return result;
}

function percentageReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] !== 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    } else {
      returns.push(0);
    }
  }
  return returns;
}

function pearsonCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;

  const meanA = mean(a.slice(0, n));
  const meanB = mean(b.slice(0, n));

  let covAB = 0;
  let varA = 0;
  let varB = 0;

  for (let i = 0; i < n; i++) {
    const dA = a[i] - meanA;
    const dB = b[i] - meanB;
    covAB += dA * dB;
    varA += dA * dA;
    varB += dB * dB;
  }

  const denom = Math.sqrt(varA * varB);
  return denom === 0 ? 0 : covAB / denom;
}

function linearRegressionSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const denom = n * sumXX - sumX * sumX;
  return denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class MarketAnalyzer {
  private readonly config: MarketAnalyzerConfig;
  private readonly bullishKeywords: SentimentEntry[];
  private readonly bearishKeywords: SentimentEntry[];
  private readonly newsProfiles: NewsCategoryProfile[];

  private totalSentimentAnalyses = 0;
  private totalTrendDetections = 0;
  private totalAnomaliesFound = 0;
  private totalCorrelationsComputed = 0;
  private totalVolatilityAnalyses = 0;
  private totalNewsAssessed = 0;
  private totalSummariesGenerated = 0;
  private feedbackCorrect = 0;
  private feedbackTotal = 0;
  private previousCorrelations = new Map<string, number>();

  constructor(config?: Partial<MarketAnalyzerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.bullishKeywords = buildBullishKeywords();
    this.bearishKeywords = buildBearishKeywords();
    this.newsProfiles = buildNewsCategoryProfiles();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /** Analyze text for market sentiment using keyword scoring and pattern matching. */
  analyzeSentiment(text: string): SentimentResult {
    this.totalSentimentAnalyses++;

    const tokens = tokenize(text);
    const matchedBullish: string[] = [];
    const matchedBearish: string[] = [];
    let bullishScore = 0;
    let bearishScore = 0;

    for (const token of tokens) {
      for (const entry of this.bullishKeywords) {
        if (token === entry.word || token.includes(entry.word)) {
          bullishScore += entry.weight;
          if (!matchedBullish.includes(entry.word)) matchedBullish.push(entry.word);
        }
      }
      for (const entry of this.bearishKeywords) {
        if (token === entry.word || token.includes(entry.word)) {
          bearishScore += entry.weight;
          if (!matchedBearish.includes(entry.word)) matchedBearish.push(entry.word);
        }
      }
    }

    // Check for negation patterns that flip sentiment
    const negationPatterns = [/\bnot\s+\w+/gi, /\bno\s+\w+/gi, /\bwon'?t\b/gi, /\bdon'?t\b/gi];
    let negationCount = 0;
    for (const pat of negationPatterns) {
      const matches = text.match(pat);
      if (matches) negationCount += matches.length;
    }
    if (negationCount > 0) {
      const temp = bullishScore;
      bullishScore = bullishScore * 0.5 + bearishScore * 0.5;
      bearishScore = bearishScore * 0.5 + temp * 0.5;
    }

    // Check intensity modifiers
    const intensifiers = /\b(very|extremely|highly|significantly|massively)\b/gi;
    const intensifierMatches = text.match(intensifiers);
    const intensityMultiplier = intensifierMatches ? 1 + intensifierMatches.length * 0.15 : 1;

    bullishScore *= intensityMultiplier;
    bearishScore *= intensityMultiplier;

    const totalWeight = bullishScore + bearishScore;
    const rawScore = totalWeight === 0 ? 0 : (bullishScore - bearishScore) / totalWeight;
    const score = round2(clamp(rawScore, -1, 1));

    const keywords = [...matchedBullish, ...matchedBearish];
    const confidence = round2(clamp(
      Math.min(totalWeight / 3, 1) * (1 - Math.exp(-keywords.length * 0.3)),
      0, 1,
    ));

    const reasoning: string[] = [];
    if (matchedBullish.length > 0) {
      reasoning.push(`Bullish signals: ${matchedBullish.join(', ')} (score: ${round2(bullishScore)})`);
    }
    if (matchedBearish.length > 0) {
      reasoning.push(`Bearish signals: ${matchedBearish.join(', ')} (score: ${round2(bearishScore)})`);
    }
    if (negationCount > 0) {
      reasoning.push(`Detected ${negationCount} negation pattern(s), partially inverting sentiment.`);
    }
    if (intensifierMatches && intensifierMatches.length > 0) {
      reasoning.push(`Intensity modifiers boosted scores by ${round2((intensityMultiplier - 1) * 100)}%.`);
    }

    let sentiment: SentimentResult['sentiment'];
    if (score > this.config.sentimentThreshold) {
      sentiment = 'bullish';
    } else if (score < -this.config.sentimentThreshold) {
      sentiment = 'bearish';
    } else {
      sentiment = 'neutral';
    }

    if (reasoning.length === 0) {
      reasoning.push('No significant sentiment keywords detected.');
    }

    return { sentiment, score, confidence, keywords, reasoning };
  }

  /** Detect trends in price data with strength and momentum calculation. */
  detectTrend(prices: number[], timeframe = 'default'): TrendResult {
    this.totalTrendDetections++;

    if (prices.length < this.config.minDataPoints) {
      return {
        direction: 'sideways',
        strength: 0,
        momentum: 0,
        timeframe,
        pivotPoints: [],
      };
    }

    // Smooth data with SMA
    const smoothed = simpleMovingAverage(prices, Math.min(this.config.trendSmoothingPeriod, prices.length));

    // Calculate trend direction via linear regression
    const slope = linearRegressionSlope(smoothed);
    const priceRange = Math.max(...prices) - Math.min(...prices);
    const normalizedSlope = priceRange !== 0 ? slope / priceRange : 0;

    // Determine direction
    let direction: TrendResult['direction'];
    if (normalizedSlope > 0.01) {
      direction = 'up';
    } else if (normalizedSlope < -0.01) {
      direction = 'down';
    } else {
      direction = 'sideways';
    }

    // Calculate strength as R-squared of the linear fit
    const strength = round2(clamp(this.computeRSquared(smoothed), 0, 1));

    // Calculate momentum from recent returns
    const momentumWindow = Math.min(this.config.momentumPeriod, prices.length);
    const recentSlice = prices.slice(-momentumWindow);
    const firstVal = recentSlice[0];
    const lastVal = recentSlice[recentSlice.length - 1];
    const momentum = firstVal !== 0
      ? round2(clamp((lastVal - firstVal) / firstVal, -1, 1))
      : 0;

    // Find pivot points (local highs and lows)
    const pivotPoints = this.findPivotPoints(prices);

    return { direction, strength, momentum, timeframe, pivotPoints };
  }

  /** Analyze volatility with regime classification and cluster detection. */
  analyzeVolatility(prices: number[]): VolatilityResult {
    this.totalVolatilityAnalyses++;

    if (prices.length < this.config.minDataPoints) {
      return {
        historicalVol: 0,
        avgVol: 0,
        isHighVol: false,
        regime: 'calm',
        clusters: [],
      };
    }

    const returns = percentageReturns(prices);
    if (returns.length === 0) {
      return { historicalVol: 0, avgVol: 0, isHighVol: false, regime: 'calm', clusters: [] };
    }

    // Historical volatility (annualized standard deviation of returns)
    const historicalVol = round2(stdDev(returns) * Math.sqrt(252));

    // Rolling volatility for regime detection
    const volWindow = Math.min(this.config.volatilityWindow, returns.length);
    const rollingVols: number[] = [];
    for (let i = volWindow - 1; i < returns.length; i++) {
      const window = returns.slice(i - volWindow + 1, i + 1);
      rollingVols.push(stdDev(window) * Math.sqrt(252));
    }

    const avgVol = round2(rollingVols.length > 0 ? mean(rollingVols) : historicalVol);

    // Classify volatility regime
    let regime: VolatilityResult['regime'];
    if (historicalVol < 0.10) {
      regime = 'calm';
    } else if (historicalVol < 0.20) {
      regime = 'normal';
    } else if (historicalVol < 0.35) {
      regime = 'volatile';
    } else {
      regime = 'extreme';
    }

    const isHighVol = regime === 'volatile' || regime === 'extreme';

    // Detect volatility clusters (periods of sustained high volatility)
    const clusters = this.detectVolatilityClusters(rollingVols, avgVol);

    return { historicalVol, avgVol, isHighVol, regime, clusters };
  }

  /** Compute cross-asset correlation matrix with change detection. */
  computeCorrelations(
    assetData: Record<string, number[]>,
  ): CorrelationMatrix {
    this.totalCorrelationsComputed++;

    const assets = Object.keys(assetData);
    const n = assets.length;
    const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0) as number[]);

    const strongPositive: CorrelationMatrix['strongPositive'] = [];
    const strongNegative: CorrelationMatrix['strongNegative'] = [];
    const changes: CorrelationMatrix['changes'] = [];

    // Compute returns for each asset
    const returnsMap = new Map<string, number[]>();
    for (const asset of assets) {
      returnsMap.set(asset, percentageReturns(assetData[asset]));
    }

    // Fill the correlation matrix
    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1;
      for (let j = i + 1; j < n; j++) {
        const retA = returnsMap.get(assets[i]) ?? [];
        const retB = returnsMap.get(assets[j]) ?? [];

        // Use the configured window
        const windowA = retA.slice(-this.config.correlationWindow);
        const windowB = retB.slice(-this.config.correlationWindow);

        const corr = round2(pearsonCorrelation(windowA, windowB));
        matrix[i][j] = corr;
        matrix[j][i] = corr;

        // Track strong correlations
        if (corr >= 0.7) {
          strongPositive.push({ assetA: assets[i], assetB: assets[j], correlation: corr });
        } else if (corr <= -0.7) {
          strongNegative.push({ assetA: assets[i], assetB: assets[j], correlation: corr });
        }

        // Detect correlation changes from previous computation
        const pairKey = `${assets[i]}|${assets[j]}`;
        const prevCorr = this.previousCorrelations.get(pairKey);
        if (prevCorr !== undefined && Math.abs(corr - prevCorr) > 0.2) {
          changes.push({
            assetA: assets[i],
            assetB: assets[j],
            oldCorr: prevCorr,
            newCorr: corr,
          });
        }
        this.previousCorrelations.set(pairKey, corr);
      }
    }

    // Sort by absolute correlation strength
    strongPositive.sort((a, b) => b.correlation - a.correlation);
    strongNegative.sort((a, b) => a.correlation - b.correlation);

    return { assets, matrix, strongPositive, strongNegative, changes };
  }

  /** Analyze market breadth from advancing and declining data. */
  analyzeMarketBreadth(
    advancers: number,
    decliners: number,
    unchanged = 0,
  ): MarketBreadth {
    const total = advancers + decliners + unchanged;
    if (total === 0) {
      return { advancers: 0, decliners: 0, ratio: 1, thrust: 0, sentiment: 'neutral' };
    }

    const ratio = decliners > 0 ? round2(advancers / decliners) : advancers > 0 ? 999 : 1;

    // Breadth thrust: percentage of advancers relative to total
    const thrust = round2((advancers - decliners) / total);

    let sentiment: MarketBreadth['sentiment'];
    if (thrust > this.config.breadthThreshold) {
      sentiment = 'strongly_bullish';
    } else if (thrust > 0.2) {
      sentiment = 'bullish';
    } else if (thrust > -0.2) {
      sentiment = 'neutral';
    } else if (thrust > -this.config.breadthThreshold) {
      sentiment = 'bearish';
    } else {
      sentiment = 'strongly_bearish';
    }

    return { advancers, decliners, ratio, thrust, sentiment };
  }

  /** Assess the potential market impact of a news headline. */
  assessNewsImpact(headline: string): NewsImpact {
    this.totalNewsAssessed++;

    let bestMatch: NewsCategoryProfile | null = null;
    let bestPatternCount = 0;

    for (const profile of this.newsProfiles) {
      let matchCount = 0;
      for (const pat of profile.patterns) {
        pat.lastIndex = 0;
        if (pat.test(headline)) matchCount++;
      }
      if (matchCount > bestPatternCount) {
        bestPatternCount = matchCount;
        bestMatch = profile;
      }
    }

    if (!bestMatch) {
      return {
        headline,
        category: 'general',
        expectedImpact: 0.2,
        affectedSectors: ['broad_market'],
        confidence: 0.2,
        timeHorizon: 'short_term',
      };
    }

    // Compute sentiment influence on impact magnitude
    const sentimentResult = this.analyzeSentimentInternal(headline);
    const sentimentBoost = Math.abs(sentimentResult.score) * 0.2;
    const expectedImpact = round2(clamp(bestMatch.baseImpact + sentimentBoost, 0, 1));

    // Confidence based on number of pattern matches and text length
    const patternRatio = bestPatternCount / bestMatch.patterns.length;
    const lengthFactor = clamp(headline.length / 100, 0.3, 1);
    const confidence = round2(clamp(patternRatio * 0.7 + lengthFactor * 0.3, 0, 1));

    return {
      headline,
      category: bestMatch.category,
      expectedImpact,
      affectedSectors: [...bestMatch.sectors],
      confidence,
      timeHorizon: bestMatch.timeHorizon,
    };
  }

  /** Detect statistical anomalies in numeric data. */
  detectAnomalies(
    data: number[],
    type: AnomalyResult['type'] = 'price',
  ): AnomalyResult[] {
    if (data.length < this.config.minDataPoints) return [];

    const anomalies: AnomalyResult[] = [];
    const m = mean(data);
    const sd = stdDev(data);

    if (sd === 0) return [];

    const threshold = this.config.anomalyStdDevs;

    for (let i = 0; i < data.length; i++) {
      const zScore = Math.abs((data[i] - m) / sd);
      if (zScore > threshold) {
        const severity = round2(clamp(zScore / (threshold * 2), 0, 1));
        anomalies.push({
          index: i,
          value: data[i],
          expectedRange: {
            low: round2(m - threshold * sd),
            high: round2(m + threshold * sd),
          },
          severity,
          type,
        });
      }
    }

    this.totalAnomaliesFound += anomalies.length;

    // Also apply rolling window anomaly detection for additional sensitivity
    const rollingAnomalies = this.detectRollingAnomalies(data, type);
    for (const ra of rollingAnomalies) {
      if (!anomalies.some(a => a.index === ra.index)) {
        anomalies.push(ra);
      }
    }

    anomalies.sort((a, b) => b.severity - a.severity);
    return anomalies;
  }

  /** Generate a comprehensive market summary from multiple data inputs. */
  generateSummary(
    prices: number[],
    headlines: string[],
    breadthData?: { advancers: number; decliners: number },
  ): MarketSummary {
    this.totalSummariesGenerated++;

    // Compute sentiment from headlines
    const sentimentScores: number[] = [];
    const allReasoning: string[] = [];
    for (const h of headlines) {
      const sr = this.analyzeSentiment(h);
      sentimentScores.push(sr.score);
      allReasoning.push(...sr.reasoning);
    }
    const avgSentiment = sentimentScores.length > 0 ? mean(sentimentScores) : 0;

    let overallSentiment: MarketSummary['overallSentiment'];
    if (avgSentiment > this.config.sentimentThreshold) {
      overallSentiment = 'bullish';
    } else if (avgSentiment < -this.config.sentimentThreshold) {
      overallSentiment = 'bearish';
    } else {
      overallSentiment = 'neutral';
    }

    // Compute trend
    const trend = prices.length >= this.config.minDataPoints
      ? this.detectTrend(prices)
      : { direction: 'sideways' as const, strength: 0, momentum: 0 };
    const trendDirection = trend.direction;

    // Compute volatility
    const vol = prices.length >= this.config.minDataPoints
      ? this.analyzeVolatility(prices)
      : { regime: 'normal' as const };
    const volatilityRegime = vol.regime;

    // Compute key support and resistance levels
    const keyLevels = this.computeKeyLevels(prices);

    // Breadth analysis
    let breadthSentiment = 'neutral';
    if (breadthData) {
      const breadth = this.analyzeMarketBreadth(breadthData.advancers, breadthData.decliners);
      breadthSentiment = breadth.sentiment;
    }

    // Generate outlook
    const outlook = this.generateOutlook(overallSentiment, trendDirection, volatilityRegime, breadthSentiment);

    // Generate risks and opportunities
    const risks = this.identifyRisks(overallSentiment, volatilityRegime, headlines);
    const opportunities = this.identifyOpportunities(overallSentiment, trendDirection, headlines);

    return {
      overallSentiment,
      trendDirection,
      volatilityRegime,
      keyLevels,
      outlook,
      risks,
      opportunities,
    };
  }

  /** Learn from feedback on a previous analysis result. */
  learnFromFeedback(analysisType: string, correct: boolean): void {
    if (!this.config.enableLearning) return;
    this.feedbackTotal++;
    if (correct) this.feedbackCorrect++;
  }

  /** Return aggregate statistics. */
  getStats(): Readonly<MarketAnalyzerStats> {
    return {
      totalSentimentAnalyses: this.totalSentimentAnalyses,
      totalTrendDetections: this.totalTrendDetections,
      totalAnomaliesFound: this.totalAnomaliesFound,
      totalCorrelationsComputed: this.totalCorrelationsComputed,
      totalVolatilityAnalyses: this.totalVolatilityAnalyses,
      totalNewsAssessed: this.totalNewsAssessed,
      totalSummariesGenerated: this.totalSummariesGenerated,
      feedbackReceived: this.feedbackTotal,
      feedbackAccuracy: this.feedbackTotal > 0
        ? round2(this.feedbackCorrect / this.feedbackTotal)
        : 0,
    };
  }

  /** Serialize the analyzer state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalSentimentAnalyses: this.totalSentimentAnalyses,
      totalTrendDetections: this.totalTrendDetections,
      totalAnomaliesFound: this.totalAnomaliesFound,
      totalCorrelationsComputed: this.totalCorrelationsComputed,
      totalVolatilityAnalyses: this.totalVolatilityAnalyses,
      totalNewsAssessed: this.totalNewsAssessed,
      totalSummariesGenerated: this.totalSummariesGenerated,
      feedbackCorrect: this.feedbackCorrect,
      feedbackTotal: this.feedbackTotal,
      previousCorrelations: Array.from(this.previousCorrelations.entries()),
    });
  }

  /** Restore a MarketAnalyzer from serialized JSON. */
  static deserialize(json: string): MarketAnalyzer {
    const data = JSON.parse(json) as {
      config: MarketAnalyzerConfig;
      totalSentimentAnalyses: number;
      totalTrendDetections: number;
      totalAnomaliesFound: number;
      totalCorrelationsComputed: number;
      totalVolatilityAnalyses: number;
      totalNewsAssessed: number;
      totalSummariesGenerated: number;
      feedbackCorrect: number;
      feedbackTotal: number;
      previousCorrelations: Array<[string, number]>;
    };

    const instance = new MarketAnalyzer(data.config);
    instance.totalSentimentAnalyses = data.totalSentimentAnalyses;
    instance.totalTrendDetections = data.totalTrendDetections;
    instance.totalAnomaliesFound = data.totalAnomaliesFound;
    instance.totalCorrelationsComputed = data.totalCorrelationsComputed;
    instance.totalVolatilityAnalyses = data.totalVolatilityAnalyses;
    instance.totalNewsAssessed = data.totalNewsAssessed;
    instance.totalSummariesGenerated = data.totalSummariesGenerated;
    instance.feedbackCorrect = data.feedbackCorrect;
    instance.feedbackTotal = data.feedbackTotal;
    instance.previousCorrelations = new Map(data.previousCorrelations);
    return instance;
  }

  // ── Internal Sentiment Helper ─────────────────────────────────────────────

  /** Lightweight internal sentiment scoring (avoids incrementing stats). */
  private analyzeSentimentInternal(text: string): { score: number } {
    const tokens = tokenize(text);
    let bullish = 0;
    let bearish = 0;

    for (const token of tokens) {
      for (const entry of this.bullishKeywords) {
        if (token === entry.word || token.includes(entry.word)) bullish += entry.weight;
      }
      for (const entry of this.bearishKeywords) {
        if (token === entry.word || token.includes(entry.word)) bearish += entry.weight;
      }
    }

    const total = bullish + bearish;
    return { score: total === 0 ? 0 : round2((bullish - bearish) / total) };
  }

  // ── Trend Internals ───────────────────────────────────────────────────────

  /** Compute R-squared for a linear fit over the data. */
  private computeRSquared(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;

    const m = mean(values);
    const slope = linearRegressionSlope(values);

    // Compute intercept: y = slope * x + intercept
    const meanX = (n - 1) / 2;
    const intercept = m - slope * meanX;

    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < n; i++) {
      const predicted = slope * i + intercept;
      ssTot += (values[i] - m) ** 2;
      ssRes += (values[i] - predicted) ** 2;
    }

    return ssTot === 0 ? 0 : clamp(1 - ssRes / ssTot, 0, 1);
  }

  /** Identify local high and low pivot points in the data. */
  private findPivotPoints(
    data: number[],
  ): Array<{ index: number; value: number; type: 'high' | 'low' }> {
    const pivots: Array<{ index: number; value: number; type: 'high' | 'low' }> = [];
    const lookback = Math.max(2, Math.floor(data.length / 20));

    for (let i = lookback; i < data.length - lookback; i++) {
      let isHigh = true;
      let isLow = true;

      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j === i) continue;
        if (data[j] >= data[i]) isHigh = false;
        if (data[j] <= data[i]) isLow = false;
      }

      if (isHigh) pivots.push({ index: i, value: round2(data[i]), type: 'high' });
      if (isLow) pivots.push({ index: i, value: round2(data[i]), type: 'low' });
    }

    return pivots;
  }

  // ── Volatility Internals ──────────────────────────────────────────────────

  /** Detect clusters of sustained high volatility. */
  private detectVolatilityClusters(
    rollingVols: number[],
    avgVol: number,
  ): VolatilityResult['clusters'] {
    const clusters: VolatilityResult['clusters'] = [];
    const threshold = avgVol * 1.5;
    let clusterStart = -1;

    for (let i = 0; i < rollingVols.length; i++) {
      if (rollingVols[i] > threshold) {
        if (clusterStart === -1) clusterStart = i;
      } else {
        if (clusterStart !== -1 && i - clusterStart >= 3) {
          const clusterVols = rollingVols.slice(clusterStart, i);
          clusters.push({
            startIndex: clusterStart,
            endIndex: i - 1,
            avgVol: round2(mean(clusterVols)),
          });
        }
        clusterStart = -1;
      }
    }

    // Handle cluster that extends to the end
    if (clusterStart !== -1 && rollingVols.length - clusterStart >= 3) {
      const clusterVols = rollingVols.slice(clusterStart);
      clusters.push({
        startIndex: clusterStart,
        endIndex: rollingVols.length - 1,
        avgVol: round2(mean(clusterVols)),
      });
    }

    return clusters;
  }

  // ── Anomaly Internals ─────────────────────────────────────────────────────

  /** Rolling window anomaly detection for additional sensitivity. */
  private detectRollingAnomalies(
    data: number[],
    type: AnomalyResult['type'],
  ): AnomalyResult[] {
    const anomalies: AnomalyResult[] = [];
    const window = Math.max(this.config.minDataPoints, Math.floor(data.length / 4));

    if (data.length < window + 2) return anomalies;

    for (let i = window; i < data.length; i++) {
      const windowSlice = data.slice(i - window, i);
      const m = mean(windowSlice);
      const sd = stdDev(windowSlice);
      if (sd === 0) continue;

      const zScore = Math.abs((data[i] - m) / sd);
      if (zScore > this.config.anomalyStdDevs * 1.2) {
        const severity = round2(clamp(zScore / (this.config.anomalyStdDevs * 2.5), 0, 1));
        anomalies.push({
          index: i,
          value: data[i],
          expectedRange: {
            low: round2(m - this.config.anomalyStdDevs * sd),
            high: round2(m + this.config.anomalyStdDevs * sd),
          },
          severity,
          type,
        });
      }
    }

    this.totalAnomaliesFound += anomalies.length;
    return anomalies;
  }

  // ── Summary Internals ─────────────────────────────────────────────────────

  /** Compute key support and resistance levels from price data. */
  private computeKeyLevels(
    prices: number[],
  ): { support: number[]; resistance: number[] } {
    if (prices.length < this.config.minDataPoints) {
      return { support: [], resistance: [] };
    }

    const pivots = this.findPivotPoints(prices);
    const highs = pivots.filter(p => p.type === 'high').map(p => p.value);
    const lows = pivots.filter(p => p.type === 'low').map(p => p.value);

    // Cluster nearby levels within 2% tolerance
    const support = this.clusterLevels(lows).slice(0, 3);
    const resistance = this.clusterLevels(highs).slice(0, 3);

    // Fallback: use percentile levels if no pivots found
    if (support.length === 0 && prices.length > 0) {
      const sorted = [...prices].sort((a, b) => a - b);
      support.push(round2(sorted[Math.floor(sorted.length * 0.1)]));
      support.push(round2(sorted[Math.floor(sorted.length * 0.25)]));
    }
    if (resistance.length === 0 && prices.length > 0) {
      const sorted = [...prices].sort((a, b) => a - b);
      resistance.push(round2(sorted[Math.floor(sorted.length * 0.75)]));
      resistance.push(round2(sorted[Math.floor(sorted.length * 0.9)]));
    }

    return { support, resistance };
  }

  /** Cluster nearby price levels within a tolerance band. */
  private clusterLevels(levels: number[]): number[] {
    if (levels.length === 0) return [];

    const sorted = [...levels].sort((a, b) => a - b);
    const clusters: number[][] = [[sorted[0]]];

    for (let i = 1; i < sorted.length; i++) {
      const lastCluster = clusters[clusters.length - 1];
      const clusterAvg = mean(lastCluster);
      const tolerance = clusterAvg * 0.02;

      if (Math.abs(sorted[i] - clusterAvg) <= tolerance) {
        lastCluster.push(sorted[i]);
      } else {
        clusters.push([sorted[i]]);
      }
    }

    // Sort clusters by frequency (most touched levels first), then return averages
    clusters.sort((a, b) => b.length - a.length);
    return clusters.map(c => round2(mean(c)));
  }

  /** Generate a textual outlook based on combined signals. */
  private generateOutlook(
    sentiment: MarketSummary['overallSentiment'],
    trend: MarketSummary['trendDirection'],
    volatility: MarketSummary['volatilityRegime'],
    breadthSentiment: string,
  ): string {
    const parts: string[] = [];

    // Trend assessment
    if (trend === 'up') {
      parts.push('The market is in an uptrend');
    } else if (trend === 'down') {
      parts.push('The market is in a downtrend');
    } else {
      parts.push('The market is moving sideways');
    }

    // Sentiment overlay
    if (sentiment === 'bullish') {
      parts.push('with bullish sentiment supporting further gains');
    } else if (sentiment === 'bearish') {
      parts.push('with bearish sentiment suggesting continued pressure');
    } else {
      parts.push('with mixed sentiment providing no clear directional bias');
    }

    // Volatility context
    if (volatility === 'extreme') {
      parts.push('in an extremely volatile environment — expect sharp swings');
    } else if (volatility === 'volatile') {
      parts.push('amid elevated volatility — position sizing should be reduced');
    } else if (volatility === 'calm') {
      parts.push('in a calm low-volatility regime');
    }

    // Breadth modifier
    if (breadthSentiment === 'strongly_bullish') {
      parts.push('with broad participation confirming strength');
    } else if (breadthSentiment === 'strongly_bearish') {
      parts.push('with breadth deterioration signaling widespread weakness');
    }

    return parts.join(', ') + '.';
  }

  /** Identify key risks from the current market state. */
  private identifyRisks(
    sentiment: MarketSummary['overallSentiment'],
    volatility: MarketSummary['volatilityRegime'],
    headlines: string[],
  ): string[] {
    const risks: string[] = [];

    if (volatility === 'extreme' || volatility === 'volatile') {
      risks.push('Elevated volatility increases the risk of sudden adverse moves.');
    }

    if (sentiment === 'bearish') {
      risks.push('Negative sentiment may accelerate selling pressure.');
    }

    // Scan headlines for risk keywords
    const riskPatterns = [
      /\brecession/i, /\bdefault/i, /\bcrisis/i, /\bsanction/i,
      /\bwar\b/i, /\bbankrupt/i, /\bdowngrade/i, /\bcollapse/i,
    ];
    for (const headline of headlines) {
      for (const pattern of riskPatterns) {
        if (pattern.test(headline) && risks.length < 5) {
          risks.push(`Risk signal detected: "${headline}"`);
          break;
        }
      }
    }

    if (risks.length === 0) {
      risks.push('No significant risk signals detected in current data.');
    }

    return risks;
  }

  /** Identify potential opportunities from the current market state. */
  private identifyOpportunities(
    sentiment: MarketSummary['overallSentiment'],
    trend: MarketSummary['trendDirection'],
    headlines: string[],
  ): string[] {
    const opportunities: string[] = [];

    if (sentiment === 'bullish' && trend === 'up') {
      opportunities.push('Aligned bullish sentiment and uptrend favor trend-following strategies.');
    }

    if (sentiment === 'bearish' && trend === 'down') {
      opportunities.push('Bearish conditions may present short-selling or hedging opportunities.');
    }

    if (sentiment === 'neutral') {
      opportunities.push('Neutral sentiment suggests range-bound strategies may be effective.');
    }

    // Scan headlines for opportunity keywords
    const oppPatterns = [
      /\bbreakout/i, /\bIPO\b/i, /\binnovation/i, /\bgrowth/i,
      /\bupgrade/i, /\brecovery/i, /\bexpansion/i,
    ];
    for (const headline of headlines) {
      for (const pattern of oppPatterns) {
        if (pattern.test(headline) && opportunities.length < 5) {
          opportunities.push(`Opportunity signal: "${headline}"`);
          break;
        }
      }
    }

    if (opportunities.length === 0) {
      opportunities.push('No clear opportunities identified — monitor for emerging catalysts.');
    }

    return opportunities;
  }
}
