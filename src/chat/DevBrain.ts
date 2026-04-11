/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║     💻🧠  D E V  B R A I N  —  OFFLINE CODING PRACTICE AGENT               ║
 * ║                                                                             ║
 * ║   A fully offline coding practice agent powered by LocalBrain.              ║
 * ║   No API keys, no network, no cloud — 100% local intelligence.             ║
 * ║                                                                             ║
 * ║   Architecture:                                                             ║
 * ║                                                                             ║
 * ║     ┌────────────────────────────────────────────────┐                      ║
 * ║     │              DevBrain                          │                      ║
 * ║     │        implements BrainInterface                │                      ║
 * ║     │                                                │                      ║
 * ║     │   ┌──────────────┐    ┌───────────────────┐   │                      ║
 * ║     │   │  LocalBrain  │    │  Coding Training   │   │                      ║
 * ║     │   │  (Core AI)   │    │  (Exercises, Eval) │   │                      ║
 * ║     │   │  47 modules  │    │  Skill Assessment  │   │                      ║
 * ║     │   │  Self-learn  │    │  Training Plans    │   │                      ║
 * ║     │   └──────────────┘    └───────────────────┘   │                      ║
 * ║     └────────────────────────────────────────────────┘                      ║
 * ║                                                                             ║
 * ║   Capabilities:                                                             ║
 * ║     ✦ Chat — Intelligent conversation powered by LocalBrain                 ║
 * ║     ✦ Code Generation — Write code in 24 languages                          ║
 * ║     ✦ Code Review — Deep analysis with CodeMaster                           ║
 * ║     ✦ Coding Exercises — Generate practice problems                         ║
 * ║     ✦ Code Evaluation — Score submissions against exercises                 ║
 * ║     ✦ Skill Assessment — Track coding skill progression                     ║
 * ║     ✦ Training Plans — Personalized learning roadmaps                       ║
 * ║     ✦ Self-Learning — Improves from every interaction                       ║
 * ║     ✦ Persistence — Save/restore entire agent state                         ║
 * ║                                                                             ║
 * ║   100% offline — no API keys needed.                                        ║
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
  ApiMessage,
  ProgrammingLanguage,
  DocumentAnalysisInput,
  DocumentAnalysisOutput,
} from './types.js'

import { isSupportedImageType, validateImageData } from './types.js'

import { LocalBrain } from './LocalBrain.js'

import type {
  CodeCompletionResult,
  CodeExplanationResult,
  ReasoningResult,
  MultiFileResult,
  RefactoringSuggestion,
  ConversationContext,
  UserPreferences,
  PatternConflict,
  KnowledgeSearchResult,
  LocalBrainStats,
} from './LocalBrain.js'

import type { CodeAnalysis, CodeReviewOutput, FixResult, TaskPlan } from './codemaster/types.js'

import { LearningEngine } from './codemaster/LearningEngine.js'

// Trading & intelligence module type imports
import type { TradingEngine } from './TradingEngine.js'
import type { MarketAnalyzer } from './MarketAnalyzer.js'
import type { PortfolioOptimizer } from './PortfolioOptimizer.js'
import type { StrategyEngine } from './StrategyEngine.js'
import type { DecisionEngine } from './DecisionEngine.js'
import type { KnowledgeSynthesizer } from './KnowledgeSynthesizer.js'
import type { EconomicAnalyzer } from './EconomicAnalyzer.js'
import type { SecurityTrainer } from './SecurityTrainer.js'

// Semantic intelligence module type imports (Phase 5)
import type { EmotionEngine } from './EmotionEngine.js'
import type { TemporalReasoner } from './TemporalReasoner.js'
import type { NormalizationEngine } from './NormalizationEngine.js'
import type { BayesianNetwork } from './BayesianNetwork.js'
import type { OntologyManager } from './OntologyManager.js'
import type { DialogueManager } from './DialogueManager.js'
import type { ArgumentAnalyzer } from './ArgumentAnalyzer.js'
import type { NarrativeEngine } from './NarrativeEngine.js'

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES — Configuration, state, and interfaces for DevBrain               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/** Configuration for the DevBrain. */
export interface DevBrainConfig {
  /** Maximum tokens for responses. */
  maxTokens: number
  /** Creativity temperature (0-1). Default: 0.8. */
  temperature: number
  /** System prompt for the dev brain. */
  systemPrompt: string
  /** Auto-learn from interactions. Default: true. */
  autoLearn: boolean
  /** Enable debug mode (logs all interactions). Default: false. */
  debugMode: boolean
  /** Max keywords extracted from messages for knowledge indexing. Default: 10. */
  maxExtractedKeywords: number
  /** Configuration overrides for the local brain. */
  localBrainConfig?: {
    creativity?: number
    maxLearnedPatterns?: number
    learningEnabled?: boolean
  }
}

/** A single debug log entry. */
export interface DevBrainLogEntry {
  timestamp: string
  action: string
  input: string
  localThinking?: string
  finalOutput: string
  durationMs: number
  provider: 'local'
}

/** Statistics for the DevBrain. */
export interface DevBrainStats {
  totalRequests: number
  localRequests: number
  autoLearnCount: number
  avgLocalLatencyMs: number
  totalExercisesGenerated: number
  totalCodeEvaluations: number
  totalSkillAssessments: number
  totalTrainingPlans: number
  totalReasoning: number
  totalMultiFileGenerations: number
  totalCodeCompletions: number
  totalCodeExplanations: number
  createdAt: string
}

/** Serializable DevBrain state. */
export interface DevBrainState {
  config: DevBrainConfig
  localBrainState: string
  stats: DevBrainStats
  debugLog: DevBrainLogEntry[]
}

// ── Coding Training Types ──

/** Difficulty level for coding exercises and skill assessments. */
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

