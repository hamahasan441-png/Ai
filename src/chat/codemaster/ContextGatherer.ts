/**
 * 🔍 ContextGatherer — Smart Code Context Collection
 *
 * Gathers relevant context from a codebase like GitHub Copilot agent:
 *   • Discovers related files from imports/exports
 *   • Traces symbol definitions and usages
 *   • Scores file relevance to a task
 *   • Builds dependency chains
 *   • Extracts type signatures and function signatures
 *   • Summarizes file content for context windows
 *
 * Works fully offline — static analysis with zero external deps.
 */

import type { AnalysisLanguage } from './types.js'

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

/** Information about a discovered symbol. */
export interface SymbolInfo {
  /** Symbol name. */
  name: string
  /** Kind of symbol. */
  kind: SymbolKind
  /** File where defined. */
  filePath: string
  /** Line number. */
  line: number
  /** Whether it's exported. */
  isExported: boolean
  /** Type signature if available. */
  signature?: string
  /** JSDoc/comment description if available. */
  description?: string
}

/** Types of code symbols. */
export type SymbolKind =
  | 'function'
  | 'class'
  | 'interface'
  | 'type'
  | 'variable'
  | 'constant'
  | 'enum'
  | 'method'
  | 'property'
  | 'module'

/** Import relationship between files. */
export interface ImportRelation {
  /** File that imports. */
  sourceFile: string
  /** File being imported from. */
  targetFile: string
  /** Symbols imported. */
  importedSymbols: string[]
  /** Whether it's a type-only import. */
  isTypeOnly: boolean
}

/** A file with relevance scoring. */
export interface RelevantFile {
  /** File path. */
  filePath: string
  /** Relevance score (0-1). */
  relevance: number
  /** Why this file is relevant. */
  reason: string
  /** Language of the file. */
  language: AnalysisLanguage
  /** Key symbols in this file. */
  keySymbols: string[]
}

/** Summary of a file's content for context windows. */
export interface FileSummary {
  /** File path. */
  filePath: string
  /** Language. */
  language: AnalysisLanguage
  /** Total lines. */
  totalLines: number
  /** Exported symbols. */
  exports: string[]
  /** Imported modules. */
  imports: string[]
  /** Function/method signatures. */
  signatures: string[]
  /** Compact summary text. */
  summaryText: string
}

/** Full gathered context for a task. */
export interface GatheredContext {
  /** Primary files to focus on. */
  primaryFiles: RelevantFile[]
  /** Supporting files for reference. */
  supportingFiles: RelevantFile[]
  /** All discovered symbols. */
  symbols: SymbolInfo[]
  /** Import relationships. */
  importGraph: ImportRelation[]
  /** File summaries. */
  summaries: FileSummary[]
  /** Total context size (chars). */
  totalContextSize: number
}

// ══════════════════════════════════════════════════════════════════════════════
// LANGUAGE DETECTION
// ══════════════════════════════════════════════════════════════════════════════

const EXT_LANG: Record<string, AnalysisLanguage> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.py': 'python',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cs': 'csharp',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.rb': 'ruby',
  '.php': 'php',
  '.html': 'html',
  '.css': 'css',
  '.sql': 'sql',
  '.sh': 'bash',
  '.ps1': 'powershell',
  '.r': 'r',
  '.dart': 'dart',
  '.scala': 'scala',
  '.lua': 'lua',
  '.hs': 'haskell',
  '.ex': 'elixir',
}

