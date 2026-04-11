/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  KurdishSentimentAnalyzer — Kurdish Sorani sentiment analysis engine        ║
 * ║                                                                            ║
 * ║  Lexicon-based sentiment analyzer for Kurdish Sorani text with support     ║
 * ║  for contextual negation, intensifiers, emoji analysis, and emotion        ║
 * ║  detection. Built around a curated lexicon of 200+ sentiment words.        ║
 * ║                                                                            ║
 * ║    ✦ Weighted lexicon lookup with emotion categories                       ║
 * ║    ✦ Negation handling (نا, نە, هیچ) flips polarity                        ║
 * ║    ✦ Intensifier support (زۆر, تەواو, گەلەک)                               ║
 * ║    ✦ Emoji sentiment scoring                                               ║
 * ║    ✦ Representative corpus from real Kurdish tweets                        ║
 * ║    ✦ LRU result caching for performance                                   ║
 * ║                                                                            ║
 * ║  Based on data from Hrazhan/sentiment (Hameed, Ahmadi & Daneshfar, 2023   ║
 * ║  — "Transfer Learning for Low-Resource Sentiment Analysis").               ║
 * ║                                                                            ║
 * ║  No external dependencies.                                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Sentiment polarity label. */
export type SentimentLabel = 'positive' | 'negative' | 'neutral' | 'mixed'

/** Full result returned by the analyzer for a single text. */
export interface SentimentResult {
  /** Overall sentiment polarity. */
  readonly label: SentimentLabel
  /** Confidence in the assigned label (0–1). */
  readonly confidence: number
  /** Per-label score breakdown. */
  readonly scores: { positive: number; negative: number; neutral: number; mixed: number }
  /** Primary detected emotion, e.g. 'joy', 'sadness', 'anger'. */
  readonly dominantEmotion: string
  /** Whether the text appears subjective rather than factual. */
  readonly isSubjective: boolean
  /** Human-readable explanation of the analysis. */
  readonly explanation: string
}

/** A single entry in the sentiment lexicon. */
export interface SentimentWord {
  /** Kurdish Sorani word form. */
  readonly word: string
  /** Associated sentiment polarity. */
  readonly sentiment: SentimentLabel
  /** Signed weight from -1 (strongly negative) to 1 (strongly positive). */
  readonly weight: number
  /** Emotion category this word belongs to. */
  readonly category: string
}

/** A representative corpus sample from the Hrazhan/sentiment dataset. */
export interface SentimentCorpusSample {
  /** Original Kurdish Sorani text. */
  readonly text: string
  /** Annotated sentiment label. */
  readonly sentiment: SentimentLabel
  /** Annotation quality tier: 'gold' (manually verified) or 'silver' (auto-labeled). */
  readonly source: 'gold' | 'silver'
}

/** Configuration for the Kurdish sentiment analyzer. */
export interface KurdishSentimentConfig {
  /** Use negation / intensifier context rules. Default: true. */
  readonly enableContextualAnalysis: boolean
  /** Minimum confidence to assign a non-neutral label. Default: 0.3. */
  readonly minConfidence: number
  /** Score emoji characters found in text. Default: true. */
  readonly enableEmojiAnalysis: boolean
  /** Maximum cached analysis results. Default: 300. */
  readonly maxCacheSize: number
}

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Default analyzer configuration. */
export const DEFAULT_SENTIMENT_CONFIG: KurdishSentimentConfig = {
  enableContextualAnalysis: true,
  minConfidence: 0.3,
  enableEmojiAnalysis: true,
  maxCacheSize: 300,
}

/**
 * Comprehensive Kurdish Sorani sentiment lexicon derived from patterns
 * observed in the Hrazhan/sentiment dataset (Hameed, Ahmadi & Daneshfar, 2023).
 */
