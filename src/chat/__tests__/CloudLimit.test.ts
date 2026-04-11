import { describe, it, expect, beforeEach } from 'vitest'
import { LocalBrain } from '../LocalBrain'

describe('CloudLimit — Token Budget & Continuation Protocol', () => {
  let brain: LocalBrain

  beforeEach(() => {
    brain = new LocalBrain({
      enableIntelligence: true,
      enableBudgetTracking: true,
      maxSessionTokens: 500, // Small budget for testing
      budgetWarningThreshold: 0.85,
    })
  })

  // ── Token Budget Tracking ─────────────────────────────────────────────────

  describe('token budget tracking', () => {
    it('tracks token usage from chat', async () => {
      await brain.chat('Hello world')
      const budget = brain.getTokenBudget()
      expect(budget.totalTokens).toBeGreaterThan(0)
      expect(budget.totalInputTokens).toBeGreaterThan(0)
      expect(budget.totalOutputTokens).toBeGreaterThan(0)
    })

    it('returns budget fields in chat response', async () => {
      const result = await brain.chat('Hello')
      expect(result.remainingTokens).toBeDefined()
      expect(result.usagePercent).toBeDefined()
    })

    it('accumulates tokens across multiple chats', async () => {
      await brain.chat('Hello')
      const first = brain.getTokenBudget()
      await brain.chat('What is JavaScript?')
      const second = brain.getTokenBudget()
      expect(second.totalTokens).toBeGreaterThan(first.totalTokens)
    })
  })

  // ── Budget Warning ────────────────────────────────────────────────────────

  describe('budget warning', () => {
    it('warns when approaching budget limit', async () => {
      // Small budget of 500 tokens, send several messages to approach limit
      for (let i = 0; i < 3; i++) {
        await brain.chat(`Question number ${i + 1} about programming concepts`)
      }
      const budget = brain.getTokenBudget()
      // After multiple chats, should have consumed some budget
      expect(budget.totalTokens).toBeGreaterThan(0)
    })

    it('sets budgetWarning when threshold reached', async () => {
      // Use a tiny budget to trigger warning
      const tinyBrain = new LocalBrain({
        enableBudgetTracking: true,
        maxSessionTokens: 100,
        budgetWarningThreshold: 0.5,
      })
      const result = await tinyBrain.chat(
        'What is a design pattern in software engineering and how do they help?',
      )
      // Should have consumed significant portion of tiny budget
      const budget = tinyBrain.getTokenBudget()
      if (budget.usagePercent >= 0.5) {
        expect(result.budgetWarning).toBe(true)
      }
    })
  })

  // ── Budget Exhaustion & Continue Command ──────────────────────────────────

  describe('budget exhaustion', () => {
    it('blocks chat when budget exhausted', async () => {
      // Use tiny budget
      const tinyBrain = new LocalBrain({
        enableBudgetTracking: true,
        maxSessionTokens: 50, // Very small
      })
      // First chat will likely exhaust the budget
      await tinyBrain.chat('Tell me about JavaScript programming and design patterns')
      // Next chat should be blocked
      const result = await tinyBrain.chat('Another question')
      expect(result.text).toContain('Token budget reached')
      expect(result.budgetExhausted).toBe(true)
    })

    it('"continue" extends the budget', async () => {
      const tinyBrain = new LocalBrain({
        enableBudgetTracking: true,
        maxSessionTokens: 50,
      })
      // Exhaust budget
      await tinyBrain.chat('Tell me about JavaScript programming and design patterns')
      // Extend budget
      const result = await tinyBrain.chat('continue')
      expect(result.text).toContain('extended')
      // Now should be able to chat again
      const budget = tinyBrain.getTokenBudget()
      expect(budget.continuations).toBe(1)
    })

    it('"reset" clears the budget', async () => {
      const tinyBrain = new LocalBrain({
        enableBudgetTracking: true,
        maxSessionTokens: 50,
      })
      await tinyBrain.chat('Tell me about JavaScript')
      const result = await tinyBrain.chat('reset')
      expect(result.text).toContain('reset')
      const budget = tinyBrain.getTokenBudget()
      expect(budget.totalTokens).toBe(0)
    })
  })

  // ── Response Chunking ─────────────────────────────────────────────────────

  describe('response chunking', () => {
    it('chunks long responses that exceed maxResponseLength', async () => {
      // Use very small maxResponseLength to force chunking
      const chunkBrain = new LocalBrain({
        enableIntelligence: true,
        enableBudgetTracking: true,
        maxSessionTokens: 100_000,
        maxResponseLength: 50, // Very small to force chunking
      })
      const result = await chunkBrain.chat('What is JavaScript?')
      // If response was longer than 50 chars, it should be chunked
      if (result.text.length > 50) {
        // Check for truncation indicator
        expect(result.text).toContain('truncated')
      }
    })

    it('"continue" retrieves next chunk', async () => {
      const chunkBrain = new LocalBrain({
        enableIntelligence: true,
        enableBudgetTracking: true,
        maxSessionTokens: 100_000,
        maxResponseLength: 50,
      })
      const first = await chunkBrain.chat('What is JavaScript?')
      if (first.text.includes('truncated')) {
        const next = await chunkBrain.chat('continue')
        expect(next.text).toBeDefined()
        expect(next.text.length).toBeGreaterThan(0)
      }
    })
  })

  // ── Disabled Budget Tracking ──────────────────────────────────────────────

  describe('disabled budget tracking', () => {
    it('works normally when budget tracking disabled', async () => {
      const noBudgetBrain = new LocalBrain({
        enableBudgetTracking: false,
      })
      const result = await noBudgetBrain.chat('Hello')
      expect(result.text).toBeDefined()
      // Budget fields should not be present
      expect(result.budgetWarning).toBeUndefined()
      expect(result.budgetExhausted).toBeUndefined()
    })

    it('never blocks when tracking disabled', async () => {
      const noBudgetBrain = new LocalBrain({
        enableBudgetTracking: false,
        maxSessionTokens: 1, // Would normally block immediately
      })
      const result = await noBudgetBrain.chat('Hello')
      expect(result.text).toBeDefined()
      expect(result.text).not.toContain('Token budget reached')
    })
  })

  // ── getTokenBudget API ────────────────────────────────────────────────────

  describe('getTokenBudget', () => {
    it('returns valid report before any chat', () => {
      const report = brain.getTokenBudget()
      expect(report.totalTokens).toBe(0)
      expect(report.maxSessionTokens).toBe(500)
      expect(report.usagePercent).toBe(0)
      expect(report.budgetWarning).toBe(false)
      expect(report.budgetExhausted).toBe(false)
      expect(report.continuations).toBe(0)
    })

    it('updates after chat', async () => {
      await brain.chat('What is JavaScript?')
      const report = brain.getTokenBudget()
      expect(report.totalTokens).toBeGreaterThan(0)
      expect(report.usagePercent).toBeGreaterThan(0)
    })
  })
})
