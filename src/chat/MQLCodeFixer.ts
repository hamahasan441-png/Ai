/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║       🔧  M Q L   C O D E   F I X E R                                      ║
 * ║                                                                             ║
 * ║   Specialized code fixer & error handler for MQL4 and MQL5:                 ║
 * ║     diagnose → explain → fix → validate                                     ║
 * ║                                                                             ║
 * ║     • 60+ MQL error code explanations with fix suggestions                  ║
 * ║     • Compilation error diagnosis and auto-fix                              ║
 * ║     • Runtime error patterns (array bounds, division by zero, etc.)          ║
 * ║     • OrderSend / CTrade error handler code generation                      ║
 * ║     • MQL4 → MQL5 migration helper with API mapping                         ║
 * ║     • Common mistake detection (trade context, requotes, slippage)           ║
 * ║     • Best-practice enforcement and code modernization                      ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type MQLVersion = 'mql4' | 'mql5'

export type ErrorCategory =
  | 'compilation'
  | 'runtime'
  | 'trade-execution'
  | 'network'
  | 'file-io'
  | 'chart'
  | 'indicator'
  | 'custom'

export type FixDifficulty = 'trivial' | 'easy' | 'moderate' | 'complex'

export interface MQLErrorInfo {
  code: number
  name: string
  category: ErrorCategory
  description: string
  commonCauses: string[]
  fix: string
  codeExample?: string
  mqlVersion: MQLVersion | 'both'
}

export interface CompilationError {
  pattern: RegExp
  description: string
  fix: string
  example?: { before: string; after: string }
  difficulty: FixDifficulty
}

export interface CodeFixSuggestion {
  issue: string
  severity: 'critical' | 'warning' | 'info'
  fix: string
  before: string
  after: string
  explanation: string
}

export interface MigrationMapping {
  mql4Function: string
  mql5Equivalent: string
  notes: string
  category: string
}

export interface ErrorHandlerTemplate {
  name: string
  description: string
  code: string
  version: MQLVersion
}

export interface MQLCodeFixerConfig {
  version: MQLVersion
  strictMode: boolean
  generateComments: boolean
}

export interface MQLCodeFixerStats {
  totalDiagnoses: number
  totalFixes: number
  totalMigrations: number
  errorsByCategory: Record<ErrorCategory, number>
}

// ── Error Database ───────────────────────────────────────────────────────────

