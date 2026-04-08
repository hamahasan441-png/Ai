import { describe, it, expect, beforeEach } from 'vitest'
import { AnalyticalReasoner, DEFAULT_ANALYTICAL_REASONER_CONFIG } from '../AnalyticalReasoner.js'

describe('AnalyticalReasoner', () => {
  let engine: AnalyticalReasoner

  beforeEach(() => {
    engine = new AnalyticalReasoner()
  })

  describe('Configuration', () => {
    it('should use default config', () => {
      expect(DEFAULT_ANALYTICAL_REASONER_CONFIG.maxAnalyses).toBe(500)
      expect(DEFAULT_ANALYTICAL_REASONER_CONFIG.enableRecommendations).toBe(true)
    })

    it('should accept custom config', () => {
      const e = new AnalyticalReasoner({ maxAnalyses: 10 })
      expect(e).toBeInstanceOf(AnalyticalReasoner)
    })
  })

  describe('SWOT analysis', () => {
    it('should create SWOT analysis', () => {
      const result = engine.swot('Startup X', {
        strengths: ['Innovative technology', 'Strong team'],
        weaknesses: ['Limited funding'],
        opportunities: ['Growing market'],
        threats: ['Big competitors'],
      })
      expect(result.framework).toBe('swot')
      expect(result.strengths.length).toBe(2)
      expect(result.weaknesses.length).toBe(1)
    })

    it('should generate recommendations', () => {
      const result = engine.swot('Company', {
        strengths: ['Tech lead'],
        weaknesses: ['Small team'],
        opportunities: ['AI market'],
        threats: ['Regulation'],
      })
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('should assess favorable position', () => {
      const result = engine.swot('Good Co', {
        strengths: ['A', 'B', 'C'],
        weaknesses: ['X'],
        opportunities: ['D'],
        threats: [],
      })
      expect(result.overallAssessment).toContain('favorable')
    })

    it('should assess challenging position', () => {
      const result = engine.swot('Struggling Co', {
        strengths: ['A'],
        weaknesses: ['X', 'Y'],
        opportunities: [],
        threats: ['Z', 'W'],
      })
      expect(result.overallAssessment).toContain('challenges')
    })

    it('should handle empty SWOT', () => {
      const result = engine.swot('Empty', {})
      expect(result.strengths.length).toBe(0)
      expect(result.overallAssessment).toContain('balanced')
    })
  })

  describe('Five-Why analysis', () => {
    it('should build why chain', () => {
      const result = engine.fiveWhy('Server crashed', [
        'Memory overflow',
        'Memory leak in module X',
        'No cleanup on disconnect',
        'Missing event handler',
        'Incomplete code review',
      ])
      expect(result.framework).toBe('five_why')
      expect(result.whyChain.length).toBe(5)
      expect(result.rootCause).toBe('Incomplete code review')
    })

    it('should handle fewer than 5 whys', () => {
      const result = engine.fiveWhy('Bug', ['Code error', 'Missing test'])
      expect(result.whyChain.length).toBe(2)
      expect(result.rootCause).toBe('Missing test')
    })

    it('should generate suggested fixes', () => {
      const result = engine.fiveWhy('Issue', ['Root cause found'])
      expect(result.suggestedFixes.length).toBeGreaterThan(0)
    })
  })

  describe('Fishbone analysis', () => {
    it('should create fishbone diagram', () => {
      const result = engine.fishbone('Production defects', [
        { name: 'People', causes: ['Insufficient training', 'Fatigue'] },
        { name: 'Process', causes: ['No QA step'] },
        { name: 'Equipment', causes: ['Old machines', 'Poor calibration', 'Missing tools'] },
      ])
      expect(result.framework).toBe('fishbone')
      expect(result.categories.length).toBe(3)
      expect(result.primaryCause).toContain('Equipment')
    })

    it('should handle empty categories', () => {
      const result = engine.fishbone('Issue', [])
      expect(result.primaryCause).toBe('Unknown')
    })
  })

  describe('PEST analysis', () => {
    it('should create PEST analysis', () => {
      const result = engine.pest('Tech Industry', {
        political: [{ description: 'Data privacy laws', impact: 'negative', significance: 0.8 }],
        economic: [{ description: 'Digital economy growth', impact: 'positive', significance: 0.9 }],
        social: [{ description: 'Remote work trend', impact: 'positive', significance: 0.7 }],
        technological: [{ description: 'AI advancement', impact: 'positive', significance: 0.95 }],
      })
      expect(result.framework).toBe('pest')
      expect(result.summary).toContain('favorable')
    })

    it('should detect challenging environment', () => {
      const result = engine.pest('Coal Industry', {
        political: [{ description: 'Carbon tax', impact: 'negative', significance: 0.9 }],
        economic: [{ description: 'Declining demand', impact: 'negative', significance: 0.8 }],
        social: [{ description: 'Environmental awareness', impact: 'negative', significance: 0.7 }],
        technological: [{ description: 'Renewable energy', impact: 'negative', significance: 0.9 }],
      })
      expect(result.summary).toContain('challenges')
    })

    it('should handle empty PEST', () => {
      const result = engine.pest('Unknown', {})
      expect(result.political.length).toBe(0)
    })
  })

  describe('Porter Five Forces', () => {
    it('should analyze five forces', () => {
      const result = engine.porter('Cloud Computing', {
        rivalry: { level: 'high', factors: ['AWS, Azure, GCP'] },
        supplierPower: { level: 'low', factors: ['Commodity hardware'] },
        buyerPower: { level: 'moderate', factors: ['Switching costs'] },
        substitutes: { level: 'low', factors: ['On-premises declining'] },
        newEntrants: { level: 'low', factors: ['High capital required'] },
      })
      expect(result.framework).toBe('porter')
      expect(result.competitiveRivalry.level).toBe('high')
      expect(result.overallAttractiveness).toBeGreaterThan(0)
    })

    it('should use defaults for missing forces', () => {
      const result = engine.porter('Unknown Industry', {})
      expect(result.competitiveRivalry.level).toBe('moderate')
      expect(result.overallAttractiveness).toBeCloseTo(0.5)
    })

    it('should compute attractiveness inversely to forces', () => {
      const highForces = engine.porter('Tough', {
        rivalry: { level: 'high' },
        supplierPower: { level: 'high' },
        buyerPower: { level: 'high' },
        substitutes: { level: 'high' },
        newEntrants: { level: 'high' },
      })
      const lowForces = engine.porter('Easy', {
        rivalry: { level: 'low' },
        supplierPower: { level: 'low' },
        buyerPower: { level: 'low' },
        substitutes: { level: 'low' },
        newEntrants: { level: 'low' },
      })
      expect(lowForces.overallAttractiveness).toBeGreaterThan(highForces.overallAttractiveness)
    })
  })

  describe('Decision Matrix', () => {
    it('should evaluate options', () => {
      const result = engine.decisionMatrix(
        'Best framework?',
        [{ name: 'performance', weight: 0.4 }, { name: 'ease', weight: 0.3 }, { name: 'ecosystem', weight: 0.3 }],
        [
          { name: 'React', scores: { performance: 8, ease: 7, ecosystem: 9 } },
          { name: 'Vue', scores: { performance: 7, ease: 9, ecosystem: 7 } },
          { name: 'Svelte', scores: { performance: 9, ease: 8, ecosystem: 5 } },
        ]
      )
      expect(result.framework).toBe('decision_matrix')
      expect(result.winner).toBeDefined()
      expect(result.winnerScore).toBeGreaterThan(0)
      expect(result.options.length).toBe(3)
    })

    it('should pick highest scoring option', () => {
      const result = engine.decisionMatrix(
        'Pick A vs B',
        [{ name: 'quality', weight: 1.0 }],
        [
          { name: 'A', scores: { quality: 10 } },
          { name: 'B', scores: { quality: 5 } },
        ]
      )
      expect(result.winner).toBe('A')
    })
  })

  describe('Cost-Benefit Analysis', () => {
    it('should compute positive ROI', () => {
      const result = engine.costBenefit(
        'Upgrade servers',
        [{ description: 'Hardware', value: 10000 }, { description: 'Labor', value: 5000 }],
        [{ description: 'Performance gain', value: 25000 }, { description: 'Reduced downtime', value: 5000 }]
      )
      expect(result.framework).toBe('cost_benefit')
      expect(result.roi).toBeGreaterThan(0)
      expect(result.netBenefit).toBeGreaterThan(0)
      expect(result.recommendation).toContain('proceed')
    })

    it('should compute negative ROI', () => {
      const result = engine.costBenefit(
        'Expensive change',
        [{ description: 'Cost', value: 100000 }],
        [{ description: 'Minor benefit', value: 5000 }]
      )
      expect(result.roi).toBeLessThan(0)
      expect(result.recommendation).toContain('Not recommended')
    })

    it('should respect confidence levels', () => {
      const result = engine.costBenefit(
        'Test',
        [{ description: 'Cost', value: 1000, confidence: 0.5 }],
        [{ description: 'Benefit', value: 1000, confidence: 1.0 }]
      )
      expect(result.totalBenefit).toBeGreaterThan(result.totalCost)
    })
  })

  describe('Framework recommendation', () => {
    it('should recommend SWOT for strength-related questions', () => {
      expect(engine.recommendFramework('What are our strengths and weaknesses?')).toBe('swot')
    })

    it('should recommend five_why for root cause', () => {
      expect(engine.recommendFramework('Why does this keep happening?')).toBe('five_why')
    })

    it('should recommend fishbone for cause analysis', () => {
      expect(engine.recommendFramework('What are the causes of this problem?')).toBe('fishbone')
    })

    it('should recommend pest for macro factors', () => {
      expect(engine.recommendFramework('How do political and economic factors affect us?')).toBe('pest')
    })

    it('should recommend porter for competitive analysis', () => {
      expect(engine.recommendFramework('How competitive is the industry?')).toBe('porter')
    })

    it('should recommend decision_matrix for comparisons', () => {
      expect(engine.recommendFramework('How do we compare these options and select the best?')).toBe('decision_matrix')
    })

    it('should recommend cost_benefit for investment decisions', () => {
      expect(engine.recommendFramework('Is this investment worth it? What is the ROI?')).toBe('cost_benefit')
    })
  })

  describe('Stats & serialization', () => {
    it('should track stats per framework', () => {
      engine.swot('A', {})
      engine.fiveWhy('B', ['x'])
      engine.swot('C', {})
      engine.provideFeedback()
      const stats = engine.getStats()
      expect(stats.totalAnalyses).toBe(3)
      expect(stats.analysesByFramework.swot).toBe(2)
      expect(stats.analysesByFramework.five_why).toBe(1)
      expect(stats.feedbackCount).toBe(1)
    })

    it('should serialize and deserialize', () => {
      engine.swot('Test', { strengths: ['A'] })
      const json = engine.serialize()
      const restored = AnalyticalReasoner.deserialize(json)
      expect(restored.getStats().totalAnalyses).toBe(1)
    })
  })
})