const SENTIMENT_LEXICON: readonly SentimentWord[] = [
  // ── Positive words (55) ──────────────────────────────────────────────────
  { word: 'خۆشحاڵ', sentiment: 'positive', weight: 0.85, category: 'joy' },
  { word: 'جوان', sentiment: 'positive', weight: 0.75, category: 'joy' },
  { word: 'باش', sentiment: 'positive', weight: 0.65, category: 'joy' },
  { word: 'خۆش', sentiment: 'positive', weight: 0.7, category: 'joy' },
  { word: 'سوپاس', sentiment: 'positive', weight: 0.8, category: 'gratitude' },
  { word: 'سپاس', sentiment: 'positive', weight: 0.8, category: 'gratitude' },
  { word: 'بەختەوەر', sentiment: 'positive', weight: 0.9, category: 'joy' },
  { word: 'ئازاد', sentiment: 'positive', weight: 0.75, category: 'hope' },
  { word: 'سەرکەوتن', sentiment: 'positive', weight: 0.85, category: 'pride' },
  { word: 'هیوا', sentiment: 'positive', weight: 0.7, category: 'hope' },
  { word: 'خۆشەویستی', sentiment: 'positive', weight: 0.9, category: 'love' },
  { word: 'ئارام', sentiment: 'positive', weight: 0.6, category: 'joy' },
  { word: 'دڵخۆش', sentiment: 'positive', weight: 0.75, category: 'joy' },
  { word: 'پیرۆز', sentiment: 'positive', weight: 0.8, category: 'joy' },
  { word: 'گەشبین', sentiment: 'positive', weight: 0.7, category: 'hope' },
  { word: 'بەرز', sentiment: 'positive', weight: 0.55, category: 'pride' },
  { word: 'نوێ', sentiment: 'positive', weight: 0.45, category: 'hope' },
  { word: 'توانا', sentiment: 'positive', weight: 0.65, category: 'pride' },
  { word: 'هاوکار', sentiment: 'positive', weight: 0.6, category: 'gratitude' },
  { word: 'ئاسوودە', sentiment: 'positive', weight: 0.65, category: 'joy' },
  { word: 'ڕەزامەندی', sentiment: 'positive', weight: 0.7, category: 'gratitude' },
  { word: 'دڵسۆز', sentiment: 'positive', weight: 0.75, category: 'love' },
  { word: 'شانازی', sentiment: 'positive', weight: 0.7, category: 'pride' },
  { word: 'خەڵات', sentiment: 'positive', weight: 0.65, category: 'joy' },
  { word: 'ڕۆشنایی', sentiment: 'positive', weight: 0.6, category: 'hope' },
  { word: 'دەستکەوت', sentiment: 'positive', weight: 0.75, category: 'pride' },
  { word: 'پێکەنین', sentiment: 'positive', weight: 0.7, category: 'joy' },
  { word: 'گوڵ', sentiment: 'positive', weight: 0.6, category: 'love' },
  { word: 'ڕێز', sentiment: 'positive', weight: 0.65, category: 'gratitude' },
  { word: 'سەلامەت', sentiment: 'positive', weight: 0.6, category: 'joy' },
  { word: 'دەنگدار', sentiment: 'positive', weight: 0.55, category: 'pride' },
  { word: 'خۆشەویست', sentiment: 'positive', weight: 0.85, category: 'love' },
  { word: 'بەنرخ', sentiment: 'positive', weight: 0.65, category: 'pride' },
  { word: 'جێگای', sentiment: 'positive', weight: 0.5, category: 'pride' },
  { word: 'بڵند', sentiment: 'positive', weight: 0.55, category: 'pride' },
  { word: 'زۆر باش', sentiment: 'positive', weight: 0.8, category: 'joy' },
  { word: 'شکۆمەند', sentiment: 'positive', weight: 0.75, category: 'pride' },
  { word: 'پشت', sentiment: 'positive', weight: 0.5, category: 'hope' },
  { word: 'نەرم', sentiment: 'positive', weight: 0.45, category: 'love' },
  { word: 'هەڵگری', sentiment: 'positive', weight: 0.5, category: 'pride' },
  { word: 'پاک', sentiment: 'positive', weight: 0.6, category: 'joy' },
  { word: 'سادە', sentiment: 'positive', weight: 0.4, category: 'joy' },
  { word: 'ڕاست', sentiment: 'positive', weight: 0.55, category: 'pride' },
  { word: 'دڵنیا', sentiment: 'positive', weight: 0.65, category: 'pride' },
  { word: 'شیرین', sentiment: 'positive', weight: 0.7, category: 'love' },
  { word: 'تایبەت', sentiment: 'positive', weight: 0.55, category: 'pride' },
  { word: 'هەناسە', sentiment: 'positive', weight: 0.5, category: 'joy' },
  { word: 'بەهرە', sentiment: 'positive', weight: 0.55, category: 'joy' },
  { word: 'پاداشت', sentiment: 'positive', weight: 0.65, category: 'gratitude' },
  { word: 'هێز', sentiment: 'positive', weight: 0.6, category: 'pride' },
  { word: 'سەرکەوتوو', sentiment: 'positive', weight: 0.85, category: 'pride' },
  { word: 'خۆشی', sentiment: 'positive', weight: 0.75, category: 'joy' },
  { word: 'بەرەکەت', sentiment: 'positive', weight: 0.65, category: 'gratitude' },
  { word: 'ئاشتی', sentiment: 'positive', weight: 0.7, category: 'hope' },
  { word: 'دڵۆڤانی', sentiment: 'positive', weight: 0.75, category: 'love' },
  { word: 'بژی', sentiment: 'positive', weight: 0.8, category: 'hope' },
  { word: 'خۆشبێت', sentiment: 'positive', weight: 0.75, category: 'gratitude' },
  { word: 'گەورە', sentiment: 'positive', weight: 0.6, category: 'pride' },
  { word: 'ڕازی', sentiment: 'positive', weight: 0.65, category: 'joy' },
  { word: 'بەرەو', sentiment: 'positive', weight: 0.4, category: 'hope' },
  { word: 'ئومێد', sentiment: 'positive', weight: 0.7, category: 'hope' },
  { word: 'ئەخلاق', sentiment: 'positive', weight: 0.65, category: 'pride' },
  { word: 'دڵسۆزی', sentiment: 'positive', weight: 0.7, category: 'love' },
  { word: 'خودا', sentiment: 'positive', weight: 0.5, category: 'hope' },
  { word: 'پارێزگاری', sentiment: 'positive', weight: 0.65, category: 'pride' },
  { word: 'لەزەت', sentiment: 'positive', weight: 0.7, category: 'joy' },
  { word: 'میهرەبان', sentiment: 'positive', weight: 0.75, category: 'love' },
  { word: 'هاوڕێ', sentiment: 'positive', weight: 0.65, category: 'love' },
  { word: 'بەخت', sentiment: 'positive', weight: 0.75, category: 'joy' },
  { word: 'نیشتمان', sentiment: 'positive', weight: 0.6, category: 'pride' },
  { word: 'ئازادی', sentiment: 'positive', weight: 0.8, category: 'hope' },
  { word: 'سۆز', sentiment: 'positive', weight: 0.65, category: 'love' },
  { word: 'دەستخۆش', sentiment: 'positive', weight: 0.75, category: 'gratitude' },
  { word: 'شایەنی', sentiment: 'positive', weight: 0.6, category: 'pride' },
  { word: 'دڵگرم', sentiment: 'positive', weight: 0.7, category: 'hope' },
  { word: 'بەرەکەللا', sentiment: 'positive', weight: 0.75, category: 'gratitude' },
  { word: 'ئاوەدان', sentiment: 'positive', weight: 0.65, category: 'hope' },
  { word: 'ڕووناکی', sentiment: 'positive', weight: 0.6, category: 'hope' },
  { word: 'نازدار', sentiment: 'positive', weight: 0.65, category: 'love' },
  { word: 'خاوەن', sentiment: 'positive', weight: 0.5, category: 'pride' },
  { word: 'ئاسودە', sentiment: 'positive', weight: 0.6, category: 'joy' },
  { word: 'فەرح', sentiment: 'positive', weight: 0.7, category: 'joy' },
  { word: 'شاد', sentiment: 'positive', weight: 0.75, category: 'joy' },
  { word: 'خۆشبەخت', sentiment: 'positive', weight: 0.85, category: 'joy' },
  { word: 'بەرز', sentiment: 'positive', weight: 0.55, category: 'pride' },
  { word: 'دڵەڕەحم', sentiment: 'positive', weight: 0.7, category: 'love' },
  { word: 'بوێر', sentiment: 'positive', weight: 0.65, category: 'pride' },
  { word: 'گیان', sentiment: 'positive', weight: 0.6, category: 'love' },
  { word: 'ئاڵقۆس', sentiment: 'positive', weight: 0.5, category: 'love' },
  { word: 'لایەنگری', sentiment: 'positive', weight: 0.55, category: 'gratitude' },
  { word: 'مەزن', sentiment: 'positive', weight: 0.55, category: 'pride' },
  { word: 'بەرین', sentiment: 'positive', weight: 0.6, category: 'pride' },
  { word: 'پشتیوان', sentiment: 'positive', weight: 0.65, category: 'hope' },

  // ── Negative words (55+20 expanded) ──────────────────────────────────────
  { word: 'خەم', sentiment: 'negative', weight: -0.7, category: 'sadness' },
  { word: 'ئازار', sentiment: 'negative', weight: -0.75, category: 'sadness' },
  { word: 'ترس', sentiment: 'negative', weight: -0.7, category: 'fear' },
  { word: 'بێزار', sentiment: 'negative', weight: -0.65, category: 'frustration' },
  { word: 'ناشرین', sentiment: 'negative', weight: -0.6, category: 'sadness' },
  { word: 'خراپ', sentiment: 'negative', weight: -0.65, category: 'anger' },
  { word: 'قەلەق', sentiment: 'negative', weight: -0.6, category: 'fear' },
  { word: 'نەخۆش', sentiment: 'negative', weight: -0.65, category: 'sadness' },
  { word: 'هەڵە', sentiment: 'negative', weight: -0.55, category: 'frustration' },
  { word: 'تووڕە', sentiment: 'negative', weight: -0.75, category: 'anger' },
  { word: 'شەڕ', sentiment: 'negative', weight: -0.7, category: 'anger' },
  { word: 'بێ ئومێد', sentiment: 'negative', weight: -0.8, category: 'sadness' },
  { word: 'ناڕەحەت', sentiment: 'negative', weight: -0.55, category: 'frustration' },
  { word: 'کێشە', sentiment: 'negative', weight: -0.55, category: 'frustration' },
  { word: 'ئەندوو', sentiment: 'negative', weight: -0.7, category: 'sadness' },
  { word: 'نارەزایی', sentiment: 'negative', weight: -0.6, category: 'anger' },
  { word: 'زیان', sentiment: 'negative', weight: -0.65, category: 'sadness' },
  { word: 'دڵتەنگ', sentiment: 'negative', weight: -0.65, category: 'sadness' },
  { word: 'بەد', sentiment: 'negative', weight: -0.7, category: 'anger' },
  { word: 'ڕق', sentiment: 'negative', weight: -0.8, category: 'anger' },
  { word: 'نەفرەت', sentiment: 'negative', weight: -0.85, category: 'anger' },
  { word: 'تاوان', sentiment: 'negative', weight: -0.75, category: 'anger' },
  { word: 'فریو', sentiment: 'negative', weight: -0.7, category: 'anger' },
  { word: 'درۆ', sentiment: 'negative', weight: -0.65, category: 'anger' },
  { word: 'داخ', sentiment: 'negative', weight: -0.6, category: 'sadness' },
  { word: 'کوشتن', sentiment: 'negative', weight: -0.9, category: 'fear' },
  { word: 'مردن', sentiment: 'negative', weight: -0.85, category: 'fear' },
  { word: 'ئاگر', sentiment: 'negative', weight: -0.6, category: 'anger' },
  { word: 'وێران', sentiment: 'negative', weight: -0.8, category: 'sadness' },
  { word: 'گەندەڵ', sentiment: 'negative', weight: -0.75, category: 'anger' },
  { word: 'بێ سوود', sentiment: 'negative', weight: -0.55, category: 'frustration' },
  { word: 'بەئاشکرا', sentiment: 'negative', weight: -0.5, category: 'anger' },
  { word: 'پەشێو', sentiment: 'negative', weight: -0.55, category: 'fear' },
  { word: 'بوار', sentiment: 'negative', weight: -0.5, category: 'sadness' },
  { word: 'شکست', sentiment: 'negative', weight: -0.75, category: 'sadness' },
  { word: 'لاواز', sentiment: 'negative', weight: -0.55, category: 'sadness' },
  { word: 'عاجز', sentiment: 'negative', weight: -0.65, category: 'sadness' },
  { word: 'زوڵم', sentiment: 'negative', weight: -0.85, category: 'anger' },
  { word: 'ستەم', sentiment: 'negative', weight: -0.8, category: 'anger' },
  { word: 'بەندی', sentiment: 'negative', weight: -0.7, category: 'fear' },
  { word: 'قوربانی', sentiment: 'negative', weight: -0.7, category: 'sadness' },
  { word: 'ڕسوا', sentiment: 'negative', weight: -0.65, category: 'sadness' },
  { word: 'ئاژاوە', sentiment: 'negative', weight: -0.65, category: 'fear' },
  { word: 'تەنیا', sentiment: 'negative', weight: -0.6, category: 'sadness' },
  { word: 'گریان', sentiment: 'negative', weight: -0.7, category: 'sadness' },
  { word: 'برسی', sentiment: 'negative', weight: -0.5, category: 'sadness' },
  { word: 'نەهامەتی', sentiment: 'negative', weight: -0.7, category: 'sadness' },
  { word: 'داگیرکەر', sentiment: 'negative', weight: -0.8, category: 'anger' },
  { word: 'بێ ڕەحم', sentiment: 'negative', weight: -0.85, category: 'anger' },
  { word: 'تووشبوون', sentiment: 'negative', weight: -0.55, category: 'sadness' },
  { word: 'بێزاری', sentiment: 'negative', weight: -0.6, category: 'frustration' },
  { word: 'خەفەت', sentiment: 'negative', weight: -0.65, category: 'sadness' },
  { word: 'پەژارە', sentiment: 'negative', weight: -0.7, category: 'sadness' },
  { word: 'بێچارە', sentiment: 'negative', weight: -0.75, category: 'sadness' },
  { word: 'دڵشکاو', sentiment: 'negative', weight: -0.8, category: 'sadness' },
  { word: 'ناخۆش', sentiment: 'negative', weight: -0.55, category: 'frustration' },
  { word: 'تەقەت', sentiment: 'negative', weight: -0.5, category: 'frustration' },
  { word: 'نەیار', sentiment: 'negative', weight: -0.65, category: 'anger' },
  { word: 'تاڵان', sentiment: 'negative', weight: -0.75, category: 'anger' },
  { word: 'داماوی', sentiment: 'negative', weight: -0.55, category: 'sadness' },
  { word: 'تۆمار', sentiment: 'negative', weight: -0.4, category: 'frustration' },
  { word: 'بێتاقەت', sentiment: 'negative', weight: -0.65, category: 'frustration' },
  { word: 'خەڵوەز', sentiment: 'negative', weight: -0.6, category: 'sadness' },
  { word: 'گومان', sentiment: 'negative', weight: -0.45, category: 'fear' },
  { word: 'ئاوارە', sentiment: 'negative', weight: -0.7, category: 'sadness' },
  { word: 'بێکەسی', sentiment: 'negative', weight: -0.75, category: 'sadness' },
  { word: 'نائومێدی', sentiment: 'negative', weight: -0.8, category: 'sadness' },
  { word: 'خوارە', sentiment: 'negative', weight: -0.55, category: 'sadness' },
  { word: 'سەرلێشێواو', sentiment: 'negative', weight: -0.6, category: 'frustration' },
  { word: 'نەگبەت', sentiment: 'negative', weight: -0.7, category: 'sadness' },
  { word: 'خوارخوێن', sentiment: 'negative', weight: -0.85, category: 'anger' },
  { word: 'پەراوێز', sentiment: 'negative', weight: -0.5, category: 'sadness' },
  { word: 'ڕەشبین', sentiment: 'negative', weight: -0.65, category: 'sadness' },
  { word: 'توڕەیی', sentiment: 'negative', weight: -0.7, category: 'anger' },
  { word: 'بێ ئابڕوو', sentiment: 'negative', weight: -0.75, category: 'anger' },
  { word: 'خیانەت', sentiment: 'negative', weight: -0.85, category: 'anger' },
  { word: 'بێ وەفا', sentiment: 'negative', weight: -0.7, category: 'sadness' },
  { word: 'دڵکوێر', sentiment: 'negative', weight: -0.55, category: 'fear' },
  { word: 'ژەهراوی', sentiment: 'negative', weight: -0.7, category: 'fear' },
  { word: 'بێزاربوون', sentiment: 'negative', weight: -0.6, category: 'frustration' },
  { word: 'پاشگەز', sentiment: 'negative', weight: -0.5, category: 'frustration' },
  { word: 'وێرانکاری', sentiment: 'negative', weight: -0.8, category: 'anger' },
  { word: 'تاڵ', sentiment: 'negative', weight: -0.5, category: 'sadness' },
  { word: 'ناشاد', sentiment: 'negative', weight: -0.65, category: 'sadness' },
  { word: 'دڵشکانی', sentiment: 'negative', weight: -0.75, category: 'sadness' },
  { word: 'بێچارەیی', sentiment: 'negative', weight: -0.7, category: 'sadness' },
  { word: 'حەسوود', sentiment: 'negative', weight: -0.6, category: 'anger' },

  // ── Neutral words (36+15 expanded) ───────────────────────────────────────
  { word: 'ڕۆژ', sentiment: 'neutral', weight: 0.0, category: 'time' },
  { word: 'ڕەخنە', sentiment: 'neutral', weight: 0.0, category: 'communication' },
  { word: 'کات', sentiment: 'neutral', weight: 0.0, category: 'time' },
  { word: 'شت', sentiment: 'neutral', weight: 0.0, category: 'object' },
  { word: 'کەس', sentiment: 'neutral', weight: 0.0, category: 'person' },
  { word: 'ماڵ', sentiment: 'neutral', weight: 0.0, category: 'place' },
  { word: 'کار', sentiment: 'neutral', weight: 0.0, category: 'activity' },
  { word: 'قسە', sentiment: 'neutral', weight: 0.0, category: 'communication' },
  { word: 'مرۆڤ', sentiment: 'neutral', weight: 0.0, category: 'person' },
  { word: 'خەڵک', sentiment: 'neutral', weight: 0.0, category: 'person' },
  { word: 'دنیا', sentiment: 'neutral', weight: 0.0, category: 'place' },
  { word: 'ژیان', sentiment: 'neutral', weight: 0.0, category: 'abstract' },
  { word: 'شوێن', sentiment: 'neutral', weight: 0.0, category: 'place' },
  { word: 'ڕێگا', sentiment: 'neutral', weight: 0.0, category: 'place' },
  { word: 'وتن', sentiment: 'neutral', weight: 0.0, category: 'communication' },
  { word: 'بیرکردنەوە', sentiment: 'neutral', weight: 0.0, category: 'cognitive' },
  { word: 'زانیاری', sentiment: 'neutral', weight: 0.0, category: 'cognitive' },
  { word: 'پرسیار', sentiment: 'neutral', weight: 0.0, category: 'communication' },
  { word: 'وەڵام', sentiment: 'neutral', weight: 0.0, category: 'communication' },
  { word: 'ئەنجام', sentiment: 'neutral', weight: 0.0, category: 'abstract' },
  { word: 'بابەت', sentiment: 'neutral', weight: 0.0, category: 'abstract' },
  { word: 'ڕاپۆرت', sentiment: 'neutral', weight: 0.0, category: 'communication' },
  { word: 'هەواڵ', sentiment: 'neutral', weight: 0.0, category: 'communication' },
  { word: 'دەنگ', sentiment: 'neutral', weight: 0.0, category: 'object' },
  { word: 'ناو', sentiment: 'neutral', weight: 0.0, category: 'object' },
  { word: 'تەمەن', sentiment: 'neutral', weight: 0.0, category: 'time' },
  { word: 'پێشکەش', sentiment: 'neutral', weight: 0.0, category: 'activity' },
  { word: 'ئامار', sentiment: 'neutral', weight: 0.0, category: 'cognitive' },
  { word: 'گفتوگۆ', sentiment: 'neutral', weight: 0.0, category: 'communication' },
  { word: 'ڕاستی', sentiment: 'neutral', weight: 0.0, category: 'abstract' },
  { word: 'ئایندە', sentiment: 'neutral', weight: 0.0, category: 'time' },
  { word: 'حکومەت', sentiment: 'neutral', weight: 0.0, category: 'politics' },
  { word: 'پارلەمان', sentiment: 'neutral', weight: 0.0, category: 'politics' },
  { word: 'ئابوور', sentiment: 'neutral', weight: 0.0, category: 'economics' },
  { word: 'خوێندن', sentiment: 'neutral', weight: 0.0, category: 'activity' },
  { word: 'فێربوون', sentiment: 'neutral', weight: 0.0, category: 'cognitive' },
  { word: 'سیاسەت', sentiment: 'neutral', weight: 0.0, category: 'politics' },
  { word: 'تەکنەلۆژیا', sentiment: 'neutral', weight: 0.0, category: 'technology' },
  { word: 'بەرنامە', sentiment: 'neutral', weight: 0.0, category: 'activity' },
  { word: 'کۆمەڵگا', sentiment: 'neutral', weight: 0.0, category: 'abstract' },
  { word: 'مێژوو', sentiment: 'neutral', weight: 0.0, category: 'abstract' },
  { word: 'جوگرافیا', sentiment: 'neutral', weight: 0.0, category: 'abstract' },
  { word: 'وەرزش', sentiment: 'neutral', weight: 0.0, category: 'activity' },
  { word: 'سەفەر', sentiment: 'neutral', weight: 0.0, category: 'activity' },
  { word: 'پیشەسازی', sentiment: 'neutral', weight: 0.0, category: 'economics' },
  { word: 'بازاڕ', sentiment: 'neutral', weight: 0.0, category: 'economics' },
  { word: 'نەتەوە', sentiment: 'neutral', weight: 0.0, category: 'politics' },
  { word: 'چالاکی', sentiment: 'neutral', weight: 0.0, category: 'activity' },
  { word: 'ڕۆژنامە', sentiment: 'neutral', weight: 0.0, category: 'communication' },
  { word: 'دەزگا', sentiment: 'neutral', weight: 0.0, category: 'abstract' },
]