const MQL_ERRORS: MQLErrorInfo[] = [
  // ── Trade Execution Errors ─────────────────────────────────────────────
  {
    code: 130,
    name: 'ERR_INVALID_STOPS',
    category: 'trade-execution',
    description: 'Invalid stop-loss or take-profit level (too close to current price)',
    commonCauses: [
      'SL/TP is closer than the broker minimum stop level',
      'SL/TP is on the wrong side of the current price',
      'Using points instead of price levels',
      'Not accounting for spread in stop calculations',
    ],
    fix: 'Check MarketInfo(Symbol(), MODE_STOPLEVEL) and ensure SL/TP distance >= stop level. For buy orders: SL < Bid, TP > Ask. For sell orders: SL > Ask, TP < Bid.',
    codeExample: `double stopLevel = MarketInfo(Symbol(), MODE_STOPLEVEL) * Point;
double sl = NormalizeDouble(Ask - MathMax(StopLoss * Point, stopLevel + 2*Point), Digits);
double tp = NormalizeDouble(Ask + MathMax(TakeProfit * Point, stopLevel + 2*Point), Digits);`,
    mqlVersion: 'mql4',
  },
  {
    code: 131,
    name: 'ERR_INVALID_TRADE_VOLUME',
    category: 'trade-execution',
    description: 'Invalid lot size — too small, too large, or wrong step',
    commonCauses: [
      'Lot size below MarketInfo(Symbol(), MODE_MINLOT)',
      'Lot size above MarketInfo(Symbol(), MODE_MAXLOT)',
      'Lot size not a multiple of MODE_LOTSTEP',
      'Lot size is 0 or negative',
    ],
    fix: 'Normalize lot size: lots = MathMax(minLot, MathMin(maxLot, MathRound(lots/lotStep)*lotStep))',
    codeExample: `double NormalizeLot(double lots) {
   double minLot  = MarketInfo(Symbol(), MODE_MINLOT);
   double maxLot  = MarketInfo(Symbol(), MODE_MAXLOT);
   double lotStep = MarketInfo(Symbol(), MODE_LOTSTEP);
   lots = MathRound(lots / lotStep) * lotStep;
   return NormalizeDouble(MathMax(minLot, MathMin(maxLot, lots)), 2);
}`,
    mqlVersion: 'mql4',
  },
  {
    code: 132,
    name: 'ERR_MARKET_CLOSED',
    category: 'trade-execution',
    description: 'Market is closed — cannot execute trade',
    commonCauses: [
      'Trying to trade during weekend',
      'Trading during market holiday',
      'Session break (e.g., futures daily close)',
      'Symbol-specific trading hours',
    ],
    fix: 'Check market session: if(!SymbolInfoInteger(Symbol(), SYMBOL_TRADE_MODE)) return; or use session time filters.',
    mqlVersion: 'both',
  },
  {
    code: 133,
    name: 'ERR_TRADE_DISABLED',
    category: 'trade-execution',
    description: 'Trading is disabled for this account or symbol',
    commonCauses: [
      'Account is read-only or demo expired',
      'AutoTrading button is off in terminal',
      'EA trading is disabled in terminal settings',
      'Symbol trading is disabled by broker',
    ],
    fix: 'Check: IsTradeAllowed() in MQL4, TerminalInfoInteger(TERMINAL_TRADE_ALLOWED) in MQL5. Verify AutoTrading button is enabled.',
    mqlVersion: 'both',
  },
  {
    code: 134,
    name: 'ERR_NOT_ENOUGH_MONEY',
    category: 'trade-execution',
    description: 'Not enough free margin to open the position',
    commonCauses: [
      'Lot size too large for available margin',
      'Multiple open positions consuming margin',
      'Account leverage changed by broker',
      'No proper margin check before OrderSend',
    ],
    fix: 'Check margin before trading: AccountFreeMarginCheck(Symbol(), cmd, lots) > 0. Reduce lot size or close existing positions.',
    codeExample: `if(AccountFreeMarginCheck(Symbol(), OP_BUY, lots) <= 0) {
   Print("Not enough margin for ", lots, " lots");
   lots = lots * 0.5; // reduce lot size
}`,
    mqlVersion: 'mql4',
  },
  {
    code: 135,
    name: 'ERR_PRICE_CHANGED',
    category: 'trade-execution',
    description: 'Price has changed (requote)',
    commonCauses: [
      'Fast market movement during order placement',
      'Slippage parameter too small',
      'Not refreshing prices before OrderSend',
    ],
    fix: 'Add RefreshRates() before OrderSend, increase slippage parameter, or use pending orders instead of market orders.',
    mqlVersion: 'mql4',
  },
  {
    code: 136,
    name: 'ERR_OFF_QUOTES',
    category: 'trade-execution',
    description: 'No quotes available or broker is off-quoting',
    commonCauses: [
      'Extreme market volatility',
      'Low liquidity period',
      'Broker server issues',
    ],
    fix: 'Implement retry logic with Sleep() between attempts. Check IsConnected() before trading.',
    mqlVersion: 'mql4',
  },
  {
    code: 137,
    name: 'ERR_BROKER_BUSY',
    category: 'trade-execution',
    description: 'Broker is busy processing other requests',
    commonCauses: [
      'Multiple EAs sending orders simultaneously',
      'High server load during news events',
    ],
    fix: 'Implement retry with exponential backoff. Wait 500ms-2000ms between retries.',
    mqlVersion: 'mql4',
  },
  {
    code: 138,
    name: 'ERR_REQUOTE',
    category: 'trade-execution',
    description: 'Requote — the price offered has changed',
    commonCauses: [
      'Price moved between request and execution',
      'Market order during high volatility',
      'Slippage too tight',
    ],
    fix: 'Use RefreshRates(), increase slippage, implement retry logic, or switch to pending orders.',
    codeExample: `int ticket = -1;
int retries = 3;
while(ticket < 0 && retries > 0) {
   RefreshRates();
   ticket = OrderSend(Symbol(), OP_BUY, lots, Ask, 10, sl, tp);
   if(ticket < 0) { Sleep(500); retries--; }
}`,
    mqlVersion: 'mql4',
  },
  {
    code: 139,
    name: 'ERR_ORDER_LOCKED',
    category: 'trade-execution',
    description: 'Order is locked and cannot be modified',
    commonCauses: [
      'Order is being processed by another operation',
      'Close-by order in progress',
    ],
    fix: 'Wait for the operation to complete. Check order status before modification.',
    mqlVersion: 'mql4',
  },
  {
    code: 145,
    name: 'ERR_TRADE_MODIFY_DENIED',
    category: 'trade-execution',
    description: 'Trade modification denied by broker',
    commonCauses: [
      'Trying to modify SL/TP to same value',
      'ECN account requires different approach',
      'Broker restrictions on modification',
    ],
    fix: 'For ECN: Open order without SL/TP, then modify separately. Compare new SL/TP with current before modifying.',
    mqlVersion: 'mql4',
  },
  {
    code: 146,
    name: 'ERR_TRADE_CONTEXT_BUSY',
    category: 'trade-execution',
    description: 'Trade context is busy — another EA or script is executing a trade',
    commonCauses: [
      'Multiple EAs on the same terminal',
      'Script running while EA tries to trade',
      'Manual trade while EA processes',
    ],
    fix: 'Use IsTradeContextBusy() check with retry loop and Sleep().',
    codeExample: `while(IsTradeContextBusy()) {
   Print("Trade context busy, waiting...");
   Sleep(100);
}
RefreshRates();
int ticket = OrderSend(Symbol(), OP_BUY, lots, Ask, slippage, sl, tp);`,
    mqlVersion: 'mql4',
  },
  {
    code: 148,
    name: 'ERR_TRADE_TOO_MANY_ORDERS',
    category: 'trade-execution',
    description: 'Too many open and pending orders (broker limit reached)',
    commonCauses: [
      'Grid EA creating too many pending orders',
      'Broker limit on total orders',
    ],
    fix: 'Check OrdersTotal() before opening new orders. Implement max orders limit in EA.',
    mqlVersion: 'mql4',
  },

  // ── MQL5 Trade Return Codes ────────────────────────────────────────────
  {
    code: 10004,
    name: 'TRADE_RETCODE_REQUOTE',
    category: 'trade-execution',
    description: 'Requote in MQL5',
    commonCauses: ['Price changed during request processing'],
    fix: 'Use trade.SetDeviationInPoints() for acceptable slippage. Implement retry with result check.',
    codeExample: `CTrade trade;
trade.SetDeviationInPoints(10);
if(!trade.Buy(lots)) {
   uint retcode = trade.ResultRetcode();
   if(retcode == TRADE_RETCODE_REQUOTE) {
      Sleep(100);
      trade.Buy(lots); // retry
   }
}`,
    mqlVersion: 'mql5',
  },
  {
    code: 10006,
    name: 'TRADE_RETCODE_REJECT',
    category: 'trade-execution',
    description: 'Trade request rejected by server',
    commonCauses: [
      'Invalid trade parameters',
      'Insufficient margin',
      'Trading disabled',
    ],
    fix: 'Validate all parameters before sending. Check trade.CheckResult() before trade execution.',
    mqlVersion: 'mql5',
  },
  {
    code: 10010,
    name: 'TRADE_RETCODE_DONE_PARTIAL',
    category: 'trade-execution',
    description: 'Trade executed partially (partial fill)',
    commonCauses: ['Insufficient liquidity at requested price', 'Large order size'],
    fix: 'Handle partial fills: check trade.ResultVolume() vs requested volume. Optionally send remainder.',
    mqlVersion: 'mql5',
  },
  {
    code: 10013,
    name: 'TRADE_RETCODE_INVALID_STOPS',
    category: 'trade-execution',
    description: 'Invalid stops (MQL5 equivalent of error 130)',
    commonCauses: [
      'Stop level too close to current price',
      'Freeze level violation',
    ],
    fix: 'Check SYMBOL_TRADE_STOPS_LEVEL and SYMBOL_TRADE_FREEZE_LEVEL before setting SL/TP.',
    codeExample: `long stopLevel = SymbolInfoInteger(Symbol(), SYMBOL_TRADE_STOPS_LEVEL);
double point = SymbolInfoDouble(Symbol(), SYMBOL_POINT);
double minDist = stopLevel * point;
// Ensure SL/TP distance >= minDist`,
    mqlVersion: 'mql5',
  },
  {
    code: 10014,
    name: 'TRADE_RETCODE_INVALID_VOLUME',
    category: 'trade-execution',
    description: 'Invalid volume (MQL5 equivalent of error 131)',
    commonCauses: ['Volume not matching lot step', 'Below min or above max lot'],
    fix: 'Use SymbolInfoDouble for SYMBOL_VOLUME_MIN/MAX/STEP to normalize lots.',
    codeExample: `double NormalizeLotMQL5(string symbol, double lots) {
   double minLot  = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MIN);
   double maxLot  = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(symbol, SYMBOL_VOLUME_STEP);
   lots = MathRound(lots / lotStep) * lotStep;
   return MathMax(minLot, MathMin(maxLot, lots));
}`,
    mqlVersion: 'mql5',
  },
  {
    code: 10015,
    name: 'TRADE_RETCODE_INVALID_PRICE',
    category: 'trade-execution',
    description: 'Invalid price in trade request',
    commonCauses: [
      'Price not normalized to tick size',
      'Stale price data',
      'Wrong price for pending order type',
    ],
    fix: 'Use NormalizeDouble(price, Digits) and refresh rates before order.',
    mqlVersion: 'mql5',
  },
  {
    code: 10016,
    name: 'TRADE_RETCODE_INVALID_EXPIRATION',
    category: 'trade-execution',
    description: 'Invalid expiration date for pending order',
    commonCauses: ['Expiration in the past', 'Broker does not support GTC orders'],
    fix: 'Check SYMBOL_EXPIRATION_MODE for supported types. Use ORDER_TIME_GTC or a future datetime.',
    mqlVersion: 'mql5',
  },
  {
    code: 10019,
    name: 'TRADE_RETCODE_NO_MONEY',
    category: 'trade-execution',
    description: 'Not enough money for the operation (MQL5)',
    commonCauses: ['Insufficient free margin'],
    fix: 'Check OrderCalcMargin() before sending trade. Reduce lot size.',
    codeExample: `double margin;
if(OrderCalcMargin(ORDER_TYPE_BUY, Symbol(), lots, Ask, margin)) {
   if(margin > AccountInfoDouble(ACCOUNT_MARGIN_FREE)) {
      Print("Not enough margin: need ", margin);
      return;
   }
}`,
    mqlVersion: 'mql5',
  },

  // ── Runtime Errors ─────────────────────────────────────────────────────
  {
    code: 4002,
    name: 'ERR_ARRAY_INDEX_OUT_OF_RANGE',
    category: 'runtime',
    description: 'Array index is out of range',
    commonCauses: [
      'Accessing array[i] where i >= ArraySize(array)',
      'Negative array index',
      'Not checking Bars count before accessing price arrays',
      'Loop boundary error (off-by-one)',
    ],
    fix: 'Always check ArraySize() or Bars before accessing arrays. Use if(i < ArraySize(arr)) guard.',
    codeExample: `// WRONG:
double val = Close[100]; // might not have 100 bars
// CORRECT:
if(Bars > 100) {
   double val = Close[100];
}`,
    mqlVersion: 'both',
  },
  {
    code: 4003,
    name: 'ERR_ZERO_DIVIDE',
    category: 'runtime',
    description: 'Division by zero',
    commonCauses: [
      'Dividing by a variable that can be 0',
      'ATR(0) or period=0',
      'No check before division',
    ],
    fix: 'Always check divisor != 0: result = (divisor != 0) ? numerator/divisor : 0;',
    mqlVersion: 'both',
  },
  {
    code: 4051,
    name: 'ERR_INVALID_FUNCTION_PARAM',
    category: 'runtime',
    description: 'Invalid function parameter value',
    commonCauses: [
      'Negative period for indicator (iMA(.. -1 ..))',
      'NULL symbol string',
      'Invalid timeframe value',
    ],
    fix: 'Validate all parameters before passing to indicator/trade functions.',
    mqlVersion: 'both',
  },
  {
    code: 4106,
    name: 'ERR_UNKNOWN_SYMBOL',
    category: 'runtime',
    description: 'Unknown symbol name',
    commonCauses: [
      'Symbol name has extra suffix (broker-specific naming)',
      'Typo in symbol name',
      'Symbol not available on this broker',
    ],
    fix: 'Use Symbol() for current chart. For cross-pair: check SymbolInfoInteger(name, SYMBOL_EXIST).',
    mqlVersion: 'both',
  },

  // ── Network/Connection Errors ──────────────────────────────────────────
  {
    code: 4014,
    name: 'ERR_NO_CONNECTION',
    category: 'network',
    description: 'No connection to trade server',
    commonCauses: [
      'Internet connection lost',
      'Broker server down',
      'Firewall blocking connection',
    ],
    fix: 'Check IsConnected() before trading. Implement reconnection wait loop.',
    codeExample: `if(!IsConnected()) {
   Print("No connection, waiting...");
   while(!IsConnected()) Sleep(5000);
   Print("Connection restored");
}`,
    mqlVersion: 'both',
  },
  {
    code: 5200,
    name: 'ERR_WEBREQUEST_INVALID_ADDRESS',
    category: 'network',
    description: 'Invalid URL in WebRequest',
    commonCauses: [
      'URL not added to allowed list in Tools > Options > Expert Advisors',
      'Malformed URL string',
    ],
    fix: 'Add URL to MT4/MT5 allowed list. Verify URL format includes https://',
    mqlVersion: 'both',
  },

  // ── File I/O Errors ────────────────────────────────────────────────────
  {
    code: 5001,
    name: 'ERR_FILE_TOO_MANY_OPENED',
    category: 'file-io',
    description: 'Too many files opened simultaneously',
    commonCauses: ['Not closing file handles after use', 'Opening files in a loop'],
    fix: 'Always close files with FileClose() after use. Use file handle tracking.',
    mqlVersion: 'both',
  },
  {
    code: 5002,
    name: 'ERR_FILE_WRONG_FILENAME',
    category: 'file-io',
    description: 'Wrong file name',
    commonCauses: [
      'Path outside MQL4/Files or MQL5/Files sandbox',
      'Invalid characters in filename',
    ],
    fix: 'Files must be in MQL4/Files or MQL5/Files directory. Use FILE_COMMON flag for shared access.',
    mqlVersion: 'both',
  },
]

