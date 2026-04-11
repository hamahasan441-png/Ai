/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🔬  P A T T E R N   R E C O G N I Z E R                            ║
 * ║                                                                             ║
 * ║   Phase 7 "Understanding" intelligence module for pattern recognition:       ║
 * ║     detect → classify → correlate → predict                                 ║
 * ║                                                                             ║
 * ║     • Numeric trend detection and periodicity analysis                      ║
 * ║     • Text structure and frequency analysis                                 ║
 * ║     • Sequence pattern recognition with repeating motifs                    ║
 * ║     • Statistical anomaly detection via z-scores                            ║
 * ║     • Pearson correlation analysis                                          ║
 * ║     • K-means clustering implementation                                     ║
 * ║     • Learnable pattern database for continuous improvement                 ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface PatternRecognizerConfig {
  maxPatterns: number
  enableSequenceDetection: boolean
  enableAnomalyDetection: boolean
  enableFrequencyAnalysis: boolean
  similarityThreshold: number
  windowSize: number
}

export interface PatternRecognizerStats {
  totalAnalyses: number
  totalPatternsDetected: number
  totalSequencesFound: number
  totalAnomaliesDetected: number
  avgAnalysisTime: number
  feedbackCount: number
}

export type PatternType =
  | 'sequential'
  | 'cyclical'
  | 'hierarchical'
  | 'structural'
  | 'temporal'
  | 'frequency'
  | 'anomaly'
  | 'correlation'
  | 'trend'
  | 'cluster'

export interface DataPattern {
  id: string
  name: string
  description: string
  type: PatternType
  confidence: number
  occurrences: number
  examples: string[]
  metadata: Record<string, unknown>
}

export interface SequenceInfo {
  elements: string[]
  period: number
  confidence: number
  direction: 'ascending' | 'descending' | 'stable' | 'oscillating'
}

export interface AnomalyInfo {
  index: number
  value: number
  expectedRange: { min: number; max: number }
  deviation: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface FrequencyInfo {
  element: string
  count: number
  frequency: number
  rank: number
}

export interface CorrelationInfo {
  seriesA: string
  seriesB: string
  coefficient: number
  strength: 'none' | 'weak' | 'moderate' | 'strong' | 'perfect'
}

export interface ClusterInfo {
  id: number
  centroid: number[]
  members: number[][]
  size: number
  density: number
}

export interface PatternAnalysisResult {
  analysisId: string
  timestamp: number
  duration: number
  patterns: DataPattern[]
  sequences: SequenceInfo[]
  anomalies: AnomalyInfo[]
  frequencies: FrequencyInfo[]
  correlations: CorrelationInfo[]
  clusters: ClusterInfo[]
  summary: string
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: PatternRecognizerConfig = {
  maxPatterns: 500,
  enableSequenceDetection: true,
  enableAnomalyDetection: true,
  enableFrequencyAnalysis: true,
  similarityThreshold: 0.75,
  windowSize: 50,
}

// ── Helper Functions ─────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ── Statistical Utilities ────────────────────────────────────────────────────

function mean(data: number[]): number {
  if (data.length === 0) return 0
  return data.reduce((sum, v) => sum + v, 0) / data.length
}

function variance(data: number[]): number {
  if (data.length < 2) return 0
  const m = mean(data)
  return data.reduce((sum, v) => sum + (v - m) ** 2, 0) / (data.length - 1)
}

function stddev(data: number[]): number {
  return Math.sqrt(variance(data))
}

function median(data: number[]): number {
  if (data.length === 0) return 0
  const sorted = [...data].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function percentile(data: number[], p: number): number {
  if (data.length === 0) return 0
  const sorted = [...data].sort((a, b) => a - b)
  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

function zScore(value: number, m: number, sd: number): number {
  if (sd === 0) return 0
  return (value - m) / sd
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n < 2) return 0
  const mx = mean(x.slice(0, n))
  const my = mean(y.slice(0, n))
  let num = 0
  let denomX = 0
  let denomY = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx
    const dy = y[i] - my
    num += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }
  const denom = Math.sqrt(denomX * denomY)
  if (denom === 0) return 0
  return clamp(num / denom, -1, 1)
}

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    sum += (a[i] - b[i]) ** 2
  }
  return Math.sqrt(sum)
}

function linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
  const n = data.length
  if (n < 2) return { slope: 0, intercept: data[0] ?? 0, r2: 0 }
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0
  let sumYY = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += data[i]
    sumXY += i * data[i]
    sumXX += i * i
    sumYY += data[i] * data[i]
  }
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: mean(data), r2: 0 }
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  const ssTot = sumYY - (sumY * sumY) / n
  const ssRes = data.reduce((s, y, i) => {
    const pred = slope * i + intercept
    return s + (y - pred) ** 2
  }, 0)
  const r2 = ssTot === 0 ? 1 : clamp(1 - ssRes / ssTot, 0, 1)
  return { slope: round2(slope), intercept: round2(intercept), r2: round2(r2) }
}

function autoCorrelation(data: number[], lag: number): number {
  const n = data.length
  if (n < lag + 2) return 0
  const m = mean(data)
  let num = 0
  let denom = 0
  for (let i = 0; i < n; i++) {
    denom += (data[i] - m) ** 2
    if (i + lag < n) {
      num += (data[i] - m) * (data[i + lag] - m)
    }
  }
  if (denom === 0) return 0
  return num / denom
}

function _movingAverage(data: number[], window: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2))
    const end = Math.min(data.length, i + Math.ceil(window / 2))
    const slice = data.slice(start, end)
    result.push(mean(slice))
  }
  return result
}

function entropy(frequencies: number[]): number {
  const total = frequencies.reduce((s, v) => s + v, 0)
  if (total === 0) return 0
  let ent = 0
  for (const f of frequencies) {
    if (f > 0) {
      const p = f / total
      ent -= p * Math.log2(p)
    }
  }
  return ent
}

// ── Trend Detection ──────────────────────────────────────────────────────────

function detectTrendDirection(
  data: number[],
): 'ascending' | 'descending' | 'stable' | 'oscillating' {
  if (data.length < 2) return 'stable'
  const reg = linearRegression(data)
  const range = Math.max(...data) - Math.min(...data)

  if (range === 0) return 'stable'
  const normalizedSlope = Math.abs(reg.slope) / (range / data.length)

  if (normalizedSlope < 0.1) {
    let dirChanges = 0
    for (let i = 2; i < data.length; i++) {
      const prev = data[i - 1] - data[i - 2]
      const curr = data[i] - data[i - 1]
      if ((prev > 0 && curr < 0) || (prev < 0 && curr > 0)) dirChanges++
    }
    const changeRate = dirChanges / (data.length - 2)
    return changeRate > 0.4 ? 'oscillating' : 'stable'
  }
  return reg.slope > 0 ? 'ascending' : 'descending'
}

function detectPeriodicity(data: number[]): { period: number; confidence: number } | null {
  if (data.length < 6) return null
  const maxLag = Math.floor(data.length / 2)
  let bestLag = 0
  let bestCorr = 0
  for (let lag = 2; lag <= maxLag; lag++) {
    const corr = autoCorrelation(data, lag)
    if (corr > bestCorr) {
      bestCorr = corr
      bestLag = lag
    }
  }
  if (bestCorr > 0.3 && bestLag > 0) {
    return { period: bestLag, confidence: round2(bestCorr) }
  }
  return null
}

