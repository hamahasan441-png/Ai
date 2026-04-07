import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../utils/settings/settings.js', () => ({
  getSettings_DEPRECATED: () => ({}),
  getInitialSettings: () => ({}),
}))

import { registerCorePlugins } from '../bundled/corePlugins.js'
import {
  getBuiltinPlugins,
  getBuiltinPluginDefinition,
  isBuiltinPluginId,
  clearBuiltinPlugins,
  getBuiltinPluginSkillCommands,
} from '../builtinPlugins.js'

const EXPECTED_PLUGIN_NAMES = [
  'code-formatter',
  'doc-generator',
  'test-runner',
  'git-helper',
  'linter',
  'translator',
] as const

beforeEach(() => {
  clearBuiltinPlugins()
  registerCorePlugins()
})

// ---------------------------------------------------------------------------
// 1. Plugin Registration
// ---------------------------------------------------------------------------
describe('Plugin Registration', () => {
  it('registerCorePlugins does not throw', () => {
    clearBuiltinPlugins()
    expect(() => registerCorePlugins()).not.toThrow()
  })

  it('calling registerCorePlugins twice does not throw (idempotent)', () => {
    expect(() => registerCorePlugins()).not.toThrow()
  })

  it('registers exactly 6 plugins', () => {
    const { enabled, disabled } = getBuiltinPlugins()
    expect(enabled.length + disabled.length).toBe(6)
  })

  it('getBuiltinPlugins returns enabled plugins after registration', () => {
    const { enabled } = getBuiltinPlugins()
    expect(enabled.length).toBeGreaterThan(0)
  })

  it.each(EXPECTED_PLUGIN_NAMES)(
    'registers the "%s" plugin',
    (name) => {
      const def = getBuiltinPluginDefinition(name)
      expect(def).toBeDefined()
    },
  )

  it('each plugin has a name', () => {
    for (const name of EXPECTED_PLUGIN_NAMES) {
      const def = getBuiltinPluginDefinition(name)
      expect(def?.name).toBe(name)
    }
  })

  it('each plugin has a description', () => {
    for (const name of EXPECTED_PLUGIN_NAMES) {
      const def = getBuiltinPluginDefinition(name)
      expect(def?.description).toBeTruthy()
    }
  })

  it('each plugin has skills', () => {
    for (const name of EXPECTED_PLUGIN_NAMES) {
      const def = getBuiltinPluginDefinition(name)
      expect(def?.skills?.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('getBuiltinPluginDefinition returns undefined for unknown names', () => {
    expect(getBuiltinPluginDefinition('nonexistent')).toBeUndefined()
  })

  it('clearBuiltinPlugins removes all plugins', () => {
    clearBuiltinPlugins()
    const { enabled, disabled } = getBuiltinPlugins()
    expect(enabled.length + disabled.length).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// 2. Plugin Properties
// ---------------------------------------------------------------------------
describe('Plugin Properties', () => {
  it('code-formatter has defaultEnabled: true', () => {
    const def = getBuiltinPluginDefinition('code-formatter')
    // defaultEnabled is either explicitly true or undefined (defaults to true)
    expect(def?.defaultEnabled ?? true).toBe(true)
  })

  it('doc-generator has defaultEnabled: true', () => {
    const def = getBuiltinPluginDefinition('doc-generator')
    expect(def?.defaultEnabled ?? true).toBe(true)
  })

  it('test-runner has defaultEnabled: true', () => {
    const def = getBuiltinPluginDefinition('test-runner')
    expect(def?.defaultEnabled ?? true).toBe(true)
  })

  it('git-helper has defaultEnabled: true', () => {
    const def = getBuiltinPluginDefinition('git-helper')
    expect(def?.defaultEnabled ?? true).toBe(true)
  })

  it('linter has defaultEnabled: true', () => {
    const def = getBuiltinPluginDefinition('linter')
    expect(def?.defaultEnabled ?? true).toBe(true)
  })

  it('translator has defaultEnabled: false (opt-in)', () => {
    const def = getBuiltinPluginDefinition('translator')
    expect(def?.defaultEnabled).toBe(false)
  })

  it('translator appears in disabled list by default', () => {
    const { disabled } = getBuiltinPlugins()
    const names = disabled.map((p) => p.name)
    expect(names).toContain('translator')
  })

  it('enabled-by-default plugins appear in the enabled list', () => {
    const { enabled } = getBuiltinPlugins()
    const names = enabled.map((p) => p.name)
    expect(names).toContain('code-formatter')
    expect(names).toContain('doc-generator')
    expect(names).toContain('test-runner')
    expect(names).toContain('git-helper')
    expect(names).toContain('linter')
  })

  it('each plugin has at least one skill', () => {
    for (const name of EXPECTED_PLUGIN_NAMES) {
      const def = getBuiltinPluginDefinition(name)
      expect(def?.skills).toBeDefined()
      expect(def!.skills!.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('skills have a name property', () => {
    for (const name of EXPECTED_PLUGIN_NAMES) {
      const def = getBuiltinPluginDefinition(name)
      for (const skill of def!.skills!) {
        expect(skill.name).toBeTruthy()
      }
    }
  })

  it('skills have a description property', () => {
    for (const name of EXPECTED_PLUGIN_NAMES) {
      const def = getBuiltinPluginDefinition(name)
      for (const skill of def!.skills!) {
        expect(skill.description).toBeTruthy()
      }
    }
  })

  it('each plugin has version 1.0.0', () => {
    for (const name of EXPECTED_PLUGIN_NAMES) {
      const def = getBuiltinPluginDefinition(name)
      expect(def?.version).toBe('1.0.0')
    }
  })

  it('LoadedPlugin objects have isBuiltin set to true', () => {
    const { enabled, disabled } = getBuiltinPlugins()
    for (const plugin of [...enabled, ...disabled]) {
      expect(plugin.isBuiltin).toBe(true)
    }
  })

  it('LoadedPlugin.source follows name@builtin format', () => {
    const { enabled, disabled } = getBuiltinPlugins()
    for (const plugin of [...enabled, ...disabled]) {
      expect(plugin.source).toBe(`${plugin.name}@builtin`)
    }
  })

  it('LoadedPlugin.manifest has matching name and description', () => {
    const { enabled, disabled } = getBuiltinPlugins()
    for (const plugin of [...enabled, ...disabled]) {
      const def = getBuiltinPluginDefinition(plugin.name)
      expect(plugin.manifest.name).toBe(def?.name)
      expect(plugin.manifest.description).toBe(def?.description)
    }
  })
})

// ---------------------------------------------------------------------------
// 3. Plugin ID Format
// ---------------------------------------------------------------------------
describe('Plugin ID Format', () => {
  it('isBuiltinPluginId returns true for "code-formatter@builtin"', () => {
    expect(isBuiltinPluginId('code-formatter@builtin')).toBe(true)
  })

  it('isBuiltinPluginId returns true for any name ending with @builtin', () => {
    expect(isBuiltinPluginId('anything@builtin')).toBe(true)
  })

  it('isBuiltinPluginId returns false for "code-formatter@marketplace"', () => {
    expect(isBuiltinPluginId('code-formatter@marketplace')).toBe(false)
  })

  it('isBuiltinPluginId returns false for a plain name without @', () => {
    expect(isBuiltinPluginId('code-formatter')).toBe(false)
  })

  it('isBuiltinPluginId returns false for an empty string', () => {
    expect(isBuiltinPluginId('')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 4. Plugin Skills
// ---------------------------------------------------------------------------
describe('Plugin Skills', () => {
  it('code-formatter skill is named "format-code"', () => {
    const def = getBuiltinPluginDefinition('code-formatter')
    expect(def?.skills?.[0]?.name).toBe('format-code')
  })

  it('doc-generator skill is named "generate-docs"', () => {
    const def = getBuiltinPluginDefinition('doc-generator')
    expect(def?.skills?.[0]?.name).toBe('generate-docs')
  })

  it('test-runner skill is named "run-tests"', () => {
    const def = getBuiltinPluginDefinition('test-runner')
    expect(def?.skills?.[0]?.name).toBe('run-tests')
  })

  it('git-helper skill is named "git-assist"', () => {
    const def = getBuiltinPluginDefinition('git-helper')
    expect(def?.skills?.[0]?.name).toBe('git-assist')
  })

  it('linter skill is named "lint-code"', () => {
    const def = getBuiltinPluginDefinition('linter')
    expect(def?.skills?.[0]?.name).toBe('lint-code')
  })

  it('translator skill is named "translate-code"', () => {
    const def = getBuiltinPluginDefinition('translator')
    expect(def?.skills?.[0]?.name).toBe('translate-code')
  })

  it('code-formatter prompt contains formatting instructions', async () => {
    const def = getBuiltinPluginDefinition('code-formatter')
    const prompt = await def!.skills![0]!.getPromptForCommand('')
    const text = prompt[0]?.text ?? ''
    expect(text).toContain('formatting')
  })

  it('doc-generator prompt contains documentation instructions', async () => {
    const def = getBuiltinPluginDefinition('doc-generator')
    const prompt = await def!.skills![0]!.getPromptForCommand('')
    const text = prompt[0]?.text ?? ''
    expect(text).toContain('documentation')
  })

  it('test-runner prompt contains test execution instructions', async () => {
    const def = getBuiltinPluginDefinition('test-runner')
    const prompt = await def!.skills![0]!.getPromptForCommand('')
    const text = prompt[0]?.text ?? ''
    expect(text).toContain('test')
  })

  it('git-helper prompt contains git operation instructions', async () => {
    const def = getBuiltinPluginDefinition('git-helper')
    const prompt = await def!.skills![0]!.getPromptForCommand('')
    const text = prompt[0]?.text ?? ''
    expect(text).toContain('git')
  })

  it('linter prompt contains linting instructions', async () => {
    const def = getBuiltinPluginDefinition('linter')
    const prompt = await def!.skills![0]!.getPromptForCommand('')
    const text = prompt[0]?.text ?? ''
    expect(text).toContain('lint')
  })

  it('translator prompt contains translation instructions', async () => {
    const def = getBuiltinPluginDefinition('translator')
    const prompt = await def!.skills![0]!.getPromptForCommand('')
    const text = prompt[0]?.text ?? ''
    expect(text).toContain('Translate')
  })

  it('skill getPromptForCommand appends user args', async () => {
    const def = getBuiltinPluginDefinition('code-formatter')
    const prompt = await def!.skills![0]!.getPromptForCommand('fix my code')
    const text = prompt[0]?.text ?? ''
    expect(text).toContain('fix my code')
  })

  it('skill getPromptForCommand returns text type content', async () => {
    const def = getBuiltinPluginDefinition('code-formatter')
    const prompt = await def!.skills![0]!.getPromptForCommand('')
    expect(prompt[0]?.type).toBe('text')
  })

  it('all skills are user-invocable', () => {
    for (const name of EXPECTED_PLUGIN_NAMES) {
      const def = getBuiltinPluginDefinition(name)
      for (const skill of def!.skills!) {
        expect(skill.userInvocable).toBe(true)
      }
    }
  })

  it('getBuiltinPluginSkillCommands returns commands for enabled plugins only', () => {
    const commands = getBuiltinPluginSkillCommands()
    const commandNames = commands.map((c) => c.name)
    // 5 enabled plugins × 1 skill each = 5 commands
    expect(commands).toHaveLength(5)
    // translator is disabled by default, so its skill should not appear
    expect(commandNames).not.toContain('translate-code')
    expect(commandNames).toContain('format-code')
  })
})
