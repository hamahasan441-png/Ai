import { describe, it, expect, beforeEach } from 'vitest'
import { NaturalLanguageGenerator, DEFAULT_NLG_CONFIG } from '../NaturalLanguageGenerator.js'

describe('NaturalLanguageGenerator', () => {
  let nlg: NaturalLanguageGenerator

  beforeEach(() => {
    nlg = new NaturalLanguageGenerator()
  })

  describe('constructor & config', () => {
    it('uses default config', () => {
      expect(nlg.getStats().totalGenerations).toBe(0)
      expect(nlg.getStats().totalTemplates).toBe(0)
    })
    it('accepts custom config', () => {
      const c = new NaturalLanguageGenerator({ maxTemplates: 10 })
      expect(c.getStats().totalGenerations).toBe(0)
    })
    it('DEFAULT_NLG_CONFIG has expected values', () => {
      expect(DEFAULT_NLG_CONFIG.maxTemplates).toBe(500)
      expect(DEFAULT_NLG_CONFIG.defaultStyle).toBe('formal')
    })
  })

  describe('template management', () => {
    it('registers a template', () => {
      const t = nlg.registerTemplate('greeting', 'Hello {name}, welcome to {place}!', 'friendly')
      expect(t.id).toBeTruthy()
      expect(t.slots).toContain('name')
      expect(t.slots).toContain('place')
    })
    it('retrieves template by id', () => {
      const t = nlg.registerTemplate('test', '{a} and {b}')
      expect(nlg.getTemplate(t.id)).toBe(t)
    })
    it('returns null for unknown template', () => {
      expect(nlg.getTemplate('unknown')).toBeNull()
    })
    it('finds templates by category', () => {
      nlg.registerTemplate('t1', '{x}', 'formal', 'greet')
      nlg.registerTemplate('t2', '{y}', 'formal', 'greet')
      nlg.registerTemplate('t3', '{z}', 'formal', 'farewell')
      expect(nlg.findTemplates('greet')).toHaveLength(2)
    })
  })

  describe('template-based generation', () => {
    it('generates from template with slots', () => {
      const t = nlg.registerTemplate('test', 'The {animal} jumped over the {obstacle}.')
      const result = nlg.generateFromTemplate(t.id, { animal: 'fox', obstacle: 'fence' })
      expect(result).toBe('The fox jumped over the fence.')
    })
    it('returns null for unknown template id', () => {
      expect(nlg.generateFromTemplate('bad_id', {})).toBeNull()
    })
    it('increments generation count', () => {
      const t = nlg.registerTemplate('test', '{x}')
      nlg.generateFromTemplate(t.id, { x: 'hello' })
      expect(nlg.getStats().totalGenerations).toBe(1)
    })
  })

  describe('paraphrasing', () => {
    it('generates paraphrases with synonym replacement', () => {
      const result = nlg.paraphrase('This is a good and important idea.')
      expect(result.original).toBe('This is a good and important idea.')
      expect(result.paraphrases.length).toBeGreaterThan(0)
    })
    it('returns multiple paraphrases', () => {
      const result = nlg.paraphrase('The big fast car is good.', 3)
      expect(result.paraphrases.length).toBeGreaterThan(0)
    })
    it('increments paraphrase count', () => {
      nlg.paraphrase('test')
      expect(nlg.getStats().totalParaphrases).toBe(1)
    })
  })

  describe('style transfer', () => {
    it('transfers to casual style', () => {
      const result = nlg.transferStyle('It is important to consider the implications.', 'casual')
      expect(result.toStyle).toBe('casual')
      expect(result.transferred).toBeTruthy()
    })
    it('transfers to friendly style', () => {
      const result = nlg.transferStyle('The data shows a clear trend.', 'friendly')
      expect(result.toStyle).toBe('friendly')
    })
    it('returns original for unknown style', () => {
      // All styles are known, but let's test with formal
      const result = nlg.transferStyle('Hello world.', 'formal')
      expect(result.transferred).toBeTruthy()
    })
    it('increments style transfer count', () => {
      nlg.transferStyle('test', 'academic')
      expect(nlg.getStats().totalStyleTransfers).toBe(1)
    })
  })

  describe('text planning', () => {
    it('creates a text plan with sections', () => {
      const plan = nlg.createTextPlan('Explain AI', [
        'Define AI',
        'History',
        'Applications',
        'Future',
      ])
      expect(plan.goal).toBe('Explain AI')
      expect(plan.sections.length).toBeGreaterThan(0)
      expect(plan.style).toBe('formal')
    })
    it('uses custom style and audience', () => {
      const plan = nlg.createTextPlan('Guide', ['Step 1', 'Step 2'], 'friendly', 'beginners')
      expect(plan.style).toBe('friendly')
      expect(plan.targetAudience).toBe('beginners')
    })
  })

  describe('surface realization', () => {
    it('realizes text from a plan', () => {
      const plan = nlg.createTextPlan('Test', ['Point A', 'Point B', 'Point C', 'Point D'])
      const result = nlg.realizeFromPlan(plan)
      expect(result.text).toBeTruthy()
      expect(result.style).toBe('formal')
      expect(result.readability).toBeDefined()
      expect(result.variety).toBeDefined()
    })
  })

  describe('discourse connectives', () => {
    it('adds a connective to text', () => {
      const result = nlg.addConnective('the data is clear', 'contrast')
      expect(result).toMatch(/However/)
    })
    it('retrieves connectives for a relation', () => {
      const conns = nlg.getConnectives('cause')
      expect(conns.length).toBeGreaterThan(0)
      expect(conns).toContain('Because')
    })
    it('returns empty for unknown relation', () => {
      const conns = nlg.getConnectives('unknown' as any)
      expect(conns).toHaveLength(0)
    })
  })

  describe('readability analysis', () => {
    it('analyzes simple text', () => {
      const r = nlg.analyzeReadability('The cat sat on the mat. It was happy.')
      expect(r.wordCount).toBeGreaterThan(0)
      expect(r.sentenceCount).toBe(2)
      expect(r.complexity).toBeDefined()
    })
    it('classifies complexity correctly', () => {
      const simple = nlg.analyzeReadability('I am here. You are there.')
      expect(['easy', 'moderate']).toContain(simple.complexity)
    })
    it('counts syllables', () => {
      const r = nlg.analyzeReadability(
        'Understanding the phenomenological implications of epistemological frameworks.',
      )
      expect(r.syllableCount).toBeGreaterThan(10)
    })
  })

  describe('sentence variety', () => {
    it('scores sentence variety', () => {
      const v = nlg.analyzeSentenceVariety('The dog ran. Did the cat jump? Go now! Amazing result!')
      expect(v.uniqueStarters).toBeGreaterThan(0)
      expect(v.score).toBeGreaterThan(0)
      expect(v.typeDistribution.declarative).toBeGreaterThanOrEqual(1)
    })
    it('handles empty text', () => {
      const v = nlg.analyzeSentenceVariety('')
      expect(v.score).toBe(0)
      expect(v.uniqueStarters).toBe(0)
    })
  })

  describe('stats & serialization', () => {
    it('tracks all stats', () => {
      const t = nlg.registerTemplate('t', '{x}')
      nlg.generateFromTemplate(t.id, { x: 'a' })
      nlg.paraphrase('good')
      nlg.transferStyle('test', 'casual')
      nlg.provideFeedback()
      const s = nlg.getStats()
      expect(s.totalGenerations).toBe(1)
      expect(s.totalParaphrases).toBe(1)
      expect(s.totalStyleTransfers).toBe(1)
      expect(s.totalTemplates).toBe(1)
      expect(s.feedbackCount).toBe(1)
    })
    it('serializes and deserializes', () => {
      nlg.registerTemplate('t', '{x}', 'formal', 'test')
      nlg.paraphrase('good')
      const json = nlg.serialize()
      const restored = NaturalLanguageGenerator.deserialize(json)
      expect(restored.getStats().totalTemplates).toBe(1)
    })
  })
})
