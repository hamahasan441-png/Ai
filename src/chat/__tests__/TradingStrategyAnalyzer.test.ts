import { describe, it, expect, beforeEach } from 'vitest'
import { TradingStrategyAnalyzer } from '../TradingStrategyAnalyzer'

// ── Sample Code Snippets ──────────────────────────────────────────────────

const MQL4_EA_GOOD = `
#property copyright "MyExpert"
#property link      ""
#property version   "1.00"
#property strict

extern double LotSize = 0.1;
extern int StopLoss = 50;
extern int TakeProfit = 100;
extern int MagicNumber = 12345;
extern int Slippage = 3;

int init() {
  Print("EA initialized with SL=", StopLoss, " TP=", TakeProfit);
  return(INIT_SUCCEEDED);
}

int start() {
  // Check existing orders
  if (OrdersTotal() > 3) return(0);

  double maFast = iMA(NULL, 0, 10, 0, MODE_SMA, PRICE_CLOSE, 0);
  double maSlow = iMA(NULL, 0, 20, 0, MODE_SMA, PRICE_CLOSE, 0);

  // Trend-following crossover
  if (maFast > maSlow) {
    double sl = Ask - StopLoss * Point;
    double tp = Ask + TakeProfit * Point;
    int ticket = OrderSend(Symbol(), OP_BUY, LotSize, Ask, Slippage, sl, tp, "Buy", MagicNumber);
    if (ticket < 0) Print("OrderSend failed: ", GetLastError());
  }
  return(0);
}

int deinit() {
  ObjectDelete("myLabel");
  Print("EA removed");
  return(0);
}
`

const MQL4_EA_BAD = `
extern double Lots = 2.0;

int start() {
  OrderSend(Symbol(), OP_BUY, Lots, Ask, 3, 0, 0);
  return(0);
}
`

const MQL5_EA_GOOD = `
#property copyright "MyExpert"
#property version   "1.00"

#include <Trade\\Trade.mqh>

input double InpLotSize = 0.1;
input int    InpStopLoss = 50;
input int    InpTakeProfit = 100;

CTrade trade;

int OnInit() {
  trade.SetExpertMagicNumber(12345);
  if (InpLotSize <= 0) {
    Print("Invalid lot size");
    return(INIT_FAILED);
  }
  Print("EA initialized");
  return(INIT_SUCCEEDED);
}

void OnTick() {
  if (PositionsTotal() > 3) return;

  double maFast = iMA(Symbol(), PERIOD_CURRENT, 10, 0, MODE_SMA, PRICE_CLOSE);
  double maSlow = iMA(Symbol(), PERIOD_CURRENT, 20, 0, MODE_SMA, PRICE_CLOSE);

  double spread = SymbolInfoDouble(Symbol(), SYMBOL_SPREAD);

  if (maFast > maSlow) {
    trade.Buy(InpLotSize);
    if (trade.ResultRetcode() != TRADE_RETCODE_DONE) {
      Print("Buy failed: ", trade.ResultRetcode());
    }
  }
}

void OnDeinit(const int reason) {
  Print("EA removed, reason: ", reason);
}
`

const MQL5_EA_MARTINGALE = `
#include <Trade\\Trade.mqh>

input double InpStartLot = 0.01;

CTrade trade;
double currentLot;
int consecutiveLosses = 0;

int OnInit() {
  currentLot = InpStartLot;
  return(INIT_SUCCEEDED);
}

void OnTick() {
  // Martingale: double lot on loss
  if (consecutiveLosses > 0) {
    currentLot = InpStartLot * MathPow(2, consecutiveLosses);
  }
  double rsi = iRSI(Symbol(), PERIOD_CURRENT, 14, PRICE_CLOSE);
  if (rsi < 30) {
    trade.Buy(currentLot);
  }
}

void OnDeinit(const int reason) {}
`

