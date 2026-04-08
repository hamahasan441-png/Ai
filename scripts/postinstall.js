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

  // ── Qwen2.5-Coder Local LLM Setup ──
  console.log('\n🤖 Local LLM Setup (Qwen2.5-Coder 7B)...')

  // Create models directory
  const modelsDir = path.join(dataDir, 'models')
  ensureDir(modelsDir)

  // Check for Ollama (preferred backend)
  const hasOllama = hasCommand('ollama')
  if (hasOllama) {
    console.log('  ✓ Ollama detected — preferred backend for Qwen2.5-Coder')

    // Check if the model is already pulled
    try {
      const ollamaList = execSync('ollama list 2>/dev/null', { encoding: 'utf8' })
      if (ollamaList.includes('qwen2.5-coder')) {
        console.log('  ✓ Qwen2.5-Coder model already available in Ollama')
      } else {
        console.log('  ℹ Qwen2.5-Coder not yet downloaded. To download, run:')
        console.log('    ollama pull qwen2.5-coder:7b')
        console.log('')
        console.log('  Auto-downloading Qwen2.5-Coder 7B via Ollama...')
        console.log('  (This may take several minutes. If it times out, run manually: ollama pull qwen2.5-coder:7b)')
        try {
          // Attempt auto-download — 2 minute timeout to avoid blocking install too long
          execSync('ollama pull qwen2.5-coder:7b', {
            stdio: 'inherit',
            timeout: 120000, // 2 minute timeout — user can finish manually if needed
          })
          console.log('  ✓ Qwen2.5-Coder 7B downloaded successfully!')
        } catch (pullErr) {
          console.log('  ℹ Auto-download did not complete within timeout. Download manually:')
          console.log('    ollama pull qwen2.5-coder:7b')
        }
      }
    } catch {
      console.log('  ℹ Could not check Ollama models. Run: ollama pull qwen2.5-coder:7b')
    }
  } else {
    console.log('  ℹ Ollama not found. Install for best local LLM experience:')
    if (platform === 'linux') {
      console.log('    curl -fsSL https://ollama.ai/install.sh | sh')
    } else if (platform === 'darwin') {
      console.log('    brew install ollama')
    } else {
      console.log('    Download from https://ollama.ai/download')
    }
    console.log('')
    console.log('  Then pull the model:')
    console.log('    ollama pull qwen2.5-coder:7b')
    console.log('')
    console.log('  Alternative: Use llama.cpp with GGUF model:')
    console.log('    wget -P ' + modelsDir + ' \\')
    console.log('      "https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q4_k_m.gguf"')
  }

  console.log('\n✅ Post-install complete!\n')

} catch (err) {
  console.error('⚠ Post-install warning:', err.message)
  // Don't fail the install on post-install errors
  process.exit(0)
}
