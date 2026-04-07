/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Code Review Best Practices Knowledge — Tests                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('CodeReviewPractices', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match review checklist and techniques keywords', async () => {
      const r = await brain.chat('explain review checklist correctness readability performance security tests review techniques line by line architecture review nitpick blocking')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/review\s+checklist|correctness|readability|performance|security|line.by.line|architecture|nitpick|blocking/)
    })

    it('should match feedback and common review issues keywords', async () => {
      const r = await brain.chat('explain giving feedback constructive criticism praise asking questions suggesting alternatives common review issues magic numbers poor naming race conditions')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/feedback|constructive|criticism|praise|magic\s+number|naming|race\s+condition/)
    })

    it('should match automated review tools and PR strategies keywords', async () => {
      const r = await brain.chat('explain automated review tools linters static analysis sonarqube codeclimate codacy pr strategies small prs stacked prs draft prs merge strategies')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/automated|linter|static\s+analysis|sonarqube|codeclimate|pr\s+strateg|small|stacked|draft|merge/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Code Review Best Practices with domain practices', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Code Review Best Practices')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('practices')
    })

    it('should have >=5 connected sub-concepts including Review Checklist & Criteria and Review Techniques & Approaches', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Code Review Best Practices')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Review Checklist & Criteria')
      expect(names).toContain('Review Techniques & Approaches')
    })

    it('should relate Review Checklist & Criteria to Review Techniques & Approaches', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Review Checklist & Criteria')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Review Techniques & Approaches')
    })
  })
})