const PINE_STRATEGY_GOOD = `
//@version=5
strategy("MA Crossover", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10, commission_value=0.1)

// Inputs
fastLen = input.int(10, title="Fast MA Length")
slowLen = input.int(20, title="Slow MA Length")
stopLossPct = input.float(2.0, title="Stop Loss %")
takeProfitPct = input.float(4.0, title="Take Profit %")

// Calculate
smaFast = ta.sma(close, fastLen)
smaSlow = ta.sma(close, slowLen)

// Conditions
longCondition = ta.crossover(smaFast, smaSlow)
shortCondition = ta.crossunder(smaFast, smaSlow)

// Risk Management
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Exit Long", "Long", stop=close * (1 - stopLossPct/100), limit=close * (1 + takeProfitPct/100))

if shortCondition
    strategy.entry("Short", strategy.short)

// Plot
plot(smaFast, title="Fast SMA", color=color.blue)
plot(smaSlow, title="Slow SMA", color=color.red)
`

const PINE_INDICATOR_BASIC = `
//@version=5
indicator("RSI Indicator", overlay=false)
rsiValue = ta.rsi(close, 14)
plot(rsiValue)
hline(70)
hline(30)
`

const GRID_EA = `
#property strict

extern double LotSize = 0.1;
extern int GridStep = 20;
extern int GridLevels = 5;
extern int StopLoss = 100;
extern int TakeProfit = 50;
extern int MagicNumber = 555;

int start() {
  if (OrdersTotal() >= GridLevels) return(0);

  for (int i = 0; i < GridLevels; i++) {
    double price = Ask + i * GridStep * Point;
    int ticket = OrderSend(Symbol(), OP_BUYLIMIT, LotSize, price, 3, price - StopLoss * Point, price + TakeProfit * Point, "Grid", MagicNumber);
    if (ticket < 0) Print("Grid order failed: ", GetLastError());
  }
  return(0);
}

int deinit() {
  Print("Grid EA removed");
  return(0);
}
`

const BREAKOUT_PINE = `
//@version=5
strategy("Channel Breakout", overlay=true, commission_value=0.05)

length = input.int(20, title="Channel Length")
src = input.source(close, title="Source")

highest = ta.highest(high, length)
lowest = ta.lowest(low, length)

breakoutUp = close > highest[1]
breakoutDown = close < lowest[1]

if breakoutUp
    strategy.entry("Long", strategy.long)
    stopLoss = lowest
    strategy.exit("Exit", "Long", stop=stopLoss)

if breakoutDown
    strategy.close("Long")

plot(highest, title="Resistance", color=color.red)
plot(lowest, title="Support", color=color.green)
`

