/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                             ║
 * ║          🧠  D E E P   U N D E R S T A N D I N G   E N G I N E             ║
 * ║                                                                             ║
 * ║   Phase 8 "Deep Understanding" intelligence module for LocalBrain:          ║
 * ║     extract → parse → classify → understand                                 ║
 * ║                                                                             ║
 * ║     • Semantic similarity via lightweight word embeddings                   ║
 * ║     • Multi-intent parsing for compound messages                            ║
 * ║     • Ambiguity detection with clarification generation                     ║
 * ║     • Enhanced entity extraction with relationship mapping                  ║
 * ║     • Context-aware classification using conversation history               ║
 * ║     • Full understanding pipeline orchestrating all components              ║
 * ║                                                                             ║
 * ║   No external dependencies. Fully self-contained.                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface DeepUnderstandingConfig {
  /** Maximum number of word vectors to store */
  maxVocabularySize: number;
  /** Dimensionality of word embedding vectors */
  embeddingDimension: number;
  /** Threshold above which ambiguity triggers clarification questions */
  ambiguityThreshold: number;
  /** Minimum confidence to accept an intent detection */
  intentConfidenceThreshold: number;
  /** Maximum conversation turns to consider for context */
  maxContextTurns: number;
  /** Enable semantic similarity computations */
  enableSimilarity: boolean;
  /** Enable ambiguity detection */
  enableAmbiguityDetection: boolean;
  /** Enable context-aware classification */
  enableContextClassification: boolean;
}

export interface DeepUnderstandingStats {
  totalUnderstandings: number;
  totalIntentsDetected: number;
  totalEntitiesExtracted: number;
  totalAmbiguitiesDetected: number;
  totalSimilarityQueries: number;
  avgUnderstandingTime: number;
  feedbackCount: number;
}

/** A single turn in a conversation. */
export interface ConversationTurn {
  role: string;
  content: string;
  timestamp: number;
}

/** A similarity match returned from findSimilarPhrases. */
export interface SimilarityMatch {
  text: string;
  score: number;
  index: number;
}

/** All intent types the engine can detect. */
export type IntentType =
  | 'code_write'
  | 'code_review'
  | 'explain'
  | 'search'
  | 'question'
  | 'greeting'
  | 'correction'
  | 'help'
  | 'plan'
  | 'analyze'
  | 'compare'
  | 'debug'
  | 'refactor';

/** A parsed intent from a user message. */
export interface ParsedIntent {
  type: IntentType;
  confidence: number;
  text: string;
  entities: ExtractedEntity[];
}

/** Result of ambiguity analysis. */
export interface AmbiguityResult {
  score: number;
  reasons: string[];
  clarificationQuestions: string[];
  resolvedReferences: ResolvedReference[];
}

/** A pronoun or reference resolved from conversation context. */
export interface ResolvedReference {
  pronoun: string;
  resolvedTo: string;
  confidence: number;
}

/** All entity types the engine can extract. */
export type EntityType =
  | 'language'
  | 'framework'
  | 'pattern'
  | 'concept'
  | 'constraint'
  | 'file_type'
  | 'data_structure'
  | 'algorithm'
  | 'library'
  | 'tool'
  | 'number'
  | 'comparison';

/** An extracted entity from a message. */
export interface ExtractedEntity {
  type: EntityType;
  value: string;
  confidence: number;
  position: number;
}

/** A relationship between two entities. */
export interface EntityRelation {
  source: string;
  relation: string;
  target: string;
}

/** Result of context-aware classification. */
export interface ContextualClassification {
  primaryIntent: IntentType;
  confidence: number;
  topicContinuity: number;
  isEscalation: boolean;
  referencedEntities: string[];
}

/** Comprehensive result from the understand() pipeline. */
export interface UnderstandingResult {
  intents: ParsedIntent[];
  entities: ExtractedEntity[];
  relations: EntityRelation[];
  ambiguity: AmbiguityResult;
  contextClassification: ContextualClassification | null;
  confidence: number;
  durationMs: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: DeepUnderstandingConfig = {
  maxVocabularySize: 1000,
  embeddingDimension: 50,
  ambiguityThreshold: 0.5,
  intentConfidenceThreshold: 0.3,
  maxContextTurns: 10,
  enableSimilarity: true,
  enableAmbiguityDetection: true,
  enableContextClassification: true,
};

// ── Helper Functions ─────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Deterministic hash for a string, used to seed word embedding vectors.
 * Returns a 32-bit integer.
 */
function hashString(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Simple seeded PRNG (xorshift32) for deterministic vector generation.
 */
function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return ((state >>> 0) / 0xffffffff);
  };
}

/**
 * Tokenize text into lowercase words, stripping punctuation.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_\-#+.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

// ── Synonym / Paraphrase Map ─────────────────────────────────────────────────

/**
 * Maps canonical phrases to arrays of synonymous phrases.
 * Used to normalize user intent expressions.
 */
const SYNONYM_MAP: Record<string, string[]> = {
  'write': ['create', 'make', 'build', 'implement', 'define', 'code', 'develop', 'compose', 'craft', 'generate', 'produce'],
  'function': ['method', 'procedure', 'routine', 'subroutine', 'handler', 'callback', 'func', 'fn'],
  'explain': ['describe', 'elaborate', 'clarify', 'tell me about', 'what is', 'how does', 'break down', 'walk through'],
  'fix': ['repair', 'resolve', 'patch', 'correct', 'mend', 'debug', 'troubleshoot', 'address'],
  'error': ['bug', 'issue', 'problem', 'defect', 'fault', 'failure', 'exception', 'crash'],
  'review': ['check', 'inspect', 'examine', 'audit', 'evaluate', 'assess', 'look at', 'go over'],
  'refactor': ['restructure', 'reorganize', 'clean up', 'improve', 'optimize', 'simplify', 'rewrite'],
  'test': ['verify', 'validate', 'check', 'assert', 'spec', 'unit test', 'integration test'],
  'search': ['find', 'look for', 'locate', 'seek', 'discover', 'query', 'lookup', 'grep'],
  'compare': ['contrast', 'diff', 'difference between', 'versus', 'vs', 'pros and cons'],
  'analyze': ['examine', 'investigate', 'study', 'evaluate', 'inspect', 'assess', 'profile'],
  'help': ['assist', 'support', 'guide', 'how to', 'how do i', 'what should i', 'can you'],
  'plan': ['design', 'architect', 'outline', 'strategy', 'roadmap', 'blueprint', 'approach'],
  'class': ['object', 'type', 'struct', 'record', 'model', 'entity'],
  'variable': ['var', 'let', 'const', 'field', 'property', 'attribute', 'member'],
  'api': ['endpoint', 'route', 'service', 'interface', 'rest', 'graphql'],
  'database': ['db', 'datastore', 'storage', 'repository', 'table', 'collection', 'schema'],
  'deploy': ['ship', 'release', 'publish', 'launch', 'push', 'rollout'],
  'authentication': ['auth', 'login', 'signin', 'sign in', 'credential', 'token', 'jwt', 'oauth'],
  'performance': ['speed', 'fast', 'slow', 'latency', 'throughput', 'benchmark', 'optimization'],
};

