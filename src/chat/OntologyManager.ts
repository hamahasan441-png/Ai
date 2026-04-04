/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Ontology Manager — Hierarchical Concept & Taxonomy Management              ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Concept Management — Add, remove, query concepts in the ontology        ║
 * ║    ✦ IS-A Hierarchies — Parent/child relationships with transitive closure   ║
 * ║    ✦ Property Inheritance — Properties flow down the concept hierarchy       ║
 * ║    ✦ Semantic Relations — part-of, has-a, uses and custom relations          ║
 * ║    ✦ Similarity & LCA — Wu-Palmer similarity, least common ancestor          ║
 * ║    ✦ Ontology Merging — Combine two ontologies with conflict resolution      ║
 * ║    ✦ Validation — Cycle detection, orphan checks, consistency analysis       ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface OntologyManagerConfig {
  maxConcepts: number
  maxDepth: number
  allowMultipleInheritance: boolean
  defaultRelationType: string
  similarityMethod: 'wu-palmer' | 'path-based'
  caseSensitive: boolean
}

export interface OntologyConcept {
  id: string
  name: string
  description: string
  parentId: string | null
  properties: Map<string, OntologyProperty>
  metadata: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

export interface OntologyRelation {
  id: string
  sourceId: string
  targetId: string
  type: string
  weight: number
  metadata: Record<string, unknown>
  createdAt: number
}

export interface OntologyProperty {
  key: string
  value: unknown
  inherited: boolean
  definedAt: string
  dataType: string
}

export interface ConceptHierarchy {
  conceptId: string
  conceptName: string
  depth: number
  children: ConceptHierarchy[]
}

export interface InheritancePath {
  from: string
  to: string
  path: string[]
  depth: number
}

export interface OntologyQuery {
  conceptId?: string
  name?: string
  parentId?: string
  relationType?: string
  hasProperty?: string
  propertyValue?: unknown
  maxDepth?: number
  includeDescendants?: boolean
}

export interface OntologyQueryResult {
  concepts: OntologyConcept[]
  relations: OntologyRelation[]
  totalMatches: number
  queryTime: number
}

export interface OntologyValidation {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  conceptCount: number
  relationCount: number
  maxDepth: number
  orphanCount: number
}

export interface OntologyManagerStats {
  totalConcepts: number
  totalRelations: number
  totalProperties: number
  maxDepth: number
  avgChildrenPerConcept: number
  rootConcepts: number
  leafConcepts: number
}

// ── Internal Types ───────────────────────────────────────────────────────

interface ValidationError {
  type: 'cycle' | 'missing-parent' | 'duplicate-id' | 'self-reference' | 'depth-exceeded'
  message: string
  conceptId?: string
}

interface ValidationWarning {
  type: 'orphan' | 'no-properties' | 'single-child' | 'deep-hierarchy'
  message: string
  conceptId?: string
}

interface SerializedConcept {
  id: string
  name: string
  description: string
  parentId: string | null
  properties: Array<[string, OntologyProperty]>
  metadata: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

// ── Constants ────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: OntologyManagerConfig = {
  maxConcepts: 10000,
  maxDepth: 50,
  allowMultipleInheritance: false,
  defaultRelationType: 'related-to',
  similarityMethod: 'wu-palmer',
  caseSensitive: false,
};

/** Monotonically increasing counter for unique IDs. */
let idCounter = 0;

// ── Internal Helpers ─────────────────────────────────────────────────────

/** Generate a unique ID with the given prefix. */
function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

/** Normalize a concept name based on case sensitivity config. */
function normalizeName(name: string, caseSensitive: boolean): string {
  return caseSensitive ? name.trim() : name.trim().toLowerCase();
}

/**
 * Compute the depth of a concept by walking up to the root.
 * Returns -1 if a cycle is detected.
 */
function computeDepth(
  conceptId: string,
  concepts: Map<string, OntologyConcept>,
): number {
  let depth = 0;
  let currentId: string | null = conceptId;
  const visited = new Set<string>();

  while (currentId !== null) {
    if (visited.has(currentId)) return -1;
    visited.add(currentId);

    const concept = concepts.get(currentId);
    if (!concept) break;
    if (concept.parentId === null) break;

    currentId = concept.parentId;
    depth++;
  }

  return depth;
}

/**
 * Collect all ancestor IDs from a concept up to the root.
 * Returns an empty array if the concept has no parent.
 */
function collectAncestors(
  conceptId: string,
  concepts: Map<string, OntologyConcept>,
): string[] {
  const ancestors: string[] = [];
  let currentId: string | null = conceptId;
  const visited = new Set<string>();

  while (currentId !== null) {
    if (visited.has(currentId)) break;
    visited.add(currentId);

    const concept = concepts.get(currentId);
    if (!concept || concept.parentId === null) break;

    ancestors.push(concept.parentId);
    currentId = concept.parentId;
  }

  return ancestors;
}

/**
 * Collect all descendant IDs from a concept down to the leaves.
 */
function collectDescendants(
  conceptId: string,
  childIndex: Map<string, Set<string>>,
): string[] {
  const descendants: string[] = [];
  const stack = [conceptId];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const children = childIndex.get(current);
    if (children) {
      for (const childId of children) {
        descendants.push(childId);
        stack.push(childId);
      }
    }
  }

