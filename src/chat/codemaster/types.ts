/**
 * 🧠 CodeMaster — Shared Types & Interfaces
 *
 * Type definitions for the CodeMasterBrain sub-modules:
 *   • CodeAnalyzer  — Static analysis, language detection, complexity scoring
 *   • CodeReviewer  — Bug detection, security checks, style enforcement
 *   • CodeFixer     — Auto-fix engine, diff generation, rollback support
 *   • ProblemDecomposer — Task decomposition, step sequencing
 *   • LearningEngine — Pattern storage, TF-IDF matching, trend detection
 */

// ══════════════════════════════════════════════════════════════════════════════
// CODE ANALYSIS TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Severity levels used across all sub-modules. */
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

/** Supported analysis languages (extends ProgrammingLanguage from AiChat.ts). */
export type AnalysisLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'rust'
  | 'go'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'swift'
  | 'kotlin'
  | 'ruby'
  | 'php'
  | 'html'
  | 'css'
  | 'sql'
  | 'bash'
  | 'powershell'
  | 'r'
  | 'dart'
  | 'scala'
  | 'lua'
  | 'haskell'
  | 'elixir'
  | 'mql4'
  | 'mql5'
  | 'pinescript'
  | 'unknown'

/** Complexity metrics for code analysis. */
export interface ComplexityMetrics {
  /** Cyclomatic complexity (number of linearly independent paths). */
  cyclomatic: number
  /** Cognitive complexity (how hard the code is to understand). */
  cognitive: number
  /** Total lines of code (excluding blank lines and comments). */
  linesOfCode: number
  /** Number of functions/methods detected. */
  functionCount: number
  /** Maximum nesting depth. */
  maxNestingDepth: number
  /** Average function length in lines. */
  avgFunctionLength: number
}

/** An anti-pattern detected in code. */
export interface AntiPattern {
  /** Name of the anti-pattern. */
  name: string
  /** How severe is this anti-pattern. */
  severity: Severity
  /** Line number where the pattern starts. */
  line: number
  /** End line (if span). */
  endLine?: number
  /** Human-readable description of the issue. */
  description: string
  /** Suggested fix or improvement. */
  suggestion: string
  /** Language-specific category. */
  category: string
}

/** Import/export dependency info. */
export interface DependencyInfo {
  /** Import statements found. */
  imports: string[]
  /** Export statements found. */
  exports: string[]
  /** External (npm/pip/etc.) dependencies. */
  externalDeps: string[]
}

/** Code smell detected. */
export interface CodeSmell {
  /** Type of smell. */
  type: string
  /** Severity. */
  severity: Severity
  /** Location description. */
  location: string
  /** Line number. */
  line: number
  /** Description. */
  description: string
}

/** Security issue detected. */
export interface SecurityIssue {
  /** Type of vulnerability (e.g. 'sql-injection', 'xss'). */
  type: string
  /** Severity. */
  severity: Severity
  /** Line number. */
  line: number
  /** Description of the security issue. */
  description: string
  /** CWE identifier if applicable. */
  cwe?: string
  /** OWASP category if applicable. */
  owasp?: string
}

/** Complete result of code analysis. */
export interface CodeAnalysis {
  /** Detected language. */
  language: AnalysisLanguage
  /** Language detection confidence (0-1). */
  languageConfidence: number
  /** Complexity metrics. */
  complexity: ComplexityMetrics
  /** Anti-patterns found. */
  antiPatterns: AntiPattern[]
  /** Dependency information. */
  dependencies: DependencyInfo
  /** Code smells detected. */
  codeSmells: CodeSmell[]
  /** Security issues found. */
  securityIssues: SecurityIssue[]
  /** Overall quality score (0-100). */
  qualityScore: number
  /** Human-readable summary. */
  summary: string
}

// ══════════════════════════════════════════════════════════════════════════════
// CODE REVIEW TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Categories for code review findings. */
export type ReviewCategory =
  | 'bug'
  | 'security'
  | 'performance'
  | 'style'
  | 'architecture'
  | 'best-practice'
  | 'documentation'

/** A single finding from a code review. */
export interface ReviewFinding {
  /** Finding category. */
  category: ReviewCategory
  /** Severity level. */
  severity: Severity
  /** Line number where the issue starts. */
  line: number
  /** End line (if span). */
  endLine?: number
  /** Short title of the finding. */
  title: string
  /** Detailed description. */
  description: string
  /** Suggested improvement. */
  suggestion: string
  /** Whether an auto-fix is available. */
  fixAvailable: boolean
  /** Whether the fix can be applied automatically. */
  autoFixable: boolean
  /** Unique ID for this finding. */
  id: string
}

