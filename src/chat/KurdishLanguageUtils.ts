/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  KurdishLanguageUtils — Kurdish Sorani proverbs, numbers, greetings,       ║
 * ║  and cultural vocabulary                                                   ║
 * ║                                                                            ║
 * ║  Provides:                                                                 ║
 * ║    ✦ Kurdish proverb/saying database with English translations             ║
 * ║    ✦ Kurdish number word system (cardinal, ordinal)                        ║
 * ║    ✦ Kurdish greeting generator (time-aware)                               ║
 * ║    ✦ Kurdish date vocabulary (days, months)                                ║
 * ║    ✦ Sorani ↔ Kurmanji dialect awareness                                  ║
 * ║                                                                            ║
 * ║  No external dependencies. Fully self-contained.                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** A Kurdish proverb/saying with its English translation and meaning. */
export interface KurdishProverb {
  /** Original Kurdish Sorani text */
  readonly ckb: string
  /** English translation */
  readonly eng: string
  /** Category/theme */
  readonly category: string
}

/** A dialect comparison entry. */
export interface DialectComparison {
  /** Meaning in English */
  readonly meaning: string
  /** Sorani (Central Kurdish) form */
  readonly sorani: string
  /** Kurmanji (Northern Kurdish) form */
  readonly kurmanji: string
}

/** Kurdish day of the week */
export interface KurdishDay {
  readonly name: string
  readonly english: string
}

