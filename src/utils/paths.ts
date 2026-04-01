/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Cross-Platform Path Resolution                                              ║
 * ║                                                                              ║
 * ║  Provides consistent data, cache, and config directories across              ║
 * ║  Linux, macOS, and Windows. Follows XDG Base Directory spec on Linux.        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'

// ── Constants ──

const APP_NAME = 'ai'

// ── Platform detection ──

export type Platform = 'linux' | 'darwin' | 'win32'

export function getPlatform(): Platform {
  return process.platform as Platform
}

// ── Directory Resolution ──

/**
 * Get the data directory for persistent brain state.
 * - Linux:   `$XDG_DATA_HOME/ai/` or `~/.local/share/ai/`
 * - macOS:   `~/Library/Application Support/ai/`
 * - Windows: `%APPDATA%\ai\`
 */
export function getDataDir(): string {
  const platform = getPlatform()

  if (platform === 'win32') {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')
    return path.join(appData, APP_NAME)
  }

  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', APP_NAME)
  }

  // Linux — follow XDG Base Directory spec
  const xdgData = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share')
  return path.join(xdgData, APP_NAME)
}

/**
 * Get the cache directory for temporary/regenerable data.
 * - Linux:   `$XDG_CACHE_HOME/ai/` or `~/.cache/ai/`
 * - macOS:   `~/Library/Caches/ai/`
 * - Windows: `%LOCALAPPDATA%\ai\cache\`
 */
export function getCacheDir(): string {
  const platform = getPlatform()

  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
    return path.join(localAppData, APP_NAME, 'cache')
  }

  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Caches', APP_NAME)
  }

  // Linux — XDG
  const xdgCache = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache')
  return path.join(xdgCache, APP_NAME)
}

/**
 * Get the config directory for user settings.
 * - Linux:   `$XDG_CONFIG_HOME/ai/` or `~/.config/ai/`
 * - macOS:   `~/Library/Preferences/ai/`
 * - Windows: `%APPDATA%\ai\config\`
 */
export function getConfigDir(): string {
  const platform = getPlatform()

  if (platform === 'win32') {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')
    return path.join(appData, APP_NAME, 'config')
  }

  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Preferences', APP_NAME)
  }

  // Linux — XDG
  const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
  return path.join(xdgConfig, APP_NAME)
}

// ── Specific file paths ──

/** Path to the brain state persistence file. */
export function getBrainStatePath(): string {
  return path.join(getDataDir(), 'brain-state.json')
}

/** Path to the disk cache directory. */
export function getDiskCachePath(): string {
  return path.join(getCacheDir(), 'responses')
}

// ── Directory creation ──

/**
 * Ensure a directory exists, creating it recursively if needed.
 * Returns the directory path.
 */
export function ensureDir(dirPath: string): string {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
  return dirPath
}

/**
 * Ensure all standard app directories exist.
 * Call this at startup.
 */
export function ensureAppDirs(): void {
  ensureDir(getDataDir())
  ensureDir(getCacheDir())
  ensureDir(getConfigDir())
  ensureDir(getDiskCachePath())
}
