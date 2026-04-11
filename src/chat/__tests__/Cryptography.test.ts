import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Cryptography', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match symmetric/public-key/hash keywords', async () => {
      const r = await brain.chat(
        'explain symmetric encryption aes des public key cryptography rsa elliptic curve hash function sha256 hmac',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/aes|rsa|elliptic|sha|hmac|encryption/)
    })

    it('should match tls/post-quantum/zkp keywords', async () => {
      const r = await brain.chat(
        'explain tls ssl https certificate post quantum cryptography lattice kyber zero knowledge proof zkp zk snark',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/tls|post.quantum|lattice|zero.knowledge|zkp/)
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
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Symmetric Encryption')
      expect(names).toContain('Public-Key Cryptography')
    })

    it('should relate Symmetric Encryption to Public-Key Cryptography', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Symmetric Encryption')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Public-Key Cryptography')
    })
  })
})