/** A generated coding exercise with description, starter code, and solution. */
export interface CodingExercise {
  title: string
  description: string
  difficulty: ExerciseDifficulty
  language: string
  starterCode: string
  expectedOutput?: string
  hints: string[]
  solution: string
  concepts: string[]
  estimatedMinutes: number
}

/** Result of evaluating a code submission against an exercise. */
export interface CodeEvaluation {
  /** Score from 0 to 100. */
  score: number
  passed: boolean
  feedback: string[]
  improvements: string[]
  conceptsUsed: string[]
  codeQuality: 'poor' | 'fair' | 'good' | 'excellent'
}

/** Assessment of a user's coding skill level for a language. */
export interface SkillAssessment {
  language: string
  level: ExerciseDifficulty
  strengths: string[]
  weaknesses: string[]
  totalInteractions: number
  codeQualityTrend: 'improving' | 'stable' | 'declining'
  recommendedTopics: string[]
}

/** A personalized training plan with topics, exercises, and milestones. */
export interface TrainingPlan {
  language: string
  currentLevel: ExerciseDifficulty
  targetLevel: ExerciseDifficulty
  topics: TrainingTopic[]
  estimatedWeeks: number
  dailyMinutes: number
}

/** A single topic within a training plan. */
export interface TrainingTopic {
  name: string
  description: string
  difficulty: ExerciseDifficulty
  /** Exercise descriptions for this topic. */
  exercises: string[]
  /** Learning resources and concepts for this topic. */
  resources: string[]
  order: number
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  SYSTEM PROMPTS                                                          ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

const DEV_SYSTEM_PROMPT = `You are a developer AI assistant focused on coding practice and learning.

Core principles:
1. **Direct & Honest** — Give straight answers. No hedging, no disclaimers.
2. **Code Everything** — Write code in any language for any purpose the developer needs.
3. **Debug Mode** — Explain internals, show raw data, expose hidden details.
4. **Developer-First** — You serve the developer. Their needs come first.

When writing code:
- Write production-quality, complete implementations
- Include error handling, edge cases, and performance optimizations
- Use advanced patterns and idioms appropriate to the language

When analyzing:
- Be thorough and technical
- Provide actionable insights
- Give honest assessments, even if critical
- Include relevant security and performance considerations`

/** Default max keywords extracted from a message. */
const DEFAULT_MAX_EXTRACTED_KEYWORDS = 10
/** Base score for local code evaluation. */
const BASE_EVALUATION_SCORE = 50

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  DEV BRAIN — The main class                                              ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * 💻🧠 DevBrain — Offline coding practice agent powered by LocalBrain.
 *
 * This brain implements BrainInterface and provides:
 *  - All LocalBrain capabilities (47 intelligence modules, self-learning)
 *  - Coding exercises, evaluation, skill assessment, training plans
 *  - Developer-focused knowledge (algorithms, design patterns, security)
 *  - 100% offline — no API keys, no network
 *
 * @example
 * ```ts
 * const dev = new DevBrain()
 *
 * // Chat — intelligent responses
 * const response = await dev.chat('How do I implement a binary search?')
 *
 * // Write code
 * const code = await dev.writeCode({ description: 'REST API server', language: 'typescript' })
 *
 * // Generate exercises
 * const exercise = await dev.generateExercise('sorting', 'intermediate', 'python')
 *
 * // Evaluate submissions
 * const evaluation = await dev.evaluateCode(myCode, exercise, 'python')
 *
 * // Skill assessment
 * const assessment = dev.getCodingSkillAssessment('typescript')
 *
 * // Training plan
 * const plan = dev.getTrainingPlan('python', 'beginner', ['web development', 'data science'])
 * ```
 */
export class DevBrain implements BrainInterface {
  private localBrain: LocalBrain
  private config: DevBrainConfig
  private stats: DevBrainStats
  private debugLog: DevBrainLogEntry[]
  private conversationHistory: ApiMessage[]

