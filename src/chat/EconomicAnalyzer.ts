/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          📊  E C O N O M I C   A N A L Y Z E R                              ║
 * ║                                                                             ║
 * ║   Comprehensive economic analysis and forecasting:                          ║
 * ║     analyze → forecast → model → report                                     ║
 * ║                                                                             ║
 * ║     • Track GDP, inflation, unemployment, interest rates                    ║
 * ║     • Business cycle detection (expansion → peak → contraction → trough)    ║
 * ║     • Monetary & fiscal policy impact analysis                              ║
 * ║     • Multi-factor inflation forecasting                                    ║
 * ║     • Currency & yield curve analysis                                       ║
 * ║     • Sector-level economic condition assessment                            ║
 * ║     • Macroeconomic what-if scenario modeling                               ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface EconomicAnalyzerConfig {
  forecastHorizon: number;
  confidenceLevel: number;
  inflationTarget: number;
  neutralRate: number;
  maxIndicators: number;
  scenarioIterations: number;
  enableLearning: boolean;
  outputGapWeight: number;
  monetaryBaseWeight: number;
  velocityWeight: number;
}

export interface EconomicAnalyzerStats {
  totalAnalyses: number;
  totalForecasts: number;
  totalScenarios: number;
  avgAccuracy: number;
  feedbackCount: number;
  feedbackAccuracy: number;
  cyclesDetected: number;
  reportsGenerated: number;
}

export interface EconomicIndicator {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  percentChange: number;
  trend: 'rising' | 'falling' | 'stable';
  date: string;
}

export interface EconomicSnapshot {
  indicators: EconomicIndicator[];
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  interestRate: number;
  timestamp: number;
}

export interface BusinessCycle {
  phase: 'expansion' | 'peak' | 'contraction' | 'trough';
  confidence: number;
  duration: number;
  indicators: EconomicIndicator[];
}

export interface MonetaryPolicyAnalysis {
  currentRate: number;
  expectedChange: number;
  stance: 'hawkish' | 'dovish' | 'neutral';
  qeStatus: 'expanding' | 'tapering' | 'tightening' | 'none';
  forwardGuidance: string;
  impact: string[];
}

export interface FiscalPolicyAnalysis {
  spending: number;
  revenue: number;
  deficit: number;
  debtToGdp: number;
  stimulus: boolean;
  austerity: boolean;
  impact: string[];
}

export interface InflationForecast {
  current: number;
  forecast: number[];
  factors: string[];
  confidence: number;
  methodology: string;
}

export interface CurrencyAnalysis {
  pair: string;
  rate: number;
  pppRate: number;
  overvalued: boolean;
  interestDifferential: number;
  forecast: number;
  factors: string[];
}

export interface YieldCurveAnalysis {
  shortRate: number;
  longRate: number;
  spread: number;
  shape: 'normal' | 'inverted' | 'flat';
  recessionProbability: number;
  implications: string[];
}

export interface EconomicReport {
  title: string;
  date: string;
  summary: string;
  outlook: 'bullish' | 'neutral' | 'bearish';
  keyFindings: string[];
  risks: string[];
  opportunities: string[];
  sectors: SectorAnalysis[];
}

export interface SectorAnalysis {
  sector: string;
  conditions: 'strong' | 'moderate' | 'weak';
  growth: number;
  employment: number;
  outlook: 'positive' | 'neutral' | 'negative';
  risks: string[];
}

