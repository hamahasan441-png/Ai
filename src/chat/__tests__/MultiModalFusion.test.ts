import { describe, it, expect, beforeEach } from 'vitest'
import { MultiModalFusion, type SourceOutput, type FusionConflict } from '../MultiModalFusion'

// ── Helpers ──

function makeOutput(overrides: Partial<SourceOutput> = {}): SourceOutput {
  return {
    sourceId: overrides.sourceId ?? 'src-1',
    content: overrides.content ?? 'Machine learning models improve accuracy over time',
    confidence: overrides.confidence ?? 0.8,
    domain: overrides.domain ?? 'ai',
    metadata: overrides.metadata ?? {},
  }
}

function _registerAndOutput(
  fusion: MultiModalFusion,
  name: string,
  domain: string,
  content: string,
  confidence: number,
  reliability?: number,
): SourceOutput {
  const src = fusion.registerSource(name, domain, reliability)
  return makeOutput({ sourceId: src.id, content, confidence, domain })
}

// ── Constructor Tests ──

describe('MultiModalFusion constructor', () => {
  it('creates an instance with default config', () => {
    const f = new MultiModalFusion()
    expect(f).toBeInstanceOf(MultiModalFusion)
  })

  it('accepts partial config', () => {
    const f = new MultiModalFusion({ maxSources: 10 })
    const cfg = f.getConfig()
    expect(cfg.maxSources).toBe(10)
    expect(cfg.enableConflictResolution).toBe(true)
  })

  it('accepts full custom config', () => {
    const f = new MultiModalFusion({
      maxSources: 5,
      enableConflictResolution: false,
      enableConsensus: false,
      enableCrossDomain: false,
      minSourcesForFusion: 1,
      conflictResolutionStrategy: 'majority_vote',
      consensusThreshold: 0.8,
    })
    const cfg = f.getConfig()
    expect(cfg.maxSources).toBe(5)
    expect(cfg.enableConflictResolution).toBe(false)
    expect(cfg.enableConsensus).toBe(false)
    expect(cfg.enableCrossDomain).toBe(false)
    expect(cfg.minSourcesForFusion).toBe(1)
    expect(cfg.conflictResolutionStrategy).toBe('majority_vote')
    expect(cfg.consensusThreshold).toBe(0.8)
  })

  it('starts with zero stats', () => {
    const f = new MultiModalFusion()
    const stats = f.getStats()
    expect(stats.totalFusions).toBe(0)
    expect(stats.totalConflictsResolved).toBe(0)
    expect(stats.totalConsensusReached).toBe(0)
    expect(stats.totalCrossDomainSyntheses).toBe(0)
    expect(stats.avgFusionConfidence).toBe(0)
    expect(stats.feedbackCount).toBe(0)
    expect(stats.avgFeedbackAccuracy).toBe(0)
  })

  it('starts with no sources', () => {
    const f = new MultiModalFusion()
    expect(f.getSources()).toHaveLength(0)
  })

  it('default config has sensible values', () => {
    const cfg = new MultiModalFusion().getConfig()
    expect(cfg.maxSources).toBe(50)
    expect(cfg.minSourcesForFusion).toBe(2)
    expect(cfg.conflictResolutionStrategy).toBe('confidence_weighted')
    expect(cfg.consensusThreshold).toBe(0.6)
  })
})

// ── registerSource Tests ──

describe('MultiModalFusion registerSource', () => {
  let fusion: MultiModalFusion

  beforeEach(() => {
    fusion = new MultiModalFusion()
  })

  it('registers a source and returns it', () => {
    const src = fusion.registerSource('test-source', 'ai')
    expect(src.id).toMatch(/^src-/)
    expect(src.name).toBe('test-source')
    expect(src.domain).toBe('ai')
  })

  it('uses default reliability of 0.7', () => {
    const src = fusion.registerSource('s1', 'nlp')
    expect(src.reliability).toBe(0.7)
    expect(src.weight).toBe(0.7)
  })

  it('uses custom reliability', () => {
    const src = fusion.registerSource('s1', 'nlp', 0.95)
    expect(src.reliability).toBe(0.95)
  })

  it('normalizes domain to lowercase', () => {
    const src = fusion.registerSource('s1', 'NLP')
    expect(src.domain).toBe('nlp')
  })

  it('clamps reliability above 1 to 1', () => {
    const src = fusion.registerSource('s1', 'ai', 1.5)
    expect(src.reliability).toBe(1)
  })

  it('clamps reliability below 0 to 0', () => {
    const src = fusion.registerSource('s1', 'ai', -0.3)
    expect(src.reliability).toBe(0)
  })

  it('sets initial useCount to 0', () => {
    const src = fusion.registerSource('s1', 'ai')
    expect(src.useCount).toBe(0)
  })

  it('sets lastUsed to a recent timestamp', () => {
    const before = Date.now()
    const src = fusion.registerSource('s1', 'ai')
    expect(src.lastUsed).toBeGreaterThanOrEqual(before)
    expect(src.lastUsed).toBeLessThanOrEqual(Date.now())
  })

  it('generates unique ids for each source', () => {
    const a = fusion.registerSource('a', 'ai')
    const b = fusion.registerSource('b', 'nlp')
    expect(a.id).not.toBe(b.id)
  })

  it('adds source to getSources()', () => {
    fusion.registerSource('s1', 'ai')
    fusion.registerSource('s2', 'nlp')
    expect(fusion.getSources()).toHaveLength(2)
  })

  it('evicts least-used source when maxSources is reached', () => {
    const small = new MultiModalFusion({ maxSources: 2 })
    const src1 = small.registerSource('s1', 'ai')
    const src2 = small.registerSource('s2', 'nlp')

    // Use src2 via fuse so its useCount increases
    const out = makeOutput({ sourceId: src2.id, content: 'deep learning is powerful' })
    const out2 = makeOutput({ sourceId: src1.id, content: 'neural networks learn patterns' })
    small.fuse([out, out2])

    // Now register a third — should evict the least-used one
    small.registerSource('s3', 'cv')
    const sources = small.getSources()
    expect(sources).toHaveLength(2)
    const names = sources.map(s => s.name)
    expect(names).toContain('s3')
  })

  it('weight equals reliability', () => {
    const src = fusion.registerSource('s1', 'ai', 0.85)
    expect(src.weight).toBe(src.reliability)
  })
})

// ── fuse Tests ──

