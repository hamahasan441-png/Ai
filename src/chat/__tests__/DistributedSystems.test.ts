import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Distributed Systems & Microservices Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about CAP theorem and consensus', async () => {
      const r = await brain.chat(
        'Explain cap theorem consistency availability partition and distributed consensus raft paxos',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/cap|consistency|availability|raft|paxos|consensus/)
    })

    it('answers about message queues and event streaming', async () => {
      const r = await brain.chat(
        'How does message queue kafka rabbitmq event streaming and event driven architecture work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/kafka|rabbitmq|message|queue|event/)
    })

    it('answers about microservice architecture', async () => {
      const r = await brain.chat(
        'Explain microservice architecture service mesh api gateway and circuit breaker pattern',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/microservice|circuit|breaker|gateway|mesh/)
    })

    it('answers about distributed data and sharding', async () => {
      const r = await brain.chat(
        'How does distributed database sharding replication and consistent hashing ring work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/shard|replication|distributed|hash|partition/)
    })

    it('answers about Kubernetes orchestration', async () => {
      const r = await brain.chat(
        'Explain kubernetes container orchestration pod deployment and helm chart manifest',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/kubernetes|pod|deployment|helm|container/)
    })

    it('answers about observability and monitoring', async () => {
      const r = await brain.chat(
        'How does observability tracing logging metrics monitoring prometheus grafana work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /observability|tracing|logging|metrics|prometheus|grafana/,
      )
    })
  })

  describe('Semantic concepts', () => {
    it('has Distributed Systems root concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Distributed Systems')
      expect(node).toBeDefined()
      // May match 'infrastructure' or 'architecture' depending on creation order
      expect(['infrastructure', 'architecture']).toContain(node!.domain)
    })

    it('has Distributed Theory concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Distributed Theory')
      expect(node).toBeDefined()
    })

    it('has Message Queues & Events concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Message Queues & Events')
      expect(node).toBeDefined()
    })

    it('has Microservices Architecture concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Microservices Architecture')
      expect(node).toBeDefined()
    })

    it('has Container Orchestration concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Container Orchestration')
      expect(node).toBeDefined()
    })

    it('has Observability & Monitoring concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Observability & Monitoring')
      expect(node).toBeDefined()
    })

    it('Distributed Systems has related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Distributed Systems')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Microservices is related to Message Queues', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Microservices Architecture')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Message Queues & Events')
    })
  })
})
