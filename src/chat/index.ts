/**
 * 🤖 AI System — 100% Offline, Local-First Intelligence
 *
 * Two models, zero API dependencies:
 *
 *   • LocalBrain.ts  → Standalone offline brain (self-learning, 47 intelligence modules)
 *   • DevBrain.ts    → Coding practice agent (exercises, skill assessment, code review)
 *
 * All intelligence runs locally — no API keys, no network, no cloud.
 *
 * @example
 * ```ts
 * // 🧠 LocalBrain — Standalone offline AI
 * import { LocalBrain } from './chat/index.js'
 *
 * const brain = new LocalBrain({ learningEnabled: true })
 * const response = await brain.chat('How do I sort an array in Python?')
 * const code = await brain.writeCode({ description: 'binary search', language: 'typescript' })
 * brain.learn('What is Redux?', 'Redux is a state management library for JavaScript apps.')
 * ```
 *
 * @example
 * ```ts
 * // 💻 DevBrain — Offline coding practice agent
 * import { DevBrain } from './chat/index.js'
 *
 * const dev = new DevBrain()
 * const response = await dev.chat('Explain binary search')
 * const code = await dev.writeCode({ description: 'REST API server', language: 'typescript' })
 * const exercise = await dev.generateExercise('sorting', 'intermediate', 'python')
 * const plan = dev.getTrainingPlan('typescript', 'beginner', 'advanced')
 * ```
 */

// ══════════════════════════════════════════════════════════════════════════════
// SHARED TYPES & UTILITIES — Offline types (src/chat/types.ts)
// ══════════════════════════════════════════════════════════════════════════════

// ── Code Writer Functions ──
export {
  detectLanguage,
  countLinesOfCode,
  estimateComplexity,
  getCodeTemplate,
  getLanguageInfo,
  formatCode,
} from './types.js'

// ── Image Analyzer Functions ──
export {
  isSupportedImageType,
  validateImageData,
  estimateImageSize,
  buildImageContentBlock,
  createImageBlock,
  parseImageAnalysis,
} from './types.js'

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

// CODEMASTER v3 — Copilot-Agent-Level Intelligence
export { CodePlanner } from './codemaster/CodePlanner.js'
export { AutoRefactorer } from './codemaster/AutoRefactorer.js'
export { ContextGatherer } from './codemaster/ContextGatherer.js'
export { CodeGenerator } from './codemaster/CodeGenerator.js'
export { DiffEngine } from './codemaster/DiffEngine.js'
export { CommandRunner } from './codemaster/CommandRunner.js'
export { FileNavigator } from './codemaster/FileNavigator.js'
export { ConversationEngine } from './codemaster/ConversationEngine.js'
export { ErrorDiagnoser } from './codemaster/ErrorDiagnoser.js'
export { SecurityScanner } from './codemaster/SecurityScanner.js'

// ══════════════════════════════════════════════════════════════════════════════
// CODE AGENT — Smart coding engineer (file creation, scaffolding, exports)
// ══════════════════════════════════════════════════════════════════════════════
export { CodeAgent } from './CodeAgent.js'

export type {
  ProjectTemplate,
  ScaffoldLanguage,
  AgentFile,
  ScaffoldResult,
  CreateFileRequest,
  CreateFileResult,
  AddToFileRequest,
  AddToFileResult,
  ExportFromFileRequest,
  CodeAgentConfig,
  CodeAgentStats,
} from './CodeAgent.js'

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
// AI TOOLKIT BRIDGE — Diffusion model image/video generation (src/chat/AIToolkitBridge.ts)
// ══════════════════════════════════════════════════════════════════════════════
export { AIToolkitBridge, SUPPORTED_MODELS, quickImageConfig, quickLoRAConfig, listModels, recommendModel } from './AIToolkitBridge.js'

export type {
  ImageModel,
  ImageEditModel,
  VideoModel,
  ModelDtype,
  JobType,
  TrainProcessType,
  LoRATrainConfig,
  GenerateConfig,
  VideoGenerateConfig,
  ExtractConfig,
  AIToolkitBridgeConfig,
  AIToolkitStatus,
  JobResult,
  ActiveJob,
  ModelInfo,
} from './AIToolkitBridge.js'

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

// ── Ontology Manager — Hierarchical concept & taxonomy management ──
export { OntologyManager } from './OntologyManager.js'

export type {
  OntologyManagerConfig,
  OntologyConcept,
  OntologyRelation,
  OntologyProperty,
  // ConceptHierarchy — already exported from AbstractionEngine
  InheritancePath,
  OntologyQuery,
  OntologyQueryResult,
  OntologyValidation,
  OntologyManagerStats,
} from './OntologyManager.js'

// ── Bayesian Network — Probabilistic reasoning with directed graphical models ──
export { BayesianNetwork } from './BayesianNetwork.js'

export type {
  BayesianNetworkConfig,
  BayesianNode,
  BayesianEdge,
  ConditionalProbabilityTable,
  Evidence,
  InferenceResult,
  NetworkStructure,
  NetworkValidation,
  BayesianNetworkStats,
} from './BayesianNetwork.js'

// ── Temporal Reasoner — Time, events, sequences & temporal patterns ──
export { TemporalReasoner } from './TemporalReasoner.js'

export type {
  TimePoint,
  TimeInterval,
  TemporalEvent,
  EventSequence,
  TemporalRelation,
  TemporalConstraint,
  TemporalPattern,
  TimelineAnalysis,
  TemporalQuery,
  TemporalQueryResult,
  TemporalReasonerConfig,
  TemporalReasonerStats,
} from './TemporalReasoner.js'

// ── Normalization Engine — Text and data normalization, canonicalization ──
export { NormalizationEngine } from './NormalizationEngine.js'

export type {
  NormalizationEngineConfig,
  NormalizationRule,
  NormalizationPipeline,
  PipelineStep,
  NormalizedText,
  NormalizationChange,
  NormalizationResult,
  TokenNormalization,
  SynonymMap,
  TextProfile,
  NormalizationStats,
} from './NormalizationEngine.js'

// ── Emotion Engine — Sentiment analysis, emotion detection, empathetic response ──
export { EmotionEngine } from './EmotionEngine.js'

export type {
  EmotionEngineConfig,
  EmotionEngineStats,
  EmotionCategory,
  // SentimentResult — already exported from MarketAnalyzer
  EmotionDetection,
  EmpathyResponse,
  EmotionTimeline,
  EmotionalContext,
  EmotionPattern,
} from './EmotionEngine.js'

// ── Dialogue Manager — Dialogue state tracking, slot filling, conversation flow ──
export { DialogueManager } from './DialogueManager.js'

export type {
  DialogueManagerConfig,
  DialogueState,
  DialogueTurn,
  DialogueAct,
  DialogueSlot,
  SlotFillingResult,
  DialoguePolicy,
  DialogueGoal,
  ConversationFlow,
  FlowTransition,
  DialogueManagerStats,
} from './DialogueManager.js'

// ── Argument Analyzer — Argument mining, claim detection, fallacy analysis ──
export { ArgumentAnalyzer } from './ArgumentAnalyzer.js'

export type {
  ArgumentAnalyzerConfig,
  Argument,
  Claim,
  Premise,
  Conclusion,
  ArgumentRelation,
  LogicalFallacy,
  FallacyType,
  ArgumentStrength,
  ArgumentMap,
  DebatePosition,
  CounterArgument,
  ArgumentAnalyzerStats,
} from './ArgumentAnalyzer.js'

// ── Narrative Engine — Story structure, plot analysis, character arcs ──
export { NarrativeEngine } from './NarrativeEngine.js'

