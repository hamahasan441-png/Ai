import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock the AiChat imports since they're not available in test context
vi.mock('../AiChat', () => ({
  estimateComplexity: vi.fn(() => 'O(n)'),
  getCodeTemplate: vi.fn(() => null),
  getLanguageInfo: vi.fn(() => ({ name: 'TypeScript', extension: '.ts', comment: '//' })),
  formatCode: vi.fn((code: string) => code),
  isSupportedImageType: vi.fn(() => true),
  validateImageData: vi.fn(() => true),
  parseImageAnalysis: vi.fn((desc: string) => ({
    description: desc,
    tags: [],
    objects: [],
    text: [],
    confidence: 0.5,
  })),
}))

// Mock fs and path for persistence tests
vi.mock('fs', () => {
  const store = new Map<string, string>()
  return {
    existsSync: vi.fn((p: string) => store.has(p)),
    writeFileSync: vi.fn((p: string, data: string) => { store.set(p, data) }),
    readFileSync: vi.fn((p: string) => {
      if (store.has(p)) return store.get(p)
      throw new Error('ENOENT')
    }),
    mkdirSync: vi.fn(),
    renameSync: vi.fn((from: string, to: string) => {
      const data = store.get(from)
      if (data) {
        store.set(to, data)
        store.delete(from)
      }
    }),
    unlinkSync: vi.fn((p: string) => { store.delete(p) }),
    __store: store,
  }
})

vi.mock('path', () => ({
  dirname: vi.fn((p: string) => p.split('/').slice(0, -1).join('/') || '/'),
  join: vi.fn((...parts: string[]) => parts.join('/')),
}))

import { DevBrain } from '../DevBrain'
import type { DevBrainConfig, DevBrainStats, DevBrainLogEntry } from '../DevBrain'

// Helper to create a DevBrain with no API key (offline-only mode)
function createOfflineDevBrain(overrides?: Partial<DevBrainConfig>): DevBrain {
  return new DevBrain({
    offlineFallback: true,
    localThinkFirst: true,
    autoLearn: true,
    debugMode: false,
    ...overrides,
  })
}

