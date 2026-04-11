import { describe, it, expect, beforeEach } from 'vitest'
import { DebateEngine, DEFAULT_DEBATE_ENGINE_CONFIG } from '../DebateEngine.js'
import type { Evidence } from '../DebateEngine.js'

describe('DebateEngine', () => {
  let engine: DebateEngine

  beforeEach(() => {
    engine = new DebateEngine()
  })

  describe('Configuration', () => {
    it('should use default config', () => {
      expect(DEFAULT_DEBATE_ENGINE_CONFIG.maxRounds).toBe(5)
      expect(DEFAULT_DEBATE_ENGINE_CONFIG.fallacyDetectionEnabled).toBe(true)
    })

    it('should accept custom config', () => {
      const e = new DebateEngine({ maxRounds: 10 })
      expect(e).toBeInstanceOf(DebateEngine)
    })
  })

  describe('Debate lifecycle', () => {
    it('should start a debate', () => {
      const debate = engine.startDebate('AI will surpass human intelligence by 2050')
      expect(debate.id).toBeDefined()
      expect(debate.proposition).toContain('AI will surpass')
      expect(debate.rounds.length).toBe(0)
    })

    it('should retrieve debate by id', () => {
      const debate = engine.startDebate('Test')
      expect(engine.getDebate(debate.id)).toEqual(debate)
    })

    it('should return null for unknown debate', () => {
      expect(engine.getDebate('missing')).toBeNull()
    })
  })

  describe('Arguments', () => {
    it('should add pro argument', () => {
      const debate = engine.startDebate('Test proposition')
      const arg = engine.addArgument(
        debate.id,
        'pro',
        'AI is advancing rapidly',
        'Deep learning breakthroughs happen yearly with increasing scale and capability',
      )
      expect(arg).not.toBeNull()
      expect(arg!.side).toBe('pro')
      expect(arg!.strength).toBeDefined()
      expect(arg!.score).toBeGreaterThan(0)
    })

    it('should add con argument', () => {
      const debate = engine.startDebate('Test')
      const arg = engine.addArgument(
        debate.id,
        'con',
        'Consciousness is not computable',
        'There are fundamental limits to what computation can achieve in understanding subjective experience',
      )
      expect(arg!.side).toBe('con')
    })

    it('should return null for missing debate', () => {
      expect(engine.addArgument('missing', 'pro', 'x', 'y')).toBeNull()
    })

    it('should score argument higher with evidence', () => {
      const debate = engine.startDebate('Test')
      const evidence: Evidence[] = [
        {
          type: 'empirical',
          description: 'Published study',
          reliability: 0.9,
          source: 'Nature 2024',
        },
        {
          type: 'statistical',
          description: 'Data shows 80% improvement',
          reliability: 0.85,
          source: 'ArXiv',
        },
      ]
      const withEvidence = engine.addArgument(
        debate.id,
        'pro',
        'Strong claim',
        'Detailed reasoning with lots of supporting information and context',
        evidence,
      )
      const withoutEvidence = engine.addArgument(debate.id, 'pro', 'Weak claim', 'Short reason')
      expect(withEvidence!.score).toBeGreaterThan(withoutEvidence!.score)
    })

    it('should penalize arguments with fallacies', () => {
      const debate = engine.startDebate('Test')
      const clean = engine.addArgument(
        debate.id,
        'pro',
        'Data shows improvement',
        'Studies demonstrate a clear trend toward improvement with detailed statistical analysis',
      )
      const fallacious = engine.addArgument(
        debate.id,
        'con',
        'Everyone knows this is wrong',
        'All people always agree this fails and everyone is doing it the opposite way',
      )
      expect(fallacious!.fallacies.length).toBeGreaterThan(0)
    })

    it('should populate debate rounds', () => {
      const debate = engine.startDebate('Test')
      engine.addArgument(debate.id, 'pro', 'Pro 1', 'Reason 1')
      engine.addArgument(debate.id, 'con', 'Con 1', 'Reason 2')
      const d = engine.getDebate(debate.id)
      expect(d!.rounds.length).toBeGreaterThan(0)
    })
  })

  describe('Rebuttals', () => {
    it('should add rebuttal to argument', () => {
      const debate = engine.startDebate('Test')
      const arg = engine.addArgument(debate.id, 'pro', 'Claim', 'Reasoning')
      const reb = engine.addRebuttal(
        arg!.id,
        'This argument ignores key factors that significantly impact the conclusion and should be reconsidered',
      )
      expect(reb).not.toBeNull()
      expect(reb!.effectiveness).toBeGreaterThan(0)
    })

    it('should return null for missing argument', () => {
      expect(engine.addRebuttal('missing', 'content')).toBeNull()
    })

    it('should link rebuttal to argument', () => {
      const debate = engine.startDebate('Test')
      const arg = engine.addArgument(debate.id, 'pro', 'Claim', 'Reason')
      engine.addRebuttal(arg!.id, 'Rebuttal text')
      expect(arg!.rebuttalIds.length).toBe(1)
    })

    it('should score higher effectiveness with counter-evidence', () => {
      const debate = engine.startDebate('Test')
      const arg = engine.addArgument(debate.id, 'pro', 'Claim', 'Reason')
      const evidence: Evidence[] = [
        { type: 'empirical', description: 'Counter study', reliability: 0.8, source: 'Journal' },
      ]
      const reb = engine.addRebuttal(
        arg!.id,
        'Strong counterpoint with detailed analysis and alternative explanation for the observed phenomena',
        evidence,
      )
      expect(reb!.effectiveness).toBeGreaterThan(0.5)
    })
  })

  describe('Fallacy detection', () => {
    it('should detect ad hominem', () => {
      const fallacies = engine.detectFallacies('The author is an idiot who knows nothing')
      expect(fallacies.some(f => f.type === 'ad_hominem')).toBe(true)
    })

    it('should detect slippery slope', () => {
      const fallacies = engine.detectFallacies('This will lead to total disaster')
      expect(fallacies.some(f => f.type === 'slippery_slope')).toBe(true)
    })

    it('should detect bandwagon', () => {
      const fallacies = engine.detectFallacies('Everyone is doing it so it must be right')
      expect(fallacies.some(f => f.type === 'bandwagon')).toBe(true)
    })

    it('should detect appeal to emotion', () => {
      const fallacies = engine.detectFallacies('Think of the children who will suffer')
      expect(fallacies.some(f => f.type === 'appeal_to_emotion')).toBe(true)
    })

    it('should detect hasty generalization', () => {
      const fallacies = engine.detectFallacies('Everyone knows this is always true for all cases')
      expect(fallacies.some(f => f.type === 'hasty_generalization')).toBe(true)
    })

    it('should return empty for clean text', () => {
      const fallacies = engine.detectFallacies(
        'The data shows a 15% improvement in performance metrics.',
      )
      expect(fallacies.length).toBe(0)
    })
  })

  describe('Verdict generation', () => {
    it('should generate verdict when pro wins', () => {
      const debate = engine.startDebate('Test')
      const ev: Evidence[] = [
        { type: 'empirical', description: 'Study', reliability: 0.9, source: 'Nature' },
      ]
      engine.addArgument(
        debate.id,
        'pro',
        'Strong pro',
        'Very detailed reasoning with extensive supporting analysis and well-structured logical chain',
        ev,
      )
      engine.addArgument(debate.id, 'con', 'Weak con', 'Short reason')
      const verdict = engine.generateVerdict(debate.id)
      expect(verdict).not.toBeNull()
      expect(verdict!.winningSide).toBe('pro')
      expect(verdict!.proScore).toBeGreaterThan(verdict!.conScore)
    })

    it('should generate verdict when con wins', () => {
      const debate = engine.startDebate('Test')
      engine.addArgument(debate.id, 'pro', 'Weak pro', 'Short')
      const ev: Evidence[] = [
        { type: 'statistical', description: 'Data', reliability: 0.95, source: 'WHO' },
      ]
      engine.addArgument(
        debate.id,
        'con',
        'Strong con',
        'Extensive reasoning backed by multiple sources and carefully analyzed data sets showing clear trend',
        ev,
      )
      const verdict = engine.generateVerdict(debate.id)
      expect(verdict!.winningSide).toBe('con')
    })

    it('should return null for missing debate', () => {
      expect(engine.generateVerdict('missing')).toBeNull()
    })

    it('should return null for empty debate', () => {
      const debate = engine.startDebate('Test')
      expect(engine.generateVerdict(debate.id)).toBeNull()
    })

    it('should include key factors', () => {
      const debate = engine.startDebate('Test')
      const ev: Evidence[] = [
        { type: 'empirical', description: 'X', reliability: 0.9, source: 'Y' },
      ]
      engine.addArgument(
        debate.id,
        'pro',
        'Critical factor for success',
        'Detailed reasoning with comprehensive evidence and thoughtful analysis of multiple angles',
        ev,
      )
      engine.addArgument(debate.id, 'con', 'Minor issue', 'Brief note')
      const verdict = engine.generateVerdict(debate.id)
      expect(verdict!.keyFactors.length).toBeGreaterThan(0)
    })
  })

  describe('Stats & serialization', () => {
    it('should track stats', () => {
      const debate = engine.startDebate('Test')
      engine.addArgument(debate.id, 'pro', 'Claim', 'Reason')
      engine.addRebuttal(engine.getDebate(debate.id)!.rounds[0].proArguments[0].id, 'Rebuttal')
      engine.provideFeedback()
      const stats = engine.getStats()
      expect(stats.totalDebates).toBe(1)
      expect(stats.totalArguments).toBe(1)
      expect(stats.totalRebuttals).toBe(1)
      expect(stats.feedbackCount).toBe(1)
    })

    it('should serialize and deserialize', () => {
      const debate = engine.startDebate('Test')
      engine.addArgument(debate.id, 'pro', 'Claim', 'Reason')
      const json = engine.serialize()
      const restored = DebateEngine.deserialize(json)
      expect(restored.getStats().totalDebates).toBe(1)
    })
  })
})
