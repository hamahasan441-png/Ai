/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  KurdishMorphologicalAnalyzer — Kurdish Sorani morphological analysis       ║
 * ║                                                                            ║
 * ║  Decomposes Kurdish Sorani words into morphemes, identifies roots,         ║
 * ║  prefixes, suffixes, and part of speech. Provides spelling validation,     ║
 * ║  transliteration between Arabic and Latin scripts, and basic verb          ║
 * ║  conjugation. Built-in dictionary of 200+ common roots.                   ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Result of morphological decomposition for a single word. */
export interface MorphemeAnalysis {
  readonly word: string
  readonly morphemes: readonly string[]
  readonly root: string
  readonly prefixes: readonly string[]
  readonly suffixes: readonly string[]
  readonly pattern: string
  readonly pos: string
}

/** Result of a spelling check. */
export interface SpellingResult {
  readonly isCorrect: boolean
  readonly suggestions: readonly string[]
  readonly explanation: string
}

/** Result of a script transliteration. */
export interface TransliterationResult {
  readonly original: string
  readonly converted: string
  readonly script: 'arabic' | 'latin'
}

/** Configuration for the morphological analyzer. */
export interface KurdishMorphologicalAnalyzerConfig {
  /** Enable caching of analyzed words. Default: true */
  readonly enableCache: boolean
  /** Maximum number of entries in the analysis cache. Default: 500 */
  readonly maxCacheSize: number
}

/** Dictionary entry for a known root. */
export interface RootEntry {
  readonly meaning: string
  readonly pos: string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_ANALYZER_CONFIG: KurdishMorphologicalAnalyzerConfig = {
  enableCache: true,
  maxCacheSize: 500,
}

/** Kurdish prefix definitions: form → label. */
const PREFIXES: ReadonlyMap<string, string> = new Map([
  ['دە', 'present tense'],
  ['نا', 'negative'],
  ['بـ', 'subjunctive'],
  ['ب', 'subjunctive'],
  ['هەڵ', 'up/rising'],
  ['دا', 'down/setting'],
  ['ڕا', 'directional/away'],
  ['وەر', 'receptive'],
  ['پێ', 'with/to'],
  ['تێ', 'through/into'],
  ['لێ', 'from/at'],
])

/** Kurdish suffix definitions: form → label. */
const SUFFIXES: ReadonlyMap<string, string> = new Map([
  ['ەکانمان', 'def. plural + 1st pl. possessive'],
  ['ەکانتان', 'def. plural + 2nd pl. possessive'],
  ['ەکانیان', 'def. plural + 3rd pl. possessive'],
  ['ترینی', 'superlative + ezafe'],
  ['ترین', 'superlative'],
  ['ەکان', 'definite plural'],
  ['ەکەم', 'def. singular + 1st sg. possessive'],
  ['ەکەت', 'def. singular + 2nd sg. possessive'],
  ['ەکە', 'definite singular'],
  ['انە', 'abstract noun'],
  ['یانە', 'adjectival'],
  ['کار', 'doer (agent)'],
  ['گەر', 'doer (agent)'],
  ['وانە', 'manner adverb'],
  ['مان', '1st person plural possessive'],
  ['تان', '2nd person plural possessive'],
  ['یان', '3rd person plural possessive'],
  ['ان', 'plural'],
  ['ێک', 'indefinite'],
  ['تر', 'comparative'],
  ['یی', 'abstract/nisba'],
  ['ین', '1st person plural'],
  ['ی', 'ezafe/possessive'],
  ['ن', 'verb plural'],
  ['م', '1st person singular'],
  ['ت', '2nd person singular'],
])

/**
 * Transliteration table: Kurdish Arabic script → Latin.
 * Order matters for multi-char sequences during reverse lookup.
 */
const ARABIC_TO_LATIN: ReadonlyArray<readonly [string, string]> = [
  ['ئ', "'"],
  ['ا', 'a'],
  ['ب', 'b'],
  ['پ', 'p'],
  ['ت', 't'],
  ['ج', 'c'],
  ['چ', 'ç'],
  ['ح', 'ḥ'],
  ['خ', 'x'],
  ['د', 'd'],
  ['ر', 'r'],
  ['ڕ', 'ř'],
  ['ز', 'z'],
  ['ژ', 'j'],
  ['س', 's'],
  ['ش', 'ş'],
  ['ع', "'"],
  ['غ', 'ẍ'],
  ['ف', 'f'],
  ['ڤ', 'v'],
  ['ق', 'q'],
  ['ک', 'k'],
  ['گ', 'g'],
  ['ل', 'l'],
  ['ڵ', 'ł'],
  ['م', 'm'],
  ['ن', 'n'],
  ['وو', 'û'],
  ['و', 'w'],
  ['ۆ', 'o'],
  ['ه', 'h'],
  ['ە', 'e'],
  ['ێ', 'ê'],
  ['یی', 'î'],
  ['ی', 'y'],
]

/**
 * Reverse table: Latin → Kurdish Arabic script.
 * Longer sequences first to avoid partial matches.
 */
const LATIN_TO_ARABIC: ReadonlyArray<readonly [string, string]> = [
  ['ř', 'ڕ'],
  ['ç', 'چ'],
  ['ḥ', 'ح'],
  ['ş', 'ش'],
  ['ẍ', 'غ'],
  ['ł', 'ڵ'],
  ['ê', 'ێ'],
  ['û', 'وو'],
  ['î', 'یی'],
  ['a', 'ا'],
  ['b', 'ب'],
  ['p', 'پ'],
  ['t', 'ت'],
  ['c', 'ج'],
  ['x', 'خ'],
  ['d', 'د'],
  ['r', 'ر'],
  ['z', 'ز'],
  ['j', 'ژ'],
  ['s', 'س'],
  ['f', 'ف'],
  ['v', 'ڤ'],
  ['q', 'ق'],
  ['k', 'ک'],
  ['g', 'گ'],
  ['l', 'ل'],
  ['m', 'م'],
  ['n', 'ن'],
  ['w', 'و'],
  ['o', 'ۆ'],
  ['h', 'ه'],
  ['e', 'ە'],
  ['y', 'ی'],
]

/** Regex for valid Kurdish Arabic-script text (letters, diacritics, spaces). */
const KURDISH_SCRIPT_PATTERN =
  /^[\u0626-\u06D5\u06A4\u06A9\u06AF\u06B5\u06C6\u06CC\u06CE\u06D5\u0695\u200C\u200D\s]+$/

// ─── KurdishMorphologicalAnalyzer ──────────────────────────────────────────────

export class KurdishMorphologicalAnalyzer {
  private readonly config: KurdishMorphologicalAnalyzerConfig
  private readonly roots: Map<string, RootEntry>
  private readonly cache: Map<string, MorphemeAnalysis> = new Map()
  private analyzedCount = 0
  private cacheHitCount = 0

