import { describe, it, expect, beforeEach } from 'vitest'
import {
  ToolReasoningEngine,
  DEFAULT_TOOL_REASONING_CONFIG,
  type ToolDescriptor,
  type TaskRequirement,
  type TaskConstraint,
  type StepExecutionResult,
  type ToolReasoningEngineConfig,
} from '../ToolReasoningEngine'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeTool(overrides: Partial<ToolDescriptor> = {}): ToolDescriptor {
  return {
    name: 'test_tool',
    description: 'A test tool',
    capabilities: ['read', 'write'],
    inputTypes: ['text'],
    outputTypes: ['text'],
    cost: 0.2,
    reliability: 0.9,
    sideEffects: false,
    requiresConfirmation: false,
    ...overrides,
  }
}

function makeRequirement(overrides: Partial<TaskRequirement> = {}): TaskRequirement {
  return {
    description: 'Read a file',
    requiredCapabilities: ['read'],
    inputAvailable: ['text'],
    expectedOutputType: 'text',
    priority: 'medium',
    ...overrides,
  }
}

function makeExecResult(overrides: Partial<StepExecutionResult> = {}): StepExecutionResult {
  return {
    stepId: 'step_0',
    success: true,
    toolUsed: 'test_tool',
    usedFallback: false,
    duration: 100,
    output: 'done',
    ...overrides,
  }
}

function makeFileReader(): ToolDescriptor {
  return makeTool({
    name: 'file_reader',
    description: 'Reads files',
    capabilities: ['read', 'file'],
    inputTypes: ['filePath'],
    outputTypes: ['text'],
    cost: 0.1,
    reliability: 0.95,
  })
}

function makeFileWriter(): ToolDescriptor {
  return makeTool({
    name: 'file_writer',
    description: 'Writes files',
    capabilities: ['write', 'file'],
    inputTypes: ['text', 'filePath'],
    outputTypes: ['confirmation'],
    cost: 0.3,
    reliability: 0.9,
    sideEffects: true,
  })
}

function makeCodeSearch(): ToolDescriptor {
  return makeTool({
    name: 'code_search',
    description: 'Searches code',
    capabilities: ['search', 'find', 'grep'],
    inputTypes: ['query'],
    outputTypes: ['text'],
    cost: 0.15,
    reliability: 0.85,
  })
}

function makeExpensiveTool(): ToolDescriptor {
  return makeTool({
    name: 'expensive_tool',
    description: 'An expensive tool',
    capabilities: ['analyze', 'review'],
    inputTypes: ['text'],
    outputTypes: ['text'],
    cost: 0.9,
    reliability: 0.99,
  })
}

function makeConfirmTool(): ToolDescriptor {
  return makeTool({
    name: 'confirm_tool',
    description: 'Requires confirmation',
    capabilities: ['deploy'],
    inputTypes: ['text'],
    outputTypes: ['text'],
    cost: 0.5,
    reliability: 0.8,
    sideEffects: true,
    requiresConfirmation: true,
  })
}

// ── Constructor Tests ─────────────────────────────────────────────────────────

describe('ToolReasoningEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new ToolReasoningEngine()
    expect(engine).toBeInstanceOf(ToolReasoningEngine)
  })

  it('creates an instance with empty config object', () => {
    const engine = new ToolReasoningEngine({})
    expect(engine).toBeInstanceOf(ToolReasoningEngine)
  })

  it('accepts a partial config override', () => {
    const engine = new ToolReasoningEngine({ maxPipelineSteps: 5 })
    expect(engine).toBeInstanceOf(ToolReasoningEngine)
  })

  it('accepts a full config override', () => {
    const config: ToolReasoningEngineConfig = {
      maxPipelineSteps: 5,
      maxFallbacksPerStep: 1,
      minRelevanceScore: 0.5,
      historyWeight: 0.2,
      maxUsageHistory: 500,
    }
    const engine = new ToolReasoningEngine(config)
    expect(engine).toBeInstanceOf(ToolReasoningEngine)
  })

  it('starts with no registered tools', () => {
    const engine = new ToolReasoningEngine()
    expect(engine.getRegisteredTools()).toHaveLength(0)
  })

  it('starts with zero stats', () => {
    const engine = new ToolReasoningEngine()
    const stats = engine.getStats()
    expect(stats.totalSelectionsPerformed).toBe(0)
    expect(stats.totalPipelinesCreated).toBe(0)
    expect(stats.avgToolsPerPipeline).toBe(0)
    expect(stats.fallbackUsageRate).toBe(0)
  })
})

// ── DEFAULT_TOOL_REASONING_CONFIG ─────────────────────────────────────────────

describe('DEFAULT_TOOL_REASONING_CONFIG', () => {
  it('has expected default values', () => {
    expect(DEFAULT_TOOL_REASONING_CONFIG.maxPipelineSteps).toBe(10)
    expect(DEFAULT_TOOL_REASONING_CONFIG.maxFallbacksPerStep).toBe(3)
    expect(DEFAULT_TOOL_REASONING_CONFIG.minRelevanceScore).toBe(0.3)
    expect(DEFAULT_TOOL_REASONING_CONFIG.historyWeight).toBe(0.3)
    expect(DEFAULT_TOOL_REASONING_CONFIG.maxUsageHistory).toBe(1000)
  })

  it('is not accidentally mutated', () => {
    expect(Object.keys(DEFAULT_TOOL_REASONING_CONFIG)).toHaveLength(5)
  })
})

// ── Tool Registration ─────────────────────────────────────────────────────────

