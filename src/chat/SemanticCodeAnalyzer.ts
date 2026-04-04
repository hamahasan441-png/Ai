// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║ SEMANTIC CODE ANALYZER — Phase 9 Intelligence Module                        ║
// ║ Deep semantic analysis of code: patterns, anti-patterns, quality, symbols   ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Configuration ──────────────────────────────────────────────────────────────

export interface SemanticCodeAnalyzerConfig {
  maxAnalysisDepth: number
  enablePatternDetection: boolean
  enableQualityMetrics: boolean
  enableDependencyAnalysis: boolean
  enableAntiPatternDetection: boolean
  complexityThreshold: number
  maxSymbols: number
  minConfidence: number
}

// ── Statistics ──────────────────────────────────────────────────────────────────

export interface SemanticCodeAnalyzerStats {
  totalAnalyses: number
  totalPatternsDetected: number
  totalAntiPatternsDetected: number
  totalSymbolsExtracted: number
  totalDependenciesFound: number
  totalQualityAssessments: number
  avgAnalysisTimeMs: number
  createdAt: string
  lastUsedAt: string
}

// ── Types ───────────────────────────────────────────────────────────────────────

export type CodePatternType =
  | 'singleton'
  | 'factory'
  | 'observer'
  | 'strategy'
  | 'decorator'
  | 'adapter'
  | 'builder'
  | 'command'
  | 'iterator'
  | 'template_method'
  | 'facade'
  | 'proxy'
  | 'mvc'
  | 'repository'
  | 'dependency_injection'

export interface DetectedPattern {
  type: CodePatternType
  confidence: number
  location: string
  description: string
  involvedSymbols: string[]
}

export type AntiPatternType =
  | 'god_class'
  | 'long_method'
  | 'feature_envy'
  | 'data_clump'
  | 'shotgun_surgery'
  | 'parallel_inheritance'
  | 'lazy_class'
  | 'speculative_generality'
  | 'dead_code'
  | 'primitive_obsession'
  | 'inappropriate_intimacy'
  | 'message_chain'

export interface DetectedAntiPattern {
  type: AntiPatternType
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  location: string
  description: string
  suggestion: string
}

export interface CodeSymbol {
  name: string
  kind: 'class' | 'function' | 'variable' | 'interface' | 'enum' | 'type' | 'module' | 'method' | 'property'
  scope: string
  references: number
  complexity: number
}

export interface DependencyEdge {
  source: string
  target: string
  type: 'import' | 'call' | 'extend' | 'implement' | 'compose' | 'use'
  strength: number
}

export interface QualityMetrics {
  maintainabilityIndex: number
  cyclomaticComplexity: number
  cognitiveComplexity: number
  couplingScore: number
  cohesionScore: number
  documentationCoverage: number
  testabilityScore: number
  readabilityScore: number
  duplicateRatio: number
}

export interface SemanticCodeAnalysis {
  symbols: CodeSymbol[]
  patterns: DetectedPattern[]
  antiPatterns: DetectedAntiPattern[]
  dependencies: DependencyEdge[]
  quality: QualityMetrics
  summary: string
  confidence: number
  durationMs: number
}

