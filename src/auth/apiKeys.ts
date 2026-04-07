/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  API Key Management                                                          ║
 * ║                                                                              ║
 * ║  Creates, validates, rotates, and revokes API keys. Keys are stored as       ║
 * ║  SHA-256 hashes in-memory; the raw key is returned only at creation time.    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { AiError, AiErrorCode } from '../utils/errors.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface ApiKey {
  id: string
  name: string
  keyHash: string
  prefix: string
  roles: string[]
  createdAt: number
  expiresAt?: number
  lastUsedAt?: number
  rateLimit?: number
}

export interface ApiKeyCreateOptions {
  expiresAt?: number
  rateLimit?: number
}

export interface ApiKeyValidationResult {
  valid: boolean
  apiKey?: ApiKey
  reason?: string
}

export interface ApiKeyCreateResult {
  key: string
  apiKey: ApiKey
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

function generateRawKey(): string {
  return `ai_key_${randomBytes(16).toString('hex')}`
}

// ══════════════════════════════════════════════════════════════════════════════
// API KEY MANAGER
// ══════════════════════════════════════════════════════════════════════════════

export class ApiKeyManager {
  private keys = new Map<string, ApiKey>()

  // ── Key Lifecycle ──

  createKey(name: string, roles: string[], options?: ApiKeyCreateOptions): ApiKeyCreateResult {
    if (!name) {
      throw new AiError('Key name is required', AiErrorCode.INVALID_INPUT)
    }

    const rawKey = generateRawKey()
    const id = randomUUID()
    const now = Date.now()

    const apiKey: ApiKey = {
      id,
      name,
      keyHash: hashKey(rawKey),
      prefix: rawKey.slice(0, 8),
      roles: [...roles],
      createdAt: now,
      expiresAt: options?.expiresAt,
      rateLimit: options?.rateLimit,
    }

    this.keys.set(id, apiKey)
    return { key: rawKey, apiKey }
  }

  // ── Validation ──

  validateKey(key: string): ApiKeyValidationResult {
    const hash = hashKey(key)

    for (const apiKey of this.keys.values()) {
      if (apiKey.keyHash === hash) {
        if (apiKey.expiresAt && Date.now() > apiKey.expiresAt) {
          return { valid: false, reason: 'API key has expired' }
        }

        apiKey.lastUsedAt = Date.now()
        return { valid: true, apiKey }
      }
    }

    return { valid: false, reason: 'Invalid API key' }
  }

  // ── Revocation ──

  revokeKey(id: string): boolean {
    if (!this.keys.has(id)) {
      throw new AiError(`API key "${id}" not found`, AiErrorCode.NOT_FOUND, { keyId: id })
    }
    return this.keys.delete(id)
  }

  // ── Rotation ──

  rotateKey(id: string): ApiKeyCreateResult {
    const existing = this.keys.get(id)
    if (!existing) {
      throw new AiError(`API key "${id}" not found`, AiErrorCode.NOT_FOUND, { keyId: id })
    }

    // Revoke the old key
    this.keys.delete(id)

    // Create a new key preserving name, roles, and options
    return this.createKey(existing.name, existing.roles, {
      expiresAt: existing.expiresAt,
      rateLimit: existing.rateLimit,
    })
  }

  // ── Queries ──

  listKeys(): Omit<ApiKey, 'keyHash'>[] {
    return [...this.keys.values()].map(({ keyHash: _hash, ...rest }) => rest)
  }
}
