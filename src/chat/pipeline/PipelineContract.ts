/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  PipelineContract — Single source of truth for intelligence pipeline        ║
 * ║  Defines all phases, module registry, and dependency ordering               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Phase Enum ────────────────────────────────────────────────────────────────

/** All intelligence phases in strict execution order. */
export enum PipelinePhase {
  PHASE_1_CORE = 1,
  PHASE_2_SEMANTIC = 2,
  PHASE_3_COGNITIVE = 3,
  PHASE_4_FINANCIAL = 4,
  PHASE_5_SEMANTIC_ADV = 5,
  PHASE_6_CYBERSEC = 6,
  PHASE_7_UNDERSTANDING = 7,
  PHASE_8_DEEP = 8,
  PHASE_9_CODE = 9,
  PHASE_10_TRAINING = 10,
}

/** Human-readable phase labels. */
export const PHASE_LABELS: Record<PipelinePhase, string> = {
  [PipelinePhase.PHASE_1_CORE]: 'Core Intelligence',
  [PipelinePhase.PHASE_2_SEMANTIC]: 'Semantic Memory',
  [PipelinePhase.PHASE_3_COGNITIVE]: 'Cognitive Reasoning',
  [PipelinePhase.PHASE_4_FINANCIAL]: 'Trading & Financial',
  [PipelinePhase.PHASE_5_SEMANTIC_ADV]: 'Advanced Semantic',
  [PipelinePhase.PHASE_6_CYBERSEC]: 'Cybersecurity',
  [PipelinePhase.PHASE_7_UNDERSTANDING]: 'Deep Understanding',
  [PipelinePhase.PHASE_8_DEEP]: 'Deep Analysis',
  [PipelinePhase.PHASE_9_CODE]: 'Semantic Code',
  [PipelinePhase.PHASE_10_TRAINING]: 'Training Excellence',
}

// ─── Module Registry ───────────────────────────────────────────────────────────

/** A registered intelligence module descriptor. */
export interface ModuleDescriptor {
  /** Unique module identifier (class name). */
  readonly name: string
  /** Which phase this module belongs to. */
  readonly phase: PipelinePhase
  /** Relative import path from src/chat/. */
  readonly importPath: string
  /** Brief capability description. */
  readonly description: string
  /** Module names this depends on (must init first). */
  readonly dependencies: readonly string[]
}

/**
 * Complete registry of all 47 intelligence modules.
 * This is the single source of truth — if a module isn't here, it doesn't exist.
 */
