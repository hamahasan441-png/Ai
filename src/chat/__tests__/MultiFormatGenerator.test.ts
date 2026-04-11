import { describe, it, expect, beforeEach } from 'vitest'
import { MultiFormatGenerator } from '../MultiFormatGenerator.js'

describe('MultiFormatGenerator', () => {
  let generator: MultiFormatGenerator

  beforeEach(() => {
    generator = new MultiFormatGenerator()
  })

  it('should create instance', () => {
    expect(generator).toBeInstanceOf(MultiFormatGenerator)
  })

  it('should detect code format', () => {
    const result = generator.detectFormat('Write a function to sort an array')
    expect(result.recommendedFormat).toBe('code')
  })

  it('should detect table format for comparisons', () => {
    const result = generator.detectFormat('Compare the pros and cons of React')
    expect(['table', 'comparison']).toContain(result.recommendedFormat)
  })

  it('should detect list format', () => {
    const result = generator.detectFormat('List all the types of databases')
    expect(result.recommendedFormat).toBe('list')
  })

  it('should detect steps format', () => {
    const result = generator.detectFormat('How to deploy a Node.js app step by step')
    expect(result.recommendedFormat).toBe('steps')
  })

  it('should default to plain for simple queries', () => {
    const result = generator.detectFormat('Hello')
    expect(result.recommendedFormat).toBe('plain')
  })

  it('should format as code block', () => {
    const formatted = generator.format('const x = 1;', 'code')
    expect(formatted).toContain('```')
  })

  it('should not double-wrap code blocks', () => {
    const formatted = generator.format('```\nconst x = 1;\n```', 'code')
    const count = (formatted.match(/```/g) || []).length
    expect(count).toBe(2) // only the original pair
  })

  it('should format as list', () => {
    const formatted = generator.format('First item. Second item. Third item.', 'list')
    expect(formatted).toContain('•')
  })

  it('should format as steps', () => {
    const formatted = generator.format('Install Node. Create project. Write code.', 'steps')
    expect(formatted).toContain('1.')
    expect(formatted).toContain('2.')
  })

  it('should return plain text unchanged', () => {
    const text = 'Hello world'
    const formatted = generator.format(text, 'plain')
    expect(formatted).toBe(text)
  })

  it('should handle empty query', () => {
    const result = generator.detectFormat('')
    expect(result.recommendedFormat).toBe('plain')
  })

  it('should serialize/deserialize', () => {
    generator.detectFormat('Write code')
    const serialized = generator.serialize()
    const restored = MultiFormatGenerator.deserialize(serialized)
    expect(restored.getStats().detectCount).toBe(1)
  })

  it('should track stats', () => {
    generator.detectFormat('test')
    generator.format('text', 'code')
    const stats = generator.getStats()
    expect(stats.detectCount).toBe(1)
    expect(stats.formatCount).toBe(1)
  })
})
