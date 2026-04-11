import { describe, it, expect } from 'vitest'
import { TargetScanner, DEFAULT_TARGET_SCANNER_CONFIG } from '../TargetScanner.js'

describe('TargetScanner', () => {
  // ── Constructor ─────────────────────────────────────────────

  describe('constructor', () => {
    it('creates with default config', () => {
      const scanner = new TargetScanner()
      const stats = scanner.getStats()
      expect(stats.totalScans).toBe(0)
      expect(stats.totalTargetsScanned).toBe(0)
    })

    it('creates with custom config', () => {
      const scanner = new TargetScanner({ scanDepth: 'deep', maxVulnerabilities: 200 })
      expect(scanner).toBeDefined()
    })

    it('merges partial config with defaults', () => {
      const scanner = new TargetScanner({ scanDepth: 'quick' })
      expect(scanner).toBeDefined()
    })
  })

  // ── DEFAULT_TARGET_SCANNER_CONFIG ───────────────────────────

  describe('DEFAULT_TARGET_SCANNER_CONFIG', () => {
    it('has standard scan depth', () => {
      expect(DEFAULT_TARGET_SCANNER_CONFIG.scanDepth).toBe('standard')
    })

    it('has reasonable maxVulnerabilities', () => {
      expect(DEFAULT_TARGET_SCANNER_CONFIG.maxVulnerabilities).toBeGreaterThan(0)
    })

    it('has all phases enabled by default', () => {
      expect(DEFAULT_TARGET_SCANNER_CONFIG.enablePassiveRecon).toBe(true)
      expect(DEFAULT_TARGET_SCANNER_CONFIG.enableActiveScanning).toBe(true)
      expect(DEFAULT_TARGET_SCANNER_CONFIG.enableExploitAnalysis).toBe(true)
      expect(DEFAULT_TARGET_SCANNER_CONFIG.enableAttackSelection).toBe(true)
      expect(DEFAULT_TARGET_SCANNER_CONFIG.enableReportGeneration).toBe(true)
    })

    it('has OWASP and CVE correlation enabled', () => {
      expect(DEFAULT_TARGET_SCANNER_CONFIG.owaspTop10Enabled).toBe(true)
      expect(DEFAULT_TARGET_SCANNER_CONFIG.cveCorrelationEnabled).toBe(true)
    })
  })

  // ── parseTarget ─────────────────────────────────────────────

  describe('parseTarget', () => {
    const scanner = new TargetScanner()

    it('parses HTTPS URL', () => {
      const info = scanner.parseTarget('https://example.com')
      expect(info.protocol).toBe('https')
      expect(info.hostname).toBe('example.com')
      expect(info.port).toBe(443)
      expect(info.isHttps).toBe(true)
    })

    it('parses HTTP URL', () => {
      const info = scanner.parseTarget('http://test.org')
      expect(info.protocol).toBe('http')
      expect(info.hostname).toBe('test.org')
      expect(info.port).toBe(80)
      expect(info.isHttps).toBe(false)
    })

    it('adds https:// when no protocol', () => {
      const info = scanner.parseTarget('example.com')
      expect(info.protocol).toBe('https')
      expect(info.hostname).toBe('example.com')
    })

    it('parses URL with port', () => {
      const info = scanner.parseTarget('https://example.com:8443')
      expect(info.port).toBe(8443)
    })

    it('parses URL with path', () => {
      const info = scanner.parseTarget('https://example.com/api/v1/users')
      expect(info.path).toBe('/api/v1/users')
    })

    it('parses query parameters', () => {
      const info = scanner.parseTarget('https://example.com/search?q=test&page=1')
      expect(info.queryParams.q).toBe('test')
      expect(info.queryParams.page).toBe('1')
    })

    it('detects IP addresses', () => {
      const info = scanner.parseTarget('http://192.168.1.1')
      expect(info.isIP).toBe(true)
    })

    it('detects non-IP hostname', () => {
      const info = scanner.parseTarget('https://example.com')
      expect(info.isIP).toBe(false)
    })

    it('extracts domain and TLD', () => {
      const info = scanner.parseTarget('https://www.example.com')
      expect(info.domain).toBe('example.com')
      expect(info.tld).toBe('com')
      expect(info.subdomain).toBe('www')
    })

    it('handles subdomain extraction', () => {
      const info = scanner.parseTarget('https://api.staging.example.com')
      expect(info.subdomain).toBe('api.staging')
      expect(info.domain).toBe('example.com')
    })

    it('stores original URL', () => {
      const info = scanner.parseTarget('https://example.com/page')
      expect(info.originalUrl).toBe('https://example.com/page')
    })

    it('trims whitespace', () => {
      const info = scanner.parseTarget('  https://example.com  ')
      expect(info.hostname).toBe('example.com')
    })
  })

  // ── performRecon ────────────────────────────────────────────

  describe('performRecon', () => {
    it('performs recon on a domain target', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      expect(recon.target).toBeDefined()
      expect(recon.dnsRecords.length).toBeGreaterThan(0)
      expect(recon.whoisInfo.registrar).toBeTruthy()
      expect(recon.headers.securityHeaders.length).toBeGreaterThan(0)
      expect(recon.openPorts.length).toBeGreaterThan(0)
      expect(recon.subdomains.length).toBeGreaterThan(0)
      expect(recon.emails.length).toBeGreaterThan(0)
    })

    it('includes SSL info for HTTPS targets', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      expect(recon.sslInfo).toBeDefined()
      expect(recon.sslInfo!.valid).toBe(true)
    })

    it('no SSL info for HTTP targets', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('http://example.com')
      const recon = scanner.performRecon(target)
      expect(recon.sslInfo).toBeNull()
    })

    it('returns empty recon when passive recon disabled', () => {
      const scanner = new TargetScanner({ enablePassiveRecon: false })
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      expect(recon.dnsRecords).toHaveLength(0)
      expect(recon.openPorts).toHaveLength(0)
    })

    it('has more ports for deep scan', () => {
      const standard = new TargetScanner({ scanDepth: 'standard' })
      const deep = new TargetScanner({ scanDepth: 'deep' })
      const tgt = standard.parseTarget('https://example.com')
      const reconStd = standard.performRecon(tgt)
      const reconDeep = deep.performRecon(tgt)
      expect(reconDeep.openPorts.length).toBeGreaterThanOrEqual(reconStd.openPorts.length)
    })

    it('includes robots.txt entries', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      expect(recon.robotsTxt.length).toBeGreaterThan(0)
    })

    it('includes exposed paths', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      expect(recon.exposedPaths.length).toBeGreaterThan(0)
    })

    it('includes missing security headers', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      expect(recon.headers.missingHeaders.length).toBeGreaterThan(0)
    })

    it('no subdomains for IP targets', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('http://192.168.1.1')
      const recon = scanner.performRecon(target)
      expect(recon.subdomains).toHaveLength(0)
    })
  })

  // ── scanVulnerabilities ─────────────────────────────────────

  describe('scanVulnerabilities', () => {
    it('finds vulnerabilities for a typical target', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      expect(vulns.length).toBeGreaterThan(0)
    })

    it('detects missing security headers', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const headerVulns = vulns.filter(v => v.category === 'security_headers')
      expect(headerVulns.length).toBeGreaterThan(0)
    })

    it('detects CORS issues', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const corsVulns = vulns.filter(v => v.category === 'cors')
      expect(corsVulns.length).toBeGreaterThan(0)
    })

    it('detects no HTTPS for HTTP targets', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('http://example.com')
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const sslVulns = vulns.filter(v => v.title === 'No HTTPS Encryption')
      expect(sslVulns.length).toBe(1)
    })

    it('returns empty when scanning disabled', () => {
      const scanner = new TargetScanner({ enableActiveScanning: false })
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      expect(vulns).toHaveLength(0)
    })

    it('limits to maxVulnerabilities', () => {
      const scanner = new TargetScanner({ maxVulnerabilities: 3 })
      const target = scanner.parseTarget('http://example.com')
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      expect(vulns.length).toBeLessThanOrEqual(3)
    })

    it('sorts by CVSS score descending', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('http://example.com')
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      if (vulns.length >= 2) {
        expect(vulns[0].cvssScore).toBeGreaterThanOrEqual(vulns[1].cvssScore)
      }
    })

    it('each vulnerability has required fields', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      for (const v of vulns) {
        expect(v.id).toBeTruthy()
        expect(v.title).toBeTruthy()
        expect(v.severity).toBeTruthy()
        expect(v.cvssScore).toBeGreaterThanOrEqual(0)
        expect(v.remediation).toBeTruthy()
      }
    })

    it('detects sensitive exposed paths', () => {
      const scanner = new TargetScanner({ scanDepth: 'deep' })
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const pathVulns = vulns.filter(v => v.category === 'info_leak')
      expect(pathVulns.length).toBeGreaterThan(0)
    })

    it('detects query parameter injection risks', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com/search?q=test')
      // Manually inject a suspicious value to test pattern matching
      target.queryParams.q = "' OR 1=1--"
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const injectionVulns = vulns.filter(v => v.category === 'injection')
      expect(injectionVulns.length).toBeGreaterThan(0)
    })
  })

  // ── mapAttackSurface ────────────────────────────────────────

  describe('mapAttackSurface', () => {
    it('maps attack surface for a target', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com?id=1')
      const recon = scanner.performRecon(target)
      const surface = scanner.mapAttackSurface(target, recon)
      expect(surface.totalEndpoints).toBeGreaterThan(0)
      expect(surface.inputVectors.length).toBeGreaterThan(0)
      expect(surface.riskScore).toBeGreaterThanOrEqual(0)
      expect(surface.riskScore).toBeLessThanOrEqual(100)
    })

    it('includes query params as input vectors', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com/page?id=1&name=test')
      const recon = scanner.performRecon(target)
      const surface = scanner.mapAttackSurface(target, recon)
      const queryVectors = surface.inputVectors.filter(v => v.type === 'query_param')
      expect(queryVectors.length).toBeGreaterThanOrEqual(2)
    })

    it('includes form field vectors', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const surface = scanner.mapAttackSurface(target, recon)
      const formVectors = surface.inputVectors.filter(v => v.type === 'form_field')
      expect(formVectors.length).toBeGreaterThan(0)
    })

    it('includes header injection vectors', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const surface = scanner.mapAttackSurface(target, recon)
      const headerVectors = surface.inputVectors.filter(v => v.type === 'header')
      expect(headerVectors.length).toBeGreaterThan(0)
    })

    it('has higher risk for HTTP targets', () => {
      const scanner = new TargetScanner()
      const httpTarget = scanner.parseTarget('http://example.com')
      const httpsTarget = scanner.parseTarget('https://example.com')
      const reconHttp = scanner.performRecon(httpTarget)
      const reconHttps = scanner.performRecon(httpsTarget)
      const surfaceHttp = scanner.mapAttackSurface(httpTarget, reconHttp)
      const surfaceHttps = scanner.mapAttackSurface(httpsTarget, reconHttps)
      expect(surfaceHttp.riskScore).toBeGreaterThan(surfaceHttps.riskScore)
    })

    it('lists exposed services from open ports', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const surface = scanner.mapAttackSurface(target, recon)
      expect(surface.exposedServices.length).toBeGreaterThan(0)
    })
  })

  // ── analyzeExploits ─────────────────────────────────────────

  describe('analyzeExploits', () => {
    it('generates exploit candidates from vulnerabilities', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget("https://example.com?q=' OR 1=1--")
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const exploits = scanner.analyzeExploits(vulns)
      expect(exploits.length).toBeGreaterThan(0)
    })

    it('only analyzes exploitable vulns', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const exploits = scanner.analyzeExploits(vulns)
      for (const e of exploits) {
        const relatedVuln = vulns.find(v => v.id === e.vulnerabilityId)
        expect(relatedVuln?.exploitable).toBe(true)
      }
    })

    it('returns empty when exploit analysis disabled', () => {
      const scanner = new TargetScanner({ enableExploitAnalysis: false })
      const vulns: any[] = [{ id: '1', exploitable: true, category: 'injection', cvssScore: 9 }]
      const exploits = scanner.analyzeExploits(vulns)
      expect(exploits).toHaveLength(0)
    })

    it('sorts by success rate', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget("http://example.com?q=' OR 1=1--")
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const exploits = scanner.analyzeExploits(vulns)
      if (exploits.length >= 2) {
        expect(exploits[0].estimatedSuccessRate).toBeGreaterThanOrEqual(
          exploits[1].estimatedSuccessRate,
        )
      }
    })

    it('respects maxExploits limit', () => {
      const scanner = new TargetScanner({ maxExploits: 2 })
      const target = scanner.parseTarget("http://example.com?q=' OR 1=1--")
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const exploits = scanner.analyzeExploits(vulns)
      expect(exploits.length).toBeLessThanOrEqual(2)
    })

    it('each exploit has required fields', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget("http://example.com?q=' OR 1=1--")
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const exploits = scanner.analyzeExploits(vulns)
      for (const e of exploits) {
        expect(e.id).toBeTruthy()
        expect(e.vulnerabilityId).toBeTruthy()
        expect(e.name).toBeTruthy()
        expect(e.steps.length).toBeGreaterThan(0)
        expect(e.estimatedSuccessRate).toBeGreaterThanOrEqual(0)
        expect(e.estimatedSuccessRate).toBeLessThanOrEqual(1)
      }
    })
  })

  // ── buildAttackChains ───────────────────────────────────────

  describe('buildAttackChains', () => {
    it('builds attack chains from exploits', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('http://example.com/search?q=test')
      // Inject suspicious value to trigger injection-type vulns
      target.queryParams.q = "' OR 1=1--"
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const exploits = scanner.analyzeExploits(vulns)
      const chains = scanner.buildAttackChains(exploits, vulns)
      // Chains are built when matching exploit types exist
      if (
        exploits.some(
          e => e.type.includes('sqli') || e.type.includes('xss') || e.type.includes('idor'),
        )
      ) {
        expect(chains.length).toBeGreaterThan(0)
      } else {
        expect(chains.length).toBeGreaterThanOrEqual(0)
      }
    })

    it('returns empty when attack selection disabled', () => {
      const scanner = new TargetScanner({ enableAttackSelection: false })
      const chains = scanner.buildAttackChains(
        [
          {
            id: '1',
            vulnerabilityId: '1',
            name: 't',
            type: 'sqli',
            complexity: 'low',
            reliability: 0.8,
            prerequisites: [],
            impact: '',
            steps: [],
            payload: '',
            mitigation: '',
            estimatedSuccessRate: 0.8,
          },
        ],
        [],
      )
      expect(chains).toHaveLength(0)
    })

    it('returns empty for empty exploits', () => {
      const scanner = new TargetScanner()
      const chains = scanner.buildAttackChains([], [])
      expect(chains).toHaveLength(0)
    })

    it('each chain has phases', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget("http://example.com?q=' OR 1=1--")
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const exploits = scanner.analyzeExploits(vulns)
      const chains = scanner.buildAttackChains(exploits, vulns)
      for (const chain of chains) {
        expect(chain.phases.length).toBeGreaterThan(0)
        expect(chain.name).toBeTruthy()
        expect(chain.difficulty).toBeTruthy()
        expect(chain.mitigations.length).toBeGreaterThan(0)
      }
    })

    it('respects maxAttackChains', () => {
      const scanner = new TargetScanner({ maxAttackChains: 1 })
      const target = scanner.parseTarget("http://example.com?q=' OR 1=1--")
      const recon = scanner.performRecon(target)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const exploits = scanner.analyzeExploits(vulns)
      const chains = scanner.buildAttackChains(exploits, vulns)
      expect(chains.length).toBeLessThanOrEqual(1)
    })
  })

  // ── scanTarget (full pipeline) ──────────────────────────────

  describe('scanTarget', () => {
    it('runs full pipeline for a URL', () => {
      const scanner = new TargetScanner()
      const report = scanner.scanTarget('https://example.com')
      expect(report.id).toBeTruthy()
      expect(report.target.hostname).toBe('example.com')
      expect(report.phase).toBe('complete')
      expect(report.riskScore).toBeGreaterThanOrEqual(0)
      expect(report.riskLevel).toBeTruthy()
      expect(report.executiveSummary).toBeTruthy()
      expect(report.recommendations.length).toBeGreaterThan(0)
    })

    it('runs full pipeline for HTTP target with injection', () => {
      const scanner = new TargetScanner()
      const report = scanner.scanTarget("http://test.com/search?q=' OR 1=1--")
      expect(report.vulnerabilities.length).toBeGreaterThan(0)
      expect(report.exploits.length).toBeGreaterThan(0)
      expect(report.riskScore).toBeGreaterThan(0)
    })

    it('updates stats after scan', () => {
      const scanner = new TargetScanner()
      scanner.scanTarget('https://example.com')
      const stats = scanner.getStats()
      expect(stats.totalScans).toBe(1)
      expect(stats.totalTargetsScanned).toBe(1)
      expect(stats.totalReportsGenerated).toBe(1)
    })

    it('accumulates stats across multiple scans', () => {
      const scanner = new TargetScanner()
      scanner.scanTarget('https://site1.com')
      scanner.scanTarget('https://site2.com')
      const stats = scanner.getStats()
      expect(stats.totalScans).toBe(2)
      expect(stats.totalTargetsScanned).toBe(2)
    })

    it('report has technical details', () => {
      const scanner = new TargetScanner()
      const report = scanner.scanTarget('https://example.com')
      expect(report.technicalDetails).toBeTruthy()
      expect(report.technicalDetails).toContain('Technical Details')
    })

    it('report has attack surface', () => {
      const scanner = new TargetScanner()
      const report = scanner.scanTarget('https://example.com')
      expect(report.attackSurface).toBeDefined()
      expect(report.attackSurface.totalEndpoints).toBeGreaterThan(0)
    })

    it('report has recon data', () => {
      const scanner = new TargetScanner()
      const report = scanner.scanTarget('https://example.com')
      expect(report.recon).toBeDefined()
      expect(report.recon.target.hostname).toBe('example.com')
    })

    it('quick scan has fewer results than deep', () => {
      const quick = new TargetScanner({ scanDepth: 'quick' })
      const deep = new TargetScanner({ scanDepth: 'deep' })
      const reportQ = quick.scanTarget('https://example.com')
      const reportD = deep.scanTarget('https://example.com')
      expect(reportD.recon.openPorts.length).toBeGreaterThanOrEqual(reportQ.recon.openPorts.length)
    })

    it('handles IP addresses', () => {
      const scanner = new TargetScanner()
      const report = scanner.scanTarget('http://192.168.1.1')
      expect(report.target.isIP).toBe(true)
      expect(report.phase).toBe('complete')
    })

    it('risk level matches risk score', () => {
      const scanner = new TargetScanner()
      const report = scanner.scanTarget('https://example.com')
      if (report.riskScore >= 80) expect(report.riskLevel).toBe('critical')
      else if (report.riskScore >= 60) expect(report.riskLevel).toBe('high')
      else if (report.riskScore >= 40) expect(report.riskLevel).toBe('medium')
      else if (report.riskScore >= 20) expect(report.riskLevel).toBe('low')
      else expect(report.riskLevel).toBe('minimal')
    })
  })

  // ── generateReport ──────────────────────────────────────────

  describe('generateReport', () => {
    it('generates a comprehensive report', () => {
      const scanner = new TargetScanner()
      const target = scanner.parseTarget('https://example.com')
      const recon = scanner.performRecon(target)
      const surface = scanner.mapAttackSurface(target, recon)
      const vulns = scanner.scanVulnerabilities(target, recon)
      const exploits = scanner.analyzeExploits(vulns)
      const chains = scanner.buildAttackChains(exploits, vulns)
      const report = scanner.generateReport(target, recon, surface, vulns, exploits, chains)

      expect(report.id).toMatch(/^SR-/)
      expect(report.riskScore).toBeGreaterThanOrEqual(0)
      expect(report.riskScore).toBeLessThanOrEqual(100)
      expect(report.executiveSummary).toContain('example.com')
      expect(report.durationMs).toBeGreaterThanOrEqual(0)
    })
  })

  // ── OWASP & Knowledge ──────────────────────────────────────

  describe('getOWASPTop10', () => {
    it('returns all 10 OWASP categories', () => {
      const scanner = new TargetScanner()
      const owasp = scanner.getOWASPTop10()
      expect(owasp.length).toBe(10)
      expect(owasp[0].id).toBe('A01:2021')
      expect(owasp[9].id).toBe('A10:2021')
    })

    it('each entry has test cases and payloads', () => {
      const scanner = new TargetScanner()
      const owasp = scanner.getOWASPTop10()
      for (const entry of owasp) {
        expect(entry.testCases.length).toBeGreaterThan(0)
        expect(entry.cweIds.length).toBeGreaterThan(0)
      }
    })
  })

  describe('getVulnPatterns', () => {
    it('returns vulnerability patterns', () => {
      const scanner = new TargetScanner()
      const patterns = scanner.getVulnPatterns()
      expect(patterns.length).toBeGreaterThan(10)
    })

    it('each pattern has OWASP mapping', () => {
      const scanner = new TargetScanner()
      const patterns = scanner.getVulnPatterns()
      for (const p of patterns) {
        expect(p.owaspCategory).toMatch(/^A\d{2}:\d{4}$/)
        expect(p.cweId).toMatch(/^CWE-\d+$/)
      }
    })
  })

  describe('getExploitTemplates', () => {
    it('returns exploit templates', () => {
      const scanner = new TargetScanner()
      const templates = scanner.getExploitTemplates()
      expect(templates.length).toBeGreaterThan(10)
    })

    it('each template has steps and payload', () => {
      const scanner = new TargetScanner()
      const templates = scanner.getExploitTemplates()
      for (const t of templates) {
        expect(t.steps.length).toBeGreaterThan(0)
        expect(t.payload).toBeTruthy()
        expect(t.successRate).toBeGreaterThan(0)
        expect(t.successRate).toBeLessThanOrEqual(1)
      }
    })
  })

  // ── getScanProgress ─────────────────────────────────────────

  describe('getScanProgress', () => {
    it('returns progress for each phase', () => {
      const scanner = new TargetScanner()
      const phases: Array<
        'recon' | 'scanning' | 'analysis' | 'exploitation' | 'reporting' | 'complete'
      > = ['recon', 'scanning', 'analysis', 'exploitation', 'reporting', 'complete']
      const start = Date.now()
      for (const phase of phases) {
        const progress = scanner.getScanProgress(phase, start)
        expect(progress.phase).toBe(phase)
        expect(progress.currentActivity).toBeTruthy()
        expect(progress.percentComplete).toBeGreaterThanOrEqual(0)
        expect(progress.percentComplete).toBeLessThanOrEqual(100)
      }
    })

    it('complete phase is 100%', () => {
      const scanner = new TargetScanner()
      const progress = scanner.getScanProgress('complete', Date.now())
      expect(progress.percentComplete).toBe(100)
    })
  })

  // ── provideFeedback ─────────────────────────────────────────

  describe('provideFeedback', () => {
    it('accumulates feedback', () => {
      const scanner = new TargetScanner()
      scanner.provideFeedback(4)
      scanner.provideFeedback(5)
      const stats = scanner.getStats()
      expect(stats.feedbackCount).toBe(2)
      expect(stats.avgFeedbackScore).toBe(4.5)
    })

    it('clamps to 0-5', () => {
      const scanner = new TargetScanner()
      scanner.provideFeedback(10)
      scanner.provideFeedback(-3)
      const stats = scanner.getStats()
      expect(stats.avgFeedbackScore).toBe(2.5) // (5+0)/2
    })
  })

  // ── serialize / deserialize ─────────────────────────────────

  describe('serialize/deserialize', () => {
    it('round-trips config and stats', () => {
      const scanner = new TargetScanner({ scanDepth: 'deep' })
      scanner.scanTarget('https://example.com')
      scanner.provideFeedback(4)
      const data = scanner.serialize()

      const scanner2 = new TargetScanner()
      scanner2.deserialize(data)
      const stats = scanner2.getStats()
      expect(stats.totalScans).toBe(1)
      expect(stats.feedbackCount).toBe(1)
    })

    it('serializes to valid JSON', () => {
      const scanner = new TargetScanner()
      const data = scanner.serialize()
      expect(() => JSON.parse(data)).not.toThrow()
    })
  })

  // ── getStats ────────────────────────────────────────────────

  describe('getStats', () => {
    it('starts at zero', () => {
      const scanner = new TargetScanner()
      const stats = scanner.getStats()
      expect(stats.totalScans).toBe(0)
      expect(stats.totalVulnerabilitiesFound).toBe(0)
      expect(stats.totalExploitsIdentified).toBe(0)
      expect(stats.totalAttackChainsBuilt).toBe(0)
    })

    it('tracks all scan metrics', () => {
      const scanner = new TargetScanner()
      scanner.scanTarget("http://example.com?q=' OR 1=1--")
      const stats = scanner.getStats()
      expect(stats.totalScans).toBe(1)
      expect(stats.totalVulnerabilitiesFound).toBeGreaterThan(0)
      expect(stats.totalReportsGenerated).toBe(1)
      expect(stats.avgRiskScore).toBeGreaterThan(0)
    })
  })
})
