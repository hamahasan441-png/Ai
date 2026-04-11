// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║ INTELLIGENT REFACTORER — Phase 9 Intelligence Module                        ║
// ║ Smart code refactoring: extract method, rename, simplify, deduplicate       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Configuration ──────────────────────────────────────────────────────────────

export interface IntelligentRefactorerConfig {
  maxSuggestions: number
  enableExtractMethod: boolean
  enableRenaming: boolean
  enableSimplification: boolean
  enableDeduplication: boolean
  enableDecomposition: boolean
  minComplexityForExtract: number
  minDuplicateTokens: number
  confidenceThreshold: number
}

// ── Statistics ──────────────────────────────────────────────────────────────────

export interface IntelligentRefactorerStats {
  totalRefactorings: number
  totalSuggestionsGenerated: number
  totalExtractMethodSuggestions: number
  totalRenameSuggestions: number
  totalSimplificationSuggestions: number
  totalDeduplicationSuggestions: number
  totalDecompositionSuggestions: number
  totalApplied: number
  avgConfidence: number
  createdAt: string
  lastUsedAt: string
}

// ── Types ───────────────────────────────────────────────────────────────────────

export type RefactoringType =
  | 'extract_method'
  | 'extract_variable'
  | 'inline_variable'
  | 'rename_symbol'
  | 'decompose_conditional'
  | 'simplify_boolean'
  | 'remove_dead_code'
  | 'consolidate_duplicate'
  | 'introduce_parameter_object'
  | 'replace_magic_number'
  | 'encapsulate_field'
  | 'move_method'
  | 'pull_up_method'
  | 'replace_temp_with_query'

export interface RefactoringSuggestion {
  type: RefactoringType
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  startLine: number
  endLine: number
  originalCode: string
  suggestedCode: string
  rationale: string
}

export interface ExtractMethodResult {
  methodName: string
  parameters: string[]
  returnType: string
  extractedBody: string
  callSite: string
  confidence: number
}

export interface RenameResult {
  oldName: string
  newName: string
  kind: 'variable' | 'function' | 'class' | 'parameter' | 'method'
  reason: string
  confidence: number
  occurrences: number
}

export interface SimplificationResult {
  original: string
  simplified: string
  type: 'boolean' | 'conditional' | 'loop' | 'expression' | 'guard_clause'
  confidence: number
  explanation: string
}

export interface DuplicateBlock {
  blockA: { startLine: number; endLine: number; code: string }
  blockB: { startLine: number; endLine: number; code: string }
  similarity: number
  suggestedExtraction: string
}

export interface RefactoringPlan {
  suggestions: RefactoringSuggestion[]
  totalImpact: number
  estimatedComplexityReduction: number
  priorityOrder: number[]
  summary: string
}

// ── Default Config ──────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: IntelligentRefactorerConfig = {
  maxSuggestions: 20,
  enableExtractMethod: true,
  enableRenaming: true,
  enableSimplification: true,
  enableDeduplication: true,
  enableDecomposition: true,
  minComplexityForExtract: 5,
  minDuplicateTokens: 30,
  confidenceThreshold: 0.4,
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function countOccurrences(text: string, pattern: RegExp): number {
  const m = text.match(pattern)
  return m ? m.length : 0
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function tokenizeLine(line: string): string[] {
  return line.split(/[^a-zA-Z0-9_$]+/).filter(t => t.length > 0)
}

function camelCase(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1)
}

function toPascalCase(str: string): string {
  return str.replace(/(?:^|[_-])(\w)/g, (_, c) => (c as string).toUpperCase())
}

// ── Main Class ──────────────────────────────────────────────────────────────────

export class IntelligentRefactorer {
  private config: IntelligentRefactorerConfig
  private stats: IntelligentRefactorerStats
  private confidenceHistory: number[] = []

  constructor(config?: Partial<IntelligentRefactorerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    const now = new Date().toISOString()
    this.stats = {
      totalRefactorings: 0,
      totalSuggestionsGenerated: 0,
      totalExtractMethodSuggestions: 0,
      totalRenameSuggestions: 0,
      totalSimplificationSuggestions: 0,
      totalDeduplicationSuggestions: 0,
      totalDecompositionSuggestions: 0,
      totalApplied: 0,
      avgConfidence: 0,
      createdAt: now,
      lastUsedAt: now,
    }
  }

