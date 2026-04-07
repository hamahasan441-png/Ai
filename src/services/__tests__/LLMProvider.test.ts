import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  APIUserAbortError: class APIUserAbortError extends Error {},
}))

import {
  LLMCapability,
  type LLMRequest,
  type LLMResponse,
  type LLMStreamChunk,
  type LLMModel,
  AnthropicProvider,
  OpenAIProvider,
  OllamaProvider,
  BaseLLMProvider,
  ModelRouter,
} from '../llmProvider/index.js'

// ── Helpers ──

function makeRequest(overrides: Partial<LLMRequest> = {}): LLMRequest {
  return {
    model: 'test-model',
    messages: [{ role: 'user', content: 'Hello' }],
    ...overrides,
  }
}

function makeResponse(overrides: Partial<LLMResponse> = {}): LLMResponse {
  return {
    content: 'Hi there!',
    model: 'test-model',
    usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    finishReason: 'stop',
    latencyMs: 100,
    ...overrides,
  }
}

/** Test provider that returns canned responses. */
class TestProvider extends BaseLLMProvider {
  readonly name: string
  readonly capabilities = [LLMCapability.CHAT, LLMCapability.STREAMING]
  private _available: boolean
  private _response: LLMResponse
  private _models: LLMModel[]

  constructor(opts: {
    name: string
    available?: boolean
    response?: LLMResponse
    models?: LLMModel[]
  }) {
    super({ maxRetries: 0 })
    this.name = opts.name
    this._available = opts.available ?? true
    this._response = opts.response ?? makeResponse({ model: opts.name })
    this._models = opts.models ?? [
      {
        id: `${opts.name}-model`,
        name: `${opts.name} Model`,
        provider: opts.name,
        contextWindow: 4096,
        maxOutputTokens: 1024,
        costPer1kInput: 0.001,
        costPer1kOutput: 0.002,
        capabilities: [LLMCapability.CHAT],
      },
    ]
  }

  listModels(): LLMModel[] {
    return this._models
  }

  async isAvailable(): Promise<boolean> {
    return this._available
  }

  protected async doComplete(_request: LLMRequest): Promise<LLMResponse> {
    return this._response
  }

  protected async *doStream(_request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    yield { content: 'chunk1', done: false }
    yield { content: 'chunk2', done: true, usage: { totalTokens: 10 } }
  }
}

// ── Type validation ──

describe('LLMProvider types', () => {
  describe('request validation', () => {
    it('rejects a request with no model', async () => {
      const provider = new TestProvider({ name: 'test' })
      await expect(provider.complete(makeRequest({ model: '' }))).rejects.toThrow('valid model ID')
    })

    it('rejects a request with empty messages', async () => {
      const provider = new TestProvider({ name: 'test' })
      await expect(provider.complete(makeRequest({ messages: [] }))).rejects.toThrow('at least one message')
    })

    it('rejects a request with invalid role', async () => {
      const provider = new TestProvider({ name: 'test' })
      const req = makeRequest({ messages: [{ role: 'invalid' as 'user', content: 'hi' }] })
      await expect(provider.complete(req)).rejects.toThrow('Invalid message role')
    })

    it('rejects a request with non-string content', async () => {
      const provider = new TestProvider({ name: 'test' })
      const req = makeRequest({ messages: [{ role: 'user', content: 123 as unknown as string }] })
      await expect(provider.complete(req)).rejects.toThrow('content must be a string')
    })

    it('rejects temperature below 0', async () => {
      const provider = new TestProvider({ name: 'test' })
      await expect(provider.complete(makeRequest({ temperature: -0.1 }))).rejects.toThrow('Temperature')
    })

    it('rejects temperature above 2', async () => {
      const provider = new TestProvider({ name: 'test' })
      await expect(provider.complete(makeRequest({ temperature: 2.5 }))).rejects.toThrow('Temperature')
    })

    it('rejects maxTokens of 0', async () => {
      const provider = new TestProvider({ name: 'test' })
      await expect(provider.complete(makeRequest({ maxTokens: 0 }))).rejects.toThrow('maxTokens')
    })

    it('rejects negative maxTokens', async () => {
      const provider = new TestProvider({ name: 'test' })
      await expect(provider.complete(makeRequest({ maxTokens: -5 }))).rejects.toThrow('maxTokens')
    })

    it('accepts a valid request', async () => {
      const provider = new TestProvider({ name: 'test' })
      const resp = await provider.complete(makeRequest({ temperature: 0.7, maxTokens: 100 }))
      expect(resp.content).toBe('Hi there!')
    })

    it('accepts system, user, and assistant roles', async () => {
      const provider = new TestProvider({ name: 'test' })
      const req = makeRequest({
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi!' },
        ],
      })
      const resp = await provider.complete(req)
      expect(resp).toBeDefined()
    })
  })

  describe('response structure', () => {
    it('includes latencyMs field', async () => {
      const provider = new TestProvider({ name: 'test' })
      const resp = await provider.complete(makeRequest())
      expect(resp.latencyMs).toBeGreaterThanOrEqual(0)
    })

    it('returns the provider-supplied usage', async () => {
      const provider = new TestProvider({ name: 'test' })
      const resp = await provider.complete(makeRequest())
      expect(resp.usage).toEqual({ inputTokens: 10, outputTokens: 5, totalTokens: 15 })
    })
  })
})

