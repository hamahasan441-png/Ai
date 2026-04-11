/**
 * 🔒 TypeFlowAnalyzer — Type Safety & Data Flow Analysis
 *
 * Analyzes code for type-safety issues without a compiler:
 *   • Null/undefined flow tracking (nullable access without guards)
 *   • Type narrowing gaps (missing type guards after union checks)
 *   • Unsafe type assertions (as any, as unknown, type casting)
 *   • Optional chaining opportunities
 *   • Type inference gap detection
 *   • Generic constraint issues
 *
 * Works fully offline — pattern-based analysis, no TypeScript compiler needed.
 */

import type { AnalysisLanguage, Severity } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** A type safety issue detected in code. */
export interface TypeSafetyIssue {
  /** Type of issue. */
  type: TypeIssueType
  /** Severity. */
  severity: Severity
  /** Line number. */
  line: number
  /** End line. */
  endLine?: number
  /** Title. */
  title: string
  /** Description. */
  description: string
  /** Suggestion. */
  suggestion: string
  /** Confidence in the detection (0-1). */
  confidence: number
}

/** Categories of type safety issues. */
export type TypeIssueType =
  | 'nullable-access'
  | 'unsafe-assertion'
  | 'any-type-usage'
  | 'missing-type-guard'
  | 'optional-chaining-opportunity'
  | 'implicit-any'
  | 'unsafe-cast'
  | 'missing-null-check'
  | 'type-widening'
  | 'unused-type-narrowing'
  | 'non-exhaustive-switch'
  | 'unsafe-index-access'

/** Result of type flow analysis. */
export interface TypeFlowAnalysis {
  /** All type safety issues. */
  issues: TypeSafetyIssue[]
  /** Type safety score (0-100). */
  safetyScore: number
  /** Nullable variables tracked. */
  nullableVars: NullableVariable[]
  /** Type assertion locations. */
  assertions: TypeAssertion[]
  /** Summary. */
  summary: string
}

/** Tracked nullable variable. */
export interface NullableVariable {
  /** Variable name. */
  name: string
  /** Line where declared/assigned. */
  declaredLine: number
  /** Lines where accessed without null check. */
  unsafeAccessLines: number[]
  /** Lines where properly guarded. */
  guardedLines: number[]
}

/** Tracked type assertion. */
export interface TypeAssertion {
  /** Line number. */
  line: number
  /** The assertion expression. */
  expression: string
  /** Whether it's safe (to concrete type) or unsafe (to any). */
  safe: boolean
}

// ══════════════════════════════════════════════════════════════════════════════
// TYPE FLOW ANALYZER
// ══════════════════════════════════════════════════════════════════════════════

export class TypeFlowAnalyzer {
  private language: AnalysisLanguage

  constructor(language: AnalysisLanguage = 'typescript') {
    this.language = language
  }

  /** Set analysis language. */
  setLanguage(lang: AnalysisLanguage): void {
    this.language = lang
  }

  /** Analyze code for type safety issues. */
  analyze(code: string): TypeFlowAnalysis {
    if (!code || !code.trim()) {
      return {
        issues: [],
        safetyScore: 100,
        nullableVars: [],
        assertions: [],
        summary: 'No code to analyze.',
      }
    }

    const lines = code.split('\n')
    const issues: TypeSafetyIssue[] = []
    const nullableVars: NullableVariable[] = []
    const assertions: TypeAssertion[] = []

    if (this.language === 'typescript' || this.language === 'javascript') {
      this.detectAnyUsage(lines, issues)
      this.detectUnsafeAssertions(lines, issues, assertions)
      this.detectNullableAccess(lines, issues, nullableVars)
      this.detectOptionalChainingOpportunities(lines, issues)
      this.detectImplicitAny(lines, issues)
      this.detectNonExhaustiveSwitch(lines, issues)
      this.detectUnsafeIndexAccess(lines, issues)
      this.detectTypeWidening(lines, issues)
    } else if (this.language === 'python') {
      this.detectPythonTypeIssues(lines, issues)
    }

    const safetyScore = this.calculateScore(issues)
    const summary = this.generateSummary(issues, safetyScore)

    return { issues, safetyScore, nullableVars, assertions, summary }
  }

