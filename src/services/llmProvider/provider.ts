/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LLM Provider — Abstract Base & Concrete Providers                            ║
 * ║                                                                              ║
 * ║  Unified provider abstraction with:                                          ║
 * ║    • Request validation & metrics tracking                                   ║
 * ║    • Retry wrapping via RetryPolicy                                          ║
 * ║    • Anthropic, OpenAI, and Ollama provider stubs                            ║
 * ║                                                                              ║
 * ║  All concrete providers are type-safe stubs — actual API calls throw         ║
 * ║  ServiceError with "not configured" messages.                                ║
 * ║                                                                              ║
 * ║  Usage:                                                                      ║
 * ║    const provider = new AnthropicProvider()                                  ║
 * ║    const models = provider.listModels()                                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { ServiceError, AiErrorCode } from '../../utils/errors.js'
import { RetryPolicy } from '../apiRetry.js'
import type {
  LLMModel,
  LLMRequest,
  LLMResponse,
  LLMStreamChunk,
  LLMCapability,
} from './types.js'
import { LLMCapability as Cap } from './types.js'

// ── Validation helpers ──

function validateRequest(request: LLMRequest): void {
  if (!request.model || typeof request.model !== 'string') {
    throw new ServiceError('llm', 'Request must include a valid model ID', AiErrorCode.INVALID_INPUT, { field: 'model' })
  }
  if (!Array.isArray(request.messages) || request.messages.length === 0) {
    throw new ServiceError('llm', 'Request must include at least one message', AiErrorCode.INVALID_INPUT, { field: 'messages' })
  }
  for (const msg of request.messages) {
    if (!['system', 'user', 'assistant'].includes(msg.role)) {
      throw new ServiceError('llm', `Invalid message role: ${msg.role}`, AiErrorCode.INVALID_INPUT, { role: msg.role })
    }
    if (typeof msg.content !== 'string') {
      throw new ServiceError('llm', 'Message content must be a string', AiErrorCode.INVALID_INPUT)
    }
  }
  if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
    throw new ServiceError('llm', 'Temperature must be between 0 and 2', AiErrorCode.INVALID_INPUT, { temperature: request.temperature })
  }
  if (request.maxTokens !== undefined && request.maxTokens <= 0) {
    throw new ServiceError('llm', 'maxTokens must be a positive integer', AiErrorCode.INVALID_INPUT, { maxTokens: request.maxTokens })
  }
}

// ── Abstract Base Provider ──

export abstract class BaseLLMProvider {
  abstract readonly name: string
  abstract readonly capabilities: LLMCapability[]

  protected retryPolicy: RetryPolicy

  constructor(retryConfig?: { maxRetries?: number; baseDelayMs?: number }) {
    this.retryPolicy = new RetryPolicy({
      maxRetries: retryConfig?.maxRetries ?? 2,
      baseDelayMs: retryConfig?.baseDelayMs ?? 500,
    })
  }

  /** List all models offered by this provider. */
  abstract listModels(): LLMModel[]

  /** Check whether the provider is reachable / configured. */
  abstract isAvailable(): Promise<boolean>

  /** Provider-specific completion implementation. */
  protected abstract doComplete(request: LLMRequest): Promise<LLMResponse>

  /** Provider-specific streaming implementation. */
  protected abstract doStream(request: LLMRequest): AsyncGenerator<LLMStreamChunk>

  /**
   * Run a chat completion request with validation, retry, and metrics.
   */
  async complete(request: LLMRequest): Promise<LLMResponse> {
    validateRequest(request)
    const start = Date.now()
    const result = await this.retryPolicy.execute(() => this.doComplete(request))
    const response = result.data
    response.latencyMs = Date.now() - start
    return response
  }

  /**
   * Stream a chat completion with validation.
   */
  async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    validateRequest(request)
    yield* this.doStream(request)
  }

  /** Estimate the cost (USD) for a given token usage. */
  estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const model = this.listModels().find((m) => m.id === modelId)
    if (!model) return 0
    return (inputTokens / 1000) * model.costPer1kInput + (outputTokens / 1000) * model.costPer1kOutput
  }
}

// ── Anthropic Provider ──

const ANTHROPIC_MODELS: LLMModel[] = [
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    costPer1kInput: 0.001,
    costPer1kOutput: 0.005,
    capabilities: [Cap.CHAT, Cap.STREAMING, Cap.CODE_GENERATION],
  },
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    contextWindow: 200_000,
    maxOutputTokens: 16_384,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    capabilities: [Cap.CHAT, Cap.STREAMING, Cap.FUNCTION_CALLING, Cap.VISION, Cap.CODE_GENERATION],
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    contextWindow: 200_000,
    maxOutputTokens: 32_768,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
    capabilities: [Cap.CHAT, Cap.STREAMING, Cap.FUNCTION_CALLING, Cap.VISION, Cap.CODE_GENERATION],
  },
]

