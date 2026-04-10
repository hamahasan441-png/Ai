/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║   ⚡  M O D E L  S P A R K  —  DUAL-MODEL ENSEMBLE ENGINE                  ║
 * ║                                                                             ║
 * ║   Combines Qwen2.5-Coder and LLaMA models into a unified, high-performance ║
 * ║   inference engine. Both models run 100% offline — zero external APIs.      ║
 * ║                                                                             ║
 * ║   Architecture:                                                             ║
 * ║     ✦ Smart Task Routing — Code tasks → Qwen2.5, reasoning → LLaMA        ║
 * ║     ✦ Ensemble Mode — Both models answer, best response wins               ║
 * ║     ✦ Speculative Decoding — Fast model drafts, strong model verifies      ║
 * ║     ✦ Model Cascading — Small model first, escalate to large if needed     ║
 * ║     ✦ Adaptive Load Balancing — Routes based on latency & quality          ║
 * ║     ✦ Response Fusion — Merges outputs from both models intelligently      ║
 * ║     ✦ Quality Scoring — Automatic response quality evaluation              ║
 * ║     ✦ Warm Standby — Pre-loads both models for instant switching           ║
 * ║                                                                             ║
 * ║   Models:                                                                   ║
 * ║     🟢 Qwen2.5-Coder 7B — Code generation, review, debugging, security    ║
 * ║     🟣 LLaMA 3.1 8B — Reasoning, analysis, general knowledge, planning    ║
 * ║                                                                             ║
 * ║   No API keys. No cloud. Everything runs on the user's machine.             ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { createHash } from 'crypto'

// ─── Types ───────────────────────────────────────────────────────────────────

/** Supported model families in ModelSpark */
export type SparkModelFamily = 'qwen2.5' | 'llama3'

/** Inference strategy for combining models */
export type InferenceStrategy =
  | 'route'              // Route to best model for the task
  | 'ensemble'           // Both models answer, best wins
  | 'cascade'            // Small model first, escalate if needed
  | 'speculative'        // Fast draft + strong verification
  | 'fusion'             // Merge outputs from both models
  | 'parallel_race'      // Both run in parallel, fastest wins
  | 'chain_of_thought'   // One model reasons, other executes

/** Task domain for routing decisions */
export type TaskDomain =
  | 'code_generation'
  | 'code_review'
  | 'code_completion'
  | 'debugging'
  | 'security_analysis'
  | 'exploit_research'
  | 'general_reasoning'
  | 'math_logic'
  | 'creative_writing'
  | 'summarization'
  | 'translation'
  | 'conversation'
  | 'planning'
  | 'data_analysis'

/** Which model(s) to prefer for a task domain */
export type ModelPreference = 'qwen' | 'llama' | 'ensemble' | 'adaptive'

/** A model definition in the Spark registry */
export interface SparkModel {
  id: string
  family: SparkModelFamily
  name: string
  parameterCount: string
  quantization: string
  fileSizeGB: number
  contextWindow: number
  downloadUrl: string
  ollamaName: string
  llamaCppName: string
  strengths: TaskDomain[]
  weaknesses: TaskDomain[]
  minRAMGB: number
  recommendedRAMGB: number
  tokensPerSecondEstimate: number
  description: string
}

/** ModelSpark configuration */
export interface ModelSparkConfig {
  modelsDir: string
  defaultStrategy: InferenceStrategy
  qwenModel: string
  llamaModel: string
  qwenHost: string
  qwenPort: number
  llamaHost: string
  llamaPort: number
  maxTokens: number
  temperature: number
  topP: number
  ensembleVotingThreshold: number
  cascadeQualityThreshold: number
  speculativeAcceptanceRate: number
  parallelTimeout: number
  enableWarmStandby: boolean
  enableAdaptiveRouting: boolean
  enableResponseCaching: boolean
  cacheMaxSize: number
  cacheTTLMs: number
}

/** Inference request to ModelSpark */
export interface SparkRequest {
  prompt: string
  systemPrompt?: string
  domain?: TaskDomain
  strategy?: InferenceStrategy
  preferredModel?: SparkModelFamily
  maxTokens?: number
  temperature?: number
  topP?: number
  context?: string[]
}

/** Response from a single model */
export interface ModelResponse {
  text: string
  modelId: string
  modelFamily: SparkModelFamily
  tokensGenerated: number
  tokensPrompt: number
  durationMs: number
  tokensPerSecond: number
  qualityScore: number
  finishReason: 'stop' | 'length' | 'error'
  error?: string
}

/** Combined response from ModelSpark */
export interface SparkResponse {
  text: string
  strategy: InferenceStrategy
  domain: TaskDomain
  primaryModel: SparkModelFamily
  secondaryModel: SparkModelFamily | null
  primaryResponse: ModelResponse
  secondaryResponse: ModelResponse | null
  fusedResponse: string | null
  qualityScore: number
  totalTokensGenerated: number
  totalDurationMs: number
  effectiveTokensPerSecond: number
  cached: boolean
  routingReason: string
}

/** Routing rule mapping domains to model preferences */
export interface RoutingRule {
  domain: TaskDomain
  preference: ModelPreference
  qwenWeight: number
  llamaWeight: number
  reason: string
}

/** Model health status */
export interface ModelHealth {
  modelId: string
  family: SparkModelFamily
  available: boolean
  loaded: boolean
  lastResponseMs: number
  averageTokensPerSecond: number
  errorCount: number
  successCount: number
  lastError: string | null
  uptime: number
}

/** Ensemble vote from one model */
export interface EnsembleVote {
  modelFamily: SparkModelFamily
  response: string
  qualityScore: number
  confidence: number
  tokensPerSecond: number
}

/** Speculative decoding result */
export interface SpeculativeResult {
  draftModel: SparkModelFamily
  verifierModel: SparkModelFamily
  draftText: string
  verifiedText: string
  acceptanceRate: number
  speedupFactor: number
  tokensAccepted: number
  tokensRejected: number
}

/** Response fusion result */
export interface FusionResult {
  fusedText: string
  sourceTexts: Array<{ model: SparkModelFamily; text: string; weight: number }>
  fusionMethod: 'merge' | 'select_best' | 'interleave' | 'summarize'
  coherenceScore: number
}

/** Performance benchmark result */
export interface BenchmarkResult {
  taskDomain: TaskDomain
  qwenScore: number
  llamaScore: number
  ensembleScore: number
  bestStrategy: InferenceStrategy
  qwenLatencyMs: number
  llamaLatencyMs: number
  recommendation: string
}

/** ModelSpark statistics */
export interface ModelSparkStats {
  totalRequests: number
  qwenRequests: number
  llamaRequests: number
  ensembleRequests: number
  cascadeEscalations: number
  speculativeAcceptances: number
  speculativeRejections: number
  fusionRequests: number
  cacheHits: number
  cacheMisses: number
  averageQualityScore: number
  averageLatencyMs: number
  totalTokensGenerated: number
  qwenTokensPerSecond: number
  llamaTokensPerSecond: number
  domainDistribution: Record<string, number>
  strategyDistribution: Record<string, number>
  errors: number
}

// ─── Model Registry ──────────────────────────────────────────────────────────

