import { describe, it, expect, beforeEach } from 'vitest'
import { SecurityScanner } from '../SecurityScanner.js'
import type {
  SecurityVulnerability,
  DetectedSecret,
  SecurityScanResult,
} from '../SecurityScanner.js'

describe('SecurityScanner', () => {
  let scanner: SecurityScanner

  beforeEach(() => {
    scanner = new SecurityScanner()
  })

  // ═══════════════════════════════════════════════════════════
  // scanFile — SQL Injection
  // ═══════════════════════════════════════════════════════════

  describe('SQL Injection detection', () => {
    it('should detect SQL injection via string concatenation', () => {
      const code = `const result = db.query("SELECT * FROM users WHERE id = " + userId);`
      const { vulnerabilities } = scanner.scanFile(code, 'src/db.ts')
      expect(vulnerabilities.some(v => v.cwe === 'CWE-89')).toBe(true)
    })

    it('should detect SQL injection via template literal', () => {
      const code = 'const result = db.execute(`SELECT * FROM users WHERE id = ${userId}`);'
      const { vulnerabilities } = scanner.scanFile(code, 'src/db.ts')
      expect(vulnerabilities.some(v => v.title.includes('SQL Injection'))).toBe(true)
    })

    it('should not flag parameterized queries', () => {
      const code = `const result = db.query("SELECT * FROM users WHERE id = $1", [userId]);`
      const { vulnerabilities } = scanner.scanFile(code, 'src/db.ts')
      expect(vulnerabilities.filter(v => v.cwe === 'CWE-89')).toHaveLength(0)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // scanFile — XSS
  // ═══════════════════════════════════════════════════════════

  describe('XSS detection', () => {
    it('should detect innerHTML assignment', () => {
      const code = `element.innerHTML = userInput;`
      const { vulnerabilities } = scanner.scanFile(code, 'src/render.ts')
      expect(vulnerabilities.some(v => v.cwe === 'CWE-79')).toBe(true)
    })

    it('should detect dangerouslySetInnerHTML', () => {
      const code = `<div dangerouslySetInnerHTML={{ __html: content }} />`
      const { vulnerabilities } = scanner.scanFile(code, 'src/Component.tsx')
      expect(vulnerabilities.some(v => v.title.includes('XSS'))).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // scanFile — Command Injection
  // ═══════════════════════════════════════════════════════════

  describe('Command Injection detection', () => {
    it('should detect exec with string concatenation', () => {
      const code = `exec("ls " + userInput);`
      const { vulnerabilities } = scanner.scanFile(code, 'src/cmd.ts')
      expect(vulnerabilities.some(v => v.cwe === 'CWE-78')).toBe(true)
    })

    it('should detect execSync with template literal', () => {
      const code = 'execSync(`git log ${branch}`);'
      const { vulnerabilities } = scanner.scanFile(code, 'src/git.ts')
      expect(vulnerabilities.some(v => v.title.includes('Command Injection'))).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // scanFile — Crypto
  // ═══════════════════════════════════════════════════════════

  describe('Weak crypto detection', () => {
    it('should detect MD5 usage', () => {
      const code = `const hash = crypto.createHash('md5').update(data).digest('hex');`
      const { vulnerabilities } = scanner.scanFile(code, 'src/crypto.ts')
      expect(vulnerabilities.some(v => v.cwe === 'CWE-328')).toBe(true)
    })

    it('should detect SHA-1 usage', () => {
      const code = `const hash = crypto.createHash('sha1').update(data).digest('hex');`
      const { vulnerabilities } = scanner.scanFile(code, 'src/crypto.ts')
      expect(vulnerabilities.some(v => v.title.includes('SHA-1'))).toBe(true)
    })

    it('should not flag SHA-256', () => {
      const code = `const hash = crypto.createHash('sha256').update(data).digest('hex');`
      const { vulnerabilities } = scanner.scanFile(code, 'src/crypto.ts')
      expect(vulnerabilities.filter(v => v.cwe === 'CWE-328')).toHaveLength(0)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // scanFile — eval
  // ═══════════════════════════════════════════════════════════

  describe('eval detection', () => {
    it('should detect eval usage', () => {
      const code = `const result = eval(userCode);`
      const { vulnerabilities } = scanner.scanFile(code, 'src/dynamic.ts')
      expect(vulnerabilities.some(v => v.cwe === 'CWE-95')).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // scanFile — SSL
  // ═══════════════════════════════════════════════════════════

  describe('SSL/TLS detection', () => {
    it('should detect disabled SSL verification', () => {
      const code = `const config = { rejectUnauthorized: false };`
      const { vulnerabilities } = scanner.scanFile(code, 'src/http.ts')
      expect(vulnerabilities.some(v => v.cwe === 'CWE-295')).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // scanFile — HTTP URLs
  // ═══════════════════════════════════════════════════════════

  describe('Insecure HTTP detection', () => {
    it('should detect HTTP URLs (non-localhost)', () => {
      const code = `const url = "http://api.example.com/data";`
      const { vulnerabilities } = scanner.scanFile(code, 'src/api.ts')
      expect(vulnerabilities.some(v => v.cwe === 'CWE-319')).toBe(true)
    })

    it('should not flag localhost HTTP', () => {
      const code = `const url = "http://localhost:3000";`
      const { vulnerabilities } = scanner.scanFile(code, 'src/dev.ts')
      expect(vulnerabilities.filter(v => v.cwe === 'CWE-319')).toHaveLength(0)
    })

    it('should not flag 127.0.0.1 HTTP', () => {
      const code = `const url = "http://127.0.0.1:8080";`
      const { vulnerabilities } = scanner.scanFile(code, 'src/dev.ts')
      expect(vulnerabilities.filter(v => v.cwe === 'CWE-319')).toHaveLength(0)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // scanFile — CORS
  // ═══════════════════════════════════════════════════════════

  describe('CORS detection', () => {
    it('should detect wildcard CORS', () => {
      const code = `res.setHeader("Access-Control-Allow-Origin", "*");`
      const { vulnerabilities } = scanner.scanFile(code, 'src/middleware.ts')
      expect(vulnerabilities.some(v => v.cwe === 'CWE-942')).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // scanFile — Console logging sensitive data
  // ═══════════════════════════════════════════════════════════

  describe('Sensitive logging detection', () => {
    it('should detect password in console.log', () => {
      const code = `console.log("User password is:", password);`
      const { vulnerabilities } = scanner.scanFile(code, 'src/auth.ts')
      expect(vulnerabilities.some(v => v.cwe === 'CWE-532')).toBe(true)
    })

    it('should detect apiKey in console.log', () => {
      const code = `console.log("API key:", apiKey);`
      const { vulnerabilities } = scanner.scanFile(code, 'src/config.ts')
      expect(vulnerabilities.some(v => v.cwe === 'CWE-532')).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Secret detection
  // ═══════════════════════════════════════════════════════════

  describe('secret detection', () => {
    it('should detect AWS access keys', () => {
      const code = `const key = "AKIAIOSFODNN7EXAMPLE";`
      const { secrets } = scanner.scanFile(code, 'src/aws.ts')
      expect(secrets.some(s => s.type === 'aws-key')).toBe(true)
    })

    it('should detect GitHub tokens', () => {
      const code = `const token = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk";`
      const { secrets } = scanner.scanFile(code, 'src/gh.ts')
      expect(secrets.some(s => s.type === 'github-token')).toBe(true)
    })

    it('should detect hardcoded passwords', () => {
      const code = `const password = "supersecretpassword123";`
      const { secrets } = scanner.scanFile(code, 'src/auth.ts')
      expect(secrets.some(s => s.type === 'password')).toBe(true)
    })

    it('should detect private keys', () => {
      const code = `const key = "-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAK...";`
      const { secrets } = scanner.scanFile(code, 'src/keys.ts')
      expect(secrets.some(s => s.type === 'private-key')).toBe(true)
    })

    it('should detect database URLs with credentials', () => {
      const code = `const url = "postgres://admin:password123@db.example.com/mydb";`
      const { secrets } = scanner.scanFile(code, 'src/db.ts')
      expect(secrets.some(s => s.type === 'database-url')).toBe(true)
    })

    it('should skip secrets in test files', () => {
      const code = `const password = "testpassword123";`
      const { secrets } = scanner.scanFile(code, 'src/auth.test.ts')
      expect(secrets).toHaveLength(0)
    })

    it('should skip secrets in comments', () => {
      const code = `// const password = "example_password_here";`
      const { secrets } = scanner.scanFile(code, 'src/auth.ts')
      expect(secrets.filter(s => s.type === 'password')).toHaveLength(0)
    })

    it('should mask detected secret values', () => {
      const code = `const password = "supersecretpassword123";`
      const { secrets } = scanner.scanFile(code, 'src/auth.ts')
      if (secrets.length > 0) {
        expect(secrets[0].maskedValue).toContain('*')
      }
    })
  })

  // ═══════════════════════════════════════════════════════════
  // scan (multi-file)
  // ═══════════════════════════════════════════════════════════

  describe('scan', () => {
    it('should scan multiple files', () => {
      const files = new Map<string, string>([
        ['src/app.ts', `const x = eval(input);`],
        ['src/db.ts', `db.query("SELECT * FROM users WHERE id = " + id);`],
      ])
      const result = scanner.scan(files)
      expect(result.vulnerabilities.length).toBeGreaterThanOrEqual(2)
      expect(result.filesScanned).toBe(2)
    })

    it('should calculate risk score', () => {
      const files = new Map<string, string>([
        ['src/app.ts', `const x = eval(input);`],
      ])
      const result = scanner.scan(files)
      expect(result.riskScore).toBeGreaterThan(0)
    })

    it('should determine risk level', () => {
      const files = new Map<string, string>([
        ['src/app.ts', `const result = db.query("SELECT * FROM users WHERE id = " + userId);`],
      ])
      const result = scanner.scan(files)
      expect(['critical', 'high', 'medium', 'low', 'minimal']).toContain(result.riskLevel)
    })

    it('should generate recommendations', () => {
      const files = new Map<string, string>([
        ['src/app.ts', `db.query("SELECT * FROM users WHERE id = " + userId);`],
      ])
      const result = scanner.scan(files)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('should track stats by severity', () => {
      const files = new Map<string, string>([
        ['src/app.ts', `const x = eval(input);`],
      ])
      const result = scanner.scan(files)
      expect(result.bySeverity).toBeDefined()
      expect(typeof result.bySeverity.critical).toBe('number')
    })

    it('should track stats by OWASP category', () => {
      const files = new Map<string, string>([
        ['src/app.ts', `db.query("SELECT * FROM users WHERE id = " + userId);`],
      ])
      const result = scanner.scan(files)
      expect(Object.keys(result.byOwasp).length).toBeGreaterThan(0)
    })

    it('should skip test files when requested', () => {
      const files = new Map<string, string>([
        ['src/app.ts', `const x = eval(input);`],
        ['src/__tests__/app.test.ts', `const y = eval(input);`],
      ])
      const result = scanner.scan(files, { skipTests: true })
      expect(result.filesScanned).toBe(1)
    })

    it('should generate summary', () => {
      const files = new Map<string, string>([
        ['src/app.ts', `console.log("safe code");`],
      ])
      const result = scanner.scan(files)
      expect(result.summary).toContain('Scanned 1 files')
    })

    it('should report minimal risk for clean code', () => {
      const files = new Map<string, string>([
        ['src/app.ts', `const x = 1 + 2;`],
      ])
      const result = scanner.scan(files)
      expect(result.riskLevel).toBe('minimal')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Utility methods
  // ═══════════════════════════════════════════════════════════

  describe('utility methods', () => {
    it('should return OWASP categories', () => {
      const categories = scanner.getOwaspCategories()
      expect(categories).toHaveLength(10)
      expect(categories[0]).toContain('A01')
    })

    it('should return supported CWEs', () => {
      const cwes = scanner.getSupportedCWEs()
      expect(cwes.length).toBeGreaterThan(0)
      expect(cwes.every(c => c.startsWith('CWE-'))).toBe(true)
    })

    it('should have unique CWEs', () => {
      const cwes = scanner.getSupportedCWEs()
      expect(new Set(cwes).size).toBe(cwes.length)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Language detection
  // ═══════════════════════════════════════════════════════════

  describe('language detection from file path', () => {
    it('should detect TypeScript', () => {
      const { vulnerabilities } = scanner.scanFile(`eval(input);`, 'src/app.ts')
      expect(vulnerabilities[0]?.language).toBe('typescript')
    })

    it('should detect JavaScript', () => {
      const { vulnerabilities } = scanner.scanFile(`eval(input);`, 'src/app.js')
      expect(vulnerabilities[0]?.language).toBe('javascript')
    })

    it('should detect Python', () => {
      const { vulnerabilities } = scanner.scanFile(`eval(input);`, 'app.py')
      expect(vulnerabilities[0]?.language).toBe('python')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Vulnerability metadata
  // ═══════════════════════════════════════════════════════════

  describe('vulnerability metadata', () => {
    it('should include remediation advice', () => {
      const code = `const x = eval(input);`
      const { vulnerabilities } = scanner.scanFile(code, 'src/app.ts')
      expect(vulnerabilities[0].remediation).toBeTruthy()
    })

    it('should include CVSS score', () => {
      const code = `const x = eval(input);`
      const { vulnerabilities } = scanner.scanFile(code, 'src/app.ts')
      expect(vulnerabilities[0].cvssScore).toBeGreaterThan(0)
    })

    it('should include line number', () => {
      const code = 'const a = 1;\nconst x = eval(input);'
      const { vulnerabilities } = scanner.scanFile(code, 'src/app.ts')
      expect(vulnerabilities[0].line).toBe(2)
    })

    it('should include code snippet', () => {
      const code = `const x = eval(input);`
      const { vulnerabilities } = scanner.scanFile(code, 'src/app.ts')
      expect(vulnerabilities[0].codeSnippet).toContain('eval')
    })

    it('should include false positive risk assessment', () => {
      const code = `const x = eval(input);`
      const { vulnerabilities } = scanner.scanFile(code, 'src/app.ts')
      expect(['low', 'medium', 'high']).toContain(vulnerabilities[0].falsePositiveRisk)
    })
  })
})
