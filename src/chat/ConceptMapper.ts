// ─── ConceptMapper ─────────────────────────────────────────────────────────
// Phase 7 · Understanding · Concept Mapping & Knowledge Graph Navigation
//
// Builds, navigates, and reasons over concept maps (directed graphs of
// concepts and relationships).
//
// Features:
//   • Directed concept-relation graph with O(1) lookups
//   • BFS shortest-path and all-paths search with cycle detection
//   • Spreading activation with configurable decay
//   • Transitive inference and property inheritance along is_a chains
//   • Structural similarity via shared neighbours and properties
//   • Automated concept clustering with cohesion scoring
//   • Pre-built programming domain seed knowledge (~20 concepts)
//   • Full serialize / deserialize round-trip
// ────────────────────────────────────────────────────────────────────────────

// ── Exported Types ──────────────────────────────────────────────────────────

export interface ConceptMapperConfig {
  maxConcepts: number;
  maxRelations: number;
  enableInference: boolean;
  enableSimilarity: boolean;
  enableHierarchy: boolean;
  spreadingActivationDecay: number;
  maxPathDepth: number;
}

export interface ConceptMapperStats {
  totalConcepts: number;
  totalRelations: number;
  totalQueries: number;
  totalInferences: number;
  totalPathsFound: number;
  avgQueryTime: number;
  feedbackCount: number;
}

export type RelationType =
  | 'is_a'
  | 'has_a'
  | 'part_of'
  | 'causes'
  | 'enables'
  | 'requires'
  | 'similar_to'
  | 'opposite_of'
  | 'used_for'
  | 'example_of'
  | 'precedes'
  | 'follows';

export interface Concept {
  id: string;
  name: string;
  description: string;
  domain: string;
  properties: Map<string, string>;
  activation: number;
  tags: string[];
}

export interface Relation {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  weight: number;
  bidirectional: boolean;
  metadata: Record<string, string>;
}

export interface ConceptPath {
  concepts: string[];
  relations: RelationType[];
  totalWeight: number;
  length: number;
}

export interface ConceptCluster {
  id: string;
  name: string;
  concepts: string[];
  cohesion: number;
  centralConcept: string;
}

export interface InferenceResult {
  conclusion: string;
  premises: string[];
  confidence: number;
  ruleApplied: string;
}

export interface SimilarityResult {
  conceptA: string;
  conceptB: string;
  score: number;
  sharedProperties: string[];
  sharedRelations: string[];
}

export interface ConceptMapSummary {
  totalConcepts: number;
  totalRelations: number;
  domains: string[];
  topConcepts: Array<{ name: string; connections: number }>;
  clusters: ConceptCluster[];
}

export interface SpreadingActivationResult {
  activatedConcepts: Array<{ conceptId: string; activation: number }>;
  steps: number;
  totalActivated: number;
}

// ── Default Configuration ───────────────────────────────────────────────────

const DEFAULT_CONFIG: ConceptMapperConfig = {
  maxConcepts: 5000,
  maxRelations: 20000,
  enableInference: true,
  enableSimilarity: true,
  enableHierarchy: true,
  spreadingActivationDecay: 0.5,
  maxPathDepth: 8,
};

// ── Utility Functions ───────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ── Serialization helpers for Map<string, string> ───────────────────────────

function mapToEntries(m: Map<string, string>): Array<[string, string]> {
  return Array.from(m.entries());
}

function entriesToMap(entries: Array<[string, string]>): Map<string, string> {
  return new Map(entries);
}

// ── Seed Knowledge Builder ──────────────────────────────────────────────────

interface SeedConcept {
  name: string;
  description: string;
  domain: string;
  properties: Array<[string, string]>;
  tags: string[];
}

interface SeedRelation {
  sourceName: string;
  targetName: string;
  type: RelationType;
  weight: number;
  bidirectional: boolean;
}

