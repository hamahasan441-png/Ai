import { describe, it, expect, beforeEach } from 'vitest'
import { LogicalProofEngine } from '../LogicalProofEngine.js'

describe('LogicalProofEngine', () => {
  let engine: LogicalProofEngine

  beforeEach(() => {
    engine = new LogicalProofEngine()
  })

  describe('Propositional Logic Evaluation', () => {
    it('should evaluate AND', () => {
      expect(engine.evaluate('A AND B', { A: true, B: true })).toBe(true)
      expect(engine.evaluate('A AND B', { A: true, B: false })).toBe(false)
    })

    it('should evaluate OR', () => {
      expect(engine.evaluate('A OR B', { A: false, B: true })).toBe(true)
      expect(engine.evaluate('A OR B', { A: false, B: false })).toBe(false)
    })

    it('should evaluate NOT', () => {
      expect(engine.evaluate('NOT A', { A: true })).toBe(false)
      expect(engine.evaluate('NOT A', { A: false })).toBe(true)
    })

    it('should evaluate IMPLIES', () => {
      expect(engine.evaluate('A IMPLIES B', { A: true, B: true })).toBe(true)
      expect(engine.evaluate('A IMPLIES B', { A: true, B: false })).toBe(false)
      expect(engine.evaluate('A IMPLIES B', { A: false, B: false })).toBe(true)
    })

    it('should handle direct true/false', () => {
      expect(engine.evaluate('true AND true')).toBe(true)
      expect(engine.evaluate('true AND false')).toBe(false)
    })

    it('should evaluate complex expressions', () => {
      expect(engine.evaluate('(A OR B) AND C', { A: true, B: false, C: true })).toBe(true)
    })
  })

  describe('Truth Table Generation', () => {
    it('should generate truth table for AND', () => {
      const table = engine.generateTruthTable('A AND B', ['A', 'B'])
      expect(table.length).toBe(4) // 2^2
      // Only true when both are true
      const trueRows = table.filter(r => r.result)
      expect(trueRows.length).toBe(1)
    })

    it('should generate truth table for OR', () => {
      const table = engine.generateTruthTable('A OR B', ['A', 'B'])
      const trueRows = table.filter(r => r.result)
      expect(trueRows.length).toBe(3)
    })

    it('should handle single variable', () => {
      const table = engine.generateTruthTable('NOT A', ['A'])
      expect(table.length).toBe(2)
    })

    it('should generate 8 rows for 3 variables', () => {
      const table = engine.generateTruthTable('A AND B AND C', ['A', 'B', 'C'])
      expect(table.length).toBe(8)
    })
  })

  describe('Syllogism Validation', () => {
    it('should validate valid syllogism', () => {
      const result = engine.validateSyllogism({
        majorPremise: 'All humans are mortal',
        minorPremise: 'Socrates is a human',
        conclusion: 'Socrates is mortal',
      })
      expect(result.isValid).toBe(true)
    })

    it('should reject invalid conclusion with new terms', () => {
      const result = engine.validateSyllogism({
        majorPremise: 'All cats are animals',
        minorPremise: 'All dogs are animals',
        conclusion: 'All cats are dogs',
      })
      // "dogs" is not in major premise, "cats" is not in minor
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should detect illicit major (universal from particular)', () => {
      const result = engine.validateSyllogism({
        majorPremise: 'Some programmers know Python',
        minorPremise: 'Some Python users are data scientists',
        conclusion: 'All programmers are data scientists',
      })
      expect(result.isValid).toBe(false)
    })
  })

  describe('Fallacy Detection', () => {
    it('should detect ad hominem', () => {
      const result = engine.detectFallacies("You are stupid, so your argument is invalid")
      expect(result.hasFallacy).toBe(true)
      expect(result.fallacies.some(f => f.name === 'Ad Hominem')).toBe(true)
    })

    it('should detect straw man', () => {
      const result = engine.detectFallacies("So you're saying that we should never test our code?")
      expect(result.hasFallacy).toBe(true)
      expect(result.fallacies.some(f => f.name === 'Straw Man')).toBe(true)
    })

    it('should detect false dilemma', () => {
      const result = engine.detectFallacies("Either you use TypeScript or you write buggy code")
      expect(result.hasFallacy).toBe(true)
      expect(result.fallacies.some(f => f.name === 'False Dilemma')).toBe(true)
    })

    it('should detect slippery slope', () => {
      const result = engine.detectFallacies("If we allow one exception, soon everyone will want one")
      expect(result.hasFallacy).toBe(true)
    })

    it('should detect hasty generalization', () => {
      const result = engine.detectFallacies("All developers always write bugs")
      expect(result.hasFallacy).toBe(true)
      expect(result.fallacies.some(f => f.name === 'Hasty Generalization')).toBe(true)
    })

    it('should not flag clean logical argument', () => {
      const result = engine.detectFallacies("If the tests pass and the code review is approved, we should deploy")
      expect(result.hasFallacy).toBe(false)
    })

    it('should include evidence in fallacy results', () => {
      const result = engine.detectFallacies("You are an idiot for thinking that")
      if (result.hasFallacy) {
        expect(result.fallacies[0]!.evidence.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Argument Construction', () => {
    it('should construct valid argument', () => {
      const result = engine.constructArgument(
        ['All programmers write code', 'Alice is a programmer'],
        'Alice writes code'
      )
      expect(result.isValid).toBe(true)
      expect(result.logicalForm).toBe('deductive')
    })

    it('should detect inductive reasoning', () => {
      const result = engine.constructArgument(
        ['Most frameworks have bugs', 'React is a framework'],
        'React probably has bugs'
      )
      expect(result.logicalForm).toBe('inductive')
    })

    it('should include intermediate steps', () => {
      const result = engine.constructArgument(
        ['Premise 1', 'Premise 2', 'Premise 3'],
        'Conclusion'
      )
      expect(result.intermediateSteps.length).toBeGreaterThan(0)
    })
  })

  describe('Contradiction Detection', () => {
    it('should detect direct contradiction', () => {
      const result = engine.detectContradictions([
        'The sky is blue',
        'The sky is not blue',
      ])
      expect(result.hasContradiction).toBe(true)
    })

    it('should detect quantifier contradiction', () => {
      const result = engine.detectContradictions([
        'All birds can fly',
        'No birds can fly',
      ])
      expect(result.hasContradiction).toBe(true)
    })

    it('should not flag non-contradictory statements', () => {
      const result = engine.detectContradictions([
        'React is fast',
        'Vue is lightweight',
      ])
      expect(result.hasContradiction).toBe(false)
    })
  })

  describe('Modus Ponens', () => {
    it('should apply modus ponens', () => {
      const result = engine.modusPonens(
        'If it rains then the ground gets wet',
        'it rains'
      )
      expect(result.valid).toBe(true)
      expect(result.conclusion).toContain('wet')
    })

    it('should reject when antecedent doesn\'t match', () => {
      const result = engine.modusPonens(
        'If it rains then the ground gets wet',
        'it is sunny'
      )
      expect(result.valid).toBe(false)
    })
  })

  describe('Modus Tollens', () => {
    it('should apply modus tollens', () => {
      const result = engine.modusTollens(
        'If it rains then the ground gets wet',
        'The ground is not wet'
      )
      expect(result.valid).toBe(true)
      expect(result.conclusion.toLowerCase()).toContain('not')
    })

    it('should reject invalid modus tollens', () => {
      const result = engine.modusTollens(
        'If it rains then the ground gets wet',
        'The sky is clear'
      )
      expect(result.valid).toBe(false)
    })
  })
})
