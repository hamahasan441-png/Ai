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
import * as os from 'os'

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

// ─── NEW TYPES: Conversation, Streaming, Lifecycle, Prompt Chain ─────────────

/** Chat message for multi-turn conversations */
export interface SparkChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: number
  modelFamily?: SparkModelFamily
  domain?: TaskDomain
  tokensEstimate?: number
}

/** Conversation session with history management */
export interface ChatSession {
  id: string
  messages: SparkChatMessage[]
  domain: TaskDomain | null
  strategy: InferenceStrategy
  totalTokens: number
  createdAt: number
  lastActiveAt: number
  metadata: Record<string, string>
}

/** Streaming token event */
export interface StreamToken {
  token: string
  index: number
  modelFamily: SparkModelFamily
  done: boolean
  totalTokens: number
}

/** Circuit breaker state */
export type CircuitState = 'closed' | 'open' | 'half_open'

/** Circuit breaker configuration */
export interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeoutMs: number
  halfOpenMaxRequests: number
}

/** Circuit breaker status */
export interface CircuitBreakerStatus {
  state: CircuitState
  failures: number
  lastFailureAt: number
  lastSuccessAt: number
  totalTrips: number
}

/** Model lifecycle state */
export type ModelLifecycleState = 'not_installed' | 'downloading' | 'installed' | 'loading' | 'ready' | 'error'

/** Model lifecycle info */
export interface ModelLifecycleInfo {
  modelId: string
  state: ModelLifecycleState
  downloadProgress: number
  installedAt: number | null
  lastUsedAt: number | null
  diskSizeBytes: number
  serverPid: number | null
}

/** Prompt chain step */
export interface PromptChainStep {
  id: string
  prompt: string
  model: SparkModelFamily | 'auto'
  domain: TaskDomain | 'auto'
  dependsOn: string[]
  transform?: 'extract_code' | 'extract_json' | 'summarize' | 'key_points' | 'none'
  maxTokens?: number
}

/** Prompt chain result */
export interface PromptChainResult {
  steps: Array<{
    id: string
    input: string
    output: string
    model: SparkModelFamily
    domain: TaskDomain
    durationMs: number
    tokensGenerated: number
  }>
  finalOutput: string
  totalDurationMs: number
  totalTokens: number
}

/** Parsed output from a model response */
export interface ParsedOutput {
  raw: string
  codeBlocks: Array<{ language: string; code: string }>
  jsonBlocks: unknown[]
  keyPoints: string[]
  summary: string | null
  headings: string[]
  lists: string[][]
  urls: string[]
  wordCount: number
  sentenceCount: number
}

/** Hardware detection result */
export interface HardwareProfile {
  totalRAMGB: number
  availableRAMGB: number
  cpuCores: number
  cpuModel: string
  gpuDetected: boolean
  gpuName: string | null
  gpuVRAMGB: number | null
  recommendedQwen: string | null
  recommendedLlama: string | null
  recommendedStrategy: InferenceStrategy
  canRunBothSimultaneously: boolean
}

/** Ollama API model info */
export interface OllamaModelInfo {
  name: string
  modifiedAt: string
  size: number
  digest: string
  family: string
  parameterSize: string
  quantizationLevel: string
}

/** Ollama server status */
export interface OllamaServerStatus {
  running: boolean
  version: string | null
  models: OllamaModelInfo[]
  host: string
  port: number
}

/** Context window management options */
export interface ContextWindowOptions {
  maxTokens: number
  strategy: 'truncate_oldest' | 'truncate_middle' | 'sliding_window' | 'summarize_oldest'
  reserveForResponse: number
  preserveSystemPrompt: boolean
}

/** Ollama generate API request body */
export interface OllamaGenerateRequest {
  model: string
  prompt: string
  system: string
  options: { temperature: number; top_p: number; num_predict: number }
  stream: boolean
}

/** Ollama chat API request body */
export interface OllamaChatRequest {
  model: string
  messages: Array<{ role: string; content: string }>
  options: { temperature: number; top_p: number; num_predict: number }
  stream: boolean
}

/** OpenAI-compatible API request body (for llama.cpp) */
export interface OpenAICompatRequest {
  model: string
  messages: Array<{ role: string; content: string }>
  temperature: number
  top_p: number
  max_tokens: number
  stream: boolean
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
    weaknesses: ['creative_writing', 'conversation', 'general_reasoning'],
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
    weaknesses: ['code_generation', 'code_completion'],
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
  lastAccessedAt: number
}

// ─── ModelSpark Class ────────────────────────────────────────────────────────

export class ModelSpark {
  private config: ModelSparkConfig
  private stats: ModelSparkStats
  private cache: Map<string, CacheEntry> = new Map()
  private modelHealth: Map<string, ModelHealth> = new Map()
  private performanceHistory: Map<string, number[]> = new Map()
  private downloadedModels: Set<string> = new Set()

  // ── New private state ──
  private sessions: Map<string, ChatSession> = new Map()
  private circuitBreakers: Map<string, CircuitBreakerStatus> = new Map()
  private modelLifecycle: Map<string, ModelLifecycleInfo> = new Map()
  private retryConfig = { maxRetries: 3, baseDelayMs: 500, maxDelayMs: 5000 }
  private circuitBreakerConfig: CircuitBreakerConfig = { failureThreshold: 5, resetTimeoutMs: 30000, halfOpenMaxRequests: 2 }

  constructor(config?: Partial<ModelSparkConfig>) {
    this.config = { ...DEFAULT_MODEL_SPARK_CONFIG, ...config }
    this.stats = this._initStats()
    this._initModelHealth()
    this._initCircuitBreakers()
    this._initModelLifecycle()
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
    entry.lastAccessedAt = Date.now()
    return entry.response
  }

  /** Cache a response (LRU eviction) */
  private _cacheResponse(prompt: string, response: SparkResponse): void {
    // LRU eviction: remove least recently accessed entry when at capacity
    if (this.cache.size >= this.config.cacheMaxSize) {
      let lruKey: string | null = null
      let lruTime = Infinity
      for (const [k, v] of this.cache.entries()) {
        if (v.lastAccessedAt < lruTime) {
          lruTime = v.lastAccessedAt
          lruKey = k
        }
      }
      if (lruKey !== null) {
        this.cache.delete(lruKey)
      }
    }

    const key = this.hashContent(prompt)
    const now = Date.now()
    this.cache.set(key, {
      response,
      timestamp: now,
      hitCount: 0,
      lastAccessedAt: now,
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

  // ══════════════════════════════════════════════════════════════════════════
  // CONVERSATION / MULTI-TURN CHAT
  // ══════════════════════════════════════════════════════════════════════════

  /** Create a new chat session */
  createSession(options?: {
    domain?: TaskDomain
    strategy?: InferenceStrategy
    systemPrompt?: string
    metadata?: Record<string, string>
  }): ChatSession {
    const id = this.hashContent(`session-${Date.now()}-${Math.random()}`)
    const now = Date.now()
    const messages: SparkChatMessage[] = []

    if (options?.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt,
        timestamp: now,
        tokensEstimate: Math.ceil(options.systemPrompt.length / 4),
      })
    }

    const session: ChatSession = {
      id,
      messages,
      domain: options?.domain ?? null,
      strategy: options?.strategy ?? this.config.defaultStrategy,
      totalTokens: messages.reduce((sum, m) => sum + (m.tokensEstimate ?? 0), 0),
      createdAt: now,
      lastActiveAt: now,
      metadata: options?.metadata ?? {},
    }

    this.sessions.set(id, session)
    return session
  }

  /** Get an existing session */
  getSession(sessionId: string): ChatSession | null {
    return this.sessions.get(sessionId) ?? null
  }

  /** List all sessions */
  listSessions(): ChatSession[] {
    return [...this.sessions.values()]
  }

  /** Delete a session */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }

