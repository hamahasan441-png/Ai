/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🏴‍☠️  BugBountyKnowledge                                             ║
 * ║                                                                             ║
 * ║   Comprehensive bug bounty knowledge engine:                                ║
 * ║     recon → scanning → enumeration → exploitation → reporting               ║
 * ║                                                                             ║
 * ║     • Platform intelligence (HackerOne, Bugcrowd, Synack, …)               ║
 * ║     • Vulnerability classes mapped to bounty payouts                        ║
 * ║     • Reconnaissance techniques and tooling                                 ║
 * ║     • Methodology phases with practical guidance                            ║
 * ║     • Report generation and payout estimation                               ║
 * ║     • Hunter profiling and skill assessment                                 ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Helpers ──────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
function tokenSimilarity(a: string, b: string): number {
  const ta = new Set(a.toLowerCase().split(/\W+/).filter(Boolean))
  const tb = new Set(b.toLowerCase().split(/\W+/).filter(Boolean))
  if (ta.size === 0 || tb.size === 0) return 0
  let inter = 0
  for (const t of ta) if (tb.has(t)) inter++
  return inter / Math.max(ta.size, tb.size)
}

// ── Types ────────────────────────────────────────────────────────

export interface BugBountyKnowledgeConfig {
  maxResults: number
  enablePayoutEstimation: boolean
  enableReconGuidance: boolean
  enableReportGeneration: boolean
  defaultPlatform: string
  severityScale: 'bugcrowd' | 'hackerone' | 'cvss'
  hunterExperienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  tipCategories: string[]
}

export interface BugBountyKnowledgeStats {
  totalPlatformQueries: number
  totalVulnLookups: number
  totalReconLookups: number
  totalPayoutEstimations: number
  totalReportsGenerated: number
  totalScopeAnalyses: number
  totalHunterAssessments: number
  totalClassifications: number
  feedbackCount: number
  avgFeedbackScore: number
}

export interface BugBountyPlatform {
  name: string
  url: string
  type: 'public' | 'private' | 'hybrid'
  features: string[]
  payoutRange: { min: number; max: number }
  programCount: number
}

export interface BountyScopeTarget {
  type: 'web' | 'mobile' | 'api' | 'network' | 'iot' | 'hardware' | 'cloud'
  asset: string
  description: string
}

export interface BountyScope {
  inScope: string[]
  outOfScope: string[]
  targets: BountyScopeTarget[]
  rules: string[]
}

export interface BountyProgram {
  name: string
  platform: string
  scope: BountyScope
  rules: string[]
  payoutTable: Record<string, { min: number; max: number }>
  type: 'public' | 'private' | 'vdp'
}

export interface ReconTechnique {
  name: string
  category: string
  description: string
  tools: string[]
  effectiveness: number
  difficulty: number
}

export interface VulnClassForBounty {
  name: string
  owasp: string
  cwe: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational'
  typicalPayout: { min: number; max: number }
  commonTargets: string[]
  reportTips: string[]
}

export interface BountyReport {
  title: string
  severity: string
  description: string
  stepsToReproduce: string[]
  impact: string
  remediation: string
  poc: string
  cvss: string
}

export interface PayoutEstimate {
  severity: string
  estimatedMin: number
  estimatedMax: number
  platform: string
  confidence: number
}

export interface HunterProfile {
  level: string
  skills: string[]
  earnings: { estimated: number; currency: string }
  reportsSubmitted: number
  duplicateRate: number
  avgSeverity: number
}

export interface MethodologyPhase {
  name: string
  order: number
  description: string
  tools: string[]
  tips: string[]
  outputs: string[]
}

export interface BountyMethodology {
  phases: MethodologyPhase[]
  tools: string[]
  tips: string[]
}

export interface ResponsibleDisclosure {
  steps: string[]
  doList: string[]
  dontList: string[]
  timeline: string[]
  legalConsiderations: string[]
}

export interface DuplicateStrategy {
  name: string
  description: string
  techniques: string[]
}