// ── Anthropic Provider ──

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider

  beforeEach(() => {
    provider = new AnthropicProvider()
  })

  it('has name "anthropic"', () => {
    expect(provider.name).toBe('anthropic')
  })

  it('lists 3 Claude models', () => {
    const models = provider.listModels()
    expect(models).toHaveLength(3)
    expect(models.map((m) => m.provider)).toEqual(['anthropic', 'anthropic', 'anthropic'])
  })

  it('includes haiku, sonnet, and opus variants', () => {
    const names = provider.listModels().map((m) => m.name)
    expect(names).toContain('Claude 3.5 Haiku')
    expect(names).toContain('Claude Sonnet 4')
    expect(names).toContain('Claude Opus 4')
  })

  it('reports as unavailable', async () => {
    expect(await provider.isAvailable()).toBe(false)
  })

  it('throws ServiceError on complete()', async () => {
    await expect(provider.complete(makeRequest({ model: 'claude-3-5-haiku-20241022' }))).rejects.toThrow('not configured')
  })

  it('throws ServiceError on stream()', async () => {
    const gen = provider.stream(makeRequest({ model: 'claude-3-5-haiku-20241022' }))
    await expect(gen.next()).rejects.toThrow('not configured')
  })

  it('has chat and streaming capabilities', () => {
    expect(provider.capabilities).toContain(LLMCapability.CHAT)
    expect(provider.capabilities).toContain(LLMCapability.STREAMING)
  })
})

// ── OpenAI Provider ──

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider

  beforeEach(() => {
    provider = new OpenAIProvider()
  })

  it('has name "openai"', () => {
    expect(provider.name).toBe('openai')
  })

  it('lists 3 GPT models', () => {
    const models = provider.listModels()
    expect(models).toHaveLength(3)
  })

  it('includes gpt-4o-mini, gpt-4o, gpt-4-turbo', () => {
    const ids = provider.listModels().map((m) => m.id)
    expect(ids).toContain('gpt-4o-mini')
    expect(ids).toContain('gpt-4o')
    expect(ids).toContain('gpt-4-turbo')
  })

  it('reports as unavailable', async () => {
    expect(await provider.isAvailable()).toBe(false)
  })

  it('throws ServiceError on complete()', async () => {
    await expect(provider.complete(makeRequest({ model: 'gpt-4o' }))).rejects.toThrow('not configured')
  })

  it('throws ServiceError on stream()', async () => {
    const gen = provider.stream(makeRequest({ model: 'gpt-4o' }))
    await expect(gen.next()).rejects.toThrow('not configured')
  })
})

// ── Ollama Provider ──

