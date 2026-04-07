/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Session Management                                                          ║
 * ║                                                                              ║
 * ║  In-memory session store with TTL, activity tracking, and user-scoped        ║
 * ║  revocation. Sessions are identified by cryptographically random UUIDs.      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { randomUUID } from 'node:crypto'
import { AiError, AiErrorCode } from '../utils/errors.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface Session {
  id: string
  userId: string
  roles: string[]
  createdAt: number
  expiresAt: number
  lastActivityAt: number
  metadata?: Record<string, unknown>
}

export interface SessionValidationResult {
  valid: boolean
  session?: Session
  reason?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

const DEFAULT_TTL_MS = 30 * 60 * 1000 // 30 minutes

// ══════════════════════════════════════════════════════════════════════════════
// SESSION MANAGER
// ══════════════════════════════════════════════════════════════════════════════

export class SessionManager {
  private sessions = new Map<string, Session>()

  // ── Session Lifecycle ──

  createSession(
    userId: string,
    roles: string[],
    ttlMs: number = DEFAULT_TTL_MS,
    metadata?: Record<string, unknown>,
  ): Session {
    if (!userId) {
      throw new AiError('userId is required', AiErrorCode.INVALID_INPUT)
    }

    const now = Date.now()
    const session: Session = {
      id: randomUUID(),
      userId,
      roles: [...roles],
      createdAt: now,
      expiresAt: now + ttlMs,
      lastActivityAt: now,
      metadata,
    }

    this.sessions.set(session.id, session)
    return session
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId)
  }

  validateSession(sessionId: string): SessionValidationResult {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return { valid: false, reason: 'Session not found' }
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId)
      return { valid: false, reason: 'Session expired' }
    }

    // Refresh activity timestamp
    session.lastActivityAt = Date.now()
    return { valid: true, session }
  }

  // ── Revocation ──

  revokeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }

  revokeUserSessions(userId: string): number {
    let count = 0
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(id)
        count++
      }
    }
    return count
  }

  // ── Maintenance ──

  cleanExpired(): number {
    const now = Date.now()
    let count = 0
    for (const [id, session] of this.sessions) {
      if (now > session.expiresAt) {
        this.sessions.delete(id)
        count++
      }
    }
    return count
  }

  activeSessions(): number {
    const now = Date.now()
    let count = 0
    for (const session of this.sessions.values()) {
      if (now <= session.expiresAt) count++
    }
    return count
  }
}
