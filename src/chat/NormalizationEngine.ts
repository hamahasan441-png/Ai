/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Normalization Engine — Text & Data Normalization for Consistent Processing  ║
 * ║                                                                              ║
 * ║  Capabilities:                                                               ║
 * ║    ✦ Text Normalization — Case folding, unicode, whitespace, punctuation     ║
 * ║    ✦ Token Normalization — Stemming-like and lemma-like word reduction       ║
 * ║    ✦ Synonym Resolution — Map equivalent terms to canonical forms            ║
 * ║    ✦ Abbreviation Expansion — Expand abbreviations to full forms             ║
 * ║    ✦ Custom Rules — User-defined regex/string normalization patterns         ║
 * ║    ✦ Pipeline Management — Chain normalization steps in configurable order   ║
 * ║    ✦ Code Normalization — Variable naming, import ordering, style patterns   ║
 * ║    ✦ Text Profiling — Analyze text characteristics and complexity            ║
 * ║    ✦ Fuzzy Matching — Edit-distance-based string similarity                  ║
 * ║    ✦ Batch Processing — Normalize multiple texts in one call                 ║
 * ║                                                                              ║
 * ║  No external dependencies. Fully offline.                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────

export interface NormalizationEngineConfig {
  caseFolding: boolean            // convert text to lowercase
  unicodeNormalization: 'NFC' | 'NFD' | 'NFKC' | 'NFKD' | 'none'
  trimWhitespace: boolean         // collapse runs of whitespace
  stripPunctuation: boolean       // remove punctuation marks
  expandAbbreviations: boolean    // auto-expand known abbreviations
  resolveSynonyms: boolean        // auto-resolve synonyms to canonical forms
  stripAccents: boolean           // remove diacritical marks
  maxRuleIterations: number       // prevent infinite rule loops
  preserveCase: string[]          // tokens whose case should be preserved (e.g. acronyms)
  locale: string                  // locale for locale-aware operations
}

export interface NormalizationRule {
  id: string
  name: string
  description: string
  pattern: string                 // regex pattern string
  replacement: string             // replacement template
  flags: string                   // regex flags (e.g. 'gi')
  priority: number                // execution order (lower = earlier)
  enabled: boolean
  category: string                // grouping label (e.g. 'whitespace', 'punctuation')
  createdAt: number
}

export interface NormalizationPipeline {
  id: string
  name: string
  description: string
  steps: PipelineStep[]
  createdAt: number
  lastUsed: number
  executionCount: number
}

export interface PipelineStep {
  type: 'caseFold' | 'unicode' | 'whitespace' | 'punctuation'
       | 'synonyms' | 'abbreviations' | 'customRule' | 'stripAccents'
       | 'tokens' | 'trim' | 'code'
  enabled: boolean
  params: Record<string, unknown>  // step-specific configuration
}

export interface NormalizedText {
  original: string
  normalized: string
  changes: NormalizationChange[]
  timestamp: number
}

export interface NormalizationChange {
  type: string                    // what kind of normalization was applied
  before: string                  // text segment before normalization
  after: string                   // text segment after normalization
  position: number                // character offset in original text
}

export interface NormalizationResult {
  text: NormalizedText
  rulesApplied: string[]          // IDs of rules that matched
  pipelineId?: string             // pipeline used, if any
  processingTimeMs: number
  synonymsResolved: number
  abbreviationsExpanded: number
}

export interface TokenNormalization {
  original: string
  normalized: string
  stem: string                    // reduced stem form
  isStopWord: boolean
  wasFolded: boolean              // case was changed
  wasStripped: boolean            // accents/diacritics removed
}

export interface SynonymMap {
  canonical: string               // the canonical form
  synonyms: string[]              // list of equivalent terms
  category: string                // grouping label
  bidirectional: boolean          // whether mapping works both ways
}

export interface TextProfile {
  characterCount: number
  wordCount: number
  sentenceCount: number
  avgWordLength: number
  avgSentenceLength: number
  vocabularyRichness: number      // unique words / total words
  uppercaseRatio: number          // fraction of uppercase chars
  punctuationRatio: number        // fraction of punctuation chars
  digitRatio: number              // fraction of digit chars
  whitespaceRatio: number         // fraction of whitespace chars
  languageHints: string[]         // detected language indicators
  complexityScore: number         // 0–1 readability-derived score
  dominantCase: 'lower' | 'upper' | 'mixed' | 'title'
  containsCode: boolean
  containsUrls: boolean
  containsEmails: boolean
}

export interface NormalizationStats {
  totalNormalizations: number
  totalTokensProcessed: number
  totalRules: number
  totalPipelines: number
  totalSynonymMaps: number
  totalAbbreviations: number
  avgProcessingTimeMs: number
  mostUsedRule: string | null
  mostUsedPipeline: string | null
  cacheHitRate: number
}

// ── Constants ────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: NormalizationEngineConfig = {
  caseFolding: true,
  unicodeNormalization: 'NFC',
  trimWhitespace: true,
  stripPunctuation: false,
  expandAbbreviations: true,
  resolveSynonyms: true,
  stripAccents: false,
  maxRuleIterations: 50,
  preserveCase: [],
  locale: 'en',
};