  constructor(config?: Partial<DevBrainConfig>) {
    this.config = {
      maxTokens: config?.maxTokens ?? 16384,
      temperature: config?.temperature ?? 0.8,
      systemPrompt: config?.systemPrompt ?? DEV_SYSTEM_PROMPT,
      autoLearn: config?.autoLearn ?? true,
      debugMode: config?.debugMode ?? false,
      maxExtractedKeywords: config?.maxExtractedKeywords ?? DEFAULT_MAX_EXTRACTED_KEYWORDS,
      localBrainConfig: config?.localBrainConfig,
    }

    // Initialize local brain with developer-optimized configuration
    this.localBrain = new LocalBrain({
      model: 'dev-local-v1',
      creativity: this.config.localBrainConfig?.creativity ?? 0.6,
      maxLearnedPatterns: this.config.localBrainConfig?.maxLearnedPatterns ?? 10000,
      learningEnabled: this.config.localBrainConfig?.learningEnabled ?? true,
      systemPrompt:
        'You are the local thinking engine of a developer AI. Think deeply, reason thoroughly, and provide raw analysis.',
    })

    // Inject developer-focused knowledge
    this.injectDevKnowledge()

    const now = new Date().toISOString()
    this.stats = {
      totalRequests: 0,
      localRequests: 0,
      autoLearnCount: 0,
      avgLocalLatencyMs: 0,
      totalExercisesGenerated: 0,
      totalCodeEvaluations: 0,
      totalSkillAssessments: 0,
      totalTrainingPlans: 0,
      totalReasoning: 0,
      totalMultiFileGenerations: 0,
      totalCodeCompletions: 0,
      totalCodeExplanations: 0,
      createdAt: now,
    }

    this.debugLog = []
    this.conversationHistory = []
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  BrainInterface Implementation                                           ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** Chat with the DevBrain. Delegates to LocalBrain. */
  async chat(
    userMessage: string,
  ): Promise<{ text: string; usage: TokenUsage; durationMs: number }> {
    this.stats.totalRequests++
    this.stats.localRequests++
    const start = Date.now()

    const result = await this.localBrain.chat(userMessage)
    const durationMs = Date.now() - start
    this.updateLocalLatency(durationMs)

    this.conversationHistory.push({ role: 'user', content: userMessage })
    this.conversationHistory.push({ role: 'assistant', content: result.text })

    this.addDebugLog('chat', userMessage, undefined, result.text, durationMs)

    return { text: result.text, usage: result.usage, durationMs }
  }

  /** Write code using the DevBrain. Delegates to LocalBrain. */
  async writeCode(request: CodeRequest): Promise<CodeResult> {
    this.stats.totalRequests++
    this.stats.localRequests++
    const start = Date.now()

    const result = await this.localBrain.writeCode(request)
    this.addDebugLog('writeCode', request.description, undefined, result.code, Date.now() - start)
    return result
  }

  /** Review code using the DevBrain. Delegates to LocalBrain. */
  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResult> {
    this.stats.totalRequests++
    this.stats.localRequests++
    return this.localBrain.reviewCode(request)
  }

  /** Analyze an image using the DevBrain. Delegates to LocalBrain. */
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResult> {
    this.stats.totalRequests++
    this.stats.localRequests++

    if (!isSupportedImageType(request.mediaType)) {
      throw new Error(`Unsupported image type: ${request.mediaType}`)
    }
    if (!validateImageData(request.imageData)) {
      throw new Error('Invalid image data')
    }

    return this.localBrain.analyzeImage(request)
  }

  /** Analyze a document using the DevBrain. Delegates to LocalBrain. */
  async analyzeDocument(request: DocumentAnalysisInput): Promise<DocumentAnalysisOutput> {
    this.stats.totalRequests++
    this.stats.localRequests++

    return this.localBrain.analyzeDocument(request)
  }

  /** Get the current model name. */
  getModel(): string {
    return `dev-local:${this.localBrain.getModel()}`
  }

  /** Set the model (updates local brain model). */
  setModel(model: string): void {
    this.localBrain.setModel(model)
  }

  /** Clear conversation history. */
  clearHistory(): void {
    this.conversationHistory = []
    this.localBrain.clearHistory()
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  Dev-Specific Methods — Developer tools                                  ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** Get the local brain for direct access. */
  getLocalBrain(): LocalBrain {
    return this.localBrain
  }

  /** Manually teach the brain a fact or pattern. */
  teach(userInput: string, correctResponse: string, category?: string): void {
    this.localBrain.learn(userInput, correctResponse, category)
  }

  /** Add knowledge to the local brain. */
  addKnowledge(category: string, keywords: string[], content: string): void {
    this.localBrain.addKnowledge(category, keywords, content)
  }

  /** Provide feedback on the last response. */
  feedback(correct: boolean, correction?: string): void {
    this.localBrain.feedback(correct, correction)
  }

  /** Get DevBrain statistics. */
  getStats(): Readonly<DevBrainStats> {
    return { ...this.stats }
  }

  /** Get debug log entries. */
  getDebugLog(): readonly DevBrainLogEntry[] {
    return [...this.debugLog]
  }

  /** Clear debug log. */
  clearDebugLog(): void {
    this.debugLog = []
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  LocalBrain Delegation — Direct access to all LocalBrain capabilities    ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** Complete partial code at the cursor position. */
  completeCode(partialCode: string, cursorPosition?: number): CodeCompletionResult {
    this.stats.totalRequests++
    this.stats.totalCodeCompletions++
    return this.localBrain.completeCode(partialCode, cursorPosition)
  }

  /** Suggest refactorings for the given code. */
  suggestRefactorings(code: string, language?: string): RefactoringSuggestion[] {
    this.stats.totalRequests++
    return this.localBrain.suggestRefactorings(code, language)
  }

  /** Assess confidence in answering a question. */
  assessConfidence(question: string): {
    confident: boolean
    score: number
    clarifyingQuestions?: string[]
  } {
    return this.localBrain.assessConfidence(question)
  }

  /** Deep code analysis: complexity, anti-patterns, dependencies, code smells, security. */
  analyzeCode(code: string, language?: string): CodeAnalysis {
    this.stats.totalRequests++
    return this.localBrain.analyzeCode(code, language)
  }

  /** Auto-fix code issues with diffs and rollback state. */
  fixCode(code: string, language: string): FixResult {
    this.stats.totalRequests++
    return this.localBrain.fixCode(code, language)
  }

  /** Decompose a task into dependency-aware steps. */
  decomposeTask(description: string): TaskPlan {
    this.stats.totalRequests++
    return this.localBrain.decomposeTask(description)
  }

  /** Deep code review using CodeMaster. */
  deepReview(code: string, language?: string): CodeReviewOutput {
    this.stats.totalRequests++
    return this.localBrain.deepReview(code, language)
  }

  /** Get the CodeMaster learning engine. */
  getCodeLearningEngine(): LearningEngine {
    return this.localBrain.getCodeLearningEngine()
  }

  /** Get current conversation context. */
  getConversationContext(): ConversationContext {
    return this.localBrain.getConversationContext()
  }

  /** Get user code style preferences. */
  getUserPreferences(): UserPreferences {
    return this.localBrain.getUserPreferences()
  }

  /** Set a user code style preference. */
  setUserPreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    this.localBrain.setUserPreference(key, value)
  }

  /** Provide feedback on a specific conversation turn. */
  feedbackOnTurn(turnIndex: number, correct: boolean, correction?: string): void {
    this.localBrain.feedbackOnTurn(turnIndex, correct, correction)
  }

  /** Get conflicting learned patterns. */
  getConflicts(): PatternConflict[] {
    return this.localBrain.getConflicts()
  }

  /** Search the knowledge base by query. */
  searchKnowledge(query: string, limit?: number): KnowledgeSearchResult[] {
    return this.localBrain.searchKnowledge(query, limit)
  }

  /** Export the brain state to a file. */
  exportBrain(filePath: string): void {
    this.localBrain.exportBrain(filePath)
  }

  /** Import brain state from a file. */
  importBrain(filePath: string): void {
    this.localBrain.importBrain(filePath)
  }

  /** Manually save the brain state. */
  save(): void {
    this.localBrain.save()
  }

  /** Rebuild the TF-IDF index for pattern matching. */
  rebuildTfIdfIndex(): void {
    this.localBrain.searchKnowledge('__rebuild_trigger__', 1)
  }

  /** Get the count of learned patterns. */
  getLearnedPatternCount(): number {
    return this.localBrain.getLearnedPatternCount()
  }

  /** Get the total knowledge base size. */
  getKnowledgeBaseSize(): number {
    return this.localBrain.getKnowledgeBaseSize()
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  Intelligence Module Delegation                                          ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  getTradingEngine(): TradingEngine | null {
    return this.localBrain.getTradingEngine()
  }
  getMarketAnalyzer(): MarketAnalyzer | null {
    return this.localBrain.getMarketAnalyzer()
  }
  getPortfolioOptimizer(): PortfolioOptimizer | null {
    return this.localBrain.getPortfolioOptimizer()
  }
  getStrategyEngine(): StrategyEngine | null {
    return this.localBrain.getStrategyEngine()
  }
  getDecisionEngine(): DecisionEngine | null {
    return this.localBrain.getDecisionEngine()
  }
  getKnowledgeSynthesizer(): KnowledgeSynthesizer | null {
    return this.localBrain.getKnowledgeSynthesizer()
  }
  getEconomicAnalyzer(): EconomicAnalyzer | null {
    return this.localBrain.getEconomicAnalyzer()
  }
  getSecurityTrainer(): SecurityTrainer | null {
    return this.localBrain.getSecurityTrainer()
  }
  getEmotionEngine(): EmotionEngine | null {
    return this.localBrain.getEmotionEngine()
  }
  getTemporalReasoner(): TemporalReasoner | null {
    return this.localBrain.getTemporalReasoner()
  }
  getNormalizationEngine(): NormalizationEngine | null {
    return this.localBrain.getNormalizationEngine()
  }
  getBayesianNetwork(): BayesianNetwork | null {
    return this.localBrain.getBayesianNetwork()
  }
  getOntologyManager(): OntologyManager | null {
    return this.localBrain.getOntologyManager()
  }
  getDialogueManager(): DialogueManager | null {
    return this.localBrain.getDialogueManager()
  }
  getArgumentAnalyzer(): ArgumentAnalyzer | null {
    return this.localBrain.getArgumentAnalyzer()
  }
  getNarrativeEngine(): NarrativeEngine | null {
    return this.localBrain.getNarrativeEngine()
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  Enhanced Methods — Powered by LocalBrain                                ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** Multi-step reasoning with chain-of-thought. */
  async reason(question: string): Promise<ReasoningResult> {
    this.stats.totalRequests++
    this.stats.totalReasoning++
    this.stats.localRequests++
    const start = Date.now()
    const result = await this.localBrain.reason(question)
    this.addDebugLog('reason', question, result.answer, result.answer, Date.now() - start)
    return result
  }

  /** Generate a multi-file project. */
  async generateMultiFile(
    description: string,
    language: string,
    fileTypes?: string[],
  ): Promise<MultiFileResult> {
    this.stats.totalRequests++
    this.stats.totalMultiFileGenerations++
    this.stats.localRequests++
    const start = Date.now()
    const lang = language as ProgrammingLanguage
    const result = await this.localBrain.generateMultiFile(description, lang, fileTypes)
    this.addDebugLog(
      'generateMultiFile',
      description,
      result.explanation,
      result.explanation,
      Date.now() - start,
    )
    return result
  }

  /** Explain code with structured breakdown. */
  async explainCode(code: string, language?: string): Promise<CodeExplanationResult> {
    this.stats.totalRequests++
    this.stats.totalCodeExplanations++
    this.stats.localRequests++
    const start = Date.now()
    const result = this.localBrain.explainCode(code, language)
    this.addDebugLog(
      'explainCode',
      code.substring(0, 200),
      result.summary,
      result.summary,
      Date.now() - start,
    )
    return result
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  Coding Training Intelligence — Exercises, evaluation, skill tracking    ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** Generate a coding exercise with description, starter code, hints, and solution. */
  async generateExercise(
    topic: string,
    difficulty: ExerciseDifficulty,
    language: string,
  ): Promise<CodingExercise> {
    this.stats.totalRequests++
    this.stats.totalExercisesGenerated++
    this.stats.localRequests++
    return this.buildExerciseLocally(topic, difficulty, language)
  }

  /** Evaluate a code submission against an exercise. */
  async evaluateCode(
    code: string,
    exercise: CodingExercise,
    language: string,
  ): Promise<CodeEvaluation> {
    this.stats.totalRequests++
    this.stats.totalCodeEvaluations++
    this.stats.localRequests++
    return this.evaluateCodeLocally(code, exercise, language)
  }

  /** Assess the user's coding skill level based on interaction history. */
  getCodingSkillAssessment(language: string): SkillAssessment {
    this.stats.totalRequests++
    this.stats.totalSkillAssessments++

    const localStats = this.localBrain.getStats() as LocalBrainStats
    const patternCount = this.localBrain.getLearnedPatternCount()
    const _knowledgeSize = this.localBrain.getKnowledgeBaseSize()
    const totalInteractions =
      localStats.totalChats + localStats.totalCodeGenerations + localStats.totalCodeReviews

    // Determine skill level based on interaction depth
    let level: ExerciseDifficulty = 'beginner'
    if (totalInteractions > 200 && patternCount > 100) {
      level = 'expert'
    } else if (totalInteractions > 100 && patternCount > 50) {
      level = 'advanced'
    } else if (totalInteractions > 30 && patternCount > 15) {
      level = 'intermediate'
    }

    // Analyze strengths/weaknesses from knowledge base
    const strengths: string[] = []
    const weaknesses: string[] = []
    const knowledgeResults = this.localBrain.searchKnowledge(language, 20)

    if (knowledgeResults.length > 10) {
      strengths.push(`Strong ${language} knowledge base (${knowledgeResults.length} entries)`)
    } else if (knowledgeResults.length > 0) {
      strengths.push(`Basic ${language} knowledge (${knowledgeResults.length} entries)`)
    } else {
      weaknesses.push(`Limited ${language}-specific knowledge`)
    }

    if (localStats.totalCodeReviews > 10) {
      strengths.push('Active code review practice')
    } else {
      weaknesses.push('Could benefit from more code reviews')
    }

    if (localStats.totalCodeAnalyses > 5) {
      strengths.push('Regular code analysis habits')
    }

    if (localStats.totalCodeFixes > 5) {
      strengths.push('Experience with code fixing')
    } else {
      weaknesses.push('Limited experience with automated code fixing')
    }

    if (localStats.totalDecompositions > 3) {
      strengths.push('Task decomposition skills')
    }

    let codeQualityTrend: 'improving' | 'stable' | 'declining' = 'stable'
    if (this.stats.autoLearnCount > 20 && patternCount > 30) {
      codeQualityTrend = 'improving'
    }

    const recommendedTopics = this.getRecommendedTopics(language, level, knowledgeResults.length)

    return {
      language,
      level,
      strengths,
      weaknesses,
      totalInteractions,
      codeQualityTrend,
      recommendedTopics,
    }
  }

  /** Create a personalized training plan with topics, exercises, and milestones. */
  getTrainingPlan(language: string, skillLevel: ExerciseDifficulty, goals: string[]): TrainingPlan {
    this.stats.totalRequests++
    this.stats.totalTrainingPlans++

    const levelOrder: ExerciseDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert']
    const currentIdx = levelOrder.indexOf(skillLevel)
    const targetLevel = levelOrder[Math.min(currentIdx + 1, levelOrder.length - 1)]!

    const topics = this.buildTrainingTopics(language, skillLevel, goals)

    const estimatedWeeks = Math.max(2, topics.length * (skillLevel === 'beginner' ? 2 : 1))
    const dailyMinutes = skillLevel === 'beginner' ? 30 : skillLevel === 'intermediate' ? 45 : 60

    return {
      language,
      currentLevel: skillLevel,
      targetLevel,
      topics,
      estimatedWeeks,
      dailyMinutes,
    }
  }

  /** Explain a programming concept at a given difficulty level with examples. */
  async explainConcept(
    concept: string,
    language?: string,
    difficulty?: ExerciseDifficulty,
  ): Promise<{
    concept: string
    explanation: string
    examples: string[]
    relatedConcepts: string[]
    difficulty: ExerciseDifficulty
  }> {
    this.stats.totalRequests++
    this.stats.localRequests++
    const diff = difficulty ?? 'intermediate'

    const knowledgeResults = this.localBrain.searchKnowledge(concept, 5)
    const localExplanation =
      knowledgeResults.length > 0
        ? knowledgeResults.map(r => r.entry.content).join('\n\n')
        : `${concept} is a programming concept commonly used in software development.`

    const relatedConcepts = knowledgeResults
      .flatMap(r => r.matchedKeywords)
      .filter(k => k.toLowerCase() !== concept.toLowerCase())
      .slice(0, 5)

    return {
      concept,
      explanation: localExplanation,
      examples: language
        ? [`See ${language} documentation for practical examples of ${concept}.`]
        : [`See language documentation for practical examples of ${concept}.`],
      relatedConcepts,
      difficulty: diff,
    }
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  Persistence                                                             ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** Serialize the complete DevBrain state. */
  serializeState(): string {
    const state: DevBrainState = {
      config: { ...this.config },
      localBrainState: this.localBrain.serializeBrain(),
      stats: this.stats,
      debugLog: this.config.debugMode ? this.debugLog : [],
    }
    return JSON.stringify(state)
  }

  /** Restore a DevBrain from serialized state. */
  static deserializeState(json: string): DevBrain {
    const state = JSON.parse(json) as DevBrainState
    const brain = new DevBrain(state.config)

    brain.localBrain = LocalBrain.deserializeBrain(state.localBrainState)
    brain.stats = state.stats
    brain.debugLog = state.debugLog

    return brain
  }

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  PRIVATE — Internal helpers                                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  /** Extract key topics from a message. */
  private extractKeyTopics(message: string): string[] {
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'can',
      'shall',
      'to',
      'of',
      'in',
      'for',
      'on',
      'with',
      'at',
      'by',
      'from',
      'as',
      'into',
      'through',
      'during',
      'before',
      'after',
      'above',
      'below',
      'between',
      'out',
      'off',
      'over',
      'under',
      'again',
      'further',
      'then',
      'once',
      'here',
      'there',
      'when',
      'where',
      'why',
      'how',
      'all',
      'each',
      'every',
      'both',
      'few',
      'more',
      'most',
      'other',
      'some',
      'such',
      'no',
      'not',
      'only',
      'same',
      'so',
      'than',
      'too',
      'very',
      'just',
      'because',
      'but',
      'and',
      'or',
      'if',
      'what',
      'which',
      'who',
      'this',
      'that',
      'these',
      'those',
      'me',
      'my',
      'you',
      'your',
      'it',
      'its',
      'we',
      'they',
      'them',
      'about',
    ])

    return message
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
      .slice(0, this.config.maxExtractedKeywords)
  }

  /** Add a debug log entry. */
  private addDebugLog(
    action: string,
    input: string,
    localThinking: string | undefined,
    finalOutput: string,
    durationMs: number,
  ): void {
    if (!this.config.debugMode) return

    this.debugLog.push({
      timestamp: new Date().toISOString(),
      action,
      input: input.substring(0, 500),
      localThinking: localThinking?.substring(0, 500),
      finalOutput: finalOutput.substring(0, 500),
      durationMs,
      provider: 'local',
    })
  }

  /** Inject developer-focused knowledge into the local brain. */
  private injectDevKnowledge(): void {
    const devKnowledge = [
      {
        category: 'dev-tools',
        keywords: ['debug', 'debugger', 'breakpoint', 'gdb', 'lldb', 'devtools'],
        content:
          'Debugging tools: GDB/LLDB (native code), Chrome DevTools (JS), VS Code debugger (multi-lang), strace/dtrace (system calls), Wireshark (network), Valgrind (memory). Always use breakpoints over printf debugging for complex issues.',
      },
      {
        category: 'dev-security',
        keywords: ['reverse', 'engineer', 'binary', 'disassemble', 'decompile', 'exploit'],
        content:
          'Reverse engineering tools: IDA Pro, Ghidra (free, NSA), Binary Ninja, radare2/Cutter. For web: Burp Suite, OWASP ZAP. Binary analysis: objdump, nm, readelf, file, strings. Dynamic: ltrace, strace, frida. Memory: Valgrind, AddressSanitizer.',
      },
      {
        category: 'dev-internals',
        keywords: ['memory', 'allocation', 'heap', 'stack', 'garbage', 'collector', 'runtime'],
        content:
          'Memory management: Stack (LIFO, auto-cleanup, fast), Heap (dynamic, malloc/free/new/delete), GC strategies (mark-sweep, generational, concurrent). V8 internals: Ignition interpreter → TurboFan JIT. Memory layouts: vtable, padding, alignment. Use AddressSanitizer for memory bugs.',
      },
      {
        category: 'dev-networking',
        keywords: ['socket', 'tcp', 'udp', 'http', 'network', 'protocol', 'packet'],
        content:
          'Network programming: TCP (reliable, ordered, streams), UDP (fast, unreliable, datagrams). Socket programming: socket() → bind() → listen() → accept(). HTTP/2 multiplexing, HTTP/3 QUIC. Raw sockets for packet crafting. Use epoll/kqueue for scalable I/O.',
      },
      {
        category: 'dev-systems',
        keywords: ['kernel', 'os', 'syscall', 'process', 'thread', 'ipc', 'signal'],
        content:
          'Systems programming: System calls (read, write, open, fork, exec, mmap, ioctl). Process management: fork/exec, waitpid, signals. IPC: pipes, shared memory, message queues, Unix domain sockets. Threading: pthreads, mutexes, condition variables, read-write locks.',
      },
      {
        category: 'dev-crypto',
        keywords: ['crypto', 'encrypt', 'hash', 'cipher', 'key', 'certificate', 'tls', 'ssl'],
        content:
          'Cryptography: Symmetric (AES-256-GCM), Asymmetric (RSA, Ed25519, X25519), Hash (SHA-256, SHA-3, BLAKE3), KDF (Argon2, scrypt, bcrypt). TLS 1.3 handshake, certificate pinning, perfect forward secrecy. Never roll your own crypto.',
      },
      {
        category: 'dev-perf',
        keywords: ['profile', 'benchmark', 'optimize', 'performance', 'flamegraph', 'cache'],
        content:
          'Performance: Profile first (perf, flamegraphs, pprof). CPU: branch prediction, cache lines (64B), SIMD, loop unrolling. Memory: spatial/temporal locality, avoid false sharing. I/O: io_uring (Linux), batch operations, memory-mapped files. Benchmark: criterion (Rust), JMH (Java), hyperfine (CLI).',
      },
      {
        category: 'dev-containers',
        keywords: ['docker', 'container', 'kubernetes', 'k8s', 'pod', 'namespace', 'cgroup'],
        content:
          'Container internals: namespaces (PID, NET, MNT, UTS, IPC, USER), cgroups (resource limits), overlay filesystems. Docker: multi-stage builds, layer caching, health checks. K8s: pods, services, deployments, ingress, HPA, PDB. Use distroless/scratch base images for security.',
      },
      {
        category: 'training-exercises',
        keywords: ['exercise', 'practice', 'coding', 'challenge', 'problem', 'kata'],
        content:
          'Coding exercises best practices: Start with clear problem statements, provide starter code scaffolding, include hints of increasing specificity, always provide a reference solution, test edge cases, match difficulty to skill level. Use progressive difficulty: beginner (syntax, loops), intermediate (data structures, algorithms), advanced (system design, optimization), expert (concurrency, distributed systems).',
      },
      {
        category: 'training-topics',
        keywords: ['training', 'topics', 'curriculum', 'learning', 'path', 'roadmap'],
        content:
          'Common training topics per language — JavaScript/TypeScript: closures, promises, async/await, generics, type guards, decorators. Python: generators, decorators, context managers, metaclasses, asyncio. Rust: ownership, borrowing, lifetimes, traits, async. Go: goroutines, channels, interfaces, error handling. Java: generics, streams, concurrency, design patterns. Universal: algorithms, data structures, design patterns, testing, debugging.',
      },
      {
        category: 'training-assessment',
        keywords: ['assessment', 'skill', 'level', 'evaluate', 'measure', 'progress'],
        content:
          'Skill assessment criteria: Code correctness (does it work?), code quality (readability, naming, structure), efficiency (time/space complexity), error handling (edge cases, validation), testing (unit tests, coverage), design (patterns, SOLID, modularity), documentation (comments, JSDoc), security awareness. Levels: beginner (syntax mastery), intermediate (patterns & libraries), advanced (architecture & optimization), expert (systems design & mentoring).',
      },
      {
        category: 'training-algorithms',
        keywords: ['algorithm', 'sort', 'search', 'graph', 'dynamic', 'programming', 'tree'],
        content:
          'Algorithm training patterns: Sorting (bubble, merge, quick, heap — understand tradeoffs). Searching (binary search, BFS, DFS, A*). Dynamic programming (memoization, tabulation, optimal substructure). Graph algorithms (Dijkstra, Bellman-Ford, topological sort, MST). Tree traversals (inorder, preorder, postorder, level-order). String algorithms (KMP, Rabin-Karp, trie). Practice pattern: understand → implement → analyze complexity → optimize → apply to real problems.',
      },
    ]

    for (const entry of devKnowledge) {
      this.localBrain.addKnowledge(entry.category, entry.keywords, entry.content)
    }
  }

  /** Update running average for local latency. */
  private updateLocalLatency(ms: number): void {
    const n = this.stats.localRequests
    this.stats.avgLocalLatencyMs = n <= 1 ? ms : (this.stats.avgLocalLatencyMs * (n - 1) + ms) / n
  }

  /** Build a coding exercise using local knowledge (no API needed). */
  private buildExerciseLocally(
    topic: string,
    difficulty: ExerciseDifficulty,
    language: string,
  ): CodingExercise {
    const difficultyMinutes: Record<ExerciseDifficulty, number> = {
      beginner: 15,
      intermediate: 30,
      advanced: 60,
      expert: 90,
    }

    const exerciseTemplates: Record<ExerciseDifficulty, { prefix: string; concepts: string[] }> = {
      beginner: {
        prefix: 'Implement a basic',
        concepts: ['variables', 'loops', 'conditionals', 'functions', 'arrays'],
      },
      intermediate: {
        prefix: 'Build a',
        concepts: ['data structures', 'algorithms', 'error handling', 'classes', 'modules'],
      },
      advanced: {
        prefix: 'Design and implement a',
        concepts: ['design patterns', 'optimization', 'concurrency', 'architecture', 'testing'],
      },
      expert: {
        prefix: 'Architect a production-grade',
        concepts: [
          'distributed systems',
          'performance tuning',
          'security',
          'scalability',
          'system design',
        ],
      },
    }

    const template = exerciseTemplates[difficulty]
    const title = `${template.prefix} ${topic}`
    const description = `${template.prefix} ${topic} in ${language}. Focus on clean code, proper error handling, and ${difficulty}-level best practices.`

    const starterCode = this.getStarterCode(language, topic)
    const solution = this.getSolutionTemplate(language, topic)

    return {
      title,
      description,
      difficulty,
      language,
      starterCode,
      hints: [
        `Start by defining the main function or class for ${topic}.`,
        `Consider edge cases and input validation.`,
        `Think about the time and space complexity of your solution.`,
      ],
      solution,
      concepts: template.concepts.slice(0, 3),
      estimatedMinutes: difficultyMinutes[difficulty],
    }
  }

  /** Get starter code template for an exercise. */
  private getStarterCode(language: string, topic: string): string {
    const templates: Record<string, string> = {
      typescript: `// ${topic}\n// TODO: Implement your solution here\n\nexport function solve(input: unknown): unknown {\n  // Your code here\n  throw new Error('Not implemented')\n}\n`,
      javascript: `// ${topic}\n// TODO: Implement your solution here\n\nfunction solve(input) {\n  // Your code here\n  throw new Error('Not implemented')\n}\n\nmodule.exports = { solve }\n`,
      python: `# ${topic}\n# TODO: Implement your solution here\n\ndef solve(input):\n    """Your solution here."""\n    raise NotImplementedError()\n`,
      rust: `// ${topic}\n// TODO: Implement your solution here\n\npub fn solve(input: &str) -> String {\n    todo!()\n}\n`,
      go: `package main\n\n// ${topic}\n// TODO: Implement your solution here\n\nfunc solve(input string) string {\n\tpanic("not implemented")\n}\n`,
      java: `// ${topic}\n// TODO: Implement your solution here\n\npublic class Solution {\n    public static Object solve(Object input) {\n        throw new UnsupportedOperationException("Not implemented");\n    }\n}\n`,
    }
    return (
      templates[language.toLowerCase()] ??
      `// ${topic}\n// TODO: Implement your solution in ${language}\n`
    )
  }

  /** Get solution template for an exercise. */
  private getSolutionTemplate(language: string, topic: string): string {
    const templates: Record<string, string> = {
      typescript: `// ${topic} — Reference Solution\n\nexport function solve(input: unknown): unknown {\n  // Reference implementation\n  return input\n}\n`,
      javascript: `// ${topic} — Reference Solution\n\nfunction solve(input) {\n  // Reference implementation\n  return input\n}\n\nmodule.exports = { solve }\n`,
      python: `# ${topic} — Reference Solution\n\ndef solve(input):\n    """Reference implementation."""\n    return input\n`,
      rust: `// ${topic} — Reference Solution\n\npub fn solve(input: &str) -> String {\n    input.to_string()\n}\n`,
      go: `package main\n\n// ${topic} — Reference Solution\n\nfunc solve(input string) string {\n\treturn input\n}\n`,
      java: `// ${topic} — Reference Solution\n\npublic class Solution {\n    public static Object solve(Object input) {\n        return input;\n    }\n}\n`,
    }
    return templates[language.toLowerCase()] ?? `// ${topic} — Reference Solution in ${language}\n`
  }

  /** Evaluate code submission locally. */
  private evaluateCodeLocally(
    code: string,
    exercise: CodingExercise,
    language: string,
  ): CodeEvaluation {
    const feedback: string[] = []
    const improvements: string[] = []
    const conceptsUsed: string[] = []
    let score = BASE_EVALUATION_SCORE

    const lines = code
      .trim()
      .split('\n')
      .filter(l => l.trim().length > 0)
    if (lines.length === 0) {
      return {
        score: 0,
        passed: false,
        feedback: ['Empty submission — no code provided.'],
        improvements: ['Start by implementing the basic structure.'],
        conceptsUsed: [],
        codeQuality: 'poor',
      }
    }

    if (lines.length >= 5) {
      score += 10
      feedback.push('Good code structure with meaningful content.')
    }

    if (
      code.includes('try') ||
      code.includes('catch') ||
      code.includes('except') ||
      code.includes('Error')
    ) {
      score += 10
      conceptsUsed.push('error handling')
      feedback.push('Good: Includes error handling.')
    } else {
      improvements.push('Consider adding error handling for edge cases.')
    }

    if (code.includes('//') || code.includes('#') || code.includes('/**') || code.includes('"""')) {
      score += 5
      conceptsUsed.push('documentation')
      feedback.push('Good: Code is documented.')
    } else {
      improvements.push('Add comments to explain your approach.')
    }

    if (language === 'typescript' && (code.includes(': ') || code.includes('<'))) {
      score += 5
      conceptsUsed.push('type safety')
    }

    if (
      code.includes('function') ||
      code.includes('def ') ||
      code.includes('class ') ||
      code.includes('=>')
    ) {
      score += 5
      conceptsUsed.push('modular design')
    }

    for (const concept of exercise.concepts) {
      const conceptLower = concept.toLowerCase()
      if (code.toLowerCase().includes(conceptLower)) {
        score += 5
        conceptsUsed.push(concept)
      }
    }

    score = Math.min(100, score)
    const passed = score >= 60

    let codeQuality: 'poor' | 'fair' | 'good' | 'excellent' = 'fair'
    if (score >= 90) codeQuality = 'excellent'
    else if (score >= 75) codeQuality = 'good'
    else if (score >= 50) codeQuality = 'fair'
    else codeQuality = 'poor'

    if (passed) {
      feedback.push('Submission meets the basic requirements.')
    } else {
      feedback.push('Submission needs more work to meet the requirements.')
    }

    return { score, passed, feedback, improvements, conceptsUsed, codeQuality }
  }

  /** Get recommended training topics based on skill gaps. */
  private getRecommendedTopics(
    language: string,
    level: ExerciseDifficulty,
    knowledgeCount: number,
  ): string[] {
    const topicsByLevel: Record<ExerciseDifficulty, string[]> = {
      beginner: [
        'variables and types',
        'control flow',
        'functions',
        'arrays and loops',
        'basic I/O',
      ],
      intermediate: ['data structures', 'algorithms', 'error handling', 'testing', 'OOP patterns'],
      advanced: [
        'design patterns',
        'performance optimization',
        'concurrency',
        'architecture',
        'security',
      ],
      expert: [
        'distributed systems',
        'compiler internals',
        'memory management',
        'system design',
        'mentoring',
      ],
    }

    const topics = topicsByLevel[level] ?? topicsByLevel.intermediate
    if (knowledgeCount < 5) {
      return [`${language} fundamentals`, ...topics.slice(0, 4)]
    }
    return topics
  }

  /** Build training topics for a training plan. */
  private buildTrainingTopics(
    language: string,
    skillLevel: ExerciseDifficulty,
    goals: string[],
  ): TrainingTopic[] {
    const topics: TrainingTopic[] = []
    let order = 1

    const coreTopic: Record<ExerciseDifficulty, Array<{ name: string; desc: string }>> = {
      beginner: [
        {
          name: 'Syntax Fundamentals',
          desc: `Learn ${language} syntax, types, and basic operations`,
        },
        { name: 'Control Flow', desc: 'Master conditionals, loops, and iteration patterns' },
        { name: 'Functions', desc: 'Write reusable functions with proper parameters and returns' },
        { name: 'Data Structures', desc: 'Work with arrays, objects, and collections' },
      ],
      intermediate: [
        {
          name: 'Advanced Data Structures',
          desc: 'Implement stacks, queues, trees, and hash maps',
        },
        { name: 'Algorithm Design', desc: 'Learn sorting, searching, and recursive algorithms' },
        { name: 'Error Handling', desc: 'Build robust code with comprehensive error handling' },
        { name: 'Testing', desc: 'Write unit tests and practice TDD' },
        { name: 'Design Patterns', desc: 'Apply common design patterns in practice' },
      ],
      advanced: [
        {
          name: 'Architecture Patterns',
          desc: 'Design modular, scalable application architectures',
        },
        { name: 'Performance', desc: 'Profile and optimize code for speed and memory' },
        { name: 'Concurrency', desc: 'Handle async operations, threading, and parallelism' },
        {
          name: 'Security',
          desc: 'Implement secure coding practices and vulnerability prevention',
        },
      ],
      expert: [
        { name: 'System Design', desc: 'Design large-scale distributed systems' },
        { name: 'Compiler & Runtime', desc: 'Understand language internals and optimization' },
        { name: 'Open Source Contribution', desc: 'Contribute to major open source projects' },
      ],
    }

    const coreTopics = coreTopic[skillLevel] ?? coreTopic.intermediate
    for (const ct of coreTopics) {
      topics.push({
        name: ct.name,
        description: ct.desc,
        difficulty: skillLevel,
        exercises: [
          `Implement a ${ct.name.toLowerCase()} exercise in ${language}`,
          `Solve a real-world problem using ${ct.name.toLowerCase()}`,
        ],
        resources: [
          `${language} documentation on ${ct.name.toLowerCase()}`,
          `Practice problems for ${ct.name.toLowerCase()}`,
        ],
        order: order++,
      })
    }

    for (const goal of goals.slice(0, 3)) {
      topics.push({
        name: goal,
        description: `Focused training on: ${goal} in ${language}`,
        difficulty: skillLevel,
        exercises: [`Build a project using ${goal}`, `Complete a ${goal} coding challenge`],
        resources: [`${goal} best practices`, `${language} ${goal} guide`],
        order: order++,
      })
    }

    return topics
  }
}