export interface BugBountyTip {
  id: number
  category: string
  tip: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

// ── Constants ────────────────────────────────────────────────────

const DEFAULT_CONFIG: BugBountyKnowledgeConfig = {
  maxResults: 50,
  enablePayoutEstimation: true,
  enableReconGuidance: true,
  enableReportGeneration: true,
  defaultPlatform: 'hackerone',
  severityScale: 'cvss',
  hunterExperienceLevel: 'intermediate',
  tipCategories: [
    'recon',
    'scanning',
    'exploitation',
    'reporting',
    'methodology',
    'mindset',
    'tools',
    'scope',
  ],
}

/** Minimum token-similarity score for search results. */
const MIN_SIMILARITY_THRESHOLD = 0.15

/** Minimum score for vulnerability classification matches. */
const MIN_CLASSIFICATION_SCORE = 0.1

// ── Database builders ────────────────────────────────────────────

function buildPlatformDatabase(): BugBountyPlatform[] {
  const platforms: BugBountyPlatform[] = []

  const add = (
    name: string,
    url: string,
    type: BugBountyPlatform['type'],
    features: string[],
    payoutRange: { min: number; max: number },
    programCount: number,
  ) => {
    platforms.push({ name, url, type, features, payoutRange, programCount })
  }

  add(
    'HackerOne',
    'https://hackerone.com',
    'hybrid',
    [
      'managed triage',
      'reputation system',
      'CVE assignment',
      'pentest-as-a-service',
      'bounty splitting',
      'retesting',
      'signal and impact metrics',
      'hacker mediation',
    ],
    { min: 50, max: 250000 },
    3200,
  )

  add(
    'Bugcrowd',
    'https://bugcrowd.com',
    'hybrid',
    [
      'managed triage',
      'vulnerability rating taxonomy',
      'crowdsourced pentest',
      'attack surface management',
      'compliance programs',
      'leaderboards',
    ],
    { min: 50, max: 150000 },
    1800,
  )

  add(
    'Synack',
    'https://synack.com',
    'private',
    [
      'vetted researcher network',
      'Hydra platform',
      'on-demand pentesting',
      'patch verification',
      'controlled launch environment',
      'government programs',
    ],
    { min: 100, max: 100000 },
    500,
  )

  add(
    'Intigriti',
    'https://intigriti.com',
    'hybrid',
    [
      'European focus',
      'managed triage',
      'leaderboards',
      'live hacking events',
      'GDPR compliance',
      'hybrid programs',
      'researcher onboarding',
    ],
    { min: 50, max: 100000 },
    800,
  )

  add(
    'YesWeHack',
    'https://yeswehack.com',
    'hybrid',
    [
      'European platform',
      'DORA training',
      'CVE numbering authority',
      'vulnerability disclosure policy',
      'live bug bounty events',
      'pentesting programs',
      'educational resources',
    ],
    { min: 50, max: 50000 },
    700,
  )

  add(
    'Open Bug Bounty',
    'https://openbugbounty.org',
    'public',
    [
      'non-profit',
      'coordinated disclosure',
      'XSS and CSRF focus',
      'free for website owners',
      'ISO 29147 compliant',
      'public disclosure timeline',
    ],
    { min: 0, max: 5000 },
    1500,
  )

  add(
    'Cobalt',
    'https://cobalt.io',
    'private',
    [
      'pentest-as-a-service',
      'vetted talent pool',
      'agile pentesting',
      'JIRA integration',
      'compliance-driven testing',
      'real-time collaboration',
    ],
    { min: 100, max: 50000 },
    400,
  )

  add(
    'HackenProof',
    'https://hackenproof.com',
    'hybrid',
    [
      'crypto/blockchain focus',
      'DeFi programs',
      'smart contract auditing',
      'web3 security',
      'NFT platform programs',
      'leaderboards',
    ],
    { min: 50, max: 100000 },
    350,
  )

  add(
    'Immunefi',
    'https://immunefi.com',
    'public',
    [
      'DeFi and crypto focus',
      'smart contract bounties',
      'highest payouts in industry',
      'blockchain-native',
      'protocol-level programs',
      'multi-chain coverage',
    ],
    { min: 1000, max: 10000000 },
    300,
  )

  add(
    'Federacy',
    'https://federacy.com',
    'public',
    [
      'startup-friendly',
      'low-cost entry',
      'community-driven',
      'simple interface',
      'quick program setup',
      'developer-focused',
    ],
    { min: 25, max: 10000 },
    200,
  )

  return platforms
}

function buildVulnClassDatabase(): VulnClassForBounty[] {
  const vulns: VulnClassForBounty[] = []

  const add = (
    name: string,
    owasp: string,
    cwe: string,
    severity: VulnClassForBounty['severity'],
    typicalPayout: { min: number; max: number },
    commonTargets: string[],
    reportTips: string[],
  ) => {
    vulns.push({ name, owasp, cwe, severity, typicalPayout, commonTargets, reportTips })
  }

  add(
    'SQL Injection',
    'A03:2021 Injection',
    'CWE-89',
    'critical',
    { min: 3000, max: 50000 },
    ['login forms', 'search fields', 'API parameters', 'hidden inputs', 'REST endpoints'],
    [
      'Demonstrate data exfiltration, not just error-based detection',
      'Show impact on confidentiality, integrity, and availability',
      'Include sqlmap output or manual PoC with curl commands',
      'Test for blind, time-based, and union-based variants',
    ],
  )

  add(
    'Cross-Site Scripting (XSS)',
    'A03:2021 Injection',
    'CWE-79',
    'high',
    { min: 500, max: 15000 },
    [
      'user input fields',
      'URL parameters',
      'file uploads',
      'markdown renderers',
      'email templates',
    ],
    [
      'Stored XSS pays more than reflected; demonstrate persistence',
      'Show real impact: session hijacking, account takeover, data theft',
      'Avoid alert(1) — use document.domain or cookie exfiltration as PoC',
      'Test in multiple browsers if behavior varies',
    ],
  )

  add(
    'Server-Side Request Forgery (SSRF)',
    'A10:2021 SSRF',
    'CWE-918',
    'high',
    { min: 2000, max: 40000 },
    [
      'URL input fields',
      'webhook handlers',
      'file import features',
      'PDF generators',
      'image processors',
    ],
    [
      'Demonstrate access to internal services (169.254.169.254 for cloud metadata)',
      'Show ability to read internal files or reach internal APIs',
      'Bypass common filters: decimal IP, IPv6, DNS rebinding',
      'Chain with other vulns for maximum impact',
    ],
  )

  add(
    'Insecure Direct Object Reference (IDOR)',
    'A01:2021 Broken Access Control',
    'CWE-639',
    'high',
    { min: 1000, max: 20000 },
    [
      'API endpoints',
      'file download URLs',
      'user profile pages',
      'order management',
      'admin panels',
    ],
    [
      "Demonstrate access to another user's data with two accounts",
      'Show the exact parameter being manipulated',
      'Estimate the number of affected users or records',
      'Test both read and write IDORs',
    ],
  )

  add(
    'Cross-Site Request Forgery (CSRF)',
    'A01:2021 Broken Access Control',
    'CWE-352',
    'medium',
    { min: 200, max: 5000 },
    [
      'state-changing forms',
      'settings pages',
      'password changes',
      'payment actions',
      'admin actions',
    ],
    [
      'Create a working HTML PoC that exploits the CSRF',
      'Target high-impact actions: password change, email change, fund transfer',
      'Check for SameSite cookie attribute and token-based protections',
      'Demonstrate the attack works in a realistic scenario',
    ],
  )

  add(
    'Remote Code Execution (RCE)',
    'A03:2021 Injection',
    'CWE-94',
    'critical',
    { min: 10000, max: 250000 },
    [
      'file upload features',
      'deserialization endpoints',
      'template engines',
      'eval-based parsers',
      'CI/CD pipelines',
    ],
    [
      'This is the highest-impact finding — be thorough',
      'Demonstrate command execution with benign commands (id, whoami, hostname)',
      'Never access, modify, or exfiltrate real data',
      'Document the full attack chain from initial access to code execution',
    ],
  )

  add(
    'Authentication Bypass',
    'A07:2021 Identification and Authentication Failures',
    'CWE-287',
    'critical',
    { min: 5000, max: 100000 },
    ['login endpoints', 'OAuth flows', 'SSO implementations', 'API key validation', 'JWT handling'],
    [
      'Show complete bypass allowing access to another user account',
      'Document the exact authentication mechanism and how it was bypassed',
      'Test for default credentials, JWT manipulation, and token reuse',
      'Demonstrate the scope of access gained',
    ],
  )

  add(
    'Authorization Flaws',
    'A01:2021 Broken Access Control',
    'CWE-285',
    'high',
    { min: 1500, max: 30000 },
    [
      'role-based endpoints',
      'admin panels',
      'API authorization',
      'multi-tenant systems',
      'feature toggles',
    ],
    [
      'Demonstrate privilege escalation from regular user to admin',
      'Use two accounts at different privilege levels',
      'Show horizontal and vertical privilege escalation separately',
      'Document which specific authorization check is missing or flawed',
    ],
  )

  add(
    'Information Disclosure',
    'A01:2021 Broken Access Control',
    'CWE-200',
    'medium',
    { min: 100, max: 5000 },
    ['error pages', 'API responses', 'debug endpoints', 'exposed files', 'HTTP headers'],
    [
      'Rate depends heavily on what information is exposed',
      'PII and credentials pay much more than stack traces',
      'Document exactly what sensitive data is exposed',
      'Show how an attacker could use the disclosed information',
    ],
  )

  add(
    'Open Redirect',
    'A01:2021 Broken Access Control',
    'CWE-601',
    'low',
    { min: 50, max: 1000 },
    ['login redirects', 'OAuth callbacks', 'URL shorteners', 'email links', 'SSO flows'],
    [
      'Many programs consider this low severity unless chained',
      'Chain with OAuth token theft for higher impact',
      'Demonstrate a realistic phishing scenario',
      'Bypass common redirect validation filters',
    ],
  )

  add(
    'XML External Entity (XXE)',
    'A05:2021 Security Misconfiguration',
    'CWE-611',
    'high',
    { min: 2000, max: 30000 },
    [
      'XML parsers',
      'SOAP APIs',
      'file upload processors',
      'SVG handlers',
      'Office document importers',
    ],
    [
      'Demonstrate file read using /etc/passwd or similar benign file',
      'Test for blind XXE with out-of-band interaction',
      'Try SVG and DOCX upload vectors if XML input is not obvious',
      'Show SSRF potential through XXE entity resolution',
    ],
  )

  add(
    'Server-Side Template Injection (SSTI)',
    'A03:2021 Injection',
    'CWE-1336',
    'critical',
    { min: 3000, max: 50000 },
    [
      'template engines',
      'email templates',
      'PDF generators',
      'CMS systems',
      'dynamic page builders',
    ],
    [
      'Identify the template engine first (Jinja2, Twig, Freemarker, etc.)',
      'Escalate from detection to RCE for maximum impact',
      'Use polyglot payloads for initial detection: {{7*7}} ${7*7} #{7*7}',
      'Document the template engine version and sandbox bypasses used',
    ],
  )

  add(
    'Race Conditions',
    'A04:2021 Insecure Design',
    'CWE-362',
    'medium',
    { min: 500, max: 10000 },
    [
      'payment processing',
      'coupon redemption',
      'voting systems',
      'like/follow endpoints',
      'inventory management',
    ],
    [
      'Use Turbo Intruder or parallel request tools for PoC',
      'Show financial impact: double spending, extra credits, duplicate rewards',
      'Document the exact timing window and success rate',
      'Test both TOCTOU and limit-overrun race conditions',
    ],
  )

  add(
    'Business Logic Flaws',
    'A04:2021 Insecure Design',
    'CWE-840',
    'high',
    { min: 1000, max: 25000 },
    [
      'checkout flows',
      'pricing logic',
      'referral systems',
      'subscription management',
      'access control workflows',
    ],
    [
      'These are often the highest-value and hardest-to-find bugs',
      'Describe the intended business flow and how it can be abused',
      'Demonstrate real financial or operational impact',
      'Walk through the exact sequence of steps to reproduce',
    ],
  )

  add(
    'File Upload Vulnerabilities',
    'A04:2021 Insecure Design',
    'CWE-434',
    'high',
    { min: 1000, max: 20000 },
    [
      'profile picture uploads',
      'document importers',
      'avatar systems',
      'attachment handlers',
      'media processors',
    ],
    [
      'Try to achieve RCE via webshell upload for maximum impact',
      'Test bypass techniques: double extensions, null bytes, content-type manipulation',
      'Check if uploaded files are served from the same domain',
      'Test SVG uploads for XSS and XXE',
    ],
  )

  add(
    'Subdomain Takeover',
    'A05:2021 Security Misconfiguration',
    'CWE-284',
    'high',
    { min: 500, max: 10000 },
    ['CNAME records', 'S3 buckets', 'Azure services', 'Heroku apps', 'GitHub pages'],
    [
      'Verify the CNAME points to an unclaimed resource before reporting',
      'Actually claim the subdomain and host a benign PoC page',
      'Check for cookie scoping issues that amplify impact',
      'Use tools like subjack, nuclei, or can-i-take-over-xyz for verification',
    ],
  )

  add(
    'CORS Misconfiguration',
    'A05:2021 Security Misconfiguration',
    'CWE-942',
    'medium',
    { min: 300, max: 8000 },
    ['API endpoints', 'CDN configurations', 'microservices', 'SSO providers', 'payment gateways'],
    [
      'Demonstrate actual data theft via CORS misconfiguration',
      'Test for null origin, reflected origin, and regex bypass',
      'Create a working PoC HTML page hosted on attacker domain',
      'Show the sensitivity of data accessible via the CORS flaw',
    ],
  )

  add(
    'GraphQL Vulnerabilities',
    'A01:2021 Broken Access Control',
    'CWE-200',
    'high',
    { min: 1000, max: 20000 },
    [
      'GraphQL endpoints',
      'introspection queries',
      'nested queries',
      'mutation endpoints',
      'subscription handlers',
    ],
    [
      'Start with introspection query to map the schema',
      'Look for authorization bypass in nested resolvers',
      'Test for batching attacks and query depth abuse',
      'Check for excessive data exposure in query responses',
    ],
  )

  add(
    'API Vulnerabilities',
    'A02:2021 Cryptographic Failures',
    'CWE-284',
    'high',
    { min: 1000, max: 25000 },
    [
      'REST APIs',
      'GraphQL endpoints',
      'gRPC services',
      'WebSocket connections',
      'webhook receivers',
    ],
    [
      'Test all OWASP API Security Top 10 categories',
      'Check for broken object-level authorization (BOLA)',
      'Test rate limiting, mass assignment, and improper asset management',
      'Document the full API endpoint and HTTP method in report',
    ],
  )

  add(
    'Prototype Pollution',
    'A03:2021 Injection',
    'CWE-1321',
    'high',
    { min: 1000, max: 15000 },
    [
      'Node.js applications',
      'JavaScript frameworks',
      'JSON merge operations',
      'deep clone functions',
      'config parsers',
    ],
    [
      'Demonstrate client-side XSS or server-side RCE via pollution',
      'Show the pollution gadget and how it leads to exploitable behavior',
      'Test __proto__, constructor.prototype, and Object.prototype',
      'Chain with known gadgets in popular libraries',
    ],
  )

  add(
    'Insecure Deserialization',
    'A08:2021 Software and Data Integrity Failures',
    'CWE-502',
    'critical',
    { min: 5000, max: 50000 },
    [
      'Java applications',
      'PHP applications',
      '.NET services',
      'Python pickle usage',
      'Ruby Marshal usage',
    ],
    [
      'Identify the serialization format first (Java, PHP, Python, etc.)',
      'Use ysoserial, phpggc, or equivalent for gadget chain generation',
      'Demonstrate RCE or sensitive data access for maximum impact',
      'Document the deserialization sink and gadget chain used',
    ],
  )

  add(
    'Path Traversal',
    'A01:2021 Broken Access Control',
    'CWE-22',
    'high',
    { min: 1000, max: 15000 },
    [
      'file download features',
      'template loading',
      'log viewers',
      'report generators',
      'backup systems',
    ],
    [
      'Read /etc/passwd or equivalent as benign proof of concept',
      'Try various bypass techniques: encoding, double encoding, null bytes',
      'Test both absolute and relative path traversal',
      'Show access to sensitive configuration files for higher impact',
    ],
  )

  add(
    'HTTP Request Smuggling',
    'A05:2021 Security Misconfiguration',
    'CWE-444',
    'critical',
    { min: 5000, max: 50000 },
    [
      'load balancers',
      'reverse proxies',
      'CDN configurations',
      'HTTP/2 downgrade',
      'chunked transfer encoding',
    ],
    [
      'Test CL.TE, TE.CL, and TE.TE variants systematically',
      'Use Burp Suite HTTP Request Smuggler extension for detection',
      'Demonstrate cache poisoning or request hijacking for maximum impact',
      'Document the exact front-end/back-end desync behavior observed',
    ],
  )

  add(
    'Mass Assignment',
    'A04:2021 Insecure Design',
    'CWE-915',
    'high',
    { min: 1000, max: 15000 },
    [
      'user registration forms',
      'profile update APIs',
      'REST APIs',
      'GraphQL mutations',
      'admin panel endpoints',
    ],
    [
      'Add unexpected parameters like role=admin or isAdmin=true to requests',
      'Compare the API documentation with actual accepted parameters',
      'Test by adding fields from the data model that should be server-controlled',
      'Demonstrate privilege escalation or data manipulation for higher severity',
    ],
  )

  add(
    'OAuth/SSO Flaws',
    'A07:2021 Identification and Authentication Failures',
    'CWE-346',
    'high',
    { min: 2000, max: 30000 },
    ['OAuth 2.0 flows', 'SAML implementations', 'OpenID Connect', 'social login', 'redirect URIs'],
    [
      'Test redirect_uri validation for open redirect and token theft',
      'Check for state parameter absence or predictability (CSRF in OAuth)',
      'Test for token leakage via Referer header on redirect',
      'Verify scope escalation and consent bypass possibilities',
    ],
  )

  add(
    'WebSocket Vulnerabilities',
    'A03:2021 Injection',
    'CWE-1385',
    'medium',
    { min: 500, max: 10000 },
    [
      'real-time features',
      'chat applications',
      'live dashboards',
      'trading platforms',
      'gaming servers',
    ],
    [
      'Test for cross-site WebSocket hijacking (CSWSH)',
      'Check if authentication tokens are validated on WebSocket upgrade',
      'Inject payloads through WebSocket messages for XSS or SQLi',
      'Monitor WebSocket traffic for sensitive data leakage',
    ],
  )

  add(
    'Cache Poisoning',
    'A05:2021 Security Misconfiguration',
    'CWE-444',
    'high',
    { min: 2000, max: 25000 },
    ['CDN configurations', 'reverse proxies', 'web caches', 'load balancers', 'application caches'],
    [
      'Use unkeyed headers (X-Forwarded-Host, X-Original-URL) to poison cache',
      'Demonstrate XSS or redirect via cached response for real impact',
      'Test with Param Miner Burp extension for unkeyed parameter discovery',
      'Show that the poisoned cache serves malicious content to other users',
    ],
  )

  return vulns
}

function buildReconTechniqueDatabase(): ReconTechnique[] {
  const techniques: ReconTechnique[] = []

  const add = (
    name: string,
    category: string,
    description: string,
    tools: string[],
    effectiveness: number,
    difficulty: number,
  ) => {
    techniques.push({ name, category, description, tools, effectiveness, difficulty })
  }

  add(
    'Subdomain Enumeration',
    'passive',
    'Discover subdomains using passive sources, brute-forcing, and permutation techniques to expand the attack surface.',
    ['subfinder', 'amass', 'assetfinder', 'knockpy', 'puredns', 'gotator'],
    0.95,
    0.3,
  )

  add(
    'Port Scanning',
    'active',
    'Identify open ports and running services on target hosts to find exposed attack vectors.',
    ['nmap', 'masscan', 'rustscan', 'naabu', 'zmap'],
    0.9,
    0.4,
  )

  add(
    'Directory Brute-Forcing',
    'active',
    'Discover hidden files, directories, and endpoints by testing common paths against the web server.',
    ['ffuf', 'gobuster', 'feroxbuster', 'dirsearch', 'wfuzz'],
    0.85,
    0.35,
  )

  add(
    'JavaScript File Analysis',
    'passive',
    'Extract endpoints, API keys, secrets, and hidden functionality from JavaScript source files.',
    ['LinkFinder', 'JSParser', 'getJS', 'SecretFinder', 'Mantra'],
    0.88,
    0.5,
  )

  add(
    'Wayback URL Mining',
    'passive',
    'Retrieve historical URLs from web archives to find forgotten endpoints, parameters, and old functionality.',
    ['waybackurls', 'gau', 'waymore', 'web.archive.org'],
    0.82,
    0.2,
  )

  add(
    'Google Dorking',
    'passive',
    'Use advanced search operators to find exposed sensitive files, login pages, and configuration data indexed by Google.',
    ['Google Search Operators', 'DorkSearch', 'GooFuzz', 'Pagodo'],
    0.75,
    0.25,
  )

  add(
    'GitHub Recon',
    'passive',
    'Search public repositories for leaked credentials, API keys, internal documentation, and code that reveals application internals.',
    ['trufflehog', 'gitrob', 'gitleaks', 'GitDorker', 'shhgit'],
    0.8,
    0.4,
  )

  add(
    'DNS Zone Transfer',
    'active',
    'Attempt DNS zone transfers to obtain complete DNS records revealing internal hostnames and network layout.',
    ['dig', 'dnsrecon', 'fierce', 'dnsenum', 'host'],
    0.5,
    0.2,
  )

  add(
    'Certificate Transparency',
    'passive',
    'Query CT logs to discover subdomains and certificates issued for a domain, revealing hidden services.',
    ['crt.sh', 'certspotter', 'ctfr', 'censys'],
    0.85,
    0.15,
  )

  add(
    'Tech Stack Fingerprinting',
    'passive',
    'Identify technologies, frameworks, and versions used by the target to find known vulnerabilities.',
    ['Wappalyzer', 'WhatWeb', 'httpx', 'Webanalyze', 'BuiltWith'],
    0.8,
    0.25,
  )

  add(
    'API Endpoint Discovery',
    'active',
    'Find undocumented API endpoints through crawling, wordlist fuzzing, and specification file analysis.',
    ['kiterunner', 'ffuf', 'Arjun', 'APIFuzzer', 'mitmproxy'],
    0.87,
    0.55,
  )

  add(
    'Parameter Discovery',
    'active',
    'Discover hidden and undocumented parameters in web requests that may expose additional functionality.',
    ['Arjun', 'ParamSpider', 'x8', 'ParamMiner (Burp)'],
    0.83,
    0.45,
  )

  add(
    'Content Discovery',
    'active',
    'Find hidden content such as backup files, configuration files, admin panels, and staging environments.',
    ['ffuf', 'gobuster', 'meg', 'hakrawler', 'katana'],
    0.86,
    0.35,
  )

  add(
    'Email Harvesting',
    'passive',
    'Collect email addresses associated with the target organization for social engineering and credential stuffing vectors.',
    ['theHarvester', 'Hunter.io', 'Phonebook.cz', 'Snov.io'],
    0.6,
    0.2,
  )

  add(
    'S3 Bucket Enumeration',
    'active',
    'Discover misconfigured cloud storage buckets that may expose sensitive data, backups, or internal assets.',
    ['S3Scanner', 'cloud_enum', 'AWSBucketDump', 'lazys3', 'bucket-finder'],
    0.7,
    0.3,
  )

  add(
    'Visual Recon',
    'active',
    'Capture screenshots of discovered web assets for quick visual analysis and prioritization of targets.',
    ['gowitness', 'EyeWitness', 'Aquatone', 'httpx screenshots'],
    0.65,
    0.2,
  )

  add(
    'Favicon Hashing',
    'passive',
    'Use favicon hashes to identify technologies and discover related infrastructure through services like Shodan.',
    ['favfreak', 'Shodan favicon search', 'favihash.py'],
    0.55,
    0.25,
  )

  add(
    'WHOIS and Reverse WHOIS',
    'passive',
    'Query domain registration data to identify related domains, ownership details, and organizational infrastructure.',
    ['whois', 'Amass Intel', 'DomainTools', 'ViewDNS.info', 'SecurityTrails'],
    0.6,
    0.15,
  )

  add(
    'Cloud Infrastructure Enumeration',
    'active',
    'Discover cloud-hosted assets including S3 buckets, Azure blobs, GCP storage, and misconfigured cloud services.',
    ['cloud_enum', 'ScoutSuite', 'Prowler', 'CloudBrute', 'S3Scanner', 'AzureHound'],
    0.75,
    0.45,
  )

  add(
    'WAF Detection and Bypass',
    'active',
    'Identify web application firewalls protecting targets and develop bypass techniques to test underlying applications.',
    ['wafw00f', 'whatwaf', 'Burp Suite WAF detection', 'custom encoding'],
    0.7,
    0.6,
  )

  return techniques
}

function buildMethodologyPhases(): MethodologyPhase[] {
  return [
    {
      name: 'recon',
      order: 1,
      description:
        'Gather intelligence about the target: discover subdomains, map the attack surface, identify technologies, and find hidden assets. Good recon is the foundation of successful bug hunting.',
      tools: [
        'subfinder',
        'amass',
        'naabu',
        'httpx',
        'nuclei',
        'gau',
        'waybackurls',
        'katana',
        'gowitness',
        'dnsx',
        'assetfinder',
        'shuffledns',
        'puredns',
        'massdns',
      ],
      tips: [
        'Automate your recon pipeline with bash scripts or tools like ReconFTW',
        'Run recon continuously — new subdomains appear daily',
        'Use multiple subdomain sources for comprehensive coverage',
        'Save all discovered assets in a structured database',
        'Monitor for changes using tools like sublert or notify',
        'Combine passive and active recon for maximum coverage',
        'Use cloud provider IP ranges to identify cloud-hosted assets',
      ],
      outputs: [
        'subdomain list',
        'live host list',
        'technology stack report',
        'URL archive',
        'screenshot gallery',
        'port scan results',
        'DNS record dump',
        'cloud asset inventory',
      ],
    },
    {
      name: 'scanning',
      order: 2,
      description:
        'Actively probe discovered assets for known vulnerabilities, misconfigurations, and common security issues using automated scanners and custom templates.',
      tools: [
        'nuclei',
        'nikto',
        'Burp Suite',
        'OWASP ZAP',
        'wpscan',
        'sqlmap',
        'dalfox',
        'XSStrike',
        'testssl.sh',
        'SSLyze',
        'retire.js',
      ],
      tips: [
        'Use nuclei with custom templates for targeted scanning',
        'Combine automated scanning with manual testing',
        'Always check for default credentials on discovered services',
        'Scan for misconfigurations: CORS, SPF, DMARC, security headers',
        'Prioritize scanning of login forms, file uploads, and API endpoints',
        'Rate-limit your scans to avoid disrupting services or getting blocked',
        'Check TLS configuration for weak ciphers and expired certificates',
      ],
      outputs: [
        'vulnerability scan results',
        'misconfiguration findings',
        'default credential hits',
        'technology-specific issues',
        'TLS assessment report',
        'security header analysis',
      ],
    },
    {
      name: 'enumeration',
      order: 3,
      description:
        'Deep-dive into discovered services: enumerate parameters, map application logic, identify API endpoints, and understand authorization models.',
      tools: [
        'Burp Suite',
        'ffuf',
        'Arjun',
        'ParamSpider',
        'kiterunner',
        'mitmproxy',
        'Postman',
        'GraphQL Voyager',
        'jwt_tool',
        'Autorize (Burp extension)',
      ],
      tips: [
        'Create two accounts to test authorization between different privilege levels',
        'Map every API endpoint and test each with different HTTP methods',
        'Look for hidden parameters in JavaScript files',
        'Enumerate GraphQL schemas via introspection',
        'Test every input field — forms, headers, cookies, and URL parameters',
        'Check for API versioning: /api/v1/ may have different security than /api/v2/',
        'Examine error messages carefully — they often leak internal structure',
      ],
      outputs: [
        'API endpoint map',
        'parameter list',
        'authorization matrix',
        'application logic flow',
        'data model understanding',
        'authentication mechanism analysis',
        'error response catalog',
      ],
    },
    {
      name: 'exploitation',
      order: 4,
      description:
        'Exploit identified vulnerabilities to demonstrate real impact. Focus on high-severity issues and chain lower-severity bugs for greater impact.',
      tools: [
        'Burp Suite',
        'sqlmap',
        'Metasploit',
        'custom scripts',
        'Turbo Intruder',
        'Autorize',
        'JWT_Tool',
        'ysoserial',
        'dalfox',
        'commix',
        'tplmap',
        'CyberChef',
      ],
      tips: [
        'Always demonstrate maximum impact without causing damage',
        'Chain multiple low/medium bugs into a high/critical finding',
        'Use benign payloads — never access real user data',
        'Test edge cases: empty values, large inputs, special characters, unicode',
        'Document every step for reproducibility',
        'Try the same payload in different encoding formats to bypass filters',
        'Consider timing-based exploitation when blind vulnerabilities are suspected',
      ],
      outputs: [
        'proof-of-concept exploits',
        'impact demonstrations',
        'vulnerability chains',
        'severity assessments',
        'exploitation notes',
        'bypass techniques documentation',
      ],
    },
    {
      name: 'reporting',
      order: 5,
      description:
        'Write clear, concise, and impactful vulnerability reports that help the security team understand and fix the issue quickly.',
      tools: [
        'Markdown editor',
        'screen recording software',
        'Burp Suite request export',
        'cURL command builder',
        'CVSS calculator',
        'CWE database',
      ],
      tips: [
        'Write the report as if the reader has zero context about your finding',
        'Include clear steps to reproduce — a triager should replicate in 5 minutes',
        'Always include a realistic impact statement',
        'Suggest a remediation — it shows you understand the vulnerability deeply',
        'Attach screenshots, request/response pairs, and video where helpful',
        'Include CVSS score, CWE ID, and OWASP reference',
        'Proofread your report — grammar and clarity matter for credibility',
        'For complex chains, include a summary diagram or flowchart',
      ],
      outputs: [
        'vulnerability report',
        'proof-of-concept files',
        'video walkthrough',
        'remediation recommendations',
        'CVSS score justification',
        'executive summary',
      ],
    },
  ]
}

function buildReportTemplates(): Record<string, string[]> {
  return {
    titleFormat: [
      '[Severity] Vulnerability Type in Component — Brief Impact',
      'Example: [Critical] SQL Injection in /api/users endpoint — Full database access',
      'Example: [High] IDOR in /api/orders/{id} — Access to all customer orders',
      'Example: [Medium] CORS misconfiguration on api.example.com — Credential theft via CORS',
    ],
    descriptionGuidance: [
      'Start with a one-sentence summary of the vulnerability',
      'Explain what the vulnerability is and where it exists',
      'Describe the root cause if known',
      'Reference CWE and OWASP classification',
      'Include the affected URL, parameter, or component name',
      'Mention the HTTP method and content type involved',
    ],
    stepsFormat: [
      '1. Navigate to [URL]',
      '2. Intercept the request using Burp Suite / browser dev tools',
      '3. Modify parameter [X] to [payload]',
      '4. Observe [unexpected behavior / response]',
      '5. Confirm the vulnerability by [verification step]',
      '',
      'Note: Each step should be atomic and verifiable',
      'Include exact URLs, parameters, and payload values',
    ],
    impactGuidance: [
      'Describe what an attacker could achieve',
      'Estimate the number of affected users if applicable',
      'Explain the business impact in non-technical terms',
      'Classify using CIA triad: confidentiality, integrity, availability',
      'Quantify financial impact if possible (data breach costs, regulatory fines)',
      'Consider both direct and indirect consequences',
    ],
    remediationGuidance: [
      'Provide specific code-level fixes when possible',
      'Reference industry standards and best practices',
      'Suggest both short-term mitigation and long-term fix',
      'Link to relevant documentation (OWASP, CWE, vendor docs)',
      'Include example secure code snippets when applicable',
      'Mention relevant security headers or configuration changes',
    ],
    pocGuidance: [
      'Use cURL commands for reproducible API-level PoCs',
      'Include full HTTP requests and responses',
      'Provide standalone HTML files for client-side vulns',
      'Use benign payloads only — never exfiltrate real data',
      'Include screenshots with annotations for visual clarity',
      'Record screen for multi-step or timing-dependent exploits',
    ],
    commonMistakes: [
      'Submitting without clear reproduction steps',
      'Using alert(1) as XSS PoC instead of showing real impact',
      'Not testing with two separate accounts for access control bugs',
      'Skipping CVSS scoring and CWE classification',
      'Writing vague impact statements without concrete scenarios',
      'Not mentioning the browser/environment used for testing',
    ],
  }
}

function buildBugBountyTips(): BugBountyTip[] {
  const tips: BugBountyTip[] = []
  let id = 0

  const add = (category: string, tip: string, difficulty: BugBountyTip['difficulty']) => {
    tips.push({ id: ++id, category, tip, difficulty })
  }

  // Recon tips
  add(
    'recon',
    'Run subdomain enumeration with at least 3 different tools and merge the results — each tool has different data sources.',
    'beginner',
  )
  add(
    'recon',
    'Monitor your targets with continuous recon. New subdomains and features are deployed daily and often have fresh bugs.',
    'intermediate',
  )
  add(
    'recon',
    'Parse JavaScript files for hidden API endpoints, hardcoded tokens, and internal URLs using tools like LinkFinder.',
    'intermediate',
  )
  add(
    'recon',
    'Use certificate transparency logs (crt.sh) to find subdomains that DNS enumeration misses.',
    'beginner',
  )
  add(
    'recon',
    'Check GitHub, GitLab, and Bitbucket for target organization code repos — developers often commit secrets.',
    'intermediate',
  )

  // Scanning tips
  add(
    'scanning',
    'Create custom Nuclei templates for vulnerabilities specific to the technologies you find during recon.',
    'advanced',
  )
  add(
    'scanning',
    'Always check for default credentials on management interfaces: Jenkins, Grafana, Kibana, Elasticsearch.',
    'beginner',
  )
  add(
    'scanning',
    'Scan for subdomain takeover opportunities — many programs have dangling CNAMEs pointing to deprovisioned services.',
    'intermediate',
  )
  add(
    'scanning',
    "Use Burp Suite's active scanner on specific insertion points rather than whole-site crawls for more focused results.",
    'intermediate',
  )

  // Exploitation tips
  add(
    'exploitation',
    'Chain multiple low-severity bugs together — an open redirect + OAuth misconfiguration can become a critical account takeover.',
    'advanced',
  )
  add(
    'exploitation',
    'Test race conditions on any endpoint that involves transactions, limits, or one-time-use tokens.',
    'advanced',
  )
  add(
    'exploitation',
    'When testing for SSRF, try accessing cloud metadata endpoints (169.254.169.254) — this usually bumps severity to critical.',
    'intermediate',
  )
  add(
    'exploitation',
    'For IDOR testing, always create two accounts and try to access resources between them.',
    'beginner',
  )
  add(
    'exploitation',
    'Test GraphQL endpoints for introspection, batching attacks, and nested query denial of service.',
    'intermediate',
  )
  add(
    'exploitation',
    'Check JWT tokens for algorithm confusion (none, HS256 vs RS256) and weak signing keys.',
    'advanced',
  )

  // Reporting tips
  add(
    'reporting',
    'Write your report assuming the reader has never seen the application. Include full URLs, parameters, and payloads.',
    'beginner',
  )
  add(
    'reporting',
    'Always include a CVSS score and CWE ID. It shows professionalism and helps triagers prioritize.',
    'beginner',
  )
  add(
    'reporting',
    'Record a video walkthrough for complex bugs — a 2-minute screen recording can save days of back-and-forth.',
    'intermediate',
  )
  add(
    'reporting',
    'Include a realistic impact section. "An attacker could steal 10M user records" is better than "data may be exposed."',
    'intermediate',
  )
  add(
    'reporting',
    'Suggest a specific remediation. Security teams appreciate actionable fixes over vague recommendations.',
    'beginner',
  )

  // Methodology tips
  add(
    'methodology',
    'Focus on one vulnerability class at a time across many programs rather than finding every bug in one program.',
    'intermediate',
  )
  add(
    'methodology',
    "Start with wide recon, then narrow to the most interesting targets — don't spend hours on well-tested login pages.",
    'beginner',
  )
  add(
    'methodology',
    'Read disclosed reports on HackerOne (Hacktivity) to learn what types of bugs other hunters are finding.',
    'beginner',
  )
  add(
    'methodology',
    'Build your own automation pipeline: recon → scanning → notification. Let the tools work while you sleep.',
    'advanced',
  )
  add(
    'methodology',
    'Focus on newer features and recently updated functionality — fresh code often has fresh bugs.',
    'intermediate',
  )

  // Mindset tips
  add(
    'mindset',
    'Expect duplicates — they are part of the game. Learn from them and move faster next time.',
    'beginner',
  )
  add(
    'mindset',
    "Don't burn out. Bug bounty is a marathon, not a sprint. Take breaks and maintain consistency.",
    'beginner',
  )
  add(
    'mindset',
    'Specialize in one vulnerability class before branching out. Deep expertise beats shallow breadth.',
    'intermediate',
  )
  add(
    'mindset',
    'Network with other hunters. Collaboration and knowledge sharing accelerate your growth.',
    'beginner',
  )

  // Scope tips
  add(
    'scope',
    'Read the program policy thoroughly before testing. Out-of-scope submissions waste your time and annoy triagers.',
    'beginner',
  )
  add(
    'scope',
    'Look for wildcard scopes (*.example.com) — these give you the widest attack surface.',
    'beginner',
  )
  add(
    'scope',
    'Prefer programs with responsive triage teams. Check the average response time before investing effort.',
    'intermediate',
  )
  add(
    'scope',
    "VDP programs don't pay but have less competition and are great for building your reputation.",
    'beginner',
  )

  // Tools tips
  add(
    'tools',
    "Learn Burp Suite inside and out — it's the single most important tool for web bug bounty hunting.",
    'beginner',
  )
  add(
    'tools',
    'Use tmux or screen to manage multiple terminal sessions during recon and exploitation.',
    'beginner',
  )
  add(
    'tools',
    'Set up a VPS for running long recon jobs — your home network will thank you.',
    'intermediate',
  )
  add(
    'tools',
    'Build a personal toolkit of scripts that automate your most common workflows.',
    'advanced',
  )
  add(
    'tools',
    'Use Caido or mitmproxy as lightweight alternatives to Burp Suite for quick testing.',
    'intermediate',
  )

  // Advanced exploitation tips
  add(
    'exploitation',
    'Look for second-order SQL injection: user input stored in the database and used unsafely in a different context later.',
    'expert',
  )
  add(
    'exploitation',
    'Test for HTTP request smuggling on targets behind CDNs or load balancers — often overlooked and pays very well.',
    'expert',
  )
  add(
    'exploitation',
    'Explore OAuth flows deeply: test redirect_uri manipulation, state parameter issues, and token leakage via Referer headers.',
    'advanced',
  )
  add(
    'exploitation',
    'When testing file uploads, try polyglot files that are valid in multiple formats (e.g., GIF header + PHP code).',
    'advanced',
  )
  add(
    'exploitation',
    'Check for mass assignment in API endpoints by adding unexpected parameters like role, isAdmin, or permissions.',
    'intermediate',
  )

  // Recon advanced tips
  add(
    'recon',
    'Use Shodan and Censys to discover internet-facing assets and identify technologies before even visiting the targets.',
    'advanced',
  )
  add(
    'recon',
    'Perform favicon hash lookups on Shodan to find related infrastructure and shadow IT assets.',
    'advanced',
  )
  add(
    'recon',
    'Enumerate cloud resources: S3 buckets, Azure blobs, and GCP storage for misconfigured permissions.',
    'intermediate',
  )
  add(
    'recon',
    'Use DNS brute-forcing with permutation techniques (gotator, altdns) to find subdomains that wordlists miss.',
    'advanced',
  )
  add(
    'recon',
    'Analyze mobile application APKs for hardcoded API keys, endpoints, and authentication tokens.',
    'advanced',
  )

  // Reporting advanced tips
  add(
    'reporting',
    'For complex vulnerability chains, create a diagram showing how each step leads to the next.',
    'advanced',
  )
  add(
    'reporting',
    'Include the exact HTTP request and response pairs in your report — triagers should not have to guess.',
    'intermediate',
  )
  add(
    'reporting',
    'If you find the same bug in multiple endpoints, submit one comprehensive report rather than many duplicates.',
    'beginner',
  )

  // Mindset advanced tips
  add(
    'mindset',
    'Keep a vulnerability journal. Document everything you try — failed attempts teach you as much as successes.',
    'intermediate',
  )
  add(
    'mindset',
    'Study disclosed reports (HackerOne Hacktivity, Pentester.land) weekly to learn new techniques and targets.',
    'beginner',
  )
  add(
    'mindset',
    'Set specific goals: number of hours hunting per week, number of reports per month, or new techniques to learn.',
    'intermediate',
  )

  // Scope advanced tips
  add(
    'scope',
    'When a new program launches, be among the first to test it — fresh programs have the most low-hanging fruit.',
    'intermediate',
  )
  add(
    'scope',
    'Check acquisitions and mergers — newly acquired companies often have assets added to scope with legacy vulnerabilities.',
    'advanced',
  )

  return tips
}

// ── Main Class ───────────────────────────────────────────────────

export class BugBountyKnowledge {
  private readonly config: BugBountyKnowledgeConfig
  private readonly platforms: BugBountyPlatform[]
  private readonly vulnClasses: VulnClassForBounty[]
  private readonly reconTechniques: ReconTechnique[]
  private readonly methodologyPhases: MethodologyPhase[]
  private readonly reportTemplates: Record<string, string[]>
  private readonly bugBountyTips: BugBountyTip[]