  return descendants;
}

/**
 * Check if adding a parent-child link would create a cycle.
 */
function wouldCreateCycle(
  childId: string,
  parentId: string,
  concepts: Map<string, OntologyConcept>,
): boolean {
  let currentId: string | null = parentId;
  const visited = new Set<string>();

  while (currentId !== null) {
    if (currentId === childId) return true;
    if (visited.has(currentId)) return false;
    visited.add(currentId);

    const concept = concepts.get(currentId);
    if (!concept) return false;
    currentId = concept.parentId;
  }

  return false;
}

// ── OntologyManager ─────────────────────────────────────────────────────

export class OntologyManager {
  private concepts: Map<string, OntologyConcept> = new Map();
  private relations: OntologyRelation[] = [];
  private childIndex: Map<string, Set<string>> = new Map();
  private nameIndex: Map<string, string> = new Map();
  private config: OntologyManagerConfig;

  constructor(config: Partial<OntologyManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Concept Management ────────────────────────────────────────────────

  /** Add a new concept to the ontology. Returns the concept ID. */
  addConcept(
    name: string,
    description: string = '',
    parentId: string | null = null,
    metadata: Record<string, unknown> = {},
  ): string {
    if (this.concepts.size >= this.config.maxConcepts) {
      throw new Error(`Maximum concept limit (${this.config.maxConcepts}) reached`);
    }

    const normalized = normalizeName(name, this.config.caseSensitive);
    if (this.nameIndex.has(normalized)) {
      throw new Error(`Concept with name "${name}" already exists`);
    }

    if (parentId !== null && !this.concepts.has(parentId)) {
      throw new Error(`Parent concept "${parentId}" does not exist`);
    }

    if (parentId !== null) {
      const depth = computeDepth(parentId, this.concepts) + 1;
      if (depth > this.config.maxDepth) {
        throw new Error(`Maximum hierarchy depth (${this.config.maxDepth}) exceeded`);
      }
    }

    const id = generateId('concept');
    const now = Date.now();

    const concept: OntologyConcept = {
      id,
      name,
      description,
      parentId,
      properties: new Map(),
      metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.concepts.set(id, concept);
    this.nameIndex.set(normalized, id);

    if (parentId !== null) {
      if (!this.childIndex.has(parentId)) {
        this.childIndex.set(parentId, new Set());
      }
      this.childIndex.get(parentId)!.add(id);
    }

    return id;
  }

  /** Remove a concept and all its descendant concepts. */
  removeConcept(conceptId: string): boolean {
    const concept = this.concepts.get(conceptId);
    if (!concept) return false;

    // Collect all descendants to remove
    const toRemove = [conceptId, ...collectDescendants(conceptId, this.childIndex)];

    for (const id of toRemove) {
      const c = this.concepts.get(id);
      if (!c) continue;

      const normalized = normalizeName(c.name, this.config.caseSensitive);
      this.nameIndex.delete(normalized);

      // Remove from parent's child index
      if (c.parentId !== null) {
        const siblings = this.childIndex.get(c.parentId);
        if (siblings) {
          siblings.delete(id);
          if (siblings.size === 0) this.childIndex.delete(c.parentId);
        }
      }

      this.childIndex.delete(id);
      this.concepts.delete(id);
    }

    // Remove relations involving removed concepts
    const removedSet = new Set(toRemove);
    this.relations = this.relations.filter(
      r => !removedSet.has(r.sourceId) && !removedSet.has(r.targetId),
    );

    return true;
  }

  /** Retrieve a concept by ID. */
  getConcept(conceptId: string): OntologyConcept | null {
    return this.concepts.get(conceptId) ?? null;
  }

  /** Retrieve a concept by name. */
  getConceptByName(name: string): OntologyConcept | null {
    const normalized = normalizeName(name, this.config.caseSensitive);
    const id = this.nameIndex.get(normalized);
    if (!id) return null;
    return this.concepts.get(id) ?? null;
  }

  /** Return all concepts in the ontology. */
  getConcepts(): OntologyConcept[] {
    return Array.from(this.concepts.values());
  }

  // ── Hierarchy Navigation ──────────────────────────────────────────────

  /** Set (or change) the parent of a concept. */
  setParent(conceptId: string, newParentId: string | null): boolean {
    const concept = this.concepts.get(conceptId);
    if (!concept) return false;

    if (newParentId !== null) {
      if (!this.concepts.has(newParentId)) return false;
      if (newParentId === conceptId) return false;

      if (wouldCreateCycle(conceptId, newParentId, this.concepts)) return false;

      const depth = computeDepth(newParentId, this.concepts) + 1;
      if (depth > this.config.maxDepth) return false;
    }

    // Remove from old parent's child index
    if (concept.parentId !== null) {
      const oldSiblings = this.childIndex.get(concept.parentId);
      if (oldSiblings) {
        oldSiblings.delete(conceptId);
        if (oldSiblings.size === 0) this.childIndex.delete(concept.parentId);
      }
    }

    concept.parentId = newParentId;
    concept.updatedAt = Date.now();

    // Add to new parent's child index
    if (newParentId !== null) {
      if (!this.childIndex.has(newParentId)) {
        this.childIndex.set(newParentId, new Set());
      }
      this.childIndex.get(newParentId)!.add(conceptId);
    }

    return true;
  }

  /** Get the parent concept ID. */
  getParent(conceptId: string): string | null {
    const concept = this.concepts.get(conceptId);
    if (!concept) return null;
    return concept.parentId;
  }

  /** Get direct child concept IDs. */
  getChildren(conceptId: string): string[] {
    const children = this.childIndex.get(conceptId);
    if (!children) return [];
    return Array.from(children);
  }

  /** Get all ancestor concept IDs, from parent up to root. */
  getAncestors(conceptId: string): string[] {
    if (!this.concepts.has(conceptId)) return [];
    return collectAncestors(conceptId, this.concepts);
  }

  /** Get all descendant concept IDs. */
  getDescendants(conceptId: string): string[] {
    if (!this.concepts.has(conceptId)) return [];
    return collectDescendants(conceptId, this.childIndex);
  }

  /** Build the full hierarchy tree from a root concept. */
  getHierarchy(rootId?: string): ConceptHierarchy[] {
    if (rootId) {
      const concept = this.concepts.get(rootId);
      if (!concept) return [];
      return [this.buildHierarchyNode(rootId, 0)];
    }

    // Build from all root concepts (no parent)
    const roots: ConceptHierarchy[] = [];
    for (const concept of this.concepts.values()) {
      if (concept.parentId === null) {
        roots.push(this.buildHierarchyNode(concept.id, 0));
      }
    }
    return roots;
  }

  // ── IS-A Reasoning ────────────────────────────────────────────────────

  /**
   * Check if concept A "is-a" concept B (transitive closure).
   * Returns true if B is an ancestor of A.
   */
  isA(conceptId: string, ancestorId: string): boolean {
    if (conceptId === ancestorId) return true;
    if (!this.concepts.has(conceptId) || !this.concepts.has(ancestorId)) return false;

    const ancestors = collectAncestors(conceptId, this.concepts);
    return ancestors.includes(ancestorId);
  }

  /**
   * Check if concept A subsumes concept B.
   * A subsumes B if B is-a A (i.e., A is an ancestor of B).
   */
  subsumes(conceptA: string, conceptB: string): boolean {
    return this.isA(conceptB, conceptA);
  }

  /**
   * Get the inheritance path between two concepts.
   * Returns null if no path exists.
   */
  getInheritancePath(fromId: string, toId: string): InheritancePath | null {
    if (!this.concepts.has(fromId) || !this.concepts.has(toId)) return null;

    // Check if toId is an ancestor of fromId
    const ancestorsOfFrom = [fromId, ...collectAncestors(fromId, this.concepts)];
    const idxTo = ancestorsOfFrom.indexOf(toId);
    if (idxTo !== -1) {
      const path = ancestorsOfFrom.slice(0, idxTo + 1);
      return { from: fromId, to: toId, path, depth: path.length - 1 };
    }

    // Check if fromId is an ancestor of toId
    const ancestorsOfTo = [toId, ...collectAncestors(toId, this.concepts)];
    const idxFrom = ancestorsOfTo.indexOf(fromId);
    if (idxFrom !== -1) {
      const path = ancestorsOfTo.slice(0, idxFrom + 1).reverse();
      return { from: fromId, to: toId, path, depth: path.length - 1 };
    }

    // Find path through LCA
    const lca = this.findLCA(fromId, toId);
    if (!lca) return null;

    const pathUp = [fromId, ...collectAncestors(fromId, this.concepts)];
    const pathDown = [toId, ...collectAncestors(toId, this.concepts)];

    const lcaIdxUp = pathUp.indexOf(lca);
    const lcaIdxDown = pathDown.indexOf(lca);

    if (lcaIdxUp === -1 || lcaIdxDown === -1) return null;

    const upSegment = pathUp.slice(0, lcaIdxUp + 1);
    const downSegment = pathDown.slice(0, lcaIdxDown).reverse();
    const fullPath = [...upSegment, ...downSegment];

    return { from: fromId, to: toId, path: fullPath, depth: fullPath.length - 1 };
  }

  // ── Property Management ───────────────────────────────────────────────

  /** Add or update a property on a concept. */
  addProperty(
    conceptId: string,
    key: string,
    value: unknown,
    dataType: string = 'string',
  ): boolean {
    const concept = this.concepts.get(conceptId);
    if (!concept) return false;

    const property: OntologyProperty = {
      key,
      value,
      inherited: false,
      definedAt: conceptId,
      dataType,
    };

    concept.properties.set(key, property);
    concept.updatedAt = Date.now();
    return true;
  }

  /** Remove a property from a concept. */
  removeProperty(conceptId: string, key: string): boolean {
    const concept = this.concepts.get(conceptId);
    if (!concept) return false;

    const removed = concept.properties.delete(key);
    if (removed) concept.updatedAt = Date.now();
    return removed;
  }

  /**
   * Get all inherited properties for a concept.
   * Properties defined on the concept itself override inherited ones.
   */
  getInheritedProperties(conceptId: string): Map<string, OntologyProperty> {
    const concept = this.concepts.get(conceptId);
    if (!concept) return new Map();

    // Collect ancestor chain (root first)
    const ancestors = collectAncestors(conceptId, this.concepts).reverse();

    // Build properties bottom-up: ancestors first, then own
    const result = new Map<string, OntologyProperty>();

    for (const ancestorId of ancestors) {
      const ancestor = this.concepts.get(ancestorId);
      if (!ancestor) continue;

      for (const [key, prop] of ancestor.properties) {
        result.set(key, {
          ...prop,
          inherited: true,
          definedAt: ancestorId,
        });
      }
    }

    // Own properties override inherited
    for (const [key, prop] of concept.properties) {
      result.set(key, { ...prop, inherited: false, definedAt: conceptId });
    }

    return result;
  }

  // ── Relations (non-hierarchical) ──────────────────────────────────────

  /** Add a non-hierarchical relation between two concepts. */
  addRelation(
    sourceId: string,
    targetId: string,
    type?: string,
    weight: number = 1.0,
    metadata: Record<string, unknown> = {},
  ): string {
    if (!this.concepts.has(sourceId)) {
      throw new Error(`Source concept "${sourceId}" does not exist`);
    }
    if (!this.concepts.has(targetId)) {
      throw new Error(`Target concept "${targetId}" does not exist`);
    }

    const id = generateId('rel');
    const relation: OntologyRelation = {
      id,
      sourceId,
      targetId,
      type: type ?? this.config.defaultRelationType,
      weight: Math.max(0, Math.min(1, weight)),
      metadata,
      createdAt: Date.now(),
    };

    this.relations.push(relation);
    return id;
  }

  /** Remove a relation by ID. */
  removeRelation(relationId: string): boolean {
    const idx = this.relations.findIndex(r => r.id === relationId);
    if (idx === -1) return false;
    this.relations.splice(idx, 1);
    return true;
  }

  /** Get all relations for a concept (as source or target). */
  getRelations(conceptId: string, type?: string): OntologyRelation[] {
    return this.relations.filter(r => {
      const matchesConcept = r.sourceId === conceptId || r.targetId === conceptId;
      if (!matchesConcept) return false;
      if (type !== undefined) return r.type === type;
      return true;
    });
  }

  /** Get outgoing relations from a concept. */
  getOutgoingRelations(conceptId: string, type?: string): OntologyRelation[] {
    return this.relations.filter(r => {
      if (r.sourceId !== conceptId) return false;
      if (type !== undefined) return r.type === type;
      return true;
    });
  }

  /** Get incoming relations to a concept. */
  getIncomingRelations(conceptId: string, type?: string): OntologyRelation[] {
    return this.relations.filter(r => {
      if (r.targetId !== conceptId) return false;
      if (type !== undefined) return r.type === type;
      return true;
    });
  }

  // ── Querying ──────────────────────────────────────────────────────────

  /** Run a semantic query over the ontology. */
  query(q: OntologyQuery): OntologyQueryResult {
    const startTime = Date.now();
    let matchingConcepts: OntologyConcept[] = [];
    let matchingRelations: OntologyRelation[] = [];

    // Start with all concepts or a specific one
    if (q.conceptId) {
      const concept = this.concepts.get(q.conceptId);
      if (concept) {
        matchingConcepts = [concept];

        if (q.includeDescendants) {
          const descIds = collectDescendants(q.conceptId, this.childIndex);
          for (const descId of descIds) {
            const desc = this.concepts.get(descId);
            if (desc) matchingConcepts.push(desc);
          }
        }
      }
    } else {
      matchingConcepts = Array.from(this.concepts.values());
    }

    // Filter by name
    if (q.name !== undefined) {
      const normalizedQuery = normalizeName(q.name, this.config.caseSensitive);
      matchingConcepts = matchingConcepts.filter(c => {
        const normalizedName = normalizeName(c.name, this.config.caseSensitive);
        return normalizedName.includes(normalizedQuery);
      });
    }

    // Filter by parentId
    if (q.parentId !== undefined) {
      matchingConcepts = matchingConcepts.filter(c => c.parentId === q.parentId);
    }

    // Filter by property existence
    if (q.hasProperty !== undefined) {
      matchingConcepts = matchingConcepts.filter(c => {
        const inherited = this.getInheritedProperties(c.id);
        return inherited.has(q.hasProperty!);
      });
    }

    // Filter by property value
    if (q.hasProperty !== undefined && q.propertyValue !== undefined) {
      matchingConcepts = matchingConcepts.filter(c => {
        const inherited = this.getInheritedProperties(c.id);
        const prop = inherited.get(q.hasProperty!);
        return prop !== undefined && prop.value === q.propertyValue;
      });
    }

    // Filter by max depth
    if (q.maxDepth !== undefined) {
      matchingConcepts = matchingConcepts.filter(c => {
        const depth = computeDepth(c.id, this.concepts);
        return depth >= 0 && depth <= q.maxDepth!;
      });
    }

    // Gather relations for matching concepts
    if (q.relationType !== undefined) {
      const conceptIds = new Set(matchingConcepts.map(c => c.id));
      matchingRelations = this.relations.filter(
        r => r.type === q.relationType
          && (conceptIds.has(r.sourceId) || conceptIds.has(r.targetId)),
      );
    }

    return {
      concepts: matchingConcepts,
      relations: matchingRelations,
      totalMatches: matchingConcepts.length,
      queryTime: Date.now() - startTime,
    };
  }

  // ── Similarity ────────────────────────────────────────────────────────

  /**
   * Compute semantic similarity between two concepts.
   * Uses Wu-Palmer or path-based similarity depending on config.
   */
  conceptSimilarity(conceptA: string, conceptB: string): number {
    if (conceptA === conceptB) return 1.0;
    if (!this.concepts.has(conceptA) || !this.concepts.has(conceptB)) return 0.0;

    if (this.config.similarityMethod === 'wu-palmer') {
      return this.wuPalmerSimilarity(conceptA, conceptB);
    }
    return this.pathBasedSimilarity(conceptA, conceptB);
  }

  // ── Least Common Ancestor ─────────────────────────────────────────────

  /** Find the least common ancestor (LCA) of two concepts. */
  findLCA(conceptA: string, conceptB: string): string | null {
    if (!this.concepts.has(conceptA) || !this.concepts.has(conceptB)) return null;
    if (conceptA === conceptB) return conceptA;

    const ancestorsA = new Set([conceptA, ...collectAncestors(conceptA, this.concepts)]);
    const pathB = [conceptB, ...collectAncestors(conceptB, this.concepts)];

    for (const node of pathB) {
      if (ancestorsA.has(node)) return node;
    }

    return null;
  }

  // ── Merge ─────────────────────────────────────────────────────────────

  /**
   * Merge another ontology into this one.
   * Returns a map from old concept IDs to new concept IDs.
   */
  merge(other: OntologyManager): Map<string, string> {
    const idMap = new Map<string, string>();

    // Sort other concepts by depth so parents are created first
    const otherConcepts = other.getConcepts();
    const sorted = otherConcepts.sort((a, b) => {
      const depthA = computeDepth(a.id, other.concepts);
      const depthB = computeDepth(b.id, other.concepts);
      return depthA - depthB;
    });

    for (const concept of sorted) {
      const normalized = normalizeName(concept.name, this.config.caseSensitive);
      const existingId = this.nameIndex.get(normalized);

      if (existingId) {
        // Concept already exists — map and merge properties
        idMap.set(concept.id, existingId);
        const existing = this.concepts.get(existingId)!;

        for (const [key, prop] of concept.properties) {
          if (!existing.properties.has(key)) {
            existing.properties.set(key, { ...prop, definedAt: existingId });
          }
        }
        existing.updatedAt = Date.now();
      } else {
        // Map parent ID through the idMap
        let mappedParentId: string | null = null;
        if (concept.parentId !== null) {
          mappedParentId = idMap.get(concept.parentId) ?? null;
        }

        try {
          const newId = this.addConcept(
            concept.name,
            concept.description,
            mappedParentId,
            { ...concept.metadata },
          );
          idMap.set(concept.id, newId);

          // Copy properties
          for (const [key, prop] of concept.properties) {
            this.addProperty(newId, key, prop.value, prop.dataType);
          }
        } catch {
          // Skip concepts that cannot be added (limits, etc.)
          continue;
        }
      }
    }

    // Merge relations
    for (const relation of other.relations) {
      const newSourceId = idMap.get(relation.sourceId);
      const newTargetId = idMap.get(relation.targetId);

      if (newSourceId && newTargetId) {
        // Avoid duplicate relations
        const exists = this.relations.some(
          r => r.sourceId === newSourceId
            && r.targetId === newTargetId
            && r.type === relation.type,
        );
        if (!exists) {
          try {
            this.addRelation(
              newSourceId,
              newTargetId,
              relation.type,
              relation.weight,
              { ...relation.metadata },
            );
          } catch {
            // Skip invalid relations
          }
        }
      }
    }

    return idMap;
  }

  // ── Validation ────────────────────────────────────────────────────────

  /** Validate ontology consistency. */
  validate(): OntologyValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let maxDepth = 0;
    let orphanCount = 0;

    const seenIds = new Set<string>();

    for (const concept of this.concepts.values()) {
      // Check duplicate IDs
      if (seenIds.has(concept.id)) {
        errors.push({
          type: 'duplicate-id',
          message: `Duplicate concept ID: ${concept.id}`,
          conceptId: concept.id,
        });
      }
      seenIds.add(concept.id);

      // Check self-reference
      if (concept.parentId === concept.id) {
        errors.push({
          type: 'self-reference',
          message: `Concept "${concept.name}" references itself as parent`,
          conceptId: concept.id,
        });
      }

      // Check missing parent
      if (concept.parentId !== null && !this.concepts.has(concept.parentId)) {
        errors.push({
          type: 'missing-parent',
          message: `Concept "${concept.name}" references non-existent parent "${concept.parentId}"`,
          conceptId: concept.id,
        });
      }

      // Check for cycles
      const depth = computeDepth(concept.id, this.concepts);
      if (depth === -1) {
        errors.push({
          type: 'cycle',
          message: `Cycle detected involving concept "${concept.name}"`,
          conceptId: concept.id,
        });
      } else {
        if (depth > maxDepth) maxDepth = depth;

        if (depth > this.config.maxDepth) {
          errors.push({
            type: 'depth-exceeded',
            message: `Concept "${concept.name}" at depth ${depth} exceeds max depth ${this.config.maxDepth}`,
            conceptId: concept.id,
          });
        }
      }

      // Warnings
      if (concept.parentId === null && !this.childIndex.has(concept.id) && this.concepts.size > 1) {
        const hasRelations = this.relations.some(
          r => r.sourceId === concept.id || r.targetId === concept.id,
        );
        if (!hasRelations) {
          warnings.push({
            type: 'orphan',
            message: `Concept "${concept.name}" has no parent, no children, and no relations`,
            conceptId: concept.id,
          });
          orphanCount++;
        }
      }

      if (concept.properties.size === 0) {
        warnings.push({
          type: 'no-properties',
          message: `Concept "${concept.name}" has no properties`,
          conceptId: concept.id,
        });
      }

      const children = this.childIndex.get(concept.id);
      if (children && children.size === 1) {
        warnings.push({
          type: 'single-child',
          message: `Concept "${concept.name}" has only one child`,
          conceptId: concept.id,
        });
      }

      if (depth > 10) {
        warnings.push({
          type: 'deep-hierarchy',
          message: `Concept "${concept.name}" is at depth ${depth}`,
          conceptId: concept.id,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conceptCount: this.concepts.size,
      relationCount: this.relations.length,
      maxDepth,
      orphanCount,
    };
  }

  // ── Stats ─────────────────────────────────────────────────────────────

  getStats(): OntologyManagerStats {
    let totalProperties = 0;
    let rootConcepts = 0;
    let leafConcepts = 0;
    let maxDepth = 0;
    let totalChildren = 0;
    let conceptsWithChildren = 0;

    for (const concept of this.concepts.values()) {
      totalProperties += concept.properties.size;

      if (concept.parentId === null) rootConcepts++;

      const children = this.childIndex.get(concept.id);
      if (!children || children.size === 0) {
        leafConcepts++;
      } else {
        totalChildren += children.size;
        conceptsWithChildren++;
      }

      const depth = computeDepth(concept.id, this.concepts);
      if (depth > maxDepth) maxDepth = depth;
    }

    return {
      totalConcepts: this.concepts.size,
      totalRelations: this.relations.length,
      totalProperties,
      maxDepth,
      avgChildrenPerConcept: conceptsWithChildren > 0
        ? totalChildren / conceptsWithChildren
        : 0,
      rootConcepts,
      leafConcepts,
    };
  }

  // ── Serialization ─────────────────────────────────────────────────────

  /** Serialize the entire ontology state to a JSON string. */
  serialize(): string {
    const serializedConcepts: SerializedConcept[] = [];

    for (const concept of this.concepts.values()) {
      serializedConcepts.push({
        id: concept.id,
        name: concept.name,
        description: concept.description,
        parentId: concept.parentId,
        properties: Array.from(concept.properties.entries()),
        metadata: concept.metadata,
        createdAt: concept.createdAt,
        updatedAt: concept.updatedAt,
      });
    }

    return JSON.stringify({
      config: this.config,
      concepts: serializedConcepts,
      relations: this.relations,
    });
  }

  /** Restore an OntologyManager from a previously serialized JSON string. */
  static deserialize(json: string): OntologyManager {
    const data = JSON.parse(json) as {
      config: OntologyManagerConfig
      concepts: SerializedConcept[]
      relations: OntologyRelation[]
    };

    const manager = new OntologyManager(data.config);

    if (Array.isArray(data.concepts)) {
      for (const sc of data.concepts) {
        const concept: OntologyConcept = {
          id: sc.id,
          name: sc.name,
          description: sc.description,
          parentId: sc.parentId,
          properties: new Map(sc.properties),
          metadata: sc.metadata,
          createdAt: sc.createdAt,
          updatedAt: sc.updatedAt,
        };

        manager.concepts.set(concept.id, concept);

        const normalized = normalizeName(concept.name, manager.config.caseSensitive);
        manager.nameIndex.set(normalized, concept.id);

        if (concept.parentId !== null) {
          if (!manager.childIndex.has(concept.parentId)) {
            manager.childIndex.set(concept.parentId, new Set());
          }
          manager.childIndex.get(concept.parentId)!.add(concept.id);
        }
      }
    }

    if (Array.isArray(data.relations)) {
      manager.relations = data.relations;
    }

    return manager;
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  /** Build a ConceptHierarchy node recursively. */
  private buildHierarchyNode(conceptId: string, depth: number): ConceptHierarchy {
    const concept = this.concepts.get(conceptId);
    const children = this.childIndex.get(conceptId);
    const childNodes: ConceptHierarchy[] = [];

    if (children) {
      for (const childId of children) {
        childNodes.push(this.buildHierarchyNode(childId, depth + 1));
      }
    }

    return {
      conceptId,
      conceptName: concept?.name ?? '',
      depth,
      children: childNodes,
    };
  }

  /** Wu-Palmer similarity: 2 * depth(LCA) / (depth(A) + depth(B)). */
  private wuPalmerSimilarity(conceptA: string, conceptB: string): number {
    const lca = this.findLCA(conceptA, conceptB);
    if (!lca) return 0.0;

    const depthA = computeDepth(conceptA, this.concepts);
    const depthB = computeDepth(conceptB, this.concepts);
    const depthLCA = computeDepth(lca, this.concepts);

    if (depthA < 0 || depthB < 0 || depthLCA < 0) return 0.0;

    const denom = depthA + depthB;
    if (denom === 0) return 1.0;

    // Wu-Palmer: 2 * depth(LCA) / (depth(A) + depth(B))
    return (2 * depthLCA) / denom;
  }

  /** Path-based similarity: 1 / (1 + shortest path length). */
  private pathBasedSimilarity(conceptA: string, conceptB: string): number {
    const path = this.getInheritancePath(conceptA, conceptB);
    if (!path) return 0.0;
    return 1 / (1 + path.depth);
  }
}
