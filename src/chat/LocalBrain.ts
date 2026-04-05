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
  AiBrainConfig,
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

  add('math', ['combinatorics', 'permutation', 'combination', 'counting'],
    'Combinatorics: Permutations (order matters): P(n,r) = n!/(n-r)!. Combinations (order doesn\'t): C(n,r) = n!/(r!(n-r)!). Factorial: n! = n·(n-1)·...·1, 0!=1. Multiplication principle: if task A has m ways and B has n ways → m·n total. Addition principle: if A or B, m+n ways (if disjoint). Pigeonhole principle: if n items in m boxes and n>m, some box has ≥2 items. Stars and bars: distributing n identical items into k bins = C(n+k-1,k-1). Inclusion-exclusion: |A∪B∪C| = |A|+|B|+|C|-|A∩B|-|A∩C|-|B∩C|+|A∩B∩C|.', 1.2)

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

  add('logic', ['logical fallacy', 'fallacy', 'invalid argument', 'cognitive bias'],
    'Logical fallacies — Formal: affirming the consequent (if p→q and q, concluding p), denying the antecedent (if p→q and ¬p, concluding ¬q). Informal: ad hominem (attack person not argument), straw man (misrepresent argument), false dichotomy (only two options), slippery slope (chain of unlikely consequences), appeal to authority, appeal to emotion, circular reasoning (begging the question), hasty generalization (small sample), red herring (irrelevant distraction), tu quoque (you too), bandwagon, post hoc ergo propter hoc (after therefore because of).', 1.3)

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

  add('language', ['sorani adverbs', 'kurdish adverbs', 'sorani adverb types', 'ئاوەڵکار'],
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
        // Exact match
        if (keyword === entryKeyword) {
          score += 3 * entry.weight
          matchedKeywords.push(keyword)
        }
        // Partial match (keyword contains entry keyword or vice versa)
        else if (keyword.includes(entryKeyword) || entryKeyword.includes(keyword)) {
          score += 1.5 * entry.weight
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
      results.push({ entry, score: score + useBoost, matchedKeywords: [...new Set(matchedKeywords)] })
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
  creativity: number,
): string {
  // Check learned patterns first (self-learning has priority)
  const matchedPattern = findBestLearnedPattern(message, learnedPatterns)
  if (matchedPattern && matchedPattern.confidence >= 0.7) {
    return matchedPattern.response
  }

  // Build from knowledge base
  if (knowledgeResults.length > 0) {
    const topResult = knowledgeResults[0]!

    // If high score, use the knowledge directly
    if (topResult.score >= 3) {
      let response = topResult.entry.content

      // If multiple strong results, combine them
      if (knowledgeResults.length > 1 && knowledgeResults[1]!.score >= 2) {
        const additional = knowledgeResults[1]!.entry.content
        // Only add if from different category to avoid repetition
        if (knowledgeResults[1]!.entry.category !== topResult.entry.category) {
          response += '\n\n' + additional
        }
      }

      return response
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
  return /[\{\}\[\];]|=>|function\s|class\s|def\s|import\s|const\s|let\s|var\s/.test(text)
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
    }

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
  }> {
    const start = Date.now()

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
      } catch { /* non-critical — continue without reasoning */ }
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
      } catch { /* non-critical */ }
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
      } catch { /* non-critical */ }
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
      } catch { /* non-critical */ }
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
      } catch { /* non-critical */ }
    }

    // AnalogicalReasoner: for comparison/analogy queries
    if (this.analogicalReasoner && this.isAnalogyQuery(userMessage)) {
      try {
        const analogy = this.analogicalReasoner.findAnalogy(keywords[0] ?? userMessage)
        if (analogy && analogy.explanation) {
          smartAugmentation += `\n\n**Analogy:** ${analogy.explanation}`
        }
      } catch { /* non-critical */ }
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
      } catch { /* non-critical */ }
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
    const topicPattern = /\b(sorani\s+(alphabet|grammar|verb|noun|pronoun|adjective|vowel|consonant|phrase|word|sentence|number|greet|family|color|food|time|nature|emotion|idiom|phonolog|dialect|semantic|compound|ezafe|ergativ|passive|causative|conditional|modal|adverb|conjunction|negat|aspect|clitic|morpholog|derivat|loanword|pragmatic|discourse|evidential|metaphor|proverb|poetry|kinship|register|reduplicat|synonym|antonym|onomatop|profession|animal|weather|travel|health|technolog|sport|music|cloth|house|shop|direction|city|religion|bazaar))\b/i
    const learnPattern = /\b(learn\s+kurdish|learn\s+sorani|kurdish\s+(language|alphabet|grammar|vocabulary|phrase|word|writing|script|culture|poetry|music|proverb|idiom|history))\b/i
    const translatePattern = /\b(in\s+kurdish|in\s+sorani|kurdish\s+for|sorani\s+for|translate.+kurdish|how\s+to\s+say.+kurdish)\b/i

    return kurdishPattern.test(msg) || scriptPattern.test(msg) || topicPattern.test(msg) || learnPattern.test(msg) || translatePattern.test(msg)
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
    confidence: number,
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
      const opens = (before.match(/[\{\[\(]/g) ?? []).length
      const closes = (before.match(/[\}\]\)]/g) ?? []).length
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
    const relevantKnowledge = knowledgeResults.map(r => r.entry.content).join('\n')
    steps.push({
      type: 'plan',
      description: 'Searching knowledge base and planning response',
      output: `Found ${knowledgeResults.length} relevant knowledge entries`,
    })

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
    let nestLevel = 0
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
}