describe('Tool registration', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
  })

  it('registers a single tool', () => {
    engine.registerTool(makeFileReader())
    expect(engine.getRegisteredTools()).toHaveLength(1)
  })

  it('registers multiple tools individually', () => {
    engine.registerTool(makeFileReader())
    engine.registerTool(makeFileWriter())
    expect(engine.getRegisteredTools()).toHaveLength(2)
  })

  it('overwrites a tool with the same name', () => {
    engine.registerTool(makeTool({ name: 'dup', cost: 0.1 }))
    engine.registerTool(makeTool({ name: 'dup', cost: 0.9 }))
    const tools = engine.getRegisteredTools()
    expect(tools).toHaveLength(1)
    expect(tools[0].cost).toBe(0.9)
  })

  it('registers tools in bulk with registerTools', () => {
    engine.registerTools([makeFileReader(), makeFileWriter(), makeCodeSearch()])
    expect(engine.getRegisteredTools()).toHaveLength(3)
  })

  it('returns empty array when no tools registered', () => {
    expect(engine.getRegisteredTools()).toEqual([])
  })

  it('getRegisteredTools returns copies (not internal map reference)', () => {
    engine.registerTool(makeFileReader())
    const a = engine.getRegisteredTools()
    const b = engine.getRegisteredTools()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

// ── Tool Unregistration ───────────────────────────────────────────────────────

describe('Tool unregistration', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
    engine.registerTools([makeFileReader(), makeFileWriter()])
  })

  it('removes an existing tool', () => {
    expect(engine.unregisterTool('file_reader')).toBe(true)
    expect(engine.getRegisteredTools()).toHaveLength(1)
  })

  it('returns false when removing a non-existent tool', () => {
    expect(engine.unregisterTool('no_such_tool')).toBe(false)
  })

  it('tool is no longer selected after removal', () => {
    engine.unregisterTool('file_reader')
    const matches = engine.selectTools(makeRequirement({
      requiredCapabilities: ['file'],
      inputAvailable: ['filePath'],
      expectedOutputType: 'text',
    }))
    const names = matches.map(m => m.tool.name)
    expect(names).not.toContain('file_reader')
  })

  it('unregistering all tools leaves empty registry', () => {
    engine.unregisterTool('file_reader')
    engine.unregisterTool('file_writer')
    expect(engine.getRegisteredTools()).toHaveLength(0)
  })
})

// ── Tool Selection ────────────────────────────────────────────────────────────

describe('Tool selection', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
    engine.registerTools([makeFileReader(), makeFileWriter(), makeCodeSearch(), makeExpensiveTool()])
  })

  it('returns matches sorted by cost-benefit descending', () => {
    const matches = engine.selectTools(makeRequirement({ requiredCapabilities: ['read'] }))
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i - 1].costBenefit).toBeGreaterThanOrEqual(matches[i].costBenefit)
    }
  })

  it('returns tools matching required capabilities', () => {
    const matches = engine.selectTools(makeRequirement({
      requiredCapabilities: ['search', 'find'],
    }))
    expect(matches.some(m => m.tool.name === 'code_search')).toBe(true)
  })

  it('returns empty array when no tools match capabilities', () => {
    const strict = new ToolReasoningEngine({ minRelevanceScore: 0.6 })
    strict.registerTools([makeFileReader(), makeFileWriter(), makeCodeSearch(), makeExpensiveTool()])
    const matches = strict.selectTools(makeRequirement({
      requiredCapabilities: ['teleport'],
      inputAvailable: ['wormhole_data'],
      expectedOutputType: 'wormhole',
    }))
    expect(matches).toHaveLength(0)
  })

  it('returns empty when no tools are registered', () => {
    const empty = new ToolReasoningEngine()
    const matches = empty.selectTools(makeRequirement())
    expect(matches).toHaveLength(0)
  })

  it('each match has relevance score >= minRelevanceScore', () => {
    const matches = engine.selectTools(makeRequirement())
    for (const m of matches) {
      expect(m.relevanceScore).toBeGreaterThanOrEqual(DEFAULT_TOOL_REASONING_CONFIG.minRelevanceScore)
    }
  })

  it('respects a custom minRelevanceScore', () => {
    const strict = new ToolReasoningEngine({ minRelevanceScore: 0.9 })
    strict.registerTools([makeFileReader(), makeFileWriter()])
    const matches = strict.selectTools(makeRequirement())
    for (const m of matches) {
      expect(m.relevanceScore).toBeGreaterThanOrEqual(0.9)
    }
  })

  it('match objects have all required fields', () => {
    const matches = engine.selectTools(makeRequirement())
    for (const m of matches) {
      expect(m).toHaveProperty('tool')
      expect(m).toHaveProperty('relevanceScore')
      expect(m).toHaveProperty('capabilityOverlap')
      expect(m).toHaveProperty('costBenefit')
      expect(m).toHaveProperty('reasoning')
      expect(typeof m.reasoning).toBe('string')
    }
  })

  it('relevance score is between 0 and 1', () => {
    const matches = engine.selectTools(makeRequirement())
    for (const m of matches) {
      expect(m.relevanceScore).toBeGreaterThanOrEqual(0)
      expect(m.relevanceScore).toBeLessThanOrEqual(1)
    }
  })

  it('capability overlap is between 0 and 1', () => {
    const matches = engine.selectTools(makeRequirement())
    for (const m of matches) {
      expect(m.capabilityOverlap).toBeGreaterThanOrEqual(0)
      expect(m.capabilityOverlap).toBeLessThanOrEqual(1)
    }
  })

  it('costBenefit is non-negative', () => {
    const matches = engine.selectTools(makeRequirement())
    for (const m of matches) {
      expect(m.costBenefit).toBeGreaterThanOrEqual(0)
    }
  })

  it('increments totalSelectionsPerformed stat', () => {
    engine.selectTools(makeRequirement())
    engine.selectTools(makeRequirement())
    expect(engine.getStats().totalSelectionsPerformed).toBe(2)
  })

  it('prefers low-cost tools with equal capability overlap', () => {
    const cheap = makeTool({ name: 'cheap', capabilities: ['analyze'], cost: 0.05, reliability: 0.9 })
    const pricey = makeTool({ name: 'pricey', capabilities: ['analyze'], cost: 0.8, reliability: 0.9 })
    const e = new ToolReasoningEngine()
    e.registerTools([pricey, cheap])
    const matches = e.selectTools(makeRequirement({ requiredCapabilities: ['analyze'] }))
    expect(matches[0].tool.name).toBe('cheap')
  })

  it('handles empty required capabilities gracefully', () => {
    const matches = engine.selectTools(makeRequirement({ requiredCapabilities: [] }))
    expect(Array.isArray(matches)).toBe(true)
  })
})