/** Kurdish month */
export interface KurdishMonth {
  readonly name: string
  readonly english: string
  readonly gregorianApprox: string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Kurdish proverb collection — traditional sayings with translations. */
const PROVERBS: readonly KurdishProverb[] = [
  // ── Wisdom & Life ──
  {
    ckb: 'ئاو کە بچێتەوە بنی گۆم، شوێنی خۆی دەبینێتەوە',
    eng: 'Water finds its own level',
    category: 'wisdom',
  },
  {
    ckb: 'بەردێک بە دوو دەست هەڵناگیرێت',
    eng: 'A stone cannot be lifted with two fingers',
    category: 'wisdom',
  },
  { ckb: 'دەم گرتن ئاڵتوونە', eng: 'Silence is golden', category: 'wisdom' },
  {
    ckb: 'زۆر قسەکردن نیشانەی بێ ئاقڵییە',
    eng: 'Too much talking is a sign of foolishness',
    category: 'wisdom',
  },
  {
    ckb: 'دوای هەر تاریکییەک ڕووناکی هەیە',
    eng: 'After every darkness there is light',
    category: 'wisdom',
  },
  { ckb: 'ئاگر بەبێ دووکەڵ نابێت', eng: 'There is no fire without smoke', category: 'wisdom' },
  {
    ckb: 'کەسێک کە ڕاستگۆ بێت، دنیا هی ئەوە',
    eng: 'The world belongs to the truthful',
    category: 'wisdom',
  },
  { ckb: 'گوڵ بە بێ دڕکە نابێت', eng: 'There is no rose without thorns', category: 'wisdom' },
  {
    ckb: 'دار بە باری بۆنی خۆیەوە دەناسرێت',
    eng: 'A tree is known by its fruit',
    category: 'wisdom',
  },
  { ckb: 'مار بە خێزان نییە', eng: 'A snake has no family (evil is alone)', category: 'wisdom' },

  // ── Friendship & Unity ──
  {
    ckb: 'هاوڕێی باش لە زێڕ باشترە',
    eng: 'A good friend is better than gold',
    category: 'friendship',
  },
  { ckb: 'یەکگرتن هێزە', eng: 'Unity is strength', category: 'friendship' },
  {
    ckb: 'دوو دەست کە پاکبکرێن، ڕووی دەشۆن',
    eng: 'Two hands wash each other and both wash the face',
    category: 'friendship',
  },
  {
    ckb: 'دراوسێی باش لە برای دوور باشترە',
    eng: 'A good neighbor is better than a distant brother',
    category: 'friendship',
  },
  {
    ckb: 'بەیەکەوە نیعمەتین، بەتەنها زەحمەتین',
    eng: 'Together is a blessing, alone is a hardship',
    category: 'friendship',
  },

  // ── Hard Work & Perseverance ──
  {
    ckb: 'بەبێ ماندووبوون، سەرکەوتن نییە',
    eng: 'Without effort there is no success',
    category: 'perseverance',
  },
  {
    ckb: 'ڕێگای هەزار میل بە یەک هەنگاو دەست پێ دەکات',
    eng: 'A journey of a thousand miles begins with a single step',
    category: 'perseverance',
  },
  {
    ckb: 'سەبر تاڵە بەڵام بەرەکەتی شیرینە',
    eng: 'Patience is bitter, but its fruit is sweet',
    category: 'perseverance',
  },
  {
    ckb: 'کاری ئەمڕۆ بۆ سبەی مەهێڵەوە',
    eng: "Do not leave today's work for tomorrow",
    category: 'perseverance',
  },
  {
    ckb: 'داری بڵند باکەی زۆرترە',
    eng: 'The taller the tree, the more wind it faces',
    category: 'perseverance',
  },

  // ── Knowledge & Learning ──
  { ckb: 'زانایی سامانی ڕاستەقینەیە', eng: 'Knowledge is true wealth', category: 'knowledge' },
  { ckb: 'کتێب باشترین هاوڕێیە', eng: 'Books are the best friends', category: 'knowledge' },
  { ckb: 'فێربوون تەمەنی نییە', eng: 'Learning has no age limit', category: 'knowledge' },
  {
    ckb: 'نەزانی عەیب نییە، نەپرسین عەیبە',
    eng: 'Not knowing is not a shame, not asking is',
    category: 'knowledge',
  },
  {
    ckb: 'قەلەمی زانایان بەهێزترە لە شمشێری پاڵەوانان',
    eng: 'The pen of scholars is mightier than the sword of warriors',
    category: 'knowledge',
  },

  // ── Family & Home ──
  { ckb: 'ماڵ وەکوو ئاشیانەی بەرزە', eng: 'Home is like a high nest', category: 'family' },
  { ckb: 'دەست دایک گەرمە', eng: "A mother's hand is warm", category: 'family' },
  {
    ckb: 'کوڕی باش ناوی باوکی بڵندکەرەوە',
    eng: "A good son elevates his father's name",
    category: 'family',
  },
  {
    ckb: 'شەو هەر درێژ بێت، بەیانی دەبێت',
    eng: 'However long the night, dawn will come',
    category: 'family',
  },
  { ckb: 'نان و خوێ هاوسایەیە', eng: 'Bread and salt make neighbors', category: 'family' },

  // ── Kurdish Identity ──
  {
    ckb: 'کورد هاوڕێی چیایە',
    eng: 'Kurds have no friends but the mountains',
    category: 'identity',
  },
  {
    ckb: 'زمانم هەیە، نەتەوەم هەیە',
    eng: 'I have my language, I have my nation',
    category: 'identity',
  },
  {
    ckb: 'چیاکان بکوژن، بەڵام خاکی نیشتمان نافرۆشم',
    eng: "Mountains may crush me, but I won't sell my homeland",
    category: 'identity',
  },
  { ckb: 'نەورۆز بە ئاگر دەستپێ دەکات', eng: 'Newroz begins with fire', category: 'identity' },
  {
    ckb: 'کوردایەتی بە دڵ و خوێن دەژین',
    eng: 'Kurdishness lives in heart and blood',
    category: 'identity',
  },
]

/** Cardinal numbers: 0–20, 30, 40, 50, 60, 70, 80, 90, 100, 1000. */
const CARDINAL_NUMBERS: ReadonlyMap<number, string> = new Map([
  [0, 'سفر'],
  [1, 'یەک'],
  [2, 'دوو'],
  [3, 'سێ'],
  [4, 'چوار'],
  [5, 'پێنج'],
  [6, 'شەش'],
  [7, 'حەوت'],
  [8, 'هەشت'],
  [9, 'نۆ'],
  [10, 'دە'],
  [11, 'یانزە'],
  [12, 'دوانزە'],
  [13, 'سیانزە'],
  [14, 'چواردە'],
  [15, 'پانزە'],
  [16, 'شانزە'],
  [17, 'حەڤدە'],
  [18, 'هەژدە'],
  [19, 'نۆزدە'],
  [20, 'بیست'],
  [30, 'سی'],
  [40, 'چل'],
  [50, 'پەنجا'],
  [60, 'شەست'],
  [70, 'حەفتا'],
  [80, 'هەشتا'],
  [90, 'نەوەد'],
  [100, 'سەد'],
  [1000, 'هەزار'],
])

/** Ordinal suffixes for numbers. */
const ORDINAL_SUFFIX = 'ەم'

/** Days of the week in Kurdish Sorani. */
const DAYS_OF_WEEK: readonly KurdishDay[] = [
  { name: 'شەممە', english: 'Saturday' },
  { name: 'یەکشەممە', english: 'Sunday' },
  { name: 'دووشەممە', english: 'Monday' },
  { name: 'سێشەممە', english: 'Tuesday' },
  { name: 'چوارشەممە', english: 'Wednesday' },
  { name: 'پێنجشەممە', english: 'Thursday' },
  { name: 'هەینی', english: 'Friday' },
]

/** Kurdish months (Rojhalati calendar). */
const KURDISH_MONTHS: readonly KurdishMonth[] = [
  { name: 'خاکەلێوە', english: 'Xakelêwe', gregorianApprox: 'March–April' },
  { name: 'گوڵان', english: 'Gulan', gregorianApprox: 'April–May' },
  { name: 'جۆزەردان', english: 'Cozerdan', gregorianApprox: 'May–June' },
  { name: 'پووشپەڕ', english: 'Pûshper', gregorianApprox: 'June–July' },
  { name: 'گەلاوێژ', english: 'Gelawêj', gregorianApprox: 'July–August' },
  { name: 'خەرمانان', english: 'Xermanan', gregorianApprox: 'August–September' },
  { name: 'ڕەزبەر', english: 'Rezber', gregorianApprox: 'September–October' },
  { name: 'گەڵاڕێزان', english: 'Gelarêzan', gregorianApprox: 'October–November' },
  { name: 'سەرماوەز', english: 'Sermawez', gregorianApprox: 'November–December' },
  { name: 'بەفرانبار', english: 'Befranbar', gregorianApprox: 'December–January' },
  { name: 'ڕێبەندان', english: 'Rêbendan', gregorianApprox: 'January–February' },
  { name: 'ڕەشەمە', english: 'Resheme', gregorianApprox: 'February–March' },
]

/** Common Sorani ↔ Kurmanji vocabulary differences. */
const DIALECT_COMPARISONS: readonly DialectComparison[] = [
  { meaning: 'water', sorani: 'ئاو', kurmanji: 'av' },
  { meaning: 'bread', sorani: 'نان', kurmanji: 'nan' },
  { meaning: 'house', sorani: 'خانوو / ماڵ', kurmanji: 'mal / xanî' },
  { meaning: 'I', sorani: 'من', kurmanji: 'ez' },
  { meaning: 'you (sg.)', sorani: 'تۆ', kurmanji: 'tu' },
  { meaning: 'he/she', sorani: 'ئەو', kurmanji: 'ew' },
  { meaning: 'we', sorani: 'ئێمە', kurmanji: 'em' },
  { meaning: 'good', sorani: 'باش', kurmanji: 'baş' },
  { meaning: 'beautiful', sorani: 'جوان', kurmanji: 'xweşik / bedew' },
  { meaning: 'child', sorani: 'منداڵ', kurmanji: 'zarok' },
  { meaning: 'woman', sorani: 'ژن / ئافرەت', kurmanji: 'jin / afret' },
  { meaning: 'man', sorani: 'پیاو', kurmanji: 'mêr / zilam' },
  { meaning: 'come!', sorani: 'وەرە!', kurmanji: 'were!' },
  { meaning: 'go!', sorani: 'بڕۆ!', kurmanji: 'biçe!' },
  { meaning: 'yes', sorani: 'بەڵێ', kurmanji: 'erê / belê' },
  { meaning: 'no', sorani: 'نەخێر / نا', kurmanji: 'na / naxêr' },
  { meaning: 'now', sorani: 'ئێستا', kurmanji: 'niha' },
  { meaning: 'today', sorani: 'ئەمڕۆ', kurmanji: 'îro' },
  { meaning: 'tomorrow', sorani: 'سبەی / سبەینێ', kurmanji: 'sibê' },
  { meaning: 'yesterday', sorani: 'دوێنێ', kurmanji: 'duh' },
  { meaning: 'thank you', sorani: 'سوپاس / سپاس', kurmanji: 'spas' },
  { meaning: 'hello', sorani: 'سلاو', kurmanji: 'silav' },
  { meaning: 'how are you?', sorani: 'چۆنی؟', kurmanji: 'çawa yî? / tu çawan î?' },
  { meaning: 'book', sorani: 'کتێب', kurmanji: 'pirtûk' },
  { meaning: 'friend', sorani: 'هاوڕێ', kurmanji: 'heval' },
  { meaning: 'food', sorani: 'خواردن', kurmanji: 'xwarin' },
  { meaning: 'love', sorani: 'خۆشەویستی / ئەوین', kurmanji: 'evîn / hezkirîn' },
  { meaning: 'mountain', sorani: 'چیا / کێو', kurmanji: 'çiya' },
  { meaning: 'heart', sorani: 'دڵ', kurmanji: 'dil' },
  { meaning: 'sun', sorani: 'هەتاو / خۆر', kurmanji: 'tav / roj' },
]

/** Common Kurdish greetings. */
const GREETINGS: ReadonlyMap<string, string> = new Map([
  ['سلاو', 'Hello (informal)'],
  ['ڕۆژباش', 'Good day'],
  ['بەیانیباش', 'Good morning'],
  ['ئێوارەباش', 'Good evening'],
  ['شەوباش', 'Good night'],
  ['بەخێربێی', 'Welcome (to a single person)'],
  ['بەخێربێن', 'Welcome (to a group)'],
  ['چۆنی؟', 'How are you? (informal)'],
  ['چۆنیت؟', 'How are you? (formal)'],
  ['باشم سوپاس', "I'm fine, thanks"],
  ['خوات لەگەڵ', 'God be with you (goodbye)'],
  ['بەسلامەت', 'Goodbye / Stay safe'],
  ['سوپاس', 'Thank you'],
  ['زۆر سوپاس', 'Thank you very much'],
  ['بەخێر بێت', 'May it be good (congratulations)'],
  ['پیرۆزبێت', 'Congratulations'],
  ['ببوورە', 'Excuse me / Sorry'],
  ['دەستت خۆش', 'Well done / Thank you for your work'],
])

// ─── KurdishLanguageUtils Class ────────────────────────────────────────────────

/**
 * Kurdish language utility class providing proverbs, number conversion,
 * greetings, dialect comparisons, and cultural vocabulary.
 */
export class KurdishLanguageUtils {
  // ── Proverbs ──────────────────────────────────────────────────────────────