export type {
  NarrativeEngineConfig,
  NarrativeArc,
  StoryBeat,
  PlotPoint,
  Character,
  CharacterArc,
  CharacterRelation,
  NarrativeStructure,
  Theme,
  NarrativePattern,
  NarrativeAnalysis,
  NarrativeEngineStats,
} from './NarrativeEngine.js'

// ══════════════════════════════════════════════════════════════════════════════
// COGNITIVE INTELLIGENCE — Higher-order reasoning modules (src/chat/)
// ══════════════════════════════════════════════════════════════════════════════

// ── Causal Reasoner — Graph-based causal analysis and counterfactual reasoning ──
export { CausalReasoner } from './CausalReasoner.js'

export type {
  CausalReasonerConfig,
  CausalReasonerStats,
  CausalNode,
  CausalEdge,
  CausalGraph,
  CausalChain,
  CounterfactualResult,
  RootCauseResult,
  CausalInference,
  InterventionResult,
} from './CausalReasoner.js'

// ── Market Analyzer — Comprehensive market analysis with multi-signal processing ──
export { MarketAnalyzer } from './MarketAnalyzer.js'

export type {
  MarketAnalyzerConfig,
  MarketAnalyzerStats,
  SentimentResult,
  TrendResult,
  VolatilityResult,
  CorrelationMatrix,
  MarketBreadth,
  NewsImpact,
  AnomalyResult,
  MarketSummary,
} from './MarketAnalyzer.js'

// ── Portfolio Optimizer — Portfolio optimization and risk management ──
export { PortfolioOptimizer } from './PortfolioOptimizer.js'

export type {
  PortfolioOptimizerConfig,
  PortfolioOptimizerStats,
  Asset,
  Portfolio,
  EfficientFrontierPoint,
  OptimizationResult,
  StressTestResult,
  RiskAssessment,
  RiskProfile,
  AllocationEntry,
  AllocationRecommendation,
  RebalanceTrade,
  PositionSize,
  RecoveryPeriod,
  DrawdownAnalysis,
  PerformanceAttribution,
} from './PortfolioOptimizer.js'

// ── Strategy Engine — Trading strategy generation, backtesting, and optimization ──
export { StrategyEngine } from './StrategyEngine.js'

export type {
  StrategyEngineConfig,
  StrategyEngineStats,
  StrategyRule,
  Strategy,
  BacktestResult,
  TradeRecord,
  SignalEvent,
  RiskRule,
  StrategyComparison,
  MonteCarloResult,
  StrategyOptimizationResult,
} from './StrategyEngine.js'

// ── Abstraction Engine — Concept abstraction and generalization ──
export { AbstractionEngine, createProgrammingAbstractionEngine } from './AbstractionEngine.js'

export type {
  AbstractionEngineConfig,
  AbstractionEngineStats,
  AbstractionLevel,
  ConceptHierarchy,
  AbstractConcept,
  GeneralizationResult,
  SpecializationResult,
  PatternAbstraction,
  AbstractionMapping,
  PrototypeEntry,
} from './AbstractionEngine.js'

// ── Planning Engine — Goal-directed planning and dependency analysis ──
export { PlanningEngine } from './PlanningEngine.js'

export type {
  PlanningEngineConfig,
  PlanningEngineStats,
  Goal,
  PlanStep,
  Plan,
  PlanEvaluation,
  ResourceConstraint,
  PlanOptimization,
  Milestone,
  DependencyGraph,
  PlanComparison,
} from './PlanningEngine.js'

// ── Creative Engine — Creative thinking and lateral reasoning ──
export { CreativeEngine } from './CreativeEngine.js'

export type {
  CreativeEngineConfig,
  CreativeEngineStats,
  CreativeIdea,
  BrainstormResult,
  LateralThinkingResult,
  Metaphor,
  CreativeCombination,
  ReframingResult,
  InspirationSource,
  CreativeConstraint,
  IdeaEvolution,
} from './CreativeEngine.js'

// ══════════════════════════════════════════════════════════════════════════════
// TRADING & FINANCIAL INTELLIGENCE (src/chat/)
// ══════════════════════════════════════════════════════════════════════════════

// ── Trading Engine — Technical analysis, indicators, and signal generation ──
export { TradingEngine } from './TradingEngine.js'

export type {
  TradingEngineConfig,
  TradingEngineStats,
  OHLCV,
  TechnicalIndicators,
  TradeSignal,
  TrendAnalysis,
  CandlestickPattern,
  ChartPattern,
  RiskMetrics,
  MarketRegime,
} from './TradingEngine.js'

// ── Trading Strategy Analyzer — MQL4/MQL5/PineScript strategy analysis ──
export { TradingStrategyAnalyzer } from './TradingStrategyAnalyzer.js'

export type {
  TradingLanguage,
  StrategyPattern,
  StrategyIssue,
  RiskAssessment,
  CodeQualityResult,
  PerformanceResult,
  BacktestQuality,
  StrategyAnalysis,
  TradingStrategyAnalyzerConfig,
  TradingStrategyAnalyzerStats,
} from './TradingStrategyAnalyzer.js'

// ── MQL Code Fixer — MQL4/MQL5 error handler, code fixer, migration helper ──
export { MQLCodeFixer } from './MQLCodeFixer.js'

export type {
  MQLVersion,
  ErrorCategory as MQLErrorCategory,
  FixDifficulty,
  MQLErrorInfo,
  CompilationError,
  CodeFixSuggestion,
  MigrationMapping,
  ErrorHandlerTemplate,
  MQLCodeFixerConfig,
  MQLCodeFixerStats,
} from './MQLCodeFixer.js'

// ── Chart Pattern Engine — candlestick & chart pattern recognition, S/R, Fibonacci ──
export { ChartPatternEngine } from './ChartPatternEngine.js'

export type {
  Candle,
  CandlestickPatternType,
  ChartPatternType,
  CandlestickPattern,
  ChartPattern as ChartPatternResult,
  SupportResistanceLevel,
  FibonacciLevel,
  TradeSignal as ChartTradeSignal,
  ChartPatternEngineConfig,
  ChartPatternEngineStats,
} from './ChartPatternEngine.js'

// ── Decision Engine — Multi-criteria decision making, Bayesian inference, game theory ──
export { DecisionEngine } from './DecisionEngine.js'

export type {
  DecisionEngineConfig,
  DecisionEngineStats,
  Alternative,
  Criterion,
  MCDAResult,
  BayesianBelief,
  BayesianUpdate,
  GameMatrix,
  DecisionNode,
  DecisionTreeResult,
  ProspectEvaluation,
  SensitivityResult,
  GroupDecision,
  DecisionRecord,
} from './DecisionEngine.js'

// ── Knowledge Synthesizer — Cross-domain knowledge fusion and insight generation ──
export { KnowledgeSynthesizer } from './KnowledgeSynthesizer.js'

export type {
  KnowledgeSynthesizerConfig,
  KnowledgeSynthesizerStats,
  KnowledgeSource,
  FusionResult,
  Contradiction,
  Insight,
  KnowledgeGapResult,
  SynthesizedSummary,
  DomainMapping,
  EvidenceAggregation,
} from './KnowledgeSynthesizer.js'

// ── Economic Analyzer — Macroeconomic analysis and forecasting ──
export { EconomicAnalyzer } from './EconomicAnalyzer.js'

export type {
  EconomicAnalyzerConfig,
  EconomicAnalyzerStats,
  EconomicIndicator,
  EconomicSnapshot,
  BusinessCycle,
  MonetaryPolicyAnalysis,
  FiscalPolicyAnalysis,
  InflationForecast,
  CurrencyAnalysis,
  YieldCurveAnalysis,
  EconomicReport,
  SectorAnalysis,
  MacroScenario,
} from './EconomicAnalyzer.js'

