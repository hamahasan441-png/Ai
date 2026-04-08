/**
 * AI Engine - Core AI processing engine for the Android app
 * Bridges all 120+ AI chat modules into a unified mobile interface.
 * Fully offline - no external APIs required.
 */

// Module registry with metadata
export interface AIModule {
  name: string;
  category: string;
  description: string;
  keywords: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  module?: string;
}

export interface ProcessingResult {
  response: string;
  module: string;
  confidence: number;
  suggestions?: string[];
}

// Complete registry of all 120 AI modules organized by category
const MODULE_REGISTRY: AIModule[] = [
  // === Language & NLP ===
  { name: 'LanguageDetector', category: 'Language & NLP', description: 'Detects language of input text', keywords: ['language', 'detect', 'identify'] },
  { name: 'SentimentAnalyzer', category: 'Language & NLP', description: 'Analyzes sentiment and emotion in text', keywords: ['sentiment', 'emotion', 'feeling', 'mood'] },
  { name: 'NormalizationEngine', category: 'Language & NLP', description: 'Normalizes and cleans text input', keywords: ['normalize', 'clean', 'text'] },
  { name: 'TopicModeler', category: 'Language & NLP', description: 'Identifies topics in text', keywords: ['topic', 'subject', 'theme'] },
  { name: 'CoreferenceResolver', category: 'Language & NLP', description: 'Resolves pronoun references in text', keywords: ['coreference', 'pronoun', 'reference'] },
  { name: 'DialogueActRecognizer', category: 'Language & NLP', description: 'Recognizes dialogue acts and intents', keywords: ['dialogue', 'act', 'speech'] },
  { name: 'DialogueManager', category: 'Language & NLP', description: 'Manages conversation flow and state', keywords: ['dialogue', 'conversation', 'flow'] },
  { name: 'NaturalLanguageGenerator', category: 'Language & NLP', description: 'Generates natural language responses', keywords: ['generate', 'nlg', 'text generation'] },
  { name: 'SemanticEngine', category: 'Language & NLP', description: 'Semantic analysis and understanding', keywords: ['semantic', 'meaning', 'understand'] },
  { name: 'TfIdfScorer', category: 'Language & NLP', description: 'TF-IDF text scoring and ranking', keywords: ['tfidf', 'score', 'rank', 'relevance'] },

  // === Kurdish Language ===
  { name: 'KurdishLanguageUtils', category: 'Kurdish Language', description: 'Kurdish language processing utilities', keywords: ['kurdish', 'sorani', 'kurmanji'] },
  { name: 'KurdishMorphologicalAnalyzer', category: 'Kurdish Language', description: 'Kurdish morphological analysis', keywords: ['kurdish', 'morphology', 'word'] },
  { name: 'KurdishSentimentAnalyzer', category: 'Kurdish Language', description: 'Kurdish sentiment analysis', keywords: ['kurdish', 'sentiment', 'emotion'] },
  { name: 'KurdishTranslationCorpus', category: 'Kurdish Language', description: 'Kurdish translation database', keywords: ['kurdish', 'translate', 'translation'] },

  // === Reasoning & Logic ===
  { name: 'ReasoningEngine', category: 'Reasoning & Logic', description: 'General reasoning and logic engine', keywords: ['reason', 'logic', 'think'] },
  { name: 'CausalReasoner', category: 'Reasoning & Logic', description: 'Causal reasoning and analysis', keywords: ['cause', 'effect', 'causal', 'why'] },
  { name: 'AnalogicalReasoner', category: 'Reasoning & Logic', description: 'Reasoning by analogy', keywords: ['analogy', 'similar', 'compare'] },
  { name: 'CounterfactualReasoner', category: 'Reasoning & Logic', description: 'What-if counterfactual analysis', keywords: ['what if', 'counterfactual', 'hypothetical'] },
  { name: 'LogicalProofEngine', category: 'Reasoning & Logic', description: 'Formal logical proofs and verification', keywords: ['proof', 'logic', 'formal', 'verify'] },
  { name: 'TemporalReasoner', category: 'Reasoning & Logic', description: 'Temporal and time-based reasoning', keywords: ['time', 'temporal', 'sequence', 'before', 'after'] },
  { name: 'BayesianNetwork', category: 'Reasoning & Logic', description: 'Probabilistic Bayesian inference', keywords: ['bayesian', 'probability', 'inference'] },
  { name: 'InferenceEngine', category: 'Reasoning & Logic', description: 'Rule-based inference engine', keywords: ['inference', 'rule', 'deduce'] },
  { name: 'HypothesisEngine', category: 'Reasoning & Logic', description: 'Hypothesis generation and testing', keywords: ['hypothesis', 'theory', 'test'] },
  { name: 'ScientificReasoner', category: 'Reasoning & Logic', description: 'Scientific method reasoning', keywords: ['science', 'experiment', 'method'] },

  // === Knowledge & Memory ===
  { name: 'KnowledgeGraphEngine', category: 'Knowledge & Memory', description: 'Knowledge graph management', keywords: ['knowledge', 'graph', 'entity', 'relation'] },
  { name: 'KnowledgeReasoner', category: 'Knowledge & Memory', description: 'Knowledge-based reasoning', keywords: ['knowledge', 'reason', 'fact'] },
  { name: 'KnowledgeSynthesizer', category: 'Knowledge & Memory', description: 'Synthesizes knowledge from sources', keywords: ['synthesize', 'combine', 'knowledge'] },
  { name: 'SemanticMemory', category: 'Knowledge & Memory', description: 'Long-term semantic memory system', keywords: ['memory', 'store', 'recall', 'remember'] },
  { name: 'ContextualMemoryEngine', category: 'Knowledge & Memory', description: 'Context-aware memory management', keywords: ['context', 'memory', 'relevant'] },
  { name: 'WorkingMemoryEngine', category: 'Knowledge & Memory', description: 'Working memory with attention', keywords: ['working memory', 'attention', 'focus'] },
  { name: 'MemoryConsolidator', category: 'Knowledge & Memory', description: 'Memory consolidation and compression', keywords: ['consolidate', 'compress', 'memory'] },
  { name: 'OntologyManager', category: 'Knowledge & Memory', description: 'Ontology and taxonomy management', keywords: ['ontology', 'taxonomy', 'classify'] },
  { name: 'FactVerificationEngine', category: 'Knowledge & Memory', description: 'Fact checking and verification', keywords: ['fact', 'check', 'verify', 'true'] },
  { name: 'ConceptMapper', category: 'Knowledge & Memory', description: 'Concept mapping and relationships', keywords: ['concept', 'map', 'relationship'] },

  // === Analysis & Decision ===
  { name: 'AnalyticalReasoner', category: 'Analysis & Decision', description: 'SWOT, 5-Why, Fishbone, PEST analysis', keywords: ['swot', 'analysis', 'fishbone', 'pest'] },
  { name: 'DecisionEngine', category: 'Analysis & Decision', description: 'Decision support and analysis', keywords: ['decision', 'choose', 'option'] },
  { name: 'ArgumentAnalyzer', category: 'Analysis & Decision', description: 'Argument analysis and evaluation', keywords: ['argument', 'debate', 'claim'] },
  { name: 'DebateEngine', category: 'Analysis & Decision', description: 'Pro-con debate and fallacy detection', keywords: ['debate', 'pro', 'con', 'fallacy'] },
  { name: 'EthicalReasoner', category: 'Analysis & Decision', description: 'Ethical analysis and reasoning', keywords: ['ethics', 'moral', 'right', 'wrong'] },
  { name: 'EconomicAnalyzer', category: 'Analysis & Decision', description: 'Economic analysis and modeling', keywords: ['economics', 'market', 'financial'] },
  { name: 'InsightExtractor', category: 'Analysis & Decision', description: 'Extracts insights from data', keywords: ['insight', 'trend', 'pattern', 'anomaly'] },
  { name: 'DocumentAnalyzer', category: 'Analysis & Decision', description: 'Document analysis and processing', keywords: ['document', 'pdf', 'analyze'] },

  // === Planning & Goals ===
  { name: 'PlanningEngine', category: 'Planning & Goals', description: 'Task and project planning', keywords: ['plan', 'schedule', 'project'] },
  { name: 'GoalManager', category: 'Planning & Goals', description: 'Goal setting and tracking', keywords: ['goal', 'objective', 'milestone'] },
  { name: 'StrategicPlanner', category: 'Planning & Goals', description: 'Strategic planning with Monte Carlo', keywords: ['strategy', 'strategic', 'long-term'] },
  { name: 'ProblemDecomposer', category: 'Planning & Goals', description: 'Problem decomposition and solving', keywords: ['decompose', 'break down', 'problem'] },
  { name: 'TaskOrchestrator', category: 'Planning & Goals', description: 'Task orchestration and scheduling', keywords: ['task', 'orchestrate', 'workflow'] },

  // === Code & Development ===
  { name: 'CodeAgent', category: 'Code & Development', description: 'Code generation and assistance', keywords: ['code', 'program', 'develop'] },
  { name: 'CodeIntentPredictor', category: 'Code & Development', description: 'Predicts coding intent', keywords: ['code', 'intent', 'predict'] },
  { name: 'CodeOptimizer', category: 'Code & Development', description: 'Code optimization and performance', keywords: ['optimize', 'performance', 'code'] },
  { name: 'IntelligentRefactorer', category: 'Code & Development', description: 'Code refactoring assistance', keywords: ['refactor', 'code', 'improve'] },
  { name: 'SemanticCodeAnalyzer', category: 'Code & Development', description: 'Semantic code analysis', keywords: ['code', 'analyze', 'semantic'] },
  { name: 'DataPipelineEngine', category: 'Code & Development', description: 'Data pipeline design and ETL', keywords: ['pipeline', 'etl', 'data', 'transform'] },

  // === Cybersecurity ===
  { name: 'ExploitSearchEngine', category: 'Cybersecurity', description: 'CVE/CWE/exploit database search', keywords: ['exploit', 'cve', 'vulnerability', 'security'] },
  { name: 'ExploitAnalyzer', category: 'Cybersecurity', description: 'Exploit analysis and assessment', keywords: ['exploit', 'analyze', 'attack'] },
  { name: 'ExploitWriter', category: 'Cybersecurity', description: 'Exploit development assistance', keywords: ['exploit', 'write', 'develop'] },
  { name: 'BufferOverflowDebugger', category: 'Cybersecurity', description: 'Buffer overflow analysis and ROP', keywords: ['buffer', 'overflow', 'rop', 'memory'] },
  { name: 'VulnerabilityScanner', category: 'Cybersecurity', description: 'Vulnerability scanning and detection', keywords: ['vulnerability', 'scan', 'detect'] },
  { name: 'ThreatModeler', category: 'Cybersecurity', description: 'Threat modeling and analysis', keywords: ['threat', 'model', 'risk'] },
  { name: 'AttackChainEngine', category: 'Cybersecurity', description: 'Attack chain analysis', keywords: ['attack', 'chain', 'kill chain'] },
  { name: 'NetworkForensics', category: 'Cybersecurity', description: 'Network forensics and analysis', keywords: ['network', 'forensics', 'packet'] },
  { name: 'SecurityTrainer', category: 'Cybersecurity', description: 'Security training and education', keywords: ['security', 'train', 'learn'] },
  { name: 'CyberThreatIntelligence', category: 'Cybersecurity', description: 'Cyber threat intelligence', keywords: ['threat', 'intelligence', 'apt'] },
  { name: 'CloudSecurityAnalyzer', category: 'Cybersecurity', description: 'Cloud security analysis', keywords: ['cloud', 'security', 'aws', 'azure'] },
  { name: 'BugBountyKnowledge', category: 'Cybersecurity', description: 'Bug bounty methodology', keywords: ['bug bounty', 'pentest', 'hunting'] },
  { name: 'TargetScanner', category: 'Cybersecurity', description: 'Target reconnaissance', keywords: ['target', 'scan', 'recon'] },
  { name: 'PythonBlackHat', category: 'Cybersecurity', description: 'Python security tools knowledge', keywords: ['python', 'security', 'hacking'] },

  // === Trading & Finance ===
  { name: 'TradingEngine', category: 'Trading & Finance', description: 'Trading strategies and analysis', keywords: ['trading', 'trade', 'strategy'] },
  { name: 'AdvancedTradingEngine', category: 'Trading & Finance', description: 'Advanced trading techniques', keywords: ['trading', 'advanced', 'algorithm'] },
  { name: 'TradingStrategyAnalyzer', category: 'Trading & Finance', description: 'Trading strategy analysis', keywords: ['strategy', 'backtest', 'trading'] },
  { name: 'MarketAnalyzer', category: 'Trading & Finance', description: 'Market analysis and indicators', keywords: ['market', 'indicator', 'technical'] },
  { name: 'ChartPatternEngine', category: 'Trading & Finance', description: 'Chart pattern recognition', keywords: ['chart', 'pattern', 'candlestick'] },
  { name: 'PortfolioOptimizer', category: 'Trading & Finance', description: 'Portfolio optimization', keywords: ['portfolio', 'diversify', 'optimize'] },
  { name: 'StrategyEngine', category: 'Trading & Finance', description: 'Strategy development engine', keywords: ['strategy', 'develop', 'backtest'] },
  { name: 'MQLCodeFixer', category: 'Trading & Finance', description: 'MQL4/5 code fixing', keywords: ['mql', 'mt4', 'mt5', 'metatrader'] },

  // === Creative & Communication ===
  { name: 'CreativeEngine', category: 'Creative', description: 'Creative content generation', keywords: ['creative', 'generate', 'story', 'poem'] },
  { name: 'CreativeProblemSolver', category: 'Creative', description: 'Creative problem solving techniques', keywords: ['creative', 'problem', 'solve', 'brainstorm'] },
  { name: 'NarrativeEngine', category: 'Creative', description: 'Narrative and storytelling engine', keywords: ['narrative', 'story', 'tell'] },
  { name: 'MultiFormatGenerator', category: 'Creative', description: 'Multi-format content generation', keywords: ['format', 'generate', 'content'] },
  { name: 'PersonalityEngine', category: 'Creative', description: 'Personality adaptation and tone', keywords: ['personality', 'tone', 'style'] },

  // === AI & Learning ===
  { name: 'AdaptiveLearner', category: 'AI & Learning', description: 'Adaptive learning system', keywords: ['learn', 'adapt', 'improve'] },
  { name: 'FeedbackLearner', category: 'AI & Learning', description: 'Learns from feedback', keywords: ['feedback', 'learn', 'improve'] },
  { name: 'CurriculumOptimizer', category: 'AI & Learning', description: 'Learning path optimization', keywords: ['curriculum', 'learn', 'path'] },
  { name: 'CrossDomainTransfer', category: 'AI & Learning', description: 'Cross-domain knowledge transfer', keywords: ['transfer', 'domain', 'cross'] },
  { name: 'SemanticTrainer', category: 'AI & Learning', description: 'Semantic model training', keywords: ['train', 'semantic', 'model'] },
  { name: 'PatternRecognizer', category: 'AI & Learning', description: 'Pattern recognition and matching', keywords: ['pattern', 'recognize', 'match'] },
  { name: 'AnomalyDetector', category: 'AI & Learning', description: 'Anomaly and outlier detection', keywords: ['anomaly', 'outlier', 'unusual'] },

  // === Meta-Cognition & Self ===
  { name: 'MetaCognition', category: 'Meta-Intelligence', description: 'Meta-cognitive monitoring', keywords: ['meta', 'cognition', 'think about thinking'] },
  { name: 'SelfReflectionEngine', category: 'Meta-Intelligence', description: 'Self-reflection and evaluation', keywords: ['reflect', 'evaluate', 'self'] },
  { name: 'SelfModelEngine', category: 'Meta-Intelligence', description: 'Self-capability modeling', keywords: ['self', 'capability', 'limitation'] },
  { name: 'ConfidenceGate', category: 'Meta-Intelligence', description: 'Confidence scoring and gating', keywords: ['confidence', 'score', 'certain'] },
  { name: 'ResponseQualityScorer', category: 'Meta-Intelligence', description: 'Response quality evaluation', keywords: ['quality', 'score', 'response'] },
  { name: 'EmotionEngine', category: 'Meta-Intelligence', description: 'Emotion processing engine', keywords: ['emotion', 'feeling', 'affect'] },
  { name: 'EmotionalIntelligence', category: 'Meta-Intelligence', description: 'Emotional intelligence system', keywords: ['emotional', 'intelligence', 'empathy'] },

  // === Integration & Orchestration ===
  { name: 'LocalBrain', category: 'Integration', description: 'Local brain orchestration', keywords: ['brain', 'local', 'orchestrate'] },
  { name: 'DevBrain', category: 'Integration', description: 'Developer brain assistant', keywords: ['dev', 'brain', 'developer'] },
  { name: 'AIToolkitBridge', category: 'Integration', description: 'AI toolkit bridge', keywords: ['toolkit', 'bridge', 'connect'] },
  { name: 'LocalLLMBridge', category: 'Integration', description: 'Local LLM integration bridge', keywords: ['llm', 'local', 'model'] },
  { name: 'QwenLocalLLM', category: 'Integration', description: 'Qwen local LLM integration', keywords: ['qwen', 'llm', 'local'] },
  { name: 'CollaborationEngine', category: 'Integration', description: 'Multi-agent collaboration', keywords: ['collaborate', 'agent', 'team'] },
  { name: 'SemanticBridge', category: 'Integration', description: 'Semantic integration bridge', keywords: ['semantic', 'bridge', 'integrate'] },
  { name: 'MultiModalFusion', category: 'Integration', description: 'Multi-modal data fusion', keywords: ['multi-modal', 'fusion', 'combine'] },

  // === Context & Understanding ===
  { name: 'ContextManager', category: 'Context & Understanding', description: 'Context management and tracking', keywords: ['context', 'manage', 'track'] },
  { name: 'DeepUnderstandingEngine', category: 'Context & Understanding', description: 'Deep comprehension engine', keywords: ['understand', 'deep', 'comprehend'] },
  { name: 'IntentEngine', category: 'Context & Understanding', description: 'Intent detection and classification', keywords: ['intent', 'classify', 'detect'] },
  { name: 'ExplanationEngine', category: 'Context & Understanding', description: 'Explanation generation', keywords: ['explain', 'why', 'how'] },
  { name: 'ConversationSummarizer', category: 'Context & Understanding', description: 'Conversation summarization', keywords: ['summarize', 'summary', 'brief'] },
  { name: 'QueryDecomposer', category: 'Context & Understanding', description: 'Query decomposition', keywords: ['query', 'decompose', 'break down'] },
  { name: 'TokenBudgetManager', category: 'Context & Understanding', description: 'Token budget management', keywords: ['token', 'budget', 'limit'] },

  // === Search & Analysis ===
  { name: 'AdvancedSearchEngine', category: 'Search & Analysis', description: 'Advanced search capabilities', keywords: ['search', 'find', 'query'] },
  { name: 'ImageAnalyzer', category: 'Search & Analysis', description: 'Image analysis', keywords: ['image', 'picture', 'visual'] },
  { name: 'PdfExpert', category: 'Search & Analysis', description: 'PDF document expertise', keywords: ['pdf', 'document', 'read'] },

  // === Quality & Evaluation ===
  { name: 'BrainContract', category: 'Quality', description: 'Brain contract validation', keywords: ['contract', 'validate', 'check'] },
  { name: 'BrainEvalHarness', category: 'Quality', description: 'Brain evaluation harness', keywords: ['evaluate', 'test', 'harness'] },
  { name: 'ToolReasoningEngine', category: 'Quality', description: 'Tool selection reasoning', keywords: ['tool', 'reason', 'select'] },
  { name: 'AbstractionEngine', category: 'Quality', description: 'Abstraction and generalization', keywords: ['abstract', 'generalize', 'pattern'] },
];