  // ── DETECTORS (TypeScript/JavaScript) ──────────────────────────────────

  private detectAnyUsage(lines: string[], issues: TypeSafetyIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Skip comments
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue

      // Explicit : any annotation
      if (/:\s*any\b/.test(line) && !/\/\//.test(line.split(':')[0] || '')) {
        issues.push({
          type: 'any-type-usage',
          severity: 'medium',
          line: i + 1,
          title: 'Explicit `any` type usage',
          description:
            'Using `any` disables type checking for this variable, allowing type-unsafe operations.',
          suggestion:
            'Use a specific type, `unknown` for safe dynamic types, or a generic constraint.',
          confidence: 0.95,
        })
      }

      // Function parameter without type (in .ts files)
      if (this.language === 'typescript') {
        const paramMatch = line.match(
          /(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:async\s+)?\()([^)]*)\)/,
        )
        if (paramMatch) {
          const params = paramMatch[1]
          if (params && params.trim() && !/:\s*\w/.test(params) && !/\.\.\.\w/.test(params)) {
            // Has params but no types
            issues.push({
              type: 'implicit-any',
              severity: 'low',
              line: i + 1,
              title: 'Function parameters without type annotations',
              description:
                'Parameters without type annotations are implicitly `any` when noImplicitAny is off.',
              suggestion: 'Add explicit type annotations to function parameters.',
              confidence: 0.7,
            })
          }
        }
      }
    }
  }

  private detectUnsafeAssertions(
    lines: string[],
    issues: TypeSafetyIssue[],
    assertions: TypeAssertion[],
  ): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

      // `as any`
      if (/\bas\s+any\b/.test(line)) {
        assertions.push({ line: i + 1, expression: 'as any', safe: false })
        issues.push({
          type: 'unsafe-assertion',
          severity: 'high',
          line: i + 1,
          title: 'Unsafe `as any` assertion',
          description: '`as any` bypasses all type checking. This can hide bugs and type errors.',
          suggestion:
            'Use `as unknown as TargetType` for explicit unsafe casts, or fix the types properly.',
          confidence: 0.98,
        })
      }

      // `as unknown as X` — double assertion
      if (/\bas\s+unknown\s+as\s+\w/.test(line)) {
        assertions.push({ line: i + 1, expression: 'as unknown as ...', safe: false })
        issues.push({
          type: 'unsafe-cast',
          severity: 'medium',
          line: i + 1,
          title: 'Double type assertion (as unknown as T)',
          description:
            'Double assertion through `unknown` forces a type conversion that may be incorrect at runtime.',
          suggestion: 'Consider using a type guard function or runtime validation instead.',
          confidence: 0.9,
        })
      }

      // Non-null assertion `!`
      if (/\w+!\s*[.[]/.test(line) && !/!==/.test(line) && !/!=/.test(line)) {
        assertions.push({ line: i + 1, expression: '! (non-null assertion)', safe: false })
        issues.push({
          type: 'unsafe-assertion',
          severity: 'medium',
          line: i + 1,
          title: 'Non-null assertion operator (!)',
          description:
            'Non-null assertion `!` tells TypeScript to trust that a value is not null/undefined, but provides no runtime safety.',
          suggestion: 'Use optional chaining `?.` or add a proper null check.',
          confidence: 0.8,
        })
      }

      // Safe assertion — `as ConcreteType` (not any/unknown)
      const safeAssertionMatch = line.match(/\bas\s+([A-Z]\w+)/)
      if (safeAssertionMatch && !/\bas\s+(?:any|unknown)\b/.test(line)) {
        assertions.push({ line: i + 1, expression: `as ${safeAssertionMatch[1]}`, safe: true })
      }
    }
  }

  private detectNullableAccess(
    lines: string[],
    issues: TypeSafetyIssue[],
    nullableVars: NullableVariable[],
  ): void {
    const nullableDeclarations = new Map<string, number>()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

      // Track variables that could be null/undefined
      // Pattern: let x = something | undefined | null
      const nullDeclMatch = line.match(
        /(?:let|var)\s+(\w+)\s*(?::\s*[^=]*(?:\|\s*(?:null|undefined)))?(?:\s*=\s*(?:null|undefined))?/,
      )
      if (nullDeclMatch) {
        const varName = nullDeclMatch[1]
        if (/\|\s*(?:null|undefined)/.test(line) || /=\s*(?:null|undefined)/.test(line)) {
          nullableDeclarations.set(varName, i + 1)
        }
      }

      // Track .find() which returns T | undefined
      const findMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*\w+\.find\s*\(/)
      if (findMatch) {
        nullableDeclarations.set(findMatch[1], i + 1)
      }

      // Track function return that could be nullable
      const nullReturnMatch = line.match(
        /(?:const|let|var)\s+(\w+)\s*=\s*(?:\w+\.)?(?:getElementById|querySelector|get|find|pop|shift)\s*\(/,
      )
      if (nullReturnMatch) {
        nullableDeclarations.set(nullReturnMatch[1], i + 1)
      }
    }

    // Second pass: find unsafe accesses
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

      for (const [varName, declLine] of nullableDeclarations) {
        // Check if this line accesses the nullable var without a guard
        const accessPattern = new RegExp(`\\b${varName}\\s*\\.\\w`)
        if (accessPattern.test(line) && i + 1 !== declLine) {
          // Check if there's a null check above
          const contextBefore = lines.slice(Math.max(0, i - 3), i).join('\n')
          const hasNullCheck = new RegExp(
            `(?:if\\s*\\(\\s*${varName}\\b|${varName}\\s*(?:!==?|===?)\\s*(?:null|undefined)|${varName}\\s*\\?\\.)`,
          ).test(contextBefore + '\n' + line)

          if (!hasNullCheck) {
            // Find or create nullable var entry
            let entry = nullableVars.find(v => v.name === varName)
            if (!entry) {
              entry = {
                name: varName,
                declaredLine: declLine,
                unsafeAccessLines: [],
                guardedLines: [],
              }
              nullableVars.push(entry)
            }
            entry.unsafeAccessLines.push(i + 1)

            issues.push({
              type: 'nullable-access',
              severity: 'high',
              line: i + 1,
              title: `Nullable '${varName}' accessed without null check`,
              description: `'${varName}' (declared line ${declLine}) could be null/undefined but is accessed without a guard.`,
              suggestion: `Add a null check: \`if (${varName}) { ... }\` or use optional chaining: \`${varName}?.property\`.`,
              confidence: 0.75,
            })
          } else {
            let entry = nullableVars.find(v => v.name === varName)
            if (!entry) {
              entry = {
                name: varName,
                declaredLine: declLine,
                unsafeAccessLines: [],
                guardedLines: [],
              }
              nullableVars.push(entry)
            }
            entry.guardedLines.push(i + 1)
          }
        }
      }
    }
  }

  private detectOptionalChainingOpportunities(lines: string[], issues: TypeSafetyIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

      // Pattern: x && x.y && x.y.z → x?.y?.z
      if (/\w+\s*&&\s*\w+\.\w+\s*&&\s*\w+\.\w+\.\w+/.test(line)) {
        issues.push({
          type: 'optional-chaining-opportunity',
          severity: 'info',
          line: i + 1,
          title: 'Optional chaining opportunity',
          description: 'Manual null-checking chain can be simplified with optional chaining.',
          suggestion: 'Replace `a && a.b && a.b.c` with `a?.b?.c`.',
          confidence: 0.9,
        })
      }

      // Pattern: if (x !== null && x !== undefined) → x != null or optional chaining
      if (/\w+\s*!==?\s*null\s*&&\s*\w+\s*!==?\s*undefined/.test(line)) {
        issues.push({
          type: 'optional-chaining-opportunity',
          severity: 'info',
          line: i + 1,
          title: 'Simplify null/undefined check',
          description: 'Separate null and undefined checks can be simplified.',
          suggestion: 'Use `x != null` (checks both) or optional chaining `x?.prop`.',
          confidence: 0.85,
        })
      }
    }
  }

  private detectImplicitAny(lines: string[], issues: TypeSafetyIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

      // Empty array literal without type annotation
      if (
        /(?:const|let|var)\s+\w+\s*=\s*\[\s*\]/.test(line) &&
        !/:/.test(line.split('=')[0] || '')
      ) {
        issues.push({
          type: 'implicit-any',
          severity: 'low',
          line: i + 1,
          title: 'Empty array without type annotation',
          description:
            'Empty array literal `[]` without a type annotation may be inferred as `any[]`.',
          suggestion:
            'Add a type annotation: `const items: string[] = []` or `const items = [] as string[]`.',
          confidence: 0.7,
        })
      }

      // JSON.parse without type assertion
      if (
        /JSON\.parse\s*\(/.test(line) &&
        !/:\s*\w/.test(line.split('=')[0] || '') &&
        !/\bas\s+/.test(line)
      ) {
        issues.push({
          type: 'implicit-any',
          severity: 'medium',
          line: i + 1,
          title: 'JSON.parse returns `any`',
          description:
            'JSON.parse() returns `any`. Without a type assertion or validation, type safety is lost.',
          suggestion:
            'Add type assertion: `JSON.parse(str) as MyType` or validate with a schema library (Zod, io-ts).',
          confidence: 0.9,
        })
      }
    }
  }

  private detectNonExhaustiveSwitch(lines: string[], issues: TypeSafetyIssue[]): void {
    let inSwitch = false
    let switchLine = 0
    let caseCount = 0
    let hasDefault = false
    let braceDepth = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (/\bswitch\s*\(/.test(line)) {
        inSwitch = true
        switchLine = i + 1
        caseCount = 0
        hasDefault = false
        braceDepth = 0
      }

      if (inSwitch) {
        braceDepth += (line.match(/\{/g) || []).length
        braceDepth -= (line.match(/\}/g) || []).length

        if (/\bcase\s+/.test(line)) caseCount++
        if (/\bdefault\s*:/.test(line)) hasDefault = true

        if (braceDepth <= 0 && i > switchLine) {
          if (!hasDefault && caseCount > 0) {
            issues.push({
              type: 'non-exhaustive-switch',
              severity: 'medium',
              line: switchLine,
              title: 'Switch without default case',
              description: `Switch statement (${caseCount} cases) has no default case. Unhandled values will silently fall through.`,
              suggestion:
                'Add a `default:` case, or use `never` type assertion for exhaustiveness: `const _exhaustive: never = value`.',
              confidence: 0.8,
            })
          }
          inSwitch = false
        }
      }
    }
  }

  private detectUnsafeIndexAccess(lines: string[], issues: TypeSafetyIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

      // Array access with variable index without bounds check
      const indexAccessMatch = line.match(/(\w+)\[(\w+)\]/)
      if (indexAccessMatch) {
        const arrayName = indexAccessMatch[1]
        const indexVar = indexAccessMatch[2]

        // Skip object/map-like access (string keys) and common safe patterns
        if (/^[0-9]+$/.test(indexVar)) continue // literal index
        if (['i', 'j', 'k', 'idx', 'index'].includes(indexVar)) {
          // Check if there's a for loop with length check nearby
          const contextBefore = lines.slice(Math.max(0, i - 5), i).join('\n')
          if (/\.length/.test(contextBefore)) continue
        }

        // Check if there's a bounds check nearby
        const context = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 2)).join('\n')
        if (new RegExp(`${arrayName}\\.length`).test(context)) continue
        if (new RegExp(`${indexVar}\\s*<`).test(context)) continue

        issues.push({
          type: 'unsafe-index-access',
          severity: 'low',
          line: i + 1,
          title: `Potentially unsafe index access: ${arrayName}[${indexVar}]`,
          description: 'Array index access without bounds checking could return undefined.',
          suggestion: `Check bounds first: \`if (${indexVar} < ${arrayName}.length)\` or use \`.at(${indexVar})\` with null check.`,
          confidence: 0.5,
        })
      }
    }
  }

  private detectTypeWidening(lines: string[], issues: TypeSafetyIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

      // let x = "string" → type widens to string (not literal)
      if (/\blet\s+\w+\s*=\s*['"`]/.test(line)) {
        // Only flag if the value looks like it could be a union discriminator
        if (
          /\blet\s+\w+\s*=\s*['"](?:success|error|pending|loading|idle|active|inactive)['"]/.test(
            line,
          )
        ) {
          issues.push({
            type: 'type-widening',
            severity: 'info',
            line: i + 1,
            title: 'Possible unintended type widening with `let`',
            description:
              '`let` declarations widen string literal types to `string`. If this is a status/discriminator value, use `const` or `as const`.',
            suggestion:
              'Use `const` for constant values, or add `as const` for literal type preservation.',
            confidence: 0.6,
          })
        }
      }
    }
  }

  // ── PYTHON ─────────────────────────────────────────────────────────────

  private detectPythonTypeIssues(lines: string[], issues: TypeSafetyIssue[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith('#')) continue

      // No type hints on function parameters
      if (
        /\bdef\s+\w+\s*\([^)]*\)/.test(line) &&
        !/:\s*\w/.test(line.split(')')[0] || '') &&
        !/self|cls/.test(line.split(',').join(' '))
      ) {
        const params = line.match(/\(([^)]*)\)/)
        if (
          params &&
          params[1].trim() &&
          params[1].trim() !== 'self' &&
          params[1].trim() !== 'cls'
        ) {
          issues.push({
            type: 'implicit-any',
            severity: 'low',
            line: i + 1,
            title: 'Function parameters without type hints',
            description:
              'Python function parameters without type hints lose static analysis benefits.',
            suggestion: 'Add type hints: `def func(name: str, age: int) -> bool:`.',
            confidence: 0.7,
          })
        }
      }

      // No return type hint
      if (/\bdef\s+\w+\s*\([^)]*\)\s*:/.test(line) && !/->/.test(line)) {
        issues.push({
          type: 'implicit-any',
          severity: 'info',
          line: i + 1,
          title: 'Missing return type hint',
          description: 'Function lacks a return type hint (`-> Type`).',
          suggestion: 'Add return type: `def func(x: int) -> str:`.',
          confidence: 0.6,
        })
      }

      // isinstance check without proper narrowing
      if (/\bisinstance\s*\(/.test(line) && !/\bif\b/.test(line)) {
        issues.push({
          type: 'unused-type-narrowing',
          severity: 'info',
          line: i + 1,
          title: 'isinstance() not used as type guard',
          description:
            'isinstance() call not in an if-statement, so type narrowing does not occur.',
          suggestion: 'Use isinstance() in an if-statement for proper type narrowing.',
          confidence: 0.6,
        })
      }
    }
  }

  // ── SCORING ────────────────────────────────────────────────────────────

  private calculateScore(issues: TypeSafetyIssue[]): number {
    let score = 100
    for (const issue of issues) {
      const weight = issue.confidence
      switch (issue.severity) {
        case 'critical':
          score -= 20 * weight
          break
        case 'high':
          score -= 12 * weight
          break
        case 'medium':
          score -= 6 * weight
          break
        case 'low':
          score -= 3 * weight
          break
        case 'info':
          score -= 1 * weight
          break
      }
    }
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private generateSummary(issues: TypeSafetyIssue[], score: number): string {
    if (issues.length === 0) {
      return `No type safety issues detected. Score: ${score}/100.`
    }
    const high = issues.filter(i => i.severity === 'critical' || i.severity === 'high').length
    const medium = issues.filter(i => i.severity === 'medium').length
    return `Found ${issues.length} type safety issue(s): ${high} high-severity, ${medium} medium. Type safety score: ${score}/100.`
  }
}
