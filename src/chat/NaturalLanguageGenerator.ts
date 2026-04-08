/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  NaturalLanguageGenerator — Template-based NLG & style adaptation          ║
 * ║                                                                            ║
 * ║  Advanced natural language generation with template interpolation,         ║
 * ║  paraphrasing, style transfer, text planning, surface realization,         ║
 * ║  and discourse structuring for high-quality text output.                   ║
 * ║                                                                            ║
 * ║  Key capabilities:                                                         ║
 * ║    • Template registry with slot interpolation                            ║
 * ║    • Paraphrasing via synonym replacement & restructuring                 ║
 * ║    • Style adaptation (formal/casual/technical/friendly)                  ║
 * ║    • Text planning with rhetorical structure                              ║
 * ║    • Surface realization from semantic representations                    ║
 * ║    • Discourse connectives & coherence management                         ║
 * ║    • Sentence variety scoring & enhancement                               ║
 * ║    • Readability analysis (Flesch-Kincaid, syllable counting)             ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type WritingStyle = 'formal' | 'casual' | 'technical' | 'friendly' | 'academic' | 'persuasive' | 'narrative'

export type DiscourseRelation = 'elaboration' | 'contrast' | 'cause' | 'result' | 'sequence' | 'condition' | 'comparison' | 'summary'

export type SentenceType = 'declarative' | 'interrogative' | 'imperative' | 'exclamatory'

export interface NLGTemplate {
  readonly id: string
  readonly name: string
  readonly pattern: string            // e.g. "The {subject} {verb} {object}."
  readonly slots: readonly string[]
  readonly style: WritingStyle
  readonly category: string
}

export interface TextPlan {
  readonly goal: string
  readonly sections: readonly TextSection[]
  readonly style: WritingStyle
  readonly targetAudience: string
}

export interface TextSection {
  readonly heading: string
  readonly points: readonly string[]
  readonly relation: DiscourseRelation
}

export interface ParaphraseResult {
  readonly original: string
  readonly paraphrases: readonly string[]
  readonly method: string
}

export interface StyleTransferResult {
  readonly original: string
  readonly transferred: string
  readonly fromStyle: WritingStyle
  readonly toStyle: WritingStyle
  readonly confidence: number
}

export interface ReadabilityScore {
  readonly fleschKincaid: number
  readonly avgSentenceLength: number
  readonly avgWordLength: number
  readonly syllableCount: number
  readonly wordCount: number
  readonly sentenceCount: number
  readonly complexity: 'easy' | 'moderate' | 'hard' | 'very_hard'
}

export interface SentenceVariety {
  readonly uniqueStarters: number
  readonly avgLength: number
  readonly lengthVariance: number
  readonly typeDistribution: Record<SentenceType, number>
  readonly score: number   // 0–1
}

export interface GeneratedText {
  readonly text: string
  readonly style: WritingStyle
  readonly readability: ReadabilityScore
  readonly variety: SentenceVariety
}

export interface NaturalLanguageGeneratorConfig {
  readonly maxTemplates: number
  readonly defaultStyle: WritingStyle
  readonly enableReadabilityCheck: boolean
  readonly targetReadabilityGrade: number
}

