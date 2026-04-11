import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Cryptocurrency Trading Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about crypto trading and DeFi', async () => {
      const r = await brain.chat(
        'explain cryptocurrency trading bitcoin ethereum defi decentralized finance yield farming liquidity pool amm',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/crypto|bitcoin|ethereum|defi|liquidity|yield|amm/)
    })

    it('answers about on-chain analysis and tokenomics', async () => {
      const r = await brain.chat(
        'explain on chain analysis blockchain metrics whale tracking tokenomics supply vesting nft trading',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/on.chain|whale|tokenomics|supply|nft|blockchain/)
    })

    it('answers about crypto risk and market cycles', async () => {
      const r = await brain.chat(
        'explain crypto risk management leverage liquidation funding rate bitcoin halving market cycle stablecoin',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /leverage|liquidation|funding|halving|cycle|stablecoin|risk/,
      )
    })
  })

  describe('Semantic concepts', () => {
    it('has Cryptocurrency Trading concept in trading domain', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Cryptocurrency Trading')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('trading')
    })

    it('has >=5 connected sub-concepts', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Cryptocurrency Trading')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })
  })
})
