/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Semantic Memory — Persistent Semantic Knowledge Graph                       ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Concept Nodes — Named concepts with domain, embedding, attributes       ║
 * ║    ✦ Weighted Edges — Typed relationships (is-a, part-of, used-with, etc.)   ║
 * ║    ✦ Spreading Activation — Graph traversal beyond cosine similarity         ║
 * ║    ✦ Concept Clustering — Auto-group related concepts                        ║
 * ║    ✦ Relationship Extraction — NLP pattern matching from conversations       ║
 * ║    ✦ Persistence — Full serialize / deserialize for long-term memory         ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES — All data shapes for the knowledge graph                        ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Relation Types ───────────────────────────────────────────────────────────

export type RelationType =
  | 'is-a'
  | 'part-of'
  | 'related-to'
  | 'used-with'
  | 'depends-on'
  | 'similar-to'
  | 'opposite-of'
  | 'instance-of'

// ── Concept Node ─────────────────────────────────────────────────────────────

export interface ConceptNode {
  id: string
  name: string
  domain: string
  embedding: number[]
  attributes: Map<string, string>
  createdAt: number
  accessCount: number
  decayedRelevance: number
}

// ── Concept Edge ─────────────────────────────────────────────────────────────

export interface ConceptEdge {
  source: string
  target: string
  relation: RelationType
  weight: number
  evidence: number
  createdAt: number
}

// ── Configuration ────────────────────────────────────────────────────────────

export interface SemanticMemoryConfig {
  maxNodes: number
  maxEdgesPerNode: number
  activationDecay: number
  activationThreshold: number
  relevanceDecayRate: number
}

// ── Stats ────────────────────────────────────────────────────────────────────

export interface SemanticMemoryStats {
  nodeCount: number
  edgeCount: number
  domains: string[]
  avgEdgesPerNode: number
}

// ── Activation Result ────────────────────────────────────────────────────────

export interface ActivationResult {
  conceptId: string
  name: string
  activation: number
}

// ── Cluster Result ───────────────────────────────────────────────────────────

export interface ConceptCluster {
  id: number
  members: string[]
}

// ── Neighborhood Result ──────────────────────────────────────────────────────

export interface Neighborhood {
  nodes: ConceptNode[]
  edges: ConceptEdge[]
}

// ── Extracted Relationship ───────────────────────────────────────────────────

