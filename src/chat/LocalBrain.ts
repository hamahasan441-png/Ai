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
  createdAt: string
  lastUsedAt: string
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

  // ── CodeMaster sub-modules (offline intelligence) ──
  private codeAnalyzer: CodeAnalyzer
  private codeReviewer: CodeReviewer
  private codeFixer: CodeFixer
  private problemDecomposer: ProblemDecomposer
  private codeLearningEngine: LearningEngine

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
    }
    this.knowledgeBase = buildKnowledgeBase()
    this.tfidfScorer = new TfIdfScorer()

    // Initialize CodeMaster sub-modules
    this.codeAnalyzer = new CodeAnalyzer()
    this.codeReviewer = new CodeReviewer()
    this.codeFixer = new CodeFixer()
    this.problemDecomposer = new ProblemDecomposer()
    this.codeLearningEngine = new LearningEngine()

    const now = new Date().toISOString()
    this.stats = {
      totalChats: 0, totalCodeGenerations: 0, totalCodeReviews: 0,
      totalCodeAnalyses: 0, totalCodeFixes: 0, totalDecompositions: 0,
      totalImageAnalyses: 0, totalLearnings: 0, patternsLearned: 0,
      knowledgeEntriesAdded: 0, createdAt: now, lastUsedAt: now,
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

    // Search knowledge base
    const knowledgeResults = searchKnowledge(this.knowledgeBase, keywords)

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
    return JSON.stringify(state)
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
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, this.serializeBrain(), 'utf-8')
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