  // ── Full Analysis ───────────────────────────────────────────────────────────

  analyzeAndSuggest(code: string): RefactoringPlan {
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalRefactorings++
    const suggestions: RefactoringSuggestion[] = []

    if (this.config.enableExtractMethod) {
      for (const em of this.suggestExtractMethod(code)) {
        suggestions.push({
          type: 'extract_method',
          description: `Extract '${em.methodName}' (${em.parameters.length} params)`,
          confidence: em.confidence,
          impact: 'medium',
          startLine: 0,
          endLine: 0,
          originalCode: em.extractedBody.substring(0, 200),
          suggestedCode: em.callSite,
          rationale: `Reduces complexity by extracting reusable method '${em.methodName}'`,
        })
      }
    }

    if (this.config.enableRenaming) {
      for (const r of this.suggestRenames(code)) {
        suggestions.push({
          type: 'rename_symbol',
          description: `Rename '${r.oldName}' → '${r.newName}'`,
          confidence: r.confidence,
          impact: 'low',
          startLine: 0,
          endLine: 0,
          originalCode: r.oldName,
          suggestedCode: r.newName,
          rationale: r.reason,
        })
      }
    }

    if (this.config.enableSimplification) {
      for (const s of this.suggestSimplifications(code)) {
        suggestions.push({
          type: s.type === 'boolean' ? 'simplify_boolean' : 'decompose_conditional',
          description: s.explanation,
          confidence: s.confidence,
          impact: 'medium',
          startLine: 0,
          endLine: 0,
          originalCode: s.original,
          suggestedCode: s.simplified,
          rationale: s.explanation,
        })
      }
    }

    if (this.config.enableDeduplication) {
      for (const d of this.findDuplicates(code)) {
        suggestions.push({
          type: 'consolidate_duplicate',
          description: `Consolidate duplicate blocks (${Math.round(d.similarity * 100)}% similar)`,
          confidence: d.similarity,
          impact: 'high',
          startLine: d.blockA.startLine,
          endLine: d.blockA.endLine,
          originalCode: d.blockA.code.substring(0, 200),
          suggestedCode: d.suggestedExtraction,
          rationale: 'Eliminate duplicate code by extracting shared logic',
        })
      }
    }

    if (this.config.enableDecomposition) {
      for (const dc of this.suggestDecomposition(code)) {
        suggestions.push(dc)
      }
    }

    // Magic numbers
    const magicNums = [...code.matchAll(/(?<![.\w])(\d{2,})(?![.\w])/g)].filter(m => {
      const n = parseInt(m[1], 10)
      return n !== 0 && n !== 1 && n !== 100 && n !== 10
    })
    if (magicNums.length >= 3) {
      suggestions.push({
        type: 'replace_magic_number',
        description: `Replace ${magicNums.length} magic numbers with named constants`,
        confidence: 0.65,
        impact: 'low',
        startLine: 0,
        endLine: 0,
        originalCode: magicNums
          .slice(0, 3)
          .map(m => m[1])
          .join(', '),
        suggestedCode: 'const NAMED_CONSTANT = value',
        rationale: 'Named constants improve readability and maintainability',
      })
    }

    // Filter and limit
    const filtered = suggestions
      .filter(s => s.confidence >= this.config.confidenceThreshold)
      .slice(0, this.config.maxSuggestions)

    this.stats.totalSuggestionsGenerated += filtered.length

    // Track confidence
    for (const s of filtered) this.confidenceHistory.push(s.confidence)
    if (this.confidenceHistory.length > 0) {
      this.stats.avgConfidence = round2(
        this.confidenceHistory.reduce((a, b) => a + b, 0) / this.confidenceHistory.length,
      )
    }

    // Compute impact and priority
    const totalImpact = round2(
      filtered.reduce((s, f) => s + (f.impact === 'high' ? 3 : f.impact === 'medium' ? 2 : 1), 0) /
        Math.max(1, filtered.length),
    )
    const estimatedComplexityReduction = round2(
      filtered.filter(s =>
        ['extract_method', 'decompose_conditional', 'simplify_boolean'].includes(s.type),
      ).length * 2.5,
    )
    const priorityOrder = filtered
      .map((s, i) => ({
        i,
        score: s.confidence * (s.impact === 'high' ? 3 : s.impact === 'medium' ? 2 : 1),
      }))
      .sort((a, b) => b.score - a.score)
      .map(x => x.i)

    const parts: string[] = [`${filtered.length} refactoring suggestions`]
    const extractCount = filtered.filter(s => s.type === 'extract_method').length
    const renameCount = filtered.filter(s => s.type === 'rename_symbol').length
    if (extractCount > 0) parts.push(`${extractCount} extractions`)
    if (renameCount > 0) parts.push(`${renameCount} renames`)

    return {
      suggestions: filtered,
      totalImpact,
      estimatedComplexityReduction,
      priorityOrder,
      summary: parts.join(', '),
    }
  }