export interface MacroScenario {
  name: string;
  assumptions: string[];
  impacts: string[];
  probability: number;
  gdpEffect: number;
  inflationEffect: number;
  employmentEffect: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: EconomicAnalyzerConfig = {
  forecastHorizon: 4,
  confidenceLevel: 0.85,
  inflationTarget: 2.0,
  neutralRate: 2.5,
  maxIndicators: 50,
  scenarioIterations: 100,
  enableLearning: true,
  outputGapWeight: 0.4,
  monetaryBaseWeight: 0.35,
  velocityWeight: 0.25,
};

// ── Sector Definitions ──────────────────────────────────────────────────────

const _SECTORS = [
  'technology', 'healthcare', 'energy', 'finance',
  'consumer_discretionary', 'consumer_staples', 'industrials',
  'materials', 'real_estate', 'utilities', 'communications',
] as const;

// ── Sector Sensitivity Profiles ─────────────────────────────────────────────

interface SectorProfile {
  sector: string;
  ratesSensitivity: number;
  inflationSensitivity: number;
  gdpSensitivity: number;
  cyclicality: number;
  baseGrowth: number;
  baseEmployment: number;
}

function buildSectorProfiles(): SectorProfile[] {
  return [
    { sector: 'technology', ratesSensitivity: -0.6, inflationSensitivity: -0.3, gdpSensitivity: 1.2, cyclicality: 0.8, baseGrowth: 5.0, baseEmployment: 3.2 },
    { sector: 'healthcare', ratesSensitivity: -0.2, inflationSensitivity: -0.4, gdpSensitivity: 0.4, cyclicality: 0.2, baseGrowth: 3.5, baseEmployment: 4.1 },
    { sector: 'energy', ratesSensitivity: -0.3, inflationSensitivity: 0.5, gdpSensitivity: 0.9, cyclicality: 0.9, baseGrowth: 2.0, baseEmployment: 1.5 },
    { sector: 'finance', ratesSensitivity: 0.7, inflationSensitivity: -0.2, gdpSensitivity: 1.0, cyclicality: 0.7, baseGrowth: 3.0, baseEmployment: 2.8 },
    { sector: 'consumer_discretionary', ratesSensitivity: -0.5, inflationSensitivity: -0.6, gdpSensitivity: 1.3, cyclicality: 1.0, baseGrowth: 2.5, baseEmployment: 5.0 },
    { sector: 'consumer_staples', ratesSensitivity: -0.1, inflationSensitivity: -0.3, gdpSensitivity: 0.2, cyclicality: 0.1, baseGrowth: 1.5, baseEmployment: 3.8 },
    { sector: 'industrials', ratesSensitivity: -0.4, inflationSensitivity: -0.3, gdpSensitivity: 1.1, cyclicality: 0.85, baseGrowth: 2.0, baseEmployment: 4.5 },
    { sector: 'materials', ratesSensitivity: -0.3, inflationSensitivity: 0.2, gdpSensitivity: 1.0, cyclicality: 0.9, baseGrowth: 1.8, baseEmployment: 1.2 },
    { sector: 'real_estate', ratesSensitivity: -0.9, inflationSensitivity: -0.4, gdpSensitivity: 0.7, cyclicality: 0.6, baseGrowth: 2.5, baseEmployment: 2.0 },
    { sector: 'utilities', ratesSensitivity: -0.5, inflationSensitivity: -0.1, gdpSensitivity: 0.1, cyclicality: 0.05, baseGrowth: 1.0, baseEmployment: 1.0 },
    { sector: 'communications', ratesSensitivity: -0.4, inflationSensitivity: -0.2, gdpSensitivity: 0.8, cyclicality: 0.5, baseGrowth: 3.0, baseEmployment: 2.5 },
  ];
}

// ── Scenario Templates ──────────────────────────────────────────────────────

interface ScenarioTemplate {
  name: string;
  rateShock: number;
  gdpShock: number;
  inflationShock: number;
  employmentShock: number;
  baseProbability: number;
  assumptions: string[];
}

function buildScenarioTemplates(): ScenarioTemplate[] {
  return [
    {
      name: 'rate_hike',
      rateShock: 0.5, gdpShock: -0.3, inflationShock: -0.4, employmentShock: -0.2,
      baseProbability: 0.35,
      assumptions: ['Central bank raises rates by 50bp', 'Credit conditions tighten', 'Borrowing costs rise'],
    },
    {
      name: 'rate_cut',
      rateShock: -0.5, gdpShock: 0.3, inflationShock: 0.2, employmentShock: 0.15,
      baseProbability: 0.25,
      assumptions: ['Central bank cuts rates by 50bp', 'Credit conditions ease', 'Borrowing costs fall'],
    },
    {
      name: 'recession',
      rateShock: -1.0, gdpShock: -2.5, inflationShock: -1.0, employmentShock: -2.0,
      baseProbability: 0.15,
      assumptions: ['GDP contracts for two consecutive quarters', 'Consumer spending declines', 'Business investment falls sharply'],
    },
    {
      name: 'boom',
      rateShock: 0.75, gdpShock: 2.0, inflationShock: 1.5, employmentShock: 1.5,
      baseProbability: 0.10,
      assumptions: ['Strong GDP expansion above trend', 'Consumer confidence surges', 'Business investment accelerates'],
    },
    {
      name: 'stagflation',
      rateShock: 0.25, gdpShock: -1.0, inflationShock: 2.5, employmentShock: -1.5,
      baseProbability: 0.08,
      assumptions: ['Supply-side inflation shock', 'Economic growth stalls', 'Unemployment rises with high inflation'],
    },
    {
      name: 'deflation',
      rateShock: -0.75, gdpShock: -1.5, inflationShock: -2.0, employmentShock: -1.0,
      baseProbability: 0.05,
      assumptions: ['Persistent price declines', 'Demand collapses', 'Debt burden rises in real terms'],
    },
    {
      name: 'supply_shock',
      rateShock: 0.25, gdpShock: -0.8, inflationShock: 3.0, employmentShock: -0.5,
      baseProbability: 0.12,
      assumptions: ['Major supply chain disruption', 'Commodity prices spike', 'Production bottlenecks persist'],
    },
    {
      name: 'fiscal_stimulus',
      rateShock: 0.15, gdpShock: 1.5, inflationShock: 0.8, employmentShock: 1.0,
      baseProbability: 0.20,
      assumptions: ['Government increases spending significantly', 'Tax cuts boost disposable income', 'Deficit widens'],
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

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: mean(values) };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope: round4(slope), intercept: round4(intercept) };
}

function determineTrend(current: number, previous: number, threshold = 0.1): 'rising' | 'falling' | 'stable' {
  const pctChange = previous !== 0 ? Math.abs((current - previous) / previous) * 100 : 0;
  if (pctChange < threshold) return 'stable';
  return current > previous ? 'rising' : 'falling';
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function generateId(): string {
  return `ea-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Taylor Rule ─────────────────────────────────────────────────────────────

function taylorRule(
  neutralRate: number,
  inflation: number,
  inflationTarget: number,
  outputGap: number,
): number {
  // r = r* + π + 0.5(π − π*) + 0.5(y − y*)
  return round2(neutralRate + inflation + 0.5 * (inflation - inflationTarget) + 0.5 * outputGap);
}

// ── Quantity Theory Forecast ────────────────────────────────────────────────

function quantityTheoryInflation(
  monetaryBaseGrowth: number,
  velocityChange: number,
  realGdpGrowth: number,
): number {
  // ΔP ≈ ΔM + ΔV − ΔY
  return round2(monetaryBaseGrowth + velocityChange - realGdpGrowth);
}

// ── Purchasing Power Parity ─────────────────────────────────────────────────

function computePPPRate(
  baseRate: number,
  domesticInflation: number,
  foreignInflation: number,
): number {
  // PPP: S1 = S0 × (1 + πd) / (1 + πf)
  return round4(baseRate * (1 + domesticInflation / 100) / (1 + foreignInflation / 100));
}

// ── Uncovered Interest Rate Parity ──────────────────────────────────────────

function interestRateParity(
  spotRate: number,
  domesticRate: number,
  foreignRate: number,
): number {
  // F = S × (1 + rd) / (1 + rf)
  return round4(spotRate * (1 + domesticRate / 100) / (1 + foreignRate / 100));
}

// ── Yield Curve Recession Model ─────────────────────────────────────────────

function recessionProbabilityFromSpread(spread: number): number {
  // Probit-style approximation based on 10y-2y spread
  // Negative spreads → higher recession probability
  const z = -1.5 * spread + 0.5;
  const prob = 1 / (1 + Math.exp(-z));
  return round2(clamp(prob, 0, 1));
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class EconomicAnalyzer {
  private readonly config: EconomicAnalyzerConfig;
  private readonly sectorProfiles: SectorProfile[];
  private readonly scenarioTemplates: ScenarioTemplate[];
  private totalAnalyses = 0;
  private totalForecasts = 0;
  private totalScenarios = 0;
  private cyclesDetected = 0;
  private reportsGenerated = 0;
  private accuracyHistory: number[] = [];
  private feedbackCorrect = 0;
  private feedbackTotal = 0;
  private snapshotHistory: EconomicSnapshot[] = [];
  private analysisLog: Array<{ id: string; type: string; timestamp: number }> = [];

  constructor(config?: Partial<EconomicAnalyzerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sectorProfiles = buildSectorProfiles();
    this.scenarioTemplates = buildScenarioTemplates();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /** Analyze a set of economic indicators from a snapshot. */
  analyzeIndicators(snapshot: EconomicSnapshot): EconomicIndicator[] {
    this.totalAnalyses++;
    this.storeSnapshot(snapshot);

    const indicators: EconomicIndicator[] = [];
    const date = formatDate(snapshot.timestamp);

    // Core macro indicators from snapshot fields
    const coreMetrics: Array<{ name: string; value: number; prev: number }> = [
      { name: 'GDP Growth', value: snapshot.gdpGrowth, prev: this.getPreviousValue('GDP Growth', snapshot.gdpGrowth) },
      { name: 'Inflation (CPI)', value: snapshot.inflation, prev: this.getPreviousValue('Inflation (CPI)', snapshot.inflation) },
      { name: 'Unemployment Rate', value: snapshot.unemployment, prev: this.getPreviousValue('Unemployment Rate', snapshot.unemployment) },
      { name: 'Interest Rate', value: snapshot.interestRate, prev: this.getPreviousValue('Interest Rate', snapshot.interestRate) },
    ];

    for (const m of coreMetrics) {
      const change = round2(m.value - m.prev);
      const percentChange = m.prev !== 0 ? round2((change / Math.abs(m.prev)) * 100) : 0;
      indicators.push({
        name: m.name,
        value: m.value,
        previousValue: m.prev,
        change,
        percentChange,
        trend: determineTrend(m.value, m.prev),
        date,
      });
    }

    // Derived indicators
    const realRate = round2(snapshot.interestRate - snapshot.inflation);
    const prevRealRate = indicators.length >= 4
      ? round2(indicators[3].previousValue - indicators[1].previousValue)
      : realRate;
    indicators.push({
      name: 'Real Interest Rate',
      value: realRate,
      previousValue: prevRealRate,
      change: round2(realRate - prevRealRate),
      percentChange: prevRealRate !== 0 ? round2(((realRate - prevRealRate) / Math.abs(prevRealRate)) * 100) : 0,
      trend: determineTrend(realRate, prevRealRate),
      date,
    });

    const miseryIndex = round2(snapshot.inflation + snapshot.unemployment);
    const prevMisery = indicators.length >= 3
      ? round2(indicators[1].previousValue + indicators[2].previousValue)
      : miseryIndex;
    indicators.push({
      name: 'Misery Index',
      value: miseryIndex,
      previousValue: prevMisery,
      change: round2(miseryIndex - prevMisery),
      percentChange: prevMisery !== 0 ? round2(((miseryIndex - prevMisery) / Math.abs(prevMisery)) * 100) : 0,
      trend: determineTrend(miseryIndex, prevMisery),
      date,
    });

    // Include any custom indicators from the snapshot
    for (const ind of snapshot.indicators) {
      if (!indicators.some(i => i.name === ind.name)) {
        indicators.push({ ...ind, date: ind.date || date });
      }
    }

    this.logAnalysis('indicators');
    return indicators;
  }

  /** Detect the current business cycle phase from sequential snapshots. */
  detectBusinessCycle(snapshots: EconomicSnapshot[]): BusinessCycle {
    this.totalAnalyses++;
    this.cyclesDetected++;

    if (snapshots.length === 0) {
      return { phase: 'expansion', confidence: 0.1, duration: 0, indicators: [] };
    }

    for (const s of snapshots) this.storeSnapshot(s);

    const gdpValues = snapshots.map(s => s.gdpGrowth);
    const inflationValues = snapshots.map(s => s.inflation);
    const unemploymentValues = snapshots.map(s => s.unemployment);
    const _rateValues = snapshots.map(s => s.interestRate);

    const gdpTrend = linearRegression(gdpValues);
    const inflTrend = linearRegression(inflationValues);
    const unempTrend = linearRegression(unemploymentValues);

    const latest = snapshots[snapshots.length - 1];
    const date = formatDate(latest.timestamp);

    // Scoring: each indicator contributes to phase detection
    let expansionScore = 0;
    let contractionScore = 0;

    // GDP trend
    if (gdpTrend.slope > 0.1) expansionScore += 2;
    else if (gdpTrend.slope < -0.1) contractionScore += 2;

    // GDP level
    if (latest.gdpGrowth > 2.0) expansionScore += 1.5;
    else if (latest.gdpGrowth < 0) contractionScore += 2;
    else if (latest.gdpGrowth < 1.0) contractionScore += 0.5;

    // Unemployment trend
    if (unempTrend.slope < -0.05) expansionScore += 1.5;
    else if (unempTrend.slope > 0.1) contractionScore += 1.5;

    // Unemployment level
    if (latest.unemployment < 4.5) expansionScore += 1;
    else if (latest.unemployment > 7.0) contractionScore += 1.5;

    // Inflation trend (moderate rising = expansion, deflation = contraction)
    if (inflTrend.slope > 0 && latest.inflation > 0 && latest.inflation < 5) expansionScore += 0.5;
    else if (latest.inflation < 0) contractionScore += 1;
    else if (latest.inflation > 6) contractionScore += 0.5;

    const total = expansionScore + contractionScore;
    const expansionRatio = total > 0 ? expansionScore / total : 0.5;

    // Determine phase and whether it's a turning point
    let phase: BusinessCycle['phase'];
    let confidence: number;

    if (expansionRatio > 0.7) {
      // Check if slowing (peak detection)
      if (gdpTrend.slope < 0 && latest.gdpGrowth > 2.0) {
        phase = 'peak';
        confidence = round2(0.5 + (1 - expansionRatio) * 0.5);
      } else {
        phase = 'expansion';
        confidence = round2(0.4 + expansionRatio * 0.5);
      }
    } else if (expansionRatio < 0.3) {
      // Check if improving (trough detection)
      if (gdpTrend.slope > 0 && latest.gdpGrowth < 1.0) {
        phase = 'trough';
        confidence = round2(0.5 + expansionRatio * 0.5);
      } else {
        phase = 'contraction';
        confidence = round2(0.4 + (1 - expansionRatio) * 0.5);
      }
    } else {
      // Transitional — check direction
      if (gdpTrend.slope > 0) {
        phase = 'trough';
        confidence = round2(0.3 + expansionRatio * 0.3);
      } else {
        phase = 'peak';
        confidence = round2(0.3 + (1 - expansionRatio) * 0.3);
      }
    }

    const duration = snapshots.length;

    const indicators: EconomicIndicator[] = [
      { name: 'GDP Growth', value: latest.gdpGrowth, previousValue: gdpValues[0], change: round2(latest.gdpGrowth - gdpValues[0]), percentChange: round2(gdpTrend.slope * 100), trend: gdpTrend.slope > 0.05 ? 'rising' : gdpTrend.slope < -0.05 ? 'falling' : 'stable', date },
      { name: 'Unemployment', value: latest.unemployment, previousValue: unemploymentValues[0], change: round2(latest.unemployment - unemploymentValues[0]), percentChange: round2(unempTrend.slope * 100), trend: unempTrend.slope > 0.05 ? 'rising' : unempTrend.slope < -0.05 ? 'falling' : 'stable', date },
      { name: 'Inflation', value: latest.inflation, previousValue: inflationValues[0], change: round2(latest.inflation - inflationValues[0]), percentChange: round2(inflTrend.slope * 100), trend: inflTrend.slope > 0.05 ? 'rising' : inflTrend.slope < -0.05 ? 'falling' : 'stable', date },
    ];

    this.accuracyHistory.push(confidence);
    this.logAnalysis('business_cycle');
    return { phase, confidence, duration, indicators };
  }

  /** Analyze monetary policy stance and expected path. */
  analyzeMonetaryPolicy(
    currentRate: number,
    inflation: number,
    unemployment: number,
    gdpGrowth: number,
    monetaryBaseGrowth?: number,
  ): MonetaryPolicyAnalysis {
    this.totalAnalyses++;

    const outputGap = round2(gdpGrowth - 2.5);
    const impliedRate = taylorRule(this.config.neutralRate, inflation, this.config.inflationTarget, outputGap);
    const rateGap = round2(impliedRate - currentRate);

    // Determine stance
    let stance: MonetaryPolicyAnalysis['stance'];
    if (rateGap > 0.5) stance = 'hawkish';
    else if (rateGap < -0.5) stance = 'dovish';
    else stance = 'neutral';

    // Expected rate change
    const expectedChange = round2(clamp(rateGap * 0.4, -1.0, 1.0));

    // QE status inference
    let qeStatus: MonetaryPolicyAnalysis['qeStatus'] = 'none';
    if (monetaryBaseGrowth !== undefined) {
      if (monetaryBaseGrowth > 10) qeStatus = 'expanding';
      else if (monetaryBaseGrowth > 0 && monetaryBaseGrowth <= 10) qeStatus = 'tapering';
      else if (monetaryBaseGrowth < 0) qeStatus = 'tightening';
    } else if (currentRate <= 0.25 && gdpGrowth < 1.0) {
      qeStatus = 'expanding';
    }

    // Forward guidance
    let forwardGuidance: string;
    if (stance === 'hawkish') {
      forwardGuidance = inflation > this.config.inflationTarget + 1
        ? 'Rates expected to rise until inflation returns to target. Tightening cycle likely continues.'
        : 'Gradual tightening expected. Central bank monitoring inflation indicators closely.';
    } else if (stance === 'dovish') {
      forwardGuidance = gdpGrowth < 0
        ? 'Accommodative stance expected to persist. Further easing possible if conditions deteriorate.'
        : 'Current accommodative stance maintained. Normalization begins when recovery firms.';
    } else {
      forwardGuidance = 'Policy rate near equilibrium. Data-dependent approach with no immediate changes expected.';
    }

    // Impact assessment
    const impact: string[] = [];
    if (expectedChange > 0.25) {
      impact.push('Higher borrowing costs will slow consumer spending and business investment');
      impact.push('Mortgage rates likely to rise, cooling housing market');
      impact.push('Currency may appreciate on higher yields');
    } else if (expectedChange < -0.25) {
      impact.push('Lower borrowing costs will stimulate spending and investment');
      impact.push('Mortgage rates likely to decline, supporting housing');
      impact.push('Currency may depreciate on lower yields');
    } else {
      impact.push('Stable rates support current economic trajectory');
    }

    if (qeStatus === 'expanding') {
      impact.push('Quantitative easing adds liquidity, suppresses long-term yields');
    } else if (qeStatus === 'tightening') {
      impact.push('Quantitative tightening reduces liquidity, may push long-term yields higher');
    }

    if (inflation > this.config.inflationTarget + 2) {
      impact.push('Elevated inflation erodes purchasing power and may anchor expectations higher');
    }

    this.logAnalysis('monetary_policy');
    return { currentRate, expectedChange, stance, qeStatus, forwardGuidance, impact };
  }

  /** Analyze fiscal policy and its economic impact. */
  analyzeFiscalPolicy(
    spending: number,
    revenue: number,
    gdp: number,
    debt: number,
    previousSpending?: number,
    previousRevenue?: number,
  ): FiscalPolicyAnalysis {
    this.totalAnalyses++;

    const deficit = round2(spending - revenue);
    const debtToGdp = gdp > 0 ? round2((debt / gdp) * 100) : 0;

    const spendingChange = previousSpending !== undefined ? round2(spending - previousSpending) : 0;
    const revenueChange = previousRevenue !== undefined ? round2(revenue - previousRevenue) : 0;

    const stimulus = spendingChange > 0 && (deficit > 0 || spendingChange > revenueChange);
    const austerity = spendingChange < 0 || (revenueChange > 0 && spendingChange <= 0);

    const impact: string[] = [];

    // Deficit analysis
    const deficitToGdp = gdp > 0 ? round2((deficit / gdp) * 100) : 0;
    if (deficitToGdp > 5) {
      impact.push(`Large fiscal deficit (${deficitToGdp}% of GDP) may crowd out private investment`);
      impact.push('Bond supply increases may push yields higher');
    } else if (deficitToGdp > 3) {
      impact.push(`Moderate fiscal deficit (${deficitToGdp}% of GDP) provides economic stimulus`);
    } else if (deficitToGdp < 0) {
      impact.push(`Fiscal surplus (${Math.abs(deficitToGdp)}% of GDP) reduces debt burden`);
    }

    // Debt sustainability
    if (debtToGdp > 100) {
      impact.push(`High debt-to-GDP ratio (${debtToGdp}%) raises sustainability concerns`);
      impact.push('Debt servicing costs consume growing share of revenue');
    } else if (debtToGdp > 60) {
      impact.push(`Elevated debt-to-GDP (${debtToGdp}%) warrants fiscal prudence`);
    } else {
      impact.push(`Manageable debt-to-GDP ratio (${debtToGdp}%) provides fiscal space`);
    }

    // Stimulus/austerity effects
    if (stimulus) {
      impact.push('Expansionary fiscal policy boosts aggregate demand');
      impact.push('Fiscal multiplier effects support GDP growth');
    }
    if (austerity) {
      impact.push('Contractionary fiscal policy may dampen short-term growth');
      impact.push('Deficit reduction improves long-term fiscal sustainability');
    }

    this.logAnalysis('fiscal_policy');
    return { spending, revenue, deficit, debtToGdp, stimulus, austerity, impact };
  }

  /** Forecast inflation using multiple factors. */
  forecastInflation(
    currentInflation: number,
    monetaryBaseGrowth: number,
    velocityChange: number,
    realGdpGrowth: number,
    outputGap?: number,
    inflationExpectations?: number,
  ): InflationForecast {
    this.totalForecasts++;

    const factors: string[] = [];
    const forecast: number[] = [];
    const horizon = this.config.forecastHorizon;

    // Quantity theory component
    const qtInflation = quantityTheoryInflation(monetaryBaseGrowth, velocityChange, realGdpGrowth);
    factors.push(`Monetary factors (M2 growth ${monetaryBaseGrowth}%, velocity Δ${velocityChange}%) imply ${qtInflation}% inflation`);

    // Output gap component
    const gap = outputGap ?? (realGdpGrowth - 2.5);
    const phillipsCurveEffect = round2(gap * 0.3);
    factors.push(`Output gap of ${round2(gap)}% contributes ${phillipsCurveEffect}pp via Phillips curve`);

    // Expectations anchoring
    const expectations = inflationExpectations ?? this.config.inflationTarget;
    const expectationsEffect = round2((expectations - currentInflation) * 0.2);
    factors.push(`Inflation expectations at ${expectations}% provide ${expectationsEffect > 0 ? 'upward' : 'downward'} pull`);

    // Weighted forecast
    const w = this.config;
    const baseProjection = round2(
      currentInflation * 0.3 +
      qtInflation * w.monetaryBaseWeight +
      (currentInflation + phillipsCurveEffect) * w.outputGapWeight +
      expectations * w.velocityWeight,
    );

    // Generate forecast path with mean-reversion toward target
    for (let q = 1; q <= horizon; q++) {
      const reversion = (this.config.inflationTarget - baseProjection) * (q / (horizon * 3));
      const noise = (Math.sin(q * 1.7) * 0.15);
      const periodForecast = round2(baseProjection + reversion + noise);
      forecast.push(periodForecast);
    }

    // Persistence: high current inflation is sticky
    if (currentInflation > this.config.inflationTarget + 2) {
      factors.push('Elevated current inflation exhibits persistence — adjustment may be gradual');
    } else if (currentInflation < this.config.inflationTarget - 1) {
      factors.push('Below-target inflation suggests disinflationary pressures');
    }

    // Confidence based on factor alignment
    const factorValues = [qtInflation, currentInflation + phillipsCurveEffect, expectations];
    const factorStddev = stddev(factorValues);
    const confidence = round2(clamp(0.9 - factorStddev * 0.1, 0.3, 0.95));

    this.accuracyHistory.push(confidence);
    this.logAnalysis('inflation_forecast');

    return {
      current: currentInflation,
      forecast,
      factors,
      confidence,
      methodology: 'Weighted combination of quantity theory (MV=PY), Phillips curve output gap, and expectations anchoring',
    };
  }

  /** Analyze currency valuation and expected movement. */
  analyzeCurrency(
    pair: string,
    spotRate: number,
    domesticRate: number,
    foreignRate: number,
    domesticInflation: number,
    foreignInflation: number,
  ): CurrencyAnalysis {
    this.totalAnalyses++;

    const pppRate = computePPPRate(spotRate, domesticInflation, foreignInflation);
    const irpForecast = interestRateParity(spotRate, domesticRate, foreignRate);
    const interestDifferential = round2(domesticRate - foreignRate);

    const overvalued = spotRate > pppRate * 1.02;
    const undervalued = spotRate < pppRate * 0.98;

    // Weighted forecast combining PPP and IRP
    const forecast = round4(pppRate * 0.4 + irpForecast * 0.4 + spotRate * 0.2);

    const factors: string[] = [];

    // PPP analysis
    const pppDeviation = round2(((spotRate - pppRate) / pppRate) * 100);
    if (overvalued) {
      factors.push(`Overvalued by ${Math.abs(pppDeviation)}% relative to PPP (${pppRate})`);
    } else if (undervalued) {
      factors.push(`Undervalued by ${Math.abs(pppDeviation)}% relative to PPP (${pppRate})`);
    } else {
      factors.push(`Near fair value based on PPP (${pppRate})`);
    }

    // Interest rate differential
    if (interestDifferential > 1) {
      factors.push(`Positive rate differential (${interestDifferential}pp) attracts capital, supporting domestic currency`);
    } else if (interestDifferential < -1) {
      factors.push(`Negative rate differential (${interestDifferential}pp) may weaken domestic currency`);
    } else {
      factors.push(`Narrow rate differential (${interestDifferential}pp) has limited currency impact`);
    }

    // Inflation differential
    const inflationDiff = round2(domesticInflation - foreignInflation);
    if (inflationDiff > 1) {
      factors.push(`Higher domestic inflation (${inflationDiff}pp above foreign) pressures currency downward over time`);
    } else if (inflationDiff < -1) {
      factors.push(`Lower domestic inflation supports purchasing power and currency valuation`);
    }

    // IRP vs spot analysis
    if (Math.abs(irpForecast - spotRate) / spotRate > 0.02) {
      const irpDirection = irpForecast > spotRate ? 'depreciation' : 'appreciation';
      factors.push(`Interest rate parity implies ${irpDirection} to ${irpForecast}`);
    }

    this.logAnalysis('currency');
    return { pair, rate: spotRate, pppRate, overvalued, interestDifferential, forecast, factors };
  }

  /** Analyze yield curve shape and recession implications. */
  analyzeYieldCurve(
    shortRate: number,
    longRate: number,
    mediumRate?: number,
  ): YieldCurveAnalysis {
    this.totalAnalyses++;

    const spread = round2(longRate - shortRate);

    // Shape classification
    let shape: YieldCurveAnalysis['shape'];
    if (spread > 0.25) shape = 'normal';
    else if (spread < -0.1) shape = 'inverted';
    else shape = 'flat';

    const recessionProbability = recessionProbabilityFromSpread(spread);

    const implications: string[] = [];

    if (shape === 'normal') {
      implications.push('Normal yield curve suggests economic expansion expectations');
      implications.push(`Positive term premium (${spread}pp) reflects healthy growth outlook`);
      if (spread > 2.0) {
        implications.push('Steep curve favors bank profitability (borrow short, lend long)');
      }
    } else if (shape === 'inverted') {
      implications.push(`Inverted yield curve (spread: ${spread}pp) is a historically reliable recession indicator`);
      implications.push(`Recession probability estimated at ${round2(recessionProbability * 100)}%`);
      implications.push('Markets expect future rate cuts — pricing in economic slowdown');
      if (spread < -0.5) {
        implications.push('Deep inversion signals strong market conviction of imminent downturn');
      }
    } else {
      implications.push('Flat yield curve signals economic uncertainty and potential transition');
      implications.push(`Recession probability elevated at ${round2(recessionProbability * 100)}%`);
      implications.push('Minimal compensation for duration risk may reduce lending appetite');
    }

    // Medium-rate hump analysis
    if (mediumRate !== undefined) {
      const shortMidSpread = round2(mediumRate - shortRate);
      const midLongSpread = round2(longRate - mediumRate);
      if (shortMidSpread > 0 && midLongSpread < 0) {
        implications.push('Humped yield curve: near-term rate hikes expected, followed by economic softening');
      } else if (shortMidSpread < 0 && midLongSpread > 0) {
        implications.push('Trough in middle maturities suggests near-term easing with longer-term normalization');
      }
    }

    // Policy implications
    if (shortRate > longRate + 0.5) {
      implications.push('Short rates above long rates suggest monetary policy is restrictive');
    } else if (shortRate < 1.0 && longRate < 2.0) {
      implications.push('Low rates across the curve indicate accommodative monetary environment');
    }

    this.logAnalysis('yield_curve');
    return { shortRate, longRate, spread, shape, recessionProbability, implications };
  }

  /** Generate a comprehensive economic outlook report. */
  generateReport(
    snapshots: EconomicSnapshot[],
    title?: string,
  ): EconomicReport {
    this.totalAnalyses++;
    this.reportsGenerated++;

    if (snapshots.length === 0) {
      return this.emptyReport(title);
    }

    for (const s of snapshots) this.storeSnapshot(s);

    const latest = snapshots[snapshots.length - 1];
    const date = formatDate(latest.timestamp);
    const reportTitle = title ?? `Economic Outlook Report — ${date}`;

    // Run sub-analyses
    const cycle = this.detectBusinessCycle(snapshots);
    const _indicators = this.analyzeIndicators(latest);
    const yieldCurve = latest.interestRate > 0
      ? this.analyzeYieldCurve(latest.interestRate, latest.interestRate + 1.5)
      : undefined;

    // Determine overall outlook
    let outlook: EconomicReport['outlook'];
    const gdpPositive = latest.gdpGrowth > 1.5;
    const inflationControlled = latest.inflation < this.config.inflationTarget + 2;
    const unemploymentLow = latest.unemployment < 6.0;

    const positiveSignals = [gdpPositive, inflationControlled, unemploymentLow].filter(Boolean).length;
    if (positiveSignals >= 3) outlook = 'bullish';
    else if (positiveSignals <= 1) outlook = 'bearish';
    else outlook = 'neutral';

    // Key findings
    const keyFindings: string[] = [];
    keyFindings.push(`Economy is in ${cycle.phase} phase (confidence: ${round2(cycle.confidence * 100)}%)`);
    keyFindings.push(`GDP growth at ${latest.gdpGrowth}% — ${latest.gdpGrowth > 2.5 ? 'above' : latest.gdpGrowth > 0 ? 'below' : 'negative'} trend`);
    keyFindings.push(`Inflation at ${latest.inflation}% — ${latest.inflation > this.config.inflationTarget ? 'above' : 'at or below'} target`);
    keyFindings.push(`Unemployment at ${latest.unemployment}% — labor market is ${latest.unemployment < 4.5 ? 'tight' : latest.unemployment < 6.5 ? 'moderate' : 'soft'}`);

    if (snapshots.length > 1) {
      const gdpChange = round2(latest.gdpGrowth - snapshots[0].gdpGrowth);
      keyFindings.push(`GDP growth ${gdpChange > 0 ? 'improved' : 'declined'} by ${Math.abs(gdpChange)}pp over the period`);
    }

    // Risks
    const risks: string[] = [];
    if (latest.inflation > this.config.inflationTarget + 1) {
      risks.push('Persistent above-target inflation may force aggressive monetary tightening');
    }
    if (latest.gdpGrowth < 1.0) {
      risks.push('Below-trend growth raises recession concerns');
    }
    if (latest.unemployment > 6.0) {
      risks.push('Elevated unemployment signals labor market weakness');
    }
    if (yieldCurve && yieldCurve.shape === 'inverted') {
      risks.push(`Inverted yield curve signals ${round2(yieldCurve.recessionProbability * 100)}% recession probability`);
    }
    if (latest.interestRate > 5.0) {
      risks.push('High interest rates burden indebted households and businesses');
    }
    if (risks.length === 0) {
      risks.push('No major near-term risks identified; monitor for external shocks');
    }

    // Opportunities
    const opportunities: string[] = [];
    if (cycle.phase === 'trough' || cycle.phase === 'expansion') {
      opportunities.push('Cyclical recovery presents investment opportunities in growth-sensitive sectors');
    }
    if (latest.inflation < this.config.inflationTarget) {
      opportunities.push('Below-target inflation provides room for accommodative policy');
    }
    if (latest.unemployment < 4.0) {
      opportunities.push('Tight labor market supports wage growth and consumer spending');
    }
    if (latest.interestRate < 2.0) {
      opportunities.push('Low rates support asset valuations and refinancing activity');
    }
    if (opportunities.length === 0) {
      opportunities.push('Selective opportunities exist; focus on quality and fundamentals');
    }

    // Sector analysis
    const sectors: SectorAnalysis[] = [];
    for (const profile of this.sectorProfiles) {
      sectors.push(this.computeSectorAnalysis(profile, latest, cycle));
    }

    // Summary
    const summary =
      `The economy is in a ${cycle.phase} phase with GDP growth at ${latest.gdpGrowth}%, ` +
      `inflation at ${latest.inflation}%, and unemployment at ${latest.unemployment}%. ` +
      `The overall outlook is ${outlook}. ` +
      (outlook === 'bullish'
        ? 'Broad-based strength supports continued expansion.'
        : outlook === 'bearish'
          ? 'Multiple headwinds suggest caution.'
          : 'Mixed signals warrant a balanced approach.');

    this.logAnalysis('report');
    return { title: reportTitle, date, summary, outlook, keyFindings, risks, opportunities, sectors };
  }

  /** Analyze economic conditions for a specific sector. */
  analyzeSector(
    sector: string,
    gdpGrowth: number,
    inflation: number,
    unemployment: number,
    interestRate: number,
  ): SectorAnalysis {
    this.totalAnalyses++;

    const profile = this.sectorProfiles.find(p => p.sector === sector)
      ?? this.sectorProfiles.find(p => p.sector.includes(sector.toLowerCase()))
      ?? { sector, ratesSensitivity: -0.3, inflationSensitivity: -0.3, gdpSensitivity: 0.8, cyclicality: 0.5, baseGrowth: 2.0, baseEmployment: 2.5 };

    const snapshot: EconomicSnapshot = {
      indicators: [], gdpGrowth, inflation, unemployment, interestRate,
      timestamp: Date.now(),
    };

    const cycle = this.detectBusinessCycle([snapshot]);

    this.logAnalysis('sector');
    return this.computeSectorAnalysis(profile, snapshot, cycle);
  }

  /** Run a macroeconomic what-if scenario. */
  runScenario(
    name: string,
    baseSnapshot: EconomicSnapshot,
    customAssumptions?: string[],
  ): MacroScenario {
    this.totalScenarios++;

    // Find matching template
    const template = this.scenarioTemplates.find(
      t => t.name === name || name.toLowerCase().includes(t.name.replace(/_/g, ' ')),
    );

    if (template) {
      return this.applyScenarioTemplate(template, baseSnapshot, customAssumptions);
    }

    // Custom scenario: parse name for directional cues
    return this.buildCustomScenario(name, baseSnapshot, customAssumptions ?? []);
  }

  /** Provide feedback on a previous analysis. */
  provideFeedback(analysisId: string, accurate: boolean): void {
    if (!this.config.enableLearning) return;
    this.feedbackTotal++;
    if (accurate) this.feedbackCorrect++;

    const entry = this.analysisLog.find(e => e.id === analysisId);
    if (entry) {
      const accuracyValue = accurate ? 1.0 : 0.0;
      this.accuracyHistory.push(accuracyValue);
    }
  }

  /** Return aggregate statistics. */
  getStats(): Readonly<EconomicAnalyzerStats> {
    const avgAcc = this.accuracyHistory.length > 0
      ? this.accuracyHistory.reduce((s, v) => s + v, 0) / this.accuracyHistory.length
      : 0;

    return {
      totalAnalyses: this.totalAnalyses,
      totalForecasts: this.totalForecasts,
      totalScenarios: this.totalScenarios,
      avgAccuracy: round2(avgAcc),
      feedbackCount: this.feedbackTotal,
      feedbackAccuracy: this.feedbackTotal > 0
        ? round2(this.feedbackCorrect / this.feedbackTotal)
        : 0,
      cyclesDetected: this.cyclesDetected,
      reportsGenerated: this.reportsGenerated,
    };
  }

  /** Serialize the analyzer state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalAnalyses: this.totalAnalyses,
      totalForecasts: this.totalForecasts,
      totalScenarios: this.totalScenarios,
      cyclesDetected: this.cyclesDetected,
      reportsGenerated: this.reportsGenerated,
      accuracyHistory: this.accuracyHistory,
      feedbackCorrect: this.feedbackCorrect,
      feedbackTotal: this.feedbackTotal,
      snapshotHistory: this.snapshotHistory,
      analysisLog: this.analysisLog,
    });
  }

  /** Restore an EconomicAnalyzer from serialized JSON. */
  static deserialize(json: string): EconomicAnalyzer {
    const data = JSON.parse(json) as {
      config: EconomicAnalyzerConfig;
      totalAnalyses: number;
      totalForecasts: number;
      totalScenarios: number;
      cyclesDetected: number;
      reportsGenerated: number;
      accuracyHistory: number[];
      feedbackCorrect: number;
      feedbackTotal: number;
      snapshotHistory: EconomicSnapshot[];
      analysisLog: Array<{ id: string; type: string; timestamp: number }>;
    };

    const instance = new EconomicAnalyzer(data.config);
    instance.totalAnalyses = data.totalAnalyses;
    instance.totalForecasts = data.totalForecasts;
    instance.totalScenarios = data.totalScenarios;
    instance.cyclesDetected = data.cyclesDetected;
    instance.reportsGenerated = data.reportsGenerated;
    instance.accuracyHistory = data.accuracyHistory;
    instance.feedbackCorrect = data.feedbackCorrect;
    instance.feedbackTotal = data.feedbackTotal;
    instance.snapshotHistory = data.snapshotHistory ?? [];
    instance.analysisLog = data.analysisLog ?? [];
    return instance;
  }

  // ── Sector Analysis Internals ─────────────────────────────────────────

  /** Compute sector analysis from a profile and current conditions. */
  private computeSectorAnalysis(
    profile: SectorProfile,
    snapshot: EconomicSnapshot,
    cycle: BusinessCycle,
  ): SectorAnalysis {
    const rateEffect = (snapshot.interestRate - this.config.neutralRate) * profile.ratesSensitivity;
    const inflationEffect = (snapshot.inflation - this.config.inflationTarget) * profile.inflationSensitivity;
    const gdpEffect = (snapshot.gdpGrowth - 2.0) * profile.gdpSensitivity;
    const cyclicalEffect = this.cyclePhaseFactor(cycle.phase) * profile.cyclicality;

    const adjustedGrowth = round2(profile.baseGrowth + rateEffect + inflationEffect + gdpEffect + cyclicalEffect);
    const adjustedEmployment = round2(profile.baseEmployment + gdpEffect * 0.3 + cyclicalEffect * 0.5);

    // Conditions assessment
    let conditions: SectorAnalysis['conditions'];
    if (adjustedGrowth > profile.baseGrowth * 0.8) conditions = 'strong';
    else if (adjustedGrowth > 0) conditions = 'moderate';
    else conditions = 'weak';

    // Outlook
    let sectorOutlook: SectorAnalysis['outlook'];
    if (cycle.phase === 'expansion' && adjustedGrowth > 0) sectorOutlook = 'positive';
    else if (cycle.phase === 'contraction' && profile.cyclicality > 0.5) sectorOutlook = 'negative';
    else sectorOutlook = 'neutral';

    // Sector-specific risks
    const risks: string[] = [];
    if (profile.ratesSensitivity < -0.5 && snapshot.interestRate > this.config.neutralRate + 1) {
      risks.push('High sensitivity to elevated interest rates');
    }
    if (profile.cyclicality > 0.7 && (cycle.phase === 'contraction' || cycle.phase === 'peak')) {
      risks.push('High cyclicality exposes sector to downturn risk');
    }
    if (profile.inflationSensitivity < -0.4 && snapshot.inflation > this.config.inflationTarget + 2) {
      risks.push('Margin compression from elevated input costs');
    }
    if (adjustedGrowth < 0) {
      risks.push('Projected negative growth for the sector');
    }
    if (risks.length === 0) {
      risks.push('No elevated sector-specific risks identified');
    }

    return {
      sector: profile.sector,
      conditions,
      growth: adjustedGrowth,
      employment: adjustedEmployment,
      outlook: sectorOutlook,
      risks,
    };
  }

  /** Map cycle phase to a numeric factor for sector adjustments. */
  private cyclePhaseFactor(phase: BusinessCycle['phase']): number {
    switch (phase) {
      case 'expansion': return 1.5;
      case 'peak': return 0.5;
      case 'contraction': return -1.5;
      case 'trough': return -0.5;
    }
  }

  // ── Scenario Internals ────────────────────────────────────────────────

  /** Apply a predefined scenario template to a base snapshot. */
  private applyScenarioTemplate(
    template: ScenarioTemplate,
    base: EconomicSnapshot,
    customAssumptions?: string[],
  ): MacroScenario {
    const gdpEffect = round2(template.gdpShock + this.interactionEffect(base, template));
    const inflationEffect = round2(template.inflationShock);
    const employmentEffect = round2(template.employmentShock);

    // Adjust probability based on current conditions
    let probability = template.baseProbability;
    if (template.name === 'recession' && base.gdpGrowth < 1.0) probability = round2(probability + 0.15);
    if (template.name === 'boom' && base.gdpGrowth > 3.0) probability = round2(probability + 0.10);
    if (template.name === 'rate_hike' && base.inflation > this.config.inflationTarget + 1) probability = round2(probability + 0.20);
    if (template.name === 'rate_cut' && base.unemployment > 6.0) probability = round2(probability + 0.15);
    probability = round2(clamp(probability, 0.01, 0.95));

    const assumptions = customAssumptions && customAssumptions.length > 0
      ? [...template.assumptions, ...customAssumptions]
      : [...template.assumptions];

    const impacts = this.computeScenarioImpacts(template, base, gdpEffect, inflationEffect, employmentEffect);

    this.logAnalysis('scenario');
    return {
      name: template.name,
      assumptions,
      impacts,
      probability,
      gdpEffect,
      inflationEffect,
      employmentEffect,
    };
  }

  /** Compute interaction effects between the scenario shock and baseline conditions. */
  private interactionEffect(base: EconomicSnapshot, template: ScenarioTemplate): number {
    // Higher debt levels amplify negative GDP shocks
    let interaction = 0;
    if (template.gdpShock < 0 && base.interestRate > 4) {
      interaction += -0.3;
    }
    // Low unemployment amplifies positive shocks
    if (template.gdpShock > 0 && base.unemployment < 4.0) {
      interaction += 0.2;
    }
    // High inflation dampens positive GDP effects
    if (template.gdpShock > 0 && base.inflation > this.config.inflationTarget + 2) {
      interaction += -0.2;
    }
    return round2(interaction);
  }

  /** Compute detailed scenario impact descriptions. */
  private computeScenarioImpacts(
    template: ScenarioTemplate,
    base: EconomicSnapshot,
    gdpEffect: number,
    inflationEffect: number,
    employmentEffect: number,
  ): string[] {
    const impacts: string[] = [];

    const newGdp = round2(base.gdpGrowth + gdpEffect);
    const newInflation = round2(base.inflation + inflationEffect);
    const newUnemployment = round2(base.unemployment - employmentEffect);

    impacts.push(`GDP growth shifts from ${base.gdpGrowth}% to ${newGdp}% (${gdpEffect > 0 ? '+' : ''}${gdpEffect}pp)`);
    impacts.push(`Inflation moves from ${base.inflation}% to ${newInflation}% (${inflationEffect > 0 ? '+' : ''}${inflationEffect}pp)`);
    impacts.push(`Unemployment changes from ${base.unemployment}% to ${round2(Math.max(0, newUnemployment))}% (${employmentEffect > 0 ? 'improving' : 'worsening'})`);

    // Sector-level impacts
    for (const profile of this.sectorProfiles.slice(0, 4)) {
      const sectorGdpEffect = round2(gdpEffect * profile.gdpSensitivity);
      const direction = sectorGdpEffect > 0 ? 'benefits' : 'suffers';
      impacts.push(`${profile.sector} sector ${direction} (${sectorGdpEffect > 0 ? '+' : ''}${sectorGdpEffect}pp growth impact)`);
    }

    // Rate-sensitive impacts
    if (Math.abs(template.rateShock) > 0.25) {
      const newRate = round2(base.interestRate + template.rateShock);
      impacts.push(`Interest rates move to ${newRate}% — ${template.rateShock > 0 ? 'tighter' : 'easier'} financial conditions`);
    }

    // Second-order effects
    if (newGdp < 0) {
      impacts.push('Negative GDP growth triggers contraction dynamics: falling revenues, rising defaults');
    }
    if (newInflation > 5) {
      impacts.push('High inflation erodes real wages and consumer purchasing power');
    }
    if (newUnemployment > 8) {
      impacts.push('Sharply higher unemployment strains social safety nets and reduces tax revenue');
    }

    return impacts;
  }

  /** Build a custom scenario from name parsing when no template matches. */
  private buildCustomScenario(
    name: string,
    base: EconomicSnapshot,
    assumptions: string[],
  ): MacroScenario {
    const lower = name.toLowerCase();
    let gdpEffect = 0;
    let inflationEffect = 0;
    let employmentEffect = 0;
    let probability = 0.2;

    // Parse directional cues from name
    if (lower.includes('growth') || lower.includes('expansion') || lower.includes('boom')) {
      gdpEffect = 1.5;
      inflationEffect = 0.5;
      employmentEffect = 0.8;
    }
    if (lower.includes('recession') || lower.includes('downturn') || lower.includes('contraction')) {
      gdpEffect = -2.0;
      inflationEffect = -0.5;
      employmentEffect = -1.5;
    }
    if (lower.includes('inflation') || lower.includes('price')) {
      inflationEffect += 2.0;
      gdpEffect -= 0.5;
    }
    if (lower.includes('deflation')) {
      inflationEffect = -1.5;
      gdpEffect -= 0.8;
    }
    if (lower.includes('rate hike') || lower.includes('tightening')) {
      gdpEffect -= 0.3;
      inflationEffect -= 0.4;
    }
    if (lower.includes('rate cut') || lower.includes('easing')) {
      gdpEffect += 0.3;
      inflationEffect += 0.2;
    }
    if (lower.includes('war') || lower.includes('conflict') || lower.includes('geopolitical')) {
      gdpEffect -= 1.0;
      inflationEffect += 1.5;
      employmentEffect -= 0.5;
      probability = 0.15;
    }
    if (lower.includes('pandemic') || lower.includes('health crisis')) {
      gdpEffect -= 3.0;
      inflationEffect -= 0.5;
      employmentEffect -= 3.0;
      probability = 0.05;
    }
    if (lower.includes('technology') || lower.includes('innovation') || lower.includes('productivity')) {
      gdpEffect += 1.0;
      inflationEffect -= 0.3;
      employmentEffect += 0.5;
    }

    const impacts: string[] = [];
    const newGdp = round2(base.gdpGrowth + gdpEffect);
    const newInflation = round2(base.inflation + inflationEffect);
    const newUnemployment = round2(Math.max(0, base.unemployment - employmentEffect));

    impacts.push(`GDP growth shifts to ${newGdp}% under "${name}" scenario`);
    impacts.push(`Inflation adjusts to ${newInflation}%`);
    impacts.push(`Unemployment moves to ${newUnemployment}%`);

    if (assumptions.length === 0) {
      assumptions.push(`Custom scenario: "${name}"`);
      assumptions.push('Impact magnitudes estimated from scenario description');
    }

    this.logAnalysis('scenario');
    return {
      name,
      assumptions,
      impacts,
      probability: round2(clamp(probability, 0.01, 0.95)),
      gdpEffect: round2(gdpEffect),
      inflationEffect: round2(inflationEffect),
      employmentEffect: round2(employmentEffect),
    };
  }

  // ── Snapshot History Internals ────────────────────────────────────────

  /** Store a snapshot in history, respecting max limit. */
  private storeSnapshot(snapshot: EconomicSnapshot): void {
    const exists = this.snapshotHistory.some(s => s.timestamp === snapshot.timestamp);
    if (!exists) {
      this.snapshotHistory.push(snapshot);
      if (this.snapshotHistory.length > this.config.maxIndicators) {
        this.snapshotHistory.shift();
      }
    }
  }

  /** Get the previous value for a named indicator from snapshot history. */
  private getPreviousValue(indicatorName: string, fallback: number): number {
    if (this.snapshotHistory.length < 2) return fallback;
    const prev = this.snapshotHistory[this.snapshotHistory.length - 2];

    switch (indicatorName) {
      case 'GDP Growth': return prev.gdpGrowth;
      case 'Inflation (CPI)': return prev.inflation;
      case 'Unemployment Rate': return prev.unemployment;
      case 'Interest Rate': return prev.interestRate;
      default: {
        const match = prev.indicators.find(i => i.name === indicatorName);
        return match ? match.value : fallback;
      }
    }
  }

  // ── Report Internals ──────────────────────────────────────────────────

  /** Generate an empty report when no data is available. */
  private emptyReport(title?: string): EconomicReport {
    return {
      title: title ?? 'Economic Outlook Report — No Data',
      date: formatDate(Date.now()),
      summary: 'Insufficient data to generate a comprehensive economic outlook.',
      outlook: 'neutral',
      keyFindings: ['No economic data available for analysis'],
      risks: ['Lack of data prevents risk assessment'],
      opportunities: ['Collect economic data to enable opportunity identification'],
      sectors: [],
    };
  }

  // ── Analysis Logging ──────────────────────────────────────────────────

  /** Log an analysis event for feedback tracking. */
  private logAnalysis(type: string): void {
    this.analysisLog.push({ id: generateId(), type, timestamp: Date.now() });
    if (this.analysisLog.length > 500) {
      this.analysisLog = this.analysisLog.slice(-250);
    }
  }
}
