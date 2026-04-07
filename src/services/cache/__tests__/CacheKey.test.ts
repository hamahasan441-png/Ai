import { describe, it, expect } from 'vitest'
import { cacheKey, chatCacheKey, knowledgeCacheKey, toolCacheKey } from '../CacheKey.js'

describe('CacheKey', () => {
  describe('cacheKey', () => {
    it('returns a 32-character hex string', () => {
      const key = cacheKey('hello', 'world')
      expect(key).toMatch(/^[0-9a-f]{32}$/)
    })

    it('is deterministic for the same inputs', () => {
      const a = cacheKey('foo', 'bar')
      const b = cacheKey('foo', 'bar')
      expect(a).toBe(b)
    })

    it('produces different keys for different inputs', () => {
      const a = cacheKey('foo')
      const b = cacheKey('bar')
      expect(a).not.toBe(b)
    })

    it('is sensitive to part order', () => {
      const ab = cacheKey('a', 'b')
      const ba = cacheKey('b', 'a')
      expect(ab).not.toBe(ba)
    })

    it('uses separator to prevent collisions between different part splits', () => {
      const key1 = cacheKey('ab', 'cd')
      const key2 = cacheKey('a', 'bcd')
      expect(key1).not.toBe(key2)
    })

    it('handles empty strings', () => {
      const key = cacheKey('')
      expect(key).toMatch(/^[0-9a-f]{32}$/)
    })

    it('handles many parts', () => {
      const key = cacheKey('a', 'b', 'c', 'd', 'e')
      expect(key).toMatch(/^[0-9a-f]{32}$/)
    })
  })

  describe('chatCacheKey', () => {
    it('returns a 32-character hex string', () => {
      expect(chatCacheKey('sys', 'user')).toMatch(/^[0-9a-f]{32}$/)
    })

    it('is deterministic', () => {
      expect(chatCacheKey('s', 'u')).toBe(chatCacheKey('s', 'u'))
    })

    it('differs from knowledgeCacheKey for the same input', () => {
      const chat = chatCacheKey('query', 'query')
      const knowledge = knowledgeCacheKey('query')
      expect(chat).not.toBe(knowledge)
    })
  })

  describe('knowledgeCacheKey', () => {
    it('returns a 32-character hex string', () => {
      expect(knowledgeCacheKey('search term')).toMatch(/^[0-9a-f]{32}$/)
    })

    it('differs from toolCacheKey for the same input', () => {
      const knowledge = knowledgeCacheKey('test')
      const tool = toolCacheKey('test', 'test')
      expect(knowledge).not.toBe(tool)
    })
  })

  describe('toolCacheKey', () => {
    it('returns a 32-character hex string', () => {
      expect(toolCacheKey('bash', 'ls -la')).toMatch(/^[0-9a-f]{32}$/)
    })

    it('is deterministic', () => {
      expect(toolCacheKey('t', 'i')).toBe(toolCacheKey('t', 'i'))
    })

    it('different tool names produce different keys', () => {
      expect(toolCacheKey('tool1', 'input')).not.toBe(toolCacheKey('tool2', 'input'))
    })
  })

  describe('cross-function uniqueness', () => {
    it('all key functions produce different results for the same raw input', () => {
      const input = 'same-input'
      const chat = chatCacheKey(input, input)
      const knowledge = knowledgeCacheKey(input)
      const tool = toolCacheKey(input, input)

      const keys = new Set([chat, knowledge, tool])
      expect(keys.size).toBe(3)
    })
  })
})