/**
 * AI Engine - Routes user queries to the appropriate AI module
 * and generates responses using the local knowledge base.
 */
export class AIEngine {
  private modules: AIModule[] = MODULE_REGISTRY;
  private conversationHistory: ChatMessage[] = [];
  private activeModules: Set<string> = new Set(MODULE_REGISTRY.map(m => m.name));

  /**
   * Get all available modules
   */
  getModules(): AIModule[] {
    return [...this.modules];
  }

  /**
   * Get modules by category
   */
  getModulesByCategory(): Record<string, AIModule[]> {
    const categories: Record<string, AIModule[]> = {};
    for (const mod of this.modules) {
      if (!categories[mod.category]) {
        categories[mod.category] = [];
      }
      categories[mod.category].push(mod);
    }
    return categories;
  }

  /**
   * Get total module count
   */
  getModuleCount(): number {
    return this.modules.length;
  }

  /**
   * Get active module count
   */
  getActiveModuleCount(): number {
    return this.activeModules.size;
  }

  /**
   * Toggle a module on/off
   */
  toggleModule(name: string): boolean {
    if (this.activeModules.has(name)) {
      this.activeModules.delete(name);
      return false;
    } else {
      this.activeModules.add(name);
      return true;
    }
  }

  /**
   * Check if a module is active
   */
  isModuleActive(name: string): boolean {
    return this.activeModules.has(name);
  }

