/**
 * Stub for Bun's `bun:ffi` module.
 * The real module is used for FFI calls in a Bun environment.
 * Under Node.js this is never reached because the calling code already
 * guards with `typeof Bun !== 'undefined'`, but we provide a stub so
 * the module can be resolved at import time if needed.
 */

export function dlopen(): never {
  throw new Error('bun:ffi is not available in Node.js')
}

export function linkSymbols(): never {
  throw new Error('bun:ffi is not available in Node.js')
}

export function toBuffer(): never {
  throw new Error('bun:ffi is not available in Node.js')
}

export const ptr = (): never => {
  throw new Error('bun:ffi is not available in Node.js')
}

export default { dlopen, linkSymbols, toBuffer, ptr }
