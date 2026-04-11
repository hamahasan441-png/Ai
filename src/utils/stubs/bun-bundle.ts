/**
 * Stub for Bun's `bun:bundle` module.
 * Provides a no-op `feature()` function so the codebase compiles and runs
 * under Node.js / tsx without Bun. All feature flags return false, which
 * disables Bun-only code paths at runtime.
 */

/**
 * Returns false for every feature flag.
 * In a real Bun build this is replaced at bundle-time with `true` or `false`
 * depending on the build target; in Node.js we always return false.
 */
export function feature(_name: string): boolean {
  return false
}