/**
 * Emoji-to-sentiment mapping. Each entry maps an emoji to a signed score.
 * Positive emojis have positive scores; negative emojis have negative scores.
 */
const EMOJI_SENTIMENT: ReadonlyMap<string, number> = new Map<string, number>([
  // Positive emojis
  ['😊', 0.6],
  ['😄', 0.7],
  ['😁', 0.65],
  ['🥰', 0.8],
  ['❤️', 0.75],
  ['💕', 0.7],
  ['🌸', 0.5],
  ['🌹', 0.55],
  ['🙏', 0.6],
  ['👍', 0.5],
  ['🎉', 0.7],
  ['💪', 0.55],
  ['✨', 0.5],
  ['🥳', 0.75],
  ['😍', 0.75],
  ['💚', 0.65],
  ['🌺', 0.5],
  ['💐', 0.55],
  ['👏', 0.6],
  ['🤗', 0.65],
  // Negative emojis
  ['😢', -0.65],
  ['😭', -0.75],
  ['💔', -0.7],
  ['😞', -0.55],
  ['😤', -0.6],
  ['😡', -0.8],
  ['🤬', -0.8],
  ['😒', -0.45],
  ['😠', -0.7],
  ['🥺', -0.4],
  ['😰', -0.55],
  ['😱', -0.65],
  ['👎', -0.5],
  ['💀', -0.5],
  ['🖤', -0.3],
  // Neutral emojis
  ['🤔', 0.0],
  ['😐', 0.0],
  ['🙄', 0.0],
  ['🤷', 0.0],
  // Mixed emojis (slight positive lean — laughter is ambiguous)
  ['😂', 0.1],
  ['🤣', 0.1],
])