// ── Default Config ──────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: SemanticCodeAnalyzerConfig = {
  maxAnalysisDepth: 10,
  enablePatternDetection: true,
  enableQualityMetrics: true,
  enableDependencyAnalysis: true,
  enableAntiPatternDetection: true,
  complexityThreshold: 15,
  maxSymbols: 5000,
  minConfidence: 0.3,
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function tokenize(code: string): string[] {
  return code
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/['"`](?:[^'"`\\]|\\.)*['"`]/g, '')
    .split(/[^a-zA-Z0-9_$]+/)
    .filter(t => t.length > 0)
}

function countMatches(text: string, pattern: RegExp): number {
  const m = text.match(pattern)
  return m ? m.length : 0
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ── Main Class ──────────────────────────────────────────────────────────────────

export class SemanticCodeAnalyzer {
  private config: SemanticCodeAnalyzerConfig
  private stats: SemanticCodeAnalyzerStats
  private analysisTimesMs: number[] = []

  constructor(config?: Partial<SemanticCodeAnalyzerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    const now = new Date().toISOString()
    this.stats = {
      totalAnalyses: 0,
      totalPatternsDetected: 0,
      totalAntiPatternsDetected: 0,
      totalSymbolsExtracted: 0,
      totalDependenciesFound: 0,
      totalQualityAssessments: 0,
      avgAnalysisTimeMs: 0,
      createdAt: now,
      lastUsedAt: now,
    }
  }

  // ── Full Analysis ───────────────────────────────────────────────────────────

  analyzeCode(code: string, _language?: string): SemanticCodeAnalysis {
    const start = Date.now()
    this.stats.lastUsedAt = new Date().toISOString()

    const symbols = this.extractSymbols(code)
    const patterns = this.config.enablePatternDetection ? this.detectPatterns(code) : []
    const antiPatterns = this.config.enableAntiPatternDetection ? this.detectAntiPatterns(code) : []
    const dependencies = this.config.enableDependencyAnalysis ? this.analyzeDependencies(code) : []
    const quality = this.config.enableQualityMetrics ? this.measureQuality(code) : this.emptyQuality()

    const durationMs = Date.now() - start
    this.analysisTimesMs.push(durationMs)
    this.stats.totalAnalyses++
    this.stats.avgAnalysisTimeMs = round2(
      this.analysisTimesMs.reduce((a, b) => a + b, 0) / this.analysisTimesMs.length,
    )

    const confidence = round2(
      Math.min(1, 0.3 + symbols.length * 0.02 + patterns.length * 0.05),
    )

    const parts: string[] = []
    parts.push(`Found ${symbols.length} symbols`)
    if (patterns.length > 0) parts.push(`${patterns.length} design patterns`)
    if (antiPatterns.length > 0) parts.push(`${antiPatterns.length} anti-patterns`)
    parts.push(`maintainability ${quality.maintainabilityIndex}/100`)

    return {
      symbols,
      patterns,
      antiPatterns,
      dependencies,
      quality,
      summary: parts.join(', '),
      confidence,
      durationMs,
    }
  }

  // ── Symbol Extraction ───────────────────────────────────────────────────────

  extractSymbols(code: string): CodeSymbol[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const symbols: CodeSymbol[] = []
    const lines = code.split('\n')

    const classRe = /(?:export\s+)?(?:abstract\s+)?class\s+([A-Z]\w*)/g
    const funcRe = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g
    const arrowRe = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/g
    const ifaceRe = /(?:export\s+)?interface\s+([A-Z]\w*)/g
    const enumRe = /(?:export\s+)?enum\s+([A-Z]\w*)/g
    const typeRe = /(?:export\s+)?type\s+([A-Z]\w*)\s*=/g
    const varRe = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*[=:]/g
    const methodRe = /^\s+(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:async\s+)?(\w+)\s*\(/gm

    const addSymbols = (re: RegExp, kind: CodeSymbol['kind'], scope: string) => {
      let m: RegExpExecArray | null
      while ((m = re.exec(code)) !== null) {
        const name = m[1]
        if (symbols.length >= this.config.maxSymbols) break
        const refs = countMatches(code, new RegExp(`\\b${name}\\b`, 'g'))
        const lineIdx = code.substring(0, m.index).split('\n').length
        const endLine = Math.min(lineIdx + 30, lines.length)
        const block = lines.slice(lineIdx - 1, endLine).join('\n')
        const cx = this.computeBlockComplexity(block)
        symbols.push({ name, kind, scope, references: Math.max(0, refs - 1), complexity: cx })
      }
    }

    addSymbols(classRe, 'class', 'module')
    addSymbols(funcRe, 'function', 'module')
    addSymbols(arrowRe, 'function', 'module')
    addSymbols(ifaceRe, 'interface', 'module')
    addSymbols(enumRe, 'enum', 'module')
    addSymbols(typeRe, 'type', 'module')
    addSymbols(methodRe, 'method', 'class')

    // Deduplicate arrow functions that might also match varRe
    const seen = new Set(symbols.map(s => s.name))

    let vm: RegExpExecArray | null
    while ((vm = varRe.exec(code)) !== null) {
      const name = vm[1]
      if (seen.has(name) || symbols.length >= this.config.maxSymbols) continue
      seen.add(name)
      const refs = countMatches(code, new RegExp(`\\b${name}\\b`, 'g'))
      symbols.push({ name, kind: 'variable', scope: 'module', references: Math.max(0, refs - 1), complexity: 0 })
    }

    this.stats.totalSymbolsExtracted += symbols.length
    return symbols
  }

  // ── Pattern Detection ───────────────────────────────────────────────────────

  detectPatterns(code: string): DetectedPattern[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const patterns: DetectedPattern[] = []

    // Singleton: private constructor + static instance
    if (/private\s+constructor/i.test(code) && /static\s+\w*[Ii]nstance/i.test(code)) {
      const cls = code.match(/class\s+(\w+)/)?.[1] ?? 'Unknown'
      patterns.push({
        type: 'singleton',
        confidence: 0.9,
        location: cls,
        description: `Singleton pattern detected in ${cls}`,
        involvedSymbols: [cls],
      })
    }

    // Factory: createXxx methods
    const factories = code.match(/(?:create|make|build)\w+\s*\(/g)
    if (factories && factories.length >= 2) {
      const names = factories.map(f => f.replace('(', '').trim())
      patterns.push({
        type: 'factory',
        confidence: 0.8,
        location: 'module',
        description: `Factory pattern with ${names.length} creator methods`,
        involvedSymbols: names,
      })
    }

    // Observer: subscribe/unsubscribe or on/off + emit
    if (
      (/subscribe\s*\(/i.test(code) && /unsubscribe\s*\(/i.test(code)) ||
      (/\bon\s*\(/i.test(code) && /emit\s*\(/i.test(code))
    ) {
      patterns.push({
        type: 'observer',
        confidence: 0.85,
        location: 'module',
        description: 'Observer/event pattern with subscribe/emit mechanism',
        involvedSymbols: ['subscribe', 'emit'],
      })
    }

    // Strategy: interface + multiple implementations
    const ifaces = code.match(/interface\s+(\w*[Ss]trategy\w*)/g)
    if (ifaces && ifaces.length > 0) {
      patterns.push({
        type: 'strategy',
        confidence: 0.75,
        location: 'module',
        description: 'Strategy pattern with strategy interface',
        involvedSymbols: ifaces.map(i => i.replace('interface ', '')),
      })
    }

    // Decorator: wraps another object, calls through
    if (/implements\s+\w+/.test(code) && /this\.\w+\.\w+\(/g.test(code)) {
      const wrapperMatch = code.match(/class\s+(\w*[Dd]ecorator\w*)/)?.[1]
      if (wrapperMatch) {
        patterns.push({
          type: 'decorator',
          confidence: 0.7,
          location: wrapperMatch,
          description: `Decorator pattern in ${wrapperMatch}`,
          involvedSymbols: [wrapperMatch],
        })
      }
    }

    // Builder: method chaining with return this
    const returnThisCount = countMatches(code, /return\s+this\s*[;\n}]/g)
    if (returnThisCount >= 3) {
      const builderCls = code.match(/class\s+(\w*[Bb]uilder\w*)/)?.[1] ?? 'Unknown'
      patterns.push({
        type: 'builder',
        confidence: 0.7,
        location: builderCls,
        description: `Builder pattern with ${returnThisCount} chainable methods`,
        involvedSymbols: [builderCls],
      })
    }

    // Adapter: wraps external interface
    const adapterMatch = code.match(/class\s+(\w*[Aa]dapter\w*)/)
    if (adapterMatch) {
      patterns.push({
        type: 'adapter',
        confidence: 0.7,
        location: adapterMatch[1],
        description: `Adapter pattern in ${adapterMatch[1]}`,
        involvedSymbols: [adapterMatch[1]],
      })
    }

    // Repository: CRUD-like methods
    const crudMethods = ['find', 'get', 'save', 'update', 'delete', 'remove', 'create']
    const foundCrud = crudMethods.filter(m => new RegExp(`\\b${m}\\w*\\s*\\(`, 'i').test(code))
    if (foundCrud.length >= 4) {
      patterns.push({
        type: 'repository',
        confidence: 0.75,
        location: 'module',
        description: `Repository pattern with ${foundCrud.length} CRUD methods`,
        involvedSymbols: foundCrud,
      })
    }

    // Dependency Injection: constructor params with injected services
    const ctorParams = code.match(/constructor\s*\(([^)]{50,})\)/s)
    if (ctorParams) {
      const paramCount = ctorParams[1].split(',').length
      if (paramCount >= 3) {
        patterns.push({
          type: 'dependency_injection',
          confidence: 0.7,
          location: 'constructor',
          description: `Dependency injection with ${paramCount} dependencies`,
          involvedSymbols: ['constructor'],
        })
      }
    }

    // Command: execute/undo methods
    if (/execute\s*\(/i.test(code) && /undo\s*\(/i.test(code)) {
      patterns.push({
        type: 'command',
        confidence: 0.75,
        location: 'module',
        description: 'Command pattern with execute/undo',
        involvedSymbols: ['execute', 'undo'],
      })
    }

    // Iterator: next/hasNext or Symbol.iterator
    if (/Symbol\.iterator/i.test(code) || (/\bnext\s*\(\)/.test(code) && /\bhasNext\s*\(\)/.test(code))) {
      patterns.push({
        type: 'iterator',
        confidence: 0.8,
        location: 'module',
        description: 'Iterator pattern detected',
        involvedSymbols: ['iterator'],
      })
    }

    // Facade: single class delegating to many others
    const delegations = code.match(/this\.\w+\.\w+\(/g)
    if (delegations && delegations.length >= 6) {
      const facadeCls = code.match(/class\s+(\w*[Ff]acade\w*)/)?.[1]
      if (facadeCls) {
        patterns.push({
          type: 'facade',
          confidence: 0.7,
          location: facadeCls,
          description: `Facade pattern delegating ${delegations.length} calls`,
          involvedSymbols: [facadeCls],
        })
      }
    }

    // MVC: separate Model/View/Controller
    const hasModel = /class\s+\w*[Mm]odel/.test(code)
    const hasView = /class\s+\w*[Vv]iew/.test(code)
    const hasController = /class\s+\w*[Cc]ontroller/.test(code)
    if (hasModel && hasView && hasController) {
      patterns.push({
        type: 'mvc',
        confidence: 0.8,
        location: 'module',
        description: 'MVC pattern with Model, View, and Controller classes',
        involvedSymbols: ['Model', 'View', 'Controller'],
      })
    }

    const filtered = patterns.filter(p => p.confidence >= this.config.minConfidence)
    this.stats.totalPatternsDetected += filtered.length
    return filtered
  }

  // ── Anti-Pattern Detection ──────────────────────────────────────────────────

  detectAntiPatterns(code: string): DetectedAntiPattern[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const antiPatterns: DetectedAntiPattern[] = []
    const lines = code.split('\n')

    // God Class: too many methods (>15)
    const methodCount = countMatches(code, /^\s+(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:async\s+)?\w+\s*\(/gm)
    if (methodCount > 15) {
      antiPatterns.push({
        type: 'god_class',
        severity: methodCount > 30 ? 'critical' : 'high',
        confidence: Math.min(0.95, 0.5 + (methodCount - 15) * 0.03),
        location: 'class',
        description: `Class has ${methodCount} methods, suggesting too many responsibilities`,
        suggestion: 'Split into smaller, focused classes with single responsibility',
      })
    }

    // Long Method: functions > 50 lines
    const funcStarts = [...code.matchAll(/(?:function\s+\w+|(?:public|private|protected)\s+(?:static\s+)?(?:async\s+)?\w+)\s*\([^)]*\)\s*(?::\s*\w[^{]*)?\s*\{/g)]
    for (const match of funcStarts) {
      const startLine = code.substring(0, match.index).split('\n').length
      let braceDepth = 0
      let endLine = startLine
      for (let i = startLine - 1; i < lines.length; i++) {
        braceDepth += countMatches(lines[i], /\{/g) - countMatches(lines[i], /\}/g)
        if (braceDepth <= 0 && i > startLine - 1) {
          endLine = i + 1
          break
        }
        if (i === lines.length - 1) endLine = i + 1
      }
      const length = endLine - startLine
      if (length > 50) {
        const name = match[0].match(/\b(\w+)\s*\(/)?.[1] ?? 'unknown'
        antiPatterns.push({
          type: 'long_method',
          severity: length > 100 ? 'high' : 'medium',
          confidence: Math.min(0.95, 0.6 + (length - 50) * 0.005),
          location: `${name} (line ${startLine})`,
          description: `Method '${name}' is ${length} lines long`,
          suggestion: 'Extract sub-methods to improve readability',
        })
      }
    }

    // Dead Code: unused private methods/variables
    const privates = [...code.matchAll(/private\s+(?:static\s+)?(?:readonly\s+)?(\w+)/g)]
    for (const pm of privates) {
      const name = pm[1]
      const refs = countMatches(code, new RegExp(`\\b${name}\\b`, 'g'))
      if (refs <= 1) {
        antiPatterns.push({
          type: 'dead_code',
          severity: 'low',
          confidence: 0.7,
          location: name,
          description: `Private member '${name}' appears unused`,
          suggestion: `Remove unused member '${name}'`,
        })
      }
    }

    // Data Clump: same parameter groups repeated
    const paramLists = [...code.matchAll(/\(([^)]{20,})\)/g)]
      .map(m => m[1].split(',').map(p => p.trim().split(/[:\s]/)[0].trim()).filter(Boolean).sort().join(','))
    const paramFreq = new Map<string, number>()
    for (const pl of paramLists) {
      paramFreq.set(pl, (paramFreq.get(pl) ?? 0) + 1)
    }
    for (const [params, count] of paramFreq) {
      if (count >= 3 && params.split(',').length >= 3) {
        antiPatterns.push({
          type: 'data_clump',
          severity: 'medium',
          confidence: 0.65,
          location: 'multiple methods',
          description: `Parameter group (${params}) repeated ${count} times`,
          suggestion: 'Extract a parameter object or data class',
        })
      }
    }

    // Primitive Obsession: many primitive params
    const longPrimParams = [...code.matchAll(/\(([^)]*)\)/g)]
      .filter(m => {
        const params = m[1].split(',')
        const primitives = params.filter(p => /:\s*(string|number|boolean)\b/.test(p))
        return params.length >= 5 && primitives.length >= 4
      })
    if (longPrimParams.length > 0) {
      antiPatterns.push({
        type: 'primitive_obsession',
        severity: 'medium',
        confidence: 0.6,
        location: 'function parameters',
        description: `${longPrimParams.length} functions with many primitive parameters`,
        suggestion: 'Create typed objects or interfaces for parameter groups',
      })
    }

    // Message Chain: long chains like a.b.c.d.e
    const chains = code.match(/\w+(?:\.\w+){4,}/g)
    if (chains && chains.length > 0) {
      antiPatterns.push({
        type: 'message_chain',
        severity: 'low',
        confidence: 0.6,
        location: 'expressions',
        description: `${chains.length} long method/property chains detected`,
        suggestion: 'Introduce intermediate variables or use Law of Demeter',
      })
    }

    // Feature Envy: method accesses external objects heavily
    const externalAccess = code.match(/(?:this\.\w+)\.\w+\.\w+/g)
    if (externalAccess && externalAccess.length > 8) {
      antiPatterns.push({
        type: 'feature_envy',
        severity: 'medium',
        confidence: 0.55,
        location: 'class',
        description: `Heavy external object access (${externalAccess.length} deep accesses)`,
        suggestion: 'Move logic closer to the data it uses',
      })
    }

    // Lazy Class: very small class < 5 lines of logic
    const classBlocks = [...code.matchAll(/class\s+(\w+)[^{]*\{/g)]
    for (const cb of classBlocks) {
      const startIdx = cb.index! + cb[0].length
      let depth = 1
      let i = startIdx
      while (i < code.length && depth > 0) {
        if (code[i] === '{') depth++
        if (code[i] === '}') depth--
        i++
      }
      const body = code.substring(startIdx, i - 1)
      const bodyLines = body.split('\n').filter(l => l.trim().length > 0).length
      if (bodyLines < 5 && bodyLines > 0) {
        antiPatterns.push({
          type: 'lazy_class',
          severity: 'low',
          confidence: 0.5,
          location: cb[1],
          description: `Class '${cb[1]}' has only ${bodyLines} lines of code`,
          suggestion: 'Consider merging into parent or using a plain object',
        })
      }
    }

    const filtered = antiPatterns.filter(a => a.confidence >= this.config.minConfidence)
    this.stats.totalAntiPatternsDetected += filtered.length
    return filtered
  }

  // ── Dependency Analysis ─────────────────────────────────────────────────────

  analyzeDependencies(code: string): DependencyEdge[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const edges: DependencyEdge[] = []

    // Import dependencies
    const imports = [...code.matchAll(/import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g)]
    for (const imp of imports) {
      const target = imp[1].replace(/^\.\//, '').replace(/\.js$/, '')
      edges.push({ source: 'module', target, type: 'import', strength: 1.0 })
    }

    // Extends relationships
    const exts = [...code.matchAll(/class\s+(\w+)\s+extends\s+(\w+)/g)]
    for (const ext of exts) {
      edges.push({ source: ext[1], target: ext[2], type: 'extend', strength: 0.9 })
    }

    // Implements relationships
    const impls = [...code.matchAll(/class\s+(\w+)[^{]*implements\s+([\w,\s]+)/g)]
    for (const impl of impls) {
      const interfaces = impl[2].split(',').map(i => i.trim())
      for (const iface of interfaces) {
        if (iface) edges.push({ source: impl[1], target: iface, type: 'implement', strength: 0.8 })
      }
    }

    // Call relationships (new Xxx)
    const news = [...code.matchAll(/new\s+([A-Z]\w+)\s*\(/g)]
    for (const n of news) {
      edges.push({ source: 'module', target: n[1], type: 'compose', strength: 0.7 })
    }

    // Type usage
    const typeUsages = [...code.matchAll(/:\s*([A-Z]\w+)(?:\s*[<\[|,;)\n])/g)]
    const seenTypes = new Set<string>()
    for (const tu of typeUsages) {
      const name = tu[1]
      if (!seenTypes.has(name) && !['Map', 'Set', 'Array', 'Promise', 'Record', 'Partial', 'Readonly', 'ReadonlyArray', 'RegExp', 'Date', 'Error', 'Function', 'Object', 'String', 'Number', 'Boolean'].includes(name)) {
        seenTypes.add(name)
        edges.push({ source: 'module', target: name, type: 'use', strength: 0.5 })
      }
    }

    this.stats.totalDependenciesFound += edges.length
    return edges
  }

  // ── Quality Metrics ─────────────────────────────────────────────────────────

  measureQuality(code: string): QualityMetrics {
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalQualityAssessments++

    const lines = code.split('\n')
    const totalLines = lines.length
    const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//')).length

    // Cyclomatic complexity
    const cyclomaticComplexity = 1
      + countMatches(code, /\bif\b/g)
      + countMatches(code, /\belse\s+if\b/g)
      + countMatches(code, /\bfor\b/g)
      + countMatches(code, /\bwhile\b/g)
      + countMatches(code, /\bcase\b/g)
      + countMatches(code, /\bcatch\b/g)
      + countMatches(code, /&&/g)
      + countMatches(code, /\|\|/g)
      + countMatches(code, /\?\?/g)
      + countMatches(code, /\?(?!\?)/g)

    // Cognitive complexity (nesting-aware)
    let cognitiveComplexity = 0
    let nestingLevel = 0
    for (const line of lines) {
      const trimmed = line.trim()
      if (/^(if|for|while|switch)\b/.test(trimmed)) {
        cognitiveComplexity += 1 + nestingLevel
      }
      if (/\belse\b/.test(trimmed)) cognitiveComplexity++
      nestingLevel += countMatches(line, /\{/g) - countMatches(line, /\}/g)
      if (nestingLevel < 0) nestingLevel = 0
    }

    // Documentation coverage
    const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('*') || l.trim().startsWith('/*')).length
    const documentationCoverage = round2(Math.min(1, commentLines / Math.max(1, codeLines) * 2))

    // Coupling: unique external references
    const externalRefs = new Set(
      [...code.matchAll(/import\s+.*from\s+['"]([^'"]+)['"]/g)].map(m => m[1]),
    )
    const couplingScore = round2(Math.min(1, externalRefs.size / 20))

    // Cohesion: ratio of internal references vs total
    const thisRefs = countMatches(code, /this\.\w+/g)
    const totalRefs = countMatches(code, /\b\w+\.\w+/g)
    const cohesionScore = round2(totalRefs > 0 ? Math.min(1, thisRefs / totalRefs) : 0.5)

    // Maintainability Index (simplified MI formula)
    const halsteadVolume = Math.max(1, codeLines * Math.log2(Math.max(2, tokenize(code).length)))
    const mi = Math.max(0, Math.min(100,
      171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(Math.max(1, codeLines)),
    ))
    const maintainabilityIndex = round2(mi)

    // Readability
    const avgLineLength = lines.reduce((s, l) => s + l.length, 0) / Math.max(1, totalLines)
    const longLines = lines.filter(l => l.length > 120).length
    const readabilityScore = round2(Math.max(0, Math.min(100,
      100 - (avgLineLength - 40) * 0.5 - longLines * 2 - cyclomaticComplexity * 0.5,
    )))

    // Testability
    const publicMethods = countMatches(code, /(?:public\s+|export\s+)(?:async\s+)?(?:function\s+)?\w+\s*\(/g)
    const privateMethods = countMatches(code, /private\s+/g)
    const testabilityScore = round2(Math.max(0, Math.min(100,
      80 + publicMethods * 2 - privateMethods - cyclomaticComplexity * 1.5 - nestingLevel * 3,
    )))

    // Duplicate ratio (simple n-gram check)
    const duplicateRatio = this.computeDuplicateRatio(lines)

    return {
      maintainabilityIndex,
      cyclomaticComplexity,
      cognitiveComplexity,
      couplingScore,
      cohesionScore,
      documentationCoverage,
      testabilityScore,
      readabilityScore,
      duplicateRatio,
    }
  }

  // ── Code Similarity ─────────────────────────────────────────────────────────

  computeSimilarity(code1: string, code2: string): number {
    const tokens1 = tokenize(code1)
    const tokens2 = tokenize(code2)
    if (tokens1.length === 0 && tokens2.length === 0) return 1
    if (tokens1.length === 0 || tokens2.length === 0) return 0

    // Build TF vectors
    const vocab = new Set([...tokens1, ...tokens2])
    const tf1 = new Map<string, number>()
    const tf2 = new Map<string, number>()
    for (const t of tokens1) tf1.set(t, (tf1.get(t) ?? 0) + 1)
    for (const t of tokens2) tf2.set(t, (tf2.get(t) ?? 0) + 1)

    // Cosine similarity
    let dot = 0
    let mag1 = 0
    let mag2 = 0
    for (const w of vocab) {
      const a = tf1.get(w) ?? 0
      const b = tf2.get(w) ?? 0
      dot += a * b
      mag1 += a * a
      mag2 += b * b
    }
    if (mag1 === 0 || mag2 === 0) return 0
    return round2(dot / (Math.sqrt(mag1) * Math.sqrt(mag2)))
  }

  // ── Improvement Suggestions ─────────────────────────────────────────────────

  suggestImprovements(code: string): string[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const suggestions: string[] = []
    const quality = this.measureQuality(code)
    const antiPatterns = this.detectAntiPatterns(code)

    if (quality.cyclomaticComplexity > this.config.complexityThreshold) {
      suggestions.push(`Reduce cyclomatic complexity (${quality.cyclomaticComplexity}) by extracting helper functions`)
    }
    if (quality.maintainabilityIndex < 40) {
      suggestions.push(`Improve maintainability index (${quality.maintainabilityIndex}/100) — reduce method size and complexity`)
    }
    if (quality.documentationCoverage < 0.2) {
      suggestions.push('Add documentation comments — current coverage is below 20%')
    }
    if (quality.duplicateRatio > 0.15) {
      suggestions.push(`Reduce code duplication (${round2(quality.duplicateRatio * 100)}%) — extract shared logic`)
    }
    if (quality.readabilityScore < 50) {
      suggestions.push('Improve readability — shorten long lines and reduce nesting')
    }
    if (quality.couplingScore > 0.7) {
      suggestions.push('Reduce coupling — consider dependency injection or facade pattern')
    }
    if (quality.testabilityScore < 50) {
      suggestions.push('Improve testability — expose public APIs and reduce private state')
    }

    for (const ap of antiPatterns) {
      suggestions.push(`${ap.type}: ${ap.suggestion}`)
    }

    return suggestions
  }

  // ── Accessors ───────────────────────────────────────────────────────────────

  getStats(): Readonly<SemanticCodeAnalyzerStats> { return { ...this.stats } }
  getConfig(): Readonly<SemanticCodeAnalyzerConfig> { return { ...this.config } }

  // ── Persistence ─────────────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      config: this.config,
      stats: this.stats,
    })
  }

  static deserialize(json: string): SemanticCodeAnalyzer {
    const data = JSON.parse(json) as { config: SemanticCodeAnalyzerConfig; stats: SemanticCodeAnalyzerStats }
    const instance = new SemanticCodeAnalyzer(data.config)
    Object.assign(instance.stats, data.stats)
    return instance
  }

  // ── Private Helpers ─────────────────────────────────────────────────────────

  private computeBlockComplexity(block: string): number {
    return (
      countMatches(block, /\bif\b/g) +
      countMatches(block, /\bfor\b/g) +
      countMatches(block, /\bwhile\b/g) +
      countMatches(block, /\bcase\b/g) +
      countMatches(block, /&&/g) +
      countMatches(block, /\|\|/g)
    )
  }

  private computeDuplicateRatio(lines: string[]): number {
    const normalized = lines.map(l => l.trim()).filter(l => l.length > 10)
    if (normalized.length < 5) return 0
    const seen = new Map<string, number>()
    const windowSize = 3
    let duplicateWindows = 0
    let totalWindows = 0
    for (let i = 0; i <= normalized.length - windowSize; i++) {
      const window = normalized.slice(i, i + windowSize).join('\n')
      const count = (seen.get(window) ?? 0) + 1
      seen.set(window, count)
      totalWindows++
      if (count > 1) duplicateWindows++
    }
    return totalWindows > 0 ? round2(duplicateWindows / totalWindows) : 0
  }

  private emptyQuality(): QualityMetrics {
    return {
      maintainabilityIndex: 0,
      cyclomaticComplexity: 0,
      cognitiveComplexity: 0,
      couplingScore: 0,
      cohesionScore: 0,
      documentationCoverage: 0,
      testabilityScore: 0,
      readabilityScore: 0,
      duplicateRatio: 0,
    }
  }
}