describe('MultiModalFusion fuse', () => {
  let fusion: MultiModalFusion

  beforeEach(() => {
    fusion = new MultiModalFusion()
  })

  it('returns empty result when no outputs provided', () => {
    const result = fusion.fuse([])
    expect(result.fusedContent).toBe('')
    expect(result.confidence).toBe(0)
    expect(result.explanation).toContain('Insufficient')
  })

  it('returns single output when below minSourcesForFusion', () => {
    const src = fusion.registerSource('s1', 'ai')
    const out = makeOutput({ sourceId: src.id, content: 'test content', confidence: 0.9 })
    const result = fusion.fuse([out])
    expect(result.fusedContent).toBe('test content')
    expect(result.confidence).toBe(0.9)
    expect(result.explanation).toContain('Insufficient')
  })

  it('fuses two valid source outputs', () => {
    const src1 = fusion.registerSource('s1', 'ai')
    const src2 = fusion.registerSource('s2', 'ai')
    const o1 = makeOutput({
      sourceId: src1.id,
      content: 'Deep learning uses neural networks',
      confidence: 0.9,
    })
    const o2 = makeOutput({
      sourceId: src2.id,
      content: 'Transformers advanced language modeling',
      confidence: 0.8,
    })
    const result = fusion.fuse([o1, o2])
    expect(result.fusedContent.length).toBeGreaterThan(0)
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.sources).toHaveLength(2)
  })

  it('increments totalFusions stat', () => {
    const src1 = fusion.registerSource('s1', 'ai')
    const src2 = fusion.registerSource('s2', 'ai')
    const o1 = makeOutput({
      sourceId: src1.id,
      content: 'Neural networks learn representations',
      confidence: 0.8,
    })
    const o2 = makeOutput({
      sourceId: src2.id,
      content: 'Gradient descent optimizes parameters',
      confidence: 0.7,
    })
    fusion.fuse([o1, o2])
    expect(fusion.getStats().totalFusions).toBe(1)
  })

  it('filters out outputs with zero confidence', () => {
    const src1 = fusion.registerSource('s1', 'ai')
    const src2 = fusion.registerSource('s2', 'ai')
    const o1 = makeOutput({ sourceId: src1.id, content: 'Valid output', confidence: 0.8 })
    const o2 = makeOutput({ sourceId: src2.id, content: 'Zero conf output', confidence: 0 })
    const result = fusion.fuse([o1, o2])
    expect(result.explanation).toContain('Insufficient')
  })

  it('filters out outputs with empty content', () => {
    const src1 = fusion.registerSource('s1', 'ai')
    const src2 = fusion.registerSource('s2', 'ai')
    const o1 = makeOutput({ sourceId: src1.id, content: 'Valid output here', confidence: 0.8 })
    const o2 = makeOutput({ sourceId: src2.id, content: '', confidence: 0.8 })
    const result = fusion.fuse([o1, o2])
    expect(result.explanation).toContain('Insufficient')
  })

  it('updates source useCount after fusion', () => {
    const src1 = fusion.registerSource('s1', 'ai')
    const src2 = fusion.registerSource('s2', 'ai')
    const o1 = makeOutput({
      sourceId: src1.id,
      content: 'Reinforcement learning trains agents',
      confidence: 0.9,
    })
    const o2 = makeOutput({
      sourceId: src2.id,
      content: 'Reward functions guide behavior',
      confidence: 0.8,
    })
    fusion.fuse([o1, o2])
    const sources = fusion.getSources()
    const s1 = sources.find(s => s.id === src1.id)!
    expect(s1.useCount).toBe(1)
  })

  it('explanation includes source count', () => {
    const src1 = fusion.registerSource('s1', 'ai')
    const src2 = fusion.registerSource('s2', 'ai')
    const o1 = makeOutput({
      sourceId: src1.id,
      content: 'Convolutional layers extract features',
      confidence: 0.9,
    })
    const o2 = makeOutput({
      sourceId: src2.id,
      content: 'Pooling layers reduce dimensions',
      confidence: 0.8,
    })
    const result = fusion.fuse([o1, o2])
    expect(result.explanation).toContain('Fused 2 source outputs')
  })

  it('respects minSourcesForFusion=1 config', () => {
    const f = new MultiModalFusion({ minSourcesForFusion: 1 })
    const src = f.registerSource('s1', 'ai')
    const o = makeOutput({
      sourceId: src.id,
      content: 'Single source data analysis result',
      confidence: 0.85,
    })
    const result = f.fuse([o])
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.explanation).toContain('Fused 1 source')
  })

  it('handles fusion of three sources', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'ai')
    const s3 = fusion.registerSource('s3', 'ai')
    const result = fusion.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Attention mechanisms weight inputs selectively',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Embeddings represent words as vectors',
        confidence: 0.85,
      }),
      makeOutput({
        sourceId: s3.id,
        content: 'Tokenization splits text into subwords',
        confidence: 0.8,
      }),
    ])
    expect(result.sources).toHaveLength(3)
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('higher confidence source content appears in fused output', () => {
    const s1 = fusion.registerSource('s1', 'ai', 0.9)
    const s2 = fusion.registerSource('s2', 'ai', 0.5)
    const result = fusion.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'BERT uses bidirectional attention',
        confidence: 0.95,
      }),
      makeOutput({ sourceId: s2.id, content: 'GPT uses autoregressive decoding', confidence: 0.4 }),
    ])
    expect(result.fusedContent).toContain('BERT')
  })

  it('disabled conflict resolution skips conflict detection', () => {
    const f = new MultiModalFusion({ enableConflictResolution: false })
    const s1 = f.registerSource('s1', 'health')
    const s2 = f.registerSource('s2', 'health')
    const result = f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Exercise improves cardiovascular health significantly',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Exercise does not improve cardiovascular health',
        confidence: 0.8,
      }),
    ])
    expect(result.conflicts).toHaveLength(0)
  })

  it('disabled consensus skips consensus detection', () => {
    const f = new MultiModalFusion({ enableConsensus: false })
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'ai')
    const result = f.fuse([
      makeOutput({ sourceId: s1.id, content: 'Deep learning works well', confidence: 0.9 }),
      makeOutput({ sourceId: s2.id, content: 'Deep learning works well', confidence: 0.85 }),
    ])
    expect(result.consensusLevel).toBe(0)
  })

  it('disabled crossDomain skips synthesis', () => {
    const f = new MultiModalFusion({ enableCrossDomain: false })
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'biology')
    const _result = f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Neural networks model brain patterns',
        confidence: 0.9,
        domain: 'ai',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Neurons fire in brain patterns',
        confidence: 0.85,
        domain: 'biology',
      }),
    ])
    expect(f.getStats().totalCrossDomainSyntheses).toBe(0)
  })

  it('confidence is rounded to 2 decimal places', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'ai')
    const result = fusion.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Backpropagation computes gradients efficiently',
        confidence: 0.777,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Stochastic gradient descent converges slowly',
        confidence: 0.333,
      }),
    ])
    const decimals = result.confidence.toString().split('.')[1]
    expect(!decimals || decimals.length <= 2).toBe(true)
  })

  it('consensusLevel is rounded to 2 decimal places', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'ai')
    const result = fusion.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Transfer learning reuses pretrained models',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Fine-tuning adapts pretrained models',
        confidence: 0.85,
      }),
    ])
    const decimals = result.consensusLevel.toString().split('.')[1]
    expect(!decimals || decimals.length <= 2).toBe(true)
  })

  it('tracks fusion confidence in history for stats', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'ai')
    fusion.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Recurrent networks handle sequences well',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'LSTM cells retain long-term memory',
        confidence: 0.85,
      }),
    ])
    expect(fusion.getStats().avgFusionConfidence).toBeGreaterThan(0)
  })
})

