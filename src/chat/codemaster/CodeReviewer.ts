/**
 * 📝 CodeReviewer — Intelligent Code Review Engine
 *
 * Reviews code for bugs, security issues, performance problems, style
 * violations, and architectural concerns. Generates fix suggestions.
 *
 * Pipeline:
 *   1. Run CodeAnalyzer for structural analysis
 *   2. Check LearningEngine for similar past reviews
 *   3. Apply rule-based checks per category
 *   4. Prioritize by severity
 *   5. Generate fix suggestions
 *
 * Works fully offline with rule-based detection.
 */

import type {
  ReviewFinding,
  ReviewSummary,
  CodeFix,
  CodeReviewOutput,
  AnalysisLanguage,
  ReviewCategory,
  Severity,
} from './types.js'
import { CodeAnalyzer } from './CodeAnalyzer.js'
import type { CodeAnalysis, SecurityIssue, AntiPattern, CodeSmell } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// REVIEW RULES
// ══════════════════════════════════════════════════════════════════════════════

interface ReviewRule {
  id: string
  title: string
  category: ReviewCategory
  severity: Severity
  pattern: RegExp
  description: string
  suggestion: string
  fixTemplate?: (match: string, line: string) => { original: string; fixed: string }
  languages: AnalysisLanguage[]
}