  /** Get all proverbs. */
  getProverbs(): readonly KurdishProverb[] {
    return PROVERBS
  }

  /** Get proverbs by category. */
  getProverbsByCategory(category: string): KurdishProverb[] {
    return PROVERBS.filter(p => p.category === category)
  }

  /** Get all proverb categories. */
  getProverbCategories(): string[] {
    return Array.from(new Set(PROVERBS.map(p => p.category)))
  }

  /** Get a random proverb. */
  getRandomProverb(): KurdishProverb {
    const idx = Math.floor(Math.random() * PROVERBS.length)
    return PROVERBS[idx]!
  }

  /** Search proverbs by keyword (searches both Kurdish and English). */
  searchProverbs(query: string, limit = 10): KurdishProverb[] {
    const q = query.toLowerCase()
    const results: KurdishProverb[] = []
    for (const p of PROVERBS) {
      if (p.ckb.includes(query) || p.eng.toLowerCase().includes(q)) {
        results.push(p)
        if (results.length >= limit) break
      }
    }
    return results
  }

  /** Get the total number of proverbs. */
  get totalProverbs(): number {
    return PROVERBS.length
  }

  // ── Numbers ───────────────────────────────────────────────────────────────

  /**
   * Convert a number (0–9999) to Kurdish Sorani words.
   * @param n - The number to convert
   * @returns Kurdish word representation
   */
  numberToKurdish(n: number): string {
    if (n < 0 || n > 9999 || !Number.isInteger(n)) return String(n)

    if (CARDINAL_NUMBERS.has(n)) return CARDINAL_NUMBERS.get(n)!

    if (n < 100) {
      const tens = Math.floor(n / 10) * 10
      const ones = n % 10
      const tensWord = CARDINAL_NUMBERS.get(tens) ?? ''
      const onesWord = CARDINAL_NUMBERS.get(ones) ?? ''
      return ones === 0 ? tensWord : `${tensWord} و ${onesWord}`
    }

    if (n < 1000) {
      const hundreds = Math.floor(n / 100)
      const remainder = n % 100
      const hundredsPart = hundreds === 1 ? 'سەد' : `${CARDINAL_NUMBERS.get(hundreds) ?? ''} سەد`
      if (remainder === 0) return hundredsPart
      return `${hundredsPart} و ${this.numberToKurdish(remainder)}`
    }

    // 1000–9999
    const thousands = Math.floor(n / 1000)
    const remainder = n % 1000
    const thousandsPart =
      thousands === 1 ? 'هەزار' : `${CARDINAL_NUMBERS.get(thousands) ?? ''} هەزار`
    if (remainder === 0) return thousandsPart
    return `${thousandsPart} و ${this.numberToKurdish(remainder)}`
  }

