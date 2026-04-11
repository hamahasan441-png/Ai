/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Abstraction Engine — Concept Abstraction & Generalization                   ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Abstraction Hierarchies — Build trees from concrete to abstract         ║
 * ║    ✦ Generalization — Extract shared patterns across examples                ║
 * ║    ✦ Specialization — Derive specific instances from abstractions            ║
 * ║    ✦ Prototype Theory — Category membership via exemplar matching            ║
 * ║    ✦ Feature Extraction — TF-IDF-like commonality scoring                    ║
 * ║    ✦ Hierarchical Clustering — Automatic concept grouping                    ║
 * ║    ✦ Persistence — Full serialize / deserialize for long-term memory         ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES — All data shapes for the abstraction engine                     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Configuration ────────────────────────────────────────────────────────────

export interface AbstractionEngineConfig {
  maxLevels: number // maximum depth of abstraction hierarchy
  minExamplesForAbstraction: number // minimum examples needed to form an abstraction
  similarityThreshold: number // minimum similarity to group concepts
  maxConcepts: number // maximum stored concepts
  prototypeDecay: number // decay factor for older prototype entries
  featureBoostFactor: number // boost for features shared across many examples
}

// ── Statistics ───────────────────────────────────────────────────────────────

export interface AbstractionEngineStats {
  conceptCount: number
  hierarchyDepth: number
  abstractionsMade: number
  generalizationsMade: number
  specializationsMade: number
  prototypeCount: number
  learnedMappings: number
}

// ── Abstraction Level ────────────────────────────────────────────────────────

export interface AbstractionLevel {
  level: number
  concepts: string[]
  rules: string[]
}

// ── Concept Hierarchy ────────────────────────────────────────────────────────

export interface ConceptHierarchy {
  root: string
  levels: AbstractionLevel[]
  depth: number
}

// ── Abstract Concept ─────────────────────────────────────────────────────────

export interface AbstractConcept {
  id: string
  name: string
  description: string
  examples: string[]
  parentId: string | null
  children: string[]
  abstractionLevel: number
  features: string[]
  createdAt: number
  accessCount: number
}

// ── Generalization Result ────────────────────────────────────────────────────

export interface GeneralizationResult {
  abstractConcept: string
  sharedFeatures: string[]
  confidence: number
  inputConcepts: string[]
  level: number
}

// ── Specialization Result ────────────────────────────────────────────────────

export interface SpecializationResult {
  parentConcept: string
  specializations: string[]
  addedConstraints: string[]
  confidence: number
}

// ── Pattern Abstraction ──────────────────────────────────────────────────────

export interface PatternAbstraction {
  pattern: string
  instances: string[]
  abstractionLevel: number
  confidence: number
  features: string[]
}

// ── Abstraction Mapping ──────────────────────────────────────────────────────

export interface AbstractionMapping {
  concept: string
  fromLevel: number
  toLevel: number
  mappedConcept: string
  confidence: number
}

// ── Prototype Entry ──────────────────────────────────────────────────────────

export interface PrototypeEntry {
  category: string
  prototype: string
  features: string[]
  typicality: number
  memberCount: number
  createdAt: number
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  CONSTANTS — Stop words, built-in hierarchies, domain knowledge         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

const STOP_WORDS = new Set([
  'the',
  'be',
  'to',
  'of',
  'and',
  'a',
  'in',
  'that',
  'have',
  'i',
  'it',
  'for',
  'not',
  'on',
  'with',
  'he',
  'as',
  'you',
  'do',
  'at',
  'this',
  'but',
  'his',
  'by',
  'from',
  'they',
  'we',
  'say',
  'her',
  'she',
  'or',
  'an',
  'will',
  'my',
  'one',
  'all',
  'would',
  'there',
  'their',
  'what',
  'so',
  'up',
  'out',
  'if',
  'about',
  'who',
  'get',
  'which',
  'go',
  'me',
  'when',
  'make',
  'can',
  'like',
  'time',
  'no',
  'just',
  'him',
  'know',
  'take',
  'is',
  'are',
  'was',
  'were',
  'been',
  'has',
  'had',
  'did',
  'does',
  'am',
  'being',
  'doing',
  'should',
  'very',
  'much',
  'such',
  'each',
  'every',
])

const DEFAULT_CONFIG: AbstractionEngineConfig = {
  maxLevels: 7,
  minExamplesForAbstraction: 2,
  similarityThreshold: 0.3,
  maxConcepts: 5000,
  prototypeDecay: 0.95,
  featureBoostFactor: 1.5,
}

// ── Pre-built Programming Abstraction Hierarchy ──────────────────────────────

interface BuiltInHierarchyNode {
  name: string
  level: number
  children: string[]
}

const PROGRAMMING_ABSTRACTION_HIERARCHY: BuiltInHierarchyNode[] = [
  { name: 'visual programming', level: 6, children: [] },
  { name: 'declarative programming', level: 5, children: ['visual programming'] },
  { name: 'high-level language', level: 4, children: ['declarative programming'] },
  { name: 'low-level language', level: 3, children: ['high-level language'] },
  { name: 'assembly language', level: 2, children: ['low-level language'] },
  { name: 'machine code', level: 1, children: ['assembly language'] },
]

const PROGRAMMING_LEVEL_MEMBERS: Record<number, string[]> = {
  1: ['binary', 'opcodes', 'machine instructions', 'hex code'],
  2: ['x86 assembly', 'ARM assembly', 'MIPS assembly', 'RISC-V assembly'],
  3: ['C', 'C++', 'Rust', 'Go'],
  4: ['Python', 'JavaScript', 'TypeScript', 'Ruby', 'Java', 'C#', 'Kotlin', 'Swift'],
  5: ['SQL', 'HTML', 'CSS', 'Prolog', 'Haskell', 'Datalog', 'RegExp'],
  6: ['Scratch', 'Blockly', 'LabVIEW', 'Unreal Blueprints', 'Node-RED'],
}

// ── Pre-built Design Pattern Abstraction Hierarchy ───────────────────────────

const DESIGN_PATTERN_HIERARCHY: BuiltInHierarchyNode[] = [
  { name: 'software engineering concept', level: 4, children: [] },
  { name: 'design pattern', level: 3, children: ['software engineering concept'] },
  { name: 'creational pattern', level: 2, children: ['design pattern'] },
  { name: 'structural pattern', level: 2, children: ['design pattern'] },
  { name: 'behavioral pattern', level: 2, children: ['design pattern'] },
  { name: 'factory pattern', level: 1, children: ['creational pattern'] },
  { name: 'singleton pattern', level: 1, children: ['creational pattern'] },
  { name: 'builder pattern', level: 1, children: ['creational pattern'] },
  { name: 'prototype pattern', level: 1, children: ['creational pattern'] },
  { name: 'adapter pattern', level: 1, children: ['structural pattern'] },
  { name: 'decorator pattern', level: 1, children: ['structural pattern'] },
  { name: 'facade pattern', level: 1, children: ['structural pattern'] },
  { name: 'proxy pattern', level: 1, children: ['structural pattern'] },
  { name: 'observer pattern', level: 1, children: ['behavioral pattern'] },
  { name: 'strategy pattern', level: 1, children: ['behavioral pattern'] },
  { name: 'command pattern', level: 1, children: ['behavioral pattern'] },
  { name: 'iterator pattern', level: 1, children: ['behavioral pattern'] },
]

// ── Data Structure Abstraction Hierarchy ─────────────────────────────────────

const DATA_STRUCTURE_HIERARCHY: BuiltInHierarchyNode[] = [
  { name: 'data structure', level: 3, children: [] },
  { name: 'linear structure', level: 2, children: ['data structure'] },
  { name: 'tree structure', level: 2, children: ['data structure'] },
  { name: 'graph structure', level: 2, children: ['data structure'] },
  { name: 'hash structure', level: 2, children: ['data structure'] },
  { name: 'array', level: 1, children: ['linear structure'] },
  { name: 'linked list', level: 1, children: ['linear structure'] },
  { name: 'stack', level: 1, children: ['linear structure'] },
  { name: 'queue', level: 1, children: ['linear structure'] },
  { name: 'binary tree', level: 1, children: ['tree structure'] },
  { name: 'b-tree', level: 1, children: ['tree structure'] },
  { name: 'trie', level: 1, children: ['tree structure'] },
  { name: 'heap', level: 1, children: ['tree structure'] },
  { name: 'directed graph', level: 1, children: ['graph structure'] },
  { name: 'undirected graph', level: 1, children: ['graph structure'] },
  { name: 'hash map', level: 1, children: ['hash structure'] },
  { name: 'hash set', level: 1, children: ['hash structure'] },
]

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  HELPERS — Tokenization, similarity, feature extraction                 ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Monotonically increasing counter for unique concept IDs. */
let _idCounter = 0

/** Generate a unique concept ID. */
function generateId(): string {
  _idCounter += 1
  return `abs_${Date.now().toString(36)}_${_idCounter.toString(36)}`
}

/** Normalize a concept name for indexing. */
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Tokenize text into lowercase words, filtering stop words and short tokens. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_.#+]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w))
}