  private totalPlatformQueries = 0
  private totalVulnLookups = 0
  private totalReconLookups = 0
  private totalPayoutEstimations = 0
  private totalReportsGenerated = 0
  private totalScopeAnalyses = 0
  private totalHunterAssessments = 0
  private totalClassifications = 0
  private feedbackCount = 0
  private feedbackScores: number[] = []

  constructor(config?: Partial<BugBountyKnowledgeConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.platforms = buildPlatformDatabase()
    this.vulnClasses = buildVulnClassDatabase()
    this.reconTechniques = buildReconTechniqueDatabase()
    this.methodologyPhases = buildMethodologyPhases()
    this.reportTemplates = buildReportTemplates()
    this.bugBountyTips = buildBugBountyTips()
  }

  // ── Private helpers ────────────────────────────────────────────

  /** Internal lookup without incrementing stats counters. */
  private findVulnClass(name: string): VulnClassForBounty | undefined {
    const lower = name.toLowerCase()
    return this.vulnClasses.find(
      v => v.name.toLowerCase() === lower || v.name.toLowerCase().includes(lower),
    )
  }

  // ── Platform methods ─────────────────────────────────────────

  /** Get platform details by name. */
  getPlatformInfo(name: string): BugBountyPlatform | undefined {
    this.totalPlatformQueries++
    const lower = name.toLowerCase()
    return this.platforms.find(p => p.name.toLowerCase() === lower)
  }