/**
 * Reverse-lookup map: synonym → canonical word.
 */
const REVERSE_SYNONYM_MAP: Map<string, string> = new Map();
for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
  for (const syn of synonyms) {
    REVERSE_SYNONYM_MAP.set(syn, canonical);
  }
}

// ── Seed Vocabulary ──────────────────────────────────────────────────────────

/**
 * Common programming/tech words for embedding vector generation.
 * These words form the core vocabulary of the lightweight embedding model.
 */
const SEED_VOCABULARY: string[] = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'go', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'haskell', 'elixir', 'lua',
  'perl', 'sql', 'html', 'css', 'bash', 'shell', 'powershell', 'r',
  // Frameworks & libraries
  'react', 'angular', 'vue', 'svelte', 'next', 'nuxt', 'express', 'fastify',
  'django', 'flask', 'spring', 'rails', 'laravel', 'dotnet', 'node', 'deno',
  'tensorflow', 'pytorch', 'pandas', 'numpy', 'jest', 'mocha', 'vitest',
  'webpack', 'vite', 'rollup', 'esbuild', 'tailwind', 'bootstrap', 'prisma',
  // Concepts
  'function', 'class', 'method', 'variable', 'constant', 'interface', 'type',
  'module', 'package', 'import', 'export', 'async', 'await', 'promise',
  'callback', 'closure', 'scope', 'hoisting', 'prototype', 'inheritance',
  'polymorphism', 'encapsulation', 'abstraction', 'composition', 'decorator',
  'iterator', 'generator', 'proxy', 'reflect', 'symbol', 'generic', 'enum',
  // Data structures
  'array', 'list', 'map', 'set', 'stack', 'queue', 'tree', 'graph', 'heap',
  'hashtable', 'linked', 'vector', 'matrix', 'tuple', 'dictionary', 'buffer',
  // Algorithms
  'sort', 'search', 'binary', 'linear', 'recursive', 'dynamic', 'greedy',
  'backtrack', 'traverse', 'bfs', 'dfs', 'dijkstra', 'merge', 'quick',
  'bubble', 'insertion', 'hash', 'encrypt', 'decrypt', 'compress', 'parse',
  // Patterns
  'singleton', 'factory', 'observer', 'strategy', 'adapter', 'facade',
  'middleware', 'mvc', 'mvvm', 'repository', 'service', 'controller',
  'component', 'hook', 'plugin', 'pipeline', 'event', 'listener', 'reducer',
  // Tools
  'git', 'docker', 'kubernetes', 'nginx', 'redis', 'postgres', 'mongodb',
  'mysql', 'sqlite', 'elasticsearch', 'kafka', 'rabbitmq', 'graphql',
  'rest', 'grpc', 'websocket', 'http', 'https', 'tcp', 'udp',
  // Operations
  'create', 'read', 'update', 'delete', 'write', 'build', 'compile',
  'deploy', 'test', 'debug', 'refactor', 'review', 'analyze', 'optimize',
  'configure', 'install', 'migrate', 'monitor', 'log', 'trace', 'profile',
  // Web
  'api', 'endpoint', 'route', 'request', 'response', 'header', 'body',
  'query', 'parameter', 'cookie', 'session', 'token', 'jwt', 'oauth',
  'cors', 'csrf', 'xss', 'ssl', 'tls', 'dns', 'cdn', 'cache',
  // DevOps & CI/CD
  'pipeline', 'workflow', 'action', 'job', 'step', 'artifact', 'container',
  'image', 'volume', 'network', 'secret', 'environment', 'staging',
  'production', 'development', 'testing', 'integration', 'continuous',
  // General programming
  'error', 'exception', 'throw', 'catch', 'try', 'finally', 'handle',
  'validate', 'sanitize', 'format', 'transform', 'convert', 'encode',
  'decode', 'serialize', 'deserialize', 'stringify', 'parse', 'render',
  'fetch', 'send', 'receive', 'connect', 'disconnect', 'listen', 'emit',
  'subscribe', 'publish', 'notify', 'dispatch', 'trigger', 'invoke',
  // Quality
  'clean', 'readable', 'maintainable', 'scalable', 'secure', 'robust',
  'efficient', 'modular', 'reusable', 'extensible', 'testable', 'documented',
  // Misc tech
  'authentication', 'authorization', 'permission', 'role', 'user', 'admin',
  'config', 'setting', 'option', 'flag', 'feature', 'toggle', 'version',
  'migration', 'schema', 'model', 'entity', 'relation', 'constraint',
  'index', 'primary', 'foreign', 'unique', 'nullable', 'default', 'required',
];

// ── Intent Patterns ──────────────────────────────────────────────────────────

