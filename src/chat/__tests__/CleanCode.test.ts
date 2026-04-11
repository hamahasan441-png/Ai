/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Clean Code Principles Knowledge — Tests                        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('CleanCode', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match naming conventions and function design keywords', async () => {
      const r = await brain.chat(
        'explain naming conventions meaningful names avoid abbreviations domain language function design single responsibility small functions pure functions minimal parameters',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /naming|meaningful|abbreviation|domain|function\s+design|single\s+responsibility|pure\s+function|parameter/,
      )
    })

    it('should match error handling and code organization keywords', async () => {
      const r = await brain.chat(
        'explain error handling patterns fail fast error types hierarchy result pattern code organization cohesion coupling package by feature layered screaming architecture',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /error\s+handling|fail\s+fast|result\s+pattern|cohesion|coupling|package.by.feature|layered|screaming/,
      )
    })

    it('should match comments documentation and testing pyramid keywords', async () => {
      const r = await brain.chat(
        'explain self documenting code when to comment jsdoc tsdoc readme driven development testing pyramid unit integration e2e contract acceptance testing trophy',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /self.documenting|comment|jsdoc|tsdoc|readme|testing\s+pyramid|unit|integration|e2e|trophy/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Clean Code Principles with domain practices', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Clean Code Principles')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('practices')
    })

    it('should have >=5 connected sub-concepts including Naming Conventions & Vocabulary and Function Design & Purity', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Clean Code Principles')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Naming Conventions & Vocabulary')
      expect(names).toContain('Function Design & Purity')
    })

    it('should relate Naming Conventions & Vocabulary to Function Design & Purity', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Naming Conventions & Vocabulary')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Function Design & Purity')
    })
  })
})
