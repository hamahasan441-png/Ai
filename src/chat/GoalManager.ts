/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  GoalManager — Autonomous goal tracking & dynamic replanning               ║
 * ║                                                                            ║
 * ║  Manages the AI's goal hierarchy: top-level goals decompose into           ║
 * ║  sub-goals, tracks progress, detects conflicts, and dynamically            ║
 * ║  replans when goals become blocked or new information arrives.             ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Goal creation with priority, deadline, and success criteria           ║
 * ║    • Automatic sub-goal decomposition via templates                        ║
 * ║    • Progress monitoring with milestone tracking                           ║
 * ║    • Goal conflict detection and resolution strategies                     ║
 * ║    • Dynamic replanning when goals are blocked                            ║
 * ║    • Goal dependency graph with critical-path analysis                     ║
 * ║    • Goal suspension, resumption, and abandonment                         ║
 * ║    • Achievement history for learning                                      ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type GoalStatus = 'pending' | 'active' | 'blocked' | 'suspended' | 'completed' | 'failed' | 'abandoned'

export type GoalPriority = 'critical' | 'high' | 'medium' | 'low'

export interface GoalDefinition {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly priority: GoalPriority
  readonly parentId: string | null
  readonly subGoalIds: string[]
  readonly dependencies: string[]
  readonly successCriteria: string[]
  readonly deadline: number | null
  status: GoalStatus
  progress: number  // 0-1
  readonly createdAt: number
  updatedAt: number
  completedAt: number | null
  readonly blockedBy: string[]
  readonly tags: string[]
}

export interface GoalConflict {
  readonly goal1Id: string
  readonly goal2Id: string
  readonly type: 'resource' | 'logical' | 'temporal' | 'priority'
  readonly severity: number
  readonly description: string
  readonly resolution: string
}

export interface GoalMilestone {
  readonly id: string
  readonly goalId: string
  readonly description: string
  readonly targetProgress: number
  readonly achieved: boolean
  readonly achievedAt: number | null
}

export interface GoalReplanResult {
  readonly goalId: string
  readonly reason: string
  readonly oldPlan: string[]
  readonly newPlan: string[]
  readonly confidence: number
}

export interface GoalTreeNode {
  readonly goal: GoalDefinition
  readonly children: GoalTreeNode[]
  readonly depth: number
}

export interface GoalManagerConfig {
  readonly maxGoals: number
  readonly maxSubGoalDepth: number
  readonly maxMilestones: number
  readonly autoDecomposeThreshold: number  // complexity above this gets auto-decomposed
  readonly conflictCheckEnabled: boolean
  readonly maxAchievementHistory: number
}

