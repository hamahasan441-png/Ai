/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ToolReasoningEngine — Intelligent tool selection & orchestration           ║
 * ║                                                                            ║
 * ║  Reasons about WHICH tools to use, in what ORDER, and with what            ║
 * ║  parameters. Performs cost-benefit analysis, dependency resolution,         ║
 * ║  and fallback planning for multi-tool pipelines.                           ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Tool capability matching against task requirements                    ║
 * ║    • Cost-benefit analysis for tool selection                              ║
 * ║    • Multi-tool pipeline construction with dependency ordering             ║
 * ║    • Fallback chain planning for error resilience                          ║
 * ║    • Historical success tracking per tool per task type                    ║
 * ║    • Parameter inference from context                                      ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Descriptor for a tool's capabilities. */
export interface ToolDescriptor {
  readonly name: string
  readonly description: string
  readonly capabilities: string[]
  readonly inputTypes: string[]
  readonly outputTypes: string[]
  readonly cost: number // 0-1, relative cost (time, resources)
  readonly reliability: number // 0-1, how often it succeeds
  readonly sideEffects: boolean
  readonly requiresConfirmation: boolean
}

/** A task requirement that needs tool(s) to fulfill. */
export interface TaskRequirement {
  readonly description: string
  readonly requiredCapabilities: string[]
  readonly inputAvailable: string[]
  readonly expectedOutputType: string
  readonly priority: 'low' | 'medium' | 'high' | 'critical'
  readonly constraints?: TaskConstraint[]
}

/** Constraint on tool selection. */
export interface TaskConstraint {
  readonly type:
    | 'max_cost'
    | 'no_side_effects'
    | 'no_confirmation'
    | 'preferred_tool'
    | 'excluded_tool'
  readonly value: string | number
}

/** Result of matching a tool to a requirement. */
export interface ToolMatch {
  readonly tool: ToolDescriptor
  readonly relevanceScore: number
  readonly capabilityOverlap: number
  readonly costBenefit: number
  readonly reasoning: string
}

/** A planned step in a multi-tool pipeline. */
export interface PipelineStep {
  readonly stepId: string
  readonly tool: ToolDescriptor
  readonly purpose: string
  readonly inputSources: string[]
  readonly outputKey: string
  readonly fallbackTools: ToolDescriptor[]
  readonly estimatedCost: number
  readonly dependsOn: string[]
}

/** A complete tool pipeline for a task. */
export interface ToolPipeline {
  readonly id: string
  readonly task: string
  readonly steps: PipelineStep[]
  readonly totalEstimatedCost: number
  readonly expectedReliability: number
  readonly executionOrder: string[]
  readonly reasoning: string
}

/** Result of executing a pipeline step. */
export interface StepExecutionResult {
  readonly stepId: string
  readonly success: boolean
  readonly toolUsed: string
  readonly usedFallback: boolean
  readonly duration: number
  readonly output: string
}

/** Historical record of tool usage. */
export interface ToolUsageRecord {
  readonly toolName: string
  readonly taskType: string
  readonly success: boolean
  readonly duration: number
  readonly timestamp: number
}

/** Inferred parameter for a tool call. */
export interface InferredParameter {
  readonly name: string
  readonly value: string
  readonly confidence: number
  readonly source: string
}

/** Configuration for the tool reasoning engine. */
export interface ToolReasoningEngineConfig {
  /** Maximum tools in a single pipeline. Default: 10 */
  readonly maxPipelineSteps: number
  /** Maximum fallback tools per step. Default: 3 */
  readonly maxFallbacksPerStep: number
  /** Minimum relevance score to include a tool. Default: 0.3 */
  readonly minRelevanceScore: number
  /** Weight for historical success in scoring. Default: 0.3 */
  readonly historyWeight: number
  /** Maximum usage records to keep. Default: 1000 */
  readonly maxUsageHistory: number
}

