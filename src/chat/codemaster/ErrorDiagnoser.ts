/**
 * 🔍 ErrorDiagnoser — Stack Trace & Error Analysis Engine
 *
 * Diagnoses errors like GitHub Copilot agent:
 *   • Parses stack traces from multiple languages/runtimes
 *   • Identifies root cause from error chains
 *   • Suggests fixes based on error patterns
 *   • Categorizes errors (type, syntax, runtime, logic, config)
 *   • Extracts file paths and line numbers
 *   • Maps errors to known issue patterns
 *   • Generates diagnostic summaries
 *   • Supports Node.js, Python, Rust, Go, Java, C# errors
 *
 * Works fully offline — pattern-based diagnosis, zero external deps.
 */

import type { AnalysisLanguage, Severity } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Categories of errors. */
export type ErrorCategory =
  | 'type-error'
  | 'syntax-error'
  | 'runtime-error'
  | 'reference-error'
  | 'import-error'
  | 'network-error'
  | 'permission-error'
  | 'config-error'
  | 'dependency-error'
  | 'memory-error'
  | 'timeout-error'
  | 'assertion-error'
  | 'unknown'

/** A parsed stack frame. */
export interface StackFrame {
  /** Function/method name. */
  functionName: string
  /** File path. */
  filePath: string
  /** Line number. */
  line: number
  /** Column number (if available). */
  column?: number
  /** Whether this is in user code (vs library). */
  isUserCode: boolean
  /** Module/package name if in library code. */
  module?: string
}

/** A diagnosed error. */
export interface DiagnosedError {
  /** Error class/type. */
  errorType: string
  /** Error message. */
  message: string
  /** Error category. */
  category: ErrorCategory
  /** Severity. */
  severity: Severity
  /** Parsed stack frames. */
  stackFrames: StackFrame[]
  /** Root cause file (first user code frame). */
  rootCauseFile?: string
  /** Root cause line. */
  rootCauseLine?: number
  /** Detected language/runtime. */
  language: AnalysisLanguage
  /** Suggested fixes. */
  suggestedFixes: SuggestedFix[]
  /** Related error patterns (known issues). */
  relatedPatterns: string[]
  /** Diagnostic summary. */
  summary: string
}

/** A suggested fix for an error. */
export interface SuggestedFix {
  /** Fix description. */
  description: string
  /** Confidence that this fix is correct (0-1). */
  confidence: number
  /** Code snippet if applicable. */
  codeSnippet?: string
  /** File to modify. */
  targetFile?: string
  /** Line to modify. */
  targetLine?: number
}

/** Full diagnostic report. */
export interface DiagnosticReport {
  /** All diagnosed errors. */
  errors: DiagnosedError[]
  /** Overall summary. */
  summary: string
  /** Top priority fix. */
  topPriorityFix?: SuggestedFix
  /** Files involved. */
  involvedFiles: string[]
  /** Overall severity. */
  overallSeverity: Severity
}

// ══════════════════════════════════════════════════════════════════════════════
// KNOWN ERROR PATTERNS
// ══════════════════════════════════════════════════════════════════════════════

interface ErrorPattern {
  pattern: RegExp
  category: ErrorCategory
  severity: Severity
  language: AnalysisLanguage | 'any'
  fixes: Array<{ description: string; confidence: number; code?: string }>
  description: string
}

