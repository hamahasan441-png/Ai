// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║ SEMANTIC BRIDGE — Phase 9 Intelligence Module                               ║
// ║ Bridge between natural language and code semantics: NL↔code translation     ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Configuration ──────────────────────────────────────────────────────────────

export interface SemanticBridgeConfig {
  maxMappings: number
  enableNlToCode: boolean
  enableCodeToNl: boolean
  enableConceptMapping: boolean
  enableSemanticSearch: boolean
  vocabularySize: number
  minSimilarity: number
  maxExplanationLength: number
}

// ── Statistics ──────────────────────────────────────────────────────────────────

export interface SemanticBridgeStats {
  totalTranslations: number
  totalNlToCodeTranslations: number
  totalCodeToNlTranslations: number
  totalConceptMappings: number
  totalSemanticSearches: number
  totalFeedbacks: number
  avgTranslationConfidence: number
  vocabularySize: number
  createdAt: string
  lastUsedAt: string
}

// ── Types ───────────────────────────────────────────────────────────────────────

export interface NlToCodeResult {
  description: string
  language: string
  generatedCode: string
  confidence: number
  mappedConcepts: ConceptMapping[]
  alternatives: string[]
}

export interface CodeToNlResult {
  code: string
  explanation: string
  summary: string
  concepts: string[]
  confidence: number
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex'
}

export interface ConceptMapping {
  nlConcept: string
  codeConcept: string
  relationship: 'equivalent' | 'similar' | 'partial' | 'abstract' | 'concrete'
  confidence: number
  examples: string[]
}

export interface SemanticSearchResult {
  query: string
  matches: SemanticMatch[]
  totalCandidates: number
  durationMs: number
}

export interface SemanticMatch {
  content: string
  score: number
  type: 'code' | 'description' | 'concept'
  highlights: string[]
}

export interface CodeSkeleton {
  language: string
  skeleton: string
  placeholders: SkeletonPlaceholder[]
  confidence: number
}

export interface SkeletonPlaceholder {
  name: string
  description: string
  type: string
  defaultValue: string
}

export interface TranslationFeedback {
  translationType: 'nl_to_code' | 'code_to_nl'
  wasAccurate: boolean
  originalInput: string
  output: string
  correction?: string
}

export interface BridgeAnalysis {
  nlToCode: NlToCodeResult | null
  codeToNl: CodeToNlResult | null
  conceptMappings: ConceptMapping[]
  confidence: number
  durationMs: number
}

// ── Default Config ──────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: SemanticBridgeConfig = {
  maxMappings: 1000,
  enableNlToCode: true,
  enableCodeToNl: true,
  enableConceptMapping: true,
  enableSemanticSearch: true,
  vocabularySize: 10000,
  minSimilarity: 0.2,
  maxExplanationLength: 500,
}

// ── NL ↔ Code Concept Mappings ──────────────────────────────────────────────────

const NL_CODE_MAP: Array<{ nl: string; code: string; rel: ConceptMapping['relationship'] }> = [
  { nl: 'store', code: 'variable', rel: 'equivalent' },
  { nl: 'remember', code: 'variable', rel: 'similar' },
  { nl: 'save', code: 'write/persist', rel: 'equivalent' },
  { nl: 'check', code: 'if/condition', rel: 'equivalent' },
  { nl: 'repeat', code: 'loop/for/while', rel: 'equivalent' },
  { nl: 'list', code: 'array', rel: 'equivalent' },
  { nl: 'collection', code: 'array/set/map', rel: 'similar' },
  { nl: 'group', code: 'object/class', rel: 'similar' },
  { nl: 'action', code: 'function/method', rel: 'equivalent' },
  { nl: 'step', code: 'statement', rel: 'similar' },
  { nl: 'decide', code: 'if/switch', rel: 'equivalent' },
  { nl: 'choose', code: 'switch/conditional', rel: 'equivalent' },
  { nl: 'combine', code: 'merge/concat', rel: 'equivalent' },
  { nl: 'filter', code: 'array.filter', rel: 'equivalent' },
  { nl: 'transform', code: 'array.map', rel: 'equivalent' },
  { nl: 'sort', code: 'array.sort', rel: 'equivalent' },
  { nl: 'find', code: 'array.find/search', rel: 'equivalent' },
  { nl: 'count', code: 'array.length/reduce', rel: 'similar' },
  { nl: 'blueprint', code: 'class/interface', rel: 'abstract' },
  { nl: 'template', code: 'generic/class', rel: 'abstract' },
  { nl: 'send', code: 'fetch/request', rel: 'equivalent' },
  { nl: 'receive', code: 'response/callback', rel: 'equivalent' },
  { nl: 'wait', code: 'await/promise', rel: 'equivalent' },
  { nl: 'error', code: 'throw/catch', rel: 'equivalent' },
  { nl: 'validate', code: 'if/guard/assert', rel: 'equivalent' },
  { nl: 'notify', code: 'event/emit', rel: 'equivalent' },
  { nl: 'connect', code: 'import/require', rel: 'similar' },
  { nl: 'create', code: 'new/constructor', rel: 'equivalent' },
  { nl: 'remove', code: 'delete/splice', rel: 'equivalent' },
  { nl: 'update', code: 'assignment/set', rel: 'equivalent' },
]

