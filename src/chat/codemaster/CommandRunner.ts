/**
 * ⚡ CommandRunner — Shell Command Intelligence Engine
 *
 * Provides intelligent shell command capabilities like GitHub Copilot agent:
 *   • Suggests appropriate commands for tasks (build, test, lint, deploy)
 *   • Validates commands for safety before execution
 *   • Parses command output for errors and warnings
 *   • Detects package managers and build tools automatically
 *   • Generates multi-step command sequences for complex tasks
 *   • Understands shell syntax across bash, powershell, cmd
 *   • Tracks command history and success/failure patterns
 *
 * Works fully offline — pattern-based intelligence, zero external deps.
 */

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Shell environment types. */
export type ShellType = 'bash' | 'powershell' | 'cmd' | 'zsh' | 'fish'

/** Command categories for organization. */
export type CommandCategory =
  | 'build'
  | 'test'
  | 'lint'
  | 'format'
  | 'install'
  | 'run'
  | 'deploy'
  | 'git'
  | 'docker'
  | 'debug'
  | 'clean'
  | 'publish'
  | 'migrate'
  | 'general'

/** Risk level of a command. */
export type CommandRisk = 'safe' | 'moderate' | 'dangerous' | 'destructive'

/** A suggested command. */
export interface SuggestedCommand {
  /** The actual command string. */
  command: string
  /** Human-readable description. */
  description: string
  /** Category of the command. */
  category: CommandCategory
  /** Risk assessment. */
  risk: CommandRisk
  /** Expected shell type. */
  shell: ShellType
  /** Whether this requires confirmation before execution. */
  requiresConfirmation: boolean
  /** Estimated execution time (seconds). */
  estimatedDuration: number
  /** Conditions that must be met. */
  prerequisites: string[]
}

/** Parsed output from a command execution. */
export interface CommandOutput {
  /** Whether the command succeeded. */
  success: boolean
  /** Exit code. */
  exitCode: number
  /** Extracted errors from output. */
  errors: ParsedError[]
  /** Extracted warnings. */
  warnings: ParsedWarning[]
  /** Summary of what happened. */
  summary: string
  /** Suggested next command(s) if the command failed. */
  suggestedFixes: string[]
}

/** A parsed error from command output. */
export interface ParsedError {
  /** Error message. */
  message: string
  /** File path if applicable. */
  filePath?: string
  /** Line number if applicable. */
  line?: number
  /** Column if applicable. */
  column?: number
  /** Error type/category. */
  type: string
}

/** A parsed warning from command output. */
export interface ParsedWarning {
  /** Warning message. */
  message: string
  /** File path if applicable. */
  filePath?: string
  /** Line number if applicable. */
  line?: number
  /** Warning type. */
  type: string
}

/** Detected project configuration. */
export interface ProjectConfig {
  /** Detected package manager. */
  packageManager:
    | 'npm'
    | 'yarn'
    | 'pnpm'
    | 'bun'
    | 'pip'
    | 'cargo'
    | 'go'
    | 'maven'
    | 'gradle'
    | 'unknown'
  /** Detected build tool. */
  buildTool: string
  /** Detected test runner. */
  testRunner: string
  /** Detected linter. */
  linter: string
  /** Detected formatter. */
  formatter: string
  /** Available scripts (from package.json etc). */
  scripts: Map<string, string>
  /** Whether TypeScript is used. */
  hasTypeScript: boolean
  /** Whether Docker is configured. */
  hasDocker: boolean
  /** Whether CI is configured. */
  hasCi: boolean
}

/** A multi-step command sequence. */
export interface CommandSequence {
  /** Sequence name. */
  name: string
  /** Description of what the sequence does. */
  description: string
  /** Steps in order. */
  steps: SequenceStep[]
  /** Overall risk. */
  risk: CommandRisk
  /** Estimated total duration (seconds). */
  totalDuration: number
}

/** A step in a command sequence. */
export interface SequenceStep {
  /** Step number (1-based). */
  step: number
  /** The command to run. */
  command: string
  /** Description. */
  description: string
  /** Whether to continue if this step fails. */
  continueOnError: boolean
  /** Expected output pattern (regex string) for validation. */
  expectedOutput?: string
}

