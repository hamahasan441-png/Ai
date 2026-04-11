/**
 * InferenceEngine – Phase 7 "Understanding" intelligence module
 *
 * Provides propositional-logic inference, forward / backward chaining,
 * truth-table generation, conflict detection & resolution, and a simple
 * expression parser.  Fully self-contained – no external dependencies.
 */

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

/* ------------------------------------------------------------------ */
/*  Exported types                                                     */
/* ------------------------------------------------------------------ */

export type LogicalOperator = 'AND' | 'OR' | 'NOT' | 'IMPLIES' | 'IFF' | 'XOR'

export interface Proposition {
  id: string
  name: string
  value: boolean | null
  confidence: number
  source: 'fact' | 'inference' | 'assumption'
}

export interface Condition {
  propositionId: string
  expectedValue: boolean
  operator?: LogicalOperator
}

export interface Rule {
  id: string
  name: string
  conditions: Condition[]
  conclusion: { propId: string; value: boolean }
  priority: number
  confidence: number
  metadata: Record<string, string>
}

export interface InferenceStep {
  ruleId: string
  inputFacts: string[]
  outputFact: string
  confidence: number
  timestamp: number
}

export interface InferenceChain {
  steps: InferenceStep[]
  finalConclusion: string
  totalConfidence: number
  depth: number
}

export interface Conflict {
  ruleA: string
  ruleB: string
  proposition: string
  resolvedBy: string
  resolution: 'priority' | 'recency' | 'specificity'
}

export interface TruthTableRow {
  assignments: Record<string, boolean>
  result: boolean
}

export interface TruthTable {
  variables: string[]
  rows: TruthTableRow[]
  tautology: boolean
  contradiction: boolean
  satisfiable: boolean
}

export interface QueryResult {
  proposition: string
  value: boolean | null
  confidence: number
  chain: InferenceChain | null
  answerable: boolean
}

export interface InferenceEngineConfig {
  maxRules: number
  maxFacts: number
  enableForwardChaining: boolean
  enableBackwardChaining: boolean
  enableTruthTables: boolean
  maxInferenceDepth: number
  conflictResolution: 'priority' | 'recency' | 'specificity'
}

export interface InferenceEngineStats {
  totalInferences: number
  totalRulesApplied: number
  totalFactsAdded: number
  totalConflictsResolved: number
  totalQueriesAnswered: number
  avgInferenceTime: number
  feedbackCount: number
}

/* ------------------------------------------------------------------ */
/*  Default configuration                                              */
/* ------------------------------------------------------------------ */

const DEFAULT_CONFIG: InferenceEngineConfig = {
  maxRules: 500,
  maxFacts: 1000,
  enableForwardChaining: true,
  enableBackwardChaining: true,
  enableTruthTables: true,
  maxInferenceDepth: 20,
  conflictResolution: 'priority',
}

/* ------------------------------------------------------------------ */
/*  Built-in programming-logic rules                                   */
/* ------------------------------------------------------------------ */

interface BuiltinRuleDef {
  name: string
  conditions: Array<{ propName: string; expected: boolean }>
  conclusionPropName: string
  conclusionValue: boolean
  priority: number
  confidence: number
  metadata: Record<string, string>
}

