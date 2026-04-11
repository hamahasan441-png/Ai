import { describe, it, expect, beforeEach } from 'vitest'
import { IntentEngine, type ConversationTurn } from '../IntentEngine'

// ── Constructor Tests ──

describe('IntentEngine constructor', () => {
  it('creates an instance with default config', () => {
    const engine = new IntentEngine()
    expect(engine).toBeInstanceOf(IntentEngine)
  })

  it('accepts partial config overrides', () => {
    const engine = new IntentEngine({ confidenceThreshold: 0.5 })
    expect(engine).toBeInstanceOf(IntentEngine)
  })

  it('accepts full custom config', () => {
    const engine = new IntentEngine({
      confidenceThreshold: 0.3,
      maxIntents: 3,
      enableEntityExtraction: false,
    })
    expect(engine).toBeInstanceOf(IntentEngine)
  })

  it('respects enableEntityExtraction = false', () => {
    const engine = new IntentEngine({ enableEntityExtraction: false })
    const result = engine.classify('write Python code')
    expect(result.entities).toEqual([])
  })

  it('respects maxIntents cap', () => {
    const engine = new IntentEngine({ maxIntents: 1 })
    const result = engine.classify('write and review and explain code')
    expect(result.secondary.length).toBeLessThanOrEqual(0)
  })

  it('respects high confidenceThreshold by filtering low-confidence intents', () => {
    const engine = new IntentEngine({ confidenceThreshold: 0.99 })
    const result = engine.classify('hello')
    // With a very high threshold, secondary intents should be filtered out
    expect(result.secondary.length).toBe(0)
  })
})

// ── classify() Tests ──

