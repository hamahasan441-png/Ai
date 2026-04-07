/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LLM Provider — Type Definitions                                              ║
 * ║                                                                              ║
 * ║  Unified type system for multi-model LLM interaction:                        ║
 * ║    • Provider & model descriptors                                            ║
 * ║    • Request/response types with usage tracking                              ║
 * ║    • Streaming chunk types                                                   ║
 * ║    • Capability enums for feature negotiation                                ║
 * ║    • Model routing configuration                                             ║
 * ║                                                                              ║
 * ║  Usage:                                                                      ║
 * ║    import { LLMRequest, LLMResponse, LLMCapability } from './types.js'       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Capabilities ──

export enum LLMCapability {
  CHAT = 'chat',
  STREAMING = 'streaming',
  FUNCTION_CALLING = 'function_calling',
  VISION = 'vision',
  EMBEDDINGS = 'embeddings',
  CODE_GENERATION = 'code_generation',
}

// ── Provider & Model ──

export interface LLMProvider {
  /** Unique provider identifier (e.g. 'anthropic', 'openai', 'ollama') */
  name: string
  /** Models offered by this provider */
  models: LLMModel[]
  /** Capabilities shared across all provider models */
  capabilities: LLMCapability[]
}

export interface LLMModel {
  /** Unique model identifier (e.g. 'claude-3-5-haiku-20241022') */
  id: string
  /** Human-readable model name */
  name: string
  /** Provider that hosts this model */
  provider: string
  /** Maximum input context window in tokens */
  contextWindow: number
  /** Maximum output tokens the model can generate */
  maxOutputTokens: number
  /** Cost per 1 000 input tokens (USD) */
  costPer1kInput: number
  /** Cost per 1 000 output tokens (USD) */
  costPer1kOutput: number
  /** Model-specific capabilities */
  capabilities: LLMCapability[]
}

// ── Messages ──

export type LLMMessageRole = 'system' | 'user' | 'assistant'

export interface LLMMessage {
  role: LLMMessageRole
  content: string
}

// ── Request / Response ──

export interface LLMRequest {
  /** Model ID to use for this request */
  model: string
  /** Conversation messages */
  messages: LLMMessage[]
  /** Sampling temperature (0–2, default provider-specific) */
  temperature?: number
  /** Maximum tokens to generate */
  maxTokens?: number
  /** Stop sequences that halt generation */
  stopSequences?: string[]
  /** System prompt prepended to the conversation */
  systemPrompt?: string
}

export interface LLMUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface LLMResponse {
  /** Generated text content */
  content: string
  /** Model that produced the response */
  model: string
  /** Token usage statistics */
  usage: LLMUsage
  /** Reason generation stopped */
  finishReason: 'stop' | 'length' | 'content_filter' | 'error'
  /** End-to-end latency in milliseconds */
  latencyMs: number
}

// ── Streaming ──

export interface LLMStreamChunk {
  /** Incremental text content */
  content: string
  /** Whether this is the final chunk */
  done: boolean
  /** Partial usage stats (populated on final chunk) */
  usage?: Partial<LLMUsage>
}

// ── Routing ──

export interface ModelRoutingConfig {
  /** Model ID to use for inexpensive / high-volume tasks */
  cheapModel: string
  /** Model ID to use for complex / high-quality tasks */
  powerfulModel: string
  /** Optional custom router that selects a model ID for a given request */
  router?: (request: LLMRequest) => string
}
