import { describe, it, expect, beforeEach } from 'vitest'
import { PromptRegistry } from '../PromptRegistry.js'
import type { PromptTemplate, ModelConfig } from '../PromptRegistry.js'

function makeTemplate(overrides: Partial<PromptTemplate> = {}): PromptTemplate {
  return {
    id: 'tpl-1',
    version: '1.0.0',
    name: 'Test Template',
    template: 'Hello {{name}}, welcome to {{place}}!',
    requiredVars: ['name'],
    optionalVars: { place: 'the world' },
    category: 'greeting',
    createdAt: Date.now(),
    description: 'A test template',
    ...overrides,
  }
}

function makeConfig(overrides: Partial<ModelConfig> = {}): ModelConfig {
  return {
    id: 'cfg-1',
    version: '1.0.0',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1024,
    topP: 1,
    systemPromptId: null,
    parameters: {},
    createdAt: Date.now(),
    ...overrides,
  }
}

describe('PromptRegistry', () => {
  let registry: PromptRegistry

  beforeEach(() => {
    registry = new PromptRegistry()
  })

  // ── registerTemplate ──
  it('should register a template', () => {
    registry.registerTemplate(makeTemplate())
    expect(registry.getTemplateIds()).toContain('tpl-1')
  })

  it('should auto-activate the first registered version', () => {
    registry.registerTemplate(makeTemplate())
    expect(registry.getActiveTemplate('tpl-1')?.version).toBe('1.0.0')
  })

  it('should throw on duplicate template version', () => {
    registry.registerTemplate(makeTemplate())
    expect(() => registry.registerTemplate(makeTemplate())).toThrow(/already registered/)
  })

  it('should allow multiple versions of the same template', () => {
    registry.registerTemplate(makeTemplate())
    registry.registerTemplate(makeTemplate({ version: '2.0.0' }))
    expect(registry.getTemplateVersions('tpl-1')).toHaveLength(2)
  })

  // ── registerModelConfig ──
  it('should register a model config', () => {
    registry.registerModelConfig(makeConfig())
    expect(registry.getModelConfigIds()).toContain('cfg-1')
  })

  it('should auto-activate the first model config version', () => {
    registry.registerModelConfig(makeConfig())
    expect(registry.getActiveModelConfig('cfg-1')?.version).toBe('1.0.0')
  })

  it('should throw on duplicate model config version', () => {
    registry.registerModelConfig(makeConfig())
    expect(() => registry.registerModelConfig(makeConfig())).toThrow(/already registered/)
  })

  // ── activateTemplate ──
  it('should switch active template version', () => {
    registry.registerTemplate(makeTemplate())
    registry.registerTemplate(makeTemplate({ version: '2.0.0' }))
    registry.activateTemplate('tpl-1', '2.0.0')
    expect(registry.getActiveTemplate('tpl-1')?.version).toBe('2.0.0')
  })

  it('should throw when activating non-existent template version', () => {
    registry.registerTemplate(makeTemplate())
    expect(() => registry.activateTemplate('tpl-1', '9.9.9')).toThrow(/not found/)
  })

  // ── activateModelConfig ──
  it('should switch active model config version', () => {
    registry.registerModelConfig(makeConfig())
    registry.registerModelConfig(makeConfig({ version: '2.0.0' }))
    registry.activateModelConfig('cfg-1', '2.0.0')
    expect(registry.getActiveModelConfig('cfg-1')?.version).toBe('2.0.0')
  })

  it('should throw when activating non-existent config version', () => {
    registry.registerModelConfig(makeConfig())
    expect(() => registry.activateModelConfig('cfg-1', '9.9.9')).toThrow(/not found/)
  })

  // ── getTemplate / getActiveTemplate ──
  it('should return undefined for unknown template id', () => {
    expect(registry.getActiveTemplate('unknown')).toBeUndefined()
  })

  it('should get a specific template version', () => {
    registry.registerTemplate(makeTemplate())
    expect(registry.getTemplate('tpl-1', '1.0.0')?.name).toBe('Test Template')
  })

  it('should return undefined for unknown template version', () => {
    registry.registerTemplate(makeTemplate())
    expect(registry.getTemplate('tpl-1', '9.9.9')).toBeUndefined()
  })

  // ── getTemplateVersions ──
  it('should return empty array for unknown id', () => {
    expect(registry.getTemplateVersions('unknown')).toEqual([])
  })

  // ── render ──
  it('should render a template with required and optional vars', () => {
    registry.registerTemplate(makeTemplate())
    const result = registry.render('tpl-1', { name: 'Alice' })
    expect(result.text).toBe('Hello Alice, welcome to the world!')
    expect(result.templateId).toBe('tpl-1')
  })

  it('should override optional vars with provided values', () => {
    registry.registerTemplate(makeTemplate())
    const result = registry.render('tpl-1', { name: 'Bob', place: 'Mars' })
    expect(result.text).toBe('Hello Bob, welcome to Mars!')
  })

  it('should throw when required variable is missing', () => {
    registry.registerTemplate(makeTemplate())
    expect(() => registry.render('tpl-1', {})).toThrow(/Missing required variable/)
  })

  it('should throw when rendering unknown template', () => {
    expect(() => registry.render('unknown')).toThrow(/No active template/)
  })

  // ── serialize / deserialize ──
  it('should round-trip through serialize and deserialize', () => {
    registry.registerTemplate(makeTemplate())
    registry.registerModelConfig(makeConfig())
    const data = registry.serialize()

    const registry2 = new PromptRegistry()
    registry2.deserialize(data)

    expect(registry2.getActiveTemplate('tpl-1')?.version).toBe('1.0.0')
    expect(registry2.getActiveModelConfig('cfg-1')?.version).toBe('1.0.0')
  })

  it('should handle deserializing empty data', () => {
    registry.registerTemplate(makeTemplate())
    registry.deserialize({})
    expect(registry.getTemplateIds()).toHaveLength(0)
  })

  // ── clear ──
  it('should clear all data', () => {
    registry.registerTemplate(makeTemplate())
    registry.registerModelConfig(makeConfig())
    registry.clear()
    expect(registry.getTemplateIds()).toHaveLength(0)
    expect(registry.getModelConfigIds()).toHaveLength(0)
  })

  // ── getModelConfig ──
  it('should return undefined for unknown model config version', () => {
    registry.registerModelConfig(makeConfig())
    expect(registry.getModelConfig('cfg-1', '9.9.9')).toBeUndefined()
  })
})