export const MODULE_REGISTRY: readonly ModuleDescriptor[] = [
  // ── Phase 1: Core Intelligence (5 modules) ──
  {
    name: 'SemanticEngine',
    phase: PipelinePhase.PHASE_1_CORE,
    importPath: './SemanticEngine',
    description: 'Semantic similarity and concept matching',
    dependencies: [],
  },
  {
    name: 'IntentEngine',
    phase: PipelinePhase.PHASE_1_CORE,
    importPath: './IntentEngine',
    description: 'User intent classification',
    dependencies: [],
  },
  {
    name: 'ContextManager',
    phase: PipelinePhase.PHASE_1_CORE,
    importPath: './ContextManager',
    description: 'Conversation context tracking',
    dependencies: [],
  },
  {
    name: 'ReasoningEngine',
    phase: PipelinePhase.PHASE_1_CORE,
    importPath: './ReasoningEngine',
    description: 'Logical reasoning and inference',
    dependencies: [],
  },
  {
    name: 'MetaCognition',
    phase: PipelinePhase.PHASE_1_CORE,
    importPath: './MetaCognition',
    description: 'Self-awareness and confidence calibration',
    dependencies: [],
  },

  // ── Phase 2: Semantic Memory (4 modules) ──
  {
    name: 'SemanticMemory',
    phase: PipelinePhase.PHASE_2_SEMANTIC,
    importPath: './SemanticMemory',
    description: 'Knowledge graph storage',
    dependencies: ['SemanticEngine'],
  },
  {
    name: 'SemanticTrainer',
    phase: PipelinePhase.PHASE_2_SEMANTIC,
    importPath: './SemanticTrainer',
    description: 'Semantic model training',
    dependencies: ['SemanticMemory'],
  },
  {
    name: 'AnalogicalReasoner',
    phase: PipelinePhase.PHASE_2_SEMANTIC,
    importPath: './AnalogicalReasoner',
    description: 'Analogy-based reasoning',
    dependencies: ['SemanticMemory'],
  },
  {
    name: 'TopicModeler',
    phase: PipelinePhase.PHASE_2_SEMANTIC,
    importPath: './TopicModeler',
    description: 'Topic extraction and clustering',
    dependencies: ['SemanticEngine'],
  },

  // ── Phase 3: Cognitive Reasoning (4 modules) ──
  {
    name: 'CausalReasoner',
    phase: PipelinePhase.PHASE_3_COGNITIVE,
    importPath: './CausalReasoner',
    description: 'Causal relationship analysis',
    dependencies: ['ReasoningEngine'],
  },
  {
    name: 'AbstractionEngine',
    phase: PipelinePhase.PHASE_3_COGNITIVE,
    importPath: './AbstractionEngine',
    description: 'Concept abstraction hierarchy',
    dependencies: ['SemanticMemory'],
  },
  {
    name: 'PlanningEngine',
    phase: PipelinePhase.PHASE_3_COGNITIVE,
    importPath: './PlanningEngine',
    description: 'Goal decomposition and planning',
    dependencies: ['ReasoningEngine'],
  },
  {
    name: 'CreativeEngine',
    phase: PipelinePhase.PHASE_3_COGNITIVE,
    importPath: './CreativeEngine',
    description: 'Creative ideation and synthesis',
    dependencies: [],
  },

  // ── Phase 4: Trading & Financial (8 modules) ──
  {
    name: 'TradingEngine',
    phase: PipelinePhase.PHASE_4_FINANCIAL,
    importPath: './TradingEngine',
    description: 'Trading signal generation',
    dependencies: [],
  },
  {
    name: 'MarketAnalyzer',
    phase: PipelinePhase.PHASE_4_FINANCIAL,
    importPath: './MarketAnalyzer',
    description: 'Market sentiment analysis',
    dependencies: [],
  },
  {
    name: 'PortfolioOptimizer',
    phase: PipelinePhase.PHASE_4_FINANCIAL,
    importPath: './PortfolioOptimizer',
    description: 'Portfolio allocation optimization',
    dependencies: ['MarketAnalyzer'],
  },
  {
    name: 'StrategyEngine',
    phase: PipelinePhase.PHASE_4_FINANCIAL,
    importPath: './StrategyEngine',
    description: 'Trading strategy backtesting',
    dependencies: ['TradingEngine'],
  },
  {
    name: 'DecisionEngine',
    phase: PipelinePhase.PHASE_4_FINANCIAL,
    importPath: './DecisionEngine',
    description: 'Multi-criteria decision analysis',
    dependencies: [],
  },
  {
    name: 'KnowledgeSynthesizer',
    phase: PipelinePhase.PHASE_4_FINANCIAL,
    importPath: './KnowledgeSynthesizer',
    description: 'Cross-domain knowledge fusion',
    dependencies: [],
  },
  {
    name: 'EconomicAnalyzer',
    phase: PipelinePhase.PHASE_4_FINANCIAL,
    importPath: './EconomicAnalyzer',
    description: 'Economic indicator analysis',
    dependencies: ['MarketAnalyzer'],
  },
  {
    name: 'SecurityTrainer',
    phase: PipelinePhase.PHASE_4_FINANCIAL,
    importPath: './SecurityTrainer',
    description: 'Security training scenarios',
    dependencies: [],
  },

  // ── Phase 5: Advanced Semantic (8 modules) ──
  {
    name: 'EmotionEngine',
    phase: PipelinePhase.PHASE_5_SEMANTIC_ADV,
    importPath: './EmotionEngine',
    description: 'Emotion detection and response',
    dependencies: ['IntentEngine'],
  },
  {
    name: 'TemporalReasoner',
    phase: PipelinePhase.PHASE_5_SEMANTIC_ADV,
    importPath: './TemporalReasoner',
    description: 'Time-based reasoning',
    dependencies: ['ReasoningEngine'],
  },
  {
    name: 'NormalizationEngine',
    phase: PipelinePhase.PHASE_5_SEMANTIC_ADV,
    importPath: './NormalizationEngine',
    description: 'Data normalization pipelines',
    dependencies: [],
  },
  {
    name: 'BayesianNetwork',
    phase: PipelinePhase.PHASE_5_SEMANTIC_ADV,
    importPath: './BayesianNetwork',
    description: 'Probabilistic inference',
    dependencies: [],
  },
  {
    name: 'OntologyManager',
    phase: PipelinePhase.PHASE_5_SEMANTIC_ADV,
    importPath: './OntologyManager',
    description: 'Ontology management',
    dependencies: ['SemanticMemory'],
  },
  {
    name: 'DialogueManager',
    phase: PipelinePhase.PHASE_5_SEMANTIC_ADV,
    importPath: './DialogueManager',
    description: 'Dialogue flow management',
    dependencies: ['ContextManager'],
  },
  {
    name: 'ArgumentAnalyzer',
    phase: PipelinePhase.PHASE_5_SEMANTIC_ADV,
    importPath: './ArgumentAnalyzer',
    description: 'Argument structure analysis',
    dependencies: ['ReasoningEngine'],
  },
  {
    name: 'NarrativeEngine',
    phase: PipelinePhase.PHASE_5_SEMANTIC_ADV,
    importPath: './NarrativeEngine',
    description: 'Narrative comprehension',
    dependencies: [],
  },

  // ── Phase 6: Cybersecurity (4 modules) ──
  {
    name: 'VulnerabilityScanner',
    phase: PipelinePhase.PHASE_6_CYBERSEC,
    importPath: './VulnerabilityScanner',
    description: 'Vulnerability detection scanning',
    dependencies: [],
  },
  {
    name: 'ThreatModeler',
    phase: PipelinePhase.PHASE_6_CYBERSEC,
    importPath: './ThreatModeler',
    description: 'Threat modeling and assessment',
    dependencies: ['VulnerabilityScanner'],
  },
  {
    name: 'ExploitAnalyzer',
    phase: PipelinePhase.PHASE_6_CYBERSEC,
    importPath: './ExploitAnalyzer',
    description: 'Exploit chain analysis',
    dependencies: ['VulnerabilityScanner'],
  },
  {
    name: 'NetworkForensics',
    phase: PipelinePhase.PHASE_6_CYBERSEC,
    importPath: './NetworkForensics',
    description: 'Network forensics analysis',
    dependencies: [],
  },

  // ── Phase 7: Understanding (4 modules) ──
  {
    name: 'PatternRecognizer',
    phase: PipelinePhase.PHASE_7_UNDERSTANDING,
    importPath: './PatternRecognizer',
    description: 'Pattern detection and matching',
    dependencies: [],
  },
  {
    name: 'ConceptMapper',
    phase: PipelinePhase.PHASE_7_UNDERSTANDING,
    importPath: './ConceptMapper',
    description: 'Concept relationship mapping',
    dependencies: ['SemanticMemory'],
  },
  {
    name: 'InferenceEngine',
    phase: PipelinePhase.PHASE_7_UNDERSTANDING,
    importPath: './InferenceEngine',
    description: 'Forward/backward chaining',
    dependencies: ['ReasoningEngine'],
  },
  {
    name: 'SentimentAnalyzer',
    phase: PipelinePhase.PHASE_7_UNDERSTANDING,
    importPath: './SentimentAnalyzer',
    description: 'Sentiment detection and scoring',
    dependencies: [],
  },

  // ── Phase 8: Deep Analysis (4 modules) ──
  {
    name: 'DeepUnderstandingEngine',
    phase: PipelinePhase.PHASE_8_DEEP,
    importPath: './DeepUnderstandingEngine',
    description: 'Multi-layer understanding',
    dependencies: ['SemanticEngine', 'ReasoningEngine'],
  },
  {
    name: 'TaskOrchestrator',
    phase: PipelinePhase.PHASE_8_DEEP,
    importPath: './TaskOrchestrator',
    description: 'Multi-step task coordination',
    dependencies: ['PlanningEngine'],
  },
  {
    name: 'KnowledgeReasoner',
    phase: PipelinePhase.PHASE_8_DEEP,
    importPath: './KnowledgeReasoner',
    description: 'Knowledge-based reasoning',
    dependencies: ['SemanticMemory', 'ReasoningEngine'],
  },
  {
    name: 'AdaptiveLearner',
    phase: PipelinePhase.PHASE_8_DEEP,
    importPath: './AdaptiveLearner',
    description: 'Adaptive learning strategies',
    dependencies: [],
  },

  // ── Phase 9: Semantic Code (4 modules) ──
  {
    name: 'SemanticCodeAnalyzer',
    phase: PipelinePhase.PHASE_9_CODE,
    importPath: './SemanticCodeAnalyzer',
    description: 'Deep semantic code analysis',
    dependencies: ['SemanticEngine'],
  },
  {
    name: 'IntelligentRefactorer',
    phase: PipelinePhase.PHASE_9_CODE,
    importPath: './IntelligentRefactorer',
    description: 'AI-guided code refactoring',
    dependencies: ['SemanticCodeAnalyzer'],
  },
  {
    name: 'CodeIntentPredictor',
    phase: PipelinePhase.PHASE_9_CODE,
    importPath: './CodeIntentPredictor',
    description: 'Code intention prediction',
    dependencies: ['IntentEngine'],
  },
  {
    name: 'SemanticBridge',
    phase: PipelinePhase.PHASE_9_CODE,
    importPath: './SemanticBridge',
    description: 'NL-to-code semantic bridging',
    dependencies: ['SemanticEngine'],
  },

  // ── Phase 10: Training Excellence (2 modules) ──
  {
    name: 'MultiModalFusion',
    phase: PipelinePhase.PHASE_10_TRAINING,
    importPath: './MultiModalFusion',
    description: 'Multi-modal data fusion',
    dependencies: ['SemanticEngine'],
  },
  {
    name: 'CurriculumOptimizer',
    phase: PipelinePhase.PHASE_10_TRAINING,
    importPath: './CurriculumOptimizer',
    description: 'Adaptive curriculum optimization',
    dependencies: ['AdaptiveLearner'],
  },
] as const

