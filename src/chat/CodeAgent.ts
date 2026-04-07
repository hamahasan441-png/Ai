/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║   🏗️  C O D E   A G E N T  —  SMART CODING ENGINEER                       ║
 * ║                                                                             ║
 * ║   An AI agent that writes code like an engineer:                            ║
 * ║     ✦ Creates files with proper directory structures                        ║
 * ║     ✦ Generates cross-linked code (imports/exports)                         ║
 * ║     ✦ Scaffolds full projects with config files                             ║
 * ║     ✦ Writes production-quality code with error handling                    ║
 * ║     ✦ Auto-generates tests alongside source code                            ║
 * ║     ✦ Adds config files (eslint, prettier, docker, CI/CD)                   ║
 * ║     ✦ Supports 10+ project templates                                        ║
 * ║     ✦ Smart dependency detection & import generation                        ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully offline.                                  ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES                                                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Supported project templates. */
export type ProjectTemplate =
  | 'rest-api'
  | 'react-app'
  | 'cli-tool'
  | 'library'
  | 'express-server'
  | 'fullstack'
  | 'microservice'
  | 'monorepo'
  | 'chrome-extension'
  | 'discord-bot'
  | 'next-app'
  | 'electron-app'

/** Supported target languages for scaffolding. */
export type ScaffoldLanguage = 'typescript' | 'javascript' | 'python' | 'go' | 'rust'

/** A file to be created by the agent. */
export interface AgentFile {
  /** Relative path from project root (e.g. "src/index.ts"). */
  path: string
  /** File content. */
  content: string
  /** Language of this file. */
  language: string
  /** Lines of code. */
  lines: number
  /** What this file does. */
  purpose: string
}

/** Result of scaffolding a project. */
export interface ScaffoldResult {
  /** Project name. */
  name: string
  /** Template used. */
  template: ProjectTemplate
  /** Language used. */
  language: ScaffoldLanguage
  /** All generated files. */
  files: AgentFile[]
  /** Total lines of code. */
  totalLines: number
  /** Human-readable summary. */
  summary: string
  /** Directory structure as a tree string. */
  directoryTree: string
  /** Instructions for the user. */
  instructions: string[]
}

/** Request to create a single file with smart code. */
export interface CreateFileRequest {
  /** File path (e.g. "src/utils/logger.ts"). */
  path: string
  /** What this file should do. */
  description: string
  /** Language (auto-detected from extension if not provided). */
  language?: ScaffoldLanguage
  /** Existing files in the project for cross-reference. */
  existingFiles?: Array<{ path: string; exports?: string[] }>
  /** Style preference. */
  style?: 'concise' | 'detailed' | 'production'
}

/** Result of creating a single file. */
export interface CreateFileResult {
  /** The generated file. */
  file: AgentFile
  /** Imports that were added to link to existing files. */
  importsAdded: string[]
  /** Exports that this file provides. */
  exportsProvided: string[]
}

/** Request to add code to an existing file. */
export interface AddToFileRequest {
  /** File path. */
  path: string
  /** What to add. */
  description: string
  /** Existing content of the file. */
  existingContent: string
  /** Where to add: 'top', 'bottom', 'after-imports', 'before-exports'. */
  position?: 'top' | 'bottom' | 'after-imports' | 'before-exports'
}

/** Result of adding code to a file. */
export interface AddToFileResult {
  /** Updated full file content. */
  content: string
  /** The code that was added. */
  addedCode: string
  /** New line count. */
  lines: number
  /** What changed. */
  summary: string
}

/** Request to export something from a file. */
export interface ExportFromFileRequest {
  /** File path. */
  path: string
  /** What to export. */
  symbolName: string
  /** Kind of export. */
  kind: 'function' | 'class' | 'interface' | 'type' | 'const' | 'default'
  /** Existing content. */
  existingContent: string
}

/** Configuration for the CodeAgent. */
export interface CodeAgentConfig {
  /** Default language for new files. */
  defaultLanguage: ScaffoldLanguage
  /** Default style. */
  defaultStyle: 'concise' | 'detailed' | 'production'
  /** Include test files alongside source. */
  includeTests: boolean
  /** Include config files in scaffolds. */
  includeConfigs: boolean
  /** Include Docker files. */
  includeDocker: boolean
  /** Include CI/CD files. */
  includeCI: boolean
  /** Include README. */
  includeReadme: boolean
}

/** Stats tracked by the CodeAgent. */
export interface CodeAgentStats {
  filesCreated: number
  projectsScaffolded: number
  linesGenerated: number
  importsResolved: number
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  HELPER FUNCTIONS                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Detect language from file extension. */
function detectLanguageFromPath(filePath: string): ScaffoldLanguage {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, ScaffoldLanguage> = {
    ts: 'typescript', tsx: 'typescript', mts: 'typescript', cts: 'typescript',
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    py: 'python', go: 'go', rs: 'rust',
  }
  return map[ext] ?? 'typescript'
}

/** Convert a string to PascalCase. */
function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toUpperCase())
}

/** Convert a string to camelCase. */
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/** Convert a string to kebab-case. */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/** Build a directory tree string from file paths. */
function buildDirectoryTree(files: AgentFile[]): string {
  const dirs = new Set<string>()
  for (const f of files) {
    const parts = f.path.split('/')
    for (let i = 1; i < parts.length; i++) {
      dirs.add(parts.slice(0, i).join('/'))
    }
  }
  const allEntries = [...Array.from(dirs), ...files.map(f => f.path)].sort()
  const unique = [...new Set(allEntries)]

  const lines: string[] = []
  for (const entry of unique) {
    const depth = entry.split('/').length - 1
    const name = entry.split('/').pop()!
    const isFile = files.some(f => f.path === entry)
    const prefix = '  '.repeat(depth) + (isFile ? '├── ' : '├── ')
    lines.push(prefix + name + (isFile ? '' : '/'))
  }
  return lines.join('\n')
}

/** Generate an import statement for a given language. */
function generateImport(fromPath: string, symbols: string[], lang: ScaffoldLanguage): string {
  // Remove extension for import path
  const importPath = fromPath.replace(/\.(ts|tsx|js|jsx)$/, '')
  switch (lang) {
    case 'typescript':
    case 'javascript':
      return `import { ${symbols.join(', ')} } from './${importPath}'`
    case 'python':
      return `from ${importPath.replace(/\//g, '.')} import ${symbols.join(', ')}`
    case 'go':
      return `import "${importPath}"`
    case 'rust':
      return `use crate::${importPath.replace(/\//g, '::')}::{${symbols.join(', ')}};`
    default:
      return `import { ${symbols.join(', ')} } from './${importPath}'`
  }
}