function detectChangePoints(data: number[], windowSize: number): number[] {
  const points: number[] = []
  if (data.length < windowSize * 2) return points
  for (let i = windowSize; i < data.length - windowSize; i++) {
    const leftMean = mean(data.slice(i - windowSize, i))
    const rightMean = mean(data.slice(i, i + windowSize))
    const leftStd = stddev(data.slice(i - windowSize, i))
    const pooledStd = leftStd === 0 ? 1 : leftStd
    const diff = Math.abs(rightMean - leftMean) / pooledStd
    if (diff > 2.0) {
      if (points.length === 0 || i - points[points.length - 1] >= windowSize) {
        points.push(i)
      }
    }
  }
  return points
}

// ── Text Analysis Utilities ──────────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0)
}

function nGrams(tokens: string[], n: number): string[] {
  const grams: string[] = []
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.push(tokens.slice(i, i + n).join(' '))
  }
  return grams
}

function countFrequencies(items: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const item of items) {
    freq.set(item, (freq.get(item) ?? 0) + 1)
  }
  return freq
}

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'is',
  'it',
  'as',
  'be',
  'was',
  'are',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'shall',
  'can',
  'this',
  'that',
  'these',
  'those',
  'i',
  'you',
  'he',
  'she',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',
  'what',
  'which',
  'who',
  'whom',
  'where',
  'when',
  'why',
  'how',
  'not',
  'no',
  'nor',
  'if',
  'then',
  'else',
  'so',
  'up',
  'out',
  'just',
  'also',
  'than',
  'too',
  'very',
  'only',
  'about',
  'into',
  'over',
  'after',
  'before',
  'between',
  'under',
  'above',
  'such',
  'each',
  'all',
  'both',
  'through',
  'during',
  'here',
  'there',
  'more',
  'some',
  'any',
  'most',
  'other',
  'own',
  'same',
  'few',
  'much',
  'many',
  'well',
])

function filterStopWords(tokens: string[]): string[] {
  return tokens.filter(t => !STOP_WORDS.has(t) && t.length > 1)
}

function detectTextStructure(text: string): {
  sentenceCount: number
  avgSentenceLength: number
  paragraphCount: number
  avgParagraphLength: number
  vocabularyRichness: number
} {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  const tokens = tokenize(text)
  const uniqueTokens = new Set(tokens)
  const vocabularyRichness = tokens.length > 0 ? uniqueTokens.size / tokens.length : 0
  return {
    sentenceCount: sentences.length,
    avgSentenceLength: sentences.length > 0 ? round2(tokens.length / sentences.length) : 0,
    paragraphCount: paragraphs.length,
    avgParagraphLength: paragraphs.length > 0 ? round2(sentences.length / paragraphs.length) : 0,
    vocabularyRichness: round2(vocabularyRichness),
  }
}

// ── Sequence Detection ───────────────────────────────────────────────────────

function findRepeatingSubsequences(
  sequence: string[],
  minLen: number,
  maxLen: number,
): Array<{ subsequence: string[]; positions: number[]; period: number }> {
  const results: Array<{ subsequence: string[]; positions: number[]; period: number }> = []
  const seen = new Set<string>()

  for (let len = minLen; len <= Math.min(maxLen, Math.floor(sequence.length / 2)); len++) {
    for (let start = 0; start <= sequence.length - len * 2; start++) {
      const subseq = sequence.slice(start, start + len)
      const key = subseq.join('|')
      if (seen.has(key)) continue
      seen.add(key)

      const positions: number[] = [start]
      for (let j = start + 1; j <= sequence.length - len; j++) {
        let match = true
        for (let k = 0; k < len; k++) {
          if (sequence[j + k] !== subseq[k]) {
            match = false
            break
          }
        }
        if (match) positions.push(j)
      }
      if (positions.length >= 2) {
        const gaps = []
        for (let g = 1; g < positions.length; g++) {
          gaps.push(positions[g] - positions[g - 1])
        }
        const avgPeriod = mean(gaps)
        results.push({ subsequence: subseq, positions, period: round2(avgPeriod) })
      }
    }
  }

  results.sort((a, b) => b.positions.length - a.positions.length)
  return results.slice(0, 20)
}

function detectNumericSequenceType(
  data: number[],
): Array<{ name: string; confidence: number; description: string }> {
  const results: Array<{ name: string; confidence: number; description: string }> = []
  if (data.length < 3) return results

  // Arithmetic progression check
  const diffs: number[] = []
  for (let i = 1; i < data.length; i++) {
    diffs.push(round2(data[i] - data[i - 1]))
  }
  const diffStd = stddev(diffs)
  const diffMean = mean(diffs)
  if (diffStd < Math.abs(diffMean) * 0.1 + 0.01) {
    results.push({
      name: 'Arithmetic Progression',
      confidence: round2(clamp(1 - diffStd / (Math.abs(diffMean) + 0.001), 0, 1)),
      description: `Common difference ≈ ${round2(diffMean)}`,
    })
  }

  // Geometric progression check
  if (data.every(v => v !== 0)) {
    const ratios: number[] = []
    for (let i = 1; i < data.length; i++) {
      ratios.push(data[i] / data[i - 1])
    }
    const ratioStd = stddev(ratios)
    const ratioMean = mean(ratios)
    if (ratioStd < Math.abs(ratioMean) * 0.1 + 0.01) {
      results.push({
        name: 'Geometric Progression',
        confidence: round2(clamp(1 - ratioStd / (Math.abs(ratioMean) + 0.001), 0, 1)),
        description: `Common ratio ≈ ${round2(ratioMean)}`,
      })
    }
  }

  // Fibonacci-like check
  if (data.length >= 5) {
    let fibMatches = 0
    for (let i = 2; i < data.length; i++) {
      const expected = data[i - 1] + data[i - 2]
      if (Math.abs(data[i] - expected) < Math.abs(expected) * 0.05 + 0.01) {
        fibMatches++
      }
    }
    const fibConf = fibMatches / (data.length - 2)
    if (fibConf > 0.7) {
      results.push({
        name: 'Fibonacci-like Sequence',
        confidence: round2(fibConf),
        description: `Each element ≈ sum of two preceding elements`,
      })
    }
  }

  // Power sequence check (squares, cubes)
  for (const power of [2, 3]) {
    let powerMatches = 0
    for (let i = 0; i < data.length; i++) {
      const expected = (i + 1) ** power
      if (Math.abs(data[i] - expected) < expected * 0.05 + 0.01) {
        powerMatches++
      }
    }
    const powerConf = powerMatches / data.length
    if (powerConf > 0.7) {
      results.push({
        name: power === 2 ? 'Square Numbers' : 'Cube Numbers',
        confidence: round2(powerConf),
        description: `Elements follow n^${power} pattern`,
      })
    }
  }

  // Triangular number check
  let triMatches = 0
  for (let i = 0; i < data.length; i++) {
    const n = i + 1
    const expected = (n * (n + 1)) / 2
    if (Math.abs(data[i] - expected) < expected * 0.05 + 0.01) {
      triMatches++
    }
  }
  const triConf = triMatches / data.length
  if (triConf > 0.7) {
    results.push({
      name: 'Triangular Numbers',
      confidence: round2(triConf),
      description: 'Elements follow n*(n+1)/2 pattern',
    })
  }

  // Prime-like check
  const isPrime = (num: number): boolean => {
    if (num < 2) return false
    if (num < 4) return true
    if (num % 2 === 0 || num % 3 === 0) return false
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false
    }
    return true
  }
  let primeMatches = 0
  for (const v of data) {
    if (Number.isInteger(v) && isPrime(v)) primeMatches++
  }
  const primeConf = primeMatches / data.length
  if (primeConf > 0.7) {
    results.push({
      name: 'Prime Numbers',
      confidence: round2(primeConf),
      description: 'Sequence consists of prime numbers',
    })
  }

  return results
}