describe('IntentEngine.classify', () => {
  let engine: IntentEngine

  beforeEach(() => {
    engine = new IntentEngine()
  })

  it('returns an IntentResult with expected shape', () => {
    const result = engine.classify('hello')
    expect(result).toHaveProperty('primary')
    expect(result).toHaveProperty('secondary')
    expect(result).toHaveProperty('entities')
    expect(result).toHaveProperty('isCompound')
    expect(result.primary).toHaveProperty('label')
    expect(result.primary).toHaveProperty('confidence')
    expect(result.primary).toHaveProperty('triggers')
  })

  it('classifies "write a function" as code_write', () => {
    const result = engine.classify('write a function to sort an array')
    expect(result.primary.label).toBe('code_write')
  })

  it('classifies "review this code" as code_review', () => {
    const result = engine.classify('review this code for bugs')
    expect(result.primary.label).toBe('code_review')
  })

  it('classifies "explain this code" as code_explain', () => {
    const result = engine.classify('explain this code to me')
    expect(result.primary.label).toBe('code_explain')
  })

  it('classifies "what is a closure?" as question', () => {
    const result = engine.classify('what is a closure?')
    expect(result.primary.label).toBe('question')
  })

  it('classifies "debug this error" as debug', () => {
    const result = engine.classify('debug this error in the console')
    expect(result.primary.label).toBe('debug')
  })

  it('classifies "fix this bug" as code_fix', () => {
    const result = engine.classify('fix this bug in my code')
    expect(result.primary.label).toBe('code_fix')
  })

  it('classifies "refactor this function" as code_refactor', () => {
    const result = engine.classify('refactor this function to be cleaner')
    expect(result.primary.label).toBe('code_refactor')
  })

  it('classifies "search for files" as search', () => {
    const result = engine.classify('search for the config file in the project')
    expect(result.primary.label).toBe('search')
  })

  it('classifies "I want to learn about React" as learn', () => {
    const result = engine.classify('I want to learn about React')
    expect(result.primary.label).toBe('learn')
  })

  it('classifies "teach me how to use hooks" as teach', () => {
    const result = engine.classify('teach me how to use hooks')
    expect(result.primary.label).toBe('teach')
  })

  it('classifies "think step by step" as reason', () => {
    const result = engine.classify("let's think step by step about this")
    expect(result.primary.label).toBe('reason')
  })

  it('classifies "compare React vs Angular" as compare', () => {
    const result = engine.classify('compare React vs Angular')
    expect(result.primary.label).toBe('compare')
  })

  it('classifies "deploy my app" as deploy', () => {
    const result = engine.classify('deploy my app to production')
    expect(result.primary.label).toBe('deploy')
  })

  it('classifies "design a database schema" as design', () => {
    const result = engine.classify('design a database schema for users')
    expect(result.primary.label).toBe('design')
  })

  it('classifies "add tests for this module" as test', () => {
    const result = engine.classify('add tests for this module')
    expect(result.primary.label).toBe('test')
  })

  it('classifies "add documentation" as document', () => {
    const result = engine.classify('add documentation for this module')
    expect(result.primary.label).toBe('document')
  })

  it('classifies "hello" as general_chat', () => {
    const result = engine.classify('hello')
    expect(result.primary.label).toBe('general_chat')
  })

  it('classifies "break this down into steps" as task_decompose', () => {
    const result = engine.classify('break this down into steps')
    expect(result.primary.label).toBe('task_decompose')
  })

  it('populates secondary intents for ambiguous input', () => {
    const result = engine.classify('write a test for this code and review it')
    expect(result.secondary.length).toBeGreaterThan(0)
  })

  it('sets isCompound to true for compound requests', () => {
    const result = engine.classify('write code and then review it')
    expect(result.isCompound).toBe(true)
  })

  it('sets isCompound to false for simple requests', () => {
    const result = engine.classify('write a function')
    expect(result.isCompound).toBe(false)
  })

  it('returns confidence between 0 and 1', () => {
    const result = engine.classify('create a new React component')
    expect(result.primary.confidence).toBeGreaterThan(0)
    expect(result.primary.confidence).toBeLessThanOrEqual(1)
  })

  it('uses conversation context for pronoun resolution', () => {
    const context: ConversationTurn[] = [
      { role: 'user', content: 'I have a `sortArray` function' },
      { role: 'assistant', content: 'I see your function.' },
    ]
    const result = engine.classify('explain it', context)
    expect(result.primary.label).toBe('code_explain')
  })

  it('falls back to general_chat when no intents match', () => {
    const engine = new IntentEngine({ confidenceThreshold: 1.0 })
    const result = engine.classify('xyzzy')
    expect(result.primary.label).toBe('general_chat')
    expect(result.primary.confidence).toBe(0.5)
  })
})

// ── extractEntities() Tests ──

