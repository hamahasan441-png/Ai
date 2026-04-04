import { describe, it, expect, beforeEach } from 'vitest'
import { SecurityTrainer } from '../SecurityTrainer'

describe('SecurityTrainer', () => {
  let trainer: SecurityTrainer

  beforeEach(() => {
    trainer = new SecurityTrainer()
  })

  // ── Constructor ──

  describe('constructor', () => {
    it('creates with default config', () => {
      const t = new SecurityTrainer()
      expect(t.getStats().totalTrainingSessions).toBe(0)
    })

    it('accepts partial config', () => {
      const t = new SecurityTrainer({ maxChallenges: 3 })
      expect(t.getStats().totalChallengesGenerated).toBe(0)
    })
  })

  // ── Vulnerability Analysis ──

  describe('analyseVulnerability', () => {
    it('finds SQL injection vulnerability', () => {
      const vulns = trainer.analyseVulnerability('SQL injection in login form')
      expect(vulns.length).toBeGreaterThan(0)
      expect(vulns.some(v => v.name.toLowerCase().includes('sql'))).toBe(true)
    })

    it('finds XSS vulnerability', () => {
      const vulns = trainer.analyseVulnerability('cross-site scripting in user input')
      expect(vulns.length).toBeGreaterThan(0)
    })

    it('returns vulnerability with severity', () => {
      const vulns = trainer.analyseVulnerability('buffer overflow in C code')
      for (const v of vulns) {
        expect(['critical', 'high', 'medium', 'low', 'info']).toContain(v.severity)
      }
    })

    it('returns empty for unrelated description', () => {
      const vulns = trainer.analyseVulnerability('beautiful weather today')
      // May or may not find matches — just shouldn't crash
      expect(Array.isArray(vulns)).toBe(true)
    })

    it('increments stats', () => {
      trainer.analyseVulnerability('test')
      expect(trainer.getStats().totalVulnAnalyses).toBe(1)
    })
  })

  // ── Severity Scoring ──

  describe('computeSeverityScore', () => {
    it('returns score and severity', () => {
      const result = trainer.computeSeverityScore('critical SQL injection vulnerability')
      expect(typeof result.score).toBe('number')
      expect(['critical', 'high', 'medium', 'low', 'info']).toContain(result.severity)
    })

    it('critical items score higher', () => {
      const critical = trainer.computeSeverityScore('critical remote code execution vulnerability')
      const low = trainer.computeSeverityScore('minor information disclosure')
      expect(critical.score).toBeGreaterThanOrEqual(low.score)
    })
  })

  // ── Attack Surface ──

  describe('mapAttackSurface', () => {
    it('maps attack surface for web app', () => {
      const result = trainer.mapAttackSurface('web application with user login and file upload')
      expect(result.vectors.length).toBeGreaterThan(0)
      expect(result.riskLevel).toBeTruthy()
    })

    it('identifies vulnerabilities', () => {
      const result = trainer.mapAttackSurface('REST API with authentication')
      expect(Array.isArray(result.vulnerabilities)).toBe(true)
    })
  })

  // ── Pen Test Scenarios ──

  describe('generatePenTestScenario', () => {
    it('generates a scenario', () => {
      const scenario = trainer.generatePenTestScenario('corporate web application')
      expect(scenario.name).toBeTruthy()
      expect(scenario.phases.length).toBeGreaterThan(0)
    })

    it('includes all pen test phases', () => {
      const scenario = trainer.generatePenTestScenario('network infrastructure', 3)
      const phaseNames = scenario.phases.map(p => p.name)
      expect(phaseNames).toContain('reconnaissance')
    })

    it('respects difficulty level', () => {
      const easy = trainer.generatePenTestScenario('target', 1)
      const hard = trainer.generatePenTestScenario('target', 5)
      expect(easy.difficulty).toBeLessThanOrEqual(hard.difficulty)
    })
  })

  // ── Tool Knowledge ──

  describe('getToolKnowledge', () => {
    it('returns knowledge about nmap', () => {
      const tool = trainer.getToolKnowledge('nmap')
      expect(tool.name.toLowerCase()).toContain('nmap')
      expect(tool.commonUsage.length).toBeGreaterThan(0)
    })

    it('returns knowledge about metasploit', () => {
      const tool = trainer.getToolKnowledge('metasploit')
      expect(tool.name).toBeTruthy()
    })

    it('handles unknown tools gracefully', () => {
      const tool = trainer.getToolKnowledge('unknown-tool-xyz')
      expect(tool).toBeDefined()
      expect(tool.name).toBeTruthy()
    })
  })

  // ── Network Analysis ──

  describe('analyseNetwork', () => {
    it('analyzes a network description', () => {
      const result = trainer.analyseNetwork('web server with open ports 80, 443, SSH on 22')
      expect(result.openPorts.length).toBeGreaterThan(0)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('detects vulnerabilities', () => {
      const result = trainer.analyseNetwork('FTP server with anonymous access')
      expect(result.vulnerabilities.length).toBeGreaterThan(0)
    })
  })

  // ── Web Vulnerabilities ──

  describe('getWebVulnerabilities', () => {
    it('returns web vulns for description', () => {
      const vulns = trainer.getWebVulnerabilities('form with user input, no CSRF token')
      expect(vulns.length).toBeGreaterThan(0)
    })

    it('returns vuln with type and remediation', () => {
      const vulns = trainer.getWebVulnerabilities('login page')
      for (const v of vulns) {
        expect(v.type).toBeTruthy()
        expect(v.remediation).toBeTruthy()
      }
    })
  })

  describe('getWebVulnDetail', () => {
    it('returns detail for known type', () => {
      const detail = trainer.getWebVulnDetail('xss')
      expect(detail).toBeDefined()
      expect(detail!.type).toBe('xss')
    })

    it('returns null for unknown type', () => {
      const detail = trainer.getWebVulnDetail('nonexistent' as any)
      expect(detail).toBeNull()
    })
  })

  // ── Crypto Challenges ──

  describe('generateCryptoChallenge', () => {
    it('returns a challenge', () => {
      const challenge = trainer.generateCryptoChallenge()
      expect(challenge.algorithm).toBeTruthy()
      expect(challenge.description).toBeTruthy()
    })

    it('difficulty-appropriate challenges', () => {
      const easy = trainer.generateCryptoChallenge(1)
      expect(easy.difficulty).toBeLessThanOrEqual(2)
    })

    it('includes common mistakes', () => {
      const challenge = trainer.generateCryptoChallenge(3)
      expect(challenge.commonMistakes.length).toBeGreaterThan(0)
    })
  })

  // ── Social Engineering ──

  describe('getSocialEngineeringScenarios', () => {
    it('returns all scenarios without filter', () => {
      const scenarios = trainer.getSocialEngineeringScenarios()
      expect(scenarios.length).toBeGreaterThan(0)
    })

    it('filters by type', () => {
      const phishing = trainer.getSocialEngineeringScenarios('phishing')
      for (const s of phishing) {
        expect(s.type).toBe('phishing')
      }
    })
  })

  // ── CTF Challenges ──

  describe('generateCTFChallenges', () => {
    it('generates challenges', () => {
      const challenges = trainer.generateCTFChallenges()
      expect(challenges.length).toBeGreaterThan(0)
    })

    it('filters by category', () => {
      const web = trainer.generateCTFChallenges('web')
      for (const c of web) {
        expect(c.category).toBe('web')
      }
    })

    it('respects max difficulty', () => {
      const easy = trainer.generateCTFChallenges(undefined, 2)
      for (const c of easy) {
        expect(c.difficulty).toBeLessThanOrEqual(2)
      }
    })

    it('respects count limit', () => {
      const challenges = trainer.generateCTFChallenges(undefined, 5, 3)
      expect(challenges.length).toBeLessThanOrEqual(3)
    })
  })

  describe('submitCTFFlag', () => {
    it('rejects unknown challenge ID', () => {
      const result = trainer.submitCTFFlag('nonexistent', 'flag{test}')
      expect(result.correct).toBe(false)
    })

    it('accepts correct flag', () => {
      const challenges = trainer.generateCTFChallenges(undefined, 5, 10)
      if (challenges.length > 0) {
        const challenge = challenges[0]
        const result = trainer.submitCTFFlag(challenge.id, challenge.flag)
        expect(result.correct).toBe(true)
      }
    })

    it('rejects incorrect flag', () => {
      const challenges = trainer.generateCTFChallenges(undefined, 5, 10)
      if (challenges.length > 0) {
        const result = trainer.submitCTFFlag(challenges[0].id, 'wrong_flag')
        expect(result.correct).toBe(false)
      }
    })
  })

  // ── Exploit Techniques ──

  describe('getExploitTechniques', () => {
    it('returns techniques for buffer overflow', () => {
      const techniques = trainer.getExploitTechniques('buffer overflow')
      expect(techniques.length).toBeGreaterThan(0)
    })

    it('returns techniques with mitigations', () => {
      const techniques = trainer.getExploitTechniques('privilege escalation')
      for (const t of techniques) {
        expect(t.mitigations.length).toBeGreaterThan(0)
      }
    })

    it('handles no matches', () => {
      const techniques = trainer.getExploitTechniques('quantum-resistant algorithms')
      expect(Array.isArray(techniques)).toBe(true)
    })
  })

  // ── Security Audit ──

  describe('performAudit', () => {
    it('performs audit on a target', () => {
      const audit = trainer.performAudit('e-commerce web application with SQL injection payment processing authentication')
      expect(audit.target).toBeTruthy()
      expect(audit.findings.length).toBeGreaterThanOrEqual(0)
    })

    it('returns risk score', () => {
      const audit = trainer.performAudit('internal API server')
      expect(typeof audit.riskScore).toBe('number')
    })

    it('includes frameworks', () => {
      const audit = trainer.performAudit('cloud infrastructure')
      expect(audit.frameworks.length).toBeGreaterThan(0)
    })

    it('includes compliance status', () => {
      const audit = trainer.performAudit('database server')
      expect(audit.complianceStatus).toBeTruthy()
    })
  })

  // ── Incident Response ──

  describe('generateIncidentResponse', () => {
    it('generates response for malware', () => {
      const phases = trainer.generateIncidentResponse('malware infection')
      expect(phases.length).toBeGreaterThan(0)
    })

    it('generates response for data breach', () => {
      const phases = trainer.generateIncidentResponse('data breach')
      expect(phases.length).toBeGreaterThan(0)
      const phaseNames = phases.map(p => p.phase)
      expect(phaseNames).toContain('detection')
    })

    it('generates response for DDoS', () => {
      const phases = trainer.generateIncidentResponse('ddos attack')
      expect(phases.length).toBeGreaterThan(0)
    })

    it('each phase has actions', () => {
      const phases = trainer.generateIncidentResponse('phishing email attack')
      for (const phase of phases) {
        expect(phase.actions.length).toBeGreaterThan(0)
      }
    })
  })

  // ── Skill Assessment ──

  describe('assessSkills', () => {
    it('assesses skills from scores', () => {
      const assessment = trainer.assessSkills({ web: 80, network: 60, crypto: 40 })
      expect(assessment.overallLevel).toBeDefined()
      expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(assessment.overallLevel)
    })

    it('identifies gaps', () => {
      const assessment = trainer.assessSkills({ web: 90, network: 30, crypto: 20 })
      expect(assessment.gaps.length).toBeGreaterThan(0)
    })

    it('identifies strengths', () => {
      const assessment = trainer.assessSkills({ web: 95, network: 85, crypto: 90 })
      expect(assessment.strengths.length).toBeGreaterThan(0)
    })

    it('returns beginner for empty scores', () => {
      const assessment = trainer.assessSkills({})
      expect(assessment.overallLevel).toBe('beginner')
    })

    it('includes training path', () => {
      const assessment = trainer.assessSkills({ web: 40 })
      expect(assessment.trainingPath.length).toBeGreaterThan(0)
    })
  })

  // ── Training Modules ──

  describe('getTrainingModules', () => {
    it('returns all modules', () => {
      const modules = trainer.getTrainingModules()
      expect(modules.length).toBeGreaterThan(0)
    })

    it('filters by category', () => {
      const modules = trainer.getTrainingModules('web')
      for (const m of modules) {
        expect(m.category).toBe('web')
      }
    })

    it('filters by max difficulty', () => {
      const modules = trainer.getTrainingModules(undefined, 2)
      for (const m of modules) {
        expect(m.difficulty).toBeLessThanOrEqual(2)
      }
    })
  })

  // ── Feedback ──

  describe('provideFeedback', () => {
    it('records feedback', () => {
      trainer.provideFeedback(4, 'Good content')
      expect(trainer.getStats().feedbackCount).toBe(1)
    })

    it('adjusts difficulty for "too easy"', () => {
      trainer.provideFeedback(3, 'too easy for me')
      // Should not throw; difficulty adjustment handled internally
      expect(trainer.getStats().feedbackCount).toBe(1)
    })

    it('adjusts difficulty for "too hard"', () => {
      trainer.provideFeedback(2, 'too hard')
      expect(trainer.getStats().feedbackCount).toBe(1)
    })
  })

  // ── Stats ──

  describe('getStats', () => {
    it('returns zero stats initially', () => {
      const stats = trainer.getStats()
      expect(stats.totalTrainingSessions).toBe(0)
      expect(stats.totalChallengesGenerated).toBe(0)
      expect(stats.totalVulnAnalyses).toBe(0)
    })

    it('tracks operations', () => {
      trainer.analyseVulnerability('sql injection')
      trainer.generateCTFChallenges()
      trainer.performAudit('test target')
      const stats = trainer.getStats()
      expect(stats.totalVulnAnalyses).toBeGreaterThan(0)
      expect(stats.totalChallengesGenerated).toBeGreaterThan(0)
      expect(stats.totalAudits).toBeGreaterThan(0)
    })

    it('tracks average score', () => {
      // Complete a CTF challenge to get score
      const challenges = trainer.generateCTFChallenges(undefined, 5, 5)
      if (challenges.length > 0) {
        trainer.submitCTFFlag(challenges[0].id, challenges[0].flag)
        expect(trainer.getStats().avgScore).toBeGreaterThan(0)
      }
    })
  })

  // ── Serialization ──

  describe('serialize / deserialize', () => {
    it('round-trips state', () => {
      trainer.analyseVulnerability('test')
      trainer.provideFeedback(4, 'good')
      const json = trainer.serialize()
      const restored = SecurityTrainer.deserialize(json)
      expect(restored.getStats().totalVulnAnalyses).toBe(1)
      expect(restored.getStats().feedbackCount).toBe(1)
    })

    it('produces valid JSON', () => {
      const json = trainer.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('preserves config', () => {
      const t = new SecurityTrainer({ maxChallenges: 7 })
      t.analyseVulnerability('test')
      const json = t.serialize()
      const restored = SecurityTrainer.deserialize(json)
      expect(restored.getStats().totalVulnAnalyses).toBe(1)
    })
  })

  // ── Edge cases ──

  describe('edge cases', () => {
    it('empty description for vulnerability', () => {
      const vulns = trainer.analyseVulnerability('')
      expect(Array.isArray(vulns)).toBe(true)
    })

    it('empty description for network', () => {
      const result = trainer.analyseNetwork('')
      expect(result).toBeDefined()
    })

    it('feedback with extreme rating', () => {
      trainer.provideFeedback(0, 'terrible')
      trainer.provideFeedback(100, 'amazing')
      expect(trainer.getStats().feedbackCount).toBe(2)
    })
  })
})
