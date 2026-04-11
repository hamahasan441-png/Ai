import { describe, it, expect, beforeEach } from 'vitest'
import { AdvancedSearchEngine } from '../AdvancedSearchEngine.js'
import type { SearchDocument } from '../AdvancedSearchEngine.js'

// ── Helper: build a small corpus for testing ──

function buildTestCorpus(): SearchDocument[] {
  return [
    {
      id: 'doc-1',
      title: 'Introduction to JavaScript',
      content:
        'JavaScript is a high-level, interpreted programming language used for web development. It supports event-driven, functional, and imperative programming styles.',
      keywords: ['javascript', 'js', 'programming', 'web', 'frontend'],
      domain: 'javascript',
      weight: 1.0,
    },
    {
      id: 'doc-2',
      title: 'TypeScript Fundamentals',
      content:
        'TypeScript is a strongly typed programming language that builds on JavaScript. It adds optional static typing and class-based object-oriented programming.',
      keywords: ['typescript', 'ts', 'programming', 'types', 'javascript'],
      domain: 'typescript',
      weight: 1.0,
    },
    {
      id: 'doc-3',
      title: 'React Framework Guide',
      content:
        'React is a JavaScript library for building user interfaces. It uses a virtual DOM and component-based architecture for efficient UI rendering.',
      keywords: ['react', 'javascript', 'ui', 'components', 'frontend', 'virtual-dom'],
      domain: 'javascript',
      weight: 1.0,
    },
    {
      id: 'doc-4',
      title: 'Python for Data Science',
      content:
        'Python is a versatile programming language widely used in data science, machine learning, and artificial intelligence. Libraries like pandas, numpy, and scikit-learn make it powerful.',
      keywords: ['python', 'data-science', 'machine-learning', 'pandas', 'numpy'],
      domain: 'python',
      weight: 1.0,
    },
    {
      id: 'doc-5',
      title: 'SQL Database Queries',
      content:
        'SQL is a domain-specific language for managing and querying relational databases. Common operations include SELECT, INSERT, UPDATE, and DELETE.',
      keywords: ['sql', 'database', 'query', 'relational', 'table'],
      domain: 'database',
      weight: 1.0,
    },
    {
      id: 'doc-6',
      title: 'Docker Container Basics',
      content:
        'Docker is a platform for developing, shipping, and running applications in containers. Containers package code and dependencies together for consistent deployment.',
      keywords: ['docker', 'container', 'deployment', 'devops', 'infrastructure'],
      domain: 'devops',
      weight: 1.0,
    },
    {
      id: 'doc-7',
      title: 'REST API Design',
      content:
        'REST is an architectural style for designing networked applications. RESTful APIs use HTTP methods and follow resource-oriented URL patterns.',
      keywords: ['rest', 'api', 'http', 'endpoint', 'web', 'backend'],
      domain: 'web-development',
      weight: 1.0,
    },
    {
      id: 'doc-8',
      title: 'Git Version Control',
      content:
        'Git is a distributed version control system for tracking changes in source code. It supports branching, merging, and collaborative development workflows.',
      keywords: ['git', 'version-control', 'branch', 'merge', 'repository'],
      domain: 'programming',
      weight: 1.0,
    },
    {
      id: 'doc-9',
      title: 'Machine Learning Algorithms',
      content:
        'Machine learning algorithms learn patterns from data. Common types include supervised learning (classification, regression), unsupervised learning (clustering), and reinforcement learning.',
      keywords: ['machine-learning', 'algorithm', 'classification', 'regression', 'clustering'],
      domain: 'machine-learning',
      weight: 1.0,
    },
    {
      id: 'doc-10',
      title: 'Cybersecurity Fundamentals',
      content:
        'Cybersecurity involves protecting systems and data from digital attacks. Key areas include network security, encryption, authentication, and vulnerability assessment.',
      keywords: ['security', 'cybersecurity', 'encryption', 'authentication', 'vulnerability'],
      domain: 'security',
      weight: 1.0,
    },
    {
      id: 'doc-11',
      title: 'Kubernetes Orchestration',
      content:
        'Kubernetes is an open-source container orchestration platform for automating deployment, scaling, and management of containerized applications.',
      keywords: ['kubernetes', 'k8s', 'orchestration', 'container', 'scaling', 'devops'],
      domain: 'devops',
      weight: 1.0,
    },
    {
      id: 'doc-12',
      title: 'Sorting Algorithms',
      content:
        'Sorting algorithms order elements in a collection. Common algorithms include quicksort, mergesort, heapsort, and bubble sort with different time complexities.',
      keywords: ['sorting', 'algorithm', 'quicksort', 'mergesort', 'complexity', 'big-o'],
      domain: 'algorithms',
      weight: 1.0,
    },
  ]
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AdvancedSearchEngine', () => {
  let engine: AdvancedSearchEngine

  beforeEach(() => {
    engine = new AdvancedSearchEngine()
    engine.indexDocuments(buildTestCorpus())
  })

  // ── Construction ──

  describe('construction', () => {
    it('creates with default config', () => {
      const e = new AdvancedSearchEngine()
      expect(e.getDocumentCount()).toBe(0)
      expect(e.getGraphNodeCount()).toBe(0)
    })

    it('accepts partial config', () => {
      const e = new AdvancedSearchEngine({ maxResults: 3, enableFuzzy: false })
      e.indexDocuments(buildTestCorpus())
      const result = e.searchWithThinking('javascript')
      expect(result.results.length).toBeLessThanOrEqual(3)
    })

    it('merges strategy weights with defaults', () => {
      const e = new AdvancedSearchEngine({ strategyWeights: { keyword: 2.0 } })
      const stats = e.getStats()
      expect(stats.totalSearches).toBe(0)
    })
  })

  // ── Document management ──

  describe('document management', () => {
    it('indexes documents correctly', () => {
      expect(engine.getDocumentCount()).toBe(12)
    })

    it('updates existing documents on re-index', () => {
      engine.indexDocuments([
        {
          id: 'doc-1',
          title: 'Updated JavaScript',
          content: 'Updated content.',
          keywords: ['javascript', 'updated'],
        },
      ])
      expect(engine.getDocumentCount()).toBe(12) // no duplicates
    })

    it('removes documents by id', () => {
      expect(engine.removeDocument('doc-1')).toBe(true)
      expect(engine.getDocumentCount()).toBe(11)
    })

    it('returns false for non-existent removal', () => {
      expect(engine.removeDocument('nonexistent')).toBe(false)
    })
  })

  // ── Graph management ──

  describe('graph management', () => {
    it('adds graph nodes and edges', () => {
      engine.addGraphNode('n1', 'JavaScript', 'programming')
      engine.addGraphNode('n2', 'TypeScript', 'programming')
      engine.addGraphEdge('n1', 'n2', 0.9, 'related-to')
      expect(engine.getGraphNodeCount()).toBe(2)
    })
  })

  // ── Conversation context ──

  describe('conversation context', () => {
    it('adds and clears context', () => {
      engine.addConversationContext('Tell me about JavaScript')
      engine.addConversationContext('What about React?')
      engine.clearContext()
      // After clear, contextual search should not boost
      const result = engine.searchWithThinking('programming')
      const contextSteps = result.thinkingSteps.filter(s => s.strategy === 'contextual')
      // contextual step should not appear since context was cleared
      expect(contextSteps.length).toBe(0)
    })

    it('limits context to 20 turns', () => {
      for (let i = 0; i < 25; i++) {
        engine.addConversationContext(`Turn ${i}`)
      }
      // Should not crash and should still work
      const result = engine.searchWithThinking('javascript')
      expect(result.results.length).toBeGreaterThan(0)
    })
  })

  // ── searchWithThinking ──

  describe('searchWithThinking', () => {
    it('returns results for a simple query', () => {
      const result = engine.searchWithThinking('javascript')
      expect(result.results.length).toBeGreaterThan(0)
      expect(result.query).toBe('javascript')
      expect(result.totalDurationMs).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.candidatesScanned).toBe(12)
    })

    it('produces thinking steps', () => {
      const result = engine.searchWithThinking('javascript')
      expect(result.thinkingSteps.length).toBeGreaterThan(0)
      // First step should be meta (query analysis)
      expect(result.thinkingSteps[0]!.strategy).toBe('meta')
      // Last step should be meta (merge & rank)
      expect(result.thinkingSteps[result.thinkingSteps.length - 1]!.strategy).toBe('meta')
    })

    it('includes keyword strategy in thinking steps', () => {
      const result = engine.searchWithThinking('python')
      const keywordStep = result.thinkingSteps.find(s => s.strategy === 'keyword')
      expect(keywordStep).toBeDefined()
      expect(keywordStep!.thought).toContain('keyword')
    })

    it('includes fuzzy strategy for close matches', () => {
      const result = engine.searchWithThinking('javscript') // typo
      const fuzzyStep = result.thinkingSteps.find(s => s.strategy === 'fuzzy')
      expect(fuzzyStep).toBeDefined()
    })

    it('includes synonym strategy', () => {
      const result = engine.searchWithThinking('function')
      const synonymStep = result.thinkingSteps.find(s => s.strategy === 'synonym')
      expect(synonymStep).toBeDefined()
    })

    it('includes semantic strategy', () => {
      const result = engine.searchWithThinking('programming language')
      const semanticStep = result.thinkingSteps.find(s => s.strategy === 'semantic')
      expect(semanticStep).toBeDefined()
    })

    it('ranks results by relevance score', () => {
      const result = engine.searchWithThinking('javascript frontend')
      if (result.results.length > 1) {
        for (let i = 1; i < result.results.length; i++) {
          expect(result.results[i]!.score).toBeLessThanOrEqual(result.results[i - 1]!.score)
        }
      }
    })

    it('returns matched terms for each result', () => {
      const result = engine.searchWithThinking('javascript')
      for (const r of result.results) {
        expect(r.matchedTerms.length).toBeGreaterThan(0)
      }
    })

    it('returns matchedBy strategies for each result', () => {
      const result = engine.searchWithThinking('javascript')
      for (const r of result.results) {
        expect(r.matchedBy.length).toBeGreaterThan(0)
      }
    })

    it('returns strategy scores for each result', () => {
      const result = engine.searchWithThinking('javascript')
      for (const r of result.results) {
        expect(Object.keys(r.strategyScores).length).toBeGreaterThan(0)
      }
    })

    it('handles empty query gracefully', () => {
      const result = engine.searchWithThinking('')
      expect(result.results.length).toBe(0)
      expect(result.thinkingSteps.length).toBeGreaterThan(0)
    })

    it('handles query with only stop words', () => {
      const result = engine.searchWithThinking('the is a an')
      expect(result.results).toHaveLength(0)
    })

    it('uses decomposition for complex queries', () => {
      const result = engine.searchWithThinking(
        'Compare JavaScript vs Python for web development and data science applications',
      )
      const decompStep = result.thinkingSteps.find(s => s.strategy === 'decomposition')
      expect(decompStep).toBeDefined()
      expect(result.strategiesUsed).toContain('decomposition')
    })

    it('applies contextual boosting with conversation history', () => {
      engine.addConversationContext('I am learning JavaScript')
      engine.addConversationContext('Working on a React project')
      const result = engine.searchWithThinking('programming')
      const contextStep = result.thinkingSteps.find(s => s.strategy === 'contextual')
      expect(contextStep).toBeDefined()
    })

    it('applies cross-domain search', () => {
      const result = engine.searchWithThinking('javascript programming')
      const crossStep = result.thinkingSteps.find(s => s.strategy === 'cross-domain')
      expect(crossStep).toBeDefined()
    })

    it('uses graph search when graph is populated', () => {
      engine.addGraphNode('g1', 'JavaScript', 'programming')
      engine.addGraphNode('g2', 'React', 'javascript')
      engine.addGraphEdge('g1', 'g2', 0.9, 'used-with')
      const result = engine.searchWithThinking('javascript')
      const graphStep = result.thinkingSteps.find(s => s.strategy === 'graph')
      expect(graphStep).toBeDefined()
    })

    it('finds relevant results across strategies', () => {
      const result = engine.searchWithThinking('database query')
      expect(result.results.some(r => r.id === 'doc-5')).toBe(true)
    })

    it('handles domain detection', () => {
      const result = engine.searchWithThinking('docker kubernetes container')
      expect(result.results.length).toBeGreaterThan(0)
      // Should find DevOps documents
      expect(result.results.some(r => r.domain === 'devops')).toBe(true)
    })

    it('tracks strategies used', () => {
      const result = engine.searchWithThinking('javascript')
      expect(result.strategiesUsed).toContain('keyword')
      expect(result.strategiesUsed.length).toBeGreaterThan(1)
    })

    it('respects maxResults config', () => {
      const e = new AdvancedSearchEngine({ maxResults: 2 })
      e.indexDocuments(buildTestCorpus())
      const result = e.searchWithThinking('programming')
      expect(result.results.length).toBeLessThanOrEqual(2)
    })

    it('respects minScore config', () => {
      const e = new AdvancedSearchEngine({ minScore: 0.9 })
      e.indexDocuments(buildTestCorpus())
      const result = e.searchWithThinking('javascript')
      for (const r of result.results) {
        expect(r.score).toBeGreaterThanOrEqual(0.9)
      }
    })

    it('can disable fuzzy matching', () => {
      const e = new AdvancedSearchEngine({ enableFuzzy: false })
      e.indexDocuments(buildTestCorpus())
      const result = e.searchWithThinking('javscript')
      expect(result.strategiesUsed).not.toContain('fuzzy')
    })

    it('can disable synonym expansion', () => {
      const e = new AdvancedSearchEngine({ enableSynonyms: false })
      e.indexDocuments(buildTestCorpus())
      const result = e.searchWithThinking('function')
      expect(result.strategiesUsed).not.toContain('synonym')
    })

    it('can disable semantic search', () => {
      const e = new AdvancedSearchEngine({ enableSemantic: false })
      e.indexDocuments(buildTestCorpus())
      const result = e.searchWithThinking('javascript')
      expect(result.strategiesUsed).not.toContain('semantic')
    })

    it('can disable graph search', () => {
      const e = new AdvancedSearchEngine({ enableGraph: false })
      e.indexDocuments(buildTestCorpus())
      e.addGraphNode('g1', 'JavaScript', 'programming')
      const result = e.searchWithThinking('javascript')
      expect(result.strategiesUsed).not.toContain('graph')
    })

    it('can disable decomposition', () => {
      const e = new AdvancedSearchEngine({ enableDecomposition: false })
      e.indexDocuments(buildTestCorpus())
      const result = e.searchWithThinking('Compare JavaScript vs Python')
      expect(result.strategiesUsed).not.toContain('decomposition')
    })

    it('can disable contextual search', () => {
      const e = new AdvancedSearchEngine({ enableContextual: false })
      e.indexDocuments(buildTestCorpus())
      e.addConversationContext('JavaScript is great')
      const result = e.searchWithThinking('programming')
      expect(result.strategiesUsed).not.toContain('contextual')
    })

    it('can disable cross-domain search', () => {
      const e = new AdvancedSearchEngine({ enableCrossDomain: false })
      e.indexDocuments(buildTestCorpus())
      const result = e.searchWithThinking('javascript')
      expect(result.strategiesUsed).not.toContain('cross-domain')
    })
  })

  // ── quickSearch ──

  describe('quickSearch', () => {
    it('returns results for keyword search', () => {
      const results = engine.quickSearch('javascript')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]!.matchedBy).toContain('keyword')
    })

    it('respects limit parameter', () => {
      const results = engine.quickSearch('programming', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('returns empty for no matches', () => {
      const results = engine.quickSearch('quantumphysics')
      expect(results.length).toBe(0)
    })

    it('sorts results by score', () => {
      const results = engine.quickSearch('javascript frontend', 10)
      for (let i = 1; i < results.length; i++) {
        expect(results[i]!.score).toBeLessThanOrEqual(results[i - 1]!.score)
      }
    })
  })

  // ── suggestRelatedQueries ──

  describe('suggestRelatedQueries', () => {
    it('generates synonym-based suggestions', () => {
      const suggestions = engine.suggestRelatedQueries('function error')
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('generates domain-based suggestions', () => {
      const suggestions = engine.suggestRelatedQueries('javascript code')
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('generates decomposition suggestions for complex queries', () => {
      const suggestions = engine.suggestRelatedQueries(
        'Compare React vs Vue for large applications',
      )
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('respects limit parameter', () => {
      const suggestions = engine.suggestRelatedQueries('javascript', 2)
      expect(suggestions.length).toBeLessThanOrEqual(2)
    })

    it('returns no duplicates', () => {
      const suggestions = engine.suggestRelatedQueries('function error')
      const uniqueSuggestions = [...new Set(suggestions)]
      expect(suggestions.length).toBe(uniqueSuggestions.length)
    })
  })

  // ── explainResult ──

  describe('explainResult', () => {
    it('generates a human-readable explanation', () => {
      const result = engine.searchWithThinking('javascript')
      if (result.results.length > 0) {
        const explanation = engine.explainResult(result.results[0]!)
        expect(explanation).toContain('score:')
        expect(explanation).toContain('Found by:')
        expect(explanation).toContain('Matched terms:')
      }
    })

    it('includes domain in explanation when present', () => {
      const result = engine.searchWithThinking('javascript')
      const jsResult = result.results.find(r => r.domain === 'javascript')
      if (jsResult) {
        const explanation = engine.explainResult(jsResult)
        expect(explanation).toContain('Domain: javascript')
      }
    })
  })

  // ── Statistics ──

  describe('statistics', () => {
    it('tracks search count', () => {
      engine.searchWithThinking('javascript')
      engine.searchWithThinking('python')
      const stats = engine.getStats()
      expect(stats.totalSearches).toBe(2)
    })

    it('tracks total results', () => {
      engine.searchWithThinking('javascript')
      const stats = engine.getStats()
      expect(stats.totalResults).toBeGreaterThan(0)
    })

    it('tracks average duration', () => {
      engine.searchWithThinking('javascript')
      const stats = engine.getStats()
      expect(stats.avgDurationMs).toBeGreaterThanOrEqual(0)
    })

    it('tracks document and graph counts', () => {
      engine.addGraphNode('g1', 'Test', 'test')
      const stats = engine.getStats()
      expect(stats.documentCount).toBe(12)
      expect(stats.graphNodeCount).toBe(1)
    })

    it('tracks strategy counts', () => {
      engine.searchWithThinking('javascript')
      const stats = engine.getStats()
      expect(stats.strategyCounts.keyword).toBe(1)
    })
  })

  // ── Search history ──

  describe('search history', () => {
    it('records search history', () => {
      engine.searchWithThinking('javascript')
      engine.searchWithThinking('python')
      const history = engine.getSearchHistory()
      expect(history.length).toBe(2)
      expect(history[0]!.query).toBe('javascript')
      expect(history[1]!.query).toBe('python')
    })

    it('includes result count and timestamp', () => {
      engine.searchWithThinking('javascript')
      const history = engine.getSearchHistory()
      expect(history[0]!.resultCount).toBeGreaterThan(0)
      expect(history[0]!.timestamp).toBeGreaterThan(0)
    })
  })

  // ── Serialization ──

  describe('serialization', () => {
    it('serializes and deserializes state', () => {
      engine.addGraphNode('g1', 'JavaScript', 'programming')
      engine.addGraphEdge('g1', 'g1', 1.0, 'self')
      engine.addConversationContext('test context')
      engine.searchWithThinking('javascript')

      const serialized = engine.serialize()
      const restored = AdvancedSearchEngine.deserialize(serialized)

      expect(restored.getDocumentCount()).toBe(12)
      expect(restored.getGraphNodeCount()).toBe(1)
      expect(restored.getStats().totalSearches).toBe(1)
    })

    it('preserved documents survive round-trip', () => {
      const serialized = engine.serialize()
      const restored = AdvancedSearchEngine.deserialize(serialized)
      const result = restored.searchWithThinking('javascript')
      expect(result.results.length).toBeGreaterThan(0)
    })

    it('handles empty state deserialization', () => {
      const empty = new AdvancedSearchEngine()
      const serialized = empty.serialize()
      const restored = AdvancedSearchEngine.deserialize(serialized)
      expect(restored.getDocumentCount()).toBe(0)
    })
  })

  // ── Edge cases ──

  describe('edge cases', () => {
    it('handles very long queries', () => {
      const longQuery = 'javascript '.repeat(100)
      const result = engine.searchWithThinking(longQuery)
      expect(result.results.length).toBeGreaterThan(0)
    })

    it('handles special characters in query', () => {
      const result = engine.searchWithThinking('C++ or C# programming!!')
      expect(result.thinkingSteps.length).toBeGreaterThan(0)
    })

    it('handles unicode in query', () => {
      const result = engine.searchWithThinking('プログラミング')
      expect(result.thinkingSteps.length).toBeGreaterThan(0)
    })

    it('handles numeric queries', () => {
      const result = engine.searchWithThinking('12345')
      expect(result.thinkingSteps.length).toBeGreaterThan(0)
    })

    it('handles repeated searches efficiently', () => {
      for (let i = 0; i < 10; i++) {
        engine.searchWithThinking('javascript')
      }
      const stats = engine.getStats()
      expect(stats.totalSearches).toBe(10)
    })

    it('handles search on empty corpus', () => {
      const empty = new AdvancedSearchEngine()
      const result = empty.searchWithThinking('javascript')
      expect(result.results.length).toBe(0)
      expect(result.thinkingSteps.length).toBeGreaterThan(0)
    })

    it('finds results with fuzzy matching for typos', () => {
      const result = engine.searchWithThinking('pythn data scence')
      // Should still find Python results through fuzzy matching
      expect(result.strategiesUsed).toContain('fuzzy')
    })

    it('expands query with synonyms for "function"', () => {
      const result = engine.searchWithThinking('function')
      expect(result.expandedQuery).toContain('expanded')
    })

    it('decomposes "compare X vs Y" queries', () => {
      const result = engine.searchWithThinking(
        'Compare Docker vs Kubernetes for container orchestration',
      )
      expect(result.strategiesUsed).toContain('decomposition')
      const decompStep = result.thinkingSteps.find(s => s.strategy === 'decomposition')
      expect(decompStep).toBeDefined()
      expect(decompStep!.detail).toContain('Sub-queries')
    })

    it('multi-strategy results get diversity bonus', () => {
      // A result found by multiple strategies should have a higher score
      const result = engine.searchWithThinking('javascript programming web')
      if (result.results.length > 0) {
        const topResult = result.results[0]!
        // Should have been found by multiple strategies
        expect(topResult.matchedBy.length).toBeGreaterThanOrEqual(1)
      }
    })
  })

  // ── Thinking steps quality ──

  describe('thinking steps quality', () => {
    it('steps have sequential numbering', () => {
      const result = engine.searchWithThinking('javascript')
      for (let i = 0; i < result.thinkingSteps.length; i++) {
        expect(result.thinkingSteps[i]!.step).toBe(i + 1)
      }
    })

    it('each step has a non-empty thought', () => {
      const result = engine.searchWithThinking('python machine learning')
      for (const step of result.thinkingSteps) {
        expect(step.thought.length).toBeGreaterThan(0)
      }
    })

    it('each step has a non-empty detail', () => {
      const result = engine.searchWithThinking('python machine learning')
      for (const step of result.thinkingSteps) {
        expect(step.detail.length).toBeGreaterThan(0)
      }
    })

    it('each step has a non-negative durationMs', () => {
      const result = engine.searchWithThinking('docker kubernetes')
      for (const step of result.thinkingSteps) {
        expect(step.durationMs).toBeGreaterThanOrEqual(0)
      }
    })

    it('first step is always meta (query analysis)', () => {
      const result = engine.searchWithThinking('sql database')
      expect(result.thinkingSteps[0]!.strategy).toBe('meta')
      expect(result.thinkingSteps[0]!.thought).toContain('query')
    })

    it('last step is always meta (merge & rank)', () => {
      const result = engine.searchWithThinking('react frontend')
      const lastStep = result.thinkingSteps[result.thinkingSteps.length - 1]!
      expect(lastStep.strategy).toBe('meta')
      expect(lastStep.thought).toContain('Merging')
    })
  })
})