  // ── Extract Method ──────────────────────────────────────────────────────────

  suggestExtractMethod(code: string): ExtractMethodResult[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const results: ExtractMethodResult[] = []
    const lines = code.split('\n')

    // Find functions and check complexity
    const funcMatches = [
      ...code.matchAll(
        /(?:(?:public|private|protected)\s+)?(?:static\s+)?(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*[^{]*)?\s*\{/g,
      ),
    ]
    for (const fm of funcMatches) {
      const funcName = fm[1]
      const startIdx = fm.index!
      const startLine = code.substring(0, startIdx).split('\n').length

      // Find function body
      let depth = 0
      let endLine = startLine
      for (let i = startLine - 1; i < lines.length; i++) {
        for (const ch of lines[i]) {
          if (ch === '{') depth++
          if (ch === '}') depth--
        }
        if (depth <= 0 && i > startLine - 1) {
          endLine = i + 1
          break
        }
        if (i === lines.length - 1) endLine = i + 1
      }

      const bodyLength = endLine - startLine
      if (bodyLength < 15) continue

      // Look for extractable blocks
      const bodyLines = lines.slice(startLine, endLine - 1)
      const bodyStr = bodyLines.join('\n')

      // Check for complex blocks within
      const complexity =
        countOccurrences(bodyStr, /\bif\b/g) +
        countOccurrences(bodyStr, /\bfor\b/g) +
        countOccurrences(bodyStr, /\bwhile\b/g) +
        countOccurrences(bodyStr, /\bswitch\b/g)

      if (complexity < this.config.minComplexityForExtract) continue

      // Find a block to extract (first nested if/for block with 5+ lines)
      let blockStart = -1
      let blockEnd = -1
      let blockDepth = 0
      for (let i = 0; i < bodyLines.length; i++) {
        const trimmed = bodyLines[i].trim()
        if (blockStart === -1 && /^(if|for|while)\s*\(/.test(trimmed)) {
          blockStart = i
          blockDepth = 0
        }
        if (blockStart !== -1) {
          for (const ch of bodyLines[i]) {
            if (ch === '{') blockDepth++
            if (ch === '}') blockDepth--
          }
          if (blockDepth <= 0 && i > blockStart) {
            blockEnd = i + 1
            break
          }
        }
      }

      if (blockStart !== -1 && blockEnd !== -1 && blockEnd - blockStart >= 5) {
        const extractedBody = bodyLines.slice(blockStart, blockEnd).join('\n')
        // Find variables used
        const usedVars = [
          ...new Set(
            extractedBody
              .match(/\b[a-z]\w*\b/g)
              ?.filter(
                v =>
                  ![
                    'if',
                    'for',
                    'while',
                    'return',
                    'const',
                    'let',
                    'var',
                    'true',
                    'false',
                    'null',
                    'undefined',
                    'new',
                    'this',
                    'else',
                    'break',
                    'continue',
                  ].includes(v),
              ) ?? [],
          ),
        ]
        // Find which are defined outside
        const outerCode = bodyLines.slice(0, blockStart).join('\n')
        const params = usedVars.filter(v => new RegExp(`\\b${v}\\b`).test(outerCode)).slice(0, 5)

        const methodName = `${camelCase(funcName)}Helper`
        const callSite = `this.${methodName}(${params.join(', ')})`

        results.push({
          methodName,
          parameters: params,
          returnType: 'void',
          extractedBody,
          callSite,
          confidence: round2(Math.min(0.9, 0.5 + (blockEnd - blockStart) * 0.02)),
        })
        this.stats.totalExtractMethodSuggestions++
      }
    }

    return results
  }

  // ── Rename Suggestions ──────────────────────────────────────────────────────

  suggestRenames(code: string): RenameResult[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const results: RenameResult[] = []

    // Single-letter variables (non-loop)
    const singleLetterVars = [...code.matchAll(/(?:const|let|var)\s+([a-zA-Z])\s*[=:]/g)]
    for (const m of singleLetterVars) {
      const name = m[1]
      // Skip common loop vars
      if (['i', 'j', 'k', 'x', 'y', 'n', 'e'].includes(name)) continue
      const context = code.substring(Math.max(0, m.index! - 100), m.index! + 200)
      const refs = countOccurrences(code, new RegExp(`\\b${name}\\b`, 'g'))
      let suggestedName = 'value'
      if (/string|text|name|label/.test(context)) suggestedName = 'text'
      else if (/number|count|total|sum/.test(context)) suggestedName = 'count'
      else if (/array|list|items/.test(context)) suggestedName = 'items'
      else if (/boolean|flag|is|has/.test(context)) suggestedName = 'flag'

      results.push({
        oldName: name,
        newName: suggestedName,
        kind: 'variable',
        reason: 'Single-letter variable names reduce readability',
        confidence: 0.7,
        occurrences: refs,
      })
    }

    // Inconsistent naming (snake_case in camelCase codebase)
    const snakeCaseVars = [...code.matchAll(/(?:const|let|var)\s+(\w+_\w+)\s*[=:]/g)]
    const camelVars = countOccurrences(code, /(?:const|let|var)\s+[a-z][a-zA-Z0-9]*\s*[=:]/g)
    if (camelVars > snakeCaseVars.length * 2) {
      for (const sv of snakeCaseVars) {
        const name = sv[1]
        const camelName = name.replace(/_([a-z])/g, (_, c) => (c as string).toUpperCase())
        const refs = countOccurrences(code, new RegExp(`\\b${name}\\b`, 'g'))
        results.push({
          oldName: name,
          newName: camelName,
          kind: 'variable',
          reason: 'Inconsistent naming convention — use camelCase',
          confidence: 0.75,
          occurrences: refs,
        })
      }
    }

    // Boolean variables without is/has/should prefix
    const boolVars = [
      ...code.matchAll(/(?:const|let|var)\s+(\w+)\s*(?::\s*boolean\s*)?=\s*(?:true|false)\b/g),
    ]
    for (const bv of boolVars) {
      const name = bv[1]
      if (/^(is|has|should|can|will|did|was)/.test(name)) continue
      const refs = countOccurrences(code, new RegExp(`\\b${name}\\b`, 'g'))
      const newName = `is${toPascalCase(name)}`
      results.push({
        oldName: name,
        newName,
        kind: 'variable',
        reason: 'Boolean variables should use is/has/should prefix',
        confidence: 0.65,
        occurrences: refs,
      })
    }

    this.stats.totalRenameSuggestions += results.length
    return results
  }

  // ── Simplifications ─────────────────────────────────────────────────────────

  suggestSimplifications(code: string): SimplificationResult[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const results: SimplificationResult[] = []

    // Double negation: !!x, !(!x)
    const doubleNeg = code.match(/!![\w.]+/g)
    if (doubleNeg) {
      for (const dn of doubleNeg) {
        results.push({
          original: dn,
          simplified: `Boolean(${dn.substring(2)})`,
          type: 'boolean',
          confidence: 0.85,
          explanation: 'Replace double negation with explicit Boolean()',
        })
      }
    }

    // if (x) return true; else return false;
    const ifReturnBool = [
      ...code.matchAll(
        /if\s*\(([^)]+)\)\s*(?:return\s+true|{\s*return\s+true\s*;?\s*})\s*;?\s*(?:else\s+)?(?:return\s+false|{\s*return\s+false\s*;?\s*})/g,
      ),
    ]
    for (const m of ifReturnBool) {
      results.push({
        original: m[0],
        simplified: `return ${m[1]}`,
        type: 'conditional',
        confidence: 0.9,
        explanation: 'Simplify if/else returning boolean to direct return',
      })
    }

    // Ternary returning boolean: x ? true : false
    const ternaryBool = [...code.matchAll(/(\w[^?]*)\?\s*true\s*:\s*false/g)]
    for (const tb of ternaryBool) {
      results.push({
        original: tb[0],
        simplified: `Boolean(${tb[1].trim()})`,
        type: 'boolean',
        confidence: 0.85,
        explanation: 'Replace ternary boolean with Boolean()',
      })
    }

    // Unnecessary else after return
    const unnecessaryElse = [...code.matchAll(/return\s+[^;]+;\s*\n\s*}\s*else\s*\{/g)]
    for (const ue of unnecessaryElse) {
      results.push({
        original: ue[0],
        simplified: ue[0].replace(/}\s*else\s*\{/, '}'),
        type: 'guard_clause',
        confidence: 0.8,
        explanation: 'Remove unnecessary else after return (use guard clause)',
      })
    }

    // Negated condition: if (!x) { ... } else { ... } → if (x) { ... } else { ... }
    const negatedIfs = [
      ...code.matchAll(/if\s*\(\s*!(\w+)\s*\)\s*\{([^}]*)\}\s*else\s*\{([^}]*)\}/g),
    ]
    for (const ni of negatedIfs) {
      if (ni[2].trim().length < ni[3].trim().length) {
        results.push({
          original: ni[0].substring(0, 100),
          simplified: `if (${ni[1]}) {${ni[3]}} else {${ni[2]}}`,
          type: 'conditional',
          confidence: 0.6,
          explanation: 'Flip negated condition to improve readability',
        })
      }
    }

    this.stats.totalSimplificationSuggestions += results.length
    return results
  }