  /**
   * Find the best matching module for a query
   */
  findBestModule(query: string): AIModule | null {
    const queryLower = query.toLowerCase();
    let bestMatch: AIModule | null = null;
    let bestScore = 0;

    for (const mod of this.modules) {
      if (!this.activeModules.has(mod.name)) continue;

      let score = 0;

      // Check keyword matches
      for (const keyword of mod.keywords) {
        if (queryLower.includes(keyword)) {
          score += 10;
        }
      }

      // Check description match
      const descWords = mod.description.toLowerCase().split(' ');
      for (const word of descWords) {
        if (word.length > 3 && queryLower.includes(word)) {
          score += 3;
        }
      }

      // Check category match
      if (queryLower.includes(mod.category.toLowerCase())) {
        score += 5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = mod;
      }
    }

    return bestMatch;
  }

  /**
   * Process a user message and generate a response
   */
  async processMessage(userMessage: string): Promise<ProcessingResult> {
    const bestModule = this.findBestModule(userMessage);
    const moduleName = bestModule?.name || 'LocalBrain';

    // Add to conversation history
    const userMsg: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    this.conversationHistory.push(userMsg);

    // Generate response based on module routing
    const response = this.generateResponse(userMessage, bestModule);
    const confidence = bestModule ? this.calculateConfidence(userMessage, bestModule) : 0.5;

    // Add assistant message to history
    const assistantMsg: ChatMessage = {
      id: this.generateId(),
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
      module: moduleName,
    };
    this.conversationHistory.push(assistantMsg);

    // Generate suggestions
    const suggestions = this.generateSuggestions(userMessage, bestModule);

    return {
      response,
      module: moduleName,
      confidence,
      suggestions,
    };
  }

