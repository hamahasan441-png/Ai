import { describe, it, expect } from 'vitest'
import { EthicalReasoner, DEFAULT_ETHICAL_CONFIG } from '../EthicalReasoner.js'

// ─── DEFAULT_ETHICAL_CONFIG ─────────────────────────────────────────────────

describe('DEFAULT_ETHICAL_CONFIG', () => {
  it('should include all five frameworks', () => {
    expect(DEFAULT_ETHICAL_CONFIG.frameworks).toEqual([
      'utilitarian',
      'deontological',
      'virtue',
      'care',
      'rights',
    ])
  })

  it('should have minConfidence of 0.3', () => {
    expect(DEFAULT_ETHICAL_CONFIG.minConfidence).toBe(0.3)
  })

  it('should cap stakeholders at 10', () => {
    expect(DEFAULT_ETHICAL_CONFIG.maxStakeholders).toBe(10)
  })

  it('should enable multi-framework by default', () => {
    expect(DEFAULT_ETHICAL_CONFIG.enableMultiFramework).toBe(true)
  })
})

// ─── Constructor ────────────────────────────────────────────────────────────

describe('EthicalReasoner constructor', () => {
  it('should create an instance with default config', () => {
    const reasoner = new EthicalReasoner()
    expect(reasoner).toBeInstanceOf(EthicalReasoner)
  })

  it('should accept a partial config override', () => {
    const reasoner = new EthicalReasoner({ minConfidence: 0.5 })
    const stats = reasoner.getStats()
    expect(stats.totalAnalyses).toBe(0)
  })

  it('should accept an empty config object', () => {
    const reasoner = new EthicalReasoner({})
    expect(reasoner.getPrinciples().length).toBeGreaterThan(0)
  })

  it('should restrict frameworks when configured', () => {
    const reasoner = new EthicalReasoner({ frameworks: ['utilitarian'] })
    const analysis = reasoner.analyze('benefit welfare happiness for most people')
    expect(analysis.frameworks.length).toBeGreaterThanOrEqual(1)
    expect(analysis.frameworks.every(f => f.framework === 'utilitarian')).toBe(true)
  })

  it('should initialize framework usage to zero', () => {
    const reasoner = new EthicalReasoner()
    const stats = reasoner.getStats()
    for (const fw of ['utilitarian', 'deontological', 'virtue', 'care', 'rights']) {
      expect(stats.frameworkUsage[fw]).toBe(0)
    }
  })
})

// ─── analyze() ──────────────────────────────────────────────────────────────

