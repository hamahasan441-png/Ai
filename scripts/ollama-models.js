#!/usr/bin/env node
/**
 * ollama-models.js — Manage Ollama models for our AI system.
 *
 * Usage:
 *   npm run ollama-models                          # interactive menu
 *   npm run ollama-models -- --recommended         # pull recommended models
 *   npm run ollama-models -- --all                 # pull all supported models
 *   npm run ollama-models -- --list                # list models + status
 *   npm run ollama-models -- --pull <model>        # pull a specific model
 *   npm run ollama-models -- --health              # check Ollama health
 *   npm run ollama-models -- --remove <model>      # remove a model
 *
 * Requires Ollama to be installed: https://ollama.com
 */

'use strict'

const http = require('http')
const readline = require('readline')

// ─── Colors ──────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
}
const green = (s) => `${c.green}${s}${c.reset}`
const yellow = (s) => `${c.yellow}${s}${c.reset}`
const cyan = (s) => `${c.cyan}${s}${c.reset}`
const red = (s) => `${c.red}${s}${c.reset}`
const bold = (s) => `${c.bold}${s}${c.reset}`
const dim = (s) => `${c.dim}${s}${c.reset}`
const blue = (s) => `${c.blue}${s}${c.reset}`
const magenta = (s) => `${c.magenta}${s}${c.reset}`

// ─── Ollama Configuration ────────────────────────────────────────────────────
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const ollamaUrl = new URL(OLLAMA_BASE_URL)

// ─── Model Catalogue ─────────────────────────────────────────────────────────
// Models our AI system supports and can use
const MODELS = {
  // ── Qwen 2.5 Coder (code specialist) ─────────────────────────────────────
  'qwen2.5-coder:0.5b': {
    label: 'Qwen 2.5 Coder 0.5B',
    family: 'qwen-coder',
    sizeGB: 0.4,
    ramGB: 1,
    tier: 'optional',
    description: 'Ultra-light code model. Best for very low-resource devices.',
  },
  'qwen2.5-coder:1.5b': {
    label: 'Qwen 2.5 Coder 1.5B',
    family: 'qwen-coder',
    sizeGB: 1.0,
    ramGB: 2,
    tier: 'optional',
    description: 'Fast small code model. Good for mobile/embedded.',
  },
  'qwen2.5-coder:3b': {
    label: 'Qwen 2.5 Coder 3B',
    family: 'qwen-coder',
    sizeGB: 2.0,
    ramGB: 4,
    tier: 'optional',
    description: 'Good quality code model with moderate resources.',
  },
  'qwen2.5-coder:7b': {
    label: 'Qwen 2.5 Coder 7B  ★ PRIMARY',
    family: 'qwen-coder',
    sizeGB: 4.7,
    ramGB: 6,
    tier: 'recommended',
    description: 'Best quality/speed balance. Our primary code model.',
  },
  'qwen2.5-coder:14b': {
    label: 'Qwen 2.5 Coder 14B',
    family: 'qwen-coder',
    sizeGB: 9.0,
    ramGB: 12,
    tier: 'optional',
    description: 'High quality. Needs good hardware (12+ GB RAM).',
  },
  'qwen2.5-coder:32b': {
    label: 'Qwen 2.5 Coder 32B',
    family: 'qwen-coder',
    sizeGB: 20.0,
    ramGB: 24,
    tier: 'optional',
    description: 'Very high quality. Needs 24+ GB RAM.',
  },

  // ── Qwen 2.5 General ─────────────────────────────────────────────────────
  'qwen2.5:7b': {
    label: 'Qwen 2.5 7B (general)',
    family: 'qwen',
    sizeGB: 4.7,
    ramGB: 6,
    tier: 'optional',
    description: 'General-purpose Qwen model.',
  },
  'qwen2.5:72b': {
    label: 'Qwen 2.5 72B (general)',
    family: 'qwen',
    sizeGB: 44.0,
    ramGB: 48,
    tier: 'optional',
    description: 'Maximum quality. Needs server-grade hardware.',
  },

  // ── LLaMA ─────────────────────────────────────────────────────────────────
  'llama3.2:3b': {
    label: 'LLaMA 3.2 3B  ★ SECONDARY',
    family: 'llama',
    sizeGB: 2.0,
    ramGB: 3,
    tier: 'recommended',
    description: 'Fast and lightweight. Our secondary general model.',
  },
  'llama3:8b': {
    label: 'LLaMA 3 8B',
    family: 'llama',
    sizeGB: 4.7,
    ramGB: 6,
    tier: 'optional',
    description: 'Capable general model.',
  },
  'llama3.1:8b': {
    label: 'LLaMA 3.1 8B',
    family: 'llama',
    sizeGB: 4.9,
    ramGB: 6,
    tier: 'optional',
    description: 'Improved general model. Good for complex reasoning.',
  },

  // ── Other Models ──────────────────────────────────────────────────────────
  'mistral:7b': {
    label: 'Mistral 7B',
    family: 'mistral',
    sizeGB: 4.1,
    ramGB: 6,
    tier: 'optional',
    description: 'Strong reasoning. Good general-purpose alternative.',
  },
  'codellama:7b': {
    label: 'CodeLlama 7B',
    family: 'codellama',
    sizeGB: 3.8,
    ramGB: 6,
    tier: 'optional',
    description: "Meta's code-specialized LLaMA variant.",
  },
  'deepseek-coder:6.7b': {
    label: 'DeepSeek Coder 6.7B',
    family: 'deepseek',
    sizeGB: 3.8,
    ramGB: 6,
    tier: 'optional',
    description: 'Strong code model from DeepSeek.',
  },
  'phi3:mini': {
    label: 'Phi-3 Mini',
    family: 'phi',
    sizeGB: 2.2,
    ramGB: 4,
    tier: 'optional',
    description: "Microsoft's efficient small model.",
  },
  'gemma2:9b': {
    label: 'Gemma 2 9B',
    family: 'gemma',
    sizeGB: 5.4,
    ramGB: 8,
    tier: 'optional',
    description: "Google's open model. Good all-around.",
  },
  'starcoder2:7b': {
    label: 'StarCoder 2 7B',
    family: 'starcoder',
    sizeGB: 4.0,
    ramGB: 6,
    tier: 'optional',
    description: 'BigCode code completion specialist.',
  },
}

