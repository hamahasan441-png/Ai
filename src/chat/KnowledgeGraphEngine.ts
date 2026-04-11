/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  KnowledgeGraphEngine — Graph-based knowledge representation & inference   ║
 * ║                                                                            ║
 * ║  Builds and queries a knowledge graph of entities, relations, and          ║
 * ║  properties. Supports graph traversal, path finding, subgraph             ║
 * ║  extraction, relation inference, and semantic similarity.                   ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Entity management with types, properties, and aliases                 ║
 * ║    • Typed relations between entities (directed, weighted)                 ║
 * ║    • Graph traversal (BFS, DFS, shortest path)                            ║
 * ║    • Relation inference via transitivity and patterns                      ║
 * ║    • Subgraph extraction around focal entities                            ║
 * ║    • Entity similarity via shared relations/properties                     ║
 * ║    • Triple-based queries (subject-predicate-object)                      ║
 * ║    • Graph statistics and topology analysis                               ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EntityType =
  | 'concept'
  | 'person'
  | 'organization'
  | 'event'
  | 'location'
  | 'artifact'
  | 'process'
  | 'property'
  | 'custom'

export type RelationType =
  | 'is_a'
  | 'part_of'
  | 'has_property'
  | 'causes'
  | 'related_to'
  | 'depends_on'
  | 'created_by'
  | 'used_for'
  | 'located_in'
  | 'preceded_by'
  | 'followed_by'
  | 'similar_to'
  | 'opposite_of'
  | 'instance_of'
  | 'custom'

export interface KGEntity {
  readonly id: string
  readonly name: string
  readonly type: EntityType
  readonly properties: ReadonlyMap<string, string>
  readonly aliases: readonly string[]
  readonly createdAt: number
}

export interface KGRelation {
  readonly id: string
  readonly sourceId: string
  readonly targetId: string
  readonly type: RelationType
  readonly label: string
  readonly weight: number // 0-1 confidence
  readonly properties: ReadonlyMap<string, string>
  readonly bidirectional: boolean
}

export interface GraphPath {
  readonly entityIds: readonly string[]
  readonly relationIds: readonly string[]
  readonly totalWeight: number
  readonly length: number
}

export interface Subgraph {
  readonly focalEntityId: string
  readonly entities: readonly KGEntity[]
  readonly relations: readonly KGRelation[]
  readonly depth: number
}

export interface TripleQuery {
  readonly subject?: string // entity id or name
  readonly predicate?: RelationType
  readonly object?: string // entity id or name
}

export interface TripleResult {
  readonly subject: KGEntity
  readonly predicate: RelationType
  readonly object: KGEntity
  readonly relation: KGRelation
}

export interface EntitySimilarity {
  readonly entity1Id: string
  readonly entity2Id: string
  readonly score: number
  readonly sharedRelations: readonly string[]
  readonly sharedProperties: readonly string[]
}

export interface InferredRelation {
  readonly sourceId: string
  readonly targetId: string
  readonly type: RelationType
  readonly confidence: number
  readonly reasoning: string
  readonly viaEntities: readonly string[]
}

export interface GraphTopology {
  readonly entityCount: number
  readonly relationCount: number
  readonly avgDegree: number
  readonly maxDegree: number
  readonly components: number
  readonly density: number
  readonly mostConnected: readonly string[]
}

export interface KnowledgeGraphEngineConfig {
  readonly maxEntities: number
  readonly maxRelations: number
  readonly maxPathLength: number
  readonly maxSubgraphDepth: number
  readonly inferenceEnabled: boolean
  readonly similarityThreshold: number
}