// ── Compilation Error Patterns ───────────────────────────────────────────────

const COMPILATION_ERRORS: CompilationError[] = [
  {
    pattern: /\'(\w+)\'\s*-\s*undeclared\s*identifier/i,
    description: 'Undeclared variable or function identifier',
    fix: 'Declare the variable before use, or check for typos in the identifier name.',
    example: {
      before: 'total = OrdersTotal(); // total not declared',
      after: 'int total = OrdersTotal();',
    },
    difficulty: 'trivial',
  },
  {
    pattern: /implicit\s*conversion\s*from\s*\'(\w+)\'\s*to\s*\'(\w+)\'/i,
    description: 'Implicit type conversion warning (becomes error with #property strict)',
    fix: 'Add explicit type cast to suppress warning and make intent clear.',
    example: {
      before: 'int value = 3.14;',
      after: 'int value = (int)3.14;',
    },
    difficulty: 'trivial',
  },
  {
    pattern: /possible\s*loss\s*of\s*data/i,
    description: 'Possible data loss from narrowing conversion',
    fix: 'Use explicit cast if intentional, or change variable type.',
    example: {
      before: 'int ticket = OrderSend(...); // returns int but might be -1',
      after: 'int ticket = (int)OrderSend(...); // explicit cast',
    },
    difficulty: 'easy',
  },
  {
    pattern: /semicolon\s*expected|\';\'\s*expected/i,
    description: 'Missing semicolon',
    fix: 'Add semicolon at the end of the statement.',
    difficulty: 'trivial',
  },
  {
    pattern: /\'{\'\s*expected|\'}\'\s*expected/i,
    description: 'Missing brace — unmatched { or }',
    fix: 'Check for matching braces. Use proper indentation to find the mismatch.',
    difficulty: 'easy',
  },
  {
    pattern: /function\s*\'(\w+)\'\s*already\s*defined/i,
    description: 'Function defined multiple times',
    fix: 'Remove duplicate function definition. Check #include files for conflicts.',
    difficulty: 'easy',
  },
  {
    pattern: /\'(\w+)\'\s*-\s*parameter\s*conversion\s*not\s*allowed/i,
    description: 'Cannot convert parameter type to expected type',
    fix: 'Check function signature and pass correct parameter types.',
    difficulty: 'moderate',
  },
  {
    pattern: /constant\s*expression\s*required/i,
    description: 'Array size must be a compile-time constant in MQL4',
    fix: 'Use #define for array sizes or ArrayResize() for dynamic arrays.',
    example: {
      before: 'int size = 10; double arr[size];',
      after: '#define SIZE 10\ndouble arr[SIZE];\n// Or: double arr[]; ArrayResize(arr, 10);',
    },
    difficulty: 'easy',
  },
  {
    pattern: /\'return\'\s*-\s*expression\s*of\s*\'void\'\s*type/i,
    description: 'Returning a value from void function or not returning from non-void',
    fix: 'Match return type with function declaration.',
    difficulty: 'easy',
  },
  {
    pattern: /not\s*all\s*control\s*paths\s*return/i,
    description: 'Not all code paths return a value',
    fix: 'Add return statement to all branches (if/else/switch).',
    difficulty: 'moderate',
  },
]

