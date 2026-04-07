/**
 * 🔍 CodeAnalyzer — Static Analysis Engine
 *
 * Analyzes code without executing it. Provides:
 *   • Language detection with confidence scoring
 *   • Complexity analysis (cyclomatic, cognitive, nesting)
 *   • Anti-pattern detection per language
 *   • Dependency mapping (imports/exports)
 *   • Code smell detection
 *   • Security pattern scanning
 *
 * Works fully offline — no API calls needed.
 */

import type {
  AnalysisLanguage,
  CodeAnalysis,
  ComplexityMetrics,
  AntiPattern,
  DependencyInfo,
  CodeSmell,
  SecurityIssue,
  Severity,
  AnalysisDepth,
} from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// LANGUAGE DETECTION
// ══════════════════════════════════════════════════════════════════════════════

/** Language signature: keyword patterns and typical constructs. */
interface LanguageSignature {
  language: AnalysisLanguage
  keywords: string[]
  patterns: RegExp[]
  weight: number
}

const LANGUAGE_SIGNATURES: LanguageSignature[] = [
  {
    language: 'typescript',
    keywords: ['interface', 'type', 'enum', 'namespace', 'readonly', 'as const'],
    patterns: [/:\s*(string|number|boolean|void|any|never|unknown)/, /import\s+type\s/, /<[A-Z]\w*>/, /export\s+interface\s/],
    weight: 1.2,
  },
  {
    language: 'javascript',
    keywords: ['const', 'let', 'var', 'function', 'require', 'module.exports'],
    patterns: [/=>\s*\{/, /\.then\(/, /async\s+function/, /console\.\w+/],
    weight: 1.0,
  },
  {
    language: 'python',
    keywords: ['def', 'class', 'import', 'from', 'elif', 'except', 'lambda', 'yield'],
    patterns: [/def\s+\w+\s*\(/, /class\s+\w+[\s:(]/, /if\s+__name__\s*==/, /print\s*\(/],
    weight: 1.1,
  },
  {
    language: 'java',
    keywords: ['public', 'private', 'protected', 'class', 'extends', 'implements', 'throws'],
    patterns: [/public\s+static\s+void\s+main/, /System\.out\.println/, /import\s+java\./, /@Override/],
    weight: 1.0,
  },
  {
    language: 'rust',
    keywords: ['fn', 'let', 'mut', 'impl', 'struct', 'enum', 'trait', 'pub', 'mod'],
    patterns: [/fn\s+\w+\s*\(/, /impl\s+\w+/, /use\s+std::/, /println!\s*\(/],
    weight: 1.1,
  },
  {
    language: 'go',
    keywords: ['func', 'package', 'import', 'struct', 'interface', 'chan', 'goroutine'],
    patterns: [/func\s+\w+\s*\(/, /package\s+\w+/, /import\s+\(/, /:=\s/],
    weight: 1.1,
  },
  {
    language: 'cpp',
    keywords: ['#include', 'template', 'namespace', 'class', 'virtual', 'nullptr'],
    patterns: [/#include\s*<\w+>/, /std::/, /template\s*</, /cout\s*<</],
    weight: 1.0,
  },
  {
    language: 'c',
    keywords: ['#include', 'struct', 'typedef', 'malloc', 'free', 'printf'],
    patterns: [/#include\s*<stdio\.h>/, /int\s+main\s*\(/, /printf\s*\(/, /sizeof\s*\(/],
    weight: 0.9,
  },
  {
    language: 'csharp',
    keywords: ['using', 'namespace', 'class', 'public', 'private', 'async', 'await', 'var'],
    patterns: [/using\s+System/, /namespace\s+\w+/, /Console\.Write/, /\[Attribute\]/],
    weight: 1.0,
  },
  {
    language: 'ruby',
    keywords: ['def', 'end', 'class', 'module', 'require', 'attr_accessor', 'puts'],
    patterns: [/def\s+\w+/, /class\s+\w+\s*</, /require\s+'/, /puts\s/],
    weight: 1.0,
  },
  {
    language: 'php',
    keywords: ['<?php', 'function', 'class', 'echo', 'namespace', 'use'],
    patterns: [/<\?php/, /\$\w+\s*=/, /function\s+\w+\s*\(/, /echo\s/],
    weight: 1.0,
  },
  {
    language: 'swift',
    keywords: ['func', 'var', 'let', 'struct', 'class', 'guard', 'optional'],
    patterns: [/func\s+\w+\s*\(/, /guard\s+let/, /import\s+Foundation/, /print\s*\(/],
    weight: 1.0,
  },
  {
    language: 'kotlin',
    keywords: ['fun', 'val', 'var', 'class', 'object', 'companion', 'data class'],
    patterns: [/fun\s+\w+\s*\(/, /val\s+\w+\s*[:=]/, /data\s+class/, /println\s*\(/],
    weight: 1.0,
  },
  {
    language: 'sql',
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE TABLE'],
    patterns: [/SELECT\s+.+\s+FROM/i, /CREATE\s+TABLE/i, /INSERT\s+INTO/i, /ALTER\s+TABLE/i],
    weight: 1.0,
  },
  {
    language: 'html',
    keywords: ['<html', '<head', '<body', '<div', '<script', '<!DOCTYPE'],
    patterns: [/<html[\s>]/, /<\/\w+>/, /class="/, /<!DOCTYPE\s+html>/i],
    weight: 1.0,
  },
  {
    language: 'css',
    keywords: ['{', '}', 'color:', 'margin:', 'display:', '@media', 'font-size:'],
    patterns: [/\.\w+\s*\{/, /#\w+\s*\{/, /@media\s*\(/, /:\s*\d+px/],
    weight: 0.9,
  },
  {
    language: 'bash',
    keywords: ['#!/bin/bash', 'echo', 'if', 'fi', 'do', 'done', 'export'],
    patterns: [/^#!/, /\$\(\w/, /\$\{?\w+\}?/, /if\s+\[/],
    weight: 1.0,
  },
  {
    language: 'scala',
    keywords: ['def', 'val', 'var', 'object', 'trait', 'case class', 'implicit'],
    patterns: [/def\s+\w+[[(]/, /case\s+class/, /object\s+\w+/, /implicit\s+/],
    weight: 1.0,
  },
  {
    language: 'haskell',
    keywords: ['module', 'where', 'import', 'data', 'type', 'class', 'instance'],
    patterns: [/module\s+\w+/, /::\s*/, /\w+\s*=\s*do/, /import\s+qualified/],
    weight: 1.0,
  },
  {
    language: 'powershell',
    keywords: ['$_', 'function', 'param', 'cmdlet', 'Write-Host', 'Get-', 'Set-'],
    patterns: [/\$\w+\s*=/, /function\s+\w+-\w+/, /param\s*\(/, /Write-Host\s/],
    weight: 1.0,
  },
  {
    language: 'r',
    keywords: ['library', 'function', '<-', 'data.frame', 'ggplot', 'mutate', 'filter'],
    patterns: [/\w+\s*<-\s/, /library\s*\(/, /function\s*\(/, /data\.frame\s*\(/],
    weight: 1.0,
  },
  {
    language: 'dart',
    keywords: ['void', 'class', 'final', 'var', 'Widget', 'setState', 'async', 'await'],
    patterns: [/void\s+main\s*\(/, /class\s+\w+\s+extends/, /Widget\s+build/, /final\s+\w+\s*=/],
    weight: 1.0,
  },
  {
    language: 'lua',
    keywords: ['function', 'local', 'end', 'then', 'require', 'table', 'nil'],
    patterns: [/function\s+\w+\s*\(/, /local\s+\w+\s*=/, /if\s+.+\s+then/, /require\s*\(\s*["']/],
    weight: 1.0,
  },
  {
    language: 'elixir',
    keywords: ['defmodule', 'def', 'defp', 'do', 'end', 'pipe', '|>'],
    patterns: [/defmodule\s+\w+/, /def\s+\w+/, /\|>/, /@spec\s/],
    weight: 1.0,
  },
  {
    language: 'mql4',
    keywords: ['#property', 'extern', 'datetime', 'OrderSend', 'OrderClose', 'OrderModify', 'iMA', 'iRSI'],
    patterns: [/int\s+(?:init|start|deinit)\s*\(\)/, /OrderSend\s*\(/, /iMA\s*\(/, /#property\s+(?:indicator|script|copyright)/],
    weight: 1.2,
  },
  {
    language: 'mql5',
    keywords: ['#property', 'input', 'datetime', 'CTrade', 'CPositionInfo', 'OnInit', 'OnTick', 'OnDeinit'],
    patterns: [/int\s+OnInit\s*\(\)/, /void\s+OnTick\s*\(\)/, /void\s+OnDeinit\s*\(/, /#property\s+(?:indicator|script|copyright)/],
    weight: 1.3,
  },
  {
    language: 'pinescript',
    keywords: ['//@version', 'strategy', 'indicator', 'plot', 'ta.sma', 'ta.ema', 'ta.rsi', 'ta.crossover'],
    patterns: [/\/\/@version\s*=\s*\d+/, /strategy\s*\(/, /indicator\s*\(/, /ta\.\w+\s*\(/],
    weight: 1.3,
  },
]

/**
 * Detect the programming language of a code snippet.
 * Returns language and confidence score.
 */
export function detectLanguageAdvanced(code: string): { language: AnalysisLanguage; confidence: number } {
  if (!code.trim()) return { language: 'unknown', confidence: 0 }

  const scores = new Map<AnalysisLanguage, number>()

  for (const sig of LANGUAGE_SIGNATURES) {
    let score = 0

    // Check keywords
    for (const kw of sig.keywords) {
      if (code.includes(kw)) score += 1
    }

    // Check patterns
    for (const pat of sig.patterns) {
      if (pat.test(code)) score += 2
    }

    score *= sig.weight
    if (score > 0) scores.set(sig.language, score)
  }

  // If TypeScript and JavaScript both match, TypeScript-specific patterns win
  const tsScore = scores.get('typescript') ?? 0
  const jsScore = scores.get('javascript') ?? 0
  if (tsScore > 0 && jsScore > 0 && tsScore >= jsScore) {
    scores.delete('javascript')
  }

  // Find the best match
  let bestLang: AnalysisLanguage = 'unknown'
  let bestScore = 0
  let totalScore = 0

  for (const [lang, score] of scores) {
    totalScore += score
    if (score > bestScore) {
      bestScore = score
      bestLang = lang
    }
  }

  const confidence = totalScore > 0 ? Math.min(bestScore / Math.max(totalScore, 1), 1.0) : 0

  return { language: bestLang, confidence: Math.round(confidence * 100) / 100 }
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPLEXITY ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze code complexity.
 */
export function analyzeComplexity(code: string): ComplexityMetrics {
  const lines = code.split('\n')
  const codeLines = lines.filter(l => {
    const trimmed = l.trim()
    return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.startsWith('*')
  })

  // Cyclomatic complexity: count decision points
  let cyclomatic = 1
  const decisionPatterns = [
    /\bif\b/, /\belse\s+if\b/, /\belif\b/, /\bwhile\b/, /\bfor\b/,
    /\bcase\b/, /\bcatch\b/, /\b\?\?/, /\?\s*\./, /&&/, /\|\|/,
    /\btry\b/, /\bswitch\b/,
  ]
  for (const line of codeLines) {
    for (const pat of decisionPatterns) {
      if (pat.test(line)) cyclomatic++
    }
  }

  // Cognitive complexity: nesting-aware scoring
  let cognitive = 0
  let currentNesting = 0
  let maxNesting = 0

  for (const line of lines) {
    const trimmed = line.trim()
    // Track nesting with braces
    const opens = (trimmed.match(/\{/g) ?? []).length
    const closes = (trimmed.match(/\}/g) ?? []).length

    // Python: track indentation level
    const indent = line.search(/\S/)
    if (indent > 0) {
      const nestLevel = Math.floor(indent / 2)
      if (nestLevel > currentNesting) currentNesting = nestLevel
    }

    currentNesting += opens - closes
    if (currentNesting < 0) currentNesting = 0
    if (currentNesting > maxNesting) maxNesting = currentNesting

    // Add cognitive weight for control flow + nesting depth
    if (/\b(if|else|while|for|switch|try|catch)\b/.test(trimmed)) {
      cognitive += 1 + currentNesting
    }
  }

  // Count functions
  const functionPatterns = [
    /\bfunction\s+\w+/, /\bconst\s+\w+\s*=\s*(?:async\s*)?\(/, /\b(?:async\s+)?function\b/,
    /\bdef\s+\w+/, /\bfn\s+\w+/, /\bfunc\s+\w+/, /\bpublic\s+\w+\s+\w+\s*\(/,
  ]
  let functionCount = 0
  for (const line of codeLines) {
    for (const pat of functionPatterns) {
      if (pat.test(line)) { functionCount++; break }
    }
  }

  const avgFunctionLength = functionCount > 0 ? Math.round(codeLines.length / functionCount) : codeLines.length

  return {
    cyclomatic,
    cognitive,
    linesOfCode: codeLines.length,
    functionCount,
    maxNestingDepth: maxNesting,
    avgFunctionLength,
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ANTI-PATTERN DETECTION
// ══════════════════════════════════════════════════════════════════════════════

interface AntiPatternRule {
  name: string
  severity: Severity
  pattern: RegExp
  description: string
  suggestion: string
  category: string
  languages: AnalysisLanguage[]
}

const ANTI_PATTERN_RULES: AntiPatternRule[] = [
  // ── JavaScript/TypeScript ──
  {
    name: 'any-type-abuse',
    severity: 'medium',
    pattern: /:\s*any\b/,
    description: 'Using "any" type defeats TypeScript\'s type safety.',
    suggestion: 'Use a specific type, "unknown", or a generic parameter instead.',
    category: 'type-safety',
    languages: ['typescript'],
  },
  {
    name: 'callback-hell',
    severity: 'medium',
    pattern: /\)\s*=>\s*\{[\s\S]*?\)\s*=>\s*\{[\s\S]*?\)\s*=>\s*\{/,
    description: 'Deeply nested callbacks make code hard to read and maintain.',
    suggestion: 'Use async/await or break into smaller functions.',
    category: 'readability',
    languages: ['javascript', 'typescript'],
  },
  {
    name: 'console-log-in-production',
    severity: 'low',
    pattern: /console\.(log|debug|info)\s*\(/,
    description: 'Console statements should not be in production code.',
    suggestion: 'Use a proper logging library or remove debug statements.',
    category: 'best-practice',
    languages: ['javascript', 'typescript'],
  },
  {
    name: 'var-usage',
    severity: 'low',
    pattern: /\bvar\s+\w+/,
    description: '"var" has function-scoped hoisting which can cause bugs.',
    suggestion: 'Use "const" or "let" instead of "var".',
    category: 'best-practice',
    languages: ['javascript', 'typescript'],
  },
  {
    name: 'missing-error-handling',
    severity: 'high',
    pattern: /\.catch\s*\(\s*\)/,
    description: 'Empty catch block swallows errors silently.',
    suggestion: 'Handle or log the error in the catch block.',
    category: 'error-handling',
    languages: ['javascript', 'typescript'],
  },
  {
    name: 'unhandled-promise',
    severity: 'high',
    pattern: /new\s+Promise\s*\(\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{(?:(?!\.catch|catch\s*\()[\s\S])*\}\s*\)/,
    description: 'Promise without .catch() or try/catch may have unhandled rejections.',
    suggestion: 'Always handle Promise rejections with .catch() or try/catch in async functions.',
    category: 'error-handling',
    languages: ['javascript', 'typescript'],
  },
  // ── Python ──
  {
    name: 'mutable-default-arg',
    severity: 'high',
    pattern: /def\s+\w+\s*\([^)]*=\s*(\[\]|\{\})/,
    description: 'Mutable default arguments are shared between function calls.',
    suggestion: 'Use None as default and create the mutable object inside the function.',
    category: 'bug-prone',
    languages: ['python'],
  },
  {
    name: 'bare-except',
    severity: 'high',
    pattern: /except\s*:/,
    description: 'Bare except catches all exceptions including SystemExit and KeyboardInterrupt.',
    suggestion: 'Catch specific exceptions: except ValueError: or except Exception:.',
    category: 'error-handling',
    languages: ['python'],
  },
  {
    name: 'global-state',
    severity: 'medium',
    pattern: /\bglobal\s+\w+/,
    description: 'Global state makes code harder to test and reason about.',
    suggestion: 'Use function parameters, class attributes, or dependency injection instead.',
    category: 'architecture',
    languages: ['python'],
  },
  // ── General ──
  {
    name: 'magic-number',
    severity: 'low',
    pattern: /(?:if|while|for|return|===?|!==?|[<>]=?)\s+\d{2,}/,
    description: 'Magic numbers make code hard to understand and maintain.',
    suggestion: 'Extract the number into a named constant with a descriptive name.',
    category: 'readability',
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp', 'go', 'rust', 'cpp', 'c'],
  },
  {
    name: 'todo-fixme',
    severity: 'info',
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX|WORKAROUND)\b/i,
    description: 'Code contains a TODO/FIXME marker that needs attention.',
    suggestion: 'Address the TODO/FIXME or create a tracked issue for it.',
    category: 'maintenance',
    languages: ['typescript', 'javascript', 'java', 'csharp', 'go', 'rust', 'cpp', 'c', 'swift', 'kotlin', 'scala'],
  },
  {
    name: 'empty-function',
    severity: 'low',
    pattern: /(?:function\s+\w+|=>\s*)\s*\(\s*\)\s*\{\s*\}/,
    description: 'Empty function body — likely a placeholder or mistake.',
    suggestion: 'Add implementation or a comment explaining why it\'s empty.',
    category: 'readability',
    languages: ['typescript', 'javascript', 'java', 'csharp', 'go', 'cpp', 'c'],
  },
]

/**
 * Detect anti-patterns in code.
 */
export function detectAntiPatterns(code: string, language: AnalysisLanguage): AntiPattern[] {
  const results: AntiPattern[] = []
  const lines = code.split('\n')

  for (const rule of ANTI_PATTERN_RULES) {
    if (!rule.languages.includes(language) && language !== 'unknown') continue

    for (let i = 0; i < lines.length; i++) {
      if (rule.pattern.test(lines[i])) {
        results.push({
          name: rule.name,
          severity: rule.severity,
          line: i + 1,
          description: rule.description,
          suggestion: rule.suggestion,
          category: rule.category,
        })
      }
    }
  }

  return results
}

// ══════════════════════════════════════════════════════════════════════════════
// DEPENDENCY MAPPING
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Extract import/export/dependency information from code.
 */
export function analyzeDependencies(code: string, language: AnalysisLanguage): DependencyInfo {
  const imports: string[] = []
  const exports: string[] = []
  const externalDeps: string[] = []

  const lines = code.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // TypeScript/JavaScript imports
    if (language === 'typescript' || language === 'javascript' || language === 'unknown') {
      const esImport = trimmed.match(/^import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/)
      if (esImport) {
        imports.push(esImport[1])
        if (!esImport[1].startsWith('.') && !esImport[1].startsWith('/')) {
          externalDeps.push(esImport[1].split('/')[0])
        }
      }
      const require = trimmed.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/)
      if (require) {
        imports.push(require[1])
        if (!require[1].startsWith('.') && !require[1].startsWith('/')) {
          externalDeps.push(require[1].split('/')[0])
        }
      }
      if (/^export\s+(default\s+)?(class|function|const|let|type|interface|enum)\s/.test(trimmed)) {
        const name = trimmed.match(/(?:class|function|const|let|type|interface|enum)\s+(\w+)/)
        if (name) exports.push(name[1])
      }
    }

    // Python imports
    if (language === 'python' || language === 'unknown') {
      const pyImport = trimmed.match(/^(?:from\s+(\S+)\s+)?import\s+(.+)/)
      if (pyImport) {
        const module = pyImport[1] || pyImport[2].split(',')[0].trim().split(' ')[0]
        imports.push(module)
        if (!module.startsWith('.')) externalDeps.push(module.split('.')[0])
      }
    }

    // Go imports
    if (language === 'go') {
      const goImport = trimmed.match(/^import\s+(?:\w+\s+)?["']([^"']+)["']/)
      if (goImport) {
        imports.push(goImport[1])
        if (goImport[1].includes('/')) externalDeps.push(goImport[1])
      }
    }

    // Java imports
    if (language === 'java') {
      const javaImport = trimmed.match(/^import\s+(?:static\s+)?([^;]+);/)
      if (javaImport) {
        imports.push(javaImport[1])
        externalDeps.push(javaImport[1].split('.').slice(0, 2).join('.'))
      }
    }

    // Rust imports
    if (language === 'rust') {
      const rustUse = trimmed.match(/^use\s+(\w+(?:::\w+)*)/)
      if (rustUse) {
        imports.push(rustUse[1])
        externalDeps.push(rustUse[1].split('::')[0])
      }
    }
  }

  // Deduplicate
  return {
    imports: [...new Set(imports)],
    exports: [...new Set(exports)],
    externalDeps: [...new Set(externalDeps)],
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CODE SMELL DETECTION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Detect code smells.
 */
export function detectCodeSmells(code: string, language: AnalysisLanguage): CodeSmell[] {
  const smells: CodeSmell[] = []
  const lines = code.split('\n')

  // Long functions (>50 lines)
  let funcStart = -1
  let funcName = ''
  let braceDepth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Detect function starts
    const funcMatch = trimmed.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=|def\s+(\w+)|fn\s+(\w+)|func\s+(\w+))/)
    if (funcMatch) {
      if (funcStart >= 0 && i - funcStart > 50) {
        smells.push({
          type: 'long-function',
          severity: 'medium',
          location: `function "${funcName}" (${funcStart + 1}-${i})`,
          line: funcStart + 1,
          description: `Function "${funcName}" is ${i - funcStart} lines long. Functions over 50 lines are hard to maintain.`,
        })
      }
      funcStart = i
      funcName = funcMatch[1] || funcMatch[2] || funcMatch[3] || funcMatch[4] || funcMatch[5] || 'anonymous'
      braceDepth = 0
    }

    // Deep nesting (>4 levels)
    braceDepth += (trimmed.match(/\{/g) ?? []).length - (trimmed.match(/\}/g) ?? []).length
    if (braceDepth > 4) {
      smells.push({
        type: 'deep-nesting',
        severity: 'medium',
        location: `line ${i + 1}`,
        line: i + 1,
        description: `Code is nested ${braceDepth} levels deep. Consider extracting into helper functions.`,
      })
    }
    if (braceDepth < 0) braceDepth = 0

    // Duplicate consecutive blank lines
    if (trimmed === '' && i > 0 && lines[i - 1].trim() === '' && i > 1 && lines[i - 2].trim() === '') {
      smells.push({
        type: 'excessive-blank-lines',
        severity: 'info',
        location: `line ${i + 1}`,
        line: i + 1,
        description: 'Multiple consecutive blank lines reduce readability.',
      })
    }

    // Very long lines (>120 chars)
    if (line.length > 120) {
      smells.push({
        type: 'long-line',
        severity: 'info',
        location: `line ${i + 1}`,
        line: i + 1,
        description: `Line is ${line.length} characters long. Lines over 120 chars are harder to read.`,
      })
    }
  }

  // Final function check
  if (funcStart >= 0 && lines.length - funcStart > 50) {
    smells.push({
      type: 'long-function',
      severity: 'medium',
      location: `function "${funcName}" (${funcStart + 1}-${lines.length})`,
      line: funcStart + 1,
      description: `Function "${funcName}" is ${lines.length - funcStart} lines long. Functions over 50 lines are hard to maintain.`,
    })
  }

  return smells
}

// ══════════════════════════════════════════════════════════════════════════════
// SECURITY SCANNING
// ══════════════════════════════════════════════════════════════════════════════

interface SecurityRule {
  type: string
  severity: Severity
  pattern: RegExp
  description: string
  cwe?: string
  owasp?: string
  languages: AnalysisLanguage[]
}

const SECURITY_RULES: SecurityRule[] = [
  {
    type: 'sql-injection',
    severity: 'critical',
    pattern: /(?:query|execute|exec)\s*\(\s*[`'"]\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP)\b[^'"]*\$\{/i,
    description: 'Possible SQL injection via string interpolation in query.',
    cwe: 'CWE-89',
    owasp: 'A03:2021-Injection',
    languages: ['javascript', 'typescript', 'python', 'java', 'php', 'ruby', 'csharp'],
  },
  {
    type: 'sql-injection-concat',
    severity: 'critical',
    pattern: /(?:query|execute|exec)\s*\(\s*['"][^'"]*['"]\s*\+\s*\w+/i,
    description: 'Possible SQL injection via string concatenation in query.',
    cwe: 'CWE-89',
    owasp: 'A03:2021-Injection',
    languages: ['javascript', 'typescript', 'python', 'java', 'php', 'ruby', 'csharp'],
  },
  {
    type: 'xss',
    severity: 'high',
    pattern: /innerHTML\s*=|\.html\s*\(\s*\w|document\.write\s*\(/,
    description: 'Possible XSS vulnerability via unescaped HTML injection.',
    cwe: 'CWE-79',
    owasp: 'A03:2021-Injection',
    languages: ['javascript', 'typescript'],
  },
  {
    type: 'hardcoded-secret',
    severity: 'critical',
    pattern: /(?:password|secret|api_?key|token|auth)\s*[:=]\s*['"][^'"]{8,}['"]/i,
    description: 'Possible hardcoded secret or credential in source code.',
    cwe: 'CWE-798',
    owasp: 'A07:2021-Identification and Authentication Failures',
    languages: ['typescript', 'javascript', 'python', 'java', 'go', 'rust', 'ruby', 'php', 'csharp', 'kotlin', 'swift'],
  },
  {
    type: 'eval-usage',
    severity: 'high',
    pattern: /\beval\s*\(/,
    description: 'Use of eval() allows arbitrary code execution.',
    cwe: 'CWE-95',
    owasp: 'A03:2021-Injection',
    languages: ['javascript', 'typescript', 'python', 'php', 'ruby'],
  },
  {
    type: 'unsafe-regex',
    severity: 'medium',
    pattern: /new\s+RegExp\s*\(\s*\w+/,
    description: 'Dynamic regex creation with user input may cause ReDoS.',
    cwe: 'CWE-1333',
    languages: ['javascript', 'typescript'],
  },
  {
    type: 'path-traversal',
    severity: 'high',
    pattern: /(?:readFile|writeFile|open|createReadStream)\s*\(\s*(?:\w+\s*\+|`[^`]*\$\{)/,
    description: 'Possible path traversal vulnerability via dynamic file path.',
    cwe: 'CWE-22',
    owasp: 'A01:2021-Broken Access Control',
    languages: ['javascript', 'typescript', 'python'],
  },
  {
    type: 'insecure-random',
    severity: 'medium',
    pattern: /Math\.random\s*\(\)/,
    description: 'Math.random() is not cryptographically secure. Use crypto.randomBytes() for security-sensitive operations.',
    cwe: 'CWE-330',
    languages: ['javascript', 'typescript'],
  },
  {
    type: 'command-injection',
    severity: 'critical',
    pattern: /(?:exec|spawn|execSync)\s*\(\s*(?:\w+\s*\+|`[^`]*\$\{)/,
    description: 'Possible command injection via dynamic command string.',
    cwe: 'CWE-78',
    owasp: 'A03:2021-Injection',
    languages: ['javascript', 'typescript', 'python', 'ruby', 'php'],
  },
  {
    type: 'unsafe-deserialization',
    severity: 'high',
    pattern: /JSON\.parse\s*\(\s*(?:req\.|request\.|body\.|params\.)/,
    description: 'Parsing untrusted input without validation may be unsafe.',
    cwe: 'CWE-502',
    owasp: 'A08:2021-Software and Data Integrity Failures',
    languages: ['javascript', 'typescript'],
  },
]

/**
 * Scan code for security issues.
 */
export function scanSecurity(
  code: string,
  language: AnalysisLanguage,
  level: 'basic' | 'standard' | 'strict' = 'standard',
): SecurityIssue[] {
  const issues: SecurityIssue[] = []
  const lines = code.split('\n')

  // Determine which severities to include based on level
  const minSeverities: Record<string, Severity[]> = {
    basic: ['critical'],
    standard: ['critical', 'high'],
    strict: ['critical', 'high', 'medium', 'low'],
  }
  const allowedSeverities = minSeverities[level]

  for (const rule of SECURITY_RULES) {
    if (!rule.languages.includes(language) && language !== 'unknown') continue
    if (!allowedSeverities.includes(rule.severity)) continue

    for (let i = 0; i < lines.length; i++) {
      if (rule.pattern.test(lines[i])) {
        issues.push({
          type: rule.type,
          severity: rule.severity,
          line: i + 1,
          description: rule.description,
          cwe: rule.cwe,
          owasp: rule.owasp,
        })
      }
    }
  }

  return issues
}

// ══════════════════════════════════════════════════════════════════════════════
// QUALITY SCORING
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate an overall quality score (0-100) from analysis results.
 */
export function calculateQualityScore(
  complexity: ComplexityMetrics,
  antiPatterns: AntiPattern[],
  codeSmells: CodeSmell[],
  securityIssues: SecurityIssue[],
): number {
  let score = 100

  // Complexity penalties
  if (complexity.cyclomatic > 20) score -= 15
  else if (complexity.cyclomatic > 10) score -= 8
  else if (complexity.cyclomatic > 5) score -= 3

  if (complexity.maxNestingDepth > 5) score -= 10
  else if (complexity.maxNestingDepth > 3) score -= 5

  if (complexity.avgFunctionLength > 50) score -= 10
  else if (complexity.avgFunctionLength > 30) score -= 5

  // Anti-pattern penalties
  const severityPenalty: Record<Severity, number> = {
    critical: 10, high: 7, medium: 4, low: 2, info: 1,
  }
  for (const ap of antiPatterns) {
    score -= severityPenalty[ap.severity]
  }

  // Code smell penalties (half weight)
  for (const smell of codeSmells) {
    score -= Math.ceil(severityPenalty[smell.severity] / 2)
  }

  // Security issue penalties (double weight)
  for (const issue of securityIssues) {
    score -= severityPenalty[issue.severity] * 2
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ANALYZER CLASS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * CodeAnalyzer — Complete static analysis engine.
 *
 * Analyzes code for language, complexity, anti-patterns, dependencies,
 * code smells, and security issues. Works fully offline.
 *
 * @example
 * ```ts
 * const analyzer = new CodeAnalyzer({ depth: 'standard', securityLevel: 'strict' })
 * const result = analyzer.analyze(code)
 * console.log(result.qualityScore)       // 0-100
 * console.log(result.securityIssues)     // SecurityIssue[]
 * console.log(result.antiPatterns)       // AntiPattern[]
 * ```
 */
export class CodeAnalyzer {
  private depth: AnalysisDepth
  private securityLevel: 'basic' | 'standard' | 'strict'

  constructor(options?: { depth?: AnalysisDepth; securityLevel?: 'basic' | 'standard' | 'strict' }) {
    this.depth = options?.depth ?? 'standard'
    this.securityLevel = options?.securityLevel ?? 'standard'
  }

  /**
   * Perform a complete analysis of the given code.
   */
  analyze(code: string, knownLanguage?: AnalysisLanguage): CodeAnalysis {
    // Step 1: Language detection
    const detected = detectLanguageAdvanced(code)
    const language = knownLanguage ?? detected.language
    const languageConfidence = knownLanguage ? 1.0 : detected.confidence

    // Step 2: Complexity analysis
    const complexity = analyzeComplexity(code)

    // Step 3: Anti-pattern detection
    const antiPatterns = this.depth === 'quick' ? [] : detectAntiPatterns(code, language)

    // Step 4: Dependency mapping
    const dependencies = analyzeDependencies(code, language)

    // Step 5: Code smell detection
    const codeSmells = this.depth === 'quick' ? [] : detectCodeSmells(code, language)

    // Step 6: Security scanning
    const securityIssues = scanSecurity(code, language, this.securityLevel)

    // Step 7: Quality score
    const qualityScore = calculateQualityScore(complexity, antiPatterns, codeSmells, securityIssues)

    // Step 8: Generate summary
    const summary = this.generateSummary(language, complexity, antiPatterns, codeSmells, securityIssues, qualityScore)

    return {
      language,
      languageConfidence,
      complexity,
      antiPatterns,
      dependencies,
      codeSmells,
      securityIssues,
      qualityScore,
      summary,
    }
  }

  /**
   * Quick language detection only.
   */
  detectLanguage(code: string): { language: AnalysisLanguage; confidence: number } {
    return detectLanguageAdvanced(code)
  }

  /**
   * Complexity analysis only.
   */
  getComplexity(code: string): ComplexityMetrics {
    return analyzeComplexity(code)
  }

  /**
   * Security scan only.
   */
  securityScan(code: string, language?: AnalysisLanguage): SecurityIssue[] {
    const lang = language ?? detectLanguageAdvanced(code).language
    return scanSecurity(code, lang, this.securityLevel)
  }

  /** Set analysis depth. */
  setDepth(depth: AnalysisDepth): void {
    this.depth = depth
  }

  /** Set security check level. */
  setSecurityLevel(level: 'basic' | 'standard' | 'strict'): void {
    this.securityLevel = level
  }

  private generateSummary(
    language: AnalysisLanguage,
    complexity: ComplexityMetrics,
    antiPatterns: AntiPattern[],
    codeSmells: CodeSmell[],
    securityIssues: SecurityIssue[],
    qualityScore: number,
  ): string {
    const parts: string[] = []

    parts.push(`Language: ${language}. ${complexity.linesOfCode} lines of code, ${complexity.functionCount} functions.`)

    if (qualityScore >= 80) parts.push(`Quality: excellent (${qualityScore}/100).`)
    else if (qualityScore >= 60) parts.push(`Quality: good (${qualityScore}/100).`)
    else if (qualityScore >= 40) parts.push(`Quality: needs improvement (${qualityScore}/100).`)
    else parts.push(`Quality: poor (${qualityScore}/100).`)

    if (securityIssues.length > 0) {
      const critical = securityIssues.filter(i => i.severity === 'critical').length
      parts.push(`⚠️ ${securityIssues.length} security issue(s)${critical > 0 ? ` (${critical} critical)` : ''}.`)
    }

    if (antiPatterns.length > 0) {
      parts.push(`Found ${antiPatterns.length} anti-pattern(s).`)
    }

    if (codeSmells.length > 0) {
      parts.push(`Found ${codeSmells.length} code smell(s).`)
    }

    if (complexity.cyclomatic > 10) {
      parts.push(`High cyclomatic complexity (${complexity.cyclomatic}).`)
    }

    return parts.join(' ')
  }
}
