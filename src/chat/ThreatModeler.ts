/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🛡️  T H R E A T   M O D E L E R                                    ║
 * ║                                                                             ║
 * ║   Cybersecurity threat modeling intelligence:                                ║
 * ║     model → identify → analyze → mitigate                                   ║
 * ║                                                                             ║
 * ║     • STRIDE, DREAD, PASTA & attack-tree methodologies                      ║
 * ║     • Automated threat identification from assets & data flows              ║
 * ║     • Attack tree construction with cost/probability analysis               ║
 * ║     • Mitigation suggestion from OWASP-aligned control database             ║
 * ║     • Threat intelligence with MITRE ATT&CK inspired entries                ║
 * ║     • Risk assessment and reporting in multiple formats                     ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface ThreatModelerConfig {
  maxThreats: number;
  methodology: 'stride' | 'dread' | 'pasta' | 'attack_tree' | 'all';
  enableAutoMitigation: boolean;
  riskThreshold: number;
  enableAttackTrees: boolean;
  enableThreatIntelligence: boolean;
}

export interface ThreatModelerStats {
  totalModels: number;
  totalThreats: number;
  totalMitigations: number;
  totalAttackTrees: number;
  avgRiskScore: number;
  feedbackCount: number;
}

export type ThreatCategory =
  | 'spoofing'
  | 'tampering'
  | 'repudiation'
  | 'information_disclosure'
  | 'denial_of_service'
  | 'elevation_of_privilege'
  | 'injection'
  | 'broken_auth'
  | 'sensitive_data'
  | 'xxe'
  | 'broken_access'
  | 'misconfig'
  | 'xss'
  | 'deserialization'
  | 'insufficient_logging'
  | 'ssrf';

export type StrideCategory =
  | 'spoofing'
  | 'tampering'
  | 'repudiation'
  | 'information_disclosure'
  | 'denial_of_service'
  | 'elevation_of_privilege';

export interface DreadScore {
  damage: number;
  reproducibility: number;
  exploitability: number;
  affectedUsers: number;
  discoverability: number;
  total: number;
}

export interface Mitigation {
  id: string;
  title: string;
  description: string;
  effectiveness: number;
  effort: 'low' | 'medium' | 'high';
  status: 'proposed' | 'implemented' | 'verified';
  controlType: 'preventive' | 'detective' | 'corrective' | 'deterrent';
}

export interface Asset {
  id: string;
  name: string;
  type: 'data' | 'service' | 'infrastructure' | 'user' | 'process';
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  description: string;
}

export interface Threat {
  id: string;
  title: string;
  description: string;
  category: ThreatCategory;
  targetAsset: string;
  strideCategory?: StrideCategory;
  dreadScore?: DreadScore;
  likelihood: number;
  impact: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigations: Mitigation[];
  status: 'identified' | 'mitigated' | 'accepted' | 'transferred';
}

export interface DataFlow {
  id: string;
  source: string;
  destination: string;
  data: string;
  protocol?: string;
  encrypted: boolean;
  authentication: boolean;
}

export interface TrustBoundary {
  id: string;
  name: string;
  type: 'network' | 'process' | 'machine' | 'user';
  insideAssets: string[];
  outsideAssets: string[];
}

export interface AttackNode {
  id: string;
  description: string;
  type: 'and' | 'or' | 'leaf';
  cost?: number;
  probability?: number;
  difficulty?: 'low' | 'medium' | 'high' | 'expert';
  children?: AttackNode[];
}

export interface AttackTree {
  id: string;
  goal: string;
  rootNode: AttackNode;
}

export interface ThreatIntelEntry {
  id: string;
  threat: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  lastSeen: number;
  tactics: string[];
  techniques: string[];
}