export interface NaturalLanguageGeneratorStats {
  readonly totalGenerations: number
  readonly totalParaphrases: number
  readonly totalStyleTransfers: number
  readonly totalTemplates: number
  readonly feedbackCount: number
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_NLG_CONFIG: NaturalLanguageGeneratorConfig = {
  maxTemplates: 500,
  defaultStyle: 'formal',
  enableReadabilityCheck: true,
  targetReadabilityGrade: 10,
}

// ─── Data ──────────────────────────────────────────────────────────────────────

function buildSynonymMap(): ReadonlyMap<string, readonly string[]> {
  const m = new Map<string, readonly string[]>()
  const add = (word: string, syns: string[]) => m.set(word, syns)
  add('good', ['excellent', 'great', 'fine', 'superb', 'outstanding'])
  add('bad', ['poor', 'terrible', 'awful', 'dreadful', 'inferior'])
  add('big', ['large', 'enormous', 'vast', 'substantial', 'massive'])
  add('small', ['tiny', 'little', 'compact', 'miniature', 'diminutive'])
  add('fast', ['quick', 'rapid', 'swift', 'speedy', 'prompt'])
  add('slow', ['gradual', 'unhurried', 'leisurely', 'sluggish', 'measured'])
  add('important', ['significant', 'crucial', 'vital', 'essential', 'critical'])
  add('difficult', ['challenging', 'complex', 'tough', 'demanding', 'arduous'])
  add('easy', ['simple', 'straightforward', 'effortless', 'uncomplicated'])
  add('help', ['assist', 'support', 'aid', 'facilitate', 'enable'])
  add('show', ['demonstrate', 'illustrate', 'reveal', 'display', 'present'])
  add('make', ['create', 'produce', 'generate', 'build', 'construct'])
  add('use', ['utilize', 'employ', 'apply', 'leverage', 'harness'])
  add('think', ['consider', 'believe', 'contemplate', 'reflect', 'ponder'])
  add('get', ['obtain', 'acquire', 'receive', 'gain', 'procure'])
  add('give', ['provide', 'offer', 'supply', 'deliver', 'furnish'])
  add('start', ['begin', 'commence', 'initiate', 'launch', 'embark'])
  add('end', ['finish', 'conclude', 'complete', 'terminate', 'finalize'])
  add('increase', ['grow', 'expand', 'rise', 'escalate', 'amplify'])
  add('decrease', ['reduce', 'diminish', 'decline', 'shrink', 'lessen'])
  return m
}

function buildConnectives(): ReadonlyMap<DiscourseRelation, readonly string[]> {
  const m = new Map<DiscourseRelation, readonly string[]>()
  m.set('elaboration', ['Furthermore', 'Moreover', 'In addition', 'Additionally', 'Specifically'])
  m.set('contrast', ['However', 'On the other hand', 'Nevertheless', 'Conversely', 'In contrast'])
  m.set('cause', ['Because', 'Since', 'Due to this', 'As a result of this', 'Owing to'])
  m.set('result', ['Therefore', 'Consequently', 'As a result', 'Thus', 'Hence'])
  m.set('sequence', ['First', 'Next', 'Then', 'Subsequently', 'Finally'])
  m.set('condition', ['If', 'Provided that', 'Assuming', 'In the event that', 'Given that'])
  m.set('comparison', ['Similarly', 'Likewise', 'In the same way', 'Comparably', 'Just as'])
  m.set('summary', ['In summary', 'To conclude', 'Overall', 'In brief', 'To summarize'])
  return m
}

function buildStyleMarkers(): ReadonlyMap<WritingStyle, { readonly openers: readonly string[]; readonly closers: readonly string[]; readonly tone: string }> {
  const m = new Map<WritingStyle, { readonly openers: readonly string[]; readonly closers: readonly string[]; readonly tone: string }>()
  m.set('formal', { openers: ['It is worth noting that', 'One should consider', 'It is evident that'], closers: ['In conclusion,', 'To summarize,', 'In light of the above,'], tone: 'professional' })
  m.set('casual', { openers: ['So basically', 'Here\'s the thing', 'Let me tell you'], closers: ['Anyway,', 'So yeah,', 'That\'s about it.'], tone: 'relaxed' })
  m.set('technical', { openers: ['The implementation involves', 'Technically speaking', 'From an engineering perspective'], closers: ['In terms of performance,', 'This approach ensures', 'The architecture supports'], tone: 'precise' })
  m.set('friendly', { openers: ['Great question!', 'I\'m glad you asked', 'Let\'s explore this together'], closers: ['Hope this helps!', 'Feel free to ask more!', 'Happy to help further!'], tone: 'warm' })
  m.set('academic', { openers: ['Research indicates that', 'According to the literature', 'Studies have shown'], closers: ['Further research is needed', 'These findings suggest', 'The evidence demonstrates'], tone: 'scholarly' })
  m.set('persuasive', { openers: ['Consider the compelling evidence', 'It is undeniable that', 'The facts clearly show'], closers: ['The choice is clear.', 'Take action now.', 'Don\'t miss this opportunity.'], tone: 'convincing' })
  m.set('narrative', { openers: ['Once upon a time', 'Picture this:', 'Imagine a world where'], closers: ['And so the story goes.', 'That\'s how it all unfolded.', 'The journey continues.'], tone: 'storytelling' })
  return m
}

const SYNONYM_MAP = buildSynonymMap()
const CONNECTIVES = buildConnectives()
const STYLE_MARKERS = buildStyleMarkers()

// ─── Helpers ───────────────────────────────────────────────────────────────────

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length <= 2) return 1
  let count = 0
  const vowels = 'aeiouy'
  let prevVowel = false
  for (const ch of w) {
    const isVowel = vowels.includes(ch)
    if (isVowel && !prevVowel) count++
    prevVowel = isVowel
  }
  if (w.endsWith('e') && count > 1) count--
  return Math.max(1, count)
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0)
}

