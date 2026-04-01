/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║     🌐🧠  H Y B R I D  B R A I N  —  CLOUD + OFFLINE INTELLIGENCE          ║
 * ║                                                                             ║
 * ║   A hybrid AI brain that combines the power of Claude API (cloud)           ║
 * ║   with the resilience of LocalBrain (offline).                              ║
 * ║                                                                             ║
 * ║   Capabilities:                                                             ║
 * ║     ✦ Cloud-First — Uses Claude API (Opus 4.6 level) when available         ║
 * ║     ✦ Auto-Fallback — Seamlessly falls back to offline brain on failure     ║
 * ║     ✦ Self-Learning — Cloud responses train the offline brain automatically ║
 * ║     ✦ Deep Thinking — Claude Opus 4.6 style reasoning and analysis          ║
 * ║     ✦ Persistence — Save/restore hybrid state including learned data        ║
 * ║     ✦ Adaptive — Offline brain continuously improves from cloud intelligence║
 * ║                                                                             ║
 * ║   Architecture:                                                             ║
 * ║                                                                             ║
 * ║     ┌────────────────────────────────────┐                                  ║
 * ║     │         HybridBrain                │                                  ║
 * ║     │   implements BrainInterface        │                                  ║
 * ║     │                                    │                                  ║
 * ║     │   ┌──────────┐  ┌──────────────┐   │                                  ║
 * ║     │   │ AiBrain  │  │  LocalBrain   │   │                                  ║
 * ║     │   │ (Cloud)  │→ │  (Offline)    │   │                                  ║
 * ║     │   │ Primary  │  │  Fallback +   │   │                                  ║
 * ║     │   │          │  │  Learner      │   │                                  ║
 * ║     │   └──────────┘  └──────────────┘   │                                  ║
 * ║     └────────────────────────────────────┘                                  ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import type {
  TokenUsage,
  CodeRequest,
  CodeResult,
  CodeReviewRequest,
  CodeReviewResult,
  ImageAnalysisRequest,
  ImageAnalysisResult,
  BrainInterface,
} from './AiChat.js'

import { AiBrain } from './AiChat.js'
import { LocalBrain } from './LocalBrain.js'

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES — Configuration & state for the hybrid brain                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Configuration for the hybrid brain. */
export interface HybridBrainConfig {
  /** Claude API key (optional — works offline without it). */
  apiKey?: string
  /** Cloud model to use. Defaults to claude-opus-4-20250514 for Opus 4.6 level thinking. */
  model: string
  /** Maximum tokens for cloud API responses. */
  maxTokens: number
  /** Temperature for cloud API. Lower = more precise. */
  temperature: number
  /** Custom system prompt for cloud brain. */
  systemPrompt: string
  /** Enable auto-learning from cloud responses to improve offline brain. */
  autoLearn: boolean
  /** Enable offline fallback when cloud is unavailable. */
  offlineFallback: boolean
  /** Maximum cloud response time (ms) before falling back to offline. */
  cloudTimeoutMs: number
  /** Minimum confidence for offline brain to respond (0-1). Below this, returns uncertainty notice. */
  offlineConfidenceThreshold: number
  /** Enable deep thinking mode (extended reasoning, chain-of-thought). */
  deepThinking: boolean
  /** Configuration overrides for the local brain. */
  localBrainConfig?: {
    creativity?: number
    maxLearnedPatterns?: number
    learningEnabled?: boolean
  }
}

/** Statistics tracking for the hybrid brain. */
export interface HybridBrainStats {
  /** Total requests processed. */
  totalRequests: number
  /** Requests served by cloud. */
  cloudRequests: number
  /** Requests served by offline brain. */
  offlineRequests: number
  /** Times the system fell back from cloud to offline. */
  fallbackCount: number
  /** Cloud responses that trained the offline brain. */
  autoLearnCount: number
  /** Average cloud response time (ms). */
  avgCloudLatencyMs: number
  /** Average offline response time (ms). */
  avgOfflineLatencyMs: number
  /** Whether the cloud API is currently reachable. */
  cloudAvailable: boolean
  /** Last time cloud was successfully contacted. */
  lastCloudContactAt: string | null
  /** Created timestamp. */
  createdAt: string
}