/** Compute Jaccard similarity between two token sets. */
function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  let intersection = 0
  for (const token of setA) {
    if (setB.has(token)) intersection++
  }
  const union = new Set([...a, ...b]).size
  return union > 0 ? intersection / union : 0
}

/** Compute cosine similarity between two feature-weight maps. */
function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (const [key, valA] of a) {
    normA += valA * valA
    const valB = b.get(key)
    if (valB !== undefined) {
      dotProduct += valA * valB
    }
  }

  for (const valB of b.values()) {
    normB += valB * valB
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  return denominator > 0 ? dotProduct / denominator : 0
}

/**
 * Extract weighted features from a set of examples using TF-IDF-like scoring.
 *
 * Features that appear in many examples receive higher IDF-adjusted weight,
 * capturing the shared essence across instances.  The boostFactor amplifies
 * features that appear in a larger fraction of examples.
 */
function extractCommonFeatures(examples: string[], boostFactor: number): Map<string, number> {
  const docFreq = new Map<string, number>()
  const totalFreq = new Map<string, number>()
  const n = examples.length

  for (const example of examples) {
    const tokens = tokenize(example)
    const unique = new Set(tokens)
    for (const token of unique) {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1)
    }
    for (const token of tokens) {
      totalFreq.set(token, (totalFreq.get(token) ?? 0) + 1)
    }
  }

  const features = new Map<string, number>()

  for (const [term, df] of docFreq) {
    const tf = totalFreq.get(term) ?? 0
    // Inverse document frequency favoring terms shared across examples
    const commonality = df / n
    // TF-IDF variant: higher score for terms that appear often AND across many examples
    const idf = Math.log((n + 1) / (n - df + 1)) + 1
    const score = (tf / n) * idf * (1 + commonality * boostFactor)
    features.set(term, score)
  }

  return features
}

/**
 * Find the longest common subsequence of tokens shared among all examples.
 * Returns the common tokens ordered by their first appearance.
 */
function findCommonTokens(examples: string[]): string[] {
  if (examples.length === 0) return []

  const tokenSets = examples.map(e => new Set(tokenize(e)))
  const base = tokenSets[0]
  const common: string[] = []

  for (const token of base) {
    if (tokenSets.every(s => s.has(token))) {
      common.push(token)
    }
  }

  return common
}

/**
 * Build a distance matrix from a set of items using their token representations.
 * Returns a symmetric matrix where entry [i][j] is 1 - jaccardSimilarity.
 */
function buildDistanceMatrix(items: string[][]): number[][] {
  const n = items.length
  const matrix: number[][] = []

  for (let i = 0; i < n; i++) {
    matrix[i] = new Array(n).fill(0)
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = 1 - jaccardSimilarity(items[i], items[j])
      matrix[i][j] = dist
      matrix[j][i] = dist
    }
  }

  return matrix
}

/**
 * Agglomerative hierarchical clustering using average linkage.
 *
 * Given a distance matrix, iteratively merges the two closest clusters
 * until only one cluster remains or the minimum distance exceeds a threshold.
 * Returns cluster assignments at each merge step.
 */