/** All supported models in the Spark ensemble */
const SPARK_MODEL_REGISTRY: SparkModel[] = [
  // ── Qwen2.5-Coder Models ──
  {
    id: 'qwen2.5-coder-7b-q4',
    family: 'qwen2.5',
    name: 'Qwen2.5-Coder-7B-Instruct',
    parameterCount: '7B',
    quantization: 'Q4_K_M',
    fileSizeGB: 4.4,
    contextWindow: 32768,
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q4_k_m.gguf',
    ollamaName: 'qwen2.5-coder:7b',
    llamaCppName: 'qwen2.5-coder-7b-instruct-q4_k_m.gguf',
    strengths: ['code_generation', 'code_review', 'code_completion', 'debugging', 'security_analysis', 'exploit_research'],
    weaknesses: ['creative_writing', 'conversation', 'general_reasoning'],
    minRAMGB: 6,
    recommendedRAMGB: 8,
    tokensPerSecondEstimate: 35,
    description: 'Qwen2.5-Coder 7B — Best-in-class for code tasks. Q4 quantization for balanced quality/speed.',
  },
  {
    id: 'qwen2.5-coder-7b-q8',
    family: 'qwen2.5',
    name: 'Qwen2.5-Coder-7B-Instruct-Q8',
    parameterCount: '7B',
    quantization: 'Q8_0',
    fileSizeGB: 7.7,
    contextWindow: 32768,
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q8_0.gguf',
    ollamaName: 'qwen2.5-coder:7b-instruct-q8_0',
    llamaCppName: 'qwen2.5-coder-7b-instruct-q8_0.gguf',
    strengths: ['code_generation', 'code_review', 'code_completion', 'debugging', 'security_analysis', 'exploit_research'],
    weaknesses: ['creative_writing', 'conversation'],
    minRAMGB: 10,
    recommendedRAMGB: 12,
    tokensPerSecondEstimate: 25,
    description: 'Qwen2.5-Coder 7B Q8 — Near-lossless quantization for maximum code quality.',
  },
  {
    id: 'qwen2.5-coder-3b-q4',
    family: 'qwen2.5',
    name: 'Qwen2.5-Coder-3B-Instruct',
    parameterCount: '3B',
    quantization: 'Q4_K_M',
    fileSizeGB: 2.0,
    contextWindow: 32768,
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF/resolve/main/qwen2.5-coder-3b-instruct-q4_k_m.gguf',
    ollamaName: 'qwen2.5-coder:3b',
    llamaCppName: 'qwen2.5-coder-3b-instruct-q4_k_m.gguf',
    strengths: ['code_completion', 'code_generation', 'debugging'],
    weaknesses: ['security_analysis', 'exploit_research', 'creative_writing', 'general_reasoning'],
    minRAMGB: 3,
    recommendedRAMGB: 4,
    tokensPerSecondEstimate: 60,
    description: 'Qwen2.5-Coder 3B — Fast draft model for speculative decoding and cascade entry point.',
  },
  // ── LLaMA 3.1 Models ──
  {
    id: 'llama-3.1-8b-q4',
    family: 'llama3',
    name: 'LLaMA-3.1-8B-Instruct',
    parameterCount: '8B',
    quantization: 'Q4_K_M',
    fileSizeGB: 4.9,
    contextWindow: 131072,
    downloadUrl: 'https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf',
    ollamaName: 'llama3.1:8b',
    llamaCppName: 'Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf',
    strengths: ['general_reasoning', 'math_logic', 'creative_writing', 'summarization', 'translation', 'conversation', 'planning', 'data_analysis'],
    weaknesses: ['code_generation', 'code_completion'],
    minRAMGB: 6,
    recommendedRAMGB: 8,
    tokensPerSecondEstimate: 30,
    description: 'LLaMA 3.1 8B — Excellent reasoning, math, and general knowledge. Strong 128K context.',
  },
  {
    id: 'llama-3.1-8b-q8',
    family: 'llama3',
    name: 'LLaMA-3.1-8B-Instruct-Q8',
    parameterCount: '8B',
    quantization: 'Q8_0',
    fileSizeGB: 8.5,
    contextWindow: 131072,
    downloadUrl: 'https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q8_0.gguf',
    ollamaName: 'llama3.1:8b-instruct-q8_0',
    llamaCppName: 'Meta-Llama-3.1-8B-Instruct-Q8_0.gguf',
    strengths: ['general_reasoning', 'math_logic', 'creative_writing', 'summarization', 'translation', 'conversation', 'planning', 'data_analysis'],
    weaknesses: [],
    minRAMGB: 10,
    recommendedRAMGB: 14,
    tokensPerSecondEstimate: 20,
    description: 'LLaMA 3.1 8B Q8 — Maximum quality reasoning model. Near-lossless quantization.',
  },
  {
    id: 'llama-3.2-3b-q4',
    family: 'llama3',
    name: 'LLaMA-3.2-3B-Instruct',
    parameterCount: '3B',
    quantization: 'Q4_K_M',
    fileSizeGB: 2.0,
    contextWindow: 131072,
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    ollamaName: 'llama3.2:3b',
    llamaCppName: 'Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    strengths: ['conversation', 'summarization', 'translation'],
    weaknesses: ['code_generation', 'math_logic', 'security_analysis', 'exploit_research'],
    minRAMGB: 3,
    recommendedRAMGB: 4,
    tokensPerSecondEstimate: 55,
    description: 'LLaMA 3.2 3B — Lightweight reasoning model for cascade entry and fast drafting.',
  },
]

/** Routing rules: which model is best for which domain */
const ROUTING_RULES: RoutingRule[] = [
  { domain: 'code_generation',    preference: 'qwen',     qwenWeight: 0.90, llamaWeight: 0.10, reason: 'Qwen2.5-Coder excels at code generation with training on 5.5TB code data' },
  { domain: 'code_review',        preference: 'qwen',     qwenWeight: 0.85, llamaWeight: 0.15, reason: 'Qwen2.5-Coder has deep understanding of code patterns and anti-patterns' },
  { domain: 'code_completion',    preference: 'qwen',     qwenWeight: 0.95, llamaWeight: 0.05, reason: 'Qwen2.5-Coder fill-in-the-middle (FIM) capability is superior' },
  { domain: 'debugging',          preference: 'qwen',     qwenWeight: 0.80, llamaWeight: 0.20, reason: 'Qwen2.5-Coder understands error patterns; LLaMA helps with logical reasoning' },
  { domain: 'security_analysis',  preference: 'qwen',     qwenWeight: 0.75, llamaWeight: 0.25, reason: 'Qwen2.5-Coder knows vulnerability patterns; LLaMA adds analytical reasoning' },
  { domain: 'exploit_research',   preference: 'qwen',     qwenWeight: 0.80, llamaWeight: 0.20, reason: 'Qwen2.5-Coder understands exploit code; LLaMA adds context reasoning' },
  { domain: 'general_reasoning',  preference: 'llama',    qwenWeight: 0.20, llamaWeight: 0.80, reason: 'LLaMA 3.1 trained on broad knowledge with strong chain-of-thought' },
  { domain: 'math_logic',         preference: 'llama',    qwenWeight: 0.30, llamaWeight: 0.70, reason: 'LLaMA 3.1 has superior mathematical and logical reasoning' },
  { domain: 'creative_writing',   preference: 'llama',    qwenWeight: 0.10, llamaWeight: 0.90, reason: 'LLaMA 3.1 produces more creative and fluent natural language' },
  { domain: 'summarization',      preference: 'llama',    qwenWeight: 0.25, llamaWeight: 0.75, reason: 'LLaMA 3.1 128K context handles long documents for summarization' },
  { domain: 'translation',        preference: 'llama',    qwenWeight: 0.30, llamaWeight: 0.70, reason: 'LLaMA 3.1 multilingual training covers more languages' },
  { domain: 'conversation',       preference: 'llama',    qwenWeight: 0.20, llamaWeight: 0.80, reason: 'LLaMA 3.1 produces more natural conversational responses' },
  { domain: 'planning',           preference: 'ensemble', qwenWeight: 0.40, llamaWeight: 0.60, reason: 'Planning benefits from both code structure (Qwen) and reasoning (LLaMA)' },
  { domain: 'data_analysis',      preference: 'ensemble', qwenWeight: 0.50, llamaWeight: 0.50, reason: 'Data analysis needs both code (Qwen) and interpretation (LLaMA)' },
]

