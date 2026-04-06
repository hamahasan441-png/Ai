import { describe, it, expect, beforeAll } from 'vitest'
import { LocalBrain } from '../LocalBrain'
import { createProgrammingKnowledgeGraph } from '../SemanticMemory'

describe('Testing & QA Engineering Knowledge', () => {
  let brain: LocalBrain

  beforeAll(() => {
    brain = new LocalBrain({ enableIntelligence: true })
  })

  describe('KB entries', () => {
    it('answers about unit testing frameworks like Jest and Vitest', async () => {
      const r = await brain.chat('Tell me about unit testing framework jest vitest mocha for test driven development tdd')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/test|jest|vitest|tdd|unit/)
    })

    it('answers about mocking and test doubles', async () => {
      const r = await brain.chat('How do mock stub spy test double dependency work in testing?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/mock|stub|spy|test\s*double|sinon/)
    })

    it('answers about BDD and Cucumber', async () => {
      const r = await brain.chat('Explain behavior driven development bdd cucumber gherkin acceptance testing')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/bdd|cucumber|gherkin|given|when|then|behavior/)
    })

    it('answers about code coverage and mutation testing', async () => {
      const r = await brain.chat('What is code coverage istanbul nyc branch statement and mutation testing stryker?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/coverage|mutation|istanbul|stryker|branch/)
    })

    it('answers about performance and load testing', async () => {
      const r = await brain.chat('How does performance testing load stress jmeter k6 api testing postman work?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/performance|load|stress|k6|jmeter|test|api/)
    })

    it('answers about test pyramid and CI strategy', async () => {
      const r = await brain.chat('What is the test pyramid strategy and continuous testing ci cd pipeline?')
      expect(r.text.length).toBeGreaterThan(50)
      expect(r.text.toLowerCase()).toMatch(/pyramid|ci|test|strategy|integration/)
    })
  })

  describe('Semantic concepts', () => {
    it('has Testing & QA Engineering root concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Testing & QA Engineering')
      expect(node).toBeDefined()
      expect(node!.domain).toBe('testing')
    })

    it('has Unit Testing Frameworks concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Unit Testing Frameworks')
      expect(node).toBeDefined()
    })

    it('has Test Doubles & Mocking concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Test Doubles & Mocking')
      expect(node).toBeDefined()
    })

    it('has Test Quality Metrics concept', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Test Quality Metrics')
      expect(node).toBeDefined()
    })

    it('Testing & QA has related concepts', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Testing & QA Engineering')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      expect(related.length).toBeGreaterThanOrEqual(5)
    })

    it('Unit Testing is related to Test Doubles', () => {
      const mem = createProgrammingKnowledgeGraph()
      const node = mem.findConceptByName('Unit Testing Frameworks')
      expect(node).toBeDefined()
      const related = mem.findRelated(node!.id, undefined, 30)
      const names = related.map(r => r.name)
      expect(names).toContain('Test Doubles & Mocking')
    })
  })
})