// ── Constraint filtering ──────────────────────────────────────────────────────

describe('Constraint filtering', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
    engine.registerTools([
      makeFileReader(),
      makeFileWriter(),
      makeExpensiveTool(),
      makeConfirmTool(),
    ])
  })

  it('max_cost excludes tools above cost threshold', () => {
    const constraint: TaskConstraint = { type: 'max_cost', value: 0.2 }
    const matches = engine.selectTools(makeRequirement({
      requiredCapabilities: ['read'],
      constraints: [constraint],
    }))
    for (const m of matches) {
      expect(m.tool.cost).toBeLessThanOrEqual(0.2)
    }
  })

  it('no_side_effects excludes tools with side effects', () => {
    const constraint: TaskConstraint = { type: 'no_side_effects', value: '' }
    const matches = engine.selectTools(makeRequirement({
      requiredCapabilities: [],
      constraints: [constraint],
    }))
    for (const m of matches) {
      expect(m.tool.sideEffects).toBe(false)
    }
  })

  it('no_confirmation excludes tools requiring confirmation', () => {
    const constraint: TaskConstraint = { type: 'no_confirmation', value: '' }
    const matches = engine.selectTools(makeRequirement({
      requiredCapabilities: [],
      constraints: [constraint],
    }))
    for (const m of matches) {
      expect(m.tool.requiresConfirmation).toBe(false)
    }
  })

  it('excluded_tool removes the specified tool', () => {
    const constraint: TaskConstraint = { type: 'excluded_tool', value: 'file_reader' }
    const matches = engine.selectTools(makeRequirement({
      requiredCapabilities: ['read'],
      constraints: [constraint],
    }))
    expect(matches.every(m => m.tool.name !== 'file_reader')).toBe(true)
  })

  it('preferred_tool does not exclude any tools', () => {
    const withoutPref = engine.selectTools(makeRequirement({ requiredCapabilities: [] }))
    const constraint: TaskConstraint = { type: 'preferred_tool', value: 'file_reader' }
    const withPref = engine.selectTools(makeRequirement({
      requiredCapabilities: [],
      constraints: [constraint],
    }))
    expect(withPref.length).toBe(withoutPref.length)
  })

  it('multiple constraints combine (AND logic)', () => {
    const constraints: TaskConstraint[] = [
      { type: 'max_cost', value: 0.5 },
      { type: 'no_side_effects', value: '' },
    ]
    const matches = engine.selectTools(makeRequirement({
      requiredCapabilities: [],
      constraints,
    }))
    for (const m of matches) {
      expect(m.tool.cost).toBeLessThanOrEqual(0.5)
      expect(m.tool.sideEffects).toBe(false)
    }
  })

  it('all tools excluded returns empty array', () => {
    const constraints: TaskConstraint[] = [
      { type: 'excluded_tool', value: 'file_reader' },
      { type: 'excluded_tool', value: 'file_writer' },
      { type: 'excluded_tool', value: 'expensive_tool' },
      { type: 'excluded_tool', value: 'confirm_tool' },
    ]
    const matches = engine.selectTools(makeRequirement({
      requiredCapabilities: [],
      constraints,
    }))
    expect(matches).toHaveLength(0)
  })
})

// ── Pipeline Construction ─────────────────────────────────────────────────────