  constructor(config: Partial<KurdishMorphologicalAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_ANALYZER_CONFIG, ...config }
    this.roots = this.buildRootDictionary()
  }

  // ── Morphological Analysis ─────────────────────────────────────────────────

  /**
   * Decompose a Kurdish Sorani word into its constituent morphemes.
   * Identifies the root, any prefixes, suffixes, and likely part of speech.
   * @param word - A Kurdish word in Arabic script
   * @returns Full morphological breakdown
   */
  analyze(word: string): MorphemeAnalysis {
    const trimmed = word.trim()
    if (this.config.enableCache && this.cache.has(trimmed)) {
      this.cacheHitCount++
      return this.cache.get(trimmed)!
    }

    this.analyzedCount++

    // Fast path: if the whole word is a known root, return it directly
    // This prevents false affix stripping on words like باران, من, دایک
    if (this.roots.has(trimmed)) {
      const entry = this.roots.get(trimmed)!
      const result: MorphemeAnalysis = {
        word: trimmed,
        morphemes: [trimmed],
        root: trimmed,
        prefixes: [],
        suffixes: [],
        pattern: 'ROOT',
        pos: entry.pos,
      }

      if (this.config.enableCache) {
        if (this.cache.size >= this.config.maxCacheSize) {
          const firstKey = this.cache.keys().next().value
          if (firstKey !== undefined) this.cache.delete(firstKey)
        }
        this.cache.set(trimmed, result)
      }

      return result
    }

    const prefixes = this.extractPrefixes(trimmed)
    const withoutPrefixes = this.stripPrefixes(trimmed, prefixes)
    const suffixes = this.extractSuffixes(withoutPrefixes)
    const stem = this.stripSuffixes(withoutPrefixes, suffixes)

    const root = this.resolveRoot(stem)
    const pos = this.determinePOS(root, prefixes, suffixes)
    const morphemes = [...prefixes, root, ...suffixes].filter(m => m.length > 0)
    const pattern = this.buildPattern(prefixes, root, suffixes)

    const result: MorphemeAnalysis = {
      word: trimmed,
      morphemes,
      root,
      prefixes,
      suffixes,
      pattern,
      pos,
    }

    if (this.config.enableCache) {
      if (this.cache.size >= this.config.maxCacheSize) {
        const firstKey = this.cache.keys().next().value
        if (firstKey !== undefined) this.cache.delete(firstKey)
      }
      this.cache.set(trimmed, result)
    }

    return result
  }

