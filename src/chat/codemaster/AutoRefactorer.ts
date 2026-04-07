/**
 * ♻️ AutoRefactorer — Automated Code Refactoring Engine
 *
 * Performs safe automated refactorings like GitHub Copilot agent:
 *   • Extract function/method from code block
 *   • Extract interface/type from class or object
 *   • Rename symbols across code
 *   • Inline simple variables/functions
 *   • Move function/class to another file
 *   • Convert function styles (arrow ↔ function declaration)
 *   • Add/remove async wrappers
 *   • Simplify conditional expressions
 *
 * Works fully offline — AST-lite pattern-based transformations.
 */

import type { AnalysisLanguage } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Supported refactoring operations. */
export type RefactorKind =
  | 'extract-function'
  | 'extract-interface'
  | 'rename-symbol'
  | 'inline-variable'
  | 'convert-to-arrow'
  | 'convert-to-function'
  | 'add-async'
  | 'remove-async'
  | 'simplify-conditional'
  | 'extract-constant'

/** Request for a refactoring operation. */
export interface RefactorRequest {
  /** The code to refactor. */
  code: string
  /** Type of refactoring. */
  kind: RefactorKind
  /** Language of the code. */
  language: AnalysisLanguage
  /** For extract: start line (1-based). */
  startLine?: number
  /** For extract: end line (1-based). */
  endLine?: number
  /** For rename: old name. */
  oldName?: string
  /** For rename: new name. */
  newName?: string
  /** For extract-function: function name. */
  functionName?: string
}

/** Result of a refactoring operation. */
export interface RefactorResult {
  /** Whether the refactoring succeeded. */
  success: boolean
  /** The refactored code (full file). */
  code: string
  /** Description of what was done. */
  description: string
  /** Unified diff of the change. */
  diff: string
  /** Any extracted code (for extract operations). */
  extractedCode?: string
  /** Warnings about the refactoring. */
  warnings: string[]
  /** Number of changes made. */
  changeCount: number
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function getLines(code: string): string[] {
  return code.split('\n')
}

function joinLines(lines: string[]): string {
  return lines.join('\n')
}

/** Generate a simple unified diff. */
function generateDiff(original: string, modified: string, label = 'file'): string {
  const origLines = getLines(original)
  const modLines = getLines(modified)
  const diffLines: string[] = [`--- a/${label}`, `+++ b/${label}`]

  let i = 0
  let j = 0
  while (i < origLines.length || j < modLines.length) {
    if (i < origLines.length && j < modLines.length && origLines[i] === modLines[j]) {
      i++
      j++
      continue
    }

    // Find a hunk
    const hunkStart = Math.max(0, i - 2)
    diffLines.push(`@@ -${hunkStart + 1} +${Math.max(0, j - 2) + 1} @@`)

    // Context before
    for (let k = hunkStart; k < i; k++) {
      diffLines.push(` ${origLines[k]}`)
    }

    // Removed lines
    while (i < origLines.length && (j >= modLines.length || origLines[i] !== modLines[j])) {
      diffLines.push(`-${origLines[i]}`)
      i++
      // Limit search window
      if (i - hunkStart > 30) break
    }

    // Added lines
    while (j < modLines.length && (i >= origLines.length || origLines[i] !== modLines[j])) {
      diffLines.push(`+${modLines[j]}`)
      j++
      if (j - hunkStart > 30) break
    }
  }

  return diffLines.join('\n')
}

/** Detect indentation of a line. */
function getIndent(line: string): string {
  const match = line.match(/^(\s*)/)
  return match ? match[1] : ''
}

/** Extract used variable names from a code block. */
function extractUsedVariables(codeBlock: string): string[] {
  const varPattern = /\b([a-zA-Z_$][\w$]*)\b/g
  const reserved = new Set([
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
    'return', 'const', 'let', 'var', 'function', 'class', 'new', 'this', 'true',
    'false', 'null', 'undefined', 'typeof', 'instanceof', 'void', 'delete',
    'throw', 'try', 'catch', 'finally', 'import', 'export', 'default', 'from',
    'async', 'await', 'yield', 'in', 'of', 'console', 'Math', 'JSON', 'Array',
    'Object', 'String', 'Number', 'Boolean', 'Error', 'Promise', 'Map', 'Set',
  ])

  const vars = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = varPattern.exec(codeBlock)) !== null) {
    if (!reserved.has(m[1]) && !/^\d/.test(m[1])) {
      vars.add(m[1])
    }
  }
  return [...vars]
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTO REFACTORER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * AutoRefactorer — Performs automated code refactoring operations.
 *
 * Pattern-based refactoring engine that understands common code structures
 * and can safely transform them.
 */