function hierarchicalCluster(distMatrix: number[][], threshold: number): number[][] {
  const n = distMatrix.length
  if (n === 0) return []

  // Each item starts in its own cluster
  let clusters: number[][] = []
  for (let i = 0; i < n; i++) {
    clusters.push([i])
  }

  // Working copy of the distance matrix (cluster × cluster)
  const dist: number[][] = []
  for (let i = 0; i < n; i++) {
    dist[i] = [...distMatrix[i]]
  }

  const mergeHistory: number[][][] = [clusters.map(c => [...c])]

  while (clusters.length > 1) {
    // Find the closest pair of clusters
    let minDist = Infinity
    let mergeA = 0
    let mergeB = 1

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = averageLinkage(clusters[i], clusters[j], distMatrix)
        if (d < minDist) {
          minDist = d
          mergeA = i
          mergeB = j
        }
      }
    }

    if (minDist > threshold) break

    // Merge clusters
    const merged = [...clusters[mergeA], ...clusters[mergeB]]
    const newClusters: number[][] = []
    for (let i = 0; i < clusters.length; i++) {
      if (i !== mergeA && i !== mergeB) {
        newClusters.push(clusters[i])
      }
    }
    newClusters.push(merged)
    clusters = newClusters
    mergeHistory.push(clusters.map(c => [...c]))
  }

  return clusters
}

/** Compute average linkage distance between two clusters. */
function averageLinkage(clusterA: number[], clusterB: number[], distMatrix: number[][]): number {
  let total = 0
  let count = 0

  for (const a of clusterA) {
    for (const b of clusterB) {
      total += distMatrix[a][b]
      count++
    }
  }

  return count > 0 ? total / count : Infinity
}

/**
 * Select the most representative item from a group (the prototype).
 * The prototype is the item with the smallest average distance to all others.
 */