// ─── Ollama API Helpers ──────────────────────────────────────────────────────
function ollamaRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: ollamaUrl.hostname,
      port: ollamaUrl.port || 11434,
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null })
        } catch {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')) })
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

function ollamaStreamRequest(path, body, onLine) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: ollamaUrl.hostname,
      port: ollamaUrl.port || 11434,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }

    const req = http.request(options, (res) => {
      let buffer = ''
      res.on('data', (chunk) => {
        buffer += chunk.toString()
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.trim()) {
            try {
              onLine(JSON.parse(line))
            } catch {
              // ignore parse errors in stream
            }
          }
        }
      })
      res.on('end', () => resolve())
      res.on('error', reject)
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

// ─── Commands ────────────────────────────────────────────────────────────────
async function checkHealth() {
  console.log()
  console.log(bold('  Ollama Health Check'))
  console.log()

  try {
    const res = await ollamaRequest('/api/version')
    if (res.status === 200) {
      console.log(green(`  ✓ Ollama is running`))
      console.log(dim(`    URL: ${OLLAMA_BASE_URL}`))
      console.log(dim(`    Version: ${res.data?.version || 'unknown'}`))
    } else {
      console.log(red(`  ✗ Ollama returned HTTP ${res.status}`))
    }
  } catch (err) {
    console.log(red(`  ✗ Cannot connect to Ollama at ${OLLAMA_BASE_URL}`))
    console.log(dim(`    Error: ${err.message}`))
    console.log()
    console.log('  ' + bold('To fix:'))
    console.log(dim('    1. Install Ollama: curl -fsSL https://ollama.com/install.sh | sh'))
    console.log(dim('    2. Start Ollama:   ollama serve'))
    console.log(dim('    3. Or set OLLAMA_BASE_URL in .env for remote server'))
    return false
  }

  // List models
  try {
    const res = await ollamaRequest('/api/tags')
    const models = res.data?.models || []
    console.log()
    if (models.length === 0) {
      console.log(yellow('  ⚠ No models downloaded yet'))
      console.log(dim('    Run: npm run ollama-models -- --recommended'))
    } else {
      console.log(green(`  ✓ ${models.length} model(s) available:`))
      for (const m of models) {
        const sizeGB = (m.size / 1024 / 1024 / 1024).toFixed(1)
        console.log(`    ${cyan(m.name.padEnd(30))} ${dim(sizeGB + ' GB')}`)
      }
    }
  } catch {
    // ignore if tags fail
  }

  console.log()
  return true
}