// ══════════════════════════════════════════════════════════════════════════════
// CONSTRUCTOR & CONFIG TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('TradingStrategyAnalyzer constructor & config', () => {
  it('creates instance with default config', () => {
    const analyzer = new TradingStrategyAnalyzer()
    expect(analyzer).toBeInstanceOf(TradingStrategyAnalyzer)
  })

  it('creates instance with custom config', () => {
    const analyzer = new TradingStrategyAnalyzer({ strictMode: true, minRiskScore: 70 })
    const config = analyzer.getConfig()
    expect(config.strictMode).toBe(true)
    expect(config.minRiskScore).toBe(70)
  })

  it('default config has expected values', () => {
    const analyzer = new TradingStrategyAnalyzer()
    const config = analyzer.getConfig()
    expect(config.strictMode).toBe(false)
    expect(config.enablePerformanceChecks).toBe(true)
    expect(config.enableBacktestChecks).toBe(true)
  })

  it('updateConfig merges new values', () => {
    const analyzer = new TradingStrategyAnalyzer()
    analyzer.updateConfig({ strictMode: true })
    expect(analyzer.getConfig().strictMode).toBe(true)
    expect(analyzer.getConfig().enablePerformanceChecks).toBe(true)
  })

  it('initial stats are zeroed', () => {
    const analyzer = new TradingStrategyAnalyzer()
    const stats = analyzer.getStats()
    expect(stats.totalAnalyses).toBe(0)
    expect(stats.avgOverallScore).toBe(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// LANGUAGE DETECTION TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('TradingStrategyAnalyzer language detection', () => {
  let analyzer: TradingStrategyAnalyzer

  beforeEach(() => {
    analyzer = new TradingStrategyAnalyzer()
  })

  it('detects MQL4 from init/start/deinit', () => {
    expect(analyzer.detectLanguage(MQL4_EA_GOOD)).toBe('mql4')
  })

  it('detects MQL4 from bad EA code', () => {
    expect(analyzer.detectLanguage(MQL4_EA_BAD)).toBe('mql4')
  })

  it('detects MQL5 from OnInit/OnTick', () => {
    expect(analyzer.detectLanguage(MQL5_EA_GOOD)).toBe('mql5')
  })

  it('detects MQL5 from CTrade usage', () => {
    expect(analyzer.detectLanguage(MQL5_EA_MARTINGALE)).toBe('mql5')
  })

  it('detects PineScript from //@version', () => {
    expect(analyzer.detectLanguage(PINE_STRATEGY_GOOD)).toBe('pinescript')
  })

  it('detects PineScript from indicator()', () => {
    expect(analyzer.detectLanguage(PINE_INDICATOR_BASIC)).toBe('pinescript')
  })

  it('returns unknown for non-trading code', () => {
    expect(analyzer.detectLanguage('function hello() { console.log("hi") }')).toBe('unknown')
  })

  it('returns unknown for empty code', () => {
    expect(analyzer.detectLanguage('')).toBe('unknown')
  })

  it('detects MQL4 grid EA', () => {
    expect(analyzer.detectLanguage(GRID_EA)).toBe('mql4')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// PATTERN DETECTION TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('TradingStrategyAnalyzer pattern detection', () => {
  let analyzer: TradingStrategyAnalyzer

  beforeEach(() => {
    analyzer = new TradingStrategyAnalyzer()
  })

  it('detects trend-following pattern from MA crossover', () => {
    const { patterns } = analyzer.detectPatterns(MQL4_EA_GOOD)
    expect(patterns).toContain('trend-following')
  })

  it('detects mean-reversion from RSI', () => {
    const { patterns } = analyzer.detectPatterns(MQL5_EA_MARTINGALE)
    expect(patterns).toContain('mean-reversion')
  })

  it('detects martingale pattern', () => {
    const { patterns } = analyzer.detectPatterns(MQL5_EA_MARTINGALE)
    expect(patterns).toContain('martingale')
  })

  it('detects grid pattern', () => {
    const { patterns } = analyzer.detectPatterns(GRID_EA)
    expect(patterns).toContain('grid')
  })

  it('detects breakout pattern from channel strategy', () => {
    const { patterns } = analyzer.detectPatterns(BREAKOUT_PINE)
    expect(patterns).toContain('breakout')
  })

  it('detects trend-following in PineScript with crossover', () => {
    const { patterns } = analyzer.detectPatterns(PINE_STRATEGY_GOOD)
    expect(patterns).toContain('trend-following')
  })

  it('provides confidence scores for patterns', () => {
    const { confidence } = analyzer.detectPatterns(MQL4_EA_GOOD)
    expect(confidence['trend-following']).toBeGreaterThan(0)
    expect(typeof confidence['trend-following']).toBe('number')
  })

  it('returns zero confidence for unmatched patterns', () => {
    const { confidence } = analyzer.detectPatterns(PINE_INDICATOR_BASIC)
    expect(confidence.arbitrage).toBe(0)
  })

  it('confidence values are between 0 and 1', () => {
    const { confidence } = analyzer.detectPatterns(MQL4_EA_GOOD)
    for (const val of Object.values(confidence)) {
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(1)
    }
  })

  it('detects multiple patterns in complex code', () => {
    const code = `
      iMA(NULL, 0, 10, 0, MODE_SMA, PRICE_CLOSE, 0)
      iRSI(NULL, 0, 14, PRICE_CLOSE, 0)
      double highest = iHighest(NULL, 0, MODE_HIGH, 20, 0);
      if (crossover) { trend direction breakout resistance }
      overbought oversold mean deviation
    `
    const { patterns } = analyzer.detectPatterns(code)
    expect(patterns.length).toBeGreaterThanOrEqual(2)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// RISK ASSESSMENT TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('TradingStrategyAnalyzer risk assessment', () => {
  let analyzer: TradingStrategyAnalyzer

  beforeEach(() => {
    analyzer = new TradingStrategyAnalyzer()
  })

  it('good MQL4 EA has high risk score', () => {
    const risk = analyzer.assessRisk(MQL4_EA_GOOD, 'mql4')
    expect(risk.hasStopLoss).toBe(true)
    expect(risk.hasTakeProfit).toBe(true)
    expect(risk.riskScore).toBeGreaterThanOrEqual(40)
  })

  it('bad MQL4 EA has low risk score', () => {
    const risk = analyzer.assessRisk(MQL4_EA_BAD, 'mql4')
    expect(risk.hasStopLoss).toBe(false)
    expect(risk.hasTakeProfit).toBe(false)
    expect(risk.riskScore).toBeLessThan(30)
  })

  it('detects missing stop-loss as critical', () => {
    const risk = analyzer.assessRisk(MQL4_EA_BAD, 'mql4')
    const slIssue = risk.issues.find(i => i.message.includes('stop-loss'))
    expect(slIssue).toBeDefined()
    expect(slIssue!.severity).toBe('critical')
  })

  it('detects missing take-profit', () => {
    const risk = analyzer.assessRisk(MQL4_EA_BAD, 'mql4')
    const tpIssue = risk.issues.find(i => i.message.includes('take-profit'))
    expect(tpIssue).toBeDefined()
  })

  it('detects high lot size warning', () => {
    const risk = analyzer.assessRisk(MQL4_EA_BAD, 'mql4')
    expect(risk.maxLotSize).toBe(2.0)
    const lotIssue = risk.issues.find(i => i.message.includes('lot size'))
    expect(lotIssue).toBeDefined()
  })

  it('detects martingale as critical risk', () => {
    const risk = analyzer.assessRisk(MQL5_EA_MARTINGALE, 'mql5')
    const martingaleIssue = risk.issues.find(i => i.message.toLowerCase().includes('martingale'))
    expect(martingaleIssue).toBeDefined()
    expect(martingaleIssue!.severity).toBe('critical')
  })

  it('good PineScript has stop-loss and take-profit', () => {
    const risk = analyzer.assessRisk(PINE_STRATEGY_GOOD, 'pinescript')
    expect(risk.hasStopLoss).toBe(true)
    expect(risk.hasTakeProfit).toBe(true)
  })

  it('calculates risk-reward ratio', () => {
    const risk = analyzer.assessRisk(MQL4_EA_GOOD, 'mql4')
    expect(risk.riskRewardRatio).toBe(2)
  })

  it('flags bad risk-reward ratio', () => {
    const code = 'extern int StopLoss = 100;\nextern int TakeProfit = 30;'
    const risk = analyzer.assessRisk(code, 'mql4')
    expect(risk.riskRewardRatio).toBe(0.3)
    const rrIssue = risk.issues.find(i => i.message.includes('Risk-reward'))
    expect(rrIssue).toBeDefined()
  })

  it('detects trailing stop presence', () => {
    const code = 'extern int TrailingStop = 30;\nOrderModify(ticket, price, trailingstop);'
    const risk = analyzer.assessRisk(code, 'mql4')
    expect(risk.hasTrailingStop).toBe(true)
  })

  it('detects break-even presence', () => {
    const code = 'if (profit > breakeven) { MoveStopToEntry(); }'
    const risk = analyzer.assessRisk(code, 'mql4')
    expect(risk.hasBreakEven).toBe(true)
  })

  it('flags missing order count check in MQL', () => {
    const risk = analyzer.assessRisk(MQL4_EA_BAD, 'mql4')
    const orderIssue = risk.issues.find(i => i.message.includes('maximum open positions'))
    expect(orderIssue).toBeDefined()
  })

  it('good EA with OrdersTotal check has no open position issue', () => {
    const risk = analyzer.assessRisk(MQL4_EA_GOOD, 'mql4')
    const orderIssue = risk.issues.find(i => i.message.includes('maximum open positions'))
    expect(orderIssue).toBeUndefined()
  })

  it('detects position sizing', () => {
    const risk = analyzer.assessRisk(PINE_STRATEGY_GOOD, 'pinescript')
    expect(risk.hasPositionSizing).toBe(true)
  })

  it('risk score never exceeds 100', () => {
    const risk = analyzer.assessRisk(MQL4_EA_GOOD, 'mql4')
    expect(risk.riskScore).toBeLessThanOrEqual(100)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// CODE QUALITY TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('TradingStrategyAnalyzer code quality', () => {
  let analyzer: TradingStrategyAnalyzer

  beforeEach(() => {
    analyzer = new TradingStrategyAnalyzer()
  })

  it('good MQL4 EA has high quality score', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_GOOD, 'mql4')
    expect(quality.qualityScore).toBeGreaterThanOrEqual(50)
  })

  it('bad MQL4 EA has low quality score', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_BAD, 'mql4')
    expect(quality.qualityScore).toBeLessThan(30)
  })

  it('detects error handling in MQL4', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_GOOD, 'mql4')
    expect(quality.hasErrorHandling).toBe(true)
  })

  it('detects missing error handling in bad EA', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_BAD, 'mql4')
    expect(quality.hasErrorHandling).toBe(false)
  })

  it('detects MQL5 error handling (ResultRetcode)', () => {
    const quality = analyzer.analyzeCodeQuality(MQL5_EA_GOOD, 'mql5')
    expect(quality.hasErrorHandling).toBe(true)
  })

  it('detects magic number in MQL4', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_GOOD, 'mql4')
    expect(quality.hasMagicNumber).toBe(true)
  })

  it('flags missing magic number in MQL', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_BAD, 'mql4')
    expect(quality.hasMagicNumber).toBe(false)
    const issue = quality.issues.find(i => i.message.includes('magic number'))
    expect(issue).toBeDefined()
  })

  it('detects comments presence', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_GOOD, 'mql4')
    expect(quality.hasComments).toBe(true)
  })

  it('flags missing comments', () => {
    const code = 'int start() {\nOrderSend(Symbol(), OP_BUY, 0.1, Ask, 3, 0, 0);\nreturn(0);\n}'
    const quality = analyzer.analyzeCodeQuality(code, 'mql4')
    expect(quality.hasComments).toBe(false)
  })

  it('detects resource cleanup in MQL4', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_GOOD, 'mql4')
    expect(quality.hasResourceCleanup).toBe(true)
  })

  it('detects logging statements', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_GOOD, 'mql4')
    expect(quality.hasLogging).toBe(true)
  })

  it('flags missing #property strict in MQL4', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_BAD, 'mql4')
    const issue = quality.issues.find(i => i.message.includes('#property strict'))
    expect(issue).toBeDefined()
  })

  it('flags missing //@version in PineScript', () => {
    const code = 'indicator("Test")\nplot(close)'
    const quality = analyzer.analyzeCodeQuality(code, 'pinescript')
    const issue = quality.issues.find(i => i.message.includes('@version'))
    expect(issue).toBeDefined()
  })

  it('PineScript with //@version passes', () => {
    const quality = analyzer.analyzeCodeQuality(PINE_STRATEGY_GOOD, 'pinescript')
    const issue = quality.issues.find(i => i.message.includes('@version'))
    expect(issue).toBeUndefined()
  })

  it('detects input validation', () => {
    const quality = analyzer.analyzeCodeQuality(MQL5_EA_GOOD, 'mql5')
    expect(quality.hasInputValidation).toBe(true)
  })

  it('quality score never exceeds 100', () => {
    const quality = analyzer.analyzeCodeQuality(MQL4_EA_GOOD, 'mql4')
    expect(quality.qualityScore).toBeLessThanOrEqual(100)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE ANALYSIS TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('TradingStrategyAnalyzer performance analysis', () => {
  let analyzer: TradingStrategyAnalyzer

  beforeEach(() => {
    analyzer = new TradingStrategyAnalyzer()
  })

  it('detects excessive indicator calls', () => {
    const code = Array.from(
      { length: 12 },
      (_, i) => `double ma${i} = iMA(NULL, 0, ${10 + i}, 0, MODE_SMA, PRICE_CLOSE, 0);`,
    ).join('\n')
    const perf = analyzer.analyzePerformance(code, 'mql4')
    expect(perf.excessiveIndicatorCalls).toBe(true)
    expect(perf.performanceScore).toBeLessThan(100)
  })

  it('normal indicator count is acceptable', () => {
    const perf = analyzer.analyzePerformance(MQL4_EA_GOOD, 'mql4')
    expect(perf.excessiveIndicatorCalls).toBe(false)
  })

  it('detects unoptimized loops (no IndicatorCounted)', () => {
    const code = 'for (int i = 0; i < Bars; i++) { Buffer[i] = Close[i]; }'
    const perf = analyzer.analyzePerformance(code, 'mql4')
    expect(perf.hasOptimizableLoops).toBe(true)
    const issue = perf.issues.find(i => i.message.includes('counted bars'))
    expect(issue).toBeDefined()
  })

  it('optimized loop with IndicatorCounted passes', () => {
    const code =
      'int counted = IndicatorCounted();\nfor (int i = Bars - counted; i >= 0; i--) { Buffer[i] = Close[i]; }'
    const perf = analyzer.analyzePerformance(code, 'mql4')
    const issue = perf.issues.find(i => i.message.includes('counted bars'))
    expect(issue).toBeUndefined()
  })

  it('detects built-in function usage', () => {
    const perf = analyzer.analyzePerformance(MQL4_EA_GOOD, 'mql4')
    expect(perf.usesBuiltinFunctions).toBe(true)
  })

  it('detects redundant indicator calculations', () => {
    const code = `
      double a = iMA(NULL, 0, 14, 0, MODE_SMA, PRICE_CLOSE, 0);
      double b = iMA(NULL, 0, 14, 0, MODE_SMA, PRICE_CLOSE, 0);
    `
    const perf = analyzer.analyzePerformance(code, 'mql4')
    expect(perf.hasRedundantCalculations).toBe(true)
  })

  it('performance score is 0-100', () => {
    const perf = analyzer.analyzePerformance(MQL4_EA_GOOD, 'mql4')
    expect(perf.performanceScore).toBeGreaterThanOrEqual(0)
    expect(perf.performanceScore).toBeLessThanOrEqual(100)
  })

  it('disabled performance checks return perfect score', () => {
    const analyzer2 = new TradingStrategyAnalyzer({ enablePerformanceChecks: false })
    const result = analyzer2.analyze(MQL4_EA_BAD, 'mql4')
    expect(result.performance.performanceScore).toBe(100)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// BACKTEST QUALITY TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('TradingStrategyAnalyzer backtest quality', () => {
  let analyzer: TradingStrategyAnalyzer

  beforeEach(() => {
    analyzer = new TradingStrategyAnalyzer()
  })

  it('good MQL5 EA has spread consideration', () => {
    const bt = analyzer.assessBacktestQuality(MQL5_EA_GOOD, 'mql5')
    expect(bt.hasSpreadConsideration).toBe(true)
  })

  it('bad EA lacks spread consideration', () => {
    const bt = analyzer.assessBacktestQuality(MQL4_EA_BAD, 'mql4')
    expect(bt.hasSpreadConsideration).toBe(false)
  })

  it('detects slippage handling', () => {
    const bt = analyzer.assessBacktestQuality(MQL4_EA_GOOD, 'mql4')
    expect(bt.hasSlippageHandling).toBe(true)
  })

  it('detects commission in PineScript', () => {
    const bt = analyzer.assessBacktestQuality(PINE_STRATEGY_GOOD, 'pinescript')
    expect(bt.hasCommissionModeling).toBe(true)
  })

  it('flags missing commission', () => {
    const bt = analyzer.assessBacktestQuality(MQL4_EA_BAD, 'mql4')
    expect(bt.hasCommissionModeling).toBe(false)
  })

  it('backtest score is 0-100', () => {
    const bt = analyzer.assessBacktestQuality(MQL4_EA_GOOD, 'mql4')
    expect(bt.backtestScore).toBeGreaterThanOrEqual(0)
    expect(bt.backtestScore).toBeLessThanOrEqual(100)
  })

  it('disabled backtest checks return perfect score', () => {
    const analyzer2 = new TradingStrategyAnalyzer({ enableBacktestChecks: false })
    const result = analyzer2.analyze(MQL4_EA_BAD, 'mql4')
    expect(result.backtestQuality.backtestScore).toBe(100)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// FULL ANALYSIS TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('TradingStrategyAnalyzer full analysis', () => {
  let analyzer: TradingStrategyAnalyzer

  beforeEach(() => {
    analyzer = new TradingStrategyAnalyzer()
  })

  it('analyzes good MQL4 EA with high score', () => {
    const result = analyzer.analyze(MQL4_EA_GOOD)
    expect(result.language).toBe('mql4')
    expect(result.overallScore).toBeGreaterThanOrEqual(40)
    expect(result.detectedPatterns).toContain('trend-following')
    expect(result.summary).toContain('MQL4')
  })

  it('analyzes bad MQL4 EA with low score', () => {
    const result = analyzer.analyze(MQL4_EA_BAD)
    expect(result.overallScore).toBeLessThan(40)
    expect(result.allIssues.length).toBeGreaterThan(3)
  })

  it('analyzes good MQL5 EA', () => {
    const result = analyzer.analyze(MQL5_EA_GOOD)
    expect(result.language).toBe('mql5')
    expect(result.overallScore).toBeGreaterThanOrEqual(30)
  })

  it('analyzes martingale EA with critical warnings', () => {
    const result = analyzer.analyze(MQL5_EA_MARTINGALE)
    expect(result.detectedPatterns).toContain('martingale')
    const criticals = result.allIssues.filter(i => i.severity === 'critical')
    expect(criticals.length).toBeGreaterThan(0)
  })

  it('analyzes PineScript strategy', () => {
    const result = analyzer.analyze(PINE_STRATEGY_GOOD)
    expect(result.language).toBe('pinescript')
    expect(result.overallScore).toBeGreaterThanOrEqual(30)
    expect(result.detectedPatterns).toContain('trend-following')
  })

  it('analyzes grid EA', () => {
    const result = analyzer.analyze(GRID_EA)
    expect(result.detectedPatterns).toContain('grid')
    expect(result.language).toBe('mql4')
  })

  it('analyzes breakout PineScript', () => {
    const result = analyzer.analyze(BREAKOUT_PINE)
    expect(result.language).toBe('pinescript')
    expect(result.detectedPatterns).toContain('breakout')
  })

  it('explicit language overrides detection', () => {
    const result = analyzer.analyze(MQL4_EA_GOOD, 'mql5')
    expect(result.language).toBe('mql5')
  })

  it('summary contains grade', () => {
    const result = analyzer.analyze(MQL4_EA_GOOD)
    expect(result.summary).toMatch(/Grade [A-F]/)
  })

  it('summary mentions issue count', () => {
    const result = analyzer.analyze(MQL4_EA_BAD)
    expect(result.summary).toMatch(/issue\(s\)/)
  })

  it('provides suggestions', () => {
    const result = analyzer.analyze(MQL4_EA_BAD)
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('martingale EA gets specific warning suggestion', () => {
    const result = analyzer.analyze(MQL5_EA_MARTINGALE)
    const martSuggestion = result.suggestions.find(s => s.includes('Martingale'))
    expect(martSuggestion).toBeDefined()
  })

  it('overall score is 0-100', () => {
    for (const code of [MQL4_EA_GOOD, MQL4_EA_BAD, MQL5_EA_GOOD, PINE_STRATEGY_GOOD]) {
      const result = analyzer.analyze(code)
      expect(result.overallScore).toBeGreaterThanOrEqual(0)
      expect(result.overallScore).toBeLessThanOrEqual(100)
    }
  })

  it('all issues have required fields', () => {
    const result = analyzer.analyze(MQL4_EA_BAD)
    for (const issue of result.allIssues) {
      expect(issue.severity).toBeDefined()
      expect(issue.category).toBeDefined()
      expect(issue.message).toBeDefined()
      expect(issue.suggestion).toBeDefined()
    }
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// STATS TRACKING TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('TradingStrategyAnalyzer stats tracking', () => {
  let analyzer: TradingStrategyAnalyzer

  beforeEach(() => {
    analyzer = new TradingStrategyAnalyzer()
  })

  it('increments totalAnalyses on each call', () => {
    analyzer.analyze(MQL4_EA_GOOD)
    analyzer.analyze(MQL5_EA_GOOD)
    expect(analyzer.getStats().totalAnalyses).toBe(2)
  })

  it('tracks language breakdown', () => {
    analyzer.analyze(MQL4_EA_GOOD)
    analyzer.analyze(MQL5_EA_GOOD)
    analyzer.analyze(PINE_STRATEGY_GOOD)
    const stats = analyzer.getStats()
    expect(stats.languageBreakdown.mql4).toBe(1)
    expect(stats.languageBreakdown.mql5).toBe(1)
    expect(stats.languageBreakdown.pinescript).toBe(1)
  })

  it('tracks detected patterns', () => {
    analyzer.analyze(MQL4_EA_GOOD)
    const stats = analyzer.getStats()
    expect(stats.patternsDetected['trend-following']).toBeGreaterThanOrEqual(1)
  })

  it('computes running averages', () => {
    analyzer.analyze(MQL4_EA_GOOD)
    analyzer.analyze(MQL4_EA_BAD)
    const stats = analyzer.getStats()
    expect(stats.avgOverallScore).toBeGreaterThan(0)
    expect(stats.avgRiskScore).toBeGreaterThan(0)
  })

  it('tracks issues by category', () => {
    analyzer.analyze(MQL4_EA_BAD)
    const stats = analyzer.getStats()
    expect(stats.issuesByCategory.risk).toBeGreaterThan(0)
  })

  it('resetStats clears all', () => {
    analyzer.analyze(MQL4_EA_GOOD)
    analyzer.resetStats()
    const stats = analyzer.getStats()
    expect(stats.totalAnalyses).toBe(0)
    expect(stats.avgOverallScore).toBe(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// SUGGESTION GENERATION TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('TradingStrategyAnalyzer suggestions', () => {
  let analyzer: TradingStrategyAnalyzer

  beforeEach(() => {
    analyzer = new TradingStrategyAnalyzer()
  })

  it('critical issues appear first', () => {
    const result = analyzer.analyze(MQL4_EA_BAD)
    if (result.suggestions.length > 0) {
      expect(result.suggestions[0]).toMatch(/🔴 CRITICAL/)
    }
  })

  it('high issues appear after criticals', () => {
    const result = analyzer.analyze(MQL4_EA_BAD)
    const critIdx = result.suggestions.findIndex(s => s.includes('CRITICAL'))
    const highIdx = result.suggestions.findIndex(s => s.includes('🟠 HIGH'))
    if (critIdx >= 0 && highIdx >= 0) {
      expect(highIdx).toBeGreaterThan(critIdx)
    }
  })

  it('PineScript strategies get strategy.exit suggestion', () => {
    const result = analyzer.analyze(PINE_STRATEGY_GOOD)
    const pineSuggestion = result.suggestions.find(s => s.includes('strategy.exit'))
    expect(pineSuggestion).toBeDefined()
  })

  it('MQL4 gets migration suggestion', () => {
    const result = analyzer.analyze(MQL4_EA_GOOD)
    const migrateSuggestion = result.suggestions.find(s => s.includes('MQL5'))
    expect(migrateSuggestion).toBeDefined()
  })

  it('grid EA gets drawdown warning suggestion', () => {
    const result = analyzer.analyze(GRID_EA)
    const gridSuggestion = result.suggestions.find(s => s.toLowerCase().includes('grid'))
    expect(gridSuggestion).toBeDefined()
  })
})