describe('OllamaProvider', () => {
  let provider: OllamaProvider

  beforeEach(() => {
    provider = new OllamaProvider()
  })

  it('has name "ollama"', () => {
    expect(provider.name).toBe('ollama')
  })

  it('defaults host to localhost:11434', () => {
    expect(provider.host).toBe('http://localhost:11434')
  })

  it('accepts custom host', () => {
    const custom = new OllamaProvider({ host: 'http://gpu-server:11434' })
    expect(custom.host).toBe('http://gpu-server:11434')
  })

  it('lists 3 local models', () => {
    expect(provider.listModels()).toHaveLength(3)
  })

  it('includes llama3, mistral, codellama', () => {
    const ids = provider.listModels().map((m) => m.id)
    expect(ids).toContain('llama3')
    expect(ids).toContain('mistral')
    expect(ids).toContain('codellama')
  })

  it('reports as unavailable', async () => {
    expect(await provider.isAvailable()).toBe(false)
  })

  it('throws ServiceError on complete()', async () => {
    await expect(provider.complete(makeRequest({ model: 'llama3' }))).rejects.toThrow('not reachable')
  })

  it('all models have zero cost', () => {
    for (const model of provider.listModels()) {
      expect(model.costPer1kInput).toBe(0)
      expect(model.costPer1kOutput).toBe(0)
    }
  })
})

// ── Cost Estimation ──

describe('cost estimation', () => {
  it('calculates cost for a known model', () => {
    const provider = new AnthropicProvider()
    const cost = provider.estimateCost('claude-3-5-haiku-20241022', 1000, 500)
    // 1000/1000 * 0.001 + 500/1000 * 0.005 = 0.001 + 0.0025 = 0.0035
    expect(cost).toBeCloseTo(0.0035, 6)
  })

  it('returns 0 for an unknown model', () => {
    const provider = new OpenAIProvider()
    expect(provider.estimateCost('nonexistent', 1000, 1000)).toBe(0)
  })

  it('returns 0 for ollama models (free)', () => {
    const provider = new OllamaProvider()
    expect(provider.estimateCost('llama3', 5000, 2000)).toBe(0)
  })
})

// ── Streaming ──

describe('streaming', () => {
  it('yields chunks from a provider', async () => {
    const provider = new TestProvider({ name: 'stream-test' })
    const chunks: LLMStreamChunk[] = []
    for await (const chunk of provider.stream(makeRequest())) {
      chunks.push(chunk)
    }
    expect(chunks).toHaveLength(2)
    expect(chunks[0].content).toBe('chunk1')
    expect(chunks[0].done).toBe(false)
    expect(chunks[1].done).toBe(true)
  })

  it('includes partial usage on final chunk', async () => {
    const provider = new TestProvider({ name: 'stream-test' })
    const chunks: LLMStreamChunk[] = []
    for await (const chunk of provider.stream(makeRequest())) {
      chunks.push(chunk)
    }
    expect(chunks[1].usage).toEqual({ totalTokens: 10 })
  })

  it('validates request before streaming', async () => {
    const provider = new TestProvider({ name: 'stream-test' })
    const gen = provider.stream(makeRequest({ model: '' }))
    await expect(gen.next()).rejects.toThrow('valid model ID')
  })
})

// ── Model Router ──