function selectPrototype(
  items: string[],
  tokenized: string[][],
  distMatrix: number[][],
  indices: number[],
): { prototype: string; typicality: number } {
  if (indices.length === 1) {
    return { prototype: items[indices[0]], typicality: 1.0 }
  }

  let bestIdx = indices[0]
  let bestAvgDist = Infinity

  for (const i of indices) {
    let total = 0
    for (const j of indices) {
      if (i !== j) total += distMatrix[i][j]
    }
    const avgDist = total / (indices.length - 1)
    if (avgDist < bestAvgDist) {
      bestAvgDist = avgDist
      bestIdx = i
    }
  }

  // Typicality is inversely proportional to average distance
  const typicality = Math.max(0, 1 - bestAvgDist)
  return { prototype: items[bestIdx], typicality }
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4  ABSTRACTION ENGINE CLASS                                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

export class AbstractionEngine {
  private concepts: Map<string, AbstractConcept> = new Map()
  private nameIndex: Map<string, string> = new Map() // normalized name → id
  private prototypes: Map<string, PrototypeEntry> = new Map() // category → prototype
  private mappings: AbstractionMapping[] = []
  private config: AbstractionEngineConfig
  private builtInHierarchies: Map<string, BuiltInHierarchyNode[]> = new Map()

  // Counters for stats
  private abstractionsMade = 0
  private generalizationsMade = 0
  private specializationsMade = 0

  constructor(config: Partial<AbstractionEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initBuiltInHierarchies()
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PUBLIC API — Core Abstraction Operations
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Abstract from concrete examples to find common patterns.
   *
   * Analyzes the given examples, extracts shared features using TF-IDF-like
   * scoring, and produces a named abstraction along with the pattern that
   * unifies the examples.
   */
  abstractFromExamples(examples: string[], domain?: string): PatternAbstraction | null {
    if (examples.length < this.config.minExamplesForAbstraction) {
      return null
    }

    // Extract common features weighted by cross-example frequency
    const features = extractCommonFeatures(examples, this.config.featureBoostFactor)

    // Sort features by weight and take the top ones for the pattern name
    const rankedFeatures = Array.from(features.entries()).sort((a, b) => b[1] - a[1])

    if (rankedFeatures.length === 0) return null

    const topFeatures = rankedFeatures.slice(0, 5).map(([term]) => term)

    // Name the abstraction from its top features
    const patternName = domain
      ? `${domain}: ${topFeatures.slice(0, 3).join(' + ')}`
      : topFeatures.slice(0, 3).join(' + ')

    // Determine abstraction level based on feature commonality
    const commonTokens = findCommonTokens(examples)
    const commonality =
      examples.length > 0 ? commonTokens.length / Math.max(1, tokenize(examples[0]).length) : 0
    const level = Math.min(
      this.config.maxLevels,
      Math.max(1, Math.ceil(commonality * this.config.maxLevels)),
    )

    // Compute confidence from feature coverage
    const avgFeatureCount =
      examples.reduce((sum, ex) => sum + tokenize(ex).length, 0) / examples.length
    const confidence = Math.min(1, topFeatures.length / Math.max(1, avgFeatureCount))

    // Store as a concept
    this.addOrUpdateConcept(patternName, {
      description: `Abstraction from ${examples.length} examples`,
      examples,
      abstractionLevel: level,
      features: topFeatures,
    })

    this.abstractionsMade++

    return {
      pattern: patternName,
      instances: [...examples],
      abstractionLevel: level,
      confidence: Math.round(confidence * 1000) / 1000,
      features: topFeatures,
    }
  }

  /**
   * Find a common generalization across multiple concepts.
   *
   * Looks for shared features among the concepts, checks built-in hierarchies
   * for known generalizations, and returns the most appropriate umbrella concept.
   */
  generalize(concepts: string[]): GeneralizationResult | null {
    if (concepts.length < 2) return null

    // Check built-in hierarchies first
    const builtInResult = this.findBuiltInGeneralization(concepts)
    if (builtInResult) {
      this.generalizationsMade++
      return builtInResult
    }

    // Feature-based generalization
    const features = extractCommonFeatures(concepts, this.config.featureBoostFactor)
    const commonTokens = findCommonTokens(concepts)

    if (commonTokens.length === 0 && features.size === 0) return null

    // Build the generalization name from shared features
    const topFeatures = Array.from(features.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([term]) => term)

    const sharedFeatures = commonTokens.length > 0 ? commonTokens : topFeatures

    const abstractName = sharedFeatures.slice(0, 3).join('-') + ' concept'

    // Determine the abstraction level
    const conceptLevels = concepts.map(c => this.findAbstractionLevel(c))
    const maxInputLevel = Math.max(...conceptLevels)
    const resultLevel = Math.min(this.config.maxLevels, maxInputLevel + 1)

    // Confidence based on how much the concepts share
    const tokenSets = concepts.map(c => tokenize(c))
    let pairwiseSim = 0
    let pairs = 0
    for (let i = 0; i < tokenSets.length; i++) {
      for (let j = i + 1; j < tokenSets.length; j++) {
        pairwiseSim += jaccardSimilarity(tokenSets[i], tokenSets[j])
        pairs++
      }
    }
    const avgSim = pairs > 0 ? pairwiseSim / pairs : 0

    // Store the generalization as a concept
    this.addOrUpdateConcept(abstractName, {
      description: `Generalization of: ${concepts.join(', ')}`,
      examples: concepts,
      abstractionLevel: resultLevel,
      features: sharedFeatures,
    })

    this.generalizationsMade++

    return {
      abstractConcept: abstractName,
      sharedFeatures,
      confidence: Math.round(Math.max(avgSim, commonTokens.length > 0 ? 0.5 : 0.2) * 1000) / 1000,
      inputConcepts: [...concepts],
      level: resultLevel,
    }
  }

  /**
   * Generate specific instances by specializing an abstract concept.
   *
   * Looks up known children in the hierarchy, or generates constrained
   * specializations by combining the concept with the given constraints.
   */
  specialize(concept: string, constraints?: string[]): SpecializationResult {
    const normalized = normalizeName(concept)
    const specializations: string[] = []
    const addedConstraints: string[] = constraints ? [...constraints] : []

    // Check built-in hierarchies for known specializations
    for (const hierarchy of this.builtInHierarchies.values()) {
      for (const node of hierarchy) {
        if (normalizeName(node.name) === normalized) {
          // Find all nodes whose children include this concept
          for (const child of hierarchy) {
            if (child.children.map(normalizeName).includes(normalized)) {
              specializations.push(child.name)
            }
          }
          // Also include direct children from level members
          const levelMembers = this.getLevelMembers(node.level - 1)
          specializations.push(...levelMembers.slice(0, 5))
        }
      }
    }

    // Check learned concepts for children
    const conceptId = this.nameIndex.get(normalized)
    if (conceptId) {
      const storedConcept = this.concepts.get(conceptId)
      if (storedConcept) {
        for (const childId of storedConcept.children) {
          const child = this.concepts.get(childId)
          if (child) specializations.push(child.name)
        }
      }
    }

    // Generate constraint-based specializations
    if (constraints && constraints.length > 0) {
      for (const constraint of constraints) {
        const specialized = `${concept} (${constraint})`
        specializations.push(specialized)
        addedConstraints.push(constraint)
      }
    }

    // Deduplicate
    const unique = [...new Set(specializations)]

    const confidence = unique.length > 0 ? Math.min(1, 0.4 + unique.length * 0.1) : 0.1

    this.specializationsMade++

    return {
      parentConcept: concept,
      specializations: unique,
      addedConstraints,
      confidence: Math.round(confidence * 1000) / 1000,
    }
  }

  /**
   * Build a full concept hierarchy from a set of concepts.
   *
   * Uses hierarchical clustering and built-in knowledge to organize
   * concepts from concrete (level 1) to abstract (higher levels).
   */
  buildHierarchy(concepts: string[]): ConceptHierarchy {
    if (concepts.length === 0) {
      return { root: 'empty', levels: [], depth: 0 }
    }

    // Tokenize all concepts
    const tokenized = concepts.map(c => tokenize(c))
    const distMatrix = buildDistanceMatrix(tokenized)

    // Assign initial abstraction levels
    const conceptLevels = concepts.map(c => this.findAbstractionLevel(c))
    const maxLevel = Math.max(...conceptLevels, 1)

    // Cluster concepts that share features (used to discover implicit groups)
    const clusters = hierarchicalCluster(distMatrix, 1 - this.config.similarityThreshold)

    // Organize concepts by level
    const levelMap = new Map<number, string[]>()
    for (let i = 0; i < concepts.length; i++) {
      const level = conceptLevels[i]
      if (!levelMap.has(level)) levelMap.set(level, [])
      levelMap.get(level)!.push(concepts[i])
    }

    // Cluster within each level to discover sub-groups
    const levels: AbstractionLevel[] = []
    const sortedLevelKeys = Array.from(levelMap.keys()).sort((a, b) => a - b)

    for (const levelNum of sortedLevelKeys) {
      const levelConcepts = levelMap.get(levelNum)!

      // Extract rules: features common to this level
      const features = extractCommonFeatures(levelConcepts, this.config.featureBoostFactor)
      const rules = Array.from(features.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([term]) => `shares feature: ${term}`)

      // Annotate with cluster information when multiple clusters exist at this level
      if (clusters.length > 1) {
        rules.push(`${clusters.length} concept clusters detected`)
      }

      levels.push({
        level: levelNum,
        concepts: levelConcepts,
        rules,
      })
    }

    // If no higher-level concept was found, synthesize a root
    const rootName =
      levels.length > 0 && levels[levels.length - 1].concepts.length === 1
        ? levels[levels.length - 1].concepts[0]
        : this.synthesizeRootName(concepts)

    // Add a root level if all concepts are at the same level
    if (levels.length === 1 && levels[0].concepts.length > 1) {
      const rootLevel = Math.min(maxLevel + 1, this.config.maxLevels)
      levels.push({
        level: rootLevel,
        concepts: [rootName],
        rules: [`encompasses ${concepts.length} concepts`],
      })
    }

    return {
      root: rootName,
      levels,
      depth: levels.length,
    }
  }

  /**
   * Determine the abstraction level of a concept.
   *
   * Returns a number from 1 (most concrete) to maxLevels (most abstract).
   * Checks built-in hierarchies, learned concepts, and falls back to
   * heuristic analysis of the concept name.
   */
  findAbstractionLevel(concept: string): number {
    const normalized = normalizeName(concept)

    // Check built-in hierarchies
    for (const hierarchy of this.builtInHierarchies.values()) {
      for (const node of hierarchy) {
        if (normalizeName(node.name) === normalized) {
          return node.level
        }
      }
    }

    // Check level members
    for (const [level, members] of Object.entries(PROGRAMMING_LEVEL_MEMBERS)) {
      if (members.map(normalizeName).includes(normalized)) {
        return parseInt(level, 10)
      }
    }

    // Check learned concepts
    const conceptId = this.nameIndex.get(normalized)
    if (conceptId) {
      const storedConcept = this.concepts.get(conceptId)
      if (storedConcept) return storedConcept.abstractionLevel
    }

    // Heuristic: abstract terms tend to be shorter, broader words
    return this.heuristicAbstractionLevel(concept)
  }

  /**
   * Map a concept between abstraction levels.
   *
   * Moves a concept up (toward more abstract) or down (toward more concrete)
   * in the abstraction hierarchy, returning the mapped concept at the target level.
   */
  mapBetweenLevels(concept: string, fromLevel: number, toLevel: number): AbstractionMapping {
    const normalized = normalizeName(concept)

    // Moving up: generalize
    if (toLevel > fromLevel) {
      const mapped = this.generalizeToLevel(normalized, fromLevel, toLevel)
      const mapping: AbstractionMapping = {
        concept,
        fromLevel,
        toLevel,
        mappedConcept: mapped,
        confidence: mapped !== concept ? 0.7 : 0.3,
      }
      this.mappings.push(mapping)
      return mapping
    }

    // Moving down: specialize
    if (toLevel < fromLevel) {
      const mapped = this.specializeToLevel(normalized, fromLevel, toLevel)
      const mapping: AbstractionMapping = {
        concept,
        fromLevel,
        toLevel,
        mappedConcept: mapped,
        confidence: mapped !== concept ? 0.6 : 0.3,
      }
      this.mappings.push(mapping)
      return mapping
    }

    // Same level: identity mapping
    const mapping: AbstractionMapping = {
      concept,
      fromLevel,
      toLevel,
      mappedConcept: concept,
      confidence: 1.0,
    }
    this.mappings.push(mapping)
    return mapping
  }

  /**
   * Extract a prototype (exemplar) from a set of examples.
   *
   * Uses prototype theory to find the most representative member
   * of the category formed by the examples. The prototype is the
   * item with the smallest average distance to all other items.
   */
  extractPrototype(examples: string[]): PrototypeEntry | null {
    if (examples.length === 0) return null

    const tokenized = examples.map(e => tokenize(e))
    const distMatrix = buildDistanceMatrix(tokenized)
    const indices = examples.map((_, i) => i)

    const { prototype, typicality } = selectPrototype(examples, tokenized, distMatrix, indices)

    // Extract common features for the category
    const features = extractCommonFeatures(examples, this.config.featureBoostFactor)
    const topFeatures = Array.from(features.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([term]) => term)

    // Name the category
    const category = topFeatures.slice(0, 3).join('-') || 'unnamed'

    const entry: PrototypeEntry = {
      category,
      prototype,
      features: topFeatures,
      typicality: Math.round(typicality * 1000) / 1000,
      memberCount: examples.length,
      createdAt: Date.now(),
    }

    this.prototypes.set(category, entry)
    return entry
  }

  /**
   * Classify an item within a concept hierarchy.
   *
   * Compares the item's features against each level in the hierarchy
   * to determine where it best fits, returning the most likely
   * classification with its abstraction level.
   */
  classifyByAbstraction(
    item: string,
    hierarchy?: ConceptHierarchy,
  ): { concept: string; level: number; confidence: number } {
    const itemTokens = tokenize(item)
    const itemFeatures = new Set(itemTokens)

    // If a specific hierarchy is provided, classify within it
    if (hierarchy && hierarchy.levels.length > 0) {
      let bestMatch = { concept: hierarchy.root, level: 0, confidence: 0 }

      for (const abstractionLevel of hierarchy.levels) {
        for (const levelConcept of abstractionLevel.concepts) {
          const conceptTokens = tokenize(levelConcept)
          const similarity = jaccardSimilarity(itemTokens, conceptTokens)

          if (similarity > bestMatch.confidence) {
            bestMatch = {
              concept: levelConcept,
              level: abstractionLevel.level,
              confidence: similarity,
            }
          }
        }
      }

      if (bestMatch.confidence > 0) {
        return {
          ...bestMatch,
          confidence: Math.round(bestMatch.confidence * 1000) / 1000,
        }
      }
    }

    // Fall back to built-in hierarchies
    let bestBuiltIn = { concept: item, level: 1, confidence: 0 }

    for (const hierarchyNodes of this.builtInHierarchies.values()) {
      for (const node of hierarchyNodes) {
        const nodeTokens = tokenize(node.name)
        const similarity = jaccardSimilarity(itemTokens, nodeTokens)

        if (similarity > bestBuiltIn.confidence) {
          bestBuiltIn = {
            concept: node.name,
            level: node.level,
            confidence: similarity,
          }
        }
      }
    }

    // Check level members
    for (const [level, members] of Object.entries(PROGRAMMING_LEVEL_MEMBERS)) {
      for (const member of members) {
        const memberTokens = tokenize(member)
        const similarity = jaccardSimilarity(itemTokens, memberTokens)

        if (similarity > bestBuiltIn.confidence) {
          bestBuiltIn = {
            concept: member,
            level: parseInt(level, 10),
            confidence: similarity,
          }
        }
      }
    }

    // Check prototypes using cosine similarity over feature weights
    for (const proto of this.prototypes.values()) {
      const itemWeights = new Map<string, number>()
      for (const f of itemFeatures) itemWeights.set(f, 1)
      const protoWeights = new Map<string, number>()
      for (const f of proto.features) protoWeights.set(f, 1)
      const similarity = cosineSimilarity(itemWeights, protoWeights)

      if (similarity > bestBuiltIn.confidence) {
        bestBuiltIn = {
          concept: proto.category,
          level: 2,
          confidence: similarity,
        }
      }
    }

    // If nothing matched well, use heuristic level
    if (bestBuiltIn.confidence === 0) {
      bestBuiltIn.level = this.heuristicAbstractionLevel(item)
      bestBuiltIn.confidence = 0.1
    }

    return {
      ...bestBuiltIn,
      confidence: Math.round(bestBuiltIn.confidence * 1000) / 1000,
    }
  }

  /**
   * Learn a new abstraction from concrete examples.
   *
   * Creates or updates a concept that maps the given concrete examples
   * to the abstract name, building parent-child relationships in the
   * internal concept store.
   */
  learnAbstraction(concrete: string[], abstract: string): AbstractConcept {
    // Determine the level of the abstract concept
    const concreteLevels = concrete.map(c => this.findAbstractionLevel(c))
    const maxConcreteLevel = Math.max(...concreteLevels, 0)
    const abstractLevel = Math.min(this.config.maxLevels, maxConcreteLevel + 1)

    // Extract features from the concrete examples
    const features = extractCommonFeatures(concrete, this.config.featureBoostFactor)
    const topFeatures = Array.from(features.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([term]) => term)

    // Create / update the abstract concept
    const abstractId = this.addOrUpdateConcept(abstract, {
      description: `Learned abstraction over: ${concrete.join(', ')}`,
      examples: concrete,
      abstractionLevel: abstractLevel,
      features: topFeatures,
    })

    // Create / update concrete concepts and link them as children
    const childIds: string[] = []
    for (const item of concrete) {
      const childId = this.addOrUpdateConcept(item, {
        description: item,
        examples: [],
        abstractionLevel: this.findAbstractionLevel(item),
        features: tokenize(item),
      })
      childIds.push(childId)

      // Set parent
      const childConcept = this.concepts.get(childId)
      if (childConcept) {
        childConcept.parentId = abstractId
      }
    }

    // Set children on the abstract concept
    const abstractConcept = this.concepts.get(abstractId)!
    const existingChildren = new Set(abstractConcept.children)
    for (const cid of childIds) {
      if (!existingChildren.has(cid)) {
        abstractConcept.children.push(cid)
      }
    }

    this.abstractionsMade++
    return { ...abstractConcept }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PUBLIC API — Concept Management
  // ══════════════════════════════════════════════════════════════════════════════

  /** Get a stored concept by its ID. */
  getConcept(id: string): AbstractConcept | undefined {
    const concept = this.concepts.get(id)
    if (concept) {
      concept.accessCount++
    }
    return concept
  }

  /** Find a stored concept by name (case insensitive). */
  findConceptByName(name: string): AbstractConcept | undefined {
    const normalized = normalizeName(name)
    const id = this.nameIndex.get(normalized)
    if (id) return this.getConcept(id)
    return undefined
  }

  /** Get all stored prototypes. */
  getPrototypes(): PrototypeEntry[] {
    return Array.from(this.prototypes.values())
  }

  /** Get all stored abstraction mappings. */
  getMappings(): AbstractionMapping[] {
    return [...this.mappings]
  }

  /** Get all stored concepts. */
  getAllConcepts(): AbstractConcept[] {
    return Array.from(this.concepts.values())
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PUBLIC API — Statistics & Persistence
  // ══════════════════════════════════════════════════════════════════════════════

  /** Get current engine statistics. */
  getStats(): AbstractionEngineStats {
    let maxDepth = 0
    for (const concept of this.concepts.values()) {
      if (concept.abstractionLevel > maxDepth) {
        maxDepth = concept.abstractionLevel
      }
    }

    return {
      conceptCount: this.concepts.size,
      hierarchyDepth: maxDepth,
      abstractionsMade: this.abstractionsMade,
      generalizationsMade: this.generalizationsMade,
      specializationsMade: this.specializationsMade,
      prototypeCount: this.prototypes.size,
      learnedMappings: this.mappings.length,
    }
  }

  /** Serialize the entire engine state to a JSON string. */
  serialize(): string {
    const conceptsArray = Array.from(this.concepts.values()).map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      examples: c.examples,
      parentId: c.parentId,
      children: c.children,
      abstractionLevel: c.abstractionLevel,
      features: c.features,
      createdAt: c.createdAt,
      accessCount: c.accessCount,
    }))

    return JSON.stringify({
      version: 1,
      config: this.config,
      concepts: conceptsArray,
      prototypes: Array.from(this.prototypes.values()),
      mappings: this.mappings,
      stats: {
        abstractionsMade: this.abstractionsMade,
        generalizationsMade: this.generalizationsMade,
        specializationsMade: this.specializationsMade,
      },
    })
  }

  /** Restore an AbstractionEngine from a previously serialized JSON string. */
  static deserialize(json: string): AbstractionEngine {
    const data = JSON.parse(json) as {
      version: number
      config: AbstractionEngineConfig
      concepts: Array<{
        id: string
        name: string
        description: string
        examples: string[]
        parentId: string | null
        children: string[]
        abstractionLevel: number
        features: string[]
        createdAt: number
        accessCount: number
      }>
      prototypes: PrototypeEntry[]
      mappings: AbstractionMapping[]
      stats: {
        abstractionsMade: number
        generalizationsMade: number
        specializationsMade: number
      }
    }

    const engine = new AbstractionEngine(data.config)

    if (Array.isArray(data.concepts)) {
      for (const c of data.concepts) {
        const concept: AbstractConcept = {
          id: c.id,
          name: c.name,
          description: c.description,
          examples: c.examples ?? [],
          parentId: c.parentId ?? null,
          children: c.children ?? [],
          abstractionLevel: c.abstractionLevel ?? 1,
          features: c.features ?? [],
          createdAt: c.createdAt ?? Date.now(),
          accessCount: c.accessCount ?? 0,
        }
        engine.concepts.set(concept.id, concept)
        engine.nameIndex.set(normalizeName(concept.name), concept.id)
      }
    }

    if (Array.isArray(data.prototypes)) {
      for (const proto of data.prototypes) {
        engine.prototypes.set(proto.category, proto)
      }
    }

    if (Array.isArray(data.mappings)) {
      engine.mappings = data.mappings
    }

    if (data.stats) {
      engine.abstractionsMade = data.stats.abstractionsMade ?? 0
      engine.generalizationsMade = data.stats.generalizationsMade ?? 0
      engine.specializationsMade = data.stats.specializationsMade ?? 0
    }

    return engine
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PRIVATE — Built-in Hierarchy Initialization
  // ══════════════════════════════════════════════════════════════════════════════

  /** Load all pre-built abstraction hierarchies into the lookup table. */
  private initBuiltInHierarchies(): void {
    this.builtInHierarchies.set('programming', PROGRAMMING_ABSTRACTION_HIERARCHY)
    this.builtInHierarchies.set('design-patterns', DESIGN_PATTERN_HIERARCHY)
    this.builtInHierarchies.set('data-structures', DATA_STRUCTURE_HIERARCHY)
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PRIVATE — Concept Storage
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Add or update a concept in the internal store.
   * Returns the concept ID (existing or newly generated).
   */
  private addOrUpdateConcept(
    name: string,
    data: {
      description: string
      examples: string[]
      abstractionLevel: number
      features: string[]
    },
  ): string {
    const normalized = normalizeName(name)
    const existingId = this.nameIndex.get(normalized)

    if (existingId && this.concepts.has(existingId)) {
      const existing = this.concepts.get(existingId)!
      existing.accessCount++
      // Merge examples and features
      const exampleSet = new Set(existing.examples)
      for (const ex of data.examples) {
        if (!exampleSet.has(ex)) {
          existing.examples.push(ex)
        }
      }
      const featureSet = new Set(existing.features)
      for (const f of data.features) {
        if (!featureSet.has(f)) {
          existing.features.push(f)
        }
      }
      return existingId
    }

    // Enforce maxConcepts — evict least accessed
    if (this.concepts.size >= this.config.maxConcepts) {
      this.evictLeastAccessed()
    }

    const id = generateId()
    const concept: AbstractConcept = {
      id,
      name,
      description: data.description,
      examples: [...data.examples],
      parentId: null,
      children: [],
      abstractionLevel: data.abstractionLevel,
      features: [...data.features],
      createdAt: Date.now(),
      accessCount: 1,
    }

    this.concepts.set(id, concept)
    this.nameIndex.set(normalized, id)
    return id
  }

  /** Evict the concept with the lowest access count to make room. */
  private evictLeastAccessed(): void {
    let leastId: string | null = null
    let lowestAccess = Infinity

    for (const [id, concept] of this.concepts) {
      if (concept.accessCount < lowestAccess) {
        lowestAccess = concept.accessCount
        leastId = id
      }
    }

    if (leastId) {
      const concept = this.concepts.get(leastId)!
      this.nameIndex.delete(normalizeName(concept.name))
      this.concepts.delete(leastId)
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PRIVATE — Built-in Hierarchy Lookups
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Search built-in hierarchies for a known generalization of the given concepts.
   */
  private findBuiltInGeneralization(concepts: string[]): GeneralizationResult | null {
    const normalized = concepts.map(normalizeName)

    for (const hierarchy of this.builtInHierarchies.values()) {
      // Find matching nodes
      const matchedNodes = hierarchy.filter(node => normalized.includes(normalizeName(node.name)))

      if (matchedNodes.length < 2) continue

      // Find the lowest common ancestor by walking up parent chains
      const parentCandidates = new Map<string, number>()

      for (const node of matchedNodes) {
        for (const parentName of node.children) {
          const key = normalizeName(parentName)
          parentCandidates.set(key, (parentCandidates.get(key) ?? 0) + 1)
        }
      }

      // The parent that contains the most matched nodes is our generalization
      let bestParent: string | null = null
      let bestCount = 0

      for (const [parent, count] of parentCandidates) {
        if (count > bestCount) {
          bestCount = count
          bestParent = parent
        }
      }

      if (bestParent) {
        const parentNode = hierarchy.find(n => normalizeName(n.name) === bestParent)
        if (parentNode) {
          return {
            abstractConcept: parentNode.name,
            sharedFeatures: [parentNode.name],
            confidence: Math.round((bestCount / matchedNodes.length) * 1000) / 1000,
            inputConcepts: [...concepts],
            level: parentNode.level,
          }
        }
      }
    }

    // Check programming level members
    const levelMatches = new Map<number, string[]>()
    for (const concept of concepts) {
      const norm = normalizeName(concept)
      for (const [level, members] of Object.entries(PROGRAMMING_LEVEL_MEMBERS)) {
        if (members.map(normalizeName).includes(norm)) {
          const lvl = parseInt(level, 10)
          if (!levelMatches.has(lvl)) levelMatches.set(lvl, [])
          levelMatches.get(lvl)!.push(concept)
        }
      }
    }

    // If all concepts are at the same level, their generalization is one level up
    for (const [level, matched] of levelMatches) {
      if (matched.length >= 2) {
        const parentLevel = level + 1
        const parentNode = PROGRAMMING_ABSTRACTION_HIERARCHY.find(n => n.level === parentLevel)
        if (parentNode) {
          return {
            abstractConcept: parentNode.name,
            sharedFeatures: [`level ${level} languages`],
            confidence: Math.round((matched.length / concepts.length) * 1000) / 1000,
            inputConcepts: [...concepts],
            level: parentLevel,
          }
        }
      }
    }

    return null
  }

  /** Get members at a given level from the programming hierarchy. */
  private getLevelMembers(level: number): string[] {
    return PROGRAMMING_LEVEL_MEMBERS[level] ?? []
  }

  /**
   * Walk up the built-in hierarchies to generalize a concept to a target level.
   */
  private generalizeToLevel(normalized: string, fromLevel: number, toLevel: number): string {
    // Try built-in hierarchies
    for (const hierarchy of this.builtInHierarchies.values()) {
      let current = normalized
      let currentLevel = fromLevel

      while (currentLevel < toLevel) {
        const node = hierarchy.find(n => normalizeName(n.name) === current)
        if (node && node.children.length > 0) {
          current = normalizeName(node.children[0])
          currentLevel++
        } else {
          // Try to find a parent at the next level
          const nextLevelNode = hierarchy.find(n => n.level === currentLevel + 1)
          if (nextLevelNode) {
            return nextLevelNode.name
          }
          break
        }
      }

      if (currentLevel === toLevel) {
        // Find the actual name
        const found = hierarchy.find(n => normalizeName(n.name) === current)
        if (found) return found.name
      }
    }

    // Fall back to learned concepts
    const currentId = this.nameIndex.get(normalized)
    if (currentId) {
      let concept = this.concepts.get(currentId)
      while (concept && concept.abstractionLevel < toLevel && concept.parentId) {
        const parent = this.concepts.get(concept.parentId)
        if (parent && parent.abstractionLevel <= toLevel) {
          concept = parent
          if (concept.abstractionLevel === toLevel) return concept.name
        } else {
          break
        }
      }
      if (concept && concept.parentId) {
        const parent = this.concepts.get(concept.parentId)
        if (parent) return parent.name
      }
    }

    return normalized
  }

  /**
   * Walk down the built-in hierarchies to specialize a concept to a target level.
   */
  private specializeToLevel(normalized: string, fromLevel: number, toLevel: number): string {
    // Try built-in hierarchies
    for (const hierarchy of this.builtInHierarchies.values()) {
      const node = hierarchy.find(n => normalizeName(n.name) === normalized)
      if (!node) continue

      // Find a child at the target level
      let currentLevel = fromLevel
      let candidates = [normalized]

      while (currentLevel > toLevel && candidates.length > 0) {
        const nextCandidates: string[] = []
        for (const candidate of candidates) {
          // Find nodes whose children include this candidate
          for (const child of hierarchy) {
            if (child.children.map(normalizeName).includes(candidate)) {
              nextCandidates.push(normalizeName(child.name))
            }
          }
        }
        if (nextCandidates.length > 0) {
          candidates = nextCandidates
          currentLevel--
        } else {
          // Try level members
          const members = this.getLevelMembers(currentLevel - 1)
          if (members.length > 0) return members[0]
          break
        }
      }

      if (currentLevel === toLevel && candidates.length > 0) {
        const found = hierarchy.find(n => normalizeName(n.name) === candidates[0])
        if (found) return found.name
        return candidates[0]
      }
    }

    // Fall back to learned concepts
    const conceptId = this.nameIndex.get(normalized)
    if (conceptId) {
      const concept = this.concepts.get(conceptId)
      if (concept && concept.children.length > 0) {
        const child = this.concepts.get(concept.children[0])
        if (child) return child.name
      }
    }

    return normalized
  }

  /**
   * Heuristic to guess abstraction level from a concept's name.
   *
   * Concrete concepts tend to be specific named things (proper nouns,
   * versioned names, specific tools). Abstract concepts tend to be
   * short generic nouns or noun phrases.
   */
  private heuristicAbstractionLevel(concept: string): number {
    const lower = concept.toLowerCase()
    const tokens = tokenize(concept)

    // Very abstract indicators
    const abstractIndicators = [
      'concept',
      'principle',
      'paradigm',
      'theory',
      'philosophy',
      'methodology',
      'approach',
      'pattern',
      'architecture',
      'abstraction',
    ]
    if (abstractIndicators.some(ind => lower.includes(ind))) {
      return Math.min(this.config.maxLevels, 5)
    }

    // Category-level indicators
    const categoryIndicators = [
      'type',
      'kind',
      'class',
      'category',
      'family',
      'group',
      'structure',
      'system',
      'framework',
      'model',
    ]
    if (categoryIndicators.some(ind => lower.includes(ind))) {
      return 4
    }

    // Mid-level indicators
    const midIndicators = [
      'language',
      'protocol',
      'standard',
      'format',
      'technique',
      'algorithm',
      'method',
      'strategy',
      'process',
    ]
    if (midIndicators.some(ind => lower.includes(ind))) {
      return 3
    }

    // Specific/concrete indicators — proper nouns, version numbers
    if (/[A-Z]/.test(concept[0]) && tokens.length <= 2) {
      return 2
    }
    if (/\d/.test(concept) || /v\d/i.test(concept)) {
      return 1
    }

    // Default to mid-level
    return 2
  }

  /**
   * Synthesize a root name for a hierarchy from the concepts it covers.
   */
  private synthesizeRootName(concepts: string[]): string {
    const commonTokens = findCommonTokens(concepts)
    if (commonTokens.length > 0) {
      return commonTokens.slice(0, 2).join(' ') + ' concepts'
    }

    // Try to find a domain from built-in hierarchies
    for (const concept of concepts) {
      const normalized = normalizeName(concept)
      for (const [domain, hierarchy] of this.builtInHierarchies) {
        for (const node of hierarchy) {
          if (normalizeName(node.name) === normalized) {
            return `${domain} concepts`
          }
        }
      }
      for (const members of Object.values(PROGRAMMING_LEVEL_MEMBERS)) {
        if (members.map(normalizeName).includes(normalized)) {
          return 'programming concepts'
        }
      }
    }

    return 'abstract concept'
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §5  PRE-BUILT ENGINE — Ready-to-use engine with programming knowledge      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Creates an AbstractionEngine pre-loaded with programming language
 * hierarchies, design pattern abstractions, and data structure taxonomies.
 */
export function createProgrammingAbstractionEngine(
  config?: Partial<AbstractionEngineConfig>,
): AbstractionEngine {
  const engine = new AbstractionEngine(config)

  // ── Programming Language Abstractions ──────────────────────────────────────

  engine.learnAbstraction(['binary', 'opcodes', 'machine instructions'], 'machine code')

  engine.learnAbstraction(['x86 assembly', 'ARM assembly', 'MIPS assembly'], 'assembly language')

  engine.learnAbstraction(['C', 'C++', 'Rust'], 'low-level language')

  engine.learnAbstraction(
    ['Python', 'JavaScript', 'TypeScript', 'Ruby', 'Java'],
    'high-level language',
  )

  engine.learnAbstraction(['SQL', 'HTML', 'CSS', 'Prolog', 'Haskell'], 'declarative programming')

  engine.learnAbstraction(['Scratch', 'Blockly', 'LabVIEW'], 'visual programming')

  // ── Design Pattern Abstractions ────────────────────────────────────────────

  engine.learnAbstraction(
    ['factory pattern', 'singleton pattern', 'builder pattern', 'prototype pattern'],
    'creational pattern',
  )

  engine.learnAbstraction(
    ['adapter pattern', 'decorator pattern', 'facade pattern', 'proxy pattern'],
    'structural pattern',
  )

  engine.learnAbstraction(
    ['observer pattern', 'strategy pattern', 'command pattern', 'iterator pattern'],
    'behavioral pattern',
  )

  engine.learnAbstraction(
    ['creational pattern', 'structural pattern', 'behavioral pattern'],
    'design pattern',
  )

  // ── Data Structure Abstractions ────────────────────────────────────────────

  engine.learnAbstraction(['array', 'linked list', 'stack', 'queue'], 'linear structure')

  engine.learnAbstraction(['binary tree', 'b-tree', 'trie', 'heap'], 'tree structure')

  engine.learnAbstraction(['directed graph', 'undirected graph'], 'graph structure')

  engine.learnAbstraction(['hash map', 'hash set'], 'hash structure')

  engine.learnAbstraction(
    ['linear structure', 'tree structure', 'graph structure', 'hash structure'],
    'data structure',
  )

  // ── Software Engineering Concepts ──────────────────────────────────────────

  engine.learnAbstraction(
    ['unit testing', 'integration testing', 'end-to-end testing'],
    'software testing',
  )

  engine.learnAbstraction(['git', 'svn', 'mercurial'], 'version control')

  engine.learnAbstraction(['Docker', 'Kubernetes', 'Podman'], 'containerization')

  engine.learnAbstraction(['REST', 'GraphQL', 'gRPC', 'WebSocket'], 'API protocol')

  engine.learnAbstraction(
    ['design pattern', 'software testing', 'version control', 'API protocol'],
    'software engineering concept',
  )

  return engine
}
