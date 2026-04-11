/**
 * 🤖 LLMProvider — Unified LLM abstraction with routing, fallback chains, and provider management
 *
 * Features:
 * - Provider registry with factory-based registration
 * - Intelligent request routing (model, capabilities, cost)
 * - Fallback chains with automatic failover
 * - Load balancing (round-robin, least-latency, cost-optimized, random)
 * - Provider health tracking and circuit breaking
 * - Request/response middleware pipeline
 * - Token estimation and cost calculation
 * - Built-in provider factories (Claude, OpenAI, Local, Mock)
 * - Streaming support with typed chunks
 * - Embedding support for vector workflows
 *
 * Zero external dependencies.
 */

// ── Types ──

export interface LLMProviderConfig {
  /** API key for authentication */
  apiKey?: string
  /** Base URL for the provider API */
  baseUrl?: string
  /** Request timeout in ms (default: 30000) */
  timeout?: number
  /** Max retry attempts (default: 3) */
  maxRetries?: number
}

export interface LLMRequest {
  /** User prompt / messages */
  prompt: string
  /** System instruction */
  system?: string
  /** Sampling temperature (0–2) */
  temperature?: number
  /** Max tokens to generate */
  maxTokens?: number
  /** Stop sequences */
  stopSequences?: string[]
  /** Tool definitions for function calling */
  tools?: LLMTool[]
}

export interface LLMTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface LLMResponse {
  /** Generated text */
  text: string
  /** Token usage breakdown */
  usage: { promptTokens: number; completionTokens: number }
  /** Model that produced the response */
  model: string
  /** Reason generation stopped */
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error'
  /** Tool calls requested by the model */
  toolCalls?: LLMToolCall[]
}

export interface LLMToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface LLMStreamChunk {
  /** Chunk type */
  type: 'text' | 'tool_call' | 'done' | 'error'
  /** Full accumulated content so far */
  content: string
  /** Incremental delta for this chunk */
  delta: string
}

export interface EmbeddingRequest {
  /** Texts to embed */
  inputs: string[]
  /** Model to use for embeddings */
  model?: string
}

export interface EmbeddingResponse {
  /** Resulting embedding vectors */
  embeddings: number[][]
  /** Model that produced the embeddings */
  model: string
  /** Token usage */
  usage: { promptTokens: number }
}

export interface ProviderCapabilities {
  streaming: boolean
  tools: boolean
  vision: boolean
  embeddings: boolean
  jsonMode: boolean
}

export interface LLMProviderStats {
  /** Total requests sent */
  requestCount: number
  /** Total errors encountered */
  errorCount: number
  /** Average latency in ms */
  avgLatencyMs: number
  /** Total prompt tokens consumed */
  totalPromptTokens: number
  /** Total completion tokens consumed */
  totalCompletionTokens: number
}

/** A single LLM provider implementation */
export interface LLMProvider {
  /** Provider display name */
  readonly name: string
  /** Default model identifier */
  readonly model: string
  /** Default max tokens */
  readonly maxTokens: number
  /** Provider capabilities */
  readonly capabilities: ProviderCapabilities
  /** Generate a completion */
  generate(request: LLMRequest): Promise<LLMResponse>
  /** Stream a completion chunk-by-chunk */
  stream(request: LLMRequest): AsyncIterable<LLMStreamChunk>
  /** Create embeddings */
  embed(request: EmbeddingRequest): Promise<EmbeddingResponse>
}

// ── Load balancing ──

export type BalancingStrategy = 'round-robin' | 'least-latency' | 'cost-optimized' | 'random'

export interface RouterConfig {
  /** Default provider name */
  defaultProvider?: string
  /** Ordered fallback chain of provider names */
  fallbackChain?: string[]
  /** Load balancing strategy (default: 'round-robin') */
  balancingStrategy?: BalancingStrategy
  /** Max consecutive failures before marking a provider unhealthy (default: 3) */
  maxFailures?: number
  /** Cooldown in ms before retrying an unhealthy provider (default: 60000) */
  healthCooldownMs?: number
}