  /** List all known bug bounty platforms. */
  listPlatforms(): BugBountyPlatform[] {
    this.totalPlatformQueries++
    return [...this.platforms]
  }

  /** Search platforms by matching against name and features. */
  searchPlatforms(query: string): BugBountyPlatform[] {
    this.totalPlatformQueries++
    const lower = query.toLowerCase()
    return this.platforms
      .filter(
        p =>
          p.name.toLowerCase().includes(lower) ||
          p.features.some(f => f.toLowerCase().includes(lower)) ||
          p.type.toLowerCase().includes(lower),
      )
      .slice(0, this.config.maxResults)
  }

  // ── Vulnerability class methods ──────────────────────────────

  /** Get vulnerability class info by name. */
  getVulnClass(name: string): VulnClassForBounty | undefined {
    this.totalVulnLookups++
    return this.findVulnClass(name)
  }

  /** List all vulnerability classes. */
  listVulnClasses(): VulnClassForBounty[] {
    this.totalVulnLookups++
    return [...this.vulnClasses]
  }

  /** Search vulnerability classes by query. */
  searchVulnClasses(query: string): VulnClassForBounty[] {
    this.totalVulnLookups++
    return this.vulnClasses
      .filter(
        v =>
          tokenSimilarity(query, `${v.name} ${v.owasp} ${v.cwe} ${v.commonTargets.join(' ')}`) >
          MIN_SIMILARITY_THRESHOLD,
      )
      .sort((a, b) => {
        const sa = tokenSimilarity(query, `${a.name} ${a.owasp} ${a.commonTargets.join(' ')}`)
        const sb = tokenSimilarity(query, `${b.name} ${b.owasp} ${b.commonTargets.join(' ')}`)
        return sb - sa
      })
      .slice(0, this.config.maxResults)
  }

