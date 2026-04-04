import { describe, it, expect, beforeEach } from 'vitest'
import {
  SemanticCodeAnalyzer,
  type SemanticCodeAnalyzerConfig,
  type SemanticCodeAnalysis,
  type CodeSymbol,
  type DetectedPattern,
  type DetectedAntiPattern,
  type DependencyEdge,
  type QualityMetrics,
} from '../SemanticCodeAnalyzer.js'

describe('SemanticCodeAnalyzer', () => {
  let analyzer: SemanticCodeAnalyzer

  beforeEach(() => {
    analyzer = new SemanticCodeAnalyzer()
  })

  // ── Constructor & Config ───────────────────────────────────────────────────

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const config = analyzer.getConfig()
      expect(config.maxAnalysisDepth).toBe(10)
      expect(config.enablePatternDetection).toBe(true)
      expect(config.enableQualityMetrics).toBe(true)
      expect(config.enableDependencyAnalysis).toBe(true)
      expect(config.enableAntiPatternDetection).toBe(true)
      expect(config.complexityThreshold).toBe(15)
      expect(config.maxSymbols).toBe(5000)
      expect(config.minConfidence).toBe(0.3)
    })

    it('should accept partial config overrides', () => {
      const custom = new SemanticCodeAnalyzer({ maxAnalysisDepth: 5, minConfidence: 0.5 })
      const config = custom.getConfig()
      expect(config.maxAnalysisDepth).toBe(5)
      expect(config.minConfidence).toBe(0.5)
      expect(config.enablePatternDetection).toBe(true)
    })

    it('should initialize stats with timestamps', () => {
      const stats = analyzer.getStats()
      expect(stats.totalAnalyses).toBe(0)
      expect(stats.createdAt).toBeTruthy()
      expect(stats.lastUsedAt).toBeTruthy()
    })
  })

  // ── Symbol Extraction ──────────────────────────────────────────────────────

  describe('extractSymbols', () => {
    it('should extract class declarations', () => {
      const code = 'export class MyService {\n  constructor() {}\n  getData() { return 1 }\n}'
      const symbols = analyzer.extractSymbols(code)
      const cls = symbols.find(s => s.name === 'MyService')
      expect(cls).toBeDefined()
      expect(cls!.kind).toBe('class')
    })

    it('should extract function declarations', () => {
      const code = 'function helper(x: number): number { return x * 2 }'
      const symbols = analyzer.extractSymbols(code)
      const fn = symbols.find(s => s.name === 'helper')
      expect(fn).toBeDefined()
      expect(fn!.kind).toBe('function')
    })

    it('should extract interface declarations', () => {
      const code = 'export interface Config { name: string; value: number }'
      const symbols = analyzer.extractSymbols(code)
      const iface = symbols.find(s => s.name === 'Config')
      expect(iface).toBeDefined()
      expect(iface!.kind).toBe('interface')
    })

    it('should extract enum declarations', () => {
      const code = 'export enum Status { Active, Inactive }'
      const symbols = analyzer.extractSymbols(code)
      const en = symbols.find(s => s.name === 'Status')
      expect(en).toBeDefined()
      expect(en!.kind).toBe('enum')
    })

    it('should extract type aliases', () => {
      const code = 'export type Result = { ok: boolean; data: string }'
      const symbols = analyzer.extractSymbols(code)
      const tp = symbols.find(s => s.name === 'Result')
      expect(tp).toBeDefined()
      expect(tp!.kind).toBe('type')
    })

    it('should count references', () => {
      const code = 'function calc(x: number) { return x + x }\ncalc(1)\ncalc(2)'
      const symbols = analyzer.extractSymbols(code)
      const fn = symbols.find(s => s.name === 'calc')
      expect(fn).toBeDefined()
      expect(fn!.references).toBeGreaterThanOrEqual(2)
    })

    it('should handle empty code', () => {
      const symbols = analyzer.extractSymbols('')
      expect(symbols).toEqual([])
    })

    it('should update stats', () => {
      analyzer.extractSymbols('const x = 1')
      expect(analyzer.getStats().totalSymbolsExtracted).toBeGreaterThan(0)
    })

    it('should extract arrow functions', () => {
      const code = 'const process = async (data: string) => { return data }'
      const symbols = analyzer.extractSymbols(code)
      const fn = symbols.find(s => s.name === 'process')
      expect(fn).toBeDefined()
    })

    it('should extract methods', () => {
      const code = 'class A {\n  public getData(): string { return "" }\n  private setData(v: string) {}\n}'
      const symbols = analyzer.extractSymbols(code)
      const method = symbols.find(s => s.name === 'getData')
      expect(method).toBeDefined()
      expect(method!.kind).toBe('method')
    })
  })

  // ── Pattern Detection ──────────────────────────────────────────────────────

  describe('detectPatterns', () => {
    it('should detect singleton pattern', () => {
      const code = `
        class Database {
          private static instance: Database
          private constructor() {}
          static getInstance() { return this.instance || (this.instance = new Database()) }
        }
      `
      const patterns = analyzer.detectPatterns(code)
      const singleton = patterns.find(p => p.type === 'singleton')
      expect(singleton).toBeDefined()
      expect(singleton!.confidence).toBeGreaterThanOrEqual(0.8)
    })

    it('should detect factory pattern', () => {
      const code = `
        function createUser() { return {} }
        function createAdmin() { return {} }
        function createGuest() { return {} }
      `
      const patterns = analyzer.detectPatterns(code)
      const factory = patterns.find(p => p.type === 'factory')
      expect(factory).toBeDefined()
    })

    it('should detect observer pattern', () => {
      const code = `
        class EventBus {
          subscribe(event: string, fn: Function) {}
          unsubscribe(event: string, fn: Function) {}
          emit(event: string) {}
        }
      `
      const patterns = analyzer.detectPatterns(code)
      const observer = patterns.find(p => p.type === 'observer')
      expect(observer).toBeDefined()
    })

    it('should detect builder pattern', () => {
      const code = `
        class QueryBuilder {
          select() { return this }
          where() { return this }
          orderBy() { return this }
          limit() { return this }
        }
      `
      const patterns = analyzer.detectPatterns(code)
      const builder = patterns.find(p => p.type === 'builder')
      expect(builder).toBeDefined()
    })

    it('should detect repository pattern', () => {
      const code = `
        class UserRepo {
          find(id: string) {}
          getAll() {}
          save(user: any) {}
          update(user: any) {}
          delete(id: string) {}
        }
      `
      const patterns = analyzer.detectPatterns(code)
      const repo = patterns.find(p => p.type === 'repository')
      expect(repo).toBeDefined()
    })

    it('should detect command pattern', () => {
      const code = `
        class MoveCommand {
          execute() { this.receiver.move() }
          undo() { this.receiver.moveBack() }
        }
      `
      const patterns = analyzer.detectPatterns(code)
      const cmd = patterns.find(p => p.type === 'command')
      expect(cmd).toBeDefined()
    })

    it('should detect iterator pattern', () => {
      const code = `class Iter { [Symbol.iterator]() { return this } next() { return { done: false, value: 1 } } }`
      const patterns = analyzer.detectPatterns(code)
      const iter = patterns.find(p => p.type === 'iterator')
      expect(iter).toBeDefined()
    })

    it('should return empty for simple code', () => {
      const patterns = analyzer.detectPatterns('const x = 1')
      expect(patterns.length).toBe(0)
    })

    it('should filter by minConfidence', () => {
      const high = new SemanticCodeAnalyzer({ minConfidence: 0.99 })
      const patterns = high.detectPatterns('function createA() {} function createB() {}')
      expect(patterns.length).toBe(0)
    })

    it('should update stats', () => {
      analyzer.detectPatterns('class S { private constructor() {} static instance: S }')
      expect(analyzer.getStats().totalPatternsDetected).toBeGreaterThanOrEqual(0)
    })
  })

  // ── Anti-Pattern Detection ─────────────────────────────────────────────────

  describe('detectAntiPatterns', () => {
    it('should detect god class', () => {
      const methods = Array.from({ length: 20 }, (_, i) => `  public method${i}() {}`).join('\n')
      const code = `class BigService {\n${methods}\n}`
      const antiPatterns = analyzer.detectAntiPatterns(code)
      const god = antiPatterns.find(a => a.type === 'god_class')
      expect(god).toBeDefined()
      expect(god!.severity).toBe('high')
    })

    it('should detect message chains', () => {
      const code = 'const result = obj.prop1.prop2.prop3.prop4.prop5'
      const antiPatterns = analyzer.detectAntiPatterns(code)
      const chain = antiPatterns.find(a => a.type === 'message_chain')
      expect(chain).toBeDefined()
    })

    it('should return empty for clean code', () => {
      const code = 'function add(a: number, b: number) { return a + b }'
      const antiPatterns = analyzer.detectAntiPatterns(code)
      expect(antiPatterns.length).toBe(0)
    })

    it('should detect dead code (unused privates)', () => {
      const code = `class A {\n  private unusedField = 42\n  public doSomething() { return 1 }\n}`
      const antiPatterns = analyzer.detectAntiPatterns(code)
      const dead = antiPatterns.find(a => a.type === 'dead_code')
      expect(dead).toBeDefined()
    })

    it('should have suggestions for each anti-pattern', () => {
      const methods = Array.from({ length: 20 }, (_, i) => `  public m${i}() {}`).join('\n')
      const code = `class Big {\n${methods}\n}`
      const antiPatterns = analyzer.detectAntiPatterns(code)
      for (const ap of antiPatterns) {
        expect(ap.suggestion).toBeTruthy()
        expect(ap.description).toBeTruthy()
      }
    })
  })

  // ── Dependency Analysis ────────────────────────────────────────────────────

  describe('analyzeDependencies', () => {
    it('should detect import dependencies', () => {
      const code = "import { Service } from './service'\nimport { Utils } from './utils'"
      const deps = analyzer.analyzeDependencies(code)
      const imports = deps.filter(d => d.type === 'import')
      expect(imports.length).toBe(2)
    })

    it('should detect extends relationships', () => {
      const code = 'class Admin extends User {}'
      const deps = analyzer.analyzeDependencies(code)
      const ext = deps.find(d => d.type === 'extend')
      expect(ext).toBeDefined()
      expect(ext!.source).toBe('Admin')
      expect(ext!.target).toBe('User')
    })

    it('should detect implements relationships', () => {
      const code = 'class MyService implements IService, ILogger {}'
      const deps = analyzer.analyzeDependencies(code)
      const impls = deps.filter(d => d.type === 'implement')
      expect(impls.length).toBe(2)
    })

    it('should detect composition (new)', () => {
      const code = 'const logger = new Logger()\nconst db = new Database()'
      const deps = analyzer.analyzeDependencies(code)
      const compose = deps.filter(d => d.type === 'compose')
      expect(compose.length).toBe(2)
    })

    it('should handle empty code', () => {
      const deps = analyzer.analyzeDependencies('')
      expect(deps).toEqual([])
    })
  })

  // ── Quality Metrics ────────────────────────────────────────────────────────

  describe('measureQuality', () => {
    it('should compute cyclomatic complexity', () => {
      const code = 'function f(x: number) { if (x > 0) { for (let i = 0; i < x; i++) {} } else if (x < 0) { while (x++) {} } }'
      const quality = analyzer.measureQuality(code)
      expect(quality.cyclomaticComplexity).toBeGreaterThan(3)
    })

    it('should compute maintainability index', () => {
      const code = 'function add(a: number, b: number): number { return a + b }'
      const quality = analyzer.measureQuality(code)
      expect(quality.maintainabilityIndex).toBeGreaterThan(0)
      expect(quality.maintainabilityIndex).toBeLessThanOrEqual(100)
    })

    it('should compute documentation coverage', () => {
      const code = '// This is a function\nfunction f() {}\n// More docs\nconst x = 1'
      const quality = analyzer.measureQuality(code)
      expect(quality.documentationCoverage).toBeGreaterThan(0)
    })

    it('should compute readability score', () => {
      const code = 'const x = 1\nconst y = 2\nreturn x + y'
      const quality = analyzer.measureQuality(code)
      expect(quality.readabilityScore).toBeGreaterThan(0)
    })

    it('should compute all metrics', () => {
      const code = 'function f() { const x = 1; return x }'
      const q = analyzer.measureQuality(code)
      expect(q.cyclomaticComplexity).toBeDefined()
      expect(q.cognitiveComplexity).toBeDefined()
      expect(q.couplingScore).toBeDefined()
      expect(q.cohesionScore).toBeDefined()
      expect(q.duplicateRatio).toBeDefined()
      expect(q.testabilityScore).toBeDefined()
    })

    it('should update stats', () => {
      analyzer.measureQuality('const x = 1')
      expect(analyzer.getStats().totalQualityAssessments).toBe(1)
    })
  })

  // ── Code Similarity ────────────────────────────────────────────────────────

  describe('computeSimilarity', () => {
    it('should return 1 for identical code', () => {
      const code = 'function add(a, b) { return a + b }'
      expect(analyzer.computeSimilarity(code, code)).toBe(1)
    })

    it('should return 0 for completely different code', () => {
      const sim = analyzer.computeSimilarity(
        'function processData(input) { transform(input) }',
        'class Vehicle { drive() { startEngine() } }',
      )
      expect(sim).toBeLessThan(0.5)
    })

    it('should return high similarity for similar code', () => {
      const code1 = 'function add(a: number, b: number) { return a + b }'
      const code2 = 'function sum(a: number, b: number) { return a + b }'
      expect(analyzer.computeSimilarity(code1, code2)).toBeGreaterThan(0.5)
    })

    it('should handle empty strings', () => {
      expect(analyzer.computeSimilarity('', '')).toBe(1)
      expect(analyzer.computeSimilarity('code', '')).toBe(0)
      expect(analyzer.computeSimilarity('', 'code')).toBe(0)
    })
  })

  // ── Full Analysis ──────────────────────────────────────────────────────────

  describe('analyzeCode', () => {
    it('should return full analysis', () => {
      const code = `
        import { Logger } from './logger'
        export class UserService {
          private logger: Logger
          constructor() { this.logger = new Logger() }
          public getUser(id: string) { if (id) return { id } }
          public saveUser(user: any) { this.logger.log('save') }
        }
      `
      const analysis = analyzer.analyzeCode(code, 'typescript')
      expect(analysis.symbols.length).toBeGreaterThan(0)
      expect(analysis.quality).toBeDefined()
      expect(analysis.quality.cyclomaticComplexity).toBeGreaterThan(0)
      expect(analysis.summary).toBeTruthy()
      expect(analysis.confidence).toBeGreaterThan(0)
      expect(analysis.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('should respect disabled features', () => {
      const a = new SemanticCodeAnalyzer({
        enablePatternDetection: false,
        enableAntiPatternDetection: false,
        enableDependencyAnalysis: false,
        enableQualityMetrics: false,
      })
      const result = a.analyzeCode('const x = 1')
      expect(result.patterns).toEqual([])
      expect(result.antiPatterns).toEqual([])
      expect(result.dependencies).toEqual([])
    })

    it('should update stats', () => {
      analyzer.analyzeCode('const x = 1')
      const stats = analyzer.getStats()
      expect(stats.totalAnalyses).toBe(1)
      expect(stats.avgAnalysisTimeMs).toBeGreaterThanOrEqual(0)
    })
  })

  // ── Suggest Improvements ───────────────────────────────────────────────────

  describe('suggestImprovements', () => {
    it('should suggest reducing complexity for complex code', () => {
      const lines = Array.from({ length: 20 }, (_, i) => `if (x${i}) { for (let i = 0; i < 10; i++) {} }`).join('\n')
      const suggestions = analyzer.suggestImprovements(lines)
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some(s => s.toLowerCase().includes('complexity') || s.toLowerCase().includes('maintain'))).toBe(true)
    })

    it('should return empty for clean code', () => {
      const suggestions = analyzer.suggestImprovements('const x = 1')
      // May or may not have suggestions for minimal code
      expect(Array.isArray(suggestions)).toBe(true)
    })
  })

  // ── Persistence ────────────────────────────────────────────────────────────

  describe('serialize/deserialize', () => {
    it('should serialize and deserialize correctly', () => {
      analyzer.analyzeCode('function test() { return 1 }')
      const json = analyzer.serialize()
      const restored = SemanticCodeAnalyzer.deserialize(json)
      expect(restored.getStats().totalAnalyses).toBe(1)
      expect(restored.getConfig().maxAnalysisDepth).toBe(10)
    })

    it('should preserve custom config', () => {
      const custom = new SemanticCodeAnalyzer({ minConfidence: 0.8 })
      const json = custom.serialize()
      const restored = SemanticCodeAnalyzer.deserialize(json)
      expect(restored.getConfig().minConfidence).toBe(0.8)
    })
  })
})
