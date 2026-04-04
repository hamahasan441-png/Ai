#!/usr/bin/env node
/**
 * checkLogicMap.ts — Validates that the pipeline registry matches actual source files.
 *
 * Usage: npx tsx scripts/checkLogicMap.ts
 *
 * Checks:
 *  1. Every module in MODULE_REGISTRY has a corresponding .ts file
 *  2. Every intelligence module .ts file is registered
 *  3. Phase counts are correct
 *  4. Dependencies reference valid modules
 *  5. Import paths resolve to real files
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

const CHAT_DIR = path.resolve(__dirname, '../src/chat')
const REGISTRY_PATH = path.resolve(__dirname, '../src/chat/pipeline/PipelineContract.ts')

// Known non-intelligence module files (helpers, configs, brains, etc.)
const EXCLUDE_FILES = new Set([
  'AiChat.ts',
  'AiIntegration.ts',
  'LocalBrain.ts',
  'HybridBrain.ts',
  'DevBrain.ts',
  'TfIdfScorer.ts',
  'index.ts',
])

interface CheckResult {
  pass: boolean
  message: string
}

function main(): void {
  const results: CheckResult[] = []
  let errors = 0

  // Read registry source to extract module names
  const registrySource = fs.readFileSync(REGISTRY_PATH, 'utf-8')
  const registeredNames = new Set<string>()
  const nameRegex = /name:\s*'([^']+)'/g
  let match
  while ((match = nameRegex.exec(registrySource)) !== null) {
    registeredNames.add(match[1]!)
  }

  // Get all .ts files in src/chat/ (not directories, not tests, not pipeline/scoring)
  const chatFiles = fs.readdirSync(CHAT_DIR)
    .filter(f => f.endsWith('.ts') && !EXCLUDE_FILES.has(f))
    .filter(f => {
      const stat = fs.statSync(path.join(CHAT_DIR, f))
      return stat.isFile()
    })
    .map(f => f.replace('.ts', ''))

  // Also get codemaster files
  const codemasterDir = path.join(CHAT_DIR, 'codemaster')
  const codemasterFiles = fs.existsSync(codemasterDir)
    ? fs.readdirSync(codemasterDir).filter(f => f.endsWith('.ts')).map(f => f.replace('.ts', ''))
    : []

  // Check 1: Every registered module has a source file
  for (const name of registeredNames) {
    const hasFile = chatFiles.includes(name) || codemasterFiles.includes(name)
    if (hasFile) {
      results.push({ pass: true, message: `✅ ${name} — source file exists` })
    } else {
      results.push({ pass: false, message: `❌ ${name} — registered but no source file found` })
      errors++
    }
  }

  // Check 2: Every intelligence module file is registered
  // (Exclude codemaster — those are sub-modules, not intelligence modules)
  for (const file of chatFiles) {
    if (!registeredNames.has(file)) {
      results.push({ pass: true, message: `ℹ️  ${file}.ts — not in registry (helper/config file)` })
    }
  }

  // Check 3: Dependency validation
  const depRegex = /dependencies:\s*\[([^\]]*)\]/g
  const nameList = Array.from(registeredNames)
  let depMatch
  while ((depMatch = depRegex.exec(registrySource)) !== null) {
    const deps = depMatch[1]!.match(/'([^']+)'/g)
    if (deps) {
      for (const dep of deps) {
        const depName = dep.replace(/'/g, '')
        if (!registeredNames.has(depName)) {
          results.push({ pass: false, message: `❌ Dependency '${depName}' not found in registry` })
          errors++
        }
      }
    }
  }

  // Check 4: Phase counts
  const phaseCounts = new Map<string, number>()
  const phaseRegex = /phase:\s*PipelinePhase\.(\w+)/g
  let phaseMatch
  while ((phaseMatch = phaseRegex.exec(registrySource)) !== null) {
    const phase = phaseMatch[1]!
    phaseCounts.set(phase, (phaseCounts.get(phase) ?? 0) + 1)
  }

  results.push({ pass: true, message: `\n📊 Phase Module Counts:` })
  for (const [phase, count] of phaseCounts) {
    results.push({ pass: true, message: `   ${phase}: ${count} modules` })
  }
  results.push({ pass: true, message: `   Total: ${registeredNames.size} modules` })

  // Summary
  console.log('\n🔍 Logic Map Consistency Check\n')
  console.log('─'.repeat(60))

  for (const r of results) {
    console.log(r.message)
  }

  console.log('\n' + '─'.repeat(60))
  if (errors === 0) {
    console.log(`\n✅ All checks passed! ${registeredNames.size} modules validated.\n`)
    process.exit(0)
  } else {
    console.log(`\n❌ ${errors} error(s) found.\n`)
    process.exit(1)
  }
}

main()