interface IntentPattern {
  type: IntentType;
  patterns: RegExp[];
  keywords: string[];
  weight: number;
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    type: 'code_write',
    patterns: [
      /\b(?:write|create|make|build|implement|generate|code|develop|craft)\b.*\b(?:function|class|method|component|module|api|endpoint|script|program|app|service|handler)\b/i,
      /\b(?:write|create|make|build|implement|generate)\b.*\b(?:code|program|script|snippet)\b/i,
      /\bcan you (?:write|create|make|build|code)\b/i,
      /\b(?:write|create) (?:a|an|the|some)\b/i,
    ],
    keywords: ['write', 'create', 'build', 'implement', 'generate', 'make', 'code', 'develop'],
    weight: 1.0,
  },
  {
    type: 'code_review',
    patterns: [
      /\b(?:review|check|inspect|examine|audit|evaluate|assess|look at|go over)\b.*\b(?:code|function|class|file|module|implementation|pr|pull request)\b/i,
      /\bcode review\b/i,
      /\bwhat do you think (?:of|about)\b/i,
      /\bis this (?:code |implementation )?(?:good|correct|right|ok|proper)\b/i,
    ],
    keywords: ['review', 'check', 'inspect', 'examine', 'audit', 'evaluate', 'assess'],
    weight: 0.9,
  },
  {
    type: 'explain',
    patterns: [
      /\b(?:explain|describe|elaborate|clarify|tell me about|walk me through|break down)\b/i,
      /\bhow (?:does|do|is|are|can|could|would|will)\b/i,
      /\bwhat (?:is|are|does|do|happens)\b/i,
      /\bwhy (?:does|do|is|are|would|should|can)\b/i,
    ],
    keywords: ['explain', 'describe', 'elaborate', 'clarify', 'how', 'what', 'why'],
    weight: 0.85,
  },
  {
    type: 'search',
    patterns: [
      /\b(?:find|search|look for|locate|where is|grep|discover)\b/i,
      /\b(?:find|search) (?:for |the |a )?/i,
      /\bwhere (?:is|are|can i find|do i find)\b/i,
    ],
    keywords: ['find', 'search', 'locate', 'where', 'look for', 'grep'],
    weight: 0.85,
  },
  {
    type: 'question',
    patterns: [
      /^(?:is|are|can|could|would|should|do|does|did|has|have|will)\b/i,
      /\?$/,
    ],
    keywords: ['is', 'are', 'can', 'should', 'would'],
    weight: 0.6,
  },
  {
    type: 'greeting',
    patterns: [
      /^(?:hi|hello|hey|howdy|greetings|good (?:morning|afternoon|evening)|sup|yo)\b/i,
      /^(?:hi|hello|hey)\s*[!.]?\s*$/i,
    ],
    keywords: ['hi', 'hello', 'hey', 'howdy', 'greetings'],
    weight: 0.95,
  },
  {
    type: 'correction',
    patterns: [
      /\b(?:no|wrong|incorrect|that's not|actually|i meant|not what i)\b/i,
      /\b(?:fix that|change that|correct that|update that)\b/i,
      /\binstead\b.*\b(?:use|do|make|try)\b/i,
    ],
    keywords: ['no', 'wrong', 'incorrect', 'actually', 'instead', 'meant'],
    weight: 0.8,
  },
  {
    type: 'help',
    patterns: [
      /\b(?:help|assist|support|guide|how to|how do i|what should i|can you help)\b/i,
      /\bi (?:need|want) (?:help|assistance)\b/i,
      /\bi'm (?:stuck|confused|lost|unsure)\b/i,
    ],
    keywords: ['help', 'assist', 'guide', 'stuck', 'confused', 'how to'],
    weight: 0.75,
  },
  {
    type: 'plan',
    patterns: [
      /\b(?:plan|design|architect|outline|strategy|roadmap|approach|blueprint)\b/i,
      /\bhow (?:should|would|can) (?:i|we) (?:structure|design|architect|approach|plan)\b/i,
      /\b(?:best|recommended) (?:way|approach|strategy|practice)\b/i,
    ],
    keywords: ['plan', 'design', 'architect', 'outline', 'strategy', 'approach'],
    weight: 0.85,
  },
  {
    type: 'analyze',
    patterns: [
      /\b(?:analyze|investigate|study|evaluate|inspect|assess|profile|benchmark)\b/i,
      /\bwhat's (?:wrong|happening|going on)\b/i,
      /\b(?:performance|complexity|memory) (?:analysis|profile)\b/i,
    ],
    keywords: ['analyze', 'investigate', 'study', 'evaluate', 'profile', 'benchmark'],
    weight: 0.85,
  },
  {
    type: 'compare',
    patterns: [
      /\b(?:compare|contrast|diff|difference between|versus|vs|pros and cons)\b/i,
      /\bwhich (?:is|one is) (?:better|faster|simpler|preferred)\b/i,
      /\b(\w+)\s+(?:vs\.?|versus|or|compared to)\s+(\w+)\b/i,
    ],
    keywords: ['compare', 'contrast', 'versus', 'vs', 'difference', 'better'],
    weight: 0.9,
  },
  {
    type: 'debug',
    patterns: [
      /\b(?:debug|troubleshoot|diagnose|trace|why (?:is|does|doesn't|isn't))\b/i,
      /\b(?:not working|broken|fails|failing|crashed|crash|error|exception)\b/i,
      /\b(?:bug|issue|problem)\b.*\b(?:fix|solve|resolve|help)\b/i,
    ],
    keywords: ['debug', 'troubleshoot', 'diagnose', 'broken', 'error', 'bug', 'crash'],
    weight: 0.9,
  },
  {
    type: 'refactor',
    patterns: [
      /\b(?:refactor|restructure|reorganize|clean up|simplify|rewrite|improve)\b.*\b(?:code|function|class|module|component)\b/i,
      /\b(?:make|this) (?:code |it )?(?:cleaner|simpler|better|more readable|more efficient)\b/i,
      /\breduce (?:complexity|duplication|redundancy)\b/i,
    ],
    keywords: ['refactor', 'restructure', 'reorganize', 'simplify', 'rewrite', 'clean up'],
    weight: 0.85,
  },
];

/** Conjunctions that separate multiple intents in a compound message. */
const CONJUNCTION_PATTERNS: RegExp[] = [
  /\band\b/i,
  /\bthen\b/i,
  /\balso\b/i,
  /\bplus\b/i,
  /\bas well as\b/i,
  /\b(?:after that|additionally|furthermore|moreover)\b/i,
  /[,;]\s*(?:and |then |also )?/,
];

// ── Entity Dictionaries ──────────────────────────────────────────────────────

interface EntityDictionary {
  type: EntityType;
  values: string[];
  patterns?: RegExp[];
  /** Pre-compiled global variants of patterns, built at init time. */
  globalPatterns?: RegExp[];
}

