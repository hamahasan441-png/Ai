/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║       🔍  T R A D I N G   S T R A T E G Y   A N A L Y Z E R                ║
 * ║                                                                             ║
 * ║   Static analysis engine for MQL4, MQL5, and PineScript strategy code:      ║
 * ║     parse → detect patterns → validate risk → score quality                 ║
 * ║                                                                             ║
 * ║     • Strategy pattern detection (trend, mean-reversion, breakout, etc.)    ║
 * ║     • Risk management validation (SL/TP, position sizing, drawdown)         ║
 * ║     • Code quality scoring (error handling, resource cleanup)               ║
 * ║     • Performance anti-pattern detection                                    ║
 * ║     • MQL4/MQL5/PineScript best practice enforcement                        ║
 * ║     • Backtesting quality assessment                                        ║
 * ║     • Optimization suggestions with priority ranking                        ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type TradingLanguage = 'mql4' | 'mql5' | 'pinescript' | 'unknown'

export type StrategyPattern =
  | 'trend-following'
  | 'mean-reversion'
  | 'breakout'
  | 'scalping'
  | 'grid'
  | 'martingale'
  | 'hedging'
  | 'arbitrage'
  | 'momentum'
  | 'range-bound'

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface StrategyIssue {
  severity: Severity
  category: 'risk' | 'quality' | 'performance' | 'best-practice' | 'logic'
  message: string
  line?: number
  suggestion: string
}

export interface RiskAssessment {
  hasStopLoss: boolean
  hasTakeProfit: boolean
  hasPositionSizing: boolean
  hasMaxDrawdownCheck: boolean
  hasTrailingStop: boolean
  hasBreakEven: boolean
  riskRewardRatio: number | null
  maxLotSize: number | null
  riskScore: number // 0-100 (100 = excellent risk management)
  issues: StrategyIssue[]
}

export interface CodeQualityResult {
  hasErrorHandling: boolean
  hasMagicNumber: boolean
  hasComments: boolean
  hasInputValidation: boolean
  hasResourceCleanup: boolean
  hasLogging: boolean
  qualityScore: number // 0-100
  issues: StrategyIssue[]
}

export interface PerformanceResult {
  excessiveIndicatorCalls: boolean
  hasOptimizableLoops: boolean
  hasRedundantCalculations: boolean
  usesBuiltinFunctions: boolean
  performanceScore: number // 0-100
  issues: StrategyIssue[]
}

export interface BacktestQuality {
  hasSpreadConsideration: boolean
  hasSlippageHandling: boolean
  hasCommissionModeling: boolean
  hasMultiTimeframe: boolean
  hasOutOfSampleTest: boolean
  backtestScore: number // 0-100
  issues: StrategyIssue[]
}

export interface StrategyAnalysis {
  language: TradingLanguage
  detectedPatterns: StrategyPattern[]
  patternConfidence: Record<StrategyPattern, number>
  risk: RiskAssessment
  codeQuality: CodeQualityResult
  performance: PerformanceResult
  backtestQuality: BacktestQuality
  overallScore: number // 0-100
  summary: string
  allIssues: StrategyIssue[]
  suggestions: string[]
}

export interface TradingStrategyAnalyzerConfig {
  strictMode: boolean
  minRiskScore: number
  minQualityScore: number
  enablePerformanceChecks: boolean
  enableBacktestChecks: boolean
}

export interface TradingStrategyAnalyzerStats {
  totalAnalyses: number
  avgOverallScore: number
  avgRiskScore: number
  avgQualityScore: number
  patternsDetected: Record<StrategyPattern, number>
  issuesByCategory: Record<string, number>
  languageBreakdown: Record<TradingLanguage, number>
}

// ── Default Config ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG: TradingStrategyAnalyzerConfig = {
  strictMode: false,
  minRiskScore: 50,
  minQualityScore: 40,
  enablePerformanceChecks: true,
  enableBacktestChecks: true,
}

// ── Pattern Detection Rules ──────────────────────────────────────────────────

interface PatternRule {
  pattern: StrategyPattern
  indicators: RegExp[]
  weight: number
}