// ─── Registry Helpers ──────────────────────────────────────────────────────────

/** Total count of registered intelligence modules. */
export const TOTAL_MODULES = MODULE_REGISTRY.length

/** Get all modules belonging to a specific phase. */
export function getModulesByPhase(phase: PipelinePhase): readonly ModuleDescriptor[] {
  return MODULE_REGISTRY.filter(m => m.phase === phase)
}

/** Get module counts per phase. */
export function getPhaseModuleCounts(): Record<PipelinePhase, number> {
  const counts = {} as Record<PipelinePhase, number>
  for (const phase of Object.values(PipelinePhase).filter(
    (v): v is PipelinePhase => typeof v === 'number',
  )) {
    counts[phase] = MODULE_REGISTRY.filter(m => m.phase === phase).length
  }
  return counts
}

/** Look up a module descriptor by name. Returns undefined if not found. */
export function findModule(name: string): ModuleDescriptor | undefined {
  return MODULE_REGISTRY.find(m => m.name === name)
}

/** Get all module names as a flat array. */
export function getAllModuleNames(): string[] {
  return MODULE_REGISTRY.map(m => m.name)
}

/** Validate that all module dependencies exist in the registry. */
export function validateDependencies(): { valid: boolean; errors: string[] } {
  const names = new Set(MODULE_REGISTRY.map(m => m.name))
  const errors: string[] = []

  for (const mod of MODULE_REGISTRY) {
    for (const dep of mod.dependencies) {
      if (!names.has(dep)) {
        errors.push(`${mod.name} depends on '${dep}' which is not registered`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/** Get phases in execution order. */
export function getPhaseOrder(): PipelinePhase[] {
  return [
    PipelinePhase.PHASE_1_CORE,
    PipelinePhase.PHASE_2_SEMANTIC,
    PipelinePhase.PHASE_3_COGNITIVE,
    PipelinePhase.PHASE_4_FINANCIAL,
    PipelinePhase.PHASE_5_SEMANTIC_ADV,
    PipelinePhase.PHASE_6_CYBERSEC,
    PipelinePhase.PHASE_7_UNDERSTANDING,
    PipelinePhase.PHASE_8_DEEP,
    PipelinePhase.PHASE_9_CODE,
    PipelinePhase.PHASE_10_TRAINING,
  ]
}

/** Build a topological initialization order respecting dependencies. */
export function getInitOrder(): string[] {
  const nameToMod = new Map(MODULE_REGISTRY.map(m => [m.name, m]))
  const visited = new Set<string>()
  const order: string[] = []

  function visit(name: string): void {
    if (visited.has(name)) return
    visited.add(name)
    const mod = nameToMod.get(name)
    if (!mod) return
    for (const dep of mod.dependencies) {
      visit(dep)
    }
    order.push(name)
  }

  // Visit in phase order for deterministic output
  for (const phase of getPhaseOrder()) {
    for (const mod of getModulesByPhase(phase)) {
      visit(mod.name)
    }
  }

  return order
}