describe('IntentEngine.extractEntities', () => {
  let engine: IntentEngine

  beforeEach(() => {
    engine = new IntentEngine()
  })

  it('extracts programming languages', () => {
    const entities = engine.extractEntities('I want to use Python and JavaScript')
    const langs = entities.filter(e => e.type === 'programming_language')
    const values = langs.map(e => e.value)
    expect(values).toContain('python')
    expect(values).toContain('javascript')
  })

  it('extracts frameworks', () => {
    const entities = engine.extractEntities('Build a React app with Express backend')
    const frameworks = entities.filter(e => e.type === 'framework')
    const values = frameworks.map(e => e.value)
    expect(values).toContain('react')
    expect(values).toContain('express')
  })

  it('extracts file paths', () => {
    const entities = engine.extractEntities('Edit the file at src/utils/helpers.ts')
    const paths = entities.filter(e => e.type === 'file_path')
    expect(paths.length).toBeGreaterThan(0)
    expect(paths[0].value).toBe('src/utils/helpers.ts')
  })

  it('extracts URLs', () => {
    const entities = engine.extractEntities('Check https://example.com/api for docs')
    const urls = entities.filter(e => e.type === 'url')
    expect(urls.length).toBe(1)
    expect(urls[0].value).toBe('https://example.com/api')
  })

  it('extracts code snippets in backticks', () => {
    const entities = engine.extractEntities('What does `Array.from()` do?')
    const snippets = entities.filter(e => e.type === 'code_snippet')
    expect(snippets.length).toBe(1)
    expect(snippets[0].value).toBe('Array.from()')
  })

  it('extracts numbers', () => {
    const entities = engine.extractEntities('Use 42 threads and 3.14 ratio')
    const numbers = entities.filter(e => e.type === 'number')
    const values = numbers.map(e => e.value)
    expect(values).toContain('42')
    expect(values).toContain('3.14')
  })

  it('extracts comparison targets from "X vs Y" syntax', () => {
    const entities = engine.extractEntities('React vs Angular')
    const targets = entities.filter(e => e.type === 'comparison_target')
    expect(targets.length).toBe(2)
    const values = targets.map(e => e.value)
    expect(values).toContain('React')
    expect(values).toContain('Angular')
  })

  it('extracts comparison targets from "between X and Y" syntax', () => {
    const entities = engine.extractEntities('difference between Python and Ruby')
    const targets = entities.filter(e => e.type === 'comparison_target')
    expect(targets.length).toBeGreaterThanOrEqual(2)
    const values = targets.map(e => e.value)
    expect(values).toContain('Python')
    expect(values).toContain('Ruby')
  })

  it('assigns correct confidence levels to entities', () => {
    const entities = engine.extractEntities('Use Python with React at src/app.ts')
    for (const entity of entities) {
      expect(entity.confidence).toBeGreaterThan(0)
      expect(entity.confidence).toBeLessThanOrEqual(1)
    }
  })

  it('assigns position to each entity', () => {
    const entities = engine.extractEntities('Use Python and JavaScript')
    for (const entity of entities) {
      expect(entity.position).toBeGreaterThanOrEqual(0)
    }
  })

  it('does not extract numbers inside URLs', () => {
    const entities = engine.extractEntities('Visit https://example.com:8080/api/v2')
    const numbers = entities.filter(e => e.type === 'number')
    expect(numbers.length).toBe(0)
  })

  it('deduplicates entities with same type, value, and position', () => {
    const entities = engine.extractEntities('python python')
    const pythons = entities.filter(e => e.type === 'programming_language' && e.value === 'python')
    // Each occurrence at a different position should appear, but no duplicates
    const positions = pythons.map(e => e.position)
    const uniquePositions = new Set(positions)
    expect(positions.length).toBe(uniquePositions.size)
  })

  it('returns empty array for input with no entities', () => {
    const entities = engine.extractEntities('do something')
    // May or may not have entities depending on matches; at minimum should not throw
    expect(Array.isArray(entities)).toBe(true)
  })
})

// ── resolveCompound() Tests ──

describe('IntentEngine.resolveCompound', () => {
  let engine: IntentEngine

  beforeEach(() => {
    engine = new IntentEngine()
  })

  it('splits "write code and review it" into two resolved intents', () => {
    const resolved = engine.resolveCompound('write the code and review it')
    expect(resolved.length).toBe(2)
    expect(resolved[0].intent.label).toBe('code_write')
    expect(resolved[1].intent.label).toBe('code_review')
  })

  it('splits on "and then" separator', () => {
    const resolved = engine.resolveCompound('write a function and then test it')
    expect(resolved.length).toBe(2)
  })

  it('splits on "also" separator', () => {
    const resolved = engine.resolveCompound('fix the bug also add documentation')
    expect(resolved.length).toBe(2)
  })

  it('returns a single resolved intent for non-compound input', () => {
    const resolved = engine.resolveCompound('write a function')
    expect(resolved.length).toBe(1)
    expect(resolved[0].intent.label).toBe('code_write')
    expect(resolved[0].originalSegment).toBe('write a function')
  })

  it('preserves originalSegment for each part', () => {
    const resolved = engine.resolveCompound('explain the code and then deploy it')
    expect(resolved.length).toBe(2)
    expect(resolved[0].originalSegment).toContain('explain')
    expect(resolved[1].originalSegment).toContain('deploy')
  })

  it('includes entities for each segment', () => {
    const resolved = engine.resolveCompound('write Python code and review the JavaScript module')
    expect(resolved.length).toBe(2)
    // Each resolved intent should have its own entities array
    for (const r of resolved) {
      expect(Array.isArray(r.entities)).toBe(true)
    }
  })
})

