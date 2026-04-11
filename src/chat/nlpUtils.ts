/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  nlpUtils — Shared NLP Utilities                                            ║
 * ║                                                                            ║
 * ║  Common constants and functions shared across document analysis modules:   ║
 * ║    ✦ STOP_WORDS — Common English stop words to filter from analysis        ║
 * ║    ✦ POSITIVE_WORDS — Positive sentiment word list                         ║
 * ║    ✦ NEGATIVE_WORDS — Negative sentiment word list                         ║
 * ║    ✦ TECHNICAL_WORDS — Technical vocabulary word list                      ║
 * ║    ✦ splitSentences() — Split text into sentences                          ║
 * ║    ✦ tokenize() — Tokenize text into words                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Stop Words ────────────────────────────────────────────────────────────────

export const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'shall',
  'can',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'and',
  'but',
  'or',
  'nor',
  'not',
  'so',
  'yet',
  'both',
  'either',
  'neither',
  'each',
  'every',
  'all',
  'any',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'only',
  'own',
  'same',
  'than',
  'too',
  'very',
  'just',
  'because',
  'if',
  'when',
  'where',
  'how',
  'what',
  'which',
  'who',
  'whom',
  'this',
  'that',
  'these',
  'those',
  'i',
  'me',
  'my',
  'we',
  'our',
  'you',
  'your',
  'he',
  'him',
  'his',
  'she',
  'her',
  'it',
  'its',
  'they',
  'them',
  'their',
  'about',
  'also',
  'back',
  'been',
  'then',
  'there',
  'here',
  'now',
  'even',
  'well',
  'way',
  'many',
  'much',
  'such',
  'take',
  'like',
  'get',
  'make',
  'use',
])

// ─── Sentiment Words ───────────────────────────────────────────────────────────

export const POSITIVE_WORDS = new Set([
  'good',
  'great',
  'excellent',
  'best',
  'better',
  'improve',
  'success',
  'effective',
  'efficient',
  'powerful',
  'innovative',
  'positive',
  'benefit',
  'advantage',
  'optimal',
  'robust',
  'reliable',
  'seamless',
  'elegant',
  'brilliant',
  'outstanding',
  'remarkable',
  'impressive',
  'perfect',
])

export const NEGATIVE_WORDS = new Set([
  'bad',
  'worse',
  'worst',
  'fail',
  'failure',
  'error',
  'bug',
  'issue',
  'problem',
  'difficult',
  'complex',
  'slow',
  'broken',
  'deprecated',
  'vulnerable',
  'risk',
  'danger',
  'warning',
  'critical',
  'severe',
  'limitation',
  'drawback',
  'disadvantage',
  'concern',
  'threat',
])

// ─── Technical Vocabulary ──────────────────────────────────────────────────────

export const TECHNICAL_WORDS = new Set([
  'api',
  'function',
  'class',
  'method',
  'interface',
  'module',
  'package',
  'import',
  'export',
  'async',
  'await',
  'promise',
  'callback',
  'type',
  'variable',
  'const',
  'let',
  'var',
  'return',
  'parameter',
  'argument',
  'algorithm',
  'database',
  'server',
  'client',
  'request',
  'response',
  'endpoint',
  'middleware',
  'framework',
  'library',
  'runtime',
  'compiler',
  'deploy',
  'container',
  'kubernetes',
  'docker',
  'git',
  'repository',
])

// ─── Text Processing Functions ─────────────────────────────────────────────────

/**
 * Split text into individual sentences.
 * Uses lookbehind on sentence-ending punctuation followed by whitespace.
 */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5)
}

/**
 * Tokenize text into an array of words, filtering out empty tokens
 * and tokens that contain no alphanumeric characters.
 */
export function tokenize(text: string): string[] {
  return text.split(/[\s\n]+/).filter(w => w.length > 0 && /[a-zA-Z0-9]/.test(w))
}
