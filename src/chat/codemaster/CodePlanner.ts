/**
 * 📋 CodePlanner — Multi-File Change Planner
 *
 * Plans coordinated changes across multiple files like GitHub Copilot agent:
 *   • Analyzes a task description and determines all files to modify
 *   • Builds a dependency-aware execution plan (DAG ordering)
 *   • Estimates risk and impact for each change
 *   • Supports rollback planning for safe execution
 *   • Validates plan consistency (no circular deps, no missing files)
 *   • Generates human-readable plan summaries
 *
 * Works fully offline — heuristic-based planning with zero external deps.
 */

import type { AnalysisLanguage, Severity, TaskIntent } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** A planned change to a single file. */
export interface PlannedChange {
  /** File path relative to project root. */
  filePath: string
  /** Type of change. */
  changeType: ChangeType
  /** Description of what changes. */
  description: string
  /** Estimated lines added. */
  linesAdded: number
  /** Estimated lines removed. */
  linesRemoved: number
  /** Risk level of this change. */
  risk: RiskLevel
  /** Dependencies — files that must be changed first. */
  dependsOn: string[]
  /** Language of the file. */
  language: AnalysisLanguage
  /** Validation steps for this change. */
  validationSteps: string[]
}

/** Types of file changes. */
export type ChangeType = 'create' | 'modify' | 'delete' | 'rename' | 'move'

/** Risk assessment levels. */
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal'

/** A complete multi-file change plan. */
export interface ChangePlan {
  /** Unique plan ID. */
  id: string
  /** What the plan accomplishes. */
  title: string
  /** Classified intent. */
  intent: TaskIntent
  /** All planned changes. */
  changes: PlannedChange[]
  /** Execution order (file paths in dependency order). */
  executionOrder: string[]
  /** Files to read for context before executing. */
  contextFiles: string[]
  /** Overall risk assessment. */
  overallRisk: RiskLevel
  /** Plan-level validation warnings. */
  warnings: PlanWarning[]
  /** Human-readable summary. */
  summary: string
  /** Estimated total effort. */
  effort: EffortEstimate
  /** Whether plan has been validated. */
  isValid: boolean
}

/** A warning about the plan. */
export interface PlanWarning {
  /** Warning severity. */
  severity: Severity
  /** Warning message. */
  message: string
  /** Affected file(s). */
  affectedFiles: string[]
}

/** Effort estimate for a plan. */
export interface EffortEstimate {
  /** Total files affected. */
  filesAffected: number
  /** Total estimated lines added. */
  totalLinesAdded: number
  /** Total estimated lines removed. */
  totalLinesRemoved: number
  /** Complexity rating. */
  complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'very-complex'
}

// ══════════════════════════════════════════════════════════════════════════════
// TASK PATTERNS — detect what kind of change is being planned
// ══════════════════════════════════════════════════════════════════════════════

interface TaskPattern {
  intent: TaskIntent
  keywords: string[]
  weight: number
}

