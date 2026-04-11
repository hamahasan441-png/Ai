/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Language Detector — Detect Natural Language & Programming Languages         ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Natural Language Detection — Identify English, Kurdish, Arabic, etc.    ║
 * ║    ✦ Script Detection — Latin, Arabic, CJK, Cyrillic, Devanagari            ║
 * ║    ✦ Code Detection — Recognize programming language keywords                ║
 * ║    ✦ Mixed Language — Handle code-switching and mixed input                  ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface LanguageDetectionResult {
  language: string // ISO 639-1 code or 'code'
  confidence: number // 0-1
  script: string // 'latin', 'arabic', 'cjk', 'cyrillic', 'devanagari', 'hangul'
  isCodeMixed: boolean
  details?: string
}

// ── Constants ────────────────────────────────────────────────────────────────

// Common word lists for language detection (top frequent words)
const LANGUAGE_MARKERS: Record<string, { words: Set<string>; script: string }> = {
  en: {
    words: new Set([
      'the',
      'is',
      'are',
      'was',
      'were',
      'have',
      'has',
      'had',
      'will',
      'would',
      'could',
      'should',
      'can',
      'does',
      'do',
      'did',
      'been',
      'being',
      'this',
      'that',
      'these',
      'those',
      'with',
      'from',
      'about',
      'which',
      'when',
      'where',
      'what',
      'how',
      'who',
      'their',
      'there',
      'here',
      'some',
      'than',
      'then',
      'also',
      'just',
      'very',
      'much',
      'many',
      'such',
      'because',
      'between',
      'through',
      'after',
      'before',
    ]),
    script: 'latin',
  },
  ku: {
    words: new Set([
      'ئەم',
      'ئەو',
      'لە',
      'بۆ',
      'لەگەڵ',
      'بە',
      'هەر',
      'کە',
      'دا',
      'لەسەر',
      'وەک',
      'چۆن',
      'کێ',
      'چی',
      'بەڵام',
      'یان',
      'هەموو',
      'ئێمە',
      'ئێوە',
      'ئەوان',
      'دەبێت',
      'بوو',
      'هەبوو',
      'نەبوو',
      'سلاو',
      'سوپاس',
      'باشە',
      'بەڵێ',
      'نەخێر',
      'زۆر',
      'کەم',
      'دەکرێت',
      'ناکرێت',
      'هیچ',
      'چەند',
      'خۆش',
      'باش',
      'خراپ',
      'ڕۆژ',
      'شەو',
      'ئەمڕۆ',
      'ئێستا',
      'سبەی',
      'دوێنێ',
      'ماڵ',
      'خوا',
      'خودا',
      'منداڵ',
      'ژنان',
      'پیاوان',
      'کوردستان',
      'کورد',
      'دەست',
      'دڵ',
      'چاو',
      'سەر',
      'گوێ',
      'ناو',
      'لای',
      'دەوڵەت',
      'گەلەک',
      'هاوڕێ',
      'خێزان',
      'بەرنامە',
      'پەروەردە',
    ]),
    script: 'arabic',
  },
  ar: {
    words: new Set([
      'في',
      'من',
      'على',
      'إلى',
      'عن',
      'مع',
      'هذا',
      'هذه',
      'ذلك',
      'التي',
      'الذي',
      'كان',
      'يكون',
      'هو',
      'هي',
      'هم',
      'نحن',
      'أنت',
      'كل',
      'بعض',
      'أي',
      'قد',
      'لا',
      'لم',
      'لن',
      'ما',
      'إن',
      'أن',
      'أو',
      'ولكن',
      'ثم',
      'حتى',
      'بين',
      'فوق',
      'تحت',
      'قبل',
      'بعد',
    ]),
    script: 'arabic',
  },
  es: {
    words: new Set([
      'el',
      'la',
      'los',
      'las',
      'un',
      'una',
      'es',
      'son',
      'está',
      'están',
      'tiene',
      'tienen',
      'que',
      'por',
      'para',
      'con',
      'como',
      'más',
      'pero',
      'cuando',
      'donde',
      'porque',
      'también',
      'entre',
      'sobre',
      'desde',
      'hasta',
      'sin',
      'según',
      'antes',
      'después',
    ]),
    script: 'latin',
  },
  fr: {
    words: new Set([
      'le',
      'la',
      'les',
      'un',
      'une',
      'des',
      'est',
      'sont',
      'avec',
      'pour',
      'dans',
      'sur',
      'par',
      'que',
      'qui',
      'pas',
      'plus',
      'mais',
      'aussi',
      'comme',
      'tout',
      'bien',
      'très',
      'fait',
      'être',
      'avoir',
      'nous',
      'vous',
      'ils',
      'elles',
      'cette',
      'ces',
      'entre',
      'après',
    ]),
    script: 'latin',
  },
  de: {
    words: new Set([
      'der',
      'die',
      'das',
      'ein',
      'eine',
      'ist',
      'sind',
      'und',
      'oder',
      'aber',
      'nicht',
      'mit',
      'von',
      'für',
      'auf',
      'aus',
      'nach',
      'bei',
      'über',
      'unter',
      'zwischen',
      'durch',
      'ohne',
      'gegen',
      'bis',
      'seit',
      'während',
      'weil',
      'wenn',
      'dass',
      'auch',
      'noch',
      'sehr',
    ]),
    script: 'latin',
  },
  tr: {
    words: new Set([
      'bir',
      'bu',
      'şu',
      've',
      'ile',
      'için',
      'den',
      'dan',
      'var',
      'yok',
      'olan',
      'gibi',
      'çok',
      'daha',
      'ama',
      'veya',
      'hem',
      'kadar',
      'sonra',
      'önce',
      'üzerinde',
      'arasında',
      'altında',
      'değil',
      'olarak',
      'nasıl',
      'neden',
      'nerede',
      'zaman',
      'hangi',
    ]),
    script: 'latin',
  },
  ru: {
    words: new Set([
      'и',
      'в',
      'на',
      'не',
      'с',
      'что',
      'как',
      'это',
      'по',
      'из',
      'к',
      'за',
      'для',
      'от',
      'до',
      'но',
      'или',
      'при',
      'то',
      'его',
      'её',
      'их',
      'все',
      'уже',
      'был',
      'она',
      'они',
      'мы',
    ]),
    script: 'cyrillic',
  },
}

