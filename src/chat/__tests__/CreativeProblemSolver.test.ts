import { describe, it, expect, beforeEach } from 'vitest'
import { CreativeProblemSolver } from '../CreativeProblemSolver.js'

describe('CreativeProblemSolver', () => {
  let solver: CreativeProblemSolver

  beforeEach(() => {
    solver = new CreativeProblemSolver()
  })

  const sampleProblem = {
    description: 'Our web application has slow page load times',
    constraints: ['Limited budget', 'Must maintain backwards compatibility'],
    domain: 'software',
    desiredOutcome: 'Reduce page load time to under 2 seconds',
  }

  describe('Main Solver', () => {
    it('should generate multiple creative solutions', () => {
      const solutions = solver.solve(sampleProblem)
      expect(solutions.length).toBeGreaterThan(0)
    })

    it('should score solutions', () => {
      const solutions = solver.solve(sampleProblem)
      for (const sol of solutions) {
        expect(sol.overallScore).toBeGreaterThanOrEqual(0)
        expect(sol.overallScore).toBeLessThanOrEqual(1)
      }
    })

    it('should sort by overall score', () => {
      const solutions = solver.solve(sampleProblem)
      for (let i = 1; i < solutions.length; i++) {
        expect(solutions[i - 1]!.overallScore).toBeGreaterThanOrEqual(solutions[i]!.overallScore)
      }
    })

    it('should include multiple methods', () => {
      const solutions = solver.solve(sampleProblem)
      const methods = new Set(solutions.map(s => s.method))
      expect(methods.size).toBeGreaterThan(1)
    })
  })

  describe('SCAMPER', () => {
    it('should generate SCAMPER solutions for all 7 actions', () => {
      const solutions = solver.applySCAMPER(sampleProblem)
      expect(solutions.length).toBe(7)
      const methods = solutions.every(s => s.method === 'scamper')
      expect(methods).toBe(true)
    })

    it('should get SCAMPER prompts', () => {
      const prompts = solver.getSCAMPERPrompts('substitute')
      expect(prompts.length).toBeGreaterThan(0)
    })

    it('should cover all SCAMPER actions', () => {
      const solutions = solver.applySCAMPER(sampleProblem)
      const ideas = solutions.map(s => s.idea.toLowerCase())
      expect(ideas.some(i => i.includes('substitute'))).toBe(true)
      expect(ideas.some(i => i.includes('combine'))).toBe(true)
      expect(ideas.some(i => i.includes('eliminate'))).toBe(true)
      expect(ideas.some(i => i.includes('reverse'))).toBe(true)
    })
  })

  describe('Constraint Relaxation', () => {
    it('should generate solutions by relaxing constraints', () => {
      const solutions = solver.relaxConstraints(sampleProblem)
      expect(solutions.length).toBe(sampleProblem.constraints.length)
    })

    it('should reference the relaxed constraint', () => {
      const solutions = solver.relaxConstraints(sampleProblem)
      expect(solutions[0]!.idea).toContain(sampleProblem.constraints[0])
    })

    it('should return empty for no constraints', () => {
      const problem = { ...sampleProblem, constraints: [] }
      const solutions = solver.relaxConstraints(problem)
      expect(solutions.length).toBe(0)
    })
  })

  describe('Analogy Generator', () => {
    it('should find analogies for software domain', () => {
      const analogies = solver.findAnalogies('software', 'performance optimization')
      expect(analogies.length).toBeGreaterThan(0)
    })

    it('should find analogies for data domain', () => {
      const analogies = solver.findAnalogies('data', 'data pipeline optimization')
      expect(analogies.length).toBeGreaterThan(0)
    })

    it('should find cross-domain analogies for unknown domain', () => {
      const analogies = solver.findAnalogies('quantum_physics', 'entanglement')
      expect(analogies.length).toBeGreaterThan(0)
    })

    it('should include source and target domains', () => {
      const analogies = solver.findAnalogies('software', 'architecture')
      expect(analogies[0]!.sourceDomain.length).toBeGreaterThan(0)
      expect(analogies[0]!.targetDomain).toBe('software')
    })
  })

  describe('First Principles', () => {
    it('should analyze problem to first principles', () => {
      const analysis = solver.analyzeFirstPrinciples(sampleProblem)
      expect(analysis.fundamentalTruths.length).toBeGreaterThan(0)
      expect(analysis.assumptions.length).toBeGreaterThan(0)
      expect(analysis.derivedInsights.length).toBeGreaterThan(0)
      expect(analysis.newApproach.length).toBeGreaterThan(0)
    })

    it('should identify assumptions from constraints', () => {
      const analysis = solver.analyzeFirstPrinciples(sampleProblem)
      expect(analysis.assumptions.some(a => a.includes('Limited budget'))).toBe(true)
    })
  })

  describe('Reverse Engineering', () => {
    it('should work backwards from desired outcome', () => {
      const solution = solver.reverseEngineer(sampleProblem)
      expect(solution.method).toBe('reverse_engineering')
      expect(solution.idea).toContain(sampleProblem.desiredOutcome)
    })

    it('should have reasonable scores', () => {
      const solution = solver.reverseEngineer(sampleProblem)
      expect(solution.feasibility).toBeGreaterThan(0)
      expect(solution.applicability).toBeGreaterThan(0)
    })
  })

  describe('Brainstorming', () => {
    it('should generate multiple ideas', () => {
      const ideas = solver.brainstorm('slow database queries', 5)
      expect(ideas.length).toBe(5)
    })

    it('should include the topic in ideas', () => {
      const ideas = solver.brainstorm('code review process')
      for (const idea of ideas) {
        expect(idea).toContain('code review process')
      }
    })

    it('should respect count limit', () => {
      const ideas = solver.brainstorm('testing', 3)
      expect(ideas.length).toBe(3)
    })
  })

  describe('Innovation Scoring', () => {
    it('should score a relevant solution higher', () => {
      const score = solver.scoreSolution(
        'Optimize page load with caching and CDN to reduce load time',
        sampleProblem,
      )
      expect(score.overall).toBeGreaterThan(0)
      expect(score.feasibility).toBeGreaterThan(0)
    })

    it('should give higher novelty to unique solutions', () => {
      const conventional = solver.scoreSolution('Fix the slow page load times', sampleProblem)
      const novel = solver.scoreSolution(
        'Use quantum computing to teleport data instantly',
        sampleProblem,
      )
      expect(novel.novelty).toBeGreaterThan(conventional.novelty)
    })

    it('should score between 0 and 1', () => {
      const score = solver.scoreSolution('Any solution', sampleProblem)
      expect(score.overall).toBeGreaterThanOrEqual(0)
      expect(score.overall).toBeLessThanOrEqual(1)
    })
  })

  describe('History', () => {
    it('should track solution history', () => {
      solver.solve(sampleProblem)
      expect(solver.getHistoryCount()).toBeGreaterThan(0)
    })

    it('should reset state', () => {
      solver.solve(sampleProblem)
      solver.reset()
      expect(solver.getHistoryCount()).toBe(0)
    })
  })
})
