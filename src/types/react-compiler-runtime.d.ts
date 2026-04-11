/**
 * Module augmentation for React Compiler runtime.
 * The `c` function is the React Compiler's memoization helper.
 * @types/react intentionally leaves this unexported; we add it here so that
 * React-Compiler-generated .tsx files compile without errors.
 */

// This empty export makes the file a "module", enabling proper augmentation.
export {}

declare module 'react/compiler-runtime' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function c(size: number): any[]
}