  /** Get vulnerability types with highest typical payouts. */
  getHighPayoutVulns(): VulnClassForBounty[] {
    this.totalVulnLookups++
    return [...this.vulnClasses]
      .sort((a, b) => b.typicalPayout.max - a.typicalPayout.max)
      .slice(0, 10)
  }

  /** Estimate bounty payout for a severity and optional platform. */
  estimatePayout(severity: string, platform?: string): PayoutEstimate {
    this.totalPayoutEstimations++
    const sev = severity.toLowerCase()
    const platName = (platform ?? this.config.defaultPlatform).toLowerCase()
    const plat = this.platforms.find(p => p.name.toLowerCase() === platName)

    const sevMultipliers: Record<string, { minMult: number; maxMult: number; conf: number }> = {
      critical: { minMult: 0.4, maxMult: 1.0, conf: 0.8 },
      high: { minMult: 0.15, maxMult: 0.5, conf: 0.75 },
      medium: { minMult: 0.05, maxMult: 0.15, conf: 0.7 },
      low: { minMult: 0.01, maxMult: 0.05, conf: 0.65 },
      informational: { minMult: 0.0, maxMult: 0.01, conf: 0.5 },
    }

    const mult = sevMultipliers[sev] ?? sevMultipliers['medium']!
    const range = plat?.payoutRange ?? { min: 50, max: 50000 }
    const estimatedMin = round2(range.max * mult.minMult)
    const estimatedMax = round2(range.max * mult.maxMult)

    return {
      severity: sev,
      estimatedMin: Math.max(estimatedMin, range.min),
      estimatedMax,
      platform: plat?.name ?? platName,
      confidence: mult.conf,
    }
  }