// ── Language Templates ──────────────────────────────────────────────────────────

const LANGUAGE_TEMPLATES: Record<string, {
  function: string
  class: string
  interface: string
  test: string
}> = {
  typescript: {
    function: 'export function {{name}}({{params}}): {{returnType}} {\n  {{body}}\n}',
    class: 'export class {{name}} {\n  constructor({{params}}) {\n    {{body}}\n  }\n}',
    interface: 'export interface {{name}} {\n  {{body}}\n}',
    test: "describe('{{name}}', () => {\n  it('should {{description}}', () => {\n    {{body}}\n  })\n})",
  },
  javascript: {
    function: 'function {{name}}({{params}}) {\n  {{body}}\n}',
    class: 'class {{name}} {\n  constructor({{params}}) {\n    {{body}}\n  }\n}',
    interface: '// @typedef {{name}}\n// {{body}}',
    test: "describe('{{name}}', () => {\n  it('should {{description}}', () => {\n    {{body}}\n  })\n})",
  },
  python: {
    function: 'def {{name}}({{params}}):\n    {{body}}',
    class: 'class {{name}}:\n    def __init__(self, {{params}}):\n        {{body}}',
    interface: 'class {{name}}(Protocol):\n    {{body}}',
    test: 'def test_{{name}}():\n    {{body}}',
  },
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1)
}

// ── Main Class ──────────────────────────────────────────────────────────────────

export class SemanticBridge {
  private config: SemanticBridgeConfig
  private stats: SemanticBridgeStats
  private vocabulary: Map<string, string> = new Map()
  private feedbackLog: TranslationFeedback[] = []
  private confidenceValues: number[] = []

  constructor(config?: Partial<SemanticBridgeConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    const now = new Date().toISOString()
    this.stats = {
      totalTranslations: 0,
      totalNlToCodeTranslations: 0,
      totalCodeToNlTranslations: 0,
      totalConceptMappings: 0,
      totalSemanticSearches: 0,
      totalFeedbacks: 0,
      avgTranslationConfidence: 0,
      vocabularySize: 0,
      createdAt: now,
      lastUsedAt: now,
    }
    // Load default vocabulary
    for (const m of NL_CODE_MAP) {
      this.vocabulary.set(m.nl, m.code)
    }
    this.stats.vocabularySize = this.vocabulary.size
  }

  // ── Bidirectional Translation ───────────────────────────────────────────────

  translate(input: string, direction: 'nl_to_code' | 'code_to_nl', language?: string): BridgeAnalysis {
    const start = Date.now()
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalTranslations++

    let nlToCode: NlToCodeResult | null = null
    let codeToNl: CodeToNlResult | null = null

    if (direction === 'nl_to_code' && this.config.enableNlToCode) {
      nlToCode = this.nlToCode(input, language)
    } else if (direction === 'code_to_nl' && this.config.enableCodeToNl) {
      codeToNl = this.codeToNl(input)
    }

    const conceptMappings = this.config.enableConceptMapping
      ? this.mapConcepts(input, direction === 'code_to_nl')
      : []

    const confidence = nlToCode?.confidence ?? codeToNl?.confidence ?? 0
    this.confidenceValues.push(confidence)
    this.stats.avgTranslationConfidence = round2(
      this.confidenceValues.reduce((a, b) => a + b, 0) / this.confidenceValues.length,
    )

    return {
      nlToCode,
      codeToNl,
      conceptMappings,
      confidence,
      durationMs: Date.now() - start,
    }
  }

  // ── NL → Code ──────────────────────────────────────────────────────────────

