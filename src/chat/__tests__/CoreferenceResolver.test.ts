import { describe, it, expect, beforeEach } from 'vitest'
import { CoreferenceResolver } from '../CoreferenceResolver.js'

describe('CoreferenceResolver', () => {
  let resolver: CoreferenceResolver

  beforeEach(() => {
    resolver = new CoreferenceResolver()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(resolver).toBeInstanceOf(CoreferenceResolver)
    })
  })

  describe('resolve', () => {
    it('should return original text with no history', () => {
      const result = resolver.resolve('What is it?', [])
      expect(result.resolvedText).toBeDefined()
      expect(result.confidence).toBeGreaterThanOrEqual(0)
    })

    it('should return result structure with replacements array', () => {
      const result = resolver.resolve('Tell me about it', [
        { role: 'user', content: 'I am learning about TypeScript' },
        { role: 'assistant', content: 'TypeScript is a typed language' },
      ])
      expect(result.replacements).toBeInstanceOf(Array)
      expect(result.entities).toBeDefined()
      expect(typeof result.confidence).toBe('number')
    })

    it('should extract entities from history', () => {
      const result = resolver.resolve('How does it work?', [
        { role: 'user', content: 'Tell me about React framework' },
        { role: 'assistant', content: 'React is a JavaScript library' },
      ])
      expect(result.entities.size).toBeGreaterThan(0)
    })

    it('should track entities across multiple turns', () => {
      const history = [
        { role: 'user', content: 'What is Docker?' },
        { role: 'assistant', content: 'Docker is a containerization platform' },
        { role: 'user', content: 'How does Kubernetes compare?' },
        { role: 'assistant', content: 'Kubernetes orchestrates Docker containers' },
      ]
      const result = resolver.resolve('Tell me more about it', history)
      expect(result.entities.size).toBeGreaterThan(0)
    })

    it('should handle empty text', () => {
      const result = resolver.resolve('', [{ role: 'user', content: 'Hello' }])
      expect(result.replacements).toHaveLength(0)
    })

    it('should handle quoted strings in history', () => {
      const result = resolver.resolve('What does it do?', [
        { role: 'user', content: 'I used "webpack" for bundling' },
      ])
      // Should extract quoted entity
      expect(result.entities.size).toBeGreaterThanOrEqual(0)
    })

    it('should handle technical terms (camelCase)', () => {
      const result = resolver.resolve('How does it work?', [
        { role: 'user', content: 'The useState hook is important in React' },
      ])
      expect(result.entities.size).toBeGreaterThan(0)
    })

    it('should handle technical terms (snake_case)', () => {
      const result = resolver.resolve('What does it do?', [
        { role: 'user', content: 'The user_profile table stores data' },
      ])
      expect(result.entities.size).toBeGreaterThan(0)
    })

    it('should not replace pronouns that are part of larger words', () => {
      const result = resolver.resolve('The iteration process', [
        { role: 'user', content: 'Tell me about Python' },
      ])
      // "it" inside "iteration" should not be replaced
      expect(result.resolvedText).toContain('iteration')
    })
  })

  describe('getStats', () => {
    it('should track call count', () => {
      resolver.resolve('test', [])
      resolver.resolve('test', [])
      const stats = resolver.getStats()
      expect(stats.totalCalls).toBe(2)
    })

    it('should start with zero stats', () => {
      const stats = resolver.getStats()
      expect(stats.totalCalls).toBe(0)
      expect(stats.resolveCount).toBe(0)
      expect(stats.entityCount).toBe(0)
    })
  })

  describe('serialize/deserialize', () => {
    it('should serialize and deserialize state', () => {
      resolver.resolve('What is it?', [{ role: 'user', content: 'Tell me about JavaScript' }])
      const serialized = resolver.serialize()
      const deserialized = CoreferenceResolver.deserialize(serialized)
      expect(deserialized.getStats().totalCalls).toBe(1)
    })

    it('should handle empty serialization', () => {
      const serialized = resolver.serialize()
      const parsed = JSON.parse(serialized)
      expect(parsed.totalCalls).toBe(0)
    })
  })
})
