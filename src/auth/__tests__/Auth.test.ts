import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  APIUserAbortError: class APIUserAbortError extends Error {},
}))

import { RBACManager } from '../rbac.js'
import { SessionManager } from '../sessions.js'
import { ApiKeyManager } from '../apiKeys.js'

// ══════════════════════════════════════════════════════════════════════════════
// RBAC
// ══════════════════════════════════════════════════════════════════════════════

describe('RBACManager', () => {
  let rbac: RBACManager

  beforeEach(() => {
    rbac = new RBACManager()
  })

  // ── Built-in Roles ──

  describe('built-in roles', () => {
    it('should have admin role', () => {
      const role = rbac.getRole('admin')
      expect(role).toBeDefined()
      expect(role!.isBuiltin).toBe(true)
      expect(role!.permissions.has('*:*')).toBe(true)
    })

    it('should have user role', () => {
      const role = rbac.getRole('user')
      expect(role).toBeDefined()
      expect(role!.isBuiltin).toBe(true)
      expect(role!.permissions.has('*:read')).toBe(true)
      expect(role!.permissions.has('*:execute')).toBe(true)
    })

    it('should have viewer role', () => {
      const role = rbac.getRole('viewer')
      expect(role).toBeDefined()
      expect(role!.isBuiltin).toBe(true)
      expect(role!.permissions.has('*:read')).toBe(true)
    })

    it('should have plugin role', () => {
      const role = rbac.getRole('plugin')
      expect(role).toBeDefined()
      expect(role!.isBuiltin).toBe(true)
      expect(role!.permissions.has('tools:execute')).toBe(true)
      expect(role!.permissions.has('tools:read')).toBe(true)
    })

    it('should list all 4 built-in roles', () => {
      const roles = rbac.getRoles()
      expect(roles).toHaveLength(4)
      expect(roles.every(r => r.isBuiltin)).toBe(true)
    })
  })

  // ── Role Management ──

  describe('createRole', () => {
    it('should create a custom role', () => {
      const role = rbac.createRole('editor', ['docs:read', 'docs:update'], 'Can edit docs')
      expect(role.name).toBe('editor')
      expect(role.permissions.has('docs:read')).toBe(true)
      expect(role.permissions.has('docs:update')).toBe(true)
      expect(role.description).toBe('Can edit docs')
      expect(role.isBuiltin).toBe(false)
    })

    it('should throw if role name already exists', () => {
      expect(() => rbac.createRole('admin', [])).toThrow('already exists')
    })

    it('should create role with no description', () => {
      const role = rbac.createRole('minimal', ['a:read'])
      expect(role.description).toBeUndefined()
    })
  })

  describe('deleteRole', () => {
    it('should delete a custom role', () => {
      rbac.createRole('temp', ['a:read'])
      expect(rbac.deleteRole('temp')).toBe(true)
      expect(rbac.getRole('temp')).toBeUndefined()
    })

    it('should throw when deleting a built-in role', () => {
      expect(() => rbac.deleteRole('admin')).toThrow('Cannot delete built-in role')
    })

    it('should throw when deleting a non-existent role', () => {
      expect(() => rbac.deleteRole('ghost')).toThrow('not found')
    })
  })

  // ── Permission Management ──

  describe('addPermission / removePermission', () => {
    it('should add a permission to a role', () => {
      rbac.createRole('tester', [])
      rbac.addPermission('tester', { resource: 'tests', action: 'execute' })
      expect(rbac.getRole('tester')!.permissions.has('tests:execute')).toBe(true)
    })

    it('should remove a permission from a role', () => {
      rbac.createRole('editor', ['docs:read', 'docs:update'])
      rbac.removePermission('editor', { resource: 'docs', action: 'update' })
      expect(rbac.getRole('editor')!.permissions.has('docs:update')).toBe(false)
      expect(rbac.getRole('editor')!.permissions.has('docs:read')).toBe(true)
    })

    it('should throw when adding permission to non-existent role', () => {
      expect(() =>
        rbac.addPermission('missing', { resource: 'a', action: 'read' }),
      ).toThrow('not found')
    })

    it('should throw when removing permission from non-existent role', () => {
      expect(() =>
        rbac.removePermission('missing', { resource: 'a', action: 'read' }),
      ).toThrow('not found')
    })
  })

  // ── Authorization Checks ──

  describe('hasPermission', () => {
    it('admin should have any permission', () => {
      expect(rbac.hasPermission(['admin'], 'anything', 'admin')).toBe(true)
      expect(rbac.hasPermission(['admin'], 'foo', 'delete')).toBe(true)
    })

    it('user role can read and execute', () => {
      expect(rbac.hasPermission(['user'], 'files', 'read')).toBe(true)
      expect(rbac.hasPermission(['user'], 'tools', 'execute')).toBe(true)
    })

    it('user role cannot create or delete', () => {
      expect(rbac.hasPermission(['user'], 'files', 'create')).toBe(false)
      expect(rbac.hasPermission(['user'], 'files', 'delete')).toBe(false)
    })

    it('viewer can only read', () => {
      expect(rbac.hasPermission(['viewer'], 'data', 'read')).toBe(true)
      expect(rbac.hasPermission(['viewer'], 'data', 'execute')).toBe(false)
    })

    it('plugin has limited execute', () => {
      expect(rbac.hasPermission(['plugin'], 'tools', 'execute')).toBe(true)
      expect(rbac.hasPermission(['plugin'], 'tools', 'read')).toBe(true)
      expect(rbac.hasPermission(['plugin'], 'files', 'execute')).toBe(false)
    })

    it('should match with resource wildcard', () => {
      rbac.createRole('ops', ['*:delete'])
      expect(rbac.hasPermission(['ops'], 'logs', 'delete')).toBe(true)
      expect(rbac.hasPermission(['ops'], 'logs', 'read')).toBe(false)
    })

    it('should match with action wildcard', () => {
      rbac.createRole('data-admin', ['data:*'])
      expect(rbac.hasPermission(['data-admin'], 'data', 'create')).toBe(true)
      expect(rbac.hasPermission(['data-admin'], 'data', 'delete')).toBe(true)
      expect(rbac.hasPermission(['data-admin'], 'files', 'read')).toBe(false)
    })

    it('should check multiple roles', () => {
      rbac.createRole('extra', ['logs:delete'])
      expect(rbac.hasPermission(['viewer', 'extra'], 'logs', 'delete')).toBe(true)
    })

    it('should return false for unknown roles', () => {
      expect(rbac.hasPermission(['nonexistent'], 'a', 'read')).toBe(false)
    })

    it('should return false for empty roles array', () => {
      expect(rbac.hasPermission([], 'a', 'read')).toBe(false)
    })
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// SESSIONS
// ══════════════════════════════════════════════════════════════════════════════

describe('SessionManager', () => {
  let sessions: SessionManager

  beforeEach(() => {
    sessions = new SessionManager()
  })

  // ── Create ──

  describe('createSession', () => {
    it('should create a session with a UUID id', () => {
      const session = sessions.createSession('user-1', ['user'])
      expect(session.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      )
      expect(session.userId).toBe('user-1')
      expect(session.roles).toEqual(['user'])
    })

    it('should set timestamps', () => {
      const before = Date.now()
      const session = sessions.createSession('user-1', ['user'])
      const after = Date.now()

      expect(session.createdAt).toBeGreaterThanOrEqual(before)
      expect(session.createdAt).toBeLessThanOrEqual(after)
      expect(session.expiresAt).toBeGreaterThan(session.createdAt)
      expect(session.lastActivityAt).toBe(session.createdAt)
    })

    it('should support custom TTL', () => {
      const session = sessions.createSession('user-1', ['user'], 5000)
      expect(session.expiresAt - session.createdAt).toBe(5000)
    })

    it('should store metadata', () => {
      const session = sessions.createSession('user-1', ['user'], undefined, { ip: '127.0.0.1' })
      expect(session.metadata).toEqual({ ip: '127.0.0.1' })
    })

    it('should throw if userId is empty', () => {
      expect(() => sessions.createSession('', ['user'])).toThrow('userId is required')
    })
  })

  // ── Get ──

  describe('getSession', () => {
    it('should return session by id', () => {
      const created = sessions.createSession('user-1', ['user'])
      const found = sessions.getSession(created.id)
      expect(found).toBeDefined()
      expect(found!.userId).toBe('user-1')
    })

    it('should return undefined for unknown id', () => {
      expect(sessions.getSession('nope')).toBeUndefined()
    })
  })

  // ── Validate ──

  describe('validateSession', () => {
    it('should validate an active session', () => {
      const session = sessions.createSession('user-1', ['user'])
      const result = sessions.validateSession(session.id)
      expect(result.valid).toBe(true)
      expect(result.session).toBeDefined()
    })

    it('should refresh lastActivityAt on validate', () => {
      const session = sessions.createSession('user-1', ['user'])
      const originalActivity = session.lastActivityAt

      // Slight delay for timestamp difference
      const result = sessions.validateSession(session.id)
      expect(result.session!.lastActivityAt).toBeGreaterThanOrEqual(originalActivity)
    })

    it('should reject expired sessions', () => {
      const session = sessions.createSession('user-1', ['user'], 1)
      // Manually expire
      session.expiresAt = Date.now() - 1000
      const result = sessions.validateSession(session.id)
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('Session expired')
    })

    it('should return not found for missing session', () => {
      const result = sessions.validateSession('missing')
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('Session not found')
    })
  })

  // ── Revoke ──

  describe('revokeSession', () => {
    it('should revoke an existing session', () => {
      const session = sessions.createSession('user-1', ['user'])
      expect(sessions.revokeSession(session.id)).toBe(true)
      expect(sessions.getSession(session.id)).toBeUndefined()
    })

    it('should return false for unknown session', () => {
      expect(sessions.revokeSession('nope')).toBe(false)
    })
  })

  describe('revokeUserSessions', () => {
    it('should revoke all sessions for a user', () => {
      sessions.createSession('user-1', ['user'])
      sessions.createSession('user-1', ['admin'])
      sessions.createSession('user-2', ['user'])

      const count = sessions.revokeUserSessions('user-1')
      expect(count).toBe(2)
      expect(sessions.activeSessions()).toBe(1)
    })

    it('should return 0 when user has no sessions', () => {
      expect(sessions.revokeUserSessions('ghost')).toBe(0)
    })
  })

  // ── Maintenance ──

  describe('cleanExpired', () => {
    it('should remove expired sessions', () => {
      const s1 = sessions.createSession('user-1', ['user'])
      sessions.createSession('user-2', ['user'])

      // Manually expire one
      s1.expiresAt = Date.now() - 1000

      const cleaned = sessions.cleanExpired()
      expect(cleaned).toBe(1)
      expect(sessions.activeSessions()).toBe(1)
    })
  })

  describe('activeSessions', () => {
    it('should count active sessions', () => {
      sessions.createSession('user-1', ['user'])
      sessions.createSession('user-2', ['user'])
      expect(sessions.activeSessions()).toBe(2)
    })

    it('should not count expired sessions', () => {
      const s = sessions.createSession('user-1', ['user'])
      s.expiresAt = Date.now() - 1000
      expect(sessions.activeSessions()).toBe(0)
    })
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// API KEYS
// ══════════════════════════════════════════════════════════════════════════════

describe('ApiKeyManager', () => {
  let keys: ApiKeyManager

  beforeEach(() => {
    keys = new ApiKeyManager()
  })

  // ── Create ──

  describe('createKey', () => {
    it('should create a key with ai_key_ prefix', () => {
      const { key } = keys.createKey('test-key', ['user'])
      expect(key).toMatch(/^ai_key_[0-9a-f]{32}$/)
    })

    it('should return both raw key and apiKey record', () => {
      const { key, apiKey } = keys.createKey('test-key', ['user'])
      expect(key).toBeDefined()
      expect(apiKey.name).toBe('test-key')
      expect(apiKey.roles).toEqual(['user'])
    })

    it('should store prefix as first 8 characters', () => {
      const { key, apiKey } = keys.createKey('test-key', ['user'])
      expect(apiKey.prefix).toBe(key.slice(0, 8))
    })

    it('should hash the key (not store raw)', () => {
      const { key, apiKey } = keys.createKey('test-key', ['user'])
      expect(apiKey.keyHash).not.toBe(key)
      expect(apiKey.keyHash).toHaveLength(64) // SHA-256 hex
    })

    it('should apply options', () => {
      const expires = Date.now() + 60_000
      const { apiKey } = keys.createKey('limited', ['user'], { expiresAt: expires, rateLimit: 100 })
      expect(apiKey.expiresAt).toBe(expires)
      expect(apiKey.rateLimit).toBe(100)
    })

    it('should throw if name is empty', () => {
      expect(() => keys.createKey('', ['user'])).toThrow('Key name is required')
    })

    it('should generate unique keys each time', () => {
      const { key: k1 } = keys.createKey('key-1', ['user'])
      const { key: k2 } = keys.createKey('key-2', ['user'])
      expect(k1).not.toBe(k2)
    })
  })

  // ── Validate ──

  describe('validateKey', () => {
    it('should validate a correct key', () => {
      const { key } = keys.createKey('test-key', ['user'])
      const result = keys.validateKey(key)
      expect(result.valid).toBe(true)
      expect(result.apiKey).toBeDefined()
    })

    it('should reject an incorrect key', () => {
      keys.createKey('test-key', ['user'])
      const result = keys.validateKey('ai_key_0000000000000000000000000000000f')
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('Invalid API key')
    })

    it('should reject an expired key', () => {
      const { key, apiKey } = keys.createKey('test-key', ['user'], { expiresAt: Date.now() + 60_000 })
      // Manually expire
      apiKey.expiresAt = Date.now() - 1000
      const result = keys.validateKey(key)
      expect(result.valid).toBe(false)
      expect(result.reason).toBe('API key has expired')
    })

    it('should update lastUsedAt on validation', () => {
      const { key, apiKey } = keys.createKey('test-key', ['user'])
      expect(apiKey.lastUsedAt).toBeUndefined()

      keys.validateKey(key)
      expect(apiKey.lastUsedAt).toBeDefined()
      expect(apiKey.lastUsedAt).toBeGreaterThan(0)
    })
  })

  // ── Revoke ──

  describe('revokeKey', () => {
    it('should revoke an existing key', () => {
      const { key, apiKey } = keys.createKey('test-key', ['user'])
      expect(keys.revokeKey(apiKey.id)).toBe(true)

      const result = keys.validateKey(key)
      expect(result.valid).toBe(false)
    })

    it('should throw for non-existent key', () => {
      expect(() => keys.revokeKey('missing-id')).toThrow('not found')
    })
  })

  // ── Rotate ──

  describe('rotateKey', () => {
    it('should return a new key with different raw value', () => {
      const { key: oldKey, apiKey: oldApiKey } = keys.createKey('rotate-me', ['user'])
      const { key: newKey, apiKey: newApiKey } = keys.rotateKey(oldApiKey.id)

      expect(newKey).not.toBe(oldKey)
      expect(newApiKey.id).not.toBe(oldApiKey.id)
    })

    it('should preserve name and roles', () => {
      const { apiKey: old } = keys.createKey('rotate-me', ['admin', 'user'])
      const { apiKey: fresh } = keys.rotateKey(old.id)

      expect(fresh.name).toBe('rotate-me')
      expect(fresh.roles).toEqual(['admin', 'user'])
    })

    it('should invalidate the old key', () => {
      const { key: oldKey, apiKey } = keys.createKey('rotate-me', ['user'])
      keys.rotateKey(apiKey.id)

      const result = keys.validateKey(oldKey)
      expect(result.valid).toBe(false)
    })

    it('should throw for non-existent key', () => {
      expect(() => keys.rotateKey('missing')).toThrow('not found')
    })
  })

  // ── List ──

  describe('listKeys', () => {
    it('should list all keys without hashes', () => {
      keys.createKey('key-1', ['user'])
      keys.createKey('key-2', ['admin'])

      const list = keys.listKeys()
      expect(list).toHaveLength(2)
      for (const k of list) {
        expect(k).not.toHaveProperty('keyHash')
        expect(k).toHaveProperty('name')
        expect(k).toHaveProperty('prefix')
      }
    })

    it('should return empty array when no keys exist', () => {
      expect(keys.listKeys()).toEqual([])
    })
  })
})
