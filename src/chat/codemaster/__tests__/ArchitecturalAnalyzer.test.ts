import { describe, it, expect } from 'vitest'
import { ArchitecturalAnalyzer } from '../ArchitecturalAnalyzer'

// ── Constructor ──────────────────────────────────────────────────────────────

describe('ArchitecturalAnalyzer constructor', () => {
  it('creates an instance with default thresholds', () => {
    const analyzer = new ArchitecturalAnalyzer()
    expect(analyzer).toBeInstanceOf(ArchitecturalAnalyzer)
  })

  it('accepts custom godClassThreshold', () => {
    const analyzer = new ArchitecturalAnalyzer({ godClassThreshold: 100 })
    expect(analyzer).toBeInstanceOf(ArchitecturalAnalyzer)
  })

  it('accepts custom godFunctionThreshold', () => {
    const analyzer = new ArchitecturalAnalyzer({ godFunctionThreshold: 20 })
    expect(analyzer).toBeInstanceOf(ArchitecturalAnalyzer)
  })

  it('accepts both custom thresholds', () => {
    const analyzer = new ArchitecturalAnalyzer({ godClassThreshold: 150, godFunctionThreshold: 30 })
    expect(analyzer).toBeInstanceOf(ArchitecturalAnalyzer)
  })
})

// ── Empty / Null Code ────────────────────────────────────────────────────────

describe('analyze – empty/null code', () => {
  it('returns default analysis for empty string', () => {
    const result = new ArchitecturalAnalyzer().analyze('')
    expect(result.issues).toEqual([])
    expect(result.patterns).toEqual([])
    expect(result.classMetrics).toEqual([])
    expect(result.architectureScore).toBe(100)
    expect(result.summary).toBe('No code to analyze.')
  })

  it('returns default analysis for whitespace-only string', () => {
    const result = new ArchitecturalAnalyzer().analyze('   \n\n  ')
    expect(result.summary).toBe('No code to analyze.')
  })
})

// ── God Class Detection ──────────────────────────────────────────────────────

describe('analyze – god class detection', () => {
  it('detects a god class exceeding line threshold', () => {
    const bodyLines = Array.from({ length: 310 }, (_, i) => `  method${i}() { return ${i} }`)
    const code = ['class HugeClass {', ...bodyLines, '}'].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'god-class' && i.title.includes('HugeClass'))
    expect(issue).toBeDefined()
    expect(issue!.solidPrinciple).toBe('SRP')
  })

  it('uses custom godClassThreshold', () => {
    const bodyLines = Array.from({ length: 60 }, (_, i) => `  m${i}() { return ${i} }`)
    const code = ['class SmallGod {', ...bodyLines, '}'].join('\n')
    const result = new ArchitecturalAnalyzer({ godClassThreshold: 50 }).analyze(code)
    const issue = result.issues.find(i => i.type === 'god-class' && i.title.includes('SmallGod'))
    expect(issue).toBeDefined()
  })

  it('flags critical severity when line count exceeds 2× threshold', () => {
    const bodyLines = Array.from({ length: 610 }, (_, i) => `  m${i}() { return ${i} }`)
    const code = ['class MassiveClass {', ...bodyLines, '}'].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'god-class' && i.severity === 'critical')
    expect(issue).toBeDefined()
  })

  it('detects class with too many methods (>15)', () => {
    const methods = Array.from({ length: 16 }, (_, i) => `  action${i}() { return ${i} }`)
    const code = ['class Overloaded {', ...methods, '}'].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'god-class' && i.title.includes('too many methods'))
    expect(issue).toBeDefined()
  })
})

// ── God Function Detection ───────────────────────────────────────────────────