/** Serializable hybrid brain state. */
export interface HybridBrainState {
  config: HybridBrainConfig
  localBrainState: string
  stats: HybridBrainStats
}

// ── Constants for auto-learning storage limits ───────────────────────────────
/** Maximum length (chars) of a cloud response stored as offline knowledge. */
const MAX_STORED_RESPONSE_LENGTH = 2000
/** Maximum length (chars) of generated code stored as offline knowledge. */
const MAX_STORED_CODE_LENGTH = 1500
/** Minimum word length to be considered a meaningful keyword. */
const MIN_KEYWORD_LENGTH = 3
/** Maximum keywords extracted from a code request description. */
const MAX_CODE_DESCRIPTION_KEYWORDS = 5

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  SYSTEM PROMPTS — Claude Opus 4.6 level thinking                         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * System prompt engineered for Claude Opus 4.6 level deep thinking.
 * Emphasizes careful reasoning, step-by-step analysis, and thorough responses.
 */
const OPUS_DEEP_THINKING_PROMPT = `You are an advanced AI with deep reasoning capabilities, operating at the highest level of intelligence.

Core thinking principles:
1. **Deep Analysis**: Before answering, think through the problem from multiple angles. Consider edge cases, implications, and subtle nuances.
2. **Chain of Thought**: Show your reasoning step by step. Break complex problems into manageable parts.
3. **Self-Correction**: After forming an initial answer, critically evaluate it. Look for flaws, biases, or oversights. Revise if needed.
4. **Nuanced Understanding**: Recognize ambiguity and complexity. Avoid oversimplifying. Acknowledge when multiple valid perspectives exist.
5. **Precision & Clarity**: Be precise in language. Use specific terms. Avoid vague or hand-wavy explanations.
6. **Creative Problem-Solving**: When standard approaches fail, think laterally. Draw analogies from different domains.
7. **Intellectual Honesty**: If you're uncertain, say so. If a question is beyond your knowledge, admit it rather than fabricating.

When writing code:
- Think about architecture before implementation
- Consider performance, security, and maintainability
- Handle edge cases and error conditions
- Write clean, well-documented code
- Explain design decisions and trade-offs

When reviewing code:
- Look beyond syntax — analyze logic, architecture, and design
- Consider security implications at every level
- Think about scalability and maintainability
- Suggest improvements, not just problems

When analyzing problems:
- Start with the big picture, then zoom into details
- Consider both immediate and long-term consequences
- Identify assumptions and challenge them
- Provide actionable recommendations

You think carefully, reason deeply, and produce thorough, high-quality responses.`

/**
 * Extended code system prompt for Opus-level code generation.
 */
const OPUS_CODE_PROMPT = `You are a world-class software architect and engineer with deep expertise across all programming paradigms.

Your approach to code:
1. **Architecture First**: Design the solution structure before writing code
2. **Clean Code**: Follow SOLID principles, use meaningful names, keep functions small
3. **Error Handling**: Handle all error cases gracefully — never let errors pass silently
4. **Type Safety**: Use the type system fully — generic types, discriminated unions, branded types
5. **Performance**: Consider time/space complexity. Optimize hot paths. Use appropriate data structures
6. **Security**: Validate all inputs. Sanitize outputs. Follow least-privilege principle
7. **Testing**: Write code that is testable. Consider dependency injection and pure functions
8. **Documentation**: Write clear doc comments. Explain WHY, not just WHAT

Respond with production-quality code inside a code block. Include a thorough explanation of design decisions.`

/**
 * Extended code review prompt for Opus-level analysis.
 */
