/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Metaprogramming & Code Generation Knowledge — Tests            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Metaprogramming', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should match reflection and compile-time metaprogramming keywords', async () => {
      const r = await brain.chat(
        'explain runtime reflection java reflect python inspect compile time metaprogramming rust macro c++ template lisp macro',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(
        /reflection|inspect|rust\s+macro|template|metaprogramming/,
      )
    })

    it('should match AST manipulation and code generation keywords', async () => {
      const r = await brain.chat(
        'explain ast manipulation babel plugin typescript compiler api roslyn code generation scaffolding yeoman plop template engine',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/ast|babel|typescript\s+compiler|roslyn|scaffold|yeoman/)
    })

    it('should match AOP and decorators keywords', async () => {
      const r = await brain.chat(
        'explain aspect oriented programming aop cross cutting concern spring aop decorator annotation python decorator java annotation typescript decorator',
      )
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/aspect.oriented|aop|cross.cutting|decorator|annotation/)
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Metaprogramming & Code Generation with domain languages', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Metaprogramming & Code Generation')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('languages')
    })

    it('should have >=5 connected sub-concepts including Runtime Reflection and Compile-Time Metaprogramming', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Metaprogramming & Code Generation')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Runtime Reflection & Introspection')
      expect(names).toContain('Compile-Time Metaprogramming')
    })

    it('should relate Runtime Reflection & Introspection to AST Manipulation & Transforms', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Runtime Reflection & Introspection')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('AST Manipulation & Transforms')
    })
  })
})
