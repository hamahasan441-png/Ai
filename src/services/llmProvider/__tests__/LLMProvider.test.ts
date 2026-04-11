import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  LLMProviderRegistry,
  LLMRouter,
  TokenEstimator,
  createClaudeProvider,
  createOpenAIProvider,
  createLocalProvider,
  createMockProvider,
  createLLMProviderRegistry,
  createLLMRouter,
} from '../index.js'
import type { LLMProvider, LLMRequest, LLMResponse, RouterMiddleware } from '../index.js'

// ── Helpers ──

function makeMockProvider(name: string, overrides?: Partial<LLMProvider>): LLMProvider {
  return {
    name,
    model: `${name}-model`,
    maxTokens: 1024,
    capabilities: {
      streaming: true,
      tools: false,
      vision: false,
      embeddings: false,
      jsonMode: false,
    },
    async generate(req: LLMRequest): Promise<LLMResponse> {
      return {
        text: `[${name}] ${req.prompt}`,
        usage: { promptTokens: 10, completionTokens: 20 },
        model: `${name}-model`,
        finishReason: 'stop',
      }
    },
    async *stream() {
      yield { type: 'text' as const, content: 'a', delta: 'a' }
      yield { type: 'done' as const, content: 'a', delta: '' }
    },
    async embed(req) {
      return {
        embeddings: req.inputs.map(() => [0, 0]),
        model: `${name}-model`,
        usage: { promptTokens: req.inputs.length },
      }
    },
    ...overrides,
  }
}

function makeRequest(prompt = 'Hello'): LLMRequest {
  return { prompt }
}

// ── LLMProviderRegistry ──

describe('LLMProviderRegistry', () => {
  let registry: LLMProviderRegistry

  beforeEach(() => {
    registry = new LLMProviderRegistry()
  })

  describe('register / unregister', () => {
    it('should register a provider factory', () => {
      registry.register('test', () => makeMockProvider('test'))
      expect(registry.has('test')).toBe(true)
    })

    it('should unregister a provider', () => {
      registry.register('test', () => makeMockProvider('test'))
      registry.unregister('test')
      expect(registry.has('test')).toBe(false)
    })

    it('should allow re-registration with the same name', () => {
      registry.register('test', () => makeMockProvider('test-v1'))
      registry.register('test', () => makeMockProvider('test-v2'))
      const provider = registry.get('test')
      expect(provider.name).toBe('test-v2')
    })

    it('should remove cached instance on unregister', () => {
      registry.register('test', () => makeMockProvider('test'))
      registry.get('test') // cache it
      registry.unregister('test')
      expect(registry.has('test')).toBe(false)
    })
  })

  describe('get', () => {
    it('should lazily create a provider instance', () => {
      const factory = vi.fn(() => makeMockProvider('test'))
      registry.register('test', factory)

      expect(factory).not.toHaveBeenCalled()
      const provider = registry.get('test')
      expect(factory).toHaveBeenCalledTimes(1)
      expect(provider.name).toBe('test')
    })

    it('should return the same cached instance on subsequent calls', () => {
      registry.register('test', () => makeMockProvider('test'))
      const a = registry.get('test')
      const b = registry.get('test')
      expect(a).toBe(b)
    })

    it('should pass config to the factory', () => {
      const factory = vi.fn((_cfg?) => makeMockProvider('test'))
      registry.register('test', factory)
      registry.get('test', { apiKey: 'sk-123' })
      expect(factory).toHaveBeenCalledWith({ apiKey: 'sk-123' })
    })

    it('should throw for non-existent provider', () => {
      expect(() => registry.get('unknown')).toThrow('not registered')
    })
  })

  describe('has', () => {
    it('should return false for unregistered provider', () => {
      expect(registry.has('missing')).toBe(false)
    })
  })

  describe('list', () => {
    it('should return empty list initially', () => {
      expect(registry.list()).toEqual([])
    })

    it('should list all registered provider names', () => {
      registry.register('a', () => makeMockProvider('a'))
      registry.register('b', () => makeMockProvider('b'))
      expect(registry.list()).toEqual(['a', 'b'])
    })

    it('should reflect unregistrations', () => {
      registry.register('a', () => makeMockProvider('a'))
      registry.register('b', () => makeMockProvider('b'))
      registry.unregister('a')
      expect(registry.list()).toEqual(['b'])
    })
  })

  describe('default provider', () => {
    it('should set and get the default provider', () => {
      registry.register('test', () => makeMockProvider('test'))
      registry.setDefault('test')
      expect(registry.getDefault().name).toBe('test')
    })

    it('should throw when setting default to non-existent provider', () => {
      expect(() => registry.setDefault('ghost')).toThrow('not registered')
    })

    it('should throw when no default is configured', () => {
      expect(() => registry.getDefault()).toThrow('No default')
    })

    it('should clear default when the default provider is unregistered', () => {
      registry.register('test', () => makeMockProvider('test'))
      registry.setDefault('test')
      registry.unregister('test')
      expect(() => registry.getDefault()).toThrow('No default')
    })
  })

  describe('clear', () => {
    it('should remove all registrations and cached instances', () => {
      registry.register('a', () => makeMockProvider('a'))
      registry.register('b', () => makeMockProvider('b'))
      registry.setDefault('a')
      registry.get('a')
      registry.clear()

      expect(registry.list()).toEqual([])
      expect(registry.has('a')).toBe(false)
      expect(() => registry.getDefault()).toThrow('No default')
    })
  })
})