function langFromPath(filePath: string): AnalysisLanguage {
  const ext = filePath.substring(filePath.lastIndexOf('.'))
  return EXT_LANG[ext] ?? 'unknown'
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTEXT GATHERER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * ContextGatherer — Collects relevant code context for a task.
 *
 * Analyzes file contents and relationships to determine which files and symbols
 * are most relevant to a given task.
 */
export class ContextGatherer {
  /**
   * Extract symbols from source code.
   */
  extractSymbols(code: string, filePath: string, language?: AnalysisLanguage): SymbolInfo[] {
    const lang = language ?? langFromPath(filePath)
    const symbols: SymbolInfo[] = []
    const lines = code.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNum = i + 1

      // Get JSDoc comment from preceding lines
      let description: string | undefined
      if (i > 0 && lines[i - 1].trim().startsWith('*/')) {
        // Walk backward to find /** start
        for (let j = i - 1; j >= 0; j--) {
          if (lines[j].trim().startsWith('/**')) {
            description = lines
              .slice(j, i)
              .map(l => l.trim().replace(/^\/\*\*?\s?|\*\/\s?|\*\s?/g, ''))
              .filter(Boolean)
              .join(' ')
              .substring(0, 200)
            break
          }
        }
      }

      // TypeScript/JavaScript patterns
      if (lang === 'typescript' || lang === 'javascript') {
        // Export function
        const exportFn = line.match(
          /export\s+(?:async\s+)?function\s+(\w+)\s*(\([^)]*\)(?:\s*:\s*[^{]+)?)/,
        )
        if (exportFn) {
          symbols.push({
            name: exportFn[1],
            kind: 'function',
            filePath,
            line: lineNum,
            isExported: true,
            signature: `function ${exportFn[1]}${exportFn[2]}`,
            description,
          })
          continue
        }

        // Export class
        const exportClass = line.match(/export\s+class\s+(\w+)/)
        if (exportClass) {
          symbols.push({
            name: exportClass[1],
            kind: 'class',
            filePath,
            line: lineNum,
            isExported: true,
            description,
          })
          continue
        }

        // Export interface
        const exportIface = line.match(/export\s+interface\s+(\w+)/)
        if (exportIface) {
          symbols.push({
            name: exportIface[1],
            kind: 'interface',
            filePath,
            line: lineNum,
            isExported: true,
            description,
          })
          continue
        }

        // Export type
        const exportType = line.match(/export\s+type\s+(\w+)/)
        if (exportType) {
          symbols.push({
            name: exportType[1],
            kind: 'type',
            filePath,
            line: lineNum,
            isExported: true,
            description,
          })
          continue
        }

        // Export enum
        const exportEnum = line.match(/export\s+enum\s+(\w+)/)
        if (exportEnum) {
          symbols.push({
            name: exportEnum[1],
            kind: 'enum',
            filePath,
            line: lineNum,
            isExported: true,
            description,
          })
          continue
        }

        // Export const/let
        const exportConst = line.match(/export\s+(?:const|let)\s+(\w+)/)
        if (exportConst) {
          symbols.push({
            name: exportConst[1],
            kind: 'constant',
            filePath,
            line: lineNum,
            isExported: true,
            description,
          })
          continue
        }

        // Non-exported function
        const fn = line.match(/^(?:async\s+)?function\s+(\w+)\s*(\([^)]*\))/)
        if (fn) {
          symbols.push({
            name: fn[1],
            kind: 'function',
            filePath,
            line: lineNum,
            isExported: false,
            signature: `function ${fn[1]}${fn[2]}`,
            description,
          })
          continue
        }

        // Non-exported class
        const cls = line.match(/^class\s+(\w+)/)
        if (cls) {
          symbols.push({
            name: cls[1],
            kind: 'class',
            filePath,
            line: lineNum,
            isExported: false,
            description,
          })
          continue
        }
      }

      // Python patterns
      if (lang === 'python') {
        const pyFn = line.match(/^(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)/)
        if (pyFn) {
          symbols.push({
            name: pyFn[1],
            kind: 'function',
            filePath,
            line: lineNum,
            isExported: !pyFn[1].startsWith('_'),
            signature: `def ${pyFn[1]}(${pyFn[2]})`,
            description,
          })
          continue
        }

        const pyClass = line.match(/^class\s+(\w+)/)
        if (pyClass) {
          symbols.push({
            name: pyClass[1],
            kind: 'class',
            filePath,
            line: lineNum,
            isExported: !pyClass[1].startsWith('_'),
            description,
          })
          continue
        }
      }

      // Go patterns
      if (lang === 'go') {
        const goFn = line.match(/^func\s+(\w+)\s*\(([^)]*)\)/)
        if (goFn) {
          const isExported = /^[A-Z]/.test(goFn[1])
          symbols.push({
            name: goFn[1],
            kind: 'function',
            filePath,
            line: lineNum,
            isExported,
            signature: `func ${goFn[1]}(${goFn[2]})`,
            description,
          })
          continue
        }

        const goStruct = line.match(/^type\s+(\w+)\s+struct/)
        if (goStruct) {
          const isExported = /^[A-Z]/.test(goStruct[1])
          symbols.push({
            name: goStruct[1],
            kind: 'class',
            filePath,
            line: lineNum,
            isExported,
            description,
          })
          continue
        }

        const goInterface = line.match(/^type\s+(\w+)\s+interface/)
        if (goInterface) {
          const isExported = /^[A-Z]/.test(goInterface[1])
          symbols.push({
            name: goInterface[1],
            kind: 'interface',
            filePath,
            line: lineNum,
            isExported,
            description,
          })
          continue
        }
      }

      // Rust patterns
      if (lang === 'rust') {
        const rustFn = line.match(/^pub\s+(?:async\s+)?fn\s+(\w+)\s*(\([^)]*\))/)
        if (rustFn) {
          symbols.push({
            name: rustFn[1],
            kind: 'function',
            filePath,
            line: lineNum,
            isExported: true,
            signature: `fn ${rustFn[1]}${rustFn[2]}`,
            description,
          })
          continue
        }

        const rustStruct = line.match(/^pub\s+struct\s+(\w+)/)
        if (rustStruct) {
          symbols.push({
            name: rustStruct[1],
            kind: 'class',
            filePath,
            line: lineNum,
            isExported: true,
            description,
          })
          continue
        }

        const rustTrait = line.match(/^pub\s+trait\s+(\w+)/)
        if (rustTrait) {
          symbols.push({
            name: rustTrait[1],
            kind: 'interface',
            filePath,
            line: lineNum,
            isExported: true,
            description,
          })
          continue
        }
      }
    }

    return symbols
  }

  /**
   * Extract import relationships from source code.
   */
  extractImports(code: string, filePath: string): ImportRelation[] {
    const relations: ImportRelation[] = []
    const lines = code.split('\n')

    for (const line of lines) {
      // TypeScript/JavaScript: import { X } from './file'
      const tsImport = line.match(
        /import\s+(type\s+)?(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/,
      )
      if (tsImport) {
        const isTypeOnly = !!tsImport[1]
        const symbols = tsImport[2]
          ? tsImport[2]
              .split(',')
              .map(s => s.trim().split(' as ')[0].trim())
              .filter(Boolean)
          : tsImport[3]
            ? [tsImport[3]]
            : []
        relations.push({
          sourceFile: filePath,
          targetFile: tsImport[4],
          importedSymbols: symbols,
          isTypeOnly,
        })
        continue
      }

      // Python: from module import X
      const pyImport = line.match(/from\s+([\w.]+)\s+import\s+(.+)/)
      if (pyImport) {
        const symbols = pyImport[2]
          .split(',')
          .map(s => s.trim().split(' as ')[0].trim())
          .filter(Boolean)
        relations.push({
          sourceFile: filePath,
          targetFile: pyImport[1],
          importedSymbols: symbols,
          isTypeOnly: false,
        })
        continue
      }

      // Go: import "package"
      const goImport = line.match(/import\s+(?:\w+\s+)?["']([^"']+)["']/)
      if (goImport) {
        relations.push({
          sourceFile: filePath,
          targetFile: goImport[1],
          importedSymbols: [],
          isTypeOnly: false,
        })
        continue
      }
    }

    return relations
  }

  /**
   * Score how relevant a file is to a given task description.
   */
  scoreRelevance(filePath: string, fileContent: string, taskDescription: string): number {
    const lower = taskDescription.toLowerCase()
    const words = lower.split(/\s+/).filter(w => w.length > 2)
    const fileName = filePath.split('/').pop()?.toLowerCase() ?? ''
    const pathLower = filePath.toLowerCase()
    const contentLower = fileContent.toLowerCase()

    let score = 0

    // File name matches task keywords
    for (const word of words) {
      if (fileName.includes(word)) score += 0.3
      if (pathLower.includes(word)) score += 0.1
    }

    // Content contains task keywords
    for (const word of words) {
      if (contentLower.includes(word)) score += 0.05
    }

    // Test files get a boost for test-related tasks
    if (lower.includes('test') && (fileName.includes('test') || fileName.includes('spec'))) {
      score += 0.2
    }

    // Type/interface files get a boost for type-related tasks
    if (
      (lower.includes('type') || lower.includes('interface')) &&
      (fileName.includes('type') || fileName.includes('interface'))
    ) {
      score += 0.2
    }

    // Index files are usually important
    if (fileName === 'index.ts' || fileName === 'index.js') {
      score += 0.1
    }

    // Cap at 1.0
    return Math.min(1.0, score)
  }

  /**
   * Generate a compact summary of a file.
   */
  summarizeFile(code: string, filePath: string): FileSummary {
    const language = langFromPath(filePath)
    const lines = code.split('\n')
    const symbols = this.extractSymbols(code, filePath, language)
    const imports = this.extractImports(code, filePath)

    const exports = symbols.filter(s => s.isExported).map(s => s.name)
    const importModules = imports.map(r => r.targetFile)
    const signatures = symbols
      .filter(s => s.signature)
      .map(s => s.signature!)
      .slice(0, 20) // Limit

    // Build compact summary
    const parts: string[] = [`${filePath} (${language}, ${lines.length} lines)`]
    if (exports.length > 0) parts.push(`Exports: ${exports.join(', ')}`)
    if (importModules.length > 0) parts.push(`Imports: ${importModules.join(', ')}`)

    return {
      filePath,
      language,
      totalLines: lines.length,
      exports,
      imports: importModules,
      signatures,
      summaryText: parts.join(' | '),
    }
  }

  /**
   * Gather complete context for a task.
   */
  gatherContext(
    taskDescription: string,
    files: Map<string, string>,
    options?: { maxPrimaryFiles?: number; maxSupportingFiles?: number },
  ): GatheredContext {
    const maxPrimary = options?.maxPrimaryFiles ?? 10
    const maxSupporting = options?.maxSupportingFiles ?? 20

    // Score all files for relevance
    const scored: RelevantFile[] = []
    const allSymbols: SymbolInfo[] = []
    const allImports: ImportRelation[] = []
    const allSummaries: FileSummary[] = []

    for (const [filePath, content] of files) {
      const relevance = this.scoreRelevance(filePath, content, taskDescription)
      const language = langFromPath(filePath)
      const symbols = this.extractSymbols(content, filePath, language)
      const imports = this.extractImports(content, filePath)

      allSymbols.push(...symbols)
      allImports.push(...imports)

      const keySymbols = symbols
        .filter(s => s.isExported)
        .map(s => s.name)
        .slice(0, 5)
      let reason = 'general context'
      if (relevance > 0.5) reason = 'high keyword match'
      else if (relevance > 0.2) reason = 'partial keyword match'

      scored.push({ filePath, relevance, reason, language, keySymbols })

      if (relevance > 0.1) {
        allSummaries.push(this.summarizeFile(content, filePath))
      }
    }

    // Sort by relevance
    scored.sort((a, b) => b.relevance - a.relevance)

    const primaryFiles = scored.filter(f => f.relevance > 0.2).slice(0, maxPrimary)
    const supportingFiles = scored
      .filter(f => f.relevance > 0.05 && f.relevance <= 0.2)
      .slice(0, maxSupporting)

    const totalContextSize = allSummaries.reduce((sum, s) => sum + s.summaryText.length, 0)

    return {
      primaryFiles,
      supportingFiles,
      symbols: allSymbols,
      importGraph: allImports,
      summaries: allSummaries,
      totalContextSize,
    }
  }

  /**
   * Find all files that import from a given file.
   */
  findDependents(filePath: string, importGraph: ImportRelation[]): string[] {
    return importGraph
      .filter(r => r.targetFile.includes(filePath.replace(/\.\w+$/, '')))
      .map(r => r.sourceFile)
  }

  /**
   * Find all files that a given file imports.
   */
  findDependencies(filePath: string, importGraph: ImportRelation[]): string[] {
    return importGraph.filter(r => r.sourceFile === filePath).map(r => r.targetFile)
  }

  /**
   * Trace a symbol across the codebase — find where it's defined and used.
   */
  traceSymbol(
    symbolName: string,
    files: Map<string, string>,
  ): {
    definition: SymbolInfo | null
    usages: Array<{ filePath: string; line: number }>
  } {
    let definition: SymbolInfo | null = null
    const usages: Array<{ filePath: string; line: number }> = []

    for (const [filePath, content] of files) {
      // Check definitions
      const symbols = this.extractSymbols(content, filePath)
      const defn = symbols.find(s => s.name === symbolName)
      if (defn && !definition) {
        definition = defn
      }

      // Check usages
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const pattern = new RegExp(`\\b${symbolName}\\b`)
        if (pattern.test(lines[i])) {
          // Don't count the definition line itself
          if (!(defn && defn.filePath === filePath && defn.line === i + 1)) {
            usages.push({ filePath, line: i + 1 })
          }
        }
      }
    }

    return { definition, usages }
  }
}