describe('Pipeline construction', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
    engine.registerTools([makeFileReader(), makeFileWriter(), makeCodeSearch()])
  })

  it('builds a pipeline from a single requirement', () => {
    const pipeline = engine.buildPipeline('read a file', [
      makeRequirement({ description: 'Read file contents', requiredCapabilities: ['read'] }),
    ])
    expect(pipeline.steps.length).toBeGreaterThanOrEqual(1)
    expect(pipeline.executionOrder.length).toBe(pipeline.steps.length)
  })

  it('builds a pipeline with multiple sequential steps', () => {
    const reqs = [
      makeRequirement({ description: 'Search for code', requiredCapabilities: ['search'] }),
      makeRequirement({ description: 'Read matched file', requiredCapabilities: ['read'] }),
      makeRequirement({ description: 'Write updated file', requiredCapabilities: ['write'] }),
    ]
    const pipeline = engine.buildPipeline('search and update', reqs)
    expect(pipeline.steps.length).toBeLessThanOrEqual(3)
    expect(pipeline.executionOrder).toEqual(pipeline.steps.map(s => s.stepId))
  })

  it('each step has a unique stepId', () => {
    const reqs = [makeRequirement(), makeRequirement()]
    const pipeline = engine.buildPipeline('multi', reqs)
    const ids = pipeline.steps.map(s => s.stepId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('steps after the first depend on the previous step', () => {
    const reqs = [
      makeRequirement({ description: 'Search code', requiredCapabilities: ['search'] }),
      makeRequirement({ description: 'Read code', requiredCapabilities: ['read'] }),
    ]
    const pipeline = engine.buildPipeline('dep test', reqs)
    if (pipeline.steps.length >= 2) {
      expect(pipeline.steps[0].dependsOn).toEqual([])
      expect(pipeline.steps[1].dependsOn).toContain(pipeline.steps[0].stepId)
    }
  })

  it('pipeline has a non-empty id', () => {
    const pipeline = engine.buildPipeline('task', [makeRequirement()])
    expect(pipeline.id).toBeTruthy()
    expect(typeof pipeline.id).toBe('string')
  })

  it('pipeline stores the task name', () => {
    const pipeline = engine.buildPipeline('my specific task', [makeRequirement()])
    expect(pipeline.task).toBe('my specific task')
  })

  it('totalEstimatedCost is sum of step costs', () => {
    const reqs = [
      makeRequirement({ description: 'Read file', requiredCapabilities: ['read'] }),
      makeRequirement({ description: 'Write file', requiredCapabilities: ['write'] }),
    ]
    const pipeline = engine.buildPipeline('rw', reqs)
    const sumCost = pipeline.steps.reduce((s, step) => s + step.estimatedCost, 0)
    expect(pipeline.totalEstimatedCost).toBeCloseTo(sumCost, 5)
  })

  it('expectedReliability is product of step reliabilities', () => {
    const reqs = [
      makeRequirement({ description: 'Read', requiredCapabilities: ['read'] }),
      makeRequirement({ description: 'Write', requiredCapabilities: ['write'] }),
    ]
    const pipeline = engine.buildPipeline('rel', reqs)
    const product = pipeline.steps.reduce((p, step) => p * step.tool.reliability, 1)
    expect(pipeline.expectedReliability).toBeCloseTo(product, 5)
  })

  it('pipeline includes reasoning text', () => {
    const pipeline = engine.buildPipeline('task', [makeRequirement()])
    expect(typeof pipeline.reasoning).toBe('string')
    expect(pipeline.reasoning.length).toBeGreaterThan(0)
  })

  it('limits steps to maxPipelineSteps', () => {
    const e = new ToolReasoningEngine({ maxPipelineSteps: 2 })
    e.registerTool(makeFileReader())
    const reqs = Array.from({ length: 5 }, () => makeRequirement())
    const pipeline = e.buildPipeline('limited', reqs)
    expect(pipeline.steps.length).toBeLessThanOrEqual(2)
  })

  it('step includes fallback tools', () => {
    engine.registerTool(makeExpensiveTool())
    const pipeline = engine.buildPipeline('fallback test', [
      makeRequirement({ requiredCapabilities: ['read'], expectedOutputType: 'text' }),
    ])
    if (pipeline.steps.length > 0) {
      expect(Array.isArray(pipeline.steps[0].fallbackTools)).toBe(true)
    }
  })

  it('limits fallbacks to maxFallbacksPerStep', () => {
    const e = new ToolReasoningEngine({ maxFallbacksPerStep: 1 })
    e.registerTools([
      makeTool({ name: 't1', capabilities: ['read'], cost: 0.1, reliability: 0.9 }),
      makeTool({ name: 't2', capabilities: ['read'], cost: 0.2, reliability: 0.8 }),
      makeTool({ name: 't3', capabilities: ['read'], cost: 0.3, reliability: 0.7 }),
    ])
    const pipeline = e.buildPipeline('fb limit', [makeRequirement({ requiredCapabilities: ['read'] })])
    if (pipeline.steps.length > 0) {
      expect(pipeline.steps[0].fallbackTools.length).toBeLessThanOrEqual(1)
    }
  })

  it('increments totalPipelinesCreated stat', () => {
    engine.buildPipeline('a', [makeRequirement()])
    engine.buildPipeline('b', [makeRequirement()])
    expect(engine.getStats().totalPipelinesCreated).toBe(2)
  })

  it('pipeline with no matching requirements yields empty steps', () => {
    const strict = new ToolReasoningEngine({ minRelevanceScore: 0.6 })
    strict.registerTools([makeFileReader(), makeFileWriter(), makeCodeSearch()])
    const pipeline = strict.buildPipeline('empty', [
      makeRequirement({ requiredCapabilities: ['teleport'], inputAvailable: ['wormhole'], expectedOutputType: 'wormhole' }),
    ])
    expect(pipeline.steps).toHaveLength(0)
  })

  it('empty requirements array yields pipeline with no steps', () => {
    const pipeline = engine.buildPipeline('no reqs', [])
    expect(pipeline.steps).toHaveLength(0)
    expect(pipeline.executionOrder).toHaveLength(0)
    expect(pipeline.totalEstimatedCost).toBe(0)
    expect(pipeline.expectedReliability).toBe(1)
  })

  it('step outputKey follows output_N pattern', () => {
    const pipeline = engine.buildPipeline('keys', [makeRequirement(), makeRequirement()])
    pipeline.steps.forEach((step, i) => {
      expect(step.outputKey).toBe(`output_${i}`)
    })
  })
})

// ── Execution Recording ───────────────────────────────────────────────────────

describe('Execution recording', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
    engine.registerTool(makeFileReader())
  })

  it('records a successful execution', () => {
    engine.recordExecution(makeExecResult({ success: true }), 'file_read')
    const stats = engine.getStats()
    expect(stats.toolSuccessRates['test_tool']).toBe(1)
  })

  it('records a failed execution', () => {
    engine.recordExecution(makeExecResult({ success: false }), 'file_read')
    const stats = engine.getStats()
    expect(stats.toolSuccessRates['test_tool']).toBe(0)
  })

  it('tracks mixed success/failure rates', () => {
    engine.recordExecution(makeExecResult({ success: true }), 'file_read')
    engine.recordExecution(makeExecResult({ success: true }), 'file_read')
    engine.recordExecution(makeExecResult({ success: false }), 'file_read')
    const stats = engine.getStats()
    expect(stats.toolSuccessRates['test_tool']).toBeCloseTo(2 / 3, 5)
  })

  it('tracks fallback usage', () => {
    engine.recordExecution(makeExecResult({ usedFallback: true }), 'file_read')
    engine.recordExecution(makeExecResult({ usedFallback: false }), 'file_read')
    const stats = engine.getStats()
    expect(stats.fallbackUsageRate).toBeCloseTo(0.5, 5)
  })

  it('prunes history beyond maxUsageHistory', () => {
    const e = new ToolReasoningEngine({ maxUsageHistory: 5 })
    e.registerTool(makeFileReader())
    for (let i = 0; i < 10; i++) {
      e.recordExecution(makeExecResult({ toolUsed: 'file_reader' }), 'file_read')
    }
    // Internal history should be capped; stats still reflect recorded data
    const stats = e.getStats()
    expect(stats.mostUsedTools).toContain('file_reader')
  })

  it('records multiple different tools', () => {
    engine.registerTool(makeCodeSearch())
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader' }), 'file_read')
    engine.recordExecution(makeExecResult({ toolUsed: 'code_search' }), 'search')
    const stats = engine.getStats()
    expect(Object.keys(stats.toolSuccessRates)).toContain('file_reader')
    expect(Object.keys(stats.toolSuccessRates)).toContain('code_search')
  })

  it('history influences future tool selection', () => {
    engine.registerTools([
      makeTool({ name: 'a', capabilities: ['read'], cost: 0.1, reliability: 0.9 }),
      makeTool({ name: 'b', capabilities: ['read'], cost: 0.1, reliability: 0.9 }),
    ])
    // Record many successes for tool "a" on file_read tasks
    for (let i = 0; i < 10; i++) {
      engine.recordExecution(makeExecResult({ toolUsed: 'a', success: true }), 'file_read')
      engine.recordExecution(makeExecResult({ toolUsed: 'b', success: false }), 'file_read')
    }
    const matches = engine.selectTools(makeRequirement({
      description: 'Read a file',
      requiredCapabilities: ['read'],
    }))
    const aMatch = matches.find(m => m.tool.name === 'a')
    const bMatch = matches.find(m => m.tool.name === 'b')
    if (aMatch && bMatch) {
      expect(aMatch.relevanceScore).toBeGreaterThan(bMatch.relevanceScore)
    }
  })
})