  // ── Recon methods ────────────────────────────────────────────

  /** Get a recon technique by name. */
  getReconTechnique(name: string): ReconTechnique | undefined {
    this.totalReconLookups++
    const lower = name.toLowerCase()
    return this.reconTechniques.find(
      r => r.name.toLowerCase() === lower || r.name.toLowerCase().includes(lower),
    )
  }

  /** List all recon techniques. */
  listReconTechniques(): ReconTechnique[] {
    this.totalReconLookups++
    return [...this.reconTechniques]
  }

  /** Filter recon techniques by category (passive / active). */
  getReconByCategory(category: string): ReconTechnique[] {
    this.totalReconLookups++
    const lower = category.toLowerCase()
    return this.reconTechniques.filter(r => r.category.toLowerCase() === lower)
  }

  // ── Methodology methods ──────────────────────────────────────

  /** Get the full bug bounty methodology. */
  getMethodology(): BountyMethodology {
    const allTools = Array.from(new Set(this.methodologyPhases.flatMap(p => p.tools)))
    const allTips = this.methodologyPhases.flatMap(p => p.tips)
    return {
      phases: [...this.methodologyPhases],
      tools: allTools,
      tips: allTips,
    }
  }

  /** Get a specific methodology phase. */
  getMethodologyPhase(phase: string): MethodologyPhase | undefined {
    const lower = phase.toLowerCase()
    return this.methodologyPhases.find(p => p.name.toLowerCase() === lower)
  }

  // ── Report generation ────────────────────────────────────────

  /** Generate a bounty report template for a given vulnerability. */
  generateReport(vuln: string, target: string, severity: string): BountyReport {
    this.totalReportsGenerated++
    const vulnClass = this.findVulnClass(vuln)

    const sevLower = severity.toLowerCase()
    const vulnName = vulnClass?.name ?? vuln
    const cwe = vulnClass?.cwe ?? 'CWE-Unknown'
    const owasp = vulnClass?.owasp ?? 'OWASP Unknown'

    const cvssMap: Record<string, string> = {
      critical: '9.0-10.0',
      high: '7.0-8.9',
      medium: '4.0-6.9',
      low: '0.1-3.9',
      informational: '0.0',
    }

    const title = `[${severity.charAt(0).toUpperCase() + severity.slice(1)}] ${vulnName} in ${target}`

    const description = [
      `A ${sevLower}-severity ${vulnName} vulnerability was identified in ${target}.`,
      `This issue is classified under ${owasp} (${cwe}).`,
      vulnClass
        ? `Common targets for this class include: ${vulnClass.commonTargets.join(', ')}.`
        : 'Further investigation is recommended to determine the full scope.',
    ].join(' ')

    const stepsToReproduce = [
      `1. Navigate to ${target}`,
      `2. Identify the vulnerable parameter or endpoint`,
      `3. Inject the proof-of-concept payload (see PoC section)`,
      `4. Observe the ${vulnName} behavior in the application response`,
      `5. Verify the vulnerability is exploitable and not a false positive`,
    ]

    const impactStatements: Record<string, string> = {
      critical: `This vulnerability allows an attacker to fully compromise ${target}, potentially leading to complete system takeover, mass data exfiltration, or service destruction.`,
      high: `This vulnerability enables an attacker to access sensitive data or perform unauthorized actions on ${target}, affecting the confidentiality and integrity of the system.`,
      medium: `This vulnerability could be exploited to gain limited unauthorized access or information from ${target}, requiring some preconditions to be met.`,
      low: `This vulnerability has limited direct impact on ${target} but could be chained with other vulnerabilities or used in targeted social engineering attacks.`,
      informational: `This finding represents a security weakness in ${target} that does not have direct exploitable impact but indicates areas for security improvement.`,
    }

    const remediationTips = vulnClass?.reportTips ?? [
      'Apply input validation and output encoding',
      'Implement proper access controls',
      'Follow the principle of least privilege',
    ]

    const poc = [
      `# Proof of Concept for ${vulnName}`,
      `# Target: ${target}`,
      ``,
      `# Step 1: [Describe initial request]`,
      `curl -X POST '${target}' \\`,
      `  -H 'Content-Type: application/json' \\`,
      `  -d '{"parameter": "PAYLOAD_HERE"}'`,
      ``,
      `# Step 2: [Observe the vulnerable response]`,
      `# Expected: [Describe the expected vulnerable behavior]`,
    ].join('\n')

    return {
      title,
      severity: sevLower,
      description,
      stepsToReproduce,
      impact: impactStatements[sevLower] ?? impactStatements['medium']!,
      remediation: remediationTips.join('\n'),
      poc,
      cvss: cvssMap[sevLower] ?? '4.0-6.9',
    }
  }

  // ── Scope analysis ───────────────────────────────────────────

