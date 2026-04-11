import { logForDebugging } from '../debug.js'
import { execFileNoThrow } from '../execFileNoThrow.js'
import { jsonParse, jsonStringify } from '../slowOperations.js'
import type { SecureStorage, SecureStorageData } from './types.js'

/**
 * Linux secure storage using libsecret (via `secret-tool` CLI).
 *
 * secret-tool is part of libsecret and provides GNOME Keyring / KDE Wallet
 * integration on most Linux distributions. Falls back to plaintext storage
 * if secret-tool is not available.
 *
 * Requires: `sudo apt install libsecret-tools` (Debian/Ubuntu)
 *           `sudo dnf install libsecret` (Fedora)
 */

const SERVICE_NAME = 'claude-code'
const ATTRIBUTE_KEY = 'application'
const ATTRIBUTE_VALUE = 'claude-code-credentials'

let secretToolAvailable: boolean | null = null

async function isSecretToolAvailable(): Promise<boolean> {
  if (secretToolAvailable !== null) return secretToolAvailable
  try {
    const result = await execFileNoThrow('which', ['secret-tool'])
    secretToolAvailable = result.exitCode === 0
    if (!secretToolAvailable) {
      logForDebugging(
        'secret-tool not found. Install libsecret-tools for secure credential storage on Linux.',
      )
    }
    return secretToolAvailable
  } catch {
    secretToolAvailable = false
    return false
  }
}

function isSecretToolAvailableSync(): boolean {
  // If we haven't checked yet, assume unavailable for sync calls
  // Async readAsync() will do proper detection
  return secretToolAvailable === true
}

export const linuxSecretStorage: SecureStorage = {
  name: 'libsecret',

  read(): SecureStorageData | null {
    if (!isSecretToolAvailableSync()) return null

    try {
      // secret-tool doesn't have a sync mode, but we need sync for the interface.
      // Use execFileSync equivalent via child_process
      const { execFileSync } = require('child_process')
      const result = execFileSync('secret-tool', ['lookup', ATTRIBUTE_KEY, ATTRIBUTE_VALUE], {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      if (result && result.trim()) {
        return jsonParse(result.trim())
      }
    } catch {
      // secret-tool returns non-zero when key not found — not an error
    }
    return null
  },

  async readAsync(): Promise<SecureStorageData | null> {
    if (!(await isSecretToolAvailable())) return null

    try {
      const result = await execFileNoThrow('secret-tool', [
        'lookup',
        ATTRIBUTE_KEY,
        ATTRIBUTE_VALUE,
      ])
      if (result.exitCode === 0 && result.stdout?.trim()) {
        return jsonParse(result.stdout.trim())
      }
    } catch {
      // secret-tool returns non-zero when key not found — not an error
    }
    return null
  },

  update(data: SecureStorageData): { success: boolean; warning?: string } {
    if (!isSecretToolAvailableSync()) {
      return { success: false, warning: 'secret-tool not available' }
    }

    try {
      const serialized = jsonStringify(data)
      const { execFileSync } = require('child_process')
      // secret-tool store reads from stdin
      execFileSync(
        'secret-tool',
        ['store', '--label', SERVICE_NAME, ATTRIBUTE_KEY, ATTRIBUTE_VALUE],
        {
          input: serialized,
          encoding: 'utf8',
          timeout: 5000,
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      )
      return { success: true }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      logForDebugging(`libsecret store failed: ${msg}`)
      return { success: false, warning: `libsecret store failed: ${msg}` }
    }
  },

  delete(): { success: boolean; warning?: string } {
    if (!isSecretToolAvailableSync()) {
      return { success: false, warning: 'secret-tool not available' }
    }

    try {
      const { execFileSync } = require('child_process')
      execFileSync('secret-tool', ['clear', ATTRIBUTE_KEY, ATTRIBUTE_VALUE], {
        encoding: 'utf8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      return { success: true }
    } catch {
      // May fail if key doesn't exist — that's ok
      return { success: true }
    }
  },
}