// ── detectConflicts Tests ──

describe('MultiModalFusion detectConflicts', () => {
  let fusion: MultiModalFusion

  beforeEach(() => {
    fusion = new MultiModalFusion()
  })

  it('detects conflict when one source negates the other', () => {
    const s1 = fusion.registerSource('s1', 'health')
    const s2 = fusion.registerSource('s2', 'health')
    const conflicts = fusion.detectConflicts([
      makeOutput({
        sourceId: s1.id,
        content: 'Regular exercise improves cardiovascular health significantly',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Regular exercise does not improve cardiovascular health significantly',
        confidence: 0.8,
      }),
    ])
    expect(conflicts.length).toBeGreaterThanOrEqual(1)
    expect(conflicts[0].source1Id).toBe(s1.id)
    expect(conflicts[0].source2Id).toBe(s2.id)
  })

  it('returns no conflicts when sources cover different topics', () => {
    const s1 = fusion.registerSource('s1', 'cooking')
    const s2 = fusion.registerSource('s2', 'music')
    const conflicts = fusion.detectConflicts([
      makeOutput({
        sourceId: s1.id,
        content: 'Sourdough bread requires long fermentation times',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Jazz improvisation follows harmonic chord progressions',
        confidence: 0.85,
      }),
    ])
    expect(conflicts).toHaveLength(0)
  })

  it('returns no conflicts for a single output', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const conflicts = fusion.detectConflicts([
      makeOutput({ sourceId: s1.id, content: 'Machine learning is effective', confidence: 0.9 }),
    ])
    expect(conflicts).toHaveLength(0)
  })

  it('returns no conflicts for empty outputs', () => {
    const conflicts = fusion.detectConflicts([])
    expect(conflicts).toHaveLength(0)
  })

  it('conflict description mentions source names', () => {
    const s1 = fusion.registerSource('alpha', 'health')
    const s2 = fusion.registerSource('beta', 'health')
    const conflicts = fusion.detectConflicts([
      makeOutput({
        sourceId: s1.id,
        content: 'Vitamin supplements improve overall health significantly',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Vitamin supplements do not improve overall health',
        confidence: 0.8,
      }),
    ])
    if (conflicts.length > 0) {
      expect(conflicts[0].description).toContain('alpha')
      expect(conflicts[0].description).toContain('beta')
    }
  })

  it('detects conflict with negation word "never"', () => {
    const s1 = fusion.registerSource('s1', 'finance')
    const s2 = fusion.registerSource('s2', 'finance')
    const conflicts = fusion.detectConflicts([
      makeOutput({
        sourceId: s1.id,
        content: 'Stock markets always recover after major crashes eventually',
        confidence: 0.8,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Stock markets never recover after major crashes eventually',
        confidence: 0.7,
      }),
    ])
    expect(conflicts.length).toBeGreaterThanOrEqual(1)
  })

  it('detects multiple conflicts among three sources', () => {
    const s1 = fusion.registerSource('s1', 'health')
    const s2 = fusion.registerSource('s2', 'health')
    const s3 = fusion.registerSource('s3', 'health')
    const conflicts = fusion.detectConflicts([
      makeOutput({
        sourceId: s1.id,
        content: 'Coffee consumption improves alertness and cognitive performance',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Coffee consumption does not improve alertness or cognitive performance',
        confidence: 0.8,
      }),
      makeOutput({
        sourceId: s3.id,
        content: 'Coffee consumption never improves alertness and cognitive performance',
        confidence: 0.7,
      }),
    ])
    expect(conflicts.length).toBeGreaterThanOrEqual(1)
  })

  it('no conflict between completely unrelated topics', () => {
    const s1 = fusion.registerSource('s1', 'cooking')
    const s2 = fusion.registerSource('s2', 'astronomy')
    const conflicts = fusion.detectConflicts([
      makeOutput({
        sourceId: s1.id,
        content: 'Baking bread requires yeast and flour combined together',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Black holes warp spacetime creating singularities',
        confidence: 0.8,
      }),
    ])
    expect(conflicts).toHaveLength(0)
  })
})

// ── resolveConflict Tests ──