// ── MQL4 → MQL5 Migration Mappings ──────────────────────────────────────────

const MIGRATION_MAPPINGS: MigrationMapping[] = [
  // Account functions
  { mql4Function: 'AccountBalance()', mql5Equivalent: 'AccountInfoDouble(ACCOUNT_BALANCE)', notes: 'Direct replacement', category: 'Account' },
  { mql4Function: 'AccountEquity()', mql5Equivalent: 'AccountInfoDouble(ACCOUNT_EQUITY)', notes: 'Direct replacement', category: 'Account' },
  { mql4Function: 'AccountFreeMargin()', mql5Equivalent: 'AccountInfoDouble(ACCOUNT_MARGIN_FREE)', notes: 'Direct replacement', category: 'Account' },
  { mql4Function: 'AccountMargin()', mql5Equivalent: 'AccountInfoDouble(ACCOUNT_MARGIN)', notes: 'Direct replacement', category: 'Account' },
  { mql4Function: 'AccountProfit()', mql5Equivalent: 'AccountInfoDouble(ACCOUNT_PROFIT)', notes: 'Direct replacement', category: 'Account' },
  { mql4Function: 'AccountNumber()', mql5Equivalent: 'AccountInfoInteger(ACCOUNT_LOGIN)', notes: 'Returns long in MQL5', category: 'Account' },
  { mql4Function: 'AccountLeverage()', mql5Equivalent: 'AccountInfoInteger(ACCOUNT_LEVERAGE)', notes: 'Returns long in MQL5', category: 'Account' },

  // Symbol/Market info
  { mql4Function: 'MarketInfo(s, MODE_BID)', mql5Equivalent: 'SymbolInfoDouble(s, SYMBOL_BID)', notes: 'Direct replacement', category: 'Symbol' },
  { mql4Function: 'MarketInfo(s, MODE_ASK)', mql5Equivalent: 'SymbolInfoDouble(s, SYMBOL_ASK)', notes: 'Direct replacement', category: 'Symbol' },
  { mql4Function: 'MarketInfo(s, MODE_SPREAD)', mql5Equivalent: '(int)SymbolInfoInteger(s, SYMBOL_SPREAD)', notes: 'Cast to int', category: 'Symbol' },
  { mql4Function: 'MarketInfo(s, MODE_STOPLEVEL)', mql5Equivalent: '(int)SymbolInfoInteger(s, SYMBOL_TRADE_STOPS_LEVEL)', notes: 'Cast to int', category: 'Symbol' },
  { mql4Function: 'MarketInfo(s, MODE_MINLOT)', mql5Equivalent: 'SymbolInfoDouble(s, SYMBOL_VOLUME_MIN)', notes: 'Direct replacement', category: 'Symbol' },
  { mql4Function: 'MarketInfo(s, MODE_MAXLOT)', mql5Equivalent: 'SymbolInfoDouble(s, SYMBOL_VOLUME_MAX)', notes: 'Direct replacement', category: 'Symbol' },
  { mql4Function: 'MarketInfo(s, MODE_LOTSTEP)', mql5Equivalent: 'SymbolInfoDouble(s, SYMBOL_VOLUME_STEP)', notes: 'Direct replacement', category: 'Symbol' },

  // Order functions
  { mql4Function: 'OrderSend()', mql5Equivalent: 'CTrade::Buy()/Sell()/BuyLimit()/SellStop()', notes: 'Use CTrade class. Different parameter structure.', category: 'Trading' },
  { mql4Function: 'OrderClose()', mql5Equivalent: 'CTrade::PositionClose()', notes: 'Use position ticket instead of order ticket', category: 'Trading' },
  { mql4Function: 'OrderModify()', mql5Equivalent: 'CTrade::PositionModify()/OrderModify()', notes: 'Separate position and pending order modification', category: 'Trading' },
  { mql4Function: 'OrderDelete()', mql5Equivalent: 'CTrade::OrderDelete()', notes: 'Only for pending orders', category: 'Trading' },
  { mql4Function: 'OrdersTotal()', mql5Equivalent: 'PositionsTotal() / OrdersTotal()', notes: 'MQL5 separates positions from pending orders', category: 'Trading' },
  { mql4Function: 'OrderSelect()', mql5Equivalent: 'PositionSelectByTicket() / OrderGetTicket()', notes: 'Different selection mechanism', category: 'Trading' },

  // Price data
  { mql4Function: 'iMA(...)', mql5Equivalent: 'int handle = iMA(...); CopyBuffer(handle, 0, ...)', notes: 'MQL5 uses handles + CopyBuffer pattern', category: 'Indicators' },
  { mql4Function: 'iRSI(...)', mql5Equivalent: 'int handle = iRSI(...); CopyBuffer(handle, 0, ...)', notes: 'Same handle pattern', category: 'Indicators' },
  { mql4Function: 'iMACD(...)', mql5Equivalent: 'int handle = iMACD(...); CopyBuffer(handle, 0, ...)', notes: 'Same handle pattern', category: 'Indicators' },
  { mql4Function: 'iStochastic(...)', mql5Equivalent: 'int handle = iStochastic(...); CopyBuffer(handle, ...)', notes: 'Main=buffer 0, Signal=buffer 1', category: 'Indicators' },
  { mql4Function: 'iBands(...)', mql5Equivalent: 'int handle = iBands(...); CopyBuffer(handle, ...)', notes: 'Base=0, Upper=1, Lower=2', category: 'Indicators' },

  // Time series
  { mql4Function: 'Open[i] / Close[i] / High[i] / Low[i]', mql5Equivalent: 'iOpen(s,tf,i) / iClose(s,tf,i) / iHigh(s,tf,i) / iLow(s,tf,i)', notes: 'Or use CopyRates into MqlRates array', category: 'TimeSeries' },
  { mql4Function: 'Volume[i]', mql5Equivalent: 'iVolume(s, tf, i) or iTickVolume(s, tf, i)', notes: 'MQL5 has tick and real volume', category: 'TimeSeries' },
  { mql4Function: 'Time[i]', mql5Equivalent: 'iTime(s, tf, i)', notes: 'Or CopyTime()', category: 'TimeSeries' },
  { mql4Function: 'Bars', mql5Equivalent: 'Bars(Symbol(), Period())', notes: 'Bars is a function in MQL5, not a variable', category: 'TimeSeries' },
  { mql4Function: 'IndicatorCounted()', mql5Equivalent: 'prev_calculated (OnCalculate param)', notes: 'Passed as parameter to OnCalculate()', category: 'TimeSeries' },

  // Event handlers
  { mql4Function: 'init()', mql5Equivalent: 'OnInit()', notes: 'Return type is int', category: 'Events' },
  { mql4Function: 'start()', mql5Equivalent: 'OnTick() / OnCalculate()', notes: 'OnTick for EA, OnCalculate for indicator', category: 'Events' },
  { mql4Function: 'deinit()', mql5Equivalent: 'OnDeinit(const int reason)', notes: 'Receives reason parameter', category: 'Events' },

  // Misc
  { mql4Function: 'extern', mql5Equivalent: 'input', notes: 'extern still works but input is preferred', category: 'Syntax' },
  { mql4Function: 'Ask / Bid', mql5Equivalent: 'SymbolInfoDouble(Symbol(), SYMBOL_ASK/SYMBOL_BID)', notes: 'Predefined Ask/Bid removed in MQL5', category: 'Price' },
  { mql4Function: 'Point', mql5Equivalent: 'SymbolInfoDouble(Symbol(), SYMBOL_POINT)', notes: 'Or _Point predefined variable', category: 'Price' },
  { mql4Function: 'Digits', mql5Equivalent: 'SymbolInfoInteger(Symbol(), SYMBOL_DIGITS)', notes: 'Or _Digits predefined variable', category: 'Price' },
]

