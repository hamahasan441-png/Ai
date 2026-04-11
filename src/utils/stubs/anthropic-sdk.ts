/**
 * Local stub for `@anthropic-ai/sdk`.
 *
 * This file replaces the real Anthropic SDK so the project runs fully offline
 * under Node.js / tsx without any external API keys or network calls.
 * All runtime error classes are implemented as plain Error subclasses.
 * The Anthropic client class is a stub that throws if you try to use it
 * (local LLM modules bypass it entirely).
 *
 * TypeScript type aliases are re-exported as `unknown` so callers continue
 * to compile — the types are erased by tsx at runtime anyway.
 */

// ─── Error classes ────────────────────────────────────────────────────────────

export class APIError extends Error {
  readonly status: number | undefined
  readonly headers: Record<string, string> | undefined
  readonly error: unknown

  constructor(
    status: number | undefined,
    error: unknown,
    message: string | undefined,
    headers: Record<string, string> | undefined,
  ) {
    super(message ?? 'APIError')
    this.name = 'APIError'
    this.status = status
    this.headers = headers
    this.error = error
  }

  static generate(
    status: number | undefined,
    errorResponse: unknown,
    message: string | undefined,
    headers: Record<string, string>,
  ): APIError {
    if (status === 400) return new BadRequestError(status, errorResponse, message, headers)
    if (status === 401) return new AuthenticationError(status, errorResponse, message, headers)
    if (status === 403) return new PermissionDeniedError(status, errorResponse, message, headers)
    if (status === 404) return new NotFoundError(status, errorResponse, message, headers)
    if (status === 409) return new ConflictError(status, errorResponse, message, headers)
    if (status === 422) return new UnprocessableEntityError(status, errorResponse, message, headers)
    if (status === 429) return new RateLimitError(status, errorResponse, message, headers)
    if (status !== undefined && status >= 500)
      return new InternalServerError(status, errorResponse, message, headers)
    return new APIError(status, errorResponse, message, headers)
  }
}

export class APIUserAbortError extends APIError {
  constructor(message?: string) {
    super(undefined, undefined, message ?? 'Request was aborted.', undefined)
    this.name = 'APIUserAbortError'
  }
}

export class APIConnectionError extends APIError {
  constructor({ message, cause }: { message: string; cause?: Error }) {
    super(undefined, undefined, message, undefined)
    this.name = 'APIConnectionError'
    if (cause) (this as unknown as { cause: Error }).cause = cause
  }
}

export class APIConnectionTimeoutError extends APIConnectionError {
  constructor() {
    super({ message: 'Request timed out.' })
    this.name = 'APIConnectionTimeoutError'
  }
}

export class BadRequestError extends APIError {
  constructor(
    status: number | undefined,
    error: unknown,
    message: string | undefined,
    headers: Record<string, string> | undefined,
  ) {
    super(status ?? 400, error, message, headers)
    this.name = 'BadRequestError'
  }
}

export class AuthenticationError extends APIError {
  constructor(
    status: number | undefined,
    error: unknown,
    message: string | undefined,
    headers: Record<string, string> | undefined,
  ) {
    super(status ?? 401, error, message, headers)
    this.name = 'AuthenticationError'
  }
}

export class PermissionDeniedError extends APIError {
  constructor(
    status: number | undefined,
    error: unknown,
    message: string | undefined,
    headers: Record<string, string> | undefined,
  ) {
    super(status ?? 403, error, message, headers)
    this.name = 'PermissionDeniedError'
  }
}

export class NotFoundError extends APIError {
  constructor(
    status: number | undefined,
    error: unknown,
    message: string | undefined,
    headers: Record<string, string> | undefined,
  ) {
    super(status ?? 404, error, message, headers)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends APIError {
  constructor(
    status: number | undefined,
    error: unknown,
    message: string | undefined,
    headers: Record<string, string> | undefined,
  ) {
    super(status ?? 409, error, message, headers)
    this.name = 'ConflictError'
  }
}

export class UnprocessableEntityError extends APIError {
  constructor(
    status: number | undefined,
    error: unknown,
    message: string | undefined,
    headers: Record<string, string> | undefined,
  ) {
    super(status ?? 422, error, message, headers)
    this.name = 'UnprocessableEntityError'
  }
}

export class RateLimitError extends APIError {
  constructor(
    status: number | undefined,
    error: unknown,
    message: string | undefined,
    headers: Record<string, string> | undefined,
  ) {
    super(status ?? 429, error, message, headers)
    this.name = 'RateLimitError'
  }
}

export class InternalServerError extends APIError {
  constructor(
    status: number | undefined,
    error: unknown,
    message: string | undefined,
    headers: Record<string, string> | undefined,
  ) {
    super(status ?? 500, error, message, headers)
    this.name = 'InternalServerError'
  }
}

// ─── ClientOptions type stub ──────────────────────────────────────────────────

export interface ClientOptions {
  apiKey?: string
  baseURL?: string
  timeout?: number
  maxRetries?: number
  defaultHeaders?: Record<string, string>
  authToken?: string
}

// ─── Anthropic client stub ────────────────────────────────────────────────────

/**
 * Stub Anthropic client. Local LLM modules (QwenLocalLLM, LocalLLMBridge,
 * ModelSpark) never call this — they talk directly to Ollama / llama.cpp.
 * The stub keeps dependent code from crashing at import time.
 */
export class Anthropic {
  readonly apiKey: string

  constructor(options?: ClientOptions) {
    this.apiKey = options?.apiKey ?? ''
  }

  messages = {
    create: async (): Promise<never> => {
      throw new Error(
        'Anthropic API is disabled. Use local LLM modules (ModelSpark / QwenLocalLLM) instead.',
      )
    },
    stream: (): never => {
      throw new Error(
        'Anthropic API is disabled. Use local LLM modules (ModelSpark / QwenLocalLLM) instead.',
      )
    },
  }

  beta = {
    messages: {
      create: async (): Promise<never> => {
        throw new Error(
          'Anthropic API is disabled. Use local LLM modules (ModelSpark / QwenLocalLLM) instead.',
        )
      },
      stream: (): never => {
        throw new Error(
          'Anthropic API is disabled. Use local LLM modules (ModelSpark / QwenLocalLLM) instead.',
        )
      },
    },
  }

  models = {
    list: async (): Promise<never> => {
      throw new Error('Anthropic API is disabled.')
    },
  }
}

export default Anthropic

// ─── Type stubs (erased by tsx at runtime) ────────────────────────────────────

export type MessageParam = unknown
export type ContentBlockParam = unknown
export type TextBlockParam = unknown
export type ImageBlockParam = unknown
export type ToolResultBlockParam = unknown
export type ToolUseBlockParam = unknown
export type ToolUseBlock = unknown
export type ContentBlock = unknown
export type ThinkingBlockParam = unknown
export type ThinkingBlock = unknown
export type Base64ImageSource = unknown
export type BetaUsage = unknown
export type BetaContentBlock = unknown
export type BetaToolUseBlock = unknown
export type BetaMessageStreamParams = unknown
export type BetaTool = unknown
export type BetaToolUnion = unknown
export type BetaMessageParam = unknown
export type BetaMessage = unknown
export type BetaStopReason = unknown
export type Stream<T = unknown> = AsyncIterable<T>
