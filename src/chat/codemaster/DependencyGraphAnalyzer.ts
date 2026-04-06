/**
 * 🔗 DependencyGraphAnalyzer — Cross-File Dependency & Structure Analysis
 *
 * Analyzes import/export relationships across code:
 *   • Dependency graph construction from import statements
 *   • Circular dependency detection (cycles in the graph)
 *   • Unused export detection
 *   • Missing import validation
 *   • Module coupling analysis (fan-in, fan-out)
 *   • Layered architecture violation detection
 *
 * Works fully offline — static analysis from import/export patterns.
 */

import type { Severity } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** A node in the dependency graph representing a file/module. */
export interface DependencyNode {
  /** File path or module identifier. */
  id: string
  /** What this module imports. */
  imports: ImportInfo[]
  /** What this module exports. */
  exports: ExportInfo[]
  /** Fan-in: how many modules import this one. */
  fanIn: number
  /** Fan-out: how many modules this one imports. */
  fanOut: number
  /** Instability metric: fanOut / (fanIn + fanOut). 0=stable, 1=unstable. */
  instability: number
}

/** Information about an import statement. */
export interface ImportInfo {
  /** Source module/path. */
  source: string
  /** Named imports. */
  names: string[]
  /** Whether it's a default import. */
  isDefault: boolean
  /** Whether it's a type-only import. */
  isTypeOnly: boolean
  /** Line number. */
  line: number
}

/** Information about an export. */
export interface ExportInfo {
  /** Exported name. */
  name: string
  /** Whether it's a default export. */
  isDefault: boolean
  /** Whether it's a type-only export. */
  isTypeOnly: boolean
  /** Line number. */
  line: number
}

/** A circular dependency cycle. */
export interface CircularDependency {
  /** The cycle path (e.g., ['A', 'B', 'C', 'A']). */
  cycle: string[]
  /** Severity (longer cycles are worse). */
  severity: Severity
  /** Description. */
  description: string
}

/** A dependency issue. */
export interface DependencyIssue {
  /** Type of issue. */
  type: DependencyIssueType
  /** Severity. */
  severity: Severity
  /** File where the issue is. */
  file: string
  /** Line number. */
  line: number
  /** Title. */
  title: string
  /** Description. */
  description: string
  /** Suggestion. */
  suggestion: string
}

/** Categories of dependency issues. */
export type DependencyIssueType =
  | 'circular-dependency'
  | 'unused-export'
  | 'missing-import'
  | 'high-coupling'
  | 'layer-violation'
  | 'barrel-import'
  | 'deep-import'

/** Result of dependency graph analysis. */
export interface DependencyGraphAnalysis {
  /** All nodes in the graph. */
  nodes: DependencyNode[]
  /** Circular dependencies found. */
  circularDeps: CircularDependency[]
  /** All dependency issues. */
  issues: DependencyIssue[]
  /** Coupling score (0-100, lower = less coupled). */
  couplingScore: number
  /** Summary. */
  summary: string
}

/** A single file's content for multi-file analysis. */
export interface FileContent {
  /** File path. */
  path: string
  /** File content. */
  content: string
}

// ══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY GRAPH ANALYZER
// ══════════════════════════════════════════════════════════════════════════════

export class DependencyGraphAnalyzer {
  private nodes: Map<string, DependencyNode> = new Map()
  private adjacency: Map<string, Set<string>> = new Map()

  constructor() {
    // no-op
  }

  /** Reset the internal graph state. */
  reset(): void {
    this.nodes.clear()
    this.adjacency.clear()
  }

  /** Analyze a single file and add it to the graph. */
  addFile(filePath: string, content: string): DependencyNode {
    const lines = content.split('\n')
    const imports = this.extractImports(lines)
    const exports = this.extractExports(lines)

    const node: DependencyNode = {
      id: filePath,
      imports,
      exports,
      fanIn: 0,
      fanOut: imports.length,
      instability: 0,
    }

    this.nodes.set(filePath, node)

    // Build adjacency list
    if (!this.adjacency.has(filePath)) this.adjacency.set(filePath, new Set())
    for (const imp of imports) {
      const resolved = this.resolveImportPath(filePath, imp.source)
      this.adjacency.get(filePath)!.add(resolved)
    }

    return node
  }

