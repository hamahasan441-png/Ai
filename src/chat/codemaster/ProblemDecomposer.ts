/**
 * 🧩 ProblemDecomposer — Complex Task Solver
 *
 * Breaks down complex coding problems into manageable, ordered steps:
 *   • Intent classification (new feature, refactor, fix, optimize)
 *   • Task graph building (DAG of subtasks with dependencies)
 *   • Context gathering (identify files/modules to read/modify)
 *   • Step sequencing (topological sort by dependencies)
 *   • Effort estimation (complexity per step)
 *
 * Works fully offline with heuristic-based decomposition.
 */

import type {
  TaskPlan,
  TaskStep,
  TaskIntent,
  StepStatus,
  AnalysisLanguage,
} from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// INTENT CLASSIFICATION
// ══════════════════════════════════════════════════════════════════════════════

interface IntentPattern {
  intent: TaskIntent
  keywords: string[]
  weight: number
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'new-feature',
    keywords: ['add', 'create', 'implement', 'build', 'new', 'introduce', 'develop', 'design'],
    weight: 1.0,
  },
  {
    intent: 'refactor',
    keywords: ['refactor', 'restructure', 'reorganize', 'clean up', 'simplify', 'extract', 'rename', 'move'],
    weight: 1.0,
  },
  {
    intent: 'fix-bug',
    keywords: ['fix', 'bug', 'error', 'crash', 'broken', 'issue', 'problem', 'wrong', 'fail', 'not working'],
    weight: 1.2,
  },
  {
    intent: 'optimize',
    keywords: ['optimize', 'performance', 'speed', 'faster', 'slow', 'memory', 'cache', 'efficient'],
    weight: 1.0,
  },
  {
    intent: 'add-tests',
    keywords: ['test', 'testing', 'unit test', 'integration test', 'coverage', 'spec', 'assert'],
    weight: 1.0,
  },
  {
    intent: 'documentation',
    keywords: ['document', 'docs', 'readme', 'comment', 'jsdoc', 'explain', 'describe', 'guide'],
    weight: 0.9,
  },
  {
    intent: 'security',
    keywords: ['security', 'vulnerability', 'auth', 'permission', 'encrypt', 'sanitize', 'validate', 'xss', 'injection'],
    weight: 1.1,
  },
]

/**
 * Classify user intent from a task description.
 */
export function classifyIntent(description: string): { intent: TaskIntent; confidence: number } {
  const lower = description.toLowerCase()
  const scores = new Map<TaskIntent, number>()

  for (const pattern of INTENT_PATTERNS) {
    let score = 0
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword)) score += pattern.weight
    }
    if (score > 0) scores.set(pattern.intent, score)
  }

  let bestIntent: TaskIntent = 'general'
  let bestScore = 0
  let totalScore = 0

  for (const [intent, score] of scores) {
    totalScore += score
    if (score > bestScore) {
      bestScore = score
      bestIntent = intent
    }
  }

  const confidence = totalScore > 0 ? Math.min(bestScore / totalScore, 1.0) : 0

  return { intent: bestIntent, confidence: Math.round(confidence * 100) / 100 }
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTEXT EXTRACTION
// ══════════════════════════════════════════════════════════════════════════════

/** Extract file paths and module references from a description. */
export function extractContextFiles(description: string): string[] {
  const files: string[] = []

  // Match file paths (e.g., src/foo/bar.ts, ./utils.js, package.json)
  const filePattern = /(?:^|\s)((?:\.\/|\.\.\/|src\/|lib\/|test\/|tests\/)?[\w./-]+\.(?:ts|js|tsx|jsx|py|java|go|rs|rb|php|c|cpp|h|css|html|json|yaml|yml|toml|md))/g
  let match
  while ((match = filePattern.exec(description)) !== null) {
    files.push(match[1])
  }

  // Match module references (e.g., "the auth module", "UserService")
  const modulePattern = /(?:the\s+)?(\w+)(?:\s+module|\s+service|\s+controller|\s+model|\s+component)/gi
  while ((match = modulePattern.exec(description)) !== null) {
    files.push(`src/${match[1].toLowerCase()}/`)
  }

  return [...new Set(files)]
}

// ══════════════════════════════════════════════════════════════════════════════
// TOPOLOGICAL SORT
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Topological sort of steps based on dependencies.
 * Returns step IDs in execution order.
 */
export function topologicalSort(steps: TaskStep[]): string[] {
  const graph = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  // Build adjacency list and in-degree count
  for (const step of steps) {
    graph.set(step.id, [])
    inDegree.set(step.id, 0)
  }

  for (const step of steps) {
    for (const dep of step.dependencies) {
      const edges = graph.get(dep)
      if (edges) edges.push(step.id)
      inDegree.set(step.id, (inDegree.get(step.id) ?? 0) + 1)
    }
  }

  // Kahn's algorithm
  const queue: string[] = []
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id)
  }

  const order: string[] = []
  while (queue.length > 0) {
    const current = queue.shift()!
    order.push(current)

    for (const neighbor of graph.get(current) ?? []) {
      const newDegree = (inDegree.get(neighbor) ?? 0) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) queue.push(neighbor)
    }
  }

  // If not all nodes are in order, there's a cycle — append remaining
  if (order.length < steps.length) {
    for (const step of steps) {
      if (!order.includes(step.id)) order.push(step.id)
    }
  }

  return order
}