export class AutoRefactorer {

  /**
   * Execute a refactoring operation.
   */
  refactor(request: RefactorRequest): RefactorResult {
    switch (request.kind) {
      case 'extract-function':
        return this.extractFunction(request)
      case 'extract-interface':
        return this.extractInterface(request)
      case 'rename-symbol':
        return this.renameSymbol(request)
      case 'inline-variable':
        return this.inlineVariable(request)
      case 'convert-to-arrow':
        return this.convertToArrow(request)
      case 'convert-to-function':
        return this.convertToFunction(request)
      case 'simplify-conditional':
        return this.simplifyConditional(request)
      case 'extract-constant':
        return this.extractConstant(request)
      default:
        return {
          success: false,
          code: request.code,
          description: `Unsupported refactoring: ${request.kind}`,
          diff: '',
          warnings: [`Refactoring kind '${request.kind}' is not yet implemented`],
          changeCount: 0,
        }
    }
  }

  /**
   * Extract a code block into a new function.
   */
  extractFunction(request: RefactorRequest): RefactorResult {
    const { code, startLine, endLine, functionName = 'extractedFunction' } = request
    const warnings: string[] = []

    if (!startLine || !endLine || startLine > endLine) {
      return { success: false, code, description: 'Invalid line range', diff: '', warnings: ['startLine and endLine are required'], changeCount: 0 }
    }

    const lines = getLines(code)
    if (startLine < 1 || endLine > lines.length) {
      return { success: false, code, description: 'Line range out of bounds', diff: '', warnings: ['Line range exceeds file length'], changeCount: 0 }
    }

    const extractedLines = lines.slice(startLine - 1, endLine)
    const extractedBlock = extractedLines.map(l => l.trimStart()).join('\n')
    const indent = getIndent(extractedLines[0])

    // Detect parameters (used variables in the block)
    const usedVars = extractUsedVariables(extractedBlock)

    // Detect if the block has a return value
    const hasReturn = extractedBlock.includes('return ')

    // Build the new function
    const params = usedVars.slice(0, 5) // Limit params
    const paramStr = params.join(', ')
    const bodyLines = extractedLines.map(l => '  ' + l.trimStart())
    const newFn = `function ${functionName}(${paramStr}) {\n${bodyLines.join('\n')}\n}`

    // Replace the extracted block with a call
    const callStr = hasReturn
      ? `${indent}const result = ${functionName}(${paramStr})`
      : `${indent}${functionName}(${paramStr})`

    const newLines = [
      ...lines.slice(0, startLine - 1),
      callStr,
      ...lines.slice(endLine),
    ]

    // Add the function definition before the extraction point
    const insertPoint = Math.max(0, startLine - 2)
    newLines.splice(insertPoint, 0, '', newFn, '')

    const result = joinLines(newLines)
    const diff = generateDiff(code, result)

    if (params.length >= 5) {
      warnings.push('Extracted function has many parameters. Consider passing an object instead.')
    }

    return {
      success: true,
      code: result,
      description: `Extracted lines ${startLine}-${endLine} into function '${functionName}'`,
      diff,
      extractedCode: newFn,
      warnings,
      changeCount: 1,
    }
  }

