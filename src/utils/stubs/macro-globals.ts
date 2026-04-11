/**
 * Polyfill for the `MACRO` global that Bun inlines at bundle time.
 * This module is loaded before the main CLI entry via `--import` so that
 * `MACRO.VERSION`, `MACRO.BUILD_TIME`, etc. are available as globals when
 * running under Node.js / tsx.
 *
 * Also registers:
 *  - A CJS require extension for .md / .txt files (text → default export)
 *  - An ESM loader hook for .md / .txt files
 */

import Module from 'module'
import { join } from 'path'
import { readFileSync } from 'fs'

const { createRequire } = Module

// In CommonJS output (module: Node16 for .ts files) __filename and __dirname
// are built-in globals.  We use them instead of import.meta.url so that
// TypeScript does not raise TS1470.
declare const __filename: string
declare const __dirname: string

const _require = createRequire(__filename)

// ─── CJS loader for .md / .txt files ─────────────────────────────────────────
// `require.extensions` is deprecated but still works in all Node.js versions.
// This covers the cases where tsx transpiles `import x from 'file.md'` to CJS.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const reqExts = (_require as any).extensions as Record<
  string,
  (m: NodeJS.Module, filename: string) => void
>
if (reqExts && !reqExts['.md']) {
  reqExts['.md'] = (m: NodeJS.Module, filename: string) => {
    const content = readFileSync(filename, 'utf-8')
    ;(m as unknown as { exports: string }).exports = content
  }
}
if (reqExts && !reqExts['.txt']) {
  reqExts['.txt'] = (m: NodeJS.Module, filename: string) => {
    const content = readFileSync(filename, 'utf-8')
    ;(m as unknown as { exports: string }).exports = content
  }
}

// ─── Redirect bun:* modules to Node.js stubs ─────────────────────────────────
// tsx / Node.js doesn't resolve tsconfig "paths" for bare specifiers with
// protocol-like prefixes (bun:*). Patch Module._resolveFilename so that
// `require('bun:bundle')` and `require('bun:ffi')` transparently return the
// corresponding stub files that already live in this directory.
const _bunStubs: Record<string, string> = {
  'bun:bundle': join(__dirname, 'bun-bundle.ts'),
  'bun:ffi': join(__dirname, 'bun-ffi.ts'),
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _origResolve = (Module as any)._resolveFilename
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(Module as any)._resolveFilename = function (
  request: string,
  parent: unknown,
  isMain: boolean,
  options: unknown,
) {
  if (request in _bunStubs) {
    return _bunStubs[request]
  }
  return _origResolve.call(this, request, parent, isMain, options)
}

// ─── Version from package.json ────────────────────────────────────────────────
let version = '2.3.0'
let packageUrl = 'ai'
try {
  const pkg = _require(join(__dirname, '..', '..', '..', 'package.json')) as {
    version?: string
    name?: string
  }
  version = pkg.version ?? version
  packageUrl = pkg.name ?? packageUrl
} catch {
  // fallback
}

declare global {
  // eslint-disable-next-line no-var
  var MACRO: {
    VERSION: string
    BUILD_TIME: string | undefined
    ISSUES_EXPLAINER: string
    FEEDBACK_CHANNEL: string
    PACKAGE_URL: string
    NATIVE_PACKAGE_URL: string | undefined
    VERSION_CHANGELOG: string
  }
}

globalThis.MACRO = {
  VERSION: version,
  BUILD_TIME: undefined,
  ISSUES_EXPLAINER: 'open an issue at https://github.com/hamahasan441-png/Ai/issues',
  FEEDBACK_CHANNEL: 'https://github.com/hamahasan441-png/Ai/issues',
  PACKAGE_URL: packageUrl,
  NATIVE_PACKAGE_URL: undefined,
  VERSION_CHANGELOG: '',
}
