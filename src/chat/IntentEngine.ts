/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🎯  I N T E N T  E N G I N E  —  CLASSIFY & EXTRACT               ║
 * ║                                                                             ║
 * ║   A zero-dependency intent classification and entity extraction engine.      ║
 * ║   Detects what the user wants and pulls out structured data.                ║
 * ║                                                                             ║
 * ║     ✦ Weighted feature matching (triggers, phrases, syntax)                 ║
 * ║     ✦ Entity extraction via pattern dictionaries                            ║
 * ║     ✦ Compound intent splitting ("write X and review Y")                    ║
 * ║     ✦ Pronoun resolution from conversation history                          ║
 * ║                                                                             ║
 * ║   Built from these sections:                                                ║
 * ║                                                                             ║
 * ║     §1  TYPES          — All data shapes for intents & entities             ║
 * ║     §2  DICTIONARIES   — Trigger words, patterns, entity lists              ║
 * ║     §3  ENGINE         — IntentEngine class                                 ║
 * ║                                                                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §1  TYPES — All data shapes for intents & entities                         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Intent Labels ────────────────────────────────────────────────────────────

export type IntentLabel =
  | 'code_write'
  | 'code_review'
  | 'code_explain'
  | 'code_fix'
  | 'code_refactor'
  | 'search'
  | 'learn'
  | 'teach'
  | 'reason'
  | 'compare'
  | 'debug'
  | 'deploy'
  | 'design'
  | 'test'
  | 'document'
  | 'general_chat'
  | 'question'
  | 'task_decompose'

// ── Entity Types ─────────────────────────────────────────────────────────────

export type EntityType =
  | 'programming_language'
  | 'framework'
  | 'library'
  | 'concept'
  | 'file_path'
  | 'url'
  | 'code_snippet'
  | 'number'
  | 'comparison_target'

// ── Core Structures ──────────────────────────────────────────────────────────

/** A single detected intent with confidence score. */
export interface DetectedIntent {
  label: IntentLabel
  confidence: number
  triggers: string[]
}

/** An entity extracted from user input. */
export interface ExtractedEntity {
  type: EntityType
  value: string
  position: number
  confidence: number
}

/** Full classification result for an input string. */
export interface IntentResult {
  primary: DetectedIntent
  secondary: DetectedIntent[]
  entities: ExtractedEntity[]
  isCompound: boolean
}

/** A single turn in conversation history. */
export interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

/** A resolved intent segment from a compound request. */
export interface ResolvedIntent {
  intent: DetectedIntent
  entities: ExtractedEntity[]
  originalSegment: string
}