export interface KnowledgeGraphEngineStats {
  readonly totalEntities: number
  readonly totalRelations: number
  readonly totalQueries: number
  readonly totalInferences: number
  readonly totalTraversals: number
  readonly feedbackCount: number
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_KNOWLEDGE_GRAPH_CONFIG: KnowledgeGraphEngineConfig = {
  maxEntities: 10000,
  maxRelations: 50000,
  maxPathLength: 10,
  maxSubgraphDepth: 3,
  inferenceEnabled: true,
  similarityThreshold: 0.3,
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

let _kgIdCounter = 0
function kgId(prefix: string): string {
  return `${prefix}_${++_kgIdCounter}_${Date.now().toString(36)}`
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class KnowledgeGraphEngine {
  private readonly config: KnowledgeGraphEngineConfig
  private readonly entities = new Map<string, KGEntity>()
  private readonly relations = new Map<string, KGRelation>()
  // adjacency: entityId → Set of relationIds
  private readonly outEdges = new Map<string, Set<string>>()
  private readonly inEdges = new Map<string, Set<string>>()
  private stats = {
    totalQueries: 0,
    totalInferences: 0,
    totalTraversals: 0,
    feedbackCount: 0,
  }

  constructor(config: Partial<KnowledgeGraphEngineConfig> = {}) {
    this.config = { ...DEFAULT_KNOWLEDGE_GRAPH_CONFIG, ...config }
  }

  // ── Entity operations ────────────────────────────────────────────────

  addEntity(
    name: string,
    type: EntityType,
    properties: Record<string, string> = {},
    aliases: string[] = [],
  ): KGEntity {
    const entity: KGEntity = {
      id: kgId('ent'),
      name,
      type,
      properties: new Map(Object.entries(properties)),
      aliases: [...aliases],
      createdAt: Date.now(),
    }
    this.entities.set(entity.id, entity)
    this.outEdges.set(entity.id, new Set())
    this.inEdges.set(entity.id, new Set())
    return entity
  }

  getEntity(id: string): KGEntity | null {
    return this.entities.get(id) ?? null
  }

  findEntitiesByName(name: string): KGEntity[] {
    const lower = name.toLowerCase()
    return [...this.entities.values()].filter(
      e =>
        e.name.toLowerCase().includes(lower) ||
        e.aliases.some(a => a.toLowerCase().includes(lower)),
    )
  }

  findEntitiesByType(type: EntityType): KGEntity[] {
    return [...this.entities.values()].filter(e => e.type === type)
  }

  removeEntity(id: string): boolean {
    if (!this.entities.has(id)) return false
    // Remove all connected relations
    const rels = [...(this.outEdges.get(id) ?? []), ...(this.inEdges.get(id) ?? [])]
    for (const relId of rels) {
      this.removeRelation(relId)
    }
    this.entities.delete(id)
    this.outEdges.delete(id)
    this.inEdges.delete(id)
    return true
  }

  // ── Relation operations ──────────────────────────────────────────────

  addRelation(
    sourceId: string,
    targetId: string,
    type: RelationType,
    label: string = '',
    weight: number = 1,
    bidirectional: boolean = false,
    properties: Record<string, string> = {},
  ): KGRelation | null {
    if (!this.entities.has(sourceId) || !this.entities.has(targetId)) return null
    const relation: KGRelation = {
      id: kgId('rel'),
      sourceId,
      targetId,
      type,
      label: label || type,
      weight: Math.max(0, Math.min(1, weight)),
      properties: new Map(Object.entries(properties)),
      bidirectional,
    }
    this.relations.set(relation.id, relation)
    this.outEdges.get(sourceId)?.add(relation.id)
    this.inEdges.get(targetId)?.add(relation.id)
    if (bidirectional) {
      this.outEdges.get(targetId)?.add(relation.id)
      this.inEdges.get(sourceId)?.add(relation.id)
    }
    return relation
  }

  getRelation(id: string): KGRelation | null {
    return this.relations.get(id) ?? null
  }

  getRelationsOf(entityId: string): KGRelation[] {
    const rels: KGRelation[] = []
    for (const rId of this.outEdges.get(entityId) ?? []) {
      const r = this.relations.get(rId)
      if (r) rels.push(r)
    }
    for (const rId of this.inEdges.get(entityId) ?? []) {
      const r = this.relations.get(rId)
      if (r && !rels.includes(r)) rels.push(r)
    }
    return rels
  }

  removeRelation(id: string): boolean {
    const rel = this.relations.get(id)
    if (!rel) return false
    this.outEdges.get(rel.sourceId)?.delete(id)
    this.inEdges.get(rel.targetId)?.delete(id)
    if (rel.bidirectional) {
      this.outEdges.get(rel.targetId)?.delete(id)
      this.inEdges.get(rel.sourceId)?.delete(id)
    }
    this.relations.delete(id)
    return true
  }

  // ── Querying (triples) ───────────────────────────────────────────────

  queryTriples(query: TripleQuery): TripleResult[] {
    this.stats.totalQueries++
    const results: TripleResult[] = []
    for (const rel of this.relations.values()) {
      const srcEntity = this.entities.get(rel.sourceId)
      const tgtEntity = this.entities.get(rel.targetId)
      if (!srcEntity || !tgtEntity) continue

      if (
        query.subject &&
        srcEntity.id !== query.subject &&
        srcEntity.name.toLowerCase() !== query.subject.toLowerCase()
      )
        continue
      if (query.predicate && rel.type !== query.predicate) continue
      if (
        query.object &&
        tgtEntity.id !== query.object &&
        tgtEntity.name.toLowerCase() !== query.object.toLowerCase()
      )
        continue

      results.push({ subject: srcEntity, predicate: rel.type, object: tgtEntity, relation: rel })
    }
    return results
  }

  // ── Graph traversal ──────────────────────────────────────────────────

  bfs(startId: string, maxDepth: number = 3): KGEntity[] {
    this.stats.totalTraversals++
    const visited = new Set<string>([startId])
    const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }]
    const result: KGEntity[] = []

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!
      const entity = this.entities.get(id)
      if (entity) result.push(entity)
      if (depth >= maxDepth) continue

      for (const relId of this.outEdges.get(id) ?? []) {
        const rel = this.relations.get(relId)
        if (!rel) continue
        const next = rel.sourceId === id ? rel.targetId : rel.sourceId
        if (!visited.has(next)) {
          visited.add(next)
          queue.push({ id: next, depth: depth + 1 })
        }
      }
    }
    return result
  }