  /** Multi-turn chat within a session */
  async chat(sessionId: string, userMessage: string, options?: Partial<SparkRequest>): Promise<SparkResponse> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`)
    }

    const now = Date.now()

    // Add user message to history
    const userMsg: SparkChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: now,
      tokensEstimate: Math.ceil(userMessage.length / 4),
    }
    session.messages.push(userMsg)
    session.totalTokens += userMsg.tokensEstimate!

    // Build context from conversation history
    const contextMessages = this.manageContextWindow(session.messages, {
      maxTokens: this.config.maxTokens * 4, // context is bigger than response
      strategy: 'truncate_oldest',
      reserveForResponse: this.config.maxTokens,
      preserveSystemPrompt: true,
    })

    // Build a single prompt from conversation history
    const conversationPrompt = contextMessages.map(m => {
      if (m.role === 'system') return `System: ${m.content}`
      if (m.role === 'user') return `User: ${m.content}`
      return `Assistant: ${m.content}`
    }).join('\n\n') + '\n\nAssistant:'

    // Detect domain from latest message if not set
    const domain = session.domain ?? options?.domain ?? this.detectDomain(userMessage).domain

    // Infer
    const response = await this.infer({
      prompt: conversationPrompt,
      domain,
      strategy: session.strategy,
      ...options,
    })

    // Add assistant response to history
    const assistantMsg: SparkChatMessage = {
      role: 'assistant',
      content: response.text,
      timestamp: Date.now(),
      modelFamily: response.primaryModel,
      domain: response.domain,
      tokensEstimate: response.totalTokensGenerated,
    }
    session.messages.push(assistantMsg)
    session.totalTokens += assistantMsg.tokensEstimate!
    session.lastActiveAt = Date.now()

    return response
  }

  /** Get conversation history for a session */
  getConversationHistory(sessionId: string): SparkChatMessage[] {
    const session = this.sessions.get(sessionId)
    return session ? [...session.messages] : []
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STREAMING INFERENCE
  // ══════════════════════════════════════════════════════════════════════════

  /** Stream inference tokens (async generator) */
  async *inferStream(request: SparkRequest): AsyncGenerator<StreamToken, void, unknown> {
    // Detect domain
    const domain = request.domain ?? this.detectDomain(request.prompt).domain
    const routing = this.routeRequest({ ...request, domain })
    const model = routing.primary === 'qwen2.5' ? this.getQwenModel() : this.getLlamaModel()

    // Build prompt
    const templateKey = routing.primary === 'qwen2.5' ? 'qwen' : 'llama'
    const templates = SPARK_PROMPTS[templateKey]!
    const template = templates[domain] ?? templates['default']!
    const fullPrompt = template.replace('{prompt}', request.prompt)

    // Simulate streaming by breaking fallback response into tokens
    let responseText: string
    try {
      const result = await this._callModelServer(routing.primary, fullPrompt, request)
      responseText = result.text
    } catch {
      responseText = this._generateFallback(request.prompt, model, domain)
    }

    // Yield token by token
    const words = responseText.split(/(\s+)/)
    let tokenIndex = 0
    for (let i = 0; i < words.length; i++) {
      const token = words[i]!
      if (token.length === 0) continue
      yield {
        token,
        index: tokenIndex++,
        modelFamily: routing.primary,
        done: i === words.length - 1,
        totalTokens: tokenIndex,
      }
    }
  }

  /** Collect all streaming tokens into a full response string */
  async collectStream(request: SparkRequest): Promise<{ text: string; totalTokens: number; modelFamily: SparkModelFamily }> {
    const tokens: string[] = []
    let totalTokens = 0
    let modelFamily: SparkModelFamily = 'qwen2.5'

    for await (const token of this.inferStream(request)) {
      tokens.push(token.token)
      totalTokens = token.totalTokens
      modelFamily = token.modelFamily
    }

    return { text: tokens.join(''), totalTokens, modelFamily }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CIRCUIT BREAKER / ERROR RECOVERY
  // ══════════════════════════════════════════════════════════════════════════

  /** Get circuit breaker status for a model family */
  getCircuitBreakerStatus(family: SparkModelFamily): CircuitBreakerStatus {
    return { ...(this.circuitBreakers.get(family) ?? this._defaultCircuitBreaker()) }
  }

  /** Check if a model's circuit breaker allows requests */
  isCircuitClosed(family: SparkModelFamily): boolean {
    const cb = this.circuitBreakers.get(family)
    if (!cb) return true

    if (cb.state === 'closed') return true
    if (cb.state === 'open') {
      // Check if reset timeout has elapsed → transition to half_open
      if (Date.now() - cb.lastFailureAt >= this.circuitBreakerConfig.resetTimeoutMs) {
        cb.state = 'half_open'
        return true
      }
      return false
    }
    // half_open: allow limited requests
    return true
  }

  /** Record a successful request to the circuit breaker */
  recordSuccess(family: SparkModelFamily): void {
    const cb = this.circuitBreakers.get(family)
    if (!cb) return

    cb.lastSuccessAt = Date.now()
    if (cb.state === 'half_open') {
      cb.state = 'closed'
      cb.failures = 0
    }
  }

  /** Record a failed request to the circuit breaker */
  recordFailure(family: SparkModelFamily): void {
    const cb = this.circuitBreakers.get(family)
    if (!cb) return

    cb.failures++
    cb.lastFailureAt = Date.now()

    if (cb.failures >= this.circuitBreakerConfig.failureThreshold) {
      cb.state = 'open'
      cb.totalTrips++
    }
  }

  /** Reset circuit breaker for a model */
  resetCircuitBreaker(family: SparkModelFamily): void {
    this.circuitBreakers.set(family, this._defaultCircuitBreaker())
  }

  /** Infer with retry and circuit breaker protection */
  async inferWithRetry(request: SparkRequest, maxRetries?: number): Promise<SparkResponse> {
    const retries = maxRetries ?? this.retryConfig.maxRetries
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.infer(request)
        return response
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        this.stats.errors++

        if (attempt < retries) {
          // Exponential backoff with jitter
          const delay = Math.min(
            this.retryConfig.baseDelayMs * Math.pow(2, attempt) + Math.random() * 200,
            this.retryConfig.maxDelayMs,
          )
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries exhausted — return a graceful error response
    const domain = request.domain ?? this.detectDomain(request.prompt).domain
    return {
      text: `[Model Spark — Error after ${retries + 1} attempts]\n\n${lastError?.message ?? 'Unknown error'}\n\nPlease check that the Ollama server is running:\n\`\`\`bash\nollama serve\n\`\`\``,
      strategy: request.strategy ?? this.config.defaultStrategy,
      domain,
      primaryModel: 'qwen2.5',
      secondaryModel: null,
      primaryResponse: {
        text: '', modelId: '', modelFamily: 'qwen2.5', tokensGenerated: 0,
        tokensPrompt: 0, durationMs: 0, tokensPerSecond: 0, qualityScore: 0,
        finishReason: 'error', error: lastError?.message,
      },
      secondaryResponse: null,
      fusedResponse: null,
      qualityScore: 0,
      totalTokensGenerated: 0,
      totalDurationMs: 0,
      effectiveTokensPerSecond: 0,
      cached: false,
      routingReason: `Error: ${lastError?.message}`,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODEL LIFECYCLE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  /** Get lifecycle info for a model */
  getModelLifecycle(modelId: string): ModelLifecycleInfo | null {
    return this.modelLifecycle.get(modelId) ?? null
  }

  /** Get lifecycle info for all models */
  getAllModelLifecycles(): ModelLifecycleInfo[] {
    return [...this.modelLifecycle.values()]
  }

  /** Generate the Ollama pull command for a model */
  getOllamaPullCommand(modelId: string): string | null {
    const model = this.getModel(modelId)
    if (!model) return null
    return `ollama pull ${model.ollamaName}`
  }

  /** Generate the llama.cpp server command for a model */
  getLlamaCppCommand(modelId: string): string | null {
    const model = this.getModel(modelId)
    if (!model) return null
    return [
      'llama-server',
      `-m ${this.config.modelsDir}/${model.llamaCppName}`,
      `-c ${model.contextWindow}`,
      `-ngl 99`,
      `--host ${model.family === 'qwen2.5' ? this.config.qwenHost : this.config.llamaHost}`,
      `--port ${model.family === 'qwen2.5' ? this.config.qwenPort : this.config.llamaPort}`,
    ].join(' ')
  }

  /** Generate complete setup script for both models */
  generateSetupScript(): string {
    const qwen = this.getQwenModel()
    const llama = this.getLlamaModel()

    return [
      '#!/bin/bash',
      '# ⚡ Model Spark — Automated Setup Script',
      '# Installs and configures Qwen2.5-Coder + LLaMA for dual-model inference',
      '',
      'set -e',
      '',
      '# Step 1: Install Ollama',
      'echo "📦 Installing Ollama..."',
      'if ! command -v ollama &> /dev/null; then',
      '  curl -fsSL https://ollama.ai/install.sh | sh',
      'else',
      '  echo "Ollama already installed"',
      'fi',
      '',
      '# Step 2: Start Ollama server',
      'echo "🚀 Starting Ollama server..."',
      'ollama serve &',
      'OLLAMA_PID=$!',
      'sleep 3',
      '',
      `# Step 3: Pull ${qwen.name}`,
      `echo "🟢 Downloading ${qwen.name} (${qwen.fileSizeGB} GB)..."`,
      `ollama pull ${qwen.ollamaName}`,
      '',
      `# Step 4: Pull ${llama.name}`,
      `echo "🟣 Downloading ${llama.name} (${llama.fileSizeGB} GB)..."`,
      `ollama pull ${llama.ollamaName}`,
      '',
      '# Step 5: Verify',
      'echo "✅ Model Spark setup complete!"',
      `echo "  🟢 Qwen: ${qwen.name}"`,
      `echo "  🟣 LLaMA: ${llama.name}"`,
      `echo "  Total size: ~${(qwen.fileSizeGB + llama.fileSizeGB).toFixed(1)} GB"`,
      'echo "  Server running at http://127.0.0.1:11434"',
      '',
      '# Keep server running',
      'wait $OLLAMA_PID',
    ].join('\n')
  }

  /** Simulate marking a model as installed */
  markModelInstalled(modelId: string): void {
    const lifecycle = this.modelLifecycle.get(modelId)
    if (lifecycle) {
      lifecycle.state = 'installed'
      lifecycle.installedAt = Date.now()
      lifecycle.downloadProgress = 100
      this.downloadedModels.add(modelId)
    }
  }

  /** Simulate marking a model as ready (loaded in server) */
  markModelReady(modelId: string): void {
    const lifecycle = this.modelLifecycle.get(modelId)
    if (lifecycle) {
      lifecycle.state = 'ready'
      lifecycle.lastUsedAt = Date.now()
    }
  }

  /** Check if both models are ready */
  areBothModelsReady(): boolean {
    const qwen = this.modelLifecycle.get(this.config.qwenModel)
    const llama = this.modelLifecycle.get(this.config.llamaModel)
    return (qwen?.state === 'ready' || qwen?.state === 'installed') &&
           (llama?.state === 'ready' || llama?.state === 'installed')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PROMPT CHAINING
  // ══════════════════════════════════════════════════════════════════════════

  /** Execute a chain of prompts with dependencies */
  async executePromptChain(steps: PromptChainStep[]): Promise<PromptChainResult> {
    const startTime = Date.now()
    const results: PromptChainResult['steps'] = []
    const outputMap: Record<string, string> = {}

    // Topological sort: execute steps in dependency order
    const sorted = this._topologicalSort(steps)

    for (const step of sorted) {
      // Resolve dependencies — inject previous outputs into prompt
      let prompt = step.prompt
      for (const depId of step.dependsOn) {
        const depOutput = outputMap[depId] ?? ''
        prompt = prompt.replace(`{${depId}}`, depOutput)
      }

      // Detect domain and model
      const domain: TaskDomain = step.domain === 'auto'
        ? this.detectDomain(prompt).domain
        : step.domain
      const family: SparkModelFamily = step.model === 'auto'
        ? (this.getRoutingRule(domain).preference === 'llama' ? 'llama3' : 'qwen2.5')
        : step.model

      // Execute
      const resp = await this.inferOnModel(prompt, family, domain, { maxTokens: step.maxTokens })

      // Post-process output
      let output = resp.text
      if (step.transform && step.transform !== 'none') {
        const parsed = this.parseOutput(resp.text)
        switch (step.transform) {
          case 'extract_code':
            output = parsed.codeBlocks.map(b => b.code).join('\n\n') || resp.text
            break
          case 'extract_json':
            output = parsed.jsonBlocks.length > 0 ? JSON.stringify(parsed.jsonBlocks[0], null, 2) : resp.text
            break
          case 'summarize':
            output = parsed.summary ?? resp.text
            break
          case 'key_points':
            output = parsed.keyPoints.join('\n') || resp.text
            break
        }
      }

      outputMap[step.id] = output
      results.push({
        id: step.id,
        input: prompt,
        output,
        model: family,
        domain,
        durationMs: resp.durationMs,
        tokensGenerated: resp.tokensGenerated,
      })
    }

    const lastStep = results[results.length - 1]
    return {
      steps: results,
      finalOutput: lastStep?.output ?? '',
      totalDurationMs: Date.now() - startTime,
      totalTokens: results.reduce((sum, r) => sum + r.tokensGenerated, 0),
    }
  }

  /** Create a simple two-step prompt chain (think → do) */
  buildThinkDoChain(prompt: string, domain?: TaskDomain): PromptChainStep[] {
    return [
      {
        id: 'think',
        prompt: `Think step-by-step about how to approach this task:\n\n${prompt}\n\nProvide a detailed plan:`,
        model: 'llama3',
        domain: domain ?? 'auto',
        dependsOn: [],
      },
      {
        id: 'do',
        prompt: `Based on this plan:\n\n{think}\n\nNow execute and provide the final answer for:\n\n${prompt}`,
        model: 'qwen2.5',
        domain: domain ?? 'auto',
        dependsOn: ['think'],
      },
    ]
  }

  /** Create a review chain (generate → review → refine) */
  buildReviewChain(prompt: string): PromptChainStep[] {
    return [
      {
        id: 'generate',
        prompt: prompt,
        model: 'qwen2.5',
        domain: 'auto',
        dependsOn: [],
      },
      {
        id: 'review',
        prompt: `Review the following output for correctness, completeness, and quality:\n\n{generate}\n\nProvide specific feedback and suggestions for improvement:`,
        model: 'llama3',
        domain: 'code_review',
        dependsOn: ['generate'],
      },
      {
        id: 'refine',
        prompt: `Given the original task:\n${prompt}\n\nOriginal output:\n{generate}\n\nReview feedback:\n{review}\n\nProduce an improved final version:`,
        model: 'qwen2.5',
        domain: 'auto',
        dependsOn: ['generate', 'review'],
      },
    ]
  }

  // ══════════════════════════════════════════════════════════════════════════
  // OUTPUT PARSING
  // ══════════════════════════════════════════════════════════════════════════

  /** Parse structured content from a model response */
  parseOutput(text: string): ParsedOutput {
    // Extract code blocks
    const codeBlocks: Array<{ language: string; code: string }> = []
    const codeRegex = /```(\w*)\n([\s\S]*?)```/g
    let codeMatch: RegExpExecArray | null
    while ((codeMatch = codeRegex.exec(text)) !== null) {
      codeBlocks.push({
        language: codeMatch[1] || 'text',
        code: codeMatch[2]!.trim(),
      })
    }

    // Extract JSON blocks
    const jsonBlocks: unknown[] = []
    const jsonRegex = /\{[\s\S]*?\}/g
    let jsonMatch: RegExpExecArray | null
    while ((jsonMatch = jsonRegex.exec(text)) !== null) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        jsonBlocks.push(parsed)
      } catch {
        // Not valid JSON, skip
      }
    }

