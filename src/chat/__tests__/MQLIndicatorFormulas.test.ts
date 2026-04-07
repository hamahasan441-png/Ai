import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MQL Indicator Formulas Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('knows moving average formulas (SMA, EMA, WMA, Hull)', async () => {
      const r = await brain.chat('What are the MQL moving average formulas for SMA, EMA, WMA, and Hull MA?')
      expect(r.text.toLowerCase()).toMatch(/sma|ema|wma|hull|exponential|weighted|period/)
    })

    it('explains oscillator formulas (RSI, MACD, Stochastic)', async () => {
      const r = await brain.chat('How to calculate RSI, MACD, and Stochastic formulas in MQL code?')
      expect(r.text.toLowerCase()).toMatch(/rsi|macd|stochastic|gain|loss|signal/)
    })

    it('covers Bollinger Bands, ATR, and Ichimoku formulas', async () => {
      const r = await brain.chat('What are the Bollinger Bands ATR and Ichimoku calculation formulas in MQL?')
      expect(r.text.toLowerCase()).toMatch(/bollinger|atr|ichimoku|stddev|true\s+range|tenkan|kijun/)
    })
  })

  describe('Semantic Memory', () => {
    it('has MQL Indicator Formulas concept', () => {
      const g = createProgrammingKnowledgeGraph()
      expect(g.findConceptByName('MQL Indicator Formulas')).toBeDefined()
    })

    it('MQL Indicator Formulas relates to Trading Indicator', () => {
      const g = createProgrammingKnowledgeGraph()
      const c = g.findConceptByName('MQL Indicator Formulas')!
      const related = g.findRelated(c.id, undefined, 30).map(r => r.name)
      expect(related).toContain('Trading Indicator')
    })
  })
})