export type RouterMiddleware = (
  request: LLMRequest,
  response: LLMResponse | null,
  next: () => Promise<LLMResponse>,
) => Promise<LLMResponse>

// ── Provider health tracking ──

interface ProviderHealth {
  healthy: boolean
  consecutiveFailures: number
  lastFailure: number
  totalLatency: number
  requestCount: number
  errorCount: number
  totalPromptTokens: number
  totalCompletionTokens: number
}

// ── Token estimation helpers ──

const CHARS_PER_TOKEN = 4

// ── TokenEstimator ──

export class TokenEstimator {
  /**
   * Estimate the number of tokens in a text string.
   * Uses a character-based heuristic (~4 chars per token).
   */
  estimateTokens(text: string): number {
    if (!text) return 0
    return Math.ceil(text.length / CHARS_PER_TOKEN)
  }

  /**
   * Estimate the cost of a request for a given provider.
   * Returns cost in USD based on rough per-token pricing tiers.
   */
  estimateCost(request: LLMRequest, provider: LLMProvider): number {
    const promptTokens =
      this.estimateTokens(request.prompt) + this.estimateTokens(request.system ?? '')
    const completionTokens = request.maxTokens ?? provider.maxTokens

    // Rough per-token pricing tiers (USD per 1K tokens)
    const pricing = TOKEN_PRICING[provider.name] ?? TOKEN_PRICING['default']
    return (promptTokens / 1000) * pricing.input + (completionTokens / 1000) * pricing.output
  }
}

const TOKEN_PRICING: Record<string, { input: number; output: number }> = {
  claude: { input: 0.008, output: 0.024 },
  openai: { input: 0.005, output: 0.015 },
  local: { input: 0, output: 0 },
  default: { input: 0.005, output: 0.015 },
}

// ── LLMProviderRegistry ──

export type ProviderFactory = (config?: LLMProviderConfig) => LLMProvider

export class LLMProviderRegistry {
  private factories = new Map<string, ProviderFactory>()
  private instances = new Map<string, LLMProvider>()
  private defaultName: string | null = null

  /** Register a provider factory under a name */
  register(name: string, factory: ProviderFactory): void {
    this.factories.set(name, factory)
  }

  /** Remove a provider by name */
  unregister(name: string): void {
    this.factories.delete(name)
    this.instances.delete(name)
    if (this.defaultName === name) this.defaultName = null
  }

  /** Get (or lazily create) a provider instance */
  get(name: string, config?: LLMProviderConfig): LLMProvider {
    const existing = this.instances.get(name)
    if (existing) return existing

    const factory = this.factories.get(name)
    if (!factory) throw new Error(`LLM provider "${name}" is not registered`)

    const instance = factory(config)
    this.instances.set(name, instance)
    return instance
  }

  /** Check if a provider is registered */
  has(name: string): boolean {
    return this.factories.has(name)
  }

  /** List all registered provider names */
  list(): string[] {
    return [...this.factories.keys()]
  }

  /** Set the default provider */
  setDefault(name: string): void {
    if (!this.factories.has(name)) {
      throw new Error(`Cannot set default: provider "${name}" is not registered`)
    }
    this.defaultName = name
  }

  /** Get the default provider */
  getDefault(): LLMProvider {
    if (!this.defaultName) throw new Error('No default LLM provider configured')
    return this.get(this.defaultName)
  }

  /** Clear all registrations and cached instances */
  clear(): void {
    this.factories.clear()
    this.instances.clear()
    this.defaultName = null
  }
}

// ── LLMRouter ──

export class LLMRouter {
  private readonly registry: LLMProviderRegistry
  private readonly config: Required<RouterConfig>
  private health = new Map<string, ProviderHealth>()
  private middleware: RouterMiddleware[] = []
  private roundRobinIndex = 0

  constructor(registry: LLMProviderRegistry, config?: RouterConfig) {
    this.registry = registry
    this.config = {
      defaultProvider: config?.defaultProvider ?? '',
      fallbackChain: config?.fallbackChain ?? [],
      balancingStrategy: config?.balancingStrategy ?? 'round-robin',
      maxFailures: config?.maxFailures ?? 3,
      healthCooldownMs: config?.healthCooldownMs ?? 60000,
    }
  }