/** Command history entry. */
export interface CommandHistoryEntry {
  /** Command that was run. */
  command: string
  /** When it was run (ISO timestamp). */
  timestamp: string
  /** Whether it succeeded. */
  success: boolean
  /** Category. */
  category: CommandCategory
}

// ══════════════════════════════════════════════════════════════════════════════
// DANGEROUS PATTERNS — commands we should flag
// ══════════════════════════════════════════════════════════════════════════════

const DESTRUCTIVE_PATTERNS: RegExp[] = [
  /\brm\s+-rf\s+[/~]/, // rm -rf with root/home paths
  /\brm\s+-rf\s+\*/, // rm -rf *
  /\bdd\s+if=/, // dd (disk destroyer)
  /\bmkfs\b/, // format filesystem
  /\bfdisk\b/, // partition editing
  /\bshutdown\b/, // shutdown system
  /\breboot\b/, // reboot system
  /\bchmod\s+-R\s+777/, // insecure permissions
  />\s*\/dev\/sd[a-z]/, // write to raw disk
  /\bcurl\b.*\|\s*(?:ba)?sh/, // pipe curl to shell
  /\bwget\b.*\|\s*(?:ba)?sh/, // pipe wget to shell
]

const DANGEROUS_PATTERNS: RegExp[] = [
  /\brm\s+-rf\b/, // any rm -rf
  /\bgit\s+push\s+.*--force\b/, // force push
  /\bgit\s+reset\s+--hard\b/, // hard reset
  /\bdrop\s+database\b/i, // drop database
  /\bdrop\s+table\b/i, // drop table
  /\btruncate\s+table\b/i, // truncate table
  /\bnpm\s+publish\b/, // publish to npm
  /\bdocker\s+system\s+prune\b/, // docker prune
  /\bkubectl\s+delete\b/, // k8s delete
]

const MODERATE_PATTERNS: RegExp[] = [
  /\bgit\s+push\b/, // push
  /\bgit\s+merge\b/, // merge
  /\bgit\s+rebase\b/, // rebase
  /\bnpm\s+install\b/, // install (modifies node_modules)
  /\bpip\s+install\b/, // pip install
  /\bdocker\s+build\b/, // docker build
  /\bdocker\s+run\b/, // docker run
]

// ══════════════════════════════════════════════════════════════════════════════
// ERROR PATTERNS — for parsing command output
// ══════════════════════════════════════════════════════════════════════════════

interface ErrorPattern {
  pattern: RegExp
  type: string
  extractFile: boolean
  extractLine: boolean
}

const ERROR_PATTERNS: ErrorPattern[] = [
  // TypeScript errors: src/file.ts(10,5): error TS2322
  {
    pattern: /(.+?)\((\d+),(\d+)\):\s*error\s+TS\d+:\s*(.+)/g,
    type: 'typescript',
    extractFile: true,
    extractLine: true,
  },
  // ESLint: /path/file.ts:10:5 error ...
  {
    pattern: /(.+?):(\d+):(\d+)\s+error\s+(.+)/g,
    type: 'eslint',
    extractFile: true,
    extractLine: true,
  },
  // Node.js errors: Error: message
  {
    pattern: /^(?:Error|TypeError|ReferenceError|SyntaxError):\s*(.+)/gm,
    type: 'runtime',
    extractFile: false,
    extractLine: false,
  },
  // Python errors: File "path", line N
  {
    pattern: /File "(.+?)", line (\d+).*\n\s+(.+)\n(\w+Error:\s*.+)/g,
    type: 'python',
    extractFile: true,
    extractLine: true,
  },
  // Rust errors: error[E0308]: ...
  { pattern: /error\[E\d+\]:\s*(.+)/g, type: 'rust', extractFile: false, extractLine: false },
  // Go errors: ./file.go:10:5: ...
  { pattern: /\.\/(.+?):(\d+):(\d+):\s*(.+)/g, type: 'go', extractFile: true, extractLine: true },
  // Generic "error:" pattern
  { pattern: /^error:\s*(.+)/gim, type: 'generic', extractFile: false, extractLine: false },
]