function builtinRuleDefs(): BuiltinRuleDef[] {
  return [
    {
      name: 'async_without_error_handling_implies_bug',
      conditions: [
        { propName: 'uses_async', expected: true },
        { propName: 'no_error_handling', expected: true },
      ],
      conclusionPropName: 'has_bug',
      conclusionValue: true,
      priority: 8,
      confidence: 0.85,
      metadata: { category: 'error-handling', severity: 'high' },
    },
    {
      name: 'null_deref_without_check_implies_bug',
      conditions: [
        { propName: 'uses_nullable', expected: true },
        { propName: 'has_null_check', expected: false },
      ],
      conclusionPropName: 'has_null_deref_risk',
      conclusionValue: true,
      priority: 9,
      confidence: 0.9,
      metadata: { category: 'null-safety', severity: 'critical' },
    },
    {
      name: 'shared_state_without_lock_implies_race',
      conditions: [
        { propName: 'uses_shared_state', expected: true },
        { propName: 'has_synchronization', expected: false },
      ],
      conclusionPropName: 'has_race_condition',
      conclusionValue: true,
      priority: 9,
      confidence: 0.88,
      metadata: { category: 'concurrency', severity: 'critical' },
    },
    {
      name: 'user_input_without_validation_implies_injection',
      conditions: [
        { propName: 'accepts_user_input', expected: true },
        { propName: 'has_input_validation', expected: false },
      ],
      conclusionPropName: 'has_injection_risk',
      conclusionValue: true,
      priority: 10,
      confidence: 0.92,
      metadata: { category: 'security', severity: 'critical' },
    },
    {
      name: 'large_function_implies_refactor',
      conditions: [
        { propName: 'function_over_100_lines', expected: true },
        { propName: 'has_single_responsibility', expected: false },
      ],
      conclusionPropName: 'needs_refactor',
      conclusionValue: true,
      priority: 4,
      confidence: 0.7,
      metadata: { category: 'code-quality', severity: 'low' },
    },
    {
      name: 'no_tests_implies_low_confidence',
      conditions: [{ propName: 'has_tests', expected: false }],
      conclusionPropName: 'low_test_confidence',
      conclusionValue: true,
      priority: 5,
      confidence: 0.8,
      metadata: { category: 'testing', severity: 'medium' },
    },
    {
      name: 'deprecated_api_implies_upgrade',
      conditions: [{ propName: 'uses_deprecated_api', expected: true }],
      conclusionPropName: 'needs_api_upgrade',
      conclusionValue: true,
      priority: 6,
      confidence: 0.95,
      metadata: { category: 'maintenance', severity: 'medium' },
    },
    {
      name: 'hardcoded_secrets_implies_security_risk',
      conditions: [{ propName: 'has_hardcoded_secrets', expected: true }],
      conclusionPropName: 'has_security_risk',
      conclusionValue: true,
      priority: 10,
      confidence: 0.98,
      metadata: { category: 'security', severity: 'critical' },
    },
    {
      name: 'deep_nesting_implies_complexity',
      conditions: [{ propName: 'nesting_depth_over_4', expected: true }],
      conclusionPropName: 'high_complexity',
      conclusionValue: true,
      priority: 3,
      confidence: 0.75,
      metadata: { category: 'code-quality', severity: 'low' },
    },
    {
      name: 'no_logging_implies_debug_difficulty',
      conditions: [{ propName: 'has_logging', expected: false }],
      conclusionPropName: 'hard_to_debug',
      conclusionValue: true,
      priority: 4,
      confidence: 0.7,
      metadata: { category: 'observability', severity: 'medium' },
    },
    {
      name: 'unbounded_loop_implies_dos_risk',
      conditions: [
        { propName: 'has_loop', expected: true },
        { propName: 'loop_has_bound', expected: false },
      ],
      conclusionPropName: 'has_dos_risk',
      conclusionValue: true,
      priority: 7,
      confidence: 0.8,
      metadata: { category: 'security', severity: 'high' },
    },
    {
      name: 'global_state_implies_coupling',
      conditions: [{ propName: 'uses_global_state', expected: true }],
      conclusionPropName: 'high_coupling',
      conclusionValue: true,
      priority: 5,
      confidence: 0.78,
      metadata: { category: 'architecture', severity: 'medium' },
    },
    {
      name: 'no_types_implies_type_safety_risk',
      conditions: [
        { propName: 'uses_dynamic_typing', expected: true },
        { propName: 'has_type_annotations', expected: false },
      ],
      conclusionPropName: 'type_safety_risk',
      conclusionValue: true,
      priority: 6,
      confidence: 0.82,
      metadata: { category: 'type-safety', severity: 'medium' },
    },
    {
      name: 'memory_alloc_without_free_implies_leak',
      conditions: [
        { propName: 'allocates_memory', expected: true },
        { propName: 'frees_memory', expected: false },
      ],
      conclusionPropName: 'has_memory_leak',
      conclusionValue: true,
      priority: 8,
      confidence: 0.87,
      metadata: { category: 'memory', severity: 'high' },
    },
    {
      name: 'bug_and_low_confidence_implies_critical',
      conditions: [
        { propName: 'has_bug', expected: true },
        { propName: 'low_test_confidence', expected: true },
      ],
      conclusionPropName: 'critical_issue',
      conclusionValue: true,
      priority: 10,
      confidence: 0.9,
      metadata: { category: 'composite', severity: 'critical' },
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Expression tokenizer & evaluator                                   */
/* ------------------------------------------------------------------ */

type TokenKind = 'IDENT' | 'OP' | 'LPAREN' | 'RPAREN'

interface Token {
  kind: TokenKind
  value: string
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const src = expr.trim()

  while (i < src.length) {
    if (src[i] === ' ' || src[i] === '\t') {
      i++
      continue
    }

    if (src[i] === '(') {
      tokens.push({ kind: 'LPAREN', value: '(' })
      i++
      continue
    }
    if (src[i] === ')') {
      tokens.push({ kind: 'RPAREN', value: ')' })
      i++
      continue
    }

    let word = ''
    while (
      i < src.length &&
      src[i] !== ' ' &&
      src[i] !== '\t' &&
      src[i] !== '(' &&
      src[i] !== ')'
    ) {
      word += src[i]
      i++
    }

    const upper = word.toUpperCase()
    if (['AND', 'OR', 'NOT', 'IMPLIES', 'IFF', 'XOR'].includes(upper)) {
      tokens.push({ kind: 'OP', value: upper })
    } else {
      tokens.push({ kind: 'IDENT', value: word })
    }
  }

  return tokens
}

/**
 * Recursive-descent parser for propositional expressions.
 *
 * Grammar (lowest to highest precedence):
 *   expr     → iff
 *   iff      → implies (IFF implies)*
 *   implies  → or (IMPLIES or)*
 *   or       → xor (OR xor)*
 *   xor      → and (XOR and)*
 *   and      → not (AND not)*
 *   not      → NOT not | atom
 *   atom     → IDENT | '(' expr ')'
 */
class ExprParser {
  private pos = 0
  constructor(
    private tokens: Token[],
    private lookup: (name: string) => boolean | null,
  ) {}

  parse(): boolean | null {
    const result = this.parseIff()
    return result
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos]
  }

  private consume(expected?: string): Token {
    const t = this.tokens[this.pos++]
    if (expected && (!t || t.value !== expected)) {
      throw new Error(`Expected ${expected} but got ${t?.value ?? 'EOF'}`)
    }
    return t
  }

  private parseIff(): boolean | null {
    let left = this.parseImplies()
    while (this.peek()?.value === 'IFF') {
      this.consume('IFF')
      const right = this.parseImplies()
      if (left === null || right === null) return null
      left = left === right
    }
    return left
  }

  private parseImplies(): boolean | null {
    let left = this.parseOr()
    while (this.peek()?.value === 'IMPLIES') {
      this.consume('IMPLIES')
      const right = this.parseOr()
      if (left === null || right === null) return null
      left = !left || right
    }
    return left
  }

  private parseOr(): boolean | null {
    let left = this.parseXor()
    while (this.peek()?.value === 'OR') {
      this.consume('OR')
      const right = this.parseXor()
      if (left === null || right === null) return null
      left = left || right
    }
    return left
  }

  private parseXor(): boolean | null {
    let left = this.parseAnd()
    while (this.peek()?.value === 'XOR') {
      this.consume('XOR')
      const right = this.parseAnd()
      if (left === null || right === null) return null
      left = left !== right
    }
    return left
  }

  private parseAnd(): boolean | null {
    let left = this.parseNot()
    while (this.peek()?.value === 'AND') {
      this.consume('AND')
      const right = this.parseNot()
      if (left === null || right === null) return null
      left = left && right
    }
    return left
  }

  private parseNot(): boolean | null {
    if (this.peek()?.value === 'NOT') {
      this.consume('NOT')
      const inner = this.parseNot()
      return inner === null ? null : !inner
    }
    return this.parseAtom()
  }

  private parseAtom(): boolean | null {
    const t = this.peek()
    if (!t) return null

    if (t.kind === 'LPAREN') {
      this.consume('(')
      const inner = this.parseIff()
      this.consume(')')
      return inner
    }

    if (t.kind === 'IDENT') {
      this.consume()
      return this.lookup(t.value)
    }

    return null
  }
}

/* ------------------------------------------------------------------ */
/*  InferenceEngine class                                              */
/* ------------------------------------------------------------------ */

export class InferenceEngine {
  private readonly config: InferenceEngineConfig

  // Knowledge base
  private readonly facts: Map<string, Proposition> = new Map()
  private readonly rules: Map<string, Rule> = new Map()
  private readonly conflicts: Conflict[] = []

  // Timing for built-in rules vs user rules
  private readonly ruleTimestamps: Map<string, number> = new Map()

  // Stats tracking
  private totalInferences = 0
  private totalRulesApplied = 0
  private totalFactsAdded = 0
  private totalConflictsResolved = 0
  private totalQueriesAnswered = 0
  private inferenceTimesMs: number[] = []
  private feedbackCount = 0

  // Feedback log
  private readonly feedbackLog: Array<{
    ruleId: string
    useful: boolean
    timestamp: number
  }> = []

  // Name → id index for fast name lookups
  private readonly nameIndex: Map<string, string> = new Map()

  /* -------------------------------------------------------------- */
  /*  Construction & initialisation                                  */
  /* -------------------------------------------------------------- */

  constructor(config?: Partial<InferenceEngineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initBuiltinRules()
  }

  private initBuiltinRules(): void {
    const defs = builtinRuleDefs()
    for (const def of defs) {
      // Ensure propositions referenced by built-in rules exist as assumptions
      const conditionIds: Condition[] = def.conditions.map(c => {
        const prop = this.ensureProposition(c.propName)
        return { propositionId: prop.id, expectedValue: c.expected }
      })

      const conclusionProp = this.ensureProposition(def.conclusionPropName)

      const ruleId = generateId('RULE')
      const rule: Rule = {
        id: ruleId,
        name: def.name,
        conditions: conditionIds,
        conclusion: { propId: conclusionProp.id, value: def.conclusionValue },
        priority: def.priority,
        confidence: def.confidence,
        metadata: { ...def.metadata, builtin: 'true' },
      }
      this.rules.set(ruleId, rule)
      this.ruleTimestamps.set(ruleId, Date.now())
    }
  }

  /**
   * Ensure a proposition with the given name exists.  If it does not,
   * create it as an unresolved assumption (value = null).
   */
  private ensureProposition(name: string): Proposition {
    const existing = this.nameIndex.get(name)
    if (existing) {
      return this.facts.get(existing)!
    }

    const prop: Proposition = {
      id: generateId('PROP'),
      name,
      value: null,
      confidence: 0,
      source: 'assumption',
    }
    this.facts.set(prop.id, prop)
    this.nameIndex.set(prop.name, prop.id)
    return prop
  }

  /* -------------------------------------------------------------- */
  /*  Fact management                                                */
  /* -------------------------------------------------------------- */

  addFact(name: string, value: boolean, confidence: number = 1.0): Proposition {
    const existingId = this.nameIndex.get(name)
    if (existingId) {
      const prop = this.facts.get(existingId)!
      prop.value = value
      prop.confidence = clamp01(confidence)
      prop.source = 'fact'
      this.totalFactsAdded++
      return { ...prop }
    }

    if (this.facts.size >= this.config.maxFacts) {
      throw new Error(`Maximum facts (${this.config.maxFacts}) reached`)
    }

    const prop: Proposition = {
      id: generateId('PROP'),
      name,
      value,
      confidence: clamp01(confidence),
      source: 'fact',
    }
    this.facts.set(prop.id, prop)
    this.nameIndex.set(prop.name, prop.id)
    this.totalFactsAdded++
    return { ...prop }
  }

  removeFact(id: string): boolean {
    const prop = this.facts.get(id)
    if (!prop) return false
    this.nameIndex.delete(prop.name)
    this.facts.delete(id)
    return true
  }

  getFact(id: string): Proposition | null {
    const p = this.facts.get(id)
    return p ? { ...p } : null
  }

  findFact(name: string): Proposition | null {
    const id = this.nameIndex.get(name)
    if (!id) return null
    const p = this.facts.get(id)
    return p ? { ...p } : null
  }

  getAllFacts(): Proposition[] {
    return Array.from(this.facts.values()).map(p => ({ ...p }))
  }

  /* -------------------------------------------------------------- */
  /*  Rule management                                                */
  /* -------------------------------------------------------------- */

  addRule(rule: Omit<Rule, 'id'>): Rule {
    if (this.rules.size >= this.config.maxRules) {
      throw new Error(`Maximum rules (${this.config.maxRules}) reached`)
    }

    // Ensure all referenced propositions exist
    for (const cond of rule.conditions) {
      if (!this.facts.has(cond.propositionId)) {
        throw new Error(`Unknown proposition ${cond.propositionId} in condition`)
      }
    }
    if (!this.facts.has(rule.conclusion.propId)) {
      throw new Error(`Unknown proposition ${rule.conclusion.propId} in conclusion`)
    }

    const ruleId = generateId('RULE')
    const newRule: Rule = { ...rule, id: ruleId, metadata: { ...rule.metadata } }
    this.rules.set(ruleId, newRule)
    this.ruleTimestamps.set(ruleId, Date.now())
    return { ...newRule }
  }

  removeRule(id: string): boolean {
    this.ruleTimestamps.delete(id)
    return this.rules.delete(id)
  }

  getRule(id: string): Rule | null {
    const r = this.rules.get(id)
    return r ? { ...r } : null
  }

  getAllRules(): Rule[] {
    return Array.from(this.rules.values()).map(r => ({ ...r }))
  }

  /* -------------------------------------------------------------- */
  /*  Forward chaining                                               */
  /* -------------------------------------------------------------- */

  forwardChain(): InferenceStep[] {
    if (!this.config.enableForwardChaining) return []

    const start = Date.now()
    const derivedSteps: InferenceStep[] = []
    let changed = true
    let depth = 0

    while (changed && depth < this.config.maxInferenceDepth) {
      changed = false
      depth++

      for (const rule of this.rules.values()) {
        if (!this.conditionsMet(rule)) continue

        const conclusionProp = this.facts.get(rule.conclusion.propId)
        if (!conclusionProp) continue

        const newConfidence = this.computeRuleConfidence(rule)

        // Skip if the conclusion already holds with equal or higher confidence
        if (
          conclusionProp.value === rule.conclusion.value &&
          conclusionProp.source !== 'assumption' &&
          conclusionProp.confidence >= newConfidence
        ) {
          continue
        }

        // Detect conflict: conclusion already derived with opposite value
        if (
          conclusionProp.value !== null &&
          conclusionProp.value !== rule.conclusion.value &&
          conclusionProp.source === 'inference'
        ) {
          this.recordConflict(rule, conclusionProp)
          continue
        }

        conclusionProp.value = rule.conclusion.value
        conclusionProp.confidence = newConfidence
        conclusionProp.source = 'inference'
        changed = true

        const step: InferenceStep = {
          ruleId: rule.id,
          inputFacts: rule.conditions.map(c => c.propositionId),
          outputFact: rule.conclusion.propId,
          confidence: newConfidence,
          timestamp: Date.now(),
        }
        derivedSteps.push(step)
        this.totalRulesApplied++
      }
    }

    this.totalInferences++
    this.inferenceTimesMs.push(Date.now() - start)
    return derivedSteps
  }

  /* -------------------------------------------------------------- */
  /*  Backward chaining                                              */
  /* -------------------------------------------------------------- */

  backwardChain(goalId: string): InferenceChain | null {
    if (!this.config.enableBackwardChaining) return null

    const start = Date.now()
    const visited = new Set<string>()
    const chain = this.backwardChainRecursive(goalId, visited, 0)
    this.totalInferences++
    this.inferenceTimesMs.push(Date.now() - start)
    return chain
  }

  private backwardChainRecursive(
    goalId: string,
    visited: Set<string>,
    depth: number,
  ): InferenceChain | null {
    if (depth > this.config.maxInferenceDepth) return null
    if (visited.has(goalId)) return null
    visited.add(goalId)

    const goal = this.facts.get(goalId)
    if (!goal) return null

    // If the goal already has a known value from a fact, return trivially
    if (goal.value !== null && goal.source === 'fact') {
      return {
        steps: [],
        finalConclusion: goalId,
        totalConfidence: goal.confidence,
        depth: 0,
      }
    }

    // Find rules that conclude this goal
    const candidateRules = this.findRulesForConclusion(goalId)
    if (candidateRules.length === 0) return null

    // Sort by priority descending so we try the best rule first
    candidateRules.sort((a, b) => b.priority - a.priority)

    for (const rule of candidateRules) {
      const subChains: InferenceChain[] = []
      let allConditionsMet = true

      for (const cond of rule.conditions) {
        const condProp = this.facts.get(cond.propositionId)
        if (!condProp) {
          allConditionsMet = false
          break
        }

        // If condition already satisfied by a known fact
        if (condProp.value === cond.expectedValue && condProp.source === 'fact') {
          subChains.push({
            steps: [],
            finalConclusion: cond.propositionId,
            totalConfidence: condProp.confidence,
            depth: 0,
          })
          continue
        }

        // If condition already satisfied by a prior inference
        if (condProp.value === cond.expectedValue && condProp.source === 'inference') {
          subChains.push({
            steps: [],
            finalConclusion: cond.propositionId,
            totalConfidence: condProp.confidence,
            depth: 0,
          })
          continue
        }

        // Recurse: try to prove the condition
        const subChain = this.backwardChainRecursive(
          cond.propositionId,
          new Set(visited),
          depth + 1,
        )

        if (!subChain) {
          allConditionsMet = false
          break
        }

        // Verify the sub-chain actually gives us the expected value
        const provenProp = this.facts.get(cond.propositionId)
        if (!provenProp || provenProp.value !== cond.expectedValue) {
          allConditionsMet = false
          break
        }

        subChains.push(subChain)
      }

      if (!allConditionsMet) continue

      // Combine sub-chain steps
      const allSteps: InferenceStep[] = []
      for (const sc of subChains) {
        allSteps.push(...sc.steps)
      }

      const ruleConfidence = this.computeRuleConfidence(rule)

      // Apply the conclusion
      const conclusionProp = this.facts.get(rule.conclusion.propId)
      if (conclusionProp) {
        conclusionProp.value = rule.conclusion.value
        conclusionProp.confidence = ruleConfidence
        conclusionProp.source = 'inference'
      }

      const step: InferenceStep = {
        ruleId: rule.id,
        inputFacts: rule.conditions.map(c => c.propositionId),
        outputFact: rule.conclusion.propId,
        confidence: ruleConfidence,
        timestamp: Date.now(),
      }
      allSteps.push(step)
      this.totalRulesApplied++

      const maxSubDepth = subChains.reduce((m, sc) => Math.max(m, sc.depth), 0)

      return {
        steps: allSteps,
        finalConclusion: goalId,
        totalConfidence: ruleConfidence,
        depth: maxSubDepth + 1,
      }
    }

    return null
  }

  private findRulesForConclusion(propId: string): Rule[] {
    const matches: Rule[] = []
    for (const rule of this.rules.values()) {
      if (rule.conclusion.propId === propId) {
        matches.push(rule)
      }
    }
    return matches
  }

  /* -------------------------------------------------------------- */
  /*  Query                                                          */
  /* -------------------------------------------------------------- */

  query(propositionName: string): QueryResult {
    const start = Date.now()
    this.totalQueriesAnswered++

    const id = this.nameIndex.get(propositionName)
    if (!id) {
      this.inferenceTimesMs.push(Date.now() - start)
      return {
        proposition: propositionName,
        value: null,
        confidence: 0,
        chain: null,
        answerable: false,
      }
    }

    const prop = this.facts.get(id)!

    // If already known, return immediately
    if (prop.value !== null && prop.source === 'fact') {
      this.inferenceTimesMs.push(Date.now() - start)
      return {
        proposition: propositionName,
        value: prop.value,
        confidence: prop.confidence,
        chain: null,
        answerable: true,
      }
    }

    // Try forward chaining first
    if (this.config.enableForwardChaining) {
      this.forwardChain()
      const updated = this.facts.get(id)!
      if (updated.value !== null) {
        this.inferenceTimesMs.push(Date.now() - start)
        return {
          proposition: propositionName,
          value: updated.value,
          confidence: updated.confidence,
          chain: null,
          answerable: true,
        }
      }
    }

    // Try backward chaining
    if (this.config.enableBackwardChaining) {
      const chain = this.backwardChain(id)
      const proven = this.facts.get(id)!
      if (chain && proven.value !== null) {
        this.inferenceTimesMs.push(Date.now() - start)
        return {
          proposition: propositionName,
          value: proven.value,
          confidence: proven.confidence,
          chain,
          answerable: true,
        }
      }
    }

    this.inferenceTimesMs.push(Date.now() - start)
    return {
      proposition: propositionName,
      value: prop.value,
      confidence: prop.confidence,
      chain: null,
      answerable: prop.value !== null,
    }
  }

  /* -------------------------------------------------------------- */
  /*  Truth table generation                                         */
  /* -------------------------------------------------------------- */

  generateTruthTable(propositionNames: string[]): TruthTable {
    if (!this.config.enableTruthTables) {
      return {
        variables: propositionNames,
        rows: [],
        tautology: false,
        contradiction: false,
        satisfiable: false,
      }
    }

    const propIds: string[] = []
    for (const name of propositionNames) {
      const id = this.nameIndex.get(name)
      if (!id) {
        return {
          variables: propositionNames,
          rows: [],
          tautology: false,
          contradiction: false,
          satisfiable: false,
        }
      }
      propIds.push(id)
    }

    const n = propositionNames.length
    const totalRows = 1 << n // 2^n
    const rows: TruthTableRow[] = []

    // Save original values so we can restore them
    const originals: Array<{
      value: boolean | null
      confidence: number
      source: Proposition['source']
    }> = propIds.map(pid => {
      const p = this.facts.get(pid)!
      return { value: p.value, confidence: p.confidence, source: p.source }
    })

    let trueCount = 0

    for (let mask = 0; mask < totalRows; mask++) {
      const assignments: Record<string, boolean> = {}

      // Assign truth values
      for (let bit = 0; bit < n; bit++) {
        const val = Boolean((mask >> (n - 1 - bit)) & 1)
        assignments[propositionNames[bit]] = val
        const prop = this.facts.get(propIds[bit])!
        prop.value = val
        prop.confidence = 1
        prop.source = 'fact'
      }

      // Run forward chaining and collect the result
      this.forwardChain()

      // The "result" is whether ALL rules can fire without contradiction
      const result = this.conflicts.length === 0 && this.allConclusionsConsistent()

      if (result) trueCount++
      rows.push({ assignments, result })

      // Reset inferred facts
      this.resetInferredFacts()
      // Clear conflicts accumulated during this row
      this.conflicts.length = 0
    }

    // Restore originals
    for (let i = 0; i < propIds.length; i++) {
      const prop = this.facts.get(propIds[i])!
      prop.value = originals[i].value
      prop.confidence = originals[i].confidence
      prop.source = originals[i].source
    }

    const tautology = trueCount === totalRows
    const contradiction = trueCount === 0
    const satisfiable = trueCount > 0

    return {
      variables: [...propositionNames],
      rows,
      tautology,
      contradiction,
      satisfiable,
    }
  }

  private allConclusionsConsistent(): boolean {
    for (const rule of this.rules.values()) {
      if (!this.conditionsMet(rule)) continue
      const prop = this.facts.get(rule.conclusion.propId)
      if (!prop) continue
      if (prop.value !== null && prop.value !== rule.conclusion.value) {
        return false
      }
    }
    return true
  }

  private resetInferredFacts(): void {
    for (const prop of this.facts.values()) {
      if (prop.source === 'inference') {
        prop.value = null
        prop.confidence = 0
        prop.source = 'assumption'
      }
    }
  }

  /* -------------------------------------------------------------- */
  /*  Expression evaluation                                          */
  /* -------------------------------------------------------------- */

  evaluateExpression(expr: string): boolean | null {
    const tokens = tokenize(expr)
    if (tokens.length === 0) return null

    const lookup = (name: string): boolean | null => {
      const id = this.nameIndex.get(name)
      if (!id) return null
      const prop = this.facts.get(id)
      return prop?.value ?? null
    }

    try {
      const parser = new ExprParser(tokens, lookup)
      return parser.parse()
    } catch {
      return null
    }
  }

  /* -------------------------------------------------------------- */
  /*  Conflict detection & resolution                                */
  /* -------------------------------------------------------------- */

  getConflicts(): Conflict[] {
    return [...this.conflicts]
  }

  resolveConflicts(): Conflict[] {
    const resolved: Conflict[] = []

    // Group conflicts by proposition
    const byProp = new Map<string, Conflict[]>()
    for (const c of this.conflicts) {
      const arr = byProp.get(c.proposition) || []
      arr.push(c)
      byProp.set(c.proposition, arr)
    }

    for (const [propId, propConflicts] of byProp.entries()) {
      for (const conflict of propConflicts) {
        const ruleA = this.rules.get(conflict.ruleA)
        const ruleB = this.rules.get(conflict.ruleB)
        if (!ruleA || !ruleB) continue

        let winner: Rule
        const resolution: Conflict['resolution'] = this.config.conflictResolution

        switch (this.config.conflictResolution) {
          case 'priority': {
            winner = ruleA.priority >= ruleB.priority ? ruleA : ruleB
            break
          }
          case 'recency': {
            const tsA = this.ruleTimestamps.get(conflict.ruleA) ?? 0
            const tsB = this.ruleTimestamps.get(conflict.ruleB) ?? 0
            winner = tsA >= tsB ? ruleA : ruleB
            break
          }
          case 'specificity': {
            winner = ruleA.conditions.length >= ruleB.conditions.length ? ruleA : ruleB
            break
          }
        }

        // Apply the winner's conclusion
        const prop = this.facts.get(propId)
        if (prop) {
          prop.value = winner.conclusion.value
          prop.confidence = this.computeRuleConfidence(winner)
          prop.source = 'inference'
        }

        const resolvedConflict: Conflict = {
          ...conflict,
          resolvedBy: winner.id,
          resolution,
        }
        resolved.push(resolvedConflict)
        this.totalConflictsResolved++
      }
    }

    // Clear the conflict list after resolution
    this.conflicts.length = 0

    return resolved
  }

  private recordConflict(newRule: Rule, existingProp: Proposition): void {
    // Find the rule that originally derived the existing value
    const existingRuleId = this.findDerivingRule(existingProp.id)

    this.conflicts.push({
      ruleA: existingRuleId ?? 'unknown',
      ruleB: newRule.id,
      proposition: existingProp.id,
      resolvedBy: '',
      resolution: this.config.conflictResolution,
    })
  }

  private findDerivingRule(propId: string): string | null {
    for (const rule of this.rules.values()) {
      if (rule.conclusion.propId === propId && this.conditionsMet(rule)) {
        return rule.id
      }
    }
    return null
  }

  /* -------------------------------------------------------------- */
  /*  Explanation                                                     */
  /* -------------------------------------------------------------- */

  explain(propositionId: string): string {
    const prop = this.facts.get(propositionId)
    if (!prop) return `Proposition ${propositionId} is unknown.`

    if (prop.value === null) {
      return `"${prop.name}" has no known value. It is an unresolved assumption.`
    }

    if (prop.source === 'fact') {
      return (
        `"${prop.name}" is ${prop.value ? 'TRUE' : 'FALSE'} ` +
        `because it was directly asserted as a fact ` +
        `(confidence: ${round2(prop.confidence)}).`
      )
    }

    if (prop.source === 'inference') {
      const derivingRule = this.findDerivingRule(prop.id)
      if (derivingRule) {
        const rule = this.rules.get(derivingRule)!
        const condDescriptions = rule.conditions.map(c => {
          const cProp = this.facts.get(c.propositionId)
          const name = cProp?.name ?? c.propositionId
          return `"${name}" is ${c.expectedValue ? 'TRUE' : 'FALSE'}`
        })
        return (
          `"${prop.name}" is ${prop.value ? 'TRUE' : 'FALSE'} ` +
          `because rule "${rule.name}" fired. ` +
          `Conditions: ${condDescriptions.join(' AND ')}. ` +
          `Rule confidence: ${round2(rule.confidence)}, ` +
          `result confidence: ${round2(prop.confidence)}.`
        )
      }
      return (
        `"${prop.name}" is ${prop.value ? 'TRUE' : 'FALSE'} ` +
        `via inference (confidence: ${round2(prop.confidence)}).`
      )
    }

    return (
      `"${prop.name}" is ${prop.value ? 'TRUE' : 'FALSE'} ` +
      `as an assumption (confidence: ${round2(prop.confidence)}).`
    )
  }

  /* -------------------------------------------------------------- */
  /*  Learning / feedback                                            */
  /* -------------------------------------------------------------- */

  learnRule(rule: Omit<Rule, 'id'>): Rule {
    this.feedbackCount++
    this.feedbackLog.push({
      ruleId: '',
      useful: true,
      timestamp: Date.now(),
    })

    const newRule = this.addRule(rule)
    this.feedbackLog[this.feedbackLog.length - 1].ruleId = newRule.id
    return newRule
  }

  /* -------------------------------------------------------------- */
  /*  Stats                                                          */
  /* -------------------------------------------------------------- */

  getStats(): Readonly<InferenceEngineStats> {
    const avgInferenceTime =
      this.inferenceTimesMs.length > 0
        ? this.inferenceTimesMs.reduce((s, v) => s + v, 0) / this.inferenceTimesMs.length
        : 0

    return {
      totalInferences: this.totalInferences,
      totalRulesApplied: this.totalRulesApplied,
      totalFactsAdded: this.totalFactsAdded,
      totalConflictsResolved: this.totalConflictsResolved,
      totalQueriesAnswered: this.totalQueriesAnswered,
      avgInferenceTime: round2(avgInferenceTime),
      feedbackCount: this.feedbackCount,
    }
  }

  /* -------------------------------------------------------------- */
  /*  Serialization                                                  */
  /* -------------------------------------------------------------- */

  serialize(): string {
    return JSON.stringify({
      config: this.config,
      facts: Array.from(this.facts.entries()),
      rules: Array.from(this.rules.entries()),
      ruleTimestamps: Array.from(this.ruleTimestamps.entries()),
      conflicts: this.conflicts,
      nameIndex: Array.from(this.nameIndex.entries()),
      totalInferences: this.totalInferences,
      totalRulesApplied: this.totalRulesApplied,
      totalFactsAdded: this.totalFactsAdded,
      totalConflictsResolved: this.totalConflictsResolved,
      totalQueriesAnswered: this.totalQueriesAnswered,
      inferenceTimesMs: this.inferenceTimesMs,
      feedbackCount: this.feedbackCount,
      feedbackLog: this.feedbackLog,
    })
  }

  static deserialize(json: string): InferenceEngine {
    const data = JSON.parse(json) as {
      config: InferenceEngineConfig
      facts: Array<[string, Proposition]>
      rules: Array<[string, Rule]>
      ruleTimestamps: Array<[string, number]>
      conflicts: Conflict[]
      nameIndex: Array<[string, string]>
      totalInferences: number
      totalRulesApplied: number
      totalFactsAdded: number
      totalConflictsResolved: number
      totalQueriesAnswered: number
      inferenceTimesMs: number[]
      feedbackCount: number
      feedbackLog: Array<{ ruleId: string; useful: boolean; timestamp: number }>
    }

    const instance = new InferenceEngine(data.config)

    // Clear the built-in state that was created by the constructor
    instance.facts.clear()
    instance.rules.clear()
    instance.nameIndex.clear()
    instance.ruleTimestamps.clear()
    instance.conflicts.length = 0

    // Restore facts, rules, and indexes
    for (const [k, v] of data.facts) instance.facts.set(k, v)
    for (const [k, v] of data.rules) instance.rules.set(k, v)
    for (const [k, v] of data.nameIndex) instance.nameIndex.set(k, v)
    for (const [k, v] of data.ruleTimestamps) instance.ruleTimestamps.set(k, v)
    for (const c of data.conflicts) instance.conflicts.push(c)
    for (const f of data.feedbackLog) instance.feedbackLog.push(f)

    // Restore stat counters
    instance.totalInferences = data.totalInferences
    instance.totalRulesApplied = data.totalRulesApplied
    instance.totalFactsAdded = data.totalFactsAdded
    instance.totalConflictsResolved = data.totalConflictsResolved
    instance.totalQueriesAnswered = data.totalQueriesAnswered
    instance.inferenceTimesMs = [...data.inferenceTimesMs]
    instance.feedbackCount = data.feedbackCount

    return instance
  }

  /* -------------------------------------------------------------- */
  /*  Private helpers                                                */
  /* -------------------------------------------------------------- */

  private conditionsMet(rule: Rule): boolean {
    for (const cond of rule.conditions) {
      const prop = this.facts.get(cond.propositionId)
      if (!prop) return false
      if (prop.value === null) return false
      if (prop.value !== cond.expectedValue) return false
    }
    return true
  }

  private computeRuleConfidence(rule: Rule): number {
    let combined = rule.confidence
    for (const cond of rule.conditions) {
      const prop = this.facts.get(cond.propositionId)
      if (prop) {
        combined *= prop.confidence
      }
    }
    return clamp01(round2(combined))
  }
}
