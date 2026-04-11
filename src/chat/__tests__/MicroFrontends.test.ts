/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Micro Frontends Knowledge — Tests                              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('MicroFrontends', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match module federation and composition keywords', async () => {
      const r = await brain.chat(
        'explain module federation webpack module federation import map dynamic remote micro frontend composition server side edge side client side',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /module\s+federation|import\s+map|micro\s+frontend|composition/,
      )
    })

    it('should match single-spa and web components keywords', async () => {
      const r = await brain.chat(
        'explain single spa framework parcel application root config lifecycle web component micro frontend shadow dom custom element slot',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /single.spa|parcel|shadow\s+dom|custom\s+element|web\s+component/,
      )
    })

    it('should match shared state and deployment keywords', async () => {
      const r = await brain.chat(
        'explain shared state management custom event pub sub micro frontend deployment independent deploy canary blue green versioning',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /shared\s+state|custom\s+event|pub.sub|independent\s+deploy|canary/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Micro Frontends Architecture with domain frontend', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Micro Frontends Architecture')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('frontend')
    })

    it('should have >=5 connected sub-concepts including Module Federation & Import Maps', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Micro Frontends Architecture')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Module Federation & Import Maps')
      expect(names).toContain('Micro Frontend Composition Patterns')
    })

    it('should relate Module Federation & Import Maps to Micro Frontend Composition Patterns', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Module Federation & Import Maps')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Micro Frontend Composition Patterns')
    })
  })
})