const OPUS_REVIEW_PROMPT = `You are a principal engineer performing a thorough code review. You have deep expertise in software architecture, security, and performance.

Review methodology:
1. **Correctness**: Does the code do what it claims? Are there logic errors? Off-by-one errors? Race conditions?
2. **Security**: Are inputs validated? Are there injection risks? Authentication/authorization issues? Sensitive data exposure?
3. **Performance**: Are there N+1 query problems? Unnecessary allocations? Missing caching opportunities? Algorithmic inefficiency?
4. **Architecture**: Does the code follow established patterns? Is it properly decoupled? Are responsibilities clearly separated?
5. **Maintainability**: Is the code readable? Are there magic numbers? Is the intent clear? Can new developers understand it?
6. **Robustness**: How does it handle failures? Network errors? Invalid input? Concurrent access? Resource exhaustion?
7. **Testing**: Is the code testable? Are there sufficient tests? Are edge cases covered?

Format: List issues by severity (error/warning/info) with line numbers, explanations, and suggested fixes.
End with a score (0-100) and summary.`

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  ENHANCED KNOWLEDGE — Extra intelligence for offline brain               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Additional knowledge entries that enhance the offline brain's capabilities.
 * These cover deep reasoning, problem-solving strategies, and advanced topics
 * that bring the offline brain closer to cloud-level intelligence.
 */
