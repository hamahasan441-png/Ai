import { describe, it, expect, beforeEach } from 'vitest'
import { EmotionalIntelligence } from '../EmotionalIntelligence.js'

describe('EmotionalIntelligence', () => {
  let ei: EmotionalIntelligence

  beforeEach(() => {
    ei = new EmotionalIntelligence()
  })

  describe('Emotion Analysis', () => {
    it('should detect joy', () => {
      const result = ei.analyzeEmotion('I am so happy and excited about this amazing project!')
      expect(result.primary.emotion).toBe('joy')
      expect(result.primary.score).toBeGreaterThan(0)
    })

    it('should detect frustration', () => {
      const result = ei.analyzeEmotion('I am frustrated, nothing works and I am stuck!')
      expect(['frustration', 'anger']).toContain(result.primary.emotion)
      expect(result.frustrationLevel).toBeGreaterThan(0.3)
    })

    it('should detect anger', () => {
      const result = ei.analyzeEmotion('This is so annoying and broken, I hate it')
      const emotions = [result.primary.emotion, result.secondary?.emotion]
      expect(emotions.some(e => e === 'anger' || e === 'frustration')).toBe(true)
    })

    it('should detect sadness', () => {
      const result = ei.analyzeEmotion('I am disappointed that the project failed')
      expect(['sadness', 'frustration']).toContain(result.primary.emotion)
    })

    it('should detect confusion', () => {
      const result = ei.analyzeEmotion("I'm confused and don't understand what this means")
      expect(result.primary.emotion).toBe('confusion')
    })

    it('should detect neutral for factual text', () => {
      const result = ei.analyzeEmotion('The function returns an integer value')
      expect(result.primary.emotion).toBe('neutral')
    })

    it('should calculate valence correctly', () => {
      const positive = ei.analyzeEmotion('This is wonderful and amazing!')
      const negative = ei.analyzeEmotion('This is terrible and frustrating')
      expect(positive.valence).toBeGreaterThan(negative.valence)
    })

    it('should detect secondary emotion', () => {
      const result = ei.analyzeEmotion('I am excited but also a bit worried about the risk')
      expect(result.secondary).not.toBeNull()
    })

    it('should generate suggestions', () => {
      const result = ei.analyzeEmotion('I am stuck and frustrated with this bug')
      expect(result.suggestions.length).toBeGreaterThan(0)
    })

    it('should track arousal level', () => {
      const result = ei.analyzeEmotion('I am furious about this critical urgent issue!')
      expect(result.arousal).toBeGreaterThan(0)
    })
  })

  describe('Tone Analysis', () => {
    it('should detect professional tone', () => {
      const result = ei.analyzeTone('Regarding the deployment, please advise on the timeline')
      expect(result.detectedTone).toBe('professional')
    })

    it('should detect casual tone', () => {
      const result = ei.analyzeTone('Hey, yeah that sounds cool btw')
      expect(result.detectedTone).toBe('casual')
    })

    it('should detect technical tone', () => {
      const result = ei.analyzeTone('The API architecture implementation needs debug refactoring')
      expect(result.detectedTone).toBe('technical')
    })

    it('should detect urgent tone', () => {
      const result = ei.analyzeTone('This is urgent and critical, needs immediate attention ASAP')
      expect(result.detectedTone).toBe('urgent')
    })

    it('should recommend appropriate response tone', () => {
      const result = ei.analyzeTone('Hey yeah that sounds cool lol')
      expect(result.recommendedTone).toBeDefined()
    })
  })

  describe('Frustration Detection', () => {
    it('should detect high frustration', () => {
      const level = ei.detectFrustration("Why won't this work?! I've tried everything!!")
      expect(level).toBeGreaterThan(0.3)
    })

    it('should detect low frustration for calm text', () => {
      const level = ei.detectFrustration('Can you explain how to use React hooks?')
      expect(level).toBeLessThan(0.5)
    })

    it('should factor in conversation length', () => {
      const short = ei.detectFrustration('This is broken', 3)
      const long = ei.detectFrustration('This is broken', 25)
      expect(long).toBeGreaterThan(short)
    })

    it('should detect caps as frustration signal', () => {
      const level = ei.detectFrustration('WHY IS THIS NOT WORKING?!')
      expect(level).toBeGreaterThanOrEqual(0.2)
    })
  })

  describe('Empathy Response', () => {
    it('should generate empathy for frustration', () => {
      const analysis = ei.analyzeEmotion("I'm so frustrated, nothing works!!")
      const response = ei.generateEmpathyResponse(analysis)
      expect(response.length).toBeGreaterThan(0)
    })

    it('should generate positive response for joy', () => {
      const analysis = ei.analyzeEmotion('This is amazing and wonderful!')
      const response = ei.generateEmpathyResponse(analysis)
      expect(response).toContain('great')
    })

    it('should generate supportive response for sadness', () => {
      const analysis = ei.analyzeEmotion('I am sad and disappointed about the failure')
      const response = ei.generateEmpathyResponse(analysis)
      expect(response.length).toBeGreaterThan(0)
    })
  })

  describe('Emotional Trend', () => {
    it('should track emotional trend', () => {
      // Start with negative
      ei.analyzeEmotion('I am frustrated')
      ei.analyzeEmotion('This is annoying')
      ei.analyzeEmotion('Still broken')
      // Shift to positive
      ei.analyzeEmotion('This is great')
      ei.analyzeEmotion('Amazing work!')
      ei.analyzeEmotion('I am happy')

      const trend = ei.getEmotionalTrend()
      expect(['improving', 'stable']).toContain(trend.trend)
    })

    it('should return stable with little data', () => {
      const trend = ei.getEmotionalTrend()
      expect(trend.trend).toBe('stable')
    })

    it('should track history length', () => {
      ei.analyzeEmotion('test')
      ei.analyzeEmotion('test')
      expect(ei.getHistoryLength()).toBe(2)
    })

    it('should reset state', () => {
      ei.analyzeEmotion('test')
      ei.reset()
      expect(ei.getHistoryLength()).toBe(0)
    })
  })
})
