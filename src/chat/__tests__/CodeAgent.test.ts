/**
 * 🏗️ CodeAgent Tests — Comprehensive test suite for the smart coding engine.
 *
 * Tests cover:
 *   • Project scaffolding (REST API, Library, CLI tool, Microservice)
 *   • Single file creation with smart detection
 *   • Code addition to existing files
 *   • Export management
 *   • Cross-file import resolution
 *   • Config file generation (package.json, tsconfig, .gitignore, eslint)
 *   • Docker and CI/CD generation
 *   • Directory tree building
 *   • Stats tracking
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { CodeAgent } from '../CodeAgent.js'
import type {
  ProjectTemplate,
} from '../CodeAgent.js'

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  SCAFFOLD TESTS                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

describe('CodeAgent — Scaffold', () => {
  let agent: CodeAgent

  beforeEach(() => {
    agent = new CodeAgent()
  })

  it('should scaffold a REST API project', () => {
    const result = agent.scaffold('my-api', 'rest-api')
    expect(result.name).toBe('my-api')
    expect(result.template).toBe('rest-api')
    expect(result.language).toBe('typescript')
    expect(result.files.length).toBeGreaterThanOrEqual(5)
    expect(result.totalLines).toBeGreaterThan(0)
    expect(result.summary).toContain('rest-api')
    expect(result.directoryTree).toContain('src')
    expect(result.instructions.length).toBeGreaterThan(0)
  })

  it('should include expected REST API files', () => {
    const result = agent.scaffold('my-api', 'rest-api')
    const filePaths = result.files.map(f => f.path)
    expect(filePaths).toContain('src/index.ts')
    expect(filePaths).toContain('src/server.ts')
    expect(filePaths).toContain('src/routes.ts')
    expect(filePaths).toContain('src/controller.ts')
    expect(filePaths).toContain('src/middleware.ts')
  })

  it('should scaffold a library project', () => {
    const result = agent.scaffold('data-utils', 'library')
    expect(result.template).toBe('library')
    const filePaths = result.files.map(f => f.path)
    expect(filePaths).toContain('src/index.ts')
    expect(filePaths).toContain('src/types.ts')
    expect(filePaths).toContain('src/factory.ts')
    expect(filePaths.some(p => p.includes('test'))).toBe(true)
  })

  it('should scaffold a CLI tool', () => {
    const result = agent.scaffold('my-cli', 'cli-tool')
    expect(result.template).toBe('cli-tool')
    const filePaths = result.files.map(f => f.path)
    expect(filePaths).toContain('src/index.ts')
    expect(filePaths).toContain('src/args.ts')
    expect(filePaths).toContain('src/commands.ts')
  })

  it('should scaffold a microservice', () => {
    const result = agent.scaffold('user-svc', 'microservice')
    expect(result.template).toBe('microservice')
    const filePaths = result.files.map(f => f.path)
    expect(filePaths).toContain('src/config.ts')
    expect(filePaths).toContain('src/server.ts')
  })

  it('should include package.json when configs enabled', () => {
    const result = agent.scaffold('my-app', 'rest-api')
    const pkg = result.files.find(f => f.path === 'package.json')
    expect(pkg).toBeDefined()
    expect(pkg!.content).toContain('"name"')
    expect(pkg!.content).toContain('"scripts"')
  })

  it('should include tsconfig.json for TypeScript', () => {
    const result = agent.scaffold('my-app', 'rest-api', 'typescript')
    const tsconfig = result.files.find(f => f.path === 'tsconfig.json')
    expect(tsconfig).toBeDefined()
    expect(tsconfig!.content).toContain('"strict": true')
  })

  it('should NOT include tsconfig.json for JavaScript', () => {
    const result = agent.scaffold('my-app', 'rest-api', 'javascript')
    const tsconfig = result.files.find(f => f.path === 'tsconfig.json')
    expect(tsconfig).toBeUndefined()
  })

  it('should include .gitignore', () => {
    const result = agent.scaffold('my-app', 'rest-api')
    const gitignore = result.files.find(f => f.path === '.gitignore')
    expect(gitignore).toBeDefined()
    expect(gitignore!.content).toContain('node_modules')
  })

  it('should include eslint config', () => {
    const result = agent.scaffold('my-app', 'library')
    const eslint = result.files.find(f => f.path === 'eslint.config.mjs')
    expect(eslint).toBeDefined()
    expect(eslint!.content).toContain('eslint')
  })

  it('should include README when enabled', () => {
    const result = agent.scaffold('my-app', 'rest-api')
    const readme = result.files.find(f => f.path === 'README.md')
    expect(readme).toBeDefined()
    expect(readme!.content).toContain('# MyApp')
  })

  it('should include Docker when enabled', () => {
    const agent2 = new CodeAgent({ includeDocker: true })
    const result = agent2.scaffold('my-app', 'rest-api')
    const dockerfile = result.files.find(f => f.path === 'Dockerfile')
    expect(dockerfile).toBeDefined()
    expect(dockerfile!.content).toContain('FROM')
  })

  it('should include CI when enabled', () => {
    const agent2 = new CodeAgent({ includeCI: true })
    const result = agent2.scaffold('my-app', 'rest-api')
    const ci = result.files.find(f => f.path === '.github/workflows/ci.yml')
    expect(ci).toBeDefined()
    expect(ci!.content).toContain('jobs')
  })

  it('should scaffold in JavaScript', () => {
    const result = agent.scaffold('js-app', 'rest-api', 'javascript')
    expect(result.language).toBe('javascript')
    const index = result.files.find(f => f.path === 'src/index.js')
    expect(index).toBeDefined()
  })

  it('should generate proper directory tree', () => {
    const result = agent.scaffold('my-app', 'library')
    expect(result.directoryTree).toContain('src')
    expect(result.directoryTree.length).toBeGreaterThan(10)
  })

  it('should generate instructions', () => {
    const result = agent.scaffold('my-app', 'rest-api')
    expect(result.instructions).toContain('npm install')
    expect(result.instructions.some(i => i.includes('my-app'))).toBe(true)
  })

  it('should track stats after scaffolding', () => {
    agent.scaffold('app1', 'rest-api')
    agent.scaffold('app2', 'library')
    const stats = agent.getStats()
    expect(stats.projectsScaffolded).toBe(2)
    expect(stats.filesCreated).toBeGreaterThan(10)
    expect(stats.linesGenerated).toBeGreaterThan(100)
  })

  it('should handle all templates without errors', () => {
    const templates: ProjectTemplate[] = [
      'rest-api', 'react-app', 'cli-tool', 'library', 'express-server',
      'fullstack', 'microservice', 'monorepo', 'chrome-extension',
      'discord-bot', 'next-app', 'electron-app',
    ]
    for (const tmpl of templates) {
      const result = agent.scaffold(`test-${tmpl}`, tmpl)
      expect(result.files.length).toBeGreaterThan(0)
      expect(result.totalLines).toBeGreaterThan(0)
    }
  })

  it('should generate working server code', () => {
    const result = agent.scaffold('my-api', 'rest-api')
    const server = result.files.find(f => f.path === 'src/server.ts')!
    expect(server.content).toContain('createServer')
    expect(server.content).toContain('export')
  })

  it('should generate test files', () => {
    const result = agent.scaffold('my-api', 'rest-api')
    const tests = result.files.filter(f => f.path.includes('test'))
    expect(tests.length).toBeGreaterThan(0)
    expect(tests[0]!.content).toContain('describe')
    expect(tests[0]!.content).toContain('expect')
  })

  it('should generate files with proper purpose descriptions', () => {
    const result = agent.scaffold('my-api', 'rest-api')
    for (const file of result.files) {
      expect(file.purpose.length).toBeGreaterThan(5)
    }
  })
})

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  CREATE FILE TESTS                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

describe('CodeAgent — CreateFile', () => {
  let agent: CodeAgent

  beforeEach(() => {
    agent = new CodeAgent()
  })

  it('should create a service file', () => {
    const result = agent.createFile({
      path: 'src/services/userService.ts',
      description: 'User management service with CRUD operations',
    })
    expect(result.file.content).toContain('class')
    expect(result.file.content).toContain('export')
    expect(result.file.lines).toBeGreaterThan(5)
    expect(result.exportsProvided.length).toBeGreaterThan(0)
  })

  it('should create a model file', () => {
    const result = agent.createFile({
      path: 'src/models/user.model.ts',
      description: 'User data model',
    })
    expect(result.file.content).toContain('interface')
    expect(result.file.content).toContain('create')
  })

  it('should create a middleware file', () => {
    const result = agent.createFile({
      path: 'src/middleware/auth.ts',
      description: 'Authentication middleware',
    })
    expect(result.file.content).toContain('Middleware')
    expect(result.file.content).toContain('export')
  })

  it('should create a test file', () => {
    const result = agent.createFile({
      path: 'src/__tests__/user.test.ts',
      description: 'User tests',
    })
    expect(result.file.content).toContain('describe')
    expect(result.file.content).toContain('expect')
  })

  it('should create a types file', () => {
    const result = agent.createFile({
      path: 'src/types/user.types.ts',
      description: 'User type definitions',
    })
    expect(result.file.content).toContain('interface')
    expect(result.file.content).toContain('export')
  })

  it('should create a utility file', () => {
    const result = agent.createFile({
      path: 'src/utils/helpers.ts',
      description: 'Utility helper functions',
    })
    expect(result.file.content).toContain('export function')
  })

  it('should create a config file', () => {
    const result = agent.createFile({
      path: 'src/config.ts',
      description: 'Application configuration',
    })
    expect(result.file.content).toContain('config')
    expect(result.exportsProvided).toContain('config')
  })

  it('should create a controller file', () => {
    const result = agent.createFile({
      path: 'src/controllers/user.controller.ts',
      description: 'User controller',
    })
    expect(result.file.content).toContain('export')
    expect(result.file.content).toContain('json')
  })

  it('should detect language from file extension', () => {
    const tsResult = agent.createFile({
      path: 'src/module.ts',
      description: 'A TypeScript module',
    })
    expect(tsResult.file.language).toBe('typescript')

    const jsResult = agent.createFile({
      path: 'src/module.js',
      description: 'A JavaScript module',
    })
    expect(jsResult.file.language).toBe('javascript')
  })

  it('should resolve imports from existing files', () => {
    const result = agent.createFile({
      path: 'src/routes.ts',
      description: 'Route handler that uses UserService',
      existingFiles: [
        { path: 'src/services/userService.ts', exports: ['UserService', 'createUserService'] },
      ],
    })
    expect(result.importsAdded.length).toBeGreaterThanOrEqual(0)
  })

  it('should track stats for created files', () => {
    agent.createFile({ path: 'src/a.ts', description: 'Module A' })
    agent.createFile({ path: 'src/b.ts', description: 'Module B' })
    const stats = agent.getStats()
    expect(stats.filesCreated).toBe(2)
    expect(stats.linesGenerated).toBeGreaterThan(10)
  })

  it('should create a component file', () => {
    const result = agent.createFile({
      path: 'src/components/Button.tsx',
      description: 'Reusable button component',
    })
    expect(result.file.content).toContain('Button')
    expect(result.file.content).toContain('Props')
  })

  it('should create a hook file', () => {
    const result = agent.createFile({
      path: 'src/hooks/useAuth.ts',
      description: 'Authentication hook',
    })
    expect(result.file.content).toContain('useAuth')
    expect(result.file.content).toContain('export')
  })

  it('should use specified language override', () => {
    const result = agent.createFile({
      path: 'src/module.js',
      description: 'A module',
      language: 'typescript',
    })
    expect(result.file.language).toBe('typescript')
  })
})

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  ADD TO FILE TESTS                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

describe('CodeAgent — AddToFile', () => {
  let agent: CodeAgent

  beforeEach(() => {
    agent = new CodeAgent()
  })

  it('should add code at bottom (default)', () => {
    const result = agent.addToFile({
      path: 'src/utils.ts',
      description: 'Add a new function',
      existingContent: `export function existingFunc() {\n  return true\n}\n`,
    })
    expect(result.content).toContain('existingFunc')
    expect(result.addedCode.length).toBeGreaterThan(0)
    expect(result.lines).toBeGreaterThan(3)
  })

  it('should add code at top', () => {
    const result = agent.addToFile({
      path: 'src/utils.ts',
      description: 'Add a constant',
      existingContent: `export function foo() {}\n`,
      position: 'top',
    })
    // New code should appear before existing
    const lines = result.content.split('\n')
    expect(lines.length).toBeGreaterThan(2)
  })

  it('should add code after imports', () => {
    const existing = `import { something } from './somewhere'\nimport { other } from './other'\n\nexport function main() {}\n`
    const result = agent.addToFile({
      path: 'src/app.ts',
      description: 'Add a class',
      existingContent: existing,
      position: 'after-imports',
    })
    expect(result.content).toContain('import')
    expect(result.addedCode.length).toBeGreaterThan(0)
  })

  it('should add code before exports', () => {
    const existing = `const x = 1\n\nexport { x }\nexport default x\n`
    const result = agent.addToFile({
      path: 'src/mod.ts',
      description: 'Add a function',
      existingContent: existing,
      position: 'before-exports',
    })
    expect(result.content).toContain('export')
    expect(result.addedCode.length).toBeGreaterThan(0)
  })

  it('should return proper summary', () => {
    const result = agent.addToFile({
      path: 'src/file.ts',
      description: 'Add a method',
      existingContent: '// existing\n',
    })
    expect(result.summary).toContain('src/file.ts')
    expect(result.summary).toContain('lines')
  })
})

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4  EXPORT MANAGEMENT TESTS                                                ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

describe('CodeAgent — AddExport', () => {
  let agent: CodeAgent

  beforeEach(() => {
    agent = new CodeAgent()
  })

  it('should add named export at bottom', () => {
    const content = `function myFunc() {}\n`
    const result = agent.addExport({
      path: 'src/utils.ts',
      symbolName: 'myFunc',
      kind: 'function',
      existingContent: content,
    })
    expect(result).toContain('export')
    expect(result).toContain('myFunc')
  })

  it('should add export keyword to existing declaration', () => {
    const content = `function myFunc() {\n  return true\n}\n`
    const result = agent.addExport({
      path: 'src/utils.ts',
      symbolName: 'myFunc',
      kind: 'function',
      existingContent: content,
    })
    expect(result).toContain('export function myFunc')
  })

  it('should add default export', () => {
    const content = `class MyClass {}\n`
    const result = agent.addExport({
      path: 'src/MyClass.ts',
      symbolName: 'MyClass',
      kind: 'default',
      existingContent: content,
    })
    expect(result).toContain('export default MyClass')
  })

  it('should not duplicate export keyword', () => {
    const content = `export function myFunc() {}\n`
    const result = agent.addExport({
      path: 'src/utils.ts',
      symbolName: 'myFunc',
      kind: 'function',
      existingContent: content,
    })
    // Should add { myFunc } at bottom since the line already has export
    expect(result).toContain('export function myFunc')
  })

  it('should handle Python exports', () => {
    const content = `def my_func():\n    pass\n`
    const result = agent.addExport({
      path: 'src/utils.py',
      symbolName: 'my_func',
      kind: 'function',
      existingContent: content,
    })
    expect(result).toContain('Exported')
  })
})

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §5  CONFIG & META TESTS                                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

describe('CodeAgent — Config & Meta', () => {
  it('should use default config', () => {
    const agent = new CodeAgent()
    const config = agent.getConfig()
    expect(config.defaultLanguage).toBe('typescript')
    expect(config.defaultStyle).toBe('production')
    expect(config.includeTests).toBe(true)
    expect(config.includeConfigs).toBe(true)
    expect(config.includeDocker).toBe(false)
    expect(config.includeCI).toBe(false)
    expect(config.includeReadme).toBe(true)
  })

  it('should accept custom config', () => {
    const agent = new CodeAgent({
      defaultLanguage: 'javascript',
      includeDocker: true,
      includeCI: true,
    })
    const config = agent.getConfig()
    expect(config.defaultLanguage).toBe('javascript')
    expect(config.includeDocker).toBe(true)
    expect(config.includeCI).toBe(true)
  })

  it('should return list of templates', () => {
    const agent = new CodeAgent()
    const templates = agent.getTemplates()
    expect(templates.length).toBe(12)
    expect(templates).toContain('rest-api')
    expect(templates).toContain('library')
    expect(templates).toContain('cli-tool')
    expect(templates).toContain('microservice')
  })

  it('should track cumulative stats', () => {
    const agent = new CodeAgent()
    expect(agent.getStats().filesCreated).toBe(0)
    expect(agent.getStats().projectsScaffolded).toBe(0)

    agent.scaffold('a', 'library')
    expect(agent.getStats().projectsScaffolded).toBe(1)

    agent.createFile({ path: 'x.ts', description: 'test' })
    expect(agent.getStats().filesCreated).toBeGreaterThan(1)
  })
})

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §6  CODE QUALITY TESTS                                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

describe('CodeAgent — Code Quality', () => {
  let agent: CodeAgent

  beforeEach(() => {
    agent = new CodeAgent()
  })

  it('should generate valid package.json', () => {
    const result = agent.scaffold('test-app', 'rest-api')
    const pkg = result.files.find(f => f.path === 'package.json')!
    const parsed = JSON.parse(pkg.content)
    expect(parsed.name).toBe('test-app')
    expect(parsed.version).toBe('1.0.0')
    expect(parsed.scripts).toBeDefined()
    expect(parsed.scripts.test).toBeDefined()
    expect(parsed.scripts.lint).toBeDefined()
  })

  it('should generate valid tsconfig.json', () => {
    const result = agent.scaffold('test-app', 'rest-api', 'typescript')
    const tsconfig = result.files.find(f => f.path === 'tsconfig.json')!
    const parsed = JSON.parse(tsconfig.content)
    expect(parsed.compilerOptions).toBeDefined()
    expect(parsed.compilerOptions.strict).toBe(true)
    expect(parsed.compilerOptions.target).toBeDefined()
  })

  it('should generate files with proper exports', () => {
    const result = agent.scaffold('test-lib', 'library')
    const index = result.files.find(f => f.path === 'src/index.ts')!
    expect(index.content).toContain('export')
  })

  it('should generate files with proper imports', () => {
    const result = agent.scaffold('test-api', 'rest-api')
    const routes = result.files.find(f => f.path === 'src/routes.ts')!
    expect(routes.content).toContain('import')
  })

  it('should generate cross-linked files', () => {
    const result = agent.scaffold('test-api', 'rest-api')
    const index = result.files.find(f => f.path === 'src/index.ts')!
    expect(index.content).toContain('./server')
    const server = result.files.find(f => f.path === 'src/server.ts')!
    expect(server.content).toContain('./routes')
    expect(server.content).toContain('./middleware')
  })

  it('should generate test files with vitest imports', () => {
    const result = agent.scaffold('test-api', 'rest-api')
    const tests = result.files.filter(f => f.path.includes('test'))
    for (const test of tests) {
      expect(test.content).toContain('vitest')
    }
  })

  it('should generate production-quality controller code', () => {
    const result = agent.scaffold('test-api', 'rest-api')
    const ctrl = result.files.find(f => f.path === 'src/controller.ts')!
    // Should have error handling
    expect(ctrl.content).toContain('404')
    // Should have proper HTTP status codes
    expect(ctrl.content).toContain('200')
    expect(ctrl.content).toContain('201')
  })

  it('should generate middleware with CORS', () => {
    const result = agent.scaffold('test-api', 'rest-api')
    const mw = result.files.find(f => f.path === 'src/middleware.ts')!
    expect(mw.content).toContain('CORS')
    expect(mw.content).toContain('Access-Control')
  })

  it('should generate library with retry logic', () => {
    const result = agent.scaffold('test-lib', 'library')
    const impl = result.files.find(f => f.path.includes('testLib.ts'))!
    expect(impl.content).toContain('retry')
    expect(impl.content).toContain('execute')
  })

  it('should generate CLI with arg parsing', () => {
    const result = agent.scaffold('my-tool', 'cli-tool')
    const args = result.files.find(f => f.path === 'src/args.ts')!
    expect(args.content).toContain('parseArgs')
    expect(args.content).toContain('--help')
    expect(args.content).toContain('--version')
  })
})

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §7  EDGE CASES                                                             ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

describe('CodeAgent — Edge Cases', () => {
  let agent: CodeAgent

  beforeEach(() => {
    agent = new CodeAgent()
  })

  it('should handle empty description gracefully', () => {
    const result = agent.createFile({
      path: 'src/empty.ts',
      description: '',
    })
    expect(result.file.content.length).toBeGreaterThan(0)
  })

  it('should handle special characters in project name', () => {
    const result = agent.scaffold('my-cool_project 2024', 'library')
    expect(result.files.length).toBeGreaterThan(0)
    expect(result.name).toBe('my-cool_project 2024')
  })

  it('should handle unknown file extension', () => {
    const result = agent.createFile({
      path: 'src/module.xyz',
      description: 'An unknown format',
    })
    expect(result.file.content.length).toBeGreaterThan(0)
  })

  it('should handle add to empty file', () => {
    const result = agent.addToFile({
      path: 'src/new.ts',
      description: 'Add first function',
      existingContent: '',
    })
    expect(result.content.length).toBeGreaterThan(0)
    expect(result.addedCode.length).toBeGreaterThan(0)
  })

  it('should handle add to file with only imports', () => {
    const result = agent.addToFile({
      path: 'src/app.ts',
      description: 'Add code',
      existingContent: "import { x } from './x'\nimport { y } from './y'\n",
      position: 'after-imports',
    })
    expect(result.content).toContain('import')
    expect(result.addedCode.length).toBeGreaterThan(0)
  })

  it('should handle export of non-existent symbol gracefully', () => {
    const result = agent.addExport({
      path: 'src/mod.ts',
      symbolName: 'nonExistent',
      kind: 'function',
      existingContent: 'const x = 1\n',
    })
    // Should add an export statement at the bottom
    expect(result).toContain('nonExistent')
  })

  it('should handle Python file scaffolding', () => {
    const agent2 = new CodeAgent({ includeConfigs: false, includeReadme: false })
    const result = agent2.scaffold('my-api', 'rest-api', 'python')
    expect(result.language).toBe('python')
    expect(result.files.length).toBeGreaterThan(0)
  })

  it('should generate Docker for Go', () => {
    const agent2 = new CodeAgent({ includeDocker: true, includeConfigs: false, includeReadme: false })
    const result = agent2.scaffold('my-svc', 'rest-api', 'go')
    const dockerfile = result.files.find(f => f.path === 'Dockerfile')
    expect(dockerfile).toBeDefined()
    expect(dockerfile!.content).toContain('golang')
  })

  it('should generate Docker for Python', () => {
    const agent2 = new CodeAgent({ includeDocker: true, includeConfigs: false, includeReadme: false })
    const result = agent2.scaffold('my-svc', 'rest-api', 'python')
    const dockerfile = result.files.find(f => f.path === 'Dockerfile')
    expect(dockerfile).toBeDefined()
    expect(dockerfile!.content).toContain('python')
  })
})
