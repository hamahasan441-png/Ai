/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Plugin SDK — Full Plugin Lifecycle Management                                ║
 * ║                                                                              ║
 * ║  Provides a complete SDK for building and managing AI plugins:               ║
 * ║    • Plugin manifest schema with metadata                                    ║
 * ║    • Lifecycle hooks (onInstall, onActivate, onDeactivate, onUninstall)      ║
 * ║    • Permission scoping (tools, commands, knowledge, services)               ║
 * ║    • Dependency resolution between plugins                                   ║
 * ║    • Plugin registry with discovery                                          ║
 * ║    • Sandboxed execution context                                             ║
 * ║                                                                              ║
 * ║  Usage:                                                                      ║
 * ║    const sdk = new PluginSDK()                                               ║
 * ║    sdk.register(myPlugin)                                                    ║
 * ║    await sdk.activate('my-plugin')                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ──

export type PluginState = 'registered' | 'installed' | 'active' | 'inactive' | 'error'

/**
 * Permission types that a plugin can request.
 */
export type PluginPermission =
  | 'tools:read'
  | 'tools:write'
  | 'tools:execute'
  | 'commands:register'
  | 'knowledge:read'
  | 'knowledge:write'
  | 'services:cache'
  | 'services:api'
  | 'filesystem:read'
  | 'filesystem:write'
  | 'network:outbound'

/**
 * Plugin manifest — metadata describing a plugin.
 */
export interface PluginManifest {
  /** Unique plugin identifier (kebab-case) */
  id: string
  /** Display name */
  name: string
  /** Semantic version (e.g., '1.0.0') */
  version: string
  /** Short description */
  description: string
  /** Plugin author */
  author?: string
  /** License identifier */
  license?: string
  /** Minimum AI system version required */
  minSystemVersion?: string
  /** Plugin dependencies (id → version range) */
  dependencies?: Record<string, string>
  /** Permissions this plugin requires */
  permissions: PluginPermission[]
  /** Tags for discovery */
  tags?: string[]
}

/**
 * Plugin lifecycle hooks — called at each stage of the plugin lifecycle.
 */
export interface PluginLifecycle {
  /** Called when plugin is first registered */
  onInstall?: (context: PluginContext) => Promise<void> | void
  /** Called when plugin is activated */
  onActivate?: (context: PluginContext) => Promise<void> | void
  /** Called when plugin is deactivated */
  onDeactivate?: (context: PluginContext) => Promise<void> | void
  /** Called when plugin is uninstalled */
  onUninstall?: (context: PluginContext) => Promise<void> | void
  /** Called when plugin is updated to a new version */
  onUpdate?: (context: PluginContext, previousVersion: string) => Promise<void> | void
}

/**
 * Plugin definition — combines manifest with implementation.
 */
export interface PluginDefinition {
  manifest: PluginManifest
  lifecycle?: PluginLifecycle
  /** Tools provided by this plugin */
  tools?: PluginTool[]
  /** Commands provided by this plugin */
  commands?: PluginCommand[]
  /** Knowledge base entries provided by this plugin */
  knowledge?: PluginKnowledgeEntry[]
}

/**
 * Context passed to plugin lifecycle hooks.
 */
export interface PluginContext {
  /** Plugin's own manifest */
  manifest: PluginManifest
  /** Granted permissions (subset of requested) */
  grantedPermissions: PluginPermission[]
  /** Key-value storage scoped to this plugin */
  storage: PluginStorage
  /** Logger scoped to this plugin */
  log: PluginLogger
}

export interface PluginStorage {
  get(key: string): unknown | undefined
  set(key: string, value: unknown): void
  delete(key: string): boolean
  clear(): void
  keys(): string[]
}

export interface PluginLogger {
  info(msg: string, data?: Record<string, unknown>): void
  warn(msg: string, data?: Record<string, unknown>): void
  error(msg: string, data?: Record<string, unknown>): void
  debug(msg: string, data?: Record<string, unknown>): void
}

export interface PluginTool {
  name: string
  description: string
  schema?: Record<string, unknown>
  execute: (input: Record<string, unknown>, context: PluginContext) => Promise<unknown>
}

export interface PluginCommand {
  name: string
  description: string
  execute: (args: string[], context: PluginContext) => Promise<string>
}

export interface PluginKnowledgeEntry {
  category: string
  keywords: string
  content: string
  weight?: number
}

// ── Internal Types ──

interface RegisteredPlugin {
  definition: PluginDefinition
  state: PluginState
  activatedAt: number | null
  error: string | null
  storage: Map<string, unknown>
  grantedPermissions: PluginPermission[]
}

// ── Plugin SDK ──

