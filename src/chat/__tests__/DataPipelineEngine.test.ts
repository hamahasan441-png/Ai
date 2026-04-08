import { describe, it, expect, beforeEach } from 'vitest'
import { DataPipelineEngine, DEFAULT_DATA_PIPELINE_CONFIG } from '../DataPipelineEngine.js'

describe('DataPipelineEngine', () => {
  let engine: DataPipelineEngine

  beforeEach(() => { engine = new DataPipelineEngine() })

  describe('constructor & config', () => {
    it('uses default config', () => {
      expect(engine.getStats().totalPipelines).toBe(0)
    })
    it('accepts custom config', () => {
      const e = new DataPipelineEngine({ maxPipelines: 5 })
      expect(e.getStats().totalPipelines).toBe(0)
    })
    it('DEFAULT config has expected values', () => {
      expect(DEFAULT_DATA_PIPELINE_CONFIG.maxPipelines).toBe(100)
      expect(DEFAULT_DATA_PIPELINE_CONFIG.defaultLatencyMs).toBe(100)
    })
  })

  describe('schema management', () => {
    it('defines a schema', () => {
      const s = engine.defineSchema('users', [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string', nullable: true },
      ])
      expect(s.id).toBeTruthy()
      expect(s.fields).toHaveLength(3)
    })
    it('retrieves schema by id', () => {
      const s = engine.defineSchema('test', [{ name: 'x', type: 'number' }])
      expect(engine.getSchema(s.id)).toBe(s)
    })
    it('returns null for unknown schema', () => {
      expect(engine.getSchema('bad')).toBeNull()
    })
    it('validates a record against schema', () => {
      const s = engine.defineSchema('test', [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string' },
      ])
      const r1 = engine.validateRecord(s.id, { id: 1, name: 'Alice' })
      expect(r1.valid).toBe(true)
      expect(r1.errors).toHaveLength(0)
    })
    it('detects missing required field', () => {
      const s = engine.defineSchema('test', [{ name: 'id', type: 'number' }])
      const r = engine.validateRecord(s.id, {})
      expect(r.valid).toBe(false)
      expect(r.errors.length).toBeGreaterThan(0)
    })
    it('detects type mismatch', () => {
      const s = engine.defineSchema('test', [{ name: 'id', type: 'number' }])
      const r = engine.validateRecord(s.id, { id: 'not_a_number' })
      expect(r.valid).toBe(false)
    })
    it('allows nullable fields', () => {
      const s = engine.defineSchema('test', [{ name: 'opt', type: 'string', nullable: true }])
      const r = engine.validateRecord(s.id, {})
      expect(r.valid).toBe(true)
    })
  })

  describe('pipeline creation', () => {
    it('creates a pipeline', () => {
      const src = engine.defineSchema('src', [{ name: 'x', type: 'number' }])
      const dst = engine.defineSchema('dst', [{ name: 'y', type: 'number' }])
      const p = engine.createPipeline('ETL', 'Test pipeline', src.id, dst.id)
      expect(p.id).toBeTruthy()
      expect(p.name).toBe('ETL')
    })
    it('retrieves pipeline by id', () => {
      const src = engine.defineSchema('s', [{ name: 'a', type: 'string' }])
      const p = engine.createPipeline('P', 'desc', src.id, src.id)
      expect(engine.getPipeline(p.id)).toBe(p)
    })
    it('adds stages to pipeline', () => {
      const s = engine.defineSchema('s', [{ name: 'x', type: 'number' }])
      const p = engine.createPipeline('P', 'd', s.id, s.id)
      const stage = engine.addStage(p.id, 'Extract', 'extract', s.id, s.id)
      expect(stage).toBeTruthy()
      expect(stage!.type).toBe('extract')
      expect(engine.getPipeline(p.id)!.stages).toHaveLength(1)
    })
    it('returns null when adding stage to unknown pipeline', () => {
      expect(engine.addStage('bad', 'X', 'extract', 'a', 'b')).toBeNull()
    })
  })

  describe('quality rules', () => {
    it('adds a not_null quality rule', () => {
      const rule = engine.addQualityRule('email', 'not_null')
      expect(rule.id).toBeTruthy()
      expect(rule.ruleType).toBe('not_null')
    })
    it('checks quality on records', () => {
      const s = engine.defineSchema('s', [{ name: 'x', type: 'number' }])
      const p = engine.createPipeline('P', 'd', s.id, s.id)
      engine.addQualityRule('x', 'not_null')
      const report = engine.checkQuality(p.id, [{ x: 1 }, { x: null }])
      expect(report.failed).toBeGreaterThan(0)
    })
    it('detects range violations', () => {
      const s = engine.defineSchema('s', [{ name: 'age', type: 'number' }])
      const p = engine.createPipeline('P', 'd', s.id, s.id)
      engine.addQualityRule('age', 'range', { min: 0, max: 150 })
      const report = engine.checkQuality(p.id, [{ age: 200 }])
      expect(report.details.length).toBeGreaterThan(0)
    })
    it('detects pattern violations', () => {
      const s = engine.defineSchema('s', [{ name: 'email', type: 'string' }])
      const p = engine.createPipeline('P', 'd', s.id, s.id)
      engine.addQualityRule('email', 'pattern', { pattern: '^[^@]+@[^@]+$' })
      const report = engine.checkQuality(p.id, [{ email: 'not-an-email' }])
      expect(report.details.length).toBeGreaterThan(0)
    })
    it('reports all pass when data is clean', () => {
      const s = engine.defineSchema('s', [{ name: 'name', type: 'string' }])
      const p = engine.createPipeline('P', 'd', s.id, s.id)
      engine.addQualityRule('name', 'not_null')
      const report = engine.checkQuality(p.id, [{ name: 'Alice' }, { name: 'Bob' }])
      expect(report.passed).toBe(1)
      expect(report.failed).toBe(0)
    })
  })

  describe('lineage tracking', () => {
    it('generates lineage for pipeline', () => {
      const s1 = engine.defineSchema('input', [{ name: 'raw', type: 'string' }])
      const s2 = engine.defineSchema('output', [{ name: 'clean', type: 'string' }])
      const p = engine.createPipeline('ETL', 'd', s1.id, s2.id)
      engine.addStage(p.id, 'Clean', 'transform', s1.id, s2.id)
      const lineage = engine.getLineage(p.id)
      expect(lineage).toHaveLength(1)
      expect(lineage[0].inputFields).toContain('raw')
      expect(lineage[0].outputFields).toContain('clean')
    })
    it('returns empty for unknown pipeline', () => {
      expect(engine.getLineage('bad')).toHaveLength(0)
    })
  })

  describe('pipeline metrics', () => {
    it('analyzes pipeline metrics', () => {
      const s = engine.defineSchema('s', [{ name: 'x', type: 'number' }])
      const p = engine.createPipeline('P', 'd', s.id, s.id)
      engine.addStage(p.id, 'E', 'extract', s.id, s.id, {}, 200, 500)
      engine.addStage(p.id, 'T', 'transform', s.id, s.id, {}, 300, 100)
      engine.addStage(p.id, 'L', 'load', s.id, s.id, {}, 150, 800)
      const m = engine.analyzeMetrics(p.id)
      expect(m).toBeTruthy()
      expect(m!.totalLatencyMs).toBe(650)
      expect(m!.bottleneckStage).toBe('T')
      expect(m!.minThroughput).toBe(100)
      expect(m!.optimizationSuggestions.length).toBeGreaterThan(0)
    })
    it('returns null for unknown pipeline', () => {
      expect(engine.analyzeMetrics('bad')).toBeNull()
    })
    it('returns null for empty pipeline', () => {
      const s = engine.defineSchema('s', [{ name: 'x', type: 'number' }])
      const p = engine.createPipeline('P', 'd', s.id, s.id)
      expect(engine.analyzeMetrics(p.id)).toBeNull()
    })
  })

  describe('stats & serialization', () => {
    it('tracks all stats', () => {
      const s = engine.defineSchema('s', [{ name: 'x', type: 'number' }])
      engine.createPipeline('P', 'd', s.id, s.id)
      engine.provideFeedback()
      const stats = engine.getStats()
      expect(stats.totalSchemas).toBe(1)
      expect(stats.totalPipelines).toBe(1)
      expect(stats.feedbackCount).toBe(1)
    })
    it('serializes and deserializes', () => {
      const s = engine.defineSchema('test', [{ name: 'x', type: 'string' }])
      engine.createPipeline('P', 'd', s.id, s.id)
      const json = engine.serialize()
      const restored = DataPipelineEngine.deserialize(json)
      expect(restored.getStats().totalSchemas).toBe(1)
      expect(restored.getSchema('schema_1')).toBeTruthy()
    })
  })
})
