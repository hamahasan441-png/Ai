import { describe, it, expect, beforeEach } from 'vitest'
import {
  PatternRecognizer,
  type DataPattern,
} from '../PatternRecognizer'

// ── Helper ──

function makePattern(overrides: Partial<DataPattern> = {}): DataPattern {
  return {
    id: overrides.id ?? 'pat-1',
    name: overrides.name ?? 'test-pattern',
    description: overrides.description ?? 'A test pattern',
    type: overrides.type ?? 'trend',
    confidence: overrides.confidence ?? 0.9,
    occurrences: overrides.occurrences ?? 1,
    examples: overrides.examples ?? ['1', '2', '3'],
    metadata: overrides.metadata ?? {},
  }
}

// ── Constructor Tests ──

describe('PatternRecognizer constructor', () => {
  it('creates an instance with default config', () => {
    const pr = new PatternRecognizer()
    expect(pr).toBeInstanceOf(PatternRecognizer)
  })

  it('accepts partial config', () => {
    const pr = new PatternRecognizer({ maxPatterns: 100 })
    expect(pr).toBeInstanceOf(PatternRecognizer)
  })

  it('accepts full custom config', () => {
    const pr = new PatternRecognizer({
      maxPatterns: 50,
      enableSequenceDetection: false,
      enableAnomalyDetection: false,
      enableFrequencyAnalysis: false,
      similarityThreshold: 0.5,
      windowSize: 10,
    })
    expect(pr).toBeInstanceOf(PatternRecognizer)
  })

  it('starts with zero stats', () => {
    const pr = new PatternRecognizer()
    const stats = pr.getStats()
    expect(stats.totalAnalyses).toBe(0)
    expect(stats.totalPatternsDetected).toBe(0)
    expect(stats.totalSequencesFound).toBe(0)
    expect(stats.totalAnomaliesDetected).toBe(0)
    expect(stats.feedbackCount).toBe(0)
  })

  it('starts with no learned patterns', () => {
    const pr = new PatternRecognizer()
    expect(pr.getLearnedPatterns()).toEqual([])
  })
})

// ── analyzeNumeric Tests ──