async function getInstalledModels() {
  try {
    const res = await ollamaRequest('/api/tags')
    return (res.data?.models || []).map((m) => m.name)
  } catch {
    return []
  }
}

async function listModels() {
  console.log()
  console.log(bold(cyan('  ╔══════════════════════════════════════════════════════════╗')))
  console.log(bold(cyan('  ║   Ollama Models for Our AI System                        ║')))
  console.log(bold(cyan('  ╚══════════════════════════════════════════════════════════╝')))
  console.log()

  const installed = await getInstalledModels()

  let currentFamily = null
  const families = {
    'qwen-coder': '── Qwen 2.5 Coder (code specialist) ──────────────────────',
    'qwen': '── Qwen 2.5 General ──────────────────────────────────────',
    'llama': '── LLaMA (general purpose) ────────────────────────────────',
    'mistral': '── Other Models ───────────────────────────────────────────',
  }

  for (const [modelId, m] of Object.entries(MODELS)) {
    // Print family header
    if (m.family !== currentFamily) {
      const header = families[m.family]
      if (header) {
        console.log(cyan(`  ${header}`))
      } else if (!families[m.family] && currentFamily !== '__other') {
        console.log(cyan('  ── Other Models ───────────────────────────────────────────'))
        currentFamily = '__other'
      }
      if (currentFamily !== '__other') currentFamily = m.family
    }

    const isInstalled = installed.some((name) => name === modelId)
    const status = isInstalled ? green('✓ installed') : dim('not installed')
    const tierBadge = m.tier === 'recommended' ? yellow(' [RECOMMENDED]') : ''

    console.log(`    ${bold(modelId.padEnd(28))} ${m.label}${tierBadge}`)
    console.log(`    ${''.padEnd(28)} ${dim(m.description)}  [${m.sizeGB} GB, needs ${m.ramGB} GB RAM]  ${status}`)
  }

  console.log()
  console.log(dim(`  Ollama URL: ${OLLAMA_BASE_URL}`))
  console.log()
  console.log('  ' + bold('Commands:'))
  console.log(dim('    npm run ollama-models -- --recommended    Pull recommended models'))
  console.log(dim('    npm run ollama-models -- --pull <model>   Pull specific model'))
  console.log(dim('    npm run ollama-models -- --all            Pull all supported models'))
  console.log(dim('    npm run ollama-models -- --health         Check Ollama health'))
  console.log()
}

async function pullModel(modelId) {
  console.log()
  console.log(`  ${bold('Pulling')} ${cyan(modelId)}...`)
  console.log()

  try {
    let lastPct = -1
    await ollamaStreamRequest('/api/pull', { name: modelId, stream: true }, (line) => {
      if (line.status === 'success') {
        process.stdout.write('\n')
        console.log(green(`  ✓ Successfully pulled ${modelId}`))
        return
      }
      if (line.total && line.completed) {
        const pct = Math.round((line.completed / line.total) * 100)
        if (pct !== lastPct) {
          lastPct = pct
          const barWidth = 40
          const filled = Math.round((pct / 100) * barWidth)
          const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled)
          const dlGB = (line.completed / 1024 / 1024 / 1024).toFixed(2)
          const totGB = (line.total / 1024 / 1024 / 1024).toFixed(2)
          process.stdout.write(`\r  [${cyan(bar)}] ${pct}%  ${dlGB}/${totGB} GB  `)
        }
      } else if (line.status) {
        process.stdout.write(`\r  ${dim(line.status)}${''.padEnd(60)}`)
      }
    })
  } catch (err) {
    console.log(red(`  ✗ Failed to pull ${modelId}: ${err.message}`))
    console.log(dim('    Make sure Ollama is running: ollama serve'))
    return false
  }

  console.log()
  return true
}

async function removeModel(modelId) {
  console.log()
  console.log(`  ${bold('Removing')} ${cyan(modelId)}...`)

  try {
    const res = await ollamaRequest('/api/delete', 'DELETE', { name: modelId })
    if (res.status === 200) {
      console.log(green(`  ✓ Removed ${modelId}`))
    } else {
      console.log(red(`  ✗ Failed to remove ${modelId} (HTTP ${res.status})`))
    }
  } catch (err) {
    console.log(red(`  ✗ Failed: ${err.message}`))
  }
  console.log()
}