// ── Security Trainer — Cybersecurity training, pen-testing, and CTF challenges ──
export { SecurityTrainer } from './SecurityTrainer.js'

export type {
  SecurityTrainerConfig,
  SecurityTrainerStats,
  VulnerabilityInfo,
  PenTestScenario,
  PenTestPhase,
  NetworkAnalysis,
  WebVulnerability,
  CryptoChallenge,
  SocialEngineering,
  CTFChallenge,
  ExploitTechnique,
  SecurityAudit,
  AuditFinding,
  IncidentResponse,
  SecuritySkillAssessment,
  TrainingModule,
} from './SecurityTrainer.js'

// ── Vulnerability Scanner — Static/dynamic code vulnerability scanning and taint analysis ──
export { VulnerabilityScanner } from './VulnerabilityScanner.js'

export type {
  VulnerabilityScannerConfig,
  VulnerabilityScannerStats,
  VulnCategory,
  VulnFinding,
  TaintNode,
  TaintPath,
  ScanSummary,
  ScanResult,
  CodePattern,
  TaintRule,
  ScanProfile,
} from './VulnerabilityScanner.js'

// ── Threat Modeler — STRIDE/DREAD threat modeling, attack trees, threat intelligence ──
export { ThreatModeler } from './ThreatModeler.js'

export type {
  ThreatModelerConfig,
  ThreatModelerStats,
  ThreatCategory,
  StrideCategory,
  DreadScore,
  Mitigation,
  Asset,
  Threat,
  DataFlow,
  TrustBoundary,
  AttackNode,
  AttackTree,
  ThreatIntelEntry,
  ThreatModel,
} from './ThreatModeler.js'

// ── Exploit Analyzer — Exploit pattern analysis, CVE correlation, attack surface assessment ──
export { ExploitAnalyzer } from './ExploitAnalyzer.js'

export type {
  ExploitAnalyzerConfig,
  ExploitAnalyzerStats,
  ExploitCategory,
  ExploitInfo,
  PayloadInfo,
  CVEEntry,
  ExploitChainStep,
  ExploitChain,
  MitigationStrategy,
  SurfaceComponent,
  AttackSurface,
  ExploitAnalysisResult,
} from './ExploitAnalyzer.js'

// ── Network Forensics — Traffic analysis, anomaly detection, incident response ──
export { NetworkForensics } from './NetworkForensics.js'

export type {
  NetworkForensicsConfig,
  NetworkForensicsStats,
  AnomalyType,
  PacketInfo,
  NetworkAnomaly,
  ProtocolAnalysis,
  IncidentTimelineEntry,
  PlaybookStep,
  IncidentPlaybook,
  NetworkIncident,
  TrafficPattern,
  TopologyNode,
  TopologyConnection,
  NetworkTopology,
  ForensicReport,
} from './NetworkForensics.js'

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 7 — UNDERSTANDING INTELLIGENCE MODULES
// ══════════════════════════════════════════════════════════════════════════════

// ── Pattern Recognizer — Pattern recognition in data, code, and text ──
export { PatternRecognizer } from './PatternRecognizer.js'

export type {
  PatternRecognizerConfig,
  PatternRecognizerStats,
  PatternType,
  DataPattern,
  SequenceInfo,
  AnomalyInfo,
  FrequencyInfo,
  CorrelationInfo,
  ClusterInfo,
  PatternAnalysisResult,
} from './PatternRecognizer.js'

// ── Concept Mapper — Concept mapping and knowledge graph navigation ──
export { ConceptMapper } from './ConceptMapper.js'

export type {
  ConceptMapperConfig,
  ConceptMapperStats,
  RelationType,
  Concept,
  Relation,
  ConceptPath,
  ConceptCluster,
  InferenceResult as ConceptInferenceResult,
  SimilarityResult,
  ConceptMapSummary,
  SpreadingActivationResult,
} from './ConceptMapper.js'

// ── Inference Engine — Logical inference and deductive reasoning ──
export { InferenceEngine } from './InferenceEngine.js'

export type {
  InferenceEngineConfig,
  InferenceEngineStats,
  LogicalOperator,
  Proposition,
  Condition,
  Rule,
  InferenceStep,
  InferenceChain,
  Conflict,
  TruthTableRow,
  TruthTable,
  QueryResult,
} from './InferenceEngine.js'

// ── Sentiment Analyzer — Sentiment and opinion analysis ──
export { SentimentAnalyzer } from './SentimentAnalyzer.js'

export type {
  SentimentAnalyzerConfig,
  SentimentAnalyzerStats,
  SentimentLabel,
  EmotionType,
  SentimentScore,
  AspectSentiment,
  EmotionScore,
  SubjectivityScore,
  OpinionInfo,
  SentenceSentiment,
  SentimentSummary,
  SentimentAnalysisResult,
} from './SentimentAnalyzer.js'

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 8 — DEEP INTELLIGENCE MODULES
// ══════════════════════════════════════════════════════════════════════════════

// ── Deep Understanding Engine — Semantic similarity, multi-intent parsing, ambiguity detection ──
export { DeepUnderstandingEngine } from './DeepUnderstandingEngine.js'

export type {
  DeepUnderstandingConfig,
  DeepUnderstandingStats,
  ConversationTurn,
  SimilarityMatch,
  IntentType,
  ParsedIntent,
  AmbiguityResult,
  ResolvedReference,
  EntityType,
  ExtractedEntity,
  EntityRelation,
  ContextualClassification,
  UnderstandingResult,
} from './DeepUnderstandingEngine.js'

// ── Task Orchestrator — Multi-step task execution with planning and state tracking ──
export { TaskOrchestrator } from './TaskOrchestrator.js'

export type {
  TaskOrchestratorConfig,
  TaskOrchestratorStats,
  TaskState,
  StepType,
  TaskStep,
  StepResult,
  TaskPlan as OrchestratorTaskPlan,
  TaskStatus,
  ProgressReport,
  ActiveTaskInfo,
} from './TaskOrchestrator.js'

// ── Knowledge Reasoner — Transitive inference, knowledge composition, contradiction detection ──
export { KnowledgeReasoner } from './KnowledgeReasoner.js'

export type {
  KnowledgeReasonerConfig,
  KnowledgeReasonerStats,
  KnowledgeFact,
  InferenceChain as ReasonerInferenceChain,
  ComposedAnswer,
  Contradiction,
  ExplanationResult,
  ExplanationPath,
  Hypothesis,
} from './KnowledgeReasoner.js'

// ── Adaptive Learner — Fact extraction, concept generalization, transfer learning ──
export { AdaptiveLearner } from './AdaptiveLearner.js'

export type {
  AdaptiveLearnerConfig,
  AdaptiveLearnerStats,
  ExtractedFact,
  Example,
  GeneralizedRule,
  TransferResult,
  DomainMapping,
  MistakeLesson,
  MistakeCategory,
  PredictionRecord,
  CalibrationReport,
} from './AdaptiveLearner.js'

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 9 — INTELLIGENT CODING & SEMANTIC MODULES
// ══════════════════════════════════════════════════════════════════════════════

// ── Semantic Code Analyzer — Deep semantic analysis of code structure, patterns, quality ──
export { SemanticCodeAnalyzer } from './SemanticCodeAnalyzer.js'

export type {
  SemanticCodeAnalyzerConfig,
  SemanticCodeAnalyzerStats,
  CodePatternType,
  DetectedPattern,
  AntiPatternType,
  DetectedAntiPattern,
  CodeSymbol,
  DependencyEdge,
  QualityMetrics,
  SemanticCodeAnalysis,
} from './SemanticCodeAnalyzer.js'

// ── Intelligent Refactorer — Smart refactoring with semantic understanding ──
export { IntelligentRefactorer } from './IntelligentRefactorer.js'

