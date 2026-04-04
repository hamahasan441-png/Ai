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
} from './AiChat'

import {
  estimateComplexity,
  getCodeTemplate,
  getLanguageInfo,
  formatCode,
  isSupportedImageType,
  validateImageData,
  parseImageAnalysis,
} from './AiChat'

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
    }
    this.knowledgeBase = buildKnowledgeBase()
    this.tfidfScorer = new TfIdfScorer()

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
  async chat(userMessage: string): Promise<{ text: string; usage: TokenUsage; durationMs: number }> {
    const start = Date.now()
    this.conversationHistory.push({ role: 'user', content: userMessage })

    // Apply confidence decay to unused patterns
    this.applyConfidenceDecay()

    // Detect intent and extract keywords
    const intent = detectIntent(userMessage)
    const keywords = extractKeywords(userMessage)

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
        const concept = this.semanticMemory.findConceptByName(kw)
        if (concept) seedIds.push(concept.id)
      }
      if (seedIds.length > 0) {
        // Spreading activation to find related concepts beyond keyword matching
        const _activated = this.semanticMemory.spreadingActivation(seedIds, 2, 5)
        // Extract relationships from the conversation to grow the graph
        const extracted = this.semanticMemory.extractRelationships(userMessage)
        for (const rel of extracted) {
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

    // Generate response (uses TF-IDF if enabled)
    const text = this.config.useTfIdf
      ? this.buildResponseWithTfIdf(intent, userMessage, knowledgeResults)
      : buildResponse(
          intent, userMessage, knowledgeResults,
          this.learnedPatterns, this.conversationHistory,
          this.config.creativity,
        )

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

    this.conversationHistory.push({ role: 'assistant', content: text })
    this.stats.totalChats++
    this.stats.lastUsedAt = new Date().toISOString()

    const durationMs = Date.now() - start

    // Simulate token usage (approximate: ~4 chars per token)
    const inputTokens = Math.ceil(userMessage.length / 4)
    const outputTokens = Math.ceil(text.length / 4)

    return {
      text,
      usage: { inputTokens, outputTokens, cacheReadTokens: 0, cacheCreationTokens: 0 },
      durationMs,
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

  /** Analyze image metadata (limited without a vision model). */
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult> {
    this.stats.totalImageAnalyses++
    this.stats.lastUsedAt = new Date().toISOString()

    if (!isSupportedImageType(request.mediaType)) {
      throw new Error(`Unsupported image type: ${request.mediaType}`)
    }
    if (!validateImageData(request.imageData)) {
      throw new Error('Invalid image data')
    }

    // Extract what we can from metadata (no vision model available)
    const sizeBytes = Math.floor(request.imageData.length * 0.75)
    const sizeKB = Math.round(sizeBytes / 1024)
    const format = request.mediaType.split('/')[1] ?? 'unknown'

    const description = `Image analysis (offline mode): ${format.toUpperCase()} image, approximately ${sizeKB}KB. ` +
      (request.question ? `User question: "${request.question}". ` : '') +
      'Note: Detailed visual analysis requires a vision model. LocalBrain can identify format and size metadata.'

    return parseImageAnalysis(description)
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
    } else if (correction) {
      // Learn the correction with higher priority
      this.learn(userInput, correction, 'user-corrected')
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
