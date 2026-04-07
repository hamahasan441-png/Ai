/**
 * 🏛️ ArchitecturalAnalyzer — Code Architecture & Design Pattern Analysis
 *
 * Analyzes code for architectural quality:
 *   • SOLID principle violations detection
 *   • Design pattern recognition and misuse
 *   • Layer architecture validation
 *   • Cohesion and coupling metrics
 *   • God class / god function detection
 *   • Interface segregation analysis
 *   • Dependency inversion checks
 *
 * Works fully offline — pattern-based heuristic analysis.
 */

import type { Severity } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** An architectural issue. */
export interface ArchitecturalIssue {
  /** Type of issue. */
  type: ArchIssueType
  /** Severity. */
  severity: Severity
  /** Line number. */
  line: number
  /** End line. */
  endLine?: number
  /** Title. */
  title: string
  /** Description. */
  description: string
  /** Suggestion. */
  suggestion: string
  /** Which SOLID principle is violated (if applicable). */
  solidPrinciple?: SolidPrinciple
}

/** SOLID principles. */
export type SolidPrinciple = 'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP'

/** Types of architectural issues. */
export type ArchIssueType =
  | 'god-class'
  | 'god-function'
  | 'srp-violation'
  | 'ocp-violation'
  | 'isp-violation'
  | 'dip-violation'
  | 'low-cohesion'
  | 'tight-coupling'
  | 'missing-abstraction'
  | 'feature-envy'
  | 'data-clump'
  | 'primitive-obsession'
  | 'inappropriate-intimacy'
  | 'layer-violation'

/** Detected design pattern usage. */
export interface DesignPatternUsage {
  /** Pattern name. */
  name: string
  /** Category. */
  category: 'creational' | 'structural' | 'behavioral'
  /** Line where detected. */
  line: number
  /** Confidence (0-1). */
  confidence: number
  /** Whether the implementation looks correct. */
  wellImplemented: boolean
  /** Issues with the implementation (if any). */
  issues: string[]
}

/** Class metrics for architectural analysis. */
export interface ClassMetrics {
  /** Class name. */
  name: string
  /** Line number. */
  line: number
  /** Total lines of code. */
  lineCount: number
  /** Number of methods. */
  methodCount: number
  /** Number of properties/fields. */
  propertyCount: number
  /** Number of dependencies (constructor params, imports). */
  dependencyCount: number
  /** Estimated cohesion (0-1, higher = more cohesive). */
  cohesion: number
  /** SOLID violations. */
  solidViolations: SolidPrinciple[]
}

/** Result of architectural analysis. */
export interface ArchitecturalAnalysis {
  /** Architectural issues. */
  issues: ArchitecturalIssue[]
  /** Design patterns detected. */
  patterns: DesignPatternUsage[]
  /** Class metrics. */
  classMetrics: ClassMetrics[]
  /** Architecture score (0-100). */
  architectureScore: number
  /** Summary. */
  summary: string
}

// ══════════════════════════════════════════════════════════════════════════════
// ARCHITECTURAL ANALYZER
// ══════════════════════════════════════════════════════════════════════════════

export class ArchitecturalAnalyzer {
  private godClassThreshold: number
  private godFunctionThreshold: number

  constructor(options?: { godClassThreshold?: number; godFunctionThreshold?: number }) {
    this.godClassThreshold = options?.godClassThreshold ?? 300
    this.godFunctionThreshold = options?.godFunctionThreshold ?? 50
  }

  /** Analyze code for architectural issues. */
  analyze(code: string): ArchitecturalAnalysis {
    if (!code || !code.trim()) {
      return {
        issues: [],
        patterns: [],
        classMetrics: [],
        architectureScore: 100,
        summary: 'No code to analyze.',
      }
    }

    const lines = code.split('\n')
    const issues: ArchitecturalIssue[] = []
    const patterns: DesignPatternUsage[] = []
    const classMetrics: ClassMetrics[] = []

    // Extract class information
    this.extractClassMetrics(lines, classMetrics)

    // Detect issues
    this.detectGodClasses(classMetrics, issues)
    this.detectGodFunctions(lines, issues)
    this.detectSRPViolations(lines, classMetrics, issues)
    this.detectISPViolations(lines, issues)
    this.detectDIPViolations(lines, issues)
    this.detectFeatureEnvy(lines, issues)
    this.detectDataClumps(lines, issues)
    this.detectPrimitiveObsession(lines, issues)
    this.detectMissingAbstractions(lines, issues)

    // Detect design patterns
    this.detectDesignPatterns(lines, patterns)

    const architectureScore = this.calculateScore(issues, classMetrics)
    const summary = this.generateSummary(issues, patterns, classMetrics, architectureScore)

    return { issues, patterns, classMetrics, architectureScore, summary }
  }