const KNOWN_PATTERNS: ErrorPattern[] = [
  // TypeScript/JavaScript
  {
    pattern: /Cannot find module ['"](.+?)['"]/,
    category: 'import-error',
    severity: 'high',
    language: 'typescript',
    fixes: [
      { description: 'Install the missing module with npm install', confidence: 0.8 },
      { description: 'Check the import path is correct', confidence: 0.7 },
      { description: 'Ensure the file exists and is properly exported', confidence: 0.6 },
    ],
    description: 'Module not found',
  },
  {
    pattern: /Property ['"](\w+)['"] does not exist on type/,
    category: 'type-error',
    severity: 'medium',
    language: 'typescript',
    fixes: [
      { description: 'Add the missing property to the type/interface', confidence: 0.7 },
      { description: 'Use type assertion if the property is dynamic', confidence: 0.5 },
      { description: 'Check for typos in the property name', confidence: 0.6 },
    ],
    description: 'TypeScript property access error',
  },
  {
    pattern: /is not assignable to type/,
    category: 'type-error',
    severity: 'medium',
    language: 'typescript',
    fixes: [
      { description: 'Ensure the types match or add proper conversion', confidence: 0.7 },
      { description: 'Update the type definition to accept the value', confidence: 0.5 },
    ],
    description: 'TypeScript type mismatch',
  },
  {
    pattern: /TypeError: Cannot read propert(?:y|ies) of (undefined|null)/,
    category: 'runtime-error',
    severity: 'high',
    language: 'javascript',
    fixes: [
      {
        description: 'Add null/undefined check before accessing the property',
        confidence: 0.8,
        code: 'if (obj != null) { obj.property }',
      },
      {
        description: 'Use optional chaining: obj?.property',
        confidence: 0.9,
        code: 'obj?.property',
      },
      { description: 'Ensure the object is properly initialized', confidence: 0.7 },
    ],
    description: 'Null/undefined access',
  },
  {
    pattern: /ReferenceError: (\w+) is not defined/,
    category: 'reference-error',
    severity: 'high',
    language: 'javascript',
    fixes: [
      { description: 'Import or declare the variable before using it', confidence: 0.8 },
      { description: 'Check for typos in the variable name', confidence: 0.6 },
    ],
    description: 'Undefined reference',
  },
  {
    pattern: /SyntaxError: Unexpected token/,
    category: 'syntax-error',
    severity: 'critical',
    language: 'javascript',
    fixes: [
      { description: 'Check for missing brackets, parentheses, or commas', confidence: 0.7 },
      { description: 'Ensure the file is valid JavaScript/TypeScript', confidence: 0.5 },
    ],
    description: 'Syntax error',
  },
  {
    pattern: /ENOENT: no such file or directory/,
    category: 'runtime-error',
    severity: 'high',
    language: 'javascript',
    fixes: [
      { description: 'Check that the file path is correct', confidence: 0.8 },
      { description: 'Create the missing file/directory', confidence: 0.6 },
    ],
    description: 'File not found',
  },
  {
    pattern: /EACCES: permission denied/,
    category: 'permission-error',
    severity: 'high',
    language: 'javascript',
    fixes: [
      { description: 'Check file/directory permissions', confidence: 0.8 },
      { description: 'Run with appropriate permissions', confidence: 0.5 },
    ],
    description: 'Permission denied',
  },
  {
    pattern: /ECONNREFUSED/,
    category: 'network-error',
    severity: 'high',
    language: 'javascript',
    fixes: [
      { description: 'Ensure the target server/service is running', confidence: 0.8 },
      { description: 'Check the connection URL and port', confidence: 0.7 },
    ],
    description: 'Connection refused',
  },
  {
    pattern: /ERR_MODULE_NOT_FOUND/,
    category: 'import-error',
    severity: 'high',
    language: 'javascript',
    fixes: [
      { description: 'Check the import path includes the file extension', confidence: 0.8 },
      { description: 'Ensure the module is installed in node_modules', confidence: 0.7 },
    ],
    description: 'ES module not found',
  },
  // Python
  {
    pattern: /ImportError: No module named ['"]?(\w+)/,
    category: 'import-error',
    severity: 'high',
    language: 'python',
    fixes: [
      { description: 'Install the module: pip install <module>', confidence: 0.8 },
      { description: 'Check PYTHONPATH and virtual environment', confidence: 0.6 },
    ],
    description: 'Python module not found',
  },
  {
    pattern: /AttributeError: ['"]?(\w+)['"]? object has no attribute ['"]?(\w+)/,
    category: 'type-error',
    severity: 'medium',
    language: 'python',
    fixes: [
      { description: 'Check the object has the expected attribute', confidence: 0.7 },
      { description: 'Use hasattr() to check before accessing', confidence: 0.6 },
    ],
    description: 'Missing attribute',
  },
  {
    pattern: /IndentationError:/,
    category: 'syntax-error',
    severity: 'critical',
    language: 'python',
    fixes: [
      {
        description: 'Fix indentation — use consistent spaces (4 spaces recommended)',
        confidence: 0.9,
      },
      { description: 'Check for mixed tabs and spaces', confidence: 0.8 },
    ],
    description: 'Python indentation error',
  },
  {
    pattern: /KeyError: ['"]?(\w+)/,
    category: 'runtime-error',
    severity: 'medium',
    language: 'python',
    fixes: [
      { description: 'Use dict.get(key, default) for safe access', confidence: 0.8 },
      { description: 'Check that the key exists before accessing', confidence: 0.7 },
    ],
    description: 'Dictionary key error',
  },
  // Rust
  {
    pattern: /error\[E0308\]: mismatched types/,
    category: 'type-error',
    severity: 'high',
    language: 'rust',
    fixes: [
      { description: 'Ensure the types match or add proper conversion', confidence: 0.7 },
      { description: 'Use .into() or .from() for type conversion', confidence: 0.6 },
    ],
    description: 'Rust type mismatch',
  },
  {
    pattern: /error\[E0382\]: use of moved value/,
    category: 'runtime-error',
    severity: 'high',
    language: 'rust',
    fixes: [
      { description: 'Clone the value before moving it', confidence: 0.6 },
      { description: 'Use a reference (&) instead of moving ownership', confidence: 0.7 },
    ],
    description: 'Rust ownership error',
  },
  // Go
  {
    pattern: /undefined: (\w+)/,
    category: 'reference-error',
    severity: 'high',
    language: 'go',
    fixes: [
      { description: 'Declare or import the undefined identifier', confidence: 0.8 },
      { description: 'Check for typos in the identifier name', confidence: 0.6 },
    ],
    description: 'Go undefined identifier',
  },
  // General
  {
    pattern: /out of memory|OOM|heap/i,
    category: 'memory-error',
    severity: 'critical',
    language: 'any',
    fixes: [
      {
        description: 'Increase memory allocation (--max-old-space-size for Node.js)',
        confidence: 0.6,
      },
      {
        description: 'Check for memory leaks (unbounded arrays, event listeners)',
        confidence: 0.7,
      },
    ],
    description: 'Out of memory',
  },
  {
    pattern: /timeout|timed? ?out|ETIMEDOUT/i,
    category: 'timeout-error',
    severity: 'high',
    language: 'any',
    fixes: [
      { description: 'Increase timeout duration', confidence: 0.5 },
      { description: 'Check for slow operations or infinite loops', confidence: 0.6 },
      { description: 'Add retry logic with exponential backoff', confidence: 0.7 },
    ],
    description: 'Timeout error',
  },
  {
    pattern: /AssertionError|assertion failed/i,
    category: 'assertion-error',
    severity: 'high',
    language: 'any',
    fixes: [
      { description: 'Check the expected vs actual values in the assertion', confidence: 0.7 },
      {
        description: 'Update the test expectation if the behavior changed intentionally',
        confidence: 0.5,
      },
    ],
    description: 'Assertion failure',
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// STACK TRACE PARSERS
// ══════════════════════════════════════════════════════════════════════════════

/** Library/framework paths to exclude from user code. */
const LIBRARY_PATHS = [
  'node_modules',
  'site-packages',
  '.cargo/registry',
  'internal/',
  'native/',
  '<anonymous>',
  '<native>',
  'runtime/',
  'webpack/',
  'regenerator-runtime',
]

function isUserCode(filePath: string): boolean {
  return !LIBRARY_PATHS.some(lib => filePath.includes(lib))
}

function parseNodeStackTrace(text: string): StackFrame[] {
  const frames: StackFrame[] = []
  // Node.js: at functionName (filePath:line:col)
  // or: at filePath:line:col
  const pattern = /at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const filePath = match[2]
    frames.push({
      functionName: match[1] ?? '<anonymous>',
      filePath,
      line: parseInt(match[3], 10),
      column: parseInt(match[4], 10),
      isUserCode: isUserCode(filePath),
      module: filePath.includes('node_modules')
        ? filePath.split('node_modules/')[1]?.split('/')[0]
        : undefined,
    })
  }
  return frames
}

function parsePythonStackTrace(text: string): StackFrame[] {
  const frames: StackFrame[] = []
  // Python: File "path", line N, in functionName
  const pattern = /File "(.+?)", line (\d+)(?:, in (.+))?/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const filePath = match[1]
    frames.push({
      functionName: match[3] ?? '<module>',
      filePath,
      line: parseInt(match[2], 10),
      isUserCode: isUserCode(filePath),
      module: filePath.includes('site-packages')
        ? filePath.split('site-packages/')[1]?.split('/')[0]
        : undefined,
    })
  }
  return frames
}

function parseGoStackTrace(text: string): StackFrame[] {
  const frames: StackFrame[] = []
  // Go: path/file.go:line +0xABC
  const pattern = /(\S+\.go):(\d+)/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const filePath = match[1]
    frames.push({
      functionName: '<unknown>',
      filePath,
      line: parseInt(match[2], 10),
      isUserCode: isUserCode(filePath),
    })
  }
  return frames
}

function parseRustStackTrace(text: string): StackFrame[] {
  const frames: StackFrame[] = []
  // Rust: at src/main.rs:42:10
  const pattern = /at\s+(.+?):(\d+):(\d+)/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const filePath = match[1]
    frames.push({
      functionName: '<unknown>',
      filePath,
      line: parseInt(match[2], 10),
      column: parseInt(match[3], 10),
      isUserCode: isUserCode(filePath),
    })
  }
  return frames
}

// ══════════════════════════════════════════════════════════════════════════════
// ERROR DIAGNOSER CLASS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * ErrorDiagnoser — Diagnoses errors and suggests fixes.
 *
 * Parses stack traces, identifies root causes, and suggests targeted fixes
 * like GitHub Copilot agent does when it encounters build/test errors.
 */
export class ErrorDiagnoser {
  /**
   * Diagnose an error from its text representation.
   */
  diagnose(errorText: string): DiagnosedError {
    // Detect language/runtime
    const language = this.detectLanguage(errorText)

    // Parse error type and message
    const { errorType, message } = this.parseErrorHeader(errorText)

    // Categorize
    const category = this.categorize(errorText, errorType)

    // Parse stack trace
    const stackFrames = this.parseStackTrace(errorText, language)

    // Find root cause (first user code frame)
    const rootCauseFrame = stackFrames.find(f => f.isUserCode)

    // Match known patterns
    const { fixes, patterns } = this.matchPatterns(errorText, language)

    // Assess severity
    const severity = this.assessSeverity(category, errorType)

    // Generate summary
    const summary = this.generateSummary(errorType, message, rootCauseFrame, category)

    return {
      errorType,
      message,
      category,
      severity,
      stackFrames,
      rootCauseFile: rootCauseFrame?.filePath,
      rootCauseLine: rootCauseFrame?.line,
      language,
      suggestedFixes: fixes,
      relatedPatterns: patterns,
      summary,
    }
  }

  /**
   * Generate a full diagnostic report from multiple error texts.
   */
  generateReport(errorTexts: string[]): DiagnosticReport {
    const errors = errorTexts.map(text => this.diagnose(text))

    // Collect involved files
    const involvedFiles = [
      ...new Set(errors.flatMap(e => e.stackFrames.filter(f => f.isUserCode).map(f => f.filePath))),
    ]

    // Determine overall severity
    const severityOrder: Severity[] = ['info', 'low', 'medium', 'high', 'critical']
    let maxSevIdx = 0
    for (const error of errors) {
      const idx = severityOrder.indexOf(error.severity)
      if (idx > maxSevIdx) maxSevIdx = idx
    }
    const overallSeverity = severityOrder[maxSevIdx]

    // Find top priority fix
    let topPriorityFix: SuggestedFix | undefined
    let topConfidence = 0
    for (const error of errors) {
      for (const fix of error.suggestedFixes) {
        if (fix.confidence > topConfidence) {
          topConfidence = fix.confidence
          topPriorityFix = fix
        }
      }
    }

    // Summary
    const summary =
      errors.length === 1
        ? errors[0].summary
        : `${errors.length} errors diagnosed. ${involvedFiles.length} files involved. Overall severity: ${overallSeverity}.`

    return {
      errors,
      summary,
      topPriorityFix,
      involvedFiles,
      overallSeverity,
    }
  }

  /**
   * Parse a stack trace string into frames.
   */
  parseStackTrace(text: string, language?: AnalysisLanguage): StackFrame[] {
    const lang = language ?? this.detectLanguage(text)

    switch (lang) {
      case 'python':
        return parsePythonStackTrace(text)
      case 'go':
        return parseGoStackTrace(text)
      case 'rust':
        return parseRustStackTrace(text)
      default:
        return parseNodeStackTrace(text)
    }
  }

  /**
   * Detect the language/runtime from error text.
   */
  detectLanguage(text: string): AnalysisLanguage {
    if (/File ".+?", line \d+/.test(text)) return 'python'
    if (/Traceback \(most recent call last\)/.test(text)) return 'python'
    if (/goroutine \d+/.test(text)) return 'go'
    if (/\.go:\d+/.test(text) && !text.includes('node_modules')) return 'go'
    if (/error\[E\d{4}\]/.test(text)) return 'rust'
    if (/panicked at/.test(text)) return 'rust'
    if (/at\s+\S+\.java:\d+/.test(text)) return 'java'
    if (/\.cs:\d+/.test(text)) return 'csharp'
    if (/\.ts[x]?[:(]/.test(text) || /TS\d{4}/.test(text)) return 'typescript'
    return 'javascript' // default
  }

  /**
   * Categorize an error.
   */
  categorize(errorText: string, errorType: string): ErrorCategory {
    const typeLC = errorType.toLowerCase()
    const textLC = errorText.toLowerCase()

    if (typeLC.includes('type') || typeLC.includes('ts2') || /TS\d{4}/.test(errorType))
      return 'type-error'
    if (typeLC.includes('syntax') || typeLC.includes('parse')) return 'syntax-error'
    if (typeLC.includes('reference')) return 'reference-error'
    if (
      typeLC.includes('import') ||
      textLC.includes('cannot find module') ||
      textLC.includes('no module named')
    )
      return 'import-error'
    if (typeLC.includes('permission') || textLC.includes('eacces')) return 'permission-error'
    if (textLC.includes('econnrefused') || textLC.includes('network') || textLC.includes('fetch'))
      return 'network-error'
    if (textLC.includes('timeout') || textLC.includes('etimedout')) return 'timeout-error'
    if (textLC.includes('out of memory') || textLC.includes('heap')) return 'memory-error'
    if (typeLC.includes('assertion')) return 'assertion-error'
    if (textLC.includes('config') || textLC.includes('.env') || textLC.includes('environment'))
      return 'config-error'
    if (
      textLC.includes('npm') ||
      textLC.includes('pip') ||
      textLC.includes('cargo') ||
      textLC.includes('dependency')
    )
      return 'dependency-error'

    return 'runtime-error'
  }

  /**
   * Parse the error header (type + message).
   */
  parseErrorHeader(text: string): { errorType: string; message: string } {
    // TypeScript: error TS2322: Type 'X' is not assignable to type 'Y'
    let match = text.match(/error\s+(TS\d+):\s*(.+)/m)
    if (match) return { errorType: match[1], message: match[2] }

    // Standard: ErrorType: message
    match = text.match(/^(\w+Error):\s*(.+)/m)
    if (match) return { errorType: match[1], message: match[2] }

    // Rust: error[E0308]: message
    match = text.match(/error\[(\w+)\]:\s*(.+)/m)
    if (match) return { errorType: match[1], message: match[2] }

    // Python: ErrorType: message (at end after traceback)
    match = text.match(/(\w+Error):\s*(.+?)$/m)
    if (match) return { errorType: match[1], message: match[2] }

    // Fallback
    const firstLine = text.split('\n')[0].trim()
    return { errorType: 'Error', message: firstLine.substring(0, 200) }
  }

  // ── Private helpers ──

  private matchPatterns(
    text: string,
    language: AnalysisLanguage,
  ): { fixes: SuggestedFix[]; patterns: string[] } {
    const fixes: SuggestedFix[] = []
    const patterns: string[] = []

    for (const kp of KNOWN_PATTERNS) {
      kp.pattern.lastIndex = 0
      if (kp.pattern.test(text) && (kp.language === 'any' || kp.language === language)) {
        patterns.push(kp.description)
        for (const fix of kp.fixes) {
          fixes.push({
            description: fix.description,
            confidence: fix.confidence,
            codeSnippet: fix.code,
          })
        }
      }
    }

    // Sort fixes by confidence
    fixes.sort((a, b) => b.confidence - a.confidence)
    return { fixes, patterns }
  }

  private assessSeverity(category: ErrorCategory, errorType: string): Severity {
    if (category === 'syntax-error') return 'critical'
    if (category === 'memory-error') return 'critical'
    if (category === 'type-error' && /TS\d{4}/.test(errorType)) return 'medium'
    if (category === 'runtime-error') return 'high'
    if (category === 'reference-error') return 'high'
    if (category === 'import-error') return 'high'
    if (category === 'permission-error') return 'high'
    if (category === 'network-error') return 'medium'
    if (category === 'timeout-error') return 'medium'
    if (category === 'assertion-error') return 'high'
    if (category === 'config-error') return 'medium'
    if (category === 'dependency-error') return 'medium'
    return 'medium'
  }

  private generateSummary(
    errorType: string,
    message: string,
    rootCause: StackFrame | undefined,
    category: ErrorCategory,
  ): string {
    const parts: string[] = [`${errorType}: ${message.substring(0, 100)}`]

    if (rootCause) {
      parts.push(`Root cause at ${rootCause.filePath}:${rootCause.line}`)
      if (rootCause.functionName !== '<anonymous>' && rootCause.functionName !== '<unknown>') {
        parts.push(`in ${rootCause.functionName}()`)
      }
    }

    parts.push(`Category: ${category}`)

    return parts.join(' | ')
  }
}