  /** Add request/response middleware */
  use(mw: RouterMiddleware): void {
    this.middleware.push(mw)
  }

  /** Route a request to the best available provider */
  async route(request: LLMRequest): Promise<LLMResponse> {
    const chain = this.buildChain()
    if (chain.length === 0) {
      throw new Error('No healthy LLM providers available')
    }

    const execute = async (): Promise<LLMResponse> => {
      let lastError: Error | null = null

      for (const providerName of chain) {
        if (!this.isHealthy(providerName)) continue

        try {
          const provider = this.registry.get(providerName)
          const start = Date.now()
          const response = await provider.generate(request)
          this.recordSuccess(providerName, Date.now() - start, response.usage)
          return response
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err))
          this.recordFailure(providerName)
        }
      }

      throw lastError ?? new Error('All providers in the fallback chain failed')
    }

    // Run through middleware pipeline
    return this.runMiddleware(request, execute)
  }

  /** Get health statistics for all tracked providers */
  getStats(): Record<string, LLMProviderStats> {
    const stats: Record<string, LLMProviderStats> = {}
    for (const [name, h] of this.health.entries()) {
      stats[name] = {
        requestCount: h.requestCount,
        errorCount: h.errorCount,
        avgLatencyMs: h.requestCount > 0 ? h.totalLatency / h.requestCount : 0,
        totalPromptTokens: h.totalPromptTokens,
        totalCompletionTokens: h.totalCompletionTokens,
      }
    }
    return stats
  }

  /** Check if a specific provider is currently considered healthy */
  isHealthy(name: string): boolean {
    const h = this.health.get(name)
    if (!h) return true // Unknown providers are assumed healthy

    if (h.healthy) return true
    // Check if cooldown has elapsed
    if (Date.now() - h.lastFailure >= this.config.healthCooldownMs) {
      h.healthy = true
      h.consecutiveFailures = 0
      return true
    }
    return false
  }

  /** Reset health state for all providers */
  resetHealth(): void {
    this.health.clear()
  }

  // ── Private methods ──

  private buildChain(): string[] {
    const candidates =
      this.config.fallbackChain.length > 0 ? [...this.config.fallbackChain] : this.registry.list()

    // Prepend default if not already in the list
    if (this.config.defaultProvider && !candidates.includes(this.config.defaultProvider)) {
      candidates.unshift(this.config.defaultProvider)
    }

    // Apply balancing strategy to healthy candidates
    const healthy = candidates.filter(n => this.isHealthy(n))
    return this.applyStrategy(healthy)
  }

  private applyStrategy(providers: string[]): string[] {
    if (providers.length <= 1) return providers

    switch (this.config.balancingStrategy) {
      case 'round-robin': {
        this.roundRobinIndex = (this.roundRobinIndex + 1) % providers.length
        const rotated = [
          ...providers.slice(this.roundRobinIndex),
          ...providers.slice(0, this.roundRobinIndex),
        ]
        return rotated
      }
      case 'least-latency': {
        return [...providers].sort((a, b) => {
          const aLatency = this.avgLatency(a)
          const bLatency = this.avgLatency(b)
          return aLatency - bLatency
        })
      }
      case 'cost-optimized': {
        const costOrder = ['local', 'openai', 'claude']
        return [...providers].sort((a, b) => {
          const aIdx = costOrder.indexOf(a)
          const bIdx = costOrder.indexOf(b)
          return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
        })
      }
      case 'random': {
        const shuffled = [...providers]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }
      default:
        return providers
    }
  }

  private avgLatency(name: string): number {
    const h = this.health.get(name)
    if (!h || h.requestCount === 0) return Infinity
    return h.totalLatency / h.requestCount
  }

  private ensureHealth(name: string): ProviderHealth {
    let h = this.health.get(name)
    if (!h) {
      h = {
        healthy: true,
        consecutiveFailures: 0,
        lastFailure: 0,
        totalLatency: 0,
        requestCount: 0,
        errorCount: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
      }
      this.health.set(name, h)
    }
    return h
  }

  private recordSuccess(
    name: string,
    latencyMs: number,
    usage: { promptTokens: number; completionTokens: number },
  ): void {
    const h = this.ensureHealth(name)
    h.requestCount++
    h.totalLatency += latencyMs
    h.consecutiveFailures = 0
    h.healthy = true
    h.totalPromptTokens += usage.promptTokens
    h.totalCompletionTokens += usage.completionTokens
  }

  private recordFailure(name: string): void {
    const h = this.ensureHealth(name)
    h.errorCount++
    h.consecutiveFailures++
    h.lastFailure = Date.now()
    if (h.consecutiveFailures >= this.config.maxFailures) {
      h.healthy = false
    }
  }

  private async runMiddleware(
    request: LLMRequest,
    finalHandler: () => Promise<LLMResponse>,
  ): Promise<LLMResponse> {
    if (this.middleware.length === 0) return finalHandler()

    let idx = 0
    const next = async (): Promise<LLMResponse> => {
      if (idx < this.middleware.length) {
        const mw = this.middleware[idx++]
        return mw(request, null, next)
      }
      return finalHandler()
    }

    return next()
  }
}