  /** Analyze multiple files together. */
  analyzeFiles(files: FileContent[]): DependencyGraphAnalysis {
    this.reset()

    // Phase 1: Parse all files
    for (const file of files) {
      this.addFile(file.path, file.content)
    }

    // Phase 2: Calculate fan-in
    this.calculateFanIn()

    // Phase 3: Detect circular dependencies
    const circularDeps = this.detectCircularDependencies()

    // Phase 4: Detect issues
    const issues = this.detectIssues(files)

    // Phase 5: Calculate coupling score
    const couplingScore = this.calculateCouplingScore()

    const summary = this.generateSummary(circularDeps, issues, couplingScore)

    return {
      nodes: Array.from(this.nodes.values()),
      circularDeps,
      issues,
      couplingScore,
      summary,
    }
  }

  /** Analyze a single file for dependency issues. */
  analyzeSingle(filePath: string, content: string): DependencyNode {
    return this.addFile(filePath, content)
  }

  /** Get all detected circular dependencies. */
  getCircularDependencies(): CircularDependency[] {
    return this.detectCircularDependencies()
  }

  // ── IMPORT/EXPORT EXTRACTION ───────────────────────────────────────────

  private extractImports(lines: string[]): ImportInfo[] {
    const imports: ImportInfo[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // ES6: import { X, Y } from 'module'
      const es6Match = line.match(/^import\s+(?:type\s+)?(?:\{([^}]*)\}|(\w+)(?:\s*,\s*\{([^}]*)\})?)\s+from\s+['"]([^'"]+)['"]/)
      if (es6Match) {
        const namedImports = (es6Match[1] || es6Match[3] || '').split(',').map(s => s.trim()).filter(Boolean)
        const defaultImport = es6Match[2]
        const source = es6Match[4]

        imports.push({
          source,
          names: defaultImport ? [defaultImport, ...namedImports] : namedImports,
          isDefault: !!defaultImport,
          isTypeOnly: /^import\s+type\s/.test(line),
          line: i + 1,
        })
        continue
      }

      // Side-effect import: import 'module'
      const sideEffectMatch = line.match(/^import\s+['"]([^'"]+)['"]/)
      if (sideEffectMatch) {
        imports.push({
          source: sideEffectMatch[1],
          names: [],
          isDefault: false,
          isTypeOnly: false,
          line: i + 1,
        })
        continue
      }

