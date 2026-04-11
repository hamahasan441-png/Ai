/**
 * Stub for `@anthropic-ai/sandbox-runtime`.
 * Provides no-op implementations so the codebase runs without the actual
 * sandbox runtime package.
 */

// Type stubs
export type FsReadRestrictionConfig = Record<string, unknown>
export type FsWriteRestrictionConfig = Record<string, unknown>
export type IgnoreViolationsConfig = Record<string, unknown>
export type NetworkHostPattern = string
export type NetworkRestrictionConfig = Record<string, unknown>
export type SandboxAskCallback = () => Promise<boolean>
export type SandboxDependencyCheck = Record<string, unknown>
export type SandboxRuntimeConfig = Record<string, unknown>
export type SandboxViolationEvent = Record<string, unknown>

// Runtime stubs
export class SandboxManager {
  constructor(_config?: unknown) {}
  async initialize(): Promise<void> {}
  async cleanup(): Promise<void> {}
  isEnabled(): boolean { return false }
}

export const SandboxRuntimeConfigSchema = {
  parse: (v: unknown) => v,
  safeParse: (v: unknown) => ({ success: true, data: v }),
}

export class SandboxViolationStore {
  constructor() {}
  record(_event: unknown): void {}
  getAll(): unknown[] { return [] }
}
