/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  CollaborationEngine — Multi-module orchestration & synthesis              ║
 * ║                                                                            ║
 * ║  Coordinates multiple AI modules to work together on complex tasks.        ║
 * ║  Delegates sub-tasks, synthesizes results, resolves disagreements,         ║
 * ║  and builds consensus across diverse intelligence sources.                 ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Agent registry with capability declarations                          ║
 * ║    • Task delegation based on agent capabilities                          ║
 * ║    • Result synthesis from multiple agents                                ║
 * ║    • Consensus building with voting/scoring                               ║
 * ║    • Conflict resolution between contradicting outputs                    ║
 * ║    • Ensemble decision-making                                             ║
 * ║    • Communication protocol for inter-module messaging                    ║
 * ║    • Collaboration history and performance tracking                        ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AgentRole =
  | 'analyzer'
  | 'generator'
  | 'critic'
  | 'verifier'
  | 'synthesizer'
  | 'specialist'

export interface AgentDescriptor {
  readonly id: string
  readonly name: string
  readonly role: AgentRole
  readonly capabilities: string[]
  readonly reliability: number
  readonly responseTimeMs: number
  readonly priority: number
}

export interface CollaborationTask {
  readonly id: string
  readonly description: string
  readonly requiredCapabilities: string[]
  readonly maxAgents: number
  readonly consensusRequired: boolean
  readonly deadline: number | null
  readonly createdAt: number
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
}

export interface AgentResponse {
  readonly agentId: string
  readonly taskId: string
  readonly content: string
  readonly confidence: number
  readonly reasoning: string
  readonly timestamp: number
  readonly metadata: Record<string, string>
}

export interface SynthesizedResult {
  readonly taskId: string
  readonly content: string
  readonly confidence: number
  readonly contributingAgents: string[]
  readonly consensusLevel: number // 0-1
  readonly conflicts: ConflictRecord[]
  readonly synthesisMethod: 'majority_vote' | 'weighted_average' | 'best_confidence' | 'merged'
}

export interface ConflictRecord {
  readonly agent1Id: string
  readonly agent2Id: string
  readonly topic: string
  readonly agent1Position: string
  readonly agent2Position: string
  readonly resolution: string
  readonly resolvedBy: 'voting' | 'confidence' | 'authority' | 'unresolved'
}

export interface DelegationPlan {
  readonly taskId: string
  readonly assignments: Array<{
    agentId: string
    subTask: string
    priority: number
  }>
  readonly expectedDuration: number
  readonly reasoning: string
}

export interface CollaborationMessage {
  readonly id: string
  readonly fromAgentId: string
  readonly toAgentId: string | 'broadcast'
  readonly type: 'request' | 'response' | 'inform' | 'query' | 'critique' | 'acknowledge'
  readonly content: string
  readonly timestamp: number
  readonly replyToId: string | null
}

export interface EnsembleDecision {
  readonly question: string
  readonly votes: Array<{ agentId: string; answer: string; confidence: number }>
  readonly winner: string
  readonly winnerConfidence: number
  readonly consensusLevel: number
  readonly method: 'majority' | 'weighted' | 'unanimous'
}

export interface CollaborationEngineConfig {
  readonly maxAgents: number
  readonly maxTaskHistory: number
  readonly maxMessages: number
  readonly consensusThreshold: number // 0-1 agreement required
  readonly minAgentsForConsensus: number
  readonly conflictResolutionStrategy: 'voting' | 'confidence' | 'authority'
}

export interface CollaborationEngineStats {
  readonly totalAgents: number
  readonly totalTasks: number
  readonly totalTasksCompleted: number
  readonly totalMessagesSent: number
  readonly totalConflictsDetected: number
  readonly totalConflictsResolved: number
  readonly avgConsensusLevel: number
  readonly avgAgentsPerTask: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_COLLABORATION_CONFIG: CollaborationEngineConfig = {
  maxAgents: 50,
  maxTaskHistory: 200,
  maxMessages: 1000,
  consensusThreshold: 0.6,
  minAgentsForConsensus: 2,
  conflictResolutionStrategy: 'confidence',
}

const ROLE_PRIORITY: Record<AgentRole, number> = {
  verifier: 1.0,
  specialist: 0.9,
  analyzer: 0.8,
  generator: 0.7,
  critic: 0.6,
  synthesizer: 0.5,
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 2),
  )
}

