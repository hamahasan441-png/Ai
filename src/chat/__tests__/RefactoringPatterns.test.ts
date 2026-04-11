/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Refactoring & Code Smells Knowledge — Tests                    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('RefactoringPatterns', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match code smells and refactoring techniques keywords', async () => {
      const r = await brain.chat(
        'explain code smell long method god class feature envy refactoring technique extract method extract class move method',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /code\s+smell|long\s+method|god\s+class|extract\s+(method|class)|refactoring/,
      )
    })

    it('should match legacy code and technical debt keywords', async () => {
      const r = await brain.chat(
        'explain legacy code characterization test strangler fig branch by abstraction technical debt management debt quadrant impact effort',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /legacy\s+code|strangler\s+fig|characterization|technical\s+debt|debt\s+quadrant/,
      )
    })

    it('should match SOLID principles and anti-patterns keywords', async () => {
      const r = await brain.chat(
        'explain solid principle srp ocp lsp isp dip anti pattern spaghetti code golden hammer premature optimization cargo cult',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /solid|srp|ocp|spaghetti|golden\s+hammer|premature\s+optimization|cargo\s+cult/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Refactoring & Code Smells with domain engineering', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Refactoring & Code Smells')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('engineering')
    })

    it('should have >=5 connected sub-concepts including Code Smells Catalog and Refactoring Techniques', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Refactoring & Code Smells')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Code Smells Catalog')
      expect(names).toContain('Refactoring Techniques')
    })

    it('should relate Code Smells Catalog to Refactoring Techniques', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Code Smells Catalog')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Refactoring Techniques')
    })
  })
})
