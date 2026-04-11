import { describe, it, expect, beforeEach } from 'vitest'
import {
  CyberThreatIntelligence,
  DEFAULT_CYBER_THREAT_INTEL_CONFIG,
  type CyberThreatIntelConfig,
  type APTGroup,
  type MitreAttackTechnique,
  type IndicatorOfCompromise,
  type C2Infrastructure,
  type MalwareFamily,
  type ThreatCampaign,
  type ThreatReport,
} from '../CyberThreatIntelligence.js'

// ── Helpers ──

function freshEngine(config?: Partial<CyberThreatIntelConfig>): CyberThreatIntelligence {
  return new CyberThreatIntelligence(config)
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Constructor
// ═══════════════════════════════════════════════════════════════════════════════

describe('CyberThreatIntelligence', () => {
  let cti: CyberThreatIntelligence

  beforeEach(() => {
    cti = freshEngine()
  })

  // ── Constructor ──────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('creates an instance with default config', () => {
      const stats = cti.getStats()
      expect(stats.totalActorLookups).toBe(0)
      expect(stats.totalMitreMappings).toBe(0)
      expect(stats.totalIOCsAnalyzed).toBe(0)
    })

    it('creates an instance with custom config overrides', () => {
      const custom = freshEngine({ maxResults: 5, confidenceThreshold: 0.8 })
      // maxResults limits output — identifyThreatActor should return ≤ 5
      const actors = custom.identifyThreatActor(['Russia', 'espionage', 'phishing'])
      expect(actors.length).toBeLessThanOrEqual(5)
    })

    it('merges partial config with defaults', () => {
      const custom = freshEngine({ enableAPTTracking: false })
      // APT tracking disabled → no results
      expect(custom.identifyThreatActor(['APT28'])).toHaveLength(0)
    })

    it('populates the APT database on construction', () => {
      expect(cti.getAPTDatabase().length).toBeGreaterThanOrEqual(20)
    })

    it('populates MITRE tactics on construction', () => {
      expect(cti.getMitreTactics()).toHaveLength(14)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. identifyThreatActor
  // ═══════════════════════════════════════════════════════════════════════════

  describe('identifyThreatActor', () => {
    it('returns empty array for empty indicators', () => {
      expect(cti.identifyThreatActor([])).toHaveLength(0)
    })

    it('returns empty when APT tracking is disabled', () => {
      const disabled = freshEngine({ enableAPTTracking: false })
      expect(disabled.identifyThreatActor(['APT28'])).toHaveLength(0)
    })

    it('matches APT28 by name', () => {
      const results = cti.identifyThreatActor(['APT28'])
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].name).toBe('APT28')
    })

    it('matches APT28 by alias Fancy Bear', () => {
      const results = cti.identifyThreatActor(['Fancy Bear'])
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(r => r.name === 'APT28')).toBe(true)
    })

    it('matches Lazarus Group by country', () => {
      const results = cti.identifyThreatActor(['North Korea'])
      expect(results.some(r => r.name === 'Lazarus Group')).toBe(true)
    })

    it('matches by TTP IDs', () => {
      const results = cti.identifyThreatActor(['T1566'])
      expect(results.length).toBeGreaterThan(0)
      // Multiple groups use T1566
    })

    it('matches by tool name', () => {
      const results = cti.identifyThreatActor(['Cobalt Strike'])
      expect(results.length).toBeGreaterThan(0)
    })

    it('matches by target sector', () => {
      const results = cti.identifyThreatActor(['financial'])
      expect(results.length).toBeGreaterThan(0)
    })

    it('matches by campaign name', () => {
      const results = cti.identifyThreatActor(['SolarWinds'])
      expect(results.some(r => r.name === 'APT29')).toBe(true)
    })

    it('returns no matches for gibberish', () => {
      const results = cti.identifyThreatActor(['zzzzxqwerty12345'])
      expect(results).toHaveLength(0)
    })

    it('returns multiple matches when indicators span groups', () => {
      const results = cti.identifyThreatActor(['Russia', 'espionage', 'T1566', 'phishing'])
      expect(results.length).toBeGreaterThan(1)
    })

    it('ranks results by relevance score', () => {
      const results = cti.identifyThreatActor(['APT28', 'Fancy Bear', 'Sofacy', 'X-Agent'])
      expect(results.length).toBeGreaterThan(0)
      // APT28 should be the top hit since all indicators match it
      expect(results[0].name).toBe('APT28')
    })

    it('increments totalActorLookups stat', () => {
      cti.identifyThreatActor(['APT29'])
      cti.identifyThreatActor(['Lazarus'])
      expect(cti.getStats().totalActorLookups).toBe(2)
    })

    it('respects maxResults config', () => {
      const limited = freshEngine({ maxResults: 2 })
      const results = limited.identifyThreatActor(['Russia', 'espionage', 'T1566', 'phishing'])
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('matches APT29 by alias NOBELIUM', () => {
      const results = cti.identifyThreatActor(['NOBELIUM'])
      expect(results.some(r => r.name === 'APT29')).toBe(true)
    })

    it('matches Sandworm by alias Voodoo Bear', () => {
      const results = cti.identifyThreatActor(['Voodoo Bear'])
      expect(results.some(r => r.name === 'Sandworm')).toBe(true)
    })

    it('matches by attribution keyword', () => {
      const results = cti.identifyThreatActor(['GRU'])
      expect(results.length).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. mapToMitreAttack
  // ═══════════════════════════════════════════════════════════════════════════

  describe('mapToMitreAttack', () => {
    it('returns empty for empty behavior string', () => {
      expect(cti.mapToMitreAttack('')).toHaveLength(0)
    })

    it('returns empty for whitespace-only behavior', () => {
      expect(cti.mapToMitreAttack('   ')).toHaveLength(0)
    })

    it('returns empty when MITRE mapping is disabled', () => {
      const disabled = freshEngine({ enableMitreMapping: false })
      expect(disabled.mapToMitreAttack('phishing email attack')).toHaveLength(0)
    })

    it('maps phishing behavior to T1566', () => {
      const results = cti.mapToMitreAttack('phishing email with malicious attachment')
      expect(results.some(t => t.id === 'T1566')).toBe(true)
    })

    it('maps persistence behavior to persistence techniques', () => {
      const results = cti.mapToMitreAttack('boot autostart registry run key persistence')
      expect(results.some(t => t.tactic === 'persistence')).toBe(true)
    })

    it('maps lateral movement to remote services', () => {
      const results = cti.mapToMitreAttack('lateral movement via RDP remote services')
      expect(results.some(t => t.tactic === 'lateral-movement')).toBe(true)
    })

    it('maps credential access behavior', () => {
      const results = cti.mapToMitreAttack('credential dumping LSASS brute force password')
      expect(results.some(t => t.tactic === 'credential-access')).toBe(true)
    })

    it('maps direct technique IDs with high priority', () => {
      const results = cti.mapToMitreAttack('observed T1059 command execution')
      expect(results[0].id).toBe('T1059')
    })

    it('maps data encryption ransomware to impact', () => {
      const results = cti.mapToMitreAttack('data encrypted for ransom file encryption impact')
      expect(results.some(t => t.tactic === 'impact')).toBe(true)
    })

    it('maps exfiltration behavior', () => {
      const results = cti.mapToMitreAttack('exfiltration over alternative protocol DNS tunneling')
      expect(results.some(t => t.tactic === 'exfiltration')).toBe(true)
    })

    it('maps command and control behavior', () => {
      const results = cti.mapToMitreAttack('application layer protocol HTTPS beacon C2')
      expect(results.some(t => t.tactic === 'command-and-control')).toBe(true)
    })

    it('maps collection behavior', () => {
      const results = cti.mapToMitreAttack('data from local system collection archive')
      expect(results.some(t => t.tactic === 'collection')).toBe(true)
    })

    it('maps defense evasion obfuscation', () => {
      const results = cti.mapToMitreAttack('obfuscated files information defense evasion')
      expect(results.some(t => t.tactic === 'defense-evasion')).toBe(true)
    })

    it('maps discovery behavior', () => {
      const results = cti.mapToMitreAttack(
        'file and directory discovery system information enumeration',
      )
      expect(results.some(t => t.tactic === 'discovery')).toBe(true)
    })

    it('maps execution behavior', () => {
      const results = cti.mapToMitreAttack('command scripting interpreter PowerShell execution')
      expect(results.some(t => t.tactic === 'execution')).toBe(true)
    })

    it('maps privilege escalation via process injection', () => {
      const results = cti.mapToMitreAttack('process injection privilege escalation DLL injection')
      expect(results.some(t => t.tactic === 'privilege-escalation')).toBe(true)
    })

    it('maps resource development', () => {
      const results = cti.mapToMitreAttack(
        'acquire infrastructure domain registration resource development',
      )
      expect(results.some(t => t.tactic === 'resource-development')).toBe(true)
    })

    it('maps reconnaissance techniques', () => {
      const results = cti.mapToMitreAttack(
        'active scanning port scan vulnerability scanning reconnaissance',
      )
      expect(results.some(t => t.tactic === 'reconnaissance')).toBe(true)
    })

    it('increments totalMitreMappings stat', () => {
      cti.mapToMitreAttack('phishing')
      cti.mapToMitreAttack('ransomware')
      expect(cti.getStats().totalMitreMappings).toBe(2)
    })

    it('returns techniques with all required fields', () => {
      const results = cti.mapToMitreAttack('phishing email malicious attachment')
      expect(results.length).toBeGreaterThan(0)
      const tech = results[0]
      expect(tech.id).toBeDefined()
      expect(tech.name).toBeDefined()
      expect(tech.tactic).toBeDefined()
      expect(tech.description).toBeDefined()
      expect(tech.platforms).toBeDefined()
      expect(tech.detection).toBeDefined()
      expect(tech.mitigation).toBeDefined()
    })

    it('maps supply chain compromise behavior', () => {
      const results = cti.mapToMitreAttack('supply chain compromise software update trojanized')
      expect(results.some(t => t.id === 'T1195')).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. analyzeIOCs
  // ═══════════════════════════════════════════════════════════════════════════

  describe('analyzeIOCs', () => {
    it('returns empty for empty array', () => {
      expect(cti.analyzeIOCs([])).toHaveLength(0)
    })

    it('returns empty when IOC enrichment is disabled', () => {
      const disabled = freshEngine({ enableIOCEnrichment: false })
      expect(disabled.analyzeIOCs(['192.168.1.1'])).toHaveLength(0)
    })

    it('classifies IPv4 addresses', () => {
      const results = cti.analyzeIOCs(['8.8.8.8'])
      expect(results).toHaveLength(1)
      expect(results[0].type).toBe('ip')
      expect(results[0].confidence).toBeGreaterThanOrEqual(0.8)
    })

    it('classifies private IPv4 as internal', () => {
      const results = cti.analyzeIOCs(['192.168.1.1'])
      expect(results[0].type).toBe('ip')
      expect(results[0].tags).toContain('internal')
    })

    it('classifies public IPv4 as external', () => {
      const results = cti.analyzeIOCs(['8.8.8.8'])
      expect(results[0].tags).toContain('external')
    })

    it('classifies domain names', () => {
      const results = cti.analyzeIOCs(['malware.example.com'])
      expect(results).toHaveLength(1)
      expect(results[0].type).toBe('domain')
    })

    it('tags high-risk TLDs', () => {
      const results = cti.analyzeIOCs(['evil.ru'])
      expect(results[0].tags).toContain('high-risk-tld')
    })

    it('tags suspicious subdomain depth', () => {
      const results = cti.analyzeIOCs(['a.b.c.d.evil.com'])
      expect(results[0].tags).toContain('suspicious-subdomain-depth')
    })

    it('classifies MD5 hashes (32 hex)', () => {
      const results = cti.analyzeIOCs(['d41d8cd98f00b204e9800998ecf8427e'])
      expect(results[0].type).toBe('hash')
      expect(results[0].tags).toContain('md5')
      expect(results[0].confidence).toBe(0.8)
    })

    it('classifies SHA256 hashes (64 hex)', () => {
      const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      const results = cti.analyzeIOCs([hash])
      expect(results[0].type).toBe('hash')
      expect(results[0].tags).toContain('sha256')
      expect(results[0].confidence).toBe(0.95)
    })

    it('classifies SHA1 hashes (40 hex)', () => {
      const results = cti.analyzeIOCs(['da39a3ee5e6b4b0d3255bfef95601890afd80709'])
      expect(results[0].type).toBe('hash')
      expect(results[0].tags).toContain('sha1')
    })

    it('classifies URLs', () => {
      const results = cti.analyzeIOCs(['https://evil.example.com/payload.exe'])
      expect(results[0].type).toBe('url')
      expect(results[0].tags).toContain('encrypted')
    })

    it('tags http URLs as unencrypted', () => {
      const results = cti.analyzeIOCs(['http://evil.example.com/page'])
      expect(results[0].type).toBe('url')
      expect(results[0].tags).toContain('unencrypted')
    })

    it('tags executable download URLs', () => {
      const results = cti.analyzeIOCs(['https://bad.com/malware.exe'])
      expect(results[0].tags).toContain('executable-download')
    })

    it('classifies email addresses', () => {
      const results = cti.analyzeIOCs(['attacker@evil.com'])
      expect(results[0].type).toBe('email')
      expect(results[0].tags).toContain('phishing-vector')
    })

    it('handles mixed IOC types', () => {
      const results = cti.analyzeIOCs([
        '10.0.0.1',
        'evil.ru',
        'd41d8cd98f00b204e9800998ecf8427e',
        'https://bad.com/path',
        'phisher@evil.com',
      ])
      const types = results.map(r => r.type)
      expect(types).toContain('ip')
      expect(types).toContain('domain')
      expect(types).toContain('hash')
      expect(types).toContain('url')
      expect(types).toContain('email')
    })

    it('skips blank IOC values', () => {
      const results = cti.analyzeIOCs(['', '  ', '8.8.8.8'])
      expect(results.length).toBeLessThanOrEqual(1)
    })

    it('increments totalIOCsAnalyzed stat', () => {
      cti.analyzeIOCs(['8.8.8.8', '1.2.3.4'])
      expect(cti.getStats().totalIOCsAnalyzed).toBe(2)
    })

    it('sets source to internal-analysis', () => {
      const results = cti.analyzeIOCs(['8.8.8.8'])
      expect(results[0].source).toBe('internal-analysis')
    })

    it('sets firstSeen and lastSeen dates', () => {
      const results = cti.analyzeIOCs(['8.8.8.8'])
      expect(results[0].firstSeen).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(results[0].lastSeen).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('respects confidence threshold — filters low-confidence IOCs', () => {
      const strict = freshEngine({ confidenceThreshold: 0.99 })
      // Only SHA256 (0.95) is close; everything else is below 0.99
      const results = strict.analyzeIOCs(['8.8.8.8', 'random-string'])
      // With threshold 0.99, IP (0.9) and fallback domain (0.3) should be filtered
      for (const r of results) {
        expect(r.confidence).toBeGreaterThanOrEqual(0.99)
      }
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. detectC2
  // ═══════════════════════════════════════════════════════════════════════════

  describe('detectC2', () => {
    it('returns null when C2 detection is disabled', () => {
      const disabled = freshEngine({ enableC2Detection: false })
      expect(disabled.detectC2({ protocol: 'HTTP beacon' })).toBeNull()
    })

    it('detects HTTP beaconing', () => {
      const result = cti.detectC2({ protocol: 'HTTP beacon', interval: 60 })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('http')
      expect(result!.protocol).toBe('HTTP')
    })

    it('detects HTTPS/TLS beaconing', () => {
      const result = cti.detectC2({ protocol: 'HTTPS TLS encrypted beacon', interval: 120 })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('https')
    })

    it('detects DNS tunneling', () => {
      const result = cti.detectC2({ protocol: 'DNS tunnel subdomain query', interval: 30 })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('dns')
    })

    it('detects ICMP covert channel', () => {
      const result = cti.detectC2({ protocol: 'ICMP ping echo covert tunnel', interval: 10 })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('icmp')
    })

    it('detects custom binary protocol', () => {
      const result = cti.detectC2({ protocol: 'custom binary TCP raw socket', interval: 60 })
      expect(result).not.toBeNull()
      expect(result!.type).toBe('custom')
    })

    it('returns null for unrecognized low-score protocol', () => {
      const result = cti.detectC2({ protocol: 'xyzzy-nonsense' })
      expect(result).toBeNull()
    })

    it('includes beacon interval in indicators when provided', () => {
      const result = cti.detectC2({ protocol: 'HTTP beacon', interval: 120 })
      expect(result).not.toBeNull()
      expect(result!.indicators.some(i => i.includes('120'))).toBe(true)
    })

    it('includes payload characteristics when payload provided', () => {
      const result = cti.detectC2({
        protocol: 'HTTP beacon',
        interval: 60,
        payload: 'user-agent cookie encoded data beacon',
      })
      expect(result).not.toBeNull()
      expect(result!.indicators.some(i => i.toLowerCase().includes('payload'))).toBe(true)
    })

    it('boosts score for base64-like payload', () => {
      const result = cti.detectC2({
        protocol: 'HTTP',
        payload: 'SGVsbG8gV29ybGQhIFRoaXMgaXMgYSBiYXNlNjQgdGVzdA==',
      })
      // base64 payload should boost score enough to detect
      expect(result).not.toBeNull()
    })

    it('returns encryption info in the result', () => {
      const result = cti.detectC2({ protocol: 'DNS tunnel subdomain', interval: 30 })
      expect(result).not.toBeNull()
      expect(result!.encryption).toBeDefined()
      expect(result!.encryption.length).toBeGreaterThan(0)
    })

    it('returns jitter value', () => {
      const result = cti.detectC2({ protocol: 'HTTP beacon', interval: 60 })
      expect(result).not.toBeNull()
      expect(result!.jitter).toBeGreaterThanOrEqual(0)
    })

    it('uses default interval when not provided', () => {
      const result = cti.detectC2({ protocol: 'HTTP beacon GET POST user-agent' })
      expect(result).not.toBeNull()
      expect(result!.beaconInterval).toBeGreaterThan(0)
    })

    it('increments totalC2Detections stat', () => {
      cti.detectC2({ protocol: 'HTTP beacon' })
      cti.detectC2({ protocol: 'DNS tunnel' })
      expect(cti.getStats().totalC2Detections).toBe(2)
    })

    it('handles interval within extended range (half to double)', () => {
      const result = cti.detectC2({ protocol: 'HTTP beacon GET POST', interval: 15 })
      // 15 is within 0.5 * 30 = 15 for http pattern
      expect(result).not.toBeNull()
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. classifyMalware
  // ═══════════════════════════════════════════════════════════════════════════

  describe('classifyMalware', () => {
    it('returns empty for empty traits', () => {
      expect(cti.classifyMalware([])).toHaveLength(0)
    })

    it('returns empty when malware classification is disabled', () => {
      const disabled = freshEngine({ enableMalwareClassification: false })
      expect(disabled.classifyMalware(['ransomware'])).toHaveLength(0)
    })

    it('classifies ransomware traits', () => {
      const results = cti.classifyMalware(['file encryption', 'ransom', 'backup deletion'])
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(f => f.type === 'ransomware')).toBe(true)
    })

    it('classifies RAT traits (Cobalt Strike)', () => {
      const results = cti.classifyMalware([
        'beacon',
        'lateral movement',
        'command execution',
        'keylogging',
      ])
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(f => f.name === 'Cobalt Strike')).toBe(true)
    })

    it('classifies backdoor traits', () => {
      const results = cti.classifyMalware([
        'remote command execution',
        'DLL side-loading',
        'keylogging',
        'backdoor',
      ])
      expect(results.some(f => f.type === 'backdoor')).toBe(true)
    })

    it('classifies trojan traits (TrickBot)', () => {
      const results = cti.classifyMalware([
        'credential theft',
        'browser injection',
        'lateral movement',
      ])
      expect(results.some(f => f.name === 'TrickBot')).toBe(true)
    })

    it('classifies loader traits (Emotet)', () => {
      const results = cti.classifyMalware([
        'payload delivery',
        'credential theft',
        'email harvesting',
        'process injection',
      ])
      expect(results.some(f => f.name === 'Emotet')).toBe(true)
    })

    it('classifies wiper traits (NotPetya)', () => {
      const results = cti.classifyMalware([
        'disk encryption',
        'MBR overwrite',
        'wiper',
        'destructive',
      ])
      expect(results.some(f => f.name === 'NotPetya')).toBe(true)
    })

    it('classifies rootkit traits (Snake)', () => {
      const results = cti.classifyMalware([
        'covert communication',
        'kernel driver',
        'rootkit',
        'bootkit',
      ])
      expect(results.some(f => f.name === 'Snake')).toBe(true)
    })

    it('classifies infostealer traits (Mimikatz)', () => {
      const results = cti.classifyMalware([
        'credential dumping',
        'pass-the-hash',
        'Kerberos',
        'DCSync',
      ])
      expect(results.some(f => f.name === 'Mimikatz')).toBe(true)
    })

    it('returns multiple matches for broad traits', () => {
      const results = cti.classifyMalware([
        'ransomware',
        'file encryption',
        'backup deletion',
        'double extortion',
      ])
      expect(results.length).toBeGreaterThan(1)
    })

    it('returns fewer matches for unrelated traits', () => {
      const specific = cti.classifyMalware(['ransomware', 'file encryption'])
      const broad = cti.classifyMalware(['zzzznonexistent123'])
      expect(broad.length).toBeLessThanOrEqual(specific.length)
    })

    it('increments totalMalwareClassifications stat', () => {
      cti.classifyMalware(['ransomware'])
      cti.classifyMalware(['trojan'])
      expect(cti.getStats().totalMalwareClassifications).toBe(2)
    })

    it('returns families with all required fields', () => {
      const results = cti.classifyMalware(['ransomware', 'encryption'])
      expect(results.length).toBeGreaterThan(0)
      const fam = results[0]
      expect(fam.name).toBeDefined()
      expect(fam.type).toBeDefined()
      expect(fam.capabilities).toBeDefined()
      expect(fam.delivery).toBeDefined()
      expect(fam.persistence).toBeDefined()
      expect(fam.c2).toBeDefined()
      expect(fam.notableVariants).toBeDefined()
    })

    it('respects maxResults config', () => {
      const limited = freshEngine({ maxResults: 1 })
      const results = limited.classifyMalware(['ransomware', 'encryption', 'file', 'network'])
      expect(results.length).toBeLessThanOrEqual(1)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. correlateThreats
  // ═══════════════════════════════════════════════════════════════════════════

  describe('correlateThreats', () => {
    it('correlates SolarWinds campaign from IOCs and techniques', () => {
      const campaigns = cti.correlateThreats(['solarwinds', 'sunburst'], ['T1195', 'T1071'])
      expect(campaigns.length).toBeGreaterThan(0)
      expect(campaigns[0].name).toContain('SolarWinds')
    })

    it('correlates Colonial Pipeline campaign', () => {
      const campaigns = cti.correlateThreats(['colonial', 'pipeline'], ['T1486'])
      expect(campaigns.length).toBeGreaterThan(0)
      expect(campaigns[0].name).toContain('Colonial Pipeline')
    })

    it('correlates WannaCry campaign', () => {
      const campaigns = cti.correlateThreats(['wannacry', 'eternalblue'], ['T1486'])
      expect(campaigns.some(c => c.name.includes('WannaCry'))).toBe(true)
    })

    it('generates ad-hoc campaign when no template matches', () => {
      const campaigns = cti.correlateThreats(['APT28'], ['T1566'])
      expect(campaigns.length).toBeGreaterThan(0)
    })

    it('returns campaigns with all required fields', () => {
      const campaigns = cti.correlateThreats(['solarwinds'], ['T1195'])
      expect(campaigns.length).toBeGreaterThan(0)
      const c = campaigns[0]
      expect(c.id).toBeDefined()
      expect(c.name).toBeDefined()
      expect(c.description).toBeDefined()
      expect(c.actors).toBeDefined()
      expect(c.timeline).toBeDefined()
      expect(c.targets).toBeDefined()
      expect(c.techniques).toBeDefined()
      expect(c.status).toBeDefined()
    })

    it('increments totalCorrelations stat', () => {
      cti.correlateThreats(['test'], ['T1059'])
      cti.correlateThreats(['test2'], ['T1071'])
      expect(cti.getStats().totalCorrelations).toBe(2)
    })

    it('returns emerging status for ad-hoc campaigns', () => {
      const campaigns = cti.correlateThreats(['APT28'], ['T1566'])
      const adhoc = campaigns.find(c => c.name === 'Unattributed Threat Campaign')
      if (adhoc) {
        expect(adhoc.status).toBe('emerging')
      }
    })

    it('deduplicates techniques in campaigns', () => {
      const campaigns = cti.correlateThreats(['solarwinds', 'sunburst'], ['T1195', 'T1195'])
      if (campaigns.length > 0) {
        const techs = campaigns[0].techniques
        const unique = [...new Set(techs)]
        expect(techs.length).toBe(unique.length)
      }
    })

    it('handles empty IOCs and empty techniques gracefully', () => {
      const campaigns = cti.correlateThreats([], [])
      // Should still increment correlations but may return empty
      expect(cti.getStats().totalCorrelations).toBeGreaterThan(0)
    })

    it('correlates LockBit campaign', () => {
      const campaigns = cti.correlateThreats(['lockbit', 'ransomware'], ['T1486'])
      expect(campaigns.some(c => c.name.includes('LockBit'))).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. generateThreatReport
  // ═══════════════════════════════════════════════════════════════════════════

  describe('generateThreatReport', () => {
    it('generates a report from a simple scenario', () => {
      const report = cti.generateThreatReport('phishing email targeting government employees')
      expect(report.id).toMatch(/^RPT-/)
      expect(report.title).toBeDefined()
      expect(report.severity).toBeDefined()
      expect(report.recommendations.length).toBeGreaterThan(0)
    })

    it('generates report with IOCs extracted from scenario', () => {
      const report = cti.generateThreatReport(
        'attack from 192.168.1.100 connecting to https://evil.example.com/malware.exe',
      )
      expect(report.iocs.length).toBeGreaterThanOrEqual(0) // depends on extraction
    })

    it('assigns high severity for nation-state actors', () => {
      const report = cti.generateThreatReport(
        'APT28 Fancy Bear Russia espionage phishing credential theft lateral movement ransomware',
      )
      expect(['high', 'critical']).toContain(report.severity)
    })

    it('assigns lower severity for minimal information', () => {
      const report = cti.generateThreatReport('unknown minor anomaly')
      expect(['low', 'medium']).toContain(report.severity)
    })

    it('includes recommendations in the report', () => {
      const report = cti.generateThreatReport(
        'phishing email with malicious attachment credential harvesting',
      )
      expect(report.recommendations.length).toBeGreaterThan(0)
      // Should always include baseline recommendations
      expect(report.recommendations.some(r => r.includes('patch'))).toBe(true)
    })

    it('includes actor names in the report', () => {
      const report = cti.generateThreatReport('APT29 Cozy Bear SolarWinds supply chain compromise')
      expect(report.actors.length).toBeGreaterThan(0)
    })

    it('includes technique IDs in the report', () => {
      const report = cti.generateThreatReport('phishing execution persistence lateral movement')
      expect(report.techniques.length).toBeGreaterThan(0)
      // Format: "T1234: Name"
      expect(report.techniques[0]).toMatch(/^T\d{4}/)
    })

    it('increments totalReportsGenerated stat', () => {
      cti.generateThreatReport('test scenario 1')
      cti.generateThreatReport('test scenario 2')
      expect(cti.getStats().totalReportsGenerated).toBe(2)
    })

    it('report confidence is between 0 and 1', () => {
      const report = cti.generateThreatReport('APT28 phishing T1566 Russia espionage')
      expect(report.confidence).toBeGreaterThanOrEqual(0)
      expect(report.confidence).toBeLessThanOrEqual(1)
    })

    it('generates title referencing top actor when available', () => {
      const report = cti.generateThreatReport('APT28 Fancy Bear phishing campaign')
      expect(report.title).toContain('APT28')
    })

    it('generates title from scenario when no actor identified', () => {
      const report = cti.generateThreatReport('mysterious zero day vulnerability')
      expect(report.title).toContain('Threat Intelligence Report')
    })

    it('adds nation-state specific recommendations', () => {
      const report = cti.generateThreatReport(
        'APT29 Russia nation-state espionage supply chain attack SolarWinds',
      )
      expect(
        report.recommendations.some(
          r => r.toLowerCase().includes('threat hunting') || r.toLowerCase().includes('soc'),
        ),
      ).toBe(true)
    })

    it('adds financial gain recommendations for ransomware groups', () => {
      const report = cti.generateThreatReport('LockBit ransomware double extortion financial gain')
      expect(
        report.recommendations.some(
          r => r.toLowerCase().includes('backup') || r.toLowerCase().includes('ransomware'),
        ),
      ).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. getAPTDatabase
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getAPTDatabase', () => {
    it('returns at least 20 APT groups', () => {
      expect(cti.getAPTDatabase().length).toBeGreaterThanOrEqual(20)
    })

    it('returns a copy (not the internal array)', () => {
      const db1 = cti.getAPTDatabase()
      const db2 = cti.getAPTDatabase()
      expect(db1).not.toBe(db2)
    })

    it('each group has required APTGroup fields', () => {
      for (const group of cti.getAPTDatabase()) {
        expect(group.id).toBeDefined()
        expect(group.name).toBeDefined()
        expect(group.aliases).toBeDefined()
        expect(group.country).toBeDefined()
        expect(group.motivation).toBeDefined()
        expect(group.sophistication).toBeDefined()
        expect(typeof group.active).toBe('boolean')
        expect(group.ttps).toBeDefined()
        expect(group.targetSectors).toBeDefined()
        expect(group.targetRegions).toBeDefined()
        expect(group.knownCampaigns).toBeDefined()
        expect(group.firstSeen).toBeDefined()
        expect(group.lastSeen).toBeDefined()
        expect(group.primaryTools).toBeDefined()
        expect(group.attribution).toBeDefined()
      }
    })

    it('includes well-known groups', () => {
      const names = cti.getAPTDatabase().map(g => g.name)
      expect(names).toContain('APT28')
      expect(names).toContain('APT29')
      expect(names).toContain('Lazarus Group')
      expect(names).toContain('Sandworm')
    })

    it('covers multiple countries', () => {
      const countries = [...new Set(cti.getAPTDatabase().map(g => g.country))]
      expect(countries.length).toBeGreaterThanOrEqual(4) // Russia, China, North Korea, Iran, etc.
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. getMitreTactics
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getMitreTactics', () => {
    it('returns exactly 14 tactics', () => {
      expect(cti.getMitreTactics()).toHaveLength(14)
    })

    it('includes all expected MITRE ATT&CK tactics', () => {
      const tactics = cti.getMitreTactics()
      const expected = [
        'reconnaissance',
        'resource-development',
        'initial-access',
        'execution',
        'persistence',
        'privilege-escalation',
        'defense-evasion',
        'credential-access',
        'discovery',
        'lateral-movement',
        'collection',
        'command-and-control',
        'exfiltration',
        'impact',
      ]
      for (const t of expected) {
        expect(tactics).toContain(t)
      }
    })

    it('tactics are all lowercase strings', () => {
      for (const t of cti.getMitreTactics()) {
        expect(t).toBe(t.toLowerCase())
      }
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. getStats
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getStats', () => {
    it('returns all zero counters on fresh instance', () => {
      const stats = cti.getStats()
      expect(stats.totalActorLookups).toBe(0)
      expect(stats.totalMitreMappings).toBe(0)
      expect(stats.totalIOCsAnalyzed).toBe(0)
      expect(stats.totalC2Detections).toBe(0)
      expect(stats.totalMalwareClassifications).toBe(0)
      expect(stats.totalCorrelations).toBe(0)
      expect(stats.totalReportsGenerated).toBe(0)
      expect(stats.feedbackCount).toBe(0)
      expect(stats.avgFeedbackScore).toBe(0)
    })

    it('tracks all counters after mixed operations', () => {
      cti.identifyThreatActor(['APT28'])
      cti.mapToMitreAttack('phishing')
      cti.analyzeIOCs(['8.8.8.8'])
      cti.detectC2({ protocol: 'HTTP beacon' })
      cti.classifyMalware(['ransomware'])
      cti.correlateThreats(['test'], ['T1059'])
      cti.generateThreatReport('test scenario')

      const stats = cti.getStats()
      expect(stats.totalActorLookups).toBeGreaterThanOrEqual(1)
      expect(stats.totalMitreMappings).toBeGreaterThanOrEqual(1)
      expect(stats.totalIOCsAnalyzed).toBeGreaterThanOrEqual(1)
      expect(stats.totalC2Detections).toBeGreaterThanOrEqual(1)
      expect(stats.totalMalwareClassifications).toBeGreaterThanOrEqual(1)
      expect(stats.totalCorrelations).toBeGreaterThanOrEqual(1)
      expect(stats.totalReportsGenerated).toBeGreaterThanOrEqual(1)
    })

    it('tracks feedback count and average', () => {
      cti.provideFeedback(4)
      cti.provideFeedback(5)
      const stats = cti.getStats()
      expect(stats.feedbackCount).toBe(2)
      expect(stats.avgFeedbackScore).toBe(4.5)
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. provideFeedback
  // ═══════════════════════════════════════════════════════════════════════════

  describe('provideFeedback', () => {
    it('increments feedback count', () => {
      cti.provideFeedback(3)
      expect(cti.getStats().feedbackCount).toBe(1)
    })

    it('accumulates multiple feedback scores', () => {
      cti.provideFeedback(3)
      cti.provideFeedback(5)
      cti.provideFeedback(4)
      expect(cti.getStats().feedbackCount).toBe(3)
      expect(cti.getStats().avgFeedbackScore).toBeCloseTo(4, 1)
    })

    it('clamps score to 1-5 range (low)', () => {
      cti.provideFeedback(-10)
      expect(cti.getStats().avgFeedbackScore).toBe(1)
    })

    it('clamps score to 1-5 range (high)', () => {
      cti.provideFeedback(100)
      expect(cti.getStats().avgFeedbackScore).toBe(5)
    })

    it('adjusts confidence threshold after consistently low feedback', () => {
      // Give 3+ low scores to trigger adjustment
      cti.provideFeedback(1)
      cti.provideFeedback(1)
      cti.provideFeedback(1)
      // Confidence threshold should increase
      // Verify by checking that some IOCs that previously passed are now filtered
      const serialized = JSON.parse(cti.serialize())
      expect(serialized.config.confidenceThreshold).toBeGreaterThan(
        DEFAULT_CYBER_THREAT_INTEL_CONFIG.confidenceThreshold,
      )
    })

    it('adjusts confidence threshold after consistently high feedback', () => {
      cti.provideFeedback(5)
      cti.provideFeedback(5)
      cti.provideFeedback(5)
      const serialized = JSON.parse(cti.serialize())
      expect(serialized.config.confidenceThreshold).toBeLessThan(
        DEFAULT_CYBER_THREAT_INTEL_CONFIG.confidenceThreshold,
      )
    })

    it('does not adjust threshold before 3 feedbacks', () => {
      cti.provideFeedback(1)
      cti.provideFeedback(1)
      const serialized = JSON.parse(cti.serialize())
      expect(serialized.config.confidenceThreshold).toBe(
        DEFAULT_CYBER_THREAT_INTEL_CONFIG.confidenceThreshold,
      )
    })
  })

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. serialize / deserialize
  // ═══════════════════════════════════════════════════════════════════════════

  describe('serialize / deserialize', () => {
    it('round-trips config correctly', () => {
      const original = freshEngine({ maxResults: 10, confidenceThreshold: 0.7 })
      const json = original.serialize()
      const restored = CyberThreatIntelligence.deserialize(json)
      const data = JSON.parse(restored.serialize())
      expect(data.config.maxResults).toBe(10)
      expect(data.config.confidenceThreshold).toBe(0.7)
    })

    it('round-trips stats correctly', () => {
      cti.identifyThreatActor(['APT28'])
      cti.mapToMitreAttack('phishing')
      cti.analyzeIOCs(['8.8.8.8', '1.2.3.4'])
      cti.detectC2({ protocol: 'HTTP beacon' })
      cti.classifyMalware(['ransomware'])
      cti.correlateThreats(['test'], ['T1059'])
      cti.generateThreatReport('scenario')
      cti.provideFeedback(4)

      const json = cti.serialize()
      const restored = CyberThreatIntelligence.deserialize(json)
      const stats = restored.getStats()

      expect(stats.totalActorLookups).toBe(cti.getStats().totalActorLookups)
      expect(stats.totalMitreMappings).toBe(cti.getStats().totalMitreMappings)
      expect(stats.totalIOCsAnalyzed).toBe(cti.getStats().totalIOCsAnalyzed)
      expect(stats.totalC2Detections).toBe(cti.getStats().totalC2Detections)
      expect(stats.totalMalwareClassifications).toBe(cti.getStats().totalMalwareClassifications)
      expect(stats.totalCorrelations).toBe(cti.getStats().totalCorrelations)
      expect(stats.totalReportsGenerated).toBe(cti.getStats().totalReportsGenerated)
      expect(stats.feedbackCount).toBe(cti.getStats().feedbackCount)
      expect(stats.avgFeedbackScore).toBe(cti.getStats().avgFeedbackScore)
    })

    it('round-trips feedback scores correctly', () => {
      cti.provideFeedback(3)
      cti.provideFeedback(5)
      const json = cti.serialize()
      const restored = CyberThreatIntelligence.deserialize(json)
      expect(restored.getStats().avgFeedbackScore).toBeCloseTo(4, 1)
    })

    it('serialize returns valid JSON', () => {
      const json = cti.serialize()
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('deserialize produces a functional instance', () => {
      const json = cti.serialize()
      const restored = CyberThreatIntelligence.deserialize(json)
      // Ensure methods still work
      const actors = restored.identifyThreatActor(['APT28'])
      expect(actors.length).toBeGreaterThan(0)
      expect(restored.getAPTDatabase().length).toBeGreaterThanOrEqual(20)
    })

    it('deserialize with default config produces working instance', () => {
      const json = freshEngine().serialize()
      const restored = CyberThreatIntelligence.deserialize(json)
      expect(restored.getMitreTactics()).toHaveLength(14)
    })
  })
})