const TASK_PATTERNS: TaskPattern[] = [
  {
    intent: 'new-feature',
    keywords: ['add', 'create', 'implement', 'build', 'new', 'introduce', 'develop', 'scaffold'],
    weight: 1.0,
  },
  {
    intent: 'refactor',
    keywords: [
      'refactor',
      'restructure',
      'reorganize',
      'clean',
      'simplify',
      'extract',
      'rename',
      'move',
      'split',
    ],
    weight: 1.0,
  },
  {
    intent: 'fix-bug',
    keywords: ['fix', 'bug', 'error', 'crash', 'broken', 'issue', 'problem', 'wrong', 'fail'],
    weight: 1.2,
  },
  {
    intent: 'optimize',
    keywords: [
      'optimize',
      'performance',
      'speed',
      'faster',
      'slow',
      'memory',
      'cache',
      'efficient',
      'reduce',
    ],
    weight: 1.0,
  },
  {
    intent: 'add-tests',
    keywords: ['test', 'testing', 'unit', 'integration', 'coverage', 'spec', 'assert', 'mock'],
    weight: 1.0,
  },
  {
    intent: 'documentation',
    keywords: ['document', 'docs', 'readme', 'comment', 'jsdoc', 'explain', 'describe', 'api'],
    weight: 0.8,
  },
  {
    intent: 'security',
    keywords: [
      'security',
      'vulnerability',
      'auth',
      'permission',
      'sanitize',
      'validate',
      'encrypt',
      'xss',
      'injection',
    ],
    weight: 1.1,
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// LANGUAGE DETECTION FOR FILE PATHS
// ══════════════════════════════════════════════════════════════════════════════

const EXT_TO_LANGUAGE: Record<string, AnalysisLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.py': 'python',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.c': 'c',
  '.h': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.kts': 'kotlin',
  '.rb': 'ruby',
  '.php': 'php',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.less': 'css',
  '.sql': 'sql',
  '.sh': 'bash',
  '.bash': 'bash',
  '.ps1': 'powershell',
  '.r': 'r',
  '.R': 'r',
  '.dart': 'dart',
  '.scala': 'scala',
  '.lua': 'lua',
  '.hs': 'haskell',
  '.ex': 'elixir',
  '.exs': 'elixir',
}

function detectLanguageFromPath(filePath: string): AnalysisLanguage {
  const ext = filePath.substring(filePath.lastIndexOf('.'))
  return EXT_TO_LANGUAGE[ext] ?? 'unknown'
}

// ══════════════════════════════════════════════════════════════════════════════
// CODE PLANNER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * CodePlanner — Plans coordinated multi-file changes.
 *
 * Given a task description and optional file context, produces a dependency-ordered
 * plan with risk assessment and validation.
 */
export class CodePlanner {
  private planCounter = 0

  /**
   * Classify task intent from a description.
   */
  classifyIntent(description: string): TaskIntent {
    const lower = description.toLowerCase()
    const scores: Record<string, number> = {}

    for (const pattern of TASK_PATTERNS) {
      let score = 0
      for (const kw of pattern.keywords) {
        if (lower.includes(kw)) {
          score += pattern.weight
        }
      }
      scores[pattern.intent] = score
    }

    let best: TaskIntent = 'general'
    let bestScore = 0
    for (const [intent, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score
        best = intent as TaskIntent
      }
    }
    return best
  }

  /**
   * Detect files mentioned in a task description.
   */
  detectMentionedFiles(description: string): string[] {
    const filePattern =
      /(?:^|\s)([\w./\\-]+\.(?:ts|tsx|js|jsx|py|rs|go|java|c|cpp|cs|rb|php|html|css|sql|sh|kt|swift|dart|scala|hs|ex|exs|mjs|json|yaml|yml|toml|xml|md))\b/gi
    const matches: string[] = []
    let m: RegExpExecArray | null
    while ((m = filePattern.exec(description)) !== null) {
      matches.push(m[1])
    }
    return [...new Set(matches)]
  }

  /**
   * Infer which files need to change based on task description and known project files.
   */
  inferAffectedFiles(description: string, knownFiles: string[]): string[] {
    const mentioned = this.detectMentionedFiles(description)
    if (mentioned.length > 0) return mentioned

    // Heuristic: based on intent + keywords, guess file types
    const lower = description.toLowerCase()
    const affected: string[] = []

    for (const file of knownFiles) {
      const fileName = file.split('/').pop()?.toLowerCase() ?? ''

      // Match test-related tasks to test files
      if (
        (lower.includes('test') || lower.includes('spec')) &&
        (fileName.includes('test') || fileName.includes('spec'))
      ) {
        affected.push(file)
        continue
      }

      // Match doc tasks to doc files
      if (lower.includes('readme') && fileName.includes('readme')) {
        affected.push(file)
        continue
      }

      // Match specific keywords to file names
      const words = lower.split(/\s+/)
      for (const word of words) {
        if (word.length > 3 && fileName.includes(word)) {
          affected.push(file)
          break
        }
      }
    }

    return [...new Set(affected)]
  }

  /**
   * Assess risk level of a planned change.
   */
  assessRisk(
    change: Pick<PlannedChange, 'changeType' | 'filePath' | 'linesAdded' | 'linesRemoved'>,
  ): RiskLevel {
    // Deleting files is always high risk
    if (change.changeType === 'delete') return 'high'

    // Creating files is low risk
    if (change.changeType === 'create') return 'low'

    // Large changes are higher risk
    const totalDelta = change.linesAdded + change.linesRemoved
    if (totalDelta > 200) return 'critical'
    if (totalDelta > 100) return 'high'
    if (totalDelta > 50) return 'medium'
    if (totalDelta > 10) return 'low'

    // Config/infra files are higher risk
    const path = change.filePath.toLowerCase()
    if (
      path.includes('config') ||
      path.includes('package.json') ||
      path.includes('tsconfig') ||
      path.includes('.env')
    ) {
      return 'medium'
    }

    return 'minimal'
  }

  /**
   * Build execution order from changes using topological sort.
   * Returns file paths in safe execution order (dependencies first).
   */
  buildExecutionOrder(changes: PlannedChange[]): string[] {
    const graph = new Map<string, Set<string>>()
    const inDegree = new Map<string, number>()

    // Initialize
    for (const c of changes) {
      if (!graph.has(c.filePath)) graph.set(c.filePath, new Set())
      if (!inDegree.has(c.filePath)) inDegree.set(c.filePath, 0)
    }

    // Build edges
    for (const c of changes) {
      for (const dep of c.dependsOn) {
        if (graph.has(dep)) {
          graph.get(dep)!.add(c.filePath)
          inDegree.set(c.filePath, (inDegree.get(c.filePath) ?? 0) + 1)
        }
      }
    }

    // Kahn's algorithm
    const queue: string[] = []
    for (const [node, degree] of inDegree) {
      if (degree === 0) queue.push(node)
    }

    const order: string[] = []
    while (queue.length > 0) {
      const node = queue.shift()!
      order.push(node)
      for (const neighbor of graph.get(node) ?? []) {
        const newDeg = (inDegree.get(neighbor) ?? 0) - 1
        inDegree.set(neighbor, newDeg)
        if (newDeg === 0) queue.push(neighbor)
      }
    }

    // If not all nodes are in order, there's a cycle — add remaining
    for (const c of changes) {
      if (!order.includes(c.filePath)) {
        order.push(c.filePath)
      }
    }

    return order
  }

  /**
   * Validate a plan for consistency issues.
   */
  validatePlan(changes: PlannedChange[]): PlanWarning[] {
    const warnings: PlanWarning[] = []
    const filePaths = new Set(changes.map(c => c.filePath))

    // Check for circular dependencies
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (file: string, depMap: Map<string, string[]>): boolean => {
      visited.add(file)
      recursionStack.add(file)

      for (const dep of depMap.get(file) ?? []) {
        if (!visited.has(dep)) {
          if (hasCycle(dep, depMap)) return true
        } else if (recursionStack.has(dep)) {
          return true
        }
      }

      recursionStack.delete(file)
      return false
    }

    const depMap = new Map<string, string[]>()
    for (const c of changes) {
      depMap.set(c.filePath, c.dependsOn)
    }

    for (const c of changes) {
      if (!visited.has(c.filePath) && hasCycle(c.filePath, depMap)) {
        warnings.push({
          severity: 'high',
          message: `Circular dependency detected involving ${c.filePath}`,
          affectedFiles: [c.filePath],
        })
      }
    }

    // Check for dependencies on files not in the plan
    for (const c of changes) {
      for (const dep of c.dependsOn) {
        if (!filePaths.has(dep)) {
          warnings.push({
            severity: 'medium',
            message: `${c.filePath} depends on ${dep} which is not in the plan`,
            affectedFiles: [c.filePath, dep],
          })
        }
      }
    }

    // Check for duplicate file paths
    const seen = new Set<string>()
    for (const c of changes) {
      if (seen.has(c.filePath)) {
        warnings.push({
          severity: 'medium',
          message: `Duplicate change entry for ${c.filePath}`,
          affectedFiles: [c.filePath],
        })
      }
      seen.add(c.filePath)
    }

    // Check for high-risk changes without validation steps
    for (const c of changes) {
      if ((c.risk === 'critical' || c.risk === 'high') && c.validationSteps.length === 0) {
        warnings.push({
          severity: 'medium',
          message: `High-risk change to ${c.filePath} has no validation steps`,
          affectedFiles: [c.filePath],
        })
      }
    }

    return warnings
  }

  /**
   * Compute overall risk from individual change risks.
   */
  computeOverallRisk(changes: PlannedChange[]): RiskLevel {
    if (changes.length === 0) return 'minimal'

    const riskOrder: RiskLevel[] = ['minimal', 'low', 'medium', 'high', 'critical']
    let maxIdx = 0
    for (const c of changes) {
      const idx = riskOrder.indexOf(c.risk)
      if (idx > maxIdx) maxIdx = idx
    }

    // Multiple high-risk changes escalate
    const highRiskCount = changes.filter(c => c.risk === 'high' || c.risk === 'critical').length
    if (highRiskCount >= 3 && maxIdx < 4) maxIdx = Math.min(maxIdx + 1, 4)

    return riskOrder[maxIdx]
  }

  /**
   * Estimate effort for a set of changes.
   */
  estimateEffort(changes: PlannedChange[]): EffortEstimate {
    const totalLinesAdded = changes.reduce((sum, c) => sum + c.linesAdded, 0)
    const totalLinesRemoved = changes.reduce((sum, c) => sum + c.linesRemoved, 0)
    const totalDelta = totalLinesAdded + totalLinesRemoved

    let complexity: EffortEstimate['complexity']
    if (totalDelta <= 20 && changes.length <= 2) complexity = 'trivial'
    else if (totalDelta <= 100 && changes.length <= 5) complexity = 'simple'
    else if (totalDelta <= 300 && changes.length <= 10) complexity = 'moderate'
    else if (totalDelta <= 1000) complexity = 'complex'
    else complexity = 'very-complex'

    return {
      filesAffected: changes.length,
      totalLinesAdded,
      totalLinesRemoved,
      complexity,
    }
  }

  /**
   * Create a complete change plan from a task description.
   */
  createPlan(
    description: string,
    options?: {
      knownFiles?: string[]
      fileContents?: Map<string, string>
    },
  ): ChangePlan {
    const id = `plan-${++this.planCounter}-${Date.now()}`
    const intent = this.classifyIntent(description)
    const knownFiles = options?.knownFiles ?? []
    const affectedFiles = this.inferAffectedFiles(description, knownFiles)

    // Build changes based on intent and affected files
    const changes: PlannedChange[] = affectedFiles.map(filePath => {
      const lang = detectLanguageFromPath(filePath)
      const isNew = intent === 'new-feature'
      const changeType: ChangeType = isNew ? 'create' : 'modify'
      const linesAdded = isNew ? 50 : 20
      const linesRemoved = isNew ? 0 : 10

      const change: PlannedChange = {
        filePath,
        changeType,
        description: `${intent}: ${description.substring(0, 80)}`,
        linesAdded,
        linesRemoved,
        risk: 'low',
        dependsOn: [],
        language: lang,
        validationSteps: [`lint ${filePath}`, `test ${filePath}`],
      }

      change.risk = this.assessRisk(change)
      return change
    })

    // If no files detected, create a placeholder plan
    if (changes.length === 0) {
      const defaultFile = intent === 'add-tests' ? 'src/__tests__/new.test.ts' : 'src/index.ts'
      changes.push({
        filePath: defaultFile,
        changeType: intent === 'new-feature' ? 'create' : 'modify',
        description: description.substring(0, 120),
        linesAdded: 30,
        linesRemoved: 0,
        risk: 'low',
        dependsOn: [],
        language: detectLanguageFromPath(defaultFile),
        validationSteps: ['lint', 'test'],
      })
    }

    const executionOrder = this.buildExecutionOrder(changes)
    const warnings = this.validatePlan(changes)
    const overallRisk = this.computeOverallRisk(changes)
    const effort = this.estimateEffort(changes)
    const contextFiles = this.inferContextFiles(changes, knownFiles)

    return {
      id,
      title: this.generateTitle(description, intent),
      intent,
      changes,
      executionOrder,
      contextFiles,
      overallRisk,
      warnings,
      summary: this.generateSummary(changes, intent, effort),
      effort,
      isValid: warnings.filter(w => w.severity === 'critical').length === 0,
    }
  }

  /**
   * Infer context files that should be read before executing the plan.
   */
  private inferContextFiles(changes: PlannedChange[], knownFiles: string[]): string[] {
    const contextFiles = new Set<string>()

    for (const change of changes) {
      // Add related test files
      const baseName = change.filePath.replace(/\.\w+$/, '')
      for (const kf of knownFiles) {
        if (kf.includes(baseName) && kf !== change.filePath) {
          contextFiles.add(kf)
        }
      }

      // Add related type definition files
      if (change.language === 'typescript' || change.language === 'javascript') {
        for (const kf of knownFiles) {
          if (kf.endsWith('types.ts') || kf.endsWith('index.ts')) {
            const changeDir = change.filePath.substring(0, change.filePath.lastIndexOf('/'))
            if (kf.startsWith(changeDir)) {
              contextFiles.add(kf)
            }
          }
        }
      }
    }

    // Don't include files that are already being changed
    const changePaths = new Set(changes.map(c => c.filePath))
    return [...contextFiles].filter(f => !changePaths.has(f))
  }

  /**
   * Generate a concise plan title.
   */
  private generateTitle(description: string, intent: TaskIntent): string {
    const intentLabels: Record<TaskIntent, string> = {
      'new-feature': '✨ New Feature',
      refactor: '♻️ Refactor',
      'fix-bug': '🐛 Bug Fix',
      optimize: '⚡ Optimization',
      'add-tests': '🧪 Add Tests',
      documentation: '📝 Documentation',
      security: '🔒 Security',
      general: '📋 Task',
    }

    const label = intentLabels[intent]
    const shortDesc = description.length > 60 ? description.substring(0, 57) + '...' : description
    return `${label}: ${shortDesc}`
  }

  /**
   * Generate a human-readable plan summary.
   */
  private generateSummary(
    changes: PlannedChange[],
    intent: TaskIntent,
    effort: EffortEstimate,
  ): string {
    const creates = changes.filter(c => c.changeType === 'create').length
    const modifies = changes.filter(c => c.changeType === 'modify').length
    const deletes = changes.filter(c => c.changeType === 'delete').length

    const parts: string[] = [`Plan: ${intent}`]
    if (creates > 0) parts.push(`create ${creates} file(s)`)
    if (modifies > 0) parts.push(`modify ${modifies} file(s)`)
    if (deletes > 0) parts.push(`delete ${deletes} file(s)`)
    parts.push(`~${effort.totalLinesAdded}+ / ~${effort.totalLinesRemoved}- lines`)
    parts.push(`complexity: ${effort.complexity}`)

    return parts.join(' | ')
  }
}