export interface ExtractedRelationship {
  sourceName: string
  targetName: string
  relation: RelationType
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  HELPERS — Tokenization, normalization, pattern matching                ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

let _idCounter = 0

function generateId(): string {
  _idCounter += 1
  return `c_${Date.now().toString(36)}_${_idCounter.toString(36)}`
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Split text into lowercase alphanumeric tokens. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-_.#+]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0)
}

// ── Relationship extraction patterns ─────────────────────────────────────────

interface ExtractionPattern {
  regex: RegExp
  relation: RelationType
  sourceGroup: number
  targetGroup: number
}

const EXTRACTION_PATTERNS: ExtractionPattern[] = [
  // "X is a type of Y" / "X is a kind of Y"
  {
    regex: /(\b[\w\s#+.]+)\s+is\s+a\s+(?:type|kind|form)\s+of\s+([\w\s#+.]+)/gi,
    relation: 'is-a',
    sourceGroup: 1,
    targetGroup: 2,
  },
  // "X is a Y" (simple is-a)
  {
    regex: /(\b[\w#+.]+)\s+is\s+an?\s+([\w#+.]+)/gi,
    relation: 'is-a',
    sourceGroup: 1,
    targetGroup: 2,
  },
  // "X uses Y" / "X is used with Y"
  {
    regex: /(\b[\w#+.]+)\s+(?:uses|is\s+used\s+with)\s+([\w#+.]+)/gi,
    relation: 'used-with',
    sourceGroup: 1,
    targetGroup: 2,
  },
  // "X depends on Y" / "X relies on Y"
  {
    regex: /(\b[\w#+.]+)\s+(?:depends\s+on|relies\s+on|requires)\s+([\w#+.]+)/gi,
    relation: 'depends-on',
    sourceGroup: 1,
    targetGroup: 2,
  },
  // "X is part of Y" / "X belongs to Y"
  {
    regex: /(\b[\w#+.]+)\s+(?:is\s+part\s+of|belongs\s+to)\s+([\w#+.]+)/gi,
    relation: 'part-of',
    sourceGroup: 1,
    targetGroup: 2,
  },
  // "X is similar to Y" / "X is like Y"
  {
    regex: /(\b[\w#+.]+)\s+is\s+(?:similar\s+to|like)\s+([\w#+.]+)/gi,
    relation: 'similar-to',
    sourceGroup: 1,
    targetGroup: 2,
  },
  // "X is the opposite of Y" / "X is unlike Y"
  {
    regex: /(\b[\w#+.]+)\s+is\s+(?:the\s+opposite\s+of|unlike|contrary\s+to)\s+([\w#+.]+)/gi,
    relation: 'opposite-of',
    sourceGroup: 1,
    targetGroup: 2,
  },
  // "X is related to Y" / "X relates to Y"
  {
    regex: /(\b[\w#+.]+)\s+(?:is\s+related\s+to|relates\s+to)\s+([\w#+.]+)/gi,
    relation: 'related-to',
    sourceGroup: 1,
    targetGroup: 2,
  },
  // "X is an instance of Y"
  {
    regex: /(\b[\w#+.]+)\s+is\s+an?\s+instance\s+of\s+([\w#+.]+)/gi,
    relation: 'instance-of',
    sourceGroup: 1,
    targetGroup: 2,
  },
  // "X extends Y" / "X inherits from Y"
  {
    regex: /(\b[\w#+.]+)\s+(?:extends|inherits\s+from|derives\s+from)\s+([\w#+.]+)/gi,
    relation: 'is-a',
    sourceGroup: 1,
    targetGroup: 2,
  },
  // "X contains Y" / "X includes Y"
  {
    regex: /(\b[\w#+.]+)\s+(?:contains|includes|has)\s+([\w#+.]+)/gi,
    relation: 'part-of',
    sourceGroup: 2,
    targetGroup: 1,
  },
  // "X works with Y" / "X integrates with Y"
  {
    regex: /(\b[\w#+.]+)\s+(?:works\s+with|integrates\s+with|pairs\s+with)\s+([\w#+.]+)/gi,
    relation: 'used-with',
    sourceGroup: 1,
    targetGroup: 2,
  },
]

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  SEMANTIC MEMORY CLASS — The knowledge graph                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

const DEFAULT_CONFIG: SemanticMemoryConfig = {
  maxNodes: 5000,
  maxEdgesPerNode: 50,
  activationDecay: 0.85,
  activationThreshold: 0.1,
  relevanceDecayRate: 0.01,
}

export class SemanticMemory {
  private nodes: Map<string, ConceptNode> = new Map()
  private edges: ConceptEdge[] = []
  private nameIndex: Map<string, string> = new Map() // normalized name → id
  private config: SemanticMemoryConfig

  constructor(config: Partial<SemanticMemoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // NODE OPERATIONS
  // ══════════════════════════════════════════════════════════════════════════════

  addConcept(name: string, domain: string, embedding?: number[]): string {
    const normalized = normalizeName(name)
    if (normalized.length === 0) {
      throw new Error('Concept name must not be empty')
    }

    // Return existing if duplicate name
    const existingId = this.nameIndex.get(normalized)
    if (existingId && this.nodes.has(existingId)) {
      const existing = this.nodes.get(existingId)!
      existing.accessCount += 1
      existing.decayedRelevance = 1.0
      return existingId
    }

    // Enforce maxNodes — evict least relevant
    if (this.nodes.size >= this.config.maxNodes) {
      this.evictLeastRelevant()
    }

    const id = generateId()
    const node: ConceptNode = {
      id,
      name,
      domain: domain.toLowerCase(),
      embedding: embedding ?? [],
      attributes: new Map(),
      createdAt: Date.now(),
      accessCount: 1,
      decayedRelevance: 1.0,
    }

    this.nodes.set(id, node)
    this.nameIndex.set(normalized, id)
    return id
  }

  getConcept(id: string): ConceptNode | undefined {
    const node = this.nodes.get(id)
    if (node) {
      node.accessCount += 1
      node.decayedRelevance = 1.0
    }
    return node
  }

  findConceptByName(name: string): ConceptNode | undefined {
    const normalized = normalizeName(name)
    const id = this.nameIndex.get(normalized)
    if (id) {
      return this.getConcept(id)
    }
    return undefined
  }

  removeConcept(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false

    // Remove from name index
    const normalized = normalizeName(node.name)
    this.nameIndex.delete(normalized)

    // Remove all edges touching this node
    this.edges = this.edges.filter(e => e.source !== id && e.target !== id)

    // Remove node
    this.nodes.delete(id)
    return true
  }

  getConceptsByDomain(domain: string): ConceptNode[] {
    const normalized = domain.toLowerCase()
    const results: ConceptNode[] = []
    for (const node of this.nodes.values()) {
      if (node.domain === normalized) {
        results.push(node)
      }
    }
    return results
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // EDGE OPERATIONS
  // ══════════════════════════════════════════════════════════════════════════════

  addRelation(
    sourceId: string,
    targetId: string,
    relation: RelationType,
    weight = 0.5,
  ): ConceptEdge | undefined {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) return undefined
    if (sourceId === targetId) return undefined

    const clampedWeight = Math.max(0, Math.min(1, weight))

    // Strengthen existing edge if it already exists
    const existing = this.edges.find(
      e => e.source === sourceId && e.target === targetId && e.relation === relation,
    )
    if (existing) {
      existing.evidence += 1
      existing.weight = Math.min(1, existing.weight + 0.05)
      return existing
    }

    // Enforce maxEdgesPerNode
    const sourceEdgeCount = this.edges.filter(e => e.source === sourceId).length
    if (sourceEdgeCount >= this.config.maxEdgesPerNode) {
      // Remove weakest edge from this source
      let weakestIdx = -1
      let weakestWeight = Infinity
      for (let i = 0; i < this.edges.length; i++) {
        if (this.edges[i].source === sourceId && this.edges[i].weight < weakestWeight) {
          weakestWeight = this.edges[i].weight
          weakestIdx = i
        }
      }
      if (weakestIdx >= 0) {
        this.edges.splice(weakestIdx, 1)
      }
    }

    const edge: ConceptEdge = {
      source: sourceId,
      target: targetId,
      relation,
      weight: clampedWeight,
      evidence: 1,
      createdAt: Date.now(),
    }

    this.edges.push(edge)
    return edge
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SPREADING ACTIVATION
  // ══════════════════════════════════════════════════════════════════════════════

  spreadingActivation(startIds: string[], maxDepth = 3, topK = 10): ActivationResult[] {
    const activation: Map<string, number> = new Map()

    // Initialize seed nodes
    for (const id of startIds) {
      if (this.nodes.has(id)) {
        activation.set(id, 1.0)
      }
    }

    // Propagate activation through the graph
    for (let depth = 0; depth < maxDepth; depth++) {
      const nextActivation: Map<string, number> = new Map()

      for (const [nodeId, currentActivation] of activation) {
        if (currentActivation < this.config.activationThreshold) continue

        // Find all outgoing and incoming edges for this node
        const neighbors = this.getEdgesForNode(nodeId)

        for (const edge of neighbors) {
          const neighborId = edge.source === nodeId ? edge.target : edge.source
          const propagated = currentActivation * edge.weight * this.config.activationDecay

          if (propagated >= this.config.activationThreshold) {
            const prev = nextActivation.get(neighborId) ?? activation.get(neighborId) ?? 0
            nextActivation.set(neighborId, Math.max(prev, propagated))
          }
        }
      }

      // Merge next activation into current
      for (const [nodeId, value] of nextActivation) {
        const current = activation.get(nodeId) ?? 0
        activation.set(nodeId, Math.max(current, value))
      }

      // Stop early if no new activations
      if (nextActivation.size === 0) break
    }

    // Sort by activation and return top-K
    const results: ActivationResult[] = []
    for (const [conceptId, act] of activation) {
      const node = this.nodes.get(conceptId)
      if (node) {
        results.push({ conceptId, name: node.name, activation: act })
      }
    }

    return results.sort((a, b) => b.activation - a.activation).slice(0, topK)
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // RELATIONSHIP QUERIES
  // ══════════════════════════════════════════════════════════════════════════════

  findRelated(conceptId: string, relation?: RelationType, limit = 10): ConceptNode[] {
    const edges = this.getEdgesForNode(conceptId)

    const filtered = relation ? edges.filter(e => e.relation === relation) : edges

    const neighborIds = filtered
      .sort((a, b) => b.weight - a.weight)
      .map(e => (e.source === conceptId ? e.target : e.source))
      .slice(0, limit)

    const results: ConceptNode[] = []
    for (const id of neighborIds) {
      const node = this.nodes.get(id)
      if (node) results.push(node)
    }
    return results
  }

  getNeighborhood(conceptId: string, depth = 1): Neighborhood {
    const visitedNodes = new Set<string>()
    const resultEdges: ConceptEdge[] = []
    const frontier = new Set<string>([conceptId])

    for (let d = 0; d < depth; d++) {
      const nextFrontier = new Set<string>()

      for (const nodeId of frontier) {
        if (visitedNodes.has(nodeId)) continue
        visitedNodes.add(nodeId)

        const edges = this.getEdgesForNode(nodeId)
        for (const edge of edges) {
          resultEdges.push(edge)
          const neighborId = edge.source === nodeId ? edge.target : edge.source
          if (!visitedNodes.has(neighborId)) {
            nextFrontier.add(neighborId)
          }
        }
      }

      frontier.clear()
      for (const id of nextFrontier) frontier.add(id)
    }

    // Include final frontier nodes
    for (const id of frontier) visitedNodes.add(id)

    const nodes: ConceptNode[] = []
    for (const id of visitedNodes) {
      const node = this.nodes.get(id)
      if (node) nodes.push(node)
    }

    // Deduplicate edges
    const edgeSet = new Set<string>()
    const uniqueEdges: ConceptEdge[] = []
    for (const edge of resultEdges) {
      const key = `${edge.source}:${edge.target}:${edge.relation}`
      if (!edgeSet.has(key)) {
        edgeSet.add(key)
        uniqueEdges.push(edge)
      }
    }

    return { nodes, edges: uniqueEdges }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CONCEPT CLUSTERING
  // ══════════════════════════════════════════════════════════════════════════════

  clusterConcepts(k = 5): ConceptCluster[] {
    const nodeIds = Array.from(this.nodes.keys())
    if (nodeIds.length === 0) return []

    const effectiveK = Math.min(k, nodeIds.length)

    // Build adjacency vectors for each node (how strongly connected to each other)
    const adjacency: Map<string, Map<string, number>> = new Map()
    for (const id of nodeIds) {
      adjacency.set(id, new Map())
    }

    for (const edge of this.edges) {
      const sourceAdj = adjacency.get(edge.source)
      const targetAdj = adjacency.get(edge.target)
      if (sourceAdj) sourceAdj.set(edge.target, (sourceAdj.get(edge.target) ?? 0) + edge.weight)
      if (targetAdj) targetAdj.set(edge.source, (targetAdj.get(edge.source) ?? 0) + edge.weight)
    }

    // Initialize cluster assignments randomly but deterministically
    const assignments = new Map<string, number>()
    for (let i = 0; i < nodeIds.length; i++) {
      assignments.set(nodeIds[i], i % effectiveK)
    }

    // Iterative refinement (simplified k-means on adjacency)
    const MAX_ITERATIONS = 20
    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      let changed = false

      for (const nodeId of nodeIds) {
        const nodeAdj = adjacency.get(nodeId)!

        // Score for each cluster = sum of adjacency weights to cluster members
        const clusterScores = new Array<number>(effectiveK).fill(0)
        for (const [neighborId, weight] of nodeAdj) {
          const neighborCluster = assignments.get(neighborId)
          if (neighborCluster !== undefined) {
            clusterScores[neighborCluster] += weight
          }
        }

        // Assign to cluster with highest score
        let bestCluster = assignments.get(nodeId)!
        let bestScore = clusterScores[bestCluster]
        for (let c = 0; c < effectiveK; c++) {
          if (clusterScores[c] > bestScore) {
            bestScore = clusterScores[c]
            bestCluster = c
          }
        }

        if (bestCluster !== assignments.get(nodeId)) {
          assignments.set(nodeId, bestCluster)
          changed = true
        }
      }

      if (!changed) break
    }

    // Build cluster result
    const clusterMap = new Map<number, string[]>()
    for (const [nodeId, cluster] of assignments) {
      const members = clusterMap.get(cluster) ?? []
      members.push(nodeId)
      clusterMap.set(cluster, members)
    }

    const clusters: ConceptCluster[] = []
    for (const [id, members] of clusterMap) {
      if (members.length > 0) {
        clusters.push({ id, members })
      }
    }

    return clusters.sort((a, b) => b.members.length - a.members.length)
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // RELATIONSHIP EXTRACTION
  // ══════════════════════════════════════════════════════════════════════════════

  extractRelationships(text: string): ExtractedRelationship[] {
    const results: ExtractedRelationship[] = []
    const seen = new Set<string>()

    for (const pattern of EXTRACTION_PATTERNS) {
      // Reset regex state for global patterns
      pattern.regex.lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = pattern.regex.exec(text)) !== null) {
        const sourceName = match[pattern.sourceGroup]?.trim()
        const targetName = match[pattern.targetGroup]?.trim()

        if (!sourceName || !targetName) continue
        if (sourceName.length > 50 || targetName.length > 50) continue

        // Filter out noise words
        const noiseWords = new Set([
          'the',
          'a',
          'an',
          'this',
          'that',
          'it',
          'they',
          'we',
          'i',
          'you',
          'very',
          'really',
          'also',
          'just',
          'even',
          'still',
          'much',
          'more',
        ])
        if (noiseWords.has(sourceName.toLowerCase()) || noiseWords.has(targetName.toLowerCase())) {
          continue
        }

        const key = `${normalizeName(sourceName)}:${normalizeName(targetName)}:${pattern.relation}`
        if (!seen.has(key)) {
          seen.add(key)
          results.push({
            sourceName: sourceName.trim(),
            targetName: targetName.trim(),
            relation: pattern.relation,
          })
        }
      }
    }

    return results
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // STATS & MAINTENANCE
  // ══════════════════════════════════════════════════════════════════════════════

  getStats(): SemanticMemoryStats {
    const domains = new Set<string>()
    for (const node of this.nodes.values()) {
      domains.add(node.domain)
    }

    const nodeCount = this.nodes.size
    const edgeCount = this.edges.length

    return {
      nodeCount,
      edgeCount,
      domains: Array.from(domains).sort(),
      avgEdgesPerNode: nodeCount > 0 ? edgeCount / nodeCount : 0,
    }
  }

  pruneStale(maxAge: number): number {
    const now = Date.now()
    const staleIds: string[] = []

    for (const [id, node] of this.nodes) {
      const age = now - node.createdAt
      if (age > maxAge && node.accessCount <= 1) {
        staleIds.push(id)
      }
    }

    for (const id of staleIds) {
      this.removeConcept(id)
    }

    return staleIds.length
  }

  /**
   * Decay relevance of all concepts. Call periodically (e.g., each turn).
   */
  decayAll(): void {
    for (const node of this.nodes.values()) {
      node.decayedRelevance = Math.max(0, node.decayedRelevance - this.config.relevanceDecayRate)
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // SERIALIZATION
  // ══════════════════════════════════════════════════════════════════════════════

  serialize(): string {
    const nodesArray: Array<{
      id: string
      name: string
      domain: string
      embedding: number[]
      attributes: Record<string, string>
      createdAt: number
      accessCount: number
      decayedRelevance: number
    }> = []

    for (const node of this.nodes.values()) {
      nodesArray.push({
        id: node.id,
        name: node.name,
        domain: node.domain,
        embedding: node.embedding,
        attributes: Object.fromEntries(node.attributes),
        createdAt: node.createdAt,
        accessCount: node.accessCount,
        decayedRelevance: node.decayedRelevance,
      })
    }

    return JSON.stringify({
      version: 1,
      config: this.config,
      nodes: nodesArray,
      edges: this.edges,
    })
  }

  static deserialize(json: string): SemanticMemory {
    const data = JSON.parse(json)
    const memory = new SemanticMemory(data.config ?? {})

    for (const n of data.nodes ?? []) {
      const node: ConceptNode = {
        id: n.id,
        name: n.name,
        domain: n.domain,
        embedding: n.embedding ?? [],
        attributes: new Map(Object.entries(n.attributes ?? {})),
        createdAt: n.createdAt,
        accessCount: n.accessCount ?? 0,
        decayedRelevance: n.decayedRelevance ?? 1.0,
      }
      memory.nodes.set(node.id, node)
      memory.nameIndex.set(normalizeName(node.name), node.id)
    }

    memory.edges = data.edges ?? []
    return memory
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MERGE
  // ══════════════════════════════════════════════════════════════════════════════

  mergeFrom(other: SemanticMemory): void {
    // Merge nodes — deduplicate by name
    const idMapping = new Map<string, string>() // other.id → this.id

    for (const otherNode of other.nodes.values()) {
      const existing = this.findConceptByName(otherNode.name)
      if (existing) {
        // Merge attributes and bump access count
        for (const [key, value] of otherNode.attributes) {
          existing.attributes.set(key, value)
        }
        existing.accessCount += otherNode.accessCount
        existing.decayedRelevance = Math.max(existing.decayedRelevance, otherNode.decayedRelevance)
        idMapping.set(otherNode.id, existing.id)
      } else {
        const newId = this.addConcept(otherNode.name, otherNode.domain, otherNode.embedding)
        const newNode = this.nodes.get(newId)
        if (newNode) {
          for (const [key, value] of otherNode.attributes) {
            newNode.attributes.set(key, value)
          }
          newNode.accessCount = otherNode.accessCount
          newNode.decayedRelevance = otherNode.decayedRelevance
        }
        idMapping.set(otherNode.id, newId)
      }
    }

    // Merge edges with id remapping
    for (const edge of other.edges) {
      const mappedSource = idMapping.get(edge.source)
      const mappedTarget = idMapping.get(edge.target)
      if (mappedSource && mappedTarget) {
        this.addRelation(mappedSource, mappedTarget, edge.relation, edge.weight)
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ══════════════════════════════════════════════════════════════════════════════

  private getEdgesForNode(nodeId: string): ConceptEdge[] {
    return this.edges.filter(e => e.source === nodeId || e.target === nodeId)
  }

  private evictLeastRelevant(): void {
    let leastRelevantId: string | null = null
    let lowestScore = Infinity

    for (const [id, node] of this.nodes) {
      const score = node.decayedRelevance * (1 + Math.log(1 + node.accessCount))
      if (score < lowestScore) {
        lowestScore = score
        leastRelevantId = id
      }
    }

    if (leastRelevantId) {
      this.removeConcept(leastRelevantId)
    }
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4  PRE-BUILT KNOWLEDGE GRAPH — Programming concepts & relationships       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Creates a SemanticMemory pre-loaded with ~80 programming concept nodes
 * and meaningful relationships between them.
 */
export function createProgrammingKnowledgeGraph(
  config?: Partial<SemanticMemoryConfig>,
): SemanticMemory {
  const memory = new SemanticMemory(config)

  // ── Languages ──────────────────────────────────────────────────────────────

  const javascript = memory.addConcept('JavaScript', 'language')
  const typescript = memory.addConcept('TypeScript', 'language')
  const python = memory.addConcept('Python', 'language')
  const rust = memory.addConcept('Rust', 'language')
  const go = memory.addConcept('Go', 'language')
  const java = memory.addConcept('Java', 'language')
  const cpp = memory.addConcept('C++', 'language')
  const ruby = memory.addConcept('Ruby', 'language')
  const csharp = memory.addConcept('C#', 'language')
  const swift = memory.addConcept('Swift', 'language')
  const kotlin = memory.addConcept('Kotlin', 'language')
  const php = memory.addConcept('PHP', 'language')
  const sql = memory.addConcept('SQL', 'language')
  const html = memory.addConcept('HTML', 'language')
  const css = memory.addConcept('CSS', 'language')

  // ── Frameworks ─────────────────────────────────────────────────────────────

  const react = memory.addConcept('React', 'framework')
  const vue = memory.addConcept('Vue', 'framework')
  const angular = memory.addConcept('Angular', 'framework')
  const express = memory.addConcept('Express', 'framework')
  const nextjs = memory.addConcept('Next.js', 'framework')
  const django = memory.addConcept('Django', 'framework')
  const flask = memory.addConcept('Flask', 'framework')
  const spring = memory.addConcept('Spring', 'framework')
  const rails = memory.addConcept('Rails', 'framework')
  const svelte = memory.addConcept('Svelte', 'framework')
  const fastapi = memory.addConcept('FastAPI', 'framework')
  const nestjs = memory.addConcept('NestJS', 'framework')

  // ── Core Concepts ──────────────────────────────────────────────────────────

  const func = memory.addConcept('function', 'concept')
  const cls = memory.addConcept('class', 'concept')
  const variable = memory.addConcept('variable', 'concept')
  const loop = memory.addConcept('loop', 'concept')
  const recursion = memory.addConcept('recursion', 'concept')
  const asyncConcept = memory.addConcept('async', 'concept')
  const promise = memory.addConcept('promise', 'concept')
  const callback = memory.addConcept('callback', 'concept')
  const closure = memory.addConcept('closure', 'concept')
  const inheritance = memory.addConcept('inheritance', 'concept')
  const polymorphism = memory.addConcept('polymorphism', 'concept')
  const encapsulation = memory.addConcept('encapsulation', 'concept')
  const abstraction = memory.addConcept('abstraction', 'concept')
  const generics = memory.addConcept('generics', 'concept')
  const typeSafety = memory.addConcept('type safety', 'concept')
  const immutability = memory.addConcept('immutability', 'concept')
  const concurrency = memory.addConcept('concurrency', 'concept')
  const memoryManagement = memory.addConcept('memory management', 'concept')
  const garbageCollection = memory.addConcept('garbage collection', 'concept')
  const eventLoop = memory.addConcept('event loop', 'concept')
  const api = memory.addConcept('API', 'concept')
  const restApi = memory.addConcept('REST API', 'concept')
  const graphql = memory.addConcept('GraphQL', 'concept')
  const middleware = memory.addConcept('middleware', 'concept')
  const component = memory.addConcept('component', 'concept')
  const state = memory.addConcept('state management', 'concept')
  const testing = memory.addConcept('testing', 'concept')
  const unitTest = memory.addConcept('unit test', 'concept')
  const integration = memory.addConcept('integration test', 'concept')

  // ── Design Patterns ────────────────────────────────────────────────────────

  const mvc = memory.addConcept('MVC', 'pattern')
  const observer = memory.addConcept('observer pattern', 'pattern')
  const singleton = memory.addConcept('singleton pattern', 'pattern')
  const factory = memory.addConcept('factory pattern', 'pattern')
  const strategy = memory.addConcept('strategy pattern', 'pattern')
  const decorator = memory.addConcept('decorator pattern', 'pattern')
  const repository = memory.addConcept('repository pattern', 'pattern')
  const dependency = memory.addConcept('dependency injection', 'pattern')

  // ── DevOps & Tools ─────────────────────────────────────────────────────────

  const docker = memory.addConcept('Docker', 'devops')
  const kubernetes = memory.addConcept('Kubernetes', 'devops')
  const cicd = memory.addConcept('CI/CD', 'devops')
  const git = memory.addConcept('Git', 'devops')
  const npm = memory.addConcept('npm', 'devops')
  const webpack = memory.addConcept('webpack', 'devops')
  const vite = memory.addConcept('Vite', 'devops')

  // ── Databases ──────────────────────────────────────────────────────────────

  const postgresql = memory.addConcept('PostgreSQL', 'database')
  const mongodb = memory.addConcept('MongoDB', 'database')
  const redis = memory.addConcept('Redis', 'database')
  const mysql = memory.addConcept('MySQL', 'database')

  // ── AI / ML ────────────────────────────────────────────────────────────────

  const machineLearning = memory.addConcept('machine learning', 'ai')
  const neuralNetwork = memory.addConcept('neural network', 'ai')
  const transformer = memory.addConcept('transformer', 'ai')
  const llm = memory.addConcept('LLM', 'ai')
  const embedding = memory.addConcept('embedding', 'ai')

  // ── Language Relationships ─────────────────────────────────────────────────

  memory.addRelation(typescript, javascript, 'is-a', 0.9)
  memory.addRelation(kotlin, java, 'similar-to', 0.8)
  memory.addRelation(swift, kotlin, 'similar-to', 0.6)
  memory.addRelation(csharp, java, 'similar-to', 0.7)
  memory.addRelation(rust, cpp, 'similar-to', 0.6)
  memory.addRelation(python, ruby, 'similar-to', 0.5)
  memory.addRelation(go, rust, 'similar-to', 0.5)
  memory.addRelation(go, java, 'similar-to', 0.4)

  // ── Framework → Language ───────────────────────────────────────────────────

  memory.addRelation(react, javascript, 'used-with', 0.9)
  memory.addRelation(react, typescript, 'used-with', 0.9)
  memory.addRelation(vue, javascript, 'used-with', 0.9)
  memory.addRelation(angular, typescript, 'used-with', 0.95)
  memory.addRelation(express, javascript, 'used-with', 0.9)
  memory.addRelation(nextjs, react, 'depends-on', 0.95)
  memory.addRelation(nextjs, javascript, 'used-with', 0.8)
  memory.addRelation(django, python, 'used-with', 0.95)
  memory.addRelation(flask, python, 'used-with', 0.95)
  memory.addRelation(fastapi, python, 'used-with', 0.95)
  memory.addRelation(spring, java, 'used-with', 0.95)
  memory.addRelation(rails, ruby, 'used-with', 0.95)
  memory.addRelation(svelte, javascript, 'used-with', 0.9)
  memory.addRelation(nestjs, typescript, 'used-with', 0.9)
  memory.addRelation(nestjs, express, 'depends-on', 0.7)

  // ── Concept → Concept ─────────────────────────────────────────────────────

  memory.addRelation(promise, asyncConcept, 'related-to', 0.9)
  memory.addRelation(callback, asyncConcept, 'related-to', 0.8)
  memory.addRelation(promise, callback, 'related-to', 0.6)
  memory.addRelation(closure, func, 'related-to', 0.7)
  memory.addRelation(recursion, func, 'related-to', 0.6)
  memory.addRelation(recursion, loop, 'related-to', 0.7)
  memory.addRelation(loop, variable, 'related-to', 0.5)
  memory.addRelation(inheritance, cls, 'related-to', 0.8)
  memory.addRelation(polymorphism, inheritance, 'related-to', 0.8)
  memory.addRelation(encapsulation, cls, 'related-to', 0.7)
  memory.addRelation(abstraction, cls, 'related-to', 0.6)
  memory.addRelation(generics, typeSafety, 'related-to', 0.7)
  memory.addRelation(immutability, func, 'related-to', 0.5)
  memory.addRelation(concurrency, asyncConcept, 'related-to', 0.7)
  memory.addRelation(eventLoop, asyncConcept, 'related-to', 0.9)
  memory.addRelation(eventLoop, javascript, 'part-of', 0.8)
  memory.addRelation(garbageCollection, memoryManagement, 'part-of', 0.9)
  memory.addRelation(memoryManagement, rust, 'related-to', 0.8)
  memory.addRelation(memoryManagement, cpp, 'related-to', 0.8)
  memory.addRelation(typeSafety, typescript, 'related-to', 0.9)
  memory.addRelation(typeSafety, rust, 'related-to', 0.8)

  // ── API / Web ──────────────────────────────────────────────────────────────

  memory.addRelation(restApi, api, 'is-a', 0.9)
  memory.addRelation(graphql, api, 'is-a', 0.9)
  memory.addRelation(restApi, graphql, 'related-to', 0.5)
  memory.addRelation(middleware, express, 'part-of', 0.8)
  memory.addRelation(middleware, api, 'related-to', 0.6)
  memory.addRelation(component, react, 'part-of', 0.9)
  memory.addRelation(component, vue, 'part-of', 0.9)
  memory.addRelation(component, angular, 'part-of', 0.9)
  memory.addRelation(state, react, 'related-to', 0.8)
  memory.addRelation(state, vue, 'related-to', 0.7)

  // ── Testing ────────────────────────────────────────────────────────────────

  memory.addRelation(unitTest, testing, 'is-a', 0.9)
  memory.addRelation(integration, testing, 'is-a', 0.9)
  memory.addRelation(unitTest, integration, 'related-to', 0.5)

  // ── Patterns ───────────────────────────────────────────────────────────────

  memory.addRelation(mvc, angular, 'used-with', 0.7)
  memory.addRelation(mvc, django, 'used-with', 0.8)
  memory.addRelation(mvc, rails, 'used-with', 0.8)
  memory.addRelation(mvc, spring, 'used-with', 0.7)
  memory.addRelation(observer, eventLoop, 'related-to', 0.6)
  memory.addRelation(observer, react, 'related-to', 0.5)
  memory.addRelation(singleton, dependency, 'opposite-of', 0.5)
  memory.addRelation(factory, cls, 'related-to', 0.6)
  memory.addRelation(strategy, polymorphism, 'related-to', 0.7)
  memory.addRelation(decorator, func, 'related-to', 0.6)
  memory.addRelation(decorator, python, 'used-with', 0.7)
  memory.addRelation(repository, api, 'related-to', 0.5)
  memory.addRelation(dependency, spring, 'used-with', 0.8)
  memory.addRelation(dependency, angular, 'used-with', 0.8)
  memory.addRelation(dependency, nestjs, 'used-with', 0.8)

  // ── DevOps ─────────────────────────────────────────────────────────────────

  memory.addRelation(kubernetes, docker, 'depends-on', 0.8)
  memory.addRelation(cicd, docker, 'used-with', 0.7)
  memory.addRelation(cicd, git, 'depends-on', 0.9)
  memory.addRelation(npm, javascript, 'used-with', 0.9)
  memory.addRelation(npm, typescript, 'used-with', 0.9)
  memory.addRelation(webpack, javascript, 'used-with', 0.8)
  memory.addRelation(vite, javascript, 'used-with', 0.8)
  memory.addRelation(vite, typescript, 'used-with', 0.8)
  memory.addRelation(vite, webpack, 'similar-to', 0.6)

  // ── Databases ──────────────────────────────────────────────────────────────

  memory.addRelation(postgresql, sql, 'used-with', 0.95)
  memory.addRelation(mysql, sql, 'used-with', 0.95)
  memory.addRelation(postgresql, mysql, 'similar-to', 0.7)
  memory.addRelation(mongodb, postgresql, 'related-to', 0.3)
  memory.addRelation(redis, mongodb, 'related-to', 0.3)
  memory.addRelation(postgresql, django, 'used-with', 0.7)
  memory.addRelation(mongodb, express, 'used-with', 0.6)
  memory.addRelation(redis, api, 'used-with', 0.5)

  // ── AI / ML ────────────────────────────────────────────────────────────────

  memory.addRelation(neuralNetwork, machineLearning, 'is-a', 0.9)
  memory.addRelation(transformer, neuralNetwork, 'is-a', 0.9)
  memory.addRelation(llm, transformer, 'is-a', 0.9)
  memory.addRelation(embedding, machineLearning, 'related-to', 0.8)
  memory.addRelation(machineLearning, python, 'used-with', 0.9)
  memory.addRelation(llm, api, 'related-to', 0.6)

  // ── HTML / CSS ─────────────────────────────────────────────────────────────

  memory.addRelation(html, css, 'used-with', 0.95)
  memory.addRelation(html, javascript, 'used-with', 0.9)
  memory.addRelation(css, javascript, 'used-with', 0.6)
  memory.addRelation(react, html, 'related-to', 0.6)
  memory.addRelation(react, css, 'related-to', 0.5)
  memory.addRelation(php, html, 'used-with', 0.7)

  // ── Kurdish Sorani Language — Semantic Concepts ──────────────────────────

  // Core language concepts
  const kurdishSorani = memory.addConcept('Kurdish Sorani', 'language')
  const kurmanji = memory.addConcept('Kurmanji', 'language')
  const soranAlphabet = memory.addConcept('Sorani Alphabet', 'language')
  const soranGrammar = memory.addConcept('Sorani Grammar', 'language')
  const soranVocabulary = memory.addConcept('Sorani Vocabulary', 'language')
  const soranSemantics = memory.addConcept('Sorani Semantics', 'language')
  const soranPhonology = memory.addConcept('Sorani Phonology', 'language')
  const ezafe = memory.addConcept('Ezafe Construction', 'language')
  const ergativity = memory.addConcept('Split Ergativity', 'language')
  const soranVerbs = memory.addConcept('Sorani Verb System', 'language')
  const soranCompounds = memory.addConcept('Sorani Compound Words', 'language')
  const soranWriting = memory.addConcept('Sorani Writing System', 'language')

  // Relationships: Kurdish dialect family
  memory.addRelation(kurdishSorani, kurmanji, 'related-to', 0.85)
  memory.addRelation(soranAlphabet, kurdishSorani, 'part-of', 0.95)
  memory.addRelation(soranGrammar, kurdishSorani, 'part-of', 0.95)
  memory.addRelation(soranVocabulary, kurdishSorani, 'part-of', 0.95)
  memory.addRelation(soranSemantics, kurdishSorani, 'part-of', 0.95)
  memory.addRelation(soranPhonology, kurdishSorani, 'part-of', 0.9)
  memory.addRelation(soranWriting, kurdishSorani, 'part-of', 0.9)

  // Grammar features
  memory.addRelation(ezafe, soranGrammar, 'part-of', 0.9)
  memory.addRelation(ergativity, soranGrammar, 'part-of', 0.85)
  memory.addRelation(soranVerbs, soranGrammar, 'part-of', 0.9)

  // Semantic features
  memory.addRelation(soranCompounds, soranSemantics, 'part-of', 0.9)
  memory.addRelation(soranCompounds, soranVocabulary, 'related-to', 0.8)
  memory.addRelation(ezafe, soranSemantics, 'related-to', 0.7)
  memory.addRelation(soranWriting, soranAlphabet, 'related-to', 0.9)

  // ── Kurdish Sorani — Expanded Semantic Concepts ──────────────────────────

  // Advanced grammar concepts
  const soranPassive = memory.addConcept('Sorani Passive Voice', 'language')
  const soranCausative = memory.addConcept('Sorani Causative', 'language')
  const soranConditional = memory.addConcept('Sorani Conditional', 'language')
  const soranModals = memory.addConcept('Sorani Modal Verbs', 'language')
  const soranClitics = memory.addConcept('Sorani Clitics', 'language')
  const soranNegation = memory.addConcept('Sorani Negation', 'language')
  const soranAspect = memory.addConcept('Sorani Aspect System', 'language')
  const soranWordOrder = memory.addConcept('Sorani Word Order', 'language')

  // Deep semantic/linguistic concepts
  const soranMorphology = memory.addConcept('Sorani Morphology', 'language')
  const soranDerivation = memory.addConcept('Sorani Derivation', 'language')
  const soranLoanwords = memory.addConcept('Sorani Loanwords', 'language')
  const soranPragmatics = memory.addConcept('Sorani Pragmatics', 'language')
  const soranDiscourse = memory.addConcept('Sorani Discourse Markers', 'language')
  const soranEvidentiality = memory.addConcept('Sorani Evidentiality', 'language')
  const soranMetaphor = memory.addConcept('Sorani Metaphor System', 'language')
  const soranProverbs = memory.addConcept('Sorani Proverbs', 'language')
  const soranPoetry = memory.addConcept('Sorani Poetry', 'language')
  const soranKinship = memory.addConcept('Sorani Kinship System', 'language')
  const soranRegisters = memory.addConcept('Sorani Registers', 'language')
  const soranReduplication = memory.addConcept('Sorani Reduplication', 'language')
  const soranDialects = memory.addConcept('Sorani Dialectal Variation', 'language')

  // Advanced grammar → Grammar relations
  memory.addRelation(soranPassive, soranVerbs, 'related-to', 0.9)
  memory.addRelation(soranCausative, soranVerbs, 'related-to', 0.9)
  memory.addRelation(soranConditional, soranGrammar, 'part-of', 0.85)
  memory.addRelation(soranModals, soranVerbs, 'related-to', 0.85)
  memory.addRelation(soranClitics, soranGrammar, 'part-of', 0.9)
  memory.addRelation(soranNegation, soranGrammar, 'part-of', 0.85)
  memory.addRelation(soranAspect, soranVerbs, 'related-to', 0.9)
  memory.addRelation(soranWordOrder, soranGrammar, 'part-of', 0.9)
  memory.addRelation(soranClitics, ergativity, 'related-to', 0.8)

  // Deep linguistics → Kurdish Sorani relations
  memory.addRelation(soranMorphology, kurdishSorani, 'part-of', 0.95)
  memory.addRelation(soranDerivation, soranMorphology, 'part-of', 0.9)
  memory.addRelation(soranLoanwords, soranVocabulary, 'part-of', 0.8)
  memory.addRelation(soranPragmatics, soranSemantics, 'related-to', 0.85)
  memory.addRelation(soranDiscourse, soranPragmatics, 'part-of', 0.85)
  memory.addRelation(soranEvidentiality, soranGrammar, 'part-of', 0.8)
  memory.addRelation(soranEvidentiality, soranPragmatics, 'related-to', 0.7)
  memory.addRelation(soranMetaphor, soranSemantics, 'part-of', 0.9)
  memory.addRelation(soranProverbs, soranSemantics, 'related-to', 0.8)
  memory.addRelation(soranPoetry, kurdishSorani, 'related-to', 0.85)
  memory.addRelation(soranKinship, soranVocabulary, 'part-of', 0.85)
  memory.addRelation(soranRegisters, soranPragmatics, 'related-to', 0.8)
  memory.addRelation(soranReduplication, soranMorphology, 'part-of', 0.85)
  memory.addRelation(soranDialects, kurdishSorani, 'part-of', 0.8)
  memory.addRelation(soranDialects, kurmanji, 'related-to', 0.7)
  memory.addRelation(soranCompounds, soranMorphology, 'related-to', 0.85)

  // ── Kurdish Sorani — Phase 3 Expanded Concepts ──────────────────────────

  // Conversation & daily life concepts
  const soranConversation = memory.addConcept('Sorani Conversation', 'language')
  const soranShopping = memory.addConcept('Sorani Shopping Language', 'language')
  const soranDining = memory.addConcept('Sorani Dining Language', 'language')

  // Modern domain concepts
  const soranTechnology = memory.addConcept('Sorani Technology Vocab', 'language')
  const soranSocialMedia = memory.addConcept('Sorani Social Media', 'language')
  const soranScience = memory.addConcept('Sorani Science Vocab', 'language')
  const soranMedical = memory.addConcept('Sorani Medical Vocab', 'language')
  const soranLegal = memory.addConcept('Sorani Legal Vocab', 'language')
  const soranPolitical = memory.addConcept('Sorani Political Vocab', 'language')
  const soranEducation = memory.addConcept('Sorani Education Vocab', 'language')
  const soranAgriculture = memory.addConcept('Sorani Agriculture Vocab', 'language')
  const soranCommerce = memory.addConcept('Sorani Commerce Vocab', 'language')

  // Culture & arts concepts
  const soranModernLit = memory.addConcept('Sorani Modern Literature', 'language')
  const soranFolkTales = memory.addConcept('Sorani Folk Tales', 'language')
  const soranMusic = memory.addConcept('Sorani Music', 'language')
  const soranMedia = memory.addConcept('Sorani Media', 'language')
  const soranFestivals = memory.addConcept('Sorani Festivals', 'language')
  const soranClothing = memory.addConcept('Sorani Traditional Clothing', 'language')

  // Advanced grammar concepts
  const soranRelativeClauses = memory.addConcept('Sorani Relative Clauses', 'language')
  const soranReportedSpeech = memory.addConcept('Sorani Reported Speech', 'language')
  const soranSubjunctive = memory.addConcept('Sorani Subjunctive', 'language')

  // Geography & history
  const soranHistory = memory.addConcept('Kurdish History', 'language')
  const soranGeography = memory.addConcept('Kurdistan Geography', 'language')
  const soranTransportation = memory.addConcept('Sorani Transportation', 'language')
  const soranSports = memory.addConcept('Sorani Sports', 'language')
  const soranReligion = memory.addConcept('Sorani Religion', 'language')
  const soranWeather = memory.addConcept('Sorani Weather', 'language')

  // Conversation → Kurdish Sorani relations
  memory.addRelation(soranConversation, kurdishSorani, 'part-of', 0.9)
  memory.addRelation(soranShopping, soranConversation, 'part-of', 0.85)
  memory.addRelation(soranDining, soranConversation, 'part-of', 0.85)

  // Modern domains → Vocabulary relations
  memory.addRelation(soranTechnology, soranVocabulary, 'part-of', 0.85)
  memory.addRelation(soranSocialMedia, soranTechnology, 'related-to', 0.9)
  memory.addRelation(soranScience, soranVocabulary, 'part-of', 0.85)
  memory.addRelation(soranMedical, soranScience, 'related-to', 0.8)
  memory.addRelation(soranMedical, soranVocabulary, 'part-of', 0.85)
  memory.addRelation(soranLegal, soranVocabulary, 'part-of', 0.85)
  memory.addRelation(soranPolitical, soranLegal, 'related-to', 0.8)
  memory.addRelation(soranPolitical, kurdishSorani, 'related-to', 0.85)
  memory.addRelation(soranEducation, soranVocabulary, 'part-of', 0.85)
  memory.addRelation(soranAgriculture, soranVocabulary, 'part-of', 0.8)
  memory.addRelation(soranCommerce, soranVocabulary, 'part-of', 0.85)

  // Culture → Kurdish Sorani relations
  memory.addRelation(soranModernLit, soranPoetry, 'related-to', 0.9)
  memory.addRelation(soranModernLit, kurdishSorani, 'related-to', 0.85)
  memory.addRelation(soranFolkTales, kurdishSorani, 'related-to', 0.85)
  memory.addRelation(soranFolkTales, soranProverbs, 'related-to', 0.8)
  memory.addRelation(soranMusic, kurdishSorani, 'related-to', 0.85)
  memory.addRelation(soranMedia, kurdishSorani, 'related-to', 0.8)
  memory.addRelation(soranFestivals, kurdishSorani, 'related-to', 0.9)
  memory.addRelation(soranClothing, kurdishSorani, 'related-to', 0.8)
  memory.addRelation(soranClothing, soranFestivals, 'related-to', 0.75)

  // Advanced grammar → Grammar relations
  memory.addRelation(soranRelativeClauses, soranGrammar, 'part-of', 0.9)
  memory.addRelation(soranReportedSpeech, soranGrammar, 'part-of', 0.85)
  memory.addRelation(soranSubjunctive, soranVerbs, 'related-to', 0.9)
  memory.addRelation(soranSubjunctive, soranGrammar, 'part-of', 0.85)

  // Geography/history → Kurdish relations
  memory.addRelation(soranHistory, kurdishSorani, 'related-to', 0.9)
  memory.addRelation(soranGeography, kurdishSorani, 'related-to', 0.85)
  memory.addRelation(soranTransportation, soranVocabulary, 'part-of', 0.8)
  memory.addRelation(soranSports, soranVocabulary, 'part-of', 0.8)
  memory.addRelation(soranReligion, kurdishSorani, 'related-to', 0.85)
  memory.addRelation(soranWeather, soranVocabulary, 'part-of', 0.8)

  // ── Kurdish Sorani — CKB-ENG Translation Corpus Concepts ──────────────
  // Sourced from KurdishBLARK/InterdialectCorpus CKB-ENG dataset
  const soranTranslation = memory.addConcept('Sorani Translation Corpus', 'language')
  const soranTranslationCulture = memory.addConcept('Sorani Cultural Translation', 'language')
  const soranTranslationEducation = memory.addConcept('Sorani Education Translation', 'language')
  const soranTranslationHistory = memory.addConcept('Sorani History Translation', 'language')
  const soranTranslationArts = memory.addConcept('Sorani Arts Translation', 'language')
  const soranTranslationHealth = memory.addConcept('Sorani Health Translation', 'language')
  const soranTranslationRights = memory.addConcept('Sorani Human Rights Translation', 'language')
  const soranTranslationLegal = memory.addConcept('Sorani Legal Translation', 'language')
  const soranTranslationNews = memory.addConcept('Sorani News Translation', 'language')
  const soranParallelSentences = memory.addConcept('Sorani Parallel Sentences', 'language')
  const soranCorpusVocabulary = memory.addConcept('Sorani Corpus Vocabulary', 'language')

  // Translation corpus relations
  memory.addRelation(soranTranslation, kurdishSorani, 'part-of', 0.95)
  memory.addRelation(soranTranslationCulture, soranTranslation, 'part-of', 0.9)
  memory.addRelation(soranTranslationEducation, soranTranslation, 'part-of', 0.9)
  memory.addRelation(soranTranslationHistory, soranTranslation, 'part-of', 0.9)
  memory.addRelation(soranTranslationArts, soranTranslation, 'part-of', 0.9)
  memory.addRelation(soranTranslationHealth, soranTranslation, 'part-of', 0.9)
  memory.addRelation(soranTranslationRights, soranTranslation, 'part-of', 0.9)
  memory.addRelation(soranTranslationLegal, soranTranslation, 'part-of', 0.9)
  memory.addRelation(soranTranslationNews, soranTranslation, 'part-of', 0.9)
  memory.addRelation(soranParallelSentences, soranTranslation, 'part-of', 0.9)
  memory.addRelation(soranCorpusVocabulary, soranTranslation, 'part-of', 0.9)
  memory.addRelation(soranCorpusVocabulary, soranVocabulary, 'related-to', 0.85)
  memory.addRelation(soranTranslationCulture, soranFestivals, 'related-to', 0.8)
  memory.addRelation(soranTranslationHistory, soranHistory, 'related-to', 0.85)
  memory.addRelation(soranTranslationHealth, soranVocabulary, 'related-to', 0.75)

  // ── Kurdish Sorani — NLP & Sentiment Analysis Concepts ──────────────────
  const soranSentimentAnalysis = memory.addConcept('Sorani Sentiment Analysis', 'language')
  const soranMorphologicalAnalysis = memory.addConcept('Sorani Morphological Analysis', 'language')
  const soranStemming = memory.addConcept('Sorani Stemming', 'language')
  const soranSuffixStripping = memory.addConcept('Sorani Suffix Stripping', 'language')
  const soranEmotionDetection = memory.addConcept('Sorani Emotion Detection', 'language')
  const soranIdioms = memory.addConcept('Sorani Idiomatic Expressions', 'language')
  const soranCollocations = memory.addConcept('Sorani Collocations', 'language')
  const soranNegationPatterns = memory.addConcept('Sorani Negation Patterns', 'language')
  const soranIntensifiers = memory.addConcept('Sorani Intensifiers', 'language')
  const soranAgglutination = memory.addConcept('Sorani Agglutination', 'language')

  // NLP → Kurdish Sorani relations
  memory.addRelation(soranSentimentAnalysis, kurdishSorani, 'part-of', 0.9)
  memory.addRelation(soranMorphologicalAnalysis, kurdishSorani, 'part-of', 0.9)
  memory.addRelation(soranStemming, soranMorphologicalAnalysis, 'part-of', 0.95)
  memory.addRelation(soranSuffixStripping, soranStemming, 'part-of', 0.95)
  memory.addRelation(soranEmotionDetection, soranSentimentAnalysis, 'part-of', 0.9)
  memory.addRelation(soranIdioms, soranSemantics, 'part-of', 0.85)
  memory.addRelation(soranCollocations, soranSemantics, 'part-of', 0.85)
  memory.addRelation(soranNegationPatterns, soranGrammar, 'part-of', 0.9)
  memory.addRelation(soranIntensifiers, soranGrammar, 'part-of', 0.85)
  memory.addRelation(soranAgglutination, soranMorphology, 'part-of', 0.95)
  memory.addRelation(soranSentimentAnalysis, soranSemantics, 'related-to', 0.85)

  // ── Exploit Development Concepts ──────────────────────────────────────────

  const exploitDevelopment = memory.addConcept('Exploit Development', 'security')
  const bufferOverflow = memory.addConcept('Buffer Overflow', 'security')
  const stackBufferOverflow = memory.addConcept('Stack Buffer Overflow', 'security')
  const heapOverflow = memory.addConcept('Heap Overflow', 'security')
  const formatStringVuln = memory.addConcept('Format String Vulnerability', 'security')
  const fuzzingFramework = memory.addConcept('Custom Fuzzing Framework', 'security')
  const tcpFuzzing = memory.addConcept('TCP Fuzzing', 'security')
  const udpFuzzing = memory.addConcept('UDP Fuzzing', 'security')
  const fileFuzzing = memory.addConcept('File Fuzzing', 'security')
  const apiFuzzing = memory.addConcept('API Fuzzing', 'security')
  const ropChainGeneration = memory.addConcept('ROP Chain Generation', 'security')
  const ropGadget = memory.addConcept('ROP Gadget', 'security')
  const ret2libc = memory.addConcept('Return-to-libc', 'security')
  const patternGenerator = memory.addConcept('Buffer Overflow Pattern Generator', 'security')
  const deBruijnSequence = memory.addConcept('De Bruijn Sequence', 'security')
  const shellcodeEncoder = memory.addConcept('Shellcode Encoder Decoder', 'security')
  const xorEncoding = memory.addConcept('XOR Encoding', 'security')
  const polymorphicShellcode = memory.addConcept('Polymorphic Shellcode', 'security')
  const badCharFinder = memory.addConcept('Bad Character Finder', 'security')
  const exploitMitigation = memory.addConcept('Exploit Mitigation Bypass', 'security')

  // Hierarchical relations
  memory.addRelation(bufferOverflow, exploitDevelopment, 'part-of', 0.95)
  memory.addRelation(stackBufferOverflow, bufferOverflow, 'part-of', 0.95)
  memory.addRelation(heapOverflow, bufferOverflow, 'part-of', 0.9)
  memory.addRelation(formatStringVuln, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(fuzzingFramework, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(tcpFuzzing, fuzzingFramework, 'part-of', 0.9)
  memory.addRelation(udpFuzzing, fuzzingFramework, 'part-of', 0.9)
  memory.addRelation(fileFuzzing, fuzzingFramework, 'part-of', 0.9)
  memory.addRelation(apiFuzzing, fuzzingFramework, 'part-of', 0.9)
  memory.addRelation(ropChainGeneration, exploitDevelopment, 'part-of', 0.95)
  memory.addRelation(ropGadget, ropChainGeneration, 'part-of', 0.95)
  memory.addRelation(ret2libc, ropChainGeneration, 'part-of', 0.9)
  memory.addRelation(patternGenerator, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(deBruijnSequence, patternGenerator, 'part-of', 0.95)
  memory.addRelation(shellcodeEncoder, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(xorEncoding, shellcodeEncoder, 'part-of', 0.9)
  memory.addRelation(polymorphicShellcode, shellcodeEncoder, 'part-of', 0.85)
  memory.addRelation(badCharFinder, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(exploitMitigation, exploitDevelopment, 'part-of', 0.9)

  // Cross-relations
  memory.addRelation(badCharFinder, shellcodeEncoder, 'related-to', 0.85)
  memory.addRelation(patternGenerator, bufferOverflow, 'related-to', 0.9)
  memory.addRelation(ropChainGeneration, bufferOverflow, 'related-to', 0.85)
  memory.addRelation(formatStringVuln, exploitMitigation, 'related-to', 0.8)
  memory.addRelation(fuzzingFramework, bufferOverflow, 'related-to', 0.8)
  memory.addRelation(shellcodeEncoder, badCharFinder, 'related-to', 0.85)
  memory.addRelation(ropChainGeneration, exploitMitigation, 'related-to', 0.85)

  // ── Shells & Backdoors Concepts ──────────────────────────────────────────
  const reverseShell = memory.addConcept('Reverse Shell', 'security')
  const bindShell = memory.addConcept('Bind Shell', 'security')
  const meterpreterBackdoor = memory.addConcept('Meterpreter-Style Backdoor', 'security')

  // ── Windows Post-Exploitation Concepts ──────────────────────────────────
  const windowsRegistryManip = memory.addConcept('Windows Registry Manipulation', 'security')
  const tokenImpersonation = memory.addConcept('Token Impersonation', 'security')
  const passwordDumping = memory.addConcept('Password Dumping from Memory', 'security')
  const passTheHash = memory.addConcept('Pass-the-Hash Attack', 'security')
  const mimikatzIntegration = memory.addConcept('Mimikatz Integration', 'security')

  // ── Linux Post-Exploitation Concepts ────────────────────────────────────
  const suidEnumeration = memory.addConcept('SUID GUID Enumeration', 'security')
  const cronJobAbuse = memory.addConcept('Cron Job Abuse', 'security')

  // ── Persistence & Exfiltration Concepts ─────────────────────────────────
  const persistenceMechanism = memory.addConcept('Persistence Mechanism', 'security')
  const dataExfiltration = memory.addConcept('Data Exfiltration', 'security')
  const dnsExfiltration = memory.addConcept('DNS Exfiltration', 'security')
  const icmpExfiltration = memory.addConcept('ICMP Exfiltration', 'security')

  // ── Active Directory Attack Concepts ────────────────────────────────────
  const kerberoasting = memory.addConcept('Kerberoasting', 'security')
  const passTheTicket = memory.addConcept('Pass-the-Ticket', 'security')
  const ldapEnumeration = memory.addConcept('LDAP Enumeration', 'security')
  const bloodhoundCollection = memory.addConcept('BloodHound Data Collection', 'security')
  const smbEnumeration = memory.addConcept('SMB Share Enumeration', 'security')

  // ── Evasion & Anti-Forensics Concepts ───────────────────────────────────
  const payloadObfuscation = memory.addConcept('Payload Obfuscation', 'security')
  const processHollowing = memory.addConcept('Process Hollowing', 'security')
  const dllInjection = memory.addConcept('DLL Injection', 'security')
  const logClearing = memory.addConcept('Log Clearing Tampering', 'security')
  const fileTimestomping = memory.addConcept('File Timestomping', 'security')
  const polymorphicShellcodeGen = memory.addConcept('Polymorphic Shellcode Generation', 'security')
  const base64XorEncoding = memory.addConcept('Base64 XOR Payload Encoding', 'security')

  // Hierarchical relations — Shells & Backdoors
  memory.addRelation(reverseShell, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(bindShell, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(meterpreterBackdoor, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(reverseShell, bindShell, 'related-to', 0.9)
  memory.addRelation(meterpreterBackdoor, reverseShell, 'related-to', 0.85)

  // Hierarchical relations — Windows Post-Exploitation
  memory.addRelation(windowsRegistryManip, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(tokenImpersonation, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(passwordDumping, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(passTheHash, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(mimikatzIntegration, exploitDevelopment, 'part-of', 0.95)
  memory.addRelation(passTheHash, passwordDumping, 'related-to', 0.9)
  memory.addRelation(mimikatzIntegration, passwordDumping, 'related-to', 0.95)
  memory.addRelation(windowsRegistryManip, persistenceMechanism, 'related-to', 0.85)
  memory.addRelation(tokenImpersonation, mimikatzIntegration, 'related-to', 0.8)

  // Hierarchical relations — Linux Post-Exploitation
  memory.addRelation(suidEnumeration, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(cronJobAbuse, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(cronJobAbuse, persistenceMechanism, 'related-to', 0.85)

  // Hierarchical relations — Persistence & Exfiltration
  memory.addRelation(persistenceMechanism, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(dataExfiltration, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(dnsExfiltration, dataExfiltration, 'part-of', 0.95)
  memory.addRelation(icmpExfiltration, dataExfiltration, 'part-of', 0.9)

  // Hierarchical relations — Active Directory Attacks
  memory.addRelation(kerberoasting, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(passTheTicket, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(ldapEnumeration, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(bloodhoundCollection, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(smbEnumeration, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(kerberoasting, passTheTicket, 'related-to', 0.85)
  memory.addRelation(passTheTicket, mimikatzIntegration, 'related-to', 0.85)
  memory.addRelation(passTheHash, passTheTicket, 'related-to', 0.85)
  memory.addRelation(ldapEnumeration, bloodhoundCollection, 'related-to', 0.9)
  memory.addRelation(smbEnumeration, bloodhoundCollection, 'related-to', 0.8)

  // Hierarchical relations — Evasion & Anti-Forensics
  memory.addRelation(payloadObfuscation, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(processHollowing, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(dllInjection, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(logClearing, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(fileTimestomping, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(polymorphicShellcodeGen, exploitDevelopment, 'part-of', 0.9)
  memory.addRelation(base64XorEncoding, exploitDevelopment, 'part-of', 0.85)
  memory.addRelation(payloadObfuscation, shellcodeEncoder, 'related-to', 0.9)
  memory.addRelation(polymorphicShellcodeGen, polymorphicShellcode, 'related-to', 0.95)
  memory.addRelation(base64XorEncoding, shellcodeEncoder, 'related-to', 0.9)
  memory.addRelation(processHollowing, dllInjection, 'related-to', 0.85)
  memory.addRelation(logClearing, fileTimestomping, 'related-to', 0.9)
  memory.addRelation(payloadObfuscation, polymorphicShellcodeGen, 'related-to', 0.85)

  // ── Trading Programming Concepts ─────────────────────────────────────────────
  const tradingProgramming = memory.addConcept('Trading Programming', 'programming')
  const mt4Programming = memory.addConcept('MT4 Programming', 'programming')
  const mt5Programming = memory.addConcept('MT5 Programming', 'programming')
  const pineScript = memory.addConcept('Pine Script', 'programming')
  const expertAdvisor = memory.addConcept('Expert Advisor', 'programming')
  const tradingIndicator = memory.addConcept('Trading Indicator', 'programming')
  const tradingStrategy = memory.addConcept('Trading Strategy', 'programming')
  const orderManagement = memory.addConcept('Order Management', 'programming')
  const riskManagement = memory.addConcept('Trading Risk Management', 'programming')
  const tradingBacktest = memory.addConcept('Trading Backtesting', 'programming')
  const candlestickPattern = memory.addConcept('Candlestick Pattern', 'programming')
  const tradingDivergence = memory.addConcept('Trading Divergence', 'programming')

  // Trading Programming Relations
  memory.addRelation(mt4Programming, tradingProgramming, 'part-of', 0.95)
  memory.addRelation(mt5Programming, tradingProgramming, 'part-of', 0.95)
  memory.addRelation(pineScript, tradingProgramming, 'part-of', 0.95)
  memory.addRelation(expertAdvisor, mt4Programming, 'part-of', 0.9)
  memory.addRelation(expertAdvisor, mt5Programming, 'part-of', 0.9)
  memory.addRelation(tradingIndicator, mt4Programming, 'part-of', 0.9)
  memory.addRelation(tradingIndicator, mt5Programming, 'part-of', 0.9)
  memory.addRelation(tradingIndicator, pineScript, 'part-of', 0.9)
  memory.addRelation(tradingStrategy, tradingProgramming, 'part-of', 0.9)
  memory.addRelation(tradingStrategy, pineScript, 'related-to', 0.85)
  memory.addRelation(orderManagement, mt4Programming, 'part-of', 0.9)
  memory.addRelation(orderManagement, mt5Programming, 'part-of', 0.9)
  memory.addRelation(riskManagement, tradingProgramming, 'part-of', 0.9)
  memory.addRelation(tradingBacktest, tradingProgramming, 'part-of', 0.9)
  memory.addRelation(tradingBacktest, mt4Programming, 'related-to', 0.85)
  memory.addRelation(tradingBacktest, mt5Programming, 'related-to', 0.85)
  memory.addRelation(tradingBacktest, pineScript, 'related-to', 0.85)
  memory.addRelation(candlestickPattern, tradingIndicator, 'related-to', 0.85)
  memory.addRelation(tradingDivergence, tradingIndicator, 'related-to', 0.85)
  memory.addRelation(mt4Programming, mt5Programming, 'related-to', 0.9)
  memory.addRelation(riskManagement, orderManagement, 'related-to', 0.85)
  memory.addRelation(candlestickPattern, tradingStrategy, 'related-to', 0.8)
  memory.addRelation(tradingDivergence, tradingStrategy, 'related-to', 0.8)

  // ── Network Security Python (Black Hat Python 3) concepts ─────────────────
  const networkSecurityPython = memory.addConcept('Network Security Python', 'network_security_python')
  const pythonSocketProgramming = memory.addConcept('Python Socket Programming', 'network_security_python')
  const pythonTcpProxy = memory.addConcept('Python TCP Proxy', 'network_security_python')
  const pythonSshParamiko = memory.addConcept('Python SSH Paramiko', 'network_security_python')
  const pythonPacketSniffing = memory.addConcept('Python Packet Sniffing', 'network_security_python')
  const pythonNetworkScanning = memory.addConcept('Python Network Scanning', 'network_security_python')
  const pythonScapyCrafting = memory.addConcept('Python Scapy Packet Crafting', 'network_security_python')
  const pythonWebTesting = memory.addConcept('Python Web App Testing', 'network_security_python')
  const pythonBurpExtension = memory.addConcept('Python Burp Suite Extension', 'network_security_python')
  const pythonC2Framework = memory.addConcept('Python C2 Framework', 'network_security_python')
  const pythonPostExploitation = memory.addConcept('Python Post-Exploitation', 'network_security_python')
  const pythonSandboxDetection = memory.addConcept('Python Sandbox Detection', 'network_security_python')
  const pythonExfiltration = memory.addConcept('Python Data Exfiltration', 'network_security_python')
  const pythonProcessMonitoring = memory.addConcept('Python Process Monitoring', 'network_security_python')
  const pythonCodeInjection = memory.addConcept('Python Code Injection', 'network_security_python')
  const pythonBinaryProtocol = memory.addConcept('Python Binary Protocol Handling', 'network_security_python')

  // Network Security Python relations
  memory.addRelation(pythonSocketProgramming, networkSecurityPython, 'part-of', 0.95)
  memory.addRelation(pythonTcpProxy, networkSecurityPython, 'part-of', 0.9)
  memory.addRelation(pythonTcpProxy, pythonSocketProgramming, 'related-to', 0.9)
  memory.addRelation(pythonSshParamiko, networkSecurityPython, 'part-of', 0.9)
  memory.addRelation(pythonPacketSniffing, networkSecurityPython, 'part-of', 0.9)
  memory.addRelation(pythonPacketSniffing, pythonBinaryProtocol, 'related-to', 0.85)
  memory.addRelation(pythonNetworkScanning, networkSecurityPython, 'part-of', 0.9)
  memory.addRelation(pythonNetworkScanning, pythonPacketSniffing, 'related-to', 0.85)
  memory.addRelation(pythonScapyCrafting, networkSecurityPython, 'part-of', 0.9)
  memory.addRelation(pythonScapyCrafting, pythonPacketSniffing, 'related-to', 0.9)
  memory.addRelation(pythonWebTesting, networkSecurityPython, 'part-of', 0.9)
  memory.addRelation(pythonBurpExtension, pythonWebTesting, 'related-to', 0.9)
  memory.addRelation(pythonBurpExtension, networkSecurityPython, 'part-of', 0.85)
  memory.addRelation(pythonC2Framework, networkSecurityPython, 'part-of', 0.9)
  memory.addRelation(pythonPostExploitation, networkSecurityPython, 'part-of', 0.9)
  memory.addRelation(pythonPostExploitation, pythonC2Framework, 'related-to', 0.85)
  memory.addRelation(pythonSandboxDetection, pythonPostExploitation, 'related-to', 0.85)
  memory.addRelation(pythonSandboxDetection, networkSecurityPython, 'part-of', 0.85)
  memory.addRelation(pythonExfiltration, networkSecurityPython, 'part-of', 0.9)
  memory.addRelation(pythonExfiltration, pythonPostExploitation, 'related-to', 0.9)
  memory.addRelation(pythonProcessMonitoring, pythonPostExploitation, 'related-to', 0.85)
  memory.addRelation(pythonProcessMonitoring, networkSecurityPython, 'part-of', 0.85)
  memory.addRelation(pythonCodeInjection, networkSecurityPython, 'part-of', 0.9)
  memory.addRelation(pythonCodeInjection, pythonPostExploitation, 'related-to', 0.9)
  memory.addRelation(pythonBinaryProtocol, networkSecurityPython, 'part-of', 0.85)
  memory.addRelation(pythonBinaryProtocol, pythonSocketProgramming, 'related-to', 0.9)

  // ── Data Science & ML Concepts ──────────────────────────────────────────────
  const dataScienceML = memory.addConcept('Data Science & Machine Learning', 'artificial-intelligence')
  const supervisedLearning = memory.addConcept('Supervised Learning', 'machine-learning')
  const unsupervisedLearning = memory.addConcept('Unsupervised Learning', 'machine-learning')
  const deepLearning = memory.addConcept('Deep Learning', 'machine-learning')
  const cnnComputerVision = memory.addConcept('CNN & Computer Vision', 'deep-learning')
  const nlpTransformers = memory.addConcept('NLP & Transformers', 'deep-learning')
  const dataPreprocessing = memory.addConcept('Data Preprocessing & EDA', 'data-science')
  const gradientBoosting = memory.addConcept('Gradient Boosting Ensembles', 'machine-learning')
  const reinforcementLearning = memory.addConcept('Reinforcement Learning', 'machine-learning')
  const timeSeriesForecasting = memory.addConcept('Time Series Forecasting', 'data-science')
  const generativeModels = memory.addConcept('Generative Models', 'deep-learning')

  memory.addRelation(supervisedLearning, dataScienceML, 'part-of', 0.95)
  memory.addRelation(unsupervisedLearning, dataScienceML, 'part-of', 0.95)
  memory.addRelation(deepLearning, dataScienceML, 'part-of', 0.95)
  memory.addRelation(cnnComputerVision, deepLearning, 'part-of', 0.9)
  memory.addRelation(nlpTransformers, deepLearning, 'part-of', 0.9)
  memory.addRelation(dataPreprocessing, dataScienceML, 'part-of', 0.9)
  memory.addRelation(gradientBoosting, supervisedLearning, 'related-to', 0.9)
  memory.addRelation(reinforcementLearning, dataScienceML, 'part-of', 0.9)
  memory.addRelation(timeSeriesForecasting, dataScienceML, 'part-of', 0.85)
  memory.addRelation(generativeModels, deepLearning, 'part-of', 0.9)
  memory.addRelation(gradientBoosting, dataScienceML, 'part-of', 0.85)
  memory.addRelation(nlpTransformers, supervisedLearning, 'related-to', 0.8)
  memory.addRelation(cnnComputerVision, supervisedLearning, 'related-to', 0.8)

  // ── Cloud & DevOps Concepts ─────────────────────────────────────────────────
  const cloudDevOps = memory.addConcept('Cloud & DevOps', 'infrastructure')
  const dockerContainers = memory.addConcept('Docker Containerization', 'devops')
  const kubernetesOrchestration = memory.addConcept('Kubernetes Orchestration', 'devops')
  const cicdPipelines = memory.addConcept('CI/CD Pipelines', 'devops')
  const infrastructureAsCode = memory.addConcept('Infrastructure as Code', 'devops')
  const awsCloudServices = memory.addConcept('AWS Cloud Services', 'cloud')
  const observabilityMonitoring = memory.addConcept('Observability & Monitoring', 'devops')
  const microservicesArch = memory.addConcept('Microservices Architecture', 'architecture')
  const gitopsDeployment = memory.addConcept('GitOps Deployment', 'devops')

  memory.addRelation(dockerContainers, cloudDevOps, 'part-of', 0.95)
  memory.addRelation(kubernetesOrchestration, cloudDevOps, 'part-of', 0.95)
  memory.addRelation(kubernetesOrchestration, dockerContainers, 'related-to', 0.9)
  memory.addRelation(cicdPipelines, cloudDevOps, 'part-of', 0.9)
  memory.addRelation(infrastructureAsCode, cloudDevOps, 'part-of', 0.9)
  memory.addRelation(awsCloudServices, cloudDevOps, 'part-of', 0.9)
  memory.addRelation(observabilityMonitoring, cloudDevOps, 'part-of', 0.85)
  memory.addRelation(microservicesArch, cloudDevOps, 'related-to', 0.85)
  memory.addRelation(gitopsDeployment, kubernetesOrchestration, 'related-to', 0.9)
  memory.addRelation(gitopsDeployment, cicdPipelines, 'related-to', 0.85)
  memory.addRelation(observabilityMonitoring, microservicesArch, 'related-to', 0.85)

  // ── Mobile Development Concepts ─────────────────────────────────────────────
  const mobileDevelopment = memory.addConcept('Mobile Development', 'software-engineering')
  const reactNative = memory.addConcept('React Native', 'mobile')
  const flutterDart = memory.addConcept('Flutter & Dart', 'mobile')
  const iosSwift = memory.addConcept('iOS Swift Development', 'mobile')
  const androidKotlin = memory.addConcept('Android Kotlin Development', 'mobile')
  const mobilePatterns = memory.addConcept('Mobile Common Patterns', 'mobile')
  const mobileTestingDeploy = memory.addConcept('Mobile Testing & Deployment', 'mobile')

  memory.addRelation(reactNative, mobileDevelopment, 'part-of', 0.95)
  memory.addRelation(flutterDart, mobileDevelopment, 'part-of', 0.95)
  memory.addRelation(iosSwift, mobileDevelopment, 'part-of', 0.9)
  memory.addRelation(androidKotlin, mobileDevelopment, 'part-of', 0.9)
  memory.addRelation(mobilePatterns, mobileDevelopment, 'part-of', 0.85)
  memory.addRelation(mobileTestingDeploy, mobileDevelopment, 'part-of', 0.85)
  memory.addRelation(reactNative, flutterDart, 'related-to', 0.8)
  memory.addRelation(iosSwift, androidKotlin, 'related-to', 0.8)
  memory.addRelation(mobileTestingDeploy, cicdPipelines, 'related-to', 0.7)

  // ── Blockchain & Web3 Concepts ──────────────────────────────────────────────
  const blockchainWeb3 = memory.addConcept('Blockchain & Web3', 'distributed-systems')
  const solidityContracts = memory.addConcept('Solidity Smart Contracts', 'blockchain')
  const defiProtocols = memory.addConcept('DeFi Protocols', 'blockchain')
  const web3DappDev = memory.addConcept('Web3 DApp Development', 'blockchain')
  const smartContractSecurity = memory.addConcept('Smart Contract Security', 'blockchain')
  const nftDevelopment = memory.addConcept('NFT Development', 'blockchain')
  const layer2Scaling = memory.addConcept('Layer 2 Scaling', 'blockchain')

  memory.addRelation(solidityContracts, blockchainWeb3, 'part-of', 0.95)
  memory.addRelation(defiProtocols, blockchainWeb3, 'part-of', 0.9)
  memory.addRelation(web3DappDev, blockchainWeb3, 'part-of', 0.9)
  memory.addRelation(smartContractSecurity, solidityContracts, 'related-to', 0.95)
  memory.addRelation(nftDevelopment, solidityContracts, 'related-to', 0.9)
  memory.addRelation(layer2Scaling, blockchainWeb3, 'part-of', 0.9)
  memory.addRelation(defiProtocols, solidityContracts, 'related-to', 0.9)
  memory.addRelation(web3DappDev, solidityContracts, 'related-to', 0.85)
  memory.addRelation(nftDevelopment, defiProtocols, 'related-to', 0.7)
  memory.addRelation(smartContractSecurity, blockchainWeb3, 'part-of', 0.85)

  // ── System Design Concepts ──────────────────────────────────────────────────
  const systemDesign = memory.addConcept('System Design', 'software-architecture')
  const loadBalancing = memory.addConcept('Load Balancing', 'infrastructure')
  const cachingStrategies = memory.addConcept('Caching Strategies', 'infrastructure')
  const databaseDesign = memory.addConcept('Database Design & Scaling', 'infrastructure')
  const messageQueues = memory.addConcept('Message Queues & Streaming', 'infrastructure')
  const rateLimiting = memory.addConcept('Rate Limiting', 'infrastructure')
  const distributedSystems = memory.addConcept('Distributed Systems', 'infrastructure')
  const systemDesignInterviews = memory.addConcept('System Design Interviews', 'career')

  memory.addRelation(loadBalancing, systemDesign, 'part-of', 0.95)
  memory.addRelation(cachingStrategies, systemDesign, 'part-of', 0.95)
  memory.addRelation(databaseDesign, systemDesign, 'part-of', 0.95)
  memory.addRelation(messageQueues, systemDesign, 'part-of', 0.9)
  memory.addRelation(rateLimiting, systemDesign, 'part-of', 0.9)
  memory.addRelation(distributedSystems, systemDesign, 'part-of', 0.95)
  memory.addRelation(systemDesignInterviews, systemDesign, 'part-of', 0.85)
  memory.addRelation(loadBalancing, microservicesArch, 'related-to', 0.85)
  memory.addRelation(cachingStrategies, databaseDesign, 'related-to', 0.85)
  memory.addRelation(messageQueues, microservicesArch, 'related-to', 0.9)
  memory.addRelation(rateLimiting, loadBalancing, 'related-to', 0.8)
  memory.addRelation(distributedSystems, microservicesArch, 'related-to', 0.9)

  // ── Compiler & Language Design Concepts ─────────────────────────────────────
  const compilerDesign = memory.addConcept('Compiler & Language Design', 'computer-science')
  const lexicalAnalysis = memory.addConcept('Lexical Analysis', 'compilers')
  const parsingAst = memory.addConcept('Parsing & AST', 'compilers')
  const typeSystems = memory.addConcept('Type Systems', 'compilers')
  const codeGeneration = memory.addConcept('Code Generation & Optimization', 'compilers')
  const compilerGarbageCollection = memory.addConcept('Garbage Collection', 'runtime-systems')
  const virtualMachines = memory.addConcept('Virtual Machines & Interpreters', 'runtime-systems')

  memory.addRelation(lexicalAnalysis, compilerDesign, 'part-of', 0.95)
  memory.addRelation(parsingAst, compilerDesign, 'part-of', 0.95)
  memory.addRelation(typeSystems, compilerDesign, 'part-of', 0.9)
  memory.addRelation(codeGeneration, compilerDesign, 'part-of', 0.9)
  memory.addRelation(compilerGarbageCollection, compilerDesign, 'part-of', 0.85)
  memory.addRelation(virtualMachines, compilerDesign, 'part-of', 0.9)
  memory.addRelation(lexicalAnalysis, parsingAst, 'related-to', 0.95)
  memory.addRelation(parsingAst, typeSystems, 'related-to', 0.9)
  memory.addRelation(typeSystems, codeGeneration, 'related-to', 0.85)
  memory.addRelation(codeGeneration, virtualMachines, 'related-to', 0.85)
  memory.addRelation(compilerGarbageCollection, virtualMachines, 'related-to', 0.9)

  // ── Game Development concepts ─────────────────────────────────────────────
  const gameDev = memory.addConcept('Game Development', 'game-dev')
  const unityEngine = memory.addConcept('Unity Engine', 'game-dev')
  const unrealEngine = memory.addConcept('Unreal Engine', 'game-dev')
  const godotEngine = memory.addConcept('Godot Engine', 'game-dev')
  const gamePhysics = memory.addConcept('Game Physics', 'game-dev')
  const gameArchitecture = memory.addConcept('Game Architecture & ECS', 'game-dev')
  const gameNetworking = memory.addConcept('Multiplayer Networking', 'game-dev')
  const gameShaders = memory.addConcept('Game Shaders & Rendering', 'game-dev')
  const gameAI = memory.addConcept('Game AI & Pathfinding', 'game-dev')
  memory.addRelation(unityEngine, gameDev, 'part-of', 0.95)
  memory.addRelation(unrealEngine, gameDev, 'part-of', 0.95)
  memory.addRelation(godotEngine, gameDev, 'part-of', 0.9)
  memory.addRelation(gamePhysics, gameDev, 'part-of', 0.9)
  memory.addRelation(gameArchitecture, gameDev, 'part-of', 0.9)
  memory.addRelation(gameNetworking, gameDev, 'part-of', 0.85)
  memory.addRelation(gameShaders, gameDev, 'part-of', 0.85)
  memory.addRelation(gameAI, gameDev, 'part-of', 0.85)
  memory.addRelation(unityEngine, unrealEngine, 'related-to', 0.8)
  memory.addRelation(unrealEngine, godotEngine, 'related-to', 0.75)
  memory.addRelation(gamePhysics, gameShaders, 'related-to', 0.7)
  memory.addRelation(gameAI, gameArchitecture, 'related-to', 0.8)

  // ── Cybersecurity / Pen Testing concepts ──────────────────────────────────
  const cybersecPentest = memory.addConcept('Cybersecurity & Pen Testing', 'security')
  const pentestMethodology = memory.addConcept('Pentest Methodology', 'security')
  const webAppSecurity = memory.addConcept('Web Application Security', 'security')
  const privEsc = memory.addConcept('Privilege Escalation', 'security')
  const networkPentest = memory.addConcept('Network Penetration Testing', 'security')
  const wirelessSecurity = memory.addConcept('Wireless Security Testing', 'security')
  const cloudSecAssessment = memory.addConcept('Cloud Security Assessment', 'security')
  const socialEngineering = memory.addConcept('Social Engineering', 'security')
  const malwareAnalysis = memory.addConcept('Malware Analysis & RE', 'security')
  memory.addRelation(pentestMethodology, cybersecPentest, 'part-of', 0.95)
  memory.addRelation(webAppSecurity, cybersecPentest, 'part-of', 0.95)
  memory.addRelation(privEsc, cybersecPentest, 'part-of', 0.9)
  memory.addRelation(networkPentest, cybersecPentest, 'part-of', 0.9)
  memory.addRelation(wirelessSecurity, cybersecPentest, 'part-of', 0.85)
  memory.addRelation(cloudSecAssessment, cybersecPentest, 'part-of', 0.85)
  memory.addRelation(socialEngineering, cybersecPentest, 'part-of', 0.85)
  memory.addRelation(malwareAnalysis, cybersecPentest, 'part-of', 0.85)
  memory.addRelation(pentestMethodology, privEsc, 'related-to', 0.85)
  memory.addRelation(webAppSecurity, networkPentest, 'related-to', 0.8)
  memory.addRelation(privEsc, networkPentest, 'related-to', 0.85)

  // ── Database Engineering concepts ─────────────────────────────────────────
  const dbEngineering = memory.addConcept('Database Engineering', 'databases')
  const postgresAdvanced = memory.addConcept('PostgreSQL Advanced', 'databases')
  const redisEngineering = memory.addConcept('Redis Engineering', 'databases')
  const mongodbAdvanced = memory.addConcept('MongoDB Advanced', 'databases')
  const dbMigrations = memory.addConcept('Database Migrations', 'databases')
  const dbReplication = memory.addConcept('Database Replication & HA', 'databases')
  const specializedDatabases = memory.addConcept('Specialized Databases', 'databases')
  const sqlOptimization = memory.addConcept('SQL Query Optimization', 'databases')
  const distributedSQL = memory.addConcept('Distributed SQL (NewSQL)', 'databases')
  memory.addRelation(postgresAdvanced, dbEngineering, 'part-of', 0.95)
  memory.addRelation(redisEngineering, dbEngineering, 'part-of', 0.9)
  memory.addRelation(mongodbAdvanced, dbEngineering, 'part-of', 0.9)
  memory.addRelation(dbMigrations, dbEngineering, 'part-of', 0.85)
  memory.addRelation(dbReplication, dbEngineering, 'part-of', 0.9)
  memory.addRelation(specializedDatabases, dbEngineering, 'part-of', 0.85)
  memory.addRelation(sqlOptimization, dbEngineering, 'part-of', 0.9)
  memory.addRelation(distributedSQL, dbEngineering, 'part-of', 0.85)
  memory.addRelation(postgresAdvanced, sqlOptimization, 'related-to', 0.9)
  memory.addRelation(dbReplication, distributedSQL, 'related-to', 0.85)
  memory.addRelation(redisEngineering, mongodbAdvanced, 'related-to', 0.7)

  // ── API Design & GraphQL concepts ─────────────────────────────────────────
  const apiDesign = memory.addConcept('API Design & GraphQL', 'web-development')
  const restApiDesign = memory.addConcept('REST API Design', 'web-development')
  const graphqlDev = memory.addConcept('GraphQL Development', 'web-development')
  const grpcMicro = memory.addConcept('gRPC for Microservices', 'web-development')
  const openApiSpec = memory.addConcept('OpenAPI/Swagger', 'web-development')
  const apiAuth = memory.addConcept('API Authentication & Security', 'web-development')
  const webhookEvents = memory.addConcept('Webhooks & Events', 'web-development')
  const apiVersioning = memory.addConcept('API Versioning & Evolution', 'web-development')
  memory.addRelation(restApiDesign, apiDesign, 'part-of', 0.95)
  memory.addRelation(graphqlDev, apiDesign, 'part-of', 0.95)
  memory.addRelation(grpcMicro, apiDesign, 'part-of', 0.9)
  memory.addRelation(openApiSpec, apiDesign, 'part-of', 0.85)
  memory.addRelation(apiAuth, apiDesign, 'part-of', 0.9)
  memory.addRelation(webhookEvents, apiDesign, 'part-of', 0.85)
  memory.addRelation(apiVersioning, apiDesign, 'part-of', 0.85)
  memory.addRelation(restApiDesign, graphqlDev, 'related-to', 0.8)
  memory.addRelation(restApiDesign, openApiSpec, 'related-to', 0.9)
  memory.addRelation(apiAuth, restApiDesign, 'related-to', 0.85)

  // ── DevSecOps concepts ────────────────────────────────────────────────────
  const devSecOps = memory.addConcept('DevSecOps', 'security')
  const sastTesting = memory.addConcept('SAST Security Testing', 'security')
  const dastTesting = memory.addConcept('DAST Security Testing', 'security')
  const scaAnalysis = memory.addConcept('SCA Dependency Analysis', 'security')
  const containerSec = memory.addConcept('Container Security', 'security')
  const secretMgmt = memory.addConcept('Secret Management', 'security')
  const secPipeline = memory.addConcept('Security Pipeline', 'security')
  const iacSecurity = memory.addConcept('IaC Security Scanning', 'security')
  const vulnMgmt = memory.addConcept('Vulnerability Management', 'security')
  memory.addRelation(sastTesting, devSecOps, 'part-of', 0.95)
  memory.addRelation(dastTesting, devSecOps, 'part-of', 0.95)
  memory.addRelation(scaAnalysis, devSecOps, 'part-of', 0.9)
  memory.addRelation(containerSec, devSecOps, 'part-of', 0.9)
  memory.addRelation(secretMgmt, devSecOps, 'part-of', 0.85)
  memory.addRelation(secPipeline, devSecOps, 'part-of', 0.95)
  memory.addRelation(iacSecurity, devSecOps, 'part-of', 0.85)
  memory.addRelation(vulnMgmt, devSecOps, 'part-of', 0.9)
  memory.addRelation(sastTesting, dastTesting, 'related-to', 0.9)
  memory.addRelation(scaAnalysis, containerSec, 'related-to', 0.8)
  memory.addRelation(secretMgmt, iacSecurity, 'related-to', 0.75)

  // ── Quantum Computing concepts ────────────────────────────────────────────
  const quantumComp = memory.addConcept('Quantum Computing', 'quantum')
  const quantumFundamentals = memory.addConcept('Quantum Fundamentals', 'quantum')
  const quantumGates = memory.addConcept('Quantum Gates & Circuits', 'quantum')
  const quantumAlgorithms = memory.addConcept('Quantum Algorithms', 'quantum')
  const quantumProgramming = memory.addConcept('Quantum Programming', 'quantum')
  const quantumErrorCorrection = memory.addConcept('Quantum Error Correction', 'quantum')
  const postQuantumCrypto = memory.addConcept('Post-Quantum Cryptography', 'quantum')
  memory.addRelation(quantumFundamentals, quantumComp, 'part-of', 0.95)
  memory.addRelation(quantumGates, quantumComp, 'part-of', 0.95)
  memory.addRelation(quantumAlgorithms, quantumComp, 'part-of', 0.95)
  memory.addRelation(quantumProgramming, quantumComp, 'part-of', 0.9)
  memory.addRelation(quantumErrorCorrection, quantumComp, 'part-of', 0.9)
  memory.addRelation(postQuantumCrypto, quantumComp, 'part-of', 0.85)
  memory.addRelation(quantumFundamentals, quantumGates, 'related-to', 0.95)
  memory.addRelation(quantumGates, quantumAlgorithms, 'related-to', 0.9)
  memory.addRelation(quantumAlgorithms, quantumProgramming, 'related-to', 0.85)
  memory.addRelation(quantumErrorCorrection, quantumFundamentals, 'related-to', 0.85)
  memory.addRelation(postQuantumCrypto, quantumAlgorithms, 'related-to', 0.8)

  // ── Embedded Systems & IoT concepts ───────────────────────────────────────
  const embeddedIoT = memory.addConcept('Embedded Systems & IoT', 'embedded')
  const microcontrollerProgramming = memory.addConcept('Microcontroller Programming', 'embedded')
  const iotProtocols = memory.addConcept('IoT Protocols', 'embedded')
  const embeddedPeripherals = memory.addConcept('Embedded Peripherals', 'embedded')
  const embeddedLinux = memory.addConcept('Embedded Linux', 'embedded')
  const embeddedPower = memory.addConcept('Embedded Power Management', 'embedded')
  const tinyMLEdge = memory.addConcept('TinyML & Edge AI', 'embedded')
  memory.addRelation(microcontrollerProgramming, embeddedIoT, 'part-of', 0.95)
  memory.addRelation(iotProtocols, embeddedIoT, 'part-of', 0.9)
  memory.addRelation(embeddedPeripherals, embeddedIoT, 'part-of', 0.9)
  memory.addRelation(embeddedLinux, embeddedIoT, 'part-of', 0.85)
  memory.addRelation(embeddedPower, embeddedIoT, 'part-of', 0.85)
  memory.addRelation(tinyMLEdge, embeddedIoT, 'part-of', 0.8)
  memory.addRelation(microcontrollerProgramming, embeddedPeripherals, 'related-to', 0.9)
  memory.addRelation(iotProtocols, microcontrollerProgramming, 'related-to', 0.85)
  memory.addRelation(tinyMLEdge, microcontrollerProgramming, 'related-to', 0.8)
  memory.addRelation(embeddedLinux, embeddedPower, 'related-to', 0.7)
  memory.addRelation(embeddedPeripherals, iotProtocols, 'related-to', 0.8)

  // ── NLP Processing concepts ───────────────────────────────────────────────
  const nlpProcessing = memory.addConcept('Natural Language Processing', 'ai')
  const wordEmbeddings = memory.addConcept('Word Embeddings', 'ai')
  const nlpTasks = memory.addConcept('NLP Tasks', 'ai')
  const machineTranslation = memory.addConcept('Machine Translation', 'ai')
  const textGenLLM = memory.addConcept('Text Generation & LLMs', 'ai')
  const nlpTools = memory.addConcept('NLP Tools & Libraries', 'ai')
  const speechConversational = memory.addConcept('Speech & Conversational AI', 'ai')
  memory.addRelation(wordEmbeddings, nlpProcessing, 'part-of', 0.95)
  memory.addRelation(nlpTasks, nlpProcessing, 'part-of', 0.95)
  memory.addRelation(machineTranslation, nlpProcessing, 'part-of', 0.9)
  memory.addRelation(textGenLLM, nlpProcessing, 'part-of', 0.9)
  memory.addRelation(nlpTools, nlpProcessing, 'part-of', 0.85)
  memory.addRelation(speechConversational, nlpProcessing, 'part-of', 0.85)
  memory.addRelation(wordEmbeddings, nlpTasks, 'related-to', 0.9)
  memory.addRelation(textGenLLM, machineTranslation, 'related-to', 0.85)
  memory.addRelation(nlpTools, nlpTasks, 'related-to', 0.85)
  memory.addRelation(speechConversational, textGenLLM, 'related-to', 0.8)
  memory.addRelation(machineTranslation, wordEmbeddings, 'related-to', 0.85)

  // ── UI/UX Design concepts ─────────────────────────────────────────────────
  const uiuxDesign = memory.addConcept('UI/UX Design', 'design')
  const designSystems = memory.addConcept('Design Systems', 'design')
  const webAccessibility = memory.addConcept('Web Accessibility', 'design')
  const responsiveDesign = memory.addConcept('Responsive Design', 'design')
  const uxResearch = memory.addConcept('UX Research', 'design')
  const visualDesignPrinciples = memory.addConcept('Visual Design Principles', 'design')
  const designDevWorkflow = memory.addConcept('Design-Dev Workflow', 'design')
  memory.addRelation(designSystems, uiuxDesign, 'part-of', 0.95)
  memory.addRelation(webAccessibility, uiuxDesign, 'part-of', 0.9)
  memory.addRelation(responsiveDesign, uiuxDesign, 'part-of', 0.9)
  memory.addRelation(uxResearch, uiuxDesign, 'part-of', 0.9)
  memory.addRelation(visualDesignPrinciples, uiuxDesign, 'part-of', 0.85)
  memory.addRelation(designDevWorkflow, uiuxDesign, 'part-of', 0.85)
  memory.addRelation(designSystems, designDevWorkflow, 'related-to', 0.9)
  memory.addRelation(webAccessibility, responsiveDesign, 'related-to', 0.8)
  memory.addRelation(visualDesignPrinciples, designSystems, 'related-to', 0.85)
  memory.addRelation(uxResearch, visualDesignPrinciples, 'related-to', 0.8)
  memory.addRelation(designDevWorkflow, responsiveDesign, 'related-to', 0.8)

  // ── Networking & Protocols concepts ───────────────────────────────────────
  const networkingProtocols = memory.addConcept('Networking & Protocols', 'networking')
  const tcpipModel = memory.addConcept('TCP/IP & OSI Model', 'networking')
  const applicationProtocols = memory.addConcept('Application Protocols', 'networking')
  const routingSwitching = memory.addConcept('Routing & Switching', 'networking')
  const networkDiagnostics = memory.addConcept('Network Diagnostics', 'networking')
  const networkSecurityVPN = memory.addConcept('Network Security & VPN', 'networking')
  const networkInfrastructure = memory.addConcept('Network Infrastructure', 'networking')
  memory.addRelation(tcpipModel, networkingProtocols, 'part-of', 0.95)
  memory.addRelation(applicationProtocols, networkingProtocols, 'part-of', 0.95)
  memory.addRelation(routingSwitching, networkingProtocols, 'part-of', 0.9)
  memory.addRelation(networkDiagnostics, networkingProtocols, 'part-of', 0.85)
  memory.addRelation(networkSecurityVPN, networkingProtocols, 'part-of', 0.9)
  memory.addRelation(networkInfrastructure, networkingProtocols, 'part-of', 0.9)
  memory.addRelation(tcpipModel, routingSwitching, 'related-to', 0.9)
  memory.addRelation(applicationProtocols, networkSecurityVPN, 'related-to', 0.85)
  memory.addRelation(networkDiagnostics, tcpipModel, 'related-to', 0.85)
  memory.addRelation(networkInfrastructure, networkSecurityVPN, 'related-to', 0.85)
  memory.addRelation(routingSwitching, networkInfrastructure, 'related-to', 0.85)

  // ── Functional Programming concepts ───────────────────────────────────────
  const functionalProgramming = memory.addConcept('Functional Programming', 'programming')
  const fpFundamentals = memory.addConcept('FP Fundamentals', 'programming')
  const monadsADTs = memory.addConcept('Monads & ADTs', 'programming')
  const haskellLang = memory.addConcept('Haskell', 'programming')
  const rustFunctional = memory.addConcept('Rust Functional Features', 'programming')
  const fpLanguages = memory.addConcept('FP Languages', 'programming')
  const reactiveProgramming = memory.addConcept('Reactive Programming', 'programming')
  memory.addRelation(fpFundamentals, functionalProgramming, 'part-of', 0.95)
  memory.addRelation(monadsADTs, functionalProgramming, 'part-of', 0.95)
  memory.addRelation(haskellLang, functionalProgramming, 'part-of', 0.9)
  memory.addRelation(rustFunctional, functionalProgramming, 'part-of', 0.85)
  memory.addRelation(fpLanguages, functionalProgramming, 'part-of', 0.9)
  memory.addRelation(reactiveProgramming, functionalProgramming, 'part-of', 0.8)
  memory.addRelation(fpFundamentals, monadsADTs, 'related-to', 0.95)
  memory.addRelation(haskellLang, monadsADTs, 'related-to', 0.9)
  memory.addRelation(rustFunctional, monadsADTs, 'related-to', 0.85)
  memory.addRelation(reactiveProgramming, fpFundamentals, 'related-to', 0.8)
  memory.addRelation(fpLanguages, haskellLang, 'related-to', 0.85)

  // ── Robotics & Automation concepts ────────────────────────────────────────
  const roboticsAutomation = memory.addConcept('Robotics & Automation', 'robotics')
  const rosFramework = memory.addConcept('ROS Framework', 'robotics')
  const robotKinematics = memory.addConcept('Robot Kinematics', 'robotics')
  const robotPerception = memory.addConcept('Robot Perception', 'robotics')
  const industrialAutomation = memory.addConcept('Industrial Automation', 'robotics')
  const droneUAV = memory.addConcept('Drone & UAV Systems', 'robotics')
  const robotSimulation = memory.addConcept('Robot Simulation', 'robotics')
  memory.addRelation(rosFramework, roboticsAutomation, 'part-of', 0.95)
  memory.addRelation(robotKinematics, roboticsAutomation, 'part-of', 0.9)
  memory.addRelation(robotPerception, roboticsAutomation, 'part-of', 0.9)
  memory.addRelation(industrialAutomation, roboticsAutomation, 'part-of', 0.85)
  memory.addRelation(droneUAV, roboticsAutomation, 'part-of', 0.85)
  memory.addRelation(robotSimulation, roboticsAutomation, 'part-of', 0.85)
  memory.addRelation(rosFramework, robotKinematics, 'related-to', 0.9)
  memory.addRelation(robotPerception, rosFramework, 'related-to', 0.9)
  memory.addRelation(robotSimulation, rosFramework, 'related-to', 0.85)
  memory.addRelation(droneUAV, robotPerception, 'related-to', 0.8)
  memory.addRelation(industrialAutomation, robotKinematics, 'related-to', 0.8)

  // ── Testing & QA Engineering concepts ──────────────────────────────────
  const testingQA = memory.addConcept('Testing & QA Engineering', 'testing')
  const unitTesting = memory.addConcept('Unit Testing Frameworks', 'testing')
  const testDoubles = memory.addConcept('Test Doubles & Mocking', 'testing')
  const bddTesting = memory.addConcept('BDD & Acceptance Testing', 'testing')
  const testQuality = memory.addConcept('Test Quality Metrics', 'testing')
  const specializedTesting = memory.addConcept('Specialized Testing', 'testing')
  const testStrategy = memory.addConcept('Test Strategy & CI', 'testing')
  memory.addRelation(unitTesting, testingQA, 'part-of', 0.95)
  memory.addRelation(testDoubles, testingQA, 'part-of', 0.9)
  memory.addRelation(bddTesting, testingQA, 'part-of', 0.9)
  memory.addRelation(testQuality, testingQA, 'part-of', 0.85)
  memory.addRelation(specializedTesting, testingQA, 'part-of', 0.85)
  memory.addRelation(testStrategy, testingQA, 'part-of', 0.9)
  memory.addRelation(unitTesting, testDoubles, 'related-to', 0.9)
  memory.addRelation(bddTesting, unitTesting, 'related-to', 0.8)
  memory.addRelation(testQuality, unitTesting, 'related-to', 0.85)
  memory.addRelation(testStrategy, specializedTesting, 'related-to', 0.85)
  memory.addRelation(testDoubles, testQuality, 'related-to', 0.8)

  // ── Operating Systems & Internals concepts ─────────────────────────────
  const osInternals = memory.addConcept('Operating Systems & Internals', 'systems')
  const processManagement = memory.addConcept('Process Management', 'systems')
  const osMemoryMgmt = memory.addConcept('Memory Management', 'systems')
  const fileSystems = memory.addConcept('File Systems', 'systems')
  const syscallsKernel = memory.addConcept('System Calls & Kernel', 'systems')
  const osConcurrency = memory.addConcept('OS Concurrency', 'systems')
  const osVirtualization = memory.addConcept('OS Virtualization', 'systems')
  memory.addRelation(processManagement, osInternals, 'part-of', 0.95)
  memory.addRelation(osMemoryMgmt, osInternals, 'part-of', 0.95)
  memory.addRelation(fileSystems, osInternals, 'part-of', 0.9)
  memory.addRelation(syscallsKernel, osInternals, 'part-of', 0.9)
  memory.addRelation(osConcurrency, osInternals, 'part-of', 0.9)
  memory.addRelation(osVirtualization, osInternals, 'part-of', 0.85)
  memory.addRelation(processManagement, osMemoryMgmt, 'related-to', 0.9)
  memory.addRelation(osConcurrency, processManagement, 'related-to', 0.9)
  memory.addRelation(syscallsKernel, processManagement, 'related-to', 0.85)
  memory.addRelation(osVirtualization, syscallsKernel, 'related-to', 0.8)
  memory.addRelation(fileSystems, syscallsKernel, 'related-to', 0.85)

  // ── Computer Graphics & Visualization concepts ─────────────────────────
  const computerGraphics = memory.addConcept('Computer Graphics', 'graphics')
  const graphicsAPIs = memory.addConcept('Graphics APIs & Pipeline', 'graphics')
  const rayTracing = memory.addConcept('Ray Tracing & PBR', 'graphics')
  const modeling3D = memory.addConcept('3D Modeling & Animation', 'graphics')
  const webGraphics = memory.addConcept('Web Graphics', 'graphics')
  const imageProcessing = memory.addConcept('Image Processing', 'graphics')
  const dataVisualization = memory.addConcept('Data Visualization', 'graphics')
  memory.addRelation(graphicsAPIs, computerGraphics, 'part-of', 0.95)
  memory.addRelation(rayTracing, computerGraphics, 'part-of', 0.9)
  memory.addRelation(modeling3D, computerGraphics, 'part-of', 0.9)
  memory.addRelation(webGraphics, computerGraphics, 'part-of', 0.85)
  memory.addRelation(imageProcessing, computerGraphics, 'part-of', 0.85)
  memory.addRelation(dataVisualization, computerGraphics, 'part-of', 0.8)
  memory.addRelation(graphicsAPIs, rayTracing, 'related-to', 0.9)
  memory.addRelation(modeling3D, graphicsAPIs, 'related-to', 0.85)
  memory.addRelation(webGraphics, graphicsAPIs, 'related-to', 0.8)
  memory.addRelation(imageProcessing, dataVisualization, 'related-to', 0.8)
  memory.addRelation(rayTracing, modeling3D, 'related-to', 0.85)

  // ── Distributed Systems & Microservices concepts ───────────────────────
  const distSystems = memory.addConcept('Distributed Systems', 'architecture')
  const distributedTheory = memory.addConcept('Distributed Theory', 'architecture')
  const distMessageQueues = memory.addConcept('Message Queues & Events', 'architecture')
  const distMicroservices = memory.addConcept('Microservices Architecture', 'architecture')
  const distributedData = memory.addConcept('Distributed Data', 'architecture')
  const containerOrchestration = memory.addConcept('Container Orchestration', 'architecture')
  const distObservability = memory.addConcept('Observability & Monitoring', 'architecture')
  memory.addRelation(distributedTheory, distSystems, 'part-of', 0.95)
  memory.addRelation(distMessageQueues, distSystems, 'part-of', 0.9)
  memory.addRelation(distMicroservices, distSystems, 'part-of', 0.9)
  memory.addRelation(distributedData, distSystems, 'part-of', 0.9)
  memory.addRelation(containerOrchestration, distSystems, 'part-of', 0.85)
  memory.addRelation(distObservability, distSystems, 'part-of', 0.85)
  memory.addRelation(distMicroservices, distMessageQueues, 'related-to', 0.9)
  memory.addRelation(distributedData, distributedTheory, 'related-to', 0.9)
  memory.addRelation(containerOrchestration, distMicroservices, 'related-to', 0.9)
  memory.addRelation(distObservability, distMicroservices, 'related-to', 0.85)
  memory.addRelation(distMessageQueues, distributedData, 'related-to', 0.8)

  // ── Bioinformatics & Computational Biology concepts ────────────────────
  const bioinformatics = memory.addConcept('Bioinformatics', 'biology')
  const sequenceAnalysis = memory.addConcept('Sequence Analysis', 'biology')
  const structuralBio = memory.addConcept('Structural Bioinformatics', 'biology')
  const omicsAnalysis = memory.addConcept('Omics Data Analysis', 'biology')
  const bioTools = memory.addConcept('Bioinformatics Tools', 'biology')
  const mlBiology = memory.addConcept('ML in Biology', 'biology')
  memory.addRelation(sequenceAnalysis, bioinformatics, 'part-of', 0.95)
  memory.addRelation(structuralBio, bioinformatics, 'part-of', 0.9)
  memory.addRelation(omicsAnalysis, bioinformatics, 'part-of', 0.9)
  memory.addRelation(bioTools, bioinformatics, 'part-of', 0.85)
  memory.addRelation(mlBiology, bioinformatics, 'part-of', 0.85)
  memory.addRelation(sequenceAnalysis, structuralBio, 'related-to', 0.9)
  memory.addRelation(omicsAnalysis, sequenceAnalysis, 'related-to', 0.9)
  memory.addRelation(bioTools, sequenceAnalysis, 'related-to', 0.85)
  memory.addRelation(mlBiology, structuralBio, 'related-to', 0.85)
  memory.addRelation(bioTools, omicsAnalysis, 'related-to', 0.8)

  // ── Audio & Signal Processing concepts ─────────────────────────────────
  const audioSignal = memory.addConcept('Audio & Signal Processing', 'audio')
  const digitalAudio = memory.addConcept('Digital Audio Fundamentals', 'audio')
  const audioSynthesis = memory.addConcept('Audio Synthesis', 'audio')
  const webAudio = memory.addConcept('Web Audio', 'audio')
  const audioEffects = memory.addConcept('Audio Effects & DSP', 'audio')
  const speechAudio = memory.addConcept('Speech & Audio Analysis', 'audio')
  const musicIR = memory.addConcept('Music Information Retrieval', 'audio')
  memory.addRelation(digitalAudio, audioSignal, 'part-of', 0.95)
  memory.addRelation(audioSynthesis, audioSignal, 'part-of', 0.9)
  memory.addRelation(webAudio, audioSignal, 'part-of', 0.85)
  memory.addRelation(audioEffects, audioSignal, 'part-of', 0.9)
  memory.addRelation(speechAudio, audioSignal, 'part-of', 0.85)
  memory.addRelation(musicIR, audioSignal, 'part-of', 0.85)
  memory.addRelation(digitalAudio, audioSynthesis, 'related-to', 0.9)
  memory.addRelation(audioEffects, audioSynthesis, 'related-to', 0.9)
  memory.addRelation(webAudio, audioEffects, 'related-to', 0.85)
  memory.addRelation(speechAudio, digitalAudio, 'related-to', 0.85)
  memory.addRelation(musicIR, speechAudio, 'related-to', 0.8)

  // ── Software Architecture Patterns concepts ────────────────────────────
  const softwareArch = memory.addConcept('Software Architecture Patterns', 'architecture')
  const microservicesPatterns = memory.addConcept('Microservices Patterns', 'architecture')
  const cleanHexArch = memory.addConcept('Clean & Hexagonal Architecture', 'architecture')
  const cqrsEventSourcing = memory.addConcept('CQRS & Event Sourcing', 'architecture')
  const dddPatterns = memory.addConcept('Domain-Driven Design', 'architecture')
  const archGovernance = memory.addConcept('Architecture Governance', 'architecture')
  const altArchitectures = memory.addConcept('Alternative Architectures', 'architecture')
  memory.addRelation(microservicesPatterns, softwareArch, 'part-of', 0.95)
  memory.addRelation(cleanHexArch, softwareArch, 'part-of', 0.9)
  memory.addRelation(cqrsEventSourcing, softwareArch, 'part-of', 0.9)
  memory.addRelation(dddPatterns, softwareArch, 'part-of', 0.9)
  memory.addRelation(archGovernance, softwareArch, 'part-of', 0.8)
  memory.addRelation(altArchitectures, softwareArch, 'part-of', 0.85)
  memory.addRelation(dddPatterns, microservicesPatterns, 'related-to', 0.9)
  memory.addRelation(cqrsEventSourcing, microservicesPatterns, 'related-to', 0.85)
  memory.addRelation(cleanHexArch, dddPatterns, 'related-to', 0.9)
  memory.addRelation(archGovernance, cleanHexArch, 'related-to', 0.8)
  memory.addRelation(altArchitectures, microservicesPatterns, 'related-to', 0.8)

  // ── DevTools & Build Systems concepts ────────────────────────────────
  const devToolsBuild = memory.addConcept('DevTools & Build Systems', 'tooling')
  const jsBundlers = memory.addConcept('JavaScript Bundlers', 'tooling')
  const codeQualityTools = memory.addConcept('Code Quality Tools', 'tooling')
  const packageMonorepo = memory.addConcept('Package Managers & Monorepos', 'tooling')
  const devEnvironments = memory.addConcept('Dev Environments', 'tooling')
  const gitHooksCi = memory.addConcept('Git Hooks & CI', 'tooling')
  const browserDevToolsConcept = memory.addConcept('Browser DevTools', 'tooling')
  memory.addRelation(jsBundlers, devToolsBuild, 'part-of', 0.95)
  memory.addRelation(codeQualityTools, devToolsBuild, 'part-of', 0.9)
  memory.addRelation(packageMonorepo, devToolsBuild, 'part-of', 0.9)
  memory.addRelation(devEnvironments, devToolsBuild, 'part-of', 0.85)
  memory.addRelation(gitHooksCi, devToolsBuild, 'part-of', 0.9)
  memory.addRelation(browserDevToolsConcept, devToolsBuild, 'part-of', 0.85)
  memory.addRelation(codeQualityTools, jsBundlers, 'related-to', 0.85)
  memory.addRelation(gitHooksCi, codeQualityTools, 'related-to', 0.9)
  memory.addRelation(packageMonorepo, jsBundlers, 'related-to', 0.85)
  memory.addRelation(devEnvironments, packageMonorepo, 'related-to', 0.8)
  memory.addRelation(browserDevToolsConcept, codeQualityTools, 'related-to', 0.8)

  // ── AR/VR/XR Development concepts ───────────────────────────────────
  const arvrXr = memory.addConcept('AR/VR/XR Development', 'xr')
  const webXr = memory.addConcept('Web XR & Three.js', 'xr')
  const nativeXr = memory.addConcept('Native XR (Unity/Unreal)', 'xr')
  const spatialComputing = memory.addConcept('Spatial Computing', 'xr')
  const arTechnology = memory.addConcept('AR Technology', 'xr')
  const xrPerformance = memory.addConcept('XR Performance & UX', 'xr')
  memory.addRelation(webXr, arvrXr, 'part-of', 0.9)
  memory.addRelation(nativeXr, arvrXr, 'part-of', 0.95)
  memory.addRelation(spatialComputing, arvrXr, 'part-of', 0.9)
  memory.addRelation(arTechnology, arvrXr, 'part-of', 0.9)
  memory.addRelation(xrPerformance, arvrXr, 'part-of', 0.85)
  memory.addRelation(webXr, nativeXr, 'related-to', 0.8)
  memory.addRelation(spatialComputing, nativeXr, 'related-to', 0.85)
  memory.addRelation(arTechnology, spatialComputing, 'related-to', 0.9)
  memory.addRelation(xrPerformance, nativeXr, 'related-to', 0.9)
  memory.addRelation(webXr, arTechnology, 'related-to', 0.8)

  // ── LLM & Prompt Engineering concepts ───────────────────────────────
  const llmPrompt = memory.addConcept('LLM & Prompt Engineering', 'ai')
  const llmModels = memory.addConcept('Large Language Models', 'ai')
  const promptTechniques = memory.addConcept('Prompt Engineering Techniques', 'ai')
  const ragVectorDb = memory.addConcept('RAG & Vector Databases', 'ai')
  const llmFineTuning = memory.addConcept('LLM Fine-Tuning', 'ai')
  const aiAgents = memory.addConcept('AI Agents & Evaluation', 'ai')
  const localLlm = memory.addConcept('Local LLM & Deployment', 'ai')
  memory.addRelation(llmModels, llmPrompt, 'part-of', 0.95)
  memory.addRelation(promptTechniques, llmPrompt, 'part-of', 0.95)
  memory.addRelation(ragVectorDb, llmPrompt, 'part-of', 0.9)
  memory.addRelation(llmFineTuning, llmPrompt, 'part-of', 0.9)
  memory.addRelation(aiAgents, llmPrompt, 'part-of', 0.85)
  memory.addRelation(localLlm, llmPrompt, 'part-of', 0.85)
  memory.addRelation(promptTechniques, llmModels, 'related-to', 0.95)
  memory.addRelation(ragVectorDb, promptTechniques, 'related-to', 0.9)
  memory.addRelation(llmFineTuning, llmModels, 'related-to', 0.9)
  memory.addRelation(aiAgents, ragVectorDb, 'related-to', 0.85)
  memory.addRelation(localLlm, llmFineTuning, 'related-to', 0.85)

  // ── Geospatial & GIS concepts ───────────────────────────────────────
  const geospatialGis = memory.addConcept('Geospatial & GIS', 'geospatial')
  const webMappingLibs = memory.addConcept('Web Mapping Libraries', 'geospatial')
  const spatialDatabases = memory.addConcept('Spatial Databases & Formats', 'geospatial')
  const geoServices = memory.addConcept('Geospatial Services', 'geospatial')
  const gisDesktopAnalysis = memory.addConcept('GIS Desktop Analysis', 'geospatial')
  const geoToolsData = memory.addConcept('Geospatial Tools & Data', 'geospatial')
  memory.addRelation(webMappingLibs, geospatialGis, 'part-of', 0.95)
  memory.addRelation(spatialDatabases, geospatialGis, 'part-of', 0.9)
  memory.addRelation(geoServices, geospatialGis, 'part-of', 0.9)
  memory.addRelation(gisDesktopAnalysis, geospatialGis, 'part-of', 0.85)
  memory.addRelation(geoToolsData, geospatialGis, 'part-of', 0.85)
  memory.addRelation(webMappingLibs, spatialDatabases, 'related-to', 0.85)
  memory.addRelation(geoServices, spatialDatabases, 'related-to', 0.85)
  memory.addRelation(gisDesktopAnalysis, spatialDatabases, 'related-to', 0.9)
  memory.addRelation(geoToolsData, webMappingLibs, 'related-to', 0.85)
  memory.addRelation(geoServices, webMappingLibs, 'related-to', 0.9)

  // ── Accessibility (a11y) concepts ───────────────────────────────────
  const accessibilityA11y = memory.addConcept('Accessibility (a11y)', 'accessibility')
  const wcagAria = memory.addConcept('WCAG & WAI-ARIA', 'accessibility')
  const keyboardA11y = memory.addConcept('Keyboard Accessibility', 'accessibility')
  const visualCogA11y = memory.addConcept('Visual & Cognitive Accessibility', 'accessibility')
  const a11yTestingConcept = memory.addConcept('Accessibility Testing', 'accessibility')
  const semanticA11y = memory.addConcept('Semantic HTML & Components', 'accessibility')
  const inclusiveDesign = memory.addConcept('Inclusive Design & Compliance', 'accessibility')
  memory.addRelation(wcagAria, accessibilityA11y, 'part-of', 0.95)
  memory.addRelation(keyboardA11y, accessibilityA11y, 'part-of', 0.9)
  memory.addRelation(visualCogA11y, accessibilityA11y, 'part-of', 0.9)
  memory.addRelation(a11yTestingConcept, accessibilityA11y, 'part-of', 0.9)
  memory.addRelation(semanticA11y, accessibilityA11y, 'part-of', 0.9)
  memory.addRelation(inclusiveDesign, accessibilityA11y, 'part-of', 0.85)
  memory.addRelation(wcagAria, keyboardA11y, 'related-to', 0.9)
  memory.addRelation(semanticA11y, wcagAria, 'related-to', 0.9)
  memory.addRelation(a11yTestingConcept, wcagAria, 'related-to', 0.9)
  memory.addRelation(visualCogA11y, wcagAria, 'related-to', 0.85)
  memory.addRelation(inclusiveDesign, a11yTestingConcept, 'related-to', 0.8)

  // ── Data Engineering / ETL concepts ────────────────────────────────────────
  const dataEngineering = memory.addConcept('Data Engineering & ETL', 'data_engineering')
  const sparkProcessing = memory.addConcept('Apache Spark & Distributed Processing', 'data_engineering')
  const workflowOrchestration = memory.addConcept('Workflow Orchestration (Airflow/Dagster)', 'data_engineering')
  const modernDataStack = memory.addConcept('Modern Data Stack (dbt/Warehouse)', 'data_engineering')
  const eventStreaming = memory.addConcept('Event Streaming & Schema Management', 'data_engineering')
  const dataQualityGovernance = memory.addConcept('Data Quality & Governance', 'data_engineering')
  const dataArchPatterns = memory.addConcept('Data Architecture Patterns', 'data_engineering')
  memory.addRelation(sparkProcessing, dataEngineering, 'part-of', 0.95)
  memory.addRelation(workflowOrchestration, dataEngineering, 'part-of', 0.9)
  memory.addRelation(modernDataStack, dataEngineering, 'part-of', 0.9)
  memory.addRelation(eventStreaming, dataEngineering, 'part-of', 0.9)
  memory.addRelation(dataQualityGovernance, dataEngineering, 'part-of', 0.85)
  memory.addRelation(dataArchPatterns, dataEngineering, 'part-of', 0.85)
  memory.addRelation(sparkProcessing, eventStreaming, 'related-to', 0.85)
  memory.addRelation(modernDataStack, workflowOrchestration, 'related-to', 0.9)
  memory.addRelation(dataQualityGovernance, modernDataStack, 'related-to', 0.85)
  memory.addRelation(dataArchPatterns, modernDataStack, 'related-to', 0.9)
  memory.addRelation(eventStreaming, dataQualityGovernance, 'related-to', 0.8)

  // ── SRE concepts ───────────────────────────────────────────────────────────
  const sreConcept = memory.addConcept('Site Reliability Engineering', 'sre')
  const sliSloSla = memory.addConcept('SLIs, SLOs & SLAs', 'sre')
  const incidentMgmt = memory.addConcept('Incident Management & Postmortems', 'sre')
  const chaosEng = memory.addConcept('Chaos Engineering & Resilience', 'sre')
  const toilReduction = memory.addConcept('Toil Reduction & Automation', 'sre')
  const sreObservability = memory.addConcept('SRE Observability & Alerting', 'sre')
  const sreRelease = memory.addConcept('Release Engineering & Deployment', 'sre')
  memory.addRelation(sliSloSla, sreConcept, 'part-of', 0.95)
  memory.addRelation(incidentMgmt, sreConcept, 'part-of', 0.9)
  memory.addRelation(chaosEng, sreConcept, 'part-of', 0.9)
  memory.addRelation(toilReduction, sreConcept, 'part-of', 0.9)
  memory.addRelation(sreObservability, sreConcept, 'part-of', 0.9)
  memory.addRelation(sreRelease, sreConcept, 'part-of', 0.85)
  memory.addRelation(sliSloSla, sreObservability, 'related-to', 0.9)
  memory.addRelation(incidentMgmt, chaosEng, 'related-to', 0.85)
  memory.addRelation(toilReduction, sreRelease, 'related-to', 0.85)
  memory.addRelation(sreObservability, incidentMgmt, 'related-to', 0.9)
  memory.addRelation(chaosEng, sreRelease, 'related-to', 0.8)

  // ── Performance Engineering concepts ───────────────────────────────────────
  const perfEngineering = memory.addConcept('Performance Engineering', 'performance')
  const profilingConcept = memory.addConcept('CPU & Memory Profiling', 'performance')
  const loadTestingConcept = memory.addConcept('Load & Stress Testing', 'performance')
  const perfCachingStrategies = memory.addConcept('Caching Strategies & Patterns', 'performance')
  const memLatencyOpt = memory.addConcept('Memory & Latency Optimization', 'performance')
  const queryWebPerf = memory.addConcept('Query & Web Performance', 'performance')
  const perfMetrics = memory.addConcept('Performance Metrics & SLOs', 'performance')
  memory.addRelation(profilingConcept, perfEngineering, 'part-of', 0.95)
  memory.addRelation(loadTestingConcept, perfEngineering, 'part-of', 0.9)
  memory.addRelation(perfCachingStrategies, perfEngineering, 'part-of', 0.9)
  memory.addRelation(memLatencyOpt, perfEngineering, 'part-of', 0.9)
  memory.addRelation(queryWebPerf, perfEngineering, 'part-of', 0.9)
  memory.addRelation(perfMetrics, perfEngineering, 'part-of', 0.85)
  memory.addRelation(profilingConcept, memLatencyOpt, 'related-to', 0.9)
  memory.addRelation(loadTestingConcept, perfMetrics, 'related-to', 0.9)
  memory.addRelation(perfCachingStrategies, memLatencyOpt, 'related-to', 0.85)
  memory.addRelation(queryWebPerf, perfCachingStrategies, 'related-to', 0.85)
  memory.addRelation(perfMetrics, loadTestingConcept, 'related-to', 0.9)

  // ── Technical Writing / Documentation concepts ─────────────────────────────
  const techWriting = memory.addConcept('Technical Writing & Documentation', 'documentation')
  const apiDocsConcept = memory.addConcept('API Documentation (OpenAPI/Swagger)', 'documentation')
  const adrDesignDocs = memory.addConcept('ADRs & Design Documents', 'documentation')
  const diagramming = memory.addConcept('Diagramming (Mermaid/PlantUML)', 'documentation')
  const writingBestPractices = memory.addConcept('Writing Best Practices', 'documentation')
  const docSites = memory.addConcept('Documentation Sites & Platforms', 'documentation')
  const docLifecycle = memory.addConcept('Documentation Lifecycle & Quality', 'documentation')
  memory.addRelation(apiDocsConcept, techWriting, 'part-of', 0.95)
  memory.addRelation(adrDesignDocs, techWriting, 'part-of', 0.9)
  memory.addRelation(diagramming, techWriting, 'part-of', 0.9)
  memory.addRelation(writingBestPractices, techWriting, 'part-of', 0.9)
  memory.addRelation(docSites, techWriting, 'part-of', 0.85)
  memory.addRelation(docLifecycle, techWriting, 'part-of', 0.85)
  memory.addRelation(apiDocsConcept, docSites, 'related-to', 0.9)
  memory.addRelation(adrDesignDocs, writingBestPractices, 'related-to', 0.85)
  memory.addRelation(diagramming, adrDesignDocs, 'related-to', 0.85)
  memory.addRelation(docLifecycle, docSites, 'related-to', 0.85)
  memory.addRelation(writingBestPractices, docLifecycle, 'related-to', 0.8)

  // ── Open Source / Community concepts ───────────────────────────────────────
  const openSourceConcept = memory.addConcept('Open Source & Community', 'open_source')
  const ossLicensing = memory.addConcept('Open Source Licensing', 'open_source')
  const semverReleases = memory.addConcept('Semantic Versioning & Releases', 'open_source')
  const communityMgmt = memory.addConcept('Community Management & Governance', 'open_source')
  const ossOperations = memory.addConcept('Open Source Operations & CI/CD', 'open_source')
  const ossSustainability = memory.addConcept('OSS Sustainability & Funding', 'open_source')
  const ossContributing = memory.addConcept('Contributing & InnerSource', 'open_source')
  memory.addRelation(ossLicensing, openSourceConcept, 'part-of', 0.95)
  memory.addRelation(semverReleases, openSourceConcept, 'part-of', 0.9)
  memory.addRelation(communityMgmt, openSourceConcept, 'part-of', 0.9)
  memory.addRelation(ossOperations, openSourceConcept, 'part-of', 0.9)
  memory.addRelation(ossSustainability, openSourceConcept, 'part-of', 0.85)
  memory.addRelation(ossContributing, openSourceConcept, 'part-of', 0.85)
  memory.addRelation(ossLicensing, communityMgmt, 'related-to', 0.85)
  memory.addRelation(semverReleases, ossOperations, 'related-to', 0.9)
  memory.addRelation(communityMgmt, ossContributing, 'related-to', 0.9)
  memory.addRelation(ossOperations, semverReleases, 'related-to', 0.85)
  memory.addRelation(ossSustainability, communityMgmt, 'related-to', 0.8)

  // ── Privacy Engineering / GDPR concepts ────────────────────────────────────
  const privacyEng = memory.addConcept('Privacy Engineering & GDPR', 'privacy')
  const gdprFundamentals = memory.addConcept('GDPR Fundamentals & Principles', 'privacy')
  const privacyByDesign = memory.addConcept('Privacy by Design & Consent', 'privacy')
  const piiAnonymization = memory.addConcept('PII Handling & Anonymization', 'privacy')
  const dataSubjectRights = memory.addConcept('Data Subject Rights & Transfers', 'privacy')
  const ccpaCpra = memory.addConcept('CCPA/CPRA & Breach Response', 'privacy')
  const privacyTools = memory.addConcept('Privacy Engineering Tools', 'privacy')
  memory.addRelation(gdprFundamentals, privacyEng, 'part-of', 0.95)
  memory.addRelation(privacyByDesign, privacyEng, 'part-of', 0.9)
  memory.addRelation(piiAnonymization, privacyEng, 'part-of', 0.9)
  memory.addRelation(dataSubjectRights, privacyEng, 'part-of', 0.9)
  memory.addRelation(ccpaCpra, privacyEng, 'part-of', 0.85)
  memory.addRelation(privacyTools, privacyEng, 'part-of', 0.85)
  memory.addRelation(gdprFundamentals, privacyByDesign, 'related-to', 0.9)
  memory.addRelation(piiAnonymization, privacyByDesign, 'related-to', 0.85)
  memory.addRelation(dataSubjectRights, gdprFundamentals, 'related-to', 0.9)
  memory.addRelation(ccpaCpra, dataSubjectRights, 'related-to', 0.85)
  memory.addRelation(privacyTools, piiAnonymization, 'related-to', 0.8)

  // ── Edge Computing / Serverless concepts ───────────────────────────────────
  const edgeServerless = memory.addConcept('Edge Computing & Serverless', 'edge_computing')
  const awsLambdaConcept = memory.addConcept('AWS Lambda & FaaS', 'edge_computing')
  const edgePlatforms = memory.addConcept('Edge Platforms (Workers/Vercel/Deno)', 'edge_computing')
  const edgeCachingConcept = memory.addConcept('Edge Caching & Serverless DBs', 'edge_computing')
  const serverlessOrch = memory.addConcept('Serverless Orchestration & Monitoring', 'edge_computing')
  const coldStartOpt = memory.addConcept('Cold Start Optimization', 'edge_computing')
  memory.addRelation(awsLambdaConcept, edgeServerless, 'part-of', 0.95)
  memory.addRelation(edgePlatforms, edgeServerless, 'part-of', 0.9)
  memory.addRelation(edgeCachingConcept, edgeServerless, 'part-of', 0.9)
  memory.addRelation(serverlessOrch, edgeServerless, 'part-of', 0.85)
  memory.addRelation(coldStartOpt, edgeServerless, 'part-of', 0.85)
  memory.addRelation(awsLambdaConcept, coldStartOpt, 'related-to', 0.9)
  memory.addRelation(edgePlatforms, edgeCachingConcept, 'related-to', 0.85)
  memory.addRelation(serverlessOrch, awsLambdaConcept, 'related-to', 0.85)
  memory.addRelation(edgeCachingConcept, coldStartOpt, 'related-to', 0.8)
  memory.addRelation(edgePlatforms, awsLambdaConcept, 'related-to', 0.85)

  // ── Low-Code / No-Code concepts ────────────────────────────────────────────
  const lowCodeNoCode = memory.addConcept('Low-Code & No-Code', 'low_code')
  const internalTools = memory.addConcept('Internal Tool Builders (Retool)', 'low_code')
  const workflowAuto = memory.addConcept('Workflow Automation (Zapier/n8n)', 'low_code')
  const noCodePlatforms = memory.addConcept('No-Code Platforms (Airtable/Webflow)', 'low_code')
  const citizenDev = memory.addConcept('Citizen Development & Governance', 'low_code')
  memory.addRelation(internalTools, lowCodeNoCode, 'part-of', 0.95)
  memory.addRelation(workflowAuto, lowCodeNoCode, 'part-of', 0.9)
  memory.addRelation(noCodePlatforms, lowCodeNoCode, 'part-of', 0.9)
  memory.addRelation(citizenDev, lowCodeNoCode, 'part-of', 0.85)
  memory.addRelation(internalTools, workflowAuto, 'related-to', 0.85)
  memory.addRelation(noCodePlatforms, workflowAuto, 'related-to', 0.85)
  memory.addRelation(citizenDev, noCodePlatforms, 'related-to', 0.8)
  memory.addRelation(internalTools, noCodePlatforms, 'related-to', 0.8)
  memory.addRelation(citizenDev, workflowAuto, 'related-to', 0.8)

  // ── Infrastructure as Code concepts ────────────────────────────────────────
  const iacConcept = memory.addConcept('Infrastructure as Code (IaC)', 'iac')
  const terraformConcept = memory.addConcept('Terraform & HCL', 'iac')
  const iacAlternatives = memory.addConcept('Pulumi, CDK & Ansible', 'iac')
  const iacOps = memory.addConcept('IaC Operations & GitOps', 'iac')
  const iacTesting = memory.addConcept('IaC Testing & Compliance', 'iac')
  const driftDetection = memory.addConcept('Drift Detection & Remediation', 'iac')
  memory.addRelation(terraformConcept, iacConcept, 'part-of', 0.95)
  memory.addRelation(iacAlternatives, iacConcept, 'part-of', 0.9)
  memory.addRelation(iacOps, iacConcept, 'part-of', 0.9)
  memory.addRelation(iacTesting, iacConcept, 'part-of', 0.85)
  memory.addRelation(driftDetection, iacConcept, 'part-of', 0.85)
  memory.addRelation(terraformConcept, iacAlternatives, 'related-to', 0.85)
  memory.addRelation(iacOps, terraformConcept, 'related-to', 0.9)
  memory.addRelation(iacTesting, driftDetection, 'related-to', 0.85)
  memory.addRelation(driftDetection, iacOps, 'related-to', 0.85)
  memory.addRelation(iacTesting, terraformConcept, 'related-to', 0.8)

  // ── Observability / Monitoring concepts ────────────────────────────────────
  const observabilityTools = memory.addConcept('Observability Tools & Practices', 'observability')
  const promGrafana = memory.addConcept('Prometheus & Grafana', 'observability')
  const distTracing = memory.addConcept('Distributed Tracing (OpenTelemetry)', 'observability')
  const logAggregation = memory.addConcept('Log Aggregation & APM', 'observability')
  const syntheticMonitor = memory.addConcept('Synthetic & Real User Monitoring', 'observability')
  const alertRouting = memory.addConcept('Alert Routing & Escalation', 'observability')
  memory.addRelation(promGrafana, observabilityTools, 'part-of', 0.95)
  memory.addRelation(distTracing, observabilityTools, 'part-of', 0.9)
  memory.addRelation(logAggregation, observabilityTools, 'part-of', 0.9)
  memory.addRelation(syntheticMonitor, observabilityTools, 'part-of', 0.85)
  memory.addRelation(alertRouting, observabilityTools, 'part-of', 0.85)
  memory.addRelation(promGrafana, distTracing, 'related-to', 0.9)
  memory.addRelation(logAggregation, distTracing, 'related-to', 0.85)
  memory.addRelation(syntheticMonitor, alertRouting, 'related-to', 0.85)
  memory.addRelation(alertRouting, promGrafana, 'related-to', 0.85)
  memory.addRelation(logAggregation, promGrafana, 'related-to', 0.8)

  // ── Digital Twins / Simulation concepts ────────────────────────────────────
  const digitalTwinsConcept = memory.addConcept('Digital Twins & Simulation', 'simulation')
  const physicsSim = memory.addConcept('Physics Simulation & FEA', 'simulation')
  const agentBasedModel = memory.addConcept('Agent-Based Modeling', 'simulation')
  const monteCarloSim = memory.addConcept('Monte Carlo Simulation', 'simulation')
  const discreteEventSim = memory.addConcept('Discrete Event Simulation', 'simulation')
  const simOptimization = memory.addConcept('Simulation Optimization', 'simulation')
  memory.addRelation(physicsSim, digitalTwinsConcept, 'part-of', 0.95)
  memory.addRelation(agentBasedModel, digitalTwinsConcept, 'part-of', 0.9)
  memory.addRelation(monteCarloSim, digitalTwinsConcept, 'part-of', 0.9)
  memory.addRelation(discreteEventSim, digitalTwinsConcept, 'part-of', 0.85)
  memory.addRelation(simOptimization, digitalTwinsConcept, 'part-of', 0.85)
  memory.addRelation(monteCarloSim, simOptimization, 'related-to', 0.9)
  memory.addRelation(physicsSim, agentBasedModel, 'related-to', 0.8)
  memory.addRelation(discreteEventSim, monteCarloSim, 'related-to', 0.85)
  memory.addRelation(simOptimization, physicsSim, 'related-to', 0.85)
  memory.addRelation(agentBasedModel, discreteEventSim, 'related-to', 0.8)

  // ── Natural Language Generation (NLG) concepts ─────────────────────────────
  const nlgConcept = memory.addConcept('Natural Language Generation (NLG)', 'nlg')
  const nlgPipeline = memory.addConcept('NLG Pipeline & Templates', 'nlg')
  const textSummarization = memory.addConcept('Text Summarization & Paraphrasing', 'nlg')
  const dialogueSystems = memory.addConcept('Dialogue Systems & Response Gen', 'nlg')
  const dataToText = memory.addConcept('Data-to-Text Generation', 'nlg')
  const contentGen = memory.addConcept('Content Generation & SEO', 'nlg')
  memory.addRelation(nlgPipeline, nlgConcept, 'part-of', 0.95)
  memory.addRelation(textSummarization, nlgConcept, 'part-of', 0.9)
  memory.addRelation(dialogueSystems, nlgConcept, 'part-of', 0.9)
  memory.addRelation(dataToText, nlgConcept, 'part-of', 0.85)
  memory.addRelation(contentGen, nlgConcept, 'part-of', 0.85)
  memory.addRelation(nlgPipeline, dataToText, 'related-to', 0.9)
  memory.addRelation(textSummarization, dialogueSystems, 'related-to', 0.85)
  memory.addRelation(dialogueSystems, nlgPipeline, 'related-to', 0.85)
  memory.addRelation(dataToText, contentGen, 'related-to', 0.85)
  memory.addRelation(contentGen, textSummarization, 'related-to', 0.8)

  // ── Computer Vision & Image Processing concepts ──────────────────────────────
  const computerVision = memory.addConcept('Computer Vision & Image Processing', 'ai')
  const objectDetection = memory.addConcept('Object Detection & Recognition', 'ai')
  const imageSegmentation = memory.addConcept('Image Segmentation', 'ai')
  const opticalFlowMotion = memory.addConcept('Optical Flow & Motion Estimation', 'ai')
  const imageEnhancement = memory.addConcept('Image Enhancement & Restoration', 'ai')
  const vision3dDepth = memory.addConcept('3D Vision & Depth Estimation', 'ai')
  const videoAnalytics = memory.addConcept('Video Analytics & Tracking', 'ai')
  memory.addRelation(objectDetection, computerVision, 'part-of', 0.95)
  memory.addRelation(imageSegmentation, computerVision, 'part-of', 0.95)
  memory.addRelation(opticalFlowMotion, computerVision, 'part-of', 0.9)
  memory.addRelation(imageEnhancement, computerVision, 'part-of', 0.9)
  memory.addRelation(vision3dDepth, computerVision, 'part-of', 0.85)
  memory.addRelation(videoAnalytics, computerVision, 'part-of', 0.85)
  memory.addRelation(objectDetection, imageSegmentation, 'related-to', 0.9)
  memory.addRelation(opticalFlowMotion, videoAnalytics, 'related-to', 0.9)
  memory.addRelation(imageEnhancement, imageSegmentation, 'related-to', 0.85)
  memory.addRelation(vision3dDepth, opticalFlowMotion, 'related-to', 0.85)
  memory.addRelation(videoAnalytics, objectDetection, 'related-to', 0.85)

  // ── Cryptography & Applied Security concepts ─────────────────────────────────
  const cryptography = memory.addConcept('Cryptography & Applied Security', 'concept')
  const symmetricEncryption = memory.addConcept('Symmetric Encryption', 'concept')
  const publicKeyCrypto = memory.addConcept('Public-Key Cryptography', 'concept')
  const hashFunctionsMAC = memory.addConcept('Hash Functions & MACs', 'concept')
  const pqCryptoApplied = memory.addConcept('Post-Quantum Cryptography', 'concept')
  const zeroKnowledgeProofs = memory.addConcept('Zero-Knowledge Proofs', 'concept')
  const homomorphicEncryption = memory.addConcept('Homomorphic Encryption', 'concept')
  memory.addRelation(symmetricEncryption, cryptography, 'part-of', 0.95)
  memory.addRelation(publicKeyCrypto, cryptography, 'part-of', 0.95)
  memory.addRelation(hashFunctionsMAC, cryptography, 'part-of', 0.9)
  memory.addRelation(pqCryptoApplied, cryptography, 'part-of', 0.85)
  memory.addRelation(zeroKnowledgeProofs, cryptography, 'part-of', 0.85)
  memory.addRelation(homomorphicEncryption, cryptography, 'part-of', 0.8)
  memory.addRelation(symmetricEncryption, publicKeyCrypto, 'related-to', 0.9)
  memory.addRelation(hashFunctionsMAC, symmetricEncryption, 'related-to', 0.85)
  memory.addRelation(pqCryptoApplied, publicKeyCrypto, 'related-to', 0.85)
  memory.addRelation(zeroKnowledgeProofs, homomorphicEncryption, 'related-to', 0.85)
  memory.addRelation(homomorphicEncryption, publicKeyCrypto, 'related-to', 0.8)

  // ── Recommendation Systems & Personalization concepts ────────────────────────
  const recommendationSystems = memory.addConcept('Recommendation Systems & Personalization', 'ai')
  const collaborativeFiltering = memory.addConcept('Collaborative Filtering', 'ai')
  const contentBasedFiltering = memory.addConcept('Content-Based Filtering', 'ai')
  const knowledgeRecommender = memory.addConcept('Knowledge-Based Recommender', 'ai')
  const sessionBasedRec = memory.addConcept('Session-Based Recommendations', 'ai')
  const multiArmedBandits = memory.addConcept('Multi-Armed Bandits & Exploration', 'ai')
  const explainableRec = memory.addConcept('Explainable Recommendations', 'ai')
  memory.addRelation(collaborativeFiltering, recommendationSystems, 'part-of', 0.95)
  memory.addRelation(contentBasedFiltering, recommendationSystems, 'part-of', 0.95)
  memory.addRelation(knowledgeRecommender, recommendationSystems, 'part-of', 0.9)
  memory.addRelation(sessionBasedRec, recommendationSystems, 'part-of', 0.85)
  memory.addRelation(multiArmedBandits, recommendationSystems, 'part-of', 0.85)
  memory.addRelation(explainableRec, recommendationSystems, 'part-of', 0.85)
  memory.addRelation(collaborativeFiltering, contentBasedFiltering, 'related-to', 0.9)
  memory.addRelation(sessionBasedRec, collaborativeFiltering, 'related-to', 0.85)
  memory.addRelation(multiArmedBandits, sessionBasedRec, 'related-to', 0.85)
  memory.addRelation(explainableRec, contentBasedFiltering, 'related-to', 0.85)
  memory.addRelation(knowledgeRecommender, contentBasedFiltering, 'related-to', 0.8)

  // ── Data Visualization & Dashboarding concepts ───────────────────────────────
  const dataVizDashboard = memory.addConcept('Data Visualization & Dashboarding', 'concept')
  const chartGrammar = memory.addConcept('Chart Types & Grammar of Graphics', 'concept')
  const interactiveViz = memory.addConcept('Interactive Visualization', 'concept')
  const geospatialViz = memory.addConcept('Geospatial Visualization', 'concept')
  const dashboardDesign = memory.addConcept('Dashboard Design & Layout', 'concept')
  const dataStorytelling = memory.addConcept('Storytelling with Data', 'concept')
  const vizAccessibility = memory.addConcept('Accessibility in Visualization', 'concept')
  memory.addRelation(chartGrammar, dataVizDashboard, 'part-of', 0.95)
  memory.addRelation(interactiveViz, dataVizDashboard, 'part-of', 0.95)
  memory.addRelation(geospatialViz, dataVizDashboard, 'part-of', 0.9)
  memory.addRelation(dashboardDesign, dataVizDashboard, 'part-of', 0.9)
  memory.addRelation(dataStorytelling, dataVizDashboard, 'part-of', 0.85)
  memory.addRelation(vizAccessibility, dataVizDashboard, 'part-of', 0.85)
  memory.addRelation(chartGrammar, interactiveViz, 'related-to', 0.9)
  memory.addRelation(dashboardDesign, chartGrammar, 'related-to', 0.85)
  memory.addRelation(dataStorytelling, dashboardDesign, 'related-to', 0.85)
  memory.addRelation(geospatialViz, interactiveViz, 'related-to', 0.85)
  memory.addRelation(vizAccessibility, chartGrammar, 'related-to', 0.8)

  // ── Event-Driven Architecture & Messaging concepts ───────────────────────────
  const eventDrivenArch = memory.addConcept('Event-Driven Architecture & Messaging', 'pattern')
  const messageBrokers = memory.addConcept('Message Brokers & Queues', 'pattern')
  const eventSourcing = memory.addConcept('Event Sourcing', 'pattern')
  const cqrsPattern = memory.addConcept('CQRS Pattern', 'pattern')
  const sagaChoreography = memory.addConcept('Saga & Choreography', 'pattern')
  const edaStreamProcessing = memory.addConcept('EDA Stream Processing', 'pattern')
  const pubSubPatterns = memory.addConcept('Pub/Sub Patterns', 'pattern')
  memory.addRelation(messageBrokers, eventDrivenArch, 'part-of', 0.95)
  memory.addRelation(eventSourcing, eventDrivenArch, 'part-of', 0.95)
  memory.addRelation(cqrsPattern, eventDrivenArch, 'part-of', 0.9)
  memory.addRelation(sagaChoreography, eventDrivenArch, 'part-of', 0.9)
  memory.addRelation(edaStreamProcessing, eventDrivenArch, 'part-of', 0.85)
  memory.addRelation(pubSubPatterns, eventDrivenArch, 'part-of', 0.85)
  memory.addRelation(eventSourcing, cqrsPattern, 'related-to', 0.95)
  memory.addRelation(messageBrokers, pubSubPatterns, 'related-to', 0.9)
  memory.addRelation(sagaChoreography, eventSourcing, 'related-to', 0.85)
  memory.addRelation(edaStreamProcessing, messageBrokers, 'related-to', 0.85)
  memory.addRelation(pubSubPatterns, edaStreamProcessing, 'related-to', 0.8)

  // ── Real-Time Systems & Streaming concepts ───────────────────────────────────
  const realTimeSystems = memory.addConcept('Real-Time Systems & Streaming', 'concept')
  const streamProcessingEngines = memory.addConcept('Stream Processing Engines', 'concept')
  const websocketSSE = memory.addConcept('WebSocket & Server-Sent Events', 'concept')
  const realTimeAnalytics = memory.addConcept('Real-Time Analytics', 'concept')
  const lowLatencyNet = memory.addConcept('Low-Latency Networking', 'concept')
  const clockSyncOrdering = memory.addConcept('Clock Synchronization & Ordering', 'concept')
  const backpressureFlow = memory.addConcept('Backpressure & Flow Control', 'concept')
  memory.addRelation(streamProcessingEngines, realTimeSystems, 'part-of', 0.95)
  memory.addRelation(websocketSSE, realTimeSystems, 'part-of', 0.9)
  memory.addRelation(realTimeAnalytics, realTimeSystems, 'part-of', 0.9)
  memory.addRelation(lowLatencyNet, realTimeSystems, 'part-of', 0.85)
  memory.addRelation(clockSyncOrdering, realTimeSystems, 'part-of', 0.85)
  memory.addRelation(backpressureFlow, realTimeSystems, 'part-of', 0.85)
  memory.addRelation(streamProcessingEngines, realTimeAnalytics, 'related-to', 0.9)
  memory.addRelation(websocketSSE, lowLatencyNet, 'related-to', 0.85)
  memory.addRelation(backpressureFlow, streamProcessingEngines, 'related-to', 0.85)
  memory.addRelation(clockSyncOrdering, lowLatencyNet, 'related-to', 0.85)
  memory.addRelation(realTimeAnalytics, websocketSSE, 'related-to', 0.8)

  // ── Type Theory & Formal Methods concepts ────────────────────────────────────
  const typeTheoryFormal = memory.addConcept('Type Theory & Formal Methods', 'concept')
  const dependentTypes = memory.addConcept('Dependent Types', 'concept')
  const modelChecking = memory.addConcept('Model Checking', 'concept')
  const theoremProvers = memory.addConcept('Theorem Provers & Proof Assistants', 'concept')
  const formalVerification = memory.addConcept('Formal Verification', 'concept')
  const abstractInterpretation = memory.addConcept('Abstract Interpretation', 'concept')
  const contractDesign = memory.addConcept('Contract-Based Design', 'concept')
  memory.addRelation(dependentTypes, typeTheoryFormal, 'part-of', 0.95)
  memory.addRelation(modelChecking, typeTheoryFormal, 'part-of', 0.9)
  memory.addRelation(theoremProvers, typeTheoryFormal, 'part-of', 0.9)
  memory.addRelation(formalVerification, typeTheoryFormal, 'part-of', 0.9)
  memory.addRelation(abstractInterpretation, typeTheoryFormal, 'part-of', 0.85)
  memory.addRelation(contractDesign, typeTheoryFormal, 'part-of', 0.85)
  memory.addRelation(dependentTypes, theoremProvers, 'related-to', 0.9)
  memory.addRelation(modelChecking, formalVerification, 'related-to', 0.9)
  memory.addRelation(abstractInterpretation, modelChecking, 'related-to', 0.85)
  memory.addRelation(contractDesign, formalVerification, 'related-to', 0.85)
  memory.addRelation(theoremProvers, formalVerification, 'related-to', 0.85)

  // ── Scientific Computing & HPC concepts ──────────────────────────────────────
  const scientificHPC = memory.addConcept('Scientific Computing & HPC', 'concept')
  const parallelComputing = memory.addConcept('Parallel Computing', 'concept')
  const gpuComputingCUDA = memory.addConcept('GPU Computing & CUDA', 'concept')
  const mpiDistributedHPC = memory.addConcept('MPI & Distributed HPC', 'concept')
  const numericalMethods = memory.addConcept('Numerical Methods & Simulation', 'concept')
  const hpcStorageIO = memory.addConcept('HPC Storage & I/O', 'concept')
  const clusterManagement = memory.addConcept('Cluster Management & Scheduling', 'concept')
  memory.addRelation(parallelComputing, scientificHPC, 'part-of', 0.95)
  memory.addRelation(gpuComputingCUDA, scientificHPC, 'part-of', 0.95)
  memory.addRelation(mpiDistributedHPC, scientificHPC, 'part-of', 0.9)
  memory.addRelation(numericalMethods, scientificHPC, 'part-of', 0.9)
  memory.addRelation(hpcStorageIO, scientificHPC, 'part-of', 0.85)
  memory.addRelation(clusterManagement, scientificHPC, 'part-of', 0.85)
  memory.addRelation(parallelComputing, gpuComputingCUDA, 'related-to', 0.9)
  memory.addRelation(mpiDistributedHPC, parallelComputing, 'related-to', 0.9)
  memory.addRelation(numericalMethods, gpuComputingCUDA, 'related-to', 0.85)
  memory.addRelation(hpcStorageIO, clusterManagement, 'related-to', 0.85)
  memory.addRelation(clusterManagement, mpiDistributedHPC, 'related-to', 0.85)

  // ── FinTech & Payment Systems concepts ───────────────────────────────────────
  const finTechPayments = memory.addConcept('FinTech & Payment Systems', 'concept')
  const paymentProcessing = memory.addConcept('Payment Processing & Gateways', 'concept')
  const openBankingPSD2 = memory.addConcept('Open Banking & PSD2', 'concept')
  const lendingCredit = memory.addConcept('Lending & Credit Scoring', 'concept')
  const insuranceTech = memory.addConcept('InsurTech', 'concept')
  const tradingPlatforms = memory.addConcept('Trading Platforms & Algo Trading', 'concept')
  const regulatoryCompliance = memory.addConcept('Regulatory Compliance & KYC', 'concept')
  memory.addRelation(paymentProcessing, finTechPayments, 'part-of', 0.95)
  memory.addRelation(openBankingPSD2, finTechPayments, 'part-of', 0.9)
  memory.addRelation(lendingCredit, finTechPayments, 'part-of', 0.9)
  memory.addRelation(insuranceTech, finTechPayments, 'part-of', 0.85)
  memory.addRelation(tradingPlatforms, finTechPayments, 'part-of', 0.85)
  memory.addRelation(regulatoryCompliance, finTechPayments, 'part-of', 0.9)
  memory.addRelation(paymentProcessing, regulatoryCompliance, 'related-to', 0.9)
  memory.addRelation(openBankingPSD2, paymentProcessing, 'related-to', 0.85)
  memory.addRelation(lendingCredit, regulatoryCompliance, 'related-to', 0.85)
  memory.addRelation(tradingPlatforms, lendingCredit, 'related-to', 0.8)
  memory.addRelation(insuranceTech, lendingCredit, 'related-to', 0.8)

  // ── Healthcare IT & HIPAA concepts ───────────────────────────────────────────
  const healthcareIT = memory.addConcept('Healthcare IT & HIPAA', 'concept')
  const ehrFHIR = memory.addConcept('EHR & FHIR Standards', 'concept')
  const telemedicine = memory.addConcept('Telemedicine & Remote Care', 'concept')
  const medicalImagingIT = memory.addConcept('Medical Imaging IT', 'concept')
  const clinicalDecision = memory.addConcept('Clinical Decision Support', 'concept')
  const hipaaCompliance = memory.addConcept('HIPAA Compliance & PHI', 'concept')
  const healthDataAnalytics = memory.addConcept('Health Data Analytics', 'concept')
  memory.addRelation(ehrFHIR, healthcareIT, 'part-of', 0.95)
  memory.addRelation(telemedicine, healthcareIT, 'part-of', 0.9)
  memory.addRelation(medicalImagingIT, healthcareIT, 'part-of', 0.9)
  memory.addRelation(clinicalDecision, healthcareIT, 'part-of', 0.85)
  memory.addRelation(hipaaCompliance, healthcareIT, 'part-of', 0.95)
  memory.addRelation(healthDataAnalytics, healthcareIT, 'part-of', 0.85)
  memory.addRelation(ehrFHIR, hipaaCompliance, 'related-to', 0.9)
  memory.addRelation(clinicalDecision, ehrFHIR, 'related-to', 0.85)
  memory.addRelation(healthDataAnalytics, clinicalDecision, 'related-to', 0.85)
  memory.addRelation(telemedicine, hipaaCompliance, 'related-to', 0.85)
  memory.addRelation(medicalImagingIT, clinicalDecision, 'related-to', 0.8)

  // ── Graph Databases & Knowledge Graphs concepts ──────────────────────────────
  const graphDBKG = memory.addConcept('Graph Databases & Knowledge Graphs', 'database')
  const propertyGraphModel = memory.addConcept('Property Graph Model', 'database')
  const rdfSPARQL = memory.addConcept('RDF & SPARQL', 'database')
  const graphAlgorithms = memory.addConcept('Graph Algorithms', 'database')
  const kgConstruction = memory.addConcept('Knowledge Graph Construction', 'database')
  const graphNeuralNets = memory.addConcept('Graph Neural Networks', 'database')
  const graphVisualization = memory.addConcept('Graph Visualization', 'database')
  memory.addRelation(propertyGraphModel, graphDBKG, 'part-of', 0.95)
  memory.addRelation(rdfSPARQL, graphDBKG, 'part-of', 0.95)
  memory.addRelation(graphAlgorithms, graphDBKG, 'part-of', 0.9)
  memory.addRelation(kgConstruction, graphDBKG, 'part-of', 0.9)
  memory.addRelation(graphNeuralNets, graphDBKG, 'part-of', 0.85)
  memory.addRelation(graphVisualization, graphDBKG, 'part-of', 0.85)
  memory.addRelation(propertyGraphModel, graphAlgorithms, 'related-to', 0.9)
  memory.addRelation(rdfSPARQL, kgConstruction, 'related-to', 0.9)
  memory.addRelation(graphNeuralNets, graphAlgorithms, 'related-to', 0.85)
  memory.addRelation(kgConstruction, propertyGraphModel, 'related-to', 0.85)
  memory.addRelation(graphVisualization, graphAlgorithms, 'related-to', 0.8)

  // ── Chaos Engineering & Resilience concepts ──────────────────────────────────
  const chaosEngineering = memory.addConcept('Chaos Engineering & Resilience Testing', 'devops')
  const faultInjection = memory.addConcept('Fault Injection', 'devops')
  const gameDayExercises = memory.addConcept('GameDay Exercises', 'devops')
  const resiliencePatterns = memory.addConcept('Resilience Patterns', 'devops')
  const blastRadiusControl = memory.addConcept('Blast Radius Control', 'devops')
  const steadyStateHypothesis = memory.addConcept('Steady-State Hypothesis', 'devops')
  const chaosObservability = memory.addConcept('Observability for Chaos', 'devops')
  memory.addRelation(faultInjection, chaosEngineering, 'part-of', 0.95)
  memory.addRelation(gameDayExercises, chaosEngineering, 'part-of', 0.9)
  memory.addRelation(resiliencePatterns, chaosEngineering, 'part-of', 0.9)
  memory.addRelation(blastRadiusControl, chaosEngineering, 'part-of', 0.85)
  memory.addRelation(steadyStateHypothesis, chaosEngineering, 'part-of', 0.9)
  memory.addRelation(chaosObservability, chaosEngineering, 'part-of', 0.85)
  memory.addRelation(faultInjection, blastRadiusControl, 'related-to', 0.9)
  memory.addRelation(steadyStateHypothesis, faultInjection, 'related-to', 0.9)
  memory.addRelation(gameDayExercises, steadyStateHypothesis, 'related-to', 0.85)
  memory.addRelation(resiliencePatterns, faultInjection, 'related-to', 0.85)
  memory.addRelation(chaosObservability, steadyStateHypothesis, 'related-to', 0.85)

  // ── Advanced Algorithms & Data Structures concepts ────────────────────────────
  const advancedAlgoDS = memory.addConcept('Advanced Algorithms & Data Structures', 'algorithms')
  const dpAlgorithms = memory.addConcept('Dynamic Programming Algorithms', 'algorithms')
  const graphPathAlgorithms = memory.addConcept('Graph & Path Algorithms', 'algorithms')
  const stringMatchAlgorithms = memory.addConcept('String Matching Algorithms', 'algorithms')
  const probabilisticStructures = memory.addConcept('Probabilistic Data Structures', 'algorithms')
  const advancedTreeStructures = memory.addConcept('Advanced Tree Structures', 'algorithms')
  const divideConquerGreedy = memory.addConcept('Divide-and-Conquer & Greedy Strategies', 'algorithms')
  const complexityAnalysis = memory.addConcept('Algorithm Complexity Analysis', 'algorithms')
  memory.addRelation(dpAlgorithms, advancedAlgoDS, 'part-of', 0.95)
  memory.addRelation(graphPathAlgorithms, advancedAlgoDS, 'part-of', 0.95)
  memory.addRelation(stringMatchAlgorithms, advancedAlgoDS, 'part-of', 0.9)
  memory.addRelation(probabilisticStructures, advancedAlgoDS, 'part-of', 0.9)
  memory.addRelation(advancedTreeStructures, advancedAlgoDS, 'part-of', 0.9)
  memory.addRelation(divideConquerGreedy, advancedAlgoDS, 'part-of', 0.85)
  memory.addRelation(complexityAnalysis, advancedAlgoDS, 'part-of', 0.85)
  memory.addRelation(dpAlgorithms, graphPathAlgorithms, 'related-to', 0.85)
  memory.addRelation(stringMatchAlgorithms, dpAlgorithms, 'related-to', 0.8)
  memory.addRelation(advancedTreeStructures, probabilisticStructures, 'related-to', 0.8)
  memory.addRelation(divideConquerGreedy, graphPathAlgorithms, 'related-to', 0.85)

  // ── Concurrency & Parallelism Patterns concepts ─────────────────────────────
  const concurrencyParallelism = memory.addConcept('Concurrency & Parallelism Patterns', 'systems')
  const actorModelConcept = memory.addConcept('Actor Model & Message Passing', 'systems')
  const cspChannelsConcept = memory.addConcept('CSP & Channel-Based Concurrency', 'systems')
  const lockFreeAlgorithms = memory.addConcept('Lock-Free Algorithms & Atomics', 'systems')
  const memoryModelConcept = memory.addConcept('Memory Models & Ordering', 'systems')
  const stmConcept = memory.addConcept('Software Transactional Memory', 'systems')
  const threadPoolExecutors = memory.addConcept('Thread Pools & Structured Concurrency', 'systems')
  memory.addRelation(actorModelConcept, concurrencyParallelism, 'part-of', 0.95)
  memory.addRelation(cspChannelsConcept, concurrencyParallelism, 'part-of', 0.95)
  memory.addRelation(lockFreeAlgorithms, concurrencyParallelism, 'part-of', 0.9)
  memory.addRelation(memoryModelConcept, concurrencyParallelism, 'part-of', 0.9)
  memory.addRelation(stmConcept, concurrencyParallelism, 'part-of', 0.85)
  memory.addRelation(threadPoolExecutors, concurrencyParallelism, 'part-of', 0.85)
  memory.addRelation(actorModelConcept, cspChannelsConcept, 'related-to', 0.85)
  memory.addRelation(lockFreeAlgorithms, memoryModelConcept, 'related-to', 0.9)
  memory.addRelation(stmConcept, lockFreeAlgorithms, 'related-to', 0.85)
  memory.addRelation(threadPoolExecutors, actorModelConcept, 'related-to', 0.8)
  memory.addRelation(memoryModelConcept, stmConcept, 'related-to', 0.85)

  // ── Reactive Programming concepts ───────────────────────────────────────────
  const reactiveProgrammingConcept = memory.addConcept('Reactive Programming & Streams', 'architecture')
  const reactiveStreamsOps = memory.addConcept('Reactive Streams & Operators', 'architecture')
  const backpressureStrategies = memory.addConcept('Backpressure Strategies', 'architecture')
  const frpSignals = memory.addConcept('Functional Reactive Programming', 'architecture')
  const reactiveSystemsManifesto = memory.addConcept('Reactive Systems & Manifesto', 'architecture')
  const reactiveExtOps = memory.addConcept('Reactive Extension Operators', 'architecture')
  const reactiveErrorHandling = memory.addConcept('Reactive Error Handling', 'architecture')
  memory.addRelation(reactiveStreamsOps, reactiveProgrammingConcept, 'part-of', 0.95)
  memory.addRelation(backpressureStrategies, reactiveProgrammingConcept, 'part-of', 0.95)
  memory.addRelation(frpSignals, reactiveProgrammingConcept, 'part-of', 0.9)
  memory.addRelation(reactiveSystemsManifesto, reactiveProgrammingConcept, 'part-of', 0.9)
  memory.addRelation(reactiveExtOps, reactiveProgrammingConcept, 'part-of', 0.85)
  memory.addRelation(reactiveErrorHandling, reactiveProgrammingConcept, 'part-of', 0.85)
  memory.addRelation(reactiveStreamsOps, backpressureStrategies, 'related-to', 0.9)
  memory.addRelation(reactiveExtOps, reactiveStreamsOps, 'related-to', 0.9)
  memory.addRelation(reactiveErrorHandling, backpressureStrategies, 'related-to', 0.85)
  memory.addRelation(frpSignals, reactiveStreamsOps, 'related-to', 0.85)
  memory.addRelation(reactiveSystemsManifesto, reactiveErrorHandling, 'related-to', 0.8)

  // ── Metaprogramming & Code Generation concepts ──────────────────────────────
  const metaprogrammingConcept = memory.addConcept('Metaprogramming & Code Generation', 'languages')
  const runtimeReflectionConcept = memory.addConcept('Runtime Reflection & Introspection', 'languages')
  const compileTimeMetaprog = memory.addConcept('Compile-Time Metaprogramming', 'languages')
  const astManipulationConcept = memory.addConcept('AST Manipulation & Transforms', 'languages')
  const codeGenScaffolding = memory.addConcept('Code Generation & Scaffolding', 'languages')
  const aspectOrientedProg = memory.addConcept('Aspect-Oriented Programming', 'languages')
  const decoratorsAnnotations = memory.addConcept('Decorators & Annotations', 'languages')
  memory.addRelation(runtimeReflectionConcept, metaprogrammingConcept, 'part-of', 0.95)
  memory.addRelation(compileTimeMetaprog, metaprogrammingConcept, 'part-of', 0.95)
  memory.addRelation(astManipulationConcept, metaprogrammingConcept, 'part-of', 0.9)
  memory.addRelation(codeGenScaffolding, metaprogrammingConcept, 'part-of', 0.9)
  memory.addRelation(aspectOrientedProg, metaprogrammingConcept, 'part-of', 0.85)
  memory.addRelation(decoratorsAnnotations, metaprogrammingConcept, 'part-of', 0.85)
  memory.addRelation(runtimeReflectionConcept, astManipulationConcept, 'related-to', 0.9)
  memory.addRelation(compileTimeMetaprog, astManipulationConcept, 'related-to', 0.9)
  memory.addRelation(decoratorsAnnotations, runtimeReflectionConcept, 'related-to', 0.85)
  memory.addRelation(aspectOrientedProg, decoratorsAnnotations, 'related-to', 0.85)
  memory.addRelation(codeGenScaffolding, compileTimeMetaprog, 'related-to', 0.8)

  // ── Micro Frontends concepts ────────────────────────────────────────────────
  const microFrontendsConcept = memory.addConcept('Micro Frontends Architecture', 'frontend')
  const moduleFederationConcept = memory.addConcept('Module Federation & Import Maps', 'frontend')
  const mfeCompositionPatterns = memory.addConcept('Micro Frontend Composition Patterns', 'frontend')
  const mfeSharedState = memory.addConcept('Micro Frontend Shared State', 'frontend')
  const singleSpaFramework = memory.addConcept('Single-SPA Framework', 'frontend')
  const mfeWebComponents = memory.addConcept('Web Components for Micro Frontends', 'frontend')
  const mfeDeploymentStrategies = memory.addConcept('Micro Frontend Deployment Strategies', 'frontend')
  memory.addRelation(moduleFederationConcept, microFrontendsConcept, 'part-of', 0.95)
  memory.addRelation(mfeCompositionPatterns, microFrontendsConcept, 'part-of', 0.95)
  memory.addRelation(mfeSharedState, microFrontendsConcept, 'part-of', 0.9)
  memory.addRelation(singleSpaFramework, microFrontendsConcept, 'part-of', 0.9)
  memory.addRelation(mfeWebComponents, microFrontendsConcept, 'part-of', 0.85)
  memory.addRelation(mfeDeploymentStrategies, microFrontendsConcept, 'part-of', 0.85)
  memory.addRelation(moduleFederationConcept, mfeCompositionPatterns, 'related-to', 0.9)
  memory.addRelation(singleSpaFramework, mfeWebComponents, 'related-to', 0.9)
  memory.addRelation(mfeSharedState, singleSpaFramework, 'related-to', 0.85)
  memory.addRelation(mfeDeploymentStrategies, moduleFederationConcept, 'related-to', 0.85)
  memory.addRelation(mfeWebComponents, mfeCompositionPatterns, 'related-to', 0.8)

  // ── Refactoring & Code Smells concepts ──────────────────────────────────────
  const refactoringSmells = memory.addConcept('Refactoring & Code Smells', 'engineering')
  const codeSmellsCatalog = memory.addConcept('Code Smells Catalog', 'engineering')
  const refactoringTechniques = memory.addConcept('Refactoring Techniques', 'engineering')
  const solidPrinciplesApplied = memory.addConcept('SOLID Principles Applied', 'engineering')
  const legacyCodeStrategies = memory.addConcept('Legacy Code Strategies', 'engineering')
  const techDebtManagement = memory.addConcept('Technical Debt Management', 'engineering')
  const antiPatternsCatalog = memory.addConcept('Anti-Patterns Catalog', 'engineering')
  memory.addRelation(codeSmellsCatalog, refactoringSmells, 'part-of', 0.95)
  memory.addRelation(refactoringTechniques, refactoringSmells, 'part-of', 0.95)
  memory.addRelation(solidPrinciplesApplied, refactoringSmells, 'part-of', 0.9)
  memory.addRelation(legacyCodeStrategies, refactoringSmells, 'part-of', 0.9)
  memory.addRelation(techDebtManagement, refactoringSmells, 'part-of', 0.85)
  memory.addRelation(antiPatternsCatalog, refactoringSmells, 'part-of', 0.85)
  memory.addRelation(codeSmellsCatalog, refactoringTechniques, 'related-to', 0.9)
  memory.addRelation(solidPrinciplesApplied, codeSmellsCatalog, 'related-to', 0.85)
  memory.addRelation(legacyCodeStrategies, techDebtManagement, 'related-to', 0.9)
  memory.addRelation(antiPatternsCatalog, codeSmellsCatalog, 'related-to', 0.85)
  memory.addRelation(refactoringTechniques, legacyCodeStrategies, 'related-to', 0.8)

  // ── MLOps & Feature Engineering concepts ────────────────────────────────────
  const mlopsEngConcept = memory.addConcept('MLOps & Feature Engineering', 'ml')
  const mlPipelinesConcept = memory.addConcept('ML Pipelines & Orchestration', 'ml')
  const modelRegistryConcept = memory.addConcept('Model Registry & Deployment', 'ml')
  const featureStoreConcept = memory.addConcept('Feature Stores & Serving', 'ml')
  const dataVersioningConcept = memory.addConcept('Data Versioning & Lineage', 'ml')
  const experimentTrackingConcept = memory.addConcept('Experiment Tracking & Tuning', 'ml')
  const modelMonitoringConcept = memory.addConcept('Model Monitoring & Drift Detection', 'ml')
  memory.addRelation(mlPipelinesConcept, mlopsEngConcept, 'part-of', 0.95)
  memory.addRelation(modelRegistryConcept, mlopsEngConcept, 'part-of', 0.95)
  memory.addRelation(featureStoreConcept, mlopsEngConcept, 'part-of', 0.9)
  memory.addRelation(dataVersioningConcept, mlopsEngConcept, 'part-of', 0.9)
  memory.addRelation(experimentTrackingConcept, mlopsEngConcept, 'part-of', 0.85)
  memory.addRelation(modelMonitoringConcept, mlopsEngConcept, 'part-of', 0.85)
  memory.addRelation(mlPipelinesConcept, featureStoreConcept, 'related-to', 0.9)
  memory.addRelation(modelRegistryConcept, modelMonitoringConcept, 'related-to', 0.9)
  memory.addRelation(experimentTrackingConcept, mlPipelinesConcept, 'related-to', 0.85)
  memory.addRelation(dataVersioningConcept, experimentTrackingConcept, 'related-to', 0.85)
  memory.addRelation(modelMonitoringConcept, dataVersioningConcept, 'related-to', 0.8)

  // ── Advanced Testing Techniques concepts ────────────────────────────────────
  const advancedTestingConcept = memory.addConcept('Advanced Testing Techniques', 'testing')
  const propertyBasedTesting = memory.addConcept('Property-Based Testing', 'testing')
  const mutationTestingConcept = memory.addConcept('Mutation Testing', 'testing')
  const fuzzTestingConcept = memory.addConcept('Fuzz Testing & Coverage-Guided Fuzzing', 'testing')
  const contractTestingConcept = memory.addConcept('Contract Testing', 'testing')
  const formalSpecConcept = memory.addConcept('Formal Specification & Model Checking', 'testing')
  const chaosTestIntegration = memory.addConcept('Chaos Testing Integration', 'testing')
  memory.addRelation(propertyBasedTesting, advancedTestingConcept, 'part-of', 0.95)
  memory.addRelation(mutationTestingConcept, advancedTestingConcept, 'part-of', 0.95)
  memory.addRelation(fuzzTestingConcept, advancedTestingConcept, 'part-of', 0.9)
  memory.addRelation(contractTestingConcept, advancedTestingConcept, 'part-of', 0.9)
  memory.addRelation(formalSpecConcept, advancedTestingConcept, 'part-of', 0.85)
  memory.addRelation(chaosTestIntegration, advancedTestingConcept, 'part-of', 0.85)
  memory.addRelation(propertyBasedTesting, fuzzTestingConcept, 'related-to', 0.9)
  memory.addRelation(mutationTestingConcept, propertyBasedTesting, 'related-to', 0.85)
  memory.addRelation(contractTestingConcept, formalSpecConcept, 'related-to', 0.85)
  memory.addRelation(chaosTestIntegration, fuzzTestingConcept, 'related-to', 0.85)
  memory.addRelation(formalSpecConcept, mutationTestingConcept, 'related-to', 0.8)

  return memory
}