// ── LLMRouter ──

describe('LLMRouter', () => {
  let registry: LLMProviderRegistry

  beforeEach(() => {
    registry = new LLMProviderRegistry()
  })

  describe('route', () => {
    it('should route to the default provider', async () => {
      registry.register('primary', () => makeMockProvider('primary'))
      const router = new LLMRouter(registry, { defaultProvider: 'primary' })

      const res = await router.route(makeRequest('Hi'))
      expect(res.text).toContain('primary')
    })

    it('should route using fallback chain providers', async () => {
      registry.register('a', () => makeMockProvider('a'))
      registry.register('b', () => makeMockProvider('b'))
      registry.register('c', () => makeMockProvider('c'))
      const router = new LLMRouter(registry, { fallbackChain: ['a', 'b'] })

      const res = await router.route(makeRequest())
      // Should use one of the chain providers, not 'c'
      expect(res.text).toMatch(/\[(a|b)\]/)
    })

    it('should fallback when primary provider fails', async () => {
      registry.register('bad', () =>
        makeMockProvider('bad', {
          async generate() {
            throw new Error('down')
          },
        }),
      )
      registry.register('good', () => makeMockProvider('good'))
      const router = new LLMRouter(registry, { fallbackChain: ['bad', 'good'] })

      const res = await router.route(makeRequest())
      expect(res.text).toContain('[good]')
    })

    it('should throw when all providers fail', async () => {
      registry.register('a', () =>
        makeMockProvider('a', {
          async generate() {
            throw new Error('fail-a')
          },
        }),
      )
      registry.register('b', () =>
        makeMockProvider('b', {
          async generate() {
            throw new Error('fail-b')
          },
        }),
      )
      const router = new LLMRouter(registry, { fallbackChain: ['a', 'b'] })

      await expect(router.route(makeRequest())).rejects.toThrow(/fail/)
    })

    it('should throw when no providers are available', async () => {
      const router = new LLMRouter(registry)
      await expect(router.route(makeRequest())).rejects.toThrow(
        'No healthy LLM providers available',
      )
    })

    it('should include default provider in routing candidates', async () => {
      registry.register('default', () => makeMockProvider('default'))
      registry.register('backup', () => makeMockProvider('backup'))
      const router = new LLMRouter(registry, {
        defaultProvider: 'default',
        fallbackChain: ['backup'],
      })

      // Make multiple calls — default should be used at least once due to round-robin
      const results: string[] = []
      for (let i = 0; i < 4; i++) {
        const res = await router.route(makeRequest())
        results.push(res.text)
      }
      expect(results.some(r => r.includes('[default]'))).toBe(true)
    })

    it('should not duplicate default if already in fallback chain', async () => {
      let callCount = 0
      registry.register('primary', () =>
        makeMockProvider('primary', {
          async generate(req) {
            callCount++
            return {
              text: `[primary] ${req.prompt}`,
              usage: { promptTokens: 5, completionTokens: 5 },
              model: 'primary-model',
              finishReason: 'stop',
            }
          },
        }),
      )
      const router = new LLMRouter(registry, {
        defaultProvider: 'primary',
        fallbackChain: ['primary'],
      })

      await router.route(makeRequest())
      expect(callCount).toBe(1)
    })
  })

  describe('load balancing strategies', () => {
    it('should support round-robin strategy', async () => {
      registry.register('a', () => makeMockProvider('a'))
      registry.register('b', () => makeMockProvider('b'))
      const router = new LLMRouter(registry, {
        fallbackChain: ['a', 'b'],
        balancingStrategy: 'round-robin',
      })

      const results: string[] = []
      for (let i = 0; i < 4; i++) {
        const res = await router.route(makeRequest())
        results.push(res.text)
      }
      // Round-robin should rotate which provider goes first
      const hasA = results.some(r => r.includes('[a]'))
      const hasB = results.some(r => r.includes('[b]'))
      expect(hasA).toBe(true)
      expect(hasB).toBe(true)
    })

    it('should support least-latency strategy', async () => {
      registry.register('slow', () =>
        makeMockProvider('slow', {
          async generate(req) {
            await new Promise(r => setTimeout(r, 30))
            return {
              text: `[slow] ${req.prompt}`,
              usage: { promptTokens: 5, completionTokens: 5 },
              model: 'slow-model',
              finishReason: 'stop',
            }
          },
        }),
      )
      registry.register('fast', () => makeMockProvider('fast'))
      const router = new LLMRouter(registry, {
        fallbackChain: ['slow', 'fast'],
        balancingStrategy: 'least-latency',
      })

      // First call primes stats
      await router.route(makeRequest())
      await router.route(makeRequest())
      // After a few calls, fast provider should be preferred
      const res = await router.route(makeRequest())
      expect(res).toBeDefined()
    })

    it('should support random strategy without errors', async () => {
      registry.register('a', () => makeMockProvider('a'))
      registry.register('b', () => makeMockProvider('b'))
      const router = new LLMRouter(registry, {
        fallbackChain: ['a', 'b'],
        balancingStrategy: 'random',
      })

      const res = await router.route(makeRequest())
      expect(res.finishReason).toBe('stop')
    })

    it('should support cost-optimized strategy', async () => {
      registry.register('local', () => makeMockProvider('local'))
      registry.register('openai', () => makeMockProvider('openai'))
      registry.register('claude', () => makeMockProvider('claude'))
      const router = new LLMRouter(registry, {
        fallbackChain: ['claude', 'openai', 'local'],
        balancingStrategy: 'cost-optimized',
      })

      const res = await router.route(makeRequest())
      // Cost-optimized should prefer local first
      expect(res.text).toContain('[local]')
    })
  })

  describe('health tracking', () => {
    it('should track provider stats after successful requests', async () => {
      registry.register('test', () => makeMockProvider('test'))
      const router = new LLMRouter(registry, { fallbackChain: ['test'] })

      await router.route(makeRequest())
      const stats = router.getStats()
      expect(stats['test']).toBeDefined()
      expect(stats['test'].requestCount).toBe(1)
      expect(stats['test'].errorCount).toBe(0)
    })

    it('should track errors in provider stats', async () => {
      let callCount = 0
      registry.register('flaky', () =>
        makeMockProvider('flaky', {
          async generate(req) {
            callCount++
            if (callCount === 1) throw new Error('transient')
            return {
              text: `[flaky] ${req.prompt}`,
              usage: { promptTokens: 5, completionTokens: 5 },
              model: 'flaky-model',
              finishReason: 'stop',
            }
          },
        }),
      )
      const router = new LLMRouter(registry, { fallbackChain: ['flaky'] })

      // First call fails, since there's only one provider it rejects
      await expect(router.route(makeRequest())).rejects.toThrow()

      const stats = router.getStats()
      expect(stats['flaky'].errorCount).toBe(1)
    })

    it('should mark provider unhealthy after max consecutive failures', async () => {
      registry.register('bad', () =>
        makeMockProvider('bad', {
          async generate() {
            throw new Error('fail')
          },
        }),
      )
      const router = new LLMRouter(registry, {
        fallbackChain: ['bad'],
        maxFailures: 2,
      })

      // Each route call causes one failure for 'bad'
      await router.route(makeRequest()).catch(() => {}) // failure 1
      await router.route(makeRequest()).catch(() => {}) // failure 2 → unhealthy
      expect(router.isHealthy('bad')).toBe(false)
    })

    it('should consider unknown providers as healthy', () => {
      const router = new LLMRouter(registry)
      expect(router.isHealthy('unknown')).toBe(true)
    })

    it('should recover provider health after cooldown', async () => {
      registry.register('bad', () =>
        makeMockProvider('bad', {
          async generate() {
            throw new Error('fail')
          },
        }),
      )
      const router = new LLMRouter(registry, {
        fallbackChain: ['bad'],
        maxFailures: 1,
        healthCooldownMs: 1, // 1ms cooldown for test speed
      })

      // Trip the circuit
      await router.route(makeRequest()).catch(() => {})
      expect(router.isHealthy('bad')).toBe(false)

      // Wait past cooldown
      await new Promise(r => setTimeout(r, 10))
      expect(router.isHealthy('bad')).toBe(true)
    })

    it('should reset all health state', async () => {
      registry.register('test', () => makeMockProvider('test'))
      const router = new LLMRouter(registry, { fallbackChain: ['test'] })

      await router.route(makeRequest())
      expect(Object.keys(router.getStats()).length).toBe(1)

      router.resetHealth()
      expect(Object.keys(router.getStats()).length).toBe(0)
    })
  })

  describe('middleware', () => {
    it('should run middleware before the provider call', async () => {
      registry.register('test', () => makeMockProvider('test'))
      const router = new LLMRouter(registry, { fallbackChain: ['test'] })
      const order: string[] = []

      router.use(async (_req, _res, next) => {
        order.push('middleware')
        return next()
      })

      await router.route(makeRequest())
      order.push('done')
      expect(order).toEqual(['middleware', 'done'])
    })

    it('should chain multiple middleware in order', async () => {
      registry.register('test', () => makeMockProvider('test'))
      const router = new LLMRouter(registry, { fallbackChain: ['test'] })
      const order: number[] = []

      router.use(async (_r, _s, next) => {
        order.push(1)
        return next()
      })
      router.use(async (_r, _s, next) => {
        order.push(2)
        return next()
      })
      router.use(async (_r, _s, next) => {
        order.push(3)
        return next()
      })

      await router.route(makeRequest())
      expect(order).toEqual([1, 2, 3])
    })

    it('should allow middleware to transform the response', async () => {
      registry.register('test', () => makeMockProvider('test'))
      const router = new LLMRouter(registry, { fallbackChain: ['test'] })

      const transform: RouterMiddleware = async (_req, _res, next) => {
        const response = await next()
        return { ...response, text: response.text + ' [transformed]' }
      }
      router.use(transform)

      const res = await router.route(makeRequest())
      expect(res.text).toContain('[transformed]')
    })

    it('should allow middleware to short-circuit', async () => {
      registry.register('test', () => makeMockProvider('test'))
      const router = new LLMRouter(registry, { fallbackChain: ['test'] })

      const cached: LLMResponse = {
        text: 'cached',
        usage: { promptTokens: 0, completionTokens: 0 },
        model: 'cache',
        finishReason: 'stop',
      }

      router.use(async () => cached)

      const res = await router.route(makeRequest())
      expect(res.text).toBe('cached')
    })
  })
})