// ── K-Means Clustering ───────────────────────────────────────────────────────

function initializeCentroids(points: number[][], k: number): number[][] {
  if (points.length === 0) return []
  const centroids: number[][] = []
  const used = new Set<number>()

  // K-means++ initialization
  const firstIdx = Math.floor(Math.random() * points.length)
  centroids.push([...points[firstIdx]])
  used.add(firstIdx)

  for (let c = 1; c < k; c++) {
    const distances: number[] = []
    for (let i = 0; i < points.length; i++) {
      if (used.has(i)) {
        distances.push(0)
        continue
      }
      let minDist = Infinity
      for (const centroid of centroids) {
        const dist = euclideanDistance(points[i], centroid)
        if (dist < minDist) minDist = dist
      }
      distances.push(minDist * minDist)
    }
    const totalDist = distances.reduce((s, d) => s + d, 0)
    if (totalDist === 0) break
    let threshold = Math.random() * totalDist
    for (let i = 0; i < distances.length; i++) {
      threshold -= distances[i]
      if (threshold <= 0 && !used.has(i)) {
        centroids.push([...points[i]])
        used.add(i)
        break
      }
    }
  }
  return centroids
}

function assignClusters(points: number[][], centroids: number[][]): number[] {
  return points.map(point => {
    let bestIdx = 0
    let bestDist = Infinity
    for (let c = 0; c < centroids.length; c++) {
      const dist = euclideanDistance(point, centroids[c])
      if (dist < bestDist) {
        bestDist = dist
        bestIdx = c
      }
    }
    return bestIdx
  })
}

function updateCentroids(
  points: number[][],
  assignments: number[],
  k: number,
  dims: number,
): number[][] {
  const centroids: number[][] = []
  for (let c = 0; c < k; c++) {
    const members = points.filter((_, i) => assignments[i] === c)
    if (members.length === 0) {
      centroids.push(new Array(dims).fill(0))
      continue
    }
    const centroid = new Array(dims).fill(0)
    for (const member of members) {
      for (let d = 0; d < dims; d++) {
        centroid[d] += member[d] ?? 0
      }
    }
    for (let d = 0; d < dims; d++) {
      centroid[d] /= members.length
    }
    centroids.push(centroid)
  }
  return centroids
}

function kMeansClustering(
  points: number[][],
  k: number,
  maxIterations: number = 100,
): { assignments: number[]; centroids: number[][] } {
  if (points.length === 0 || k <= 0) {
    return { assignments: [], centroids: [] }
  }
  const effectiveK = Math.min(k, points.length)
  const dims = Math.max(...points.map(p => p.length))
  let centroids = initializeCentroids(points, effectiveK)
  let assignments = assignClusters(points, centroids)

  for (let iter = 0; iter < maxIterations; iter++) {
    const newCentroids = updateCentroids(points, assignments, effectiveK, dims)
    const newAssignments = assignClusters(points, newCentroids)
    let changed = false
    for (let i = 0; i < assignments.length; i++) {
      if (assignments[i] !== newAssignments[i]) {
        changed = true
        break
      }
    }
    centroids = newCentroids
    assignments = newAssignments
    if (!changed) break
  }
  return { assignments, centroids }
}

function estimateK(points: number[][], maxK: number = 10): number {
  if (points.length <= 2) return 1
  const effectiveMax = Math.min(maxK, Math.floor(points.length / 2), points.length)
  if (effectiveMax <= 1) return 1
  const inertias: number[] = []

  for (let k = 1; k <= effectiveMax; k++) {
    const { assignments, centroids } = kMeansClustering(points, k, 50)
    let inertia = 0
    for (let i = 0; i < points.length; i++) {
      inertia += euclideanDistance(points[i], centroids[assignments[i]]) ** 2
    }
    inertias.push(inertia)
  }

  // Elbow method: find point of maximum curvature
  if (inertias.length < 3) return 1
  let bestK = 1
  let maxCurvature = 0
  for (let i = 1; i < inertias.length - 1; i++) {
    const curvature = inertias[i - 1] - inertias[i] - (inertias[i] - inertias[i + 1])
    if (curvature > maxCurvature) {
      maxCurvature = curvature
      bestK = i + 1
    }
  }
  return bestK
}

// ── Built-In Pattern Templates ───────────────────────────────────────────────

interface PatternTemplate {
  name: string
  type: PatternType
  detector: (data: number[]) => { detected: boolean; confidence: number; description: string }
}

