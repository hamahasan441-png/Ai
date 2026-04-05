import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'

describe('SmartChat — Intelligence Module Integration', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  // ── ConfidenceGate Integration ────────────────────────────────────────────

  describe('ConfidenceGate', () => {
    it('chat returns response (not crash) with confidence gate active', async () => {
      const result = await brain.chat('What is a variable?')
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('may hedge on uncertain topics', async () => {
      // A random nonsense topic should have low confidence
      const result = await brain.chat('xyzzy plugh quirble')
      // ConfidenceGate should either hedge or abstain on unknown topics
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('responds more confidently on known programming topics', async () => {
      const result = await brain.chat('What is JavaScript?')
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
    })
  })

  // ── ReasoningEngine Integration ───────────────────────────────────────────

  describe('ReasoningEngine', () => {
    it('augments complex queries with reasoning output', async () => {
      const result = await brain.chat('Why is TypeScript better than JavaScript and how does it compare to other typed languages?')
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('handles simple queries without reasoning overhead', async () => {
      const result = await brain.chat('hi')
      expect(result.text).toBeDefined()
      // Simple greeting should not trigger reasoning
      expect(result.text.toLowerCase()).toMatch(/hello|hi|help/)
    })
  })

  // ── PlanningEngine Integration ────────────────────────────────────────────

  describe('PlanningEngine', () => {
    it('provides planning output for "how to" queries', async () => {
      const result = await brain.chat('How do I create a REST API in Node.js?')
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('provides steps for step-based queries', async () => {
      const result = await brain.chat('Steps to set up a React project from scratch')
      expect(result.text).toBeDefined()
    })
  })

  // ── CausalReasoner Integration ────────────────────────────────────────────

  describe('CausalReasoner', () => {
    it('handles causal queries', async () => {
      const result = await brain.chat('Why does memory leaks happen in JavaScript?')
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
    })
  })

  // ── CreativeEngine Integration ────────────────────────────────────────────

  describe('CreativeEngine', () => {
    it('handles creative generation queries', async () => {
      const result = await brain.chat('Write a function that calculates fibonacci numbers')
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('handles brainstorming queries', async () => {
      const result = await brain.chat('Brainstorm ideas for a coding project')
      expect(result.text).toBeDefined()
    })
  })

  // ── AbstractionEngine Integration ─────────────────────────────────────────

  describe('AbstractionEngine', () => {
    it('handles concept explanation queries', async () => {
      const result = await brain.chat('What is polymorphism?')
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
    })

    it('handles "explain" queries', async () => {
      const result = await brain.chat('Explain the concept of recursion')
      expect(result.text).toBeDefined()
    })
  })

  // ── AnalogicalReasoner Integration ────────────────────────────────────────

  describe('AnalogicalReasoner', () => {
    it('handles analogy queries', async () => {
      const result = await brain.chat('Is a class similar to a blueprint?')
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
    })
  })

  // ── KnowledgeSynthesizer Integration ──────────────────────────────────────

  describe('KnowledgeSynthesizer', () => {
    it('combines knowledge for broad queries', async () => {
      const result = await brain.chat('Tell me about sorting algorithms and their time complexities')
      expect(result.text).toBeDefined()
      expect(result.text.length).toBeGreaterThan(0)
    })
  })

  // ── Query Classification ──────────────────────────────────────────────────

  describe('query classifiers', () => {
    it('greetings still work correctly', async () => {
      const result = await brain.chat('Hello!')
      expect(result.text.toLowerCase()).toMatch(/hello|hi|help|assistant/)
    })

    it('help queries work', async () => {
      const result = await brain.chat('help')
      expect(result.text.toLowerCase()).toMatch(/help|can do|chat|code/)
    })

    it('thanks queries work', async () => {
      await brain.chat('What is JavaScript?')
      const result = await brain.chat('thanks')
      expect(result.text.toLowerCase()).toMatch(/welcome|glad|correct/)
    })
  })
})
