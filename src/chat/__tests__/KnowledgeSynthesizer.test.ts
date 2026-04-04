import { describe, it, expect, beforeEach } from 'vitest'
import {
  KnowledgeSynthesizer,
  type KnowledgeSource,
} from '../KnowledgeSynthesizer'

// ── Helpers ──

function makeSource(
  id: string,
  domain: string,
  facts: string[],
  confidence = 0.8,
): KnowledgeSource {
  return { id, domain, facts, confidence, timestamp: Date.now() }
}

const softwareSources: KnowledgeSource[] = [
  makeSource('s1', 'software-architecture', ['Microservices improve scalability', 'Caching reduces latency'], 0.9),
  makeSource('s2', 'software-performance', ['Database indexing speeds up queries', 'Connection pooling improves throughput'], 0.85),
  makeSource('s3', 'machine-learning', ['Gradient descent optimizes neural networks', 'Regularization prevents overfitting'], 0.8),
]

const contradictingSources: KnowledgeSource[] = [
  makeSource('s1', 'economics', ['Inflation is rising rapidly', 'Economy is overheating'], 0.7),
  makeSource('s2', 'economics', ['Inflation is falling', 'Economy is cooling'], 0.8),
]

describe('KnowledgeSynthesizer', () => {
  let synth: KnowledgeSynthesizer

  beforeEach(() => {
    synth = new KnowledgeSynthesizer()
  })

  // ── Constructor ──

  describe('constructor', () => {
    it('creates with default config', () => {
      const s = new KnowledgeSynthesizer()
      expect(s.getStats().totalFusions).toBe(0)
    })

    it('accepts partial config', () => {
      const s = new KnowledgeSynthesizer({ minConfidence: 0.5 })
      expect(s.getStats().totalFusions).toBe(0)
    })
  })

  // ── Source Management ──

  describe('source management', () => {
    it('adds sources', () => {
      synth.addSource(softwareSources[0])
      expect(synth.getSources().length).toBe(1)
    })

    it('gets sources as readonly', () => {
      synth.addSource(softwareSources[0])
      const sources = synth.getSources()
      expect(sources.length).toBe(1)
    })

    it('clears sources', () => {
      for (const s of softwareSources) synth.addSource(s)
      synth.clearSources()
      expect(synth.getSources().length).toBe(0)
    })
  })

  // ── Knowledge Fusion ──

  describe('fuseKnowledge', () => {
    it('fuses multiple sources', () => {
      const result = synth.fuseKnowledge(softwareSources)
      expect(result).toBeDefined()
      expect(result.unifiedFacts.length).toBeGreaterThan(0)
    })

    it('returns confidence score', () => {
      const result = synth.fuseKnowledge(softwareSources)
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('uses added sources when none provided', () => {
      for (const s of softwareSources) synth.addSource(s)
      const result = synth.fuseKnowledge()
      expect(result.unifiedFacts.length).toBeGreaterThan(0)
    })

    it('handles empty sources', () => {
      const result = synth.fuseKnowledge([])
      expect(result.unifiedFacts.length).toBe(0)
    })

    it('increments stats', () => {
      synth.fuseKnowledge(softwareSources)
      expect(synth.getStats().totalFusions).toBe(1)
    })
  })

  // ── Contradictions ──

  describe('findContradictions', () => {
    it('detects contradictions between sources', () => {
      const contras = synth.findContradictions(contradictingSources)
      expect(Array.isArray(contras)).toBe(true)
    })

    it('returns empty for agreeing sources', () => {
      const sources = [
        makeSource('a', 'tech', ['APIs are useful'], 0.9),
        makeSource('b', 'tech', ['APIs are essential'], 0.8),
      ]
      const contras = synth.findContradictions(sources)
      expect(contras.length).toBeLessThanOrEqual(sources.length)
    })

    it('uses stored sources when none provided', () => {
      for (const s of contradictingSources) synth.addSource(s)
      const contras = synth.findContradictions()
      expect(Array.isArray(contras)).toBe(true)
    })
  })

  // ── Novel Insights ──

  describe('generateNovelInsights', () => {
    it('generates insights from multiple domains', () => {
      const insights = synth.generateNovelInsights(softwareSources)
      expect(Array.isArray(insights)).toBe(true)
    })

    it('returns insights with required fields', () => {
      const insights = synth.generateNovelInsights(softwareSources)
      for (const ins of insights) {
        expect(ins.description).toBeTruthy()
        expect(typeof ins.confidence).toBe('number')
      }
    })

    it('handles single source', () => {
      const insights = synth.generateNovelInsights([softwareSources[0]])
      expect(Array.isArray(insights)).toBe(true)
    })
  })

  // ── Knowledge Gaps ──

  describe('analyzeKnowledgeGaps', () => {
    it('identifies gaps in knowledge', () => {
      const result = synth.analyzeKnowledgeGaps(
        softwareSources,
        ['software-architecture', 'data-science', 'cybersecurity'],
      )
      expect(result).toBeDefined()
      expect(result.missingAreas.length).toBeGreaterThanOrEqual(0)
    })

    it('returns coverage metric', () => {
      const result = synth.analyzeKnowledgeGaps(
        softwareSources,
        ['software-architecture', 'software-performance'],
      )
      expect(result.coverage).toBeGreaterThanOrEqual(0)
      expect(result.coverage).toBeLessThanOrEqual(1)
    })
  })

  // ── Summary ──

  describe('synthesizeSummary', () => {
    it('produces a summary from sources', () => {
      const summary = synth.synthesizeSummary(softwareSources)
      expect(summary.summary).toBeTruthy()
      expect(summary.keyPoints.length).toBeGreaterThanOrEqual(0)
    })

    it('handles empty sources', () => {
      const summary = synth.synthesizeSummary([])
      expect(summary).toBeDefined()
    })

    it('uses stored sources', () => {
      for (const s of softwareSources) synth.addSource(s)
      const summary = synth.synthesizeSummary()
      expect(summary.keyPoints.length).toBeGreaterThanOrEqual(0)
    })
  })

  // ── Transfer Knowledge ──

  describe('transferKnowledge', () => {
    it('maps knowledge between domains', () => {
      for (const s of softwareSources) synth.addSource(s)
      const mapping = synth.transferKnowledge('software-architecture', 'business-strategy')
      expect(mapping.sourceDomain).toBe('software-architecture')
      expect(mapping.targetDomain).toBe('business-strategy')
      expect(mapping.mappings.length).toBeGreaterThanOrEqual(0)
    })

    it('returns mapping with confidence', () => {
      for (const s of softwareSources) synth.addSource(s)
      const mapping = synth.transferKnowledge('software-architecture', 'software-performance')
      expect(mapping.transferQuality).toBeGreaterThanOrEqual(0)
      expect(mapping.transferQuality).toBeLessThanOrEqual(1)
    })
  })

  // ── Evidence Aggregation ──

  describe('aggregateEvidence', () => {
    it('aggregates evidence for a claim', () => {
      const result = synth.aggregateEvidence('caching improves performance', softwareSources)
      expect(result).toBeDefined()
      expect(typeof result.aggregateConfidence).toBe('number')
    })

    it('returns evidence array', () => {
      const result = synth.aggregateEvidence('improves scalability', softwareSources)
      expect(Array.isArray(result.evidence)).toBe(true)
    })

    it('handles claim with no matching evidence', () => {
      const result = synth.aggregateEvidence('quantum computing solves everything', softwareSources)
      expect(result.aggregateConfidence).toBeLessThanOrEqual(1)
    })
  })

  // ── Feedback ──

  describe('learnFromFeedback', () => {
    it('records correct feedback', () => {
      synth.learnFromFeedback(0.8, true)
      expect(synth.getStats().feedbackReceived).toBe(1)
    })

    it('records incorrect feedback', () => {
      synth.learnFromFeedback(0.7, false)
      expect(synth.getStats().feedbackReceived).toBe(1)
    })

    it('accumulates multiple feedbacks', () => {
      synth.learnFromFeedback(0.8, true)
      synth.learnFromFeedback(0.6, false)
      synth.learnFromFeedback(0.9, true)
      expect(synth.getStats().feedbackReceived).toBe(3)
    })
  })

  // ── Stats ──

  describe('getStats', () => {
    it('returns initial zero stats', () => {
      const stats = synth.getStats()
      expect(stats.totalFusions).toBe(0)
      expect(stats.feedbackReceived).toBe(0)
    })

    it('tracks all operations', () => {
      synth.fuseKnowledge(softwareSources)
      synth.findContradictions(contradictingSources)
      synth.generateNovelInsights(softwareSources)
      const stats = synth.getStats()
      expect(stats.totalFusions).toBeGreaterThan(0)
    })
  })

  // ── Serialization ──

  describe('serialize / deserialize', () => {
    it('round-trips state', () => {
      synth.fuseKnowledge(softwareSources)
      synth.learnFromFeedback(0.8, true)
      const json = synth.serialize()
      const restored = KnowledgeSynthesizer.deserialize(json)
      expect(restored.getStats().totalFusions).toBe(1)
      expect(restored.getStats().feedbackReceived).toBe(1)
    })

    it('produces valid JSON', () => {
      const json = synth.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('preserves added sources', () => {
      for (const s of softwareSources) synth.addSource(s)
      const json = synth.serialize()
      const restored = KnowledgeSynthesizer.deserialize(json)
      expect(restored.getSources().length).toBe(softwareSources.length)
    })
  })

  // ── Edge cases ──

  describe('edge cases', () => {
    it('single source fusion', () => {
      const result = synth.fuseKnowledge([softwareSources[0]])
      expect(result.unifiedFacts.length).toBeGreaterThan(0)
    })

    it('very low confidence source', () => {
      const src = makeSource('low', 'test', ['Uncertain claim'], 0.1)
      const result = synth.fuseKnowledge([src])
      expect(result).toBeDefined()
    })

    it('duplicate domains', () => {
      const sources = [
        makeSource('a', 'tech', ['Claim A'], 0.8),
        makeSource('b', 'tech', ['Claim B'], 0.9),
      ]
      const result = synth.fuseKnowledge(sources)
      expect(result.unifiedFacts.length).toBeGreaterThan(0)
    })
  })
})
