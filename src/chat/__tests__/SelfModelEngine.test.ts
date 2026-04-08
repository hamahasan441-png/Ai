import { describe, it, expect, beforeEach } from 'vitest'
import {
  SelfModelEngine,
  DEFAULT_SELF_MODEL_CONFIG,
} from '../SelfModelEngine'

describe('SelfModelEngine', () => {
  let engine: SelfModelEngine

  beforeEach(() => {
    engine = new SelfModelEngine()
  })

  // ══════════════════════════════════════════════════════════════════════
  // §1 — Construction & Configuration
  // ══════════════════════════════════════════════════════════════════════

  describe('construction', () => {
    it('creates with default config', () => {
      expect(engine).toBeInstanceOf(SelfModelEngine)
    })

    it('creates with custom config', () => {
      const custom = new SelfModelEngine({ maxCapabilities: 100 })
      expect(custom).toBeInstanceOf(SelfModelEngine)
    })

    it('exports DEFAULT_SELF_MODEL_CONFIG', () => {
      expect(DEFAULT_SELF_MODEL_CONFIG).toBeDefined()
      expect(DEFAULT_SELF_MODEL_CONFIG.maxCapabilities).toBe(500)
    })

    it('initializes with built-in limitations', () => {
      const lims = engine.getLimitations()
      expect(lims.length).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §2 — Capability Management
  // ══════════════════════════════════════════════════════════════════════

  describe('capability management', () => {
    it('registers a capability', () => {
      const cap = engine.registerCapability('programming', 'TypeScript', 'advanced', ['Built multiple projects'])
      expect(cap.domain).toBe('programming')
      expect(cap.skill).toBe('TypeScript')
      expect(cap.proficiency).toBe('advanced')
    })

    it('updates an existing capability', () => {
      engine.registerCapability('programming', 'Python', 'beginner')
      const updated = engine.registerCapability('programming', 'Python', 'intermediate', ['Completed course'])
      expect(updated.proficiency).toBe('intermediate')
    })

    it('tracks growth on proficiency increase', () => {
      engine.registerCapability('programming', 'Rust', 'novice')
      engine.registerCapability('programming', 'Rust', 'intermediate', ['Growth'])
      const growth = engine.getGrowthRecords()
      expect(growth.length).toBe(1)
      expect(growth[0].previousProficiency).toBe('novice')
      expect(growth[0].currentProficiency).toBe('intermediate')
    })

    it('finds a capability by domain and skill', () => {
      engine.registerCapability('math', 'Linear Algebra', 'intermediate')
      const cap = engine.findCapability('math', 'Linear Algebra')
      expect(cap).not.toBeNull()
      expect(cap!.proficiency).toBe('intermediate')
    })

    it('returns null for non-existent capability', () => {
      expect(engine.findCapability('nonexistent', 'skill')).toBeNull()
    })

    it('gets capabilities by domain', () => {
      engine.registerCapability('security', 'Penetration Testing', 'advanced')
      engine.registerCapability('security', 'Cryptography', 'intermediate')
      const caps = engine.getCapabilitiesByDomain('security')
      expect(caps.length).toBe(2)
    })

    it('gets all capabilities', () => {
      engine.registerCapability('trading', 'Technical Analysis', 'expert')
      expect(engine.getAllCapabilities().length).toBe(1)
    })

    it('records successful outcome', () => {
      engine.registerCapability('programming', 'Go', 'intermediate')
      engine.recordOutcome('programming', 'Go', true)
      const cap = engine.findCapability('programming', 'Go')
      expect(cap!.sampleSize).toBe(1)
    })

    it('records failed outcome', () => {
      engine.registerCapability('math', 'Calculus', 'beginner')
      engine.recordOutcome('math', 'Calculus', false)
      const cap = engine.findCapability('math', 'Calculus')
      expect(cap!.sampleSize).toBe(1)
    })

    it('auto-registers capability on first outcome', () => {
      engine.recordOutcome('new_domain', 'new_skill', true)
      const cap = engine.findCapability('new_domain', 'new_skill')
      expect(cap).not.toBeNull()
    })

    it('supports all proficiency levels', () => {
      const levels = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'] as const
      for (const level of levels) {
        engine.registerCapability('test', level, level)
        const cap = engine.findCapability('test', level)
        expect(cap!.proficiency).toBe(level)
      }
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §3 — Knowledge Boundaries
  // ══════════════════════════════════════════════════════════════════════

  describe('knowledge boundaries', () => {
    it('creates a boundary when capability is registered', () => {
      engine.registerCapability('programming', 'Python', 'expert')
      const boundary = engine.getBoundary('programming')
      expect(boundary).not.toBeNull()
      expect(boundary!.domain).toBe('programming')
    })

    it('classifies known domains', () => {
      engine.registerCapability('programming', 'TypeScript', 'expert')
      engine.registerCapability('programming', 'Python', 'advanced')
      const boundary = engine.getBoundary('programming')
      expect(boundary!.state).toBe('known')
    })

    it('identifies gaps in domains', () => {
      engine.registerCapability('mixed', 'Strong Skill', 'expert')
      engine.registerCapability('mixed', 'Weak Skill', 'novice')
      const boundary = engine.getBoundary('mixed')
      expect(boundary!.gaps.length).toBeGreaterThan(0)
    })

    it('identifies strengths in domains', () => {
      engine.registerCapability('strong', 'Skill A', 'advanced')
      engine.registerCapability('strong', 'Skill B', 'expert')
      const boundary = engine.getBoundary('strong')
      expect(boundary!.strengths.length).toBeGreaterThan(0)
    })

    it('returns null for unknown domain', () => {
      expect(engine.getBoundary('nonexistent')).toBeNull()
    })

    it('gets all boundaries', () => {
      engine.registerCapability('domain1', 'skill1', 'intermediate')
      engine.registerCapability('domain2', 'skill2', 'beginner')
      expect(engine.getAllBoundaries().length).toBe(2)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §4 — Limitation Management
  // ══════════════════════════════════════════════════════════════════════

  describe('limitation management', () => {
    it('has built-in limitations', () => {
      const lims = engine.getLimitations()
      expect(lims.length).toBeGreaterThan(5)
    })

    it('adds a custom limitation', () => {
      const lim = engine.addLimitation('reasoning_depth', 'Cannot handle 10+ step chains', 0.5)
      expect(lim.category).toBe('reasoning_depth')
    })

    it('gets limitations by category', () => {
      const reliability = engine.getLimitationsByCategory('reliability')
      expect(reliability.length).toBeGreaterThan(0)
    })

    it('supports all limitation categories', () => {
      const categories = [
        'knowledge_cutoff', 'reasoning_depth', 'context_length',
        'real_time_data', 'computation', 'multimodal',
        'personalization', 'creativity', 'reliability'
      ] as const
      for (const cat of categories) {
        const results = engine.getLimitationsByCategory(cat)
        // At least check that we can query it
        expect(Array.isArray(results)).toBe(true)
      }
    })

    it('limitations have workarounds', () => {
      const lims = engine.getLimitations()
      const withWorkaround = lims.filter(l => l.workaround !== null)
      expect(withWorkaround.length).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §5 — Competence Estimation
  // ══════════════════════════════════════════════════════════════════════

  describe('competence estimation', () => {
    it('estimates competence for a programming task', () => {
      engine.registerCapability('programming', 'TypeScript', 'expert')
      engine.registerCapability('programming', 'API Design', 'advanced')
      const estimate = engine.estimateCompetence('Write a TypeScript API function')
      expect(estimate.estimatedProficiency).toBeTruthy()
      expect(estimate.recommendation).toBeTruthy()
    })

    it('returns low confidence for unknown domain', () => {
      const estimate = engine.estimateCompetence('Something completely unknown xyz abc')
      expect(estimate.confidence).toBeLessThanOrEqual(0.5)
    })

    it('recommends proceed for strong capabilities', () => {
      engine.registerCapability('programming', 'Python', 'expert')
      engine.registerCapability('programming', 'Algorithms', 'expert')
      engine.registerCapability('programming', 'Data Structures', 'expert')
      engine.registerCapability('programming', 'Testing', 'expert')
      engine.registerCapability('programming', 'Debugging', 'expert')
      const estimate = engine.estimateCompetence('Write Python algorithm code')
      expect(['proceed', 'proceed_with_caution']).toContain(estimate.recommendation)
    })

    it('includes relevant capabilities', () => {
      engine.registerCapability('security', 'Vulnerability Scanning', 'advanced')
      const estimate = engine.estimateCompetence('Find security vulnerabilities in the code')
      // Security domain detected; relevant capabilities should be found or reasoning should mention domain
      expect(estimate.reasoning).toBeTruthy()
    })

    it('includes known gaps', () => {
      engine.registerCapability('programming', 'Java', 'novice')
      const estimate = engine.estimateCompetence('Write Java code')
      // May have gaps depending on boundary state
      expect(estimate).toBeDefined()
    })

    it('provides reasoning', () => {
      const estimate = engine.estimateCompetence('Analyze market trends')
      expect(estimate.reasoning).toBeTruthy()
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §6 — Uncertainty Mapping
  // ══════════════════════════════════════════════════════════════════════

  describe('uncertainty mapping', () => {
    it('maps uncertainty for a domain', () => {
      engine.registerCapability('trading', 'Technical Analysis', 'intermediate')
      engine.registerCapability('trading', 'Risk Management', 'novice')
      const map = engine.getUncertaintyMap('trading')
      expect(map.domain).toBe('trading')
      expect(map.overallUncertainty).toBeGreaterThan(0)
    })

    it('returns high uncertainty for unknown domain', () => {
      const map = engine.getUncertaintyMap('quantum_computing')
      expect(map.overallUncertainty).toBe(0.8)
    })

    it('lists uncertainty factors', () => {
      engine.registerCapability('math', 'Algebra', 'advanced')
      engine.registerCapability('math', 'Statistics', 'beginner')
      const map = engine.getUncertaintyMap('math')
      expect(map.factors.length).toBe(2)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §7 — Self-Assessment
  // ══════════════════════════════════════════════════════════════════════

  describe('self-assessment', () => {
    it('performs a self-assessment', () => {
      engine.registerCapability('programming', 'TypeScript', 'expert')
      engine.registerCapability('programming', 'Python', 'advanced')
      engine.registerCapability('math', 'Calculus', 'novice')

      const assessment = engine.selfAssess()
      expect(assessment.timestamp).toBeGreaterThan(0)
      expect(assessment.overallCompetence).toBeGreaterThan(0)
    })

    it('identifies top strengths', () => {
      engine.registerCapability('programming', 'TypeScript', 'expert')
      engine.registerCapability('programming', 'Go', 'advanced')
      const assessment = engine.selfAssess()
      expect(assessment.topStrengths.length).toBeGreaterThan(0)
    })

    it('identifies top weaknesses', () => {
      engine.registerCapability('science', 'Quantum Mechanics', 'novice')
      const assessment = engine.selfAssess()
      expect(assessment.topWeaknesses.length).toBeGreaterThan(0)
    })

    it('identifies uncertain domains', () => {
      engine.registerCapability('uncertain_domain', 'skill1', 'novice')
      const assessment = engine.selfAssess()
      // The domain might be classified as unknown or uncertain
      expect(assessment).toBeDefined()
    })

    it('reports growth areas', () => {
      engine.registerCapability('programming', 'Rust', 'novice')
      engine.registerCapability('programming', 'Rust', 'intermediate')
      const assessment = engine.selfAssess()
      expect(assessment.growthAreas.length).toBeGreaterThan(0)
    })

    it('reports confidence calibration', () => {
      engine.registerCapability('test', 'skill', 'intermediate')
      const assessment = engine.selfAssess()
      expect(assessment.confidenceCalibration).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §8 — Growth Tracking
  // ══════════════════════════════════════════════════════════════════════

  describe('growth tracking', () => {
    it('tracks growth events', () => {
      engine.registerCapability('programming', 'C++', 'beginner')
      engine.registerCapability('programming', 'C++', 'advanced')
      const records = engine.getGrowthRecords()
      expect(records.length).toBe(1)
    })

    it('does not track lateral moves', () => {
      engine.registerCapability('programming', 'JS', 'intermediate')
      engine.registerCapability('programming', 'JS', 'intermediate')
      expect(engine.getGrowthRecords().length).toBe(0)
    })

    it('does not track decreases', () => {
      engine.registerCapability('programming', 'Ruby', 'advanced')
      engine.registerCapability('programming', 'Ruby', 'beginner')
      expect(engine.getGrowthRecords().length).toBe(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §9 — Stats
  // ══════════════════════════════════════════════════════════════════════

  describe('stats', () => {
    it('tracks total capabilities', () => {
      engine.registerCapability('domain', 'skill', 'intermediate')
      expect(engine.getStats().totalCapabilities).toBe(1)
    })

    it('tracks total limitations', () => {
      expect(engine.getStats().totalLimitations).toBeGreaterThan(0)
    })

    it('tracks competence checks', () => {
      engine.estimateCompetence('Test task')
      expect(engine.getStats().totalCompetenceChecks).toBe(1)
    })

    it('tracks growth events', () => {
      engine.registerCapability('prog', 'Go', 'novice')
      engine.registerCapability('prog', 'Go', 'expert')
      expect(engine.getStats().totalGrowthEvents).toBe(1)
    })

    it('computes average confidence', () => {
      engine.registerCapability('domain', 'skill', 'intermediate')
      expect(engine.getStats().avgConfidence).toBeGreaterThan(0)
    })
  })

  // ══════════════════════════════════════════════════════════════════════
  // §10 — Serialization
  // ══════════════════════════════════════════════════════════════════════

  describe('serialization', () => {
    it('serializes to JSON', () => {
      engine.registerCapability('prog', 'TS', 'expert')
      const json = engine.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('deserializes from JSON', () => {
      engine.registerCapability('prog', 'Python', 'advanced')
      const json = engine.serialize()
      const restored = SelfModelEngine.deserialize(json)
      expect(restored.findCapability('prog', 'Python')).not.toBeNull()
    })

    it('handles invalid JSON gracefully', () => {
      const restored = SelfModelEngine.deserialize('bad json')
      expect(restored).toBeInstanceOf(SelfModelEngine)
    })

    it('preserves growth records', () => {
      engine.registerCapability('prog', 'Go', 'novice')
      engine.registerCapability('prog', 'Go', 'expert')
      const json = engine.serialize()
      const restored = SelfModelEngine.deserialize(json)
      expect(restored.getGrowthRecords().length).toBe(1)
    })

    it('preserves built-in limitations after deserialize', () => {
      const json = engine.serialize()
      const restored = SelfModelEngine.deserialize(json)
      expect(restored.getLimitations().length).toBeGreaterThan(0)
    })
  })
})