describe('analyze()', () => {
  it('should return all required fields', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.analyze('Should we help employees improve their wellbeing?')
    expect(result).toHaveProperty('dilemma')
    expect(result).toHaveProperty('frameworks')
    expect(result).toHaveProperty('overallAssessment')
    expect(result).toHaveProperty('ethicalScore')
    expect(result).toHaveProperty('stakeholders')
    expect(result).toHaveProperty('recommendation')
    expect(result).toHaveProperty('confidence')
  })

  it('should preserve the original dilemma text', () => {
    const reasoner = new EthicalReasoner()
    const scenario = 'Is it ethical to protect children from exploitation?'
    const result = reasoner.analyze(scenario)
    expect(result.dilemma).toBe(scenario)
  })

  it('should produce a positive score for a clearly ethical scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.analyze(
      'We should protect vulnerable children with compassion and empathy, ensuring their safety and wellbeing through honest and fair treatment.',
    )
    expect(result.ethicalScore).toBeGreaterThan(0)
  })

  it('should produce a negative score for a clearly unethical scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.analyze(
      'We plan to exploit workers, lie to customers, steal from the public, and inflict cruelty and torture on vulnerable people.',
    )
    expect(result.ethicalScore).toBeLessThan(0)
  })

  it('should return a score near zero for ambiguous scenarios', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.analyze('The weather is nice today.')
    expect(result.ethicalScore).toBeGreaterThanOrEqual(-0.5)
    expect(result.ethicalScore).toBeLessThanOrEqual(0.5)
  })

  it('should include framework assessments for all configured frameworks', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.analyze(
      'harm suffering duty rights fairness empathy virtue compassion trust',
    )
    expect(result.frameworks.length).toBeGreaterThanOrEqual(1)
  })

  it('should produce assessments from all five frameworks when multi-framework is enabled', () => {
    const reasoner = new EthicalReasoner({ minConfidence: 0 })
    const result = reasoner.analyze(
      'duty harm rights fairness compassion empathy protect vulnerable honesty justice welfare',
    )
    const frameworkNames = result.frameworks.map(f => f.framework)
    expect(frameworkNames.length).toBe(5)
  })

  it('should return confidence between 0 and 1', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.analyze('We should protect the rights and liberty of all citizens.')
    expect(result.confidence).toBeGreaterThanOrEqual(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  it('should return ethicalScore clamped between -1 and 1', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.analyze(
      'benefit happiness welfare joy prosper greatest good majority long-term sustainable honest fair justice courage integrity protect vulnerable empathy liberty privacy',
    )
    expect(result.ethicalScore).toBeGreaterThanOrEqual(-1)
    expect(result.ethicalScore).toBeLessThanOrEqual(1)
  })

  it('should increment analysisCount', () => {
    const reasoner = new EthicalReasoner()
    reasoner.analyze('test scenario one')
    reasoner.analyze('test scenario two')
    expect(reasoner.getStats().totalAnalyses).toBe(2)
  })

  it('should work in single-framework mode', () => {
    const reasoner = new EthicalReasoner({ enableMultiFramework: false })
    const result = reasoner.analyze('rights liberty freedom privacy autonomy')
    expect(result.frameworks.length).toBeGreaterThanOrEqual(1)
  })

  it('should detect the dominant framework in single-framework mode', () => {
    const reasoner = new EthicalReasoner({ enableMultiFramework: false })
    const result = reasoner.analyze('rights liberty freedom privacy')
    expect(result.frameworks[0]!.framework).toBe('rights')
  })
})

// ─── evaluateAction() ───────────────────────────────────────────────────────

describe('evaluateAction()', () => {
  it('should return isEthical, score, and reasoning', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.evaluateAction('help people', 'community welfare')
    expect(result).toHaveProperty('isEthical')
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('reasoning')
  })

  it('should judge a helpful action as ethical', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.evaluateAction(
      'protect vulnerable children with compassion',
      'empathy and honest community support',
    )
    expect(result.isEthical).toBe(true)
    expect(result.score).toBeGreaterThan(0)
  })

  it('should judge a harmful action as unethical', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.evaluateAction(
      'exploit and torture vulnerable people',
      'lie steal inflict cruelty and suffering',
    )
    expect(result.isEthical).toBe(false)
    expect(result.score).toBeLessThan(0)
  })

  it('should include framework name in reasoning when assessments exist', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.evaluateAction(
      'protect rights and liberty',
      'ensure freedom and privacy for citizens',
    )
    expect(result.reasoning).toMatch(/perspective/)
  })

  it('should combine action and context for analysis', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.evaluateAction('benefit', 'welfare happiness')
    expect(typeof result.score).toBe('number')
  })
})

// ─── identifyStakeholders() ─────────────────────────────────────────────────

