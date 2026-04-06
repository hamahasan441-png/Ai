import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('FinTechPayments', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should respond to payments and open banking queries', async () => {
      const response = await brain.chat('explain payment processing gateway stripe square adyen pci dss open banking psd2 api banking as a service fintech digital banking')
      expect(response).toMatch(/payment|stripe|pci|open\s+banking|psd2|fintech/)
    })

    it('should respond to lending trading and compliance queries', async () => {
      const response = await brain.chat('explain lending credit scoring underwriting algorithmic trading high frequency kyc know your customer aml anti money laundering compliance')
      expect(response).toMatch(/credit|lending|trading|kyc|aml|compliance/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept FinTech & Payment Systems with domain concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('FinTech & Payment Systems')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('concept')
    })

    it('should have at least 5 connected sub-concepts including Payment Processing & Gateways and Open Banking & PSD2', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('FinTech & Payment Systems')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.name)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Payment Processing & Gateways')
      expect(names).toContain('Open Banking & PSD2')
    })

    it('should relate Payment Processing & Gateways to Regulatory Compliance & KYC', () => {
      const graph = createProgrammingKnowledgeGraph()
      const related = graph.findRelated('Payment Processing & Gateways')
      const names = related.map(r => r.name)
      expect(names).toContain('Regulatory Compliance & KYC')
    })
  })
})