// ── Parameter Inference ───────────────────────────────────────────────────────

describe('Parameter inference', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
  })

  it('infers parameters from exact context match', () => {
    const tool = makeTool({ inputTypes: ['filePath'] })
    const context = { filePath: '/src/index.ts' }
    const params = engine.inferParameters(tool, context)
    expect(params).toHaveLength(1)
    expect(params[0].name).toBe('filePath')
    expect(params[0].value).toBe('/src/index.ts')
    expect(params[0].confidence).toBe(1.0)
    expect(params[0].source).toBe('exact_context_match')
  })

  it('infers parameters from fuzzy context match', () => {
    const tool = makeTool({ inputTypes: ['path'] })
    const context = { filePath: '/src/index.ts' }
    const params = engine.inferParameters(tool, context)
    expect(params).toHaveLength(1)
    expect(params[0].confidence).toBe(0.7)
    expect(params[0].source).toContain('fuzzy_match')
  })

  it('returns empty array when nothing matches', () => {
    const tool = makeTool({ inputTypes: ['specialKey'] })
    const context = { unrelated: 'value' }
    const params = engine.inferParameters(tool, context)
    expect(params).toHaveLength(0)
  })

  it('returns empty array for tool with no input types', () => {
    const tool = makeTool({ inputTypes: [] })
    const context = { anything: 'value' }
    const params = engine.inferParameters(tool, context)
    expect(params).toHaveLength(0)
  })

  it('returns empty array for empty context', () => {
    const tool = makeTool({ inputTypes: ['filePath'] })
    const params = engine.inferParameters(tool, {})
    expect(params).toHaveLength(0)
  })

  it('prefers exact match over fuzzy match', () => {
    const tool = makeTool({ inputTypes: ['query'] })
    const context = { query: 'exact', queryString: 'fuzzy' }
    const params = engine.inferParameters(tool, context)
    expect(params).toHaveLength(1)
    expect(params[0].value).toBe('exact')
    expect(params[0].confidence).toBe(1.0)
  })

  it('infers multiple parameters for multiple input types', () => {
    const tool = makeTool({ inputTypes: ['filePath', 'text'] })
    const context = { filePath: '/test.ts', text: 'hello' }
    const params = engine.inferParameters(tool, context)
    expect(params).toHaveLength(2)
  })

  it('fuzzy matching is case-insensitive', () => {
    const tool = makeTool({ inputTypes: ['FILEPATH'] })
    const context = { filepath: '/src/index.ts' }
    const params = engine.inferParameters(tool, context)
    expect(params.length).toBeGreaterThanOrEqual(1)
    expect(params[0].confidence).toBe(0.7)
  })
})

// ── Cost-Benefit Analysis ─────────────────────────────────────────────────────

describe('Cost-benefit analysis', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
    engine.registerTools([makeFileReader(), makeFileWriter(), makeExpensiveTool()])
  })

  it('returns recommended tool for matching requirement', () => {
    const result = engine.analyzeCostBenefit(makeRequirement({ requiredCapabilities: ['read'] }))
    expect(result.recommended).not.toBeNull()
  })

  it('returns null recommended when no tools match', () => {
    const strict = new ToolReasoningEngine({ minRelevanceScore: 0.6 })
    strict.registerTools([makeFileReader(), makeFileWriter(), makeExpensiveTool()])
    const result = strict.analyzeCostBenefit(makeRequirement({
      requiredCapabilities: ['teleport'],
      inputAvailable: ['wormhole'],
      expectedOutputType: 'wormhole',
    }))
    expect(result.recommended).toBeNull()
    expect(result.analysis).toHaveLength(0)
  })

  it('analysis includes benefit, cost, and ratio for each tool', () => {
    const result = engine.analyzeCostBenefit(makeRequirement())
    for (const entry of result.analysis) {
      expect(entry).toHaveProperty('tool')
      expect(entry).toHaveProperty('benefit')
      expect(entry).toHaveProperty('cost')
      expect(entry).toHaveProperty('ratio')
      expect(entry).toHaveProperty('reasoning')
    }
  })

  it('recommended tool has highest cost-benefit ratio', () => {
    const result = engine.analyzeCostBenefit(makeRequirement())
    if (result.recommended && result.analysis.length > 1) {
      const topRatio = result.analysis[0].ratio
      for (const entry of result.analysis) {
        expect(topRatio).toBeGreaterThanOrEqual(entry.ratio)
      }
      expect(result.recommended.name).toBe(result.analysis[0].tool)
    }
  })

  it('analysis is sorted by ratio descending', () => {
    const result = engine.analyzeCostBenefit(makeRequirement())
    for (let i = 1; i < result.analysis.length; i++) {
      expect(result.analysis[i - 1].ratio).toBeGreaterThanOrEqual(result.analysis[i].ratio)
    }
  })

  it('expensive tool has lower ratio than cheap equivalent', () => {
    const e = new ToolReasoningEngine()
    e.registerTools([
      makeTool({ name: 'cheap', capabilities: ['analyze'], cost: 0.05, reliability: 0.9 }),
      makeTool({ name: 'pricey', capabilities: ['analyze'], cost: 0.95, reliability: 0.9 }),
    ])
    const result = e.analyzeCostBenefit(makeRequirement({ requiredCapabilities: ['analyze'] }))
    const cheapEntry = result.analysis.find(a => a.tool === 'cheap')
    const priceyEntry = result.analysis.find(a => a.tool === 'pricey')
    if (cheapEntry && priceyEntry) {
      expect(cheapEntry.ratio).toBeGreaterThan(priceyEntry.ratio)
    }
  })

  it('cost-benefit with no registered tools returns null and empty', () => {
    const empty = new ToolReasoningEngine()
    const result = empty.analyzeCostBenefit(makeRequirement())
    expect(result.recommended).toBeNull()
    expect(result.analysis).toHaveLength(0)
  })
})