describe('identifyStakeholders()', () => {
  it('should detect employees', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders(
      'The employees were affected by the decision.',
    )
    expect(stakeholders.some(s => s.name === 'Employees')).toBe(true)
  })

  it('should detect customers', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('Customers complained about the service.')
    expect(stakeholders.some(s => s.name === 'Customers')).toBe(true)
  })

  it('should detect children', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders(
      'Children are vulnerable and need protection.',
    )
    expect(stakeholders.some(s => s.name === 'Children')).toBe(true)
  })

  it('should detect community', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders(
      'The community will benefit from this project.',
    )
    expect(stakeholders.some(s => s.name === 'Community')).toBe(true)
  })

  it('should detect shareholders', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('Shareholders expect higher returns.')
    expect(stakeholders.some(s => s.name === 'Shareholders')).toBe(true)
  })

  it('should detect patients', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('Patients need better healthcare access.')
    expect(stakeholders.some(s => s.name === 'Patients')).toBe(true)
  })

  it('should detect students', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders(
      'Students are affected by tuition increases.',
    )
    expect(stakeholders.some(s => s.name === 'Students')).toBe(true)
  })

  it('should detect environment', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('The environment suffers from pollution.')
    expect(stakeholders.some(s => s.name === 'Environment')).toBe(true)
  })

  it('should detect families', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('Families were displaced by the project.')
    expect(stakeholders.some(s => s.name === 'Families')).toBe(true)
  })

  it('should detect government', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('Government regulators are investigating.')
    expect(stakeholders.some(s => s.name === 'Government')).toBe(true)
  })

  it('should detect organisation', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('The company must respond to the crisis.')
    expect(stakeholders.some(s => s.name === 'Organisation')).toBe(true)
  })

  it('should detect individuals / people', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('People deserve fair treatment.')
    expect(stakeholders.some(s => s.name === 'Individuals')).toBe(true)
  })

  it('should detect multiple stakeholders in one scenario', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders(
      'Employees and customers and the community are all affected.',
    )
    expect(stakeholders.length).toBeGreaterThanOrEqual(3)
  })

  it('should not duplicate stakeholder names', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('Employee employee employees workers staff')
    const names = stakeholders.map(s => s.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('should return "Affected Parties" when no specific stakeholder is found', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('Abstract philosophical quandary.')
    expect(stakeholders.length).toBe(1)
    expect(stakeholders[0]!.name).toBe('Affected Parties')
    expect(stakeholders[0]!.impact).toBe('neutral')
  })

  it('should respect maxStakeholders config', () => {
    const reasoner = new EthicalReasoner({ maxStakeholders: 2 })
    const stakeholders = reasoner.identifyStakeholders(
      'Employees, customers, children, community, shareholders, patients, students, families, government, company, and individuals.',
    )
    expect(stakeholders.length).toBeLessThanOrEqual(2)
  })

  it('should infer negative impact from harmful language', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('Employees are harmed and exploited.')
    const emp = stakeholders.find(s => s.name === 'Employees')
    expect(emp).toBeDefined()
    expect(emp!.impact).toBe('negative')
  })

  it('should infer positive impact from beneficial language', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders(
      'Employees benefit from the new policy and are helped.',
    )
    const emp = stakeholders.find(s => s.name === 'Employees')
    expect(emp).toBeDefined()
    expect(emp!.impact).toBe('positive')
  })

  it('should set neutral impact when language is balanced', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('Employees are present.')
    const emp = stakeholders.find(s => s.name === 'Employees')
    expect(emp).toBeDefined()
    expect(emp!.impact).toBe('neutral')
  })

  it('should include a description for each stakeholder', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('The community will benefit.')
    for (const s of stakeholders) {
      expect(typeof s.description).toBe('string')
      expect(s.description.length).toBeGreaterThan(0)
    }
  })

  it('should include a severity between 0 and 1', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('Employees are harmed.')
    for (const s of stakeholders) {
      expect(s.severity).toBeGreaterThanOrEqual(0)
      expect(s.severity).toBeLessThanOrEqual(1)
    }
  })
})

// ─── assessFromFramework() ──────────────────────────────────────────────────

