#!/usr/bin/env node
/**
 * download-models.js
 *
 * Downloads Qwen2.5-Coder and LLaMA GGUF model files directly from HuggingFace.
 * Models are stored in ~/.local/share/ai/models/
 *
 * Usage:
 *   npm run download-models              # interactive menu
 *   npm run download-models -- --qwen    # download Qwen2.5-Coder 7B Q4_K_M
 *   npm run download-models -- --llama   # download LLaMA 3.2 3B Q4_K_M
 *   npm run download-models -- --all     # download both defaults
 *   npm run download-models -- --list    # list all available models
 *
 * After downloading, start Ollama or llama.cpp to serve the models:
 *   ollama serve
 *   llama-server -m ~/.local/share/ai/models/<file>.gguf --port 11434
 */

'use strict'

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')
const readline = require('readline')

// ─── Color helpers ────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
}
const green = (s) => `${c.green}${s}${c.reset}`
const yellow = (s) => `${c.yellow}${s}${c.reset}`
const cyan = (s) => `${c.cyan}${s}${c.reset}`
const red = (s) => `${c.red}${s}${c.reset}`
const bold = (s) => `${c.bold}${s}${c.reset}`
const dim = (s) => `${c.dim}${s}${c.reset}`

// ─── Models catalogue ────────────────────────────────────────────────────────
const MODELS_DIR = path.join(os.homedir(), '.local', 'share', 'ai', 'models')