// ── Built-in provider factories ──

/**
 * Create a Claude (Anthropic) provider stub.
 * In production, replace generate/stream/embed with real API calls.
 */
export function createClaudeProvider(config?: LLMProviderConfig): LLMProvider {
  const baseUrl = config?.baseUrl ?? 'https://api.anthropic.com'
  const timeout = config?.timeout ?? 30000

  return {
    name: 'claude',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    capabilities: { streaming: true, tools: true, vision: true, embeddings: false, jsonMode: true },

    async generate(request: LLMRequest): Promise<LLMResponse> {
      void baseUrl
      void timeout
      const estimator = new TokenEstimator()
      return {
        text: `[Claude] Response to: ${request.prompt.slice(0, 50)}`,
        usage: {
          promptTokens: estimator.estimateTokens(request.prompt),
          completionTokens: estimator.estimateTokens(request.prompt),
        },
        model: 'claude-sonnet-4-20250514',
        finishReason: 'stop',
      }
    },

    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
      const text = `[Claude] Streamed response to: ${request.prompt.slice(0, 50)}`
      let accumulated = ''
      for (const char of text) {
        accumulated += char
        yield { type: 'text', content: accumulated, delta: char }
      }
      yield { type: 'done', content: accumulated, delta: '' }
    },

    async embed(_request: EmbeddingRequest): Promise<EmbeddingResponse> {
      throw new Error('Claude does not support embeddings')
    },
  }
}

/**
 * Create an OpenAI provider stub.
 * In production, replace generate/stream/embed with real API calls.
 */
export function createOpenAIProvider(config?: LLMProviderConfig): LLMProvider {
  const baseUrl = config?.baseUrl ?? 'https://api.openai.com'
  const timeout = config?.timeout ?? 30000

  return {
    name: 'openai',
    model: 'gpt-4o',
    maxTokens: 4096,
    capabilities: { streaming: true, tools: true, vision: true, embeddings: true, jsonMode: true },

    async generate(request: LLMRequest): Promise<LLMResponse> {
      void baseUrl
      void timeout
      const estimator = new TokenEstimator()
      return {
        text: `[OpenAI] Response to: ${request.prompt.slice(0, 50)}`,
        usage: {
          promptTokens: estimator.estimateTokens(request.prompt),
          completionTokens: estimator.estimateTokens(request.prompt),
        },
        model: 'gpt-4o',
        finishReason: 'stop',
      }
    },

    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
      const text = `[OpenAI] Streamed response to: ${request.prompt.slice(0, 50)}`
      let accumulated = ''
      for (const char of text) {
        accumulated += char
        yield { type: 'text', content: accumulated, delta: char }
      }
      yield { type: 'done', content: accumulated, delta: '' }
    },

    async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
      void baseUrl
      void timeout
      const estimator = new TokenEstimator()
      return {
        embeddings: request.inputs.map(() =>
          Array.from({ length: 1536 }, () => Math.random() * 2 - 1),
        ),
        model: 'text-embedding-3-small',
        usage: {
          promptTokens: request.inputs.reduce((sum, t) => sum + estimator.estimateTokens(t), 0),
        },
      }
    },
  }
}

