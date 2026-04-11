// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║ CODE INTENT PREDICTOR — Phase 9 Intelligence Module                         ║
// ║ Predict coding intent from context, history, and natural language input      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Configuration ──────────────────────────────────────────────────────────────

export interface CodeIntentPredictorConfig {
  maxHistorySize: number
  maxPredictions: number
  enableContextPrediction: boolean
  enableSequencePrediction: boolean
  enableCompletionPrediction: boolean
  enablePatternPrediction: boolean
  confidenceThreshold: number
  decayFactor: number
}

// ── Statistics ──────────────────────────────────────────────────────────────────

export interface CodeIntentPredictorStats {
  totalPredictions: number
  totalCorrectPredictions: number
  totalContextPredictions: number
  totalSequencePredictions: number
  totalCompletionPredictions: number
  totalFeedbacks: number
  predictionAccuracy: number
  avgConfidence: number
  createdAt: string
  lastUsedAt: string
}

// ── Types ───────────────────────────────────────────────────────────────────────

export type CodingIntentType =
  | 'create_function'
  | 'create_class'
  | 'create_interface'
  | 'create_test'
  | 'add_feature'
  | 'fix_bug'
  | 'refactor'
  | 'optimize'
  | 'add_documentation'
  | 'add_error_handling'
  | 'add_validation'
  | 'add_logging'
  | 'integrate_api'
  | 'setup_project'
  | 'configure'
  | 'debug'
  | 'deploy'

export interface IntentPrediction {
  intent: CodingIntentType
  confidence: number
  reasoning: string
  suggestedNextSteps: string[]
  relatedConcepts: string[]
}

export interface ContextSignal {
  type: 'code' | 'message' | 'action' | 'error' | 'file'
  content: string
  timestamp: number
  weight: number
}

export interface SequencePrediction {
  currentPhase: string
  nextPhases: string[]
  confidence: number
  pattern: string
}

export interface CompletionPrediction {
  partial: string
  completions: string[]
  confidence: number
  context: string
}

export interface PredictionResult {
  intents: IntentPrediction[]
  sequence: SequencePrediction | null
  completions: CompletionPrediction[]
  topIntent: CodingIntentType
  confidence: number
  durationMs: number
}

export interface IntentFeedback {
  predictedIntent: CodingIntentType
  actualIntent: CodingIntentType
  wasCorrect: boolean
  context: string
}

// ── Default Config ──────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: CodeIntentPredictorConfig = {
  maxHistorySize: 100,
  maxPredictions: 10,
  enableContextPrediction: true,
  enableSequencePrediction: true,
  enableCompletionPrediction: true,
  enablePatternPrediction: true,
  confidenceThreshold: 0.3,
  decayFactor: 0.95,
}

// ── Intent Keywords ─────────────────────────────────────────────────────────────

const INTENT_KEYWORDS: Record<CodingIntentType, string[]> = {
  create_function: [
    'function',
    'method',
    'helper',
    'utility',
    'create function',
    'add function',
    'write function',
    'implement function',
  ],
  create_class: ['class', 'model', 'entity', 'create class', 'new class', 'define class'],
  create_interface: ['interface', 'type', 'contract', 'schema', 'define interface', 'create type'],
  create_test: [
    'test',
    'spec',
    'unit test',
    'integration test',
    'write test',
    'add test',
    'testing',
  ],
  add_feature: ['feature', 'add', 'implement', 'build', 'create', 'new', 'support'],
  fix_bug: ['fix', 'bug', 'error', 'issue', 'broken', 'wrong', 'incorrect', 'patch', 'repair'],
  refactor: ['refactor', 'clean', 'restructure', 'reorganize', 'improve', 'simplify', 'extract'],
  optimize: ['optimize', 'performance', 'faster', 'speed', 'efficient', 'cache', 'reduce'],
  add_documentation: ['document', 'docs', 'jsdoc', 'comment', 'readme', 'explain', 'describe'],
  add_error_handling: ['error handling', 'try catch', 'exception', 'validate', 'guard', 'throw'],
  add_validation: ['validate', 'check', 'verify', 'sanitize', 'input validation', 'constraint'],
  add_logging: ['log', 'logging', 'trace', 'debug log', 'monitor', 'console'],
  integrate_api: ['api', 'endpoint', 'rest', 'graphql', 'fetch', 'request', 'http', 'webhook'],
  setup_project: ['setup', 'initialize', 'scaffold', 'bootstrap', 'configure project', 'init'],
  configure: ['config', 'configure', 'settings', 'environment', 'env', 'option'],
  debug: ['debug', 'inspect', 'breakpoint', 'trace', 'investigate', 'diagnose'],
  deploy: ['deploy', 'release', 'publish', 'ship', 'ci', 'cd', 'pipeline', 'docker'],
}