function classifySentence(s: string): SentenceType {
  const trimmed = s.trim()
  if (trimmed.endsWith('?')) return 'interrogative'
  if (trimmed.endsWith('!')) return 'exclamatory'
  if (/^(please|do|don't|let|make sure|ensure)/i.test(trimmed)) return 'imperative'
  return 'declarative'
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export class NaturalLanguageGenerator {
  private readonly config: NaturalLanguageGeneratorConfig
  private readonly templates = new Map<string, NLGTemplate>()
  private stats: { totalGenerations: number; totalParaphrases: number; totalStyleTransfers: number; feedbackCount: number } = {
    totalGenerations: 0, totalParaphrases: 0, totalStyleTransfers: 0, feedbackCount: 0,
  }

  constructor(config: Partial<NaturalLanguageGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_NLG_CONFIG, ...config }
  }

  // ── Template management ──────────────────────────────────────────────

  registerTemplate(name: string, pattern: string, style: WritingStyle = 'formal', category: string = 'general'): NLGTemplate {
    const slots = [...pattern.matchAll(/\{(\w+)\}/g)].map(m => m[1])
    const id = `tpl_${this.templates.size + 1}`
    const tpl: NLGTemplate = { id, name, pattern, slots, style, category }
    this.templates.set(id, tpl)
    return tpl
  }

  getTemplate(id: string): NLGTemplate | null {
    return this.templates.get(id) ?? null
  }

  findTemplates(category: string): NLGTemplate[] {
    return [...this.templates.values()].filter(t => t.category === category)
  }

  // ── Template-based generation ────────────────────────────────────────

  generateFromTemplate(templateId: string, slots: Record<string, string>): string | null {
    const tpl = this.templates.get(templateId)
    if (!tpl) return null
    this.stats.totalGenerations++
    let text = tpl.pattern
    for (const [key, value] of Object.entries(slots)) {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }
    return text
  }

  // ── Paraphrasing ─────────────────────────────────────────────────────

  paraphrase(text: string, count: number = 3): ParaphraseResult {
    this.stats.totalParaphrases++
    const paraphrases: string[] = []
    const words = text.split(/\s+/)

    // Method 1: Synonym replacement
    for (let i = 0; i < Math.min(count, 3); i++) {
      const newWords = words.map((w, idx) => {
        const clean = w.toLowerCase().replace(/[^a-z]/g, '')
        const syns = SYNONYM_MAP.get(clean)
        if (syns && syns.length > i) {
          const replacement = syns[i % syns.length]
          // Preserve original casing
          return w[0] === w[0].toUpperCase() ? replacement[0].toUpperCase() + replacement.slice(1) : replacement
        }
        return w
      })
      const result = newWords.join(' ')
      if (result !== text && !paraphrases.includes(result)) {
        paraphrases.push(result)
      }
    }

    // Method 2: Restructure (passive/active swap attempt)
    if (paraphrases.length < count) {
      const sentences = splitSentences(text)
      if (sentences.length > 1) {
        paraphrases.push(sentences.reverse().join(' '))
      }
    }

    return { original: text, paraphrases, method: 'synonym_replacement' }
  }

  // ── Style transfer ───────────────────────────────────────────────────

  transferStyle(text: string, targetStyle: WritingStyle): StyleTransferResult {
    this.stats.totalStyleTransfers++
    const markers = STYLE_MARKERS.get(targetStyle)
    if (!markers) {
      return { original: text, transferred: text, fromStyle: 'formal', toStyle: targetStyle, confidence: 0 }
    }

    // Detect current style
    let detectedStyle: WritingStyle = 'formal'
    for (const [style, m] of STYLE_MARKERS) {
      if (m.openers.some(o => text.toLowerCase().includes(o.toLowerCase()))) {
        detectedStyle = style
        break
      }
    }

    // Apply style markers
    const sentences = splitSentences(text)
    let transferred: string

    if (sentences.length > 0) {
      const opener = markers.openers[0]
      const closer = markers.closers[0]

      if (targetStyle === 'casual') {
        transferred = `${opener}, ${sentences.map(s => s.replace(/It is |One should |Furthermore,? ?/gi, '')).join(' ')} ${closer}`
      } else if (targetStyle === 'friendly') {
        transferred = `${opener}! ${sentences.join(' ')} ${closer}`
      } else {
        transferred = `${opener}, ${sentences.join(' ')} ${closer}`
      }
    } else {
      transferred = text
    }

    return {
      original: text,
      transferred: transferred.trim(),
      fromStyle: detectedStyle,
      toStyle: targetStyle,
      confidence: detectedStyle !== targetStyle ? 0.75 : 0.95,
    }
  }

  // ── Text planning ────────────────────────────────────────────────────

  createTextPlan(goal: string, points: string[], style: WritingStyle = 'formal', audience: string = 'general'): TextPlan {
    const relations: DiscourseRelation[] = ['elaboration', 'sequence', 'result', 'summary']
    const sections: TextSection[] = []

    const chunkSize = Math.max(1, Math.ceil(points.length / 4))
    for (let i = 0; i < points.length; i += chunkSize) {
      const chunk = points.slice(i, i + chunkSize)
      const sectionIdx = Math.floor(i / chunkSize)
      sections.push({
        heading: sectionIdx === 0 ? 'Introduction' : sectionIdx === Math.floor(points.length / chunkSize) ? 'Conclusion' : `Section ${sectionIdx + 1}`,
        points: chunk,
        relation: relations[Math.min(sectionIdx, relations.length - 1)],
      })
    }

    return { goal, sections, style, targetAudience: audience }
  }

  // ── Surface realization ──────────────────────────────────────────────

  realizeFromPlan(plan: TextPlan): GeneratedText {
    this.stats.totalGenerations++
    const parts: string[] = []

    for (const section of plan.sections) {
      const connectives = CONNECTIVES.get(section.relation) ?? ['']
      const connective = connectives[0]

      if (section.points.length > 0) {
        parts.push(`${connective}, ${section.points.join('. ')}.`)
      }
    }

    const text = parts.join(' ').replace(/\.\./g, '.').replace(/,\s*,/g, ',').trim()
    return {
      text,
      style: plan.style,
      readability: this.analyzeReadability(text),
      variety: this.analyzeSentenceVariety(text),
    }
  }

  // ── Discourse connective insertion ───────────────────────────────────

  addConnective(text: string, relation: DiscourseRelation): string {
    const connectives = CONNECTIVES.get(relation)
    if (!connectives || connectives.length === 0) return text
    return `${connectives[0]}, ${text}`
  }

  getConnectives(relation: DiscourseRelation): readonly string[] {
    return CONNECTIVES.get(relation) ?? []
  }

  // ── Readability analysis ─────────────────────────────────────────────

  analyzeReadability(text: string): ReadabilityScore {
    const sentences = splitSentences(text)
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0)

    const sentenceCount = Math.max(1, sentences.length)
    const wordCount = Math.max(1, words.length)
    const avgSentenceLength = wordCount / sentenceCount
    const avgWordLength = words.reduce((s, w) => s + w.replace(/[^a-z]/gi, '').length, 0) / wordCount

    // Flesch-Kincaid Grade Level
    const fk = 0.39 * avgSentenceLength + 11.8 * (syllables / wordCount) - 15.59

    let complexity: 'easy' | 'moderate' | 'hard' | 'very_hard'
    if (fk < 6) complexity = 'easy'
    else if (fk < 10) complexity = 'moderate'
    else if (fk < 14) complexity = 'hard'
    else complexity = 'very_hard'

    return { fleschKincaid: Math.round(fk * 100) / 100, avgSentenceLength, avgWordLength, syllableCount: syllables, wordCount, sentenceCount, complexity }
  }

  // ── Sentence variety ─────────────────────────────────────────────────

  analyzeSentenceVariety(text: string): SentenceVariety {
    const sentences = splitSentences(text)
    if (sentences.length === 0) {
      return { uniqueStarters: 0, avgLength: 0, lengthVariance: 0, typeDistribution: { declarative: 0, interrogative: 0, imperative: 0, exclamatory: 0 }, score: 0 }
    }

    const starters = new Set(sentences.map(s => s.split(/\s+/)[0]?.toLowerCase()))
    const lengths = sentences.map(s => s.split(/\s+/).length)
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((sum, l) => sum + (l - avgLength) ** 2, 0) / lengths.length

    const typeDist: Record<SentenceType, number> = { declarative: 0, interrogative: 0, imperative: 0, exclamatory: 0 }
    for (const s of sentences) {
      typeDist[classifySentence(s)]++
    }

    const starterRatio = starters.size / sentences.length
    const typeCount = Object.values(typeDist).filter(v => v > 0).length
    const score = Math.min(1, starterRatio * 0.5 + (typeCount / 4) * 0.3 + Math.min(1, variance / 10) * 0.2)

    return { uniqueStarters: starters.size, avgLength, lengthVariance: variance, typeDistribution: typeDist, score }
  }

  // ── Stats & serialization ────────────────────────────────────────────

  getStats(): Readonly<NaturalLanguageGeneratorStats> {
    return {
      totalGenerations: this.stats.totalGenerations,
      totalParaphrases: this.stats.totalParaphrases,
      totalStyleTransfers: this.stats.totalStyleTransfers,
      totalTemplates: this.templates.size,
      feedbackCount: this.stats.feedbackCount,
    }
  }

  provideFeedback(): void { this.stats.feedbackCount++ }

  serialize(): string {
    return JSON.stringify({
      templates: [...this.templates.values()],
      stats: this.stats,
    })
  }

  static deserialize(json: string, config?: Partial<NaturalLanguageGeneratorConfig>): NaturalLanguageGenerator {
    const data = JSON.parse(json)
    const engine = new NaturalLanguageGenerator(config)
    for (const t of data.templates ?? []) {
      engine.templates.set(t.id, t)
    }
    Object.assign(engine.stats, data.stats ?? {})
    return engine
  }
}