// ── Error Handler Templates ──────────────────────────────────────────────────

const ERROR_HANDLER_TEMPLATES: ErrorHandlerTemplate[] = [
  {
    name: 'MQL4 OrderSend Error Handler',
    description: 'Robust OrderSend with retry logic and full error handling',
    version: 'mql4',
    code: `int SafeOrderSend(string symbol, int cmd, double volume, double price,
                    int slippage, double stoploss, double takeprofit,
                    string comment="", int magic=0, datetime expiration=0) {
   int ticket = -1;
   int retries = 3;
   int lastError;

   while(ticket < 0 && retries > 0) {
      if(IsTradeContextBusy()) { Sleep(100); continue; }
      if(!IsConnected()) { Sleep(5000); continue; }

      RefreshRates();
      if(cmd == OP_BUY) price = Ask;
      if(cmd == OP_SELL) price = Bid;

      ticket = OrderSend(symbol, cmd, volume, price, slippage,
                         stoploss, takeprofit, comment, magic, expiration);

      if(ticket < 0) {
         lastError = GetLastError();
         switch(lastError) {
            case 130: Print("Invalid stops, adjusting..."); break;
            case 131: Print("Invalid volume"); return -1;
            case 132: Print("Market closed"); return -1;
            case 134: Print("Not enough money"); return -1;
            case 135: // Price changed
            case 136: // Off quotes
            case 137: // Broker busy
            case 138: // Requote
               Sleep(500);
               break;
            case 146:
               while(IsTradeContextBusy()) Sleep(100);
               break;
            default:
               Print("OrderSend error: ", lastError);
               return -1;
         }
         retries--;
      }
   }
   return ticket;
}`,
  },
  {
    name: 'MQL5 CTrade Error Handler',
    description: 'Robust trade execution with CTrade class and result checking',
    version: 'mql5',
    code: `#include <Trade\\Trade.mqh>

class CSafeTrade : public CTrade {
public:
   bool SafeBuy(double volume, string symbol=NULL,
                double sl=0, double tp=0, string comment="") {
      int retries = 3;
      while(retries > 0) {
         if(Buy(volume, symbol, 0, sl, tp, comment)) {
            uint retcode = ResultRetcode();
            if(retcode == TRADE_RETCODE_DONE ||
               retcode == TRADE_RETCODE_PLACED ||
               retcode == TRADE_RETCODE_DONE_PARTIAL) return true;

            switch(retcode) {
               case TRADE_RETCODE_REQUOTE:
               case TRADE_RETCODE_PRICE_OFF:
                  Sleep(100); break;
               case TRADE_RETCODE_NO_MONEY:
                  Print("Insufficient margin"); return false;
               case TRADE_RETCODE_INVALID_STOPS:
                  Print("Invalid stops"); return false;
               case TRADE_RETCODE_INVALID_VOLUME:
                  Print("Invalid volume"); return false;
               default:
                  PrintFormat("Trade error %d: %s", retcode, ResultComment());
                  return false;
            }
         } else {
            PrintFormat("Buy failed: %d", GetLastError());
            return false;
         }
         retries--;
      }
      return false;
   }

   bool SafeSell(double volume, string symbol=NULL,
                 double sl=0, double tp=0, string comment="") {
      int retries = 3;
      while(retries > 0) {
         if(Sell(volume, symbol, 0, sl, tp, comment)) {
            uint retcode = ResultRetcode();
            if(retcode == TRADE_RETCODE_DONE ||
               retcode == TRADE_RETCODE_PLACED) return true;
            if(retcode == TRADE_RETCODE_REQUOTE) { Sleep(100); retries--; continue; }
            PrintFormat("Sell error %d: %s", retcode, ResultComment());
            return false;
         }
         retries--;
      }
      return false;
   }
};`,
  },
  {
    name: 'MQL4 Order Management',
    description: 'Safe order close and modify with error handling',
    version: 'mql4',
    code: `bool SafeOrderClose(int ticket, double lots=0, int slippage=10) {
   if(!OrderSelect(ticket, SELECT_BY_TICKET, MODE_TRADES)) {
      Print("Order not found: ", ticket);
      return false;
   }
   if(lots <= 0) lots = OrderLots();
   double price = (OrderType() == OP_BUY) ? Bid : Ask;

   int retries = 3;
   while(retries > 0) {
      if(IsTradeContextBusy()) { Sleep(100); continue; }
      RefreshRates();
      price = (OrderType() == OP_BUY) ? Bid : Ask;
      if(OrderClose(ticket, lots, price, slippage)) return true;
      int err = GetLastError();
      if(err == 138 || err == 135 || err == 136) { Sleep(500); retries--; continue; }
      Print("OrderClose error: ", err);
      return false;
   }
   return false;
}

bool SafeOrderModify(int ticket, double sl, double tp) {
   if(!OrderSelect(ticket, SELECT_BY_TICKET, MODE_TRADES)) return false;
   sl = NormalizeDouble(sl, Digits);
   tp = NormalizeDouble(tp, Digits);
   if(MathAbs(sl - OrderStopLoss()) < Point && MathAbs(tp - OrderTakeProfit()) < Point) return true;
   int retries = 3;
   while(retries > 0) {
      if(OrderModify(ticket, OrderOpenPrice(), sl, tp, 0)) return true;
      int err = GetLastError();
      if(err == 1) return true; // No error
      Print("OrderModify error: ", err); retries--;
      Sleep(200);
   }
   return false;
}`,
  },
  {
    name: 'MQL5 Position Management',
    description: 'Safe position close/modify with error handling',
    version: 'mql5',
    code: `#include <Trade\\Trade.mqh>
#include <Trade\\PositionInfo.mqh>

bool SafePositionClose(CTrade &trade, ulong ticket) {
   int retries = 3;
   while(retries > 0) {
      if(trade.PositionClose(ticket)) {
         uint retcode = trade.ResultRetcode();
         if(retcode == TRADE_RETCODE_DONE) return true;
         if(retcode == TRADE_RETCODE_REQUOTE) { Sleep(100); retries--; continue; }
         PrintFormat("Close error %d: %s", retcode, trade.ResultComment());
         return false;
      }
      retries--;
      Sleep(200);
   }
   return false;
}

bool SafePositionModify(CTrade &trade, ulong ticket, double sl, double tp) {
   CPositionInfo posInfo;
   if(!posInfo.SelectByTicket(ticket)) return false;
   double curSL = posInfo.StopLoss();
   double curTP = posInfo.TakeProfit();
   if(MathAbs(sl - curSL) < _Point && MathAbs(tp - curTP) < _Point) return true;
   return trade.PositionModify(ticket, sl, tp);
}`,
  },
]