describe('assessFromFramework()', () => {
  it('should return a FrameworkAssessment object', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework('benefit and happiness for all', 'utilitarian')
    expect(result).toHaveProperty('framework')
    expect(result).toHaveProperty('assessment')
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('reasoning')
  })

  it('should return a score between -1 and 1', () => {
    const reasoner = new EthicalReasoner()
    for (const fw of ['utilitarian', 'deontological', 'virtue', 'care', 'rights'] as const) {
      const result = reasoner.assessFromFramework('scenario about duty and rights and harm', fw)
      expect(result.score).toBeGreaterThanOrEqual(-1)
      expect(result.score).toBeLessThanOrEqual(1)
    }
  })

  it('should produce a positive utilitarian score for beneficial scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework(
      'happiness joy wellbeing benefit prosper greatest good for majority',
      'utilitarian',
    )
    expect(result.score).toBeGreaterThan(0)
    expect(result.framework).toBe('utilitarian')
  })

  it('should produce a negative utilitarian score for harmful scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework(
      'suffering misery pain inflict torture abuse cruelty selfish wasteful',
      'utilitarian',
    )
    expect(result.score).toBeLessThan(0)
  })

  it('should produce a positive deontological score for duty-based scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework(
      'duty obligation universally categorical dignity respect autonomy consent promise commitment honour',
      'deontological',
    )
    expect(result.score).toBeGreaterThan(0)
  })

  it('should produce a negative deontological score for rule-breaking scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework(
      'exploit manipulate use people break rules cheat betray break promise deceive',
      'deontological',
    )
    expect(result.score).toBeLessThan(0)
  })

  it('should produce a positive virtue score for virtuous scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework(
      'courage brave justice fair honest truthful compassion empathy integrity principled prudent wise',
      'virtue',
    )
    expect(result.score).toBeGreaterThan(0)
  })

  it('should produce a negative virtue score for vicious scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework(
      'cowardice unfair bias cruel callous dishonest lie deceive fraud corrupt hypocrit',
      'virtue',
    )
    expect(result.score).toBeLessThan(0)
  })

  it('should produce a positive care score for caring scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework(
      'protect vulnerable children safety empathy understand feelings relationship bond nurture growth',
      'care',
    )
    expect(result.score).toBeGreaterThan(0)
  })

  it('should produce a negative care score for neglectful scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework(
      'exploit vulnerable endanger children neglect abandon isolate stifle suppress hinder',
      'care',
    )
    expect(result.score).toBeLessThan(0)
  })

  it('should produce a positive rights score for rights-respecting scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework(
      'right to life liberty freedom autonomy privacy confidential free speech expression due process fair trial',
      'rights',
    )
    expect(result.score).toBeGreaterThan(0)
  })

  it('should produce a negative rights score for rights-violating scenario', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework(
      'kill murder imprison enslave coerce restrict freedom surveillance spy censor silence',
      'rights',
    )
    expect(result.score).toBeLessThan(0)
  })

  it('should report "No strong alignment" when scenario has no ethical keywords', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework('The cat sat on the mat.', 'virtue')
    expect(result.reasoning).toContain('No strong alignment or violation detected')
  })

  it('should include principle names in reasoning when triggered', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework('justice fair equitable', 'virtue')
    expect(result.reasoning).toContain('Justice')
  })

  it('should increment framework usage count', () => {
    const reasoner = new EthicalReasoner()
    reasoner.assessFromFramework('scenario', 'care')
    reasoner.assessFromFramework('scenario', 'care')
    expect(reasoner.getStats().frameworkUsage['care']).toBe(2)
  })
})

// ─── findEthicalConflicts() ─────────────────────────────────────────────────

