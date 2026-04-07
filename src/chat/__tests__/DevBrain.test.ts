import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock the types imports since they're not available in test context
vi.mock('../types', () => ({
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
import type { DevBrainConfig } from '../DevBrain'

// Helper to create a DevBrain in offline mode
function createOfflineDevBrain(overrides?: Partial<DevBrainConfig>): DevBrain {
  return new DevBrain({
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
        temperature: 0.5,
        maxTokens: 4096,
        debugMode: true,
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
      expect(stats.localRequests).toBe(0)
      expect(stats.autoLearnCount).toBe(0)
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
      const { isSupportedImageType } = await import('../types')
      vi.mocked(isSupportedImageType).mockReturnValueOnce(false)

      await expect(brain.analyzeImage({
        imageData: 'abc',
        mediaType: 'image/bmp' as 'image/png',
      })).rejects.toThrow('Unsupported image type')
    })

    it('should reject invalid image data', async () => {
      const { validateImageData } = await import('../types')
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

    it('should deserialize state correctly', async () => {
      // Teach something first
      brain.teach('What is DevBrain?', 'DevBrain is a private developer AI module.')
      await brain.chat('Hello')

      const json = brain.serializeState()
      const restored = DevBrain.deserializeState(json)

      expect(restored.getStats().totalRequests).toBe(brain.getStats().totalRequests)
      expect(restored.getLocalBrain().getLearnedPatternCount()).toBeGreaterThan(0)
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

  // ══════════════════════════════════════════════════════════════════════════
  // FULL LOCAL BRAIN DELEGATION
  // ══════════════════════════════════════════════════════════════════════════

  describe('LocalBrain Delegation', () => {
    it('should complete code with completeCode()', () => {
      const result = brain.completeCode('function hello(')
      expect(result).toBeDefined()
      expect(result.completedCode).toBeTruthy()
      expect(result.insertion).toBeDefined()
      expect(typeof result.confidence).toBe('number')
      expect(result.explanation).toBeTruthy()
    })

    it('should complete code with cursor position', () => {
      const code = 'function hello() {\n  '
      const result = brain.completeCode(code, code.length)
      expect(result.completedCode).toBeTruthy()
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('should suggest refactorings for code', () => {
      const code = `function process(data) {
  if (data) {
    if (data.items) {
      if (data.items.length > 0) {
        for (let i = 0; i < data.items.length; i++) {
          if (data.items[i].active) {
            console.log(data.items[i].name)
          }
        }
      }
    }
  }
}`
      const suggestions = brain.suggestRefactorings(code, 'javascript')
      expect(Array.isArray(suggestions)).toBe(true)
      // Deep nesting should be detected
      for (const s of suggestions) {
        expect(s.smell).toBeTruthy()
        expect(s.description).toBeTruthy()
        expect(s.suggestion).toBeTruthy()
        expect(['high', 'medium', 'low']).toContain(s.priority)
      }
    })

    it('should assess confidence for known topics', () => {
      const result = brain.assessConfidence('How do I sort an array in javascript?')
      expect(result).toBeDefined()
      expect(typeof result.confident).toBe('boolean')
      expect(typeof result.score).toBe('number')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(1)
    })

    it('should assess confidence for unknown topics', () => {
      const result = brain.assessConfidence('xyz')
      expect(typeof result.confident).toBe('boolean')
      if (!result.confident) {
        expect(result.clarifyingQuestions).toBeDefined()
        expect(Array.isArray(result.clarifyingQuestions)).toBe(true)
      }
    })

    it('should analyze code with analyzeCode()', () => {
      const analysis = brain.analyzeCode('const x = 1;\nconst y = 2;\nconsole.log(x + y);', 'typescript')
      expect(analysis).toBeDefined()
      expect(analysis.complexity).toBeDefined()
      expect(typeof analysis.complexity.linesOfCode).toBe('number')
    })

    it('should fix code with fixCode()', () => {
      const result = brain.fixCode('const x = 1;\nconsole.log(x);', 'typescript')
      expect(result).toBeDefined()
      expect(result.summary).toBeDefined()
      expect(typeof result.summary.applied).toBe('number')
      expect(typeof result.summary.skipped).toBe('number')
    })

    it('should decompose task with decomposeTask()', () => {
      const plan = brain.decomposeTask('Build a REST API with authentication and database')
      expect(plan).toBeDefined()
      expect(Array.isArray(plan.steps)).toBe(true)
      expect(plan.steps.length).toBeGreaterThan(0)
      for (const step of plan.steps) {
        expect(step.description).toBeTruthy()
      }
    })

    it('should deep review code with deepReview()', () => {
      const review = brain.deepReview('function add(a, b) { return a + b; }', 'javascript')
      expect(review).toBeDefined()
      expect(Array.isArray(review.findings)).toBe(true)
      expect(review.summary).toBeDefined()
    })

    it('should get code learning engine', () => {
      const engine = brain.getCodeLearningEngine()
      expect(engine).toBeDefined()
    })

    it('should get conversation context', () => {
      const ctx = brain.getConversationContext()
      expect(ctx).toBeDefined()
      expect(Array.isArray(ctx.topicStack)).toBe(true)
      expect(Array.isArray(ctx.facts)).toBe(true)
    })

    it('should get user preferences', () => {
      const prefs = brain.getUserPreferences()
      expect(prefs).toBeDefined()
      expect(prefs.indentation).toBeTruthy()
      expect(prefs.quotes).toBeTruthy()
      expect(prefs.naming).toBeTruthy()
    })

    it('should set user preferences', () => {
      brain.setUserPreference('indentation', 'tabs')
      const prefs = brain.getUserPreferences()
      expect(prefs.indentation).toBe('tabs')
    })

    it('should provide feedback on turn', () => {
      // This should not throw even without conversation history
      expect(() => brain.feedbackOnTurn(0, true)).not.toThrow()
    })

    it('should get conflicts', () => {
      const conflicts = brain.getConflicts()
      expect(Array.isArray(conflicts)).toBe(true)
    })

    it('should search knowledge', () => {
      const results = brain.searchKnowledge('javascript')
      expect(Array.isArray(results)).toBe(true)
    })

    it('should search knowledge with limit', () => {
      const results = brain.searchKnowledge('programming', 5)
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeLessThanOrEqual(5)
    })

    it('should get learned pattern count', () => {
      const count = brain.getLearnedPatternCount()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })

    it('should get knowledge base size', () => {
      const size = brain.getKnowledgeBaseSize()
      expect(typeof size).toBe('number')
      expect(size).toBeGreaterThan(0) // should have built-in + dev knowledge
    })

    it('should rebuild TF-IDF index without error', () => {
      expect(() => brain.rebuildTfIdfIndex()).not.toThrow()
    })

    it('should save brain state', () => {
      expect(() => brain.save()).not.toThrow()
    })

    it('should track totalRequests for delegated methods', () => {
      const before = brain.getStats().totalRequests
      brain.completeCode('const x = ')
      brain.analyzeCode('const y = 1;')
      brain.fixCode('const z = 1;', 'typescript')
      brain.decomposeTask('build a server')
      brain.deepReview('console.log("hello")', 'javascript')
      const after = brain.getStats().totalRequests
      expect(after - before).toBe(5)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // ENHANCED METHODS (powered by LocalBrain)
  // ══════════════════════════════════════════════════════════════════════════

  describe('Enhanced Methods (offline fallback)', () => {
    it('should reason about a question', async () => {
      const result = await brain.reason('How do sorting algorithms compare?')
      expect(result).toBeDefined()
      expect(result.answer).toBeTruthy()
      expect(Array.isArray(result.steps)).toBe(true)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(typeof result.confidence).toBe('number')
      expect(typeof result.durationMs).toBe('number')
      expect(result.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('should reason with chain-of-thought steps', async () => {
      const result = await brain.reason('What is the best way to handle errors in TypeScript?')
      for (const step of result.steps) {
        expect(step.type).toBeTruthy()
        expect(step.description).toBeTruthy()
        expect(step.output).toBeTruthy()
        expect(['decompose', 'plan', 'generate', 'review', 'refine']).toContain(step.type)
      }
    })

    it('should generate multi-file project', async () => {
      const result = await brain.generateMultiFile('user authentication', 'typescript', ['component', 'test', 'types'])
      expect(result).toBeDefined()
      expect(Array.isArray(result.files)).toBe(true)
      expect(result.files.length).toBeGreaterThan(0)
      expect(typeof result.totalLines).toBe('number')
      expect(result.explanation).toBeTruthy()
      for (const file of result.files) {
        expect(file.filename).toBeTruthy()
        expect(file.content).toBeTruthy()
        expect(file.language).toBeTruthy()
        expect(typeof file.lines).toBe('number')
      }
    })

    it('should generate multi-file with inferred file types', async () => {
      const result = await brain.generateMultiFile('todo list app', 'typescript')
      expect(result.files.length).toBeGreaterThan(0)
    })

    it('should explain code', async () => {
      const result = await brain.explainCode(
        'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
        'javascript',
      )
      expect(result).toBeDefined()
      expect(result.summary).toBeTruthy()
      expect(Array.isArray(result.steps)).toBe(true)
      expect(result.complexity).toBeTruthy()
      expect(result.language).toBeTruthy()
      expect(Array.isArray(result.concepts)).toBe(true)
    })

    it('should explain code without explicit language', async () => {
      const result = await brain.explainCode('def greet(name):\n  print(f"Hello {name}")')
      expect(result.summary).toBeTruthy()
    })

    it('should track stats for enhanced methods', async () => {
      const before = brain.getStats()
      await brain.reason('test question')
      await brain.generateMultiFile('test', 'typescript')
      await brain.explainCode('const x = 1;')
      const after = brain.getStats()
      expect(after.totalReasoning - before.totalReasoning).toBe(1)
      expect(after.totalMultiFileGenerations - before.totalMultiFileGenerations).toBe(1)
      expect(after.totalCodeExplanations - before.totalCodeExplanations).toBe(1)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // CODING TRAINING INTELLIGENCE
  // ══════════════════════════════════════════════════════════════════════════

  describe('Coding Training Intelligence', () => {
    describe('generateExercise', () => {
      it('should generate a beginner exercise', async () => {
        const exercise = await brain.generateExercise('variables', 'beginner', 'javascript')
        expect(exercise).toBeDefined()
        expect(exercise.title).toBeTruthy()
        expect(exercise.description).toBeTruthy()
        expect(exercise.difficulty).toBe('beginner')
        expect(exercise.language).toBe('javascript')
        expect(exercise.starterCode).toBeTruthy()
        expect(Array.isArray(exercise.hints)).toBe(true)
        expect(exercise.hints.length).toBeGreaterThan(0)
        expect(exercise.solution).toBeTruthy()
        expect(Array.isArray(exercise.concepts)).toBe(true)
        expect(typeof exercise.estimatedMinutes).toBe('number')
        expect(exercise.estimatedMinutes).toBeGreaterThan(0)
      })

      it('should generate an advanced exercise', async () => {
        const exercise = await brain.generateExercise('algorithms', 'advanced', 'typescript')
        expect(exercise.difficulty).toBe('advanced')
        expect(exercise.language).toBe('typescript')
        expect(exercise.estimatedMinutes).toBeGreaterThan(0)
      })

      it('should generate exercises for different languages', async () => {
        const jsExercise = await brain.generateExercise('loops', 'beginner', 'javascript')
        const pyExercise = await brain.generateExercise('loops', 'beginner', 'python')
        expect(jsExercise.language).toBe('javascript')
        expect(pyExercise.language).toBe('python')
      })

      it('should track exercise generation stats', async () => {
        const before = brain.getStats().totalExercisesGenerated
        await brain.generateExercise('arrays', 'intermediate', 'typescript')
        expect(brain.getStats().totalExercisesGenerated).toBe(before + 1)
      })
    })

    describe('evaluateCode', () => {
      it('should evaluate code submission', async () => {
        const exercise = await brain.generateExercise('variables', 'beginner', 'javascript')
        const evaluation = await brain.evaluateCode(
          'const x = 5;\nconsole.log(x);',
          exercise,
          'javascript',
        )
        expect(evaluation).toBeDefined()
        expect(typeof evaluation.score).toBe('number')
        expect(evaluation.score).toBeGreaterThanOrEqual(0)
        expect(evaluation.score).toBeLessThanOrEqual(100)
        expect(typeof evaluation.passed).toBe('boolean')
        expect(Array.isArray(evaluation.feedback)).toBe(true)
        expect(Array.isArray(evaluation.improvements)).toBe(true)
        expect(Array.isArray(evaluation.conceptsUsed)).toBe(true)
        expect(['poor', 'fair', 'good', 'excellent']).toContain(evaluation.codeQuality)
      })

      it('should evaluate empty code as poor', async () => {
        const exercise = await brain.generateExercise('functions', 'beginner', 'javascript')
        const evaluation = await brain.evaluateCode('', exercise, 'javascript')
        expect(evaluation.score).toBeLessThan(50)
        expect(evaluation.codeQuality).toBe('poor')
      })

      it('should track evaluation stats', async () => {
        const before = brain.getStats().totalCodeEvaluations
        const exercise = await brain.generateExercise('variables', 'beginner', 'javascript')
        await brain.evaluateCode('const x = 1;', exercise, 'javascript')
        expect(brain.getStats().totalCodeEvaluations).toBe(before + 1)
      })
    })

    describe('getCodingSkillAssessment', () => {
      it('should assess beginner skill level', () => {
        const assessment = brain.getCodingSkillAssessment('javascript')
        expect(assessment).toBeDefined()
        expect(assessment.language).toBe('javascript')
        expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(assessment.level)
        expect(Array.isArray(assessment.strengths)).toBe(true)
        expect(Array.isArray(assessment.weaknesses)).toBe(true)
        expect(typeof assessment.totalInteractions).toBe('number')
        expect(['improving', 'stable', 'declining']).toContain(assessment.codeQualityTrend)
        expect(Array.isArray(assessment.recommendedTopics)).toBe(true)
        expect(assessment.recommendedTopics.length).toBeGreaterThan(0)
      })

      it('should track skill assessment stats', () => {
        const before = brain.getStats().totalSkillAssessments
        brain.getCodingSkillAssessment('python')
        expect(brain.getStats().totalSkillAssessments).toBe(before + 1)
      })

      it('should work for different languages', () => {
        const jsAssessment = brain.getCodingSkillAssessment('javascript')
        const pyAssessment = brain.getCodingSkillAssessment('python')
        expect(jsAssessment.language).toBe('javascript')
        expect(pyAssessment.language).toBe('python')
      })
    })

    describe('getTrainingPlan', () => {
      it('should create a beginner training plan', () => {
        const plan = brain.getTrainingPlan('javascript', 'beginner', ['learn basics'])
        expect(plan).toBeDefined()
        expect(plan.language).toBe('javascript')
        expect(plan.currentLevel).toBe('beginner')
        expect(plan.targetLevel).toBeTruthy()
        expect(Array.isArray(plan.topics)).toBe(true)
        expect(plan.topics.length).toBeGreaterThan(0)
        expect(typeof plan.estimatedWeeks).toBe('number')
        expect(plan.estimatedWeeks).toBeGreaterThan(0)
        expect(typeof plan.dailyMinutes).toBe('number')
        expect(plan.dailyMinutes).toBeGreaterThan(0)
      })

      it('should create training plan with ordered topics', () => {
        const plan = brain.getTrainingPlan('typescript', 'intermediate', ['async programming', 'testing'])
        for (let i = 1; i < plan.topics.length; i++) {
          expect(plan.topics[i]!.order).toBeGreaterThanOrEqual(plan.topics[i - 1]!.order)
        }
      })

      it('should have topics with exercises', () => {
        const plan = brain.getTrainingPlan('python', 'beginner', ['data structures'])
        for (const topic of plan.topics) {
          expect(topic.name).toBeTruthy()
          expect(topic.description).toBeTruthy()
          expect(Array.isArray(topic.exercises)).toBe(true)
          expect(Array.isArray(topic.resources)).toBe(true)
          expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(topic.difficulty)
        }
      })

      it('should track training plan stats', () => {
        const before = brain.getStats().totalTrainingPlans
        brain.getTrainingPlan('go', 'beginner', ['concurrency'])
        expect(brain.getStats().totalTrainingPlans).toBe(before + 1)
      })
    })

    describe('explainConcept', () => {
      it('should explain a programming concept', async () => {
        const result = await brain.explainConcept('recursion', 'javascript', 'beginner')
        expect(result).toBeDefined()
        expect(result.concept).toBe('recursion')
        expect(result.explanation).toBeTruthy()
        expect(Array.isArray(result.examples)).toBe(true)
        expect(Array.isArray(result.relatedConcepts)).toBe(true)
      })

      it('should explain concept without language', async () => {
        const result = await brain.explainConcept('design patterns')
        expect(result.concept).toBe('design patterns')
        expect(result.explanation).toBeTruthy()
      })

      it('should explain concept without difficulty', async () => {
        const result = await brain.explainConcept('closures', 'javascript')
        expect(result.explanation).toBeTruthy()
      })
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // NEW STATS TRACKING
  // ══════════════════════════════════════════════════════════════════════════

  describe('New Stats Tracking', () => {
    it('should have all new stat fields initialized to zero', () => {
      const stats = brain.getStats()
      expect(stats.totalExercisesGenerated).toBe(0)
      expect(stats.totalCodeEvaluations).toBe(0)
      expect(stats.totalSkillAssessments).toBe(0)
      expect(stats.totalTrainingPlans).toBe(0)
      expect(stats.totalReasoning).toBe(0)
      expect(stats.totalMultiFileGenerations).toBe(0)
      expect(stats.totalCodeCompletions).toBe(0)
      expect(stats.totalCodeExplanations).toBe(0)
    })

    it('should increment code completion stats', () => {
      brain.completeCode('function test(')
      expect(brain.getStats().totalCodeCompletions).toBe(1)
    })

    it('should increment all new stats correctly across operations', async () => {
      await brain.reason('what is recursion')
      await brain.generateMultiFile('api', 'typescript')
      await brain.explainCode('const x = 1;')
      await brain.generateExercise('loops', 'beginner', 'javascript')
      brain.getCodingSkillAssessment('typescript')
      brain.getTrainingPlan('python', 'beginner', ['basics'])
      brain.completeCode('const a = ')

      const stats = brain.getStats()
      expect(stats.totalReasoning).toBe(1)
      expect(stats.totalMultiFileGenerations).toBe(1)
      expect(stats.totalCodeExplanations).toBe(1)
      expect(stats.totalExercisesGenerated).toBe(1)
      expect(stats.totalSkillAssessments).toBe(1)
      expect(stats.totalTrainingPlans).toBe(1)
      expect(stats.totalCodeCompletions).toBe(1)
    })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // PERSISTENCE WITH NEW STATE
  // ══════════════════════════════════════════════════════════════════════════

  describe('Persistence with New Features', () => {
    it('should serialize and deserialize state with new stats', async () => {
      await brain.reason('test')
      brain.completeCode('const x = ')
      brain.getCodingSkillAssessment('javascript')

      const serialized = brain.serializeState()
      const restored = DevBrain.deserializeState(serialized)

      expect(restored.getStats().totalReasoning).toBe(1)
      expect(restored.getStats().totalCodeCompletions).toBe(1)
      expect(restored.getStats().totalSkillAssessments).toBe(1)
    })

    it('should preserve learned knowledge through serialization', () => {
      brain.teach('What is a closure?', 'A closure is a function that captures variables from its enclosing scope.')
      brain.addKnowledge('training', ['exercise', 'practice'], 'Coding exercises help reinforce learning.')

      const serialized = brain.serializeState()
      const restored = DevBrain.deserializeState(serialized)

      expect(restored.getLearnedPatternCount()).toBeGreaterThanOrEqual(1)
    })
  })
})