function computeCapabilityMatch(required: string[], available: string[]): number {
  if (required.length === 0) return 0.5
  const availLower = new Set(available.map(a => a.toLowerCase()))
  const matched = required.filter(r => {
    const rl = r.toLowerCase()
    for (const a of availLower) {
      if (a.includes(rl) || rl.includes(a)) return true
    }
    return false
  })
  return matched.length / required.length
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class CollaborationEngine {
  private readonly config: CollaborationEngineConfig
  private readonly agents: Map<string, AgentDescriptor> = new Map()
  private readonly tasks: Map<string, CollaborationTask> = new Map()
  private readonly responses: Map<string, AgentResponse[]> = new Map() // taskId → responses
  private readonly messages: CollaborationMessage[] = []
  private readonly results: Map<string, SynthesizedResult> = new Map()
  private stats = {
    totalTasks: 0,
    totalCompleted: 0,
    totalMessages: 0,
    totalConflicts: 0,
    totalResolved: 0,
    totalConsensus: 0,
    consensusCount: 0,
    totalAgentsUsed: 0,
    taskCount: 0,
  }

  constructor(config: Partial<CollaborationEngineConfig> = {}) {
    this.config = { ...DEFAULT_COLLABORATION_CONFIG, ...config }
  }

  // ── Agent registry ─────────────────────────────────────────────────────

  /** Register an agent with the collaboration engine. */
  registerAgent(agent: AgentDescriptor): void {
    this.agents.set(agent.id, agent)
    // Enforce max
    if (this.agents.size > this.config.maxAgents) {
      const lowest = [...this.agents.entries()].sort(([, a], [, b]) => a.priority - b.priority)[0]
      if (lowest) this.agents.delete(lowest[0])
    }
  }

  /** Unregister an agent. */
  unregisterAgent(agentId: string): boolean {
    return this.agents.delete(agentId)
  }

  /** Get all registered agents. */
  getAgents(): readonly AgentDescriptor[] {
    return [...this.agents.values()]
  }

  /** Find agents by capability. */
  findAgentsByCapability(capability: string): AgentDescriptor[] {
    const lower = capability.toLowerCase()
    return [...this.agents.values()].filter(a =>
      a.capabilities.some(c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase())),
    )
  }

  // ── Task management ────────────────────────────────────────────────────

  /** Create a collaboration task. */
  createTask(
    description: string,
    requiredCapabilities: string[],
    options: {
      maxAgents?: number
      consensusRequired?: boolean
      deadline?: number | null
    } = {},
  ): CollaborationTask {
    const task: CollaborationTask = {
      id: generateId('task'),
      description,
      requiredCapabilities,
      maxAgents: options.maxAgents ?? 5,
      consensusRequired: options.consensusRequired ?? true,
      deadline: options.deadline ?? null,
      createdAt: Date.now(),
      status: 'pending',
    }

    this.tasks.set(task.id, task)
    this.responses.set(task.id, [])
    this.stats.totalTasks++

    // Enforce max history
    if (this.tasks.size > this.config.maxTaskHistory) {
      const oldest = [...this.tasks.entries()]
        .filter(([, t]) => t.status === 'completed' || t.status === 'failed')
        .sort(([, a], [, b]) => a.createdAt - b.createdAt)[0]
      if (oldest) {
        this.tasks.delete(oldest[0])
        this.responses.delete(oldest[0])
      }
    }

    return task
  }

  /** Get a task by ID. */
  getTask(taskId: string): CollaborationTask | null {
    return this.tasks.get(taskId) ?? null
  }

  // ── Delegation ─────────────────────────────────────────────────────────

  /** Create a delegation plan for a task. */
  delegate(taskId: string): DelegationPlan | null {
    const task = this.tasks.get(taskId)
    if (!task) return null

    // Find matching agents
    const candidates: Array<{ agent: AgentDescriptor; score: number }> = []
    for (const agent of this.agents.values()) {
      const capMatch = computeCapabilityMatch(task.requiredCapabilities, agent.capabilities)
      const roleBonus = ROLE_PRIORITY[agent.role] ?? 0.5
      const score = capMatch * 0.5 + agent.reliability * 0.3 + roleBonus * 0.2
      if (capMatch > 0.1) {
        candidates.push({ agent, score })
      }
    }

    candidates.sort((a, b) => b.score - a.score)
    const selected = candidates.slice(0, task.maxAgents)

    const assignments = selected.map((c, i) => ({
      agentId: c.agent.id,
      subTask: task.description,
      priority: 1 - i / Math.max(selected.length, 1),
    }))

    const expectedDuration =
      selected.length > 0 ? Math.max(...selected.map(c => c.agent.responseTimeMs)) : 0

    task.status = 'in_progress'
    this.stats.totalAgentsUsed += selected.length
    this.stats.taskCount++

    return {
      taskId,
      assignments,
      expectedDuration,
      reasoning: `Selected ${selected.length} agents from ${candidates.length} candidates based on capability match`,
    }
  }

  // ── Response collection ────────────────────────────────────────────────

  /** Submit a response from an agent for a task. */
  submitResponse(response: AgentResponse): void {
    const responses = this.responses.get(response.taskId)
    if (!responses) return
    responses.push(response)
  }

  /** Get all responses for a task. */
  getResponses(taskId: string): readonly AgentResponse[] {
    return [...(this.responses.get(taskId) ?? [])]
  }

  // ── Synthesis ──────────────────────────────────────────────────────────

  /** Synthesize results from multiple agent responses. */
  synthesize(taskId: string): SynthesizedResult | null {
    const task = this.tasks.get(taskId)
    if (!task) return null

    const responses = this.responses.get(taskId) ?? []
    if (responses.length === 0) return null

    // Detect conflicts
    const conflicts = this.detectConflicts(responses)
    this.stats.totalConflicts += conflicts.length

    // Resolve conflicts
    const resolved = conflicts.map(c => this.resolveConflict(c))
    this.stats.totalResolved += resolved.filter(c => c.resolvedBy !== 'unresolved').length

    // Choose synthesis method
    let method: SynthesizedResult['synthesisMethod'] = 'best_confidence'
    let content: string
    let confidence: number

    if (responses.length >= this.config.minAgentsForConsensus && task.consensusRequired) {
      // Check for consensus
      const { consensusContent, consensusLevel } = this.buildConsensus(responses)
      if (consensusLevel >= this.config.consensusThreshold) {
        method = 'majority_vote'
        content = consensusContent
        confidence = consensusLevel
      } else {
        // Fall back to best confidence
        const best = responses.sort((a, b) => b.confidence - a.confidence)[0]
        content = best.content
        confidence = best.confidence
      }
    } else {
      // Single or few responses — use best confidence
      const best = responses.sort((a, b) => b.confidence - a.confidence)[0]
      content = best.content
      confidence = best.confidence
    }

    // Compute consensus level
    const consensusLevel = this.computeConsensusLevel(responses)
    this.stats.totalConsensus += consensusLevel
    this.stats.consensusCount++

    const result: SynthesizedResult = {
      taskId,
      content,
      confidence,
      contributingAgents: responses.map(r => r.agentId),
      consensusLevel,
      conflicts: resolved,
      synthesisMethod: method,
    }

    this.results.set(taskId, result)
    task.status = 'completed'
    this.stats.totalCompleted++

    return result
  }

  private buildConsensus(responses: AgentResponse[]): {
    consensusContent: string
    consensusLevel: number
  } {
    // Group similar responses
    const groups: Array<{ content: string; count: number; totalConfidence: number }> = []

    for (const response of responses) {
      const tokens = tokenize(response.content)
      let matched = false
      for (const group of groups) {
        const groupTokens = tokenize(group.content)
        let overlap = 0
        for (const t of tokens) if (groupTokens.has(t)) overlap++
        const sim = tokens.size > 0 ? overlap / tokens.size : 0
        if (sim > 0.4) {
          group.count++
          group.totalConfidence += response.confidence
          matched = true
          break
        }
      }
      if (!matched) {
        groups.push({ content: response.content, count: 1, totalConfidence: response.confidence })
      }
    }

    groups.sort((a, b) => b.count - a.count || b.totalConfidence - a.totalConfidence)
    const winner = groups[0]

    return {
      consensusContent: winner?.content ?? '',
      consensusLevel: winner ? winner.count / responses.length : 0,
    }
  }

  private computeConsensusLevel(responses: AgentResponse[]): number {
    if (responses.length < 2) return 1

    const tokens = responses.map(r => tokenize(r.content))
    let totalSim = 0
    let pairs = 0

    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        let overlap = 0
        for (const t of tokens[i]) if (tokens[j].has(t)) overlap++
        totalSim += tokens[i].size > 0 ? overlap / tokens[i].size : 0
        pairs++
      }
    }

    return pairs > 0 ? totalSim / pairs : 0
  }

  // ── Conflict detection & resolution ────────────────────────────────────

  private detectConflicts(responses: AgentResponse[]): ConflictRecord[] {
    const conflicts: ConflictRecord[] = []

    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const r1 = responses[i]
        const r2 = responses[j]

        // Check for contradicting content
        const neg1 = /\b(not|no|never|none|false|incorrect|wrong)\b/i.test(r1.content)
        const neg2 = /\b(not|no|never|none|false|incorrect|wrong)\b/i.test(r2.content)

        const tokens1 = tokenize(r1.content)
        const tokens2 = tokenize(r2.content)
        let overlap = 0
        for (const t of tokens1) if (tokens2.has(t)) overlap++
        const sim = tokens1.size > 0 ? overlap / tokens1.size : 0

        if (sim > 0.3 && neg1 !== neg2) {
          conflicts.push({
            agent1Id: r1.agentId,
            agent2Id: r2.agentId,
            topic: r1.content.slice(0, 50),
            agent1Position: r1.content.slice(0, 100),
            agent2Position: r2.content.slice(0, 100),
            resolution: '',
            resolvedBy: 'unresolved',
          })
        }
      }
    }

    return conflicts
  }

  private resolveConflict(conflict: ConflictRecord): ConflictRecord {
    const strategy = this.config.conflictResolutionStrategy

    switch (strategy) {
      case 'confidence': {
        // Higher confidence agent wins
        const agent1 = this.agents.get(conflict.agent1Id)
        const agent2 = this.agents.get(conflict.agent2Id)
        const winner =
          (agent1?.reliability ?? 0) >= (agent2?.reliability ?? 0)
            ? conflict.agent1Id
            : conflict.agent2Id
        return {
          ...conflict,
          resolution: `Resolved by confidence: agent ${winner} preferred`,
          resolvedBy: 'confidence',
        }
      }
      case 'authority': {
        // Higher priority role wins
        const agent1 = this.agents.get(conflict.agent1Id)
        const agent2 = this.agents.get(conflict.agent2Id)
        const role1Priority = agent1 ? (ROLE_PRIORITY[agent1.role] ?? 0) : 0
        const role2Priority = agent2 ? (ROLE_PRIORITY[agent2.role] ?? 0) : 0
        const winner = role1Priority >= role2Priority ? conflict.agent1Id : conflict.agent2Id
        return {
          ...conflict,
          resolution: `Resolved by authority: agent ${winner} has higher role`,
          resolvedBy: 'authority',
        }
      }
      case 'voting':
      default:
        return { ...conflict, resolution: 'Resolved by majority vote', resolvedBy: 'voting' }
    }
  }

  // ── Ensemble decision ──────────────────────────────────────────────────

  /** Make an ensemble decision from multiple agent votes. */
  ensembleDecide(
    question: string,
    votes: Array<{ agentId: string; answer: string; confidence: number }>,
  ): EnsembleDecision {
    // Group votes by answer
    const answerGroups: Record<string, { count: number; totalConfidence: number }> = {}

    for (const vote of votes) {
      const key = vote.answer.toLowerCase().trim()
      if (!answerGroups[key]) answerGroups[key] = { count: 0, totalConfidence: 0 }
      answerGroups[key].count++
      answerGroups[key].totalConfidence += vote.confidence
    }

    // Find winner
    const sorted = Object.entries(answerGroups).sort(
      ([, a], [, b]) => b.totalConfidence - a.totalConfidence,
    )

    const [winnerAnswer, winnerData] = sorted[0] ?? ['', { count: 0, totalConfidence: 0 }]
    const winnerConfidence = votes.length > 0 ? winnerData.totalConfidence / votes.length : 0
    const consensusLevel = votes.length > 0 ? winnerData.count / votes.length : 0

    const method =
      consensusLevel === 1
        ? ('unanimous' as const)
        : consensusLevel >= 0.5
          ? ('majority' as const)
          : ('weighted' as const)

    return {
      question,
      votes,
      winner: winnerAnswer,
      winnerConfidence,
      consensusLevel,
      method,
    }
  }

  // ── Messaging ──────────────────────────────────────────────────────────

  /** Send a message between agents. */
  sendMessage(
    fromAgentId: string,
    toAgentId: string | 'broadcast',
    type: CollaborationMessage['type'],
    content: string,
    replyToId?: string,
  ): CollaborationMessage {
    const msg: CollaborationMessage = {
      id: generateId('msg'),
      fromAgentId,
      toAgentId,
      type,
      content,
      timestamp: Date.now(),
      replyToId: replyToId ?? null,
    }

    this.messages.push(msg)
    this.stats.totalMessages++

    // Enforce max messages
    while (this.messages.length > this.config.maxMessages) {
      this.messages.shift()
    }

    return msg
  }

  /** Get messages for an agent. */
  getMessagesForAgent(agentId: string): CollaborationMessage[] {
    return this.messages.filter(m => m.toAgentId === agentId || m.toAgentId === 'broadcast')
  }

  /** Get all messages. */
  getAllMessages(): readonly CollaborationMessage[] {
    return [...this.messages]
  }

  // ── Stats ──────────────────────────────────────────────────────────────

  getStats(): Readonly<CollaborationEngineStats> {
    return {
      totalAgents: this.agents.size,
      totalTasks: this.stats.totalTasks,
      totalTasksCompleted: this.stats.totalCompleted,
      totalMessagesSent: this.stats.totalMessages,
      totalConflictsDetected: this.stats.totalConflicts,
      totalConflictsResolved: this.stats.totalResolved,
      avgConsensusLevel:
        this.stats.consensusCount > 0 ? this.stats.totalConsensus / this.stats.consensusCount : 0,
      avgAgentsPerTask:
        this.stats.taskCount > 0 ? this.stats.totalAgentsUsed / this.stats.taskCount : 0,
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      agents: [...this.agents.values()],
      tasks: [...this.tasks.values()],
      responses: [...this.responses.entries()],
      messages: this.messages.slice(-200),
      results: [...this.results.entries()],
      stats: this.stats,
    })
  }

  static deserialize(
    json: string,
    config?: Partial<CollaborationEngineConfig>,
  ): CollaborationEngine {
    const engine = new CollaborationEngine(config)
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.agents)) {
        for (const a of data.agents) engine.agents.set(a.id, a)
      }
      if (Array.isArray(data.tasks)) {
        for (const t of data.tasks) engine.tasks.set(t.id, t)
      }
      if (Array.isArray(data.responses)) {
        for (const [key, val] of data.responses) engine.responses.set(key, val)
      }
      if (Array.isArray(data.messages)) {
        engine.messages.push(...data.messages)
      }
      if (Array.isArray(data.results)) {
        for (const [key, val] of data.results) engine.results.set(key, val)
      }
      if (data.stats) Object.assign(engine.stats, data.stats)
    } catch {
      /* fresh engine on failure */
    }
    return engine
  }
}
