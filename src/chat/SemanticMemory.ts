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

  return memory
}