  shortestPath(startId: string, endId: string): GraphPath | null {
    this.stats.totalTraversals++
    if (!this.entities.has(startId) || !this.entities.has(endId)) return null
    if (startId === endId)
      return { entityIds: [startId], relationIds: [], totalWeight: 0, length: 0 }

    const visited = new Set<string>([startId])
    const queue: Array<{ id: string; path: string[]; relPath: string[]; weight: number }> = [
      { id: startId, path: [startId], relPath: [], weight: 0 },
    ]

    while (queue.length > 0) {
      const current = queue.shift()!
      if (current.path.length > this.config.maxPathLength) continue

      for (const relId of this.outEdges.get(current.id) ?? []) {
        const rel = this.relations.get(relId)
        if (!rel) continue
        const next = rel.sourceId === current.id ? rel.targetId : rel.sourceId
        if (visited.has(next)) continue

        const newPath = [...current.path, next]
        const newRelPath = [...current.relPath, relId]
        const newWeight = current.weight + rel.weight

        if (next === endId) {
          return {
            entityIds: newPath,
            relationIds: newRelPath,
            totalWeight: newWeight,
            length: newPath.length - 1,
          }
        }

        visited.add(next)
        queue.push({ id: next, path: newPath, relPath: newRelPath, weight: newWeight })
      }
    }
    return null
  }

  // ── Subgraph extraction ──────────────────────────────────────────────

