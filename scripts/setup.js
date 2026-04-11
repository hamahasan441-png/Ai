#!/usr/bin/env node
/**
 * setup.js — One-command setup for the local AI project.
 *
 *   npm run setup          # full setup
 *   npm run setup -- --skip-ollama  # skip Ollama install check
 *
 * This script:
 *  1. Checks Node.js version (≥ 18)
 *  2. Installs all npm dependencies  
 *  3. Checks / installs Ollama (optional, for running models)
 *  4. Checks / installs llama.cpp (optional)
 *  5. Optionally downloads Qwen2.5-Coder and LLaMA models
 *  6. Prints a summary with next steps
 */

'use strict'

const { execSync, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')
const readline = require('readline')

// ─── Colors ──────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', red: '\x1b[31m', dim: '\x1b[2m', blue: '\x1b[34m',
}
const green = (s) => `${c.green}${s}${c.reset}`
const yellow = (s) => `${c.yellow}${s}${c.reset}`
const cyan = (s) => `${c.cyan}${s}${c.reset}`
const red = (s) => `${c.red}${s}${c.reset}`
const bold = (s) => `${c.bold}${s}${c.reset}`
const dim = (s) => `${c.dim}${s}${c.reset}`
const blue = (s) => `${c.blue}${s}${c.reset}`

const ROOT = path.resolve(__dirname, '..')
const args = process.argv.slice(2)
const skipOllama = args.includes('--skip-ollama')
const skipModels = args.includes('--skip-models')
const yes = args.includes('--yes') || args.includes('-y')

// ─── Helpers ─────────────────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...opts }).trim()
  } catch {
    return null
  }
}

function step(n, total, label) {
  console.log()
  console.log(bold(cyan(`  [${n}/${total}] ${label}`)))
}

function ok(msg) { console.log(green(`        ✓ ${msg}`) ) }
function warn(msg) { console.log(yellow(`        ⚠ ${msg}`)) }
function info(msg) { console.log(dim(`          ${msg}`)) }
function err(msg) { console.log(red(`        ✗ ${msg}`)) }

async function ask(question) {
  if (yes) { console.log(dim(`          Auto-yes: ${question}`)); return true }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(`          ${question} [Y/n] `, (ans) => {
      rl.close()
      resolve(ans.trim().toLowerCase() !== 'n')
    })
  })
}

// ─── Step helpers ─────────────────────────────────────────────────────────────
const TOTAL_STEPS = 5

function checkNode() {
  step(1, TOTAL_STEPS, 'Checking Node.js version')
  const v = process.version
  const major = parseInt(v.slice(1).split('.')[0], 10)
  if (major < 18) {
    err(`Node.js ${v} is too old. Please install Node.js ≥ 18.`)
    process.exit(1)
  }
  ok(`Node.js ${v}`)
}

