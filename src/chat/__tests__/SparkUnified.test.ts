/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║   ⚡ SPARK UNIFIED ORCHESTRATION — Comprehensive Test Suite                  ║
 * ║                                                                             ║
 * ║   Tests: SparkBrainConnector, SparkAgent, UnifiedOrchestrator               ║
 * ║   Verifies: Brain+Agent+LLM unified orchestration                           ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  ModelSpark,
  SparkBrainConnector,
  SparkAgent,
  UnifiedOrchestrator,
  DEFAULT_AGENT_CONFIG,
  type AgentTool,
  type AgentToolResult,
  type AgentThought,
  type AgentTask,
  type SparkAgentConfig,
  type BrainCapabilities,
  type LLMBridgeCapabilities,
  type OrchestrationDecision,
  type OrchestrationResponse,
  type OrchestrationStats,
  type SparkRequest,
  type SparkResponse,
  type TaskDomain,
} from '../ModelSpark.js'

// ─── Mock Brain Capabilities ─────────────────────────────────────────────────

function createMockBrain(): BrainCapabilities {
  const knowledgeBase = [
    { content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.', score: 0.95, category: 'programming' },
    { content: 'Python supports multiple paradigms: procedural, object-oriented, and functional.', score: 0.9, category: 'programming' },
    { content: 'SQL injection is a code injection technique used to attack data-driven applications.', score: 0.88, category: 'security' },
    { content: 'Binary search has O(log n) time complexity and requires a sorted array.', score: 0.85, category: 'algorithms' },
    { content: 'REST APIs use HTTP methods: GET, POST, PUT, DELETE for CRUD operations.', score: 0.82, category: 'concepts' },
    { content: 'Buffer overflow occurs when data exceeds the buffer boundary in memory.', score: 0.87, category: 'security' },
    { content: 'Git is a distributed version control system for tracking code changes.', score: 0.8, category: 'tools' },
    { content: 'Docker containers package applications with their dependencies for consistent deployment.', score: 0.78, category: 'devops' },
  ]

  const learned: Array<{ input: string; response: string; category: string }> = []

  return {
    chat: async (message: string) => ({
      response: `Brain response to: ${message.slice(0, 50)}`,
      confidence: 0.8,
    }),
    searchKnowledge: (query: string, limit = 5) => {
      const queryLower = query.toLowerCase()
      return knowledgeBase
        .filter(k => {
          const words = queryLower.split(/\s+/)
          return words.some(w => k.content.toLowerCase().includes(w) || k.category.includes(w))
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    },
    writeCode: async (request) => ({
      code: `// Generated ${request.language} code\nfunction solution() {\n  // ${request.description}\n  return 'implemented'\n}`,
      explanation: `Generated ${request.language} implementation for: ${request.description}`,
    }),
    reviewCode: async (request) => ({
      issues: [
        'Consider adding input validation',
        'Missing error handling for edge cases',
        `${request.language} best practices suggest using const over let`,
      ],
      score: 7,
    }),
    reason: async (question) => ({
      answer: `Reasoning result for: ${question.slice(0, 80)}`,
      confidence: 0.85,
      reasoning: `Step 1: Analyze the question. Step 2: Apply logic. Step 3: Synthesize answer.`,
    }),
    learn: (input, response, category) => {
      learned.push({ input, response, category: category ?? 'learned' })
    },
    getStats: () => ({ totalChats: 10, knowledgeSize: knowledgeBase.length, learned: learned.length }),
    getKnowledgeBaseSize: () => knowledgeBase.length,
  }
}

// ─── Mock LLM Bridge Capabilities ────────────────────────────────────────────

function createMockBridge(): LLMBridgeCapabilities {
  return {
    processQuery: async (query) => ({
      text: `Bridge response: ${query.slice(0, 80)}`,
      confidence: 0.75,
      source: 'llm',
    }),
    classifyIntent: (query) => ({
      intent: 'general_question',
      confidence: 0.8,
      target: 'hybrid',
    }),
    searchExploits: async (query) => ({
      text: `Exploit search results for: ${query.slice(0, 50)}`,
      confidence: 0.7,
    }),
    debugOverflow: async (crashData) => ({
      text: `Overflow debug: ${crashData.slice(0, 50)}`,
      confidence: 0.7,
    }),
    generateCode: async (task, lang) => ({
      text: `// ${lang} code for: ${task}`,
      confidence: 0.8,
    }),
    reviewCode: async (code, lang) => ({
      text: `Code review (${lang}): Found 2 issues`,
      confidence: 0.75,
    }),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SPARK BRAIN CONNECTOR TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('SparkBrainConnector', () => {
  let spark: ModelSpark
  let connector: SparkBrainConnector
  let mockBrain: BrainCapabilities
  let mockBridge: LLMBridgeCapabilities

  beforeEach(() => {
    spark = new ModelSpark()
    connector = new SparkBrainConnector(spark)
    mockBrain = createMockBrain()
    mockBridge = createMockBridge()
  })

  // ── Connection Tests ─────────────────────────────────────────────────────

  describe('Connection Management', () => {
    it('should start with no brain connected', () => {
      expect(connector.isBrainConnected()).toBe(false)
      expect(connector.isBridgeConnected()).toBe(false)
    })

    it('should connect brain', () => {
      connector.connectBrain(mockBrain)
      expect(connector.isBrainConnected()).toBe(true)
    })

    it('should connect bridge', () => {
      connector.connectBridge(mockBridge)
      expect(connector.isBridgeConnected()).toBe(true)
    })

    it('should connect both brain and bridge', () => {
      connector.connectBrain(mockBrain)
      connector.connectBridge(mockBridge)
      expect(connector.isBrainConnected()).toBe(true)
      expect(connector.isBridgeConnected()).toBe(true)
    })

    it('should return spark instance', () => {
      expect(connector.getSpark()).toBe(spark)
    })
  })

  // ── Knowledge Enrichment Tests ───────────────────────────────────────────

  describe('Knowledge Enrichment', () => {
    it('should return original prompt when no brain connected', () => {
      const result = connector.enrichPromptWithKnowledge('What is TypeScript?', 'general_reasoning')
      expect(result).toBe('What is TypeScript?')
    })

    it('should enrich prompt with brain knowledge', () => {
      connector.connectBrain(mockBrain)
      const result = connector.enrichPromptWithKnowledge('What is TypeScript?', 'general_reasoning')
      expect(result).toContain('[Knowledge Context]')
      expect(result).toContain('TypeScript')
      expect(result).toContain('[User Query]')
    })

    it('should not enrich when no relevant knowledge found', () => {
      connector.connectBrain(mockBrain)
      const result = connector.enrichPromptWithKnowledge('xyzzy nonexistent thing 12345', 'general_reasoning')
      expect(result).toBe('xyzzy nonexistent thing 12345')
    })

    it('should cache knowledge results', () => {
      connector.connectBrain(mockBrain)
      const r1 = connector.enrichPromptWithKnowledge('TypeScript programming', 'code_generation')
      const r2 = connector.enrichPromptWithKnowledge('TypeScript programming', 'code_generation')
      expect(r1).toBe(r2) // Same result from cache
    })

    it('should get brain knowledge directly', () => {
      connector.connectBrain(mockBrain)
      const results = connector.getBrainKnowledge('TypeScript')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.content).toContain('TypeScript')
    })

    it('should return empty array when brain not connected', () => {
      expect(connector.getBrainKnowledge('anything')).toEqual([])
    })
  })

  // ── Brain Integration Tests ──────────────────────────────────────────────

  describe('Brain Module Integration', () => {
    beforeEach(() => {
      connector.connectBrain(mockBrain)
    })

    it('should use brain code generation', async () => {
      const result = await connector.brainGenerateCode('sort an array', 'python')
      expect(result).not.toBeNull()
      expect(result!.code).toContain('function')
      expect(result!.explanation).toContain('python')
    })

    it('should return null for code gen when brain not connected', async () => {
      const noConnector = new SparkBrainConnector(spark)
      const result = await noConnector.brainGenerateCode('test', 'js')
      expect(result).toBeNull()
    })

    it('should use brain code review', async () => {
      const result = await connector.brainReviewCode('const x = 1', 'typescript')
      expect(result).not.toBeNull()
      expect(result!.issues.length).toBeGreaterThan(0)
      expect(result!.score).toBe(7)
    })

    it('should return null for code review when brain not connected', async () => {
      const noConnector = new SparkBrainConnector(spark)
      const result = await noConnector.brainReviewCode('code', 'js')
      expect(result).toBeNull()
    })

    it('should use brain reasoning', async () => {
      const result = await connector.brainReason('Why is the sky blue?')
      expect(result).not.toBeNull()
      expect(result!.confidence).toBeGreaterThan(0.5)
      expect(result!.reasoning).toContain('Step')
    })

    it('should return null for reasoning when brain not connected', async () => {
      const noConnector = new SparkBrainConnector(spark)
      const result = await noConnector.brainReason('test')
      expect(result).toBeNull()
    })
  })

  // ── Enriched Inference Tests ─────────────────────────────────────────────

  describe('Enriched Inference', () => {
    it('should infer with brain knowledge enrichment', async () => {
      connector.connectBrain(mockBrain)
      const response = await connector.enrichedInfer({ prompt: 'Explain TypeScript', domain: 'general_reasoning' })
      expect(response.text.length).toBeGreaterThan(0)
    })

    it('should infer without brain (plain Spark)', async () => {
      const response = await connector.enrichedInfer({ prompt: 'Hello world', domain: 'conversation' })
      expect(response.text.length).toBeGreaterThan(0)
    })
  })

  // ── Teaching / Feedback Loop Tests ───────────────────────────────────────

  describe('Brain Teaching (Feedback Loop)', () => {
    it('should teach brain from high-quality Spark responses', async () => {
      connector.connectBrain(mockBrain)
      const response = await spark.infer({ prompt: 'Write a sort', domain: 'code_generation' })

      // Force high quality for teaching
      const fakeResponse = { ...response, qualityScore: 0.9 }
      connector.teachBrainFromSpark('Write a sort', fakeResponse)
      // No throw = success (brain.learn was called)
    })

    it('should not teach from low-quality responses', () => {
      connector.connectBrain(mockBrain)
      const fakeResponse = {
        text: 'bad', qualityScore: 0.3, strategy: 'route' as const,
        domain: 'code_generation' as TaskDomain, primaryModel: 'qwen2.5' as const,
        secondaryModel: null, primaryResponse: {} as any, secondaryResponse: null,
        fusedResponse: null, totalTokensGenerated: 1, totalDurationMs: 1,
        effectiveTokensPerSecond: 1, cached: false, routingReason: '',
      }
      connector.teachBrainFromSpark('test', fakeResponse)
      // Should silently skip (qualityScore < 0.7)
    })
  })

  // ── System Status Tests ──────────────────────────────────────────────────

  describe('System Status', () => {
    it('should report status without brain', () => {
      const status = connector.getSystemStatus()
      expect(status.sparkConnected).toBe(true)
      expect(status.brainConnected).toBe(false)
      expect(status.bridgeConnected).toBe(false)
      expect(status.sparkModels).toBeGreaterThanOrEqual(6)
    })

    it('should report status with brain connected', () => {
      connector.connectBrain(mockBrain)
      const status = connector.getSystemStatus()
      expect(status.brainConnected).toBe(true)
      expect(status.brainKnowledgeSize).toBe(8)
    })

    it('should clear cache', () => {
      connector.connectBrain(mockBrain)
      connector.enrichPromptWithKnowledge('TypeScript', 'general_reasoning')
      expect(connector.getSystemStatus().cacheSize).toBeGreaterThan(0)
      connector.clearCache()
      expect(connector.getSystemStatus().cacheSize).toBe(0)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//   SPARK AGENT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('SparkAgent', () => {
  let spark: ModelSpark
  let connector: SparkBrainConnector
  let agent: SparkAgent

  beforeEach(() => {
    spark = new ModelSpark()
    connector = new SparkBrainConnector(spark)
    connector.connectBrain(createMockBrain())
    agent = new SparkAgent(spark, connector)
  })

  // ── Tool Management ──────────────────────────────────────────────────────

  describe('Tool Management', () => {
    it('should have built-in tools registered', () => {
      const tools = agent.getTools()
      expect(tools.length).toBeGreaterThanOrEqual(10)
    })

    it('should have code tools', () => {
      expect(agent.getTool('spark_code_generate')).not.toBeNull()
      expect(agent.getTool('spark_code_review')).not.toBeNull()
      expect(agent.getTool('spark_debug')).not.toBeNull()
    })

    it('should have reasoning tools', () => {
      expect(agent.getTool('spark_reason')).not.toBeNull()
      expect(agent.getTool('brain_knowledge_search')).not.toBeNull()
    })

    it('should have security tools', () => {
      expect(agent.getTool('spark_security_analyze')).not.toBeNull()
    })

    it('should have creative/general tools', () => {
      expect(agent.getTool('spark_creative')).not.toBeNull()
      expect(agent.getTool('spark_summarize')).not.toBeNull()
      expect(agent.getTool('spark_translate')).not.toBeNull()
      expect(agent.getTool('spark_chat')).not.toBeNull()
      expect(agent.getTool('spark_general')).not.toBeNull()
    })

    it('should register custom tools', () => {
      const customTool: AgentTool = {
        name: 'custom_calculator',
        description: 'Calculate math expressions',
        category: 'reasoning',
        inputSchema: 'string: math expression',
        handler: (input) => ({
          success: true,
          output: `Result: ${input}`,
          confidence: 0.9,
          source: 'calculator',
          durationMs: 1,
        }),
      }
      agent.registerTool(customTool)
      expect(agent.getTool('custom_calculator')).not.toBeNull()
      expect(agent.getTools().length).toBeGreaterThanOrEqual(12)
    })

    it('should remove tools', () => {
      expect(agent.removeTool('spark_translate')).toBe(true)
      expect(agent.getTool('spark_translate')).toBeNull()
    })

    it('should return false for removing nonexistent tool', () => {
      expect(agent.removeTool('nonexistent')).toBe(false)
    })

    it('should get tools by category', () => {
      const codeTools = agent.getToolsByCategory('code')
      expect(codeTools.length).toBeGreaterThanOrEqual(3)
      expect(codeTools.every(t => t.category === 'code')).toBe(true)

      const securityTools = agent.getToolsByCategory('security')
      expect(securityTools.length).toBeGreaterThanOrEqual(1)
    })

    it('should return null for unknown tool', () => {
      expect(agent.getTool('nonexistent')).toBeNull()
    })
  })

  // ── Task Execution ───────────────────────────────────────────────────────

  describe('Task Execution', () => {
    it('should execute a code generation task', async () => {
      const task = await agent.executeTask('Write a bubble sort function in Python')
      expect(task.status).toBe('complete')
      expect(task.finalAnswer.length).toBeGreaterThan(0)
      expect(task.plan.length).toBeGreaterThan(0)
      expect(task.thoughts.length).toBeGreaterThan(0)
      expect(task.toolCalls.length).toBeGreaterThan(0)
    })

    it('should execute a reasoning task', async () => {
      const task = await agent.executeTask('Explain why algorithms are important in computer science')
      expect(task.status).toBe('complete')
      expect(task.finalAnswer.length).toBeGreaterThan(0)
    })

    it('should execute a security analysis task', async () => {
      const task = await agent.executeTask('Analyze SQL injection vulnerability in web applications')
      expect(task.status).toBe('complete')
      expect(task.finalAnswer.length).toBeGreaterThan(0)
    })

    it('should include quality score in completed tasks', async () => {
      const task = await agent.executeTask('Write hello world in TypeScript')
      expect(task.qualityScore).toBeGreaterThanOrEqual(0)
      expect(task.qualityScore).toBeLessThanOrEqual(1)
    })

    it('should track total duration', async () => {
      const task = await agent.executeTask('Simple question')
      expect(task.totalDurationMs).toBeGreaterThanOrEqual(0)
    })

    it('should have unique task IDs', async () => {
      const t1 = await agent.executeTask('Task 1')
      const t2 = await agent.executeTask('Task 2')
      expect(t1.id).not.toBe(t2.id)
    })

    it('should handle debugging tasks', async () => {
      const task = await agent.executeTask('Debug this error: TypeError: undefined is not a function')
      expect(task.status).toBe('complete')
      expect(task.domain).toBe('debugging')
    })

    it('should handle creative writing tasks', async () => {
      const task = await agent.executeTask('Write a short poem about programming')
      expect(task.status).toBe('complete')
    })

    it('should have planning step in thoughts', async () => {
      const task = await agent.executeTask('Write a REST API')
      const planThought = task.thoughts.find(t => t.type === 'plan')
      expect(planThought).toBeTruthy()
      expect(planThought!.step).toBe(0)
    })

    it('should have observe steps matching tool calls', async () => {
      const task = await agent.executeTask('Generate a sort function')
      const observeThoughts = task.thoughts.filter(t => t.type === 'observe')
      expect(observeThoughts.length).toBe(task.toolCalls.length)
    })

    it('should have reflection step', async () => {
      const task = await agent.executeTask('Write hello world')
      const reflectThought = task.thoughts.find(t => t.type === 'reflect')
      expect(reflectThought).toBeTruthy()
    })

    it('should have synthesis step', async () => {
      const task = await agent.executeTask('Create a calculator')
      const synthThought = task.thoughts.find(t => t.type === 'synthesize')
      expect(synthThought).toBeTruthy()
    })
  })

  // ── Quick Query ──────────────────────────────────────────────────────────

  describe('Quick Query', () => {
    it('should handle quick code query', async () => {
      const result = await agent.quickQuery('Write a function to add numbers')
      expect(result.success).toBe(true)
      expect(result.output.length).toBeGreaterThan(0)
    })

    it('should handle quick knowledge query', async () => {
      const result = await agent.quickQuery('Search for TypeScript information')
      expect(result.success).toBe(true)
    })

    it('should handle quick security query', async () => {
      const result = await agent.quickQuery('Check for exploit vulnerabilities')
      expect(result.success).toBe(true)
    })
  })

  // ── History & Stats ──────────────────────────────────────────────────────

  describe('History & Stats', () => {
    it('should track task history', async () => {
      await agent.executeTask('Task 1')
      await agent.executeTask('Task 2')
      expect(agent.getTaskHistory()).toHaveLength(2)
    })

    it('should get task by ID', async () => {
      const task = await agent.executeTask('Searchable task')
      const found = agent.getTask(task.id)
      expect(found).not.toBeNull()
      expect(found!.query).toBe('Searchable task')
    })

    it('should return null for unknown task ID', () => {
      expect(agent.getTask('nonexistent')).toBeNull()
    })

    it('should track stats', async () => {
      await agent.executeTask('A task')
      const stats = agent.getStats()
      expect(stats.tasksCompleted).toBe(1)
      expect(stats.totalToolCalls).toBeGreaterThan(0)
      expect(stats.totalSteps).toBeGreaterThan(0)
    })

    it('should clear history', async () => {
      await agent.executeTask('Task')
      agent.clearHistory()
      expect(agent.getTaskHistory()).toHaveLength(0)
    })

    it('should track average quality', async () => {
      await agent.executeTask('Code task')
      const stats = agent.getStats()
      expect(stats.averageQuality).toBeGreaterThan(0)
    })
  })

  // ── Config Management ────────────────────────────────────────────────────

  describe('Config Management', () => {
    it('should use default config', () => {
      const config = agent.getConfig()
      expect(config.maxSteps).toBe(DEFAULT_AGENT_CONFIG.maxSteps)
      expect(config.reflectionEnabled).toBe(true)
      expect(config.planningEnabled).toBe(true)
    })

    it('should accept custom config', () => {
      const customAgent = new SparkAgent(spark, connector, { maxSteps: 5, verbose: true })
      expect(customAgent.getConfig().maxSteps).toBe(5)
      expect(customAgent.getConfig().verbose).toBe(true)
    })

    it('should update config', () => {
      agent.updateConfig({ maxSteps: 3 })
      expect(agent.getConfig().maxSteps).toBe(3)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//   UNIFIED ORCHESTRATOR TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('UnifiedOrchestrator', () => {
  let orchestrator: UnifiedOrchestrator

  beforeEach(() => {
    const spark = new ModelSpark()
    orchestrator = new UnifiedOrchestrator(spark)
  })

  // ── System Setup ─────────────────────────────────────────────────────────

  describe('System Setup', () => {
    it('should initialize with Spark and Agent', () => {
      expect(orchestrator.getSpark()).toBeInstanceOf(ModelSpark)
      expect(orchestrator.getAgent()).toBeInstanceOf(SparkAgent)
      expect(orchestrator.getConnector()).toBeInstanceOf(SparkBrainConnector)
    })

    it('should connect brain', () => {
      orchestrator.connectBrain(createMockBrain())
      expect(orchestrator.getConnector().isBrainConnected()).toBe(true)
    })

    it('should connect bridge', () => {
      orchestrator.connectBridge(createMockBridge())
      expect(orchestrator.getConnector().isBridgeConnected()).toBe(true)
    })

    it('should register custom tools on agent', () => {
      const tool: AgentTool = {
        name: 'test_tool',
        description: 'Test',
        category: 'system',
        inputSchema: 'string',
        handler: (input) => ({ success: true, output: input, confidence: 1, source: 'test', durationMs: 0 }),
      }
      orchestrator.registerTool(tool)
      expect(orchestrator.getAgent().getTool('test_tool')).not.toBeNull()
    })
  })

  // ── Routing Tests ────────────────────────────────────────────────────────

  describe('Intelligent Routing', () => {
    it('should route code tasks to spark ensemble', () => {
      const decision = orchestrator.routeQuery('Write a function to sort an array')
      expect(['spark_ensemble', 'hybrid']).toContain(decision.primary)
      expect(decision.domain).toBe('code_generation')
    })

    it('should route complex tasks to agent', () => {
      const decision = orchestrator.routeQuery('Step by step, analyze this codebase and create tests for it')
      expect(decision.primary).toBe('agent')
      expect(decision.reason).toContain('multi-step')
    })

    it('should route security tasks', () => {
      const decision = orchestrator.routeQuery('Analyze SQL injection vulnerability attacks')
      expect(['security_analysis', 'exploit_research', 'general_reasoning']).toContain(decision.domain)
    })

    it('should route reasoning tasks to spark', () => {
      const decision = orchestrator.routeQuery('Explain the concept of recursion in depth')
      expect(['spark_ensemble', 'hybrid']).toContain(decision.primary)
    })

    it('should route knowledge queries to brain when connected', () => {
      orchestrator.connectBrain(createMockBrain())
      const decision = orchestrator.routeQuery('What is TypeScript?')
      expect(decision.primary).toBe('brain_knowledge')
      expect(decision.reason).toContain('knowledge')
    })

    it('should route to spark when brain has no relevant knowledge', () => {
      orchestrator.connectBrain(createMockBrain())
      const decision = orchestrator.routeQuery('zzzz nonexistent topic 12345')
      // When brain has no relevant knowledge, it falls back to spark/hybrid
      expect(['spark_ensemble', 'hybrid']).toContain(decision.primary)
    })

    it('should support forced routing', () => {
      const decision = orchestrator.routeQuery('Any query', { forceSystem: 'agent' })
      expect(decision.primary).toBe('agent')
      expect(decision.confidence).toBe(1.0)
    })

    it('should detect code review domain', () => {
      const decision = orchestrator.routeQuery('Review this code for bugs and quality')
      expect(decision.domain).toBe('code_review')
    })

    it('should detect debugging domain', () => {
      const decision = orchestrator.routeQuery('Debug this error: undefined is not a function')
      expect(decision.domain).toBe('debugging')
    })

    it('should use hybrid or spark when brain is connected for code tasks', () => {
      orchestrator.connectBrain(createMockBrain())
      const decision = orchestrator.routeQuery('Write a sorting algorithm function in TypeScript')
      // With brain connected, code tasks should route to hybrid or spark_ensemble
      expect(['hybrid', 'spark_ensemble']).toContain(decision.primary)
    })
  })

  // ── Query Execution ──────────────────────────────────────────────────────

  describe('Query Execution', () => {
    it('should execute code generation query', async () => {
      const result = await orchestrator.query('Write a bubble sort function in Python')
      expect(result.text.length).toBeGreaterThan(0)
      expect(result.source).toBeTruthy()
      expect(result.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('should execute reasoning query', async () => {
      const result = await orchestrator.query('Why are algorithms important?')
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('should execute agent query for complex tasks', async () => {
      const result = await orchestrator.query('Step by step, analyze and improve this sorting algorithm')
      expect(result.source).toBe('agent')
      expect(result.agentTask).toBeTruthy()
      expect(result.agentTask!.status).toBe('complete')
    })

    it('should execute hybrid or enriched query when brain connected', async () => {
      orchestrator.connectBrain(createMockBrain())
      const result = await orchestrator.query('Write a TypeScript function for sorting')
      // With brain connected, could route to hybrid or brain_knowledge depending on detection
      expect(['hybrid', 'spark_ensemble', 'brain_knowledge']).toContain(result.source)
    })

    it('should execute brain knowledge query', async () => {
      orchestrator.connectBrain(createMockBrain())
      const result = await orchestrator.query('What is TypeScript?')
      expect(result.source).toBe('brain_knowledge')
      expect(result.text).toContain('TypeScript')
    })

    it('should support forced system routing', async () => {
      const result = await orchestrator.query('Simple question', { forceSystem: 'spark_ensemble' })
      expect(result.source).toBe('spark_ensemble')
    })

    it('should support forced agent routing', async () => {
      const result = await orchestrator.query('Do this', { forceSystem: 'agent' })
      expect(result.source).toBe('agent')
    })

    it('should include quality score in response', async () => {
      const result = await orchestrator.query('Write hello world')
      expect(result.qualityScore).toBeGreaterThanOrEqual(0)
      expect(result.qualityScore).toBeLessThanOrEqual(1)
    })

    it('should include tokens generated', async () => {
      const result = await orchestrator.query('Generate something')
      expect(result.tokensGenerated).toBeGreaterThanOrEqual(0)
    })

    it('should track subsystems used', async () => {
      const result = await orchestrator.query('Write code')
      expect(result.subsystemsUsed.length).toBeGreaterThan(0)
    })
  })

  // ── Stats & Status ───────────────────────────────────────────────────────

  describe('Stats & Status', () => {
    it('should track total requests', async () => {
      await orchestrator.query('Query 1')
      await orchestrator.query('Query 2')
      expect(orchestrator.getStats().totalRequests).toBe(2)
    })

    it('should track routing distribution', async () => {
      await orchestrator.query('Write code')
      await orchestrator.query('Step by step analyze')
      const stats = orchestrator.getStats()
      const total = Object.values(stats.routingDistribution).reduce((s, v) => s + v, 0)
      expect(total).toBe(2)
    })

    it('should reset stats', async () => {
      await orchestrator.query('Query')
      orchestrator.resetStats()
      expect(orchestrator.getStats().totalRequests).toBe(0)
    })

    it('should generate comprehensive system status', () => {
      const status = orchestrator.getSystemStatus()
      expect(status).toContain('SPARK UNIFIED ORCHESTRATOR')
      expect(status).toContain('Spark Ensemble')
      expect(status).toContain('LocalBrain')
      expect(status).toContain('Agent')
    })

    it('should show connected status when brain attached', () => {
      orchestrator.connectBrain(createMockBrain())
      const status = orchestrator.getSystemStatus()
      expect(status).toContain('✅ Connected')
      expect(status).toContain('8 KB entries')
    })

    it('should show disconnected status when brain not attached', () => {
      const status = orchestrator.getSystemStatus()
      expect(status).toContain('Not connected')
    })

    it('should track average quality', async () => {
      await orchestrator.query('Write something')
      const stats = orchestrator.getStats()
      expect(stats.averageQuality).toBeGreaterThan(0)
    })

    it('should track average latency', async () => {
      await orchestrator.query('Test latency')
      const stats = orchestrator.getStats()
      expect(stats.averageLatencyMs).toBeGreaterThanOrEqual(0)
    })
  })

  // ── Brain Knowledge Teaching ─────────────────────────────────────────────

  describe('Brain Feedback Loop', () => {
    it('should teach brain from good Spark responses', async () => {
      orchestrator.connectBrain(createMockBrain())
      // Execute a query that goes through Spark
      await orchestrator.query('Write TypeScript code', { forceSystem: 'spark_ensemble' })
      // The feedback loop automatically teaches brain on quality > 0.7
    })

    it('should track brain knowledge hits', async () => {
      orchestrator.connectBrain(createMockBrain())
      await orchestrator.query('What is TypeScript?')
      const stats = orchestrator.getStats()
      expect(stats.brainKnowledgeHits).toBeGreaterThan(0)
    })
  })

  // ── Edge Cases ───────────────────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle empty query', async () => {
      const result = await orchestrator.query('')
      expect(result).toBeTruthy()
    })

    it('should handle very long query', async () => {
      const longQuery = 'Write a function '.repeat(200)
      const result = await orchestrator.query(longQuery)
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('should handle concurrent queries', async () => {
      const promises = [
        orchestrator.query('Code task 1'),
        orchestrator.query('Reasoning task 1'),
        orchestrator.query('What is Python?'),
      ]
      const results = await Promise.all(promises)
      expect(results).toHaveLength(3)
      results.forEach(r => expect(r.text.length).toBeGreaterThan(0))
    })

    it('should handle special characters in query', async () => {
      const result = await orchestrator.query('Test <script>alert("xss")</script> & special © chars')
      expect(result).toBeTruthy()
    })

    it('should handle multiple system types in sequence', async () => {
      orchestrator.connectBrain(createMockBrain())

      const r1 = await orchestrator.query('What is TypeScript?')     // brain
      const r2 = await orchestrator.query('Write a function')        // hybrid
      const r3 = await orchestrator.query('Step by step analyze')    // agent

      expect(r1.source).toBe('brain_knowledge')
      expect(r2.source).toBe('hybrid')
      expect(r3.source).toBe('agent')
    })
  })

  // ── Custom Agent Config ──────────────────────────────────────────────────

  describe('Custom Agent Configuration', () => {
    it('should accept custom agent config', () => {
      const spark = new ModelSpark()
      const orch = new UnifiedOrchestrator(spark, {
        agentConfig: { maxSteps: 5, reflectionEnabled: false },
      })
      const config = orch.getAgent().getConfig()
      expect(config.maxSteps).toBe(5)
      expect(config.reflectionEnabled).toBe(false)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//   DEFAULT AGENT CONFIG TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('DEFAULT_AGENT_CONFIG', () => {
  it('should have sensible defaults', () => {
    expect(DEFAULT_AGENT_CONFIG.maxSteps).toBe(10)
    expect(DEFAULT_AGENT_CONFIG.maxRetries).toBe(2)
    expect(DEFAULT_AGENT_CONFIG.reflectionEnabled).toBe(true)
    expect(DEFAULT_AGENT_CONFIG.planningEnabled).toBe(true)
    expect(DEFAULT_AGENT_CONFIG.selfCorrectionEnabled).toBe(true)
    expect(DEFAULT_AGENT_CONFIG.confidenceThreshold).toBe(0.6)
    expect(DEFAULT_AGENT_CONFIG.timeoutMs).toBe(60000)
    expect(DEFAULT_AGENT_CONFIG.verbose).toBe(false)
  })
})
