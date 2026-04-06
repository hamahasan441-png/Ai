import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Performance Engineering Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => { brain = new LocalBrain({ enableIntelligence: true }) })

  // ── KB entry tests ──────────────────────────────────────
  it('knows about profiling and flame graphs', async () => {
    const r = await brain.chat('explain profiling cpu memory flame graph hot path bottleneck performance profiler')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/profil|flame\s+graph|cpu|memory|bottleneck/)
  })

  it('knows about load testing', async () => {
    const r = await brain.chat('explain benchmarking load testing performance test jmeter k6 gatling stress testing capacity')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/load\s+test|stress|jmeter|k6|gatling|throughput|latency|benchmark/)
  })

  it('knows about caching strategies', async () => {
    const r = await brain.chat('explain caching strategy redis memcached cdn cache invalidation aside write through')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/cach|redis|cdn|lru|ttl|invalidat/)
  })

  it('knows about memory optimization', async () => {
    const r = await brain.chat('explain memory optimization garbage collection heap allocation latency p99')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/memory|garbage|heap|latency|pool|leak/)
  })

  it('knows about database and web performance', async () => {
    const r = await brain.chat('explain database query optimization indexing explain plan n plus one query problem core web vitals lcp fid cls')
    expect(r.text.length).toBeGreaterThan(50)
    expect(r.text.toLowerCase()).toMatch(/query|index|explain|n\s*\+?\s*1|n\s+plus|web\s+vital|lcp|cls/)
  })

  // ── Semantic concept tests ──────────────────────────────
  it('has Performance Engineering concept', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Performance Engineering')
    expect(node).toBeDefined()
    expect(node!.domain).toBe('performance')
  })

  it('has connected sub-concepts', () => {
    const mem = createProgrammingKnowledgeGraph()
    const node = mem.findConceptByName('Performance Engineering')
    expect(node).toBeDefined()
    const related = mem.findRelated(node!.id, undefined, 30)
    expect(related.length).toBeGreaterThanOrEqual(5)
    const names = related.map(r => r.name)
    expect(names).toContain('CPU & Memory Profiling')
    expect(names).toContain('Load & Stress Testing')
  })
})