  /**
   * Generate a response based on the matched module
   */
  private generateResponse(query: string, module: AIModule | null): string {
    if (!module) {
      return this.getGeneralResponse(query);
    }

    const queryLower = query.toLowerCase();

    // Category-specific response generation
    switch (module.category) {
      case 'Cybersecurity':
        return this.getCybersecurityResponse(queryLower, module);
      case 'Trading & Finance':
        return this.getTradingResponse(queryLower, module);
      case 'Code & Development':
        return this.getCodeResponse(queryLower, module);
      case 'Reasoning & Logic':
        return this.getReasoningResponse(queryLower, module);
      case 'Language & NLP':
        return this.getNLPResponse(queryLower, module);
      case 'Kurdish Language':
        return this.getKurdishResponse(queryLower, module);
      case 'Knowledge & Memory':
        return this.getKnowledgeResponse(queryLower, module);
      case 'Analysis & Decision':
        return this.getAnalysisResponse(queryLower, module);
      case 'Planning & Goals':
        return this.getPlanningResponse(queryLower, module);
      case 'Creative':
        return this.getCreativeResponse(queryLower, module);
      case 'Meta-Intelligence':
        return this.getMetaResponse(queryLower, module);
      case 'AI & Learning':
        return this.getLearningResponse(queryLower, module);
      default:
        return this.getModuleResponse(module);
    }
  }

