# Plugin Development Guide

## Plugin Manifest

```typescript
const manifest: PluginManifest = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  description: 'Does something useful',
  author: 'Your Name',
  permissions: ['knowledge:read', 'tools:execute'],
  dependencies: [],       // other plugin IDs
  entryPoint: 'index.ts',
}
```

## Permissions

| Permission | Description |
|-----------|-------------|
| `knowledge:read` | Read from knowledge base |
| `knowledge:write` | Write to knowledge base |
| `tools:execute` | Execute tools |
| `tools:register` | Register new tools |
| `config:read` | Read configuration |
| `config:write` | Modify configuration |
| `network:outbound` | Make external HTTP requests |
| `storage:read` | Read plugin storage |
| `storage:write` | Write plugin storage |
| `events:subscribe` | Subscribe to system events |
| `events:publish` | Publish system events |

## Lifecycle Hooks

```typescript
import { definePlugin } from '../plugins/PluginSDK'

export default definePlugin({
  manifest: { id: 'translator', name: 'Translator', version: '1.0.0', permissions: ['knowledge:read'] },

  async onInstall(sdk) {
    // One-time setup (create storage, register defaults)
  },

  async onActivate(sdk) {
    // Plugin activated (register tools, commands, knowledge)
    sdk.registerTool('translate', { /* tool config */ })
  },

  async onDeactivate(sdk) {
    // Plugin deactivated (cleanup resources)
  },

  async onUninstall(sdk) {
    // Plugin removed (delete storage, cleanup)
  },
})
```

## Per-Plugin Storage

Each plugin gets isolated key-value storage:

```typescript
async onActivate(sdk) {
  await sdk.storage.set('key', { data: 'value' })
  const val = await sdk.storage.get('key')
  await sdk.storage.delete('key')
  const keys = await sdk.storage.list()
}
```

## Dependency Resolution

Plugins can declare dependencies on other plugins. The SDK resolves the install/activate order automatically using topological sort. Circular dependencies are detected and rejected.

## Testing Plugins

```typescript
import { PluginSDK } from '../plugins/PluginSDK'

const sdk = new PluginSDK()
await sdk.register(myPluginManifest)
await sdk.activate('my-plugin')
// Assert behavior
await sdk.deactivate('my-plugin')
```
