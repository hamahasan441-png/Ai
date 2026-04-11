import { describe, it, expect, beforeEach } from 'vitest'
import {
  NetworkForensics,
  type PacketInfo,
  type NetworkAnomaly,
  type NetworkTopology,
} from '../NetworkForensics'

// ── Helpers ──

function makePacket(overrides: Partial<PacketInfo> = {}): PacketInfo {
  return {
    id: `pkt-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    sourceIP: '192.168.1.10',
    destIP: '10.0.0.5',
    sourcePort: 49152,
    destPort: 80,
    protocol: 'tcp',
    size: 512,
    direction: 'outbound',
    ...overrides,
  }
}

function makePortScanPackets(count: number): PacketInfo[] {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) =>
    makePacket({
      id: `scan-${i}`,
      timestamp: now + i * 100,
      sourceIP: '192.168.1.50',
      destIP: '10.0.0.5',
      destPort: 1000 + i,
      flags: ['SYN'],
      direction: 'outbound',
    }),
  )
}

function _makeBruteForcePackets(count: number): PacketInfo[] {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) =>
    makePacket({
      id: `brute-${i}`,
      timestamp: now + i * 200,
      sourceIP: '203.0.113.5',
      destIP: '192.168.1.1',
      destPort: 22,
      protocol: 'ssh',
      direction: 'inbound',
    }),
  )
}

// ── Constructor Tests ──

describe('NetworkForensics constructor', () => {
  it('creates an instance with default config', () => {
    const nf = new NetworkForensics()
    expect(nf).toBeInstanceOf(NetworkForensics)
  })

  it('accepts a partial custom config', () => {
    const nf = new NetworkForensics({ maxPackets: 500 })
    expect(nf).toBeInstanceOf(NetworkForensics)
  })

  it('accepts a full custom config', () => {
    const nf = new NetworkForensics({
      maxPackets: 5000,
      enableAnomalyDetection: false,
      enableProtocolAnalysis: false,
      enableThreatCorrelation: false,
      alertThreshold: 0.5,
      retentionPeriod: 7,
      enableIncidentResponse: false,
    })
    expect(nf).toBeInstanceOf(NetworkForensics)
  })

  it('has playbooks available immediately after construction', () => {
    const nf = new NetworkForensics()
    const playbooks = nf.listPlaybooks()
    expect(playbooks.length).toBeGreaterThan(0)
  })
})

// ── analyzePackets Tests ──

describe('NetworkForensics analyzePackets', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('returns anomalies, patterns, and protocols arrays', () => {
    const packets = [makePacket()]
    const result = nf.analyzePackets(packets)
    expect(Array.isArray(result.anomalies)).toBe(true)
    expect(Array.isArray(result.patterns)).toBe(true)
    expect(Array.isArray(result.protocols)).toBe(true)
  })

  it('increments stats after analysis', () => {
    nf.analyzePackets([makePacket(), makePacket()])
    const stats = nf.getStats()
    expect(stats.totalAnalyses).toBe(1)
    expect(stats.totalPacketsAnalyzed).toBe(2)
  })

  it('respects maxPackets config', () => {
    const small = new NetworkForensics({ maxPackets: 3 })
    const packets = Array.from({ length: 10 }, () => makePacket())
    small.analyzePackets(packets)
    const stats = small.getStats()
    expect(stats.totalPacketsAnalyzed).toBe(3)
  })
})

// ── detectAnomalies Tests ──

describe('NetworkForensics detectAnomalies', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('returns an empty array for benign traffic', () => {
    const packets = [makePacket({ protocol: 'https', destPort: 443 })]
    const anomalies = nf.detectAnomalies(packets)
    expect(Array.isArray(anomalies)).toBe(true)
  })

  it('detects port scan anomalies when many dest ports are hit', () => {
    const packets = makePortScanPackets(30)
    const anomalies = nf.detectAnomalies(packets)
    const scanAnomaly = anomalies.find(a => a.type === 'port_scan')
    expect(scanAnomaly).toBeDefined()
    expect(scanAnomaly!.severity).toBeDefined()
    expect(scanAnomaly!.confidence).toBeGreaterThan(0)
  })

  it('each anomaly has required fields', () => {
    const packets = makePortScanPackets(30)
    const anomalies = nf.detectAnomalies(packets)
    for (const a of anomalies) {
      expect(typeof a.id).toBe('string')
      expect(a.id.length).toBeGreaterThan(0)
      expect(typeof a.type).toBe('string')
      expect(typeof a.severity).toBe('string')
      expect(typeof a.description).toBe('string')
      expect(typeof a.confidence).toBe('number')
      expect(Array.isArray(a.indicators)).toBe(true)
      expect(Array.isArray(a.relatedPackets)).toBe(true)
    }
  })

  it('filters anomalies below the alert threshold', () => {
    const strict = new NetworkForensics({ alertThreshold: 0.99 })
    const packets = makePortScanPackets(25)
    const anomalies = strict.detectAnomalies(packets)
    for (const a of anomalies) {
      expect(a.confidence).toBeGreaterThanOrEqual(0.99)
    }
  })
})

// ── analyzeProtocol Tests ──

describe('NetworkForensics analyzeProtocol', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('returns a ProtocolAnalysis with required fields', () => {
    const packets = [makePacket({ protocol: 'tcp' })]
    const result = nf.analyzeProtocol('tcp', packets)
    expect(result.protocol).toBe('tcp')
    expect(typeof result.compliance).toBe('boolean')
    expect(Array.isArray(result.vulnerabilities)).toBe(true)
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(typeof result.details).toBe('object')
  })

  it('flags unencrypted HTTP as non-compliant', () => {
    const packets = [makePacket({ protocol: 'http', destPort: 80 })]
    const result = nf.analyzeProtocol('http', packets)
    expect(result.compliance).toBe(false)
    expect(result.vulnerabilities).toContain('Unencrypted HTTP traffic detected')
  })

  it('marks HTTPS/TLS as compliant with encryption details', () => {
    const packets = [makePacket({ protocol: 'https', destPort: 443 })]
    const result = nf.analyzeProtocol('https', packets)
    expect(result.compliance).toBe(true)
    expect(result.details['encrypted']).toBe('true')
  })
})

// ── analyzeTrafficPattern Tests ──

describe('NetworkForensics analyzeTrafficPattern', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('returns an empty array for empty packets', () => {
    const result = nf.analyzeTrafficPattern([])
    expect(result).toEqual([])
  })

  it('matches normal browsing patterns for standard HTTP/HTTPS traffic', () => {
    const packets = Array.from({ length: 5 }, (_, i) =>
      makePacket({ protocol: 'https', destPort: 443, id: `https-${i}` }),
    )
    const patterns = nf.analyzeTrafficPattern(packets)
    const normal = patterns.find(p => p.category === 'normal')
    expect(normal).toBeDefined()
  })
})

// ── Incident Management Tests ──

describe('NetworkForensics incident management', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('creates an incident with required fields', () => {
    const incident = nf.createIncident('Suspicious port scan detected', 'high')
    expect(incident.id).toMatch(/^INC-/)
    expect(incident.title).toBe('Suspicious port scan detected')
    expect(incident.severity).toBe('high')
    expect(incident.status).toBe('open')
    expect(incident.timeline.length).toBe(1)
    expect(incident.timeline[0].action).toBe('Incident created')
  })

  it('updates an existing incident status and adds timeline entry', () => {
    const incident = nf.createIncident('Test incident', 'medium')
    const updated = nf.updateIncident(incident.id, { status: 'investigating' })
    expect(updated).not.toBeNull()
    expect(updated!.status).toBe('investigating')
    expect(updated!.timeline.length).toBe(2)
  })

  it('returns null when updating a non-existent incident', () => {
    const result = nf.updateIncident('INC-nonexistent', { status: 'closed' })
    expect(result).toBeNull()
  })

  it('adds a timeline entry to an existing incident', () => {
    const incident = nf.createIncident('Timeline test', 'low')
    const success = nf.addTimelineEntry(incident.id, {
      action: 'Investigated',
      actor: 'analyst',
      details: 'Reviewed logs',
    })
    expect(success).toBe(true)
    const fetched = nf.getIncident(incident.id)
    expect(fetched!.timeline.length).toBe(2)
  })

  it('returns false when adding timeline entry to non-existent incident', () => {
    const result = nf.addTimelineEntry('INC-fake', {
      action: 'test',
      actor: 'system',
      details: 'noop',
    })
    expect(result).toBe(false)
  })

  it('retrieves an incident by ID', () => {
    const incident = nf.createIncident('Retrieve test', 'critical')
    const fetched = nf.getIncident(incident.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.title).toBe('Retrieve test')
  })

  it('returns null for unknown incident ID', () => {
    expect(nf.getIncident('INC-nonexistent')).toBeNull()
  })

  it('lists incidents and filters by status', () => {
    nf.createIncident('Open incident', 'low')
    const inc2 = nf.createIncident('Resolved incident', 'medium')
    nf.updateIncident(inc2.id, { status: 'resolved' })

    const open = nf.listIncidents({ status: 'open' })
    expect(open.length).toBe(1)
    expect(open[0].title).toBe('Open incident')

    const resolved = nf.listIncidents({ status: 'resolved' })
    expect(resolved.length).toBe(1)
  })
})

// ── Playbook Tests ──

describe('NetworkForensics playbooks', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('retrieves a playbook for a known incident type', () => {
    const playbook = nf.getPlaybook('port_scan')
    expect(playbook).not.toBeNull()
    expect(playbook!.name).toBe('Port Scan Response')
    expect(playbook!.steps.length).toBeGreaterThan(0)
  })

  it('returns null for an unknown playbook type', () => {
    expect(nf.getPlaybook('nonexistent_type')).toBeNull()
  })

  it('lists all available playbook names', () => {
    const names = nf.listPlaybooks()
    expect(names).toContain('port_scan')
    expect(names).toContain('brute_force')
    expect(names).toContain('data_exfiltration')
    expect(names.length).toBeGreaterThanOrEqual(7)
  })
})

// ── Topology Tests ──

describe('NetworkForensics topology', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('maps a topology with nodes, connections, and segments from packets', () => {
    const packets = [
      makePacket({ sourceIP: '192.168.1.10', destIP: '10.0.0.5', protocol: 'tcp' }),
      makePacket({ sourceIP: '192.168.1.20', destIP: '10.0.0.5', protocol: 'http', destPort: 80 }),
    ]
    const topology = nf.mapTopology(packets)
    expect(topology.nodes.length).toBeGreaterThanOrEqual(3)
    expect(topology.connections.length).toBeGreaterThanOrEqual(2)
    expect(topology.segments.length).toBeGreaterThan(0)
  })

  it('identifyHighRiskNodes returns only nodes with risk > 50', () => {
    const topology: NetworkTopology = {
      nodes: [
        { id: 'n1', name: 'safe', type: 'workstation', ip: '192.168.1.10', services: [], risk: 10 },
        {
          id: 'n2',
          name: 'risky',
          type: 'server',
          ip: '10.0.0.5',
          services: ['HTTP', 'SSH'],
          risk: 75,
        },
        {
          id: 'n3',
          name: 'dangerous',
          type: 'server',
          ip: '203.0.113.5',
          services: ['MySQL'],
          risk: 90,
        },
      ],
      connections: [],
      segments: [],
    }
    const highRisk = nf.identifyHighRiskNodes(topology)
    expect(highRisk.length).toBe(2)
    expect(highRisk[0].risk).toBeGreaterThanOrEqual(highRisk[1].risk)
  })
})

// ── Threat Correlation Tests ──

describe('NetworkForensics correlateThreats', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('returns empty array when anomalies do not form a known threat pattern', () => {
    const anomalies: NetworkAnomaly[] = [
      {
        id: 'a1',
        type: 'unusual_port',
        severity: 'low',
        description: 'Unusual port',
        timestamp: Date.now(),
        confidence: 0.8,
        indicators: [],
        relatedPackets: [],
      },
    ]
    const threats = nf.correlateThreats(anomalies)
    expect(Array.isArray(threats)).toBe(true)
  })

  it('detects coordinated recon when port_scan + brute_force are present', () => {
    const anomalies: NetworkAnomaly[] = [
      {
        id: 'a1',
        type: 'port_scan',
        severity: 'medium',
        description: 'Port scan',
        timestamp: Date.now(),
        confidence: 0.9,
        indicators: [],
        relatedPackets: [],
      },
      {
        id: 'a2',
        type: 'brute_force',
        severity: 'high',
        description: 'Brute force',
        timestamp: Date.now(),
        confidence: 0.85,
        indicators: [],
        relatedPackets: [],
      },
    ]
    const threats = nf.correlateThreats(anomalies)
    const coordinated = threats.find(t => t.threat.includes('Coordinated'))
    expect(coordinated).toBeDefined()
    expect(coordinated!.confidence).toBeGreaterThan(0)
    expect(coordinated!.anomalies.length).toBe(2)
  })
})

// ── Traffic Pattern Management Tests ──

describe('NetworkForensics traffic pattern management', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('adds a custom traffic pattern and returns it with an id', () => {
    const pattern = nf.addTrafficPattern({
      name: 'Custom Malware Beacon',
      description: 'Periodic beacon to known malicious domain',
      signature: 'http.host==evil.com && interval < 60s',
      frequency: 80,
      riskLevel: 'malicious',
      category: 'custom',
    })
    expect(pattern.id).toMatch(/^TP-CUSTOM/)
    expect(pattern.name).toBe('Custom Malware Beacon')
  })

  it('searchPatterns finds patterns by name keyword', () => {
    const results = nf.searchPatterns('brute force')
    expect(results.length).toBeGreaterThan(0)
    const names = results.map(p => p.name.toLowerCase())
    expect(names.some(n => n.includes('brute'))).toBe(true)
  })

  it('searchPatterns returns all patterns for empty query', () => {
    const all = nf.searchPatterns('')
    expect(all.length).toBeGreaterThan(0)
  })
})

// ── Forensic Reporting Tests ──

describe('NetworkForensics forensic reporting', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('generates a general forensic report with required fields', () => {
    nf.analyzePackets([makePacket()])
    const report = nf.generateForensicReport()
    expect(report.id).toMatch(/^RPT-/)
    expect(typeof report.timestamp).toBe('number')
    expect(report.title).toContain('Summary')
    expect(Array.isArray(report.findings)).toBe(true)
    expect(Array.isArray(report.recommendations)).toBe(true)
    expect(typeof report.riskScore).toBe('number')
    expect(report.riskScore).toBeGreaterThanOrEqual(0)
    expect(report.riskScore).toBeLessThanOrEqual(100)
  })

  it('generates an incident-scoped report when incidentId is provided', () => {
    const incident = nf.createIncident('Scoped report test', 'high')
    const report = nf.generateForensicReport(incident.id)
    expect(report.title).toContain(incident.id)
    expect(report.incidents).toContain(incident.id)
  })

  it('exportEvidence returns empty string for unknown incident', () => {
    const result = nf.exportEvidence('INC-nonexistent')
    expect(result).toBe('')
  })

  it('exportEvidence returns text format by default', () => {
    const incident = nf.createIncident('Export test', 'medium')
    const text = nf.exportEvidence(incident.id)
    expect(text).toContain('INCIDENT REPORT')
    expect(text).toContain(incident.id)
  })

  it('exportEvidence returns valid JSON when format is json', () => {
    const incident = nf.createIncident('JSON export', 'low')
    const json = nf.exportEvidence(incident.id, 'json')
    const parsed = JSON.parse(json)
    expect(parsed.incident.id).toBe(incident.id)
    expect(Array.isArray(parsed.timeline)).toBe(true)
  })

  it('exportEvidence returns markdown when format is markdown', () => {
    const incident = nf.createIncident('MD export', 'critical')
    const md = nf.exportEvidence(incident.id, 'markdown')
    expect(md).toContain('# Incident Report')
    expect(md).toContain('## Timeline')
  })
})

// ── Feedback & Stats Tests ──

describe('NetworkForensics feedback and stats', () => {
  let nf: NetworkForensics

  beforeEach(() => {
    nf = new NetworkForensics()
  })

  it('provideFeedback increments feedbackCount', () => {
    nf.provideFeedback('ANOM-fake1', true)
    nf.provideFeedback('ANOM-fake2', false)
    const stats = nf.getStats()
    expect(stats.feedbackCount).toBe(2)
  })

  it('getStats returns all zero counters for a fresh instance', () => {
    const stats = nf.getStats()
    expect(stats.totalAnalyses).toBe(0)
    expect(stats.totalPacketsAnalyzed).toBe(0)
    expect(stats.totalAnomaliesDetected).toBe(0)
    expect(stats.totalIncidentsCreated).toBe(0)
    expect(stats.totalProtocolsAnalyzed).toBe(0)
    expect(stats.totalAlertsGenerated).toBe(0)
    expect(stats.feedbackCount).toBe(0)
  })
})

// ── Serialization Tests ──

describe('NetworkForensics serialization', () => {
  it('serialize returns valid JSON', () => {
    const nf = new NetworkForensics()
    nf.analyzePackets([makePacket()])
    const json = nf.serialize()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('deserialize restores stats and config', () => {
    const nf = new NetworkForensics({ maxPackets: 2000 })
    nf.analyzePackets([makePacket(), makePacket()])
    nf.createIncident('Serialize test', 'high')
    nf.provideFeedback('fake-id', true)

    const json = nf.serialize()
    const restored = NetworkForensics.deserialize(json)

    expect(restored).toBeInstanceOf(NetworkForensics)
    const stats = restored.getStats()
    expect(stats.totalAnalyses).toBe(1)
    expect(stats.totalPacketsAnalyzed).toBe(2)
    expect(stats.totalIncidentsCreated).toBe(1)
    expect(stats.feedbackCount).toBe(1)
  })

  it('deserialize preserves incidents so they can be retrieved', () => {
    const nf = new NetworkForensics()
    const incident = nf.createIncident('Persist test', 'critical')

    const json = nf.serialize()
    const restored = NetworkForensics.deserialize(json)
    const fetched = restored.getIncident(incident.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.title).toBe('Persist test')
  })

  it('deserialize preserves custom traffic patterns', () => {
    const nf = new NetworkForensics()
    nf.addTrafficPattern({
      name: 'Custom Pattern',
      description: 'Test',
      signature: 'test',
      frequency: 50,
      riskLevel: 'suspicious',
      category: 'custom',
    })

    const json = nf.serialize()
    const restored = NetworkForensics.deserialize(json)
    const found = restored.searchPatterns('Custom Pattern')
    expect(found.length).toBeGreaterThan(0)
    expect(found.some(p => p.name === 'Custom Pattern')).toBe(true)
  })
})