  private getCybersecurityResponse(query: string, module: AIModule): string {
    const responses: Record<string, string> = {
      ExploitSearchEngine: `🔍 **Exploit Search Engine**\n\nI can search through CVE, CWE, and exploit databases.\n\n**Capabilities:**\n• CVE Database: 20+ entries with CVSS scoring\n• CWE Database: 22 weakness categories\n• Exploit Database: 20+ known exploits\n• 16 discovery patterns\n• CVSS v3.1 calculator\n• Exploit chain builder\n\nTry asking about specific CVEs, vulnerability types, or exploit techniques.`,
      BufferOverflowDebugger: `🐛 **Buffer Overflow Debugger**\n\nSpecialized in memory corruption analysis.\n\n**Capabilities:**\n• 10 overflow types detection\n• ROP chain building (4 objectives)\n• 12 heap techniques (tcache, fastbin, house_of_*)\n• Checksec analysis\n• GDB script generation\n• Format string exploitation\n• Fuzzing support\n• Cyclic pattern generation`,
      VulnerabilityScanner: `🛡️ **Vulnerability Scanner**\n\nScan and detect security vulnerabilities.\n\n**Features:**\n• Common vulnerability patterns\n• Code-level security analysis\n• Configuration review\n• Dependency vulnerability checks`,
      PythonBlackHat: `🐍 **Python Security Tools**\n\n298 knowledge entries across 16 attack domains:\n• Exploit development\n• Malware analysis\n• Network attacks\n• Web exploitation\n• Reverse engineering\n• Cryptographic attacks\n• Reconnaissance\n• Privilege escalation\n• C2 frameworks\n• Evasion techniques`,
    };
    return responses[module.name] || `🔒 **${module.name}**\n\n${module.description}\n\nThis cybersecurity module is ready to assist with security analysis and threat assessment.`;
  }