  extractSubgraph(focalEntityId: string, depth?: number): Subgraph | null {
    if (!this.entities.has(focalEntityId)) return null
    const maxD = depth ?? this.config.maxSubgraphDepth
    const entityIds = new Set<string>()
    const relationIds = new Set<string>()

    const queue: Array<{ id: string; d: number }> = [{ id: focalEntityId, d: 0 }]
    entityIds.add(focalEntityId)

    while (queue.length > 0) {
      const { id, d } = queue.shift()!
      if (d >= maxD) continue

      for (const relId of [...(this.outEdges.get(id) ?? []), ...(this.inEdges.get(id) ?? [])]) {
        const rel = this.relations.get(relId)
        if (!rel) continue
        relationIds.add(relId)
        const neighbor = rel.sourceId === id ? rel.targetId : rel.sourceId
        if (!entityIds.has(neighbor)) {
          entityIds.add(neighbor)
          queue.push({ id: neighbor, d: d + 1 })
        }
      }
    }

    return {
      focalEntityId,
      entities: [...entityIds].map(id => this.entities.get(id)!).filter(Boolean),
      relations: [...relationIds].map(id => this.relations.get(id)!).filter(Boolean),
      depth: maxD,
    }
  }

  // ── Inference ────────────────────────────────────────────────────────

  inferRelations(entityId: string): InferredRelation[] {
    if (!this.config.inferenceEnabled) return []
    this.stats.totalInferences++
    const inferred: InferredRelation[] = []

    // Transitive is_a: if A is_a B and B is_a C, then A is_a C
    const directIsA = this.queryTriples({ subject: entityId, predicate: 'is_a' })
    for (const triple of directIsA) {
      const secondLevel = this.queryTriples({ subject: triple.object.id, predicate: 'is_a' })
      for (const t2 of secondLevel) {
        if (t2.object.id !== entityId) {
          inferred.push({
            sourceId: entityId,
            targetId: t2.object.id,
            type: 'is_a',
            confidence: triple.relation.weight * t2.relation.weight * 0.8,
            reasoning: `Transitive: ${triple.subject.name} is_a ${triple.object.name} is_a ${t2.object.name}`,
            viaEntities: [triple.object.id],
          })
        }
      }
    }

    // If A part_of B and B has_property P, then A might have_property P
    const partOf = this.queryTriples({ subject: entityId, predicate: 'part_of' })
    for (const po of partOf) {
      const parentProps = this.queryTriples({ subject: po.object.id, predicate: 'has_property' })
      for (const pp of parentProps) {
        inferred.push({
          sourceId: entityId,
          targetId: pp.object.id,
          type: 'has_property',
          confidence: po.relation.weight * pp.relation.weight * 0.6,
          reasoning: `Inherited property: ${po.subject.name} part_of ${po.object.name} which has_property ${pp.object.name}`,
          viaEntities: [po.object.id],
        })
      }
    }

    return inferred
  }

  // ── Similarity ───────────────────────────────────────────────────────

  computeSimilarity(entityId1: string, entityId2: string): EntitySimilarity | null {
    const e1 = this.entities.get(entityId1)
    const e2 = this.entities.get(entityId2)
    if (!e1 || !e2) return null

    const rels1 = this.getRelationsOf(entityId1)
    const rels2 = this.getRelationsOf(entityId2)

    // Shared relation targets
    const targets1 = new Set(rels1.map(r => (r.sourceId === entityId1 ? r.targetId : r.sourceId)))
    const targets2 = new Set(rels2.map(r => (r.sourceId === entityId2 ? r.targetId : r.sourceId)))
    const sharedRelations: string[] = []
    for (const t of targets1) {
      if (targets2.has(t)) sharedRelations.push(t)
    }

    // Shared properties
    const props1 = new Set([...e1.properties.keys()])
    const props2 = new Set([...e2.properties.keys()])
    const sharedProperties: string[] = []
    for (const p of props1) {
      if (props2.has(p)) sharedProperties.push(p)
    }

    const unionRels = new Set([...targets1, ...targets2]).size
    const unionProps = new Set([...props1, ...props2]).size
    const relSim = unionRels > 0 ? sharedRelations.length / unionRels : 0
    const propSim = unionProps > 0 ? sharedProperties.length / unionProps : 0
    const typeSim = e1.type === e2.type ? 0.2 : 0
    const score = Math.min(1, relSim * 0.5 + propSim * 0.3 + typeSim)

    return { entity1Id: entityId1, entity2Id: entityId2, score, sharedRelations, sharedProperties }
  }

