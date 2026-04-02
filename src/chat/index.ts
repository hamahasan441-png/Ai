/**
 * 🤖 Advanced AI — Complete Integrated System
 *
 * This module exports the ENTIRE AI system built from ALL repository files:
 *
 *   • AiChat.ts         → Core brain (chat, code, images, search, analytics)
 *   • AiIntegration.ts  → Integration layer (38 tools, 50+ commands, services)
 *   • LocalBrain.ts     → Standalone offline brain (self-learning, no API needed)
 *   • HybridBrain.ts    → Cloud + Offline hybrid (auto-fallback, self-learning)
 *   • DevBrain.ts       → Private developer brain (LocalBrain + OpenAI, unrestricted)
 *
 * The IntegratedAI class uses ALL 1,886 source files across 36+ modules.
 *
 * @example
 * ```ts
 * import { IntegratedAI, ALL_TOOLS, MODULE_DIRECTORY } from './chat/index.js'
 *
 * // Create AI that uses ALL repository modules
 * const ai = new IntegratedAI({
 *   title: 'Full AI Session',
 *   apiKey: 'sk-ant-...',
 *   model: 'claude-sonnet-4-20250514',
 * })
 *
 * // 🌐🧠 Create HYBRID AI — cloud + offline with auto-learning
 * const hybridAi = new IntegratedAI({
 *   title: 'Hybrid AI Session',
 *   apiKey: 'sk-ant-...',
 *   mode: 'hybrid',  // Uses Claude Opus 4.6 + LocalBrain auto-fallback
 * })
 *
 * // 💬 Chat (uses AiChat.ts AI Brain → Claude API)
 * await ai.chat_send('Explain how this project works')
 *
 * // 💻 Write code (uses AiChat.ts Code Writer — 24 languages)
 * await ai.writeCode({ description: 'REST API', language: 'typescript', style: 'production' })
 *
 * // 🖼 Analyze images (uses AiChat.ts Image Analyzer — like Claude Opus vision)
 * await ai.analyzeImage({ imageData: base64, mediaType: 'image/png' })
 *
 * // 🔧 Use any of the 38 tools (from src/tools/*)
 * console.log(`Tools available: ${ai.getToolCount()}`)  // 38
 *
 * // 📋 Use any of 50+ commands (from src/commands/*)
 * const cmds = await ai.getAvailableCommands()
 *
 * // 🌍 Get project context (from src/context.ts)
 * const ctx = await ai.getProjectContext()
 *
 * // 🧠 Load AI memory (from src/memdir/)
 * const memory = await ai.loadMemory()
 *
 * // 💰 Track costs (from src/cost-tracker.ts)
 * const costs = ai.getCostStats()
 *
 * // 📊 Full stats combining ALL modules
 * const stats = ai.getFullStats()
 *
 * // 📖 See what every module does
 * console.log(MODULE_DIRECTORY)
 * ```
 *
 * @example
 * ```ts
 * // 🧠 Standalone offline AI (no API key needed)
 * import { LocalBrain } from './chat/index.js'
 *
 * const brain = new LocalBrain({ learningEnabled: true })
 *
 * // Chat offline
 * const response = await brain.chat('How do I sort an array in Python?')
 *
 * // Write code offline
 * const code = await brain.writeCode({ description: 'binary search', language: 'typescript' })
 *
 * // Teach the brain
 * brain.learn('What is Redux?', 'Redux is a state management library for JavaScript apps.')
 *
 * // Save brain state
 * const state = brain.serializeBrain()
 * const restored = LocalBrain.deserializeBrain(state)
 * ```
 *
 * @example
 * ```ts
 * // 🌐🧠 Hybrid Brain — Cloud API + Offline (auto-fallback + self-learning)
 * import { HybridBrain } from './chat/index.js'
 *
 * const brain = new HybridBrain({
 *   apiKey: 'sk-ant-...',
 *   deepThinking: true,  // Claude Opus 4.6 level reasoning
 * })
 *
 * // Uses cloud when available, falls back to offline seamlessly
 * const response = await brain.chat('Design a microservices architecture')
 *
 * // Cloud responses automatically train the offline brain
 * // Over time, offline gets smarter from cloud interactions!
 *
 * // Check status
 * console.log(brain.isCloudAvailable())  // true/false
 * console.log(brain.getStats())          // { cloudRequests, offlineRequests, autoLearnCount, ... }
 *
 * // Manually teach the brain
 * brain.teach('What is event sourcing?', 'Event sourcing stores state as a sequence of events...')
 *
 * // Persist hybrid state (preserves ALL learned knowledge)
 * const state = brain.serializeState()
 * const restored = HybridBrain.deserializeState(state)
 * ```
 *
 * @example
 * ```ts
 * // 🔓🧠 DevBrain — Private developer brain (LocalBrain + OpenAI, unrestricted)
 * import { DevBrain } from './chat/index.js'
 *
 * const dev = new DevBrain({ openaiApiKey: 'sk-...' })
 *
 * // Chat — local brain thinks first, OpenAI enhances
 * const response = await dev.chat('How do I reverse-engineer this binary?')
 *
 * // Raw prompt — bypass local thinking, direct to OpenAI
 * const raw = await dev.rawPrompt('Explain V8 memory internals')
 *
 * // System override — custom persona for one request
 * const custom = await dev.chatWithSystem('You are a kernel dev', 'Explain mmap')
 *
 * // Write code — no restrictions
 * const code = await dev.writeCode({ description: 'TCP port scanner', language: 'python' })
 *
 * // Debug log — see what happened
 * console.log(dev.getDebugLog())
 * ```
 */