  private getTradingResponse(query: string, module: AIModule): string {
    return `📊 **${module.name}**\n\n${module.description}\n\n**Trading Analysis Capabilities:**\n• Technical indicators (RSI, MACD, Bollinger Bands)\n• Chart pattern recognition\n• Strategy backtesting\n• Risk management\n• Portfolio optimization\n• MQL4/5 code assistance\n\nAsk me about specific trading strategies, indicators, or market analysis techniques.`;
  }

  private getCodeResponse(query: string, module: AIModule): string {
    return `💻 **${module.name}**\n\n${module.description}\n\n**Development Capabilities:**\n• Code generation and refactoring\n• Performance optimization (Big-O analysis)\n• Anti-pattern detection\n• Code review assistance\n• Data pipeline design\n• Semantic code analysis\n\nDescribe your coding challenge and I'll help you solve it.`;
  }

  private getReasoningResponse(query: string, module: AIModule): string {
    return `🧠 **${module.name}**\n\n${module.description}\n\n**Reasoning Capabilities:**\n• Logical proofs and verification\n• Causal chain analysis\n• Bayesian probability inference\n• Temporal sequence reasoning\n• Hypothesis generation and testing\n• Analogical reasoning\n\nPresent a problem or question for logical analysis.`;
  }

  private getNLPResponse(query: string, module: AIModule): string {
    return `📝 **${module.name}**\n\n${module.description}\n\n**NLP Capabilities:**\n• Language detection\n• Sentiment analysis\n• Topic modeling\n• Text normalization\n• Dialogue management\n• Natural language generation\n\nProvide text for analysis or ask about NLP techniques.`;
  }

