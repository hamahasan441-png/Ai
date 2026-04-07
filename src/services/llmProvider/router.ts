/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LLM Provider — Model Router                                                  ║
 * ║                                                                              ║
 * ║  Intelligent request routing across multiple LLM providers:                  ║
 * ║    • Task-based model selection (cheap vs powerful)                           ║
 * ║    • Automatic fallback when primary provider is unavailable                  ║
 * ║    • Cost estimation for any model                                           ║
 * ║    • Aggregated model listing                                                ║
 * ║                                                                              ║
 * ║  Usage:                                                                      ║
 * ║    const router = new ModelRouter({ cheapModel: 'gpt-4o-mini', … })          ║
 * ║    router.addProvider(new OpenAIProvider())                                   ║
 * ║    const response = await router.complete(request)                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { ServiceError, AiErrorCode } from '../../utils/errors.js'
import type { BaseLLMProvider } from './provider.js'
import type {
  LLMModel,
  LLMRequest,
  LLMResponse,
  LLMStreamChunk,
  ModelRoutingConfig,
} from './types.js'

// ── Model Router ──

export class ModelRouter {
  private providers: BaseLLMProvider[] = []
  private routingConfig: ModelRoutingConfig

  constructor(config: ModelRoutingConfig) {
    this.routingConfig = config
  }

  /** Register an LLM provider with the router. */
  addProvider(provider: BaseLLMProvider): void {
    if (this.providers.some((p) => p.name === provider.name)) {
      throw new ServiceError(
        'llm-router',
        `Provider "${provider.name}" is already registered`,
        AiErrorCode.INVALID_INPUT,
      )
    }
    this.providers.push(provider)
  }

  /** Aggregate models from all registered providers. */
  getAvailableModels(): LLMModel[] {
    return this.providers.flatMap((p) => p.listModels())
  }

  /**
   * Route a completion request to the best available provider.
   * Resolves the model via routing config, then tries the owning provider
   * with automatic fallback to any provider that hosts the same model.
   */
  async complete(request: LLMRequest): Promise<LLMResponse> {
    const resolved = this.resolveModel(request)
    const ordered = this.buildFallbackChain(resolved.model)

    let lastError: unknown
    for (const provider of ordered) {
      const available = await provider.isAvailable()
      if (!available) continue
      try {
        return await provider.complete(resolved)
      } catch (error: unknown) {
        lastError = error
      }
    }

    // All providers failed or unavailable — try the primary anyway so we get a clean error
    if (ordered.length > 0) {
      return ordered[0].complete(resolved)
    }

    throw lastError ?? new ServiceError(
      'llm-router',
      `No provider available for model "${resolved.model}"`,
      AiErrorCode.SERVICE_UNAVAILABLE,
    )
  }

  /**
   * Route a streaming request to the best available provider.
   */
  async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk> {
    const resolved = this.resolveModel(request)
    const ordered = this.buildFallbackChain(resolved.model)

    let lastError: unknown
    for (const provider of ordered) {
      const available = await provider.isAvailable()
      if (!available) continue
      try {
        yield* provider.stream(resolved)
        return
      } catch (error: unknown) {
        lastError = error
      }
    }

    if (ordered.length > 0) {
      yield* ordered[0].stream(resolved)
      return
    }

    throw lastError ?? new ServiceError(
      'llm-router',
      `No provider available for model "${resolved.model}"`,
      AiErrorCode.SERVICE_UNAVAILABLE,
    )
  }

  /**
   * Estimate the cost (USD) for a hypothetical request.
   */
  estimateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const model = this.getAvailableModels().find((m) => m.id === modelId)
    if (!model) return 0
    return (inputTokens / 1000) * model.costPer1kInput + (outputTokens / 1000) * model.costPer1kOutput
  }

  // ── Internal ──

  /** Apply routing config to resolve the final model ID. */
  private resolveModel(request: LLMRequest): LLMRequest {
    if (this.routingConfig.router) {
      const modelId = this.routingConfig.router(request)
      return { ...request, model: modelId }
    }
    return request
  }

  /**
   * Build an ordered list of providers that could serve the given model.
   * The owning provider (model.provider matches) comes first, followed by
   * any other provider that lists the model.
   */
  private buildFallbackChain(modelId: string): BaseLLMProvider[] {
    const primary: BaseLLMProvider[] = []
    const fallback: BaseLLMProvider[] = []

    for (const provider of this.providers) {
      const hasModel = provider.listModels().some((m) => m.id === modelId)
      if (!hasModel) continue

      if (provider.name === this.getModelProvider(modelId)) {
        primary.push(provider)
      } else {
        fallback.push(provider)
      }
    }

    return [...primary, ...fallback]
  }

  /** Look up the declared provider name for a model ID. */
  private getModelProvider(modelId: string): string | undefined {
    for (const provider of this.providers) {
      const model = provider.listModels().find((m) => m.id === modelId)
      if (model) return model.provider
    }
    return undefined
  }
}