describe('ModelRouter', () => {
  let router: ModelRouter

  beforeEach(() => {
    router = new ModelRouter({
      cheapModel: 'cheap-model',
      powerfulModel: 'powerful-model',
    })
  })

  describe('provider registration', () => {
    it('registers a provider', () => {
      router.addProvider(new TestProvider({ name: 'a' }))
      expect(router.getAvailableModels()).toHaveLength(1)
    })

    it('registers multiple providers', () => {
      router.addProvider(new TestProvider({ name: 'a' }))
      router.addProvider(new TestProvider({ name: 'b' }))
      expect(router.getAvailableModels()).toHaveLength(2)
    })

    it('throws on duplicate provider name', () => {
      router.addProvider(new TestProvider({ name: 'dup' }))
      expect(() => router.addProvider(new TestProvider({ name: 'dup' }))).toThrow('already registered')
    })
  })

  describe('model listing', () => {
    it('aggregates models from all providers', () => {
      router.addProvider(new TestProvider({ name: 'a' }))
      router.addProvider(new TestProvider({ name: 'b' }))
      const models = router.getAvailableModels()
      expect(models).toHaveLength(2)
      expect(models.map((m) => m.id)).toEqual(['a-model', 'b-model'])
    })

    it('returns empty array with no providers', () => {
      expect(router.getAvailableModels()).toEqual([])
    })
  })

  describe('completion routing', () => {
    it('routes to available provider', async () => {
      const provider = new TestProvider({
        name: 'main',
        available: true,
        response: makeResponse({ content: 'routed!' }),
      })
      router.addProvider(provider)
      const resp = await router.complete(makeRequest({ model: 'main-model' }))
      expect(resp.content).toBe('routed!')
    })

    it('throws when no provider is available', async () => {
      await expect(router.complete(makeRequest({ model: 'ghost' }))).rejects.toThrow()
    })
  })

  describe('fallback behavior', () => {
    it('falls back to second provider if first is unavailable', async () => {
      const model: LLMModel = {
        id: 'shared-model',
        name: 'Shared',
        provider: 'primary',
        contextWindow: 4096,
        maxOutputTokens: 1024,
        costPer1kInput: 0.001,
        costPer1kOutput: 0.002,
        capabilities: [LLMCapability.CHAT],
      }

      router.addProvider(new TestProvider({
        name: 'primary',
        available: false,
        models: [model],
      }))
      router.addProvider(new TestProvider({
        name: 'fallback',
        available: true,
        response: makeResponse({ content: 'from fallback' }),
        models: [{ ...model, provider: 'fallback' }],
      }))

      const resp = await router.complete(makeRequest({ model: 'shared-model' }))
      expect(resp.content).toBe('from fallback')
    })
  })

  describe('custom router function', () => {
    it('applies custom routing logic', async () => {
      const customRouter = new ModelRouter({
        cheapModel: 'cheap',
        powerfulModel: 'powerful',
        router: (_req) => 'custom-resolved-model',
      })

      const model: LLMModel = {
        id: 'custom-resolved-model',
        name: 'Custom',
        provider: 'test',
        contextWindow: 4096,
        maxOutputTokens: 1024,
        costPer1kInput: 0,
        costPer1kOutput: 0,
        capabilities: [LLMCapability.CHAT],
      }

      customRouter.addProvider(new TestProvider({
        name: 'test',
        available: true,
        response: makeResponse({ content: 'custom routed' }),
        models: [model],
      }))

      const resp = await customRouter.complete(makeRequest({ model: 'anything' }))
      expect(resp.content).toBe('custom routed')
    })
  })

  describe('cost estimation', () => {
    it('estimates cost from aggregated models', () => {
      const model: LLMModel = {
        id: 'priced-model',
        name: 'Priced',
        provider: 'test',
        contextWindow: 4096,
        maxOutputTokens: 1024,
        costPer1kInput: 0.01,
        costPer1kOutput: 0.03,
        capabilities: [LLMCapability.CHAT],
      }
      router.addProvider(new TestProvider({ name: 'test', models: [model] }))
      // 2000/1000 * 0.01 + 1000/1000 * 0.03 = 0.02 + 0.03 = 0.05
      expect(router.estimateCost('priced-model', 2000, 1000)).toBeCloseTo(0.05, 6)
    })

    it('returns 0 for unknown model', () => {
      expect(router.estimateCost('nope', 1000, 1000)).toBe(0)
    })
  })

  describe('streaming routing', () => {
    it('streams through available provider', async () => {
      router.addProvider(new TestProvider({ name: 'streamer', available: true }))
      const chunks: LLMStreamChunk[] = []
      for await (const chunk of router.stream(makeRequest({ model: 'streamer-model' }))) {
        chunks.push(chunk)
      }
      expect(chunks).toHaveLength(2)
      expect(chunks[1].done).toBe(true)
    })

    it('throws when no streaming provider available', async () => {
      const gen = router.stream(makeRequest({ model: 'nothing' }))
      await expect(gen.next()).rejects.toThrow()
    })
  })
})

// ── LLMCapability enum ──

describe('LLMCapability', () => {
  it('has all expected values', () => {
    expect(LLMCapability.CHAT).toBe('chat')
    expect(LLMCapability.STREAMING).toBe('streaming')
    expect(LLMCapability.FUNCTION_CALLING).toBe('function_calling')
    expect(LLMCapability.VISION).toBe('vision')
    expect(LLMCapability.EMBEDDINGS).toBe('embeddings')
    expect(LLMCapability.CODE_GENERATION).toBe('code_generation')
  })
})