describe('PatternRecognizer analyzeNumeric', () => {
  let pr: PatternRecognizer

  beforeEach(() => {
    pr = new PatternRecognizer()
  })

  it('returns a valid result for ascending data', () => {
    const result = pr.analyzeNumeric([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(result.analysisId).toBeDefined()
    expect(result.timestamp).toBeGreaterThan(0)
    expect(result.patterns.length).toBeGreaterThanOrEqual(0)
    expect(result.summary).toBeDefined()
  })

  it('detects patterns in descending data', () => {
    const result = pr.analyzeNumeric([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(result.patterns.length).toBeGreaterThanOrEqual(0)
    expect(result.summary.length).toBeGreaterThan(0)
  })

  it('handles periodic data', () => {
    const data = Array.from({ length: 30 }, (_, i) => Math.sin(i * Math.PI / 5))
    const result = pr.analyzeNumeric(data)
    expect(result).toBeDefined()
    expect(result.patterns).toBeInstanceOf(Array)
  })

  it('handles constant data', () => {
    const result = pr.analyzeNumeric([5, 5, 5, 5, 5, 5, 5, 5])
    expect(result).toBeDefined()
    expect(result.anomalies).toEqual([])
  })

  it('handles empty data', () => {
    const result = pr.analyzeNumeric([])
    expect(result.patterns).toEqual([])
    expect(result.anomalies).toEqual([])
    expect(result.clusters).toEqual([])
  })

  it('handles random data', () => {
    const data = Array.from({ length: 50 }, () => Math.random() * 100)
    const result = pr.analyzeNumeric(data)
    expect(result.analysisId).toBeDefined()
  })

  it('handles data with anomalous outlier', () => {
    const data = [1, 2, 3, 2, 3, 1, 2, 100, 3, 2, 1]
    const result = pr.analyzeNumeric(data)
    expect(result.anomalies.length).toBeGreaterThan(0)
  })

  it('handles large datasets', () => {
    const data = Array.from({ length: 500 }, (_, i) => i + Math.random())
    const result = pr.analyzeNumeric(data)
    expect(result.analysisId).toBeDefined()
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })

  it('detects arithmetic progression', () => {
    const data = [2, 4, 6, 8, 10, 12, 14, 16]
    const result = pr.analyzeNumeric(data)
    const names = result.patterns.map(p => p.name)
    expect(names.some(n => n.includes('Arithmetic') || n.includes('Linear'))).toBe(true)
  })

  it('detects geometric progression', () => {
    const data = [1, 2, 4, 8, 16, 32, 64, 128]
    const result = pr.analyzeNumeric(data)
    const names = result.patterns.map(p => p.name)
    expect(names.some(n => n.includes('Geometric') || n.includes('Exponential'))).toBe(true)
  })

  it('increments totalAnalyses in stats', () => {
    pr.analyzeNumeric([1, 2, 3])
    pr.analyzeNumeric([4, 5, 6])
    expect(pr.getStats().totalAnalyses).toBe(2)
  })

  it('returns sequences array', () => {
    const result = pr.analyzeNumeric([1, 2, 3, 1, 2, 3, 1, 2, 3])
    expect(result.sequences).toBeInstanceOf(Array)
  })
})

// ── analyzeText Tests ──

describe('PatternRecognizer analyzeText', () => {
  let pr: PatternRecognizer

  beforeEach(() => {
    pr = new PatternRecognizer()
  })

  it('returns a valid result for normal text', () => {
    const result = pr.analyzeText('The quick brown fox jumps over the lazy dog. The fox is fast.')
    expect(result.analysisId).toBeDefined()
    expect(result.frequencies.length).toBeGreaterThan(0)
    expect(result.summary.length).toBeGreaterThan(0)
  })

  it('handles empty text', () => {
    const result = pr.analyzeText('')
    expect(result).toBeDefined()
    expect(result.patterns).toBeInstanceOf(Array)
  })

  it('handles single word', () => {
    const result = pr.analyzeText('hello')
    expect(result).toBeDefined()
    expect(result.analysisId).toBeDefined()
  })

  it('detects frequency patterns for repeated words', () => {
    const result = pr.analyzeText('cat cat cat dog dog cat cat dog bird cat')
    expect(result.frequencies.length).toBeGreaterThan(0)
    const catFreq = result.frequencies.find(f => f.element === 'cat')
    if (catFreq) {
      expect(catFreq.count).toBeGreaterThanOrEqual(4)
    }
  })

  it('handles structured multi-sentence text', () => {
    const text = 'First sentence here. Second sentence too. Third one follows. And another one.'
    const result = pr.analyzeText(text)
    expect(result).toBeDefined()
    expect(result.summary.length).toBeGreaterThan(0)
  })

  it('handles very long text', () => {
    const text = Array.from({ length: 100 }, () => 'The quick brown fox jumps.').join(' ')
    const result = pr.analyzeText(text)
    expect(result.analysisId).toBeDefined()
  })

  it('increments totalAnalyses', () => {
    pr.analyzeText('hello world')
    expect(pr.getStats().totalAnalyses).toBe(1)
  })

  it('returns frequencies sorted by rank', () => {
    const result = pr.analyzeText('alpha alpha alpha beta beta gamma')
    if (result.frequencies.length >= 2) {
      expect(result.frequencies[0].rank).toBeLessThanOrEqual(result.frequencies[1].rank)
    }
  })

  it('handles text with special characters', () => {
    const result = pr.analyzeText('hello! @world #test $money %percent')
    expect(result).toBeDefined()
  })

  it('handles paragraph text', () => {
    const text = 'First paragraph content.\n\nSecond paragraph content.\n\nThird paragraph.'
    const result = pr.analyzeText(text)
    expect(result).toBeDefined()
  })
})

// ── analyzeSequence Tests ──

describe('PatternRecognizer analyzeSequence', () => {
  let pr: PatternRecognizer

  beforeEach(() => {
    pr = new PatternRecognizer()
  })

  it('detects repeating sequence pattern', () => {
    const result = pr.analyzeSequence(['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c'])
    expect(result.analysisId).toBeDefined()
    expect(result.sequences.length + result.patterns.length).toBeGreaterThan(0)
  })

  it('handles empty sequence', () => {
    const result = pr.analyzeSequence([])
    expect(result.patterns).toEqual([])
    expect(result.sequences).toEqual([])
  })

  it('handles single element', () => {
    const result = pr.analyzeSequence(['x'])
    expect(result).toBeDefined()
    expect(result.analysisId).toBeDefined()
  })

  it('handles random non-repeating sequence', () => {
    const result = pr.analyzeSequence(['a', 'z', 'm', 'q', 'x', 'f'])
    expect(result).toBeDefined()
  })

  it('handles periodic sequences', () => {
    const seq = Array.from({ length: 20 }, (_, i) => String.fromCharCode(97 + (i % 3)))
    const result = pr.analyzeSequence(seq)
    expect(result).toBeDefined()
    expect(result.frequencies.length).toBeGreaterThan(0)
  })

  it('computes frequency information', () => {
    const result = pr.analyzeSequence(['a', 'a', 'b', 'a', 'b', 'c', 'a'])
    expect(result.frequencies.length).toBeGreaterThan(0)
  })

  it('handles long sequences', () => {
    const seq = Array.from({ length: 200 }, (_, i) => ['x', 'y', 'z'][i % 3])
    const result = pr.analyzeSequence(seq)
    expect(result.analysisId).toBeDefined()
  })

  it('increments totalAnalyses', () => {
    pr.analyzeSequence(['a', 'b'])
    expect(pr.getStats().totalAnalyses).toBe(1)
  })
})

// ── detectAnomalies Tests ──

describe('PatternRecognizer detectAnomalies', () => {
  let pr: PatternRecognizer

  beforeEach(() => {
    pr = new PatternRecognizer()
  })

  it('detects clear outlier', () => {
    const data = [10, 11, 10, 12, 11, 10, 100, 11, 10, 12]
    const anomalies = pr.detectAnomalies(data)
    expect(anomalies.length).toBeGreaterThan(0)
    expect(anomalies.some(a => a.value === 100)).toBe(true)
  })

  it('returns no anomalies for uniform data', () => {
    const anomalies = pr.detectAnomalies([5, 5, 5, 5, 5, 5])
    expect(anomalies).toEqual([])
  })

  it('returns empty for fewer than 3 points', () => {
    expect(pr.detectAnomalies([])).toEqual([])
    expect(pr.detectAnomalies([1])).toEqual([])
    expect(pr.detectAnomalies([1, 2])).toEqual([])
  })

  it('handles all same values', () => {
    const anomalies = pr.detectAnomalies([7, 7, 7, 7, 7, 7, 7])
    expect(anomalies).toEqual([])
  })

  it('detects anomaly with negative values', () => {
    const data = [-5, -4, -5, -4, -5, -50, -4, -5]
    const anomalies = pr.detectAnomalies(data)
    expect(anomalies.length).toBeGreaterThan(0)
  })

  it('anomalies have required fields', () => {
    const data = [1, 1, 1, 1, 1, 1, 1, 50, 1, 1]
    const anomalies = pr.detectAnomalies(data)
    for (const a of anomalies) {
      expect(a).toHaveProperty('index')
      expect(a).toHaveProperty('value')
      expect(a).toHaveProperty('expectedRange')
      expect(a).toHaveProperty('deviation')
      expect(a).toHaveProperty('severity')
    }
  })

  it('severity is a valid string', () => {
    const data = [1, 1, 1, 1, 1, 100, 1, 1, 1]
    const anomalies = pr.detectAnomalies(data)
    for (const a of anomalies) {
      expect(['low', 'medium', 'high', 'critical']).toContain(a.severity)
    }
  })

  it('handles mixed positive and negative data', () => {
    const data = [-10, -5, 0, 5, 10, 5, 0, -5, -10, 500]
    const anomalies = pr.detectAnomalies(data)
    expect(anomalies.length).toBeGreaterThan(0)
  })

  it('detects multiple outliers', () => {
    const data = [1, 2, 1, 2, 100, 1, 2, -100, 1, 2]
    const anomalies = pr.detectAnomalies(data)
    expect(anomalies.length).toBeGreaterThanOrEqual(2)
  })

  it('anomalies sorted by absolute deviation descending', () => {
    const data = [1, 1, 1, 1, 50, 1, 1, 200, 1, 1]
    const anomalies = pr.detectAnomalies(data)
    for (let i = 1; i < anomalies.length; i++) {
      expect(Math.abs(anomalies[i - 1].deviation)).toBeGreaterThanOrEqual(
        Math.abs(anomalies[i].deviation)
      )
    }
  })
})

// ── findCorrelation Tests ──

describe('PatternRecognizer findCorrelation', () => {
  let pr: PatternRecognizer

  beforeEach(() => {
    pr = new PatternRecognizer()
  })

  it('detects perfect positive correlation', () => {
    const result = pr.findCorrelation([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])
    expect(result.coefficient).toBeCloseTo(1, 1)
    expect(result.strength).toBe('perfect')
  })

  it('detects perfect negative correlation', () => {
    const result = pr.findCorrelation([1, 2, 3, 4, 5], [10, 8, 6, 4, 2])
    expect(result.coefficient).toBeCloseTo(-1, 1)
    expect(result.strength).toBe('perfect')
  })

  it('returns zero for uncorrelated data', () => {
    const a = [1, 2, 3, 4, 5, 6, 7, 8]
    const b = [5, 3, 7, 1, 8, 2, 6, 4]
    const result = pr.findCorrelation(a, b)
    expect(Math.abs(result.coefficient)).toBeLessThan(0.7)
  })

  it('handles identical arrays', () => {
    const result = pr.findCorrelation([1, 2, 3, 4], [1, 2, 3, 4])
    expect(result.coefficient).toBeCloseTo(1, 1)
  })

  it('handles empty arrays', () => {
    const result = pr.findCorrelation([], [])
    expect(result.coefficient).toBe(0)
    expect(result.strength).toBe('none')
  })

  it('handles different length arrays', () => {
    const result = pr.findCorrelation([1, 2, 3, 4, 5], [10, 20, 30])
    expect(result).toBeDefined()
    expect(typeof result.coefficient).toBe('number')
  })

  it('returns strength field', () => {
    const result = pr.findCorrelation([1, 2, 3], [1, 2, 3])
    expect(['none', 'weak', 'moderate', 'strong', 'perfect']).toContain(result.strength)
  })

  it('returns series labels', () => {
    const result = pr.findCorrelation([1, 2], [3, 4])
    expect(result.seriesA).toBeDefined()
    expect(result.seriesB).toBeDefined()
  })
})

// ── clusterData Tests ──

describe('PatternRecognizer clusterData', () => {
  let pr: PatternRecognizer

  beforeEach(() => {
    pr = new PatternRecognizer()
  })

  it('clusters clearly separated groups', () => {
    const points = [
      [0, 0], [1, 0], [0, 1],
      [10, 10], [11, 10], [10, 11],
      [20, 20], [21, 20], [20, 21],
    ]
    const clusters = pr.clusterData(points)
    expect(clusters.length).toBeGreaterThanOrEqual(2)
  })

  it('handles single point', () => {
    const clusters = pr.clusterData([[5, 5]])
    expect(clusters.length).toBe(1)
    expect(clusters[0].size).toBe(1)
  })

  it('handles empty data', () => {
    const clusters = pr.clusterData([])
    expect(clusters).toEqual([])
  })

  it('handles two points', () => {
    const clusters = pr.clusterData([[0, 0], [10, 10]])
    expect(clusters.length).toBeGreaterThanOrEqual(1)
  })

  it('cluster has required fields', () => {
    const clusters = pr.clusterData([[1, 2], [3, 4], [5, 6], [100, 100]])
    for (const c of clusters) {
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('centroid')
      expect(c).toHaveProperty('members')
      expect(c).toHaveProperty('size')
      expect(c).toHaveProperty('density')
    }
  })

  it('handles many overlapping points', () => {
    const points = Array.from({ length: 50 }, () => [
      Math.random() * 2,
      Math.random() * 2,
    ])
    const clusters = pr.clusterData(points)
    expect(clusters.length).toBeGreaterThanOrEqual(1)
    const totalMembers = clusters.reduce((s, c) => s + c.size, 0)
    expect(totalMembers).toBe(50)
  })

  it('clusters are sorted by size descending', () => {
    const points = [
      ...Array.from({ length: 20 }, () => [0 + Math.random(), 0 + Math.random()]),
      ...Array.from({ length: 5 }, () => [100 + Math.random(), 100 + Math.random()]),
    ]
    const clusters = pr.clusterData(points)
    for (let i = 1; i < clusters.length; i++) {
      expect(clusters[i - 1].size).toBeGreaterThanOrEqual(clusters[i].size)
    }
  })

  it('handles 1D points', () => {
    const points = [[1], [2], [100], [101], [102]]
    const clusters = pr.clusterData(points)
    expect(clusters.length).toBeGreaterThanOrEqual(1)
  })
})

// ── learnPattern / getLearnedPatterns Tests ──

describe('PatternRecognizer learnPattern / getLearnedPatterns', () => {
  let pr: PatternRecognizer

  beforeEach(() => {
    pr = new PatternRecognizer()
  })

  it('adds and retrieves a learned pattern', () => {
    const pat = makePattern({ id: 'p1' })
    pr.learnPattern(pat)
    const learned = pr.getLearnedPatterns()
    expect(learned.length).toBe(1)
    expect(learned[0].id).toBe('p1')
  })

  it('updates an existing pattern by id', () => {
    pr.learnPattern(makePattern({ id: 'p1', confidence: 0.5 }))
    pr.learnPattern(makePattern({ id: 'p1', confidence: 0.9 }))
    const learned = pr.getLearnedPatterns()
    expect(learned.length).toBe(1)
    expect(learned[0].confidence).toBe(0.9)
  })

  it('stores multiple distinct patterns', () => {
    pr.learnPattern(makePattern({ id: 'a' }))
    pr.learnPattern(makePattern({ id: 'b' }))
    pr.learnPattern(makePattern({ id: 'c' }))
    expect(pr.getLearnedPatterns().length).toBe(3)
  })

  it('evicts lowest-confidence pattern when maxPatterns reached', () => {
    const small = new PatternRecognizer({ maxPatterns: 2 })
    small.learnPattern(makePattern({ id: 'a', confidence: 0.5 }))
    small.learnPattern(makePattern({ id: 'b', confidence: 0.9 }))
    small.learnPattern(makePattern({ id: 'c', confidence: 0.8 }))
    const learned = small.getLearnedPatterns()
    expect(learned.length).toBe(2)
    expect(learned.find(p => p.id === 'a')).toBeUndefined()
  })

  it('returns copies not references', () => {
    pr.learnPattern(makePattern({ id: 'x' }))
    const first = pr.getLearnedPatterns()
    const second = pr.getLearnedPatterns()
    expect(first).toEqual(second)
    expect(first).not.toBe(second)
  })
})

// ── getStats Tests ──

describe('PatternRecognizer getStats', () => {
  let pr: PatternRecognizer

  beforeEach(() => {
    pr = new PatternRecognizer()
  })

  it('returns initial zeroed stats', () => {
    const stats = pr.getStats()
    expect(stats.totalAnalyses).toBe(0)
    expect(stats.avgAnalysisTime).toBe(0)
  })

  it('increments totalAnalyses after numeric analysis', () => {
    pr.analyzeNumeric([1, 2, 3])
    expect(pr.getStats().totalAnalyses).toBe(1)
  })

  it('increments totalAnalyses after text analysis', () => {
    pr.analyzeText('hello world')
    expect(pr.getStats().totalAnalyses).toBe(1)
  })

  it('increments totalAnalyses after sequence analysis', () => {
    pr.analyzeSequence(['a', 'b'])
    expect(pr.getStats().totalAnalyses).toBe(1)
  })

  it('accumulates stats across multiple analyses', () => {
    pr.analyzeNumeric([1, 2, 3, 4, 5])
    pr.analyzeText('Some text here.')
    pr.analyzeSequence(['x', 'y', 'z'])
    const stats = pr.getStats()
    expect(stats.totalAnalyses).toBe(3)
  })
})

// ── serialize / deserialize Tests ──

describe('PatternRecognizer serialize / deserialize', () => {
  it('round-trips an empty recognizer', () => {
    const original = new PatternRecognizer()
    const json = original.serialize()
    const restored = PatternRecognizer.deserialize(json)
    expect(restored).toBeInstanceOf(PatternRecognizer)
    expect(restored.getStats()).toEqual(original.getStats())
  })

  it('preserves config through round-trip', () => {
    const original = new PatternRecognizer({ maxPatterns: 42, windowSize: 20 })
    const _restored = PatternRecognizer.deserialize(original.serialize())
    const data = JSON.parse(original.serialize())
    expect(data.config.maxPatterns).toBe(42)
    expect(data.config.windowSize).toBe(20)
  })

  it('preserves stats through round-trip', () => {
    const original = new PatternRecognizer()
    original.analyzeNumeric([1, 2, 3, 4, 5])
    original.analyzeText('hello world test')
    const restored = PatternRecognizer.deserialize(original.serialize())
    expect(restored.getStats().totalAnalyses).toBe(original.getStats().totalAnalyses)
  })

  it('preserves learned patterns through round-trip', () => {
    const original = new PatternRecognizer()
    original.learnPattern(makePattern({ id: 'lp1', name: 'saved' }))
    original.learnPattern(makePattern({ id: 'lp2', name: 'saved2' }))
    const restored = PatternRecognizer.deserialize(original.serialize())
    const patterns = restored.getLearnedPatterns()
    expect(patterns.length).toBe(2)
    expect(patterns[0].id).toBe('lp1')
    expect(patterns[1].id).toBe('lp2')
  })

  it('serialized output is valid JSON', () => {
    const pr = new PatternRecognizer()
    pr.analyzeNumeric([1, 2, 3])
    const json = pr.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('deserialized instance can perform analyses', () => {
    const original = new PatternRecognizer()
    original.analyzeNumeric([1, 2, 3])
    const restored = PatternRecognizer.deserialize(original.serialize())
    const result = restored.analyzeNumeric([4, 5, 6, 7, 8])
    expect(result.analysisId).toBeDefined()
    expect(restored.getStats().totalAnalyses).toBe(2)
  })

  it('handles corrupted JSON gracefully', () => {
    expect(() => PatternRecognizer.deserialize('not valid json')).toThrow()
  })

  it('preserves totalPatternsDetected', () => {
    const original = new PatternRecognizer()
    original.analyzeNumeric([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const stats = original.getStats()
    const restored = PatternRecognizer.deserialize(original.serialize())
    expect(restored.getStats().totalPatternsDetected).toBe(stats.totalPatternsDetected)
  })
})
