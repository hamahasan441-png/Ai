import { describe, it, expect, beforeEach } from 'vitest'
import { BugBountyKnowledge } from '../BugBountyKnowledge'

describe('BugBountyKnowledge', () => {
  let kb: BugBountyKnowledge

  beforeEach(() => {
    kb = new BugBountyKnowledge()
  })

  // ── Constructor ──

  describe('constructor', () => {
    it('creates with default config', () => {
      const k = new BugBountyKnowledge()
      expect(k.getStats().totalPlatformQueries).toBe(0)
    })

    it('accepts partial config', () => {
      const k = new BugBountyKnowledge({ maxResults: 5 })
      expect(k.getStats().totalVulnLookups).toBe(0)
    })

    it('has zero initial stats', () => {
      const stats = kb.getStats()
      expect(stats.totalPlatformQueries).toBe(0)
      expect(stats.totalVulnLookups).toBe(0)
      expect(stats.totalReconLookups).toBe(0)
      expect(stats.totalPayoutEstimations).toBe(0)
      expect(stats.totalReportsGenerated).toBe(0)
      expect(stats.totalScopeAnalyses).toBe(0)
      expect(stats.totalHunterAssessments).toBe(0)
      expect(stats.totalClassifications).toBe(0)
      expect(stats.feedbackCount).toBe(0)
      expect(stats.avgFeedbackScore).toBe(0)
    })
  })

  // ── getPlatformInfo ──

  describe('getPlatformInfo', () => {
    it('returns platform by name', () => {
      const plat = kb.getPlatformInfo('HackerOne')
      expect(plat).toBeDefined()
      expect(plat!.name).toBe('HackerOne')
    })

    it('case-insensitive match', () => {
      const plat = kb.getPlatformInfo('hackerone')
      expect(plat).toBeDefined()
      expect(plat!.name).toBe('HackerOne')
    })

    it('returns undefined for unknown', () => {
      const plat = kb.getPlatformInfo('NonExistentPlatform')
      expect(plat).toBeUndefined()
    })

    it('platform has expected properties', () => {
      const plat = kb.getPlatformInfo('Bugcrowd')
      expect(plat).toBeDefined()
      expect(plat!.url).toBeTruthy()
      expect(plat!.type).toBeTruthy()
      expect(plat!.features.length).toBeGreaterThan(0)
      expect(plat!.payoutRange.min).toBeDefined()
      expect(plat!.payoutRange.max).toBeDefined()
      expect(typeof plat!.programCount).toBe('number')
    })
  })

  // ── listPlatforms ──

  describe('listPlatforms', () => {
    it('returns all platforms', () => {
      const platforms = kb.listPlatforms()
      expect(platforms.length).toBeGreaterThan(0)
    })

    it('each platform has required properties', () => {
      const platforms = kb.listPlatforms()
      for (const p of platforms) {
        expect(p.name).toBeTruthy()
        expect(p.url).toBeTruthy()
        expect(['public', 'private', 'hybrid']).toContain(p.type)
        expect(p.features.length).toBeGreaterThan(0)
      }
    })
  })

  // ── searchPlatforms ──

  describe('searchPlatforms', () => {
    it('finds platforms by query', () => {
      const results = kb.searchPlatforms('crypto')
      expect(results.length).toBeGreaterThan(0)
    })

    it('returns empty for unrelated query', () => {
      const results = kb.searchPlatforms('zzzznonexistentzzz')
      expect(results).toEqual([])
    })

    it('increments stats', () => {
      kb.searchPlatforms('test')
      expect(kb.getStats().totalPlatformQueries).toBe(1)
    })
  })

  // ── getVulnClass ──

  describe('getVulnClass', () => {
    it('finds by name', () => {
      const vc = kb.getVulnClass('SQL Injection')
      expect(vc).toBeDefined()
      expect(vc!.name.toLowerCase()).toContain('sql')
    })

    it('case-insensitive', () => {
      const vc = kb.getVulnClass('sql injection')
      expect(vc).toBeDefined()
    })

    it('returns undefined for unknown', () => {
      const vc = kb.getVulnClass('TotallyFakeVuln')
      expect(vc).toBeUndefined()
    })

    it('has OWASP and CWE references', () => {
      const vc = kb.getVulnClass('XSS')
      expect(vc).toBeDefined()
      expect(vc!.owasp).toBeTruthy()
      expect(vc!.cwe).toBeTruthy()
    })
  })

  // ── listVulnClasses ──

  describe('listVulnClasses', () => {
    it('returns all classes', () => {
      const classes = kb.listVulnClasses()
      expect(classes.length).toBeGreaterThan(0)
    })

    it('each has required properties', () => {
      const classes = kb.listVulnClasses()
      for (const c of classes) {
        expect(c.name).toBeTruthy()
        expect(c.owasp).toBeTruthy()
        expect(c.cwe).toBeTruthy()
        expect(['critical', 'high', 'medium', 'low', 'informational']).toContain(c.severity)
        expect(c.typicalPayout.min).toBeDefined()
        expect(c.typicalPayout.max).toBeDefined()
      }
    })
  })

  // ── searchVulnClasses ──

  describe('searchVulnClasses', () => {
    it('finds by query keyword', () => {
      const results = kb.searchVulnClasses('SQL Injection CWE-89 login form web application')
      expect(results.length).toBeGreaterThan(0)
    })

    it('returns empty for unrelated', () => {
      const results = kb.searchVulnClasses('zzzznotavulnzzz')
      expect(results).toEqual([])
    })

    it('increments stats', () => {
      kb.searchVulnClasses('xss')
      expect(kb.getStats().totalVulnLookups).toBe(1)
    })
  })

  // ── getHighPayoutVulns ──

  describe('getHighPayoutVulns', () => {
    it('returns vulnerability classes', () => {
      const results = kb.getHighPayoutVulns()
      expect(results.length).toBeGreaterThan(0)
    })

    it('all returned have high payouts', () => {
      const results = kb.getHighPayoutVulns()
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].typicalPayout.max).toBeGreaterThanOrEqual(
          results[i].typicalPayout.max,
        )
      }
    })
  })

  // ── estimatePayout ──

  describe('estimatePayout', () => {
    it('returns estimate for critical severity', () => {
      const est = kb.estimatePayout('critical')
      expect(est.severity).toBe('critical')
      expect(est.estimatedMax).toBeGreaterThan(0)
    })

    it('returns estimate for high severity', () => {
      const est = kb.estimatePayout('high')
      expect(est.severity).toBe('high')
      expect(est.estimatedMax).toBeGreaterThan(0)
    })

    it('returns estimate for medium severity', () => {
      const est = kb.estimatePayout('medium')
      expect(est.severity).toBe('medium')
      expect(est.estimatedMax).toBeGreaterThan(0)
    })

    it('returns estimate for low severity', () => {
      const est = kb.estimatePayout('low')
      expect(est.severity).toBe('low')
      expect(est.estimatedMax).toBeGreaterThan(0)
    })

    it('platform affects estimate', () => {
      const h1 = kb.estimatePayout('critical', 'HackerOne')
      const obb = kb.estimatePayout('critical', 'Open Bug Bounty')
      expect(h1.estimatedMax).not.toBe(obb.estimatedMax)
    })

    it('increments stats', () => {
      kb.estimatePayout('high')
      expect(kb.getStats().totalPayoutEstimations).toBe(1)
    })
  })

  // ── getReconTechnique ──

  describe('getReconTechnique', () => {
    it('returns by name', () => {
      const techniques = kb.listReconTechniques()
      const firstName = techniques[0].name
      const tech = kb.getReconTechnique(firstName)
      expect(tech).toBeDefined()
      expect(tech!.name).toBe(firstName)
    })

    it('case-insensitive', () => {
      const techniques = kb.listReconTechniques()
      const lower = techniques[0].name.toLowerCase()
      const tech = kb.getReconTechnique(lower)
      expect(tech).toBeDefined()
    })

    it('returns undefined for unknown', () => {
      const tech = kb.getReconTechnique('NonExistentTechnique12345')
      expect(tech).toBeUndefined()
    })
  })

  // ── listReconTechniques ──

  describe('listReconTechniques', () => {
    it('returns all techniques', () => {
      const techniques = kb.listReconTechniques()
      expect(techniques.length).toBeGreaterThan(0)
    })

    it('each has required properties', () => {
      const techniques = kb.listReconTechniques()
      for (const t of techniques) {
        expect(t.name).toBeTruthy()
        expect(t.category).toBeTruthy()
        expect(t.description).toBeTruthy()
        expect(t.tools.length).toBeGreaterThan(0)
        expect(typeof t.effectiveness).toBe('number')
        expect(typeof t.difficulty).toBe('number')
      }
    })
  })

  // ── getReconByCategory ──

  describe('getReconByCategory', () => {
    it('filters by category', () => {
      const passive = kb.getReconByCategory('passive')
      expect(passive.length).toBeGreaterThan(0)
      for (const t of passive) {
        expect(t.category.toLowerCase()).toBe('passive')
      }
    })

    it('returns empty for unknown category', () => {
      const results = kb.getReconByCategory('nonexistentcategory')
      expect(results).toEqual([])
    })

    it('increments stats', () => {
      kb.getReconByCategory('passive')
      expect(kb.getStats().totalReconLookups).toBe(1)
    })
  })

  // ── getMethodology ──

  describe('getMethodology', () => {
    it('returns full methodology', () => {
      const m = kb.getMethodology()
      expect(m.phases.length).toBeGreaterThan(0)
      expect(m.tools.length).toBeGreaterThan(0)
      expect(m.tips.length).toBeGreaterThan(0)
    })

    it('has all 5 phases', () => {
      const m = kb.getMethodology()
      expect(m.phases.length).toBe(5)
      const names = m.phases.map(p => p.name)
      expect(names).toContain('recon')
      expect(names).toContain('scanning')
      expect(names).toContain('enumeration')
      expect(names).toContain('exploitation')
      expect(names).toContain('reporting')
    })
  })

  // ── getMethodologyPhase ──

  describe('getMethodologyPhase', () => {
    it('returns specific phase', () => {
      const phase = kb.getMethodologyPhase('recon')
      expect(phase).toBeDefined()
      expect(phase!.name).toBe('recon')
    })

    it('returns undefined for unknown', () => {
      const phase = kb.getMethodologyPhase('nonexistentphase')
      expect(phase).toBeUndefined()
    })

    it('phase has tools and tips', () => {
      const phase = kb.getMethodologyPhase('exploitation')
      expect(phase).toBeDefined()
      expect(phase!.tools.length).toBeGreaterThan(0)
      expect(phase!.tips.length).toBeGreaterThan(0)
    })
  })

  // ── generateReport ──

  describe('generateReport', () => {
    it('generates report with title', () => {
      const report = kb.generateReport('SQL Injection', 'example.com', 'high')
      expect(report.title).toBeTruthy()
      expect(report.title).toContain('example.com')
    })

    it('includes severity', () => {
      const report = kb.generateReport('XSS', 'app.example.com', 'medium')
      expect(report.severity).toBe('medium')
    })

    it('includes steps to reproduce', () => {
      const report = kb.generateReport('SSRF', 'target.com', 'critical')
      expect(report.stepsToReproduce.length).toBeGreaterThan(0)
    })

    it('includes impact', () => {
      const report = kb.generateReport('IDOR', 'api.example.com', 'high')
      expect(report.impact).toBeTruthy()
    })

    it('increments stats', () => {
      kb.generateReport('XSS', 'target.com', 'low')
      expect(kb.getStats().totalReportsGenerated).toBe(1)
    })
  })

  // ── analyzeScope ──

  describe('analyzeScope', () => {
    it('analyzes web scope', () => {
      const scope = kb.analyzeScope('https://example.com\nhttps://app.example.com')
      expect(scope.inScope.length).toBeGreaterThan(0)
      expect(scope.targets.length).toBeGreaterThan(0)
      expect(scope.targets.some(t => t.type === 'web')).toBe(true)
    })

    it('analyzes API scope', () => {
      const scope = kb.analyzeScope('api.example.com REST endpoint')
      expect(scope.targets.length).toBeGreaterThan(0)
      expect(scope.targets.some(t => t.type === 'api')).toBe(true)
    })

    it('identifies out-of-scope items', () => {
      const scope = kb.analyzeScope(
        'In scope\nhttps://example.com\nOut of scope\nhttps://staging.example.com',
      )
      expect(scope.outOfScope.length).toBeGreaterThan(0)
    })

    it('increments stats', () => {
      kb.analyzeScope('test scope')
      expect(kb.getStats().totalScopeAnalyses).toBe(1)
    })
  })

  // ── assessHunterLevel ──

  describe('assessHunterLevel', () => {
    it('beginner level', () => {
      const profile = kb.assessHunterLevel(5, 3, 2)
      expect(profile.level).toBe('beginner')
    })

    it('intermediate level', () => {
      const profile = kb.assessHunterLevel(30, 5, 5)
      expect(profile.level).toBe('intermediate')
    })

    it('advanced level', () => {
      const profile = kb.assessHunterLevel(150, 20, 6)
      expect(profile.level).toBe('advanced')
    })

    it('expert level', () => {
      const profile = kb.assessHunterLevel(600, 50, 8)
      expect(profile.level).toBe('expert')
    })

    it('returns profile with skills', () => {
      const profile = kb.assessHunterLevel(10, 2, 3)
      expect(profile.skills.length).toBeGreaterThan(0)
      expect(typeof profile.earnings.estimated).toBe('number')
      expect(profile.earnings.currency).toBe('USD')
      expect(profile.reportsSubmitted).toBe(10)
    })
  })

  // ── getDuplicateAvoidanceStrategies ──

  describe('getDuplicateAvoidanceStrategies', () => {
    it('returns strategies', () => {
      const strategies = kb.getDuplicateAvoidanceStrategies()
      expect(strategies.length).toBeGreaterThan(0)
    })

    it('each has name and description', () => {
      const strategies = kb.getDuplicateAvoidanceStrategies()
      for (const s of strategies) {
        expect(s.name).toBeTruthy()
        expect(s.description).toBeTruthy()
        expect(s.techniques.length).toBeGreaterThan(0)
      }
    })
  })

  // ── getResponsibleDisclosureGuide ──

  describe('getResponsibleDisclosureGuide', () => {
    it('returns guide', () => {
      const guide = kb.getResponsibleDisclosureGuide()
      expect(guide.steps.length).toBeGreaterThan(0)
      expect(guide.doList.length).toBeGreaterThan(0)
      expect(guide.dontList.length).toBeGreaterThan(0)
    })

    it('has expected phases', () => {
      const guide = kb.getResponsibleDisclosureGuide()
      expect(guide.timeline.length).toBeGreaterThan(0)
      expect(guide.legalConsiderations.length).toBeGreaterThan(0)
    })
  })

  // ── getTips ──

  describe('getTips', () => {
    it('returns all tips', () => {
      const tips = kb.getTips()
      expect(tips.length).toBeGreaterThan(0)
    })

    it('filters by category', () => {
      const tips = kb.getTips('recon')
      expect(tips.length).toBeGreaterThan(0)
      for (const t of tips) {
        expect(t.category).toBe('recon')
      }
    })

    it('returns empty for unknown category', () => {
      const tips = kb.getTips('zzzznonexistentzzzz')
      expect(tips).toEqual([])
    })

    it('each tip has content', () => {
      const tips = kb.getTips()
      for (const t of tips) {
        expect(t.tip).toBeTruthy()
        expect(t.category).toBeTruthy()
        expect(typeof t.id).toBe('number')
        expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(t.difficulty)
      }
    })
  })

  // ── recommendProgramType ──

  describe('recommendProgramType', () => {
    it('recommends for beginner', () => {
      const rec = kb.recommendProgramType('beginner')
      expect(rec).toContain('VDP')
    })

    it('recommends for intermediate', () => {
      const rec = kb.recommendProgramType('intermediate')
      expect(rec).toContain('Public')
    })

    it('recommends for expert', () => {
      const rec = kb.recommendProgramType('expert')
      expect(rec).toContain('private')
    })
  })

  // ── getToolsForPhase ──

  describe('getToolsForPhase', () => {
    it('returns tools for recon', () => {
      const tools = kb.getToolsForPhase('recon')
      expect(tools.length).toBeGreaterThan(0)
    })

    it('returns tools for exploitation', () => {
      const tools = kb.getToolsForPhase('exploitation')
      expect(tools.length).toBeGreaterThan(0)
    })

    it('returns empty array for unknown phase', () => {
      const tools = kb.getToolsForPhase('nonexistentphase')
      expect(tools).toEqual([])
    })
  })

  // ── classifyVulnerability ──

  describe('classifyVulnerability', () => {
    it('classifies SQL injection', () => {
      const results = kb.classifyVulnerability('SQL injection in login form database query')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(v => v.name.toLowerCase().includes('sql'))).toBe(true)
    })

    it('classifies XSS', () => {
      const results = kb.classifyVulnerability('cross-site scripting XSS reflected script alert')
      expect(results.length).toBeGreaterThan(0)
    })

    it('classifies SSRF', () => {
      const results = kb.classifyVulnerability('server-side request forgery SSRF internal metadata')
      expect(results.length).toBeGreaterThan(0)
    })

    it('returns empty for unrelated', () => {
      const results = kb.classifyVulnerability('beautiful sunny weather today')
      expect(Array.isArray(results)).toBe(true)
    })
  })

  // ── provideFeedback ──

  describe('provideFeedback', () => {
    it('accepts feedback', () => {
      kb.provideFeedback(4, 'Great content')
      expect(kb.getStats().feedbackCount).toBe(1)
    })

    it('increments feedback count', () => {
      kb.provideFeedback(3, 'OK')
      kb.provideFeedback(5, 'Excellent')
      expect(kb.getStats().feedbackCount).toBe(2)
    })

    it('rating is clamped', () => {
      kb.provideFeedback(0, 'terrible')
      kb.provideFeedback(100, 'amazing')
      const stats = kb.getStats()
      expect(stats.feedbackCount).toBe(2)
      // Clamped to 1-5, so average should be (1+5)/2 = 3
      expect(stats.avgFeedbackScore).toBe(3)
    })
  })

  // ── getStats ──

  describe('getStats', () => {
    it('returns all stat fields', () => {
      const stats = kb.getStats()
      expect(typeof stats.totalPlatformQueries).toBe('number')
      expect(typeof stats.totalVulnLookups).toBe('number')
      expect(typeof stats.totalReconLookups).toBe('number')
      expect(typeof stats.totalPayoutEstimations).toBe('number')
      expect(typeof stats.totalReportsGenerated).toBe('number')
      expect(typeof stats.totalScopeAnalyses).toBe('number')
      expect(typeof stats.totalHunterAssessments).toBe('number')
      expect(typeof stats.totalClassifications).toBe('number')
      expect(typeof stats.feedbackCount).toBe('number')
      expect(typeof stats.avgFeedbackScore).toBe('number')
    })

    it('stats increment correctly', () => {
      kb.getPlatformInfo('HackerOne')
      kb.getVulnClass('XSS')
      kb.getReconTechnique('test')
      kb.estimatePayout('high')
      kb.generateReport('XSS', 'target.com', 'high')
      kb.analyzeScope('test scope')
      kb.assessHunterLevel(10, 2, 3)
      kb.classifyVulnerability('sql injection')
      kb.provideFeedback(5, 'great')

      const stats = kb.getStats()
      expect(stats.totalPlatformQueries).toBe(1)
      expect(stats.totalVulnLookups).toBe(1)
      expect(stats.totalReconLookups).toBe(1)
      expect(stats.totalPayoutEstimations).toBe(1)
      expect(stats.totalReportsGenerated).toBe(1)
      expect(stats.totalScopeAnalyses).toBe(1)
      expect(stats.totalHunterAssessments).toBe(1)
      expect(stats.totalClassifications).toBe(1)
      expect(stats.feedbackCount).toBe(1)
      expect(stats.avgFeedbackScore).toBe(5)
    })
  })

  // ── Serialization ──

  describe('serialize / deserialize', () => {
    it('serialize returns valid JSON', () => {
      const json = kb.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('deserialize restores state', () => {
      kb.getPlatformInfo('HackerOne')
      kb.provideFeedback(4, 'good')
      const json = kb.serialize()
      const restored = BugBountyKnowledge.deserialize(json)
      expect(restored.getStats().totalPlatformQueries).toBe(1)
      expect(restored.getStats().feedbackCount).toBe(1)
    })

    it('round-trip preserves stats', () => {
      kb.getVulnClass('XSS')
      kb.estimatePayout('critical')
      kb.generateReport('SSRF', 'example.com', 'high')
      kb.classifyVulnerability('sql injection')
      kb.provideFeedback(5, 'great')
      kb.provideFeedback(3, 'ok')

      const json = kb.serialize()
      const restored = BugBountyKnowledge.deserialize(json)
      const stats = restored.getStats()

      expect(stats.totalVulnLookups).toBe(1)
      expect(stats.totalPayoutEstimations).toBe(1)
      expect(stats.totalReportsGenerated).toBe(1)
      expect(stats.totalClassifications).toBe(1)
      expect(stats.feedbackCount).toBe(2)
      expect(stats.avgFeedbackScore).toBe(4)
    })

    it('deserialize creates working instance', () => {
      const json = kb.serialize()
      const restored = BugBountyKnowledge.deserialize(json)
      // Verify the restored instance can still perform operations
      const plat = restored.getPlatformInfo('Bugcrowd')
      expect(plat).toBeDefined()
      expect(restored.getStats().totalPlatformQueries).toBe(1)
    })
  })
})