export type {
  IntelligentRefactorerConfig,
  IntelligentRefactorerStats,
  RefactoringType,
  RefactoringSuggestion as IntelligentRefactoringSuggestion,
  ExtractMethodResult,
  RenameResult,
  SimplificationResult,
  DuplicateBlock,
  RefactoringPlan,
} from './IntelligentRefactorer.js'

// ── Code Intent Predictor — Predict coding intent from context and history ──
export { CodeIntentPredictor } from './CodeIntentPredictor.js'

export type {
  CodeIntentPredictorConfig,
  CodeIntentPredictorStats,
  CodingIntentType,
  IntentPrediction,
  ContextSignal,
  SequencePrediction,
  CompletionPrediction,
  PredictionResult as IntentPredictionResult,
  IntentFeedback,
} from './CodeIntentPredictor.js'

// ── Semantic Bridge — Bridge between natural language and code semantics ──
export { SemanticBridge } from './SemanticBridge.js'

export type {
  SemanticBridgeConfig,
  SemanticBridgeStats,
  NlToCodeResult,
  CodeToNlResult,
  ConceptMapping,
  SemanticSearchResult,
  SemanticMatch,
  CodeSkeleton,
  SkeletonPlaceholder,
  TranslationFeedback,
  BridgeAnalysis,
} from './SemanticBridge.js'

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 10 — MULTI-MODAL FUSION INTELLIGENCE
// ══════════════════════════════════════════════════════════════════════════════

// ── Multi-Modal Fusion — Fuse insights from multiple modules into unified results ──
export { MultiModalFusion } from './MultiModalFusion.js'

export type {
  MultiModalFusionConfig,
  MultiModalFusionStats,
  IntelligenceSource,
  SourceOutput,
  FusionResult,
  FusionConflict,
  CrossDomainInsight,
} from './MultiModalFusion.js'

// ── Curriculum Optimizer — Learning path generation, spaced repetition, gap detection ──
export { CurriculumOptimizer } from './CurriculumOptimizer.js'

export type {
  CurriculumOptimizerConfig,
  CurriculumOptimizerStats,
  Skill,
  SkillMastery,
  KnowledgeGap,
  LearningPath,
  LearningStep,
  ReviewRecommendation,
  LearningVelocity,
} from './CurriculumOptimizer.js'

// ══════════════════════════════════════════════════════════════════════════════
// TF-IDF SCORER — Semantic similarity for pattern matching (src/chat/TfIdfScorer.ts)
// ══════════════════════════════════════════════════════════════════════════════
export { TfIdfScorer, tokenize, cosineSimilarity, ngramOverlapScore } from './TfIdfScorer.js'

export type { TfIdfDocument, TfIdfResult } from './TfIdfScorer.js'

// ══════════════════════════════════════════════════════════════════════════════
// DEV BRAIN — Offline coding practice agent (src/chat/DevBrain.ts)
// ══════════════════════════════════════════════════════════════════════════════
export { DevBrain } from './DevBrain.js'

export type {
  DevBrainConfig,
  DevBrainStats,
  DevBrainState,
  DevBrainLogEntry,
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
  // Document Analysis (lightweight types from BrainInterface)
  DocumentAnalysisInput, DocumentAnalysisOutput,
} from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// PIPELINE — Phase registry, module lifecycle, orchestration
// ══════════════════════════════════════════════════════════════════════════════
export {
  PipelinePhase,
  PHASE_LABELS,
  MODULE_REGISTRY,
  TOTAL_MODULES,
  getModulesByPhase,
  getPhaseModuleCounts,
  findModule,
  getAllModuleNames,
  validateDependencies,
  getPhaseOrder,
  getInitOrder,
} from './pipeline/PipelineContract.js'

export type { ModuleDescriptor } from './pipeline/PipelineContract.js'

export { PhaseRunner } from './pipeline/PhaseRunner.js'

export type {
  ModuleSlot,
  PhaseResult,
  ModuleSlotSummary,
  HealthReport,
} from './pipeline/PhaseRunner.js'

// ── Error Taxonomy — Standardized failure classes + retry strategy ──
export {
  EngineErrorClass,
  RETRYABLE_ERRORS,
  ERROR_PRIORITY,
  createEngineError,
  classifyError,
  calculateRetryDelay,
  shouldRetry,
  DEFAULT_RETRY_CONFIG,
  ErrorAggregator,
} from './pipeline/ErrorTaxonomy.js'

export type {
  EngineError,
  RetryConfig,
} from './pipeline/ErrorTaxonomy.js'

// ── Replay Engine — Deterministic replay for debugging ──
export {
  SeededRandom,
  ReplayEngine,
  DEFAULT_REPLAY_CONFIG,
  CONFIDENCE_MATCH_TOLERANCE,
} from './pipeline/ReplayEngine.js'

export type {
  ReplayDecision,
  ReplaySession,
  DecisionComparison,
  ReplayResult,
  ReplayConfig,
} from './pipeline/ReplayEngine.js'

// ── Prompt Registry — Versioned prompt templates & model configs ──
export { PromptRegistry } from './pipeline/PromptRegistry.js'

export type {
  PromptTemplate,
  ModelConfig,
  RenderedPrompt,
} from './pipeline/PromptRegistry.js'

// ══════════════════════════════════════════════════════════════════════════════
// SCORING — Centralized scoring engine with normalized formulas
// ══════════════════════════════════════════════════════════════════════════════
export {
  ScoringEngine,
  DEFAULT_SCORING_CONFIG,
  DEFAULT_KNOWLEDGE_WEIGHTS,
  DEFAULT_PATTERN_WEIGHTS,
  DEFAULT_CONFIDENCE_WEIGHTS,
  DEFAULT_CODE_REVIEW_WEIGHTS,
} from './scoring/ScoringEngine.js'

export type {
  KnowledgeScoreWeights,
  PatternScoreWeights,
  ConfidenceWeights,
  CodeReviewWeights,
  ScoringConfig,
  KnowledgeScoreResult,
  PatternScoreResult,
  ConfidenceResult,
  CodeReviewScoreResult,
} from './scoring/ScoringEngine.js'

// ══════════════════════════════════════════════════════════════════════════════
// MEMORY CONSOLIDATOR — Session → long-term memory bridge with retrieval
// ══════════════════════════════════════════════════════════════════════════════
export { MemoryConsolidator, DEFAULT_CONSOLIDATOR_CONFIG } from './MemoryConsolidator.js'

export type {
  SessionTurn,
  LongTermEntry,
  RetrievalResult,
  MemoryConsolidatorConfig,
  MemoryConflict,
  ConsolidatorStats,
} from './MemoryConsolidator.js'

// ══════════════════════════════════════════════════════════════════════════════
// CONFIDENCE GATE — Decision quality control with abstain mode
// ══════════════════════════════════════════════════════════════════════════════
export { ConfidenceGate, DEFAULT_GATE_CONFIG } from './ConfidenceGate.js'

export type {
  ConfidenceSignal,
  GateDecision,
  GateResult,
  ConfidenceGateConfig,
  CalibrationEntry,
  CalibrationStats,
} from './ConfidenceGate.js'

// ══════════════════════════════════════════════════════════════════════════════
// HYPOTHESIS ENGINE — Scientific reasoning through hypothesis generation
// ══════════════════════════════════════════════════════════════════════════════
export { HypothesisEngine, DEFAULT_HYPOTHESIS_ENGINE_CONFIG } from './HypothesisEngine.js'

export type {
  Evidence as HypothesisEvidence,
  Hypothesis as EngineHypothesis,
  HypothesisTestResult,
  HypothesisEngineConfig,
} from './HypothesisEngine.js'