const CODE_KEYWORDS = new Set([
  'function',
  'const',
  'let',
  'var',
  'class',
  'interface',
  'type',
  'import',
  'export',
  'return',
  'if',
  'else',
  'for',
  'while',
  'switch',
  'case',
  'break',
  'continue',
  'try',
  'catch',
  'throw',
  'async',
  'await',
  'new',
  'delete',
  'typeof',
  'instanceof',
  'def',
  'lambda',
  'print',
  'self',
  'None',
  'True',
  'False',
  'public',
  'private',
  'protected',
  'static',
  'void',
  'int',
  'string',
  'boolean',
  'number',
  'null',
  'undefined',
  'extends',
  'implements',
  'enum',
  'struct',
  'fn',
  'mut',
  'pub',
  'impl',
  'package',
  'func',
  'fmt',
  'println',
  'match',
  'trait',
])

// ── LanguageDetector Class ───────────────────────────────────────────────────

export class LanguageDetector {
  private detectCount = 0
  private languageCounts: Record<string, number> = {}

  constructor() {
    this.languageCounts = {}
  }

  /**
   * Detect the primary language of text
   */
  detect(text: string): LanguageDetectionResult {
    this.detectCount++

    if (!text || text.trim().length === 0) {
      return { language: 'unknown', confidence: 0, script: 'unknown', isCodeMixed: false }
    }

    const trimmed = text.trim()

    // Step 1: Check script
    const script = this.detectScript(trimmed)

    // Step 2: Check if it's code
    const codeScore = this.calculateCodeScore(trimmed)
    const isCode = codeScore > 0.5

    // Step 3: Detect natural language
    const langScores = this.calculateLanguageScores(trimmed)

    // Step 4: Determine result
    let language: string
    let confidence: number
    const isCodeMixed = isCode && langScores.length > 0 && langScores[0]!.score > 0.2

    if (isCode && codeScore > 0.7) {
      language = 'code'
      confidence = codeScore
    } else if (langScores.length > 0 && langScores[0]!.score > codeScore) {
      language = langScores[0]!.lang
      confidence = langScores[0]!.score
    } else if (isCode) {
      language = 'code'
      confidence = codeScore
    } else if (script === 'arabic') {
      // Try to distinguish Kurdish from Arabic by checking Kurdish-specific words
      const kuScore = langScores.find(s => s.lang === 'ku')?.score || 0
      const arScore = langScores.find(s => s.lang === 'ar')?.score || 0
      language = kuScore > arScore ? 'ku' : 'ar'
      confidence = Math.max(kuScore, arScore, 0.3)
    } else {
      language = 'en' // default
      confidence = 0.3
    }

    // Track
    this.languageCounts[language] = (this.languageCounts[language] || 0) + 1

    return { language, confidence: Math.min(1, confidence), script, isCodeMixed }
  }