// ── TokenEstimator ──

describe('TokenEstimator', () => {
  let estimator: TokenEstimator

  beforeEach(() => {
    estimator = new TokenEstimator()
  })

  describe('estimateTokens', () => {
    it('should return 0 for empty string', () => {
      expect(estimator.estimateTokens('')).toBe(0)
    })

    it('should return 0 for null-ish input', () => {
      expect(estimator.estimateTokens(undefined as unknown as string)).toBe(0)
    })

    it('should estimate tokens for short text', () => {
      // "Hello" is 5 chars -> ceil(5/4) = 2
      expect(estimator.estimateTokens('Hello')).toBe(2)
    })

    it('should estimate tokens for longer text', () => {
      const text = 'a'.repeat(100)
      // 100 chars -> ceil(100/4) = 25
      expect(estimator.estimateTokens(text)).toBe(25)
    })

    it('should handle single character', () => {
      expect(estimator.estimateTokens('x')).toBe(1)
    })
  })

  describe('estimateCost', () => {
    it('should estimate cost for claude provider', () => {
      const provider = createClaudeProvider()
      const cost = estimator.estimateCost({ prompt: 'Hello world' }, provider)
      expect(cost).toBeGreaterThan(0)
    })

    it('should estimate cost for openai provider', () => {
      const provider = createOpenAIProvider()
      const cost = estimator.estimateCost({ prompt: 'Hello world' }, provider)
      expect(cost).toBeGreaterThan(0)
    })

    it('should return zero cost for local provider', () => {
      const provider = createLocalProvider()
      const cost = estimator.estimateCost({ prompt: 'Hello world' }, provider)
      expect(cost).toBe(0)
    })
  })
})