// ══════════════════════════════════════════════════════════════════════════════
// BRAIN CONTRACT — Input → Think → Tool → Verify → Output schema
// ══════════════════════════════════════════════════════════════════════════════
export {
  BrainStep,
  BRAIN_STEP_ORDER,
  TraceBuilder,
  validateTrace,
} from './BrainContract.js'

export type {
  InputStepData,
  ThinkStepData,
  ToolStepData,
  VerifyStepData,
  OutputStepData,
  PipelineTraceStep,
  PipelineTrace,
  ContractValidation,
  ToolInvocation,
} from './BrainContract.js'

// ══════════════════════════════════════════════════════════════════════════════
// BRAIN EVAL HARNESS — Objective evaluation tests for quality
// ══════════════════════════════════════════════════════════════════════════════
export {
  BrainEvalHarness,
  GOLDEN_CASES,
  DEFAULT_EVAL_CONFIG,
} from './BrainEvalHarness.js'

export type {
  EvalCase,
  EvalCategory,
  EvalResult,
  CategoryScore,
  EvalReport,
  Regression,
  EvalHarnessConfig,
  EvalTarget,
} from './BrainEvalHarness.js'

// ══════════════════════════════════════════════════════════════════════════════
// REPLAY STORE — Persistent storage for deterministic replay sessions
// ══════════════════════════════════════════════════════════════════════════════
export { ReplayStore, DEFAULT_STORE_CONFIG } from './pipeline/ReplayStore.js'

export type {
  PipelineSnapshot,
  ReplayStoreConfig,
  SessionSummary,
  ReplayStoreStats,
} from './pipeline/ReplayStore.js'

// ══════════════════════════════════════════════════════════════════════════════
// IMAGE ANALYZER — Deep offline image understanding (Phase 11)
// ══════════════════════════════════════════════════════════════════════════════
export { ImageAnalyzer, DEFAULT_ANALYZER_CONFIG } from './ImageAnalyzer.js'

export type {
  DeepImageAnalysis,
  ImageFormatInfo,
  PixelAnalysis,
  ColorInfo,
  HistogramBucket,
  StructureAnalysis,
  CompositionType,
  ContentClassification,
  ImageContentType,
  TextRegion,
  SceneAnalysis,
  QualityAssessment,
  ImageAnalyzerConfig,
  ImageAnalyzerStats,
} from './ImageAnalyzer.js'

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT ANALYZER — Deep offline document understanding (Phase 11)
// ══════════════════════════════════════════════════════════════════════════════
export { DocumentAnalyzer, DEFAULT_DOC_ANALYZER_CONFIG, isRawPdfContent, extractPdfText } from './DocumentAnalyzer.js'

export type {
  DocumentAnalysisRequest,
  DocumentAnalysisResult,
  DocumentMetadata,
  DocumentFormat,
  DocumentStructure,
  DocumentSection,
  OutlineEntry,
  ContentAnalysis,
  NamedEntity,
  ReadabilityMetrics,
  DocumentClassification,
  DocumentType,
  KeywordResult,
  SectionSummary,
  DetectedTable,
  DetectedCodeBlock,
  CrossReference,
  DocumentSentiment,
  DocumentAnalyzerConfig,
  DocumentAnalyzerStats,
} from './DocumentAnalyzer.js'

// ── NLP Utilities (shared) ──

export { STOP_WORDS, POSITIVE_WORDS, NEGATIVE_WORDS, TECHNICAL_WORDS, splitSentences, tokenize } from './nlpUtils.js'

// ── PdfExpert (Phase 12 — Document-Grounded Q&A) ──

export { PdfExpert, DEFAULT_PDF_EXPERT_CONFIG } from './PdfExpert.js'

export type {
  PdfExpertConfig,
  LoadedDocument,
  DocumentCitation,
  PdfExpertAnswer,
  PdfExpertQuery,
  DocumentComparison,
  DocumentConnection,
  DocumentSearchResult,
  PdfExpertStats,
} from './PdfExpert.js'

// ── Token Budget Manager (Phase 12 — Cloud Limit & Continuation) ──

export { TokenBudgetManager, DEFAULT_BUDGET_CONFIG } from './TokenBudgetManager.js'

export type {
  TokenBudgetConfig,
  BudgetReport,
  InteractionUsage,
} from './TokenBudgetManager.js'

// ── Kurdish Translation Corpus (CKB-ENG Parallel Data) ──

export { KurdishTranslationCorpus } from './KurdishTranslationCorpus.js'

export type {
  TranslationPair,
  TranslationCategory,
} from './KurdishTranslationCorpus.js'

// ── Kurdish Morphological Analyzer (Kurdish NLP) ──

export { KurdishMorphologicalAnalyzer, DEFAULT_ANALYZER_CONFIG } from './KurdishMorphologicalAnalyzer.js'

export type {
  MorphemeAnalysis,
  SpellingResult,
  TransliterationResult,
  KurdishMorphologicalAnalyzerConfig,
} from './KurdishMorphologicalAnalyzer.js'

// ── Kurdish Sentiment Analyzer (Based on Hrazhan/sentiment) ──

export { KurdishSentimentAnalyzer, DEFAULT_SENTIMENT_CONFIG } from './KurdishSentimentAnalyzer.js'

export type {
  SentimentLabel,
  SentimentResult as KurdishSentimentResult,
  SentimentWord,
  SentimentCorpusSample,
  KurdishSentimentConfig,
} from './KurdishSentimentAnalyzer.js'

// ── Kurdish Language Utils (Proverbs, Numbers, Greetings, Dialects) ──

export { KurdishLanguageUtils } from './KurdishLanguageUtils.js'

export type {
  KurdishProverb,
  DialectComparison,
  KurdishDay,
  KurdishMonth,
} from './KurdishLanguageUtils.js'

// ── Hypothesis Engine — already exported above (line ~1204) ──

// ── Ethical Reasoner (Moral Analysis) ──

export { EthicalReasoner, DEFAULT_ETHICAL_CONFIG } from './EthicalReasoner.js'

export type {
  EthicalFramework,
  EthicalAnalysis,
  FrameworkAssessment,
  Stakeholder,
  EthicalPrinciple,
  EthicalReasonerConfig,
} from './EthicalReasoner.js'

// ── Bug Bounty Knowledge — Bug bounty methodology, platforms, recon, reporting, payouts ──
export { BugBountyKnowledge } from './BugBountyKnowledge.js'

export type {
  BugBountyKnowledgeConfig,
  BugBountyKnowledgeStats,
  BugBountyPlatform,
  BountyProgram,
  BountyScope,
  BountyScopeTarget,
  ReconTechnique,
  VulnClassForBounty,
  BountyReport,
  PayoutEstimate,
  HunterProfile,
  MethodologyPhase,
  BountyMethodology,
  ResponsibleDisclosure,
  DuplicateStrategy,
  BugBountyTip,
} from './BugBountyKnowledge.js'

// ── Cyber Threat Intelligence (APT tracking, MITRE ATT&CK, IOC, C2, malware) ──

export { CyberThreatIntelligence, DEFAULT_CYBER_THREAT_INTEL_CONFIG } from './CyberThreatIntelligence.js'

export type {
  CyberThreatIntelConfig,
  CyberThreatIntelStats,
  ThreatActor,
  APTGroup,
  MitreAttackTechnique,
  IndicatorOfCompromise,
  ThreatCampaign,
  C2Infrastructure,
  MalwareFamily,
  ThreatReport,
} from './CyberThreatIntelligence.js'

// ── Cloud Security Analyzer (AWS/Azure/GCP, K8s, containers, IAM, compliance) ──

export { CloudSecurityAnalyzer, DEFAULT_CLOUD_SECURITY_CONFIG } from './CloudSecurityAnalyzer.js'

