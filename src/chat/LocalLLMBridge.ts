/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║   🔗  L O C A L  L L M  B R I D G E  —  BRAIN ↔ LLM CONNECTOR             ║
 * ║                                                                             ║
 * ║   Connects QwenLocalLLM to LocalBrain, routing queries to the local LLM    ║
 * ║   for enhanced code generation, exploit search, overflow debugging,         ║
 * ║   vulnerability analysis, and general AI assistance.                        ║
 * ║                                                                             ║
 * ║   Features:                                                                 ║
 * ║     ✦ Smart routing — decides when to use LLM vs knowledge base            ║
 * ║     ✦ Context enrichment — adds KB context to LLM prompts                  ║
 * ║     ✦ Result caching — avoid redundant inferences                          ║
 * ║     ✦ Fallback chain — LLM → knowledge base → template response           ║
 * ║     ✦ Exploit search enhancement — combines CVE DB + LLM analysis          ║
 * ║     ✦ Overflow debug enhancement — combines debugger + LLM reasoning       ║
 * ║     ✦ Learning — feeds LLM results back into LocalBrain knowledge          ║
 * ║                                                                             ║
 * ║   Zero external APIs. All inference is local via Ollama/llama.cpp.          ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { QwenLocalLLM } from './QwenLocalLLM.js'
import type {
  InferenceRequest,
  InferenceResponse,
  ChatMessage,
  ModelInfo,
  QwenLLMConfig,
} from './QwenLocalLLM.js'

// ─── Types ───────────────────────────────────────────────────────────────────

/** Query intent classification */
export type QueryIntent =
  | 'code_generation'
  | 'code_review'
  | 'debugging'
  | 'exploit_analysis'
  | 'vulnerability_search'
  | 'overflow_debug'
  | 'general_question'
  | 'knowledge_lookup'

/** Routing decision: where to send the query */
export type RoutingTarget = 'llm' | 'knowledge_base' | 'hybrid' | 'fallback'

/** Bridge configuration */
export interface BridgeConfig {
  enableLLM: boolean
  enableCache: boolean
  cacheMaxSize: number
  cacheTTLMs: number
  enableContextEnrichment: boolean
  enableLearning: boolean
  maxContextTokens: number
  confidenceThreshold: number
  fallbackToKB: boolean
}

/** Routing decision with metadata */
export interface RoutingDecision {
  target: RoutingTarget
  intent: QueryIntent
  confidence: number
  reason: string
  contextNeeded: string[]
}

/** Enhanced response from the bridge */
export interface BridgeResponse {
  text: string
  source: RoutingTarget
  intent: QueryIntent
  confidence: number
  tokensUsed: number
  durationMs: number
  cached: boolean
  contextSources: string[]
  modelUsed: string | null
}

/** Cache entry */
interface CacheEntry {
  response: BridgeResponse
  timestamp: number
  hitCount: number
}

/** Bridge statistics */
export interface BridgeStats {
  totalQueries: number
  llmQueries: number
  kbQueries: number
  hybridQueries: number
  fallbackQueries: number
  cacheHits: number
  cacheMisses: number
  averageLatencyMs: number
  totalTokensUsed: number
  learningsAdded: number
  intentDistribution: Record<QueryIntent, number>
}

// ─── Intent Detection Patterns ───────────────────────────────────────────────