const ENTITY_DICTIONARIES: EntityDictionary[] = [
  {
    type: 'language',
    values: [
      'javascript', 'typescript', 'python', 'java', 'csharp', 'c#', 'c++', 'cpp',
      'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala',
      'haskell', 'elixir', 'lua', 'perl', 'sql', 'html', 'css', 'sass',
      'less', 'bash', 'shell', 'powershell', 'r', 'matlab', 'dart', 'zig',
      'ocaml', 'clojure', 'erlang', 'fortran', 'cobol', 'assembly', 'wasm',
    ],
  },
  {
    type: 'framework',
    values: [
      'react', 'angular', 'vue', 'svelte', 'next', 'nextjs', 'nuxt', 'nuxtjs',
      'express', 'fastify', 'koa', 'hapi', 'nest', 'nestjs', 'django', 'flask',
      'fastapi', 'spring', 'springboot', 'rails', 'laravel', 'symfony', 'dotnet',
      'asp.net', 'node', 'nodejs', 'deno', 'bun', 'electron', 'tauri',
      'react native', 'flutter', 'ionic', 'expo', 'gatsby', 'remix',
      'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
    ],
  },
  {
    type: 'pattern',
    values: [
      'singleton', 'factory', 'observer', 'strategy', 'adapter', 'facade',
      'decorator', 'proxy', 'builder', 'prototype', 'command', 'mediator',
      'memento', 'state', 'template method', 'visitor', 'chain of responsibility',
      'middleware', 'mvc', 'mvvm', 'mvp', 'repository', 'cqrs', 'event sourcing',
      'saga', 'pub/sub', 'publish subscribe', 'dependency injection',
    ],
  },
  {
    type: 'data_structure',
    values: [
      'array', 'list', 'linked list', 'doubly linked list', 'map', 'hashmap',
      'set', 'hashset', 'stack', 'queue', 'priority queue', 'deque', 'tree',
      'binary tree', 'bst', 'avl tree', 'red-black tree', 'b-tree', 'trie',
      'graph', 'dag', 'heap', 'min heap', 'max heap', 'hashtable', 'vector',
      'matrix', 'tuple', 'dictionary', 'buffer', 'ring buffer', 'bloom filter',
    ],
  },
  {
    type: 'algorithm',
    values: [
      'binary search', 'linear search', 'bubble sort', 'insertion sort',
      'merge sort', 'quick sort', 'heap sort', 'radix sort', 'counting sort',
      'breadth first search', 'bfs', 'depth first search', 'dfs', 'dijkstra',
      'a star', 'a*', 'dynamic programming', 'greedy', 'backtracking',
      'divide and conquer', 'two pointer', 'sliding window', 'recursion',
      'memoization', 'topological sort', 'kruskal', 'prim', 'bellman ford',
    ],
  },
  {
    type: 'library',
    values: [
      'lodash', 'underscore', 'moment', 'dayjs', 'date-fns', 'axios', 'fetch',
      'socket.io', 'zod', 'joi', 'yup', 'ajv', 'rxjs', 'immer', 'zustand',
      'redux', 'mobx', 'pinia', 'jest', 'mocha', 'chai', 'vitest', 'cypress',
      'playwright', 'puppeteer', 'cheerio', 'webpack', 'vite', 'rollup',
      'esbuild', 'swc', 'babel', 'eslint', 'prettier', 'tailwind', 'bootstrap',
      'material ui', 'chakra ui', 'ant design', 'prisma', 'typeorm', 'sequelize',
      'mongoose', 'drizzle', 'knex', 'passport', 'bcrypt', 'jsonwebtoken',
    ],
  },
  {
    type: 'tool',
    values: [
      'git', 'github', 'gitlab', 'bitbucket', 'docker', 'kubernetes', 'k8s',
      'nginx', 'apache', 'redis', 'memcached', 'postgres', 'postgresql',
      'mongodb', 'mysql', 'sqlite', 'elasticsearch', 'kafka', 'rabbitmq',
      'aws', 'azure', 'gcp', 'vercel', 'netlify', 'heroku', 'digitalocean',
      'terraform', 'ansible', 'jenkins', 'circleci', 'github actions',
      'travis', 'vscode', 'vim', 'neovim', 'emacs', 'intellij', 'postman',
    ],
  },
  {
    type: 'file_type',
    values: [],
    patterns: [
      /\b\w+\.(?:ts|js|tsx|jsx|py|java|go|rs|rb|php|cpp|c|h|hpp|cs|swift|kt|scala|sql|html|css|scss|less|json|yaml|yml|toml|xml|md|txt|csv|env|sh|bash|dockerfile|makefile)\b/i,
      /\b(?:json|yaml|yml|toml|xml|csv|env|ini|cfg)\s*file\b/i,
    ],
  },
  {
    type: 'number',
    values: [],
    patterns: [
      /\b\d+(?:\.\d+)?(?:\s*(?:ms|seconds?|minutes?|hours?|days?|bytes?|kb|mb|gb|tb|px|em|rem|%))\b/i,
      /\b\d+(?:\.\d+)?\b/,
    ],
  },
  {
    type: 'comparison',
    values: [],
    patterns: [
      /\b(?:faster|slower|better|worse|simpler|complex|easier|harder|lighter|heavier|more|less|bigger|smaller)\s+(?:than)?\b/i,
      /\b(?:best|worst|fastest|slowest|simplest|most|least)\b/i,
    ],
  },
  {
    type: 'concept',
    values: [
      'api', 'rest', 'restful', 'graphql', 'grpc', 'websocket', 'http',
      'authentication', 'authorization', 'encryption', 'hashing', 'caching',
      'logging', 'monitoring', 'testing', 'ci/cd', 'devops', 'microservices',
      'monolith', 'serverless', 'cloud', 'containerization', 'virtualization',
      'concurrency', 'parallelism', 'multithreading', 'asynchronous', 'streaming',
      'pagination', 'rate limiting', 'load balancing', 'sharding', 'replication',
      'orm', 'migration', 'schema', 'normalization', 'denormalization',
      'solid', 'dry', 'kiss', 'yagni', 'clean code', 'clean architecture',
      'tdd', 'bdd', 'ddd', 'event driven', 'message queue', 'pub sub',
    ],
  },
  {
    type: 'constraint',
    values: [],
    patterns: [
      /\b(?:using|with|in|via|through|without|no)\s+([a-z][a-z0-9 ]*)/i,
      /\bfor\s+(?:production|development|testing|staging)\b/i,
      /\b(?:must|should|needs? to|has to|required to)\b/i,
      /\b(?:compatible with|supports?|works? with)\b/i,
    ],
  },
];

// Pre-compile global regex variants for entity dictionaries to avoid
// creating new RegExp objects on every extractEntities() call.
for (const dict of ENTITY_DICTIONARIES) {
  if (dict.patterns) {
    dict.globalPatterns = dict.patterns.map(p => {
      const flags = p.flags.includes('g') ? p.flags : p.flags + 'g';
      return new RegExp(p.source, flags);
    });
  }
}

// ── Vague Pronoun Patterns ───────────────────────────────────────────────────

const VAGUE_PRONOUNS: RegExp[] = [
  /\b(?:it|this|that|these|those|they|them)\b/i,
];

const FRUSTRATION_PATTERNS: RegExp[] = [
  /\b(?:still|again|already|yet another|same)\b/i,
  /\b(?:doesn't|does not|isn't|is not|won't|will not|can't|cannot)\s+(?:work|function|run|compile|build)\b/i,
  /\b(?:frustrated|annoyed|confused|stuck|lost)\b/i,
  /!{2,}/,
  /\b(?:wtf|omg|seriously|come on|ugh)\b/i,
];

// ── Main Class ───────────────────────────────────────────────────────────────

/**
 * DeepUnderstandingEngine provides comprehensive natural language understanding
 * for user messages in a conversational AI context. It combines semantic similarity,
 * multi-intent parsing, ambiguity detection, entity extraction, and context-aware
 * classification into a single understanding pipeline.
 *
 * @example
 * ```ts
 * const engine = new DeepUnderstandingEngine();
 * const result = engine.understand("Write a REST API in TypeScript and explain JWT auth");
 * console.log(result.intents);   // [{type:'code_write',...}, {type:'explain',...}]
 * console.log(result.entities);  // [{type:'language', value:'typescript',...}, ...]
 * ```
 */
export class DeepUnderstandingEngine {
  private readonly config: DeepUnderstandingConfig;
  private readonly wordVectors: Map<string, number[]> = new Map();
  private readonly analysisHistory: Array<{
    timestamp: number;
    intentsFound: number;
    entitiesFound: number;
    durationMs: number;
  }> = [];
  private readonly feedbackLog: Array<{
    timestamp: number;
    correct: boolean;
    message: string;
  }> = [];

  private totalUnderstandings = 0;
  private totalIntentsDetected = 0;
  private totalEntitiesExtracted = 0;
  private totalAmbiguitiesDetected = 0;
  private totalSimilarityQueries = 0;
  private understandingTimesMs: number[] = [];
  private feedbackCount = 0;

  constructor(config?: Partial<DeepUnderstandingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeVocabulary();
  }

  // ── Vocabulary Initialization ─────────────────────────────────────────────