  /**
   * Convert a number to Kurdish ordinal form.
   * @param n - The number (1–9999)
   * @returns Kurdish ordinal word (e.g., "یەکەم", "دووەم")
   */
  numberToOrdinal(n: number): string {
    if (n <= 0 || n > 9999 || !Number.isInteger(n)) return String(n)
    if (n === 1) return 'یەکەم'
    return this.numberToKurdish(n) + ORDINAL_SUFFIX
  }

  // ── Days & Months ─────────────────────────────────────────────────────────

  /** Get all days of the week. */
  getDaysOfWeek(): readonly KurdishDay[] {
    return DAYS_OF_WEEK
  }

  /** Get a day by English name (case-insensitive). */
  getDay(english: string): KurdishDay | undefined {
    return DAYS_OF_WEEK.find(d => d.english.toLowerCase() === english.toLowerCase())
  }

  /** Get all Kurdish calendar months. */
  getMonths(): readonly KurdishMonth[] {
    return KURDISH_MONTHS
  }

  /** Get a month by English name (case-insensitive). */
  getMonth(english: string): KurdishMonth | undefined {
    return KURDISH_MONTHS.find(m => m.english.toLowerCase() === english.toLowerCase())
  }

  // ── Greetings ─────────────────────────────────────────────────────────────