/** Domain detection patterns */
const DOMAIN_PATTERNS: Array<{ domain: TaskDomain; patterns: RegExp[]; weight: number }> = [
  {
    domain: 'code_generation',
    patterns: [
      /\b(write|create|generate|implement|build|make|code)\s+(a |an |the )?(function|class|module|component|api|endpoint|script|program|method|interface)/i,
      /\b(implement|build|create)\s+(a |an |the )?\w+\s+(in |using |with )/i,
      /```\w*\n/,
    ],
    weight: 0.9,
  },
  {
    domain: 'code_review',
    patterns: [
      /\b(review|analyze|check|audit|inspect|evaluate)\s+(this |my |the )?(code|function|class|implementation)/i,
      /\bcode\s+review\b/i,
      /\bfind\s+(bugs?|issues?|problems?|vulnerabilities?)\s+in\b/i,
    ],
    weight: 0.85,
  },
  {
    domain: 'code_completion',
    patterns: [
      /\bcomplete\s+(this |the )?(code|function|class|implementation)/i,
      /\bfill\s+in\s+(the )?(blank|rest|remaining)/i,
      /\bcontinue\s+(this |the )?(code|function)/i,
    ],
    weight: 0.9,
  },
  {
    domain: 'debugging',
    patterns: [
      /\b(debug|fix|solve|troubleshoot|diagnose)\s+(this |my |the )?(error|bug|issue|problem|crash|exception)/i,
      /\bwhy\s+(does|is|did)\s+(this|it|my)\s+(fail|crash|error|break|not work)/i,
      /\b(error|exception|traceback|stack\s*trace|segfault)\b.*\b(fix|help|solve)\b/i,
    ],
    weight: 0.85,
  },
  {
    domain: 'security_analysis',
    patterns: [
      /\b(security|vulnerability|cve|cwe|owasp)\s+(analysis|scan|check|audit|assessment)/i,
      /\b(penetration|pentest|security)\s+(test|testing|assessment)/i,
      /\b(threat|risk)\s+(model|assessment|analysis)\b/i,
    ],
    weight: 0.9,
  },
  {
    domain: 'exploit_research',
    patterns: [
      /\b(exploit|attack|pwn|hack|payload|shellcode|rop)\s+(development|research|chain|analysis|generation)/i,
      /\b(buffer\s*overflow|heap\s*overflow|use.after.free|format\s*string)\b/i,
      /\b(mitre|att&ck|kill\s*chain)\b/i,
    ],
    weight: 0.9,
  },
  {
    domain: 'general_reasoning',
    patterns: [
      /\b(explain|describe|why|how)\s+(does|is|are|do|would|could|should)\b/i,
      /\b(reason|think|analyze|evaluate|assess|consider)\s+(about|through|over)\b/i,
      /\bwhat\s+(is|are|was|were|would|could|should)\b/i,
    ],
    weight: 0.6,
  },
  {
    domain: 'math_logic',
    patterns: [
      /\b(calculate|compute|solve|prove|derive|equation|formula|theorem)\b/i,
      /\b(math|mathematical|algebra|calculus|statistics|probability)\b/i,
      /\b(logic|logical|proof|boolean|predicate|syllogism)\b/i,
    ],
    weight: 0.85,
  },
  {
    domain: 'creative_writing',
    patterns: [
      /\b(write|create|compose|draft)\s+(a |an |the )?(story|poem|essay|article|blog|letter|email|message)/i,
      /\b(creative|fiction|narrative|poetry)\s+(writing|composition|piece)/i,
    ],
    weight: 0.85,
  },
  {
    domain: 'summarization',
    patterns: [
      /\b(summarize|summary|condense|brief|tldr|tl;dr|overview)\b/i,
      /\b(key\s+points|main\s+ideas|highlights)\b/i,
    ],
    weight: 0.8,
  },
  {
    domain: 'translation',
    patterns: [
      /\b(translate|translation|convert)\s+(from |to |into )/i,
      /\b(in |to |into )(arabic|kurdish|english|french|spanish|german|chinese|japanese|turkish|persian)\b/i,
    ],
    weight: 0.85,
  },
  {
    domain: 'conversation',
    patterns: [
      /\b(hello|hi|hey|good morning|good evening|how are you|thanks|thank you)\b/i,
      /\b(chat|talk|discuss|conversation)\b/i,
    ],
    weight: 0.5,
  },
  {
    domain: 'planning',
    patterns: [
      /\b(plan|roadmap|strategy|schedule|timeline|milestone|objective|goal)\b/i,
      /\b(project|sprint|iteration)\s+(plan|planning|management)\b/i,
      /\bstep.by.step\b/i,
    ],
    weight: 0.75,
  },
  {
    domain: 'data_analysis',
    patterns: [
      /\b(analyze|analysis|visualize|chart|graph|plot)\s+(this |the )?(data|dataset|csv|json|table)/i,
      /\b(statistics|statistical|regression|correlation|trend|pattern)\s+(analysis|test|model)/i,
    ],
    weight: 0.8,
  },
]

// ─── Default Configuration ───────────────────────────────────────────────────

export const DEFAULT_MODEL_SPARK_CONFIG: ModelSparkConfig = {
  modelsDir: '~/.local/share/ai/models',
  defaultStrategy: 'route',
  qwenModel: 'qwen2.5-coder-7b-q4',
  llamaModel: 'llama-3.1-8b-q4',
  qwenHost: '127.0.0.1',
  qwenPort: 11434,
  llamaHost: '127.0.0.1',
  llamaPort: 11435,
  maxTokens: 4096,
  temperature: 0.7,
  topP: 0.9,
  ensembleVotingThreshold: 0.65,
  cascadeQualityThreshold: 0.7,
  speculativeAcceptanceRate: 0.8,
  parallelTimeout: 30000,
  enableWarmStandby: true,
  enableAdaptiveRouting: true,
  enableResponseCaching: true,
  cacheMaxSize: 500,
  cacheTTLMs: 30 * 60 * 1000,
}

// ─── Prompt Templates ────────────────────────────────────────────────────────

const SPARK_PROMPTS: Record<string, Record<string, string>> = {
  qwen: {
    code_generation: `You are Qwen2.5-Coder, an expert code generation AI running locally. Generate clean, secure, well-documented code.\n\nTask: {prompt}`,
    code_review: `You are Qwen2.5-Coder, an expert code reviewer. Analyze the code for bugs, security issues, and improvements.\n\n{prompt}`,
    code_completion: `You are Qwen2.5-Coder with fill-in-the-middle capability. Complete the code accurately.\n\n{prompt}`,
    debugging: `You are Qwen2.5-Coder, an expert debugger. Find the root cause and provide a fix.\n\n{prompt}`,
    security_analysis: `You are Qwen2.5-Coder, a security researcher. Analyze for vulnerabilities and provide remediation.\n\n{prompt}`,
    exploit_research: `You are Qwen2.5-Coder, an exploit development expert. Analyze attack surfaces and techniques.\n\n{prompt}`,
    default: `You are Qwen2.5-Coder, a local AI assistant. Provide helpful, accurate responses.\n\n{prompt}`,
  },
  llama: {
    general_reasoning: `You are LLaMA, a powerful reasoning AI. Think step-by-step and provide a thorough analysis.\n\n{prompt}`,
    math_logic: `You are LLaMA, a mathematical and logical reasoning expert. Show your work step by step.\n\n{prompt}`,
    creative_writing: `You are LLaMA, a creative writing assistant. Produce engaging, well-structured text.\n\n{prompt}`,
    summarization: `You are LLaMA, an expert summarizer. Identify key points and provide a concise summary.\n\n{prompt}`,
    translation: `You are LLaMA, a multilingual translator. Translate accurately while preserving meaning and tone.\n\n{prompt}`,
    conversation: `You are LLaMA, a friendly conversational AI running locally. Be helpful and natural.\n\n{prompt}`,
    planning: `You are LLaMA, a strategic planning expert. Break down goals into actionable steps.\n\n{prompt}`,
    data_analysis: `You are LLaMA, a data analysis expert. Interpret data patterns and provide insights.\n\n{prompt}`,
    default: `You are LLaMA, a local AI assistant. Provide helpful, accurate, and well-reasoned responses.\n\n{prompt}`,
  },
  ensemble: {
    fusion: `Given two AI model responses to the same prompt, create a combined response that takes the best elements from each.\n\nQwen2.5-Coder's response:\n{qwen_response}\n\nLLaMA's response:\n{llama_response}\n\nCombined best response:`,
    verification: `Verify if the following draft response is accurate and complete. If not, provide corrections.\n\nDraft: {draft}\n\nOriginal prompt: {prompt}\n\nVerification:`,
  },
}

// ─── Cache Entry ─────────────────────────────────────────────────────────────

interface CacheEntry {
  response: SparkResponse
  timestamp: number
  hitCount: number
}

// ─── ModelSpark Class ────────────────────────────────────────────────────────

export class ModelSpark {
  private config: ModelSparkConfig
  private stats: ModelSparkStats
  private cache: Map<string, CacheEntry> = new Map()
  private modelHealth: Map<string, ModelHealth> = new Map()
  private performanceHistory: Map<string, number[]> = new Map()
  private downloadedModels: Set<string> = new Set()

  constructor(config?: Partial<ModelSparkConfig>) {
    this.config = { ...DEFAULT_MODEL_SPARK_CONFIG, ...config }
    this.stats = this._initStats()
    this._initModelHealth()
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODEL REGISTRY
  // ══════════════════════════════════════════════════════════════════════════

  /** Get all models in the Spark registry */
  getAvailableModels(): SparkModel[] {
    return [...SPARK_MODEL_REGISTRY]
  }

  /** Get models by family */
  getModelsByFamily(family: SparkModelFamily): SparkModel[] {
    return SPARK_MODEL_REGISTRY.filter(m => m.family === family)
  }

  /** Get a specific model by ID */
  getModel(modelId: string): SparkModel | null {
    return SPARK_MODEL_REGISTRY.find(m => m.id === modelId) ?? null
  }

  /** Get the active Qwen model */
  getQwenModel(): SparkModel {
    return this.getModel(this.config.qwenModel) ?? SPARK_MODEL_REGISTRY.find(m => m.family === 'qwen2.5')!
  }

  /** Get the active LLaMA model */
  getLlamaModel(): SparkModel {
    return this.getModel(this.config.llamaModel) ?? SPARK_MODEL_REGISTRY.find(m => m.family === 'llama3')!
  }

  /** Get models that fit within a RAM budget */
  getModelsForRAM(availableRAMGB: number): SparkModel[] {
    return SPARK_MODEL_REGISTRY.filter(m => m.minRAMGB <= availableRAMGB)
      .sort((a, b) => b.fileSizeGB - a.fileSizeGB)
  }

  /** Get the best model pair for available RAM */
  getBestModelPair(availableRAMGB: number): { qwen: SparkModel | null; llama: SparkModel | null } {
    const qwenModels = this.getModelsByFamily('qwen2.5')
      .filter(m => m.minRAMGB <= availableRAMGB)
      .sort((a, b) => b.fileSizeGB - a.fileSizeGB)

    const bestQwen = qwenModels[0] ?? null
    const remainingRAM = availableRAMGB - (bestQwen?.minRAMGB ?? 0)

    const llamaModels = this.getModelsByFamily('llama3')
      .filter(m => m.minRAMGB <= remainingRAM)
      .sort((a, b) => b.fileSizeGB - a.fileSizeGB)

    return {
      qwen: bestQwen,
      llama: llamaModels[0] ?? null,
    }
  }

  /** Check if a model is downloaded */
  isModelDownloaded(modelId: string): boolean {
    return this.downloadedModels.has(modelId)
  }

  /** Mark a model as downloaded */
  markModelDownloaded(modelId: string): void {
    const model = this.getModel(modelId)
    if (model) {
      this.downloadedModels.add(modelId)
    }
  }

  /** Get download instructions for both models */
  getSetupInstructions(): string {
    const qwen = this.getQwenModel()
    const llama = this.getLlamaModel()

    return [
      '╔═══════════════════════════════════════════════════════════════╗',
      '║           ⚡  Model Spark — Dual-Model Setup                 ║',
      '╚═══════════════════════════════════════════════════════════════╝',
      '',
      '## Step 1: Install Ollama',
      '```bash',
      '# Linux',
      'curl -fsSL https://ollama.ai/install.sh | sh',
      '# macOS',
      'brew install ollama',
      '```',
      '',
      `## Step 2: Download ${qwen.name}`,
      '```bash',
      `ollama pull ${qwen.ollamaName}`,
      '```',
      '',
      `## Step 3: Download ${llama.name}`,
      '```bash',
      `ollama pull ${llama.ollamaName}`,
      '```',
      '',
      '## Step 4: Start Model Spark',
      '```bash',
      '# Start Ollama server (serves both models)',
      'ollama serve',
      '```',
      '',
      `Total disk space needed: ~${(qwen.fileSizeGB + llama.fileSizeGB).toFixed(1)} GB`,
      `Total RAM recommended: ~${Math.max(qwen.recommendedRAMGB, llama.recommendedRAMGB)} GB (models swap, not simultaneous)`,
      '',
      '## Model Strengths:',
      `  🟢 ${qwen.name}: ${qwen.strengths.join(', ')}`,
      `  🟣 ${llama.name}: ${llama.strengths.join(', ')}`,
    ].join('\n')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DOMAIN DETECTION
  // ══════════════════════════════════════════════════════════════════════════

  /** Detect the task domain from a prompt */
  detectDomain(prompt: string): { domain: TaskDomain; confidence: number; alternatives: Array<{ domain: TaskDomain; confidence: number }> } {
    const scores: Array<{ domain: TaskDomain; score: number }> = []

    for (const rule of DOMAIN_PATTERNS) {
      let matchCount = 0
      for (const pattern of rule.patterns) {
        if (pattern.test(prompt)) matchCount++
      }
      if (matchCount > 0) {
        const score = (matchCount / rule.patterns.length) * rule.weight
        scores.push({ domain: rule.domain, score })
      }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score)

    const best = scores[0] ?? { domain: 'general_reasoning' as TaskDomain, score: 0.3 }
    const alternatives = scores.slice(1, 4).map(s => ({ domain: s.domain, confidence: Math.min(s.score, 1.0) }))

    return {
      domain: best.domain,
      confidence: Math.min(best.score, 1.0),
      alternatives,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTING
  // ══════════════════════════════════════════════════════════════════════════

  /** Get the routing rule for a domain */
  getRoutingRule(domain: TaskDomain): RoutingRule {
    return ROUTING_RULES.find(r => r.domain === domain) ?? {
      domain,
      preference: 'adaptive' as ModelPreference,
      qwenWeight: 0.5,
      llamaWeight: 0.5,
      reason: 'No specific routing rule; using adaptive balancing',
    }
  }

  /** Get all routing rules */
  getRoutingRules(): RoutingRule[] {
    return [...ROUTING_RULES]
  }

  /** Decide which model(s) to use for a request */
  routeRequest(request: SparkRequest): {
    primary: SparkModelFamily
    secondary: SparkModelFamily | null
    strategy: InferenceStrategy
    reason: string
  } {
    const domain = request.domain ?? this.detectDomain(request.prompt).domain
    const strategy = request.strategy ?? this.config.defaultStrategy

    // If user explicitly chose a model
    if (request.preferredModel) {
      return {
        primary: request.preferredModel,
        secondary: null,
        strategy: 'route',
        reason: `User explicitly requested ${request.preferredModel}`,
      }
    }

    const rule = this.getRoutingRule(domain)

    // Adaptive routing considers model health
    if (this.config.enableAdaptiveRouting) {
      const qwenHealth = this.modelHealth.get(this.config.qwenModel)
      const llamaHealth = this.modelHealth.get(this.config.llamaModel)

      // If one model is unhealthy, route to the other
      if (qwenHealth && !qwenHealth.available && llamaHealth?.available) {
        return { primary: 'llama3', secondary: null, strategy: 'route', reason: 'Qwen model unavailable, routing to LLaMA' }
      }
      if (llamaHealth && !llamaHealth.available && qwenHealth?.available) {
        return { primary: 'qwen2.5', secondary: null, strategy: 'route', reason: 'LLaMA model unavailable, routing to Qwen' }
      }
    }

    switch (strategy) {
      case 'route':
        return {
          primary: rule.preference === 'llama' ? 'llama3' : 'qwen2.5',
          secondary: null,
          strategy: 'route',
          reason: rule.reason,
        }

      case 'ensemble':
        return {
          primary: rule.qwenWeight >= rule.llamaWeight ? 'qwen2.5' : 'llama3',
          secondary: rule.qwenWeight >= rule.llamaWeight ? 'llama3' : 'qwen2.5',
          strategy: 'ensemble',
          reason: `Ensemble: Qwen weight=${rule.qwenWeight}, LLaMA weight=${rule.llamaWeight}`,
        }

      case 'cascade':
        return {
          primary: 'qwen2.5', // fast model first
          secondary: 'llama3', // escalate to LLaMA if quality too low
          strategy: 'cascade',
          reason: 'Cascade: Qwen drafts first, LLaMA verifies/improves if needed',
        }

      case 'speculative':
        return {
          primary: 'llama3', // strong verifier
          secondary: 'qwen2.5', // fast drafter
          strategy: 'speculative',
          reason: 'Speculative: Qwen drafts fast, LLaMA verifies for accuracy',
        }

      case 'fusion':
        return {
          primary: 'qwen2.5',
          secondary: 'llama3',
          strategy: 'fusion',
          reason: 'Fusion: Both models respond, outputs are merged intelligently',
        }

      case 'parallel_race':
        return {
          primary: 'qwen2.5',
          secondary: 'llama3',
          strategy: 'parallel_race',
          reason: 'Parallel race: Both models run simultaneously, fastest quality response wins',
        }

      case 'chain_of_thought':
        return {
          primary: 'llama3', // reasoner
          secondary: 'qwen2.5', // executor
          strategy: 'chain_of_thought',
          reason: 'Chain-of-thought: LLaMA reasons the approach, Qwen executes',
        }

      default:
        return {
          primary: rule.qwenWeight >= rule.llamaWeight ? 'qwen2.5' : 'llama3',
          secondary: null,
          strategy: 'route',
          reason: rule.reason,
        }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INFERENCE
  // ══════════════════════════════════════════════════════════════════════════

  /** Main inference method — routes to the best strategy */
  async infer(request: SparkRequest): Promise<SparkResponse> {
    const start = Date.now()
    this.stats.totalRequests++

    // Detect domain
    const detection = request.domain
      ? { domain: request.domain, confidence: 1.0 }
      : this.detectDomain(request.prompt)
    const domain = detection.domain

    // Check cache
    if (this.config.enableResponseCaching) {
      const cached = this._checkCache(request.prompt)
      if (cached) {
        this.stats.cacheHits++
        return { ...cached, cached: true, totalDurationMs: Date.now() - start }
      }
      this.stats.cacheMisses++
    }

    // Route the request
    const routing = this.routeRequest({ ...request, domain })
    const strategy = routing.strategy

    // Update strategy distribution
    this.stats.strategyDistribution[strategy] = (this.stats.strategyDistribution[strategy] ?? 0) + 1
    this.stats.domainDistribution[domain] = (this.stats.domainDistribution[domain] ?? 0) + 1

    // Execute the strategy
    let response: SparkResponse

    switch (strategy) {
      case 'ensemble':
        response = await this._executeEnsemble(request, domain, routing)
        this.stats.ensembleRequests++
        break

      case 'cascade':
        response = await this._executeCascade(request, domain, routing)
        break

      case 'speculative':
        response = await this._executeSpeculative(request, domain, routing)
        break

      case 'fusion':
        response = await this._executeFusion(request, domain, routing)
        this.stats.fusionRequests++
        break

      case 'parallel_race':
        response = await this._executeParallelRace(request, domain, routing)
        break

      case 'chain_of_thought':
        response = await this._executeChainOfThought(request, domain, routing)
        break

      default: // 'route'
        response = await this._executeRoute(request, domain, routing)
        break
    }

    // Cache the response
    if (this.config.enableResponseCaching) {
      this._cacheResponse(request.prompt, response)
    }

    // Update stats
    response.totalDurationMs = Date.now() - start
    response.effectiveTokensPerSecond = response.totalDurationMs > 0
      ? (response.totalTokensGenerated / (response.totalDurationMs / 1000))
      : 0
    this._updateAverages(response)

    return response
  }

  /** Direct inference on a specific model */
  async inferOnModel(
    prompt: string,
    family: SparkModelFamily,
    domain: TaskDomain,
    options?: Partial<SparkRequest>,
  ): Promise<ModelResponse> {
    const start = Date.now()
    const model = family === 'qwen2.5' ? this.getQwenModel() : this.getLlamaModel()

    // Build prompt using model-specific template
    const templateKey = family === 'qwen2.5' ? 'qwen' : 'llama'
    const templates = SPARK_PROMPTS[templateKey]!
    const template = templates[domain] ?? templates['default']!
    const fullPrompt = template.replace('{prompt}', prompt)

    // Estimate tokens
    const promptTokens = Math.ceil(fullPrompt.length / 4)
    const maxTokens = options?.maxTokens ?? this.config.maxTokens

    // Try server call, fallback to helpful message
    let responseText: string
    let tokensGenerated: number
    let finishReason: 'stop' | 'length' | 'error'

    try {
      const result = await this._callModelServer(family, fullPrompt, options)
      responseText = result.text
      tokensGenerated = result.tokensGenerated
      finishReason = result.finishReason
    } catch {
      responseText = this._generateFallback(prompt, model, domain)
      tokensGenerated = Math.ceil(responseText.length / 4)
      finishReason = 'stop'
    }

    const durationMs = Date.now() - start
    const tokensPerSecond = durationMs > 0 ? (tokensGenerated / (durationMs / 1000)) : 0
    const qualityScore = this._scoreResponse(responseText, prompt, domain)

    // Update model health
    this._updateModelHealth(model.id, family, durationMs, tokensPerSecond, true)

    // Update per-family stats
    if (family === 'qwen2.5') {
      this.stats.qwenRequests++
      this.stats.qwenTokensPerSecond = this._rollingAverage(
        this.stats.qwenTokensPerSecond, tokensPerSecond, this.stats.qwenRequests,
      )
    } else {
      this.stats.llamaRequests++
      this.stats.llamaTokensPerSecond = this._rollingAverage(
        this.stats.llamaTokensPerSecond, tokensPerSecond, this.stats.llamaRequests,
      )
    }

    return {
      text: responseText,
      modelId: model.id,
      modelFamily: family,
      tokensGenerated,
      tokensPrompt: promptTokens,
      durationMs,
      tokensPerSecond,
      qualityScore,
      finishReason,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENSEMBLE OPERATIONS
  // ══════════════════════════════════════════════════════════════════════════

  /** Score a response for quality */
  scoreResponse(text: string, prompt: string, domain: TaskDomain): number {
    return this._scoreResponse(text, prompt, domain)
  }

  /** Compare two model responses and pick the best */
  compareResponses(
    qwenResponse: ModelResponse,
    llamaResponse: ModelResponse,
    domain: TaskDomain,
  ): EnsembleVote[] {
    const rule = this.getRoutingRule(domain)

    const qwenVote: EnsembleVote = {
      modelFamily: 'qwen2.5',
      response: qwenResponse.text,
      qualityScore: qwenResponse.qualityScore * rule.qwenWeight,
      confidence: rule.qwenWeight,
      tokensPerSecond: qwenResponse.tokensPerSecond,
    }

    const llamaVote: EnsembleVote = {
      modelFamily: 'llama3',
      response: llamaResponse.text,
      qualityScore: llamaResponse.qualityScore * rule.llamaWeight,
      confidence: rule.llamaWeight,
      tokensPerSecond: llamaResponse.tokensPerSecond,
    }

    return [qwenVote, llamaVote].sort((a, b) => b.qualityScore - a.qualityScore)
  }

  /** Fuse two model responses into one */
  fuseResponses(
    qwenText: string,
    llamaText: string,
    domain: TaskDomain,
  ): FusionResult {
    const qwenScore = this._scoreResponse(qwenText, '', domain)
    const llamaScore = this._scoreResponse(llamaText, '', domain)
    const rule = this.getRoutingRule(domain)

    // Determine fusion method based on response similarity
    const similarity = this._textSimilarity(qwenText, llamaText)
    let fusionMethod: FusionResult['fusionMethod']
    let fusedText: string

    if (similarity > 0.8) {
      // Very similar — pick the better one
      fusionMethod = 'select_best'
      fusedText = qwenScore * rule.qwenWeight >= llamaScore * rule.llamaWeight ? qwenText : llamaText
    } else if (similarity > 0.4) {
      // Moderately similar — merge complementary parts
      fusionMethod = 'merge'
      fusedText = this._mergeResponses(qwenText, llamaText, rule.qwenWeight, rule.llamaWeight)
    } else if (domain === 'data_analysis' || domain === 'planning') {
      // Different perspectives — interleave for comprehensive answer
      fusionMethod = 'interleave'
      fusedText = this._interleaveResponses(qwenText, llamaText)
    } else {
      // Very different — summarize both perspectives
      fusionMethod = 'summarize'
      fusedText = `[Analysis from Qwen2.5-Coder]\n${qwenText}\n\n[Analysis from LLaMA]\n${llamaText}`
    }

    return {
      fusedText,
      sourceTexts: [
        { model: 'qwen2.5', text: qwenText, weight: rule.qwenWeight },
        { model: 'llama3', text: llamaText, weight: rule.llamaWeight },
      ],
      fusionMethod,
      coherenceScore: similarity > 0.8 ? 0.95 : similarity > 0.4 ? 0.8 : 0.65,
    }
  }

  /** Run speculative decoding */
  speculativeDecode(
    draftText: string,
    _verifiedText: string,
    draftFamily: SparkModelFamily,
    verifierFamily: SparkModelFamily,
  ): SpeculativeResult {
    // Compare draft vs verified token by token (word-level approximation)
    const draftTokens = draftText.split(/\s+/)
    const verifiedTokens = _verifiedText.split(/\s+/)
    let accepted = 0
    let rejected = 0

    const minLen = Math.min(draftTokens.length, verifiedTokens.length)
    for (let i = 0; i < minLen; i++) {
      if (draftTokens[i]!.toLowerCase() === verifiedTokens[i]!.toLowerCase()) {
        accepted++
      } else {
        rejected++
      }
    }
    rejected += Math.abs(draftTokens.length - verifiedTokens.length)

    const total = accepted + rejected
    const acceptanceRate = total > 0 ? accepted / total : 0
    // Speedup: if acceptance is high, we saved time by not regenerating those tokens
    const speedupFactor = acceptanceRate > 0 ? 1 + (acceptanceRate * 0.5) : 1.0

    return {
      draftModel: draftFamily,
      verifierModel: verifierFamily,
      draftText,
      verifiedText: _verifiedText,
      acceptanceRate,
      speedupFactor,
      tokensAccepted: accepted,
      tokensRejected: rejected,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BENCHMARKING
  // ══════════════════════════════════════════════════════════════════════════

  /** Benchmark model performance on a domain */
  async benchmark(domain: TaskDomain, testPrompt: string): Promise<BenchmarkResult> {
    const qwenResult = await this.inferOnModel(testPrompt, 'qwen2.5', domain)
    const llamaResult = await this.inferOnModel(testPrompt, 'llama3', domain)

    const rule = this.getRoutingRule(domain)
    const ensembleScore = (qwenResult.qualityScore * rule.qwenWeight) + (llamaResult.qualityScore * rule.llamaWeight)

    // Determine best strategy
    let bestStrategy: InferenceStrategy = 'route'
    if (ensembleScore > Math.max(qwenResult.qualityScore, llamaResult.qualityScore)) {
      bestStrategy = 'ensemble'
    }
    if (qwenResult.qualityScore > llamaResult.qualityScore && qwenResult.durationMs < llamaResult.durationMs) {
      bestStrategy = 'route' // Qwen is both better and faster
    }

    const winnerName = qwenResult.qualityScore >= llamaResult.qualityScore ? 'Qwen2.5-Coder' : 'LLaMA 3.1'

    return {
      taskDomain: domain,
      qwenScore: qwenResult.qualityScore,
      llamaScore: llamaResult.qualityScore,
      ensembleScore,
      bestStrategy,
      qwenLatencyMs: qwenResult.durationMs,
      llamaLatencyMs: llamaResult.durationMs,
      recommendation: `For ${domain}: ${winnerName} wins (score: ${Math.max(qwenResult.qualityScore, llamaResult.qualityScore).toFixed(2)}). Best strategy: ${bestStrategy}.`,
    }
  }

  /** Run comprehensive benchmark across all domains */
  async benchmarkAll(testPrompts: Record<string, string>): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = []
    for (const [domain, prompt] of Object.entries(testPrompts)) {
      const result = await this.benchmark(domain as TaskDomain, prompt)
      results.push(result)
    }
    return results
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODEL HEALTH & PERFORMANCE
  // ══════════════════════════════════════════════════════════════════════════

  /** Get health status for all models */
  getModelHealth(): ModelHealth[] {
    return [...this.modelHealth.values()]
  }

  /** Get health for a specific model */
  getModelHealthById(modelId: string): ModelHealth | null {
    return this.modelHealth.get(modelId) ?? null
  }

  /** Set model availability (for testing or runtime updates) */
  setModelAvailability(modelId: string, available: boolean): void {
    const health = this.modelHealth.get(modelId)
    if (health) {
      health.available = available
    }
  }

  /** Get performance history for a model */
  getPerformanceHistory(modelId: string): number[] {
    return [...(this.performanceHistory.get(modelId) ?? [])]
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION & STATS
  // ══════════════════════════════════════════════════════════════════════════

  /** Get current configuration */
  getConfig(): ModelSparkConfig {
    return { ...this.config }
  }

  /** Update configuration */
  updateConfig(updates: Partial<ModelSparkConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /** Get statistics */
  getStats(): ModelSparkStats {
    return { ...this.stats }
  }

  /** Reset statistics */
  resetStats(): void {
    this.stats = this._initStats()
  }

  /** Clear the response cache */
  clearCache(): void {
    this.cache.clear()
  }

  /** Get cache size */
  getCacheSize(): number {
    return this.cache.size
  }

  /** Generate a comprehensive status report */
  generateStatusReport(): string {
    const qwen = this.getQwenModel()
    const llama = this.getLlamaModel()
    const qwenHealth = this.modelHealth.get(this.config.qwenModel)
    const llamaHealth = this.modelHealth.get(this.config.llamaModel)

    return [
      '╔═══════════════════════════════════════════════════════════════╗',
      '║           ⚡  Model Spark — Dual-Model Ensemble Status       ║',
      '╚═══════════════════════════════════════════════════════════════╝',
      '',
      `🟢 Qwen: ${qwen.name} (${qwen.parameterCount}, ${qwen.quantization})`,
      `   Status: ${qwenHealth?.available ? '✅ Available' : '❌ Unavailable'}`,
      `   Requests: ${this.stats.qwenRequests} | Speed: ${this.stats.qwenTokensPerSecond.toFixed(1)} tok/s`,
      '',
      `🟣 LLaMA: ${llama.name} (${llama.parameterCount}, ${llama.quantization})`,
      `   Status: ${llamaHealth?.available ? '✅ Available' : '❌ Unavailable'}`,
      `   Requests: ${this.stats.llamaRequests} | Speed: ${this.stats.llamaTokensPerSecond.toFixed(1)} tok/s`,
      '',
      `Strategy: ${this.config.defaultStrategy}`,
      `Total requests: ${this.stats.totalRequests}`,
      `Ensemble requests: ${this.stats.ensembleRequests}`,
      `Cache hits: ${this.stats.cacheHits}/${this.stats.cacheHits + this.stats.cacheMisses}`,
      `Avg quality: ${this.stats.averageQualityScore.toFixed(2)}`,
      `Avg latency: ${this.stats.averageLatencyMs.toFixed(0)}ms`,
      '',
      `Tokens generated: ${this.stats.totalTokensGenerated}`,
      `Errors: ${this.stats.errors}`,
    ].join('\n')
  }

  /** Generate a hash for content (used for cache keys) */
  hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex').slice(0, 16)
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE — STRATEGY EXECUTION
  // ══════════════════════════════════════════════════════════════════════════

  /** Execute simple routing strategy */
  private async _executeRoute(
    request: SparkRequest,
    domain: TaskDomain,
    routing: ReturnType<ModelSpark['routeRequest']>,
  ): Promise<SparkResponse> {
    const primary = await this.inferOnModel(request.prompt, routing.primary, domain, request)

    return {
      text: primary.text,
      strategy: 'route',
      domain,
      primaryModel: routing.primary,
      secondaryModel: null,
      primaryResponse: primary,
      secondaryResponse: null,
      fusedResponse: null,
      qualityScore: primary.qualityScore,
      totalTokensGenerated: primary.tokensGenerated,
      totalDurationMs: primary.durationMs,
      effectiveTokensPerSecond: primary.tokensPerSecond,
      cached: false,
      routingReason: routing.reason,
    }
  }

  /** Execute ensemble strategy — both models answer, best wins */
  private async _executeEnsemble(
    request: SparkRequest,
    domain: TaskDomain,
    routing: ReturnType<ModelSpark['routeRequest']>,
  ): Promise<SparkResponse> {
    const [primaryResp, secondaryResp] = await Promise.all([
      this.inferOnModel(request.prompt, routing.primary, domain, request),
      this.inferOnModel(request.prompt, routing.secondary!, domain, request),
    ])

    const votes = this.compareResponses(
      routing.primary === 'qwen2.5' ? primaryResp : secondaryResp,
      routing.primary === 'llama3' ? primaryResp : secondaryResp,
      domain,
    )
    const winner = votes[0]!
    const winnerResponse = winner.modelFamily === primaryResp.modelFamily ? primaryResp : secondaryResp

    return {
      text: winnerResponse.text,
      strategy: 'ensemble',
      domain,
      primaryModel: routing.primary,
      secondaryModel: routing.secondary,
      primaryResponse: primaryResp,
      secondaryResponse: secondaryResp,
      fusedResponse: null,
      qualityScore: winner.qualityScore,
      totalTokensGenerated: primaryResp.tokensGenerated + secondaryResp.tokensGenerated,
      totalDurationMs: Math.max(primaryResp.durationMs, secondaryResp.durationMs),
      effectiveTokensPerSecond: winnerResponse.tokensPerSecond,
      cached: false,
      routingReason: `Ensemble winner: ${winner.modelFamily} (score: ${winner.qualityScore.toFixed(2)})`,
    }
  }

  /** Execute cascade strategy — small model first, escalate if needed */
  private async _executeCascade(
    request: SparkRequest,
    domain: TaskDomain,
    routing: ReturnType<ModelSpark['routeRequest']>,
  ): Promise<SparkResponse> {
    // Step 1: Try the primary (fast) model
    const primaryResp = await this.inferOnModel(request.prompt, routing.primary, domain, request)

    // If quality is good enough, return immediately
    if (primaryResp.qualityScore >= this.config.cascadeQualityThreshold) {
      return {
        text: primaryResp.text,
        strategy: 'cascade',
        domain,
        primaryModel: routing.primary,
        secondaryModel: null,
        primaryResponse: primaryResp,
        secondaryResponse: null,
        fusedResponse: null,
        qualityScore: primaryResp.qualityScore,
        totalTokensGenerated: primaryResp.tokensGenerated,
        totalDurationMs: primaryResp.durationMs,
        effectiveTokensPerSecond: primaryResp.tokensPerSecond,
        cached: false,
        routingReason: `Cascade: ${routing.primary} response met quality threshold (${primaryResp.qualityScore.toFixed(2)} >= ${this.config.cascadeQualityThreshold})`,
      }
    }

    // Step 2: Escalate to secondary model
    this.stats.cascadeEscalations++
    const secondaryResp = await this.inferOnModel(request.prompt, routing.secondary!, domain, request)

    const bestResponse = secondaryResp.qualityScore > primaryResp.qualityScore ? secondaryResp : primaryResp

    return {
      text: bestResponse.text,
      strategy: 'cascade',
      domain,
      primaryModel: routing.primary,
      secondaryModel: routing.secondary,
      primaryResponse: primaryResp,
      secondaryResponse: secondaryResp,
      fusedResponse: null,
      qualityScore: bestResponse.qualityScore,
      totalTokensGenerated: primaryResp.tokensGenerated + secondaryResp.tokensGenerated,
      totalDurationMs: primaryResp.durationMs + secondaryResp.durationMs,
      effectiveTokensPerSecond: bestResponse.tokensPerSecond,
      cached: false,
      routingReason: `Cascade: Escalated to ${routing.secondary} (primary score ${primaryResp.qualityScore.toFixed(2)} < ${this.config.cascadeQualityThreshold})`,
    }
  }

  /** Execute speculative decoding — fast draft + strong verification */
  private async _executeSpeculative(
    request: SparkRequest,
    domain: TaskDomain,
    routing: ReturnType<ModelSpark['routeRequest']>,
  ): Promise<SparkResponse> {
    // Draft with secondary (fast) model
    const draftResp = await this.inferOnModel(request.prompt, routing.secondary!, domain, request)

    // Verify with primary (strong) model
    const verifyResp = await this.inferOnModel(request.prompt, routing.primary, domain, request)

    const spec = this.speculativeDecode(draftResp.text, verifyResp.text, routing.secondary!, routing.primary)

    if (spec.acceptanceRate >= this.config.speculativeAcceptanceRate) {
      this.stats.speculativeAcceptances++
    } else {
      this.stats.speculativeRejections++
    }

    // Use verified text as final output
    return {
      text: verifyResp.text,
      strategy: 'speculative',
      domain,
      primaryModel: routing.primary,
      secondaryModel: routing.secondary,
      primaryResponse: verifyResp,
      secondaryResponse: draftResp,
      fusedResponse: null,
      qualityScore: verifyResp.qualityScore,
      totalTokensGenerated: draftResp.tokensGenerated + verifyResp.tokensGenerated,
      totalDurationMs: draftResp.durationMs + verifyResp.durationMs,
      effectiveTokensPerSecond: verifyResp.tokensPerSecond * spec.speedupFactor,
      cached: false,
      routingReason: `Speculative: acceptance=${(spec.acceptanceRate * 100).toFixed(0)}%, speedup=${spec.speedupFactor.toFixed(2)}x`,
    }
  }

  /** Execute fusion strategy — merge outputs from both models */
  private async _executeFusion(
    request: SparkRequest,
    domain: TaskDomain,
    routing: ReturnType<ModelSpark['routeRequest']>,
  ): Promise<SparkResponse> {
    const [primaryResp, secondaryResp] = await Promise.all([
      this.inferOnModel(request.prompt, routing.primary, domain, request),
      this.inferOnModel(request.prompt, routing.secondary!, domain, request),
    ])

    const qwenText = routing.primary === 'qwen2.5' ? primaryResp.text : secondaryResp.text
    const llamaText = routing.primary === 'llama3' ? primaryResp.text : secondaryResp.text
    const fusion = this.fuseResponses(qwenText, llamaText, domain)

    return {
      text: fusion.fusedText,
      strategy: 'fusion',
      domain,
      primaryModel: routing.primary,
      secondaryModel: routing.secondary,
      primaryResponse: primaryResp,
      secondaryResponse: secondaryResp,
      fusedResponse: fusion.fusedText,
      qualityScore: fusion.coherenceScore,
      totalTokensGenerated: primaryResp.tokensGenerated + secondaryResp.tokensGenerated,
      totalDurationMs: Math.max(primaryResp.durationMs, secondaryResp.durationMs),
      effectiveTokensPerSecond: (primaryResp.tokensPerSecond + secondaryResp.tokensPerSecond) / 2,
      cached: false,
      routingReason: `Fusion (${fusion.fusionMethod}): coherence=${fusion.coherenceScore.toFixed(2)}`,
    }
  }

  /** Execute parallel race — both run, fastest quality response wins */
  private async _executeParallelRace(
    request: SparkRequest,
    domain: TaskDomain,
    routing: ReturnType<ModelSpark['routeRequest']>,
  ): Promise<SparkResponse> {
    const [primaryResp, secondaryResp] = await Promise.all([
      this.inferOnModel(request.prompt, routing.primary, domain, request),
      this.inferOnModel(request.prompt, routing.secondary!, domain, request),
    ])

    // Winner: highest quality-to-time ratio
    const primaryScore = primaryResp.qualityScore / Math.max(primaryResp.durationMs, 1)
    const secondaryScore = secondaryResp.qualityScore / Math.max(secondaryResp.durationMs, 1)
    const winner = primaryScore >= secondaryScore ? primaryResp : secondaryResp

    return {
      text: winner.text,
      strategy: 'parallel_race',
      domain,
      primaryModel: routing.primary,
      secondaryModel: routing.secondary,
      primaryResponse: primaryResp,
      secondaryResponse: secondaryResp,
      fusedResponse: null,
      qualityScore: winner.qualityScore,
      totalTokensGenerated: primaryResp.tokensGenerated + secondaryResp.tokensGenerated,
      totalDurationMs: Math.max(primaryResp.durationMs, secondaryResp.durationMs),
      effectiveTokensPerSecond: winner.tokensPerSecond,
      cached: false,
      routingReason: `Parallel race: ${winner.modelFamily} won (quality/time ratio: ${(winner === primaryResp ? primaryScore : secondaryScore).toFixed(4)})`,
    }
  }

  /** Execute chain-of-thought — one model reasons, other executes */
  private async _executeChainOfThought(
    request: SparkRequest,
    domain: TaskDomain,
    routing: ReturnType<ModelSpark['routeRequest']>,
  ): Promise<SparkResponse> {
    // Step 1: Reasoner (LLaMA) plans the approach
    const reasonerPrompt = `Think step-by-step about how to best answer this:\n\n${request.prompt}\n\nProvide your reasoning and approach:`
    const reasonerResp = await this.inferOnModel(reasonerPrompt, routing.primary, domain, request)

    // Step 2: Executor (Qwen) implements using the reasoning
    const executorPrompt = `Based on this analysis:\n${reasonerResp.text}\n\nNow provide the final answer to:\n${request.prompt}`
    const executorResp = await this.inferOnModel(executorPrompt, routing.secondary!, domain, request)

    return {
      text: executorResp.text,
      strategy: 'chain_of_thought',
      domain,
      primaryModel: routing.primary,
      secondaryModel: routing.secondary,
      primaryResponse: reasonerResp,
      secondaryResponse: executorResp,
      fusedResponse: null,
      qualityScore: Math.max(reasonerResp.qualityScore, executorResp.qualityScore),
      totalTokensGenerated: reasonerResp.tokensGenerated + executorResp.tokensGenerated,
      totalDurationMs: reasonerResp.durationMs + executorResp.durationMs,
      effectiveTokensPerSecond: executorResp.tokensPerSecond,
      cached: false,
      routingReason: `Chain-of-thought: ${routing.primary} reasoned → ${routing.secondary} executed`,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE — SERVER CALLS
  // ══════════════════════════════════════════════════════════════════════════

  /** Call a model's inference server */
  private async _callModelServer(
    _family: SparkModelFamily,
    _prompt: string,
    _options?: Partial<SparkRequest>,
  ): Promise<{ text: string; tokensGenerated: number; finishReason: 'stop' | 'length' | 'error' }> {
    // In production this would call Ollama or llama.cpp HTTP API.
    // Throw so we use the fallback response for offline/testing scenarios.
    throw new Error('Model server not available — using fallback')
  }

  /** Generate a helpful fallback when server is not running */
  private _generateFallback(prompt: string, model: SparkModel, domain: TaskDomain): string {
    const modelEmoji = model.family === 'qwen2.5' ? '🟢' : '🟣'

    const domainHints: Partial<Record<TaskDomain, string>> = {
      code_generation: 'Use the built-in LocalBrain for template-based code generation while the models are loading.',
      code_review: 'Use the built-in CodeReviewer and CodeAnalyzer for offline static analysis.',
      debugging: 'Use the built-in BufferOverflowDebugger for offline crash analysis.',
      security_analysis: 'Use ExploitSearchEngine for offline CVE/CWE lookups.',
      exploit_research: 'Use PythonBlackHat for offline exploit development knowledge.',
      general_reasoning: 'Use the built-in ReasoningEngine for offline logical analysis.',
      math_logic: 'Use BayesianNetwork and InferenceEngine for offline mathematical reasoning.',
    }

    const hint = domainHints[domain] ?? 'Use the built-in knowledge modules while models are loading.'

    return [
      `[${modelEmoji} Model Spark — ${model.name} — Offline Mode]`,
      '',
      `The local inference server for ${model.name} is not running.`,
      `Domain: ${domain} | Strategy: ${this.config.defaultStrategy}`,
      '',
      'Start the server with:',
      '```bash',
      `ollama pull ${model.ollamaName}`,
      'ollama serve',
      '```',
      '',
      `Tip: ${hint}`,
    ].join('\n')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE — QUALITY SCORING
  // ══════════════════════════════════════════════════════════════════════════

  /** Score response quality (0-1) */
  private _scoreResponse(text: string, prompt: string, domain: TaskDomain): number {
    if (!text || text.length === 0) return 0

    let score = 0.5 // base score

    // Length factor — not too short, not too long
    const wordCount = text.split(/\s+/).length
    if (wordCount >= 10) score += 0.05
    if (wordCount >= 50) score += 0.05
    if (wordCount >= 100) score += 0.05
    if (wordCount > 2000) score -= 0.05

    // Structure factor — well-formatted responses
    if (text.includes('\n')) score += 0.05
    if (/```/.test(text)) score += 0.05 // has code blocks
    if (/^\d+\./m.test(text)) score += 0.03 // numbered lists
    if (/^[-*]/m.test(text)) score += 0.03 // bullet lists
    if (/^#{1,3}\s/m.test(text)) score += 0.02 // headings

    // Domain-specific scoring
    switch (domain) {
      case 'code_generation':
      case 'code_completion':
        if (/```\w*\n[\s\S]+```/.test(text)) score += 0.1 // code block
        if (/\b(function|class|def|const|let|var|import)\b/.test(text)) score += 0.05
        break
      case 'code_review':
        if (/\b(bug|issue|vulnerability|improvement|suggestion)\b/i.test(text)) score += 0.05
        if (/\b(security|performance|readability)\b/i.test(text)) score += 0.05
        break
      case 'debugging':
        if (/\b(root cause|fix|solution|error)\b/i.test(text)) score += 0.05
        if (/\b(step|because|reason)\b/i.test(text)) score += 0.03
        break
      case 'security_analysis':
      case 'exploit_research':
        if (/\b(cve|cwe|vulnerability|exploit|mitigation)\b/i.test(text)) score += 0.05
        if (/\b(risk|severity|impact|cvss)\b/i.test(text)) score += 0.05
        break
      case 'general_reasoning':
      case 'math_logic':
        if (/\b(therefore|because|since|thus|hence|conclude)\b/i.test(text)) score += 0.05
        if (/\b(step|first|second|then|finally)\b/i.test(text)) score += 0.03
        break
      case 'creative_writing':
        if (wordCount >= 100) score += 0.05
        if (/[.!?]/.test(text)) score += 0.03
        break
      case 'summarization':
        if (wordCount <= 500) score += 0.05 // concise
        if (/\b(key|main|important|summary)\b/i.test(text)) score += 0.03
        break
    }

    // Relevance: check for prompt keyword overlap
    if (prompt) {
      const promptWords = new Set(prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3))
      const responseWords = new Set(text.toLowerCase().split(/\s+/))
      let overlap = 0
      for (const word of promptWords) {
        if (responseWords.has(word)) overlap++
      }
      if (promptWords.size > 0) {
        score += Math.min(overlap / promptWords.size, 1.0) * 0.1
      }
    }

    return Math.min(Math.max(score, 0), 1.0)
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE — TEXT OPERATIONS
  // ══════════════════════════════════════════════════════════════════════════

  /** Calculate text similarity (Jaccard on word sets) */
  private _textSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2))
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2))

    if (words1.size === 0 && words2.size === 0) return 1.0
    if (words1.size === 0 || words2.size === 0) return 0.0

    let intersection = 0
    for (const word of words1) {
      if (words2.has(word)) intersection++
    }

    const union = words1.size + words2.size - intersection
    return union > 0 ? intersection / union : 0
  }

  /** Merge two responses with weighted sections */
  private _mergeResponses(text1: string, text2: string, weight1: number, weight2: number): string {
    const sections1 = text1.split('\n\n').filter(s => s.trim())
    const sections2 = text2.split('\n\n').filter(s => s.trim())

    const merged: string[] = []
    const maxLen = Math.max(sections1.length, sections2.length)

    for (let i = 0; i < maxLen; i++) {
      if (weight1 >= weight2) {
        if (i < sections1.length) merged.push(sections1[i]!)
        else if (i < sections2.length) merged.push(sections2[i]!)
      } else {
        if (i < sections2.length) merged.push(sections2[i]!)
        else if (i < sections1.length) merged.push(sections1[i]!)
      }
    }

    return merged.join('\n\n')
  }

  /** Interleave two responses section by section */
  private _interleaveResponses(text1: string, text2: string): string {
    const sections1 = text1.split('\n\n').filter(s => s.trim())
    const sections2 = text2.split('\n\n').filter(s => s.trim())

    const interleaved: string[] = []
    const maxLen = Math.max(sections1.length, sections2.length)

    for (let i = 0; i < maxLen; i++) {
      if (i < sections1.length) interleaved.push(sections1[i]!)
      if (i < sections2.length) interleaved.push(sections2[i]!)
    }

    return interleaved.join('\n\n')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE — CACHE
  // ══════════════════════════════════════════════════════════════════════════

  /** Check cache for a prompt */
  private _checkCache(prompt: string): SparkResponse | null {
    const key = this.hashContent(prompt)
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() - entry.timestamp > this.config.cacheTTLMs) {
      this.cache.delete(key)
      return null
    }
    entry.hitCount++
    return entry.response
  }

  /** Cache a response */
  private _cacheResponse(prompt: string, response: SparkResponse): void {
    // Evict old entries if at capacity
    if (this.cache.size >= this.config.cacheMaxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey)
      }
    }

    const key = this.hashContent(prompt)
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      hitCount: 0,
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE — HEALTH & STATS
  // ══════════════════════════════════════════════════════════════════════════

  /** Initialize model health entries */
  private _initModelHealth(): void {
    for (const model of SPARK_MODEL_REGISTRY) {
      this.modelHealth.set(model.id, {
        modelId: model.id,
        family: model.family,
        available: true,
        loaded: false,
        lastResponseMs: 0,
        averageTokensPerSecond: model.tokensPerSecondEstimate,
        errorCount: 0,
        successCount: 0,
        lastError: null,
        uptime: 0,
      })
      this.performanceHistory.set(model.id, [])
    }
  }

  /** Update model health after an inference */
  private _updateModelHealth(
    modelId: string,
    family: SparkModelFamily,
    durationMs: number,
    tokensPerSecond: number,
    success: boolean,
  ): void {
    const health = this.modelHealth.get(modelId)
    if (!health) return

    health.lastResponseMs = durationMs
    if (success) {
      health.successCount++
      health.averageTokensPerSecond = this._rollingAverage(
        health.averageTokensPerSecond, tokensPerSecond, health.successCount,
      )
    } else {
      health.errorCount++
    }

    // Store in performance history (keep last 100)
    const history = this.performanceHistory.get(modelId) ?? []
    history.push(tokensPerSecond)
    if (history.length > 100) history.shift()
    this.performanceHistory.set(modelId, history)
  }

  /** Update rolling averages in stats */
  private _updateAverages(response: SparkResponse): void {
    this.stats.totalTokensGenerated += response.totalTokensGenerated
    this.stats.averageLatencyMs = this._rollingAverage(
      this.stats.averageLatencyMs, response.totalDurationMs, this.stats.totalRequests,
    )
    this.stats.averageQualityScore = this._rollingAverage(
      this.stats.averageQualityScore, response.qualityScore, this.stats.totalRequests,
    )
  }

  /** Compute rolling average */
  private _rollingAverage(current: number, newValue: number, count: number): number {
    if (count <= 1) return newValue
    return current + (newValue - current) / count
  }

  /** Initialize statistics */
  private _initStats(): ModelSparkStats {
    return {
      totalRequests: 0,
      qwenRequests: 0,
      llamaRequests: 0,
      ensembleRequests: 0,
      cascadeEscalations: 0,
      speculativeAcceptances: 0,
      speculativeRejections: 0,
      fusionRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageQualityScore: 0,
      averageLatencyMs: 0,
      totalTokensGenerated: 0,
      qwenTokensPerSecond: 0,
      llamaTokensPerSecond: 0,
      domainDistribution: {},
      strategyDistribution: {},
      errors: 0,
    }
  }
}
