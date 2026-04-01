/**
 * 🔧 CodeFixer — Automated Code Fixing Engine
 *
 * Generates and applies fixes for detected issues:
 *   • Fix generation — creates minimal, correct diffs
 *   • Multi-file patching — applies fixes across files
 *   • Conflict detection — identifies overlapping fixes
 *   • Rollback support — stores original state for undo
 *   • Validation — basic syntax checking after fix
 *
 * Works fully offline with pattern-based fixes.
 */

import type {
  CodeFix,
  FixResult,
  ReviewFinding,
  AnalysisLanguage,
  Severity,
} from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// FIX PATTERNS
// ══════════════════════════════════════════════════════════════════════════════

interface FixPattern {
  id: string
  name: string
  description: string
  /** Pattern to match in the code. */
  match: RegExp
  /** Function to generate the fix. */
  fix: (line: string, match: RegExpMatchArray) => string
  /** Languages this fix applies to. */
  languages: AnalysisLanguage[]
}

const FIX_PATTERNS: FixPattern[] = [
  // ── JavaScript/TypeScript fixes ──
  {
    id: 'fix-loose-equality',
    name: 'Fix loose equality',
    description: 'Replace == with === for strict comparison.',
    match: /([^!=!])={2}([^=])/g,
    fix: (line, m) => line.replace(/([^!=!])={2}([^=])/g, '$1===$2'),
    languages: ['javascript', 'typescript'],
  },
  {
    id: 'fix-loose-inequality',
    name: 'Fix loose inequality',
    description: 'Replace != with !== for strict comparison.',
    match: /([^!])!={1}([^=])/g,
    fix: (line, m) => line.replace(/([^!])!={1}([^=])/g, '$1!==$2'),
    languages: ['javascript', 'typescript'],
  },
  {
    id: 'fix-var-to-const',
    name: 'Replace var with const',
    description: 'Replace var declarations with const for block scoping.',
    match: /\bvar\s+(\w+)\s*=/,
    fix: (line, m) => line.replace(/\bvar\s+/, 'const '),
    languages: ['javascript', 'typescript'],
  },
  {
    id: 'fix-empty-catch',
    name: 'Add error logging to empty catch',
    description: 'Add console.error to empty catch blocks.',
    match: /catch\s*\((\w+)\)\s*\{\s*\}/,
    fix: (line, m) => line.replace(
      /catch\s*\((\w+)\)\s*\{\s*\}/,
      `catch (${m[1]}) { console.error(${m[1]}) }`,
    ),
    languages: ['javascript', 'typescript'],
  },
  {
    id: 'fix-remove-console-log',
    name: 'Remove console.log',
    description: 'Remove debug console.log statements.',
    match: /^\s*console\.log\s*\([^)]*\)\s*;?\s*$/,
    fix: () => '',
    languages: ['javascript', 'typescript'],
  },
  {
    id: 'fix-add-semicolon',
    name: 'Add missing semicolon',
    description: 'Add semicolons to statements missing them.',
    match: /^(\s*(?:const|let|var|return|throw|break|continue)\s+.+[^;{}\s,])\s*$/,
    fix: (line, m) => `${m[1]};`,
    languages: ['javascript', 'typescript'],
  },
  // ── Python fixes ──
  {
    id: 'fix-bare-except',
    name: 'Fix bare except clause',
    description: 'Replace bare except: with except Exception:.',
    match: /^(\s*)except\s*:/,
    fix: (line, m) => `${m[1]}except Exception:`,
    languages: ['python'],
  },
  {
    id: 'fix-mutable-default',
    name: 'Fix mutable default argument',
    description: 'Replace mutable default with None pattern.',
    match: /def\s+(\w+)\s*\(([^)]*?)(\w+)\s*=\s*\[\]/,
    fix: (line, m) => line.replace(
      /(\w+)\s*=\s*\[\]/,
      `${m[3]}=None`,
    ),
    languages: ['python'],
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// MAIN FIXER CLASS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * CodeFixer — Automated code fixing engine.
 *
 * @example
 * ```ts
 * const fixer = new CodeFixer()
 * const result = fixer.fixCode(code, 'typescript')
 * console.log(result.summary)  // { applied: 3, skipped: 1, failed: 0 }
 * console.log(result.fixes)    // CodeFix[]
 * ```
 */
export class CodeFixer {
  private rollbackState: Map<string, string> = new Map()

  /**
   * Auto-fix code based on detected patterns.
   *
   * @param code The code to fix.
   * @param language Programming language.
   * @param findings Optional specific findings to fix (if provided, only matching fixes are applied).
   */
  fixCode(
    code: string,
    language: AnalysisLanguage,
    findings?: ReviewFinding[],
  ): FixResult {
    const lines = code.split('\n')
    const fixes: CodeFix[] = []
    const fixedLines = [...lines]
    let applied = 0
    let skipped = 0
    let failed = 0

    // Store rollback state
    this.rollbackState.set('__code__', code)

    // Apply fix patterns
    for (const pattern of FIX_PATTERNS) {
      if (!pattern.languages.includes(language) && language !== 'unknown') continue

      for (let i = 0; i < fixedLines.length; i++) {
        const line = fixedLines[i]
        const match = line.match(pattern.match)

        if (!match) continue

        // If findings filter is provided, check relevance
        if (findings && !this.isRelevantFix(pattern, findings, i + 1)) {
          skipped++
          continue
        }

        try {
          const fixed = pattern.fix(line, match)
          const isChanged = fixed !== line

          if (isChanged) {
            const original = line
            fixedLines[i] = fixed

            const diff = this.generateDiff(original, fixed, i + 1)

            fixes.push({
              findingId: pattern.id,
              original: original.trim(),
              fixed: fixed.trim(),
              diff,
              applied: true,
              validated: this.validateFix(fixedLines.join('\n'), language),
            })

            applied++
          }
        } catch {
          failed++
          fixes.push({
            findingId: pattern.id,
            original: line.trim(),
            fixed: line.trim(),
            diff: '',
            applied: false,
            validated: false,
          })
        }
      }
    }

    // Remove empty lines caused by deletions (e.g., console.log removal)
    const cleanedLines = fixedLines.filter(l => l !== '' || lines[fixedLines.indexOf(l)] !== '')

    return {
      fixes,
      rollbackState: new Map(this.rollbackState),
      summary: { applied, skipped, failed },
    }
  }

  /**
   * Apply a specific fix to code.
   *
   * @param code The original code.
   * @param fix The fix to apply.
   */
  applyFix(code: string, fix: CodeFix): string {
    if (!fix.original || !fix.fixed) return code
    return code.replace(fix.original, fix.fixed)
  }

  /**
   * Apply multiple fixes to code (in order).
   * Detects and skips conflicting fixes.
   */
  applyFixes(code: string, fixes: CodeFix[]): { code: string; applied: CodeFix[]; skipped: CodeFix[] } {
    this.rollbackState.set('__code__', code)

    let current = code
    const applied: CodeFix[] = []
    const skippedFixes: CodeFix[] = []

    for (const fix of fixes) {
      if (!fix.original) {
        skippedFixes.push(fix)
        continue
      }

      if (current.includes(fix.original)) {
        current = current.replace(fix.original, fix.fixed)
        applied.push({ ...fix, applied: true })
      } else {
        // Conflict: the code has already been modified by a previous fix
        skippedFixes.push({ ...fix, applied: false })
      }
    }

    return { code: current, applied, skipped: skippedFixes }
  }

  /**
   * Get the original code before fixes were applied.
   */
  getRollbackCode(): string | undefined {
    return this.rollbackState.get('__code__')
  }

  /**
   * Rollback all fixes (restore original code).
   */
  rollback(): string | undefined {
    return this.rollbackState.get('__code__')
  }

  /**
   * Clear rollback state.
   */
  clearRollback(): void {
    this.rollbackState.clear()
  }

  /**
   * Generate a unified diff between original and fixed lines.
   */
  generateUnifiedDiff(original: string, fixed: string, filePath = 'code'): string {
    const origLines = original.split('\n')
    const fixedLines = fixed.split('\n')
    const diffLines: string[] = [
      `--- a/${filePath}`,
      `+++ b/${filePath}`,
    ]

    let i = 0
    let j = 0
    while (i < origLines.length || j < fixedLines.length) {
      if (i < origLines.length && j < fixedLines.length && origLines[i] === fixedLines[j]) {
        diffLines.push(` ${origLines[i]}`)
        i++
        j++
      } else {
        // Find the range of differences
        if (i < origLines.length && (j >= fixedLines.length || origLines[i] !== fixedLines[j])) {
          diffLines.push(`-${origLines[i]}`)
          i++
        }
        if (j < fixedLines.length && (i >= origLines.length || origLines[i] !== fixedLines[j])) {
          diffLines.push(`+${fixedLines[j]}`)
          j++
        }
      }
    }

    return diffLines.join('\n')
  }

  // ── Private helpers ──

  private isRelevantFix(pattern: FixPattern, findings: ReviewFinding[], line: number): boolean {
    return findings.some(f => f.line === line && f.autoFixable)
  }

  private generateDiff(original: string, fixed: string, lineNum: number): string {
    return `@@ -${lineNum},1 +${lineNum},1 @@\n-${original}\n+${fixed}`
  }

  private validateFix(code: string, language: AnalysisLanguage): boolean {
    // Basic syntax validation — check for balanced brackets/parens
    const brackets: Record<string, string> = { '(': ')', '[': ']', '{': '}' }
    const stack: string[] = []
    let inString = false
    let stringChar = ''

    for (const char of code) {
      if (inString) {
        if (char === stringChar) inString = false
        continue
      }

      if (char === '"' || char === "'" || char === '`') {
        inString = true
        stringChar = char
        continue
      }

      if (brackets[char]) {
        stack.push(brackets[char])
      } else if (char === ')' || char === ']' || char === '}') {
        if (stack.length === 0 || stack.pop() !== char) return false
      }
    }

    return stack.length === 0
  }
}