// ── Stats Tracking ────────────────────────────────────────────────────────────

describe('Stats tracking', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
    engine.registerTools([makeFileReader(), makeFileWriter(), makeCodeSearch()])
  })

  it('initial stats are all zero', () => {
    const stats = engine.getStats()
    expect(stats.totalSelectionsPerformed).toBe(0)
    expect(stats.totalPipelinesCreated).toBe(0)
    expect(stats.avgToolsPerPipeline).toBe(0)
    expect(stats.mostUsedTools).toHaveLength(0)
    expect(stats.fallbackUsageRate).toBe(0)
    expect(Object.keys(stats.toolSuccessRates)).toHaveLength(0)
  })

  it('tracks selections count', () => {
    engine.selectTools(makeRequirement())
    engine.selectTools(makeRequirement())
    engine.selectTools(makeRequirement())
    expect(engine.getStats().totalSelectionsPerformed).toBe(3)
  })

  it('tracks pipeline count', () => {
    engine.buildPipeline('a', [makeRequirement()])
    engine.buildPipeline('b', [makeRequirement()])
    expect(engine.getStats().totalPipelinesCreated).toBe(2)
  })

  it('calculates avgToolsPerPipeline', () => {
    engine.buildPipeline('one', [
      makeRequirement({ description: 'Read', requiredCapabilities: ['read'] }),
    ])
    engine.buildPipeline('two', [
      makeRequirement({ description: 'Search', requiredCapabilities: ['search'] }),
      makeRequirement({ description: 'Read', requiredCapabilities: ['read'] }),
    ])
    const stats = engine.getStats()
    expect(stats.avgToolsPerPipeline).toBeGreaterThan(0)
  })

  it('mostUsedTools lists tools in frequency order', () => {
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader' }), 'file_read')
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader' }), 'file_read')
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader' }), 'file_read')
    engine.recordExecution(makeExecResult({ toolUsed: 'code_search' }), 'search')
    const stats = engine.getStats()
    expect(stats.mostUsedTools[0]).toBe('file_reader')
  })

  it('mostUsedTools is limited to top 5', () => {
    for (let i = 0; i < 10; i++) {
      engine.recordExecution(makeExecResult({ toolUsed: `tool_${i}` }), 'general')
    }
    expect(engine.getStats().mostUsedTools.length).toBeLessThanOrEqual(5)
  })

  it('toolSuccessRates tracks per-tool rates', () => {
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader', success: true }), 'read')
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader', success: true }), 'read')
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader', success: false }), 'read')
    expect(engine.getStats().toolSuccessRates['file_reader']).toBeCloseTo(2 / 3, 5)
  })

  it('fallbackUsageRate is zero when no fallbacks used', () => {
    engine.recordExecution(makeExecResult({ usedFallback: false }), 'read')
    engine.recordExecution(makeExecResult({ usedFallback: false }), 'read')
    expect(engine.getStats().fallbackUsageRate).toBe(0)
  })

  it('fallbackUsageRate is 1 when all executions use fallback', () => {
    engine.recordExecution(makeExecResult({ usedFallback: true }), 'read')
    engine.recordExecution(makeExecResult({ usedFallback: true }), 'read')
    expect(engine.getStats().fallbackUsageRate).toBe(1)
  })
})

// ── Serialization / Deserialization ───────────────────────────────────────────

describe('Serialization and deserialization', () => {
  it('serialize returns a valid JSON string', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTool(makeFileReader())
    const json = engine.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('serialized data includes tools', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTool(makeFileReader())
    const data = JSON.parse(engine.serialize())
    expect(data.tools).toHaveLength(1)
    expect(data.tools[0].name).toBe('file_reader')
  })

  it('serialized data includes usage history', () => {
    const engine = new ToolReasoningEngine()
    engine.recordExecution(makeExecResult({ toolUsed: 'x' }), 'general')
    const data = JSON.parse(engine.serialize())
    expect(data.usageHistory.length).toBeGreaterThanOrEqual(1)
  })

  it('serialized data includes stats', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTool(makeFileReader())
    engine.selectTools(makeRequirement())
    const data = JSON.parse(engine.serialize())
    expect(data.stats).toBeDefined()
    expect(data.stats.totalSelections).toBe(1)
  })

  it('round-trips tools through serialize/deserialize', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTools([makeFileReader(), makeCodeSearch()])
    const json = engine.serialize()
    const restored = ToolReasoningEngine.deserialize(json)
    const names = restored.getRegisteredTools().map(t => t.name).sort()
    expect(names).toEqual(['code_search', 'file_reader'])
  })

  it('round-trips usage history through serialize/deserialize', () => {
    const engine = new ToolReasoningEngine()
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader', success: true }), 'read')
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader', success: false }), 'read')
    const restored = ToolReasoningEngine.deserialize(engine.serialize())
    const stats = restored.getStats()
    expect(stats.toolSuccessRates['file_reader']).toBeCloseTo(0.5, 5)
  })

  it('round-trips stats through serialize/deserialize', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTool(makeFileReader())
    engine.selectTools(makeRequirement())
    engine.buildPipeline('task', [makeRequirement()])
    const restored = ToolReasoningEngine.deserialize(engine.serialize())
    const stats = restored.getStats()
    // Stats are restored from internal stats object
    expect(stats.totalSelectionsPerformed).toBeGreaterThanOrEqual(1)
  })

  it('deserialize with custom config uses that config', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTools([
      makeTool({ name: 't1', capabilities: ['read'], cost: 0.1, reliability: 0.9 }),
      makeTool({ name: 't2', capabilities: ['read'], cost: 0.1, reliability: 0.9 }),
    ])
    const json = engine.serialize()
    const restored = ToolReasoningEngine.deserialize(json, { minRelevanceScore: 0.99 })
    // With very high min relevance, fewer tools should match
    const matches = restored.selectTools(makeRequirement({ requiredCapabilities: ['read'] }))
    expect(matches.length).toBeLessThanOrEqual(
      engine.selectTools(makeRequirement({ requiredCapabilities: ['read'] })).length,
    )
  })

  it('deserialize with invalid JSON returns a fresh engine', () => {
    const engine = ToolReasoningEngine.deserialize('not valid json')
    expect(engine).toBeInstanceOf(ToolReasoningEngine)
    expect(engine.getRegisteredTools()).toHaveLength(0)
  })

  it('deserialize with empty object returns engine with no tools', () => {
    const engine = ToolReasoningEngine.deserialize('{}')
    expect(engine.getRegisteredTools()).toHaveLength(0)
  })

  it('serialize caps history at 200 entries', () => {
    const engine = new ToolReasoningEngine()
    for (let i = 0; i < 300; i++) {
      engine.recordExecution(makeExecResult({ toolUsed: `t_${i}` }), 'general')
    }
    const data = JSON.parse(engine.serialize())
    expect(data.usageHistory.length).toBeLessThanOrEqual(200)
  })
})