  /**
   * Extract an interface from an object literal or class.
   */
  extractInterface(request: RefactorRequest): RefactorResult {
    const { code, startLine, endLine } = request
    const interfaceName = request.functionName ?? 'ExtractedInterface'

    if (!startLine || !endLine) {
      return { success: false, code, description: 'Invalid line range', diff: '', warnings: ['startLine and endLine required'], changeCount: 0 }
    }

    const lines = getLines(code)
    const block = lines.slice(startLine - 1, endLine).join('\n')

    // Extract property patterns: key: value or key?: value
    const propPattern = /(\w+)(\??):\s*(.+?)(?:;|,|\n|$)/g
    const props: string[] = []
    let m: RegExpExecArray | null
    while ((m = propPattern.exec(block)) !== null) {
      const name = m[1]
      const optional = m[2]
      const value = m[3].trim()

      // Infer type from value
      const type = this.inferTypeFromValue(value)
      props.push(`  ${name}${optional}: ${type}`)
    }

    if (props.length === 0) {
      return { success: false, code, description: 'No properties found to extract', diff: '', warnings: ['Could not detect properties'], changeCount: 0 }
    }

    const interfaceCode = `interface ${interfaceName} {\n${props.join('\n')}\n}`

    // Insert interface before the extraction point
    const newLines = [...lines]
    newLines.splice(startLine - 1, 0, interfaceCode, '')

    const result = joinLines(newLines)
    return {
      success: true,
      code: result,
      description: `Extracted interface '${interfaceName}' with ${props.length} properties`,
      diff: generateDiff(code, result),
      extractedCode: interfaceCode,
      warnings: [],
      changeCount: 1,
    }
  }

  /**
   * Rename a symbol throughout the code.
   */
  renameSymbol(request: RefactorRequest): RefactorResult {
    const { code, oldName, newName } = request

    if (!oldName || !newName) {
      return { success: false, code, description: 'oldName and newName required', diff: '', warnings: ['Missing rename parameters'], changeCount: 0 }
    }

    if (oldName === newName) {
      return { success: true, code, description: 'Names are identical', diff: '', warnings: [], changeCount: 0 }
    }

    // Use word-boundary matching to avoid partial replacements
    const pattern = new RegExp(`\\b${this.escapeRegex(oldName)}\\b`, 'g')
    const result = code.replace(pattern, newName)
    const changeCount = (code.match(pattern) ?? []).length

    if (changeCount === 0) {
      return { success: false, code, description: `Symbol '${oldName}' not found`, diff: '', warnings: [`'${oldName}' was not found in the code`], changeCount: 0 }
    }

    return {
      success: true,
      code: result,
      description: `Renamed '${oldName}' to '${newName}' (${changeCount} occurrences)`,
      diff: generateDiff(code, result),
      warnings: [],
      changeCount,
    }
  }