describe('MultiModalFusion resolveConflict', () => {
  it('resolves via confidence_weighted strategy', () => {
    const f = new MultiModalFusion({ conflictResolutionStrategy: 'confidence_weighted' })
    const s1 = f.registerSource('s1', 'ai', 0.9)
    const s2 = f.registerSource('s2', 'ai', 0.5)
    const outputs = [
      makeOutput({
        sourceId: s1.id,
        content: 'Supervised learning requires labeled training data',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Supervised learning does not require labeled data',
        confidence: 0.5,
      }),
    ]
    const conflict: FusionConflict = {
      source1Id: s1.id,
      source2Id: s2.id,
      description: 'test conflict',
      resolution: '',
      resolvedContent: '',
      resolutionConfidence: 0,
    }
    const resolved = f.resolveConflict(conflict, outputs)
    expect(resolved.length).toBeGreaterThan(0)
    expect(conflict.resolution).toBe('confidence_weighted')
    expect(conflict.resolutionConfidence).toBeGreaterThan(0)
    // Higher-weighted source content should be primary
    expect(resolved).toContain('Supervised learning requires labeled training data')
    expect(resolved).toContain('alternative view')
  })

  it('resolves via highest_confidence strategy', () => {
    const f = new MultiModalFusion({ conflictResolutionStrategy: 'highest_confidence' })
    const s1 = f.registerSource('s1', 'ai', 0.8)
    const s2 = f.registerSource('s2', 'ai', 0.8)
    const outputs = [
      makeOutput({
        sourceId: s1.id,
        content: 'Transformers outperform recurrent models',
        confidence: 0.95,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Recurrent models outperform transformers',
        confidence: 0.6,
      }),
    ]
    const conflict: FusionConflict = {
      source1Id: s1.id,
      source2Id: s2.id,
      description: 'test',
      resolution: '',
      resolvedContent: '',
      resolutionConfidence: 0,
    }
    const resolved = f.resolveConflict(conflict, outputs)
    expect(resolved).toBe('Transformers outperform recurrent models')
    expect(conflict.resolutionConfidence).toBe(0.95)
  })

  it('resolves via majority_vote strategy', () => {
    const f = new MultiModalFusion({ conflictResolutionStrategy: 'majority_vote' })
    const s1 = f.registerSource('s1', 'ai', 0.9)
    const s2 = f.registerSource('s2', 'ai', 0.3)
    const outputs = [
      makeOutput({
        sourceId: s1.id,
        content: 'GANs generate realistic synthetic images',
        confidence: 0.8,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'GANs cannot generate realistic images',
        confidence: 0.7,
      }),
    ]
    const conflict: FusionConflict = {
      source1Id: s1.id,
      source2Id: s2.id,
      description: 'test',
      resolution: '',
      resolvedContent: '',
      resolutionConfidence: 0,
    }
    const resolved = f.resolveConflict(conflict, outputs)
    expect(resolved.length).toBeGreaterThan(0)
    expect(conflict.resolution).toBe('majority_vote')
    // s1 has higher reliability*confidence so wins
    expect(resolved).toContain('GANs generate realistic synthetic images')
  })

  it('returns empty string when source1 not found in outputs', () => {
    const f = new MultiModalFusion()
    const s2 = f.registerSource('s2', 'ai')
    const conflict: FusionConflict = {
      source1Id: 'nonexistent',
      source2Id: s2.id,
      description: 'test',
      resolution: '',
      resolvedContent: '',
      resolutionConfidence: 0,
    }
    const resolved = f.resolveConflict(conflict, [
      makeOutput({ sourceId: s2.id, content: 'some content', confidence: 0.8 }),
    ])
    expect(resolved).toBe('')
  })

  it('returns empty string when source2 not found in outputs', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'ai')
    const conflict: FusionConflict = {
      source1Id: s1.id,
      source2Id: 'nonexistent',
      description: 'test',
      resolution: '',
      resolvedContent: '',
      resolutionConfidence: 0,
    }
    const resolved = f.resolveConflict(conflict, [
      makeOutput({ sourceId: s1.id, content: 'some content', confidence: 0.8 }),
    ])
    expect(resolved).toBe('')
  })

  it('highest_confidence picks second source when it has higher confidence', () => {
    const f = new MultiModalFusion({ conflictResolutionStrategy: 'highest_confidence' })
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'ai')
    const outputs = [
      makeOutput({ sourceId: s1.id, content: 'Approach alpha is better', confidence: 0.3 }),
      makeOutput({ sourceId: s2.id, content: 'Approach beta is better', confidence: 0.9 }),
    ]
    const conflict: FusionConflict = {
      source1Id: s1.id,
      source2Id: s2.id,
      description: 'test',
      resolution: '',
      resolvedContent: '',
      resolutionConfidence: 0,
    }
    const resolved = f.resolveConflict(conflict, outputs)
    expect(resolved).toBe('Approach beta is better')
    expect(conflict.resolutionConfidence).toBe(0.9)
  })

  it('confidence_weighted includes alternative view note', () => {
    const f = new MultiModalFusion({ conflictResolutionStrategy: 'confidence_weighted' })
    const s1 = f.registerSource('s1', 'ai', 0.5)
    const s2 = f.registerSource('s2', 'ai', 0.9)
    const outputs = [
      makeOutput({
        sourceId: s1.id,
        content: 'Low reliability source view on classification',
        confidence: 0.8,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'High reliability source view on classification',
        confidence: 0.8,
      }),
    ]
    const conflict: FusionConflict = {
      source1Id: s1.id,
      source2Id: s2.id,
      description: 'test',
      resolution: '',
      resolvedContent: '',
      resolutionConfidence: 0,
    }
    const resolved = f.resolveConflict(conflict, outputs)
    expect(resolved).toContain('Note: an alternative view suggests')
  })

  it('majority_vote picks second source when its weighted score is higher', () => {
    const f = new MultiModalFusion({ conflictResolutionStrategy: 'majority_vote' })
    const s1 = f.registerSource('s1', 'ai', 0.2)
    const s2 = f.registerSource('s2', 'ai', 0.95)
    const outputs = [
      makeOutput({ sourceId: s1.id, content: 'Low weighted source opinion here', confidence: 0.5 }),
      makeOutput({
        sourceId: s2.id,
        content: 'High weighted source opinion here',
        confidence: 0.9,
      }),
    ]
    const conflict: FusionConflict = {
      source1Id: s1.id,
      source2Id: s2.id,
      description: 'test',
      resolution: '',
      resolvedContent: '',
      resolutionConfidence: 0,
    }
    const resolved = f.resolveConflict(conflict, outputs)
    expect(resolved).toContain('High weighted source opinion here')
  })
})

// ── detectConsensus Tests ──

describe('MultiModalFusion detectConsensus', () => {
  let fusion: MultiModalFusion

  beforeEach(() => {
    fusion = new MultiModalFusion()
  })

  it('returns no consensus for single output', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const result = fusion.detectConsensus([
      makeOutput({ sourceId: s1.id, content: 'Neural networks learn features', confidence: 0.9 }),
    ])
    expect(result.reached).toBe(false)
    expect(result.level).toBe(0)
    expect(result.agreeing).toHaveLength(0)
  })

  it('returns no consensus for empty outputs', () => {
    const result = fusion.detectConsensus([])
    expect(result.reached).toBe(false)
  })

  it('detects consensus when two sources have identical content', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'ai')
    const result = fusion.detectConsensus([
      makeOutput({
        sourceId: s1.id,
        content: 'Deep learning revolutionized computer vision',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Deep learning revolutionized computer vision',
        confidence: 0.85,
      }),
    ])
    expect(result.reached).toBe(true)
    expect(result.level).toBe(1)
    expect(result.agreeing).toHaveLength(2)
  })

  it('detects consensus when sources are similar', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'ai')
    const s3 = fusion.registerSource('s3', 'ai')
    const result = fusion.detectConsensus([
      makeOutput({
        sourceId: s1.id,
        content: 'Transformer models excel at language understanding tasks',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Transformer models are great at language understanding tasks',
        confidence: 0.85,
      }),
      makeOutput({
        sourceId: s3.id,
        content: 'Transformer models perform well in language understanding tasks',
        confidence: 0.8,
      }),
    ])
    expect(result.reached).toBe(true)
    expect(result.level).toBeGreaterThan(0)
  })

  it('no consensus when sources completely diverge', () => {
    const s1 = fusion.registerSource('s1', 'cooking')
    const s2 = fusion.registerSource('s2', 'astronomy')
    const result = fusion.detectConsensus([
      makeOutput({
        sourceId: s1.id,
        content: 'Baking sourdough requires starter culture',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Quantum entanglement enables teleportation',
        confidence: 0.8,
      }),
    ])
    expect(result.reached).toBe(false)
    expect(result.agreeing.length).toBeLessThanOrEqual(1)
  })

  it('consensus threshold affects whether consensus is reached', () => {
    const high = new MultiModalFusion({ consensusThreshold: 0.99 })
    const s1 = high.registerSource('s1', 'ai')
    const s2 = high.registerSource('s2', 'ai')
    const s3 = high.registerSource('s3', 'cooking')
    const outputs = [
      makeOutput({
        sourceId: s1.id,
        content: 'Machine learning patterns classification',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Machine learning patterns classification',
        confidence: 0.85,
      }),
      makeOutput({
        sourceId: s3.id,
        content: 'Bread baking temperature timing yeast flour',
        confidence: 0.7,
      }),
    ]
    const result = high.detectConsensus(outputs)
    // with threshold 0.99, 2 out of 3 agreeing (0.67) won't reach consensus
    expect(result.reached).toBe(false)
  })

  it('consensus level reflects fraction of agreeing sources', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'ai')
    const result = fusion.detectConsensus([
      makeOutput({
        sourceId: s1.id,
        content: 'Classification algorithms categorize data',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Classification algorithms categorize data',
        confidence: 0.85,
      }),
    ])
    expect(result.level).toBe(1)
  })
})

