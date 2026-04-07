import { describe, it, expect, beforeEach } from 'vitest'
import { MQLCodeFixer } from '../MQLCodeFixer'

describe('MQLCodeFixer', () => {
  let fixer: MQLCodeFixer

  beforeEach(() => {
    fixer = new MQLCodeFixer()
  })

  // ── Constructor & Config ─────────────────────────────────────────────

  describe('constructor & config', () => {
    it('creates with default config', () => {
      expect(fixer).toBeInstanceOf(MQLCodeFixer)
      const cfg = fixer.getConfig()
      expect(cfg.version).toBe('mql4')
      expect(cfg.strictMode).toBe(true)
    })

    it('creates with custom config', () => {
      const f = new MQLCodeFixer({ version: 'mql5', strictMode: false })
      expect(f.getConfig().version).toBe('mql5')
      expect(f.getConfig().strictMode).toBe(false)
    })

    it('updateConfig merges values', () => {
      fixer.updateConfig({ version: 'mql5' })
      expect(fixer.getConfig().version).toBe('mql5')
      expect(fixer.getConfig().strictMode).toBe(true)
    })

    it('initial stats are zeroed', () => {
      const stats = fixer.getStats()
      expect(stats.totalDiagnoses).toBe(0)
      expect(stats.totalFixes).toBe(0)
      expect(stats.totalMigrations).toBe(0)
    })
  })

  // ── Error Lookup ─────────────────────────────────────────────────────

  describe('error lookup', () => {
    it('looks up ERR_INVALID_STOPS (130)', () => {
      const err = fixer.lookupError(130)
      expect(err).toBeDefined()
      expect(err!.name).toBe('ERR_INVALID_STOPS')
      expect(err!.category).toBe('trade-execution')
    })

    it('looks up ERR_INVALID_TRADE_VOLUME (131)', () => {
      const err = fixer.lookupError(131)
      expect(err).toBeDefined()
      expect(err!.commonCauses.length).toBeGreaterThan(0)
    })

    it('looks up ERR_NOT_ENOUGH_MONEY (134)', () => {
      const err = fixer.lookupError(134)
      expect(err).toBeDefined()
      expect(err!.fix).toContain('margin')
    })

    it('looks up ERR_REQUOTE (138)', () => {
      const err = fixer.lookupError(138)
      expect(err).toBeDefined()
      expect(err!.codeExample).toBeDefined()
    })

    it('looks up ERR_TRADE_CONTEXT_BUSY (146)', () => {
      const err = fixer.lookupError(146)
      expect(err).toBeDefined()
      expect(err!.fix).toContain('IsTradeContextBusy')
    })

    it('looks up MQL5 TRADE_RETCODE_REQUOTE (10004)', () => {
      const err = fixer.lookupError(10004)
      expect(err).toBeDefined()
      expect(err!.mqlVersion).toBe('mql5')
    })

    it('looks up MQL5 TRADE_RETCODE_INVALID_STOPS (10013)', () => {
      const err = fixer.lookupError(10013)
      expect(err).toBeDefined()
    })

    it('looks up MQL5 TRADE_RETCODE_NO_MONEY (10019)', () => {
      const err = fixer.lookupError(10019)
      expect(err).toBeDefined()
      expect(err!.codeExample).toContain('OrderCalcMargin')
    })

    it('looks up runtime ERR_ARRAY_INDEX_OUT_OF_RANGE (4002)', () => {
      const err = fixer.lookupError(4002)
      expect(err).toBeDefined()
      expect(err!.category).toBe('runtime')
    })

    it('looks up runtime ERR_ZERO_DIVIDE (4003)', () => {
      const err = fixer.lookupError(4003)
      expect(err).toBeDefined()
    })

    it('returns undefined for unknown error code', () => {
      expect(fixer.lookupError(99999)).toBeUndefined()
    })

    it('getErrorsByCategory returns trade-execution errors', () => {
      const errs = fixer.getErrorsByCategory('trade-execution')
      expect(errs.length).toBeGreaterThan(5)
      for (const e of errs) expect(e.category).toBe('trade-execution')
    })

    it('getErrorsByCategory returns runtime errors', () => {
      const errs = fixer.getErrorsByCategory('runtime')
      expect(errs.length).toBeGreaterThan(0)
    })

    it('getErrorsByVersion returns mql4 errors', () => {
      const errs = fixer.getErrorsByVersion('mql4')
      for (const e of errs) expect(e.mqlVersion === 'mql4' || e.mqlVersion === 'both').toBe(true)
    })

    it('getErrorsByVersion returns mql5 errors', () => {
      const errs = fixer.getErrorsByVersion('mql5')
      expect(errs.length).toBeGreaterThan(5)
    })

    it('getAllErrors returns full database', () => {
      expect(fixer.getAllErrors().length).toBe(fixer.getErrorDatabaseSize())
    })
  })

  // ── Error Diagnosis ──────────────────────────────────────────────────

  describe('error diagnosis', () => {
    it('diagnoses error 130 successfully', () => {
      const result = fixer.diagnoseError(130)
      expect(result.found).toBe(true)
      expect(result.info!.name).toBe('ERR_INVALID_STOPS')
      expect(result.quickFix).toBeDefined()
    })

    it('diagnoses error 138 with code example', () => {
      const result = fixer.diagnoseError(138)
      expect(result.found).toBe(true)
      expect(result.quickFix).toContain('RefreshRates')
    })

    it('returns found=false for unknown error', () => {
      expect(fixer.diagnoseError(99999).found).toBe(false)
    })

    it('increments totalDiagnoses stat', () => {
      fixer.diagnoseError(130)
      fixer.diagnoseError(131)
      expect(fixer.getStats().totalDiagnoses).toBe(2)
    })

    it('tracks errors by category', () => {
      fixer.diagnoseError(130)
      fixer.diagnoseError(131)
      expect(fixer.getStats().errorsByCategory['trade-execution']).toBe(2)
    })
  })

  // ── Compilation Error Diagnosis ──────────────────────────────────────

  describe('compilation error diagnosis', () => {
    it('diagnoses undeclared identifier', () => {
      const result = fixer.diagnoseCompilationError("'total' - undeclared identifier")
      expect(result.found).toBe(true)
      expect(result.error!.fix).toContain('Declare')
    })

    it('diagnoses implicit conversion', () => {
      const result = fixer.diagnoseCompilationError("implicit conversion from 'double' to 'int'")
      expect(result.found).toBe(true)
      expect(result.error!.example).toBeDefined()
    })

    it('diagnoses missing semicolon', () => {
      const result = fixer.diagnoseCompilationError("';' expected")
      expect(result.found).toBe(true)
    })

    it('diagnoses missing brace', () => {
      const result = fixer.diagnoseCompilationError("'}' expected")
      expect(result.found).toBe(true)
    })

    it('diagnoses constant expression required', () => {
      const result = fixer.diagnoseCompilationError('constant expression required')
      expect(result.found).toBe(true)
      expect(result.error!.example).toBeDefined()
    })

    it('diagnoses possible loss of data', () => {
      const result = fixer.diagnoseCompilationError('possible loss of data')
      expect(result.found).toBe(true)
    })

    it('returns found=false for unknown error', () => {
      const result = fixer.diagnoseCompilationError('some random message')
      expect(result.found).toBe(false)
    })

    it('increments totalDiagnoses for compilation errors', () => {
      fixer.diagnoseCompilationError("'x' - undeclared identifier")
      expect(fixer.getStats().totalDiagnoses).toBe(1)
    })
  })

  // ── Code Scanning ────────────────────────────────────────────────────

  describe('code scanning', () => {
    it('detects unchecked OrderSend', () => {
      const code = 'OrderSend(Symbol(), OP_BUY, 0.1, Ask, 3, sl, tp, "test", 0, 0);'
      const issues = fixer.scanCode(code, 'mql4')
      const unchecked = issues.find(i => i.issue === 'unchecked-ordersend')
      expect(unchecked).toBeDefined()
      expect(unchecked!.severity).toBe('critical')
    })

    it('detects unchecked OrderClose', () => {
      const code = 'OrderClose(ticket, lots, Bid, 3);'
      const issues = fixer.scanCode(code, 'mql4')
      expect(issues.find(i => i.issue === 'unchecked-orderclose')).toBeDefined()
    })

    it('detects unchecked OrderModify', () => {
      const code = 'OrderModify(ticket, price, sl, tp, 0);'
      const issues = fixer.scanCode(code, 'mql4')
      expect(issues.find(i => i.issue === 'unchecked-ordermodify')).toBeDefined()
    })

    it('detects forward loop for closing orders', () => {
      const code = 'for(int i = 0; i < OrdersTotal(); i++)'
      const issues = fixer.scanCode(code, 'mql4')
      expect(issues.find(i => i.issue === 'forward-loop-close')).toBeDefined()
    })

    it('detects MQL5 unchecked trade operations', () => {
      const code = 'trade.Buy(0.1, Symbol(), 0, 0, 0);'
      const issues = fixer.scanCode(code, 'mql5')
      expect(issues.find(i => i.issue === 'mql5-unchecked-trade')).toBeDefined()
    })

    it('increments totalFixes stat', () => {
      const code = 'OrderSend(Symbol(), OP_BUY, 0.1, Ask, 3, 0, 0);'
      fixer.scanCode(code, 'mql4')
      expect(fixer.getStats().totalFixes).toBeGreaterThan(0)
    })

    it('returns empty for clean code without OrderSend', () => {
      const code = `if(ticket < 0) Print("Error: ", GetLastError());
int total = OrdersTotal();`
      const issues = fixer.scanCode(code, 'mql4')
      // Should not find ordersend issues since there's no OrderSend
      expect(issues.find(i => i.issue === 'unchecked-ordersend')).toBeUndefined()
    })

    it('each fix suggestion has required fields', () => {
      const code = 'OrderSend(Symbol(), OP_BUY, 0.1, Ask, 3, 0, 0);'
      const issues = fixer.scanCode(code, 'mql4')
      for (const issue of issues) {
        expect(issue.issue).toBeDefined()
        expect(issue.severity).toBeDefined()
        expect(issue.fix).toBeDefined()
        expect(issue.explanation).toBeDefined()
      }
    })
  })

  // ── Error Handler Templates ──────────────────────────────────────────

  describe('error handler templates', () => {
    it('generates MQL4 OrderSend handler', () => {
      const tmpl = fixer.generateErrorHandler('ordersend', 'mql4')
      expect(tmpl).toBeDefined()
      expect(tmpl!.code).toContain('SafeOrderSend')
      expect(tmpl!.code).toContain('GetLastError')
      expect(tmpl!.version).toBe('mql4')
    })

    it('generates MQL5 CTrade handler', () => {
      const tmpl = fixer.generateErrorHandler('trade', 'mql5')
      expect(tmpl).toBeDefined()
      expect(tmpl!.code).toContain('CSafeTrade')
      expect(tmpl!.code).toContain('ResultRetcode')
    })

    it('generates MQL4 order management handler', () => {
      const tmpl = fixer.generateErrorHandler('orderclose', 'mql4')
      expect(tmpl).toBeDefined()
      expect(tmpl!.code).toContain('SafeOrderClose')
    })

    it('generates MQL5 position management handler', () => {
      const tmpl = fixer.generateErrorHandler('position', 'mql5')
      expect(tmpl).toBeDefined()
      expect(tmpl!.code).toContain('SafePositionClose')
    })

    it('getErrorHandlerTemplates returns all for version', () => {
      const mql4 = fixer.getErrorHandlerTemplates('mql4')
      expect(mql4.length).toBeGreaterThanOrEqual(2)
      for (const t of mql4) expect(t.version).toBe('mql4')
    })

    it('getErrorHandlerTemplates returns mql5 templates', () => {
      const mql5 = fixer.getErrorHandlerTemplates('mql5')
      expect(mql5.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ── Migration Helper ─────────────────────────────────────────────────

  describe('migration helper', () => {
    it('maps AccountBalance to MQL5', () => {
      const m = fixer.getMigrationMapping('AccountBalance')
      expect(m).toBeDefined()
      expect(m!.mql5Equivalent).toContain('ACCOUNT_BALANCE')
    })

    it('maps OrderSend to CTrade', () => {
      const m = fixer.getMigrationMapping('OrderSend')
      expect(m).toBeDefined()
      expect(m!.mql5Equivalent).toContain('CTrade')
    })

    it('maps iMA to handle pattern', () => {
      const m = fixer.getMigrationMapping('iMA')
      expect(m).toBeDefined()
      expect(m!.mql5Equivalent).toContain('CopyBuffer')
    })

    it('maps init() to OnInit()', () => {
      const m = fixer.getMigrationMapping('init')
      expect(m).toBeDefined()
      expect(m!.mql5Equivalent).toContain('OnInit')
    })

    it('maps extern to input', () => {
      const m = fixer.getMigrationMapping('extern')
      expect(m).toBeDefined()
      expect(m!.mql5Equivalent).toContain('input')
    })

    it('maps Ask/Bid to SymbolInfoDouble', () => {
      const m = fixer.getMigrationMapping('Ask')
      expect(m).toBeDefined()
      expect(m!.mql5Equivalent).toContain('SYMBOL_ASK')
    })

    it('getMigrationsByCategory returns Account mappings', () => {
      const acct = fixer.getMigrationsByCategory('Account')
      expect(acct.length).toBeGreaterThanOrEqual(5)
    })

    it('getMigrationsByCategory returns Trading mappings', () => {
      const trading = fixer.getMigrationsByCategory('Trading')
      expect(trading.length).toBeGreaterThanOrEqual(4)
    })

    it('getAllMigrationMappings returns full list', () => {
      expect(fixer.getAllMigrationMappings().length).toBe(fixer.getMigrationMappingCount())
    })

    it('suggestMigration finds replacements in MQL4 code', () => {
      const code = `
extern double Lots = 0.1;
int init() {
  double balance = AccountBalance();
  double equity = AccountEquity();
  return(0);
}
int start() {
  double ma = iMA(NULL, 0, 14, 0, MODE_SMA, PRICE_CLOSE, 0);
  OrderSend(Symbol(), OP_BUY, Lots, Ask, 3, 0, 0);
  return(0);
}`
      const suggestions = fixer.suggestMigration(code)
      expect(suggestions.length).toBeGreaterThanOrEqual(3)
      const hasBalance = suggestions.some(s => s.original.includes('AccountBalance'))
      const hasInit = suggestions.some(s => s.original.includes('init'))
      expect(hasBalance).toBe(true)
      expect(hasInit).toBe(true)
    })

    it('suggestMigration increments stats', () => {
      fixer.suggestMigration('AccountBalance(); OrderSend();')
      expect(fixer.getStats().totalMigrations).toBe(1)
    })
  })

  // ── Database Size Checks ─────────────────────────────────────────────

  describe('database sizes', () => {
    it('has 25+ error codes', () => {
      expect(fixer.getErrorDatabaseSize()).toBeGreaterThanOrEqual(25)
    })

    it('has 8+ compilation patterns', () => {
      expect(fixer.getCompilationPatternCount()).toBeGreaterThanOrEqual(8)
    })

    it('has 10+ code patterns', () => {
      expect(fixer.getCodePatternCount()).toBeGreaterThanOrEqual(10)
    })

    it('has 30+ migration mappings', () => {
      expect(fixer.getMigrationMappingCount()).toBeGreaterThanOrEqual(30)
    })
  })

  // ── Stats ────────────────────────────────────────────────────────────

  describe('stats', () => {
    it('resetStats clears all', () => {
      fixer.diagnoseError(130)
      fixer.scanCode('OrderSend();', 'mql4')
      fixer.suggestMigration('AccountBalance()')
      fixer.resetStats()
      const stats = fixer.getStats()
      expect(stats.totalDiagnoses).toBe(0)
      expect(stats.totalFixes).toBe(0)
      expect(stats.totalMigrations).toBe(0)
    })
  })
})
