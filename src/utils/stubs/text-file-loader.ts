/**
 * Node.js ESM loader hook for non-standard file types.
 * Handles:
 *   - .md files: loaded as plain text strings (default export)
 *   - .txt files: loaded as plain text strings (default export)
 *
 * This loader is registered from macro-globals.ts via `module.register()`.
 */

import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'

export async function load(
  url: string,
  context: { format?: string },
  nextLoad: (url: string, context: object) => Promise<{ source: string; format: string }>,
) {
  const isMarkdown = url.endsWith('.md') || url.endsWith('.txt')
  if (isMarkdown) {
    const filePath = fileURLToPath(url)
    let content = ''
    try {
      content = await readFile(filePath, 'utf-8')
    } catch {
      content = ''
    }
    // Escape for JS string
    const escaped = JSON.stringify(content)
    return {
      format: 'module',
      source: `export default ${escaped};\n`,
      shortCircuit: true,
    }
  }
  return nextLoad(url, context)
}

export async function resolve(
  specifier: string,
  context: { parentURL?: string; conditions?: string[] },
  nextResolve: (specifier: string, context: object) => Promise<{ url: string; format?: string }>,
) {
  if (specifier.endsWith('.md') || specifier.endsWith('.txt')) {
    const result = await nextResolve(specifier, context)
    return { ...result, format: 'module' }
  }
  return nextResolve(specifier, context)
}