  /**
   * Inline a simple variable (replace references with the assigned value).
   */
  inlineVariable(request: RefactorRequest): RefactorResult {
    const { code, oldName } = request
    const warnings: string[] = []

    if (!oldName) {
      return { success: false, code, description: 'oldName required', diff: '', warnings: ['Specify the variable to inline'], changeCount: 0 }
    }

    // Find the variable declaration: const/let/var name = value
    const declPattern = new RegExp(`(?:const|let|var)\\s+${this.escapeRegex(oldName)}\\s*=\\s*(.+?)(?:;|$)`, 'm')
    const declMatch = code.match(declPattern)

    if (!declMatch) {
      return { success: false, code, description: `Variable '${oldName}' declaration not found`, diff: '', warnings: [`Could not find declaration of '${oldName}'`], changeCount: 0 }
    }

    const value = declMatch[1].trim()

    // Check if value is simple enough to inline (no side effects)
    if (value.includes('await ') || value.includes('new ') || value.includes('(') && !value.match(/^['"`\d[{]/)) {
      warnings.push('Value may have side effects. Inlining could change behavior.')
    }

    // Remove the declaration
    let result = code.replace(declPattern, '')

    // Replace all references
    const refPattern = new RegExp(`\\b${this.escapeRegex(oldName)}\\b`, 'g')
    const refCount = (result.match(refPattern) ?? []).length
    result = result.replace(refPattern, value)

    // Clean up empty lines from removal
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n')

    return {
      success: true,
      code: result,
      description: `Inlined variable '${oldName}' (${refCount} references replaced with value)`,
      diff: generateDiff(code, result),
      warnings,
      changeCount: refCount + 1,
    }
  }

  /**
   * Convert function declarations to arrow functions.
   */
  convertToArrow(request: RefactorRequest): RefactorResult {
    const { code } = request
    let result = code
    let count = 0

    // Pattern: function name(params) { ... }
    // Only convert simple single-statement functions
    const funcPattern = /function\s+(\w+)\s*\(([^)]*)\)\s*\{([^}]+)\}/g
    result = result.replace(funcPattern, (_match, name, params, body) => {
      const trimmedBody = body.trim()
      // Only convert if body is a single return statement or simple expression
      if (trimmedBody.startsWith('return ')) {
        const expr = trimmedBody.replace(/^return\s+/, '').replace(/;$/, '')
        count++
        return `const ${name} = (${params}) => ${expr}`
      }
      count++
      return `const ${name} = (${params}) => {${body}}`
    })

    if (count === 0) {
      return { success: false, code, description: 'No function declarations found to convert', diff: '', warnings: [], changeCount: 0 }
    }

    return {
      success: true,
      code: result,
      description: `Converted ${count} function declaration(s) to arrow functions`,
      diff: generateDiff(code, result),
      warnings: [],
      changeCount: count,
    }
  }

  /**
   * Convert arrow functions to function declarations.
   */
  convertToFunction(request: RefactorRequest): RefactorResult {
    const { code } = request
    let result = code
    let count = 0

    // Pattern: const name = (params) => { ... }
    const arrowPattern = /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{([^}]+)\}/g
    result = result.replace(arrowPattern, (_match, name, params, body) => {
      count++
      return `function ${name}(${params}) {${body}}`
    })

    // Pattern: const name = (params) => expression
    const shortArrowPattern = /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*([^{;\n]+)/g
    result = result.replace(shortArrowPattern, (_match, name, params, expr) => {
      count++
      return `function ${name}(${params}) { return ${expr.trim()} }`
    })

    if (count === 0) {
      return { success: false, code, description: 'No arrow functions found to convert', diff: '', warnings: [], changeCount: 0 }
    }

    return {
      success: true,
      code: result,
      description: `Converted ${count} arrow function(s) to function declarations`,
      diff: generateDiff(code, result),
      warnings: [],
      changeCount: count,
    }
  }

  /**
   * Simplify conditional expressions.
   */
  simplifyConditional(request: RefactorRequest): RefactorResult {
    const { code } = request
    let result = code
    let count = 0

    // Simplify: if (x) return true; else return false; → return x;
    result = result.replace(
      /if\s*\((.+?)\)\s*(?:return\s+true|return\s+!0)\s*;?\s*(?:else\s+)?(?:return\s+false|return\s+!1)\s*;?/g,
      (_match, cond) => {
        count++
        return `return ${cond}`
      },
    )

    // Simplify: x === true → x
    result = result.replace(/(\w+)\s*===\s*true\b/g, (_match, name) => {
      count++
      return name
    })

    // Simplify: x === false → !x
    result = result.replace(/(\w+)\s*===\s*false\b/g, (_match, name) => {
      count++
      return `!${name}`
    })

    // Simplify: x !== null && x !== undefined → x != null
    result = result.replace(
      /(\w+)\s*!==\s*null\s*&&\s*\1\s*!==\s*undefined/g,
      (_match, name) => {
        count++
        return `${name} != null`
      },
    )

    if (count === 0) {
      return { success: false, code, description: 'No simplifiable conditionals found', diff: '', warnings: [], changeCount: 0 }
    }

    return {
      success: true,
      code: result,
      description: `Simplified ${count} conditional expression(s)`,
      diff: generateDiff(code, result),
      warnings: [],
      changeCount: count,
    }
  }