  private getKurdishResponse(query: string, module: AIModule): string {
    return `🗣️ **${module.name}**\n\n${module.description}\n\n**Kurdish Language Support:**\n• Sorani and Kurmanji dialects\n• Morphological analysis\n• Sentiment analysis\n• Translation corpus\n• Text processing utilities\n\nسڵاو! بپرسە لە کوردی.`;
  }

  private getKnowledgeResponse(query: string, module: AIModule): string {
    return `📚 **${module.name}**\n\n${module.description}\n\n**Knowledge Capabilities:**\n• Entity and relation management\n• BFS graph traversal\n• Knowledge inference\n• Semantic similarity\n• Fact verification\n• Concept mapping\n• Memory consolidation\n\nAsk me to explore, connect, or verify knowledge.`;
  }

  private getAnalysisResponse(query: string, module: AIModule): string {
    return `📊 **${module.name}**\n\n${module.description}\n\n**Analysis Capabilities:**\n• SWOT Analysis\n• 5-Why Root Cause\n• Fishbone Diagrams\n• PEST Analysis\n• Porter's Five Forces\n• Decision Matrix\n• Cost-Benefit Analysis\n\nDescribe a situation for comprehensive analysis.`;
  }

  private getPlanningResponse(query: string, module: AIModule): string {
    return `📋 **${module.name}**\n\n${module.description}\n\n**Planning Capabilities:**\n• Task decomposition\n• Dependency analysis\n• Milestone tracking\n• Strategic planning\n• Monte Carlo simulation\n• Contingency planning\n\nTell me about your project or goal for planning assistance.`;
  }

  private getCreativeResponse(query: string, module: AIModule): string {
    return `🎨 **${module.name}**\n\n${module.description}\n\n**Creative Capabilities:**\n• Story generation\n• Poetry and prose\n• Brainstorming techniques\n• Creative problem solving\n• Multi-format content\n• Style adaptation\n\nShare your creative challenge or ask for inspiration.`;
  }

  private getMetaResponse(query: string, module: AIModule): string {
    return `🪞 **${module.name}**\n\n${module.description}\n\n**Meta-Intelligence Capabilities:**\n• Self-reflection and evaluation\n• Confidence scoring\n• Quality assessment\n• Emotional intelligence\n• Capability modeling\n• Limitation awareness\n\nAsk me to reflect on my responses or evaluate quality.`;
  }

  private getLearningResponse(query: string, module: AIModule): string {
    return `📖 **${module.name}**\n\n${module.description}\n\n**Learning Capabilities:**\n• Adaptive learning paths\n• Feedback incorporation\n• Pattern recognition\n• Cross-domain transfer\n• Anomaly detection\n• Curriculum optimization\n\nTell me what you want to learn about.`;
  }

  private getModuleResponse(module: AIModule): string {
    return `🤖 **${module.name}**\n\n${module.description}\n\nCategory: ${module.category}\n\nThis module is active and ready to assist. Please describe your specific question or task.`;
  }