function installDeps() {
  step(2, TOTAL_STEPS, 'Installing npm dependencies')

  const pkgPath = path.join(ROOT, 'package.json')
  const lockPath = path.join(ROOT, 'package-lock.json')
  const nmPath = path.join(ROOT, 'node_modules', '.package-lock.json')

  // Check if node_modules is already up-to-date
  if (fs.existsSync(nmPath) && fs.existsSync(lockPath)) {
    const lockMtime = fs.statSync(lockPath).mtimeMs
    const nmMtime = fs.statSync(nmPath).mtimeMs
    if (nmMtime >= lockMtime) {
      ok('node_modules is up-to-date')
      return
    }
  }

  info('Running npm install …')
  const result = spawnSync('npm', ['install'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (result.status !== 0) {
    err('npm install failed')
    process.exit(1)
  }
  ok('Dependencies installed')
}

function checkOllama() {
  if (skipOllama) {
    info('Skipping Ollama check (--skip-ollama)')
    return
  }

  step(3, TOTAL_STEPS, 'Checking Ollama (local LLM server)')

  const which = run('which ollama') || run('where ollama')
  if (which) {
    const version = run('ollama --version')
    ok(`Ollama found: ${version || 'version unknown'}`)
    info('Start with: ollama serve')
    return
  }

  warn('Ollama not found')
  info('Ollama lets you run Qwen and LLaMA models locally without any API key.')
  info('Install guide: https://ollama.com/download')
  info('')
  info('Quick install (Linux/macOS):')
  info('  curl -fsSL https://ollama.com/install.sh | sh')
  info('')
  info('After install, run the models:')
  info('  ollama pull qwen2.5-coder:7b')
  info('  ollama pull llama3.2:3b')
  info('  ollama serve')
}

function checkLlamaCpp() {
  step(4, TOTAL_STEPS, 'Checking llama.cpp (alternative LLM server)')

  const llamaServer = run('which llama-server') || run('which llama-cpp')
  if (llamaServer) {
    ok(`llama-server found: ${llamaServer}`)
    return
  }

  const llamaRun = run('which llama-run')
  if (llamaRun) {
    ok(`llama-run found: ${llamaRun}`)
    return
  }

  info('llama.cpp not found (optional — Ollama is easier to use)')
  info('Install: https://github.com/ggerganov/llama.cpp/releases')
  info('Or build from source: https://github.com/ggerganov/llama.cpp')
}

async function promptModels() {
  step(5, TOTAL_STEPS, 'GGUF model files')

  const modelsDir = path.join(os.homedir(), '.local', 'share', 'ai', 'models')

  const qwenFile = path.join(modelsDir, 'qwen2.5-coder-7b-instruct-q4_k_m.gguf')
  const llamaFile = path.join(modelsDir, 'llama-3.2-3b-instruct-q4_k_m.gguf')

  const qwenExists = fs.existsSync(qwenFile)
  const llamaExists = fs.existsSync(llamaFile)

  if (qwenExists && llamaExists) {
    ok('Both default models already downloaded')
    info(`  ${qwenFile}`)
    info(`  ${llamaFile}`)
    return
  }

  if (skipModels) {
    info('Skipping model download (--skip-models)')
    info(`Run later: ${cyan('npm run download-models')}`)
    return
  }

  if (!qwenExists) warn('Qwen2.5-Coder 7B Q4_K_M not found')
  if (!llamaExists) warn('LLaMA 3.2 3B Q4_K_M not found')

  info('')
  info('Models are needed for fully local AI inference.')
  info(`  Qwen2.5-Coder 7B Q4_K_M  ~4.7 GB  — best for code tasks`)
  info(`  LLaMA 3.2 3B Q4_K_M      ~2.0 GB  — fast & lightweight`)
  info('')

  const doDownload = await ask('Download default models now? (requires ~7 GB disk space)')
  if (!doDownload) {
    info(`Run later: ${cyan('npm run download-models')}`)
    return
  }

  const downloadScript = path.join(ROOT, 'scripts', 'download-models.js')
  const toDownload = []
  if (!qwenExists) toDownload.push('--qwen')
  if (!llamaExists) toDownload.push('--llama')

  for (const flag of toDownload) {
    const result = spawnSync('node', [downloadScript, flag], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    if (result.status !== 0) {
      warn('Model download failed. Run later: npm run download-models')
    }
  }
}

function printSummary() {
  console.log()
  console.log(bold(cyan('  ╔══════════════════════════════════════════════════════╗')))
  console.log(bold(cyan('  ║  Setup complete!                                     ║')))
  console.log(bold(cyan('  ╚══════════════════════════════════════════════════════╝')))
  console.log()
  console.log('  ' + bold('Quick start:'))
  console.log()
  console.log(`    ${cyan('npm start')}`)
  console.log(dim('    Start the interactive AI CLI'))
  console.log()
  console.log(`    ${cyan('npm run download-models')}`)
  console.log(dim('    Download Qwen and LLaMA GGUF models (shows menu)'))
  console.log()
  console.log(`    ${cyan('npm run download-models -- --all')}`)
  console.log(dim('    Download both default models non-interactively'))
  console.log()
  console.log(`    ${cyan('npm test')}`)
  console.log(dim('    Run the test suite'))
  console.log()
  console.log('  ' + bold('Local LLM backends:'))
  console.log()
  console.log('    ' + bold('Ollama') + ' (recommended)')
  console.log(dim('      ollama serve'))
  console.log(dim('      ollama pull qwen2.5-coder:7b'))
  console.log(dim('      ollama pull llama3.2:3b'))
  console.log()
  console.log('    ' + bold('llama.cpp') + ' (alternative)')
  console.log(dim('      llama-server -m ~/.local/share/ai/models/qwen2.5-coder-7b-instruct-q4_k_m.gguf'))
  console.log()
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log()
  console.log(bold(blue('  ═══════════════════════════════════════════════')))
  console.log(bold(blue('    AI — Local AI Assistant  Setup')))
  console.log(bold(blue('  ═══════════════════════════════════════════════')))
  console.log(dim('  Runs fully offline after models are downloaded.'))
  console.log(dim('  No external APIs or API keys required.'))
  console.log()

  checkNode()
  installDeps()
  checkOllama()
  checkLlamaCpp()
  await promptModels()
  printSummary()
}

main().catch((e) => {
  console.error(red(`\n  Fatal error: ${e.message}\n`))
  process.exit(1)
})
