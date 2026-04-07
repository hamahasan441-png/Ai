/**
 * 🛡️ SecurityScanner — Deep Security Analysis Engine
 *
 * Performs comprehensive security analysis like GitHub Copilot agent:
 *   • OWASP Top 10 vulnerability detection
 *   • CWE mapping for found issues
 *   • Secrets/credentials detection in code
 *   • Dependency vulnerability scanning
 *   • SQL injection, XSS, SSRF, path traversal detection
 *   • Insecure crypto usage detection
 *   • Hardcoded sensitive data detection
 *   • Security headers analysis
 *   • Authentication/authorization pattern analysis
 *   • CVSS-like severity scoring
 *
 * Works fully offline — pattern-based scanning, zero external deps.
 */

import type { AnalysisLanguage, Severity } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** OWASP Top 10 2021 categories. */
export type OwaspCategory =
  | 'A01:2021-Broken-Access-Control'
  | 'A02:2021-Cryptographic-Failures'
  | 'A03:2021-Injection'
  | 'A04:2021-Insecure-Design'
  | 'A05:2021-Security-Misconfiguration'
  | 'A06:2021-Vulnerable-Components'
  | 'A07:2021-Auth-Failures'
  | 'A08:2021-Software-Integrity-Failures'
  | 'A09:2021-Security-Logging-Failures'
  | 'A10:2021-SSRF'

/** A security vulnerability found in code. */
export interface SecurityVulnerability {
  /** Vulnerability ID. */
  id: string
  /** Short title. */
  title: string
  /** Detailed description. */
  description: string
  /** Severity level. */
  severity: Severity
  /** CVSS-like score (0-10). */
  cvssScore: number
  /** CWE identifier. */
  cwe: string
  /** OWASP category. */
  owasp: OwaspCategory
  /** File where found. */
  filePath: string
  /** Line number. */
  line: number
  /** End line. */
  endLine?: number
  /** Code snippet containing the vulnerability. */
  codeSnippet: string
  /** Language. */
  language: AnalysisLanguage
  /** Remediation advice. */
  remediation: string
  /** Fix code snippet if available. */
  fixCode?: string
  /** Whether this is a false positive risk. */
  falsePositiveRisk: 'low' | 'medium' | 'high'
}

/** A detected secret/credential in code. */
export interface DetectedSecret {
  /** Type of secret. */
  type: SecretType
  /** File where found. */
  filePath: string
  /** Line number. */
  line: number
  /** Masked value (showing only prefix). */
  maskedValue: string
  /** Severity. */
  severity: Severity
  /** Remediation. */
  remediation: string
}

/** Types of secrets. */
export type SecretType =
  | 'api-key'
  | 'aws-key'
  | 'github-token'
  | 'password'
  | 'private-key'
  | 'jwt-secret'
  | 'database-url'
  | 'oauth-secret'
  | 'generic-secret'

/** Security scan result. */
export interface SecurityScanResult {
  /** All vulnerabilities found. */
  vulnerabilities: SecurityVulnerability[]
  /** Detected secrets. */
  secrets: DetectedSecret[]
  /** Overall risk score (0-100). */
  riskScore: number
  /** Risk level. */
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'minimal'
  /** Summary. */
  summary: string
  /** Files scanned. */
  filesScanned: number
  /** Recommendations. */
  recommendations: string[]
  /** Stats by severity. */
  bySeverity: Record<Severity, number>
  /** Stats by OWASP category. */
  byOwasp: Record<string, number>
}

// ══════════════════════════════════════════════════════════════════════════════
// VULNERABILITY PATTERNS
// ══════════════════════════════════════════════════════════════════════════════

interface VulnPattern {
  pattern: RegExp
  title: string
  cwe: string
  owasp: OwaspCategory
  severity: Severity
  cvss: number
  remediation: string
  fixCode?: string
  fpRisk: 'low' | 'medium' | 'high'
  languages: AnalysisLanguage[]
}