export interface ThreatModel {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  assets: Asset[];
  threats: Threat[];
  dataFlows: DataFlow[];
  trustBoundaries: TrustBoundary[];
  attackTrees: AttackTree[];
  riskScore: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: ThreatModelerConfig = {
  maxThreats: 200,
  methodology: 'all',
  enableAutoMitigation: true,
  riskThreshold: 0.5,
  enableAttackTrees: true,
  enableThreatIntelligence: true,
};

// ── Threat Intelligence Database ─────────────────────────────────────────────

function buildThreatIntelDatabase(): ThreatIntelEntry[] {
  const entries: ThreatIntelEntry[] = [];
  let counter = 0;

  const add = (
    threat: string, source: string,
    severity: ThreatIntelEntry['severity'],
    indicators: string[], tactics: string[],
    techniques: string[],
  ) => {
    entries.push({
      id: `INTEL-${String(++counter).padStart(3, '0')}`,
      threat, source, severity, indicators,
      lastSeen: Date.now(),
      tactics, techniques,
    });
  };

  add(
    'APT29 Spear Phishing Campaign',
    'MITRE ATT&CK / CISA',
    'critical',
    ['malicious-doc.hta', 'powershell -enc', 'cobalt-strike beacon'],
    ['Initial Access', 'Execution'],
    ['T1566.001 Spearphishing Attachment', 'T1059.001 PowerShell'],
  );
  add(
    'Ransomware via RDP Brute Force',
    'FBI Flash Alert',
    'critical',
    ['failed-rdp-logins > 100/hr', 'mimikatz.exe', 'vssadmin delete shadows'],
    ['Initial Access', 'Credential Access', 'Impact'],
    ['T1110.001 Password Guessing', 'T1003.001 LSASS Memory', 'T1486 Data Encrypted for Impact'],
  );
  add(
    'Supply Chain Compromise via NPM Package',
    'GitHub Advisory Database',
    'high',
    ['postinstall script exec', 'base64 encoded payload', 'exfil to unknown domain'],
    ['Initial Access', 'Execution'],
    ['T1195.002 Compromise Software Supply Chain', 'T1059.007 JavaScript'],
  );
  add(
    'SQL Injection on Authentication Endpoint',
    'OWASP Top 10',
    'critical',
    ["' OR 1=1--", 'UNION SELECT', 'error-based SQLi response'],
    ['Initial Access', 'Credential Access'],
    ['T1190 Exploit Public-Facing Application'],
  );
  add(
    'Server-Side Request Forgery (SSRF)',
    'OWASP Top 10',
    'high',
    ['requests to 169.254.169.254', 'internal IP in response', 'cloud metadata access'],
    ['Discovery', 'Lateral Movement'],
    ['T1190 Exploit Public-Facing Application', 'T1552.005 Cloud Instance Metadata API'],
  );
  add(
    'Credential Stuffing Attack',
    'MITRE ATT&CK',
    'high',
    ['high volume login attempts', 'distributed source IPs', 'known breach credentials'],
    ['Credential Access'],
    ['T1110.004 Credential Stuffing'],
  );
  add(
    'DNS Tunneling for Data Exfiltration',
    'SANS Internet Storm Center',
    'high',
    ['unusually long DNS queries', 'high TXT record volume', 'base32/base64 in subdomains'],
    ['Command and Control', 'Exfiltration'],
    ['T1071.004 DNS', 'T1048.001 Exfiltration Over Symmetric Encrypted Non-C2 Protocol'],
  );
  add(
    'Cross-Site Scripting (Stored XSS)',
    'OWASP Top 10',
    'high',
    ['<script> in stored content', 'event handler attributes', 'javascript: protocol in href'],
    ['Initial Access', 'Execution'],
    ['T1189 Drive-by Compromise'],
  );
  add(
    'Container Escape via Privileged Mode',
    'Docker Security Advisory',
    'critical',
    ['--privileged flag', 'mount /dev/sda', 'nsenter into host PID'],
    ['Privilege Escalation', 'Defense Evasion'],
    ['T1611 Escape to Host'],
  );
  add(
    'Kubernetes API Server Unauthorized Access',
    'CNCF Security Audit',
    'critical',
    ['anonymous-auth=true', 'kube-system secrets read', 'no RBAC policy'],
    ['Initial Access', 'Privilege Escalation'],
    ['T1078 Valid Accounts', 'T1068 Exploitation for Privilege Escalation'],
  );
  add(
    'Log4Shell Remote Code Execution',
    'CVE-2021-44228',
    'critical',
    ['${jndi:ldap://', 'java.lang.Runtime.exec', 'outbound LDAP connections'],
    ['Initial Access', 'Execution'],
    ['T1190 Exploit Public-Facing Application', 'T1059 Command and Scripting Interpreter'],
  );
  add(
    'OAuth Token Theft via Open Redirect',
    'CWE-601',
    'medium',
    ['redirect_uri manipulation', 'token in URL fragment', 'referrer header leakage'],
    ['Credential Access', 'Collection'],
    ['T1528 Steal Application Access Token'],
  );
  add(
    'Insecure Deserialization RCE',
    'OWASP Top 10',
    'critical',
    ['ObjectInputStream.readObject', 'pickle.loads', 'yaml.load without SafeLoader'],
    ['Execution'],
    ['T1059 Command and Scripting Interpreter'],
  );
  add(
    'Cloud Storage Bucket Misconfiguration',
    'Cloud Security Alliance',
    'high',
    ['public-read ACL', 'no bucket policy', 'directory listing enabled'],
    ['Collection', 'Exfiltration'],
    ['T1530 Data from Cloud Storage'],
  );
  add(
    'JWT Token Forgery via None Algorithm',
    'CVE-2015-9235',
    'high',
    ['alg: none', 'missing signature validation', 'symmetric/asymmetric confusion'],
    ['Credential Access', 'Defense Evasion'],
    ['T1528 Steal Application Access Token', 'T1550.001 Application Access Token'],
  );
  add(
    'Phishing with Adversary-in-the-Middle Proxy',
    'MITRE ATT&CK',
    'high',
    ['evilginx2 fingerprint', 'real-time credential relay', 'MFA token capture'],
    ['Initial Access', 'Credential Access'],
    ['T1557 Adversary-in-the-Middle', 'T1556 Modify Authentication Process'],
  );
  add(
    'XML External Entity Injection (XXE)',
    'OWASP Top 10',
    'high',
    ['<!DOCTYPE with ENTITY', 'file:///etc/passwd', 'blind XXE via OOB channel'],
    ['Collection', 'Exfiltration'],
    ['T1190 Exploit Public-Facing Application'],
  );
  add(
    'Prototype Pollution in JavaScript',
    'Snyk Vulnerability DB',
    'medium',
    ['__proto__ in input', 'constructor.prototype', 'Object.assign with user input'],
    ['Execution', 'Privilege Escalation'],
    ['T1059.007 JavaScript'],
  );
  add(
    'CI/CD Pipeline Poisoning',
    'CISA Supply Chain Advisory',
    'high',
    ['modified workflow file', 'secrets in build logs', 'unsigned artifacts'],
    ['Initial Access', 'Execution', 'Persistence'],
    ['T1195.002 Compromise Software Supply Chain', 'T1059 Command and Scripting Interpreter'],
  );
  add(
    'Business Email Compromise (BEC)',
    'FBI IC3 Report',
    'high',
    ['spoofed executive email', 'urgent wire transfer request', 'reply-to mismatch'],
    ['Initial Access', 'Collection'],
    ['T1566.002 Spearphishing Link', 'T1534 Internal Spearphishing'],
  );

  return entries;
}

// ── STRIDE Templates ─────────────────────────────────────────────────────────

interface StrideTemplate {
  componentType: string;
  threats: Array<{ category: StrideCategory; threat: string; description: string }>;
}

function buildStrideTemplates(): StrideTemplate[] {
  return [
    {
      componentType: 'web_application',
      threats: [
        { category: 'spoofing', threat: 'Session Hijacking', description: 'Attacker steals session tokens to impersonate legitimate users' },
        { category: 'tampering', threat: 'Parameter Manipulation', description: 'Attacker modifies request parameters to alter application behavior' },
        { category: 'repudiation', threat: 'Insufficient Audit Logging', description: 'Lack of logging allows users to deny actions they performed' },
        { category: 'information_disclosure', threat: 'Verbose Error Messages', description: 'Detailed error messages reveal internal architecture and stack traces' },
        { category: 'denial_of_service', threat: 'Application-Layer DoS', description: 'Resource-intensive requests exhaust server capacity' },
        { category: 'elevation_of_privilege', threat: 'Broken Access Control', description: 'Users access resources or functions beyond their authorization level' },
      ],
    },
    {
      componentType: 'api_endpoint',
      threats: [
        { category: 'spoofing', threat: 'API Key Theft', description: 'Attacker obtains API keys through code repositories or network interception' },
        { category: 'tampering', threat: 'Request Body Manipulation', description: 'Attacker modifies JSON/XML payloads to inject malicious data' },
        { category: 'repudiation', threat: 'Missing Request Logging', description: 'API calls not logged, preventing forensic analysis' },
        { category: 'information_disclosure', threat: 'Excessive Data Exposure', description: 'API returns more data than the client needs, exposing sensitive fields' },
        { category: 'denial_of_service', threat: 'Rate Limit Bypass', description: 'Attacker circumvents rate limiting to overwhelm API endpoints' },
        { category: 'elevation_of_privilege', threat: 'BOLA/IDOR', description: 'Broken Object Level Authorization allows access to other users\' resources' },
      ],
    },
    {
      componentType: 'database',
      threats: [
        { category: 'spoofing', threat: 'Database Credential Theft', description: 'Attacker obtains database credentials from config files or environment variables' },
        { category: 'tampering', threat: 'SQL Injection', description: 'Attacker injects SQL statements to modify or delete data' },
        { category: 'repudiation', threat: 'No Database Audit Trail', description: 'Data changes cannot be traced back to specific users or operations' },
        { category: 'information_disclosure', threat: 'Data Exfiltration', description: 'Attacker extracts sensitive data through SQL injection or direct access' },
        { category: 'denial_of_service', threat: 'Resource Exhaustion Query', description: 'Expensive queries lock tables or consume all available connections' },
        { category: 'elevation_of_privilege', threat: 'Privilege Escalation via SQL', description: 'Attacker uses SQL injection to execute OS commands or escalate DB privileges' },
      ],
    },
    {
      componentType: 'authentication_service',
      threats: [
        { category: 'spoofing', threat: 'Credential Stuffing', description: 'Attacker uses leaked credential pairs to gain unauthorized access' },
        { category: 'tampering', threat: 'Token Manipulation', description: 'Attacker modifies authentication tokens to alter identity claims' },
        { category: 'repudiation', threat: 'Login Activity Not Recorded', description: 'Failed and successful login attempts are not logged for review' },
        { category: 'information_disclosure', threat: 'User Enumeration', description: 'Different error messages reveal whether a username exists' },
        { category: 'denial_of_service', threat: 'Account Lockout Abuse', description: 'Attacker intentionally locks out legitimate users by triggering lockout policies' },
        { category: 'elevation_of_privilege', threat: 'JWT Algorithm Confusion', description: 'Attacker exploits JWT library to forge tokens using none or HS256 algorithm' },
      ],
    },
    {
      componentType: 'file_storage',
      threats: [
        { category: 'spoofing', threat: 'Path Traversal', description: 'Attacker uses ../ sequences to access files outside intended directory' },
        { category: 'tampering', threat: 'Malicious File Upload', description: 'Attacker uploads executable files disguised as images or documents' },
        { category: 'repudiation', threat: 'No File Access Logging', description: 'File read/write operations not tracked for compliance and forensics' },
        { category: 'information_disclosure', threat: 'Directory Listing Exposure', description: 'Misconfigured storage exposes directory contents to unauthorized users' },
        { category: 'denial_of_service', threat: 'Storage Exhaustion', description: 'Attacker uploads large volumes of data to fill available storage' },
        { category: 'elevation_of_privilege', threat: 'Symlink Attack', description: 'Attacker creates symbolic links to access restricted files via file operations' },
      ],
    },
    {
      componentType: 'message_queue',
      threats: [
        { category: 'spoofing', threat: 'Message Source Forgery', description: 'Attacker injects messages pretending to be a trusted producer' },
        { category: 'tampering', threat: 'Message Payload Modification', description: 'Messages altered in transit due to lack of integrity verification' },
        { category: 'repudiation', threat: 'Unattributed Messages', description: 'Messages lack sender identification preventing accountability' },
        { category: 'information_disclosure', threat: 'Queue Sniffing', description: 'Attacker reads messages from queue containing sensitive data' },
        { category: 'denial_of_service', threat: 'Queue Flooding', description: 'Attacker sends massive volume of messages to overwhelm consumers' },
        { category: 'elevation_of_privilege', threat: 'Consumer Impersonation', description: 'Attacker subscribes as a consumer to intercept messages meant for other services' },
      ],
    },
  ];
}

// ── Mitigation Database ──────────────────────────────────────────────────────

interface MitigationTemplate {
  title: string;
  description: string;
  effectiveness: number;
  effort: Mitigation['effort'];
  controlType: Mitigation['controlType'];
  applicableCategories: ThreatCategory[];
}

function buildMitigationDatabase(): MitigationTemplate[] {
  return [
    { title: 'Input Validation', description: 'Validate and sanitize all user input on the server side using allowlists', effectiveness: 0.85, effort: 'medium', controlType: 'preventive', applicableCategories: ['injection', 'xss', 'xxe', 'ssrf'] },
    { title: 'Parameterized Queries', description: 'Use prepared statements and parameterized queries for all database interactions', effectiveness: 0.95, effort: 'low', controlType: 'preventive', applicableCategories: ['injection'] },
    { title: 'Multi-Factor Authentication', description: 'Require MFA for all user accounts, especially privileged ones', effectiveness: 0.90, effort: 'medium', controlType: 'preventive', applicableCategories: ['spoofing', 'broken_auth'] },
    { title: 'TLS Encryption', description: 'Encrypt all data in transit using TLS 1.2 or higher', effectiveness: 0.90, effort: 'low', controlType: 'preventive', applicableCategories: ['information_disclosure', 'tampering', 'sensitive_data'] },
    { title: 'Role-Based Access Control', description: 'Implement RBAC with principle of least privilege across all resources', effectiveness: 0.85, effort: 'medium', controlType: 'preventive', applicableCategories: ['broken_access', 'elevation_of_privilege'] },
    { title: 'Rate Limiting', description: 'Implement rate limiting and throttling on all API endpoints', effectiveness: 0.75, effort: 'low', controlType: 'preventive', applicableCategories: ['denial_of_service', 'broken_auth'] },
    { title: 'Content Security Policy', description: 'Deploy CSP headers to prevent XSS and data injection attacks', effectiveness: 0.80, effort: 'medium', controlType: 'preventive', applicableCategories: ['xss', 'injection'] },
    { title: 'Security Audit Logging', description: 'Log all security-relevant events with tamper-proof storage', effectiveness: 0.80, effort: 'medium', controlType: 'detective', applicableCategories: ['repudiation', 'insufficient_logging'] },
    { title: 'Web Application Firewall', description: 'Deploy WAF to filter and monitor HTTP traffic for known attack patterns', effectiveness: 0.70, effort: 'medium', controlType: 'detective', applicableCategories: ['injection', 'xss', 'ssrf', 'xxe'] },
    { title: 'Intrusion Detection System', description: 'Deploy network and host-based IDS to detect anomalous activity', effectiveness: 0.65, effort: 'high', controlType: 'detective', applicableCategories: ['denial_of_service', 'elevation_of_privilege', 'tampering'] },
    { title: 'Data Encryption at Rest', description: 'Encrypt sensitive data at rest using AES-256 or equivalent', effectiveness: 0.85, effort: 'medium', controlType: 'preventive', applicableCategories: ['information_disclosure', 'sensitive_data'] },
    { title: 'Secure Session Management', description: 'Use secure, HttpOnly, SameSite cookies with proper session expiration', effectiveness: 0.80, effort: 'low', controlType: 'preventive', applicableCategories: ['spoofing', 'broken_auth'] },
    { title: 'Dependency Scanning', description: 'Continuously scan dependencies for known vulnerabilities using SCA tools', effectiveness: 0.75, effort: 'low', controlType: 'detective', applicableCategories: ['deserialization', 'injection'] },
    { title: 'Output Encoding', description: 'Encode all output data contextually (HTML, URL, JavaScript, CSS)', effectiveness: 0.90, effort: 'low', controlType: 'preventive', applicableCategories: ['xss'] },
    { title: 'CORS Policy Enforcement', description: 'Configure strict CORS policies to prevent unauthorized cross-origin requests', effectiveness: 0.75, effort: 'low', controlType: 'preventive', applicableCategories: ['broken_access', 'information_disclosure'] },
    { title: 'Secret Management', description: 'Use a vault or secret manager for all credentials, keys, and tokens', effectiveness: 0.90, effort: 'medium', controlType: 'preventive', applicableCategories: ['sensitive_data', 'misconfig'] },
    { title: 'Container Security Hardening', description: 'Run containers as non-root, drop capabilities, use read-only filesystems', effectiveness: 0.80, effort: 'medium', controlType: 'preventive', applicableCategories: ['elevation_of_privilege', 'misconfig'] },
    { title: 'Network Segmentation', description: 'Segment networks using VLANs and firewalls to limit lateral movement', effectiveness: 0.80, effort: 'high', controlType: 'preventive', applicableCategories: ['elevation_of_privilege', 'information_disclosure'] },
    { title: 'Security Headers', description: 'Set X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and HSTS headers', effectiveness: 0.70, effort: 'low', controlType: 'preventive', applicableCategories: ['xss', 'misconfig', 'information_disclosure'] },
    { title: 'Incident Response Plan', description: 'Maintain and rehearse an incident response plan with defined roles and procedures', effectiveness: 0.60, effort: 'high', controlType: 'corrective', applicableCategories: ['denial_of_service', 'information_disclosure', 'elevation_of_privilege'] },
    { title: 'Automated Vulnerability Scanning', description: 'Run DAST and SAST scans in CI/CD pipeline on every commit', effectiveness: 0.70, effort: 'medium', controlType: 'detective', applicableCategories: ['injection', 'xss', 'misconfig', 'deserialization'] },
    { title: 'XML Parser Hardening', description: 'Disable external entity processing and DTDs in XML parsers', effectiveness: 0.95, effort: 'low', controlType: 'preventive', applicableCategories: ['xxe'] },
    { title: 'SSRF Prevention', description: 'Validate and restrict outbound requests using allowlists for URLs and IPs', effectiveness: 0.85, effort: 'medium', controlType: 'preventive', applicableCategories: ['ssrf'] },
    { title: 'Deserialization Controls', description: 'Avoid native deserialization; use safe data formats like JSON with schema validation', effectiveness: 0.90, effort: 'medium', controlType: 'preventive', applicableCategories: ['deserialization'] },
    { title: 'API Gateway Authentication', description: 'Enforce authentication and authorization at the API gateway level', effectiveness: 0.85, effort: 'medium', controlType: 'preventive', applicableCategories: ['spoofing', 'broken_auth', 'broken_access'] },
    { title: 'Backup and Recovery', description: 'Maintain encrypted, tested backups with defined recovery time objectives', effectiveness: 0.70, effort: 'medium', controlType: 'corrective', applicableCategories: ['denial_of_service', 'tampering'] },
    { title: 'Security Awareness Training', description: 'Conduct regular security training for developers and operations staff', effectiveness: 0.55, effort: 'medium', controlType: 'deterrent', applicableCategories: ['spoofing', 'misconfig', 'insufficient_logging'] },
    { title: 'Code Review Process', description: 'Require peer review of all code changes with security-focused checklists', effectiveness: 0.75, effort: 'medium', controlType: 'detective', applicableCategories: ['injection', 'xss', 'broken_access', 'deserialization'] },
    { title: 'CAPTCHA Implementation', description: 'Deploy CAPTCHA on login and registration forms to prevent automated attacks', effectiveness: 0.65, effort: 'low', controlType: 'deterrent', applicableCategories: ['broken_auth', 'denial_of_service'] },
    { title: 'Zero Trust Architecture', description: 'Verify every request regardless of network location; never trust, always verify', effectiveness: 0.85, effort: 'high', controlType: 'preventive', applicableCategories: ['spoofing', 'broken_access', 'elevation_of_privilege', 'information_disclosure'] },
  ];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

function tokenSimilarity(textA: string, textB: string): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  if (tokensA.length === 0 && tokensB.length === 0) return 1;
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  let matches = 0;
  for (const ta of tokensA) {
    for (const tb of tokensB) {
      if (ta === tb) { matches++; break; }
      if (ta.length > 3 && tb.length > 3) {
        if (ta.includes(tb) || tb.includes(ta)) { matches += 0.5; break; }
      }
    }
  }
  return clamp(matches / Math.max(tokensA.length, tokensB.length), 0, 1);
}

function sensitivityToWeight(sensitivity: Asset['sensitivity']): number {
  switch (sensitivity) {
    case 'restricted': return 1.0;
    case 'confidential': return 0.75;
    case 'internal': return 0.5;
    case 'public': return 0.25;
  }
}

function riskLevelFromScore(score: number): Threat['riskLevel'] {
  if (score >= 0.8) return 'critical';
  if (score >= 0.6) return 'high';
  if (score >= 0.3) return 'medium';
  return 'low';
}

function categoryToStride(category: ThreatCategory): StrideCategory | undefined {
  const mapping: Partial<Record<ThreatCategory, StrideCategory>> = {
    spoofing: 'spoofing',
    tampering: 'tampering',
    repudiation: 'repudiation',
    information_disclosure: 'information_disclosure',
    denial_of_service: 'denial_of_service',
    elevation_of_privilege: 'elevation_of_privilege',
    broken_auth: 'spoofing',
    sensitive_data: 'information_disclosure',
    injection: 'tampering',
    xss: 'tampering',
    xxe: 'information_disclosure',
    broken_access: 'elevation_of_privilege',
    misconfig: 'information_disclosure',
    deserialization: 'tampering',
    insufficient_logging: 'repudiation',
    ssrf: 'information_disclosure',
  };
  return mapping[category];
}

function assetTypeToComponentType(type: Asset['type']): string {
  switch (type) {
    case 'service': return 'api_endpoint';
    case 'data': return 'database';
    case 'infrastructure': return 'file_storage';
    case 'user': return 'authentication_service';
    case 'process': return 'message_queue';
  }
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class ThreatModeler {
  private readonly config: ThreatModelerConfig;
  private threatModels: ThreatModel[] = [];
  private threatIntelDB: ThreatIntelEntry[];
  private readonly strideTemplates: StrideTemplate[];
  private readonly mitigationDB: MitigationTemplate[];
  private feedbackCount = 0;
  private readonly feedbackLog: Array<{
    modelId: string;
    threatId: string;
    isValid: boolean;
    notes: string;
  }> = [];

  constructor(config?: Partial<ThreatModelerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.threatIntelDB = buildThreatIntelDatabase();
    this.strideTemplates = buildStrideTemplates();
    this.mitigationDB = buildMitigationDatabase();
  }

  // ── Model Management ────────────────────────────────────────────────────

  /** Create a new threat model with the given name and optional description. */
  createModel(name: string, description?: string): ThreatModel {
    const model: ThreatModel = {
      id: generateId('TM'),
      name,
      description: description ?? '',
      timestamp: Date.now(),
      assets: [],
      threats: [],
      dataFlows: [],
      trustBoundaries: [],
      attackTrees: [],
      riskScore: 0,
    };
    this.threatModels.push(model);
    return model;
  }

  /** Retrieve a threat model by its ID. */
  getModel(id: string): ThreatModel | null {
    return this.threatModels.find(m => m.id === id) ?? null;
  }

  /** List all threat models with summary information. */
  listModels(): Array<{ id: string; name: string; timestamp: number; riskScore: number }> {
    return this.threatModels.map(m => ({
      id: m.id,
      name: m.name,
      timestamp: m.timestamp,
      riskScore: m.riskScore,
    }));
  }

  /** Delete a threat model by its ID. Returns true if found and removed. */
  deleteModel(id: string): boolean {
    const idx = this.threatModels.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.threatModels.splice(idx, 1);
    return true;
  }

  // ── Asset & Flow Management ─────────────────────────────────────────────

  /** Add an asset to the specified threat model. */
  addAsset(modelId: string, asset: Omit<Asset, 'id'>): Asset {
    const model = this.requireModel(modelId);
    const newAsset: Asset = { id: generateId('ASSET'), ...asset };
    model.assets.push(newAsset);
    return newAsset;
  }

  /** Add a data flow between components in the specified threat model. */
  addDataFlow(modelId: string, flow: Omit<DataFlow, 'id'>): DataFlow {
    const model = this.requireModel(modelId);
    const newFlow: DataFlow = { id: generateId('FLOW'), ...flow };
    model.dataFlows.push(newFlow);
    return newFlow;
  }

  /** Add a trust boundary to the specified threat model. */
  addTrustBoundary(modelId: string, boundary: Omit<TrustBoundary, 'id'>): TrustBoundary {
    const model = this.requireModel(modelId);
    const newBoundary: TrustBoundary = { id: generateId('TB'), ...boundary };
    model.trustBoundaries.push(newBoundary);
    return newBoundary;
  }

  // ── Threat Identification ───────────────────────────────────────────────

  /**
   * Automatically identify threats for all assets in the model using STRIDE
   * methodology combined with data flow analysis and trust boundary crossing.
   */
  identifyThreats(modelId: string): Threat[] {
    const model = this.requireModel(modelId);
    const identified: Threat[] = [];

    for (const asset of model.assets) {
      const relatedFlows = model.dataFlows.filter(
        f => f.source === asset.id || f.destination === asset.id,
      );

      const strideThreats = this.analyzeStride(asset, relatedFlows);
      for (const st of strideThreats) {
        if (identified.length >= this.config.maxThreats) break;

        const likelihood = this.estimateLikelihood(asset, relatedFlows, st.category);
        const impact = this.estimateImpact(asset, st.category);
        const riskScore = round2((likelihood + impact) / 2);

        const threat: Threat = {
          id: generateId('THREAT'),
          title: st.threat,
          description: st.description,
          category: st.category,
          targetAsset: asset.id,
          strideCategory: st.category,
          likelihood,
          impact,
          riskLevel: riskLevelFromScore(riskScore),
          mitigations: [],
          status: 'identified',
        };

        identified.push(threat);
      }

      // Additional threats from trust boundary crossings
      const boundaryThreats = this.identifyBoundaryThreats(model, asset);
      for (const bt of boundaryThreats) {
        if (identified.length >= this.config.maxThreats) break;
        identified.push(bt);
      }

      // Threats from unencrypted or unauthenticated data flows
      for (const flow of relatedFlows) {
        if (identified.length >= this.config.maxThreats) break;

        if (!flow.encrypted) {
          identified.push({
            id: generateId('THREAT'),
            title: 'Unencrypted Data in Transit',
            description: `Data flow "${flow.data}" between ${flow.source} and ${flow.destination} is not encrypted, exposing it to interception`,
            category: 'information_disclosure',
            targetAsset: asset.id,
            strideCategory: categoryToStride('information_disclosure'),
            likelihood: 0.7,
            impact: sensitivityToWeight(asset.sensitivity),
            riskLevel: riskLevelFromScore(0.7 * sensitivityToWeight(asset.sensitivity)),
            mitigations: [],
            status: 'identified',
          });
        }

        if (!flow.authentication) {
          identified.push({
            id: generateId('THREAT'),
            title: 'Unauthenticated Data Flow',
            description: `Data flow "${flow.data}" lacks authentication, allowing unauthorized access to ${asset.name}`,
            category: 'broken_auth',
            targetAsset: asset.id,
            strideCategory: categoryToStride('broken_auth'),
            likelihood: 0.6,
            impact: sensitivityToWeight(asset.sensitivity),
            riskLevel: riskLevelFromScore(0.6 * sensitivityToWeight(asset.sensitivity)),
            mitigations: [],
            status: 'identified',
          });
        }
      }
    }

    // Auto-apply mitigations if enabled
    if (this.config.enableAutoMitigation) {
      for (const threat of identified) {
        const suggestions = this.findApplicableMitigations(threat.category);
        if (suggestions.length > 0) {
          threat.mitigations.push({
            id: generateId('MIT'),
            title: suggestions[0].title,
            description: suggestions[0].description,
            effectiveness: suggestions[0].effectiveness,
            effort: suggestions[0].effort,
            status: 'proposed',
            controlType: suggestions[0].controlType,
          });
        }
      }
    }

    model.threats.push(...identified);
    this.recalculateModelRisk(model);

    return identified;
  }

  /**
   * Analyze an asset and its data flows using STRIDE methodology.
   * Returns potential threats organized by STRIDE category.
   */
  analyzeStride(
    asset: Asset,
    dataFlows: DataFlow[],
  ): Array<{ category: StrideCategory; threat: string; description: string }> {
    const results: Array<{ category: StrideCategory; threat: string; description: string }> = [];
    const componentType = assetTypeToComponentType(asset.type);

    const template = this.strideTemplates.find(t => t.componentType === componentType);
    if (template) {
      for (const t of template.threats) {
        results.push({
          category: t.category,
          threat: t.threat,
          description: `${t.description} — targeting ${asset.name}`,
        });
      }
    }

    // Flow-specific threats
    const hasUnencrypted = dataFlows.some(f => !f.encrypted);
    const hasUnauthenticated = dataFlows.some(f => !f.authentication);

    if (hasUnencrypted) {
      results.push({
        category: 'information_disclosure',
        threat: 'Data Interception',
        description: `Unencrypted data flows involving ${asset.name} are vulnerable to network sniffing`,
      });
    }

    if (hasUnauthenticated) {
      results.push({
        category: 'spoofing',
        threat: 'Unauthorized Data Access',
        description: `Unauthenticated data flows to/from ${asset.name} allow impersonation`,
      });
    }

    return results;
  }

  // ── DREAD Analysis ──────────────────────────────────────────────────────

  /** Calculate a DREAD score for a threat, optionally overriding individual components. */
  calculateDread(threat: Threat, params?: Partial<DreadScore>): DreadScore {
    const base = this.estimateBaseDread(threat);

    const damage = clamp(params?.damage ?? base.damage, 0, 10);
    const reproducibility = clamp(params?.reproducibility ?? base.reproducibility, 0, 10);
    const exploitability = clamp(params?.exploitability ?? base.exploitability, 0, 10);
    const affectedUsers = clamp(params?.affectedUsers ?? base.affectedUsers, 0, 10);
    const discoverability = clamp(params?.discoverability ?? base.discoverability, 0, 10);

    const total = round2((damage + reproducibility + exploitability + affectedUsers + discoverability) / 5);

    const score: DreadScore = {
      damage,
      reproducibility,
      exploitability,
      affectedUsers,
      discoverability,
      total,
    };

    threat.dreadScore = score;
    return score;
  }

  // ── Attack Trees ────────────────────────────────────────────────────────

  /** Build an attack tree for the given goal in the specified model. */
  buildAttackTree(modelId: string, goal: string, maxDepth?: number): AttackTree {
    const model = this.requireModel(modelId);
    const depth = clamp(maxDepth ?? 3, 1, 5);

    const rootNode = this.generateAttackNode(goal, model, depth, 0);

    const tree: AttackTree = {
      id: generateId('ATREE'),
      goal,
      rootNode,
    };

    model.attackTrees.push(tree);
    return tree;
  }

  // ── Mitigation Management ───────────────────────────────────────────────

  /** Add a mitigation to a specific threat in the model. */
  addMitigation(
    modelId: string,
    threatId: string,
    mitigation: Omit<Mitigation, 'id'>,
  ): Mitigation {
    const model = this.requireModel(modelId);
    const threat = model.threats.find(t => t.id === threatId);
    if (!threat) {
      throw new Error(`Threat not found: ${threatId}`);
    }

    const newMitigation: Mitigation = { id: generateId('MIT'), ...mitigation };
    threat.mitigations.push(newMitigation);

    if (newMitigation.status === 'implemented' || newMitigation.status === 'verified') {
      const maxEffectiveness = Math.max(...threat.mitigations.map(m => m.effectiveness));
      if (maxEffectiveness >= 0.7) {
        threat.status = 'mitigated';
      }
    }

    this.recalculateModelRisk(model);
    return newMitigation;
  }

  /** Suggest mitigations for a specific threat based on its category. */
  suggestMitigations(modelId: string, threatId: string): Mitigation[] {
    const model = this.requireModel(modelId);
    const threat = model.threats.find(t => t.id === threatId);
    if (!threat) {
      throw new Error(`Threat not found: ${threatId}`);
    }

    const applicable = this.findApplicableMitigations(threat.category);
    const existingTitles = new Set(threat.mitigations.map(m => m.title));

    return applicable
      .filter(m => !existingTitles.has(m.title))
      .slice(0, 5)
      .map(m => ({
        id: generateId('MIT'),
        title: m.title,
        description: m.description,
        effectiveness: m.effectiveness,
        effort: m.effort,
        status: 'proposed' as const,
        controlType: m.controlType,
      }));
  }

  /**
   * Calculate mitigation coverage for the entire model.
   * Returns total threats, mitigated count, coverage percentage, and gaps.
   */
  getMitigationCoverage(
    modelId: string,
  ): { total: number; mitigated: number; coverage: number; gaps: string[] } {
    const model = this.requireModel(modelId);

    const total = model.threats.length;
    const mitigated = model.threats.filter(
      t => t.status === 'mitigated' || t.mitigations.length > 0,
    ).length;
    const coverage = total > 0 ? round2(mitigated / total) : 0;

    const gaps: string[] = [];
    for (const threat of model.threats) {
      if (threat.mitigations.length === 0 && threat.status === 'identified') {
        gaps.push(`${threat.title} (${threat.riskLevel}) — no mitigations assigned`);
      }
    }

    return { total, mitigated, coverage, gaps };
  }

  // ── Risk Assessment ─────────────────────────────────────────────────────

  /**
   * Assess the overall risk of a threat model.
   * Returns risk scores by asset, by category, and identifies critical threats.
   */
  assessRisk(modelId: string): {
    overallRisk: number;
    byAsset: Record<string, number>;
    byCategory: Record<string, number>;
    criticalThreats: Threat[];
  } {
    const model = this.requireModel(modelId);

    const byAsset: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const criticalThreats: Threat[] = [];

    for (const threat of model.threats) {
      const rawRisk = (threat.likelihood + threat.impact) / 2;
      const mitigationFactor = this.calculateMitigationFactor(threat);
      const adjustedRisk = round2(rawRisk * (1 - mitigationFactor));

      // By asset
      const existing = byAsset[threat.targetAsset] ?? 0;
      byAsset[threat.targetAsset] = round2(Math.max(existing, adjustedRisk));

      // By category
      const catExisting = byCategory[threat.category] ?? 0;
      byCategory[threat.category] = round2(Math.max(catExisting, adjustedRisk));

      if (threat.riskLevel === 'critical' || adjustedRisk >= 0.8) {
        criticalThreats.push(threat);
      }
    }

    const riskValues = Object.values(byAsset);
    const overallRisk = riskValues.length > 0
      ? round2(riskValues.reduce((s, v) => s + v, 0) / riskValues.length)
      : 0;

    return { overallRisk, byAsset, byCategory, criticalThreats };
  }

  // ── Reporting ───────────────────────────────────────────────────────────

  /** Generate a threat model report in the specified format. */
  generateReport(modelId: string, format?: 'text' | 'json' | 'markdown'): string {
    const model = this.requireModel(modelId);
    const riskAssessment = this.assessRisk(modelId);
    const coverage = this.getMitigationCoverage(modelId);
    const fmt = format ?? 'text';

    if (fmt === 'json') {
      return JSON.stringify({
        model: {
          id: model.id,
          name: model.name,
          description: model.description,
          timestamp: model.timestamp,
          riskScore: model.riskScore,
        },
        assets: model.assets,
        threats: model.threats,
        dataFlows: model.dataFlows,
        trustBoundaries: model.trustBoundaries,
        attackTrees: model.attackTrees,
        riskAssessment,
        mitigationCoverage: coverage,
      }, null, 2);
    }

    if (fmt === 'markdown') {
      return this.generateMarkdownReport(model, riskAssessment, coverage);
    }

    return this.generateTextReport(model, riskAssessment, coverage);
  }

  // ── Threat Intelligence ─────────────────────────────────────────────────

  /** Query the threat intelligence database using a search term. */
  queryThreatIntel(query: string): ThreatIntelEntry[] {
    if (!this.config.enableThreatIntelligence) return [];

    return this.threatIntelDB.filter(entry => {
      const score = Math.max(
        tokenSimilarity(query, entry.threat),
        tokenSimilarity(query, entry.tactics.join(' ')),
        tokenSimilarity(query, entry.techniques.join(' ')),
        tokenSimilarity(query, entry.indicators.join(' ')),
      );
      return score > 0.2;
    });
  }

  /** Add a new entry to the threat intelligence database. */
  addThreatIntel(entry: Omit<ThreatIntelEntry, 'id'>): ThreatIntelEntry {
    const newEntry: ThreatIntelEntry = { id: generateId('INTEL'), ...entry };
    this.threatIntelDB.push(newEntry);
    return newEntry;
  }

  // ── Strategy Comparison ─────────────────────────────────────────────────

  /**
   * Compare mitigation strategies for the model.
   * Evaluates cost-effectiveness, risk reduction, and coverage for each approach.
   */
  compareMitigationStrategies(modelId: string): Array<{
    strategy: string;
    costEffectiveness: number;
    riskReduction: number;
    coverage: number;
  }> {
    const model = this.requireModel(modelId);
    if (model.threats.length === 0) return [];

    const strategies: Array<{
      strategy: string;
      costEffectiveness: number;
      riskReduction: number;
      coverage: number;
    }> = [];

    // Strategy 1: Preventive controls first
    const preventive = this.mitigationDB.filter(m => m.controlType === 'preventive');
    strategies.push(
      this.evaluateStrategy('Preventive Controls First', model, preventive),
    );

    // Strategy 2: High-effectiveness controls only
    const highEffect = this.mitigationDB.filter(m => m.effectiveness >= 0.8);
    strategies.push(
      this.evaluateStrategy('High-Effectiveness Controls', model, highEffect),
    );

    // Strategy 3: Low-effort quick wins
    const lowEffort = this.mitigationDB.filter(m => m.effort === 'low');
    strategies.push(
      this.evaluateStrategy('Low-Effort Quick Wins', model, lowEffort),
    );

    // Strategy 4: Defense in depth (all control types)
    const diverse = this.selectDiverseControls();
    strategies.push(
      this.evaluateStrategy('Defense in Depth', model, diverse),
    );

    // Strategy 5: Risk-prioritized
    const riskPrioritized = this.selectRiskPrioritized(model);
    strategies.push(
      this.evaluateStrategy('Risk-Prioritized', model, riskPrioritized),
    );

    return strategies.sort((a, b) => b.costEffectiveness - a.costEffectiveness);
  }

  // ── Feedback ────────────────────────────────────────────────────────────

  /** Record feedback on a specific threat's validity within a model. */
  provideFeedback(
    modelId: string,
    threatId: string,
    isValid: boolean,
    notes?: string,
  ): void {
    this.feedbackLog.push({
      modelId,
      threatId,
      isValid,
      notes: notes ?? '',
    });
    this.feedbackCount++;

    // If marked invalid, update threat status
    if (!isValid) {
      const model = this.threatModels.find(m => m.id === modelId);
      if (model) {
        const threat = model.threats.find(t => t.id === threatId);
        if (threat) {
          threat.status = 'accepted';
        }
      }
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────

  /** Return aggregated statistics for all threat modeling activity. */
  getStats(): Readonly<ThreatModelerStats> {
    const allThreats = this.threatModels.reduce((s, m) => s + m.threats.length, 0);
    const allMitigations = this.threatModels.reduce(
      (s, m) => s + m.threats.reduce((ts, t) => ts + t.mitigations.length, 0), 0,
    );
    const allAttackTrees = this.threatModels.reduce((s, m) => s + m.attackTrees.length, 0);

    const riskScores = this.threatModels.map(m => m.riskScore);
    const avgRisk = riskScores.length > 0
      ? riskScores.reduce((s, v) => s + v, 0) / riskScores.length
      : 0;

    return {
      totalModels: this.threatModels.length,
      totalThreats: allThreats,
      totalMitigations: allMitigations,
      totalAttackTrees: allAttackTrees,
      avgRiskScore: round2(avgRisk),
      feedbackCount: this.feedbackCount,
    };
  }

  // ── Serialization ─────────────────────────────────────────────────────

  /** Serialize the ThreatModeler state to a JSON string. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      threatModels: this.threatModels,
      threatIntelDB: this.threatIntelDB,
      feedbackCount: this.feedbackCount,
      feedbackLog: this.feedbackLog,
    });
  }

  /** Restore a ThreatModeler from serialized JSON. */
  static deserialize(json: string): ThreatModeler {
    const data = JSON.parse(json) as {
      config: ThreatModelerConfig;
      threatModels: ThreatModel[];
      threatIntelDB: ThreatIntelEntry[];
      feedbackCount: number;
      feedbackLog: Array<{
        modelId: string;
        threatId: string;
        isValid: boolean;
        notes: string;
      }>;
    };

    const instance = new ThreatModeler(data.config);
    instance.threatModels = data.threatModels;
    instance.threatIntelDB = data.threatIntelDB;
    instance.feedbackCount = data.feedbackCount;

    for (const entry of data.feedbackLog) {
      instance.feedbackLog.push(entry);
    }

    return instance;
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private requireModel(modelId: string): ThreatModel {
    const model = this.threatModels.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Threat model not found: ${modelId}`);
    }
    return model;
  }

  private recalculateModelRisk(model: ThreatModel): void {
    if (model.threats.length === 0) {
      model.riskScore = 0;
      return;
    }

    let totalRisk = 0;
    for (const threat of model.threats) {
      const rawRisk = (threat.likelihood + threat.impact) / 2;
      const mitigationFactor = this.calculateMitigationFactor(threat);
      totalRisk += rawRisk * (1 - mitigationFactor);
    }

    model.riskScore = round2(totalRisk / model.threats.length);
  }

  private calculateMitigationFactor(threat: Threat): number {
    if (threat.mitigations.length === 0) return 0;

    const activeM = threat.mitigations.filter(
      m => m.status === 'implemented' || m.status === 'verified',
    );
    if (activeM.length === 0) {
      // Proposed mitigations count at 25% effectiveness
      const proposedMax = Math.max(...threat.mitigations.map(m => m.effectiveness));
      return round2(proposedMax * 0.25);
    }

    // Compound effectiveness: 1 - product of (1 - each effectiveness)
    let remainingRisk = 1;
    for (const m of activeM) {
      remainingRisk *= (1 - m.effectiveness);
    }
    return round2(clamp(1 - remainingRisk, 0, 0.95));
  }

  private estimateLikelihood(
    asset: Asset,
    dataFlows: DataFlow[],
    category: StrideCategory,
  ): number {
    let base = 0.5;

    // Higher sensitivity assets are more attractive targets
    base += sensitivityToWeight(asset.sensitivity) * 0.15;

    // Unencrypted flows increase likelihood
    const unencryptedRatio = dataFlows.length > 0
      ? dataFlows.filter(f => !f.encrypted).length / dataFlows.length
      : 0;
    base += unencryptedRatio * 0.15;

    // Unauthenticated flows increase likelihood
    const unauthRatio = dataFlows.length > 0
      ? dataFlows.filter(f => !f.authentication).length / dataFlows.length
      : 0;
    base += unauthRatio * 0.1;

    // Category adjustments
    const categoryWeight: Record<StrideCategory, number> = {
      spoofing: 0.05,
      tampering: 0.03,
      repudiation: -0.05,
      information_disclosure: 0.08,
      denial_of_service: 0.06,
      elevation_of_privilege: -0.02,
    };
    base += categoryWeight[category];

    return round2(clamp(base, 0.1, 0.95));
  }

  private estimateImpact(asset: Asset, category: StrideCategory): number {
    let base = sensitivityToWeight(asset.sensitivity);

    // Category impact modifiers
    const impactWeight: Record<StrideCategory, number> = {
      spoofing: 0.1,
      tampering: 0.15,
      repudiation: 0.0,
      information_disclosure: 0.2,
      denial_of_service: 0.05,
      elevation_of_privilege: 0.25,
    };
    base += impactWeight[category];

    return round2(clamp(base, 0.1, 1.0));
  }

  private estimateBaseDread(threat: Threat): DreadScore {
    const impactScore = threat.impact * 10;
    const likelihoodScore = threat.likelihood * 10;

    const categoryDifficulty: Partial<Record<ThreatCategory, number>> = {
      injection: 6,
      xss: 7,
      broken_auth: 5,
      sensitive_data: 4,
      xxe: 5,
      broken_access: 6,
      misconfig: 8,
      deserialization: 4,
      insufficient_logging: 3,
      ssrf: 5,
      spoofing: 5,
      tampering: 5,
      repudiation: 3,
      information_disclosure: 6,
      denial_of_service: 7,
      elevation_of_privilege: 4,
    };

    const damage = round2(clamp(impactScore, 1, 10));
    const reproducibility = round2(clamp(likelihoodScore * 0.9, 1, 10));
    const exploitability = round2(clamp(categoryDifficulty[threat.category] ?? 5, 1, 10));
    const affectedUsers = round2(clamp(impactScore * 0.8, 1, 10));
    const discoverability = round2(clamp(likelihoodScore * 1.1, 1, 10));
    const total = round2((damage + reproducibility + exploitability + affectedUsers + discoverability) / 5);

    return { damage, reproducibility, exploitability, affectedUsers, discoverability, total };
  }

  private identifyBoundaryThreats(model: ThreatModel, asset: Asset): Threat[] {
    const threats: Threat[] = [];

    for (const boundary of model.trustBoundaries) {
      const insideSet = new Set(boundary.insideAssets);
      const outsideSet = new Set(boundary.outsideAssets);

      // Asset crosses a boundary — flows from outside to inside
      const crossingFlows = model.dataFlows.filter(f => {
        const srcOutside = outsideSet.has(f.source);
        const destInside = insideSet.has(f.destination);
        return (srcOutside && destInside && f.destination === asset.id)
          || (insideSet.has(f.source) && outsideSet.has(f.destination) && f.source === asset.id);
      });

      for (const flow of crossingFlows) {
        threats.push({
          id: generateId('THREAT'),
          title: `Trust Boundary Crossing: ${boundary.name}`,
          description: `Data flow "${flow.data}" crosses trust boundary "${boundary.name}" — additional validation and authentication required`,
          category: 'elevation_of_privilege',
          targetAsset: asset.id,
          strideCategory: 'elevation_of_privilege',
          likelihood: 0.6,
          impact: 0.7,
          riskLevel: 'high',
          mitigations: [],
          status: 'identified',
        });
      }
    }

    return threats;
  }

  private findApplicableMitigations(category: ThreatCategory): MitigationTemplate[] {
    return this.mitigationDB
      .filter(m => m.applicableCategories.includes(category))
      .sort((a, b) => b.effectiveness - a.effectiveness);
  }

  private generateAttackNode(
    description: string,
    model: ThreatModel,
    maxDepth: number,
    currentDepth: number,
  ): AttackNode {
    if (currentDepth >= maxDepth) {
      return {
        id: generateId('ANODE'),
        description,
        type: 'leaf',
        cost: this.estimateAttackCost(description),
        probability: this.estimateAttackProbability(description),
        difficulty: this.estimateAttackDifficulty(description),
      };
    }

    const children = this.generateChildNodes(description, model, maxDepth, currentDepth);

    return {
      id: generateId('ANODE'),
      description,
      type: children.length > 1 ? 'or' : 'and',
      cost: this.estimateAttackCost(description),
      probability: this.estimateAttackProbability(description),
      difficulty: this.estimateAttackDifficulty(description),
      children,
    };
  }

  private generateChildNodes(
    parentGoal: string,
    model: ThreatModel,
    maxDepth: number,
    currentDepth: number,
  ): AttackNode[] {
    const children: AttackNode[] = [];
    const goalLower = parentGoal.toLowerCase();

    // Generate sub-goals based on common attack decompositions
    const subGoals = this.decomposeGoal(goalLower, model);

    for (const subGoal of subGoals.slice(0, 3)) {
      children.push(
        this.generateAttackNode(subGoal, model, maxDepth, currentDepth + 1),
      );
    }

    if (children.length === 0) {
      children.push({
        id: generateId('ANODE'),
        description: `Exploit vulnerability related to: ${parentGoal}`,
        type: 'leaf',
        cost: 5,
        probability: 0.3,
        difficulty: 'medium',
      });
    }

    return children;
  }

  private decomposeGoal(goal: string, model: ThreatModel): string[] {
    const subGoals: string[] = [];

    if (goal.includes('data') || goal.includes('exfiltrat') || goal.includes('steal')) {
      subGoals.push('Gain initial access via phishing or credential theft');
      subGoals.push('Exploit application vulnerability to access data store');
      subGoals.push('Intercept unencrypted data in transit');
    } else if (goal.includes('denial') || goal.includes('disrupt') || goal.includes('dos')) {
      subGoals.push('Volumetric network flood attack');
      subGoals.push('Application-layer resource exhaustion');
      subGoals.push('Exploit service dependency to cause cascading failure');
    } else if (goal.includes('privilege') || goal.includes('escalat') || goal.includes('admin')) {
      subGoals.push('Exploit IDOR or broken access control');
      subGoals.push('Compromise admin credentials via credential stuffing');
      subGoals.push('Exploit misconfigured role assignments');
    } else if (goal.includes('inject') || goal.includes('execute') || goal.includes('rce')) {
      subGoals.push('Find unvalidated input field');
      subGoals.push('Exploit deserialization vulnerability');
      subGoals.push('Leverage command injection in server-side processing');
    } else {
      // Generic decomposition based on model assets
      for (const asset of model.assets.slice(0, 3)) {
        subGoals.push(`Compromise ${asset.name} (${asset.type})`);
      }
      if (subGoals.length === 0) {
        subGoals.push('Perform reconnaissance on target');
        subGoals.push('Identify and exploit entry point');
        subGoals.push('Establish persistence');
      }
    }

    return subGoals;
  }

  private estimateAttackCost(description: string): number {
    const lower = description.toLowerCase();
    if (lower.includes('phishing') || lower.includes('social')) return 2;
    if (lower.includes('exploit') || lower.includes('vulnerability')) return 5;
    if (lower.includes('zero-day') || lower.includes('advanced')) return 9;
    if (lower.includes('brute') || lower.includes('credential')) return 3;
    if (lower.includes('flood') || lower.includes('volumetric')) return 4;
    return 5;
  }

  private estimateAttackProbability(description: string): number {
    const lower = description.toLowerCase();
    if (lower.includes('phishing')) return 0.7;
    if (lower.includes('credential') || lower.includes('password')) return 0.6;
    if (lower.includes('unencrypted') || lower.includes('misconfig')) return 0.8;
    if (lower.includes('zero-day')) return 0.1;
    if (lower.includes('exploit')) return 0.4;
    return 0.3;
  }

  private estimateAttackDifficulty(description: string): AttackNode['difficulty'] {
    const lower = description.toLowerCase();
    if (lower.includes('phishing') || lower.includes('misconfig')) return 'low';
    if (lower.includes('credential') || lower.includes('brute')) return 'medium';
    if (lower.includes('exploit') || lower.includes('injection')) return 'high';
    if (lower.includes('zero-day') || lower.includes('advanced')) return 'expert';
    return 'medium';
  }

  private evaluateStrategy(
    name: string,
    model: ThreatModel,
    controls: MitigationTemplate[],
  ): {
    strategy: string;
    costEffectiveness: number;
    riskReduction: number;
    coverage: number;
  } {
    if (controls.length === 0 || model.threats.length === 0) {
      return { strategy: name, costEffectiveness: 0, riskReduction: 0, coverage: 0 };
    }

    const threatCategories = new Set(model.threats.map(t => t.category));
    let coveredCount = 0;
    let totalEffectiveness = 0;
    let totalEffort = 0;

    for (const cat of threatCategories) {
      const applicable = controls.filter(c => c.applicableCategories.includes(cat));
      if (applicable.length > 0) {
        coveredCount++;
        totalEffectiveness += Math.max(...applicable.map(a => a.effectiveness));
      }
    }

    for (const control of controls) {
      const effortValue = control.effort === 'low' ? 1 : control.effort === 'medium' ? 2 : 3;
      totalEffort += effortValue;
    }

    const coverage = round2(coveredCount / threatCategories.size);
    const avgEffectiveness = coveredCount > 0 ? totalEffectiveness / coveredCount : 0;
    const avgEffort = controls.length > 0 ? totalEffort / controls.length : 1;
    const riskReduction = round2(avgEffectiveness * coverage);
    const costEffectiveness = round2(riskReduction / avgEffort);

    return { strategy: name, costEffectiveness, riskReduction, coverage };
  }

  private selectDiverseControls(): MitigationTemplate[] {
    const result: MitigationTemplate[] = [];
    const types: Array<Mitigation['controlType']> = ['preventive', 'detective', 'corrective', 'deterrent'];

    for (const type of types) {
      const candidates = this.mitigationDB.filter(m => m.controlType === type);
      const sorted = [...candidates].sort((a, b) => b.effectiveness - a.effectiveness);
      if (sorted.length > 0) {
        result.push(sorted[0]);
        if (sorted.length > 1) result.push(sorted[1]);
      }
    }

    return result;
  }

  private selectRiskPrioritized(model: ThreatModel): MitigationTemplate[] {
    // Identify the most common threat categories and pick mitigations accordingly
    const categoryCounts: Record<string, number> = {};
    for (const threat of model.threats) {
      categoryCounts[threat.category] = (categoryCounts[threat.category] ?? 0) + 1;
    }

    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0] as ThreatCategory);

    const selected: MitigationTemplate[] = [];
    const selectedTitles = new Set<string>();

    for (const cat of sortedCategories) {
      const applicable = this.mitigationDB
        .filter(m => m.applicableCategories.includes(cat) && !selectedTitles.has(m.title))
        .sort((a, b) => b.effectiveness - a.effectiveness);

      if (applicable.length > 0) {
        selected.push(applicable[0]);
        selectedTitles.add(applicable[0].title);
      }
    }

    return selected;
  }

  private generateTextReport(
    model: ThreatModel,
    riskAssessment: ReturnType<ThreatModeler['assessRisk']>,
    coverage: ReturnType<ThreatModeler['getMitigationCoverage']>,
  ): string {
    const lines: string[] = [];

    lines.push('════════════════════════════════════════════════════════');
    lines.push(`  THREAT MODEL REPORT: ${model.name}`);
    lines.push('════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`  ID:          ${model.id}`);
    lines.push(`  Created:     ${new Date(model.timestamp).toISOString()}`);
    lines.push(`  Description: ${model.description || 'N/A'}`);
    lines.push(`  Risk Score:  ${model.riskScore}`);
    lines.push('');

    lines.push('── Assets ─────────────────────────────────────────────');
    for (const asset of model.assets) {
      lines.push(`  [${asset.id}] ${asset.name} (${asset.type}, ${asset.sensitivity})`);
      lines.push(`    ${asset.description}`);
    }
    lines.push('');

    lines.push('── Data Flows ─────────────────────────────────────────');
    for (const flow of model.dataFlows) {
      const enc = flow.encrypted ? '🔒' : '⚠️';
      const auth = flow.authentication ? '✓' : '✗';
      lines.push(`  ${flow.source} → ${flow.destination}: ${flow.data} ${enc} Auth:${auth}`);
    }
    lines.push('');

    lines.push('── Threats ────────────────────────────────────────────');
    for (const threat of model.threats) {
      lines.push(`  [${threat.riskLevel.toUpperCase()}] ${threat.title}`);
      lines.push(`    Category: ${threat.category} | Status: ${threat.status}`);
      lines.push(`    Likelihood: ${threat.likelihood} | Impact: ${threat.impact}`);
      if (threat.mitigations.length > 0) {
        lines.push(`    Mitigations: ${threat.mitigations.map(m => m.title).join(', ')}`);
      }
    }
    lines.push('');

    lines.push('── Risk Assessment ────────────────────────────────────');
    lines.push(`  Overall Risk: ${riskAssessment.overallRisk}`);
    lines.push(`  Critical Threats: ${riskAssessment.criticalThreats.length}`);
    lines.push(`  Mitigation Coverage: ${(coverage.coverage * 100).toFixed(1)}%`);
    if (coverage.gaps.length > 0) {
      lines.push('  Gaps:');
      for (const gap of coverage.gaps) {
        lines.push(`    - ${gap}`);
      }
    }
    lines.push('');
    lines.push('════════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  private generateMarkdownReport(
    model: ThreatModel,
    riskAssessment: ReturnType<ThreatModeler['assessRisk']>,
    coverage: ReturnType<ThreatModeler['getMitigationCoverage']>,
  ): string {
    const lines: string[] = [];

    lines.push(`# Threat Model Report: ${model.name}`);
    lines.push('');
    lines.push(`**ID:** ${model.id}`);
    lines.push(`**Created:** ${new Date(model.timestamp).toISOString()}`);
    lines.push(`**Description:** ${model.description || 'N/A'}`);
    lines.push(`**Risk Score:** ${model.riskScore}`);
    lines.push('');

    lines.push('## Assets');
    lines.push('');
    lines.push('| ID | Name | Type | Sensitivity | Description |');
    lines.push('|----|------|------|-------------|-------------|');
    for (const asset of model.assets) {
      lines.push(`| ${asset.id} | ${asset.name} | ${asset.type} | ${asset.sensitivity} | ${asset.description} |`);
    }
    lines.push('');

    lines.push('## Data Flows');
    lines.push('');
    lines.push('| Source | Destination | Data | Encrypted | Authenticated |');
    lines.push('|--------|-------------|------|-----------|---------------|');
    for (const flow of model.dataFlows) {
      lines.push(`| ${flow.source} | ${flow.destination} | ${flow.data} | ${flow.encrypted ? 'Yes' : 'No'} | ${flow.authentication ? 'Yes' : 'No'} |`);
    }
    lines.push('');

    lines.push('## Threats');
    lines.push('');
    for (const threat of model.threats) {
      const badge = threat.riskLevel === 'critical' ? '🔴'
        : threat.riskLevel === 'high' ? '🟠'
          : threat.riskLevel === 'medium' ? '🟡' : '🟢';
      lines.push(`### ${badge} ${threat.title}`);
      lines.push('');
      lines.push(`- **Category:** ${threat.category}`);
      lines.push(`- **Risk Level:** ${threat.riskLevel}`);
      lines.push(`- **Likelihood:** ${threat.likelihood} | **Impact:** ${threat.impact}`);
      lines.push(`- **Status:** ${threat.status}`);
      lines.push(`- **Description:** ${threat.description}`);
      if (threat.mitigations.length > 0) {
        lines.push('- **Mitigations:**');
        for (const m of threat.mitigations) {
          lines.push(`  - ${m.title} (${m.controlType}, effectiveness: ${m.effectiveness})`);
        }
      }
      lines.push('');
    }

    if (model.attackTrees.length > 0) {
      lines.push('## Attack Trees');
      lines.push('');
      for (const tree of model.attackTrees) {
        lines.push(`### Goal: ${tree.goal}`);
        lines.push('');
        lines.push('```');
        this.renderAttackTreeText(tree.rootNode, lines, 0);
        lines.push('```');
        lines.push('');
      }
    }

    lines.push('## Risk Assessment');
    lines.push('');
    lines.push(`- **Overall Risk:** ${riskAssessment.overallRisk}`);
    lines.push(`- **Critical Threats:** ${riskAssessment.criticalThreats.length}`);
    lines.push(`- **Mitigation Coverage:** ${(coverage.coverage * 100).toFixed(1)}%`);
    lines.push('');

    if (coverage.gaps.length > 0) {
      lines.push('### Coverage Gaps');
      lines.push('');
      for (const gap of coverage.gaps) {
        lines.push(`- ${gap}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push(`*Generated by ThreatModeler on ${new Date().toISOString()}*`);

    return lines.join('\n');
  }

  private renderAttackTreeText(
    node: AttackNode,
    lines: string[],
    indent: number,
  ): void {
    const prefix = '  '.repeat(indent);
    const typeLabel = node.type === 'leaf' ? '[LEAF]'
      : node.type === 'and' ? '[AND]' : '[OR]';
    const diffLabel = node.difficulty ? ` (${node.difficulty})` : '';
    const probLabel = node.probability !== undefined ? ` P=${node.probability}` : '';

    lines.push(`${prefix}${typeLabel} ${node.description}${diffLabel}${probLabel}`);

    if (node.children) {
      for (const child of node.children) {
        this.renderAttackTreeText(child, lines, indent + 1);
      }
    }
  }
}