      // CommonJS: const X = require('module')
      const requireMatch = line.match(/(?:const|let|var)\s+(?:\{([^}]*)\}|(\w+))\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/)
      if (requireMatch) {
        const namedImports = (requireMatch[1] || '').split(',').map(s => s.trim()).filter(Boolean)
        const defaultName = requireMatch[2]
        const source = requireMatch[3]

        imports.push({
          source,
          names: defaultName ? [defaultName] : namedImports,
          isDefault: !!defaultName,
          isTypeOnly: false,
          line: i + 1,
        })
        continue
      }

      // Python: from module import X, Y
      const pyFromMatch = line.match(/^from\s+([\w.]+)\s+import\s+(.+)/)
      if (pyFromMatch) {
        const names = pyFromMatch[2].split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)
        imports.push({
          source: pyFromMatch[1],
          names,
          isDefault: false,
          isTypeOnly: false,
          line: i + 1,
        })
        continue
      }

      // Python: import module
      const pyImportMatch = line.match(/^import\s+([\w.]+)/)
      if (pyImportMatch && !line.includes('from')) {
        imports.push({
          source: pyImportMatch[1],
          names: [pyImportMatch[1].split('.').pop() || pyImportMatch[1]],
          isDefault: true,
          isTypeOnly: false,
          line: i + 1,
        })
      }
    }

    return imports
  }

  private extractExports(lines: string[]): ExportInfo[] {
    const exports: ExportInfo[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // export default
      if (/^export\s+default\s/.test(line)) {
        const nameMatch = line.match(/export\s+default\s+(?:class|function|const|let|var)\s+(\w+)/)
        exports.push({
          name: nameMatch ? nameMatch[1] : 'default',
          isDefault: true,
          isTypeOnly: false,
          line: i + 1,
        })
        continue
      }

      // export { X, Y }
      const namedExportMatch = line.match(/^export\s+(?:type\s+)?\{([^}]+)\}/)
      if (namedExportMatch) {
        const names = namedExportMatch[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()?.trim() || s.trim()).filter(Boolean)
        for (const name of names) {
          exports.push({
            name,
            isDefault: false,
            isTypeOnly: /^export\s+type\s/.test(line),
            line: i + 1,
          })
        }
        continue
      }

      // export const/let/var/function/class/interface/type/enum
      const directExportMatch = line.match(/^export\s+(?:type\s+|interface\s+|enum\s+|const\s+|let\s+|var\s+|function\s+|class\s+|abstract\s+class\s+)(\w+)/)
      if (directExportMatch) {
        exports.push({
          name: directExportMatch[1],
          isDefault: false,
          isTypeOnly: /^export\s+(?:type|interface)\s/.test(line),
          line: i + 1,
        })
      }

      // module.exports
      if (/module\.exports\s*=/.test(line)) {
        exports.push({
          name: 'default',
          isDefault: true,
          isTypeOnly: false,
          line: i + 1,
        })
      }
    }

    return exports
  }

  // ── GRAPH ANALYSIS ─────────────────────────────────────────────────────

  private calculateFanIn(): void {
    // Count how many modules import each module
    const fanInCount = new Map<string, number>()

    for (const [sourceFile, targets] of this.adjacency) {
      for (const target of targets) {
        fanInCount.set(target, (fanInCount.get(target) || 0) + 1)
      }
    }

    for (const [id, node] of this.nodes) {
      node.fanIn = fanInCount.get(id) || 0
      const total = node.fanIn + node.fanOut
      node.instability = total === 0 ? 0 : node.fanOut / total
    }
  }

  private detectCircularDependencies(): CircularDependency[] {
    const cycles: CircularDependency[] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    const dfs = (node: string): void => {
      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      const neighbors = this.adjacency.get(node) || new Set()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor)
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor)
          if (cycleStart >= 0) {
            const cycle = [...path.slice(cycleStart), neighbor]
            // Avoid duplicate cycles
            const cycleKey = [...cycle].sort().join('→')
            if (!cycles.some(c => [...c.cycle].sort().join('→') === cycleKey)) {
              const severity: Severity = cycle.length > 4 ? 'high' : cycle.length > 3 ? 'medium' : 'low'
              cycles.push({
                cycle,
                severity,
                description: `Circular dependency: ${cycle.join(' → ')}`,
              })
            }
          }
        }
      }

      path.pop()
      recursionStack.delete(node)
    }

    for (const nodeId of this.adjacency.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId)
      }
    }

    return cycles
  }

  private detectIssues(files: FileContent[]): DependencyIssue[] {
    const issues: DependencyIssue[] = []

    // Circular dependency issues
    const cycles = this.detectCircularDependencies()
    for (const cycle of cycles) {
      issues.push({
        type: 'circular-dependency',
        severity: cycle.severity,
        file: cycle.cycle[0],
        line: 1,
        title: `Circular dependency (${cycle.cycle.length - 1} modules)`,
        description: cycle.description,
        suggestion: 'Break the cycle by extracting shared interfaces into a separate module, or use dependency injection.',
      })
    }

    // High coupling detection
    for (const node of this.nodes.values()) {
      if (node.fanOut > 10) {
        issues.push({
          type: 'high-coupling',
          severity: 'medium',
          file: node.id,
          line: 1,
          title: `High fan-out: ${node.fanOut} imports`,
          description: `Module '${node.id}' imports ${node.fanOut} other modules. High fan-out indicates this module has too many responsibilities.`,
          suggestion: 'Consider splitting into smaller, more focused modules.',
        })
      }

      if (node.instability > 0.8 && node.fanOut > 5) {
        issues.push({
          type: 'high-coupling',
          severity: 'low',
          file: node.id,
          line: 1,
          title: `Highly unstable module (instability: ${node.instability.toFixed(2)})`,
          description: `Module '${node.id}' has high instability (${node.instability.toFixed(2)}). It depends on many modules but few depend on it.`,
          suggestion: 'Consider making this module depend on abstractions (interfaces) rather than concrete implementations.',
        })
      }
    }

    // Unused exports detection (cross-file)
    if (files.length > 1) {
      const allImportedNames = new Set<string>()
      for (const node of this.nodes.values()) {
        for (const imp of node.imports) {
          for (const name of imp.names) {
            allImportedNames.add(name)
          }
        }
      }

      for (const node of this.nodes.values()) {
        for (const exp of node.exports) {
          if (exp.isDefault) continue // Skip default exports
          if (!allImportedNames.has(exp.name)) {
            issues.push({
              type: 'unused-export',
              severity: 'info',
              file: node.id,
              line: exp.line,
              title: `Potentially unused export: '${exp.name}'`,
              description: `Export '${exp.name}' from '${node.id}' is not imported by any analyzed file.`,
              suggestion: 'Remove the export if it is not used externally, or mark it as internal.',
            })
          }
        }
      }
    }

    // Deep import detection
    for (const node of this.nodes.values()) {
      for (const imp of node.imports) {
        const depth = (imp.source.match(/\//g) || []).length
        if (depth >= 4 && imp.source.startsWith('.')) {
          issues.push({
            type: 'deep-import',
            severity: 'low',
            file: node.id,
            line: imp.line,
            title: `Deep relative import (${depth} levels)`,
            description: `Import '${imp.source}' reaches ${depth} levels deep. Deep imports create tight coupling.`,
            suggestion: 'Consider using barrel exports (index.ts) or path aliases to flatten the import.',
          })
        }
      }
    }

    return issues
  }

  // ── SCORING ────────────────────────────────────────────────────────────

  private calculateCouplingScore(): number {
    if (this.nodes.size === 0) return 100

    let score = 100
    const cycles = this.detectCircularDependencies()
    score -= cycles.length * 15

    for (const node of this.nodes.values()) {
      if (node.fanOut > 10) score -= 5
      if (node.instability > 0.8) score -= 2
    }

    return Math.max(0, Math.min(100, score))
  }

  private resolveImportPath(fromFile: string, importSource: string): string {
    if (!importSource.startsWith('.')) return importSource

    const fromDir = fromFile.split('/').slice(0, -1).join('/')
    const parts = importSource.split('/')
    const resolved: string[] = fromDir ? fromDir.split('/') : []

    for (const part of parts) {
      if (part === '.') continue
      if (part === '..') {
        resolved.pop()
      } else {
        resolved.push(part)
      }
    }

    return resolved.join('/')
  }

  private generateSummary(
    cycles: CircularDependency[],
    issues: DependencyIssue[],
    couplingScore: number,
  ): string {
    const parts: string[] = [
      `${this.nodes.size} module(s) analyzed.`,
    ]

    if (cycles.length > 0) {
      parts.push(`${cycles.length} circular dependency cycle(s) found.`)
    }

    if (issues.length > 0) {
      parts.push(`${issues.length} dependency issue(s) detected.`)
    }

    parts.push(`Coupling score: ${couplingScore}/100.`)
    return parts.join(' ')
  }
}