/** Build a comment block for a given language. */
function buildComment(text: string, lang: ScaffoldLanguage): string {
  switch (lang) {
    case 'python':
      return `"""${text}"""`
    case 'rust':
      return `/// ${text}`
    case 'go':
      return `// ${text}`
    default:
      return `/** ${text} */`
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  PROJECT TEMPLATES                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Generate a package.json file. */
function generatePackageJson(name: string, template: ProjectTemplate, lang: ScaffoldLanguage): string {
  const isTs = lang === 'typescript'
  const base: Record<string, unknown> = {
    name: toKebabCase(name),
    version: '1.0.0',
    description: `${toPascalCase(name)} — generated by CodeAgent`,
    main: isTs ? 'dist/index.js' : 'src/index.js',
    scripts: {} as Record<string, string>,
    keywords: [],
    license: 'MIT',
  }

  const scripts = base.scripts as Record<string, string>

  if (isTs) {
    scripts['build'] = 'tsc'
    scripts['dev'] = 'tsx watch src/index.ts'
    scripts['start'] = 'node dist/index.js'
    scripts['typecheck'] = 'tsc --noEmit'
  } else {
    scripts['start'] = 'node src/index.js'
    scripts['dev'] = 'node --watch src/index.js'
  }
  scripts['test'] = 'vitest run'
  scripts['lint'] = 'eslint . --max-warnings 0'

  if (template === 'rest-api' || template === 'express-server') {
    scripts['dev'] = isTs ? 'tsx watch src/server.ts' : 'node --watch src/server.js'
  }

  return JSON.stringify(base, null, 2)
}

/** Generate a tsconfig.json. */
function generateTsConfig(template: ProjectTemplate): string {
  const config = {
    compilerOptions: {
      target: 'ES2022',
      module: 'Node16',
      moduleResolution: 'Node16',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      ...(template === 'react-app' || template === 'next-app'
        ? { jsx: 'react-jsx', lib: ['ES2022', 'DOM', 'DOM.Iterable'] }
        : { lib: ['ES2022'] }),
    },
    include: ['src'],
    exclude: ['node_modules', 'dist'],
  }
  return JSON.stringify(config, null, 2)
}

/** Generate a .gitignore. */
function generateGitignore(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
*.js.map
*.d.ts.map

# Test
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`
}

/** Generate a .eslintrc / eslint config. */
function generateEslintConfig(lang: ScaffoldLanguage): string {
  if (lang === 'typescript') {
    return `import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
)
`
  }
  return `import eslint from '@eslint/js'

export default [
  eslint.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
`
}

/** Generate a Dockerfile. */
function generateDockerfile(lang: ScaffoldLanguage): string {
  if (lang === 'python') {
    return `FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "src/main.py"]
`
  }

  if (lang === 'go') {
    return `FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server ./cmd/server

FROM alpine:3.19
COPY --from=builder /app/server /server
EXPOSE 8080
CMD ["/server"]
`
  }

  return `FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
`
}

/** Generate a GitHub Actions CI config. */
function generateCIConfig(lang: ScaffoldLanguage): string {
  if (lang === 'python') {
    return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      - run: python -m pytest
`
  }

  return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run${lang === 'typescript' ? ' typecheck\n      - run: npm run' : ''} test
`
}

/** Generate a README.md. */
function generateReadme(name: string, template: ProjectTemplate, lang: ScaffoldLanguage, files: AgentFile[]): string {
  const pascalName = toPascalCase(name)
  return `# ${pascalName}

> Generated by CodeAgent

## Overview

${template === 'rest-api' ? 'A RESTful API server' :
  template === 'react-app' ? 'A React application' :
  template === 'cli-tool' ? 'A command-line tool' :
  template === 'library' ? 'A reusable library' :
  template === 'express-server' ? 'An Express.js server' :
  template === 'fullstack' ? 'A full-stack application' :
  template === 'microservice' ? 'A microservice' :
  template === 'discord-bot' ? 'A Discord bot' :
  template === 'chrome-extension' ? 'A Chrome extension' :
  'A project'} built with ${lang === 'typescript' ? 'TypeScript' : lang}.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## Project Structure

\`\`\`
${buildDirectoryTree(files)}
\`\`\`

## Files

| File | Purpose |
|------|---------|
${files.map(f => `| \`${f.path}\` | ${f.purpose} |`).join('\n')}

## License

MIT
`
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4  TEMPLATE GENERATORS — Per-template code generation                     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

function generateRestApiFiles(name: string, lang: ScaffoldLanguage): AgentFile[] {
  const isTs = lang === 'typescript'
  const ext = isTs ? 'ts' : 'js'
  const typeSuffix = isTs ? ': string' : ''
  const typeNum = isTs ? ': number' : ''
  const typeVoid = isTs ? ': void' : ''
  const typeAny = isTs ? ': unknown' : ''
  const reqType = isTs ? ': Request' : ''
  const resType = isTs ? ': Response' : ''
  const kebab = toKebabCase(name)

  const files: AgentFile[] = []

  // src/index.ts — entry point
  const indexContent = `${buildComment(`${toPascalCase(name)} — REST API Server`, lang)}

import { createServer } from './server'

const PORT = parseInt(process.env['PORT'] ?? '3000', 10)

const server = createServer()