export type {
  CloudProvider,
  CloudSecurityConfig,
  CloudSecurityStats,
  CloudMisconfiguration,
  IAMPolicyAnalysis,
  KubernetesSecurityIssue,
  ContainerSecurityFinding,
  ServerlessRisk,
  ComplianceControl,
  ComplianceFramework,
  CloudSecurityAssessment,
} from './CloudSecurityAnalyzer.js'

// ── Advanced Trading Engine (Options, Monte Carlo, GARCH, algo execution, DeFi) ──

export { AdvancedTradingEngine, DEFAULT_ADVANCED_TRADING_CONFIG } from './AdvancedTradingEngine.js'

export type {
  AdvancedTradingConfig,
  AdvancedTradingStats,
  OptionContract,
  OptionGreeks,
  OptionPricing,
  VolatilityModel,
  MonteCarloResult,
  AlgoExecution,
  OrderBookLevel,
  OrderBookAnalysis,
  DeFiProtocol,
  DeFiAnalysis,
  RiskMetrics,
} from './AdvancedTradingEngine.js'

// ── Target Scanner (Automated Security Assessment Pipeline) ──

export { TargetScanner, DEFAULT_TARGET_SCANNER_CONFIG } from './TargetScanner.js'

export type {
  ScanPhase,
  ScanDepth,
  AttackUrgency,
  TargetScannerConfig,
  TargetScannerStats,
  TargetInfo,
  ReconResult,
  DNSRecord,
  WhoisInfo,
  HeaderAnalysis,
  SecurityHeader,
  CookieAnalysis,
  CORSAnalysis,
  TechFingerprint,
  PortInfo,
  SSLInfo,
  VulnerabilityFinding,
  ExploitCandidate,
  AttackChain,
  AttackPhase,
  AttackSurface,
  InputVector,
  ScanReport,
  ScanProgress,
} from './TargetScanner.js'

// ── Attack Chain Engine ──────────────────────────────────────────────────────
export {
  AttackChainEngine,
  DEFAULT_ATTACK_CHAIN_ENGINE_CONFIG,
  type AttackChainEngineConfig,
  type AttackChainEngineStats,
  type KillChainPhase,
  type MitreAttackTactic,
  type AttackerSkillLevel,
  type AttackerMotivation,
  type AttackerProfile,
  type AttackTechnique,
  type LateralMovementPath,
  type PersistenceMechanism,
  type EvasionTechnique,
  type C2Channel,
  type ExfiltrationMethod,
  type PostExploitAction,
  type AttackChainStep,
  type AttackChainResult,
} from './AttackChainEngine.js'

// ── Exploit Writer ───────────────────────────────────────────────────────────
export {
  ExploitWriter,
  DEFAULT_EXPLOIT_WRITER_CONFIG,
  type ExploitWriterConfig,
  type ExploitWriterStats,
  type VulnerabilityClass,
  type PayloadType,
  type Platform,
  type Architecture,
  type VulnAnalysis,
  type ExploitStrategy,
  type ExploitTemplate,
  type CraftedPayload,
  type ShellcodeTemplate,
  type ObfuscationPass,
  type SecurityBypass,
  type WeaponizationPipeline,
  type SmartAttackSelection,
} from './ExploitWriter.js'

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 13 — META-INTELLIGENCE & SELF-IMPROVEMENT MODULES
// ══════════════════════════════════════════════════════════════════════════════

// ── Self-Reflection Engine — Meta-cognitive self-evaluation & improvement ──
export { SelfReflectionEngine, DEFAULT_SELF_REFLECTION_CONFIG } from './SelfReflectionEngine.js'

export type {
  QualityDimension,
  DimensionScore,
  OutputEvaluation,
  ErrorPattern,
  ErrorCategory,
  BlindSpot,
  ImprovementStrategy,
  PerformanceTrend,
  SelfReflectionEngineConfig,
  SelfReflectionEngineStats,
} from './SelfReflectionEngine.js'

// ── Tool Reasoning Engine — Intelligent tool selection & orchestration ──
export { ToolReasoningEngine, DEFAULT_TOOL_REASONING_CONFIG } from './ToolReasoningEngine.js'

export type {
  ToolDescriptor,
  TaskRequirement,
  TaskConstraint,
  ToolMatch,
  PipelineStep as ToolPipelineStep,
  ToolPipeline,
  StepExecutionResult,
  ToolUsageRecord,
  InferredParameter,
  ToolReasoningEngineConfig,
  ToolReasoningEngineStats,
} from './ToolReasoningEngine.js'

// ── Fact Verification Engine — Claim verification & source reliability ──
export { FactVerificationEngine, DEFAULT_FACT_VERIFICATION_CONFIG } from './FactVerificationEngine.js'

export type {
  Claim,
  VerificationEvidence,
  Verdict,
  VerificationResult,
  KnownFact,
  SourceProfile,
  Contradiction as FactContradiction,
  FactVerificationEngineConfig,
  FactVerificationEngineStats,
} from './FactVerificationEngine.js'

// ── Explanation Engine — Multi-level explanation & teaching engine ──
export { ExplanationEngine, DEFAULT_EXPLANATION_ENGINE_CONFIG } from './ExplanationEngine.js'

export type {
  ExpertiseLevel,
  AbstractionLevel as ExplanationAbstractionLevel,
  LevelExplanation,
  MultiLevelExplanation,
  ExplanationStep,
  StepByStepBreakdown,
  Analogy,
  AudienceProfile,
  UnderstandingProgress,
  Prerequisite,
  ExplanationEngineConfig,
  ExplanationEngineStats,
} from './ExplanationEngine.js'

// ── Feedback Learner — RLHF-like feedback integration & preference modeling ──
export { FeedbackLearner, DEFAULT_FEEDBACK_LEARNER_CONFIG } from './FeedbackLearner.js'

export type {
  FeedbackSignalType,
  FeedbackSignal as FeedbackLearnerSignal,
  CorrectionLesson,
  CorrectionCategory,
  PreferenceModel,
  TrackedMistake,
  CalibrationRecord as FeedbackCalibrationRecord,
  CalibrationSummary,
  RewardSummary,
  FeedbackLearnerConfig,
  FeedbackLearnerStats,
} from './FeedbackLearner.js'

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 14 — ADVANCED REASONING & AUTONOMY MODULES
// ══════════════════════════════════════════════════════════════════════════════

// ── Working Memory Engine — Active thought management & scratchpad ──
export { WorkingMemoryEngine, DEFAULT_WORKING_MEMORY_CONFIG } from './WorkingMemoryEngine.js'

export type {
  MemorySlotType,
  AttentionLevel,
  MemorySlot,
  MemoryChunk,
  ScratchpadEntry,
  AttentionSnapshot,
  InterferenceResult,
  WorkingMemoryEngineConfig,
  WorkingMemoryEngineStats,
} from './WorkingMemoryEngine.js'

// ── Goal Manager — Autonomous goal tracking & replanning ──
export { GoalManager, DEFAULT_GOAL_MANAGER_CONFIG } from './GoalManager.js'

export type {
  GoalStatus,
  GoalPriority,
  GoalDefinition,
  GoalConflict,
  GoalMilestone,
  GoalReplanResult,
  GoalTreeNode,
  GoalManagerConfig,
  GoalManagerStats,
} from './GoalManager.js'

// ── Strategic Planner — Long-horizon planning with Monte Carlo ──
export { StrategicPlanner, DEFAULT_STRATEGIC_PLANNER_CONFIG } from './StrategicPlanner.js'

