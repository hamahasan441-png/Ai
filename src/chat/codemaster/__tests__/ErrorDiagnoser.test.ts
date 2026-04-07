import { describe, it, expect, beforeEach } from 'vitest'
import { ErrorDiagnoser } from '../ErrorDiagnoser.js'
import type {
  DiagnosedError,
  DiagnosticReport,
  StackFrame,
} from '../ErrorDiagnoser.js'

describe('ErrorDiagnoser', () => {
  let diagnoser: ErrorDiagnoser

  beforeEach(() => {
    diagnoser = new ErrorDiagnoser()
  })

  // ═══════════════════════════════════════════════════════════
  // diagnose
  // ═══════════════════════════════════════════════════════════

  describe('diagnose', () => {
    it('should diagnose TypeError', () => {
      const result = diagnoser.diagnose(
        "TypeError: Cannot read properties of undefined (reading 'name')\n" +
        '    at processUser (src/users.ts:42:10)\n' +
        '    at main (src/index.ts:10:5)',
      )
      expect(result.errorType).toBe('TypeError')
      expect(result.category).toBe('runtime-error')
      expect(result.severity).toBe('high')
    })

    it('should find root cause in user code', () => {
      const result = diagnoser.diagnose(
        "TypeError: Cannot read properties of undefined (reading 'name')\n" +
        '    at processUser (src/users.ts:42:10)\n' +
        '    at main (src/index.ts:10:5)',
      )
      expect(result.rootCauseFile).toBe('src/users.ts')
      expect(result.rootCauseLine).toBe(42)
    })

    it('should suggest fixes for null/undefined access', () => {
      const result = diagnoser.diagnose(
        "TypeError: Cannot read properties of undefined (reading 'name')",
      )
      expect(result.suggestedFixes.length).toBeGreaterThan(0)
      expect(result.suggestedFixes.some(f => f.description.includes('optional chaining'))).toBe(true)
    })

    it('should diagnose ReferenceError', () => {
      const result = diagnoser.diagnose(
        'ReferenceError: myVar is not defined\n' +
        '    at Object.<anonymous> (src/app.ts:5:3)',
      )
      expect(result.errorType).toBe('ReferenceError')
      expect(result.category).toBe('reference-error')
    })

    it('should diagnose SyntaxError', () => {
      const result = diagnoser.diagnose(
        'SyntaxError: Unexpected token )',
      )
      expect(result.errorType).toBe('SyntaxError')
      expect(result.category).toBe('syntax-error')
      expect(result.severity).toBe('critical')
    })

    it('should diagnose module not found errors', () => {
      const result = diagnoser.diagnose(
        "Error: Cannot find module 'lodash'\n" +
        '    at Object.<anonymous> (src/utils.ts:1:1)',
      )
      expect(result.category).toBe('import-error')
      expect(result.suggestedFixes.some(f => f.description.includes('npm install'))).toBe(true)
    })

    it('should diagnose TypeScript errors', () => {
      const result = diagnoser.diagnose(
        "error TS2322: Type 'string' is not assignable to type 'number'",
      )
      expect(result.errorType).toBe('TS2322')
      expect(result.language).toBe('typescript')
      expect(result.category).toBe('type-error')
    })

    it('should diagnose ENOENT errors', () => {
      const result = diagnoser.diagnose(
        "Error: ENOENT: no such file or directory, open '/path/to/file'",
      )
      expect(result.suggestedFixes.some(f => f.description.includes('file path'))).toBe(true)
    })

    it('should diagnose EACCES errors', () => {
      const result = diagnoser.diagnose(
        'Error: EACCES: permission denied',
      )
      expect(result.category).toBe('permission-error')
    })

    it('should diagnose ECONNREFUSED errors', () => {
      const result = diagnoser.diagnose(
        'Error: ECONNREFUSED 127.0.0.1:5432',
      )
      expect(result.category).toBe('network-error')
    })

    it('should generate a summary', () => {
      const result = diagnoser.diagnose(
        "TypeError: Cannot read properties of undefined (reading 'name')\n" +
        '    at processUser (src/users.ts:42:10)',
      )
      expect(result.summary).toContain('TypeError')
    })

    it('should handle timeout errors', () => {
      const result = diagnoser.diagnose(
        'Error: ETIMEDOUT: connection timed out',
      )
      expect(result.category).toBe('timeout-error')
    })

    it('should handle out of memory errors', () => {
      const result = diagnoser.diagnose(
        'FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory',
      )
      expect(result.category).toBe('memory-error')
      expect(result.severity).toBe('critical')
    })

    it('should handle assertion errors', () => {
      const result = diagnoser.diagnose(
        'AssertionError: expected true to equal false',
      )
      expect(result.category).toBe('assertion-error')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // detectLanguage
  // ═══════════════════════════════════════════════════════════

  describe('detectLanguage', () => {
    it('should detect Python from traceback', () => {
      expect(diagnoser.detectLanguage('Traceback (most recent call last):')).toBe('python')
    })

    it('should detect Python from File pattern', () => {
      expect(diagnoser.detectLanguage('File "main.py", line 10, in main')).toBe('python')
    })

    it('should detect Go from goroutine', () => {
      expect(diagnoser.detectLanguage('goroutine 1 [running]:')).toBe('go')
    })

    it('should detect Rust from error code', () => {
      expect(diagnoser.detectLanguage('error[E0308]: mismatched types')).toBe('rust')
    })

    it('should detect TypeScript from TS error', () => {
      expect(diagnoser.detectLanguage('error TS2322: Type mismatch at src/app.ts(10,5)')).toBe('typescript')
    })

    it('should default to JavaScript', () => {
      expect(diagnoser.detectLanguage('Error: something went wrong')).toBe('javascript')
    })

    it('should detect Java from .java files', () => {
      expect(diagnoser.detectLanguage('at com.app.Main.java:42')).toBe('java')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // parseStackTrace
  // ═══════════════════════════════════════════════════════════

  describe('parseStackTrace', () => {
    it('should parse Node.js stack trace', () => {
      const frames = diagnoser.parseStackTrace(
        '    at processUser (src/users.ts:42:10)\n' +
        '    at main (src/index.ts:10:5)\n' +
        '    at Module._compile (node_modules/module.js:200:10)',
      )
      expect(frames.length).toBe(3)
      expect(frames[0].functionName).toBe('processUser')
      expect(frames[0].filePath).toBe('src/users.ts')
      expect(frames[0].line).toBe(42)
      expect(frames[0].column).toBe(10)
    })

    it('should detect user code vs library code', () => {
      const frames = diagnoser.parseStackTrace(
        '    at processUser (src/users.ts:42:10)\n' +
        '    at Object.<anonymous> (node_modules/express/lib/router.js:100:5)',
      )
      expect(frames[0].isUserCode).toBe(true)
      expect(frames[1].isUserCode).toBe(false)
    })

    it('should extract module name from node_modules', () => {
      const frames = diagnoser.parseStackTrace(
        '    at Object.<anonymous> (node_modules/express/lib/router.js:100:5)',
      )
      expect(frames[0].module).toBe('express')
    })

    it('should parse Python stack trace', () => {
      const frames = diagnoser.parseStackTrace(
        'File "app/main.py", line 42, in process_user\n' +
        'File "app/utils.py", line 10, in validate',
        'python',
      )
      expect(frames.length).toBe(2)
      expect(frames[0].filePath).toBe('app/main.py')
      expect(frames[0].line).toBe(42)
      expect(frames[0].functionName).toBe('process_user')
    })

    it('should parse Go stack trace', () => {
      const frames = diagnoser.parseStackTrace(
        'main.go:42\ncmd/server.go:10',
        'go',
      )
      expect(frames.length).toBe(2)
      expect(frames[0].filePath).toBe('main.go')
      expect(frames[0].line).toBe(42)
    })

    it('should parse Rust stack trace', () => {
      const frames = diagnoser.parseStackTrace(
        '   at src/main.rs:42:5\n   at src/lib.rs:10:3',
        'rust',
      )
      expect(frames.length).toBe(2)
      expect(frames[0].filePath).toBe('src/main.rs')
    })

    it('should handle anonymous functions', () => {
      const frames = diagnoser.parseStackTrace(
        '    at src/index.ts:5:3',
      )
      expect(frames[0].functionName).toBe('<anonymous>')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // categorize
  // ═══════════════════════════════════════════════════════════

  describe('categorize', () => {
    it('should categorize type errors', () => {
      expect(diagnoser.categorize('TypeError: x', 'TypeError')).toBe('type-error')
    })

    it('should categorize syntax errors', () => {
      expect(diagnoser.categorize('SyntaxError: unexpected token', 'SyntaxError')).toBe('syntax-error')
    })

    it('should categorize reference errors', () => {
      expect(diagnoser.categorize('ReferenceError: x is not defined', 'ReferenceError')).toBe('reference-error')
    })

    it('should categorize import errors', () => {
      expect(diagnoser.categorize('Cannot find module lodash', 'Error')).toBe('import-error')
    })

    it('should categorize permission errors', () => {
      expect(diagnoser.categorize('EACCES permission denied', 'Error')).toBe('permission-error')
    })

    it('should categorize network errors', () => {
      expect(diagnoser.categorize('ECONNREFUSED', 'Error')).toBe('network-error')
    })

    it('should categorize timeout errors', () => {
      expect(diagnoser.categorize('ETIMEDOUT', 'Error')).toBe('timeout-error')
    })

    it('should categorize memory errors', () => {
      expect(diagnoser.categorize('heap out of memory', 'Error')).toBe('memory-error')
    })

    it('should categorize TypeScript errors', () => {
      expect(diagnoser.categorize('error TS2322', 'TS2322')).toBe('type-error')
    })

    it('should default to runtime-error', () => {
      expect(diagnoser.categorize('something went wrong', 'Error')).toBe('runtime-error')
    })
  })

  // ═══════════════════════════════════════════════════════════
  // parseErrorHeader
  // ═══════════════════════════════════════════════════════════

  describe('parseErrorHeader', () => {
    it('should parse standard error format', () => {
      const { errorType, message } = diagnoser.parseErrorHeader('TypeError: Cannot read property')
      expect(errorType).toBe('TypeError')
      expect(message).toBe('Cannot read property')
    })

    it('should parse TypeScript error format', () => {
      const { errorType, message } = diagnoser.parseErrorHeader('error TS2322: Type mismatch')
      expect(errorType).toBe('TS2322')
      expect(message).toBe('Type mismatch')
    })

    it('should parse Rust error format', () => {
      const { errorType, message } = diagnoser.parseErrorHeader('error[E0308]: mismatched types')
      expect(errorType).toBe('E0308')
      expect(message).toBe('mismatched types')
    })

    it('should handle unknown format', () => {
      const { errorType, message } = diagnoser.parseErrorHeader('Something broke')
      expect(errorType).toBe('Error')
      expect(message).toBeTruthy()
    })
  })

  // ═══════════════════════════════════════════════════════════
  // generateReport
  // ═══════════════════════════════════════════════════════════

  describe('generateReport', () => {
    it('should generate report for single error', () => {
      const report = diagnoser.generateReport([
        "TypeError: Cannot read properties of undefined\n    at main (src/app.ts:10:5)",
      ])
      expect(report.errors).toHaveLength(1)
      expect(report.summary).toBeTruthy()
    })

    it('should generate report for multiple errors', () => {
      const report = diagnoser.generateReport([
        "TypeError: Cannot read properties of undefined\n    at main (src/app.ts:10:5)",
        "SyntaxError: Unexpected token\n    at parse (src/parser.ts:20:3)",
      ])
      expect(report.errors).toHaveLength(2)
      expect(report.summary).toContain('2 errors')
    })

    it('should collect involved files', () => {
      const report = diagnoser.generateReport([
        "Error: failed\n    at func (src/app.ts:10:5)",
      ])
      expect(report.involvedFiles).toContain('src/app.ts')
    })

    it('should determine overall severity', () => {
      const report = diagnoser.generateReport([
        'SyntaxError: Unexpected token',
      ])
      expect(report.overallSeverity).toBe('critical')
    })

    it('should find top priority fix', () => {
      const report = diagnoser.generateReport([
        "TypeError: Cannot read properties of undefined (reading 'name')",
      ])
      expect(report.topPriorityFix).toBeDefined()
      expect(report.topPriorityFix!.confidence).toBeGreaterThan(0)
    })

    it('should handle empty error list', () => {
      const report = diagnoser.generateReport([])
      expect(report.errors).toHaveLength(0)
    })
  })

  // ═══════════════════════════════════════════════════════════
  // Known patterns
  // ═══════════════════════════════════════════════════════════

  describe('known patterns', () => {
    it('should match TypeScript property error pattern', () => {
      const result = diagnoser.diagnose("Property 'foo' does not exist on type 'Bar'")
      expect(result.relatedPatterns.length).toBeGreaterThan(0)
    })

    it('should match type assignment error pattern', () => {
      const result = diagnoser.diagnose('is not assignable to type')
      expect(result.relatedPatterns.length).toBeGreaterThan(0)
    })

    it('should match Python import error', () => {
      const result = diagnoser.diagnose(
        'Traceback (most recent call last):\n' +
        'ImportError: No module named requests',
      )
      expect(result.category).toBe('import-error')
      expect(result.suggestedFixes.length).toBeGreaterThan(0)
    })

    it('should match Python indentation error', () => {
      const result = diagnoser.diagnose(
        'File "main.py", line 5\n' +
        'IndentationError: unexpected indent',
      )
      expect(result.category).toBe('syntax-error')
    })

    it('should match Rust type mismatch', () => {
      const result = diagnoser.diagnose('error[E0308]: mismatched types')
      expect(result.relatedPatterns.some(p => p.includes('Rust'))).toBe(true)
    })

    it('should match Rust ownership error', () => {
      const result = diagnoser.diagnose('error[E0382]: use of moved value')
      expect(result.relatedPatterns.some(p => p.includes('ownership'))).toBe(true)
    })

    it('should match ERR_MODULE_NOT_FOUND', () => {
      const result = diagnoser.diagnose('Error [ERR_MODULE_NOT_FOUND]: Cannot find package')
      expect(result.relatedPatterns.some(p => p.includes('module'))).toBe(true)
    })
  })
})