/** Negation particles that invert the polarity of the following word. */
const NEGATION_TOKENS: readonly string[] = ['نا', 'نە', 'هیچ', 'بێ', 'نەک', 'بەبێ', 'بەبێی']

/** Intensifier tokens and their multipliers. */
const INTENSIFIERS: ReadonlyMap<string, number> = new Map([
  ['زۆر', 1.5],
  ['تەواو', 1.6],
  ['گەلەک', 1.4],
  ['هیچ', 1.3],
  ['بەتایبەت', 1.3],
  ['بەشێوەیەکی', 1.2],
  ['ئەوەندە', 1.4],
  ['هێندە', 1.3],
  ['بەڕاستی', 1.3],
  ['بەتەواوی', 1.6],
  ['لەڕاستیدا', 1.3],
  ['ڕاستی', 1.2],
  ['بێگومان', 1.4],
  ['کەمێک', 0.7],
  ['نزیکەی', 0.8],
])

/** Emotion categories used by the analyzer. */
const EMOTION_CATEGORIES = [
  'joy',
  'sadness',
  'anger',
  'hope',
  'fear',
  'love',
  'pride',
  'nostalgia',
  'frustration',
  'gratitude',
] as const

/**
 * Representative corpus samples from the Hrazhan/sentiment dataset
 * (Hameed, Ahmadi & Daneshfar, 2023). A mix of gold (manually verified)
 * and silver (auto-labeled) annotations.
 */