describe('findEthicalConflicts()', () => {
  it('should return an array of conflict objects', () => {
    const reasoner = new EthicalReasoner()
    const conflicts = reasoner.findEthicalConflicts('benefit and harm')
    expect(Array.isArray(conflicts)).toBe(true)
  })

  it('should detect conflicts when positive and negative signals co-occur across frameworks', () => {
    const reasoner = new EthicalReasoner()
    const conflicts = reasoner.findEthicalConflicts(
      'greatest good for majority but exploit and manipulate vulnerable people and lie and deceive',
    )
    expect(conflicts.length).toBeGreaterThan(0)
  })

  it('should include principle1, principle2, and tension in each conflict', () => {
    const reasoner = new EthicalReasoner()
    const conflicts = reasoner.findEthicalConflicts(
      'happiness joy prosper but exploit torture cruelty lie steal kill',
    )
    for (const c of conflicts) {
      expect(c).toHaveProperty('principle1')
      expect(c).toHaveProperty('principle2')
      expect(c).toHaveProperty('tension')
      expect(typeof c.tension).toBe('string')
      expect(c.tension.length).toBeGreaterThan(0)
    }
  })

  it('should not duplicate conflicts', () => {
    const reasoner = new EthicalReasoner()
    const conflicts = reasoner.findEthicalConflicts(
      'happiness joy prosper but exploit torture cruelty lie steal',
    )
    const keys = conflicts.map(c => [c.principle1, c.principle2].sort().join('|'))
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('should only find conflicts between different frameworks', () => {
    const reasoner = new EthicalReasoner()
    const conflicts = reasoner.findEthicalConflicts(
      'happiness benefit prosper suffering misery pain greatest good selfish',
    )
    // Conflicts should be between different frameworks, not within the same one
    for (const c of conflicts) {
      expect(c.tension).toMatch(/supports the action while/)
      expect(c.tension).toMatch(/opposes it/)
    }
  })

  it('should return an empty array for a neutral scenario', () => {
    const reasoner = new EthicalReasoner()
    const conflicts = reasoner.findEthicalConflicts('The cat sat on the mat.')
    expect(conflicts).toEqual([])
  })

  it('should include framework names in the tension description', () => {
    const reasoner = new EthicalReasoner()
    const conflicts = reasoner.findEthicalConflicts(
      'happiness joy benefit but kill murder enslave coerce lie deceive fraud',
    )
    if (conflicts.length > 0) {
      const frameworks = ['utilitarian', 'deontological', 'virtue', 'care', 'rights']
      const tensionText = conflicts.map(c => c.tension).join(' ')
      const mentionsFramework = frameworks.some(fw => tensionText.includes(fw))
      expect(mentionsFramework).toBe(true)
    }
  })
})

// ─── suggestEthicalAction() ─────────────────────────────────────────────────

describe('suggestEthicalAction()', () => {
  it('should return a non-empty string', () => {
    const reasoner = new EthicalReasoner()
    const suggestion = reasoner.suggestEthicalAction('help the community')
    expect(typeof suggestion).toBe('string')
    expect(suggestion.length).toBeGreaterThan(0)
  })

  it('should recommend proceeding for clearly ethical scenarios', () => {
    const reasoner = new EthicalReasoner()
    const suggestion = reasoner.suggestEthicalAction(
      'happiness joy wellbeing benefit prosper greatest good honest fair justice courage protect vulnerable empathy liberty privacy',
    )
    expect(suggestion).toContain('ethically sound')
  })

  it('should raise concerns for clearly unethical scenarios', () => {
    const reasoner = new EthicalReasoner()
    const suggestion = reasoner.suggestEthicalAction(
      'suffering misery torture cruelty exploit lie deceive steal kill murder enslave coerce censor',
    )
    expect(suggestion).toMatch(/ethical concerns|mixed/)
  })

  it('should suggest balancing for mixed scenarios', () => {
    const reasoner = new EthicalReasoner()
    const suggestion = reasoner.suggestEthicalAction('general topic with no strong signal')
    expect(suggestion).toContain('mixed')
  })

  it('should mention a framework name in the recommendation', () => {
    const reasoner = new EthicalReasoner()
    const suggestion = reasoner.suggestEthicalAction('protect liberty freedom privacy rights')
    const frameworks = ['utilitarian', 'deontological', 'virtue', 'care', 'rights']
    const mentionsFramework = frameworks.some(fw => suggestion.includes(fw))
    expect(mentionsFramework).toBe(true)
  })
})

// ─── getPrinciples() ────────────────────────────────────────────────────────

describe('getPrinciples()', () => {
  it('should return all principles when no framework is specified', () => {
    const reasoner = new EthicalReasoner()
    const principles = reasoner.getPrinciples()
    expect(principles.length).toBeGreaterThan(20)
  })

  it('should return a copy, not the internal array', () => {
    const reasoner = new EthicalReasoner()
    const a = reasoner.getPrinciples()
    const b = reasoner.getPrinciples()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })

  it('should filter by utilitarian framework', () => {
    const reasoner = new EthicalReasoner()
    const principles = reasoner.getPrinciples('utilitarian')
    expect(principles.length).toBeGreaterThan(0)
    expect(principles.every(p => p.framework === 'utilitarian')).toBe(true)
  })

  it('should filter by deontological framework', () => {
    const reasoner = new EthicalReasoner()
    const principles = reasoner.getPrinciples('deontological')
    expect(principles.length).toBeGreaterThan(0)
    expect(principles.every(p => p.framework === 'deontological')).toBe(true)
  })

  it('should filter by virtue framework', () => {
    const reasoner = new EthicalReasoner()
    const principles = reasoner.getPrinciples('virtue')
    expect(principles.length).toBeGreaterThan(0)
    expect(principles.every(p => p.framework === 'virtue')).toBe(true)
  })

  it('should filter by care framework', () => {
    const reasoner = new EthicalReasoner()
    const principles = reasoner.getPrinciples('care')
    expect(principles.length).toBeGreaterThan(0)
    expect(principles.every(p => p.framework === 'care')).toBe(true)
  })

  it('should filter by rights framework', () => {
    const reasoner = new EthicalReasoner()
    const principles = reasoner.getPrinciples('rights')
    expect(principles.length).toBeGreaterThan(0)
    expect(principles.every(p => p.framework === 'rights')).toBe(true)
  })

  it('should return principle objects with name, description, framework, and weight', () => {
    const reasoner = new EthicalReasoner()
    const principles = reasoner.getPrinciples()
    for (const p of principles) {
      expect(typeof p.name).toBe('string')
      expect(typeof p.description).toBe('string')
      expect(typeof p.framework).toBe('string')
      expect(typeof p.weight).toBe('number')
      expect(p.weight).toBeGreaterThan(0)
      expect(p.weight).toBeLessThanOrEqual(1)
    }
  })
})

// ─── getStats() ─────────────────────────────────────────────────────────────

describe('getStats()', () => {
  it('should start with zero analyses', () => {
    const reasoner = new EthicalReasoner()
    expect(reasoner.getStats().totalAnalyses).toBe(0)
  })

  it('should start with zero average confidence', () => {
    const reasoner = new EthicalReasoner()
    expect(reasoner.getStats().averageConfidence).toBe(0)
  })

  it('should count analyses correctly', () => {
    const reasoner = new EthicalReasoner()
    reasoner.analyze('scenario one about duty')
    reasoner.analyze('scenario two about rights')
    reasoner.analyze('scenario three about harm')
    expect(reasoner.getStats().totalAnalyses).toBe(3)
  })

  it('should compute a non-zero average confidence after analyses', () => {
    const reasoner = new EthicalReasoner()
    reasoner.analyze('harm suffering rights duty fairness compassion trust')
    const stats = reasoner.getStats()
    expect(stats.averageConfidence).toBeGreaterThan(0)
  })

  it('should track framework usage across analyses', () => {
    const reasoner = new EthicalReasoner()
    reasoner.analyze('rights liberty freedom')
    const stats = reasoner.getStats()
    // All five frameworks should have been used at least once (multi-framework mode)
    for (const fw of ['utilitarian', 'deontological', 'virtue', 'care', 'rights']) {
      expect(stats.frameworkUsage[fw]).toBeGreaterThanOrEqual(1)
    }
  })

  it('should return a copy of frameworkUsage, not the internal reference', () => {
    const reasoner = new EthicalReasoner()
    const stats1 = reasoner.getStats()
    const stats2 = reasoner.getStats()
    expect(stats1.frameworkUsage).not.toBe(stats2.frameworkUsage)
  })
})

// ─── serialize() / deserialize() ────────────────────────────────────────────

describe('serialize() / deserialize()', () => {
  it('should serialize current state', () => {
    const reasoner = new EthicalReasoner()
    reasoner.analyze('help employees with compassion')
    const data = reasoner.serialize()
    expect(data).toHaveProperty('analysisCount')
    expect(data).toHaveProperty('confidenceSum')
    expect(data).toHaveProperty('frameworkUsage')
    expect(data.analysisCount).toBe(1)
  })

  it('should deserialize and restore state', () => {
    const r1 = new EthicalReasoner()
    r1.analyze('rights liberty freedom privacy')
    r1.analyze('duty obligation promise honour')
    const data = r1.serialize()

    const r2 = new EthicalReasoner()
    r2.deserialize(data)
    const stats = r2.getStats()
    expect(stats.totalAnalyses).toBe(2)
  })

  it('should preserve average confidence across round-trip', () => {
    const r1 = new EthicalReasoner()
    r1.analyze('harm suffering rights duty fairness compassion trust')
    const data = r1.serialize()

    const r2 = new EthicalReasoner()
    r2.deserialize(data)
    expect(r2.getStats().averageConfidence).toBeCloseTo(r1.getStats().averageConfidence)
  })

  it('should preserve framework usage across round-trip', () => {
    const r1 = new EthicalReasoner()
    r1.analyze('duty and rights')
    const data = r1.serialize()

    const r2 = new EthicalReasoner()
    r2.deserialize(data)
    expect(r2.getStats().frameworkUsage).toEqual(r1.getStats().frameworkUsage)
  })

  it('should return a copy of frameworkUsage in serialized data', () => {
    const reasoner = new EthicalReasoner()
    const data = reasoner.serialize()
    data.frameworkUsage['utilitarian'] = 999
    expect(reasoner.getStats().frameworkUsage['utilitarian']).toBe(0)
  })
})

// ─── clear() ────────────────────────────────────────────────────────────────

describe('clear()', () => {
  it('should reset analysis count to zero', () => {
    const reasoner = new EthicalReasoner()
    reasoner.analyze('test scenario')
    reasoner.clear()
    expect(reasoner.getStats().totalAnalyses).toBe(0)
  })

  it('should reset average confidence to zero', () => {
    const reasoner = new EthicalReasoner()
    reasoner.analyze('harm rights duty')
    reasoner.clear()
    expect(reasoner.getStats().averageConfidence).toBe(0)
  })

  it('should reset all framework usage counts to zero', () => {
    const reasoner = new EthicalReasoner()
    reasoner.analyze('rights liberty')
    reasoner.clear()
    const stats = reasoner.getStats()
    for (const fw of ['utilitarian', 'deontological', 'virtue', 'care', 'rights']) {
      expect(stats.frameworkUsage[fw]).toBe(0)
    }
  })

  it('should allow analyses after clearing', () => {
    const reasoner = new EthicalReasoner()
    reasoner.analyze('first scenario')
    reasoner.clear()
    reasoner.analyze('second scenario')
    expect(reasoner.getStats().totalAnalyses).toBe(1)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('should handle empty string analysis', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.analyze('')
    expect(result.dilemma).toBe('')
    expect(typeof result.ethicalScore).toBe('number')
    expect(result.stakeholders.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle empty string in identifyStakeholders', () => {
    const reasoner = new EthicalReasoner()
    const stakeholders = reasoner.identifyStakeholders('')
    expect(stakeholders.length).toBe(1)
    expect(stakeholders[0]!.name).toBe('Affected Parties')
  })

  it('should handle empty string in assessFromFramework', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.assessFromFramework('', 'utilitarian')
    expect(result.score).toBe(0)
    expect(result.reasoning).toContain('No strong alignment')
  })

  it('should handle empty string in evaluateAction', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.evaluateAction('', '')
    expect(typeof result.isEthical).toBe('boolean')
    expect(typeof result.score).toBe('number')
  })

  it('should handle empty string in findEthicalConflicts', () => {
    const reasoner = new EthicalReasoner()
    const conflicts = reasoner.findEthicalConflicts('')
    expect(conflicts).toEqual([])
  })

  it('should handle empty string in suggestEthicalAction', () => {
    const reasoner = new EthicalReasoner()
    const suggestion = reasoner.suggestEthicalAction('')
    expect(typeof suggestion).toBe('string')
    expect(suggestion.length).toBeGreaterThan(0)
  })

  it('should handle a very long input string', () => {
    const reasoner = new EthicalReasoner()
    const long = 'duty rights harm '.repeat(500)
    const result = reasoner.analyze(long)
    expect(typeof result.ethicalScore).toBe('number')
    expect(result.ethicalScore).toBeGreaterThanOrEqual(-1)
    expect(result.ethicalScore).toBeLessThanOrEqual(1)
  })

  it('should handle input with no ethical keywords', () => {
    const reasoner = new EthicalReasoner()
    const result = reasoner.analyze('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
    expect(result.stakeholders.length).toBeGreaterThanOrEqual(1)
    expect(typeof result.ethicalScore).toBe('number')
  })

  it('should handle single-framework config with only care', () => {
    const reasoner = new EthicalReasoner({ frameworks: ['care'] })
    const result = reasoner.analyze('protect vulnerable children empathy')
    expect(result.frameworks.every(f => f.framework === 'care')).toBe(true)
  })

  it('should handle case insensitivity in keyword detection', () => {
    const reasoner = new EthicalReasoner()
    const lower = reasoner.assessFromFramework('HARM SUFFERING RIGHTS DUTY', 'utilitarian')
    expect(typeof lower.score).toBe('number')
  })

  it('should produce consistent results for the same input', () => {
    const reasoner = new EthicalReasoner()
    const scenario = 'Should we protect the rights and liberty of employees?'
    const a = reasoner.analyze(scenario)
    const b = reasoner.analyze(scenario)
    expect(a.ethicalScore).toBe(b.ethicalScore)
  })
})