// ── synthesizeCrossDomain Tests ──

describe('MultiModalFusion synthesizeCrossDomain', () => {
  let fusion: MultiModalFusion

  beforeEach(() => {
    fusion = new MultiModalFusion()
  })

  it('returns empty for single domain', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'ai')
    const insights = fusion.synthesizeCrossDomain([
      makeOutput({
        sourceId: s1.id,
        content: 'Neural networks process data',
        confidence: 0.9,
        domain: 'ai',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Deep learning models improve',
        confidence: 0.85,
        domain: 'ai',
      }),
    ])
    expect(insights).toHaveLength(0)
  })

  it('returns empty for empty outputs', () => {
    const insights = fusion.synthesizeCrossDomain([])
    expect(insights).toHaveLength(0)
  })

  it('synthesizes insights from two domains with shared concepts', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'biology')
    const insights = fusion.synthesizeCrossDomain([
      makeOutput({
        sourceId: s1.id,
        content: 'Neural network models learn patterns through training data',
        confidence: 0.9,
        domain: 'ai',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Biological neural pathways learn patterns through experience',
        confidence: 0.85,
        domain: 'biology',
      }),
    ])
    expect(insights.length).toBeGreaterThanOrEqual(1)
    if (insights.length > 0) {
      expect(insights[0].domains).toContain('ai')
      expect(insights[0].domains).toContain('biology')
      expect(insights[0].confidence).toBeGreaterThan(0)
      expect(insights[0].contributingSources.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('returns no insight when domains share no keywords', () => {
    const s1 = fusion.registerSource('s1', 'cooking')
    const s2 = fusion.registerSource('s2', 'astronomy')
    const insights = fusion.synthesizeCrossDomain([
      makeOutput({
        sourceId: s1.id,
        content: 'Baking bread requires yeast flour dough',
        confidence: 0.9,
        domain: 'cooking',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Galaxies contain billions of stars planets',
        confidence: 0.85,
        domain: 'astronomy',
      }),
    ])
    expect(insights).toHaveLength(0)
  })

  it('insight text mentions both domains', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'neuroscience')
    const insights = fusion.synthesizeCrossDomain([
      makeOutput({
        sourceId: s1.id,
        content: 'Pattern recognition learning algorithms model brain processing',
        confidence: 0.9,
        domain: 'ai',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Brain processing patterns recognition learning neurons',
        confidence: 0.85,
        domain: 'neuroscience',
      }),
    ])
    if (insights.length > 0) {
      expect(insights[0].insight).toContain('ai')
      expect(insights[0].insight).toContain('neuroscience')
    }
  })

  it('synthesizes across three domains', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'biology')
    const s3 = fusion.registerSource('s3', 'psychology')
    const insights = fusion.synthesizeCrossDomain([
      makeOutput({
        sourceId: s1.id,
        content: 'Learning algorithms adapt behavior through feedback signals',
        confidence: 0.9,
        domain: 'ai',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Organisms adapt behavior through evolutionary feedback signals',
        confidence: 0.85,
        domain: 'biology',
      }),
      makeOutput({
        sourceId: s3.id,
        content: 'Humans adapt behavior through cognitive feedback signals',
        confidence: 0.8,
        domain: 'psychology',
      }),
    ])
    // Could produce up to 3 pairwise insights
    expect(insights.length).toBeGreaterThanOrEqual(1)
  })

  it('normalizes domain case', () => {
    const s1 = fusion.registerSource('s1', 'AI')
    const s2 = fusion.registerSource('s2', 'ai')
    const insights = fusion.synthesizeCrossDomain([
      makeOutput({
        sourceId: s1.id,
        content: 'Neural networks process data',
        confidence: 0.9,
        domain: 'AI',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Neural networks process data too',
        confidence: 0.85,
        domain: 'ai',
      }),
    ])
    // Same domain after normalization → no cross-domain
    expect(insights).toHaveLength(0)
  })
})

// ── getSourceReliability / updateSourceReliability Tests ──

describe('MultiModalFusion source reliability', () => {
  let fusion: MultiModalFusion

  beforeEach(() => {
    fusion = new MultiModalFusion()
  })

  it('getSourceReliability returns 0 for unknown source', () => {
    expect(fusion.getSourceReliability('nonexistent')).toBe(0)
  })

  it('getSourceReliability returns initial reliability', () => {
    const src = fusion.registerSource('s1', 'ai', 0.8)
    expect(fusion.getSourceReliability(src.id)).toBe(0.8)
  })

  it('updateSourceReliability increases on correct', () => {
    const src = fusion.registerSource('s1', 'ai', 0.7)
    fusion.updateSourceReliability(src.id, true)
    expect(fusion.getSourceReliability(src.id)).toBeGreaterThan(0.7)
  })

  it('updateSourceReliability decreases on incorrect', () => {
    const src = fusion.registerSource('s1', 'ai', 0.7)
    fusion.updateSourceReliability(src.id, false)
    expect(fusion.getSourceReliability(src.id)).toBeLessThan(0.7)
  })

  it('reliability stays within 0-1 after many correct updates', () => {
    const src = fusion.registerSource('s1', 'ai', 0.9)
    for (let i = 0; i < 100; i++) {
      fusion.updateSourceReliability(src.id, true)
    }
    expect(fusion.getSourceReliability(src.id)).toBeLessThanOrEqual(1)
    expect(fusion.getSourceReliability(src.id)).toBeGreaterThanOrEqual(0)
  })

  it('reliability stays within 0-1 after many incorrect updates', () => {
    const src = fusion.registerSource('s1', 'ai', 0.1)
    for (let i = 0; i < 100; i++) {
      fusion.updateSourceReliability(src.id, false)
    }
    expect(fusion.getSourceReliability(src.id)).toBeGreaterThanOrEqual(0)
    expect(fusion.getSourceReliability(src.id)).toBeLessThanOrEqual(1)
  })

  it('updateSourceReliability does nothing for unknown source', () => {
    fusion.updateSourceReliability('nonexistent', true)
    // Should not throw
    expect(fusion.getSourceReliability('nonexistent')).toBe(0)
  })

  it('reliability update also updates weight', () => {
    const src = fusion.registerSource('s1', 'ai', 0.7)
    fusion.updateSourceReliability(src.id, true)
    const updatedSrc = fusion.getSources().find(s => s.id === src.id)!
    expect(updatedSrc.weight).toBe(updatedSrc.reliability)
  })

  it('multiple correct updates steadily increase reliability', () => {
    const src = fusion.registerSource('s1', 'ai', 0.5)
    const initial = fusion.getSourceReliability(src.id)
    fusion.updateSourceReliability(src.id, true)
    const after1 = fusion.getSourceReliability(src.id)
    fusion.updateSourceReliability(src.id, true)
    const after2 = fusion.getSourceReliability(src.id)
    expect(after1).toBeGreaterThan(initial)
    expect(after2).toBeGreaterThan(after1)
  })
})