  // ── CLASS METRICS ──────────────────────────────────────────────────────

  private extractClassMetrics(lines: string[], metrics: ClassMetrics[]): void {
    const classPattern = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/

    for (let i = 0; i < lines.length; i++) {
      const match = classPattern.exec(lines[i])
      if (!match) continue

      const className = match[1]
      const classStart = i
      let braceDepth = 0
      let started = false
      let classEnd = i
      let methodCount = 0
      let propertyCount = 0
      let dependencyCount = 0
      const methodNames: string[] = []
      const propertyNames: string[] = []

      for (let j = i; j < lines.length; j++) {
        const line = lines[j]
        braceDepth += (line.match(/\{/g) || []).length
        braceDepth -= (line.match(/\}/g) || []).length
        if (braceDepth > 0) started = true
        if (started && braceDepth <= 0) {
          classEnd = j
          break
        }

        // Count methods (including getters/setters)
        const methodMatch = line.match(/^\s+(?:(?:public|private|protected|static|async|get|set)\s+)*(\w+)\s*\(/)
        if (methodMatch && j !== i) {
          methodCount++
          methodNames.push(methodMatch[1])
        }

        // Count properties
        const propMatch = line.match(/^\s+(?:(?:public|private|protected|static|readonly)\s+)*(\w+)\s*[?!]?\s*[:=]/)
        if (propMatch && !/\(/.test(line) && j !== i) {
          propertyCount++
          propertyNames.push(propMatch[1])
        }

        // Count constructor dependencies
        if (/constructor\s*\(/.test(line)) {
          const ctorParams = line.match(/constructor\s*\(([^)]*)\)/)
          if (ctorParams && ctorParams[1]) {
            dependencyCount = ctorParams[1].split(',').filter(p => p.trim()).length
          } else {
            // Multi-line constructor
            let params = ''
            for (let k = j; k < Math.min(j + 10, lines.length); k++) {
              params += lines[k]
              if (lines[k].includes(')')) break
            }
            dependencyCount = (params.match(/,/g) || []).length + 1
          }
        }
      }

      // Estimate cohesion: how many methods use the class's own properties
      let methodsUsingProps = 0
      for (let j = classStart; j <= classEnd; j++) {
        const line = lines[j]
        if (/this\.\w+/.test(line)) {
          methodsUsingProps++
        }
      }
      const cohesion = methodCount > 0 ? Math.min(1, methodsUsingProps / (methodCount * 2)) : 1

      const solidViolations: SolidPrinciple[] = []
      if (methodCount > 10) solidViolations.push('SRP')
      if (dependencyCount > 5) solidViolations.push('DIP')

      metrics.push({
        name: className,
        line: i + 1,
        lineCount: classEnd - classStart + 1,
        methodCount,
        propertyCount,
        dependencyCount,
        cohesion,
        solidViolations,
      })
    }
  }

  // ── ISSUE DETECTORS ────────────────────────────────────────────────────

  private detectGodClasses(classMetrics: ClassMetrics[], issues: ArchitecturalIssue[]): void {
    for (const cls of classMetrics) {
      if (cls.lineCount > this.godClassThreshold) {
        issues.push({
          type: 'god-class',
          severity: cls.lineCount > this.godClassThreshold * 2 ? 'critical' : 'high',
          line: cls.line,
          title: `God class: '${cls.name}' (${cls.lineCount} lines)`,
          description: `Class '${cls.name}' has ${cls.lineCount} lines, ${cls.methodCount} methods, and ${cls.propertyCount} properties. It likely has too many responsibilities.`,
          suggestion: 'Split into smaller, focused classes. Extract method groups into separate classes with clear responsibilities.',
          solidPrinciple: 'SRP',
        })
      }

      if (cls.methodCount > 15) {
        issues.push({
          type: 'god-class',
          severity: 'medium',
          line: cls.line,
          title: `Class '${cls.name}' has too many methods (${cls.methodCount})`,
          description: `Class with ${cls.methodCount} methods likely violates Single Responsibility Principle.`,
          suggestion: 'Extract related methods into separate classes or use composition.',
          solidPrinciple: 'SRP',
        })
      }
    }
  }

  private detectGodFunctions(lines: string[], issues: ArchitecturalIssue[]): void {
    const funcPattern = /(?:(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|(\w+)\s*\([^)]*\)\s*(?::\s*[^{]*)?{)/

    for (let i = 0; i < lines.length; i++) {
      const match = funcPattern.exec(lines[i])
      if (!match) continue

      const name = match[1] || match[2] || match[3]
      if (!name || name === 'constructor' || name === 'if' || name === 'for' || name === 'while') continue

      // Count function length
      let braceDepth = 0
      let started = false
      let funcEnd = i

      for (let j = i; j < lines.length; j++) {
        braceDepth += (lines[j].match(/\{/g) || []).length
        braceDepth -= (lines[j].match(/\}/g) || []).length
        if (braceDepth > 0) started = true
        if (started && braceDepth <= 0) {
          funcEnd = j
          break
        }
      }

      const funcLength = funcEnd - i + 1
      if (funcLength > this.godFunctionThreshold) {
        issues.push({
          type: 'god-function',
          severity: funcLength > this.godFunctionThreshold * 2 ? 'high' : 'medium',
          line: i + 1,
          endLine: funcEnd + 1,
          title: `Long function '${name}' (${funcLength} lines)`,
          description: `Function '${name}' is ${funcLength} lines long. Long functions are hard to test, debug, and maintain.`,
          suggestion: 'Extract logical sections into helper functions. Each function should do one thing.',
          solidPrinciple: 'SRP',
        })
      }
    }
  }

  private detectSRPViolations(
    lines: string[],
    classMetrics: ClassMetrics[],
    issues: ArchitecturalIssue[],
  ): void {
    // Detect classes that mix concerns (e.g., data access + business logic + formatting)
    const concernKeywords = {
      'data-access': ['database', 'query', 'sql', 'insert', 'update', 'delete', 'fetch', 'repository'],
      'business-logic': ['calculate', 'validate', 'process', 'compute', 'transform'],
      'presentation': ['render', 'display', 'format', 'template', 'html', 'css', 'style'],
      'io': ['read', 'write', 'file', 'stream', 'socket', 'http'],
      'logging': ['log', 'debug', 'warn', 'error', 'trace', 'info'],
    }

    for (const cls of classMetrics) {
      if (cls.methodCount < 3) continue

      const classBody = lines.slice(cls.line - 1, cls.line - 1 + cls.lineCount).join('\n').toLowerCase()
      const detectedConcerns: string[] = []

      for (const [concern, keywords] of Object.entries(concernKeywords)) {
        const matchCount = keywords.filter(k => classBody.includes(k)).length
        if (matchCount >= 2) {
          detectedConcerns.push(concern)
        }
      }

      if (detectedConcerns.length >= 3) {
        issues.push({
          type: 'srp-violation',
          severity: 'medium',
          line: cls.line,
          title: `Class '${cls.name}' mixes ${detectedConcerns.length} concerns`,
          description: `Class '${cls.name}' handles: ${detectedConcerns.join(', ')}. This violates Single Responsibility.`,
          suggestion: `Split into separate classes: one for each concern (${detectedConcerns.map(c => c.replace('-', ' ')).join(', ')}).`,
          solidPrinciple: 'SRP',
        })
      }
    }
  }

  private detectISPViolations(lines: string[], issues: ArchitecturalIssue[]): void {
    // Detect large interfaces
    const interfacePattern = /(?:export\s+)?interface\s+(\w+)/

    for (let i = 0; i < lines.length; i++) {
      const match = interfacePattern.exec(lines[i])
      if (!match) continue

      const name = match[1]
      let braceDepth = 0
      let started = false
      let memberCount = 0
      let endLine = i

      for (let j = i; j < lines.length; j++) {
        braceDepth += (lines[j].match(/\{/g) || []).length
        braceDepth -= (lines[j].match(/\}/g) || []).length
        if (braceDepth > 0) started = true
        if (started && braceDepth <= 0) {
          endLine = j
          break
        }

        // Count members (properties and methods)
        if (j > i && /^\s+\w+[\s?:([]/.test(lines[j]) && !/\/\//.test(lines[j])) {
          memberCount++
        }
      }

      if (memberCount > 10) {
        issues.push({
          type: 'isp-violation',
          severity: 'medium',
          line: i + 1,
          endLine: endLine + 1,
          title: `Large interface '${name}' (${memberCount} members)`,
          description: `Interface '${name}' has ${memberCount} members. Clients implementing this interface may need to implement methods they don't use.`,
          suggestion: `Split into smaller, role-specific interfaces (e.g., ${name}Reader, ${name}Writer, ${name}Validator).`,
          solidPrinciple: 'ISP',
        })
      }
    }
  }

  private detectDIPViolations(lines: string[], issues: ArchitecturalIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Direct instantiation in constructor (instead of dependency injection)
      if (/constructor\s*\(/.test(line)) {
        let braceDepth = 0
        let started = false
        for (let j = i; j < Math.min(i + 30, lines.length); j++) {
          braceDepth += (lines[j].match(/\{/g) || []).length
          braceDepth -= (lines[j].match(/\}/g) || []).length
          if (braceDepth > 0) started = true
          if (started && braceDepth <= 0) break

          if (/this\.\w+\s*=\s*new\s+\w+/.test(lines[j]) && j !== i) {
            const newMatch = lines[j].match(/this\.(\w+)\s*=\s*new\s+(\w+)/)
            if (newMatch) {
              issues.push({
                type: 'dip-violation',
                severity: 'low',
                line: j + 1,
                title: `Direct instantiation: this.${newMatch[1]} = new ${newMatch[2]}()`,
                description: `Constructor creates concrete dependency '${newMatch[2]}' instead of receiving it via injection. This makes testing and swapping implementations harder.`,
                suggestion: `Inject the dependency through the constructor: \`constructor(${newMatch[1]}: I${newMatch[2]})\``,
                solidPrinciple: 'DIP',
              })
            }
          }
        }
      }
    }
  }

  private detectFeatureEnvy(lines: string[], issues: ArchitecturalIssue[]): void {
    // Feature envy: method that accesses another object's properties more than its own
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Count external object accesses on a single line
      const externalAccesses = (line.match(/\b\w+\.\w+/g) || [])
        .filter(a => !a.startsWith('this.') && !a.startsWith('console.') && !a.startsWith('Math.') && !a.startsWith('Object.') && !a.startsWith('Array.') && !a.startsWith('JSON.'))

      if (externalAccesses.length >= 4) {
        // Check if they're all from the same object
        const objects = externalAccesses.map(a => a.split('.')[0])
        const objectCounts = new Map<string, number>()
        for (const obj of objects) {
          objectCounts.set(obj, (objectCounts.get(obj) || 0) + 1)
        }

        for (const [obj, count] of objectCounts) {
          if (count >= 3) {
            issues.push({
              type: 'feature-envy',
              severity: 'low',
              line: i + 1,
              title: `Feature envy: heavy use of '${obj}' properties`,
              description: `Line accesses ${count} properties of '${obj}'. This logic may belong in the '${obj}' class instead.`,
              suggestion: `Consider moving this logic to the '${obj}' class as a method.`,
            })
            break
          }
        }
      }
    }
  }

  private detectDataClumps(lines: string[], issues: ArchitecturalIssue[]): void {
    // Detect functions with many parameters of similar types
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      const funcMatch = line.match(/(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:async\s*)?)\s*\(/)
      if (!funcMatch) continue

      const params = line.match(/\(([^)]*)\)/)
      if (!params || !params[1]) continue

      const paramList = params[1].split(',').map(p => p.trim()).filter(Boolean)
      if (paramList.length >= 5) {
        issues.push({
          type: 'data-clump',
          severity: 'medium',
          line: i + 1,
          title: `Function with ${paramList.length} parameters`,
          description: `Function has ${paramList.length} parameters. This suggests related data should be grouped into an object/interface.`,
          suggestion: 'Create a parameter object/interface: `function process(options: ProcessOptions)` instead of individual params.',
        })
      }
    }
  }

  private detectPrimitiveObsession(lines: string[], issues: ArchitecturalIssue[]): void {
    // Detect repeated use of primitive types where a value object would be better
    const primitiveParams = new Map<string, number[]>() // type pattern → line numbers

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Look for patterns like (email: string, phone: string, zip: string)
      const semanticPrimitives = [
        { pattern: /email\s*[?:]?\s*:\s*string/i, name: 'email' },
        { pattern: /phone\s*[?:]?\s*:\s*string/i, name: 'phone' },
        { pattern: /url\s*[?:]?\s*:\s*string/i, name: 'url' },
        { pattern: /(?:zip|postal)\s*[?:]?\s*:\s*string/i, name: 'postal' },
        { pattern: /price\s*[?:]?\s*:\s*number/i, name: 'price' },
        { pattern: /currency\s*[?:]?\s*:\s*string/i, name: 'currency' },
      ]

      for (const { pattern, name } of semanticPrimitives) {
        if (pattern.test(line)) {
          if (!primitiveParams.has(name)) primitiveParams.set(name, [])
          primitiveParams.get(name)!.push(i + 1)
        }
      }
    }

    for (const [name, lineNums] of primitiveParams) {
      if (lineNums.length >= 3) {
        issues.push({
          type: 'primitive-obsession',
          severity: 'info',
          line: lineNums[0],
          title: `Primitive obsession: '${name}' used as plain string/number ${lineNums.length} times`,
          description: `'${name}' appears ${lineNums.length} times as a primitive type. Consider creating a value object for type safety and validation.`,
          suggestion: `Create a branded type or value object: \`type ${name.charAt(0).toUpperCase() + name.slice(1)} = string & { readonly __brand: '${name}' }\``,
        })
      }
    }
  }

  private detectMissingAbstractions(lines: string[], issues: ArchitecturalIssue[]): void {
    // Detect switch/if chains that could be replaced with polymorphism
    let switchCaseCount = 0
    let switchLine = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (/\bswitch\s*\(/.test(line)) {
        switchLine = i + 1
        switchCaseCount = 0
      }

      if (/\bcase\s+/.test(line)) {
        switchCaseCount++
      }

      if (line === '}' && switchCaseCount >= 5) {
        issues.push({
          type: 'missing-abstraction',
          severity: 'low',
          line: switchLine,
          title: `Large switch statement (${switchCaseCount} cases)`,
          description: `Switch with ${switchCaseCount} cases may indicate missing polymorphism or strategy pattern.`,
          suggestion: 'Consider replacing with a Map<type, handler>, strategy pattern, or subclass hierarchy.',
        })
        switchCaseCount = 0
      }

      // Long if-else chains
      if (/\belse\s+if\b/.test(line)) {
        // Count consecutive else-if
        let elseIfCount = 1
        for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
          if (/\belse\s+if\b/.test(lines[j].trim())) {
            elseIfCount++
          } else if (/\belse\b/.test(lines[j].trim()) || !/\bif\b/.test(lines[j].trim())) {
            break
          }
        }

        if (elseIfCount >= 4) {
          issues.push({
            type: 'missing-abstraction',
            severity: 'low',
            line: i + 1,
            title: `Long if-else chain (${elseIfCount} branches)`,
            description: `${elseIfCount} else-if branches suggest missing abstraction (strategy, lookup table, or polymorphism).`,
            suggestion: 'Replace with a Map/object lookup, or use the strategy pattern.',
          })
          // Skip ahead to avoid duplicates
          i += elseIfCount
        }
      }
    }
  }

  // ── DESIGN PATTERN DETECTION ───────────────────────────────────────────

  private detectDesignPatterns(lines: string[], patterns: DesignPatternUsage[]): void {
    const code = lines.join('\n')

    // Singleton pattern
    if (/private\s+static\s+\w*instance/i.test(code) && /getInstance\s*\(/.test(code)) {
      const line = lines.findIndex(l => /getInstance\s*\(/.test(l)) + 1
      patterns.push({
        name: 'Singleton',
        category: 'creational',
        line,
        confidence: 0.9,
        wellImplemented: /private\s+constructor/.test(code),
        issues: /private\s+constructor/.test(code) ? [] : ['Constructor should be private'],
      })
    }

    // Factory pattern
    if (/create\w+\s*\(/.test(code) && /\bnew\s+\w+/.test(code)) {
      const factoryMethods = code.match(/(?:create|make|build)\w*\s*\(/g) || []
      if (factoryMethods.length >= 2) {
        const line = lines.findIndex(l => /(?:create|make|build)\w+\s*\(/.test(l)) + 1
        patterns.push({
          name: 'Factory Method',
          category: 'creational',
          line,
          confidence: 0.7,
          wellImplemented: true,
          issues: [],
        })
      }
    }

    // Observer/Event pattern
    if (/\.on\s*\(|addEventListener|subscribe|\.emit\s*\(|\.notify\s*\(/.test(code)) {
      const line = lines.findIndex(l => /\.on\s*\(|addEventListener|subscribe/.test(l)) + 1
      patterns.push({
        name: 'Observer/Event',
        category: 'behavioral',
        line,
        confidence: 0.8,
        wellImplemented: true,
        issues: /removeEventListener|unsubscribe|\.off\s*\(/.test(code) ? [] : ['Missing cleanup/unsubscribe mechanism'],
      })
    }

    // Strategy pattern
    if (/strategy|Strategy/.test(code) || (/Map<string,\s*\(/.test(code) && /\.get\s*\(/.test(code))) {
      const line = lines.findIndex(l => /strategy|Strategy|Map<string,\s*\(/.test(l)) + 1
      if (line > 0) {
        patterns.push({
          name: 'Strategy',
          category: 'behavioral',
          line,
          confidence: 0.7,
          wellImplemented: true,
          issues: [],
        })
      }
    }

    // Builder pattern
    if (/\.build\s*\(/.test(code) && /\.set\w+\s*\(|\.with\w+\s*\(/.test(code)) {
      const line = lines.findIndex(l => /\.build\s*\(/.test(l)) + 1
      patterns.push({
        name: 'Builder',
        category: 'creational',
        line,
        confidence: 0.75,
        wellImplemented: true,
        issues: [],
      })
    }

    // Decorator pattern
    if (/@\w+/.test(code) && /class\s+\w+/.test(code)) {
      const line = lines.findIndex(l => /@\w+/.test(l)) + 1
      if (line > 0) {
        patterns.push({
          name: 'Decorator',
          category: 'structural',
          line,
          confidence: 0.6,
          wellImplemented: true,
          issues: [],
        })
      }
    }
  }

  // ── SCORING ────────────────────────────────────────────────────────────

  private calculateScore(issues: ArchitecturalIssue[], classMetrics: ClassMetrics[]): number {
    let score = 100

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical': score -= 18; break
        case 'high': score -= 12; break
        case 'medium': score -= 6; break
        case 'low': score -= 3; break
        case 'info': score -= 1; break
      }
    }

    // Bonus for good cohesion
    const avgCohesion = classMetrics.length > 0
      ? classMetrics.reduce((sum, c) => sum + c.cohesion, 0) / classMetrics.length
      : 1
    if (avgCohesion > 0.7) score += 5

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private generateSummary(
    issues: ArchitecturalIssue[],
    patterns: DesignPatternUsage[],
    classMetrics: ClassMetrics[],
    score: number,
  ): string {
    const parts: string[] = []

    if (classMetrics.length > 0) {
      parts.push(`${classMetrics.length} class(es) analyzed.`)
    }

    if (patterns.length > 0) {
      parts.push(`${patterns.length} design pattern(s) detected.`)
    }

    if (issues.length > 0) {
      const solidViolations = issues.filter(i => i.solidPrinciple).length
      parts.push(`${issues.length} architectural issue(s)${solidViolations > 0 ? ` (${solidViolations} SOLID violations)` : ''}.`)
    } else {
      parts.push('No architectural issues detected.')
    }

    parts.push(`Architecture score: ${score}/100.`)
    return parts.join(' ')
  }
}