describe('analyze – god function detection', () => {
  it('detects a function exceeding the default threshold (50 lines)', () => {
    const bodyLines = Array.from({ length: 55 }, (_, i) => `  const v${i} = ${i}`)
    const code = ['function longFunction() {', ...bodyLines, '}'].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'god-function')
    expect(issue).toBeDefined()
    expect(issue!.solidPrinciple).toBe('SRP')
  })

  it('uses custom godFunctionThreshold', () => {
    const bodyLines = Array.from({ length: 12 }, (_, i) => `  const v${i} = ${i}`)
    const code = ['function shortish() {', ...bodyLines, '}'].join('\n')
    const result = new ArchitecturalAnalyzer({ godFunctionThreshold: 10 }).analyze(code)
    const issue = result.issues.find(i => i.type === 'god-function')
    expect(issue).toBeDefined()
  })

  it('does not flag short functions', () => {
    const code = 'function tiny() {\n  return 1\n}'
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.issues.find(i => i.type === 'god-function')).toBeUndefined()
  })
})

// ── SRP Violation Detection ──────────────────────────────────────────────────

describe('analyze – SRP violation detection', () => {
  it('detects class mixing 3+ concerns', () => {
    const code = [
      'class Kitchen {',
      '  database() {}',
      '  query() {}',
      '  sql() {}',
      '  calculate() {}',
      '  validate() {}',
      '  process() {}',
      '  render() {}',
      '  display() {}',
      '  format() {}',
      '  read() {}',
      '  write() {}',
      '  file() {}',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'srp-violation')
    expect(issue).toBeDefined()
    expect(issue!.solidPrinciple).toBe('SRP')
  })
})

// ── ISP Violation Detection ──────────────────────────────────────────────────

describe('analyze – ISP violation detection', () => {
  it('detects a large interface with >10 members', () => {
    const members = Array.from({ length: 12 }, (_, i) => `  prop${i}: string`)
    const code = ['interface BigContract {', ...members, '}'].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'isp-violation')
    expect(issue).toBeDefined()
    expect(issue!.solidPrinciple).toBe('ISP')
  })

  it('does not flag small interfaces', () => {
    const code = 'interface Small {\n  a: string\n  b: number\n}'
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.issues.find(i => i.type === 'isp-violation')).toBeUndefined()
  })
})

// ── DIP Violation Detection ──────────────────────────────────────────────────

describe('analyze – DIP violation detection', () => {
  it('detects direct instantiation in constructor', () => {
    const code = [
      'class Service {',
      '  constructor() {',
      '    this.repo = new DatabaseRepo()',
      '  }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'dip-violation')
    expect(issue).toBeDefined()
    expect(issue!.solidPrinciple).toBe('DIP')
    expect(issue!.title).toContain('DatabaseRepo')
  })
})

// ── Feature Envy Detection ───────────────────────────────────────────────────

describe('analyze – feature envy detection', () => {
  it('detects heavy use of another objects properties', () => {
    const code = [
      'function summarize(order: any) {',
      '  return order.name + order.price + order.quantity + order.tax + order.discount',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'feature-envy')
    expect(issue).toBeDefined()
  })
})

// ── Data Clump Detection ─────────────────────────────────────────────────────

describe('analyze – data clump detection', () => {
  it('detects function with 5+ parameters', () => {
    const code = 'function send(to: string, from: string, subject: string, body: string, cc: string) {\n  return true\n}'
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'data-clump')
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe('medium')
  })
})

// ── Primitive Obsession Detection ────────────────────────────────────────────

