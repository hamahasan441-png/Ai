/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Role-Based Access Control (RBAC)                                            ║
 * ║                                                                              ║
 * ║  Manages roles, permissions, and authorization checks for the AI system.     ║
 * ║  Supports wildcard matching, built-in roles, and dynamic role management.    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { AiError, AiErrorCode } from '../utils/errors.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'admin'

export interface Permission {
  resource: string
  action: PermissionAction
  conditions?: Record<string, unknown>
}

export interface Role {
  name: string
  permissions: Set<string>
  description?: string
  isBuiltin: boolean
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/** Encode a permission as a canonical string `resource:action`. */
function permissionKey(resource: string, action: string): string {
  return `${resource}:${action}`
}

/**
 * Check whether `held` permission string matches `required`.
 * Supports `*` wildcard for resource and/or action segments.
 */
function permissionMatches(held: string, required: string): boolean {
  if (held === '*:*' || held === required) return true

  const [heldRes, heldAct] = held.split(':')
  const [reqRes, reqAct] = required.split(':')

  const resourceMatch = heldRes === '*' || heldRes === reqRes
  const actionMatch = heldAct === '*' || heldAct === reqAct

  return resourceMatch && actionMatch
}

// ══════════════════════════════════════════════════════════════════════════════
// RBAC MANAGER
// ══════════════════════════════════════════════════════════════════════════════

export class RBACManager {
  private roles = new Map<string, Role>()

  constructor() {
    this.initBuiltinRoles()
  }

  // ── Built-in Roles ──

  private initBuiltinRoles(): void {
    this.roles.set('admin', {
      name: 'admin',
      permissions: new Set(['*:*']),
      description: 'Full administrative access to all resources',
      isBuiltin: true,
    })

    this.roles.set('user', {
      name: 'user',
      permissions: new Set(['*:read', '*:execute']),
      description: 'Standard user with read and execute access',
      isBuiltin: true,
    })

    this.roles.set('viewer', {
      name: 'viewer',
      permissions: new Set(['*:read']),
      description: 'Read-only access to all resources',
      isBuiltin: true,
    })

    this.roles.set('plugin', {
      name: 'plugin',
      permissions: new Set(['tools:execute', 'tools:read']),
      description: 'Limited execute access for plugins',
      isBuiltin: true,
    })
  }

  // ── Role Management ──

  createRole(name: string, permissions: string[], description?: string): Role {
    if (this.roles.has(name)) {
      throw new AiError(`Role "${name}" already exists`, AiErrorCode.INVALID_INPUT, { role: name })
    }

    const role: Role = {
      name,
      permissions: new Set(permissions),
      description,
      isBuiltin: false,
    }
    this.roles.set(name, role)
    return role
  }

  deleteRole(name: string): boolean {
    const role = this.roles.get(name)
    if (!role) {
      throw new AiError(`Role "${name}" not found`, AiErrorCode.NOT_FOUND, { role: name })
    }
    if (role.isBuiltin) {
      throw new AiError(`Cannot delete built-in role "${name}"`, AiErrorCode.PERMISSION_DENIED, { role: name })
    }
    return this.roles.delete(name)
  }

  // ── Permission Management ──

  addPermission(roleName: string, permission: Permission): void {
    const role = this.roles.get(roleName)
    if (!role) {
      throw new AiError(`Role "${roleName}" not found`, AiErrorCode.NOT_FOUND, { role: roleName })
    }
    role.permissions.add(permissionKey(permission.resource, permission.action))
  }

  removePermission(roleName: string, permission: Permission): void {
    const role = this.roles.get(roleName)
    if (!role) {
      throw new AiError(`Role "${roleName}" not found`, AiErrorCode.NOT_FOUND, { role: roleName })
    }
    role.permissions.delete(permissionKey(permission.resource, permission.action))
  }

  // ── Authorization Checks ──

  hasPermission(roles: string[], resource: string, action: PermissionAction): boolean {
    const required = permissionKey(resource, action)

    for (const roleName of roles) {
      const role = this.roles.get(roleName)
      if (!role) continue

      for (const held of role.permissions) {
        if (permissionMatches(held, required)) return true
      }
    }
    return false
  }

  // ── Queries ──

  getRoles(): Role[] {
    return [...this.roles.values()]
  }

  getRole(name: string): Role | undefined {
    return this.roles.get(name)
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// DEFAULT INSTANCE
// ══════════════════════════════════════════════════════════════════════════════

export const rbac = new RBACManager()