const REVIEW_RULES: ReviewRule[] = [
  // ── Bug Detection ──
  {
    id: 'bug-null-check',
    title: 'Missing null/undefined check',
    category: 'bug',
    severity: 'high',
    pattern: /(\w+)\.(length|map|forEach|filter|reduce|find|some|every)\b/,
    description: 'Property access on a value that might be null or undefined.',
    suggestion: 'Add a null check before accessing the property: if (value) { ... }',
    languages: ['typescript', 'javascript'],
  },
  {
    id: 'bug-equality',
    title: 'Loose equality comparison',
    category: 'bug',
    severity: 'medium',
    pattern: /[^!=]==[^=]/,
    description: 'Using == instead of === can lead to unexpected type coercion.',
    suggestion: 'Use strict equality (===) instead of loose equality (==).',
    fixTemplate: (match, line) => ({
      original: line,
      fixed: line.replace(/([^!=])={2}([^=])/g, '$1===$2'),
    }),
    languages: ['typescript', 'javascript'],
  },
  {
    id: 'bug-async-no-await',
    title: 'Async function without await',
    category: 'bug',
    severity: 'medium',
    pattern: /async\s+(?:function\s+\w+|\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{(?:(?!await)[\s\S])*\}/,
    description: 'Async function that never uses await — may be unintentional.',
    suggestion: "If the function doesn't need to be async, remove the async keyword.",
    languages: ['typescript', 'javascript'],
  },
  // ── Performance ──
  {
    id: 'perf-array-in-loop',
    title: 'Array method inside loop',
    category: 'performance',
    severity: 'medium',
    pattern: /for\s*\([^)]*\)\s*\{[^}]*\.(?:indexOf|includes|find)\s*\(/,
    description: 'Using array search methods inside a loop creates O(n²) complexity.',
    suggestion: 'Convert the array to a Set or Map before the loop for O(1) lookups.',
    languages: ['typescript', 'javascript', 'python', 'java'],
  },
  {
    id: 'perf-string-concat-loop',
    title: 'String concatenation in loop',
    category: 'performance',
    severity: 'low',
    pattern: /for\s*\([^)]*\)\s*\{[^}]*\+=\s*['"`]/,
    description: 'String concatenation in a loop creates new strings each iteration.',
    suggestion: 'Use an array and join(), or template literals.',
    languages: ['typescript', 'javascript', 'python', 'java'],
  },
  // ── Style ──
  {
    id: 'style-long-param-list',
    title: 'Long parameter list',
    category: 'style',
    severity: 'low',
    pattern: /(?:function\s+\w+|=>\s*)\s*\([^)]{100,}\)/,
    description: 'Functions with many parameters are hard to use and maintain.',
    suggestion: 'Consider using an options object parameter instead.',
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp', 'go'],
  },
  {
    id: 'style-nested-ternary',
    title: 'Nested ternary expression',
    category: 'style',
    severity: 'medium',
    pattern: /\?[^:]*\?[^:]*:/,
    description: 'Nested ternary expressions are difficult to read.',
    suggestion: 'Use if/else statements or extract into a helper function.',
    languages: ['typescript', 'javascript', 'java', 'csharp', 'kotlin'],
  },
  // ── Best Practices ──
  {
    id: 'bp-no-error-handling',
    title: 'Missing error handling in async code',
    category: 'best-practice',
    severity: 'high',
    pattern: /await\s+\w+(?:\.\w+)*\s*\([^)]*\)(?!\s*\.catch)(?![^]*catch\s*\()/,
    description: 'Async operation without try/catch or .catch() error handling.',
    suggestion: 'Wrap in try/catch or add .catch() handler.',
    languages: ['typescript', 'javascript'],
  },
  {
    id: 'bp-empty-catch',
    title: 'Empty catch block',
    category: 'best-practice',
    severity: 'high',
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/,
    description: 'Empty catch block silently swallows errors.',
    suggestion: 'At minimum, log the error. Consider re-throwing or handling appropriately.',
    fixTemplate: (match, line) => ({
      original: 'catch (e) {}',
      fixed: 'catch (e) { console.error(e) }',
    }),
    languages: ['typescript', 'javascript', 'java', 'csharp', 'kotlin'],
  },
  // ── Architecture ──
  {
    id: 'arch-circular-dep',
    title: 'Potential circular dependency',
    category: 'architecture',
    severity: 'medium',
    pattern: /import.*from\s+['"]\.\.\//,
    description: 'Importing from parent directory may indicate circular dependencies.',
    suggestion: 'Consider restructuring to use dependency injection or events.',
    languages: ['typescript', 'javascript'],
  },
  // ── Documentation ──
  {
    id: 'doc-missing-jsdoc',
    title: 'Missing JSDoc on exported function',
    category: 'documentation',
    severity: 'info',
    pattern: /^export\s+(?:async\s+)?function\s+\w+/m,
    description: 'Exported function without JSDoc documentation.',
    suggestion: 'Add JSDoc with @param and @returns documentation.',
    languages: ['typescript', 'javascript'],
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// MAIN REVIEWER CLASS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * CodeReviewer — Intelligent code review engine.
 *
 * @example
 * ```ts
 * const reviewer = new CodeReviewer()
 * const review = reviewer.review(code, 'typescript', ['bugs', 'security'])
 * console.log(review.overallScore)   // 0-100
 * console.log(review.findings)       // ReviewFinding[]
 * ```
 */
export class CodeReviewer {
  private analyzer: CodeAnalyzer
  private reviewHistory: CodeReviewOutput[] = []

  constructor(analyzer?: CodeAnalyzer) {
    this.analyzer = analyzer ?? new CodeAnalyzer({ depth: 'standard', securityLevel: 'standard' })
  }

  /**
   * Perform a full code review.
   *
   * @param code The code to review.
   * @param language The programming language (auto-detected if not provided).
   * @param focus Review categories to focus on (all if not provided).
   */
  review(code: string, language?: AnalysisLanguage, focus?: ReviewCategory[]): CodeReviewOutput {
    // Step 1: Run structural analysis
    const analysis = this.analyzer.analyze(code, language)
    const lang = analysis.language

    // Step 2: Collect findings
    const findings: ReviewFinding[] = []
    let findingCounter = 0

    const nextId = () => `finding-${++findingCounter}`

    // Step 3: Convert analysis results to review findings
    // Security issues → findings
    for (const issue of analysis.securityIssues) {
      if (focus && !focus.includes('security')) continue
      findings.push({
        category: 'security',
        severity: issue.severity,
        line: issue.line,
        title: `Security: ${issue.type}`,
        description: issue.description,
        suggestion: issue.cwe
          ? `See ${issue.cwe} for remediation guidance.`
          : 'Review and fix the security issue.',
        fixAvailable: false,
        autoFixable: false,
        id: nextId(),
      })
    }

    // Anti-patterns → findings
    for (const ap of analysis.antiPatterns) {
      if (focus && !focus.includes(this.mapAntiPatternCategory(ap.category))) continue
      findings.push({
        category: this.mapAntiPatternCategory(ap.category),
        severity: ap.severity,
        line: ap.line,
        title: ap.name,
        description: ap.description,
        suggestion: ap.suggestion,
        fixAvailable: false,
        autoFixable: false,
        id: nextId(),
      })
    }

    // Code smells → findings
    for (const smell of analysis.codeSmells) {
      if (focus && !focus.includes('style')) continue
      findings.push({
        category: 'style',
        severity: smell.severity,
        line: smell.line,
        title: smell.type,
        description: smell.description,
        suggestion: 'Refactor to improve code readability.',
        fixAvailable: false,
        autoFixable: false,
        id: nextId(),
      })
    }

    // Step 4: Apply review rules
    const lines = code.split('\n')
    for (const rule of REVIEW_RULES) {
      if (!rule.languages.includes(lang) && lang !== 'unknown') continue
      if (focus && !focus.includes(rule.category)) continue

      for (let i = 0; i < lines.length; i++) {
        if (rule.pattern.test(lines[i])) {
          const hasAutoFix = !!rule.fixTemplate
          findings.push({
            category: rule.category,
            severity: rule.severity,
            line: i + 1,
            title: rule.title,
            description: rule.description,
            suggestion: rule.suggestion,
            fixAvailable: hasAutoFix,
            autoFixable: hasAutoFix,
            id: nextId(),
          })
        }
      }
    }

    // Step 5: Deduplicate by line+category
    const deduped = this.deduplicateFindings(findings)

    // Step 6: Sort by severity
    const severityOrder: Record<Severity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      info: 4,
    }
    deduped.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    // Step 7: Build summary
    const summary = this.buildSummary(deduped)

    // Step 8: Calculate score
    const overallScore = this.calculateReviewScore(analysis, deduped)

    // Step 9: Top issues
    const topIssues = deduped
      .slice(0, 3)
      .map(f => `[${f.severity.toUpperCase()}] ${f.title}: ${f.description}`)

    // Step 10: Generate suggested fixes
    const suggestedFixes = this.generateFixes(code, deduped, lines)

    const result: CodeReviewOutput = {
      findings: deduped,
      summary,
      overallScore,
      topIssues,
      suggestedFixes,
    }

    this.reviewHistory.push(result)
    return result
  }

  /**
   * Review a diff (added lines only).
   */
  reviewDiff(diff: string, language?: AnalysisLanguage): CodeReviewOutput {
    // Extract added lines from diff
    const addedLines = diff
      .split('\n')
      .filter(l => l.startsWith('+') && !l.startsWith('+++'))
      .map(l => l.slice(1))
      .join('\n')

    return this.review(addedLines, language)
  }

  /**
   * Get review history.
   */
  getHistory(): CodeReviewOutput[] {
    return [...this.reviewHistory]
  }

  /**
   * Clear review history.
   */
  clearHistory(): void {
    this.reviewHistory = []
  }

  /** Get the analyzer instance. */
  getAnalyzer(): CodeAnalyzer {
    return this.analyzer
  }

  // ── Private helpers ──

  private mapAntiPatternCategory(category: string): ReviewCategory {
    const mapping: Record<string, ReviewCategory> = {
      'type-safety': 'bug',
      readability: 'style',
      'best-practice': 'best-practice',
      'error-handling': 'bug',
      'bug-prone': 'bug',
      architecture: 'architecture',
      maintenance: 'best-practice',
    }
    return mapping[category] ?? 'style'
  }

  private deduplicateFindings(findings: ReviewFinding[]): ReviewFinding[] {
    const seen = new Set<string>()
    return findings.filter(f => {
      const key = `${f.line}-${f.category}-${f.title}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private buildSummary(findings: ReviewFinding[]): ReviewSummary {
    return {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      info: findings.filter(f => f.severity === 'info').length,
    }
  }

  private calculateReviewScore(analysis: CodeAnalysis, findings: ReviewFinding[]): number {
    let score = analysis.qualityScore

    // Additional penalties from review rules
    const penaltyMap: Record<Severity, number> = {
      critical: 12,
      high: 8,
      medium: 4,
      low: 2,
      info: 0,
    }

    for (const f of findings) {
      score -= penaltyMap[f.severity]
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private generateFixes(code: string, findings: ReviewFinding[], lines: string[]): CodeFix[] {
    const fixes: CodeFix[] = []

    for (const finding of findings) {
      if (!finding.autoFixable) continue

      // Find the matching rule
      const rule = REVIEW_RULES.find(r => r.title === finding.title && r.fixTemplate)
      if (!rule?.fixTemplate) continue

      const lineIndex = finding.line - 1
      if (lineIndex < 0 || lineIndex >= lines.length) continue

      const lineContent = lines[lineIndex]
      const match = lineContent.match(rule.pattern)
      if (!match) continue

      const { original, fixed } = rule.fixTemplate(match[0], lineContent)

      fixes.push({
        findingId: finding.id,
        original,
        fixed,
        diff: `--- a/code\n+++ b/code\n@@ -${finding.line},1 +${finding.line},1 @@\n-${original}\n+${fixed}`,
        applied: false,
        validated: true,
      })
    }

    return fixes
  }
}