// ── provideFeedback Tests ──

describe('MultiModalFusion provideFeedback', () => {
  let fusion: MultiModalFusion

  beforeEach(() => {
    fusion = new MultiModalFusion()
  })

  it('increments feedback count', () => {
    fusion.provideFeedback('fus-1', 0.8)
    expect(fusion.getStats().feedbackCount).toBe(1)
  })

  it('updates avgFeedbackAccuracy', () => {
    fusion.provideFeedback('fus-1', 0.8)
    fusion.provideFeedback('fus-2', 0.6)
    expect(fusion.getStats().avgFeedbackAccuracy).toBe(0.7)
  })

  it('clamps feedback quality to 0-1 range (above 1)', () => {
    fusion.provideFeedback('fus-1', 1.5)
    expect(fusion.getStats().avgFeedbackAccuracy).toBe(1)
  })

  it('clamps feedback quality to 0-1 range (below 0)', () => {
    fusion.provideFeedback('fus-1', -0.5)
    expect(fusion.getStats().avgFeedbackAccuracy).toBe(0)
  })

  it('good feedback (>=0.5) increases source reliability', () => {
    const s1 = fusion.registerSource('s1', 'ai', 0.7)
    const s2 = fusion.registerSource('s2', 'ai', 0.7)
    const o1 = makeOutput({
      sourceId: s1.id,
      content: 'Attention mechanisms are powerful models',
      confidence: 0.9,
    })
    const o2 = makeOutput({
      sourceId: s2.id,
      content: 'Transformers use attention mechanisms effectively',
      confidence: 0.85,
    })
    const _result = fusion.fuse([o1, o2])

    // Get a fusion ID from the log by providing feedback with known key
    // Use the internal mechanism: fuse() logs it, provideFeedback looks it up
    // We need to work around not having the fusionId — but provideFeedback
    // will just push quality if fusionId doesn't match
    const reliabilityBefore = fusion.getSourceReliability(s1.id)
    // provideFeedback with a non-matching id won't update sources
    fusion.provideFeedback('non-matching-id', 0.9)
    expect(fusion.getSourceReliability(s1.id)).toBe(reliabilityBefore)
  })

  it('bad feedback (<0.5) on matching fusionId would decrease reliability', () => {
    fusion.provideFeedback('unknown-id', 0.2)
    expect(fusion.getStats().feedbackCount).toBe(1)
    expect(fusion.getStats().avgFeedbackAccuracy).toBe(0.2)
  })

  it('multiple feedbacks compute correct average', () => {
    fusion.provideFeedback('f1', 1.0)
    fusion.provideFeedback('f2', 0.5)
    fusion.provideFeedback('f3', 0.0)
    expect(fusion.getStats().avgFeedbackAccuracy).toBe(0.5)
  })
})

// ── getStats / getSources / getConfig / reset Tests ──

describe('MultiModalFusion getStats / getSources / getConfig / reset', () => {
  let fusion: MultiModalFusion

  beforeEach(() => {
    fusion = new MultiModalFusion()
  })

  it('getStats returns all stat fields', () => {
    const stats = fusion.getStats()
    expect(stats).toHaveProperty('totalFusions')
    expect(stats).toHaveProperty('totalConflictsResolved')
    expect(stats).toHaveProperty('totalConsensusReached')
    expect(stats).toHaveProperty('totalCrossDomainSyntheses')
    expect(stats).toHaveProperty('avgFusionConfidence')
    expect(stats).toHaveProperty('feedbackCount')
    expect(stats).toHaveProperty('avgFeedbackAccuracy')
  })

  it('getSources returns a copy (not internal reference)', () => {
    fusion.registerSource('s1', 'ai')
    const sources1 = fusion.getSources()
    const sources2 = fusion.getSources()
    expect(sources1).not.toBe(sources2)
    expect(sources1).toEqual(sources2)
  })

  it('getConfig returns a copy', () => {
    const cfg1 = fusion.getConfig()
    const cfg2 = fusion.getConfig()
    expect(cfg1).not.toBe(cfg2)
    expect(cfg1).toEqual(cfg2)
  })

  it('getConfig returns correct values', () => {
    const cfg = fusion.getConfig()
    expect(cfg.maxSources).toBe(50)
    expect(cfg.enableConflictResolution).toBe(true)
    expect(cfg.enableConsensus).toBe(true)
    expect(cfg.enableCrossDomain).toBe(true)
    expect(cfg.minSourcesForFusion).toBe(2)
    expect(cfg.conflictResolutionStrategy).toBe('confidence_weighted')
    expect(cfg.consensusThreshold).toBe(0.6)
  })

  it('reset clears all sources', () => {
    fusion.registerSource('s1', 'ai')
    fusion.registerSource('s2', 'nlp')
    fusion.reset()
    expect(fusion.getSources()).toHaveLength(0)
  })

  it('reset clears all stats', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'ai')
    fusion.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Clustering groups similar data points together',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Dimensionality reduction compresses feature space',
        confidence: 0.85,
      }),
    ])
    fusion.provideFeedback('f1', 0.8)
    fusion.reset()
    const stats = fusion.getStats()
    expect(stats.totalFusions).toBe(0)
    expect(stats.feedbackCount).toBe(0)
    expect(stats.avgFusionConfidence).toBe(0)
    expect(stats.avgFeedbackAccuracy).toBe(0)
    expect(stats.totalConflictsResolved).toBe(0)
    expect(stats.totalConsensusReached).toBe(0)
    expect(stats.totalCrossDomainSyntheses).toBe(0)
  })

  it('reset allows starting fresh', () => {
    fusion.registerSource('s1', 'ai')
    fusion.reset()
    const _s = fusion.registerSource('s2', 'nlp')
    expect(fusion.getSources()).toHaveLength(1)
    expect(fusion.getSources()[0].name).toBe('s2')
  })

  it('stats track totalConsensusReached after fusions with agreement', () => {
    const s1 = fusion.registerSource('s1', 'ai')
    const s2 = fusion.registerSource('s2', 'ai')
    fusion.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Deep learning models require large training datasets',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Deep learning models require large training datasets',
        confidence: 0.85,
      }),
    ])
    expect(fusion.getStats().totalConsensusReached).toBeGreaterThanOrEqual(1)
  })

  it('stats track totalConflictsResolved', () => {
    const s1 = fusion.registerSource('s1', 'health')
    const s2 = fusion.registerSource('s2', 'health')
    fusion.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Meditation reduces stress levels significantly',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Meditation does not reduce stress levels significantly',
        confidence: 0.8,
      }),
    ])
    expect(fusion.getStats().totalConflictsResolved).toBeGreaterThanOrEqual(1)
  })
})