  nlToCode(description: string, language: string = 'typescript'): NlToCodeResult {
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalNlToCodeTranslations++

    const lower = description.toLowerCase()
    const lang = language.toLowerCase()
    const templates = LANGUAGE_TEMPLATES[lang] ?? LANGUAGE_TEMPLATES.typescript

    // Detect structure type
    let structureType: 'function' | 'class' | 'interface' | 'test' = 'function'
    if (/\bclass\b|\bobject\b|\bentity\b|\bmodel\b/.test(lower)) structureType = 'class'
    else if (/\binterface\b|\btype\b|\bschema\b|\bcontract\b/.test(lower)) structureType = 'interface'
    else if (/\btest\b|\bspec\b|\bverify\b/.test(lower)) structureType = 'test'

    // Extract name (use original description to preserve casing)
    const nameMatch = description.match(/(?:called|named|for)\s+['"]?(\w+)['"]?/i)
    const name = nameMatch?.[1] ?? this.inferName(lower, structureType)

    // Extract parameters
    const params = this.extractParams(lower, lang)

    // Detect return type
    const returnType = this.inferReturnType(lower)

    // Generate code
    let generatedCode = templates[structureType]
    generatedCode = generatedCode.replace(/\{\{name\}\}/g, name)
    generatedCode = generatedCode.replace(/\{\{params\}\}/g, params)
    generatedCode = generatedCode.replace(/\{\{returnType\}\}/g, returnType)
    generatedCode = generatedCode.replace(/\{\{description\}\}/g, description.substring(0, 80))
    generatedCode = generatedCode.replace(/\{\{body\}\}/g, '// TODO: implement')

    const mappedConcepts = this.mapConcepts(description, false)
    const alternatives: string[] = []
    if (structureType === 'function') alternatives.push('Consider using a class method instead')
    if (structureType === 'class') alternatives.push('Consider using a factory function instead')

    return {
      description,
      language: lang,
      generatedCode,
      confidence: round2(Math.min(0.85, 0.4 + mappedConcepts.length * 0.05 + (nameMatch ? 0.1 : 0))),
      mappedConcepts,
      alternatives,
    }
  }

  // ── Code → NL ──────────────────────────────────────────────────────────────

  codeToNl(code: string): CodeToNlResult {
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalCodeToNlTranslations++

    const lines = code.split('\n')
    const concepts: string[] = []
    const parts: string[] = []

    // Detect classes
    const classMatch = code.match(/(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?/)
    if (classMatch) {
      parts.push(`Defines a class '${classMatch[1]}'`)
      concepts.push('class', 'object-oriented')
      if (classMatch[2]) {
        parts.push(`that extends '${classMatch[2]}'`)
        concepts.push('inheritance')
      }
    }

    // Detect functions
    const funcMatches = [...code.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g)]
    for (const fm of funcMatches) {
      const isAsync = /async/.test(fm[0])
      parts.push(`${isAsync ? 'Async function' : 'Function'} '${fm[1]}' with ${fm[2] ? fm[2].split(',').length : 0} parameters`)
      concepts.push('function')
      if (isAsync) concepts.push('async/await')
    }

    // Detect interfaces
    const ifaceMatches = [...code.matchAll(/(?:export\s+)?interface\s+(\w+)/g)]
    for (const im of ifaceMatches) {
      parts.push(`Interface '${im[1]}'`)
      concepts.push('interface', 'type safety')
    }

    // Detect patterns
    if (/try\s*\{/.test(code)) { parts.push('Includes error handling'); concepts.push('error handling') }
    if (/async|await|Promise/.test(code)) { concepts.push('asynchronous') }
    if (/import\s+/.test(code)) { concepts.push('modules') }
    if (/\.map\(|\.filter\(|\.reduce\(/.test(code)) { concepts.push('functional programming') }
    if (/for\s*\(|while\s*\(|\.forEach\(/.test(code)) { concepts.push('iteration') }
    if (/if\s*\(|switch\s*\(/.test(code)) { concepts.push('conditional logic') }

    // Determine complexity
    const cc = (code.match(/\b(if|for|while|case|catch)\b/g) ?? []).length
    let complexity: CodeToNlResult['complexity'] = 'simple'
    if (cc > 15) complexity = 'very_complex'
    else if (cc > 8) complexity = 'complex'
    else if (cc > 3) complexity = 'moderate'

    const explanation = parts.length > 0
      ? parts.join('. ') + '.'
      : 'Code block with ' + lines.length + ' lines.'

    const summary = parts.length > 0
      ? parts[0]
      : `${lines.length}-line code block`

    return {
      code,
      explanation: explanation.substring(0, this.config.maxExplanationLength),
      summary,
      concepts: [...new Set(concepts)],
      confidence: round2(Math.min(0.9, 0.3 + parts.length * 0.1 + concepts.length * 0.05)),
      complexity,
    }
  }

  // ── Concept Mapping ─────────────────────────────────────────────────────────

  mapConcepts(text: string, isCode: boolean): ConceptMapping[] {
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalConceptMappings++

    const mappings: ConceptMapping[] = []
    const lower = text.toLowerCase()

    for (const entry of NL_CODE_MAP) {
      const searchTerm = isCode ? entry.code : entry.nl
      const mapTo = isCode ? entry.nl : entry.code
      const terms = searchTerm.split('/')

      for (const term of terms) {
        if (lower.includes(term)) {
          mappings.push({
            nlConcept: isCode ? mapTo : entry.nl,
            codeConcept: isCode ? entry.code : mapTo,
            relationship: entry.rel,
            confidence: round2(entry.rel === 'equivalent' ? 0.9 : entry.rel === 'similar' ? 0.7 : 0.5),
            examples: [`"${entry.nl}" maps to "${entry.code}"`],
          })
          break
        }
      }
    }

    // Deduplicate
    const seen = new Set<string>()
    return mappings.filter(m => {
      const key = `${m.nlConcept}:${m.codeConcept}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, this.config.maxMappings)
  }

  // ── Skeleton Generation ─────────────────────────────────────────────────────

  generateSkeleton(description: string, language: string = 'typescript'): CodeSkeleton {
    this.stats.lastUsedAt = new Date().toISOString()
    const result = this.nlToCode(description, language)
    const placeholders: SkeletonPlaceholder[] = []

    // Extract placeholders from generated code
    const phMatches = [...result.generatedCode.matchAll(/\{\{(\w+)\}\}/g)]
    for (const ph of phMatches) {
      placeholders.push({
        name: ph[1],
        description: `Replace with actual ${ph[1]}`,
        type: 'string',
        defaultValue: ph[1],
      })
    }

    // Add standard placeholders
    if (result.generatedCode.includes('// TODO')) {
      placeholders.push({
        name: 'implementation',
        description: 'Replace TODO with actual implementation',
        type: 'code',
        defaultValue: '// TODO: implement',
      })
    }

    return {
      language,
      skeleton: result.generatedCode,
      placeholders,
      confidence: result.confidence,
    }
  }

  // ── Semantic Search ─────────────────────────────────────────────────────────

  semanticSearch(query: string, candidates: string[]): SemanticSearchResult {
    const start = Date.now()
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalSemanticSearches++

    const queryTokens = tokenize(query)
    const matches: SemanticMatch[] = []

    for (const candidate of candidates) {
      const candidateTokens = tokenize(candidate)
      const score = this.computeTokenSimilarity(queryTokens, candidateTokens)

      if (score >= this.config.minSimilarity) {
        const highlights = queryTokens.filter(qt => candidateTokens.includes(qt))
        const isCode = /[{};()=>]/.test(candidate)
        matches.push({
          content: candidate,
          score: round2(score),
          type: isCode ? 'code' : 'description',
          highlights,
        })
      }
    }

    matches.sort((a, b) => b.score - a.score)

    return {
      query,
      matches: matches.slice(0, 20),
      totalCandidates: candidates.length,
      durationMs: Date.now() - start,
    }
  }

  // ── Alignment Score ─────────────────────────────────────────────────────────

  computeAlignment(nl: string, code: string): number {
    const nlTokens = tokenize(nl)
    const codeTokens = tokenize(code)

    if (nlTokens.length === 0 || codeTokens.length === 0) return 0

    // Check concept mapping overlap
    const nlMappings = this.mapConcepts(nl, false)
    const codeMappings = this.mapConcepts(code, true)

    let matchCount = 0
    for (const nm of nlMappings) {
      for (const cm of codeMappings) {
        if (nm.codeConcept === cm.codeConcept || nm.nlConcept === cm.nlConcept) {
          matchCount++
          break
        }
      }
    }

    const mappingScore = nlMappings.length > 0 ? matchCount / nlMappings.length : 0

    // Token overlap
    const tokenScore = this.computeTokenSimilarity(nlTokens, codeTokens)

    return round2(mappingScore * 0.6 + tokenScore * 0.4)
  }

  // ── Feedback ────────────────────────────────────────────────────────────────

  provideFeedback(feedback: TranslationFeedback): void {
    this.stats.lastUsedAt = new Date().toISOString()
    this.stats.totalFeedbacks++
    this.feedbackLog.push(feedback)

    // Learn from corrections
    if (feedback.correction) {
      const inputTokens = tokenize(feedback.originalInput)
      const correctionTokens = tokenize(feedback.correction)
      for (const it of inputTokens) {
        for (const ct of correctionTokens) {
          if (!this.vocabulary.has(it) && it !== ct) {
            this.addVocabulary(it, ct, feedback.translationType === 'nl_to_code')
          }
        }
      }
    }
  }

  // ── Vocabulary ──────────────────────────────────────────────────────────────

  addVocabulary(term: string, definition: string, isCode: boolean): void {
    if (this.vocabulary.size < this.config.vocabularySize) {
      const key = isCode ? definition : term
      const value = isCode ? term : definition
      this.vocabulary.set(key, value)
      this.stats.vocabularySize = this.vocabulary.size
    }
  }

  // ── Accessors ───────────────────────────────────────────────────────────────

  getStats(): Readonly<SemanticBridgeStats> { return { ...this.stats } }
  getConfig(): Readonly<SemanticBridgeConfig> { return { ...this.config } }

  // ── Persistence ─────────────────────────────────────────────────────────────

  serialize(): string {
    return JSON.stringify({
      config: this.config,
      stats: this.stats,
      vocabulary: Object.fromEntries(this.vocabulary),
    })
  }

  static deserialize(json: string): SemanticBridge {
    const data = JSON.parse(json) as {
      config: SemanticBridgeConfig
      stats: SemanticBridgeStats
      vocabulary: Record<string, string>
    }
    const instance = new SemanticBridge(data.config)
    Object.assign(instance.stats, data.stats)
    for (const [k, v] of Object.entries(data.vocabulary)) {
      instance.vocabulary.set(k, v)
    }
    instance.stats.vocabularySize = instance.vocabulary.size
    return instance
  }

  // ── Private Helpers ─────────────────────────────────────────────────────────

  private inferName(description: string, structureType: string): string {
    const words = description.split(/\s+/).filter(w => w.length > 2 && !/^(the|that|this|with|from|and|for|a|an)$/i.test(w))
    if (words.length === 0) return structureType === 'class' ? 'MyClass' : 'myFunction'

    if (structureType === 'class' || structureType === 'interface') {
      return words[0].charAt(0).toUpperCase() + words[0].slice(1)
    }
    return words[0].toLowerCase()
  }

  private extractParams(description: string, language: string): string {
    const paramPatterns = [
      /(?:takes?|accepts?|receives?|with)\s+(?:a\s+)?(\w+)(?:\s+and\s+(?:a\s+)?(\w+))?/i,
      /(?:parameters?|params?|args?):\s*(\w+(?:\s*,\s*\w+)*)/i,
    ]

    for (const pattern of paramPatterns) {
      const match = description.match(pattern)
      if (match) {
        const params = [match[1], match[2]].filter(Boolean)
        if (language === 'python') {
          return params.join(', ')
        }
        return params.map(p => `${p}: any`).join(', ')
      }
    }
    return ''
  }

  private inferReturnType(description: string): string {
    if (/\b(return|returns|gives|produces)\s+(?:a\s+)?(number|count|total|sum|average)/i.test(description)) return 'number'
    if (/\b(return|returns|gives|produces)\s+(?:a\s+)?(string|text|name|label)/i.test(description)) return 'string'
    if (/\b(return|returns|gives|produces)\s+(?:a\s+)?(boolean|true|false|flag)/i.test(description)) return 'boolean'
    if (/\b(return|returns|gives|produces)\s+(?:a\s+)?(list|array|items|collection)/i.test(description)) return 'any[]'
    if (/\b(return|returns|gives|produces)\s+(?:a\s+)?(object|data|result)/i.test(description)) return 'Record<string, unknown>'
    if (/\bvoid\b|\bnothing\b|\bno return\b/i.test(description)) return 'void'
    return 'unknown'
  }

  private computeTokenSimilarity(tokensA: string[], tokensB: string[]): number {
    if (tokensA.length === 0 && tokensB.length === 0) return 1
    if (tokensA.length === 0 || tokensB.length === 0) return 0
    const setA = new Set(tokensA)
    const setB = new Set(tokensB)
    let intersection = 0
    for (const t of setA) { if (setB.has(t)) intersection++ }
    const union = new Set([...setA, ...setB]).size
    return union > 0 ? intersection / union : 0
  }
}
