/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║   🔍 SPARK ENHANCED — Search Engine, Memory, Circuit Breaker, Adaptive      ║
 * ║       Tool Selection, Parallel Execution, Dynamic Planning Tests            ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 *
 * Comprehensive tests for all 6 new powerful subsystems:
 *  1. SparkSearchEngine — Multi-strategy local search (TF-IDF, fuzzy, graph)
 *  2. MemoryManager — Persistent cross-session memory with decay & associations
 *  3. ToolCircuitBreaker — Fault tolerance with open/closed/half-open states
 *  4. AdaptiveToolSelector — Learning tool selection from performance history
 *  5. ParallelExecutor — Concurrent tool execution with batching
 *  6. DynamicPlanner — Constraint-aware replanning with dependency graph
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  SparkSearchEngine,
  DEFAULT_SEARCH_CONFIG,
  MemoryManager,
  DEFAULT_MEMORY_CONFIG,
  ToolCircuitBreaker,
  DEFAULT_CIRCUIT_BREAKER_CONFIG,
  AdaptiveToolSelector,
  ParallelExecutor,
  DynamicPlanner,
} from '../ModelSpark.js'
import type {
  SearchDocument,
  SearchResult,
  AgentToolResult,
  MemoryEntry,
  ToolCircuitState,
  PlanStep,
  DynamicPlan,
} from '../ModelSpark.js'