// ── Sequence Transitions ────────────────────────────────────────────────────────

const PHASE_TRANSITIONS: Record<string, string[]> = {
  setup_project: ['configure', 'create_class', 'create_interface'],
  configure: ['create_class', 'create_interface', 'add_feature'],
  create_interface: ['create_class', 'create_function'],
  create_class: ['create_function', 'add_feature', 'create_test'],
  create_function: ['create_test', 'add_error_handling', 'add_documentation'],
  add_feature: ['create_test', 'add_validation', 'add_error_handling'],
  create_test: ['fix_bug', 'refactor', 'add_feature'],
  fix_bug: ['create_test', 'refactor', 'add_logging'],
  refactor: ['create_test', 'optimize', 'add_documentation'],
  optimize: ['create_test', 'add_logging', 'deploy'],
  add_error_handling: ['create_test', 'add_logging', 'add_validation'],
  add_validation: ['create_test', 'add_error_handling'],
  add_logging: ['create_test', 'deploy'],
  add_documentation: ['create_test', 'deploy', 'refactor'],
  integrate_api: ['create_test', 'add_error_handling', 'add_validation'],
  debug: ['fix_bug', 'add_logging', 'create_test'],
  deploy: ['add_logging', 'add_documentation', 'configure'],
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ── Main Class ──────────────────────────────────────────────────────────────────

export class CodeIntentPredictor {
  private config: CodeIntentPredictorConfig
  private stats: CodeIntentPredictorStats
  private contextHistory: ContextSignal[] = []
  private intentWeights: Map<CodingIntentType, number> = new Map()
  private feedbackLog: IntentFeedback[] = []
  private confidenceValues: number[] = []

  constructor(config?: Partial<CodeIntentPredictorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    const now = new Date().toISOString()
    this.stats = {
      totalPredictions: 0,
      totalCorrectPredictions: 0,
      totalContextPredictions: 0,
      totalSequencePredictions: 0,
      totalCompletionPredictions: 0,
      totalFeedbacks: 0,
      predictionAccuracy: 0,
      avgConfidence: 0,
      createdAt: now,
      lastUsedAt: now,
    }
    // Initialize equal weights
    for (const intent of Object.keys(INTENT_KEYWORDS) as CodingIntentType[]) {
      this.intentWeights.set(intent, 1.0)
    }
  }

  // ── Full Prediction ─────────────────────────────────────────────────────────

  predict(input: string, context?: ContextSignal[]): PredictionResult {
    const start = Date.now()
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalPredictions++

    if (context) {
      for (const sig of context) this.addContext(sig)
    }

    const intents = this.predictIntent(input)
    const topIntent = intents.length > 0 ? intents[0].intent : 'add_feature'
    const confidence = intents.length > 0 ? intents[0].confidence : 0

    let sequence: SequencePrediction | null = null
    if (this.config.enableSequencePrediction) {
      const recentActions = this.contextHistory
        .filter(s => s.type === 'action')
        .slice(-5)
        .map(s => s.content)
      if (recentActions.length > 0) {
        sequence = this.predictSequence(recentActions)
      }
    }

    const completions: CompletionPrediction[] = []
    if (this.config.enableCompletionPrediction && input.length > 0) {
      const completion = this.predictCompletion(input)
      if (completion.completions.length > 0) {
        completions.push(completion)
      }
    }

    this.confidenceValues.push(confidence)
    this.stats.avgConfidence = round2(
      this.confidenceValues.reduce((a, b) => a + b, 0) / this.confidenceValues.length,
    )

    return {
      intents,
      sequence,
      completions,
      topIntent,
      confidence,
      durationMs: Date.now() - start,
    }
  }

  // ── Intent Prediction ───────────────────────────────────────────────────────

  predictIntent(input: string): IntentPrediction[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const lower = input.toLowerCase()
    const scores: Array<{ intent: CodingIntentType; score: number }> = []

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as Array<
      [CodingIntentType, string[]]
    >) {
      let score = 0
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          score += kw.includes(' ') ? 2 : 1
        }
      }
      // Apply learned weight
      const weight = this.intentWeights.get(intent) ?? 1.0
      score *= weight

      // Boost from recent context
      if (this.config.enableContextPrediction) {
        const recentContextBoost =
          this.contextHistory
            .slice(-10)
            .filter(s => s.content.toLowerCase().includes(intent.replace(/_/g, ' '))).length * 0.2
        score += recentContextBoost
        if (recentContextBoost > 0) this.stats.totalContextPredictions++
      }

      if (score > 0) {
        scores.push({ intent, score })
      }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score)

    // Normalize to confidence
    const maxScore = scores.length > 0 ? scores[0].score : 1
    const results: IntentPrediction[] = scores
      .slice(0, this.config.maxPredictions)
      .map(s => ({
        intent: s.intent,
        confidence: round2(Math.min(0.95, s.score / Math.max(1, maxScore + 2))),
        reasoning: this.generateReasoning(s.intent, lower),
        suggestedNextSteps: this.getNextSteps(s.intent),
        relatedConcepts: this.getRelatedConcepts(s.intent),
      }))
      .filter(r => r.confidence >= this.config.confidenceThreshold)

    return results
  }

  // ── Sequence Prediction ─────────────────────────────────────────────────────

  predictSequence(actions: string[]): SequencePrediction {
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalSequencePredictions++

    const lastAction = actions[actions.length - 1]
    // Find matching phase
    let currentPhase = 'add_feature'
    for (const phase of Object.keys(PHASE_TRANSITIONS)) {
      if (lastAction.toLowerCase().includes(phase.replace(/_/g, ' ')) || lastAction === phase) {
        currentPhase = phase
        break
      }
    }

    const nextPhases = PHASE_TRANSITIONS[currentPhase] ?? ['create_test', 'add_feature']
    const pattern =
      actions.length >= 2
        ? `${actions.slice(-2).join(' → ')} → ${nextPhases[0]}`
        : `${lastAction} → ${nextPhases[0]}`

    return {
      currentPhase,
      nextPhases,
      confidence: round2(Math.min(0.85, 0.4 + actions.length * 0.1)),
      pattern,
    }
  }

  // ── Completion Prediction ───────────────────────────────────────────────────

  predictCompletion(partial: string, context?: string): CompletionPrediction {
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalCompletionPredictions++

    const lower = partial.toLowerCase().trim()
    const completions: string[] = []

    // Common coding completions
    const completionMap: Record<string, string[]> = {
      'create a': ['function', 'class', 'interface', 'test', 'component', 'module'],
      add: ['error handling', 'validation', 'logging', 'tests', 'documentation', 'type checking'],
      fix: ['the bug', 'the error', 'the issue', 'the failing test', 'the type error'],
      implement: ['the interface', 'the feature', 'error handling', 'caching', 'validation'],
      write: ['a test', 'documentation', 'a helper function', 'an API endpoint'],
      refactor: ['the function', 'the class', 'to use async/await', 'for readability'],
      optimize: ['the query', 'the algorithm', 'performance', 'memory usage'],
      test: ['the function', 'the endpoint', 'the component', 'edge cases'],
    }

    for (const [prefix, suffixes] of Object.entries(completionMap)) {
      if (lower.startsWith(prefix) || lower.includes(prefix)) {
        for (const suffix of suffixes) {
          if (!lower.includes(suffix)) {
            completions.push(`${partial.trim()} ${suffix}`)
          }
        }
      }
    }

    // Also consider context-based completions
    if (context) {
      if (/class\s+\w+/.test(context)) {
        completions.push(`${partial.trim()} method`, `${partial.trim()} property`)
      }
      if (/function\s+\w+/.test(context)) {
        completions.push(`${partial.trim()} parameter validation`)
      }
    }

    return {
      partial,
      completions: completions.slice(0, this.config.maxPredictions),
      confidence: round2(
        completions.length > 0 ? Math.min(0.8, 0.3 + completions.length * 0.05) : 0.1,
      ),
      context: context ?? '',
    }
  }

  // ── Context Management ──────────────────────────────────────────────────────

  addContext(signal: ContextSignal): void {
    this.contextHistory.push(signal)
    // Apply time decay to older signals
    const now = Date.now()
    for (const s of this.contextHistory) {
      const ageMs = now - s.timestamp
      const ageSec = ageMs / 1000
      s.weight *= Math.pow(this.config.decayFactor, ageSec / 60)
    }
    // Trim history
    if (this.contextHistory.length > this.config.maxHistorySize) {
      this.contextHistory = this.contextHistory.slice(-this.config.maxHistorySize)
    }
  }

  // ── Feedback ────────────────────────────────────────────────────────────────

  provideFeedback(feedback: IntentFeedback): void {
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalFeedbacks++
    this.feedbackLog.push(feedback)

    if (feedback.wasCorrect) {
      this.stats.totalCorrectPredictions++
      const w = this.intentWeights.get(feedback.predictedIntent) ?? 1.0
      this.intentWeights.set(feedback.predictedIntent, w * 1.1)
    } else {
      const w = this.intentWeights.get(feedback.predictedIntent) ?? 1.0
      this.intentWeights.set(feedback.predictedIntent, w * 0.9)
      const aw = this.intentWeights.get(feedback.actualIntent) ?? 1.0
      this.intentWeights.set(feedback.actualIntent, aw * 1.1)
    }

    this.stats.predictionAccuracy =
      this.stats.totalPredictions > 0
        ? round2(this.stats.totalCorrectPredictions / this.stats.totalPredictions)
        : 0
  }

  // ── Accessors ───────────────────────────────────────────────────────────────

  getContextHistory(): readonly ContextSignal[] {
    return [...this.contextHistory]
  }

  clearHistory(): void {
    this.contextHistory = []
  }

  getTopPatterns(n: number = 5): string[] {
    const freq = new Map<string, number>()
    for (const signal of this.contextHistory) {
      const key = `${signal.type}:${signal.content.substring(0, 50)}`
      freq.set(key, (freq.get(key) ?? 0) + 1)
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([pattern]) => pattern)
  }

  getStats(): Readonly<CodeIntentPredictorStats> {
    return { ...this.stats }
  }
  getConfig(): Readonly<CodeIntentPredictorConfig> {
    return { ...this.config }
  }

  // ── Persistence ─────────────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      config: this.config,
      stats: this.stats,
      weights: Object.fromEntries(this.intentWeights),
    })
  }

  static deserialize(json: string): CodeIntentPredictor {
    const data = JSON.parse(json) as {
      config: CodeIntentPredictorConfig
      stats: CodeIntentPredictorStats
      weights: Record<string, number>
    }
    const instance = new CodeIntentPredictor(data.config)
    Object.assign(instance.stats, data.stats)
    for (const [k, v] of Object.entries(data.weights)) {
      instance.intentWeights.set(k as CodingIntentType, v)
    }
    return instance
  }

  // ── Private Helpers ─────────────────────────────────────────────────────────

  private generateReasoning(intent: CodingIntentType, input: string): string {
    const keywords = INTENT_KEYWORDS[intent]
    const matched = keywords.filter(kw => input.includes(kw))
    if (matched.length > 0) {
      return `Matched keywords: ${matched.join(', ')}`
    }
    return `Inferred from context and input patterns`
  }

  private getNextSteps(intent: CodingIntentType): string[] {
    const steps: Record<CodingIntentType, string[]> = {
      create_function: [
        'Define parameters and return type',
        'Implement core logic',
        'Add error handling',
        'Write tests',
      ],
      create_class: ['Define properties', 'Implement constructor', 'Add methods', 'Write tests'],
      create_interface: ['Define required properties', 'Add optional fields', 'Export type'],
      create_test: [
        'Setup test fixtures',
        'Write happy path tests',
        'Add edge case tests',
        'Test error conditions',
      ],
      add_feature: [
        'Plan the feature scope',
        'Implement core logic',
        'Add tests',
        'Update documentation',
      ],
      fix_bug: [
        'Reproduce the issue',
        'Identify root cause',
        'Implement fix',
        'Add regression test',
      ],
      refactor: [
        'Identify code smells',
        'Plan refactoring steps',
        'Apply changes',
        'Verify tests pass',
      ],
      optimize: [
        'Profile current performance',
        'Identify bottlenecks',
        'Apply optimization',
        'Benchmark results',
      ],
      add_documentation: ['Add JSDoc comments', 'Write README section', 'Add usage examples'],
      add_error_handling: [
        'Identify failure points',
        'Add try/catch blocks',
        'Create error types',
        'Add error logging',
      ],
      add_validation: [
        'Define validation rules',
        'Implement validators',
        'Add error messages',
        'Test edge cases',
      ],
      add_logging: ['Choose log levels', 'Add structured logging', 'Configure log output'],
      integrate_api: [
        'Define API endpoints',
        'Create request handlers',
        'Add authentication',
        'Write integration tests',
      ],
      setup_project: ['Initialize package', 'Configure TypeScript', 'Setup testing', 'Add linting'],
      configure: [
        'Define configuration schema',
        'Add defaults',
        'Validate config',
        'Document options',
      ],
      debug: ['Add breakpoints', 'Check variable state', 'Trace execution flow', 'Fix the issue'],
      deploy: ['Run tests', 'Build for production', 'Configure deployment', 'Monitor after deploy'],
    }
    return steps[intent] ?? ['Plan', 'Implement', 'Test', 'Review']
  }

  private getRelatedConcepts(intent: CodingIntentType): string[] {
    const concepts: Record<CodingIntentType, string[]> = {
      create_function: ['pure functions', 'parameters', 'return types', 'error handling'],
      create_class: ['encapsulation', 'inheritance', 'SOLID principles', 'constructors'],
      create_interface: ['type safety', 'contracts', 'generics', 'discriminated unions'],
      create_test: ['assertions', 'mocking', 'fixtures', 'coverage'],
      add_feature: ['requirements', 'architecture', 'design patterns'],
      fix_bug: ['debugging', 'root cause analysis', 'regression testing'],
      refactor: ['code smells', 'design patterns', 'SOLID', 'DRY'],
      optimize: ['time complexity', 'space complexity', 'caching', 'lazy evaluation'],
      add_documentation: ['JSDoc', 'README', 'API docs', 'examples'],
      add_error_handling: ['try/catch', 'custom errors', 'error boundaries'],
      add_validation: ['input sanitization', 'type guards', 'schemas'],
      add_logging: ['log levels', 'structured logging', 'monitoring'],
      integrate_api: ['REST', 'GraphQL', 'authentication', 'rate limiting'],
      setup_project: ['package.json', 'tsconfig', 'linting', 'CI/CD'],
      configure: ['environment variables', 'config files', 'defaults'],
      debug: ['breakpoints', 'stack traces', 'logging', 'profiling'],
      deploy: ['CI/CD', 'Docker', 'environment', 'monitoring'],
    }
    return concepts[intent] ?? []
  }
}