  /** Analyze a textual scope description and parse it into structured form. */
  analyzeScope(scopeDescription: string): BountyScope {
    this.totalScopeAnalyses++
    const lines = scopeDescription
      .split(/\n|;|,/)
      .map(l => l.trim())
      .filter(Boolean)

    const inScope: string[] = []
    const outOfScope: string[] = []
    const targets: BountyScopeTarget[] = []
    const rules: string[] = []

    const typeKeywords: Record<string, BountyScopeTarget['type']> = {
      api: 'api',
      rest: 'api',
      graphql: 'api',
      web: 'web',
      http: 'web',
      https: 'web',
      mobile: 'mobile',
      ios: 'mobile',
      android: 'mobile',
      network: 'network',
      ip: 'network',
      cidr: 'network',
      iot: 'iot',
      firmware: 'iot',
      hardware: 'hardware',
      physical: 'hardware',
      cloud: 'cloud',
      aws: 'cloud',
      azure: 'cloud',
      gcp: 'cloud',
    }

    let inScopeSection = true

    for (const line of lines) {
      const lower = line.toLowerCase()

      if (
        lower.includes('out of scope') ||
        lower.includes('out-of-scope') ||
        lower.includes('excluded')
      ) {
        inScopeSection = false
        continue
      }
      if (lower.includes('in scope') || lower.includes('in-scope') || lower.includes('included')) {
        inScopeSection = true
        continue
      }

      if (
        lower.includes('do not') ||
        lower.includes('must not') ||
        lower.includes('prohibited') ||
        lower.includes('no automated') ||
        lower.includes('rate limit')
      ) {
        rules.push(line)
        continue
      }

      if (inScopeSection) {
        inScope.push(line)

        let targetType: BountyScopeTarget['type'] = 'web'
        for (const [keyword, tType] of Object.entries(typeKeywords)) {
          if (lower.includes(keyword)) {
            targetType = tType
            break
          }
        }

        targets.push({
          type: targetType,
          asset: line,
          description: `Parsed from scope: ${line}`,
        })
      } else {
        outOfScope.push(line)
      }
    }

    if (rules.length === 0) {
      rules.push(
        'Follow responsible disclosure guidelines',
        'Do not access, modify, or delete user data',
        'Do not perform denial-of-service testing',
        'Report vulnerabilities promptly after discovery',
        'Do not use automated scanners without rate limiting',
        'Do not test against production systems unless explicitly permitted',
      )
    }

    // Deduplicate targets by asset
    const seenAssets = new Set<string>()
    const uniqueTargets = targets.filter(t => {
      if (seenAssets.has(t.asset.toLowerCase())) return false
      seenAssets.add(t.asset.toLowerCase())
      return true
    })

    return { inScope, outOfScope, targets: uniqueTargets, rules }
  }

  // ── Hunter assessment ────────────────────────────────────────

  /** Assess a bug bounty hunter's skill level based on their track record. */
  assessHunterLevel(reports: number, duplicates: number, avgSeverity: number): HunterProfile {
    this.totalHunterAssessments++
    const totalValid = Math.max(0, reports - duplicates)
    const duplicateRate = reports > 0 ? round2(duplicates / reports) : 0
    const sevClamped = clamp(avgSeverity, 0, 10)

    let level: string
    let skills: string[]
    let estimatedEarnings: number

    if (totalValid >= 500 && sevClamped >= 7 && duplicateRate < 0.15) {
      level = 'expert'
      skills = [
        'advanced exploitation chaining',
        'custom tooling development',
        'zero-day research',
        'binary analysis',
        'protocol-level attacks',
        'automation at scale',
        'mentoring other hunters',
      ]
      estimatedEarnings = round2(totalValid * sevClamped * 350)
    } else if (totalValid >= 100 && sevClamped >= 5 && duplicateRate < 0.25) {
      level = 'advanced'
      skills = [
        'complex vulnerability chains',
        'custom nuclei templates',
        'API security testing',
        'business logic analysis',
        'race condition exploitation',
        'cloud security testing',
      ]
      estimatedEarnings = round2(totalValid * sevClamped * 200)
    } else if (totalValid >= 20 && sevClamped >= 3) {
      level = 'intermediate'
      skills = [
        'common web vulnerability detection',
        'Burp Suite proficiency',
        'basic recon automation',
        'report writing',
        'OWASP Top 10 testing',
        'subdomain enumeration',
      ]
      estimatedEarnings = round2(totalValid * sevClamped * 100)
    } else {
      level = 'beginner'
      skills = [
        'learning web security fundamentals',
        'basic recon',
        'following tutorials and writeups',
        'using automated scanners',
        'understanding HTTP and browser security',
      ]
      estimatedEarnings = round2(totalValid * sevClamped * 50)
    }

    return {
      level,
      skills,
      earnings: { estimated: estimatedEarnings, currency: 'USD' },
      reportsSubmitted: reports,
      duplicateRate,
      avgSeverity: sevClamped,
    }
  }

  // ── Duplicate avoidance ──────────────────────────────────────

  /** Get strategies for avoiding duplicate reports. */
  getDuplicateAvoidanceStrategies(): DuplicateStrategy[] {
    return [
      {
        name: 'Target Fresh Assets',
        description:
          'Focus on newly deployed features, recent acquisitions, and recently launched subdomains that other hunters have not tested yet.',
        techniques: [
          'Monitor subdomain changes with tools like sublert',
          'Watch for new product launches and feature announcements',
          'Track GitHub commits for new endpoint deployments',
          'Set up Google Alerts for target company tech blog posts',
        ],
      },
      {
        name: 'Go Deep, Not Wide',
        description:
          "Instead of surface-level scanning across many programs, deeply understand one application's business logic and find complex bugs.",
        techniques: [
          'Spend a full week understanding one application',
          'Map the complete business logic flow',
          'Create detailed notes on every feature and endpoint',
          'Look for multi-step logic flaws that scanners miss',
        ],
      },
      {
        name: 'Hunt During Off-Peak Hours',
        description:
          'Submit reports during times when fewer hunters are active to reduce the window for someone else to find the same bug first.',
        techniques: [
          'Hunt on weekdays when most researchers are working day jobs',
          'Report immediately upon discovery rather than batching',
          'Set up alerts for new program launches and act fast',
          'Focus on programs in different time zones',
        ],
      },
      {
        name: 'Specialize in Niche Vulnerability Classes',
        description:
          'Become an expert in less-common vulnerability types that most hunters overlook.',
        techniques: [
          'Learn race condition exploitation deeply',
          'Master business logic testing patterns',
          'Study deserialization attacks across frameworks',
          'Explore IoT and hardware hacking',
          'Focus on blockchain and smart contract vulnerabilities',
        ],
      },
      {
        name: 'Build Custom Automation',
        description:
          'Create proprietary automation that gives you an edge over hunters using off-the-shelf tools.',
        techniques: [
          'Write custom Nuclei templates for niche findings',
          'Automate recon pipelines with unique data sources',
          'Build notification systems for target changes',
          'Create fuzzing harnesses for specific applications',
        ],
      },
      {
        name: 'Target Private Programs',
        description:
          'Private programs have fewer researchers and less competition, leading to fewer duplicates.',
        techniques: [
          'Build reputation on public programs to get private invites',
          'Maintain high signal on HackerOne and Bugcrowd',
          'Respond quickly to private invitations',
          'Consistently deliver quality reports to keep invitations flowing',
        ],
      },
      {
        name: 'Monitor Scope Changes',
        description:
          'Watch for programs that expand their scope or add new assets — these are fresh hunting grounds.',
        techniques: [
          'Subscribe to program update notifications on platforms',
          'Follow security teams on Twitter/X for announcements',
          'Check program pages weekly for scope updates',
          'Set up automated monitoring for program policy changes',
        ],
      },
      {
        name: 'Focus on Mobile Applications',
        description:
          'Mobile apps are tested less frequently than web apps by most bug bounty hunters.',
        techniques: [
          'Decompile APKs with jadx and look for hardcoded secrets',
          'Use Frida for runtime analysis and SSL pinning bypass',
          'Test API endpoints discovered in mobile traffic separately',
          'Check for insecure local storage and data leakage',
        ],
      },
    ]
  }

  // ── Responsible disclosure ───────────────────────────────────

  /** Get responsible disclosure guide. */
  getResponsibleDisclosureGuide(): ResponsibleDisclosure {
    return {
      steps: [
        '1. Discover the vulnerability and document it thoroughly',
        '2. Check if the organization has a bug bounty program or VDP',
        '3. Report through the official channel (program page, security.txt, security@domain)',
        '4. Provide clear reproduction steps and proof of concept',
        '5. Wait for acknowledgment (typically 1-5 business days)',
        '6. Collaborate with the security team on remediation timeline',
        '7. Allow reasonable time for patching (typically 90 days)',
        '8. Coordinate public disclosure if desired and agreed upon',
      ],
      doList: [
        'Report promptly after discovery',
        'Use the official reporting channel',
        'Provide detailed reproduction steps',
        'Be professional and patient in communications',
        'Keep the vulnerability confidential until patched',
        'Test only within the defined scope',
        'Use the minimum access needed to prove the vulnerability',
        'Encrypt sensitive communications when possible',
      ],
      dontList: [
        'Access, modify, or delete data belonging to other users',
        'Perform denial-of-service attacks',
        'Use social engineering against employees',
        'Test against production systems unless explicitly permitted',
        'Publicly disclose before the agreed timeline',
        'Demand payment for disclosure (this is extortion)',
        'Access systems beyond what is needed for the PoC',
        'Run automated scanners without rate limiting',
      ],
      timeline: [
        'Day 0: Vulnerability discovered and documented',
        'Day 0-1: Report submitted through official channel',
        'Day 1-5: Acknowledgment expected from vendor',
        'Day 5-14: Initial triage and severity assessment',
        'Day 14-30: Remediation development by vendor',
        'Day 30-90: Patch deployment and verification',
        'Day 90+: Coordinated public disclosure (if applicable)',
      ],
      legalConsiderations: [
        'Always operate within the defined scope and terms',
        'Keep records of all communications and testing activities',
        'Do not access systems in jurisdictions with restrictive computer laws without authorization',
        'Bug bounty safe harbor provisions protect good-faith research',
        'Familiarize yourself with the CFAA (US), Computer Misuse Act (UK), and local equivalents',
        'When in doubt, ask the program for clarification before testing',
      ],
    }
  }