/** Summary counts by severity. */
export interface ReviewSummary {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

/** A suggested code fix. */
export interface CodeFix {
  /** ID of the finding this fix addresses. */
  findingId: string
  /** File path (if applicable). */
  filePath?: string
  /** The original code. */
  original: string
  /** The fixed code. */
  fixed: string
  /** Unified diff representation. */
  diff: string
  /** Whether the fix was applied. */
  applied: boolean
  /** Whether the fix was validated (basic syntax check). */
  validated: boolean
}

/** Complete result of a code review. */
export interface CodeReviewOutput {
  /** All findings. */
  findings: ReviewFinding[]
  /** Summary by severity. */
  summary: ReviewSummary
  /** Overall quality score (0-100). */
  overallScore: number
  /** Top 3 most important issues. */
  topIssues: string[]
  /** Suggested fixes for auto-fixable findings. */
  suggestedFixes: CodeFix[]
}

// ══════════════════════════════════════════════════════════════════════════════
// CODE FIXER TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Result of applying code fixes. */
export interface FixResult {
  /** Individual fix results. */
  fixes: CodeFix[]
  /** Rollback state — original content by file path. */
  rollbackState: Map<string, string>
  /** Summary counts. */
  summary: {
    applied: number
    skipped: number
    failed: number
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PROBLEM DECOMPOSER TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Classification of user intent. */
export type TaskIntent =
  | 'new-feature'
  | 'refactor'
  | 'fix-bug'
  | 'optimize'
  | 'add-tests'
  | 'documentation'
  | 'security'
  | 'general'

/** Status of a task step. */
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'

/** A single step in a task plan. */
export interface TaskStep {
  /** Unique step ID. */
  id: string
  /** Human-readable description. */
  description: string
  /** IDs of steps this depends on. */
  dependencies: string[]
  /** Files that need to be modified. */
  filesToModify: string[]
  /** Estimated lines to add/change. */
  estimatedLines: number
  /** Current status. */
  status: StepStatus
}

/** Complete task plan from decomposition. */
export interface TaskPlan {
  /** Classified intent. */
  intent: TaskIntent
  /** All steps in the plan. */
  steps: TaskStep[]
  /** Steps in execution order (respecting dependencies). */
  executionOrder: string[]
  /** Files to read for context before execution. */
  contextFiles: string[]
  /** Total estimate. */
  totalEstimate: {
    files: number
    linesAdded: number
    linesRemoved: number
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// LEARNING ENGINE TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** A learned review pattern. */
export interface ReviewPattern {
  /** ID for this pattern. */
  id: string
  /** Code pattern that triggers this review finding. */
  codePattern: string
  /** Language this applies to. */
  language: AnalysisLanguage
  /** Review category. */
  category: ReviewCategory
  /** What was found. */
  finding: string
  /** How it was fixed. */
  fix: string
  /** Confidence score (0-1). */
  confidence: number
  /** How many times this pattern has been seen. */
  occurrences: number
  /** When this pattern was last seen. */
  lastSeen: string
}

/** A learned fix pattern. */
export interface FixPattern {
  /** ID for this pattern. */
  id: string
  /** The code before the fix. */
  beforeCode: string
  /** The code after the fix. */
  afterCode: string
  /** Language this applies to. */
  language: AnalysisLanguage
  /** Type of fix. */
  fixType: string
  /** Success rate (0-1). */
  successRate: number
  /** Number of times applied. */
  appliedCount: number
}

/** Statistics for the learning engine. */
export interface LearningStats {
  /** Total review patterns stored. */
  totalReviewPatterns: number
  /** Total fix patterns stored. */
  totalFixPatterns: number
  /** Total reviews processed. */
  totalReviewsProcessed: number
  /** Total fixes applied. */
  totalFixesApplied: number
  /** Last learning timestamp. */
  lastLearnedAt: string | null
}

// ══════════════════════════════════════════════════════════════════════════════
// CODEMASTER BRAIN CONFIG
// ══════════════════════════════════════════════════════════════════════════════

/** Analysis depth levels. */
export type AnalysisDepth = 'quick' | 'standard' | 'deep'

/** Security check strictness levels. */
export type SecurityCheckLevel = 'basic' | 'standard' | 'strict'

/** Configuration for CodeMasterBrain. */
export interface CodeMasterBrainConfig {
  /** API key for cloud brain (Claude). */
  apiKey?: string
  /** Model for cloud brain. */
  model: string
  /** Analysis depth. */
  analysisDepth: AnalysisDepth
  /** Auto-apply fixes or just suggest. */
  autoFix: boolean
  /** Maximum files to include in a single review. */
  maxFilesPerReview: number
  /** Enable learning from reviews and fixes. */
  learningEnabled: boolean
  /** Override default supported languages. */
  supportedLanguages: AnalysisLanguage[]
  /** Security check strictness. */
  securityCheckLevel: SecurityCheckLevel
  /** System prompt override. */
  systemPrompt: string
  /** Max tokens for cloud responses. */
  maxTokens: number
  /** Temperature for cloud responses. */
  temperature: number
}

/** Stats for CodeMasterBrain. */
export interface CodeMasterBrainStats {
  /** Total chat interactions. */
  totalChats: number
  /** Total code analyses performed. */
  totalAnalyses: number
  /** Total code reviews performed. */
  totalReviews: number
  /** Total fixes applied. */
  totalFixes: number
  /** Total tasks decomposed. */
  totalDecompositions: number
  /** Total code generations. */
  totalCodeGenerations: number
  /** Total image analyses. */
  totalImageAnalyses: number
  /** Cloud requests made. */
  cloudRequests: number
  /** Offline requests handled. */
  offlineRequests: number
  /** Learning events. */
  learningEvents: number
  /** Created timestamp. */
  createdAt: string
  /** Last used timestamp. */
  lastUsedAt: string
}

/** Serializable state for CodeMasterBrain. */
export interface CodeMasterBrainState {
  config: CodeMasterBrainConfig
  stats: CodeMasterBrainStats
  localBrainState: string
  reviewPatterns: ReviewPattern[]
  fixPatterns: FixPattern[]
}