export type {
  PlanStepStatus,
  StrategicStep,
  ContingencyBranch,
  StrategicPlan,
  MonteCarloResult,
  PlanRepairResult,
  ScenarioAnalysis,
  PlanComparison,
  ResourceEstimate,
  StrategicPlannerConfig,
  StrategicPlannerStats,
} from './StrategicPlanner.js'

// ── Self-Model Engine — Introspective self-awareness & capability mapping ──
export { SelfModelEngine, DEFAULT_SELF_MODEL_CONFIG } from './SelfModelEngine.js'

export type {
  ProficiencyLevel,
  KnowledgeState,
  Capability as SelfModelCapability,
  KnowledgeBoundary,
  Limitation,
  LimitationCategory,
  CompetenceEstimate,
  UncertaintyMap,
  GrowthRecord,
  SelfAssessment,
  SelfModelEngineConfig,
  SelfModelEngineStats,
} from './SelfModelEngine.js'

// ── Collaboration Engine — Multi-module orchestration & synthesis ──
export { CollaborationEngine, DEFAULT_COLLABORATION_CONFIG } from './CollaborationEngine.js'

export type {
  AgentRole,
  AgentDescriptor,
  CollaborationTask,
  AgentResponse as CollaborationAgentResponse,
  SynthesizedResult,
  ConflictRecord,
  DelegationPlan,
  CollaborationMessage,
  EnsembleDecision,
  CollaborationEngineConfig,
  CollaborationEngineStats,
} from './CollaborationEngine.js'

// ── Phase 15 — Knowledge Engineering & Reasoning Depth ──────────────────────

// ── KnowledgeGraphEngine — Graph-based knowledge representation & inference ──
export { KnowledgeGraphEngine, DEFAULT_KNOWLEDGE_GRAPH_CONFIG } from './KnowledgeGraphEngine.js'

export type {
  EntityType,
  RelationType,
  KGEntity,
  KGRelation,
  GraphPath,
  Subgraph,
  TripleQuery,
  TripleResult,
  EntitySimilarity,
  InferredRelation,
  GraphTopology,
  KnowledgeGraphEngineConfig,
  KnowledgeGraphEngineStats,
} from './KnowledgeGraphEngine.js'

// ── DebateEngine — Structured argumentation & dialectical reasoning ──
export { DebateEngine, DEFAULT_DEBATE_ENGINE_CONFIG } from './DebateEngine.js'

export type {
  ArgumentSide,
  ArgumentStrength,
  EvidenceType,
  FallacyType,
  Argument,
  Evidence,
  DetectedFallacy,
  Rebuttal,
  DebateRound,
  DebateVerdict,
  Debate,
  DebateEngineConfig,
  DebateEngineStats,
} from './DebateEngine.js'

// ── AnalyticalReasoner — Multi-framework analytical reasoning engine ──
export { AnalyticalReasoner, DEFAULT_ANALYTICAL_REASONER_CONFIG } from './AnalyticalReasoner.js'

export type {
  FrameworkType,
  SWOTAnalysis,
  FiveWhyAnalysis,
  WhyStep,
  FishboneDiagram,
  FishboneCategory,
  PESTAnalysis,
  PESTFactor,
  PorterAnalysis,
  ForceAssessment,
  DecisionMatrix,
  WeightedCriterion,
  MatrixOption,
  CostBenefitAnalysis,
  CBAItem,
  AnalysisResult,
  AnalyticalReasonerConfig,
  AnalyticalReasonerStats,
} from './AnalyticalReasoner.js'

// ── ProblemDecomposer — Complex problem breakdown & solution synthesis ──
export { ProblemDecomposer as ChatProblemDecomposer, DEFAULT_PROBLEM_DECOMPOSER_CONFIG } from './ProblemDecomposer.js'

export type {
  ProblemType,
  ComplexityLevel,
  ApproachStrategy,
  Problem,
  SubProblem,
  SolutionApproach,
  DependencyGraph,
  IntegratedSolution,
  ProblemDecomposerConfig,
  ProblemDecomposerStats,
} from './ProblemDecomposer.js'

// ── InsightExtractor — Pattern discovery, trend detection & insight ranking ──
export { InsightExtractor, DEFAULT_INSIGHT_EXTRACTOR_CONFIG } from './InsightExtractor.js'

export type {
  InsightCategory,
  SignificanceLevel,
  TrendDirection,
  Insight,
  TrendResult,
  AnomalyResult,
  PatternResult,
  InsightReport,
  TextInsight,
  InsightExtractorConfig,
  InsightExtractorStats,
} from './InsightExtractor.js'

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 16 — ADVANCED INTELLIGENCE & DOMAIN EXPERTISE
// ══════════════════════════════════════════════════════════════════════════════

// ── Natural Language Generator — Template NLG, paraphrasing & style transfer ──
export { NaturalLanguageGenerator, DEFAULT_NLG_CONFIG } from './NaturalLanguageGenerator.js'

export type {
  WritingStyle,
  DiscourseRelation,
  SentenceType,
  NLGTemplate,
  TextPlan,
  TextSection,
  ParaphraseResult,
  StyleTransferResult,
  ReadabilityScore,
  SentenceVariety,
  GeneratedText,
  NaturalLanguageGeneratorConfig,
  NaturalLanguageGeneratorStats,
} from './NaturalLanguageGenerator.js'

// ── Scientific Reasoner — Scientific method & experiment design ──
export { ScientificReasoner, DEFAULT_SCIENTIFIC_REASONER_CONFIG } from './ScientificReasoner.js'

export type {
  ResearchMethodology,
  VariableType,
  StatisticalTest,
  BiasType,
  Hypothesis,
  Variable,
  ExperimentDesign,
  DetectedBias,
  StatisticalResult,
  ResearchSummary,
  ScientificReasonerConfig,
  ScientificReasonerStats,
} from './ScientificReasoner.js'

// ── Data Pipeline Engine — ETL design, transformation & data quality ──
export { DataPipelineEngine, DEFAULT_DATA_PIPELINE_CONFIG } from './DataPipelineEngine.js'

export type {
  StageType,
  DataType as PipelineDataType,
  QualityRuleType,
  SchemaField,
  DataSchema,
  PipelineStage,
  Pipeline,
  QualityRule,
  QualityReport,
  QualityViolation,
  LineageNode,
  PipelineMetrics,
  DataPipelineEngineConfig,
  DataPipelineEngineStats,
} from './DataPipelineEngine.js'

// ── Personality Engine — Communication style & personality modeling ──
export { PersonalityEngine, DEFAULT_PERSONALITY_CONFIG } from './PersonalityEngine.js'

export type {
  PersonalityTrait,
  CommunicationStyle,
  ToneType,
  CulturalContext,
  PersonalityProfile,
  PersonaTemplate,
  ToneAnalysis,
  UserPreference as PersonalityUserPreference,
  EmpathyResponse,
  StyleAdaptation,
  PersonalityEngineConfig,
  PersonalityEngineStats,
} from './PersonalityEngine.js'

// ── Code Optimizer — Performance analysis & optimization suggestions ──
export { CodeOptimizer, DEFAULT_CODE_OPTIMIZER_CONFIG } from './CodeOptimizer.js'

export type {
  ComplexityClass,
  OptimizationCategory,
  Severity as OptimizerSeverity,
  ComplexityAnalysis,
  PerformanceIssue,
  OptimizationSuggestion,
  CachingOpportunity,
  MemoryIssue,
  OptimizationReport,
  CodeOptimizerConfig,
  CodeOptimizerStats,
} from './CodeOptimizer.js'