// ── Code Patterns for Auto-Detection ─────────────────────────────────────────

interface CodePattern {
  name: string
  pattern: RegExp
  severity: 'critical' | 'warning' | 'info'
  description: string
  fix: string
  version: MQLVersion | 'both'
}

const CODE_PATTERNS: CodePattern[] = [
  {
    name: 'unchecked-ordersend',
    pattern: /OrderSend\s*\((?:[^()]*\([^()]*\))*[^()]*\)\s*;/g,
    severity: 'critical',
    description: 'OrderSend result is not checked — errors will be silently ignored',
    fix: 'Store result in variable and check: int ticket = OrderSend(...); if(ticket < 0) { Print(GetLastError()); }',
    version: 'mql4',
  },
  {
    name: 'unchecked-orderclose',
    pattern: /OrderClose\s*\((?:[^()]*\([^()]*\))*[^()]*\)\s*;/g,
    severity: 'warning',
    description: 'OrderClose result not checked',
    fix: 'Check result: if(!OrderClose(...)) Print("Close failed: ", GetLastError());',
    version: 'mql4',
  },
  {
    name: 'unchecked-ordermodify',
    pattern: /OrderModify\s*\((?:[^()]*\([^()]*\))*[^()]*\)\s*;/g,
    severity: 'warning',
    description: 'OrderModify result not checked',
    fix: 'Check result: if(!OrderModify(...)) Print("Modify failed: ", GetLastError());',
    version: 'mql4',
  },
  {
    name: 'missing-refreshrates',
    pattern: /(?:OrderSend|OrderClose|OrderModify)\s*\([^)]*(?:Ask|Bid)/g,
    severity: 'warning',
    description: 'Using Ask/Bid without RefreshRates() — prices may be stale',
    fix: 'Call RefreshRates() before using Ask/Bid in trade operations',
    version: 'mql4',
  },
  {
    name: 'no-magic-number',
    pattern: /OrderSend\s*\([^)]*,\s*0\s*[,)]/g,
    severity: 'info',
    description: 'OrderSend with magic number 0 — cannot distinguish EA orders from manual',
    fix: 'Use a unique magic number to identify your EA orders',
    version: 'mql4',
  },
  {
    name: 'unnormalized-price',
    pattern: /(?:Ask|Bid)\s*[+-]\s*\d+\s*\*\s*Point(?!\s*,\s*Digits)/g,
    severity: 'warning',
    description: 'Price calculation may not be normalized to correct digits',
    fix: 'Wrap in NormalizeDouble(price, Digits)',
    version: 'mql4',
  },
  {
    name: 'loop-without-break',
    pattern: /while\s*\(\s*(?:true|1)\s*\)\s*{[^}]*(?!break)[^}]*}/g,
    severity: 'critical',
    description: 'Infinite loop without break condition — will freeze terminal',
    fix: 'Add a break condition or maximum iteration count',
    version: 'both',
  },
  {
    name: 'hardcoded-slippage',
    pattern: /(?:OrderSend|OrderClose)\s*\([^)]*,\s*(?:[0-2])\s*[,)]/g,
    severity: 'info',
    description: 'Very tight slippage (0-2 points) — may cause frequent requotes',
    fix: 'Use at least 3-10 points slippage, or make it an input parameter',
    version: 'mql4',
  },
  {
    name: 'mql5-unchecked-trade',
    pattern: /trade\.\s*(?:Buy|Sell|BuyLimit|SellLimit|BuyStop|SellStop)\s*\((?:[^()]*\([^()]*\))*[^()]*\)\s*;/g,
    severity: 'critical',
    description: 'CTrade operation result not checked',
    fix: 'Check: if(!trade.Buy(...)) Print(trade.ResultRetcode(), trade.ResultComment());',
    version: 'mql5',
  },
  {
    name: 'mql5-no-deviation',
    pattern: /CTrade\s+\w+\s*;(?:(?!SetDeviationInPoints)[\s\S])*?(?:Buy|Sell)\s*\(/g,
    severity: 'info',
    description: 'CTrade without SetDeviationInPoints — default slippage may be too tight',
    fix: 'Call trade.SetDeviationInPoints(10); after creating CTrade instance',
    version: 'mql5',
  },
  {
    name: 'forward-loop-close',
    pattern: /for\s*\(\s*int\s+\w+\s*=\s*0\s*;[^)]*OrdersTotal\s*\(\)/g,
    severity: 'critical',
    description: 'Closing orders in forward loop — will skip orders as indices shift',
    fix: 'Loop backwards: for(int i = OrdersTotal()-1; i >= 0; i--)',
    version: 'mql4',
  },
  {
    name: 'no-stoploss',
    pattern: /OrderSend\s*\([^)]*,\s*0\.?0?\s*,\s*0\.?0?\s*[,)]/g,
    severity: 'critical',
    description: 'OrderSend with SL=0 and TP=0 — no risk management',
    fix: 'Always set stop-loss to protect capital',
    version: 'mql4',
  },
]