  /**
   * Detect multiple languages in text (for mixed content)
   */
  detectMultiple(text: string): LanguageDetectionResult[] {
    const results: LanguageDetectionResult[] = []

    // Split into segments and detect each
    const segments = text.split(/\n\n+/)
    for (const segment of segments) {
      if (segment.trim().length > 5) {
        results.push(this.detect(segment))
      }
    }

    return results
  }

  /**
   * Detect script from Unicode ranges
   */
  private detectScript(text: string): string {
    let latin = 0,
      arabic = 0,
      cjk = 0,
      cyrillic = 0,
      devanagari = 0,
      hangul = 0

    for (const char of text) {
      const code = char.charCodeAt(0)
      if (code >= 0x0041 && code <= 0x024f) latin++
      else if (code >= 0x0600 && code <= 0x06ff) arabic++
      else if (code >= 0x0750 && code <= 0x077f)
        arabic++ // Arabic Supplement
      else if (code >= 0xfb50 && code <= 0xfdff)
        arabic++ // Arabic Presentation Forms
      else if (code >= 0xfe70 && code <= 0xfeff)
        arabic++ // Arabic Presentation Forms-B
      else if (code >= 0x4e00 && code <= 0x9fff)
        cjk++ // CJK Unified
      else if (code >= 0x3040 && code <= 0x309f)
        cjk++ // Hiragana
      else if (code >= 0x30a0 && code <= 0x30ff)
        cjk++ // Katakana
      else if (code >= 0x0400 && code <= 0x04ff) cyrillic++
      else if (code >= 0x0900 && code <= 0x097f) devanagari++
      else if (code >= 0xac00 && code <= 0xd7af) hangul++
    }

    const max = Math.max(latin, arabic, cjk, cyrillic, devanagari, hangul)
    if (max === 0) return 'unknown'
    if (max === arabic) return 'arabic'
    if (max === cjk) return 'cjk'
    if (max === cyrillic) return 'cyrillic'
    if (max === devanagari) return 'devanagari'
    if (max === hangul) return 'hangul'
    return 'latin'
  }

  /**
   * Check if text contains Kurdish-specific characters not found in standard Arabic.
   * Kurdish Sorani uses unique letters: ڤ (ve), پ (pe), چ (che), ژ (zhe),
   * گ (ga), ۆ (o), ێ (ê), ڕ (rr), ڵ (ll), ە (e)
   */
  hasKurdishCharacters(text: string): boolean {
    // Kurdish-specific characters: ڤ ۆ ێ ڕ ڵ ە پ چ ژ گ
    return /[\u06A4\u06C6\u06CE\u0695\u06B5\u06D5\u067E\u0686\u0698\u06AF]/.test(text)
  }