async function pullRecommended() {
  console.log()
  console.log(bold(cyan('  Pulling recommended models for our AI...')))
  console.log()

  const recommended = Object.entries(MODELS).filter(([, m]) => m.tier === 'recommended')
  let totalSize = 0

  for (const [id, m] of recommended) {
    totalSize += m.sizeGB
    console.log(`    ${cyan(id.padEnd(28))} ${m.label}  ${dim(`[${m.sizeGB} GB]`)}`)
  }

  console.log()
  console.log(dim(`  Total download: ~${totalSize.toFixed(1)} GB`))
  console.log()

  for (const [id] of recommended) {
    await pullModel(id)
  }

  console.log()
  console.log(bold(green('  ✓ All recommended models ready!')))
  console.log()
  console.log('  ' + bold('Next steps:'))
  console.log(dim('    Start our AI: npm start'))
  console.log(dim('    Or test:      ollama run qwen2.5-coder:7b "Hello!"'))
  console.log()
}

async function pullAll() {
  console.log()
  console.log(bold(cyan('  Pulling ALL supported models...')))
  console.log(yellow('  ⚠ This will download a lot of data!'))
  console.log()

  let totalSize = 0
  for (const [id, m] of Object.entries(MODELS)) {
    totalSize += m.sizeGB
    console.log(`    ${dim(id.padEnd(28))} [${m.sizeGB} GB]`)
  }
  console.log()
  console.log(dim(`  Total download: ~${totalSize.toFixed(1)} GB`))
  console.log()

  for (const [id] of Object.entries(MODELS)) {
    await pullModel(id)
  }

  console.log()
  console.log(bold(green('  ✓ All models downloaded!')))
  console.log()
}

async function interactiveMenu() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const q = (prompt) => new Promise((res) => rl.question(prompt, res))

  console.log()
  console.log(bold(cyan('  ╔══════════════════════════════════════════════════════════╗')))
  console.log(bold(cyan('  ║   Ollama Model Manager for AI                            ║')))
  console.log(bold(cyan('  ╚══════════════════════════════════════════════════════════╝')))
  console.log()

  // Check Ollama connection
  const healthy = await checkHealth()
  if (!healthy) {
    rl.close()
    process.exit(1)
  }

  console.log()
  console.log('  ' + bold('What would you like to do?'))
  console.log()
  console.log(`    ${bold('1)')} Pull recommended models (Qwen 2.5 Coder 7B + LLaMA 3.2 3B)`)
  console.log(`    ${bold('2)')} List all supported models`)
  console.log(`    ${bold('3)')} Pull a specific model`)
  console.log(`    ${bold('4)')} Pull all supported models`)
  console.log(`    ${bold('q)')} Quit`)
  console.log()

  const answer = await q('  Your choice: ')
  rl.close()

  switch (answer.trim().toLowerCase()) {
    case '1':
      await pullRecommended()
      break
    case '2':
      await listModels()
      break
    case '3': {
      const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout })
      const modelId = await new Promise((res) => {
        rl2.question('  Model name (e.g. qwen2.5-coder:7b): ', res)
      })
      rl2.close()
      if (modelId.trim()) await pullModel(modelId.trim())
      break
    }
    case '4':
      await pullAll()
      break
    case 'q':
      console.log(dim('  Bye!'))
      break
    default:
      console.log(red('  Invalid choice.'))
      process.exit(1)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--health') || args.includes('-h')) {
    await checkHealth()
    return
  }

  if (args.includes('--list') || args.includes('-l')) {
    await listModels()
    return
  }

  if (args.includes('--recommended') || args.includes('-r')) {
    await pullRecommended()
    return
  }

  if (args.includes('--all') || args.includes('-a')) {
    await pullAll()
    return
  }

  const pullIdx = args.indexOf('--pull')
  if (pullIdx !== -1) {
    const modelId = args[pullIdx + 1]
    if (!modelId) {
      console.error(red('  --pull requires a model name (e.g. qwen2.5-coder:7b)'))
      process.exit(1)
    }
    await pullModel(modelId)
    return
  }

  const removeIdx = args.indexOf('--remove')
  if (removeIdx !== -1) {
    const modelId = args[removeIdx + 1]
    if (!modelId) {
      console.error(red('  --remove requires a model name'))
      process.exit(1)
    }
    await removeModel(modelId)
    return
  }

  // No args — interactive menu
  await interactiveMenu()
}

main().catch((err) => {
  console.error(red(`\n  Error: ${err.message}\n`))
  process.exit(1)
})