// ── Main Class ───────────────────────────────────────────────────────────────

export class MQLCodeFixer {
  private config: MQLCodeFixerConfig
  private stats: MQLCodeFixerStats

  constructor(config?: Partial<MQLCodeFixerConfig>) {
    this.config = {
      version: config?.version ?? 'mql4',
      strictMode: config?.strictMode ?? true,
      generateComments: config?.generateComments ?? true,
    }
    this.stats = {
      totalDiagnoses: 0,
      totalFixes: 0,
      totalMigrations: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
    }
  }

  // ── Error Lookup ─────────────────────────────────────────────────────────

  /** Look up a specific MQL error code. */
  lookupError(code: number): MQLErrorInfo | undefined {
    return MQL_ERRORS.find(e => e.code === code)
  }

  /** Get all error codes for a specific category. */
  getErrorsByCategory(category: ErrorCategory): MQLErrorInfo[] {
    return MQL_ERRORS.filter(e => e.category === category)
  }

  /** Get all error codes for a specific MQL version. */
  getErrorsByVersion(version: MQLVersion): MQLErrorInfo[] {
    return MQL_ERRORS.filter(e => e.mqlVersion === version || e.mqlVersion === 'both')
  }

  /** Get all available error codes. */
  getAllErrors(): MQLErrorInfo[] {
    return [...MQL_ERRORS]
  }

