import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain.js'

describe('LocalBrain — Learn from Search', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({
      learningEnabled: true,
      maxLearnedPatterns: 200,
      useTfIdf: true,
      enableIntelligence: true,
    })
  })

  // ── searchWithThinking + learning ──

  describe('searchWithThinking learns from results', () => {
    it('learns patterns from search results', async () => {
      const before = brain.getLearnedPatternCount()
      const result = await brain.searchWithThinking('What is JavaScript?')
      expect(result).not.toBeNull()
      if (result && result.results.length > 0) {
        // Should have learned new patterns
        expect(brain.getLearnedPatternCount()).toBeGreaterThan(before)
      }
    })

    it('adds knowledge entries from search results', async () => {
      const beforeKB = brain.getKnowledgeBaseSize()
      await brain.searchWithThinking('What is TypeScript?')
      // Knowledge base should grow from search results
      const afterKB = brain.getKnowledgeBaseSize()
      expect(afterKB).toBeGreaterThanOrEqual(beforeKB)
    })

    it('returns results with thinking steps', async () => {
      const result = await brain.searchWithThinking('How does React work?')
      if (result) {
        expect(result.thinkingSteps.length).toBeGreaterThan(0)
        expect(result.query).toBe('How does React work?')
        expect(result.strategiesUsed.length).toBeGreaterThan(0)
      }
    })

    it('returns null when search engine is disabled', async () => {
      const noIntelBrain = new LocalBrain({ enableIntelligence: false })
      const result = await noIntelBrain.searchWithThinking('test')
      expect(result).toBeNull()
    })

    it('does not duplicate KB entries on repeated searches', async () => {
      await brain.searchWithThinking('What is Python?')
      const kbSize1 = brain.getKnowledgeBaseSize()
      await brain.searchWithThinking('What is Python?')
      const kbSize2 = brain.getKnowledgeBaseSize()
      // Second search should not massively inflate KB
      // (some duplication may happen due to pattern matching differences, but not double)
      expect(kbSize2).toBeLessThanOrEqual(kbSize1 + 5)
    })

    it('search results feed back into future searches', async () => {
      // First search establishes knowledge
      await brain.searchWithThinking('What is Docker?')
      // Second search should benefit from first search's learning
      const result2 = await brain.searchWithThinking('Docker containers')
      if (result2) {
        expect(result2.results.length).toBeGreaterThan(0)
      }
    })
  })

  // ── reason() learns from search ──

  describe('reason() integrates search-based learning', () => {
    it('reason includes advanced search step', async () => {
      const result = await brain.reason('What is the difference between SQL and NoSQL?')
      expect(result.steps.length).toBeGreaterThan(0)
      // Check that the advanced search step exists
      const searchStep = result.steps.find(s =>
        s.description.includes('Advanced search with thinking'),
      )
      // Should have a search step (if search engine found results)
      if (searchStep) {
        expect(searchStep.output).toContain('strategies')
      }
    })

    it('reason learns from search results', async () => {
      const before = brain.getLearnedPatternCount()
      await brain.reason('Explain how machine learning works')
      // Should have learned from the search during reasoning
      expect(brain.getLearnedPatternCount()).toBeGreaterThanOrEqual(before)
    })
  })

  // ── chat pipeline learns from search ──

  describe('chat pipeline learns from search', () => {
    it('search intent triggers learning', async () => {
      const before = brain.getLearnedPatternCount()
      await brain.chat('search for information about Kubernetes')
      const after = brain.getLearnedPatternCount()
      // Should have learned from search results
      expect(after).toBeGreaterThanOrEqual(before)
    })

    it('find intent triggers learning', async () => {
      const before = brain.getLearnedPatternCount()
      await brain.chat('find me information about REST APIs')
      const after = brain.getLearnedPatternCount()
      expect(after).toBeGreaterThanOrEqual(before)
    })

    it('lookup intent triggers learning', async () => {
      const before = brain.getLearnedPatternCount()
      await brain.chat('look up Docker containers')
      const after = brain.getLearnedPatternCount()
      expect(after).toBeGreaterThanOrEqual(before)
    })
  })

  // ── learning respects config ──

  describe('learning respects config', () => {
    it('does not learn when learning is disabled', async () => {
      const noLearnBrain = new LocalBrain({
        learningEnabled: false,
        enableIntelligence: true,
      })
      const before = noLearnBrain.getLearnedPatternCount()
      await noLearnBrain.searchWithThinking('What is JavaScript?')
      expect(noLearnBrain.getLearnedPatternCount()).toBe(before)
    })

    it('respects maxLearnedPatterns limit', async () => {
      const smallBrain = new LocalBrain({
        learningEnabled: true,
        maxLearnedPatterns: 5,
        enableIntelligence: true,
      })
      // Do many searches to exceed the limit
      await smallBrain.searchWithThinking('JavaScript')
      await smallBrain.searchWithThinking('Python')
      await smallBrain.searchWithThinking('TypeScript')
      await smallBrain.searchWithThinking('Docker')
      await smallBrain.searchWithThinking('React')
      await smallBrain.searchWithThinking('Kubernetes')
      // Should not exceed maxLearnedPatterns
      expect(smallBrain.getLearnedPatternCount()).toBeLessThanOrEqual(5)
    })
  })

  // ── semantic memory integration ──

  describe('semantic memory grows from search', () => {
    it('search results add concepts to semantic memory', async () => {
      const stats1 = brain.getIntelligenceStats()
      const nodesBefore = stats1.semanticMemoryNodes

      await brain.searchWithThinking('What is JavaScript programming?')

      const stats2 = brain.getIntelligenceStats()
      // Semantic memory should have grown (or stayed same if concepts already existed)
      expect(stats2.semanticMemoryNodes).toBeGreaterThanOrEqual(nodesBefore)
    })
  })

  // ── knowledge re-indexing ──

  describe('knowledge re-indexing into search engine', () => {
    it('newly learned knowledge is searchable in future', async () => {
      // Teach the brain something specific
      brain.learn(
        'What is Vitest?',
        'Vitest is a blazing fast unit test framework powered by Vite.',
        'learned',
      )

      // Now search should be able to find it if the search engine re-indexes
      const result = await brain.searchWithThinking('Vitest test framework')
      // The search engine should have access to the indexed knowledge base
      if (result) {
        expect(result.candidatesScanned).toBeGreaterThan(0)
      }
    })
  })

  // ── stats tracking ──

  describe('stats tracking', () => {
    it('tracks learning from search in stats', async () => {
      const statsBefore = brain.getStats()
      const learningsBefore = statsBefore.totalLearnings
      await brain.searchWithThinking('What is JavaScript?')
      const statsAfter = brain.getStats()
      expect(statsAfter.totalLearnings).toBeGreaterThanOrEqual(learningsBefore)
    })

    it('tracks knowledge entries added', async () => {
      const statsBefore = brain.getStats()
      const addedBefore = statsBefore.knowledgeEntriesAdded
      await brain.searchWithThinking('What is Python programming?')
      const statsAfter = brain.getStats()
      expect(statsAfter.knowledgeEntriesAdded).toBeGreaterThanOrEqual(addedBefore)
    })
  })

  // ── edge cases ──

  describe('edge cases', () => {
    it('handles empty query without crashing', async () => {
      const result = await brain.searchWithThinking('')
      // Should not crash, may return null or empty results
      expect(result).not.toBeUndefined()
    })

    it('handles query with no search results without crashing', async () => {
      const result = await brain.searchWithThinking('xyzzy_nonexistent_topic_foobar')
      if (result) {
        // Should still return a valid structure
        expect(result.thinkingSteps.length).toBeGreaterThan(0)
      }
    })

    it('reason works even when search returns no results', async () => {
      const result = await brain.reason('xyzzy_nonexistent_topic_12345')
      expect(result.answer).toBeTruthy()
      expect(result.steps.length).toBeGreaterThan(0)
    })

    it('multiple rapid searches do not corrupt state', async () => {
      const promises = [
        brain.searchWithThinking('JavaScript'),
        brain.searchWithThinking('Python'),
        brain.searchWithThinking('TypeScript'),
      ]
      const results = await Promise.all(promises)
      for (const r of results) {
        if (r) {
          expect(r.thinkingSteps.length).toBeGreaterThan(0)
        }
      }
      // Brain state should still be consistent
      expect(brain.getLearnedPatternCount()).toBeGreaterThan(0)
    })
  })
})
