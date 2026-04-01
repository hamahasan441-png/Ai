#!/usr/bin/env node
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Post-Install Script — Cross-Platform Setup                                  ║
 * ║                                                                              ║
 * ║  Runs automatically after `npm install` to set up platform-specific          ║
 * ║  data directories and verify runtime dependencies.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const { execSync } = require('child_process')

// ── Platform Detection ──

const platform = process.platform  // 'linux', 'darwin', 'win32'
const APP_NAME = 'ai'

console.log(`\n🤖 AI Post-Install — Platform: ${platform}, Node: ${process.version}\n`)

// ── Directory Resolution ──

function getDataDir() {
  if (platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), APP_NAME)
  }
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', APP_NAME)
  }
  const xdg = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share')
  return path.join(xdg, APP_NAME)
}

function getCacheDir() {
  if (platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), APP_NAME, 'cache')
  }
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Caches', APP_NAME)
  }
  const xdg = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache')
  return path.join(xdg, APP_NAME)
}

function getConfigDir() {
  if (platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), APP_NAME, 'config')
  }
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Preferences', APP_NAME)
  }
  const xdg = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
  return path.join(xdg, APP_NAME)
}

// ── Directory Creation ──

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`  ✓ Created: ${dirPath}`)
  } else {
    console.log(`  • Exists:  ${dirPath}`)
  }
}

// ── Dependency Checks ──

function hasCommand(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// ── Main ──

try {
  console.log('Creating data directories...')
  const dataDir = getDataDir()
  const cacheDir = getCacheDir()
  const configDir = getConfigDir()

  ensureDir(dataDir)
  ensureDir(cacheDir)
  ensureDir(path.join(cacheDir, 'responses'))
  ensureDir(configDir)

  // ── Check optional dependencies ──
  console.log('\nChecking optional dependencies...')

  // Git
  if (hasCommand('git')) {
    console.log('  ✓ Git available')
  } else {
    console.log('  ⚠ Git not found — some features require Git')
  }

  // SQLite CLI (fallback for DatabaseTool)
  if (hasCommand('sqlite3')) {
    console.log('  ✓ SQLite3 CLI available (DatabaseTool fallback)')
  } else {
    console.log('  ℹ SQLite3 CLI not found — DatabaseTool will use better-sqlite3 if installed')
  }

  // SoX (voice input)
  if (hasCommand('sox') || hasCommand('rec')) {
    console.log('  ✓ SoX available (voice input)')
  } else {
    console.log('  ℹ SoX not found — voice input requires sox or native audio module')
  }

  console.log('\n✅ Post-install complete!\n')

} catch (err) {
  console.error('⚠ Post-install warning:', err.message)
  // Don't fail the install on post-install errors
  process.exit(0)
}