  /**
   * Extract the root/stem from a Kurdish word, stripping all affixes.
   * @param word - A Kurdish word in Arabic script
   * @returns The identified root string
   */
  getRoot(word: string): string {
    return this.analyze(word).root
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  /**
   * Check whether a word appears to be valid Kurdish script.
   * Uses character-class validation and optional dictionary lookup.
   * @param word - The word to validate
   * @returns true if the word is plausibly valid Kurdish
   */
  isValidWord(word: string): boolean {
    const trimmed = word.trim()
    if (trimmed.length === 0) return false
    if (!KURDISH_SCRIPT_PATTERN.test(trimmed)) return false

    // Known root is a strong positive signal
    const root = this.getRoot(trimmed)
    if (this.roots.has(root)) return true

    // Accept if it has at least two Kurdish characters
    return trimmed.length >= 2
  }

  // ── Spelling ───────────────────────────────────────────────────────────────

  /**
   * Check the spelling of a Kurdish word and suggest corrections.
   * Compares against the root dictionary and known affix patterns.
   * @param word - The word to spell-check
   * @returns Spelling result with suggestions
   */
  checkSpelling(word: string): SpellingResult {
    const trimmed = word.trim()

    if (!KURDISH_SCRIPT_PATTERN.test(trimmed)) {
      return {
        isCorrect: false,
        suggestions: [],
        explanation: 'Word contains non-Kurdish characters.',
      }
    }

    const root = this.getRoot(trimmed)
    if (this.roots.has(root)) {
      return {
        isCorrect: true,
        suggestions: [],
        explanation: `Root "${root}" recognized (${this.roots.get(root)!.meaning}).`,
      }
    }

    // Generate suggestions via edit distance against known roots
    const suggestions = this.suggestCorrections(trimmed)

    return {
      isCorrect: false,
      suggestions,
      explanation:
        suggestions.length > 0
          ? `Unknown root. Did you mean: ${suggestions.join(', ')}?`
          : 'Unknown root. No close matches found.',
    }
  }

  // ── Transliteration ────────────────────────────────────────────────────────

  /**
   * Convert text between Kurdish Arabic script and Latin transliteration.
   * @param text - Input text in either script
   * @param targetScript - The desired output script
   * @returns Transliteration result with original and converted text
   */
  transliterate(text: string, targetScript: 'arabic' | 'latin'): TransliterationResult {
    const converted = targetScript === 'latin' ? this.arabicToLatin(text) : this.latinToArabic(text)

    return { original: text, converted, script: targetScript }
  }

  // ── Conjugation ────────────────────────────────────────────────────────────

  /**
   * Generate a conjugated verb form from a root, tense, and person.
   * Supports present, past, and subjunctive tenses with 1st/2nd/3rd
   * person in singular and plural.
   * @param root - Verb root in Arabic script
   * @param tense - One of 'present', 'past', 'subjunctive'
   * @param person - One of '1s', '2s', '3s', '1p', '2p', '3p'
   * @returns The conjugated form
   */
  conjugate(root: string, tense: string, person: string): string {
    // Note: verb person suffixes overlap with nominal suffixes (e.g. ی = ezafe)
    // but context (conjugation vs. morpheme analysis) disambiguates them.
    const personSuffixes: Record<string, string> = {
      '1s': 'م',
      '2s': 'ی',
      '3s': '',
      '1p': 'ین',
      '2p': 'ن',
      '3p': 'ن',
    }

    const suffix = personSuffixes[person] ?? ''

    switch (tense) {
      case 'present': {
        // Present: دە + root + person suffix
        const stem = person === '3p' ? root + 'ە' : root
        return 'دە' + stem + suffix
      }
      case 'past': {
        // Past: root + past marker + person suffix (ergative for transitive)
        return root + suffix
      }
      case 'subjunctive': {
        // Subjunctive: ب + root + person suffix
        const stem = person === '3p' ? root + 'ە' : root
        return 'ب' + stem + suffix
      }
      default:
        return root + suffix
    }
  }

  // ── Statistics ─────────────────────────────────────────────────────────────

  /**
   * Get usage statistics for the analyzer instance.
   * @returns Counts of analyzed words, cache hits, and known roots
   */
  getStats(): { analyzedWords: number; cacheHits: number; knownRoots: number } {
    return {
      analyzedWords: this.analyzedCount,
      cacheHits: this.cacheHitCount,
      knownRoots: this.roots.size,
    }
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  serialize(): {
    analyzedCount: number
    cacheHitCount: number
    cacheEntries: [string, MorphemeAnalysis][]
  } {
    return {
      analyzedCount: this.analyzedCount,
      cacheHitCount: this.cacheHitCount,
      cacheEntries: [...this.cache.entries()],
    }
  }

  deserialize(data: {
    analyzedCount: number
    cacheHitCount: number
    cacheEntries: [string, MorphemeAnalysis][]
  }): void {
    this.analyzedCount = data.analyzedCount
    this.cacheHitCount = data.cacheHitCount
    this.cache.clear()
    for (const [key, value] of data.cacheEntries) {
      this.cache.set(key, value)
    }
  }

  // ── Accessors ──────────────────────────────────────────────────────────────

  getConfig(): KurdishMorphologicalAnalyzerConfig {
    return { ...this.config }
  }

  clear(): void {
    this.cache.clear()
    this.analyzedCount = 0
    this.cacheHitCount = 0
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  private buildRootDictionary(): Map<string, RootEntry> {
    const roots = new Map<string, RootEntry>()

    // ── Verbs ──
    roots.set('خوێن', { meaning: 'read', pos: 'verb' })
    roots.set('نووس', { meaning: 'write', pos: 'verb' })
    roots.set('ڕۆ', { meaning: 'go', pos: 'verb' })
    roots.set('هات', { meaning: 'come', pos: 'verb' })
    roots.set('بین', { meaning: 'see', pos: 'verb' })
    roots.set('زان', { meaning: 'know', pos: 'verb' })
    roots.set('خو', { meaning: 'eat', pos: 'verb' })
    roots.set('وت', { meaning: 'say', pos: 'verb' })
    roots.set('کر', { meaning: 'do/make', pos: 'verb' })
    roots.set('دا', { meaning: 'give', pos: 'verb' })
    roots.set('گرت', { meaning: 'take/hold', pos: 'verb' })
    roots.set('کەوت', { meaning: 'fall', pos: 'verb' })
    roots.set('چوو', { meaning: 'go (past)', pos: 'verb' })
    roots.set('هەست', { meaning: 'feel/stand', pos: 'verb' })
    roots.set('فێر', { meaning: 'learn', pos: 'verb' })
    roots.set('واز', { meaning: 'stop/quit', pos: 'verb' })
    roots.set('وەرگر', { meaning: 'receive', pos: 'verb' })
    roots.set('هاوکار', { meaning: 'help/assist', pos: 'verb' })
    roots.set('دان', { meaning: 'give/place', pos: 'verb' })
    roots.set('بوو', { meaning: 'become/be', pos: 'verb' })
    roots.set('توان', { meaning: 'can/be able', pos: 'verb' })
    roots.set('ویست', { meaning: 'want', pos: 'verb' })
    roots.set('ناس', { meaning: 'recognize', pos: 'verb' })
    roots.set('گەڕ', { meaning: 'return/turn', pos: 'verb' })
    roots.set('کەش', { meaning: 'pull/draw', pos: 'verb' })
    roots.set('نوو', { meaning: 'pray', pos: 'verb' })
    roots.set('شوو', { meaning: 'wash', pos: 'verb' })
    roots.set('بڕ', { meaning: 'cut', pos: 'verb' })
    roots.set('درو', { meaning: 'sew', pos: 'verb' })
    roots.set('فرۆش', { meaning: 'sell', pos: 'verb' })
    roots.set('کڕ', { meaning: 'buy', pos: 'verb' })

    // ── Nouns (body parts) ──
    roots.set('دەست', { meaning: 'hand', pos: 'noun' })
    roots.set('سەر', { meaning: 'head', pos: 'noun' })
    roots.set('دڵ', { meaning: 'heart', pos: 'noun' })
    roots.set('چاو', { meaning: 'eye', pos: 'noun' })
    roots.set('گوێ', { meaning: 'ear', pos: 'noun' })
    roots.set('دەم', { meaning: 'mouth', pos: 'noun' })
    roots.set('پێ', { meaning: 'foot', pos: 'noun' })
    roots.set('قاچ', { meaning: 'leg', pos: 'noun' })
    roots.set('پشت', { meaning: 'back', pos: 'noun' })
    roots.set('سینگ', { meaning: 'chest', pos: 'noun' })

    // ── Nouns (places / objects) ──
    roots.set('بازاڕ', { meaning: 'market', pos: 'noun' })
    roots.set('قوتابخانە', { meaning: 'school', pos: 'noun' })
    roots.set('خانوو', { meaning: 'house', pos: 'noun' })
    roots.set('شار', { meaning: 'city', pos: 'noun' })
    roots.set('گوند', { meaning: 'village', pos: 'noun' })
    roots.set('ئاو', { meaning: 'water', pos: 'noun' })
    roots.set('نان', { meaning: 'bread', pos: 'noun' })
    roots.set('کتێب', { meaning: 'book', pos: 'noun' })
    roots.set('ڕێ', { meaning: 'road/path', pos: 'noun' })
    roots.set('دار', { meaning: 'tree/wood', pos: 'noun' })
    roots.set('کێو', { meaning: 'mountain', pos: 'noun' })
    roots.set('ڕووبار', { meaning: 'river', pos: 'noun' })

    // ── Nouns (people / roles) ──
    roots.set('خوێندکار', { meaning: 'student', pos: 'noun' })
    roots.set('مامۆستا', { meaning: 'teacher', pos: 'noun' })
    roots.set('پزیشک', { meaning: 'doctor', pos: 'noun' })
    roots.set('منداڵ', { meaning: 'child', pos: 'noun' })
    roots.set('پیاو', { meaning: 'man', pos: 'noun' })
    roots.set('ژن', { meaning: 'woman', pos: 'noun' })
    roots.set('کوڕ', { meaning: 'boy/son', pos: 'noun' })
    roots.set('کچ', { meaning: 'girl/daughter', pos: 'noun' })

    // ── Adjectives ──
    roots.set('گەورە', { meaning: 'big/great', pos: 'adjective' })
    roots.set('بچووک', { meaning: 'small', pos: 'adjective' })
    roots.set('باش', { meaning: 'good', pos: 'adjective' })
    roots.set('خراپ', { meaning: 'bad', pos: 'adjective' })
    roots.set('نوێ', { meaning: 'new', pos: 'adjective' })
    roots.set('کۆن', { meaning: 'old', pos: 'adjective' })
    roots.set('جوان', { meaning: 'beautiful', pos: 'adjective' })
    roots.set('زۆر', { meaning: 'many/much', pos: 'adjective' })
    roots.set('کەم', { meaning: 'few/little', pos: 'adjective' })
    roots.set('درێژ', { meaning: 'long/tall', pos: 'adjective' })
    roots.set('کورت', { meaning: 'short', pos: 'adjective' })
    roots.set('خۆشحاڵ', { meaning: 'happy', pos: 'adjective' })
    roots.set('دڵتەنگ', { meaning: 'sad/homesick', pos: 'adjective' })
    roots.set('ناشرین', { meaning: 'ugly', pos: 'adjective' })
    roots.set('شیرین', { meaning: 'sweet', pos: 'adjective' })
    roots.set('بەختەوەر', { meaning: 'fortunate/blessed', pos: 'adjective' })
    roots.set('سەرکەوتوو', { meaning: 'successful', pos: 'adjective' })
    roots.set('ئازاد', { meaning: 'free', pos: 'adjective' })
    roots.set('تووڕە', { meaning: 'angry', pos: 'adjective' })
    roots.set('بێزار', { meaning: 'fed up', pos: 'adjective' })
    roots.set('قەلەق', { meaning: 'anxious', pos: 'adjective' })
    roots.set('لاواز', { meaning: 'weak', pos: 'adjective' })
    roots.set('بەهێز', { meaning: 'strong', pos: 'adjective' })
    roots.set('پاک', { meaning: 'clean/pure', pos: 'adjective' })
    roots.set('تاریک', { meaning: 'dark', pos: 'adjective' })
    roots.set('ڕۆشن', { meaning: 'bright/light', pos: 'adjective' })
    roots.set('گەرم', { meaning: 'warm/hot', pos: 'adjective' })
    roots.set('سارد', { meaning: 'cold', pos: 'adjective' })
    roots.set('خۆش', { meaning: 'pleasant/nice', pos: 'adjective' })
    roots.set('سادە', { meaning: 'simple', pos: 'adjective' })

    // ── Nouns (emotions / abstract) ──
    roots.set('خەم', { meaning: 'sorrow', pos: 'noun' })
    roots.set('ئازار', { meaning: 'pain', pos: 'noun' })
    roots.set('ترس', { meaning: 'fear', pos: 'noun' })
    roots.set('نەفرەت', { meaning: 'hatred', pos: 'noun' })
    roots.set('خۆشی', { meaning: 'happiness', pos: 'noun' })
    roots.set('ئومێد', { meaning: 'hope', pos: 'noun' })
    roots.set('هیوا', { meaning: 'hope/wish', pos: 'noun' })
    roots.set('ئاشتی', { meaning: 'peace', pos: 'noun' })
    roots.set('ئازادی', { meaning: 'freedom', pos: 'noun' })
    roots.set('ژیان', { meaning: 'life', pos: 'noun' })
    roots.set('مردن', { meaning: 'death', pos: 'noun' })
    roots.set('خۆشەویستی', { meaning: 'love', pos: 'noun' })
    roots.set('ڕێز', { meaning: 'respect', pos: 'noun' })
    roots.set('ئەخلاق', { meaning: 'morals/manners', pos: 'noun' })

    // ── Nouns (nature / environment) ──
    roots.set('ئاسمان', { meaning: 'sky', pos: 'noun' })
    roots.set('هەتاو', { meaning: 'sun', pos: 'noun' })
    roots.set('مانگ', { meaning: 'moon/month', pos: 'noun' })
    roots.set('ئەستێرە', { meaning: 'star', pos: 'noun' })
    roots.set('هەور', { meaning: 'cloud', pos: 'noun' })
    roots.set('باران', { meaning: 'rain', pos: 'noun' })
    roots.set('بەفر', { meaning: 'snow', pos: 'noun' })
    roots.set('با', { meaning: 'wind', pos: 'noun' })
    roots.set('خاک', { meaning: 'earth/soil', pos: 'noun' })
    roots.set('بەرد', { meaning: 'stone/rock', pos: 'noun' })
    roots.set('گوڵ', { meaning: 'flower', pos: 'noun' })
    roots.set('دەریا', { meaning: 'sea/lake', pos: 'noun' })
    roots.set('زەمین', { meaning: 'ground/land', pos: 'noun' })
    roots.set('چیا', { meaning: 'mountain', pos: 'noun' })
    roots.set('دەشت', { meaning: 'plain/field', pos: 'noun' })
    roots.set('جەنگەل', { meaning: 'forest', pos: 'noun' })
    roots.set('گەڵا', { meaning: 'leaf', pos: 'noun' })
    roots.set('تۆو', { meaning: 'seed', pos: 'noun' })

    // ── Nouns (animals) ──
    roots.set('ئەسپ', { meaning: 'horse', pos: 'noun' })
    roots.set('سەگ', { meaning: 'dog', pos: 'noun' })
    roots.set('پشیلە', { meaning: 'cat', pos: 'noun' })
    roots.set('مەڕ', { meaning: 'sheep', pos: 'noun' })
    roots.set('بزن', { meaning: 'goat', pos: 'noun' })
    roots.set('گا', { meaning: 'cow/ox', pos: 'noun' })
    roots.set('مریشک', { meaning: 'chicken', pos: 'noun' })
    roots.set('باڵندە', { meaning: 'bird', pos: 'noun' })
    roots.set('ماسی', { meaning: 'fish', pos: 'noun' })
    roots.set('شێر', { meaning: 'lion', pos: 'noun' })
    roots.set('ڕێوی', { meaning: 'fox', pos: 'noun' })
    roots.set('پەلەوەر', { meaning: 'butterfly', pos: 'noun' })

    // ── Nouns (food / daily life) ──
    roots.set('شیر', { meaning: 'milk', pos: 'noun' })
    roots.set('پەنیر', { meaning: 'cheese', pos: 'noun' })
    roots.set('چا', { meaning: 'tea', pos: 'noun' })
    roots.set('بریج', { meaning: 'rice', pos: 'noun' })
    roots.set('گۆشت', { meaning: 'meat', pos: 'noun' })
    roots.set('میوە', { meaning: 'fruit', pos: 'noun' })
    roots.set('سێو', { meaning: 'apple', pos: 'noun' })
    roots.set('هەنار', { meaning: 'pomegranate', pos: 'noun' })
    roots.set('خواردن', { meaning: 'food', pos: 'noun' })
    roots.set('ئاو', { meaning: 'water', pos: 'noun' })
    roots.set('نمەک', { meaning: 'salt', pos: 'noun' })
    roots.set('مەی', { meaning: 'wine', pos: 'noun' })

    // ── Nouns (time / calendar) ──
    roots.set('ڕۆژ', { meaning: 'day', pos: 'noun' })
    roots.set('شەو', { meaning: 'night', pos: 'noun' })
    roots.set('ساڵ', { meaning: 'year', pos: 'noun' })
    roots.set('هەفتە', { meaning: 'week', pos: 'noun' })
    roots.set('کاتژمێر', { meaning: 'hour/clock', pos: 'noun' })
    roots.set('خولەک', { meaning: 'minute', pos: 'noun' })
    roots.set('بەیانی', { meaning: 'morning', pos: 'noun' })
    roots.set('ئێوارە', { meaning: 'evening', pos: 'noun' })
    roots.set('نیوەڕۆ', { meaning: 'noon/midday', pos: 'noun' })
    roots.set('بەهار', { meaning: 'spring', pos: 'noun' })
    roots.set('هاوین', { meaning: 'summer', pos: 'noun' })
    roots.set('پاییز', { meaning: 'autumn', pos: 'noun' })
    roots.set('زستان', { meaning: 'winter', pos: 'noun' })

    // ── Nouns (family / relationships) ──
    roots.set('دایک', { meaning: 'mother', pos: 'noun' })
    roots.set('باوک', { meaning: 'father', pos: 'noun' })
    roots.set('برا', { meaning: 'brother', pos: 'noun' })
    roots.set('خوشک', { meaning: 'sister', pos: 'noun' })
    roots.set('باپیر', { meaning: 'grandfather', pos: 'noun' })
    roots.set('داپیر', { meaning: 'grandmother', pos: 'noun' })
    roots.set('مام', { meaning: 'paternal uncle', pos: 'noun' })
    roots.set('خاڵ', { meaning: 'maternal uncle', pos: 'noun' })
    roots.set('پور', { meaning: 'aunt (paternal)', pos: 'noun' })
    roots.set('هاوسەر', { meaning: 'spouse', pos: 'noun' })
    roots.set('خێزان', { meaning: 'family', pos: 'noun' })
    roots.set('هاوڕێ', { meaning: 'friend', pos: 'noun' })
    roots.set('دراوسێ', { meaning: 'neighbor', pos: 'noun' })

    // ── Nouns (professions) ──
    roots.set('وانەبێژ', { meaning: 'lecturer', pos: 'noun' })
    roots.set('پارێزەر', { meaning: 'lawyer', pos: 'noun' })
    roots.set('ئەندازیار', { meaning: 'engineer', pos: 'noun' })
    roots.set('جوتیار', { meaning: 'farmer', pos: 'noun' })
    roots.set('بازرگان', { meaning: 'merchant', pos: 'noun' })
    roots.set('داهێنەر', { meaning: 'inventor/creator', pos: 'noun' })
    roots.set('نووسەر', { meaning: 'writer', pos: 'noun' })
    roots.set('شاعیر', { meaning: 'poet', pos: 'noun' })
    roots.set('هونەرمەند', { meaning: 'artist', pos: 'noun' })
    roots.set('ئافرەت', { meaning: 'woman (formal)', pos: 'noun' })
    roots.set('سەرباز', { meaning: 'soldier', pos: 'noun' })
    roots.set('ڕۆژنامەنووس', { meaning: 'journalist', pos: 'noun' })

    // ── Nouns (abstract / concepts) ──
    roots.set('زانست', { meaning: 'science', pos: 'noun' })
    roots.set('فەلسەفە', { meaning: 'philosophy', pos: 'noun' })
    roots.set('مێژوو', { meaning: 'history', pos: 'noun' })
    roots.set('هونەر', { meaning: 'art', pos: 'noun' })
    roots.set('ئەدەب', { meaning: 'literature', pos: 'noun' })
    roots.set('زمان', { meaning: 'language', pos: 'noun' })
    roots.set('نەتەوە', { meaning: 'nation', pos: 'noun' })
    roots.set('وڵات', { meaning: 'country', pos: 'noun' })
    roots.set('حکومەت', { meaning: 'government', pos: 'noun' })
    roots.set('یاسا', { meaning: 'law', pos: 'noun' })
    roots.set('دادوەری', { meaning: 'justice', pos: 'noun' })
    roots.set('ئابووری', { meaning: 'economy', pos: 'noun' })
    roots.set('کەلەپوور', { meaning: 'heritage', pos: 'noun' })
    roots.set('ئایین', { meaning: 'religion', pos: 'noun' })
    roots.set('بیروڕا', { meaning: 'opinion', pos: 'noun' })

    // ── Additional verbs ──
    roots.set('ژی', { meaning: 'live', pos: 'verb' })
    roots.set('گوت', { meaning: 'said (past)', pos: 'verb' })
    roots.set('دیت', { meaning: 'saw (past)', pos: 'verb' })
    roots.set('کوشت', { meaning: 'kill', pos: 'verb' })
    roots.set('دروست', { meaning: 'make/create', pos: 'verb' })
    roots.set('شکان', { meaning: 'break (intrans.)', pos: 'verb' })
    roots.set('ڕوون', { meaning: 'sit', pos: 'verb' })
    roots.set('پاراست', { meaning: 'protect', pos: 'verb' })
    roots.set('گەڕا', { meaning: 'search/look for', pos: 'verb' })
    roots.set('کوت', { meaning: 'beat/hit', pos: 'verb' })
    roots.set('نوست', { meaning: 'sleep', pos: 'verb' })
    roots.set('خست', { meaning: 'throw/put', pos: 'verb' })
    roots.set('هاوشت', { meaning: 'throw', pos: 'verb' })
    roots.set('دوا', { meaning: 'sew/run', pos: 'verb' })

    // ── Additional adjectives ──
    roots.set('ئاسایی', { meaning: 'normal/ordinary', pos: 'adjective' })
    roots.set('تایبەت', { meaning: 'special/particular', pos: 'adjective' })
    roots.set('گشتی', { meaning: 'general/public', pos: 'adjective' })
    roots.set('سروشتی', { meaning: 'natural', pos: 'adjective' })
    roots.set('ئاوەدان', { meaning: 'prosperous/flourishing', pos: 'adjective' })
    roots.set('وشک', { meaning: 'dry', pos: 'adjective' })
    roots.set('تەر', { meaning: 'wet/fresh', pos: 'adjective' })
    roots.set('بەرفراوان', { meaning: 'wide/vast', pos: 'adjective' })
    roots.set('تەنگ', { meaning: 'narrow/tight', pos: 'adjective' })
    roots.set('قووڵ', { meaning: 'deep', pos: 'adjective' })
    roots.set('سوور', { meaning: 'red', pos: 'adjective' })
    roots.set('شین', { meaning: 'blue/green', pos: 'adjective' })
    roots.set('سپی', { meaning: 'white', pos: 'adjective' })
    roots.set('ڕەش', { meaning: 'black', pos: 'adjective' })
    roots.set('زەرد', { meaning: 'yellow', pos: 'adjective' })
    roots.set('سەوز', { meaning: 'green', pos: 'adjective' })
    roots.set('خوێن', { meaning: 'read', pos: 'verb' }) // re-alias to avoid collision

    // ── Nouns (numbers as words) ──
    roots.set('یەک', { meaning: 'one', pos: 'numeral' })
    roots.set('دوو', { meaning: 'two', pos: 'numeral' })
    roots.set('سێ', { meaning: 'three', pos: 'numeral' })
    roots.set('چوار', { meaning: 'four', pos: 'numeral' })
    roots.set('پێنج', { meaning: 'five', pos: 'numeral' })
    roots.set('شەش', { meaning: 'six', pos: 'numeral' })
    roots.set('حەوت', { meaning: 'seven', pos: 'numeral' })
    roots.set('هەشت', { meaning: 'eight', pos: 'numeral' })
    roots.set('نۆ', { meaning: 'nine', pos: 'numeral' })
    roots.set('دە', { meaning: 'ten', pos: 'numeral' })
    roots.set('سەد', { meaning: 'hundred', pos: 'numeral' })
    roots.set('هەزار', { meaning: 'thousand', pos: 'numeral' })

    // ── Adverbs ──
    roots.set('ئێستا', { meaning: 'now', pos: 'adverb' })
    roots.set('دوێنێ', { meaning: 'yesterday', pos: 'adverb' })
    roots.set('سبەی', { meaning: 'tomorrow', pos: 'adverb' })
    roots.set('هەمیشە', { meaning: 'always', pos: 'adverb' })
    roots.set('هەرگیز', { meaning: 'never', pos: 'adverb' })
    roots.set('زوو', { meaning: 'early/fast', pos: 'adverb' })
    roots.set('درەنگ', { meaning: 'late', pos: 'adverb' })
    roots.set('ئەمڕۆ', { meaning: 'today', pos: 'adverb' })

    // ── Pronouns ──
    roots.set('من', { meaning: 'I/me', pos: 'pronoun' })
    roots.set('تۆ', { meaning: 'you (singular)', pos: 'pronoun' })
    roots.set('ئەو', { meaning: 'he/she/it', pos: 'pronoun' })
    roots.set('ئێمە', { meaning: 'we', pos: 'pronoun' })
    roots.set('ئێوە', { meaning: 'you (plural)', pos: 'pronoun' })
    roots.set('ئەوان', { meaning: 'they', pos: 'pronoun' })

    // ── Postpositions / particles ──
    roots.set('لە', { meaning: 'in/at/from', pos: 'postposition' })
    roots.set('بۆ', { meaning: 'for/to', pos: 'postposition' })
    roots.set('بە', { meaning: 'with/by', pos: 'postposition' })
    roots.set('لەگەڵ', { meaning: 'with/together', pos: 'postposition' })
    roots.set('لەسەر', { meaning: 'on/upon', pos: 'postposition' })
    roots.set('لەژێر', { meaning: 'under', pos: 'postposition' })
    roots.set('لەنێوان', { meaning: 'between', pos: 'postposition' })
    roots.set('پێش', { meaning: 'before', pos: 'postposition' })
    roots.set('پاش', { meaning: 'after', pos: 'postposition' })
    roots.set('بەبێ', { meaning: 'without', pos: 'postposition' })

    return roots
  }

  private extractPrefixes(word: string): string[] {
    const found: string[] = []
    let remaining = word

    // Sort prefixes longest-first to avoid partial matches
    const sorted = [...PREFIXES.keys()].sort((a, b) => b.length - a.length)

    for (const prefix of sorted) {
      if (remaining.startsWith(prefix) && remaining.length > prefix.length) {
        found.push(prefix)
        remaining = remaining.slice(prefix.length)
        break // apply at most one prefix layer per pass
      }
    }

    return found
  }

  private stripPrefixes(word: string, prefixes: string[]): string {
    let result = word
    for (const p of prefixes) {
      if (result.startsWith(p)) {
        result = result.slice(p.length)
      }
    }
    return result
  }

  private extractSuffixes(word: string): string[] {
    const found: string[] = []
    let remaining = word

    // Sort suffixes longest-first
    const sorted = [...SUFFIXES.keys()].sort((a, b) => b.length - a.length)

    for (const suffix of sorted) {
      if (remaining.endsWith(suffix) && remaining.length > suffix.length) {
        found.push(suffix)
        remaining = remaining.slice(0, remaining.length - suffix.length)
        break // one suffix per pass
      }
    }

    return found
  }

  private stripSuffixes(word: string, suffixes: string[]): string {
    let result = word
    for (const s of suffixes) {
      if (result.endsWith(s)) {
        result = result.slice(0, result.length - s.length)
      }
    }
    return result
  }

  private resolveRoot(stem: string): string {
    // Direct dictionary hit
    if (this.roots.has(stem)) return stem

    // Try progressively shorter stems (minimum 2 characters)
    for (let len = stem.length - 1; len >= 2; len--) {
      const candidate = stem.slice(0, len)
      if (this.roots.has(candidate)) return candidate
    }

    // Return the stem as-is if no known root matches
    return stem
  }

  private determinePOS(root: string, prefixes: string[], suffixes: string[]): string {
    // Check dictionary first
    const entry = this.roots.get(root)
    if (entry) return entry.pos

    // Heuristic: verbal prefixes imply verb
    const verbalPrefixes = ['دە', 'نا', 'ب', 'بـ']
    if (prefixes.some(p => verbalPrefixes.includes(p))) return 'verb'

    // Heuristic: agent suffixes imply noun
    const agentSuffixes = ['کار', 'گەر']
    if (suffixes.some(s => agentSuffixes.includes(s))) return 'noun'

    // Heuristic: adjectival suffix
    if (suffixes.includes('یانە')) return 'adjective'

    // Heuristic: abstract-noun suffix
    if (suffixes.includes('انە')) return 'noun'

    // Heuristic: plural/definite suffixes suggest noun
    const nounSuffixes = ['ان', 'ەکان', 'ەکە', 'ێک']
    if (suffixes.some(s => nounSuffixes.includes(s))) return 'noun'

    return 'unknown'
  }

  private buildPattern(prefixes: string[], root: string, suffixes: string[]): string {
    const parts: string[] = []
    if (prefixes.length > 0) parts.push(`[${prefixes.join('+')}]`)
    parts.push('ROOT')
    if (suffixes.length > 0) parts.push(`[${suffixes.join('+')}]`)
    return parts.join('-')
  }

  private suggestCorrections(word: string): string[] {
    const suggestions: string[] = []
    const maxDistance = 2

    for (const [rootStr] of this.roots) {
      const dist = this.editDistance(word, rootStr)
      if (dist > 0 && dist <= maxDistance) {
        suggestions.push(rootStr)
      }
    }

    // Sort by distance (closest first), limit to 5 suggestions
    return suggestions
      .sort((a, b) => this.editDistance(word, a) - this.editDistance(word, b))
      .slice(0, 5)
  }

  private editDistance(a: string, b: string): number {
    const m = a.length
    const n = b.length
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => {
      const row = Array(n + 1).fill(0) as number[]
      row[0] = i
      return row
    })
    for (let j = 0; j <= n; j++) dp[0]![j] = j

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost)
      }
    }