  // ── Tips ─────────────────────────────────────────────────────

  /** Get bug bounty tips, optionally filtered by category. */
  getTips(category?: string): BugBountyTip[] {
    if (!category) return [...this.bugBountyTips]
    const lower = category.toLowerCase()
    return this.bugBountyTips.filter(t => t.category.toLowerCase() === lower)
  }

  // ── Program recommendations ──────────────────────────────────

  /** Recommend program type based on hunter experience level. */
  recommendProgramType(experience: string): string {
    const lower = experience.toLowerCase()

    if (lower === 'beginner' || lower === 'new' || lower === 'novice') {
      return [
        'Recommended: Start with VDP (Vulnerability Disclosure Programs) and public programs.',
        '',
        'Why: VDPs have less competition and are forgiving of beginner mistakes.',
        'Public programs let you learn at your own pace without pressure.',
        '',
        'Suggested platforms: Open Bug Bounty, HackerOne (public programs)',
        'Focus on: XSS, open redirects, information disclosure',
        'Goal: Submit 10-20 valid reports to build your reputation',
      ].join('\n')
    }

    if (lower === 'intermediate') {
      return [
        'Recommended: Public bounty programs with responsive triage teams.',
        '',
        'Why: You have enough skill to find real bugs and earn bounties.',
        'Responsive triage means faster payouts and less frustration.',
        '',
        'Suggested platforms: HackerOne, Bugcrowd, Intigriti',
        'Focus on: IDOR, SSRF, authentication bypass, business logic',
        'Goal: Build consistent income and earn private program invitations',
      ].join('\n')
    }

    if (lower === 'advanced') {
      return [
        'Recommended: Private programs and managed bug bounty platforms.',
        '',
        'Why: Less competition, higher payouts, and more interesting targets.',
        'Your reputation should be earning you private invitations.',
        '',
        'Suggested platforms: Synack, HackerOne (private), Cobalt',
        'Focus on: Complex chains, RCE, authentication/authorization flaws',
        'Goal: Maximize earnings and build long-term relationships with programs',
      ].join('\n')
    }

    if (lower === 'expert') {
      return [
        'Recommended: High-value private programs, live hacking events, and blockchain bounties.',
        '',
        'Why: Your skills command premium payouts. Live events and crypto programs',
        'offer the highest rewards and most challenging targets.',
        '',
        'Suggested platforms: Synack Red Team, Immunefi, HackerOne (invite-only)',
        'Focus on: Zero-days, smart contract audits, complex exploit chains',
        'Goal: Six-figure earnings, conference speaking, mentoring the community',
      ].join('\n')
    }

    return [
      'Please specify an experience level: beginner, intermediate, advanced, or expert.',
      'Each level has different recommended platforms, vulnerability classes, and goals.',
    ].join('\n')
  }

  // ── Tools per phase ──────────────────────────────────────────

  /** Get recommended tools for a specific methodology phase. */
  getToolsForPhase(phase: string): string[] {
    const p = this.getMethodologyPhase(phase)
    return p ? [...p.tools] : []
  }

  // ── Vulnerability classification ─────────────────────────────

  /** Classify a vulnerability description into matching vulnerability classes. */
  classifyVulnerability(description: string): VulnClassForBounty[] {
    this.totalClassifications++

    const keywords: Record<string, string[]> = {
      'sql injection': ['sql', 'injection', 'sqli', 'database', 'query', 'union', 'select'],
      xss: ['xss', 'script', 'cross-site', 'reflected', 'stored', 'dom'],
      ssrf: ['ssrf', 'server-side', 'request', 'forgery', 'internal', 'metadata'],
      idor: ['idor', 'insecure', 'direct', 'object', 'reference', 'authorization'],
      rce: ['rce', 'remote', 'code', 'execution', 'command', 'shell'],
      csrf: ['csrf', 'cross-site', 'request', 'forgery', 'state-changing'],
      authentication: ['authentication', 'login', 'bypass', 'password', 'session', 'credential'],
      xxe: ['xxe', 'xml', 'external', 'entity', 'dtd'],
      ssti: ['ssti', 'template', 'injection', 'jinja', 'twig', 'freemarker'],
      prototype: ['prototype', 'pollution', '__proto__', 'constructor'],
      deserialization: ['deserialization', 'deserialize', 'pickle', 'marshal', 'gadget'],
      'path traversal': ['path', 'traversal', 'directory', 'lfi', 'file', 'inclusion'],
      'open redirect': ['redirect', 'open', 'url', 'location'],
      cors: ['cors', 'cross-origin', 'origin', 'access-control'],
      'race condition': ['race', 'condition', 'concurrent', 'toctou', 'parallel'],
    }

    const descLower = description.toLowerCase()
    const descTokens = new Set(descLower.split(/\W+/).filter(Boolean))

    const scored = this.vulnClasses.map(v => {
      let score = tokenSimilarity(
        description,
        `${v.name} ${v.owasp} ${v.cwe} ${v.commonTargets.join(' ')}`,
      )

      for (const [, kws] of Object.entries(keywords)) {
        const matchCount = kws.filter(kw => descTokens.has(kw)).length
        if (matchCount > 0 && tokenSimilarity(v.name.toLowerCase(), kws.join(' ')) > 0.2) {
          score += matchCount * 0.05
        }
      }

      return { vuln: v, score }
    })

    return scored
      .filter(s => s.score > MIN_CLASSIFICATION_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.vuln)
  }

  // ── Feedback ─────────────────────────────────────────────────

  /** Provide feedback on the bug bounty knowledge engine. */
  provideFeedback(rating: number, comment: string): void {
    this.feedbackCount++
    const r = clamp(rating, 1, 5)
    this.feedbackScores.push(r)

    if (comment.toLowerCase().includes('more detail')) {
      this.config.maxResults = Math.min(this.config.maxResults + 10, 100)
    } else if (
      comment.toLowerCase().includes('too much') ||
      comment.toLowerCase().includes('overwhelming')
    ) {
      this.config.maxResults = Math.max(this.config.maxResults - 10, 5)
    }
  }

  // ── Stats ────────────────────────────────────────────────────

  /** Return aggregate usage statistics. */
  getStats(): Readonly<BugBountyKnowledgeStats> {
    const avgScore =
      this.feedbackScores.length > 0
        ? this.feedbackScores.reduce((s, v) => s + v, 0) / this.feedbackScores.length
        : 0

    return {
      totalPlatformQueries: this.totalPlatformQueries,
      totalVulnLookups: this.totalVulnLookups,
      totalReconLookups: this.totalReconLookups,
      totalPayoutEstimations: this.totalPayoutEstimations,
      totalReportsGenerated: this.totalReportsGenerated,
      totalScopeAnalyses: this.totalScopeAnalyses,
      totalHunterAssessments: this.totalHunterAssessments,
      totalClassifications: this.totalClassifications,
      feedbackCount: this.feedbackCount,
      avgFeedbackScore: round2(avgScore),
    }
  }

  // ── Serialization ────────────────────────────────────────────

  /** Serialize the knowledge engine state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalPlatformQueries: this.totalPlatformQueries,
      totalVulnLookups: this.totalVulnLookups,
      totalReconLookups: this.totalReconLookups,
      totalPayoutEstimations: this.totalPayoutEstimations,
      totalReportsGenerated: this.totalReportsGenerated,
      totalScopeAnalyses: this.totalScopeAnalyses,
      totalHunterAssessments: this.totalHunterAssessments,
      totalClassifications: this.totalClassifications,
      feedbackCount: this.feedbackCount,
      feedbackScores: this.feedbackScores,
    })
  }

  /** Restore a BugBountyKnowledge instance from serialized JSON. */
  static deserialize(json: string): BugBountyKnowledge {
    const data = JSON.parse(json) as {
      config: BugBountyKnowledgeConfig
      totalPlatformQueries: number
      totalVulnLookups: number
      totalReconLookups: number
      totalPayoutEstimations: number
      totalReportsGenerated: number
      totalScopeAnalyses: number
      totalHunterAssessments: number
      totalClassifications: number
      feedbackCount: number
      feedbackScores: number[]
    }

    const instance = new BugBountyKnowledge(data.config)
    instance.totalPlatformQueries = data.totalPlatformQueries ?? 0
    instance.totalVulnLookups = data.totalVulnLookups ?? 0
    instance.totalReconLookups = data.totalReconLookups ?? 0
    instance.totalPayoutEstimations = data.totalPayoutEstimations ?? 0
    instance.totalReportsGenerated = data.totalReportsGenerated ?? 0
    instance.totalScopeAnalyses = data.totalScopeAnalyses ?? 0
    instance.totalHunterAssessments = data.totalHunterAssessments ?? 0
    instance.totalClassifications = data.totalClassifications ?? 0
    instance.feedbackCount = data.feedbackCount ?? 0
    instance.feedbackScores = data.feedbackScores ?? []
    return instance
  }
}