function buildPatternTemplates(): PatternTemplate[] {
  return [
    {
      name: 'Linear Trend',
      type: 'trend',
      detector: (data: number[]) => {
        if (data.length < 3) return { detected: false, confidence: 0, description: '' }
        const reg = linearRegression(data)
        const detected = reg.r2 > 0.7
        return {
          detected,
          confidence: reg.r2,
          description: `Slope=${reg.slope}, R²=${reg.r2}`,
        }
      },
    },
    {
      name: 'Exponential Growth',
      type: 'trend',
      detector: (data: number[]) => {
        if (data.length < 4 || data.some(v => v <= 0)) {
          return { detected: false, confidence: 0, description: '' }
        }
        const logData = data.map(v => Math.log(v))
        const reg = linearRegression(logData)
        const detected = reg.r2 > 0.8 && reg.slope > 0
        return {
          detected,
          confidence: reg.r2,
          description: `Growth rate ≈ ${round2(Math.exp(reg.slope))}x per unit`,
        }
      },
    },
    {
      name: 'Exponential Decay',
      type: 'trend',
      detector: (data: number[]) => {
        if (data.length < 4 || data.some(v => v <= 0)) {
          return { detected: false, confidence: 0, description: '' }
        }
        const logData = data.map(v => Math.log(v))
        const reg = linearRegression(logData)
        const detected = reg.r2 > 0.8 && reg.slope < 0
        return {
          detected,
          confidence: reg.r2,
          description: `Decay rate ≈ ${round2(Math.exp(reg.slope))}x per unit`,
        }
      },
    },
    {
      name: 'Cyclical Pattern',
      type: 'cyclical',
      detector: (data: number[]) => {
        const period = detectPeriodicity(data)
        if (!period) return { detected: false, confidence: 0, description: '' }
        return {
          detected: true,
          confidence: period.confidence,
          description: `Period ≈ ${period.period} elements`,
        }
      },
    },
    {
      name: 'Constant Value',
      type: 'structural',
      detector: (data: number[]) => {
        if (data.length < 2) return { detected: false, confidence: 0, description: '' }
        const sd = stddev(data)
        const m = mean(data)
        const cv = m !== 0 ? sd / Math.abs(m) : sd
        const detected = cv < 0.01
        return {
          detected,
          confidence: round2(clamp(1 - cv * 10, 0, 1)),
          description: `Mean=${round2(m)}, CV=${round2(cv)}`,
        }
      },
    },
    {
      name: 'Step Function',
      type: 'structural',
      detector: (data: number[]) => {
        if (data.length < 6) return { detected: false, confidence: 0, description: '' }
        const changePoints = detectChangePoints(data, Math.max(3, Math.floor(data.length / 8)))
        if (changePoints.length === 0) {
          return { detected: false, confidence: 0, description: '' }
        }
        const segments: number[][] = []
        let start = 0
        for (const cp of changePoints) {
          segments.push(data.slice(start, cp))
          start = cp
        }
        segments.push(data.slice(start))
        const segStds = segments.filter(s => s.length > 1).map(s => stddev(s))
        const avgSegStd = mean(segStds)
        const totalStd = stddev(data)
        const ratio = totalStd > 0 ? avgSegStd / totalStd : 1
        const detected = ratio < 0.3 && changePoints.length <= 5
        return {
          detected,
          confidence: round2(clamp(1 - ratio, 0, 1)),
          description: `${changePoints.length} step(s) detected`,
        }
      },
    },
    {
      name: 'Gaussian Distribution',
      type: 'structural',
      detector: (data: number[]) => {
        if (data.length < 10) return { detected: false, confidence: 0, description: '' }
        const sorted = [...data].sort((a, b) => a - b)
        const m = mean(data)
        const sd = stddev(data)
        if (sd === 0) return { detected: false, confidence: 0, description: '' }
        let ksMax = 0
        for (let i = 0; i < sorted.length; i++) {
          const empirical = (i + 1) / sorted.length
          const z = (sorted[i] - m) / sd
          const theoretical = 0.5 * (1 + erf(z / Math.SQRT2))
          ksMax = Math.max(ksMax, Math.abs(empirical - theoretical))
        }
        const threshold = 1.36 / Math.sqrt(sorted.length)
        const detected = ksMax < threshold
        return {
          detected,
          confidence: round2(clamp(1 - ksMax / threshold, 0, 1)),
          description: `KS-stat=${round2(ksMax)}, μ=${round2(m)}, σ=${round2(sd)}`,
        }
      },
    },
    {
      name: 'Bimodal Distribution',
      type: 'cluster',
      detector: (data: number[]) => {
        if (data.length < 20) return { detected: false, confidence: 0, description: '' }
        const sorted = [...data].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        const q1 = median(sorted.slice(0, mid))
        const q3 = median(sorted.slice(mid))
        const m = mean(data)
        const sd = stddev(data)
        if (sd === 0) return { detected: false, confidence: 0, description: '' }
        const skewness = data.reduce((s, v) => s + ((v - m) / sd) ** 3, 0) / data.length
        const kurtosis = data.reduce((s, v) => s + ((v - m) / sd) ** 4, 0) / data.length - 3
        const detected = Math.abs(skewness) < 0.5 && kurtosis < -0.5
        return {
          detected,
          confidence: round2(clamp(0.5 - kurtosis / 4, 0, 1)),
          description: `Modes near ${round2(q1)} and ${round2(q3)}`,
        }
      },
    },
    {
      name: 'Seasonal Pattern',
      type: 'temporal',
      detector: (data: number[]) => {
        if (data.length < 12) return { detected: false, confidence: 0, description: '' }
        const candidates = [4, 7, 12, 24, 52]
        let bestPeriod = 0
        let bestCorr = 0
        for (const p of candidates) {
          if (p >= data.length / 2) continue
          const corr = autoCorrelation(data, p)
          if (corr > bestCorr) {
            bestCorr = corr
            bestPeriod = p
          }
        }
        const detected = bestCorr > 0.4
        return {
          detected,
          confidence: round2(bestCorr),
          description: `Seasonal period ≈ ${bestPeriod}`,
        }
      },
    },
    {
      name: 'Random Walk',
      type: 'sequential',
      detector: (data: number[]) => {
        if (data.length < 10) return { detected: false, confidence: 0, description: '' }
        const diffs: number[] = []
        for (let i = 1; i < data.length; i++) {
          diffs.push(data[i] - data[i - 1])
        }
        const diffMean = mean(diffs)
        const diffSd = stddev(diffs)
        const dataSd = stddev(data)
        const normalized = dataSd > 0 ? Math.abs(diffMean) / dataSd : 1
        const diffAutoCorr = Math.abs(autoCorrelation(diffs, 1))
        const detected = normalized < 0.1 && diffAutoCorr < 0.2
        return {
          detected,
          confidence: round2(clamp(1 - normalized - diffAutoCorr, 0, 1)),
          description: `Diff σ=${round2(diffSd)}, autocorr=${round2(diffAutoCorr)}`,
        }
      },
    },
  ]
}

// Error function approximation for Gaussian CDF
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1
  const a = Math.abs(x)
  const t = 1.0 / (1.0 + 0.3275911 * a)
  const y =
    1.0 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-a * a)
  return sign * y
}

// ── Built-In Text Pattern Knowledge ──────────────────────────────────────────

interface TextPatternDef {
  name: string
  type: PatternType
  detector: (
    tokens: string[],
    text: string,
  ) => { detected: boolean; confidence: number; description: string }
}