describe('analyze – primitive obsession detection', () => {
  it('detects repeated use of a semantic primitive ≥3 times', () => {
    const code = [
      'function a(email: string) {}',
      'function b(email: string) {}',
      'function c(email: string) {}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'primitive-obsession')
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe('info')
  })
})

// ── Missing Abstraction Detection ────────────────────────────────────────────

describe('analyze – missing abstraction detection', () => {
  it('detects large switch statement with ≥5 cases', () => {
    const code = [
      'function route(action: string) {',
      '  switch (action) {',
      '    case "a": return 1',
      '    case "b": return 2',
      '    case "c": return 3',
      '    case "d": return 4',
      '    case "e": return 5',
      '  }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'missing-abstraction' && i.title.includes('switch'))
    expect(issue).toBeDefined()
    expect(issue!.severity).toBe('low')
  })

  it('detects long if-else chain with ≥4 branches', () => {
    const code = [
      'function classify(x: number) {',
      '  if (x === 1) { return "a" }',
      '  else if (x === 2) { return "b" }',
      '  else if (x === 3) { return "c" }',
      '  else if (x === 4) { return "d" }',
      '  else if (x === 5) { return "e" }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const issue = result.issues.find(i => i.type === 'missing-abstraction' && i.title.includes('if-else'))
    expect(issue).toBeDefined()
  })
})

// ── Design Pattern Detection ─────────────────────────────────────────────────

describe('analyze – design pattern detection', () => {
  it('detects Singleton pattern', () => {
    const code = [
      'class Logger {',
      '  private static instance: Logger',
      '  private constructor() {}',
      '  static getInstance() {',
      '    if (!Logger.instance) Logger.instance = new Logger()',
      '    return Logger.instance',
      '  }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const pattern = result.patterns.find(p => p.name === 'Singleton')
    expect(pattern).toBeDefined()
    expect(pattern!.category).toBe('creational')
    expect(pattern!.confidence).toBeGreaterThanOrEqual(0.8)
    expect(pattern!.wellImplemented).toBe(true)
  })

  it('flags Singleton without private constructor', () => {
    const code = [
      'class Logger {',
      '  private static instance: Logger',
      '  constructor() {}',
      '  static getInstance() {',
      '    if (!Logger.instance) Logger.instance = new Logger()',
      '    return Logger.instance',
      '  }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const pattern = result.patterns.find(p => p.name === 'Singleton')
    expect(pattern).toBeDefined()
    expect(pattern!.wellImplemented).toBe(false)
    expect(pattern!.issues).toContain('Constructor should be private')
  })

  it('detects Factory Method pattern', () => {
    const code = [
      'class ShapeFactory {',
      '  createCircle() { return new Circle() }',
      '  createSquare() { return new Square() }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const pattern = result.patterns.find(p => p.name === 'Factory Method')
    expect(pattern).toBeDefined()
    expect(pattern!.category).toBe('creational')
  })

  it('detects Observer/Event pattern', () => {
    const code = [
      'class EventBus {',
      '  on(event: string, handler: Function) {}',
      '  emit(event: string, data: any) {}',
      '}',
      'bus.on("click", handler)',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const pattern = result.patterns.find(p => p.name === 'Observer/Event')
    expect(pattern).toBeDefined()
    expect(pattern!.category).toBe('behavioral')
  })

  it('flags Observer without cleanup mechanism', () => {
    const code = 'emitter.on("data", handler)\nemitter.emit("data", payload)'
    const result = new ArchitecturalAnalyzer().analyze(code)
    const pattern = result.patterns.find(p => p.name === 'Observer/Event')
    expect(pattern).toBeDefined()
    expect(pattern!.issues.length).toBeGreaterThan(0)
  })

  it('detects Strategy pattern', () => {
    const code = [
      'class Processor {',
      '  private strategy: Strategy',
      '  setStrategy(s: Strategy) { this.strategy = s }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const pattern = result.patterns.find(p => p.name === 'Strategy')
    expect(pattern).toBeDefined()
    expect(pattern!.category).toBe('behavioral')
  })

  it('detects Builder pattern', () => {
    const code = [
      'class QueryBuilder {',
      '  setTable(t: string) { this.table = t; return this }',
      '  withLimit(n: number) { this.limit = n; return this }',
      '  build() { return this.query }',
      '}',
      'const q = new QueryBuilder().setTable("users").withLimit(10).build()',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const pattern = result.patterns.find(p => p.name === 'Builder')
    expect(pattern).toBeDefined()
    expect(pattern!.category).toBe('creational')
  })

  it('detects Decorator pattern', () => {
    const code = [
      '@Component',
      'class Widget {',
      '  render() { return "<div/>" }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const pattern = result.patterns.find(p => p.name === 'Decorator')
    expect(pattern).toBeDefined()
    expect(pattern!.category).toBe('structural')
  })
})

// ── Class Metrics Extraction ─────────────────────────────────────────────────

describe('analyze – class metrics', () => {
  it('extracts basic class metrics', () => {
    const code = [
      'class UserService {',
      '  private name: string = ""',
      '  private age: number = 0',
      '  constructor(private db: any) {}',
      '  getUser() { return this.name }',
      '  setUser(name: string) { this.name = name }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.classMetrics.length).toBeGreaterThanOrEqual(1)
    const cls = result.classMetrics.find(c => c.name === 'UserService')
    expect(cls).toBeDefined()
    expect(cls!.methodCount).toBeGreaterThanOrEqual(2)
    expect(cls!.propertyCount).toBeGreaterThanOrEqual(1)
    expect(cls!.dependencyCount).toBeGreaterThanOrEqual(1)
  })

  it('marks SRP violation for classes with >10 methods', () => {
    const methods = Array.from({ length: 11 }, (_, i) => `  method${i}() { return ${i} }`)
    const code = ['class BigService {', ...methods, '}'].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const cls = result.classMetrics.find(c => c.name === 'BigService')
    expect(cls).toBeDefined()
    expect(cls!.solidViolations).toContain('SRP')
  })

  it('marks DIP violation for classes with >5 dependencies', () => {
    const code = [
      'class Overloaded {',
      '  constructor(a: A, b: B, c: C, d: D, e: E, f: F) {}',
      '  run() { return true }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const cls = result.classMetrics.find(c => c.name === 'Overloaded')
    expect(cls).toBeDefined()
    expect(cls!.solidViolations).toContain('DIP')
  })
})

// ── Cohesion ─────────────────────────────────────────────────────────────────

describe('analyze – cohesion', () => {
  it('calculates cohesion > 0 for class methods using this', () => {
    const code = [
      'class Cohesive {',
      '  private value: number = 0',
      '  increment() { this.value++ }',
      '  getValue() { return this.value }',
      '  reset() { this.value = 0 }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    const cls = result.classMetrics.find(c => c.name === 'Cohesive')
    expect(cls).toBeDefined()
    expect(cls!.cohesion).toBeGreaterThan(0)
  })

  it('returns cohesion of 1 for class with no methods', () => {
    const code = 'class Empty {\n}'
    const result = new ArchitecturalAnalyzer().analyze(code)
    const cls = result.classMetrics.find(c => c.name === 'Empty')
    expect(cls).toBeDefined()
    expect(cls!.cohesion).toBe(1)
  })
})

// ── Architecture Score ───────────────────────────────────────────────────────

describe('analyze – architecture score', () => {
  it('returns 100 for clean code with no issues', () => {
    const code = 'function add(a: number, b: number) {\n  return a + b\n}'
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.architectureScore).toBeGreaterThanOrEqual(95)
  })

  it('reduces score for issues', () => {
    const bodyLines = Array.from({ length: 310 }, (_, i) => `  m${i}() { return ${i} }`)
    const code = ['class Bad {', ...bodyLines, '}'].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.architectureScore).toBeLessThan(100)
  })

  it('score is clamped between 0 and 100', () => {
    const code = 'function simple() {\n  return 1\n}'
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.architectureScore).toBeGreaterThanOrEqual(0)
    expect(result.architectureScore).toBeLessThanOrEqual(100)
  })
})

// ── Summary Generation ───────────────────────────────────────────────────────

describe('analyze – summary', () => {
  it('includes class count in summary when classes exist', () => {
    const code = 'class Foo {\n  run() { return 1 }\n}'
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.summary).toContain('class(es) analyzed')
  })

  it('includes pattern count when patterns detected', () => {
    const code = [
      'class Logger {',
      '  private static instance: Logger',
      '  private constructor() {}',
      '  static getInstance() {',
      '    if (!Logger.instance) Logger.instance = new Logger()',
      '    return Logger.instance',
      '  }',
      '}',
    ].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.summary).toContain('design pattern(s) detected')
  })

  it('includes architecture score in summary', () => {
    const code = 'function a() {\n  return 1\n}'
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.summary).toContain('Architecture score:')
  })

  it('says no issues when code is clean', () => {
    const code = 'const x = 1'
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.summary).toContain('No architectural issues detected.')
  })

  it('reports SOLID violation count in summary', () => {
    const bodyLines = Array.from({ length: 310 }, (_, i) => `  m${i}() { return ${i} }`)
    const code = ['class Bad {', ...bodyLines, '}'].join('\n')
    const result = new ArchitecturalAnalyzer().analyze(code)
    expect(result.summary).toContain('SOLID violation')
  })
})
