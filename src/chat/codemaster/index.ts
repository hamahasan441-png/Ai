/**
 * 🧠 CodeMaster — Barrel Exports
 *
 * Re-exports all sub-modules for convenient importing:
 *   import { CodeAnalyzer, CodeReviewer, CodeFixer } from './codemaster/index.js'
 *
 * v4.0 — Now with 21 sub-modules including Copilot-agent-level capabilities:
 *   CodePlanner, AutoRefactorer, ContextGatherer, CodeGenerator, DiffEngine,
 *   CommandRunner, FileNavigator, ConversationEngine, ErrorDiagnoser, SecurityScanner
 */

// ── Core Sub-modules ──
export { CodeAnalyzer } from './CodeAnalyzer.js'
export { CodeReviewer } from './CodeReviewer.js'
export { CodeFixer } from './CodeFixer.js'
export { ProblemDecomposer } from './ProblemDecomposer.js'
export { LearningEngine } from './LearningEngine.js'
export { PerformanceAnalyzer } from './PerformanceAnalyzer.js'
export { TypeFlowAnalyzer } from './TypeFlowAnalyzer.js'
export { DependencyGraphAnalyzer } from './DependencyGraphAnalyzer.js'
export { AsyncFlowAnalyzer } from './AsyncFlowAnalyzer.js'
export { TestCoverageAnalyzer } from './TestCoverageAnalyzer.js'
export { ArchitecturalAnalyzer } from './ArchitecturalAnalyzer.js'

// ── Copilot-Agent-Level Sub-modules (Phase 1) ──
export { CodePlanner } from './CodePlanner.js'
export { AutoRefactorer } from './AutoRefactorer.js'
export { ContextGatherer } from './ContextGatherer.js'
export { CodeGenerator } from './CodeGenerator.js'
export { DiffEngine } from './DiffEngine.js'

// ── Copilot-Agent-Level Sub-modules (Phase 2) ──
export { CommandRunner } from './CommandRunner.js'
export { FileNavigator } from './FileNavigator.js'
export { ConversationEngine } from './ConversationEngine.js'
export { ErrorDiagnoser } from './ErrorDiagnoser.js'
export { SecurityScanner } from './SecurityScanner.js'

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

// ── New module types ──
export type {
  ComplexityClass,
  PerformanceIssue,
  PerformanceIssueType,
  PerformanceAnalysis,
  OptimizationSuggestion,
  PerformanceHotspot,
} from './PerformanceAnalyzer.js'

export type {
  TypeSafetyIssue,
  TypeIssueType,
  TypeFlowAnalysis,
  NullableVariable,
  TypeAssertion,
} from './TypeFlowAnalyzer.js'

export type {
  DependencyNode,
  ImportInfo,
  ExportInfo,
  CircularDependency,
  DependencyIssue,
  DependencyIssueType,
  DependencyGraphAnalysis,
  FileContent,
} from './DependencyGraphAnalyzer.js'

export type {
  AsyncIssue,
  AsyncIssueType,
  AsyncFlowAnalysis,
  AsyncFunctionInfo,
} from './AsyncFlowAnalyzer.js'

export type {
  TestableFunction,
  TestCase,
  CoverageGap,
  CoverageGapType,
  TestCoverageAnalysis,
} from './TestCoverageAnalyzer.js'

export type {
  ArchitecturalIssue,
  SolidPrinciple,
  ArchIssueType,
  DesignPatternUsage,
  ClassMetrics,
  ArchitecturalAnalysis,
} from './ArchitecturalAnalyzer.js'

// ── New Copilot-Agent-Level Types ──
export type {
  PlannedChange,
  ChangeType,
  RiskLevel,
  ChangePlan,
  PlanWarning,
  EffortEstimate,
} from './CodePlanner.js'

export type {
  RefactorKind,
  RefactorRequest,
  RefactorResult,
} from './AutoRefactorer.js'

export type {
  SymbolInfo,
  SymbolKind,
  ImportRelation,
  RelevantFile,
  FileSummary,
  GatheredContext,
} from './ContextGatherer.js'

export type {
  GenerationKind,
  GenerateRequest,
  GenerateResult,
} from './CodeGenerator.js'

export type {
  DiffHunk,
  DiffLine,
  FileDiff,
  ApplyResult,
  DiffBatch,
} from './DiffEngine.js'

// ── Copilot-Agent-Level Phase 2 Types ──
export type {
  ShellType,
  CommandCategory,
  CommandRisk,
  SuggestedCommand,
  CommandOutput,
  ParsedError,
  ParsedWarning,
  ProjectConfig,
  CommandSequence,
  SequenceStep,
  CommandHistoryEntry,
} from './CommandRunner.js'

export type {
  FileEntry,
  DirectoryNode,
  SearchResult,
  ProjectOverview,
  ProjectType,
  FileGroup,
  ImpactAnalysis,
} from './FileNavigator.js'

export type {
  ConversationRole,
  ConversationMessage,
  CodeReference,
  ConversationState,
  ConversationSummary,
  FollowUpSuggestion,
  ConversationCheckpoint,
} from './ConversationEngine.js'

export type {
  ErrorCategory,
  StackFrame,
  DiagnosedError,
  SuggestedFix,
  DiagnosticReport,
} from './ErrorDiagnoser.js'

export type {
  OwaspCategory,
  SecurityVulnerability,
  DetectedSecret,
  SecretType,
  SecurityScanResult,
} from './SecurityScanner.js'