  // ── Duplicate Detection ─────────────────────────────────────────────────────

  findDuplicates(code: string): DuplicateBlock[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const results: DuplicateBlock[] = []
    const lines = code.split('\n')
    const normalized = lines.map(l => l.trim())

    const windowSize = 5
    const blocks: Array<{ start: number; end: number; tokens: string }> = []

    for (let i = 0; i <= normalized.length - windowSize; i++) {
      const window = normalized.slice(i, i + windowSize)
      if (window.every(l => l.length > 0)) {
        const tokens = window.map(l => tokenizeLine(l).join(' ')).join('|')
        if (tokenizeLine(tokens).length >= this.config.minDuplicateTokens) {
          blocks.push({ start: i + 1, end: i + windowSize, tokens })
        }
      }
    }

    // Compare blocks
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        if (Math.abs(blocks[i].start - blocks[j].start) < windowSize) continue
        const sim = this.computeTokenSimilarity(blocks[i].tokens, blocks[j].tokens)
        if (sim >= 0.8) {
          const codeA = lines.slice(blocks[i].start - 1, blocks[i].end).join('\n')
          const codeB = lines.slice(blocks[j].start - 1, blocks[j].end).join('\n')
          results.push({
            blockA: { startLine: blocks[i].start, endLine: blocks[i].end, code: codeA },
            blockB: { startLine: blocks[j].start, endLine: blocks[j].end, code: codeB },
            similarity: round2(sim),
            suggestedExtraction: `Extract shared logic into a helper function`,
          })
          this.stats.totalDeduplicationSuggestions++
          if (results.length >= 5) return results
        }
      }
    }

    return results
  }

  // ── Decomposition ───────────────────────────────────────────────────────────

  suggestDecomposition(code: string): RefactoringSuggestion[] {
    this.stats.lastUsedAt = new Date().toISOString()
    const suggestions: RefactoringSuggestion[] = []
    const lines = code.split('\n')

    // Deep nesting
    let maxNesting = 0
    let maxNestingLine = 0
    let currentNesting = 0
    for (let i = 0; i < lines.length; i++) {
      currentNesting += countOccurrences(lines[i], /\{/g) - countOccurrences(lines[i], /\}/g)
      if (currentNesting > maxNesting) {
        maxNesting = currentNesting
        maxNestingLine = i + 1
      }
    }
    if (maxNesting >= 4) {
      suggestions.push({
        type: 'decompose_conditional',
        description: `Deep nesting (${maxNesting} levels) at line ${maxNestingLine}`,
        confidence: round2(Math.min(0.9, 0.5 + maxNesting * 0.1)),
        impact: 'high',
        startLine: maxNestingLine,
        endLine: maxNestingLine,
        originalCode: lines[maxNestingLine - 1]?.trim() ?? '',
        suggestedCode: 'Extract nested logic into separate methods',
        rationale: 'Deep nesting reduces readability — use early returns or extract methods',
      })
      this.stats.totalDecompositionSuggestions++
    }

    // Long if/else chains
    let ifElseChain = 0
    let chainStart = 0
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*(else\s+)?if\s*\(/.test(lines[i])) {
        if (ifElseChain === 0) chainStart = i + 1
        ifElseChain++
      } else if (
        !/^\s*[{}]\s*$/.test(lines[i]) &&
        !/^\s*else\s*\{/.test(lines[i]) &&
        lines[i].trim().length > 0
      ) {
        if (ifElseChain >= 4) {
          suggestions.push({
            type: 'decompose_conditional',
            description: `Long if/else chain (${ifElseChain} branches) starting at line ${chainStart}`,
            confidence: round2(Math.min(0.85, 0.5 + ifElseChain * 0.08)),
            impact: 'medium',
            startLine: chainStart,
            endLine: i,
            originalCode: `if/else chain with ${ifElseChain} branches`,
            suggestedCode: 'Use strategy pattern, lookup table, or polymorphism',
            rationale: 'Long conditional chains should be replaced with dispatch patterns',
          })
          this.stats.totalDecompositionSuggestions++
        }
        ifElseChain = 0
      }
    }

    return suggestions
  }

  // ── Apply Refactoring ───────────────────────────────────────────────────────

  applyRefactoring(code: string, suggestion: RefactoringSuggestion): string {
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalApplied++

    if (
      suggestion.originalCode &&
      suggestion.suggestedCode &&
      code.includes(suggestion.originalCode)
    ) {
      return code.replace(suggestion.originalCode, suggestion.suggestedCode)
    }
    return code
  }

  // ── Estimate Impact ─────────────────────────────────────────────────────────

  estimateImpact(suggestions: RefactoringSuggestion[]): number {
    if (suggestions.length === 0) return 0
    const impactWeights = { low: 1, medium: 2, high: 3 }
    const total = suggestions.reduce((s, sug) => s + impactWeights[sug.impact] * sug.confidence, 0)
    return round2(total / suggestions.length)
  }

  // ── Accessors ───────────────────────────────────────────────────────────────

  getStats(): Readonly<IntelligentRefactorerStats> {
    return { ...this.stats }
  }
  getConfig(): Readonly<IntelligentRefactorerConfig> {
    return { ...this.config }
  }

  // ── Persistence ─────────────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({ config: this.config, stats: this.stats })
  }

  static deserialize(json: string): IntelligentRefactorer {
    const data = JSON.parse(json) as {
      config: IntelligentRefactorerConfig
      stats: IntelligentRefactorerStats
    }
    const instance = new IntelligentRefactorer(data.config)
    Object.assign(instance.stats, data.stats)
    return instance
  }

  // ── Private Helpers ─────────────────────────────────────────────────────────

  private computeTokenSimilarity(a: string, b: string): number {
    const tokensA = a.split(/[| ]+/)
    const tokensB = b.split(/[| ]+/)
    if (tokensA.length === 0 && tokensB.length === 0) return 1
    if (tokensA.length === 0 || tokensB.length === 0) return 0
    const setA = new Set(tokensA)
    const setB = new Set(tokensB)
    let intersection = 0
    for (const t of setA) {
      if (setB.has(t)) intersection++
    }
    return intersection / Math.max(setA.size, setB.size)
  }
}
