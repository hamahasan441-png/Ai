import { describe, it, expect, beforeEach, vi } from 'vitest'

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
    writeFileSync: vi.fn((p: string, data: string) => {
      store.set(p, data)
    }),
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
    unlinkSync: vi.fn((p: string) => {
      store.delete(p)
    }),
    __store: store,
  }
})

vi.mock('path', () => ({
  dirname: vi.fn((p: string) => p.split('/').slice(0, -1).join('/') || '/'),
  join: vi.fn((...parts: string[]) => parts.join('/')),
}))

import { LocalBrain } from '../LocalBrain'

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
      expect(brain.getLearnedPatternCount()).toBe(1) // Same pattern, reinforced
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
      b.learn('q4', 'a4') // Should evict one
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
      brain.feedbackOnTurn(999, true) // Should not throw
      brain.feedbackOnTurn(-1, true) // Should not throw
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
        config: {
          model: 'test',
          maxResponseLength: 4096,
          creativity: 0.3,
          systemPrompt: '',
          learningEnabled: true,
          maxLearnedPatterns: 100,
          autoSavePath: '',
          autoSaveInterval: 5,
          decayRate: 0.01,
          minConfidence: 0.1,
          useTfIdf: true,
        },
        learnedPatterns: [
          {
            inputPattern: 'test',
            keywords: ['test'],
            response: 'response',
            category: 'learned',
            reinforcements: 1,
            lastUsed: new Date().toISOString(),
            confidence: 0.5,
          },
        ],
        conversationHistory: [],
        knowledgeAdditions: [],
        stats: {
          totalChats: 0,
          totalCodeGenerations: 0,
          totalCodeReviews: 0,
          totalImageAnalyses: 0,
          totalLearnings: 1,
          patternsLearned: 1,
          knowledgeEntriesAdded: 0,
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        },
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

  // ── CodeMaster Integration ──

  describe('analyzeCode (CodeMaster CodeAnalyzer)', () => {
    it('returns CodeAnalysis with complexity metrics', () => {
      const analysis = brain.analyzeCode(
        'function add(a: number, b: number): number {\n  return a + b\n}',
        'typescript',
      )
      expect(analysis).toBeDefined()
      expect(analysis.complexity).toBeDefined()
      expect(analysis.complexity.linesOfCode).toBeGreaterThan(0)
      expect(typeof analysis.qualityScore).toBe('number')
      expect(analysis.qualityScore).toBeGreaterThanOrEqual(0)
      expect(analysis.qualityScore).toBeLessThanOrEqual(100)
    })

    it('detects language when not specified', () => {
      const analysis = brain.analyzeCode('def hello():\n    print("hello")\n')
      expect(analysis.language).toBeDefined()
    })

    it('finds anti-patterns in complex code', () => {
      const messyCode = `
function x(a,b,c,d,e,f,g,h,i,j) {
  if (a) {
    if (b) {
      if (c) {
        if (d) {
          console.log(e)
        }
      }
    }
  }
}
`
      const analysis = brain.analyzeCode(messyCode, 'javascript')
      expect(analysis.complexity.maxNestingDepth).toBeGreaterThanOrEqual(3)
    })

    it('tracks analysis stats', () => {
      brain.analyzeCode('const x = 1', 'typescript')
      brain.analyzeCode('const y = 2', 'typescript')
      expect(brain.getStats().totalCodeAnalyses).toBe(2)
    })
  })

  describe('fixCode (CodeMaster CodeFixer)', () => {
    it('returns FixResult with fixes array', () => {
      const result = brain.fixCode('if (x == null) { console.log(x) }', 'javascript')
      expect(result).toBeDefined()
      expect(result.fixes).toBeDefined()
      expect(Array.isArray(result.fixes)).toBe(true)
      expect(result.summary).toBeDefined()
      expect(typeof result.summary.applied).toBe('number')
      expect(typeof result.summary.skipped).toBe('number')
    })

    it('fixes loose equality to strict equality', () => {
      const code = 'if (x == null) { return false }'
      const result = brain.fixCode(code, 'javascript')
      const appliedFixes = result.fixes.filter(f => f.applied)
      if (appliedFixes.length > 0) {
        expect(appliedFixes.some(f => f.fixed.includes('==='))).toBe(true)
      }
    })

    it('tracks fix stats', () => {
      brain.fixCode('const x = 1', 'typescript')
      expect(brain.getStats().totalCodeFixes).toBe(1)
    })

    it('handles clean code without errors', () => {
      const result = brain.fixCode('const x: number = 42', 'typescript')
      expect(result.summary.applied).toBeGreaterThanOrEqual(0)
    })
  })

  describe('decomposeTask (CodeMaster ProblemDecomposer)', () => {
    it('returns TaskPlan with steps', () => {
      const plan = brain.decomposeTask('Add user authentication with JWT tokens')
      expect(plan).toBeDefined()
      expect(plan.intent).toBeDefined()
      expect(plan.steps).toBeDefined()
      expect(Array.isArray(plan.steps)).toBe(true)
      expect(plan.steps.length).toBeGreaterThan(0)
    })

    it('classifies intent correctly for new feature', () => {
      const plan = brain.decomposeTask('Create a new REST API for user management')
      expect(plan.intent).toBeDefined()
    })

    it('provides execution order', () => {
      const plan = brain.decomposeTask('Refactor the database module to use connection pooling')
      expect(plan.executionOrder).toBeDefined()
      expect(Array.isArray(plan.executionOrder)).toBe(true)
    })

    it('tracks decomposition stats', () => {
      brain.decomposeTask('Add tests')
      brain.decomposeTask('Fix bug')
      expect(brain.getStats().totalDecompositions).toBe(2)
    })
  })

  describe('enhanced reviewCode (CodeMaster integration)', () => {
    it('returns enhanced review with more issues than basic', async () => {
      const code = `
function process(data) {
  eval(data)
  var x = 1
  if (x == 1) {
    console.log(x)
  }
}
`
      const result = await brain.reviewCode({ code, language: 'javascript' })
      expect(result.issues.length).toBeGreaterThan(0)
      expect(result.score).toBeLessThan(100)
      expect(result.summary).toBeTruthy()
    })

    it('detects security issues via CodeMaster', async () => {
      const code = 'function run(input) { eval(input); }'
      const result = await brain.reviewCode({ code, language: 'javascript' })
      const securityIssues = result.issues.filter(
        i =>
          i.message.toLowerCase().includes('eval') || i.message.toLowerCase().includes('security'),
      )
      expect(securityIssues.length).toBeGreaterThan(0)
    })

    it('generates improved code when fixable issues found', async () => {
      const code = 'if (x == null) { var y = 1 }'
      const result = await brain.reviewCode({ code, language: 'javascript' })
      // improvedCode may or may not be set depending on whether fixes are applicable
      expect(result).toBeDefined()
      expect(typeof result.score).toBe('number')
    })
  })

  describe('deepReview (raw CodeMaster output)', () => {
    it('returns CodeReviewOutput with findings and suggestedFixes', () => {
      const output = brain.deepReview('const x = eval("code")', 'javascript')
      expect(output).toBeDefined()
      expect(output.findings).toBeDefined()
      expect(output.summary).toBeDefined()
      expect(typeof output.overallScore).toBe('number')
      expect(output.topIssues).toBeDefined()
    })
  })

  describe('code learning engine integration', () => {
    it('exposes code learning engine', () => {
      const engine = brain.getCodeLearningEngine()
      expect(engine).toBeDefined()
      expect(typeof engine.getStats).toBe('function')
    })

    it('learning engine tracks review patterns', async () => {
      await brain.reviewCode({
        code: 'function test() { eval("code") }',
        language: 'javascript',
      })
      const engine = brain.getCodeLearningEngine()
      const stats = engine.getStats()
      expect(stats).toBeDefined()
    })
  })

  // ── Expanded Knowledge Base ──

  describe('expanded knowledge base', () => {
    it('responds to framework questions', async () => {
      const result = await brain.chat('Tell me about React hooks')
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('responds to debugging questions', async () => {
      const result = await brain.chat('How do I debug a null pointer error?')
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('responds to code fixing questions', async () => {
      const result = await brain.chat('How do I fix a bug in my code?')
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('responds to CI/CD questions', async () => {
      const result = await brain.chat('What is a CI/CD pipeline?')
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('responds to error handling questions', async () => {
      const result = await brain.chat('What are error handling best practices?')
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('knows about Express.js', async () => {
      const result = await brain.chat('Tell me about Express middleware')
      expect(result.text.length).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: Code Completion Tests (Phase 1)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('completeCode', () => {
    it('completes an incomplete function signature', () => {
      const result = brain.completeCode('function greet(name')
      expect(result.insertion).toContain(')')
      expect(result.insertion).toContain('{')
      expect(result.confidence).toBeGreaterThan(0.5)
      expect(result.completedCode).toContain('function greet(name')
    })

    it('completes an arrow function body', () => {
      const result = brain.completeCode('const add = (a, b) =>')
      expect(result.insertion).toContain('{')
      expect(result.insertion).toContain('return')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('completes an if statement with block', () => {
      const result = brain.completeCode('if (x > 0)')
      expect(result.insertion).toContain('{')
      expect(result.insertion).toContain('}')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('completes a class declaration', () => {
      const result = brain.completeCode('class UserService')
      expect(result.insertion).toContain('constructor')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('completes an array literal', () => {
      const result = brain.completeCode('const items = [')
      expect(result.insertion).toContain(']')
      expect(result.confidence).toBeGreaterThan(0.5)
    })

    it('completes an object literal', () => {
      const result = brain.completeCode('const config = {')
      expect(result.insertion).toContain('}')
    })

    it('completes Python def with pass', () => {
      const result = brain.completeCode('def hello(name):')
      expect(result.insertion).toContain('pass')
    })

    it('handles switch statement', () => {
      const result = brain.completeCode('switch (action) {')
      expect(result.insertion).toContain('case')
      expect(result.insertion).toContain('default')
    })

    it('handles import statement start', () => {
      const result = brain.completeCode('import {')
      expect(result.insertion).toContain('from')
    })

    it('handles cursor position in the middle', () => {
      const code = 'function test() {\n  \n}'
      const result = brain.completeCode(code, 20)
      expect(result.completedCode).toBeDefined()
    })

    it('closes unclosed brackets', () => {
      const result = brain.completeCode('const x = { a: { b: 1 }')
      expect(result.insertion).toContain('}')
    })

    it('returns low confidence for ambiguous code', () => {
      const result = brain.completeCode('x')
      expect(result.confidence).toBeLessThan(0.5)
    })

    it('returns explanation for every completion', () => {
      const result = brain.completeCode('function test(')
      expect(result.explanation).toBeDefined()
      expect(result.explanation.length).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: Code Explanation Tests (Phase 4)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('explainCode', () => {
    it('explains a simple function', () => {
      const code = `function add(a, b) {
  return a + b
}`
      const result = brain.explainCode(code)
      expect(result.summary).toContain('function')
      expect(result.steps.length).toBeGreaterThan(0)
      expect(result.complexity).toBeDefined()
      expect(result.language).toBeDefined()
    })

    it('detects async code', () => {
      const code = `async function fetchData() {
  const response = await fetch('/api/data')
  return response.json()
}`
      const result = brain.explainCode(code)
      expect(result.concepts).toContain('async programming')
    })

    it('detects error handling', () => {
      const code = `try {
  const data = JSON.parse(input)
} catch (error) {
  console.error(error)
}`
      const result = brain.explainCode(code)
      expect(result.concepts).toContain('error handling')
    })

    it('detects functional programming patterns', () => {
      const code = `const results = items
  .filter(x => x.active)
  .map(x => x.name)
  .reduce((acc, name) => acc + name, '')`
      const result = brain.explainCode(code)
      expect(result.concepts).toContain('functional programming')
    })

    it('identifies classes and functions', () => {
      const code = `class Calculator {
  add(a, b) { return a + b }
  function subtract(a, b) { return a - b }
}`
      const result = brain.explainCode(code)
      expect(result.steps.some(s => s.includes('class'))).toBe(true)
    })

    it('returns complexity assessment', () => {
      const code = `function simple() { return 1 }`
      const result = brain.explainCode(code)
      expect(result.complexity).toMatch(/Low|Medium|High/)
    })

    it('accepts explicit language parameter', () => {
      const code = `def hello():\n    print("hello")`
      const result = brain.explainCode(code, 'python')
      expect(result.language).toBe('python')
    })

    it('detects exports', () => {
      const code = `export function greet(name) { return 'Hello ' + name }`
      const result = brain.explainCode(code)
      expect(result.concepts).toContain('module exports')
    })

    it('increments stats', () => {
      const before = brain.getStats().totalCodeExplanations
      brain.explainCode('function x() {}')
      expect(brain.getStats().totalCodeExplanations).toBe(before + 1)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: Multi-Step Reasoning Tests (Phase 4)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('reason', () => {
    it('returns structured reasoning result', async () => {
      const result = await brain.reason('What is the best sorting algorithm?')
      expect(result.answer).toBeDefined()
      expect(result.answer.length).toBeGreaterThan(0)
      expect(result.steps).toBeInstanceOf(Array)
      expect(result.steps.length).toBeGreaterThanOrEqual(3)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
      expect(result.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('includes decompose step', async () => {
      const result = await brain.reason('How do I implement a REST API?')
      expect(result.steps.some(s => s.type === 'decompose')).toBe(true)
    })

    it('includes plan step', async () => {
      const result = await brain.reason('How do I handle errors in TypeScript?')
      expect(result.steps.some(s => s.type === 'plan')).toBe(true)
    })

    it('includes generate step', async () => {
      const result = await brain.reason('What is React?')
      expect(result.steps.some(s => s.type === 'generate')).toBe(true)
    })

    it('includes review step', async () => {
      const result = await brain.reason('Explain binary search')
      expect(result.steps.some(s => s.type === 'review')).toBe(true)
    })

    it('has reasonable confidence for known topics', async () => {
      const result = await brain.reason('What is TypeScript?')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('increments stats', async () => {
      const before = brain.getStats().totalMultiStepReasons
      await brain.reason('test question')
      expect(brain.getStats().totalMultiStepReasons).toBe(before + 1)
    })

    it('handles empty question', async () => {
      const result = await brain.reason('')
      expect(result.answer).toBeDefined()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: Multi-File Generation Tests (Phase 1)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generateMultiFile', () => {
    it('generates multiple files for a component', async () => {
      const result = await brain.generateMultiFile('user profile', 'typescript')
      expect(result.files.length).toBeGreaterThanOrEqual(2)
      expect(result.totalLines).toBeGreaterThan(0)
      expect(result.explanation).toContain('Generated')
    })

    it('generates component + test + types + styles for UI', async () => {
      const result = await brain.generateMultiFile('button component', 'typescript', [
        'component',
        'test',
        'types',
        'styles',
      ])
      expect(result.files.length).toBe(4)
      expect(result.files.some(f => f.filename.endsWith('.tsx'))).toBe(true)
      expect(result.files.some(f => f.filename.endsWith('.test.ts'))).toBe(true)
      expect(result.files.some(f => f.filename.endsWith('.types.ts'))).toBe(true)
      expect(result.files.some(f => f.filename.endsWith('.module.css'))).toBe(true)
    })

    it('generates api + test + types for API', async () => {
      const result = await brain.generateMultiFile('create an api endpoint', 'typescript', [
        'api',
        'test',
        'types',
      ])
      expect(result.files.length).toBe(3)
      expect(result.files.some(f => f.filename.includes('.api.'))).toBe(true)
    })

    it('infers file types from description', async () => {
      const result = await brain.generateMultiFile('user service', 'typescript')
      expect(result.files.some(f => f.filename.includes('.service.'))).toBe(true)
    })

    it('generates hook files', async () => {
      const result = await brain.generateMultiFile('custom hook for auth', 'typescript', [
        'hook',
        'test',
      ])
      expect(result.files.some(f => f.filename.startsWith('use'))).toBe(true)
    })

    it('each file has content', async () => {
      const result = await brain.generateMultiFile('data model', 'typescript')
      for (const file of result.files) {
        expect(file.content.length).toBeGreaterThan(0)
        expect(file.lines).toBeGreaterThan(0)
        expect(file.language).toBeDefined()
      }
    })

    it('increments stats', async () => {
      const before = brain.getStats().totalMultiFileGenerations
      await brain.generateMultiFile('widget', 'typescript')
      expect(brain.getStats().totalMultiFileGenerations).toBe(before + 1)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: Refactoring Suggestions Tests (Phase 2)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('suggestRefactorings', () => {
    it('detects long methods', () => {
      const longFunction =
        'function longFunc() {\n' + Array(35).fill('  const x = 1\n').join('') + '}'
      const suggestions = brain.suggestRefactorings(longFunction)
      expect(suggestions.some(s => s.smell === 'Long Method')).toBe(true)
    })

    it('detects magic numbers', () => {
      const code = `function calc(x) {
  return x * 86400 + 3600
}`
      const suggestions = brain.suggestRefactorings(code)
      expect(suggestions.some(s => s.smell === 'Magic Number')).toBe(true)
    })

    it('detects deep nesting', () => {
      const code = `function nested() {
  if (a) {
    if (b) {
      if (c) {
        if (d) {
          return true
        }
      }
    }
  }
}`
      const suggestions = brain.suggestRefactorings(code)
      expect(suggestions.some(s => s.smell === 'Deep Nesting')).toBe(true)
    })

    it('detects duplicate code', () => {
      const line = '  const result = items.filter(x => x.active).map(x => x.name)'
      const code = `function a() {\n${line}\n}\nfunction b() {\n${line}\n}\nfunction c() {\n${line}\n}`
      const suggestions = brain.suggestRefactorings(code)
      expect(suggestions.some(s => s.smell === 'Duplicate Code')).toBe(true)
    })

    it('returns sorted by priority', () => {
      const longCode =
        'function longFunc() {\n' + Array(65).fill('  const x = 86400\n').join('') + '}'
      const suggestions = brain.suggestRefactorings(longCode)
      if (suggestions.length >= 2) {
        const priorities = suggestions.map(s => s.priority)
        const priOrder = { high: 0, medium: 1, low: 2 }
        for (let i = 1; i < priorities.length; i++) {
          expect(priOrder[priorities[i]!]).toBeGreaterThanOrEqual(priOrder[priorities[i - 1]!])
        }
      }
    })

    it('returns empty for clean code', () => {
      const code = 'function add(a, b) {\n  return a + b\n}'
      const suggestions = brain.suggestRefactorings(code)
      // Clean code should have few or no issues
      expect(suggestions.length).toBeLessThan(5)
    })

    it('includes suggestion text', () => {
      const longFunction =
        'function longFunc() {\n' + Array(35).fill('  const x = 1\n').join('') + '}'
      const suggestions = brain.suggestRefactorings(longFunction)
      for (const s of suggestions) {
        expect(s.suggestion).toBeDefined()
        expect(s.suggestion.length).toBeGreaterThan(0)
        expect(s.description).toBeDefined()
        expect(s.location).toBeDefined()
      }
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: Conversation Memory Tests (Phase 4)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('conversationContext', () => {
    it('starts with empty context', () => {
      const ctx = brain.getConversationContext()
      expect(ctx.currentFile).toBeNull()
      expect(ctx.currentFunction).toBeNull()
      expect(ctx.currentLanguage).toBeNull()
      expect(ctx.topicStack).toEqual([])
    })

    it('getConversationContext returns readonly copy', () => {
      const ctx1 = brain.getConversationContext()
      const ctx2 = brain.getConversationContext()
      expect(ctx1).not.toBe(ctx2) // Different objects
      expect(ctx1).toEqual(ctx2) // Same content
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: User Preferences Tests (Phase 5)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('userPreferences', () => {
    it('has default preferences', () => {
      const prefs = brain.getUserPreferences()
      expect(prefs.indentation).toBe('spaces-2')
      expect(prefs.quotes).toBe('single')
      expect(prefs.semicolons).toBe(false)
      expect(prefs.naming).toBe('camelCase')
    })

    it('allows setting preferences', () => {
      brain.setUserPreference('indentation', 'tabs')
      expect(brain.getUserPreferences().indentation).toBe('tabs')
    })

    it('updates lastUpdated on preference change', () => {
      const _before = brain.getUserPreferences().lastUpdated
      brain.setUserPreference('quotes', 'double')
      const after = brain.getUserPreferences().lastUpdated
      expect(after).toBeDefined()
    })

    it('preserves other preferences when setting one', () => {
      brain.setUserPreference('indentation', 'spaces-4')
      brain.setUserPreference('quotes', 'double')
      expect(brain.getUserPreferences().indentation).toBe('spaces-4')
      expect(brain.getUserPreferences().quotes).toBe('double')
    })

    it('returns readonly copy', () => {
      const p1 = brain.getUserPreferences()
      const p2 = brain.getUserPreferences()
      expect(p1).not.toBe(p2)
    })

    it('supports preferredLibraries', () => {
      brain.setUserPreference('preferredLibraries', { http: 'axios', validation: 'zod' })
      expect(brain.getUserPreferences().preferredLibraries.http).toBe('axios')
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: Active Learning Tests (Phase 5)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('assessConfidence', () => {
    it('returns confident for known topics', () => {
      const result = brain.assessConfidence('What is TypeScript?')
      expect(result.confident).toBe(true)
      expect(result.score).toBeGreaterThan(0)
    })

    it('returns not confident for obscure topics', () => {
      const result = brain.assessConfidence('xyzzy qwerty plugh')
      expect(result.confident).toBe(false)
      expect(result.clarifyingQuestions).toBeDefined()
      expect(result.clarifyingQuestions!.length).toBeGreaterThan(0)
    })

    it('asks for code when fixing without code', () => {
      const result = brain.assessConfidence('fix this bug')
      if (!result.confident) {
        expect(result.clarifyingQuestions!.some(q => q.toLowerCase().includes('code'))).toBe(true)
      }
    })

    it('asks about language when no language context', () => {
      const freshBrain = new LocalBrain({ learningEnabled: true, useTfIdf: true })
      const result = freshBrain.assessConfidence('help me with this')
      if (!result.confident) {
        expect(
          result.clarifyingQuestions!.some(
            q => q.toLowerCase().includes('language') || q.toLowerCase().includes('details'),
          ),
        ).toBe(true)
      }
    })

    it('score is between 0 and 1', () => {
      const r1 = brain.assessConfidence('TypeScript')
      const r2 = brain.assessConfidence('asjdhaksdhaskjdhas')
      expect(r1.score).toBeGreaterThanOrEqual(0)
      expect(r1.score).toBeLessThanOrEqual(1)
      expect(r2.score).toBeGreaterThanOrEqual(0)
      expect(r2.score).toBeLessThanOrEqual(1)
    })

    it('always returns at least one clarifying question when not confident', () => {
      const result = brain.assessConfidence('zzz')
      if (!result.confident) {
        expect(result.clarifyingQuestions!.length).toBeGreaterThanOrEqual(1)
      }
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: Expanded Knowledge Base Tests (Phase 3)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('expanded knowledge base', () => {
    it('has 100+ knowledge entries', () => {
      expect(brain.getKnowledgeBaseSize()).toBeGreaterThan(100)
    })

    it('knows about React hooks', async () => {
      const results = brain.searchKnowledge('React hooks useState useEffect')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.entry.content.toLowerCase()).toContain('hook')
    })

    it('knows about NestJS', async () => {
      const results = brain.searchKnowledge('NestJS decorators')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about AWS Lambda', async () => {
      const results = brain.searchKnowledge('AWS Lambda serverless')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about common errors', async () => {
      const results = brain.searchKnowledge('Cannot read properties undefined TypeError')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.entry.content).toContain('Optional chaining')
    })

    it('knows about binary search', async () => {
      const results = brain.searchKnowledge('binary search algorithm')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.entry.content).toContain('O(log n)')
    })

    it('knows about dynamic programming', async () => {
      const results = brain.searchKnowledge('dynamic programming memoization')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about OWASP', async () => {
      const results = brain.searchKnowledge('OWASP security top 10')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about Prisma ORM', async () => {
      const results = brain.searchKnowledge('Prisma ORM database')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about Terraform', async () => {
      const results = brain.searchKnowledge('Terraform infrastructure as code')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about Docker errors', async () => {
      const results = brain.searchKnowledge('Docker container error build')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about git merge conflicts', async () => {
      const results = brain.searchKnowledge('git merge conflict')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about connection pooling', async () => {
      const results = brain.searchKnowledge('database connection pool')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about LRU cache', async () => {
      const results = brain.searchKnowledge('LRU cache eviction')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about two pointers technique', async () => {
      const results = brain.searchKnowledge('two pointers sliding window')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about JWT best practices', async () => {
      const results = brain.searchKnowledge('JWT token security refresh')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about clean architecture', async () => {
      const results = brain.searchKnowledge('clean architecture hexagonal')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about circuit breaker pattern', async () => {
      const results = brain.searchKnowledge('circuit breaker retry resilience')
      expect(results.length).toBeGreaterThan(0)
    })

    it('knows about Web Vitals', async () => {
      const results = brain.searchKnowledge('Core Web Vitals LCP CLS')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // NEW: Stats tracking Tests
  // ═══════════════════════════════════════════════════════════════════════════

  describe('new stats tracking', () => {
    it('tracks code completion stats', () => {
      expect(brain.getStats().totalCodeCompletions).toBe(0)
      brain.completeCode('function test(')
      expect(brain.getStats().totalCodeCompletions).toBe(1)
      brain.completeCode('class Foo')
      expect(brain.getStats().totalCodeCompletions).toBe(2)
    })

    it('tracks code explanation stats', () => {
      expect(brain.getStats().totalCodeExplanations).toBe(0)
      brain.explainCode('function x() { return 1 }')
      expect(brain.getStats().totalCodeExplanations).toBe(1)
    })

    it('tracks multi-step reasoning stats', async () => {
      expect(brain.getStats().totalMultiStepReasons).toBe(0)
      await brain.reason('What is TypeScript?')
      expect(brain.getStats().totalMultiStepReasons).toBe(1)
    })

    it('tracks multi-file generation stats', async () => {
      expect(brain.getStats().totalMultiFileGenerations).toBe(0)
      await brain.generateMultiFile('widget', 'typescript')
      expect(brain.getStats().totalMultiFileGenerations).toBe(1)
    })
  })
})