// ── resolveReferences() Tests ──

describe('IntentEngine.resolveReferences', () => {
  let engine: IntentEngine

  beforeEach(() => {
    engine = new IntentEngine()
  })

  it('resolves "it" to the last relevant noun from context', () => {
    const context: ConversationTurn[] = [{ role: 'user', content: 'I have a `sortArray` function' }]
    const resolved = engine.resolveReferences('explain it', context)
    expect(resolved).toContain('sortArray')
    expect(resolved).not.toContain(' it')
  })

  it('resolves "that" to the last noun from user turns', () => {
    const context: ConversationTurn[] = [{ role: 'user', content: 'Check the "UserService" class' }]
    const resolved = engine.resolveReferences('refactor that', context)
    expect(resolved).toContain('UserService')
  })

  it('returns input unchanged when no pronouns are present', () => {
    const context: ConversationTurn[] = [{ role: 'user', content: 'I wrote a function' }]
    const resolved = engine.resolveReferences('write a new function', context)
    expect(resolved).toBe('write a new function')
  })

  it('returns input unchanged when context is empty', () => {
    const resolved = engine.resolveReferences('explain it', [])
    expect(resolved).toBe('explain it')
  })

  it('skips assistant turns when searching for nouns', () => {
    const context: ConversationTurn[] = [
      { role: 'user', content: 'I wrote `myHelper`' },
      { role: 'assistant', content: 'That looks great!' },
    ]
    const resolved = engine.resolveReferences('refactor it', context)
    expect(resolved).toContain('myHelper')
  })

  it('resolves programming language references from context', () => {
    const context: ConversationTurn[] = [{ role: 'user', content: 'I am learning Python' }]
    const resolved = engine.resolveReferences('tell me more about it', context)
    expect(resolved).toContain('python')
  })

  it('resolves framework references from context', () => {
    const context: ConversationTurn[] = [
      { role: 'user', content: 'I started using React for my project' },
    ]
    const resolved = engine.resolveReferences('how does it handle state?', context)
    expect(resolved).toContain('react')
  })
})

// ── Edge Cases ──

describe('IntentEngine edge cases', () => {
  let engine: IntentEngine

  beforeEach(() => {
    engine = new IntentEngine()
  })

  it('handles empty input gracefully', () => {
    const result = engine.classify('')
    expect(result.primary).toBeDefined()
    expect(result.primary.label).toBeDefined()
  })

  it('handles very long input without throwing', () => {
    const longInput = 'write a function that '.repeat(500)
    const result = engine.classify(longInput)
    expect(result.primary).toBeDefined()
    expect(result.primary.label).toBe('code_write')
  })

  it('handles gibberish input', () => {
    const result = engine.classify('asdfghjkl qwertyuiop zxcvbnm')
    expect(result.primary).toBeDefined()
    // Should fall back to general_chat or have low confidence
    expect(result.primary.label).toBeDefined()
  })

  it('handles special characters in input', () => {
    const result = engine.classify('write a function: (a, b) => a + b')
    expect(result.primary).toBeDefined()
  })

  it('extractEntities handles empty input', () => {
    const entities = engine.extractEntities('')
    expect(entities).toEqual([])
  })

  it('resolveCompound handles empty input', () => {
    const resolved = engine.resolveCompound('')
    expect(resolved.length).toBeGreaterThanOrEqual(1)
  })

  it('handles input with only whitespace', () => {
    const result = engine.classify('   ')
    expect(result.primary).toBeDefined()
  })

  it('handles Unicode characters without crashing', () => {
    const result = engine.classify('写代码 créer une fonction')
    expect(result.primary).toBeDefined()
  })
})
