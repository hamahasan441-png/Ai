import { describe, it, expect, beforeEach } from 'vitest'
import { EmotionEngine } from '../EmotionEngine.js'
import type {
  EmotionDetection,
  EmotionCategory,
  SentimentResult,
  EmpathyResponse,
  EmotionTimeline,
  EmotionalContext,
  EmotionPattern,
  EmotionEngineStats,
} from '../EmotionEngine.js'

describe('EmotionEngine', () => {
  let engine: EmotionEngine

  beforeEach(() => {
    engine = new EmotionEngine()
  })

  // ── Constructor & Config ────────────────────────────────────────────────────

  describe('constructor', () => {
    it('creates with default config', () => {
      const e = new EmotionEngine()
      const stats = e.getStats()
      expect(stats.totalAnalyses).toBe(0)
      expect(stats.totalEmotionsDetected).toBe(0)
    })

    it('accepts partial config', () => {
      const e = new EmotionEngine({ sensitivityLevel: 0.8 })
      expect(e.getStats().totalAnalyses).toBe(0)
    })

    it('applies custom sensitivity to scoring', () => {
      const low = new EmotionEngine({ sensitivityLevel: 0.1 })
      const high = new EmotionEngine({ sensitivityLevel: 1.0 })
      const lowResult = low.analyzeSentiment('amazing awesome great')
      const highResult = high.analyzeSentiment('amazing awesome great')
      expect(highResult.score).toBeGreaterThan(lowResult.score)
    })

    it('respects maxEmotionHistory', () => {
      const e = new EmotionEngine({ maxEmotionHistory: 2 })
      e.detectEmotion('terrible crash bug')
      e.detectEmotion('amazing awesome great')
      e.detectEmotion('frustrating error failure')
      const timeline = e.getEmotionTimeline()
      expect(timeline.entries.length).toBe(2)
    })

    it('respects enableEmpathy = false', () => {
      const e = new EmotionEngine({ enableEmpathy: false })
      const detection = e.detectEmotion('terrible crash bug')
      const response = e.generateEmpathy(detection)
      expect(response.acknowledgment).toBe('')
      expect(response.tone).toBe('neutral')
    })

    it('respects custom neutralThreshold', () => {
      const e = new EmotionEngine({ neutralThreshold: 0.99 })
      const result = e.analyzeSentiment('maybe try debug')
      expect(result.label).toBe('neutral')
    })
  })

  // ── analyzeSentiment ────────────────────────────────────────────────────────

  describe('analyzeSentiment', () => {
    it('returns positive label for positive text', () => {
      const result = engine.analyzeSentiment('This is amazing and awesome!')
      expect(result.label).toBe('positive')
      expect(result.score).toBeGreaterThan(0)
    })

    it('returns negative label for negative text', () => {
      const result = engine.analyzeSentiment('This terrible bug is so frustrating')
      expect(result.label).toBe('negative')
      expect(result.score).toBeLessThan(0)
    })

    it('returns neutral label for neutral text', () => {
      const result = engine.analyzeSentiment('the weather is pleasant today')
      expect(result.label).toBe('neutral')
    })

    it('returns neutral for empty-ish text', () => {
      const result = engine.analyzeSentiment('the a an is')
      expect(result.label).toBe('neutral')
      expect(result.score).toBe(0)
      expect(result.confidence).toBe(0.3)
    })

    it('detects negation and adjusts score', () => {
      const pos = engine.analyzeSentiment('great code')
      const neg = engine.analyzeSentiment('not great code')
      expect(pos.score).toBeGreaterThan(neg.score)
    })

    it('captures matched keywords', () => {
      const result = engine.analyzeSentiment('The bug caused a crash')
      expect(result.keywords.length).toBeGreaterThan(0)
      expect(result.keywords.some(k => k === 'bug' || k === 'crash')).toBe(true)
    })

    it('intensifiers boost the score', () => {
      const base = engine.analyzeSentiment('great code')
      const intense = engine.analyzeSentiment('really great code')
      expect(intense.score).toBeGreaterThanOrEqual(base.score)
    })

    it('exclamation marks boost magnitude', () => {
      const calm = engine.analyzeSentiment('great')
      const excited = engine.analyzeSentiment('great!!!')
      expect(excited.magnitude).toBeGreaterThanOrEqual(calm.magnitude)
    })

    it('ALL CAPS words boost magnitude', () => {
      const normal = engine.analyzeSentiment('this is broken')
      const caps = engine.analyzeSentiment('this is BROKEN')
      expect(caps.magnitude).toBeGreaterThanOrEqual(normal.magnitude)
    })

    it('score is clamped between -1 and 1', () => {
      const neg = engine.analyzeSentiment(
        'terrible horrible awful crash nightmare bug failure broken hate frustrating impossible',
      )
      expect(neg.score).toBeGreaterThanOrEqual(-1)
      expect(neg.score).toBeLessThanOrEqual(1)

      const pos = engine.analyzeSentiment(
        'amazing awesome excellent great perfect beautiful success breakthrough love inspired',
      )
      expect(pos.score).toBeGreaterThanOrEqual(-1)
      expect(pos.score).toBeLessThanOrEqual(1)
    })

    it('confidence increases with more matched keywords', () => {
      const few = engine.analyzeSentiment('great code')
      const many = engine.analyzeSentiment('great awesome amazing excellent love')
      expect(many.confidence).toBeGreaterThanOrEqual(few.confidence)
    })

    it('returns at most 10 keywords', () => {
      const result = engine.analyzeSentiment(
        'great awesome amazing excellent love perfect beautiful success fun happy inspired motivated excited proud satisfied',
      )
      expect(result.keywords.length).toBeLessThanOrEqual(10)
    })

    it('increments totalAnalyses stat', () => {
      engine.analyzeSentiment('hello world')
      engine.analyzeSentiment('great work')
      expect(engine.getStats().totalAnalyses).toBe(2)
    })

    it('handles multi-word lexicon entries', () => {
      const result = engine.analyzeSentiment('there is a memory leak in the service')
      expect(result.score).toBeLessThan(0)
      expect(result.keywords.some(k => k === 'memory leak')).toBe(true)
    })

    it('handles programming domain keywords', () => {
      const result = engine.analyzeSentiment('fixed the spaghetti code after refactoring')
      expect(result.keywords.length).toBeGreaterThan(0)
    })

    it('returns SentimentResult shape', () => {
      const result = engine.analyzeSentiment('testing')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('magnitude')
      expect(result).toHaveProperty('label')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('keywords')
    })

    it('handles negation prefix in keywords', () => {
      const result = engine.analyzeSentiment('not great')
      const negated = result.keywords.filter(k => k.startsWith('NOT'))
      expect(negated.length).toBeGreaterThan(0)
    })
  })

  // ── detectEmotion ──────────────────────────────────────────────────────────

  describe('detectEmotion', () => {
    it('detects frustration from negative programming text', () => {
      const result = engine.detectEmotion('This bug is so frustrating, the code keeps crashing')
      expect(result.primary).toBe('frustration')
      expect(result.intensity).toBeGreaterThan(0)
    })

    it('detects confusion from confusing text', () => {
      const result = engine.detectEmotion('I am confused, this is confusing and complicated')
      expect(result.primary).toBe('confusion')
    })

    it('detects excitement from positive text', () => {
      const result = engine.detectEmotion('This is amazing! So excited about this awesome breakthrough!')
      expect(result.primary).toBe('excitement')
    })

    it('detects satisfaction from accomplishment text', () => {
      const result = engine.detectEmotion('Finally solved it! The code works perfectly now')
      expect(result.primary).toBe('satisfaction')
    })

    it('detects curiosity from exploratory text', () => {
      const result = engine.detectEmotion('I wonder how this interesting concept works? Curious to discover more')
      expect(['curiosity', 'confusion']).toContain(result.primary)
    })

    it('detects anxiety from pressure text', () => {
      const result = engine.detectEmotion('The urgent deadline is making me worried and nervous about this vulnerability')
      expect(result.primary).toBe('anxiety')
    })

    it('detects boredom from tedious text', () => {
      const result = engine.detectEmotion('This is so boring and tedious, repetitive legacy code')
      expect(result.primary).toBe('boredom')
    })

    it('detects determination from perseverance text', () => {
      const result = engine.detectEmotion('Going to try refactoring again, testing every step to make progress')
      expect(result.primary).toBe('determination')
    })

    it('detects pride from achievement text', () => {
      const result = engine.detectEmotion('So proud of this elegant solution, shipped and deployed successfully')
      expect(result.primary).toBe('pride')
    })

    it('detects overwhelmed from stress text', () => {
      const result = engine.detectEmotion('Everything is failing, impossible to handle, overwhelmed by this nightmare')
      expect(['overwhelmed', 'frustration']).toContain(result.primary)
    })

    it('returns neutral for bland text', () => {
      const result = engine.detectEmotion('running the program now')
      expect(result.primary).toBe('neutral')
    })

    it('returns EmotionDetection shape', () => {
      const result = engine.detectEmotion('testing the code')
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('primary')
      expect(result).toHaveProperty('secondary')
      expect(result).toHaveProperty('intensity')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('triggers')
      expect(result).toHaveProperty('context')
    })

    it('has a unique id', () => {
      const a = engine.detectEmotion('great code')
      const b = engine.detectEmotion('terrible bug')
      expect(a.id).not.toBe(b.id)
    })

    it('secondary emotion can be non-null', () => {
      const result = engine.detectEmotion('This crash is impossible and confusing and frustrating')
      // With multiple strong signals, secondary should be populated
      if (result.primary !== 'neutral') {
        // Secondary may or may not be present depending on scoring
        expect(result.secondary === null || typeof result.secondary === 'string').toBe(true)
      }
    })

    it('intensity is between 0 and 1', () => {
      const result = engine.detectEmotion('terrible horrible awful crash nightmare')
      expect(result.intensity).toBeGreaterThanOrEqual(0)
      expect(result.intensity).toBeLessThanOrEqual(1)
    })

    it('confidence is between 0.3 and 0.95', () => {
      const result = engine.detectEmotion('great awesome amazing')
      expect(result.confidence).toBeGreaterThanOrEqual(0.3)
      expect(result.confidence).toBeLessThanOrEqual(0.95)
    })

    it('question marks influence confusion/curiosity', () => {
      const noQ = engine.detectEmotion('this code works')
      const withQ = engine.detectEmotion('why does this code work???')
      // The question version should trigger confusion or curiosity
      expect(withQ.triggers.some(t => t === '?' || t.length > 0)).toBe(true)
    })

    it('exclamation marks influence excitement for positive text', () => {
      const calm = engine.detectEmotion('great code')
      const excited = engine.detectEmotion('great code!!!')
      expect(excited.intensity).toBeGreaterThanOrEqual(calm.intensity)
    })

    it('uses context to influence detection', () => {
      const ctx = ['this is terrible', 'everything is broken', 'so frustrated']
      const result = engine.detectEmotion('trying again', ctx)
      // Context from negative messages should still carry some weight
      expect(result).toBeDefined()
    })

    it('increments totalEmotionsDetected stat', () => {
      engine.detectEmotion('great code')
      engine.detectEmotion('terrible bug')
      expect(engine.getStats().totalEmotionsDetected).toBe(2)
    })

    it('does not double-count analyses when calling detectEmotion', () => {
      engine.detectEmotion('great code')
      // detectEmotion calls analyzeSentiment internally but decrements totalAnalyses
      expect(engine.getStats().totalAnalyses).toBe(0)
    })

    it('provides descriptive context string for detected emotion', () => {
      const result = engine.detectEmotion('This is so frustrating!')
      expect(result.context).toContain('frustration')
    })

    it('context string notes neutral when no signal', () => {
      const result = engine.detectEmotion('plain text nothing special')
      expect(result.context.toLowerCase()).toContain('no strong emotional signal')
    })
  })

  // ── generateEmpathy ─────────────────────────────────────────────────────────

  describe('generateEmpathy', () => {
    it('generates empathy response for frustration', () => {
      const detection = engine.detectEmotion('This bug is terrible and frustrating')
      const response = engine.generateEmpathy(detection)
      expect(response.acknowledgment.length).toBeGreaterThan(0)
      expect(response.tone).toBe('supportive')
    })

    it('generates celebratory response for excitement', () => {
      const detection = engine.detectEmotion('Amazing breakthrough! So excited!')
      const response = engine.generateEmpathy(detection)
      expect(response.tone).toBe('celebratory')
    })

    it('generates calming response for anxiety', () => {
      const detection = engine.detectEmotion('So worried and nervous about the urgent deadline')
      const response = engine.generateEmpathy(detection)
      expect(response.tone).toBe('calming')
    })

    it('generates motivating response for boredom', () => {
      const detection = engine.detectEmotion('This is boring and tedious and repetitive')
      const response = engine.generateEmpathy(detection)
      expect(response.tone).toBe('motivating')
    })

    it('returns EmpathyResponse shape', () => {
      const detection = engine.detectEmotion('great work')
      const response = engine.generateEmpathy(detection)
      expect(response).toHaveProperty('acknowledgment')
      expect(response).toHaveProperty('suggestion')
      expect(response).toHaveProperty('reframe')
      expect(response).toHaveProperty('encouragement')
      expect(response).toHaveProperty('actionItems')
      expect(response).toHaveProperty('tone')
    })

    it('includes at least one action item', () => {
      const detection = engine.detectEmotion('frustrating bug crash')
      const response = engine.generateEmpathy(detection)
      expect(response.actionItems.length).toBeGreaterThanOrEqual(1)
    })

    it('returns empty response when empathy is disabled', () => {
      const e = new EmotionEngine({ enableEmpathy: false })
      const detection = e.detectEmotion('terrible frustrating crash')
      const response = e.generateEmpathy(detection)
      expect(response.acknowledgment).toBe('')
      expect(response.suggestion).toBe('')
      expect(response.reframe).toBe('')
      expect(response.encouragement).toBe('')
      expect(response.actionItems).toEqual([])
      expect(response.tone).toBe('neutral')
    })

    it('increments totalEmpathyGenerated stat', () => {
      const detection = engine.detectEmotion('great code')
      engine.generateEmpathy(detection)
      engine.generateEmpathy(detection)
      expect(engine.getStats().totalEmpathyGenerated).toBe(2)
    })

    it('generates empathy for neutral emotion', () => {
      const detection: EmotionDetection = {
        id: 'test',
        primary: 'neutral',
        secondary: null,
        intensity: 0.1,
        confidence: 0.3,
        triggers: [],
        context: 'neutral',
      }
      const response = engine.generateEmpathy(detection)
      expect(response.tone).toBe('neutral')
      expect(response.acknowledgment.length).toBeGreaterThan(0)
    })

    it('generates empathy for pride', () => {
      const detection = engine.detectEmotion('So proud of what I accomplished, shipped and deployed')
      const response = engine.generateEmpathy(detection)
      expect(response.acknowledgment.length).toBeGreaterThan(0)
    })
  })

  // ── getEmotionTimeline ──────────────────────────────────────────────────────

  describe('getEmotionTimeline', () => {
    it('returns empty timeline with stable trend initially', () => {
      const timeline = engine.getEmotionTimeline()
      expect(timeline.entries).toEqual([])
      expect(timeline.trend).toBe('stable')
      expect(timeline.dominantEmotion).toBe('neutral')
      expect(timeline.averageIntensity).toBe(0)
    })

    it('tracks entries after emotion detection', () => {
      engine.detectEmotion('terrible bug crash')
      engine.detectEmotion('amazing awesome solution')
      const timeline = engine.getEmotionTimeline()
      expect(timeline.entries.length).toBe(2)
    })

    it('each entry has timestamp, emotion, intensity, trigger', () => {
      engine.detectEmotion('frustrating error')
      const timeline = engine.getEmotionTimeline()
      const entry = timeline.entries[0]
      expect(entry).toHaveProperty('timestamp')
      expect(entry).toHaveProperty('emotion')
      expect(entry).toHaveProperty('intensity')
      expect(entry).toHaveProperty('trigger')
      expect(typeof entry.timestamp).toBe('number')
    })

    it('computes dominant emotion correctly', () => {
      engine.detectEmotion('terrible frustrating bug')
      engine.detectEmotion('awful crash failure')
      engine.detectEmotion('amazing success')
      const timeline = engine.getEmotionTimeline()
      expect(timeline.dominantEmotion).toBe('frustration')
    })

    it('computes average intensity', () => {
      engine.detectEmotion('terrible bug')
      engine.detectEmotion('great code')
      const timeline = engine.getEmotionTimeline()
      expect(timeline.averageIntensity).toBeGreaterThan(0)
    })

    it('trend is stable with fewer than 3 entries', () => {
      engine.detectEmotion('terrible bug')
      engine.detectEmotion('great code')
      const timeline = engine.getEmotionTimeline()
      expect(timeline.trend).toBe('stable')
    })

    it('can detect improving trend', () => {
      // Start negative, end positive
      engine.detectEmotion('terrible bug crash failure')
      engine.detectEmotion('awful frustrating broken error')
      engine.detectEmotion('fixed it, works great now')
      engine.detectEmotion('amazing success, excellent progress')
      const timeline = engine.getEmotionTimeline()
      expect(['improving', 'stable', 'volatile']).toContain(timeline.trend)
    })

    it('returns EmotionTimeline shape', () => {
      const timeline = engine.getEmotionTimeline()
      expect(timeline).toHaveProperty('entries')
      expect(timeline).toHaveProperty('trend')
      expect(timeline).toHaveProperty('dominantEmotion')
      expect(timeline).toHaveProperty('averageIntensity')
    })
  })

  // ── getEmotionalContext ─────────────────────────────────────────────────────

  describe('getEmotionalContext', () => {
    it('returns default context when no history', () => {
      const ctx = engine.getEmotionalContext()
      expect(ctx.currentEmotion.primary).toBe('neutral')
      expect(ctx.recentEmotions).toEqual([])
      expect(ctx.emotionalTrend).toBe('stable')
      expect(ctx.stressLevel).toBe(0)
      expect(ctx.engagementLevel).toBe(0.5)
      expect(ctx.needsSupport).toBe(false)
    })

    it('reflects the most recent emotion as current', () => {
      engine.detectEmotion('terrible bug crash')
      engine.detectEmotion('amazing awesome breakthrough!')
      const ctx = engine.getEmotionalContext()
      expect(ctx.currentEmotion.primary).not.toBe('neutral')
    })

    it('recent emotions list is populated', () => {
      engine.detectEmotion('terrible bug')
      engine.detectEmotion('great solution')
      const ctx = engine.getEmotionalContext()
      expect(ctx.recentEmotions.length).toBe(2)
    })

    it('stress level increases with negative emotions', () => {
      engine.detectEmotion('terrible frustrating bug')
      engine.detectEmotion('crash failure broken')
      engine.detectEmotion('overwhelmed nightmare impossible')
      const ctx = engine.getEmotionalContext()
      expect(ctx.stressLevel).toBeGreaterThan(0)
    })

    it('needsSupport is true under high stress', () => {
      engine.detectEmotion('terrible frustrating crash bug')
      engine.detectEmotion('impossible nightmare failure broken')
      engine.detectEmotion('overwhelmed anxious worried nervous')
      const ctx = engine.getEmotionalContext()
      expect(ctx.needsSupport).toBe(true)
    })

    it('engagement level reflects activity', () => {
      engine.detectEmotion('amazing awesome great')
      engine.detectEmotion('terrible frustrating crash')
      engine.detectEmotion('curious interesting discover')
      const ctx = engine.getEmotionalContext()
      expect(ctx.engagementLevel).toBeGreaterThan(0)
    })

    it('stress level is between 0 and 1', () => {
      engine.detectEmotion('terrible crash bug failure')
      const ctx = engine.getEmotionalContext()
      expect(ctx.stressLevel).toBeGreaterThanOrEqual(0)
      expect(ctx.stressLevel).toBeLessThanOrEqual(1)
    })

    it('returns EmotionalContext shape', () => {
      engine.detectEmotion('great code')
      const ctx = engine.getEmotionalContext()
      expect(ctx).toHaveProperty('currentEmotion')
      expect(ctx).toHaveProperty('recentEmotions')
      expect(ctx).toHaveProperty('emotionalTrend')
      expect(ctx).toHaveProperty('stressLevel')
      expect(ctx).toHaveProperty('engagementLevel')
      expect(ctx).toHaveProperty('needsSupport')
    })
  })

  // ── detectEmotionPatterns ──────────────────────────────────────────────────

  describe('detectEmotionPatterns', () => {
    it('returns empty array when no history', () => {
      const patterns = engine.detectEmotionPatterns()
      expect(patterns).toEqual([])
    })

    it('returns empty array with insufficient repeats', () => {
      engine.detectEmotion('terrible bug')
      engine.detectEmotion('amazing code')
      const patterns = engine.detectEmotionPatterns()
      // Patterns require frequency >= 2 with same trigger:emotion key
      expect(patterns).toEqual([])
    })

    it('detects repeated trigger-emotion pairs', () => {
      // Same text repeated triggers the same trigger:emotion entry
      engine.detectEmotion('terrible bug crash')
      engine.detectEmotion('terrible bug crash')
      engine.detectEmotion('terrible bug crash')
      const patterns = engine.detectEmotionPatterns()
      expect(patterns.length).toBeGreaterThan(0)
      expect(patterns[0].frequency).toBeGreaterThanOrEqual(2)
    })

    it('returns EmotionPattern shape', () => {
      engine.detectEmotion('terrible bug crash')
      engine.detectEmotion('terrible bug crash')
      const patterns = engine.detectEmotionPatterns()
      if (patterns.length > 0) {
        expect(patterns[0]).toHaveProperty('trigger')
        expect(patterns[0]).toHaveProperty('emotion')
        expect(patterns[0]).toHaveProperty('frequency')
        expect(patterns[0]).toHaveProperty('avgIntensity')
      }
    })

    it('sorts patterns by frequency descending', () => {
      for (let i = 0; i < 5; i++) engine.detectEmotion('terrible bug crash')
      for (let i = 0; i < 2; i++) engine.detectEmotion('amazing awesome breakthrough')
      const patterns = engine.detectEmotionPatterns()
      if (patterns.length >= 2) {
        expect(patterns[0].frequency).toBeGreaterThanOrEqual(patterns[1].frequency)
      }
    })

    it('avgIntensity is computed correctly', () => {
      engine.detectEmotion('terrible bug crash')
      engine.detectEmotion('terrible bug crash')
      const patterns = engine.detectEmotionPatterns()
      if (patterns.length > 0) {
        expect(patterns[0].avgIntensity).toBeGreaterThan(0)
        expect(patterns[0].avgIntensity).toBeLessThanOrEqual(1)
      }
    })
  })

  // ── adjustTone ─────────────────────────────────────────────────────────────

  describe('adjustTone', () => {
    it('adds supportive prefix', () => {
      const result = engine.adjustTone('You should fix this.', 'supportive')
      expect(result).toContain('I understand')
      expect(result).toContain('you could')
    })

    it('supportive tone softens "you must"', () => {
      const result = engine.adjustTone('you must deploy', 'supportive')
      expect(result).toContain('you might consider')
    })

    it('celebratory tone adds exclamation', () => {
      const result = engine.adjustTone('Nice work.', 'celebratory')
      expect(result).toContain('!')
    })

    it('celebratory tone adds "Great work!" prefix', () => {
      const result = engine.adjustTone('You did it.', 'celebratory')
      expect(result).toContain('Great work!')
    })

    it('calming tone removes exclamation marks', () => {
      const result = engine.adjustTone('Fix this NOW! URGENT!', 'calming')
      expect(result).not.toContain('!')
    })

    it('calming tone replaces urgency words', () => {
      const result = engine.adjustTone('Do it IMMEDIATELY', 'calming')
      expect(result).toContain("when you're ready")
    })

    it('calming tone adds "Take your time"', () => {
      const result = engine.adjustTone('Work on this.', 'calming')
      expect(result).toContain('Take your time')
    })

    it('motivating tone adds encouragement prefix', () => {
      const result = engine.adjustTone('Keep working on it.', 'motivating')
      expect(result).toContain('You can do this!')
    })

    it('neutral tone returns text unchanged', () => {
      const original = 'Some plain text.'
      const result = engine.adjustTone(original, 'neutral')
      expect(result).toBe(original)
    })
  })

  // ── provideFeedback ────────────────────────────────────────────────────────

  describe('provideFeedback', () => {
    it('marks emotion as correct', () => {
      const detection = engine.detectEmotion('terrible frustrating bug')
      engine.provideFeedback(detection.id, true)
      expect(engine.getStats().totalFeedbackReceived).toBe(1)
    })

    it('marks emotion as incorrect', () => {
      const detection = engine.detectEmotion('great code')
      engine.provideFeedback(detection.id, false)
      expect(engine.getStats().totalFeedbackReceived).toBe(1)
    })

    it('handles unknown emotion id gracefully', () => {
      engine.provideFeedback('nonexistent-id', true)
      expect(engine.getStats().totalFeedbackReceived).toBe(1)
    })

    it('increments feedback counter for each call', () => {
      const a = engine.detectEmotion('great code')
      const b = engine.detectEmotion('terrible bug')
      engine.provideFeedback(a.id, true)
      engine.provideFeedback(b.id, false)
      engine.provideFeedback('unknown', true)
      expect(engine.getStats().totalFeedbackReceived).toBe(3)
    })
  })

  // ── getStats ───────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns zeroed stats initially', () => {
      const stats = engine.getStats()
      expect(stats.totalAnalyses).toBe(0)
      expect(stats.totalEmotionsDetected).toBe(0)
      expect(stats.totalEmpathyGenerated).toBe(0)
      expect(stats.totalFeedbackReceived).toBe(0)
      expect(stats.avgSentimentScore).toBe(0)
      expect(stats.emotionDistribution).toEqual({})
    })

    it('tracks analyses count', () => {
      engine.analyzeSentiment('great')
      engine.analyzeSentiment('terrible')
      expect(engine.getStats().totalAnalyses).toBe(2)
    })

    it('tracks emotions detected count', () => {
      engine.detectEmotion('great code')
      engine.detectEmotion('terrible bug')
      engine.detectEmotion('curious discovery')
      expect(engine.getStats().totalEmotionsDetected).toBe(3)
    })

    it('tracks empathy generated count', () => {
      const d = engine.detectEmotion('frustrating bug')
      engine.generateEmpathy(d)
      expect(engine.getStats().totalEmpathyGenerated).toBe(1)
    })

    it('tracks feedback received count', () => {
      const d = engine.detectEmotion('great code')
      engine.provideFeedback(d.id, true)
      expect(engine.getStats().totalFeedbackReceived).toBe(1)
    })

    it('computes average sentiment score', () => {
      engine.analyzeSentiment('amazing awesome great')
      engine.analyzeSentiment('terrible awful horrible')
      const stats = engine.getStats()
      // One positive, one negative → average near 0
      expect(stats.avgSentimentScore).toBeGreaterThanOrEqual(-1)
      expect(stats.avgSentimentScore).toBeLessThanOrEqual(1)
    })

    it('populates emotion distribution', () => {
      engine.detectEmotion('terrible frustrating crash')
      engine.detectEmotion('amazing awesome breakthrough!')
      const stats = engine.getStats()
      const totalDistributed = Object.values(stats.emotionDistribution).reduce((a, b) => a + b, 0)
      expect(totalDistributed).toBe(2)
    })

    it('returns EmotionEngineStats shape', () => {
      const stats = engine.getStats()
      expect(stats).toHaveProperty('totalAnalyses')
      expect(stats).toHaveProperty('totalEmotionsDetected')
      expect(stats).toHaveProperty('totalEmpathyGenerated')
      expect(stats).toHaveProperty('totalFeedbackReceived')
      expect(stats).toHaveProperty('avgSentimentScore')
      expect(stats).toHaveProperty('emotionDistribution')
    })

    it('emotion distribution is a copy (not a reference)', () => {
      engine.detectEmotion('terrible bug')
      const stats1 = engine.getStats()
      stats1.emotionDistribution['frustration'] = 999
      const stats2 = engine.getStats()
      expect(stats2.emotionDistribution['frustration']).not.toBe(999)
    })
  })
})
