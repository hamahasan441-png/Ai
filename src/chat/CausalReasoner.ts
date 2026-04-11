/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🔗  C A U S A L   R E A S O N E R                                  ║
 * ║                                                                             ║
 * ║   Causal reasoning with graph-based analysis:                               ║
 * ║     build → infer → intervene → counterfactual                              ║
 * ║                                                                             ║
 * ║     • Build causal graphs from textual observations                         ║
 * ║     • Root-cause analysis with ranked likelihood                            ║
 * ║     • Counterfactual "what-if" reasoning                                    ║
 * ║     • Bayesian-style confidence propagation                                 ║
 * ║     • D-separation conditional independence checks                          ║
 * ║     • Intervention prediction and Markov blanket extraction                 ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface CausalReasonerConfig {
  maxChainLength: number
  minConfidence: number
  strengthDecayRate: number
  maxGraphNodes: number
  enableLearning: boolean
  confoundingThreshold: number
}

export interface CausalReasonerStats {
  totalGraphsBuilt: number
  totalInferences: number
  totalInterventions: number
  totalCounterfactuals: number
  avgConfidence: number
  feedbackReceived: number
  feedbackAccuracy: number
}

export interface CausalNode {
  id: string
  label: string
  type: 'cause' | 'effect' | 'mediator' | 'confounder'
  properties: Record<string, string>
}

export interface CausalEdge {
  fromId: string
  toId: string
  strength: number
  mechanism: string
  confidence: number
}

export interface CausalGraph {
  nodes: CausalNode[]
  edges: CausalEdge[]
}

export interface CausalChain {
  nodes: CausalNode[]
  edges: CausalEdge[]
  totalStrength: number
  confidence: number
}

export interface CounterfactualResult {
  scenario: string
  predictedOutcome: string
  confidence: number
  reasoning: string[]
}

export interface RootCauseResult {
  effect: string
  causes: Array<{
    node: CausalNode
    likelihood: number
    mechanism: string
    chain: CausalChain
  }>
}

export interface CausalInference {
  cause: string
  effect: string
  relationship: 'direct' | 'indirect' | 'spurious' | 'none'
  strength: number
  confidence: number
  mechanism: string
  confounders: string[]
}

export interface InterventionResult {
  intervention: string
  targetNode: string
  predictedEffects: Array<{
    node: CausalNode
    direction: 'increase' | 'decrease' | 'unchanged'
    magnitude: number
    confidence: number
  }>
  sideEffects: string[]
  confidence: number
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: CausalReasonerConfig = {
  maxChainLength: 8,
  minConfidence: 0.1,
  strengthDecayRate: 0.15,
  maxGraphNodes: 200,
  enableLearning: true,
  confoundingThreshold: 0.4,
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
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
  'can',
  'shall',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'into',
  'about',
  'that',
  'this',
  'it',
  'its',
  'and',
  'or',
  'not',
  'but',
  'if',
  'then',
  'so',
  'up',
  'out',
  'no',
  'just',
  'also',
  'very',
  'what',
  'how',
  'like',
  'such',
  'when',
  'which',
  'there',
  'their',
  'than',
])

// ── Causal Keyword Patterns ─────────────────────────────────────────────────

const CAUSAL_INDICATORS: { pattern: RegExp; direction: 'forward' | 'backward' }[] = [
  { pattern: /\bcauses?\b/gi, direction: 'forward' },
  { pattern: /\bleads?\s+to\b/gi, direction: 'forward' },
  { pattern: /\bresults?\s+in\b/gi, direction: 'forward' },
  { pattern: /\btriggers?\b/gi, direction: 'forward' },
  { pattern: /\bproduces?\b/gi, direction: 'forward' },
  { pattern: /\bincreases?\b/gi, direction: 'forward' },
  { pattern: /\bdecreases?\b/gi, direction: 'forward' },
  { pattern: /\bprevents?\b/gi, direction: 'forward' },
  { pattern: /\benables?\b/gi, direction: 'forward' },
  { pattern: /\binduces?\b/gi, direction: 'forward' },
  { pattern: /\bcaused\s+by\b/gi, direction: 'backward' },
  { pattern: /\bdue\s+to\b/gi, direction: 'backward' },
  { pattern: /\bbecause\s+of?\b/gi, direction: 'backward' },
  { pattern: /\bresults?\s+from\b/gi, direction: 'backward' },
  { pattern: /\bdriven\s+by\b/gi, direction: 'backward' },
  { pattern: /\binduced\s+by\b/gi, direction: 'backward' },
]

// ── Pre-Built Causal Pattern Database ───────────────────────────────────────

interface CausalPatternEntry {
  cause: string
  effect: string
  mechanism: string
  strength: number
  domain: string
  confounders: string[]
}

