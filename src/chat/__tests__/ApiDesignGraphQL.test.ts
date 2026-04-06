import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('API Design & GraphQL Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── REST API ──────────────────────────────────────────────────────────────

  describe('REST API Design', () => {
    it('explains REST API design best practices', async () => {
      const r = await brain.chat('What are the REST API design best practices for resource naming and versioning?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/rest|api|resource|method|get|post|put|status|code|version/)
    })

    it('describes REST API pagination and filtering', async () => {
      const r = await brain.chat('How does REST API pagination filtering and HATEOAS work?')
      expect(r.text.toLowerCase()).toMatch(/rest|api|paginat|filter|cursor|hateoas|offset|link/)
    })
  })

  // ── GraphQL ───────────────────────────────────────────────────────────────

  describe('GraphQL Development', () => {
    it('explains GraphQL schema and resolvers', async () => {
      const r = await brain.chat('How do GraphQL schema query mutation subscription and resolvers work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/graphql|schema|query|mutation|subscription|resolver|type/)
    })

    it('describes GraphQL DataLoader and N+1 problem', async () => {
      const r = await brain.chat('How does the GraphQL resolver DataLoader solve the N+1 query problem?')
      expect(r.text.toLowerCase()).toMatch(/graphql|dataloader|n\+1|batch|cache|resolver/)
    })

    it('covers Apollo Server and Federation', async () => {
      const r = await brain.chat('How does Apollo Server GraphQL federation compose microservices?')
      expect(r.text.toLowerCase()).toMatch(/apollo|server|federation|graphql|supergraph|service/)
    })
  })

  // ── gRPC ──────────────────────────────────────────────────────────────────

  describe('gRPC', () => {
    it('explains gRPC protocol buffers for microservices', async () => {
      const r = await brain.chat('How does gRPC protocol buffers work for microservice communication?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/grpc|protocol\s*buffer|protobuf|service|streaming|http.2/)
    })

    it('describes gRPC streaming patterns', async () => {
      const r = await brain.chat('What are the gRPC streaming bidirectional communication patterns?')
      expect(r.text.toLowerCase()).toMatch(/grpc|stream|bidirectional|unary|client|server/)
    })
  })

  // ── OpenAPI/Swagger ───────────────────────────────────────────────────────

  describe('OpenAPI/Swagger', () => {
    it('explains OpenAPI specification and design-first approach', async () => {
      const r = await brain.chat('How does the OpenAPI Swagger API documentation and specification work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/openapi|swagger|specification|document|path|schema|api/)
    })

    it('covers OpenAPI code generation and contract testing', async () => {
      const r = await brain.chat('How does OpenAPI code generation and contract testing work for APIs?')
      expect(r.text.toLowerCase()).toMatch(/openapi|code\s*generat|contract|test|spec|client|server/)
    })
  })

  // ── API Authentication ────────────────────────────────────────────────────

  describe('API Authentication & Security', () => {
    it('explains API authentication with OAuth2 and JWT', async () => {
      const r = await brain.chat('How does API authentication with OAuth2 and JWT tokens work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/api|oauth|jwt|token|auth|refresh|security/)
    })

    it('describes API security and rate limiting', async () => {
      const r = await brain.chat('How does API security rate limiting and CORS configuration work?')
      expect(r.text.toLowerCase()).toMatch(/api|security|rate\s*limit|cors|token|key|gateway/)
    })
  })

  // ── Webhooks ──────────────────────────────────────────────────────────────

  describe('Webhooks', () => {
    it('explains webhook event-driven APIs', async () => {
      const r = await brain.chat('How do webhook event driven API notifications and retry delivery work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/webhook|event|callback|retry|delivery|hmac|notification/)
    })
  })

  // ── API Versioning ────────────────────────────────────────────────────────

  describe('API Versioning', () => {
    it('explains API versioning and evolution strategy', async () => {
      const r = await brain.chat('What are the API versioning strategy and backward compatibility approaches?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/api|version|backward|compat|deprecat|evolut|gateway|uri/)
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - API Design concepts', () => {
    it('has API Design & GraphQL concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('API Design & GraphQL')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('web-development')
    })

    it('has REST API Design concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('REST API Design')
      expect(concept).toBeDefined()
    })

    it('has GraphQL Development concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('GraphQL Development')
      expect(concept).toBeDefined()
    })

    it('has gRPC for Microservices concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('gRPC for Microservices')
      expect(concept).toBeDefined()
    })

    it('has API Authentication & Security concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('API Authentication & Security')
      expect(concept).toBeDefined()
    })

    it('API Design has many related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('API Design & GraphQL')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(6)
    })

    it('REST is related to OpenAPI', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('REST API Design')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('OpenAPI/Swagger')
    })
  })
})
