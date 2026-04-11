import { describe, it, expect, beforeEach } from 'vitest'
import { PersonalityEngine, DEFAULT_PERSONALITY_CONFIG } from '../PersonalityEngine.js'

describe('PersonalityEngine', () => {
  let engine: PersonalityEngine

  beforeEach(() => {
    engine = new PersonalityEngine()
  })

  describe('constructor & config', () => {
    it('uses default config', () => {
      expect(engine.getStats().totalProfiles).toBe(0)
    })
    it('accepts custom config', () => {
      const e = new PersonalityEngine({ defaultTone: 'casual' })
      expect(e.getStats().totalProfiles).toBe(0)
    })
    it('DEFAULT config has expected values', () => {
      expect(DEFAULT_PERSONALITY_CONFIG.defaultTone).toBe('professional')
      expect(DEFAULT_PERSONALITY_CONFIG.maxProfiles).toBe(100)
    })
  })

  describe('profile management', () => {
    it('creates a personality profile', () => {
      const p = engine.createProfile('Assertive Leader', {
        openness: 0.7,
        conscientiousness: 0.9,
        extraversion: 0.8,
        agreeableness: 0.4,
        neuroticism: 0.2,
      })
      expect(p.id).toBeTruthy()
      expect(p.name).toBe('Assertive Leader')
      expect(p.communicationStyle).toBe('driver')
    })
    it('retrieves profile by id', () => {
      const p = engine.createProfile('Test', {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5,
      })
      expect(engine.getProfile(p.id)).toBe(p)
    })
    it('returns null for unknown profile', () => {
      expect(engine.getProfile('bad')).toBeNull()
    })
    it('infers expressive style for high extraversion + agreeableness', () => {
      const p = engine.createProfile('Friendly', {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.8,
        agreeableness: 0.8,
        neuroticism: 0.3,
      })
      expect(p.communicationStyle).toBe('expressive')
    })
    it('infers analytical style for low extraversion + high conscientiousness', () => {
      const p = engine.createProfile('Analyst', {
        openness: 0.5,
        conscientiousness: 0.9,
        extraversion: 0.3,
        agreeableness: 0.5,
        neuroticism: 0.3,
      })
      expect(p.communicationStyle).toBe('analytical')
    })
    it('clamps trait values to [0,1]', () => {
      const p = engine.createProfile('Extreme', {
        openness: 1.5,
        conscientiousness: -0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5,
      })
      expect(p.traits.openness).toBeLessThanOrEqual(1)
      expect(p.traits.conscientiousness).toBeGreaterThanOrEqual(0)
    })
  })

  describe('persona templates', () => {
    it('creates a persona', () => {
      const prof = engine.createProfile('Base', {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5,
      })
      const persona = engine.createPersona(
        'Helper',
        'A helpful assistant',
        prof,
        ['Hello!', 'Hi there!'],
        ['Goodbye!'],
      )
      expect(persona.id).toBeTruthy()
      expect(persona.greetings).toHaveLength(2)
    })
    it('retrieves persona by id', () => {
      const prof = engine.createProfile('B', {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5,
      })
      const p = engine.createPersona('T', 'd', prof, [], [])
      expect(engine.getPersona(p.id)).toBe(p)
    })
    it('lists all personas', () => {
      const prof = engine.createProfile('B', {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5,
      })
      engine.createPersona('P1', 'd', prof, [], [])
      engine.createPersona('P2', 'd', prof, [], [])
      expect(engine.listPersonas()).toHaveLength(2)
    })
  })

  describe('tone analysis', () => {
    it('detects formal tone', () => {
      const a = engine.analyzeTone(
        'Furthermore, we must therefore consider the implications accordingly.',
      )
      expect(a.detectedTone).toBe('formal')
    })
    it('detects casual tone', () => {
      const a = engine.analyzeTone("Hey, that's pretty cool and awesome stuff!")
      expect(a.detectedTone).toBe('casual')
    })
    it('detects enthusiastic tone', () => {
      const a = engine.analyzeTone(
        'This is amazing and fantastic! What an incredible wonderful result!',
      )
      expect(a.detectedTone).toBe('enthusiastic')
    })
    it('returns confidence and scores', () => {
      const a = engine.analyzeTone('Hello world')
      expect(a.formalityScore).toBeDefined()
      expect(a.emotionality).toBeDefined()
      expect(a.directness).toBeDefined()
    })
  })

  describe('empathy response', () => {
    it('detects sadness and suggests empathetic tone', () => {
      const r = engine.generateEmpathyResponse('I feel so sad and disappointed today.')
      expect(r.detectedEmotion).toBe('sad')
      expect(r.suggestedTone).toBe('empathetic')
    })
    it('detects happiness', () => {
      const r = engine.generateEmpathyResponse("I'm so happy and excited about this!")
      expect(r.detectedEmotion).toBe('happy')
    })
    it('detects anxiety', () => {
      const r = engine.generateEmpathyResponse("I'm worried and stressed about the deadline.")
      expect(r.detectedEmotion).toBe('anxious')
      expect(r.suggestedTone).toBe('encouraging')
    })
    it('provides suggested opener', () => {
      const r = engine.generateEmpathyResponse('I feel angry and frustrated.')
      expect(r.suggestedOpener).toBeTruthy()
      expect(r.suggestedApproach).toBeTruthy()
    })
    it('handles neutral text', () => {
      const r = engine.generateEmpathyResponse('The report is ready.')
      expect(r.detectedEmotion).toBe('neutral')
    })
  })

  describe('style adaptation', () => {
    it('adapts text to formal profile', () => {
      const p = engine.createProfile(
        'Formal',
        {
          openness: 0.5,
          conscientiousness: 0.9,
          extraversion: 0.3,
          agreeableness: 0.5,
          neuroticism: 0.2,
        },
        { formality: 0.9 },
      )
      const result = engine.adaptToProfile("I don't think we can't do this. We won't try.", p.id)
      expect(result).toBeTruthy()
      expect(result!.adapted).toContain('do not')
      expect(result!.changesApplied.length).toBeGreaterThan(0)
    })
    it('adapts text to casual profile', () => {
      const p = engine.createProfile(
        'Casual',
        {
          openness: 0.7,
          conscientiousness: 0.3,
          extraversion: 0.8,
          agreeableness: 0.7,
          neuroticism: 0.4,
        },
        { formality: 0.1 },
      )
      const result = engine.adaptToProfile('I do not know. I cannot help. I will not go.', p.id)
      expect(result).toBeTruthy()
      expect(result!.adapted).toContain("don't")
    })
    it('returns null for unknown profile', () => {
      expect(engine.adaptToProfile('text', 'bad')).toBeNull()
    })
  })

  describe('user preferences', () => {
    it('creates user preference', () => {
      const pref = engine.updateUserPreference('user1', {
        preferredTone: 'casual',
        topicInterests: ['tech', 'ai'],
      })
      expect(pref.userId).toBe('user1')
      expect(pref.preferredTone).toBe('casual')
      expect(pref.interactionCount).toBe(1)
    })
    it('updates existing user preference', () => {
      engine.updateUserPreference('user1', { preferredTone: 'formal' })
      const pref = engine.updateUserPreference('user1', { preferredTone: 'casual' })
      expect(pref.preferredTone).toBe('casual')
      expect(pref.interactionCount).toBe(2)
    })
    it('retrieves user preference', () => {
      engine.updateUserPreference('u1', { preferredTone: 'enthusiastic' })
      expect(engine.getUserPreference('u1')).toBeTruthy()
      expect(engine.getUserPreference('u1')!.preferredTone).toBe('enthusiastic')
    })
    it('returns null for unknown user', () => {
      expect(engine.getUserPreference('unknown')).toBeNull()
    })
  })

  describe('stats & serialization', () => {
    it('tracks all stats', () => {
      engine.createProfile('P', {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5,
      })
      engine.analyzeTone('test')
      engine.generateEmpathyResponse('happy')
      engine.provideFeedback()
      const s = engine.getStats()
      expect(s.totalProfiles).toBe(1)
      expect(s.totalToneAnalyses).toBe(1)
      expect(s.totalEmpathyResponses).toBe(1)
      expect(s.feedbackCount).toBe(1)
    })
    it('serializes and deserializes', () => {
      engine.createProfile('P', {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5,
      })
      engine.updateUserPreference('u1', { preferredTone: 'casual' })
      const json = engine.serialize()
      const restored = PersonalityEngine.deserialize(json)
      expect(restored.getProfile('prof_1')).toBeTruthy()
      expect(restored.getUserPreference('u1')).toBeTruthy()
    })
  })
})