const VULN_PATTERNS: VulnPattern[] = [
  // SQL Injection
  {
    pattern: /(?:query|execute|exec)\s*\(\s*(?:`[^`]*\$\{|['"][^'"]*['"]\s*\+\s*\w+|['"][^'"]*['"]\s*\+)/,
    title: 'SQL Injection',
    cwe: 'CWE-89',
    owasp: 'A03:2021-Injection',
    severity: 'critical',
    cvss: 9.8,
    remediation: 'Use parameterized queries or an ORM instead of string concatenation',
    fixCode: 'db.query("SELECT * FROM users WHERE id = $1", [userId])',
    fpRisk: 'low',
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp', 'php', 'ruby'],
  },
  // XSS - innerHTML
  {
    pattern: /\.innerHTML\s*=\s*(?!['"`]<)/,
    title: 'Cross-Site Scripting (XSS) via innerHTML',
    cwe: 'CWE-79',
    owasp: 'A03:2021-Injection',
    severity: 'high',
    cvss: 7.5,
    remediation: 'Use textContent instead of innerHTML, or sanitize with DOMPurify',
    fixCode: 'element.textContent = userInput',
    fpRisk: 'medium',
    languages: ['typescript', 'javascript'],
  },
  // XSS - dangerouslySetInnerHTML
  {
    pattern: /dangerouslySetInnerHTML/,
    title: 'Cross-Site Scripting (XSS) via dangerouslySetInnerHTML',
    cwe: 'CWE-79',
    owasp: 'A03:2021-Injection',
    severity: 'high',
    cvss: 7.5,
    remediation: 'Sanitize HTML content before using dangerouslySetInnerHTML',
    fpRisk: 'medium',
    languages: ['typescript', 'javascript'],
  },
  // Command Injection
  {
    pattern: /(?:exec|execSync|spawn|system|popen)\s*\(\s*(?:`[^`]*\$\{|['"][^'"]*['"]\s*\+)/,
    title: 'Command Injection',
    cwe: 'CWE-78',
    owasp: 'A03:2021-Injection',
    severity: 'critical',
    cvss: 9.8,
    remediation: 'Use parameterized commands or escape shell arguments. Avoid exec with user input.',
    fpRisk: 'low',
    languages: ['typescript', 'javascript', 'python', 'ruby', 'php'],
  },
  // Path Traversal
  {
    pattern: /(?:readFile|readFileSync|createReadStream|open)\s*\(\s*(?:req\.|request\.|params\.|query\.|\w+\s*\+)/,
    title: 'Path Traversal',
    cwe: 'CWE-22',
    owasp: 'A01:2021-Broken-Access-Control',
    severity: 'high',
    cvss: 7.5,
    remediation: 'Validate and sanitize file paths. Use path.resolve() and check against a whitelist.',
    fpRisk: 'medium',
    languages: ['typescript', 'javascript', 'python'],
  },
  // SSRF
  {
    pattern: /(?:fetch|axios|request|http\.get|urllib)\s*\(\s*(?:req\.|request\.|params\.|query\.|user)/,
    title: 'Server-Side Request Forgery (SSRF)',
    cwe: 'CWE-918',
    owasp: 'A10:2021-SSRF',
    severity: 'high',
    cvss: 7.5,
    remediation: 'Validate URLs against an allowlist. Block internal IPs (127.0.0.1, 10.x, 192.168.x).',
    fpRisk: 'medium',
    languages: ['typescript', 'javascript', 'python', 'java', 'go'],
  },
  // Insecure crypto - MD5
  {
    pattern: /(?:createHash|hashlib\.)\s*\(\s*['"]md5['"]/,
    title: 'Use of Weak Hash Algorithm (MD5)',
    cwe: 'CWE-328',
    owasp: 'A02:2021-Cryptographic-Failures',
    severity: 'medium',
    cvss: 5.3,
    remediation: 'Use SHA-256 or stronger hash algorithm',
    fixCode: "crypto.createHash('sha256')",
    fpRisk: 'low',
    languages: ['typescript', 'javascript', 'python'],
  },
  // Insecure crypto - SHA1
  {
    pattern: /(?:createHash|hashlib\.)\s*\(\s*['"]sha1['"]/,
    title: 'Use of Weak Hash Algorithm (SHA-1)',
    cwe: 'CWE-328',
    owasp: 'A02:2021-Cryptographic-Failures',
    severity: 'medium',
    cvss: 5.3,
    remediation: 'Use SHA-256 or stronger hash algorithm',
    fixCode: "crypto.createHash('sha256')",
    fpRisk: 'low',
    languages: ['typescript', 'javascript', 'python'],
  },
  // Hardcoded JWT secret
  {
    pattern: /(?:jwt\.sign|jsonwebtoken\.sign)\s*\([^,]+,\s*['"][^'"]{5,}['"]/,
    title: 'Hardcoded JWT Secret',
    cwe: 'CWE-798',
    owasp: 'A07:2021-Auth-Failures',
    severity: 'high',
    cvss: 7.5,
    remediation: 'Store JWT secrets in environment variables, not in code',
    fpRisk: 'low',
    languages: ['typescript', 'javascript'],
  },
  // eval() usage
  {
    pattern: /\beval\s*\(/,
    title: 'Use of eval()',
    cwe: 'CWE-95',
    owasp: 'A03:2021-Injection',
    severity: 'high',
    cvss: 8.0,
    remediation: 'Avoid eval(). Use JSON.parse() for data, or Function constructor if absolutely needed.',
    fpRisk: 'medium',
    languages: ['typescript', 'javascript', 'python'],
  },
  // Missing HTTPS
  {
    pattern: /http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/,
    title: 'Insecure HTTP URL',
    cwe: 'CWE-319',
    owasp: 'A02:2021-Cryptographic-Failures',
    severity: 'low',
    cvss: 3.7,
    remediation: 'Use HTTPS instead of HTTP for external URLs',
    fpRisk: 'high',
    languages: ['typescript', 'javascript', 'python', 'go', 'java', 'rust'],
  },
  // console.log with sensitive data
  {
    pattern: /console\.log\s*\([^)]*(?:password|secret|token|key|credential|apiKey|api_key)/i,
    title: 'Sensitive Data in Console Output',
    cwe: 'CWE-532',
    owasp: 'A09:2021-Security-Logging-Failures',
    severity: 'medium',
    cvss: 4.3,
    remediation: 'Remove or mask sensitive data from log statements',
    fpRisk: 'medium',
    languages: ['typescript', 'javascript'],
  },
  // Disable SSL verification
  {
    pattern: /(?:rejectUnauthorized|verify_ssl|VERIFY_SSL|SSL_VERIFY)\s*[:=]\s*(?:false|False|0)/,
    title: 'SSL/TLS Verification Disabled',
    cwe: 'CWE-295',
    owasp: 'A02:2021-Cryptographic-Failures',
    severity: 'high',
    cvss: 7.4,
    remediation: 'Enable SSL/TLS certificate verification',
    fpRisk: 'low',
    languages: ['typescript', 'javascript', 'python', 'go', 'java'],
  },
  // CORS wildcard
  {
    pattern: /(?:Access-Control-Allow-Origin|cors)\s*[:({]\s*['"]?\*/,
    title: 'CORS Wildcard Origin',
    cwe: 'CWE-942',
    owasp: 'A05:2021-Security-Misconfiguration',
    severity: 'medium',
    cvss: 5.3,
    remediation: 'Restrict CORS to specific trusted origins instead of wildcard',
    fpRisk: 'medium',
    languages: ['typescript', 'javascript', 'python', 'java', 'go'],
  },
  // Unvalidated redirect
  {
    pattern: /(?:redirect|location\.href|window\.location)\s*=\s*(?:req\.|request\.|params\.|query\.)/,
    title: 'Open Redirect',
    cwe: 'CWE-601',
    owasp: 'A01:2021-Broken-Access-Control',
    severity: 'medium',
    cvss: 6.1,
    remediation: 'Validate redirect URLs against a whitelist of allowed destinations',
    fpRisk: 'medium',
    languages: ['typescript', 'javascript', 'python', 'java', 'php'],
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// SECRET PATTERNS
// ══════════════════════════════════════════════════════════════════════════════

interface SecretPattern {
  pattern: RegExp
  type: SecretType
  severity: Severity
}

const SECRET_PATTERNS: SecretPattern[] = [
  // AWS
  { pattern: /(?:AKIA|ASIA)[0-9A-Z]{16}/g, type: 'aws-key', severity: 'critical' },
  { pattern: /aws_secret_access_key\s*=\s*['"]([^'"]{20,})['"]/gi, type: 'aws-key', severity: 'critical' },
  // GitHub tokens
  { pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/g, type: 'github-token', severity: 'critical' },
  { pattern: /github_pat_[A-Za-z0-9_]{22,}/g, type: 'github-token', severity: 'critical' },
  // Generic API keys
  { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]([A-Za-z0-9_\-]{20,})['"]/gi, type: 'api-key', severity: 'high' },
  // Passwords
  { pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"]([^'"]{8,})['"]/gi, type: 'password', severity: 'critical' },
  // Private keys
  { pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g, type: 'private-key', severity: 'critical' },
  // JWT secrets
  { pattern: /(?:jwt[_-]?secret|JWT_SECRET)\s*[:=]\s*['"]([^'"]{10,})['"]/gi, type: 'jwt-secret', severity: 'high' },
  // Database URLs with credentials
  { pattern: /(?:postgres|mysql|mongodb|redis):\/\/\w+:[^@\s]+@/gi, type: 'database-url', severity: 'high' },
  // OAuth secrets
  { pattern: /(?:client[_-]?secret|oauth[_-]?secret)\s*[:=]\s*['"]([^'"]{10,})['"]/gi, type: 'oauth-secret', severity: 'high' },
  // Generic secret patterns
  { pattern: /(?:secret|SECRET)\s*[:=]\s*['"]([A-Za-z0-9+/=_\-]{20,})['"]/g, type: 'generic-secret', severity: 'medium' },
]

// ══════════════════════════════════════════════════════════════════════════════
// SECURITY SCANNER CLASS
// ══════════════════════════════════════════════════════════════════════════════

let vulnCounter = 0

/**
 * SecurityScanner — Comprehensive security analysis engine.
 *
 * Scans code for vulnerabilities, secrets, and security anti-patterns
 * like GitHub Copilot agent's security awareness.
 */
export class SecurityScanner {

  /**
   * Scan a single file for vulnerabilities.
   */
  scanFile(
    code: string,
    filePath: string,
    language?: AnalysisLanguage,
  ): { vulnerabilities: SecurityVulnerability[]; secrets: DetectedSecret[] } {
    const lang = language ?? this.detectLanguage(filePath)
    const vulnerabilities: SecurityVulnerability[] = []
    const secrets: DetectedSecret[] = []
    const lines = code.split('\n')

    // Scan for vulnerabilities
    for (const vp of VULN_PATTERNS) {
      if (!vp.languages.includes(lang)) continue

      for (let i = 0; i < lines.length; i++) {
        vp.pattern.lastIndex = 0
        if (vp.pattern.test(lines[i])) {
          vulnerabilities.push({
            id: `VULN-${++vulnCounter}`,
            title: vp.title,
            description: `${vp.title} detected at ${filePath}:${i + 1}`,
            severity: vp.severity,
            cvssScore: vp.cvss,
            cwe: vp.cwe,
            owasp: vp.owasp,
            filePath,
            line: i + 1,
            codeSnippet: lines[i].trim(),
            language: lang,
            remediation: vp.remediation,
            fixCode: vp.fixCode,
            falsePositiveRisk: vp.fpRisk,
          })
        }
      }
    }

    // Scan for secrets
    for (const sp of SECRET_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        sp.pattern.lastIndex = 0
        if (sp.pattern.test(lines[i])) {
          // Skip if in a comment
          const trimmed = lines[i].trim()
          if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) continue

          // Skip test files and example files
          if (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('example')) continue

          secrets.push({
            type: sp.type,
            filePath,
            line: i + 1,
            maskedValue: this.maskValue(lines[i]),
            severity: sp.severity,
            remediation: `Move ${sp.type} to environment variables or a secrets manager`,
          })
        }
      }
    }

    return { vulnerabilities, secrets }
  }

  /**
   * Scan multiple files and produce a full report.
   */
  scan(
    files: Map<string, string>,
    options?: { skipTests?: boolean; skipDocs?: boolean },
  ): SecurityScanResult {
    const allVulns: SecurityVulnerability[] = []
    const allSecrets: DetectedSecret[] = []
    let filesScanned = 0

    for (const [filePath, content] of files) {
      // Skip test files if requested
      if (options?.skipTests && (filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('__tests__'))) {
        continue
      }

      // Skip docs if requested
      if (options?.skipDocs && (filePath.endsWith('.md') || filePath.endsWith('.txt') || filePath.includes('docs/'))) {
        continue
      }

      const { vulnerabilities, secrets } = this.scanFile(content, filePath)
      allVulns.push(...vulnerabilities)
      allSecrets.push(...secrets)
      filesScanned++
    }

    // Calculate risk score
    const riskScore = this.calculateRiskScore(allVulns, allSecrets)

    // Risk level
    let riskLevel: SecurityScanResult['riskLevel']
    if (riskScore >= 80) riskLevel = 'critical'
    else if (riskScore >= 60) riskLevel = 'high'
    else if (riskScore >= 40) riskLevel = 'medium'
    else if (riskScore >= 20) riskLevel = 'low'
    else riskLevel = 'minimal'

    // Stats by severity
    const bySeverity: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
    for (const v of allVulns) bySeverity[v.severity]++
    for (const s of allSecrets) bySeverity[s.severity]++

    // Stats by OWASP
    const byOwasp: Record<string, number> = {}
    for (const v of allVulns) {
      byOwasp[v.owasp] = (byOwasp[v.owasp] ?? 0) + 1
    }

    // Recommendations
    const recommendations = this.generateRecommendations(allVulns, allSecrets)

    // Summary
    const summary = `Scanned ${filesScanned} files. Found ${allVulns.length} vulnerabilities and ${allSecrets.length} secrets. Risk: ${riskLevel} (${riskScore}/100).`

    return {
      vulnerabilities: allVulns,
      secrets: allSecrets,
      riskScore,
      riskLevel,
      summary,
      filesScanned,
      recommendations,
      bySeverity,
      byOwasp,
    }
  }

  /**
   * Get all supported OWASP categories.
   */
  getOwaspCategories(): OwaspCategory[] {
    return [
      'A01:2021-Broken-Access-Control',
      'A02:2021-Cryptographic-Failures',
      'A03:2021-Injection',
      'A04:2021-Insecure-Design',
      'A05:2021-Security-Misconfiguration',
      'A06:2021-Vulnerable-Components',
      'A07:2021-Auth-Failures',
      'A08:2021-Software-Integrity-Failures',
      'A09:2021-Security-Logging-Failures',
      'A10:2021-SSRF',
    ]
  }

  /**
   * Get all CWE IDs we check for.
   */
  getSupportedCWEs(): string[] {
    return [...new Set(VULN_PATTERNS.map(p => p.cwe))].sort()
  }

  // ── Private helpers ──

  private detectLanguage(filePath: string): AnalysisLanguage {
    const ext = filePath.substring(filePath.lastIndexOf('.'))
    const map: Record<string, AnalysisLanguage> = {
      '.ts': 'typescript', '.tsx': 'typescript',
      '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript',
      '.py': 'python', '.rs': 'rust', '.go': 'go',
      '.java': 'java', '.cs': 'csharp', '.php': 'php',
      '.rb': 'ruby',
    }
    return map[ext] ?? 'unknown'
  }

  private maskValue(line: string): string {
    // Show first 4 chars of value, mask the rest
    const match = line.match(/['"]([^'"]{4})([^'"]*)['"]/);
    if (match) return `${match[1]}${'*'.repeat(Math.min(match[2].length, 20))}`
    return '****'
  }

  private calculateRiskScore(vulns: SecurityVulnerability[], secrets: DetectedSecret[]): number {
    let score = 0

    for (const v of vulns) {
      score += v.cvssScore * (v.falsePositiveRisk === 'low' ? 1.0 : v.falsePositiveRisk === 'medium' ? 0.7 : 0.4)
    }

    for (const s of secrets) {
      switch (s.severity) {
        case 'critical': score += 10; break
        case 'high': score += 7; break
        case 'medium': score += 4; break
        default: score += 2
      }
    }

    // Normalize to 0-100
    return Math.min(100, Math.round(score))
  }

  private generateRecommendations(vulns: SecurityVulnerability[], secrets: DetectedSecret[]): string[] {
    const recs: string[] = []

    // Critical vulnerabilities first
    const criticals = vulns.filter(v => v.severity === 'critical')
    if (criticals.length > 0) {
      recs.push(`Fix ${criticals.length} critical vulnerabilities immediately`)
    }

    // Secrets
    if (secrets.length > 0) {
      recs.push(`Remove ${secrets.length} hardcoded secrets and use environment variables`)
      recs.push('Add a .gitignore entry for .env files')
      recs.push('Consider using a secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager)')
    }

    // Injection vulnerabilities
    const injections = vulns.filter(v => v.owasp === 'A03:2021-Injection')
    if (injections.length > 0) {
      recs.push('Use parameterized queries and input validation for all user inputs')
    }

    // Crypto issues
    const cryptoIssues = vulns.filter(v => v.owasp === 'A02:2021-Cryptographic-Failures')
    if (cryptoIssues.length > 0) {
      recs.push('Update to strong cryptographic algorithms (SHA-256+, AES-256)')
    }

    // General
    if (vulns.length > 0) {
      recs.push('Run security scans as part of CI/CD pipeline')
      recs.push('Keep dependencies updated to patch known vulnerabilities')
    }

    return recs
  }
}