export interface GoalManagerStats {
  readonly totalGoalsCreated: number
  readonly totalGoalsCompleted: number
  readonly totalGoalsFailed: number
  readonly totalGoalsAbandoned: number
  readonly totalConflictsDetected: number
  readonly totalReplans: number
  readonly avgCompletionRate: number
  readonly activeGoals: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_GOAL_MANAGER_CONFIG: GoalManagerConfig = {
  maxGoals: 200,
  maxSubGoalDepth: 5,
  maxMilestones: 500,
  autoDecomposeThreshold: 0.7,
  conflictCheckEnabled: true,
  maxAchievementHistory: 100,
}

const PRIORITY_WEIGHTS: Record<GoalPriority, number> = {
  critical: 1.0,
  high: 0.75,
  medium: 0.5,
  low: 0.25,
}

/** Goal decomposition templates. */
const DECOMPOSITION_TEMPLATES: Record<string, string[]> = {
  learn: ['Research the topic', 'Understand core concepts', 'Practice with examples', 'Test understanding'],
  build: ['Gather requirements', 'Design architecture', 'Implement core features', 'Test and validate', 'Deploy'],
  analyze: ['Collect data', 'Identify patterns', 'Draw conclusions', 'Validate findings'],
  fix: ['Reproduce the issue', 'Identify root cause', 'Implement fix', 'Verify fix', 'Add regression test'],
  optimize: ['Profile current performance', 'Identify bottlenecks', 'Implement optimizations', 'Measure improvement'],
  research: ['Define research question', 'Survey literature', 'Collect evidence', 'Synthesize findings', 'Present conclusions'],
  default: ['Plan approach', 'Execute main task', 'Verify results', 'Document outcomes'],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function classifyGoalType(title: string): string {
  const lower = title.toLowerCase()
  for (const [type, _] of Object.entries(DECOMPOSITION_TEMPLATES)) {
    if (type !== 'default' && lower.includes(type)) return type
  }
  if (/\b(create|develop|implement|write|make)\b/.test(lower)) return 'build'
  if (/\b(understand|study|explore)\b/.test(lower)) return 'learn'
  if (/\b(debug|resolve|repair)\b/.test(lower)) return 'fix'
  if (/\b(improve|speed|enhance)\b/.test(lower)) return 'optimize'
  if (/\b(investigate|examine|review)\b/.test(lower)) return 'analyze'
  return 'default'
}

function tokenize(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/\s+/).filter(t => t.length > 2))
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class GoalManager {
  private readonly config: GoalManagerConfig
  private readonly goals: Map<string, GoalDefinition> = new Map()
  private readonly milestones: Map<string, GoalMilestone> = new Map()
  private readonly conflicts: GoalConflict[] = []
  private readonly achievementHistory: Array<{ goalId: string; title: string; completedAt: number }> = []
  private stats = {
    totalCreated: 0,
    totalCompleted: 0,
    totalFailed: 0,
    totalAbandoned: 0,
    totalConflicts: 0,
    totalReplans: 0,
  }

  constructor(config: Partial<GoalManagerConfig> = {}) {
    this.config = { ...DEFAULT_GOAL_MANAGER_CONFIG, ...config }
  }

  // ── Goal CRUD ──────────────────────────────────────────────────────────

  /** Create a new goal. */
  createGoal(title: string, description: string, options: {
    priority?: GoalPriority
    parentId?: string | null
    dependencies?: string[]
    successCriteria?: string[]
    deadline?: number | null
    tags?: string[]
  } = {}): GoalDefinition {
    const goal: GoalDefinition = {
      id: generateId('goal'),
      title,
      description,
      priority: options.priority ?? 'medium',
      parentId: options.parentId ?? null,
      subGoalIds: [],
      dependencies: options.dependencies ?? [],
      successCriteria: options.successCriteria ?? [],
      deadline: options.deadline ?? null,
      status: 'pending',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: null,
      blockedBy: [],
      tags: options.tags ?? [],
    }

    this.goals.set(goal.id, goal)
    this.stats.totalCreated++

    // Register as sub-goal of parent
    if (goal.parentId) {
      const parent = this.goals.get(goal.parentId)
      if (parent) {
        ;(parent.subGoalIds as string[]).push(goal.id)
      }
    }

    // Enforce max goals
    if (this.goals.size > this.config.maxGoals) {
      this.evictOldestCompleted()
    }

    return goal
  }

  /** Get a goal by ID. */
  getGoal(goalId: string): GoalDefinition | null {
    return this.goals.get(goalId) ?? null
  }

  /** Get all goals. */
  getAllGoals(): readonly GoalDefinition[] {
    return [...this.goals.values()]
  }

  /** Get goals by status. */
  getGoalsByStatus(status: GoalStatus): GoalDefinition[] {
    return [...this.goals.values()].filter(g => g.status === status)
  }

  /** Get goals by priority. */
  getGoalsByPriority(priority: GoalPriority): GoalDefinition[] {
    return [...this.goals.values()].filter(g => g.priority === priority)
  }

  // ── Status transitions ─────────────────────────────────────────────────

  /** Activate a pending goal. */
  activateGoal(goalId: string): boolean {
    const goal = this.goals.get(goalId)
    if (!goal || goal.status !== 'pending') return false

    // Check dependencies
    for (const depId of goal.dependencies) {
      const dep = this.goals.get(depId)
      if (dep && dep.status !== 'completed') {
        ;(goal.blockedBy as string[]).push(depId)
        goal.status = 'blocked'
        goal.updatedAt = Date.now()
        return false
      }
    }

    goal.status = 'active'
    goal.updatedAt = Date.now()
    return true
  }

  /** Update progress on a goal (0-1). */
  updateProgress(goalId: string, progress: number): boolean {
    const goal = this.goals.get(goalId)
    if (!goal) return false

    goal.progress = Math.max(0, Math.min(1, progress))
    goal.updatedAt = Date.now()

    // Check milestones
    for (const milestone of this.milestones.values()) {
      if (milestone.goalId === goalId && !milestone.achieved && goal.progress >= milestone.targetProgress) {
        ;(milestone as { achieved: boolean }).achieved = true
        ;(milestone as { achievedAt: number | null }).achievedAt = Date.now()
      }
    }

    // Auto-complete if progress reaches 1
    if (goal.progress >= 1.0 && goal.status === 'active') {
      this.completeGoal(goalId)
    }

    return true
  }

  /** Mark a goal as completed. */
  completeGoal(goalId: string): boolean {
    const goal = this.goals.get(goalId)
    if (!goal) return false
    if (goal.status === 'completed') return true

    goal.status = 'completed'
    goal.progress = 1.0
    goal.completedAt = Date.now()
    goal.updatedAt = Date.now()
    this.stats.totalCompleted++

    // Record achievement
    this.achievementHistory.push({
      goalId: goal.id,
      title: goal.title,
      completedAt: Date.now(),
    })
    while (this.achievementHistory.length > this.config.maxAchievementHistory) {
      this.achievementHistory.shift()
    }

    // Unblock dependent goals
    this.unblockDependents(goalId)

    // Update parent progress
    if (goal.parentId) {
      this.updateParentProgress(goal.parentId)
    }

    return true
  }

  /** Mark a goal as failed. */
  failGoal(goalId: string, reason?: string): boolean {
    const goal = this.goals.get(goalId)
    if (!goal) return false

    goal.status = 'failed'
    goal.updatedAt = Date.now()
    this.stats.totalFailed++
    return true
  }

  /** Suspend a goal. */
  suspendGoal(goalId: string): boolean {
    const goal = this.goals.get(goalId)
    if (!goal || goal.status === 'completed' || goal.status === 'failed') return false

    goal.status = 'suspended'
    goal.updatedAt = Date.now()
    return true
  }

  /** Resume a suspended goal. */
  resumeGoal(goalId: string): boolean {
    const goal = this.goals.get(goalId)
    if (!goal || goal.status !== 'suspended') return false

    goal.status = 'active'
    goal.updatedAt = Date.now()
    return true
  }

  /** Abandon a goal. */
  abandonGoal(goalId: string): boolean {
    const goal = this.goals.get(goalId)
    if (!goal) return false

    goal.status = 'abandoned'
    goal.updatedAt = Date.now()
    this.stats.totalAbandoned++
    return true
  }

  // ── Decomposition ──────────────────────────────────────────────────────

  /** Decompose a goal into sub-goals using templates. */
  decompose(goalId: string): GoalDefinition[] {
    const goal = this.goals.get(goalId)
    if (!goal) return []

    // Check depth limit
    if (this.getGoalDepth(goalId) >= this.config.maxSubGoalDepth) return []

    const type = classifyGoalType(goal.title)
    const steps = DECOMPOSITION_TEMPLATES[type] ?? DECOMPOSITION_TEMPLATES['default']

    const subGoals: GoalDefinition[] = []
    let prevId: string | null = null

    for (const step of steps) {
      const sub = this.createGoal(`${step}: ${goal.title}`, step, {
        priority: goal.priority,
        parentId: goalId,
        dependencies: prevId ? [prevId] : [],
        tags: goal.tags,
      })
      subGoals.push(sub)
      prevId = sub.id
    }

    return subGoals
  }

  private getGoalDepth(goalId: string): number {
    let depth = 0
    let current = this.goals.get(goalId)
    while (current?.parentId) {
      depth++
      current = this.goals.get(current.parentId)
    }
    return depth
  }

  // ── Milestones ─────────────────────────────────────────────────────────

  /** Add a milestone to a goal. */
  addMilestone(goalId: string, description: string, targetProgress: number): GoalMilestone | null {
    if (!this.goals.has(goalId)) return null
    if (this.milestones.size >= this.config.maxMilestones) return null

    const milestone: GoalMilestone = {
      id: generateId('ms'),
      goalId,
      description,
      targetProgress: Math.max(0, Math.min(1, targetProgress)),
      achieved: false,
      achievedAt: null,
    }

    this.milestones.set(milestone.id, milestone)
    return milestone
  }

  /** Get milestones for a goal. */
  getMilestones(goalId: string): GoalMilestone[] {
    return [...this.milestones.values()].filter(m => m.goalId === goalId)
  }

  // ── Conflict detection ─────────────────────────────────────────────────

  /** Detect conflicts between active goals. */
  detectConflicts(): GoalConflict[] {
    if (!this.config.conflictCheckEnabled) return []

    const activeGoals = this.getGoalsByStatus('active')
    const newConflicts: GoalConflict[] = []

    for (let i = 0; i < activeGoals.length; i++) {
      for (let j = i + 1; j < activeGoals.length; j++) {
        const g1 = activeGoals[i]
        const g2 = activeGoals[j]

        // Priority conflict
        if (g1.priority === 'critical' && g2.priority === 'critical') {
          newConflicts.push({
            goal1Id: g1.id,
            goal2Id: g2.id,
            type: 'priority',
            severity: 0.8,
            description: `Two critical goals competing: "${g1.title}" vs "${g2.title}"`,
            resolution: 'Sequence them or delegate one',
          })
        }

        // Temporal conflict — overlapping deadlines
        if (g1.deadline && g2.deadline && Math.abs(g1.deadline - g2.deadline) < 3600000) {
          newConflicts.push({
            goal1Id: g1.id,
            goal2Id: g2.id,
            type: 'temporal',
            severity: 0.7,
            description: `Deadlines within 1 hour: "${g1.title}" and "${g2.title}"`,
            resolution: 'Adjust deadlines or prioritize one',
          })
        }

        // Logical conflict — similar titles with opposite keywords
        const t1 = tokenize(g1.title)
        const t2 = tokenize(g2.title)
        let overlap = 0
        for (const t of t1) if (t2.has(t)) overlap++
        if (overlap > 2) {
          const neg1 = /\b(not|remove|delete|undo|revert)\b/i.test(g1.title)
          const neg2 = /\b(not|remove|delete|undo|revert)\b/i.test(g2.title)
          if (neg1 !== neg2) {
            newConflicts.push({
              goal1Id: g1.id,
              goal2Id: g2.id,
              type: 'logical',
              severity: 0.9,
              description: `Contradicting goals: "${g1.title}" vs "${g2.title}"`,
              resolution: 'Resolve contradiction before proceeding',
            })
          }
        }
      }
    }

    this.conflicts.push(...newConflicts)
    this.stats.totalConflicts += newConflicts.length
    return newConflicts
  }

  /** Get all detected conflicts. */
  getConflicts(): readonly GoalConflict[] {
    return [...this.conflicts]
  }

  // ── Replanning ─────────────────────────────────────────────────────────

  /** Replan a blocked or failing goal. */
  replan(goalId: string, reason: string): GoalReplanResult | null {
    const goal = this.goals.get(goalId)
    if (!goal) return null

    const oldSubGoals = goal.subGoalIds.map(id => this.goals.get(id)?.title ?? id)

    // Abandon old sub-goals
    for (const subId of goal.subGoalIds) {
      this.abandonGoal(subId)
    }
    ;(goal.subGoalIds as string[]).length = 0

    // Re-decompose
    const newSubs = this.decompose(goalId)
    const newPlan = newSubs.map(s => s.title)

    // Reset goal status
    goal.status = 'active'
    goal.progress = 0
    ;(goal.blockedBy as string[]).length = 0
    goal.updatedAt = Date.now()

    this.stats.totalReplans++

    return {
      goalId,
      reason,
      oldPlan: oldSubGoals,
      newPlan,
      confidence: 0.7,
    }
  }

  // ── Goal tree ──────────────────────────────────────────────────────────

  /** Build the full goal tree starting from top-level goals. */
  getGoalTree(): GoalTreeNode[] {
    const topLevel = [...this.goals.values()].filter(g => !g.parentId)
    return topLevel.map(g => this.buildTreeNode(g, 0))
  }

  private buildTreeNode(goal: GoalDefinition, depth: number): GoalTreeNode {
    const children = goal.subGoalIds
      .map(id => this.goals.get(id))
      .filter((g): g is GoalDefinition => g !== undefined)
      .map(g => this.buildTreeNode(g, depth + 1))

    return { goal, children, depth }
  }

  // ── Priority queue ─────────────────────────────────────────────────────

  /** Get goals sorted by effective priority (priority * urgency). */
  getPriorityQueue(): GoalDefinition[] {
    const active = this.getGoalsByStatus('active')
    const now = Date.now()

    return active.sort((a, b) => {
      const aPrio = PRIORITY_WEIGHTS[a.priority]
      const bPrio = PRIORITY_WEIGHTS[b.priority]
      const aUrgency = a.deadline ? Math.max(0, 1 - (a.deadline - now) / 86400000) : 0
      const bUrgency = b.deadline ? Math.max(0, 1 - (b.deadline - now) / 86400000) : 0
      return (bPrio + bUrgency) - (aPrio + aUrgency)
    })
  }

  // ── Internal helpers ───────────────────────────────────────────────────

  private unblockDependents(completedGoalId: string): void {
    for (const goal of this.goals.values()) {
      if (goal.status !== 'blocked') continue
      const blocked = goal.blockedBy as string[]
      const idx = blocked.indexOf(completedGoalId)
      if (idx >= 0) {
        blocked.splice(idx, 1)
        if (blocked.length === 0) {
          goal.status = 'active'
          goal.updatedAt = Date.now()
        }
      }
    }
  }

  private updateParentProgress(parentId: string): void {
    const parent = this.goals.get(parentId)
    if (!parent || parent.subGoalIds.length === 0) return

    let totalProgress = 0
    let count = 0
    for (const subId of parent.subGoalIds) {
      const sub = this.goals.get(subId)
      if (sub) {
        totalProgress += sub.progress
        count++
      }
    }

    if (count > 0) {
      parent.progress = totalProgress / count
      parent.updatedAt = Date.now()
    }
  }

  private evictOldestCompleted(): void {
    let oldest: GoalDefinition | null = null
    let oldestTime = Infinity
    for (const goal of this.goals.values()) {
      if ((goal.status === 'completed' || goal.status === 'abandoned') && goal.updatedAt < oldestTime) {
        oldest = goal
        oldestTime = goal.updatedAt
      }
    }
    if (oldest) this.goals.delete(oldest.id)
  }

  // ── Stats ──────────────────────────────────────────────────────────────

  getStats(): Readonly<GoalManagerStats> {
    const all = [...this.goals.values()]
    const completed = all.filter(g => g.status === 'completed').length
    const total = all.length

    return {
      totalGoalsCreated: this.stats.totalCreated,
      totalGoalsCompleted: this.stats.totalCompleted,
      totalGoalsFailed: this.stats.totalFailed,
      totalGoalsAbandoned: this.stats.totalAbandoned,
      totalConflictsDetected: this.stats.totalConflicts,
      totalReplans: this.stats.totalReplans,
      avgCompletionRate: total > 0 ? completed / total : 0,
      activeGoals: all.filter(g => g.status === 'active').length,
    }
  }

  /** Get achievement history. */
  getAchievementHistory(): ReadonlyArray<{ goalId: string; title: string; completedAt: number }> {
    return [...this.achievementHistory]
  }

  // ── Serialization ──────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      goals: [...this.goals.values()],
      milestones: [...this.milestones.values()],
      conflicts: this.conflicts,
      achievementHistory: this.achievementHistory,
      stats: this.stats,
    })
  }

  static deserialize(json: string, config?: Partial<GoalManagerConfig>): GoalManager {
    const engine = new GoalManager(config)
    try {
      const data = JSON.parse(json)
      if (Array.isArray(data.goals)) {
        for (const g of data.goals) engine.goals.set(g.id, g)
      }
      if (Array.isArray(data.milestones)) {
        for (const m of data.milestones) engine.milestones.set(m.id, m)
      }
      if (Array.isArray(data.conflicts)) engine.conflicts.push(...data.conflicts)
      if (Array.isArray(data.achievementHistory)) engine.achievementHistory.push(...data.achievementHistory)
      if (data.stats) Object.assign(engine.stats, data.stats)
    } catch { /* fresh engine on failure */ }
    return engine
  }
}
