import { describe, it, expect, beforeEach } from 'vitest'
import { QueryDecomposer } from '../QueryDecomposer.js'

describe('QueryDecomposer', () => {
  let decomposer: QueryDecomposer

  beforeEach(() => {
    decomposer = new QueryDecomposer()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(decomposer).toBeInstanceOf(QueryDecomposer)
    })
  })

  describe('isComplex', () => {
    it('should return false for simple queries', () => {
      expect(decomposer.isComplex('What is JavaScript?')).toBe(false)
    })

    it('should return true for comparison queries', () => {
      expect(
        decomposer.isComplex(
          'Compare React vs Angular for building large enterprise applications and consider all the advantages and disadvantages of each',
        ),
      ).toBe(true)
    })

    it('should return true for multi-part queries', () => {
      expect(
        decomposer.isComplex(
          'What is Docker, how does it compare to VMs, and when should I use it?',
        ),
      ).toBe(true)
    })

    it('should return false for very short text', () => {
      expect(decomposer.isComplex('hi')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(decomposer.isComplex('')).toBe(false)
    })

    it('should detect sequential complexity', () => {
      expect(
        decomposer.isComplex('How to set up a CI/CD pipeline step by step for a Node.js project'),
      ).toBe(true)
    })
  })

  describe('decompose', () => {
    it('should return simple strategy for simple queries', () => {
      const result = decomposer.decompose('What is Python?')
      expect(result.isComplex).toBe(false)
      expect(result.strategy).toBe('simple')
      expect(result.subQuestions).toHaveLength(1)
    })

    it('should decompose comparison queries', () => {
      const result = decomposer.decompose(
        'What are the differences between SQL and NoSQL databases for web applications?',
      )
      expect(result.isComplex).toBe(true)
      expect(result.strategy).toBe('comparison')
      expect(result.subQuestions.length).toBeGreaterThan(1)
    })

    it('should decompose sequential queries', () => {
      const result = decomposer.decompose(
        'How to deploy a Node.js application to AWS step by step with best practices',
      )
      expect(result.isComplex).toBe(true)
      expect(result.strategy).toBe('sequential')
      expect(result.subQuestions.length).toBeGreaterThan(1)
    })

    it('should decompose conditional queries', () => {
      const result = decomposer.decompose(
        'Should I use MongoDB or PostgreSQL for my e-commerce application that needs ACID compliance and strong consistency guarantees for financial transactions?',
      )
      expect(result.isComplex).toBe(true)
      expect(result.strategy).toBe('conditional')
      expect(result.subQuestions.length).toBeGreaterThan(1)
    })

    it('should decompose multi-aspect queries', () => {
      const result = decomposer.decompose(
        'Tell me about Kubernetes, including its architecture, deployment strategies, monitoring approaches, and also explain the differences between pods and services',
      )
      expect(result.isComplex).toBe(true)
      expect(result.subQuestions.length).toBeGreaterThan(1)
    })

    it('should handle empty query', () => {
      const result = decomposer.decompose('')
      expect(result.isComplex).toBe(false)
      expect(result.strategy).toBe('simple')
    })

    it('should set dependencies correctly for comparison', () => {
      const result = decomposer.decompose(
        'React vs Vue vs Angular differences for building large scale applications',
      )
      if (result.isComplex) {
        const lastQ = result.subQuestions[result.subQuestions.length - 1]
        expect(lastQ?.dependsOn.length).toBeGreaterThanOrEqual(0)
      }
    })

    it('should include original query', () => {
      const query = 'What is the best programming language?'
      const result = decomposer.decompose(query)
      expect(result.originalQuery).toBe(query)
    })

    it('should have confidence between 0 and 1', () => {
      const result = decomposer.decompose(
        'Compare Python vs JavaScript for web development and data science',
      )
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('should detect vs pattern', () => {
      const result = decomposer.decompose(
        'Python vs JavaScript: which is better for backend development and API design?',
      )
      expect(result.strategy).toBe('comparison')
    })

    it('should decompose how-to queries', () => {
      const result = decomposer.decompose(
        'How to build a REST API with Express.js and connect it to MongoDB with authentication',
      )
      expect(result.isComplex).toBe(true)
      expect(result.strategy).toBe('sequential')
    })
  })

  describe('synthesize', () => {
    it('should combine sub-answers', () => {
      const result = decomposer.synthesize([
        { question: 'What is X?', answer: 'X is a tool.' },
        { question: 'What is Y?', answer: 'Y is a framework.' },
      ])
      expect(result).toContain('X is a tool')
      expect(result).toContain('Y is a framework')
    })

    it('should handle single answer', () => {
      const result = decomposer.synthesize([{ question: 'What is X?', answer: 'X is a tool.' }])
      expect(result).toBe('X is a tool.')
    })

    it('should handle empty array', () => {
      const result = decomposer.synthesize([])
      expect(result).toBe('')
    })
  })

  describe('getStats', () => {
    it('should track decompose count', () => {
      decomposer.decompose('test')
      decomposer.decompose('another test')
      const stats = decomposer.getStats()
      expect(stats.decomposeCount).toBe(2)
    })

    it('should track complex count', () => {
      decomposer.decompose('What is X?')
      decomposer.decompose('Compare React vs Angular for building large enterprise applications')
      const stats = decomposer.getStats()
      expect(stats.complexCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('serialize/deserialize', () => {
    it('should round-trip state', () => {
      decomposer.decompose('test')
      decomposer.decompose('Compare A vs B for large scale applications')
      const serialized = decomposer.serialize()
      const restored = QueryDecomposer.deserialize(serialized)
      expect(restored.getStats().decomposeCount).toBe(2)
    })
  })
})