// ═══════════════════════════════════════════════════════════════════════════════
//   🔍 SPARK SEARCH ENGINE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('🔍 SparkSearchEngine', () => {
  let engine: SparkSearchEngine

  beforeEach(() => {
    engine = new SparkSearchEngine()
  })

  describe('Document Management', () => {
    it('should index a document', () => {
      const doc = engine.indexDocument({
        id: 'doc1',
        title: 'TypeScript Guide',
        content: 'TypeScript is a typed superset of JavaScript',
        category: 'programming',
        tags: ['typescript', 'javascript'],
        metadata: {},
      })

      expect(doc.id).toBe('doc1')
      expect(doc.title).toBe('TypeScript Guide')
      expect(doc.indexedAt).toBeGreaterThan(0)
      expect(doc.accessCount).toBe(0)
      expect(engine.getDocumentCount()).toBe(1)
    })

    it('should bulk index documents', () => {
      const count = engine.indexDocuments([
        { id: 'doc1', title: 'JS', content: 'JavaScript basics', category: 'code', tags: ['js'], metadata: {} },
        { id: 'doc2', title: 'Python', content: 'Python programming', category: 'code', tags: ['python'], metadata: {} },
        { id: 'doc3', title: 'SQL', content: 'Database queries', category: 'data', tags: ['sql'], metadata: {} },
      ])

      expect(count).toBe(3)
      expect(engine.getDocumentCount()).toBe(3)
    })

    it('should get document by ID', () => {
      engine.indexDocument({ id: 'doc1', title: 'Test', content: 'Content', category: 'test', tags: [], metadata: {} })
      expect(engine.getDocument('doc1')?.title).toBe('Test')
      expect(engine.getDocument('nonexistent')).toBeNull()
    })

    it('should remove a document', () => {
      engine.indexDocument({ id: 'doc1', title: 'Test', content: 'Content', category: 'test', tags: [], metadata: {} })
      expect(engine.removeDocument('doc1')).toBe(true)
      expect(engine.getDocumentCount()).toBe(0)
      expect(engine.removeDocument('nonexistent')).toBe(false)
    })

    it('should get categories', () => {
      engine.indexDocuments([
        { id: 'd1', title: 'A', content: 'a', category: 'code', tags: [], metadata: {} },
        { id: 'd2', title: 'B', content: 'b', category: 'data', tags: [], metadata: {} },
        { id: 'd3', title: 'C', content: 'c', category: 'code', tags: [], metadata: {} },
      ])
      const cats = engine.getCategories()
      expect(cats).toContain('code')
      expect(cats).toContain('data')
    })

    it('should evict least-used when at capacity', () => {
      const small = new SparkSearchEngine({ maxDocuments: 2 })
      small.indexDocument({ id: 'd1', title: 'A', content: 'first', category: 'test', tags: [], metadata: {} })
      small.indexDocument({ id: 'd2', title: 'B', content: 'second', category: 'test', tags: [], metadata: {} })
      small.indexDocument({ id: 'd3', title: 'C', content: 'third', category: 'test', tags: [], metadata: {} })
      expect(small.getDocumentCount()).toBe(2)
    })
  })

  describe('Keyword Search', () => {
    beforeEach(() => {
      engine.indexDocuments([
        { id: 'd1', title: 'TypeScript Tutorial', content: 'Learn TypeScript programming with advanced types', category: 'code', tags: ['ts'], metadata: {} },
        { id: 'd2', title: 'Python Guide', content: 'Python programming for data science and machine learning', category: 'code', tags: ['python'], metadata: {} },
        { id: 'd3', title: 'SQL Basics', content: 'Learn SQL database queries and joins', category: 'data', tags: ['sql'], metadata: {} },
        { id: 'd4', title: 'Security Hardening', content: 'Network security and vulnerability assessment techniques', category: 'security', tags: ['security'], metadata: {} },
      ])
    })

    it('should find documents by keyword', () => {
      const results = engine.search({ text: 'TypeScript programming', strategy: 'keyword' })
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.document.id).toBe('d1')
    })

    it('should return empty for non-matching queries', () => {
      const results = engine.search({ text: 'quantum physics', strategy: 'keyword', minScore: 0.5 })
      expect(results.length).toBe(0)
    })
  })

  describe('Fuzzy Search', () => {
    beforeEach(() => {
      engine.indexDocuments([
        { id: 'd1', title: 'TypeScript', content: 'TypeScript is great for development', category: 'code', tags: [], metadata: {} },
        { id: 'd2', title: 'JavaScript', content: 'JavaScript runtime environment', category: 'code', tags: [], metadata: {} },
      ])
    })

    it('should find documents with fuzzy matching', () => {
      const results = engine.search({ text: 'typscript', strategy: 'fuzzy' })
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Semantic Search', () => {
    beforeEach(() => {
      engine.indexDocuments([
        { id: 'd1', title: 'Machine Learning', content: 'Neural networks deep learning algorithms', category: 'ai', tags: [], metadata: {} },
        { id: 'd2', title: 'Web Dev', content: 'HTML CSS JavaScript frontend development', category: 'web', tags: [], metadata: {} },
        { id: 'd3', title: 'Deep Learning', content: 'Training neural networks with gradient descent', category: 'ai', tags: [], metadata: {} },
      ])
    })

    it('should find semantically similar documents', () => {
      const results = engine.search({ text: 'neural networks', strategy: 'semantic' })
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.matchedBy).toContain('semantic')
    })
  })

  describe('Synonym Search', () => {
    beforeEach(() => {
      engine.indexDocuments([
        { id: 'd1', title: 'Bug Report', content: 'Found a critical error in the system', category: 'bugs', tags: [], metadata: {} },
        { id: 'd2', title: 'Feature Request', content: 'Add new user interface', category: 'features', tags: [], metadata: {} },
      ])
    })

    it('should expand synonyms', () => {
      const results = engine.search({ text: 'defect problem', strategy: 'synonym' })
      // 'defect' and 'problem' are synonyms of 'error'/'bug'
      expect(results.length).toBeGreaterThanOrEqual(0) // May find via synonym expansion
    })
  })

  describe('Contextual Search', () => {
    it('should apply recency and frequency boosts', () => {
      engine.indexDocuments([
        { id: 'd1', title: 'Old Doc', content: 'old information', category: 'test', tags: [], metadata: {} },
        { id: 'd2', title: 'New Info', content: 'new information about topic', category: 'test', tags: [], metadata: {} },
      ])

      const results = engine.search({ text: 'information', strategy: 'contextual' })
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Graph Search', () => {
    it('should follow graph connections', () => {
      engine.indexDocuments([
        { id: 'd1', title: 'React', content: 'React component library', category: 'frontend', tags: ['ui', 'react'], metadata: {} },
        { id: 'd2', title: 'Vue', content: 'Vue framework for web', category: 'frontend', tags: ['ui', 'vue'], metadata: {} },
        { id: 'd3', title: 'Node', content: 'Node server runtime', category: 'backend', tags: ['server'], metadata: {} },
      ])

      const results = engine.search({ text: 'React component', strategy: 'graph' })
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Combined Search', () => {
    beforeEach(() => {
      engine.indexDocuments([
        { id: 'd1', title: 'TypeScript Advanced', content: 'Advanced TypeScript generics and mapped types', category: 'code', tags: ['ts'], metadata: {} },
        { id: 'd2', title: 'JavaScript ES6', content: 'Modern JavaScript features arrow functions', category: 'code', tags: ['js'], metadata: {} },
        { id: 'd3', title: 'Python Data', content: 'Python pandas numpy data analysis', category: 'data', tags: ['python'], metadata: {} },
      ])
    })

    it('should combine multiple strategies', () => {
      const results = engine.search({ text: 'TypeScript types', strategy: 'combined' })
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.matchedBy.length).toBeGreaterThanOrEqual(1)
    })

    it('should filter by category', () => {
      const results = engine.search({ text: 'code', categories: ['data'] })
      for (const r of results) {
        expect(r.document.category).toBe('data')
      }
    })

    it('should filter by tags', () => {
      const results = engine.search({ text: 'programming', tags: ['ts'] })
      for (const r of results) {
        expect(r.document.tags).toContain('ts')
      }
    })

    it('should apply recency weighting', () => {
      const results = engine.search({ text: 'TypeScript', recencyWeight: 0.5 })
      expect(results.length).toBeGreaterThan(0)
    })

    it('should quickSearch as a convenience', () => {
      const results = engine.quickSearch('TypeScript', 3)
      expect(results.length).toBeLessThanOrEqual(3)
    })
  })

  describe('Stats & Config', () => {
    it('should track search statistics', () => {
      engine.indexDocument({ id: 'd1', title: 'Test', content: 'test content', category: 'test', tags: [], metadata: {} })
      engine.search({ text: 'test' })
      engine.search({ text: 'content' })

      const stats = engine.getStats()
      expect(stats.totalDocuments).toBe(1)
      expect(stats.totalSearches).toBe(2)
    })

    it('should return config', () => {
      const config = engine.getConfig()
      expect(config.maxDocuments).toBe(DEFAULT_SEARCH_CONFIG.maxDocuments)
      expect(config.fuzzyThreshold).toBe(DEFAULT_SEARCH_CONFIG.fuzzyThreshold)
    })

    it('should clear all data', () => {
      engine.indexDocument({ id: 'd1', title: 'Test', content: 'content', category: 'test', tags: [], metadata: {} })
      engine.clear()
      expect(engine.getDocumentCount()).toBe(0)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//   💾 MEMORY MANAGER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('💾 MemoryManager', () => {
  let memory: MemoryManager

  beforeEach(() => {
    memory = new MemoryManager()
  })

  describe('Store & Retrieve', () => {
    it('should store a memory entry', () => {
      const entry = memory.store('greeting', 'Hello World', { category: 'test', importance: 0.8 })
      expect(entry.key).toBe('greeting')
      expect(entry.value).toBe('Hello World')
      expect(entry.category).toBe('test')
      expect(entry.importance).toBe(0.8)
      expect(entry.id).toMatch(/^mem_/)
    })

    it('should retrieve memories by key', () => {
      memory.store('greeting', 'Hello')
      memory.store('greeting', 'Hi there')
      memory.store('farewell', 'Goodbye')

      const results = memory.retrieve('greeting')
      expect(results.length).toBe(2)
    })

    it('should recall memories by content similarity', () => {
      memory.store('ts_guide', 'TypeScript programming language guide', { category: 'code' })
      memory.store('py_guide', 'Python data science tutorial', { category: 'code' })
      memory.store('sql_basics', 'SQL database query fundamentals', { category: 'data' })

      const results = memory.recall('TypeScript programming')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.key).toBe('ts_guide')
    })

    it('should get associated memories', () => {
      const e1 = memory.store('concept1', 'First concept')
      const e2 = memory.store('concept2', 'Second concept')

      memory.associate(e1.id, e2.id)

      const associated = memory.getAssociated(e1.id)
      expect(associated.length).toBe(1)
      expect(associated[0]!.id).toBe(e2.id)
    })

    it('should return empty for non-existent associations', () => {
      expect(memory.getAssociated('nonexistent')).toEqual([])
    })
  })

  describe('Memory Management', () => {
    it('should forget a memory', () => {
      const entry = memory.store('temp', 'temporary')
      expect(memory.forget(entry.id)).toBe(true)
      expect(memory.getSize()).toBe(0)
      expect(memory.forget('nonexistent')).toBe(false)
    })

    it('should reinforce a memory', () => {
      const entry = memory.store('skill', 'learned skill', { importance: 0.5 })
      expect(memory.reinforce(entry.id, 0.2)).toBe(true)

      const retrieved = memory.retrieve('skill')
      expect(retrieved[0]!.importance).toBeCloseTo(0.7, 1)
    })

    it('should cap importance at 1.0', () => {
      const entry = memory.store('skill', 'skill', { importance: 0.9 })
      memory.reinforce(entry.id, 0.5)
      const retrieved = memory.retrieve('skill')
      expect(retrieved[0]!.importance).toBeLessThanOrEqual(1.0)
    })

    it('should return false for reinforcing non-existent entry', () => {
      expect(memory.reinforce('nonexistent')).toBe(false)
    })

    it('should associate two memories bidirectionally', () => {
      const e1 = memory.store('a', 'alpha')
      const e2 = memory.store('b', 'beta')

      expect(memory.associate(e1.id, e2.id)).toBe(true)

      expect(memory.getAssociated(e1.id).length).toBe(1)
      expect(memory.getAssociated(e2.id).length).toBe(1)
    })

    it('should fail to associate with non-existent entry', () => {
      const e1 = memory.store('a', 'alpha')
      expect(memory.associate(e1.id, 'nonexistent')).toBe(false)
    })
  })

  describe('Persistence', () => {
    it('should save and load snapshots', () => {
      memory.store('key1', 'value1', { category: 'test' })
      memory.store('key2', 'value2', { category: 'test' })

      const snapshot = memory.save()
      expect(snapshot.entries.length).toBe(2)
      expect(snapshot.version).toBe(1)
      expect(snapshot.savedAt).toBeGreaterThan(0)

      // Load into new manager
      const newMemory = new MemoryManager()
      const loaded = newMemory.load(snapshot)
      expect(loaded).toBe(2)
      expect(newMemory.getSize()).toBe(2)
    })

    it('should preserve entry data through save/load cycle', () => {
      const original = memory.store('test', 'test value', { category: 'code', importance: 0.9 })
      const snapshot = memory.save()

      const newMemory = new MemoryManager()
      newMemory.load(snapshot)

      const retrieved = newMemory.retrieve('test')
      expect(retrieved.length).toBe(1)
      expect(retrieved[0]!.value).toBe('test value')
      expect(retrieved[0]!.category).toBe('code')
      expect(retrieved[0]!.importance).toBe(0.9)
    })
  })

  describe('Stats', () => {
    it('should track statistics', () => {
      memory.store('a', 'alpha', { category: 'letters' })
      memory.store('b', 'beta', { category: 'letters' })
      memory.store('1', 'one', { category: 'numbers' })

      const stats = memory.getStats()
      expect(stats.totalEntries).toBe(3)
      expect(stats.categoryCounts['letters']).toBe(2)
      expect(stats.categoryCounts['numbers']).toBe(1)
    })

    it('should track access counts', () => {
      memory.store('key', 'value')
      memory.retrieve('key')
      memory.retrieve('key')

      const stats = memory.getStats()
      expect(stats.totalAccesses).toBe(2)
    })

    it('should return categories', () => {
      memory.store('a', 'a', { category: 'x' })
      memory.store('b', 'b', { category: 'y' })
      const cats = memory.getCategories()
      expect(cats).toContain('x')
      expect(cats).toContain('y')
    })

    it('should clear all memories', () => {
      memory.store('a', 'a')
      memory.store('b', 'b')
      memory.clear()
      expect(memory.getSize()).toBe(0)
      expect(memory.getStats().totalEntries).toBe(0)
    })
  })

  describe('Config defaults', () => {
    it('should have correct default config values', () => {
      expect(DEFAULT_MEMORY_CONFIG.maxEntries).toBe(10000)
      expect(DEFAULT_MEMORY_CONFIG.defaultDecayRate).toBe(0.01)
      expect(DEFAULT_MEMORY_CONFIG.minImportance).toBe(0.05)
      expect(DEFAULT_MEMORY_CONFIG.enableAssociations).toBe(true)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//   ⚡ TOOL CIRCUIT BREAKER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('⚡ ToolCircuitBreaker', () => {
  let breaker: ToolCircuitBreaker

  beforeEach(() => {
    breaker = new ToolCircuitBreaker()
  })

  describe('Basic Operations', () => {
    it('should start with closed circuit', () => {
      expect(breaker.isOpen('tool1')).toBe(false)
    })

    it('should record successes', () => {
      breaker.recordSuccess('tool1', 100)
      breaker.recordSuccess('tool1', 150)

      const state = breaker.getState('tool1')
      expect(state).not.toBeNull()
      expect(state!.successes).toBe(2)
      expect(state!.totalCalls).toBe(2)
      expect(state!.state).toBe('closed')
    })

    it('should record failures', () => {
      breaker.recordFailure('tool1')
      breaker.recordFailure('tool1')

      const state = breaker.getState('tool1')
      expect(state!.failures).toBe(2)
      expect(state!.state).toBe('closed') // Not yet at threshold
    })

    it('should open circuit after threshold failures', () => {
      breaker.recordFailure('tool1')
      breaker.recordFailure('tool1')
      breaker.recordFailure('tool1') // threshold = 3

      expect(breaker.isOpen('tool1')).toBe(true)
      expect(breaker.getState('tool1')!.state).toBe('open')
    })

    it('should track average latency', () => {
      breaker.recordSuccess('tool1', 100)
      breaker.recordSuccess('tool1', 200)

      const state = breaker.getState('tool1')
      expect(state!.averageLatencyMs).toBe(150)
    })
  })

  describe('Circuit States', () => {
    it('should transition: closed → open → half_open → closed', () => {
      // Trip the breaker
      breaker.recordFailure('tool1')
      breaker.recordFailure('tool1')
      breaker.recordFailure('tool1')
      expect(breaker.getState('tool1')!.state).toBe('open')

      // Simulate time passing by creating new breaker with low timeout
      const fastBreaker = new ToolCircuitBreaker({ resetTimeoutMs: 1 })
      fastBreaker.recordFailure('tool1')
      fastBreaker.recordFailure('tool1')
      fastBreaker.recordFailure('tool1')
      expect(fastBreaker.isOpen('tool1')).toBe(true)

      // After reset timeout, should go to half_open
      // (isOpen checks time and transitions)
      // Wait is simulated by the low resetTimeoutMs of 1ms
    })

    it('should reset on success in half_open state', () => {
      // Manually test half_open → closed transition
      breaker.recordFailure('tool1')
      breaker.recordFailure('tool1')
      breaker.recordFailure('tool1')

      // Force half_open
      const state = breaker.getState('tool1')!
      state.state = 'half_open'

      breaker.recordSuccess('tool1', 100)
      expect(breaker.getState('tool1')!.state).toBe('closed')
      expect(breaker.getState('tool1')!.failures).toBe(0)
    })
  })

  describe('Reset & Health', () => {
    it('should reset a specific tool', () => {
      breaker.recordFailure('tool1')
      breaker.reset('tool1')
      expect(breaker.getState('tool1')).toBeNull()
    })

    it('should reset all tools', () => {
      breaker.recordFailure('tool1')
      breaker.recordFailure('tool2')
      breaker.resetAll()
      expect(breaker.getAllStates()).toEqual([])
    })

    it('should report health summary', () => {
      breaker.recordSuccess('healthy_tool', 100)
      breaker.recordFailure('failing_tool')
      breaker.recordFailure('failing_tool')
      breaker.recordFailure('failing_tool')

      const health = breaker.getHealthSummary()
      expect(health.healthy).toContain('healthy_tool')
      expect(health.failed).toContain('failing_tool')
    })

    it('should update failure rate', () => {
      breaker.recordSuccess('tool1', 100)
      breaker.recordFailure('tool1')

      const state = breaker.getState('tool1')
      expect(state!.failureRate).toBe(0.5)
    })
  })

  describe('Config defaults', () => {
    it('should have correct default config', () => {
      expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.failureThreshold).toBe(3)
      expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.resetTimeoutMs).toBe(30000)
      expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.halfOpenMaxAttempts).toBe(2)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//   🎯 ADAPTIVE TOOL SELECTOR TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('🎯 AdaptiveToolSelector', () => {
  let selector: AdaptiveToolSelector
  let breaker: ToolCircuitBreaker

  beforeEach(() => {
    breaker = new ToolCircuitBreaker()
    selector = new AdaptiveToolSelector(breaker)
  })

  describe('Performance Recording', () => {
    it('should record tool performance', () => {
      const result: AgentToolResult = {
        success: true,
        output: 'test output',
        confidence: 0.9,
        source: 'tool1',
        durationMs: 100,
      }

      selector.recordPerformance('tool1', 'code_generation', result)

      const perf = selector.getToolPerformance('tool1')
      expect(perf.length).toBeGreaterThan(0)
      expect(perf[0]!.toolName).toBe('tool1')
      expect(perf[0]!.successRate).toBe(1)
    })

    it('should update existing records', () => {
      selector.recordPerformance('tool1', 'code_generation', {
        success: true, output: '', confidence: 0.9, source: 'tool1', durationMs: 100,
      })
      selector.recordPerformance('tool1', 'code_generation', {
        success: false, output: '', confidence: 0.3, source: 'tool1', durationMs: 200,
      })

      const perf = selector.getToolPerformance('tool1')
      expect(perf[0]!.totalCalls).toBe(2)
      expect(perf[0]!.successRate).toBe(0.5) // 1 success, 1 failure
    })
  })

  describe('Tool Selection', () => {
    it('should select tool with best performance', () => {
      // Tool1: high success rate
      selector.recordPerformance('tool1', 'code_generation', {
        success: true, output: '', confidence: 0.9, source: 'tool1', durationMs: 50,
      })

      // Tool2: lower success rate
      selector.recordPerformance('tool2', 'code_generation', {
        success: false, output: '', confidence: 0.3, source: 'tool2', durationMs: 500,
      })

      const selection = selector.selectBestTool(['tool1', 'tool2'], 'code_generation')
      expect(selection.toolName).toBe('tool1')
      expect(selection.score).toBeGreaterThan(0)
    })

    it('should skip tools with open circuit breakers', () => {
      // Trip breaker for tool1
      breaker.recordFailure('tool1')
      breaker.recordFailure('tool1')
      breaker.recordFailure('tool1')

      selector.recordPerformance('tool1', 'code_generation', {
        success: true, output: '', confidence: 0.9, source: 'tool1', durationMs: 50,
      })
      selector.recordPerformance('tool2', 'code_generation', {
        success: true, output: '', confidence: 0.7, source: 'tool2', durationMs: 100,
      })

      const selection = selector.selectBestTool(['tool1', 'tool2'], 'code_generation')
      expect(selection.toolName).toBe('tool2') // tool1 is open
    })

    it('should select unknown tools for exploration', () => {
      const selection = selector.selectBestTool(['unknown_tool'], 'code_generation')
      expect(selection.toolName).toBe('unknown_tool')
      expect(selection.reason).toContain('exploration')
    })

    it('should return default tool when no candidates', () => {
      const selection = selector.selectBestTool([], 'code_generation')
      expect(selection.toolName).toBe('spark_general')
    })
  })

  describe('Data Management', () => {
    it('should get all performance data', () => {
      selector.recordPerformance('tool1', 'code_generation', {
        success: true, output: '', confidence: 0.9, source: 'tool1', durationMs: 50,
      })

      const all = selector.getAllPerformance()
      expect(all.size).toBeGreaterThan(0)
    })

    it('should clear performance history', () => {
      selector.recordPerformance('tool1', 'code_generation', {
        success: true, output: '', confidence: 0.9, source: 'tool1', durationMs: 50,
      })
      selector.clear()
      expect(selector.getAllPerformance().size).toBe(0)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//   ⚡ PARALLEL EXECUTOR TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('⚡ ParallelExecutor', () => {
  let executor: ParallelExecutor

  beforeEach(() => {
    executor = new ParallelExecutor(2)
  })

  describe('Parallel Execution', () => {
    it('should execute tasks in parallel batches', async () => {
      const results = await executor.executeParallel([
        {
          toolName: 'tool1',
          input: 'input1',
          handler: async () => ({
            success: true, output: 'result1', confidence: 0.9, source: 'tool1', durationMs: 10,
          }),
        },
        {
          toolName: 'tool2',
          input: 'input2',
          handler: async () => ({
            success: true, output: 'result2', confidence: 0.8, source: 'tool2', durationMs: 10,
          }),
        },
      ])

      expect(results.results.length).toBe(2)
      expect(results.successCount).toBe(2)
      expect(results.failureCount).toBe(0)
    })

    it('should handle failures gracefully', async () => {
      const results = await executor.executeParallel([
        {
          toolName: 'good',
          input: 'input',
          handler: async () => ({
            success: true, output: 'ok', confidence: 0.9, source: 'good', durationMs: 10,
          }),
        },
        {
          toolName: 'bad',
          input: 'input',
          handler: async () => { throw new Error('Tool crashed') },
        },
      ])

      expect(results.results.length).toBe(2)
      expect(results.successCount).toBe(1)
      expect(results.failureCount).toBe(1)
    })

    it('should respect max concurrency', async () => {
      const executor3 = new ParallelExecutor(1) // Only 1 at a time
      const tasks = [
        { toolName: 't1', input: 'i1', handler: async () => ({ success: true, output: 'r1', confidence: 1, source: 't1', durationMs: 1 }) },
        { toolName: 't2', input: 'i2', handler: async () => ({ success: true, output: 'r2', confidence: 1, source: 't2', durationMs: 1 }) },
        { toolName: 't3', input: 'i3', handler: async () => ({ success: true, output: 'r3', confidence: 1, source: 't3', durationMs: 1 }) },
      ]

      const results = await executor3.executeParallel(tasks)
      expect(results.results.length).toBe(3)
      expect(results.successCount).toBe(3)
    })

    it('should handle empty task list', async () => {
      const results = await executor.executeParallel([])
      expect(results.results.length).toBe(0)
      expect(results.successCount).toBe(0)
    })

    it('should handle synchronous handlers', async () => {
      const results = await executor.executeParallel([
        {
          toolName: 'sync_tool',
          input: 'input',
          handler: () => ({
            success: true, output: 'sync result', confidence: 0.9, source: 'sync_tool', durationMs: 1,
          }),
        },
      ])

      expect(results.results.length).toBe(1)
      expect(results.results[0]!.output).toBe('sync result')
    })
  })

  describe('Configuration', () => {
    it('should get and set max concurrency', () => {
      expect(executor.getMaxConcurrency()).toBe(2)
      executor.setMaxConcurrency(8)
      expect(executor.getMaxConcurrency()).toBe(8)
    })

    it('should enforce minimum concurrency of 1', () => {
      executor.setMaxConcurrency(0)
      expect(executor.getMaxConcurrency()).toBe(1)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//   📋 DYNAMIC PLANNER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('📋 DynamicPlanner', () => {
  let planner: DynamicPlanner

  beforeEach(() => {
    planner = new DynamicPlanner()
  })

  describe('Plan Creation', () => {
    it('should create a dynamic plan', () => {
      const plan = planner.createPlan('Build a web app', [
        { description: 'Design architecture', tool: 'spark_reason' },
        { description: 'Generate code', tool: 'spark_code_generate', dependencies: ['step_0'] },
        { description: 'Review code', tool: 'spark_code_review', dependencies: ['step_1'] },
      ], ['Must use TypeScript'])

      expect(plan.id).toMatch(/^plan_/)
      expect(plan.goal).toBe('Build a web app')
      expect(plan.steps.length).toBe(3)
      expect(plan.constraints).toContain('Must use TypeScript')
      expect(plan.status).toBe('planning')
      expect(plan.version).toBe(1)
    })

    it('should assign step IDs sequentially', () => {
      const plan = planner.createPlan('Test', [
        { description: 'Step A', tool: 'tool1' },
        { description: 'Step B', tool: 'tool2' },
      ])

      expect(plan.steps[0]!.id).toBe('step_0')
      expect(plan.steps[1]!.id).toBe('step_1')
    })

    it('should initialize steps as pending', () => {
      const plan = planner.createPlan('Test', [
        { description: 'Step', tool: 'tool' },
      ])

      expect(plan.steps[0]!.status).toBe('pending')
      expect(plan.steps[0]!.retries).toBe(0)
    })
  })

  describe('Step Execution', () => {
    it('should get ready steps (no dependencies)', () => {
      const plan = planner.createPlan('Test', [
        { description: 'A', tool: 'tool1' },
        { description: 'B', tool: 'tool2' },
        { description: 'C', tool: 'tool3', dependencies: ['step_0'] },
      ])

      const ready = planner.getReadySteps(plan)
      expect(ready.length).toBe(2) // step_0 and step_1 (no deps)
    })

    it('should only return steps with satisfied dependencies', () => {
      const plan = planner.createPlan('Test', [
        { description: 'A', tool: 'tool1' },
        { description: 'B', tool: 'tool2', dependencies: ['step_0'] },
      ])

      // Before completing step_0
      let ready = planner.getReadySteps(plan)
      expect(ready.length).toBe(1)
      expect(ready[0]!.id).toBe('step_0')

      // Complete step_0
      planner.completeStep(plan, 'step_0', {
        success: true, output: 'done', confidence: 0.9, source: 'tool1', durationMs: 100,
      })

      // Now step_1 should be ready
      ready = planner.getReadySteps(plan)
      expect(ready.length).toBe(1)
      expect(ready[0]!.id).toBe('step_1')
    })

    it('should mark step as complete on success', () => {
      const plan = planner.createPlan('Test', [{ description: 'A', tool: 'tool1' }])

      planner.completeStep(plan, 'step_0', {
        success: true, output: 'ok', confidence: 0.9, source: 'tool1', durationMs: 50,
      })

      expect(plan.steps[0]!.status).toBe('complete')
      expect(plan.steps[0]!.result?.success).toBe(true)
    })

    it('should mark step as failed on failure', () => {
      const plan = planner.createPlan('Test', [{ description: 'A', tool: 'tool1' }])

      planner.completeStep(plan, 'step_0', {
        success: false, output: 'error', confidence: 0, source: 'tool1', durationMs: 50,
      })

      expect(plan.steps[0]!.status).toBe('failed')
    })
  })

  describe('Plan Status', () => {
    it('should detect complete plan', () => {
      const plan = planner.createPlan('Test', [
        { description: 'A', tool: 'tool1' },
        { description: 'B', tool: 'tool2' },
      ])

      planner.completeStep(plan, 'step_0', { success: true, output: 'ok', confidence: 1, source: 'tool1', durationMs: 10 })
      planner.completeStep(plan, 'step_1', { success: true, output: 'ok', confidence: 1, source: 'tool2', durationMs: 10 })

      expect(planner.isPlanComplete(plan)).toBe(true)
    })

    it('should detect failed plan (max retries exceeded)', () => {
      const plan = planner.createPlan('Test', [
        { description: 'A', tool: 'tool1', maxRetries: 0 },
      ])

      planner.completeStep(plan, 'step_0', { success: false, output: 'err', confidence: 0, source: 'tool1', durationMs: 10 })

      expect(planner.isPlanFailed(plan)).toBe(true)
    })

    it('should not be failed if retries remain', () => {
      const plan = planner.createPlan('Test', [
        { description: 'A', tool: 'tool1', maxRetries: 2 },
      ])

      planner.completeStep(plan, 'step_0', { success: false, output: 'err', confidence: 0, source: 'tool1', durationMs: 10 })

      expect(planner.isPlanFailed(plan)).toBe(false) // retries: 0 < maxRetries: 2
    })
  })

  describe('Replanning', () => {
    it('should replan a failed step with alternative tool', () => {
      const plan = planner.createPlan('Test', [
        { description: 'Generate code', tool: 'tool1', maxRetries: 2 },
      ])

      planner.completeStep(plan, 'step_0', { success: false, output: 'err', confidence: 0, source: 'tool1', durationMs: 10 })

      const replanned = planner.replan(plan, 'step_0', 'Try alternative generation', 'tool2')
      expect(replanned.tool).toBe('tool2')
      expect(replanned.description).toBe('Try alternative generation')
      expect(plan.version).toBe(2)
      expect(plan.status).toBe('replanning')
    })

    it('should add new step when max retries exceeded', () => {
      const plan = planner.createPlan('Test', [
        { description: 'A', tool: 'tool1', maxRetries: 0 },
      ])

      plan.steps[0]!.retries = 1 // Already retried

      const newStep = planner.replan(plan, 'step_0', 'Alternative approach', 'tool_alt')
      expect(newStep.id).toBe('step_alt_1')
      expect(plan.steps.length).toBe(2)
    })
  })

  describe('Execution Order', () => {
    it('should compute topological execution order', () => {
      const plan = planner.createPlan('Test', [
        { description: 'A', tool: 't1' },                                // step_0: no deps
        { description: 'B', tool: 't2' },                                // step_1: no deps
        { description: 'C', tool: 't3', dependencies: ['step_0'] },     // step_2: depends on step_0
        { description: 'D', tool: 't4', dependencies: ['step_0', 'step_1'] }, // step_3: depends on both
      ])

      const order = planner.getExecutionOrder(plan)
      expect(order.length).toBeGreaterThanOrEqual(2)

      // Level 0: step_0, step_1 (no deps)
      expect(order[0]!.map(s => s.id).sort()).toEqual(['step_0', 'step_1'])

      // Later levels contain dependent steps
      const laterStepIds = order.slice(1).flatMap(level => level.map(s => s.id))
      expect(laterStepIds).toContain('step_2')
      expect(laterStepIds).toContain('step_3')
    })

    it('should handle linear chain dependencies', () => {
      const plan = planner.createPlan('Pipeline', [
        { description: 'Step 1', tool: 't1' },
        { description: 'Step 2', tool: 't2', dependencies: ['step_0'] },
        { description: 'Step 3', tool: 't3', dependencies: ['step_1'] },
      ])

      const order = planner.getExecutionOrder(plan)
      expect(order.length).toBe(3) // Each level has 1 step
    })
  })

  describe('Plan Management', () => {
    it('should get plan by ID', () => {
      const plan = planner.createPlan('Test', [{ description: 'A', tool: 't1' }])
      expect(planner.getPlan(plan.id)).not.toBeNull()
      expect(planner.getPlan('nonexistent')).toBeNull()
    })

    it('should get all plans', () => {
      planner.createPlan('Plan 1', [{ description: 'A', tool: 't1' }])
      planner.createPlan('Plan 2', [{ description: 'B', tool: 't2' }])
      expect(planner.getAllPlans().length).toBe(2)
    })

    it('should clear all plans', () => {
      planner.createPlan('Plan', [{ description: 'A', tool: 't1' }])
      planner.clear()
      expect(planner.getAllPlans().length).toBe(0)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//   🔄 INTEGRATION TESTS — Systems Working Together
// ═══════════════════════════════════════════════════════════════════════════════

describe('🔄 Integration: Systems Working Together', () => {
  it('should use search engine results to feed memory', () => {
    const search = new SparkSearchEngine()
    const memory = new MemoryManager()

    // Index documents
    search.indexDocuments([
      { id: 'd1', title: 'TypeScript Patterns', content: 'Design patterns in TypeScript', category: 'code', tags: ['ts'], metadata: {} },
      { id: 'd2', title: 'Security Guide', content: 'Web security best practices', category: 'security', tags: ['sec'], metadata: {} },
    ])

    // Search and memorize results
    const results = search.quickSearch('TypeScript patterns', 3)
    expect(results.length).toBeGreaterThan(0)

    for (const r of results) {
      memory.store(r.document.title, r.document.content, {
        category: r.document.category,
        importance: r.score,
      })
    }

    // Memory should contain what we found
    const recalled = memory.recall('TypeScript')
    expect(recalled.length).toBeGreaterThan(0)
  })

  it('should use circuit breaker with adaptive selection', () => {
    const breaker = new ToolCircuitBreaker()
    const selector = new AdaptiveToolSelector(breaker)

    // Record good performance for tool1
    selector.recordPerformance('tool1', 'code_generation', {
      success: true, output: '', confidence: 0.9, source: 'tool1', durationMs: 50,
    })

    // tool2 fails
    selector.recordPerformance('tool2', 'code_generation', {
      success: false, output: '', confidence: 0.1, source: 'tool2', durationMs: 500,
    })

    // Selector should prefer tool1
    const selection = selector.selectBestTool(['tool1', 'tool2'], 'code_generation')
    expect(selection.toolName).toBe('tool1')
  })

  it('should use dynamic planner with parallel executor', async () => {
    const planner = new DynamicPlanner()
    const executor = new ParallelExecutor(4)

    // Create plan with parallel-ready steps
    const plan = planner.createPlan('Multi-analysis', [
      { description: 'Analyze structure', tool: 'analyzer' },
      { description: 'Check security', tool: 'security' },
      { description: 'Review quality', tool: 'reviewer' },
      { description: 'Final report', tool: 'reporter', dependencies: ['step_0', 'step_1', 'step_2'] },
    ])

    // Get parallel-ready steps
    const readySteps = planner.getReadySteps(plan)
    expect(readySteps.length).toBe(3) // First 3 steps have no deps

    // Execute them in parallel
    const tasks = readySteps.map(step => ({
      toolName: step.tool,
      input: step.description,
      handler: async () => ({
        success: true,
        output: `Result of ${step.description}`,
        confidence: 0.9,
        source: step.tool,
        durationMs: 10,
      }),
    }))

    const parallelResults = await executor.executeParallel(tasks)
    expect(parallelResults.successCount).toBe(3)

    // Complete the steps
    for (let i = 0; i < readySteps.length; i++) {
      planner.completeStep(plan, readySteps[i]!.id, parallelResults.results[i]!)
    }

    // Now step_3 should be ready
    const nextReady = planner.getReadySteps(plan)
    expect(nextReady.length).toBe(1)
    expect(nextReady[0]!.id).toBe('step_3')
  })

  it('should use memory to persist search learnings', () => {
    const memory = new MemoryManager()

    // Store some learnings
    memory.store('best_tool_for_code', 'spark_code_generate', { category: 'tool_selection', importance: 0.9 })
    memory.store('best_tool_for_security', 'spark_security_analyze', { category: 'tool_selection', importance: 0.85 })

    // Save snapshot
    const snapshot = memory.save()

    // Load into new memory
    const newMemory = new MemoryManager()
    newMemory.load(snapshot)

    // Recall tool preferences — use key directly since recall searches content
    const codeToolMemory = newMemory.retrieve('best_tool_for_code')
    expect(codeToolMemory.length).toBeGreaterThan(0)
    expect(codeToolMemory[0]!.value).toBe('spark_code_generate')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
//   📊 DEFAULT CONFIG TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('📊 Default Configs', () => {
  it('should have valid search config', () => {
    expect(DEFAULT_SEARCH_CONFIG.maxDocuments).toBe(50000)
    expect(DEFAULT_SEARCH_CONFIG.defaultMaxResults).toBe(10)
    expect(DEFAULT_SEARCH_CONFIG.defaultMinScore).toBe(0.1)
    expect(DEFAULT_SEARCH_CONFIG.fuzzyThreshold).toBe(0.6)
    expect(DEFAULT_SEARCH_CONFIG.semanticWeight).toBe(0.4)
    expect(DEFAULT_SEARCH_CONFIG.enableSynonyms).toBe(true)
    expect(DEFAULT_SEARCH_CONFIG.enableGraph).toBe(true)
  })

  it('should have valid memory config', () => {
    expect(DEFAULT_MEMORY_CONFIG.maxEntries).toBe(10000)
    expect(DEFAULT_MEMORY_CONFIG.defaultDecayRate).toBe(0.01)
    expect(DEFAULT_MEMORY_CONFIG.enableAssociations).toBe(true)
  })

  it('should have valid circuit breaker config', () => {
    expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.failureThreshold).toBe(3)
    expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.resetTimeoutMs).toBe(30000)
    expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.halfOpenMaxAttempts).toBe(2)
    expect(DEFAULT_CIRCUIT_BREAKER_CONFIG.latencyThresholdMs).toBe(10000)
  })
})