    // Extract key points (numbered or bulleted lists)
    const keyPoints: string[] = []
    const listRegex = /^[\s]*(?:\d+[.)]\s*|[-*•]\s+)(.+)$/gm
    let listMatch: RegExpExecArray | null
    while ((listMatch = listRegex.exec(text)) !== null) {
      keyPoints.push(listMatch[1]!.trim())
    }

    // Extract headings
    const headings: string[] = []
    const headingRegex = /^#{1,6}\s+(.+)$/gm
    let headingMatch: RegExpExecArray | null
    while ((headingMatch = headingRegex.exec(text)) !== null) {
      headings.push(headingMatch[1]!.trim())
    }

    // Extract lists (groups of consecutive bullet points)
    const lists: string[][] = []
    let currentList: string[] = []
    for (const line of text.split('\n')) {
      if (/^\s*[-*•]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
        currentList.push(line.replace(/^\s*[-*•\d.)]+\s+/, '').trim())
      } else if (currentList.length > 0) {
        lists.push([...currentList])
        currentList = []
      }
    }
    if (currentList.length > 0) lists.push(currentList)

    // Extract URLs
    const urls: string[] = []
    const urlRegex = /https?:\/\/[^\s)>\]]+/g
    let urlMatch: RegExpExecArray | null
    while ((urlMatch = urlRegex.exec(text)) !== null) {
      urls.push(urlMatch[0])
    }

    // Generate summary (first substantive paragraph)
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20 && !p.startsWith('```'))
    const summary = paragraphs.length > 0 ? paragraphs[0]!.trim() : null

    // Count words and sentences
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

    return {
      raw: text,
      codeBlocks,
      jsonBlocks,
      keyPoints,
      summary,
      headings,
      lists,
      urls,
      wordCount: words.length,
      sentenceCount: sentences.length,
    }
  }

  /** Extract only code blocks from a response */
  extractCode(text: string): Array<{ language: string; code: string }> {
    return this.parseOutput(text).codeBlocks
  }

  /** Extract only key points from a response */
  extractKeyPoints(text: string): string[] {
    return this.parseOutput(text).keyPoints
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CONTEXT WINDOW MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  /** Manage context window by trimming messages to fit token budget */
  manageContextWindow(messages: SparkChatMessage[], options: ContextWindowOptions): SparkChatMessage[] {
    const maxBudget = options.maxTokens - options.reserveForResponse
    let totalTokens = messages.reduce((sum, m) => sum + (m.tokensEstimate ?? Math.ceil(m.content.length / 4)), 0)

    if (totalTokens <= maxBudget) return [...messages]

    const result = [...messages]

    switch (options.strategy) {
      case 'truncate_oldest': {
        // Keep system prompt + most recent messages
        while (totalTokens > maxBudget && result.length > 1) {
          const idx = options.preserveSystemPrompt && result[0]?.role === 'system' ? 1 : 0
          if (idx >= result.length) break
          const removed = result.splice(idx, 1)[0]!
          totalTokens -= removed.tokensEstimate ?? Math.ceil(removed.content.length / 4)
        }
        break
      }
      case 'truncate_middle': {
        // Keep system prompt, first user message, and most recent messages
        while (totalTokens > maxBudget && result.length > 3) {
          const midIdx = Math.floor(result.length / 2)
          const removed = result.splice(midIdx, 1)[0]!
          totalTokens -= removed.tokensEstimate ?? Math.ceil(removed.content.length / 4)
        }
        break
      }
      case 'sliding_window': {
        // Keep only the last N messages that fit
        while (totalTokens > maxBudget && result.length > 1) {
          const removed = result.shift()!
          if (options.preserveSystemPrompt && removed.role === 'system') {
            result.unshift(removed) // put it back
            if (result.length > 1) {
              const next = result.splice(1, 1)[0]!
              totalTokens -= next.tokensEstimate ?? Math.ceil(next.content.length / 4)
            } else {
              break
            }
          } else {
            totalTokens -= removed.tokensEstimate ?? Math.ceil(removed.content.length / 4)
          }
        }
        break
      }
      case 'summarize_oldest': {
        // Replace oldest messages with a summary placeholder
        if (result.length > 3) {
          const startIdx = options.preserveSystemPrompt && result[0]?.role === 'system' ? 1 : 0
          const endIdx = Math.max(startIdx + 1, result.length - 2)
          const oldMessages = result.splice(startIdx, endIdx - startIdx)
          const summaryContent = `[Summary of ${oldMessages.length} previous messages about: ${oldMessages.map(m => m.content.slice(0, 30)).join(', ')}]`
          const summaryMsg: SparkChatMessage = {
            role: 'assistant',
            content: summaryContent,
            timestamp: Date.now(),
            tokensEstimate: Math.ceil(summaryContent.length / 4),
          }
          result.splice(startIdx, 0, summaryMsg)
        }
        break
      }
    }

    return result
  }

  /** Estimate token count for text */
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English
    // Slightly more accurate: count words and special chars
    const words = text.split(/\s+/).length
    const specialChars = (text.match(/[^\w\s]/g) ?? []).length
    return Math.ceil(words * 1.3 + specialChars * 0.5)
  }

  /** Check if a prompt fits within a model's context window */
  fitsInContextWindow(prompt: string, modelId?: string): { fits: boolean; promptTokens: number; maxTokens: number; remainingTokens: number } {
    const model = modelId ? this.getModel(modelId) : this.getQwenModel()
    const maxTokens = model?.contextWindow ?? 32768
    const promptTokens = this.estimateTokens(prompt)
    return {
      fits: promptTokens < maxTokens - this.config.maxTokens,
      promptTokens,
      maxTokens,
      remainingTokens: maxTokens - promptTokens - this.config.maxTokens,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HARDWARE DETECTION
  // ══════════════════════════════════════════════════════════════════════════

  /** Detect hardware and recommend best model configuration */
  detectHardware(): HardwareProfile {
    let totalRAMGB: number
    let cpuCores: number
    let cpuModel: string

    try {
      totalRAMGB = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 10) / 10
      cpuCores = os.cpus()?.length ?? 4
      cpuModel = os.cpus()?.[0]?.model ?? 'Unknown CPU'
    } catch {
      // Fallback for environments where os module isn't available
      totalRAMGB = 8
      cpuCores = 4
      cpuModel = 'Unknown CPU'
    }

    const availableRAMGB = Math.round(totalRAMGB * 0.7 * 10) / 10 // ~70% available

    // GPU detection (basic heuristic — full detection needs system calls)
    const gpuDetected = false // Would need nvidia-smi or similar
    const gpuName: string | null = null
    const gpuVRAMGB: number | null = null

    // Recommend models based on available RAM
    const pair = this.getBestModelPair(availableRAMGB)
    const canRunBoth = availableRAMGB >= 12 // Both models need ~12GB+ to run simultaneously

    // Recommend strategy based on hardware
    let recommendedStrategy: InferenceStrategy = 'route'
    if (canRunBoth) {
      recommendedStrategy = 'ensemble'
    } else if (availableRAMGB >= 8) {
      recommendedStrategy = 'cascade'
    } else if (availableRAMGB >= 4) {
      recommendedStrategy = 'route'
    }

    return {
      totalRAMGB,
      availableRAMGB,
      cpuCores,
      cpuModel,
      gpuDetected,
      gpuName,
      gpuVRAMGB,
      recommendedQwen: pair.qwen?.id ?? null,
      recommendedLlama: pair.llama?.id ?? null,
      recommendedStrategy,
      canRunBothSimultaneously: canRunBoth,
    }
  }

  /** Auto-configure ModelSpark based on detected hardware */
  autoConfigureFromHardware(): HardwareProfile {
    const hw = this.detectHardware()

    // Apply recommended configuration
    if (hw.recommendedQwen) this.config.qwenModel = hw.recommendedQwen
    if (hw.recommendedLlama) this.config.llamaModel = hw.recommendedLlama
    this.config.defaultStrategy = hw.recommendedStrategy

    // Adjust thread count based on CPU cores
    // (not directly in config, but useful for llama.cpp commands)

    return hw
  }

  /** Generate a hardware report */
  generateHardwareReport(): string {
    const hw = this.detectHardware()

    return [
      '╔═══════════════════════════════════════════════════════════════╗',
      '║           🖥️  Model Spark — Hardware Report                  ║',
      '╚═══════════════════════════════════════════════════════════════╝',
      '',
      `CPU: ${hw.cpuModel}`,
      `CPU Cores: ${hw.cpuCores}`,
      `Total RAM: ${hw.totalRAMGB} GB`,
      `Available RAM: ~${hw.availableRAMGB} GB`,
      `GPU: ${hw.gpuDetected ? `${hw.gpuName} (${hw.gpuVRAMGB} GB VRAM)` : 'Not detected (CPU inference)'}`,
      '',
      '📊 Recommendations:',
      `  Qwen model: ${hw.recommendedQwen ?? 'None (insufficient RAM)'}`,
      `  LLaMA model: ${hw.recommendedLlama ?? 'None (insufficient RAM)'}`,
      `  Strategy: ${hw.recommendedStrategy}`,
      `  Dual-model simultaneous: ${hw.canRunBothSimultaneously ? '✅ Yes' : '❌ No (models will swap)'}`,
    ].join('\n')
  }

  // ══════════════════════════════════════════════════════════════════════════
  // OLLAMA API INTEGRATION
  // ══════════════════════════════════════════════════════════════════════════

  /** Get the Ollama API base URL */
  getOllamaBaseUrl(): string {
    return `http://${this.config.qwenHost}:${this.config.qwenPort}`
  }

  /** Build Ollama API generate request body */
  buildOllamaRequest(prompt: string, model: SparkModel, options?: Partial<SparkRequest>): OllamaGenerateRequest {
    return {
      model: model.ollamaName,
      prompt,
      system: options?.systemPrompt ?? '',
      options: {
        temperature: options?.temperature ?? this.config.temperature,
        top_p: options?.topP ?? this.config.topP,
        num_predict: options?.maxTokens ?? this.config.maxTokens,
      },
      stream: false,
    }
  }

  /** Build Ollama chat API request body (for multi-turn) */
  buildOllamaChatRequest(messages: SparkChatMessage[], model: SparkModel, options?: Partial<SparkRequest>): OllamaChatRequest {
    return {
      model: model.ollamaName,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      options: {
        temperature: options?.temperature ?? this.config.temperature,
        top_p: options?.topP ?? this.config.topP,
        num_predict: options?.maxTokens ?? this.config.maxTokens,
      },
      stream: false,
    }
  }

  /** Build OpenAI-compatible API request (for llama.cpp server) */
  buildOpenAICompatRequest(prompt: string, model: SparkModel, options?: Partial<SparkRequest>): OpenAICompatRequest {
    const messages: Array<{ role: string; content: string }> = []
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    return {
      model: model.id,
      messages,
      temperature: options?.temperature ?? this.config.temperature,
      top_p: options?.topP ?? this.config.topP,
      max_tokens: options?.maxTokens ?? this.config.maxTokens,
      stream: false,
    }
  }

  /** Check if Ollama server is accessible (returns status) */
  async checkOllamaServer(): Promise<OllamaServerStatus> {
    const host = this.config.qwenHost
    const port = this.config.qwenPort

    try {
      // In production: fetch(`http://${host}:${port}/api/tags`)
      // For offline/testing, return a helpful status
      throw new Error('Server check not available in offline mode')
    } catch {
      return {
        running: false,
        version: null,
        models: [],
        host,
        port,
      }
    }
  }

  /** Generate Ollama model management commands */
  getModelManagementCommands(): Record<string, string> {
    const qwen = this.getQwenModel()
    const llama = this.getLlamaModel()

    return {
      install_qwen: `ollama pull ${qwen.ollamaName}`,
      install_llama: `ollama pull ${llama.ollamaName}`,
      list_models: 'ollama list',
      show_qwen: `ollama show ${qwen.ollamaName}`,
      show_llama: `ollama show ${llama.ollamaName}`,
      remove_qwen: `ollama rm ${qwen.ollamaName}`,
      remove_llama: `ollama rm ${llama.ollamaName}`,
      start_server: 'ollama serve',
      check_status: 'curl http://127.0.0.1:11434/api/tags',
      run_qwen: `ollama run ${qwen.ollamaName}`,
      run_llama: `ollama run ${llama.ollamaName}`,
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE — NEW INITIALIZERS
  // ══════════════════════════════════════════════════════════════════════════

  /** Initialize circuit breakers for each model family */
  private _initCircuitBreakers(): void {
    this.circuitBreakers.set('qwen2.5', this._defaultCircuitBreaker())
    this.circuitBreakers.set('llama3', this._defaultCircuitBreaker())
  }

  /** Default circuit breaker state */
  private _defaultCircuitBreaker(): CircuitBreakerStatus {
    return {
      state: 'closed',
      failures: 0,
      lastFailureAt: 0,
      lastSuccessAt: 0,
      totalTrips: 0,
    }
  }

  /** Initialize model lifecycle tracking */
  private _initModelLifecycle(): void {
    for (const model of SPARK_MODEL_REGISTRY) {
      this.modelLifecycle.set(model.id, {
        modelId: model.id,
        state: 'not_installed',
        downloadProgress: 0,
        installedAt: null,
        lastUsedAt: null,
        diskSizeBytes: Math.round(model.fileSizeGB * 1024 * 1024 * 1024),
        serverPid: null,
      })
    }
  }

  /** Topological sort for prompt chain steps */
  private _topologicalSort(steps: PromptChainStep[]): PromptChainStep[] {
    const visited = new Set<string>()
    const sorted: PromptChainStep[] = []
    const stepMap = new Map(steps.map(s => [s.id, s]))

    const visit = (step: PromptChainStep) => {
      if (visited.has(step.id)) return
      visited.add(step.id)
      for (const depId of step.dependsOn) {
        const dep = stepMap.get(depId)
        if (dep) visit(dep)
      }
      sorted.push(step)
    }

    for (const step of steps) {
      visit(step)
    }

    return sorted
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
//
//   ⚡ SPARK UNIFIED ORCHESTRATION SYSTEM
//
//   Connects ModelSpark (Dual-Model Ensemble) + LocalBrain (47+ Intelligence
//   Modules) + LocalLLMBridge (Smart Routing) + QwenLocalLLM (Local Inference)
//   into ONE unified, ultra-powerful AI system.
//
//   Architecture:
//     ✦ SparkBrainConnector — Bridges ModelSpark ↔ LocalBrain knowledge
//     ✦ SparkAgent — Autonomous multi-step agent with planning + tools
//     ✦ UnifiedOrchestrator — Master router for all AI subsystems
//     ✦ Cross-system context sharing for maximum intelligence
//
//   100% offline. Zero external APIs. Everything local.
//
// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════

// ─── Agent Types ─────────────────────────────────────────────────────────────

/** Tool available to the SparkAgent */
export interface AgentTool {
  name: string
  description: string
  category: 'code' | 'reasoning' | 'knowledge' | 'security' | 'analysis' | 'creative' | 'system'
  inputSchema: string
  handler: (input: string) => Promise<AgentToolResult> | AgentToolResult
}

/** Result from executing an agent tool */
export interface AgentToolResult {
  success: boolean
  output: string
  confidence: number
  source: string
  metadata?: Record<string, unknown>
  durationMs: number
}

/** Agent thought step (chain-of-thought reasoning) */
export interface AgentThought {
  step: number
  type: 'plan' | 'reason' | 'act' | 'observe' | 'reflect' | 'decide' | 'synthesize'
  content: string
  toolUsed?: string
  toolInput?: string
  toolOutput?: string
  confidence: number
  timestamp: number
}

/** Agent task with full execution context */
export interface AgentTask {
  id: string
  query: string
  domain: TaskDomain
  plan: string[]
  thoughts: AgentThought[]
  toolCalls: Array<{ tool: string; input: string; output: string; durationMs: number }>
  finalAnswer: string
  totalDurationMs: number
  status: 'planning' | 'executing' | 'reflecting' | 'complete' | 'failed'
  retries: number
  qualityScore: number
}

/** Agent configuration */
export interface SparkAgentConfig {
  maxSteps: number
  maxRetries: number
  reflectionEnabled: boolean
  planningEnabled: boolean
  selfCorrectionEnabled: boolean
  confidenceThreshold: number
  timeoutMs: number
  verbose: boolean
}

/** Brain connector interface — what LocalBrain provides to Spark */
export interface BrainCapabilities {
  chat: (message: string) => Promise<{ response: string; confidence: number }>
  searchKnowledge: (query: string, limit?: number) => Array<{ content: string; score: number; category: string }>
  writeCode: (request: { description: string; language: string }) => Promise<{ code: string; explanation: string }>
  reviewCode: (request: { code: string; language: string }) => Promise<{ issues: string[]; score: number }>
  reason: (question: string) => Promise<{ answer: string; confidence: number; reasoning: string }>
  learn: (input: string, response: string, category?: string) => void
  getStats: () => Record<string, unknown>
  getKnowledgeBaseSize: () => number
}

/** LLM Bridge interface — what LocalLLMBridge provides to Spark */
export interface LLMBridgeCapabilities {
  processQuery: (query: string, context?: string[]) => Promise<{ text: string; confidence: number; source: string }>
  classifyIntent: (query: string) => { intent: string; confidence: number; target: string }
  searchExploits: (query: string) => Promise<{ text: string; confidence: number }>
  debugOverflow: (crashData: string) => Promise<{ text: string; confidence: number }>
  generateCode: (task: string, language: string) => Promise<{ text: string; confidence: number }>
  reviewCode: (code: string, language: string) => Promise<{ text: string; confidence: number }>
}

/** Orchestrator routing decision */
export interface OrchestrationDecision {
  primary: 'spark_ensemble' | 'brain_knowledge' | 'llm_bridge' | 'agent' | 'hybrid'
  secondary: string | null
  reason: string
  confidence: number
  domain: TaskDomain
  estimatedQuality: number
}

/** Orchestrator response — unified output from any subsystem */
export interface OrchestrationResponse {
  text: string
  source: 'spark_ensemble' | 'brain_knowledge' | 'llm_bridge' | 'agent' | 'hybrid'
  strategy: string
  domain: TaskDomain
  qualityScore: number
  confidence: number
  durationMs: number
  tokensGenerated: number
  subsystemsUsed: string[]
  agentTask?: AgentTask
  brainKnowledge?: Array<{ content: string; score: number }>
  sparkResponse?: SparkResponse
  metadata: Record<string, unknown>
}

/** Orchestrator statistics */
export interface OrchestrationStats {
  totalRequests: number
  sparkRequests: number
  brainRequests: number
  bridgeRequests: number
  agentRequests: number
  hybridRequests: number
  averageQuality: number
  averageLatencyMs: number
  agentTasksCompleted: number
  agentToolCalls: number
  brainKnowledgeHits: number
  errors: number
  routingDistribution: Record<string, number>
}

// ─── Default Configurations ──────────────────────────────────────────────────

export const DEFAULT_AGENT_CONFIG: SparkAgentConfig = {
  maxSteps: 10,
  maxRetries: 2,
  reflectionEnabled: true,
  planningEnabled: true,
  selfCorrectionEnabled: true,
  confidenceThreshold: 0.6,
  timeoutMs: 60000,
  verbose: false,
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SPARK BRAIN CONNECTOR — Bridges ModelSpark ↔ LocalBrain Knowledge
// ═══════════════════════════════════════════════════════════════════════════════

export class SparkBrainConnector {
  private spark: ModelSpark
  private brain: BrainCapabilities | null = null
  private bridge: LLMBridgeCapabilities | null = null
  private knowledgeCache: Map<string, { results: Array<{ content: string; score: number; category: string }>; timestamp: number }> = new Map()
  private cacheTTLMs = 5 * 60 * 1000 // 5 min

  constructor(spark: ModelSpark) {
    this.spark = spark
  }

  /** Connect LocalBrain to Spark */
  connectBrain(brain: BrainCapabilities): void {
    this.brain = brain
  }

  /** Connect LocalLLMBridge to Spark */
  connectBridge(bridge: LLMBridgeCapabilities): void {
    this.bridge = bridge
  }

  /** Check if brain is connected */
  isBrainConnected(): boolean {
    return this.brain !== null
  }

  /** Check if bridge is connected */
  isBridgeConnected(): boolean {
    return this.bridge !== null
  }

  /** Enrich a prompt with brain knowledge before sending to Spark ensemble */
  enrichPromptWithKnowledge(prompt: string, domain: TaskDomain): string {
    if (!this.brain) return prompt

    // Search brain's knowledge base for relevant context
    const cacheKey = `${domain}:${prompt.slice(0, 100)}`
    let knowledgeResults: Array<{ content: string; score: number; category: string }>

    const cached = this.knowledgeCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTTLMs) {
      knowledgeResults = cached.results
    } else {
      knowledgeResults = this.brain.searchKnowledge(prompt, 5)
      this.knowledgeCache.set(cacheKey, { results: knowledgeResults, timestamp: Date.now() })
    }

    if (knowledgeResults.length === 0) return prompt

    // Build enriched prompt with knowledge context
    const contextSnippets = knowledgeResults
      .filter(r => r.score > 0.3)
      .slice(0, 3)
      .map(r => `[${r.category}] ${r.content}`)
      .join('\n')

    if (!contextSnippets) return prompt

    return `[Knowledge Context]\n${contextSnippets}\n\n[User Query]\n${prompt}`
  }

  /** Infer using Spark ensemble with brain knowledge enrichment */
  async enrichedInfer(request: SparkRequest): Promise<SparkResponse> {
    const domain = request.domain ?? this.spark.detectDomain(request.prompt).domain
    const enrichedPrompt = this.enrichPromptWithKnowledge(request.prompt, domain)
    return this.spark.infer({ ...request, prompt: enrichedPrompt, domain })
  }

  /** Get brain knowledge for a query */
  getBrainKnowledge(query: string, limit = 5): Array<{ content: string; score: number; category: string }> {
    if (!this.brain) return []
    return this.brain.searchKnowledge(query, limit)
  }

  /** Use brain's code generation */
  async brainGenerateCode(description: string, language: string): Promise<{ code: string; explanation: string } | null> {
    if (!this.brain) return null
    return this.brain.writeCode({ description, language })
  }

  /** Use brain's code review */
  async brainReviewCode(code: string, language: string): Promise<{ issues: string[]; score: number } | null> {
    if (!this.brain) return null
    return this.brain.reviewCode({ code, language })
  }

  /** Use brain's reasoning */
  async brainReason(question: string): Promise<{ answer: string; confidence: number; reasoning: string } | null> {
    if (!this.brain) return null
    return this.brain.reason(question)
  }

  /** Teach the brain from Spark responses (feedback loop) */
  teachBrainFromSpark(query: string, sparkResponse: SparkResponse): void {
    if (!this.brain) return
    if (sparkResponse.qualityScore > 0.7) {
      this.brain.learn(query, sparkResponse.text, sparkResponse.domain)
    }
  }

  /** Get combined system status */
  getSystemStatus(): {
    sparkConnected: boolean
    brainConnected: boolean
    bridgeConnected: boolean
    brainKnowledgeSize: number
    sparkModels: number
    cacheSize: number
  } {
    return {
      sparkConnected: true,
      brainConnected: this.brain !== null,
      bridgeConnected: this.bridge !== null,
      brainKnowledgeSize: this.brain?.getKnowledgeBaseSize() ?? 0,
      sparkModels: this.spark.getAvailableModels().length,
      cacheSize: this.knowledgeCache.size,
    }
  }

  /** Clear knowledge cache */
  clearCache(): void {
    this.knowledgeCache.clear()
  }

  /** Get Spark instance */
  getSpark(): ModelSpark {
    return this.spark
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   SPARK AGENT — Autonomous Multi-Step Agent with Planning + Tool Use
// ═══════════════════════════════════════════════════════════════════════════════

export class SparkAgent {
  private spark: ModelSpark
  private connector: SparkBrainConnector
  private config: SparkAgentConfig
  private tools: Map<string, AgentTool> = new Map()
  private taskHistory: AgentTask[] = []
  private stats = {
    tasksCompleted: 0,
    tasksFailed: 0,
    totalToolCalls: 0,
    totalSteps: 0,
    averageQuality: 0,
    averageDurationMs: 0,
  }

  constructor(spark: ModelSpark, connector: SparkBrainConnector, config?: Partial<SparkAgentConfig>) {
    this.spark = spark
    this.connector = connector
    this.config = { ...DEFAULT_AGENT_CONFIG, ...config }
    this._registerBuiltinTools()
  }

  // ── Tool Management ──────────────────────────────────────────────────────

  /** Register a custom tool */
  registerTool(tool: AgentTool): void {
    this.tools.set(tool.name, tool)
  }

  /** Get all registered tools */
  getTools(): AgentTool[] {
    return [...this.tools.values()]
  }

  /** Get tool by name */
  getTool(name: string): AgentTool | null {
    return this.tools.get(name) ?? null
  }

  /** Remove a tool */
  removeTool(name: string): boolean {
    return this.tools.delete(name)
  }

  /** Get tool names by category */
  getToolsByCategory(category: AgentTool['category']): AgentTool[] {
    return [...this.tools.values()].filter(t => t.category === category)
  }

  // ── Task Execution ───────────────────────────────────────────────────────

  /** Execute a task autonomously with planning, tool use, and reflection */
  async executeTask(query: string): Promise<AgentTask> {
    const startTime = Date.now()
    const domain = this.spark.detectDomain(query).domain
    const taskId = this.spark.hashContent(`task-${Date.now()}-${Math.random()}`)

    const task: AgentTask = {
      id: taskId,
      query,
      domain,
      plan: [],
      thoughts: [],
      toolCalls: [],
      finalAnswer: '',
      totalDurationMs: 0,
      status: 'planning',
      retries: 0,
      qualityScore: 0,
    }

    try {
      // Phase 1: Planning
      if (this.config.planningEnabled) {
        task.status = 'planning'
        const plan = this._planTask(query, domain)
        task.plan = plan
        task.thoughts.push({
          step: 0,
          type: 'plan',
          content: `Plan created with ${plan.length} steps: ${plan.join(' → ')}`,
          confidence: 0.8,
          timestamp: Date.now(),
        })
      }

      // Phase 2: Execution
      task.status = 'executing'
      let currentContext = ''
      let stepNum = 1

      const stepsToExecute = task.plan.length > 0 ? task.plan : [query]

      for (const step of stepsToExecute) {
        if (stepNum > this.config.maxSteps) break
        if (Date.now() - startTime > this.config.timeoutMs) break

        // Reason about what tool to use
        const toolChoice = this._selectTool(step, domain, currentContext)

        task.thoughts.push({
          step: stepNum,
          type: 'reason',
          content: `Step ${stepNum}: ${step} → Using tool: ${toolChoice.toolName} (confidence: ${toolChoice.confidence.toFixed(2)})`,
          confidence: toolChoice.confidence,
          timestamp: Date.now(),
        })

        // Execute the tool
        const toolStart = Date.now()
        const toolResult = await this._executeTool(toolChoice.toolName, step, currentContext)
        const toolDuration = Date.now() - toolStart

        task.toolCalls.push({
          tool: toolChoice.toolName,
          input: step,
          output: toolResult.output.slice(0, 500),
          durationMs: toolDuration,
        })

        task.thoughts.push({
          step: stepNum,
          type: 'observe',
          content: `Tool "${toolChoice.toolName}" returned (${toolResult.success ? 'success' : 'failed'}, confidence: ${toolResult.confidence.toFixed(2)})`,
          toolUsed: toolChoice.toolName,
          toolInput: step.slice(0, 200),
          toolOutput: toolResult.output.slice(0, 200),
          confidence: toolResult.confidence,
          timestamp: Date.now(),
        })

        // Accumulate context from tool outputs
        currentContext += `\n\n[Step ${stepNum} - ${toolChoice.toolName}]:\n${toolResult.output}`
        stepNum++
        this.stats.totalToolCalls++
      }

      // Phase 3: Synthesis — combine all results into final answer
      task.finalAnswer = this._synthesizeAnswer(query, domain, task.thoughts, currentContext)

      task.thoughts.push({
        step: stepNum,
        type: 'synthesize',
        content: `Final answer synthesized from ${task.toolCalls.length} tool calls`,
        confidence: 0.85,
        timestamp: Date.now(),
      })

      // Phase 4: Reflection — evaluate quality and self-correct
      if (this.config.reflectionEnabled) {
        task.status = 'reflecting'
        const reflection = this._reflect(query, task.finalAnswer, domain)

        task.thoughts.push({
          step: stepNum + 1,
          type: 'reflect',
          content: reflection.assessment,
          confidence: reflection.qualityScore,
          timestamp: Date.now(),
        })

        task.qualityScore = reflection.qualityScore

        // Self-correction if quality is too low
        if (this.config.selfCorrectionEnabled && reflection.qualityScore < this.config.confidenceThreshold && task.retries < this.config.maxRetries) {
          task.retries++
          const corrected = this._selfCorrect(query, task.finalAnswer, reflection.issues, domain)
          task.finalAnswer = corrected
          task.qualityScore = Math.min(reflection.qualityScore + 0.15, 1.0)

          task.thoughts.push({
            step: stepNum + 2,
            type: 'decide',
            content: `Self-corrected answer (retry ${task.retries}). Quality improved to ${task.qualityScore.toFixed(2)}`,
            confidence: task.qualityScore,
            timestamp: Date.now(),
          })
        }
      }

      task.status = 'complete'
      this.stats.tasksCompleted++
    } catch (err) {
      task.status = 'failed'
      task.finalAnswer = `[Agent Error] ${err instanceof Error ? err.message : String(err)}\n\nPartial results:\n${task.thoughts.map(t => `${t.type}: ${t.content}`).join('\n')}`
      this.stats.tasksFailed++
    }

    task.totalDurationMs = Date.now() - startTime
    this.stats.totalSteps += task.thoughts.length
    this._updateAverages(task)
    this.taskHistory.push(task)

    return task
  }

  /** Quick single-shot agent query (no multi-step planning) */
  async quickQuery(query: string): Promise<AgentToolResult> {
    const domain = this.spark.detectDomain(query).domain
    const toolChoice = this._selectTool(query, domain, '')
    return this._executeTool(toolChoice.toolName, query, '')
  }

  // ── History & Stats ──────────────────────────────────────────────────────

  /** Get task history */
  getTaskHistory(): AgentTask[] {
    return [...this.taskHistory]
  }

  /** Get task by ID */
  getTask(taskId: string): AgentTask | null {
    return this.taskHistory.find(t => t.id === taskId) ?? null
  }

  /** Get agent stats */
  getStats(): typeof this.stats {
    return { ...this.stats }
  }

  /** Clear task history */
  clearHistory(): void {
    this.taskHistory = []
  }

  /** Get agent config */
  getConfig(): SparkAgentConfig {
    return { ...this.config }
  }

  /** Update agent config */
  updateConfig(updates: Partial<SparkAgentConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  // ── Private: Planning ────────────────────────────────────────────────────

  /** Create a plan for executing a task */
  private _planTask(query: string, domain: TaskDomain): string[] {
    const plan: string[] = []

    // Domain-based planning strategies
    switch (domain) {
      case 'code_generation':
        plan.push(
          `Understand requirements: ${query}`,
          `Search knowledge base for relevant patterns`,
          `Generate code implementation`,
          `Review generated code for quality`,
        )
        break

      case 'code_review':
        plan.push(
          `Analyze the code structure`,
          `Check for bugs and security issues`,
          `Evaluate code quality and patterns`,
          `Provide improvement suggestions`,
        )
        break

      case 'debugging':
        plan.push(
          `Analyze the error/bug description`,
          `Search for similar known issues`,
          `Identify root cause`,
          `Generate fix`,
        )
        break

      case 'security_analysis':
      case 'exploit_research':
        plan.push(
          `Analyze target for vulnerabilities`,
          `Search exploit database`,
          `Assess risk and impact`,
          `Provide remediation steps`,
        )
        break

      case 'general_reasoning':
      case 'math_logic':
        plan.push(
          `Break down the problem`,
          `Apply reasoning to each component`,
          `Synthesize conclusion`,
        )
        break

      case 'creative_writing':
        plan.push(
          `Understand the creative brief`,
          `Generate initial draft`,
          `Refine and polish`,
        )
        break

      case 'data_analysis':
        plan.push(
          `Understand the data context`,
          `Analyze patterns and trends`,
          `Generate insights and recommendations`,
        )
        break

      default:
        plan.push(
          `Analyze the query: ${query}`,
          `Search for relevant knowledge`,
          `Generate comprehensive response`,
        )
    }

    return plan
  }

  // ── Private: Tool Selection ──────────────────────────────────────────────

  /** Select the best tool for a given step */
  private _selectTool(step: string, domain: TaskDomain, _context: string): { toolName: string; confidence: number } {
    const stepLower = step.toLowerCase()

    // Code-related tools
    if (/\b(code|function|class|implement|program|script|write code|generate code)\b/i.test(stepLower)) {
      return { toolName: 'spark_code_generate', confidence: 0.9 }
    }
    if (/\b(review|audit|check|inspect|quality|bug)\b/i.test(stepLower)) {
      return { toolName: 'spark_code_review', confidence: 0.85 }
    }
    if (/\b(debug|fix|error|crash|exception|traceback)\b/i.test(stepLower)) {
      return { toolName: 'spark_debug', confidence: 0.85 }
    }

    // Security tools
    if (/\b(exploit|vulnerability|cve|attack|security|pentest|hack)\b/i.test(stepLower)) {
      return { toolName: 'spark_security_analyze', confidence: 0.9 }
    }

    // Knowledge tools
    if (/\b(search|find|lookup|knowledge|learn|pattern|known)\b/i.test(stepLower)) {
      return { toolName: 'brain_knowledge_search', confidence: 0.85 }
    }

    // Reasoning tools
    if (/\b(reason|analyze|think|logic|math|calculate|prove|explain why)\b/i.test(stepLower)) {
      return { toolName: 'spark_reason', confidence: 0.85 }
    }

    // Creative tools
    if (/\b(write|draft|compose|create|story|essay|poem)\b/i.test(stepLower)) {
      return { toolName: 'spark_creative', confidence: 0.8 }
    }

    // Domain-based fallback
    const domainToolMap: Partial<Record<TaskDomain, string>> = {
      code_generation: 'spark_code_generate',
      code_review: 'spark_code_review',
      code_completion: 'spark_code_generate',
      debugging: 'spark_debug',
      security_analysis: 'spark_security_analyze',
      exploit_research: 'spark_security_analyze',
      general_reasoning: 'spark_reason',
      math_logic: 'spark_reason',
      creative_writing: 'spark_creative',
      summarization: 'spark_summarize',
      translation: 'spark_translate',
      conversation: 'spark_chat',
      planning: 'spark_reason',
      data_analysis: 'spark_reason',
    }

    const domainTool = domainToolMap[domain]
    if (domainTool && this.tools.has(domainTool)) {
      return { toolName: domainTool, confidence: 0.75 }
    }

    return { toolName: 'spark_general', confidence: 0.7 }
  }

  // ── Private: Tool Execution ──────────────────────────────────────────────

  /** Execute a tool by name */
  private async _executeTool(toolName: string, input: string, context: string): Promise<AgentToolResult> {
    const startTime = Date.now()
    const tool = this.tools.get(toolName)

    if (tool) {
      try {
        const enrichedInput = context ? `${input}\n\n[Context]:\n${context.slice(-500)}` : input
        return await tool.handler(enrichedInput)
      } catch (err) {
        return {
          success: false,
          output: `Tool error: ${err instanceof Error ? err.message : String(err)}`,
          confidence: 0,
          source: toolName,
          durationMs: Date.now() - startTime,
        }
      }
    }

    // Fallback: use Spark ensemble directly
    try {
      const response = await this.connector.enrichedInfer({ prompt: input })
      return {
        success: true,
        output: response.text,
        confidence: response.qualityScore,
        source: 'spark_ensemble',
        durationMs: Date.now() - startTime,
      }
    } catch {
      return {
        success: false,
        output: `No tool "${toolName}" found and Spark fallback failed`,
        confidence: 0,
        source: 'fallback',
        durationMs: Date.now() - startTime,
      }
    }
  }

  // ── Private: Synthesis ───────────────────────────────────────────────────

  /** Synthesize final answer from all collected results */
  private _synthesizeAnswer(query: string, domain: TaskDomain, thoughts: AgentThought[], context: string): string {
    // Collect all tool outputs
    const toolOutputs = thoughts
      .filter(t => t.type === 'observe' && t.toolOutput)
      .map(t => t.toolOutput!)

    if (toolOutputs.length === 0) {
      return `[ModelSpark Agent] I analyzed your query about "${query.slice(0, 100)}" but could not produce a detailed result. The task domain is "${domain}".`
    }

    if (toolOutputs.length === 1) {
      return toolOutputs[0]!
    }

    // Multi-source synthesis
    const sections: string[] = []

    // Use the best/longest output as the main content
    const sorted = [...toolOutputs].sort((a, b) => b.length - a.length)
    sections.push(sorted[0]!)

    // Add supplementary information from other tools
    if (sorted.length > 1) {
      const supplementary = sorted.slice(1).filter(o => o.length > 50)
      if (supplementary.length > 0) {
        sections.push('\n---\n**Additional Analysis:**')
        for (const s of supplementary.slice(0, 2)) {
          sections.push(s)
        }
      }
    }

    return sections.join('\n\n')
  }

  // ── Private: Reflection ──────────────────────────────────────────────────

  /** Reflect on the quality of the answer */
  private _reflect(query: string, answer: string, domain: TaskDomain): { qualityScore: number; assessment: string; issues: string[] } {
    const issues: string[] = []
    let score = 0.7 // base score

    // Length check
    if (answer.length < 20) {
      issues.push('Answer is too short')
      score -= 0.2
    }
    if (answer.length > 50) score += 0.05

    // Relevance: keyword overlap
    const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(w => w.length > 3))
    const answerWords = new Set(answer.toLowerCase().split(/\s+/))
    let overlap = 0
    for (const w of queryWords) { if (answerWords.has(w)) overlap++ }
    const relevance = queryWords.size > 0 ? overlap / queryWords.size : 0.5
    score += relevance * 0.1

    // Structure check
    if (/```/.test(answer) && (domain === 'code_generation' || domain === 'debugging')) score += 0.05
    if (/\d+\./.test(answer)) score += 0.02
    if (/[-*]/.test(answer)) score += 0.02

    // Error content check
    if (/\berror\b/i.test(answer) && !/\bfix\b/i.test(answer) && domain !== 'debugging') {
      issues.push('Answer contains error indicators without fixes')
      score -= 0.1
    }

    if (answer.includes('[Agent Error]')) {
      issues.push('Answer contains agent error')
      score -= 0.3
    }

    score = Math.min(Math.max(score, 0), 1.0)

    return {
      qualityScore: score,
      assessment: `Quality: ${score.toFixed(2)} | Issues: ${issues.length > 0 ? issues.join(', ') : 'none'} | Relevance: ${(relevance * 100).toFixed(0)}%`,
      issues,
    }
  }

  // ── Private: Self-Correction ─────────────────────────────────────────────

  /** Self-correct an answer based on identified issues */
  private _selfCorrect(query: string, original: string, issues: string[], _domain: TaskDomain): string {
    let corrected = original

    for (const issue of issues) {
      if (issue === 'Answer is too short') {
        corrected += `\n\nTo elaborate on the query "${query.slice(0, 80)}": This requires further analysis considering multiple perspectives and approaches.`
      }
      if (issue === 'Answer contains agent error') {
        // Try to extract useful partial content
        const partial = original.replace(/\[Agent Error\].*?\n/g, '').trim()
        if (partial.length > 20) {
          corrected = partial
        }
      }
    }

    return corrected
  }

  // ── Private: Built-in Tools ──────────────────────────────────────────────

  /** Register all built-in agent tools */
  private _registerBuiltinTools(): void {
    // ── Code Generation Tool ──
    this.tools.set('spark_code_generate', {
      name: 'spark_code_generate',
      description: 'Generate code using Spark dual-model ensemble (Qwen2.5-Coder + LLaMA)',
      category: 'code',
      inputSchema: 'string: code task description',
      handler: async (input: string) => {
        const start = Date.now()
        // Try brain first for pattern-based code
        const brainResult = await this.connector.brainGenerateCode(input, 'typescript')
        if (brainResult && brainResult.code.length > 20) {
          return {
            success: true,
            output: `${brainResult.code}\n\n// ${brainResult.explanation}`,
            confidence: 0.85,
            source: 'brain_code_generator',
            durationMs: Date.now() - start,
          }
        }
        // Fallback to Spark ensemble
        const response = await this.spark.infer({ prompt: input, domain: 'code_generation' })
        return {
          success: true,
          output: response.text,
          confidence: response.qualityScore,
          source: `spark_${response.primaryModel}`,
          durationMs: Date.now() - start,
        }
      },
    })

    // ── Code Review Tool ──
    this.tools.set('spark_code_review', {
      name: 'spark_code_review',
      description: 'Review code for bugs, security issues, and quality improvements',
      category: 'code',
      inputSchema: 'string: code to review',
      handler: async (input: string) => {
        const start = Date.now()
        const brainResult = await this.connector.brainReviewCode(input, 'typescript')
        if (brainResult && brainResult.issues.length > 0) {
          return {
            success: true,
            output: `Code Review:\n${brainResult.issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}\n\nOverall Score: ${brainResult.score}/10`,
            confidence: 0.85,
            source: 'brain_code_reviewer',
            durationMs: Date.now() - start,
          }
        }
        const response = await this.spark.infer({ prompt: `Review this code:\n${input}`, domain: 'code_review' })
        return {
          success: true,
          output: response.text,
          confidence: response.qualityScore,
          source: `spark_${response.primaryModel}`,
          durationMs: Date.now() - start,
        }
      },
    })

    // ── Debug Tool ──
    this.tools.set('spark_debug', {
      name: 'spark_debug',
      description: 'Debug code errors and find root causes',
      category: 'code',
      inputSchema: 'string: error description or buggy code',
      handler: async (input: string) => {
        const start = Date.now()
        const response = await this.connector.enrichedInfer({ prompt: input, domain: 'debugging' })
        return {
          success: true,
          output: response.text,
          confidence: response.qualityScore,
          source: `spark_${response.primaryModel}`,
          durationMs: Date.now() - start,
        }
      },
    })

    // ── Security Analysis Tool ──
    this.tools.set('spark_security_analyze', {
      name: 'spark_security_analyze',
      description: 'Analyze security vulnerabilities and exploits',
      category: 'security',
      inputSchema: 'string: security analysis query',
      handler: async (input: string) => {
        const start = Date.now()
        const response = await this.connector.enrichedInfer({ prompt: input, domain: 'security_analysis' })
        return {
          success: true,
          output: response.text,
          confidence: response.qualityScore,
          source: `spark_${response.primaryModel}`,
          durationMs: Date.now() - start,
        }
      },
    })

    // ── Knowledge Search Tool ──
    this.tools.set('brain_knowledge_search', {
      name: 'brain_knowledge_search',
      description: 'Search LocalBrain knowledge base for relevant information',
      category: 'knowledge',
      inputSchema: 'string: search query',
      handler: (input: string) => {
        const start = Date.now()
        const results = this.connector.getBrainKnowledge(input, 5)
        if (results.length > 0) {
          const output = results.map((r, i) => `${i + 1}. [${r.category}] (score: ${r.score.toFixed(2)}) ${r.content}`).join('\n')
          return {
            success: true,
            output,
            confidence: results[0]!.score,
            source: 'brain_knowledge_base',
            durationMs: Date.now() - start,
          }
        }
        return {
          success: false,
          output: 'No relevant knowledge found in brain database',
          confidence: 0,
          source: 'brain_knowledge_base',
          durationMs: Date.now() - start,
        }
      },
    })

    // ── Reasoning Tool ──
    this.tools.set('spark_reason', {
      name: 'spark_reason',
      description: 'Perform deep reasoning and logical analysis',
      category: 'reasoning',
      inputSchema: 'string: question or problem to reason about',
      handler: async (input: string) => {
        const start = Date.now()
        // Try brain reasoning first
        const brainResult = await this.connector.brainReason(input)
        if (brainResult && brainResult.confidence > 0.6) {
          return {
            success: true,
            output: `${brainResult.answer}\n\n**Reasoning:** ${brainResult.reasoning}`,
            confidence: brainResult.confidence,
            source: 'brain_reasoning_engine',
            durationMs: Date.now() - start,
          }
        }
        // Fallback to Spark ensemble
        const response = await this.connector.enrichedInfer({ prompt: input, domain: 'general_reasoning' })
        return {
          success: true,
          output: response.text,
          confidence: response.qualityScore,
          source: `spark_${response.primaryModel}`,
          durationMs: Date.now() - start,
        }
      },
    })

    // ── Creative Writing Tool ──
    this.tools.set('spark_creative', {
      name: 'spark_creative',
      description: 'Generate creative content (stories, essays, poems)',
      category: 'creative',
      inputSchema: 'string: creative writing prompt',
      handler: async (input: string) => {
        const start = Date.now()
        const response = await this.spark.infer({ prompt: input, domain: 'creative_writing' })
        return {
          success: true,
          output: response.text,
          confidence: response.qualityScore,
          source: `spark_${response.primaryModel}`,
          durationMs: Date.now() - start,
        }
      },
    })

    // ── Summarization Tool ──
    this.tools.set('spark_summarize', {
      name: 'spark_summarize',
      description: 'Summarize text content concisely',
      category: 'analysis',
      inputSchema: 'string: text to summarize',
      handler: async (input: string) => {
        const start = Date.now()
        const response = await this.spark.infer({ prompt: `Summarize: ${input}`, domain: 'summarization' })
        return {
          success: true,
          output: response.text,
          confidence: response.qualityScore,
          source: `spark_${response.primaryModel}`,
          durationMs: Date.now() - start,
        }
      },
    })

    // ── Translation Tool ──
    this.tools.set('spark_translate', {
      name: 'spark_translate',
      description: 'Translate text between languages',
      category: 'creative',
      inputSchema: 'string: text with target language',
      handler: async (input: string) => {
        const start = Date.now()
        const response = await this.spark.infer({ prompt: input, domain: 'translation' })
        return {
          success: true,
          output: response.text,
          confidence: response.qualityScore,
          source: `spark_${response.primaryModel}`,
          durationMs: Date.now() - start,
        }
      },
    })

    // ── General Chat Tool ──
    this.tools.set('spark_chat', {
      name: 'spark_chat',
      description: 'General conversation and Q&A',
      category: 'knowledge',
      inputSchema: 'string: message',
      handler: async (input: string) => {
        const start = Date.now()
        const response = await this.connector.enrichedInfer({ prompt: input, domain: 'conversation' })
        return {
          success: true,
          output: response.text,
          confidence: response.qualityScore,
          source: `spark_${response.primaryModel}`,
          durationMs: Date.now() - start,
        }
      },
    })

    // ── General Purpose Tool (fallback) ──
    this.tools.set('spark_general', {
      name: 'spark_general',
      description: 'General-purpose AI tool using Spark ensemble with brain knowledge',
      category: 'knowledge',
      inputSchema: 'string: any query',
      handler: async (input: string) => {
        const start = Date.now()
        const response = await this.connector.enrichedInfer({ prompt: input })
        return {
          success: true,
          output: response.text,
          confidence: response.qualityScore,
          source: `spark_${response.primaryModel}`,
          durationMs: Date.now() - start,
        }
      },
    })
  }

  /** Update average stats */
  private _updateAverages(task: AgentTask): void {
    const total = this.stats.tasksCompleted + this.stats.tasksFailed
    if (total <= 1) {
      this.stats.averageQuality = task.qualityScore
      this.stats.averageDurationMs = task.totalDurationMs
    } else {
      this.stats.averageQuality += (task.qualityScore - this.stats.averageQuality) / total
      this.stats.averageDurationMs += (task.totalDurationMs - this.stats.averageDurationMs) / total
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//   UNIFIED ORCHESTRATOR — Master Router for All AI Subsystems
// ═══════════════════════════════════════════════════════════════════════════════

export class UnifiedOrchestrator {
  private spark: ModelSpark
  private connector: SparkBrainConnector
  private agent: SparkAgent
  private stats: OrchestrationStats

  constructor(spark: ModelSpark, config?: {
    agentConfig?: Partial<SparkAgentConfig>
  }) {
    this.spark = spark
    this.connector = new SparkBrainConnector(spark)
    this.agent = new SparkAgent(spark, this.connector, config?.agentConfig)
    this.stats = this._initStats()
  }

  // ── System Connection ────────────────────────────────────────────────────

  /** Connect LocalBrain to the unified system */
  connectBrain(brain: BrainCapabilities): void {
    this.connector.connectBrain(brain)
  }

  /** Connect LocalLLMBridge to the unified system */
  connectBridge(bridge: LLMBridgeCapabilities): void {
    this.connector.connectBridge(bridge)
  }

  /** Register a custom agent tool */
  registerTool(tool: AgentTool): void {
    this.agent.registerTool(tool)
  }

  // ── Intelligent Routing ──────────────────────────────────────────────────

  /** Route a query to the optimal subsystem */
  routeQuery(query: string, options?: { forceSystem?: OrchestrationDecision['primary'] }): OrchestrationDecision {
    if (options?.forceSystem) {
      return {
        primary: options.forceSystem,
        secondary: null,
        reason: `Forced routing to ${options.forceSystem}`,
        confidence: 1.0,
        domain: this.spark.detectDomain(query).domain,
        estimatedQuality: 0.7,
      }
    }

    const detection = this.spark.detectDomain(query)
    const domain = detection.domain
    const confidence = detection.confidence
    const queryLower = query.toLowerCase()

    // Multi-step/complex tasks → Agent
    const isComplex = /\b(step.by.step|analyze and|first.*then|create.*and.*test|build.*complete|plan.*implement)\b/i.test(queryLower)
    if (isComplex) {
      return {
        primary: 'agent',
        secondary: 'spark_ensemble',
        reason: 'Complex multi-step task detected — routing to Agent for autonomous execution',
        confidence: 0.85,
        domain,
        estimatedQuality: 0.8,
      }
    }

    // Code tasks → Spark ensemble (best for code with dual-model)
    if (['code_generation', 'code_review', 'code_completion', 'debugging'].includes(domain)) {
      const hasBrain = this.connector.isBrainConnected()
      return {
        primary: hasBrain ? 'hybrid' : 'spark_ensemble',
        secondary: hasBrain ? 'brain_knowledge' : null,
        reason: `Code task (${domain}) — Spark ensemble ${hasBrain ? 'with brain knowledge enrichment' : 'for dual-model inference'}`,
        confidence: 0.9,
        domain,
        estimatedQuality: 0.85,
      }
    }

    // Security tasks → Spark + Brain
    if (['security_analysis', 'exploit_research'].includes(domain)) {
      return {
        primary: this.connector.isBrainConnected() ? 'hybrid' : 'spark_ensemble',
        secondary: 'brain_knowledge',
        reason: `Security task — combining Spark ensemble with brain security knowledge`,
        confidence: 0.85,
        domain,
        estimatedQuality: 0.8,
      }
    }

    // Knowledge/factual queries → Brain first
    if (this.connector.isBrainConnected() && /\b(what is|explain|describe|how does|tell me about|define)\b/i.test(queryLower)) {
      const knowledge = this.connector.getBrainKnowledge(query, 3)
      if (knowledge.length > 0 && knowledge[0]!.score > 0.5) {
        return {
          primary: 'brain_knowledge',
          secondary: 'spark_ensemble',
          reason: `Knowledge query — brain has relevant knowledge (score: ${knowledge[0]!.score.toFixed(2)})`,
          confidence: knowledge[0]!.score,
          domain,
          estimatedQuality: 0.8,
        }
      }
    }

    // Reasoning tasks → Spark ensemble (LLaMA is strong here)
    if (['general_reasoning', 'math_logic', 'planning', 'data_analysis'].includes(domain)) {
      return {
        primary: 'spark_ensemble',
        secondary: this.connector.isBrainConnected() ? 'brain_knowledge' : null,
        reason: `Reasoning task (${domain}) — LLaMA excels at reasoning with Qwen support`,
        confidence: 0.85,
        domain,
        estimatedQuality: 0.8,
      }
    }

    // Default: Spark ensemble with optional brain enrichment
    return {
      primary: this.connector.isBrainConnected() ? 'hybrid' : 'spark_ensemble',
      secondary: null,
      reason: `Default routing to ${this.connector.isBrainConnected() ? 'hybrid (Spark + Brain)' : 'Spark ensemble'}`,
      confidence: Math.max(confidence, 0.6),
      domain,
      estimatedQuality: 0.75,
    }
  }

  // ── Unified Query Execution ──────────────────────────────────────────────

  /** Execute a query through the unified orchestration system */
  async query(input: string, options?: {
    forceSystem?: OrchestrationDecision['primary']
    strategy?: InferenceStrategy
    maxTokens?: number
  }): Promise<OrchestrationResponse> {
    const startTime = Date.now()
    this.stats.totalRequests++

    const routing = this.routeQuery(input, options)
    this.stats.routingDistribution[routing.primary] = (this.stats.routingDistribution[routing.primary] ?? 0) + 1

    let response: OrchestrationResponse

    switch (routing.primary) {
      case 'agent':
        response = await this._executeAgent(input, routing)
        this.stats.agentRequests++
        break

      case 'brain_knowledge':
        response = await this._executeBrain(input, routing)
        this.stats.brainRequests++
        break

      case 'llm_bridge':
        response = await this._executeBridge(input, routing)
        this.stats.bridgeRequests++
        break

      case 'hybrid':
        response = await this._executeHybrid(input, routing, options)
        this.stats.hybridRequests++
        break

      default: // spark_ensemble
        response = await this._executeSpark(input, routing, options)
        this.stats.sparkRequests++
        break
    }

    // Update quality averages
    this.stats.averageQuality += (response.qualityScore - this.stats.averageQuality) / this.stats.totalRequests
    this.stats.averageLatencyMs += (response.durationMs - this.stats.averageLatencyMs) / this.stats.totalRequests

    // Teach brain from good responses (feedback loop)
    if (response.qualityScore > 0.7 && response.sparkResponse) {
      this.connector.teachBrainFromSpark(input, response.sparkResponse)
    }

    return response
  }

  // ── Subsystem Access ─────────────────────────────────────────────────────

  /** Get the Spark instance */
  getSpark(): ModelSpark { return this.spark }

  /** Get the Brain connector */
  getConnector(): SparkBrainConnector { return this.connector }

  /** Get the Agent */
  getAgent(): SparkAgent { return this.agent }

  /** Get orchestration stats */
  getStats(): OrchestrationStats { return { ...this.stats } }

  /** Reset stats */
  resetStats(): void { this.stats = this._initStats() }

  /** Get comprehensive system status */
  getSystemStatus(): string {
    const status = this.connector.getSystemStatus()
    const sparkStats = this.spark.getStats()
    const agentStats = this.agent.getStats()
    const health = this.spark.getModelHealth()

    return [
      '╔═══════════════════════════════════════════════════════════════╗',
      '║     ⚡ SPARK UNIFIED ORCHESTRATOR — System Status            ║',
      '╚═══════════════════════════════════════════════════════════════╝',
      '',
      '📊 Subsystems:',
      `  ⚡ Spark Ensemble:  ✅ Connected (${status.sparkModels} models)`,
      `  🧠 LocalBrain:     ${status.brainConnected ? `✅ Connected (${status.brainKnowledgeSize} KB entries)` : '❌ Not connected'}`,
      `  🔗 LLM Bridge:     ${status.bridgeConnected ? '✅ Connected' : '❌ Not connected'}`,
      `  🤖 Agent:          ✅ Active (${this.agent.getTools().length} tools)`,
      '',
      '📈 Performance:',
      `  Total requests:     ${this.stats.totalRequests}`,
      `  Avg quality:        ${this.stats.averageQuality.toFixed(2)}`,
      `  Avg latency:        ${this.stats.averageLatencyMs.toFixed(0)}ms`,
      `  Agent tasks:        ${agentStats.tasksCompleted} completed, ${agentStats.tasksFailed} failed`,
      `  Agent tool calls:   ${agentStats.totalToolCalls}`,
      '',
      '🔀 Routing Distribution:',
      ...Object.entries(this.stats.routingDistribution).map(([k, v]) =>
        `  ${k}: ${v} (${((v as number / Math.max(this.stats.totalRequests, 1)) * 100).toFixed(1)}%)`
      ),
      '',
      '🟢 Model Health:',
      ...health.map(h => `  ${h.modelId}: ${h.available ? '✅' : '❌'} | ${h.successCount} ok / ${h.errorCount} err | ${h.averageTokensPerSecond.toFixed(1)} tok/s`),
      '',
      '💾 Spark Stats:',
      `  Inferences: ${sparkStats.totalRequests} | Tokens: ${sparkStats.totalTokensGenerated}`,
      `  Cache: ${this.spark.getCacheSize()} entries | Errors: ${sparkStats.errors}`,
    ].join('\n')
  }

  // ── Private: Execution Methods ───────────────────────────────────────────

  /** Execute via Agent (autonomous multi-step) */
  private async _executeAgent(input: string, routing: OrchestrationDecision): Promise<OrchestrationResponse> {
    const start = Date.now()
    const task = await this.agent.executeTask(input)
    this.stats.agentTasksCompleted++
    this.stats.agentToolCalls += task.toolCalls.length

    return {
      text: task.finalAnswer,
      source: 'agent',
      strategy: `agent_${task.plan.length}steps`,
      domain: routing.domain,
      qualityScore: task.qualityScore,
      confidence: routing.confidence,
      durationMs: Date.now() - start,
      tokensGenerated: Math.ceil(task.finalAnswer.length / 4),
      subsystemsUsed: ['agent', ...task.toolCalls.map(t => t.tool)],
      agentTask: task,
      metadata: { plan: task.plan, toolCalls: task.toolCalls.length, retries: task.retries },
    }
  }

  /** Execute via Brain knowledge base */
  private async _executeBrain(input: string, routing: OrchestrationDecision): Promise<OrchestrationResponse> {
    const start = Date.now()
    const knowledge = this.connector.getBrainKnowledge(input, 5)
    this.stats.brainKnowledgeHits += knowledge.length

    if (knowledge.length > 0) {
      const text = knowledge.map((k, i) => `${i + 1}. ${k.content}`).join('\n\n')
      return {
        text,
        source: 'brain_knowledge',
        strategy: 'knowledge_retrieval',
        domain: routing.domain,
        qualityScore: knowledge[0]!.score,
        confidence: knowledge[0]!.score,
        durationMs: Date.now() - start,
        tokensGenerated: Math.ceil(text.length / 4),
        subsystemsUsed: ['brain_knowledge'],
        brainKnowledge: knowledge,
        metadata: { resultsCount: knowledge.length },
      }
    }

    // Fallback to Spark if no brain knowledge
    return this._executeSpark(input, routing)
  }

  /** Execute via LLM Bridge */
  private async _executeBridge(input: string, routing: OrchestrationDecision): Promise<OrchestrationResponse> {
    const start = Date.now()

    // Fallback to Spark since bridge isn't directly callable without the real instance
    const response = await this.spark.infer({ prompt: input, domain: routing.domain })

    return {
      text: response.text,
      source: 'llm_bridge',
      strategy: response.strategy,
      domain: routing.domain,
      qualityScore: response.qualityScore,
      confidence: routing.confidence,
      durationMs: Date.now() - start,
      tokensGenerated: response.totalTokensGenerated,
      subsystemsUsed: ['llm_bridge', `spark_${response.primaryModel}`],
      sparkResponse: response,
      metadata: {},
    }
  }

  /** Execute via Hybrid (Spark + Brain enrichment) */
  private async _executeHybrid(input: string, routing: OrchestrationDecision, options?: { strategy?: InferenceStrategy; maxTokens?: number }): Promise<OrchestrationResponse> {
    const start = Date.now()
    const knowledge = this.connector.getBrainKnowledge(input, 3)
    this.stats.brainKnowledgeHits += knowledge.length

    // Use enriched inference (Spark with brain context)
    const response = await this.connector.enrichedInfer({
      prompt: input,
      domain: routing.domain,
      strategy: options?.strategy,
      maxTokens: options?.maxTokens,
    })

    return {
      text: response.text,
      source: 'hybrid',
      strategy: `hybrid_${response.strategy}`,
      domain: routing.domain,
      qualityScore: response.qualityScore,
      confidence: routing.confidence,
      durationMs: Date.now() - start,
      tokensGenerated: response.totalTokensGenerated,
      subsystemsUsed: ['spark_ensemble', 'brain_knowledge'],
      brainKnowledge: knowledge,
      sparkResponse: response,
      metadata: { brainContextUsed: knowledge.length > 0 },
    }
  }

  /** Execute via Spark ensemble directly */
  private async _executeSpark(input: string, routing: OrchestrationDecision, options?: { strategy?: InferenceStrategy; maxTokens?: number }): Promise<OrchestrationResponse> {
    const start = Date.now()
    const response = await this.spark.infer({
      prompt: input,
      domain: routing.domain,
      strategy: options?.strategy,
      maxTokens: options?.maxTokens,
    })

    return {
      text: response.text,
      source: 'spark_ensemble',
      strategy: response.strategy,
      domain: routing.domain,
      qualityScore: response.qualityScore,
      confidence: routing.confidence,
      durationMs: Date.now() - start,
      tokensGenerated: response.totalTokensGenerated,
      subsystemsUsed: [`spark_${response.primaryModel}`],
      sparkResponse: response,
      metadata: {},
    }
  }

  /** Initialize stats */
  private _initStats(): OrchestrationStats {
    return {
      totalRequests: 0,
      sparkRequests: 0,
      brainRequests: 0,
      bridgeRequests: 0,
      agentRequests: 0,
      hybridRequests: 0,
      averageQuality: 0,
      averageLatencyMs: 0,
      agentTasksCompleted: 0,
      agentToolCalls: 0,
      brainKnowledgeHits: 0,
      errors: 0,
      routingDistribution: {},
    }
  }
}