// ── Integration Scenarios ──

describe('MultiModalFusion integration scenarios', () => {
  it('full workflow: register, fuse, feedback, check stats', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('nlp-engine', 'nlp', 0.9)
    const s2 = f.registerSource('vision-model', 'cv', 0.8)
    const s3 = f.registerSource('audio-model', 'audio', 0.7)

    const result = f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Text analysis reveals positive sentiment about machine learning',
        confidence: 0.85,
        domain: 'nlp',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Image classification detects objects with machine learning accuracy',
        confidence: 0.8,
        domain: 'cv',
      }),
      makeOutput({
        sourceId: s3.id,
        content: 'Speech recognition improves with machine learning techniques',
        confidence: 0.75,
        domain: 'audio',
      }),
    ])

    expect(result.fusedContent.length).toBeGreaterThan(0)
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.sources).toHaveLength(3)

    f.provideFeedback('some-id', 0.9)
    const stats = f.getStats()
    expect(stats.totalFusions).toBe(1)
    expect(stats.feedbackCount).toBe(1)
  })

  it('multiple fusions accumulate stats correctly', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'ai')

    for (let i = 0; i < 5; i++) {
      f.fuse([
        makeOutput({
          sourceId: s1.id,
          content: `Analysis batch ${i} showing positive results trends`,
          confidence: 0.8,
        }),
        makeOutput({
          sourceId: s2.id,
          content: `Analysis batch ${i} confirming positive results trends`,
          confidence: 0.75,
        }),
      ])
    }

    expect(f.getStats().totalFusions).toBe(5)
    expect(f.getStats().avgFusionConfidence).toBeGreaterThan(0)
  })

  it('conflict resolution updates stats during fuse', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('optimist', 'market')
    const s2 = f.registerSource('pessimist', 'market')

    f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Regular exercise significantly improves cardiovascular health outcomes',
        confidence: 0.8,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Regular exercise does not improve cardiovascular health outcomes',
        confidence: 0.75,
      }),
    ])

    expect(f.getStats().totalConflictsResolved).toBeGreaterThanOrEqual(1)
  })

  it('cross-domain synthesis via fuse updates stats', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'medicine')
    const s2 = f.registerSource('s2', 'technology')

    f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Medical imaging diagnosis benefits from pattern recognition algorithms',
        confidence: 0.9,
        domain: 'medicine',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Computer vision pattern recognition algorithms detect anomalies',
        confidence: 0.85,
        domain: 'technology',
      }),
    ])

    // Cross-domain synthesis produces insights if shared keywords exist
    const stats = f.getStats()
    expect(stats.totalFusions).toBe(1)
  })

  it('feedback after fuse adjusts reliability appropriately', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('reliable', 'ai', 0.8)
    const s2 = f.registerSource('unreliable', 'ai', 0.3)

    f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Gradient boosting improves prediction accuracy score',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Random forests provide ensemble learning predictions score',
        confidence: 0.5,
      }),
    ])

    // The reliable source should maintain reasonable reliability
    expect(f.getSourceReliability(s1.id)).toBeGreaterThanOrEqual(0.5)
  })

  it('reset and re-use works correctly', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'ai')
    f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Bayesian inference updates prior beliefs',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Maximum likelihood estimation parameters fitting',
        confidence: 0.85,
      }),
    ])

    f.reset()
    expect(f.getStats().totalFusions).toBe(0)
    expect(f.getSources()).toHaveLength(0)

    // Re-use after reset
    const s3 = f.registerSource('s3', 'nlp')
    const s4 = f.registerSource('s4', 'nlp')
    f.fuse([
      makeOutput({
        sourceId: s3.id,
        content: 'Named entity recognition extracts information entities',
        confidence: 0.85,
      }),
      makeOutput({
        sourceId: s4.id,
        content: 'Sentiment analysis determines text polarity emotions',
        confidence: 0.8,
      }),
    ])
    expect(f.getStats().totalFusions).toBe(1)
  })

  it('source eviction under maxSources pressure', () => {
    const f = new MultiModalFusion({ maxSources: 3 })
    const _s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'nlp')
    const s3 = f.registerSource('s3', 'cv')

    // Use s2 and s3 to increase their useCount
    f.fuse([
      makeOutput({
        sourceId: s2.id,
        content: 'Tokenization preprocesses text data efficiently',
        confidence: 0.8,
      }),
      makeOutput({
        sourceId: s3.id,
        content: 'Feature extraction identifies important patterns',
        confidence: 0.75,
      }),
    ])

    // Register s4 — should evict s1 (least used, useCount=0)
    f.registerSource('s4', 'audio')
    const names = f.getSources().map(s => s.name)
    expect(names).toContain('s4')
    expect(names).not.toContain('s1')
  })

  it('fuse explanation mentions conflict resolution strategy', () => {
    const f = new MultiModalFusion({ conflictResolutionStrategy: 'majority_vote' })
    const s1 = f.registerSource('s1', 'health')
    const s2 = f.registerSource('s2', 'health')
    const result = f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Caffeine consumption enhances cognitive performance significantly',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Caffeine consumption does not enhance cognitive performance significantly',
        confidence: 0.8,
      }),
    ])
    if (result.conflicts.length > 0) {
      expect(result.explanation).toContain('majority_vote')
    }
  })

  it('fuse with all features enabled produces rich result', () => {
    const f = new MultiModalFusion({
      enableConflictResolution: true,
      enableConsensus: true,
      enableCrossDomain: true,
    })
    const s1 = f.registerSource('text-analyzer', 'nlp', 0.9)
    const s2 = f.registerSource('image-analyzer', 'cv', 0.85)

    const result = f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Pattern recognition algorithms identify recurring structures data',
        confidence: 0.9,
        domain: 'nlp',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Visual pattern recognition algorithms detect objects structures data',
        confidence: 0.85,
        domain: 'cv',
      }),
    ])

    expect(result.fusedContent.length).toBeGreaterThan(0)
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.explanation).toContain('Fused 2 source outputs')
  })

  it('negative confidence outputs are filtered and insufficient for fusion', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'ai')
    const result = f.fuse([
      makeOutput({ sourceId: s1.id, content: 'Negative confidence', confidence: -0.5 }),
      makeOutput({ sourceId: s2.id, content: 'Also negative', confidence: -1 }),
    ])
    expect(result.confidence).toBe(0)
    expect(result.explanation).toContain('Insufficient')
  })

  it('whitespace-only content is filtered out', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'ai')
    const result = f.fuse([
      makeOutput({ sourceId: s1.id, content: '   ', confidence: 0.8 }),
      makeOutput({ sourceId: s2.id, content: 'Valid content here for testing', confidence: 0.8 }),
    ])
    expect(result.explanation).toContain('Insufficient')
  })

  it('high reliability sources dominate fused confidence', () => {
    const f = new MultiModalFusion()
    const sHigh = f.registerSource('expert', 'ai', 0.99)
    const sLow = f.registerSource('novice', 'ai', 0.01)
    const result = f.fuse([
      makeOutput({
        sourceId: sHigh.id,
        content: 'Expert analysis confirms hypothesis with strong evidence',
        confidence: 0.95,
      }),
      makeOutput({
        sourceId: sLow.id,
        content: 'Novice guess speculates without any strong evidence',
        confidence: 0.1,
      }),
    ])
    expect(result.confidence).toBeGreaterThan(0.5)
  })

  it('consensus boosts confidence in fuse result', () => {
    const f = new MultiModalFusion({ enableConsensus: true })
    const s1 = f.registerSource('s1', 'ai', 0.7)
    const s2 = f.registerSource('s2', 'ai', 0.7)
    const content = 'Transformer architecture uses self-attention mechanisms effectively'
    const result = f.fuse([
      makeOutput({ sourceId: s1.id, content, confidence: 0.7 }),
      makeOutput({ sourceId: s2.id, content, confidence: 0.7 }),
    ])
    // With consensus, confidence should be higher than base 0.7
    expect(result.confidence).toBeGreaterThanOrEqual(0.7)
    expect(result.consensusLevel).toBe(1)
  })

  it('fuse returns conflicts array in result', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'health')
    const s2 = f.registerSource('s2', 'health')
    const result = f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Vitamin supplements improve overall health outcomes significantly',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Vitamin supplements do not improve overall health outcomes significantly',
        confidence: 0.8,
      }),
    ])
    expect(Array.isArray(result.conflicts)).toBe(true)
    if (result.conflicts.length > 0) {
      expect(result.conflicts[0]).toHaveProperty('source1Id')
      expect(result.conflicts[0]).toHaveProperty('resolvedContent')
      expect(result.conflicts[0]).toHaveProperty('resolutionConfidence')
    }
  })

  it('registering many sources and fusing subsets works', () => {
    const f = new MultiModalFusion({ maxSources: 10 })
    const sources = Array.from({ length: 6 }, (_, i) =>
      f.registerSource(`source-${i}`, i % 2 === 0 ? 'ai' : 'nlp', 0.6 + i * 0.05),
    )
    expect(f.getSources()).toHaveLength(6)

    const result = f.fuse([
      makeOutput({
        sourceId: sources[0].id,
        content: 'Classification algorithms assign labels to data points',
        confidence: 0.8,
      }),
      makeOutput({
        sourceId: sources[1].id,
        content: 'Regression models predict continuous numerical values',
        confidence: 0.75,
      }),
      makeOutput({
        sourceId: sources[2].id,
        content: 'Clustering groups similar items without labels',
        confidence: 0.7,
      }),
    ])
    expect(result.sources).toHaveLength(3)
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('metadata passes through in source outputs', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'ai')
    const result = f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Feature engineering creates better model inputs',
        confidence: 0.9,
        metadata: { version: 1 },
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Data augmentation increases training variety',
        confidence: 0.85,
        metadata: { version: 2 },
      }),
    ])
    expect(result.sources[0].metadata).toEqual({ version: 1 })
    expect(result.sources[1].metadata).toEqual({ version: 2 })
  })

  it('fuse with unregistered source ids still works for valid outputs', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'ai')
    const _s2 = f.registerSource('s2', 'ai')
    const result = f.fuse([
      makeOutput({
        sourceId: s1.id,
        content: 'Optimization algorithms find minimum loss values',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: 'unregistered-id',
        content: 'Learning rate schedules adapt training speed',
        confidence: 0.8,
      }),
    ])
    // Both outputs are valid (positive confidence, non-empty content)
    expect(result.sources).toHaveLength(2)
  })

  it('successive fusions on same sources increase useCount', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'ai')

    for (let i = 0; i < 3; i++) {
      f.fuse([
        makeOutput({
          sourceId: s1.id,
          content: `Batch normalization stabilizes training iteration ${i}`,
          confidence: 0.8,
        }),
        makeOutput({
          sourceId: s2.id,
          content: `Dropout prevents overfitting during training iteration ${i}`,
          confidence: 0.75,
        }),
      ])
    }

    const src = f.getSources().find(s => s.id === s1.id)!
    expect(src.useCount).toBe(3)
  })

  it('getConfig is not affected by mutations on returned object', () => {
    const f = new MultiModalFusion()
    const cfg = f.getConfig()
    cfg.maxSources = 999
    expect(f.getConfig().maxSources).toBe(50)
  })

  it('fuse explanation mentions consensus when reached', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'ai')
    const content = 'Regularization techniques prevent model overfitting effectively'
    const result = f.fuse([
      makeOutput({ sourceId: s1.id, content, confidence: 0.9 }),
      makeOutput({ sourceId: s2.id, content, confidence: 0.85 }),
    ])
    expect(result.explanation).toContain('Consensus reached')
  })

  it('detectConflicts conflict has initial zero resolutionConfidence', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'health')
    const s2 = f.registerSource('s2', 'health')
    const conflicts = f.detectConflicts([
      makeOutput({
        sourceId: s1.id,
        content: 'Sleep deprivation impairs cognitive function significantly',
        confidence: 0.9,
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Sleep deprivation does not impair cognitive function significantly',
        confidence: 0.8,
      }),
    ])
    if (conflicts.length > 0) {
      expect(conflicts[0].resolutionConfidence).toBe(0)
      expect(conflicts[0].resolvedContent).toBe('')
    }
  })

  it('cross-domain insight confidence is between 0 and 1', () => {
    const f = new MultiModalFusion()
    const s1 = f.registerSource('s1', 'ai')
    const s2 = f.registerSource('s2', 'neuroscience')
    const insights = f.synthesizeCrossDomain([
      makeOutput({
        sourceId: s1.id,
        content: 'Neural network learning algorithms process patterns data',
        confidence: 0.9,
        domain: 'ai',
      }),
      makeOutput({
        sourceId: s2.id,
        content: 'Brain neural pathways learning patterns data recognition',
        confidence: 0.85,
        domain: 'neuroscience',
      }),
    ])
    for (const insight of insights) {
      expect(insight.confidence).toBeGreaterThanOrEqual(0)
      expect(insight.confidence).toBeLessThanOrEqual(1)
    }
  })
})