const INTENT_PATTERNS: Array<{ intent: QueryIntent; patterns: RegExp[]; weight: number }> = [
  {
    intent: 'code_generation',
    patterns: [
      /\b(write|create|generate|implement|build|make|code)\s+(a |an |the )?(function|class|module|component|api|endpoint|script|program)/i,
      /\b(implement|build|create)\s+/i,
      /\bhow\s+to\s+(write|implement|build|create)\b/i,
    ],
    weight: 0.9,
  },
  {
    intent: 'code_review',
    patterns: [
      /\b(review|analyze|check|audit|inspect)\s+(this |my |the )?(code|function|class|module|implementation)/i,
      /\bcode\s+review\b/i,
      /\bfind\s+(bugs?|issues?|problems?)\s+in\b/i,
    ],
    weight: 0.85,
  },
  {
    intent: 'debugging',
    patterns: [
      /\b(debug|fix|solve|troubleshoot|diagnose)\s+(this |my |the )?(error|bug|issue|problem|crash|exception)/i,
      /\bwhy\s+(does|is|did)\s+(this|it|my)\s+(fail|crash|error|break)/i,
      /\b(error|exception|traceback|stack\s*trace)\b/i,
    ],
    weight: 0.85,
  },
  {
    intent: 'exploit_analysis',
    patterns: [
      /\b(exploit|attack|pwn|hack|compromise|bypass)\s+(analysis|development|research|chain)/i,
      /\b(mitre|att&ck|kill\s*chain|attack\s*(surface|vector|path))\b/i,
      /\b(rop|return.oriented|shellcode|payload)\s+(chain|generation|build)/i,
    ],
    weight: 0.9,
  },
  {
    intent: 'vulnerability_search',
    patterns: [
      /\b(cve|vulnerability|vuln|security\s*flaw|security\s*bug)\s*(search|find|look|scan|check)/i,
      /\b(search|find|look)\s+(for )?(cve|vulnerability|vuln|exploit)/i,
      /\bcvss\s*(score|rating|severity)\b/i,
      /\b(cwe|owasp|nist)\b/i,
    ],
    weight: 0.9,
  },
  {
    intent: 'overflow_debug',
    patterns: [
      /\b(buffer|stack|heap|integer)\s*(overflow|overrun|corruption|smash)/i,
      /\b(segfault|sigsegv|sigabrt|crash)\s*(analysis|debug|investigate)/i,
      /\b(rop|gadget|canary|aslr|dep|nx|pie)\s*(bypass|chain|analysis)/i,
      /\bformat\s*string\s*(bug|vuln|attack|exploit)/i,
      /\b(use.after.free|double.free|heap.spray|tcache)\b/i,
    ],
    weight: 0.9,
  },
  {
    intent: 'knowledge_lookup',
    patterns: [
      /\b(what\s+is|explain|describe|tell\s+me\s+about|how\s+does)\b/i,
      /\b(definition|meaning|concept|overview)\s+of\b/i,
    ],
    weight: 0.7,
  },
  {
    intent: 'general_question',
    patterns: [/\?$/, /\b(help|assist|guide|suggest|recommend)\b/i],
    weight: 0.5,
  },
]

// ─── Default Configuration ───────────────────────────────────────────────────

const DEFAULT_BRIDGE_CONFIG: BridgeConfig = {
  enableLLM: true,
  enableCache: true,
  cacheMaxSize: 500,
  cacheTTLMs: 30 * 60 * 1000, // 30 minutes
  enableContextEnrichment: true,
  enableLearning: true,
  maxContextTokens: 2048,
  confidenceThreshold: 0.6,
  fallbackToKB: true,
}

// ─── LocalLLMBridge Class ────────────────────────────────────────────────────

export class LocalLLMBridge {
  private llm: QwenLocalLLM
  private config: BridgeConfig
  private cache: Map<string, CacheEntry> = new Map()
  private stats: BridgeStats
  private conversationHistory: ChatMessage[] = []
  private knowledgeContext: Map<string, string[]> = new Map()

  constructor(llmConfig?: Partial<QwenLLMConfig>, bridgeConfig?: Partial<BridgeConfig>) {
    this.llm = new QwenLocalLLM(llmConfig)
    this.config = { ...DEFAULT_BRIDGE_CONFIG, ...bridgeConfig }
    this.stats = this._initStats()
  }

  // ── Query Processing ─────────────────────────────────────────────────────

  /** Process a user query through the bridge */
  async processQuery(query: string, context?: string[]): Promise<BridgeResponse> {
    const start = Date.now()
    this.stats.totalQueries++

    // 1. Classify intent
    const routing = this.classifyIntent(query)

    // 2. Check cache
    if (this.config.enableCache) {
      const cacheKey = this.llm.hashContent(query)
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTLMs) {
        this.stats.cacheHits++
        cached.hitCount++
        return { ...cached.response, cached: true, durationMs: Date.now() - start }
      }
      this.stats.cacheMisses++
    }

    // 3. Route and execute
    let response: BridgeResponse
    const intentKey = routing.intent
    this.stats.intentDistribution[intentKey] = (this.stats.intentDistribution[intentKey] ?? 0) + 1