  /**
   * Extract magic numbers/strings into named constants.
   */
  extractConstant(request: RefactorRequest): RefactorResult {
    const { code, oldName: valueLiteral, newName: constantName } = request
    const warnings: string[] = []

    if (!valueLiteral || !constantName) {
      return { success: false, code, description: 'value (oldName) and constantName (newName) required', diff: '', warnings: ['Specify the value and constant name'], changeCount: 0 }
    }

    // Escape for regex
    const escaped = this.escapeRegex(valueLiteral)
    const pattern = new RegExp(escaped, 'g')
    const count = (code.match(pattern) ?? []).length

    if (count === 0) {
      return { success: false, code, description: `Value '${valueLiteral}' not found`, diff: '', warnings: [], changeCount: 0 }
    }

    // Add constant declaration at the top of file (after imports)
    const lines = getLines(code)
    let insertLine = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('from ') || lines[i].startsWith('require(')) {
        insertLine = i + 1
      }
    }

    const constDecl = `const ${constantName} = ${valueLiteral}`
    const result = code.replace(pattern, constantName)
    const resultLines = getLines(result)
    resultLines.splice(insertLine, 0, '', constDecl)
    const finalCode = joinLines(resultLines)

    if (count > 5) {
      warnings.push(`Replaced ${count} occurrences. Verify all are semantically the same.`)
    }

    return {
      success: true,
      code: finalCode,
      description: `Extracted '${valueLiteral}' into constant '${constantName}' (${count} occurrences)`,
      diff: generateDiff(code, finalCode),
      warnings,
      changeCount: count,
    }
  }

  /**
   * Get all available refactoring kinds.
   */
  getAvailableRefactorings(): RefactorKind[] {
    return [
      'extract-function',
      'extract-interface',
      'rename-symbol',
      'inline-variable',
      'convert-to-arrow',
      'convert-to-function',
      'simplify-conditional',
      'extract-constant',
    ]
  }

  /**
   * Suggest applicable refactorings for a given code snippet.
   */
  suggestRefactorings(code: string, language: AnalysisLanguage): RefactorKind[] {
    const suggestions: RefactorKind[] = []

    // Check for function declarations that could be arrows
    if (/\bfunction\s+\w+/.test(code)) {
      suggestions.push('convert-to-arrow')
    }

    // Check for arrow functions that could be declarations
    if (/\bconst\s+\w+\s*=\s*\([^)]*\)\s*=>/.test(code)) {
      suggestions.push('convert-to-function')
    }

    // Check for simplifiable conditionals
    if (/===\s*true|===\s*false|!==\s*null\s*&&/.test(code)) {
      suggestions.push('simplify-conditional')
    }

    // Check for magic numbers
    if (/\b\d{2,}\b/.test(code) && language !== 'css') {
      suggestions.push('extract-constant')
    }

    // Long functions suggest extraction
    const lines = getLines(code)
    if (lines.length > 30) {
      suggestions.push('extract-function')
    }

    // Object literals suggest interface extraction
    if (/\{[^}]*\w+\s*:\s*.+,/.test(code) && (language === 'typescript' || language === 'javascript')) {
      suggestions.push('extract-interface')
    }

    return suggestions
  }

  // ── Private helpers ──

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  private inferTypeFromValue(value: string): string {
    if (value.startsWith("'") || value.startsWith('"') || value.startsWith('`')) return 'string'
    if (value === 'true' || value === 'false') return 'boolean'
    if (/^\d+(\.\d+)?$/.test(value)) return 'number'
    if (value.startsWith('[')) return 'unknown[]'
    if (value.startsWith('{')) return 'Record<string, unknown>'
    if (value === 'null') return 'null'
    if (value === 'undefined') return 'undefined'
    return 'unknown'
  }
}