// ── Provider Factories ──

describe('Provider Factories', () => {
  describe('createClaudeProvider', () => {
    it('should create a provider with correct properties', () => {
      const provider = createClaudeProvider()
      expect(provider.name).toBe('claude')
      expect(provider.model).toBe('claude-sonnet-4-20250514')
      expect(provider.maxTokens).toBe(4096)
      expect(provider.capabilities.streaming).toBe(true)
      expect(provider.capabilities.tools).toBe(true)
      expect(provider.capabilities.vision).toBe(true)
      expect(provider.capabilities.embeddings).toBe(false)
    })

    it('should generate responses containing provider name', async () => {
      const provider = createClaudeProvider()
      const res = await provider.generate(makeRequest('Test'))
      expect(res.text).toContain('[Claude]')
      expect(res.model).toBe('claude-sonnet-4-20250514')
      expect(res.finishReason).toBe('stop')
    })

    it('should throw on embed call', async () => {
      const provider = createClaudeProvider()
      await expect(provider.embed({ inputs: ['test'] })).rejects.toThrow('embeddings')
    })
  })

  describe('createOpenAIProvider', () => {
    it('should create a provider with correct properties', () => {
      const provider = createOpenAIProvider()
      expect(provider.name).toBe('openai')
      expect(provider.model).toBe('gpt-4o')
      expect(provider.capabilities.embeddings).toBe(true)
    })

    it('should generate responses', async () => {
      const provider = createOpenAIProvider()
      const res = await provider.generate(makeRequest('Test'))
      expect(res.text).toContain('[OpenAI]')
    })

    it('should produce embeddings', async () => {
      const provider = createOpenAIProvider()
      const res = await provider.embed({ inputs: ['hello', 'world'] })
      expect(res.embeddings).toHaveLength(2)
      expect(res.embeddings[0]).toHaveLength(1536)
    })
  })

  describe('createLocalProvider', () => {
    it('should create a provider with correct properties', () => {
      const provider = createLocalProvider()
      expect(provider.name).toBe('local')
      expect(provider.model).toBe('llama3')
      expect(provider.maxTokens).toBe(2048)
      expect(provider.capabilities.tools).toBe(false)
    })

    it('should produce embeddings with 768 dimensions', async () => {
      const provider = createLocalProvider()
      const res = await provider.embed({ inputs: ['test'] })
      expect(res.embeddings[0]).toHaveLength(768)
    })
  })

  describe('createMockProvider', () => {
    it('should return default response when no overrides given', async () => {
      const provider = createMockProvider()
      const res = await provider.generate(makeRequest())
      expect(res.text).toBe('mock response')
      expect(res.model).toBe('mock-model')
    })

    it('should cycle through configured responses', async () => {
      const provider = createMockProvider([{ text: 'first' }, { text: 'second' }])
      const r1 = await provider.generate(makeRequest())
      const r2 = await provider.generate(makeRequest())
      expect(r1.text).toBe('first')
      expect(r2.text).toBe('second')
    })

    it('should stream text character by character', async () => {
      const provider = createMockProvider([{ text: 'abc' }])
      const chunks: string[] = []
      for await (const chunk of provider.stream(makeRequest())) {
        chunks.push(chunk.delta)
      }
      expect(chunks).toEqual(['a', 'b', 'c', ''])
      expect(chunks[chunks.length - 1]).toBe('') // done chunk has empty delta
    })

    it('should return zero vectors from embed', async () => {
      const provider = createMockProvider()
      const res = await provider.embed({ inputs: ['a', 'b'] })
      expect(res.embeddings).toHaveLength(2)
      expect(res.embeddings[0]).toHaveLength(128)
      expect(res.embeddings[0].every(v => v === 0)).toBe(true)
    })
  })
})