const PATTERN_RULES: PatternRule[] = [
  {
    pattern: 'trend-following',
    indicators: [
      /\b(?:iMA|ta\.sma|ta\.ema|MovingAverage|SMA|EMA)\b/i,
      /\b(?:crossover|crossunder|ta\.crossover|ta\.crossunder)\b/i,
      /\b(?:trend|direction|slope)\b/i,
    ],
    weight: 1.0,
  },
  {
    pattern: 'mean-reversion',
    indicators: [
      /\b(?:iRSI|ta\.rsi|RSI)\b/i,
      /\b(?:iBollinger|ta\.bb|BollingerBands|bb)\b/i,
      /\b(?:overbought|oversold|deviation|revert|mean)\b/i,
    ],
    weight: 1.0,
  },
  {
    pattern: 'breakout',
    indicators: [
      /\b(?:high\[|low\[|iHighest|iLowest|ta\.highest|ta\.lowest)\b/i,
      /\b(?:breakout|resistance|support|level|channel)\b/i,
      /\b(?:range|consolidat|squeeze)\b/i,
    ],
    weight: 1.0,
  },
  {
    pattern: 'scalping',
    indicators: [
      /\b(?:PERIOD_M1|PERIOD_M5|"1"|"5"|timeframe\.period)\b/i,
      /\b(?:scalp|pip|spread|tick|fast)\b/i,
      /\b(?:quick|short.?term|micro)\b/i,
    ],
    weight: 0.9,
  },
  {
    pattern: 'grid',
    indicators: [
      /\b(?:grid|step|level|pending)\b/i,
      /\b(?:BuyLimit|SellLimit|BuyStop|SellStop|ORDER_TYPE_BUY_LIMIT)\b/i,
      /\b(?:gridSize|gridStep|gridLevel)\b/i,
    ],
    weight: 1.0,
  },
  {
    pattern: 'martingale',
    indicators: [
      /\b(?:martingale|double.*lot|multiply.*lot|lot.*\*.*2)\b/i,
      /\b(?:consecutive.*loss|loss.*count|recovery)\b/i,
      /\b(?:lotMultiplier|increaseLot|doubleLot)\b/i,
    ],
    weight: 1.1,
  },
  {
    pattern: 'hedging',
    indicators: [
      /\b(?:hedge|hedging|opposite|contra)\b/i,
      /\b(?:buy.*sell|sell.*buy|both.*direction)\b/i,
      /\b(?:net.*position|balanced)\b/i,
    ],
    weight: 1.0,
  },
  {
    pattern: 'arbitrage',
    indicators: [
      /\b(?:arbitrage|arb|spread.*trade)\b/i,
      /\b(?:pair.*trade|correlation|cointegrat)\b/i,
      /\b(?:synthetic|triangular|statistical)\b/i,
    ],
    weight: 1.0,
  },
  {
    pattern: 'momentum',
    indicators: [
      /\b(?:iMomentum|ta\.mom|momentum|ROC|rate.*change)\b/i,
      /\b(?:iMACD|ta\.macd|MACD|signal.*line)\b/i,
      /\b(?:acceleration|velocity|force)\b/i,
    ],
    weight: 1.0,
  },
  {
    pattern: 'range-bound',
    indicators: [
      /\b(?:range|channel|oscillat)\b/i,
      /\b(?:iStochastic|ta\.stoch|stochastic|%K|%D)\b/i,
      /\b(?:iCCI|ta\.cci|CCI|commodity)\b/i,
    ],
    weight: 1.0,
  },
]

// ── Main Class ───────────────────────────────────────────────────────────────

export class TradingStrategyAnalyzer {
  private config: TradingStrategyAnalyzerConfig
  private stats: TradingStrategyAnalyzerStats

  constructor(config?: Partial<TradingStrategyAnalyzerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.stats = {
      totalAnalyses: 0,
      avgOverallScore: 0,
      avgRiskScore: 0,
      avgQualityScore: 0,
      patternsDetected: {} as Record<StrategyPattern, number>,
      issuesByCategory: {},
      languageBreakdown: {} as Record<TradingLanguage, number>,
    }
  }

  // ── Core Analysis ────────────────────────────────────────────────────────

  /** Analyze a trading strategy source code. */
  analyze(code: string, language?: TradingLanguage): StrategyAnalysis {
    const detected = language ?? this.detectLanguage(code)
    const patterns = this.detectPatterns(code)
    const risk = this.assessRisk(code, detected)
    const quality = this.analyzeCodeQuality(code, detected)
    const perf = this.config.enablePerformanceChecks
      ? this.analyzePerformance(code, detected)
      : { excessiveIndicatorCalls: false, hasOptimizableLoops: false, hasRedundantCalculations: false, usesBuiltinFunctions: true, performanceScore: 100, issues: [] }
    const backtest = this.config.enableBacktestChecks
      ? this.assessBacktestQuality(code, detected)
      : { hasSpreadConsideration: true, hasSlippageHandling: true, hasCommissionModeling: true, hasMultiTimeframe: false, hasOutOfSampleTest: false, backtestScore: 100, issues: [] }

    const allIssues = [
      ...risk.issues,
      ...quality.issues,
      ...perf.issues,
      ...backtest.issues,
    ]

    const overallScore = Math.round(
      risk.riskScore * 0.35 +
      quality.qualityScore * 0.25 +
      perf.performanceScore * 0.20 +
      backtest.backtestScore * 0.20,
    )

    const suggestions = this.generateSuggestions(allIssues, patterns.patterns, detected)
    const summary = this.generateSummary(detected, patterns.patterns, overallScore, allIssues)

    // Update stats
    this.updateStats(detected, patterns.patterns, overallScore, risk.riskScore, quality.qualityScore, allIssues)

    return {
      language: detected,
      detectedPatterns: patterns.patterns,
      patternConfidence: patterns.confidence,
      risk,
      codeQuality: quality,
      performance: perf,
      backtestQuality: backtest,
      overallScore,
      summary,
      allIssues,
      suggestions,
    }
  }

  // ── Language Detection ──────────────────────────────────────────────────

  /** Detect whether code is MQL4, MQL5, or PineScript. */
  detectLanguage(code: string): TradingLanguage {
    const mql5Score = this.scoreMQL5(code)
    const mql4Score = this.scoreMQL4(code)
    const pineScore = this.scorePineScript(code)

    const max = Math.max(mql5Score, mql4Score, pineScore)
    if (max === 0) return 'unknown'
    if (mql5Score === max) return 'mql5'
    if (mql4Score === max) return 'mql4'
    return 'pinescript'
  }

  private scoreMQL5(code: string): number {
    let score = 0
    if (/\bOnInit\s*\(/.test(code)) score += 3
    if (/\bOnTick\s*\(/.test(code)) score += 3
    if (/\bOnDeinit\s*\(/.test(code)) score += 2
    if (/\bOnCalculate\s*\(/.test(code)) score += 3
    if (/\bCTrade\b/.test(code)) score += 3
    if (/\bCPositionInfo\b/.test(code)) score += 2
    if (/\binput\s+(?:double|int|string|bool)/.test(code)) score += 2
    if (/\bINDICATOR_DATA\b/.test(code)) score += 2
    if (/\bPlotIndexSetInteger\b/.test(code)) score += 2
    if (/#include\s*<Trade/.test(code)) score += 3
    return score
  }

  private scoreMQL4(code: string): number {
    let score = 0
    if (/\bint\s+init\s*\(\)/.test(code)) score += 3
    if (/\bint\s+start\s*\(\)/.test(code)) score += 3
    if (/\bint\s+deinit\s*\(\)/.test(code)) score += 2
    if (/\bOrderSend\s*\(/.test(code)) score += 2
    if (/\bOrderClose\s*\(/.test(code)) score += 2
    if (/\bOrderModify\s*\(/.test(code)) score += 2
    if (/\biMA\s*\(/.test(code)) score += 2
    if (/\biRSI\s*\(/.test(code)) score += 2
    if (/\bextern\s+(?:double|int|string|bool)/.test(code)) score += 2
    if (/\bIndicatorCounted\s*\(/.test(code)) score += 3
    if (/#property\s+strict/.test(code)) score += 1
    return score
  }

  private scorePineScript(code: string): number {
    let score = 0
    if (/\/\/@version\s*=?\s*\d+/.test(code)) score += 4
    if (/\bstrategy\s*\(/.test(code)) score += 3
    if (/\bindicator\s*\(/.test(code)) score += 3
    if (/\bta\.\w+\s*\(/.test(code)) score += 3
    if (/\bstrategy\.entry\s*\(/.test(code)) score += 3
    if (/\bstrategy\.close\s*\(/.test(code)) score += 2
    if (/\binput\.\w+\s*\(/.test(code)) score += 2
    if (/\bplot\s*\(/.test(code)) score += 1
    if (/\bhline\s*\(/.test(code)) score += 1
    if (/\bcolor\.\w+/.test(code)) score += 1
    return score
  }

  // ── Pattern Detection ───────────────────────────────────────────────────

  /** Detect strategy patterns present in the code. */
  detectPatterns(code: string): { patterns: StrategyPattern[]; confidence: Record<StrategyPattern, number> } {
    const confidence: Partial<Record<StrategyPattern, number>> = {}

    for (const rule of PATTERN_RULES) {
      let matches = 0
      for (const indicator of rule.indicators) {
        if (indicator.test(code)) matches++
      }

      if (matches > 0) {
        const rawScore = (matches / rule.indicators.length) * rule.weight
        confidence[rule.pattern] = Math.round(Math.min(rawScore, 1.0) * 100) / 100
      }
    }

    const patterns = Object.keys(confidence)
      .filter(k => (confidence[k as StrategyPattern] ?? 0) >= 0.3)
      .sort((a, b) => (confidence[b as StrategyPattern] ?? 0) - (confidence[a as StrategyPattern] ?? 0)) as StrategyPattern[]

    // Fill in zero for undetected patterns
    const fullConfidence = {} as Record<StrategyPattern, number>
    for (const rule of PATTERN_RULES) {
      fullConfidence[rule.pattern] = confidence[rule.pattern] ?? 0
    }

    return { patterns, confidence: fullConfidence }
  }

  // ── Risk Assessment ────────────────────────────────────────────────────

  /** Assess risk management quality in the strategy code. */
  assessRisk(code: string, language: TradingLanguage): RiskAssessment {
    const issues: StrategyIssue[] = []
    const codeLower = code.toLowerCase()

    // Stop-loss detection
    const hasStopLoss = /\b(?:stoploss|stop.?loss|sl\b|SL\b|stopLoss|InpStopLoss|stop_loss)/i.test(code)
      || /\bstrategy\.exit\b.*\bstop\b/i.test(code)
    if (!hasStopLoss) {
      issues.push({
        severity: 'critical',
        category: 'risk',
        message: 'No stop-loss detected — strategy has unlimited downside risk',
        suggestion: 'Add a stop-loss to every trade to protect capital',
      })
    }

    // Take-profit detection
    const hasTakeProfit = /\b(?:takeprofit|take.?profit|tp\b|TP\b|TakeProfit|InpTakeProfit|take_profit)/i.test(code)
      || /\bstrategy\.exit\b.*\bprofit\b/i.test(code)
    if (!hasTakeProfit) {
      issues.push({
        severity: 'high',
        category: 'risk',
        message: 'No take-profit detected — trades may miss profit targets',
        suggestion: 'Add take-profit levels to lock in gains',
      })
    }

    // Position sizing
    const hasPositionSizing = /\b(?:lotsize|lot.?size|position.?size|risk.?percent|risk.?pct|AccountBalance|AccountEquity|strategy\.percent_of_equity)/i.test(code)
    if (!hasPositionSizing) {
      issues.push({
        severity: 'high',
        category: 'risk',
        message: 'No dynamic position sizing — using fixed lot size increases risk',
        suggestion: 'Calculate lot size based on account equity and risk percentage',
      })
    }

    // Max drawdown check
    const hasMaxDrawdownCheck = /\b(?:max.?drawdown|drawdown|maxdd|equity.?low|AccountEquity)/i.test(code)
    if (!hasMaxDrawdownCheck) {
      issues.push({
        severity: 'medium',
        category: 'risk',
        message: 'No max drawdown protection detected',
        suggestion: 'Add max drawdown check to pause trading when equity drops too much',
      })
    }

    // Trailing stop
    const hasTrailingStop = /\b(?:trailing|trail.?stop|trailingstop|OrderModify.*trail)/i.test(code)

    // Break-even
    const hasBreakEven = /\b(?:break.?even|breakeven|movesl|move.*stop.*entry)/i.test(code)

    // Risk-reward ratio detection
    let riskRewardRatio: number | null = null
    const slMatch = code.match(/(?:stoploss|stop.?loss|sl)\s*[=:]\s*(\d+)/i)
    const tpMatch = code.match(/(?:takeprofit|take.?profit|tp)\s*[=:]\s*(\d+)/i)
    if (slMatch && tpMatch) {
      const sl = parseInt(slMatch[1], 10)
      const tp = parseInt(tpMatch[1], 10)
      if (sl > 0) {
        riskRewardRatio = Math.round((tp / sl) * 100) / 100
        if (riskRewardRatio < 1) {
          issues.push({
            severity: 'high',
            category: 'risk',
            message: `Risk-reward ratio is ${riskRewardRatio}:1 — below 1:1 minimum`,
            suggestion: 'Increase take-profit or decrease stop-loss for at least 1:1 risk-reward',
          })
        }
      }
    }

    // Max lot size detection
    let maxLotSize: number | null = null
    const lotMatch = code.match(/(?:lot|LotSize|InpLotSize)\s*[=:]\s*([\d.]+)/i)
    if (lotMatch) {
      maxLotSize = parseFloat(lotMatch[1])
      if (maxLotSize > 1.0) {
        issues.push({
          severity: 'medium',
          category: 'risk',
          message: `High lot size detected: ${maxLotSize} — consider dynamic sizing`,
          suggestion: 'Use risk-based position sizing instead of fixed high lot sizes',
        })
      }
    }

    // Martingale warning
    if (/\b(?:martingale|double.*lot|lot.*\*.*2|multiply.*lot)/i.test(code)) {
      issues.push({
        severity: 'critical',
        category: 'risk',
        message: 'Martingale/lot-doubling detected — extremely high risk of account blow-up',
        suggestion: 'Consider fixed fractional position sizing instead of martingale',
      })
    }

    // MQL-specific: multiple orders without max check
    if ((language === 'mql4' || language === 'mql5') && !codeLower.includes('orderstotal') && !codeLower.includes('positionstotal')) {
      if (/\b(?:OrderSend|trade\.Buy|trade\.Sell)\b/.test(code)) {
        issues.push({
          severity: 'medium',
          category: 'risk',
          message: 'No check for maximum open positions before opening new trades',
          suggestion: 'Check OrdersTotal() or PositionsTotal() before placing new orders',
        })
      }
    }

    // Calculate risk score
    let riskScore = 0
    if (hasStopLoss) riskScore += 25
    if (hasTakeProfit) riskScore += 15
    if (hasPositionSizing) riskScore += 20
    if (hasMaxDrawdownCheck) riskScore += 15
    if (hasTrailingStop) riskScore += 10
    if (hasBreakEven) riskScore += 5
    if (riskRewardRatio !== null && riskRewardRatio >= 1) riskScore += 10

    return {
      hasStopLoss,
      hasTakeProfit,
      hasPositionSizing,
      hasMaxDrawdownCheck,
      hasTrailingStop,
      hasBreakEven,
      riskRewardRatio,
      maxLotSize,
      riskScore: Math.min(riskScore, 100),
      issues,
    }
  }

  // ── Code Quality Analysis ──────────────────────────────────────────────

  /** Analyze code quality of a trading strategy. */
  analyzeCodeQuality(code: string, language: TradingLanguage): CodeQualityResult {
    const issues: StrategyIssue[] = []

    // Error handling detection
    const hasErrorHandling = this.detectErrorHandling(code, language)
    if (!hasErrorHandling) {
      issues.push({
        severity: 'high',
        category: 'quality',
        message: 'No error handling detected — trades may fail silently',
        suggestion: language === 'mql4'
          ? 'Check GetLastError() after OrderSend/OrderClose calls'
          : language === 'mql5'
            ? 'Check trade.ResultRetcode() after trade operations'
            : 'Add error handling for edge cases',
      })
    }

    // Magic number usage
    const hasMagicNumber = /\b(?:MagicNumber|magic|MAGIC|ExpertMagicNumber)\b/i.test(code)
    if ((language === 'mql4' || language === 'mql5') && !hasMagicNumber) {
      issues.push({
        severity: 'medium',
        category: 'quality',
        message: 'No magic number — cannot distinguish EA trades from manual trades',
        suggestion: 'Use a unique magic number for this EA to identify its trades',
      })
    }

    // Comments detection
    const lines = code.split('\n')
    const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*') || l.trim().startsWith('*')).length
    const hasComments = commentLines >= Math.max(2, lines.length * 0.05)
    if (!hasComments) {
      issues.push({
        severity: 'low',
        category: 'quality',
        message: 'Insufficient code comments — strategy logic should be documented',
        suggestion: 'Add comments explaining the trading logic and key decisions',
      })
    }

    // Input validation
    const hasInputValidation = /\b(?:if\s*\(.*(?:lot|period|stop|take).*[<>=]|MathMax|MathMin|math\.max|math\.min|clamp)/i.test(code)
    if (!hasInputValidation) {
      issues.push({
        severity: 'medium',
        category: 'quality',
        message: 'No input validation — invalid parameters could cause unexpected behavior',
        suggestion: 'Validate input parameters (e.g., lot size > 0, periods > 0)',
      })
    }

    // Resource cleanup (MQL)
    const hasResourceCleanup = language === 'pinescript' ? true :
      /\b(?:deinit|OnDeinit|ObjectDelete|IndicatorRelease|ArrayFree|Comment\(""))\b/.test(code)
    if (!hasResourceCleanup && (language === 'mql4' || language === 'mql5')) {
      issues.push({
        severity: 'low',
        category: 'quality',
        message: 'No resource cleanup in deinit/OnDeinit — may leave chart objects',
        suggestion: 'Clean up chart objects and release resources in deinit/OnDeinit',
      })
    }

    // Logging detection
    const hasLogging = /\b(?:Print|PrintFormat|Alert|Comment|log\.)\b/i.test(code)
    if (!hasLogging) {
      issues.push({
        severity: 'low',
        category: 'quality',
        message: 'No logging/print statements — difficult to debug in production',
        suggestion: 'Add Print/Alert statements for key trading events',
      })
    }

    // #property strict (MQL4)
    if (language === 'mql4' && !/#property\s+strict/.test(code)) {
      issues.push({
        severity: 'medium',
        category: 'best-practice',
        message: 'Missing #property strict — enables better error detection',
        suggestion: 'Add #property strict at the top of your MQL4 file',
      })
    }

    // @version annotation (PineScript)
    if (language === 'pinescript' && !/\/\/@version\s*=?\s*\d+/.test(code)) {
      issues.push({
        severity: 'medium',
        category: 'best-practice',
        message: 'Missing //@version annotation — PineScript version should be specified',
        suggestion: 'Add //@version=5 at the top of your PineScript file',
      })
    }

    // Calculate quality score
    let qualityScore = 0
    if (hasErrorHandling) qualityScore += 25
    if (hasMagicNumber || language === 'pinescript') qualityScore += 15
    if (hasComments) qualityScore += 15
    if (hasInputValidation) qualityScore += 15
    if (hasResourceCleanup) qualityScore += 15
    if (hasLogging) qualityScore += 15

    return {
      hasErrorHandling,
      hasMagicNumber,
      hasComments,
      hasInputValidation,
      hasResourceCleanup,
      hasLogging,
      qualityScore: Math.min(qualityScore, 100),
      issues,
    }
  }

  private detectErrorHandling(code: string, language: TradingLanguage): boolean {
    switch (language) {
      case 'mql4':
        return /\bGetLastError\s*\(\)/.test(code) || /\bticket\s*[<>=]/.test(code)
      case 'mql5':
        return /\bResultRetcode\b/.test(code) || /\bRETCODE\b/.test(code) || /\bGetLastError\s*\(\)/.test(code)
      case 'pinescript':
        return /\bna\b/.test(code) || /\bnz\s*\(/.test(code) || /\bbarstate\b/.test(code)
      default:
        return false
    }
  }

  // ── Performance Analysis ───────────────────────────────────────────────

  /** Analyze performance characteristics of the strategy code. */
  analyzePerformance(code: string, language: TradingLanguage): PerformanceResult {
    const issues: StrategyIssue[] = []

    // Excessive indicator calls
    const indicatorCalls = (code.match(/\b(?:iMA|iRSI|iMACD|iStochastic|iBollinger|iATR|iCCI|iADX|ta\.\w+)\s*\(/g) || []).length
    const excessiveIndicatorCalls = indicatorCalls > 10
    if (excessiveIndicatorCalls) {
      issues.push({
        severity: 'medium',
        category: 'performance',
        message: `${indicatorCalls} indicator calls detected — may slow down execution`,
        suggestion: 'Cache indicator values in variables instead of recalculating',
      })
    }

    // Optimizable loops
    const hasOptimizableLoops = /\bfor\s*\(.*Bars\b/.test(code) || /\bfor\s*\(.*rates_total\b/.test(code)
    const usesCountedBars = /\b(?:IndicatorCounted|prev_calculated)\b/.test(code)
    if (hasOptimizableLoops && !usesCountedBars) {
      issues.push({
        severity: 'high',
        category: 'performance',
        message: 'Loop iterates over all bars without using counted bars optimization',
        suggestion: language === 'mql4'
          ? 'Use IndicatorCounted() to skip already-calculated bars'
          : 'Use prev_calculated to skip already-calculated bars',
      })
    }

    // Redundant calculations
    const hasRedundantCalculations = this.detectRedundantCalcs(code)
    if (hasRedundantCalculations) {
      issues.push({
        severity: 'low',
        category: 'performance',
        message: 'Possible redundant calculations detected',
        suggestion: 'Store repeated calculations in variables',
      })
    }

    // Using built-in functions
    const usesBuiltinFunctions = this.detectBuiltinUsage(code, language)
    if (!usesBuiltinFunctions && (language === 'mql4' || language === 'mql5')) {
      issues.push({
        severity: 'low',
        category: 'performance',
        message: 'Custom indicator calculation instead of built-in functions',
        suggestion: 'Use built-in indicator functions (iMA, iRSI, etc.) for better performance',
      })
    }

    // String concatenation in loops (MQL)
    if (/\bfor\s*\([\s\S]*?(?:StringAdd|StringConcatenate|\+\s*")/m.test(code)) {
      issues.push({
        severity: 'low',
        category: 'performance',
        message: 'String operations inside loops may impact performance',
        suggestion: 'Use StringConcatenate or build strings outside the loop',
      })
    }

    // Calculate performance score
    let performanceScore = 100
    if (excessiveIndicatorCalls) performanceScore -= 20
    if (hasOptimizableLoops && !usesCountedBars) performanceScore -= 25
    if (hasRedundantCalculations) performanceScore -= 15
    if (!usesBuiltinFunctions && language !== 'pinescript') performanceScore -= 10

    return {
      excessiveIndicatorCalls,
      hasOptimizableLoops,
      hasRedundantCalculations,
      usesBuiltinFunctions,
      performanceScore: Math.max(performanceScore, 0),
      issues,
    }
  }

  private detectRedundantCalcs(code: string): boolean {
    // Check for same indicator called multiple times with same params
    const calls = code.match(/\b(?:iMA|iRSI|iMACD|ta\.sma|ta\.ema|ta\.rsi)\s*\([^)]+\)/g) || []
    const unique = new Set(calls.map(c => c.replace(/\s+/g, '')))
    return calls.length > unique.size
  }

  private detectBuiltinUsage(code: string, language: TradingLanguage): boolean {
    if (language === 'mql4') {
      return /\b(?:iMA|iRSI|iMACD|iStochastic|iATR|iBollinger|iCCI)\s*\(/.test(code)
    }
    if (language === 'mql5') {
      return /\b(?:iMA|iRSI|iMACD|iStochastic|iATR|iBands|iCCI)\s*\(/.test(code)
        || /\bCIndicator\b/.test(code)
    }
    return true // PineScript always uses built-in ta.*
  }

  // ── Backtest Quality Assessment ────────────────────────────────────────

  /** Assess the quality of backtesting implementation. */
  assessBacktestQuality(code: string, language: TradingLanguage): BacktestQuality {
    const issues: StrategyIssue[] = []

    // Spread consideration
    const hasSpreadConsideration = /\b(?:spread|Spread|Ask\s*-\s*Bid|MarketInfo.*MODE_SPREAD|SymbolInfoDouble.*SPREAD|slippage)/i.test(code)
    if (!hasSpreadConsideration) {
      issues.push({
        severity: 'medium',
        category: 'logic',
        message: 'No spread/slippage consideration — backtest results may be unrealistic',
        suggestion: 'Account for spread in entry/exit calculations',
      })
    }

    // Slippage handling
    const hasSlippageHandling = /\b(?:slippage|Slippage|SLIPPAGE|deviation|maxDeviation)/i.test(code)
    if (!hasSlippageHandling && language !== 'pinescript') {
      issues.push({
        severity: 'low',
        category: 'logic',
        message: 'No slippage parameter — orders may execute at unexpected prices',
        suggestion: 'Add slippage/deviation parameter to order functions',
      })
    }

    // Commission modeling
    const hasCommissionModeling = /\b(?:commission|Commission|COMMISSION|fee|cost.*trade)/i.test(code)
      || /\bstrategy\s*\(.*commission/i.test(code)
    if (!hasCommissionModeling) {
      issues.push({
        severity: 'low',
        category: 'logic',
        message: 'No commission modeling — profits may be overstated',
        suggestion: language === 'pinescript'
          ? 'Add commission parameter to strategy() declaration'
          : 'Account for trading costs in profit calculations',
      })
    }

    // Multi-timeframe usage
    const hasMultiTimeframe = /\b(?:iMA\s*\(\s*NULL\s*,\s*PERIOD_(?!CURRENT)|request\.multi|security\s*\(|timeframe\.)/i.test(code)
      || /\binput\.timeframe\b/.test(code)

    // Out-of-sample / walk-forward
    const hasOutOfSampleTest = /\b(?:walk.?forward|out.?of.?sample|oos|validation.?period|isTesting|IsOptimization)/i.test(code)

    // Calculate backtest score
    let backtestScore = 40 // Base: just having code
    if (hasSpreadConsideration) backtestScore += 20
    if (hasSlippageHandling) backtestScore += 15
    if (hasCommissionModeling) backtestScore += 10
    if (hasMultiTimeframe) backtestScore += 10
    if (hasOutOfSampleTest) backtestScore += 5

    return {
      hasSpreadConsideration,
      hasSlippageHandling,
      hasCommissionModeling,
      hasMultiTimeframe,
      hasOutOfSampleTest,
      backtestScore: Math.min(backtestScore, 100),
      issues,
    }
  }

  // ── Suggestion Generation ──────────────────────────────────────────────

  /** Generate prioritized suggestions based on issues. */
  generateSuggestions(issues: StrategyIssue[], patterns: StrategyPattern[], language: TradingLanguage): string[] {
    const suggestions: string[] = []

    // Critical issues first
    const criticals = issues.filter(i => i.severity === 'critical')
    for (const issue of criticals) {
      suggestions.push(`🔴 CRITICAL: ${issue.suggestion}`)
    }

    // High issues
    const highs = issues.filter(i => i.severity === 'high')
    for (const issue of highs) {
      suggestions.push(`🟠 HIGH: ${issue.suggestion}`)
    }

    // Pattern-specific suggestions
    if (patterns.includes('martingale')) {
      suggestions.push('⚠️ Martingale strategies have a mathematical certainty of account blow-up given enough trades. Consider fixed-risk alternatives.')
    }

    if (patterns.includes('grid') && !issues.some(i => i.message.includes('drawdown'))) {
      suggestions.push('💡 Grid strategies can accumulate large drawdowns. Consider implementing max grid levels and equity-based stop.')
    }

    // Language-specific suggestions
    if (language === 'mql4') {
      if (!/#property\s+strict/.test('')) { // Always suggest for MQL4
        suggestions.push('💡 MQL4: Consider migrating to MQL5 for better object-oriented design and hedging support.')
      }
    }

    if (language === 'pinescript') {
      if (patterns.length > 0) {
        suggestions.push('💡 PineScript: Use strategy.exit() with both stop and limit for complete trade management.')
      }
    }

    // Medium issues
    const mediums = issues.filter(i => i.severity === 'medium')
    for (const issue of mediums) {
      suggestions.push(`🟡 ${issue.suggestion}`)
    }

    return suggestions
  }

  // ── Summary Generation ─────────────────────────────────────────────────

  /** Generate a human-readable summary. */
  generateSummary(language: TradingLanguage, patterns: StrategyPattern[], score: number, issues: StrategyIssue[]): string {
    const langName = language === 'mql4' ? 'MQL4' : language === 'mql5' ? 'MQL5' : language === 'pinescript' ? 'PineScript' : 'Unknown'
    const patternStr = patterns.length > 0
      ? patterns.join(', ')
      : 'no clear pattern'

    const critCount = issues.filter(i => i.severity === 'critical').length
    const highCount = issues.filter(i => i.severity === 'high').length

    const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F'

    let summary = `${langName} strategy analysis: Grade ${grade} (${score}/100). `
    summary += `Detected patterns: ${patternStr}. `

    if (critCount > 0) {
      summary += `⚠️ ${critCount} critical issue(s) found. `
    }
    if (highCount > 0) {
      summary += `${highCount} high-priority issue(s). `
    }

    const totalIssues = issues.length
    if (totalIssues === 0) {
      summary += 'No issues detected — well-structured strategy.'
    } else {
      summary += `Total: ${totalIssues} issue(s) to address.`
    }

    return summary
  }

  // ── Stats ──────────────────────────────────────────────────────────────

  /** Get analyzer statistics. */
  getStats(): TradingStrategyAnalyzerStats {
    return { ...this.stats }
  }

  /** Reset statistics. */
  resetStats(): void {
    this.stats = {
      totalAnalyses: 0,
      avgOverallScore: 0,
      avgRiskScore: 0,
      avgQualityScore: 0,
      patternsDetected: {} as Record<StrategyPattern, number>,
      issuesByCategory: {},
      languageBreakdown: {} as Record<TradingLanguage, number>,
    }
  }

  private updateStats(
    language: TradingLanguage,
    patterns: StrategyPattern[],
    overallScore: number,
    riskScore: number,
    qualityScore: number,
    issues: StrategyIssue[],
  ): void {
    const n = this.stats.totalAnalyses
    this.stats.totalAnalyses++
    this.stats.avgOverallScore = (this.stats.avgOverallScore * n + overallScore) / (n + 1)
    this.stats.avgRiskScore = (this.stats.avgRiskScore * n + riskScore) / (n + 1)
    this.stats.avgQualityScore = (this.stats.avgQualityScore * n + qualityScore) / (n + 1)

    for (const p of patterns) {
      this.stats.patternsDetected[p] = (this.stats.patternsDetected[p] ?? 0) + 1
    }

    for (const issue of issues) {
      this.stats.issuesByCategory[issue.category] = (this.stats.issuesByCategory[issue.category] ?? 0) + 1
    }

    this.stats.languageBreakdown[language] = (this.stats.languageBreakdown[language] ?? 0) + 1
  }

  // ── Config ─────────────────────────────────────────────────────────────

  /** Get current configuration. */
  getConfig(): TradingStrategyAnalyzerConfig {
    return { ...this.config }
  }

  /** Update configuration. */
  updateConfig(updates: Partial<TradingStrategyAnalyzerConfig>): void {
    this.config = { ...this.config, ...updates }
  }
}