function buildCausalPatternDatabase(): CausalPatternEntry[] {
  const entries: CausalPatternEntry[] = []

  const add = (
    cause: string,
    effect: string,
    mechanism: string,
    strength: number,
    domain: string,
    confounders: string[] = [],
  ) => {
    entries.push({ cause, effect, mechanism, strength, domain, confounders })
  }

  // ── Software Bugs & Failures ──
  add(
    'null pointer dereference',
    'application crash',
    'Accessing memory at address zero triggers a segfault or unhandled exception',
    0.95,
    'software-bugs',
  )
  add(
    'memory leak',
    'out of memory error',
    'Unreleased allocations accumulate until heap is exhausted',
    0.85,
    'software-bugs',
    ['workload volume', 'available memory'],
  )
  add(
    'race condition',
    'data corruption',
    'Concurrent unsynchronized writes produce inconsistent state',
    0.8,
    'software-bugs',
    ['thread count', 'lock granularity'],
  )
  add(
    'buffer overflow',
    'security vulnerability',
    'Writing past buffer boundary overwrites adjacent memory',
    0.9,
    'software-bugs',
  )
  add(
    'infinite loop',
    'CPU exhaustion',
    'Loop termination condition never satisfied, consuming all cycles',
    0.95,
    'software-bugs',
  )
  add(
    'unhandled exception',
    'service downtime',
    'Uncaught error propagates to top level and terminates the process',
    0.85,
    'software-bugs',
    ['error handling coverage'],
  )
  add(
    'deadlock',
    'system hang',
    'Circular lock dependency prevents any thread from progressing',
    0.9,
    'software-bugs',
    ['lock ordering'],
  )
  add(
    'SQL injection',
    'data breach',
    'Unsanitized input allows attacker to execute arbitrary queries',
    0.85,
    'software-bugs',
    ['input validation'],
  )
  add(
    'incorrect caching',
    'stale data served',
    'Cache invalidation failure returns outdated values',
    0.75,
    'software-bugs',
    ['cache TTL', 'write frequency'],
  )
  add(
    'missing index',
    'slow database queries',
    'Full table scans required without index support',
    0.8,
    'software-bugs',
    ['table size', 'query complexity'],
  )

  // ── Performance & Scalability ──
  add(
    'high traffic spike',
    'server overload',
    'Request volume exceeds server capacity and queues saturate',
    0.8,
    'performance',
    ['auto-scaling policy', 'server capacity'],
  )
  add(
    'network latency',
    'request timeout',
    'Round-trip delay exceeds configured timeout threshold',
    0.7,
    'performance',
    ['network conditions', 'timeout setting'],
  )
  add(
    'excessive logging',
    'disk space exhaustion',
    'High-volume log output fills disk faster than rotation can reclaim',
    0.65,
    'performance',
    ['log level', 'disk size'],
  )
  add(
    'N+1 query pattern',
    'degraded response time',
    'Each parent record triggers an additional child query',
    0.8,
    'performance',
    ['data volume', 'ORM configuration'],
  )
  add(
    'thread pool exhaustion',
    'request queuing',
    'All worker threads busy leaves incoming requests waiting',
    0.75,
    'performance',
    ['pool size', 'request duration'],
  )
  add(
    'garbage collection pause',
    'latency spike',
    'Stop-the-world GC halts application threads during collection',
    0.7,
    'performance',
    ['heap size', 'allocation rate'],
  )

  // ── DevOps & Infrastructure ──
  add(
    'misconfigured firewall',
    'connectivity failure',
    'Incorrect rules block legitimate traffic',
    0.8,
    'devops',
  )
  add(
    'expired SSL certificate',
    'HTTPS errors',
    'Browser rejects connection when certificate validity has lapsed',
    0.95,
    'devops',
  )
  add(
    'DNS misconfiguration',
    'service unreachable',
    'Incorrect DNS records route traffic to wrong or non-existent hosts',
    0.85,
    'devops',
  )
  add(
    'insufficient disk space',
    'write failures',
    'File system cannot allocate blocks for new data',
    0.9,
    'devops',
  )
  add(
    'deployment of buggy code',
    'production incident',
    'Untested changes introduce defects into the live environment',
    0.75,
    'devops',
    ['test coverage', 'review process'],
  )

  // ── Human & Process Factors ──
  add(
    'unclear requirements',
    'incorrect implementation',
    'Ambiguous specifications lead developers to make wrong assumptions',
    0.7,
    'process',
    ['communication quality'],
  )
  add(
    'lack of code review',
    'increased defect rate',
    'Unreviewed code bypasses peer quality checks',
    0.65,
    'process',
    ['team size', 'review culture'],
  )
  add(
    'missing tests',
    'undetected regression',
    'Absence of automated checks allows regressions to reach production',
    0.75,
    'process',
    ['test coverage'],
  )
  add(
    'poor documentation',
    'onboarding delays',
    'New team members spend extra time understanding undocumented systems',
    0.6,
    'process',
  )
  add(
    'technical debt',
    'reduced velocity',
    'Accumulated shortcuts increase the effort required for each change',
    0.7,
    'process',
    ['codebase age', 'refactoring budget'],
  )

  // ── Cascading Failure Chains ──
  add(
    'server overload',
    'cascading failure',
    'Overloaded server pushes excess load to peers, causing chain reaction',
    0.75,
    'infrastructure',
    ['redundancy level'],
  )
  add(
    'data corruption',
    'downstream errors',
    'Corrupted data propagates through dependent systems',
    0.8,
    'infrastructure',
  )
  add(
    'service downtime',
    'user complaints',
    'Unavailable service degrades user experience and generates support load',
    0.85,
    'infrastructure',
  )

  return entries
}

// ── Intervention Direction Keywords ─────────────────────────────────────────