  /**
   * Build deterministic word embedding vectors for the seed vocabulary.
   * Each word gets a vector seeded from its hash, ensuring reproducibility.
   */
  private initializeVocabulary(): void {
    const dim = this.config.embeddingDimension;
    for (const word of SEED_VOCABULARY) {
      if (this.wordVectors.size >= this.config.maxVocabularySize) break;
      this.wordVectors.set(word, this.generateWordVector(word, dim));
    }
    // Also add synonyms to the vocabulary
    for (const synonyms of Object.values(SYNONYM_MAP)) {
      for (const syn of synonyms) {
        if (this.wordVectors.size >= this.config.maxVocabularySize) break;
        if (!this.wordVectors.has(syn)) {
          this.wordVectors.set(syn, this.generateWordVector(syn, dim));
        }
      }
    }
  }

  /**
   * Generate a deterministic embedding vector for a word.
   * Uses the word's hash as a seed for a PRNG that fills the vector.
   * Vectors are L2-normalized to unit length.
   */
  private generateWordVector(word: string, dim: number): number[] {
    const hash = hashString(word);
    const rng = seededRandom(hash);
    const vec: number[] = [];
    for (let i = 0; i < dim; i++) {
      vec.push(rng() * 2 - 1); // range [-1, 1]
    }
    // L2 normalize
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vec.length; i++) {
        vec[i] /= norm;
      }
    }
    return vec;
  }

  /**
   * Get or create a vector for a word. Unknown words get a deterministic
   * vector generated from their hash.
   */
  private getWordVector(word: string): number[] {
    const lower = word.toLowerCase();
    const existing = this.wordVectors.get(lower);
    if (existing) return existing;

    // Check if a canonical synonym exists
    const canonical = REVERSE_SYNONYM_MAP.get(lower);
    if (canonical) {
      const canonicalVec = this.wordVectors.get(canonical);
      if (canonicalVec) return canonicalVec;
    }

    // Generate on-the-fly for unknown words
    const vec = this.generateWordVector(lower, this.config.embeddingDimension);
    if (this.wordVectors.size < this.config.maxVocabularySize) {
      this.wordVectors.set(lower, vec);
    }
    return vec;
  }

  /**
   * Compute a sentence vector by averaging the word vectors of its tokens.
   * Returns a zero vector if the text has no recognizable tokens.
   */
  private computeSentenceVector(text: string): number[] {
    const tokens = tokenize(text);
    const dim = this.config.embeddingDimension;
    if (tokens.length === 0) return new Array(dim).fill(0);

    const sum = new Array(dim).fill(0);
    for (const token of tokens) {
      const vec = this.getWordVector(token);
      for (let i = 0; i < dim; i++) {
        sum[i] += vec[i];
      }
    }
    // Average
    for (let i = 0; i < dim; i++) {
      sum[i] /= tokens.length;
    }
    return sum;
  }

  // ── Semantic Similarity ───────────────────────────────────────────────────

  /**
   * Compute cosine similarity between two text strings.
   * Uses averaged word embedding vectors.
   *
   * @param text1 - First text
   * @param text2 - Second text
   * @returns Similarity score in the range [0, 1]
   */
  computeSimilarity(text1: string, text2: string): number {
    this.totalSimilarityQueries++;

    const vec1 = this.computeSentenceVector(text1);
    const vec2 = this.computeSentenceVector(text2);

    return this.cosineSimilarity(vec1, vec2);
  }

  /**
   * Find the most similar phrases to a query from a list of candidates.
   *
   * @param query - The query text to match against
   * @param candidates - Array of candidate texts
   * @param topK - Number of top results to return (default: 5)
   * @returns Array of SimilarityMatch sorted by score descending
   */
  findSimilarPhrases(query: string, candidates: string[], topK: number = 5): SimilarityMatch[] {
    this.totalSimilarityQueries++;

    const queryVec = this.computeSentenceVector(query);
    const scored: SimilarityMatch[] = candidates.map((text, index) => ({
      text,
      score: round2(this.cosineSimilarity(queryVec, this.computeSentenceVector(text))),
      index,
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * Compute cosine similarity between two vectors.
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    if (denom === 0) return 0;

    // Clamp to [0, 1] since we only care about positive similarity
    return clamp(dot / denom, 0, 1);
  }

  // ── Multi-Intent Parsing ──────────────────────────────────────────────────

  /**
   * Parse multiple intents from a single user message.
   * Handles compound messages like "write a function and explain how it works"
   * by splitting on conjunctions and analyzing each segment.
   *
   * @param message - The user message to parse
   * @returns Array of ParsedIntent sorted by confidence descending
   */
  parseIntents(message: string): ParsedIntent[] {
    const segments = this.splitOnConjunctions(message);
    const allIntents: ParsedIntent[] = [];

    for (const segment of segments) {
      const trimmed = segment.trim();
      if (trimmed.length < 2) continue;

      const detected = this.detectIntentsInSegment(trimmed);
      allIntents.push(...detected);
    }

    // If no intents found from segments, try the whole message
    if (allIntents.length === 0) {
      const wholeMessage = this.detectIntentsInSegment(message);
      allIntents.push(...wholeMessage);
    }

    // Deduplicate: keep highest confidence per intent type
    const bestByType = new Map<IntentType, ParsedIntent>();
    for (const intent of allIntents) {
      const existing = bestByType.get(intent.type);
      if (!existing || intent.confidence > existing.confidence) {
        bestByType.set(intent.type, intent);
      }
    }

    const results = Array.from(bestByType.values());
    results.sort((a, b) => b.confidence - a.confidence);

    // Filter by threshold
    return results.filter(i => i.confidence >= this.config.intentConfidenceThreshold);
  }

  /**
   * Split a message on conjunctions that may separate distinct intents.
   * Preserves segments that are meaningful on their own.
   */
  private splitOnConjunctions(message: string): string[] {
    let segments = [message];

    for (const pattern of CONJUNCTION_PATTERNS) {
      const newSegments: string[] = [];
      for (const seg of segments) {
        const parts = seg.split(pattern).map(s => s.trim()).filter(s => s.length > 0);
        newSegments.push(...parts);
      }
      segments = newSegments;
    }

    // Filter out very short segments that are likely artifacts
    return segments.filter(s => s.split(/\s+/).length >= 2 || s.length >= 4);
  }

  /**
   * Detect intents in a single text segment by matching against patterns
   * and keywords.
   */
  private detectIntentsInSegment(segment: string): ParsedIntent[] {
    const intents: ParsedIntent[] = [];
    const lowerSegment = segment.toLowerCase();
    const entities = this.extractEntities(segment);

    for (const intentDef of INTENT_PATTERNS) {
      let confidence = 0;

      // Check regex patterns
      let patternMatches = 0;
      for (const pattern of intentDef.patterns) {
        if (pattern.test(segment)) {
          patternMatches++;
        }
      }
      if (patternMatches > 0) {
        confidence += 0.4 + (patternMatches - 1) * 0.15;
      }

      // Check keywords
      let keywordMatches = 0;
      for (const keyword of intentDef.keywords) {
        if (lowerSegment.includes(keyword)) {
          keywordMatches++;
        }
      }
      if (keywordMatches > 0) {
        confidence += 0.2 + (keywordMatches - 1) * 0.05;
      }

      // Apply weight
      confidence *= intentDef.weight;

      // Clamp
      confidence = round2(clamp(confidence, 0, 1));

      if (confidence > 0) {
        intents.push({
          type: intentDef.type,
          confidence,
          text: segment,
          entities,
        });
      }
    }

    // Sort by confidence
    intents.sort((a, b) => b.confidence - a.confidence);
    return intents;
  }

  // ── Ambiguity Detection ───────────────────────────────────────────────────

  /**
   * Detect ambiguity in a user message. Checks for vague pronouns,
   * missing context, and multiple possible interpretations.
   * Uses conversation history to attempt reference resolution.
   *
   * @param message - The user message to analyze
   * @param context - Optional conversation history for reference resolution
   * @returns AmbiguityResult with score, reasons, and clarification questions
   */
  detectAmbiguity(message: string, context?: ConversationTurn[]): AmbiguityResult {
    const reasons: string[] = [];
    const clarificationQuestions: string[] = [];
    const resolvedReferences: ResolvedReference[] = [];
    let score = 0;

    // Check for vague pronouns
    const pronounHits = this.findVaguePronouns(message, context);
    for (const hit of pronounHits) {
      if (hit.resolved) {
        resolvedReferences.push(hit.resolved);
      } else {
        score += 0.2;
        reasons.push(`Vague pronoun "${hit.pronoun}" without clear antecedent`);
        clarificationQuestions.push(`What does "${hit.pronoun}" refer to?`);
      }
    }

    // Check for very short / underspecified messages
    const wordCount = tokenize(message).length;
    if (wordCount <= 2) {
      score += 0.3;
      reasons.push('Message is very short and may lack sufficient context');
      clarificationQuestions.push('Could you provide more details about what you need?');
    } else if (wordCount <= 4) {
      score += 0.1;
      reasons.push('Message is brief and may be underspecified');
    }

    // Check for multiple possible interpretations (intent ambiguity)
    const intents = this.parseIntents(message);
    const highConfidenceIntents = intents.filter(i => i.confidence >= 0.4);
    if (highConfidenceIntents.length >= 3) {
      score += 0.15;
      reasons.push('Message could match multiple intent categories');
    }

    // Check for missing verb or action
    const hasAction = /\b(?:write|create|build|explain|find|fix|review|help|compare|analyze|refactor|debug|plan|show|list|get|add|remove|change|update|delete|run|test|deploy|install)\b/i.test(message);
    if (!hasAction && wordCount > 2) {
      score += 0.15;
      reasons.push('No clear action or request detected');
      clarificationQuestions.push('What would you like me to do with this?');
    }

    // Check for ambiguous scope
    const scopeAmbiguity = /\b(?:everything|all|stuff|things|some|any|whatever)\b/i.test(message);
    if (scopeAmbiguity) {
      score += 0.1;
      reasons.push('Ambiguous scope — unclear what specifically to target');
      clarificationQuestions.push('Could you be more specific about what you\'d like to focus on?');
    }

    // Check for contradictory requirements
    const hasContradiction = this.detectContradiction(message);
    if (hasContradiction) {
      score += 0.2;
      reasons.push('Potentially contradictory requirements detected');
      clarificationQuestions.push('Some of these requirements may conflict — could you clarify the priority?');
    }

    score = round2(clamp(score, 0, 1));

    // Only include clarification questions above threshold
    const finalQuestions = score >= this.config.ambiguityThreshold
      ? clarificationQuestions
      : [];

    if (score >= this.config.ambiguityThreshold) {
      this.totalAmbiguitiesDetected++;
    }

    return {
      score,
      reasons,
      clarificationQuestions: finalQuestions,
      resolvedReferences,
    };
  }

  /**
   * Find vague pronouns in a message and attempt to resolve them from context.
   */
  private findVaguePronouns(
    message: string,
    context?: ConversationTurn[],
  ): Array<{ pronoun: string; resolved: ResolvedReference | null }> {
    const results: Array<{ pronoun: string; resolved: ResolvedReference | null }> = [];
    const words = message.toLowerCase().split(/\s+/);

    for (const pattern of VAGUE_PRONOUNS) {
      for (const word of words) {
        if (!pattern.test(word)) continue;
        const pronoun = word;

        // Try to resolve from context
        const resolved = context ? this.resolveReference(pronoun, context) : null;
        results.push({ pronoun, resolved });
      }
    }

    return results;
  }

  /**
   * Attempt to resolve a pronoun by searching recent conversation turns
   * for likely antecedents (nouns, entities).
   */
  private resolveReference(
    pronoun: string,
    context: ConversationTurn[],
  ): ResolvedReference | null {
    if (context.length === 0) return null;

    // Search backwards through context for entities
    const recentTurns = context.slice(-this.config.maxContextTurns);
    for (let i = recentTurns.length - 1; i >= 0; i--) {
      const turn = recentTurns[i];
      const entities = this.extractEntities(turn.content);

      if (entities.length > 0) {
        // Pick the most prominent entity (highest confidence, or latest)
        const best = entities.reduce((a, b) => a.confidence >= b.confidence ? a : b);
        const distance = recentTurns.length - 1 - i;
        const confidenceDecay = Math.max(0.3, 1 - distance * 0.15);

        return {
          pronoun,
          resolvedTo: best.value,
          confidence: round2(best.confidence * confidenceDecay),
        };
      }
    }

    return null;
  }

  /**
   * Detect potential contradictions in a message.
   * Looks for opposing qualifier pairs.
   */
  private detectContradiction(message: string): boolean {
    const lower = message.toLowerCase();
    const opposites: [string, string][] = [
      ['simple', 'complex'],
      ['fast', 'thorough'],
      ['minimal', 'comprehensive'],
      ['small', 'large'],
      ['quick', 'detailed'],
      ['lightweight', 'feature-rich'],
    ];

    for (const [a, b] of opposites) {
      if (lower.includes(a) && lower.includes(b)) return true;
    }
    return false;
  }

  // ── Enhanced Entity Extraction ────────────────────────────────────────────

  /**
   * Extract structured entities from a user message.
   * Recognizes programming languages, frameworks, patterns, data structures,
   * algorithms, libraries, tools, file types, numbers, comparisons,
   * concepts, and constraints.
   *
   * @param message - The text to extract entities from
   * @returns Array of ExtractedEntity sorted by position
   */
  extractEntities(message: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const lower = message.toLowerCase();

    for (const dict of ENTITY_DICTIONARIES) {
      // Match against dictionary values
      for (const value of dict.values) {
        const idx = lower.indexOf(value.toLowerCase());
        if (idx !== -1) {
          // Verify word boundary: character before and after the match must be non-word (or string edge)
          const atStart = idx === 0;
          const atEnd = idx + value.length === lower.length;
          const boundaryBefore = atStart || /\W/.test(lower[idx - 1]);
          const boundaryAfter = atEnd || /\W/.test(lower[idx + value.length]);
          if (boundaryBefore && boundaryAfter) {
            entities.push({
              type: dict.type,
              value: message.substring(idx, idx + value.length),
              confidence: 0.9,
              position: idx,
            });
          }
        }
      }

      // Match against pre-compiled global patterns
      if (dict.globalPatterns) {
        for (const regex of dict.globalPatterns) {
          regex.lastIndex = 0;
          let match: RegExpExecArray | null;
          while ((match = regex.exec(message)) !== null) {
            const matchValue = match[0];
            // Avoid duplicating dictionary matches
            const isDuplicate = entities.some(
              e => e.type === dict.type && e.position === match!.index,
            );
            if (!isDuplicate) {
              entities.push({
                type: dict.type,
                value: matchValue,
                confidence: 0.75,
                position: match.index,
              });
            }
          }
        }
      }
    }

    // Extract constraints from prepositional phrases
    const constraintEntities = this.extractConstraints(message);
    entities.push(...constraintEntities);

    // Sort by position
    entities.sort((a, b) => a.position - b.position);

    // Deduplicate overlapping entities (keep higher confidence)
    return this.deduplicateEntities(entities);
  }

  /**
   * Extract constraint expressions like "using JWT", "in TypeScript",
   * "with authentication", "for production".
   */
  private extractConstraints(message: string): ExtractedEntity[] {
    const constraints: ExtractedEntity[] = [];
    const constraintPatterns: RegExp[] = [
      /\b(?:using|with|via|through)\s+([a-zA-Z][a-zA-Z0-9 ._-]{1,30})/gi,
      /\bin\s+(typescript|javascript|python|java|go|rust|ruby|php|c\+\+|c#|swift|kotlin)\b/gi,
      /\bfor\s+(production|development|testing|staging|mobile|web|desktop|server|client)\b/gi,
      /\bwithout\s+([a-zA-Z][a-zA-Z0-9 ]{1,20})/gi,
    ];

    for (const pattern of constraintPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(message)) !== null) {
        if (match[1]) {
          constraints.push({
            type: 'constraint',
            value: match[1].trim(),
            confidence: 0.8,
            position: match.index,
          });
        }
      }
    }

    return constraints;
  }

  /**
   * Remove duplicate entities. When entities overlap in position,
   * keep the one with higher confidence or longer match.
   */
  private deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
    const result: ExtractedEntity[] = [];
    const seen = new Set<string>();

    for (const entity of entities) {
      const key = `${entity.type}:${entity.value.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(entity);
      }
    }

    return result;
  }

  /**
   * Extract relationships between entities.
   * For example, "REST API with authentication" → { source:'REST API', relation:'with', target:'authentication' }
   */
  extractRelations(message: string, entities: ExtractedEntity[]): EntityRelation[] {
    const relations: EntityRelation[] = [];
    const relationPatterns: Array<{ regex: RegExp; relation: string }> = [
      { regex: /(\w[\w ]*?)\s+(?:with|using|via)\s+(\w[\w ]*)/gi, relation: 'has' },
      { regex: /(\w[\w ]*?)\s+(?:for|targeting)\s+(\w[\w ]*)/gi, relation: 'targets' },
      { regex: /(\w[\w ]*?)\s+(?:in|written in|built with)\s+(\w[\w ]*)/gi, relation: 'implemented_in' },
      { regex: /(\w[\w ]*?)\s+(?:like|similar to|based on)\s+(\w[\w ]*)/gi, relation: 'resembles' },
      { regex: /(\w[\w ]*?)\s+(?:vs\.?|versus|compared to|or)\s+(\w[\w ]*)/gi, relation: 'compared_with' },
      { regex: /(\w[\w ]*?)\s+(?:and|&)\s+(\w[\w ]*)/gi, relation: 'combined_with' },
    ];

    for (const { regex, relation } of relationPatterns) {
      let match: RegExpExecArray | null;
      while ((match = regex.exec(message)) !== null) {
        const source = match[1].trim();
        const target = match[2].trim();

        // Only include relations where at least one side is a known entity
        const sourceIsEntity = entities.some(
          e => e.value.toLowerCase() === source.toLowerCase(),
        );
        const targetIsEntity = entities.some(
          e => e.value.toLowerCase() === target.toLowerCase(),
        );

        if (sourceIsEntity || targetIsEntity) {
          relations.push({ source, relation, target });
        }
      }
    }

    return relations;
  }

  // ── Context-Aware Classification ──────────────────────────────────────────

  /**
   * Classify a message using conversation history for disambiguation.
   * Resolves references, detects topic continuity, and identifies escalation.
   *
   * @param message - The current user message
   * @param history - Previous conversation turns
   * @returns ContextualClassification with primary intent and context signals
   */
  classifyWithContext(
    message: string,
    history: ConversationTurn[],
  ): ContextualClassification {
    const intents = this.parseIntents(message);
    const primaryIntent: IntentType = intents.length > 0 ? intents[0].type : 'question';
    const primaryConfidence = intents.length > 0 ? intents[0].confidence : 0.2;

    // Compute topic continuity
    const topicContinuity = this.computeTopicContinuity(message, history);

    // Detect escalation
    const isEscalation = this.detectEscalation(message, history);

    // Collect referenced entities from context
    const referencedEntities = this.resolveReferencedEntities(message, history);

    // Boost confidence if context aligns
    let adjustedConfidence = primaryConfidence;
    if (topicContinuity > 0.7) {
      adjustedConfidence = clamp(adjustedConfidence + 0.1, 0, 1);
    }
    if (referencedEntities.length > 0) {
      adjustedConfidence = clamp(adjustedConfidence + 0.05, 0, 1);
    }

    return {
      primaryIntent,
      confidence: round2(adjustedConfidence),
      topicContinuity: round2(topicContinuity),
      isEscalation,
      referencedEntities,
    };
  }

  /**
   * Compute how much the current message continues the same topic
   * as the recent conversation. Uses semantic similarity.
   */
  private computeTopicContinuity(
    message: string,
    history: ConversationTurn[],
  ): number {
    if (!this.config.enableSimilarity || history.length === 0) return 0;

    const recentTurns = history.slice(-Math.min(history.length, 3));
    const recentText = recentTurns.map(t => t.content).join(' ');
    const similarity = this.computeSimilarity(message, recentText);

    return clamp(similarity, 0, 1);
  }

  /**
   * Detect if the user is showing signs of frustration or escalation,
   * such as repeating the same request or using frustrated language.
   */
  private detectEscalation(
    message: string,
    history: ConversationTurn[],
  ): boolean {
    // Check frustration patterns in current message
    const frustrationScore = FRUSTRATION_PATTERNS.reduce(
      (score, pattern) => score + (pattern.test(message) ? 1 : 0),
      0,
    );
    if (frustrationScore >= 2) return true;

    // Check if user is repeating the same request
    if (history.length >= 2) {
      const userTurns = history.filter(t => t.role === 'user');
      if (userTurns.length >= 2) {
        const lastUserMsg = userTurns[userTurns.length - 1]?.content ?? '';
        const similarity = this.computeSimilarity(message, lastUserMsg);
        if (similarity > 0.85) return true;
      }
    }

    return false;
  }

  /**
   * Resolve entity references from current message using conversation history.
   * Returns a list of entity values referenced (directly or via pronouns).
   */
  private resolveReferencedEntities(
    message: string,
    history: ConversationTurn[],
  ): string[] {
    const referenced: string[] = [];

    // Direct entity mentions in current message
    const currentEntities = this.extractEntities(message);
    for (const e of currentEntities) {
      if (!referenced.includes(e.value)) {
        referenced.push(e.value);
      }
    }

    // Resolve pronouns
    const pronounHits = this.findVaguePronouns(message, history);
    for (const hit of pronounHits) {
      if (hit.resolved && !referenced.includes(hit.resolved.resolvedTo)) {
        referenced.push(hit.resolved.resolvedTo);
      }
    }

    return referenced;
  }

  // ── Understanding Pipeline ────────────────────────────────────────────────

  /**
   * Main entry point: comprehensively understand a user message.
   * Orchestrates entity extraction, multi-intent parsing, ambiguity detection,
   * and context-aware classification into a single UnderstandingResult.
   *
   * @param message - The user message to understand
   * @param context - Optional conversation history for context
   * @returns Complete UnderstandingResult with all analysis dimensions
   *
   * @example
   * ```ts
   * const result = engine.understand(
   *   "Write a sorting function in TypeScript and explain the time complexity",
   *   conversationHistory
   * );
   * // result.intents → [{type:'code_write',...}, {type:'explain',...}]
   * // result.entities → [{type:'language', value:'TypeScript',...}, ...]
   * // result.confidence → 0.85
   * ```
   */
  understand(message: string, context?: ConversationTurn[]): UnderstandingResult {
    const startTime = Date.now();

    // Step 1: Extract entities
    const entities = this.extractEntities(message);

    // Step 2: Extract relations
    const relations = this.extractRelations(message, entities);

    // Step 3: Parse intents
    const intents = this.parseIntents(message);

    // Step 4: Detect ambiguity
    const ambiguity = this.config.enableAmbiguityDetection
      ? this.detectAmbiguity(message, context)
      : { score: 0, reasons: [], clarificationQuestions: [], resolvedReferences: [] };

    // Step 5: Context-aware classification
    let contextClassification: ContextualClassification | null = null;
    if (this.config.enableContextClassification && context && context.length > 0) {
      contextClassification = this.classifyWithContext(message, context);
    }

    // Step 6: Compute overall confidence
    const intentConfidence = intents.length > 0
      ? intents.reduce((sum, i) => sum + i.confidence, 0) / intents.length
      : 0.1;
    const entityConfidence = entities.length > 0 ? Math.min(0.3 + entities.length * 0.1, 1) : 0.2;
    const ambiguityPenalty = ambiguity.score * 0.3;
    const contextBonus = contextClassification ? contextClassification.topicContinuity * 0.1 : 0;

    const overallConfidence = round2(
      clamp(
        intentConfidence * 0.5 + entityConfidence * 0.3 - ambiguityPenalty + contextBonus,
        0,
        1,
      ),
    );

    const durationMs = Date.now() - startTime;

    // Update stats
    this.totalUnderstandings++;
    this.totalIntentsDetected += intents.length;
    this.totalEntitiesExtracted += entities.length;
    this.understandingTimesMs.push(durationMs);

    // Record in analysis history
    this.analysisHistory.push({
      timestamp: Date.now(),
      intentsFound: intents.length,
      entitiesFound: entities.length,
      durationMs,
    });

    return {
      intents,
      entities,
      relations,
      ambiguity,
      contextClassification,
      confidence: overallConfidence,
      durationMs,
    };
  }

  // ── Feedback & Learning ───────────────────────────────────────────────────

  /**
   * Provide feedback on a previous understanding result.
   * Used to track accuracy and improve over time.
   *
   * @param correct - Whether the understanding was correct
   * @param message - The original message for reference
   */
  feedback(correct: boolean, message: string = ''): void {
    this.feedbackCount++;
    this.feedbackLog.push({
      timestamp: Date.now(),
      correct,
      message,
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  /**
   * Get current performance statistics.
   *
   * @returns Readonly snapshot of DeepUnderstandingStats
   */
  getStats(): Readonly<DeepUnderstandingStats> {
    const avgUnderstandingTime = this.understandingTimesMs.length > 0
      ? this.understandingTimesMs.reduce((s, v) => s + v, 0) / this.understandingTimesMs.length
      : 0;

    return {
      totalUnderstandings: this.totalUnderstandings,
      totalIntentsDetected: this.totalIntentsDetected,
      totalEntitiesExtracted: this.totalEntitiesExtracted,
      totalAmbiguitiesDetected: this.totalAmbiguitiesDetected,
      totalSimilarityQueries: this.totalSimilarityQueries,
      avgUnderstandingTime: round2(avgUnderstandingTime),
      feedbackCount: this.feedbackCount,
    };
  }

  // ── Serialization ─────────────────────────────────────────────────────────

  /**
   * Serialize engine state to a JSON string for persistence.
   *
   * @returns JSON string representation of engine state
   */
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      totalUnderstandings: this.totalUnderstandings,
      totalIntentsDetected: this.totalIntentsDetected,
      totalEntitiesExtracted: this.totalEntitiesExtracted,
      totalAmbiguitiesDetected: this.totalAmbiguitiesDetected,
      totalSimilarityQueries: this.totalSimilarityQueries,
      understandingTimesMs: this.understandingTimesMs,
      feedbackCount: this.feedbackCount,
      feedbackLog: this.feedbackLog,
      analysisHistory: this.analysisHistory,
    });
  }

  /**
   * Deserialize engine state from a JSON string.
   * Restores all statistics and feedback history.
   *
   * @param json - JSON string from a previous serialize() call
   * @returns A new DeepUnderstandingEngine instance with restored state
   */
  static deserialize(json: string): DeepUnderstandingEngine {
    const data = JSON.parse(json) as {
      config: DeepUnderstandingConfig;
      totalUnderstandings: number;
      totalIntentsDetected: number;
      totalEntitiesExtracted: number;
      totalAmbiguitiesDetected: number;
      totalSimilarityQueries: number;
      understandingTimesMs: number[];
      feedbackCount: number;
      feedbackLog: Array<{ timestamp: number; correct: boolean; message: string }>;
      analysisHistory: Array<{ timestamp: number; intentsFound: number; entitiesFound: number; durationMs: number }>;
    };

    const instance = new DeepUnderstandingEngine(data.config);
    instance.totalUnderstandings = data.totalUnderstandings;
    instance.totalIntentsDetected = data.totalIntentsDetected;
    instance.totalEntitiesExtracted = data.totalEntitiesExtracted;
    instance.totalAmbiguitiesDetected = data.totalAmbiguitiesDetected;
    instance.totalSimilarityQueries = data.totalSimilarityQueries;
    instance.understandingTimesMs = data.understandingTimesMs;
    instance.feedbackCount = data.feedbackCount;

    for (const entry of data.feedbackLog) {
      instance.feedbackLog.push(entry);
    }
    for (const entry of data.analysisHistory) {
      instance.analysisHistory.push(entry);
    }

    return instance;
  }
}