const CORPUS_SAMPLES: readonly SentimentCorpusSample[] = [
  // ── Positive (10) ────────────────────────────────────────────────────────
  {
    text: 'بەختەوەرترینی ئەو مرۆڤانە ئەوەن کە بە هەموو بەشێکی خودا ڕازین',
    sentiment: 'positive',
    source: 'gold',
  },
  {
    text: 'جوانی ئەوەیە بە ناو خەڵک\u200Cدا بڕۆی بۆنی ئەخلاقت لێ\u200C بێت',
    sentiment: 'positive',
    source: 'gold',
  },
  {
    text: 'دڵت بۆ لێدان دروست\u200C کراوە و ڕوخسارت بۆ پێکەنین',
    sentiment: 'positive',
    source: 'gold',
  },
  {
    text: 'زۆر خۆشحاڵ ئەبین کاک سیا بەڵێ بە کوردی قسە ئەکرێت',
    sentiment: 'positive',
    source: 'gold',
  },
  {
    text: 'خوای گەورە سەرکەوتووت بکا',
    sentiment: 'positive',
    source: 'silver',
  },
  {
    text: 'زۆر سوپاس گوڵە چاگیان نوخشە بێت',
    sentiment: 'positive',
    source: 'silver',
  },
  {
    text: 'دەست خۆشتر نازڵی گەلەک سوپاس عزیزی',
    sentiment: 'positive',
    source: 'silver',
  },
  {
    text: 'سلاوی خودا لەتۆش بێت خودا خۆشیت بێنێتە ڕێگات',
    sentiment: 'positive',
    source: 'gold',
  },
  {
    text: 'پیرۆزە سۆزە خان سەرکەوتوو بیت',
    sentiment: 'positive',
    source: 'silver',
  },
  {
    text: 'زۆر جوانن دەستان خۆشبێت هەر بژی',
    sentiment: 'positive',
    source: 'silver',
  },

  // ── Negative (10) ────────────────────────────────────────────────────────
  {
    text: 'ناشرینترین کەس ئەو کەسەیە کە هەڵەکانت تۆمار دەکات',
    sentiment: 'negative',
    source: 'gold',
  },
  {
    text: 'لە ماڵەوە بێزارن و کە دەچیتە دەرەوە هەست بە ترس و قەلەقی دەکەی',
    sentiment: 'negative',
    source: 'gold',
  },
  {
    text: 'هێندە بۆ بەدەسهێنانی تۆ هەوڵی بێسودمان دا',
    sentiment: 'negative',
    source: 'gold',
  },
  {
    text: 'ئەگەر ببیتە پۆڵا، دونیا بدەی بە کۆڵا',
    sentiment: 'negative',
    source: 'silver',
  },
  {
    text: 'دایکم خەم بۆ من دەخوات لە ژیاندا',
    sentiment: 'negative',
    source: 'gold',
  },
  {
    text: 'من نەمگەرەک\u200Cوێ تا 28ساڵەیی ژن بخوازم',
    sentiment: 'negative',
    source: 'silver',
  },
  {
    text: 'ئاخ مناڵی سپۆیڵد و هیچ نەدیو چەن تێنەگەشتوو',
    sentiment: 'negative',
    source: 'silver',
  },
  {
    text: 'ئەونە وا پەرە بە حاشیە ئەدەن',
    sentiment: 'negative',
    source: 'silver',
  },
  {
    text: 'ئەگەر گوڵ نیت خۆت کەر مەکە',
    sentiment: 'negative',
    source: 'gold',
  },
  {
    text: 'یان بمینن یان بەس بارکەن',
    sentiment: 'negative',
    source: 'silver',
  },

  // ── Neutral (5) ──────────────────────────────────────────────────────────
  {
    text: 'قسەکانتان بکەن ڕەخنە و پێشنیارەکانتان بۆم گرنگن',
    sentiment: 'neutral',
    source: 'gold',
  },
  {
    text: 'هەموو کەسێک دەتوانێ وا لە دەوروبەری بکا',
    sentiment: 'neutral',
    source: 'silver',
  },
  {
    text: 'مەرج نییە هەرکەس بەئاراستەی تۆ ڕوانییی مەبەستی تۆبێت',
    sentiment: 'neutral',
    source: 'gold',
  },
  {
    text: 'ئەگەر تووشی کۆرۆنا بم دایکم دەڵێ خەتای تەلەفۆنەیە',
    sentiment: 'neutral',
    source: 'silver',
  },
  {
    text: 'عەشقی ڕاستەقینە وەک نوێژ وایە',
    sentiment: 'neutral',
    source: 'gold',
  },

  // ── Mixed (5) ────────────────────────────────────────────────────────────
  {
    text: 'ئەوەی زۆر پێدەکەنێ کێشەی زۆرە ئەوەی زۆر دەگرێ کەسایەتی پاک',
    sentiment: 'mixed',
    source: 'gold',
  },
  {
    text: 'هەتا ئەگەر نەتوانین پێکەوە بین لە کۆتاییدا من هێشتا ئاسوودەم',
    sentiment: 'mixed',
    source: 'gold',
  },
  {
    text: 'سادەیی هەرچەندە ئازاری زۆرە بەڵام لەزەتێکیشی هەیە',
    sentiment: 'mixed',
    source: 'gold',
  },
  {
    text: 'ئەو ڕۆژەی لە توییتێری کوردی شەڕ نەبینم جێژنی منە',
    sentiment: 'mixed',
    source: 'silver',
  },
  {
    text: 'یادى بە خێر بە مناڵى خەونەکانمان چەند گەورە بوون',
    sentiment: 'mixed',
    source: 'gold',
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Kurdish Sorani Unicode range check. Returns true when the string
 * contains at least one character in the Arabic script block used
 * by Kurdish Sorani (U+0600–U+06FF, U+FB50–U+FDFF, U+FE70–U+FEFF).
 */
function containsKurdishScript(text: string): boolean {
  return /[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)
}

/**
 * Tokenizer for Kurdish Sorani text.
 * Splits on whitespace and common punctuation, normalises ZWNJ characters,
 * and preserves multi-word lexicon entries (e.g. "زۆر باش", "بێ ئومێد").
 */
function tokenize(text: string): string[] {
  const cleaned = text
    // Normalise ZWNJ (U+200C) and ZWJ (U+200D) to regular space
    .replace(/[\u200C\u200D]/g, ' ')
    .replace(/[.،؛:؟!«»"'()[\]{}\-_/\\|@#$%^&*~`<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned.length === 0 ? [] : cleaned.split(' ')
}

/**
 * Kurdish Sorani suffixes ordered from longest to shortest for greedy
 * stripping. Each entry specifies the suffix string and a minimum root
 * length to avoid over-stemming short words.
 */
const KURDISH_SUFFIXES: readonly { suffix: string; minRoot: number }[] = [
  // Superlative + ezafe combinations
  { suffix: 'ترینی', minRoot: 2 },
  { suffix: 'ترین', minRoot: 2 },
  // Definite/plural suffixes
  { suffix: 'ەکان', minRoot: 2 },
  { suffix: 'ەکە', minRoot: 2 },
  // Person plural suffixes
  { suffix: 'مان', minRoot: 2 },
  { suffix: 'تان', minRoot: 2 },
  { suffix: 'یان', minRoot: 2 },
  // Compound verb endings
  { suffix: 'بێت', minRoot: 2 },
  { suffix: 'دەکا', minRoot: 2 },
  // Comparative
  { suffix: 'تر', minRoot: 2 },
  // Plural / verb
  { suffix: 'ان', minRoot: 2 },
  // Abstract noun suffix
  { suffix: 'یی', minRoot: 2 },
  // Person verb endings
  { suffix: 'ێت', minRoot: 2 },
  // Single-char person/ezafe suffixes
  { suffix: 'م', minRoot: 2 },
  { suffix: 'ت', minRoot: 2 },
  { suffix: 'ی', minRoot: 2 },
  { suffix: 'ن', minRoot: 2 },
  { suffix: 'ە', minRoot: 3 },
]

/**
 * Attempt to stem a Kurdish Sorani token by stripping common inflectional
 * suffixes. Returns an array of candidate stems (longest-stem-first),
 * always including the original token as the last fallback.
 */
function stemKurdish(token: string): string[] {
  const candidates: string[] = []

  for (const { suffix, minRoot } of KURDISH_SUFFIXES) {
    if (token.endsWith(suffix) && token.length - suffix.length >= minRoot) {
      candidates.push(token.slice(0, token.length - suffix.length))
    }
  }

  // Always include the original token as a fallback
  candidates.push(token)
  return candidates
}

/**
 * Clamp a number to the given range.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ─── KurdishSentimentAnalyzer ──────────────────────────────────────────────────

/**
 * Kurdish Sorani sentiment analyzer.
 *
 * Uses a curated lexicon of 200+ sentiment words, emoji analysis, contextual
 * negation and intensifier handling, and emotion detection to classify Kurdish
 * text into positive / negative / neutral / mixed sentiment categories.
 *
 * Based on data from Hrazhan/sentiment (Hameed, Ahmadi & Daneshfar, 2023).
 */
export class KurdishSentimentAnalyzer {
  private readonly config: KurdishSentimentConfig
  private readonly lexiconMap: ReadonlyMap<string, SentimentWord>
  private readonly cache: Map<string, SentimentResult> = new Map()
  private readonly cacheOrder: string[] = []
  private analyzedCount = 0
  private cacheHitCount = 0

  constructor(config: Partial<KurdishSentimentConfig> = {}) {
    this.config = { ...DEFAULT_SENTIMENT_CONFIG, ...config }
    this.lexiconMap = this.buildLexiconMap()
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Perform full sentiment analysis on a single Kurdish Sorani text.
   * @param text - Kurdish Sorani text to analyze.
   * @returns A {@link SentimentResult} with label, confidence, scores, and emotion.
   */
  analyzeSentiment(text: string): SentimentResult {
    if (!text || text.trim().length === 0) {
      return this.emptyResult('Empty input text.')
    }

    // Check cache
    const cached = this.cache.get(text)
    if (cached) {
      this.cacheHitCount++
      return cached
    }

    this.analyzedCount++

    // Tokenize
    const tokens = tokenize(text)
    if (tokens.length === 0) {
      return this.emptyResult('No meaningful tokens found after tokenization.')
    }

    // Score lexicon matches
    const { positiveScore, negativeScore, emotionCounts, matchedWords } = this.scoreLexicon(tokens)

    // Score emojis
    const emojiScore = this.config.enableEmojiAnalysis ? this.scoreEmojis(text) : 0

    // Aggregate raw scores
    const totalPositive = positiveScore + Math.max(0, emojiScore)
    const totalNegative = negativeScore + Math.min(0, emojiScore)

    // Determine scores and label
    const scores = this.computeScores(totalPositive, totalNegative, matchedWords)
    const label = this.classifyLabel(scores)
    const confidence = this.computeConfidence(scores, label)
    const dominantEmotion = this.pickDominantEmotion(emotionCounts)
    const isSubjective = this.determineSubjectivity(matchedWords, tokens.length)
    const explanation = this.buildExplanation(
      label,
      confidence,
      matchedWords,
      dominantEmotion,
      tokens.length,
      containsKurdishScript(text),
    )

    // Apply minimum confidence fallback to neutral
    const finalLabel = confidence < this.config.minConfidence ? 'neutral' : label

    const result: SentimentResult = {
      label: finalLabel,
      confidence,
      scores,
      dominantEmotion,
      isSubjective,
      explanation,
    }

    this.cacheResult(text, result)
    return result
  }

  /**
   * Look up the sentiment of a single Kurdish word in the lexicon.
   * @param word - Kurdish Sorani word.
   * @returns The matching {@link SentimentWord} or `undefined` if not found.
   */
  getWordSentiment(word: string): SentimentWord | undefined {
    return this.lexiconMap.get(word.trim())
  }

  /**
   * Analyze multiple texts in batch.
   * @param texts - Array of Kurdish Sorani texts.
   * @returns Array of {@link SentimentResult} in the same order.
   */
  analyzeBatch(texts: string[]): SentimentResult[] {
    return texts.map(t => this.analyzeSentiment(t))
  }

  /**
   * Retrieve representative corpus samples, optionally filtered by sentiment.
   * @param sentiment - Filter by this label, or return all if omitted.
   * @param count - Maximum number of samples to return.
   * @returns Matching corpus samples.
   */
  getCorpusSamples(sentiment?: SentimentLabel, count?: number): SentimentCorpusSample[] {
    const filtered = sentiment
      ? CORPUS_SAMPLES.filter(s => s.sentiment === sentiment)
      : [...CORPUS_SAMPLES]

    return count !== undefined ? filtered.slice(0, count) : filtered
  }

  /**
   * Get all positive words in the lexicon.
   * @returns Array of positive {@link SentimentWord} entries.
   */
  getPositiveWords(): SentimentWord[] {
    return SENTIMENT_LEXICON.filter(w => w.sentiment === 'positive')
  }

  /**
   * Get all negative words in the lexicon.
   * @returns Array of negative {@link SentimentWord} entries.
   */
  getNegativeWords(): SentimentWord[] {
    return SENTIMENT_LEXICON.filter(w => w.sentiment === 'negative')
  }

  /**
   * Get the total number of words in the sentiment lexicon.
   * @returns Lexicon size.
   */
  getLexiconSize(): number {
    return SENTIMENT_LEXICON.length
  }

  /**
   * Get runtime statistics for monitoring and diagnostics.
   * @returns Object with analyzed count, cache hits, lexicon size, and corpus size.
   */
  getStats(): {
    analyzed: number
    cacheHits: number
    lexiconSize: number
    corpusSize: number
  } {
    return {
      analyzed: this.analyzedCount,
      cacheHits: this.cacheHitCount,
      lexiconSize: SENTIMENT_LEXICON.length,
      corpusSize: CORPUS_SAMPLES.length,
    }
  }

  /**
   * Get the current analyzer configuration.
   * @returns A frozen copy of the active {@link KurdishSentimentConfig}.
   */
  getConfig(): KurdishSentimentConfig {
    return { ...this.config }
  }

  // ── Lexicon Scoring ────────────────────────────────────────────────────────

  /**
   * Walk through tokens, accumulate positive / negative scores, and tally
   * emotion category occurrences. Handles negation and intensifiers when
   * contextual analysis is enabled.
   */
  private scoreLexicon(tokens: string[]): {
    positiveScore: number
    negativeScore: number
    emotionCounts: Map<string, number>
    matchedWords: SentimentWord[]
  } {
    let positiveScore = 0
    let negativeScore = 0
    const emotionCounts = new Map<string, number>()
    const matchedWords: SentimentWord[] = []

    let negateNext = false
    let intensifierMultiplier = 1.0

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!

      // Check for negation particles
      if (this.config.enableContextualAnalysis && NEGATION_TOKENS.includes(token)) {
        negateNext = true
        continue
      }

      // Check for intensifiers
      if (this.config.enableContextualAnalysis && INTENSIFIERS.has(token)) {
        intensifierMultiplier = INTENSIFIERS.get(token)!
        continue
      }

      // Try multi-word lookup first (bigram with next token)
      const bigramMatch =
        i + 1 < tokens.length ? this.lexiconMap.get(`${token} ${tokens[i + 1]}`) : undefined

      let match = bigramMatch ?? this.lexiconMap.get(token)
      if (bigramMatch) {
        i++ // skip next token since it was consumed by the bigram
      }

      // If no exact match, try stemmed forms
      if (!match) {
        const stems = stemKurdish(token)
        for (const stem of stems) {
          match = this.lexiconMap.get(stem)
          if (match) break
        }
      }

      if (match) {
        let weight = match.weight * intensifierMultiplier

        if (negateNext) {
          weight = -weight
        }

        if (weight > 0) {
          positiveScore += weight
        } else {
          negativeScore += weight
        }

        // Determine effective sentiment after negation
        const effectiveSentiment: SentimentLabel =
          negateNext && match.sentiment !== 'neutral'
            ? match.sentiment === 'positive'
              ? 'negative'
              : 'positive'
            : match.sentiment

        matchedWords.push({
          word: match.word,
          sentiment: effectiveSentiment,
          weight,
          category: match.category,
        })

        const currentCount = emotionCounts.get(match.category) ?? 0
        emotionCounts.set(match.category, currentCount + Math.abs(weight))
      }

      // Reset context flags after processing a content token
      negateNext = false
      intensifierMultiplier = 1.0
    }

    return { positiveScore, negativeScore, emotionCounts, matchedWords }
  }

  // ── Emoji Scoring ──────────────────────────────────────────────────────────

  /**
   * Extract emojis from the text and sum their sentiment scores.
   * @param text - Raw input text.
   * @returns Aggregated emoji sentiment score.
   */
  private scoreEmojis(text: string): number {
    let score = 0
    for (const [emoji, value] of EMOJI_SENTIMENT) {
      let idx = text.indexOf(emoji)
      while (idx !== -1) {
        score += value
        idx = text.indexOf(emoji, idx + emoji.length)
      }
    }
    return score
  }

  // ── Score Computation ──────────────────────────────────────────────────────

  /**
   * Normalise raw positive / negative scores into the four-label score object.
   */
  private computeScores(
    positiveScore: number,
    negativeScore: number,
    matched: SentimentWord[],
  ): { positive: number; negative: number; neutral: number; mixed: number } {
    const absPos = Math.abs(positiveScore)
    const absNeg = Math.abs(negativeScore)
    const total = absPos + absNeg

    if (total === 0) {
      return { positive: 0, negative: 0, neutral: 1, mixed: 0 }
    }

    const posNorm = absPos / total
    const negNorm = absNeg / total

    // Mixed if both polarities are significantly present
    const hasBothPolarities =
      matched.some(w => w.sentiment === 'positive') && matched.some(w => w.sentiment === 'negative')
    const polarityBalance = Math.min(posNorm, negNorm) / Math.max(posNorm, negNorm)
    const mixedScore = hasBothPolarities ? polarityBalance * 0.8 : 0

    // Neutral component: inversely proportional to total signal strength
    const signalStrength = clamp(total / 3, 0, 1)
    const neutralScore = clamp(1 - signalStrength, 0, 0.5) * (1 - mixedScore)

    // Distribute remaining probability between positive and negative
    const remaining = 1 - mixedScore - neutralScore
    const positiveOut = remaining * posNorm
    const negativeOut = remaining * negNorm

    return {
      positive: Math.round(positiveOut * 1000) / 1000,
      negative: Math.round(negativeOut * 1000) / 1000,
      neutral: Math.round(neutralScore * 1000) / 1000,
      mixed: Math.round(mixedScore * 1000) / 1000,
    }
  }

  /**
   * Pick the label with the highest score.
   */
  private classifyLabel(scores: {
    positive: number
    negative: number
    neutral: number
    mixed: number
  }): SentimentLabel {
    const entries: [SentimentLabel, number][] = [
      ['positive', scores.positive],
      ['negative', scores.negative],
      ['neutral', scores.neutral],
      ['mixed', scores.mixed],
    ]
    entries.sort((a, b) => b[1] - a[1])
    return entries[0]![0]
  }

  /**
   * Confidence is the winning label's score relative to the runner-up.
   */
  private computeConfidence(
    scores: { positive: number; negative: number; neutral: number; mixed: number },
    label: SentimentLabel,
  ): number {
    const winnerScore = scores[label]
    const sorted = Object.values(scores).sort((a, b) => b - a)
    const runnerUp = sorted[1] ?? 0
    const gap = winnerScore - runnerUp
    return clamp(Math.round((winnerScore + gap * 0.5) * 1000) / 1000, 0, 1)
  }

  // ── Emotion Detection ──────────────────────────────────────────────────────

  /**
   * Pick the emotion category with the highest cumulative weight.
   * Only returns categories present in {@link EMOTION_CATEGORIES}.
   * Falls back to 'neutral' when no emotions are detected.
   */
  private pickDominantEmotion(emotionCounts: Map<string, number>): string {
    if (emotionCounts.size === 0) return 'neutral'

    let best = ''
    let bestScore = -Infinity
    for (const [emotion, score] of emotionCounts) {
      if (score > bestScore && (EMOTION_CATEGORIES as readonly string[]).includes(emotion)) {
        bestScore = score
        best = emotion
      }
    }
    return best || 'neutral'
  }

  // ── Subjectivity ───────────────────────────────────────────────────────────

  /**
   * Heuristic: text is subjective if sentiment words make up at least 15 %
   * of all tokens.
   */
  private determineSubjectivity(matchedWords: SentimentWord[], totalTokens: number): boolean {
    if (totalTokens === 0) return false
    const sentimentTokens = matchedWords.filter(w => w.sentiment !== 'neutral').length
    return sentimentTokens / totalTokens >= 0.15
  }

  // ── Explanation Builder ────────────────────────────────────────────────────

  /**
   * Build a human-readable explanation string for the analysis result.
   */
  private buildExplanation(
    label: SentimentLabel,
    confidence: number,
    matchedWords: SentimentWord[],
    dominantEmotion: string,
    tokenCount: number,
    hasKurdish: boolean,
  ): string {
    const parts: string[] = []

    if (!hasKurdish) {
      parts.push('Warning: no Kurdish script detected in input.')
    }

    parts.push(`Analyzed ${tokenCount} token(s); ${matchedWords.length} matched the lexicon.`)

    const posCount = matchedWords.filter(w => w.sentiment === 'positive').length
    const negCount = matchedWords.filter(w => w.sentiment === 'negative').length
    parts.push(`Polarity breakdown: ${posCount} positive, ${negCount} negative.`)

    parts.push(`Label: ${label} (confidence ${(confidence * 100).toFixed(1)}%).`)

    if (dominantEmotion !== 'neutral') {
      parts.push(`Dominant emotion: ${dominantEmotion}.`)
    }

    if (matchedWords.length > 0) {
      const topWords = matchedWords
        .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
        .slice(0, 3)
        .map(w => w.word)
        .join(', ')
      parts.push(`Key words: ${topWords}.`)
    }

    return parts.join(' ')
  }

  // ── Caching ────────────────────────────────────────────────────────────────

  /**
   * Store a result in the LRU cache, evicting the oldest entry if full.
   */
  private cacheResult(key: string, result: SentimentResult): void {
    if (this.cache.size >= this.config.maxCacheSize) {
      const oldest = this.cacheOrder.shift()
      if (oldest !== undefined) {
        this.cache.delete(oldest)
      }
    }
    this.cache.set(key, result)
    this.cacheOrder.push(key)
  }

  // ── Internal Helpers ───────────────────────────────────────────────────────

  /**
   * Build a map from word → SentimentWord for O(1) lookups.
   */
  private buildLexiconMap(): Map<string, SentimentWord> {
    const map = new Map<string, SentimentWord>()
    for (const entry of SENTIMENT_LEXICON) {
      map.set(entry.word, entry)
    }
    return map
  }

  /**
   * Return a neutral, zero-confidence result for degenerate inputs.
   */
  private emptyResult(explanation: string): SentimentResult {
    return {
      label: 'neutral',
      confidence: 0,
      scores: { positive: 0, negative: 0, neutral: 1, mixed: 0 },
      dominantEmotion: 'neutral',
      isSubjective: false,
      explanation,
    }
  }
}
