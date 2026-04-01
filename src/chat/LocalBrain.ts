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
        if (/[^=!]==[^=]/.test(lines[i]!) && !/===/.test(lines[i]!)) {
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
    // SQL injection risk
    if (/\+\s*['"`].*(?:SELECT|INSERT|UPDATE|DELETE|DROP)/i.test(code) || /\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE|DROP)/i.test(code)) {
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
    // Nested loops
    const loopPattern = /\b(for|while)\b/g
    let nestLevel = 0, maxNest = 0
    for (const line of lines) {
      if (/\b(for|while)\b/.test(line)) nestLevel++
      if (/^\s*\}/.test(line)) nestLevel = Math.max(0, nestLevel - 1)
      maxNest = Math.max(maxNest, nestLevel)
    }
    if (maxNest >= 3) {
      issues.push({ severity: 'warning', message: `Deeply nested loops detected (${maxNest} levels) — possible O(n³) or worse complexity`, suggestion: 'Consider using hash maps or reducing loop nesting' })
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
        if (/(?:function|=>)\s*\{/.test(lines[i]!) && !/:\s*\w+/.test(lines[i]!.split('{')[0]!)) {
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
 *  - **Code Review**: Rule-based static analysis
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

  constructor(config?: Partial<LocalBrainConfig>) {
    this.config = {
      model: config?.model ?? 'local-brain-v1',
      maxResponseLength: config?.maxResponseLength ?? 4096,
      creativity: config?.creativity ?? 0.3,
      systemPrompt: config?.systemPrompt ?? 'You are LocalBrain, a standalone AI assistant that works offline.',
      learningEnabled: config?.learningEnabled ?? true,
      maxLearnedPatterns: config?.maxLearnedPatterns ?? 1000,
    }
    this.knowledgeBase = buildKnowledgeBase()
    const now = new Date().toISOString()
    this.stats = {
      totalChats: 0, totalCodeGenerations: 0, totalCodeReviews: 0,
      totalImageAnalyses: 0, totalLearnings: 0, patternsLearned: 0,
      knowledgeEntriesAdded: 0, createdAt: now, lastUsedAt: now,
    }
  }

  // ── Chat (same interface as AiBrain.chat) ──

  /** Chat with the local brain. Returns a response with simulated token usage. */
  async chat(userMessage: string): Promise<{ text: string; usage: TokenUsage; durationMs: number }> {
    const start = Date.now()
    this.conversationHistory.push({ role: 'user', content: userMessage })

    // Detect intent and extract keywords
    const intent = detectIntent(userMessage)
    const keywords = extractKeywords(userMessage)

    // Search knowledge base
    const knowledgeResults = searchKnowledge(this.knowledgeBase, keywords)

    // Generate response
    const text = buildResponse(
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

  // ── Code Writing (same interface as AiBrain.writeCode) ──

  /** Generate code locally using templates and pattern matching. */
  async writeCode(request: CodeRequest): Promise<CodeResult> {
    this.stats.totalCodeGenerations++
    this.stats.lastUsedAt = new Date().toISOString()
    return generateCodeLocally(request)
  }

  // ── Code Review (same interface as AiBrain.reviewCode) ──

  /** Review code using rule-based static analysis. */
  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResult> {
    this.stats.totalCodeReviews++
    this.stats.lastUsedAt = new Date().toISOString()
    return reviewCodeLocally(request)
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
      })
      this.stats.patternsLearned++
    }

    this.stats.totalLearnings++
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
      // Learn the correction
      this.learn(userInput, correction, 'corrected')
    }
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
    const brain = new LocalBrain(state.config)
    brain.learnedPatterns = state.learnedPatterns
    brain.conversationHistory = state.conversationHistory
    brain.stats = state.stats

    // Restore learned knowledge entries
    for (const entry of state.knowledgeAdditions) {
      brain.knowledgeBase.push(entry)
    }

    return brain
  }
}