// ══════════════════════════════════════════════════════════════════════════════
// INTEGRATED AI — Uses ALL repository files (src/chat/AiIntegration.ts)
// ══════════════════════════════════════════════════════════════════════════════
export {
  IntegratedAI,
  ALL_TOOLS,
  TOOL_COUNT,
  MODULE_DIRECTORY,
  TOTAL_MODULES,
  TOTAL_SOURCE_FILES,
} from './AiIntegration.js'

// ══════════════════════════════════════════════════════════════════════════════
// AI CHAT BRAIN — Core intelligence (src/chat/AiChat.ts)
// ══════════════════════════════════════════════════════════════════════════════

// ── Main Classes ──
export { AdvancedChat, AiBrain } from './AiChat.js'

// ── Search Functions ──
export { searchMessages, searchByTool, getPinnedMessages } from './AiChat.js'

// ── Analytics Functions ──
export { computeAnalytics, getTopTools, getTurnBreakdown } from './AiChat.js'

// ── Export Functions ──
export { exportConversation } from './AiChat.js'

// ── Code Writer Functions ──
export {
  detectLanguage,
  countLinesOfCode,
  estimateComplexity,
  getCodeTemplate,
  getLanguageInfo,
  formatCode,
} from './AiChat.js'

// ── Image Analyzer Functions ──
export {
  isSupportedImageType,
  validateImageData,
  estimateImageSize,
  buildImageContentBlock,
  createImageBlock,
  parseImageAnalysis,
} from './AiChat.js'

// ══════════════════════════════════════════════════════════════════════════════
// LOCAL BRAIN — Standalone offline AI (src/chat/LocalBrain.ts)
// ══════════════════════════════════════════════════════════════════════════════
export { LocalBrain } from './LocalBrain.js'

export type {
  LocalBrainConfig,
  KnowledgeEntry,
  LearnedPattern,
  KnowledgeSearchResult,
  LocalBrainState,
  LocalBrainStats,
  LearnedPatternPriority,
  PatternConflict,
  CodeCompletionResult,
  CodeExplanationResult,
  ReasoningResult,
  ReasoningStep,
  MultiFileResult,
  GeneratedFile,
  UserPreferences,
  ConversationContext,
  RefactoringSuggestion,
} from './LocalBrain.js'

// ══════════════════════════════════════════════════════════════════════════════
// CODEMASTER — Deep code intelligence sub-modules (src/chat/codemaster/)
// ══════════════════════════════════════════════════════════════════════════════
export { CodeAnalyzer } from './codemaster/CodeAnalyzer.js'
export { CodeReviewer } from './codemaster/CodeReviewer.js'
export { CodeFixer } from './codemaster/CodeFixer.js'
export { ProblemDecomposer } from './codemaster/ProblemDecomposer.js'
export { LearningEngine } from './codemaster/LearningEngine.js'

export type {
  Severity,
  AnalysisLanguage,
  AnalysisDepth,
  ComplexityMetrics,
  AntiPattern,
  DependencyInfo,
  CodeSmell,
  SecurityIssue,
  CodeAnalysis,
  ReviewCategory,
  ReviewFinding,
  ReviewSummary,
  CodeFix,
  CodeReviewOutput,
  FixResult,
  TaskIntent,
  StepStatus,
  TaskStep,
  TaskPlan,
  ReviewPattern,
  FixPattern,
  LearningStats,
  SecurityCheckLevel,
  CodeMasterBrainConfig,
  CodeMasterBrainStats,
  CodeMasterBrainState,
} from './codemaster/types.js'

// ══════════════════════════════════════════════════════════════════════════════
// INTELLIGENCE MODULES — Advanced cognitive capabilities (src/chat/)
// ══════════════════════════════════════════════════════════════════════════════

// ── Semantic Engine — Semantic similarity and document matching ──
export { SemanticEngine } from './SemanticEngine.js'
export { cosineSimilarity as semanticCosineSimilarity } from './SemanticEngine.js'

export type {
  SemanticConfig,
  SemanticDocument,
  SimilarityResult,
  WordVector,
} from './SemanticEngine.js'

// ── Intent Engine — Intent detection and entity extraction ──
export { IntentEngine } from './IntentEngine.js'

export type {
  IntentLabel,
  EntityType,
  DetectedIntent,
  ExtractedEntity,
  IntentResult,
  ConversationTurn,
  ResolvedIntent,
  IntentEngineConfig,
} from './IntentEngine.js'

// ── Context Manager — Sliding-window context with topic & entity tracking ──
export { ContextManager } from './ContextManager.js'