const WARNING_PATTERNS: ErrorPattern[] = [
  // ESLint warnings
  {
    pattern: /(.+?):(\d+):(\d+)\s+warning\s+(.+)/g,
    type: 'eslint',
    extractFile: true,
    extractLine: true,
  },
  // TypeScript warnings (rare but possible)
  {
    pattern: /(.+?)\((\d+),(\d+)\):\s*warning\s+(.+)/g,
    type: 'typescript',
    extractFile: true,
    extractLine: true,
  },
  // Generic "warning:" pattern
  { pattern: /^warning:\s*(.+)/gim, type: 'generic', extractFile: false, extractLine: false },
  // npm WARN
  { pattern: /^npm (?:WARN|warn)\s+(.+)/gm, type: 'npm', extractFile: false, extractLine: false },
  // Deprecation warnings
  {
    pattern: /(?:DeprecationWarning|deprecated):\s*(.+)/gi,
    type: 'deprecation',
    extractFile: false,
    extractLine: false,
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// COMMAND TEMPLATES — for common tasks
// ══════════════════════════════════════════════════════════════════════════════

interface CommandTemplate {
  task: string
  keywords: string[]
  commands: Record<string, string> // packageManager → command
  category: CommandCategory
  risk: CommandRisk
  duration: number
}

const COMMAND_TEMPLATES: CommandTemplate[] = [
  {
    task: 'install dependencies',
    keywords: ['install', 'dependencies', 'deps', 'packages', 'node_modules'],
    commands: {
      npm: 'npm install',
      yarn: 'yarn install',
      pnpm: 'pnpm install',
      bun: 'bun install',
      pip: 'pip install -r requirements.txt',
      cargo: 'cargo build',
      go: 'go mod download',
    },
    category: 'install',
    risk: 'moderate',
    duration: 30,
  },
  {
    task: 'build project',
    keywords: ['build', 'compile', 'transpile', 'tsc'],
    commands: {
      npm: 'npm run build',
      yarn: 'yarn build',
      pnpm: 'pnpm build',
      bun: 'bun run build',
      cargo: 'cargo build --release',
      go: 'go build ./...',
    },
    category: 'build',
    risk: 'safe',
    duration: 30,
  },
  {
    task: 'run tests',
    keywords: ['test', 'tests', 'spec', 'specs', 'unit test', 'vitest', 'jest'],
    commands: {
      npm: 'npm test',
      yarn: 'yarn test',
      pnpm: 'pnpm test',
      cargo: 'cargo test',
      go: 'go test ./...',
      pip: 'pytest',
    },
    category: 'test',
    risk: 'safe',
    duration: 60,
  },
  {
    task: 'lint code',
    keywords: ['lint', 'eslint', 'linter', 'check style', 'code quality'],
    commands: {
      npm: 'npm run lint',
      yarn: 'yarn lint',
      pnpm: 'pnpm lint',
      cargo: 'cargo clippy',
      go: 'golangci-lint run',
    },
    category: 'lint',
    risk: 'safe',
    duration: 15,
  },
  {
    task: 'format code',
    keywords: ['format', 'prettier', 'fmt', 'beautify', 'autoformat'],
    commands: {
      npm: 'npx prettier --write .',
      yarn: 'yarn prettier --write .',
      cargo: 'cargo fmt',
      go: 'gofmt -w .',
    },
    category: 'format',
    risk: 'moderate',
    duration: 10,
  },
  {
    task: 'type check',
    keywords: ['typecheck', 'type check', 'tsc', 'typescript check', 'types'],
    commands: { npm: 'npx tsc --noEmit', yarn: 'yarn tsc --noEmit', pnpm: 'pnpm tsc --noEmit' },
    category: 'build',
    risk: 'safe',
    duration: 15,
  },
  {
    task: 'clean build artifacts',
    keywords: ['clean', 'clear', 'artifacts', 'dist', 'build clean'],
    commands: {
      npm: 'rm -rf dist node_modules/.cache',
      yarn: 'rm -rf dist node_modules/.cache',
      cargo: 'cargo clean',
      go: 'go clean',
    },
    category: 'clean',
    risk: 'moderate',
    duration: 5,
  },
  {
    task: 'start development server',
    keywords: ['dev', 'start', 'server', 'run', 'development', 'watch'],
    commands: { npm: 'npm run dev', yarn: 'yarn dev', pnpm: 'pnpm dev', bun: 'bun run dev' },
    category: 'run',
    risk: 'safe',
    duration: 5,
  },
  {
    task: 'run database migrations',
    keywords: ['migrate', 'migration', 'database', 'db', 'schema'],
    commands: {
      npm: 'npx prisma migrate dev',
      yarn: 'yarn prisma migrate dev',
      pip: 'alembic upgrade head',
    },
    category: 'migrate',
    risk: 'dangerous',
    duration: 15,
  },
  {
    task: 'git status',
    keywords: ['status', 'git status', 'changes', 'modified'],
    commands: {
      npm: 'git status',
      yarn: 'git status',
      cargo: 'git status',
      go: 'git status',
      pip: 'git status',
    },
    category: 'git',
    risk: 'safe',
    duration: 1,
  },
  {
    task: 'git commit',
    keywords: ['commit', 'save', 'checkpoint'],
    commands: {
      npm: 'git add -A && git commit -m "update"',
      yarn: 'git add -A && git commit -m "update"',
    },
    category: 'git',
    risk: 'moderate',
    duration: 2,
  },
  {
    task: 'docker build',
    keywords: ['docker build', 'container', 'image', 'dockerfile'],
    commands: { npm: 'docker build -t app .', yarn: 'docker build -t app .' },
    category: 'docker',
    risk: 'moderate',
    duration: 120,
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// COMMAND RUNNER CLASS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * CommandRunner — Intelligent shell command engine.
 *
 * Suggests, validates, and analyzes shell commands for coding tasks.
 * Like GitHub Copilot agent, it knows which commands to run for build/test/lint.
 */
export class CommandRunner {
  private history: CommandHistoryEntry[] = []
  private maxHistory: number

  constructor(options?: { maxHistory?: number }) {
    this.maxHistory = options?.maxHistory ?? 100
  }

  /**
   * Assess the risk of a command.
   */
  assessRisk(command: string): CommandRisk {
    const trimmed = command.trim()

    for (const pattern of DESTRUCTIVE_PATTERNS) {
      pattern.lastIndex = 0
      if (pattern.test(trimmed)) return 'destructive'
    }
    for (const pattern of DANGEROUS_PATTERNS) {
      pattern.lastIndex = 0
      if (pattern.test(trimmed)) return 'dangerous'
    }
    for (const pattern of MODERATE_PATTERNS) {
      pattern.lastIndex = 0
      if (pattern.test(trimmed)) return 'moderate'
    }
    return 'safe'
  }

  /**
   * Validate a command for safety. Returns issues if any.
   */
  validateCommand(command: string): { safe: boolean; issues: string[] } {
    const issues: string[] = []
    const trimmed = command.trim()

    // Check for empty command
    if (!trimmed) {
      return { safe: false, issues: ['Empty command'] }
    }

    // Check for destructive patterns
    for (const pattern of DESTRUCTIVE_PATTERNS) {
      pattern.lastIndex = 0
      if (pattern.test(trimmed)) {
        issues.push(`Destructive command detected: matches pattern ${pattern.source}`)
      }
    }

    // Check for pipe to shell (code execution)
    if (/\|\s*(?:ba)?sh\b/.test(trimmed)) {
      issues.push('Piping to shell is a security risk')
    }

    // Check for sudo
    if (/\bsudo\b/.test(trimmed)) {
      issues.push('Command requires elevated privileges (sudo)')
    }

    // Check for environment variable injection
    if (/\$\(.*\)/.test(trimmed) || /`.*`/.test(trimmed)) {
      issues.push('Command contains command substitution — review for injection risks')
    }

    // Check for multiple chained commands with &&/||
    const chainedCount = (trimmed.match(/&&|\|\|/g) ?? []).length
    if (chainedCount > 5) {
      issues.push(
        `Complex command chain with ${chainedCount + 1} parts — consider breaking into steps`,
      )
    }

    return { safe: issues.length === 0, issues }
  }

  /**
   * Suggest commands for a given task description.
   */
  suggestCommands(taskDescription: string, config?: Partial<ProjectConfig>): SuggestedCommand[] {
    const lower = taskDescription.toLowerCase()
    const pm = config?.packageManager ?? 'npm'
    const suggestions: SuggestedCommand[] = []

    for (const template of COMMAND_TEMPLATES) {
      const matchCount = template.keywords.filter(kw => lower.includes(kw)).length
      if (matchCount === 0) continue

      const cmd = template.commands[pm] ?? template.commands['npm']
      if (!cmd) continue

      suggestions.push({
        command: cmd,
        description: template.task,
        category: template.category,
        risk: template.risk,
        shell: 'bash',
        requiresConfirmation: template.risk !== 'safe',
        estimatedDuration: template.duration,
        prerequisites:
          template.category === 'test'
            ? ['Dependencies installed']
            : template.category === 'build'
              ? ['Dependencies installed']
              : [],
      })
    }

    // Sort by match relevance (more keyword matches first)
    suggestions.sort((a, b) => {
      const aScore =
        COMMAND_TEMPLATES.find(
          t => t.commands[pm] === a.command || t.commands['npm'] === a.command,
        )?.keywords.filter(kw => lower.includes(kw)).length ?? 0
      const bScore =
        COMMAND_TEMPLATES.find(
          t => t.commands[pm] === b.command || t.commands['npm'] === b.command,
        )?.keywords.filter(kw => lower.includes(kw)).length ?? 0
      return bScore - aScore
    })

    return suggestions
  }

  /**
   * Parse command output for errors and warnings.
   */
  parseOutput(output: string, exitCode: number): CommandOutput {
    const errors: ParsedError[] = []
    const warnings: ParsedWarning[] = []

    // Extract errors
    for (const ep of ERROR_PATTERNS) {
      ep.pattern.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = ep.pattern.exec(output)) !== null) {
        const error: ParsedError = {
          message: match[ep.extractFile ? 4 : 1] ?? match[1] ?? match[0],
          type: ep.type,
        }
        if (ep.extractFile && match[1]) error.filePath = match[1]
        if (ep.extractLine && match[2]) error.line = parseInt(match[2], 10)
        if (ep.extractLine && match[3]) error.column = parseInt(match[3], 10)
        errors.push(error)
      }
    }

    // Extract warnings
    for (const wp of WARNING_PATTERNS) {
      wp.pattern.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = wp.pattern.exec(output)) !== null) {
        const warning: ParsedWarning = {
          message: match[wp.extractFile ? 4 : 1] ?? match[1] ?? match[0],
          type: wp.type,
        }
        if (wp.extractFile && match[1]) warning.filePath = match[1]
        if (wp.extractLine && match[2]) warning.line = parseInt(match[2], 10)
        warnings.push(warning)
      }
    }

    // Generate summary
    const success = exitCode === 0
    let summary: string
    if (success && errors.length === 0) {
      summary = 'Command completed successfully'
      if (warnings.length > 0) summary += ` with ${warnings.length} warning(s)`
    } else {
      summary = `Command failed (exit code ${exitCode}) with ${errors.length} error(s)`
    }

    // Suggest fixes for common errors
    const suggestedFixes: string[] = []
    for (const error of errors) {
      if (
        error.message.includes('Cannot find module') ||
        error.message.includes('cannot find module')
      ) {
        suggestedFixes.push('npm install')
      }
      if (error.message.includes('ENOENT') || error.message.includes('not found')) {
        suggestedFixes.push('Check that the file/command exists and path is correct')
      }
      if (error.message.includes('permission denied') || error.message.includes('EACCES')) {
        suggestedFixes.push('Check file permissions')
      }
      if (error.message.includes('ECONNREFUSED')) {
        suggestedFixes.push('Check that the server/service is running')
      }
    }

    return {
      success,
      exitCode,
      errors,
      warnings,
      summary,
      suggestedFixes: [...new Set(suggestedFixes)],
    }
  }

  /**
   * Detect project configuration from file listings.
   */
  detectProjectConfig(files: string[]): ProjectConfig {
    const fileSet = new Set(files.map(f => f.toLowerCase()))
    const scripts = new Map<string, string>()

    // Package manager detection
    let packageManager: ProjectConfig['packageManager'] = 'unknown'
    if (fileSet.has('bun.lockb') || fileSet.has('bunfig.toml')) packageManager = 'bun'
    else if (fileSet.has('pnpm-lock.yaml') || fileSet.has('.pnpmfile.cjs')) packageManager = 'pnpm'
    else if (fileSet.has('yarn.lock')) packageManager = 'yarn'
    else if (fileSet.has('package-lock.json') || fileSet.has('package.json')) packageManager = 'npm'
    else if (
      fileSet.has('requirements.txt') ||
      fileSet.has('setup.py') ||
      fileSet.has('pyproject.toml')
    )
      packageManager = 'pip'
    else if (fileSet.has('cargo.toml')) packageManager = 'cargo'
    else if (fileSet.has('go.mod')) packageManager = 'go'
    else if (fileSet.has('pom.xml')) packageManager = 'maven'
    else if (fileSet.has('build.gradle') || fileSet.has('build.gradle.kts'))
      packageManager = 'gradle'

    // Build tool
    let buildTool = 'unknown'
    if (fileSet.has('vite.config.ts') || fileSet.has('vite.config.js')) buildTool = 'vite'
    else if (fileSet.has('webpack.config.js') || fileSet.has('webpack.config.ts'))
      buildTool = 'webpack'
    else if (fileSet.has('rollup.config.js') || fileSet.has('rollup.config.mjs'))
      buildTool = 'rollup'
    else if (fileSet.has('tsconfig.json')) buildTool = 'tsc'
    else if (fileSet.has('cargo.toml')) buildTool = 'cargo'
    else if (fileSet.has('makefile')) buildTool = 'make'

    // Test runner
    let testRunner = 'unknown'
    if (fileSet.has('vitest.config.ts') || fileSet.has('vitest.config.js')) testRunner = 'vitest'
    else if (fileSet.has('jest.config.js') || fileSet.has('jest.config.ts')) testRunner = 'jest'
    else if (fileSet.has('mocha.opts') || fileSet.has('.mocharc.yml')) testRunner = 'mocha'
    else if (fileSet.has('pytest.ini') || fileSet.has('conftest.py')) testRunner = 'pytest'

    // Linter
    let linter = 'unknown'
    if (
      fileSet.has('.eslintrc.js') ||
      fileSet.has('.eslintrc.json') ||
      fileSet.has('eslint.config.js') ||
      fileSet.has('eslint.config.mjs')
    )
      linter = 'eslint'
    else if (fileSet.has('.pylintrc') || fileSet.has('setup.cfg')) linter = 'pylint'
    else if (fileSet.has('.rubocop.yml')) linter = 'rubocop'

    // Formatter
    let formatter = 'unknown'
    if (
      fileSet.has('.prettierrc') ||
      fileSet.has('.prettierrc.json') ||
      fileSet.has('prettier.config.js')
    )
      formatter = 'prettier'
    else if (fileSet.has('.editorconfig')) formatter = 'editorconfig'

    return {
      packageManager,
      buildTool,
      testRunner,
      linter,
      formatter,
      scripts,
      hasTypeScript: fileSet.has('tsconfig.json'),
      hasDocker:
        fileSet.has('dockerfile') ||
        fileSet.has('docker-compose.yml') ||
        fileSet.has('docker-compose.yaml'),
      hasCi:
        fileSet.has('.github/workflows') ||
        fileSet.has('.gitlab-ci.yml') ||
        fileSet.has('jenkinsfile'),
    }
  }

  /**
   * Generate a multi-step command sequence for a complex task.
   */
  generateSequence(task: string, config?: Partial<ProjectConfig>): CommandSequence {
    const lower = task.toLowerCase()
    const pm = config?.packageManager ?? 'npm'
    const steps: SequenceStep[] = []
    let stepNum = 0

    // Full setup from scratch
    if (lower.includes('setup') || lower.includes('from scratch') || lower.includes('initialize')) {
      steps.push({
        step: ++stepNum,
        command: this.getInstallCmd(pm),
        description: 'Install dependencies',
        continueOnError: false,
      })
      if (config?.hasTypeScript) {
        steps.push({
          step: ++stepNum,
          command: this.getBuildCmd(pm),
          description: 'Build TypeScript',
          continueOnError: false,
        })
      }
      steps.push({
        step: ++stepNum,
        command: this.getLintCmd(pm),
        description: 'Lint code',
        continueOnError: true,
      })
      steps.push({
        step: ++stepNum,
        command: this.getTestCmd(pm),
        description: 'Run tests',
        continueOnError: false,
      })
    }
    // Deploy sequence
    else if (lower.includes('deploy') || lower.includes('release') || lower.includes('publish')) {
      steps.push({
        step: ++stepNum,
        command: this.getInstallCmd(pm),
        description: 'Install dependencies',
        continueOnError: false,
      })
      steps.push({
        step: ++stepNum,
        command: this.getLintCmd(pm),
        description: 'Lint code',
        continueOnError: false,
      })
      steps.push({
        step: ++stepNum,
        command: this.getTestCmd(pm),
        description: 'Run tests',
        continueOnError: false,
      })
      steps.push({
        step: ++stepNum,
        command: this.getBuildCmd(pm),
        description: 'Build for production',
        continueOnError: false,
      })
    }
    // CI pipeline
    else if (lower.includes('ci') || lower.includes('pipeline') || lower.includes('continuous')) {
      steps.push({
        step: ++stepNum,
        command: this.getInstallCmd(pm),
        description: 'Install dependencies',
        continueOnError: false,
      })
      steps.push({
        step: ++stepNum,
        command: this.getLintCmd(pm),
        description: 'Lint',
        continueOnError: false,
      })
      if (config?.hasTypeScript) {
        steps.push({
          step: ++stepNum,
          command: `${pm === 'npm' ? 'npx' : pm} tsc --noEmit`,
          description: 'Type check',
          continueOnError: false,
        })
      }
      steps.push({
        step: ++stepNum,
        command: this.getTestCmd(pm),
        description: 'Tests',
        continueOnError: false,
      })
      steps.push({
        step: ++stepNum,
        command: this.getBuildCmd(pm),
        description: 'Build',
        continueOnError: false,
      })
    }
    // Default: build and test
    else {
      steps.push({
        step: ++stepNum,
        command: this.getBuildCmd(pm),
        description: 'Build',
        continueOnError: false,
      })
      steps.push({
        step: ++stepNum,
        command: this.getTestCmd(pm),
        description: 'Test',
        continueOnError: false,
      })
    }

    const risk = steps.some(s => !s.continueOnError) ? 'moderate' : 'safe'
    const totalDuration = steps.length * 20 // rough estimate

    return {
      name: task,
      description: `Multi-step sequence: ${task}`,
      steps,
      risk,
      totalDuration,
    }
  }

  /**
   * Record a command execution in history.
   */
  recordCommand(command: string, success: boolean, category: CommandCategory = 'general'): void {
    this.history.push({
      command,
      timestamp: new Date().toISOString(),
      success,
      category,
    })

    // Trim history
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory)
    }
  }

  /**
   * Get command history.
   */
  getHistory(): CommandHistoryEntry[] {
    return [...this.history]
  }

  /**
   * Get history statistics.
   */
  getHistoryStats(): {
    total: number
    succeeded: number
    failed: number
    byCategory: Record<string, number>
  } {
    const byCategory: Record<string, number> = {}
    let succeeded = 0
    let failed = 0

    for (const entry of this.history) {
      if (entry.success) succeeded++
      else failed++
      byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1
    }

    return { total: this.history.length, succeeded, failed, byCategory }
  }

  /**
   * Clear command history.
   */
  clearHistory(): void {
    this.history = []
  }

  // ── Private helpers ──

  private getInstallCmd(pm: string): string {
    const cmds: Record<string, string> = {
      npm: 'npm install',
      yarn: 'yarn install',
      pnpm: 'pnpm install',
      bun: 'bun install',
      pip: 'pip install -r requirements.txt',
      cargo: 'cargo build',
      go: 'go mod download',
    }
    return cmds[pm] ?? 'npm install'
  }

  private getBuildCmd(pm: string): string {
    const cmds: Record<string, string> = {
      npm: 'npm run build',
      yarn: 'yarn build',
      pnpm: 'pnpm build',
      bun: 'bun run build',
      cargo: 'cargo build --release',
      go: 'go build ./...',
    }
    return cmds[pm] ?? 'npm run build'
  }

  private getTestCmd(pm: string): string {
    const cmds: Record<string, string> = {
      npm: 'npm test',
      yarn: 'yarn test',
      pnpm: 'pnpm test',
      cargo: 'cargo test',
      go: 'go test ./...',
      pip: 'pytest',
    }
    return cmds[pm] ?? 'npm test'
  }

  private getLintCmd(pm: string): string {
    const cmds: Record<string, string> = {
      npm: 'npm run lint',
      yarn: 'yarn lint',
      pnpm: 'pnpm lint',
      cargo: 'cargo clippy',
      go: 'golangci-lint run',
    }
    return cmds[pm] ?? 'npm run lint'
  }
}