/** Common English stop words used during token analysis. */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'not', 'no', 'nor',
  'so', 'yet', 'both', 'each', 'few', 'more', 'most', 'some', 'such',
  'than', 'too', 'very', 'just', 'about', 'after', 'again', 'all', 'also',
  'am', 'any', 'because', 'before', 'between', 'down', 'during', 'he',
  'her', 'him', 'his', 'how', 'i', 'if', 'into', 'it', 'its', 'me',
  'my', 'now', 'off', 'only', 'our', 'out', 'over', 'own', 'she', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'under', 'up',
  'us', 'we', 'what', 'when', 'where', 'which', 'while', 'who', 'why',
  'you', 'your',
]);

/** Built-in abbreviations commonly used in English text. */
const BUILTIN_ABBREVIATIONS: Record<string, string> = {
  "can't": 'cannot', "won't": 'will not', "don't": 'do not',
  "doesn't": 'does not', "didn't": 'did not', "isn't": 'is not',
  "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not',
  "hasn't": 'has not', "haven't": 'have not', "hadn't": 'had not',
  "wouldn't": 'would not', "couldn't": 'could not', "shouldn't": 'should not',
  "i'm": 'i am', "you're": 'you are', "he's": 'he is',
  "she's": 'she is', "it's": 'it is', "we're": 'we are',
  "they're": 'they are', "i've": 'i have', "you've": 'you have',
  "we've": 'we have', "they've": 'they have',
  "i'll": 'i will', "you'll": 'you will', "he'll": 'he will',
  "she'll": 'she will', "we'll": 'we will', "they'll": 'they will',
  "i'd": 'i would', "you'd": 'you would', "let's": 'let us',
  'e.g.': 'for example', 'i.e.': 'that is', 'etc.': 'et cetera',
  'vs.': 'versus', 'mr.': 'mister', 'mrs.': 'missus',
  'dr.': 'doctor', 'prof.': 'professor', 'approx.': 'approximately',
  'dept': 'department', 'mgmt': 'management', 'env': 'environment',
  'config': 'configuration', 'auth': 'authentication', 'repo': 'repository',
  'impl': 'implementation', 'init': 'initialize', 'src': 'source',
  'msg': 'message', 'err': 'error', 'req': 'request', 'res': 'response',
  'btn': 'button', 'nav': 'navigation', 'prev': 'previous',
  'info': 'information', 'govt.': 'government', 'dept.': 'department',
};

/**
 * Common suffix-stripping rules for lightweight English stemming.
 * Each entry is [suffix, minStemLength, replacement].
 */
const SUFFIX_RULES: Array<[string, number, string]> = [
  ['ational', 4, 'ate'], ['tional', 4, 'tion'], ['enci', 3, 'ence'],
  ['anci', 3, 'ance'], ['izer', 3, 'ize'], ['alli', 3, 'al'],
  ['ization', 3, 'ize'], ['ation', 3, 'ate'], ['fulness', 3, 'ful'],
  ['ousness', 3, 'ous'], ['iveness', 3, 'ive'], ['ement', 3, ''],
  ['ment', 3, ''], ['ness', 3, ''], ['ings', 3, ''], ['ing', 3, ''],
  ['ies', 2, 'y'], ['ied', 2, 'y'], ['able', 3, ''], ['ible', 3, ''],
  ['ful', 3, ''], ['less', 3, ''], ['ly', 3, ''],
  ['er', 3, ''], ['ed', 3, ''], ['es', 3, ''], ['s', 3, ''],
];

/**
 * Common diacritical-mark-to-ASCII mappings for accent stripping.
 */
const ACCENT_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
  'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
  'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
  'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
  'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
  'ñ': 'n', 'ç': 'c', 'ß': 'ss', 'ÿ': 'y', 'ý': 'y',
  'ð': 'd', 'þ': 'th', 'ø': 'o', 'æ': 'ae',
  'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
  'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
  'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
  'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
  'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
  'Ñ': 'N', 'Ç': 'C', 'Ý': 'Y', 'Ð': 'D', 'Þ': 'Th', 'Ø': 'O', 'Æ': 'AE',
};

const URL_PATTERN = /https?:\/\/[^\s<>)"']+/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const CODE_PATTERN = /[{}[\]();=<>].*[{}[\]();=<>]/;

// ── Helper Functions ─────────────────────────────────────────────────────

/** Generate a unique ID with an optional prefix. */
function generateId(prefix: string = 'norm'): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

/** Split text into whitespace-delimited tokens. */
function tokenizeText(text: string): string[] {
  return text
    .split(/\s+/)
    .filter(t => t.length > 0);
}

/** Strip diacritical marks from a string using the accent map. */
function stripAccentsFromString(text: string): string {
  let result = '';
  for (const ch of text) {
    result += ACCENT_MAP[ch] ?? ch;
  }
  return result;
}

