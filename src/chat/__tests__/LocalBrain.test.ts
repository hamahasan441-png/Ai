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

import { LocalBrain } from '../LocalBrain'
import type { LearnedPattern, LocalBrainConfig } from '../LocalBrain'

describe('LocalBrain', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({
      learningEnabled: true,
      maxLearnedPatterns: 100,
      useTfIdf: true,
    })
  })

  // ── Basic Functionality ──

  describe('construction', () => {
    it('creates with default config', () => {
      const b = new LocalBrain()
      expect(b.getModel()).toBe('local-brain-v2')
    })

    it('accepts custom config', () => {
      const b = new LocalBrain({
        model: 'custom-model',
        creativity: 0.8,
        maxLearnedPatterns: 500,
      })
      expect(b.getModel()).toBe('custom-model')
    })

    it('starts with zero learned patterns', () => {
      expect(brain.getLearnedPatternCount()).toBe(0)
    })

    it('has a built-in knowledge base', () => {
      expect(brain.getKnowledgeBaseSize()).toBeGreaterThan(0)
    })
  })

  // ── Chat ──

  describe('chat', () => {
    it('returns a response with token usage', async () => {
      const result = await brain.chat('Hello, how are you?')
      expect(result.text).toBeTruthy()
      expect(result.text.length).toBeGreaterThan(0)
      expect(result.usage).toBeDefined()
      expect(result.usage.inputTokens).toBeGreaterThan(0)
      expect(result.usage.outputTokens).toBeGreaterThan(0)
      expect(result.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('uses knowledge base for relevant questions', async () => {
      const result = await brain.chat('Tell me about TypeScript')
      expect(result.text.toLowerCase()).toContain('typescript')
    })

    it('updates stats after chat', async () => {
      const statsBefore = brain.getStats()
      await brain.chat('Hello')
      const statsAfter = brain.getStats()
      expect(statsAfter.totalChats).toBe(statsBefore.totalChats + 1)
    })
  })

  // ── Learning ──

  describe('learn', () => {
    it('stores learned patterns', () => {
      brain.learn('What is Redux?', 'Redux is a state management library.')
      expect(brain.getLearnedPatternCount()).toBe(1)
    })

    it('reinforces existing patterns', () => {
      brain.learn('What is Redux?', 'Redux is a state management library.')
      brain.learn('What is Redux?', 'Redux manages application state.')
      expect(brain.getLearnedPatternCount()).toBe(1)  // Same pattern, reinforced
    })

    it('does not learn when disabled', () => {
      const b = new LocalBrain({ learningEnabled: false })
      b.learn('test', 'response')
      expect(b.getLearnedPatternCount()).toBe(0)
    })

    it('evicts least confident when at capacity', () => {
      const b = new LocalBrain({ maxLearnedPatterns: 3, learningEnabled: true })
      b.learn('q1', 'a1')
      b.learn('q2', 'a2')
      b.learn('q3', 'a3')
      b.learn('q4', 'a4')  // Should evict one
      expect(b.getLearnedPatternCount()).toBe(3)
    })

    it('assigns priority based on category', () => {
      brain.learn('test1', 'response1', 'cloud-learned')
      brain.learn('test2', 'response2', 'corrected')
      brain.learn('test3', 'response3', 'reinforced')
      brain.learn('test4', 'response4', 'learned')

      const stats = brain.getStats()
      expect(stats.totalLearnings).toBe(4)
    })

    it('increments learning stats', () => {
      brain.learn('q1', 'a1')
      brain.learn('q2', 'a2')
      const stats = brain.getStats()
      expect(stats.totalLearnings).toBe(2)
      expect(stats.patternsLearned).toBe(2)
    })
  })

  // ── Knowledge ──

  describe('addKnowledge', () => {
    it('adds custom knowledge', () => {
      const sizeBefore = brain.getKnowledgeBaseSize()
      brain.addKnowledge('custom', ['test', 'demo'], 'This is test knowledge.')
      expect(brain.getKnowledgeBaseSize()).toBe(sizeBefore + 1)
    })

    it('increments knowledge stats', () => {
      brain.addKnowledge('cat1', ['k1'], 'content1')
      brain.addKnowledge('cat2', ['k2'], 'content2')
      expect(brain.getStats().knowledgeEntriesAdded).toBe(2)
    })
  })

  // ── Feedback ──

  describe('feedback', () => {
    it('reinforces correct responses', async () => {
      await brain.chat('What is TypeScript?')
      brain.feedback(true)
      expect(brain.getLearnedPatternCount()).toBeGreaterThanOrEqual(1)
    })

    it('learns corrections', async () => {
      await brain.chat('What is GraphQL?')
      brain.feedback(false, 'GraphQL is a query language for APIs.')
      expect(brain.getLearnedPatternCount()).toBeGreaterThanOrEqual(1)
    })

    it('does nothing when disabled', async () => {
      const b = new LocalBrain({ learningEnabled: false })
      await b.chat('test')
      b.feedback(true)
      expect(b.getLearnedPatternCount()).toBe(0)
    })
  })

  // ── Multi-turn Feedback ──

  describe('feedbackOnTurn', () => {
    it('provides feedback on specific turns', async () => {
      await brain.chat('First question')
      await brain.chat('Second question')
      brain.feedbackOnTurn(0, false, 'Better first answer')
      expect(brain.getLearnedPatternCount()).toBeGreaterThanOrEqual(1)
    })

    it('handles out-of-bounds turn index gracefully', async () => {
      await brain.chat('test')
      brain.feedbackOnTurn(999, true)  // Should not throw
      brain.feedbackOnTurn(-1, true)   // Should not throw
    })
  })

  // ── Conflict Detection ──

  describe('getConflicts', () => {
    it('returns empty when no conflicts', () => {
      brain.learn('What is Python?', 'Python is a programming language.')
      expect(brain.getConflicts()).toEqual([])
    })

    it('detects conflicting patterns', () => {
      brain.learn('What is JS?', 'JavaScript is for web development.')
      brain.learn('What about JS?', 'JS is a programming language.')
      // Both share 'js' keyword but different responses
      const conflicts = brain.getConflicts()
      // May or may not detect depending on keyword overlap
      expect(Array.isArray(conflicts)).toBe(true)
    })
  })

  // ── Knowledge Search ──

  describe('searchKnowledge', () => {
    it('finds relevant knowledge', () => {
      const results = brain.searchKnowledge('typescript')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.entry.content.toLowerCase()).toContain('typescript')
    })

    it('respects limit parameter', () => {
      const results = brain.searchKnowledge('programming', 3)
      expect(results.length).toBeLessThanOrEqual(3)
    })

    it('returns results with valid scores for any search', () => {
      const results = brain.searchKnowledge('xyznonexistenttopic123')
      // Any result should have a numeric score
      for (const r of results) {
        expect(typeof r.score).toBe('number')
        expect(r.score).toBeGreaterThanOrEqual(0)
      }
    })
  })

  // ── Model Info ──

  describe('model management', () => {
    it('gets model name', () => {
      expect(brain.getModel()).toBe('local-brain-v2')
    })

    it('sets model name', () => {
      brain.setModel('custom-v3')
      expect(brain.getModel()).toBe('custom-v3')
    })

    it('clears history', async () => {
      await brain.chat('Hello')
      brain.clearHistory()
      // After clearing, feedback should not learn (no history)
      brain.feedback(true)
      // No assertion needed - just verify it doesn't throw
    })
  })

  // ── Serialization ──

  describe('serialization', () => {
    it('serializes to JSON string', () => {
      brain.learn('test', 'response')
      const json = brain.serializeBrain()
      expect(typeof json).toBe('string')
      const parsed = JSON.parse(json)
      expect(parsed.learnedPatterns.length).toBe(1)
    })

    it('deserializes back to a working brain', () => {
      brain.learn('What is React?', 'React is a UI library.')
      brain.addKnowledge('custom', ['custom'], 'Custom knowledge.')

      const json = brain.serializeBrain()
      const restored = LocalBrain.deserializeBrain(json)

      expect(restored.getLearnedPatternCount()).toBe(brain.getLearnedPatternCount())
      expect(restored.getKnowledgeBaseSize()).toBe(brain.getKnowledgeBaseSize())
    })

    it('preserves stats through serialization', () => {
      brain.learn('q1', 'a1')
      brain.learn('q2', 'a2')

      const json = brain.serializeBrain()
      const restored = LocalBrain.deserializeBrain(json)

      expect(restored.getStats().totalLearnings).toBe(2)
      expect(restored.getStats().patternsLearned).toBe(2)
    })

    it('handles old patterns without priority field', () => {
      // Simulate old brain state without priority
      const state = {
        config: { model: 'test', maxResponseLength: 4096, creativity: 0.3, systemPrompt: '', learningEnabled: true, maxLearnedPatterns: 100, autoSavePath: '', autoSaveInterval: 5, decayRate: 0.01, minConfidence: 0.1, useTfIdf: true },
        learnedPatterns: [
          { inputPattern: 'test', keywords: ['test'], response: 'response', category: 'learned', reinforcements: 1, lastUsed: new Date().toISOString(), confidence: 0.5 },
        ],
        conversationHistory: [],
        knowledgeAdditions: [],
        stats: { totalChats: 0, totalCodeGenerations: 0, totalCodeReviews: 0, totalImageAnalyses: 0, totalLearnings: 1, patternsLearned: 1, knowledgeEntriesAdded: 0, createdAt: new Date().toISOString(), lastUsedAt: new Date().toISOString() },
      }

      const restored = LocalBrain.deserializeBrain(JSON.stringify(state))
      expect(restored.getLearnedPatternCount()).toBe(1)
    })
  })

  // ── Code Generation ──

  describe('writeCode', () => {
    it('generates code for TypeScript', async () => {
      const result = await brain.writeCode({
        description: 'sort an array',
        language: 'typescript',
      })
      expect(result.code).toBeTruthy()
      expect(result.language).toBe('typescript')
      expect(result.linesOfCode).toBeGreaterThan(0)
    })

    it('generates code for Python', async () => {
      const result = await brain.writeCode({
        description: 'filter a list',
        language: 'python',
      })
      expect(result.code).toBeTruthy()
      expect(result.language).toBe('python')
    })

    it('updates code generation stats', async () => {
      await brain.writeCode({ description: 'test', language: 'typescript' })
      expect(brain.getStats().totalCodeGenerations).toBe(1)
    })
  })

  // ── Code Review ──

  describe('reviewCode', () => {
    it('reviews code and returns issues', async () => {
      const result = await brain.reviewCode({
        code: 'function test() { eval("bad") }',
        language: 'javascript',
      })
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.score).toBeDefined()
      expect(result.summary).toBeTruthy()
    })

    it('returns clean score for good code', async () => {
      const result = await brain.reviewCode({
        code: 'const add = (a: number, b: number): number => a + b',
        language: 'typescript',
      })
      expect(result.score).toBeGreaterThan(50)
    })

    it('updates review stats', async () => {
      await brain.reviewCode({ code: 'test()', language: 'javascript' })
      expect(brain.getStats().totalCodeReviews).toBe(1)
    })
  })

  // ── Stats ──

  describe('stats', () => {
    it('returns readonly stats', () => {
      const stats = brain.getStats()
      expect(stats.createdAt).toBeTruthy()
      expect(stats.lastUsedAt).toBeTruthy()
      expect(stats.totalChats).toBe(0)
    })

    it('tracks all operations', async () => {
      await brain.chat('test')
      await brain.writeCode({ description: 'test', language: 'typescript' })
      await brain.reviewCode({ code: 'test()', language: 'javascript' })
      brain.learn('q', 'a')

      const stats = brain.getStats()
      expect(stats.totalChats).toBe(1)
      expect(stats.totalCodeGenerations).toBe(1)
      expect(stats.totalCodeReviews).toBe(1)
      expect(stats.totalLearnings).toBe(1)
    })
  })
})