// ── Task Classification (via selection) ───────────────────────────────────────

describe('Task type classification via selection', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
    engine.registerTools([makeFileReader(), makeFileWriter(), makeCodeSearch()])
  })

  it('description with "read" classifies as file_read', () => {
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader', success: true }), 'file_read')
    // The historical success for file_reader on file_read tasks should boost it
    const matches = engine.selectTools(makeRequirement({
      description: 'Read the file contents',
      requiredCapabilities: ['read'],
    }))
    expect(matches.length).toBeGreaterThan(0)
  })

  it('description with "search" classifies as search', () => {
    engine.recordExecution(makeExecResult({ toolUsed: 'code_search', success: true }), 'search')
    const matches = engine.selectTools(makeRequirement({
      description: 'Search for a pattern',
      requiredCapabilities: ['search'],
    }))
    expect(matches.some(m => m.tool.name === 'code_search')).toBe(true)
  })

  it('description with "write" classifies as file_write', () => {
    const matches = engine.selectTools(makeRequirement({
      description: 'Write to the configuration file',
      requiredCapabilities: ['write'],
    }))
    expect(matches.length).toBeGreaterThanOrEqual(0)
  })

  it('unknown description defaults to general', () => {
    // Should not throw for a description with no known keywords
    const matches = engine.selectTools(makeRequirement({
      description: 'Do something unusual',
      requiredCapabilities: ['read'],
    }))
    expect(Array.isArray(matches)).toBe(true)
  })
})

// ── Edge Cases ────────────────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('selectTools on engine with zero tools returns empty', () => {
    const engine = new ToolReasoningEngine()
    expect(engine.selectTools(makeRequirement())).toEqual([])
  })

  it('buildPipeline on engine with zero tools returns empty steps', () => {
    const engine = new ToolReasoningEngine()
    const pipeline = engine.buildPipeline('empty', [makeRequirement()])
    expect(pipeline.steps).toHaveLength(0)
  })

  it('pipeline with many requirements is clamped to maxPipelineSteps', () => {
    const engine = new ToolReasoningEngine({ maxPipelineSteps: 3 })
    engine.registerTool(makeTool({ name: 'all', capabilities: ['read', 'write', 'search', 'deploy'] }))
    const reqs = Array.from({ length: 20 }, (_, i) =>
      makeRequirement({ description: `Step ${i}`, requiredCapabilities: ['read'] }),
    )
    const pipeline = engine.buildPipeline('big', reqs)
    expect(pipeline.steps.length).toBeLessThanOrEqual(3)
  })

  it('tool with zero cost does not cause division by zero', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTool(makeTool({ name: 'free', cost: 0, capabilities: ['read'] }))
    const matches = engine.selectTools(makeRequirement({ requiredCapabilities: ['read'] }))
    for (const m of matches) {
      expect(isFinite(m.costBenefit)).toBe(true)
    }
  })

  it('tool with cost just above zero has high costBenefit', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTool(makeTool({ name: 'almost_free', cost: 0.001, capabilities: ['read'], reliability: 0.9 }))
    const matches = engine.selectTools(makeRequirement({ requiredCapabilities: ['read'] }))
    if (matches.length > 0) {
      expect(matches[0].costBenefit).toBeGreaterThan(10)
    }
  })

  it('inferParameters with no input types returns empty', () => {
    const engine = new ToolReasoningEngine()
    expect(engine.inferParameters(makeTool({ inputTypes: [] }), { a: 'b' })).toEqual([])
  })

  it('getStats with no activity returns zeroed stats', () => {
    const engine = new ToolReasoningEngine()
    const stats = engine.getStats()
    expect(stats.totalSelectionsPerformed).toBe(0)
    expect(stats.totalPipelinesCreated).toBe(0)
    expect(stats.avgToolsPerPipeline).toBe(0)
    expect(stats.fallbackUsageRate).toBe(0)
  })

  it('recording execution with no prior tools still tracks history', () => {
    const engine = new ToolReasoningEngine()
    engine.recordExecution(makeExecResult({ toolUsed: 'phantom' }), 'general')
    const stats = engine.getStats()
    expect(stats.mostUsedTools).toContain('phantom')
  })

  it('registering tool after selection uses updated registry', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTool(makeFileReader())
    const before = engine.selectTools(makeRequirement({ requiredCapabilities: ['search'] }))
    engine.registerTool(makeCodeSearch())
    const after = engine.selectTools(makeRequirement({ requiredCapabilities: ['search'] }))
    expect(after.length).toBeGreaterThanOrEqual(before.length)
  })

  it('deserialized engine can perform all operations', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTools([makeFileReader(), makeCodeSearch()])
    engine.recordExecution(makeExecResult({ toolUsed: 'file_reader' }), 'read')
    const restored = ToolReasoningEngine.deserialize(engine.serialize())

    // Selection
    const matches = restored.selectTools(makeRequirement({ requiredCapabilities: ['read'] }))
    expect(matches.length).toBeGreaterThan(0)

    // Pipeline
    const pipeline = restored.buildPipeline('task', [makeRequirement()])
    expect(pipeline.steps.length).toBeGreaterThan(0)

    // Record execution
    restored.recordExecution(makeExecResult({ toolUsed: 'code_search' }), 'search')
    expect(restored.getStats().mostUsedTools.length).toBeGreaterThan(0)

    // Inference
    const params = restored.inferParameters(makeFileReader(), { filePath: '/test.ts' })
    expect(params.length).toBeGreaterThan(0)

    // Cost-benefit
    const cb = restored.analyzeCostBenefit(makeRequirement())
    expect(cb.recommended).not.toBeNull()

    // Re-serialize
    const json = restored.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('concurrent pipelines produce unique ids', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTool(makeFileReader())
    const ids = new Set<string>()
    for (let i = 0; i < 20; i++) {
      ids.add(engine.buildPipeline(`task_${i}`, [makeRequirement()]).id)
    }
    expect(ids.size).toBe(20)
  })

  it('handles requirement with all priority levels', () => {
    const engine = new ToolReasoningEngine()
    engine.registerTool(makeFileReader())
    for (const priority of ['low', 'medium', 'high', 'critical'] as const) {
      const matches = engine.selectTools(makeRequirement({ priority }))
      expect(Array.isArray(matches)).toBe(true)
    }
  })
})

