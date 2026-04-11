/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  API Design Patterns Knowledge — Tests                          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('APIDesignPatterns', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match REST best practices and GraphQL schema design keywords', async () => {
      const r = await brain.chat(
        'explain rest best practices resource naming http methods status codes hateoas graphql schema design resolvers subscriptions federation',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /rest|resource\s+naming|http\s+methods|status\s+codes|graphql|resolvers|federation/,
      )
    })

    it('should match API versioning and documentation keywords', async () => {
      const r = await brain.chat(
        'explain api versioning strategies url path header content negotiation api documentation openapi swagger asyncapi postman',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /versioning|url\s+path|header|openapi|swagger|asyncapi|postman/,
      )
    })

    it('should match webhook design and API gateway keywords', async () => {
      const r = await brain.chat(
        'explain webhook design delivery guarantees retry policies signature verification idempotency api gateway rate limiting circuit breaking',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /webhook|delivery|retry|signature|idempotency|gateway|rate\s+limiting/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept API Design Patterns with domain architecture', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('API Design Patterns')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('architecture')
    })

    it('should have >=5 connected sub-concepts including REST Best Practices & Standards and GraphQL Schema Design & Federation', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('API Design Patterns')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('REST Best Practices & Standards')
      expect(names).toContain('GraphQL Schema Design & Federation')
    })

    it('should relate REST Best Practices & Standards to GraphQL Schema Design & Federation', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('REST Best Practices & Standards')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('GraphQL Schema Design & Federation')
    })
  })
})
