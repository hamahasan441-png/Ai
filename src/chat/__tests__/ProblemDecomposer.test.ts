import { describe, it, expect, beforeEach } from 'vitest'
import { ProblemDecomposer, DEFAULT_PROBLEM_DECOMPOSER_CONFIG } from '../ProblemDecomposer.js'

describe('ProblemDecomposer', () => {
  let engine: ProblemDecomposer

  beforeEach(() => {
    engine = new ProblemDecomposer()
  })

  describe('Configuration', () => {
    it('should use default config', () => {
      expect(DEFAULT_PROBLEM_DECOMPOSER_CONFIG.maxSubProblems).toBe(50)
      expect(DEFAULT_PROBLEM_DECOMPOSER_CONFIG.enableAutoDecomposition).toBe(true)
    })

    it('should accept custom config', () => {
      const e = new ProblemDecomposer({ maxSubProblems: 10 })
      expect(e).toBeInstanceOf(ProblemDecomposer)
    })
  })

  describe('Problem creation', () => {
    it('should define a problem', () => {
      const p = engine.defineProblem(
        'Fix performance',
        'We need to optimize the database queries to reduce response time and improve speed',
        ['Must maintain compatibility'],
        ['50% faster'],
      )
      expect(p.id).toBeDefined()
      expect(p.title).toBe('Fix performance')
      expect(p.type).toBe('optimization')
      expect(p.constraints.length).toBe(1)
      expect(p.goals.length).toBe(1)
    })

    it('should classify optimization problems', () => {
      const p = engine.defineProblem(
        'Speed',
        'Optimize the algorithm to be faster and more efficient',
      )
      expect(p.type).toBe('optimization')
    })

    it('should classify design problems', () => {
      const p = engine.defineProblem('New system', 'Design and architect a new microservice')
      expect(p.type).toBe('design')
    })

    it('should classify debugging problems', () => {
      const p = engine.defineProblem(
        'Fix crash',
        'Debug the error causing the application to crash',
      )
      expect(p.type).toBe('debugging')
    })

    it('should classify analysis problems', () => {
      const p = engine.defineProblem(
        'Review',
        'Analyze and evaluate the current system performance metrics',
      )
      expect(p.type).toBe('analysis')
    })

    it('should classify decision problems', () => {
      const p = engine.defineProblem(
        'Choose',
        'Decide between options and select the best framework to use',
      )
      expect(p.type).toBe('decision')
    })

    it('should classify integration problems', () => {
      const p = engine.defineProblem(
        'Connect',
        'Integrate the payment system and combine with the existing API',
      )
      expect(p.type).toBe('integration')
    })

    it('should classify transformation problems', () => {
      const p = engine.defineProblem(
        'Migrate',
        'Transform and migrate the legacy system to cloud native',
      )
      expect(p.type).toBe('transformation')
    })

    it('should estimate complexity', () => {
      const simple = engine.defineProblem('Simple', 'Fix typo')
      const complex = engine.defineProblem(
        'Complex',
        'Design and implement a distributed microservice architecture with event sourcing, CQRS, saga patterns, and comprehensive monitoring across multiple cloud regions with automatic failover',
        ['Constraint 1', 'Constraint 2', 'Constraint 3', 'Constraint 4'],
      )
      expect(['trivial', 'simple']).toContain(simple.complexity)
      expect(['complex', 'very_complex']).toContain(complex.complexity)
    })

    it('should retrieve problem by id', () => {
      const p = engine.defineProblem('Test', 'Description')
      expect(engine.getProblem(p.id)).toEqual(p)
    })

    it('should return null for unknown problem', () => {
      expect(engine.getProblem('missing')).toBeNull()
    })
  })

  describe('Decomposition', () => {
    it('should decompose into sub-problems', () => {
      const p = engine.defineProblem('Build API', 'Create a REST API')
      const subs = engine.decompose(p.id, [
        { title: 'Design schema', description: 'Database schema design' },
        { title: 'Implement endpoints', description: 'REST endpoints' },
        { title: 'Write tests', description: 'Unit and integration tests' },
      ])
      expect(subs.length).toBe(3)
      expect(subs[0].parentId).toBe(p.id)
    })

    it('should support dependencies between sub-problems', () => {
      const p = engine.defineProblem('Pipeline', 'Build CI/CD pipeline')
      const subs = engine.decompose(p.id, [
        { title: 'Setup repo', description: 'Initialize repository' },
        { title: 'Add tests', description: 'Add test suite', dependsOn: [] },
      ])
      const sub3 = engine.decompose(p.id, [
        {
          title: 'Deploy',
          description: 'Deploy to production',
          dependsOn: [subs[0].id, subs[1].id],
        },
      ])
      expect(sub3[0].dependsOn.length).toBe(2)
    })

    it('should return empty for missing problem', () => {
      expect(engine.decompose('missing', [{ title: 'X', description: 'Y' }])).toEqual([])
    })

    it('should get sub-problems for a problem', () => {
      const p = engine.defineProblem('Test', 'Test')
      engine.decompose(p.id, [
        { title: 'A', description: 'A' },
        { title: 'B', description: 'B' },
      ])
      expect(engine.getSubProblems(p.id).length).toBe(2)
    })
  })

  describe('Approaches', () => {
    it('should add solution approach', () => {
      const p = engine.defineProblem('Test', 'Test')
      const subs = engine.decompose(p.id, [{ title: 'Sub', description: 'Sub' }])
      const approach = engine.addApproach(
        subs[0].id,
        'Brute force',
        'Try all combinations',
        'divide_and_conquer',
        ['Simple'],
        ['Slow'],
      )
      expect(approach).not.toBeNull()
      expect(approach!.strategy).toBe('divide_and_conquer')
      expect(approach!.feasibility).toBeGreaterThan(0)
    })

    it('should return null for missing sub-problem', () => {
      expect(engine.addApproach('missing', 'X', 'Y', 'iterative')).toBeNull()
    })

    it('should score approaches with more pros higher', () => {
      const p = engine.defineProblem('Test', 'Test')
      const subs = engine.decompose(p.id, [{ title: 'Sub', description: 'Sub' }])
      const good = engine.addApproach(
        subs[0].id,
        'Good',
        'Desc',
        'top_down',
        ['Pro1', 'Pro2', 'Pro3'],
        ['Con1'],
      )
      const bad = engine.addApproach(
        subs[0].id,
        'Bad',
        'Desc',
        'bottom_up',
        ['Pro1'],
        ['Con1', 'Con2', 'Con3'],
      )
      expect(good!.feasibility).toBeGreaterThan(bad!.feasibility)
    })

    it('should select approach', () => {
      const p = engine.defineProblem('Test', 'Test')
      const subs = engine.decompose(p.id, [{ title: 'Sub', description: 'Sub' }])
      const a1 = engine.addApproach(subs[0].id, 'A1', 'Desc', 'iterative')
      expect(engine.selectApproach(subs[0].id, a1!.id)).toBe(true)
    })

    it('should return false for invalid selection', () => {
      expect(engine.selectApproach('missing', 'missing')).toBe(false)
    })

    it('should respect max approaches per sub-problem', () => {
      const e = new ProblemDecomposer({ maxApproachesPerSubProblem: 2 })
      const p = e.defineProblem('T', 'T')
      const subs = e.decompose(p.id, [{ title: 'S', description: 'S' }])
      e.addApproach(subs[0].id, 'A1', 'D', 'iterative')
      e.addApproach(subs[0].id, 'A2', 'D', 'iterative')
      expect(e.addApproach(subs[0].id, 'A3', 'D', 'iterative')).toBeNull()
    })
  })

  describe('Dependency graph', () => {
    it('should build dependency graph', () => {
      const p = engine.defineProblem('Test', 'Test')
      const subs = engine.decompose(p.id, [
        { title: 'A', description: 'First' },
        { title: 'B', description: 'Second' },
      ])
      engine.decompose(p.id, [
        { title: 'C', description: 'Third', dependsOn: [subs[0].id, subs[1].id] },
      ])
      const graph = engine.buildDependencyGraph(p.id)
      expect(graph).not.toBeNull()
      expect(graph!.nodes.length).toBe(3)
      expect(graph!.edges.length).toBe(2)
      expect(graph!.hasCycles).toBe(false)
    })

    it('should compute topological order', () => {
      const p = engine.defineProblem('Test', 'Test')
      const subs = engine.decompose(p.id, [{ title: 'A', description: 'First' }])
      engine.decompose(p.id, [{ title: 'B', description: 'Second', dependsOn: [subs[0].id] }])
      const graph = engine.buildDependencyGraph(p.id)
      expect(graph!.topologicalOrder[0]).toBe(subs[0].id)
    })

    it('should return null for missing problem', () => {
      expect(engine.buildDependencyGraph('missing')).toBeNull()
    })

    it('should identify critical path', () => {
      const p = engine.defineProblem('Test', 'Test')
      engine.decompose(p.id, [
        { title: 'A', description: 'A' },
        { title: 'B', description: 'B' },
      ])
      const graph = engine.buildDependencyGraph(p.id)
      expect(graph!.criticalPath.length).toBeGreaterThan(0)
    })
  })

  describe('Solution synthesis', () => {
    it('should synthesize integrated solution', () => {
      const p = engine.defineProblem('Test', 'Build something')
      const subs = engine.decompose(p.id, [
        { title: 'A', description: 'First step' },
        { title: 'B', description: 'Second step' },
      ])
      engine.addApproach(subs[0].id, 'Approach A', 'Desc', 'top_down', ['Good'], [])
      engine.addApproach(subs[1].id, 'Approach B', 'Desc', 'bottom_up', ['Fast'], [])
      const solution = engine.synthesizeSolution(p.id)
      expect(solution).not.toBeNull()
      expect(solution!.executionOrder.length).toBe(2)
      expect(solution!.totalEffort).toBeGreaterThan(0)
    })

    it('should return null for missing problem', () => {
      expect(engine.synthesizeSolution('missing')).toBeNull()
    })

    it('should use selected approach when available', () => {
      const p = engine.defineProblem('Test', 'Test')
      const subs = engine.decompose(p.id, [{ title: 'S', description: 'S' }])
      const a1 = engine.addApproach(subs[0].id, 'Fallback', 'Desc', 'iterative', [], ['Bad'], 100)
      const a2 = engine.addApproach(subs[0].id, 'Selected', 'Desc', 'top_down', ['Good'], [], 4)
      engine.selectApproach(subs[0].id, a2!.id)
      const solution = engine.synthesizeSolution(p.id)
      expect(solution!.approaches.get(subs[0].id)).toBe(a2!.id)
    })
  })

  describe('Compare approaches', () => {
    it('should rank approaches by composite score', () => {
      const p = engine.defineProblem('Test', 'Test')
      const subs = engine.decompose(p.id, [{ title: 'S', description: 'S' }])
      engine.addApproach(subs[0].id, 'Good', 'D', 'top_down', ['Pro1', 'Pro2'], [], 4)
      engine.addApproach(subs[0].id, 'Bad', 'D', 'bottom_up', [], ['Con1', 'Con2'], 100)
      const comparison = engine.compareApproaches(subs[0].id)
      expect(comparison.length).toBe(2)
      expect(comparison[0].rank).toBe(1)
      expect(comparison[0].score).toBeGreaterThan(comparison[1].score)
    })

    it('should return empty for missing sub-problem', () => {
      expect(engine.compareApproaches('missing')).toEqual([])
    })
  })

  describe('Stats & serialization', () => {
    it('should track stats', () => {
      const p = engine.defineProblem('Test', 'Test')
      const subs = engine.decompose(p.id, [{ title: 'S', description: 'S' }])
      engine.addApproach(subs[0].id, 'A', 'D', 'iterative')
      engine.synthesizeSolution(p.id)
      engine.provideFeedback()
      const stats = engine.getStats()
      expect(stats.totalProblems).toBe(1)
      expect(stats.totalSubProblems).toBe(1)
      expect(stats.totalApproaches).toBe(1)
      expect(stats.totalSolutions).toBe(1)
      expect(stats.feedbackCount).toBe(1)
    })

    it('should compute avg sub-problems per problem', () => {
      const p1 = engine.defineProblem('P1', 'Test')
      engine.decompose(p1.id, [
        { title: 'A', description: 'A' },
        { title: 'B', description: 'B' },
      ])
      const p2 = engine.defineProblem('P2', 'Test')
      engine.decompose(p2.id, [{ title: 'C', description: 'C' }])
      const stats = engine.getStats()
      expect(stats.avgSubProblemsPerProblem).toBeCloseTo(1.5)
    })

    it('should serialize and deserialize', () => {
      const p = engine.defineProblem('Test', 'Test')
      engine.decompose(p.id, [{ title: 'Sub', description: 'Sub' }])
      const json = engine.serialize()
      const restored = ProblemDecomposer.deserialize(json)
      expect(restored.getStats().totalProblems).toBe(1)
      expect(restored.getStats().totalSubProblems).toBe(1)
    })
  })
})
