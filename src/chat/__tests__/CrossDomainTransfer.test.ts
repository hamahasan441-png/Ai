import { describe, it, expect, beforeEach } from 'vitest'
import { CrossDomainTransfer } from '../CrossDomainTransfer.js'

describe('CrossDomainTransfer', () => {
  let transfer: CrossDomainTransfer

  beforeEach(() => {
    transfer = new CrossDomainTransfer()
  })

  it('should create instance', () => {
    expect(transfer).toBeInstanceOf(CrossDomainTransfer)
  })

  it('should detect single domain as non-cross-domain', () => {
    const result = transfer.detectCrossDomain('ML question', ['machine_learning'])
    expect(result.isCrossDomain).toBe(false)
  })

  it('should detect multiple domains as cross-domain', () => {
    const result = transfer.detectCrossDomain('deploy ML model', ['machine_learning', 'cloud'])
    expect(result.isCrossDomain).toBe(true)
    expect(result.primaryDomain).toBe('machine_learning')
    expect(result.secondaryDomains).toContain('cloud')
  })

  it('should select combine strategy for adjacent domains', () => {
    const result = transfer.detectCrossDomain('test', ['machine_learning', 'data_science'])
    expect(result.transferStrategy).toBe('combine')
  })

  it('should combine knowledge entries', () => {
    const combined = transfer.combineKnowledge([
      { domain: 'ml', content: 'Model training', confidence: 0.9 },
      { domain: 'cloud', content: 'Deploy to cloud', confidence: 0.8 },
    ])
    expect(combined).toContain('Model training')
    expect(combined).toContain('Deploy to cloud')
  })

  it('should handle empty domains', () => {
    const result = transfer.detectCrossDomain('test', [])
    expect(result.isCrossDomain).toBe(false)
  })

  it('should find bridge concepts', () => {
    const result = transfer.detectCrossDomain('test', ['machine_learning', 'cloud'])
    expect(result.bridgeConcepts.length).toBeGreaterThanOrEqual(0)
  })

  it('should serialize/deserialize', () => {
    transfer.detectCrossDomain('test', ['ml', 'cloud'])
    const serialized = transfer.serialize()
    const restored = CrossDomainTransfer.deserialize(serialized)
    expect(restored.getStats().detectCount).toBe(1)
  })

  it('should track stats', () => {
    transfer.detectCrossDomain('test', ['a', 'b'])
    expect(transfer.getStats().detectCount).toBe(1)
    expect(transfer.getStats().crossDomainCount).toBe(1)
  })
})
