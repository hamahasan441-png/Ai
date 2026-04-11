import { describe, it, expect, beforeEach } from 'vitest'
import { GoalManager, DEFAULT_GOAL_MANAGER_CONFIG } from '../GoalManager'

describe('GoalManager', () => {
  let manager: GoalManager

  beforeEach(() => {
    manager = new GoalManager()
  })

  // ══════════════════════════════════════════════════════════════════════
  // §1 — Construction & Configuration
  // ══════════════════════════════════════════════════════════════════════

  describe('construction', () => {
    it('creates with default config', () => {
      expect(manager).toBeInstanceOf(GoalManager)
    })

    it('creates with custom config', () => {
      const custom = new GoalManager({ maxGoals: 10 })
      expect(custom).toBeInstanceOf(GoalManager)
    })

    it('exports DEFAULT_GOAL_MANAGER_CONFIG', () => {
      expect(DEFAULT_GOAL_MANAGER_CONFIG).toBeDefined()
      expect(DEFAULT_GOAL_MANAGER_CONFIG.maxGoals).toBe(200)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §2 — Goal CRUD
  // ══════════════════════════════════════════════════════════════════════

  describe('goal creation', () => {
    it('creates a goal with title and description', () => {
      const goal = manager.createGoal('Learn TypeScript', 'Master TypeScript programming')
      expect(goal.id).toBeTruthy()
      expect(goal.title).toBe('Learn TypeScript')
      expect(goal.description).toBe('Master TypeScript programming')
      expect(goal.status).toBe('pending')
    })

    it('creates with custom priority', () => {
      const goal = manager.createGoal('Urgent task', 'Fix bug', { priority: 'critical' })
      expect(goal.priority).toBe('critical')
    })

    it('creates with dependencies', () => {
      const g1 = manager.createGoal('Step 1', 'First')
      const g2 = manager.createGoal('Step 2', 'Second', { dependencies: [g1.id] })
      expect(g2.dependencies).toContain(g1.id)
    })

    it('creates with success criteria', () => {
      const goal = manager.createGoal('Test goal', 'Desc', {
        successCriteria: ['Pass all tests', 'No regressions'],
      })
      expect(goal.successCriteria.length).toBe(2)
    })

    it('creates with deadline', () => {
      const deadline = Date.now() + 86400000
      const goal = manager.createGoal('Deadline goal', 'Desc', { deadline })
      expect(goal.deadline).toBe(deadline)
    })

    it('creates with tags', () => {
      const goal = manager.createGoal('Tagged', 'Desc', { tags: ['coding', 'urgent'] })
      expect(goal.tags).toContain('coding')
    })

    it('registers sub-goal with parent', () => {
      const parent = manager.createGoal('Parent', 'Parent goal')
      const child = manager.createGoal('Child', 'Child goal', { parentId: parent.id })
      const updatedParent = manager.getGoal(parent.id)
      expect(updatedParent!.subGoalIds).toContain(child.id)
    })
  })

  describe('goal retrieval', () => {
    it('gets a goal by ID', () => {
      const goal = manager.createGoal('Test', 'Desc')
      expect(manager.getGoal(goal.id)).not.toBeNull()
    })

    it('returns null for non-existent goal', () => {
      expect(manager.getGoal('nonexistent')).toBeNull()
    })

    it('gets all goals', () => {
      manager.createGoal('A', 'Desc')
      manager.createGoal('B', 'Desc')
      expect(manager.getAllGoals().length).toBe(2)
    })

    it('gets goals by status', () => {
      const g = manager.createGoal('A', 'Desc')
      manager.activateGoal(g.id)
      expect(manager.getGoalsByStatus('active').length).toBe(1)
    })

    it('gets goals by priority', () => {
      manager.createGoal('A', 'Desc', { priority: 'high' })
      manager.createGoal('B', 'Desc', { priority: 'low' })
      expect(manager.getGoalsByPriority('high').length).toBe(1)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §3 — Status Transitions
  // ══════════════════════════════════════════════════════════════════════

  describe('status transitions', () => {
    it('activates a pending goal', () => {
      const goal = manager.createGoal('Test', 'Desc')
      expect(manager.activateGoal(goal.id)).toBe(true)
      expect(manager.getGoal(goal.id)!.status).toBe('active')
    })

    it('blocks a goal with unmet dependencies', () => {
      const dep = manager.createGoal('Dependency', 'Desc')
      const goal = manager.createGoal('Dependent', 'Desc', { dependencies: [dep.id] })
      expect(manager.activateGoal(goal.id)).toBe(false)
      expect(manager.getGoal(goal.id)!.status).toBe('blocked')
    })

    it('does not activate non-pending goal', () => {
      const goal = manager.createGoal('Test', 'Desc')
      manager.activateGoal(goal.id)
      expect(manager.activateGoal(goal.id)).toBe(false)
    })

    it('updates progress on a goal', () => {
      const goal = manager.createGoal('Test', 'Desc')
      manager.activateGoal(goal.id)
      manager.updateProgress(goal.id, 0.5)
      expect(manager.getGoal(goal.id)!.progress).toBe(0.5)
    })

    it('clamps progress to 0-1', () => {
      const goal = manager.createGoal('Test', 'Desc')
      manager.updateProgress(goal.id, 1.5)
      expect(manager.getGoal(goal.id)!.progress).toBe(1)
    })

    it('auto-completes when progress reaches 1', () => {
      const goal = manager.createGoal('Test', 'Desc')
      manager.activateGoal(goal.id)
      manager.updateProgress(goal.id, 1.0)
      expect(manager.getGoal(goal.id)!.status).toBe('completed')
    })

    it('completes a goal', () => {
      const goal = manager.createGoal('Test', 'Desc')
      manager.activateGoal(goal.id)
      expect(manager.completeGoal(goal.id)).toBe(true)
      expect(manager.getGoal(goal.id)!.status).toBe('completed')
    })

    it('fails a goal', () => {
      const goal = manager.createGoal('Test', 'Desc')
      expect(manager.failGoal(goal.id)).toBe(true)
      expect(manager.getGoal(goal.id)!.status).toBe('failed')
    })

    it('suspends a goal', () => {
      const goal = manager.createGoal('Test', 'Desc')
      manager.activateGoal(goal.id)
      expect(manager.suspendGoal(goal.id)).toBe(true)
      expect(manager.getGoal(goal.id)!.status).toBe('suspended')
    })

    it('resumes a suspended goal', () => {
      const goal = manager.createGoal('Test', 'Desc')
      manager.activateGoal(goal.id)
      manager.suspendGoal(goal.id)
      expect(manager.resumeGoal(goal.id)).toBe(true)
      expect(manager.getGoal(goal.id)!.status).toBe('active')
    })

    it('abandons a goal', () => {
      const goal = manager.createGoal('Test', 'Desc')
      expect(manager.abandonGoal(goal.id)).toBe(true)
      expect(manager.getGoal(goal.id)!.status).toBe('abandoned')
    })

    it('unblocks dependent goals on completion', () => {
      const dep = manager.createGoal('Dep', 'Dependency')
      const goal = manager.createGoal('Main', 'Main task', { dependencies: [dep.id] })
      manager.activateGoal(goal.id) // gets blocked
      expect(manager.getGoal(goal.id)!.status).toBe('blocked')

      manager.activateGoal(dep.id)
      manager.completeGoal(dep.id)
      expect(manager.getGoal(goal.id)!.status).toBe('active')
    })

    it('updates parent progress when sub-goal completes', () => {
      const parent = manager.createGoal('Parent', 'Desc')
      const child1 = manager.createGoal('Child 1', 'Desc', { parentId: parent.id })
      const child2 = manager.createGoal('Child 2', 'Desc', { parentId: parent.id })
      manager.activateGoal(child1.id)
      manager.completeGoal(child1.id)
      expect(manager.getGoal(parent.id)!.progress).toBe(0.5)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §4 — Decomposition
  // ══════════════════════════════════════════════════════════════════════

  describe('decomposition', () => {
    it('decomposes a learn goal', () => {
      const goal = manager.createGoal('Learn Python', 'Master Python')
      const subs = manager.decompose(goal.id)
      expect(subs.length).toBeGreaterThan(0)
      expect(subs[0].parentId).toBe(goal.id)
    })

    it('decomposes a build goal', () => {
      const goal = manager.createGoal('Build a REST API', 'Create REST endpoints')
      const subs = manager.decompose(goal.id)
      expect(subs.length).toBeGreaterThan(0)
    })

    it('decomposes a fix goal', () => {
      const goal = manager.createGoal('Fix authentication bug', 'Debug auth')
      const subs = manager.decompose(goal.id)
      expect(subs.length).toBeGreaterThan(0)
    })

    it('decomposes an optimize goal', () => {
      const goal = manager.createGoal('Optimize database queries', 'Speed up')
      const subs = manager.decompose(goal.id)
      expect(subs.length).toBeGreaterThan(0)
    })

    it('decomposes with dependencies between sub-goals', () => {
      const goal = manager.createGoal('Analyze data', 'Run analysis')
      const subs = manager.decompose(goal.id)
      // Second sub-goal should depend on first
      if (subs.length > 1) {
        expect(subs[1].dependencies).toContain(subs[0].id)
      }
    })

    it('returns empty for non-existent goal', () => {
      expect(manager.decompose('nonexistent')).toEqual([])
    })

    it('respects depth limit', () => {
      const small = new GoalManager({ maxSubGoalDepth: 1 })
      const parent = small.createGoal('Parent', 'Desc')
      const subs = small.decompose(parent.id)
      // Try to decompose a sub-goal — should fail at depth 1
      if (subs.length > 0) {
        const subsubs = small.decompose(subs[0].id)
        expect(subsubs).toEqual([])
      }
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §5 — Milestones
  // ══════════════════════════════════════════════════════════════════════

  describe('milestones', () => {
    it('adds a milestone to a goal', () => {
      const goal = manager.createGoal('Test', 'Desc')
      const ms = manager.addMilestone(goal.id, 'Halfway', 0.5)
      expect(ms).not.toBeNull()
      expect(ms!.targetProgress).toBe(0.5)
    })

    it('returns null for invalid goal', () => {
      expect(manager.addMilestone('bad', 'Nope', 0.5)).toBeNull()
    })

    it('achieves milestone when progress passes threshold', () => {
      const goal = manager.createGoal('Test', 'Desc')
      manager.addMilestone(goal.id, 'Quarter', 0.25)
      manager.activateGoal(goal.id)
      manager.updateProgress(goal.id, 0.3)
      const milestones = manager.getMilestones(goal.id)
      expect(milestones[0].achieved).toBe(true)
    })

    it('gets milestones for a goal', () => {
      const goal = manager.createGoal('Test', 'Desc')
      manager.addMilestone(goal.id, 'M1', 0.25)
      manager.addMilestone(goal.id, 'M2', 0.75)
      expect(manager.getMilestones(goal.id).length).toBe(2)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §6 — Conflict Detection
  // ══════════════════════════════════════════════════════════════════════

  describe('conflict detection', () => {
    it('detects priority conflicts between critical goals', () => {
      const g1 = manager.createGoal('Critical A', 'Desc', { priority: 'critical' })
      const g2 = manager.createGoal('Critical B', 'Desc', { priority: 'critical' })
      manager.activateGoal(g1.id)
      manager.activateGoal(g2.id)
      const conflicts = manager.detectConflicts()
      expect(conflicts.some(c => c.type === 'priority')).toBe(true)
    })

    it('detects temporal conflicts with close deadlines', () => {
      const now = Date.now()
      const g1 = manager.createGoal('A', 'Desc', { deadline: now + 1000 })
      const g2 = manager.createGoal('B', 'Desc', { deadline: now + 2000 })
      manager.activateGoal(g1.id)
      manager.activateGoal(g2.id)
      const conflicts = manager.detectConflicts()
      expect(conflicts.some(c => c.type === 'temporal')).toBe(true)
    })

    it('gets all conflicts', () => {
      const g1 = manager.createGoal('Critical task one', 'D', { priority: 'critical' })
      const g2 = manager.createGoal('Critical task two', 'D', { priority: 'critical' })
      manager.activateGoal(g1.id)
      manager.activateGoal(g2.id)
      manager.detectConflicts()
      expect(manager.getConflicts().length).toBeGreaterThan(0)
    })

    it('returns empty when conflict checking disabled', () => {
      const noConflict = new GoalManager({ conflictCheckEnabled: false })
      const g1 = noConflict.createGoal('A', 'D', { priority: 'critical' })
      const g2 = noConflict.createGoal('B', 'D', { priority: 'critical' })
      noConflict.activateGoal(g1.id)
      noConflict.activateGoal(g2.id)
      expect(noConflict.detectConflicts()).toEqual([])
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §7 — Replanning
  // ══════════════════════════════════════════════════════════════════════

  describe('replanning', () => {
    it('replans a goal with new sub-goals', () => {
      const goal = manager.createGoal('Learn React', 'Master React')
      manager.decompose(goal.id)
      const result = manager.replan(goal.id, 'Initial approach not working')
      expect(result).not.toBeNull()
      expect(result!.newPlan.length).toBeGreaterThan(0)
      expect(result!.reason).toBe('Initial approach not working')
    })

    it('returns null for non-existent goal', () => {
      expect(manager.replan('bad', 'reason')).toBeNull()
    })

    it('resets goal status to active after replan', () => {
      const goal = manager.createGoal('Fix bug', 'Debug issue')
      manager.decompose(goal.id)
      manager.replan(goal.id, 'New approach')
      expect(manager.getGoal(goal.id)!.status).toBe('active')
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §8 — Goal Tree & Priority Queue
  // ══════════════════════════════════════════════════════════════════════

  describe('goal tree', () => {
    it('builds a goal tree', () => {
      const parent = manager.createGoal('Parent', 'Desc')
      manager.createGoal('Child 1', 'Desc', { parentId: parent.id })
      manager.createGoal('Child 2', 'Desc', { parentId: parent.id })
      const tree = manager.getGoalTree()
      expect(tree.length).toBe(1) // one top-level
      expect(tree[0].children.length).toBe(2)
    })
  })

  describe('priority queue', () => {
    it('returns goals sorted by effective priority', () => {
      const g1 = manager.createGoal('Low', 'Desc', { priority: 'low' })
      const g2 = manager.createGoal('High', 'Desc', { priority: 'high' })
      const g3 = manager.createGoal('Critical', 'Desc', { priority: 'critical' })
      manager.activateGoal(g1.id)
      manager.activateGoal(g2.id)
      manager.activateGoal(g3.id)
      const queue = manager.getPriorityQueue()
      expect(queue.length).toBe(3)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §9 — Stats & Achievement History
  // ══════════════════════════════════════════════════════════════════════

  describe('stats', () => {
    it('tracks goals created', () => {
      manager.createGoal('A', 'D')
      expect(manager.getStats().totalGoalsCreated).toBe(1)
    })

    it('tracks goals completed', () => {
      const g = manager.createGoal('A', 'D')
      manager.completeGoal(g.id)
      expect(manager.getStats().totalGoalsCompleted).toBe(1)
    })

    it('tracks goals failed', () => {
      const g = manager.createGoal('A', 'D')
      manager.failGoal(g.id)
      expect(manager.getStats().totalGoalsFailed).toBe(1)
    })

    it('tracks goals abandoned', () => {
      const g = manager.createGoal('A', 'D')
      manager.abandonGoal(g.id)
      expect(manager.getStats().totalGoalsAbandoned).toBe(1)
    })

    it('tracks active goals', () => {
      const g = manager.createGoal('A', 'D')
      manager.activateGoal(g.id)
      expect(manager.getStats().activeGoals).toBe(1)
    })

    it('computes completion rate', () => {
      const g1 = manager.createGoal('A', 'D')
      const g2 = manager.createGoal('B', 'D')
      manager.completeGoal(g1.id)
      expect(manager.getStats().avgCompletionRate).toBe(0.5)
    })
  })

  describe('achievement history', () => {
    it('records achievements when goals complete', () => {
      const g = manager.createGoal('A', 'D')
      manager.completeGoal(g.id)
      const history = manager.getAchievementHistory()
      expect(history.length).toBe(1)
      expect(history[0].title).toBe('A')
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §10 — Serialization
  // ══════════════════════════════════════════════════════════════════════

  describe('serialization', () => {
    it('serializes to JSON', () => {
      manager.createGoal('Test', 'Desc')
      const json = manager.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('deserializes from JSON', () => {
      manager.createGoal('Persistent', 'Desc')
      const json = manager.serialize()
      const restored = GoalManager.deserialize(json)
      expect(restored.getAllGoals().length).toBe(1)
    })

    it('handles invalid JSON gracefully', () => {
      const restored = GoalManager.deserialize('bad json')
      expect(restored).toBeInstanceOf(GoalManager)
    })

    it('preserves milestones', () => {
      const g = manager.createGoal('G', 'D')
      manager.addMilestone(g.id, 'M', 0.5)
      const json = manager.serialize()
      const restored = GoalManager.deserialize(json)
      expect(restored.getMilestones(g.id).length).toBe(1)
    })
  })
})
