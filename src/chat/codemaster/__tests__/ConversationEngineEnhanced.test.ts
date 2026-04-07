import { describe, it, expect, beforeEach } from 'vitest'
import { ConversationEngine } from '../ConversationEngine.js'
import type { ConversationSentiment, SmartSuggestion } from '../ConversationEngine.js'

describe('ConversationEngine — Enhanced Methods', () => {
  let engine: ConversationEngine

  beforeEach(() => {
    engine = new ConversationEngine()
  })

  // ═══════════════════════════════════════════════════════════
  // analyzeSentiment
  // ═══════════════════════════════════════════════════════════

  describe('analyzeSentiment', () => {
    it('should return "frustrated" for "this is not working, broken again"', () => {
      expect(engine.analyzeSentiment('this is not working, broken again')).toBe('frustrated')
    })

    it('should return "positive" for "thanks, that\'s perfect!"', () => {
      expect(engine.analyzeSentiment("thanks, that's perfect!")).toBe('positive')
    })

    it('should return "confused" for "I don\'t understand what you mean"', () => {
      expect(engine.analyzeSentiment("I don't understand what you mean")).toBe('confused')
    })

    it('should return "curious" for "how does this work? explain please"', () => {
      expect(engine.analyzeSentiment('how does this work? explain please')).toBe('curious')
    })

    it('should return "neutral" for "I need to add a new function"', () => {
      expect(engine.analyzeSentiment('I need to add a new function')).toBe('neutral')
    })

    it('should return "neutral" for an empty string', () => {
      expect(engine.analyzeSentiment('')).toBe('neutral')
    })

    it('should return "neutral" for a single neutral word', () => {
      expect(engine.analyzeSentiment('hello')).toBe('neutral')
    })

    it('should return "frustrated" when frustrated score >= confused score', () => {
      // "not working" triggers frustrated; "confused" triggers confused — tied, frustrated wins
      expect(engine.analyzeSentiment('this is not working and I am confused')).toBe('frustrated')
    })

    it('should return "positive" when positive score >= curious score', () => {
      // "great" = positive, "how" = curious — positive wins when positive >= curious
      expect(engine.analyzeSentiment('great work, how nice')).toBe('positive')
    })

    it('should be case-insensitive', () => {
      expect(engine.analyzeSentiment('THANKS! PERFECT!')).toBe('positive')
    })

    it('should detect frustrated from "stuck"', () => {
      expect(engine.analyzeSentiment('I am stuck on this issue')).toBe('frustrated')
    })

    it('should detect confused from "unclear"', () => {
      expect(engine.analyzeSentiment('the instructions are unclear')).toBe('confused')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // generateSmartSuggestions
  // ═══════════════════════════════════════════════════════════

  describe('generateSmartSuggestions', () => {
    it('should return empty array for empty conversation', () => {
      const suggestions = engine.generateSmartSuggestions()
      expect(suggestions).toEqual([])
    })

    it('should return debugging suggestions when user is frustrated', () => {
      engine.addUserMessage('this is not working, everything is broken')
      const suggestions = engine.generateSmartSuggestions()
      expect(suggestions.some(s => s.text.toLowerCase().includes('debug'))).toBe(true)
    })

    it('should ask for error details when user is frustrated', () => {
      engine.addUserMessage('error again, stuck!')
      const suggestions = engine.generateSmartSuggestions()
      expect(suggestions.some(s => s.text.toLowerCase().includes('error'))).toBe(true)
    })

    it('should return simplification suggestions when user is confused', () => {
      engine.addUserMessage("I don't understand what you mean, I'm confused")
      const suggestions = engine.generateSmartSuggestions()
      expect(suggestions.some(s => s.type === 'explanation')).toBe(true)
    })

    it('should return code example suggestion when user is confused', () => {
      engine.addUserMessage("I don't understand this concept, it is unclear")
      const suggestions = engine.generateSmartSuggestions()
      expect(suggestions.some(s => s.type === 'code')).toBe(true)
    })

    it('should return exploration suggestions when user is curious', () => {
      engine.addUserMessage('how does this work? explain the architecture')
      const suggestions = engine.generateSmartSuggestions()
      expect(suggestions.some(s => s.text.toLowerCase().includes('deeper dive'))).toBe(true)
    })

    it('should return next-step suggestions when intent is new-feature', () => {
      engine.addUserMessage('create a new user authentication module')
      const suggestions = engine.generateSmartSuggestions()
      expect(suggestions.some(s => s.text.toLowerCase().includes('test'))).toBe(true)
    })

    it('should return documentation suggestion for fix-bug intent', () => {
      engine.addUserMessage('fix the crash in the login handler')
      const suggestions = engine.generateSmartSuggestions()
      expect(suggestions.some(s => s.text.toLowerCase().includes('document'))).toBe(true)
    })

    it('should sort suggestions by confidence (descending)', () => {
      engine.addUserMessage('this is not working, broken again')
      const suggestions = engine.generateSmartSuggestions()
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i].confidence).toBeLessThanOrEqual(suggestions[i - 1].confidence)
      }
    })

    it('should return at most 5 suggestions', () => {
      // Trigger multiple categories
      engine.addUserMessage('how does this not working confused broken stuck explain')
      const suggestions = engine.generateSmartSuggestions()
      expect(suggestions.length).toBeLessThanOrEqual(5)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // remember / recall / getMemoryContext
  // ═══════════════════════════════════════════════════════════

  describe('remember / recall / getMemoryContext', () => {
    it('should store a value with remember()', () => {
      engine.remember('lang', 'typescript')
      expect(engine.recall('lang')).toBe('typescript')
    })

    it('should retrieve a stored value with recall()', () => {
      engine.remember('editor', 'vscode')
      expect(engine.recall('editor')).toBe('vscode')
    })

    it('should return undefined for a missing key', () => {
      expect(engine.recall('nonexistent')).toBeUndefined()
    })

    it('should return all stored pairs with getMemoryContext()', () => {
      engine.remember('a', '1')
      engine.remember('b', '2')
      const ctx = engine.getMemoryContext()
      expect(ctx).toEqual({ a: '1', b: '2' })
    })

    it('should overwrite an existing memory entry', () => {
      engine.remember('lang', 'javascript')
      engine.remember('lang', 'typescript')
      expect(engine.recall('lang')).toBe('typescript')
    })

    it('should return empty object when no memory stored', () => {
      expect(engine.getMemoryContext()).toEqual({})
    })

    it('should clear memory on reset()', () => {
      engine.remember('key', 'value')
      engine.reset()
      expect(engine.recall('key')).toBeUndefined()
      expect(engine.getMemoryContext()).toEqual({})
    })

    it('should auto-remember language preference from user messages', () => {
      engine.addUserMessage('I am working with typescript')
      expect(engine.recall('language_preference')).toBe('typescript')
    })

    it('should auto-remember recent topics from user messages', () => {
      engine.addUserMessage('I need to write unit tests with better coverage')
      expect(engine.recall('recent_topics')).toBeTruthy()
    })

    it('should support many stored entries', () => {
      for (let i = 0; i < 20; i++) {
        engine.remember(`key_${i}`, `value_${i}`)
      }
      const ctx = engine.getMemoryContext()
      expect(Object.keys(ctx).length).toBe(20)
      expect(ctx.key_0).toBe('value_0')
      expect(ctx.key_19).toBe('value_19')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // getUnderstandingScore
  // ═══════════════════════════════════════════════════════════

  describe('getUnderstandingScore', () => {
    it('should return score 0 for empty conversation', () => {
      const result = engine.getUnderstandingScore()
      expect(result.score).toBe(0)
    })

    it('should return score with a breakdown object', () => {
      engine.addUserMessage('fix the bug in src/app.ts')
      const result = engine.getUnderstandingScore()
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('breakdown')
    })

    it('should have intentClarity in breakdown', () => {
      engine.addUserMessage('create a new component')
      const { breakdown } = engine.getUnderstandingScore()
      expect(breakdown).toHaveProperty('intentClarity')
    })

    it('should have codeRefDensity in breakdown', () => {
      engine.addUserMessage('look at src/index.ts')
      const { breakdown } = engine.getUnderstandingScore()
      expect(breakdown).toHaveProperty('codeRefDensity')
    })

    it('should have topicConsistency in breakdown', () => {
      engine.addUserMessage('we need to improve test coverage')
      const { breakdown } = engine.getUnderstandingScore()
      expect(breakdown).toHaveProperty('topicConsistency')
    })

    it('should have sentimentTracking in breakdown', () => {
      engine.addUserMessage('thanks, this is great!')
      const { breakdown } = engine.getUnderstandingScore()
      expect(breakdown).toHaveProperty('sentimentTracking')
    })

    it('should increase score with intent-detected messages', () => {
      const { score: scoreBefore } = engine.getUnderstandingScore()
      engine.addUserMessage('fix the crash in login page')
      engine.addUserMessage('add unit tests for auth module')
      const { score: scoreAfter } = engine.getUnderstandingScore()
      expect(scoreAfter).toBeGreaterThan(scoreBefore)
    })

    it('should keep score between 0 and 100', () => {
      // Build up a rich conversation
      engine.addUserMessage('fix the bug in src/app.ts:42')
      engine.addAssistantMessage('I see the issue in src/app.ts at line 42')
      engine.addUserMessage('great, now add tests for src/utils.ts')
      engine.addUserMessage('thanks, this is perfect! optimize the query performance')
      const { score } = engine.getUnderstandingScore()
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should increase intentClarity when all user messages have intents', () => {
      engine.addUserMessage('fix the login bug')
      engine.addUserMessage('add unit tests for auth')
      const { breakdown } = engine.getUnderstandingScore()
      expect(breakdown.intentClarity).toBe(100)
    })

    it('should reflect code references in codeRefDensity', () => {
      engine.addUserMessage('check src/app.ts for the issue')
      engine.addAssistantMessage('looking at src/utils.ts as well')
      const { breakdown } = engine.getUnderstandingScore()
      expect(breakdown.codeRefDensity).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // getDetectedExpertise
  // ═══════════════════════════════════════════════════════════

  describe('getDetectedExpertise', () => {
    it('should return empty arrays for empty conversation', () => {
      const result = engine.getDetectedExpertise()
      expect(result.languages).toEqual([])
      expect(result.frameworks).toEqual([])
      expect(result.tools).toEqual([])
    })

    it('should detect typescript language', () => {
      engine.addUserMessage('I am writing typescript code')
      const { languages } = engine.getDetectedExpertise()
      expect(languages).toContain('typescript')
    })

    it('should detect python language', () => {
      engine.addUserMessage('update the python script in main.py')
      const { languages } = engine.getDetectedExpertise()
      expect(languages).toContain('python')
    })

    it('should detect react framework', () => {
      engine.addUserMessage('build a react component with jsx')
      const { frameworks } = engine.getDetectedExpertise()
      expect(frameworks).toContain('react')
    })

    it('should detect django framework', () => {
      engine.addUserMessage('set up a new django app')
      const { frameworks } = engine.getDetectedExpertise()
      expect(frameworks).toContain('django')
    })

    it('should detect docker tool', () => {
      engine.addUserMessage('create a Dockerfile for the project')
      const { tools } = engine.getDetectedExpertise()
      expect(tools).toContain('docker')
    })

    it('should detect git tool', () => {
      engine.addUserMessage('I need to rebase my branch')
      const { tools } = engine.getDetectedExpertise()
      expect(tools).toContain('git')
    })

    it('should return deduplicated results across multiple messages', () => {
      engine.addUserMessage('working on typescript project')
      engine.addUserMessage('more typescript code changes')
      const { languages } = engine.getDetectedExpertise()
      const tsCount = languages.filter(l => l === 'typescript').length
      expect(tsCount).toBe(1)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Topic tracking
  // ═══════════════════════════════════════════════════════════

  describe('topic tracking', () => {
    it('should extract topics from messages', () => {
      engine.addUserMessage('I need to write a test for the auth module')
      const state = engine.getState()
      expect(state.topics.size).toBeGreaterThan(0)
    })

    it('should include topics Set in state', () => {
      const state = engine.getState()
      expect(state.topics).toBeInstanceOf(Set)
    })

    it('should accumulate topics across multiple messages', () => {
      engine.addUserMessage('write unit tests for coverage')
      const topicsAfterFirst = engine.getState().topics.size
      engine.addUserMessage('deploy the docker container to kubernetes')
      const topicsAfterSecond = engine.getState().topics.size
      expect(topicsAfterSecond).toBeGreaterThanOrEqual(topicsAfterFirst)
    })

    it('should detect security topics', () => {
      engine.addUserMessage('fix the xss vulnerability in the auth layer')
      const topics = engine.getState().topics
      expect(topics.has('security')).toBe(true)
    })

    it('should detect database topics', () => {
      engine.addUserMessage('optimize the sql query against the postgres database')
      const topics = engine.getState().topics
      expect(topics.has('databases')).toBe(true)
    })
  })
})