/**
 * Compute the Levenshtein edit distance between two strings.
 * Uses the classic dynamic-programming approach with O(min(m,n)) space.
 */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure `a` is the shorter string for space efficiency
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  const m = a.length;
  const n = b.length;
  let prev = new Array<number>(m + 1);
  let curr = new Array<number>(m + 1);

  // Initialize first row
  for (let i = 0; i <= m; i++) prev[i] = i;

  for (let j = 1; j <= n; j++) {
    curr[0] = j;
    for (let i = 1; i <= m; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        prev[i] + 1,        // deletion
        curr[i - 1] + 1,    // insertion
        prev[i - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[m];
}

/**
 * Lightweight suffix-based stemmer.
 * Strips known English suffixes to produce a crude stem.
 */
function simpleStem(word: string): string {
  const lower = word.toLowerCase();
  if (lower.length <= 3) return lower;

  for (const [suffix, minLen, replacement] of SUFFIX_RULES) {
    if (lower.endsWith(suffix) && (lower.length - suffix.length) >= minLen) {
      return lower.slice(0, lower.length - suffix.length) + replacement;
    }
  }
  return lower;
}

/**
 * Count sentence boundaries using simple heuristics.
 * Looks for period/exclamation/question followed by whitespace or end-of-string.
 */
function countSentences(text: string): number {
  const matches = text.match(/[.!?]+(?:\s|$)/g);
  return matches ? matches.length : (text.trim().length > 0 ? 1 : 0);
}

/**
 * Detect language hints based on common character patterns and words.
 * Returns an array of ISO-like language hints (very approximate).
 */
function detectLanguageHints(text: string): string[] {
  const hints: string[] = [];
  const lower = text.toLowerCase();

  // English indicators
  if (/\b(the|is|are|was|have|this|that|with)\b/.test(lower)) hints.push('en');
  // Spanish indicators
  if (/\b(el|la|los|las|es|son|está|tiene|este|esta|con)\b/.test(lower)) hints.push('es');
  // French indicators
  if (/\b(le|la|les|est|sont|dans|avec|cette|pour|une)\b/.test(lower)) hints.push('fr');
  // German indicators
  if (/\b(der|die|das|ist|sind|mit|und|für|ein|eine)\b/.test(lower)) hints.push('de');
  // Portuguese indicators
  if (/\b(o|os|as|é|são|está|tem|este|esta|com)\b/.test(lower)) hints.push('pt');
  // Italian indicators
  if (/\b(il|lo|la|è|sono|con|per|questo|questa|una)\b/.test(lower)) hints.push('it');

  return hints.length > 0 ? hints : ['unknown'];
}

/**
 * Convert a camelCase or PascalCase identifier to snake_case.
 */
function toSnakeCase(identifier: string): string {
  return identifier
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Convert a snake_case or kebab-case identifier to camelCase.
 */
function toCamelCase(identifier: string): string {
  return identifier
    .replace(/[-_]+(.)/g, (_, ch: string) => ch.toUpperCase())
    .replace(/^[A-Z]/, ch => ch.toLowerCase());
}

// ── Internal Types ───────────────────────────────────────────────────────

interface NormalizationCacheEntry {
  input: string
  output: string
  timestamp: number
}

// ── NormalizationEngine Class ────────────────────────────────────────────

export class NormalizationEngine {
  private config: NormalizationEngineConfig;
  private rules: Map<string, NormalizationRule> = new Map();
  private pipelines: Map<string, NormalizationPipeline> = new Map();
  private synonymMaps: Map<string, SynonymMap> = new Map();
  private abbreviations: Map<string, string> = new Map();
  private cache: Map<string, NormalizationCacheEntry> = new Map();
  private ruleUsage: Map<string, number> = new Map();
  private pipelineUsage: Map<string, number> = new Map();
  private totalNormalizations: number = 0;
  private totalTokensProcessed: number = 0;
  private totalProcessingTimeMs: number = 0;

  constructor(config: Partial<NormalizationEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Seed built-in abbreviations
    for (const [abbr, full] of Object.entries(BUILTIN_ABBREVIATIONS)) {
      this.abbreviations.set(abbr.toLowerCase(), full);
    }
  }

  // ── Text Normalization ────────────────────────────────────────────────

  /**
   * Normalize a text string using the engine's current configuration.
   * Applies case folding, unicode normalization, whitespace collapsing,
   * punctuation stripping, accent removal, abbreviation expansion, and
   * synonym resolution — all according to the current config flags.
   */
  normalize(text: string): NormalizationResult {
    const start = performance.now();
    const changes: NormalizationChange[] = [];
    const rulesApplied: string[] = [];
    let synonymsResolved = 0;
    let abbreviationsExpanded = 0;
    let current = text;

    /** Record a change if current differs from the snapshot. */
    const track = (type: string, before: string): void => {
      if (current !== before) {
        changes.push({ type, before, after: current, position: 0 });
      }
    };

    // Step 1 — Unicode normalization
    if (this.config.unicodeNormalization !== 'none') {
      const snap = current;
      current = current.normalize(this.config.unicodeNormalization);
      track('unicode', snap);
    }

    // Step 2 — Accent stripping
    if (this.config.stripAccents) {
      const snap = current;
      current = stripAccentsFromString(current);
      track('stripAccents', snap);
    }

    // Step 3 — Whitespace normalization
    if (this.config.trimWhitespace) {
      const snap = current;
      current = current.replace(/\s+/g, ' ').trim();
      track('whitespace', snap);
    }

    // Step 4 — Abbreviation expansion
    if (this.config.expandAbbreviations) {
      const snap = current;
      const result = this.applyAbbreviationExpansion(current);
      current = result.expanded;
      abbreviationsExpanded = result.count;
      track('abbreviation', snap);
    }

    // Step 5 — Synonym resolution
    if (this.config.resolveSynonyms) {
      const snap = current;
      const result = this.applySynonymResolution(current);
      current = result.resolved;
      synonymsResolved = result.count;
      track('synonym', snap);
    }

    // Step 6 — Punctuation stripping
    if (this.config.stripPunctuation) {
      const snap = current;
      current = current.replace(/[^\w\s]|_/g, '');
      track('punctuation', snap);
    }

    // Step 7 — Case folding (applied last so synonym/abbreviation matches are case-insensitive)
    if (this.config.caseFolding) {
      const snap = current;
      current = this.applyCaseFolding(current);
      track('caseFold', snap);
    }

    // Step 8 — Apply custom rules sorted by priority
    const sortedRules = Array.from(this.rules.values())
      .filter(r => r.enabled)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      const snap = current;
      try {
        const regex = new RegExp(rule.pattern, rule.flags);
        current = current.replace(regex, rule.replacement);
      } catch {
        continue;
      }
      if (current !== snap) {
        rulesApplied.push(rule.id);
        this.ruleUsage.set(rule.id, (this.ruleUsage.get(rule.id) ?? 0) + 1);
        changes.push({ type: `rule:${rule.id}`, before: snap, after: current, position: 0 });
      }
    }

    const elapsed = performance.now() - start;
    this.totalNormalizations++;
    this.totalProcessingTimeMs += elapsed;
    this.cache.set(text, { input: text, output: current, timestamp: Date.now() });

    return {
      text: { original: text, normalized: current, changes, timestamp: Date.now() },
      rulesApplied,
      processingTimeMs: elapsed,
      synonymsResolved,
      abbreviationsExpanded,
    };
  }

  // ── Token Normalization ───────────────────────────────────────────────

  /**
   * Normalize individual tokens from a text.
   * Applies case folding, accent stripping, and lightweight stemming
   * to each token. Returns detailed per-token metadata.
   */
  normalizeTokens(text: string): TokenNormalization[] {
    const tokens = tokenizeText(text);
    const results: TokenNormalization[] = [];

    for (const token of tokens) {
      let normalized = token;
      let wasFolded = false;
      let wasStripped = false;

      // Case fold
      if (this.config.caseFolding && !this.config.preserveCase.includes(token)) {
        const folded = normalized.toLowerCase();
        if (folded !== normalized) wasFolded = true;
        normalized = folded;
      }

      // Strip accents
      if (this.config.stripAccents) {
        const stripped = stripAccentsFromString(normalized);
        if (stripped !== normalized) wasStripped = true;
        normalized = stripped;
      }

      // Compute stem
      const stem = simpleStem(normalized);

      results.push({
        original: token,
        normalized,
        stem,
        isStopWord: STOP_WORDS.has(normalized.toLowerCase()),
        wasFolded,
        wasStripped,
      });
    }

    this.totalTokensProcessed += results.length;
    return results;
  }

  // ── Synonym Resolution ────────────────────────────────────────────────

  /**
   * Register a synonym mapping.  All synonyms in the list will resolve to
   * the given canonical form during normalization.
   */
  addSynonyms(
    canonical: string,
    synonyms: string[],
    category: string = 'general',
    bidirectional: boolean = false,
  ): void {
    const id = canonical.toLowerCase();
    const existing = this.synonymMaps.get(id);

    if (existing) {
      // Merge new synonyms into existing map
      const combined = new Set([...existing.synonyms, ...synonyms]);
      existing.synonyms = Array.from(combined);
      existing.bidirectional = existing.bidirectional || bidirectional;
    } else {
      this.synonymMaps.set(id, {
        canonical,
        synonyms: [...synonyms],
        category,
        bidirectional,
      });
    }

    // For bidirectional mappings, also register each synonym as a canonical
    if (bidirectional) {
      for (const syn of synonyms) {
        const synId = syn.toLowerCase();
        if (!this.synonymMaps.has(synId)) {
          this.synonymMaps.set(synId, {
            canonical: syn,
            synonyms: [canonical],
            category,
            bidirectional: true,
          });
        }
      }
    }
  }

  /**
   * Resolve synonyms in the given text, replacing recognized synonyms
   * with their canonical forms.
   */
  resolveSynonyms(text: string): NormalizedText {
    const result = this.applySynonymResolution(text);
    return { original: text, normalized: result.resolved, changes: result.changes, timestamp: Date.now() };
  }

  /** List all registered synonym maps. */
  getSynonyms(): SynonymMap[] {
    return Array.from(this.synonymMaps.values());
  }

  /** Remove a synonym mapping by its canonical key. */
  removeSynonyms(canonical: string): boolean {
    return this.synonymMaps.delete(canonical.toLowerCase());
  }

  // ── Abbreviation Expansion ────────────────────────────────────────────

  /**
   * Register a custom abbreviation and its expansion.
   * Built-in abbreviations are always available; custom ones take priority.
   */
  addAbbreviation(abbreviation: string, expansion: string): void {
    this.abbreviations.set(abbreviation.toLowerCase(), expansion);
  }

  /** Remove a custom abbreviation. */
  removeAbbreviation(abbreviation: string): boolean {
    return this.abbreviations.delete(abbreviation.toLowerCase());
  }

  /** Expand all known abbreviations in the given text. */
  expandAbbreviations(text: string): NormalizedText {
    const result = this.applyAbbreviationExpansion(text);
    return { original: text, normalized: result.expanded, changes: result.changes, timestamp: Date.now() };
  }

  /** List all registered abbreviations as [abbreviation, expansion] pairs. */
  getAbbreviations(): Array<[string, string]> {
    return Array.from(this.abbreviations.entries());
  }

  // ── Custom Rules ──────────────────────────────────────────────────────

  /** Add a custom regex-based normalization rule. */
  addRule(
    name: string, pattern: string, replacement: string,
    options: { flags?: string; priority?: number; description?: string; category?: string; enabled?: boolean } = {},
  ): NormalizationRule {
    const rule: NormalizationRule = {
      id: generateId('rule'),
      name,
      description: options.description ?? '',
      pattern,
      replacement,
      flags: options.flags ?? 'gi',
      priority: options.priority ?? 100,
      enabled: options.enabled ?? true,
      category: options.category ?? 'custom',
      createdAt: Date.now(),
    };

    this.rules.set(rule.id, rule);
    return rule;
  }

  /** Remove a rule by its ID. Returns true if the rule existed. */
  removeRule(ruleId: string): boolean {
    this.ruleUsage.delete(ruleId);
    return this.rules.delete(ruleId);
  }

  /** Retrieve all registered rules, optionally filtered by category. */
  getRules(category?: string): NormalizationRule[] {
    const all = Array.from(this.rules.values());
    if (category) {
      return all.filter(r => r.category === category);
    }
    return all;
  }

  /** Get a single rule by ID. */
  getRule(ruleId: string): NormalizationRule | undefined {
    return this.rules.get(ruleId);
  }

  /** Enable or disable a rule. */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;
    rule.enabled = enabled;
    return true;
  }

  // ── Pipeline Management ───────────────────────────────────────────────

  /**
   * Create a named normalization pipeline — an ordered sequence of steps
   * that can be executed as a unit.  Pipelines allow repeatable, auditable
   * normalization workflows.
   */
  createPipeline(
    name: string,
    steps: PipelineStep[],
    description: string = '',
  ): NormalizationPipeline {
    const pipeline: NormalizationPipeline = {
      id: generateId('pipe'),
      name,
      description,
      steps: steps.map(s => ({ ...s })),
      createdAt: Date.now(),
      lastUsed: 0,
      executionCount: 0,
    };

    this.pipelines.set(pipeline.id, pipeline);
    return pipeline;
  }

  /**
   * Execute a previously created pipeline against the given text.
   * Each step is applied in sequence; disabled steps are skipped.
   */
  executePipeline(pipelineId: string, text: string): NormalizationResult {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      return {
        text: { original: text, normalized: text, changes: [], timestamp: Date.now() },
        rulesApplied: [],
        pipelineId,
        processingTimeMs: 0,
        synonymsResolved: 0,
        abbreviationsExpanded: 0,
      };
    }

    const start = performance.now();
    const changes: NormalizationChange[] = [];
    const rulesApplied: string[] = [];
    let current = text;
    let synonymsResolved = 0;
    let abbreviationsExpanded = 0;

    for (const step of pipeline.steps) {
      if (!step.enabled) continue;

      const before = current;

      switch (step.type) {
        case 'caseFold':   current = this.applyCaseFolding(current); break;
        case 'unicode': {
          const form = (step.params['form'] as string) ?? this.config.unicodeNormalization;
          if (form !== 'none') current = current.normalize(form as 'NFC' | 'NFD' | 'NFKC' | 'NFKD');
          break;
        }
        case 'whitespace':    current = current.replace(/\s+/g, ' ').trim(); break;
        case 'punctuation':   current = current.replace(/[^\w\s]|_/g, ''); break;
        case 'stripAccents':  current = stripAccentsFromString(current); break;
        case 'trim':          current = current.trim(); break;
        case 'synonyms': {
          const r = this.applySynonymResolution(current);
          current = r.resolved; synonymsResolved += r.count; break;
        }
        case 'abbreviations': {
          const r = this.applyAbbreviationExpansion(current);
          current = r.expanded; abbreviationsExpanded += r.count; break;
        }
        case 'customRule': {
          const ruleId = step.params['ruleId'] as string | undefined;
          if (ruleId) {
            const rule = this.rules.get(ruleId);
            if (rule?.enabled) {
              try {
                current = current.replace(new RegExp(rule.pattern, rule.flags), rule.replacement);
                if (current !== before) rulesApplied.push(rule.id);
              } catch { /* skip invalid regex */ }
            }
          }
          break;
        }
        case 'tokens': {
          current = this.normalizeTokens(current).map(t => t.normalized).join(' ');
          break;
        }
        case 'code':
          current = this.applyCodeNormalization(
            current, (step.params['convention'] as string) ?? 'camelCase',
          );
          break;
      }

      if (current !== before) {
        changes.push({ type: step.type, before, after: current, position: 0 });
      }
    }

    const elapsed = performance.now() - start;
    pipeline.lastUsed = Date.now();
    pipeline.executionCount++;
    this.pipelineUsage.set(pipelineId, (this.pipelineUsage.get(pipelineId) ?? 0) + 1);
    this.totalNormalizations++;
    this.totalProcessingTimeMs += elapsed;

    return {
      text: { original: text, normalized: current, changes, timestamp: Date.now() },
      rulesApplied,
      pipelineId,
      processingTimeMs: elapsed,
      synonymsResolved,
      abbreviationsExpanded,
    };
  }

  /** Get a pipeline by its ID. */
  getPipeline(pipelineId: string): NormalizationPipeline | undefined {
    return this.pipelines.get(pipelineId);
  }

  /** List all registered pipelines. */
  getPipelines(): NormalizationPipeline[] {
    return Array.from(this.pipelines.values());
  }

  /** Remove a pipeline by ID. */
  removePipeline(pipelineId: string): boolean {
    this.pipelineUsage.delete(pipelineId);
    return this.pipelines.delete(pipelineId);
  }

  // ── Code Normalization ────────────────────────────────────────────────

  /**
   * Normalize code-specific patterns.  Converts identifier naming
   * conventions (camelCase ↔ snake_case), normalizes import ordering
   * indicators, and collapses redundant whitespace lines.
   *
   * @param code     The source code string.
   * @param convention Target naming convention: 'camelCase' | 'snake_case'.
   * @returns NormalizedText with change tracking.
   */
  normalizeCode(code: string, convention: 'camelCase' | 'snake_case' = 'camelCase'): NormalizedText {
    const changes: NormalizationChange[] = [];
    let current = code;

    const step = (type: string, fn: (s: string) => string): void => {
      const before = current;
      current = fn(current);
      if (current !== before) {
        changes.push({ type, before, after: current, position: 0 });
      }
    };

    step('lineEndings', s => s.replace(/\r\n/g, '\n').replace(/\r/g, '\n'));
    step('blankLines', s => s.replace(/\n{3,}/g, '\n\n'));
    step('trailingWhitespace', s => s.replace(/[ \t]+$/gm, ''));
    step(`convention:${convention}`, s => this.applyCodeNormalization(s, convention));
    step('importSort', s => this.sortImportLines(s));

    return { original: code, normalized: current, changes, timestamp: Date.now() };
  }

  // ── Text Profiling ────────────────────────────────────────────────────

  /**
   * Analyze a text and return a rich profile describing its characteristics.
   * Useful for adaptive normalization or content classification.
   */
  profileText(text: string): TextProfile {
    const chars = text.length;
    const words = tokenizeText(text);
    const wordCount = words.length;
    const sentences = countSentences(text);
    const r3 = (v: number) => Math.round(v * 1000) / 1000;
    const ratio = (n: number) => chars > 0 ? r3(n / chars) : 0;

    // Character-class counts
    let upper = 0, punct = 0, digits = 0, ws = 0;
    for (const ch of text) {
      if (/[A-Z]/.test(ch)) upper++;
      else if (/[^\w\s]/.test(ch)) punct++;
      else if (/\d/.test(ch)) digits++;
      else if (/\s/.test(ch)) ws++;
    }

    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const vocabularyRichness = wordCount > 0 ? uniqueWords.size / wordCount : 0;
    const totalWordChars = words.reduce((sum, w) => sum + w.length, 0);
    const avgWordLength = wordCount > 0 ? totalWordChars / wordCount : 0;
    const avgSentenceLength = sentences > 0 ? wordCount / sentences : 0;

    // Dominant case detection
    const lowerCount = text.replace(/[^a-z]/g, '').length;
    const alphaCount = upper + lowerCount;
    let dominantCase: TextProfile['dominantCase'] = 'mixed';
    if (alphaCount > 0) {
      const ur = upper / alphaCount;
      if (ur > 0.8) dominantCase = 'upper';
      else if (ur < 0.1) dominantCase = 'lower';
      else if (words.filter(w => /^[A-Z][a-z]/.test(w)).length > wordCount * 0.6) {
        dominantCase = 'title';
      }
    }

    // Complexity: 0 (simple) to 1 (complex), loosely inspired by Flesch-Kincaid
    const rawComplexity = (avgWordLength / 12) * 0.4
      + (avgSentenceLength / 40) * 0.3
      + (1 - vocabularyRichness) * 0.3;

    // Feature detection (reset global regex lastIndex after each test)
    const containsUrls = URL_PATTERN.test(text);   URL_PATTERN.lastIndex = 0;
    const containsEmails = EMAIL_PATTERN.test(text); EMAIL_PATTERN.lastIndex = 0;

    return {
      characterCount: chars, wordCount, sentenceCount: sentences,
      avgWordLength: Math.round(avgWordLength * 100) / 100,
      avgSentenceLength: Math.round(avgSentenceLength * 100) / 100,
      vocabularyRichness: r3(vocabularyRichness),
      uppercaseRatio: ratio(upper), punctuationRatio: ratio(punct),
      digitRatio: ratio(digits), whitespaceRatio: ratio(ws),
      languageHints: detectLanguageHints(text),
      complexityScore: r3(Math.max(0, Math.min(1, rawComplexity))),
      dominantCase, containsCode: CODE_PATTERN.test(text),
      containsUrls, containsEmails,
    };
  }

  // ── Fuzzy Matching ────────────────────────────────────────────────────

  /**
   * Find the best fuzzy match for a query among a list of candidates.
   * Returns candidates sorted by ascending edit distance.
   *
   * @param query       The search string.
   * @param candidates  Strings to compare against.
   * @param maxDistance  Maximum edit distance to include (default: Infinity).
   * @returns Sorted array of { candidate, distance, similarity } objects.
   */
  fuzzyMatch(
    query: string,
    candidates: string[],
    maxDistance: number = Infinity,
  ): Array<{ candidate: string; distance: number; similarity: number }> {
    const queryLower = this.config.caseFolding ? query.toLowerCase() : query;
    const results: Array<{ candidate: string; distance: number; similarity: number }> = [];

    for (const candidate of candidates) {
      const candidateLower = this.config.caseFolding
        ? candidate.toLowerCase()
        : candidate;

      const distance = levenshteinDistance(queryLower, candidateLower);

      if (distance <= maxDistance) {
        const maxLen = Math.max(queryLower.length, candidateLower.length);
        const similarity = maxLen > 0 ? 1 - distance / maxLen : 1;
        results.push({
          candidate,
          distance,
          similarity: Math.round(similarity * 1000) / 1000,
        });
      }
    }

    // Sort by distance ascending, then by candidate name alphabetically
    results.sort((a, b) => a.distance - b.distance || a.candidate.localeCompare(b.candidate));
    return results;
  }

  // ── Batch Processing ──────────────────────────────────────────────────

  /** Normalize multiple texts in one call. Uses a pipeline if specified. */
  normalizeBatch(texts: string[], pipelineId?: string): NormalizationResult[] {
    return texts.map(text =>
      pipelineId && this.pipelines.has(pipelineId)
        ? this.executePipeline(pipelineId, text)
        : this.normalize(text),
    );
  }

  // ── Cache ─────────────────────────────────────────────────────────────

  /**
   * Look up a cached normalization result.
   * Returns the cached output string if available, or undefined.
   */
  getCached(input: string): string | undefined {
    return this.cache.get(input)?.output;
  }

  /** Clear the normalization cache. */
  clearCache(): void {
    this.cache.clear();
  }

  /** Return the current number of cached entries. */
  getCacheSize(): number {
    return this.cache.size;
  }

  // ── Statistics ────────────────────────────────────────────────────────

  /** Return aggregate statistics about engine usage. */
  getStats(): NormalizationStats {
    // Determine most-used rule
    let mostUsedRule: string | null = null;
    let maxRuleUse = 0;
    for (const [ruleId, count] of this.ruleUsage) {
      if (count > maxRuleUse) {
        maxRuleUse = count;
        mostUsedRule = ruleId;
      }
    }

    // Determine most-used pipeline
    let mostUsedPipeline: string | null = null;
    let maxPipelineUse = 0;
    for (const [pipeId, count] of this.pipelineUsage) {
      if (count > maxPipelineUse) {
        maxPipelineUse = count;
        mostUsedPipeline = pipeId;
      }
    }

    return {
      totalNormalizations: this.totalNormalizations,
      totalTokensProcessed: this.totalTokensProcessed,
      totalRules: this.rules.size,
      totalPipelines: this.pipelines.size,
      totalSynonymMaps: this.synonymMaps.size,
      totalAbbreviations: this.abbreviations.size,
      avgProcessingTimeMs: this.totalNormalizations > 0
        ? Math.round((this.totalProcessingTimeMs / this.totalNormalizations) * 1000) / 1000
        : 0,
      mostUsedRule,
      mostUsedPipeline,
      cacheHitRate: this.totalNormalizations > 0
        ? Math.round((this.cache.size / this.totalNormalizations) * 1000) / 1000
        : 0,
    };
  }

  // ── Serialization ─────────────────────────────────────────────────────

  /** Serialize the entire engine state to a JSON string. */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      rules: Array.from(this.rules.values()),
      pipelines: Array.from(this.pipelines.values()),
      synonymMaps: Array.from(this.synonymMaps.entries()).map(([id, m]) => ({
        id,
        ...m,
      })),
      abbreviations: Array.from(this.abbreviations.entries()),
      ruleUsage: Array.from(this.ruleUsage.entries()),
      pipelineUsage: Array.from(this.pipelineUsage.entries()),
      totalNormalizations: this.totalNormalizations,
      totalTokensProcessed: this.totalTokensProcessed,
      totalProcessingTimeMs: this.totalProcessingTimeMs,
    });
  }

  /** Restore a NormalizationEngine from a previously serialized JSON string. */
  static deserialize(json: string): NormalizationEngine {
    const data = JSON.parse(json) as {
      config: NormalizationEngineConfig
      rules: NormalizationRule[]
      pipelines: NormalizationPipeline[]
      synonymMaps: Array<{ id: string; canonical: string; synonyms: string[]; category: string; bidirectional: boolean }>
      abbreviations: Array<[string, string]>
      ruleUsage: Array<[string, number]>
      pipelineUsage: Array<[string, number]>
      totalNormalizations: number
      totalTokensProcessed: number
      totalProcessingTimeMs: number
    };

    const engine = new NormalizationEngine(data.config);

    if (Array.isArray(data.rules)) {
      for (const rule of data.rules) engine.rules.set(rule.id, rule);
    }
    if (Array.isArray(data.pipelines)) {
      for (const p of data.pipelines) engine.pipelines.set(p.id, p);
    }
    if (Array.isArray(data.synonymMaps)) {
      for (const e of data.synonymMaps) {
        engine.synonymMaps.set(e.id, {
          canonical: e.canonical, synonyms: e.synonyms,
          category: e.category, bidirectional: e.bidirectional,
        });
      }
    }
    if (Array.isArray(data.abbreviations)) {
      for (const [abbr, expansion] of data.abbreviations) engine.abbreviations.set(abbr, expansion);
    }
    if (Array.isArray(data.ruleUsage)) {
      for (const [id, count] of data.ruleUsage) engine.ruleUsage.set(id, count);
    }
    if (Array.isArray(data.pipelineUsage)) {
      for (const [id, count] of data.pipelineUsage) engine.pipelineUsage.set(id, count);
    }
    if (typeof data.totalNormalizations === 'number') engine.totalNormalizations = data.totalNormalizations;
    if (typeof data.totalTokensProcessed === 'number') engine.totalTokensProcessed = data.totalTokensProcessed;
    if (typeof data.totalProcessingTimeMs === 'number') engine.totalProcessingTimeMs = data.totalProcessingTimeMs;

    return engine;
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  /**
   * Apply case folding while preserving tokens listed in config.preserveCase.
   * Words that match a preserved token are left unchanged.
   */
  private applyCaseFolding(text: string): string {
    if (this.config.preserveCase.length === 0) {
      return text.toLowerCase();
    }

    const preserveSet = new Set(this.config.preserveCase);
    const tokens = text.split(/(\s+)/);
    return tokens
      .map(token => preserveSet.has(token) ? token : token.toLowerCase())
      .join('');
  }

  /** Replace synonyms with canonical forms. */
  private applySynonymResolution(text: string): {
    resolved: string; count: number; changes: NormalizationChange[]
  } {
    const words = text.split(/(\s+)/);
    let count = 0;
    const changes: NormalizationChange[] = [];
    let pos = 0;

    const resolved = words.map(word => {
      const cp = pos; pos += word.length;
      if (/^\s+$/.test(word)) return word;
      const lower = word.toLowerCase();
      for (const synMap of this.synonymMaps.values()) {
        if (synMap.synonyms.some(s => s.toLowerCase() === lower)) {
          count++;
          changes.push({ type: 'synonym', before: word, after: synMap.canonical, position: cp });
          return synMap.canonical;
        }
      }
      return word;
    });

    return { resolved: resolved.join(''), count, changes };
  }

  /** Expand abbreviations to their full forms. */
  private applyAbbreviationExpansion(text: string): {
    expanded: string; count: number; changes: NormalizationChange[]
  } {
    const words = text.split(/(\s+)/);
    let count = 0;
    const changes: NormalizationChange[] = [];
    let pos = 0;

    const expanded = words.map(word => {
      const cp = pos; pos += word.length;
      if (/^\s+$/.test(word)) return word;
      const expansion = this.abbreviations.get(word.toLowerCase());
      if (expansion) {
        count++;
        changes.push({ type: 'abbreviation', before: word, after: expansion, position: cp });
        return expansion;
      }
      return word;
    });

    return { expanded: expanded.join(''), count, changes };
  }

  /** Apply naming convention normalization to code identifiers. */
  private applyCodeNormalization(code: string, convention: string): string {
    if (convention === 'snake_case') {
      return code.replace(/\b([a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*)\b/g, m => toSnakeCase(m));
    }
    if (convention === 'camelCase') {
      return code.replace(/\b([a-z][a-z0-9]*(?:_[a-z0-9]+)+)\b/g, m => toCamelCase(m));
    }
    return code;
  }

  /**
   * Sort import/require lines in a code block.
   * Groups: external first, then relative — alphabetically within each group.
   */
  private sortImportLines(code: string): string {
    const lines = code.split('\n');
    const isImport = (l: string) => /^\s*(import\s|const\s+\w+\s*=\s*require)/.test(l);

    // Find contiguous blocks of import lines
    const ranges: Array<{ start: number; end: number }> = [];
    let i = 0;
    while (i < lines.length) {
      if (isImport(lines[i])) {
        const start = i;
        while (i < lines.length && (isImport(lines[i]) || lines[i].trim() === '')) i++;
        let end = i;
        while (end > start && lines[end - 1].trim() === '') end--;
        if (end > start) ranges.push({ start, end });
      } else { i++; }
    }
    if (ranges.length === 0) return code;

    const result = [...lines];
    for (const { start, end } of ranges) {
      const block = result.slice(start, end).filter(l => l.trim() !== '');
      const ext: string[] = [], rel: string[] = [];
      for (const l of block) (/['"]\.\.?\//.test(l) ? rel : ext).push(l);
      ext.sort((a, b) => a.localeCompare(b));
      rel.sort((a, b) => a.localeCompare(b));

      const sorted = [...ext, ...(ext.length && rel.length ? [''] : []), ...rel];
      for (let j = 0; j < end - start; j++) {
        result[start + j] = j < sorted.length ? sorted[j] : '';
      }
    }
    return result.join('\n');
  }
}