export class AnthropicProvider extends BaseLLMProvider {
  readonly name = 'anthropic'
  readonly capabilities: LLMCapability[] = [Cap.CHAT, Cap.STREAMING, Cap.FUNCTION_CALLING, Cap.VISION, Cap.CODE_GENERATION]

  listModels(): LLMModel[] {
    return [...ANTHROPIC_MODELS]
  }

  async isAvailable(): Promise<boolean> {
    return false
  }

  protected async doComplete(_request: LLMRequest): Promise<LLMResponse> {
    throw new ServiceError('anthropic', 'Anthropic API is not configured — set ANTHROPIC_API_KEY', AiErrorCode.SERVICE_UNAVAILABLE)
  }

  protected async *doStream(_request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    // yield required for valid generator; unreachable after throw
    throw new ServiceError('anthropic', 'Anthropic API is not configured — set ANTHROPIC_API_KEY', AiErrorCode.SERVICE_UNAVAILABLE)
    yield // unreachable — satisfies generator contract
  }
}

// ── OpenAI Provider ──

const OPENAI_MODELS: LLMModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    capabilities: [Cap.CHAT, Cap.STREAMING, Cap.FUNCTION_CALLING, Cap.VISION],
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
    capabilities: [Cap.CHAT, Cap.STREAMING, Cap.FUNCTION_CALLING, Cap.VISION, Cap.CODE_GENERATION],
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextWindow: 128_000,
    maxOutputTokens: 4_096,
    costPer1kInput: 0.01,
    costPer1kOutput: 0.03,
    capabilities: [Cap.CHAT, Cap.STREAMING, Cap.FUNCTION_CALLING, Cap.VISION, Cap.CODE_GENERATION],
  },
]

export class OpenAIProvider extends BaseLLMProvider {
  readonly name = 'openai'
  readonly capabilities: LLMCapability[] = [Cap.CHAT, Cap.STREAMING, Cap.FUNCTION_CALLING, Cap.VISION, Cap.CODE_GENERATION]

  listModels(): LLMModel[] {
    return [...OPENAI_MODELS]
  }

  async isAvailable(): Promise<boolean> {
    return false
  }

  protected async doComplete(_request: LLMRequest): Promise<LLMResponse> {
    throw new ServiceError('openai', 'OpenAI API is not configured — set OPENAI_API_KEY', AiErrorCode.SERVICE_UNAVAILABLE)
  }

  protected async *doStream(_request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    throw new ServiceError('openai', 'OpenAI API is not configured — set OPENAI_API_KEY', AiErrorCode.SERVICE_UNAVAILABLE)
    yield // unreachable — satisfies generator contract
  }
}

// ── Ollama Provider ──

const DEFAULT_OLLAMA_HOST = 'http://localhost:11434'

const OLLAMA_MODELS: LLMModel[] = [
  {
    id: 'llama3',
    name: 'Llama 3',
    provider: 'ollama',
    contextWindow: 8_192,
    maxOutputTokens: 4_096,
    costPer1kInput: 0,
    costPer1kOutput: 0,
    capabilities: [Cap.CHAT, Cap.STREAMING, Cap.CODE_GENERATION],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    provider: 'ollama',
    contextWindow: 32_768,
    maxOutputTokens: 8_192,
    costPer1kInput: 0,
    costPer1kOutput: 0,
    capabilities: [Cap.CHAT, Cap.STREAMING],
  },
  {
    id: 'codellama',
    name: 'Code Llama',
    provider: 'ollama',
    contextWindow: 16_384,
    maxOutputTokens: 4_096,
    costPer1kInput: 0,
    costPer1kOutput: 0,
    capabilities: [Cap.CHAT, Cap.STREAMING, Cap.CODE_GENERATION],
  },
]

export class OllamaProvider extends BaseLLMProvider {
  readonly name = 'ollama'
  readonly capabilities: LLMCapability[] = [Cap.CHAT, Cap.STREAMING, Cap.CODE_GENERATION]
  readonly host: string

  constructor(options?: { host?: string; maxRetries?: number; baseDelayMs?: number }) {
    super({ maxRetries: options?.maxRetries, baseDelayMs: options?.baseDelayMs })
    this.host = options?.host ?? DEFAULT_OLLAMA_HOST
  }

  listModels(): LLMModel[] {
    return [...OLLAMA_MODELS]
  }

  async isAvailable(): Promise<boolean> {
    return false
  }

  protected async doComplete(_request: LLMRequest): Promise<LLMResponse> {
    throw new ServiceError('ollama', `Ollama is not reachable at ${this.host}`, AiErrorCode.SERVICE_UNAVAILABLE)
  }

  protected async *doStream(_request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    throw new ServiceError('ollama', `Ollama is not reachable at ${this.host}`, AiErrorCode.SERVICE_UNAVAILABLE)
    yield // unreachable — satisfies generator contract
  }
}