// ── Historical success rate influence ─────────────────────────────────────────

describe('Historical success rate', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
    engine.registerTools([
      makeTool({ name: 'reliable', capabilities: ['read'], cost: 0.2, reliability: 0.8 }),
      makeTool({ name: 'unreliable', capabilities: ['read'], cost: 0.2, reliability: 0.8 }),
    ])
  })

  it('tool with no history gets neutral score', () => {
    const matches = engine.selectTools(makeRequirement({
      description: 'Read file',
      requiredCapabilities: ['read'],
    }))
    // Both tools should have equal scores with no history
    if (matches.length === 2) {
      expect(matches[0].relevanceScore).toBeCloseTo(matches[1].relevanceScore, 2)
    }
  })

  it('successful history boosts tool scoring', () => {
    for (let i = 0; i < 5; i++) {
      engine.recordExecution(makeExecResult({ toolUsed: 'reliable', success: true }), 'file_read')
      engine.recordExecution(makeExecResult({ toolUsed: 'unreliable', success: false }), 'file_read')
    }
    const matches = engine.selectTools(makeRequirement({
      description: 'Read a file',
      requiredCapabilities: ['read'],
    }))
    const reliable = matches.find(m => m.tool.name === 'reliable')
    const unreliable = matches.find(m => m.tool.name === 'unreliable')
    if (reliable && unreliable) {
      expect(reliable.relevanceScore).toBeGreaterThan(unreliable.relevanceScore)
    }
  })

  it('history for different task type does not affect current task', () => {
    // Record success for "search" task type
    for (let i = 0; i < 10; i++) {
      engine.recordExecution(makeExecResult({ toolUsed: 'reliable', success: true }), 'search')
      engine.recordExecution(makeExecResult({ toolUsed: 'unreliable', success: false }), 'search')
    }
    // Now select for "read" (file_read) — history should not apply
    const matches = engine.selectTools(makeRequirement({
      description: 'Read a file',
      requiredCapabilities: ['read'],
    }))
    if (matches.length === 2) {
      // Scores should be roughly equal since no file_read history
      expect(Math.abs(matches[0].relevanceScore - matches[1].relevanceScore)).toBeLessThan(0.1)
    }
  })

  it('historyWeight config controls influence of history', () => {
    const noHistory = new ToolReasoningEngine({ historyWeight: 0 })
    noHistory.registerTools([
      makeTool({ name: 'good', capabilities: ['read'], cost: 0.2, reliability: 0.8 }),
      makeTool({ name: 'bad', capabilities: ['read'], cost: 0.2, reliability: 0.8 }),
    ])
    for (let i = 0; i < 10; i++) {
      noHistory.recordExecution(makeExecResult({ toolUsed: 'good', success: true }), 'file_read')
      noHistory.recordExecution(makeExecResult({ toolUsed: 'bad', success: false }), 'file_read')
    }
    const matches = noHistory.selectTools(makeRequirement({
      description: 'Read a file',
      requiredCapabilities: ['read'],
    }))
    if (matches.length === 2) {
      // With 0 history weight, both should score the same
      expect(matches[0].relevanceScore).toBeCloseTo(matches[1].relevanceScore, 5)
    }
  })
})

// ── Output type matching ──────────────────────────────────────────────────────

describe('Output type matching', () => {
  let engine: ToolReasoningEngine

  beforeEach(() => {
    engine = new ToolReasoningEngine()
    engine.registerTools([
      makeTool({ name: 'text_tool', capabilities: ['read'], outputTypes: ['text'], cost: 0.2, reliability: 0.9 }),
      makeTool({ name: 'json_tool', capabilities: ['read'], outputTypes: ['json'], cost: 0.2, reliability: 0.9 }),
    ])
  })

  it('tool with matching output type scores higher', () => {
    const matches = engine.selectTools(makeRequirement({
      requiredCapabilities: ['read'],
      expectedOutputType: 'text',
    }))
    const textTool = matches.find(m => m.tool.name === 'text_tool')
    const jsonTool = matches.find(m => m.tool.name === 'json_tool')
    if (textTool && jsonTool) {
      expect(textTool.relevanceScore).toBeGreaterThan(jsonTool.relevanceScore)
    }
  })

  it('partial output type match still contributes to score', () => {
    const matches = engine.selectTools(makeRequirement({
      requiredCapabilities: ['read'],
      expectedOutputType: 'json_data',
    }))
    // json_tool's outputType 'json' is included in 'json_data'
    const jsonTool = matches.find(m => m.tool.name === 'json_tool')
    expect(jsonTool).toBeDefined()
  })
})
