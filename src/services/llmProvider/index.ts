/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LLM Provider — Barrel Exports                                                ║
 * ║                                                                              ║
 * ║  Unified multi-model LLM provider interface.                                 ║
 * ║  Re-exports types, providers, and the model router.                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// Types
export {
  LLMCapability,
  type LLMProvider,
  type LLMModel,
  type LLMMessage,
  type LLMMessageRole,
  type LLMRequest,
  type LLMResponse,
  type LLMUsage,
  type LLMStreamChunk,
  type ModelRoutingConfig,
} from './types.js'

// Providers
export {
  BaseLLMProvider,
  AnthropicProvider,
  OpenAIProvider,
  OllamaProvider,
} from './provider.js'

// Router
export { ModelRouter } from './router.js'