function buildSeedConcepts(): SeedConcept[] {
  return [
    {
      name: 'Programming',
      description: 'The process of creating computer software using programming languages',
      domain: 'computer_science',
      properties: [['category', 'discipline'], ['level', 'fundamental']],
      tags: ['cs', 'software'],
    },
    {
      name: 'Algorithm',
      description: 'A step-by-step procedure for solving a problem or accomplishing a task',
      domain: 'computer_science',
      properties: [['category', 'concept'], ['level', 'fundamental']],
      tags: ['cs', 'math', 'logic'],
    },
    {
      name: 'Data Structure',
      description: 'A way of organizing and storing data for efficient access and modification',
      domain: 'computer_science',
      properties: [['category', 'concept'], ['level', 'fundamental']],
      tags: ['cs', 'data'],
    },
    {
      name: 'Variable',
      description: 'A named storage location in memory that holds a value',
      domain: 'programming',
      properties: [['category', 'construct'], ['level', 'basic']],
      tags: ['programming', 'memory'],
    },
    {
      name: 'Function',
      description: 'A reusable block of code that performs a specific task',
      domain: 'programming',
      properties: [['category', 'construct'], ['level', 'basic']],
      tags: ['programming', 'abstraction'],
    },
    {
      name: 'Class',
      description: 'A blueprint for creating objects that bundles data and behaviour',
      domain: 'oop',
      properties: [['category', 'construct'], ['paradigm', 'object-oriented']],
      tags: ['oop', 'abstraction'],
    },
    {
      name: 'Object',
      description: 'An instance of a class containing state and behaviour',
      domain: 'oop',
      properties: [['category', 'construct'], ['paradigm', 'object-oriented']],
      tags: ['oop', 'instance'],
    },
    {
      name: 'Inheritance',
      description: 'A mechanism where a class derives properties and behaviour from a parent class',
      domain: 'oop',
      properties: [['category', 'mechanism'], ['paradigm', 'object-oriented']],
      tags: ['oop', 'reuse'],
    },
    {
      name: 'Polymorphism',
      description: 'The ability of objects to take on many forms through shared interfaces',
      domain: 'oop',
      properties: [['category', 'mechanism'], ['paradigm', 'object-oriented']],
      tags: ['oop', 'flexibility'],
    },
    {
      name: 'Encapsulation',
      description: 'Bundling data and methods that operate on it while restricting direct access',
      domain: 'oop',
      properties: [['category', 'principle'], ['paradigm', 'object-oriented']],
      tags: ['oop', 'security'],
    },
    {
      name: 'Array',
      description: 'An ordered collection of elements accessible by index',
      domain: 'data_structures',
      properties: [['category', 'linear'], ['access', 'O(1)'], ['insertion', 'O(n)']],
      tags: ['data', 'linear', 'indexed'],
    },
    {
      name: 'Linked List',
      description: 'A linear collection of elements where each element points to the next',
      domain: 'data_structures',
      properties: [['category', 'linear'], ['access', 'O(n)'], ['insertion', 'O(1)']],
      tags: ['data', 'linear', 'dynamic'],
    },
    {
      name: 'Hash Map',
      description: 'A data structure that maps keys to values using a hash function',
      domain: 'data_structures',
      properties: [['category', 'associative'], ['access', 'O(1)'], ['insertion', 'O(1)']],
      tags: ['data', 'key-value', 'hashing'],
    },
    {
      name: 'Tree',
      description: 'A hierarchical data structure with a root node and child subtrees',
      domain: 'data_structures',
      properties: [['category', 'hierarchical'], ['access', 'O(log n)']],
      tags: ['data', 'hierarchical', 'recursive'],
    },
    {
      name: 'Graph',
      description: 'A data structure consisting of nodes and edges representing relationships',
      domain: 'data_structures',
      properties: [['category', 'non-linear'], ['traversal', 'BFS/DFS']],
      tags: ['data', 'network', 'relationships'],
    },
    {
      name: 'Sorting',
      description: 'Arranging elements in a defined order',
      domain: 'algorithms',
      properties: [['category', 'algorithm'], ['type', 'ordering']],
      tags: ['algorithm', 'ordering'],
    },
    {
      name: 'Recursion',
      description: 'A technique where a function calls itself to solve smaller sub-problems',
      domain: 'programming',
      properties: [['category', 'technique'], ['level', 'intermediate']],
      tags: ['programming', 'technique', 'divide-and-conquer'],
    },
    {
      name: 'Compiler',
      description: 'A program that translates source code into machine code',
      domain: 'computer_science',
      properties: [['category', 'tool'], ['type', 'translator']],
      tags: ['cs', 'tooling', 'translation'],
    },
    {
      name: 'Database',
      description: 'An organized collection of data stored and accessed electronically',
      domain: 'computer_science',
      properties: [['category', 'system'], ['type', 'storage']],
      tags: ['cs', 'data', 'persistence'],
    },
    {
      name: 'API',
      description: 'An interface that allows software components to communicate with each other',
      domain: 'software_engineering',
      properties: [['category', 'interface'], ['type', 'communication']],
      tags: ['software', 'integration', 'interface'],
    },
    {
      name: 'Testing',
      description: 'The process of evaluating software to find defects and verify correctness',
      domain: 'software_engineering',
      properties: [['category', 'practice'], ['type', 'quality']],
      tags: ['software', 'quality', 'verification'],
    },
    {
      name: 'Design Pattern',
      description: 'A reusable solution to a commonly occurring problem in software design',
      domain: 'software_engineering',
      properties: [['category', 'concept'], ['level', 'advanced']],
      tags: ['software', 'architecture', 'reuse'],
    },
  ];
}

function buildSeedRelations(): SeedRelation[] {
  return [
    { sourceName: 'Algorithm', targetName: 'Programming', type: 'part_of', weight: 0.9, bidirectional: false },
    { sourceName: 'Data Structure', targetName: 'Programming', type: 'part_of', weight: 0.9, bidirectional: false },
    { sourceName: 'Variable', targetName: 'Programming', type: 'part_of', weight: 0.8, bidirectional: false },
    { sourceName: 'Function', targetName: 'Programming', type: 'part_of', weight: 0.85, bidirectional: false },
    { sourceName: 'Class', targetName: 'Programming', type: 'part_of', weight: 0.8, bidirectional: false },
    { sourceName: 'Object', targetName: 'Class', type: 'example_of', weight: 0.95, bidirectional: false },
    { sourceName: 'Inheritance', targetName: 'Class', type: 'enables', weight: 0.9, bidirectional: false },
    { sourceName: 'Polymorphism', targetName: 'Inheritance', type: 'requires', weight: 0.8, bidirectional: false },
    { sourceName: 'Encapsulation', targetName: 'Class', type: 'enables', weight: 0.85, bidirectional: false },
    { sourceName: 'Array', targetName: 'Data Structure', type: 'is_a', weight: 0.95, bidirectional: false },
    { sourceName: 'Linked List', targetName: 'Data Structure', type: 'is_a', weight: 0.95, bidirectional: false },
    { sourceName: 'Hash Map', targetName: 'Data Structure', type: 'is_a', weight: 0.95, bidirectional: false },
    { sourceName: 'Tree', targetName: 'Data Structure', type: 'is_a', weight: 0.95, bidirectional: false },
    { sourceName: 'Graph', targetName: 'Data Structure', type: 'is_a', weight: 0.95, bidirectional: false },
    { sourceName: 'Sorting', targetName: 'Algorithm', type: 'is_a', weight: 0.9, bidirectional: false },
    { sourceName: 'Sorting', targetName: 'Array', type: 'used_for', weight: 0.8, bidirectional: false },
    { sourceName: 'Recursion', targetName: 'Function', type: 'requires', weight: 0.85, bidirectional: false },
    { sourceName: 'Recursion', targetName: 'Tree', type: 'used_for', weight: 0.75, bidirectional: false },
    { sourceName: 'Tree', targetName: 'Graph', type: 'is_a', weight: 0.85, bidirectional: false },
    { sourceName: 'Compiler', targetName: 'Programming', type: 'enables', weight: 0.9, bidirectional: false },
    { sourceName: 'Database', targetName: 'Data Structure', type: 'requires', weight: 0.7, bidirectional: false },
    { sourceName: 'API', targetName: 'Function', type: 'has_a', weight: 0.8, bidirectional: false },
    { sourceName: 'Testing', targetName: 'Programming', type: 'part_of', weight: 0.85, bidirectional: false },
    { sourceName: 'Design Pattern', targetName: 'Class', type: 'used_for', weight: 0.8, bidirectional: false },
    { sourceName: 'Design Pattern', targetName: 'Inheritance', type: 'used_for', weight: 0.7, bidirectional: false },
    { sourceName: 'Design Pattern', targetName: 'Polymorphism', type: 'used_for', weight: 0.7, bidirectional: false },
    { sourceName: 'Linked List', targetName: 'Array', type: 'similar_to', weight: 0.6, bidirectional: true },
    { sourceName: 'Inheritance', targetName: 'Encapsulation', type: 'similar_to', weight: 0.5, bidirectional: true },
  ];
}