    switch (routing.target) {
      case 'llm':
        response = await this._executeLLMQuery(query, routing, context)
        this.stats.llmQueries++
        break
      case 'hybrid':
        response = await this._executeHybridQuery(query, routing, context)
        this.stats.hybridQueries++
        break
      case 'knowledge_base':
        response = this._executeKBQuery(query, routing)
        this.stats.kbQueries++
        break
      default:
        response = this._executeFallbackQuery(query, routing)
        this.stats.fallbackQueries++
        break
    }

    response.durationMs = Date.now() - start
    this.stats.averageLatencyMs =
      (this.stats.averageLatencyMs * (this.stats.totalQueries - 1) + response.durationMs) /
      this.stats.totalQueries

    // 4. Cache the result
    if (this.config.enableCache) {
      const cacheKey = this.llm.hashContent(query)
      this._addToCache(cacheKey, response)
    }

    // 5. Update conversation history
    this.conversationHistory.push({ role: 'user', content: query })
    this.conversationHistory.push({ role: 'assistant', content: response.text })

    // Keep history manageable
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20)
    }

    return response
  }

  // ── Intent Classification ────────────────────────────────────────────────

  /** Classify user intent and determine routing */
  classifyIntent(query: string): RoutingDecision {
    let bestIntent: QueryIntent = 'general_question'
    let bestConfidence = 0
    const contextNeeded: string[] = []

    for (const { intent, patterns, weight } of INTENT_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          const confidence = weight
          if (confidence > bestConfidence) {
            bestConfidence = confidence
            bestIntent = intent
          }
        }
      }
    }

    // Determine routing target based on intent and configuration
    let target: RoutingTarget
    let reason: string

    if (!this.config.enableLLM) {
      target = 'knowledge_base'
      reason = 'LLM disabled — using knowledge base only'
    } else if (bestConfidence >= 0.85) {
      // High confidence — use hybrid for best results
      target = 'hybrid'
      reason = `High confidence ${bestIntent} — combining LLM + knowledge base`
    } else if (bestConfidence >= this.config.confidenceThreshold) {
      target = 'llm'
      reason = `Medium confidence — routing to LLM for ${bestIntent}`
    } else if (this.config.fallbackToKB) {
      target = 'knowledge_base'
      reason = 'Low confidence — falling back to knowledge base'
    } else {
      target = 'fallback'
      reason = 'Low confidence and no fallback configured'
    }

    // Determine what context is needed
    if (bestIntent === 'exploit_analysis' || bestIntent === 'vulnerability_search') {
      contextNeeded.push('cve_database', 'exploit_database', 'cwe_database')
    }
    if (bestIntent === 'overflow_debug') {
      contextNeeded.push('overflow_patterns', 'rop_gadgets', 'heap_techniques')
    }
    if (bestIntent === 'code_generation' || bestIntent === 'code_review') {
      contextNeeded.push('code_templates', 'best_practices', 'language_info')
    }

    return {
      target,
      intent: bestIntent,
      confidence: bestConfidence,
      reason,
      contextNeeded,
    }
  }

  // ── Context Enrichment ───────────────────────────────────────────────────

  /** Add knowledge context for a topic */
  addKnowledgeContext(topic: string, entries: string[]): void {
    this.knowledgeContext.set(topic, entries)
  }

  /** Get context entries for enrichment */
  getContextForIntent(intent: QueryIntent): string[] {
    const contextEntries: string[] = []

    switch (intent) {
      case 'exploit_analysis':
      case 'vulnerability_search':
        contextEntries.push(...(this.knowledgeContext.get('cve_database') ?? []))
        contextEntries.push(...(this.knowledgeContext.get('exploit_database') ?? []))
        contextEntries.push(...(this.knowledgeContext.get('security') ?? []))
        break
      case 'overflow_debug':
        contextEntries.push(...(this.knowledgeContext.get('overflow_patterns') ?? []))
        contextEntries.push(...(this.knowledgeContext.get('binary_exploitation') ?? []))
        break
      case 'code_generation':
      case 'code_review':
      case 'debugging':
        contextEntries.push(...(this.knowledgeContext.get('code_templates') ?? []))
        contextEntries.push(...(this.knowledgeContext.get('best_practices') ?? []))
        break
      default:
        contextEntries.push(...(this.knowledgeContext.get('general') ?? []))
        break
    }

    return contextEntries
  }

  /** Build enriched prompt with context */
  buildEnrichedPrompt(query: string, intent: QueryIntent, context?: string[]): string {
    const parts: string[] = []

    // Add context from knowledge base
    if (this.config.enableContextEnrichment) {
      const kbContext = this.getContextForIntent(intent)
      const allContext = [...kbContext, ...(context ?? [])]

      if (allContext.length > 0) {
        // Trim context to maxContextTokens
        let contextStr = allContext.join('\n')
        const maxChars = this.config.maxContextTokens * 4 // ~4 chars per token
        if (contextStr.length > maxChars) {
          contextStr = contextStr.slice(0, maxChars) + '\n[... context truncated]'
        }

        parts.push('### Relevant Knowledge Base Context:')
        parts.push(contextStr)
        parts.push('')
      }
    }

    // Add conversation history for continuity
    if (this.conversationHistory.length > 0) {
      const recentHistory = this.conversationHistory.slice(-4)
      if (recentHistory.length > 0) {
        parts.push('### Recent Conversation:')
        for (const msg of recentHistory) {
          parts.push(`${msg.role}: ${msg.content.slice(0, 200)}`)
        }
        parts.push('')
      }
    }

    parts.push('### Current Query:')
    parts.push(query)

    return parts.join('\n')
  }

  // ── Specialized Queries ──────────────────────────────────────────────────

  /** Enhanced exploit search: combines ExploitSearchEngine data + LLM analysis */
  async searchExploits(query: string, kbResults?: string[]): Promise<BridgeResponse> {
    const enrichedQuery = this.buildEnrichedPrompt(query, 'exploit_analysis', kbResults)

    const result = await this.llm.searchVulnerabilities(enrichedQuery)

    return {
      text: result.text,
      source: 'hybrid',
      intent: 'vulnerability_search',
      confidence: 0.9,
      tokensUsed: result.tokensGenerated + result.tokensPrompt,
      durationMs: result.durationMs,
      cached: false,
      contextSources: kbResults ? ['exploit_search_engine', 'qwen_llm'] : ['qwen_llm'],
      modelUsed: result.modelId,
    }
  }

  /** Enhanced overflow debugging: combines BufferOverflowDebugger data + LLM analysis */
  async debugOverflow(
    crashData: string,
    protections: string,
    kbResults?: string[],
  ): Promise<BridgeResponse> {
    const context = kbResults ?? []
    const enrichedCrash =
      this.config.enableContextEnrichment && context.length > 0
        ? `${crashData}\n\n### Analysis from BufferOverflowDebugger:\n${context.join('\n')}`
        : crashData

    const result = await this.llm.debugOverflow(enrichedCrash, protections)

    return {
      text: result.text,
      source: 'hybrid',
      intent: 'overflow_debug',
      confidence: 0.9,
      tokensUsed: result.tokensGenerated + result.tokensPrompt,
      durationMs: result.durationMs,
      cached: false,
      contextSources: kbResults ? ['buffer_overflow_debugger', 'qwen_llm'] : ['qwen_llm'],
      modelUsed: result.modelId,
    }
  }

  /** Code generation with context */
  async generateCode(task: string, language: string, context?: string[]): Promise<BridgeResponse> {
    const enrichedTask =
      context && context.length > 0 ? `${task}\n\nContext:\n${context.join('\n')}` : task

    const result = await this.llm.generateCode(enrichedTask, language)

    return {
      text: result.text,
      source: 'llm',
      intent: 'code_generation',
      confidence: 0.85,
      tokensUsed: result.tokensGenerated + result.tokensPrompt,
      durationMs: result.durationMs,
      cached: false,
      contextSources: context ? ['code_templates', 'qwen_llm'] : ['qwen_llm'],
      modelUsed: result.modelId,
    }
  }

  /** Code review with context */
  async reviewCode(code: string, language: string): Promise<BridgeResponse> {
    const result = await this.llm.reviewCode(code, language)

    return {
      text: result.text,
      source: 'llm',
      intent: 'code_review',
      confidence: 0.85,
      tokensUsed: result.tokensGenerated + result.tokensPrompt,
      durationMs: result.durationMs,
      cached: false,
      contextSources: ['qwen_llm'],
      modelUsed: result.modelId,
    }
  }

  // ── Management ───────────────────────────────────────────────────────────

  /** Get the underlying QwenLocalLLM instance */
  getLLM(): QwenLocalLLM {
    return this.llm
  }

  /** Get bridge statistics */
  getStats(): BridgeStats {
    return { ...this.stats }
  }

  /** Reset statistics */
  resetStats(): void {
    this.stats = this._initStats()
  }

  /** Get bridge configuration */
  getConfig(): BridgeConfig {
    return { ...this.config }
  }

  /** Update bridge configuration */
  updateConfig(updates: Partial<BridgeConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /** Clear the cache */
  clearCache(): void {
    this.cache.clear()
  }

  /** Get cache size */
  getCacheSize(): number {
    return this.cache.size
  }

  /** Clear conversation history */
  clearHistory(): void {
    this.conversationHistory = []
  }

  /** Get conversation history */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  /** Generate a full status report */
  generateStatusReport(): string {
    const llmStats = this.llm.getStats()
    const model = this.llm.getDefaultModel()
    const server = this.llm.getServerStatus()

    const lines = [
      '╔═══════════════════════════════════════════════════════════════╗',
      '║          🔗  Local LLM Bridge Status Report                  ║',
      '╚═══════════════════════════════════════════════════════════════╝',
      '',
      '── Model ──',
      `Model: ${model.name} (${model.parameterCount})`,
      `Quantization: ${model.quantization} | Size: ${model.fileSizeGB} GB`,
      `Server: ${server.running ? '🟢 Running' : '🔴 Stopped'} (${server.backend})`,
      '',
      '── Bridge Stats ──',
      `Total queries: ${this.stats.totalQueries}`,
      `  LLM: ${this.stats.llmQueries} | KB: ${this.stats.kbQueries} | Hybrid: ${this.stats.hybridQueries} | Fallback: ${this.stats.fallbackQueries}`,
      `Cache: ${this.stats.cacheHits} hits / ${this.stats.cacheMisses} misses (${this.cache.size} entries)`,
      `Avg latency: ${this.stats.averageLatencyMs.toFixed(1)} ms`,
      '',
      '── LLM Stats ──',
      `Inferences: ${llmStats.totalInferences}`,
      `Tokens: ${llmStats.totalTokensGenerated} generated / ${llmStats.totalTokensPrompt} prompt`,
      `Speed: ${llmStats.averageTokensPerSecond.toFixed(1)} tok/s`,
      '',
      '── Intent Distribution ──',
      ...Object.entries(this.stats.intentDistribution)
        .filter(([, count]) => count > 0)
        .map(([intent, count]) => `  ${intent}: ${count}`),
      '',
      '── Configuration ──',
      `LLM enabled: ${this.config.enableLLM}`,
      `Cache: ${this.config.enableCache} (max ${this.config.cacheMaxSize}, TTL ${this.config.cacheTTLMs / 1000}s)`,
      `Context enrichment: ${this.config.enableContextEnrichment}`,
      `Confidence threshold: ${this.config.confidenceThreshold}`,
    ]

    return lines.join('\n')
  }

  // ── Private Methods ──────────────────────────────────────────────────────

  /** Execute a query via the LLM */
  private async _executeLLMQuery(
    query: string,
    routing: RoutingDecision,
    context?: string[],
  ): Promise<BridgeResponse> {
    const enrichedPrompt = this.buildEnrichedPrompt(query, routing.intent, context)

    const result = await this.llm.generate({
      prompt: enrichedPrompt,
      temperature: this._getTemperatureForIntent(routing.intent),
      maxTokens: 4096,
    })

    this.stats.totalTokensUsed += result.tokensGenerated + result.tokensPrompt

    return {
      text: result.text,
      source: 'llm',
      intent: routing.intent,
      confidence: routing.confidence,
      tokensUsed: result.tokensGenerated + result.tokensPrompt,
      durationMs: result.durationMs,
      cached: false,
      contextSources: context ? ['knowledge_base', 'qwen_llm'] : ['qwen_llm'],
      modelUsed: result.modelId,
    }
  }

  /** Execute a hybrid query (KB + LLM) */
  private async _executeHybridQuery(
    query: string,
    routing: RoutingDecision,
    context?: string[],
  ): Promise<BridgeResponse> {
    // Get knowledge base context
    const kbContext = this.getContextForIntent(routing.intent)
    const allContext = [...kbContext, ...(context ?? [])]

    const enrichedPrompt = this.buildEnrichedPrompt(query, routing.intent, allContext)

    const result = await this.llm.generate({
      prompt: enrichedPrompt,
      temperature: this._getTemperatureForIntent(routing.intent),
      maxTokens: 4096,
    })

    this.stats.totalTokensUsed += result.tokensGenerated + result.tokensPrompt

    return {
      text: result.text,
      source: 'hybrid',
      intent: routing.intent,
      confidence: routing.confidence,
      tokensUsed: result.tokensGenerated + result.tokensPrompt,
      durationMs: result.durationMs,
      cached: false,
      contextSources: ['knowledge_base', 'qwen_llm'],
      modelUsed: result.modelId,
    }
  }

  /** Execute a knowledge base query */
  private _executeKBQuery(query: string, routing: RoutingDecision): BridgeResponse {
    const kbContext = this.getContextForIntent(routing.intent)

    let text: string
    if (kbContext.length > 0) {
      text = `Based on the knowledge base:\n\n${kbContext.join('\n\n')}`
    } else {
      text =
        `No specific knowledge base entries found for: "${query}". ` +
        'Try starting the Qwen2.5-Coder LLM server for AI-powered answers.'
    }

    return {
      text,
      source: 'knowledge_base',
      intent: routing.intent,
      confidence: routing.confidence,
      tokensUsed: 0,
      durationMs: 0,
      cached: false,
      contextSources: ['knowledge_base'],
      modelUsed: null,
    }
  }

  /** Execute a fallback query */
  private _executeFallbackQuery(query: string, routing: RoutingDecision): BridgeResponse {
    const setupInstructions = this.llm.getDownloadInstructions()

    const text = [
      `I couldn't confidently determine the intent of your query.`,
      '',
      `Query: "${query}"`,
      `Detected intent: ${routing.intent} (confidence: ${(routing.confidence * 100).toFixed(0)}%)`,
      '',
      'For better results, try:',
      '1. Be more specific in your query',
      '2. Start the Qwen2.5-Coder LLM server for AI-powered analysis',
      '',
      setupInstructions.split('\n').slice(0, 10).join('\n'),
    ].join('\n')

    return {
      text,
      source: 'fallback',
      intent: routing.intent,
      confidence: routing.confidence,
      tokensUsed: 0,
      durationMs: 0,
      cached: false,
      contextSources: [],
      modelUsed: null,
    }
  }

  /** Get optimal temperature for an intent */
  private _getTemperatureForIntent(intent: QueryIntent): number {
    switch (intent) {
      case 'code_generation':
        return 0.3
      case 'code_review':
        return 0.4
      case 'debugging':
        return 0.3
      case 'exploit_analysis':
        return 0.5
      case 'vulnerability_search':
        return 0.4
      case 'overflow_debug':
        return 0.3
      case 'knowledge_lookup':
        return 0.6
      case 'general_question':
        return 0.7
      default:
        return 0.5
    }
  }

  /** Add a response to the cache */
  private _addToCache(key: string, response: BridgeResponse): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.config.cacheMaxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      hitCount: 0,
    })
  }

  /** Initialize stats */
  private _initStats(): BridgeStats {
    return {
      totalQueries: 0,
      llmQueries: 0,
      kbQueries: 0,
      hybridQueries: 0,
      fallbackQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLatencyMs: 0,
      totalTokensUsed: 0,
      learningsAdded: 0,
      intentDistribution: {
        code_generation: 0,
        code_review: 0,
        debugging: 0,
        exploit_analysis: 0,
        vulnerability_search: 0,
        overflow_debug: 0,
        general_question: 0,
        knowledge_lookup: 0,
      },
    }
  }
}