/** Configuration for the IntentEngine. */
export interface IntentEngineConfig {
  confidenceThreshold: number
  maxIntents: number
  enableEntityExtraction: boolean
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §2  DICTIONARIES — Trigger words, patterns, entity lists                   ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── Intent Definitions ───────────────────────────────────────────────────────

interface IntentDef {
  triggers: string[]
  phrases: RegExp[]
  syntactic: RegExp[]
}

const INTENT_DEFS: Record<IntentLabel, IntentDef> = {
  code_write: {
    triggers: [
      'write', 'create', 'generate', 'implement', 'build', 'code', 'scaffold',
      'make', 'develop', 'program', 'construct', 'craft', 'author',
    ],
    phrases: [
      /write (?:me )?(?:a |an |the )?(?:function|class|module|script|program|component)/i,
      /create (?:a |an )?(?:new )?(?:file|function|api|endpoint|service)/i,
      /generate (?:a |an |the )?(?:code|implementation|boilerplate)/i,
    ],
    syntactic: [
      /^(?:can you |please )?(?:write|create|generate|implement|build)\b/i,
      /\bimplement (?:a |an )?(?:\w+ )*(?:that|which|to)\b/i,
    ],
  },
  code_review: {
    triggers: ['review', 'critique', 'feedback', 'evaluate', 'assess', 'audit', 'inspect'],
    phrases: [
      /review (?:this |my |the )?(?:code|implementation|pull request|pr|diff)/i,
      /give (?:me )?feedback (?:on|about)/i,
      /what do you think (?:of|about) (?:this |my )?code/i,
    ],
    syntactic: [
      /^(?:can you |please )?review\b/i,
      /\bis (?:this|my) (?:code|implementation) (?:ok|good|correct|clean)\b/i,
    ],
  },
  code_explain: {
    triggers: [
      'explain', 'describe', 'clarify', 'elaborate', 'walk through', 'breakdown',
      'what does', 'how does', 'understand',
    ],
    phrases: [
      /explain (?:this |the )?(?:code|function|class|snippet|logic|algorithm)/i,
      /what does (?:this |the )?(?:code|function|line|block) do/i,
      /how does (?:this |the )?(?:code|function|algorithm|logic) work/i,
    ],
    syntactic: [
      /^(?:can you |please )?explain\b/i,
      /\bwalk (?:me )?through\b/i,
    ],
  },
  code_fix: {
    triggers: ['fix', 'repair', 'patch', 'resolve', 'correct', 'solve', 'bug', 'error', 'issue'],
    phrases: [
      /fix (?:this |the |my )?(?:bug|error|issue|problem|code)/i,
      /(?:there|i)'?s? (?:a |an )?(?:bug|error|issue|problem)/i,
      /(?:not |isn't |doesn't )work(?:ing)?\b/i,
    ],
    syntactic: [
      /^(?:can you |please )?fix\b/i,
      /\bwhy (?:is|does|doesn't|isn't)\b.*\b(?:work|fail|crash|break)/i,
    ],
  },
  code_refactor: {
    triggers: [
      'refactor', 'restructure', 'reorganize', 'simplify', 'optimize', 'clean up',
      'improve', 'modernize',
    ],
    phrases: [
      /refactor (?:this |the |my )?(?:code|function|class|module|component)/i,
      /clean (?:up|this) (?:code|implementation)/i,
      /make (?:this |the )?(?:code|implementation) (?:cleaner|simpler|better|faster)/i,
    ],
    syntactic: [
      /^(?:can you |please )?refactor\b/i,
      /\bsimplify (?:this|the|my)\b/i,
    ],
  },
  search: {
    triggers: ['search', 'find', 'look up', 'lookup', 'locate', 'where', 'grep', 'query'],
    phrases: [
      /(?:search|find|look up|locate) (?:for )?(?:a |the )?(?:\w+ )+(?:in|from|within)/i,
      /where (?:is|are|can i find)\b/i,
    ],
    syntactic: [
      /^(?:can you |please )?(?:search|find|locate)\b/i,
      /\bgrep\b/i,
    ],
  },
  learn: {
    triggers: [
      'learn', 'study', 'tutorial', 'course', 'guide', 'introduction', 'getting started',
      'beginner', 'basics',
    ],
    phrases: [
      /(?:i want to |help me )?learn (?:about |how to )?/i,
      /(?:getting started|beginner'?s? guide) (?:with|to|for)/i,
    ],
    syntactic: [
      /^(?:i want to |i'd like to |help me )learn\b/i,
      /\bhow (?:do i|can i|to) (?:get started|begin)\b/i,
    ],
  },
  teach: {
    triggers: ['teach', 'show', 'demonstrate', 'instruct', 'lesson', 'example', 'illustrate'],
    phrases: [
      /(?:teach|show) me (?:how to |about |the )?/i,
      /give (?:me )?(?:an? )?example/i,
    ],
    syntactic: [
      /^(?:can you |please )?(?:teach|show|demonstrate)\b/i,
      /\bdemonstrate (?:how|what|the)\b/i,
    ],
  },
  reason: {
    triggers: [
      'reason', 'think', 'analyze', 'logic', 'deduce', 'infer', 'consider', 'argue',
      'justify', 'prove',
    ],
    phrases: [
      /(?:think|reason) (?:about|through|step by step)/i,
      /what (?:are|would be) the (?:pros|cons|trade-?offs|implications)/i,
    ],
    syntactic: [
      /^(?:let's |can you )(?:think|reason|analyze)\b/i,
      /\bstep by step\b/i,
    ],
  },
  compare: {
    triggers: [
      'compare', 'versus', 'vs', 'difference', 'differ', 'contrast', 'better',
      'which', 'pros and cons',
    ],
    phrases: [
      /compare (?:\w+ )+(?:with|to|vs|versus|and)\b/i,
      /(?:what is|what's) the difference between\b/i,
      /\bvs\.?\b/i,
    ],
    syntactic: [
      /^(?:can you |please )?compare\b/i,
      /\bwhich (?:is|one|should) (?:better|faster|preferred|recommended)\b/i,
    ],
  },
  debug: {
    triggers: [
      'debug', 'trace', 'diagnose', 'troubleshoot', 'investigate', 'stack trace',
      'breakpoint', 'step through', 'log',
    ],
    phrases: [
      /debug (?:this |the |my )?(?:code|issue|error|problem)/i,
      /(?:help me )?(?:troubleshoot|diagnose|investigate)\b/i,
    ],
    syntactic: [
      /^(?:can you |please )?debug\b/i,
      /\bwhy (?:am i|do i) (?:getting|seeing)\b/i,
    ],
  },
  deploy: {
    triggers: [
      'deploy', 'publish', 'release', 'ship', 'launch', 'ci/cd', 'pipeline',
      'docker', 'kubernetes', 'k8s', 'hosting',
    ],
    phrases: [
      /deploy (?:this |the |my )?(?:app|application|service|project|code)/i,
      /set up (?:a |the )?(?:ci\/cd|pipeline|deployment|docker)/i,
    ],
    syntactic: [
      /^(?:can you |please |how do i )?deploy\b/i,
      /\bhow (?:do i|to) (?:deploy|publish|release|ship)\b/i,
    ],
  },
  design: {
    triggers: [
      'design', 'architect', 'architecture', 'pattern', 'structure', 'schema',
      'model', 'plan', 'blueprint', 'diagram', 'uml',
    ],
    phrases: [
      /design (?:a |an |the )?(?:system|api|schema|database|architecture)/i,
      /(?:what|which) (?:design )?pattern (?:should|would|to)\b/i,
    ],
    syntactic: [
      /^(?:can you |please |help me )?design\b/i,
      /\bhow (?:should i|to) (?:structure|architect|organize|model)\b/i,
    ],
  },
  test: {
    triggers: [
      'test', 'spec', 'assert', 'expect', 'mock', 'stub', 'coverage', 'unit test',
      'integration test', 'e2e',
    ],
    phrases: [
      /write (?:a |an |the )?(?:test|spec|unit test|integration test)/i,
      /add (?:tests?|specs?|coverage) (?:for|to)\b/i,
    ],
    syntactic: [
      /^(?:can you |please )?(?:test|add tests)\b/i,
      /\bhow (?:do i|to|should i) test\b/i,
    ],
  },
  document: {
    triggers: [
      'document', 'documentation', 'docs', 'jsdoc', 'readme', 'comment', 'annotate',
      'docstring', 'typedoc',
    ],
    phrases: [
      /(?:write|add|generate) (?:the )?(?:docs?|documentation|comments?|jsdoc|readme)/i,
      /document (?:this |the |my )?(?:code|function|class|api|module)/i,
    ],
    syntactic: [
      /^(?:can you |please )?document\b/i,
      /\badd (?:some )?(?:docs|documentation|comments)\b/i,
    ],
  },
  general_chat: {
    triggers: ['hello', 'hi', 'hey', 'thanks', 'thank', 'bye', 'chat', 'talk', 'sup'],
    phrases: [
      /^(?:hi|hello|hey|howdy|greetings)\b/i,
      /^(?:thanks?|thank you|ty|thx)\b/i,
    ],
    syntactic: [
      /^(?:how are you|what's up|how's it going)/i,
      /^(?:good (?:morning|afternoon|evening|night))/i,
    ],
  },
  question: {
    triggers: ['what', 'why', 'how', 'when', 'who', 'which', 'can', 'does', 'is', 'are'],
    phrases: [
      /^(?:what|why|how|when|who|which) (?:is|are|was|were|do|does|did|can|could|would|should)\b/i,
      /^(?:is|are|can|could|would|should|does|do|did) /i,
    ],
    syntactic: [
      /\?$/,
      /^(?:i have a question|quick question|wondering)\b/i,
    ],
  },
  task_decompose: {
    triggers: [
      'break down', 'decompose', 'split', 'steps', 'plan', 'outline', 'roadmap',
      'subtasks', 'milestones', 'phases',
    ],
    phrases: [
      /break (?:this |it )?(?:down|into|apart)/i,
      /(?:create|make|give me) (?:a |an )?(?:plan|roadmap|outline|breakdown)/i,
    ],
    syntactic: [
      /^(?:can you |please )?(?:break down|decompose|plan out)\b/i,
      /\bwhat (?:are|would be) the (?:steps|phases|milestones)\b/i,
    ],
  },
}

// ── Weight Constants ─────────────────────────────────────────────────────────

const TRIGGER_WEIGHT = 1.0
const PHRASE_WEIGHT = 1.5
const SYNTACTIC_WEIGHT = 2.0

// ── Entity Dictionaries ──────────────────────────────────────────────────────

const PROGRAMMING_LANGUAGES: ReadonlySet<string> = new Set([
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'c++', 'csharp', 'c#',
  'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'perl',
  'r', 'matlab', 'lua', 'haskell', 'elixir', 'erlang', 'clojure', 'dart', 'julia',
  'objective-c', 'objc', 'fortran', 'cobol', 'pascal', 'assembly', 'asm',
  'bash', 'shell', 'powershell', 'sql', 'plsql', 'tsql', 'graphql', 'html', 'css',
  'sass', 'scss', 'less', 'xml', 'json', 'yaml', 'yml', 'toml', 'markdown',
  'latex', 'tex', 'vhdl', 'verilog', 'systemverilog', 'prolog', 'lisp',
  'scheme', 'racket', 'ocaml', 'fsharp', 'f#', 'elm', 'purescript', 'nim',
  'zig', 'crystal', 'v', 'vlang', 'groovy', 'coffeescript', 'reason', 'rescript',
  'solidity', 'vyper', 'move', 'cairo', 'wasm', 'webassembly', 'abap', 'apex',
  'ada', 'algol', 'apl', 'awk', 'basic', 'brainfuck', 'd', 'delphi',
  'smalltalk', 'tcl', 'forth', 'io', 'j', 'k', 'q',
])

const FRAMEWORKS: ReadonlySet<string> = new Set([
  'react', 'angular', 'vue', 'svelte', 'next', 'nextjs', 'next.js', 'nuxt', 'nuxtjs',
  'express', 'fastify', 'koa', 'hapi', 'nest', 'nestjs', 'django', 'flask', 'fastapi',
  'spring', 'spring boot', 'rails', 'ruby on rails', 'laravel', 'symfony',
  'gin', 'echo', 'fiber', 'actix', 'rocket', 'axum', 'warp',
  'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'pandas', 'numpy',
  'electron', 'tauri', 'react native', 'flutter', 'ionic', 'capacitor',
  'tailwind', 'tailwindcss', 'bootstrap', 'material-ui', 'mui', 'chakra',
  'remix', 'gatsby', 'astro', 'solid', 'solidjs', 'qwik', 'htmx', 'alpine',
  'jquery', 'backbone', 'ember', 'lit', 'stencil', 'preact',
])

// ── Entity Patterns ──────────────────────────────────────────────────────────

const FILE_PATH_RE = /(?:\.\/|\.\.\/|\/)?[\w.-]+(?:\/[\w.-]+)+\.\w+/g
const URL_RE = /https?:\/\/[^\s),]+/g
const CODE_SNIPPET_RE = /`([^`]+)`/g
const NUMBER_RE = /\b\d+(?:\.\d+)?\b/g

// ── Compound Splitting ───────────────────────────────────────────────────────

const COMPOUND_SEPARATORS = /\b(?:and then|and also|and|also|then|plus|as well as)\b/i

// ── Pronoun Patterns ─────────────────────────────────────────────────────────

const PRONOUN_RE = /\b(it|that|this|those|these|them)\b/i

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  §3  ENGINE — IntentEngine class                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * 🎯 IntentEngine — Classify user input and extract structured entities.
 *
 * Uses three-tier weighted feature matching:
 *  - Trigger words (weight 1.0) — individual keyword hits
 *  - Phrase patterns (weight 1.5) — multi-word phrase regex matches
 *  - Syntactic patterns (weight 2.0) — sentence-structure regex matches
 *
 * @example
 * ```ts
 * const engine = new IntentEngine()
 * const result = engine.classify('Write a React component that fetches users')
 * console.log(result.primary.label)   // 'code_write'
 * console.log(result.entities)        // [{ type: 'framework', value: 'react', ... }]
 * ```
 */
export class IntentEngine {
  private readonly config: IntentEngineConfig

  constructor(config?: Partial<IntentEngineConfig>) {
    this.config = {
      confidenceThreshold: config?.confidenceThreshold ?? 0.1,
      maxIntents: config?.maxIntents ?? 5,
      enableEntityExtraction: config?.enableEntityExtraction ?? true,
    }
  }

  // ── classify ─────────────────────────────────────────────────────────────

  /** Classify input text and return ranked intents with optional entities. */
  classify(input: string, context?: ConversationTurn[]): IntentResult {
    const resolved = context && context.length > 0
      ? this.resolveReferences(input, context)
      : input

    const lower = resolved.toLowerCase()
    const scored: { label: IntentLabel; score: number; triggers: string[] }[] = []

    for (const [label, def] of Object.entries(INTENT_DEFS) as [IntentLabel, IntentDef][]) {
      let score = 0
      const triggers: string[] = []

      // Tier 1 — trigger words (weight 1.0)
      for (const trigger of def.triggers) {
        if (lower.includes(trigger)) {
          score += TRIGGER_WEIGHT
          triggers.push(trigger)
        }
      }

      // Tier 2 — phrase patterns (weight 1.5)
      for (const phrase of def.phrases) {
        if (phrase.test(resolved)) {
          score += PHRASE_WEIGHT
          triggers.push(phrase.source)
        }
      }

      // Tier 3 — syntactic patterns (weight 2.0)
      for (const pattern of def.syntactic) {
        if (pattern.test(resolved)) {
          score += SYNTACTIC_WEIGHT
          triggers.push(pattern.source)
        }
      }

      if (score > 0) {
        scored.push({ label, score, triggers })
      }
    }

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score)

    // Normalise scores into 0-1 confidence
    const maxScore = scored.length > 0 ? scored[0].score : 1
    const normalised = scored.map(s => ({
      label: s.label,
      confidence: Math.min(s.score / Math.max(maxScore, 1), 1),
      triggers: s.triggers,
    }))

    // Apply threshold and cap
    const filtered = normalised.filter(
      s => s.confidence >= this.config.confidenceThreshold,
    )
    const capped = filtered.slice(0, this.config.maxIntents)

    const primary: DetectedIntent = capped.length > 0
      ? capped[0]
      : { label: 'general_chat', confidence: 0.5, triggers: [] }

    const secondary = capped.slice(1)

    const entities = this.config.enableEntityExtraction
      ? this.extractEntities(resolved)
      : []

    const isCompound = COMPOUND_SEPARATORS.test(input)

    return { primary, secondary, entities, isCompound }
  }

  // ── extractEntities ──────────────────────────────────────────────────────

  /** Extract typed entities from input text using pattern dictionaries. */
  extractEntities(input: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = []
    const lower = input.toLowerCase()

    // Programming languages
    for (const lang of PROGRAMMING_LANGUAGES) {
      const idx = lower.indexOf(lang)
      if (idx !== -1 && this.isWordBoundary(lower, idx, lang.length)) {
        entities.push({
          type: 'programming_language',
          value: lang,
          position: idx,
          confidence: 0.95,
        })
      }
    }

    // Frameworks
    for (const fw of FRAMEWORKS) {
      const idx = lower.indexOf(fw)
      if (idx !== -1 && this.isWordBoundary(lower, idx, fw.length)) {
        entities.push({
          type: 'framework',
          value: fw,
          position: idx,
          confidence: 0.9,
        })
      }
    }

    // File paths
    for (const match of input.matchAll(FILE_PATH_RE)) {
      entities.push({
        type: 'file_path',
        value: match[0],
        position: match.index ?? 0,
        confidence: 0.85,
      })
    }

    // URLs
    for (const match of input.matchAll(URL_RE)) {
      entities.push({
        type: 'url',
        value: match[0],
        position: match.index ?? 0,
        confidence: 0.95,
      })
    }

    // Code snippets (backtick-wrapped)
    for (const match of input.matchAll(CODE_SNIPPET_RE)) {
      entities.push({
        type: 'code_snippet',
        value: match[1],
        position: match.index ?? 0,
        confidence: 0.9,
      })
    }

    // Numbers (skip those already inside file paths or URLs)
    const occupiedRanges = entities
      .filter(e => e.type === 'file_path' || e.type === 'url')
      .map(e => [e.position, e.position + e.value.length] as const)

    for (const match of input.matchAll(NUMBER_RE)) {
      const pos = match.index ?? 0
      const inside = occupiedRanges.some(([s, e]) => pos >= s && pos < e)
      if (!inside) {
        entities.push({
          type: 'number',
          value: match[0],
          position: pos,
          confidence: 0.8,
        })
      }
    }

    // Comparison targets — "X vs Y", "X or Y", "between X and Y"
    const vsMatch = input.match(/(\b[\w.#+]+)\s+(?:vs\.?|versus)\s+([\w.#+]+)/i)
    if (vsMatch) {
      entities.push(
        {
          type: 'comparison_target',
          value: vsMatch[1],
          position: vsMatch.index ?? 0,
          confidence: 0.85,
        },
        {
          type: 'comparison_target',
          value: vsMatch[2],
          position: (vsMatch.index ?? 0) + vsMatch[0].indexOf(vsMatch[2]),
          confidence: 0.85,
        },
      )
    }

    const betweenMatch = input.match(/between\s+([\w.#+]+)\s+and\s+([\w.#+]+)/i)
    if (betweenMatch) {
      entities.push(
        {
          type: 'comparison_target',
          value: betweenMatch[1],
          position: betweenMatch.index ?? 0,
          confidence: 0.85,
        },
        {
          type: 'comparison_target',
          value: betweenMatch[2],
          position:
            (betweenMatch.index ?? 0) + betweenMatch[0].indexOf(betweenMatch[2]),
          confidence: 0.85,
        },
      )
    }

    // Deduplicate by (type, value, position)
    const seen = new Set<string>()
    return entities.filter(e => {
      const key = `${e.type}:${e.value}:${e.position}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // ── resolveCompound ──────────────────────────────────────────────────────

  /** Split compound requests into individual resolved intents. */
  resolveCompound(input: string): ResolvedIntent[] {
    const segments = input.split(COMPOUND_SEPARATORS).map(s => s.trim()).filter(Boolean)

    if (segments.length <= 1) {
      const result = this.classify(input)
      return [{
        intent: result.primary,
        entities: result.entities,
        originalSegment: input,
      }]
    }

    return segments.map(segment => {
      const result = this.classify(segment)
      return {
        intent: result.primary,
        entities: result.entities,
        originalSegment: segment,
      }
    })
  }

  // ── resolveReferences ────────────────────────────────────────────────────

  /**
   * Resolve pronouns ("it", "that", "this") by substituting the last
   * relevant noun phrase from conversation history.
   */
  resolveReferences(input: string, context: ConversationTurn[]): string {
    if (!PRONOUN_RE.test(input) || context.length === 0) {
      return input
    }

    const lastNoun = this.extractLastNoun(context)
    if (!lastNoun) return input

    return input.replace(new RegExp(PRONOUN_RE.source, 'gi'), (_match, pronoun: string) => {
      const lower = pronoun.toLowerCase()
      if (['it', 'that', 'this', 'those', 'these', 'them'].includes(lower)) {
        return lastNoun
      }
      return pronoun
    })
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  /** Check whether the substring at `idx` with `len` sits on word boundaries. */
  private isWordBoundary(text: string, idx: number, len: number): boolean {
    const before = idx === 0 || /\W/.test(text[idx - 1])
    const after = idx + len >= text.length || /\W/.test(text[idx + len])
    return before && after
  }

  /**
   * Walk conversation history backwards and extract the last meaningful
   * noun phrase from user messages to use as pronoun replacement.
   */
  private extractLastNoun(context: ConversationTurn[]): string | null {
    // Walk backwards through user turns
    for (let i = context.length - 1; i >= 0; i--) {
      const turn = context[i]
      if (turn.role !== 'user') continue

      const content = turn.content

      // Try code entity names first (backtick-wrapped)
      const codeMatch = content.match(/`([^`]+)`/)
      if (codeMatch) return codeMatch[1]

      // Try quoted strings
      const quoteMatch = content.match(/"([^"]+)"/)
      if (quoteMatch) return quoteMatch[1]

      // Try known programming languages / frameworks
      const lower = content.toLowerCase()
      for (const lang of PROGRAMMING_LANGUAGES) {
        const langIdx = lower.indexOf(lang)
        if (langIdx !== -1 && this.isWordBoundary(lower, langIdx, lang.length)) {
          return lang
        }
      }
      for (const fw of FRAMEWORKS) {
        const fwIdx = lower.indexOf(fw)
        if (fwIdx !== -1 && this.isWordBoundary(lower, fwIdx, fw.length)) {
          return fw
        }
      }

      // Fall back to last significant noun-like phrase:
      // grab the last capitalised word or the last multi-word phrase after "the/a/an/my"
      const articleMatch = content.match(/(?:the|a|an|my|this|that)\s+([\w][\w\s]{0,30}?\w)\b/i)
      if (articleMatch) return articleMatch[1].trim()

      // Last word longer than 3 chars as fallback
      const words = content.split(/\s+/).filter(w => w.length > 3 && /^[a-z]/i.test(w))
      if (words.length > 0) return words[words.length - 1]
    }

    return null
  }
}
