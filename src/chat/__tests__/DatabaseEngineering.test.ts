import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Database Engineering Knowledge', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── PostgreSQL ────────────────────────────────────────────────────────────

  describe('PostgreSQL Advanced', () => {
    it('explains PostgreSQL indexing strategies', async () => {
      const r = await brain.chat(
        'What are the PostgreSQL indexing strategies with BTree GIN GiST and BRIN?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/postgres|index|btree|gin|gist|brin|query/)
    })

    it('describes PostgreSQL query optimization with EXPLAIN', async () => {
      const r = await brain.chat(
        'How does PostgreSQL query optimization with EXPLAIN ANALYZE work?',
      )
      expect(r.text.toLowerCase()).toMatch(/postgres|explain|analyze|query|optim|index|scan/)
    })

    it('covers PostgreSQL partitioning and VACUUM', async () => {
      const r = await brain.chat(
        'How do PostgreSQL partitioning and VACUUM analyze maintenance work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /postgres|partition|vacuum|autovacuum|dead\s*tuple|range/,
      )
    })
  })

  // ── Redis ─────────────────────────────────────────────────────────────────

  describe('Redis Engineering', () => {
    it('explains Redis data structures and patterns', async () => {
      const r = await brain.chat(
        'What are the Redis data structures and caching patterns for engineering?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /redis|data\s*structure|string|hash|sorted\s*set|cache|pattern/,
      )
    })

    it('describes Redis pub/sub and streams', async () => {
      const r = await brain.chat(
        'How do Redis pub-sub messaging and streams event processing work?',
      )
      expect(r.text.toLowerCase()).toMatch(/redis|pub.?sub|stream|message|event|xadd|subscribe/)
    })

    it('covers Redis cluster and sentinel HA', async () => {
      const r = await brain.chat(
        'How does Redis cluster and sentinel high availability failover work?',
      )
      expect(r.text.toLowerCase()).toMatch(
        /redis|cluster|sentinel|failover|shard|hash\s*slot|avail/,
      )
    })
  })

  // ── MongoDB ───────────────────────────────────────────────────────────────

  describe('MongoDB Advanced', () => {
    it('explains MongoDB aggregation pipeline', async () => {
      const r = await brain.chat(
        'How does the MongoDB document database aggregation pipeline work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mongodb|aggregat|pipeline|match|group|project|lookup/)
    })

    it('describes MongoDB sharding and replica sets', async () => {
      const r = await brain.chat(
        'How do MongoDB indexing sharding and replica set configurations work?',
      )
      expect(r.text.toLowerCase()).toMatch(/mongodb|shard|replica\s*set|index|primary|secondary/)
    })
  })

  // ── Migrations ────────────────────────────────────────────────────────────

  describe('Database Migrations', () => {
    it('explains schema migration tools and patterns', async () => {
      const r = await brain.chat(
        'What are the database migration schema evolution tools like Flyway and Liquibase?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /migration|schema|flyway|liquibase|alembic|evolut|version/,
      )
    })

    it('covers zero-downtime migration strategy', async () => {
      const r = await brain.chat('How does a zero downtime database migration strategy work?')
      expect(r.text.toLowerCase()).toMatch(
        /zero.?downtime|migration|expand|contract|backfill|column|schema/,
      )
    })
  })

  // ── Replication & HA ──────────────────────────────────────────────────────

  describe('Database Replication & HA', () => {
    it('explains database replication and failover', async () => {
      const r = await brain.chat(
        'How does database replication master slave synchronization and failover work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /replic|synchron|failover|primary|secondary|async|cluster/,
      )
    })
  })

  // ── Specialized Databases ─────────────────────────────────────────────────

  describe('Specialized Databases', () => {
    it('explains time series and analytical databases', async () => {
      const r = await brain.chat(
        'What are specialized time series database InfluxDB and TimescaleDB for analytics?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /time.?series|influxdb|timescaledb|columnar|clickhouse|analytic/,
      )
    })
  })

  // ── SQL Optimization ──────────────────────────────────────────────────────

  describe('SQL Query Optimization', () => {
    it('explains SQL query optimization and execution plans', async () => {
      const r = await brain.chat(
        'How does SQL query optimization with execution plan analysis work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/sql|query|optim|explain|execution|plan|index|join|scan/)
    })

    it('covers N+1 query problem and solutions', async () => {
      const r = await brain.chat(
        'How to solve the SQL performance indexing and explain analyze N+1 query problem?',
      )
      expect(r.text.toLowerCase()).toMatch(/n\+1|query|optim|eager|join|batch|index|pool|explain/)
    })
  })

  // ── Distributed SQL ───────────────────────────────────────────────────────

  describe('Distributed SQL', () => {
    it('explains distributed SQL databases like CockroachDB', async () => {
      const r = await brain.chat(
        'How do distributed SQL databases like CockroachDB and Spanner work?',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/distribut|sql|cockroach|spanner|consensus|raft|shard/)
    })
  })

  // ── Semantic Memory ───────────────────────────────────────────────────────

  describe('Semantic Memory - Database Engineering concepts', () => {
    it('has Database Engineering concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Database Engineering')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('databases')
    })

    it('has PostgreSQL Advanced concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('PostgreSQL Advanced')
      expect(concept).toBeDefined()
    })

    it('has Redis Engineering concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Redis Engineering')
      expect(concept).toBeDefined()
    })

    it('has MongoDB Advanced concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('MongoDB Advanced')
      expect(concept).toBeDefined()
    })

    it('has SQL Query Optimization concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('SQL Query Optimization')
      expect(concept).toBeDefined()
    })

    it('has Distributed SQL (NewSQL) concept', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Distributed SQL (NewSQL)')
      expect(concept).toBeDefined()
    })

    it('Database Engineering has many related concepts', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('Database Engineering')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(7)
    })

    it('PostgreSQL is related to SQL Optimization', () => {
      const memory = createProgrammingKnowledgeGraph()
      const concept = memory.findConceptByName('PostgreSQL Advanced')
      expect(concept).toBeDefined()
      const related = memory.findRelated(concept!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('SQL Query Optimization')
    })
  })
})
