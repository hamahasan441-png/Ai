import { describe, it, expect, beforeEach } from 'vitest'
import { ThreatModeler, type Asset, type DataFlow, type Threat } from '../ThreatModeler'

// ── Constructor Tests ──

describe('ThreatModeler constructor', () => {
  it('creates an instance with default config', () => {
    const modeler = new ThreatModeler()
    expect(modeler).toBeInstanceOf(ThreatModeler)
  })

  it('accepts a partial custom config', () => {
    const modeler = new ThreatModeler({ maxThreats: 50 })
    expect(modeler).toBeInstanceOf(ThreatModeler)
  })

  it('accepts a full custom config', () => {
    const modeler = new ThreatModeler({
      maxThreats: 100,
      methodology: 'stride',
      enableAutoMitigation: false,
      riskThreshold: 0.7,
      enableAttackTrees: false,
      enableThreatIntelligence: false,
    })
    expect(modeler).toBeInstanceOf(ThreatModeler)
  })

  it('has threat intel database available immediately', () => {
    const modeler = new ThreatModeler()
    const results = modeler.queryThreatIntel('phishing')
    expect(results.length).toBeGreaterThan(0)
  })
})

// ── Model Management Tests ──

describe('ThreatModeler model management', () => {
  let modeler: ThreatModeler

  beforeEach(() => {
    modeler = new ThreatModeler()
  })

  it('creates a model with name and optional description', () => {
    const model = modeler.createModel('Web App', 'E-commerce platform')
    expect(model.id).toContain('TM')
    expect(model.name).toBe('Web App')
    expect(model.description).toBe('E-commerce platform')
    expect(model.assets).toEqual([])
    expect(model.threats).toEqual([])
    expect(model.riskScore).toBe(0)
  })

  it('creates a model with empty description when omitted', () => {
    const model = modeler.createModel('API Gateway')
    expect(model.description).toBe('')
  })

  it('retrieves a model by its ID', () => {
    const created = modeler.createModel('Test Model')
    const retrieved = modeler.getModel(created.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved!.id).toBe(created.id)
    expect(retrieved!.name).toBe('Test Model')
  })

  it('returns null for a nonexistent model ID', () => {
    expect(modeler.getModel('nonexistent-id')).toBeNull()
  })

  it('lists all models with summary fields', () => {
    modeler.createModel('Model A')
    modeler.createModel('Model B')
    const list = modeler.listModels()
    expect(list).toHaveLength(2)
    for (const entry of list) {
      expect(typeof entry.id).toBe('string')
      expect(typeof entry.name).toBe('string')
      expect(typeof entry.timestamp).toBe('number')
      expect(typeof entry.riskScore).toBe('number')
    }
  })

  it('deletes a model and returns true', () => {
    const model = modeler.createModel('Temp Model')
    expect(modeler.deleteModel(model.id)).toBe(true)
    expect(modeler.getModel(model.id)).toBeNull()
  })

  it('returns false when deleting a nonexistent model', () => {
    expect(modeler.deleteModel('does-not-exist')).toBe(false)
  })
})

// ── Asset, DataFlow & TrustBoundary Tests ──

describe('ThreatModeler asset and flow management', () => {
  let modeler: ThreatModeler
  let modelId: string

  beforeEach(() => {
    modeler = new ThreatModeler()
    const model = modeler.createModel('Test Model')
    modelId = model.id
  })

  it('adds an asset and returns it with a generated ID', () => {
    const asset = modeler.addAsset(modelId, {
      name: 'User DB',
      type: 'data',
      sensitivity: 'restricted',
      description: 'Primary user database',
    })
    expect(asset.id).toContain('ASSET')
    expect(asset.name).toBe('User DB')
    expect(asset.type).toBe('data')
  })

  it('adds a data flow and returns it with a generated ID', () => {
    const flow = modeler.addDataFlow(modelId, {
      source: 'web-app',
      destination: 'db',
      data: 'User credentials',
      protocol: 'HTTPS',
      encrypted: true,
      authentication: true,
    })
    expect(flow.id).toContain('FLOW')
    expect(flow.source).toBe('web-app')
    expect(flow.encrypted).toBe(true)
  })

  it('adds a trust boundary and returns it with a generated ID', () => {
    const boundary = modeler.addTrustBoundary(modelId, {
      name: 'DMZ Boundary',
      type: 'network',
      insideAssets: ['internal-api'],
      outsideAssets: ['public-lb'],
    })
    expect(boundary.id).toContain('TB')
    expect(boundary.name).toBe('DMZ Boundary')
    expect(boundary.type).toBe('network')
  })

  it('throws when adding an asset to a nonexistent model', () => {
    expect(() =>
      modeler.addAsset('bad-id', {
        name: 'X',
        type: 'data',
        sensitivity: 'public',
        description: '',
      }),
    ).toThrow('Threat model not found')
  })
})

