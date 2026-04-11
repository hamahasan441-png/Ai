import { describe, it, expect, beforeEach } from 'vitest'
import { CounterfactualReasoner } from '../CounterfactualReasoner.js'

describe('CounterfactualReasoner', () => {
  let reasoner: CounterfactualReasoner

  beforeEach(() => {
    reasoner = new CounterfactualReasoner()
  })

  it('should create instance', () => {
    expect(reasoner).toBeInstanceOf(CounterfactualReasoner)
  })

  it('should detect counterfactual with "what if"', () => {
    expect(reasoner.isCounterfactual('What if we used microservices?')).toBe(true)
  })

  it('should detect counterfactual with "suppose"', () => {
    expect(reasoner.isCounterfactual('Suppose we switched to Python')).toBe(true)
  })

  it('should not detect non-counterfactual', () => {
    expect(reasoner.isCounterfactual('What is Python?')).toBe(false)
  })

  it('should analyze architecture scenario', () => {
    const result = reasoner.analyze('What if we switched from monolith to microservices?')
    expect(result.isCounterfactual).toBe(true)
    expect(result.implications.length).toBeGreaterThan(0)
    expect(result.risks.length).toBeGreaterThan(0)
  })

  it('should analyze language scenario', () => {
    const result = reasoner.analyze('What if we used Python instead of Java?')
    expect(result.isCounterfactual).toBe(true)
    expect(result.implications.length).toBeGreaterThan(0)
  })

  it('should analyze database scenario', () => {
    const result = reasoner.analyze('What if we switched to MongoDB from PostgreSQL?')
    expect(result.isCounterfactual).toBe(true)
  })

  it('should analyze scaling scenario', () => {
    const result = reasoner.analyze('What would happen if traffic increases 10x?')
    expect(result.isCounterfactual).toBe(true)
  })

  it('should extract premise', () => {
    const result = reasoner.analyze('What if we used Kubernetes for orchestration?')
    expect(result.premise.length).toBeGreaterThan(0)
  })

  it('should return alternatives', () => {
    const result = reasoner.analyze('What if we switched to serverless on AWS?')
    expect(result.alternatives.length).toBeGreaterThan(0)
  })

  it('should handle non-counterfactual gracefully', () => {
    const result = reasoner.analyze('Tell me about Python')
    expect(result.isCounterfactual).toBe(false)
  })

  it('should serialize/deserialize', () => {
    reasoner.analyze('What if we used microservices?')
    const serialized = reasoner.serialize()
    const restored = CounterfactualReasoner.deserialize(serialized)
    expect(restored.getStats().analyzeCount).toBe(1)
  })

  it('should track stats', () => {
    reasoner.analyze('What if we used Python?')
    reasoner.analyze('Tell me about JS')
    const stats = reasoner.getStats()
    expect(stats.analyzeCount).toBe(2)
    expect(stats.counterfactualCount).toBe(1)
  })
})