describe('DevBrain', () => {
  let brain: DevBrain

  beforeEach(() => {
    brain = createOfflineDevBrain()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ══════════════════════════════════════════════════════════════════════════
  // CONSTRUCTION
  // ══════════════════════════════════════════════════════════════════════════

  describe('Construction', () => {
    it('should create with default config', () => {
      const dev = new DevBrain()
      expect(dev).toBeInstanceOf(DevBrain)
      expect(dev.getModel()).toContain('dev-local')
    })

    it('should create with custom config', () => {
      const dev = new DevBrain({
        openaiModel: 'gpt-4',
        temperature: 0.5,
        maxTokens: 4096,
        debugMode: true,
        localThinkFirst: false,
      })
      expect(dev).toBeInstanceOf(DevBrain)
    })

    it('should create with custom local brain config', () => {
      const dev = new DevBrain({
        localBrainConfig: {
          creativity: 0.9,
          maxLearnedPatterns: 5000,
          learningEnabled: true,
        },
      })
      expect(dev).toBeInstanceOf(DevBrain)
      expect(dev.getLocalBrain()).toBeDefined()
    })

    it('should initialize stats correctly', () => {
      const stats = brain.getStats()
      expect(stats.totalRequests).toBe(0)
      expect(stats.openaiRequests).toBe(0)
      expect(stats.localRequests).toBe(0)
      expect(stats.hybridRequests).toBe(0)
      expect(stats.fallbackCount).toBe(0)
      expect(stats.autoLearnCount).toBe(0)
      expect(stats.rawPromptsUsed).toBe(0)
      expect(stats.systemOverridesUsed).toBe(0)
      expect(stats.createdAt).toBeTruthy()
    })

    it('should have empty debug log initially', () => {
      const log = brain.getDebugLog()
      expect(log).toHaveLength(0)
    })

    it('should inject dev knowledge into local brain', () => {
      const localBrain = brain.getLocalBrain()
      // Dev knowledge adds entries, so the knowledge base should be larger than default
      expect(localBrain.getKnowledgeBaseSize()).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // CHAT — Offline mode (no API key)
  // ══════════════════════════════════════════════════════════════════════════

  describe('Chat (offline)', () => {
    it('should chat using local brain when no API key', async () => {
      const result = await brain.chat('What is TypeScript?')
      expect(result.text).toBeTruthy()
      expect(result.usage).toBeDefined()
      expect(result.usage.inputTokens).toBeGreaterThanOrEqual(0)
      expect(result.usage.outputTokens).toBeGreaterThanOrEqual(0)
      expect(result.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('should increment stats on chat', async () => {
      await brain.chat('Hello')
      const stats = brain.getStats()
      expect(stats.totalRequests).toBe(1)
      expect(stats.localRequests).toBe(1)
    })

    it('should handle multiple chats', async () => {
      await brain.chat('What is TypeScript?')
      await brain.chat('What is Rust?')
      await brain.chat('What are design patterns?')
      const stats = brain.getStats()
      expect(stats.totalRequests).toBe(3)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // WRITE CODE — Offline mode
  // ══════════════════════════════════════════════════════════════════════════

  describe('Write Code (offline)', () => {
    it('should write code using local brain', async () => {
      const result = await brain.writeCode({
        description: 'sort an array',
        language: 'typescript',
      })
      expect(result.code).toBeTruthy()
      expect(result.language).toBe('typescript')
      expect(result.explanation).toBeTruthy()
      expect(result.linesOfCode).toBeGreaterThan(0)
    })

    it('should write code for different languages', async () => {
      const resultPy = await brain.writeCode({
        description: 'binary search',
        language: 'python',
      })
      expect(resultPy.language).toBe('python')
      expect(resultPy.code).toBeTruthy()
    })

    it('should write code with production style', async () => {
      const result = await brain.writeCode({
        description: 'HTTP server',
        language: 'typescript',
        style: 'production',
      })
      expect(result.code).toBeTruthy()
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // REVIEW CODE — Offline mode
  // ══════════════════════════════════════════════════════════════════════════

  describe('Review Code (offline)', () => {
    it('should review code using local brain', async () => {
      const result = await brain.reviewCode({
        code: 'function foo(x) { return x == null }',
        language: 'javascript',
      })
      expect(result).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.summary).toBeTruthy()
    })

    it('should detect issues in code', async () => {
      const result = await brain.reviewCode({
        code: 'const x = 1;\nconsole.log(y);',
        language: 'typescript',
        focus: ['bugs'],
      })
      expect(result).toBeDefined()
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // ANALYZE IMAGE — Offline mode
  // ══════════════════════════════════════════════════════════════════════════

  describe('Analyze Image (offline)', () => {
    it('should analyze image using local brain', async () => {
      const result = await brain.analyzeImage({
        imageData: 'iVBORw0KGgoAAAANSUhEUg==',  // minimal valid-ish base64
        mediaType: 'image/png',
      })
      expect(result).toBeDefined()
      expect(result.description).toBeTruthy()
    })

    it('should reject unsupported image types', async () => {
      const { isSupportedImageType } = await import('../AiChat')
      vi.mocked(isSupportedImageType).mockReturnValueOnce(false)

      await expect(brain.analyzeImage({
        imageData: 'abc',
        mediaType: 'image/bmp' as 'image/png',
      })).rejects.toThrow('Unsupported image type')
    })

    it('should reject invalid image data', async () => {
      const { validateImageData } = await import('../AiChat')
      vi.mocked(validateImageData).mockReturnValueOnce(false)

      await expect(brain.analyzeImage({
        imageData: 'invalid',
        mediaType: 'image/png',
      })).rejects.toThrow('Invalid image data')
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // MODEL MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  describe('Model Management', () => {
    it('should return local model when offline', () => {
      const model = brain.getModel()
      expect(model).toContain('dev-local')
    })

    it('should set model', () => {
      brain.setModel('gpt-4-turbo')
      // Since no API key, still returns local model
      expect(brain.getModel()).toContain('dev-local')
    })

    it('should clear history', () => {
      brain.clearHistory()
      // Should not throw
      expect(true).toBe(true)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // DEV TOOLS — Teaching, Knowledge, Feedback
  // ══════════════════════════════════════════════════════════════════════════

  describe('Dev Tools', () => {
    it('should teach the brain', () => {
      brain.teach('What is Docker?', 'Docker is a containerization platform.')
      // Verify through local brain
      const localBrain = brain.getLocalBrain()
      expect(localBrain.getLearnedPatternCount()).toBeGreaterThan(0)
    })

    it('should add knowledge', () => {
      const sizeBefore = brain.getLocalBrain().getKnowledgeBaseSize()
      brain.addKnowledge('custom', ['test', 'knowledge'], 'This is custom knowledge.')
      expect(brain.getLocalBrain().getKnowledgeBaseSize()).toBe(sizeBefore + 1)
    })

    it('should handle feedback', () => {
      // Should not throw even without prior chat
      brain.feedback(true)
      brain.feedback(false, 'The correct answer is...')
    })

    it('should expose local brain', () => {
      const localBrain = brain.getLocalBrain()
      expect(localBrain).toBeDefined()
      expect(localBrain.getModel()).toBe('dev-local-v1')
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // DEBUG MODE
  // ══════════════════════════════════════════════════════════════════════════

  describe('Debug Mode', () => {
    it('should log interactions in debug mode', async () => {
      const devDebug = new DevBrain({ debugMode: true })
      await devDebug.chat('What is TypeScript?')

      const log = devDebug.getDebugLog()
      expect(log.length).toBeGreaterThan(0)

      const entry = log[0]!
      expect(entry.action).toBe('chat')
      expect(entry.input).toBeTruthy()
      expect(entry.finalOutput).toBeTruthy()
      expect(entry.timestamp).toBeTruthy()
      expect(entry.provider).toBe('local')
      expect(entry.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('should not log when debug mode is off', async () => {
      await brain.chat('Hello')
      expect(brain.getDebugLog()).toHaveLength(0)
    })

    it('should clear debug log', async () => {
      const devDebug = new DevBrain({ debugMode: true })
      await devDebug.chat('Hello')
      expect(devDebug.getDebugLog().length).toBeGreaterThan(0)

      devDebug.clearDebugLog()
      expect(devDebug.getDebugLog()).toHaveLength(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // OPENAI STATUS
  // ══════════════════════════════════════════════════════════════════════════

  describe('OpenAI Status', () => {
    it('should report OpenAI unavailable without key', () => {
      expect(brain.isOpenAIAvailable()).toBe(false)
    })

    it('should reset OpenAI status', () => {
      brain.resetOpenAIStatus()
      // Without API key, still unavailable
      expect(brain.isOpenAIAvailable()).toBe(false)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // RAW PROMPT & SYSTEM OVERRIDE (no API key — should throw)
  // ══════════════════════════════════════════════════════════════════════════

  describe('Raw Prompt (no key)', () => {
    it('should throw when rawPrompt called without API key', async () => {
      await expect(brain.rawPrompt('test')).rejects.toThrow('No OpenAI API key')
    })

    it('should track rawPromptsUsed stat even on failure', async () => {
      try { await brain.rawPrompt('test') } catch { /* expected */ }
      expect(brain.getStats().rawPromptsUsed).toBe(1)
    })
  })

  describe('Chat with System Override (no key)', () => {
    it('should throw when chatWithSystem called without API key', async () => {
      await expect(brain.chatWithSystem('custom system', 'hello')).rejects.toThrow('No OpenAI API key')
    })

    it('should track systemOverridesUsed stat even on failure', async () => {
      try { await brain.chatWithSystem('sys', 'msg') } catch { /* expected */ }
      expect(brain.getStats().systemOverridesUsed).toBe(1)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ══════════════════════════════════════════════════════════════════════════

  describe('Persistence', () => {
    it('should serialize state to JSON', () => {
      const json = brain.serializeState()
      expect(json).toBeTruthy()
      const parsed = JSON.parse(json)
      expect(parsed.config).toBeDefined()
      expect(parsed.localBrainState).toBeTruthy()
      expect(parsed.stats).toBeDefined()
    })

    it('should not include API key in serialized state', () => {
      const brainWithKey = new DevBrain({ openaiApiKey: 'sk-secret-key-12345' })
      const json = brainWithKey.serializeState()
      expect(json).not.toContain('sk-secret-key-12345')
    })

    it('should deserialize state correctly', async () => {
      // Teach something first
      brain.teach('What is DevBrain?', 'DevBrain is a private developer AI module.')
      await brain.chat('Hello')

      const json = brain.serializeState()
      const restored = DevBrain.deserializeState(json)

      expect(restored.getStats().totalRequests).toBe(brain.getStats().totalRequests)
      expect(restored.getLocalBrain().getLearnedPatternCount()).toBeGreaterThan(0)
    })

    it('should re-inject API key on deserialization', () => {
      const json = brain.serializeState()
      const restored = DevBrain.deserializeState(json, 'sk-new-key')
      // The restored brain should have the new key configured
      expect(restored).toBeInstanceOf(DevBrain)
    })

    it('should include debug log in state when debug mode is on', async () => {
      const devDebug = new DevBrain({ debugMode: true })
      await devDebug.chat('test')

      const json = devDebug.serializeState()
      const parsed = JSON.parse(json)
      expect(parsed.debugLog.length).toBeGreaterThan(0)
    })

    it('should exclude debug log when debug mode is off', () => {
      const json = brain.serializeState()
      const parsed = JSON.parse(json)
      expect(parsed.debugLog).toHaveLength(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // STATS TRACKING
  // ══════════════════════════════════════════════════════════════════════════

  describe('Stats', () => {
    it('should track total requests', async () => {
      await brain.chat('a')
      await brain.chat('b')
      await brain.writeCode({ description: 'hello', language: 'typescript' })
      expect(brain.getStats().totalRequests).toBe(3)
    })

    it('should track local requests when offline', async () => {
      await brain.chat('test')
      expect(brain.getStats().localRequests).toBeGreaterThan(0)
    })

    it('should return a copy of stats (immutable)', () => {
      const stats1 = brain.getStats()
      const stats2 = brain.getStats()
      expect(stats1).not.toBe(stats2)
      expect(stats1).toEqual(stats2)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // OPENAI INTEGRATION (mocked)
  // ══════════════════════════════════════════════════════════════════════════

  describe('OpenAI Integration (mocked)', () => {
    let devWithKey: DevBrain

    beforeEach(() => {
      devWithKey = new DevBrain({
        openaiApiKey: 'sk-test-key',
        autoLearn: true,
        localThinkFirst: true,
        debugMode: true,
      })
    })

    it('should report model as openai when key is present and available', () => {
      const model = devWithKey.getModel()
      expect(model).toContain('openai:gpt-4o')
    })

    it('should fall back to local on API failure', async () => {
      // Mock fetch to fail
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await devWithKey.chat('Hello')

      // Should get a response from local brain fallback
      expect(result.text).toBeTruthy()
      expect(devWithKey.getStats().fallbackCount).toBeGreaterThan(0)

      globalThis.fetch = originalFetch
    })

    it('should handle OpenAI API success', async () => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'OpenAI response: TypeScript is great!' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        }),
      }) as unknown as typeof fetch

      const result = await devWithKey.chat('What is TypeScript?')

      expect(result.text).toBe('OpenAI response: TypeScript is great!')
      expect(result.usage.inputTokens).toBe(10)
      expect(result.usage.outputTokens).toBe(20)
      expect(devWithKey.getStats().openaiRequests).toBe(1)
      expect(devWithKey.getStats().openaiAvailable).toBe(true)

      globalThis.fetch = originalFetch
    })

    it('should auto-learn from OpenAI responses', async () => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'A detailed response about containers and Docker internals.' } }],
          usage: { prompt_tokens: 15, completion_tokens: 25, total_tokens: 40 },
        }),
      }) as unknown as typeof fetch

      await devWithKey.chat('Explain Docker')

      expect(devWithKey.getStats().autoLearnCount).toBeGreaterThan(0)
      expect(devWithKey.getLocalBrain().getLearnedPatternCount()).toBeGreaterThan(0)

      globalThis.fetch = originalFetch
    })

    it('should include local thinking context in OpenAI request', async () => {
      const originalFetch = globalThis.fetch
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Enhanced response' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        }),
      })
      globalThis.fetch = fetchMock as unknown as typeof fetch

      await devWithKey.chat('What is TypeScript?')

      // Check that the fetch was called with enhanced message containing local analysis
      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
      const lastMessage = callBody.messages[callBody.messages.length - 1]
      expect(lastMessage.content).toContain('[Local Analysis]')
      expect(lastMessage.content).toContain('[User Query]')

      globalThis.fetch = originalFetch
    })

    it('should create debug log entries for hybrid requests', async () => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Response' } }],
          usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
        }),
      }) as unknown as typeof fetch

      await devWithKey.chat('Test message')

      const log = devWithKey.getDebugLog()
      expect(log.length).toBeGreaterThan(0)
      expect(log[0]!.provider).toBe('hybrid')
      expect(log[0]!.localThinking).toBeTruthy()
      expect(log[0]!.openaiResponse).toBeTruthy()

      globalThis.fetch = originalFetch
    })

    it('should handle writeCode with OpenAI', async () => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '```typescript\nfunction sort(arr: number[]): number[] {\n  return arr.sort((a, b) => a - b);\n}\n```\nA simple sorting function.' } }],
          usage: { prompt_tokens: 10, completion_tokens: 30, total_tokens: 40 },
        }),
      }) as unknown as typeof fetch

      const result = await devWithKey.writeCode({
        description: 'sort an array',
        language: 'typescript',
      })

      expect(result.code).toContain('function sort')
      expect(result.language).toBe('typescript')
      expect(devWithKey.getStats().openaiRequests).toBe(1)

      globalThis.fetch = originalFetch
    })

    it('should handle reviewCode with OpenAI', async () => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: '[warning] line 1: Use === instead of ==\n[error] line 2: Undefined variable\nScore: 65/100\nSummary: Needs improvement.' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        }),
      }) as unknown as typeof fetch

      const result = await devWithKey.reviewCode({
        code: 'const x = 1; if (x == 2) {}',
        language: 'javascript',
      })

      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.score).toBe(65)
      expect(result.summary).toContain('Needs improvement')

      globalThis.fetch = originalFetch
    })

    it('should handle rawPrompt with API key', async () => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Raw response' } }],
          usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
        }),
      }) as unknown as typeof fetch

      const result = await devWithKey.rawPrompt('Direct prompt')

      expect(result.text).toBe('Raw response')
      expect(devWithKey.getStats().rawPromptsUsed).toBe(1)

      globalThis.fetch = originalFetch
    })

    it('should handle chatWithSystem with API key', async () => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Custom system response' } }],
          usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
        }),
      }) as unknown as typeof fetch

      const result = await devWithKey.chatWithSystem('You are a kernel developer', 'Explain mmap')

      expect(result.text).toBe('Custom system response')
      expect(devWithKey.getStats().systemOverridesUsed).toBe(1)

      globalThis.fetch = originalFetch
    })

    it('should handle API error response', async () => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limited'),
      }) as unknown as typeof fetch

      // With offline fallback, should still get a response
      const result = await devWithKey.chat('Hello')
      expect(result.text).toBeTruthy()
      expect(devWithKey.getStats().fallbackCount).toBeGreaterThan(0)

      globalThis.fetch = originalFetch
    })

    it('should throw API error when fallback is disabled', async () => {
      const devNoFallback = new DevBrain({
        openaiApiKey: 'sk-test',
        offlineFallback: false,
      })

      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(devNoFallback.chat('Hello')).rejects.toThrow()

      globalThis.fetch = originalFetch
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // EDGE CASES
  // ══════════════════════════════════════════════════════════════════════════

  describe('Edge Cases', () => {
    it('should handle empty messages', async () => {
      const result = await brain.chat('')
      expect(result.text).toBeTruthy()
    })

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(10000)
      const result = await brain.chat(longMessage)
      expect(result.text).toBeTruthy()
    })

    it('should handle special characters in messages', async () => {
      const result = await brain.chat('What about <script>alert("xss")</script>?')
      expect(result.text).toBeTruthy()
    })

    it('should handle concurrent requests', async () => {
      const results = await Promise.all([
        brain.chat('Question 1'),
        brain.chat('Question 2'),
        brain.chat('Question 3'),
      ])

      expect(results).toHaveLength(3)
      for (const result of results) {
        expect(result.text).toBeTruthy()
      }
    })
  })
})
