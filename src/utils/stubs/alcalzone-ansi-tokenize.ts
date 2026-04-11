/**
 * Stub for `@alcalzone/ansi-tokenize`.
 * Provides minimal CJS-compatible implementations of the tokenizer functions.
 */

export type Token = {
  value: string
  code?: string
  fullWidth?: boolean
}

export type AnsiCode = {
  open: string
  close: string
}

export function tokenize(input: string): Token[] {
  if (!input) return []
  // Simple pass-through: treat all characters as plain tokens
  return [...input].map(char => ({ value: char }))
}

export function ansiCodesToString(codes: AnsiCode[]): string {
  return codes.map(c => c.open).join('')
}

export function reduceAnsiCodes(tokens: Token[]): AnsiCode[] {
  return []
}

export function reduceAnsiCodesIncremental(_tokens: Token[], _prev: AnsiCode[]): AnsiCode[] {
  return []
}

export function diffAnsiCodes(_prev: AnsiCode[], _next: AnsiCode[]): string {
  return ''
}

export function undoAnsiCodes(codes: AnsiCode[]): string {
  return codes.map(c => c.close).join('')
}