// ══════════════════════════════════════════════════════════════════════════════
// DECOMPOSITION TEMPLATES
// ══════════════════════════════════════════════════════════════════════════════

interface DecompositionTemplate {
  intent: TaskIntent
  generateSteps: (description: string, contextFiles: string[]) => TaskStep[]
}

const TEMPLATES: DecompositionTemplate[] = [
  {
    intent: 'new-feature',
    generateSteps: (desc, ctx) => [
      { id: 'step-1', description: 'Define interfaces/types for the new feature', dependencies: [], filesToModify: ctx.filter(f => f.endsWith('.ts') || f.endsWith('.js')), estimatedLines: 30, status: 'pending' as StepStatus },
      { id: 'step-2', description: 'Implement core logic', dependencies: ['step-1'], filesToModify: [], estimatedLines: 100, status: 'pending' as StepStatus },
      { id: 'step-3', description: 'Add integration with existing modules', dependencies: ['step-2'], filesToModify: ctx, estimatedLines: 50, status: 'pending' as StepStatus },
      { id: 'step-4', description: 'Add error handling and validation', dependencies: ['step-2'], filesToModify: [], estimatedLines: 30, status: 'pending' as StepStatus },
      { id: 'step-5', description: 'Write unit tests', dependencies: ['step-2', 'step-3', 'step-4'], filesToModify: [], estimatedLines: 80, status: 'pending' as StepStatus },
      { id: 'step-6', description: 'Update exports and documentation', dependencies: ['step-5'], filesToModify: [], estimatedLines: 20, status: 'pending' as StepStatus },
    ],
  },
  {
    intent: 'fix-bug',
    generateSteps: (desc, ctx) => [
      { id: 'step-1', description: 'Reproduce and understand the bug', dependencies: [], filesToModify: [], estimatedLines: 0, status: 'pending' as StepStatus },
      { id: 'step-2', description: 'Identify root cause in source code', dependencies: ['step-1'], filesToModify: ctx, estimatedLines: 5, status: 'pending' as StepStatus },
      { id: 'step-3', description: 'Implement the fix', dependencies: ['step-2'], filesToModify: ctx, estimatedLines: 20, status: 'pending' as StepStatus },
      { id: 'step-4', description: 'Add regression test', dependencies: ['step-3'], filesToModify: [], estimatedLines: 30, status: 'pending' as StepStatus },
      { id: 'step-5', description: 'Verify fix doesn\'t break existing tests', dependencies: ['step-3', 'step-4'], filesToModify: [], estimatedLines: 0, status: 'pending' as StepStatus },
    ],
  },
  {
    intent: 'refactor',
    generateSteps: (desc, ctx) => [
      { id: 'step-1', description: 'Analyze current code structure', dependencies: [], filesToModify: [], estimatedLines: 0, status: 'pending' as StepStatus },
      { id: 'step-2', description: 'Plan refactoring approach', dependencies: ['step-1'], filesToModify: [], estimatedLines: 0, status: 'pending' as StepStatus },
      { id: 'step-3', description: 'Extract/reorganize code', dependencies: ['step-2'], filesToModify: ctx, estimatedLines: 60, status: 'pending' as StepStatus },
      { id: 'step-4', description: 'Update all references and imports', dependencies: ['step-3'], filesToModify: [], estimatedLines: 20, status: 'pending' as StepStatus },
      { id: 'step-5', description: 'Run and fix tests', dependencies: ['step-3', 'step-4'], filesToModify: [], estimatedLines: 15, status: 'pending' as StepStatus },
    ],
  },
  {
    intent: 'optimize',
    generateSteps: (desc, ctx) => [
      { id: 'step-1', description: 'Profile and identify bottlenecks', dependencies: [], filesToModify: [], estimatedLines: 0, status: 'pending' as StepStatus },
      { id: 'step-2', description: 'Implement optimization', dependencies: ['step-1'], filesToModify: ctx, estimatedLines: 40, status: 'pending' as StepStatus },
      { id: 'step-3', description: 'Add benchmarks', dependencies: ['step-2'], filesToModify: [], estimatedLines: 25, status: 'pending' as StepStatus },
      { id: 'step-4', description: 'Verify correctness after optimization', dependencies: ['step-2', 'step-3'], filesToModify: [], estimatedLines: 10, status: 'pending' as StepStatus },
    ],
  },
  {
    intent: 'add-tests',
    generateSteps: (desc, ctx) => [
      { id: 'step-1', description: 'Identify untested code paths', dependencies: [], filesToModify: [], estimatedLines: 0, status: 'pending' as StepStatus },
      { id: 'step-2', description: 'Write unit tests for core functions', dependencies: ['step-1'], filesToModify: [], estimatedLines: 100, status: 'pending' as StepStatus },
      { id: 'step-3', description: 'Write edge case tests', dependencies: ['step-2'], filesToModify: [], estimatedLines: 50, status: 'pending' as StepStatus },
      { id: 'step-4', description: 'Add integration tests', dependencies: ['step-2'], filesToModify: [], estimatedLines: 60, status: 'pending' as StepStatus },
    ],
  },
  {
    intent: 'security',
    generateSteps: (desc, ctx) => [
      { id: 'step-1', description: 'Security audit of current code', dependencies: [], filesToModify: [], estimatedLines: 0, status: 'pending' as StepStatus },
      { id: 'step-2', description: 'Fix critical vulnerabilities', dependencies: ['step-1'], filesToModify: ctx, estimatedLines: 30, status: 'pending' as StepStatus },
      { id: 'step-3', description: 'Add input validation and sanitization', dependencies: ['step-2'], filesToModify: ctx, estimatedLines: 40, status: 'pending' as StepStatus },
      { id: 'step-4', description: 'Add security tests', dependencies: ['step-2', 'step-3'], filesToModify: [], estimatedLines: 50, status: 'pending' as StepStatus },
    ],
  },
  {
    intent: 'documentation',
    generateSteps: (desc, ctx) => [
      { id: 'step-1', description: 'Review existing documentation gaps', dependencies: [], filesToModify: [], estimatedLines: 0, status: 'pending' as StepStatus },
      { id: 'step-2', description: 'Write/update JSDoc comments', dependencies: ['step-1'], filesToModify: ctx, estimatedLines: 40, status: 'pending' as StepStatus },
      { id: 'step-3', description: 'Update README and guides', dependencies: ['step-2'], filesToModify: ['README.md'], estimatedLines: 30, status: 'pending' as StepStatus },
    ],
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DECOMPOSER CLASS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * ProblemDecomposer — Breaks complex coding problems into ordered steps.
 *
 * @example
 * ```ts
 * const decomposer = new ProblemDecomposer()
 * const plan = decomposer.decompose('Add authentication to the REST API')
 * console.log(plan.intent)          // 'new-feature'
 * console.log(plan.executionOrder)  // ['step-1', 'step-2', ...]
 * console.log(plan.steps)           // TaskStep[]
 * ```
 */
export class ProblemDecomposer {
  /**
   * Decompose a task description into an executable plan.
   */
  decompose(description: string): TaskPlan {
    // Step 1: Classify intent
    const { intent } = classifyIntent(description)

    // Step 2: Extract context files
    const contextFiles = extractContextFiles(description)

    // Step 3: Generate steps from template
    const template = TEMPLATES.find(t => t.intent === intent)
    const generalTemplate = TEMPLATES.find(t => t.intent === 'new-feature')!
    const steps = template
      ? template.generateSteps(description, contextFiles)
      : generalTemplate.generateSteps(description, contextFiles)

    // Step 4: Topological sort for execution order
    const executionOrder = topologicalSort(steps)

    // Step 5: Compute estimate
    const totalLines = steps.reduce((sum, s) => sum + s.estimatedLines, 0)
    const totalFiles = new Set(steps.flatMap(s => s.filesToModify)).size

    return {
      intent,
      steps,
      executionOrder,
      contextFiles,
      totalEstimate: {
        files: Math.max(totalFiles, 1),
        linesAdded: totalLines,
        linesRemoved: Math.round(totalLines * 0.2), // estimate ~20% churn
      },
    }
  }

  /**
   * Classify intent only.
   */
  getIntent(description: string): { intent: TaskIntent; confidence: number } {
    return classifyIntent(description)
  }

  /**
   * Update a step's status in a plan.
   */
  updateStepStatus(plan: TaskPlan, stepId: string, status: StepStatus): TaskPlan {
    return {
      ...plan,
      steps: plan.steps.map(s => s.id === stepId ? { ...s, status } : s),
    }
  }

  /**
   * Get the next pending steps that have all dependencies satisfied.
   */
  getNextSteps(plan: TaskPlan): TaskStep[] {
    const completed = new Set(
      plan.steps.filter(s => s.status === 'completed').map(s => s.id),
    )

    return plan.steps.filter(s =>
      s.status === 'pending' &&
      s.dependencies.every(dep => completed.has(dep)),
    )
  }

  /**
   * Check if the plan is complete (all steps done or failed/skipped).
   */
  isPlanComplete(plan: TaskPlan): boolean {
    return plan.steps.every(s =>
      s.status === 'completed' || s.status === 'failed' || s.status === 'skipped',
    )
  }
}