server.listen(PORT, () => {
  console.log(\`🚀 ${toPascalCase(name)} server running on http://localhost:\${PORT}\`)
  console.log(\`📚 Health check: http://localhost:\${PORT}/health\`)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...')
  server.close(() => process.exit(0))
})
`
  files.push({
    path: `src/index.${ext}`,
    content: indexContent,
    language: lang,
    lines: indexContent.split('\n').length,
    purpose: 'Application entry point — starts the HTTP server',
  })

  // src/server.ts — server setup
  const serverContent = `${buildComment('HTTP server factory with middleware and routes', lang)}

import http from 'node:http'
import { router } from './routes'
import { jsonMiddleware, corsMiddleware, errorMiddleware } from './middleware'

export function createServer()${isTs ? ': http.Server' : ''} {
  const server = http.createServer(async (req${reqType}, res${resType}) => {
    try {
      corsMiddleware(req, res)

      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
      }

      await jsonMiddleware(req, res)
      await router(req, res)
    } catch (err) {
      errorMiddleware(err${typeAny}, req, res)
    }
  })

  return server
}
`
  files.push({
    path: `src/server.${ext}`,
    content: serverContent,
    language: lang,
    lines: serverContent.split('\n').length,
    purpose: 'HTTP server factory with middleware pipeline',
  })

  // src/routes.ts — route definitions
  const routesContent = `${buildComment('API route definitions', lang)}

import type { IncomingMessage, ServerResponse } from 'node:http'
import * as controller from './controller'

${isTs ? `interface ParsedRequest extends IncomingMessage {
  body?: unknown
  params?: Record<string, string>
}
` : ''}
export async function router(req${isTs ? ': ParsedRequest' : ''}, res${resType})${typeVoid} {
  const url = req.url ?? '/'
  const method = req.method ?? 'GET'

  // Health check
  if (url === '/health' && method === 'GET') {
    return controller.healthCheck(req, res)
  }

  // CRUD routes
  if (url === '/api/${kebab}' && method === 'GET') {
    return controller.getAll(req, res)
  }

  if (url === '/api/${kebab}' && method === 'POST') {
    return controller.create(req, res)
  }

  const idMatch = url.match(/^\\/api\\/${kebab}\\/([\\w-]+)$/)
  if (idMatch) {
    const id = idMatch[1]${isTs ? '!' : ''}
    if (method === 'GET') return controller.getById(req, res, id)
    if (method === 'PUT') return controller.update(req, res, id)
    if (method === 'DELETE') return controller.remove(req, res, id)
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not Found', path: url }))
}
`
  files.push({
    path: `src/routes.${ext}`,
    content: routesContent,
    language: lang,
    lines: routesContent.split('\n').length,
    purpose: 'API route definitions — maps URLs to controller actions',
  })

  // src/controller.ts
  const controllerContent = `${buildComment('Request handlers / controller actions', lang)}

import type { IncomingMessage, ServerResponse } from 'node:http'

${isTs ? `interface Item {
  id: string
  name: string
  createdAt: string
}
` : ''}
/** In-memory store (replace with database in production). */
const store${isTs ? ': Map<string, Item>' : ''} = new Map()

function json(res${resType}, status${typeNum}, data${typeAny})${typeVoid} {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export function healthCheck(_req${reqType}, res${resType})${typeVoid} {
  json(res, 200, { status: 'ok', timestamp: new Date().toISOString() })
}

export function getAll(_req${reqType}, res${resType})${typeVoid} {
  json(res, 200, { data: Array.from(store.values()), total: store.size })
}

export function getById(_req${reqType}, res${resType}, id${typeSuffix})${typeVoid} {
  const item = store.get(id)
  if (!item) return json(res, 404, { error: 'Not found' })
  json(res, 200, { data: item })
}

export async function create(req${isTs ? ': IncomingMessage & { body?: unknown }' : ''}, res${resType})${typeVoid} {
  const body = (req${isTs ? ' as { body?: unknown }' : ''}).body
  if (!body || typeof body !== 'object') {
    return json(res, 400, { error: 'Request body is required' })
  }
  const id = crypto.randomUUID()
  const item${isTs ? ': Item' : ''} = { id, name: (body as Record<string, string>).name ?? 'Unnamed', createdAt: new Date().toISOString() }
  store.set(id, item)
  json(res, 201, { data: item })
}

export async function update(req${isTs ? ': IncomingMessage & { body?: unknown }' : ''}, res${resType}, id${typeSuffix})${typeVoid} {
  const existing = store.get(id)
  if (!existing) return json(res, 404, { error: 'Not found' })
  const body = (req${isTs ? ' as { body?: unknown }' : ''}).body
  if (body && typeof body === 'object') {
    const updated = { ...existing, ...(body as Record<string, string>), id }
    store.set(id, updated${isTs ? ' as Item' : ''})
    return json(res, 200, { data: updated })
  }
  json(res, 400, { error: 'Request body is required' })
}

export function remove(_req${reqType}, res${resType}, id${typeSuffix})${typeVoid} {
  if (!store.has(id)) return json(res, 404, { error: 'Not found' })
  store.delete(id)
  json(res, 204, null)
}
`
  files.push({
    path: `src/controller.${ext}`,
    content: controllerContent,
    language: lang,
    lines: controllerContent.split('\n').length,
    purpose: 'Controller — request handlers with CRUD operations',
  })

  // src/middleware.ts
  const middlewareContent = `${buildComment('HTTP middleware — JSON parsing, CORS, error handling', lang)}

import type { IncomingMessage, ServerResponse } from 'node:http'

export function corsMiddleware(_req${reqType}, res${resType})${typeVoid} {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export async function jsonMiddleware(req${isTs ? ': IncomingMessage & { body?: unknown }' : ''}, _res${resType})${isTs ? ': Promise<void>' : ''} {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const chunks${isTs ? ': Buffer[]' : ''} = []
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const raw = Buffer.concat(chunks).toString('utf8')
    if (raw.length > 0) {
      try {
        (req${isTs ? ' as { body?: unknown }' : ''}).body = JSON.parse(raw)
      } catch {
        (req${isTs ? ' as { body?: unknown }' : ''}).body = null
      }
    }
  }
}

export function errorMiddleware(err${typeAny}, _req${reqType}, res${resType})${typeVoid} {
  console.error('Unhandled error:', err)
  res.writeHead(500, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Internal Server Error' }))
}
`
  files.push({
    path: `src/middleware.${ext}`,
    content: middlewareContent,
    language: lang,
    lines: middlewareContent.split('\n').length,
    purpose: 'Middleware — CORS, JSON body parsing, error handling',
  })

  // src/__tests__/server.test.ts
  const testContent = `import { describe, it, expect } from 'vitest'
import { createServer } from '../server'

describe('Server', () => {
  it('should create a server instance', () => {
    const server = createServer()
    expect(server).toBeDefined()
    expect(typeof server.listen).toBe('function')
  })
})
`
  files.push({
    path: `src/__tests__/server.test.${ext}`,
    content: testContent,
    language: lang,
    lines: testContent.split('\n').length,
    purpose: 'Server tests — verifies server creation',
  })

  return files
}

function generateLibraryFiles(name: string, lang: ScaffoldLanguage): AgentFile[] {
  const isTs = lang === 'typescript'
  const ext = isTs ? 'ts' : 'js'
  const pascal = toPascalCase(name)
  const camel = toCamelCase(name)

  const files: AgentFile[] = []

  // src/index.ts — public API
  const indexContent = `${buildComment(`${pascal} — Public API`, lang)}

export { ${pascal} } from './${camel}'
export type { ${pascal}Config, ${pascal}Result } from './types'
export { create${pascal} } from './factory'
`
  files.push({
    path: `src/index.${ext}`,
    content: indexContent,
    language: lang,
    lines: indexContent.split('\n').length,
    purpose: 'Public API — re-exports all public symbols',
  })

  // src/types.ts
  const typesContent = `${buildComment(`Types and interfaces for ${pascal}`, lang)}

${isTs ? `export interface ${pascal}Config {
  /** Enable debug logging. */
  debug?: boolean
  /** Maximum retries on failure. */
  maxRetries?: number
  /** Timeout in milliseconds. */
  timeoutMs?: number
}

export interface ${pascal}Result<T = unknown> {
  /** Whether the operation succeeded. */
  success: boolean
  /** Result data. */
  data: T | null
  /** Error message if failed. */
  error: string | null
  /** Duration in milliseconds. */
  durationMs: number
}
` : `/**
 * @typedef {Object} ${pascal}Config
 * @property {boolean} [debug]
 * @property {number} [maxRetries]
 * @property {number} [timeoutMs]
 */

/**
 * @typedef {Object} ${pascal}Result
 * @property {boolean} success
 * @property {*} data
 * @property {string|null} error
 * @property {number} durationMs
 */
`}
`
  files.push({
    path: `src/types.${ext}`,
    content: typesContent,
    language: lang,
    lines: typesContent.split('\n').length,
    purpose: 'Type definitions — config and result interfaces',
  })

  // src/{name}.ts — main implementation
  const implContent = `${buildComment(`${pascal} — Core implementation`, lang)}

${isTs ? `import type { ${pascal}Config, ${pascal}Result } from './types'` : ''}

${isTs ? `export class ${pascal} {
  private config: Required<${pascal}Config>

  constructor(config?: ${pascal}Config) {
    this.config = {
      debug: config?.debug ?? false,
      maxRetries: config?.maxRetries ?? 3,
      timeoutMs: config?.timeoutMs ?? 5000,
    }
  }

  /** Execute an operation with retry logic. */
  async execute<T>(operation: () => Promise<T>): Promise<${pascal}Result<T>> {
    const start = Date.now()
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        if (this.config.debug && attempt > 0) {
          console.log(\`Retry attempt \${attempt}/\${this.config.maxRetries}\`)
        }
        const data = await operation()
        return { success: true, data, error: null, durationMs: Date.now() - start }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        if (attempt < this.config.maxRetries) {
          await this.delay(Math.min(1000 * Math.pow(2, attempt), this.config.timeoutMs))
        }
      }
    }

    return {
      success: false,
      data: null,
      error: lastError?.message ?? 'Unknown error',
      durationMs: Date.now() - start,
    }
  }

  /** Get current configuration. */
  getConfig(): Readonly<Required<${pascal}Config>> {
    return { ...this.config }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}` : `class ${pascal} {
  constructor(config) {
    this.config = {
      debug: config?.debug ?? false,
      maxRetries: config?.maxRetries ?? 3,
      timeoutMs: config?.timeoutMs ?? 5000,
    }
  }

  async execute(operation) {
    const start = Date.now()
    let lastError = null

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const data = await operation()
        return { success: true, data, error: null, durationMs: Date.now() - start }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }

    return {
      success: false,
      data: null,
      error: lastError?.message ?? 'Unknown error',
      durationMs: Date.now() - start,
    }
  }

  getConfig() {
    return { ...this.config }
  }
}

module.exports = { ${pascal} }
`}
`
  files.push({
    path: `src/${camel}.${ext}`,
    content: implContent,
    language: lang,
    lines: implContent.split('\n').length,
    purpose: `Core ${pascal} class — main implementation with retry logic`,
  })

  // src/factory.ts
  const factoryContent = `${buildComment(`Factory function for ${pascal}`, lang)}

import { ${pascal} } from './${camel}'
${isTs ? `import type { ${pascal}Config } from './types'` : ''}

${isTs ? `export function create${pascal}(config?: ${pascal}Config): ${pascal}` : `export function create${pascal}(config)`} {
  return new ${pascal}(config)
}
`
  files.push({
    path: `src/factory.${ext}`,
    content: factoryContent,
    language: lang,
    lines: factoryContent.split('\n').length,
    purpose: 'Factory — convenience constructor for the library',
  })

  // tests
  const testContent = `import { describe, it, expect } from 'vitest'
import { ${pascal} } from '../${camel}'
import { create${pascal} } from '../factory'

describe('${pascal}', () => {
  it('should create an instance with defaults', () => {
    const instance = new ${pascal}()
    expect(instance).toBeDefined()
    expect(instance.getConfig().maxRetries).toBe(3)
  })

  it('should accept custom config', () => {
    const instance = new ${pascal}({ debug: true, maxRetries: 5 })
    expect(instance.getConfig().debug).toBe(true)
    expect(instance.getConfig().maxRetries).toBe(5)
  })

  it('should execute a successful operation', async () => {
    const instance = new ${pascal}()
    const result = await instance.execute(async () => 42)
    expect(result.success).toBe(true)
    expect(result.data).toBe(42)
    expect(result.error).toBeNull()
  })

  it('should handle failed operations', async () => {
    const instance = new ${pascal}({ maxRetries: 0 })
    const result = await instance.execute(async () => { throw new Error('fail') })
    expect(result.success).toBe(false)
    expect(result.error).toBe('fail')
  })
})

describe('create${pascal}', () => {
  it('should create instance via factory', () => {
    const instance = create${pascal}()
    expect(instance).toBeInstanceOf(${pascal})
  })
})
`
  files.push({
    path: `src/__tests__/${camel}.test.${ext}`,
    content: testContent,
    language: lang,
    lines: testContent.split('\n').length,
    purpose: 'Tests — unit tests for core library functionality',
  })

  return files
}

function generateCliToolFiles(name: string, lang: ScaffoldLanguage): AgentFile[] {
  const isTs = lang === 'typescript'
  const ext = isTs ? 'ts' : 'js'
  const pascal = toPascalCase(name)
  const kebab = toKebabCase(name)

  const files: AgentFile[] = []

  // src/index.ts — CLI entry
  const indexContent = `#!/usr/bin/env node
${buildComment(`${pascal} CLI — Command-line tool`, lang)}

import { parseArgs } from './args'
import { run } from './commands'

async function main()${isTs ? ': Promise<void>' : ''} {
  try {
    const args = parseArgs(process.argv.slice(2))

    if (args.help) {
      printHelp()
      return
    }

    if (args.version) {
      console.log('${kebab} v1.0.0')
      return
    }

    await run(args)
  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

function printHelp()${isTs ? ': void' : ''} {
  console.log(\`
Usage: ${kebab} [command] [options]

Commands:
  init       Initialize a new project
  build      Build the project
  help       Show this help message

Options:
  --help, -h      Show help
  --version, -v   Show version
  --verbose        Enable verbose output
  --output, -o    Output directory
\`)
}

main()
`
  files.push({
    path: `src/index.${ext}`,
    content: indexContent,
    language: lang,
    lines: indexContent.split('\n').length,
    purpose: 'CLI entry point — argument parsing and command dispatch',
  })

  // src/args.ts
  const argsContent = `${buildComment('CLI argument parser', lang)}

${isTs ? `export interface CliArgs {
  command: string
  help: boolean
  version: boolean
  verbose: boolean
  output: string
  args: string[]
}
` : ''}
export function parseArgs(argv${isTs ? ': string[]' : ''})${isTs ? ': CliArgs' : ''} {
  const result${isTs ? ': CliArgs' : ''} = {
    command: '',
    help: false,
    version: false,
    verbose: false,
    output: '.',
    args: [],
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]${isTs ? '!' : ''}
    if (arg === '--help' || arg === '-h') result.help = true
    else if (arg === '--version' || arg === '-v') result.version = true
    else if (arg === '--verbose') result.verbose = true
    else if ((arg === '--output' || arg === '-o') && i + 1 < argv.length) {
      result.output = argv[++i]${isTs ? '!' : ''}
    } else if (!arg.startsWith('-')) {
      if (!result.command) result.command = arg
      else result.args.push(arg)
    }
  }

  return result
}
`
  files.push({
    path: `src/args.${ext}`,
    content: argsContent,
    language: lang,
    lines: argsContent.split('\n').length,
    purpose: 'Argument parser — parses CLI flags and options',
  })

  // src/commands.ts
  const commandsContent = `${buildComment('CLI command implementations', lang)}

${isTs ? `import type { CliArgs } from './args'` : ''}

export async function run(args${isTs ? ': CliArgs' : ''})${isTs ? ': Promise<void>' : ''} {
  switch (args.command) {
    case 'init':
      await initCommand(args)
      break
    case 'build':
      await buildCommand(args)
      break
    default:
      console.log(\`Unknown command: \${args.command || '(none)'}. Use --help for usage.\`)
  }
}

async function initCommand(args${isTs ? ': CliArgs' : ''})${isTs ? ': Promise<void>' : ''} {
  if (args.verbose) console.log('Initializing project...')
  console.log(\`✅ Project initialized in \${args.output}\`)
}

async function buildCommand(args${isTs ? ': CliArgs' : ''})${isTs ? ': Promise<void>' : ''} {
  if (args.verbose) console.log('Building project...')
  console.log('✅ Build complete!')
}
`
  files.push({
    path: `src/commands.${ext}`,
    content: commandsContent,
    language: lang,
    lines: commandsContent.split('\n').length,
    purpose: 'Command implementations — init, build actions',
  })

  // test
  const testContent = `import { describe, it, expect } from 'vitest'
import { parseArgs } from '../args'

describe('parseArgs', () => {
  it('should parse help flag', () => {
    expect(parseArgs(['--help']).help).toBe(true)
    expect(parseArgs(['-h']).help).toBe(true)
  })

  it('should parse version flag', () => {
    expect(parseArgs(['--version']).version).toBe(true)
  })

  it('should parse command', () => {
    expect(parseArgs(['init']).command).toBe('init')
  })

  it('should parse output flag', () => {
    expect(parseArgs(['-o', '/tmp']).output).toBe('/tmp')
  })

  it('should handle empty args', () => {
    const result = parseArgs([])
    expect(result.command).toBe('')
    expect(result.help).toBe(false)
  })
})
`
  files.push({
    path: `src/__tests__/args.test.${ext}`,
    content: testContent,
    language: lang,
    lines: testContent.split('\n').length,
    purpose: 'Tests — argument parser tests',
  })

  return files
}

function generateMicroserviceFiles(name: string, lang: ScaffoldLanguage): AgentFile[] {
  // Reuse REST API as base and add health, metrics, graceful shutdown
  const base = generateRestApiFiles(name, lang)
  const isTs = lang === 'typescript'
  const ext = isTs ? 'ts' : 'js'

  // Add a config module
  const configContent = `${buildComment('Service configuration — environment-based', lang)}

${isTs ? `export interface ServiceConfig {
  port: number
  host: string
  env: 'development' | 'production' | 'test'
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}
` : ''}
export function loadConfig()${isTs ? ': ServiceConfig' : ''} {
  return {
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    host: process.env['HOST'] ?? '0.0.0.0',
    env: (process.env['NODE_ENV'] ?? 'development')${isTs ? ' as ServiceConfig[\'env\']' : ''},
    logLevel: (process.env['LOG_LEVEL'] ?? 'info')${isTs ? ' as ServiceConfig[\'logLevel\']' : ''},
  }
}
`
  base.push({
    path: `src/config.${ext}`,
    content: configContent,
    language: lang,
    lines: configContent.split('\n').length,
    purpose: 'Configuration — loads settings from environment variables',
  })

  return base
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §5  CODE AGENT CLASS                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

export class CodeAgent {
  private config: CodeAgentConfig
  private stats: CodeAgentStats

  constructor(config?: Partial<CodeAgentConfig>) {
    this.config = {
      defaultLanguage: config?.defaultLanguage ?? 'typescript',
      defaultStyle: config?.defaultStyle ?? 'production',
      includeTests: config?.includeTests ?? true,
      includeConfigs: config?.includeConfigs ?? true,
      includeDocker: config?.includeDocker ?? false,
      includeCI: config?.includeCI ?? false,
      includeReadme: config?.includeReadme ?? true,
    }
    this.stats = {
      filesCreated: 0,
      projectsScaffolded: 0,
      linesGenerated: 0,
      importsResolved: 0,
    }
  }

  // ── Scaffold a full project ──────────────────────────────────────────────

  /**
   * Scaffold a complete project with files, configs, tests, and structure.
   * Works like a smart engineer creating a project from scratch.
   */
  scaffold(name: string, template: ProjectTemplate, lang?: ScaffoldLanguage): ScaffoldResult {
    const language = lang ?? this.config.defaultLanguage
    let files: AgentFile[]

    // Generate template-specific files
    switch (template) {
      case 'rest-api':
      case 'express-server':
        files = generateRestApiFiles(name, language)
        break
      case 'library':
        files = generateLibraryFiles(name, language)
        break
      case 'cli-tool':
        files = generateCliToolFiles(name, language)
        break
      case 'microservice':
        files = generateMicroserviceFiles(name, language)
        break
      case 'react-app':
      case 'next-app':
      case 'fullstack':
      case 'chrome-extension':
      case 'discord-bot':
      case 'electron-app':
      case 'monorepo':
        // Use REST API as base for now with template-specific naming
        files = generateRestApiFiles(name, language)
        break
      default:
        files = generateLibraryFiles(name, language)
    }

    // Add config files
    if (this.config.includeConfigs && (language === 'typescript' || language === 'javascript')) {
      const packageJson = generatePackageJson(name, template, language)
      files.push({
        path: 'package.json',
        content: packageJson,
        language: 'json',
        lines: packageJson.split('\n').length,
        purpose: 'Package manifest — dependencies, scripts, metadata',
      })

      if (language === 'typescript') {
        const tsconfig = generateTsConfig(template)
        files.push({
          path: 'tsconfig.json',
          content: tsconfig,
          language: 'json',
          lines: tsconfig.split('\n').length,
          purpose: 'TypeScript configuration — compiler options',
        })
      }

      const gitignore = generateGitignore()
      files.push({
        path: '.gitignore',
        content: gitignore,
        language: 'text',
        lines: gitignore.split('\n').length,
        purpose: 'Git ignore — files excluded from version control',
      })

      const eslintConfig = generateEslintConfig(language)
      files.push({
        path: 'eslint.config.mjs',
        content: eslintConfig,
        language: 'javascript',
        lines: eslintConfig.split('\n').length,
        purpose: 'ESLint configuration — code quality rules',
      })
    }

    // Add Docker
    if (this.config.includeDocker) {
      const dockerfile = generateDockerfile(language)
      files.push({
        path: 'Dockerfile',
        content: dockerfile,
        language: 'dockerfile',
        lines: dockerfile.split('\n').length,
        purpose: 'Dockerfile — container build instructions',
      })
    }

    // Add CI/CD
    if (this.config.includeCI) {
      const ci = generateCIConfig(language)
      files.push({
        path: '.github/workflows/ci.yml',
        content: ci,
        language: 'yaml',
        lines: ci.split('\n').length,
        purpose: 'GitHub Actions CI — automated testing pipeline',
      })
    }

    // Add README
    if (this.config.includeReadme) {
      const readme = generateReadme(name, template, language, files)
      files.push({
        path: 'README.md',
        content: readme,
        language: 'markdown',
        lines: readme.split('\n').length,
        purpose: 'Documentation — project overview and setup guide',
      })
    }

    const totalLines = files.reduce((sum, f) => sum + f.lines, 0)

    // Update stats
    this.stats.projectsScaffolded++
    this.stats.filesCreated += files.length
    this.stats.linesGenerated += totalLines

    const instructions = [
      `cd ${toKebabCase(name)}`,
      'npm install',
    ]
    if (language === 'typescript') instructions.push('npm run build')
    instructions.push('npm run dev')
    instructions.push('npm test')

    return {
      name,
      template,
      language,
      files,
      totalLines,
      summary: `Scaffolded "${toPascalCase(name)}" (${template}) with ${files.length} files, ${totalLines} total lines in ${language}.`,
      directoryTree: buildDirectoryTree(files),
      instructions,
    }
  }

  // ── Create a single smart file ───────────────────────────────────────────

  /**
   * Create a single file with smart code generation.
   * Detects what kind of file to create, generates imports/exports,
   * and links to existing project files.
   */
  createFile(request: CreateFileRequest): CreateFileResult {
    const lang = request.language ?? detectLanguageFromPath(request.path)
    const style = request.style ?? this.config.defaultStyle
    const filename = request.path.split('/').pop() ?? 'index'
    const baseName = filename.replace(/\.(ts|tsx|js|jsx|py|go|rs)$/, '')
    const pascal = toPascalCase(baseName)
    const _isTs = lang === 'typescript'

    // Detect file purpose from path and description
    const lower = request.description.toLowerCase()
    const pathLower = request.path.toLowerCase()
    const isTest = pathLower.includes('test') || pathLower.includes('spec')
    const isType = pathLower.includes('types') || pathLower.includes('interfaces')
    const isMiddleware = lower.includes('middleware') || pathLower.includes('middleware')
    const isUtil = lower.includes('util') || pathLower.includes('util') || pathLower.includes('helper')
    const isConfig = lower.includes('config') || pathLower.includes('config')
    const isService = lower.includes('service') || pathLower.includes('service')
    const isModel = lower.includes('model') || pathLower.includes('model')
    const isController = lower.includes('controller') || pathLower.includes('controller')
    const isHook = pathLower.includes('use') || lower.includes('hook')
    const isComponent = pathLower.includes('.tsx') || pathLower.includes('.jsx') || lower.includes('component')

    // Build imports from existing files
    const importsAdded: string[] = []
    if (request.existingFiles) {
      for (const existing of request.existingFiles) {
        if (existing.exports && existing.exports.length > 0) {
          // Smart import: only import types that match the description
          const relevant = existing.exports.filter(exp =>
            lower.includes(exp.toLowerCase()) || request.description.includes(exp)
          )
          if (relevant.length > 0) {
            const importLine = generateImport(existing.path, relevant, lang)
            importsAdded.push(importLine)
          }
        }
      }
    }

    let content = ''
    const exportsProvided: string[] = []

    // Generate code based on detected purpose
    if (isTest) {
      content = this.generateTestFile(pascal, baseName, request.description, lang)
      exportsProvided.push('(test file — no exports)')
    } else if (isType) {
      content = this.generateTypesFile(pascal, request.description, lang)
      exportsProvided.push(`${pascal}Config`, `${pascal}Options`)
    } else if (isMiddleware) {
      content = this.generateMiddlewareFile(pascal, request.description, lang)
      exportsProvided.push(`${toCamelCase(baseName)}Middleware`)
    } else if (isUtil) {
      content = this.generateUtilFile(pascal, request.description, lang)
      exportsProvided.push(...this.extractExportNames(content))
    } else if (isConfig) {
      content = this.generateConfigFile(pascal, request.description, lang)
      exportsProvided.push('config', 'loadConfig')
    } else if (isService) {
      content = this.generateServiceFile(pascal, request.description, lang)
      exportsProvided.push(pascal, `create${pascal}`)
    } else if (isModel) {
      content = this.generateModelFile(pascal, request.description, lang)
      exportsProvided.push(pascal, `create${pascal}`)
    } else if (isController) {
      content = this.generateControllerFile(pascal, request.description, lang)
      exportsProvided.push(...this.extractExportNames(content))
    } else if (isHook) {
      // Strip 'Use' prefix if already present to avoid 'useUseAuth'
      const hookPascal = pascal.startsWith('Use') ? pascal.slice(3) || pascal : pascal
      content = this.generateHookFile(hookPascal, baseName, request.description, lang)
      exportsProvided.push(`use${hookPascal}`)
    } else if (isComponent) {
      content = this.generateComponentFile(pascal, request.description, lang)
      exportsProvided.push(pascal)
    } else {
      content = this.generateGenericFile(pascal, request.description, lang, style)
      exportsProvided.push(...this.extractExportNames(content))
    }

    // Prepend imports
    if (importsAdded.length > 0) {
      content = importsAdded.join('\n') + '\n\n' + content
    }

    this.stats.filesCreated++
    this.stats.linesGenerated += content.split('\n').length
    this.stats.importsResolved += importsAdded.length

    return {
      file: {
        path: request.path,
        content,
        language: lang,
        lines: content.split('\n').length,
        purpose: request.description,
      },
      importsAdded,
      exportsProvided,
    }
  }

  // ── Add code to an existing file ─────────────────────────────────────────

  /**
   * Add code to an existing file at the specified position.
   * Intelligently detects where to place new code.
   */
  addToFile(request: AddToFileRequest): AddToFileResult {
    const lang = detectLanguageFromPath(request.path)
    const lines = request.existingContent.split('\n')
    const position = request.position ?? 'bottom'

    // Generate the new code
    const baseName = request.path.split('/').pop()?.replace(/\.\w+$/, '') ?? 'module'
    const pascal = toPascalCase(baseName)
    const addedCode = this.generateCodeSnippet(pascal, request.description, lang)

    let insertIndex: number

    switch (position) {
      case 'top':
        insertIndex = 0
        break
      case 'after-imports': {
        // Find the last import/require line
        let lastImport = -1
        for (let i = 0; i < lines.length; i++) {
          if (/^(import |from |require\(|const .+ = require)/.test(lines[i]!)) {
            lastImport = i
          }
        }
        insertIndex = lastImport >= 0 ? lastImport + 1 : 0
        break
      }
      case 'before-exports': {
        // Find the first export line
        let firstExport = lines.length
        for (let i = 0; i < lines.length; i++) {
          if (/^export /.test(lines[i]!)) {
            firstExport = i
            break
          }
        }
        insertIndex = firstExport
        break
      }
      case 'bottom':
      default:
        insertIndex = lines.length
    }

    // Insert the new code
    lines.splice(insertIndex, 0, '', addedCode, '')
    const content = lines.join('\n')

    this.stats.linesGenerated += addedCode.split('\n').length

    return {
      content,
      addedCode,
      lines: content.split('\n').length,
      summary: `Added ${addedCode.split('\n').length} lines at position '${position}' in ${request.path}`,
    }
  }

  // ── Export a symbol from a file ──────────────────────────────────────────

  /**
   * Add an export statement for a symbol in a file.
   */
  addExport(request: ExportFromFileRequest): string {
    const lang = detectLanguageFromPath(request.path)
    const lines = request.existingContent.split('\n')

    let exportLine: string
    switch (lang) {
      case 'python':
        // Python uses __all__ or just defines at module level
        exportLine = `# Exported: ${request.symbolName}`
        break
      case 'go':
        // Go uses PascalCase for exports
        exportLine = `// ${request.symbolName} is exported (PascalCase)`
        break
      default: {
        if (request.kind === 'default') {
          exportLine = `export default ${request.symbolName}`
        } else {
          // Check if symbol already has export keyword
          const symbolLine = lines.findIndex(l => {
            const re = new RegExp(`\\b(function|class|interface|type|const|let)\\s+${request.symbolName}\\b`)
            return re.test(l)
          })
          if (symbolLine >= 0 && !lines[symbolLine]!.startsWith('export')) {
            lines[symbolLine] = 'export ' + lines[symbolLine]
            return lines.join('\n')
          }
          exportLine = `export { ${request.symbolName} }`
        }
      }
    }

    // Add at the bottom
    lines.push(exportLine)
    return lines.join('\n')
  }

  // ── Get stats ────────────────────────────────────────────────────────────

  getStats(): Readonly<CodeAgentStats> {
    return { ...this.stats }
  }

  getConfig(): Readonly<CodeAgentConfig> {
    return { ...this.config }
  }

  /** Get list of supported templates. */
  getTemplates(): ProjectTemplate[] {
    return [
      'rest-api', 'react-app', 'cli-tool', 'library', 'express-server',
      'fullstack', 'microservice', 'monorepo', 'chrome-extension',
      'discord-bot', 'next-app', 'electron-app',
    ]
  }

  // ╔═════════════════════════════════════════════════════════════════════════╗
  // ║  PRIVATE — File generators per file type                               ║
  // ╚═════════════════════════════════════════════════════════════════════════╝

  private generateTestFile(pascal: string, baseName: string, desc: string, _lang: ScaffoldLanguage): string {
    const camel = toCamelCase(baseName)
    return `import { describe, it, expect } from 'vitest'
import { ${pascal} } from '../${camel}'

describe('${pascal}', () => {
  it('should be defined', () => {
    expect(${pascal}).toBeDefined()
  })

  it('should ${desc.toLowerCase()}', () => {
    // TODO: Implement test for: ${desc}
    const result = new ${pascal}()
    expect(result).toBeDefined()
  })

  it('should handle edge cases', () => {
    // TODO: Add edge case tests
    expect(true).toBe(true)
  })
})
`
  }

  private generateTypesFile(pascal: string, desc: string, lang: ScaffoldLanguage): string {
    if (lang !== 'typescript') return `// Types for: ${desc}\n`
    return `${buildComment(`Types for ${pascal} — ${desc}`, lang)}

export interface ${pascal}Config {
  /** Enable debug mode. */
  debug?: boolean
  /** Maximum number of retries. */
  maxRetries?: number
}

export interface ${pascal}Options {
  /** Timeout in milliseconds. */
  timeoutMs?: number
  /** Enable caching. */
  cache?: boolean
}

export interface ${pascal}Result<T = unknown> {
  success: boolean
  data: T | null
  error: string | null
}

export type ${pascal}Status = 'idle' | 'loading' | 'success' | 'error'
`
  }

  private generateMiddlewareFile(pascal: string, desc: string, lang: ScaffoldLanguage): string {
    const isTs = lang === 'typescript'
    const camel = toCamelCase(pascal)
    return `${buildComment(`${pascal} middleware — ${desc}`, lang)}

${isTs ? `import type { IncomingMessage, ServerResponse } from 'node:http'

type NextFunction = () => Promise<void> | void
` : ''}
export function ${camel}Middleware(req${isTs ? ': IncomingMessage' : ''}, res${isTs ? ': ServerResponse' : ''}, next${isTs ? ': NextFunction' : ''})${isTs ? ': void' : ''} {
  const start = Date.now()

  // Pre-processing
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`)

  // Call next middleware/handler
  next()

  // Post-processing
  const duration = Date.now() - start
  res.setHeader('X-Response-Time', \`\${duration}ms\`)
}
`
  }

  private generateUtilFile(pascal: string, desc: string, lang: ScaffoldLanguage): string {
    const isTs = lang === 'typescript'
    return `${buildComment(`${pascal} utilities — ${desc}`, lang)}

export function formatDate(date${isTs ? ': Date' : ''})${isTs ? ': string' : ''} {
  return date.toISOString().slice(0, 10)
}

export function sleep(ms${isTs ? ': number' : ''})${isTs ? ': Promise<void>' : ''} {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function clamp(value${isTs ? ': number' : ''}, min${isTs ? ': number' : ''}, max${isTs ? ': number' : ''})${isTs ? ': number' : ''} {
  return Math.min(Math.max(value, min), max)
}

export function uniqueId()${isTs ? ': string' : ''} {
  return crypto.randomUUID()
}

export function isEmpty(value${isTs ? ': unknown' : ''})${isTs ? ': boolean' : ''} {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}
`
  }

  private generateConfigFile(pascal: string, desc: string, lang: ScaffoldLanguage): string {
    const isTs = lang === 'typescript'
    return `${buildComment(`${pascal} configuration — ${desc}`, lang)}

${isTs ? `export interface AppConfig {
  port: number
  host: string
  env: string
  debug: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}
` : ''}
export const config${isTs ? ': AppConfig' : ''} = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  host: process.env['HOST'] ?? 'localhost',
  env: process.env['NODE_ENV'] ?? 'development',
  debug: process.env['DEBUG'] === 'true',
  logLevel: (process.env['LOG_LEVEL'] ?? 'info')${isTs ? " as AppConfig['logLevel']" : ''},
}

export function loadConfig(overrides${isTs ? '?: Partial<AppConfig>' : ''} = {})${isTs ? ': AppConfig' : ''} {
  return { ...config, ...overrides }
}
`
  }

  private generateServiceFile(pascal: string, desc: string, lang: ScaffoldLanguage): string {
    const isTs = lang === 'typescript'
    const _camel = toCamelCase(pascal)
    return `${buildComment(`${pascal} service — ${desc}`, lang)}

${isTs ? `export interface ${pascal}Data {
  id: string
  createdAt: string
  updatedAt: string
}
` : ''}
export class ${pascal} {
  private store${isTs ? `: Map<string, ${pascal}Data>` : ''} = new Map()

  async getAll()${isTs ? `: Promise<${pascal}Data[]>` : ''} {
    return Array.from(this.store.values())
  }

  async getById(id${isTs ? ': string' : ''})${isTs ? `: Promise<${pascal}Data | null>` : ''} {
    return this.store.get(id) ?? null
  }

  async create(data${isTs ? `: Omit<${pascal}Data, 'id' | 'createdAt' | 'updatedAt'>` : ''})${isTs ? `: Promise<${pascal}Data>` : ''} {
    const now = new Date().toISOString()
    const item${isTs ? `: ${pascal}Data` : ''} = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    this.store.set(item.id, item)
    return item
  }

  async delete(id${isTs ? ': string' : ''})${isTs ? ': Promise<boolean>' : ''} {
    return this.store.delete(id)
  }

  get count()${isTs ? ': number' : ''} {
    return this.store.size
  }
}

export function create${pascal}()${isTs ? `: ${pascal}` : ''} {
  return new ${pascal}()
}
`
  }

  private generateModelFile(pascal: string, desc: string, lang: ScaffoldLanguage): string {
    const isTs = lang === 'typescript'
    return `${buildComment(`${pascal} model — ${desc}`, lang)}

${isTs ? `export interface ${pascal} {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: Date
  updatedAt: Date
}

export interface Create${pascal}Input {
  name: string
  status?: ${pascal}['status']
}
` : ''}
export function create${pascal}(input${isTs ? `: Create${pascal}Input` : ''})${isTs ? `: ${pascal}` : ''} {
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    name: input.name,
    status: input.status ?? 'active',
    createdAt: now,
    updatedAt: now,
  }
}

export function validate${pascal}(data${isTs ? ': unknown' : ''})${isTs ? `: data is ${pascal}` : ''} {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return typeof obj['id'] === 'string' && typeof obj['name'] === 'string'
}
`
  }

  private generateControllerFile(pascal: string, desc: string, lang: ScaffoldLanguage): string {
    const isTs = lang === 'typescript'
    return `${buildComment(`${pascal} controller — ${desc}`, lang)}

${isTs ? "import type { IncomingMessage, ServerResponse } from 'node:http'" : ''}

function json(res${isTs ? ': ServerResponse' : ''}, status${isTs ? ': number' : ''}, data${isTs ? ': unknown' : ''})${isTs ? ': void' : ''} {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export function index(_req${isTs ? ': IncomingMessage' : ''}, res${isTs ? ': ServerResponse' : ''})${isTs ? ': void' : ''} {
  json(res, 200, { message: '${pascal} list' })
}

export function show(_req${isTs ? ': IncomingMessage' : ''}, res${isTs ? ': ServerResponse' : ''}, id${isTs ? ': string' : ''})${isTs ? ': void' : ''} {
  json(res, 200, { message: \`${pascal} \${id}\` })
}

export function create(_req${isTs ? ': IncomingMessage' : ''}, res${isTs ? ': ServerResponse' : ''})${isTs ? ': void' : ''} {
  json(res, 201, { message: '${pascal} created' })
}

export function destroy(_req${isTs ? ': IncomingMessage' : ''}, res${isTs ? ': ServerResponse' : ''}, id${isTs ? ': string' : ''})${isTs ? ': void' : ''} {
  json(res, 200, { message: \`${pascal} \${id} deleted\` })
}
`
  }

  private generateHookFile(pascal: string, baseName: string, desc: string, lang: ScaffoldLanguage): string {
    if (lang !== 'typescript') return `// Hook: ${desc}\nexport function use${pascal}() { return {} }\n`
    return `${buildComment(`use${pascal} hook — ${desc}`, lang)}

import { useState, useCallback } from 'react'

export interface Use${pascal}Result {
  data: unknown
  loading: boolean
  error: string | null
  execute: () => Promise<void>
  reset: () => void
}

export function use${pascal}(): Use${pascal}Result {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Implement ${desc}
      setData(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}
`
  }

  private generateComponentFile(pascal: string, desc: string, lang: ScaffoldLanguage): string {
    if (lang !== 'typescript') {
      return `// Component: ${pascal} — ${desc}
export function ${pascal}(props) {
  return <div className="${toKebabCase(pascal)}">{props.children ?? '${pascal}'}</div>
}
`
    }
    return `${buildComment(`${pascal} component — ${desc}`, lang)}

export interface ${pascal}Props {
  children?: React.ReactNode
  className?: string
}

export function ${pascal}({ children, className }: ${pascal}Props): JSX.Element {
  return (
    <div className={\`${toKebabCase(pascal)} \${className ?? ''}\`.trim()}>
      {children ?? <p>${pascal}</p>}
    </div>
  )
}
`
  }

  private generateGenericFile(pascal: string, desc: string, lang: ScaffoldLanguage, style: string): string {
    const isTs = lang === 'typescript'
    const comment = buildComment(`${pascal} — ${desc}`, lang)

    if (style === 'concise') {
      return `${comment}

export class ${pascal} {
  constructor() {}
}
`
    }

    return `${comment}

${isTs ? `export interface ${pascal}Options {
  debug?: boolean
}
` : ''}
export class ${pascal} {
  ${isTs ? 'private options: Required<' + pascal + 'Options>' : ''}

  constructor(options${isTs ? `?: ${pascal}Options` : ''}) {
    this.options = { debug: options?.debug ?? false }
  }

  ${buildComment('Initialize the module.', lang)}
  async init()${isTs ? ': Promise<void>' : ''} {
    if (this.options.debug) console.log('${pascal} initialized')
  }

  ${buildComment('Clean up resources.', lang)}
  async dispose()${isTs ? ': Promise<void>' : ''} {
    if (this.options.debug) console.log('${pascal} disposed')
  }
}

export function create${pascal}(options${isTs ? `?: ${pascal}Options` : ''})${isTs ? `: ${pascal}` : ''} {
  return new ${pascal}(options)
}
`
  }

  private generateCodeSnippet(pascal: string, desc: string, lang: ScaffoldLanguage): string {
    const isTs = lang === 'typescript'
    const lower = desc.toLowerCase()

    if (/\bfunction\b/.test(lower)) {
      const name = toCamelCase(desc.replace(/^add\s+(a\s+)?/i, '').replace(/\s+function$/i, ''))
      return `export function ${name}(input${isTs ? ': unknown' : ''})${isTs ? ': unknown' : ''} {
  // ${desc}
  return input
}`
    }
    if (/\bclass\b/.test(lower)) {
      return `export class ${pascal} {
  constructor() {
    // ${desc}
  }
}`
    }
    if (/\binterface\b/.test(lower) && isTs) {
      return `export interface ${pascal} {
  // ${desc}
  id: string
}`
    }
    // Default: function
    return `export function ${toCamelCase(pascal)}()${isTs ? ': void' : ''} {
  // ${desc}
}`
  }

  private extractExportNames(content: string): string[] {
    const names: string[] = []
    const exportRe = /export\s+(?:function|class|const|interface|type)\s+(\w+)/g
    let m: RegExpExecArray | null
    while ((m = exportRe.exec(content)) !== null) {
      names.push(m[1]!)
    }
    return names.length > 0 ? names : ['default']
  }
}
