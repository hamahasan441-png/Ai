/**
 * 🧠 CodeMaster — Barrel Exports
 *
 * Re-exports all sub-modules for convenient importing:
 *   import { CodeAnalyzer, CodeReviewer, CodeFixer } from './codemaster/index.js'
 */

// ── Sub-modules ──
export { CodeAnalyzer } from './CodeAnalyzer.js'
export { CodeReviewer } from './CodeReviewer.js'
export { CodeFixer } from './CodeFixer.js'
export { ProblemDecomposer } from './ProblemDecomposer.js'
export { LearningEngine } from './LearningEngine.js'

// ── Types ──
export type {
  // Analysis
  Severity,
  AnalysisLanguage,
  AnalysisDepth,
  ComplexityMetrics,
  AntiPattern,
  DependencyInfo,
  CodeSmell,
  SecurityIssue,
  CodeAnalysis,
  // Review
  ReviewCategory,
  ReviewFinding,
  ReviewSummary,
  CodeFix,
  CodeReviewOutput,
  // Fix
  FixResult,
  // Decomposition
  TaskIntent,
  StepStatus,
  TaskStep,
  TaskPlan,
  // Learning
  ReviewPattern,
  FixPattern,
  LearningStats,
  // Brain config
  SecurityCheckLevel,
  CodeMasterBrainConfig,
  CodeMasterBrainStats,
  CodeMasterBrainState,
} from './types.js'
