import { describe, it, expect, beforeEach } from 'vitest'
import { PluginSDK, definePlugin, type PluginDefinition } from '../../plugins/PluginSDK.js'

function createTestPlugin(overrides?: Partial<PluginDefinition>): PluginDefinition {
  return definePlugin({
    manifest: {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      permissions: ['knowledge:read'],
      ...overrides?.manifest,
    },
    ...overrides,
  })
}

describe('PluginSDK', () => {
  let sdk: PluginSDK

  beforeEach(() => {
    sdk = new PluginSDK({ autoGrantPermissions: true })
  })

  describe('register', () => {
    it('registers a valid plugin', () => {
      const plugin = createTestPlugin()
      sdk.register(plugin)
      expect(sdk.getPlugin('test-plugin')?.state).toBe('registered')
    })

    it('rejects duplicate plugins', () => {
      sdk.register(createTestPlugin())
      expect(() => sdk.register(createTestPlugin())).toThrow('already registered')
    })

    it('validates plugin ID format', () => {
      expect(() =>
        sdk.register(
          createTestPlugin({
            manifest: {
              id: 'INVALID ID',
              name: 'Test',
              version: '1.0.0',
              description: 'test',
              permissions: [],
            },
          }),
        ),
      ).toThrow('Invalid plugin ID')
    })

    it('validates version format', () => {
      expect(() =>
        sdk.register(
          createTestPlugin({
            manifest: {
              id: 'test',
              name: 'Test',
              version: 'not-semver',
              description: 'test',
              permissions: [],
            },
          }),
        ),
      ).toThrow('Invalid plugin version')
    })

    it('validates required fields', () => {
      expect(() =>
        sdk.register(
          createTestPlugin({
            manifest: {
              id: 'test',
              name: '',
              version: '1.0.0',
              description: 'test',
              permissions: [],
            },
          }),
        ),
      ).toThrow('name is required')
    })

    it('checks dependencies exist', () => {
      expect(() =>
        sdk.register(
          createTestPlugin({
            manifest: {
              id: 'dependent',
              name: 'Dependent',
              version: '1.0.0',
              description: 'test',
              permissions: [],
              dependencies: { 'missing-dep': '>=1.0.0' },
            },
          }),
        ),
      ).toThrow("depends on 'missing-dep'")
    })
  })

  describe('activate', () => {
    it('activates a registered plugin', async () => {
      sdk.register(createTestPlugin())
      await sdk.activate('test-plugin')
      expect(sdk.getPlugin('test-plugin')?.state).toBe('active')
    })

    it('calls onInstall and onActivate', async () => {
      let installed = false
      let activated = false

      sdk.register(
        createTestPlugin({
          lifecycle: {
            onInstall: () => {
              installed = true
            },
            onActivate: () => {
              activated = true
            },
          },
        }),
      )

      await sdk.activate('test-plugin')
      expect(installed).toBe(true)
      expect(activated).toBe(true)
    })

    it('activates dependencies first', async () => {
      const order: string[] = []

      sdk.register(
        definePlugin({
          manifest: {
            id: 'base-plugin',
            name: 'Base',
            version: '1.0.0',
            description: 'base',
            permissions: [],
          },
          lifecycle: {
            onActivate: () => {
              order.push('base')
            },
          },
        }),
      )

      sdk.register(
        definePlugin({
          manifest: {
            id: 'child-plugin',
            name: 'Child',
            version: '1.0.0',
            description: 'child',
            permissions: [],
            dependencies: { 'base-plugin': '>=1.0.0' },
          },
          lifecycle: {
            onActivate: () => {
              order.push('child')
            },
          },
        }),
      )

      await sdk.activate('child-plugin')
      expect(order).toEqual(['base', 'child'])
    })

    it('sets error state on activation failure', async () => {
      sdk.register(
        createTestPlugin({
          lifecycle: {
            onActivate: () => {
              throw new Error('activation failed')
            },
          },
        }),
      )

      await expect(sdk.activate('test-plugin')).rejects.toThrow('activation failed')
      expect(sdk.getPlugin('test-plugin')?.state).toBe('error')
      expect(sdk.getPlugin('test-plugin')?.error).toBe('activation failed')
    })

    it('is idempotent for already active plugins', async () => {
      let count = 0
      sdk.register(
        createTestPlugin({
          lifecycle: {
            onActivate: () => {
              count++
            },
          },
        }),
      )

      await sdk.activate('test-plugin')
      await sdk.activate('test-plugin')
      expect(count).toBe(1)
    })

    it('throws for unregistered plugins', async () => {
      await expect(sdk.activate('nonexistent')).rejects.toThrow('not registered')
    })
  })

  describe('deactivate', () => {
    it('deactivates an active plugin', async () => {
      sdk.register(createTestPlugin())
      await sdk.activate('test-plugin')
      await sdk.deactivate('test-plugin')
      expect(sdk.getPlugin('test-plugin')?.state).toBe('inactive')
    })

    it('calls onDeactivate', async () => {
      let deactivated = false
      sdk.register(
        createTestPlugin({
          lifecycle: {
            onDeactivate: () => {
              deactivated = true
            },
          },
        }),
      )

      await sdk.activate('test-plugin')
      await sdk.deactivate('test-plugin')
      expect(deactivated).toBe(true)
    })

    it('prevents deactivating a dependency', async () => {
      sdk.register(
        definePlugin({
          manifest: { id: 'dep', name: 'Dep', version: '1.0.0', description: 'd', permissions: [] },
        }),
      )
      sdk.register(
        definePlugin({
          manifest: {
            id: 'user',
            name: 'User',
            version: '1.0.0',
            description: 'u',
            permissions: [],
            dependencies: { dep: '>=1.0.0' },
          },
        }),
      )

      await sdk.activate('user')
      await expect(sdk.deactivate('dep')).rejects.toThrow("plugin 'user' depends on it")
    })
  })

  describe('uninstall', () => {
    it('removes a plugin', async () => {
      sdk.register(createTestPlugin())
      await sdk.activate('test-plugin')
      await sdk.uninstall('test-plugin')
      expect(sdk.getPlugin('test-plugin')).toBeUndefined()
    })

    it('calls onDeactivate then onUninstall', async () => {
      const order: string[] = []
      sdk.register(
        createTestPlugin({
          lifecycle: {
            onDeactivate: () => {
              order.push('deactivate')
            },
            onUninstall: () => {
              order.push('uninstall')
            },
          },
        }),
      )

      await sdk.activate('test-plugin')
      await sdk.uninstall('test-plugin')
      expect(order).toEqual(['deactivate', 'uninstall'])
    })
  })

  describe('listPlugins', () => {
    it('lists all registered plugins', () => {
      sdk.register(createTestPlugin())
      sdk.register(
        definePlugin({
          manifest: {
            id: 'another-plugin',
            name: 'Another',
            version: '2.0.0',
            description: 'another',
            permissions: [],
          },
        }),
      )

      const list = sdk.listPlugins()
      expect(list).toHaveLength(2)
      expect(list[0]?.id).toBe('test-plugin')
      expect(list[1]?.id).toBe('another-plugin')
    })
  })

  describe('getActiveTools', () => {
    it('returns tools from active plugins only', async () => {
      sdk.register(
        createTestPlugin({
          tools: [
            {
              name: 'my-tool',
              description: 'A tool',
              execute: async () => ({ result: 'ok' }),
            },
          ],
        }),
      )

      expect(sdk.getActiveTools()).toHaveLength(0)

      await sdk.activate('test-plugin')
      const tools = sdk.getActiveTools()
      expect(tools).toHaveLength(1)
      expect(tools[0]?.name).toBe('my-tool')
      expect(tools[0]?.pluginId).toBe('test-plugin')
    })
  })

  describe('getActiveCommands', () => {
    it('returns commands from active plugins', async () => {
      sdk.register(
        createTestPlugin({
          commands: [
            {
              name: '/my-command',
              description: 'A command',
              execute: async () => 'result',
            },
          ],
        }),
      )

      await sdk.activate('test-plugin')
      const commands = sdk.getActiveCommands()
      expect(commands).toHaveLength(1)
      expect(commands[0]?.name).toBe('/my-command')
    })
  })

  describe('getActiveKnowledge', () => {
    it('returns knowledge from active plugins', async () => {
      sdk.register(
        createTestPlugin({
          knowledge: [
            {
              category: 'test_kb',
              keywords: 'test knowledge plugin',
              content: 'This is test knowledge from a plugin',
              weight: 0.9,
            },
          ],
        }),
      )

      await sdk.activate('test-plugin')
      const knowledge = sdk.getActiveKnowledge()
      expect(knowledge).toHaveLength(1)
      expect(knowledge[0]?.category).toBe('test_kb')
      expect(knowledge[0]?.pluginId).toBe('test-plugin')
    })
  })

  describe('permissions', () => {
    it('grants requested permissions', () => {
      const noAutoSdk = new PluginSDK({ autoGrantPermissions: false })
      noAutoSdk.register(createTestPlugin())
      noAutoSdk.grantPermissions('test-plugin', ['knowledge:read'])
      const info = noAutoSdk.getPlugin('test-plugin')
      expect(info).toBeDefined()
    })
  })

  describe('plugin storage', () => {
    it('provides per-plugin storage via lifecycle', async () => {
      let storedValue: unknown

      sdk.register(
        createTestPlugin({
          lifecycle: {
            onActivate: ctx => {
              ctx.storage.set('key', 'value')
              storedValue = ctx.storage.get('key')
            },
          },
        }),
      )

      await sdk.activate('test-plugin')
      expect(storedValue).toBe('value')
    })
  })
})