// ── Inverse relation helpers ────────────────────────────────────────────────

const HIERARCHY_UP: ReadonlySet<RelationType> = new Set(['is_a', 'part_of']);
const HIERARCHY_DOWN_MAP: ReadonlyMap<RelationType, RelationType> = new Map([
  ['is_a', 'is_a'],
  ['part_of', 'part_of'],
]);

function isHierarchyUp(t: RelationType): boolean {
  return HIERARCHY_UP.has(t);
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class ConceptMapper {
  private readonly config: ConceptMapperConfig;
  private readonly concepts: Map<string, Concept> = new Map();
  private readonly relations: Map<string, Relation> = new Map();
  private readonly nameIndex: Map<string, string> = new Map(); // lowercase name → id
  private readonly outgoing: Map<string, Set<string>> = new Map(); // conceptId → relation ids
  private readonly incoming: Map<string, Set<string>> = new Map(); // conceptId → relation ids
  private readonly feedbackLog: Array<{ source: string; target: string; type: RelationType; timestamp: number }> = [];
  private totalQueries = 0;
  private totalInferences = 0;
  private totalPathsFound = 0;
  private queryTimesMs: number[] = [];
  private feedbackCount = 0;

  constructor(config?: Partial<ConceptMapperConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.seedProgrammingDomain();
  }

  // ── Seed Knowledge ──────────────────────────────────────────────────────

  private seedProgrammingDomain(): void {
    const seedConcepts = buildSeedConcepts();
    const nameToId = new Map<string, string>();

    for (const sc of seedConcepts) {
      const concept = this.addConcept({
        name: sc.name,
        description: sc.description,
        domain: sc.domain,
        properties: new Map(sc.properties),
        tags: sc.tags,
      });
      nameToId.set(sc.name, concept.id);
    }

    const seedRelations = buildSeedRelations();
    for (const sr of seedRelations) {
      const srcId = nameToId.get(sr.sourceName);
      const tgtId = nameToId.get(sr.targetName);
      if (srcId && tgtId) {
        this.addRelation(srcId, tgtId, sr.type, sr.weight);
        if (sr.bidirectional) {
          const rel = this.getRelationBetween(srcId, tgtId, sr.type);
          if (rel) {
            rel.bidirectional = true;
          }
        }
      }
    }
  }

  // ── Concept CRUD ────────────────────────────────────────────────────────

  /** Add a new concept to the map. Returns the created Concept with generated id. */
  addConcept(concept: Omit<Concept, 'id' | 'activation'>): Concept {
    if (this.concepts.size >= this.config.maxConcepts) {
      throw new Error(`Maximum concept limit (${this.config.maxConcepts}) reached`);
    }

    const id = generateId('CON');
    const created: Concept = {
      id,
      name: concept.name,
      description: concept.description,
      domain: concept.domain,
      properties: new Map(concept.properties),
      activation: 0,
      tags: [...concept.tags],
    };

    this.concepts.set(id, created);
    this.nameIndex.set(concept.name.toLowerCase(), id);
    this.outgoing.set(id, new Set());
    this.incoming.set(id, new Set());

    return created;
  }

  /** Retrieve a concept by its unique id. */
  getConcept(id: string): Concept | null {
    return this.concepts.get(id) ?? null;
  }

  /** Find a concept by exact name (case-insensitive). */
  findConcept(name: string): Concept | null {
    const id = this.nameIndex.get(name.toLowerCase());
    if (!id) return null;
    return this.concepts.get(id) ?? null;
  }

  /** Remove a concept and all its relations from the map. */
  removeConcept(id: string): boolean {
    const concept = this.concepts.get(id);
    if (!concept) return false;

    // Remove all relations touching this concept
    const relIds = new Set<string>();
    const out = this.outgoing.get(id);
    if (out) {
      for (const rid of out) relIds.add(rid);
    }
    const inc = this.incoming.get(id);
    if (inc) {
      for (const rid of inc) relIds.add(rid);
    }

    for (const rid of relIds) {
      this.removeRelationInternal(rid);
    }

    this.concepts.delete(id);
    this.nameIndex.delete(concept.name.toLowerCase());
    this.outgoing.delete(id);
    this.incoming.delete(id);

    return true;
  }

  // ── Relation CRUD ───────────────────────────────────────────────────────

  /** Add a directed relation between two concepts. */
  addRelation(
    source: string,
    target: string,
    type: RelationType,
    weight?: number,
  ): Relation {
    if (this.relations.size >= this.config.maxRelations) {
      throw new Error(`Maximum relation limit (${this.config.maxRelations}) reached`);
    }
    if (!this.concepts.has(source)) {
      throw new Error(`Source concept '${source}' not found`);
    }
    if (!this.concepts.has(target)) {
      throw new Error(`Target concept '${target}' not found`);
    }

    const id = generateId('REL');
    const relation: Relation = {
      id,
      source,
      target,
      type,
      weight: clamp(weight ?? 0.5, 0, 1),
      bidirectional: false,
      metadata: {},
    };

    this.relations.set(id, relation);
    this.getOrCreateSet(this.outgoing, source).add(id);
    this.getOrCreateSet(this.incoming, target).add(id);

    return relation;
  }

  /** Retrieve a relation by its unique id. */
  getRelation(id: string): Relation | null {
    return this.relations.get(id) ?? null;
  }

  /** Remove a relation from the map. */
  removeRelation(id: string): boolean {
    return this.removeRelationInternal(id);
  }

  private removeRelationInternal(id: string): boolean {
    const rel = this.relations.get(id);
    if (!rel) return false;

    this.relations.delete(id);
    this.outgoing.get(rel.source)?.delete(id);
    this.incoming.get(rel.target)?.delete(id);

    return true;
  }

  private getOrCreateSet(map: Map<string, Set<string>>, key: string): Set<string> {
    let s = map.get(key);
    if (!s) {
      s = new Set();
      map.set(key, s);
    }
    return s;
  }

  /** Find a relation between two specific concepts with a given type. */
  private getRelationBetween(
    sourceId: string,
    targetId: string,
    type: RelationType,
  ): Relation | null {
    const out = this.outgoing.get(sourceId);
    if (!out) return null;
    for (const rid of out) {
      const rel = this.relations.get(rid);
      if (rel && rel.target === targetId && rel.type === type) {
        return rel;
      }
    }
    return null;
  }

  // ── Graph Navigation ────────────────────────────────────────────────────

  /** Get all concepts directly related to the given concept. */
  getRelated(conceptId: string, relationType?: RelationType): Concept[] {
    const startTime = Date.now();
    const result: Concept[] = [];
    const seen = new Set<string>();

    // Outgoing relations
    const out = this.outgoing.get(conceptId);
    if (out) {
      for (const rid of out) {
        const rel = this.relations.get(rid);
        if (!rel) continue;
        if (relationType && rel.type !== relationType) continue;
        if (!seen.has(rel.target)) {
          seen.add(rel.target);
          const c = this.concepts.get(rel.target);
          if (c) result.push(c);
        }
      }
    }

    // Incoming bidirectional or reversed relations
    const inc = this.incoming.get(conceptId);
    if (inc) {
      for (const rid of inc) {
        const rel = this.relations.get(rid);
        if (!rel) continue;
        if (relationType && rel.type !== relationType) continue;
        if (rel.bidirectional && !seen.has(rel.source)) {
          seen.add(rel.source);
          const c = this.concepts.get(rel.source);
          if (c) result.push(c);
        }
      }
    }

    this.recordQuery(Date.now() - startTime);
    return result;
  }

  /** Get ancestors of a concept by traversing is_a and part_of chains upward. */
  getAncestors(conceptId: string): Concept[] {
    if (!this.config.enableHierarchy) return [];

    const startTime = Date.now();
    const ancestors: Concept[] = [];
    const visited = new Set<string>();
    const queue: string[] = [conceptId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const out = this.outgoing.get(current);
      if (!out) continue;

      for (const rid of out) {
        const rel = this.relations.get(rid);
        if (!rel) continue;
        if (!isHierarchyUp(rel.type)) continue;
        if (visited.has(rel.target)) continue;

        visited.add(rel.target);
        const c = this.concepts.get(rel.target);
        if (c) {
          ancestors.push(c);
          queue.push(rel.target);
        }
      }
    }

    this.recordQuery(Date.now() - startTime);
    return ancestors;
  }

  /** Get descendants of a concept (inverse of ancestors via is_a / part_of). */
  getDescendants(conceptId: string): Concept[] {
    if (!this.config.enableHierarchy) return [];

    const startTime = Date.now();
    const descendants: Concept[] = [];
    const visited = new Set<string>();
    const queue: string[] = [conceptId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const inc = this.incoming.get(current);
      if (!inc) continue;

      for (const rid of inc) {
        const rel = this.relations.get(rid);
        if (!rel) continue;
        if (!isHierarchyUp(rel.type)) continue;
        if (visited.has(rel.source)) continue;

        visited.add(rel.source);
        const c = this.concepts.get(rel.source);
        if (c) {
          descendants.push(c);
          queue.push(rel.source);
        }
      }
    }

    this.recordQuery(Date.now() - startTime);
    return descendants;
  }

  // ── Pathfinding ─────────────────────────────────────────────────────────

  /** Find the shortest path between two concepts using BFS. */
  findPath(fromId: string, toId: string, maxDepth?: number): ConceptPath | null {
    const startTime = Date.now();
    const depth = maxDepth ?? this.config.maxPathDepth;

    if (!this.concepts.has(fromId) || !this.concepts.has(toId)) {
      this.recordQuery(Date.now() - startTime);
      return null;
    }

    if (fromId === toId) {
      this.recordQuery(Date.now() - startTime);
      return { concepts: [fromId], relations: [], totalWeight: 0, length: 0 };
    }

    // BFS with parent tracking
    const visited = new Set<string>();
    const parent = new Map<string, { prev: string; relType: RelationType; weight: number }>();
    const queue: Array<{ id: string; depth: number }> = [{ id: fromId, depth: 0 }];
    visited.add(fromId);

    while (queue.length > 0) {
      const { id: currentId, depth: currentDepth } = queue.shift()!;

      if (currentDepth >= depth) continue;

      const neighbours = this.getNeighbourEdges(currentId);
      for (const edge of neighbours) {
        if (visited.has(edge.targetId)) continue;
        visited.add(edge.targetId);
        parent.set(edge.targetId, {
          prev: currentId,
          relType: edge.relType,
          weight: edge.weight,
        });

        if (edge.targetId === toId) {
          const path = this.reconstructPath(fromId, toId, parent);
          this.totalPathsFound++;
          this.recordQuery(Date.now() - startTime);
          return path;
        }

        queue.push({ id: edge.targetId, depth: currentDepth + 1 });
      }
    }

    this.recordQuery(Date.now() - startTime);
    return null;
  }

  /** Find all paths between two concepts up to a given depth (DFS). */
  findAllPaths(fromId: string, toId: string, maxDepth?: number): ConceptPath[] {
    const startTime = Date.now();
    const depth = maxDepth ?? this.config.maxPathDepth;
    const allPaths: ConceptPath[] = [];

    if (!this.concepts.has(fromId) || !this.concepts.has(toId)) {
      this.recordQuery(Date.now() - startTime);
      return allPaths;
    }

    if (fromId === toId) {
      this.recordQuery(Date.now() - startTime);
      return [{ concepts: [fromId], relations: [], totalWeight: 0, length: 0 }];
    }

    const visited = new Set<string>();
    const currentPath: string[] = [];
    const currentRelTypes: RelationType[] = [];
    const currentWeights: number[] = [];

    const dfs = (nodeId: string, currentDepth: number): void => {
      if (currentDepth > depth) return;

      visited.add(nodeId);
      currentPath.push(nodeId);

      if (nodeId === toId) {
        allPaths.push({
          concepts: [...currentPath],
          relations: [...currentRelTypes],
          totalWeight: currentWeights.reduce((a, b) => a + b, 0),
          length: currentRelTypes.length,
        });
        visited.delete(nodeId);
        currentPath.pop();
        return;
      }

      const neighbours = this.getNeighbourEdges(nodeId);
      for (const edge of neighbours) {
        if (visited.has(edge.targetId)) continue;

        currentRelTypes.push(edge.relType);
        currentWeights.push(edge.weight);

        dfs(edge.targetId, currentDepth + 1);

        currentRelTypes.pop();
        currentWeights.pop();
      }

      visited.delete(nodeId);
      currentPath.pop();
    };

    dfs(fromId, 0);

    this.totalPathsFound += allPaths.length;
    this.recordQuery(Date.now() - startTime);
    return allPaths;
  }

  /** Get all reachable neighbours (outgoing + incoming bidirectional). */
  private getNeighbourEdges(
    nodeId: string,
  ): Array<{ targetId: string; relType: RelationType; weight: number }> {
    const edges: Array<{ targetId: string; relType: RelationType; weight: number }> = [];

    const out = this.outgoing.get(nodeId);
    if (out) {
      for (const rid of out) {
        const rel = this.relations.get(rid);
        if (rel) {
          edges.push({ targetId: rel.target, relType: rel.type, weight: rel.weight });
        }
      }
    }

    const inc = this.incoming.get(nodeId);
    if (inc) {
      for (const rid of inc) {
        const rel = this.relations.get(rid);
        if (rel && rel.bidirectional) {
          edges.push({ targetId: rel.source, relType: rel.type, weight: rel.weight });
        }
      }
    }

    return edges;
  }

  /** Reconstruct a path from BFS parent map. */
  private reconstructPath(
    fromId: string,
    toId: string,
    parent: Map<string, { prev: string; relType: RelationType; weight: number }>,
  ): ConceptPath {
    const concepts: string[] = [];
    const relations: RelationType[] = [];
    let totalWeight = 0;
    let current = toId;

    while (current !== fromId) {
      concepts.unshift(current);
      const p = parent.get(current)!;
      relations.unshift(p.relType);
      totalWeight += p.weight;
      current = p.prev;
    }
    concepts.unshift(fromId);

    return {
      concepts,
      relations,
      totalWeight: round2(totalWeight),
      length: relations.length,
    };
  }

  // ── Similarity ──────────────────────────────────────────────────────────

  /** Compute structural similarity between two concepts. */
  computeSimilarity(idA: string, idB: string): SimilarityResult {
    const startTime = Date.now();
    const conceptA = this.concepts.get(idA);
    const conceptB = this.concepts.get(idB);

    if (!conceptA || !conceptB || !this.config.enableSimilarity) {
      this.recordQuery(Date.now() - startTime);
      return {
        conceptA: idA,
        conceptB: idB,
        score: 0,
        sharedProperties: [],
        sharedRelations: [],
      };
    }

    // Shared properties
    const sharedProperties: string[] = [];
    for (const [key, valA] of conceptA.properties) {
      const valB = conceptB.properties.get(key);
      if (valB !== undefined && valA === valB) {
        sharedProperties.push(key);
      }
    }

    // Shared tags
    const tagsA = new Set(conceptA.tags);
    const tagsB = new Set(conceptB.tags);
    let sharedTagCount = 0;
    for (const t of tagsA) {
      if (tagsB.has(t)) sharedTagCount++;
    }

    // Shared neighbours
    const neighboursA = this.getNeighbourIds(idA);
    const neighboursB = this.getNeighbourIds(idB);
    const sharedNeighbours: string[] = [];
    for (const n of neighboursA) {
      if (neighboursB.has(n)) {
        sharedNeighbours.push(n);
      }
    }

    // Shared relation types
    const relTypesA = this.getRelationTypes(idA);
    const relTypesB = this.getRelationTypes(idB);
    const sharedRelations: string[] = [];
    for (const rt of relTypesA) {
      if (relTypesB.has(rt)) {
        sharedRelations.push(rt);
      }
    }

    // Jaccard-like similarity score
    const totalPropsA = conceptA.properties.size;
    const totalPropsB = conceptB.properties.size;
    const propUnion = new Set([
      ...Array.from(conceptA.properties.keys()),
      ...Array.from(conceptB.properties.keys()),
    ]).size;

    const tagUnion = new Set([...tagsA, ...tagsB]).size;
    const neighbourUnion = new Set([...neighboursA, ...neighboursB]).size;

    const propSim = propUnion > 0 ? sharedProperties.length / propUnion : 0;
    const tagSim = tagUnion > 0 ? sharedTagCount / tagUnion : 0;
    const neighbourSim = neighbourUnion > 0 ? sharedNeighbours.length / neighbourUnion : 0;
    const domainSim = conceptA.domain === conceptB.domain ? 1 : 0;

    const score = round2(clamp(
      propSim * 0.25 + tagSim * 0.25 + neighbourSim * 0.35 + domainSim * 0.15,
      0,
      1,
    ));

    this.recordQuery(Date.now() - startTime);
    return {
      conceptA: idA,
      conceptB: idB,
      score,
      sharedProperties,
      sharedRelations,
    };
  }

  /** Get all unique neighbour concept ids for a concept. */
  private getNeighbourIds(conceptId: string): Set<string> {
    const ids = new Set<string>();

    const out = this.outgoing.get(conceptId);
    if (out) {
      for (const rid of out) {
        const rel = this.relations.get(rid);
        if (rel) ids.add(rel.target);
      }
    }

    const inc = this.incoming.get(conceptId);
    if (inc) {
      for (const rid of inc) {
        const rel = this.relations.get(rid);
        if (rel) ids.add(rel.source);
      }
    }

    return ids;
  }

  /** Get all unique relation types for a concept. */
  private getRelationTypes(conceptId: string): Set<RelationType> {
    const types = new Set<RelationType>();

    const out = this.outgoing.get(conceptId);
    if (out) {
      for (const rid of out) {
        const rel = this.relations.get(rid);
        if (rel) types.add(rel.type);
      }
    }

    const inc = this.incoming.get(conceptId);
    if (inc) {
      for (const rid of inc) {
        const rel = this.relations.get(rid);
        if (rel) types.add(rel.type);
      }
    }

    return types;
  }

  // ── Spreading Activation ────────────────────────────────────────────────

  /** Perform spreading activation from a start concept. */
  spreadActivation(
    startId: string,
    initialEnergy?: number,
  ): SpreadingActivationResult {
    const startTime = Date.now();
    const energy = initialEnergy ?? 1.0;
    const decay = this.config.spreadingActivationDecay;

    if (!this.concepts.has(startId)) {
      this.recordQuery(Date.now() - startTime);
      return { activatedConcepts: [], steps: 0, totalActivated: 0 };
    }

    // Reset all activations
    for (const c of this.concepts.values()) {
      c.activation = 0;
    }

    const activationMap = new Map<string, number>();
    activationMap.set(startId, energy);

    const startConcept = this.concepts.get(startId)!;
    startConcept.activation = energy;

    let steps = 0;
    const maxSteps = this.config.maxPathDepth;
    const threshold = 0.01;

    let frontier = new Map<string, number>();
    frontier.set(startId, energy);

    while (frontier.size > 0 && steps < maxSteps) {
      steps++;
      const nextFrontier = new Map<string, number>();

      for (const [nodeId, nodeEnergy] of frontier) {
        const edges = this.getNeighbourEdges(nodeId);
        for (const edge of edges) {
          const spreadEnergy = nodeEnergy * decay * edge.weight;
          if (spreadEnergy < threshold) continue;

          const existing = activationMap.get(edge.targetId) ?? 0;
          const newActivation = existing + spreadEnergy;
          activationMap.set(edge.targetId, newActivation);

          const concept = this.concepts.get(edge.targetId);
          if (concept) {
            concept.activation = newActivation;
          }

          const prevFrontierEnergy = nextFrontier.get(edge.targetId) ?? 0;
          nextFrontier.set(edge.targetId, Math.max(prevFrontierEnergy, spreadEnergy));
        }
      }

      frontier = nextFrontier;
    }

    const activatedConcepts = Array.from(activationMap.entries())
      .map(([conceptId, activation]) => ({ conceptId, activation: round2(activation) }))
      .sort((a, b) => b.activation - a.activation);

    this.recordQuery(Date.now() - startTime);
    return {
      activatedConcepts,
      steps,
      totalActivated: activatedConcepts.length,
    };
  }

  // ── Inference ───────────────────────────────────────────────────────────

  /** Derive inferences for a concept using transitive and inheritance rules. */
  infer(conceptId: string): InferenceResult[] {
    const startTime = Date.now();
    const results: InferenceResult[] = [];

    if (!this.config.enableInference || !this.concepts.has(conceptId)) {
      this.recordQuery(Date.now() - startTime);
      return results;
    }

    const concept = this.concepts.get(conceptId)!;

    // Rule 1: Transitive is_a  (A is_a B ∧ B is_a C → A is_a C)
    this.inferTransitive(conceptId, 'is_a', results);

    // Rule 2: Transitive part_of  (A part_of B ∧ B part_of C → A part_of C)
    this.inferTransitive(conceptId, 'part_of', results);

    // Rule 3: Property inheritance along is_a chain
    this.inferPropertyInheritance(conceptId, results);

    // Rule 4: Transitive causality  (A causes B ∧ B causes C → A causes C)
    this.inferTransitive(conceptId, 'causes', results);

    // Rule 5: Requirement propagation  (A requires B ∧ B requires C → A requires C)
    this.inferTransitive(conceptId, 'requires', results);

    // Rule 6: Inverse inference  (if A is_a B, then B has descendant A)
    this.inferInverse(conceptId, results);

    // Rule 7: Sibling similarity  (if A is_a C and B is_a C, then A similar_to B)
    this.inferSiblingSimilarity(conceptId, results);

    this.totalInferences += results.length;
    this.recordQuery(Date.now() - startTime);
    return results;
  }

  /** Infer transitive relations of a given type. */
  private inferTransitive(
    conceptId: string,
    relType: RelationType,
    results: InferenceResult[],
  ): void {
    const concept = this.concepts.get(conceptId);
    if (!concept) return;

    // Find direct targets via relType
    const directTargets: Array<{ id: string; name: string }> = [];
    const out = this.outgoing.get(conceptId);
    if (out) {
      for (const rid of out) {
        const rel = this.relations.get(rid);
        if (rel && rel.type === relType) {
          const target = this.concepts.get(rel.target);
          if (target) {
            directTargets.push({ id: target.id, name: target.name });
          }
        }
      }
    }

    // For each direct target, find its targets (transitive step)
    for (const dt of directTargets) {
      const dtOut = this.outgoing.get(dt.id);
      if (!dtOut) continue;

      for (const rid of dtOut) {
        const rel = this.relations.get(rid);
        if (rel && rel.type === relType) {
          const transitiveTarget = this.concepts.get(rel.target);
          if (transitiveTarget) {
            // Check if we already have this direct relation
            const existing = this.getRelationBetween(conceptId, transitiveTarget.id, relType);
            if (!existing) {
              results.push({
                conclusion: `${concept.name} ${relType} ${transitiveTarget.name}`,
                premises: [
                  `${concept.name} ${relType} ${dt.name}`,
                  `${dt.name} ${relType} ${transitiveTarget.name}`,
                ],
                confidence: round2(0.8),
                ruleApplied: `transitive_${relType}`,
              });
            }
          }
        }
      }
    }
  }

  /** Infer properties inherited from ancestors along is_a chains. */
  private inferPropertyInheritance(
    conceptId: string,
    results: InferenceResult[],
  ): void {
    const concept = this.concepts.get(conceptId);
    if (!concept) return;

    const ancestors = this.getAncestorsViaIsA(conceptId);
    for (const ancestor of ancestors) {
      for (const [key, value] of ancestor.properties) {
        if (!concept.properties.has(key)) {
          results.push({
            conclusion: `${concept.name} inherits property '${key}=${value}' from ${ancestor.name}`,
            premises: [
              `${concept.name} is_a (chain to) ${ancestor.name}`,
              `${ancestor.name} has property '${key}=${value}'`,
            ],
            confidence: round2(0.7),
            ruleApplied: 'property_inheritance',
          });
        }
      }
    }
  }

  /** Get ancestors strictly via is_a chain. */
  private getAncestorsViaIsA(conceptId: string): Concept[] {
    const ancestors: Concept[] = [];
    const visited = new Set<string>();
    const queue: string[] = [conceptId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const out = this.outgoing.get(current);
      if (!out) continue;

      for (const rid of out) {
        const rel = this.relations.get(rid);
        if (!rel || rel.type !== 'is_a') continue;
        if (visited.has(rel.target)) continue;

        visited.add(rel.target);
        const c = this.concepts.get(rel.target);
        if (c) {
          ancestors.push(c);
          queue.push(rel.target);
        }
      }
    }

    return ancestors;
  }

  /** Infer inverse relations (descendants). */
  private inferInverse(
    conceptId: string,
    results: InferenceResult[],
  ): void {
    const concept = this.concepts.get(conceptId);
    if (!concept) return;

    const inc = this.incoming.get(conceptId);
    if (!inc) return;

    for (const rid of inc) {
      const rel = this.relations.get(rid);
      if (!rel) continue;
      if (rel.type === 'is_a') {
        const child = this.concepts.get(rel.source);
        if (child) {
          results.push({
            conclusion: `${concept.name} has subtype ${child.name}`,
            premises: [`${child.name} is_a ${concept.name}`],
            confidence: round2(0.95),
            ruleApplied: 'inverse_is_a',
          });
        }
      }
    }
  }

  /** Infer similarity between siblings sharing the same parent. */
  private inferSiblingSimilarity(
    conceptId: string,
    results: InferenceResult[],
  ): void {
    const concept = this.concepts.get(conceptId);
    if (!concept) return;

    // Find parents via is_a
    const parents: Array<{ id: string; name: string }> = [];
    const out = this.outgoing.get(conceptId);
    if (out) {
      for (const rid of out) {
        const rel = this.relations.get(rid);
        if (rel && rel.type === 'is_a') {
          const parent = this.concepts.get(rel.target);
          if (parent) {
            parents.push({ id: parent.id, name: parent.name });
          }
        }
      }
    }

    // For each parent, find other children (siblings)
    for (const p of parents) {
      const parentInc = this.incoming.get(p.id);
      if (!parentInc) continue;

      for (const rid of parentInc) {
        const rel = this.relations.get(rid);
        if (!rel || rel.type !== 'is_a') continue;
        if (rel.source === conceptId) continue;

        const sibling = this.concepts.get(rel.source);
        if (sibling) {
          results.push({
            conclusion: `${concept.name} similar_to ${sibling.name}`,
            premises: [
              `${concept.name} is_a ${p.name}`,
              `${sibling.name} is_a ${p.name}`,
            ],
            confidence: round2(0.6),
            ruleApplied: 'sibling_similarity',
          });
        }
      }
    }
  }

  // ── Clustering ──────────────────────────────────────────────────────────

  /** Group concepts into clusters based on connectivity. */
  clusterConcepts(): ConceptCluster[] {
    const startTime = Date.now();
    const visited = new Set<string>();
    const clusters: ConceptCluster[] = [];

    for (const conceptId of this.concepts.keys()) {
      if (visited.has(conceptId)) continue;

      // BFS to find connected component
      const component: string[] = [];
      const queue: string[] = [conceptId];
      visited.add(conceptId);

      while (queue.length > 0) {
        const current = queue.shift()!;
        component.push(current);

        const neighbours = this.getNeighbourIds(current);
        for (const nid of neighbours) {
          if (!visited.has(nid) && this.concepts.has(nid)) {
            visited.add(nid);
            queue.push(nid);
          }
        }
      }

      if (component.length === 0) continue;

      // Calculate cohesion: internal edges / possible edges
      let internalEdges = 0;
      for (const cid of component) {
        const out = this.outgoing.get(cid);
        if (out) {
          for (const rid of out) {
            const rel = this.relations.get(rid);
            if (rel && component.includes(rel.target)) {
              internalEdges++;
            }
          }
        }
      }

      const possibleEdges = component.length * (component.length - 1);
      const cohesion = possibleEdges > 0 ? round2(internalEdges / possibleEdges) : 1;

      // Find central concept (most connections within cluster)
      let maxConnections = -1;
      let centralConcept = component[0];
      for (const cid of component) {
        let connections = 0;
        const out = this.outgoing.get(cid);
        const inc = this.incoming.get(cid);
        if (out) connections += out.size;
        if (inc) connections += inc.size;

        if (connections > maxConnections) {
          maxConnections = connections;
          centralConcept = cid;
        }
      }

      // Derive cluster name from central concept or domain
      const centralConceptObj = this.concepts.get(centralConcept);
      const clusterName = centralConceptObj
        ? `${centralConceptObj.domain}/${centralConceptObj.name}`
        : `cluster-${clusters.length}`;

      clusters.push({
        id: generateId('CLU'),
        name: clusterName,
        concepts: component,
        cohesion,
        centralConcept,
      });
    }

    this.recordQuery(Date.now() - startTime);
    return clusters;
  }

  // ── Summary ─────────────────────────────────────────────────────────────

  /** Get a high-level summary of the concept map. */
  getSummary(): ConceptMapSummary {
    const startTime = Date.now();

    // Unique domains
    const domainSet = new Set<string>();
    for (const c of this.concepts.values()) {
      domainSet.add(c.domain);
    }

    // Top concepts by number of connections
    const connectionCounts: Array<{ name: string; connections: number }> = [];
    for (const c of this.concepts.values()) {
      let connections = 0;
      const out = this.outgoing.get(c.id);
      const inc = this.incoming.get(c.id);
      if (out) connections += out.size;
      if (inc) connections += inc.size;
      connectionCounts.push({ name: c.name, connections });
    }
    connectionCounts.sort((a, b) => b.connections - a.connections);
    const topConcepts = connectionCounts.slice(0, 10);

    const clusters = this.clusterConcepts();

    this.recordQuery(Date.now() - startTime);
    return {
      totalConcepts: this.concepts.size,
      totalRelations: this.relations.size,
      domains: Array.from(domainSet).sort(),
      topConcepts,
      clusters,
    };
  }

  // ── Merge ───────────────────────────────────────────────────────────────

  /** Merge another ConceptMapper's concepts and relations into this one. */
  mergeMaps(other: ConceptMapper): void {
    const idMapping = new Map<string, string>(); // other id → new id

    // Merge concepts
    for (const otherConcept of other.concepts.values()) {
      const existing = this.findConcept(otherConcept.name);
      if (existing) {
        // Merge properties from other into existing
        for (const [key, val] of otherConcept.properties) {
          if (!existing.properties.has(key)) {
            existing.properties.set(key, val);
          }
        }
        // Merge tags
        const tagSet = new Set(existing.tags);
        for (const tag of otherConcept.tags) {
          if (!tagSet.has(tag)) {
            existing.tags.push(tag);
            tagSet.add(tag);
          }
        }
        idMapping.set(otherConcept.id, existing.id);
      } else {
        const newConcept = this.addConcept({
          name: otherConcept.name,
          description: otherConcept.description,
          domain: otherConcept.domain,
          properties: new Map(otherConcept.properties),
          tags: [...otherConcept.tags],
        });
        idMapping.set(otherConcept.id, newConcept.id);
      }
    }

    // Merge relations
    for (const otherRel of other.relations.values()) {
      const newSource = idMapping.get(otherRel.source);
      const newTarget = idMapping.get(otherRel.target);
      if (!newSource || !newTarget) continue;

      // Skip if relation already exists
      const existing = this.getRelationBetween(newSource, newTarget, otherRel.type);
      if (existing) {
        // Update weight to max of both
        existing.weight = Math.max(existing.weight, otherRel.weight);
        continue;
      }

      const newRel = this.addRelation(newSource, newTarget, otherRel.type, otherRel.weight);
      newRel.bidirectional = otherRel.bidirectional;
      newRel.metadata = { ...otherRel.metadata };
    }
  }

  // ── Learning / Feedback ─────────────────────────────────────────────────

  /** Learn a relation through feedback, reinforcing or creating it. */
  learnRelation(source: string, target: string, type: RelationType): void {
    if (!this.concepts.has(source) || !this.concepts.has(target)) {
      return;
    }

    const existing = this.getRelationBetween(source, target, type);
    if (existing) {
      // Reinforce weight
      existing.weight = clamp(existing.weight + 0.1, 0, 1);
    } else {
      this.addRelation(source, target, type, 0.5);
    }

    this.feedbackCount++;
    this.feedbackLog.push({
      source,
      target,
      type,
      timestamp: Date.now(),
    });
  }

  // ── Stats ───────────────────────────────────────────────────────────────

  /** Return read-only statistics about this mapper's usage. */
  getStats(): Readonly<ConceptMapperStats> {
    const avgQueryTime = this.queryTimesMs.length > 0
      ? this.queryTimesMs.reduce((s, v) => s + v, 0) / this.queryTimesMs.length
      : 0;

    return {
      totalConcepts: this.concepts.size,
      totalRelations: this.relations.size,
      totalQueries: this.totalQueries,
      totalInferences: this.totalInferences,
      totalPathsFound: this.totalPathsFound,
      avgQueryTime: round2(avgQueryTime),
      feedbackCount: this.feedbackCount,
    };
  }

  // ── Serialization ───────────────────────────────────────────────────────

  /** Serialize the concept map state to a JSON string. */
  serialize(): string {
    const conceptEntries: Array<{
      id: string;
      name: string;
      description: string;
      domain: string;
      properties: Array<[string, string]>;
      activation: number;
      tags: string[];
    }> = [];

    for (const c of this.concepts.values()) {
      conceptEntries.push({
        id: c.id,
        name: c.name,
        description: c.description,
        domain: c.domain,
        properties: mapToEntries(c.properties),
        activation: c.activation,
        tags: c.tags,
      });
    }

    return JSON.stringify({
      config: this.config,
      concepts: conceptEntries,
      relations: Array.from(this.relations.values()),
      totalQueries: this.totalQueries,
      totalInferences: this.totalInferences,
      totalPathsFound: this.totalPathsFound,
      queryTimesMs: this.queryTimesMs,
      feedbackCount: this.feedbackCount,
      feedbackLog: this.feedbackLog,
    });
  }

  /** Restore a ConceptMapper from a serialized JSON string. */
  static deserialize(json: string): ConceptMapper {
    const data = JSON.parse(json) as {
      config: ConceptMapperConfig;
      concepts: Array<{
        id: string;
        name: string;
        description: string;
        domain: string;
        properties: Array<[string, string]>;
        activation: number;
        tags: string[];
      }>;
      relations: Relation[];
      totalQueries: number;
      totalInferences: number;
      totalPathsFound: number;
      queryTimesMs: number[];
      feedbackCount: number;
      feedbackLog: Array<{ source: string; target: string; type: RelationType; timestamp: number }>;
    };

    // Create instance without seeding (we'll restore state manually)
    const instance = new ConceptMapper(data.config);

    // Clear seeded data so we can restore exactly what was serialized
    instance.concepts.clear();
    instance.relations.clear();
    instance.nameIndex.clear();
    instance.outgoing.clear();
    instance.incoming.clear();

    // Restore concepts
    for (const entry of data.concepts) {
      const concept: Concept = {
        id: entry.id,
        name: entry.name,
        description: entry.description,
        domain: entry.domain,
        properties: entriesToMap(entry.properties),
        activation: entry.activation,
        tags: entry.tags,
      };
      instance.concepts.set(concept.id, concept);
      instance.nameIndex.set(concept.name.toLowerCase(), concept.id);
      instance.outgoing.set(concept.id, new Set());
      instance.incoming.set(concept.id, new Set());
    }

    // Restore relations
    for (const rel of data.relations) {
      instance.relations.set(rel.id, rel);
      instance.getOrCreateSet(instance.outgoing, rel.source).add(rel.id);
      instance.getOrCreateSet(instance.incoming, rel.target).add(rel.id);
    }

    // Restore stats
    instance.totalQueries = data.totalQueries;
    instance.totalInferences = data.totalInferences;
    instance.totalPathsFound = data.totalPathsFound;
    instance.queryTimesMs = data.queryTimesMs;
    instance.feedbackCount = data.feedbackCount;

    for (const entry of data.feedbackLog) {
      instance.feedbackLog.push(entry);
    }

    return instance;
  }

  // ── Private Helpers ─────────────────────────────────────────────────────

  /** Record a query execution time for stats. */
  private recordQuery(durationMs: number): void {
    this.totalQueries++;
    this.queryTimesMs.push(durationMs);
  }
}
