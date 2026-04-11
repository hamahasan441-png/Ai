import { describe, it, expect, beforeEach } from 'vitest'
import { TokenBudgetManager, DEFAULT_BUDGET_CONFIG } from '../TokenBudgetManager'
import type { TokenBudgetConfig } from '../TokenBudgetManager'

describe('TokenBudgetManager', () => {
  let manager: TokenBudgetManager

  beforeEach(() => {
    manager = new TokenBudgetManager()
  })

  // ── Constructor & Defaults ─────────────────────────────────────────────────

  describe('constructor', () => {
    it('uses default config when none provided', () => {
      const report = manager.getReport()
      expect(report.maxSessionTokens).toBe(80_000)
      expect(report.totalTokens).toBe(0)
      expect(report.continuations).toBe(0)
    })

    it('accepts partial config overrides', () => {
      const custom = new TokenBudgetManager({ maxSessionTokens: 50_000, warningThreshold: 0.9 })
      const report = custom.getReport()
      expect(report.maxSessionTokens).toBe(50_000)
    })

    it('accepts full config', () => {
      const cfg: TokenBudgetConfig = {
        maxSessionTokens: 10_000,
        warningThreshold: 0.7,
        enabled: true,
      }
      const m = new TokenBudgetManager(cfg)
      expect(m.getReport().maxSessionTokens).toBe(10_000)
    })
  })

  // ── DEFAULT_BUDGET_CONFIG ──────────────────────────────────────────────────

  describe('DEFAULT_BUDGET_CONFIG', () => {
    it('has expected defaults', () => {
      expect(DEFAULT_BUDGET_CONFIG.maxSessionTokens).toBe(80_000)
      expect(DEFAULT_BUDGET_CONFIG.warningThreshold).toBe(0.85)
      expect(DEFAULT_BUDGET_CONFIG.enabled).toBe(true)
    })
  })

  // ── Token Tracking ─────────────────────────────────────────────────────────

  describe('trackUsage', () => {
    it('accumulates input and output tokens', () => {
      manager.trackUsage({ inputTokens: 100, outputTokens: 200 })
      expect(manager.totalTokens).toBe(300)

      manager.trackUsage({ inputTokens: 50, outputTokens: 150 })
      expect(manager.totalTokens).toBe(500)
    })

    it('reports correct breakdown', () => {
      manager.trackUsage({ inputTokens: 1000, outputTokens: 2000 })
      const report = manager.getReport()
      expect(report.totalInputTokens).toBe(1000)
      expect(report.totalOutputTokens).toBe(2000)
      expect(report.totalTokens).toBe(3000)
    })
  })

  // ── Budget Queries ─────────────────────────────────────────────────────────

  describe('budget queries', () => {
    it('calculates remaining tokens', () => {
      manager.trackUsage({ inputTokens: 30_000, outputTokens: 20_000 })
      expect(manager.remainingTokens).toBe(30_000)
    })

    it('remaining never goes below zero', () => {
      manager.trackUsage({ inputTokens: 50_000, outputTokens: 50_000 })
      expect(manager.remainingTokens).toBe(0)
    })

    it('calculates usage percent', () => {
      manager.trackUsage({ inputTokens: 40_000, outputTokens: 0 })
      expect(manager.usagePercent).toBe(0.5)
    })

    it('enabled property reflects config', () => {
      expect(manager.enabled).toBe(true)
      const disabled = new TokenBudgetManager({ enabled: false })
      expect(disabled.enabled).toBe(false)
    })
  })

  // ── Warning & Exhaustion Detection ─────────────────────────────────────────

  describe('warning and exhaustion', () => {
    it('isWarning is false below threshold', () => {
      manager.trackUsage({ inputTokens: 30_000, outputTokens: 0 })
      expect(manager.isWarning).toBe(false)
    })

    it('isWarning is true at threshold', () => {
      // 85% of 80000 = 68000
      manager.trackUsage({ inputTokens: 68_000, outputTokens: 0 })
      expect(manager.isWarning).toBe(true)
    })

    it('isExhausted is false below budget', () => {
      manager.trackUsage({ inputTokens: 79_000, outputTokens: 0 })
      expect(manager.isExhausted).toBe(false)
    })

    it('isExhausted is true at budget', () => {
      manager.trackUsage({ inputTokens: 80_000, outputTokens: 0 })
      expect(manager.isExhausted).toBe(true)
    })

    it('isExhausted is true over budget', () => {
      manager.trackUsage({ inputTokens: 90_000, outputTokens: 0 })
      expect(manager.isExhausted).toBe(true)
    })
  })

  // ── canContinue ────────────────────────────────────────────────────────────

  describe('canContinue', () => {
    it('returns true when under budget', () => {
      manager.trackUsage({ inputTokens: 50_000, outputTokens: 0 })
      expect(manager.canContinue()).toBe(true)
    })

    it('returns false when budget exhausted', () => {
      manager.trackUsage({ inputTokens: 80_000, outputTokens: 0 })
      expect(manager.canContinue()).toBe(false)
    })

    it('always returns true when disabled', () => {
      const disabled = new TokenBudgetManager({ enabled: false })
      disabled.trackUsage({ inputTokens: 999_999, outputTokens: 0 })
      expect(disabled.canContinue()).toBe(true)
    })
  })

  // ── Budget Report ──────────────────────────────────────────────────────────

  describe('getReport', () => {
    it('returns full report', () => {
      manager.trackUsage({ inputTokens: 70_000, outputTokens: 0 })
      const report = manager.getReport()

      expect(report.totalInputTokens).toBe(70_000)
      expect(report.totalOutputTokens).toBe(0)
      expect(report.totalTokens).toBe(70_000)
      expect(report.maxSessionTokens).toBe(80_000)
      expect(report.remainingTokens).toBe(10_000)
      expect(report.usagePercent).toBeCloseTo(0.875, 3)
      expect(report.budgetWarning).toBe(true)
      expect(report.budgetExhausted).toBe(false)
      expect(report.continuations).toBe(0)
    })

    it('caps usagePercent at 1.0 in report', () => {
      manager.trackUsage({ inputTokens: 100_000, outputTokens: 0 })
      expect(manager.getReport().usagePercent).toBe(1)
    })
  })

  // ── Continuation Protocol ──────────────────────────────────────────────────

  describe('extendBudget', () => {
    it('extends budget by maxSessionTokens', () => {
      manager.trackUsage({ inputTokens: 80_000, outputTokens: 0 })
      expect(manager.isExhausted).toBe(true)

      manager.extendBudget()
      expect(manager.isExhausted).toBe(false)
      expect(manager.remainingTokens).toBe(80_000)
      expect(manager.getReport().continuations).toBe(1)
    })

    it('tracks multiple continuations', () => {
      manager.extendBudget()
      manager.extendBudget()
      manager.extendBudget()
      expect(manager.getReport().continuations).toBe(3)
      expect(manager.getReport().maxSessionTokens).toBe(80_000 * 4)
    })
  })

  describe('reset', () => {
    it('resets all counters', () => {
      manager.trackUsage({ inputTokens: 50_000, outputTokens: 30_000 })
      manager.extendBudget()
      manager.reset()

      const report = manager.getReport()
      expect(report.totalTokens).toBe(0)
      expect(report.continuations).toBe(0)
      expect(report.maxSessionTokens).toBe(80_000)
    })
  })

  // ── Budget Messages ────────────────────────────────────────────────────────

  describe('getBudgetMessage', () => {
    it('returns null when no warning needed', () => {
      manager.trackUsage({ inputTokens: 10_000, outputTokens: 0 })
      expect(manager.getBudgetMessage()).toBeNull()
    })

    it('returns warning message at threshold', () => {
      manager.trackUsage({ inputTokens: 68_000, outputTokens: 0 })
      const msg = manager.getBudgetMessage()
      expect(msg).toContain('⚠️')
      expect(msg).toContain('Token budget at 85%')
      expect(msg).toContain('continue')
    })

    it('returns exhaustion message at limit', () => {
      manager.trackUsage({ inputTokens: 80_000, outputTokens: 0 })
      const msg = manager.getBudgetMessage()
      expect(msg).toContain('🛑')
      expect(msg).toContain('Token budget reached')
    })

    it('returns null when disabled', () => {
      const disabled = new TokenBudgetManager({ enabled: false })
      disabled.trackUsage({ inputTokens: 999_999, outputTokens: 0 })
      expect(disabled.getBudgetMessage()).toBeNull()
    })
  })

  // ── Response Chunking ──────────────────────────────────────────────────────

  describe('chunkResponse', () => {
    it('returns short responses as-is', () => {
      const text = 'Hello, how can I help?'
      expect(manager.chunkResponse(text, 1000)).toBe(text)
      expect(manager.hasPendingChunks()).toBe(false)
    })

    it('splits long responses at paragraph boundaries', () => {
      const para1 = 'First paragraph about something important.'
      const para2 = 'Second paragraph with more details and info.'
      const text = `${para1}\n\n${para2}`
      const chunk = manager.chunkResponse(text, para1.length + 10)

      expect(chunk).toContain(para1)
      expect(chunk).toContain('truncated')
      expect(manager.hasPendingChunks()).toBe(true)
    })

    it('getNextChunk returns remaining content', () => {
      const parts = ['Part one.', 'Part two.', 'Part three.']
      const text = parts.join('\n\n')
      manager.chunkResponse(text, 15)

      const chunks: string[] = []
      let next = manager.getNextChunk()
      while (next) {
        chunks.push(next)
        next = manager.getNextChunk()
      }
      expect(chunks.length).toBeGreaterThan(0)
      expect(manager.hasPendingChunks()).toBe(false)
    })

    it('getNextChunk returns null when no pending', () => {
      expect(manager.getNextChunk()).toBeNull()
    })
  })

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles zero budget gracefully', () => {
      const m = new TokenBudgetManager({ maxSessionTokens: 0 })
      expect(m.usagePercent).toBe(1)
      expect(m.isExhausted).toBe(true)
      expect(m.canContinue()).toBe(false)
    })

    it('handles zero token usage', () => {
      expect(manager.totalTokens).toBe(0)
      expect(manager.usagePercent).toBe(0)
      expect(manager.isWarning).toBe(false)
      expect(manager.isExhausted).toBe(false)
    })

    it('extends from exhausted state', () => {
      const m = new TokenBudgetManager({ maxSessionTokens: 100 })
      m.trackUsage({ inputTokens: 100, outputTokens: 0 })
      expect(m.canContinue()).toBe(false)
      m.extendBudget()
      expect(m.canContinue()).toBe(true)
      expect(m.remainingTokens).toBe(100)
    })

    it('custom warning threshold', () => {
      const m = new TokenBudgetManager({ maxSessionTokens: 1000, warningThreshold: 0.5 })
      m.trackUsage({ inputTokens: 500, outputTokens: 0 })
      expect(m.isWarning).toBe(true)
    })
  })
})