/**
 * Plugin SDK — manages plugin lifecycle, registration, and execution.
 *
 * @example
 * ```ts
 * const sdk = new PluginSDK()
 *
 * // Register a plugin
 * sdk.register({
 *   manifest: {
 *     id: 'my-translator',
 *     name: 'My Translator Plugin',
 *     version: '1.0.0',
 *     description: 'Translates text between languages',
 *     permissions: ['services:api', 'knowledge:write'],
 *   },
 *   lifecycle: {
 *     onActivate: async (ctx) => {
 *       ctx.log.info('Translator plugin activated!')
 *     },
 *   },
 *   tools: [{
 *     name: 'translate',
 *     description: 'Translate text',
 *     execute: async (input) => ({ translated: `[translated] ${input.text}` }),
 *   }],
 * })
 *
 * // Activate
 * await sdk.activate('my-translator')
 * ```
 */
export class PluginSDK {
  private plugins = new Map<string, RegisteredPlugin>()
  private _autoGrantPermissions = false

  constructor(options?: { autoGrantPermissions?: boolean }) {
    this._autoGrantPermissions = options?.autoGrantPermissions ?? false
  }

  /**
   * Register a plugin definition.
   * Validates the manifest and checks dependencies.
   */
  register(definition: PluginDefinition): void {
    const { manifest } = definition

    // Validate manifest
    this._validateManifest(manifest)

    // Check for duplicate
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin '${manifest.id}' is already registered`)
    }

    // Check dependencies
    if (manifest.dependencies) {
      for (const depId of Object.keys(manifest.dependencies)) {
        if (!this.plugins.has(depId)) {
          throw new Error(
            `Plugin '${manifest.id}' depends on '${depId}' which is not registered. Register dependencies first.`,
          )
        }
      }
    }

    this.plugins.set(manifest.id, {
      definition,
      state: 'registered',
      activatedAt: null,
      error: null,
      storage: new Map(),
      grantedPermissions: this._autoGrantPermissions ? [...manifest.permissions] : [],
    })
  }

  /**
   * Activate a registered plugin.
   * Calls onInstall (if first activation) and onActivate lifecycle hooks.
   */
  async activate(pluginId: string): Promise<void> {
    const plugin = this._getPlugin(pluginId)

    if (plugin.state === 'active') return

    // Activate dependencies first
    const deps = plugin.definition.manifest.dependencies
    if (deps) {
      for (const depId of Object.keys(deps)) {
        const dep = this.plugins.get(depId)
        if (dep && dep.state !== 'active') {
          await this.activate(depId)
        }
      }
    }

    const context = this._createContext(plugin)

    try {
      // Call onInstall if never installed
      if (plugin.state === 'registered' && plugin.definition.lifecycle?.onInstall) {
        await plugin.definition.lifecycle.onInstall(context)
      }

      // Call onActivate
      if (plugin.definition.lifecycle?.onActivate) {
        await plugin.definition.lifecycle.onActivate(context)
      }

      plugin.state = 'active'
      plugin.activatedAt = Date.now()
      plugin.error = null
    } catch (err: unknown) {
      plugin.state = 'error'
      plugin.error = err instanceof Error ? err.message : String(err)
      throw err
    }
  }

  /**
   * Deactivate a plugin.
   * Calls onDeactivate lifecycle hook.
   */
  async deactivate(pluginId: string): Promise<void> {
    const plugin = this._getPlugin(pluginId)

    if (plugin.state !== 'active') return

    // Check if other active plugins depend on this one
    for (const [id, p] of this.plugins) {
      if (p.state === 'active' && p.definition.manifest.dependencies?.[pluginId]) {
        throw new Error(`Cannot deactivate '${pluginId}' — plugin '${id}' depends on it`)
      }
    }

    const context = this._createContext(plugin)

    try {
      if (plugin.definition.lifecycle?.onDeactivate) {
        await plugin.definition.lifecycle.onDeactivate(context)
      }
      plugin.state = 'inactive'
    } catch (err: unknown) {
      plugin.state = 'error'
      plugin.error = err instanceof Error ? err.message : String(err)
      throw err
    }
  }

  /**
   * Uninstall a plugin.
   * Deactivates first, calls onUninstall, then removes from registry.
   */
  async uninstall(pluginId: string): Promise<void> {
    const plugin = this._getPlugin(pluginId)

    // Deactivate first if active
    if (plugin.state === 'active') {
      await this.deactivate(pluginId)
    }

    const context = this._createContext(plugin)

    if (plugin.definition.lifecycle?.onUninstall) {
      await plugin.definition.lifecycle.onUninstall(context)
    }

    this.plugins.delete(pluginId)
  }

  /**
   * Grant permissions to a plugin.
   */
  grantPermissions(pluginId: string, permissions: PluginPermission[]): void {
    const plugin = this._getPlugin(pluginId)
    const requested = plugin.definition.manifest.permissions

    for (const perm of permissions) {
      if (requested.includes(perm) && !plugin.grantedPermissions.includes(perm)) {
        plugin.grantedPermissions.push(perm)
      }
    }
  }

  /**
   * Get a registered plugin's info.
   */
  getPlugin(pluginId: string): { manifest: PluginManifest; state: PluginState; error: string | null } | undefined {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return undefined

    return {
      manifest: plugin.definition.manifest,
      state: plugin.state,
      error: plugin.error,
    }
  }

  /**
   * List all registered plugins.
   */
  listPlugins(): Array<{ id: string; name: string; state: PluginState; version: string }> {
    return Array.from(this.plugins.values()).map((p) => ({
      id: p.definition.manifest.id,
      name: p.definition.manifest.name,
      state: p.state,
      version: p.definition.manifest.version,
    }))
  }

  /**
   * Get all active tools from all active plugins.
   */
  getActiveTools(): Array<PluginTool & { pluginId: string }> {
    const tools: Array<PluginTool & { pluginId: string }> = []
    for (const [id, plugin] of this.plugins) {
      if (plugin.state === 'active' && plugin.definition.tools) {
        for (const tool of plugin.definition.tools) {
          tools.push({ ...tool, pluginId: id })
        }
      }
    }
    return tools
  }

  /**
   * Get all active commands from all active plugins.
   */
  getActiveCommands(): Array<PluginCommand & { pluginId: string }> {
    const commands: Array<PluginCommand & { pluginId: string }> = []
    for (const [id, plugin] of this.plugins) {
      if (plugin.state === 'active' && plugin.definition.commands) {
        for (const cmd of plugin.definition.commands) {
          commands.push({ ...cmd, pluginId: id })
        }
      }
    }
    return commands
  }

  /**
   * Get all knowledge entries from all active plugins.
   */
  getActiveKnowledge(): Array<PluginKnowledgeEntry & { pluginId: string }> {
    const entries: Array<PluginKnowledgeEntry & { pluginId: string }> = []
    for (const [id, plugin] of this.plugins) {
      if (plugin.state === 'active' && plugin.definition.knowledge) {
        for (const entry of plugin.definition.knowledge) {
          entries.push({ ...entry, pluginId: id })
        }
      }
    }
    return entries
  }

  // ── Internal ──

  private _getPlugin(pluginId: string): RegisteredPlugin {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin '${pluginId}' is not registered`)
    }
    return plugin
  }

  private _validateManifest(manifest: PluginManifest): void {
    if (!manifest.id || !/^[a-z0-9-]+$/.test(manifest.id)) {
      throw new Error(`Invalid plugin ID '${manifest.id}' — must be kebab-case (a-z, 0-9, hyphens)`)
    }
    if (!manifest.name) {
      throw new Error('Plugin name is required')
    }
    if (!manifest.version || !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      throw new Error(`Invalid plugin version '${manifest.version}' — must be semver (e.g., 1.0.0)`)
    }
    if (!manifest.description) {
      throw new Error('Plugin description is required')
    }
    if (!Array.isArray(manifest.permissions)) {
      throw new Error('Plugin permissions must be an array')
    }
  }

  private _createContext(plugin: RegisteredPlugin): PluginContext {
    const storage: PluginStorage = {
      get: (key: string) => plugin.storage.get(key),
      set: (key: string, value: unknown) => plugin.storage.set(key, value),
      delete: (key: string) => plugin.storage.delete(key),
      clear: () => plugin.storage.clear(),
      keys: () => Array.from(plugin.storage.keys()),
    }

    const log: PluginLogger = {
      info: (msg: string, data?: Record<string, unknown>) =>
        this._logPluginMessage('info', plugin.definition.manifest.id, msg, data),
      warn: (msg: string, data?: Record<string, unknown>) =>
        this._logPluginMessage('warn', plugin.definition.manifest.id, msg, data),
      error: (msg: string, data?: Record<string, unknown>) =>
        this._logPluginMessage('error', plugin.definition.manifest.id, msg, data),
      debug: (msg: string, data?: Record<string, unknown>) =>
        this._logPluginMessage('debug', plugin.definition.manifest.id, msg, data),
    }

    return {
      manifest: plugin.definition.manifest,
      grantedPermissions: plugin.grantedPermissions,
      storage,
      log,
    }
  }

  private _logPluginMessage(
    _level: string,
    _pluginId: string,
    _msg: string,
    _data?: Record<string, unknown>,
  ): void {
    // Log plugin messages through the application logger
    // This is intentionally a no-op in the SDK — the host application
    // can wire this up to the structured logger
  }
}

// ── Helper ──

/**
 * Create a plugin definition with type checking.
 *
 * @example
 * ```ts
 * const myPlugin = definePlugin({
 *   manifest: { id: 'my-plugin', ... },
 *   tools: [{ name: 'my-tool', ... }],
 * })
 * ```
 */
export function definePlugin(definition: PluginDefinition): PluginDefinition {
  return definition
}
