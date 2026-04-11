import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('System Design Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── Load Balancing ────────────────────────────────────────────────────────

  describe('Load Balancing', () => {
    it('explains load balancer algorithms and design', async () => {
      const r = await brain.chat(
        'What load balancing algorithms are used in system design with Nginx?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /load\s*balanc|algorithm|round\s*robin|least\s*connect|nginx/,
      )
    })

    it('describes L4 vs L7 load balancing', async () => {
      const r = await brain.chat('What is the difference between L4 and L7 load balancing design?')
      expect(r.text.toLowerCase()).toMatch(/l4|l7|transport|application|load\s*balanc|tcp|http/)
    })

    it('covers consistent hashing', async () => {
      const r = await brain.chat('How does consistent hashing work in load balancing design?')
      expect(r.text.toLowerCase()).toMatch(/consistent\s*hash|load\s*balanc|distribut|node|virtual/)
    })
  })

  // ── Caching ───────────────────────────────────────────────────────────────

  describe('Caching Strategies', () => {
    it('explains Redis caching strategies', async () => {
      const r = await brain.chat(
        'What are the caching strategies with Redis and Memcached for system design?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/cach|redis|memcached|strategy|latency|key-?value/)
    })

    it('describes cache-aside and write-through patterns', async () => {
      const r = await brain.chat(
        'How do cache invalidation patterns like cache-aside and write-through work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /cache-?aside|write-?through|write-?back|invalidat|miss|populat/,
      )
    })

    it('covers CDN edge caching', async () => {
      const r = await brain.chat('How does distributed caching with CDN edge locations work?')
      expect(r.text.toLowerCase()).toMatch(/cdn|edge|cache|cloudfront|cloudflare|static|distribut/)
    })
  })

  // ── Database Design ───────────────────────────────────────────────────────

  describe('Database Design & Scaling', () => {
    it('explains database sharding and replication', async () => {
      const r = await brain.chat('How does database sharding and replication work for scaling?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/shard|replic|partition|scaling|primary|read\s*replica/)
    })

    it('describes SQL vs NoSQL selection', async () => {
      const r = await brain.chat('How to choose between SQL and NoSQL databases in system design?')
      expect(r.text.toLowerCase()).toMatch(
        /sql|nosql|relational|document|consistency|cap\s*theorem/,
      )
    })

    it('covers CAP theorem implications', async () => {
      const r = await brain.chat('What is the CAP theorem and how does it affect database design?')
      expect(r.text.toLowerCase()).toMatch(
        /cap|consistency|availability|partition|theorem|trade-?off/,
      )
    })
  })

  // ── Message Queues ────────────────────────────────────────────────────────

  describe('Message Queues & Streaming', () => {
    it('explains Apache Kafka for event streaming', async () => {
      const r = await brain.chat(
        'How does a message queue like Kafka work for event streaming in system design?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/kafka|message|queue|topic|partition|stream|consumer/)
    })

    it('describes RabbitMQ message broker patterns', async () => {
      const r = await brain.chat('How does RabbitMQ message queue work with exchanges and queues?')
      expect(r.text.toLowerCase()).toMatch(/rabbitmq|exchange|queue|message|amqp|publish|subscribe/)
    })

    it('covers delivery guarantees', async () => {
      const r = await brain.chat(
        'What message queue delivery guarantees exist: at-most-once vs exactly-once?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /delivery|guarantee|at-?most|at-?least|exactly-?once|retry/,
      )
    })
  })

  // ── Rate Limiting ─────────────────────────────────────────────────────────

  describe('Rate Limiting', () => {
    it('explains rate limiter algorithms', async () => {
      const r = await brain.chat(
        'What rate limiting algorithms like token bucket are used in system design?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /rate\s*limit|token\s*bucket|leaky\s*bucket|sliding\s*window|algorithm/,
      )
    })

    it('describes distributed rate limiting with Redis', async () => {
      const r = await brain.chat(
        'How does distributed rate limiting with Redis work in API design?',
      )
      expect(r.text.toLowerCase()).toMatch(/rate\s*limit|redis|distribut|api|429|incr|expire/)
    })
  })

  // ── Distributed Systems ───────────────────────────────────────────────────

  describe('Distributed Systems', () => {
    it('explains Raft consensus algorithm', async () => {
      const r = await brain.chat(
        'How does the Raft consensus algorithm work in distributed systems?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/raft|consensus|leader|election|log\s*replic|follower/)
    })

    it('describes distributed system fundamentals', async () => {
      const r = await brain.chat(
        'What are the fundamental challenges of distributed system design?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /distribut|consensus|consistency|partition|failure|transaction/,
      )
    })
  })

  // ── System Design Interviews ──────────────────────────────────────────────

  describe('System Design Interviews', () => {
    it('explains URL shortener design', async () => {
      const r = await brain.chat(
        'How would you design a URL shortener in a system design interview?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/url|short|base62|encod|cache|database|key|generat/)
    })

    it('describes scalable system design patterns', async () => {
      const r = await brain.chat(
        'What are the common system design interview patterns for scalable architecture?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /system\s*design|scal|load\s*balanc|cache|queue|database|cdn/,
      )
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - System Design concepts', () => {
    it('has System Design concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('System Design')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('software-architecture')
    })

    it('has Load Balancing concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Load Balancing')
      expect(concept).toBeDefined()
    })

    it('has Caching Strategies concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Caching Strategies')
      expect(concept).toBeDefined()
    })

    it('has Database Design & Scaling concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Database Design & Scaling')
      expect(concept).toBeDefined()
    })

    it('has Message Queues & Streaming concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Message Queues & Streaming')
      expect(concept).toBeDefined()
    })

    it('has Rate Limiting concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Rate Limiting')
      expect(concept).toBeDefined()
    })

    it('has Distributed Systems concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Distributed Systems')
      expect(concept).toBeDefined()
    })

    it('System Design has many related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('System Design')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Caching is related to Database Design', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Caching Strategies')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Database Design & Scaling')
    })

    it('Message Queues is related to Microservices', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Message Queues & Streaming')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Microservices Architecture')
    })
  })
})