  /**
   * Detect whether Arabic-script text is likely Kurdish or Arabic.
   * Uses Kurdish-unique characters and word patterns for disambiguation.
   * @returns 'ku' for Kurdish, 'ar' for Arabic, 'unknown' if undetermined
   */
  detectKurdishVsArabic(text: string): 'ku' | 'ar' | 'unknown' {
    if (!text || text.trim().length === 0) return 'unknown'

    let kurdishSignals = 0
    let arabicSignals = 0

    // Kurdish-unique characters: ڤ ۆ ێ ڕ ڵ ە
    const kurdishUniqueChars = /[\u06A4\u06C6\u06CE\u0695\u06B5\u06D5]/g
    const kurdishMatches = text.match(kurdishUniqueChars)
    if (kurdishMatches) kurdishSignals += kurdishMatches.length * 2

    // Arabic-unique features: tashkeel (diacritics), taa marbuta, alif hamza forms
    const arabicUniqueChars = /[\u0629\u0623\u0625\u0622\u064B-\u065E]/g
    const arabicMatches = text.match(arabicUniqueChars)
    if (arabicMatches) arabicSignals += arabicMatches.length * 2

    // Check word markers
    const words = text.split(/\s+/)
    const kuMarkers = LANGUAGE_MARKERS.ku
    const arMarkers = LANGUAGE_MARKERS.ar
    for (const word of words) {
      if (kuMarkers && kuMarkers.words.has(word)) kurdishSignals += 3
      if (arMarkers && arMarkers.words.has(word)) arabicSignals += 3
    }

    if (kurdishSignals === 0 && arabicSignals === 0) return 'unknown'
    if (kurdishSignals > arabicSignals) return 'ku'
    if (arabicSignals > kurdishSignals) return 'ar'
    return 'unknown'
  }

  /**
   * Calculate how likely the text is programming code
   */
  private calculateCodeScore(text: string): number {
    const words = text.split(/[\s,.:;!?()[\]{}]+/).filter(w => w.length > 0)
    if (words.length === 0) return 0

    let codeSignals = 0

    // Check for code keywords
    const codeWordCount = words.filter(w => CODE_KEYWORDS.has(w)).length
    codeSignals += (codeWordCount / words.length) * 2

    // Check for code-like syntax patterns
    if (/[{};]/.test(text)) codeSignals += 0.2
    if (/=>|->|::|\.\./.test(text)) codeSignals += 0.2
    if (/\b\w+\([^)]*\)/.test(text)) codeSignals += 0.15 // function calls
    if (/=\s*\w/.test(text)) codeSignals += 0.1 // assignment
    if (/\/\/|\/\*|#\s/.test(text)) codeSignals += 0.15 // comments
    if (/```/.test(text)) codeSignals += 0.3

    return Math.min(1, codeSignals)
  }

  /**
   * Calculate language scores using word frequency matching
   */
  private calculateLanguageScores(text: string): Array<{ lang: string; score: number }> {
    const words = text
      .toLowerCase()
      .split(/[\s,.:;!?()[\]{}]+/)
      .filter(w => w.length > 0)
    if (words.length === 0) return []

    const scores: Array<{ lang: string; score: number }> = []

    for (const [lang, { words: markers }] of Object.entries(LANGUAGE_MARKERS)) {
      let matchCount = 0
      for (const word of words) {
        if (markers.has(word)) matchCount++
      }
      const score = matchCount / Math.max(words.length, 1)
      if (score > 0) {
        scores.push({ lang, score: Math.min(1, score * 3) }) // amplify for short texts
      }
    }

    return scores.sort((a, b) => b.score - a.score)
  }

  /**
   * Get statistics
   */
  getStats(): { detectCount: number; languageCounts: Record<string, number> } {
    return {
      detectCount: this.detectCount,
      languageCounts: { ...this.languageCounts },
    }
  }

  /**
   * Serialize state
   */
  serialize(): string {
    return JSON.stringify({
      detectCount: this.detectCount,
      languageCounts: this.languageCounts,
    })
  }

  /**
   * Deserialize state
   */
  static deserialize(data: string): LanguageDetector {
    const parsed = JSON.parse(data)
    const detector = new LanguageDetector()
    detector.detectCount = parsed.detectCount || 0
    detector.languageCounts = parsed.languageCounts || {}
    return detector
  }
}