  /** Get all greetings with their meanings. */
  getGreetings(): ReadonlyMap<string, string> {
    return GREETINGS
  }

  /**
   * Get an appropriate time-based greeting.
   * @param hour - Hour of the day (0–23). Defaults to current hour.
   * @returns A Kurdish greeting appropriate for the time
   */
  getTimeGreeting(hour?: number): string {
    const h = hour ?? new Date().getHours()
    if (h >= 5 && h < 12) return 'بەیانیباش'
    if (h >= 12 && h < 17) return 'ڕۆژباش'
    if (h >= 17 && h < 21) return 'ئێوارەباش'
    return 'شەوباش'
  }

  // ── Dialect Comparisons ───────────────────────────────────────────────────

  /** Get all Sorani ↔ Kurmanji dialect comparisons. */
  getDialectComparisons(): readonly DialectComparison[] {
    return DIALECT_COMPARISONS
  }

  /** Search dialect comparisons by meaning. */
  searchDialect(meaning: string): DialectComparison[] {
    const q = meaning.toLowerCase()
    return DIALECT_COMPARISONS.filter(d => d.meaning.toLowerCase().includes(q))
  }

  /** Get total number of dialect comparison entries. */
  get totalDialectEntries(): number {
    return DIALECT_COMPARISONS.length
  }

  // ── Statistics ────────────────────────────────────────────────────────────

  /** Get summary statistics. */
  getStats(): {
    proverbs: number
    proverbCategories: number
    greetings: number
    dialectEntries: number
    days: number
    months: number
  } {
    return {
      proverbs: PROVERBS.length,
      proverbCategories: this.getProverbCategories().length,
      greetings: GREETINGS.size,
      dialectEntries: DIALECT_COMPARISONS.length,
      days: DAYS_OF_WEEK.length,
      months: KURDISH_MONTHS.length,
    }
  }
}