/** Runtime statistics. */
export interface ToolReasoningEngineStats {
  readonly totalSelectionsPerformed: number
  readonly totalPipelinesCreated: number
  readonly avgToolsPerPipeline: number
  readonly toolSuccessRates: Record<string, number>
  readonly mostUsedTools: string[]
  readonly fallbackUsageRate: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_TOOL_REASONING_CONFIG: ToolReasoningEngineConfig = {
  maxPipelineSteps: 10,
  maxFallbacksPerStep: 3,
  minRelevanceScore: 0.3,
  historyWeight: 0.3,
  maxUsageHistory: 1000,
}

/** Task type keywords for classification. */
const TASK_TYPE_KEYWORDS: Record<string, string[]> = {
  file_read: ['read', 'view', 'show', 'display', 'content', 'open', 'cat'],
  file_write: ['write', 'create', 'save', 'modify', 'edit', 'update', 'change'],
  search: ['search', 'find', 'grep', 'locate', 'look for', 'where is'],
  execute: ['run', 'execute', 'build', 'compile', 'test', 'deploy', 'start'],
  analyze: ['analyze', 'review', 'check', 'inspect', 'examine', 'audit', 'scan'],
  generate: ['generate', 'create', 'scaffold', 'template', 'new', 'init'],
  debug: ['debug', 'fix', 'error', 'bug', 'issue', 'problem', 'trouble'],
  refactor: ['refactor', 'restructure', 'reorganize', 'optimize', 'clean up', 'improve'],
  navigate: ['navigate', 'go to', 'open', 'jump', 'find file', 'directory'],
  communicate: ['ask', 'tell', 'send', 'message', 'notify', 'respond', 'reply'],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `tr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function classifyTaskType(description: string): string {
  const lower = description.toLowerCase()
  let bestType = 'general'
  let bestScore = 0
  for (const [type, keywords] of Object.entries(TASK_TYPE_KEYWORDS)) {
    const score = keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      bestType = type
    }
  }
  return bestType
}

function computeCapabilityOverlap(required: string[], available: string[]): number {
  if (required.length === 0) return 0.5
  const availLower = available.map(a => a.toLowerCase())
  const matched = required.filter(r => {
    const rl = r.toLowerCase()
    return availLower.some(a => a.includes(rl) || rl.includes(a))
  })
  return matched.length / required.length
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class ToolReasoningEngine {
  private readonly config: ToolReasoningEngineConfig
  private readonly tools: Map<string, ToolDescriptor> = new Map()
  private readonly usageHistory: ToolUsageRecord[] = []
  private stats = {
    totalSelections: 0,
    totalPipelines: 0,
    totalToolSteps: 0,
    fallbacksUsed: 0,
    totalStepsExecuted: 0,
  }

  constructor(config: Partial<ToolReasoningEngineConfig> = {}) {
    this.config = { ...DEFAULT_TOOL_REASONING_CONFIG, ...config }
  }

  // ── Tool registry ──────────────────────────────────────────────────────

  /** Register a tool with the engine. */
  registerTool(tool: ToolDescriptor): void {
    this.tools.set(tool.name, tool)
  }

  /** Register multiple tools at once. */
  registerTools(tools: ToolDescriptor[]): void {
    for (const tool of tools) {
      this.registerTool(tool)
    }
  }

  /** Remove a tool from the registry. */
  unregisterTool(name: string): boolean {
    return this.tools.delete(name)
  }

  /** Get all registered tools. */
  getRegisteredTools(): readonly ToolDescriptor[] {
    return [...this.tools.values()]
  }

  // ── Tool selection ─────────────────────────────────────────────────────

  /** Select the best tools for a given requirement. */
  selectTools(requirement: TaskRequirement): ToolMatch[] {
    this.stats.totalSelections++

    const matches: ToolMatch[] = []
    const taskType = classifyTaskType(requirement.description)

    for (const tool of this.tools.values()) {
      // Check constraints
      if (!this.passesConstraints(tool, requirement.constraints || [])) continue

      // Compute relevance
      const capabilityOverlap = computeCapabilityOverlap(
        requirement.requiredCapabilities,
        tool.capabilities,
      )
      const inputMatch = computeCapabilityOverlap(requirement.inputAvailable, tool.inputTypes)
      const outputMatch = tool.outputTypes.some(
        o =>
          o.toLowerCase().includes(requirement.expectedOutputType.toLowerCase()) ||
          requirement.expectedOutputType.toLowerCase().includes(o.toLowerCase()),
      )
        ? 1.0
        : 0.3

      // Historical success rate for this task type
      const historicalSuccess = this.getHistoricalSuccessRate(tool.name, taskType)

      // Compute scores
      const relevanceScore = clamp(
        capabilityOverlap * 0.4 +
          inputMatch * 0.15 +
          outputMatch * 0.15 +
          tool.reliability * 0.1 +
          historicalSuccess * this.config.historyWeight,
        0,
        1,
      )

      const costBenefit = relevanceScore / Math.max(tool.cost, 0.01)

      if (relevanceScore >= this.config.minRelevanceScore) {
        matches.push({
          tool,
          relevanceScore,
          capabilityOverlap,
          costBenefit,
          reasoning:
            `${tool.name}: capability overlap ${(capabilityOverlap * 100).toFixed(0)}%, ` +
            `historical success ${(historicalSuccess * 100).toFixed(0)}%, ` +
            `cost-benefit ratio ${costBenefit.toFixed(2)}`,
        })
      }
    }

    // Sort by cost-benefit ratio (best first)
    matches.sort((a, b) => b.costBenefit - a.costBenefit)
    return matches
  }

  private passesConstraints(tool: ToolDescriptor, constraints: TaskConstraint[]): boolean {
    for (const constraint of constraints) {
      switch (constraint.type) {
        case 'max_cost':
          if (tool.cost > (constraint.value as number)) return false
          break
        case 'no_side_effects':
          if (tool.sideEffects) return false
          break
        case 'no_confirmation':
          if (tool.requiresConfirmation) return false
          break
        case 'preferred_tool':
          // Don't exclude, just affects ranking
          break
        case 'excluded_tool':
          if (tool.name === constraint.value) return false
          break
      }
    }
    return true
  }

  private getHistoricalSuccessRate(toolName: string, taskType: string): number {
    const relevant = this.usageHistory.filter(
      r => r.toolName === toolName && r.taskType === taskType,
    )
    if (relevant.length === 0) return 0.5 // No history — assume neutral
    return relevant.filter(r => r.success).length / relevant.length
  }

  // ── Pipeline construction ──────────────────────────────────────────────

  /** Build a multi-tool pipeline for a complex task. */
  buildPipeline(task: string, requirements: TaskRequirement[]): ToolPipeline {
    this.stats.totalPipelines++

    const steps: PipelineStep[] = []
    const executionOrder: string[] = []
    let totalCost = 0
    let reliabilityProduct = 1

    for (let i = 0; i < Math.min(requirements.length, this.config.maxPipelineSteps); i++) {
      const req = requirements[i]
      const matches = this.selectTools(req)

      if (matches.length === 0) continue

      const primaryTool = matches[0].tool
      const fallbacks = matches.slice(1, 1 + this.config.maxFallbacksPerStep).map(m => m.tool)

      const stepId = `step_${i}`
      const dependsOn = i > 0 ? [`step_${i - 1}`] : []

      const step: PipelineStep = {
        stepId,
        tool: primaryTool,
        purpose: req.description,
        inputSources: req.inputAvailable,
        outputKey: `output_${i}`,
        fallbackTools: fallbacks,
        estimatedCost: primaryTool.cost,
        dependsOn,
      }

      steps.push(step)
      executionOrder.push(stepId)
      totalCost += primaryTool.cost
      reliabilityProduct *= primaryTool.reliability
    }

    this.stats.totalToolSteps += steps.length

    return {
      id: generateId(),
      task,
      steps,
      totalEstimatedCost: totalCost,
      expectedReliability: reliabilityProduct,
      executionOrder,
      reasoning:
        `Pipeline with ${steps.length} steps. ` +
        `Total cost: ${totalCost.toFixed(2)}, ` +
        `Expected reliability: ${(reliabilityProduct * 100).toFixed(0)}%`,
    }
  }

  // ── Execution tracking ─────────────────────────────────────────────────

  /** Record the result of a pipeline step execution. */
  recordExecution(result: StepExecutionResult, taskType: string): void {
    this.stats.totalStepsExecuted++
    if (result.usedFallback) this.stats.fallbacksUsed++

    const record: ToolUsageRecord = {
      toolName: result.toolUsed,
      taskType,
      success: result.success,
      duration: result.duration,
      timestamp: Date.now(),
    }

    this.usageHistory.push(record)

    // Prune history
    while (this.usageHistory.length > this.config.maxUsageHistory) {
      this.usageHistory.shift()
    }
  }

  // ── Parameter inference ────────────────────────────────────────────────

  /** Infer parameters for a tool call from context. */
  inferParameters(tool: ToolDescriptor, context: Record<string, string>): InferredParameter[] {
    const inferred: InferredParameter[] = []

    // Match context keys to tool input types
    for (const inputType of tool.inputTypes) {
      const lower = inputType.toLowerCase()

      // Try exact match
      if (context[inputType]) {
        inferred.push({
          name: inputType,
          value: context[inputType],
          confidence: 1.0,
          source: 'exact_context_match',
        })
        continue
      }

      // Try fuzzy match
      for (const [key, value] of Object.entries(context)) {
        if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
          inferred.push({
            name: inputType,
            value,
            confidence: 0.7,
            source: `fuzzy_match:${key}`,
          })
          break
        }
      }
    }

    return inferred
  }

  // ── Cost-benefit analysis ──────────────────────────────────────────────

  /** Perform a cost-benefit analysis between tool alternatives. */
  analyzeCostBenefit(requirement: TaskRequirement): {
    recommended: ToolDescriptor | null
    analysis: Array<{
      tool: string
      benefit: number
      cost: number
      ratio: number
      reasoning: string
    }>
  } {
    const matches = this.selectTools(requirement)
    const analysis = matches.map(m => ({
      tool: m.tool.name,
      benefit: m.relevanceScore,
      cost: m.tool.cost,
      ratio: m.costBenefit,
      reasoning: m.reasoning,
    }))

    return {
      recommended: matches.length > 0 ? matches[0].tool : null,
      analysis,
    }
  }

  // ── Statistics ─────────────────────────────────────────────────────────

  /** Get runtime statistics. */
  getStats(): Readonly<ToolReasoningEngineStats> {
    // Compute tool success rates
    const toolSuccessRates: Record<string, number> = {}
    const toolCounts: Record<string, { success: number; total: number }> = {}

    for (const record of this.usageHistory) {
      if (!toolCounts[record.toolName]) {
        toolCounts[record.toolName] = { success: 0, total: 0 }
      }
      toolCounts[record.toolName].total++
      if (record.success) toolCounts[record.toolName].success++
    }

    for (const [name, counts] of Object.entries(toolCounts)) {
      toolSuccessRates[name] = counts.total > 0 ? counts.success / counts.total : 0
    }

    // Most used tools
    const toolFreq: Record<string, number> = {}
    for (const record of this.usageHistory) {
      toolFreq[record.toolName] = (toolFreq[record.toolName] || 0) + 1
    }
    const mostUsedTools = Object.entries(toolFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name)

    return {
      totalSelectionsPerformed: this.stats.totalSelections,
      totalPipelinesCreated: this.stats.totalPipelines,
      avgToolsPerPipeline:
        this.stats.totalPipelines > 0 ? this.stats.totalToolSteps / this.stats.totalPipelines : 0,
      toolSuccessRates,
      mostUsedTools,
      fallbackUsageRate:
        this.stats.totalStepsExecuted > 0
          ? this.stats.fallbacksUsed / this.stats.totalStepsExecuted
          : 0,
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────

  /** Serialize engine state for persistence. */
  serialize(): string {
    return JSON.stringify({
      tools: [...this.tools.values()],
      usageHistory: this.usageHistory.slice(-200),
      stats: this.stats,
    })
  }

  /** Restore engine state from serialized data. */
  static deserialize(
    json: string,
    config?: Partial<ToolReasoningEngineConfig>,
  ): ToolReasoningEngine {
    const engine = new ToolReasoningEngine(config)
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.tools)) {
        for (const t of data.tools) engine.tools.set(t.name, t)
      }
      if (Array.isArray(data.usageHistory)) {
        engine.usageHistory.push(...data.usageHistory)
      }
      if (data.stats) {
        Object.assign(engine.stats, data.stats)
      }
    } catch {
      // Return fresh engine on parse failure
    }
    return engine
  }
}