function buildTextPatternDefinitions(): TextPatternDef[] {
  return [
    {
      name: 'Repetitive Phrasing',
      type: 'frequency',
      detector: (tokens: string[]) => {
        const bigrams = nGrams(tokens, 2)
        const freq = countFrequencies(bigrams)
        const repeated = [...freq.entries()].filter(([, c]) => c >= 3)
        const detected = repeated.length > 0
        return {
          detected,
          confidence: detected ? round2(Math.min(repeated.length / 5, 1)) : 0,
          description: detected ? `${repeated.length} repeated phrase(s)` : '',
        }
      },
    },
    {
      name: 'Vocabulary Concentration',
      type: 'frequency',
      detector: (tokens: string[]) => {
        const filtered = filterStopWords(tokens)
        if (filtered.length < 10) return { detected: false, confidence: 0, description: '' }
        const freq = countFrequencies(filtered)
        const sorted = [...freq.values()].sort((a, b) => b - a)
        const top5Total = sorted.slice(0, 5).reduce((s, v) => s + v, 0)
        const ratio = top5Total / filtered.length
        const detected = ratio > 0.3
        return {
          detected,
          confidence: round2(clamp(ratio, 0, 1)),
          description: `Top 5 words = ${round2(ratio * 100)}% of content`,
        }
      },
    },
    {
      name: 'Hierarchical Structure',
      type: 'hierarchical',
      detector: (_tokens: string[], text: string) => {
        const lines = text.split('\n')
        let indentationLevels = 0
        const indents = new Set<number>()
        for (const line of lines) {
          const match = line.match(/^(\s+)/)
          if (match) indents.add(match[1].length)
        }
        indentationLevels = indents.size
        const bulletPoints = lines.filter(l => /^\s*[-*•]\s/.test(l)).length
        const numberedItems = lines.filter(l => /^\s*\d+[.)]\s/.test(l)).length
        const headings = lines.filter(l => /^#{1,6}\s/.test(l)).length
        const structureScore =
          indentationLevels +
          (bulletPoints > 2 ? 1 : 0) +
          (numberedItems > 2 ? 1 : 0) +
          (headings > 0 ? 1 : 0)
        const detected = structureScore >= 3
        return {
          detected,
          confidence: round2(clamp(structureScore / 6, 0, 1)),
          description: `${indentationLevels} indent levels, ${bulletPoints} bullets, ${headings} headings`,
        }
      },
    },
    {
      name: 'Code-like Content',
      type: 'structural',
      detector: (_tokens: string[], text: string) => {
        const indicators = [
          /[{}]/g,
          /[()]/g,
          /[[\]]/g,
          /=>/g,
          /;$/gm,
          /\bfunction\b/g,
          /\bconst\b|\blet\b|\bvar\b/g,
          /\bif\b.*\(/g,
          /\bfor\b.*\(/g,
          /\breturn\b/g,
          /\bclass\b/g,
          /\bimport\b/g,
        ]
        let score = 0
        for (const regex of indicators) {
          const matches = text.match(regex)
          if (matches && matches.length > 0) score++
        }
        const detected = score >= 5
        return {
          detected,
          confidence: round2(clamp(score / indicators.length, 0, 1)),
          description: `${score}/${indicators.length} code indicators found`,
        }
      },
    },
    {
      name: 'Formal/Academic Tone',
      type: 'structural',
      detector: (tokens: string[]) => {
        const formalWords = new Set([
          'therefore',
          'furthermore',
          'moreover',
          'consequently',
          'nevertheless',
          'notwithstanding',
          'whereas',
          'hereby',
          'henceforth',
          'thereby',
          'wherein',
          'thereof',
          'forthwith',
          'heretofore',
          'inasmuch',
          'pursuant',
          'accordingly',
          'hence',
          'thus',
          'regarding',
          'pertaining',
          'aforementioned',
          'subsequently',
          'preceding',
        ])
        let formalCount = 0
        for (const t of tokens) {
          if (formalWords.has(t)) formalCount++
        }
        const ratio = tokens.length > 0 ? formalCount / tokens.length : 0
        const detected = formalCount >= 2 && ratio > 0.01
        return {
          detected,
          confidence: round2(clamp(ratio * 50, 0, 1)),
          description: `${formalCount} formal indicators`,
        }
      },
    },
    {
      name: 'Question Pattern',
      type: 'structural',
      detector: (_tokens: string[], text: string) => {
        const questions = text.split(/[?]/).length - 1
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
        const ratio = sentences > 0 ? questions / sentences : 0
        const detected = questions >= 2 && ratio > 0.3
        return {
          detected,
          confidence: round2(clamp(ratio, 0, 1)),
          description: `${questions} questions in ${sentences} sentences`,
        }
      },
    },
    {
      name: 'List/Enumeration',
      type: 'sequential',
      detector: (_tokens: string[], text: string) => {
        const lines = text.split('\n')
        const bulletLines = lines.filter(l => /^\s*[-*•+]\s/.test(l)).length
        const numberedLines = lines.filter(l => /^\s*\d+[.)]\s/.test(l)).length
        const listLines = bulletLines + numberedLines
        const ratio = lines.length > 0 ? listLines / lines.length : 0
        const detected = listLines >= 3 && ratio > 0.2
        return {
          detected,
          confidence: round2(clamp(ratio, 0, 1)),
          description: `${listLines} list items (${bulletLines} bullets, ${numberedLines} numbered)`,
        }
      },
    },
    {
      name: 'Temporal References',
      type: 'temporal',
      detector: (tokens: string[]) => {
        const temporalWords = new Set([
          'yesterday',
          'today',
          'tomorrow',
          'morning',
          'evening',
          'night',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
          'january',
          'february',
          'march',
          'april',
          'may',
          'june',
          'july',
          'august',
          'september',
          'october',
          'november',
          'december',
          'daily',
          'weekly',
          'monthly',
          'yearly',
          'annually',
          'quarterly',
          'before',
          'after',
          'during',
          'since',
          'until',
          'ago',
          'later',
          'previously',
          'recently',
          'currently',
          'presently',
          'formerly',
        ])
        let count = 0
        for (const t of tokens) {
          if (temporalWords.has(t)) count++
        }
        const ratio = tokens.length > 0 ? count / tokens.length : 0
        const detected = count >= 3 && ratio > 0.02
        return {
          detected,
          confidence: round2(clamp(ratio * 20, 0, 1)),
          description: `${count} temporal references`,
        }
      },
    },
  ]
}

// ── Main Class ───────────────────────────────────────────────────────────────

export class PatternRecognizer {
  private readonly config: PatternRecognizerConfig
  private readonly patternTemplates: PatternTemplate[]
  private readonly textPatternDefs: TextPatternDef[]
  private readonly learnedPatterns: DataPattern[] = []
  private readonly analysisHistory: Array<{
    analysisId: string
    timestamp: number
    patternsFound: number
    duration: number
  }> = []
  private readonly feedbackLog: Array<{
    analysisId: string
    patternId: string
    isRelevant: boolean
  }> = []
  private totalAnalyses = 0
  private totalPatternsDetected = 0
  private totalSequencesFound = 0
  private totalAnomaliesDetected = 0
  private analysisTimesMs: number[] = []
  private feedbackCount = 0

  constructor(config?: Partial<PatternRecognizerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.patternTemplates = buildPatternTemplates()
    this.textPatternDefs = buildTextPatternDefinitions()
  }

  // ── Numeric Analysis ─────────────────────────────────────────────────────

  analyzeNumeric(data: number[]): PatternAnalysisResult {
    const startTime = Date.now()
    const analysisId = generateId('NUM')
    const patterns: DataPattern[] = []
    const sequences: SequenceInfo[] = []
    const anomalies: AnomalyInfo[] = []
    const frequencies: FrequencyInfo[] = []
    const clusters: ClusterInfo[] = []

    if (data.length === 0) {
      return this.finalizeResult(
        analysisId,
        startTime,
        patterns,
        sequences,
        anomalies,
        frequencies,
        [],
        clusters,
      )
    }

    // Run pattern templates
    for (const template of this.patternTemplates) {
      const result = template.detector(data)
      if (result.detected) {
        patterns.push({
          id: generateId('PAT'),
          name: template.name,
          description: result.description,
          type: template.type,
          confidence: result.confidence,
          occurrences: 1,
          examples: data.slice(0, 5).map(String),
          metadata: {},
        })
      }
    }

    // Detect numeric sequence types
    const seqTypes = detectNumericSequenceType(data)
    for (const st of seqTypes) {
      patterns.push({
        id: generateId('SEQ'),
        name: st.name,
        description: st.description,
        type: 'sequential',
        confidence: st.confidence,
        occurrences: 1,
        examples: data.slice(0, 5).map(String),
        metadata: {},
      })
    }

    // Sequence direction
    const direction = detectTrendDirection(data)
    const period = detectPeriodicity(data)
    if (period) {
      sequences.push({
        elements: data.slice(0, period.period).map(String),
        period: period.period,
        confidence: period.confidence,
        direction,
      })
    }

    // Anomaly detection
    if (this.config.enableAnomalyDetection) {
      const detected = this.detectAnomalies(data)
      anomalies.push(...detected)
    }

    // Frequency analysis
    if (this.config.enableFrequencyAnalysis) {
      const freq = countFrequencies(data.map(String))
      const total = data.length
      const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1])
      let rank = 1
      for (const [element, count] of sorted.slice(0, this.config.maxPatterns)) {
        frequencies.push({
          element,
          count,
          frequency: round2(count / total),
          rank: rank++,
        })
      }
    }

    // Clustering (convert to 1D points)
    if (data.length >= 4) {
      const points = data.map(v => [v])
      const clusterResults = this.clusterData(points)
      clusters.push(...clusterResults)
    }

    // Statistical summary patterns
    const m = mean(data)
    const sd = stddev(data)
    const med = median(data)
    const skew = sd > 0 ? data.reduce((s, v) => s + ((v - m) / sd) ** 3, 0) / data.length : 0

    if (Math.abs(skew) > 1) {
      patterns.push({
        id: generateId('SKEW'),
        name: skew > 0 ? 'Right-Skewed Distribution' : 'Left-Skewed Distribution',
        description: `Skewness=${round2(skew)}, mean=${round2(m)}, median=${round2(med)}`,
        type: 'structural',
        confidence: round2(clamp(Math.abs(skew) / 3, 0.5, 1)),
        occurrences: 1,
        examples: data.slice(0, 5).map(String),
        metadata: {
          skewness: round2(skew),
          mean: round2(m),
          median: round2(med),
          stddev: round2(sd),
        },
      })
    }

    // Check learned patterns for matches
    this.matchLearnedPatterns(data.map(String), patterns)

    // Limit output
    patterns.splice(this.config.maxPatterns)

    return this.finalizeResult(
      analysisId,
      startTime,
      patterns,
      sequences,
      anomalies,
      frequencies,
      [],
      clusters,
    )
  }

  // ── Text Analysis ────────────────────────────────────────────────────────

  analyzeText(text: string): PatternAnalysisResult {
    const startTime = Date.now()
    const analysisId = generateId('TXT')
    const patterns: DataPattern[] = []
    const sequences: SequenceInfo[] = []
    const anomalies: AnomalyInfo[] = []
    const frequencies: FrequencyInfo[] = []

    if (text.trim().length === 0) {
      return this.finalizeResult(
        analysisId,
        startTime,
        patterns,
        sequences,
        anomalies,
        frequencies,
        [],
        [],
      )
    }

    const tokens = tokenize(text)
    const filteredTokens = filterStopWords(tokens)

    // Run text pattern detectors
    for (const tpd of this.textPatternDefs) {
      const result = tpd.detector(tokens, text)
      if (result.detected) {
        patterns.push({
          id: generateId('TP'),
          name: tpd.name,
          description: result.description,
          type: tpd.type,
          confidence: result.confidence,
          occurrences: 1,
          examples: [],
          metadata: {},
        })
      }
    }

    // Text structure analysis
    const structure = detectTextStructure(text)
    patterns.push({
      id: generateId('STRUCT'),
      name: 'Text Structure',
      description: `${structure.sentenceCount} sentences, ${structure.paragraphCount} paragraphs, vocab richness=${structure.vocabularyRichness}`,
      type: 'structural',
      confidence: 0.95,
      occurrences: 1,
      examples: [],
      metadata: structure,
    })

    // Word frequency analysis
    if (this.config.enableFrequencyAnalysis) {
      const freq = countFrequencies(filteredTokens)
      const total = filteredTokens.length
      const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1])
      let rank = 1
      for (const [element, count] of sorted.slice(0, 50)) {
        frequencies.push({
          element,
          count,
          frequency: round2(count / total),
          rank: rank++,
        })
      }

      // Zipf's law check
      if (sorted.length >= 10) {
        const topFreqs = sorted.slice(0, 10).map(([, c]) => c)
        const idealZipf = topFreqs[0]
        let zipfScore = 0
        for (let i = 1; i < topFreqs.length; i++) {
          const expected = idealZipf / (i + 1)
          const actual = topFreqs[i]
          if (expected > 0) {
            zipfScore += 1 - Math.min(Math.abs(actual - expected) / expected, 1)
          }
        }
        zipfScore /= topFreqs.length - 1
        if (zipfScore > 0.3) {
          patterns.push({
            id: generateId('ZIPF'),
            name: "Zipf's Law Distribution",
            description: `Word frequencies follow Zipf's law (score=${round2(zipfScore)})`,
            type: 'frequency',
            confidence: round2(zipfScore),
            occurrences: 1,
            examples: sorted.slice(0, 5).map(([w]) => w),
            metadata: { zipfScore: round2(zipfScore) },
          })
        }
      }

      // Entropy analysis
      const freqValues = [...freq.values()]
      const ent = entropy(freqValues)
      const maxEntropy = Math.log2(freq.size)
      const normalizedEntropy = maxEntropy > 0 ? ent / maxEntropy : 0
      patterns.push({
        id: generateId('ENT'),
        name: 'Information Entropy',
        description: `Entropy=${round2(ent)} bits, normalized=${round2(normalizedEntropy)}`,
        type: 'frequency',
        confidence: 0.9,
        occurrences: 1,
        examples: [],
        metadata: {
          entropy: round2(ent),
          maxEntropy: round2(maxEntropy),
          normalized: round2(normalizedEntropy),
        },
      })
    }

    // Sequence detection in text
    if (this.config.enableSequenceDetection && tokens.length >= 6) {
      const bigrams = nGrams(tokens, 2)
      const trigrams = nGrams(tokens, 3)

      const bigramFreq = countFrequencies(bigrams)
      const repeatedBigrams = [...bigramFreq.entries()]
        .filter(([, c]) => c >= 3)
        .sort((a, b) => b[1] - a[1])
      for (const [bigram, count] of repeatedBigrams.slice(0, 5)) {
        sequences.push({
          elements: bigram.split(' '),
          period: round2(tokens.length / count),
          confidence: round2(clamp(count / (tokens.length / 10), 0, 1)),
          direction: 'stable',
        })
      }

      const trigramFreq = countFrequencies(trigrams)
      const repeatedTrigrams = [...trigramFreq.entries()]
        .filter(([, c]) => c >= 2)
        .sort((a, b) => b[1] - a[1])
      for (const [trigram, count] of repeatedTrigrams.slice(0, 5)) {
        sequences.push({
          elements: trigram.split(' '),
          period: round2(tokens.length / count),
          confidence: round2(clamp(count / (tokens.length / 15), 0, 1)),
          direction: 'stable',
        })
      }
    }

    // Sentence length anomalies
    if (this.config.enableAnomalyDetection) {
      const sentenceLengths = text
        .split(/[.!?]+/)
        .filter(s => s.trim().length > 0)
        .map(s => tokenize(s).length)
      if (sentenceLengths.length >= 5) {
        const sentAnomalies = this.detectAnomalies(sentenceLengths)
        for (const a of sentAnomalies) {
          anomalies.push({
            ...a,
            value: a.value,
          })
        }
      }
    }

    // Check learned patterns
    this.matchLearnedPatterns(tokens, patterns)

    patterns.splice(this.config.maxPatterns)

    return this.finalizeResult(
      analysisId,
      startTime,
      patterns,
      sequences,
      anomalies,
      frequencies,
      [],
      [],
    )
  }

  // ── Sequence Analysis ────────────────────────────────────────────────────

  analyzeSequence(sequence: string[]): PatternAnalysisResult {
    const startTime = Date.now()
    const analysisId = generateId('SEQ')
    const patterns: DataPattern[] = []
    const sequences: SequenceInfo[] = []
    const frequencies: FrequencyInfo[] = []

    if (sequence.length === 0) {
      return this.finalizeResult(
        analysisId,
        startTime,
        patterns,
        sequences,
        [],
        frequencies,
        [],
        [],
      )
    }

    // Frequency analysis of elements
    if (this.config.enableFrequencyAnalysis) {
      const freq = countFrequencies(sequence)
      const total = sequence.length
      const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1])
      let rank = 1
      for (const [element, count] of sorted.slice(0, this.config.maxPatterns)) {
        frequencies.push({
          element,
          count,
          frequency: round2(count / total),
          rank: rank++,
        })
      }

      // High-frequency elements pattern
      const dominant = sorted.filter(([, c]) => c / total > 0.2)
      if (dominant.length > 0 && dominant.length <= 3) {
        patterns.push({
          id: generateId('DOM'),
          name: 'Dominant Elements',
          description: `${dominant.length} element(s) account for >${((dominant.reduce((s, [, c]) => s + c, 0) / total) * 100) | 0}% of sequence`,
          type: 'frequency',
          confidence: round2(dominant.reduce((s, [, c]) => s + c / total, 0)),
          occurrences: dominant.reduce((s, [, c]) => s + c, 0),
          examples: dominant.map(([e]) => e),
          metadata: {},
        })
      }
    }

    // Sequence detection
    if (this.config.enableSequenceDetection) {
      const minLen = 2
      const maxLen = Math.min(10, Math.floor(sequence.length / 2))
      const repeating = findRepeatingSubsequences(sequence, minLen, maxLen)

      for (const rep of repeating.slice(0, 10)) {
        const direction = this.inferSequenceDirection(rep.subsequence)
        sequences.push({
          elements: rep.subsequence,
          period: rep.period,
          confidence: round2(clamp(rep.positions.length / (sequence.length / rep.period), 0, 1)),
          direction,
        })
        patterns.push({
          id: generateId('REP'),
          name: 'Repeating Subsequence',
          description: `"${rep.subsequence.join(', ')}" repeats ${rep.positions.length} times with period ≈ ${rep.period}`,
          type: 'sequential',
          confidence: round2(clamp(rep.positions.length / (sequence.length / rep.period), 0, 1)),
          occurrences: rep.positions.length,
          examples: rep.subsequence,
          metadata: { positions: rep.positions, period: rep.period },
        })
      }

      // Unique element ratio
      const uniqueRatio = new Set(sequence).size / sequence.length
      if (uniqueRatio < 0.3) {
        patterns.push({
          id: generateId('LOW-UNIQ'),
          name: 'Low Uniqueness',
          description: `Only ${round2(uniqueRatio * 100)}% unique elements — high repetition`,
          type: 'frequency',
          confidence: round2(1 - uniqueRatio),
          occurrences: 1,
          examples: [],
          metadata: { uniqueRatio: round2(uniqueRatio) },
        })
      } else if (uniqueRatio > 0.9) {
        patterns.push({
          id: generateId('HIGH-UNIQ'),
          name: 'High Uniqueness',
          description: `${round2(uniqueRatio * 100)}% unique elements — diverse sequence`,
          type: 'structural',
          confidence: round2(uniqueRatio),
          occurrences: 1,
          examples: [],
          metadata: { uniqueRatio: round2(uniqueRatio) },
        })
      }

      // Transition pattern analysis
      if (sequence.length >= 4) {
        const transitions = new Map<string, number>()
        for (let i = 0; i < sequence.length - 1; i++) {
          const key = `${sequence[i]} → ${sequence[i + 1]}`
          transitions.set(key, (transitions.get(key) ?? 0) + 1)
        }
        const sortedTransitions = [...transitions.entries()].sort((a, b) => b[1] - a[1])
        const topTransitions = sortedTransitions.slice(0, 5)
        if (topTransitions.length > 0 && topTransitions[0][1] >= 3) {
          patterns.push({
            id: generateId('TRANS'),
            name: 'Frequent Transitions',
            description: `Top transition: "${topTransitions[0][0]}" (${topTransitions[0][1]}×)`,
            type: 'sequential',
            confidence: round2(topTransitions[0][1] / (sequence.length - 1)),
            occurrences: topTransitions[0][1],
            examples: topTransitions.map(([t]) => t),
            metadata: { transitions: Object.fromEntries(topTransitions) },
          })
        }
      }
    }

    // Check if numeric sequence
    const numericValues = sequence.map(Number).filter(n => !isNaN(n))
    if (numericValues.length === sequence.length && numericValues.length >= 3) {
      const seqTypes = detectNumericSequenceType(numericValues)
      for (const st of seqTypes) {
        patterns.push({
          id: generateId('NSEQ'),
          name: st.name,
          description: st.description,
          type: 'sequential',
          confidence: st.confidence,
          occurrences: 1,
          examples: sequence.slice(0, 5),
          metadata: {},
        })
      }

      const direction = detectTrendDirection(numericValues)
      if (sequences.length === 0) {
        const period = detectPeriodicity(numericValues)
        sequences.push({
          elements: sequence.slice(0, Math.min(5, sequence.length)),
          period: period ? period.period : 0,
          confidence: period ? period.confidence : 0.5,
          direction,
        })
      }
    }

    // Learned patterns
    this.matchLearnedPatterns(sequence, patterns)

    patterns.splice(this.config.maxPatterns)

    return this.finalizeResult(analysisId, startTime, patterns, sequences, [], frequencies, [], [])
  }

  // ── Anomaly Detection ────────────────────────────────────────────────────

  detectAnomalies(data: number[]): AnomalyInfo[] {
    const anomalies: AnomalyInfo[] = []
    if (data.length < 3) return anomalies

    const m = mean(data)
    const sd = stddev(data)
    const q1 = percentile(data, 25)
    const q3 = percentile(data, 75)
    const iqr = q3 - q1

    // Z-score based detection
    for (let i = 0; i < data.length; i++) {
      const z = zScore(data[i], m, sd)
      const absZ = Math.abs(z)

      if (absZ > 2.0) {
        const severity = this.zScoreToSeverity(absZ)
        const expectedMin = m - 2 * sd
        const expectedMax = m + 2 * sd
        anomalies.push({
          index: i,
          value: data[i],
          expectedRange: { min: round2(expectedMin), max: round2(expectedMax) },
          deviation: round2(z),
          severity,
        })
      }
    }

    // IQR-based detection (complementary)
    if (iqr > 0) {
      const lowerFence = q1 - 1.5 * iqr
      const upperFence = q3 + 1.5 * iqr
      for (let i = 0; i < data.length; i++) {
        if (data[i] < lowerFence || data[i] > upperFence) {
          const alreadyDetected = anomalies.some(a => a.index === i)
          if (!alreadyDetected) {
            const deviation =
              data[i] < lowerFence ? (data[i] - lowerFence) / iqr : (data[i] - upperFence) / iqr
            anomalies.push({
              index: i,
              value: data[i],
              expectedRange: { min: round2(lowerFence), max: round2(upperFence) },
              deviation: round2(deviation),
              severity: Math.abs(deviation) > 3 ? 'high' : 'medium',
            })
          }
        }
      }
    }

    // Local context anomalies (sliding window)
    const windowSize = Math.min(this.config.windowSize, Math.floor(data.length / 3))
    if (windowSize >= 3) {
      for (let i = windowSize; i < data.length; i++) {
        const window = data.slice(i - windowSize, i)
        const wm = mean(window)
        const wsd = stddev(window)
        if (wsd > 0) {
          const localZ = Math.abs(zScore(data[i], wm, wsd))
          if (localZ > 3.0) {
            const alreadyDetected = anomalies.some(a => a.index === i)
            if (!alreadyDetected) {
              anomalies.push({
                index: i,
                value: data[i],
                expectedRange: { min: round2(wm - 2 * wsd), max: round2(wm + 2 * wsd) },
                deviation: round2(localZ),
                severity: this.zScoreToSeverity(localZ),
              })
            }
          }
        }
      }
    }

    anomalies.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation))
    return anomalies
  }

  // ── Correlation ──────────────────────────────────────────────────────────

  findCorrelation(seriesA: number[], seriesB: number[]): CorrelationInfo {
    const coefficient = pearsonCorrelation(seriesA, seriesB)
    const absCoeff = Math.abs(coefficient)
    let strength: CorrelationInfo['strength']
    if (absCoeff < 0.1) strength = 'none'
    else if (absCoeff < 0.3) strength = 'weak'
    else if (absCoeff < 0.7) strength = 'moderate'
    else if (absCoeff < 0.99) strength = 'strong'
    else strength = 'perfect'

    return {
      seriesA: `series_A[${seriesA.length}]`,
      seriesB: `series_B[${seriesB.length}]`,
      coefficient: round2(coefficient),
      strength,
    }
  }

  // ── Clustering ───────────────────────────────────────────────────────────

  clusterData(points: number[][]): ClusterInfo[] {
    if (points.length === 0) return []
    if (points.length <= 2) {
      return [
        {
          id: 0,
          centroid:
            points.length === 1
              ? [...points[0]]
              : points[0].map((_, d) => mean(points.map(p => p[d] ?? 0))),
          members: points.map(p => [...p]),
          size: points.length,
          density: 1,
        },
      ]
    }

    const k = estimateK(points, Math.min(8, Math.floor(points.length / 2)))
    const { assignments, centroids } = kMeansClustering(points, k)

    const clusters: ClusterInfo[] = []
    for (let c = 0; c < centroids.length; c++) {
      const members = points.filter((_, i) => assignments[i] === c).map(p => [...p])
      if (members.length === 0) continue

      let totalDist = 0
      for (const member of members) {
        totalDist += euclideanDistance(member, centroids[c])
      }
      const avgDist = members.length > 0 ? totalDist / members.length : 0
      const density = avgDist > 0 ? 1 / avgDist : members.length

      clusters.push({
        id: c,
        centroid: centroids[c].map(v => round2(v)),
        members,
        size: members.length,
        density: round2(density),
      })
    }

    clusters.sort((a, b) => b.size - a.size)
    return clusters
  }

  // ── Pattern Learning ─────────────────────────────────────────────────────

  learnPattern(pattern: DataPattern): void {
    const existing = this.learnedPatterns.findIndex(p => p.id === pattern.id)
    if (existing >= 0) {
      this.learnedPatterns[existing] = { ...pattern }
    } else {
      if (this.learnedPatterns.length >= this.config.maxPatterns) {
        // Evict lowest-confidence pattern
        let minIdx = 0
        let minConf = Infinity
        for (let i = 0; i < this.learnedPatterns.length; i++) {
          if (this.learnedPatterns[i].confidence < minConf) {
            minConf = this.learnedPatterns[i].confidence
            minIdx = i
          }
        }
        this.learnedPatterns.splice(minIdx, 1)
      }
      this.learnedPatterns.push({ ...pattern })
    }
  }

  getLearnedPatterns(): DataPattern[] {
    return this.learnedPatterns.map(p => ({ ...p }))
  }

  // ── Stats & Serialization ────────────────────────────────────────────────

  getStats(): Readonly<PatternRecognizerStats> {
    const avgAnalysisTime =
      this.analysisTimesMs.length > 0
        ? this.analysisTimesMs.reduce((s, v) => s + v, 0) / this.analysisTimesMs.length
        : 0

    return {
      totalAnalyses: this.totalAnalyses,
      totalPatternsDetected: this.totalPatternsDetected,
      totalSequencesFound: this.totalSequencesFound,
      totalAnomaliesDetected: this.totalAnomaliesDetected,
      avgAnalysisTime: round2(avgAnalysisTime),
      feedbackCount: this.feedbackCount,
    }
  }

  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalAnalyses: this.totalAnalyses,
      totalPatternsDetected: this.totalPatternsDetected,
      totalSequencesFound: this.totalSequencesFound,
      totalAnomaliesDetected: this.totalAnomaliesDetected,
      analysisTimesMs: this.analysisTimesMs,
      feedbackCount: this.feedbackCount,
      feedbackLog: this.feedbackLog,
      analysisHistory: this.analysisHistory,
      learnedPatterns: this.learnedPatterns,
    })
  }

  static deserialize(json: string): PatternRecognizer {
    const data = JSON.parse(json) as {
      config: PatternRecognizerConfig
      totalAnalyses: number
      totalPatternsDetected: number
      totalSequencesFound: number
      totalAnomaliesDetected: number
      analysisTimesMs: number[]
      feedbackCount: number
      feedbackLog: Array<{ analysisId: string; patternId: string; isRelevant: boolean }>
      analysisHistory: Array<{
        analysisId: string
        timestamp: number
        patternsFound: number
        duration: number
      }>
      learnedPatterns: DataPattern[]
    }

    const instance = new PatternRecognizer(data.config)
    instance.totalAnalyses = data.totalAnalyses
    instance.totalPatternsDetected = data.totalPatternsDetected
    instance.totalSequencesFound = data.totalSequencesFound
    instance.totalAnomaliesDetected = data.totalAnomaliesDetected
    instance.analysisTimesMs = data.analysisTimesMs
    instance.feedbackCount = data.feedbackCount

    for (const entry of data.feedbackLog) {
      instance.feedbackLog.push(entry)
    }
    for (const entry of data.analysisHistory) {
      instance.analysisHistory.push(entry)
    }
    for (const pattern of data.learnedPatterns) {
      instance.learnedPatterns.push(pattern)
    }

    return instance
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private finalizeResult(
    analysisId: string,
    startTime: number,
    patterns: DataPattern[],
    sequences: SequenceInfo[],
    anomalies: AnomalyInfo[],
    frequencies: FrequencyInfo[],
    correlations: CorrelationInfo[],
    clusters: ClusterInfo[],
  ): PatternAnalysisResult {
    const duration = Date.now() - startTime

    this.totalAnalyses++
    this.totalPatternsDetected += patterns.length
    this.totalSequencesFound += sequences.length
    this.totalAnomaliesDetected += anomalies.length
    this.analysisTimesMs.push(duration)
    this.analysisHistory.push({
      analysisId,
      timestamp: Date.now(),
      patternsFound: patterns.length,
      duration,
    })

    const summaryParts: string[] = []
    if (patterns.length > 0) summaryParts.push(`${patterns.length} pattern(s)`)
    if (sequences.length > 0) summaryParts.push(`${sequences.length} sequence(s)`)
    if (anomalies.length > 0) summaryParts.push(`${anomalies.length} anomaly/anomalies`)
    if (frequencies.length > 0) summaryParts.push(`${frequencies.length} frequency entries`)
    if (correlations.length > 0) summaryParts.push(`${correlations.length} correlation(s)`)
    if (clusters.length > 0) summaryParts.push(`${clusters.length} cluster(s)`)

    const summary =
      summaryParts.length > 0
        ? `Analysis found ${summaryParts.join(', ')} in ${duration}ms.`
        : `No significant patterns detected (${duration}ms).`

    return {
      analysisId,
      timestamp: Date.now(),
      duration,
      patterns,
      sequences,
      anomalies,
      frequencies,
      correlations,
      clusters,
      summary,
    }
  }

  private zScoreToSeverity(absZ: number): AnomalyInfo['severity'] {
    if (absZ > 4) return 'critical'
    if (absZ > 3) return 'high'
    if (absZ > 2.5) return 'medium'
    return 'low'
  }

  private inferSequenceDirection(elements: string[]): SequenceInfo['direction'] {
    const nums = elements.map(Number).filter(n => !isNaN(n))
    if (nums.length >= 2) {
      return detectTrendDirection(nums)
    }
    // For non-numeric: check alphabetical ordering
    let ascending = 0
    let descending = 0
    for (let i = 1; i < elements.length; i++) {
      if (elements[i] > elements[i - 1]) ascending++
      else if (elements[i] < elements[i - 1]) descending++
    }
    const total = ascending + descending
    if (total === 0) return 'stable'
    if (ascending / total > 0.7) return 'ascending'
    if (descending / total > 0.7) return 'descending'
    if (ascending > 0 && descending > 0) return 'oscillating'
    return 'stable'
  }

  private matchLearnedPatterns(elements: string[], patterns: DataPattern[]): void {
    for (const learned of this.learnedPatterns) {
      if (learned.examples.length === 0) continue
      let matchCount = 0
      for (const example of learned.examples) {
        if (elements.includes(example)) matchCount++
      }
      const matchRatio = matchCount / learned.examples.length
      if (matchRatio >= this.config.similarityThreshold) {
        patterns.push({
          ...learned,
          id: generateId('LMATCH'),
          name: `Learned: ${learned.name}`,
          confidence: round2(matchRatio * learned.confidence),
          occurrences: matchCount,
        })
      }
    }
  }
}