    return dp[m]![n]!
  }

  private arabicToLatin(text: string): string {
    let result = ''
    let i = 0

    while (i < text.length) {
      let matched = false

      // Try two-character sequences first (e.g. وو → û, یی → î)
      if (i + 1 < text.length) {
        const pair = text.slice(i, i + 2)
        for (const [arabic, latin] of ARABIC_TO_LATIN) {
          if (arabic === pair) {
            result += latin
            i += 2
            matched = true
            break
          }
        }
      }

      if (!matched) {
        const ch = text[i]!
        let found = false
        for (const [arabic, latin] of ARABIC_TO_LATIN) {
          if (arabic.length === 1 && arabic === ch) {
            result += latin
            found = true
            break
          }
        }
        if (!found) {
          result += ch // pass through unmapped characters (spaces, punctuation)
        }
        i++
      }
    }

    return result
  }

  private latinToArabic(text: string): string {
    let result = ''
    let i = 0
    const lower = text.toLowerCase()

    while (i < lower.length) {
      let matched = false

      // Try multi-byte Latin sequences first (e.g. ř, ç, etc.)
      for (const [latin, arabic] of LATIN_TO_ARABIC) {
        if (lower.startsWith(latin, i)) {
          result += arabic
          i += latin.length
          matched = true
          break
        }
      }

      if (!matched) {
        result += lower[i] // pass through unmapped characters
        i++
      }
    }

    return result
  }
}
