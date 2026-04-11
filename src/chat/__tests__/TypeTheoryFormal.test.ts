import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('TypeTheoryFormal', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entry tests', () => {
    it('should respond to type theory and model checking queries', async () => {
      const response = await brain.chat(
        'explain type theory dependent type linear type refinement model checking temporal logic ltl ctl spin nusmv theorem prover coq',
      )
      expect(response.text.length).toBeGreaterThan(50)
      expect(response.text.toLowerCase()).toMatch(
        /type\s+theory|dependent|model\s+checking|temporal|theorem|coq/,
      )
    })

    it('should respond to formal verification and contracts queries', async () => {
      const response = await brain.chat(
        'explain formal verification program correctness safety liveness abstract interpretation design by contract precondition postcondition invariant',
      )
      expect(response.text.length).toBeGreaterThan(50)
      expect(response.text.toLowerCase()).toMatch(
        /formal\s+verification|correctness|abstract\s+interpretation|contract|precondition/,
      )
    })
  })

  describe('Semantic concept tests', () => {
    it('should have concept Type Theory & Formal Methods with domain concept', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Type Theory & Formal Methods')
      expect(concept).toBeDefined()
      expect(concept!.domain).toBe('concept')
    })

    it('should have at least 5 connected sub-concepts including Dependent Types and Model Checking', () => {
      const graph = createProgrammingKnowledgeGraph()
      const concept = graph.findConceptByName('Type Theory & Formal Methods')
      expect(concept).toBeDefined()
      const related = graph.findRelated(concept!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
      const names = related.map(r => r.name)
      expect(names).toContain('Dependent Types')
      expect(names).toContain('Model Checking')
    })

    it('should relate Model Checking to Formal Verification', () => {
      const graph = createProgrammingKnowledgeGraph()
      const node = graph.findConceptByName('Model Checking')
      expect(node).toBeDefined()
      const related = graph.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Formal Verification')
    })
  })
})