// ── Python BlackHat Engine ───────────────────────────────────────────────────
export {
  PythonBlackHat,
  DEFAULT_PYTHON_BLACKHAT_CONFIG,
  type PythonBlackHatConfig,
  type PythonBlackHatStats,
  type AttackDomain,
  type Difficulty,
  type TargetOS,
  type PythonTool,
  type PythonLibraryProfile,
  type ExploitDevTechnique,
  type MalwareTechnique,
  type NetworkAttack,
  type WebExploit,
  type PrivEscPath,
  type C2Config,
  type EvasionMethod,
  type ReconTechnique,
  type CryptoAttack,
  type SocialEngineeringAttack,
  type ForensicsEvasionTechnique,
  type ReverseEngineeringTechnique,
} from './PythonBlackHat.js'

// ══════════════════════════════════════════════════════════════════════════════
// MISSING MODULE EXPORTS — Modules present in src/chat/ but not yet re-exported
// ══════════════════════════════════════════════════════════════════════════════

// ── Advanced Search Engine — Search with thinking steps and strategies ────────
export {
  AdvancedSearchEngine,
  type SearchStrategy,
  type ThinkingStep,
  type SearchResultItem,
  type SearchWithThinkingResult,
  type SearchDocument,
  type SearchConfig,
} from './AdvancedSearchEngine.js'

// ── Anomaly Detector — Data anomaly detection and pattern profiling ───────────
export {
  AnomalyDetector,
  // AnomalyResult — already exported from MarketAnalyzer
  // AnomalyType — already exported from NetworkForensics
  type DataPoint,
  type PatternProfile,
} from './AnomalyDetector.js'

// ── Contextual Memory Engine — Context-aware memory storage and retrieval ─────
export {
  ContextualMemoryEngine,
  type ContextMemory,
  type MemoryContext,
  type MemorySearchResult,
  type MemoryStats,
} from './ContextualMemoryEngine.js'

// ── Conversation Summarizer — Conversation summarization ─────────────────────
export {
  ConversationSummarizer,
  type ConversationSummary,
} from './ConversationSummarizer.js'

// ── Coreference Resolver — Entity mention and coreference resolution ─────────
export {
  CoreferenceResolver,
  type CoreferenceReplacement,
  type CoreferenceResult,
  type EntityMention,
} from './CoreferenceResolver.js'

// ── Counterfactual Reasoner — What-if counterfactual analysis ────────────────
export {
  CounterfactualReasoner,
  // CounterfactualResult — already exported from CausalReasoner
} from './CounterfactualReasoner.js'

// ── Creative Problem Solver — Creative methods (SCAMPER, analogies, first principles) ──
export {
  CreativeProblemSolver,
  type ProblemDefinition,
  type CreativeSolution,
  type CreativityMethod,
  type ScamperAction,
  type AnalogySuggestion,
  type FirstPrinciplesAnalysis,
} from './CreativeProblemSolver.js'

// ── Cross-Domain Transfer — Cross-domain knowledge transfer ──────────────────
export {
  CrossDomainTransfer,
  type CrossDomainResult,
} from './CrossDomainTransfer.js'

// ── Dialogue Act Recognizer — Dialogue act classification ────────────────────
export {
  DialogueActRecognizer,
  // DialogueAct — already exported from DialogueManager
  type DialogueActResult,
} from './DialogueActRecognizer.js'

// ── Emotional Intelligence — Emotion detection and tone analysis ─────────────
export {
  EmotionalIntelligence,
  type Emotion,
  // EmotionScore — already exported from SentimentAnalyzer
  type EmotionalAnalysis,
  type ToneType,
  type ToneAnalysis,
} from './EmotionalIntelligence.js'

// ── Language Detector — Language detection and identification ─────────────────
export {
  LanguageDetector,
  type LanguageDetectionResult,
} from './LanguageDetector.js'

// ── Logical Proof Engine — Formal logic, syllogisms, fallacy detection ───────
export {
  LogicalProofEngine,
  type LogicalProposition,
  type Syllogism,
  type SyllogismResult,
  type FallacyResult,
  type DetectedFallacy,
  // TruthTableRow — already exported from InferenceEngine
  type ArgumentStructure,
} from './LogicalProofEngine.js'

// ── Multi-Format Generator — Format detection and output generation ──────────
export {
  MultiFormatGenerator,
  type FormatType,
  type FormatDetection,
} from './MultiFormatGenerator.js'

// ── Query Decomposer — Query decomposition into sub-questions ────────────────
export {
  QueryDecomposer,
  type DecompositionStrategy,
  type SubQuestion,
  type DecompositionResult,
} from './QueryDecomposer.js'

// ── Response Quality Scorer — Response quality evaluation ────────────────────
export {
  ResponseQualityScorer,
  type QualityScore,
  type QualitySuggestion,
} from './ResponseQualityScorer.js'

// ── User Profile Model — User profiling and skill tracking ───────────────────
export {
  UserProfileModel,
  type SkillLevel,
  type DomainSkill,
  // UserPreferences — already exported from LocalBrain
  type UserProfile,
} from './UserProfileModel.js'

// ── Exploit Search Engine — CVE/exploit/vulnerability search & intelligence ──
export {
  ExploitSearchEngine,
  type ExploitSearchConfig,
  type ExploitSearchStats,
  type SeverityLevel,
  type ExploitAvailability,
  type CVSSv3,
  type CVEEntry,
  type AffectedProduct,
  type CWEEntry,
  // VulnCategory — conflicts with VulnerabilityScanner
  type ExploitEntry,
  type ExploitType,
  type SearchQuery,
  type SearchResult,
  type VulnDiscoveryPattern,
  type ExploitChain,
  type ExploitChainStep,
  type TrendAnalysis,
} from './ExploitSearchEngine.js'

// ── Buffer Overflow Debugger — Overflow analysis, ROP, heap exploitation ─────
export {
  BufferOverflowDebugger,
  type OverflowDebuggerConfig,
  type OverflowDebuggerStats,
  type Architecture,
  type Platform,
  type OverflowType,
  type BinaryProtections,
  type CrashInfo,
  type MemoryRegion,
  type OverflowAnalysis,
  type DebugCommand,
  type ROPGadget,
  type GadgetType,
  type ROPChain,
  type ROPObjective,
  type HeapAnalysis,
  type HeapCorruptionType,
  type HeapChunk,
  type FuzzStrategy,
  type FormatStringAnalysis,
  type OverflowPattern,
} from './BufferOverflowDebugger.js'

// ── Qwen Local LLM — Local inference engine with Qwen2.5-Coder 7B ──────────
export {
  QwenLocalLLM,
  type QuantizationLevel,
  type InferenceBackend,
  type ModelInfo,
  type DownloadProgress,
  type InferenceRequest,
  type InferenceResponse,
  type ChatMessage,
  type ServerStatus,
  type QwenLLMConfig,
  type QwenLLMStats,
} from './QwenLocalLLM.js'

// ── Local LLM Bridge — Connects QwenLocalLLM ↔ LocalBrain for smart routing ─
export {
  LocalLLMBridge,
  type QueryIntent,
  type RoutingTarget,
  type BridgeConfig,
  type RoutingDecision,
  type BridgeResponse,
  type BridgeStats,
} from './LocalLLMBridge.js'

// ── Model Spark — Dual-Model Ensemble (Qwen2.5 + LLaMA) for best performance ──
export { ModelSpark, DEFAULT_MODEL_SPARK_CONFIG } from './ModelSpark.js'

export type {
  SparkModelFamily,
  InferenceStrategy,
  TaskDomain,
  ModelPreference,
  SparkModel,
  ModelSparkConfig,
  SparkRequest,
  ModelResponse as SparkModelResponse,
  SparkResponse,
  RoutingRule as SparkRoutingRule,
  ModelHealth,
  EnsembleVote,
  SpeculativeResult,
  FusionResult,
  BenchmarkResult,
  ModelSparkStats,
} from './ModelSpark.js'
