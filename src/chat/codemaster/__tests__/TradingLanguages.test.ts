import { describe, it, expect, beforeEach } from 'vitest'
import { MultiLanguageSupport } from '../MultiLanguageSupport'
import { detectLanguageAdvanced } from '../CodeAnalyzer'

// ══════════════════════════════════════════════════════════════════════════════
// MQL4 TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('MQL4 Language Support', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  // ── Profile ──

  it('is included in supported languages', () => {
    expect(mls.getSupportedLanguages()).toContain('mql4')
  })

  it('has a valid profile', () => {
    const profile = mls.getProfile('mql4')
    expect(profile).toBeDefined()
    expect(profile!.displayName).toBe('MQL4')
  })

  it('has correct file extensions', () => {
    const profile = mls.getProfile('mql4')
    expect(profile!.fileExtensions).toContain('.mq4')
    expect(profile!.fileExtensions).toContain('.mqh')
  })

  it('has no package manager', () => {
    const profile = mls.getProfile('mql4')
    expect(profile!.packageManager).toBeNull()
  })

  it('has C-style comments', () => {
    const profile = mls.getProfile('mql4')
    expect(profile!.commentStyle.line).toBe('//')
    expect(profile!.commentStyle.blockStart).toBe('/*')
    expect(profile!.commentStyle.blockEnd).toBe('*/')
  })

  it('uses camelCase naming', () => {
    const profile = mls.getProfile('mql4')
    expect(profile!.namingConvention).toBe('camelCase')
  })

  it('has static typing system', () => {
    const profile = mls.getProfile('mql4')
    expect(profile!.typingSystem).toBe('static')
  })

  it('is procedural and event-driven', () => {
    const profile = mls.getProfile('mql4')
    expect(profile!.paradigms).toContain('procedural')
    expect(profile!.paradigms).toContain('event-driven')
  })

  it('isSupported returns true', () => {
    expect(mls.isSupported('mql4')).toBe(true)
  })

  it('getFileExtension returns .mq4', () => {
    expect(mls.getFileExtension('mql4')).toBe('.mq4')
  })

  // ── Templates ──

  it('writes hello-world template', () => {
    const result = mls.write({ language: 'mql4', template: 'hello-world' })
    expect(result.code).toContain('Print("Hello, MQL4 World!")')
    expect(result.code).toContain('#property strict')
    expect(result.code).toContain('int init()')
    expect(result.code).toContain('int start()')
    expect(result.fileName).toBe('main.mq4')
    expect(result.language).toBe('mql4')
  })

  it('writes function template with name', () => {
    const result = mls.write({ language: 'mql4', template: 'function', name: 'calculateLot' })
    expect(result.code).toContain('void calculateLot()')
    expect(result.fileName).toBe('calculateLot.mq4')
  })

  it('writes class (EA) template with extern parameters', () => {
    const result = mls.write({ language: 'mql4', template: 'class' })
    expect(result.code).toContain('extern double LotSize')
    expect(result.code).toContain('extern int StopLoss')
    expect(result.code).toContain('extern int TakeProfit')
  })

  it('writes module (indicator) template with buffers', () => {
    const result = mls.write({ language: 'mql4', template: 'module' })
    expect(result.code).toContain('#property indicator_chart_window')
    expect(result.code).toContain('#property indicator_buffers')
    expect(result.code).toContain('SetIndexBuffer')
  })

  // ── Common Fixes ──

  it('has at least 2 common fixes', () => {
    const profile = mls.getProfile('mql4')
    expect(profile!.commonFixes.length).toBeGreaterThanOrEqual(2)
  })

  it('fixes OrderSend without error checking', () => {
    const result = mls.fix({
      language: 'mql4',
      code: 'OrderSend(Symbol(), OP_BUY, 0.1, Ask, 3, 0, 0);',
      issues: ['check-order-send'],
    })
    expect(result.fixesApplied).toContain('check-order-send')
    expect(result.fixed).toContain('GetLastError')
    expect(result.unchanged).toBe(false)
  })

  it('commonFixes all reference mql4 language', () => {
    const profile = mls.getProfile('mql4')
    for (const fix of profile!.commonFixes) {
      expect(fix.language).toBe('mql4')
    }
  })

  // ── Language Detection ──

  it('detects MQL4 code with init/start/deinit', () => {
    const code = `
#property copyright "Test"
#property strict

int init() {
  return(INIT_SUCCEEDED);
}

int start() {
  OrderSend(Symbol(), OP_BUY, 0.1, Ask, 3, 0, 0);
  return(0);
}
`
    const result = detectLanguageAdvanced(code)
    expect(result.language).toBe('mql4')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('detects MQL4 from iMA indicator call', () => {
    const code = `
#property indicator_chart_window
double maValue = iMA(NULL, 0, 14, 0, MODE_SMA, PRICE_CLOSE, 0);
`
    const result = detectLanguageAdvanced(code)
    expect(result.language).toBe('mql4')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// MQL5 TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('MQL5 Language Support', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  // ── Profile ──

  it('is included in supported languages', () => {
    expect(mls.getSupportedLanguages()).toContain('mql5')
  })

  it('has a valid profile', () => {
    const profile = mls.getProfile('mql5')
    expect(profile).toBeDefined()
    expect(profile!.displayName).toBe('MQL5')
  })

  it('has correct file extensions', () => {
    const profile = mls.getProfile('mql5')
    expect(profile!.fileExtensions).toContain('.mq5')
    expect(profile!.fileExtensions).toContain('.mqh')
  })

  it('has no package manager', () => {
    const profile = mls.getProfile('mql5')
    expect(profile!.packageManager).toBeNull()
  })

  it('has C-style comments', () => {
    const profile = mls.getProfile('mql5')
    expect(profile!.commentStyle.line).toBe('//')
    expect(profile!.commentStyle.blockStart).toBe('/*')
    expect(profile!.commentStyle.blockEnd).toBe('*/')
  })

  it('uses camelCase naming', () => {
    const profile = mls.getProfile('mql5')
    expect(profile!.namingConvention).toBe('camelCase')
  })

  it('has static typing system', () => {
    const profile = mls.getProfile('mql5')
    expect(profile!.typingSystem).toBe('static')
  })

  it('is object-oriented and event-driven', () => {
    const profile = mls.getProfile('mql5')
    expect(profile!.paradigms).toContain('object-oriented')
    expect(profile!.paradigms).toContain('event-driven')
  })

  it('isSupported returns true', () => {
    expect(mls.isSupported('mql5')).toBe(true)
  })

  it('getFileExtension returns .mq5', () => {
    expect(mls.getFileExtension('mql5')).toBe('.mq5')
  })

  // ── Templates ──

  it('writes hello-world template', () => {
    const result = mls.write({ language: 'mql5', template: 'hello-world' })
    expect(result.code).toContain('Print("Hello, MQL5 World!")')
    expect(result.code).toContain('int OnInit()')
    expect(result.code).toContain('void OnTick()')
    expect(result.code).toContain('void OnDeinit')
    expect(result.fileName).toBe('main.mq5')
    expect(result.language).toBe('mql5')
  })

  it('writes function template with name', () => {
    const result = mls.write({ language: 'mql5', template: 'function', name: 'checkSignal' })
    expect(result.code).toContain('void checkSignal()')
    expect(result.fileName).toBe('checkSignal.mq5')
  })

  it('writes class (EA) template with CTrade', () => {
    const result = mls.write({ language: 'mql5', template: 'class' })
    expect(result.code).toContain('CTrade trade')
    expect(result.code).toContain('#include <Trade\\Trade.mqh>')
    expect(result.code).toContain('input double InpLotSize')
  })

  it('writes module (indicator) template with OnCalculate', () => {
    const result = mls.write({ language: 'mql5', template: 'module' })
    expect(result.code).toContain('int OnCalculate')
    expect(result.code).toContain('#property indicator_buffers')
    expect(result.code).toContain('INDICATOR_DATA')
  })

  // ── Common Fixes ──

  it('has at least 2 common fixes', () => {
    const profile = mls.getProfile('mql5')
    expect(profile!.commonFixes.length).toBeGreaterThanOrEqual(2)
  })

  it('fixes extern to input keyword', () => {
    const result = mls.fix({
      language: 'mql5',
      code: 'extern double LotSize = 0.1;\nextern int StopLoss = 50;',
      issues: ['use-input-keyword'],
    })
    expect(result.fixesApplied).toContain('use-input-keyword')
    expect(result.fixed).toContain('input')
    expect(result.unchanged).toBe(false)
  })

  it('commonFixes all reference mql5 language', () => {
    const profile = mls.getProfile('mql5')
    for (const fix of profile!.commonFixes) {
      expect(fix.language).toBe('mql5')
    }
  })

  // ── Language Detection ──

  it('detects MQL5 code with OnInit/OnTick', () => {
    const code = `
#property copyright "Test"

int OnInit() {
  return(INIT_SUCCEEDED);
}

void OnTick() {
  CTrade trade;
  trade.Buy(0.1);
}

void OnDeinit(const int reason) {
}
`
    const result = detectLanguageAdvanced(code)
    expect(result.language).toBe('mql5')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('detects MQL5 from OnInit and OnDeinit patterns', () => {
    const code = `
#property copyright "MyEA"
#property version   "1.00"

int OnInit() {
  return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason) {
  Print("Removing EA");
}
`
    const result = detectLanguageAdvanced(code)
    expect(result.language).toBe('mql5')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// PINESCRIPT TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('PineScript Language Support', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  // ── Profile ──

  it('is included in supported languages', () => {
    expect(mls.getSupportedLanguages()).toContain('pinescript')
  })

  it('has a valid profile', () => {
    const profile = mls.getProfile('pinescript')
    expect(profile).toBeDefined()
    expect(profile!.displayName).toBe('PineScript')
  })

  it('has correct file extensions', () => {
    const profile = mls.getProfile('pinescript')
    expect(profile!.fileExtensions).toContain('.pine')
  })

  it('has no package manager', () => {
    const profile = mls.getProfile('pinescript')
    expect(profile!.packageManager).toBeNull()
  })

  it('has line comment style', () => {
    const profile = mls.getProfile('pinescript')
    expect(profile!.commentStyle.line).toBe('//')
  })

  it('uses camelCase naming', () => {
    const profile = mls.getProfile('pinescript')
    expect(profile!.namingConvention).toBe('camelCase')
  })

  it('has gradual typing system', () => {
    const profile = mls.getProfile('pinescript')
    expect(profile!.typingSystem).toBe('gradual')
  })

  it('is declarative and functional', () => {
    const profile = mls.getProfile('pinescript')
    expect(profile!.paradigms).toContain('declarative')
    expect(profile!.paradigms).toContain('functional')
  })

  it('isSupported returns true', () => {
    expect(mls.isSupported('pinescript')).toBe(true)
  })

  it('getFileExtension returns .pine', () => {
    expect(mls.getFileExtension('pinescript')).toBe('.pine')
  })

  // ── Templates ──

  it('writes hello-world (indicator) template', () => {
    const result = mls.write({ language: 'pinescript', template: 'hello-world' })
    expect(result.code).toContain('//@version=5')
    expect(result.code).toContain('indicator(')
    expect(result.code).toContain('plot(close')
    expect(result.fileName).toBe('main.pine')
    expect(result.language).toBe('pinescript')
  })

  it('writes function template', () => {
    const result = mls.write({ language: 'pinescript', template: 'function', name: 'mySignal' })
    expect(result.code).toContain('//@version=5')
    expect(result.code).toContain('mySignal')
    expect(result.code).toContain('ta.sma')
    expect(result.fileName).toBe('mySignal.pine')
  })

  it('writes class (strategy) template', () => {
    const result = mls.write({ language: 'pinescript', template: 'class' })
    expect(result.code).toContain('strategy(')
    expect(result.code).toContain('ta.crossover')
    expect(result.code).toContain('strategy.entry')
    expect(result.code).toContain('input.int')
  })

  it('writes module (indicator with RSI) template', () => {
    const result = mls.write({ language: 'pinescript', template: 'module' })
    expect(result.code).toContain('indicator(')
    expect(result.code).toContain('ta.rsi')
    expect(result.code).toContain('hline(')
  })

  // ── Common Fixes ──

  it('has at least 2 common fixes', () => {
    const profile = mls.getProfile('pinescript')
    expect(profile!.commonFixes.length).toBeGreaterThanOrEqual(2)
  })

  it('fixes bare function calls to ta. namespace', () => {
    const result = mls.fix({
      language: 'pinescript',
      code: 'value = sma(close, 14)\nsignal = crossover(fast, slow)',
      issues: ['use-ta-namespace'],
    })
    expect(result.fixesApplied).toContain('use-ta-namespace')
    expect(result.fixed).toContain('ta.sma(close')
    expect(result.fixed).toContain('ta.crossover(fast')
    expect(result.unchanged).toBe(false)
  })

  it('fixes old-style input to input.int', () => {
    const result = mls.fix({
      language: 'pinescript',
      code: 'length = input(14, title="Length")',
      issues: ['use-input-functions'],
    })
    expect(result.fixesApplied).toContain('use-input-functions')
    expect(result.fixed).toContain('input.int(14')
    expect(result.unchanged).toBe(false)
  })

  it('commonFixes all reference pinescript language', () => {
    const profile = mls.getProfile('pinescript')
    for (const fix of profile!.commonFixes) {
      expect(fix.language).toBe('pinescript')
    }
  })

  // ── Language Detection ──

  it('detects PineScript from //@version annotation', () => {
    const code = `//@version=5
indicator("My Indicator", overlay=true)
plot(close, title="Close", color=color.blue)
`
    const result = detectLanguageAdvanced(code)
    expect(result.language).toBe('pinescript')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('detects PineScript from strategy keyword', () => {
    const code = `//@version=5
strategy("My Strategy", overlay=true)
longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))
if longCondition
    strategy.entry("Long", strategy.long)
`
    const result = detectLanguageAdvanced(code)
    expect(result.language).toBe('pinescript')
  })

  it('detects PineScript from ta. namespace usage', () => {
    const code = `
//@version=5
indicator("RSI", overlay=false)
rsiValue = ta.rsi(close, 14)
plot(rsiValue)
`
    const result = detectLanguageAdvanced(code)
    expect(result.language).toBe('pinescript')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// CROSS-LANGUAGE TRADING TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe('Trading Languages Cross-cutting', () => {
  let mls: MultiLanguageSupport

  beforeEach(() => {
    mls = new MultiLanguageSupport()
  })

  it('all 3 trading languages are supported', () => {
    const langs = mls.getSupportedLanguages()
    expect(langs).toContain('mql4')
    expect(langs).toContain('mql5')
    expect(langs).toContain('pinescript')
  })

  it('capabilities summary mentions trading languages', () => {
    const summary = mls.getCapabilitiesSummary()
    expect(summary).toContain('MQL4')
    expect(summary).toContain('MQL5')
    expect(summary).toContain('PineScript')
  })

  it('each trading language has distinct file extensions', () => {
    expect(mls.getFileExtension('mql4')).toBe('.mq4')
    expect(mls.getFileExtension('mql5')).toBe('.mq5')
    expect(mls.getFileExtension('pinescript')).toBe('.pine')
  })

  it('each trading language has at least hello-world and function templates', () => {
    for (const lang of ['mql4', 'mql5', 'pinescript'] as const) {
      const hw = mls.write({ language: lang, template: 'hello-world' })
      expect(hw.code.length).toBeGreaterThan(10)

      const fn = mls.write({ language: lang, template: 'function', name: 'test' })
      expect(fn.code.length).toBeGreaterThan(10)
    }
  })

  it('each trading language has common fixes', () => {
    for (const lang of ['mql4', 'mql5', 'pinescript'] as const) {
      const profile = mls.getProfile(lang)
      expect(profile!.commonFixes.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('write returns correct language in result for all trading languages', () => {
    for (const lang of ['mql4', 'mql5', 'pinescript'] as const) {
      const result = mls.write({ language: lang, template: 'hello-world' })
      expect(result.language).toBe(lang)
    }
  })

  it('fix returns unchanged when no issues match', () => {
    for (const lang of ['mql4', 'mql5', 'pinescript'] as const) {
      const result = mls.fix({
        language: lang,
        code: '// simple comment',
        issues: ['nonexistent-issue'],
      })
      expect(result.unchanged).toBe(true)
      expect(result.fixesApplied).toHaveLength(0)
    }
  })

  it('MQL4 and MQL5 share .mqh header extension', () => {
    const mql4Profile = mls.getProfile('mql4')
    const mql5Profile = mls.getProfile('mql5')
    expect(mql4Profile!.fileExtensions).toContain('.mqh')
    expect(mql5Profile!.fileExtensions).toContain('.mqh')
  })

  it('total language count is now 27', () => {
    expect(mls.getLanguageCount()).toBe(27)
    expect(mls.getSupportedLanguages()).toHaveLength(27)
  })
})
