import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Cryptography', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match symmetric/public-key/hash keywords', () => {
      const response = brain.chat('explain symmetric encryption aes des public key cryptography rsa elliptic curve hash function sha256 hmac')
      expect(response).toMatch(/aes|rsa|elliptic|sha|hmac|encryption/i)
    })

    it('should match tls/post-quantum/zkp keywords', () => {
      const response = brain.chat('explain tls ssl https certificate post quantum cryptography lattice kyber zero knowledge proof zkp zk snark')
      expect(response).toMatch(/tls|post.quantum|lattice|zero.knowledge|zkp/i)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Cryptography & Applied Security with domain concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Cryptography & Applied Security')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('concept')
    })

    it('should have >=5 connected sub-concepts including Symmetric Encryption and Public-Key Cryptography', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Cryptography & Applied Security')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.name)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Symmetric Encryption')
      expect(names).toContain('Public-Key Cryptography')
    })

    it('should relate Symmetric Encryption to Public-Key Cryptography', () => {
      const graph = createProgrammingKnowledgeGraph()
      const related = graph.findRelated('Symmetric Encryption')
      const names = related.map(r => r.name)
      expect(names).toContain('Public-Key Cryptography')
    })
  })
})
