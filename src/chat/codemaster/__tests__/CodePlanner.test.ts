import { describe, it, expect, beforeEach } from 'vitest'
import { CodePlanner, type PlannedChange, type RiskLevel } from '../CodePlanner'

// ── Helper to build a minimal PlannedChange ──

function makeChange(overrides: Partial<PlannedChange> = {}): PlannedChange {
  return {
    filePath: overrides.filePath ?? 'src/index.ts',
    changeType: overrides.changeType ?? 'modify',
    description: overrides.description ?? 'test change',
    linesAdded: overrides.linesAdded ?? 5,
    linesRemoved: overrides.linesRemoved ?? 2,
    risk: overrides.risk ?? 'low',
    dependsOn: overrides.dependsOn ?? [],
    language: overrides.language ?? 'typescript',
    validationSteps: overrides.validationSteps ?? ['lint', 'test'],
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// classifyIntent Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('classifyIntent', () => {
  let planner: CodePlanner

  beforeEach(() => {
    planner = new CodePlanner()
  })

  it('classifies "add a new login page" as new-feature', () => {
    expect(planner.classifyIntent('add a new login page')).toBe('new-feature')
  })

  it('classifies "fix the crash on startup" as fix-bug', () => {
    expect(planner.classifyIntent('fix the crash on startup')).toBe('fix-bug')
  })

  it('classifies "refactor the data module to simplify it" as refactor', () => {
    expect(planner.classifyIntent('refactor the data module to simplify it')).toBe('refactor')
  })

  it('classifies "optimize database query performance" as optimize', () => {
    expect(planner.classifyIntent('optimize database query performance')).toBe('optimize')
  })

  it('classifies "add unit tests for the parser" as add-tests', () => {
    expect(planner.classifyIntent('add unit tests for the parser')).toBe('add-tests')
  })

  it('classifies "document the API endpoints" as documentation', () => {
    expect(planner.classifyIntent('document the API endpoints')).toBe('documentation')
  })

  it('classifies "fix XSS vulnerability in input sanitization" as security', () => {
    expect(planner.classifyIntent('fix XSS vulnerability in input sanitization')).toBe('security')
  })

  it('classifies "implement a caching layer" as new-feature', () => {
    expect(planner.classifyIntent('implement a caching layer')).toBe('new-feature')
  })

  it('returns general for unrecognized input', () => {
    expect(planner.classifyIntent('hello world')).toBe('general')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// detectMentionedFiles Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('detectMentionedFiles', () => {
  let planner: CodePlanner

  beforeEach(() => {
    planner = new CodePlanner()
  })

  it('extracts a .ts file path', () => {
    const files = planner.detectMentionedFiles(
      'update src/utils/helpers.ts to export the new function',
    )
    expect(files).toContain('src/utils/helpers.ts')
  })

  it('extracts a .py file path', () => {
    const files = planner.detectMentionedFiles('modify app/main.py for the new route')
    expect(files).toContain('app/main.py')
  })

  it('extracts a .json file path', () => {
    const files = planner.detectMentionedFiles('update package.json to add the new dependency')
    expect(files).toContain('package.json')
  })

  it('extracts multiple file paths', () => {
    const files = planner.detectMentionedFiles('modify src/app.js and src/index.ts')
    expect(files).toContain('src/app.js')
    expect(files).toContain('src/index.ts')
  })

  it('deduplicates file paths', () => {
    const files = planner.detectMentionedFiles('check src/foo.ts and also src/foo.ts again')
    const fooCount = files.filter(f => f === 'src/foo.ts').length
    expect(fooCount).toBe(1)
  })

  it('returns empty array when no files are mentioned', () => {
    const files = planner.detectMentionedFiles('do something cool')
    expect(files).toEqual([])
  })

  it('extracts files with various extensions', () => {
    const files = planner.detectMentionedFiles('edit main.go and lib.rs and App.swift')
    expect(files).toContain('main.go')
    expect(files).toContain('lib.rs')
    expect(files).toContain('App.swift')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// inferAffectedFiles Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('inferAffectedFiles', () => {
  let planner: CodePlanner

  beforeEach(() => {
    planner = new CodePlanner()
  })

  it('returns mentioned files when they exist in the description', () => {
    const result = planner.inferAffectedFiles('update src/utils.ts', ['src/utils.ts', 'src/app.ts'])
    expect(result).toContain('src/utils.ts')
  })

  it('matches test-related tasks to test files in knownFiles', () => {
    const known = ['src/app.ts', 'src/__tests__/app.test.ts', 'src/utils.ts']
    const result = planner.inferAffectedFiles('add test coverage', known)
    expect(result).toContain('src/__tests__/app.test.ts')
  })

  it('matches readme tasks to readme files', () => {
    const known = ['src/index.ts', 'README.md']
    const result = planner.inferAffectedFiles('update the readme', known)
    expect(result).toContain('README.md')
  })

  it('matches keywords longer than 3 chars to file names', () => {
    const known = ['src/auth.ts', 'src/database.ts']
    const result = planner.inferAffectedFiles('refactor the auth logic', known)
    expect(result).toContain('src/auth.ts')
  })

  it('returns empty when no files match and no files mentioned', () => {
    const known = ['src/app.ts']
    const result = planner.inferAffectedFiles('do something', known)
    expect(result).toEqual([])
  })

  it('deduplicates inferred files', () => {
    const known = ['src/auth.ts']
    const result = planner.inferAffectedFiles('fix the auth and auth logic', known)
    const count = result.filter(f => f === 'src/auth.ts').length
    expect(count).toBe(1)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// assessRisk Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('assessRisk', () => {
  let planner: CodePlanner

  beforeEach(() => {
    planner = new CodePlanner()
  })

  it('returns low for create changes', () => {
    expect(
      planner.assessRisk({
        changeType: 'create',
        filePath: 'src/new.ts',
        linesAdded: 100,
        linesRemoved: 0,
      }),
    ).toBe('low')
  })

  it('returns high for delete changes', () => {
    expect(
      planner.assessRisk({
        changeType: 'delete',
        filePath: 'src/old.ts',
        linesAdded: 0,
        linesRemoved: 50,
      }),
    ).toBe('high')
  })

  it('returns critical for large modifications (>200 delta)', () => {
    expect(
      planner.assessRisk({
        changeType: 'modify',
        filePath: 'src/big.ts',
        linesAdded: 150,
        linesRemoved: 60,
      }),
    ).toBe('critical')
  })

  it('returns high for modifications with >100 delta', () => {
    expect(
      planner.assessRisk({
        changeType: 'modify',
        filePath: 'src/medium.ts',
        linesAdded: 80,
        linesRemoved: 30,
      }),
    ).toBe('high')
  })

  it('returns medium for modifications with >50 delta', () => {
    expect(
      planner.assessRisk({
        changeType: 'modify',
        filePath: 'src/med.ts',
        linesAdded: 40,
        linesRemoved: 20,
      }),
    ).toBe('medium')
  })

  it('returns low for modifications with >10 delta', () => {
    expect(
      planner.assessRisk({
        changeType: 'modify',
        filePath: 'src/small.ts',
        linesAdded: 10,
        linesRemoved: 5,
      }),
    ).toBe('low')
  })

  it('returns medium for config file changes with small delta', () => {
    expect(
      planner.assessRisk({
        changeType: 'modify',
        filePath: 'package.json',
        linesAdded: 2,
        linesRemoved: 1,
      }),
    ).toBe('medium')
  })

  it('returns medium for tsconfig changes with small delta', () => {
    expect(
      planner.assessRisk({
        changeType: 'modify',
        filePath: 'tsconfig.json',
        linesAdded: 1,
        linesRemoved: 1,
      }),
    ).toBe('medium')
  })

  it('returns medium for .env file changes with small delta', () => {
    expect(
      planner.assessRisk({
        changeType: 'modify',
        filePath: '.env',
        linesAdded: 1,
        linesRemoved: 0,
      }),
    ).toBe('medium')
  })

  it('returns minimal for small non-config modifications', () => {
    expect(
      planner.assessRisk({
        changeType: 'modify',
        filePath: 'src/utils.ts',
        linesAdded: 3,
        linesRemoved: 2,
      }),
    ).toBe('minimal')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// buildExecutionOrder Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('buildExecutionOrder', () => {
  let planner: CodePlanner

  beforeEach(() => {
    planner = new CodePlanner()
  })

  it('returns files in dependency order', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/b.ts', dependsOn: ['src/a.ts'] }),
      makeChange({ filePath: 'src/a.ts', dependsOn: [] }),
    ]
    const order = planner.buildExecutionOrder(changes)
    expect(order.indexOf('src/a.ts')).toBeLessThan(order.indexOf('src/b.ts'))
  })

  it('handles changes with no dependencies', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/x.ts' }),
      makeChange({ filePath: 'src/y.ts' }),
    ]
    const order = planner.buildExecutionOrder(changes)
    expect(order).toHaveLength(2)
    expect(order).toContain('src/x.ts')
    expect(order).toContain('src/y.ts')
  })

  it('handles a linear chain of dependencies', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/c.ts', dependsOn: ['src/b.ts'] }),
      makeChange({ filePath: 'src/b.ts', dependsOn: ['src/a.ts'] }),
      makeChange({ filePath: 'src/a.ts', dependsOn: [] }),
    ]
    const order = planner.buildExecutionOrder(changes)
    expect(order).toEqual(['src/a.ts', 'src/b.ts', 'src/c.ts'])
  })

  it('handles diamond dependencies', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/a.ts', dependsOn: [] }),
      makeChange({ filePath: 'src/b.ts', dependsOn: ['src/a.ts'] }),
      makeChange({ filePath: 'src/c.ts', dependsOn: ['src/a.ts'] }),
      makeChange({ filePath: 'src/d.ts', dependsOn: ['src/b.ts', 'src/c.ts'] }),
    ]
    const order = planner.buildExecutionOrder(changes)
    expect(order.indexOf('src/a.ts')).toBeLessThan(order.indexOf('src/b.ts'))
    expect(order.indexOf('src/a.ts')).toBeLessThan(order.indexOf('src/c.ts'))
    expect(order.indexOf('src/b.ts')).toBeLessThan(order.indexOf('src/d.ts'))
    expect(order.indexOf('src/c.ts')).toBeLessThan(order.indexOf('src/d.ts'))
  })

  it('includes all nodes even when a cycle exists', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/a.ts', dependsOn: ['src/b.ts'] }),
      makeChange({ filePath: 'src/b.ts', dependsOn: ['src/a.ts'] }),
    ]
    const order = planner.buildExecutionOrder(changes)
    expect(order).toHaveLength(2)
    expect(order).toContain('src/a.ts')
    expect(order).toContain('src/b.ts')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// validatePlan Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('validatePlan', () => {
  let planner: CodePlanner

  beforeEach(() => {
    planner = new CodePlanner()
  })

  it('returns no warnings for a valid plan', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/a.ts', dependsOn: [] }),
      makeChange({ filePath: 'src/b.ts', dependsOn: ['src/a.ts'] }),
    ]
    const warnings = planner.validatePlan(changes)
    expect(warnings).toEqual([])
  })

  it('detects circular dependencies', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/a.ts', dependsOn: ['src/b.ts'] }),
      makeChange({ filePath: 'src/b.ts', dependsOn: ['src/a.ts'] }),
    ]
    const warnings = planner.validatePlan(changes)
    expect(warnings.some(w => w.message.includes('Circular dependency'))).toBe(true)
  })

  it('detects missing dependencies', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/a.ts', dependsOn: ['src/missing.ts'] }),
    ]
    const warnings = planner.validatePlan(changes)
    expect(warnings.some(w => w.message.includes('not in the plan'))).toBe(true)
    expect(warnings.some(w => w.affectedFiles.includes('src/missing.ts'))).toBe(true)
  })

  it('detects duplicate file paths', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/a.ts' }),
      makeChange({ filePath: 'src/a.ts' }),
    ]
    const warnings = planner.validatePlan(changes)
    expect(warnings.some(w => w.message.includes('Duplicate'))).toBe(true)
  })

  it('warns about high-risk changes without validation steps', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/a.ts', risk: 'high', validationSteps: [] }),
    ]
    const warnings = planner.validatePlan(changes)
    expect(warnings.some(w => w.message.includes('no validation steps'))).toBe(true)
  })

  it('warns about critical-risk changes without validation steps', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/a.ts', risk: 'critical', validationSteps: [] }),
    ]
    const warnings = planner.validatePlan(changes)
    expect(warnings.some(w => w.message.includes('no validation steps'))).toBe(true)
  })

  it('does not warn about low-risk changes without validation steps', () => {
    const changes: PlannedChange[] = [
      makeChange({ filePath: 'src/a.ts', risk: 'low', validationSteps: [] }),
    ]
    const warnings = planner.validatePlan(changes)
    expect(warnings.some(w => w.message.includes('no validation steps'))).toBe(false)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// computeOverallRisk Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('computeOverallRisk', () => {
  let planner: CodePlanner

  beforeEach(() => {
    planner = new CodePlanner()
  })

  it('returns minimal for empty changes', () => {
    expect(planner.computeOverallRisk([])).toBe('minimal')
  })

  it('returns the single change risk level', () => {
    expect(planner.computeOverallRisk([makeChange({ risk: 'medium' })])).toBe('medium')
  })

  it('returns the highest risk among changes', () => {
    const changes = [
      makeChange({ filePath: 'a.ts', risk: 'low' }),
      makeChange({ filePath: 'b.ts', risk: 'high' }),
      makeChange({ filePath: 'c.ts', risk: 'minimal' }),
    ]
    expect(planner.computeOverallRisk(changes)).toBe('high')
  })

  it('escalates when 3+ high/critical risk changes exist', () => {
    const changes = [
      makeChange({ filePath: 'a.ts', risk: 'high' }),
      makeChange({ filePath: 'b.ts', risk: 'high' }),
      makeChange({ filePath: 'c.ts', risk: 'high' }),
    ]
    expect(planner.computeOverallRisk(changes)).toBe('critical')
  })

  it('does not escalate beyond critical', () => {
    const changes = [
      makeChange({ filePath: 'a.ts', risk: 'critical' }),
      makeChange({ filePath: 'b.ts', risk: 'critical' }),
      makeChange({ filePath: 'c.ts', risk: 'critical' }),
    ]
    expect(planner.computeOverallRisk(changes)).toBe('critical')
  })

  it('does not escalate with only 2 high-risk changes', () => {
    const changes = [
      makeChange({ filePath: 'a.ts', risk: 'high' }),
      makeChange({ filePath: 'b.ts', risk: 'high' }),
    ]
    expect(planner.computeOverallRisk(changes)).toBe('high')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// estimateEffort Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('estimateEffort', () => {
  let planner: CodePlanner

  beforeEach(() => {
    planner = new CodePlanner()
  })

  it('returns trivial for <=20 delta and <=2 files', () => {
    const changes = [makeChange({ linesAdded: 10, linesRemoved: 5 })]
    const effort = planner.estimateEffort(changes)
    expect(effort.complexity).toBe('trivial')
    expect(effort.filesAffected).toBe(1)
    expect(effort.totalLinesAdded).toBe(10)
    expect(effort.totalLinesRemoved).toBe(5)
  })

  it('returns simple for <=100 delta and <=5 files', () => {
    const changes = [
      makeChange({ filePath: 'a.ts', linesAdded: 30, linesRemoved: 10 }),
      makeChange({ filePath: 'b.ts', linesAdded: 20, linesRemoved: 10 }),
      makeChange({ filePath: 'c.ts', linesAdded: 15, linesRemoved: 5 }),
    ]
    const effort = planner.estimateEffort(changes)
    expect(effort.complexity).toBe('simple')
  })

  it('returns moderate for <=300 delta and <=10 files', () => {
    const changes = Array.from({ length: 6 }, (_, i) =>
      makeChange({ filePath: `f${i}.ts`, linesAdded: 30, linesRemoved: 10 }),
    )
    const effort = planner.estimateEffort(changes)
    expect(effort.complexity).toBe('moderate')
  })

  it('returns complex for <=1000 delta', () => {
    const changes = Array.from({ length: 12 }, (_, i) =>
      makeChange({ filePath: `f${i}.ts`, linesAdded: 50, linesRemoved: 20 }),
    )
    const effort = planner.estimateEffort(changes)
    expect(effort.complexity).toBe('complex')
  })

  it('returns very-complex for >1000 delta', () => {
    const changes = Array.from({ length: 15 }, (_, i) =>
      makeChange({ filePath: `f${i}.ts`, linesAdded: 50, linesRemoved: 30 }),
    )
    const effort = planner.estimateEffort(changes)
    expect(effort.complexity).toBe('very-complex')
  })

  it('sums lines added and removed correctly', () => {
    const changes = [
      makeChange({ filePath: 'a.ts', linesAdded: 10, linesRemoved: 5 }),
      makeChange({ filePath: 'b.ts', linesAdded: 20, linesRemoved: 15 }),
    ]
    const effort = planner.estimateEffort(changes)
    expect(effort.totalLinesAdded).toBe(30)
    expect(effort.totalLinesRemoved).toBe(20)
    expect(effort.filesAffected).toBe(2)
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// createPlan Tests
// ══════════════════════════════════════════════════════════════════════════════

describe('createPlan', () => {
  let planner: CodePlanner

  beforeEach(() => {
    planner = new CodePlanner()
  })

  it('returns a plan with all required fields', () => {
    const plan = planner.createPlan('add a new REST endpoint')
    expect(plan.id).toBeDefined()
    expect(plan.title).toBeDefined()
    expect(plan.intent).toBeDefined()
    expect(Array.isArray(plan.changes)).toBe(true)
    expect(Array.isArray(plan.executionOrder)).toBe(true)
    expect(Array.isArray(plan.contextFiles)).toBe(true)
    expect(plan.overallRisk).toBeDefined()
    expect(Array.isArray(plan.warnings)).toBe(true)
    expect(typeof plan.summary).toBe('string')
    expect(plan.effort).toBeDefined()
    expect(typeof plan.isValid).toBe('boolean')
  })

  it('generates a unique plan id', () => {
    const plan1 = planner.createPlan('task one')
    const plan2 = planner.createPlan('task two')
    expect(plan1.id).not.toBe(plan2.id)
  })

  it('classifies intent correctly in the plan', () => {
    const plan = planner.createPlan('fix the login bug in src/auth.ts')
    expect(plan.intent).toBe('fix-bug')
  })

  it('creates a plan with detected files', () => {
    const plan = planner.createPlan('update src/utils.ts with the new helper')
    expect(plan.changes.length).toBeGreaterThanOrEqual(1)
    expect(plan.changes.some(c => c.filePath === 'src/utils.ts')).toBe(true)
  })

  it('creates a default plan when no files are detected', () => {
    const plan = planner.createPlan('do something general')
    expect(plan.changes.length).toBe(1)
    expect(plan.changes[0].filePath).toBe('src/index.ts')
  })

  it('uses test file default for add-tests intent when no files detected', () => {
    const plan = planner.createPlan('add unit tests for the parser')
    expect(plan.changes.some(c => c.filePath.includes('test'))).toBe(true)
  })

  it('plan summary contains intent', () => {
    const plan = planner.createPlan('optimize the image loading pipeline')
    expect(plan.summary).toContain('optimize')
  })

  it('plan title contains intent label', () => {
    const plan = planner.createPlan('refactor the data module to simplify it')
    expect(plan.title).toContain('Refactor')
  })

  it('plan isValid when no critical warnings', () => {
    const plan = planner.createPlan('add a button')
    expect(plan.isValid).toBe(true)
  })

  it('populates executionOrder with change file paths', () => {
    const plan = planner.createPlan('modify src/app.ts and src/utils.ts')
    for (const c of plan.changes) {
      expect(plan.executionOrder).toContain(c.filePath)
    }
  })

  it('infers context files from knownFiles', () => {
    const plan = planner.createPlan('update src/auth.ts', {
      knownFiles: ['src/auth.ts', 'src/auth.test.ts', 'src/types.ts'],
    })
    // Context files shouldn't include the changed file itself
    expect(plan.contextFiles).not.toContain('src/auth.ts')
  })

  it('assigns correct language to detected files', () => {
    const plan = planner.createPlan('update app/main.py with the new route')
    const pyChange = plan.changes.find(c => c.filePath === 'app/main.py')
    expect(pyChange?.language).toBe('python')
  })

  it('uses create changeType for new-feature intent', () => {
    const plan = planner.createPlan('add a new component src/Widget.tsx')
    const change = plan.changes.find(c => c.filePath === 'src/Widget.tsx')
    expect(change?.changeType).toBe('create')
  })

  it('uses modify changeType for fix-bug intent', () => {
    const plan = planner.createPlan('fix the bug in src/app.ts')
    const change = plan.changes.find(c => c.filePath === 'src/app.ts')
    expect(change?.changeType).toBe('modify')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// CodePlanner constructor
// ══════════════════════════════════════════════════════════════════════════════

describe('CodePlanner constructor', () => {
  it('creates an instance', () => {
    const planner = new CodePlanner()
    expect(planner).toBeInstanceOf(CodePlanner)
  })
})
