/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Authentication & Authorization Module                                       ║
 * ║                                                                              ║
 * ║  RBAC, session management, and API key handling for the AI system.           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ══════════════════════════════════════════════════════════════════════════════
// RBAC — Role-Based Access Control (src/auth/rbac.ts)
// ══════════════════════════════════════════════════════════════════════════════

export { RBACManager, rbac } from './rbac.js'
export type { Role, Permission, PermissionAction } from './rbac.js'

// ══════════════════════════════════════════════════════════════════════════════
// SESSIONS — Session Management (src/auth/sessions.ts)
// ══════════════════════════════════════════════════════════════════════════════

export { SessionManager } from './sessions.js'
export type { Session, SessionValidationResult } from './sessions.js'

// ══════════════════════════════════════════════════════════════════════════════
// API KEYS — API Key Management (src/auth/apiKeys.ts)
// ══════════════════════════════════════════════════════════════════════════════

export { ApiKeyManager } from './apiKeys.js'
export type { ApiKey, ApiKeyCreateOptions, ApiKeyCreateResult, ApiKeyValidationResult } from './apiKeys.js'
