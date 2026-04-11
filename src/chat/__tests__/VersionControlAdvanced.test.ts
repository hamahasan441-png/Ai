/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Version Control Advanced Knowledge — Tests                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('VersionControlAdvanced', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match Git internals and branching strategies keywords', async () => {
      const r = await brain.chat(
        'explain git internals objects refs packfiles reflog dag branching strategies git flow github flow trunk based development release branches',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /git\s+internal|objects?|refs?|packfile|reflog|dag|branching|git\s+flow|github\s+flow|trunk/,
      )
    })

    it('should match rebase vs merge and git hooks keywords', async () => {
      const r = await brain.chat(
        'explain rebase vs merge interactive rebase squash fixup autosquash git hooks automation pre-commit commit-msg pre-push husky lint-staged',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /rebase|merge|interactive|squash|fixup|git\s+hook|pre.commit|husky|lint.staged/,
      )
    })

    it('should match monorepo management and conflict resolution keywords', async () => {
      const r = await brain.chat(
        'explain monorepo management nx turborepo lerna workspace affected conflict resolution merge strategies ours theirs rerere octopus three way merge',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /monorepo|nx|turborepo|lerna|workspace|conflict|merge|ours|theirs|rerere|three.way/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Version Control Advanced with domain tooling', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Version Control Advanced')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('tooling')
    })

    it('should have >=5 connected sub-concepts including Git Internals & Object Model and Branching Strategies & Workflows', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Version Control Advanced')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Git Internals & Object Model')
      expect(names).toContain('Branching Strategies & Workflows')
    })

    it('should relate Git Internals & Object Model to Rebase vs Merge & History', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Git Internals & Object Model')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Rebase vs Merge & History')
    })
  })
})
