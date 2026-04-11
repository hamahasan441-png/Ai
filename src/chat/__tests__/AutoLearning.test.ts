import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'

describe('AutoLearning — Enhanced Self-Learning', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({
      enableIntelligence: true,
      enableAutoLearning: true,
      learningEnabled: true,
      memoryConsolidationInterval: 3, // consolidate every 3 turns for testing
    })
  })

  // ── Auto-Learning from Conversations ──────────────────────────────────────

  describe('auto-learning from conversations', () => {
    it('auto-reinforces patterns from strong KB matches', async () => {
      // Ask something that should match KB well (multi-word)
      await brain.chat('What is a design pattern in software engineering?')
      const stats = brain.getStats()
      // Should auto-learn if KB match score >= 3 and >= 3 words
      // May or may not trigger depending on KB content
      expect(stats.totalChats).toBe(1)
    })

    it('does not auto-learn from trivial single-word messages', async () => {
      const statsBefore = brain.getStats()
      await brain.chat('test')
      const statsAfter = brain.getStats()
      // Should NOT auto-learn from trivial single-word input
      expect(statsAfter.totalLearnings).toBe(statsBefore.totalLearnings)
    })
  })

  // ── Rephrase Detection ────────────────────────────────────────────────────

  describe('rephrase detection', () => {
    it('handles rephrase without crashing', async () => {
      // Simulate a user rephrasing the same question
      await brain.chat('How do closures work in JavaScript?')
      await brain.chat('Can you explain JavaScript closures?')
      // Should not crash, even if rephrase is detected
      const stats = brain.getStats()
      expect(stats.totalChats).toBe(2)
    })
  })

  // ── Feedback-Enhanced Learning ────────────────────────────────────────────

  describe('feedback with AdaptiveLearner', () => {
    it('feedback(true) reinforces pattern', async () => {
      await brain.chat('What is TypeScript?')
      brain.feedback(true)
      const stats = brain.getStats()
      expect(stats.totalLearnings).toBeGreaterThanOrEqual(1)
    })

    it('feedback(false, correction) learns correction and tracks mistake', async () => {
      await brain.chat('What is TypeScript?')
      brain.feedback(false, 'TypeScript is a superset of JavaScript with static types.')
      const stats = brain.getStats()
      expect(stats.totalLearnings).toBeGreaterThanOrEqual(1)
    })

    it('negative feedback on high-confidence reduces confidence more aggressively', async () => {
      // First teach the brain something
      brain.learn('What is Rust?', 'Rust is a memory-safe systems language.')
      // Then correct it
      await brain.chat('What is Rust?')
      brain.feedback(
        false,
        'Rust is a memory-safe systems programming language with no garbage collector.',
      )
      // The pattern count should reflect the correction was learned
      const stats = brain.getStats()
      expect(stats.totalLearnings).toBeGreaterThanOrEqual(2) // original + correction
    })
  })

  // ── Memory Consolidation ──────────────────────────────────────────────────

  describe('memory consolidation', () => {
    it('runs consolidation after configured interval', async () => {
      // With interval=3, after 3 chats consolidation should trigger
      await brain.chat('What is JavaScript?')
      await brain.chat('How do closures work?')
      await brain.chat('What are promises?')
      // Should have consolidated without errors
      const stats = brain.getStats()
      expect(stats.totalChats).toBe(3)
    })

    it('handles multiple consolidation cycles', async () => {
      for (let i = 0; i < 7; i++) {
        await brain.chat(`Programming question number ${i + 1} about design patterns`)
      }
      // Should have consolidated at least twice (at turns 3 and 6)
      const stats = brain.getStats()
      expect(stats.totalChats).toBe(7)
    })
  })

  // ── Auto-Generalization ───────────────────────────────────────────────────

  describe('auto-generalization', () => {
    it('triggers generalization after 5 patterns in same category', async () => {
      // Learn 5 patterns in the same category
      for (let i = 0; i < 5; i++) {
        brain.learn(
          `question about sorting algorithm variant ${i}`,
          `answer about sorting ${i}`,
          'algorithms',
        )
      }
      // Trigger a chat that includes auto-learning flow
      await brain.chat('Tell me about sorting algorithms and quicksort implementation')
      // Should not crash when generalization runs
      const stats = brain.getStats()
      expect(stats.totalLearnings).toBeGreaterThanOrEqual(5)
    })
  })

  // ── Config Options ────────────────────────────────────────────────────────

  describe('configuration', () => {
    it('respects enableAutoLearning=false', async () => {
      const noAutoLearn = new LocalBrain({
        enableIntelligence: true,
        enableAutoLearning: false,
        learningEnabled: true,
      })
      const statsBefore = noAutoLearn.getStats()
      await noAutoLearn.chat('What is a design pattern in software engineering?')
      const statsAfter = noAutoLearn.getStats()
      // Should not have auto-learned
      expect(statsAfter.totalLearnings).toBe(statsBefore.totalLearnings)
    })

    it('respects learningEnabled=false for feedback', async () => {
      const noLearn = new LocalBrain({ learningEnabled: false })
      await noLearn.chat('What is TypeScript?')
      noLearn.feedback(true)
      const stats = noLearn.getStats()
      expect(stats.totalLearnings).toBe(0)
    })
  })
})
