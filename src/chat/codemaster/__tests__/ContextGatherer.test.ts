import { describe, it, expect, beforeEach } from 'vitest'
import { ContextGatherer } from '../ContextGatherer'
import type { ImportRelation } from '../ContextGatherer'

let cg: ContextGatherer

beforeEach(() => {
  cg = new ContextGatherer()
})

// ══════════════════════════════════════════════════════════════════════════════
// extractSymbols — TypeScript / JavaScript
// ══════════════════════════════════════════════════════════════════════════════

describe('extractSymbols — TypeScript/JavaScript', () => {
  it('extracts an exported function', () => {
    const code = 'export function greet(name: string): string { return name }'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'greet', kind: 'function', isExported: true })
    expect(symbols[0].signature).toContain('greet')
  })

  it('extracts an exported async function', () => {
    const code = 'export async function fetchData(url: string): Promise<void> {}'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'fetchData', kind: 'function', isExported: true })
  })

  it('extracts an exported class', () => {
    const code = 'export class MyService {}'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'MyService', kind: 'class', isExported: true })
  })

  it('extracts an exported interface', () => {
    const code = 'export interface Config { key: string }'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'Config', kind: 'interface', isExported: true })
  })

  it('extracts an exported type alias', () => {
    const code = 'export type ID = string | number'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'ID', kind: 'type', isExported: true })
  })

  it('extracts an exported enum', () => {
    const code = 'export enum Direction { Up, Down }'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'Direction', kind: 'enum', isExported: true })
  })

  it('extracts an exported const', () => {
    const code = 'export const MAX_SIZE = 100'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'MAX_SIZE', kind: 'constant', isExported: true })
  })

  it('extracts an exported let', () => {
    const code = 'export let counter = 0'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'counter', kind: 'constant', isExported: true })
  })

  it('extracts a non-exported function', () => {
    const code = 'function helper() {}'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'helper', kind: 'function', isExported: false })
  })

  it('extracts a non-exported class', () => {
    const code = 'class InternalCache {}'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'InternalCache', kind: 'class', isExported: false })
  })

  it('collects multiple symbols from one file', () => {
    const code = [
      'export function a() {}',
      'export class B {}',
      'export interface C {}',
      'export type D = string',
      'export enum E { X }',
      'export const F = 1',
    ].join('\n')
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols).toHaveLength(6)
    const names = symbols.map(s => s.name)
    expect(names).toEqual(['a', 'B', 'C', 'D', 'E', 'F'])
  })

  it('reports correct line numbers', () => {
    const code = 'line1\nexport function foo() {}\nline3'
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols[0].line).toBe(2)
  })

  it('sets filePath on every symbol', () => {
    const code = 'export function x() {}'
    const symbols = cg.extractSymbols(code, 'src/utils.ts')
    expect(symbols[0].filePath).toBe('src/utils.ts')
  })

  it('returns empty array for code with no symbols', () => {
    const symbols = cg.extractSymbols('// just a comment', 'file.ts')
    expect(symbols).toEqual([])
  })

  it('extracts JSDoc description from preceding block comment', () => {
    const code = [
      '/**',
      ' * Does greeting stuff.',
      ' */',
      'export function greet() {}',
    ].join('\n')
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols[0].description).toContain('greeting')
  })

  it('extracts multi-line JSDoc', () => {
    const code = [
      '/**',
      ' * Multi-line doc.',
      ' * More info here.',
      ' */',
      'export function multi() {}',
    ].join('\n')
    const symbols = cg.extractSymbols(code, 'file.ts')
    expect(symbols[0].description).toContain('Multi-line doc')
  })

  it('works with explicit language override', () => {
    const code = 'export function test() {}'
    const symbols = cg.extractSymbols(code, 'no-extension', 'typescript')
    expect(symbols).toHaveLength(1)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// extractSymbols — Python
// ══════════════════════════════════════════════════════════════════════════════

describe('extractSymbols — Python', () => {
  it('extracts a public function', () => {
    const code = 'def process(data):\n    pass'
    const symbols = cg.extractSymbols(code, 'main.py')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'process', kind: 'function', isExported: true })
  })

  it('extracts a private function (underscore prefix)', () => {
    const code = 'def _helper(x):\n    pass'
    const symbols = cg.extractSymbols(code, 'main.py')
    expect(symbols[0].isExported).toBe(false)
  })

  it('extracts an async def', () => {
    const code = 'async def fetch(url):\n    pass'
    const symbols = cg.extractSymbols(code, 'main.py')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'fetch', kind: 'function' })
  })

  it('extracts a class', () => {
    const code = 'class MyModel:\n    pass'
    const symbols = cg.extractSymbols(code, 'models.py')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'MyModel', kind: 'class', isExported: true })
  })

  it('marks a private class as non-exported', () => {
    const code = 'class _Internal:\n    pass'
    const symbols = cg.extractSymbols(code, 'models.py')
    expect(symbols[0].isExported).toBe(false)
  })

  it('includes the signature for def', () => {
    const code = 'def calculate(a, b):\n    return a + b'
    const symbols = cg.extractSymbols(code, 'math.py')
    expect(symbols[0].signature).toBe('def calculate(a, b)')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// extractSymbols — Go
// ══════════════════════════════════════════════════════════════════════════════

describe('extractSymbols — Go', () => {
  it('extracts an exported function (uppercase)', () => {
    const code = 'func Handle(w http.ResponseWriter, r *http.Request) {}'
    const symbols = cg.extractSymbols(code, 'server.go')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'Handle', kind: 'function', isExported: true })
  })

  it('extracts a private function (lowercase)', () => {
    const code = 'func helper(x int) int { return x }'
    const symbols = cg.extractSymbols(code, 'util.go')
    expect(symbols[0].isExported).toBe(false)
  })

  it('extracts a struct', () => {
    const code = 'type Config struct {\n    Port int\n}'
    const symbols = cg.extractSymbols(code, 'config.go')
    expect(symbols[0]).toMatchObject({ name: 'Config', kind: 'class', isExported: true })
  })

  it('extracts a private struct', () => {
    const code = 'type config struct {}'
    const symbols = cg.extractSymbols(code, 'config.go')
    expect(symbols[0].isExported).toBe(false)
  })

  it('extracts an interface', () => {
    const code = 'type Reader interface {\n    Read(p []byte) (n int, err error)\n}'
    const symbols = cg.extractSymbols(code, 'io.go')
    expect(symbols[0]).toMatchObject({ name: 'Reader', kind: 'interface', isExported: true })
  })

  it('marks a lowercase interface as private', () => {
    const code = 'type reader interface {}'
    const symbols = cg.extractSymbols(code, 'io.go')
    expect(symbols[0].isExported).toBe(false)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// extractSymbols — Rust
// ══════════════════════════════════════════════════════════════════════════════

describe('extractSymbols — Rust', () => {
  it('extracts a pub fn', () => {
    const code = 'pub fn process(data: &str) -> Result<()> {}'
    const symbols = cg.extractSymbols(code, 'lib.rs')
    expect(symbols).toHaveLength(1)
    expect(symbols[0]).toMatchObject({ name: 'process', kind: 'function', isExported: true })
  })

  it('extracts a pub async fn', () => {
    const code = 'pub async fn fetch(url: &str) -> Response {}'
    const symbols = cg.extractSymbols(code, 'lib.rs')
    expect(symbols[0]).toMatchObject({ name: 'fetch', kind: 'function', isExported: true })
  })

  it('extracts a pub struct', () => {
    const code = 'pub struct Config {\n    pub port: u16,\n}'
    const symbols = cg.extractSymbols(code, 'config.rs')
    expect(symbols[0]).toMatchObject({ name: 'Config', kind: 'class', isExported: true })
  })

  it('extracts a pub trait', () => {
    const code = 'pub trait Handler {\n    fn handle(&self);\n}'
    const symbols = cg.extractSymbols(code, 'handler.rs')
    expect(symbols[0]).toMatchObject({ name: 'Handler', kind: 'interface', isExported: true })
  })

  it('does not extract private fn', () => {
    const code = 'fn private_helper() {}'
    const symbols = cg.extractSymbols(code, 'lib.rs')
    expect(symbols).toHaveLength(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// extractImports — TypeScript / JavaScript
// ══════════════════════════════════════════════════════════════════════════════

describe('extractImports — TypeScript/JavaScript', () => {
  it('extracts named imports', () => {
    const code = "import { foo, bar } from './utils'"
    const imports = cg.extractImports(code, 'file.ts')
    expect(imports).toHaveLength(1)
    expect(imports[0].importedSymbols).toEqual(['foo', 'bar'])
    expect(imports[0].targetFile).toBe('./utils')
    expect(imports[0].isTypeOnly).toBe(false)
  })

  it('extracts default import', () => {
    const code = "import React from 'react'"
    const imports = cg.extractImports(code, 'file.tsx')
    expect(imports).toHaveLength(1)
    expect(imports[0].importedSymbols).toEqual(['React'])
    expect(imports[0].targetFile).toBe('react')
  })

  it('extracts type-only imports', () => {
    const code = "import type { Config } from './config'"
    const imports = cg.extractImports(code, 'file.ts')
    expect(imports).toHaveLength(1)
    expect(imports[0].isTypeOnly).toBe(true)
    expect(imports[0].importedSymbols).toEqual(['Config'])
  })

  it('handles aliased imports', () => {
    const code = "import { foo as bar } from './mod'"
    const imports = cg.extractImports(code, 'file.ts')
    expect(imports[0].importedSymbols).toEqual(['foo'])
  })

  it('extracts multiple import lines', () => {
    const code = [
      "import { a } from './a'",
      "import { b } from './b'",
    ].join('\n')
    const imports = cg.extractImports(code, 'file.ts')
    expect(imports).toHaveLength(2)
  })

  it('sets sourceFile to the given filePath', () => {
    const code = "import { x } from './x'"
    const imports = cg.extractImports(code, 'src/main.ts')
    expect(imports[0].sourceFile).toBe('src/main.ts')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// extractImports — Python
// ══════════════════════════════════════════════════════════════════════════════

describe('extractImports — Python', () => {
  it('extracts from...import', () => {
    const code = 'from os.path import join, exists'
    const imports = cg.extractImports(code, 'main.py')
    expect(imports).toHaveLength(1)
    expect(imports[0].targetFile).toBe('os.path')
    expect(imports[0].importedSymbols).toEqual(['join', 'exists'])
    expect(imports[0].isTypeOnly).toBe(false)
  })

  it('handles aliased Python imports', () => {
    const code = 'from collections import OrderedDict as OD'
    const imports = cg.extractImports(code, 'main.py')
    expect(imports[0].importedSymbols).toEqual(['OrderedDict'])
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// extractImports — Go
// ══════════════════════════════════════════════════════════════════════════════

describe('extractImports — Go', () => {
  it('extracts a single go import', () => {
    const code = 'import "fmt"'
    const imports = cg.extractImports(code, 'main.go')
    expect(imports).toHaveLength(1)
    expect(imports[0].targetFile).toBe('fmt')
    expect(imports[0].importedSymbols).toEqual([])
  })

  it('returns empty for code without imports', () => {
    const code = 'package main\n\nfunc main() {}'
    const imports = cg.extractImports(code, 'main.go')
    expect(imports).toEqual([])
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// scoreRelevance
// ══════════════════════════════════════════════════════════════════════════════

describe('scoreRelevance', () => {
  it('returns higher score when filename matches task keyword', () => {
    const score = cg.scoreRelevance('src/auth.ts', 'const x = 1', 'fix auth bug')
    expect(score).toBeGreaterThan(0.3)
  })

  it('returns higher score when content matches task keywords', () => {
    const score = cg.scoreRelevance('src/utils.ts', 'function authenticate() {}', 'authenticate users')
    expect(score).toBeGreaterThan(0)
  })

  it('boosts test files for test-related tasks', () => {
    const scoreTest = cg.scoreRelevance('auth.test.ts', '', 'write test for auth')
    const scoreNormal = cg.scoreRelevance('auth.ts', '', 'write test for auth')
    expect(scoreTest).toBeGreaterThan(scoreNormal)
  })

  it('boosts spec files for test-related tasks', () => {
    const scoreSpec = cg.scoreRelevance('auth.spec.ts', '', 'write test for auth')
    expect(scoreSpec).toBeGreaterThan(0)
  })

  it('boosts type files for type-related tasks', () => {
    const scoreType = cg.scoreRelevance('src/types.ts', '', 'update type definitions')
    const scoreOther = cg.scoreRelevance('src/utils.ts', '', 'update type definitions')
    expect(scoreType).toBeGreaterThan(scoreOther)
  })

  it('boosts interface files for interface-related tasks', () => {
    const scoreIface = cg.scoreRelevance('src/interfaces.ts', '', 'refactor interface')
    expect(scoreIface).toBeGreaterThan(0)
  })

  it('gives index files a relevance boost', () => {
    const score = cg.scoreRelevance('src/index.ts', '', 'unrelated task')
    expect(score).toBeGreaterThan(0)
  })

  it('gives index.js a relevance boost', () => {
    const score = cg.scoreRelevance('src/index.js', '', 'unrelated task')
    expect(score).toBeGreaterThan(0)
  })

  it('caps the score at 1.0', () => {
    const score = cg.scoreRelevance(
      'test/auth.test.ts',
      'auth authenticate token test type interface',
      'test auth authenticate token type interface',
    )
    expect(score).toBeLessThanOrEqual(1.0)
  })

  it('returns 0 for completely unrelated file', () => {
    const score = cg.scoreRelevance('readme.md', 'hello world', 'a b')
    expect(score).toBe(0)
  })

  it('ignores short words (<=2 chars) in the task', () => {
    const score = cg.scoreRelevance('x.ts', 'x', 'do it')
    expect(score).toBe(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// summarizeFile
// ══════════════════════════════════════════════════════════════════════════════

describe('summarizeFile', () => {
  const sampleCode = [
    "import { helper } from './helper'",
    'export function greet() {}',
    'export class Service {}',
  ].join('\n')

  it('returns correct filePath', () => {
    const summary = cg.summarizeFile(sampleCode, 'src/app.ts')
    expect(summary.filePath).toBe('src/app.ts')
  })

  it('detects language from extension', () => {
    const summary = cg.summarizeFile(sampleCode, 'src/app.ts')
    expect(summary.language).toBe('typescript')
  })

  it('counts total lines', () => {
    const summary = cg.summarizeFile(sampleCode, 'src/app.ts')
    expect(summary.totalLines).toBe(3)
  })

  it('lists exported symbol names', () => {
    const summary = cg.summarizeFile(sampleCode, 'src/app.ts')
    expect(summary.exports).toContain('greet')
    expect(summary.exports).toContain('Service')
  })

  it('lists imported modules', () => {
    const summary = cg.summarizeFile(sampleCode, 'src/app.ts')
    expect(summary.imports).toContain('./helper')
  })

  it('collects signatures', () => {
    const summary = cg.summarizeFile(sampleCode, 'src/app.ts')
    expect(summary.signatures.length).toBeGreaterThan(0)
  })

  it('builds summaryText with path, language, and line count', () => {
    const summary = cg.summarizeFile(sampleCode, 'src/app.ts')
    expect(summary.summaryText).toContain('src/app.ts')
    expect(summary.summaryText).toContain('typescript')
    expect(summary.summaryText).toContain('3 lines')
  })

  it('includes exports in summaryText', () => {
    const summary = cg.summarizeFile(sampleCode, 'src/app.ts')
    expect(summary.summaryText).toContain('Exports:')
    expect(summary.summaryText).toContain('greet')
  })

  it('includes imports in summaryText', () => {
    const summary = cg.summarizeFile(sampleCode, 'src/app.ts')
    expect(summary.summaryText).toContain('Imports:')
    expect(summary.summaryText).toContain('./helper')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// gatherContext
// ══════════════════════════════════════════════════════════════════════════════

describe('gatherContext', () => {
  function makeFiles(): Map<string, string> {
    const files = new Map<string, string>()
    files.set('src/auth.ts', [
      "import { hash } from './crypto'",
      'export function login(user: string) {}',
      'export function logout() {}',
    ].join('\n'))
    files.set('src/crypto.ts', [
      'export function hash(data: string): string { return data }',
    ].join('\n'))
    files.set('src/index.ts', [
      "import { login } from './auth'",
      'export { login }',
    ].join('\n'))
    files.set('test/auth.test.ts', [
      "import { login } from '../src/auth'",
      "describe('login', () => { it('works', () => {}) })",
    ].join('\n'))
    files.set('docs/readme.md', 'Some documentation')
    return files
  }

  it('returns primaryFiles with relevance > 0.2', () => {
    const ctx = cg.gatherContext('fix auth login', makeFiles())
    expect(ctx.primaryFiles.length).toBeGreaterThan(0)
    for (const f of ctx.primaryFiles) {
      expect(f.relevance).toBeGreaterThan(0.2)
    }
  })

  it('returns supportingFiles with relevance between 0.05 and 0.2', () => {
    const ctx = cg.gatherContext('fix auth login', makeFiles())
    for (const f of ctx.supportingFiles) {
      expect(f.relevance).toBeGreaterThan(0.05)
      expect(f.relevance).toBeLessThanOrEqual(0.2)
    }
  })

  it('collects symbols from all files', () => {
    const ctx = cg.gatherContext('fix auth', makeFiles())
    const names = ctx.symbols.map(s => s.name)
    expect(names).toContain('login')
    expect(names).toContain('hash')
  })

  it('builds an import graph', () => {
    const ctx = cg.gatherContext('fix auth', makeFiles())
    expect(ctx.importGraph.length).toBeGreaterThan(0)
    const targets = ctx.importGraph.map(r => r.targetFile)
    expect(targets).toContain('./crypto')
  })

  it('generates summaries for relevant files', () => {
    const ctx = cg.gatherContext('fix auth', makeFiles())
    expect(ctx.summaries.length).toBeGreaterThan(0)
  })

  it('reports totalContextSize', () => {
    const ctx = cg.gatherContext('fix auth', makeFiles())
    expect(ctx.totalContextSize).toBeGreaterThan(0)
  })

  it('respects maxPrimaryFiles option', () => {
    const ctx = cg.gatherContext('fix auth login', makeFiles(), { maxPrimaryFiles: 1 })
    expect(ctx.primaryFiles.length).toBeLessThanOrEqual(1)
  })

  it('respects maxSupportingFiles option', () => {
    const ctx = cg.gatherContext('fix auth login', makeFiles(), { maxSupportingFiles: 0 })
    expect(ctx.supportingFiles).toHaveLength(0)
  })

  it('sorts primary files by relevance descending', () => {
    const ctx = cg.gatherContext('fix auth login', makeFiles())
    for (let i = 1; i < ctx.primaryFiles.length; i++) {
      expect(ctx.primaryFiles[i - 1].relevance).toBeGreaterThanOrEqual(ctx.primaryFiles[i].relevance)
    }
  })

  it('assigns reason "high keyword match" when relevance > 0.5', () => {
    const ctx = cg.gatherContext('fix auth login', makeFiles())
    const high = ctx.primaryFiles.find(f => f.relevance > 0.5)
    if (high) expect(high.reason).toBe('high keyword match')
  })

  it('assigns reason "partial keyword match" when relevance is 0.2–0.5', () => {
    const ctx = cg.gatherContext('fix auth', makeFiles())
    const partial = ctx.primaryFiles.find(f => f.relevance > 0.2 && f.relevance <= 0.5)
    if (partial) expect(partial.reason).toBe('partial keyword match')
  })

  it('handles an empty file map', () => {
    const ctx = cg.gatherContext('anything', new Map())
    expect(ctx.primaryFiles).toEqual([])
    expect(ctx.supportingFiles).toEqual([])
    expect(ctx.symbols).toEqual([])
    expect(ctx.importGraph).toEqual([])
    expect(ctx.summaries).toEqual([])
    expect(ctx.totalContextSize).toBe(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// findDependents
// ══════════════════════════════════════════════════════════════════════════════

describe('findDependents', () => {
  const graph: ImportRelation[] = [
    { sourceFile: 'src/app.ts', targetFile: './auth', importedSymbols: ['login'], isTypeOnly: false },
    { sourceFile: 'src/index.ts', targetFile: './auth', importedSymbols: ['logout'], isTypeOnly: false },
    { sourceFile: 'src/app.ts', targetFile: './utils', importedSymbols: ['format'], isTypeOnly: false },
  ]

  it('finds all files that import from a target', () => {
    const deps = cg.findDependents('auth', graph)
    expect(deps).toContain('src/app.ts')
    expect(deps).toContain('src/index.ts')
  })

  it('does not include files that import from a different module', () => {
    const deps = cg.findDependents('auth', graph)
    expect(deps).not.toContain('src/utils.ts')
  })

  it('returns empty array when no dependents exist', () => {
    const deps = cg.findDependents('nonexistent', graph)
    expect(deps).toEqual([])
  })

  it('strips extension when matching', () => {
    const deps = cg.findDependents('auth.ts', graph)
    expect(deps).toContain('src/app.ts')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// findDependencies
// ══════════════════════════════════════════════════════════════════════════════

describe('findDependencies', () => {
  const graph: ImportRelation[] = [
    { sourceFile: 'src/app.ts', targetFile: './auth', importedSymbols: ['login'], isTypeOnly: false },
    { sourceFile: 'src/app.ts', targetFile: './utils', importedSymbols: ['format'], isTypeOnly: false },
    { sourceFile: 'src/index.ts', targetFile: './app', importedSymbols: [], isTypeOnly: false },
  ]

  it('finds all modules imported by a given file', () => {
    const deps = cg.findDependencies('src/app.ts', graph)
    expect(deps).toContain('./auth')
    expect(deps).toContain('./utils')
  })

  it('does not include modules imported by other files', () => {
    const deps = cg.findDependencies('src/app.ts', graph)
    expect(deps).not.toContain('./app')
  })

  it('returns empty when file has no imports', () => {
    const deps = cg.findDependencies('src/nothing.ts', graph)
    expect(deps).toEqual([])
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// traceSymbol
// ══════════════════════════════════════════════════════════════════════════════

describe('traceSymbol', () => {
  function makeTraceFiles(): Map<string, string> {
    const files = new Map<string, string>()
    files.set('src/math.ts', [
      'export function add(a: number, b: number) { return a + b }',
    ].join('\n'))
    files.set('src/app.ts', [
      "import { add } from './math'",
      'const result = add(1, 2)',
    ].join('\n'))
    files.set('src/other.ts', [
      '// no usage of add here',
      'const x = 42',
    ].join('\n'))
    return files
  }

  it('finds the definition of a symbol', () => {
    const trace = cg.traceSymbol('add', makeTraceFiles())
    expect(trace.definition).not.toBeNull()
    expect(trace.definition!.name).toBe('add')
    expect(trace.definition!.filePath).toBe('src/math.ts')
  })

  it('finds usages in other files', () => {
    const trace = cg.traceSymbol('add', makeTraceFiles())
    const usageFiles = trace.usages.map(u => u.filePath)
    expect(usageFiles).toContain('src/app.ts')
  })

  it('does not count the definition line as a usage', () => {
    const trace = cg.traceSymbol('add', makeTraceFiles())
    const defLine = trace.definition!.line
    const defFileUsages = trace.usages.filter(
      u => u.filePath === 'src/math.ts' && u.line === defLine,
    )
    expect(defFileUsages).toHaveLength(0)
  })

  it('returns null definition for an unknown symbol', () => {
    const trace = cg.traceSymbol('nonexistent', makeTraceFiles())
    expect(trace.definition).toBeNull()
  })

  it('returns empty usages for an unused symbol', () => {
    const files = new Map<string, string>()
    files.set('src/lonely.ts', 'export function lonely() {}')
    const trace = cg.traceSymbol('lonely', files)
    expect(trace.definition).not.toBeNull()
    // only the definition line itself, which is excluded
    expect(trace.usages).toHaveLength(0)
  })

  it('finds multiple usages in the same file', () => {
    const files = new Map<string, string>()
    files.set('src/def.ts', 'export function calc() {}')
    files.set('src/use.ts', 'calc()\ncalc()')
    const trace = cg.traceSymbol('calc', files)
    const useFileUsages = trace.usages.filter(u => u.filePath === 'src/use.ts')
    expect(useFileUsages).toHaveLength(2)
  })
})