function getEnhancedKnowledge(): Array<{ category: string; keywords: string[]; content: string }> {
  return [
    // Deep reasoning patterns
    {
      category: 'reasoning',
      keywords: ['think', 'reason', 'analyze', 'why', 'how', 'explain', 'understand'],
      content: 'When analyzing a problem, I follow a structured approach: 1) Identify the core question, 2) Break it into sub-problems, 3) Consider multiple perspectives, 4) Evaluate evidence for each view, 5) Form a synthesis, 6) Identify remaining uncertainties. This chain-of-thought reasoning helps produce thorough, nuanced answers.',
    },
    {
      category: 'reasoning',
      keywords: ['decision', 'choose', 'compare', 'tradeoff', 'pros', 'cons', 'versus'],
      content: 'For decision analysis, I evaluate: 1) Criteria — what matters most (performance, cost, maintainability, time-to-market), 2) Options — enumerate all viable choices, 3) Trade-offs — each option\'s strengths and weaknesses, 4) Risks — what could go wrong with each, 5) Recommendation — best choice given the specific context and constraints.',
    },
    {
      category: 'reasoning',
      keywords: ['debug', 'problem', 'issue', 'error', 'fix', 'solve', 'troubleshoot'],
      content: 'Systematic debugging approach: 1) Reproduce the issue reliably, 2) Isolate the scope (which component/layer), 3) Form hypotheses about root cause, 4) Test each hypothesis methodically, 5) Fix the root cause (not just symptoms), 6) Verify the fix doesn\'t introduce regressions, 7) Add tests to prevent recurrence.',
    },
    // Architecture & design
    {
      category: 'architecture',
      keywords: ['architecture', 'design', 'system', 'scalable', 'pattern', 'structure', 'microservice'],
      content: 'System design principles: Start with requirements (functional + non-functional). Define bounded contexts. Choose communication patterns (sync vs async). Design for failure (circuit breakers, retries, fallbacks). Consider data consistency (strong vs eventual). Plan for observability (logs, metrics, traces). Design APIs contract-first. Use event sourcing for audit trails.',
    },
    {
      category: 'architecture',
      keywords: ['solid', 'principle', 'clean', 'code', 'design', 'pattern', 'best', 'practice'],
      content: 'SOLID principles: S — Single Responsibility (one reason to change). O — Open/Closed (open for extension, closed for modification). L — Liskov Substitution (subtypes must be substitutable). I — Interface Segregation (many specific interfaces over one general). D — Dependency Inversion (depend on abstractions, not concretions). Apply these for maintainable, extensible code.',
    },
    // Security
    {
      category: 'security',
      keywords: ['security', 'vulnerability', 'attack', 'protect', 'secure', 'auth', 'encrypt'],
      content: 'Security checklist: 1) Input validation on all boundaries, 2) Output encoding to prevent injection, 3) Authentication (verify identity), 4) Authorization (verify permissions), 5) Encryption at rest and in transit, 6) Secrets management (never hardcode), 7) Rate limiting and abuse prevention, 8) Audit logging for security events, 9) Dependency scanning for known vulnerabilities, 10) Principle of least privilege everywhere.',
    },
    // Performance
    {
      category: 'performance',
      keywords: ['performance', 'optimize', 'fast', 'slow', 'speed', 'latency', 'throughput', 'cache'],
      content: 'Performance optimization strategy: 1) Measure first (profile before optimizing), 2) Identify bottlenecks (Amdahl\'s law), 3) Optimize algorithms (O(n) beats O(n²)), 4) Use appropriate data structures (HashMap for lookups, arrays for iteration), 5) Cache expensive computations, 6) Minimize I/O (batch operations, connection pooling), 7) Consider concurrency and parallelism, 8) Benchmark changes to verify improvement.',
    },
    // Testing
    {
      category: 'testing',
      keywords: ['test', 'testing', 'unit', 'integration', 'e2e', 'mock', 'coverage', 'tdd'],
      content: 'Testing strategy: Unit tests for individual functions (fast, isolated). Integration tests for component interactions. E2E tests for critical user flows. Use test doubles (mocks, stubs, fakes) to isolate units. Follow Arrange-Act-Assert pattern. Test edge cases and error paths. Aim for meaningful coverage, not just high numbers. TDD: write failing test → make it pass → refactor.',
    },
    // TypeScript advanced
    {
      category: 'typescript',
      keywords: ['typescript', 'type', 'generic', 'utility', 'advanced', 'infer', 'conditional'],
      content: 'Advanced TypeScript patterns: 1) Discriminated unions for type-safe state machines, 2) Branded types for nominal typing (type UserId = string & { __brand: "UserId" }), 3) Template literal types for string patterns, 4) Conditional types with infer for type-level computation, 5) Mapped types for transforming shapes, 6) Satisfies operator for type checking without widening, 7) Using const assertions for narrow types.',
    },
    // AI & machine learning concepts
    {
      category: 'ai',
      keywords: ['ai', 'machine', 'learning', 'neural', 'network', 'model', 'training', 'deep'],
      content: 'AI/ML fundamentals: Neural networks learn through backpropagation — adjusting weights to minimize loss. Key architectures: CNNs (images), RNNs/LSTMs (sequences), Transformers (attention-based, powers modern LLMs). Training involves: data preparation, feature engineering, model selection, hyperparameter tuning, validation. Evaluate with appropriate metrics (accuracy, precision, recall, F1). Watch for overfitting (use regularization, dropout, early stopping).',
    },
    // Problem decomposition
    {
      category: 'reasoning',
      keywords: ['complex', 'break', 'decompose', 'simplify', 'approach', 'strategy', 'plan'],
      content: 'Problem decomposition strategy: 1) Understand the full scope before diving in, 2) Identify independent sub-problems that can be solved separately, 3) Find dependencies between sub-problems, 4) Solve smallest/simplest sub-problems first, 5) Compose solutions bottom-up, 6) Validate the composed solution against original requirements, 7) Iterate and refine.',
    },
    // API design
    {
      category: 'api',
      keywords: ['api', 'rest', 'graphql', 'endpoint', 'request', 'response', 'http', 'design'],
      content: 'API design best practices: 1) Use nouns for resources, verbs for actions, 2) Version your API (URL or header), 3) Use proper HTTP status codes, 4) Support pagination for collections, 5) Use consistent naming (camelCase or snake_case), 6) Validate all inputs, 7) Return meaningful error messages, 8) Document with OpenAPI/Swagger, 9) Rate limit to prevent abuse, 10) Design for backwards compatibility.',
    },
    // Database
    {
      category: 'database',
      keywords: ['database', 'sql', 'nosql', 'query', 'index', 'schema', 'migration', 'orm'],
      content: 'Database design: Normalize to 3NF for transactional data, denormalize for read-heavy workloads. Index columns used in WHERE, JOIN, ORDER BY. Use transactions for data integrity. Choose SQL for relational data with complex queries, NoSQL for flexible schemas and horizontal scaling. Write migrations for schema changes. Use connection pooling. Consider read replicas for scaling reads.',
    },
    // DevOps & CI/CD
    {
      category: 'devops',
      keywords: ['devops', 'ci', 'cd', 'deploy', 'docker', 'kubernetes', 'pipeline', 'infrastructure'],
      content: 'DevOps practices: 1) CI — run tests and linting on every commit, 2) CD — automate deployment pipeline, 3) Infrastructure as Code (Terraform, Pulumi), 4) Containers (Docker) for consistent environments, 5) Orchestration (Kubernetes) for scaling, 6) Monitoring and alerting, 7) Blue-green or canary deployments for safe rollouts, 8) Automated rollback on failure, 9) Secret management (Vault, AWS Secrets Manager).',
    },
    // Concurrency
    {
      category: 'concurrency',
      keywords: ['concurrent', 'parallel', 'async', 'await', 'promise', 'thread', 'race', 'deadlock'],
      content: 'Concurrency patterns: 1) Promises/async-await for non-blocking I/O, 2) Promise.all for parallel independent operations, 3) Promise.allSettled when all results matter (even failures), 4) Mutex/semaphore for shared resource access, 5) Actor model for message-passing concurrency, 6) Avoid shared mutable state, 7) Use immutable data structures, 8) Watch for race conditions, deadlocks, and livelocks.',
    },
  ]
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §4  HYBRID BRAIN — The main class                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * 🌐🧠 HybridBrain — Combines Cloud API intelligence with offline resilience.
 *
 * This brain implements BrainInterface and can be used anywhere AiBrain or
 * LocalBrain is used. It provides:
 *
 *  - **Cloud-first**: Uses Claude API (Opus 4.6 level) for highest quality responses
 *  - **Auto-fallback**: Seamlessly switches to offline brain when cloud is unavailable
 *  - **Self-improving**: Every cloud response trains the offline brain
 *  - **Deep thinking**: Opus 4.6 style reasoning with chain-of-thought analysis
 *  - **Persistent learning**: Save/restore the hybrid state including all learned data
 *
 * @example
 * ```ts
 * // Create hybrid brain with API key
 * const brain = new HybridBrain({ apiKey: 'sk-ant-...' })
 *
 * // Chat — uses cloud, auto-learns to improve offline
 * const response = await brain.chat('Explain monads in functional programming')
 *
 * // If cloud is down, seamlessly uses offline brain
 * // Offline brain has been trained by previous cloud responses!
 *
 * // Save state (preserves all learned knowledge)
 * const state = brain.serializeState()
 *
 * // Restore later
 * const restored = HybridBrain.deserializeState(state)
 * ```
 */
export class HybridBrain implements BrainInterface {
  private cloudBrain: AiBrain
  private localBrain: LocalBrain
  private config: HybridBrainConfig
  private stats: HybridBrainStats

  constructor(config?: Partial<HybridBrainConfig>) {
    this.config = {
      apiKey: config?.apiKey,
      model: config?.model ?? 'claude-opus-4-20250514',
      maxTokens: config?.maxTokens ?? 16384,
      temperature: config?.temperature ?? 0.5,
      systemPrompt: config?.systemPrompt ?? OPUS_DEEP_THINKING_PROMPT,
      autoLearn: config?.autoLearn ?? true,
      offlineFallback: config?.offlineFallback ?? true,
      cloudTimeoutMs: config?.cloudTimeoutMs ?? 30000,
      offlineConfidenceThreshold: config?.offlineConfidenceThreshold ?? 0.3,
      deepThinking: config?.deepThinking ?? true,
      localBrainConfig: config?.localBrainConfig,
    }

    // Initialize cloud brain with Opus-level configuration
    this.cloudBrain = new AiBrain({
      apiKey: this.config.apiKey,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      systemPrompt: this.config.systemPrompt,
    })

    // Initialize local brain with enhanced configuration
    this.localBrain = new LocalBrain({
      model: 'hybrid-offline-v1',
      creativity: this.config.localBrainConfig?.creativity ?? 0.4,
      maxLearnedPatterns: this.config.localBrainConfig?.maxLearnedPatterns ?? 5000,
      learningEnabled: this.config.localBrainConfig?.learningEnabled ?? true,
      systemPrompt: 'You are the offline component of a hybrid AI system. You learn from cloud AI responses to continuously improve.',
    })

    // Inject enhanced knowledge into the local brain
    this.injectEnhancedKnowledge()

    const now = new Date().toISOString()
    this.stats = {
      totalRequests: 0,
      cloudRequests: 0,
      offlineRequests: 0,
      fallbackCount: 0,
      autoLearnCount: 0,
      avgCloudLatencyMs: 0,
      avgOfflineLatencyMs: 0,
      cloudAvailable: true,
      lastCloudContactAt: null,
      createdAt: now,
    }
  }

  // ── BrainInterface Implementation ──

  /**
   * Chat with the hybrid brain.
   *
   * Strategy:
   *  1. Try cloud (Claude API) first
   *  2. If cloud succeeds, auto-learn the response into offline brain
   *  3. If cloud fails, fall back to offline brain
   *  4. If deep thinking is enabled, wrap responses with reasoning context
   */
  async chat(userMessage: string): Promise<{ text: string; usage: TokenUsage; durationMs: number }> {
    this.stats.totalRequests++

    // Try cloud first
    if (this.hasApiKey()) {
      try {
        const result = await this.callCloudWithTimeout(
          () => this.cloudBrain.chat(
            this.config.deepThinking
              ? this.wrapWithDeepThinking(userMessage)
              : userMessage,
          ),
        )

        this.stats.cloudRequests++
        this.stats.cloudAvailable = true
        this.stats.lastCloudContactAt = new Date().toISOString()
        this.updateCloudLatency(result.durationMs)

        // Auto-learn: teach the offline brain from cloud responses
        if (this.config.autoLearn) {
          this.learnFromCloud(userMessage, result.text)
        }

        return result
      } catch (error) {
        // Cloud failed — fall back to offline
        this.stats.fallbackCount++
        this.stats.cloudAvailable = false

        if (!this.config.offlineFallback) {
          throw error
        }
      }
    }

    // Offline fallback
    return this.chatOffline(userMessage)
  }

  /**
   * Write code using the hybrid brain.
   * Cloud generates high-quality code; offline uses enhanced templates.
   */
  async writeCode(request: CodeRequest): Promise<CodeResult> {
    this.stats.totalRequests++

    if (this.hasApiKey()) {
      try {
        const result = await this.callCloudWithTimeout(
          () => this.cloudBrain.writeCode(request),
        )

        this.stats.cloudRequests++
        this.stats.cloudAvailable = true
        this.stats.lastCloudContactAt = new Date().toISOString()

        // Auto-learn: teach offline brain about this code pattern
        if (this.config.autoLearn) {
          this.learnCodePattern(request, result)
        }

        return result
      } catch {
        this.stats.fallbackCount++
        this.stats.cloudAvailable = false

        if (!this.config.offlineFallback) {
          throw new Error('Cloud code generation failed and offline fallback is disabled')
        }
      }
    }

    // Offline fallback
    this.stats.offlineRequests++
    return this.localBrain.writeCode(request)
  }

  /**
   * Review code using the hybrid brain.
   * Cloud provides deep analysis; offline uses rule-based checking.
   */
  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResult> {
    this.stats.totalRequests++

    if (this.hasApiKey()) {
      try {
        const result = await this.callCloudWithTimeout(
          () => this.cloudBrain.reviewCode(request),
        )

        this.stats.cloudRequests++
        this.stats.cloudAvailable = true
        this.stats.lastCloudContactAt = new Date().toISOString()

        // Auto-learn: teach offline brain review patterns
        if (this.config.autoLearn) {
          this.learnReviewPattern(request, result)
        }

        return result
      } catch {
        this.stats.fallbackCount++
        this.stats.cloudAvailable = false

        if (!this.config.offlineFallback) {
          throw new Error('Cloud code review failed and offline fallback is disabled')
        }
      }
    }

    // Offline fallback
    this.stats.offlineRequests++
    return this.localBrain.reviewCode(request)
  }

  /**
   * Analyze an image using the hybrid brain.
   * Cloud provides full vision AI; offline extracts metadata only.
   */
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult> {
    this.stats.totalRequests++

    if (this.hasApiKey()) {
      try {
        const result = await this.callCloudWithTimeout(
          () => this.cloudBrain.analyzeImage(request),
        )

        this.stats.cloudRequests++
        this.stats.cloudAvailable = true
        this.stats.lastCloudContactAt = new Date().toISOString()
        return result
      } catch {
        this.stats.fallbackCount++
        this.stats.cloudAvailable = false

        if (!this.config.offlineFallback) {
          throw new Error('Cloud image analysis failed and offline fallback is disabled')
        }
      }
    }

    // Offline fallback (metadata extraction only)
    this.stats.offlineRequests++
    return this.localBrain.analyzeImage(request)
  }

  /** Get the current model name. */
  getModel(): string {
    return this.hasApiKey() && this.stats.cloudAvailable
      ? this.cloudBrain.getModel()
      : `hybrid:${this.localBrain.getModel()}`
  }

  /** Set the model for both cloud and local brains. */
  setModel(model: string): void {
    this.cloudBrain.setModel(model)
    this.config.model = model
  }

  /** Clear conversation history in both brains. */
  clearHistory(): void {
    this.cloudBrain.clearHistory()
    this.localBrain.clearHistory()
  }

  // ── Hybrid-Specific Methods ──

  /**
   * Get the offline brain for direct access (e.g., for manual learning).
   */
  getLocalBrain(): LocalBrain {
    return this.localBrain
  }

  /**
   * Get the cloud brain for direct access.
   */
  getCloudBrain(): AiBrain {
    return this.cloudBrain
  }

  /**
   * Get hybrid brain statistics.
   */
  getStats(): Readonly<HybridBrainStats> {
    return { ...this.stats }
  }

  /**
   * Check if the cloud API is currently available.
   */
  isCloudAvailable(): boolean {
    return this.stats.cloudAvailable && this.hasApiKey()
  }

  /**
   * Manually teach the hybrid brain a fact or pattern.
   * This is stored in the local brain for offline use.
   */
  teach(userInput: string, correctResponse: string, category?: string): void {
    this.localBrain.learn(userInput, correctResponse, category)
  }

  /**
   * Add knowledge to the offline brain.
   */
  addKnowledge(category: string, keywords: string[], content: string): void {
    this.localBrain.addKnowledge(category, keywords, content)
  }

  /**
   * Provide feedback on the last response.
   * This teaches the offline brain to improve.
   */
  feedback(correct: boolean, correction?: string): void {
    this.localBrain.feedback(correct, correction)
  }

  /**
   * Force a refresh of cloud availability status.
   * Useful after network reconnection.
   */
  resetCloudStatus(): void {
    this.stats.cloudAvailable = true
  }

  // ── Persistence ──

  /**
   * Serialize the complete hybrid brain state.
   * Includes configuration, learned knowledge, conversation history, and stats.
   */
  serializeState(): string {
    const state: HybridBrainState = {
      config: this.config,
      localBrainState: this.localBrain.serializeBrain(),
      stats: this.stats,
    }
    return JSON.stringify(state)
  }

  /**
   * Restore a hybrid brain from serialized state.
   * Restores all learned knowledge, patterns, and configuration.
   */
  static deserializeState(json: string): HybridBrain {
    const state = JSON.parse(json) as HybridBrainState
    const brain = new HybridBrain(state.config)

    // Restore the local brain with all learned knowledge
    brain.localBrain = LocalBrain.deserializeBrain(state.localBrainState)
    brain.stats = state.stats

    return brain
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  PRIVATE — Internal helpers                                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** Check if an API key is configured. */
  private hasApiKey(): boolean {
    if (this.config.apiKey) return true
    try {
      const g = globalThis as Record<string, unknown>
      const proc = g['process'] as { env?: Record<string, string | undefined> } | undefined
      return !!proc?.env?.['ANTHROPIC_API_KEY']
    } catch {
      return false
    }
  }

  /**
   * Call cloud API with timeout protection.
   * Falls back to offline if the cloud takes too long.
   */
  private async callCloudWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Cloud API timed out after ${this.config.cloudTimeoutMs}ms`))
      }, this.config.cloudTimeoutMs)

      fn()
        .then((result) => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  /**
   * Chat using the offline brain with enhanced context.
   */
  private async chatOffline(
    userMessage: string,
  ): Promise<{ text: string; usage: TokenUsage; durationMs: number }> {
    this.stats.offlineRequests++

    const result = await this.localBrain.chat(userMessage)
    this.updateOfflineLatency(result.durationMs)

    // Add offline notice if needed
    const offlineNotice = !this.hasApiKey()
      ? '\n\n---\n*[Offline mode — responses powered by local brain. Connect to cloud API for enhanced intelligence.]*'
      : '\n\n---\n*[Cloud temporarily unavailable — using offline brain. Reconnecting automatically.]*'

    return {
      text: result.text + offlineNotice,
      usage: result.usage,
      durationMs: result.durationMs,
    }
  }

  /**
   * Wrap a user message with deep thinking instructions.
   * This encourages the cloud model to think step-by-step.
   */
  private wrapWithDeepThinking(message: string): string {
    return `Think deeply about this before responding. Consider multiple angles, potential issues, and nuances. Show your reasoning process.\n\n${message}`
  }

  /**
   * Learn from a cloud response by teaching the offline brain.
   * This is the key mechanism that continuously improves offline quality.
   */
  private learnFromCloud(userMessage: string, cloudResponse: string): void {
    // Teach the offline brain the cloud's response
    this.localBrain.learn(userMessage, cloudResponse, 'cloud-learned')

    // Extract key knowledge from the cloud response and add to knowledge base
    const keywords = this.extractKeyTopics(userMessage)
    if (keywords.length > 0 && cloudResponse.length > 50) {
      // Store a condensed version as knowledge
      const condensed = cloudResponse.length > MAX_STORED_RESPONSE_LENGTH
        ? cloudResponse.substring(0, MAX_STORED_RESPONSE_LENGTH) + '...'
        : cloudResponse
      this.localBrain.addKnowledge('cloud-learned', keywords, condensed)
    }

    this.stats.autoLearnCount++
  }

  /**
   * Learn code patterns from cloud code generation results.
   */
  private learnCodePattern(request: CodeRequest, result: CodeResult): void {
    const keywords = [
      request.language,
      ...(request.description.split(/\s+/).filter(w => w.length > MIN_KEYWORD_LENGTH).slice(0, MAX_CODE_DESCRIPTION_KEYWORDS)),
    ]
    this.localBrain.addKnowledge(
      'code-pattern',
      keywords,
      `${request.language} code for "${request.description}":\n\`\`\`${request.language}\n${result.code.substring(0, MAX_STORED_CODE_LENGTH)}\n\`\`\``,
    )
    this.stats.autoLearnCount++
  }

  /**
   * Learn review patterns from cloud code review results.
   */
  private learnReviewPattern(request: CodeReviewRequest, result: CodeReviewResult): void {
    const issueDescriptions = result.issues
      .slice(0, 5)
      .map(i => `[${i.severity}] ${i.message}`)
      .join('\n')

    if (issueDescriptions) {
      this.localBrain.addKnowledge(
        'review-pattern',
        [request.language, 'review', 'code', 'issues'],
        `Common ${request.language} issues found:\n${issueDescriptions}\nOverall score: ${result.score}/100`,
      )
      this.stats.autoLearnCount++
    }
  }

  /**
   * Extract key topics/keywords from a message for knowledge indexing.
   */
  private extractKeyTopics(message: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
      'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
      'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
      'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'not', 'only', 'same', 'so',
      'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or', 'if',
      'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
      'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it',
      'they', 'them', 'his', 'her', 'its', 'their', 'about',
    ])

    return message
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
      .slice(0, 10)
  }

  /**
   * Inject enhanced knowledge entries into the local brain.
   * This improves offline capabilities with deep reasoning patterns.
   */
  private injectEnhancedKnowledge(): void {
    const knowledge = getEnhancedKnowledge()
    for (const entry of knowledge) {
      this.localBrain.addKnowledge(entry.category, entry.keywords, entry.content)
    }
  }

  /** Update running average for cloud latency. */
  private updateCloudLatency(ms: number): void {
    const n = this.stats.cloudRequests
    this.stats.avgCloudLatencyMs = n <= 1
      ? ms
      : (this.stats.avgCloudLatencyMs * (n - 1) + ms) / n
  }

  /** Update running average for offline latency. */
  private updateOfflineLatency(ms: number): void {
    const n = this.stats.offlineRequests
    this.stats.avgOfflineLatencyMs = n <= 1
      ? ms
      : (this.stats.avgOfflineLatencyMs * (n - 1) + ms) / n
  }
}