// ── Threat Identification Tests ──

describe('ThreatModeler identifyThreats', () => {
  let modeler: ThreatModeler
  let modelId: string

  beforeEach(() => {
    modeler = new ThreatModeler()
    const model = modeler.createModel('Identify Test')
    modelId = model.id
    modeler.addAsset(modelId, {
      name: 'Auth Service',
      type: 'user',
      sensitivity: 'confidential',
      description: 'Handles authentication',
    })
  })

  it('identifies threats for assets in the model', () => {
    const threats = modeler.identifyThreats(modelId)
    expect(threats.length).toBeGreaterThan(0)
  })

  it('each threat has required fields', () => {
    const threats = modeler.identifyThreats(modelId)
    for (const t of threats) {
      expect(typeof t.id).toBe('string')
      expect(typeof t.title).toBe('string')
      expect(typeof t.description).toBe('string')
      expect(typeof t.category).toBe('string')
      expect(typeof t.likelihood).toBe('number')
      expect(typeof t.impact).toBe('number')
      expect(['low', 'medium', 'high', 'critical']).toContain(t.riskLevel)
      expect(['identified', 'mitigated', 'accepted', 'transferred']).toContain(t.status)
    }
  })

  it('auto-applies mitigations when enableAutoMitigation is true', () => {
    const threats = modeler.identifyThreats(modelId)
    const withMitigations = threats.filter(t => t.mitigations.length > 0)
    expect(withMitigations.length).toBeGreaterThan(0)
  })

  it('skips auto-mitigation when disabled', () => {
    const m = new ThreatModeler({ enableAutoMitigation: false })
    const model = m.createModel('No Auto')
    m.addAsset(model.id, {
      name: 'DB',
      type: 'data',
      sensitivity: 'internal',
      description: 'Database',
    })
    const threats = m.identifyThreats(model.id)
    const withMitigations = threats.filter(t => t.mitigations.length > 0)
    expect(withMitigations).toHaveLength(0)
  })
})

// ── analyzeStride Tests ──

describe('ThreatModeler analyzeStride', () => {
  let modeler: ThreatModeler

  beforeEach(() => {
    modeler = new ThreatModeler()
  })

  it('returns STRIDE categories for a service asset', () => {
    const asset: Asset = {
      id: 'a1',
      name: 'API',
      type: 'service',
      sensitivity: 'confidential',
      description: 'REST API',
    }
    const results = modeler.analyzeStride(asset, [])
    expect(results.length).toBeGreaterThan(0)
    const categories = results.map(r => r.category)
    expect(categories).toContain('spoofing')
    expect(categories).toContain('tampering')
  })

  it('adds data interception threat for unencrypted flows', () => {
    const asset: Asset = {
      id: 'a2',
      name: 'DB',
      type: 'data',
      sensitivity: 'restricted',
      description: 'Main database',
    }
    const flows: DataFlow[] = [
      {
        id: 'f1',
        source: 'a2',
        destination: 'x',
        data: 'PII',
        encrypted: false,
        authentication: true,
      },
    ]
    const results = modeler.analyzeStride(asset, flows)
    const interception = results.find(r => r.threat === 'Data Interception')
    expect(interception).toBeDefined()
  })
})

// ── calculateDread Tests ──