  // ── Topology ─────────────────────────────────────────────────────────

  getTopology(): GraphTopology {
    const degrees = new Map<string, number>()
    for (const id of this.entities.keys()) {
      degrees.set(id, (this.outEdges.get(id)?.size ?? 0) + (this.inEdges.get(id)?.size ?? 0))
    }
    const degreeValues = [...degrees.values()]
    const maxDegree = degreeValues.length > 0 ? Math.max(...degreeValues) : 0
    const avgDegree =
      degreeValues.length > 0 ? degreeValues.reduce((a, b) => a + b, 0) / degreeValues.length : 0

    // Simple component count via BFS
    const visited = new Set<string>()
    let components = 0
    for (const id of this.entities.keys()) {
      if (!visited.has(id)) {
        components++
        const q = [id]
        while (q.length > 0) {
          const cur = q.pop()!
          if (visited.has(cur)) continue
          visited.add(cur)
          for (const relId of [
            ...(this.outEdges.get(cur) ?? []),
            ...(this.inEdges.get(cur) ?? []),
          ]) {
            const rel = this.relations.get(relId)
            if (rel) {
              const neighbor = rel.sourceId === cur ? rel.targetId : rel.sourceId
              if (!visited.has(neighbor)) q.push(neighbor)
            }
          }
        }
      }
    }

    const n = this.entities.size
    const density = n > 1 ? (2 * this.relations.size) / (n * (n - 1)) : 0

    const sorted = [...degrees.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

    return {
      entityCount: this.entities.size,
      relationCount: this.relations.size,
      avgDegree,
      maxDegree,
      components,
      density,
      mostConnected: sorted.map(([id]) => id),
    }
  }

  // ── Stats & feedback ─────────────────────────────────────────────────

  getStats(): Readonly<KnowledgeGraphEngineStats> {
    return {
      totalEntities: this.entities.size,
      totalRelations: this.relations.size,
      totalQueries: this.stats.totalQueries,
      totalInferences: this.stats.totalInferences,
      totalTraversals: this.stats.totalTraversals,
      feedbackCount: this.stats.feedbackCount,
    }
  }

  provideFeedback(): void {
    this.stats.feedbackCount++
  }

  // ── Serialization ────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      entities: [...this.entities.values()].map(e => ({
        ...e,
        properties: Object.fromEntries(e.properties),
      })),
      relations: [...this.relations.values()].map(r => ({
        ...r,
        properties: Object.fromEntries(r.properties),
      })),
      stats: this.stats,
    })
  }

  static deserialize(
    json: string,
    config?: Partial<KnowledgeGraphEngineConfig>,
  ): KnowledgeGraphEngine {
    const engine = new KnowledgeGraphEngine(config)
    const data = JSON.parse(json)
    for (const e of data.entities ?? []) {
      const entity: KGEntity = { ...e, properties: new Map(Object.entries(e.properties ?? {})) }
      engine.entities.set(entity.id, entity)
      engine.outEdges.set(entity.id, new Set())
      engine.inEdges.set(entity.id, new Set())
    }
    for (const r of data.relations ?? []) {
      const relation: KGRelation = { ...r, properties: new Map(Object.entries(r.properties ?? {})) }
      engine.relations.set(relation.id, relation)
      engine.outEdges.get(relation.sourceId)?.add(relation.id)
      engine.inEdges.get(relation.targetId)?.add(relation.id)
      if (relation.bidirectional) {
        engine.outEdges.get(relation.targetId)?.add(relation.id)
        engine.inEdges.get(relation.sourceId)?.add(relation.id)
      }
    }
    if (data.stats) Object.assign(engine.stats, data.stats)
    return engine
  }
}