const INTERVENTION_KEYWORDS: { pattern: RegExp; direction: 'increase' | 'decrease' }[] = [
  { pattern: /\bincrease\b/gi, direction: 'increase' },
  { pattern: /\badd(?:ing)?\b/gi, direction: 'increase' },
  { pattern: /\benable\b/gi, direction: 'increase' },
  { pattern: /\bintroduce\b/gi, direction: 'increase' },
  { pattern: /\bscale\s*up\b/gi, direction: 'increase' },
  { pattern: /\bdecrease\b/gi, direction: 'decrease' },
  { pattern: /\bremove\b/gi, direction: 'decrease' },
  { pattern: /\bdisable\b/gi, direction: 'decrease' },
  { pattern: /\bfix(?:ing)?\b/gi, direction: 'decrease' },
  { pattern: /\breduce\b/gi, direction: 'decrease' },
  { pattern: /\beliminate\b/gi, direction: 'decrease' },
  { pattern: /\bscale\s*down\b/gi, direction: 'decrease' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
}

function generateNodeId(): string {
  return `cn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function tokenSimilarity(textA: string, textB: string): number {
  const tokensA = tokenize(textA)
  const tokensB = tokenize(textB)
  if (tokensA.length === 0 && tokensB.length === 0) return 1
  if (tokensA.length === 0 || tokensB.length === 0) return 0

  let matches = 0
  for (const ta of tokensA) {
    for (const tb of tokensB) {
      if (ta === tb) {
        matches++
        break
      }
      if (ta.length > 3 && tb.length > 3) {
        if (ta.includes(tb) || tb.includes(ta)) {
          matches += 0.5
          break
        }
      }
    }
  }
  return clamp(matches / Math.max(tokensA.length, tokensB.length), 0, 1)
}

function splitCausalPhrase(
  text: string,
): { left: string; right: string; direction: 'forward' | 'backward' } | null {
  for (const { pattern, direction } of CAUSAL_INDICATORS) {
    pattern.lastIndex = 0
    const match = pattern.exec(text)
    if (match) {
      const left = text.slice(0, match.index).trim()
      const right = text.slice(match.index + match[0].length).trim()
      if (left.length > 0 && right.length > 0) {
        return { left, right, direction }
      }
    }
  }
  return null
}

function findBestPatternMatch(
  text: string,
  patterns: CausalPatternEntry[],
): CausalPatternEntry | null {
  let best: CausalPatternEntry | null = null
  let bestScore = 0

  const lower = text.toLowerCase()
  for (const entry of patterns) {
    const causeScore = tokenSimilarity(lower, entry.cause)
    const effectScore = tokenSimilarity(lower, entry.effect)
    const score = Math.max(causeScore, effectScore)
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }
  return bestScore >= 0.3 ? best : null
}

function detectInterventionDirection(text: string): 'increase' | 'decrease' | 'unknown' {
  for (const { pattern, direction } of INTERVENTION_KEYWORDS) {
    pattern.lastIndex = 0
    if (pattern.test(text)) return direction
  }
  return 'unknown'
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class CausalReasoner {
  private readonly config: CausalReasonerConfig
  private readonly patternDB: CausalPatternEntry[]
  private currentGraph: CausalGraph = { nodes: [], edges: [] }
  private totalGraphsBuilt = 0
  private totalInferences = 0
  private totalInterventions = 0
  private totalCounterfactuals = 0
  private confidenceHistory: number[] = []
  private feedbackCorrect = 0
  private feedbackTotal = 0

  constructor(config?: Partial<CausalReasonerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.patternDB = buildCausalPatternDatabase()
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /** Build a causal graph from an array of textual observations. */
  buildCausalGraph(observations: string[]): CausalGraph {
    const graph: CausalGraph = { nodes: [], edges: [] }
    const nodeIndex = new Map<string, CausalNode>()

    const getOrCreateNode = (label: string, type: CausalNode['type']): CausalNode => {
      const key = label.toLowerCase().trim()
      if (nodeIndex.has(key)) return nodeIndex.get(key)!
      const node: CausalNode = { id: generateNodeId(), label: key, type, properties: {} }
      graph.nodes.push(node)
      nodeIndex.set(key, node)
      return node
    }

    for (const obs of observations) {
      const parsed = splitCausalPhrase(obs)
      if (parsed) {
        const { left, right, direction } = parsed
        const causeLabel = direction === 'forward' ? left : right
        const effectLabel = direction === 'forward' ? right : left

        const causeNode = getOrCreateNode(causeLabel, 'cause')
        const effectNode = getOrCreateNode(effectLabel, 'effect')

        const patternMatch = this.findMatchingPattern(causeLabel, effectLabel)
        const strength = patternMatch ? patternMatch.strength : 0.5
        const mechanism = patternMatch
          ? patternMatch.mechanism
          : `${causeLabel} leads to ${effectLabel}`
        const confidence = patternMatch ? 0.8 : 0.5

        graph.edges.push({
          fromId: causeNode.id,
          toId: effectNode.id,
          strength: round2(strength),
          mechanism,
          confidence: round2(confidence),
        })

        // Add confounders from pattern knowledge
        if (patternMatch) {
          for (const conf of patternMatch.confounders) {
            const confNode = getOrCreateNode(conf, 'confounder')
            confNode.properties['confounds'] = `${causeLabel} → ${effectLabel}`
          }
        }
      } else {
        // No explicit causal indicator; check pattern database
        const match = findBestPatternMatch(obs, this.patternDB)
        if (match) {
          const causeNode = getOrCreateNode(match.cause, 'cause')
          const effectNode = getOrCreateNode(match.effect, 'effect')
          graph.edges.push({
            fromId: causeNode.id,
            toId: effectNode.id,
            strength: round2(match.strength * 0.8),
            mechanism: match.mechanism,
            confidence: round2(0.5),
          })
        }
      }
    }

    this.detectMediators(graph)
    this.currentGraph = graph
    this.totalGraphsBuilt++
    return graph
  }

  /** Find root causes for an observed effect. */
  findRootCauses(effect: string, graph?: CausalGraph): RootCauseResult {
    const g = graph ?? this.currentGraph
    const effectLower = effect.toLowerCase()

    // Find effect node(s) that match the description
    const effectNodes = g.nodes.filter(
      n =>
        tokenSimilarity(n.label, effectLower) >= 0.3 ||
        n.label.includes(effectLower) ||
        effectLower.includes(n.label),
    )

    if (effectNodes.length === 0) {
      // Fall back to pattern database
      return this.rootCauseFromPatternDB(effect)
    }

    const causes: RootCauseResult['causes'] = []

    for (const effectNode of effectNodes) {
      const roots = this.traceRoots(effectNode.id, g)
      for (const { nodeId, chain } of roots) {
        const node = g.nodes.find(n => n.id === nodeId)
        if (!node) continue

        const likelihood = round2(chain.totalStrength * chain.confidence)
        const mechanism =
          chain.edges.length > 0
            ? chain.edges.map(e => e.mechanism).join(' → ')
            : 'Direct observation'

        causes.push({ node, likelihood, mechanism, chain })
      }
    }

    // Sort by likelihood descending
    causes.sort((a, b) => b.likelihood - a.likelihood)

    return { effect, causes }
  }

  /** Counterfactual analysis: "What if X didn't happen?" */
  analyzeCounterfactual(condition: string, graph?: CausalGraph): CounterfactualResult {
    const g = graph ?? this.currentGraph
    this.totalCounterfactuals++

    const condLower = condition.toLowerCase()
    const reasoning: string[] = []
    let targetNode: CausalNode | undefined

    // Find the node matching the counterfactual condition
    for (const node of g.nodes) {
      if (
        tokenSimilarity(node.label, condLower) >= 0.3 ||
        condLower.includes(node.label) ||
        node.label.includes(condLower)
      ) {
        targetNode = node
        break
      }
    }

    if (!targetNode) {
      // Use pattern DB as fallback
      return this.counterfactualFromPatternDB(condition)
    }

    reasoning.push(`Identified "${targetNode.label}" as the counterfactual variable.`)

    // Find all downstream effects
    const downstream = this.findDownstream(targetNode.id, g)
    const affectedEffects: string[] = []

    for (const { nodeId, strength, confidence } of downstream) {
      const node = g.nodes.find(n => n.id === nodeId)
      if (!node) continue
      affectedEffects.push(node.label)
      reasoning.push(
        `Without "${targetNode.label}", "${node.label}" would be affected ` +
          `(strength=${round2(strength)}, confidence=${round2(confidence)}).`,
      )
    }

    // Check for alternative paths that might still produce the effect
    const alternativePaths = this.findAlternativePaths(targetNode.id, downstream, g)
    if (alternativePaths.length > 0) {
      reasoning.push(`However, alternative causal paths exist via: ${alternativePaths.join(', ')}.`)
    }

    const overallConfidence =
      downstream.length > 0
        ? round2(downstream.reduce((s, d) => s + d.confidence, 0) / downstream.length)
        : 0.3

    this.confidenceHistory.push(overallConfidence)

    const predictedOutcome =
      affectedEffects.length > 0
        ? `Without "${targetNode.label}", the following would likely not occur: ${affectedEffects.join(', ')}.` +
          (alternativePaths.length > 0 ? ' Some effects may persist via alternative paths.' : '')
        : `Removing "${targetNode.label}" has no identified downstream effects in the current graph.`

    return {
      scenario: `What if "${targetNode.label}" did not happen?`,
      predictedOutcome,
      confidence: overallConfidence,
      reasoning,
    }
  }

  /** Determine if A causally relates to B. */
  inferCausality(cause: string, effect: string): CausalInference {
    this.totalInferences++
    const g = this.currentGraph

    // Check pattern database first
    const patternMatch = this.findMatchingPattern(cause, effect)

    // Check current graph for paths
    const causeNodes = g.nodes.filter(n => tokenSimilarity(n.label, cause.toLowerCase()) >= 0.3)
    const effectNodes = g.nodes.filter(n => tokenSimilarity(n.label, effect.toLowerCase()) >= 0.3)

    let graphRelationship: 'direct' | 'indirect' | 'none' = 'none'
    let graphStrength = 0
    let graphConfidence = 0
    let graphMechanism = ''
    const confounders: string[] = []

    for (const cn of causeNodes) {
      for (const en of effectNodes) {
        // Direct edge?
        const directEdge = g.edges.find(e => e.fromId === cn.id && e.toId === en.id)
        if (directEdge) {
          graphRelationship = 'direct'
          graphStrength = directEdge.strength
          graphConfidence = directEdge.confidence
          graphMechanism = directEdge.mechanism
        } else {
          // Indirect path?
          const chains = this.findAllPaths(cn.id, en.id, g)
          if (chains.length > 0) {
            const best = chains.sort((a, b) => b.totalStrength - a.totalStrength)[0]
            if (graphRelationship !== 'direct') {
              graphRelationship = 'indirect'
              graphStrength = best.totalStrength
              graphConfidence = best.confidence
              graphMechanism = best.edges.map(e => e.mechanism).join(' → ')
            }
          }
        }

        // Detect confounders
        const cnConfounders = this.detectConfounders(cn.id, en.id, g)
        for (const c of cnConfounders) confounders.push(c)
      }
    }

    // Merge with pattern DB knowledge
    let relationship: CausalInference['relationship'] = graphRelationship
    let strength = graphStrength
    let confidence = graphConfidence
    let mechanism = graphMechanism

    if (patternMatch) {
      if (relationship === 'none') {
        relationship = 'direct'
        strength = patternMatch.strength
        mechanism = patternMatch.mechanism
        confidence = 0.7
      } else {
        // Boost confidence with corroborating pattern knowledge
        strength = round2(Math.max(strength, patternMatch.strength))
        confidence = round2(clamp(confidence + 0.15, 0, 1))
      }
      for (const c of patternMatch.confounders) {
        if (!confounders.includes(c)) confounders.push(c)
      }
    }

    // Mark as spurious if many confounders and low direct strength
    if (confounders.length > 2 && strength < this.config.confoundingThreshold) {
      relationship = 'spurious'
    }

    this.confidenceHistory.push(confidence)

    return {
      cause,
      effect,
      relationship,
      strength: round2(strength),
      confidence: round2(confidence),
      mechanism: mechanism || `No known mechanism linking "${cause}" to "${effect}"`,
      confounders,
    }
  }

  /** Predict the effect of an intervention on the causal system. */
  predictIntervention(intervention: string, graph?: CausalGraph): InterventionResult {
    const g = graph ?? this.currentGraph
    this.totalInterventions++

    const direction = detectInterventionDirection(intervention)
    const interventionLower = intervention.toLowerCase()

    // Find target node of intervention
    let targetNode: CausalNode | undefined
    let bestSim = 0
    for (const node of g.nodes) {
      const sim = tokenSimilarity(node.label, interventionLower)
      if (sim > bestSim) {
        bestSim = sim
        targetNode = node
      }
    }

    if (!targetNode || bestSim < 0.2) {
      return this.interventionFromPatternDB(intervention)
    }

    const predictedEffects: InterventionResult['predictedEffects'] = []
    const sideEffects: string[] = []

    // do(X) — cut all incoming edges (intervention severs causes)
    const downstream = this.findDownstream(targetNode.id, g)

    for (const { nodeId, strength, confidence } of downstream) {
      const node = g.nodes.find(n => n.id === nodeId)
      if (!node) continue

      const effectDirection =
        direction === 'decrease'
          ? ('decrease' as const)
          : direction === 'increase'
            ? ('increase' as const)
            : ('unchanged' as const)

      predictedEffects.push({
        node,
        direction: effectDirection,
        magnitude: round2(strength),
        confidence: round2(confidence),
      })
    }

    // Detect side effects: other nodes connected to the target
    const incomingEdges = g.edges.filter(e => e.toId === targetNode!.id)
    for (const edge of incomingEdges) {
      const sourceNode = g.nodes.find(n => n.id === edge.fromId)
      if (sourceNode) {
        sideEffects.push(
          `Intervention may disrupt the path from "${sourceNode.label}" through "${targetNode.label}"`,
        )
      }
    }

    const overallConfidence =
      predictedEffects.length > 0
        ? round2(predictedEffects.reduce((s, e) => s + e.confidence, 0) / predictedEffects.length)
        : 0.3

    this.confidenceHistory.push(overallConfidence)

    return {
      intervention,
      targetNode: targetNode.label,
      predictedEffects,
      sideEffects,
      confidence: overallConfidence,
    }
  }

  /** Find all causal chains from one concept to another. */
  findCausalChains(from: string, to: string, graph?: CausalGraph): CausalChain[] {
    const g = graph ?? this.currentGraph
    const fromLower = from.toLowerCase()
    const toLower = to.toLowerCase()

    const fromNodes = g.nodes.filter(n => tokenSimilarity(n.label, fromLower) >= 0.3)
    const toNodes = g.nodes.filter(n => tokenSimilarity(n.label, toLower) >= 0.3)

    const chains: CausalChain[] = []
    for (const fn of fromNodes) {
      for (const tn of toNodes) {
        const paths = this.findAllPaths(fn.id, tn.id, g)
        chains.push(...paths)
      }
    }

    chains.sort((a, b) => b.totalStrength - a.totalStrength)
    return chains
  }

  /** Get the Markov blanket of a node: parents, children, and co-parents. */
  getMarkovBlanket(nodeId: string, graph?: CausalGraph): CausalNode[] {
    const g = graph ?? this.currentGraph
    const blanketIds = new Set<string>()

    // Parents: nodes with edges going into nodeId
    const parentEdges = g.edges.filter(e => e.toId === nodeId)
    for (const e of parentEdges) blanketIds.add(e.fromId)

    // Children: nodes that nodeId has edges going to
    const childEdges = g.edges.filter(e => e.fromId === nodeId)
    for (const e of childEdges) blanketIds.add(e.toId)

    // Co-parents: other parents of this node's children
    for (const childEdge of childEdges) {
      const coParentEdges = g.edges.filter(e => e.toId === childEdge.toId && e.fromId !== nodeId)
      for (const e of coParentEdges) blanketIds.add(e.fromId)
    }

    blanketIds.delete(nodeId)
    return g.nodes.filter(n => blanketIds.has(n.id))
  }

  /** Check d-separation between two nodes given a conditioning set. */
  isDSeparated(
    nodeA: string,
    nodeB: string,
    conditionedOn: string[],
    graph?: CausalGraph,
  ): boolean {
    const g = graph ?? this.currentGraph
    // Bayes-ball algorithm simplified: A and B are d-separated given C
    // if there is no active path between them.
    const activePaths = this.findActiveTrails(nodeA, nodeB, new Set(conditionedOn), g)
    return activePaths.length === 0
  }

  /** Learn from feedback on a previous causal inference. */
  learnFromFeedback(inference: CausalInference, correct: boolean): void {
    if (!this.config.enableLearning) return
    this.feedbackTotal++
    if (correct) this.feedbackCorrect++

    // Adjust edge strengths in current graph based on feedback
    for (const edge of this.currentGraph.edges) {
      const fromNode = this.currentGraph.nodes.find(n => n.id === edge.fromId)
      const toNode = this.currentGraph.nodes.find(n => n.id === edge.toId)
      if (!fromNode || !toNode) continue

      const causeMatch = tokenSimilarity(fromNode.label, inference.cause.toLowerCase()) >= 0.4
      const effectMatch = tokenSimilarity(toNode.label, inference.effect.toLowerCase()) >= 0.4

      if (causeMatch && effectMatch) {
        if (correct) {
          edge.confidence = round2(clamp(edge.confidence + 0.05, 0, 1))
          edge.strength = round2(clamp(edge.strength + 0.03, 0, 1))
        } else {
          edge.confidence = round2(clamp(edge.confidence - 0.1, 0, 1))
          edge.strength = round2(clamp(edge.strength - 0.05, 0, 1))
        }
      }
    }
  }

  /** Return aggregate statistics. */
  getStats(): Readonly<CausalReasonerStats> {
    const avg =
      this.confidenceHistory.length > 0
        ? this.confidenceHistory.reduce((s, v) => s + v, 0) / this.confidenceHistory.length
        : 0

    return {
      totalGraphsBuilt: this.totalGraphsBuilt,
      totalInferences: this.totalInferences,
      totalInterventions: this.totalInterventions,
      totalCounterfactuals: this.totalCounterfactuals,
      avgConfidence: round2(avg),
      feedbackReceived: this.feedbackTotal,
      feedbackAccuracy:
        this.feedbackTotal > 0 ? round2(this.feedbackCorrect / this.feedbackTotal) : 0,
    }
  }

  /** Serialize the reasoner state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      currentGraph: this.currentGraph,
      totalGraphsBuilt: this.totalGraphsBuilt,
      totalInferences: this.totalInferences,
      totalInterventions: this.totalInterventions,
      totalCounterfactuals: this.totalCounterfactuals,
      confidenceHistory: this.confidenceHistory,
      feedbackCorrect: this.feedbackCorrect,
      feedbackTotal: this.feedbackTotal,
    })
  }

  /** Restore a CausalReasoner from serialized JSON. */
  static deserialize(json: string): CausalReasoner {
    const data = JSON.parse(json) as {
      config: CausalReasonerConfig
      currentGraph: CausalGraph
      totalGraphsBuilt: number
      totalInferences: number
      totalInterventions: number
      totalCounterfactuals: number
      confidenceHistory: number[]
      feedbackCorrect: number
      feedbackTotal: number
    }

    const instance = new CausalReasoner(data.config)
    instance.currentGraph = data.currentGraph
    instance.totalGraphsBuilt = data.totalGraphsBuilt
    instance.totalInferences = data.totalInferences
    instance.totalInterventions = data.totalInterventions
    instance.totalCounterfactuals = data.totalCounterfactuals
    instance.confidenceHistory = data.confidenceHistory
    instance.feedbackCorrect = data.feedbackCorrect
    instance.feedbackTotal = data.feedbackTotal
    return instance
  }

  // ── Graph Traversal Internals ──────────────────────────────────────────

  /** Trace back to root causes (nodes with no incoming edges on the path). */
  private traceRoots(
    effectId: string,
    g: CausalGraph,
  ): Array<{ nodeId: string; chain: CausalChain }> {
    const results: Array<{ nodeId: string; chain: CausalChain }> = []
    const visited = new Set<string>()

    const dfs = (currentId: string, pathNodes: CausalNode[], pathEdges: CausalEdge[]): void => {
      if (visited.has(currentId)) return
      visited.add(currentId)

      const incomingEdges = g.edges.filter(e => e.toId === currentId)

      if (incomingEdges.length === 0 && pathNodes.length > 0) {
        // This is a root node
        const totalStrength = this.computeChainStrength(pathEdges)
        const confidence = this.computeChainConfidence(pathEdges)
        results.push({
          nodeId: currentId,
          chain: {
            nodes: [...pathNodes],
            edges: [...pathEdges],
            totalStrength: round2(totalStrength),
            confidence: round2(confidence),
          },
        })
        return
      }

      for (const edge of incomingEdges) {
        if (pathEdges.length >= this.config.maxChainLength) continue
        const sourceNode = g.nodes.find(n => n.id === edge.fromId)
        if (!sourceNode || visited.has(sourceNode.id)) continue
        dfs(edge.fromId, [sourceNode, ...pathNodes], [edge, ...pathEdges])
      }

      visited.delete(currentId)
    }

    const effectNode = g.nodes.find(n => n.id === effectId)
    if (effectNode) dfs(effectId, [effectNode], [])

    return results
  }

  /** Find all directed paths between two nodes. */
  private findAllPaths(fromId: string, toId: string, g: CausalGraph): CausalChain[] {
    const results: CausalChain[] = []
    const visited = new Set<string>()

    const dfs = (currentId: string, pathNodes: CausalNode[], pathEdges: CausalEdge[]): void => {
      if (currentId === toId && pathEdges.length > 0) {
        const totalStrength = this.computeChainStrength(pathEdges)
        const confidence = this.computeChainConfidence(pathEdges)
        results.push({
          nodes: [...pathNodes],
          edges: [...pathEdges],
          totalStrength: round2(totalStrength),
          confidence: round2(confidence),
        })
        return
      }

      if (pathEdges.length >= this.config.maxChainLength) return

      const outgoing = g.edges.filter(e => e.fromId === currentId)
      for (const edge of outgoing) {
        if (visited.has(edge.toId)) continue
        const nextNode = g.nodes.find(n => n.id === edge.toId)
        if (!nextNode) continue

        visited.add(edge.toId)
        dfs(edge.toId, [...pathNodes, nextNode], [...pathEdges, edge])
        visited.delete(edge.toId)
      }
    }

    const startNode = g.nodes.find(n => n.id === fromId)
    if (startNode) {
      visited.add(fromId)
      dfs(fromId, [startNode], [])
    }

    return results
  }

  /** Find all downstream effects from a node via BFS with strength propagation. */
  private findDownstream(
    nodeId: string,
    g: CausalGraph,
  ): Array<{ nodeId: string; strength: number; confidence: number }> {
    const results: Array<{ nodeId: string; strength: number; confidence: number }> = []
    const visited = new Set<string>([nodeId])
    const queue: Array<{ id: string; strength: number; confidence: number; depth: number }> = []

    const outgoing = g.edges.filter(e => e.fromId === nodeId)
    for (const edge of outgoing) {
      queue.push({ id: edge.toId, strength: edge.strength, confidence: edge.confidence, depth: 1 })
    }

    while (queue.length > 0) {
      const { id, strength, confidence, depth } = queue.shift()!
      if (visited.has(id) || depth > this.config.maxChainLength) continue
      visited.add(id)

      results.push({ nodeId: id, strength: round2(strength), confidence: round2(confidence) })

      const next = g.edges.filter(e => e.fromId === id)
      for (const edge of next) {
        const decayedStrength = strength * edge.strength * (1 - this.config.strengthDecayRate)
        const decayedConfidence = confidence * edge.confidence
        if (decayedStrength >= this.config.minConfidence) {
          queue.push({
            id: edge.toId,
            strength: decayedStrength,
            confidence: decayedConfidence,
            depth: depth + 1,
          })
        }
      }
    }

    return results
  }

  /** Detect confounders between two nodes. */
  private detectConfounders(causeId: string, effectId: string, g: CausalGraph): string[] {
    const confounders: string[] = []

    for (const node of g.nodes) {
      if (node.id === causeId || node.id === effectId) continue
      if (node.type === 'confounder') {
        confounders.push(node.label)
        continue
      }

      // A confounder has edges to both cause and effect
      const toCause = g.edges.some(e => e.fromId === node.id && e.toId === causeId)
      const toEffect = g.edges.some(e => e.fromId === node.id && e.toId === effectId)
      if (toCause && toEffect) {
        confounders.push(node.label)
      }
    }

    return confounders
  }

  /** Detect mediators: nodes that lie on a path between a cause and effect. */
  private detectMediators(graph: CausalGraph): void {
    for (const node of graph.nodes) {
      if (node.type === 'confounder' || node.type === 'mediator') continue

      const incoming = graph.edges.filter(e => e.toId === node.id)
      const outgoing = graph.edges.filter(e => e.fromId === node.id)

      if (incoming.length > 0 && outgoing.length > 0) {
        node.type = 'mediator'
      }
    }
  }

  /** Find alternative causal paths that bypass a given node. */
  private findAlternativePaths(
    removedNodeId: string,
    downstream: Array<{ nodeId: string; strength: number; confidence: number }>,
    g: CausalGraph,
  ): string[] {
    const alternatives: string[] = []
    const effectIds = new Set(downstream.map(d => d.nodeId))

    for (const effectId of effectIds) {
      // Check if any other node reaches this effect without going through removedNodeId
      for (const node of g.nodes) {
        if (node.id === removedNodeId || node.id === effectId) continue
        const paths = this.findAllPaths(node.id, effectId, g)
        const hasAlternative = paths.some(chain => !chain.nodes.some(n => n.id === removedNodeId))
        if (hasAlternative) {
          alternatives.push(node.label)
          break
        }
      }
    }

    return [...new Set(alternatives)]
  }

  /** Find active trails between two nodes given conditioned nodes (simplified Bayes-ball). */
  private findActiveTrails(
    nodeA: string,
    nodeB: string,
    conditioned: Set<string>,
    g: CausalGraph,
  ): string[][] {
    const trails: string[][] = []
    const visited = new Set<string>()

    const dfs = (current: string, path: string[], prevDirection: 'up' | 'down'): void => {
      if (current === nodeB && path.length > 1) {
        trails.push([...path])
        return
      }
      if (visited.has(`${current}:${prevDirection}`)) return
      if (path.length > this.config.maxChainLength) return
      visited.add(`${current}:${prevDirection}`)

      const isConditioned = conditioned.has(current)

      // Chain (A→B→C) or Fork (A←B→C): active if B is not conditioned
      // Collider (A→B←C): active if B IS conditioned (or descendant is)

      if (prevDirection === 'down') {
        // We came along an edge into current
        if (!isConditioned) {
          // Non-collider: can continue forward (chain) or turn around (fork)
          const outgoing = g.edges.filter(e => e.fromId === current)
          for (const e of outgoing) {
            dfs(e.toId, [...path, e.toId], 'down')
          }
          const incoming = g.edges.filter(e => e.toId === current)
          for (const e of incoming) {
            dfs(e.fromId, [...path, e.fromId], 'up')
          }
        }
      } else {
        // We came up toward current (following an edge backward)
        if (!isConditioned) {
          // Fork: can continue upward
          const incoming = g.edges.filter(e => e.toId === current)
          for (const e of incoming) {
            dfs(e.fromId, [...path, e.fromId], 'up')
          }
        }
        // Collider check: if conditioned, open the path through
        if (isConditioned || this.hasConditionedDescendant(current, conditioned, g)) {
          const outgoing = g.edges.filter(e => e.fromId === current)
          for (const e of outgoing) {
            dfs(e.toId, [...path, e.toId], 'down')
          }
        }
      }

      visited.delete(`${current}:${prevDirection}`)
    }

    // Start from nodeA going in both directions
    const outgoing = g.edges.filter(e => e.fromId === nodeA)
    for (const e of outgoing) {
      dfs(e.toId, [nodeA, e.toId], 'down')
    }
    const incoming = g.edges.filter(e => e.toId === nodeA)
    for (const e of incoming) {
      dfs(e.fromId, [nodeA, e.fromId], 'up')
    }

    return trails
  }

  /** Check if any descendant of a node is in the conditioned set. */
  private hasConditionedDescendant(
    nodeId: string,
    conditioned: Set<string>,
    g: CausalGraph,
  ): boolean {
    const visited = new Set<string>()
    const stack = [nodeId]

    while (stack.length > 0) {
      const current = stack.pop()!
      if (visited.has(current)) continue
      visited.add(current)

      const outgoing = g.edges.filter(e => e.fromId === current)
      for (const e of outgoing) {
        if (conditioned.has(e.toId)) return true
        stack.push(e.toId)
      }
    }

    return false
  }

  // ── Strength & Confidence Computation ──────────────────────────────────

  /** Compute total chain strength with decay over length. */
  private computeChainStrength(edges: CausalEdge[]): number {
    if (edges.length === 0) return 0
    let strength = 1
    for (let i = 0; i < edges.length; i++) {
      strength *= edges[i].strength * (1 - (this.config.strengthDecayRate * i) / edges.length)
    }
    return clamp(strength, 0, 1)
  }

  /** Compute chain confidence as product of edge confidences (Bayesian-style). */
  private computeChainConfidence(edges: CausalEdge[]): number {
    if (edges.length === 0) return 0
    let confidence = 1
    for (const edge of edges) {
      confidence *= edge.confidence
    }
    return clamp(confidence, 0, 1)
  }

  // ── Pattern Database Lookups ───────────────────────────────────────────

  /** Find a matching pattern for a cause-effect pair. */
  private findMatchingPattern(cause: string, effect: string): CausalPatternEntry | null {
    const causeLower = cause.toLowerCase()
    const effectLower = effect.toLowerCase()
    let best: CausalPatternEntry | null = null
    let bestScore = 0

    for (const entry of this.patternDB) {
      const causeScore = tokenSimilarity(causeLower, entry.cause)
      const effectScore = tokenSimilarity(effectLower, entry.effect)
      const combined = causeScore * 0.5 + effectScore * 0.5
      if (combined > bestScore && combined >= 0.3) {
        bestScore = combined
        best = entry
      }
    }

    return best
  }

  /** Build root cause result from pattern database when no graph is available. */
  private rootCauseFromPatternDB(effect: string): RootCauseResult {
    const effectLower = effect.toLowerCase()
    const matches: RootCauseResult['causes'] = []

    for (const entry of this.patternDB) {
      const sim = tokenSimilarity(effectLower, entry.effect)
      if (sim < 0.3) continue

      const node: CausalNode = {
        id: generateNodeId(),
        label: entry.cause,
        type: 'cause',
        properties: { domain: entry.domain },
      }

      const chainNode: CausalNode = {
        id: generateNodeId(),
        label: entry.effect,
        type: 'effect',
        properties: { domain: entry.domain },
      }

      const edge: CausalEdge = {
        fromId: node.id,
        toId: chainNode.id,
        strength: entry.strength,
        mechanism: entry.mechanism,
        confidence: round2(sim * 0.8),
      }

      matches.push({
        node,
        likelihood: round2(entry.strength * sim),
        mechanism: entry.mechanism,
        chain: {
          nodes: [node, chainNode],
          edges: [edge],
          totalStrength: round2(entry.strength * sim),
          confidence: round2(sim * 0.8),
        },
      })
    }

    matches.sort((a, b) => b.likelihood - a.likelihood)
    return { effect, causes: matches.slice(0, 10) }
  }

  /** Counterfactual analysis using pattern database as fallback. */
  private counterfactualFromPatternDB(condition: string): CounterfactualResult {
    const condLower = condition.toLowerCase()
    const reasoning: string[] = []
    const affectedEffects: string[] = []

    reasoning.push(`No matching node in current graph for "${condition}"; using pattern database.`)

    for (const entry of this.patternDB) {
      const sim = tokenSimilarity(condLower, entry.cause)
      if (sim >= 0.3) {
        affectedEffects.push(entry.effect)
        reasoning.push(
          `Pattern: "${entry.cause}" → "${entry.effect}" (strength=${entry.strength}). ` +
            `Without it: "${entry.effect}" would be less likely.`,
        )
      }
    }

    const confidence = affectedEffects.length > 0 ? round2(0.5) : 0.2
    this.confidenceHistory.push(confidence)

    return {
      scenario: `What if "${condition}" did not happen?`,
      predictedOutcome:
        affectedEffects.length > 0
          ? `Without "${condition}", these effects would be reduced: ${affectedEffects.join(', ')}.`
          : `No known causal effects of "${condition}" found in the pattern database.`,
      confidence,
      reasoning,
    }
  }

  /** Intervention prediction using pattern database as fallback. */
  private interventionFromPatternDB(intervention: string): InterventionResult {
    const direction = detectInterventionDirection(intervention)
    const interventionLower = intervention.toLowerCase()
    const predictedEffects: InterventionResult['predictedEffects'] = []
    const sideEffects: string[] = []

    for (const entry of this.patternDB) {
      const causeSim = tokenSimilarity(interventionLower, entry.cause)
      if (causeSim >= 0.3) {
        const node: CausalNode = {
          id: generateNodeId(),
          label: entry.effect,
          type: 'effect',
          properties: { domain: entry.domain },
        }

        predictedEffects.push({
          node,
          direction: direction === 'unknown' ? 'unchanged' : direction,
          magnitude: round2(entry.strength * causeSim),
          confidence: round2(causeSim * 0.6),
        })
      }
    }

    predictedEffects.sort((a, b) => b.magnitude - a.magnitude)

    const confidence =
      predictedEffects.length > 0
        ? round2(predictedEffects.reduce((s, e) => s + e.confidence, 0) / predictedEffects.length)
        : 0.2

    this.confidenceHistory.push(confidence)

    return {
      intervention,
      targetNode: interventionLower,
      predictedEffects: predictedEffects.slice(0, 10),
      sideEffects,
      confidence,
    }
  }
}