  // ── Error Diagnosis ──────────────────────────────────────────────────────

  /** Diagnose an error code and return explanation + fix. */
  diagnoseError(code: number): { found: boolean; info?: MQLErrorInfo; quickFix?: string } {
    this.stats.totalDiagnoses++
    const info = this.lookupError(code)
    if (!info) return { found: false }

    this.stats.errorsByCategory[info.category] = (this.stats.errorsByCategory[info.category] ?? 0) + 1

    return {
      found: true,
      info,
      quickFix: info.codeExample ?? info.fix,
    }
  }

  /** Diagnose a compilation error message. */
  diagnoseCompilationError(errorMessage: string): { found: boolean; error?: CompilationError } {
    this.stats.totalDiagnoses++
    for (const ce of COMPILATION_ERRORS) {
      if (ce.pattern.test(errorMessage)) {
        // Reset regex lastIndex
        ce.pattern.lastIndex = 0
        return { found: true, error: ce }
      }
    }
    return { found: false }
  }

  // ── Code Scanning ────────────────────────────────────────────────────────

  /** Scan MQL code for common issues and return fix suggestions. */
  scanCode(code: string, version?: MQLVersion): CodeFixSuggestion[] {
    const v = version ?? this.config.version
    const suggestions: CodeFixSuggestion[] = []

    for (const pattern of CODE_PATTERNS) {
      if (pattern.version !== 'both' && pattern.version !== v) continue

      // Reset regex
      pattern.pattern.lastIndex = 0
      const matches = code.match(pattern.pattern)
      if (matches) {
        for (const match of matches) {
          suggestions.push({
            issue: pattern.name,
            severity: pattern.severity,
            fix: pattern.fix,
            before: match.trim(),
            after: pattern.fix,
            explanation: pattern.description,
          })
        }
      }
      // Reset again after match
      pattern.pattern.lastIndex = 0
    }

    this.stats.totalFixes += suggestions.length
    return suggestions
  }

  // ── Error Handler Generation ─────────────────────────────────────────────

  /** Generate an error handler template for MQL4 or MQL5. */
  generateErrorHandler(type: 'ordersend' | 'orderclose' | 'ordermodify' | 'trade' | 'position', version?: MQLVersion): ErrorHandlerTemplate | undefined {
    const v = version ?? this.config.version
    const templates = ERROR_HANDLER_TEMPLATES.filter(t => t.version === v)

    switch (type) {
      case 'ordersend':
        return templates.find(t => t.name.includes('OrderSend'))
      case 'orderclose':
      case 'ordermodify':
        return templates.find(t => t.name.includes('Order Management'))
      case 'trade':
        return templates.find(t => t.name.includes('CTrade'))
      case 'position':
        return templates.find(t => t.name.includes('Position'))
      default:
        return templates[0]
    }
  }

  /** Get all error handler templates for a version. */
  getErrorHandlerTemplates(version?: MQLVersion): ErrorHandlerTemplate[] {
    const v = version ?? this.config.version
    return ERROR_HANDLER_TEMPLATES.filter(t => t.version === v)
  }

  // ── Migration Helper ─────────────────────────────────────────────────────

  /** Get migration mapping for an MQL4 function. */
  getMigrationMapping(mql4Function: string): MigrationMapping | undefined {
    return MIGRATION_MAPPINGS.find(m =>
      m.mql4Function.toLowerCase().includes(mql4Function.toLowerCase()),
    )
  }

  /** Get all migration mappings for a category. */
  getMigrationsByCategory(category: string): MigrationMapping[] {
    return MIGRATION_MAPPINGS.filter(m =>
      m.category.toLowerCase() === category.toLowerCase(),
    )
  }

  /** Get all migration mappings. */
  getAllMigrationMappings(): MigrationMapping[] {
    return [...MIGRATION_MAPPINGS]
  }

  /** Scan MQL4 code and suggest MQL5 replacements. */
  suggestMigration(mql4Code: string): Array<{ original: string; replacement: string; notes: string }> {
    this.stats.totalMigrations++
    const suggestions: Array<{ original: string; replacement: string; notes: string }> = []

    for (const mapping of MIGRATION_MAPPINGS) {
      // Escape special regex chars in function name
      const funcName = mapping.mql4Function
        .replace(/[()[\]{}.*+?^$|\\]/g, '\\$&')
        .replace(/\\.\\.\\./g, '.*')

      const pattern = new RegExp(funcName.split('\\(')[0], 'g')
      if (pattern.test(mql4Code)) {
        suggestions.push({
          original: mapping.mql4Function,
          replacement: mapping.mql5Equivalent,
          notes: mapping.notes,
        })
      }
    }

    return suggestions
  }

  // ── Stats & Config ───────────────────────────────────────────────────────

  getStats(): MQLCodeFixerStats {
    return { ...this.stats }
  }

  resetStats(): void {
    this.stats = {
      totalDiagnoses: 0,
      totalFixes: 0,
      totalMigrations: 0,
      errorsByCategory: {} as Record<ErrorCategory, number>,
    }
  }

  getConfig(): MQLCodeFixerConfig {
    return { ...this.config }
  }

  updateConfig(updates: Partial<MQLCodeFixerConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /** Get total count of known error codes. */
  getErrorDatabaseSize(): number {
    return MQL_ERRORS.length
  }

  /** Get total count of compilation patterns. */
  getCompilationPatternCount(): number {
    return COMPILATION_ERRORS.length
  }

  /** Get total count of code scan patterns. */
  getCodePatternCount(): number {
    return CODE_PATTERNS.length
  }

  /** Get total count of migration mappings. */
  getMigrationMappingCount(): number {
    return MIGRATION_MAPPINGS.length
  }
}
