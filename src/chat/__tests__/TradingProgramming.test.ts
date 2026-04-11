import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Trading Programming Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── MT4 / MQL4 ──────────────────────────────────────────────────────────────

  describe('MT4/MQL4 Programming', () => {
    it('explains MT4 programming basics', async () => {
      const r = await brain.chat('What is MT4 programming and MQL4?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mql4|metatrader\s*4|expert\s*advisor/)
    })

    it('describes MQL4 order management', async () => {
      const r = await brain.chat('How does MQL4 order management work with OrderSend?')
      expect(r.text.toLowerCase()).toMatch(/ordersend|order|mql4|ticket/)
    })

    it('explains MQL4 custom indicators', async () => {
      const r = await brain.chat('How to create a custom indicator in MQL4?')
      expect(r.text.toLowerCase()).toMatch(/indicator|buffer|mql4|draw|ima|irsi/)
    })

    it('covers MQL4 risk management', async () => {
      const r = await brain.chat('How to calculate lot size in MQL4 for risk management?')
      expect(r.text.toLowerCase()).toMatch(/lot|risk|accountbalance|position\s*siz/)
    })

    it('describes MT4 backtesting', async () => {
      const r = await brain.chat('How to backtest an EA in MT4 Strategy Tester?')
      expect(r.text.toLowerCase()).toMatch(/strategy\s*tester|backtest|every\s*tick|optimization/)
    })

    it('knows MQL4 event handlers', async () => {
      const r = await brain.chat('What are the main MQL4 event functions for Expert Advisors?')
      expect(r.text.toLowerCase()).toMatch(/oninit|ontick|ondeinit|init|start/)
    })

    it('mentions MQL4 built-in indicators', async () => {
      const r = await brain.chat('What built-in indicator functions are available in MQL4?')
      expect(r.text.toLowerCase()).toMatch(/ima|irsi|imacd|bollinger|stochastic/)
    })
  })

  // ── MT5 / MQL5 ──────────────────────────────────────────────────────────────

  describe('MT5/MQL5 Programming', () => {
    it('explains MT5 programming and MQL5', async () => {
      const r = await brain.chat('What is MT5 programming and MQL5 language?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mql5|metatrader\s*5|object.oriented/)
    })

    it('describes CTrade class usage', async () => {
      const r = await brain.chat('How to use the CTrade class for trading in MQL5?')
      expect(r.text.toLowerCase()).toMatch(/ctrade|trade\.buy|trade\.sell|mql5/)
    })

    it('explains MQL5 indicator handles', async () => {
      const r = await brain.chat('How do MQL5 indicator handles and CopyBuffer work?')
      expect(r.text.toLowerCase()).toMatch(/handle|copybuffer|indicator|mql5/)
    })

    it('covers MQL5 OOP features', async () => {
      const r = await brain.chat('What object-oriented programming features does MQL5 support?')
      expect(r.text.toLowerCase()).toMatch(/class|inherit|virtual|interface|oop|mql5/)
    })

    it('describes MT5 strategy tester', async () => {
      const r = await brain.chat('How does the MT5 strategy tester compare to MT4?')
      expect(r.text.toLowerCase()).toMatch(/multi.currency|real\s*tick|cloud|mt5|strategy\s*tester/)
    })

    it('explains MQL5 database and file operations', async () => {
      const r = await brain.chat('How to use SQLite database in MQL5?')
      expect(r.text.toLowerCase()).toMatch(/database|sqlite|fileopen|mql5/)
    })

    it('knows MQL5 event handlers', async () => {
      const r = await brain.chat('What event handlers are available in MQL5 Expert Advisors?')
      expect(r.text.toLowerCase()).toMatch(
        /oninit|ontick|ontimer|onchartevent|ontrade|event.driven|class|mql5/,
      )
    })

    it('mentions MQL5 Standard Library', async () => {
      const r = await brain.chat(
        'Tell me about MQL5 classes and Standard Library for Expert Advisors',
      )
      expect(r.text.toLowerCase()).toMatch(/cexpert|ctrade|class|standard\s*library|mql5/)
    })
  })

  // ── TradingView / Pine Script ────────────────────────────────────────────────

  describe('TradingView/Pine Script', () => {
    it('explains Pine Script basics', async () => {
      const r = await brain.chat('What is Pine Script for TradingView programming?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/pine\s*script|tradingview|indicator|strategy/)
    })

    it('describes Pine Script strategy development', async () => {
      const r = await brain.chat('How to create a trading strategy in Pine Script?')
      expect(r.text.toLowerCase()).toMatch(/strategy\.(entry|exit|close)|pine\s*script|backtest/)
    })

    it('covers Pine Script built-in functions', async () => {
      const r = await brain.chat(
        'What built-in technical analysis functions does Pine Script have?',
      )
      expect(r.text.toLowerCase()).toMatch(/ta\.(sma|ema|rsi|macd)|pine\s*script/)
    })

    it('explains Pine Script drawing objects', async () => {
      const r = await brain.chat('How to use drawing objects like labels and lines in Pine Script?')
      expect(r.text.toLowerCase()).toMatch(/line\.new|label\.new|box|table|drawing/)
    })

    it('covers Pine Script alerts and webhooks', async () => {
      const r = await brain.chat('How do Pine Script alerts and TradingView webhooks work?')
      expect(r.text.toLowerCase()).toMatch(/alertcondition|webhook|alert|automation/)
    })

    it('describes Pine Script libraries', async () => {
      const r = await brain.chat('How to use and create libraries in Pine Script?')
      expect(r.text.toLowerCase()).toMatch(/library|import|export|reusab|request\.security/)
    })

    it('knows Pine Script data types', async () => {
      const r = await brain.chat('What data types does TradingView Pine Script support?')
      expect(r.text.toLowerCase()).toMatch(/int|float|bool|color|string|series|array/)
    })

    it('explains the [] operator in Pine Script', async () => {
      const r = await brain.chat(
        'How does the bracket history reference operator work in Pine Script?',
      )
      expect(r.text.toLowerCase()).toMatch(/\[|\]|previous|close\[1\]|series|lookback/)
    })
  })

  // ── Cross-Platform Trading Concepts ──────────────────────────────────────────

  describe('Cross-Platform Trading', () => {
    it('explains algorithmic trading strategy design', async () => {
      const r = await brain.chat('What are the principles of algorithmic trading strategy design?')
      expect(r.text.toLowerCase()).toMatch(/signal|risk\s*management|execution|strategy/)
    })

    it('compares trading platforms', async () => {
      const r = await brain.chat(
        'How does MT4 compare to MT5 and TradingView for trading bot development?',
      )
      expect(r.text.toLowerCase()).toMatch(/mt4|mt5|tradingview|pine|mql/)
    })

    it('covers candlestick pattern detection', async () => {
      const r = await brain.chat('How to program candlestick pattern detection in trading code?')
      expect(r.text.toLowerCase()).toMatch(/doji|hammer|engulfing|candlestick|pattern/)
    })

    it('explains divergence detection programming', async () => {
      const r = await brain.chat('How to detect RSI divergence in trading code?')
      expect(r.text.toLowerCase()).toMatch(/divergence|rsi|pivot|lower\s*low|higher\s*low/)
    })

    it('covers ATR-based risk management', async () => {
      const r = await brain.chat('How to implement ATR-based stop loss in trading algorithms?')
      expect(r.text.toLowerCase()).toMatch(/atr|stop.loss|risk|take.profit/)
    })

    it('knows strategy evaluation metrics', async () => {
      const r = await brain.chat(
        'What metrics should I use to evaluate an algorithmic trading strategy?',
      )
      expect(r.text.toLowerCase()).toMatch(/sharpe|drawdown|profit\s*factor|win\s*rate/)
    })

    it('describes trading strategy types', async () => {
      const r = await brain.chat('What types of algorithmic trading strategies exist?')
      expect(r.text.toLowerCase()).toMatch(/trend\s*follow|mean\s*reversion|momentum|arbitrage/)
    })
  })

  // ── Semantic Memory ──────────────────────────────────────────────────────────

  describe('Semantic Memory — Trading Programming', () => {
    it('has Trading Programming concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Trading Programming')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('programming')
    })

    it('has MT4 Programming concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MT4 Programming')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('programming')
    })

    it('has MT5 Programming concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MT5 Programming')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('programming')
    })

    it('has Pine Script concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Pine Script')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('programming')
    })

    it('has Expert Advisor concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Expert Advisor')
      expect(concept).toBeDefined()
    })

    it('has Trading Indicator concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Trading Indicator')
      expect(concept).toBeDefined()
    })

    it('has Trading Strategy concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Trading Strategy')
      expect(concept).toBeDefined()
    })

    it('has Order Management concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Order Management')
      expect(concept).toBeDefined()
    })

    it('has Trading Risk Management concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Trading Risk Management')
      expect(concept).toBeDefined()
    })

    it('has Trading Backtesting concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Trading Backtesting')
      expect(concept).toBeDefined()
    })

    it('has Candlestick Pattern concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Candlestick Pattern')
      expect(concept).toBeDefined()
    })

    it('has Trading Divergence concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Trading Divergence')
      expect(concept).toBeDefined()
    })

    it('MT4 is part of Trading Programming', () => {
      const memory = createProgrammingKnowledgeGraph()
      const mt4 = memory.findConceptByName('MT4 Programming')
      expect(mt4).toBeDefined()
      const related = memory.findRelated(mt4!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Trading Programming')
    })

    it('MT5 is part of Trading Programming', () => {
      const memory = createProgrammingKnowledgeGraph()
      const mt5 = memory.findConceptByName('MT5 Programming')
      expect(mt5).toBeDefined()
      const related = memory.findRelated(mt5!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Trading Programming')
    })

    it('Pine Script is part of Trading Programming', () => {
      const memory = createProgrammingKnowledgeGraph()
      const pine = memory.findConceptByName('Pine Script')
      expect(pine).toBeDefined()
      const related = memory.findRelated(pine!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Trading Programming')
    })

    it('Expert Advisor relates to MT4 and MT5', () => {
      const memory = createProgrammingKnowledgeGraph()
      const ea = memory.findConceptByName('Expert Advisor')
      expect(ea).toBeDefined()
      const related = memory.findRelated(ea!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('MT4 Programming')
      expect(names).toContain('MT5 Programming')
    })

    it('Trading Indicator relates to multiple platforms', () => {
      const memory = createProgrammingKnowledgeGraph()
      const ind = memory.findConceptByName('Trading Indicator')
      expect(ind).toBeDefined()
      const related = memory.findRelated(ind!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('MT4 Programming')
      expect(names).toContain('MT5 Programming')
      expect(names).toContain('Pine Script')
    })

    it('Backtesting relates to all platforms', () => {
      const memory = createProgrammingKnowledgeGraph()
      const bt = memory.findConceptByName('Trading Backtesting')
      expect(bt).toBeDefined()
      const related = memory.findRelated(bt!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Trading Programming')
      expect(names).toContain('MT4 Programming')
      expect(names).toContain('MT5 Programming')
      expect(names).toContain('Pine Script')
    })

    it('MT4 and MT5 are related to each other', () => {
      const memory = createProgrammingKnowledgeGraph()
      const mt4 = memory.findConceptByName('MT4 Programming')
      expect(mt4).toBeDefined()
      const related = memory.findRelated(mt4!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('MT5 Programming')
    })

    it('Risk Management relates to Order Management', () => {
      const memory = createProgrammingKnowledgeGraph()
      const risk = memory.findConceptByName('Trading Risk Management')
      expect(risk).toBeDefined()
      const related = memory.findRelated(risk!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Order Management')
    })

    it('Candlestick Pattern relates to Trading Indicator and Strategy', () => {
      const memory = createProgrammingKnowledgeGraph()
      const cp = memory.findConceptByName('Candlestick Pattern')
      expect(cp).toBeDefined()
      const related = memory.findRelated(cp!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Trading Indicator')
      expect(names).toContain('Trading Strategy')
    })
  })
})