const MODELS = {
  // ── Qwen2.5-Coder ────────────────────────────────────────────────────────
  'qwen-7b-q4': {
    id: 'qwen2.5-coder-7b-instruct-q4_k_m',
    label: 'Qwen2.5-Coder 7B  Q4_K_M  ★ recommended',
    family: 'qwen',
    sizeInMb: 4680,
    url: 'https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q4_k_m.gguf',
    description: 'Best balance of quality and speed for code tasks. Needs ~6 GB RAM.',
  },
  'qwen-7b-q5': {
    id: 'qwen2.5-coder-7b-instruct-q5_k_m',
    label: 'Qwen2.5-Coder 7B  Q5_K_M',
    family: 'qwen',
    sizeInMb: 5320,
    url: 'https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q5_k_m.gguf',
    description: 'Higher quality. Needs ~7 GB RAM.',
  },
  'qwen-7b-q8': {
    id: 'qwen2.5-coder-7b-instruct-q8_0',
    label: 'Qwen2.5-Coder 7B  Q8_0  (highest quality)',
    family: 'qwen',
    sizeInMb: 8080,
    url: 'https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q8_0.gguf',
    description: 'Near-full precision. Needs ~10 GB RAM.',
  },
  'qwen-7b-q3': {
    id: 'qwen2.5-coder-7b-instruct-q3_k_m',
    label: 'Qwen2.5-Coder 7B  Q3_K_M  (lower RAM)',
    family: 'qwen',
    sizeInMb: 3600,
    url: 'https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q3_k_m.gguf',
    description: 'Needs ~5 GB RAM. Some quality loss.',
  },
  'qwen-7b-q2': {
    id: 'qwen2.5-coder-7b-instruct-q2_k',
    label: 'Qwen2.5-Coder 7B  Q2_K  (minimal RAM)',
    family: 'qwen',
    sizeInMb: 2860,
    url: 'https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q2_k.gguf',
    description: 'Needs ~4 GB RAM. Significant quality loss.',
  },
  // ── LLaMA 3.2 ────────────────────────────────────────────────────────────
  'llama-3b-q4': {
    id: 'llama-3.2-3b-instruct-q4_k_m',
    label: 'LLaMA 3.2 3B  Q4_K_M  ★ recommended',
    family: 'llama',
    sizeInMb: 2020,
    url: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    description: 'Fast and lightweight. Needs ~3 GB RAM. Great for general use.',
  },
  'llama-8b-q4': {
    id: 'llama-3.1-8b-instruct-q4_k_m',
    label: 'LLaMA 3.1 8B  Q4_K_M',
    family: 'llama',
    sizeInMb: 4920,
    url: 'https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf',
    description: 'More capable. Needs ~6 GB RAM.',
  },
  'llama-8b-q8': {
    id: 'llama-3.1-8b-instruct-q8_0',
    label: 'LLaMA 3.1 8B  Q8_0  (highest quality)',
    family: 'llama',
    sizeInMb: 8540,
    url: 'https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q8_0.gguf',
    description: 'Near full precision. Needs ~10 GB RAM.',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(dim(`  Created directory: ${dir}`))
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

function drawProgress(downloaded, total) {
  const cols = process.stdout.columns || 80
  const pct = total > 0 ? (downloaded / total) * 100 : 0
  const barWidth = Math.max(20, cols - 40)
  const filled = Math.round((pct / 100) * barWidth)
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled)
  const dl = formatBytes(downloaded)
  const tot = total > 0 ? formatBytes(total) : '???'
  process.stdout.write(`\r  [${cyan(bar)}] ${pct.toFixed(1)}%  ${dl} / ${tot}  `)
}

/**
 * Download a URL to a local file with progress bar.
 * Follows redirects (HuggingFace uses redirects to CDN).
 */
function downloadFile(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    const attempt = (currentUrl, redirectCount) => {
      if (redirectCount > 10) return reject(new Error('Too many redirects'))

      const proto = currentUrl.startsWith('https://') ? https : http
      proto.get(currentUrl, { headers: { 'User-Agent': 'ai-model-downloader/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return attempt(res.headers.location, redirectCount + 1)
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${currentUrl}`))
        }

        const total = parseInt(res.headers['content-length'] || '0', 10)
        let downloaded = 0
        const tmpPath = destPath + '.part'
        const out = fs.createWriteStream(tmpPath)

        res.on('data', (chunk) => {
          downloaded += chunk.length
          if (onProgress) onProgress(downloaded, total)
        })

        res.pipe(out)
        out.on('finish', () => {
          out.close(() => {
            fs.renameSync(tmpPath, destPath)
            resolve()
          })
        })
        out.on('error', reject)
        res.on('error', reject)
      }).on('error', reject)
    }
    attempt(url, 0)
  })
}

// ─── Commands ────────────────────────────────────────────────────────────────
function listModels() {
  console.log()
  console.log(bold('Available models:'))
  console.log()

  let prevFamily = null
  for (const [key, m] of Object.entries(MODELS)) {
    if (m.family !== prevFamily) {
      const header = m.family === 'qwen'
        ? '  ── Qwen2.5-Coder (code-optimised) ──────────────────────────'
        : '  ── LLaMA 3.x (general purpose) ─────────────────────────────'
      console.log(cyan(header))
      prevFamily = m.family
    }
    const dest = path.join(MODELS_DIR, `${m.id}.gguf`)
    const exists = fs.existsSync(dest)
    const status = exists ? green('✓ downloaded') : dim('not downloaded')
    console.log(`    ${bold(key.padEnd(16))}  ${m.label}`)
    console.log(`    ${''.padEnd(16)}  ${dim(m.description)}  [${m.sizeInMb} MB]  ${status}`)
  }

  console.log()
  console.log(dim(`  Models directory: ${MODELS_DIR}`))
  console.log()
  console.log('  Usage:')
  console.log(dim('    npm run download-models -- --qwen            # Qwen2.5-Coder 7B Q4_K_M'))
  console.log(dim('    npm run download-models -- --llama           # LLaMA 3.2 3B Q4_K_M'))
  console.log(dim('    npm run download-models -- --all             # both defaults'))
  console.log(dim('    npm run download-models -- --model qwen-7b-q8  # specific model'))
  console.log()
}

async function downloadModel(key) {
  const m = MODELS[key]
  if (!m) {
    console.error(red(`  Unknown model key: ${key}`))
    console.error(dim('  Run with --list to see available models'))
    process.exit(1)
  }

  ensureDir(MODELS_DIR)
  const dest = path.join(MODELS_DIR, `${m.id}.gguf`)

  if (fs.existsSync(dest)) {
    console.log(green(`  ✓ Already downloaded: ${m.id}.gguf`))
    return
  }

  console.log()
  console.log(`  ${bold('Downloading')} ${cyan(m.label)}`)
  console.log(dim(`  URL  : ${m.url}`))
  console.log(dim(`  Dest : ${dest}`))
  console.log(dim(`  Size : ~${m.sizeInMb} MB`))
  console.log()

  const start = Date.now()
  try {
    await downloadFile(m.url, dest, (dl, total) => drawProgress(dl, total))
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    process.stdout.write('\n')
    console.log(green(`  ✓ Done! Saved to ${dest}  (${elapsed}s)`))
  } catch (err) {
    process.stdout.write('\n')
    if (fs.existsSync(dest + '.part')) fs.unlinkSync(dest + '.part')
    throw err
  }

  console.log()
  console.log(bold('  Next steps:'))
  console.log(dim('  Start Ollama: ') + cyan('ollama serve'))
  console.log(dim('  Or llama.cpp: ') + cyan(`llama-server -m ${dest} --port 11434`))
  console.log()
}

async function interactiveMenu() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const q = (prompt) => new Promise((res) => rl.question(prompt, res))

  console.log()
  console.log(bold(cyan('  ╔══════════════════════════════════════════╗')))
  console.log(bold(cyan('  ║      AI Model Downloader                 ║')))
  console.log(bold(cyan('  ╚══════════════════════════════════════════╝')))
  console.log()
  console.log(dim('  Downloads GGUF models for offline local AI.'))
  console.log(dim(`  Models directory: ${MODELS_DIR}`))
  console.log()

  console.log('  Select a model to download:')
  console.log()
  const keys = Object.keys(MODELS)
  keys.forEach((k, i) => {
    const m = MODELS[k]
    const dest = path.join(MODELS_DIR, `${m.id}.gguf`)
    const exists = fs.existsSync(dest)
    const status = exists ? green(' ✓') : '  '
    const sep = k.startsWith('llama') && keys[i - 1] && keys[i - 1].startsWith('qwen') ? '\n' : ''
    process.stdout.write(sep)
    console.log(`  ${status} ${bold(String(i + 1).padStart(2))}) ${m.label}  ${dim('[' + m.sizeInMb + ' MB]')}`)
    console.log(`        ${dim(m.description)}`)
  })
  console.log()
  console.log(`       ${bold('a')}) Download both defaults (Qwen + LLaMA Q4_K_M)`)
  console.log(`       ${bold('q')}) Quit`)
  console.log()

  const answer = await q('  Your choice: ')
  rl.close()

  if (answer.toLowerCase() === 'q') {
    console.log(dim('  Bye!'))
    return
  }
  if (answer.toLowerCase() === 'a') {
    await downloadModel('qwen-7b-q4')
    await downloadModel('llama-3b-q4')
    return
  }

  const idx = parseInt(answer, 10) - 1
  if (idx >= 0 && idx < keys.length) {
    await downloadModel(keys[idx])
  } else {
    console.error(red('  Invalid selection.'))
    process.exit(1)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--list') || args.includes('-l')) {
    listModels()
    return
  }

  if (args.includes('--all')) {
    console.log(bold('\n  Downloading default models (Qwen2.5-Coder 7B + LLaMA 3.2 3B)…\n'))
    await downloadModel('qwen-7b-q4')
    await downloadModel('llama-3b-q4')
    return
  }

  if (args.includes('--qwen')) {
    await downloadModel('qwen-7b-q4')
    return
  }

  if (args.includes('--llama')) {
    await downloadModel('llama-3b-q4')
    return
  }

  const modelIdx = args.indexOf('--model')
  if (modelIdx !== -1) {
    const key = args[modelIdx + 1]
    if (!key) {
      console.error(red('  --model requires a model key (see --list)'))
      process.exit(1)
    }
    await downloadModel(key)
    return
  }

  // No args — show interactive menu
  await interactiveMenu()
}

main().catch((err) => {
  console.error(red(`\n  Error: ${err.message}\n`))
  process.exit(1)
})