export type {
  ContextTurn,
  TopicInfo,
  TrackedEntity,
  ContextSummary,
  ContextStats,
  ContextManagerConfig,
} from './ContextManager.js'

// ── Reasoning Engine — Chain-of-thought reasoning with 4-phase pipeline ──
export { ReasoningEngine } from './ReasoningEngine.js'

export type {
  ReasoningContext,
  ReasoningStep2,
  ChainOfThoughtResult,
  ConstraintType,
  Constraint,
  SubProblem,
  SolutionScore,
  ReasoningEngineConfig,
} from './ReasoningEngine.js'

// ── Meta Cognition — Confidence assessment and knowledge gap detection ──
export { MetaCognition } from './MetaCognition.js'

export type {
  EpistemicState,
  ConfidenceFactor,
  ConfidenceAssessment,
  CalibrationRecord,
  KnowledgeGap,
  ReflectionResult,
  MetaCognitionConfig,
  MetaCognitionStats,
} from './MetaCognition.js'

// ══════════════════════════════════════════════════════════════════════════════
// ADVANCED INTELLIGENCE — Semantic Training Layer (src/chat/)
// ══════════════════════════════════════════════════════════════════════════════

// ── Semantic Memory — Persistent knowledge graph with spreading activation ──
export { SemanticMemory, createProgrammingKnowledgeGraph } from './SemanticMemory.js'

export type {
  RelationType,
  ConceptNode,
  ConceptEdge,
  SemanticMemoryConfig,
  SemanticMemoryStats,
  ActivationResult,
  ConceptCluster,
  Neighborhood,
  ExtractedRelationship,
} from './SemanticMemory.js'

// ── Semantic Trainer — Online learning and domain adaptation ──
export { SemanticTrainer } from './SemanticTrainer.js'

export type {
  DomainType,
  TrainingExample,
  TrainingSnapshot,
  FeedbackSignal,
  DomainProfile,
  TrainerStats,
  SemanticTrainerConfig,
  VocabularyEntry,
} from './SemanticTrainer.js'

// ── Analogical Reasoner — Cross-domain analogy and transfer learning ──
export { AnalogicalReasoner } from './AnalogicalReasoner.js'

export type {
  StructureElement,
  StructureMapping,
  AnalogyResult,
  AnalogyPattern,
  TransferResult,
  AnalogicalReasonerConfig,
  AnalogicalReasonerStats,
} from './AnalogicalReasoner.js'

// ── Topic Modeler — Unsupervised topic discovery and user profiling ──
export { TopicModeler } from './TopicModeler.js'

export type {
  Topic,
  TopicAssignment,
  DocumentTopics,
  TopicDrift,
  UserInterestProfile,
  TopicHierarchy,
  TopicModelerConfig,
  TopicModelerStats,
} from './TopicModeler.js'

// ══════════════════════════════════════════════════════════════════════════════
// TF-IDF SCORER — Semantic similarity for pattern matching (src/chat/TfIdfScorer.ts)
// ══════════════════════════════════════════════════════════════════════════════
export { TfIdfScorer, tokenize, cosineSimilarity, ngramOverlapScore } from './TfIdfScorer.js'

export type { TfIdfDocument, TfIdfResult } from './TfIdfScorer.js'

// ══════════════════════════════════════════════════════════════════════════════
// HYBRID BRAIN — Cloud + Offline intelligence (src/chat/HybridBrain.ts)
// ══════════════════════════════════════════════════════════════════════════════
export { HybridBrain } from './HybridBrain.js'

export type {
  HybridBrainConfig,
  HybridBrainStats,
  HybridBrainState,
} from './HybridBrain.js'

// ══════════════════════════════════════════════════════════════════════════════
// DEV BRAIN — Private developer module (src/chat/DevBrain.ts)
// ══════════════════════════════════════════════════════════════════════════════
export { DevBrain } from './DevBrain.js'

export type {
  DevBrainConfig,
  DevBrainStats,
  DevBrainState,
  DevBrainLogEntry,
  OpenAIModel,
  ExerciseDifficulty,
  CodingExercise,
  CodeEvaluation,
  SkillAssessment,
  TrainingPlan,
  TrainingTopic,
} from './DevBrain.js'

// ── All Types ──
export type {
  // Messages
  ChatMessageId, ChatMessage, ChatRole, ContentBlock, ContentBlockType, TokenUsage,
  // Conversation
  Branch, BranchId, Conversation, ConversationMetadata,
  // Search
  SearchMode, ChatSearchOptions, ChatSearchResult, SearchHighlight,
  // Analytics
  ConversationAnalytics, ModelUsageBreakdown, CodeStats, ImageStats,
  // Export
  ExportFormat, ExportOptions,
  // Context Window
  MessagePriority, ContextWindowConfig, ContextWindowResult,
  // Code Writer
  ProgrammingLanguage, CodeRequest, CodeResult, CodeReviewRequest, CodeReviewResult, CodeIssue,
  // Image Analyzer
  ImageAnalysisRequest, ImageAnalysisResult,
  // AI Brain
  AiBrainConfig, ApiMessage, ApiContentBlock, BrainInterface,
} from './AiChat.js'