/**
 * Create a local / offline model provider stub.
 * In production, connect to a local inference server (e.g. llama.cpp, Ollama).
 */
export function createLocalProvider(config?: LLMProviderConfig): LLMProvider {
  const baseUrl = config?.baseUrl ?? 'http://localhost:11434'
  const timeout = config?.timeout ?? 60000

  return {
    name: 'local',
    model: 'llama3',
    maxTokens: 2048,
    capabilities: {
      streaming: true,
      tools: false,
      vision: false,
      embeddings: true,
      jsonMode: false,
    },

    async generate(request: LLMRequest): Promise<LLMResponse> {
      void baseUrl
      void timeout
      const estimator = new TokenEstimator()
      return {
        text: `[Local] Response to: ${request.prompt.slice(0, 50)}`,
        usage: {
          promptTokens: estimator.estimateTokens(request.prompt),
          completionTokens: estimator.estimateTokens(request.prompt),
        },
        model: 'llama3',
        finishReason: 'stop',
      }
    },

    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
      const text = `[Local] Streamed response to: ${request.prompt.slice(0, 50)}`
      let accumulated = ''
      for (const char of text) {
        accumulated += char
        yield { type: 'text', content: accumulated, delta: char }
      }
      yield { type: 'done', content: accumulated, delta: '' }
    },

    async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
      void baseUrl
      void timeout
      const estimator = new TokenEstimator()
      return {
        embeddings: request.inputs.map(() =>
          Array.from({ length: 768 }, () => Math.random() * 2 - 1),
        ),
        model: 'llama3',
        usage: {
          promptTokens: request.inputs.reduce((sum, t) => sum + estimator.estimateTokens(t), 0),
        },
      }
    },
  }
}

/**
 * Create a mock provider for testing.
 * Cycles through the supplied responses in order.
 */
export function createMockProvider(responses: Partial<LLMResponse>[] = []): LLMProvider {
  let callIndex = 0

  const defaultResponse: LLMResponse = {
    text: 'mock response',
    usage: { promptTokens: 10, completionTokens: 20 },
    model: 'mock-model',
    finishReason: 'stop',
  }

  return {
    name: 'mock',
    model: 'mock-model',
    maxTokens: 1024,
    capabilities: { streaming: true, tools: true, vision: false, embeddings: true, jsonMode: true },

    async generate(_request: LLMRequest): Promise<LLMResponse> {
      const override = responses[callIndex % Math.max(responses.length, 1)]
      callIndex++
      return { ...defaultResponse, ...override }
    },

    async *stream(_request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
      const override = responses[callIndex % Math.max(responses.length, 1)]
      callIndex++
      const text = override?.text ?? defaultResponse.text
      let accumulated = ''
      for (const char of text) {
        accumulated += char
        yield { type: 'text', content: accumulated, delta: char }
      }
      yield { type: 'done', content: accumulated, delta: '' }
    },

    async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
      return {
        embeddings: request.inputs.map(() => Array.from({ length: 128 }, () => 0)),
        model: 'mock-model',
        usage: { promptTokens: request.inputs.length },
      }
    },
  }
}

// ── Factory helpers ──

/** Create a pre-configured LLMProviderRegistry with all built-in providers */
export function createLLMProviderRegistry(): LLMProviderRegistry {
  const registry = new LLMProviderRegistry()
  registry.register('claude', createClaudeProvider)
  registry.register('openai', createOpenAIProvider)
  registry.register('local', createLocalProvider)
  registry.register('mock', () => createMockProvider())
  return registry
}

/** Create an LLMRouter wired to a registry */
export function createLLMRouter(registry: LLMProviderRegistry, config?: RouterConfig): LLMRouter {
  return new LLMRouter(registry, config)
}