describe('ThreatModeler calculateDread', () => {
  let modeler: ThreatModeler

  beforeEach(() => {
    modeler = new ThreatModeler()
  })

  it('calculates a DREAD score with all five components', () => {
    const threat: Threat = {
      id: 't1',
      title: 'SQL Injection',
      description: 'desc',
      category: 'injection',
      targetAsset: 'a1',
      likelihood: 0.7,
      impact: 0.8,
      riskLevel: 'high',
      mitigations: [],
      status: 'identified',
    }
    const score = modeler.calculateDread(threat)
    expect(typeof score.damage).toBe('number')
    expect(typeof score.reproducibility).toBe('number')
    expect(typeof score.exploitability).toBe('number')
    expect(typeof score.affectedUsers).toBe('number')
    expect(typeof score.discoverability).toBe('number')
    expect(typeof score.total).toBe('number')
    expect(score.total).toBeGreaterThan(0)
    expect(score.total).toBeLessThanOrEqual(10)
  })

  it('allows overriding individual DREAD components', () => {
    const threat: Threat = {
      id: 't2',
      title: 'XSS',
      description: 'desc',
      category: 'xss',
      targetAsset: 'a1',
      likelihood: 0.5,
      impact: 0.5,
      riskLevel: 'medium',
      mitigations: [],
      status: 'identified',
    }
    const score = modeler.calculateDread(threat, { damage: 9, exploitability: 9 })
    expect(score.damage).toBe(9)
    expect(score.exploitability).toBe(9)
  })
})

// ── buildAttackTree Tests ──

describe('ThreatModeler buildAttackTree', () => {
  let modeler: ThreatModeler
  let modelId: string

  beforeEach(() => {
    modeler = new ThreatModeler()
    const model = modeler.createModel('Attack Tree Test')
    modelId = model.id
    modeler.addAsset(modelId, {
      name: 'Payment Service',
      type: 'service',
      sensitivity: 'restricted',
      description: 'Handles payments',
    })
  })

  it('builds an attack tree with a root node', () => {
    const tree = modeler.buildAttackTree(modelId, 'Steal customer data')
    expect(tree.id).toContain('ATREE')
    expect(tree.goal).toBe('Steal customer data')
    expect(tree.rootNode).toBeDefined()
    expect(tree.rootNode.description).toBe('Steal customer data')
  })

  it('generates child nodes when maxDepth allows', () => {
    const tree = modeler.buildAttackTree(modelId, 'Steal customer data', 2)
    expect(tree.rootNode.children).toBeDefined()
    expect(tree.rootNode.children!.length).toBeGreaterThan(0)
  })

  it('limits tree depth with maxDepth', () => {
    const tree = modeler.buildAttackTree(modelId, 'Disrupt service', 1)
    expect(tree.rootNode).toBeDefined()
    expect(tree.rootNode.type).toBeDefined()
  })
})

// ── Mitigation Management Tests ──

describe('ThreatModeler mitigation management', () => {
  let modeler: ThreatModeler
  let modelId: string
  let threatId: string

  beforeEach(() => {
    modeler = new ThreatModeler()
    const model = modeler.createModel('Mitigation Test')
    modelId = model.id
    modeler.addAsset(modelId, {
      name: 'Web App',
      type: 'service',
      sensitivity: 'confidential',
      description: 'Main web application',
    })
    const threats = modeler.identifyThreats(modelId)
    threatId = threats[0].id
  })

  it('adds a mitigation to a specific threat', () => {
    const mit = modeler.addMitigation(modelId, threatId, {
      title: 'WAF',
      description: 'Web application firewall',
      effectiveness: 0.8,
      effort: 'medium',
      status: 'implemented',
      controlType: 'detective',
    })
    expect(mit.id).toContain('MIT')
    expect(mit.title).toBe('WAF')
  })

  it('throws when adding a mitigation to a nonexistent threat', () => {
    expect(() =>
      modeler.addMitigation(modelId, 'bad-threat-id', {
        title: 'X',
        description: 'x',
        effectiveness: 0.5,
        effort: 'low',
        status: 'proposed',
        controlType: 'preventive',
      }),
    ).toThrow('Threat not found')
  })

  it('suggests mitigations for a threat based on its category', () => {
    const suggestions = modeler.suggestMitigations(modelId, threatId)
    expect(suggestions.length).toBeGreaterThan(0)
    for (const s of suggestions) {
      expect(typeof s.title).toBe('string')
      expect(typeof s.effectiveness).toBe('number')
      expect(s.status).toBe('proposed')
    }
  })

  it('getMitigationCoverage returns total, mitigated, coverage, and gaps', () => {
    const coverage = modeler.getMitigationCoverage(modelId)
    expect(typeof coverage.total).toBe('number')
    expect(typeof coverage.mitigated).toBe('number')
    expect(typeof coverage.coverage).toBe('number')
    expect(Array.isArray(coverage.gaps)).toBe(true)
    expect(coverage.coverage).toBeGreaterThanOrEqual(0)
    expect(coverage.coverage).toBeLessThanOrEqual(1)
  })
})