// ── Factory Helpers ──

describe('Factory Helpers', () => {
  describe('createLLMProviderRegistry', () => {
    it('should create a registry with built-in providers', () => {
      const registry = createLLMProviderRegistry()
      expect(registry.has('claude')).toBe(true)
      expect(registry.has('openai')).toBe(true)
      expect(registry.has('local')).toBe(true)
      expect(registry.has('mock')).toBe(true)
    })

    it('should return an LLMProviderRegistry instance', () => {
      const registry = createLLMProviderRegistry()
      expect(registry).toBeInstanceOf(LLMProviderRegistry)
    })

    it('should list four built-in providers', () => {
      const registry = createLLMProviderRegistry()
      expect(registry.list()).toHaveLength(4)
    })
  })

  describe('createLLMRouter', () => {
    it('should create a router wired to the registry', async () => {
      const registry = createLLMProviderRegistry()
      const router = createLLMRouter(registry, { defaultProvider: 'mock' })
      expect(router).toBeInstanceOf(LLMRouter)

      const res = await router.route(makeRequest())
      expect(res).toBeDefined()
      expect(res.finishReason).toBe('stop')
    })

    it('should create a router with default config', () => {
      const registry = createLLMProviderRegistry()
      const router = createLLMRouter(registry)
      expect(router).toBeInstanceOf(LLMRouter)
    })
  })
})