  private getGeneralResponse(query: string): string {
    const greetings = ['hello', 'hi', 'hey', 'greet', 'salam', 'سڵاو'];
    const queryLower = query.toLowerCase();

    if (greetings.some(g => queryLower.includes(g))) {
      return `👋 **Hello!**\n\nI'm your AI Assistant with **${this.getModuleCount()} modules** running fully offline.\n\n**What I can help with:**\n🔒 Cybersecurity & Exploit Analysis\n📊 Trading & Financial Analysis\n💻 Code Development & Optimization\n🧠 Reasoning & Logic\n📝 Language Processing & NLP\n🎨 Creative Content Generation\n📋 Planning & Goal Management\n📚 Knowledge & Memory\n🗣️ Kurdish Language Support\n\nJust ask me anything!`;
    }

    if (queryLower.includes('help') || queryLower.includes('what can you do')) {
      return `🤖 **AI Assistant - ${this.getModuleCount()} Modules**\n\n**Categories:**\n\n🔒 **Cybersecurity** (14 modules)\nExploit search, vulnerability scanning, threat modeling, buffer overflow analysis\n\n📊 **Trading** (8 modules)\nTechnical analysis, chart patterns, portfolio optimization, MQL coding\n\n💻 **Development** (6 modules)\nCode generation, optimization, refactoring, semantic analysis\n\n🧠 **Reasoning** (10 modules)\nLogical proofs, causal analysis, Bayesian inference, temporal reasoning\n\n📝 **NLP** (10 modules)\nLanguage detection, sentiment, dialogue, generation\n\n📚 **Knowledge** (10 modules)\nKnowledge graphs, memory, fact verification, concept mapping\n\n📊 **Analysis** (8 modules)\nSWOT, decision support, debate, economic analysis\n\nAnd many more! Just ask your question.`;
    }

    return `🤖 I've analyzed your query across ${this.getActiveModuleCount()} active modules.\n\n"${query}"\n\nI'm processing this with my general intelligence. Could you provide more details or specify which area you'd like help with?\n\n**Quick suggestions:**\n• 🔒 Security analysis\n• 💻 Code help\n• 📊 Data analysis\n• 🧠 Reasoning\n• 📝 Text processing`;
  }

  /**
   * Calculate confidence score for module match
   */
  private calculateConfidence(query: string, module: AIModule): number {
    const queryLower = query.toLowerCase();
    let matches = 0;
    let totalKeywords = module.keywords.length;

    for (const keyword of module.keywords) {
      if (queryLower.includes(keyword)) {
        matches++;
      }
    }

    return Math.min(0.95, 0.3 + (matches / totalKeywords) * 0.65);
  }

  /**
   * Generate follow-up suggestions
   */
  private generateSuggestions(query: string, module: AIModule | null): string[] {
    if (!module) {
      return [
        'What can you do?',
        'Tell me about cybersecurity',
        'Help me with coding',
        'Analyze this text',
      ];
    }

    const suggestions: Record<string, string[]> = {
      'Cybersecurity': [
        'Search for CVE-2024 vulnerabilities',
        'Explain buffer overflow attacks',
        'Show me OWASP Top 10',
        'How to do threat modeling?',
      ],
      'Trading & Finance': [
        'Explain RSI indicator',
        'How to use Bollinger Bands?',
        'Portfolio diversification strategy',
        'MQL4 order management',
      ],
      'Code & Development': [
        'Optimize this algorithm',
        'Code review best practices',
        'Refactoring patterns',
        'Design patterns in TypeScript',
      ],
      'Reasoning & Logic': [
        'Prove this logical statement',
        'Analyze cause and effect',
        'Bayesian probability example',
        'What-if scenario analysis',
      ],
      'Language & NLP': [
        'Detect language of this text',
        'Analyze sentiment',
        'Summarize this conversation',
        'Extract topics from text',
      ],
      'Kurdish Language': [
        'Translate to Kurdish',
        'Kurdish morphology',
        'Kurdish sentiment analysis',
        'وشەی کوردی',
      ],
    };

    return suggestions[module.category] || [
      `More about ${module.name}`,
      `${module.category} overview`,
      'What else can you help with?',
      'Show all modules',
    ];
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Singleton instance
let engineInstance: AIEngine | null = null;

export function getAIEngine(): AIEngine {
  if (!engineInstance) {
    engineInstance = new AIEngine();
  }
  return engineInstance;
}

export default AIEngine;