// ── Risk Assessment Tests ──

describe('ThreatModeler assessRisk', () => {
  let modeler: ThreatModeler
  let modelId: string

  beforeEach(() => {
    modeler = new ThreatModeler()
    const model = modeler.createModel('Risk Test')
    modelId = model.id
    modeler.addAsset(modelId, {
      name: 'Database',
      type: 'data',
      sensitivity: 'restricted',
      description: 'Production DB',
    })
    modeler.identifyThreats(modelId)
  })

  it('returns overallRisk, byAsset, byCategory, and criticalThreats', () => {
    const assessment = modeler.assessRisk(modelId)
    expect(typeof assessment.overallRisk).toBe('number')
    expect(typeof assessment.byAsset).toBe('object')
    expect(typeof assessment.byCategory).toBe('object')
    expect(Array.isArray(assessment.criticalThreats)).toBe(true)
  })
})

// ── Report Generation Tests ──

describe('ThreatModeler generateReport', () => {
  let modeler: ThreatModeler
  let modelId: string

  beforeEach(() => {
    modeler = new ThreatModeler()
    const model = modeler.createModel('Report Test', 'A test model for reporting')
    modelId = model.id
    modeler.addAsset(modelId, {
      name: 'API Server',
      type: 'service',
      sensitivity: 'confidential',
      description: 'Backend API',
    })
    modeler.identifyThreats(modelId)
  })

  it('generates a text report by default', () => {
    const report = modeler.generateReport(modelId)
    expect(typeof report).toBe('string')
    expect(report).toContain('THREAT MODEL REPORT')
    expect(report).toContain('Report Test')
  })

  it('generates a valid JSON report', () => {
    const report = modeler.generateReport(modelId, 'json')
    const parsed = JSON.parse(report)
    expect(parsed.model.name).toBe('Report Test')
    expect(Array.isArray(parsed.assets)).toBe(true)
    expect(Array.isArray(parsed.threats)).toBe(true)
  })

  it('generates a markdown report with headers', () => {
    const report = modeler.generateReport(modelId, 'markdown')
    expect(report).toContain('# Threat Model Report')
    expect(report).toContain('## Assets')
    expect(report).toContain('## Threats')
  })
})

// ── Threat Intelligence Tests ──

describe('ThreatModeler threat intelligence', () => {
  let modeler: ThreatModeler

  beforeEach(() => {
    modeler = new ThreatModeler()
  })

  it('queries threat intel by keyword', () => {
    const results = modeler.queryThreatIntel('SQL injection')
    expect(results.length).toBeGreaterThan(0)
    for (const entry of results) {
      expect(typeof entry.id).toBe('string')
      expect(typeof entry.threat).toBe('string')
      expect(typeof entry.severity).toBe('string')
    }
  })

  it('returns empty when threat intelligence is disabled', () => {
    const m = new ThreatModeler({ enableThreatIntelligence: false })
    const results = m.queryThreatIntel('phishing')
    expect(results).toHaveLength(0)
  })

  it('adds a custom threat intel entry', () => {
    const entry = modeler.addThreatIntel({
      threat: 'Custom Zero-Day Exploit',
      source: 'Internal Research',
      severity: 'critical',
      indicators: ['suspicious binary'],
      lastSeen: Date.now(),
      tactics: ['Execution'],
      techniques: ['T9999 Custom Technique'],
    })
    expect(entry.id).toContain('INTEL')
    expect(entry.threat).toBe('Custom Zero-Day Exploit')

    const found = modeler.queryThreatIntel('Custom Zero-Day')
    expect(found.some(e => e.id === entry.id)).toBe(true)
  })
})

// ── compareMitigationStrategies Tests ──

describe('ThreatModeler compareMitigationStrategies', () => {
  it('returns multiple strategies sorted by cost-effectiveness', () => {
    const modeler = new ThreatModeler()
    const model = modeler.createModel('Strategy Compare')
    modeler.addAsset(model.id, {
      name: 'Service',
      type: 'service',
      sensitivity: 'confidential',
      description: 'API',
    })
    modeler.identifyThreats(model.id)

    const strategies = modeler.compareMitigationStrategies(model.id)
    expect(strategies.length).toBeGreaterThan(0)
    for (const s of strategies) {
      expect(typeof s.strategy).toBe('string')
      expect(typeof s.costEffectiveness).toBe('number')
      expect(typeof s.riskReduction).toBe('number')
      expect(typeof s.coverage).toBe('number')
    }
    // Verify sorted descending by costEffectiveness
    for (let i = 1; i < strategies.length; i++) {
      expect(strategies[i - 1].costEffectiveness).toBeGreaterThanOrEqual(
        strategies[i].costEffectiveness,
      )
    }
  })

  it('returns empty array when model has no threats', () => {
    const modeler = new ThreatModeler()
    const model = modeler.createModel('Empty')
    const strategies = modeler.compareMitigationStrategies(model.id)
    expect(strategies).toEqual([])
  })
})

// ── Feedback Tests ──

describe('ThreatModeler provideFeedback', () => {
  let modeler: ThreatModeler
  let modelId: string
  let threatId: string

  beforeEach(() => {
    modeler = new ThreatModeler()
    const model = modeler.createModel('Feedback Test')
    modelId = model.id
    modeler.addAsset(modelId, {
      name: 'App',
      type: 'service',
      sensitivity: 'internal',
      description: 'Application',
    })
    const threats = modeler.identifyThreats(modelId)
    threatId = threats[0].id
  })

  it('increments feedback count on valid feedback', () => {
    const before = modeler.getStats().feedbackCount
    modeler.provideFeedback(modelId, threatId, true, 'Confirmed valid')
    expect(modeler.getStats().feedbackCount).toBe(before + 1)
  })

  it('marks threat as accepted when feedback is invalid', () => {
    modeler.provideFeedback(modelId, threatId, false, 'False positive')
    const model = modeler.getModel(modelId)!
    const threat = model.threats.find(t => t.id === threatId)
    expect(threat!.status).toBe('accepted')
  })
})

// ── Stats Tests ──

describe('ThreatModeler getStats', () => {
  it('returns zeroed stats for a fresh instance', () => {
    const modeler = new ThreatModeler()
    const stats = modeler.getStats()
    expect(stats.totalModels).toBe(0)
    expect(stats.totalThreats).toBe(0)
    expect(stats.totalMitigations).toBe(0)
    expect(stats.totalAttackTrees).toBe(0)
    expect(stats.avgRiskScore).toBe(0)
    expect(stats.feedbackCount).toBe(0)
  })

  it('reflects models, threats, and attack trees after activity', () => {
    const modeler = new ThreatModeler()
    const model = modeler.createModel('Stats Test')
    modeler.addAsset(model.id, {
      name: 'Server',
      type: 'infrastructure',
      sensitivity: 'confidential',
      description: 'App server',
    })
    modeler.identifyThreats(model.id)
    modeler.buildAttackTree(model.id, 'Gain access')

    const stats = modeler.getStats()
    expect(stats.totalModels).toBe(1)
    expect(stats.totalThreats).toBeGreaterThan(0)
    expect(stats.totalAttackTrees).toBe(1)
  })
})

// ── Serialization Tests ──

describe('ThreatModeler serialize / deserialize', () => {
  it('round-trips through serialization preserving models and threats', () => {
    const original = new ThreatModeler({ maxThreats: 50 })
    const model = original.createModel('Serialize Test', 'desc')
    original.addAsset(model.id, {
      name: 'DB',
      type: 'data',
      sensitivity: 'restricted',
      description: 'Database',
    })
    original.identifyThreats(model.id)
    original.provideFeedback(model.id, model.threats[0].id, true, 'ok')

    const json = original.serialize()
    const restored = ThreatModeler.deserialize(json)

    expect(restored).toBeInstanceOf(ThreatModeler)

    const restoredStats = restored.getStats()
    const originalStats = original.getStats()
    expect(restoredStats.totalModels).toBe(originalStats.totalModels)
    expect(restoredStats.totalThreats).toBe(originalStats.totalThreats)
    expect(restoredStats.feedbackCount).toBe(originalStats.feedbackCount)
  })

  it('deserialized instance can create new models', () => {
    const original = new ThreatModeler()
    original.createModel('First')
    const json = original.serialize()

    const restored = ThreatModeler.deserialize(json)
    const newModel = restored.createModel('Second')
    expect(newModel.name).toBe('Second')
    expect(restored.listModels()).toHaveLength(2)
  })
})
